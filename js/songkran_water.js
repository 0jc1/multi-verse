/* APEVERSE - songkran_water.js : Worlds Reborn v1.1 §35A, the playable Songkran water fight (Chiang Mai, festival mode F).
   Held water tools from the backpack, each with its own fill level, shown in the first-person hand:
     🪣 bucket       click (or phone SPLASH / U)   = one big throw that empties it; refill at a blue tub or barrel
     🔫 water gun    hold click (phone: hold SPLASH) = continuous stream, release stops it; tap = short burst
     🧴 squeeze bottle  click = a quick forward flick (the punch gesture, but water instead of a punch), 5 flicks per fill
   Empty hands: the punch works exactly as before. Other held items keep their own use. Nothing here runs outside Songkran mode.
   Hits make crowd characters flinch; splashers fire back; the story crew answers. Refill tubs + a festival stall near Giant Hostel.
   Mode switching rebuilds Chiang Mai, so every tub, stall and particle of the festival goes away with it; inventory is kept. */
'use strict';
(function (AV) {
const tr = AV.tr, $ = AV.$, L = (e, s) => [e, s], say = a => tr(a[0], a[1]);
const TOOLS = {
  sk_bucket: { kind: 'bucket', n: L('Songkran bucket', 'Cubo de Songkran'), cat: 'misc', ic: '🪣', use: 'splash', keep: true, model: 'bucket', col: 0xff4ad2, price: 10, per: 100, say: L('A bright plastic bucket. Full, it throws one glorious wave.', 'Un cubo de plástico brillante. Lleno, lanza una ola gloriosa.') },
  sk_gun: { kind: 'gun', n: L('Water gun', 'Pistola de agua'), cat: 'misc', ic: '🔫', use: 'splash', keep: true, model: 'watergun', col: 0x3ac8ff, price: 25, drain: 12, say: L('A pump-action water gun. Hold to spray, release to stop.', 'Una pistola de agua de bombeo. Mantén para disparar, suelta para parar.') },
  sk_bottle: { kind: 'bottle', n: L('Squeeze bottle', 'Botella de chorro'), cat: 'misc', ic: '🧴', use: 'splash', keep: true, model: 'squeeze', col: 0x7aff8a, price: 5, per: 20, say: L('A soft bottle. Squeeze for a quick flick of water.', 'Una botella blanda. Apriétala para un chorrito rápido.') }
};
Object.assign(AV.ITEMS, TOOLS);
const SK = AV.sk = { TOOLS, spraying: false, anim: null };
const S0 = () => { const S = AV.S; S.sk = S.sk || { fill: {}, hits: 0, throws: 0 }; return S.sk };
const fill = id => { const f = S0().fill; return f[id] == null ? 100 : f[id] };
const setFill = (id, v) => { S0().fill[id] = Math.max(0, Math.min(100, v)); showFill() };
SK.fill = fill;
SK.on = () => !!(AV.W && AV.W.id === 'chiang_mai' && AV.cm && AV.cm.sk);   // Songkran mode is running
SK.tool = () => { const id = AV.S.bag && AV.S.bag.eq; return id && TOOLS[id] && AV.bag.count(id) ? id : null };
const ACTB = () => AV.act && AV.act.cur;

/* ---------- sound (procedural: splash = filtered noise) ---------- */
const A = AV.audio || {};
function noise(d, g, hp, lp) { if (!A.ok || A.mute || !A.ctx || A.ctx.state !== 'running') return; const c = A.ctx, t = c.currentTime, n = c.sampleRate * d | 0, buf = c.createBuffer(1, n, c.sampleRate), x = buf.getChannelData(0); for (let i = 0; i < n; i++) x[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = c.createBufferSource(), f = c.createBiquadFilter(), f2 = c.createBiquadFilter(), e = c.createGain(); s.buffer = buf; f.type = 'highpass'; f.frequency.value = hp; f2.type = 'lowpass'; f2.frequency.value = lp || 6000; e.gain.value = g; s.connect(f); f.connect(f2); f2.connect(e); e.connect(A.mediaBus || c.destination); s.start(t) }
const slosh = () => { noise(.55, .35, 300, 2500); setTimeout(() => noise(.4, .25, 800, 5000), 120) };

/* ---------- aiming + hits ---------- */
function aim() { const P = AV.P, cp = Math.cos(P.pitch); return { x: P.x, y: P.y + 1.45, z: P.z, dx: -Math.sin(P.yaw) * cp, dy: Math.sin(P.pitch), dz: -Math.cos(P.yaw) * cp } }
function hit(range, minCos, max) {
  const K = AV.cm && AV.cm.sk; if (!K) return 0; const a = aim(), fl = Math.hypot(a.dx, a.dz) || 1; let n = 0;
  for (const w of K.crowd.list) { if (n >= max) break; if (!w.shown) continue; const ex = w.x - a.x, ez = w.z - a.z, d = Math.hypot(ex, ez); if (d > range || d < .3) continue; if ((ex * a.dx + ez * a.dz) / (d * fl) < minCos) continue;
    w.react = 1.3; n++; const S = AV.S; if (S.quests && S.quests.cm_soak === 'active' && S.cm.soakUntil && AV.now() < S.cm.soakUntil) { S.cm.soak++; AV.quests.check() }
    if (w.v === 'splasher' && Math.random() < .6) setTimeout(() => { if (!AV.cm.sk) return; K.spray.emit(w.x, 1.25, w.z, -ex / d, .4, -ez / d, 18, .25, 9); setTimeout(() => AV.cm.sk && K.soaked(), 300) }, 600) }
  for (const id in K.crew) { const c = K.crew[id], ex = c.g.position.x - a.x, ez = c.g.position.z - a.z, d = Math.hypot(ex, ez); if (d < range && d > .3 && (ex * a.dx + ez * a.dz) / (d * fl) > minCos) { n++; if (Math.random() < .5) AV.npc.bark(c, AV.pick([tr('HEY! *laughs* Payback time!', '¡EY! *se ríe* ¡Me vengaré!'), tr('Sawasdee pee mai to you too!', '¡Sawasdee pee mai para ti también!'), tr('Ice cold! Respect.', '¡Helada! Respeto.')])) } }
  S0().hits += n; return n;
}
const emitFrom = (k, spread, speed, up, off) => { const K = AV.cm.sk, a = aim(), o = off || .6; K.spray.emit(a.x + a.dx * o, a.y - .1, a.z + a.dz * o, a.dx, a.dy + (up || .15), a.dz, k, spread, speed) };

/* ---------- the three actions ---------- */
function empty(id) { AV.toast(TOOLS[id].ic + ' ' + tr('Empty! Refill at a blue tub or barrel.', '¡Vacío! Recarga en una tina o barril azul.')); AV.audio && AV.audio.blip(160, .12, 'triangle', .06) }
SK.act = function (on) {
  const id = SK.tool(); if (!id || !SK.on()) return false; const T = TOOLS[id];
  if (T.kind === 'gun') { if (on) { if (fill(id) <= 0) { empty(id); return true } SK.spraying = true; SK.sprayT = 0; SK.hitT = 0; SK.sprayStart = AV.now() } else SK.spraying = false; return true }
  if (!on || SK.anim) return true; if (fill(id) <= 0) { empty(id); return true }
  if (T.kind === 'bucket') { SK.anim = { id, kind: 'bucket', t: 0, dur: .8, fired: false }; S0().throws++ }
  else { SK.anim = { id, kind: 'bottle', t: 0, dur: .38, fired: false }; S0().throws++ }
  return true;
};
function fire(a) {
  const id = a.id;
  if (a.kind === 'bucket') { setFill(id, 0); emitFrom(80, .55, 7, .25, .5); emitFrom(50, .35, 9, .2, .7); slosh(); a.hits = hit(6.5, .8, 5);
    if (!S0().toldBucket) { S0().toldBucket = 1; AV.toast(tr('SPLOOSH! Bucket empty: refill at a blue tub or barrel.', '¡SPLASH! Cubo vacío: recarga en una tina o barril azul.')) } }
  else { setFill(id, fill(id) - TOOLS[id].per); emitFrom(18, .1, 11, .1, .5); noise(.18, .2, 1500, 7000); a.hits = hit(7.5, .93, 1) }
  SK.last = { kind: a.kind, hits: a.hits, t: AV.now() };
}

/* ---------- per frame: tool animation, the gun stream, fill display, HUD ---------- */
let hudT = 0;
AV.frameFns.push(() => { const now = AV.now(), rdt = Math.min(.25, Math.max(0, now - (SK.lastT || now))); SK.lastT = now; SK._tick(rdt) });
/* tests step this at a steady rate (the headless renderer draws a frame every few seconds) */
SK._tick = function (rdt) {
  const now = AV.now(), h =AV.bag && AV.bag.held ? AV.bag.held() : null, it = h && h.item, red = AV.S.set && AV.S.set.reduce;
  if (SK.anim) { const a = SK.anim; a.t += rdt; const k = Math.min(1, a.t / a.dur);
    if (a.kind === 'bucket') { if (!a.fired && k > .45) { a.fired = true; fire(a) } if (it) { const u = Math.sin(Math.min(1, k * 1.6) * Math.PI / 2) * (k < .85 ? 1 : (1 - k) / .15); it.rotation.x = -u * (red ? .8 : 1.9); it.position.set(0, u * .22, -u * .3) } }
    else { if (!a.fired && k > .35) { a.fired = true; fire(a) } if (it) { const u = Math.sin(k * Math.PI); it.position.set(.05 * u, .05 * u, -u * (red ? .15 : .32)); it.rotation.x = -u * .5 } }
    if (k >= 1) { SK.anim = null; if (it) { it.position.set(0, 0, 0); it.rotation.set(0, 0, 0) } } }
  if (SK.spraying) { const id = SK.tool(); if (!id || !SK.on() || TOOLS[id].kind !== 'gun' || ACTB() || AV.blocking()) SK.spraying = false;
    else { setFill(id, fill(id) - TOOLS[id].drain * rdt); SK.sprayT -= rdt; SK.hitT -= rdt; SK.sprayed = (SK.sprayed || 0) + rdt;
      if (SK.sprayT <= 0) { SK.sprayT = .05; emitFrom(5, .06, 14, .1, .5) } if (SK.hitT <= 0) { SK.hitT = .25; hit(11, .95, 1); noise(.12, .08, 3000, 9000) }
      if (it) { it.position.z = Math.sin(now * 40) * .006; it.rotation.x = -.04 }
      if (fill(id) <= 0) { SK.spraying = false; empty(id) } } }
  if ((hudT -= rdt) <= 0) { hudT = .25; drawHud() }
};
SK._ff = secs => { for (let i = 0; i < secs * 60; i++) SK._tick(1 / 60) };
function showFill() { const h = AV.bag && AV.bag.held ? AV.bag.held() : null; if (!h || !h.item || !TOOLS[h.id]) return; const w = h.item.getObjectByName('water'); if (!w) return; const f = fill(h.id) / 100, full = w.userData.full; w.visible = f > .01; w.scale.y = Math.max(.001, full * f); w.position.y = (w.userData.y0 == null ? (w.userData.y0 = w.position.y) : w.userData.y0) - full * (1 - f) / 2 }
const hudEl = document.createElement('div'); hudEl.id = 'skHud'; hudEl.style.cssText = 'position:fixed;left:50%;bottom:calc(14px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:25;background:rgba(10,40,70,.78);color:#dff6ff;border:1px solid #7ad8ff;border-radius:9px;padding:5px 12px;font:13px Georgia,serif;display:none;pointer-events:none;text-align:center'; document.body.appendChild(hudEl);
function drawHud() { const id = SK.tool(), on = id && SK.on() && !ACTB(); if (!on) { if (hudEl.style.display !== 'none') hudEl.style.display = 'none'; return } const T = TOOLS[id], f = Math.round(fill(id)), ph = AV.device === 'phone';
  hudEl.style.display = 'block'; hudEl.innerHTML = T.ic + ' <b>' + say(T.n) + '</b> · ' + tr('water ', 'agua ') + '<b>' + f + '%</b> · ' + (T.kind === 'gun' ? tr(ph ? 'hold SPLASH to spray' : 'hold click to spray', ph ? 'mantén SPLASH para disparar' : 'mantén clic para disparar') : T.kind === 'bucket' ? tr(ph ? 'tap SPLASH to throw' : 'click to throw', ph ? 'toca SPLASH para lanzar' : 'clic para lanzar') : tr(ph ? 'tap SPLASH to flick' : 'click to flick', ph ? 'toca SPLASH para salpicar' : 'clic para salpicar')) + ' · ' + tr('refill: blue tubs', 'recarga: tinas azules') }
SK.refill = function (silent) { let n = 0; for (const id in TOOLS) if (AV.bag.count(id)) { if (fill(id) < 100) n++; S0().fill[id] = 100 } showFill(); if (!silent) { AV.toast(n ? tr('💦 Filled up!', '💦 ¡Lleno!') : tr('Your water tools are already full.', 'Tus herramientas de agua ya están llenas.')); noise(.6, .18, 200, 1800) } return n };

/* ---------- input: left click / V punch / U use / phone SPLASH, only while a water tool is held in Songkran ---------- */
const mine = () => SK.tool() && SK.on() && !ACTB() && !AV.blocking();
addEventListener('mousedown', e => { if (e.button !== 0 || !mine()) return; const c = $('c'); if (document.pointerLockElement !== c && e.target !== c) return; e.stopImmediatePropagation(); if (document.pointerLockElement !== c) AV.lock(); SK.act(true) }, true);
addEventListener('mouseup', e => { if (e.button === 0 && SK.spraying) SK.act(false) }, true);
if (AV.punch && AV.punch.punch) { const p0 = AV.punch.punch; AV.punch.punch = function () { if (mine()) { SK.act(true); if (SK.spraying) setTimeout(() => SK.act(false), 300); return } return p0.apply(this, arguments) } }
if (AV.bag && AV.bag.use) { const u0 = AV.bag.use; AV.bag.use = function (id) { if (TOOLS[id]) { if (!AV.bag.count(id)) return AV.toast(tr('You don’t have that.', 'No tienes eso.')); if (AV.S.bag.eq !== id) AV.bag.equip(id); const p = $('inv'); if (p && p.style.display === 'block') AV.closePanel('inv');
  if (!SK.on()) return AV.toast(tr('Save the water for Songkran! (Chiang Mai, festival mode F)', '¡Guarda el agua para Songkran! (Chiang Mai, modo festival F)')); SK.act(true); if (SK.spraying && !SK.touchHold) setTimeout(() => { if (!SK.touchHold) SK.act(false) }, 350); return } return u0.apply(this, arguments) } }
{ const b = $('tU'); if (b) { b.addEventListener('pointerdown', () => { if (SK.tool()) SK.touchHold = true }, true); ['pointerup', 'pointercancel', 'pointerleave'].forEach(n => b.addEventListener(n, () => { if (SK.touchHold) { SK.touchHold = false; if (SK.spraying) SK.act(false) } })) } }
AV.bag.onEquip = id => { SK.spraying = false; SK.anim = null; showFill(); const b = $('tU'); if (b) { if (b.dataset.txt == null) b.dataset.txt = b.textContent; b.textContent = TOOLS[id] ? 'SPLASH' : b.dataset.txt } };

/* ---------- refill tubs + festival stall, built each time Chiang Mai is entered in Songkran mode ---------- */
function freeNear(W, x, z, r) { for (let d = 0; d < 10; d += .7) for (let k = 0; k < Math.max(1, d * 6); k++) { const a = k / Math.max(1, d * 6) * Math.PI * 2, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d; if (AV.isFree(W, px, pz, r) && !W.T.some(t => Math.hypot(t.x - px, t.z - pz) < 1.2)) return [px, pz] } return null }
const tubMat = () => AV.std(0x2a8ad8, .5), waterMat = () => AV.std(0x8ae0ff, .05, 0, 0x2a8ac8, .25);
function tub(W, x, z, big) { const y = W.surface(x, z) || 0, g = new THREE.Group(), r = big ? 1.1 : .7; g.position.set(x, y, z);
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(r, r * .95, .38, 18, 1, true), tubMat()); wall.position.y = .19; g.add(wall); const ring = new THREE.Mesh(new THREE.TorusGeometry(r, .07, 6, 20), AV.std(0xff8ad8, .5)); ring.rotation.x = Math.PI / 2; ring.position.y = .38; g.add(ring);
  const wat = new THREE.Mesh(new THREE.CircleGeometry(r * .95, 18), waterMat()); wat.rotation.x = -Math.PI / 2; wat.position.y = .3; g.add(wat); AV.lin(g); W.group.add(g); W.circles.push([x, z, r + .1]);
  W.T.push({ x, z, r: r + 1.4, label: () => { const t = SK.tool(); return '💦 ' + (t ? tr('Refill: dip your ' + say(TOOLS[t].n).toLowerCase() + ' in the tub', 'Recargar: mete tu ' + say(TOOLS[t].n).toLowerCase() + ' en la tina') : AV.bag.count('sk_bucket') ? tr('Water tub: refill your water tools', 'Tina de agua: recarga tus herramientas') : tr('Water tub: grab a free bucket and fill it', 'Tina de agua: coge un cubo gratis y llénalo')) },
    fn: () => { if (!SK.tool() && !AV.bag.count('sk_bucket')) { AV.bag.add('sk_bucket', 1, true); AV.bag.equip('sk_bucket'); AV.toast(tr('🪣 Free bucket from the tub, filled to the brim. Click to throw!', '🪣 Cubo gratis de la tina, lleno hasta arriba. ¡Clic para lanzar!')) } else if (!SK.tool() && AV.bag.count('sk_bucket')) AV.bag.equip('sk_bucket'); SK.refill(false) } });
  return g }
function stall(W, x, z) { const y = W.surface(x, z) || 0, g = new THREE.Group(); g.position.set(x, y, z);
  const tbl = new THREE.Mesh(AV.G.box, AV.std(0xf4f0e4, .7)); tbl.scale.set(1.8, .08, .7); tbl.position.y = .85; g.add(tbl); for (const s of [-1, 1]) { const l = new THREE.Mesh(AV.G.box, AV.std(0x3a3a3a, .6)); l.scale.set(.06, .85, .06); l.position.set(s * .8, .42, 0); g.add(l) }
  const can = new THREE.Mesh(AV.G.box, AV.std(0xff4ad2, .6)); can.scale.set(2, .06, 1.1); can.position.y = 2.1; g.add(can); [[-.6, 0xff4ad2], [0, 0x3ac8ff], [.6, 0x7aff8a]].forEach(([dx, c]) => { const o = new THREE.Mesh(AV.G.box, AV.std(c, .4)); o.scale.set(.25, .2, .2); o.position.set(dx, 1, 0); g.add(o) });
  AV.lin(g); W.group.add(g); W.circles.push([x, z, 1]);
  W.T.push({ x, z: z + 1.2, r: 2, label: () => tr('🔫 Songkran stall: water guns, buckets, squeeze bottles', '🔫 Puesto de Songkran: pistolas, cubos, botellas'), fn: () => {
    const p = AV.panel('cmp', '<b>' + tr('Songkran stall', 'Puesto de Songkran') + '</b><div class="note">' + tr('Sawasdee pee mai! Everything comes filled.', '¡Sawasdee pee mai! Todo viene lleno.') + '</div><div class="grid">' + Object.keys(TOOLS).map(id => '<button data-sk="' + id + '">' + TOOLS[id].ic + ' ' + say(TOOLS[id].n) + '<small>' + TOOLS[id].price + tr(' credits', ' créditos') + (AV.bag.count(id) ? tr(' · you have one', ' · ya tienes') : '') + '</small></button>').join('') + '</div><button data-close>' + tr('Close', 'Cerrar') + '</button>');
    p.querySelectorAll('[data-sk]').forEach(b => b.onclick = () => { const id = b.dataset.sk; if (AV.bag.count(id)) { AV.bag.equip(id); AV.closePanel('cmp'); return AV.toast(tr('You already have one: now in your hand.', 'Ya tienes una: ahora en tu mano.')) } if (!AV.txn(-TOOLS[id].price, say(TOOLS[id].n))) return; AV.bag.add(id, 1, true); S0().fill[id] = 100; AV.bag.equip(id); AV.closePanel('cmp'); AV.toast(TOOLS[id].ic + ' ' + say(TOOLS[id].n) + tr(' — in your hand, full. ', ' — en tu mano, lleno. ') + say(TOOLS[id].say)) }) } });
}
SK.tubs = [];
const prevEnter = AV.onWorldEnter; AV.onWorldEnter = function (W) { if (prevEnter) prevEnter(W); SK.spraying = false; SK.anim = null; SK.tubs = []; if (W.id !== 'chiang_mai' || !AV.cm || !AV.cm.sk) return;
  try { const K = AV.cm.sk, spots = [[18, 44.2, 1], [9.5, 45, 0], [27, 45, 0], [3, 40, 1]].concat(K.BARRELS.map(b => [b[0] + 1.8, b[1] + 1.2, 0]));
    for (const [x, z, big] of spots) { const s = freeNear(W, x, z, big ? 1.3 : .9); if (s) { tub(W, s[0], s[1], big); SK.tubs.push(s) } }
    const st = freeNear(W, 13, 44, 1.2); if (st) { stall(W, st[0], st[1]); SK.stall = st }
    const S = S0(); if (!S.told) { S.told = 1; AV.toast(tr('Songkran! Grab a free bucket at a blue tub (or a water gun at the stall), then click to splash. Refill at the tubs.', '¡Songkran! Coge un cubo gratis en una tina azul (o una pistola en el puesto) y haz clic para salpicar. Recarga en las tinas.')) }
  } catch (e) { console.warn('songkran tubs', e) } };
})(window.AV);
