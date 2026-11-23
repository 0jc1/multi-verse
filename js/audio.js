/* APEVERSE V0.9.3 - audio.js : real MP3 playlists (data/music.js) with positional playback,
   procedural music as fallback (worlds without a playlist, or if every file fails), positional stage, beat phase */
'use strict';
(function (AV) {
const A = AV.audio = { ctx: null, mute: false, on: true, bpm: 88, beat: 0, step: 0, phase: 0, prof: null, stage: null, ok: false };
let master, mus, sfx, delay, fb, nextT = 0, stepI = 0, panner, stageGain, lastWorld = null, duckG = null, duckV = 0;
A.init = function (musicOn) {
  A.on = musicOn; if (A.ctx) return;
  try {
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return; const c = A.ctx = new C();
    master = c.createGain(); mus = c.createGain(); sfx = c.createGain(); mus.connect(master); sfx.connect(master);
    A.tone = c.createBiquadFilter(); A.tone.type = 'lowpass'; A.tone.frequency.value = 20000; A.tone.Q.value = .6; master.connect(A.tone); A.tone.connect(c.destination);   /* V0.9.5: item effects soften the sound (js/effects.js) */
    delay = c.createDelay(1); delay.delayTime.value = .375; fb = c.createGain(); fb.gain.value = .35; delay.connect(fb); fb.connect(delay); const dg = c.createGain(); dg.gain.value = .5; delay.connect(dg); dg.connect(mus);
    panner = c.createPanner(); panner.panningModel = 'HRTF'; panner.distanceModel = 'inverse'; panner.refDistance = 6; panner.rolloffFactor = 1.1; stageGain = c.createGain(); stageGain.connect(panner); panner.connect(mus);
    duckG = c.createGain(); mus.disconnect(); mus.connect(duckG); duckG.connect(master);           // music -> duck -> master
    A.mediaBus = c.createGain(); A.mediaBus.connect(master);                                       // in-world video sound (cinema screens, paintings)
    A.ok = true; A.applyVol(); const r = () => { if (c.state === 'suspended') c.resume() }; ['pointerdown', 'keydown', 'touchstart'].forEach(e => addEventListener(e, r)); r();
  } catch (e) { console.warn('audio unavailable', e) }
  /* a blocked play() (autoplay policy) is retried on the next click / key / touch */
  ['pointerdown', 'keydown', 'touchstart'].forEach(e => addEventListener(e, () => { if (T.blocked) { T.blocked = false; T.resume() } }));
};
A.applyVol = function () { if (A.ok) { const S = AV.S.set; master.gain.value = A.mute ? 0 : 1; mus.gain.value = A.on ? S.vm * .55 : 0; sfx.gain.value = S.vs; if (A.mediaBus) A.mediaBus.gain.value = S.vm == null ? 1 : Math.max(.15, S.vm) } T.direct() };
/* duck the music while in-world media (cinema/painting) is audible. v: 0..1 */
A.setDuck = function (v) { v = Math.max(0, Math.min(1, v)); if (Math.abs(v - duckV) < .02) return; duckV = v; if (!A.ok || !duckG) return; try { duckG.gain.setTargetAtTime(1 - v, A.ctx.currentTime, .4) } catch (e) { duckG.gain.value = 1 - v }   /* V0.9.7: full duck: never two songs at once */ };
A.setWorld = function (W) {
  A.prof = W.musicProfile || { bpm: 88, root: 45, scale: [0, 3, 5, 7, 10], style: 'boom' }; A.bpm = A.prof.bpm; A.stage = W.stage ? W.stage.pos : null; lastWorld = W.id; stepI = 0; if (A.ok) nextT = A.ctx.currentTime + .15;
  T.setWorld(W);
};

/* ======================= real music files ======================= */
/* One <audio> element is reused for every track. Over http(s) it is routed through Web Audio:
     element -> posG -> panner (positional, at the stage) -> mus -> duck -> master
             -> bedG -> mus                                (a quieter non-positional "bed" so it is heard across the world)
   From file:// browsers silence MediaElementSource (opaque origin), so the element plays directly and
   distance / volume / ducking are applied to element.volume instead. */
const T = A.track = { el: null, key: null, list: null, i: 0, active: false, want: false, blocked: false, failed: {}, pos: null, bed: 1, graph: false, src: null, posG: null, bedG: null, lastIdx: {} };
function el() {
  if (T.el) return T.el; const e = T.el = new Audio(); e.preload = 'auto';
  e.addEventListener('ended', () => T.next());
  e.addEventListener('error', () => { if (!T.list || !T.active) return; const f = T.list.tracks[T.i].file; T.failed[f] = 1; console.warn('music file failed: ' + f); T.next(true) });
  if (A.ok && !AV.isFile) {
    try { const c = A.ctx; T.src = c.createMediaElementSource(e); T.posG = c.createGain(); T.bedG = c.createGain(); T.src.connect(T.posG); T.src.connect(T.bedG); T.posG.connect(panner); T.bedG.connect(mus); T.graph = true }
    catch (x) { console.warn('music graph unavailable, playing directly', x); T.graph = false }
  }
  return e;
}
T.title = () => T.active && T.list ? T.list.tracks[T.i].title : null;
T.playlist = () => T.active && T.list ? T.list.name : null;
T.ready = () => T.active && T.el && !T.el.paused && T.el.currentTime > 0;
T.stop = function () { T.active = false; T.key = null; T.list = null; if (T.el) { try { T.el.pause() } catch (e) { } } };
T.load = function (i) {
  const L = T.list, n = L.tracks.length; let tries = 0;
  while (T.failed[L.tracks[i % n].file] && tries < n) { i++; tries++ }
  if (tries >= n) { console.warn('every file in playlist "' + T.key + '" failed - using procedural music'); T.stop(); return }
  T.i = i % n; T.lastIdx[T.key] = T.i; const e = el(); e.src = L.tracks[T.i].file; T.direct(); T.resume();   // direct(): correct volume before the first frame
};
T.resume = function () {
  if (!T.active || !T.el || !A.on) return; if (A.ok && A.ctx.state === 'suspended') A.ctx.resume();
  const p = T.el.play(); if (p && p.catch) p.catch(err => { if (err && err.name === 'NotAllowedError') T.blocked = true });
};
T.next = function (skipErr) {
  if (!T.active || !T.list) return; const n = T.list.tracks.length;
  T.load(T.list.shuffle && n > 2 && !skipErr ? (T.i + 1 + Math.floor(Math.random() * (n - 1))) % n : T.i + 1);
  if (!skipErr && T.active && AV.toast) AV.toast('♪ ' + T.title());
};
T.setWorld = function (W) {
  const m = W.music, L = m && AV.MUSIC && AV.MUSIC[m.playlist];
  T.pos = m && m.pos || null; T.bed = m && m.bed != null ? m.bed : (T.pos ? .3 : 1);
  if (!L || !L.tracks || !L.tracks.length || L.tracks.every(t => T.failed[t.file])) { T.stop(); return }
  if (T.key === m.playlist && T.active) { T.resume(); return }              // same playlist (e.g. re-entering): keep the song going
  T.stop(); T.key = m.playlist; T.list = L; T.active = true;
  if (!A.on) return;                                                         // music switched off: start lazily when it comes back on
  const start = T.lastIdx[T.key] != null ? T.lastIdx[T.key] + 1 : (L.shuffle ? Math.floor(Math.random() * L.tracks.length) : 0);
  T.load(start);
};
/* volume when the element plays directly (file:// or no Web Audio) */
T.direct = function () {
  if (!T.el || T.graph) return; const S = AV.S.set; let v = A.mute || !A.on ? 0 : (S.vm == null ? .8 : S.vm) * .55 * (1 - duckV);
  if (T.pos && AV.P) { const d = Math.hypot(AV.P.x - T.pos.x, AV.P.z - T.pos.z), near = Math.min(1, 6 / Math.max(6, 6 + 1.1 * (d - 6))); v *= T.bed + (1 - T.bed) * near }
  T.el.volume = Math.max(0, Math.min(1, v));
};
T.frame = function () {
  if (A.hold) { if (T.el && !T.el.paused) T.el.pause(); return }   /* Living Playground: a DJ booth / instrument owns the music (A.hold), the world track waits */
  if (!T.active) return;
  if (!A.on) { if (T.el && !T.el.paused) T.el.pause(); return }
  if (!T.el || !T.el.src) { T.load(T.lastIdx[T.key] != null ? T.lastIdx[T.key] : 0); return }
  if (T.el.paused && !T.blocked && !T.el.ended && T.el.readyState >= 2) T.resume();
  if (T.graph) { T.posG.gain.value = T.pos ? 1 - T.bed : 0; T.bedG.gain.value = T.pos ? T.bed : 1 } else T.direct();
  const L = T.list; A.bpm = L.bpm || A.bpm; A.beat = T.el.currentTime * A.bpm / 60; A.phase = (A.beat * 4 % 16) / 16;
};
A.nextTrack = () => { if (T.active) T.next() };
A.nowPlaying = () => T.active ? { title: T.title(), playlist: T.playlist(), i: T.i + 1, n: T.list.tracks.length, playing: T.ready() } : null;

/* ======================= procedural music (fallback) ======================= */
function note(t, f, d, type, g, dest, cutoff) {
  const c = A.ctx, o = c.createOscillator(), e = c.createGain(); o.type = type; o.frequency.value = f; e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(g, t + .01); e.gain.exponentialRampToValueAtTime(.0008, t + d);
  let n = o; if (cutoff) { const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = cutoff; o.connect(fl); n = fl } n.connect(e); e.connect(dest); o.start(t); o.stop(t + d + .05);
}
function noise(t, d, g, hp, dest) {
  const c = A.ctx, n = c.sampleRate * d | 0, b = c.createBuffer(1, n, c.sampleRate), x = b.getChannelData(0); for (let i = 0; i < n; i++) x[i] = Math.random() * 2 - 1;
  const s = c.createBufferSource(), f = c.createBiquadFilter(), e = c.createGain(); s.buffer = b; f.type = 'highpass'; f.frequency.value = hp; e.gain.setValueAtTime(g, t); e.gain.exponentialRampToValueAtTime(.001, t + d); s.connect(f); f.connect(e); e.connect(dest); s.start(t);
}
const mf = n => 440 * Math.pow(2, (n - 69) / 12);
function kick(t, d) { const c = A.ctx, o = c.createOscillator(), e = c.createGain(); o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(42, t + .12); e.gain.setValueAtTime(.9, t); e.gain.exponentialRampToValueAtTime(.001, t + .3); o.connect(e); e.connect(d); o.start(t); o.stop(t + .32) }
function stepFn(i, t) {
  const p = A.prof, sc = p.scale, root = p.root, dest = A.stage ? stageGain : mus, st = i % 16, bar = (i / 16 | 0) % 4, spb = 60 / A.bpm / 4;
  const deg = [0, 0, 3, 2][bar];
  if (p.style === 'dub') {           // jungle dub: one-drop + deep bass + delayed skank
    if (st === 8) { kick(t, dest); noise(t, .14, .35, 1800, dest) }
    if (st === 0 || st === 10) note(t, mf(root - 12 + sc[deg % sc.length]), spb * 3, 'sine', .55, dest);
    if (st === 4 || st === 12) { note(t, mf(root + 12 + sc[2]), spb * 1.4, 'square', .06, delay, 1600); note(t, mf(root + 12 + sc[2]), spb * 1.4, 'square', .05, dest, 1400) }
    if (st % 2 === 0) noise(t, .05, .08, 6500, dest);
  } else if (p.style === 'space') {  // astro-9 club: four on the floor + arp
    if (st % 4 === 0) kick(t, dest); if (st % 8 === 4) noise(t, .12, .25, 2000, dest); if (st % 2 === 1) noise(t, .03, .09, 7500, dest);
    if (st % 4 === 2) note(t, mf(root - 12 + sc[deg % sc.length]), spb * 1.7, 'sawtooth', .16, dest, 700);
    note(t, mf(root + 12 + sc[(st + bar) % sc.length]), spb * .9, 'triangle', .07, st % 3 === 0 ? delay : dest);
  } else if (p.style === 'sky') {    // nimbus sky city: airy lounge, soft thump, warm pads, shimmering arp through the delay
    if (st === 0 || st === 10) note(t, 55, .28, 'sine', .4, dest, 300); if (st === 4 || st === 12) noise(t, .09, .1, 2800, dest); if (st % 2 === 1) noise(t, .02, .035, 9000, dest);
    if (st === 0) for (const k of [0, 2, 4]) note(t, mf(root + sc[(deg + k) % sc.length]), spb * 15, 'sine', .055, dest);
    if (st === 0 || st === 7) note(t, mf(root - 12 + sc[deg % sc.length]), spb * 3, 'sine', .32, dest, 420);
    if (st % 3 === 0) note(t, mf(root + 12 + sc[(st / 3 + bar * 2) % sc.length]), spb * 2, 'triangle', .04, delay);
  } else if (p.style === 'maqam') {  // Jerusalem / desert: maqsum darbuka (doum-tak), oud-like plucks on maqam hijaz, a low drone
    if (st === 0 || st === 8 && !p.sparse) kick(t, dest); if (st === 2 || st === 6 || st === 12) noise(t, .07, .22, 2600, dest); if (st % 2 === 1 && !p.sparse) noise(t, .02, .05, 8000, dest);
    if (st === 0 && bar % 2 === 0) note(t, mf(root - 12), spb * 30, 'sine', .14, dest);
    const ph = [0, 1, 2, 1, 3, 4, 3, 2, 4, 5, 4, 3, 2, 1, 2, 0], dg = ph[(st + bar * 5) % 16];
    if (st % (p.sparse ? 4 : 2) === 0 || st === 7) note(t, mf(root + 12 + sc[(dg + deg) % sc.length]), spb * 1.6, 'sawtooth', .045, st % 6 === 0 ? delay : dest, 1700);
    if (st === 14 && bar === 3) note(t, mf(root + 24 + sc[1]), spb * 2, 'triangle', .05, delay);
  } else if (p.style === 'amb') {    // verdalux: soft pads
    if (st === 0) { for (const k of [0, 2, 4]) note(t, mf(root + sc[(deg + k) % sc.length]), spb * 14, 'sine', .08, dest) } if (st % 8 === 0) note(t, mf(root + 24 + sc[(bar + st / 8) % sc.length]), spb * 4, 'triangle', .05, delay);
  } else {                            // boom-bap + tuba bass + rhodes (Ape Town)
    if (st === 0 || st === 10) kick(t, dest); if (st === 4 || st === 12) noise(t, .13, .3, 1500, dest); if (st % 2 === 0) noise(t, .03, .06, 7000, dest);
    if (st === 0 || st === 6 || st === 11) note(t, mf(root - 12 + sc[deg % sc.length]), spb * 2.4, 'sine', .5, dest, 500);
    if (st === 2 || st === 8) for (const k of [0, 2, 4]) note(t + (A.swing || 0), mf(root + sc[(deg + k) % sc.length]), spb * 3, 'triangle', .05, dest);
    if (st === 14 && bar % 2) note(t, mf(root + 12 + sc[(bar + 3) % sc.length]), spb * 3, 'sine', .08, delay);
  }
}
A.update = function () {
  T.frame();
  if (!A.ok) return; const c = A.ctx;
  const src = T.active && T.pos ? T.pos : A.stage;
  if (panner && src && AV.W) { if (panner.positionX) { panner.positionX.value = src.x; panner.positionY.value = src.y; panner.positionZ.value = src.z } else panner.setPosition(src.x, src.y, src.z) }
  stageGain.gain.value = A.stage && !T.active ? 1 : 0;
  if (T.active || A.hold || !A.on || !A.prof || c.state !== 'running') return;          // a real track is playing (or loading): no synth
  const spb = 60 / A.bpm / 4;
  if (nextT < c.currentTime - .5) nextT = c.currentTime + .05;
  while (nextT < c.currentTime + .2) { stepFn(stepI, nextT); stepI++; nextT += spb }
  A.phase = ((stepI % 16) + 0) / 16; A.beat = stepI / 4;      // beat counter in quarter notes
};
/* the listener follows the player every frame (also used by cinema screens and paintings), even when music is off */
function listener() {
  if (!A.ok || !AV.W) return; const L = A.ctx.listener, p = AV.P;
  if (L.positionX) { L.positionX.value = p.x; L.positionY.value = p.y + 1.7; L.positionZ.value = p.z; L.forwardX.value = -Math.sin(p.yaw); L.forwardY.value = 0; L.forwardZ.value = -Math.cos(p.yaw); L.upX.value = 0; L.upY.value = 1; L.upZ.value = 0 } else { L.setPosition(p.x, p.y + 1.7, p.z); L.setOrientation(-Math.sin(p.yaw), 0, -Math.cos(p.yaw), 0, 1, 0) }
}
AV.frameFns.push(listener);
AV.frameFns.push(() => A.update());
AV.keymap.KeyN = () => { if (T.active) T.next(); else AV.toast && AV.toast(AV.tr('No playlist in this world (procedural music).', 'No hay lista de música en este mundo (música procedural).')) };
A.blip = function (f, d, type, g) { if (!A.ok || A.mute) return; const c = A.ctx; if (c.state !== 'running') return; note(c.currentTime, f || 600, d || .15, type || 'sine', g || .2, sfx) };
A.whoosh = function () { if (!A.ok || A.mute) return; const t = A.ctx.currentTime; noise(t, .7, .35, 600, sfx); note(t, 220, .6, 'sawtooth', .08, sfx, 900) };
AV.pipeBlip = A.blip;
})(window.AV);
