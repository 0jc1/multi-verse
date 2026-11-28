/* APEVERSE 2.3 - lw_dj.js : "APE·DJ PRO", a two-deck DJ controller view (functional inspiration: Serato DJ Intro / DJUCED; original
   Apeverse branding) on top of the real audio engine in dj_mixer.js (AV.dj: Web Audio EQ, filters, sync, hot cues, loops, echo/reverb).
   Opens automatically at every DJ booth (clubs, studios, festivals, home decks) - button "Classic view" returns to the old panel.
   Per deck: jog wheel (drag the platter while playing = scratch: the playback rate follows your hand, backwards by stepping back;
   while paused = seek; drag the outer ring = nudge ±8 % for beat-matching by ear), scrolling colour waveform (8 s window, playhead in the
   centre, colour = loudness), track title, BPM (effective, with the pitch fader), pitch %, elapsed / remaining, PLAY, CUE (back to the
   cue point), 4 HOT CUES, LOOP 1/2/4/8, SYNC, KEY LOCK, pitch fader ±16 %.  Mixer: per channel GAIN, HIGH / MID / LOW EQ, FILTER
   (low-pass ◀ ▶ high-pass), channel fader, CUE (headphone pre-listen: browsers have one output, so it solos the deck - stated in the UI),
   level meters, CROSSFADER, MASTER volume.  Library: searchable list of the owner's tracks (ZtonedApe, Stone Ape Band, Jungle Dub...),
   LOAD A / LOAD B.  Mouse and touch (pointer events).  AV.LW.djPro.open() / close() / state(). */
'use strict';
(function (AV) {
const tr = AV.tr, LW = AV.LW, esc = LW.esc;
const PRO = LW.djPro = { on: false, stats: { scratches: 0, nudges: 0, seeks: 0, loads: 0 } };
const fmt = s => !isFinite(s) || s < 0 ? '--:--' : Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
const css = document.createElement('style'); css.textContent = '#lwDJ{position:fixed;inset:0;z-index:70;background:#0b0a10;color:#e8e8f0;font:12px system-ui,Arial,sans-serif;display:none;flex-direction:column;user-select:none;touch-action:none}' +
  '#lwDJ .top{display:flex;align-items:center;gap:10px;padding:6px 10px;background:linear-gradient(#1c1a28,#121018);border-bottom:1px solid #2a2840}#lwDJ .top b{color:#ff4ad2;font-size:15px;letter-spacing:2px}#lwDJ .wf{height:70px;margin:4px 8px;display:flex;flex-direction:column;gap:3px}#lwDJ .wf canvas{width:100%;height:33px;background:#08070c;border-radius:4px}' +
  '#lwDJ .main{flex:1;display:flex;gap:6px;padding:4px 8px;min-height:0}#lwDJ .deck{flex:1;background:#15131e;border:1px solid #2a2840;border-radius:10px;padding:6px;display:flex;flex-direction:column;align-items:center;gap:5px;min-width:0}#lwDJ .mixer{flex:0 0 250px;background:#121018;border:1px solid #2a2840;border-radius:10px;padding:6px;display:flex;flex-direction:column;gap:4px}' +
  '#lwDJ .info{width:100%;display:flex;justify-content:space-between;gap:6px}#lwDJ .ttl{font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#lwDJ .bpm{font:700 20px monospace;color:#7ad8ff}#lwDJ .jog{width:min(230px,26vh);height:min(230px,26vh);border-radius:50%;cursor:grab}' +
  '#lwDJ button{font:700 11px system-ui,Arial;padding:6px 8px;border-radius:6px;border:1px solid #3a3850;background:#22202e;color:#e8e8f0;cursor:pointer;min-width:38px}#lwDJ button.on{background:#ff4ad2;color:#fff;border-color:#ff9ae8}#lwDJ button.play{background:#1a4a2a}#lwDJ button.play.on{background:#3ad87a;color:#081}' +
  '#lwDJ .row{display:flex;gap:4px;flex-wrap:wrap;justify-content:center}#lwDJ .knob{display:flex;flex-direction:column;align-items:center;font-size:10px;width:52px}#lwDJ input[type=range]{accent-color:#ff4ad2;width:100%}#lwDJ input.v{writing-mode:vertical-lr;direction:rtl;width:22px;height:110px}' +
  '#lwDJ .lib{height:150px;display:flex;flex-direction:column;margin:4px 8px 8px;background:#121018;border:1px solid #2a2840;border-radius:8px}#lwDJ .lib input{margin:4px;padding:5px;background:#0b0a10;color:#fff;border:1px solid #3a3850;border-radius:6px}#lwDJ .lib .ls{overflow:auto;flex:1}#lwDJ .lib .it{display:flex;gap:6px;align-items:center;padding:2px 6px;border-bottom:1px solid #1e1c2a}#lwDJ .lib .it span{flex:1}' +
  '#lwDJ .meter{width:8px;height:110px;background:#08070c;border-radius:3px;position:relative;overflow:hidden}#lwDJ .meter i{position:absolute;left:0;right:0;bottom:0;background:linear-gradient(#ff3a3a,#ffd23a 25%,#3ad87a 60%)}';
document.head.appendChild(css);
const ov = document.createElement('div'); ov.id = 'lwDJ'; document.body.appendChild(ov);
const D = () => AV.dj, deck = k => D().decks && D().decks[k];
function deckHtml(k) { return '<div class="deck" data-deck="' + k + '"><div class="info"><div style="min-width:0"><div class="ttl" data-t="ttl">—</div><div style="opacity:.7" data-t="time">--:-- / -' + '--:--</div></div><div style="text-align:right"><div class="bpm" data-t="bpm">---</div><div data-t="pitch" style="opacity:.8">±0.0%</div></div></div>' +
  '<div style="display:flex;gap:8px;align-items:center"><canvas class="jog" width="260" height="260" data-jog="' + k + '"></canvas><div style="display:flex;flex-direction:column;align-items:center;font-size:10px">PITCH<input class="v" type="range" min="-16" max="16" step=".1" value="0" data-pitch="' + k + '"></div></div>' +
  '<div class="row"><button class="play" data-a="play">▶❚❚</button><button data-a="cue">CUE</button><button data-a="sync">SYNC</button><button data-a="key">KEY</button></div>' +
  '<div class="row">' + [0, 1, 2, 3].map(i => '<button data-hc="' + i + '">' + (i + 1) + '</button>').join('') + '<button data-a="clrhc" title="hold Shift to clear">✕</button></div>' +
  '<div class="row">' + [1, 2, 4, 8].map(b => '<button data-lp="' + b + '">' + b + '</button>').join('') + '<span style="opacity:.6;align-self:center">LOOP</span></div></div>' }
const knob = (k, key, lab, min, max, val) => '<div class="knob">' + lab + '<input type="range" min="' + min + '" max="' + max + '" step=".01" value="' + val + '" data-k="' + k + '" data-f="' + key + '"></div>';
function mixerHtml() { const ch = k => '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px"><b style="color:' + (k === 'a' ? '#7ad8ff' : '#ff9a3a') + '">' + k.toUpperCase() + '</b>' + knob(k, 'trim', 'GAIN', 0, 2, 1) + knob(k, 'eq2', 'HIGH', -1, 1, 0) + knob(k, 'eq1', 'MID', -1, 1, 0) + knob(k, 'eq0', 'LOW', -1, 1, 0) + knob(k, 'filt', 'FILTER', -1, 1, 0) +
    '<div style="display:flex;gap:4px;align-items:flex-end"><div class="meter"><i data-m="' + k + '"></i></div><input class="v" type="range" min="0" max="1" step=".01" value=".9" data-k="' + k + '" data-f="vol"></div><button data-pfl="' + k + '">🎧 CUE</button></div>';
  return '<div class="mixer"><div style="display:flex;gap:6px">' + ch('a') + ch('b') + '</div><div style="text-align:center;font-size:10px">CROSSFADER<input type="range" min="0" max="1" step=".01" value="0" data-x="1"></div><div style="text-align:center;font-size:10px">MASTER<input type="range" min="0" max="1" step=".01" value="' + ((AV.S.set && AV.S.set.vm) != null ? AV.S.set.vm : .8) + '" data-master="1"></div>' +
    '<div style="font-size:10px;opacity:.6;text-align:center">' + tr('🎧 CUE solos a deck to pre-listen: browsers have a single audio output, so the room hears it too.', '🎧 CUE deja un plato en solo para preescuchar: el navegador tiene una sola salida, así que la sala también lo oye.') + '</div></div>' }
PRO.open = function () { if (!D() || !D().decks) return false; PRO.on = true; ov.innerHTML = '<div class="top"><b>APE·DJ PRO</b><span style="opacity:.7">' + tr('two-deck controller · your own tracks', 'controlador de dos platos · tus propios temas') + '</span><span style="flex:1"></span><button data-a="classic">' + tr('Classic view', 'Vista clásica') + '</button><button data-a="close">✕ ' + tr('Leave the decks', 'Dejar los platos') + '</button></div>' +
    '<div class="wf"><canvas data-wf="a" width="1400" height="66"></canvas><canvas data-wf="b" width="1400" height="66"></canvas></div><div class="main">' + deckHtml('a') + mixerHtml() + deckHtml('b') + '</div>' +
    '<div class="lib"><input type="search" placeholder="🔍 ' + tr('Search your library (title, album)...', 'Busca en tu biblioteca (título, álbum)...') + '" data-q="1"><div class="ls"></div></div>'; ov.style.display = 'flex'; wire(); lib(''); return true };
PRO.close = (leave) => { PRO.on = false; ov.style.display = 'none'; if (leave && AV.act && AV.act.cur && AV.act.cur.id === 'dj' && AV.act.end) try { AV.act.end('left') } catch (e) { } };
PRO.state = () => { const s = {}; for (const k of ['a', 'b']) { const d = deck(k); s[k] = d && { track: d.track && d.track.title, t: d.el.currentTime, paused: d.el.paused, rate: d.rate, eq: d.eq.slice(), vol: d.vol, filt: d.filt, trim: d.trim } } s.x = D().x; return s };
function lib(q) { const box = ov.querySelector('.ls'), T = D().tracks || []; q = q.toLowerCase(); box.innerHTML = T.map((t, i) => [t, i]).filter(([t]) => !q || (t.title + ' ' + t.list).toLowerCase().includes(q)).slice(0, 80).map(([t, i]) => '<div class="it"><span>' + esc(t.title) + ' <small style="opacity:.6">· ' + esc(t.list) + ' · ' + (t.bpm || '?') + ' BPM</small></span><button data-ld="a" data-i="' + i + '">A</button><button data-ld="b" data-i="' + i + '">B</button></div>').join('') || '<div class="it">' + tr('No match.', 'Sin resultados.') + '</div>';
  box.querySelectorAll('[data-ld]').forEach(b => b.onclick = () => { D().load(b.dataset.ld, +b.dataset.i); PRO.stats.loads++ }) }
function wire() { const dj = D();
  ov.querySelector('[data-a="close"]').onclick = () => PRO.close(true); ov.querySelector('[data-a="classic"]').onclick = () => PRO.close(false); ov.querySelector('[data-q]').oninput = e => lib(e.target.value);
  for (const k of ['a', 'b']) { const el = ov.querySelector('[data-deck="' + k + '"]'), d = deck(k);
    el.querySelector('[data-a="play"]').onclick = () => dj.play(k); el.querySelector('[data-a="cue"]').onclick = () => { const m = d.track && (AV.S.dj && AV.S.dj.trk[d.track.file]); d.el.currentTime = (m && m.cues && m.cues[0] != null) ? m.cues[0] : 0 };
    el.querySelector('[data-a="sync"]').onclick = () => dj.sync(k); el.querySelector('[data-a="key"]').onclick = () => { d.keylock = !d.keylock; dj.setRate(k, d.rate) };
    el.querySelectorAll('[data-hc]').forEach(b => b.onclick = e => dj.cue(k, +b.dataset.hc, e.shiftKey)); el.querySelector('[data-a="clrhc"]').onclick = () => [0, 1, 2, 3].forEach(i => dj.cue(k, i, true));
    el.querySelectorAll('[data-lp]').forEach(b => b.onclick = () => dj.loopOn(k, +b.dataset.lp)); el.querySelector('[data-pitch]').oninput = e => dj.setRate(k, 1 + (+e.target.value) / 100);
    jog(k, el.querySelector('[data-jog]')) }
  ov.querySelectorAll('[data-k]').forEach(r => r.oninput = () => { const d = deck(r.dataset.k), f = r.dataset.f, v = +r.value; if (f.startsWith('eq')) d.eq[+f[2]] = v; else d[f] = v; dj.mix() });
  ov.querySelector('[data-x]').oninput = e => { dj.x = +e.target.value; dj.mix() }; ov.querySelector('[data-master]').oninput = e => { AV.S.set.vm = +e.target.value; if (AV.audio && AV.audio.setVol) AV.audio.setVol(); dj.mix() };
  ov.querySelectorAll('[data-pfl]').forEach(b => b.onclick = () => { dj.pfl = dj.pfl === b.dataset.pfl ? null : b.dataset.pfl; dj.mix() }) }
/* ---------- jog wheels: scratch / seek / nudge ---------- */
const jogs = {};
function jog(k, cv) { const J = jogs[k] = { cv, ang: 0, drag: null };
  const pa = e => { const r = cv.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2; return { a: Math.atan2(y, x), rr: Math.hypot(x, y) / (r.width / 2) } };
  cv.onpointerdown = e => { const d = deck(k); if (!d || !d.track) return; try { cv.setPointerCapture(e.pointerId) } catch (x) { } const p = pa(e); J.drag = { a: p.a, outer: p.rr > .78, was: !d.el.paused, t: performance.now(), rate0: d.rate };
    if (J.drag.outer) PRO.stats.nudges++; else if (J.drag.was) PRO.stats.scratches++; else PRO.stats.seeks++ };
  cv.onpointermove = e => { const g = J.drag, d = deck(k); if (!g || !d) return; const p = pa(e); let da = p.a - g.a; if (da > Math.PI) da -= 2 * Math.PI; if (da < -Math.PI) da += 2 * Math.PI; g.a = p.a; const now = performance.now(), dt = Math.max(.008, (now - g.t) / 1000); g.t = now; J.ang += da;
    const secPerRev = 1.8, ds = da / (2 * Math.PI) * secPerRev;   /* a 33⅓ rpm platter: one turn ≈ 1.8 s of audio */
    if (g.outer) { d.el.playbackRate = Math.max(.5, Math.min(1.5, g.rate0 * (1 + Math.sign(da) * .08))) }
    else if (!g.was) d.el.currentTime = Math.max(0, d.el.currentTime + ds * 2);
    else { const v = ds / dt; if (v >= .05) { d.el.playbackRate = Math.max(.25, Math.min(4, v)); if (d.el.paused) D().play(k, true) } else if (v <= -.05) { d.el.currentTime = Math.max(0, d.el.currentTime + ds); d.el.playbackRate = .25 } else d.el.playbackRate = .25 } };
  const up = () => { const g = J.drag, d = deck(k); if (!g || !d) return; J.drag = null; D().setRate(k, d.rate || g.rate0) }; cv.onpointerup = up; cv.onpointercancel = up }
/* ---------- drawing ---------- */
function drawJog(k) { const J = jogs[k], d = deck(k); if (!J) return; const c = J.cv.getContext('2d'), W = J.cv.width, R = W / 2; c.clearRect(0, 0, W, W); const spin = d && d.track ? (d.el.currentTime / 1.8) * Math.PI * 2 : 0;
  c.fillStyle = '#1a1826'; c.beginPath(); c.arc(R, R, R - 2, 0, 7); c.fill(); c.strokeStyle = k === 'a' ? '#7ad8ff' : '#ff9a3a'; c.lineWidth = 6; c.beginPath(); c.arc(R, R, R - 6, 0, 7); c.stroke();
  const g = c.createRadialGradient(R, R, 10, R, R, R * .75); g.addColorStop(0, '#3a3850'); g.addColorStop(1, '#0e0c16'); c.fillStyle = g; c.beginPath(); c.arc(R, R, R * .76, 0, 7); c.fill();
  c.save(); c.translate(R, R); c.rotate(spin); c.strokeStyle = 'rgba(255,255,255,.08)'; for (let i = 0; i < 36; i++) { c.rotate(Math.PI / 18); c.beginPath(); c.moveTo(R * .3, 0); c.lineTo(R * .72, 0); c.stroke() } c.fillStyle = '#ff4ad2'; c.fillRect(R * .2, -4, R * .5, 8); c.restore();
  c.fillStyle = '#0b0a10'; c.beginPath(); c.arc(R, R, R * .18, 0, 7); c.fill(); c.fillStyle = '#e8e8f0'; c.font = 'bold 16px Arial'; c.textAlign = 'center'; c.fillText(k.toUpperCase(), R, R + 6);
  if (J.drag) { c.strokeStyle = J.drag.outer ? '#ffd23a' : '#3ad87a'; c.lineWidth = 4; c.beginPath(); c.arc(R, R, J.drag.outer ? R - 14 : R * .5, 0, 7); c.stroke() } }
function drawWf(k) { const cv = ov.querySelector('[data-wf="' + k + '"]'), d = deck(k); if (!cv) return; const c = cv.getContext('2d'), W = cv.width, H = cv.height; c.fillStyle = '#08070c'; c.fillRect(0, 0, W, H); if (!d || !d.track) return;
  const P = PRO.hi[d.track.file] || D().peaks[d.track.file], pk = P && P.pk, dur = (P && P.dur) || d.el.duration || 1, t = d.el.currentTime, win = 8;
  for (let x = 0; x < W; x += 2) { const tt = t + (x / W - .5) * win; if (tt < 0 || tt > dur) continue; let v = .25 + .2 * Math.abs(Math.sin(tt * 7.3)); if (pk && pk.length) v = pk[Math.min(pk.length - 1, Math.floor(tt / dur * pk.length))] || 0;
    const h = Math.max(1, v * H * .95), hue = 210 - Math.min(1, v) * 200; c.fillStyle = 'hsl(' + hue + ',90%,' + (45 + v * 20) + '%)'; c.fillRect(x, (H - h) / 2, 2, h) }
  const m = AV.S.dj && AV.S.dj.trk[d.track.file]; if (m) (m.cues || []).forEach((q, i) => { if (q == null) return; const x = (q - t) / win * W + W / 2; if (x < 0 || x > W) return; c.fillStyle = ['#ff4ad2', '#ffd23a', '#3ad87a', '#7ad8ff'][i]; c.fillRect(x, 0, 3, H) });
  if (d.loop) { c.fillStyle = 'rgba(58,216,122,.18)'; c.fillRect(W / 2, 0, (d.loop.len || 2) / win * W, H) } c.fillStyle = '#fff'; c.fillRect(W / 2 - 1, 0, 2, H) }
function tick() { if (!PRO.on) return; const dj = D(); for (const k of ['a', 'b']) { const d = deck(k), el = ov.querySelector('[data-deck="' + k + '"]'); if (!d || !el) continue; const dur = d.el.duration;
    el.querySelector('[data-t="ttl"]').textContent = d.track ? d.track.title : tr('— load a track below —', '— carga un tema abajo —'); el.querySelector('[data-t="time"]').textContent = fmt(d.el.currentTime) + ' / -' + fmt((dur || 0) - d.el.currentTime);
    el.querySelector('[data-t="bpm"]').textContent = d.track ? (dj.ebpm(k) || 0).toFixed(1) : '---'; el.querySelector('[data-t="pitch"]').textContent = ((d.rate - 1) * 100 >= 0 ? '+' : '') + ((d.rate - 1) * 100).toFixed(1) + '%';
    el.querySelector('[data-a="play"]').classList.toggle('on', !d.el.paused); el.querySelector('[data-a="key"]').classList.toggle('on', !!d.keylock); el.querySelector('[data-a="sync"]').classList.toggle('on', !!d.synced);
    const m = ov.querySelector('[data-m="' + k + '"]'); if (m) m.style.height = Math.round(Math.min(1, dj.level(k)) * 100) + '%'; drawJog(k); drawWf(k) }
  ov.querySelectorAll('[data-pfl]').forEach(b => b.classList.toggle('on', dj.pfl === b.dataset.pfl)); requestAnimationFrame(tick) }
/* high-resolution waveform (50 points per second) computed once per track; the engine's 600-point overview looks blocky when scrolling */
PRO.hi = {}; const hiBusy = {};
function hiRes(file) { if (PRO.hi[file] || hiBusy[file] || !AV.audio || !AV.audio.ctx) return; hiBusy[file] = 1; fetch(file).then(r => r.arrayBuffer()).then(b => AV.audio.ctx.decodeAudioData(b)).then(buf => { const ch = buf.getChannelData(0), rate = 50, N = Math.floor(buf.duration * rate), step = Math.floor(ch.length / N), pk = new Float32Array(N); let mx = 0;
  for (let i = 0; i < N; i++) { let m = 0; for (let j = i * step, e = j + step; j < e; j += 8) { const v = Math.abs(ch[j]); if (v > m) m = v } pk[i] = m; if (m > mx) mx = m } if (mx > 0) for (let i = 0; i < N; i++) pk[i] /= mx; PRO.hi[file] = { pk, dur: buf.duration } }).catch(() => { }).finally(() => { hiBusy[file] = 0 }) }
/* tempo: the curated playlist BPM wins over the engine's auto-detection (which can lock onto a double / half tempo), unless you tapped */
addEventListener('load', () => { const dj = AV.dj; if (!dj || dj.bpm.__lw) return; const b0 = dj.bpm; dj.bpm = k => { const d = dj.decks[k]; if (!d || !d.track) return 0; const m = AV.S.dj && AV.S.dj.trk[d.track.file]; if ((!m || !m.bpm || m.auto) && d.track.bpm) return d.track.bpm; return b0(k) }; dj.bpm.__lw = 1;
  const l0 = dj.load; dj.load = function (k, i) { const r = l0.apply(this, arguments); const t = dj.tracks && dj.tracks[i]; if (t) hiRes(t.file); return r } });
const o0 = PRO.open; PRO.open = function () { const r = o0.apply(this, arguments); if (r) requestAnimationFrame(tick); return r };
addEventListener('keydown', e => { if (PRO.on && e.code === 'Escape') { PRO.close(false); e.stopImmediatePropagation() } }, true);
/* open automatically when a DJ booth session starts */
addEventListener('load', () => { const ACT = AV.act; if (!ACT || !ACT.start) return; const s0 = ACT.start; ACT.start = function (id) { const r = s0.apply(this, arguments); if (id === 'dj' && LW.CFG.djPro !== false) setTimeout(() => { if (ACT.cur && ACT.cur.id === 'dj') PRO.open() }, 120); return r } });
})(window.AV);
