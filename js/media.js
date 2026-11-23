/* APEVERSE V0.9.1 - media.js : Living Paintings, in-world cinema screens, painting viewer, cinema programme panel.
   Only real files from data/media.js are ever played. Missing files show an honest "awaiting artwork" plaque.
   On http(s): paintings wake up as you approach and cinema screens play their programme ON the 3D screen, with positional sound
   (Web Audio panner at the screen/frame). Only the painting you stand closest to and face is audible; music ducks under media.
   On file://: browsers block video textures, so paintings/cinema open in the pop-up player instead (unchanged V0.9 behaviour). */
'use strict';
(function (AV) {
const $ = AV.$, tr = AV.tr, M = AV.media = { active: [], errors: {}, frames: [], screens: [] };
const D = () => AV.MEDIA_DATA || { placements: [], cinema: [] };
const A = () => AV.audio;
M.placementsFor = world => D().placements.filter(p => p.world === world);
const texLoader = new THREE.TextureLoader();
const phone = () => AV.device === 'phone';
function plaque(title, lines, accent) {
  return AV.mkc(256, c => { const g = c.createLinearGradient(0, 0, 256, 256); g.addColorStop(0, '#1a1030'); g.addColorStop(1, '#2a1048'); c.fillStyle = g; c.fillRect(0, 0, 256, 256); c.strokeStyle = accent || '#ffb04a'; c.lineWidth = 6; c.strokeRect(10, 10, 236, 236);
    c.globalAlpha = .25; for (let i = 0; i < 6; i++) { c.strokeStyle = ['#ff6ad5', '#7ff0c8', '#ffe066'][i % 3]; c.beginPath(); c.arc(128, 128, 30 + i * 16, 0, AV.TAU); c.stroke() } c.globalAlpha = 1;
    c.fillStyle = accent || '#ffb04a'; c.font = 'bold 20px Georgia'; c.textAlign = 'center'; wrap(c, title, 128, 70, 200, 24); c.fillStyle = '#e8dcc8'; c.font = '15px Georgia'; let y = 140; for (const l of lines) y = wrap(c, l, 128, y, 200, 19) + 6 });
}
function wrap(c, t, x, y, mw, lh) { const ws = String(t).split(' '); let l = ''; for (const w of ws) { const tt = l ? l + ' ' + w : w; if (c.measureText(tt).width > mw && l) { c.fillText(l, x, y); y += lh; l = w } else l = tt } c.fillText(l, x, y); return y + lh }

/* ---------- positional audio for a <video> (http only) ---------- */
function attachAudio(obj, el, x, y, z, ref, max) {
  const a = A(); if (!a || !a.ok || AV.isFile || !a.mediaBus) return null;
  try {
    const c = a.ctx, src = c.createMediaElementSource(el), g = c.createGain(), p = c.createPanner(); g.gain.value = 0;
    p.panningModel = phone() ? 'equalpower' : 'HRTF'; p.distanceModel = 'linear'; p.refDistance = ref; p.maxDistance = max; p.rolloffFactor = 1;
    if (p.positionX) { p.positionX.value = x; p.positionY.value = y; p.positionZ.value = z } else p.setPosition(x, y, z);
    src.connect(g); g.connect(p); p.connect(a.mediaBus); obj.au = { src, g, p }; return obj.au;
  } catch (e) { console.warn('media audio unavailable', e); return null }
}
function detachAudio(obj) { if (!obj.au) return; try { obj.au.src.disconnect(); obj.au.g.disconnect(); obj.au.p.disconnect() } catch (e) { } obj.au = null }
function setGain(obj, v) { if (!obj.au) return; const a = A(); try { obj.au.g.gain.setTargetAtTime(v, a.ctx.currentTime, .25) } catch (e) { obj.au.g.gain.value = v } }
function newVideo(file, loop) { const v = document.createElement('video'); v.loop = !!loop; v.playsInline = true; v.preload = 'auto'; v.crossOrigin = 'anonymous'; v.muted = false; v.volume = 1; v.src = file; return v }
/* play with sound when the browser allows it; otherwise play muted (visual only) and retry with sound on the next user gesture */
function playSmart(v, onOk, onFail) {
  const p = v.play(); if (!p || !p.then) { onOk(); return }
  p.then(onOk).catch(() => { v.muted = true; v.play().then(() => { onOk(); const un = () => { v.muted = false; removeEventListener('pointerdown', un); removeEventListener('keydown', un) }; addEventListener('pointerdown', un); addEventListener('keydown', un) }).catch(onFail) });
}

/* ---------- painting frame ---------- */
const RIM = [0xff4ad2, 0x7ff0c8, 0xffd84a, 0x9a7aff, 0xff8a3a, 0x4ac8ff];
let FMAT = null; const frameMat = () => { if (!FMAT) { FMAT = AV.kit.floraMat(0, { rough: .5 }); FMAT.userData.shared = true } return FMAT };
M.frame = function (ctx, p, x, y, z, rotY, height) {
  const present = p.status === 'present', ar = present && p.w ? p.w / p.h : .68, h = height || 3.2, w = h * ar, g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = rotY || 0; ctx.group.add(g);
  /* the whole border (carved wood + glowing coloured rim) is ONE merged mesh: 2 draw calls per painting instead of 9 */
  const K = AV.kit, BX = K.BG.box, rc = RIM[M.frames.length % RIM.length], parts = [];
  for (const s of [[0, h / 2 + .12, w + .5, .24], [0, -h / 2 - .12, w + .5, .24]]) parts.push([BX, 0x4a2c14, K.M(s[0], s[1], 0, s[2], s[3], .22), 0]);
  for (const s of [-1, 1]) parts.push([BX, 0x4a2c14, K.M(s * (w / 2 + .13), 0, 0, .26, h + .02, .22), 0]);
  for (const s of [[0, h / 2 + .02, w + .06, .05], [0, -h / 2 - .02, w + .06, .05]]) parts.push([BX, rc, K.M(s[0], s[1], .1, s[2], s[3], .04), 1]);
  for (const s of [-1, 1]) parts.push([BX, rc, K.M(s * (w / 2 + .02), 0, .1, .05, h, .04), 1]);
  const border = new THREE.Mesh(K.merge(parts), frameMat()); border.castShadow = true; g.add(border);
  let map;
  if (present && p.poster) { map = texLoader.load(p.poster); map.encoding = THREE.sRGBEncoding }
  else map = plaque(p.title, [tr('Awaiting artwork', 'Esperando la obra'), tr('(file not supplied yet)', '(archivo aún no entregado)')], '#7ff0c8');
  const mat = new THREE.MeshBasicMaterial({ map, side: THREE.FrontSide }), face = new THREE.Mesh(AV.G.pln, mat); face.scale.set(w, h, 1); face.position.z = .07; g.add(face);
  const s = Math.sin(rotY || 0), c = Math.cos(rotY || 0), wx = x + s * 1.6, wz = z + c * 1.6;
  const st = { p, g, face, mat, w, h, video: null, vtex: null, live: false, state: present ? 'poster' : 'missing', x: wx, z: wz, fx: x, fz: z, y, nx: s, nz: c, look: 0, noted: false, au: null };
  M.frames.push(st);
  ctx.T.push({ x: wx, z: wz, r: 3.4, y, label: () => present ? tr('View painting: ', 'Ver pintura: ') + p.title : p.title + ' — ' + tr('awaiting artwork', 'esperando la obra'), fn: () => present ? M.openViewer(p) : AV.toast(p.title + ': ' + tr('this artwork has not been supplied yet.', 'esta obra aún no ha sido entregada.')) });
  return st;
};
M.resetFrames = () => { for (const f of M.frames) M.deactivate(f); M.frames = []; M.active = [] };
M.activate = function (f) {
  if (f.live || f.video || f.state === 'error' || f.state === 'missing' || AV.isFile) return;
  if (M.active.length >= (phone() ? 1 : 3)) return;
  const v = newVideo(f.p.file, true); v.addEventListener('error', () => { f.state = 'error'; M.errors[f.p.filename] = 1; M.deactivate(f, true) }, { once: true });
  const t = new THREE.VideoTexture(v); t.encoding = THREE.sRGBEncoding; t.minFilter = t.magFilter = THREE.LinearFilter; f.video = v; f.vtex = t;
  attachAudio(f, v, f.fx, f.y, f.fz, 2.2, 9);
  playSmart(v, () => { if (f.video === v) { f.mat.map = t; f.mat.needsUpdate = true; f.live = true; f.state = 'live' } }, () => { f.state = 'poster'; M.deactivate(f) });
  M.active.push(f);
};
M.deactivate = function (f, err) {
  detachAudio(f); if (f.video) { try { f.video.pause(); f.video.removeAttribute('src'); f.video.load() } catch (e) { } }
  if (f.vtex) f.vtex.dispose(); f.video = f.vtex = null; M.active = M.active.filter(a => a !== f);
  if (f.live || err) { f.live = false; if (f.poster) { f.mat.map = f.poster; f.mat.needsUpdate = true } }
  if (!err && f.state === 'live') f.state = 'poster';
};
M.liveCount = () => M.frames.filter(f => f.live).length;

/* ---------- cinema screens (any number per world) ---------- */
/* V0.9.7: each screen can choose its programme by tag (data/films.js); shorts (adverts) only where opt.shorts is not false */
M.programme = function (tags, shorts) {
  const it = M.cinemaItems(), list = [], ok = f => !tags || (f.tags || []).some(t => tags.includes(t));
  it.features.filter(ok).forEach(f => list.push({ t: f.title, file: f.file, kind: 'feature' }));
  if (shorts !== false) it.shorts.forEach(p => list.push({ t: p.title, file: p.file, kind: 'short', poster: p.poster }));
  return list;
};
M.cinemaItems = function () {
  const real = (D().cinema || []).filter(c => c.present), shorts = D().placements.filter(p => p.status === 'present');
  return { features: real, absent: (D().cinema || []).filter(c => !c.present), shorts };
};
M.cinemaScreen = function (ctx, x, y, z, rotY, w, opt) {
  opt = opt || {}; const h = w * 9 / 16, g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = rotY; ctx.group.add(g);
  AV.mk(AV.G.box, AV.std(0x1a1a22, .5), 0, 0, -.1, w + .9, h + .9, .2, g);
  const glow = AV.std(0x7ff0ff, .4, 0, opt.glow || 0x7ff0ff, 1.1); for (const s of [[0, h / 2 + .32, w + .7, .1], [0, -h / 2 - .32, w + .7, .1]]) AV.mk(AV.G.box, glow, s[0], s[1], .02, s[2], s[3], .06, g, false); for (const s of [-1, 1]) AV.mk(AV.G.box, glow, s * (w / 2 + .35), 0, .02, .1, h + .7, .06, g, false);
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 288; const c2 = cv.getContext('2d'), tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding;
  const mat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }), scr = new THREE.Mesh(AV.G.pln, mat); scr.scale.set(w, h, 1); scr.position.z = .05; g.add(scr);
  /* caption strip under the screen */
  const ccv = document.createElement('canvas'); ccv.width = 1024; ccv.height = 64; const cap = new THREE.CanvasTexture(ccv); cap.encoding = THREE.sRGBEncoding;
  const capM = new THREE.Mesh(AV.G.pln, new THREE.MeshBasicMaterial({ map: cap, transparent: true })); capM.scale.set(w, w / 16, 1); capM.position.set(0, -h / 2 - .75, .06); g.add(capM);
  const s = Math.sin(rotY), co = Math.cos(rotY);
  const st = { g, cv, c2, tex, mat, scr, ccv, cap, w, h, name: opt.name || tr('APE TOWN OPEN-AIR CINEMA', 'CINE AL AIRE LIBRE DE APE TOWN'), x, y, z, nx: s, nz: co, radius: opt.radius || 40,
    tags: opt.tags || null, shorts: opt.shorts, list: M.programme(opt.tags, opt.shorts), idx: 0, video: null, vtex: null, playing: false, state: 'idle', fails: 0, au: null };
  M.drawIdle(st); M.caption(st, ''); M.screens.push(st); M.screen = st; return st;
};
M.caption = function (st, txt) { const c = st.ccv.getContext('2d'); c.clearRect(0, 0, 1024, 64); if (!txt) { st.cap.needsUpdate = true; return } c.fillStyle = 'rgba(12,6,30,.78)'; c.fillRect(0, 0, 1024, 64); c.font = 'bold 34px Georgia'; c.fillStyle = '#7ff0ff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 512, 33); st.cap.needsUpdate = true };
M.drawIdle = function (st, label) {
  const c = st.c2, it = M.cinemaItems(), gr = c.createLinearGradient(0, 0, 512, 288); gr.addColorStop(0, '#120a30'); gr.addColorStop(1, '#2a0a3a'); c.fillStyle = gr; c.fillRect(0, 0, 512, 288);
  c.globalAlpha = .3; for (let i = 0; i < 9; i++) { c.strokeStyle = ['#ff6ad5', '#7ff0ff', '#ffe066'][i % 3]; c.lineWidth = 3; c.beginPath(); c.arc(256, 150, 20 + i * 22, 0, AV.TAU); c.stroke() } c.globalAlpha = 1;
  c.fillStyle = '#7ff0ff'; c.textAlign = 'center'; c.font = 'bold 30px Georgia'; c.fillText(st.name, 256, 92); c.font = '19px Georgia'; c.fillStyle = '#e8dcc8';
  if (label) c.fillText(label, 256, 160);
  else if (AV.isFile) { c.fillText(tr('Press E to watch (pop-up player)', 'Pulsa E para ver (reproductor emergente)'), 256, 150); c.fillText(tr('Run start_server for big-screen playback', 'Usa start_server para verlo en la pantalla'), 256, 182) }
  else if (!st.list.length) c.fillText(tr('No films supplied yet.', 'Aún no hay películas.'), 256, 160);
  else { c.fillText((it.features.length ? it.features.length + tr(' feature(s) + ', ' película(s) + ') : '') + it.shorts.length + tr(' animated shorts on the programme', ' cortos animados en el programa'), 256, 150); c.fillText(tr('Walk closer — the show starts automatically', 'Acércate: la función empieza sola'), 256, 182) }
  st.tex.needsUpdate = true; if (st.mat.map !== st.tex) { st.mat.map = st.tex; st.mat.needsUpdate = true }
};
M.playScreen = function (st, i) {
  M.stopScreen(st, true); if (!st.list.length || AV.isFile) return; st.idx = ((i % st.list.length) + st.list.length) % st.list.length; const it = st.list[st.idx];
  const v = newVideo(it.file, false); st.video = v; st.state = 'loading';
  v.addEventListener('ended', () => { if (st.video === v) M.playScreen(st, st.idx + 1) });
  v.addEventListener('error', () => { if (st.video !== v) return; st.fails++; if (st.fails >= st.list.length) { M.stopScreen(st); st.state = 'error'; M.drawIdle(st, tr('Could not load the films.', 'No se pudieron cargar las películas.')) } else M.playScreen(st, st.idx + 1) }, { once: true });
  const t = new THREE.VideoTexture(v); t.encoding = THREE.sRGBEncoding; t.minFilter = t.magFilter = THREE.LinearFilter; st.vtex = t;
  attachAudio(st, v, st.x, st.y, st.z, 9, 62);
  playSmart(v, () => { if (st.video !== v) return; st.fails = 0; st.playing = true; st.state = 'playing'; fitScreen(st, v); st.mat.map = t; st.mat.needsUpdate = true; M.caption(st, '▶ ' + it.t + '   ·   ' + (st.idx + 1) + ' / ' + st.list.length) }, () => { if (st.video === v) { M.stopScreen(st); st.state = 'idle' } });
};
/* letterbox portrait videos onto the 16:9 screen by scaling the screen plane to the video's aspect */
function fitScreen(st, v) { const go = () => { const ar = v.videoWidth && v.videoHeight ? v.videoWidth / v.videoHeight : 16 / 9; if (ar >= 16 / 9) st.scr.scale.set(st.w, st.w / ar, 1); else st.scr.scale.set(st.h * ar, st.h, 1) }; if (v.videoWidth) go(); else v.addEventListener('loadedmetadata', go, { once: true }) }
M.stopScreen = function (st, keepState) {
  detachAudio(st); if (st.video) { const v = st.video; st.video = null; try { v.pause(); v.removeAttribute('src'); v.load() } catch (e) { } } if (st.vtex) { st.vtex.dispose(); st.vtex = null }
  st.playing = false; if (!keepState) st.state = 'idle'; st.scr.scale.set(st.w, st.h, 1); M.drawIdle(st); M.caption(st, '');
};
M.resetScreens = () => { for (const s of M.screens) M.stopScreen(s); M.screens = []; M.screen = null };

/* ---------- per-frame: wake/sleep media by distance, choose the audible painting, duck music ---------- */
let acc = 0, lookAcc = 0;
AV.frameFns.push((dt) => {
  if (!AV.W) return; const P = AV.P, fx = -Math.sin(P.yaw), fz = -Math.cos(P.yaw), overlay = AV.modals.some(m => m.id === 'viewer' || m.id === 'cinema');
  acc += dt; lookAcc += dt;
  if (acc >= .4) {
    acc = 0;
    /* nearest paintings get the limited video slots: wake the closest, and if the cap is full let a closer frame take the farthest slot */
    const cap = phone() ? 1 : 3, byDist = M.frames.filter(f => f.state !== 'missing').map(f => { if (!f.poster && f.mat.map && !f.live) f.poster = f.mat.map; return [f, Math.hypot(f.x - P.x, f.z - P.z)] }).sort((a, b) => a[1] - b[1]);
    for (const [f, d] of byDist) if (d > 16 && (f.live || f.video)) M.deactivate(f);
    for (const [f, d] of byDist) {
      if (d >= 11 || f.live || f.video || f.state !== 'poster') continue;
      if (M.active.length >= cap) { const far = M.active.map(a => [a, Math.hypot(a.x - P.x, a.z - P.z)]).sort((a, b) => b[1] - a[1])[0]; if (far && far[1] > d + 2) M.deactivate(far[0]); else break }
      M.activate(f);
    }
    for (const s of M.screens) { const d = Math.hypot(s.x - P.x, s.z - P.z); if (!AV.isFile && d < s.radius && !s.video && s.state === 'idle' && !overlay && !(phone() && M.active.length > 1)) M.playScreen(s, s.idx); else if (d > s.radius + 10 && s.video) { s.idx = s.idx; M.stopScreen(s) } }
  }
  /* audible painting: closest live frame within 6 m that you face */
  let best = null, bd = 6;
  for (const f of M.frames) { if (!f.live) continue; const dx = f.fx - P.x, dz = f.fz - P.z, d = Math.hypot(dx, dz); const facing = d > .01 ? (dx * fx + dz * fz) / d : 1; const inFront = (P.x - f.fx) * f.nx + (P.z - f.fz) * f.nz > 0; if (d < bd && facing > .25 && inFront) { bd = d; best = f } }
  let duck = 0;
  for (const f of M.frames) { const on = f === best && !overlay && !AV.audio.mute; setGain(f, on ? 1 : 0); if (on) duck = Math.max(duck, Math.min(1, 1.6 * (1 - bd / 6))) }
  for (const s of M.screens) { setGain(s, overlay ? 0 : 1); if (s.playing && !overlay) { const d = Math.hypot(s.x - P.x, s.z - P.z); duck = Math.max(duck, Math.min(1, Math.max(0, (s.radius * .85 - d) / (s.radius * .4)))) }   /* V0.9.7: inside ~45% of the radius the music is fully silent: the film's sound takes over */ }
  if (M.extraDuck) duck = Math.max(duck, M.extraDuck()); (M.ducks || []).forEach(f => { try { duck = Math.max(duck, f() || 0) } catch (e) { } });   /* V1.1: other venues with their own music (Astro-9 Orbit Lounge) */
  if (AV.audio && AV.audio.setDuck) AV.audio.setDuck(duck);
  /* gallery-walk quest: really looking at a live painting for ~5 s */
  if (lookAcc >= .25) { const k = lookAcc; lookAcc = 0; if (best && bd < 4.5) { best.look += k; if (best.look > 5 && !best.noted) { best.noted = true; AV.dlg && AV.dlg.event('painting'); AV.quests && AV.quests.notePainting(best.p.filename) } } }
});

/* ---------- painting viewer (DOM <video>, works on file:// too) ---------- */
let prevMusic = null;
function muteMusic() { if (AV.audio && AV.audio.ok) { prevMusic = AV.audio.on; AV.audio.on = false; AV.audio.applyVol() } }
function restoreMusic() { if (prevMusic != null && AV.audio) { AV.audio.on = prevMusic; AV.audio.applyVol(); prevMusic = null } }
M.openViewer = function (p) {
  const el = $('viewer'); el.innerHTML = '<div class="hbar"><h2>' + p.title + '</h2><button id="vx">' + tr('Close (Esc)', 'Cerrar (Esc)') + '</button></div><div class="sub">' + (p.room || '') + ' · ' + (p.caption || '') + '</div>' +
    '<div class="vbox"><video id="vv" controls playsinline loop poster="' + (p.poster || '') + '" style="aspect-ratio:' + (p.w || 9) + '/' + (p.h || 16) + '"></video><div id="vn" class="note"></div></div>';
  el.style.display = 'block'; const v = $('vv'); AV.pushModal('viewer', M.closeViewer); muteMusic();
  v.addEventListener('error', () => { $('vn').textContent = tr('This video could not be loaded (file missing or unsupported format).', 'No se pudo cargar este video (archivo ausente o formato no compatible).') });
  v.src = p.file; const pr = v.play(); pr && pr.catch(() => { }); $('vx').onclick = M.closeViewer; AV.S.media.seen[p.filename] = 1;
  AV.dlg && AV.dlg.event('painting'); AV.quests && AV.quests.notePainting(p.filename);
};
M.closeViewer = function () { const v = $('vv'); if (v) { v.pause(); v.removeAttribute('src'); v.load() } $('viewer').style.display = 'none'; $('viewer').innerHTML = ''; restoreMusic(); AV.popModal('viewer') };

/* ---------- cinema programme panel: choose what plays on the big screen, or watch in the pop-up player ---------- */
M.openCinema = function (screen) {
  const st = screen || M.screens.find(s => s) || null, it = M.cinemaItems(), el = $('cinema'), list = [];
  (st ? st.list : M.programme()).forEach(p => list.push({ t: p.title || p.t + (p.kind === 'short' ? ' (' + tr('short', 'corto') + ')' : ''), file: p.file, na: false }));
  it.absent.forEach(f => list.push({ t: f.title, na: true }));
  const big = st && !AV.isFile;
  let html = '<div class="hbar"><h2>' + (st ? st.name : tr('Cinema', 'Cine')) + '</h2><button id="cx2">' + tr('Close (Esc)', 'Cerrar (Esc)') + '</button></div><div class="sub">' +
    (big ? tr('Pick a title to show it on the big screen (sound comes from the screen). Or watch it here in the pop-up player.', 'Elige un título para verlo en la pantalla grande (el sonido sale de la pantalla). O míralo aquí en el reproductor.') : tr('Opened from a file: films play in this pop-up player.', 'Abierto desde un archivo: las películas se ven en este reproductor.')) +
    (it.features.length ? '' : ' ' + tr('No feature films have been supplied yet — their titles are listed greyed-out.', 'Aún no se han entregado películas: sus títulos aparecen en gris.')) + '</div>' +
    '<div class="cwrap"><video id="cv" controls playsinline' + (big ? ' style="display:none"' : '') + '></video><div id="cn2" class="note"></div><div class="plist" id="pl">';
  list.forEach((l, i) => html += '<div data-i="' + i + '" class="' + (l.na ? 'na' : '') + '">' + (l.na ? '○ ' : '▶ ') + l.t + (l.na ? ' — ' + tr('file not supplied', 'archivo no entregado') : '') + '</div>');
  html += '</div><div class="row">' + (big ? '<button id="cbig">' + tr('Show on big screen', 'Ver en pantalla grande') + '</button><button id="chere">' + tr('Watch here instead', 'Ver aquí') + '</button>' : '') + '<button id="cprev">◀</button><button id="cnext">▶▶</button></div></div>';
  el.innerHTML = html; el.style.display = 'block'; AV.pushModal('cinema', M.closeCinema); $('cx2').onclick = M.closeCinema;
  const v = $('cv'); let idx = list.findIndex(l => !l.na), here = !big;
  const mark = i => [...$('pl').children].forEach((d, k) => d.classList.toggle('sel', k === i));
  const progIdx = i => st ? st.list.findIndex(p => p.file === list[i].file) : -1;
  const play = i => {
    if (i < 0 || i >= list.length || list[i].na) return; idx = i; mark(i); $('cn2').textContent = list[i].t;
    if (here) { v.style.display = ''; v.src = list[i].file; v.play().catch(() => { }); if (st) M.drawIdle(st, tr('Now playing in the pop-up: ', 'En el reproductor: ') + list[i].t) }
    else { M.closeCinema(); M.playScreen(st, progIdx(i)); AV.toast(tr('Now on the big screen: ', 'En la pantalla grande: ') + list[i].t) }
  };
  [...$('pl').children].forEach((d, i) => d.onclick = () => play(i));
  $('cnext').onclick = () => { let n = idx + 1; while (n < list.length && list[n].na) n++; play(n) }; $('cprev').onclick = () => play(idx - 1);
  if (big) { $('cbig').onclick = () => play(idx); $('chere').onclick = () => { here = true; if (st) M.stopScreen(st); muteMusic(); play(idx) }; if (st && st.playing) { const cur = list.findIndex(l => l.file === st.list[st.idx].file); if (cur >= 0) { idx = cur; mark(cur); $('cn2').textContent = tr('On the big screen now: ', 'Ahora en pantalla: ') + list[cur].t } } }
  else { muteMusic(); if (st) M.stopScreen(st); if (idx >= 0) play(idx) }
  v.addEventListener('ended', () => $('cnext').click()); v.addEventListener('error', () => $('cn2').textContent = tr('Could not load this video.', 'No se pudo cargar este video.'));
};
M.closeCinema = function () { const v = $('cv'); if (v) { v.pause(); v.removeAttribute('src'); v.load() } $('cinema').style.display = 'none'; $('cinema').innerHTML = ''; restoreMusic(); for (const s of M.screens) if (!s.playing) M.drawIdle(s); AV.popModal('cinema') };
})(window.AV);
