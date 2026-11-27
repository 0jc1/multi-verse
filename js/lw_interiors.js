/* APEVERSE 2.3 - lw_interiors.js : walk-in business interiors (owner: "40% accessible means physically enterable interiors, not menus at
   entrances").  For each business that has no enterable interior yet, a real building is raised on a free lot near it (off roads, flat,
   empty), facing its street, with the business's own painted fascia; inside, a themed interior for its kind, and the service counter.
   Themes: café (espresso bar, pastry case, tables), bar (long bar, stools, bottle wall, neon), restaurant (laid tables, kitchen pass),
   food hall (stalls, produce crates), bakery / dessert (display cases), shop / souvenirs (wall shelves, gondola, racks), records (LP crates,
   posters), gallery (white cube, framed works incl. a Bamb), hostel lobby (reception, key rack, sofa), pharmacy (green cross, shelves),
   coffeeshop / dispensary (jars, green neon; only where the world's fictional rules allow - otherwise a coffee bar).
   Each building = one merged vertex-coloured mesh + glass + fascia + products (instanced) ~ 4 draw calls; hidden beyond 70 m.
   Coverage (AV.LW.bizCoverage().pctEnter): a business counts as ENTERABLE only when its service point is physically enclosed (walls or
   blocked ground on at least 3 of 4 sides within 7 m) - the 2.3 interiors, 7-ELEVAPE stores, and every older walk-in shop all qualify,
   entrance counters do not.  Target LW.CFG.enterTarget (.45) of named businesses per city. */
'use strict';
(function (AV) {
const tr = AV.tr, LW = AV.LW, say = LW.say, K = AV.kit;
LW.CFG.enterTarget = .45;
const IN = LW.interiors = { list: [], stats: { built: 0, noLot: 0 } };
const segD = (px, pz, r) => { const dx = r[2] - r[0], dz = r[3] - r[1], l2 = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((px - r[0]) * dx + (pz - r[1]) * dz) / l2)); return Math.hypot(px - r[0] - dx * t, pz - r[1] - dz * t) };
/* ---------- enclosure test (shared with the coverage measure) ---------- */
/* 0.1 m steps (walls are 0.2 m thick: a coarser step jumps over them); collision boxes pre-filtered to the 8 m around the point */
LW.enclosed = function (W, x, z) { const near = W.cols.filter(c => c[1] > x - 8 && c[0] < x + 8 && c[3] > z - 8 && c[2] < z + 8), blocked = (px, pz) => W.surface(px, pz) === null || near.some(c => px >= c[0] && px <= c[1] && pz >= c[2] && pz <= c[3]);
  let n = 0; for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { for (let t = .5; t <= 7; t += .1) if (blocked(x + dx * t, z + dz * t)) { n++; break } } return n >= 3 };
/* ---------- palettes + fascia ---------- */
const THEME = { cafe: ['#3a2416', '#f0d8a0', '☕'], bar: ['#1a1a2a', '#ff4ad2', '🍸'], restaurant: ['#5a1a1a', '#f4ead0', '🍽'], food: ['#e86a1a', '#ffffff', '🥢'], bakery: ['#f4e4c8', '#7a3a10', '🥐'], dessert: ['#ffd0e0', '#c8306a', '🍨'],
  shop: ['#1d5fa8', '#ffffff', '🛍'], records: ['#111111', '#ffd23a', '💿'], gallery: ['#f6f4ee', '#1a1a1a', '🖼'], hostel: ['#2a6a5a', '#ffffff', '🛏'], pharmacy: ['#ffffff', '#1a8a4a', '✚'], canna: ['#0f3a1a', '#7aff6a', '🌿'] };
const TX = {};
function fascia(name, kind) { const k = kind + '|' + name; if (TX[k]) return TX[k]; const [bg, fg, ic] = THEME[kind] || THEME.shop, c = document.createElement('canvas'); c.width = 1024; c.height = 160; const g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, 1024, 160); g.strokeStyle = fg; g.globalAlpha = .5; g.lineWidth = 6; g.strokeRect(10, 10, 1004, 140); g.globalAlpha = 1; g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
  const font = { cafe: 'italic bold', bar: 'bold', restaurant: 'bold', bakery: 'italic', dessert: 'italic bold', gallery: '', records: 'bold', canna: 'bold' }[kind] || 'bold'; let fs = 78; const fam = kind === 'gallery' ? 'Helvetica, Arial' : kind === 'bar' || kind === 'records' ? 'Impact, Arial Black' : 'Georgia, serif';
  do { g.font = font + ' ' + fs + 'px ' + fam; fs -= 4 } while (g.measureText(name).width > 820 && fs > 26); g.fillText(name, 540, 84); g.font = '64px serif'; g.fillText(ic, 80, 84);
  if (kind === 'bar' || kind === 'canna') { g.shadowColor = fg; g.shadowBlur = 18; g.fillText(name.slice(0, 0), 0, 0) }
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; t.userData = { keep: true }; return TX[k] = t }
function artTex(i) { const k = 'art' + i; if (TX[k]) return TX[k]; const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'), r = AV.rng(i * 77 + 3);
  if (i % 4 === 0) { g.fillStyle = '#1a1a2a'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#7aff6a'; g.beginPath(); g.ellipse(128, 110, 52, 64, 0, 0, 7); g.fill(); g.fillStyle = '#000'; g.beginPath(); g.ellipse(106, 104, 16, 24, -.3, 0, 7); g.ellipse(150, 104, 16, 24, .3, 0, 7); g.fill();
    g.strokeStyle = '#f0f0f0'; g.lineWidth = 7; g.beginPath(); g.moveTo(128, 150); g.lineTo(190, 160); g.stroke(); g.fillStyle = '#ff6a2a'; g.fillRect(186, 154, 10, 12); g.fillStyle = 'rgba(220,220,220,.5)'; for (let s = 0; s < 6; s++) { g.beginPath(); g.arc(196 + s * 6, 140 - s * 14, 6 + s * 2, 0, 7); g.fill() }
    g.fillStyle = '#ff4ad2'; g.font = 'bold 28px Impact, Arial'; g.fillText('BAMB', 20, 240) }   /* Bamb: the smoking alien */
  else for (let s = 0; s < 14; s++) { g.fillStyle = 'hsl(' + Math.floor(r() * 360) + ',70%,' + (35 + r() * 35) + '%)'; if (i % 2) g.fillRect(r() * 256, r() * 256, 30 + r() * 120, 30 + r() * 120); else { g.beginPath(); g.arc(r() * 256, r() * 256, 10 + r() * 70, 0, 7); g.fill() } }
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.userData = { keep: true }; return TX[k] = t }
/* ---------- lot (shared with lw_stores) ---------- */
function lot(W, ax, az, w, d) { return lotT(W, ax, az, w, d, .3, 55) || lotT(W, ax, az, w, d, .8, 85) }   /* hilly cities (Oaxaca): a second, more tolerant pass */
function lotT(W, ax, az, w, d, slope, maxR) { const R = (x, z) => W.surface(x, z), roads = W.mapRoads || []; const onRoad = (x, z) => roads.some(r => segD(x, z, r) < (r[4] || 6) / 2 + .8);
  for (let r = 6; r <= maxR; r += 3) for (let k = 0; k < 18; k++) { const a = k / 18 * Math.PI * 2 + r * .13, cx = ax + Math.cos(a) * r, cz = az + Math.sin(a) * r, ry = Math.round(Math.atan2(ax - cx, az - cz) / (Math.PI / 2)) * (Math.PI / 2), sw = Math.abs(Math.sin(ry)) > .5, wx = sw ? d : w, wz = sw ? w : d, y0 = R(cx, cz); if (y0 === null) continue; let ok = true;
    for (let i = -1; i <= 1 && ok; i += .25) for (let j = -1; j <= 1 && ok; j += .25) { const x = cx + i * (wx / 2 + 1), z = cz + j * (wz / 2 + 1), y = R(x, z); if (y === null || Math.abs(y - y0) > slope || !AV.isFree(W, x, z, .45) || onRoad(x, z)) ok = false }
    if (!ok) continue; const fx = cx + Math.sin(ry) * (d / 2 + 1.8), fz = cz + Math.cos(ry) * (d / 2 + 1.8); if (R(fx, fz) === null || W.T.some(t => Math.hypot(t.x - cx, t.z - cz) < Math.max(wx, wz) / 2 + 1.2) || IN.list.some(b => b.W === W && Math.hypot(b.x - cx, b.z - cz) < Math.max(wx, wz) + 2)) continue;
    return { x: cx, z: cz, y: y0, ry } } return null }
/* ---------- build ---------- */
IN.build = function (W, b) { const kind = b.kind, w = kind === 'restaurant' || kind === 'bar' || kind === 'gallery' ? 10 : 8, d = kind === 'restaurant' || kind === 'gallery' ? 8 : 7, h = 3.4, L0 = lot(W, b.x, b.z, w, d); if (!L0) { IN.stats.noLot++; return null }
  const o = Object.assign({ w, d, h }, L0), g = new THREE.Group(); g.position.set(o.x, o.y, o.z); g.rotation.y = o.ry; W.ctx.group.add(g); const parts = [], M = K.M, B = K.BG.box, P = (col, x, y, z, sx, sy, sz, glow) => parts.push([B, col, M(x, y, z, sx, sy, sz), glow || 0]);
  const cs = Math.cos(o.ry), sn = Math.sin(o.ry), wp = (u, v) => [o.x + u * cs + v * sn, o.z - u * sn + v * cs], col = (x, z, sx, sz) => { const pts = [[x - sx / 2, z - sz / 2], [x + sx / 2, z - sz / 2], [x - sx / 2, z + sz / 2], [x + sx / 2, z + sz / 2]].map(([u, v]) => wp(u, v)); W.cols.push([Math.min(...pts.map(p => p[0])), Math.max(...pts.map(p => p[0])), Math.min(...pts.map(p => p[1])), Math.max(...pts.map(p => p[1]))]) };
  const [bgc] = THEME[kind] || THEME.shop, wallC = { gallery: 0xf8f6f2, bar: 0x2a2230, canna: 0x1a2a1e, records: 0x2a2a30, cafe: 0xe8dcc8, bakery: 0xf4ead8, restaurant: 0xe8d8c0 }[kind] || 0xece6dc, floorC = { bar: 0x3a2a22, gallery: 0xd8d4cc, cafe: 0x8a5a3a, restaurant: 0x7a4a2a, records: 0x2a2a2a }[kind] || 0xcfc8bc;
  P(floorC, 0, .04, 0, w, .08, d); P(wallC, 0, h / 2, -d / 2, w, h, .2); col(0, -d / 2, w, .2); P(wallC, -w / 2, h / 2, 0, .2, h, d); col(-w / 2, 0, .2, d); P(wallC, w / 2, h / 2, 0, .2, h, d); col(w / 2, 0, .2, d); P(0xdedad4, 0, h + .1, 0, w + .4, .2, d + .4);
  const door = 1.8, side = (w - door) / 2; for (const s of [-1, 1]) { col(s * (door / 2 + side / 2), d / 2, side, .1); P(0x9aa0a8, s * (w / 2 - .05), 1.5, d / 2, .1, 3, .12); P(0x9aa0a8, s * door / 2, 1.5, d / 2, .08, 3, .12) } P(0x9aa0a8, 0, 2.95, d / 2, w, .1, .14);
  P(0xfff4d8, 0, h - .05, 0, w * .5, .04, d * .4, 1);   /* glowing ceiling panel (no extra light) */
  const prods = [], prod = (x, y, z, sx, sy, sz) => prods.push([x, y, z, sx, sy, sz]); let counter = [w / 2 - 1.6, -d / 2 + 1.8];
  const chair = (x, z) => { P(0x5a3a2a, x, .45, z, .42, .06, .42); P(0x5a3a2a, x, .7, z - .19, .42, .5, .05); for (const [a, c2] of [[-.17, -.17], [.17, -.17], [-.17, .17], [.17, .17]]) P(0x3a2a1a, x + a, .22, z + c2, .04, .44, .04) };
  const table = (x, z, r) => { P(0x6a4a32, x, .74, z, r || .8, .05, r || .8); P(0x3a2a1a, x, .37, z, .08, .72, .08); col(x, z, (r || .8) * .8, (r || .8) * .8) };
  if (kind === 'cafe' || kind === 'bakery' || kind === 'dessert') { P(0x5a3a2a, w / 2 - 1.6, .55, -d / 2 + 1.6, 2.6, 1.1, .7); col(w / 2 - 1.6, -d / 2 + 1.6, 2.6, .7); P(0xc8c8d0, w / 2 - .9, 1.35, -d / 2 + 1.6, .6, .5, .45); P(0xe8f4ff, w / 2 - 2.2, 1.25, -d / 2 + 1.6, 1.2, .35, .6, .4); for (let i = 0; i < 10; i++) prod(w / 2 - 2.7 + i * .12, 1.15, -d / 2 + 1.6, .1, .08, .1); counter = [w / 2 - 1.6, -d / 2 + 2.5];
    for (const [x, z] of [[-w / 2 + 1.4, -.4], [-w / 2 + 1.4, 1.6], [-.3, 1.4]]) { table(x, z, .75); chair(x - .7, z); chair(x + .7, z) } P(0x1a1a1a, -w / 2 + .15, 2, -d / 4, .05, 1.2, 1.8) }
  else if (kind === 'bar' || kind === 'canna') { P(0x3a2216, 0, .55, -d / 2 + 1.7, w - 2, 1.1, .7); col(0, -d / 2 + 1.7, w - 2, .7); P(0x5a3a2a, 0, 1.12, -d / 2 + 1.7, w - 1.9, .06, .78); for (let i = 0; i < 5; i++) { P(0x2a2a2a, -w / 2 + 2 + i * 1.4, .4, -d / 2 + 2.6, .12, .8, .12); P(0xc8303a, -w / 2 + 2 + i * 1.4, .82, -d / 2 + 2.6, .4, .08, .4) }
    P(0x2a1a12, 0, 1.6, -d / 2 + .3, w - 1.5, 2.2, .35); for (let r = 0; r < 3; r++) for (let i = 0; i < 18; i++) prod(-w / 2 + 1.2 + i * .42, 1 + r * .6, -d / 2 + .5, .1, .32, .1); P(kind === 'canna' ? 0x7aff6a : 0xff4ad2, 0, 2.9, -d / 2 + .12, w * .5, .08, .04, 1); counter = [0, -d / 2 + 2.6]; table(-w / 2 + 1.5, 1.4, .7); table(w / 2 - 1.5, 1.4, .7) }
  else if (kind === 'restaurant' || kind === 'food') { P(0xd8d4cc, 0, .55, -d / 2 + 1.2, w - 3, 1.1, .6); col(0, -d / 2 + 1.2, w - 3, .6); P(0xa8a8b0, 0, 1.6, -d / 2 + .3, w - 3, 1.4, .3); for (let i = 0; i < 6; i++) prod(-1.5 + i * .6, 1.17, -d / 2 + 1.2, .3, .05, .3); counter = [0, -d / 2 + 2.1];
    for (const [x, z] of [[-w / 2 + 1.6, .6], [-w / 2 + 1.6, 2.4], [w / 2 - 1.6, .6], [w / 2 - 1.6, 2.4]]) { table(x, z, .9); chair(x, z - .75); chair(x, z + .75); P(0xffffff, x, .78, z, .5, .01, .5) } if (kind === 'food') for (let i = 0; i < 8; i++) prod(-w / 2 + .5, .3 + (i % 2) * .35, -d / 2 + 1 + i * .45, .5, .3, .4) }
  else if (kind === 'gallery') { for (let i = 0; i < 6; i++) { const wall = i < 2 ? 'b' : i < 4 ? 'l' : 'r', k = i % 2, mm = new THREE.Mesh(AV.G.pln, new THREE.MeshBasicMaterial({ map: artTex(i + Math.floor(o.x)) })); mm.material.userData.lin = 1; mm.scale.set(1.5, 1.5, 1);
      if (wall === 'b') mm.position.set(-1.5 + k * 3, 1.7, -d / 2 + .12); else if (wall === 'l') { mm.position.set(-w / 2 + .12, 1.7, -1.5 + k * 3); mm.rotation.y = Math.PI / 2 } else { mm.position.set(w / 2 - .12, 1.7, -1.5 + k * 3); mm.rotation.y = -Math.PI / 2 } g.add(mm) }
    P(0x2a2a2a, 0, .25, .5, 2.4, .5, .6); col(0, .5, 2.4, .6); P(0xf0ece4, w / 2 - 1.4, .55, d / 2 - 1.6, 1.4, 1.1, .6); col(w / 2 - 1.4, d / 2 - 1.6, 1.4, .6); counter = [w / 2 - 1.4, d / 2 - 2.3] }
  else if (kind === 'hostel') { P(0xc89a5a, -w / 2 + 2, .55, -d / 2 + 1.5, 2.8, 1.1, .7); col(-w / 2 + 2, -d / 2 + 1.5, 2.8, .7); P(0x5a3a2a, -w / 2 + 2, 2, -d / 2 + .15, 2, .9, .1); for (let i = 0; i < 12; i++) prod(-w / 2 + 1.2 + (i % 6) * .3, 1.7 + Math.floor(i / 6) * .35, -d / 2 + .22, .06, .12, .03);
    P(0x3a5a8a, w / 2 - 1.8, .4, 1, 2.2, .5, .9); P(0x3a5a8a, w / 2 - 1.8, .75, 1.4, 2.2, .5, .2); col(w / 2 - 1.8, 1, 2.2, .9); counter = [-w / 2 + 2, -d / 2 + 2.4] }
  else { const shelfC = kind === 'pharmacy' ? 0xf4f4f4 : kind === 'records' ? 0x3a2a1a : 0xb89a6a; for (const s of [-1, 1]) { P(shelfC, s * (w / 2 - .4), 1.1, -.3, .6, 2.2, d - 2.6); col(s * (w / 2 - .4), -.3, .6, d - 2.6); for (let r = 0; r < 4; r++) for (let i = 0; i < 9; i++) prod(s * (w / 2 - .75), .35 + r * .5, -d / 2 + 1.6 + i * .5, .12, .3, .32) }
    if (kind === 'records') for (let i = 0; i < 3; i++) { P(0x5a3a2a, -1.2 + i * 1.2, .45, .4, .9, .9, .6); col(-1.2 + i * 1.2, .4, .9, .6); for (let j = 0; j < 8; j++) prod(-1.5 + i * 1.2 + j * .08, .95, .4, .02, .3, .3) } else { P(shelfC, 0, .7, .2, 1.2, 1.4, 2.2); col(0, .2, 1.2, 2.2); for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) for (const s of [-1, 1]) prod(s * .5, .3 + r * .45, -.7 + i * .38, .1, .28, .3) }
    P(0xf0ece4, w / 2 - 1.6, .55, d / 2 - 1.8, 1.6, 1.1, .6); col(w / 2 - 1.6, d / 2 - 1.8, 1.6, .6); counter = [w / 2 - 1.6, d / 2 - 2.5]; if (kind === 'pharmacy') P(0x1a8a4a, 0, 2.6, -d / 2 + .12, .9, .9, .04, 1) }
  const mesh = new THREE.Mesh(K.merge(parts), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .75 })); mesh.material.userData.lin = 1; mesh.receiveShadow = true; g.add(mesh);
  const glass = new THREE.Mesh(AV.G.box, new THREE.MeshStandardMaterial({ color: 0xbfe8ff, transparent: true, opacity: .25, roughness: .05 })); glass.position.set(0, 1.45, d / 2); glass.scale.set(w - .2, 2.9, .05); g.add(glass);
  const door2 = new THREE.Mesh(AV.G.box, new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0 })); door2.visible = false;
  const fm = new THREE.MeshStandardMaterial({ map: fascia(b.name, kind), emissive: 0xffffff, emissiveMap: fascia(b.name, kind), emissiveIntensity: .45, roughness: .5 }); fm.userData.lin = 1; const fa = new THREE.Mesh(AV.G.box, fm); fa.position.set(0, h - .2, d / 2 + .3); fa.scale.set(w, .7, .12); g.add(fa);   /* in front of the roof overhang, fully visible */
  if (prods.length) { const cols2 = [0xe1251b, 0x00905a, 0xf47b20, 0x2a6ad8, 0xffd400, 0xffffff, 0x8a3ad8, 0x3ac8c8, 0x6a3a1a], im = new THREE.InstancedMesh(AV.G.box, new THREE.MeshStandardMaterial({ roughness: .6 }), prods.length), mx = new THREE.Matrix4(), cl = new THREE.Color();
    prods.forEach(([x, y, z, sx, sy, sz], i) => { mx.makeScale(sx, sy, sz); mx.setPosition(x, y, z); im.setMatrixAt(i, mx); im.setColorAt(i, cl.setHex(cols2[(i * 7 + (o.x | 0)) % cols2.length])) }); im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; g.add(im) }
  /* service inside, place on the map, retire the entrance counter of the same business */
  const cw = wp(counter[0], counter[1]), front = wp(0, d / 2 + 1.5), v = { name: b.name, kind };
  W.T.push({ x: cw[0], z: cw[1], r: 1.9, label: () => (THEME[kind] || THEME.shop)[2] + ' ' + b.name + ': ' + ({ gallery: tr('ticket + exhibition', 'entrada + exposición'), hostel: tr('reception', 'recepción'), shop: tr('browse + buy', 'mirar + comprar'), records: tr('browse + buy', 'mirar + comprar'), pharmacy: tr('counter', 'mostrador') }[kind] || tr('order at the counter', 'pedir en la barra')), fn: () => LW.venueCounter(v), lwVenue: v, lwInside: true });
  for (const t of W.T) if (t.lwVenue && !t.lwInside && t.lwVenue.name === b.name) t.show = () => false;
  (W.places = W.places || []).push({ id: 'lw_in_' + IN.list.length, name: [b.name, b.name], x: front[0], z: front[1] });
  const rec = { W, g, x: o.x, z: o.z, name: b.name, kind, front, counter: cw }; IN.list.push(rec); IN.stats.built++; return rec };
/* ---------- distance culling ---------- */
let ck = 0; AV.frameFns.push(() => { const now = AV.now(); if (now - ck < .5) return; ck = now; const P = AV.P; for (const r of IN.list) if (r.W === AV.W) r.g.visible = Math.hypot(r.x - P.x, r.z - P.z) < 70 });
/* ---------- fill each city to the enterable target ---------- */
LW.interiorStats = {};
{ const pe = AV.onWorldEnter; AV.onWorldEnter = function (W) { if (pe) pe(W); IN.list = IN.list.filter(r => r.W === W); if (!W || !W.ctx) return; setTimeout(() => { if (AV.W !== W) return; try { fillIn(W) } catch (e) { console.warn('interiors', e) } }, 1600) } }
function fillIn(W) { const r = LW.bizCoverage(); if (!r || !r.total) return; const need = Math.ceil(r.total * LW.CFG.enterTarget) - r.enterable; const before = r.pctEnter; let built = 0;
  const todo = r.list.filter(b => !b.enter && b.kind !== 'hostel').sort((a, b2) => (a.src === 'counter') - (b2.src === 'counter'));
  const seen = {}; todo.sort((a, b2) => (seen[a.kind] = (seen[a.kind] || 0)) - (seen[b2.kind] = (seen[b2.kind] || 0)));
  for (const b of todo) { if (built >= need + 1) break; if (IN.build(W, b)) built++ }
  const r2 = LW.bizCoverage(); LW.interiorStats[W.id] = { before, after: r2.pctEnter, built, total: r2.total } }
/* coverage: add the enterable measure */
addEventListener('load', () => { const c0 = LW.bizCoverage; if (!c0 || c0.__in) return; LW.bizCoverage = function () { const r = c0.apply(this, arguments); if (!r) return r; const W = AV.W, lbl = t => { try { return typeof t.label === 'function' ? t.label() : String(t.label || '') } catch (e) { return '' } };
    const SERVE = t => !t.npc && (!t.show || t.show()) && (t.lwInside || /buy|order|menu|browse|counter|drink|eat|ticket|bed|reception|rent|try on|shop|taste|serve|tapas|play|book/i.test(lbl(t)));
    for (const b of r.list) b.enter = W.T.some(t => SERVE(t) && Math.hypot(t.x - b.x, t.z - b.z) < 12 && (t.lwInside || LW.enclosed(W, t.x, t.z))) || IN.list.some(x => x.W === W && x.name === b.name);
    for (const b of r.list) if (b.enter) b.ok = true;   /* served inside its own interior = interactive too */
    r.interactive = r.list.filter(b => b.ok).length; r.pct = r.total ? Math.round(r.interactive / r.total * 100) : 100; r.missing = r.list.filter(b => !b.ok);
    r.enterable = r.list.filter(b => b.enter).length; r.pctEnter = r.total ? Math.round(r.enterable / r.total * 100) : 100; return r }; LW.bizCoverage.__in = 1 });
})(window.AV);
