/* APEVERSE - dj_mixer.js : Worlds Reborn §31, a real two-deck DJ mixer at every DJ booth (replaces the simple 'dj' activity of music_play.js,
   keeping its control ids so old tests and booths keep working). Your own tracks only (data/music.js).
   Per deck: waveform overview (click to seek), play / cue-to-start, time, BPM (playlist value, auto-detect from the audio, tap tempo,
   or type it), beat grid ("beat 1 here"), tempo fader ±16 % with KEY LOCK (the browser's pitch-preserving playback; quality is the
   browser's, not a pro time-stretcher), SYNC (matches the other deck's tempo and snaps the beat phase), 3-band EQ (low / mid / high,
   full kill), a filter knob (low-pass ◀ ▶ high-pass), trim + channel fader, 4 HOT CUES saved per track, beat LOOPS 1/2/4/8/16
   (quantised to the grid), level meter. Master: crossfader (smooth / sharp curve), auto-mix, ECHO (beat-synced delay, wet knob),
   REVERB (wet knob), master filter sweep, master meter. PFL: browsers have one audio output, so "cue" solos a deck for you to
   check it (the room hears it too); this is stated in the UI.
   Over http every control works; from file:// only play / volume / crossfade / tempo / cues / loops (no Web Audio on file media). */
'use strict';
(function (AV) {
const tr = AV.tr, $ = AV.$, A = AV.audio, ACT = AV.act; if (!ACT || !A) return;
const fmt = s => !isFinite(s) ? '--:--' : Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
const allTracks = () => { const out = [], seen = {}; for (const k in (AV.MUSIC || {})) { const P = AV.MUSIC[k]; (P.tracks || []).forEach(t => { if (seen[t.file]) return; seen[t.file] = 1; out.push({ file: t.file, title: t.title || t.file.split('/').pop(), list: P.name || k, bpm: t.bpm || P.bpm || 90 }) }) } return out };
const mem = () => { const S = AV.S; S.dj = S.dj || { trk: {} }; return S.dj };
const trk = file => { const m = mem().trk; return m[file] = m[file] || { bpm: null, grid: 0, cues: [null, null, null, null] } };
const css = document.createElement('style'); css.textContent = '#actHud.djx{min-width:min(900px,97vw);max-width:98vw;max-height:78vh;overflow:auto;padding:6px 10px}#actHud.djx .decks{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}#actHud.djx .deck{flex:1 1 300px;border:1px solid #6a5a9a;border-radius:8px;padding:5px;background:rgba(0,0,0,.28);text-align:left}' +
  '#actHud.djx canvas.wf{width:100%;height:54px;display:block;border-radius:4px;background:#0c0818;cursor:pointer;touch-action:none}#actHud.djx .row{display:flex;gap:4px;align-items:center;flex-wrap:wrap;margin:3px 0}#actHud.djx .row small{min-width:34px}#actHud.djx .row input[type=range]{flex:1;min-width:70px}' +
  '#actHud.djx button{padding:3px 7px;margin:1px;font:12px Georgia,serif}#actHud.djx button.on{background:#ffd84a;color:#000}#actHud.djx .cue{min-width:34px}#actHud.djx .cue.set{background:#ff4ad2;color:#fff}#actHud.djx input.bpm{width:58px;font:12px monospace}#actHud.djx .met{height:6px;background:#222;border-radius:3px;overflow:hidden;flex:1;min-width:60px}#actHud.djx .met i{display:block;height:100%;width:0;background:linear-gradient(90deg,#3aff8a,#ffd84a,#ff3a3a)}#actHud.djx .master{border:1px solid #ffd84a;border-radius:8px;padding:5px;margin-top:5px}';
document.head.appendChild(css);

/* ---------- audio graph ---------- */
let G = null;
function master() {
  if (G || !A.ok || AV.isFile) return G; const c = A.ctx, out = A.mediaBus || c.destination;
  const bus = c.createGain(), lp = c.createBiquadFilter(), hp = c.createBiquadFilter(), dl = c.createDelay(2), fb = c.createGain(), ew = c.createGain(), cv = c.createConvolver(), rw = c.createGain(), an = c.createAnalyser(), lim = c.createDynamicsCompressor();
  lp.type = 'lowpass'; lp.frequency.value = 20000; hp.type = 'highpass'; hp.frequency.value = 20; fb.gain.value = .42; ew.gain.value = 0; rw.gain.value = 0; an.fftSize = 512; lim.threshold.value = -3; lim.ratio.value = 12;
  const n = c.sampleRate * 2.4 | 0, ir = c.createBuffer(2, n, c.sampleRate); for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.6) } cv.buffer = ir;
  bus.connect(lp); lp.connect(hp); hp.connect(lim); hp.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(ew); ew.connect(lim); hp.connect(cv); cv.connect(rw); rw.connect(lim); lim.connect(an); an.connect(out);
  return G = { bus, lp, hp, dl, fb, ew, rw, an };
}
function deck(id) {
  const e = new Audio(); e.preload = 'auto'; e.loop = true; if (!AV.isFile) e.crossOrigin = 'anonymous'; const d = { id, el: e, vol: .9, trim: 1, track: null, eq: [0, 0, 0], filt: 0, rate: 1, keylock: true, loop: null, synced: false };
  const M = master(); if (M) { try { const c = A.ctx; d.src = c.createMediaElementSource(e); d.tg = c.createGain(); d.lo = c.createBiquadFilter(); d.mi = c.createBiquadFilter(); d.hi = c.createBiquadFilter(); d.flp = c.createBiquadFilter(); d.fhp = c.createBiquadFilter(); d.an = c.createAnalyser(); d.g = c.createGain();
    d.lo.type = 'lowshelf'; d.lo.frequency.value = 220; d.mi.type = 'peaking'; d.mi.frequency.value = 1000; d.mi.Q.value = .9; d.hi.type = 'highshelf'; d.hi.frequency.value = 3800; d.flp.type = 'lowpass'; d.flp.frequency.value = 20000; d.fhp.type = 'highpass'; d.fhp.frequency.value = 20; d.an.fftSize = 256;
    d.src.connect(d.tg); d.tg.connect(d.lo); d.lo.connect(d.mi); d.mi.connect(d.hi); d.hi.connect(d.flp); d.flp.connect(d.fhp); d.fhp.connect(d.an); d.an.connect(d.g); d.g.connect(M.bus) } catch (x) { d.g = null } }
  return d;
}
const DJ = AV.dj = { decks: null, x: 0, curve: 'smooth', filter: 0, echo: false, echoWet: .45, rev: 0, auto: null, pfl: null, peaks: {} };
const xg = (k, x) => { if (DJ.curve === 'sharp') { const v = k === 'a' ? Math.min(1, (1 - x) * 3.2) : Math.min(1, x * 3.2); return v } return k === 'a' ? Math.cos(x * Math.PI / 2) : Math.sin(x * Math.PI / 2) };
DJ.bpm = k => { const d = DJ.decks[k]; if (!d.track) return 0; const m = trk(d.track.file); return (m.bpm || d.track.bpm) };
DJ.ebpm = k => DJ.bpm(k) * DJ.decks[k].rate;   // effective tempo (with the tempo fader)
DJ.phase = k => { const d = DJ.decks[k], b = DJ.bpm(k); if (!b) return 0; const m = trk(d.track.file), p = (d.el.currentTime - m.grid) * b / 60; return ((p % 1) + 1) % 1 };
DJ.beatLen = k => 60 / (DJ.bpm(k) || 120);
DJ.load = (k, i) => { const d = DJ.decks[k], t = DJ.tracks[i]; if (!t) return; d.track = t; d.loop = null; d.synced = false; d.el.src = t.file; d.el.currentTime = 0; d.ready = false; d.el.oncanplay = () => d.ready = true; analyse(t); DJ.mix() };
DJ.play = (k, on) => { const d = DJ.decks[k]; if (!d.track) return false; if (on === undefined) on = d.el.paused; if (on) { if (A.ok && A.ctx.state === 'suspended') A.ctx.resume(); const p = d.el.play(); if (p && p.catch) p.catch(() => { }) } else d.el.pause(); return on };
DJ.setRate = (k, r) => { const d = DJ.decks[k]; d.rate = Math.max(.84, Math.min(1.16, r)); d.el.playbackRate = d.rate; try { d.el.preservesPitch = d.el.mozPreservesPitch = d.el.webkitPreservesPitch = d.keylock } catch (e) { } };
DJ.sync = k => { const o = k === 'a' ? 'b' : 'a', ob = DJ.ebpm(o), b = DJ.bpm(k); if (!ob || !b || !DJ.decks[o].track) return false;
  /* match the other deck's tempo, or its half / double time, whichever needs the smallest tempo change (like real DJ software) */
  const r = [ob, ob * 2, ob / 2].map(t => t / b).sort((x, y) => Math.abs(x - 1) - Math.abs(y - 1))[0]; if (Math.abs(r - 1) > .16) { AV.toast(tr('Tempos too far apart to sync (over ±16 %). Pick a closer track or set the BPM.', 'Tempos demasiado distintos para sincronizar (más de ±16 %). Elige otro tema o ajusta el BPM.')); return false } DJ.setRate(k, r); const d = DJ.decks[k]; let dp = DJ.phase(o) - DJ.phase(k); if (dp > .5) dp -= 1; if (dp < -.5) dp += 1; d.el.currentTime = Math.max(0, d.el.currentTime + dp * DJ.beatLen(k)); d.synced = true; return true };
DJ.cue = (k, i, clear) => { const d = DJ.decks[k]; if (!d.track) return; const m = trk(d.track.file); if (clear) { m.cues[i] = null; return } if (m.cues[i] == null) { m.cues[i] = quant(k, d.el.currentTime) } else { d.el.currentTime = m.cues[i]; if (d.el.paused) DJ.play(k, true) } AV.save() };
const quant = (k, t) => { const m = trk(DJ.decks[k].track.file), bl = DJ.beatLen(k); return Math.max(0, m.grid + Math.round((t - m.grid) / bl) * bl) };
DJ.loopOn = (k, beats) => { const d = DJ.decks[k]; if (!d.track) return; if (d.loop && d.loop.beats === beats) { d.loop = null; return } const m = trk(d.track.file), bl = DJ.beatLen(k), st = m.grid + Math.floor((d.el.currentTime - m.grid) / bl + 1e-6) * bl; d.loop = { beats, a: Math.max(0, st), b: Math.max(0, st) + beats * bl } };
DJ.tap = k => { const d = DJ.decks[k]; if (!d.track) return; const now = performance.now(); d.taps = (d.taps || []).filter(t => now - t < 3000); d.taps.push(now); if (d.taps.length >= 4) { const iv = (d.taps[d.taps.length - 1] - d.taps[0]) / (d.taps.length - 1); trk(d.track.file).bpm = Math.round(60000 / iv * 10) / 10; AV.save() } };
DJ.gridHere = k => { const d = DJ.decks[k]; if (!d.track) return; trk(d.track.file).grid = d.el.currentTime % DJ.beatLen(k); AV.save() };
DJ.mix = () => {
  if (!DJ.decks) return; const S = AV.S.set, mv = A.mute ? 0 : (S.vm == null ? .8 : S.vm);
  for (const k of ['a', 'b']) { const d = DJ.decks[k], solo = DJ.pfl && DJ.pfl !== k ? 0 : 1, v = d.vol * xg(k, DJ.pfl === k ? (k === 'a' ? 0 : 1) : DJ.x) * solo;
    if (d.g) { d.g.gain.value = v; d.tg.gain.value = d.trim; d.el.volume = 1; const db = g => g <= -1 ? -40 : g * (g < 0 ? 26 : 6); d.lo.gain.value = db(d.eq[0]); d.mi.gain.value = db(d.eq[1]); d.hi.gain.value = db(d.eq[2]);
      d.flp.frequency.value = d.filt < 0 ? 20000 * Math.pow(.01, -d.filt) : 20000; d.fhp.frequency.value = d.filt > 0 ? 20 * Math.pow(250, d.filt) : 20 }
    else d.el.volume = Math.max(0, Math.min(1, v * d.trim * mv)) }
  const M = G; if (M) { const f = DJ.filter; M.lp.frequency.value = f < 0 ? 20000 * Math.pow(.012, -f) : 20000; M.hp.frequency.value = f > 0 ? 20 * Math.pow(200, f) : 20; M.ew.gain.value = DJ.echo ? DJ.echoWet : 0; M.fb.gain.value = DJ.echo ? .42 : 0; M.rw.gain.value = DJ.rev * .8;
    const lk = DJ.level('a') >= DJ.level('b') ? 'a' : 'b', bl = DJ.decks[lk].track ? DJ.beatLen(lk) / DJ.decks[lk].rate : .5; M.dl.delayTime.value = Math.min(1.9, bl * .75) }
};
DJ.level = k => { const d = DJ.decks[k]; return d.el.paused || !d.track ? 0 : d.vol * xg(k, DJ.x) };
DJ.playing = () => !!DJ.decks && (DJ.level('a') > .05 || DJ.level('b') > .05);
/* waveform peaks + BPM / first-beat estimate from the decoded audio (only over http; cached per file for the session) */
const busy = {};
function analyse(t) { if (DJ.peaks[t.file] || busy[t.file] || !A.ok || AV.isFile || !window.fetch) return; busy[t.file] = 1;
  fetch(t.file).then(r => r.arrayBuffer()).then(b => A.ctx.decodeAudioData(b)).then(buf => { const ch = buf.getChannelData(0), N = 600, step = Math.floor(ch.length / N), pk = new Float32Array(N); for (let i = 0; i < N; i++) { let m = 0; for (let j = i * step, e = j + step; j < e; j += 16) { const v = Math.abs(ch[j]); if (v > m) m = v } pk[i] = m }
    /* tempo: onset envelope at 100 Hz over up to 90 s, autocorrelation between 70 and 180 BPM */
    const sr = buf.sampleRate, hop = sr / 100 | 0, L = Math.min(9000, ch.length / hop | 0), env = new Float32Array(L); let prev = 0; for (let i = 0; i < L; i++) { let s = 0; for (let j = i * hop, e = j + hop; j < e; j += 4) s += ch[j] * ch[j]; s = Math.sqrt(s / (hop / 4)); env[i] = Math.max(0, s - prev); prev = s }
    let best = 0, bl = 0; for (let lag = 33; lag <= 86; lag++) { let s = 0; for (let i = lag; i < L; i++) s += env[i] * env[i - lag]; s *= 1 + .1 * Math.exp(-Math.pow((6000 / lag - 120) / 40, 2)); if (s > best) { best = s; bl = lag } }
    const bpm = Math.round(6000 / bl * 10) / 10; let gp = 0, gv = -1; for (let i = 0; i < Math.min(L, bl); i++) { let s = 0; for (let j = i; j < L; j += bl) s += env[j]; if (s > gv) { gv = s; gp = i } }
    DJ.peaks[t.file] = { pk, dur: buf.duration, bpm, grid: gp / 100 }; const m = trk(t.file); if (!m.bpm && m.auto !== false) { m.bpm = bpm; m.grid = gp / 100; m.auto = true } if (ACT.cur && ACT.cur.id === 'dj') ACT.draw() })
    .catch(() => { DJ.peaks[t.file] = { pk: null } }).finally(() => { busy[t.file] = 0 }) }
DJ._analyse = analyse;
function crowdDance(v, secs) { const W = AV.W; if (!W || !secs) return 0; let n = 0; for (const t of W.T) { const b = t.being; if (!b || !b.h) continue; if (Math.hypot(b.h.position.x - v.x, b.h.position.z - v.z) < 22) { b.danceUntil = AV.now() + secs; n++ } } return n }
/* loops are held by a fast timer too (a slow frame rate would otherwise overshoot the loop end) */
setInterval(() => { if (!DJ.decks) return; for (const k of ['a', 'b']) { const d = DJ.decks[k], L = d.loop; if (L && !d.el.paused && d.el.currentTime >= L.b - .004) d.el.currentTime = L.a + (d.el.currentTime - L.b) } }, 5);

ACT.register('dj', {
  noAct: true,
  start(s) {
    if (!DJ.decks) DJ.decks = { a: deck('a'), b: deck('b') }; DJ.tracks = allTracks(); s.tracks = DJ.tracks; s.played = 0; DJ.x = 0; DJ.filter = 0; DJ.echo = false; DJ.rev = 0; DJ.auto = null; DJ.pfl = null; s.clr = false;
    const cur = A.track && A.track.el && decodeURI(A.track.el.src || ''), free = DJ.tracks.map((t, i) => i).filter(i => !cur || !cur.endsWith(DJ.tracks[i].file));
    if (!DJ.decks.a.track && free.length) DJ.load('a', free[0]); if (!DJ.decks.b.track && free.length > 1) DJ.load('b', free[Math.floor(free.length / 2)]);
    for (const k of ['a', 'b']) { DJ.setRate(k, DJ.decks[k].rate); if (DJ.decks[k].track) analyse(DJ.decks[k].track) }
    A.hold = true; if (A.track && A.track.el) { try { A.track.el.pause() } catch (e) { } } AV.pushModal('dj', () => ACT.end('leave')); $('actHud').classList.add('djx'); DJ.mix();
    AV.toast(tr('DJ mixer: two decks, sync, EQ, hot cues, loops, echo + reverb. World music waits. Esc / Leave to stop.', 'Mezclador DJ: dos platos, sync, EQ, hot cues, loops, eco + reverb. La música del mundo espera. Esc / Salir para terminar.'));
  },
  end(s) { for (const k of ['a', 'b']) { const d = DJ.decks[k]; try { d.el.pause() } catch (e) { } d.loop = null } DJ.echo = false; DJ.rev = 0; DJ.pfl = null; DJ.mix(); if (G) { G.fb.gain.value = 0; G.ew.gain.value = 0; G.rw.gain.value = 0 }
    A.hold = false; AV.popModal('dj'); $('actHud').classList.remove('djx'); if (A.track && A.track.active) A.track.resume();
    const S = ACT.stats('dj'); S.sets = (S.sets || 0) + 1; S.secs = (S.secs || 0) + Math.round(s.djSecs || 0); if ((s.djSecs || 0) > 20) AV.vitals && AV.vitals.add(0, 8) },
  hud(s) {
    const fx = !G ? ' disabled' : '', opt = sel => s.tracks.map((t, i) => '<option value="' + i + '"' + (sel && sel.file === t.file ? ' selected' : '') + '>' + t.title + ' · ' + t.list + '</option>').join('');
    const dk = k => { const d = DJ.decks[k], m = d.track ? trk(d.track.file) : { cues: [] }, pk = d.track && DJ.peaks[d.track.file];
      return '<div class="deck"><div class="row"><b>' + k.toUpperCase() + '</b><select id="djS' + k + '">' + opt(d.track) + '</select></div>' +
        '<canvas class="wf" id="djW' + k + '" width="600" height="54"></canvas>' +
        '<div class="row"><button id="djP' + k + '">' + (d.el.paused ? '▶' : '❚❚') + '</button><button id="djC' + k + '" title="' + tr('back to the start', 'volver al inicio') + '">⏮</button><span id="djT' + k + '">' + fmt(d.el.currentTime) + '</span> · <b id="djB' + k + '">' + (DJ.ebpm(k) || 0).toFixed(1) + '</b> BPM ' +
        '<input class="bpm" id="djBi' + k + '" type="number" step=".1" min="60" max="200" value="' + (DJ.bpm(k) || '') + '" title="BPM"><button id="djTap' + k + '">' + tr('Tap', 'Tap') + '</button><button id="djG' + k + '" title="' + tr('beat 1 is here', 'el tiempo 1 está aquí') + '">⌖1</button>' + (pk && pk.bpm ? '<small>' + tr('auto ', 'auto ') + pk.bpm + '</small>' : '') + '</div>' +
        '<div class="row"><small>' + tr('tempo', 'tempo') + '</small><input id="djR' + k + '" type="range" min=".84" max="1.16" step=".001" value="' + d.rate + '"><span id="djRv' + k + '">' + ((d.rate - 1) * 100).toFixed(1) + '%</span><button id="djSy' + k + '" class="' + (d.synced ? 'on' : '') + '">SYNC</button><button id="djK' + k + '" class="' + (d.keylock ? 'on' : '') + '">' + tr('Key lock', 'Bloq. tono') + '</button></div>' +
        '<div class="row">' + [0, 1, 2, 3].map(i => '<button class="cue' + (m.cues[i] != null ? ' set' : '') + '" data-cue="' + k + i + '">' + (i + 1) + '</button>').join('') + '<button id="djClr" class="' + (s.clr ? 'on' : '') + '">' + tr('clear', 'borrar') + '</button> ' +
        [1, 2, 4, 8, 16].map(n => '<button data-loop="' + k + n + '" class="' + (d.loop && d.loop.beats === n ? 'on' : '') + '">⟳' + n + '</button>').join('') + '</div>' +
        ['low', 'mid', 'high'].map((n, i) => '<div class="row"><small>' + tr(n, ['graves', 'medios', 'agudos'][i]) + '</small><input data-eq="' + k + i + '" type="range" min="-1" max="1" step=".02" value="' + d.eq[i] + '"' + fx + '></div>').join('') +
        '<div class="row"><small>' + tr('filter', 'filtro') + '</small><input id="djFl' + k + '" type="range" min="-1" max="1" step=".02" value="' + d.filt + '"' + fx + '><small>' + tr('trim', 'ganancia') + '</small><input id="djTr' + k + '" type="range" min="0" max="1.6" step=".02" value="' + d.trim + '"></div>' +
        '<div class="row"><small>' + tr('fader', 'fader') + '</small><input id="djV' + k + '" type="range" min="0" max="1" step=".02" value="' + d.vol + '"><button id="djPfl' + k + '" class="' + (DJ.pfl === k ? 'on' : '') + '" title="' + tr('solo this deck to check it (one audio output: the room hears it too)', 'solo de este plato para comprobarlo (una sola salida: la sala lo oye también)') + '">CUE</button><div class="met"><i id="djM' + k + '"></i></div></div></div>' };
    return '<b>🎧 ' + tr(s.v.p.name[0], s.v.p.name[1]) + '</b> <small>· ' + tr('your own tracks only', 'solo tus propios temas') + (G ? '' : tr(' · file mode: EQ / filter / FX need http', ' · modo archivo: EQ / filtro / FX necesitan http')) + '</small><div class="decks">' + dk('a') + dk('b') + '</div>' +
      '<div class="master"><div class="row"><small>A</small><input id="djX" type="range" min="0" max="1" step=".01" value="' + DJ.x + '"><small>B</small><button id="djCv">' + (DJ.curve === 'smooth' ? tr('curve: smooth', 'curva: suave') : tr('curve: sharp', 'curva: corte')) + '</button><button id="djAuto">' + tr('Auto-mix 8 s', 'Auto-mezcla 8 s') + '</button></div>' +
      '<div class="row"><small>' + tr('filter', 'filtro') + '</small><input id="djF" type="range" min="-1" max="1" step=".02" value="' + DJ.filter + '"' + fx + '><button id="djE"' + fx + ' class="' + (DJ.echo ? 'on' : '') + '">' + tr('Echo: ', 'Eco: ') + (DJ.echo ? 'ON' : 'OFF') + '</button><input id="djEw" type="range" min="0" max=".9" step=".02" value="' + DJ.echoWet + '"' + fx + ' title="echo wet"><small>' + tr('reverb', 'reverb') + '</small><input id="djRv" type="range" min="0" max="1" step=".02" value="' + DJ.rev + '"' + fx + '></div>' +
      '<div class="row"><small>' + tr('master', 'master') + '</small><div class="met"><i id="djMm"></i></div><small id="djInfo"></small><span class="beatdot" id="djBeat"></span></div></div>';
  },
  wire(s) {
    const on = (id, ev, f) => { const e = $(id); if (e) e[ev] = f };
    for (const k of ['a', 'b']) { const d = DJ.decks[k];
      on('djS' + k, 'onchange', e => { const was = !d.el.paused; DJ.load(k, +e.target.value); if (was) DJ.play(k, true); ACT.draw() }); on('djP' + k, 'onclick', () => { if (DJ.play(k)) s.played++; ACT.draw() }); on('djC' + k, 'onclick', () => { d.el.currentTime = 0 });
      on('djV' + k, 'oninput', e => { d.vol = +e.target.value; DJ.mix() }); on('djTr' + k, 'oninput', e => { d.trim = +e.target.value; DJ.mix() }); on('djFl' + k, 'oninput', e => { d.filt = +e.target.value; DJ.mix() });
      on('djR' + k, 'oninput', e => { DJ.setRate(k, +e.target.value); d.synced = false }); on('djSy' + k, 'onclick', () => { DJ.sync(k); ACT.draw() }); on('djK' + k, 'onclick', () => { d.keylock = !d.keylock; DJ.setRate(k, d.rate); ACT.draw() });
      on('djBi' + k, 'onchange', e => { if (d.track) { trk(d.track.file).bpm = Math.max(60, Math.min(200, +e.target.value || 0)) || null; AV.save(); ACT.draw() } }); on('djTap' + k, 'onclick', () => { DJ.tap(k); const b = $('djBi' + k); if (b && d.track) b.value = DJ.bpm(k) }); on('djG' + k, 'onclick', () => DJ.gridHere(k));
      on('djPfl' + k, 'onclick', () => { DJ.pfl = DJ.pfl === k ? null : k; DJ.mix(); ACT.draw() });
      const wf = $('djW' + k); if (wf) { drawWave(k); wf.addEventListener('pointerdown', e => { const r = wf.getBoundingClientRect(), u = (e.clientX - r.left) / r.width, dur = d.el.duration || (DJ.peaks[d.track && d.track.file] || {}).dur; if (isFinite(dur)) d.el.currentTime = Math.max(0, Math.min(dur - .1, u * dur)) }) } }
    document.querySelectorAll('#actHud [data-eq]').forEach(e => e.oninput = () => { const k = e.dataset.eq[0], i = +e.dataset.eq[1]; DJ.decks[k].eq[i] = +e.value; DJ.mix() });
    document.querySelectorAll('#actHud [data-cue]').forEach(b => b.onclick = ev => { const k = b.dataset.cue[0], i = +b.dataset.cue[1]; DJ.cue(k, i, s.clr || ev.shiftKey); if (s.clr) s.clr = false; ACT.draw() });
    document.querySelectorAll('#actHud [data-loop]').forEach(b => b.onclick = () => { DJ.loopOn(b.dataset.loop[0], +b.dataset.loop.slice(1)); ACT.draw() });
    on('djClr', 'onclick', () => { s.clr = !s.clr; ACT.draw() });
    on('djX', 'oninput', e => { DJ.x = +e.target.value; DJ.auto = null; DJ.mix() }); on('djCv', 'onclick', () => { DJ.curve = DJ.curve === 'smooth' ? 'sharp' : 'smooth'; DJ.mix(); ACT.draw() });
    on('djF', 'oninput', e => { DJ.filter = +e.target.value; DJ.mix() }); on('djE', 'onclick', () => { DJ.echo = !DJ.echo; DJ.mix(); ACT.draw() }); on('djEw', 'oninput', e => { DJ.echoWet = +e.target.value; DJ.mix() }); on('djRv', 'oninput', e => { DJ.rev = +e.target.value; DJ.mix() });
    on('djAuto', 'onclick', () => { const to = DJ.x < .5 ? 1 : 0, k = to ? 'b' : 'a'; if (DJ.decks[k].el.paused) DJ.play(k, true); DJ.auto = { from: DJ.x, to, t0: AV.now(), dur: 8 } });
  },
  update(s, dt) {
    if (DJ.auto) { const k = Math.min(1, (AV.now() - DJ.auto.t0) / DJ.auto.dur); DJ.x = DJ.auto.from + (DJ.auto.to - DJ.auto.from) * k; DJ.mix(); const xs = $('djX'); if (xs) xs.value = DJ.x; if (k >= 1) DJ.auto = null }
    for (const k of ['a', 'b']) { const d = DJ.decks[k], e = $('djT' + k); if (e) e.textContent = fmt(d.el.currentTime); const b = $('djB' + k); if (b) b.textContent = (DJ.ebpm(k) || 0).toFixed(1); drawWave(k); const m = $('djM' + k); if (m) m.style.width = (meter(d.an) * 100).toFixed(0) + '%' }
    const mm = $('djMm'); if (mm) mm.style.width = (meter(G && G.an) * 100).toFixed(0) + '%';
    const la = DJ.level('a'), lb = DJ.level('b'), lk = la >= lb ? 'a' : 'b', d = DJ.decks[lk];
    if (la + lb > .05 && d.track) { A.bpm = DJ.ebpm(lk); A.beat = (d.el.currentTime - trk(d.track.file).grid) * DJ.bpm(lk) / 60; s.djSecs = (s.djSecs || 0) + dt }
    if (G && d.track) G.dl.delayTime.value = Math.min(1.9, DJ.beatLen(lk) / d.rate * .75);
    const bd = $('djBeat'); if (bd) bd.style.background = la + lb > .05 && (A.beat % 1) < .18 ? '#ffd84a' : '#333';
    const info = $('djInfo'); if (info) info.textContent = (la + lb > .05 ? tr('♪ live · dancers: ', '♪ en vivo · bailando: ') + (s.dancers || 0) : tr('Press ▶ on a deck to start', 'Pulsa ▶ en un plato para empezar'));
    s.acc = (s.acc || 0) + dt; if (s.acc > 1) { s.acc = 0; s.dancers = crowdDance(s.v, la + lb > .05 ? 6 : 0) }
  }
});
const mbuf = new Uint8Array(256); function meter(an) { if (!an) return 0; an.getByteTimeDomainData(mbuf); let m = 0; for (let i = 0; i < an.fftSize && i < 256; i++) m = Math.max(m, Math.abs(mbuf[i] - 128)); return Math.min(1, m / 110) }
function drawWave(k) { const c = $('djW' + k), d = DJ.decks && DJ.decks[k]; if (!c || !d) return; const g = c.getContext('2d'), W = c.width, H = c.height, pk = d.track && DJ.peaks[d.track.file], dur = d.el.duration || (pk && pk.dur) || 0, m = d.track ? trk(d.track.file) : null;
  g.fillStyle = '#0c0818'; g.fillRect(0, 0, W, H);
  if (pk && pk.pk) { g.fillStyle = k === 'a' ? '#4ad8ff' : '#ff4ad2'; for (let i = 0; i < pk.pk.length; i++) { const h = pk.pk[i] * H * .95; g.fillRect(i * W / pk.pk.length, (H - h) / 2, Math.max(1, W / pk.pk.length - .3), h) } } else { g.fillStyle = '#3a3050'; g.fillRect(0, H / 2 - 1, W, 2); g.fillStyle = '#aaa'; g.font = '11px sans-serif'; g.fillText(AV.isFile ? tr('waveform needs http', 'la onda necesita http') : tr('analysing…', 'analizando…'), 6, 13) }
  if (!dur) return; if (d.loop) { g.fillStyle = 'rgba(255,216,74,.3)'; g.fillRect(d.loop.a / dur * W, 0, (d.loop.b - d.loop.a) / dur * W, H) }
  if (m) m.cues.forEach((t, i) => { if (t == null) return; const x = t / dur * W; g.fillStyle = '#ff4ad2'; g.fillRect(x, 0, 2, H); g.fillStyle = '#fff'; g.font = 'bold 10px sans-serif'; g.fillText(String(i + 1), x + 3, 10) });
  g.fillStyle = '#fff'; g.fillRect(d.el.currentTime / dur * W - 1, 0, 2, H) }
})(window.AV);
