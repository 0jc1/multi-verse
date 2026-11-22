/* APEVERSE V0.9.1 - chat.js : NPC conversations.
   Offline dialogue engine (data in data/npcs.js): intent scoring over EN/ES keywords, context-aware lines (time of day, job, money,
   quests, what the player did this session), no-repeat variation, pending questions (yes/no), session memory per NPC, affinity,
   remembered facts, contextual quick-reply chips.
   Optional AI: a USER-HOSTED backend URL (localStorage 'apeverse_llm_url', or AV.setLLMUrl). No API key ever lives in this client.
   The model returns text + an optional action; the game only accepts whitelisted, validated actions and never lets text change credits. */
'use strict';
(function (AV) {
const $ = AV.$, tr = AV.tr, cl = AV.cl;
const Chat = AV.chat = { who: 'zil', open: false, hist: [], llm: false, busy: false, delay: 380, speakUntil: 0 };
const D = AV.dlg = { sess: {}, events: {}, log: [] };
const LLM_URL = () => { try { return (localStorage.getItem('apeverse_llm_url') || '').trim() } catch (e) { return '' } };

/* ---------- text helpers ---------- */
const norm = s => ' ' + String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, '').replace(/[^a-z0-9ñ ]+/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
function hit(nm, kw) {
  const k = norm(kw).trim(); if (!k) return 0;
  if (k.indexOf(' ') >= 0) return nm.indexOf(' ' + k) >= 0 ? 2 : 0;
  return nm.indexOf(' ' + k + (k.length >= 4 ? '' : ' ')) >= 0 ? 1 : 0;   // short words exact, longer words also match as a stem
}
const looksES = m => /\b(hola|trabajo|gracias|que tal|quiero|buenas|alquiler|musica|pinturas|cine|donde|como|tienes|puedo|me llamo|si claro|vale)\b/.test(norm(m)) && !/\b(hello|work|the|you)\b/.test(norm(m));
const lowFirst = s => s ? s[0].toLowerCase() + s.slice(1) : s;

/* ---------- memory ---------- */
function sess(id) { return D.sess[id] || (D.sess[id] = { turns: 0, topics: {}, used: {}, last: {}, pending: null, aff: 0 }) }
function pmem(id) { const S = AV.S; S.mem = S.mem || {}; const m = S.mem[id] = S.mem[id] || { met: 0, facts: [] }; if (!m.f || typeof m.f !== 'object') m.f = {}; if (!Array.isArray(m.facts)) m.facts = []; return m }
D.event = function (type, n) { D.events[type] = (D.events[type] || 0) + (n || 1); D.log.unshift({ type, at: Date.now() }); D.log.length = Math.min(D.log.length, 40); if (AV.quests) AV.quests.check() };
D.did = type => D.events[type] || 0;

function ctxFor(id, msg) {
  const S = AV.S, s = sess(id), pm = pmem(id), es = AV.ui === 'es' || (msg ? looksES(msg) : false), h = Math.floor(S.time / 60) % 24;
  return { id, S, es, t: (en, e) => (es && e != null ? e : en), money: S.money, job: !!S.job, rent: S.rentDays > 0 ? S.rentDays : 0, world: AV.W && AV.W.id,
    part: h < 5 ? 'night' : h < 12 ? 'morning' : h < 18 ? 'afternoon' : h < 22 ? 'evening' : 'night', met: pm.met, aff: s.aff + (pm.aff || 0),
    hasName: !!S.name, n: S.name || (es ? 'forastero' : 'stranger'), did: D.did, topic: k => s.topics[k] || 0,
    q: k => (S.quests || {})[k] || null, has: k => ((S.items || {})[k] || 0) > 0, seen: () => (AV.quests ? AV.quests.seenCount() : 0),
    fact: (k, v) => { if (v === undefined) return pm.f[k]; pm.f[k] = v }, ask: k => { s.pending = k },
    /* the most recent of these events that happened since this NPC last greeted you (so news is mentioned once) */
    recent: types => { const e = D.log.find(e => types.indexOf(e.type) >= 0 && e.at > (s.greetAt || 0)); return e ? e.type : null } };
}
const fill = (c, txt) => String(txt).replace(/%n/g, c.n);
/* pick a variant, never the same line twice in a row; cycles through all before repeating */
function pickv(id, key, arr) {
  const s = sess(id); arr = Array.isArray(arr) ? arr : [arr]; if (!arr.length) return { text: '', cycled: false };
  const u = s.used[key] || (s.used[key] = []); let pool = arr.map((_, i) => i).filter(i => u.indexOf(i) < 0), cycled = false;
  if (!pool.length) { u.length = 0; cycled = true; pool = arr.map((_, i) => i).filter(i => i !== s.last[key] || arr.length === 1) }
  const i = pool[Math.random() * pool.length | 0]; u.push(i); s.last[key] = i; return { text: arr[i], cycled };
}

/* ---------- offline brain ---------- */
const YES = /\b(yes|yeah|yep|yup|sure|ok|okay|deal|sounds good|accept|of course|why not|lets go|alright|si|vale|claro|acepto|me apunto|dale|por supuesto|venga|bueno)\b/;
const NO = /\b(no|nope|nah|pass|not now|later|no gracias|paso|ahora no|luego)\b/;
D.offline = function (id, msg) {
  const N = AV.NPCS[id], S = AV.S, s = sess(id), c = ctxFor(id, msg), nm = norm(msg); s.turns++;
  /* name capture (works for every NPC; shared across NPCs) */
  const m = msg.match(/(?:my name is|i am called|im called|call me|me llamo|mi nombre es)\s+([A-Za-zÁÉÍÓÚáéíóúñÑ]{2,14})/i) || msg.match(/^\s*(?:i'?m|soy)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]{1,13})\b/);
  if (m && !/^(looking|new|here|good|fine|broke|hungry|ok|okay|tired|bored|lost|nuevo|bien|cansado|aburrido|perdido)$/i.test(m[1])) {
    const old = S.name; S.name = m[1][0].toUpperCase() + m[1].slice(1).toLowerCase(); c.n = S.name; c.hasName = true; pmem(id).facts = ['player name: ' + S.name];
    return { reply: fill(c, pickv(id, 'name', old && old !== S.name ? [c.t('Oh, it’s %n now? New universe, new name. I respect it.', '¿Ahora eres %n? Nuevo universo, nuevo nombre. Lo respeto.')] : [c.t('Nice to meet you, %n. I’ll remember it.', 'Encantado, %n. Lo recordaré.'), c.t('%n. Good name. Sounds like someone who tips.', '%n. Buen nombre. Suena a alguien que deja propina.')]).text) };
  }
  /* pending question (yes / no / free answer) */
  if (s.pending && N.answers && N.answers[s.pending]) {
    const A = N.answers[s.pending]; let r = null;
    if (A.yes && YES.test(nm)) r = A.yes(c); else if (A.no && NO.test(nm)) r = A.no(c); else if (A.other) r = A.other(c, msg);
    s.pending = null; if (r) return { reply: fill(c, r.say), action: r.action || null };
  }
  /* intent scoring: NPC topics first, then shared small talk */
  const topics = N.topics.concat(AV.NPC_COMMON.filter(ct => !N.topics.some(t => t.id === ct.id)));
  let best = null, bs = 0;
  for (const tp of topics) { let sc = 0; for (const k of tp.kw) sc += hit(nm, k); if (tp.greet && sc) sc = .5; if (sc > bs) { bs = sc; best = tp } }
  if (best) {
    s.topics[best.id] = (s.topics[best.id] || 0) + 1; if (best.aff) s.aff = cl(s.aff + best.aff, -5, 5);
    if (best.greet) return { reply: fill(c, pickv(id, 'greet', N.greet(c)).text), topic: 'hello' };
    const arr = best.say(c), v = pickv(id, 't:' + best.id, arr); let txt = v.text;
    if (v.cycled && arr.length > 1) txt = c.t('Like I said — ', 'Como te dije: ') + lowFirst(txt);
    if (s.aff <= -3 && best.aff == null) txt = c.t('(a little coolly) ', '(con algo de frialdad) ') + txt;
    return { reply: fill(c, txt), topic: best.id };
  }
  /* fallback: rotate, and after a few turns nudge toward topics not yet discussed */
  let txt = pickv(id, 'fb', N.fallback(c)).text;
  if (s.turns > 2 && Math.random() < .5) { const untried = N.topics.filter(t => !s.topics[t.id]); if (untried.length) { const t = untried[Math.random() * untried.length | 0]; txt += ' ' + c.t('Ask me about ', 'Pregúntame por ') + norm(t.kw[0]).trim() + '?' } }
  return { reply: fill(c, txt) };
};

/* ---------- optional AI backend (user-hosted; see docs/NPC_AI.md) ---------- */
const ACTIONS = ['offer_job', 'start_quest', 'suggest_world', 'cm'];
async function ask(msg) {
  const url = LLM_URL(), id = Chat.who, N = AV.NPCS[id];
  if (url) {
    try {
      const pm = pmem(id), s = sess(id), S = AV.S, ctrl = new AbortController(), to = setTimeout(() => ctrl.abort(), 9000);
      const body = { character: id, name: N.name, personality: N.persona, persona: N.persona, language: AV.ui, message: msg.slice(0, 300), history: Chat.hist.slice(-12),
        memory: { met: pm.met, facts: pm.f, player_name: S.name || null, topics_this_session: Object.keys(s.topics), affinity: s.aff },
        state: { job: !!S.job, world: AV.W && AV.W.id, lang: AV.ui, credits: S.money, rent_days: S.rentDays, day: S.day, time: Math.floor(S.time), quests: S.quests || {}, items: S.items || {}, recent_events: D.log.slice(0, 8).map(e => e.type) },
        allowed_actions: ACTIONS };
      const r = await fetch(url, { method: 'POST', signal: ctrl.signal, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); clearTimeout(to);
      if (r.ok) { const j = await r.json(); if (j && typeof j.reply === 'string' && j.reply.length < 800) { Chat.llm = true; return { reply: j.reply.replace(/[<>]/g, ''), action: validAction(j.action) } } }
    } catch (e) { }
  }
  Chat.llm = false; return D.offline(id, msg);
}
function validAction(a) {         // whitelist + game-side validation; NO money-changing actions exist here
  if (!a || typeof a !== 'object') return null;
  if (a.type === 'offer_job' && a.accepted === true && Chat.who === 'zil') return { type: 'offer_job', accepted: true };
  if (a.type === 'suggest_world' && typeof a.world === 'string' && AV.isPlayable(a.world)) return { type: 'suggest_world', world: a.world };
  if (a.type === 'start_quest' && typeof a.id === 'string' && AV.quests && AV.quests.canStart(a.id, Chat.who)) return { type: 'start_quest', id: a.id };
  /* V0.9.4 Chiang Mai: world-side activities (pool challenge, jam, lantern...), each checked by the world for this NPC */
  if (a.type === 'cm' && typeof a.what === 'string' && AV.cm && AV.cm.allowed && AV.cm.allowed(Chat.who, a.what)) return { type: 'cm', what: a.what };
  return null;
}
function applyAction(a) {
  a = validAction(a); if (!a) return; const S = AV.S;
  if (a.type === 'offer_job' && !S.job) { S.job = true; S.log.unshift({ d: S.day, t: 'Hired at the café', a: 0 }); AV.save(); AV.hud(); AV.toast(tr('You got a job at the café!', '¡Tienes trabajo en el café!')); AV.audio && AV.audio.blip(880, .2); D.event('hired') }
  else if (a.type === 'start_quest') { AV.quests.start(a.id); if (AV.cm && AV.cm.onQuest) AV.cm.onQuest(a.id) }
  else if (a.type === 'cm') { const w = a.what, who = Chat.who; setTimeout(() => { AV.closeChat(); AV.cm.act(who, w) }, 900) }
  else if (a.type === 'suggest_world') AV.toast(tr('Tip: open the Portal Pipe (P) and choose ', 'Consejo: abre la Pipa-Portal (P) y elige ') + (AV.worldMeta(a.world) || { name: a.world }).name);
}

/* ---------- UI ---------- */
function say(who, txt, cls) { const p = document.createElement('p'); p.className = cls || ''; p.textContent = who + ': ' + txt; $('log').appendChild(p); $('log').scrollTop = 1e5; return p }
function chips() {
  const N = AV.NPCS[Chat.who], el = $('chips'); if (!el) return; el.innerHTML = ''; const c = ctxFor(Chat.who);
  (N.chips ? N.chips(c) : []).slice(0, 5).forEach(([label, msg]) => { const b = document.createElement('button'); b.className = 'qc'; b.textContent = label; b.onclick = () => send(msg); el.appendChild(b) });
}
AV.openChat = function (who) {
  if (Chat.open || !AV.NPCS[who]) return; const S = AV.S, N = AV.NPCS[who]; Chat.who = who; Chat.hist = []; Chat.open = true; sess(who).pending = null;
  const pm = pmem(who); pm.met++;
  $('chat').style.display = 'block'; AV.pushModal('chat', AV.closeChat); $('cn').textContent = N.name + ' · ' + (AV.ui === 'es' ? N.title[1] : N.title[0]); $('cn').style.color = N.col || '';
  $('log').innerHTML = '';
  $('tag').textContent = LLM_URL() ? tr('(connecting to your AI endpoint; falls back to offline dialogue if unavailable)', '(conectando con tu endpoint de IA; si falla usa el diálogo sin conexión)') : tr('Offline dialogue — scripted, not a real AI. It remembers this session.', 'Diálogo sin conexión: guionizado, no es una IA real. Recuerda esta sesión.');
  $('cs').textContent = tr('Send', 'Enviar'); $('cx').textContent = tr('Leave (Esc)', 'Salir (Esc)'); $('ci').placeholder = tr('Type anything and press Enter...', 'Escribe lo que quieras y pulsa Enter...');
  const c = ctxFor(who), g = fill(c, pickv(who, 'greet', N.greet(c)).text); sess(who).greetAt = Date.now();
  say(N.name, g); Chat.hist.push({ r: 'npc', t: g }); Chat.speakUntil = AV.now() + 2.5; chips(); setTimeout(() => $('ci').focus(), 50);
};
AV.closeChat = function () { if (!Chat.open) return; Chat.open = false; $('chat').style.display = 'none'; $('ci').blur(); AV.save(); AV.popModal('chat') };
async function send(m) {
  m = (m || '').trim(); if (!m || !Chat.open || Chat.busy) return; Chat.busy = true; $('ci').value = '';
  say(AV.S.name || tr('You', 'Tú'), m, 'me'); Chat.hist.push({ r: 'player', t: m });
  const typing = say(AV.NPCS[Chat.who].name, '…', 'typing');
  const [res] = await Promise.all([ask(m), new Promise(r => setTimeout(r, Chat.delay))]);
  typing.remove(); if (!Chat.open) { Chat.busy = false; return }
  say(AV.NPCS[Chat.who].name, res.reply); Chat.hist.push({ r: 'npc', t: res.reply }); Chat.speakUntil = AV.now() + Math.min(5, 1 + res.reply.length / 40);
  if (Chat.llm) $('tag').textContent = tr('AI connected via your backend (actions validated by the game)', 'IA conectada vía tu backend (el juego valida las acciones)'); else if (LLM_URL()) $('tag').textContent = tr('AI unreachable — using offline dialogue', 'IA no disponible: usando diálogo sin conexión');
  applyAction(res.action); chips(); AV.save(); Chat.busy = false;
}
AV.chatSend = send;
$('cx').onclick = () => AV.closeChat(); $('cs').onclick = () => send($('ci').value);
$('ci').addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Escape') return AV.closeChat(); if (e.key === 'Enter') send($('ci').value) });
AV.setLLMUrl = u => { try { localStorage.setItem('apeverse_llm_url', u || '') } catch (e) { } };
})(window.AV);
