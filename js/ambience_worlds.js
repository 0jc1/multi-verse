/* APEVERSE 2.0 - ambience_worlds.js : M13 ambient sound for the worlds that had none (Ape Town, Verdalux, Jungle Dub, Chiang Mai,
   Jerusalem, Judean Desert, Vienna, Da Nang, Koh Samui).  Procedural Web Audio through AV.amb (ambience.js): no sound files.
   Each world gets a preset of layers whose level follows WHERE you are (distance to that world's own places, matched by id or
   name: its market, river, beach, temple, stage...) and WHEN (day / night).  Worlds that start their own ambience (Madrid, Pai,
   Koh Tao, Astro-9) are left alone.  Jerusalem is kept neutral on purpose: market, doves, footsteps on stone, wind.
   AV.ambWorlds = { presets, zone(), stats } */
'use strict';
(function (AV) {
const A2 = () => AV.amb, rnd = Math.random;
const AW = AV.ambWorlds = { stats: {} };
const hour = () => (AV.S.time / 60) % 24, night = () => { const h = hour(); return h >= 19.5 || h < 5.5 }, day = () => !night();
/* distance zones from the world's own places */
const match = (W, re) => (W.places || []).filter(p => re.test(p.id + ' ' + (Array.isArray(p.name) ? p.name.join(' ') : p.name || '')));
AW.zone = (W, re, r) => { const P = AV.P, ps = match(W, re); let k = 0; for (const p of ps) k = Math.max(k, 1 - Math.hypot(P.x - p.x, P.z - p.z) / r); return Math.max(0, k) };
const Z = (re, r) => () => AV.W ? AW.zone(AV.W, re, r) : 0;
/* ---------- generators (layer factories) ---------- */
const T = (c, o, t, f, d, type, g, glide) => A2().tone(c, o, t, f, d, type, g, glide), H = (c, o, t, d, g, hp, lp) => A2().hit(c, o, t, d, g, hp, lp);
const G = {
  wind: (vol, gain) => ({ loop: { filters: [['lowpass', 420], ['highpass', 60]], lfo: [.09, .6] }, vol, gain }),
  waves: (vol, gain) => ({ loop: { filters: [['lowpass', 760], ['highpass', 90]], lfo: [.12, .65] }, vol, gain }),
  river: (vol, gain) => ({ loop: { filters: [['lowpass', 1400], ['highpass', 320]], lfo: [.35, .25] }, vol, gain }),
  fountain: (vol, gain) => ({ loop: { filters: [['highpass', 1500], ['lowpass', 6500]], lfo: [.6, .2] }, vol, gain }),
  cicadas: (vol, gain) => ({ loop: { filters: [['bandpass', 4600, 7]], lfo: [5.5, .8] }, vol, gain }),
  crowd: (vol, gain) => ({ loop: { filters: [['bandpass', 900, .8]], lfo: [1.3, .7] }, vol, gain }),
  traffic: (vol, gain) => ({ loop: { filters: [['lowpass', 300], ['highpass', 40]], lfo: [.25, .35] }, vol, gain }),
  hum: (vol, gain, f) => ({ loop: { filters: [['bandpass', f || 220, 10]], lfo: [.18, .5] }, vol, gain }),
  crickets: (vol, gain) => ({ vol, gain, tick: (c, t, o) => { const f = 4200 + rnd() * 600; for (let i = 0; i < 3; i++) T(c, o, t + i * .07, f, .04, 'sine', .05); return t + .35 + rnd() * .5 } }),
  birds: (vol, gain, lo, hi) => ({ vol, gain, tick: (c, t, o) => { const f = (lo || 2200) + rnd() * ((hi || 4600) - (lo || 2200)); for (let i = 0; i < 2 + (rnd() * 3 | 0); i++) T(c, o, t + i * .11, f * (1 + i * .06), .09, 'sine', .07, 1.25); return t + 1.2 + rnd() * 3.2 } }),
  doves: (vol, gain) => ({ vol, gain, tick: (c, t, o) => { [0, .32, .5].forEach((d, i) => T(c, o, t + d, i === 1 ? 420 : 380, .26, 'sine', .08, .88)); return t + 4 + rnd() * 6 } }),
  gulls: (vol, gain) => ({ vol, gain, tick: (c, t, o) => { for (let i = 0; i < 2 + (rnd() * 2 | 0); i++) T(c, o, t + i * .28, 1500 + rnd() * 300, .24, 'triangle', .05, .55); return t + 6 + rnd() * 9 } }),
  frogs: (vol, gain) => ({ vol, gain, tick: (c, t, o) => { for (let i = 0; i < 3; i++) T(c, o, t + i * .09, 190 + rnd() * 40, .06, 'square', .05, .8); return t + .6 + rnd() * 1.6 } }),
  horns: (vol, gain, f) => ({ vol, gain, tick: (c, t, o) => { if (rnd() < .6) { const b = f || 520; T(c, o, t, b, .18, 'sawtooth', .035, .98); if (rnd() < .4) T(c, o, t + .24, b, .14, 'sawtooth', .03, .98) } return t + 4 + rnd() * 7 } }),
  scooters: (vol, gain) => ({ vol, gain, tick: (c, t, o) => { const f = 90 + rnd() * 40, d = 1.6 + rnd(); for (let i = 0; i < 24; i++) T(c, o, t + i * d / 24, f * (1 + .25 * Math.sin(i / 24 * Math.PI)), d / 24, 'sawtooth', .025 * Math.sin(i / 24 * Math.PI), 1); return t + 2.5 + rnd() * 5 } }),
  tram: (vol, gain) => ({ vol, gain, tick: (c, t, o) => { T(c, o, t, 1320, .35, 'triangle', .06); T(c, o, t + .2, 1320, .35, 'triangle', .05); return t + 22 + rnd() * 30 } }),
  bells: (vol, gain) => ({ vol, gain, tick: (c, t, o) => { const m = AV.S.time % 60; if (m < 3) { for (let i = 0; i < 4; i++) { T(c, o, t + i * 1.4, 392, 2.4, 'sine', .07); T(c, o, t + i * 1.4, 784.6, 1.4, 'sine', .025) } return t + 12 } return t + 2 } }),   /* on the game hour */
  gong: (vol, gain) => ({ vol, gain, tick: (c, t, o) => { T(c, o, t, 98, 5, 'sine', .12, .97); T(c, o, t, 196.7, 3, 'sine', .04, .99); return t + 18 + rnd() * 22 } }),
  chimes: (vol, gain) => ({ vol, gain, tick: (c, t, o) => { const s = [784, 880, 1047, 1175, 1319]; for (let i = 0; i < 3; i++) T(c, o, t + i * .22, s[rnd() * 5 | 0], 1.6, 'sine', .035); return t + 3 + rnd() * 5 } }),
  drums: (vol, gain, bpm) => ({ vol, gain, tick: (c, t, o) => { const s = Math.round(t * (bpm || 96) / 60) % 8; if ([1, 0, 0, 1, 0, 1, 0, 0][s] || rnd() < .12) T(c, o, t, s % 3 ? 210 : 140, .14, 'sine', .14, .7); return t + 60 / (bpm || 96) / 2 } }),
  fire: (vol, gain) => ({ vol, gain, tick: (c, t, o) => { H(c, o, t, .03 + rnd() * .04, .06 + rnd() * .05, 1800, 7000); return t + .06 + rnd() * .3 } }),
  steps: (vol, gain) => ({ vol, gain, tick: (c, t, o) => { const sp = Math.hypot(AV.P.vx || 0, AV.P.vz || 0); if (sp > .8) { H(c, o, t, .04, .07, 500, 3000); return t + (sp > 5 ? .28 : .45) } return t + .2 } }),   /* your own steps on stone */
  dino: (vol, gain) => ({ vol, gain, tick: (c, t, o) => { if (rnd() < .5) { T(c, o, t, 78, 2.6, 'sawtooth', .05, .7); T(c, o, t, 156, 2, 'triangle', .02, .7) } else { T(c, o, t, 1700, .7, 'sawtooth', .025, .45) } return t + 9 + rnd() * 14 } }),
  clinks: (vol, gain) => ({ vol, gain, tick: (c, t, o) => { H(c, o, t, .02, .05, 3500, 9000); return t + .4 + rnd() * 1.6 } }) };
AW.G = G;
/* ---------- presets ---------- */
const P = AW.presets = {
  ape_town: () => ({ birds: G.birds(.45, () => day() ? .7 : .05), crickets: G.crickets(.4, () => night() ? .8 : 0), crowd: G.crowd(.3, () => .25 + Z(/plaza|stage|food|finca/i, 45)() * .6), falls: G.river(.55, Z(/falls/i, 55)), fountain: G.fountain(.35, Z(/plaza/i, 25)), chimes: G.chimes(.4, Z(/crystal|grove/i, 40)), gong: G.gong(.5, Z(/temple|asia/i, 60)), wind: G.wind(.25, () => .35) }),
  verdalux: () => ({ hum: G.hum(.35, () => .6, 180), chimes: G.chimes(.45, () => .7), frogs: G.frogs(.35, () => .5), wind: G.wind(.3, () => .5), drums: G.drums(.5, Z(/drum/i, 40), 84) }),
  jungle_dub: () => ({ cicadas: G.cicadas(.25, () => day() ? .6 : .15), birds: G.birds(.5, () => day() ? .8 : .1, 1800, 3800), crickets: G.crickets(.4, () => night() ? .8 : 0), frogs: G.frogs(.45, () => night() ? .6 + Z(/river/i, 60)() * .4 : Z(/river/i, 50)() * .4), river: G.river(.5, Z(/river|riverbar/i, 55)), crowd: G.crowd(.3, Z(/bazaar|sound|dub/i, 50)), wind: G.wind(.2, () => .3) }),
  chiang_mai: () => ({ scooters: G.scooters(.4, () => .45 + Z(/gate|bazaar/i, 60)() * .5), traffic: G.traffic(.4, () => .4), horns: G.horns(.35, () => day() ? .5 : .2, 620), crowd: G.crowd(.35, () => Z(/bazaar|gate|hostel|blues|chat/i, 50)() * (night() ? 1 : .6) + .15), gong: G.gong(.5, Z(/luang|temple/i, 70)), birds: G.birds(.35, () => day() ? .5 : 0), crickets: G.crickets(.35, () => night() ? .6 : 0), river: G.river(.45, Z(/river/i, 50)) }),
  jerusalem: () => ({ crowd: G.crowd(.4, () => .2 + Z(/shuk|souk|jaffa|damascus|mamilla/i, 50)() * .8), clinks: G.clinks(.35, Z(/shuk|souk/i, 40)), doves: G.doves(.45, () => day() ? .4 + Z(/wall|dome|zion|olives/i, 70)() * .5 : 0), steps: G.steps(.5, () => 1), wind: G.wind(.25, () => .35), crickets: G.crickets(.3, () => night() ? .5 : 0) }),
  judean_desert: () => ({ wind: G.wind(.55, () => .75), waves: G.waves(.4, Z(/beach/i, 70)), fire: G.fire(.45, () => Z(/camp/i, 30)() * (night() ? 1 : .4)), crickets: G.crickets(.3, () => night() ? .6 : 0), birds: G.birds(.25, () => Z(/oasis/i, 60)() * (day() ? 1 : 0), 2600, 4200) }),
  vienna: () => ({ traffic: G.traffic(.4, () => day() ? .55 : .3), tram: G.tram(.45, () => .6), bells: G.bells(.45, () => .55), crowd: G.crowd(.35, () => .2 + Z(/market|markt|platz|graben|square|zuckerl|cafe|café/i, 50)() * .7), birds: G.birds(.3, () => day() ? .5 : 0, 2800, 5200), fountain: G.fountain(.3, Z(/platz|fountain|brunnen|park/i, 30)), steps: G.steps(.35, () => .7) }),
  da_nang: () => ({ waves: G.waves(.6, () => .25 + Z(/beach/i, 120)() * .75), gulls: G.gulls(.4, Z(/beach|han|love/i, 100)), scooters: G.scooters(.45, () => .3 + Z(/dragon|han|con|night|cafe/i, 80)() * .6), horns: G.horns(.35, () => day() ? .45 : .25, 580), crowd: G.crowd(.35, Z(/con|night|market|cafe/i, 60)), bells: G.bells(.35, Z(/cathedral/i, 120)), crickets: G.crickets(.3, () => night() ? .5 : 0) }),
  koh_samui_jurassic: () => ({ dino: G.dino(.55, () => .7), waves: G.waves(.5, () => .3 + Z(/lagoon|cliffs|gate/i, 90)() * .6), river: G.river(.5, Z(/canyon/i, 70)), cicadas: G.cicadas(.3, () => day() ? .7 : .2), birds: G.birds(.35, () => day() ? .5 : .05, 1500, 3200), frogs: G.frogs(.4, () => night() ? .7 : .1), chimes: G.chimes(.4, Z(/crystal/i, 50)), wind: G.wind(.3, Z(/canopy|cliffs/i, 80)) }) };
/* ---------- start / stop with the world ---------- */
let mine = false;
function start(W) { const A = AV.amb; if (!A || !AV.audio || !AV.audio.ok || A.on) return false; const p = P[W.id]; if (!p) return false; const ok = A.start(p()); if (ok) { mine = true; AW.stats.world = W.id; AW.stats.layers = Object.keys(A.L).length } return ok }
const prevEnter = AV.onWorldEnter; AV.onWorldEnter = function (W) { if (prevEnter) prevEnter(W); mine = false; if (!W || !W.ctx || !P[W.id]) return;
  W.ctx.upd.push(() => { if (!mine && AV.W === W && !(AV.amb && AV.amb.on)) start(W) });   /* after the world's own build: worlds with their own ambience keep it */
  W.ctx.leave.push(() => { if (mine && AV.amb) AV.amb.stop(); mine = false }) };
AW.active = () => mine;
})(window.AV);
