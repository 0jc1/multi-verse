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
  if (AV.transit && AV.transit.has()) for (const t of W._taxis || []) { const k = 'tx' + Math.round(t.x) + '_' + Math.round(t.z); if (Math.hypot(t.x - P.x, t.z - P.z) < 90) sn[k] = 1; if (sn[k]) out.push({ x: t.x, z: t.z, kind: 'venue', icon: AV.transit.CFG[W.id].taxi.icon, name: tr('Taxi / shuttle stand', 'Parada de taxi / lanzadera') }) }
  if (MM.extra) try { for (const m of MM.extra()) out.push(m) } catch (e) { }   /* 2.3: mission markers (lw_missions.js) */
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
  if (MM.dest && MM.dest.path) { c.strokeStyle = '#ff4ad2'; c.lineWidth = 3.4 / scale; c.lineJoin = 'round'; c.beginPath(); c.moveTo(P.x, P.z); MM.dest.path.forEach(p => c.lineTo(p[0], p[1])); c.stroke() }   /* the route to your waypoint */
  c.setTransform(cv.width / D, 0, 0, cv.height / D, 0, 0);
  const cs = Math.cos(th), sn = Math.sin(th), scr = (x, z) => { const dx = (x - P.x) * scale, dz = (z - P.z) * scale; return [R + dx * cs - dz * sn, R + dx * sn + dz * cs] };
  if (MM.dest) { let [x, y] = scr(MM.dest.x, MM.dest.z); const dd = Math.hypot(x - R, y - R); if (dd > R - 10) { x = R + (x - R) / dd * (R - 12); y = R + (y - R) / dd * (R - 12) } c.fillStyle = '#ff4ad2'; c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 6, 0, TAU); c.fill(); c.stroke() }
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
  if (MM.dest) { const dm = Math.round(Math.hypot(MM.dest.x - P.x, MM.dest.z - P.z)); c.fillStyle = 'rgba(20,8,32,.8)'; c.fillRect(R - 34, D - 26, 68, 15); c.fillStyle = '#ff8ad8'; c.font = 'bold 10px sans-serif'; c.fillText('📍 ' + (dm > 999 ? (dm / 1000).toFixed(1) + ' km' : dm + ' m'), R, D - 18) }
}
MM.visible = () => wrap.style.display !== 'none';
/* where a world point lands on the minimap (pixels from its top-left), same maths as draw(); used by tests */
MM._scr = (x, z) => { const s = set(), P = AV.P, R = D / 2, scale = D / (SPAN / (s.zoom || 1)), th = s.rot ? P.yaw : 0, dx = (x - P.x) * scale, dz = (z - P.z) * scale; return [R + dx * Math.cos(th) - dz * Math.sin(th), R + dx * Math.sin(th) + dz * Math.cos(th)] };
MM._px = (x, z) => { const B = MM.base; if (!B || !B.done) return null; const i = Math.floor((x - B.b.x0) / B.res), j = Math.floor((z - B.b.z0) / B.res); if (i < 0 || j < 0 || i >= B.cw || j >= B.ch) return null; return Array.from(B.g.getImageData(i, j, 1, 1).data) };
MM._fill = () => { const B = MM.base; if (!B || !B.done) return 0; const d = B.g.getImageData(0, 0, B.cw, B.ch).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++; return n / (B.cw * B.ch) };
AV.frameFns.push(() => {
  const W = AV.W, s = set(); const hide = !AV.running || !W || !s.on || (AV.act && AV.act.cur && AV.act.cur.id === 'photo') || document.body.classList.contains('nm') || AV.modals.some(m => m.id === 'viewer' || m.id === 'cinema' || m.id === 'atlas');
  if (hide) { if (wrap.style.display !== 'none') { wrap.style.display = 'none'; layout() } return }
  if (wrap.style.display === 'none') { wrap.style.display = 'block'; layout() } else if ((phone() ? 112 : 190) !== D) layout();
  if (!MM.base || MM.base.W !== W) startBuild(W); stepBuild(3);
  const now = AV.now(); if (now - rt > .5) { rt = now; MM._mk = markers() } draw();
});

/* ---------- routes: A* over the world's street network (W.mapNav = {nodes, links}) or a straight line ---------- */
function routeTo(x, z) {
  const W = AV.W, N = W && W.mapNav, P = AV.P; if (!N || !N.nodes || !N.nodes.length) return [[x, z]];
  const nr = (px, pz) => { let b = 0, bd = 1e18; for (let i = 0; i < N.nodes.length; i++) { const n = N.nodes[i], d = (n[0] - px) ** 2 + (n[1] - pz) ** 2; if (d < bd) { bd = d; b = i } } return b };
  const a = nr(P.x, P.z), b = nr(x, z), n = N.nodes.length, g = new Float64Array(n).fill(1e18), prev = new Int32Array(n).fill(-1), done = new Uint8Array(n), h = i => Math.hypot(N.nodes[i][0] - x, N.nodes[i][1] - z), heap = [];
  const push = (f, i) => { heap.push([f, i]); let k = heap.length - 1; while (k > 0) { const p = (k - 1) >> 1; if (heap[p][0] <= heap[k][0]) break; const t = heap[p]; heap[p] = heap[k]; heap[k] = t; k = p } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let k = 0; for (;;) { const l = 2 * k + 1, r = l + 1; let m = k; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === k) break; const t = heap[m]; heap[m] = heap[k]; heap[k] = t; k = m } } return top };
  g[a] = 0; push(h(a), a);
  while (heap.length) { const u = pop()[1]; if (done[u]) continue; done[u] = 1; if (u === b) break; for (const v of N.links[u]) { const nd = g[u] + Math.hypot(N.nodes[u][0] - N.nodes[v][0], N.nodes[u][1] - N.nodes[v][1]); if (nd < g[v]) { g[v] = nd; prev[v] = u; push(nd + h(v), v) } } }
  if (!done[b]) return [[x, z]]; const out = []; for (let u = b; u >= 0; u = prev[u]) out.unshift(N.nodes[u]); out.push([x, z]); return out;
}
MM._route = routeTo;
const pathLen = p => { let l = Math.hypot(p[0][0] - AV.P.x, p[0][1] - AV.P.z); for (let i = 1; i < p.length; i++) l += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return l };
MM.setDest = function (x, z, name) { const d0 = AV.P ? Math.hypot(AV.P.x - x, AV.P.z - z) : 99; MM.dest = { x, z, name: name || tr('Waypoint', 'Destino'), path: MM._route(x, z), w: AV.W, arr: d0 < 16 ? 2.5 : 12 };   /* 2.3: short-range waypoints arrive at 2.5 m, not 12 m */   /* M13: MM._route is AV.path.route when pathfind.js is loaded */ const l = pathLen(MM.dest.path); AV.toast('📍 ' + MM.dest.name + ' · ' + (l > 999 ? (l / 1000).toFixed(1) + ' km' : Math.round(l) + ' m') + tr(' — follow the pink route', ' — sigue la ruta rosa')); return MM.dest };
MM.clearDest = () => { MM.dest = null };
let dt0 = 0; AV.frameFns.push(() => { const d = MM.dest; if (!d) return; if (d.w !== AV.W) { MM.dest = null; return } const P = AV.P;
  if (Math.hypot(P.x - d.x, P.z - d.z) < (d.arr || 12)) { AV.toast('📍 ' + tr('You have arrived: ', 'Has llegado: ') + d.name); MM.dest = null; return }
  while (d.path.length > 1 && Math.hypot(d.path[0][0] - P.x, d.path[0][1] - P.z) < 9) d.path.shift();
  const now = AV.now(); if (now - dt0 > 2) { dt0 = now; const off = (() => { let best = Math.hypot(d.path[0][0] - P.x, d.path[0][1] - P.z), a = [P.x, P.z]; for (let i = 0; i < Math.min(3, d.path.length - 1); i++) { const p = d.path[i], q = d.path[i + 1], dx = q[0] - p[0], dz = q[1] - p[1], l2 = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((P.x - p[0]) * dx + (P.z - p[1]) * dz) / l2)); best = Math.min(best, Math.hypot(P.x - p[0] - dx * t, P.z - p[1] - dz * t)) } return best })();
    if (off > 15) { d.path = MM._route(d.x, d.z); MM.rerouted = (MM.rerouted || 0) + 1 } } });   /* M13: off the route line by > 15 m: re-route */

/* ---------- the full-screen map: zoom (wheel / + -), pan (drag), districts, places, click to set a waypoint ---------- */
const FS = document.createElement('style'); FS.textContent = '#mmFull{position:fixed;inset:0;z-index:45;display:none;background:rgba(8,4,20,.94);font:13px Georgia,serif;color:#f4ecd8}#mmFull canvas{position:absolute;left:0;top:0;cursor:grab;touch-action:none}' +
  '#mmFull .bar{position:absolute;left:10px;top:10px;display:flex;gap:6px;flex-wrap:wrap;z-index:2}#mmFull button{font:13px Georgia,serif;padding:6px 10px;border-radius:8px;border:1px solid #ffd84a;background:rgba(30,14,50,.9);color:#fff;cursor:pointer}#mmFull .side{position:absolute;right:0;top:0;bottom:0;width:min(300px,42vw);overflow:auto;background:rgba(20,8,32,.88);border-left:1px solid #6a5a9a;padding:8px;z-index:2}' +
  '#mmFull .side .it{display:flex;justify-content:space-between;align-items:center;padding:3px 2px;border-bottom:1px solid rgba(255,255,255,.08)}#mmFull .side .it button{padding:2px 8px;font-size:12px}#mmFull .hint{position:absolute;left:10px;bottom:10px;opacity:.75;z-index:2}';
document.head.appendChild(FS);
const ov = document.createElement('div'); ov.id = 'mmFull'; ov.innerHTML = '<canvas id="mmAtlas"></canvas><div class="bar"><button data-mm="zin">＋</button><button data-mm="zout">－</button><button data-mm="me">⌖ ' + tr('Me', 'Yo') + '</button><button data-mm="clear">✕ ' + tr('Clear route', 'Quitar ruta') + '</button><button data-mm="rot"></button><button data-mm="on"></button><button data-mm="close">' + tr('Close (J / Esc)', 'Cerrar (J / Esc)') + '</button></div><div class="side" id="mmSide"></div><div class="hint">' + tr('Drag to pan · wheel or ＋/－ to zoom · click a place (or anywhere) to set a route', 'Arrastra para moverte · rueda o ＋/－ para zoom · clic en un lugar (o donde sea) para trazar ruta') + '</div>';
document.body.appendChild(ov);
const big = ov.querySelector('#mmAtlas'), bg = big.getContext('2d'), V = { cx: 0, cz: 0, sc: 1 };
MM.atlasOpen = () => ov.style.display === 'block';
const w2s = (x, z) => [big.clientWidth / 2 + (x - V.cx) * V.sc, big.clientHeight / 2 + (z - V.cz) * V.sc], s2w = (px, py) => [V.cx + (px - big.clientWidth / 2) / V.sc, V.cz + (py - big.clientHeight / 2) / V.sc];
function allMarks() { const W = AV.W, P = AV.P, out = markers().map(m => Object.assign({}, m)); const seenN = new Set(out.map(m => m.name)); for (const p of MM.places()) { const n = tr(p.name[0], p.name[1]); if (!seenN.has(n)) out.push({ x: p.x, z: p.z, kind: 'place', name: n, dim: true }) } return out }
MM.fullMarks = allMarks;
function renderBig() {
  if (!MM.atlasOpen()) return; const B = MM.base, W = AV.W, P = AV.P, dpr = Math.min(2, devicePixelRatio || 1), w = innerWidth, h = innerHeight;
  if (big.width !== Math.round(w * dpr)) { big.width = Math.round(w * dpr); big.height = Math.round(h * dpr); big.style.width = w + 'px'; big.style.height = h + 'px' }
  const c = bg; c.setTransform(dpr, 0, 0, dpr, 0, 0); c.fillStyle = '#0c0818'; c.fillRect(0, 0, w, h);
  if (B && B.c) { const [x0, y0] = w2s(B.b.x0, B.b.z0); c.imageSmoothingEnabled = V.sc < 3; c.drawImage(B.c, x0, y0, B.cw * B.res * V.sc, B.ch * B.res * V.sc) }
  if (MM.dest && MM.dest.path) { c.strokeStyle = '#ff4ad2'; c.lineWidth = 4; c.lineJoin = 'round'; c.beginPath(); c.moveTo(...w2s(P.x, P.z)); MM.dest.path.forEach(p => c.lineTo(...w2s(p[0], p[1]))); c.stroke() }
  c.textAlign = 'center'; c.textBaseline = 'middle';
  for (const d of (W && W.mapDistricts) || []) { const [x, y] = w2s(d.x, d.z); c.font = 'bold ' + Math.max(11, Math.min(22, 8 + V.sc * 6)) + 'px Georgia, serif'; c.lineWidth = 4; c.strokeStyle = 'rgba(0,0,0,.75)'; c.strokeText(d.name, x, y); c.fillStyle = '#ffe9a8'; c.fillText(d.name, x, y) }
  if (V.sc > .55) for (const st of (W && W.mapStreets) || []) { const [x, y] = w2s(st.x, st.z); if (x < -80 || y < -80 || x > w + 80 || y > h + 80) continue; let an = st.a; if (an > Math.PI / 2) an -= Math.PI; if (an < -Math.PI / 2) an += Math.PI; c.save(); c.translate(x, y); c.rotate(an); c.font = 'italic ' + Math.max(10, Math.min(15, 6 + V.sc * 5)) + 'px Georgia, serif'; c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,.8)'; c.strokeText(st.name, 0, 0); c.fillStyle = '#bfe8ff'; c.fillText(st.name, 0, 0); c.restore() }   /* Cinematic V1: street names (Astro-9 network) */
  MM._big = allMarks(); for (const m of MM._big) { const [x, y] = w2s(m.x, m.z); if (x < -20 || y < -20 || x > w + 20 || y > h + 20) continue;
    if (m.kind === 'place') { c.globalAlpha = m.dim ? .55 : 1; c.fillStyle = '#ffd84a'; c.beginPath(); c.arc(x, y, 5, 0, TAU); c.fill(); if (!m.dim || V.sc > .9) { c.font = '12px Georgia, serif'; c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,.8)'; c.strokeText(m.name, x, y - 12); c.fillStyle = '#fff'; c.fillText(m.name, x, y - 12) } c.globalAlpha = 1 }
    else if (m.kind === 'portal') { c.strokeStyle = '#c88aff'; c.lineWidth = 2.5; c.beginPath(); c.arc(x, y, 7, 0, TAU); c.stroke() } else { c.font = '15px sans-serif'; c.fillText(m.icon || '•', x, y) } }
  if (MM.dest) { const [x, y] = w2s(MM.dest.x, MM.dest.z); c.fillStyle = '#ff4ad2'; c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 8, 0, TAU); c.fill(); c.stroke(); c.font = 'bold 13px Georgia, serif'; c.fillStyle = '#ff8ad8'; c.fillText('📍 ' + MM.dest.name, x, y - 16) }
  { const [x, y] = w2s(P.x, P.z); c.save(); c.translate(x, y); c.rotate(-P.yaw); c.fillStyle = '#fff'; c.strokeStyle = '#ff4ad2'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, -11); c.lineTo(8, 9); c.lineTo(0, 4); c.lineTo(-8, 9); c.closePath(); c.fill(); c.stroke(); c.restore() }
  c.fillStyle = '#e83a30'; c.beginPath(); c.arc(w - (parseInt(getComputedStyle(ov.querySelector('.side')).width) || 300) - 26, 30, 11, 0, TAU); c.fill(); c.fillStyle = '#fff'; c.font = 'bold 12px sans-serif'; c.fillText('N', w - (parseInt(getComputedStyle(ov.querySelector('.side')).width) || 300) - 26, 31);
}
function side() { const P = AV.P, rows = [], W = AV.W; for (const d of (W && W.mapDistricts) || []) rows.push({ n: '🏙 ' + d.name, x: d.x, z: d.z }); for (const m of allMarks()) if (m.kind !== 'veh') rows.push({ n: (m.kind === 'place' ? '◆ ' : m.kind === 'portal' ? '⭘ ' : (m.icon || '') + ' ') + m.name, x: m.x, z: m.z });
  rows.forEach(r => r.d = Math.hypot(r.x - P.x, r.z - P.z)); rows.sort((a, b) => a.d - b.d); MM._rows = rows;
  ov.querySelector('#mmSide').innerHTML = '<b>' + (W.name || W.id) + '</b><div class="note">' + tr('Places + neighbourhoods by distance', 'Lugares y barrios por distancia') + '</div>' + rows.slice(0, 80).map((r, i) => '<div class="it"><span>' + r.n + ' <small>' + (r.d > 999 ? (r.d / 1000).toFixed(1) + ' km' : Math.round(r.d) + ' m') + '</small></span><span><button data-go="' + i + '">' + tr('Route', 'Ruta') + '</button>' + (AV.transit && AV.transit.has() ? '<button data-taxi="' + i + '" title="Fast travel">' + AV.transit.CFG[W.id].taxi.icon + '</button>' : '') + '</span></div>').join('');
  ov.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { const r = MM._rows[+b.dataset.go]; MM.setDest(r.x, r.z, r.n.replace(/^\S+\s/, '')); renderBig() });
  ov.querySelectorAll('[data-taxi]').forEach(b => b.onclick = () => { const r = MM._rows[+b.dataset.taxi]; AV.transit.fromMap(r.x, r.z, r.n.replace(/^\S+\s/, '')) }) }
function labels() { const s = set(); ov.querySelector('[data-mm="rot"]').textContent = s.rot ? tr('Minimap: rotates', 'Minimapa: gira') : tr('Minimap: north up', 'Minimapa: norte arriba'); ov.querySelector('[data-mm="on"]').textContent = s.on ? tr('Hide minimap', 'Ocultar minimapa') : tr('Show minimap', 'Mostrar minimapa') }
const zoomAt = (f, px, py) => { const [wx, wz] = s2w(px, py); V.sc = Math.max(.08, Math.min(8, V.sc * f)); const [nx, nz] = s2w(px, py); V.cx += wx - nx; V.cz += wz - nz; renderBig() };
MM.zoomFull = f => zoomAt(f, big.clientWidth / 2, big.clientHeight / 2); MM._view = V;
MM.atlas = function () {
  if (!AV.W || MM.atlasOpen()) return; if (!MM.base || MM.base.W !== AV.W) startBuild(AV.W); MM._buildNow(); const B = MM.base;
  ov.style.display = 'block'; AV.pushModal('atlas', () => MM.closeAtlas()); try { document.exitPointerLock() } catch (e) { }
  const w = innerWidth - Math.min(300, innerWidth * .42), h = innerHeight, bw = B.b.x1 - B.b.x0, bh = B.b.z1 - B.b.z0; V.sc = Math.min(w / bw, h / bh) * .92; V.cx = AV.P.x; V.cz = AV.P.z; if (V.sc < .6) V.sc = Math.min(1.2, V.sc * 2.2);
  labels(); side(); renderBig();
};
MM.closeAtlas = () => { if (!MM.atlasOpen()) return; ov.style.display = 'none'; AV.popModal('atlas') };
let drag = null; big.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, cx: V.cx, cz: V.cz, moved: 0 }; big.setPointerCapture(e.pointerId) });
big.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.moved = Math.max(drag.moved, Math.hypot(dx, dy)); V.cx = drag.cx - dx / V.sc; V.cz = drag.cz - dy / V.sc; renderBig() });
big.addEventListener('pointerup', e => { const d = drag; drag = null; if (!d || d.moved > 6) return; const r = big.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top; let best = null, bd = 16;
  for (const m of MM._big || []) { const [x, y] = w2s(m.x, m.z), dd = Math.hypot(x - px, y - py); if (dd < bd) { bd = dd; best = m } }
  if (best) MM.setDest(best.x, best.z, best.name); else { const [wx, wz] = s2w(px, py); if (AV.W.surface(wx, wz) !== null) MM.setDest(wx, wz) } renderBig() });
big.addEventListener('wheel', e => { e.preventDefault(); const r = big.getBoundingClientRect(); zoomAt(e.deltaY < 0 ? 1.18 : 1 / 1.18, e.clientX - r.left, e.clientY - r.top) }, { passive: false });
ov.querySelectorAll('[data-mm]').forEach(b => b.onclick = () => { const k = b.dataset.mm, s = set(); if (k === 'zin') MM.zoomFull(1.4); if (k === 'zout') MM.zoomFull(1 / 1.4); if (k === 'me') { V.cx = AV.P.x; V.cz = AV.P.z; renderBig() } if (k === 'clear') { MM.clearDest(); renderBig() }
  if (k === 'rot') { s.rot = !s.rot; AV.save() } if (k === 'on') { s.on = !s.on; AV.save() } if (k === 'close') MM.closeAtlas(); labels() });
AV.frameFns.push(() => { if (MM.atlasOpen()) renderBig() });
AV.keymap.KeyJ = () => MM.atlas();
AV.keymap.KeyL = () => { const s = set(); s.rot = !s.rot; AV.save(); AV.toast(s.rot ? tr('Minimap rotates with you', 'El minimapa gira contigo') : tr('Minimap: north up', 'Minimapa: norte arriba')) };
AV.keymap.Equal = AV.keymap.NumpadAdd = () => { const s = set(); s.zoom = Math.min(3, (s.zoom || 1) * 1.25) };
AV.keymap.Minus = AV.keymap.NumpadSubtract = () => { const s = set(); s.zoom = Math.max(.4, (s.zoom || 1) / 1.25) };
/* while the full map is open: J closes it, + / - zoom it (the core skips keymaps while a modal is open) */
addEventListener('keydown', e => { if (!MM.atlasOpen()) return; if (e.code === 'KeyJ') { e.stopImmediatePropagation(); MM.closeAtlas() } else if (e.code === 'Equal' || e.code === 'NumpadAdd') { e.stopImmediatePropagation(); MM.zoomFull(1.3) } else if (e.code === 'Minus' || e.code === 'NumpadSubtract') { e.stopImmediatePropagation(); MM.zoomFull(1 / 1.3) } }, true);
})(window.AV);
