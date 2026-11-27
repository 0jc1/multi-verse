/* APEVERSE 2.3 - lw_audio.js : street audio clean-up after the owner's playtest ("annoying continuous breathing-like noise").
   Source found: synthesized noise beds whose volume is swung by slow oscillators -> a breathing rhythm:
     - Sound 2.0 place ambience 'chatter' (cafés / bars / markets): band-passed white noise with 0.37 Hz + 3.1 Hz volume LFOs;
     - world ambience loop layers (ambience.js): crowd (1.3 Hz), traffic (.25 Hz), wind (.09 Hz) noise beds with deep LFOs.
   Fix:
     - 'chatter' is replaced by a murmur made of short, irregular voice-like grains (formant-filtered bursts with gaps): reads as distant
       people talking, never as a steady hiss or breath;
     - fake crowd / traffic / hum noise beds are dropped (their tick layers stay); natural beds (waves, rivers, fountains, cicadas, wind)
       keep playing but without the slow pumping (LFO depth capped);
     - passing vehicles: Doppler pass-bys in city worlds (scooters + tuk-tuks in Thailand / Vietnam, cars elsewhere, hover craft on Astro-9),
       panned and timed irregularly;
     - separate volume sliders in Settings: ambience, crowds, vehicles (S.set.va / vc / vv, 0..1).
   No licensed street recordings are in the local packs yet (assets/sfx/manifest.json lists them as missing); when CC0 recordings are
   added they can replace these generators through the same SND.GEN entries. */
'use strict';
(function (AV) {
const tr = AV.tr, LW = AV.LW;
const vol = k => { const s = (AV.S && AV.S.set) || {}; return s[k] == null ? 1 : +s[k] };
LW.audioStats = { murmurGrains: 0, passBys: 0, bedsDropped: 0 };
/* ---------- 1. world ambience beds ---------- */
addEventListener('load', () => { const AMB = AV.amb; if (!AMB || !AMB.start || AMB.start.__lw) return; const s0 = AMB.start;
  AMB.start = function (layers) { const L = {}; for (const k in layers || {}) { const d = layers[k]; if (!d) continue; const fake = /crowd|traffic|chatter|people|street|city|hum/i.test(k);
      if (d.loop && fake) { LW.audioStats.bedsDropped++; if (d.tick) L[k] = Object.assign({}, d, { loop: null }); continue }
      if (d.loop && d.loop.lfo) L[k] = Object.assign({}, d, { loop: Object.assign({}, d.loop, { lfo: [d.loop.lfo[0], Math.min(d.loop.lfo[1], .12)] }) }); else L[k] = d }
    const r = s0.call(this, L); try { if (AMB.master) AMB.master.gain.value = .9 * vol('va') } catch (e) { } return r }; AMB.start.__lw = 1;
  /* ---------- 2. murmur instead of breathing chatter ---------- */
  const SND = AV.snd; if (SND && SND.GEN) SND.GEN.chatter = (c, d) => { const out = c.createGain(); out.gain.value = .9; out.connect(d); let alive = true, nb = null;
    const buf = () => { if (nb) return nb; const n = c.sampleRate | 0, b = c.createBuffer(1, n, c.sampleRate), x = b.getChannelData(0); for (let i = 0; i < n; i++) x[i] = Math.random() * 2 - 1; return nb = b };
    const F = [[520, 1250], [700, 1100], [380, 2100], [600, 1700], [450, 900]];
    const grain = t => { const s = c.createBufferSource(); s.buffer = buf(); const [f1, f2] = F[Math.random() * F.length | 0], a = c.createBiquadFilter(), b2 = c.createBiquadFilter(), g = c.createGain(); a.type = b2.type = 'bandpass'; a.frequency.value = f1 * (.85 + Math.random() * .3); b2.frequency.value = f2 * (.85 + Math.random() * .3); a.Q.value = 7; b2.Q.value = 9;
      const len = .07 + Math.random() * .18, pk = (.25 + Math.random() * .5) * vol('vc'); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(pk, t + len * .3); g.gain.linearRampToValueAtTime(0, t + len); s.connect(a); s.connect(b2); a.connect(g); b2.connect(g); g.connect(out); s.start(t, Math.random() * .8, len + .02); LW.audioStats.murmurGrains++ };
    const loop = () => { if (!alive) return; const t = c.currentTime + .05; let k = 0; for (let tt = 0; tt < .5; ) { tt += .06 + Math.random() * (Math.random() < .25 ? .5 : .14); if (tt < .5 && k++ < 6) grain(t + tt) } setTimeout(loop, 500) }; loop();
    return [{ stop: () => { alive = false; try { out.disconnect() } catch (e) { } } }] } });
/* ---------- 3. passing vehicles ---------- */
const NATURE = { verdalux: 1, koh_samui_jurassic: 1, judean_desert: 1, nimbus: 1, jungle_dub: 1 }, THAI = { chiang_mai: 1, pai: 1, koh_tao: 1, da_nang: 1 };
let nextPass = 0;
function passBy(kind) { const A = AV.audio; if (!A || !A.ctx || A.mute || !A.ok) return; const c = A.ctx, t = c.currentTime + .05, dur = 2.6 + Math.random() * 2, dir = Math.random() < .5 ? -1 : 1, v = .22 * vol('vv') * (.6 + Math.random() * .6); if (v <= .01) return;
  const pan = c.createStereoPanner ? c.createStereoPanner() : null, g = c.createGain(), lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + dur * .5); g.gain.linearRampToValueAtTime(0, t + dur);
  lp.frequency.setValueAtTime(500, t); lp.frequency.linearRampToValueAtTime(1600, t + dur * .5); lp.frequency.linearRampToValueAtTime(450, t + dur);
  if (pan) { pan.pan.setValueAtTime(-.9 * dir, t); pan.pan.linearRampToValueAtTime(.9 * dir, t + dur) }
  const f0 = kind === 'scooter' ? 95 + Math.random() * 40 : kind === 'tuktuk' ? 70 + Math.random() * 20 : kind === 'hover' ? 180 : 48 + Math.random() * 20;
  const o = c.createOscillator(); o.type = kind === 'hover' ? 'sine' : kind === 'car' ? 'sawtooth' : 'square'; o.frequency.setValueAtTime(f0 * 1.08, t); o.frequency.linearRampToValueAtTime(f0 * .9, t + dur);   /* Doppler: higher coming, lower going */
  const o2 = c.createOscillator(); o2.type = 'sawtooth'; o2.frequency.value = f0 * 2.02; const g2 = c.createGain(); g2.gain.value = kind === 'hover' ? .5 : .25; o2.connect(g2); g2.connect(lp);
  if (kind === 'tuktuk' || kind === 'scooter') { const trem = c.createOscillator(), tg = c.createGain(); trem.frequency.value = kind === 'tuktuk' ? 22 : 38; tg.gain.value = v * .5; trem.connect(tg); tg.connect(g.gain); trem.start(t); trem.stop(t + dur + .1) }
  o.connect(lp); lp.connect(g); (pan ? (g.connect(pan), pan) : g).connect(A.mediaBus || c.destination); o.start(t); o2.start(t); o.stop(t + dur + .1); o2.stop(t + dur + .1); LW.audioStats.passBys++ }
LW.passBy = passBy;
AV.frameFns.push(() => { if (!AV.running || !AV.W || NATURE[AV.W.id]) return; const now = AV.now(); if (now < nextPass) return; const h = AV.S.time / 60, busy = h > 7 && h < 23 ? 1 : .3;
  nextPass = now + (5 + Math.random() * 12) / busy; if (AV.home && AV.home.inside) return; const id = AV.W.id;
  LW.passBy(id === 'astro9' ? 'hover' : THAI[id] ? (Math.random() < .3 ? 'tuktuk' : 'scooter') : (Math.random() < .25 ? 'scooter' : 'car')) });
/* ---------- 4. volume sliders ---------- */
addEventListener('load', () => { const t0 = AV.toggleSettings; if (!t0) return; AV.toggleSettings = function () { t0.apply(this, arguments); const p = document.getElementById('set'); if (!p || p.style.display !== 'block' || p.querySelector('#lwMix')) return; const S = AV.S.set, close = p.querySelector('[data-close]'), d = document.createElement('div'); d.id = 'lwMix';
  const row = (k, n) => '<label style="display:block">' + n + ' <input type="range" min="0" max="1" step=".05" data-mix="' + k + '" value="' + (S[k] == null ? 1 : S[k]) + '"></label>';
  d.innerHTML = '<p><b>' + tr('Sound mix', 'Mezcla de sonido') + '</b></p>' + row('va', tr('Ambience (nature, wind, water)', 'Ambiente (naturaleza, viento, agua)')) + row('vc', tr('Crowds and voices', 'Gente y voces')) + row('vv', tr('Vehicles', 'Vehículos'));
  p.insertBefore(d, close || null); d.querySelectorAll('[data-mix]').forEach(r => r.oninput = () => { S[r.dataset.mix] = +r.value; if (r.dataset.mix === 'va' && AV.amb && AV.amb.master) AV.amb.master.gain.value = .9 * +r.value; AV.save() }) } });
})(window.AV);
