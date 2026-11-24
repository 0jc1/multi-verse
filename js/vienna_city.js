/* APEVERSE - vienna_city.js : Cinematic V1, Vienna milestone 7b - the city fabric.
   The old Vienna had ~25 isolated 23 m blocks on a 30 m grid and large empty asphalt fields between the landmarks. This fills the map
   with a dense, connected city of perimeter blocks, neighbourhood by neighbourhood, around everything that already exists (the Ring,
   the radial roads, the Donaukanal, the Danube, Stephansplatz, the bar street, Karlsplatz, Naschmarkt, Stadtpark, Belvedere, Prater,
   Schönbrunn, the Christmas market, the Memory zone, the portal, Kahlenberg):
     INNERE STADT (inside the Ring: narrow lanes, 5-storey Baroque + Gründerzeit, shops everywhere, Kärntner Straße lane at x = -4)
     LEOPOLDSTADT (between the Ring and the Prater: wider residential streets)     WIEDEN (between the Ring and Karlsplatz)
     NEUBAU · SPITTELBERG (west of the Ring: small blocks, narrow lanes)           MARIAHILFER STRASSE (shopping, taller)
     JOSEFSTADT + ALSERGRUND (north-west, by the canal)                            BRIGITTENAU (north: plain Gemeindebau-style)
     LANDSTRASSE + FAVORITEN (south-east / south)
   Every block: four street-facing buildings (vienna_arch.js façades, varied heights + styles), a granite sidewalk ring with a kerb, a
   single collision box (courtyard closed); some blocks become small squares (trees at the corners, fountain, benches - paths kept free).
   Lamps hang across the streets between blocks, Litfaßsäulen only on wider streets. Detail is streamed per neighbourhood.
   AV.viennaCity.build(env) -> { blocks, cafe, districts } */
'use strict';
(function (AV) {
const VC = AV.viennaCity = {}, TAU = Math.PI * 2;
let SIDE = null;
const sideTex = q => SIDE || (SIDE = (() => { const s = q === 0 ? 256 : 512, c = document.createElement('canvas'); c.width = c.height = s; const g = c.getContext('2d'); g.scale(s / 512, s / 512); let x = 7; const R = () => (x = (x * 16807) % 2147483647) / 2147483647;
  g.fillStyle = '#b8b2a8'; g.fillRect(0, 0, 512, 512); for (let y = 0; y < 512; y += 128) for (let xx = 0; xx < 512; xx += 128) { const v = 170 + R() * 26 | 0; g.fillStyle = 'rgb(' + v + ',' + (v - 4) + ',' + (v - 12) + ')'; g.fillRect(xx + 2, y + 2, 124, 124) }   /* granite slabs (1 m) */
  for (let i = 0; i < 6000; i++) { g.fillStyle = 'rgba(' + (R() < .5 ? '40,40,40,' : '255,255,255,') + (R() * .12) + ')'; g.fillRect(R() * 512, R() * 512, 2, 2) } for (let k = 0; k < 5; k++) { g.fillStyle = 'rgba(30,30,30,.18)'; g.beginPath(); g.arc(R() * 512, R() * 512, 8 + R() * 20, 0, TAU); g.fill() }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t })());
/* neighbourhoods: region test, grid origin + block / street size, heights, style weights [Gründerzeit, Jugendstil, Baroque, Biedermeier], shop density */
const HOODS = (CX, CZ, RING) => [
  { id: 'inner', name: 'Innere Stadt', reg: (x, z) => Math.hypot(x - CX, z - CZ) < RING - 10, bb: [-60, 60, -78, 48], bw: 15, bd: 13, st: 5.5, ox: -1.25, oz: -27.25, h: [16, 21], sw: [.35, .15, .4, .1], shop: .85 },
  { id: 'leopold', name: 'Leopoldstadt', reg: (x, z) => x > 70 && x < 107 && z > -64 && z < 25, bb: [70, 107, -64, 25], bw: 20, bd: 15, st: 7, ox: 71, oz: -64, h: [13, 17], sw: [.45, .15, .05, .35], shop: .35 },
  { id: 'wieden', name: 'Wieden', reg: (x, z) => x > -18 && x < 62 && z > 50 && z < 82, bb: [-18, 62, 50, 82], bw: 17, bd: 12, st: 6, ox: -17, oz: 52, h: [14, 18], sw: [.4, .3, .15, .15], shop: .5 },
  { id: 'neubau', name: 'Neubau · Spittelberg', reg: (x, z) => x > -156 && x < -72 && z > -10 && z < 44, bb: [-156, -72, -10, 44], bw: 14, bd: 12, st: 5, ox: -155, oz: -9, h: [12, 16], sw: [.3, .35, .1, .25], shop: .6 },
  { id: 'mahue', name: 'Mariahilfer Straße', reg: (x, z) => x > -156 && x < -40 && z > 44 && z < 92, bb: [-156, -40, 44, 92], bw: 17, bd: 13, st: 6, ox: -155, oz: 45, h: [15, 20], sw: [.45, .3, .15, .1], shop: .85 },
  { id: 'josef', name: 'Josefstadt', reg: (x, z) => x > -170 && x < -72 && z > -64 && z < -14, bb: [-170, -72, -64, -14], bw: 17, bd: 14, st: 6, ox: -169, oz: -63, h: [14, 18], sw: [.4, .2, .2, .2], shop: .4 },
  { id: 'alser', name: 'Alsergrund', reg: (x, z) => x > -112 && x < -10 && z > -112 && z < -60, bb: [-112, -10, -112, -60], bw: 19, bd: 15, st: 7, ox: -111, oz: -111, h: [15, 19], sw: [.45, .25, .1, .2], shop: .4 },
  { id: 'brig', name: 'Brigittenau', reg: (x, z) => x > -12 && x < 102 && z > -146 && z < -62, bb: [-12, 102, -146, -62], bw: 21, bd: 17, st: 8, ox: -11, oz: -145, h: [14, 19], sw: [.3, .1, .05, .55], shop: .3 },
  { id: 'land', name: 'Landstraße', reg: (x, z) => (x > 58 && x < 122 && z > 72 && z < 92) || (x > 116 && x < 186 && z > 92 && z < 148), bb: [58, 186, 72, 148], bw: 18, bd: 14, st: 6, ox: 59, oz: 73, h: [14, 18], sw: [.4, .25, .1, .25], shop: .45 },
  { id: 'favor', name: 'Favoriten', reg: (x, z) => x > -52 && x < 118 && z > 124 && z < 150, bb: [-52, 118, 124, 150], bw: 18, bd: 11, st: 6, ox: -51, oz: 125, h: [13, 17], sw: [.5, .1, .05, .35], shop: .4 }];
/* each neighbourhood's look: façade palette, roof mix (rest = mansard), Jugendstil ornament share, Gemeindebau inscriptions, trim colour */
const LOOK = {
  leopold: { pal: [0xe0d6c4, 0xd8cdb8, 0xe8dcc0, 0xcfc8bc, 0xe8d4a0, 0xd8c8b0], roofs: { flat: .1 }, orn: .08 },   /* Gründerzeit: sober beige + grey */
  wieden: { pal: [0xf4f0e8, 0xe8e4d8, 0xe0e8d8, 0xf0e6cc, 0xdde4e0], orn: .5, trim: 0xf8f4ec },   /* Jugendstil: white fronts, gilded + green-tiled friezes */
  neubau: { pal: [0xf0d8a8, 0xe8c0a8, 0xd8e0c0, 0xf4e8c8, 0xc8d8d8, 0xe8d0d8], roofs: { gable: .75 }, h: [10, 14] },   /* Spittelberg Biedermeier: low pastel houses, tiled gables */
  mahue: { pal: [0xf2ece0, 0xe0dcd4, 0xe8dcc0, 0xd8d4cc, 0xf0e2c8], roofs: { flat: .3 }, orn: .3 },   /* shopping street: tall, pale, department-store fronts */
  josef: { pal: [0xf0c8b8, 0xf4e0a8, 0xe8d8e8, 0xf2e6c8, 0xd8e8d0, 0xe8c87a], roofs: { gable: .2 }, orn: .1 },   /* pastel Biedermeier + Baroque */
  alser: { pal: [0xe8dcc4, 0xd8d0c0, 0xe0d4b8, 0xc8d0d8, 0xe8e0d0], orn: .15 },   /* Gründerzeit, university quarter */
  brig: { pal: [0xe8c890, 0xd89a7a, 0xe0d8c8, 0xd8b088, 0xc8a080], roofs: { flat: .7 }, insc: .5, trim: 0xd8d0c0 },   /* Gemeindebau: flat-roofed municipal blocks, ochre + salmon */
  land: { pal: [0xe8e4dc, 0xd8d4cc, 0xe0d8c8, 0xc8d0d8, 0xf0e8d8], roofs: { flat: .1 }, orn: .12 },
  favor: { pal: [0xd8b088, 0xe0d0b8, 0xc89a7a, 0xd8d4cc, 0xe8c890], roofs: { flat: .5 }, insc: .4, trim: 0xd0c8b8 } };   /* workers' district: Gemeindebau + plain Gründerzeit */
const h01 = (k, s) => ((Math.sin(k * 12.9898 + s * 78.233) * 43758.5453) % 1 + 1) % 1;
const PAL = [0xf2e6c8, 0xe8d4a0, 0xf0c8b8, 0xe0e8d0, 0xf4f0e8, 0xe8c87a, 0xd8c0a0, 0xc8d8e8, 0xe8d8c8, 0xd8e0c8];

VC.build = function (E) {
  const { ctx, q, win, waterAt, roadD, reserved, canalD, danS, H, RING, CX, CZ } = E, TAU = Math.PI * 2, K = AV.kit, M = K.M, BG = K.BG; let rs = 20251;
  const r = () => (rs = (rs * 16807) % 2147483647) / 2147483647;
  AV.viennaArch._shop = null; AV.viennaArch.stats = null; AV.viennaArch.fx = null; VC.env = E;
  const placed = [], blocks = [], districts = [];
  const preC = ctx.cols.slice(), preS = ctx.circles.slice();   /* only what existed before the city (our own blocks are handled by overlaps) */
  const freeOf = (x, z) => { for (const c of preC) if (x > c[0] - .5 && x < c[1] + .5 && z > c[2] - .5 && z < c[3] + .5) return false; for (const c of preS) if (Math.hypot(x - c[0], z - c[1]) < c[2] + .5) return false; return true };
  const okPt = (x, z) => !waterAt(x, z) && canalD(x, z) > 7 && Math.abs(danS(x, z)) > 22 && roadD(x, z) > 2.6 && !reserved(x, z, 2) && H(x, z) < .25 && freeOf(x, z);
  const overlaps = (a, m) => placed.some(b => a[0] < b[1] + m && a[1] > b[0] - m && a[2] < b[3] + m && a[3] > b[2] - m);
  const ALL = HOODS(CX, CZ, RING), ANCH = { leopold: [88, -25], wieden: [20, 66], neubau: [-110, 14], mahue: [-100, 66], josef: [-125, -40], alser: [-60, -82], brig: [45, -108], land: [128, 100], favor: [10, 138] };
  for (const hd of ALL) { Object.assign(hd, LOOK[hd.id] || {}); const grp = new THREE.Group(), det = new THREE.Group(); grp.name = 'vc_' + hd.id; det.name = 'vc_det_' + hd.id; ctx.group.add(grp); ctx.group.add(det); hd.VA = AV.viennaArch.make(ctx, q, { winter: win, group: grp, detail: det }); hd.grp = grp; hd.det = det; hd.side = []; hd.extra = []; hd.blocks = [] }
  const nearest = (x, z) => { let bh = null, bd = 1e9; for (const hd of ALL) { const p = ANCH[hd.id]; if (!p) continue; const d = Math.hypot(x - p[0], z - p[1]); if (d < bd) { bd = d; bh = hd } } return bh };
  const tryRect = (hd, R0, mg) => { const [x0, x1, z0, z1] = R0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2; if (hd.id === 'inner' ? !hd.reg(cx, cz) : Math.hypot(cx - CX, cz - CZ) < RING + 4) return false; if (overlaps(R0, mg)) return false; for (let x = x0 - 1.6; x <= x1 + 1.61; x += 1.9) for (let z = z0 - 1.6; z <= z1 + 1.61; z += 1.9) if (!okPt(x, z)) return false; return true };
  const lanes = []; let laneK = 0;
  const add = (hd, R0, part) => { if (hd.id === 'neubau' && !part && (laneK++ % 3) === 0 && R0[1] - R0[0] >= 14) { const cx = (R0[0] + R0[1]) / 2; lanes.push({ hd, x: cx, z0: R0[2], z1: R0[3] }); add(hd, [R0[0], cx - 1.3, R0[2], R0[3]], true); add(hd, [cx + 1.3, R0[1], R0[2], R0[3]], true); return } placed.push(R0); const b = { hood: hd, x0: R0[0], x1: R0[1], z0: R0[2], z1: R0[3], cx: (R0[0] + R0[1]) / 2, cz: (R0[2] + R0[3]) / 2, part }; b.square = !part && hd.id !== 'inner' && hd.id !== 'mahue' && ((Math.round(b.cx * 3 + b.cz * 7) % 9 + 9) % 9) === 0; blocks.push(b); hd.blocks.push(b) };
  /* pass I: the historic centre, laid out street by street (Stephansplatz stays the square south of the cathedral):
       KÄRNTNER STRASSE - 9 m pedestrian street from Stephansplatz to the Ring (x -8.5..0.5), continuous street walls both sides
       GRABEN - wide pedestrian street west of the cathedral (z -36..-24) with the Pestsäule; a row of houses facing the spire on the north
       an east block between the square and the bar street; the HOFBURG (Baroque wing, copper dome, portico) facing HELDENPLATZ (statue);
       the STAATSOPER across the Ring at the end of Kärntner Straße (beside the south radial). */
  const INN = ALL[0], rows = [], extraI = INN.extra, lm = [];
  const inRing = (x, z) => Math.hypot(x - CX, z - CZ) <= RING - 8.4;
  const rowB = (x0, x1, z0, z1, face, o) => { const cs = [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]; if (!(o && o.outside) && cs.some(([x, z]) => !inRing(x, z))) return false; if (cs.some(([x, z]) => reserved(x, z, .3) || waterAt(x, z))) return false; const R0 = [x0, x1, z0, z1]; if (overlaps(R0, .2)) return false; placed.push(R0); ctx.cols.push(R0); rows.push({ x0, x1, z0, z1, face, o: o || {} }); return true };
  const KS = 13; [[2.5, 13], [13, 24], [24, 34.5]].forEach(([z0, z1], i) => { rowB(-19.5, -8.5, z0, z1, 'e', { shop: .95, blade: KS + i, h: 19 + i }); rowB(.5, 11.5, z0, z1, 'w', { shop: .95, blade: KS + 3 + i, h: 21 - i }) });   /* Kärntner Straße */
  rowB(-43, -36, -46, -37, 's', { shop: .9, blade: 5, h: 20 }); [[-50, -43], [-43, -36]].forEach(([x0, x1], i) => rowB(x0, x1, -24, -15, 'n', { shop: .9, blade: 6 + i, h: 18 + i }));   /* Graben */
  [[-26, -14], [-14, -2], [-2, 12]].forEach(([x0, x1], i) => rowB(x0, x1, -60, -51, 's', { shop: .8, blade: 8 + i, h: 18 + (i % 2) * 2 }));   /* houses facing the spire */
  rowB(31.5, 47, -38, -24.5, 'w', { shop: .7, blade: 11, h: 19 }); rowB(31.5, 47, -24.5, -11.5, 'w', { shop: .7, blade: 12, h: 21 });   /* east block */
  if (rowB(-42, -22, 3, 14, 's', { style: 2, h: 20, shop: 0, palace: 1 })) {   /* HOFBURG wing */
    const px = -32, pz = 14, top = 20; extraI.push([BG.cyl, 0xe8e0d0, M(px, top + 1.6, pz - 5.5, 3.4, 3.2, 3.4)], [BG.hem, win ? 0xf4f6fa : 0x5ab89a, M(px, top + 3.2, pz - 5.5, 3.6, 4.4, 3.6)], [BG.cyl, 0xe8e0d0, M(px, top + 8, pz - 5.5, .5, 1.2, .5)], [BG.sph, 0xe8c860, M(px, top + 8.9, pz - 5.5, .4, .4, .4)]);
    for (let k = 0; k < 6; k++) extraI.push([BG.cyl, 0xf4f0e8, M(px - 6.25 + k * 2.5, 4, pz + 1.2, .42, 8, .42)]); extraI.push([BG.box, 0xf0e8d8, M(px, 8.4, pz + 1.2, 15, .8, 2.4)], [BG.box, 0xe8e0d0, M(px, 9.3, pz + 1.2, 15.4, 1, 2.6)]); for (let k = 0; k < 6; k++) ctx.circles.push([px - 6.25 + k * 2.5, pz + 1.2, .5]);
    const hx = -29, hz = 22; extraI.push([BG.box, 0xc8c0b0, M(hx, 1.5, hz, 3, 3, 4.5)], [BG.box, 0x4a5a4a, M(hx, 4.1, hz, 1.1, 1.3, 3.2)], [BG.box, 0x4a5a4a, M(hx, 4.9, hz - 1.6, .7, 1.2, .7, -.5, 0, 0)], [BG.sph, 0x4a5a4a, M(hx, 5.2, hz + .2, .45, .7, .45)]); for (const [lx, lz] of [[-.35, -1.2], [.35, -1.2], [-.35, 1.2], [.35, 1.2]]) extraI.push([BG.box, 0x4a5a4a, M(hx + lx, 3.2, hz + lz, .18, 1.3, .18)]); ctx.circles.push([hx, hz, 2.6]);   /* equestrian statue */
    lm.push({ name: 'Hofburg · Heldenplatz', x: -30, z: 24 }) }
  { const gx = -42, gz = -30; extraI.push([BG.cyl, 0xb8b0a0, M(gx, .6, gz, 1.9, 1.2, 1.9)], [BG.cyl, 0xd8d0c0, M(gx, 2.2, gz, 1.1, 2, 1.1)]); for (let k = 0; k < 7; k++) extraI.push([BG.sph, k % 2 ? 0xf4f0e8 : 0xe8e0d0, M(gx + Math.sin(k * 2.1) * .5, 3.6 + k * 1.1, gz + Math.cos(k * 2.1) * .5, 1.1 - k * .1, .8, 1.1 - k * .1)]); extraI.push([BG.cone, 0xe8c860, M(gx, 11.8, gz, .4, 1.6, .4)]); ctx.circles.push([gx, gz, 2.1]); lm.push({ name: 'Graben · Pestsäule', x: gx, z: gz }) }   /* PESTSÄULE */
  if (rowB(8.5, 32, 58, 74, 'n', { style: 0, h: 22, shop: 0, outside: true })) {   /* STAATSOPER: arcaded loggia, copper roof, statues */
    const ox = 20.25, oz = 58; for (let k = 0; k < 7; k++) { extraI.push([BG.box, 0xe0d4b8, M(ox - 9 + k * 3, 3.5, oz - .9, .9, 7, 1.8)]); if (k < 6) extraI.push([new THREE.TorusGeometry(1.05, .22, 6, 16, Math.PI), 0xe0d4b8, M(ox - 7.5 + k * 3, 6.2, oz - .9, 1, 1, 1)]) } extraI.push([BG.box, 0xe8dcc0, M(ox, 7.6, oz - .9, 22, .6, 2.2)]);
    for (let k = 0; k < 5; k++) extraI.push([BG.box, 0x4a5a4a, M(ox - 8 + k * 4, 8.8, oz - 1.2, .5, 1.6, .5)]); extraI.push([BG.box, win ? 0xf4f6fa : 0x5a8a7a, M(ox, 25, oz + 8, 18, 6, 12)]); for (let k = 0; k < 7; k++) ctx.circles.push([ox - 9 + k * 3, oz - .9, .7]);
    lm.push({ name: 'Staatsoper', x: ox, z: oz - 4 }) }
  /* pass 0: the Ringstraße lined on both sides by monumental buildings that follow the curve (16 m frontages, 6 m cross streets) */
  const ringB = []; for (const side of [1, -1]) { const dep = 11, rc = RING + side * (9.5 + dep / 2), len = 16, step = (len + 6) / rc;
    let lastEnd = -1e9; for (let a0 = 0; a0 < TAU; a0 += step / 3) { let hit = null; for (const L of [len, 12]) { const a = a0 + (L / 2) / rc; if ((a - L / 2 / rc) < lastEnd + 6 / rc || a + L / 2 / rc > TAU + (lastEnd < 0 ? 0 : 0) && a > TAU) continue; const ca = Math.cos(a), sa = Math.sin(a), x = CX + ca * rc, z = CZ + sa * rc, ry = Math.atan2(-ca, -sa), cr = Math.cos(ry), sr = Math.sin(ry), W2 = (lx, lz) => [x + lx * cr + lz * sr, z - lx * sr + lz * cr]; let ok = true;
      for (let lx = -L / 2 - 1.2; lx <= L / 2 + 1.21 && ok; lx += 1.9) for (let lz = -dep / 2 - 1.2; lz <= dep / 2 + 1.21; lz += 1.9) { const [px, pz] = W2(lx, lz); if (!okPt(px, pz)) { ok = false; break } } if (ok) { hit = { a, ca, sa, x, z, ry, W2, L }; break } } if (!hit) continue; const { a, x, z, ry, W2, L: len2 } = hit; lastEnd = a + len2 / 2 / rc;   /* slide along the Ring + shorter frontage before giving up */
      const hd = side < 0 ? ALL[0] : nearest(x, z), pts = [W2(-len2 / 2, -dep / 2), W2(len2 / 2, -dep / 2), W2(-len2 / 2, dep / 2), W2(len2 / 2, dep / 2)], xs = pts.map(p => p[0]), zs = pts.map(p => p[1]); if (overlaps([Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)], .5)) { lastEnd = a - len2 / 2 / rc - 6 / rc; continue }
      placed.push([Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)]); for (const lx of len2 > 13 ? [-5.3, 0, 5.3] : [-3.5, 3.5]) { const [px, pz] = W2(lx, 0); ctx.circles.push([px, pz, 5.4]) }
      ringB.push({ hd, x, z, len: len2, dep, ry, out: side > 0 ? 1 : -1, a }) } }
  /* pass 1: the Innere Stadt on its own narrow-lane grid; pass 2: one city-wide grid, each block taking the character of its nearest neighbourhood */
  const passes = [{ hd: ALL[0], bw: 15, bd: 13, st: 5.5, ox: -1.25, oz: -27.25, bb: [-62, 62, -80, 50] }, { hd: null, bw: 18, bd: 14, st: 6.5, ox: -185, oz: -147, bb: [-188, 188, -148, 148] }];
  for (const P of passes) { const px = P.bw + P.st, pz = P.bd + P.st, gx0 = P.ox - Math.ceil((P.ox - P.bb[0]) / px) * px, gz0 = P.oz - Math.ceil((P.oz - P.bb[2]) / pz) * pz;
    for (let bx = gx0; bx + P.bw <= P.bb[1] + .01; bx += px) for (let bz = gz0; bz + P.bd <= P.bb[3] + .01; bz += pz) { if (bx < P.bb[0] - .01 || bz < P.bb[2] - .01) continue; const R0 = [bx, bx + P.bw, bz, bz + P.bd], hd = P.hd || nearest(bx + P.bw / 2, bz + P.bd / 2);
      let done = false; for (const [ox, oz] of [[0, 0], [2, 0], [-2, 0], [0, 2], [0, -2], [3, 3], [-3, -3], [3, -3], [-3, 3]]) { const S0 = [R0[0] + ox, R0[1] + ox, R0[2] + oz, R0[3] + oz]; if (tryRect(hd, S0, P.st - .1)) { add(hd, S0); done = true; break } } if (done) continue;   /* nudge a few metres before giving up */
      const hw = (P.bw - 2) / 2, hdp = (P.bd - 2) / 2; for (const H2 of [[bx, bx + hw, bz, bz + P.bd], [bx + hw + 2, bx + P.bw, bz, bz + P.bd], [bx, bx + P.bw, bz, bz + hdp], [bx, bx + P.bw, bz + hdp + 2, bz + P.bd]]) if (tryRect(hd, H2, 1.5)) add(hd, H2, true) } }   /* then half blocks with a 2 m passage */
  /* the Kaffeehaus block (same rule as 7a: just outside the Ring, south street free) */
  let cafe = null, best = 1e9; for (const b of blocks) { if (b.square || b.part || b.x1 - b.x0 < 17 || b.z1 - b.z0 < 13) continue; const dd = Math.hypot(b.cx - CX, b.cz - CZ), sc = Math.abs(dd - (RING + 24)); if (dd > RING + 10 && dd < RING + 55 && roadD(b.cx, b.z1 + 3) > 1 && !waterAt(b.cx, b.z1 + 4) && sc < best) { best = sc; cafe = b } }
  const styleOf = (hd, k) => { const w = hd.sw; let t = ((Math.sin(k * 12.9898) * 43758.5453) % 1 + 1) % 1; for (let i = 0; i < 4; i++) { if (t < w[i]) return i; t -= w[i] } return 0 };
  const sideSlab = (hd, x0, x1, z0, z1) => { const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (x1 - x0) / 1.9, uv.getY(i) * (z1 - z0) / 1.9); hd.side.push([g, 0xffffff, M((x0 + x1) / 2, .028, (z0 + z1) / 2, 1, 1, 1, -Math.PI / 2, 0, 0)]) };
  for (const R of ringB) { const k = Math.round(R.a * 100); R.hd.VA.bar(R.x, R.z, R.len, R.dep, 20 + (k % 6), R.ry, PAL[k % PAL.length], R.out, { style: k % 3 === 0 ? 0 : 2, shopP: .7, corner: k % 7 === 0 ? 1 : 0 }); R.hd.ring = (R.hd.ring || 0) + 1 }   /* Ringstraße palaces: Baroque + Gründerzeit, 20-25 m */
  rows.forEach((w, i) => { const VA = INN.VA, hx = (w.x0 + w.x1) / 2, hz = (w.z0 + w.z1) / 2, ns = w.face === 'n' || w.face === 's', len = ns ? w.x1 - w.x0 : w.z1 - w.z0, dep = ns ? w.z1 - w.z0 : w.x1 - w.x0, ry = ns ? 0 : Math.PI / 2, out = w.face === 's' || w.face === 'e' ? 1 : -1;
    VA.bar(hx, hz, len, dep, w.o.h || 19, ry, PAL[(i * 3) % PAL.length], out, { style: w.o.style != null ? w.o.style : [2, 0, 1, 2, 0][i % 5], shopP: w.o.shop == null ? .8 : w.o.shop, noShops: w.o.shop === 0 });
    if (w.o.blade != null) { const nx = w.face === 'e' ? 1 : w.face === 'w' ? -1 : 0, nz = w.face === 's' ? 1 : w.face === 'n' ? -1 : 0, fx = nx > 0 ? w.x1 : nx < 0 ? w.x0 : hx, fz = nz > 0 ? w.z1 : nz < 0 ? w.z0 : hz; VA.blade(fx, fz, nx, nz, 4.9, w.o.blade) } });
  sideSlab(INN, -8.5, .5, -2, 45); sideSlab(INN, -50, -36, -36, -24); sideSlab(INN, -35, -21, 14.5, 27);   /* granite paving: Kärntner Straße + Graben pedestrian zones, Heldenplatz */
  const courts = []; let bi = 0;
  for (const b of blocks) { const hd = b.hood, VA = hd.VA, w = b.x1 - b.x0, d0 = b.z1 - b.z0, k = bi++;
    sideSlab(hd, b.x0 - 2.2, b.x1 + 2.2, b.z0 - 2.2, b.z1 + 2.2); for (const [x, z, sx, sz] of [[b.cx, b.z0 - 2.2, w + 4.6, .22], [b.cx, b.z1 + 2.2, w + 4.6, .22], [b.x0 - 2.2, b.cz, .22, d0 + 4.6], [b.x1 + 2.2, b.cz, .22, d0 + 4.6]]) hd.extra.push([BG.box, 0x9a948a, M(x, .07, z, sx, .14, sz)]);   /* granite kerb */
    if (b.square) {   /* a small square: paving, trees at the corners, a fountain, benches facing it */
      sideSlab(hd, b.x0, b.x1, b.z0, b.z1); for (const [x, z] of [[b.x0 + 2, b.z0 + 2], [b.x1 - 2, b.z0 + 2], [b.x0 + 2, b.z1 - 2], [b.x1 - 2, b.z1 - 2]]) { hd.extra.push([BG.cyl, 0x5a4030, M(x, 1.6, z, .2, 3.2, .2)], [BG.sph, 0x3a7a32, M(x, 4.2, z, 1.9, 1.7, 1.9)], [BG.sph, 0x4a8a3a, M(x + .6, 4.9, z - .4, 1.3, 1.2, 1.3)]); ctx.circles.push([x, z, .4]) }
      hd.extra.push([BG.cyl, 0xb8b0a0, M(b.cx, .35, b.cz, 1.8, .7, 1.8)], [BG.cyl, 0x4a8ab8, M(b.cx, .66, b.cz, 1.55, .04, 1.55)], [BG.cyl, 0xb8b0a0, M(b.cx, 1.4, b.cz, .22, 1.6, .22)], [BG.sph, 0xb8b0a0, M(b.cx, 2.3, b.cz, .4, .4, .4)]); ctx.circles.push([b.cx, b.cz, 1.9]);
      for (const s of [-1, 1]) { const bz = b.cz + s * (d0 / 2 - 1.2); hd.extra.push([BG.box, 0x5a3a24, M(b.cx, .45, bz, 2, .08, .45)], [BG.box, 0x2a2a2a, M(b.cx, .22, bz, 1.9, .44, .06)]); ctx.circles.push([b.cx, bz, .5]) } continue }
    const court = b !== cafe && !b.part && w >= 17 && d0 >= 14 && (k % 6) === 2, d = court ? 4.5 : Math.min(7.5, d0 / 2 - .5), thin = !court && d0 - 2 * d < 3, hs = hd.h, hh = () => hs[0] + r() * (hs[1] - hs[0]), col = () => { const P = hd.pal || PAL; return P[(r() * P.length) | 0] };
    const mainN = roadD(b.cx, b.z0 - 4) < 8, mainS = roadD(b.cx, b.z1 + 4) < 8, sp = m => Math.min(.95, hd.shop * (m ? 1.25 : 1));
    const tower = (k % 5) === 0, sN = styleOf(hd, k * 4 + 1), sS = styleOf(hd, k * 4 + 2), sW = styleOf(hd, k * 4 + 3), sE = styleOf(hd, k * 4 + 4);
    const dd = b === cafe ? Math.min(7.5, d0 - 5) : thin ? d0 / 2 : d, ddN = b === cafe && thin ? d0 - dd : dd;   /* the café room is always 7.5 m deep (its furniture plan) */
    const RF = hd.roofs || {}, hr = h01(k, 1), roof = b === cafe ? 'mans' : hr < (RF.flat || 0) ? 'flat' : hr < (RF.flat || 0) + (RF.gable || 0) ? 'gable' : 'mans', gem = roof === 'flat' && h01(k, 3) < (hd.insc || 0) / Math.max(.01, RF.flat || 0);
    VA.set({ roof, trim: hd.trim, orn: roof !== 'gable' && h01(k, 2) < (hd.orn || 0) });   /* the whole block shares one look */
    VA.bar(b.cx, b.z0 + ddN / 2, w, ddN, hh(), 0, col(), -1, { style: sN, shopP: sp(mainN), corner: tower && roof === 'mans' ? 1 : 0, insc: gem ? 1 + (k % 4) : 0 });
    if (b === cafe) { VA.bar(b.cx, b.z1 - dd / 2, w, dd, hh(), 0, col(), 1, { style: sS, noBase: true, noShops: true }); ctx.cols.push([b.x0, b.x1, b.z0, b.z1 - dd]); E.kaffeehaus(b.x0, b.x1, b.z1 - dd, b.z1) }
    else if (court) {   /* DURCHGANG: an arched gateway into a courtyard you can walk into */
      const gw = 1.3, hS = hh(), cS = col(); VA.bar((b.x0 + b.cx - gw) / 2, b.z1 - dd / 2, b.cx - gw - b.x0, dd, hS, 0, cS, 1, { style: sS, shopP: sp(mainS) }); VA.bar((b.cx + gw + b.x1) / 2, b.z1 - dd / 2, b.x1 - b.cx - gw, dd, hS, 0, cS, 1, { style: sS, shopP: sp(mainS) });
      VA.bar(b.cx, b.z1 - dd / 2, gw * 2, dd, hS + .8, 0, cS, 1, { style: sS, y0: -.8, noBase: true, noShops: true });   /* the house over the gateway starts at 3.4 m */ hd.extra.push([new THREE.TorusGeometry(gw, .18, 6, 14, Math.PI), 0xd8d0c0, M(b.cx, 2.2, b.z1 + .05, 1, 1, 1)], [BG.box, 0x2a2420, M(b.cx, 1.2, b.z1 - dd / 2, gw * 2, .04, dd)]);
      ctx.cols.push([b.x0, b.x1, b.z0, b.z0 + d], [b.x0, b.cx - gw, b.z1 - dd, b.z1], [b.cx + gw, b.x1, b.z1 - dd, b.z1], [b.x0, b.x0 + d, b.z0 + d, b.z1 - dd], [b.x1 - d, b.x1, b.z0 + d, b.z1 - dd]);
      const yx0 = b.x0 + d, yx1 = b.x1 - d, yz0 = b.z0 + d, yz1 = b.z1 - dd, ycx = (yx0 + yx1) / 2, ycz = (yz0 + yz1) / 2; sideSlab(hd, b.cx - gw, b.cx + gw, b.z1 - dd, b.z1 + .3); sideSlab(hd, yx0, yx1, yz0, yz1);
      hd.extra.push([BG.cyl, 0x5a4030, M(ycx - 1.4, 1.5, ycz - .4, .2, 3, .2)], [BG.sph, 0x3a7a32, M(ycx - 1.4, 3.9, ycz - .4, 1.8, 1.5, 1.8)], [BG.box, 0x5a3a24, M(ycx + 1.4, .45, ycz, 1.6, .08, .45)], [BG.box, 0x2a2a2a, M(ycx + 1.4, .22, ycz, 1.5, .44, .06)]);
      for (let j = 0; j < 3; j++) hd.extra.push([BG.cyl, 0x2a2a2a, M(yx0 + .6, .45, yz0 + .8 + j * .7, .32, .04, .32, Math.PI / 2, 0, 0)], [BG.box, [0xc8402a, 0x2a6ab8, 0x3a8a3a][j], M(yx0 + .6, .55, yz0 + .8 + j * .7, .05, .05, .9)]);   /* parked bicycles */
      for (let y = .5; y < 6; y += .6) hd.extra.push([BG.sph, 0x2e6a2e, M(yx1 - .15, y, yz0 + 1 + Math.sin(y * 3) * .4, .25, .35, .7)]);   /* ivy */
      ctx.circles.push([ycx - 1.4, ycz - .4, .4], [ycx + 1.4, ycz, .5]); ctx.cols.push([yx0, yx0 + 1.2, yz0 + .4, yz0 + 2.6]);
      courts.push({ x: b.cx, z: b.z1, cx: ycx, cz: ycz, hd }) }
    else { VA.bar(b.cx, b.z1 - dd / 2, w, dd, hh(), 0, col(), 1, { style: sS, shopP: sp(mainS) }); ctx.cols.push([b.x0, b.x1, b.z0, b.z1]) }
    if (!thin) { VA.bar(b.x0 + d / 2, b.cz, d0 - 2 * d, d, hh(), Math.PI / 2, col(), -1, { style: sW, shopP: hd.shop * .6 }); VA.bar(b.x1 - d / 2, b.cz, d0 - 2 * d, d, hh(), Math.PI / 2, col(), 1, { style: sE, shopP: hd.shop * .6 }) } }
  for (const hd of ALL) hd.VA.set({});
  for (const L of lanes) { sideSlab(L.hd, L.x - 1.3, L.x + 1.3, L.z0 - 2.2, L.z1 + 2.2); for (let z = L.z0 + 2; z < L.z1 - 1; z += 4.5) for (const e of [-1, 1]) { L.hd.extra.push([BG.box, 0x1a1a1a, M(L.x + e * 1.15, 3.6, z, .2, .5, .2)]); L.hd.extra.push([BG.box, 0xffe0a0, M(L.x + e * 1.12, 3.45, z, .14, .3, .14)]) } }   /* Gasse: cobbles + wall lanterns */
  const PN = { inner: ['Kärntner Straße', 'Graben', 'Naglergasse'], leopold: ['Praterstraße', 'Taborstraße', 'Große Mohrengasse'], wieden: ['Wiedner Hauptstraße', 'Schleifmühlgasse'], neubau: ['Spittelberggasse', 'Burggasse', 'Siebensterngasse'], mahue: ['Mariahilfer Straße', 'Gumpendorfer Straße'],
    josef: ['Josefstädter Straße', 'Lange Gasse'], alser: ['Alser Straße', 'Porzellangasse'], brig: ['Wallensteinstraße', 'Klosterneuburger Str.'], land: ['Landstraßer Hauptstr.', 'Rasumofskygasse'], favor: ['Favoritenstraße', 'Quellenstraße'] };
  const allNames = [...new Set(Object.values(PN).flat())], pc = document.createElement('canvas'); pc.width = 1024; pc.height = 64 * Math.ceil(allNames.length / 2); { const g = pc.getContext('2d'); allNames.forEach((n, i) => { const X = (i % 2) * 512, Y = (i / 2 | 0) * 64; g.fillStyle = '#1a3a7a'; g.fillRect(X + 2, Y + 2, 508, 60); g.strokeStyle = '#f4f4f4'; g.lineWidth = 3; g.strokeRect(X + 7, Y + 7, 498, 50); g.fillStyle = '#f4f4f4'; g.font = '700 30px Arial,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(n, X + 256, Y + 33, 480) }) }
  const pt = new THREE.CanvasTexture(pc); pt.encoding = THREE.sRGBEncoding; pt.anisotropy = 8; const plaques = [], rowsN = Math.ceil(allNames.length / 2);
  const plaque = (x, y, z, ry, name) => { const i = allNames.indexOf(name), g = new THREE.PlaneGeometry(1.1, .14 * 1.1 * 512 / 512 * 1.1), uv = g.attributes.uv; for (let k2 = 0; k2 < uv.count; k2++) uv.setXY(k2, ((i % 2) + uv.getX(k2)) / 2, 1 - ((i / 2 | 0) + 1 - uv.getY(k2)) / rowsN); plaques.push([g, 0xffffff, M(x, y, z, 1, 1, 1, 0, ry, 0)]) };
  blocks.forEach((b, i) => { if (b.square) return; const names = PN[b.hood.id] || PN.josef, n = names[i % names.length]; plaque(b.x0 + .7, 3.2, b.z1 + .05, 0, n); if (i % 2) plaque(b.x1 + .05, 3.2, b.z0 + .7, Math.PI / 2, names[(i + 1) % names.length]) });   /* Vienna street-name plates on block corners */
  rows.forEach((w, i) => { if (w.face === 'e') plaque(w.x1 + .05, 3.4, w.z0 + .8, Math.PI / 2, 'Kärntner Straße'); else if (w.face === 'w' && i < 6) plaque(w.x0 - .05, 3.4, w.z0 + .8, -Math.PI / 2, 'Kärntner Straße') });
  if (plaques.length) { const m = new THREE.MeshStandardMaterial({ map: pt, roughness: .3, metalness: .2, emissive: 0xffffff, emissiveMap: pt, emissiveIntensity: .12, polygonOffset: true, polygonOffsetFactor: -2 }); m.userData.lin = 1; INN.det.add(new THREE.Mesh(K.merge(plaques), m)) }
  const furn = INN.extra; let racks = 0, bins = 0; blocks.forEach((b, i) => { if (b.square || b.part) return; const hd = b.hood;   /* bike racks + bins at the kerb edge (out of the walking line) */
    if (i % 4 === 1) { const z = b.z1 + 1.9, x = b.cx + 3; for (let j = 0; j < 3; j++) hd.extra.push([new THREE.TorusGeometry(.38, .03, 5, 12, Math.PI), 0x8a8a92, M(x - .8 + j * .8, .02, z, 1, 1, 1, 0, Math.PI / 2, 0)]); ctx.circles.push([x, z, .45]); racks++ }
    if (i % 3 === 0) { const x = b.x1 + 1.9, z = b.z0 + 1.6; hd.extra.push([BG.cyl, 0xc83a2a, M(x, .45, z, .24, .9, .24)], [BG.cyl, 0x2a2a2a, M(x, .92, z, .26, .04, .26)]); ctx.circles.push([x, z, .28]); bins++ } });
  const cars = [], CC = [0xd8d8dc, 0x2a2a30, 0x8a1a1a, 0x1a3a6a, 0x5a6a5a, 0xe8e0c8, 0x6a6a72]; let nCar = 0;   /* parked cars along the radial avenues */
  if (E.RADIALS) E.RADIALS.forEach(([a, b2]) => { const dx = b2[0] - a[0], dz = b2[1] - a[1], Ln = Math.hypot(dx, dz), ux = dx / Ln, uz = dz / Ln, nx = -uz, nz = ux, ry = Math.atan2(ux, uz);
    for (let t = 10; t < Ln - 8; t += 7.5) for (const sd of [-1, 1]) { if (((t / 7.5 | 0) + (sd > 0 ? 1 : 0)) % 3 === 0) continue; const x = a[0] + ux * t + nx * sd * 3.3, z = a[1] + uz * t + nz * sd * 3.3; if (Math.hypot(x - CX, z - CZ) < RING + 10 || waterAt(x, z) || reserved(x, z, 1) || ctx.cols.some(c => x > c[0] - 1.5 && x < c[1] + 1.5 && z > c[2] - 1.5 && z < c[3] + 1.5)) continue;
      const c = CC[nCar++ % CC.length], mk = (lx, y, lz, sx, sy, sz, col) => cars.push([BG.box, col, M(x + ux * lz + nx * lx, y, z + uz * lz + nz * lx, sx, sy, sz, 0, ry, 0)]);
      mk(0, .55, 0, 1.75, .6, 4.1, c); mk(0, 1.1, -.2, 1.55, .55, 2.2, c); mk(0, 1.12, .55, 1.5, .4, .05, 0x2a3446); for (const [wx, wz] of [[-.85, -1.3], [.85, -1.3], [-.85, 1.3], [.85, 1.3]]) cars.push([BG.cyl, 0x1a1a1a, M(x + ux * wz + nx * wx, .32, z + uz * wz + nz * wx, .32, .2, .32, 0, ry, Math.PI / 2)]);
      ctx.circles.push([x + ux * 1.1, z + uz * 1.1, 1], [x - ux * 1.1, z - uz * 1.1, 1]) } });
  if (cars.length) { const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .35, metalness: .5 }); m.userData.lin = 1; ctx.group.add(new THREE.Mesh(K.merge(cars), m)) }
  if (E.stopAngles) for (const a of E.stopAngles) { const ca = Math.cos(a - .045), sa = Math.sin(a - .045), ry = -a + Math.PI / 2; for (let r2 = RING - 4.6; r2 <= RING + 4.6; r2 += .9) INN.extra.push([BG.box, 0xf4f4f0, M(CX + ca * r2, .035, CZ + sa * r2, 2.6, .012, .45, 0, Math.atan2(-ca, -sa), 0)]) }   /* stripes along the traffic, stepping across the road */   /* zebra across the Ring at each tram stop */
  const NOD = [[-8.5, .5, -2, 45], [-50, -36, -36, -24], [-35, -21, 14.5, 27]].concat(lanes.map(L => [L.x - 1.3, L.x + 1.3, L.z0 - 2.2, L.z1 + 2.2]), courts.map(c => [c.cx - 6, c.cx + 6, c.cz - 4, c.z + .5]));
  VC.noDecor = (x, z) => { const r = Math.hypot(x - CX, z - CZ); if (r > RING - 11 && r < RING + 11) return true; for (const q of NOD) if (x > q[0] && x < q[1] && z > q[2] && z < q[3]) return true; return false };   /* pedestrian zones, Gassen, courtyards, the Ring belt */
  VC.streets = { lanes: lanes.length, courts: courts.map(c => [+c.x.toFixed(1), +c.z.toFixed(1), +c.cx.toFixed(1), +c.cz.toFixed(1)]), plaques: plaques.length, cars: nCar, racks, bins };
  /* lamps across the streets (between neighbouring blocks of the same neighbourhood), Litfaßsäulen on the wider streets */
  for (const hd of HOODS(CX, CZ, RING)) { }
  const posts = []; VC.posts = posts;
  const byHood = new Map(); for (const hd of ALL) byHood.set(hd, []); for (const b of blocks) byHood.get(b.hood).push(b);   /* every neighbourhood is flushed, even one made only of hand-laid rows (the Innere Stadt) */
  for (const [hd, list] of byHood) { const has = (x, z) => blocks.find(o => Math.abs(o.cx - x) < 1.5 && Math.abs(o.cz - z) < 1.5);
    list.forEach((b, i) => { const gw = hd.id === 'inner' ? 20.5 : 24.5, gd = hd.id === 'inner' ? 18.5 : 20.5, e = has(b.cx + gw, b.cz), s = has(b.cx, b.cz + gd);
      if (e && i % 2 === 0) hd.VA.lamp(b.x1 + .2, b.cz, e.x0 - .2, b.cz); if (s && i % 2 === 1) hd.VA.lamp(b.cx, b.z1 + .2, b.cx, s.z0 - .2);
      if (hd.id !== 'inner' && i % 6 === 3 && !b.square) { const x = b.x1 + 1.1, z = b.z1 + 1.1; if (roadD(x, z) > 1.5 && !waterAt(x, z)) hd.VA.litfass(x, z) } });
    if (hd.id !== 'inner') list.forEach(b => { if (b.square) return; const S = E.bounds && b.z0 - 4 < E.bounds[2], x = b.cx + (S ? 1 : -1) * (b.x1 - b.x0) / 4, z = S ? b.z1 + 1.95 : b.z0 - 1.95, fz = S ? b.z1 : b.z0;   /* at the map's north edge: the south kerb */
      if (roadD(x, z) > 1.2 && !waterAt(x, z) && !VC.noDecor(x, z) && !ctx.circles.some(c => Math.hypot(c[0] - x, c[1] - (z + fz) / 2) < c[2] + 1.9)) { hd.VA.post(x, z); hd.posts = (hd.posts || 0) + 1; posts.push([+x.toFixed(2), +z.toFixed(2), fz]); NOD.push([x - 1.6, x + 1.6, Math.min(z, fz) - .4, Math.max(z, fz) + .4]) } });   /* a lamp post on every block's kerb: every neighbourhood is lit */
    hd.VA.flush(); const sm = new THREE.MeshStandardMaterial({ map: sideTex(q), roughness: .85 }); sm.userData.lin = 1; if (hd.side.length) { const m = new THREE.Mesh(K.merge(hd.side), sm); m.receiveShadow = true; hd.grp.add(m) }
    if (hd.extra.length) { const vm = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .8 }); vm.userData.lin = 1; hd.grp.add(new THREE.Mesh(K.merge(hd.extra), vm)) }
    const L2 = hd.id === 'inner' ? list.concat(rows.map(w => ({ cx: (w.x0 + w.x1) / 2, cz: (w.z0 + w.z1) / 2, x0: w.x0, x1: w.x1, z0: w.z0, z1: w.z1 }))) : list; if (!L2.length) { hd.bbox = [0, 0, 0, 0]; continue } const cx = L2.reduce((a, b) => a + b.cx, 0) / L2.length, cz = L2.reduce((a, b) => a + b.cz, 0) / L2.length; districts.push({ id: 'v_' + hd.id, name: hd.name, x: cx, z: cz });
    hd.bbox = [Math.min(...L2.map(b => b.x0)), Math.max(...L2.map(b => b.x1)), Math.min(...L2.map(b => b.z0)), Math.max(...L2.map(b => b.z1))] }
  /* streaming: a neighbourhood's detail (portals, balconies, lamps, glow) only near it */
  const D = [80, 120, 170][q]; let tk = 0;
  ctx.upd.push(dt => { if ((tk -= dt) > 0) return; tk = .5; const P = AV.P; for (const hd of byHood.keys()) { const [x0, x1, z0, z1] = hd.bbox, dx = Math.max(x0 - P.x, 0, P.x - x1), dz = Math.max(z0 - P.z, 0, P.z - z1); hd.det.visible = Math.hypot(dx, dz) < D } });
  VC.fx = { ring: ringB.length, blocks: blocks.length, squares: blocks.filter(b => b.square).length, hoods: districts.map(d => d.name + ' ' + byHood.get([...byHood.keys()].find(h => 'v_' + h.id === d.id)).length) };
  VC.landmarks = lm; VC.blocks = blocks; VC.look = AV.viennaArch.stats; VC.postsBy = Object.fromEntries(ALL.map(h => [h.id, h.posts || 0])); return { blocks, cafe, districts: districts.concat(lm.map(l => ({ id: 'v_lm_' + l.name, name: l.name, x: l.x, z: l.z }))) };
};
})(window.AV);
