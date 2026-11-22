/* APEVERSE V1.0 - v1_systems.js : shared systems from the V1 Expansion Kit roadmap (Milestones 1-2), built on the existing game.
   AV.shop  : vendor panel (icon, name, price, credits) -> validated purchase: in reach, enough credits, one debit + one item per click
              (double-tap guard), receipt + vendor remark, vendor remembers what you bought (S.v1.vend).
   AV.talk  : NPC dialogue panel with 2-4 choices (EN/ES), first-meeting / returning greetings (S.v1.met).
   Accessibility: Disable intoxication visuals (timers still run, visuals off), No flashing (calmer pulsing lights), Clear effects button.
   HUD: active effect badge with time left + current task.  Everything lives in AV.S (same save, new fields get defaults). */
'use strict';
(function (AV) {
const tr = AV.tr, $ = AV.$;
const st = () => { const S = AV.S; S.v1 = S.v1 || {}; S.v1.vend = S.v1.vend || {}; S.v1.met = S.v1.met || {}; S.v1.poi = S.v1.poi || {}; return S };
const nm = id => { const d = AV.ITEMS[id]; return d ? (AV.ui === 'es' ? d.n[1] : d.n[0]) : id };
const L = a => Array.isArray(a) ? tr(a[0], a[1]) : (typeof a === 'function' ? a() : a);
AV.calm = () => !!(AV.S && AV.S.set && (AV.S.set.reduce || AV.S.set.noFlash));

/* ======================= shop ======================= */
const SH = AV.shop = { last: null };
let busyUntil = 0;
/* v = { id, name:[en,es], greet:[en,es], again:[en,es] (optional), items:[[itemId, price]], x, z, reach } */
SH.open = function (v) {
  const S = st(), rec = S.v1.vend[v.id] || { n: 0, last: null }, again = rec.n > 0;
  SH.last = v;
  const greet = again ? (v.again ? L(v.again).replace('%i', nm(rec.last)) : tr('Back again! Another ' + nm(rec.last) + '?', '¡Otra vez por aquí! ¿Otro ' + nm(rec.last) + '?')) : L(v.greet);
  const rows = v.items.map(([id, price]) => { const d = AV.ITEMS[id] || { ic: '❔' }; return '<div class="bitem"><div class="bic">' + d.ic + '</div><div class="bnm">' + nm(id) + ' <b>' + price + '</b><small>' + tr('in backpack', 'en la mochila') + ': <span data-cnt="' + id + '">' + (AV.bag ? AV.bag.count(id) : 0) + '</span></small></div><div class="bbt"><button data-buy="' + id + '" data-p="' + price + '">' + tr('Buy', 'Comprar') + '</button></div></div>' }).join('');
  const p = AV.panel('cmp', '<b>' + L(v.name) + '</b> · ' + tr('Credits', 'Créditos') + ': <span id="shC">' + S.money + '</span><div class="note" id="shM">' + greet + '</div><div class="bgrid">' + rows + '</div><div class="row"><button data-close>' + tr('Done', 'Listo') + '</button></div>');
  p.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => SH.buy(v, b.dataset.buy, +b.dataset.p, b));
};
SH.buy = function (v, id, price, btn) {
  const S = st(), msg = $('shM'), now = performance.now();
  if (now < busyUntil) return false;                                   // one purchase per tap (rapid double clicks are ignored)
  busyUntil = now + 450; if (btn) { btn.disabled = true; setTimeout(() => btn.disabled = false, 450) }
  if (v.x != null && Math.hypot(AV.P.x - v.x, AV.P.z - v.z) > (v.reach || 6)) { if (msg) msg.textContent = tr('You walked away from the counter.', 'Te alejaste del mostrador.'); return false }
  if (!AV.ITEMS[id] || !(price > 0)) return false;
  if (S.money < price) { if (msg) msg.textContent = tr('That’s ' + price + ' credits and you have ' + S.money + '. Tip the band, do a task or find work to earn more.', 'Son ' + price + ' créditos y tienes ' + S.money + '. Da propina, haz una tarea o busca trabajo para ganar más.'); AV.audio && AV.audio.blip(160, .15, 'square', .05); return false }
  if (!AV.txn(-price, L(v.name) + ': ' + nm(id))) return false;
  AV.bag.add(id, 1, true);
  const rec = S.v1.vend[v.id] = S.v1.vend[v.id] || { n: 0, last: null }; rec.n++; rec.last = id;
  if (msg) msg.textContent = '✔ ' + (AV.ITEMS[id].ic || '') + ' ' + nm(id) + ' (−' + price + '). ' + AV.pick([tr('Enjoy!', '¡Disfruta!'), tr('One love.', 'Un amor.'), tr('Hold it with I → Hold, use it with U.', 'Sostenlo con I → Sostener y úsalo con U.')]);
  const c = $('shC'); if (c) c.textContent = S.money; const n = document.querySelector('#cmp [data-cnt="' + id + '"]'); if (n) n.textContent = AV.bag.count(id);
  AV.audio && AV.audio.blip(880, .12, 'triangle', .1); AV.dlg && AV.dlg.event && AV.dlg.event('shop_' + v.id); AV.save(); return true;
};

/* ======================= talk ======================= */
const TK = AV.talk = {};
/* n = { id, name:[en,es] or string, first:[en,es], back:[en,es] (optional fn S=>[en,es]), opts:[{ label:[en,es], say?:[en,es]|fn, fn?:()=>... }] } */
TK.open = function (n) {
  const S = st(), met = S.v1.met[n.id] || 0; S.v1.met[n.id] = met + 1;
  const hi = met ? L(typeof n.back === 'function' ? n.back(S) : n.back || n.first) : L(n.first);
  const p = AV.panel('cmp', '<b>' + L(n.name) + '</b><div class="note" id="tkL">' + hi + '</div><div class="grid">' + n.opts.map((o, i) => '<button data-o="' + i + '">' + L(o.label) + '</button>').join('') + '<button data-close>' + tr('Goodbye', 'Adiós') + '</button></div>');
  p.querySelectorAll('[data-o]').forEach(b => b.onclick = () => { const o = n.opts[+b.dataset.o]; if (o.say) $('tkL').textContent = L(typeof o.say === 'function' ? o.say(S) : o.say); if (o.fn) o.fn() });
  AV.dlg && AV.dlg.event && AV.dlg.event('talk_' + n.id); AV.save();
};

/* ======================= places visited (quest stages + journal) ======================= */
AV.visit = function (id) { const S = st(); if (!S.v1.poi[id]) { S.v1.poi[id] = S.day; AV.quests && AV.quests.check(); AV.save() } };

/* ======================= accessibility ======================= */
/* effects.js reads S.set.noIntox / noFlash; here: settings rows + a touch-friendly "clear effects" button */
const tog0 = AV.toggleSettings; AV.toggleSettings = function () {
  tog0(); const p = $('set'); if (!p || p.style.display !== 'block') return; const S = AV.S.set, close = p.querySelector('[data-close]');
  const box = document.createElement('div'); box.id = 'v1acc';
  box.innerHTML = '<p><label><input id="sNoI" type="checkbox" ' + (S.noIntox ? 'checked' : '') + '> ' + tr('Disable intoxication visuals (drinks/smoke keep their timers, no screen effects)', 'Desactivar efectos visuales de intoxicación (las bebidas/el humo siguen su tiempo, sin efectos en pantalla)') + '</label></p>' +
    '<p><label><input id="sNoF" type="checkbox" ' + (S.noFlash ? 'checked' : '') + '> ' + tr('No flashing (calm stage lights, no colour cycling)', 'Sin destellos (luces tranquilas, sin ciclos de color)') + '</label></p>' +
    '<p><button id="sClr">' + tr('Clear all effects now', 'Quitar todos los efectos ya') + '</button></p>';
  p.insertBefore(box, close);
  $('sNoI').onchange = e => { S.noIntox = e.target.checked; AV.fx && AV.fx.refresh && AV.fx.refresh(); AV.save() };
  $('sNoF').onchange = e => { S.noFlash = e.target.checked; AV.save() };
  $('sClr').onclick = () => AV.fx && AV.fx.reset();
};

/* ======================= HUD: effect badge + current task ======================= */
const FXN = { drink: ['tipsy', 'achispado'], smoke: ['stoned', 'colocado'], psy: ['psychedelic', 'psicodélico'], buzz: ['buzzing', 'acelerado'], glow: ['alien glow', 'brillo alienígena'] };
AV.fxBadge = function () { if (!AV.fx) return ''; const m = {}; AV.fx.active().forEach(e => { if (FXN[e.type]) m[e.type] = Math.max(m[e.type] || 0, e.left) }); return Object.keys(m).map(k => '✦ ' + tr(FXN[k][0], FXN[k][1]) + ' ' + Math.floor(m[k] / 60) + ':' + String(m[k] % 60).padStart(2, '0')).join(' · ') };
AV.taskLine = function () { const S = AV.S, Q = AV.quests; if (!S || !S.quests || !Q) return ''; const id = Object.keys(S.quests).find(k => S.quests[k] === 'active' && Q.defs[k]); return id ? '◆ ' + tr(Q.defs[id].title[0], Q.defs[id].title[1]) : '' };
const hud0 = AV.hud; AV.hud = function () { hud0.apply(this, arguments); if (!AV.S) return; const el = $('top'), b = AV.fxBadge(), q = AV.taskLine(); if (el && (b || q)) el.innerHTML += (b ? '<br><span id="fxBadge">' + b + '</span>' : '') + (q ? '<br><span id="taskLine">' + q + '</span>' : '') };
let hudAcc = 0; AV.frameFns.push(dt => { hudAcc += dt; if (hudAcc < 1) return; hudAcc = 0; if (AV.running && AV.fx && AV.fx.list.length) AV.hud() });
})(window.AV);
