/* APEVERSE V0.9.5 - effects.js : gradual audiovisual effects from drinks, smoking and psychedelic / alien items.
   Each dose ramps in, holds and fades out smoothly (minutes, not seconds). Levels per type stack (capped).
   Output: CSS filter on the 3D canvas (hue / saturation / contrast / blur), a coloured vignette, gentle camera sway and FOV breathing
   (disabled by "reduced motion"), and a low-pass on the whole mix. Settings: intensity, duration, instant reset (X). */
'use strict';
(function (AV) {
const FX = AV.fx = { list: [] };
const BASE = { drink: 150, smoke: 330, psy: 300, buzz: 90, glow: 140, float: 120, dash: 90 };   /* 2.2: float (alien low gravity) + dash (alien speed) */            /* V0.9.7: smoke lasts longer (~5.5 min), drinks a bit longer */            // seconds at duration 1×
const set = () => { const S = AV.S.set; if (S.fxInt == null) S.fxInt = .7; if (S.fxDur == null) S.fxDur = 1; return S };
const sstep = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
FX.add = function (type, amt) {
  if (type === 'sober') { FX.list.forEach(e => { if (e.type === 'drink') e.amt *= (1 - amt) }); return }
  const d = BASE[type] * set().fxDur;
  /* V0.9.7: drinks stack harder (each extra drink in the last minutes counts more) and tell you how you feel */
  if (type === 'drink') { const n = FX.list.filter(e => e.type === 'drink').length; amt *= 1 + .3 * n; const msg = [[0, 'Tipsy. Everything is a bit funnier.', 'Achispado. Todo es un poco más gracioso.'], [2, 'Drunk. The floor has opinions now.', 'Borracho. El suelo ahora tiene opiniones.'], [4, 'Very drunk. Maybe some water (it sobers you up)?', 'Muy borracho. ¿Quizás agua (te despeja)?']].filter(m => n >= m[0]).pop(); if (msg && (n === 0 || n === 2 || n === 4)) setTimeout(() => AV.toast && AV.toast('🍺 ' + AV.tr(msg[1], msg[2])), 4500) }
  FX.list.push({ type, amt, t0: AV.now(), inT: Math.min(12, d * .12), dur: d });
};
/* 2.2 (Agent 3): one drag / sip / bite = a small dose added to the SAME session entry (key). A beer drunk in 6 sips counts as one drink
   for the stacking rule, ramps in gradually, and the session lasts from the last dose. */
FX.dose = function (type, amt, key) {
  if (type === 'sober') return FX.add('sober', amt);
  const now = AV.now(), e = key && FX.list.find(x => x.key === key && x.type === type && now - x.t0 < x.dur * .5);
  if (!e) { FX.add(type, amt); const ne = FX.list[FX.list.length - 1]; if (ne) ne.key = key; return }
  const t = now - e.t0; e.amt += amt; e.inT = Math.max(e.inT, Math.min(t + 10, e.dur * .3)); e.dur = Math.max(e.dur, t + BASE[type] * set().fxDur * .85);
};
FX.reset = function () { FX.list.length = 0; apply(true); AV.toast && AV.toast(AV.tr('Effects cleared. Clear head, clear eyes.', 'Efectos eliminados. Cabeza despejada, ojos claros.')) };
FX.level = function (type) { const now = AV.now(); let v = 0; for (const e of FX.list) { if (e.type !== type) continue; const t = now - e.t0, out = e.dur * .45; v += e.amt * sstep(t / e.inT) * (t < e.dur - out ? 1 : sstep((e.dur - t) / out)) } return Math.min(1.2, v * set().fxInt * 1.4) };
/* M12: raw dose level (independent of the visual intensity slider and of 'no intoxication visuals'): used for gameplay rules like no impaired driving */
FX.raw = function (type) { const now = AV.now(); let v = 0; for (const e of FX.list) { if (type && e.type !== type) continue; const t = now - e.t0, out = e.dur * .45; v += e.amt * sstep(t / e.inT) * (t < e.dur - out ? 1 : sstep((e.dur - t) / out)) } return v };
FX.impaired = () => FX.raw('drink') > .3 || FX.raw('smoke') > .3 || FX.raw('psy') > .15 || FX.raw('glow') > .5;
FX.active = () => FX.list.map(e => ({ type: e.type, left: Math.max(0, Math.round(e.dur - (AV.now() - e.t0))) })).filter(e => e.left > 0);
let vig = null, lastF = '', fovOn = false; const G = {};   /* G: rate-limited filter state */
function apply(force) {
  const now = AV.now(); FX.list = FX.list.filter(e => now - e.t0 < e.dur);
  const c = AV.$('c'), red = AV.S.set.reduce || AV.S.set.noFlash; if (!vig) vig = AV.$('fxv');
  const L = { drink: FX.level('drink'), smoke: FX.level('smoke'), psy: FX.level('psy'), buzz: FX.level('buzz'), glow: FX.level('glow'), float: FX.level('float'), dash: FX.level('dash') }, t = now; FX.L = L;
  body();   /* movement abilities run even with the visuals off: they are gameplay, not visuals */
  const any = !AV.S.set.noIntox && L.drink + L.smoke + L.psy + L.buzz + L.glow + L.float + L.dash > .005;   /* V1.0: "Disable intoxication visuals" — timers keep running, screen stays clean */
  if (!any) { G.hue = G.sat = G.con = G.bri = null; if (lastF || force) { c.style.filter = ''; lastF = ''; if (vig) vig.style.opacity = 0; if (fovOn) { AV.cam.fov = 72; AV.cam.updateProjectionMatrix(); fovOn = false } AV.cam.rotation.z = 0; if (AV.audio && AV.audio.tone) AV.audio.tone.frequency.value = 20000 } kal(0, now); return }
  const hue = red ? L.psy * 40 + L.glow * 12 + L.smoke * 10 : L.psy * Math.sin(t * .12) * 150 + L.glow * 25 * Math.sin(t * .2) + L.smoke * 9 * Math.sin(t * .07) - L.smoke * 6 + L.float * 30 * Math.sin(t * .15);   /* 2.2: cannabis = warmer (toward amber), only a slight drift */
  const sat = 1 + L.smoke * .45 + L.psy * 1.0 + L.buzz * .25 + L.glow * .3 + L.dash * .2, con = 1 + L.psy * .12 + L.buzz * .08, bri = 1 + L.smoke * .05 + L.glow * .06 - L.drink * .04;
  const blur = L.drink * 1.3 + L.smoke * .3, sep = Math.min(.35, L.smoke * .28);   /* sepia: the warm, soft cannabis look */
  /* M12 photosensitivity guard: whatever the dose or settings, the filter can only drift slowly (no flicker, no flashes) */
  const dt0 = Math.min(.25, Math.max(0, now - (G.t || now))); G.t = now; const lim = (k, v, perS) => { if (G[k] == null) G[k] = v;   /* even a forced refresh drifts: the guard never jumps */ else G[k] += Math.max(-perS * dt0, Math.min(perS * dt0, v - G[k])); return G[k] };
  const hueS = lim('hue', hue, 24), satS = lim('sat', sat, .25), conS = lim('con', con, .08), briS = lim('bri', bri, .05); FX.guard = { t: now, hue: hueS, sat: satS, con: conS, bri: briS };
  const f = 'hue-rotate(' + hueS.toFixed(1) + 'deg) saturate(' + satS.toFixed(2) + ') contrast(' + conS.toFixed(2) + ') brightness(' + briS.toFixed(2) + ')' + (sep > .01 ? ' sepia(' + sep.toFixed(2) + ')' : '') + (blur > .05 ? ' blur(' + blur.toFixed(2) + 'px)' : '');
  if (f !== lastF) { c.style.filter = f; lastF = f }
  if (vig) { const o = Math.min(.85, L.smoke * .5 + L.psy * .6 + L.drink * .35 + L.glow * .4); vig.style.opacity = o.toFixed(3); const h = (t * 12) % 360; vig.style.background = 'radial-gradient(ellipse at 50% 50%, transparent 45%, ' + (L.psy > L.smoke ? 'hsla(' + h.toFixed(0) + ',90%,55%,.55)' : L.glow > L.smoke ? 'rgba(90,255,160,.4)' : L.float > L.smoke ? 'rgba(120,170,255,.4)' : L.dash > L.smoke ? 'rgba(255,220,90,.35)' : L.drink > L.smoke ? 'rgba(60,40,30,.5)' : 'rgba(255,160,90,.45)') + ' 100%)' }
  kal(L.psy, now);
  if (!AV.S.set.reduce) { AV.cam.rotation.z += (L.drink * .07 * Math.sin(t * .9) + L.drink * .03 * Math.sin(t * 2.3) + L.psy * .035 * Math.sin(t * .37) + L.smoke * .022 * Math.sin(t * .45)); AV.cam.rotation.x += L.drink * .025 * Math.sin(t * .7) + L.smoke * .01 * Math.sin(t * .31); const fov = 72 + L.psy * 9 * Math.sin(t * .25) + L.smoke * (4 + 1.5 * Math.sin(t * .2)) + L.drink * 3 * Math.sin(t * .6); if (Math.abs(fov - AV.cam.fov) > .01) { AV.cam.fov = fov; AV.cam.updateProjectionMatrix(); fovOn = true } }
  else if (fovOn) { AV.cam.fov = 72; AV.cam.updateProjectionMatrix(); fovOn = false }
  if (AV.audio && AV.audio.tone) AV.audio.tone.frequency.value = 20000 * Math.pow(1 - Math.min(.82, L.smoke * .55 + L.drink * .45 + L.psy * .35 + L.glow * .2), 2.2) + 400;
}
FX.refresh = () => apply(true);
AV.frameFns.push(() => apply(false));
/* 2.2: what the effects do to your body (gameplay; never while driving). Cannabis: a slower, relaxed walk. Alcohol: a bit slower too
   (plus the stagger below). Alien float: lighter gravity and higher jumps. Alien dash: faster legs. Read by core.js. */
function body() { const drv = !!AV.drive, f = FX.raw('float'), d = FX.raw('dash'), sm = FX.raw('smoke'), dr = FX.raw('drink');
  AV.speedMul = drv ? 1 : Math.max(.75, 1 - Math.min(.12, sm * .14) - Math.min(.1, dr * .1)) * (1 + Math.min(.45, d * .6));
  AV.gravMul = drv ? 1 : 1 - Math.min(.6, f * .75); AV.jumpMul = drv ? 1 : 1 + Math.min(.5, f * .6) }
/* 2.2: fictional psychedelic items: a soft geometric overlay (a slowly turning mandala). Low opacity, rate-limited, never flashes;
   frozen with reduced motion; off with "no intoxication visuals". Drawn small (192 px) and only while active. */
let KC = null, kx = null, kO = 0, kT = 0, kF = 0;
function kal(l, now) {
  if (AV.S.set.noIntox) l = 0;
  if (l < .03 && kO < .002) { if (KC && KC.style.display !== 'none') KC.style.display = 'none'; kO = 0; return }
  if (!KC) { KC = document.createElement('canvas'); KC.width = KC.height = 192; KC.id = 'fxk'; Object.assign(KC.style, { position: 'fixed', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none', mixBlendMode: 'soft-light', zIndex: 3, opacity: 0 }); document.body.appendChild(KC); kx = KC.getContext('2d') }
  KC.style.display = 'block'; const red = AV.S.set.reduce, target = Math.min(red ? .12 : .3, l * (red ? .12 : .32)), dt = Math.min(.25, Math.max(0, now - (kT || now))); kT = now;
  kO += Math.max(-.06 * dt, Math.min(.06 * dt, target - kO)); KC.style.opacity = kO.toFixed(3);
  if (++kF % 3) return; const c = kx, s = 192, rot = red ? 0 : now * .05, hue = red ? 200 : (now * 4) % 360;
  c.clearRect(0, 0, s, s); c.save(); c.translate(s / 2, s / 2); c.rotate(rot);
  for (let k = 0; k < 12; k++) { c.rotate(Math.PI / 6); for (let r = 1; r <= 4; r++) { c.beginPath(); c.ellipse(r * 15, 0, r * 7, r * 2.6, 0, 0, Math.PI * 2); c.strokeStyle = 'hsla(' + ((hue + r * 40 + k * 8) % 360).toFixed(0) + ',85%,62%,.9)'; c.lineWidth = 2.2; c.stroke() } }
  c.restore() }
FX.kal = () => ({ on: !!KC && KC.style.display !== 'none', o: kO });
/* V0.9.7: drunk walking — a gentle sideways stagger while you move (off with reduced motion) */
AV.frameFns.push((dt, t) => { if (!AV.W || AV.blocking() || AV.S.set.reduce || AV.S.set.noIntox) return; const L = FX.level('drink'); if (L < .12) return; const P = AV.P, sp = Math.hypot(P.vx, P.vz); if (sp < .5) return; const k = Math.sin(t * .8) * Math.sin(t * .37 + 1) * L * 1.6 * dt * Math.min(1, sp / 4), x = P.x + Math.cos(P.yaw) * k, z = P.z - Math.sin(P.yaw) * k, r = AV.resolve(AV.W, x, z, .4); if (AV.W.surface(r[0], r[1]) !== null) { P.x = r[0]; P.z = r[1] } });
AV.keymap.KeyX = () => FX.reset();
})(window.AV);
