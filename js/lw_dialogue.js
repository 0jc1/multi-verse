/* APEVERSE 2.3 - lw_dialogue.js : branching conversations (offline, data-driven, no AI service needed).
   A conversation is a small graph of nodes.  Each node says something (text or c => text) and offers choices; a choice can
   lead to another node, change affinity, set remembered flags, start / advance a mission, pay, give items, or end the talk.
   The transcript of the whole exchange stays on screen, so a talk reads like a conversation rather than a one-shot menu.
     AV.convo.open(who, tree, start?)        tree = { name, title?, nodes: { id: { say, opts: [ { t, go, if, do, end } ] } } }
     AV.convo.trees[who] = tree | (c => tree)  -> characters with authored talks (used by missions, chips and new NPCs)
   Context c: { who, rel (LW.rel), S, t(en,es), flag(k) / set(k,v), aff(d), met, part (time of day), w (world id), mis (AV.mis) }
   Greetings vary by visits, time of day and what you did together (rel flags).  Keys 1-9 pick a choice. */
'use strict';
(function (AV) {
const tr = AV.tr, LW = AV.LW, esc = LW.esc, say = LW.say;
const CV = AV.convo = { trees: {}, cur: null, stats: { opened: 0, choices: 0 } };
function ctx(who) { const rel = LW.rel(who), S = AV.S;
  return { who, rel, S, t: (en, es) => tr(en, es == null ? en : es), flag: k => rel.f[k], set: (k, v) => { rel.f[k] = v == null ? 1 : v }, aff: d => LW.aff(who, d), met: rel.met,
    part: LW.part(), w: AV.W && AV.W.id, mis: AV.mis, name: AV.S.name || tr('friend', 'amigo') } }
const txt = (v, c) => { const r = typeof v === 'function' ? v(c) : v; return Array.isArray(r) ? (typeof r[0] === 'string' && (r.length === 2 || r.length === 1) && !Array.isArray(r[0]) ? say(r) : say(r[Math.random() * r.length | 0])) : String(r == null ? '' : r) };
CV.treeFor = who => { const t = CV.trees[who]; return typeof t === 'function' ? t(ctx(who)) : t };
CV.open = function (who, tree, start) {
  tree = tree || CV.treeFor(who); if (!tree || !tree.nodes) return false; const c = ctx(who); if (!CV.cur || CV.cur.who !== who) { c.rel.met++; c.rel.last = AV.S.day }
  CV.cur = { who, tree, log: [], c }; CV.stats.opened++; AV.chat && AV.chat.open && AV.closeChat && AV.closeChat();
  const n = AV.npc && AV.npc.find(who); if (n && AV.npc.face) { const v = new THREE.Vector3(); AV.focus = () => CV.cur && CV.cur.who === who ? AV.npc.face(n, v) : null }
  go(start || tree.start || 'start'); return true };
CV.close = function () { if (!CV.cur) return; const cur = CV.cur; CV.cur = null; AV.focus = null; AV.save(); if (document.getElementById('cmp').dataset.lw === '1') AV.closePanel('cmp'); cur.tree.onEnd && cur.tree.onEnd(cur.c) };
function go(id) {
  const cur = CV.cur; if (!cur) return; if (!id) return CV.close(); const node = cur.tree.nodes[id]; if (!node) { console.warn('convo: no node', id); return CV.close() }
  const c = cur.c; if (node.enter) node.enter(c); const line = txt(node.say, c).replace(/%n/g, c.name); if (line) cur.log.push({ who: 'npc', t: line });
  const opts = (typeof node.opts === 'function' ? node.opts(c) : node.opts || []).filter(o => !o.if || o.if(c));
  if (!opts.length) opts.push({ t: LW.L('[Leave]', '[Salir]'), end: true });
  cur.opts = opts; cur.node = id; render() }
function render() {
  const cur = CV.cur, tree = cur.tree, nm = say(tree.name || cur.who), ti = tree.title ? ' · <small>' + esc(say(tree.title)) + '</small>' : '', rel = cur.c.rel;
  const heart = rel.aff >= 6 ? ' 💖' : rel.aff >= 3 ? ' 🙂' : rel.aff <= -3 ? ' 😒' : '';
  const html = '<div class="lwConvo"><h3 style="margin:0 0 6px">' + esc(nm) + heart + ti + '</h3><div class="log" style="max-height:46vh;overflow:auto">' +
    cur.log.slice(-10).map(l => '<div class="line ' + (l.who === 'me' ? 'me' : '') + '">' + (l.who === 'me' ? '' : '<b>' + esc(nm) + ':</b> ') + esc(l.t) + '</div>').join('') +
    '</div><div class="opts">' + cur.opts.map((o, i) => '<button data-o="' + i + '">' + (i + 1) + '. ' + esc(txt(o.t, cur.c)) + '</button>').join('') + '</div></div>';
  const p = AV.panel('cmp', html, CV.close); p.dataset.lw = '1'; const lg = p.querySelector('.log'); lg.scrollTop = 1e5;
  p.querySelectorAll('[data-o]').forEach(b => b.onclick = () => CV.choose(+b.dataset.o)) }
CV.choose = function (i) { const cur = CV.cur; if (!cur) return; const o = cur.opts[i]; if (!o) return; CV.stats.choices++; const c = cur.c;
  const said = txt(o.t, c); if (!/^\[/.test(said)) cur.log.push({ who: 'me', t: said });
  let nx = o.go; if (o.do) { const r = o.do(c); if (typeof r === 'string') nx = r } if (o.aff) c.aff(o.aff); if (o.set) c.set(o.set);
  if (o.end || !nx) return CV.close(); go(nx) };
CV.options = () => CV.cur ? CV.cur.opts.map(o => txt(o.t, CV.cur.c)) : [];
CV.pick = re => { if (!CV.cur) return false; const i = CV.options().findIndex(s => re.test(s)); if (i < 0) return false; CV.choose(i); return true };   /* tests + keyboard */
CV.lastLine = () => CV.cur && CV.cur.log.length ? CV.cur.log[CV.cur.log.length - 1].t : '';
addEventListener('keydown', e => { if (!CV.cur || !/^Digit[1-9]$/.test(e.code)) return; const el = document.activeElement; if (el && /INPUT|TEXTAREA/.test(el.tagName)) return; CV.choose(+e.code.slice(5) - 1); e.preventDefault() }, true);
/* when the panel is closed some other way (Esc), forget the conversation */
const cp0 = AV.closePanel; AV.closePanel = function (id) { const p = document.getElementById(id); if (id === 'cmp' && p && p.dataset.lw === '1') { p.dataset.lw = ''; if (CV.cur) { const cur = CV.cur; CV.cur = null; AV.focus = null; cur.tree.onEnd && cur.tree.onEnd(cur.c) } } return cp0.apply(this, arguments) };
const pn0 = AV.panel; AV.panel = function (id) { const p = document.getElementById(id); if (id === 'cmp' && p) p.dataset.lw = ''; return pn0.apply(this, arguments) };

/* ---------- greeting helper for authored characters: varies by visits, time and memory ---------- */
CV.greet = function (c, o) {   // o: { first, again[], morning, evening, night, flags: { flag: line } }
  for (const k in (o.flags || {})) if (c.flag(k) && !c.flag(k + '_said')) { c.set(k + '_said'); return say(o.flags[k]) }
  if (c.met <= 1 && o.first) return say(o.first);
  const tod = o[c.part]; if (tod && Math.random() < .5) return say(tod);
  const a = o.again || [o.first]; return say(a[(c.met + (AV.S.day || 0)) % a.length]) };

/* ---------- NPCs with authored talks: an extra chip in the classic chat ("💬 Talk") ---------- */
const oc0 = AV.openChat; AV.openChat = function (who) { oc0.apply(this, arguments); if (!(AV.chat && AV.chat.open && AV.chat.who === who)) return; LW.rel(who).met++; LW.rel(who).last = AV.S.day;
  const chips = document.getElementById('chips'); if (!chips) return; let row = document.getElementById('lwChips'); if (!row) { row = document.createElement('div'); row.id = 'lwChips'; row.className = 'lwBtns'; chips.parentNode.insertBefore(row, chips.nextSibling) }
  row.innerHTML = ''; const add = (label, fn) => { const b = document.createElement('button'); b.className = 'qc'; b.textContent = label; b.onclick = fn; row.appendChild(b) };
  if (AV.mis) for (const m of AV.mis.offersFor(who)) add('📜 ' + say(m.title), () => { AV.closeChat(); AV.mis.offer(m.id) });
  if (AV.mis) for (const a of AV.mis.talkStagesFor(who)) add('◆ ' + say(a.def.title), () => { AV.closeChat(); AV.mis.talkStage(a.id) });
  if (CV.trees[who]) add('💬 ' + tr('Talk properly', 'Charlar de verdad'), () => { AV.closeChat(); CV.open(who) }) };
})(window.AV);
