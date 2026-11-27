/* APEVERSE 2.2 (Agent 3) - audio2.js : Immersive Sound 2.0. Built ON TOP of audio.js (MP3 playlists, DJ, positional stage) and
   ambience.js (procedural world beds) without replacing them. Everything here is additive and can be switched off (AV.snd.off()).
   1. Mixer: four categories with their own volume: Music (existing S.set.vm), Ambience (S.set.va), Effects (existing S.set.vs),
      Voices (S.set.vv). Buses: amb / sfx / voice / venue → mix → AV.audio.tone (the existing effects low-pass) → speakers.
   2. Acoustic spaces: indoor zones (bar, club, room, hall, cave) get a convolution reverb built from a procedural impulse response;
      walking in or out crossfades it (no pops). Indoors the outdoor ambience is muffled (low-pass), outdoors indoor sources are.
   3. Spatial emitters with occlusion: AV.snd.emitter({...}) → source → occlusion low-pass → gain → HRTF panner (equal-power on phones).
      Occlusion counts the walls (W.cols boxes) on the line between you and the source: each wall darkens and lowers the sound.
   4. Venue music: the world's positional MP3 (audio.js) is re-routed through the same occlusion chain, so a bar's live set is heard
      across the street, gets clearer as you approach, and the bass is muffled through walls. Chiang Mai: the set moves to Big Blues,
      opposite Giant Hostel. Only ONE track ever plays (venue music ducks with in-world media like before).
   5. Footsteps on stone, wood, dirt, grass, sand, water, metal and cloud (W.stepMat(x,z) if a world provides it, else per-world defaults).
   6. Traffic voices: the nearest moving NPC cars (traffic.js) get engine sounds by type (car, scooter, tuk-tuk, van, bus), pitch by speed;
      horns and occasional brake squeal are spatial.
   7. Place ambience: cafés, bars, markets, shops, fountains, rivers, workshops near you (from W.places) get a positional chatter / clink /
      water / machinery voice (a small pool reassigned to the nearest places).
   8. Sound effects library: AV.snd.fx(name) for lighter, inhale, exhale, gulp, crunch, fizz, clink, door, cash, coin, horn, brake, bell, ...
      If assets/sfx/manifest.json lists a licensed recording for a name, the file is used; otherwise a procedural synth.
   API for the world agents (docs/AUDIO_2.md): AV.snd.zone({ world, id, box:[x0,x1,z0,z1], space }) · AV.snd.place({ world, x, z, kind })
   · AV.snd.venue(worldId, { pos, bed, box, space }) · AV.snd.emitter({ x, y, z, gen, gain, ref, max }) · AV.snd.fx(name, { x, z }) ·
   W.stepMat(x, z) → 'stone' | 'wood' | ... · AV.snd.stats / AV.snd.state() for tests. */
'use strict';
(function (AV) {
const tr = AV.tr;
const SND = AV.snd = { on: true, stats: { fx: 0, steps: 0, occl: 0, horns: 0, brakes: 0, files: 0 }, zones: [], places: [], venues: {}, manifest: {} };
const phone = () => AV.device === 'phone';
let C = null, mix, amb, ambF, sfx, voice, venue, venF, verb, verbG, verbSend = {}, NB = null, ready = false;
const set = () => { const S = AV.S.set; if (S.va == null) S.va = .8; if (S.vv == null) S.vv = .9; return S };
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
function noiseBuf() { if (NB) return NB; const n = C.sampleRate * 2, b = C.createBuffer(1, n, C.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return NB = b }
function init() {
  const A = AV.audio; if (ready || !A || !A.ok || !A.ctx || !A.tone) return false; C = A.ctx;
  mix = C.createGain(); mix.connect(A.tone);
  amb = C.createGain(); ambF = C.createBiquadFilter(); ambF.type = 'lowpass'; ambF.frequency.value = 18000; amb.connect(ambF); ambF.connect(mix);
  sfx = C.createGain(); sfx.connect(mix); voice = C.createGain(); voice.connect(mix);
  venue = C.createGain(); venue.connect(mix);
  verb = C.createConvolver(); verbG = C.createGain(); verbG.gain.value = 0; verb.connect(verbG); verbG.connect(mix); verb.buffer = ir(1.2, 2.5);
  for (const [k, b] of [['sfx', sfx], ['venue', venue], ['voice', voice]]) { const g = C.createGain(); g.gain.value = k === 'venue' ? .6 : .35; b.connect(g); g.connect(verb); verbSend[k] = g }
  ready = true; vol(); return true;
}
/* procedural impulse response: stereo decaying noise, early reflections, damped highs */
function ir(sec, decay) { const n = Math.max(1, Math.round(C.sampleRate * sec)), b = C.createBuffer(2, n, C.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); let lp = 0; for (let i = 0; i < n; i++) { const t = i / n, w = (Math.random() * 2 - 1) * Math.pow(1 - t, decay); lp += (w - lp) * (.35 + .5 * (1 - t)); d[i] = lp * (i < C.sampleRate * .012 ? .2 : 1) }
    for (const er of [.011, .019, .027, .041]) { const j = Math.round(er * C.sampleRate * (ch ? 1.07 : 1)); if (j < n) d[j] += .5 } }
  return b }
const SPACES = { outdoor: { wet: 0, sec: 1, dec: 3 }, bar: { wet: .32, sec: 1.1, dec: 2.6 }, club: { wet: .42, sec: 1.6, dec: 2.2 }, room: { wet: .2, sec: .6, dec: 3.2 }, hall: { wet: .48, sec: 2.6, dec: 1.8 }, cave: { wet: .6, sec: 3.2, dec: 1.5 }, shop: { wet: .18, sec: .7, dec: 3 } };
function vol() { if (!ready) return; const S = set(), A = AV.audio, m = A.mute ? 0 : 1, t = C.currentTime;
  amb.gain.setTargetAtTime(m * S.va, t, .1); sfx.gain.setTargetAtTime(m * (S.vs == null ? .8 : S.vs), t, .1); voice.gain.setTargetAtTime(m * S.vv, t, .1);
  venue.gain.setTargetAtTime(m * (A.on ? (S.vm == null ? .8 : S.vm) * .55 : 0) * (1 - duckV), t, .25) }
SND.vol = vol;
/* in-world media (paintings, cinemas) already duck the world track; the venue bus follows the same duck */
let duckV = 0, mediaDuck = 0;
function hookDuck() { const A = AV.audio; if (!A || A.__sd22) return; const sd0 = A.setDuck; A.setDuck = v => { mediaDuck = v; duckV = clamp(v, 0, 1); sd0.call(A, v); vol() }; A.__sd22 = 1 }

/* ======================= sound effects (licensed recording if listed, else synth) ======================= */
const BUF = {};
fetch('assets/sfx/manifest.json').then(r => r.ok ? r.json() : null).then(j => { if (!j || !j.sounds) return; SND.manifest = j; for (const s of j.sounds) if (s.id && s.file) SND.manifest[s.id] = s }).catch(() => { });
function loadBuf(id) { const m = SND.manifest[id]; if (!m || BUF[id] !== undefined) return BUF[id]; BUF[id] = null; fetch(m.file).then(r => r.arrayBuffer()).then(a => C.decodeAudioData(a)).then(b => { BUF[id] = b; SND.stats.files++ }).catch(() => { BUF[id] = false }); return null }
function out(o) { /* destination for a one-shot: a panner when it has a world position, else the sfx bus */
  if (!o || o.x == null) return o && o.bus || sfx; const p = C.createPanner(); p.panningModel = phone() ? 'equalpower' : 'HRTF'; p.distanceModel = 'inverse'; p.refDistance = o.ref || 3; p.rolloffFactor = o.roll || 1.2; p.maxDistance = 200;
  setPos(p, o.x, o.y == null ? 1 : o.y, o.z); p.connect(o.bus || sfx); setTimeout(() => { try { p.disconnect() } catch (e) { } }, 4000); return p }
function setPos(p, x, y, z) { if (p.positionX) { p.positionX.value = x; p.positionY.value = y; p.positionZ.value = z } else p.setPosition(x, y, z) }
function nz(t, d, g, filt, dest, env) { const s = C.createBufferSource(); s.buffer = noiseBuf(); let last = s; for (const [type, f, Q, f2] of filt) { const fl = C.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + d); if (Q) fl.Q.value = Q; last.connect(fl); last = fl }
  const e = C.createGain(); env = env || [.005, d]; e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(g, t + env[0]); e.gain.exponentialRampToValueAtTime(.0005, t + env[1]); last.connect(e); e.connect(dest); s.start(t, Math.random() * Math.max(0, 1.9 - d)); s.stop(t + d + .05) }
function osc(t, f, d, type, g, dest, f2, a) { const o = C.createOscillator(), e = C.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d); e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(g, t + (a || .006)); e.gain.exponentialRampToValueAtTime(.0005, t + d); o.connect(e); e.connect(dest); o.start(t); o.stop(t + d + .05); return o }
const FXS = {
  lighter: (t, d) => { nz(t, .012, .5, [['highpass', 3000]], d); nz(t + .02, .07, .25, [['bandpass', 3200, 1.2]], d); nz(t + .1, 1.1, .07, [['bandpass', 1400, .6]], d, [.08, 1.1]) },
  inhale: (t, d, o) => { const D = (o && o.dur) || 1.3; nz(t, D, .1, [['bandpass', 700, .7, 1300]], d, [D * .7, D]); for (let k = 0; k < D * 11; k++) nz(t + .15 + Math.random() * (D - .2), .006, .12 + Math.random() * .1, [['highpass', 2800]], d) },
  breath: (t, d, o) => { const D = (o && o.dur) || 1.2; nz(t, D, .06, [['bandpass', 1600, .6]], d, [D * .6, D]) },
  exhale: (t, d) => nz(t, 1.6, .12, [['lowpass', 900, .5, 300]], d, [.08, 1.6]),
  bubble: (t, d, o) => { const D = (o && o.dur) || 1.8; for (let k = 0; k < D * 9; k++) { const tt = t + k / 9 + Math.random() * .05; osc(tt, 140 + Math.random() * 120, .07, 'sine', .14, d, 260 + Math.random() * 120) } nz(t, D, .04, [['bandpass', 900, .7]], d, [D * .6, D]) },
  gulp: (t, d) => { osc(t, 200, .13, 'sine', .22, d, 85); nz(t, .1, .06, [['lowpass', 500]], d) },
  fizz: (t, d) => { nz(t, .03, .4, [['highpass', 2500]], d); nz(t + .02, 1.1, .1, [['highpass', 5000]], d, [.01, 1.1]) },
  crunch: (t, d) => { for (let k = 0; k < 4; k++) nz(t + k * .06 + Math.random() * .02, .035, .26, [['bandpass', 2200 + Math.random() * 1500, 1.2]], d) },
  bite: (t, d) => { nz(t, .07, .18, [['lowpass', 1200]], d); nz(t + .25, .06, .08, [['lowpass', 900]], d) },
  clink: (t, d) => { osc(t, 2350, .45, 'sine', .08, d); osc(t, 3520, .3, 'sine', .05, d); osc(t + .07, 2900, .35, 'sine', .04, d) },
  stub: (t, d) => { nz(t, .16, .14, [['lowpass', 900]], d); nz(t + .02, .3, .05, [['highpass', 4000]], d) },
  door: (t, d) => { nz(t, .25, .2, [['lowpass', 400]], d, [.02, .25]); osc(t, 90, .2, 'sine', .25, d, 60); nz(t + .02, .06, .1, [['bandpass', 2000, 4]], d) },
  cash: (t, d) => { osc(t, 2637, .5, 'triangle', .07, d); osc(t + .08, 3520, .6, 'triangle', .06, d); nz(t, .08, .1, [['bandpass', 4000, 2]], d) },
  coin: (t, d) => { osc(t, 3950, .25, 'sine', .07, d); osc(t + .09, 5270, .35, 'sine', .05, d) },
  error: (t, d) => { osc(t, 330, .14, 'triangle', .1, d); osc(t + .15, 247, .22, 'triangle', .1, d) },
  ok: (t, d) => { osc(t, 660, .12, 'triangle', .08, d); osc(t + .1, 990, .2, 'triangle', .07, d) },
  horn: (t, d, o) => { const k = (o && o.kind) || 'car', f = { car: 392, scooter: 660, tuktuk: 520, van: 330, bus: 247 }[k] || 392, D = (o && o.len) || .35; for (const m of [1, 1.26]) { const ff = C.createBiquadFilter(); ff.type = 'lowpass'; ff.frequency.value = 1800; ff.connect(d); osc(t, f * m, D, 'square', .07, ff, 0, .015) } },
  brake: (t, d) => { const o = osc(t, 2900, .7, 'sine', .035, d, 2600, .05); const l = C.createOscillator(), lg = C.createGain(); l.frequency.value = 23; lg.gain.value = 40; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + .75); nz(t, .6, .05, [['bandpass', 3000, 3]], d) },
  bell: (t, d) => { osc(t, 1568, 1.2, 'sine', .07, d); osc(t, 2350, .9, 'sine', .03, d); osc(t + .18, 1568, 1, 'sine', .05, d) },
  bikebell: (t, d) => { for (const k of [0, .14]) { osc(t + k, 3100, .5, 'sine', .06, d); osc(t + k, 4650, .3, 'sine', .03, d) } },
  splash: (t, d) => nz(t, .5, .25, [['bandpass', 1200, .6, 500]], d, [.01, .5]),
  machine: (t, d) => { osc(t, 110, .6, 'sawtooth', .04, d); nz(t, .6, .05, [['bandpass', 600, 2]], d) }
};
SND.names = () => Object.keys(FXS);
SND.fx = function (name, o) {
  if (!ready && !init()) return false; const A = AV.audio; if (A.mute || C.state !== 'running') return false; const t = C.currentTime, d = out(o); SND.stats.fx++; SND.last = name;
  const b = SND.manifest[name] ? loadBuf(name) : null; if (b) { const s = C.createBufferSource(); s.buffer = b; const g = C.createGain(); g.gain.value = (o && o.gain) || 1; s.connect(g); g.connect(d); s.start(t); return true }
  const f = FXS[name]; if (!f) return false; try { f(t, d, o || {}) } catch (e) { console.warn('sfx', name, e) } return true;
};
SND.horn = (x, z, kind) => { SND.stats.horns++; return SND.fx('horn', { x, z, y: 1, kind, ref: 6, roll: 1, len: kind === 'scooter' ? .2 : .35 }) };

/* ======================= zones (acoustic spaces) ======================= */
/* built-in zones for interiors that already exist; other agents add theirs with AV.snd.zone() */
const BUILTIN = [
  { world: 'chiang_mai', id: 'giant_hostel', box: [8, 32, 52, 88], space: 'room' }, { world: 'chiang_mai', id: 'big_blues', box: [8, 26, 22.5, 40.5], space: 'bar' },
  { world: 'madrid', id: 'la_nube', box: [2393.5, 2406.5, -4.5, 4.5], space: 'bar' }, { world: 'madrid', id: 'interiors', box: [1900, 3000, -200, 200], space: 'room' }
];
SND.zone = z => { SND.zones.push(z); return z };
BUILTIN.forEach(SND.zone);
let space = 'outdoor', zoneId = null, spaceT = 0;
function zoneAt(x, z) { const W = AV.W; if (!W) return null; let best = null; for (const q of SND.zones) { if (q.world && q.world !== W.id) continue; const b = q.box; if (x > b[0] && x < b[1] && z > b[2] && z < b[3]) { const a = (b[1] - b[0]) * (b[3] - b[2]); if (!best || a < best.a) best = { q, a } } } return best && best.q }
SND.zoneAt = zoneAt;
function updSpace() {
  const P = AV.P, q = zoneAt(P.x, P.z), sp = q ? q.space || 'room' : 'outdoor'; if (sp === space && (q && q.id) === zoneId) return; const prev = space; space = sp; zoneId = q && q.id; const S = SPACES[sp] || SPACES.room, t = C.currentTime;
  verbG.gain.setTargetAtTime(0, t, .08); setTimeout(() => { if (space !== sp) return; try { verb.buffer = ir(S.sec, S.dec) } catch (e) { } verbG.gain.setTargetAtTime(S.wet, C.currentTime, .35) }, 220);   /* fade out, swap the room, fade in: no pops */
  ambF.frequency.setTargetAtTime(sp === 'outdoor' ? 18000 : 700, t, .3); SND.stats.spaceChanges = (SND.stats.spaceChanges || 0) + 1; SND.spaceFrom = prev;
}

/* ======================= occlusion (walls between you and a source) ======================= */
function walls(x0, z0, x1, z1) {
  const W = AV.W; if (!W || !W.cols) return 0; const mnx = Math.min(x0, x1), mxx = Math.max(x0, x1), mnz = Math.min(z0, z1), mxz = Math.max(z0, z1), dx = x1 - x0, dz = z1 - z0; let n = 0;
  for (const c of W.cols) { if (c[1] < mnx || c[0] > mxx || c[3] < mnz || c[2] > mxz) continue;
    let t0 = 0, t1 = 1; const pr = [[-dx, x0 - c[0]], [dx, c[1] - x0], [-dz, z0 - c[2]], [dz, c[3] - z0]]; let hit = true;
    for (const [p, q] of pr) { if (p === 0) { if (q < 0) { hit = false; break } } else { const r = q / p; if (p < 0) { if (r > t1) { hit = false; break } if (r > t0) t0 = r } else { if (r < t0) { hit = false; break } if (r < t1) t1 = r } } }
    if (hit && t1 - t0 > .002 && t0 > .01 && t1 < .99) { n++; if (n >= 3) break } }
  return n }
SND.walls = walls;
/* indoor ↔ outdoor: a source inside a zone you are not in (or vice versa) counts as one extra wall */
function occl(x, z) { const P = AV.P, zs = zoneAt(x, z), zp = zoneAt(P.x, P.z); return walls(P.x, P.z, x, z) + ((zs && zs.id) !== (zp && zp.id) ? 1 : 0) }

/* ======================= emitters ======================= */
const EM = [];
SND.emitter = function (o) {
  if (!ready && !init()) return null; const e = Object.assign({ y: 1.2, gain: .5, ref: 4, roll: 1.1, max: 60, occlude: true, cat: 'amb', world: AV.W && AV.W.id }, o);
  e.f = C.createBiquadFilter(); e.f.type = 'lowpass'; e.f.frequency.value = 18000; e.g = C.createGain(); e.g.gain.value = 0; e.p = C.createPanner(); e.p.panningModel = phone() ? 'equalpower' : 'HRTF'; e.p.distanceModel = 'inverse'; e.p.refDistance = e.ref; e.p.rolloffFactor = e.roll; e.p.maxDistance = 400;
  e.f.connect(e.g); e.g.connect(e.p); e.p.connect(e.cat === 'sfx' ? sfx : e.cat === 'voice' ? voice : e.cat === 'venue' ? venue : amb); setPos(e.p, e.x, e.y, e.z);
  if (e.gen) e.nodes = e.gen(C, e.f) || []; e.occ = 0; EM.push(e); return e };
SND.remove = function (e) { const i = EM.indexOf(e); if (i >= 0) EM.splice(i, 1); try { (e.nodes || []).forEach(n => { try { n.stop && n.stop() } catch (x) { } }); e.p.disconnect(); e.g.disconnect() } catch (x) { } };
function updEmitters(t) {
  const P = AV.P; for (const e of EM) { const d = Math.hypot(e.x - P.x, e.z - P.z); let tgt = d > e.max ? 0 : (typeof e.gain === 'function' ? e.gain() : e.gain) * (d > e.max * .8 ? (e.max - d) / (e.max * .2) : 1);
    if (e.occlude && tgt > 0 && (e.ot = (e.ot || 0) - 1) <= 0) { e.ot = phone() ? 4 : 2; e.occ = occl(e.x, e.z) } if (e.move) e.move(e);
    setPos(e.p, e.x, e.y, e.z); e.f.frequency.setTargetAtTime([18000, 2200, 900, 500][Math.min(3, e.occ)], t, .15); e.g.gain.setTargetAtTime(tgt * [1, .55, .32, .2][Math.min(3, e.occ)], t, .2) } }

/* ======================= generators ======================= */
const GEN = SND.GEN = {
  chatter: (c, d) => { const s = c.createBufferSource(); s.buffer = noiseBuf(); s.loop = true; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 520; f.Q.value = .9; const f2 = c.createBiquadFilter(); f2.type = 'peaking'; f2.frequency.value = 1100; f2.gain.value = 6; const a = c.createGain(); a.gain.value = .7;
    const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = 3.1; lg.gain.value = .3; l.connect(lg); lg.connect(a.gain); const l2 = c.createOscillator(), lg2 = c.createGain(); l2.frequency.value = .37; lg2.gain.value = .25; l2.connect(lg2); lg2.connect(a.gain);
    s.connect(f); f.connect(f2); f2.connect(a); a.connect(d); s.start(0, Math.random()); l.start(); l2.start(); return [s, l, l2] },
  water: (c, d) => { const s = c.createBufferSource(); s.buffer = noiseBuf(); s.loop = true; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = .4; const f2 = c.createBiquadFilter(); f2.type = 'highshelf'; f2.frequency.value = 3000; f2.gain.value = -8; s.connect(f); f.connect(f2); f2.connect(d); s.start(0, Math.random()); return [s] },
  hum: (c, d) => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 50; const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 260; const g = c.createGain(); g.gain.value = .35; o.connect(f); f.connect(g); g.connect(d); const s = c.createBufferSource(); s.buffer = noiseBuf(); s.loop = true; const f3 = c.createBiquadFilter(); f3.type = 'bandpass'; f3.frequency.value = 1400; f3.Q.value = 3; const g3 = c.createGain(); g3.gain.value = .25; s.connect(f3); f3.connect(g3); g3.connect(d); o.start(); s.start(); return [o, s] },
  engine: (c, d) => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 60; const o2 = c.createOscillator(); o2.type = 'square'; o2.frequency.value = 30; const g2 = c.createGain(); g2.gain.value = .4; const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 500; f.Q.value = 2;
    const tg = c.createGain(); tg.gain.value = .8; const trem = c.createOscillator(), tgg = c.createGain(); trem.frequency.value = 14; tgg.gain.value = 0; trem.connect(tgg); tgg.connect(tg.gain);
    const s = c.createBufferSource(); s.buffer = noiseBuf(); s.loop = true; const nf = c.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 700; nf.Q.value = .8; const ng = c.createGain(); ng.gain.value = .35;
    o.connect(f); o2.connect(g2); g2.connect(f); f.connect(tg); s.connect(nf); nf.connect(ng); ng.connect(tg); tg.connect(d); o.start(); o2.start(); trem.start(); s.start(0, Math.random());
    const n = [o, o2, trem, s]; n.eng = { o, o2, f, tgg, nf, ng }; return n }
};
/* place ambience: chatter for cafés / bars / markets, clinks, water for fountains and rivers, hum for workshops */
const PLACE_RX = [[/caf[eé]|coffee|bakery|panader|kaffee|tea|food|terrace|tapas|restaurant|bistro/i, 'cafe'], [/bar\b|pub|club|blues|bodega|cervec|beer|lounge|disco|night/i, 'bar'], [/market|bazaar|souk|shuk|mercado|markt|stalls?|shop|store|tienda|mall/i, 'market'],
  [/fountain|fuente|brunnen/i, 'fountain'], [/river|canal|falls|waterfall|stream|ufer|beach|lagoon|sea|pier/i, 'water'], [/garage|workshop|factory|taller|dock|port|station|metro/i, 'machine']];
const KIND = { cafe: { gen: 'chatter', gain: .32, r: 26, clink: 1 }, bar: { gen: 'chatter', gain: .42, r: 32, clink: 1 }, market: { gen: 'chatter', gain: .45, r: 40 }, fountain: { gen: 'water', gain: .35, r: 22 }, water: { gen: 'water', gain: .4, r: 45 }, machine: { gen: 'hum', gain: .16, r: 22 }, shop: { gen: 'chatter', gain: .2, r: 16 } };
SND.place = p => { SND.places.push(p); return p };
let PV = [], placeList = [];
function placesFor(W) { const L = SND.places.filter(p => p.world === W.id).map(p => Object.assign({}, p)); for (const p of W.places || []) { if (p.hidden || p.x == null) continue; const n = (p.id || '') + ' ' + (Array.isArray(p.name) ? p.name[0] : p.name || ''); const k = PLACE_RX.find(r => r[0].test(n)); if (k) L.push({ x: p.x, z: p.z, kind: k[1], id: p.id }) } return L }
function updPlaces(t) {
  const P = AV.P, max = phone() ? 3 : 5, near = placeList.map(p => ({ p, d: Math.hypot(p.x - P.x, p.z - P.z) })).filter(o => o.d < (KIND[o.p.kind] || KIND.cafe).r * 1.3).sort((a, b) => a.d - b.d).slice(0, max);
  for (const v of PV) { if (!near.some(o => o.p === v.pl)) { v.e.gain = 0; v.pl = null } }
  for (const o of near) { if (PV.some(v => v.pl === o.p)) continue; const K = KIND[o.p.kind] || KIND.cafe; let v = PV.find(q => !q.pl && q.gen === K.gen && Date.now() - (q.freed || 0) > 600);
    if (!v && PV.length < max + 2) { v = { gen: K.gen, e: SND.emitter({ x: o.p.x, z: o.p.z, gen: GEN[K.gen], gain: 0, max: K.r * 1.3, ref: 5 }) }; PV.push(v) } if (!v || !v.e) continue;
    v.pl = o.p; v.e.x = o.p.x; v.e.z = o.p.z; v.e.max = K.r * 1.3; const night = AV.S.time > 20 * 60 || AV.S.time < 7 * 60; v.e.gain = () => K.gain * (o.p.kind === 'cafe' && night ? .4 : o.p.kind === 'bar' && !night ? .6 : 1) }
  /* clinks + register sounds now and then near cafés and bars */
  if (Math.random() < .015) { const c = near.find(o => (KIND[o.p.kind] || {}).clink && o.d < 18); if (c) SND.fx(Math.random() < .8 ? 'clink' : 'cash', { x: c.p.x + (Math.random() - .5) * 4, z: c.p.z + (Math.random() - .5) * 4, ref: 3, bus: amb }) } }

/* ======================= traffic voices ======================= */
const TV = []; const ENG = { car: [42, 1.9, 520, 0], scooter: [95, 6.5, 1500, 14], tuktuk: [70, 5.2, 1100, 9], van: [36, 1.5, 420, 0], bus: [30, 1.2, 380, 0], taxi: [42, 1.9, 520, 0], truck: [28, 1.1, 360, 0] };
function updTraffic(t, dt) {
  const TR = AV.traffic, cars = TR && TR.cars || [], P = AV.P, max = phone() ? 2 : 4;
  const near = cars.filter(c => c.lane && Math.abs(c.x - P.x) < 70 && Math.abs(c.z - P.z) < 70).map(c => ({ c, d: Math.hypot(c.x - P.x, c.z - P.z) })).filter(o => o.d < 60).sort((a, b) => a.d - b.d).slice(0, max);
  while (TV.length < Math.min(max, near.length)) { const e = SND.emitter({ x: P.x, z: P.z, gen: GEN.engine, gain: 0, max: 70, ref: 5, roll: 1.3 }); if (!e) break; TV.push({ e, c: null }) }
  for (const v of TV) if (v.c && !near.some(o => o.c === v.c)) { v.c = null; v.e.gain = 0 }
  for (const o of near) { let v = TV.find(q => q.c === o.c) || TV.find(q => !q.c); if (!v) continue; v.c = o.c; const c = o.c, E = ENG[c.k] || ENG.car, n = v.e.nodes.eng, sp = Math.abs(c.v || 0);
    v.e.x = c.x; v.e.z = c.z; const f = E[0] + sp * E[1] * 3.2; n.o.frequency.setTargetAtTime(f, t, .2); n.o2.frequency.setTargetAtTime(f / 2, t, .2); n.f.frequency.setTargetAtTime(E[2] + sp * 40, t, .2); n.tgg.gain.setTargetAtTime(E[3] ? .35 : 0, t, .1); n.nf.frequency.setTargetAtTime(500 + sp * 60, t, .2);
    v.e.gain = .12 + Math.min(.32, sp * .03);
    /* brake squeal: a fast car slowing hard near you, sometimes */
    if (c.__pv != null && c.__pv - sp > 4.5 * dt * 1.4 && c.__pv > 6 && o.d < 30 && Math.random() < .02) { SND.stats.brakes++; SND.fx('brake', { x: c.x, z: c.z, ref: 5 }) } c.__pv = sp }
}

/* ======================= footsteps ======================= */
const WORLD_MAT = { madrid: 'stone', vienna: 'stone', amsterdam: 'stone', jerusalem: 'stone', judean_desert: 'sand', tokyo: 'stone', paris: 'stone', barcelona: 'stone', ape_town: 'grass', jungle_dub: 'dirt', verdalux: 'grass', pai: 'dirt', chiang_mai: 'stone', koh_tao: 'sand', da_nang: 'stone', koh_samui_jurassic: 'dirt', astro9: 'metal', nimbus: 'cloud' };
SND.stepMat = function (x, z) { const W = AV.W; if (!W) return 'stone'; if (W.stepMat) { const m = W.stepMat(x, z); if (m) return m } if (W.waterAt && W.waterAt(x, z)) return 'water'; const q = zoneAt(x, z); if (q && q.space !== 'cave') return 'wood'; return WORLD_MAT[W.id] || 'stone' };
const STEP = {
  stone: (t, d, g) => { nz(t, .05, .16 * g, [['highpass', 900], ['bandpass', 2600, 1.4]], d); nz(t, .03, .08 * g, [['lowpass', 300]], d) },
  wood: (t, d, g) => { nz(t, .08, .14 * g, [['bandpass', 520, 1.6]], d); osc(t, 140, .08, 'sine', .08 * g, d, 90) },
  dirt: (t, d, g) => nz(t, .1, .13 * g, [['lowpass', 850]], d),
  grass: (t, d, g) => nz(t, .14, .07 * g, [['highpass', 1800], ['lowpass', 6500]], d, [.03, .14]),
  sand: (t, d, g) => nz(t, .16, .08 * g, [['bandpass', 1500, .7]], d, [.04, .16]),
  water: (t, d, g) => { nz(t, .22, .14 * g, [['bandpass', 1000, 2, 500]], d, [.02, .22]); osc(t + .03, 300, .1, 'sine', .04 * g, d, 600) },
  metal: (t, d, g) => { nz(t, .05, .1 * g, [['bandpass', 3000, 6]], d); osc(t, 1800, .12, 'sine', .015 * g, d) },
  cloud: (t, d, g) => nz(t, .18, .04 * g, [['lowpass', 500]], d, [.05, .18])
};
let stepAcc = 0, lastMat = null, lx = null, lz = null;
function updSteps(dt) {   /* one step per ~0.75 m actually walked (frame-rate independent) */
  const P = AV.P, moved = lx == null ? 0 : Math.hypot(P.x - lx, P.z - lz); lx = P.x; lz = P.z; const sp = Math.hypot(P.vx || 0, P.vz || 0); if (AV.drive || !P.on || sp < .8 || moved > 3 || AV.blocking()) { stepAcc = Math.min(stepAcc, .2); return }
  stepAcc += moved / (sp > 5 ? .95 : .72); if (stepAcc < 1) return; stepAcc = 0; const m = lastMat = SND.stepMat(P.x, P.z), f = STEP[m] || STEP.stone, t = C.currentTime;
  f(t + Math.random() * .01, sfx, (sp > 5 ? 1.2 : .9) * (.85 + Math.random() * .3)); SND.stats.steps++ }
/* the older per-world "steps" ambience layer would double our footsteps: silence it while ours run */
function muteOldSteps() { const L = AV.amb && AV.amb.L && AV.amb.L.steps; if (L && !L.__m) { L.__m = 1; L.def.gain = () => 0 } }

/* ======================= venue music (re-routing the world's positional track) ======================= */
const VENUES = SND.venues; let vRoute = null;
SND.venue = (world, v) => { VENUES[world] = v; return v };
/* Chiang Mai: on Moon Muang Rd (Giant Hostel, Big Blues and the street between them) the set always comes from Big Blues, so you hear it
   across the street from the hostel, muffled; elsewhere the world's own nearest-venue logic (world_chiang_mai.js) decides as before. */
SND.venue('chiang_mai', { id: 'big_blues', pos: { x: 17, y: 2.6, z: 31.5 }, bed: .12, area: [0, 40, 18, 92], label: 'Live set at Big Blues (Moon Muang Rd)' });
/* T.pos becomes a property: worlds keep writing it as before, but inside a venue's area the venue wins */
function pinPos() { const T = AV.audio && AV.audio.track; if (!T || T.__pin) return; let own = T.pos; T.__pin = 1; Object.defineProperty(T, 'pos', { configurable: true, get() { const W = AV.W, v = W && VENUES[W.id], P = AV.P; if (v && v.area && own && P.x > v.area[0] && P.x < v.area[1] && P.z > v.area[2] && P.z < v.area[3]) return v.pos; return own }, set(p) { own = p } }) }
pinPos();
function routeVenue() {
  const T = AV.audio.track; if (!T || !T.graph || !T.posG) return; if (vRoute && vRoute.posG === T.posG) return;
  try { T.posG.disconnect() } catch (e) { } const f = C.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 18000; f.Q.value = .5; const g = C.createGain(); const p = C.createPanner(); p.panningModel = phone() ? 'equalpower' : 'HRTF'; p.distanceModel = 'inverse'; p.refDistance = 7; p.rolloffFactor = 1.05; p.maxDistance = 500;
  T.posG.connect(f); f.connect(g); g.connect(p); p.connect(venue); g.connect(verbSend.venue); vRoute = { posG: T.posG, f, g, p, occ: 0, ot: 0 }; SND.stats.venueRouted = 1 }
function updVenue(t) {
  const W = AV.W, T = AV.audio.track; if (!W || !T) return; const v = VENUES[W.id];
  routeVenue(); if (!vRoute || !T.pos) return; setPos(vRoute.p, T.pos.x, T.pos.y || 2, T.pos.z);
  if ((vRoute.ot -= 1) <= 0) { vRoute.ot = phone() ? 6 : 3; vRoute.occ = occl(T.pos.x, T.pos.z) }
  const o = Math.min(3, vRoute.occ); vRoute.f.frequency.setTargetAtTime([18000, 1400, 650, 380][o], t, .25); vRoute.g.gain.setTargetAtTime([1, .7, .5, .35][o], t, .25);   /* through walls: the bass carries, the rest is muffled */
  /* the non-positional bed ducks a little more when the venue is behind walls, so the walls are what you hear */
}
/* the venue's own set (playlist, position, how much of it is heard everywhere) replaces the world track before audio.js picks it */
const sw0 = AV.audio && AV.audio.setWorld; if (sw0) AV.audio.setWorld = function (W) { const v = W && VENUES[W.id]; if (v && v.playlist && W.music && !W.music.__v22 && (!v.playlist || (AV.MUSIC && AV.MUSIC[v.playlist]))) W.music = Object.assign({}, W.music, { playlist: v.playlist || W.music.playlist, pos: v.pos, bed: v.bed, __v22: 1 }); return sw0.apply(this, arguments) };

/* ======================= frame ======================= */
let acc = 0, lastW = null;
AV.frameFns.push(dt => {
  if (!SND.on || !AV.W || !AV.audio || !AV.audio.ok) return; if (!ready && !init()) return; hookDuck();
  if (lastW !== AV.W) { lastW = AV.W; placeList = placesFor(AV.W); for (const v of PV) { v.pl = null; v.e.gain = 0 } for (const v of TV) { v.c = null; v.e.gain = 0 } space = '?'; }
  const t = C.currentTime; updSteps(dt); acc += dt; if (acc < .1) return; const step = acc; acc = 0;
  vol(); updSpace(); updEmitters(t); updPlaces(t); updTraffic(t, step); updVenue(t); muteOldSteps();
});
/* the existing ambience beds join the Ambience bus (own volume, muffled indoors) */
if (AV.amb && AV.amb.start) { const st0 = AV.amb.start; AV.amb.start = function () { const r = st0.apply(this, arguments); if (r && (ready || init()) && AV.amb.master) { try { AV.amb.master.disconnect(); AV.amb.master.connect(amb) } catch (e) { } } return r } }
/* level meter for tests and the F3 overlay: RMS of everything audio2 mixes (ambience + effects + venue music) */
let AN = null, AB = null; SND.meter = () => { if (!ready) return 0; if (!AN) { AN = C.createAnalyser(); AN.fftSize = 1024; mix.connect(AN); AB = new Float32Array(AN.fftSize) } AN.getFloatTimeDomainData(AB); let s = 0; for (const v of AB) s += v * v; return Math.sqrt(s / AB.length) };
SND.off = () => { SND.on = false; for (const e of EM) e.g.gain.value = 0 };
SND.state = () => ({ ready, space, zone: zoneId, emitters: EM.length, places: PV.filter(v => v.pl).length, traffic: TV.filter(v => v.c).length, venueOcc: vRoute ? vRoute.occ : null, mat: lastMat, stats: SND.stats });

/* ======================= mixer in Settings (O) ======================= */
const tog0 = AV.toggleSettings; AV.toggleSettings = function () {
  tog0.apply(this, arguments); const p = AV.$('set'); if (!p || p.style.display !== 'block' || AV.$('snd22')) return; const S = set(), close = p.querySelector('[data-close]');
  const row = (id, lab, v) => '<p>' + lab + ' <input id="' + id + '" type="range" min="0" max="1" step=".05" value="' + v + '"></p>';
  const box = document.createElement('div'); box.id = 'snd22';
  box.innerHTML = '<b>' + tr('Sound mix', 'Mezcla de sonido') + '</b>' + row('sVa', tr('Ambience (city, nature, crowds)', 'Ambiente (ciudad, naturaleza, gente)'), S.va) + row('sVv', tr('Voices', 'Voces'), S.vv) +
    '<div class="note"><small>' + tr('Music and effects volume are above. Footsteps, engines and shop sounds use Effects.', 'El volumen de música y efectos está arriba. Pasos, motores y tiendas usan Efectos.') + '</small></div>';
  close ? p.insertBefore(box, close) : p.appendChild(box);
  AV.$('sVa').oninput = e => { S.va = +e.target.value; vol(); AV.save() }; AV.$('sVv').oninput = e => { S.vv = +e.target.value; vol(); AV.save() };
};
})(window.AV);
