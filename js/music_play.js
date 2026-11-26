/* APEVERSE - music_play.js : Living Playground milestone 5 — DJ booths, playable instruments, jamming with the Stone Ape Band.
   DJ booth (activity 'dj'): two decks loaded with the game's ORIGINAL tracks (data/music.js only — nothing new or unlicensed),
   play/pause, per-deck volume, an equal-power crossfader, auto-mix, a filter sweep (low-pass ↔ high-pass) and an echo.
   While you DJ, the world's own music waits (AV.audio.hold) and comes back when you leave, so two songs never compete.
   Nearby crowd characters dance to your beat and stage lights follow it (AV.audio.beat comes from the louder deck).
   Over http the decks run through Web Audio (filter + echo); from file:// they play directly (volume + crossfade, no FX).
   Instruments (activity 'instrument'): drum pads, bongos, keys, bass, ukulele, alien synth — procedural sounds, keys 1-8 or
   tap the pads. At a band stage the jam is scored on the beat of the band's track, the band reacts and the crowd tips you. */
'use strict';
(function (AV) {
const tr = AV.tr, $ = AV.$, A = AV.audio, ACT = AV.act; if (!ACT || !A) return;
const L = (en, es) => [en, es], say = l => tr(l[0], l[1]);
const allTracks = () => { const out = [], seen = {}; for (const k in (AV.MUSIC || {})) { const P = AV.MUSIC[k]; (P.tracks || []).forEach(t => { if (seen[t.file]) return; seen[t.file] = 1; out.push({ file: t.file, title: t.title || t.file.split('/').pop(), list: P.name || k, bpm: P.bpm || 90 }) }) } return out };
const fmt = s => !isFinite(s) ? '--:--' : Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
const css = document.createElement('style'); css.textContent = '#actHud.wide{min-width:min(620px,94vw);max-width:96vw}#actHud .decks{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}#actHud .deck{flex:1 1 240px;border:1px solid #6a5a9a;border-radius:8px;padding:6px;background:rgba(0,0,0,.25)}#actHud select{max-width:100%;font:12px Georgia,serif}#actHud input[type=range]{width:100%}#actHud .pads{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:6px 0}#actHud .pad{height:54px;font:bold 13px Georgia,serif;border-radius:8px;border:2px solid #ffd84a;background:rgba(255,120,200,.35);color:#fff}#actHud .pad.hit{background:#ffd84a;color:#000}#actHud .beatdot{display:inline-block;width:14px;height:14px;border-radius:50%;background:#333;vertical-align:middle;margin-left:6px}';
document.head.appendChild(css);

/* ---------- shared: find a free spot for a venue near a configured point ---------- */
function freeSpot(W, x, z, r) { for (let d = 0; d < 14; d += 1) for (let k = 0; k < Math.max(1, d * 6); k++) { const a = k / Math.max(1, d * 6) * Math.PI * 2, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d; if (AV.isFree(W, px, pz, r) && !W.T.some(t => Math.hypot(t.x - px, t.z - pz) < t.r + 1)) return [px, pz] } return null }

/* ======================= DJ BOOTH ======================= */
let djOut = null;   // Web Audio graph: deckA/deckB -> xA/xB -> filter -> (dry + echo) -> mediaBus
function graph() {
  if (djOut || !A.ok || AV.isFile) return djOut; const c = A.ctx, bus = c.createGain(), lp = c.createBiquadFilter(), hp = c.createBiquadFilter(), dl = c.createDelay(1), fb = c.createGain(), wet = c.createGain();
  lp.type = 'lowpass'; lp.frequency.value = 20000; hp.type = 'highpass'; hp.frequency.value = 20; dl.delayTime.value = .375; fb.gain.value = .38; wet.gain.value = 0;
  bus.connect(lp); lp.connect(hp); hp.connect(A.mediaBus || c.destination); hp.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(wet); wet.connect(A.mediaBus || c.destination);
  return djOut = { bus, lp, hp, wet };
}
function deck(id) {
  const e = new Audio(); e.preload = 'auto'; e.loop = true; const d = { id, el: e, vol: .9, track: null, src: null, g: null };
  const G = graph(); if (G) { try { d.src = A.ctx.createMediaElementSource(e); d.g = A.ctx.createGain(); d.src.connect(d.g); d.g.connect(G.bus) } catch (x) { d.g = null } }
  return d;
}
const DJ = AV.dj = { decks: null, x: .0, filter: 0, echo: false, auto: null };
DJ.load = (k, i) => { const d = DJ.decks[k], t = allTracks()[i]; if (!t) return; d.track = t; d.el.src = t.file; d.el.currentTime = 0; d.ready = false; d.el.oncanplay = () => d.ready = true; DJ.mix() };
DJ.play = (k, on) => { const d = DJ.decks[k]; if (!d.track) return false; if (on === undefined) on = d.el.paused; if (on) { if (A.ok && A.ctx.state === 'suspended') A.ctx.resume(); const p = d.el.play(); if (p && p.catch) p.catch(() => { }) } else d.el.pause(); return on };
DJ.mix = () => { if (!DJ.decks) return; const ga = Math.cos(DJ.x * Math.PI / 2), gb = Math.sin(DJ.x * Math.PI / 2), S = AV.S.set, mv = A.mute ? 0 : (S.vm == null ? .8 : S.vm);
  for (const [d, g] of [[DJ.decks.a, ga], [DJ.decks.b, gb]]) { const v = d.vol * g; if (d.g) { d.g.gain.value = v; d.el.volume = 1 } else d.el.volume = Math.max(0, Math.min(1, v * mv)) }
  const G = djOut; if (G) { const f = DJ.filter; G.lp.frequency.value = f < 0 ? 20000 * Math.pow(.012, -f) : 20000; G.hp.frequency.value = f > 0 ? 20 * Math.pow(200, f) : 20; G.wet.gain.value = DJ.echo ? .45 : 0 } };
DJ.level = k => { const d = DJ.decks[k], g = k === 'a' ? Math.cos(DJ.x * Math.PI / 2) : Math.sin(DJ.x * Math.PI / 2); return d.el.paused || !d.track ? 0 : d.vol * g };
DJ.playing = () => !!DJ.decks && (DJ.level('a') > .05 || DJ.level('b') > .05);
ACT.register('dj', {
  noAct: true,
  start(s) {
    if (!DJ.decks) DJ.decks = { a: deck('a'), b: deck('b') }; DJ.x = 0; DJ.filter = 0; DJ.echo = false; DJ.auto = null;
    const T = allTracks(); s.tracks = T; s.played = 0;
    /* start the decks on tracks other than the one the world was playing (it keeps its place for when you leave) */
    const cur = A.track && A.track.el && decodeURI(A.track.el.src || ''), free = T.map((t, i) => i).filter(i => !cur || !cur.endsWith(T[i].file));
    if (!DJ.decks.a.track && free.length) DJ.load('a', free[0]); if (!DJ.decks.b.track && free.length > 1) DJ.load('b', free[Math.floor(free.length / 2)]);
    A.hold = true; if (A.track && A.track.el) { try { A.track.el.pause() } catch (e) { } } AV.pushModal('dj', () => ACT.end('leave')); document.getElementById('actHud').classList.add('wide'); DJ.mix();
    AV.toast(tr('DJ mode: the world music pauses while you play. Esc or Leave to stop.', 'Modo DJ: la música del mundo se pausa mientras pinchas. Esc o Salir para terminar.'));
  },
  end(s) { for (const k of ['a', 'b']) { try { DJ.decks[k].el.pause() } catch (e) { } } A.hold = false; AV.popModal('dj'); document.getElementById('actHud').classList.remove('wide'); if (A.track && A.track.active) A.track.resume();
    const S = ACT.stats('dj'); S.sets = (S.sets || 0) + 1; S.secs = (S.secs || 0) + Math.round(s.djSecs || 0); if ((s.djSecs || 0) > 20) AV.vitals && AV.vitals.add(0, 8) },
  hud(s) {
    const opt = sel => s.tracks.map((t, i) => '<option value="' + i + '"' + (sel && sel.file === t.file ? ' selected' : '') + '>' + t.title + ' · ' + t.list + '</option>').join('');
    const dk = k => { const d = DJ.decks[k]; return '<div class="deck"><b>' + tr('Deck ', 'Plato ') + k.toUpperCase() + '</b> <span id="djT' + k + '">' + fmt(d.el.currentTime) + '</span><br><select id="djS' + k + '">' + opt(d.track) + '</select><br>' +
      '<button id="djP' + k + '">' + (d.el.paused ? '▶ ' + tr('Play', 'Play') : '❚❚ ' + tr('Pause', 'Pausa')) + '</button> <button id="djC' + k + '">⏮</button><br><small>' + tr('volume', 'volumen') + '</small><input id="djV' + k + '" type="range" min="0" max="1" step=".02" value="' + d.vol + '"></div>' };
    return '<b>🎧 ' + tr(s.v.p.name[0], s.v.p.name[1]) + '</b> <small>· ' + tr('your own tracks only', 'solo tus propios temas') + (AV.isFile ? tr(' · file mode: no FX', ' · modo archivo: sin efectos') : '') + '</small><div class="decks">' + dk('a') + dk('b') + '</div>' +
      '<small>A ◀ ' + tr('crossfader', 'crossfader') + ' ▶ B</small><input id="djX" type="range" min="0" max="1" step=".01" value="' + DJ.x + '"><button id="djAuto">' + tr('Auto-mix 8 s', 'Auto-mezcla 8 s') + '</button>' +
      '<br><small>' + tr('filter (low ◀ ▶ high)', 'filtro (graves ◀ ▶ agudos)') + '</small><input id="djF" type="range" min="-1" max="1" step=".02" value="' + DJ.filter + '"' + (AV.isFile ? ' disabled' : '') + '><button id="djE"' + (AV.isFile ? ' disabled' : '') + '>' + tr('Echo: ', 'Eco: ') + (DJ.echo ? 'ON' : 'OFF') + '</button>' +
      '<div><small id="djInfo"></small><span class="beatdot" id="djBeat"></span></div>';
  },
  wire(s) {
    for (const k of ['a', 'b']) { $('djS' + k).onchange = e => { const was = !DJ.decks[k].el.paused; DJ.load(k, +e.target.value); if (was) DJ.play(k, true); ACT.draw() }; $('djP' + k).onclick = () => { if (DJ.play(k)) s.played++; ACT.draw() }; $('djC' + k).onclick = () => { DJ.decks[k].el.currentTime = 0 }; $('djV' + k).oninput = e => { DJ.decks[k].vol = +e.target.value; DJ.mix() } }
    $('djX').oninput = e => { DJ.x = +e.target.value; DJ.auto = null; DJ.mix() }; $('djF').oninput = e => { DJ.filter = +e.target.value; DJ.mix() }; $('djE').onclick = () => { DJ.echo = !DJ.echo; DJ.mix(); ACT.draw() };
    $('djAuto').onclick = () => { const to = DJ.x < .5 ? 1 : 0, k = to ? 'b' : 'a'; if (DJ.decks[k].el.paused) DJ.play(k, true); DJ.auto = { from: DJ.x, to, t0: AV.now(), dur: 8 } };
  },
  update(s, dt) {
    if (DJ.auto) { const k = Math.min(1, (AV.now() - DJ.auto.t0) / DJ.auto.dur); DJ.x = DJ.auto.from + (DJ.auto.to - DJ.auto.from) * k; DJ.mix(); const xs = $('djX'); if (xs) xs.value = DJ.x; if (k >= 1) DJ.auto = null }
    for (const k of ['a', 'b']) { const e = $('djT' + k); if (e) e.textContent = fmt(DJ.decks[k].el.currentTime) }
    /* the louder deck drives the beat: dancers + stage lights follow you */
    const la = DJ.level('a'), lb = DJ.level('b'), d = la >= lb ? DJ.decks.a : DJ.decks.b;
    if (la + lb > .05 && d.track) { A.bpm = d.track.bpm; A.beat = d.el.currentTime * A.bpm / 60; s.djSecs = (s.djSecs || 0) + dt }
    const bd = $('djBeat'); if (bd) bd.style.background = la + lb > .05 && (A.beat % 1) < .18 ? '#ffd84a' : '#333';
    const info = $('djInfo'); if (info) info.textContent = (la + lb > .05 ? tr('♪ live · dancers: ', '♪ en vivo · bailando: ') + (s.dancers || 0) : tr('Press ▶ on a deck to start', 'Pulsa ▶ en un plato para empezar'));
    s.acc = (s.acc || 0) + dt; if (s.acc > 1) { s.acc = 0; s.dancers = crowdDance(s.v, la + lb > .05 ? 6 : 0) }
  }
});
/* crowd characters within 22 m of the booth dance while the music plays */
function crowdDance(v, secs) { const W = AV.W; if (!W || !secs) return 0; let n = 0; for (const t of W.T) { const b = t.being; if (!b || !b.h) continue; if (Math.hypot(b.h.position.x - v.x, b.h.position.z - v.z) < 22) { b.danceUntil = AV.now() + secs; n++ } } return n }
ACT.register('djbooth', { place(W, p) {
  const sp = freeSpot(W, p.x, p.z, 1.8); if (!sp) return null; const [x, z] = sp, y = W.surface(x, z) || 0, g = new THREE.Group(), ry = p.ry || 0; g.position.set(x, y, z); g.rotation.y = ry;
  const m = (geo, mat, px, py, pz, sx, sy, sz) => { const o = new THREE.Mesh(geo, mat); o.position.set(px, py, pz); o.scale.set(sx, sy, sz); g.add(o); return o };
  m(AV.G.box, AV.std(0x1a1a22, .6), 0, .5, 0, 2.2, 1, .8); m(AV.G.box, AV.std(0x2a2a36, .4, .3), 0, 1.03, 0, 2.3, .06, .9);
  const decks = [-.6, .6].map(dx => { const o = m(new THREE.CylinderGeometry(.24, .24, .03, 24), AV.std(0x111111, .3), dx, 1.08, 0, 1, 1, 1); return o }); m(AV.G.box, AV.std(0x3a3a4a, .5), 0, 1.08, 0, .34, .04, .4);
  const glow = m(AV.G.box, AV.std(p.col || 0xff4ad2, .4, 0, p.col || 0xff4ad2, 1.2), 0, .5, .41, 2.1, .08, .02);
  for (const s of [-1, 1]) m(AV.G.box, AV.std(0x16141a, .7), s * 1.6, .8, -.1, .7, 1.6, .6);
  W.circles.push([x, z, 1.4]); AV.lin(g); W.group.add(g);
  const front = [x + Math.sin(ry) * 1.4, z + Math.cos(ry) * 1.4], v = { type: 'dj', p, W, x, z, g };
  W.T.push({ x: front[0], z: front[1], r: 2.2, show: () => !ACT.cur, label: () => tr('🎧 DJ booth: play your own set (', '🎧 Cabina de DJ: pincha tu sesión (') + tr(p.name[0], p.name[1]) + ')', fn: () => ACT.start('dj', { v }) });
  W.upd.push((dt, t) => { const on = ACT.cur && ACT.cur.id === 'dj' && ACT.cur.v === v && AV.dj.playing();   /* AV.dj: the full mixer (dj_mixer.js) when loaded */ decks.forEach((d, i) => d.rotation.y += dt * (on ? (i ? 3.4 : -3.4) : 0)); glow.material.emissiveIntensity = on ? .6 + (A.beat % 1 < .2 ? 1.4 : 0) : .5 });
  if (W.ctx && W.ctx.sign) W.ctx.sign('DJ · ' + tr(p.name[0], p.name[1]).toUpperCase(), x - Math.cos(ry) * 2.6, y + 2.6, z + Math.sin(ry) * 2.6, ry, 3.6, '#ff8ac0', { posts: true });
  return v } });

/* ======================= INSTRUMENTS ======================= */
let ibus = null; const bus = () => ibus || (A.ok ? (ibus = A.ctx.createGain(), ibus.gain.value = .9, ibus.connect(A.mediaBus || A.ctx.destination), ibus) : null);
function tone(f, d, type, g, glide) { const b = bus(); if (!b) return; const c = A.ctx, t = c.currentTime, o = c.createOscillator(), e = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (glide) o.frequency.exponentialRampToValueAtTime(f * glide, t + d); e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(g, t + .008); e.gain.exponentialRampToValueAtTime(.0008, t + d); o.connect(e); e.connect(b); o.start(t); o.stop(t + d + .05) }
function hit(d, g, hp) { const b = bus(); if (!b) return; const c = A.ctx, t = c.currentTime, n = c.sampleRate * d | 0, buf = c.createBuffer(1, n, c.sampleRate), x = buf.getChannelData(0); for (let i = 0; i < n; i++) x[i] = Math.random() * 2 - 1; const s = c.createBufferSource(), f = c.createBiquadFilter(), e = c.createGain(); s.buffer = buf; f.type = 'highpass'; f.frequency.value = hp; e.gain.setValueAtTime(g, t); e.gain.exponentialRampToValueAtTime(.001, t + d); s.connect(f); f.connect(e); e.connect(b); s.start(t) }
const kick = () => { tone(140, .32, 'sine', .9, .3) };
const PENTA = [261.6, 293.7, 329.6, 392, 440, 523.3, 587.3, 659.3];
const INST = {
  drums: { n: L('Drum pads', 'Pads de batería'), pads: [[L('Kick', 'Bombo'), kick], [L('Snare', 'Caja'), () => { hit(.18, .5, 1500); tone(190, .1, 'triangle', .2) }], [L('Hat', 'Charles'), () => hit(.05, .25, 7000)], [L('Clap', 'Palmas'), () => { hit(.12, .45, 1200); setTimeout(() => hit(.1, .3, 1300), 18) }], [L('Tom lo', 'Tom grave'), () => tone(110, .3, 'sine', .6, .6)], [L('Tom hi', 'Tom agudo'), () => tone(180, .25, 'sine', .55, .6)], [L('Open hat', 'Charles abierto'), () => hit(.3, .2, 6000)], [L('Boom!', '¡Bum!'), () => { kick(); hit(.4, .3, 400) }]] },
  bongo: { n: L('Bongos', 'Bongós'), pads: [[L('Low', 'Grave'), () => tone(196, .18, 'sine', .7, .8)], [L('High', 'Agudo'), () => tone(294, .14, 'sine', .65, .8)], [L('Slap', 'Golpe'), () => { hit(.06, .5, 2500); tone(330, .06, 'triangle', .3) }], [L('Rim', 'Aro'), () => hit(.03, .45, 5000)], [L('Low mute', 'Grave seco'), () => tone(180, .07, 'sine', .7)], [L('High mute', 'Agudo seco'), () => tone(270, .06, 'sine', .65)], [L('Shaker', 'Maraca'), () => hit(.12, .18, 8000)], [L('Roll', 'Redoble'), () => [0, 60, 120, 180].forEach(ms => setTimeout(() => tone(294, .1, 'sine', .4, .8), ms))]] },
  keys: { n: L('Keys', 'Teclado'), pads: PENTA.map((f, i) => [L(['C', 'D', 'E', 'G', 'A', 'C²', 'D²', 'E²'][i], ['Do', 'Re', 'Mi', 'Sol', 'La', 'Do²', 'Re²', 'Mi²'][i]), () => { tone(f, .9, 'triangle', .25); tone(f * 2, .5, 'sine', .06) }]) },
  bass: { n: L('Upright bass', 'Contrabajo'), pads: PENTA.map((f, i) => [L(['C', 'D', 'E', 'G', 'A', 'C²', 'D²', 'E²'][i], ['Do', 'Re', 'Mi', 'Sol', 'La', 'Do²', 'Re²', 'Mi²'][i]), () => { tone(f / 4, .7, 'sine', .7); tone(f / 2, .25, 'triangle', .12) }]) },
  uke: { n: L('Ukulele', 'Ukelele'), pads: [['C', [262, 330, 392]], ['Am', [220, 262, 330]], ['F', [175, 220, 262]], ['G', [196, 247, 294]], ['Dm', [147, 175, 220]], ['Em', [165, 196, 247]], ['E7', [165, 208, 294]], ['C²', [523, 659, 784]]].map(([n, ch]) => [L(n, n), () => ch.forEach((f, i) => setTimeout(() => tone(f, .7, 'triangle', .18), i * 28))]) },
  alien: { n: L('Alien synth', 'Sintetizador alienígena'), pads: PENTA.map((f, i) => [L('✶' + (i + 1), '✶' + (i + 1)), () => { tone(f * 1.5, .8, 'sawtooth', .07, i % 2 ? 1.5 : .66); tone(f * .75, .9, 'sine', .15, 1.02) }]) }
};
ACT.register('instrument', {
  noAct: true,
  start(s) { const I = INST[s.kind] || INST.drums; s.I = I; s.hits = 0; s.onBeat = 0; s.combo = 0; s.best = 0; s.band = !!s.v.p.band; AV.pushModal('inst', () => ACT.end('leave'));
    if (s.band && A.track && !A.track.active && AV.W.music) A.track.setWorld(AV.W); AV.toast(tr(s.band ? 'Jam with the band: hit on the beat (keys 1-8 or tap the pads). The yellow dot is the beat.' : 'Play with keys 1-8 or tap the pads. Esc / Leave to stop.', s.band ? 'Toca con la banda: golpea a tiempo (teclas 1-8 o toca los pads). El punto amarillo es el pulso.' : 'Toca con las teclas 1-8 o los pads. Esc / Salir para terminar.')) },
  end(s) { AV.popModal('inst'); const S = ACT.stats('instrument'); S.hits = (S.hits || 0) + s.hits; S.best = Math.max(S.best || 0, s.best);
    if (s.band && !s.v.p.noTip && s.onBeat >= 8) { const tip = Math.min(20, Math.floor(s.onBeat / 2)); AV.txn(tip, 'Jam with the Stone Ape Band'); AV.vitals && AV.vitals.add(0, 10); S.jams = (S.jams || 0) + 1; AV.toast(tr('The band nods: “You can sit in any time.” The crowd tips you ' + tip + ' credits.', 'La banda asiente: “Puedes tocar con nosotros cuando quieras.” El público te da ' + tip + ' créditos.')) }
    else if (s.hits) AV.vitals && AV.vitals.add(0, 4) },
  hud(s) { return '<b>🎶 ' + say(s.I.n) + ' · ' + tr(s.v.p.name[0], s.v.p.name[1]) + '</b><div class="pads">' + s.I.pads.map((p, i) => '<button class="pad" data-pad="' + i + '">' + (i + 1) + '<br>' + say(p[0]) + '</button>').join('') + '</div>' +
      '<small>' + (s.band ? tr('On the beat: ', 'A tiempo: ') + '<b id="inOn">' + s.onBeat + '</b> · ' + tr('combo ', 'combo ') + '<b id="inCombo">' + s.combo + '</b>' : tr('Notes played: ', 'Notas: ') + '<b id="inOn">' + s.hits + '</b>') + '<span class="beatdot" id="inBeat"></span> · ' + tr('keys 1-8 · Esc leaves', 'teclas 1-8 · Esc para salir') + '</small>' },
  wire(s) { document.querySelectorAll('#actHud [data-pad]').forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); play(s, +b.dataset.pad) })) },
  update(s) { const bd = $('inBeat'); if (bd) bd.style.background = (A.beat % 1) < .18 || (A.beat % 1) > .9 ? '#ffd84a' : '#333' }
});
function play(s, i) {
  const p = s.I.pads[i]; if (!p) return; p[1](); s.hits++; const b = document.querySelector('#actHud [data-pad="' + i + '"]'); if (b) { b.classList.add('hit'); setTimeout(() => b.classList.remove('hit'), 120) }
  if (s.band) { const ph = A.beat % 1, on = ph < .14 || ph > .86; if (on) { s.onBeat++; s.combo++; s.best = Math.max(s.best, s.combo); if (s.combo % 8 === 0) { if (AV.jd) AV.jd.cheer = AV.now() + 6; if (AV.W && AV.W.ctx) AV.W.ctx.cheer = AV.now() + 6; AV.toast(tr('🔥 ' + s.combo + ' in a row — the band digs it!', '🔥 ¡' + s.combo + ' seguidos! ¡A la banda le encanta!')) } } else s.combo = 0;
    const a = $('inOn'), c = $('inCombo'); if (a) a.textContent = s.onBeat; if (c) c.textContent = s.combo } else { const a = $('inOn'); if (a) a.textContent = s.hits }
  crowdDance(s.v, 4);
}
addEventListener('keydown', e => { const s = ACT.cur; if (!s || s.id !== 'instrument' || e.repeat) return; const m = /^Digit([1-8])$/.exec(e.code); if (m) { e.stopImmediatePropagation(); e.preventDefault(); play(s, +m[1] - 1) } }, true);
ACT.register('instspot', { place(W, p) {
  const sp = freeSpot(W, p.x, p.z, 1.2); if (!sp) return null; const [x, z] = sp, y = W.surface(x, z) || 0, g = new THREE.Group(); g.position.set(x, y, z);
  const col = { drums: 0x3a3a4a, bongo: 0x8a5a3a, keys: 0x222228, bass: 0x6a3a1a, uke: 0xc8904a, alien: 0x4ad8ff }[p.kind] || 0x555555;
  if (p.kind === 'bongo') { for (const s of [-1, 1]) { const o = new THREE.Mesh(new THREE.CylinderGeometry(.18 + (s > 0 ? .03 : 0), .14, .32, 16), AV.std(col, .7)); o.position.set(s * .22, .7, 0); g.add(o) } const st = new THREE.Mesh(AV.G.box, AV.std(0x5a3a1a, .8)); st.scale.set(.7, .55, .4); st.position.y = .27; g.add(st) }
  else { const o = new THREE.Mesh(AV.G.box, AV.std(col, .5, .2, p.kind === 'alien' ? col : 0, .5)); o.scale.set(1.2, .12, .45); o.position.y = .9; g.add(o); for (const s of [-1, 1]) { const l = new THREE.Mesh(AV.G.box, AV.std(0x222222, .6)); l.scale.set(.06, .9, .06); l.position.set(s * .5, .45, 0); g.add(l) }
    if (p.kind === 'keys' || p.kind === 'alien') for (let k = 0; k < 8; k++) { const kk = new THREE.Mesh(AV.G.box, AV.std(k % 2 ? 0xffffff : 0xf0f0f0, .4)); kk.scale.set(.12, .03, .2); kk.position.set(-.45 + k * .13, .97, .08); g.add(kk) }
    if (p.kind === 'drums') for (let k = 0; k < 8; k++) { const kk = new THREE.Mesh(AV.G.box, AV.std([0xff4ad2, 0x4ad8ff, 0xffd84a, 0x7aff8a][k % 4], .4, 0, [0xff4ad2, 0x4ad8ff, 0xffd84a, 0x7aff8a][k % 4], .6)); kk.scale.set(.22, .03, .16); kk.position.set(-.42 + (k % 4) * .28, .97, (k < 4 ? -.09 : .1)); g.add(kk) } }
  W.circles.push([x, z, .7]); AV.lin(g); W.group.add(g);
  const v = { type: 'inst', p, W, x, z, g };
  W.T.push({ x: x, z: z + 1.3, r: 2, show: () => !ACT.cur, label: () => '🎶 ' + (p.band ? (p.bandName ? tr('Jam with ', 'Tocar con ') + say(p.bandName) + ': ' : tr('Jam with the Stone Ape Band: ', 'Tocar con la Stone Ape Band: ')) : tr('Play the ', 'Tocar: ')) + say(INST[p.kind].n), fn: () => ACT.start('instrument', { v, kind: p.kind }) });
  return v } });

/* ---------- where they are (configuration, same code everywhere) ---------- */
const P = ACT.PLACES;
const add = (w, list) => { P[w] = (P[w] || []).concat(list) };
add('jungle_dub', [{ type: 'djbooth', x: 9, z: -7, ry: -Math.PI / 2, name: ['Jungle Dub sound system', 'Sound system de Jungle Dub'], col: 0x30c060 }, { type: 'instspot', kind: 'drums', x: -9, z: -6, band: true, name: ['Jungle Rave stage', 'escenario Jungle Rave'] }, { type: 'instspot', kind: 'bongo', x: 64, z: 43, name: ['Roots Village drum circle', 'círculo de tambores de Roots Village'] }]);
add('ape_town', [{ type: 'instspot', kind: 'keys', x: 7, z: 51, band: true, name: ['Lotus Stage', 'Escenario de Loto'] }, { type: 'instspot', kind: 'bass', x: -7, z: 51, band: true, name: ['Lotus Stage', 'Escenario de Loto'] }, { type: 'djbooth', x: 21, z: 58, ry: 0, name: ['La Finca block party', 'fiesta de barrio La Finca'], col: 0xffd84a }]);
add('astro9', [{ type: 'djbooth', x: 16, z: -27, ry: 0, name: ['Club Graviton guest decks', 'platos invitados del Club Graviton'], col: 0x4ad8ff }, { type: 'instspot', kind: 'alien', x: -16, z: -27, name: ['Club Graviton', 'Club Graviton'] }]);
add('vienna', [{ type: 'djbooth', x: -36, z: -2, ry: 0, name: ['Flex (Donaukanal)', 'Flex (Donaukanal)'], col: 0xff4ad2 }]);
add('chiang_mai', [{ type: 'instspot', kind: 'uke', x: 34, z: 49.5, name: ['Giant Hostel terrace', 'terraza del Giant Hostel'] }]);
ACT._inst = INST;
})(window.AV);
