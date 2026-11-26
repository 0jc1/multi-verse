/* APEVERSE V1.0 - world_koh_samui_jurassic.js : JURASSIC KOH SAMUI — a fantastical ancient tropical
   island shaped like Koh Samui itself, frozen 150 million years in the past. Primordial jungle with
   ENORMOUS ferns, volcano-like ridges, dramatic lagoons, seaside cliffs, waterfalls, dinosaur herds
   (sauropods, stegosaurs, raptors, ankylosaurs), giant pterosaurs riding the thermals over the sea,
   odd shelled forest animals and glowing crystals. No modern hotels, no roads, no people — visitors
   arrive through a tiny futuristic TIME GATE on the north-west headland.
   Landmarks: Dino Valley · Fern Cathedral · Great Lagoon · Nesting Cliffs · River Canyon ·
              Crystal Cave · High Canopy Trail · Time Gate.
   Nature first: hand-painted terrain, iridescent water, painted sky, fireflies, painted signs.
   Everything procedural (works from file:// and on phones). */
'use strict';
(function (AV) {
const TAU = AV.TAU, K = AV.kit, M = K.M, BG = K.BG, G = AV.G, std = AV.std, tr = AV.tr;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const deg = d => d * Math.PI / 180;
const hourNow = () => (AV.S.time / 60) % 24;

/* ======================= island shape (a stylised KOH SAMUI) ======================= */
/* Koh Samui: roughly a rounded rectangle ~25 x 21 km, "cog" coast, punta Nord-Est (Choeng Mon),
   gran punta Ovest, uova (islets) a Nord. Local island: ~560 x 470 m playable (1 m ≈ 45 m real). */
const CX = 0, CZ = 0, RX = 285, RZ = 240;
const SAMUI = [   // [angleDeg, radiusMultiplier] — the cog outline of the island, drawn from the real coast
  [0, 1.00], [10, 1.00], [22, .98], [34, .96], [45, .97], [56, .95], [68, .96], [78, .99],
  [88, 1.02], [100, 1.05], [112, 1.08], [124, 1.06], [136, 1.02], [148, .98], [160, .96],
  [172, .95], [184, .94], [196, .93], [208, .92], [220, .94], [232, .96], [244, .97],
  [256, .98], [268, .99], [280, 1.02], [292, 1.06], [304, 1.10], [316, 1.14], [328, 1.12],
  [340, 1.07], [352, 1.02]];
/* island profile: coast → flat coastal plain → rising jungle → volcano ridge ring → central peak */
const RIDGE = [.62, 148], PEAK = [0, -46];   // ridge ring radius fraction + height; central volcano
function islandR(a) {   // island radius at angle a (radians), smoothly interpolated around the cog
  const d = ((a % TAU) + TAU) % TAU, i = Math.floor(d / TAU * SAMUI.length), f = d / TAU * SAMUI.length - i;
  const A = SAMUI[i % SAMUI.length], B = SAMUI[(i + 1) % SAMUI.length];
  let k = A[1] + (B[1] - A[1]) * (f * f * (3 - 2 * f));
  if (i === 10 || i === 11) k *= 1.02;              //Choeng Mon headland (north-east punt)
  if (i >= 21 && i <= 24) k *= 1.0;                 // gentle west
  return k;
}
const HIN = [-160, -180], HIN2 = [-40, -236];   // "islets" off the north coast (like the real ones)
/* terrain height: returns metres above sea; < 0 is under water */
function H(x, z) {
  const dx = x - CX, dz = z - CZ, d = Math.hypot(dx, dz), a = Math.atan2(dz, dx);
  const R0 = (Math.abs(Math.cos(a)) * RX + Math.abs(Math.sin(a)) * RZ) * islandR(a);
  const k = clamp(1 - d / R0, 0, 1);
  let h = -6;                                             // sea bed
  if (k <= 0) return h;
  if (k < .07) return h + k / .07 * .5;                   // beach shelf rises to the strand
  /* coastal plain (wide + gentle), then jungle slopes, then a LOW ridge ring, then a soft central massif */
  const t = (k - .07) / .93;
  let land = Math.pow(t, 1.6) * 24 + Math.sin(x * .05 + 1) * Math.cos(z * .045) * 2.2 + Math.sin(x * .13) * Math.sin(z * .12) * 1.1;
  const ridge = Math.exp(-Math.pow((d / R0 - .70) * 2.6, 2)) * 14;            // low volcano-like ridge ring
  const peak = Math.exp(-Math.pow(d / 150, 2)) * 26;                          // broad central massif
  land += ridge * (.7 + .3 * Math.sin(a * 3 + 1)) + peak * (.72 + .28 * Math.cos(a * 2));
  h = Math.max(.4, land);
  /* Great Lagoon: a dramatic flooded bay on the east side (like the real lagoons) */
  const lg = Math.exp(-Math.pow((x - 132) / 58, 2) - Math.pow((z - 40) / 40, 2));
  h = h * (1 - clamp(lg * 1.35, 0, 1)) + lg * (-7.5);
  /* River Canyon: a canyon carved by the great river running north-west (walkable slopes, 20 m wide) */
  const riv = Math.abs(canyonDist(x, z));
  if (riv < 20) { const cut = (1 - riv / 20); h = h - cut * 6 * clamp((h + 1) / 8, 0, 1) - cut * 1.2 }
  /* small volcanic crater lake (Blue Pool) on the ridge */
  const bp = Math.hypot(x + 150, z - 96); if (bp < 26) h = Math.min(h, 6 - (1 - bp / 26) * 9);
  return h;
}
/* signed distance to the canyon river path (a curve from the lagoon to the north-west coast) */
function canyonDist(x, z) { const path = t => [46 + t * -150 + Math.sin(t * 4) * 22, 30 + t * -118 + Math.cos(t * 3) * 16];
  let bd = 1e9; for (let i = 0; i <= 14; i++) { const p0 = path(i / 14), p1 = path(Math.min(1, (i + 1) / 14));
    const dx = p1[0] - p0[0], dz = p1[1] - p0[1], L = dx * dx + dz * dz, tt = clamp(((x - p0[0]) * dx + (z - p0[1]) * dz) / L, 0, 1);
    bd = Math.min(bd, Math.hypot(x - p0[0] - dx * tt, z - p0[1] - dz * tt)) } return bd }
const beachK = (x, z) => { const d = Math.hypot(x - CX, z - CZ), a = Math.atan2(z - CZ, x - CX);
  return 1 - d / ((Math.abs(Math.cos(a)) * RX + Math.abs(Math.sin(a)) * RZ) * islandR(a)) };
const isLand = (x, z) => H(x, z) > .55;
const inWater = (x, z) => !isLand(x, z);
/* lagoon water level */
const LAGY = -1.2, SEAY = 0;

/* ======================= landmarks ======================= */
const LM = {
  dinoValley: [8, 118],        // wide green valley with herds (south of the peak)
  fernCathedral: [-118, 62],   // grove of giant tree ferns with light shafts
  lagoon: [132, 40],           // Great Lagoon
  nestingCliffs: [172, -128],  // south-east cliffs above the sea
  canyon: [-96, -40],          // River Canyon crossing
  crystalCave: [-150, -86],    // Crystal Cave mouth on the ridge foot
  canopy: [-64, 128],          // High Canopy Trail head
  gate: [-208, 148]            // the TIME GATE on the north-west headland
};

/* ======================= canvas textures ======================= */
const TX = {};
const TOR = new THREE.TorusGeometry(1, .07, 8, 26);   // glowing rings (kit has no torus)
function canvasTex(w, h, draw, rep) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8;
  t.wrapS = t.wrapT = rep ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping; t.userData = { keep: true }; return t }
/* rock/cliff texture (stratified volcanic stone) */
function cliffTex() {
  return TX.cliff || (TX.cliff = canvasTex(512, 512, (c, w, h) => {
    const r = AV.rng(33); c.fillStyle = '#6a6258'; c.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 8 + r() * 14) { const v = 70 + r() * 50 | 0;
      c.fillStyle = 'rgba(' + (v + 8) + ',' + v + ',' + (v - 6) + ',.5)'; c.fillRect(0, y, w, 4 + r() * 8) }
    for (let i = 0; i < 1200; i++) { c.fillStyle = r() < .5 ? 'rgba(30,25,20,.2)' : 'rgba(200,190,170,.14)';
      c.fillRect(r() * w, r() * h, 2 + r() * 6, 1 + r() * 3) }
    for (let i = 0; i < 46; i++) { const x = r() * w, y = r() * h, rr = 8 + r() * 40, g = c.createRadialGradient(x, y, 0, x, y, rr);
      g.addColorStop(0, r() < .5 ? 'rgba(60,90,40,.35)' : 'rgba(40,30,25,.3)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g; c.fillRect(x - rr, y - rr, rr * 2, rr * 2) }   // moss patches
  }, true));
}
/* crystal texture: glowy cyan-magenta facets */
function crystalTex() {
  return TX.crys || (TX.crys = canvasTex(128, 128, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#bfffff'); g.addColorStop(.5, '#5ad8ff'); g.addColorStop(1, '#c86aff');
    c.fillStyle = g; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 3;
    for (let i = 0; i < 10; i++) { c.beginPath(); c.moveTo(Math.random() * w, 0); c.lineTo(Math.random() * w, h); c.stroke() }
  }, true));
}
/* wooden prehistoric sign texture (burnt wood look, painted symbols) */
function woodTex() {
  return TX.wood || (TX.wood = canvasTex(256, 256, (c, w, h) => {
    const r = AV.rng(71); c.fillStyle = '#7a5a38'; c.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 3 + r() * 5) { const v = 90 + r() * 40 | 0;
      c.fillStyle = 'rgba(' + v + ',' + (v - 20) + ',' + (v - 50) + ',.4)'; c.fillRect(0, y, w, 2 + r() * 3) }
    for (let i = 0; i < 60; i++) { c.fillStyle = 'rgba(40,25,10,.25)'; c.beginPath(); c.arc(r() * w, r() * h, 2 + r() * 8, 0, TAU); c.fill() }
  }, true));
}

/* ======================= creature builders (merged low-poly, one draw call per species via instancing) ======================= */
/* sauropod: long neck, big body, tail, four legs */
function sauropodGeo() {
  const p = [];
  const body = [BG.sph, 0x7a8a6a, M(0, 8.4, 0, 5.2, 4.2, 8.2), 0];
  p.push(body);
  p.push([BG.sph, 0x8a9a78, M(0, 8.2, 6.2, 3.6, 3.2, 4.2), 0]);                       // shoulders
  p.push([BG.sph, 0x96a680, M(0, 10.4, 12.5, 1.7, 1.7, 1.9), 0]);                     // head
  p.push([BG.cone, 0x6a7a5a, M(0, 9.6, 14.6, .5, 1.6, .5, Math.PI / 2, 0, 0), 0]);    // snout
  for (let i = 0; i < 5; i++) p.push([BG.cyl, 0x8a9a78, M(0, 8.2 + i * .5, 7 + i * 1.6, 1.15 - i * .09, 1.8, 1.15 - i * .09, Math.sin(i * .8) * .1, 0, 0), 0]); // neck segments
  for (let i = 0; i < 4; i++) p.push([BG.cyl, 0x6a7a5a, M(0, 8.2 - i * 1.9, -4.5 - i * 2.4, 1.3 - i * .16, 2.3, 1.3 - i * .16, -.28, 0, 0), 0]);               // tail
  for (const [sx, sz] of [[2.1, 4.6], [-2.1, 4.6], [2.1, -4.6], [-2.1, -4.6]]) {
    p.push([BG.cyl, 0x5a6a4a, M(sx, 4.4, sz, .95, 7.6, .95), 0]);
    p.push([BG.cyl, 0x4a5a3a, M(sx, .75, sz, 1.25, 1.5, 1.25), 0]);
  }
  return K.merge(p);
}
/* stegosaurus: plates along the back, spiked tail */
function stegoGeo() {
  const p = [];
  p.push([BG.sph, 0x6a5a3a, M(0, 3.3, 0, 2.4, 2.3, 5.6), 0]);
  p.push([BG.sph, 0x7a6a48, M(0, 3.4, 4.4, 1.3, 1.2, 1.8), 0]);
  p.push([BG.sph, 0x8a7a58, M(0, 3.9, 5.9, .85, .8, .95), 0]);
  p.push([BG.cone, 0x5a4a2a, M(0, 3.6, 6.8, .35, 1.1, .35, Math.PI / 2, 0, 0), 0]);
  for (let i = 0; i < 4; i++) p.push([BG.cyl, 0x5a4a2a, M(0, 3.2 - i * 1.1, -3.6 - i * 1.7, .7 - i * .1, 1.4, .7 - i * .1, -.3, 0, 0), 0]);
  for (const [sx, sz] of [[1.3, 2.6], [-1.3, 2.6], [1.3, -2.4], [-1.3, -2.4]]) p.push([BG.cyl, 0x4a3a20, M(sx, 1.4, sz, .5, 2.6, .5), 0]);
  for (let i = 0; i < 6; i++) { const t = i / 5 - .5;
    p.push([BG.oct, 0xc8a24a, M(t * .1, 5.1 + Math.sin(i) * .3, 1.2 - i * 1.15, 1.5 - Math.abs(t) * .5, 1.7 - Math.abs(t) * .8, .28, 0, 0, t * .4), .1]) }
  for (const sx of [-1, 1]) p.push([BG.cone, 0xe8d8a8, M(sx * .5, 2.6, -6.3, .22, 1.4, .22, -Math.PI / 2, 0, sx * .35), 0]);
  return K.merge(p);
}
/* raptor: sleek biped, tail straight out */
function raptorGeo() {
  const p = [];
  p.push([BG.sph, 0x9a6a3a, M(0, 2.15, 0, .8, .95, 2.2), 0]);
  p.push([BG.sph, 0xa87a48, M(0, 2.9, 1.35, .5, .5, .8), 0]);
  p.push([BG.sph, 0xb08a58, M(0, 3.15, 2.05, .38, .38, .5), 0]);
  p.push([BG.cone, 0x8a5a2a, M(0, 3.0, 2.5, .2, .6, .2, Math.PI / 2, 0, 0), 0]);
  p.push([BG.sph, 0xe8c040, M(.22, 3.2, 1.9, .09, .09, .09), 1]); p.push([BG.sph, 0xe8c040, M(-.22, 3.2, 1.9, .09, .09, .09), 1]);
  for (let i = 0; i < 4; i++) p.push([BG.cyl, 0x8a5a2a, M(0, 2.2 - i * .12, -.9 - i * 1.05, .34 - i * .05, 1.15, .34 - i * .05, -.08, 0, 0), 0]);
  for (const sx of [-1, 1]) { p.push([BG.cyl, 0x7a4a20, M(sx * .5, 1.9, .45, .17, 1.15, .17, .35, 0, sx * .2), 0]);
    p.push([BG.cyl, 0x7a4a20, M(sx * .42, 1.35, .68, .14, 1.0, .14, -.15, 0, sx * .3), 0]);
    p.push([BG.cyl, 0x6a3a18, M(sx * .4, .35, .6, .13, .7, .13, 0, 0, 0), 0]);
    p.push([BG.cyl, 0x7a4a20, M(sx * .72, 2.1, 1.1, .12, .9, .12, .5, 0, sx * .25), 0]) }
  return K.merge(p);
}
/* ankylosaur: armoured club-tail */
function ankyGeo() {
  const p = [];
  p.push([BG.sph, 0x5a6a5a, M(0, 1.9, 0, 2.0, 1.6, 3.4), 0]);
  p.push([BG.sph, 0x6a7a6a, M(0, 2.1, 2.6, 1.0, .85, 1.1), 0]);
  p.push([BG.sph, 0x7a8a7a, M(0, 2.3, 3.4, .6, .55, .7), 0]);
  p.push([BG.cyl, 0x4a5a4a, M(0, 1.7, -2.6, .55, 3.4, .55, -Math.PI / 2 + .12, 0, 0), 0]);
  p.push([BG.sph, 0x3a4a3a, M(0, 2.0, -4.3, .7, .7, .7), 0]);
  for (const sx of [-1, 1]) p.push([BG.cone, 0xc8c0a8, M(sx * .5, 2.3, -4.3, .18, .7, .18, -Math.PI / 2, 0, sx * .8), 0]);
  for (const [sx, sz] of [[1.1, 1.6], [-1.1, 1.6], [1.1, -1.4], [-1.1, -1.4]]) p.push([BG.cyl, 0x3a4a3a, M(sx, .8, sz, .45, 1.6, .45), 0]);
  for (let i = 0; i < 8; i++) p.push([BG.oct, 0x8a9a8a, M((i % 2 ? .9 : -.9), 3.0 - (i >> 1) * .12, 1.6 - (i >> 1) * 1.1, .4, .22, .4, 0, i, 0), 0]);
  return K.merge(p);
}
/* pterosaur: wings out, body low — instanced high in the air, slow circles done in upd */
function pteroGeo() {
  const p = [];
  p.push([BG.sph, 0x8a7a9a, M(0, 0, 0, .5, .55, 1.7), 0]);
  p.push([BG.sph, 0x9a8aa8, M(0, .2, 1.5, .34, .34, .55), 0]);
  p.push([BG.cone, 0x7a6a8a, M(0, .16, 2.1, .16, 1.1, .16, Math.PI / 2, 0, 0), 0]);
  p.push([BG.cone, 0xe8d0a0, M(0, .3, 1.35, .3, .9, .3, Math.PI / 2, 0, 0), 0]);
  for (const sx of [-1, 1]) {
    p.push([BG.cyl, 0x7a6a8a, M(sx * .8, .1, 0, .22, 1.8, .22, 0, 0, sx * 1.25), 0]);                 // arm
    const wing = new THREE.PlaneGeometry(7.5, 3.2, 1, 2); wing.rotateX(-Math.PI / 2); wing.translate(sx * 4.4, 0, -.2);
    wing.attributes.position.setY(1, 1.2); wing.attributes.position.setY(4, -.8);
    p.push([wing, 0x9a8aa8, M(0, 0, 0), .05]);
    p.push([BG.cyl, 0x6a5a7a, M(sx * .5, -.5, .3, .14, 1.1, .14, .4, 0, 0), 0]);
    p.push([BG.cyl, 0x6a5a7a, M(sx * .5, -1.0, .5, .11, .9, .11, .1, 0, 0), 0]);
  }
  const g = K.merge(p); g.computeVertexNormals(); return g;
}
/* shelled forest oddity: a big armadillo-tortoise with a glowing shell (fantastical) */
function shellBeastGeo() {
  const p = [];
  p.push([BG.hem, 0x8a9a5a, M(0, .62, 0, 1.5, 1.15, 1.9), 0]);
  p.push([BG.sph, 0x6a7a3a, M(0, .58, 0, 1.55, .95, 1.95, 0, 0, 0), 0]);
  p.push([BG.sph, 0xa0b060, M(0, .95, 1.15, .6, .45, .7), 0]);
  p.push([BG.sph, 0x2a3a1a, M(.26, 1.0, 1.6, .1, .1, .1), 1]); p.push([BG.sph, 0x2a3a1a, M(-.26, 1.0, 1.6, .1, .1, .1), 1]);
  p.push([BG.cone, 0x8a9a5a, M(0, .82, 1.85, .22, .5, .22, Math.PI / 2, 0, 0), 0]);
  for (const [sx, sz] of [[.8, .9], [-.8, .9], [.8, -.8], [-.8, -.8]]) p.push([BG.cyl, 0x5a6a2a, M(sx, .3, sz, .3, .6, .3), 0]);
  for (let i = 0; i < 7; i++) { const a = i / 7 * TAU;
    p.push([BG.oct, 0x4aff9a, M(Math.cos(a) * 1.0, .78 + Math.sin(a * 2) * .3, Math.sin(a) * 1.2, .16, .1, .16), .8]) }
  return K.merge(p);
}
/* giant dragonfly (primitive meganeura) for the air near the lagoon */
function meganeuraGeo() {
  const p = [[BG.cyl, 0x3a7a6a, M(0, 0, 0, .09, 2.4, .09, Math.PI / 2, 0, 0), 0],
    [BG.sph, 0x4a8a7a, M(0, 0, -1.3, .3, .3, .4), .2], [BG.sph, 0x9affd8, M(.14, .1, -1.5, .12, .12, .12), 1], [BG.sph, 0x9affd8, M(-.14, .1, -1.5, .12, .12, .12), 1]];
  for (const sx of [-1, 1]) { const w = new THREE.PlaneGeometry(3.4, .8, 1, 1); w.rotateX(-Math.PI / 2); w.translate(sx * 1.8, 0, -.2);
    p.push([w, 0xbfffe8, M(0, 0, 0), .5]); const w2 = new THREE.PlaneGeometry(3.0, .7, 1, 1); w2.rotateX(-Math.PI / 2); w2.translate(sx * 1.6, 0, .5);
    p.push([w2, 0xa8ffe0, M(0, .1, 0), .5]) }
  const g = K.merge(p); g.computeVertexNormals(); return g;
}
/* giant fern (tree fern with fronds) — the signature plant of the world */
function giantFernGeo() {
  const p = [];
  for (let i = 0; i < 5; i++) p.push([BG.cyl, 0x5a4428, M(0, i * 1.1 + .6, 0, .3 - i * .02, 1.15, .3 - i * .02), 0]);
  const frond = (() => { const g = new THREE.PlaneGeometry(4.6, 1.15, 4, 2); const pp = g.attributes.position;
    for (let i = 0; i < pp.count; i++) { const x = pp.getX(i); pp.setZ(i, Math.sin(Math.abs(x) / 4.6 * Math.PI) * .5); pp.setY(i, pp.getY(i) * (1 - Math.abs(x) / 6.4)) }
    g.computeVertexNormals(); return g })();
  const leafM = (() => { const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .6, side: THREE.DoubleSide }); return m })();
  for (let i = 0; i < 9; i++) { const a = i / 9 * TAU, tilt = .55 + (i % 3) * .14;
    p.push([frond, [0x2a8a3a, 0x37a04a, 0x1f7a34][i % 3], M(Math.cos(a) * 2.0, 5.6 + (i % 3) * .35, Math.sin(a) * 2.0, 1, 1, 1, 0, -a, tilt), .18]) }
  const g = K.merge(p); g.computeVertexNormals(); return g;
}
/* horsetail/cycad clump */
function cycadGeo() {
  const p = [];
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, t = .45 + (i % 3) * .18;
    p.push([BG.coneL, [0x2f7a3a, 0x3f8a42, 0x286a30][i % 3], M(Math.cos(a) * .35, .55, Math.sin(a) * .35, .1, 1.25, .05, Math.sin(a) * t, 0, -Math.cos(a) * t), .12]) }
  p.push([BG.cylL, 0x5a4428, M(0, .3, 0, .18, .6, .18), 0]);
  return K.merge(p);
}
/* primitive conifer (araucaria-like) for the High Canopy Trail */
function araucariaGeo() {
  const p = [[BG.cyl, 0x5a3a22, M(0, 6, 0, .5, 12, .5), 0]];
  for (let i = 0; i < 7; i++) { const y = 3.5 + i * 1.7, r = 4.2 - i * .5;
    const br = new THREE.CylinderGeometry(.08, .16, r, 5, 1); br.rotateZ(Math.PI / 2 - .5); br.translate(r * .5, 0, 0);
    for (let k = 0; k < 4; k++) { const a = k / 4 * TAU + i; p.push([br, 0x2a5a30, M(Math.cos(a) * .4, y, Math.sin(a) * .4, 1, 1, 1, 0, a, 0), .08]) } }
  p.push([BG.ico, 0x2a5a30, M(0, 12.6, 0, 1.6, 2.4, 1.6), .1]);
  const g = K.merge(p); g.computeVertexNormals(); return g;
}
/* ginko-like broad tree */
function broadTreeGeo() {
  const p = [[BG.cyl, 0x4a3a26, M(0, 2.6, 0, .55, 5.2, .55), 0], [BG.cyl, 0x4a3a26, M(.7, 4.1, .3, .3, 2.6, .3, .3, .4, .2), 0]];
  p.push([BG.ico, 0x3a8a3a, M(0, 6.4, 0, 3.4, 2.3, 3.4), .12]);
  p.push([BG.ico0, 0x2f7a30, M(2.0, 5.0, .8, 1.9, 1.4, 1.9), .12]);
  p.push([BG.ico0, 0x45a04a, M(-1.6, 5.4, -.9, 1.7, 1.3, 1.7), .12]);
  return K.merge(p);
}

/* ======================= the world ======================= */
AV.registerWorld({
  id: 'koh_samui_jurassic',
  build(ctx) {
    const S = AV.S || (AV.S = {}), q = ctx.q, rng = ctx.rng, grp = ctx.group;
    S.ksj = S.ksj || {};
    const SKY = { exp: .82, tint: [0x3a90e0, 0xa0d0e0, .38, .26],   /* M13: tropical blue (was near-white) */ dome: { s1: 0xdde6ee, s2: 0xa8d8e8, swirl: .02, cloud: .55, glow: .45 } };
    const B = { land: K.batch(), rock: K.batch(), plants: K.batch(), portal: K.batch(), cave: K.batch(), night: K.batch() };
    const occ = [];
    const T = (x, z, r, label, fn, show) => { const t = { x, z, r, label, fn, show }; ctx.T.push(t); return t };
    /* water level lookup: sea in open water, lagoon level inside the lagoon bowl */
    const waterY = (x, z) => { const lgn = Math.exp(-Math.pow((x - LM.lagoon[0]) / 58, 2) - Math.pow((z - LM.lagoon[1]) / 40, 2)); return lgn > .45 ? LAGY : SEAY };
    const swim = (x, z) => { const h = H(x, z); return h < waterY(x, z) - 1.3 };

    /* ---------- painted terrain ---------- */
    const GW = 760, GD = 700, XMIN = -380, XMAX = 380, ZMIN = -350, ZMAX = 350;
    const sx = [130, 190, 250][q], sz = Math.round(sx * GD / GW);
    const tg = new THREE.PlaneGeometry(GW, GD, sx, sz); tg.rotateX(-Math.PI / 2);
    const tp = tg.attributes.position, col = new Float32Array(tp.count * 3), cc = new THREE.Color();
    for (let i = 0; i < tp.count; i++) { const x = tp.getX(i), z = tp.getZ(i), h = H(x, z); tp.setY(i, h);
      const lgn = Math.exp(-Math.pow((x - LM.lagoon[0]) / 58, 2) - Math.pow((z - LM.lagoon[1]) / 40, 2));
      let hex; if (h < -.4) hex = 0x3a8a88; else if (h < .7) hex = 0xeadcb0; else if (h < 3) hex = 0xb4b870;
      else if (h < 10) hex = 0x5a9a48; else if (h < 22) hex = 0x4a8a40; else hex = 0x6a6a52;
      if (lgn > .45 && h < 4) hex = h < -1 ? 0x2a8a98 : 0xd8c898;
      const riv = Math.abs(canyonDist(x, z)); if (riv < 7 && h > .6 && h < 9) hex = 0xa08a60;
      /* natural mottling so the jungle floor isn't one flat colour */
      const n = .88 + .12 * Math.sin(x * .31 + z * .17) * Math.cos(z * .27 - x * .11) + .06 * Math.sin(x * 1.7) * Math.sin(z * 1.3);
      cc.setHex(hex).convertSRGBToLinear(); col[i * 3] = cc.r * n; col[i * 3 + 1] = cc.g * n; col[i * 3 + 2] = cc.b * n; }
    tg.setAttribute('color', new THREE.BufferAttribute(col, 3)); tg.computeVertexNormals();
    const gmat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .95 });
    gmat.userData.lin = 1; const ground = new THREE.Mesh(tg, gmat); ground.receiveShadow = true; grp.add(ground);

    /* ---------- water: sea + lagoon + blue pool (iridescent, animated) ---------- */
    const wo = { deep: 0x14506a, shallow: 0x3ab0b8, sky: 0xcfeff0, iri: .22, opacity: .86, scale: .8 };
    const sea = K.waterPlane(ctx, new THREE.PlaneGeometry(3600, 3600), SEAY, wo); sea.position.y = SEAY - .05;
    const lgnW = K.waterPlane(ctx, new THREE.PlaneGeometry(116, 82), LAGY, { deep: 0x1a5a70, shallow: 0x46c8c0, sky: 0xd8f4f0, iri: .3, opacity: .88, scale: 1.2 });
    lgnW.position.set(LM.lagoon[0], LAGY, LM.lagoon[1]);
    const bpW = K.waterPlane(ctx, new THREE.PlaneGeometry(44, 44), 4.2, { deep: 0x2a58c8, shallow: 0x5ad8ff, sky: 0xcfeff0, iri: .4, opacity: .9, scale: 1.6 });
    bpW.position.set(-150, 4.2, 96);

    /* ---------- volcano ridge rocks + cliffs (stratified stone, instanced) ---------- */
    const cliffM = K.floraMat(0, { map: cliffTex(), rough: .9 });
    { const items = [];
      for (let i = 0; i < K.n(46); i++) { const a = rng() * TAU, d = (RIDGE[0] + (rng() - .5) * .1) * RX * .9 + rng() * 30, x = Math.cos(a) * d, z = Math.sin(a) * d * .85;
        if (!isLand(x, z) || H(x, z) < 12) continue; const s = 3 + rng() * 7;
        items.push({ x, y: H(x, z) - 1, z, s, ry: rng() * TAU, sy: .8 + rng() * .8 }) }
      K.scatter(ctx, BG.dod, cliffM, items, { far: 320 }); }
    /* Nesting Cliffs: a dramatic cliff wall above the sea on the south-east, with terraces */
    { const parts = [], nx = LM.nestingCliffs[0], nz = LM.nestingCliffs[1];
      for (let i = 0; i < 9; i++) { const t = i / 8 - .5, w = 120;
        const x = nx + Math.cos(t * 1.1) * w * .8, z = nz + Math.sin(t * 1.1) * 60;
        const h = 26 + rng() * 22, s = 16 + rng() * 12;
        parts.push([BG.dod, [0x6a6258, 0x5a544c, 0x7a7266][i % 3], M(x, H(x, z) + h * .3, z, s, h, s, .2, rng() * 3, .1), 0]) }
      const m = new THREE.Mesh(K.merge(parts), cliffM); m.castShadow = m.receiveShadow = true; grp.add(m) }
    /* sea stacks + islets off the north coast (the "eggs") */
    { const parts = [];
      [[HIN[0], HIN[1], 30, 34, 26], [HIN[0] + 34, HIN[1] + 14, 18, 22, 20], [HIN2[0], HIN2[1], 22, 26, 22], [60, -298, 12, 16, 12], [-92, -312, 9, 13, 9]].forEach(([x, z, w, h, d], i) => {
        parts.push([BG.ico, i % 2 ? 0x5a544c : 0x6a6258, M(x, 2, z, w, h, d, 0, rng() * 3, 0), 0]);
        parts.push([BG.ico0, 0x2f6a34, M(x, h * .42, z, w * .5, 7, d * .5), 0]) });
      const m = new THREE.Mesh(K.merge(parts), cliffM); grp.add(m) }

    /* ---------- volcano smoulder: the ridge peak glows and breathes a thin smoke column ---------- */
    const peakY = H(PEAK[0], PEAK[1]);
    { const glow = new THREE.Mesh(new THREE.SphereGeometry(16, 12, 8), new THREE.MeshBasicMaterial({ color: 0xff5a20, transparent: true, opacity: .35 }));
      glow.position.set(PEAK[0], peakY + 4, PEAK[1]); grp.add(glow);
      const smoke = K.motes(ctx, { n: 40, x: PEAK[0], z: PEAK[1], r: 10, y0: 0, y1: 46, cols: [0x8898a8, 0xb0bcc8], size: 7, speed: .5, alpha: .35, H: () => peakY });
      ctx.upd.push((dt, t) => { glow.material.opacity = .28 + Math.sin(t * .8) * .1 }) }

    /* ---------- rivers + waterfalls in the canyon ---------- */
    { const rivPts = []; for (let i = 0; i <= 14; i++) { const t = i / 14, x = 46 + t * -150 + Math.sin(t * 4) * 22, z = 30 + t * -118 + Math.cos(t * 3) * 16;
        rivPts.push([x, Math.max(H(x, z), -1.4) + .06, z]) }
      const g = new THREE.BufferGeometry().setFromPoints(rivPts.map(p => new THREE.Vector3(p[0], p[1], p[2])));
      const rw = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rivPts.map(p => new THREE.Vector3(p[0], p[1] + .08, p[2]))), 40, 6.5, 7, false), K.water({ deep: 0x1e6a6a, shallow: 0x52d8c8, sky: 0xd8f4f0, iri: .25, opacity: .82, scale: 1.1 }));
      rw.renderOrder = 1; grp.add(rw);
      /* waterfalls where the river drops into the canyon */
      K.waterfall(ctx, -46, H(-46, -6) - 2, -6, 10, 12, 0, { c1: 0x8ae8ff, c2: 0xffffff });
      K.waterfall(ctx, -108, H(-108, -60) - 1, -60, 12, 16, Math.PI / 2, { c1: 0xa8f0ff, c2: 0xffffff });
      K.waterfall(ctx, 132, LAGY + 6, LM.lagoon[1] - 34, 14, 14, 0, { c1: 0x9ae8ff, c2: 0xffffff }); }   // lagoon head cascade

    /* ---------- FLORA: ferns everywhere, ferns cathedral, canopy trail, cycads, ginkos ---------- */
    const fernGeo = giantFernGeo(), cycadGeo2 = cycadGeo(), conifer = araucariaGeo(), broad = broadTreeGeo();
    const plantMat = K.floraMat(.06, { double: true, rough: .7 });
    const plantMatS = K.floraMat(.09, { double: true, rough: .7 });
    const okPlant = (x, z, minH, maxH) => { const h = H(x, z); return h > minH && h < maxH && Math.abs(canyonDist(x, z)) > 8 && Math.hypot(x - LM.gate[0], z - LM.gate[1]) > 12 };
    { const items = [], N = K.n([220, 380, 520][q]);
      for (let i = 0; i < N * 4 && items.length < N; i++) { const x = XMIN + 30 + rng() * (GW - 60), z = ZMIN + 30 + rng() * (GD - 60);
        if (!okPlant(x, z, 1.2, 24)) continue; const s = 1.2 + rng() * 2.4;
        items.push({ x, y: H(x, z) - .2, z, s, ry: rng() * TAU }) }
      K.scatter(ctx, fernGeo, plantMat, items, { far: K.far(false), cell: 90 }); }
    { const items = [], N = K.n([160, 280, 400][q]);
      for (let i = 0; i < N * 4 && items.length < N; i++) { const x = XMIN + 30 + rng() * (GW - 60), z = ZMIN + 30 + rng() * (GD - 60);
        if (!okPlant(x, z, .9, 30)) continue; const s = 1 + rng() * 2;
        items.push({ x, y: H(x, z) - .1, z, s, ry: rng() * TAU }) }
      K.scatter(ctx, cycadGeo2, plantMatS, items, { far: K.far(true), cell: 90 }); }
    { const ci = [], bi = [], N = K.n([40, 70, 100][q]);
      for (let i = 0; i < N * 5 && ci.length + bi.length < N; i++) { const x = XMIN + 40 + rng() * (GW - 80), z = ZMIN + 40 + rng() * (GD - 80);
        if (!okPlant(x, z, 3, 28)) continue; const s = 1.6 + rng() * 1.6, it = { x, y: H(x, z) - .3, z, s, ry: rng() * TAU };
        (rng() < .5 ? ci : bi).push(it) }
      K.scatter(ctx, conifer, plantMat, ci, { far: 300, cell: 120 }); K.scatter(ctx, broad, plantMat, bi, { far: 300, cell: 120 }); }
    /* Fern Cathedral: a ring of HUGE tree ferns with light shafts and glowing spores */
    { const fx = LM.fernCathedral[0], fz = LM.fernCathedral[1], items = [];
      for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + .12, r = 26;
        const x = fx + Math.cos(a) * r, z = fz + Math.sin(a) * r; items.push({ x, y: H(x, z) - .3, z, s: 3.6 + rng() * 1.4, ry: a }) }
      items.push({ x: fx, y: H(fx, fz) - .3, z: fz, s: 4.6, ry: 0 });
      K.scatter(ctx, fernGeo, plantMat, items, { far: 400 });
      /* light shafts */
      const shafts = []; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .3, x = fx + Math.cos(a) * 18, z = fz + Math.sin(a) * 18;
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 3.2, 26, 8, 1, true),
          new THREE.MeshBasicMaterial({ color: 0xfff2c0, transparent: true, opacity: .12, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
        shaft.position.set(x, H(x, z) + 14, z); shaft.rotation.z = (rng() - .5) * .2; grp.add(shaft); shafts.push(shaft.material) }
      K.motes(ctx, { n: 70, x: fx, z: fz, r: 30, y0: .5, y1: 9, cols: [0xfff2c0, 0xc8ffd8, 0xa8e8ff], size: 3.2, speed: .35, alpha: .7, H: (x, z) => H(x, z) });
      /* small player clearing: no collider, just open ground */
      ctx.circles.push([fx, fz, 5]); }
    /* High Canopy Trail: a ridge-top path of flat stones through the tallest trees */
    { const stones = [];
      for (let i = 0; i < 16; i++) { const t = i / 15, x = LM.canopy[0] + Math.sin(t * 2.4) * 26 + t * 54, z = LM.canopy[1] - t * 84;
        const h = H(x, z); if (h < 6) continue;
        B.land.add(AV.arch.mats().stone, BG.cyl, 0x8a8478, M(x, h + .12, z, 3.4, .28, 2.6, 0, rng() * 3, 0)); }
      ctx.sign('HIGH CANOPY TRAIL', LM.canopy[0] - 4, H(LM.canopy[0] - 4, LM.canopy[1]) + 3.4, LM.canopy[1], 0, 5.5, '#7aff9a', { posts: true }); }

    /* ---------- fauna placement ---------- */
    const HERD = (key, geo, spots, opt) => {
      opt = opt || {}; const items = spots.map(([x, z], i) => ({ x, y: H(x, z), z, s: (opt.s0 || .8) + rng() * (opt.s1 || .5), ry: rng() * TAU }));
      K.scatter(ctx, geo, K.floraMat(0, { rough: .8 }), items, { far: 380, cell: 200 });
      /* walking: each herd slowly orbits its centre; nearest members get soft calls */
      const centres = {}; spots.forEach(([x, z]) => { const c = Math.round(x) + ',' + Math.round(z); (centres[c] = centres[c] || []).push(items.length) });
      const herds = {}; spots.forEach(([x, z], i) => { const c = Math.round(x / 40) + ',' + Math.round(z / 40); (herds[c] = herds[c] || { c: [x, z], r: opt.orbit || 26, sp: .1 + rng() * .12, ph: rng() * TAU, i: [] }).i.push(i) });
      ctx.upd.push((dt, t) => { const P = AV.P; for (const c in herds) { const hd = herds[c], a = t * hd.sp + hd.ph;
        hd.i.forEach((ii, k) => { const it = items[ii], aa = a + k / hd.i.length * TAU, rr = hd.r * (.75 + .25 * Math.sin(t * .23 + k));
          it.x = hd.c[0] + Math.cos(aa) * rr; it.z = hd.c[1] + Math.sin(aa) * rr; it.y = H(it.x, it.z);
          it.ry = -aa + Math.PI / 2 }) } });
      return items;
    };
    /* Dino Valley herds */
    const dv = LM.dinoValley;
    const sauSpots = [[dv[0] - 34, dv[1] - 18], [dv[0] + 22, dv[1] + 26], [dv[0] + 44, dv[1] - 30], [-40, 30], [52, -66]];
    HERD('saur', sauropodGeo(), sauSpots, { s0: 1.15, s1: .5, orbit: 30 });
    const stegoSpots = [[dv[0] + 10, dv[1] + 4], [dv[0] - 18, dv[1] + 38], [-124, -10], [90, 92]];
    HERD('stego', stegoGeo(), stegoSpots, { s0: 1.0, s1: .4, orbit: 20 });
    const raptorSpots = [[dv[0] - 44, dv[1] + 42], [-8, 74], [110, -12], [-140, 10], [64, 120]];
    HERD('raptor', raptorGeo(), raptorSpots, { s0: .95, s1: .35, orbit: 34 });
    const ankySpots = [[dv[0] + 30, dv[1] + 58], [148, -64], [-52, -96]];
    HERD('anky', ankyGeo(), ankySpots, { s0: .9, s1: .3, orbit: 16 });
    /* shelled forest oddities near the Fern Cathedral and the canyon woods */
    const shellSpots = [[LM.fernCathedral[0] + 12, LM.fernCathedral[1] - 14], [LM.fernCathedral[0] - 16, LM.fernCathedral[1] + 10], [-84, 22], [-30, -84], [172, -40]];
    HERD('shell', shellBeastGeo(), shellSpots, { s0: 1.4, s1: .8, orbit: 9 });
    /* pterosaurs: high circling flocks over the sea, the lagoon and the cliffs */
    const pteroMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .7, side: THREE.DoubleSide });
    const pteroItems = []; for (let i = 0; i < K.n(14); i++) { const f = i % 3, cx = [300, LM.lagoon[0], LM.nestingCliffs[0]][f], cz = [-60, LM.lagoon[1], LM.nestingCliffs[1]][f];
      pteroItems.push({ x: cx, y: [58, 44, 62][f] + rng() * 14, z: cz, s: 2.2 + rng() * 1.6, ry: rng() * TAU, _f: f, _r: 40 + rng() * 60, _sp: .14 + rng() * .1, _ph: rng() * TAU }) }
    { const items = pteroItems, grp2 = new THREE.Group(); ctx.group.add(grp2);
      const pg = pteroGeo();
      const meshes = items.map(it => { const m = new THREE.Mesh(pg, pteroMat); m.scale.setScalar(it.s); grp2.add(m); return m });
      /* flock centres: over the open sea, the lagoon and the nesting cliffs */
      const FLO = [[300, -60, 58], [LM.lagoon[0], LM.lagoon[1], 44], [LM.nestingCliffs[0], LM.nestingCliffs[1], 62]];
      ctx.upd.push((dt, t) => { items.forEach((it, i) => { const f = FLO[it._f], a = t * it._sp + it._ph, m = meshes[i];
        m.position.set(f[0] + Math.cos(a) * it._r, f[2] + Math.sin(t * .7 + it._ph) * 6, f[1] + Math.sin(a) * it._r);
        m.rotation.y = -a + Math.PI / 2; m.rotation.z = Math.sin(t * 2 + it._ph) * .18 }) }) }
    /* meganeura dragonflies over the water */
    { const n = K.n(10), items = [], meshes = [];
      const mm = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .5, side: THREE.DoubleSide });
      for (let i = 0; i < n; i++) items.push({ x: LM.lagoon[0] + (rng() - .5) * 90, z: LM.lagoon[1] + (rng() - .5) * 60, ph: rng() * TAU, r: 6 + rng() * 12 });
      items.forEach(it => { const m = new THREE.Mesh(meganeuraGeo(), mm); m.scale.setScalar(.9 + rng() * .6); ctx.group.add(m); meshes.push(m) });
      ctx.upd.push((dt, t) => { items.forEach((it, i) => { const m = meshes[i];
        m.position.set(it.x + Math.cos(t * .5 + it.ph) * it.r, (H(it.x, it.z) < 0 ? 1.6 : Math.max(H(it.x, it.z), 0)) + 2.4 + Math.sin(t * 1.3 + it.ph) * 1.2, it.z + Math.sin(t * .6 + it.ph) * it.r);
        m.rotation.y = -t * .5 - it.ph + Math.PI }) }) }
    /* insect swarm motes above the herds (prehistoric gnats) */
    K.motes(ctx, { n: 60, x: dv[0], z: dv[1], r: 60, y0: 1, y1: 7, cols: [0xffe8a8, 0xd8ffca], size: 2.4, speed: .7, alpha: .5, H: (x, z) => H(x, z) });

    /* ---------- Crystal Cave (entrance on the ridge foot, glowing from within) ---------- */
    { const cx0 = LM.crystalCave[0], cz0 = LM.crystalCave[1], h0 = H(cx0, cz0);
      const arch = new THREE.Mesh(new THREE.SphereGeometry(7, 10, 7, 0, TAU, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x4a4438, roughness: .95, side: THREE.DoubleSide }));
      arch.position.set(cx0, h0 - .4, cz0); ctx.group.add(arch);
      const cryM = new THREE.MeshStandardMaterial({ map: crystalTex(), emissive: 0x5ad8ff, emissiveIntensity: .8, roughness: .2, metalness: .1 });
      for (let i = 0; i < 26; i++) { const a = rng() * TAU, r = rng() * 24, x = cx0 + Math.cos(a) * r - 30, z = cz0 + Math.sin(a) * r - 18;
        const y = H(x, z), s = .8 + rng() * 2.6;
        B.cave.add(cryM, BG.oct, 0xffffff, M(x, y + s * .5, z, s * .4, s, s * .4, 0, rng() * 3, (rng() - .5) * .5), 1) }
      const light = new THREE.PointLight(0x5ad8ff, 1.2, 40); light.position.set(cx0 - 28, h0 + 3, cz0 - 14); ctx.group.add(light);
      K.motes(ctx, { n: 30, x: cx0 - 26, z: cz0 - 14, r: 12, y0: 0, y1: 6, cols: [0x5ad8ff, 0xc86aff], size: 3, speed: .3, alpha: .8, H: (x, z) => H(x, z) });
      ctx.sign('CRYSTAL CAVE', cx0 + 8, H(cx0 + 8, cz0 + 8) + 3.2, cz0 + 8, Math.PI / 4, 5, '#5ad8ff', { posts: true });
      ctx.cols.push([cx0 - 5, cx0 + 5, cz0 - 5, cz0 + 5]); }

    /* ---------- Nesting Cliffs detail: nests + eggs on the terraces ---------- */
    { const nx = LM.nestingCliffs[0], nz = LM.nestingCliffs[1];
      for (let i = 0; i < 7; i++) { const x = nx + (rng() - .5) * 90, z = nz + (rng() - .5) * 46, h = H(x, z); if (h < 10) continue;
        B.rock.add(cliffM, BG.hem, 0x8a7a5a, M(x, h, z, 2.4 + rng(), .8, 2.4 + rng(), 0, rng() * 3, 0));
        for (let k = 0; k < 3; k++) B.rock.add(cliffM, BG.sphL, 0xe8dcc0, M(x + (rng() - .5), h + .5, z + (rng() - .5), .45, .55, .45), 0) }
      ctx.sign('NESTING CLIFFS', nx - 26, H(nx - 26, nz + 30) + 3.4, nz + 30, 0, 5.5, '#ffb04a', { posts: true }); }

    /* ---------- prehistoric palm groves on the coastal plain ---------- */
    { const palmGeo = K.species.palm(0x6a4a28, 0x3a9a4a), items = [], N = K.n([30, 55, 80][q]);
      for (let i = 0; i < N * 5 && items.length < N; i++) { const x = XMIN + 30 + rng() * (GW - 60), z = ZMIN + 30 + rng() * (GD - 60);
        const h = H(x, z); if (h < .8 || h > 6) continue; if (Math.abs(canyonDist(x, z)) < 8) continue;
        items.push({ x, y: h, z, s: 1.6 + rng() * 1.6, ry: rng() * TAU }) }
      K.scatter(ctx, palmGeo, plantMatS, items, { far: 220, cell: 100 }); }

    /* ---------- the TIME GATE (tiny futuristic portal on the NW headland) ---------- */
    const GT = LM.gate, gy = H(GT[0], GT[1]);
    { const gx = GT[0], gz = GT[1];
      /* pad */
      B.portal.add(std(0x8a929c, .4, .5), BG.cyl, 0xc8d0d8, M(gx, gy + .12, gz, 6.5, .22, 6.5), .25);
      B.portal.add(std(0x38e8ff, .3, .2, 0x38e8ff, 1.1), TOR, 0x7af0ff, M(gx, gy + .3, gz, 5.6, 5.6, 5.6, -Math.PI / 2, 0, 0), 1);
      /* two slim pylons with glowing rings */
      for (const s of [-1, 1]) { B.portal.add(std(0x2a3440, .4, .6), BG.cyl, 0x3a4650, M(gx + s * 3.4, gy + 2.6, gz, .5, 5.2, .5), 0);
        B.portal.add(std(0x38e8ff, .3, .2, 0x38e8ff, 1.4), TOR, 0x7af0ff, M(gx + s * 3.4, gy + 5.0, gz, 1.1, 1.1, 1.1, 0, 0, 0), 1) }
      /* the shimmer: a translucent disc that hums */
      const shimmer = new THREE.Mesh(new THREE.CircleGeometry(4.4, 32), new THREE.MeshBasicMaterial({ color: 0x38e8ff, transparent: true, opacity: .22, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      shimmer.position.set(gx, gy + 4.0, gz); ctx.group.add(shimmer);
      ctx.upd.push((dt, t) => { shimmer.material.opacity = .18 + Math.sin(t * 2.2) * .07 + Math.sin(t * 3.7) * .04; shimmer.rotation.z = t * .2 });
      K.motes(ctx, { n: 26, x: gx, z: gz, r: 5, y0: 0, y1: 7, cols: [0x7af0ff, 0xd8a8ff], size: 3, speed: .5, alpha: .85, H: () => gy });
      /* thinSci-Fi awning + step */
      B.portal.add(std(0x8a929c, .4, .6), BG.box, 0x5a6470, M(gx, gy + 7.6, gz + 3.2, 9.5, .3, 2.6), .1);
      for (const s of [-1, 1]) B.portal.add(std(0x2a3440, .4, .6), BG.cyl, 0x3a4650, M(gx + s * 4.2, gy + 3.8, gz + 3.2, .4, 7.6, .4), 0);
      /* glowing panel with the title */
      const titleM = new THREE.MeshBasicMaterial({ map: titleTex(), transparent: true });
      const title = new THREE.Mesh(AV.G.pln, titleM); title.scale.set(9, 4.5, 1); title.position.set(gx, gy + 9.4, gz + 4.6); ctx.group.add(title);
      ctx.upd.push(() => { title.material.opacity = .8 + (AV.nightK || 0) * .2 });
      function titleTex() { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 256; const c = cv.getContext('2d');
        c.clearRect(0, 0, 512, 256); const g = c.createLinearGradient(0, 0, 0, 256);
        g.addColorStop(0, 'rgba(10,30,50,.85)'); g.addColorStop(1, 'rgba(6,14,30,.9)'); c.fillStyle = g;
        c.beginPath(); c.roundRect(8, 8, 496, 240, 18); c.fill();
        c.strokeStyle = '#38e8ff'; c.lineWidth = 4; c.stroke();
        c.fillStyle = '#aef4ff'; c.textAlign = 'center'; c.font = 'bold 44px Arial'; c.fillText('APEVERSE', 256, 96);
        c.fillStyle = '#38e8ff'; c.font = 'bold 30px Arial'; c.fillText('JURASSIC KOH SAMUI', 256, 150);
        c.fillStyle = '#d8f8ff'; c.font = '16px Arial'; c.fillText('TEMPORAL GATE · −150,000,000 YEARS', 256, 196);
        c.fillStyle = 'rgba(120,240,255,.25)'; for (let i = 0; i < 6; i++) c.fillRect(24, 214 + i * 4, 464, 2);
        const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; return t }
      /* interactable: arrive / leave through the gate */
      T(gx, gz + 2, 3.4, () => tr('Time Gate: return to Ape Town', 'Puerta del tiempo: volver a Ape Town'), () => AV.travel('ape_town', 'koh_samui_jurassic'));
      ctx.circles.push([gx + 3.6, gz, .6], [gx - 3.6, gz, .6]);
      /* E near the gate also travels (mirrors the Da Nang portal behaviour) */
      const prevE = AV.keymap.KeyE;
      AV.keymap.KeyE = e => { if (AV.W && AV.W.id === 'koh_samui_jurassic' && Math.hypot(AV.P.x - gx, AV.P.z - gz) < 5) { AV.travel('ape_town', 'koh_samui_jurassic'); return } if (prevE) prevE(e) };
      ctx.leave.push(() => { if (AV.keymap.KeyE === gateE) AV.keymap.KeyE = prevE });
      function gateE(e) { if (AV.W && AV.W.id === 'koh_samui_jurassic' && Math.hypot(AV.P.x - gx, AV.P.z - gz) < 5) { AV.travel('ape_town', 'koh_samui_jurassic'); return } if (prevE) prevE(e) } }

    /* ---------- hand-painted landmark signs (ctx.sign, psychedelic) ---------- */
    const signAt = (txt, lm, col, ry) => { const [x, z] = lm, h = H(x, z);
      ctx.sign(txt, x + 4, h + 3.4, z + 4, ry == null ? Math.PI / 4 : ry, 5.5, col, { posts: true }) };
    signAt('DINO VALLEY', dv, '#7aff9a');
    signAt('FERN CATHEDRAL', LM.fernCathedral, '#4affd8');
    signAt('GREAT LAGOON', [LM.lagoon[0] - 40, LM.lagoon[1] - 24], '#7ad8ff', -Math.PI / 4);
    signAt('RIVER CANYON', [LM.canyon[0] + 6, LM.canyon[1] + 12], '#ffd84a');
    /* Crystal Cave + Nesting Cliffs already have signs above */

    /* ---------- interactions ---------- */
    T(dv[0], dv[1] + 6, 6, () => tr('Watch the sauropod herd', 'Observar a la manada de saurópodos'), () => {
      AV.toast(tr('A bull sauropod lifts its head above the ferns and calls. The ground hums.', 'Un saurópodo alza la cabeza entre los helechos y llama. El suelo vibra.'));
      AV.audio && AV.audio.blip(82, 1.2, 'sine', .3); });
    T(LM.lagoon[0] - 30, LM.lagoon[1] - 18, 5, () => tr('Swim in the Great Lagoon', 'Nadar en la Gran Laguna'), () => {
      AV.toast(tr('The lagoon is bathtub-warm and impossibly turquoise.', 'La laguna está caliente como una bañera y es turquesa imposible.')); });
    T(LM.crystalCave[0] - 28, LM.crystalCave[1] - 14, 5, () => tr('Enter the Crystal Cave', 'Entrar en la Cueva de Cristal'), () => {
      AV.audio && AV.audio.blip(1318, .6, 'sine', .12);
      AV.toast(tr('Crystals chime as you pass. Some of them are… breathing?', 'Los cristales repican al pasar. ¿Algunos… respiran?')); });
    T(LM.nestingCliffs[0] - 26, LM.nestingCliffs[1] + 30, 5, () => tr('Watch the nests (from a distance)', 'Observar los nidos (a distancia)'), () => {
      AV.toast(tr('A mother stegosaurus checks the eggs. You keep very still.', 'Una madre estegosaurio revisa los huevos. Te quedas muy quieto.')); });
    T(LM.fernCathedral[0], LM.fernCathedral[1], 6, () => tr('Listen to the Fern Cathedral', 'Escuchar la Catedral de Helechos'), () => {
      AV.audio && AV.audio.blip(523, .9, 'sine', .14);
      AV.toast(tr('Light shafts hum through the fronds like organ pipes.', 'Los rayos de luz zumban entre las frondas como tubos de órgano.')); });
    T(LM.canopy[0] + 20, LM.canopy[1] - 40, 5, () => tr('Climb the High Canopy Trail', 'Subir el Sendero del Dosel'), () => {
      AV.toast(tr('From the ridge you can see the whole island — and pterosaurs below you.', 'Desde la cresta se ve toda la isla, y pterosaurios por debajo.')); });

    /* ---------- swimming ---------- */
    ctx.upd.push((dt, t) => { const P = AV.P; if (swim(P.x, P.z)) { AV.cam.position.y = waterY(P.x, P.z) + .3 + Math.sin(t * 1.6) * .06 } });

    /* ---------- flush batches ---------- */
    B.night.flush(ctx, { noShadow: true }); delete B.night;
    B.cave.flush(ctx, { noShadow: false });
    for (const k in B) B[k].flush(ctx);

    const PL = (id, en, es, x, z, yaw) => ({ id, name: [en, es], x, z, yaw });
    return {
      name: 'Jurassic Koh Samui', fog: [110, 620], sky: SKY,
      surface: (x, z) => { if (x < XMIN + 2 || x > XMAX - 2 || z < ZMIN + 2 || z > ZMAX - 2) return null;
        const h = H(x, z), wy = waterY(x, z); return h < wy - 1.6 ? null : Math.max(h, wy - 1.6) },
      speedMul: () => { const P = AV.P; return swim(P.x, P.z) ? .55 : 1 },
      arrivals: { default: { x: GT[0] + 6, z: GT[1] + 6, yaw: Math.PI / 4 }, pipe: { x: GT[0] + 8, z: GT[1] + 2, yaw: Math.PI / 4 }, gate: { x: GT[0] + 5, z: GT[1] + 5, yaw: Math.PI / 4 } },
      defaultArrival: 'default',
      places: [PL('gate', 'Time Gate', 'Puerta del tiempo', GT[0] + 6, GT[1] + 6, Math.PI / 4),
        PL('dino', 'Dino Valley', 'Valle de los Dinos', dv[0], dv[1], Math.PI / 2),
        PL('fern', 'Fern Cathedral', 'Catedral de Helechos', LM.fernCathedral[0], LM.fernCathedral[1], 0),
        PL('lagoon', 'Great Lagoon', 'Gran Laguna', LM.lagoon[0] - 30, LM.lagoon[1] - 20, Math.PI / 2),
        PL('cliffs', 'Nesting Cliffs', 'Acantilados de Nidos', LM.nestingCliffs[0] - 26, LM.nestingCliffs[1] + 30, 0),
        PL('canyon', 'River Canyon', 'Cañón del Río', LM.canyon[0], LM.canyon[1], Math.PI),
        PL('crystal', 'Crystal Cave', 'Cueva de Cristal', LM.crystalCave[0] - 28, LM.crystalCave[1] - 14, Math.PI),
        PL('canopy', 'High Canopy Trail', 'Sendero del Dosel', LM.canopy[0] + 20, LM.canopy[1] - 40, Math.PI)],
      greet: { human: [['You came through the Gate too? Welcome to the Cretaceous… almost.', '¿También viniste por la Puerta? Bienvenido al Cretácico… casi.'], ['Careful near the nests. The mothers do not have a sense of humour.', 'Cuidado con los nidos. Las madres no tienen sentido del humor.']] },
      chatLines: [['No hotels, no roads, no signal — perfect.', 'Sin hoteles, sin carreteras, sin cobertura: perfecto.'], ['The sauropods cross the valley at dusk. Best show on the island.', 'Los saurópodos cruzan el valle al atardecer. El mejor espectáculo de la isla.'], ['The crystals in the cave hum when the volcano rumbles.', 'Los cristales de la cueva zumban cuando el volcán retumba.']],
      musicProfile: { bpm: 72, root: 43, scale: [0, 2, 3, 7, 8], style: 'amb' }
    };
  }
});
AV.ksj = AV.ksj || {};
})(window.AV);
