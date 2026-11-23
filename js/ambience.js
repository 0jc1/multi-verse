/* APEVERSE - ambience.js : Worlds Reborn §32, layered positional ambience for a world (procedural Web Audio, no sound files).
   AV.amb.start(layers) with layers = { name: { loop: { filters: [[type, freq, Q]], lfo: [rate, depth] } | tick(c, t, out) -> next t,
   gain: () => 0..1 } }. Every frame each layer's level eases towards gain() (distance zones, time of day), so you hear where you are.
   Loop layers are filtered noise beds (insects, rivers, crowds); tick layers schedule short notes (birds, frogs, drums, techno).
   AV.amb.stop() on leaving the world. AV.amb.lv holds the current levels (used by tests and the F3 overlay). */
'use strict';
(function (AV) {
const AMB = AV.amb = { on: false, L: {}, lv: {} };
const A = () => AV.audio || {};
let NB = null;
const noise = c => { if (NB && NB.sampleRate === c.sampleRate) return NB; const n = c.sampleRate * 4, b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return NB = b };
AMB.tone = (c, out, t, f, d, type, g, glide) => { const o = c.createOscillator(), e = c.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (glide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f * glide), t + d); e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(g, t + .008); e.gain.exponentialRampToValueAtTime(.0004, t + d); o.connect(e); e.connect(out); o.start(t); o.stop(t + d + .05) };
AMB.hit = (c, out, t, d, g, hp, lp) => { const s = c.createBufferSource(), f = c.createBiquadFilter(), f2 = c.createBiquadFilter(), e = c.createGain(); s.buffer = noise(c); f.type = 'highpass'; f.frequency.value = hp || 200; f2.type = 'lowpass'; f2.frequency.value = lp || 12000; e.gain.setValueAtTime(g, t); e.gain.exponentialRampToValueAtTime(.0004, t + d); s.connect(f); f.connect(f2); f2.connect(e); e.connect(out); s.start(t, Math.random() * 3, d + .05) };
AMB.start = function (layers) {
  AMB.stop(); const a = A(); if (!a.ok || !a.ctx) return false; const c = a.ctx, m = AMB.master = c.createGain(); m.gain.value = .9; m.connect(a.mediaBus || c.destination); AMB.on = true; AMB.L = {}; AMB.lv = {};
  for (const k in layers) { const def = layers[k], g = c.createGain(); g.gain.value = 0; g.connect(m); const L = AMB.L[k] = { def, g, next: 0, nodes: [] };
    if (def.loop) { const s = c.createBufferSource(); s.buffer = noise(c); s.loop = true; let last = s; for (const [type, f, Q] of def.loop.filters || []) { const fl = c.createBiquadFilter(); fl.type = type; fl.frequency.value = f; if (Q) fl.Q.value = Q; last.connect(fl); last = fl; L.nodes.push(fl) }
      const amp = c.createGain(); amp.gain.value = def.loop.lfo ? 1 - def.loop.lfo[1] / 2 : 1; last.connect(amp); amp.connect(g);
      if (def.loop.lfo) { const o = c.createOscillator(), og = c.createGain(); o.frequency.value = def.loop.lfo[0]; og.gain.value = def.loop.lfo[1] / 2; o.connect(og); og.connect(amp.gain); o.start(); L.nodes.push(o) }
      s.start(0, Math.random() * 3); L.src = s } }
  return true;
};
AMB.update = function () {
  if (!AMB.on) return; const a = A(), c = a.ctx; if (!c) return; const now = c.currentTime, mute = a.mute || a.hold ? 0 : 1;
  for (const k in AMB.L) { const L = AMB.L[k]; let v = 0; try { v = Math.max(0, Math.min(1, L.def.gain() || 0)) } catch (e) { } AMB.lv[k] = v; try { L.g.gain.setTargetAtTime(v * mute * (L.def.vol || 1), now, .35) } catch (e) { }
    if (L.def.tick && v > .01) { if (L.next < now) L.next = now + .05; let guard = 0; while (L.next < now + .25 && guard++ < 16) L.next = L.def.tick(c, L.next, L.g) } }
};
AMB.stop = function () { if (!AMB.on) return; AMB.on = false; for (const k in AMB.L) { const L = AMB.L[k]; try { L.src && L.src.stop() } catch (e) { } L.nodes.forEach(n => { try { n.stop && n.stop() } catch (e) { } }); try { L.g.disconnect() } catch (e) { } } try { AMB.master.disconnect() } catch (e) { } AMB.L = {}; AMB.lv = {} };
AV.frameFns.push(() => AMB.update());
})(window.AV);
