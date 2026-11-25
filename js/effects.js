/* APEVERSE V0.9.5 - effects.js : gradual audiovisual effects from drinks, smoking and psychedelic / alien items.
   Each dose ramps in, holds and fades out smoothly (minutes, not seconds). Levels per type stack (capped).
   Output: CSS filter on the 3D canvas (hue / saturation / contrast / blur), a coloured vignette, gentle camera sway and FOV breathing
   (disabled by "reduced motion"), and a low-pass on the whole mix. Settings: intensity, duration, instant reset (X). */
'use strict';
(function (AV) {
const FX = AV.fx = { list: [] };
const BASE = { drink: 150, smoke: 330, psy: 300, buzz: 90, glow: 140 };            /* V0.9.7: smoke lasts longer (~5.5 min), drinks a bit longer */            // seconds at duration 1×
const set = () => { const S = AV.S.set; if (S.fxInt == null) S.fxInt = .7; if (S.fxDur == null) S.fxDur = 1; return S };
const sstep = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
FX.add = function (type, amt) {
  if (type === 'sober') { FX.list.forEach(e => { if (e.type === 'drink') e.amt *= (1 - amt) }); return }
  const d = BASE[type] * set().fxDur;
  /* V0.9.7: drinks stack harder (each extra drink in the last minutes counts more) and tell you how you feel */
  if (type === 'drink') { const n = FX.list.filter(e => e.type === 'drink').length; amt *= 1 + .3 * n; const msg = [[0, 'Tipsy. Everything is a bit funnier.', 'Achispado. Todo es un poco más gracioso.'], [2, 'Drunk. The floor has opinions now.', 'Borracho. El suelo ahora tiene opiniones.'], [4, 'Very drunk. Maybe some water (it sobers you up)?', 'Muy borracho. ¿Quizás agua (te despeja)?']].filter(m => n >= m[0]).pop(); if (msg && (n === 0 || n === 2 || n === 4)) setTimeout(() => AV.toast && AV.toast('🍺 ' + AV.tr(msg[1], msg[2])), 4500) }
  FX.list.push({ type, amt, t0: AV.now(), inT: Math.min(12, d * .12), dur: d });
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
  const L = { drink: FX.level('drink'), smoke: FX.level('smoke'), psy: FX.level('psy'), buzz: FX.level('buzz'), glow: FX.level('glow') }, t = now;
  const any = !AV.S.set.noIntox && L.drink + L.smoke + L.psy + L.buzz + L.glow > .005;   /* V1.0: "Disable intoxication visuals" — timers keep running, screen stays clean */
  if (!any) { G.hue = G.sat = G.con = G.bri = null; if (lastF || force) { c.style.filter = ''; lastF = ''; if (vig) vig.style.opacity = 0; if (fovOn) { AV.cam.fov = 72; AV.cam.updateProjectionMatrix(); fovOn = false } AV.cam.rotation.z = 0; if (AV.audio && AV.audio.tone) AV.audio.tone.frequency.value = 20000 } return }
  const hue = red ? L.psy * 40 + L.glow * 12 + L.smoke * 10 : L.psy * Math.sin(t * .12) * 150 + L.glow * 25 * Math.sin(t * .2) + L.smoke * 28 * Math.sin(t * .07);   /* V0.9.7: weed = slow, mellow colour drift */
  const sat = 1 + L.smoke * .6 + L.psy * 1.0 + L.buzz * .25 + L.glow * .3, con = 1 + L.psy * .12 + L.buzz * .08, bri = 1 + L.smoke * .05 + L.glow * .06 - L.drink * .04;
  const blur = L.drink * 1.3 + L.smoke * .35;
  /* M12 photosensitivity guard: whatever the dose or settings, the filter can only drift slowly (no flicker, no flashes) */
  const dt0 = Math.min(.25, Math.max(0, now - (G.t || now))); G.t = now; const lim = (k, v, perS) => { if (G[k] == null) G[k] = v;   /* even a forced refresh drifts: the guard never jumps */ else G[k] += Math.max(-perS * dt0, Math.min(perS * dt0, v - G[k])); return G[k] };
  const hueS = lim('hue', hue, 24), satS = lim('sat', sat, .25), conS = lim('con', con, .08), briS = lim('bri', bri, .05); FX.guard = { hue: hueS, sat: satS, con: conS, bri: briS };
  const f = 'hue-rotate(' + hueS.toFixed(1) + 'deg) saturate(' + satS.toFixed(2) + ') contrast(' + conS.toFixed(2) + ') brightness(' + briS.toFixed(2) + ')' + (blur > .05 ? ' blur(' + blur.toFixed(2) + 'px)' : '');
  if (f !== lastF) { c.style.filter = f; lastF = f }
  if (vig) { const o = Math.min(.85, L.smoke * .5 + L.psy * .6 + L.drink * .35 + L.glow * .4); vig.style.opacity = o.toFixed(3); const h = (t * 12) % 360; vig.style.background = 'radial-gradient(ellipse at 50% 50%, transparent 45%, ' + (L.psy > L.smoke ? 'hsla(' + h.toFixed(0) + ',90%,55%,.55)' : L.glow > L.smoke ? 'rgba(90,255,160,.4)' : L.drink > L.smoke ? 'rgba(60,40,30,.5)' : 'rgba(255,160,90,.45)') + ' 100%)' }
  if (!AV.S.set.reduce) { AV.cam.rotation.z += (L.drink * .07 * Math.sin(t * .9) + L.drink * .03 * Math.sin(t * 2.3) + L.psy * .035 * Math.sin(t * .37) + L.smoke * .022 * Math.sin(t * .45)); AV.cam.rotation.x += L.drink * .025 * Math.sin(t * .7) + L.smoke * .01 * Math.sin(t * .31); const fov = 72 + L.psy * 9 * Math.sin(t * .25) + L.smoke * (4 + 1.5 * Math.sin(t * .2)) + L.drink * 3 * Math.sin(t * .6); if (Math.abs(fov - AV.cam.fov) > .01) { AV.cam.fov = fov; AV.cam.updateProjectionMatrix(); fovOn = true } }
  else if (fovOn) { AV.cam.fov = 72; AV.cam.updateProjectionMatrix(); fovOn = false }
  if (AV.audio && AV.audio.tone) AV.audio.tone.frequency.value = 20000 * Math.pow(1 - Math.min(.82, L.smoke * .55 + L.drink * .45 + L.psy * .35 + L.glow * .2), 2.2) + 400;
}
FX.refresh = () => apply(true);
AV.frameFns.push(() => apply(false));
/* V0.9.7: drunk walking — a gentle sideways stagger while you move (off with reduced motion) */
AV.frameFns.push((dt, t) => { if (!AV.W || AV.blocking() || AV.S.set.reduce || AV.S.set.noIntox) return; const L = FX.level('drink'); if (L < .12) return; const P = AV.P, sp = Math.hypot(P.vx, P.vz); if (sp < .5) return; const k = Math.sin(t * .8) * Math.sin(t * .37 + 1) * L * 1.6 * dt * Math.min(1, sp / 4), x = P.x + Math.cos(P.yaw) * k, z = P.z - Math.sin(P.yaw) * k, r = AV.resolve(AV.W, x, z, .4); if (AV.W.surface(r[0], r[1]) !== null) { P.x = r[0]; P.z = r[1] } });
AV.keymap.KeyX = () => FX.reset();
})(window.AV);
