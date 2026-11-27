/* APEVERSE 2.3 - lw_missions.js : the mission engine, journal, markers and objective HUD.
   AV.mis.def(id, {
     w: world id (where it is offered),  cat: 'story'|'side'|'favor'|'job'|'business'|'delivery'|'music'|'art'|'photo'|'transport'|
        'festival'|'sport'|'explore'|'friend'|'crime'|'random',   title: [en, es],   blurb: [en, es] (what it is about),
     giver: npc id  (or { x, z, name } for a board / place),   req: S => bool  (prerequisites)  or  after: ['mission ids'],
     repeat: true  (repeatable; once per in-game day),   stages: [ ...stage ],   reward: { money, items: { id: n }, rep },
     offer: { say, yes, no }  (optional custom offer lines),  onDone(S, mv), next: ['follow-up ids']  (announced when done) })
   Stage kinds (each has obj: [en, es] = the objective text shown on screen + journal):
     { k: 'talk', npc, nodes, start }   a branching conversation (AV.convo); a choice with  adv: true  completes the stage,
                                         fail: true fails the mission; choices may write mission variables via c.mv
     { k: 'go', x, z, r, w }            reach a place            { k: 'have', item, n }   carry n of an item
     { k: 'use', item }                 consume / use one        { k: 'ev', ev, n }        an event happens n times (AV.mis.emit)
     { k: 'test', fn: (S, mv) => bool } any condition            { k: 'travel', w }        be in a world
   Optional per stage: at: [x, z] | npc id (navigation target), w (world), time: seconds (fail when over), onStart(mv), if: mv => bool (skip when false).
   Failing or abandoning never blocks you: the mission goes back to "available" and can be retried.
   Save: S.mis = { a: { id: { s, mv, t0, base } }, d: { id: count }, last: { id: day }, f: { id: n }, track: id }.  */
'use strict';
(function (AV) {
const tr = AV.tr, LW = AV.LW, say = LW.say, esc = LW.esc, L = LW.L;
const M = AV.mis = { defs: {}, stats: { started: 0, done: 0, failed: 0, events: {} } };
const CAT = { story: '⭐', side: '📜', favor: '🤝', job: '💼', business: '🏪', delivery: '📦', music: '🎸', art: '🎨', photo: '📷', transport: '🚕', festival: '🎉', sport: '🏆', explore: '🧭', friend: '💛', crime: '🎭', random: '🎲', property: '🏠' };
M.CAT = CAT;
const st = () => { const S = AV.S; S.mis = S.mis || {}; const m = S.mis; m.a = m.a || {}; m.d = m.d || {}; m.last = m.last || {}; m.f = m.f || {}; return m };
M.st = st;
M.def = (id, d) => { d.id = id; d.stages = d.stages || []; M.defs[id] = d; return d };
const bagN = id => AV.bag ? AV.bag.count(id) : ((AV.S.items || {})[id] || 0);
const consDone = id => (AV.S.cons && AV.S.cons.done && AV.S.cons.done[id]) || 0;

/* ---------- state ---------- */
M.active = id => !!st().a[id];
M.done = id => st().d[id] || 0;
M.available = function (id) { const d = M.defs[id], m = st(); if (!d || m.a[id]) return false; if (!d.repeat && m.d[id]) return false; if (d.repeat && m.last[id] === AV.S.day) return false;
  if (d.after && !d.after.every(x => m.d[x])) return false; if (d.req && !d.req(AV.S)) return false; return true };
M.list = w => Object.values(M.defs).filter(d => !w || d.w === w);
M.offersFor = who => M.list(AV.W && AV.W.id).filter(d => d.giver === who && M.available(d.id));
M.cur = id => { const a = st().a[id], d = M.defs[id]; return a && d ? d.stages[a.s] : null };
M.talkStagesFor = who => Object.keys(st().a).map(id => ({ id, def: M.defs[id], s: M.cur(id) })).filter(x => x.def && x.s && x.s.k === 'talk' && x.s.npc === who);
M.objective = id => { const s = M.cur(id); return s ? say(s.obj || L('Continue', 'Continúa')) : '' };

/* ---------- lifecycle ---------- */
M.start = function (id, quiet) { const d = M.defs[id]; if (!d || !M.available(id)) return false; const m = st(); m.a[id] = { s: -1, mv: {}, t0: AV.now() }; M.stats.started++; if (!m.track || !m.a[m.track]) m.track = id;
  AV.audio && AV.audio.blip && AV.audio.blip(740, .2, 'triangle', .15); advance(id, quiet); AV.save(); return true };
function enterStage(id) { const m = st(), a = m.a[id], d = M.defs[id]; let s = d.stages[a.s];
  while (s && s.if && !s.if(a.mv)) { a.s++; s = d.stages[a.s] }
  if (!s) return finish(id);
  a.ts = AV.now(); a.base = { n: 0, cons: s.item ? consDone(s.item) : 0, have: s.item ? bagN(s.item) : 0 }; if (s.onStart) s.onStart(a.mv, AV.S);
  return true }
function advance(id, quiet) { const a = st().a[id]; if (!a) return; a.s++; if (!enterStage(id)) return; if (!quiet) AV.toast('◆ ' + say(M.defs[id].title) + ' — ' + M.objective(id)); M.stats.adv = (M.stats.adv || 0) + 1; AV.save(); hudSoon() }
M.advance = advance;
function finish(id) { const m = st(), d = M.defs[id], a = m.a[id], r = d.reward || {}; delete m.a[id]; m.d[id] = (m.d[id] || 0) + 1; m.last[id] = AV.S.day; M.stats.done++;
  const bits = []; const money = typeof r.money === 'function' ? r.money(a.mv) : r.money; if (money) { AV.txn(money, 'Mission: ' + say(d.title)); bits.push('+' + money + ' ¢') }
  for (const k in (r.items || {})) { AV.bag ? AV.bag.add(k, r.items[k], true) : (AV.S.items[k] = (AV.S.items[k] || 0) + r.items[k]); const it = AV.ITEMS && AV.ITEMS[k]; bits.push((it ? it.ic + ' ' + say(it.n) : k) + ' ×' + r.items[k]) }
  if (r.rep) { LW.rep(d.w, r.rep); bits.push('+' + r.rep + ' ' + tr('rep', 'rep')) }
  if (d.onDone) try { d.onDone(AV.S, a.mv) } catch (e) { console.warn(e) }
  const nx = (d.next || []).filter(x => M.defs[x]).map(x => say(M.defs[x].title));
  AV.toast('✔ ' + tr('Mission complete: ', 'Misión completada: ') + say(d.title) + (bits.length ? ' · ' + bits.join(' · ') : '') + (nx.length ? ' · ' + tr('New: ', 'Nueva: ') + nx.join(', ') : ''));
  AV.audio && AV.audio.blip && AV.audio.blip(988, .3, 'triangle', .2);
  if (m.track === id) m.track = Object.keys(m.a)[0] || null; if (AV.minimap && M._nav === id) { AV.minimap.clearDest(); M._nav = null } AV.save(); AV.hud && AV.hud(); hudSoon(); return false }
M.fail = function (id, why) { const m = st(); if (!m.a[id]) return; delete m.a[id]; m.f[id] = (m.f[id] || 0) + 1; M.stats.failed++; if (m.track === id) m.track = Object.keys(m.a)[0] || null;
  AV.toast('✖ ' + say(M.defs[id].title) + ': ' + (why ? say(why) + ' ' : '') + tr('You can try again any time (journal: G).', 'Puedes reintentarlo cuando quieras (diario: G).')); AV.save(); hudSoon() };
M.abandon = id => { const m = st(); if (!m.a[id]) return; delete m.a[id]; if (m.track === id) m.track = Object.keys(m.a)[0] || null; AV.toast(tr('Mission dropped. It is back on the list.', 'Misión abandonada. Vuelve a estar disponible.')); AV.save(); hudSoon() };
M.track = id => { st().track = id; hudSoon() };
/* events from the game world: AV.mis.emit('pool_win'), AV.mis.emit('delivered', 'chat') */
M.emit = function (ev, data) { M.stats.events[ev] = (M.stats.events[ev] || 0) + 1; const m = st();
  for (const id in m.a) { const s = M.cur(id), a = m.a[id]; if (s && s.k === 'ev' && s.ev === ev && (!s.data || s.data === data)) { a.base.n++; if (a.base.n >= (s.n || 1)) advance(id) } } };

/* ---------- stage checks (4x a second) ---------- */
function where(s, a) { if (!s) return null; const w = AV.W; if (typeof s.at === 'function') { const r = s.at(a && a.mv); return r ? { x: r[0], z: r[1] } : null } if (s.at && typeof s.at === 'string') { const n = AV.npc && AV.npc.find(s.at); return n ? { x: n.g.position.x, z: n.g.position.z, y: n.g.position.y } : null }
  if (s.k === 'talk') { const n = AV.npc && AV.npc.find(s.npc); if (n) return { x: n.g.position.x, z: n.g.position.z, y: n.g.position.y }; if (s.at) return { x: s.at[0], z: s.at[1] }; return null }
  if (s.k === 'go') return { x: s.x, z: s.z }; if (s.at) return { x: s.at[0], z: s.at[1] }; return null }
M.where = id => { const a = st().a[id]; const s = M.cur(id); if (!s || (s.w && AV.W && s.w !== AV.W.id)) return null; return where(s, a) };
let tk = 0;
AV.frameFns.push(() => { if (!AV.running || !AV.W) return; const t = AV.now(); if (t - tk < .25) return; tk = t; const m = st(), P = AV.P, S = AV.S;
  for (const id of Object.keys(m.a)) { const a = m.a[id], s = M.cur(id); if (!s) { finish(id); continue }
    if (s.time && t - a.ts > s.time) { M.fail(id, L('Out of time.', 'Se acabó el tiempo.')); continue }
    const inW = !s.w || s.w === AV.W.id; let ok = false;
    if (s.k === 'go') ok = inW && Math.hypot(P.x - s.x, P.z - s.z) < (s.r || 3);
    else if (s.k === 'have') ok = bagN(s.item) >= (s.n || 1);
    else if (s.k === 'use') ok = consDone(s.item) > a.base.cons || (!(AV.cons && AV.cons.spec && AV.cons.spec(s.item)) && bagN(s.item) < a.base.have && !(AV.bag && AV.bag.busy && AV.bag.busy()));
    else if (s.k === 'test') ok = inW && !!s.fn(S, a.mv);
    else if (s.k === 'travel') ok = AV.W.id === s.w;
    if (ok) advance(id) }
  markers(); hud() });

/* ---------- talk stages + offers (conversations) ---------- */
M.talkStage = function (id) { const a = st().a[id], s = M.cur(id), d = M.defs[id]; if (!s || s.k !== 'talk') return false;
  const nodes = typeof s.nodes === 'function' ? s.nodes(a.mv) : s.nodes, tree = { name: d.npcName || (AV.NPCS[s.npc] && AV.NPCS[s.npc].name) || s.npc, title: d.title, nodes: {} };
  for (const k in nodes) { const n = nodes[k]; tree.nodes[k] = Object.assign({}, n, { opts: c => { c.mv = a.mv; return (typeof n.opts === 'function' ? n.opts(c) : n.opts || []).map(o => Object.assign({}, o, { end: o.end || !!o.fail, do: cc => { cc.mv = a.mv; let r = o.do ? o.do(cc) : undefined;
    if (o.fail) { AV.mis.fail(id, o.fail === true ? null : o.fail); return null } if (o.adv) { setTimeout(() => { if (st().a[id] && M.cur(id) === s) advance(id) }, 0) } return r } })) } }) }
  return AV.convo.open(s.npc, tree, s.start || 'start') };
M.offer = function (id) { const d = M.defs[id]; if (!d || !M.available(id)) return false; const who = typeof d.giver === 'string' ? d.giver : '_board_' + id, o = d.offer || {};
  const tree = { name: d.npcName || (AV.NPCS[who] && AV.NPCS[who].name) || (d.giver && d.giver.name ? say(d.giver.name) : who), title: d.title, nodes: {
    start: { say: o.say || d.blurb, opts: [ { t: o.yes || L("I'm in. Let's do it.", 'Me apunto. Vamos.'), do: () => { M.start(id); return null }, end: true },
      { t: L('What do I get out of it?', '¿Y qué gano yo?'), go: 'pay', if: () => !!d.reward }, { t: o.no || L('Not right now.', 'Ahora no.'), end: true } ] },
    pay: { say: () => { const r = d.reward, b = []; const mo = typeof r.money === 'function' ? null : r.money; if (mo) b.push(mo + ' ' + tr('credits', 'créditos')); for (const k in (r.items || {})) b.push(r.items[k] + ' × ' + (AV.ITEMS && AV.ITEMS[k] ? say(AV.ITEMS[k].n) : k)); if (r.rep) b.push(tr('a better name around here', 'mejor fama por aquí')); return (b.length ? b.join(', ') : tr('Good karma.', 'Buen karma.')) + '.' },
      opts: [ { t: L('Deal.', 'Trato hecho.'), do: () => { M.start(id); return null }, end: true }, { t: L('Maybe later.', 'Quizá luego.'), end: true } ] } } };
  return AV.convo.open(who, tree, 'start') };

/* ---------- markers: "!" over people with work, "◆" over the tracked objective; minimap icons ---------- */
const live = new Map();
function want() { const out = [], W = AV.W, m = st(); if (!W) return out;
  for (const d of M.list(W.id)) { if (!M.available(d.id)) continue; if (typeof d.giver === 'string') { const n = AV.npc && AV.npc.find(d.giver); if (n) out.push({ key: 'g:' + d.giver, kind: 'give', x: n.g.position.x, y: n.g.position.y + (n.g.userData.lwH || 3.7), z: n.g.position.z }) } else if (d.giver) out.push({ key: 'g:' + d.id, kind: 'give', x: d.giver.x, y: (W.surface(d.giver.x, d.giver.z) || 0) + 2.6, z: d.giver.z }) }
  const tid = m.track && m.a[m.track] ? m.track : null; if (tid) { const p = M.where(tid); if (p) out.push({ key: 'o:' + tid, kind: 'obj', x: p.x, y: (p.y != null ? p.y + 4.2 : (W.surface(p.x, p.z) || 0) + 2.8), z: p.z }) }
  return out }
let wk = 0;
function markers() { const now = AV.now(); if (now - wk < .5) return; wk = now; const ws = want(), keys = new Set(ws.map(w => w.key + w.kind));
  for (const [k, mk] of live) if (!keys.has(k) || mk.userData.W !== AV.W) { LW.dropMarker(mk); live.delete(k) }
  for (const w of ws) { const k = w.key + w.kind; let mk = live.get(k); if (!mk) { mk = LW.marker(w.kind); mk.userData.W = AV.W; live.set(k, mk) } mk.userData.base = { x: w.x, y: w.y, z: w.z } }
  M._marks = ws }
M.mapMarks = () => (M._marks || []).map(w => ({ x: w.x, z: w.z, kind: 'venue', icon: w.kind === 'give' ? '❗' : '◆', name: w.kind === 'give' ? tr('Someone has work for you', 'Alguien tiene trabajo para ti') : tr('Mission objective', 'Objetivo de misión') }));

/* ---------- objective HUD ---------- */
let hk = 0, hDirty = true; function hudSoon() { hDirty = true }
function hud() { const now = AV.now(); if (!hDirty && now - hk < 1) return; hk = now; hDirty = false; const m = st(), id = m.track && m.a[m.track] ? m.track : Object.keys(m.a)[0];
  if (!id || (AV.S.set && AV.S.set.lwHud === false)) return LW.objLine(null); const p = M.where(id); const dist = p ? Math.round(Math.hypot(p.x - AV.P.x, p.z - AV.P.z)) : null, s = M.cur(id);
  const away = s && s.w && AV.W && s.w !== AV.W.id ? ' <small>(' + esc((AV.worldMeta && AV.worldMeta(s.w) || {}).name || s.w) + ')</small>' : '';
  LW.objLine((CAT[M.defs[id].cat] || '◆') + ' <b>' + esc(say(M.defs[id].title)) + '</b> — ' + esc(M.objective(id)) + away + (dist != null && dist > 4 ? ' <small>· ' + dist + ' m</small>' : '') + ' <small>· G</small>') }
M.navigate = function (id) { const p = M.where(id); if (!p || !AV.minimap) { AV.toast(tr('No map point for this step: follow the objective text.', 'Este paso no tiene punto en el mapa: sigue el texto del objetivo.')); return false } M._nav = id; AV.minimap.setDest(p.x, p.z, say(M.defs[id].title)); return true };

/* ---------- journal (G, or 📜 on the phone) ---------- */
let tab = 'act';
M.journal = function (t) { if (t) tab = t; const m = st(), W = AV.W, wid = W && W.id;
  const row = (d, body, btns) => '<div class="lwMis">' + (CAT[d.cat] || '◆') + ' <b>' + esc(say(d.title)) + '</b>' + (d.w && d.w !== wid ? ' <small>· ' + esc((AV.worldMeta && AV.worldMeta(d.w) || {}).name || d.w) + '</small>' : '') + '<br><small>' + body + '</small><div class="lwBtns">' + (btns || '') + '</div></div>';
  let html = '';
  if (tab === 'act') { const ids = Object.keys(m.a); html = ids.map(id => { const d = M.defs[id]; if (!d) return ''; const a = m.a[id];
      return row(d, '◆ ' + esc(M.objective(id)) + ' <span style="opacity:.6">(' + tr('step ', 'paso ') + (a.s + 1) + '/' + d.stages.length + ')</span>', (m.track === id ? '<b>📌 ' + tr('Tracked', 'Seguida') + '</b> ' : '<button data-tr="' + id + '">📌 ' + tr('Track', 'Seguir') + '</button>') +
        '<button data-nav="' + id + '">🧭 ' + tr('Navigate', 'Navegar') + '</button><button data-ab="' + id + '">✖ ' + tr('Abandon', 'Abandonar') + '</button>') }).join('') || '<p style="opacity:.75">' + tr('No active missions. Look for ❗ over people, or the Available tab.', 'Sin misiones activas. Busca ❗ sobre la gente o mira la pestaña Disponibles.') + '</p>' }
  else if (tab === 'av') { const here = M.list(wid).filter(d => M.available(d.id)), far = Object.values(M.defs).filter(d => d.w !== wid && M.available(d.id));
    const giverName = d => typeof d.giver === 'string' ? ((AV.NPCS[d.giver] && AV.NPCS[d.giver].name) || d.npcName || d.giver) : d.giver ? say(d.giver.name) : '';
    html = '<p><b>' + tr('Here', 'Aquí') + '</b></p>' + (here.map(d => row(d, esc(say(d.blurb || '')) + ' · ' + tr('Ask ', 'Habla con ') + esc(giverName(d)), '<button data-find="' + d.id + '">🧭 ' + tr('Show me', 'Llévame') + '</button>')).join('') || '<p style="opacity:.7">' + tr('Nothing new here right now.', 'Nada nuevo aquí ahora mismo.') + '</p>') +
      '<p><b>' + tr('Elsewhere in the multiverse', 'En otros mundos') + '</b></p>' + (far.slice(0, 40).map(d => row(d, esc(say(d.blurb || '')) + ' · ' + esc(giverName(d)), '')).join('') || '<p style="opacity:.7">—</p>') }
  else { const ids = Object.keys(m.d); html = ids.map(id => M.defs[id] ? '<div class="lwMis">✔ ' + esc(say(M.defs[id].title)) + (m.d[id] > 1 ? ' ×' + m.d[id] : '') + '</div>' : '').join('') || '<p style="opacity:.7">' + tr('Nothing yet.', 'Nada todavía.') + '</p>';
    const rep = LW.st().rep; html += '<p><b>' + tr('Reputation', 'Reputación') + '</b></p>' + (Object.keys(rep).map(w => '<div>' + esc((AV.worldMeta && AV.worldMeta(w) || {}).name || w) + ': ' + rep[w] + ' · ' + esc(say(LW.repTitle(rep[w]))) + '</div>').join('') || '<p style="opacity:.7">—</p>') +
      (AV.quests && AV.quests.listHtml ? '<hr>' + AV.quests.listHtml() : '') }
  const cnt = { act: Object.keys(m.a).length, av: M.list(wid).filter(d => M.available(d.id)).length };
  const p = AV.panel('cmp', '<h3 style="margin:0 0 6px">📜 ' + tr('Missions', 'Misiones') + '</h3><div class="lwTabs lwBtns"><button data-tab="act" class="' + (tab === 'act' ? 'on' : '') + '">' + tr('Active', 'Activas') + ' (' + cnt.act + ')</button><button data-tab="av" class="' + (tab === 'av' ? 'on' : '') + '">' + tr('Available', 'Disponibles') + ' (' + cnt.av + ')</button><button data-tab="done" class="' + (tab === 'done' ? 'on' : '') + '">' + tr('Done + reputation', 'Hechas + reputación') + '</button><button data-close>✕</button></div><div style="max-height:62vh;overflow:auto">' + html + '</div>');
  p.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => M.journal(b.dataset.tab));
  p.querySelectorAll('[data-tr]').forEach(b => b.onclick = () => { M.track(b.dataset.tr); M.journal() });
  p.querySelectorAll('[data-nav]').forEach(b => b.onclick = () => { M.track(b.dataset.nav); if (M.navigate(b.dataset.nav)) AV.closePanel('cmp') });
  p.querySelectorAll('[data-ab]').forEach(b => b.onclick = () => { M.abandon(b.dataset.ab); M.journal() });
  p.querySelectorAll('[data-find]').forEach(b => b.onclick = () => { const d = M.defs[b.dataset.find]; let x, z; if (typeof d.giver === 'string') { const n = AV.npc.find(d.giver); if (n) { x = n.g.position.x; z = n.g.position.z } } else if (d.giver) { x = d.giver.x; z = d.giver.z } if (x != null && AV.minimap) { AV.minimap.setDest(x, z, say(d.title)); AV.closePanel('cmp') } });
  return p };
AV.keymap = AV.keymap || {}; { const kG = AV.keymap.KeyG; AV.keymap.KeyG = e => { if (kG) kG(e); if (!AV.blocking()) M.journal() } }
addEventListener('load', () => { const PH = AV.phone; if (PH && PH.APPS && !PH.APPS.find(a => a.id === 'missions')) PH.APPS.unshift({ id: 'missions', ic: '📜', n: L('Missions', 'Misiones'), go: () => M.journal(), badge: () => Object.keys(st().a).length });
  const MM = AV.minimap; if (MM) MM.extra = () => M.mapMarks() });

/* ---------- mission boards: a world-wide noticeboard listing what is on offer here (place-giver missions are taken from it) ---------- */
M.board = function () { const W = AV.W; if (!W) return; const here = M.list(W.id).filter(d => M.available(d.id));
  const p = AV.panel('cmp', '<h3>📌 ' + tr('Notice board', 'Tablón de anuncios') + ' · ' + esc(W.name) + '</h3>' + (here.map(d => '<div class="lwMis">' + (CAT[d.cat] || '◆') + ' <b>' + esc(say(d.title)) + '</b><br><small>' + esc(say(d.blurb || '')) + '</small><div class="lwBtns">' +
    (typeof d.giver === 'string' ? '<button data-find="' + d.id + '">🧭 ' + tr('Find ', 'Buscar a ') + esc((AV.NPCS[d.giver] && AV.NPCS[d.giver].name) || d.npcName || d.giver) + '</button>' : '<button data-take="' + d.id + '">✔ ' + tr('Take it', 'Aceptar') + '</button>') + '</div></div>').join('') || '<p>' + tr('Nothing pinned up right now. Come back tomorrow.', 'No hay nada colgado ahora. Vuelve mañana.') + '</p>') + '<div class="lwBtns"><button data-close>' + tr('Close', 'Cerrar') + '</button></div>');
  p.querySelectorAll('[data-take]').forEach(b => b.onclick = () => { AV.closePanel('cmp'); M.start(b.dataset.take) });
  p.querySelectorAll('[data-find]').forEach(b => b.onclick = () => { const d = M.defs[b.dataset.find], n = AV.npc.find(d.giver); if (n && AV.minimap) AV.minimap.setDest(n.g.position.x, n.g.position.z, (AV.NPCS[d.giver] || {}).name || d.giver); AV.closePanel('cmp') }) };
/* place-based givers (boards, phone calls) get a trigger at their spot */
{ const pe = AV.onWorldEnter; AV.onWorldEnter = function (W) { if (pe) pe(W); if (!W || !W.T) return; const seen = new Set();
  for (const d of M.list(W.id)) { if (!d.giver || typeof d.giver === 'string' || d.giver.x == null) continue; const k = Math.round(d.giver.x) + ',' + Math.round(d.giver.z); if (seen.has(k)) continue; seen.add(k); const g = d.giver;
    W.T.push({ x: g.x, z: g.z, r: g.r || 2.6, label: () => '📌 ' + say(g.name || L('Notice board', 'Tablón')), fn: () => M.board(), show: () => M.list(W.id).some(x => x.giver === g || (x.giver && x.giver.x === g.x && x.giver.z === g.z)) }) } } }
})(window.AV);
