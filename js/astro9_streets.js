/* APEVERSE - astro9_streets.js : Cinematic V1 "Living Megacity" - the connected Astro-9 street network (docs/ASTRO9_CITY_PLAN.md).
   12 new streets close loops around the old spine (plaza - Neon Boulevard - Art Avenue - Temple / Hangar paths):
     S1 Kepler Street (road, curved) Food Ring/Neon junction -> Temple path      S2 Ring Lane (lane) Art Avenue -> Kepler -> Biotech
     S3 Coil Street (lane, S-curve) Neon -> Ring Lane                             S4 Terrace Steps: ramps up to a raised court (y 3) Kepler <-> Coil
     S5 Undergrid Row (alley) Ring Lane -> Temple path, sunken covered passage (y -3) with two underground venues
     S6 Gutter Lane + Fuse Court (alley + courtyard) Undergrid Row <-> Kepler      S7 Greenway (lane) Biotech garden -> Temple
     S8 Sporeline Passage (alley) Neon -> Biotech garden                          S9 Souk Lane + Lantern Lane (alleys) Bazaar -> boulevard
     S10 Terrace Street (lane) Alien Homes -> Cinema Passage -> Art Avenue        S11 Hangar Road (road) West street -> Hangar path
     S12 Skylift: a passage off Neon + a 30 m switchback ramp tower + a bridge onto the Sky Market (y 30), with a lift.
   This file owns the walkable surface (ramps, raised and sunken parts), reserve() so the older modules keep towers/decor off the
   streets, the ground meshes (asphalt / pavers / cobbles / tiles, world-UV, merged per material), kerbs, lane paint, zebra crossings,
   drains, manholes, lamps, overhead cables, street-name signs, and the map's street names + districts. Buildings, shops and people
   along the streets: js/astro9_blocks.js. */
'use strict';
(function (AV) {
const tr = AV.tr, TAU = Math.PI * 2, L = (e, s) => [e, s];
const SN = AV.astro9streets = {};
/* ---------- the network (x east, z south; w = full width) ---------- */
const ST = [
  { id: 'kepler', n: L('Kepler Street', 'Calle Kepler'), t: 'road', w: 12, hood: 'kepler', p: [[88, 104], [90, 130], [96, 160], [104, 184], [108, 201]] },
  { id: 'ringarch', n: L('Ring Lane', 'Callejón del Anillo'), t: 'alley', w: 5, hood: 'undergrid', p: [[7, 168], [14.5, 168]] },
  { id: 'ring', n: L('Ring Lane', 'Callejón del Anillo'), t: 'lane', w: 8, hood: 'undergrid', p: [[14, 168], [50, 172], [88, 168], [120, 166], [142, 162], [153, 158]] },
  { id: 'coil', n: L('Coil Street', 'Calle Espiral'), t: 'lane', w: 7, hood: 'terraces', p: [[156, 105.5], [156, 120], [146, 134], [138, 148], [142, 162]] },
  { id: 'stepsw', n: L('Terrace Steps', 'Escalinata de las Terrazas'), t: 'pass', w: 4, hood: 'terraces', p: [[96.5, 140], [110.5, 140]], ramp: [0, 3] },
  { id: 'stepse', n: L('Terrace Steps', 'Escalinata de las Terrazas'), t: 'pass', w: 4, hood: 'terraces', p: [[127.5, 140], [140, 140]], ramp: [3, 0] },
  { id: 'undergrid', n: L('Undergrid Row', 'Fila Subrejilla'), t: 'alley', w: 5, hood: 'undergrid', p: [[60, 169], [60, 193], [64, 198]] },
  { id: 'gutter', n: L('Gutter Lane', 'Callejón del Desagüe'), t: 'alley', w: 3.6, hood: 'undergrid', p: [[61, 195], [76, 191], [90, 188], [99.5, 186]] },
  { id: 'fusepass', n: L('Fuse Court', 'Patio Fusible'), t: 'alley', w: 3.6, hood: 'undergrid', p: [[83, 169], [83, 175]] },
  { id: 'greenway', n: L('Greenway', 'Vía Verde'), t: 'lane', w: 6, hood: 'biotech', p: [[190, 177], [178, 186], [164, 192]] },
  { id: 'spore', n: L('Sporeline Passage', 'Pasaje de las Esporas'), t: 'alley', w: 4, hood: 'biotech', p: [[207, 105.5], [206, 118], [199, 129]] },
  { id: 'souk', n: L('Souk Lane', 'Callejón del Zoco'), t: 'alley', w: 3.6, hood: 'souk', p: [[-75, 72], [-75, 60], [-40, 56], [-5, 54]] },
  { id: 'lantern', n: L('Lantern Lane', 'Callejón de los Farolillos'), t: 'alley', w: 3.6, hood: 'souk', p: [[-39, 72], [-39, 56]] },
  { id: 'terrace', n: L('Terrace Street', 'Calle de las Terrazas'), t: 'lane', w: 8, hood: 'west', p: [[-152, 158], [-122, 165], [-80, 170], [-40, 175]] },
  { id: 'cinpass', n: L('Cinema Passage', 'Pasaje del Cine'), t: 'alley', w: 4.2, hood: 'west', p: [[-41, 175.5], [-6, 176.5]] },
  { id: 'hangar', n: L('Hangar Road', 'Carretera del Hangar'), t: 'road', w: 10, hood: 'industrial', p: [[-120, 105.5], [-127, 140], [-126, 170], [-122, 198]] },
  { id: 'skylift', n: L('Skylift Passage', 'Pasaje del Ascensor Celeste'), t: 'alley', w: 6, hood: 'sky', p: [[182, 85], [182, 66]] }
];
/* special walkable pieces (height y) */
const COURT = { x0: 110, x1: 128, z0: 132, z1: 148, y: 3 };
const UNDER = [{ id: 'robot', x0: 46, x1: 57.5, z0: 180, z1: 188, y: -3 }, { id: 'club', x0: 62.5, x1: 74, z0: 179, z1: 189, y: -3 }];
const FUSE = { x0: 76, x1: 90, z0: 174, z1: 188.8 };
const SKY = { strips: [180, 183.4, 186.8, 190.2, 193.6], z0: 42, z1: 66, rise: 7.5, bridge: { x0: 193.6, x1: 212, z0: 60.5, z1: 64.5, y: 30 } };
Object.assign(SN, { ST, COURT, UNDER, FUSE, SKY });
const segs = []; ST.forEach(s => { for (let i = 0; i < s.p.length - 1; i++) { const [ax, az] = s.p[i], [bx, bz] = s.p[i + 1], dx = bx - ax, dz = bz - az, len = Math.hypot(dx, dz), hw = s.w / 2;
  segs.push({ s, i, ax, az, bx, bz, len, ux: dx / len, uz: dz / len, hw, bb: [Math.min(ax, bx) - hw - 20, Math.max(ax, bx) + hw + 20, Math.min(az, bz) - hw - 20, Math.max(az, bz) + hw + 20] }) } });
SN.segs = segs;
const inR = (x, z, r, p) => x >= r.x0 - (p || 0) && x <= r.x1 + (p || 0) && z >= r.z0 - (p || 0) && z <= r.z1 + (p || 0);
const proj = (g, x, z) => { const t = Math.max(0, Math.min(g.len, (x - g.ax) * g.ux + (z - g.az) * g.uz)); return [t, Math.hypot(x - (g.ax + g.ux * t), z - (g.az + g.uz * t))] };
/* height along a street (ramps + the sunken Undergrid passage) */
const hOn = (g, x, z, t) => { if (g.s.ramp) return g.s.ramp[0] + (g.s.ramp[1] - g.s.ramp[0]) * t / g.len;
  if (g.s.id === 'undergrid' && g.i === 0) return z < 175 ? 0 : z < 180 ? -(z - 175) * .6 : z < 188 ? -3 : z < 193 ? -(193 - z) * .6 : 0; return 0 };
SN.hOn = hOn;
const skyH = (x, z) => { const S = SKY; if (z < S.z0 || z > S.z1 || x < S.strips[0] || x > S.strips[4]) return null; let i = 0; while (i < 3 && x >= S.strips[i + 1]) i++;
  const u = i % 2 ? z - S.z0 : S.z1 - z; return i * S.rise + S.rise * Math.max(0, Math.min(1, (u - 3) / 18)) };
SN.rooms = [];   /* enterable rooms registered by astro9_blocks.js: { x0, x1, z0, z1, y } */
SN.surface = (x, z) => {
  if (x > 40 && x < 135 && z > 128 && z < 195) { if (inR(x, z, COURT)) return COURT.y; for (const u of UNDER) if (inR(x, z, u)) return u.y; if (inR(x, z, FUSE)) return 0 }
  if (x >= 179 && x <= 212.5 && z >= 41.5 && z <= 67) { if (inR(x, z, SKY.bridge)) return SKY.bridge.y; const h = skyH(x, z); if (h !== null) return h }
  for (const r of SN.rooms) if (inR(x, z, r)) return r.y;
  let best = null; for (const g of segs) { if (x < g.bb[0] || x > g.bb[1] || z < g.bb[2] || z > g.bb[3]) continue; const [t, d] = proj(g, x, z); if (d <= g.hw) { const h = hOn(g, x, z, t); if (best === null || g.s.ramp || (g.s.id === 'undergrid' && g.i === 0)) best = h } }
  return best };
SN.reserve = (x, z, p) => { for (const g of segs) { if (x < g.bb[0] - p || x > g.bb[1] + p || z < g.bb[2] - p || z > g.bb[3] + p) continue; if (proj(g, x, z)[1] <= g.hw + p) return true }
  return inR(x, z, COURT, p) || inR(x, z, FUSE, p) || UNDER.some(u => inR(x, z, u, p)) || (x > 176 - p && x < 213 + p && z > 40 - p && z < 67 + p) || SN.rooms.some(r => inR(x, z, r, p)) || !!(SN.blockReserve && SN.blockReserve(x, z, p)) };
SN.gap = (sx, z) => sx > 0 ? z > 164 && z < 172 : z > 173.6 && z < 179.4;   /* Art Avenue railings open onto Ring Lane / Cinema Passage */
SN.neonGaps = { n: [[178, 186]], s: [[150, 162], [202, 212]] };   /* Neon Boulevard building rows open onto Skylift, Coil and Sporeline */
SN.soukGaps = [-75, -39];
/* hook into the Astro-9 surface chain (district 2 is asked first by astro9_metro) */
if (AV.astro9m2) { const base = AV.astro9m2.surface; AV.astro9m2.surface = (x, z) => { const a = base(x, z); return a !== null ? a : SN.surface(x, z) } }
SN.districts = [{ id: 'kepler', name: 'Kepler Street', x: 80, z: 140 }, { id: 'undergrid', name: 'The Undergrid', x: 70, z: 184 }, { id: 'terraces', name: 'Residential Terraces', x: 136, z: 128 },
  { id: 'bioq', name: 'Biotech Quarter', x: 205, z: 178 }, { id: 'souk', name: 'Bazaar lanes', x: -55, z: 56 }, { id: 'west', name: 'West Terraces', x: -92, z: 160 }, { id: 'industrial', name: 'Hangar Road', x: -138, z: 135 },
  { id: 'sky', name: 'Sky District · Skylift', x: 192, z: 36 }, { id: 'arcology', name: 'Kepler Arcology', x: 126, z: 186 }];
const prevE = AV.onWorldEnter; AV.onWorldEnter = function (W) { if (prevE) prevE(W); if (W && W.id === 'astro9') { W.mapDistricts = (W.mapDistricts || []).filter(d => !SN.districts.some(e => e.id === d.id)).concat(SN.districts);
  const seen = {}; W.mapStreets = []; for (const g of segs) { if (g.len < 8) continue; const k = g.s.n[0]; if (seen[k] && seen[k].len >= g.len) continue; seen[k] = { len: g.len, x: (g.ax + g.bx) / 2, z: (g.az + g.bz) / 2, a: Math.atan2(g.uz, g.ux), name: k } } W.mapStreets = Object.values(seen) } };

/* ---------- textures (world-UV, repeating) ---------- */
const TX = {}, rnd = s => { let x = s; return () => (x = (x * 16807) % 2147483647) / 2147483647 };
const cvt = (k, size, f) => { if (TX[k]) return TX[k]; const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d'); g.scale(size / 512, size / 512); f(g, rnd(k.length * 977 + 13)); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return TX[k] = t };
const speck = (c, R, n, a) => { for (let i = 0; i < n; i++) { c.fillStyle = 'rgba(' + (R() < .5 ? '0,0,0,' : '255,255,255,') + (a * R()) + ')'; const s = 1 + R() * 3; c.fillRect(R() * 512, R() * 512, s, s) } };
const TEX = {
  asphalt: (c, R) => { c.fillStyle = '#26262e'; c.fillRect(0, 0, 512, 512); speck(c, R, 9000, .22); for (let k = 0; k < 5; k++) { c.fillStyle = 'rgba(' + (R() < .5 ? '20,20,26,.8' : '48,46,56,.7') + ')'; c.fillRect(R() * 420, R() * 420, 40 + R() * 120, 30 + R() * 90) }
    for (let k = 0; k < 6; k++) { const g = c.createRadialGradient(0, 0, 0, 0, 0, 40); g.addColorStop(0, 'rgba(10,10,20,.6)'); g.addColorStop(1, 'rgba(10,10,20,0)'); c.save(); c.translate(R() * 512, R() * 512); c.scale(1, .6); c.fillStyle = g; c.fillRect(-40, -40, 80, 80); c.restore() }
    c.strokeStyle = 'rgba(8,8,12,.85)'; c.lineWidth = 1.5; for (let k = 0; k < 7; k++) { c.beginPath(); let x = R() * 512, y = R() * 512; c.moveTo(x, y); for (let s = 0; s < 8; s++) { x += (R() - .5) * 40; y += (R() - .5) * 40; c.lineTo(x, y) } c.stroke() } },
  pavers: (c, R) => { c.fillStyle = '#4a4656'; c.fillRect(0, 0, 512, 512); const s = 32; for (let y = 0, r = 0; y < 512; y += s * .87, r++) for (let x = (r % 2) * s / 2 - s; x < 540; x += s) { const v = 100 + R() * 40 | 0; c.fillStyle = 'rgb(' + v + ',' + (v - 6) + ',' + (v + 14) + ')'; c.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + Math.PI / 6; c.lineTo(x + Math.cos(a) * s * .52, y + Math.sin(a) * s * .52) } c.fill() } speck(c, R, 5000, .18);
    for (let k = 0; k < 8; k++) { c.fillStyle = 'rgba(30,20,30,.25)'; c.beginPath(); c.arc(R() * 512, R() * 512, 6 + R() * 18, 0, TAU); c.fill() } },
  cobble: (c, R) => { c.fillStyle = '#1c1a20'; c.fillRect(0, 0, 512, 512); for (let y = 0; y < 512; y += 22) for (let x = (y / 22 % 2) * 14; x < 520; x += 28) { const v = 50 + R() * 30 | 0; c.fillStyle = 'rgb(' + v + ',' + (v - 4) + ',' + (v + 2) + ')'; c.beginPath(); c.ellipse(x + R() * 3, y + 11, 12 + R() * 2, 9, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.07)'; c.beginPath(); c.ellipse(x - 3, y + 7, 6, 3, -.3, 0, TAU); c.fill() } speck(c, R, 4000, .25);
    for (let k = 0; k < 5; k++) { const g = c.createRadialGradient(0, 0, 0, 0, 0, 60); g.addColorStop(0, 'rgba(40,60,110,.35)'); g.addColorStop(1, 'rgba(40,60,110,0)'); c.save(); c.translate(R() * 512, R() * 512); c.scale(1.4, .7); c.fillStyle = g; c.fillRect(-60, -60, 120, 120); c.restore() } },
  tile: (c, R) => { for (let y = 0; y < 512; y += 64) for (let x = 0; x < 512; x += 64) { c.fillStyle = ((x + y) / 64) % 2 ? '#7a5a4e' : '#9a8c78'; c.fillRect(x, y, 64, 64); c.fillStyle = '#34505a'; c.beginPath(); c.moveTo(x + 32, y + 8); c.lineTo(x + 56, y + 32); c.lineTo(x + 32, y + 56); c.lineTo(x + 8, y + 32); c.fill(); c.strokeStyle = 'rgba(40,30,20,.5)'; c.lineWidth = 2; c.strokeRect(x, y, 64, 64) } speck(c, R, 3000, .15) },
  grate: (c, R) => { c.fillStyle = '#3a3e4a'; c.fillRect(0, 0, 512, 512); c.strokeStyle = '#1a1c24'; c.lineWidth = 5; for (let k = 0; k < 512; k += 16) { c.beginPath(); c.moveTo(k, 0); c.lineTo(k, 512); c.stroke() } c.strokeStyle = '#5a5e6a'; c.lineWidth = 3; for (let k = 0; k < 512; k += 64) { c.beginPath(); c.moveTo(0, k); c.lineTo(512, k); c.stroke() } speck(c, R, 2000, .2) }
};
const tex = (k, q) => cvt(k, q === 0 ? 256 : 512, TEX[k]);
/* street-name sign atlas (4 x 8 cells of 256 x 64): enamel plates with an alien-glyph line */
const GLY = '⟟⏃⎍⟒⋏⊑⍜⏁⎎⟟⌇⍀⋔⏚⍙';
const glyphs = (R, n) => { let s = ''; for (let i = 0; i < n; i++) s += GLY[(R() * GLY.length) | 0]; return s };
const NAMES = [...new Set(ST.map(s => s.n[0]))];
const signTex = () => TX.sign || (TX.sign = (() => { const c = document.createElement('canvas'); c.width = 1024; c.height = 512; const g = c.getContext('2d'), R = rnd(31);
  NAMES.forEach((n, i) => { const X = (i % 4) * 256, Y = (i / 4 | 0) * 64, col = ['#1a3a8a', '#7a1a3a', '#1a5a3a', '#3a1a6a'][i % 4]; g.fillStyle = col; g.fillRect(X + 2, Y + 2, 252, 60); g.strokeStyle = '#f4ead0'; g.lineWidth = 3; g.strokeRect(X + 6, Y + 6, 244, 52);
    g.fillStyle = '#f4ead0'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '700 22px "Segoe UI",Arial,sans-serif'; g.fillText(n.toUpperCase(), X + 128, Y + 26, 230); g.font = '13px "Segoe UI Symbol",sans-serif'; g.fillStyle = '#ffd84a'; g.fillText(glyphs(R, 12), X + 128, Y + 47, 220) });
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t })());
const signCell = n => { const i = NAMES.indexOf(n), g = new THREE.PlaneGeometry(1.6, .4), uv = g.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setXY(k, ((i % 4) + uv.getX(k)) / 4, 1 - ((i / 4 | 0) + 1 - uv.getY(k)) / 8); return g };

SN.build = function (ctx) {
  const K = AV.kit, q = ctx.q, grp = ctx.group, M = K.M, BG = K.BG, r = rnd(8181);
  const buf = {}; const B = k => buf[k] || (buf[k] = { p: [], u: [], s: { asphalt: 6, pavers: 4, cobble: 3, tile: 3, grate: 2 }[k] || 4 });
  const tri = (k, a, b, c) => { const o = B(k); for (const v of [a, b, c]) { o.p.push(v[0], v[1], v[2]); o.u.push(v[0] / o.s, v[2] / o.s) } };
  const quad = (k, a, b, c, d) => { tri(k, a, b, c); tri(k, a, c, d) };
  const solid = [], glow = [], paint = [], metal = [], signs = [];
  const circ = (x, z, rr) => ctx.circles.push([x, z, rr]), col = (x0, x1, z0, z1) => ctx.cols.push([x0, x1, z0, z1]);
  /* ---------- ground ribbons ---------- */
  const ribbon = (k, g, hw, yo) => { const n = g.s.ramp || g.s.id === 'undergrid' ? Math.max(1, Math.ceil(g.len / 1)) : 1, nx = -g.uz, nz = g.ux;
    for (let i = 0; i < n; i++) { const t0 = g.len * i / n, t1 = g.len * (i + 1) / n, P = t => { const x = g.ax + g.ux * t, z = g.az + g.uz * t; return [x, z, hOn(g, x, z, t) + yo] };
      const [x0, z0, y0] = P(t0), [x1, z1, y1] = P(t1); quad(k, [x0 - nx * hw, y0, z0 - nz * hw], [x1 - nx * hw, y1, z1 - nz * hw], [x1 + nx * hw, y1, z1 + nz * hw], [x0 + nx * hw, y0, z0 + nz * hw]) } };
  const disc = (k, x, z, rr, y) => { const n = 16; for (let i = 0; i < n; i++) { const a0 = i / n * TAU, a1 = (i + 1) / n * TAU; tri(k, [x, y, z], [x + Math.cos(a0) * rr, y, z + Math.sin(a0) * rr], [x + Math.cos(a1) * rr, y, z + Math.sin(a1) * rr]) } };
  const LAYER = { road: [['pavers', 0, .028], ['asphalt', 3, .034]], lane: [['pavers', 0, .028], ['asphalt', 1.6, .034]], alley: [['cobble', 0, .03]], pass: [['tile', 0, .03]] };
  ST.forEach(s => { if (s.id === 'skylift') { segs.filter(g => g.s === s).forEach(g => ribbon('grate', g, g.hw, .03)); return }
    const L2 = LAYER[s.t]; segs.filter(g => g.s === s).forEach((g, i, arr) => { for (const [k, inset, y] of L2) { if (s.hw - inset <= 0) continue; ribbon(k, g, g.hw - inset, y); if (i > 0 && !s.ramp) disc(k, g.ax, g.az, g.hw - inset, y + .001) } }) });
  /* Fuse Court (cobbles + a tiled centre), the raised Terrace court, the Skylift strips + bridge */
  { const F = FUSE; quad('cobble', [F.x0, .03, F.z0], [F.x1, .03, F.z0], [F.x1, .03, F.z1], [F.x0, .03, F.z1]); quad('tile', [80, .036, 178], [86, .036, 178], [86, .036, 184], [80, .036, 184]);
    const C = COURT; quad('tile', [C.x0, C.y + .03, C.z0], [C.x1, C.y + .03, C.z0], [C.x1, C.y + .03, C.z1], [C.x0, C.y + .03, C.z1]); solid.push([BG.box, 0x6a6470, M((C.x0 + C.x1) / 2, C.y / 2 - .05, (C.z0 + C.z1) / 2, C.x1 - C.x0, C.y, C.z1 - C.z0)]);
    for (let i = 0; i < 4; i++) { const x0 = SKY.strips[i], x1 = SKY.strips[i + 1]; for (let z = SKY.z0; z < SKY.z1; z += 1) { const ya = skyH((x0 + x1) / 2, z), yb = skyH((x0 + x1) / 2, z + 1); quad('grate', [x0, ya + .04, z], [x1, ya + .04, z], [x1, yb + .04, z + 1], [x0, yb + .04, z + 1]) } }
    const Bd = SKY.bridge; quad('grate', [Bd.x0, Bd.y + .04, Bd.z0], [Bd.x1, Bd.y + .04, Bd.z0], [Bd.x1, Bd.y + .04, Bd.z1], [Bd.x0, Bd.y + .04, Bd.z1]) }
  /* ramps of the Terrace Steps: solid wedges under them + handrails */
  for (const g of segs.filter(g => g.s.ramp)) { const n = 8; for (let i = 0; i < n; i++) { const t = (i + .5) / n * g.len, x = g.ax + g.ux * t, z = g.az + g.uz * t, h = hOn(g, x, z, t); solid.push([BG.box, 0x7a7480, M(x, h / 2 - .05, z, g.len / n + .02, Math.max(.1, h), g.s.w)]) }
    for (const sd of [-1, 1]) for (let i = 0; i <= 6; i++) { const t = i / 6 * g.len, x = g.ax + g.ux * t, z = g.az + g.uz * t + sd * (g.hw - .1), h = hOn(g, x, z, t); metal.push([BG.cyl, 0x8a8a94, M(x, h + .5, z, .04, 1, .04)]) } }
  /* ---------- Undergrid sunken passage: trench walls, covered roof, stairs glow ---------- */
  { const wallZ = [175, 193]; for (const [x, doors] of [[57.35, [182.5, 185.5]], [62.65, [182.5, 185.5]]]) { for (const [z0, z1] of [[wallZ[0], doors[0]], [doors[1], wallZ[1]]]) solid.push([BG.box, 0x3a3640, M(x, -1.5, (z0 + z1) / 2, .3, 3.2, z1 - z0)]); solid.push([BG.box, 0x3a3640, M(x, -.25, 184, .3, .7, 3)]) }
    for (const [x0, x1] of [[57.2, 57.5], [62.5, 62.8]]) { col(x0, x1, 175, 182.5); col(x0, x1, 185.5, 193) }
    for (const [x0, x1, z0, z1] of [[30, 140, 104, 175], [30, 46, 175, 196], [74, 140, 175, 196], [46, 74, 193, 196], [140, 262, 106, 196], [-98, 0, 40, 70], [-150, -34, 106, 196], [176, 200, 40, 68]]) solid.push([BG.box, 0x16141c, M((x0 + x1) / 2, -.07, (z0 + z1) / 2, x1 - x0, .04, z1 - z0)]);   /* ground under the new blocks (the trench stays open) */
    solid.push([BG.box, 0x2a2830, M(60, .25, 184, 28.6, .5, 10.4)]); /* the street above becomes a roof over the passage (buildings sit on it) */
    for (let z = 181; z <= 187; z += 2) glow.push([BG.box, 0xffb84a, M(60, -.05, z, 3, .06, .12)]);
    for (const z of [176, 192]) glow.push([BG.box, 0xff4ad2, M(60, 2.6, z, 5.2, .1, .1)]) }
  /* ---------- Skylift structure: separators with railings, columns, lift shaft, bridge railings, sign ---------- */
  { const S = SKY; [[1, [S.z0 + 3, S.z1]], [2, [S.z0, S.z1 - 3]], [3, [S.z0 + 3, S.z1]]].forEach(([i, [z0, z1]]) => { const x = S.strips[i]; col(x - .06, x + .06, z0, z1); for (let z = z0; z < z1; z += 1) { const y = Math.max(skyH(x - .1, z + .5), skyH(x + .1, z + .5)); glow.push([BG.box, 0x4ad8ff, M(x, y + 1.05, z + .5, .06, .06, 1)]); metal.push([BG.box, 0x8a90a0, M(x, y + .5, z + .5, .03, 1, .03)]) } });
    col(183.4, 193.7, 65.9, 66.15); col(179.9, 180.05, S.z0, S.z1); col(193.55, 193.7, S.z0, 60.5); col(S.bridge.x0, S.bridge.x1, 60.35, 60.5); col(S.bridge.x0, S.bridge.x1, 64.5, 64.65);
    for (const x of [180, 186.8, 193.6]) for (const z of [S.z0, 54, S.z1]) metal.push([BG.box, 0x5a5e6a, M(x, 15, z, .5, 30, .5)]);
    for (let y = 7.5; y <= 30; y += 7.5) metal.push([BG.box, 0x4a4e5a, M(186.8, y - .3, S.z0 - .3, 14.2, .25, .25)], [BG.box, 0x4a4e5a, M(186.8, y - .3, S.z1 + .3, 14.2, .25, .25)]);
    for (const z of [60.5, 64.5]) { glow.push([BG.box, 0x4ad8ff, M((S.bridge.x0 + S.bridge.x1) / 2, 31.05, z, S.bridge.x1 - S.bridge.x0, .06, .06)]); metal.push([BG.box, 0x5a5e6a, M((S.bridge.x0 + S.bridge.x1) / 2, 29.7, z, S.bridge.x1 - S.bridge.x0, .5, .2)]) }
    metal.push([BG.box, 0x3a3e4a, M(177.6, 15.4, 64, 2.6, 30.8, 2.6)]); glow.push([BG.box, 0xc88aff, M(178.95, 15.4, 64, .05, 30.8, 2)]);   /* glass lift shaft */
    ctx.sign && ctx.sign('SKYLIFT ▲ SKY MARKET', 182, 7.2, 84.6, 0, 6, '#4ad8ff', {}) }
  /* ---------- lane paint, kerbs, crossings, drains, manholes, lamps, cables, name signs ---------- */
  for (const g of segs) { const s = g.s, nx = -g.uz, nz = g.ux, ang = Math.atan2(g.ux, g.uz);
    if (s.t === 'road' || s.t === 'lane') { const aw = s.w / 2 - (s.t === 'road' ? 3 : 1.6);
      for (let t = 2; t < g.len - 2; t += 5) paint.push([BG.box, 0xe8e0c8, M(g.ax + g.ux * t, .04, g.az + g.uz * t, .14, .01, 2.4, 0, ang, 0)]);   /* dashed centre line */
      for (const sd of [-1, 1]) { solid.push([BG.box, 0x8a8494, M(g.ax + g.ux * g.len / 2 + nx * sd * aw, .07, g.az + g.uz * g.len / 2 + nz * sd * aw, .22, .1, g.len, 0, ang, 0)]);   /* kerb */
        for (let t = 6; t < g.len - 3; t += 11) metal.push([BG.box, 0x16161c, M(g.ax + g.ux * t + nx * sd * (aw - .25), .045, g.az + g.uz * t + nz * sd * (aw - .25), .35, .02, .8, 0, ang, 0)]) }   /* kerb drains */
      for (let t = 9; t < g.len - 4; t += 23) metal.push([BG.cyl, 0x3a3a40, M(g.ax + g.ux * t + nx * aw * .45, .042, g.az + g.uz * t + nz * aw * .45, .38, .015, .38)]);   /* manholes */
      for (let t = 4, k = g.i; t < g.len - 2; t += 17, k++) { const sd = k % 2 ? 1 : -1, x = g.ax + g.ux * t + nx * sd * (s.w / 2 - .35), z = g.az + g.uz * t + nz * sd * (s.w / 2 - .35); if (SN.surface(x, z) === null) continue;
        metal.push([BG.cyl, 0x2a2a34, M(x, 2.7, z, .08, 5.4, .08)], [BG.box, 0x2a2a34, M(x - nx * sd * .6, 5.35, z - nz * sd * .6, 1.3, .08, .08, 0, ang + Math.PI / 2, 0)]); glow.push([BG.box, s.hood === 'undergrid' ? 0xffb86a : 0xd8f0ff, M(x - nx * sd * 1.1, 5.25, z - nz * sd * 1.1, .5, .06, .22, 0, ang, 0)]); circ(x, z, .16) } }
    else if (s.t === 'alley') { for (let t = 3; t < g.len - 1; t += 4) metal.push([BG.box, 0x101014, M(g.ax + g.ux * t, hOn(g, g.ax + g.ux * t, g.az + g.uz * t, t) + .04, g.az + g.uz * t, .3, .02, .7, 0, ang, 0)]);   /* centre drain grates */
      if (s.id !== 'skylift') for (let t = 2; t < g.len; t += 6) { const y = 6 + r() * 1.5; for (let k = 0; k < 2; k++) { const a = [g.ax + g.ux * t - nx * (g.hw + .4), y, g.az + g.uz * t - nz * (g.hw + .4)], b = [g.ax + g.ux * (t + 2 + k) + nx * (g.hw + .4), y - .6 + k * .3, g.az + g.uz * (t + 2 + k) + nz * (g.hw + .4)]; SN._cables = (SN._cables || []).concat([a, b]) } } }
    /* zebra crossing at each street mouth that meets another street */
    if (g.i === 0 && s.t !== 'pass' && s.id !== 'skylift' && s.id !== 'ringarch') for (let k = 0; k < Math.floor(s.w / 1); k++) { const off = -s.w / 2 + .5 + k, t = Math.min(2.2, g.len / 2); if (k % 2) continue; paint.push([BG.box, 0xf4f0e6, M(g.ax + g.ux * t + nx * off, hOn(g, g.ax, g.az, 0) + .041, g.az + g.uz * t + nz * off, .55, .012, 1.8, 0, ang, 0)]) } }
  /* crossings across Kepler Street where lanes meet it (Ring Lane, Terrace Steps, Gutter Lane) */
  const kep = segs.filter(g => g.s.id === 'kepler'); const across = (x, z) => { let best = null; for (const g of kep) { const [t, d] = proj(g, x, z); if (!best || d < best.d) best = { g, t, d } } const g = best.g, ang = Math.atan2(g.ux, g.uz), nx = -g.uz, nz = g.ux; for (let k = -5; k <= 5; k += 1.2) paint.push([BG.box, 0xf4f0e6, M(g.ax + g.ux * best.t + nx * k, .042, g.az + g.uz * best.t + nz * k, .6, .012, 2.6, 0, ang + Math.PI / 2, 0)]) };
  across(97, 168); across(92, 140); across(103, 186);
  /* street-name signs at both ends */
  for (const s of ST) { if (s.t === 'pass' && s.id === 'stepse') continue; const ends = [[s.p[0], s.p[1]], [s.p[s.p.length - 1], s.p[s.p.length - 2]]];
    for (const [a, b] of ends) { const dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz), ux = dx / l, uz = dz / l, nx = -uz, nz = ux, x = a[0] + ux * 2.4 + nx * (s.w / 2 - .3), z = a[1] + uz * 2.4 + nz * (s.w / 2 - .3); const y0 = SN.surface(x, z); if (y0 === null || segs.some(g => g.s !== s && proj(g, x, z)[1] < g.hw + .6)) continue;
      metal.push([BG.cyl, 0x2a2a34, M(x, y0 + 1.5, z, .05, 3, .05)]); const ry = Math.atan2(ux, uz) + Math.PI / 2; signs.push([signCell(s.n[0]), 0xffffff, M(x, y0 + 2.75, z, 1, 1, 1, 0, ry, 0)], [signCell(s.n[0]), 0xffffff, M(x, y0 + 2.75, z, 1, 1, 1, 0, ry + Math.PI, 0)]); circ(x, z, .12) } }
  /* ---------- merge ---------- */
  for (const k in buf) { const o = buf[k], g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(o.p, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(o.u, 2)); g.computeVertexNormals();
    const m = new THREE.MeshStandardMaterial({ map: tex(k, q), roughness: k === 'asphalt' ? .82 : k === 'cobble' ? .45 : .7, metalness: k === 'grate' ? .6 : k === 'cobble' ? .15 : 0, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1 }); m.userData.lin = 1;
    const me = new THREE.Mesh(g, m); me.receiveShadow = true; me.name = 'streets_' + k; grp.add(me) }
  const vm = o => { const m = new THREE.MeshStandardMaterial(Object.assign({ vertexColors: true }, o)); m.userData.lin = 1; return m };
  if (solid.length) grp.add(new THREE.Mesh(K.merge(solid), vm({ roughness: .8 })));
  if (metal.length) grp.add(new THREE.Mesh(K.merge(metal), vm({ roughness: .45, metalness: .6 })));
  if (paint.length) grp.add(new THREE.Mesh(K.merge(paint), vm({ roughness: .6, polygonOffset: true, polygonOffsetFactor: -3 })));
  if (glow.length) { const gm = new THREE.MeshBasicMaterial({ vertexColors: true }); gm.userData.lin = 1; grp.add(new THREE.Mesh(K.merge(glow), gm)) }
  if (signs.length) { const m = new THREE.MeshStandardMaterial({ map: signTex(), roughness: .5, emissive: 0xffffff, emissiveMap: signTex(), emissiveIntensity: .35 }); m.userData.lin = 1; grp.add(new THREE.Mesh(K.merge(signs), m)) }
  if (SN._cables && SN._cables.length) { const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(SN._cables.flat(), 3)); grp.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0x0a0a10 }))); SN._cables = null }
  /* ---------- the lift + viewpoint ---------- */
  ctx.T.push({ x: 182, z: 68.5, r: 2.2, label: () => tr('🛗 Skylift: ride up to the Sky Market (or walk the ramps)', '🛗 Ascensor celeste: subir al Sky Market (o sube por las rampas)'), fn: () => { const P = AV.P; AV.fadeTo(1, 300); setTimeout(() => { P.x = 200; P.z = 62.5; P.y = 30; P.vx = P.vz = P.vy = 0; P.yaw = -Math.PI / 2; AV.fadeTo(0, 500) }, 320) } });
  ctx.T.push({ x: 196, z: 62.5, r: 2.2, label: () => tr('🛗 Skylift: down to Neon Boulevard', '🛗 Ascensor celeste: bajar a Neon Boulevard'), fn: () => { const P = AV.P; AV.fadeTo(1, 300); setTimeout(() => { P.x = 182; P.z = 72; P.y = 0; P.vx = P.vz = P.vy = 0; P.yaw = 0; AV.fadeTo(0, 500) }, 320) } });
  ctx.T.push({ x: 206, z: 62.5, r: 2.4, label: () => tr('🔭 Skybridge viewpoint', '🔭 Mirador del puente celeste'), fn: () => { AV.vitals && AV.vitals.add(0, 3); AV.toast(tr('Thirty metres up. Kepler Street curves away south like a lit fuse; somewhere under it, the Undergrid hums.', 'Treinta metros arriba. La calle Kepler se curva hacia el sur como una mecha encendida; debajo, la Subrejilla zumba.')) } });
  SN.fx = { streets: ST.length, segments: segs.length, signs: signs.length / 2 };
  return { places: [{ id: 'st_kepler', name: L('Kepler Street', 'Calle Kepler'), x: 90, z: 128, yaw: Math.PI }, { id: 'st_undergrid', name: L('The Undergrid', 'La Subrejilla'), x: 60, z: 171, yaw: Math.PI }, { id: 'st_court', name: L('Terrace court (raised)', 'Patio de las Terrazas (elevado)'), x: 119, z: 140, yaw: 0 },
    { id: 'st_hangar', name: L('Hangar Road', 'Carretera del Hangar'), x: -124, z: 120, yaw: Math.PI }, { id: 'st_skylift', name: L('Skylift', 'Ascensor celeste'), x: 182, z: 74, yaw: 0 }, { id: 'st_souk', name: L('Souk Lane', 'Callejón del Zoco'), x: -60, z: 58, yaw: -Math.PI / 2 }, { id: 'st_terrace', name: L('Terrace Street', 'Calle de las Terrazas'), x: -100, z: 168, yaw: -Math.PI / 2 }] };
};
})(window.AV);
