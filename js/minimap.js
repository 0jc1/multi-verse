/* APEVERSE - minimap.js : Worlds Reborn §28, the GTA-style circular minimap (top right) + full world atlas.
   The map is drawn from the world itself, not from a picture:
     - ground: W.surface(x, z) sampled on a grid (void / water / ground shaded by height), built a few rows per frame (no stutter)
     - buildings + walls: W.cols rectangles; posts/trees: W.circles; roads: W.mapRoads [[x0,z0,x1,z1,w]] where a world provides it
     - places: W.places (only once you have been within 30 m: secrets stay secret), activity venues, portals, your parked vehicles,
       the tuk-tuk route while you ride
   Player = arrow in the middle. Rotates with you (default) or north-up. Keys: J = full atlas · L = rotate / north-up · - / = zoom.
   Phone: smaller map under the Map/Bag/Set buttons; tap it for the atlas. The atlas has every option as a button. */
'use strict';
(function (AV) {
const tr = AV.tr, $ = AV.$, TAU = Math.PI * 2;
const MM = AV.minimap = { base: null };
const set = () => { const S = AV.S; S.set.mm = S.set.mm || { on: true, rot: true, zoom: 1 }; return S.set.mm };
const seen = () => { const S = AV.S; S.mmSeen = S.mmSeen || {}; const w = AV.W ? AV.W.id : '_'; return S.mmSeen[w] = S.mmSeen[w] || {} };
const phone = () => AV.device === 'phone';
const SPAN = 140;   // metres across the minimap at zoom 1

/* ---------- DOM ---------- */
const wrap = document.createElement('div'); wrap.id = 'mmWrap'; wrap.title = tr('Minimap — click for the full map (J)', 'Minimapa: clic para el mapa completo (J)');
wrap.style.cssText = 'position:fixed;z-index:4;display:none;border-radius:50%;box-shadow:0 2px 10px rgba(0,0,0,.55);cursor:pointer;touch-action:none';
const cv = document.createElement('canvas'); cv.id = 'mm'; wrap.appendChild(cv); document.body.appendChild(wrap); const cx = cv.getContext('2d');
let D = 0;
function layout() { const p = phone(), d = p ? 112 : 190; if (d !== D) { D = d; const dpr = Math.min(2, devicePixelRatio || 1); cv.width = cv.height = d * dpr; cv.style.width = cv.style.height = d + 'px'; cx.setTransform(dpr, 0, 0, dpr, 0, 0) }
  wrap.style.right = 'calc(12px + env(safe-area-inset-right,0px))'; wrap.style.top = p ? 'calc(70px + env(safe-area-inset-top,0px))' : 'calc(10px + env(safe-area-inset-top,0px))';
  const f = $('fps'); if (f) f.style.top = wrap.style.display === 'none' ? '' : 'calc(' + ((p ? 70 : 10) + D + 8) + 'px + env(safe-area-inset-top,0px))' }
wrap.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); MM.atlas() });

/* ---------- base layer (built from the world) ---------- */
const placeOf = p => Array.isArray(p) ? { id: p[0], name: [p[1], p[2] || p[1]], x: +p[3], z: +p[4] } : p && { id: p.id, name: Array.isArray(p.name) ? p.name : [p.name || p.id, p.name || p.id], x: +p.x, z: +p.z };
MM.places = () => ((AV.W && AV.W.places) || []).map(placeOf).filter(p => p && isFinite(p.x) && isFinite(p.z));
function bounds(W) {
  let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; const add = (x, z) => { if (!isFinite(x) || !isFinite(z)) return; x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z) };
  W.cols.forEach(c => { add(c[0], c[2]); add(c[1], c[3]) }); MM.places().forEach(p => add(p.x, p.z)); W.T.forEach(t => add(t.x, t.z)); Object.values(W.arrivals || {}).forEach(a => add(a.x, a.z)); add(AV.P.x, AV.P.z);
  const cxm = (x0 + x1) / 2 || 0, czm = (z0 + z1) / 2 || 0;   // probe the walkable surface outwards from the middle
  for (let k = 0; k < 32; k++) { const a = k / 32 * TAU; let last = null; for (let r = 0; r < 760; r += 6) { const x = cxm + Math.cos(a) * r, z = czm + Math.sin(a) * r; if (W.surface(x, z) !== null) last = [x, z] } if (last) add(last[0], last[1]) }
  x0 -= 12; x1 += 12; z0 -= 12; z1 += 12; const lim = 1500; if (x1 - x0 > lim) { const m = (x0 + x1) / 2; x0 = m - lim / 2; x1 = m + lim / 2 } if (z1 - z0 > lim) { const m = (z0 + z1) / 2; z0 = m - lim / 2; z1 = m + lim / 2 }
  return { x0, x1, z0, z1 };
}
function startBuild(W) {
  const b = bounds(W), w = b.x1 - b.x0, h = b.z1 - b.z0, res = Math.max(.75, Math.ceil(Math.max(w, h) / 760 * 4) / 4), cw = Math.ceil(w / res), ch = Math.ceil(h / res);
  const c = document.createElement('canvas'); c.width = cw; c.height = ch; const g = c.getContext('2d'), img = g.createImageData(cw, ch);
  MM.base = { W, b, res, cw, ch, c, g, img, row: 0, done: false, wl: W.waterY != null ? W.waterY : -.35 };
}
function stepBuild(ms) {
  const B = MM.base; if (!B || B.done) return; const t0 = performance.now(), W = B.W, d = B.img.data;
  while (B.row < B.ch && performance.now() - t0 < ms) {
    const z = B.b.z0 + (B.row + .5) * B.res;
    for (let i = 0; i < B.cw; i++) { const x = B.b.x0 + (i + .5) * B.res, s = W.surface(x, z), o = (B.row * B.cw + i) * 4; let r, gg, bb, a = 255;
      if (s === null) { r = 14; gg = 10; bb = 26; a = 0 } else if (s < B.wl) { r = 38; gg = 104; bb = 170 } else { const k = Math.max(-.25, Math.min(.35, s / 18)); r = 74 + k * 120; gg = 92 + k * 110; bb = 70 + k * 90 }
      d[o] = r; d[o + 1] = gg; d[o + 2] = bb; d[o + 3] = a }
    B.row++;
  }
  if (B.row >= B.ch) { B.g.putImageData(B.img, 0, 0); overlay(B); B.done = true; B.img = null }
  else if (B.row % 24 === 0) B.g.putImageData(B.img, 0, 0);
}
function overlay(B) {
  const g = B.g, W = B.W, X = x => (x - B.b.x0) / B.res, Z = z => (z - B.b.z0) / B.res;
  g.lineCap = 'round'; for (const r of (W.mapRoads || [])) { g.strokeStyle = 'rgba(214,206,186,.85)'; g.lineWidth = Math.max(1.5, (r[4] || 6) / B.res); g.beginPath(); g.moveTo(X(r[0]), Z(r[1])); g.lineTo(X(r[2]), Z(r[3])); g.stroke() }
  g.fillStyle = 'rgba(196,150,118,.92)'; g.strokeStyle = 'rgba(60,34,24,.8)'; g.lineWidth = 1;
  for (const c of W.cols) { const w = (c[1] - c[0]) / B.res, h = (c[3] - c[2]) / B.res; if (w * h > 9e5) continue; g.fillRect(X(c[0]), Z(c[2]), Math.max(1, w), Math.max(1, h)) }
  g.fillStyle = 'rgba(30,60,34,.55)'; let n = 0; for (const c of W.circles) { if (c[2] < .5 || n++ > 6000) continue; g.beginPath(); g.arc(X(c[0]), Z(c[1]), Math.max(.8, c[2] / B.res), 0, TAU); g.fill() }
}
MM._buildNow = () => { while (MM.base && !MM.base.done) stepBuild(1e6) };

/* ---------- markers ---------- */
const ICON = { hoops: '🏀', dj: '🎧', inst: '🎶', rental: '🚲' };
function markers() {
  const W = AV.W, out = [], P = AV.P, sn = seen();
  for (const p of MM.places()) { if (Math.hypot(p.x - P.x, p.z - P.z) < 30) sn[p.id] = 1; if (sn[p.id]) out.push({ x: p.x, z: p.z, kind: 'place', name: tr(p.name[0], p.name[1]) }) }
  for (const v of (AV.act && AV.act.venues) || []) if (v.W === W && ICON[v.type]) { const vx = v.x != null ? v.x : v.p && v.p.x, vz = v.z != null ? v.z : v.p && v.p.z; if (!isFinite(vx) || !isFinite(vz)) continue; const k = 'v_' + v.type + Math.round(vx) + '_' + Math.round(vz); if (Math.hypot(vx - P.x, vz - P.z) < 80) sn[k] = 1; if (sn[k]) out.push({ x: vx, z: vz, kind: 'venue', icon: v.type === 'rental' && v.p && AV.veh ? AV.veh.KINDS[v.p.kind].icon : ICON[v.type], name: v.p && v.p.name ? tr(v.p.name[0], v.p.name[1]) : v.type }) }
  for (const t of W.T) { let l = ''; try { l = typeof t.label === 'function' ? t.label() : t.label } catch (e) { } if (/portal|Portal|pipe gate|gate to/i.test(l || '') && (!t.show || t.show())) { const k = 'p' + Math.round(t.x) + '_' + Math.round(t.z); if (Math.hypot(t.x - P.x, t.z - P.z) < 60) sn[k] = 1; if (sn[k]) out.push({ x: t.x, z: t.z, kind: 'portal', name: l }) } }
  if (AV.veh) for (const o of AV.veh.live()) if (!(AV.act.cur && AV.act.cur.rec === o.rec)) out.push({ x: o.rec.x, z: o.rec.z, kind: 'veh', icon: AV.veh.KINDS[o.rec.kind].icon, name: tr('Your ', 'Tu ') + AV.veh.KINDS[o.rec.kind].n[AV.ui === 'es' ? 1 : 0] });
  return out;
}
MM.markers = markers;

/* ---------- draw the minimap ---------- */
let rt = 0;
function draw() {
  const B = MM.base, P = AV.P, s = set(), R = D / 2, scale = D / (SPAN / (s.zoom || 1)), th = s.rot ? P.yaw : 0, c = cx;
  c.clearRect(0, 0, D, D); c.save(); c.beginPath(); c.arc(R, R, R - 1, 0, TAU); c.clip(); c.fillStyle = '#120a1e'; c.fillRect(0, 0, D, D);
  c.translate(R, R); c.rotate(th); c.scale(scale, scale); c.translate(-P.x, -P.z);
  if (B && B.c) { c.imageSmoothingEnabled = true; c.drawImage(B.c, B.b.x0, B.b.z0, B.cw * B.res, B.ch * B.res) }
  const ride = AV.cm && AV.cm.ride; if (ride && ride.curve) { c.strokeStyle = '#ffd84a'; c.lineWidth = 2.2 / scale; c.setLineDash([5 / scale, 4 / scale]); c.beginPath(); ride.curve.getSpacedPoints(60).forEach((p, i) => i ? c.lineTo(p.x, p.z) : c.moveTo(p.x, p.z)); c.stroke(); c.setLineDash([]) }
  c.setTransform(cv.width / D, 0, 0, cv.height / D, 0, 0);
  const cs = Math.cos(th), sn = Math.sin(th), scr = (x, z) => { const dx = (x - P.x) * scale, dz = (z - P.z) * scale; return [R + dx * cs - dz * sn, R + dx * sn + dz * cs] };
  c.textAlign = 'center'; c.textBaseline = 'middle';
  for (const m of MM._mk || []) { const [x, y] = scr(m.x, m.z); if (Math.hypot(x - R, y - R) > R - 6) continue;
    if (m.kind === 'place') { c.fillStyle = '#ffd84a'; c.strokeStyle = '#2a1408'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y - 5); c.lineTo(x + 4, y); c.lineTo(x, y + 5); c.lineTo(x - 4, y); c.closePath(); c.fill(); c.stroke() }
    else if (m.kind === 'portal') { c.strokeStyle = '#c88aff'; c.lineWidth = 2.5; c.beginPath(); c.arc(x, y, 5, 0, TAU); c.stroke() }
    else { c.font = (phone() ? 10 : 13) + 'px sans-serif'; c.fillText(m.icon || '•', x, y) } }
  /* player arrow */
  c.save(); c.translate(R, R); c.rotate(th - P.yaw); c.fillStyle = '#ffffff'; c.strokeStyle = '#ff4ad2'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -8); c.lineTo(6, 6); c.lineTo(0, 3); c.lineTo(-6, 6); c.closePath(); c.fill(); c.stroke(); c.restore();
  c.restore();
  /* ring + north */
  c.strokeStyle = 'rgba(255,216,74,.85)'; c.lineWidth = 2.5; c.beginPath(); c.arc(R, R, R - 1.5, 0, TAU); c.stroke();
  const nx = R + Math.sin(th) * (R - 9), ny = R - Math.cos(th) * (R - 9); c.fillStyle = '#e83a30'; c.beginPath(); c.arc(nx, ny, 7, 0, TAU); c.fill(); c.fillStyle = '#fff'; c.font = 'bold 9px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(tr('N', 'N'), nx, ny + .5);
  if (B && !B.done) { c.fillStyle = 'rgba(255,255,255,.7)'; c.font = '9px sans-serif'; c.fillText(tr('mapping…', 'mapeando…'), R, D - 14) }
}
MM.visible = () => wrap.style.display !== 'none';
/* where a world point lands on the minimap (pixels from its top-left), same maths as draw(); used by tests */
MM._scr = (x, z) => { const s = set(), P = AV.P, R = D / 2, scale = D / (SPAN / (s.zoom || 1)), th = s.rot ? P.yaw : 0, dx = (x - P.x) * scale, dz = (z - P.z) * scale; return [R + dx * Math.cos(th) - dz * Math.sin(th), R + dx * Math.sin(th) + dz * Math.cos(th)] };
MM._px = (x, z) => { const B = MM.base; if (!B || !B.done) return null; const i = Math.floor((x - B.b.x0) / B.res), j = Math.floor((z - B.b.z0) / B.res); if (i < 0 || j < 0 || i >= B.cw || j >= B.ch) return null; return Array.from(B.g.getImageData(i, j, 1, 1).data) };
MM._fill = () => { const B = MM.base; if (!B || !B.done) return 0; const d = B.g.getImageData(0, 0, B.cw, B.ch).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++; return n / (B.cw * B.ch) };
AV.frameFns.push(() => {
  const W = AV.W, s = set(); const hide = !AV.running || !W || !s.on || (AV.act && AV.act.cur && AV.act.cur.id === 'photo') || document.body.classList.contains('nm') || AV.modals.some(m => m.id === 'viewer' || m.id === 'cinema');
  if (hide) { if (wrap.style.display !== 'none') { wrap.style.display = 'none'; layout() } return }
  if (wrap.style.display === 'none') { wrap.style.display = 'block'; layout() } else if ((phone() ? 112 : 190) !== D) layout();
  if (!MM.base || MM.base.W !== W) startBuild(W); stepBuild(3);
  const now = AV.now(); if (now - rt > .5) { rt = now; MM._mk = markers() } draw();
});

/* ---------- full atlas (J, or click / tap the minimap) ---------- */
MM.atlas = function () {
  if (!AV.W || AV.blocking()) return; if (!MM.base || MM.base.W !== AV.W) startBuild(AV.W); MM._buildNow(); const B = MM.base, s = set(), mk = markers();
  const p = AV.panel('cmp', '<b>🗺 ' + tr('Map of ', 'Mapa de ') + (AV.W.name || AV.W.id) + '</b><div style="position:relative;margin:6px auto"><canvas id="mmAtlas" style="width:100%;max-width:560px;display:block;margin:auto;border-radius:8px;background:#120a1e"></canvas></div>' +
    '<div class="note">' + tr('◆ places you have found · ⭘ portals · icons: activities and your vehicles. Unvisited places stay hidden.', '◆ lugares descubiertos · ⭘ portales · iconos: actividades y tus vehículos. Los lugares sin visitar siguen ocultos.') + '</div>' +
    '<div class="grid"><button data-mm="rot">' + (s.rot ? tr('Minimap: rotates with you', 'Minimapa: gira contigo') : tr('Minimap: north up', 'Minimapa: norte arriba')) + '</button><button data-mm="zin">' + tr('Zoom in (=)', 'Acercar (=)') + '</button><button data-mm="zout">' + tr('Zoom out (-)', 'Alejar (-)') + '</button><button data-mm="on">' + (s.on ? tr('Hide minimap', 'Ocultar minimapa') : tr('Show minimap', 'Mostrar minimapa')) + '</button></div>' +
    '<div class="note" style="max-height:140px;overflow:auto">' + mk.filter(m => m.kind !== 'veh').map(m => (m.kind === 'place' ? '◆ ' : m.kind === 'portal' ? '⭘ ' : (m.icon || '') + ' ') + m.name + ' · ' + Math.round(Math.hypot(m.x - AV.P.x, m.z - AV.P.z)) + ' m').join('<br>') + '</div><button data-close>' + tr('Close (J)', 'Cerrar (J)') + '</button>');
  const ac = p.querySelector('#mmAtlas'), sc = Math.min(560 / B.cw, 560 / B.ch, 4), w = Math.round(B.cw * sc), h = Math.round(B.ch * sc); ac.width = w; ac.height = h; const g = ac.getContext('2d'); g.drawImage(B.c, 0, 0, w, h);
  const X = x => (x - B.b.x0) / B.res * sc, Z = z => (z - B.b.z0) / B.res * sc; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '11px Georgia, serif';
  for (const m of mk) { const x = X(m.x), y = Z(m.z); if (m.kind === 'place') { g.fillStyle = '#ffd84a'; g.beginPath(); g.arc(x, y, 4, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.strokeStyle = 'rgba(0,0,0,.8)'; g.lineWidth = 3; g.strokeText(m.name, x, y - 10); g.fillText(m.name, x, y - 10) } else if (m.kind === 'portal') { g.strokeStyle = '#c88aff'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 6, 0, TAU); g.stroke() } else { g.font = '14px sans-serif'; g.fillText(m.icon || '•', x, y); g.font = '11px Georgia, serif' } }
  const P = AV.P; g.save(); g.translate(X(P.x), Z(P.z)); g.rotate(-P.yaw); g.fillStyle = '#fff'; g.strokeStyle = '#ff4ad2'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, -9); g.lineTo(7, 7); g.lineTo(0, 3); g.lineTo(-7, 7); g.closePath(); g.fill(); g.stroke(); g.restore();
  g.fillStyle = '#e83a30'; g.beginPath(); g.arc(w - 16, 16, 9, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.font = 'bold 11px sans-serif'; g.fillText('N', w - 16, 16.5);
  p.querySelectorAll('[data-mm]').forEach(b => b.onclick = () => { const k = b.dataset.mm; if (k === 'rot') s.rot = !s.rot; if (k === 'zin') s.zoom = Math.min(3, (s.zoom || 1) * 1.4); if (k === 'zout') s.zoom = Math.max(.4, (s.zoom || 1) / 1.4); if (k === 'on') s.on = !s.on; AV.save(); AV.closePanel('cmp'); MM.atlas() });
};
AV.keymap.KeyJ = () => MM.atlas();
MM.atlasOpen = () => { const a = document.getElementById('mmAtlas'), p = document.getElementById('cmp'); return !!(a && p && p.contains(a) && getComputedStyle(p).display !== 'none') };
AV.keymap.KeyL = () => { const s = set(); s.rot = !s.rot; AV.save(); AV.toast(s.rot ? tr('Minimap rotates with you', 'El minimapa gira contigo') : tr('Minimap: north up', 'Minimapa: norte arriba')) };
AV.keymap.Equal = AV.keymap.NumpadAdd = () => { const s = set(); s.zoom = Math.min(3, (s.zoom || 1) * 1.25) };
AV.keymap.Minus = AV.keymap.NumpadSubtract = () => { const s = set(); s.zoom = Math.max(.4, (s.zoom || 1) / 1.25) };
/* the J key also closes the atlas (the core skips keymaps while a panel is open) */
addEventListener('keydown', e => { if (e.code === 'KeyJ' && MM.atlasOpen()) { e.stopImmediatePropagation(); AV.closePanel('cmp') } }, true);
})(window.AV);
