/* APEVERSE V0.9.2 - world_ape_town.js : Ape Town, rebuilt from the "Apeverse Town – Psychedelic Garden Masterplan".
   North is -z. South: La Finca gateway + market lane -> lotus pond with the Stone Ape Band's lotus stage.
   Centre: Circular Plaza (mosaic + fountain) ringed by café pavilions inside a ring canal crossed by arched bridges.
   North: open-air cinema amphitheatre facing the plaza, Gallery Gardens path around it, La Muria village on the hill.
   NW: cliffs with waterfalls and the giant Stone Ape head. W: Jungle Garden. SW: Temple Garden + south falls.
   E/NE: Stone Ape Tunes (alien band), Crystal Garden, Portal Grove. SE: Desert Garden, Asia Garden (pagoda, koi pond).
   CC0 Quaternius models (palms, flowers, mushrooms, bushes, ferns, twisted trees, arches, boats, benches, crystals, lily pads,
   market stands) are instanced over http; procedural stand-ins are used from file:// and on Low graphics. */
'use strict';
(function (AV) {
const tr = AV.tr, TAU = AV.TAU, C = AV.chars, M = AV.media, K = AV.kit, A = AV.arch;
const DRINKS = ['Nebula Fizz', 'Cosmic Cola', 'Mushroom Mocha'];
let shift = null;
AV.pour = function (d) {
  if (!shift) return;
  if (d === shift.d) { if (!AV.txn(15, 'Served ' + DRINKS[d])) return; AV.audio && AV.audio.blip(880, .15); shift.n++; if (shift.n >= 5) { AV.txn(25, 'Shift tips'); AV.dlg && AV.dlg.event('shift_done'); AV.toast(tr('Shift done. +25 tips.', 'Turno terminado. +25 de propinas.')); shift = null; AV.$('pb').style.display = 'none' } else nextOrder() }
  else { AV.toast(tr('Wrong drink.', 'Bebida equivocada.')); AV.audio && AV.audio.blip(180, .25, 'sawtooth', .15) }
};
function nextOrder() { shift.d = Math.random() * 3 | 0; AV.toast(tr('Customer wants: ', 'Cliente pide: ') + DRINKS[shift.d] + tr('  (keys 1 / 2 / 3: Fizz / Cola / Mocha)', '  (teclas 1 / 2 / 3: Fizz / Cola / Moca)')) }
['Digit1', 'Digit2', 'Digit3'].forEach((k, i) => AV.keymap[k] = () => AV.pour(i));

/* ======================= layout ======================= */
const S = 300, RING0 = 36, RING1 = 42, POND = { x: 0, z: 68, r: 15 };
const POOLS = [{ x: -80, z: -60, r: 10 }, { x: -74, z: 76, r: 6 }, { x: 40, z: 80, r: 5 }, { x: -56, z: 50, r: 3.5 }];
const STREAM = [[-72, -56], [-58, -46], [-44, -37], [-32, -30]], SW = 2.4;
const deg = d => d * Math.PI / 180, polar = (a, r) => [Math.cos(a) * r, Math.sin(a) * r];
const faceYaw = (fx, fz, tx, tz) => Math.atan2(-(tx - fx), -(tz - fz));      // player yaw looking from f to t
const npcYaw = (fx, fz, tx, tz) => Math.atan2(tx - fx, tz - fz);            // NPC/model rotation facing t
const ell = (x, z) => (x / 122) ** 2 + (z > 0 ? (z / 114) ** 2 : (z / 124) ** 2);
const sstep = (a, b, v) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t) };
function segDist(x, z, a, b) { const dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz))); return Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t) }
function H(x, z) {
  let h = 0;
  if (z < -92) h += Math.min(6, (-92 - z) * .28);                                            // La Muria hill
  const cw = -90 - x; if (cw > 0 && z < 40) h += Math.min(26, cw * cw * .6 + cw * 1.6) * sstep(40, 20, z);   // NW/W cliffs
  const ds = Math.hypot(x + 90, z - 90); if (ds < 20) h += (20 - ds) * 1.2;                   // SW cliff
  const e = ell(x, z); if (e > .88) h += Math.min(12, (e - .88) * 45);                                      // rim hills
  const r = Math.hypot(x, z); if (r > 92) h += (Math.sin(x * .07) * Math.cos(z * .06) * .5 + Math.sin(x * .19 + z * .13) * .15) * Math.min(1, (r - 92) / 12);
  return h;
}
function waterDepth(x, z) {   // >0 inside water (metres from the edge)
  let d = -9; const r = Math.hypot(x, z); d = Math.max(d, Math.min(r - RING0, RING1 - r)); d = Math.max(d, POND.r - Math.hypot(x - POND.x, z - POND.z));
  for (const p of POOLS) d = Math.max(d, p.r - Math.hypot(x - p.x, z - p.z));
  for (let i = 0; i < STREAM.length - 1; i++) d = Math.max(d, SW - segDist(x, z, STREAM[i], STREAM[i + 1])); return d;
}
const GALLERY = [[-24, -52], [-31, -62], [-32, -76], [-26, -90], [-13, -98], [0, -100], [13, -98], [26, -90], [32, -76], [31, -62], [24, -52]];
const ROADS = [
  { ring: 46.5, w: 5.5 }, { ring: 12, cx: 68, cz: -68, w: 3 },
  { pts: [[0, -43], [0, -52]], w: 5 }, { pts: [[29, -29], [50, -50], [60, -60]], w: 4.5 }, { pts: [[43, 0], [66, 4], [84, 10]], w: 4.5 }, { pts: [[62, 3], [76, -14], [84, -26]], w: 3.5 },
  { pts: [[-43, 0], [-66, 2], [-82, 4]], w: 4.5 }, { pts: [[-62, 2], [-61, -30], [-61, -43], [-61, -53], [-66, -58]], w: 3.5 }, { pts: [[-29, 29], [-48, 38], [-60, 42]], w: 4 }, { pts: [[-60, 44], [-68, 60], [-70, 70]], w: 3 },
  { pts: [[29, 29], [42, 46], [46, 66], [50, 80]], w: 4 }, { pts: [[42, 46], [64, 48], [78, 48]], w: 3.5 },
  { pts: [[0, 43], [0, 52]], w: 7 }, { pts: [[-6, 52], [-19, 58], [-22, 70], [-17, 84], [-6, 90]], w: 4 }, { pts: [[6, 52], [19, 58], [22, 70], [17, 84], [6, 90]], w: 4 },
  { pts: [[-44, 93], [44, 93]], w: 6 }, { pts: GALLERY, w: 3.6 }, { pts: [[0, -100], [0, -110]], w: 3.5 }, { pts: [[-38, -110], [38, -110]], w: 4 }
];
function roadDist(x, z) { let d = 1e9; for (const r of ROADS) { if (r.ring) d = Math.min(d, Math.abs(Math.hypot(x - (r.cx || 0), z - (r.cz || 0)) - r.ring) - r.w / 2); else for (let i = 0; i < r.pts.length - 1; i++) d = Math.min(d, segDist(x, z, r.pts[i], r.pts[i + 1]) - r.w / 2) } return d }

/* hand-painted ground (paths, plaza ring, shores, desert, cliffs, meadows) */
let GROUND = null;
function paintGround(N) {
  const cv = document.createElement('canvas'); cv.width = cv.height = N; const c = cv.getContext('2d'), r = AV.rng(42), P = v => (v + S / 2) / S * N, m = N / S;
  c.fillStyle = '#58a03e'; c.fillRect(0, 0, N, N);
  const greens = ['#4f9a3a', '#6ab24a', '#3f8a46', '#7ac25a', '#5aa86a', '#8ab84a', '#4aa070'];
  for (let i = 0; i < 1400; i++) { const x = r() * N, y = r() * N, s = N * (.01 + r() * .04), g = c.createRadialGradient(x, y, 0, x, y, s); g.addColorStop(0, greens[i % greens.length]); g.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha = .35; c.fillStyle = g; c.fillRect(x - s, y - s, s * 2, s * 2) } c.globalAlpha = 1;
  const cell = Math.max(2, N / 512 | 0);
  for (let py = 0; py < N; py += cell) for (let px = 0; px < N; px += cell) {
    const x = px / m - S / 2, z = py / m - S / 2, wd = waterDepth(x, z), h = H(x, z); let col = null;
    if (wd > 0) col = wd > 1.2 ? '#1d5468' : '#2f7a7a'; else if (h > 1.5 && (x < -89 || Math.hypot(x + 90, z - 90) < 15)) col = h > 9 ? '#8a7a9a' : '#9a8a8a'; else if (wd > -1.6) col = '#d8c08a';
    else if (h > 2.5 && ell(x, z) > .9) col = '#3f7a4a';
    else if (x > 64 && x < 96 && z > 34 && z < 64 && Math.hypot((x - 80) / 16, (z - 49) / 14) < 1) col = '#e6c48a';
    else if (Math.hypot(x - 52, z - 84) < 11) col = '#d8d0c0';
    if (col) { c.fillStyle = col; c.fillRect(px, py, cell, cell) }
  }
  c.lineCap = c.lineJoin = 'round';
  for (const rd of ROADS) rd._w = rd.w;
  const drawRoads = (extra, col) => { c.strokeStyle = col; for (const rd of ROADS) { c.lineWidth = (rd._w + extra) * m; c.beginPath(); if (rd.ring) c.arc(P(rd.cx || 0), P(rd.cz || 0), rd.ring * m, 0, TAU); else rd.pts.forEach((p, i) => i ? c.lineTo(P(p[0]), P(p[1])) : c.moveTo(P(p[0]), P(p[1]))); c.stroke() } };
  drawRoads(1.4, '#9a8460'); drawRoads(0, '#e2cfa2'); ROADS.forEach(rd => rd.w = rd._w);
  for (let i = 0; i < 9000; i++) { const x = r() * S - S / 2, z = r() * S - S / 2; if (roadDist(x, z) < -.4) { c.fillStyle = r() < .5 ? 'rgba(120,95,60,.35)' : 'rgba(255,245,220,.4)'; c.beginPath(); c.arc(P(x), P(z), (.15 + r() * .25) * m, 0, TAU); c.fill() } }
  c.fillStyle = '#e8d6aa'; c.beginPath(); c.arc(P(0), P(0), 35 * m, 0, TAU); c.fill();
  c.fillStyle = '#e2cfa2'; c.fillRect(P(-15), P(84), 30 * m, 18 * m); c.fillRect(P(-11), P(44), 22 * m, 9 * m);
  const fl = ['#ff4ad2', '#ffd84a', '#9a7aff', '#ff8a3a', '#7ff0ff', '#ffffff', '#ff6a8a'];
  for (let i = 0; i < 26000; i++) { const x = r() * S - S / 2, z = r() * S - S / 2; if (waterDepth(x, z) > -1.8 || roadDist(x, z) < .6 || Math.hypot(x, z) < 35.5 || ell(x, z) > .95 || x < -91) continue; c.fillStyle = fl[i % fl.length]; c.globalAlpha = .55 + r() * .45; c.beginPath(); c.arc(P(x), P(z), (.12 + r() * .2) * m, 0, TAU); c.fill() } c.globalAlpha = 1;
  const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; t.userData = { keep: true }; return t;
}
/* trampoline mat: dark woven bed, stitched rings, a bright star in the middle */
let BEDTEX = null;
function paintBed(N) {
  const cv = document.createElement('canvas'); cv.width = cv.height = N; const c = cv.getContext('2d'), h = N / 2;
  const g = c.createRadialGradient(h, h, 0, h, h, h); g.addColorStop(0, '#2a2448'); g.addColorStop(1, '#141024'); c.fillStyle = g; c.fillRect(0, 0, N, N);
  c.strokeStyle = 'rgba(255,255,255,.05)'; c.lineWidth = 1; for (let i = 0; i < N; i += 4) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, N); c.moveTo(0, i); c.lineTo(N, i); c.stroke() }
  c.setLineDash([6, 5]); c.lineWidth = 3; [[.94, '#ffd84a'], [.62, '#7ff0ff'], [.32, '#ff6ad5']].forEach(([f, col]) => { c.strokeStyle = col; c.beginPath(); c.arc(h, h, h * f, 0, TAU); c.stroke() }); c.setLineDash([]);
  c.fillStyle = '#ffd84a'; c.beginPath(); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU - Math.PI / 2, r = h * (i % 2 ? .08 : .2); c.lineTo(h + Math.cos(a) * r, h + Math.sin(a) * r) } c.closePath(); c.fill();
  const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; t.userData = { keep: true }; return t;
}

AV.registerWorld({
  id: 'ape_town',
  build(ctx) {
    const q = ctx.q, rng = ctx.rng, grp = ctx.group, MT = A.mats(), walk = A.walk(), occ = [];
    const B = { core: K.batch(), south: K.batch(), north: K.batch(), west: K.batch(), east: K.batch(), sky: K.batch() };
    const isWater = (x, z) => waterDepth(x, z) > 0;
    const free = (x, z, pad) => ell(x, z) < 1 && waterDepth(x, z) < -1.2 && roadDist(x, z) > (pad || .8) && !occ.some(o => Math.hypot(x - o[0], z - o[1]) < o[2]);
    const sign = (txt, x, z, ry, w, col, h) => ctx.sign(txt, x, H(x, z) + (h || 3.2), z, ry, w, col, { posts: true });
    M.resetFrames();

    /* ---------- terrain mesh with painted ground + detail grain ---------- */
    const seg = [90, 130, 160][q], tg = new THREE.PlaneGeometry(S, S, seg, seg); tg.rotateX(-Math.PI / 2);
    const tp = tg.attributes.position; for (let i = 0; i < tp.count; i++) { const x = tp.getX(i), z = tp.getZ(i), wd = waterDepth(x, z); tp.setY(i, H(x, z) - (wd > -.4 ? 1.9 * sstep(-.4, 1.4, wd) : 0)) } tg.computeVertexNormals();
    if (!GROUND || GROUND.image.width !== [1024, 2048, 2048][q]) GROUND = paintGround([1024, 2048, 2048][q]);
    const gmat = new THREE.MeshStandardMaterial({ map: GROUND, roughness: .95 }); const grain = A.tex('grain');
    gmat.onBeforeCompile = sh => { sh.uniforms.detailMap = { value: grain }; sh.fragmentShader = 'uniform sampler2D detailMap;\n' + sh.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n diffuseColor.rgb *= mix(1.0, texture2D(detailMap, vUv * 110.0).r * 1.45, .55);') };
    gmat.customProgramCacheKey = () => 'apeGround'; gmat.userData.lin = 1; const ground = new THREE.Mesh(tg, gmat); ground.receiveShadow = true; grp.add(ground);
    A.mountains(ctx, 215, 44, 35, 95, [0x8a6ab8, 0x6a7ac8, 0xb07ab8, 0x7a8ad8, 0x9a7ac8]);
    { const sk = new THREE.RingGeometry(128, 420, 96, 6); sk.rotateX(-Math.PI / 2); const sp = sk.attributes.position; for (let i = 0; i < sp.count; i++) { const r = Math.hypot(sp.getX(i), sp.getZ(i)); sp.setY(i, 10.5 + (r - 128) * .04) } sk.computeVertexNormals(); const skm = new THREE.Mesh(sk, AV.std(0x4a8a4a, 1)); skm.receiveShadow = true; grp.add(skm) }

    /* ---------- water: ring canal, lotus pond, pools, stream ---------- */
    const wopt = { deep: 0x1a4aa0, shallow: 0x3ad8e8, sky: 0xffb0e8, iri: .35, opacity: .9 };
    K.waterPlane(ctx, new THREE.RingGeometry(RING0 - .6, RING1 + .6, 128, 1), -.35, wopt);
    const pond = K.waterPlane(ctx, new THREE.CircleGeometry(POND.r + .6, 80), -.35, wopt); pond.position.x = POND.x; pond.position.z = POND.z;
    POOLS.forEach(p => { const w = K.waterPlane(ctx, new THREE.CircleGeometry(p.r + .6, 48), -.35, wopt); w.position.x = p.x; w.position.z = p.z });
    { const pts = [], idx = []; for (let i = 0; i < STREAM.length; i++) { const a = STREAM[Math.max(0, i - 1)], b = STREAM[Math.min(STREAM.length - 1, i + 1)], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz), nx = -dz / l * (SW + .6), nz = dx / l * (SW + .6); pts.push(STREAM[i][0] + nx, 0, STREAM[i][1] + nz, STREAM[i][0] - nx, 0, STREAM[i][1] - nz); if (i) { const k = i * 2; idx.push(k - 2, k - 1, k, k - 1, k + 1, k) } }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); g.setIndex(idx); const w = new THREE.Mesh(g, K.water(wopt)); w.position.y = -.35; w.renderOrder = 1; grp.add(w) }
    /* stone banks */
    for (const r of [RING0, RING1]) { B.core.add(MT.stone, new THREE.CylinderGeometry(r, r, 1.8, 128, 1, true), 0xd8c4a0, K.M(0, -.65, 0)); B.core.add(MT.stone, new THREE.TorusGeometry(r, .32, 5, 128), 0xe8d4b0, K.M(0, .12, 0, 1, 1, .7, Math.PI / 2, 0, 0)) }
    B.south.add(MT.stone, new THREE.CylinderGeometry(POND.r, POND.r, 1.8, 96, 1, true), 0xd8c4a0, K.M(POND.x, -.65, POND.z)); B.south.add(MT.stone, new THREE.TorusGeometry(POND.r, .32, 5, 96), 0xe8d4b0, K.M(POND.x, .12, POND.z, 1, 1, .7, Math.PI / 2, 0, 0));
    /* bridges over the canal (6) + stream */
    const bridgePairs = [[-90, 'core'], [90, 'core'], [0, 'core'], [180, 'core'], [-45, 'core'], [135, 'core']];
    const BCOL = [[0xff6ad5, 0xfff0e0], [0x7ff0ff, 0xfff0e0], [0xffd84a, 0x9a5cff], [0x7aff9a, 0xfff0e0], [0xb07aff, 0xffd84a], [0xff8a3a, 0xfff0e0]];
    bridgePairs.forEach((bp, i) => { const a = deg(bp[0]), p0 = polar(a, RING0 - 2.4), p1 = polar(a, RING1 + 2.4); A.bridge(B.core, MT, ctx, walk, p0[0], p0[1], p1[0], p1[1], { w: 4.2, rise: 1.5, cRail: BCOL[i][0], cPost: BCOL[i][1] }) });
    A.bridge(B.west, MT, ctx, walk, -61, -41.5, -61, -54.5, { w: 3.4, rise: 1.1, cRail: 0x7aff9a });

    /* ---------- Circular Plaza: mosaic, grand fountain, lamps, benches ---------- */
    const mos = new THREE.Mesh(new THREE.CircleGeometry(22, 96), new THREE.MeshStandardMaterial({ map: A.tex('mosaic'), roughness: .8 })); mos.material.userData.lin = 1; mos.rotation.x = -Math.PI / 2; mos.position.y = .04; mos.receiveShadow = true; grp.add(mos);
    const fb = new THREE.LatheGeometry([[0, .0], [4.8, 0], [4.9, .9], [4.4, .95], [4.3, .4], [0, .4]].map(p => new THREE.Vector2(p[0], p[1])), 48); B.core.add(MT.stone, fb, 0xe8d4b0, K.M(0, 0, 0));
    B.core.add(MT.stone, new THREE.LatheGeometry([[.5, 0], [.7, .4], [.5, 1.6], [2.2, 2.2], [2.3, 2.5], [.4, 2.4], [.35, 3.6], [1.2, 4.1], [1.25, 4.3], [.2, 4.2], [0, 4.4]].map(p => new THREE.Vector2(p[0], p[1])), 32), 0xf0e0c0, K.M(0, .4, 0));
    A.lotus(B.core, MT, 0, 4.5, 0, 1.2); B.core.add(MT.v, A.geo('ico'), 0x7ff0ff, K.M(0, 6.2, 0, .5, .8, .5), 1);
    const fw = K.waterPlane(ctx, new THREE.CircleGeometry(4.35, 48), .82, wopt); const jet = new THREE.Mesh(A.geo('sph'), new THREE.MeshBasicMaterial({ color: 0xbff4ff, transparent: true, opacity: .55 })); jet.position.set(0, 3.2, 0); grp.add(jet);
    ctx.circles.push([0, 0, 5.1]); occ.push([0, 0, 6]);
    ctx.upd.push((dt, t) => { jet.scale.set(.5 + Math.sin(t * 3) * .05, 1.5 + Math.sin(t * 2.3) * .3, .5) });
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + .2, p = polar(a, 23.5); lamp(B.core, p[0], p[1], 4.2, i) }
    function lamp(b, x, z, h, i) { const y = H(x, z); b.add(MT.v, A.geo('pillar'), 0x3a2a4a, K.M(x, y, z, .38, h, .38)); b.add(MT.v, A.geo('sph'), [0xffe0a0, 0xffb0e8, 0xb0f0ff][i % 3], K.M(x, y + h + .3, z, .32, .38, .32), 1); b.add(MT.shiny, A.geo('cone'), 0xffd84a, K.M(x, y + h + .8, z, .3, .4, .3), .3); ctx.circles.push([x, z, .25]) }
    const benches = []; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + Math.PI / 8, p = polar(a, 18.5); benches.push({ x: p[0], z: p[1], s: 3, ry: npcYaw(p[0], p[1], 0, 0) }); ctx.circles.push([p[0], p[1], 1.0]) }
    K.instModel(ctx, 'quaternius/bench', benches, it => K.scatter(ctx, K.merge([[A.geo('box'), 0x8a5a3a, K.M(0, .45, 0, 2, .12, .6)], [A.geo('box'), 0x8a5a3a, K.M(0, .8, -.25, 2, .5, .1)], [A.geo('box'), 0x3a2a20, K.M(-.85, .22, 0, .12, .45, .5)], [A.geo('box'), 0x3a2a20, K.M(.85, .22, 0, .12, .45, .5)]]), K.floraMat(0), it.map(b => ({ x: b.x, z: b.z, ry: b.ry, s: 1 })), { shadow: true }));
    sign('CIRCULAR PLAZA', 0, 20.5, 0, 6.5, '#ffd84a', 3.4);

    /* ---------- café pavilions around the plaza ---------- */
    const CAFES = [
      { id: 'vegan', a: -135, name: 'VEGAN CAFÉ', cR: 0xff7ab8, cT: 0xffd84a, cC: 0xfff4e0, roof: 'onion', label: () => tr('Buy a Rainbow Bowl (8 credits)', 'Comprar un Bol Arcoíris (8 créditos)'), cost: 8, what: 'Rainbow Bowl at the Vegan Café', msg: () => tr('Seven colours, seven moods. You feel 12% more photosynthetic.', 'Siete colores, siete estados de ánimo. Te sientes un 12% más fotosintético.') },
      { id: 'food', a: -67.5, name: 'FOOD CAFÉ', cR: 0xff8a3a, cT: 0x7ff0c8, cC: 0xfff0d8, roof: 'dome', label: () => tr('Buy cosmic dumplings (7 credits)', 'Comprar empanadillas cósmicas (7 créditos)'), cost: 7, what: 'Cosmic dumplings at the Food Café', msg: () => tr('Steamed in nebula vapour. Each one tastes like a different planet.', 'Al vapor de nebulosa. Cada una sabe a un planeta distinto.') },
      { id: 'zil', a: -22.5, name: 'ZIL’S CAFÉ · DRINKS BAR', cR: 0x9a5cff, cT: 0xff6ad5, cC: 0xf8e8ff, roof: 'onion' },
      { id: 'vr', a: 112.5, name: 'PSYCHEDELIC VR BAR', cR: 0x4ac8ff, cT: 0xb07aff, cC: 0xe8f4ff, roof: 'tent', label: () => tr('Kaleidoscope booth (4 credits)', 'Cabina caleidoscopio (4 créditos)'), cost: 4, what: 'Kaleidoscope booth at the VR bar', kaleido: true, msg: () => tr('The world folds into a kaleidoscope…', 'El mundo se pliega en un caleidoscopio…') },
      { id: 'chill', a: 157.5, name: 'CHILL CAFÉ · HERBAL TEA', cR: 0x7aff9a, cT: 0xffd84a, cC: 0xf0fff0, roof: 'dome', label: () => tr('Sip a herbal tea (5 credits)', 'Tomar una infusión (5 créditos)'), cost: 5, what: 'Herbal tea at the Chill Café', msg: () => tr('Lemongrass, mint and a hum of the Rhodes. Everything slows down nicely.', 'Hierba limón, menta y el zumbido del Rhodes. Todo se calma con gusto.') }
    ];
    let zilPos = null;
    CAFES.forEach(cf => {
      const a = deg(cf.a), p = polar(a, 29), out = [Math.cos(a), Math.sin(a)];
      A.pavilion(B.core, MT, ctx, walk, { x: p[0], z: p[1], r: 4.6, h: 3.6, n: 8, rh: 4.6, roof: cf.roof, cRoof: cf.cR, cTrim: cf.cT, cCol: cf.cC, ry: a + Math.PI / 8 }); occ.push([p[0], p[1], 6.2]);
      const tg = [-out[1], out[0]], spx = p[0] - out[0] * 6.2 + tg[0] * 4.4, spz = p[1] - out[1] * 6.2 + tg[1] * 4.4; ctx.sign(cf.name, spx, 2.1, spz, npcYaw(spx, spz, 0, 0), 3.4, '#' + cf.cT.toString(16).padStart(6, '0'), { posts: true });
      if (cf.id === 'zil') {
        zilPos = p; A.ringCounter(B.core, MT, ctx, p[0], p[1], 1.8, 2.5, 1.1, a, .9, .45);
        for (let i = 0; i < 5; i++) { const b = a + Math.PI + (i - 2) * .35, s = polar(b, 3.3); B.core.add(MT.v, A.geo('cyl'), 0xb0483a, K.M(p[0] + s[0], .9, p[1] + s[1], .3, .9, .3)) }
        for (let i = 0; i < 9; i++) { const b = a + Math.PI + (i - 4) * .25, s = polar(b, 2.15); B.core.add(MT.v, A.geo('cyl'), [0xff4ad2, 0x7ff0ff, 0xffd84a][i % 3], K.M(p[0] + s[0], 1.75, p[1] + s[1], .06, .25, .06), 1) }
      } else {
        const back = polar(a, 1.4); B.core.add(MT.wood, new THREE.LatheGeometry([[1.6, 0], [2.2, 0], [2.2, 1.05], [2.35, 1.05], [2.35, 1.13], [1.5, 1.13], [1.5, 1.05], [1.6, 1.05], [1.6, 0]].map(v => new THREE.Vector2(v[0], v[1])), 16, Math.PI / 2 - a - .9, 1.8), 0xffffff, K.M(p[0] + back[0], .45, p[1] + back[1]));
        const tpos = polar(a, 25.4); ctx.T.push({ x: tpos[0], z: tpos[1], r: 2.8, label: cf.label, fn: () => { if (AV.txn(-cf.cost, cf.what)) { AV.dlg && AV.dlg.event('food'); AV.toast(cf.msg()); AV.audio && AV.audio.blip(660, .2, 'triangle', .15); if (cf.kaleido) kaleido() } } });
      }
    });
    const zout = [Math.cos(deg(-22.5)), Math.sin(deg(-22.5))];
    AV.npc.spawn(ctx, 'zil', { x: zilPos[0], z: zilPos[1], yaw: npcYaw(zilPos[0], zilPos[1], 0, 0), y: .45, tx: zilPos[0] - zout[0] * 3.4, tz: zilPos[1] - zout[1] * 3.4, r: 3.0 });
    ctx.T.push({ x: zilPos[0] + zout[0] * 2.9, z: zilPos[1] + zout[1] * 2.9, r: 1.6, show: () => AV.S.job, label: () => shift ? tr('Pour the requested drink (1-2-3)', 'Servir la bebida pedida (1-2-3)') : tr('Start a shift (5 drinks)', 'Empezar turno (5 bebidas)'), fn: () => { if (!shift) { shift = { n: 0, d: 0 }; AV.$('pb').style.display = AV.device === 'phone' ? 'flex' : 'none'; nextOrder() } } });
    const vg = polar(deg(-135), 29); AV.npc.spawn(ctx, 'sol', { x: vg[0], z: vg[1], y: .45, yaw: npcYaw(vg[0], vg[1], 0, 0), r: 3.2, tx: polar(deg(-135), 24.6)[0], tz: polar(deg(-135), 24.6)[1] });
    /* Bissap kiosk + evolving market stall (inner ring, SE) */
    const kp = polar(deg(30), 29); A.pavilion(B.core, MT, ctx, walk, { x: kp[0], z: kp[1], r: 1.8, h: 2.6, n: 6, rh: 2.2, roof: 'tent', cRoof: 0xff4a8a, cTrim: 0xffd84a, cCol: 0xffe0f0, lantern: false }); occ.push([kp[0], kp[1], 3.4]);
    B.core.add(MT.v, A.geo('cyl'), 0xa0305a, K.M(kp[0], 1.0, kp[1], 1.1, 1.1, 1.1)); ctx.circles.push([kp[0], kp[1], 1.4]); ctx.sign('BISSAP', kp[0] - Math.cos(deg(30)) * 3.4, 1.6, kp[1] - Math.sin(deg(30)) * 3.4, npcYaw(kp[0], kp[1], 0, 0), 2.2, '#ff8ac0', { posts: true });
    const kt = polar(deg(30), 25.2);
    ctx.T.push({ x: kt[0], z: kt[1], r: 2.6, label: () => tr('Buy a bissap (6 credits)', 'Comprar un bissap (6 créditos)'), fn: () => { if (AV.txn(-6, 'Bissap Abibi at the kiosk')) { const S = AV.S; S.items = S.items || {}; S.items.bissap = (S.items.bissap || 0) + 1; AV.dlg && AV.dlg.event('bissap'); AV.toast(tr('Hibiscus, ginger, a little mischief. You carry one bissap (inventory: I).', 'Hibisco, jengibre y un poco de picardía. Llevas un bissap (inventario: I).')); AV.quests && AV.quests.check() } } });
    if (AV.S.built.stall) { const sp = polar(deg(60), 29); K.instModel(ctx, 'quaternius/cart', [{ x: sp[0], z: sp[1], s: 3, ry: npcYaw(sp[0], sp[1], 0, 0) }], it => K.scatter(ctx, K.merge([[A.geo('box'), 0x4a8aa8, K.M(0, .8, 0, 2.6, 1.6, 1.2)], [A.geo('box'), 0xe0a040, K.M(0, 2.3, 0, 3, .2, 1.6)]]), K.floraMat(0), it)); ctx.circles.push([sp[0], sp[1], 1.6]); occ.push([sp[0], sp[1], 2.6]); const st = polar(deg(60), 25.5); ctx.T.push({ x: st[0], z: st[1], r: 2.4, label: () => tr('Browse the market stall', 'Mirar el puesto'), fn: () => AV.toast(tr('Trinkets, snacks and one very smug parrot.', 'Chucherías, snacks y un loro muy engreído.')) }) }

    /* ---------- LOTUS STAGE + Stone Ape Band (south pond) ---------- */
    const SX = POND.x, SZ = POND.z + 1, SY = 1.35;
    B.south.add(MT.stone, A.geo('disc'), 0xd8c0a0, K.M(SX, SY / 2 - .7, SZ, 6.4, SY + 1.4, 6.4)); B.south.add(MT.v, A.geo('disc'), 0x5a3d7a, K.M(SX, SY + .02, SZ, 6.0, .08, 6.0));
    B.south.add(MT.v, new THREE.TorusGeometry(6.1, .12, 6, 64), 0xffd84a, K.M(SX, SY + .06, SZ, 1, 1, 1, Math.PI / 2, 0, 0), .9);
    A.lotus(B.south, MT, SX, SY - .45, SZ, 8.0, { gap: -Math.PI / 2, gapW: .8, h: .32, rings: 2 });
    B.south.add(MT.roof, A.geo('halfDome'), 0xc07aff, K.M(SX, SY, SZ + 1.2, 7.4, 8.2, 5.6), .25);
    B.south.add(MT.v, new THREE.TorusGeometry(7.4, .22, 8, 40, Math.PI), 0xff6ad5, K.M(SX, SY, SZ + 1.2, 1, 8.2 / 7.4, 1), 1);
    for (const sx of [-4.6, 4.6]) { B.south.add(MT.v, A.geo('box'), 0x16161c, K.M(SX + sx, SY + 1, SZ + 1.6, 1.2, 2, 1.1)); B.south.add(MT.v, A.geo('cyl'), 0x404048, K.M(SX + sx, SY + 1.4, SZ + 1.04, .42, .08, .42, Math.PI / 2, 0, 0)) }
    ctx.circles.push([SX, SZ, 7]);
    const band = [[C.gorilla(), -2.2, 0], [C.ztone(), 0, .5], [C.orangutan(), 2.2, 1]].map(b => { const hold = new THREE.Group(); hold.position.set(SX + b[1], SY, SZ + .4); hold.rotation.y = Math.PI; b[0].userData.baseY = 0; hold.add(b[0]); grp.add(hold); return b });
    const spots = [0xff4ad2, 0x4ac8ff, 0xffd84a].map((c, i) => { const l = new THREE.PointLight(c, 1.4, 16); l.position.set(SX - 3 + i * 3, SY + 6, SZ - 2.5); grp.add(l); return l });
    ctx.upd.push((dt, t) => { const on = AV.audio && AV.audio.ok && AV.audio.on, beat = on ? AV.audio.beat : t * 88 / 60, d = Math.hypot(AV.P.x - SX, AV.P.z - SZ), energy = (ctx.cheer > t ? 1.5 : 1) * (d < 45 ? 1 : .4);
      band.forEach(b => C.animate(b[0], t, beat, energy, b[2] * .5)); spots.forEach((l, i) => l.intensity = 1.0 + Math.abs(Math.sin(beat * Math.PI + i)) * (AV.S.set.reduce ? .4 : 1.2)) });
    /* audience terrace (deck) + dancing crowd */
    B.south.add(MT.wood, A.geo('box'), 0xffffff, K.M(0, .08, 48.5, 22, .16, 9));
    ctx.sign('STONE APE BAND · LOTUS STAGE', -8.5, 2.6, 44.2, Math.PI, 5.5, '#ff8ac0', { posts: true });
    const crowd = []; for (let i = 0; i < 30; i++) { const x = -10 + (i % 10) * 2.2 + (rng() - .5) * .8, z = 47 + (i / 10 | 0) * 1.9 + rng() * .5; if (Math.abs(x) < 3.2) continue; crowd.push([x, .12, z, (rng() - .5) * .6 - x * .03]) }
    /* V0.9.7: the audience is rigged characters (apes, humans, aliens, a frog) dancing on the beat, facing the band; strollers on the promenade */
    { const kinds = ['ape', 'human', 'ape', 'alien', 'human', 'ape', 'frog', 'robot']; AV.beings.spawn(ctx, crowd.slice(0, AV.beings.n(ctx, 8, 14, 20)).map((c, i) => ({ kind: kinds[i % kinds.length], x: c[0], z: c[2], yaw: Math.atan2(SX - c[0], SZ - c[2]), mode: 'dance', seed: i + 3 })));
      AV.beings.spawn(ctx, [['ape', 6, 82], ['human', -6, 76], ['ape', 10, 66], ['robot', -10, 64], ['human', 4, 58], ['alien', -4, 88]].slice(0, AV.beings.n(ctx, 3, 5, 6)).map(([k, x, z], i) => ({ kind: k, x, z, area: { x: 0, z: 72, r: 16 }, seed: 60 + i }))) }
    ctx.T.push({ x: 0, z: 49, r: 4.5, label: () => tr('Tip the band (5 credits) & cheer', 'Dar propina a la banda (5 créditos) y animar'), fn: () => { if (AV.txn(-5, 'Tip: Stone Ape Band')) { ctx.cheer = AV.now() + 8; AV.dlg && AV.dlg.event('tip_band'); AV.toast(tr('Ztonedape nods. The gorilla’s bass gets deeper. The sax goes wild.', 'Ztonedape asiente. El bajo del gorila se hace más profundo. El saxo se desata.')); AV.audio && AV.audio.blip(660, .3, 'triangle', .2) } } });
    const stagePos = { x: SX, y: SY + 1.5, z: SZ };
    ctx.upd.push((() => { let last = -9; return () => { if (AV.now() - last < .4) return; last = AV.now();   /* V0.9.7: real time (slow devices) */ const d = Math.hypot(AV.P.x - SX, AV.P.z - SZ), el = AV.$('concert'), blocked = AV.blocking();
      if (d < 32 && !blocked) { el.style.display = 'block'; const on = AV.audio && AV.audio.on && (AV.audio.ok || AV.audio.track.active), np = AV.audio && AV.audio.nowPlaying && AV.audio.nowPlaying(); el.innerHTML = '♪ <b>Stone Ape Band</b> — ' + tr('live on the Lotus Stage', 'en vivo en el Escenario de Loto') + '<br><small>' + (on && np ? tr('Now playing: ', 'Sonando: ') + '<b>' + np.title + '</b> (' + np.i + '/' + np.n + ') · ' + tr('N = next song. Walk closer: the sound comes from the stage.', 'N = siguiente canción. Acércate: el sonido sale del escenario.') : on ? tr('Boom-bap, tuba bass, Rhodes. Walk closer: the sound is positional.', 'Boom-bap, bajo de tuba, Rhodes. Acércate: el sonido es posicional.') : tr('Music is off — press M or enable it in Settings (O).', 'La música está apagada: pulsa M o actívala en Ajustes (O).')) + '</small>' } else el.style.display = 'none' } })());
    ctx.leave.push(() => { AV.$('concert').style.display = 'none' });
    /* lily pads + lotus flowers on the pond and canal */
    const lilies = []; for (let i = 0; i < 22; i++) { const a = rng() * TAU, r = 9.5 + rng() * 4.5; lilies.push({ x: POND.x + Math.cos(a) * r, y: -.33, z: POND.z + Math.sin(a) * r, s: 1.4 + rng(), ry: rng() * TAU }) }
    for (let i = 0; i < 18; i++) { const a = rng() * TAU, r = RING0 + 1.2 + rng() * 3.6; if (bridgePairs.some(b => Math.abs(Math.atan2(Math.sin(a - deg(b[0])), Math.cos(a - deg(b[0])))) < .12)) continue; lilies.push({ x: Math.cos(a) * r, y: -.33, z: Math.sin(a) * r, s: 1.2 + rng(), ry: rng() * TAU }) }
    K.instModel(ctx, 'quaternius/lilypad', lilies, it => K.scatter(ctx, K.species.lotus(0xffa0d8, 0x2f8a4a), K.floraMat(0, { double: true }), it.map(o => Object.assign({}, o, { s: o.s * .7 })), { shadow: false }), { shadow: false });
    /* boats gliding on the ring canal and pond */
    const boats = [0, 2.1, 4.2].map((ph, i) => ({ g: AV.assets.model(ctx, i % 2 ? 'quaternius/boat_a' : 'quaternius/boat_b', gg => boatFallback(gg, [0xff6ad5, 0x7ff0ff, 0xffd84a][i]), 0, -.3, 0, 0, i % 2 ? .42 : 4.6), ph, r: 39, sp: .05 + i * .012 }));
    boats.push({ g: AV.assets.model(ctx, 'quaternius/boat_b', gg => boatFallback(gg, 0xb07aff), 0, -.3, 0, 0, 4.6), ph: 1, r: 11.5, sp: -.07, cx: POND.x, cz: POND.z });
    function boatFallback(gg, col) { const inner = new THREE.Group(); inner.scale.setScalar(1 / gg.scale.x); const hull = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 6, 0, TAU, Math.PI / 2, Math.PI / 2), AV.std(0x8a5a3a, .7)); hull.scale.set(.75, .5, 1.7); hull.position.y = .3; inner.add(hull); const rim = new THREE.Mesh(new THREE.TorusGeometry(1, .06, 6, 20), AV.std(col, .5, 0, col, .4)); rim.scale.set(.75, 1.7, 1); rim.rotation.x = Math.PI / 2; rim.position.y = .3; inner.add(rim); AV.lin(inner); gg.add(inner); return inner }
    ctx.upd.push((dt, t) => boats.forEach(b => { const a = b.ph + t * b.sp, x = (b.cx || 0) + Math.cos(a) * b.r, z = (b.cz || 0) + Math.sin(a) * b.r; b.g.position.set(x, -.32 + Math.sin(t * 1.7 + b.ph) * .04, z); b.g.rotation.y = -a + (b.sp > 0 ? 0 : Math.PI); b.g.rotation.z = Math.sin(t * 1.3 + b.ph) * .04 }));

    /* ---------- LA FINCA gateway + market lane ---------- */
    const FZ = 104;
    for (const sx of [-1, 1]) {
      const tx = sx * 7.5; B.south.add(MT.stone, A.geo('box'), 0xe8d0a8, K.M(tx, H(tx, FZ) + 4.5, FZ, 4, 9, 4)); A.pavilion(B.south, MT, ctx, walk, { x: tx, z: FZ, y: H(tx, FZ) + 9, r: 1.9, h: 2, n: 6, rh: 2.8, roof: 'onion', cRoof: sx < 0 ? 0xff6ad5 : 0x9a5cff, cTrim: 0xffd84a, cCol: 0xfff0e0, lantern: false });
      ctx.cols.push([tx - 2, tx + 2, FZ - 2, FZ + 2]);
      for (let k = 0; k < 3; k++) { const wx = sx * (14 + k * 9); B.south.add(MT.stone, A.geo('box'), 0xe0c8a0, K.M(wx, H(wx, FZ) + 1.6, FZ + .5, 9, 3.2, 1.2)); B.south.add(MT.v, A.geo('box'), [0xff6ad5, 0x7ff0c8, 0xffd84a][k], K.M(wx, H(wx, FZ) + 3.3, FZ + .5, 9.2, .3, 1.4), .3); ctx.cols.push([wx - 4.5, wx + 4.5, FZ - .1, FZ + 1.1]) }
    }
    B.south.add(MT.v, new THREE.TorusGeometry(5.5, .55, 10, 40, Math.PI), 0xffd84a, K.M(0, 8.2, FZ, 1, .7, 1), .5); B.south.add(MT.stone, A.geo('box'), 0xe8d0a8, K.M(0, 10.6, FZ, 19, 1.2, 4)); B.south.add(MT.roof, A.geo('dome'), 0x7ff0c8, K.M(0, 11.2, FZ, 4, 4.5, 4), .2); B.south.add(MT.v, A.geo('ico'), 0xff6ad5, K.M(0, 16.3, FZ, .6, .9, .6), 1);
    ctx.sign('LA FINCA', 0, 7.4, FZ - 2.05, 0, 6.5, '#7ff0c8'); ctx.sign('APE TOWN', 0, 7.4, FZ + 2.05, Math.PI, 6.5, '#ffb04a');
    K.lanterns(ctx, [[-30, 5, 93], [-15, 4.4, 92], [0, 6.2, 93], [15, 4.4, 92], [30, 5, 93]], {});
    const stands = [[-34, 90, 0, 'crisps'], [-22, 90, 0, 'cards'], [22, 96.5, Math.PI, 'beads'], [34, 96.5, Math.PI, null], [-28, 96.5, Math.PI, null]];
    K.instModel(ctx, 'quaternius/market_stand', stands.map(s => ({ x: s[0], y: H(s[0], s[1]), z: s[1], s: 3.2, ry: s[2] })), it => K.scatter(ctx, K.merge([[A.geo('box'), 0x8a5a3a, K.M(0, .5, 0, 2.6, 1, 1.4)], [A.geo('cone4'), 0xff6ad5, K.M(0, 2.6, 0, 2.2, .9, 1.4, 0, Math.PI / 4, 0)], [A.geo('cyl6'), 0x6a4a2a, K.M(-1.2, 1.4, 0, .07, 2.4, .07)], [A.geo('cyl6'), 0x6a4a2a, K.M(1.2, 1.4, 0, .07, 2.4, .07)]]), K.floraMat(0), it.map(o => Object.assign({}, o, { s: 1 }))));
    K.instModel(ctx, 'quaternius/cart', [{ x: 8, y: H(8, 90), z: 89.5, s: 3, ry: .4 }, { x: -40, y: H(-40, 93), z: 95.5, s: 3, ry: 2.6 }], it => K.scatter(ctx, K.merge([[A.geo('box'), 0x8a5a3a, K.M(0, .8, 0, 1.6, .8, 1)], [A.geo('box'), 0xffd84a, K.M(0, 2, 0, 1.9, .1, 1.3)]]), K.floraMat(0), it.map(o => Object.assign({}, o, { s: 1 }))));
    stands.concat([[8, 89.5], [-40, 95.5]]).forEach(s => { ctx.circles.push([s[0], s[1], 1.7]); occ.push([s[0], s[1], 2.6]) });
    const SHOP = { crisps: [4, () => tr('Buy mushroom crisps (4 credits)', 'Comprar chips de seta (4 créditos)'), 'Mushroom crisps', 'crisps', () => tr('Crunchy, earthy, suspiciously moreish.', 'Crujientes, terrosas y sospechosamente adictivas.')], cards: [3, () => tr('Buy an Ape Town postcard (3 credits)', 'Comprar una postal de Ape Town (3 créditos)'), 'Ape Town postcard', 'postcard', () => tr('A painted postcard of the lotus stage. Send it to another universe!', 'Una postal pintada del escenario de loto. ¡Mándala a otro universo!')], beads: [5, () => tr('Buy glow beads (5 credits)', 'Comprar cuentas brillantes (5 créditos)'), 'Glow beads', 'beads', () => tr('They glow. That’s the whole pitch. It’s a good pitch.', 'Brillan. Ese es todo el discurso. Es un buen discurso.')] };
    stands.forEach(s => { if (!s[3]) return; const it = SHOP[s[3]], tz = s[1] + (s[2] ? -2.6 : 2.6); ctx.T.push({ x: s[0], z: tz, r: 2.2, label: it[1], fn: () => { if (AV.txn(-it[0], it[2] + ' at the market')) { const S = AV.S; S.items = S.items || {}; S.items[it[3]] = (S.items[it[3]] || 0) + 1; AV.dlg && AV.dlg.event('shop'); AV.toast(it[4]()) } } }) });
    AV.npc.spawn(ctx, 'kiko', { x: -28, z: 92.6, H, yaw: 0, r: 3 });
    AV.npc.spawn(ctx, 'pip', { x: 6, z: 97, H, yaw: npcYaw(6, 97, 0, 80), r: 3, path: [[6, 97, 6], [10, 92, 3], [4, 88, 5], [-6, 92, 3]] });

    /* ---------- CINEMA amphitheatre (north, facing the plaza) ---------- */
    const CZ = -80, CW = 22, CH = CW * 9 / 16;
    M.cinemaScreen(ctx, 0, 3 + CH / 2, CZ, 0, CW, { radius: 55, name: tr('APE TOWN OUTDOOR CINEMA', 'CINE AL AIRE LIBRE DE APE TOWN'), glow: 0xff6ad5, tags: ['lcb', 'mv'] });   /* V0.9.7: The Last Classic Bangers in order + ZtonedApe music videos + shorts */
    for (const sx of [-1, 1]) { const tx = sx * (CW / 2 + 2.4); B.north.add(MT.stone, A.geo('box'), 0xe0c8a8, K.M(tx, 8, CZ - .4, 3.4, 16, 3)); A.pavilion(B.north, MT, ctx, walk, { x: tx, z: CZ - .4, y: 16, r: 1.6, h: 1.8, n: 6, rh: 2.6, roof: 'onion', cRoof: 0xff6ad5, cTrim: 0xffd84a, lantern: false }); ctx.cols.push([tx - 1.7, tx + 1.7, CZ - 1.9, CZ + 1.1]) }
    B.north.add(MT.v, new THREE.TorusGeometry(CW / 2 + 2.4, .4, 8, 48, Math.PI), 0xffd84a, K.M(0, 16, CZ - .3, 1, .42, 1), .7);
    B.north.add(MT.stone, A.geo('box'), 0x3a2a4a, K.M(0, 8, CZ - 1.5, CW + 4, 16, .6)); ctx.cols.push([-CW / 2 - 1, CW / 2 + 1, CZ - 1.9, CZ - .9]);
    ctx.sign('OUTDOOR CINEMA', 0, 22.5, CZ - .2, 0, 10, '#7ff0ff');
    A.benchRows(B.north, MT, ctx, 0, CZ, 16, 5, 2.7, deg(40), deg(46), 0x9a5cff); A.benchRows(B.north, MT, ctx, 0, CZ, 16, 5, 2.7, deg(94), deg(46), 0x9a5cff);
    occ.push([0, CZ + 10, 20]);
    B.north.add(MT.v, A.geo('box'), 0x9a5cff, K.M(7.5, 1.2, -47.5, 2.2, 2.4, 1.6)); B.north.add(MT.roof, A.geo('tent'), 0xffd84a, K.M(7.5, 2.4, -47.5, 1.8, 1.4, 1.8)); ctx.circles.push([7.5, -47.5, 1.4]);
    ctx.T.push({ x: 7.5, z: -45.3, r: 2.6, label: () => tr('Cinema programme (choose a film)', 'Programa del cine (elegir película)'), fn: () => { AV.dlg && AV.dlg.event('cinema'); M.openCinema() } });

    /* ---------- GALLERY GARDENS: winding path around the cinema with living paintings ---------- */
    const list = M.placementsFor('ape_town'), shown = list.filter(p => p.status === 'present').concat(list.filter(p => p.status !== 'present'));
    const segL = []; let tot = 0; for (let i = 0; i < GALLERY.length - 1; i++) { const l = Math.hypot(GALLERY[i + 1][0] - GALLERY[i][0], GALLERY[i + 1][1] - GALLERY[i][1]); segL.push(l); tot += l }
    const along = d => { for (let i = 0; i < segL.length; i++) { if (d <= segL[i]) { const a = GALLERY[i], b = GALLERY[i + 1], f = d / segL[i]; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f] } d -= segL[i] } return GALLERY[GALLERY.length - 1] };
    const hedges = [];
    shown.forEach((p, i) => {
      const pt = along(tot * (i + .5) / shown.length), dx = pt[0], dz = pt[1] - CZ, l = Math.hypot(dx, dz), ox = pt[0] + dx / l * 3.3, oz = pt[1] + dz / l * 3.3, y = H(ox, oz), ry = Math.atan2(pt[0] - ox, pt[1] - oz);
      M.frame(ctx, p, ox, y + 2.75, oz, ry, 3.2);
      const sx = Math.cos(ry), sz = -Math.sin(ry);
      for (const s of [-1, 1]) B.north.add(MT.v, A.geo('pillar'), 0xfff0e0, K.M(ox + sx * s * 1.7, y, oz + sz * s * 1.7, .5, 4.6, .5));
      B.north.add(MT.v, A.geo('cone'), [0xff6ad5, 0x7ff0c8, 0xffd84a, 0x9a7aff][i % 4], K.M(ox, y + 4.75, oz, 1.9, .9, .5, 0, ry, 0), .5);
      B.north.add(MT.stone, A.geo('box'), 0xd8c0a0, K.M(ox - Math.sin(ry) * .9, y + .25, oz - Math.cos(ry) * .9, 3.2, .5, 1.2, 0, ry, 0));
      ctx.circles.push([ox, oz, .7]); occ.push([ox, oz, 2.5]);
      hedges.push({ x: ox - Math.sin(ry) * 2.3 + sx * 2.2, y, z: oz - Math.cos(ry) * 2.3 + sz * 2.2, s: 1.3 + rng() * .4, ry: rng() * TAU }, { x: ox - Math.sin(ry) * 2.3 - sx * 2.2, y, z: oz - Math.cos(ry) * 2.3 - sz * 2.2, s: 1.3 + rng() * .4, ry: rng() * TAU });
    });
    K.instModel(ctx, 'quaternius/bush', hedges.filter((_, i) => i % 3), it => K.scatter(ctx, K.species.bush(0x3a9a4a, 0xff7ab8), K.floraMat(.03), it, { shadow: false }), { sway: .015, shadow: false });
    K.instModel(ctx, 'quaternius/bush_flowers', hedges.filter((_, i) => i % 3 === 0), it => K.scatter(ctx, K.species.bush(0x3a9a4a, 0xff7ab8), K.floraMat(.03), it, { shadow: false }), { sway: .02, shadow: false });
    for (let i = 0; i < GALLERY.length; i += 2) { const g = GALLERY[i], dx = g[0], dz = g[1] - CZ, l = Math.hypot(dx, dz); lamp(B.north, g[0] - dx / l * 2.4, g[1] - dz / l * 2.4, 3.6, i) }
    sign('GALLERY GARDENS · LIVING PAINTINGS', -27, -47.5, Math.PI * .8, 5.5, '#7ff0c8');
    AV.npc.spawn(ctx, 'luma', { x: -26, z: -54, H, yaw: 0, r: 3, path: [[-26, -54, 5], [-31, -64, 3], [-31.5, -74, 4], [-27, -86, 3], [-31.5, -74, 2], [-31, -64, 3]] });

    /* ---------- LA MURIA village (north hill) + eco-lodge ---------- */
    const HOUSES = [[-34, -112, .15, 0xfff0e0, 0x3aa0a0], [-21, -115, 0, 0xffe0d0, 0xff6ad5], [-8, -116, -.05, 0xfff4d0, 0x7a4ac8], [10, -116, .05, 0xffe8f0, 0x3aa04a], [36, -111, -.2, 0xf0e8ff, 0xff8a3a]];
    HOUSES.forEach(hh => { const y = Math.min(H(hh[0] - 3, hh[1] + 3), H(hh[0] + 3, hh[1] + 3)); A.house(B.north, MT, ctx, hh[0], hh[1], 7, 6, 4.4, hh[2], { y, cWall: hh[3], cShut: hh[4] }); occ.push([hh[0], hh[1], 6]) });
    const LX = 23, LZ = -115, ly = Math.min(H(LX - 4, LZ + 3.5), H(LX + 4, LZ + 3.5)), lodge = A.house(B.north, MT, ctx, LX, LZ, 9, 7, 5, 0, { y: ly, cWall: 0xf0ffe8, cShut: 0x3aa04a }); occ.push([LX, LZ, 7]);
    ctx.sign('ECO-LODGE', LX, ly + 6.6, LZ + 3.6, 0, 3.6, '#7ff0c8');
    ctx.T.push({ x: lodge.door[0], z: lodge.door[1], r: 2.8, label: () => AV.S.rentDays > 0 ? tr('Sleep until morning', 'Dormir hasta la mañana') : tr('Rent the lodge (90 credits / 3 days)', 'Alquilar la cabaña (90 créditos / 3 días)'), fn: () => {
      const S = AV.S; if (S.rentDays <= 0) { if (AV.txn(-90, 'Eco-lodge rent (3 days)')) { S.rentDays = 3; AV.toast(tr('Lodge rented.', 'Cabaña alquilada.')) } } else { S.day++; S.rentDays--; S.time = 8 * 60; AV.hud(); AV.save(); AV.toast(tr('Slept well. Good morning!', 'Dormiste bien. ¡Buenos días!')) } } });
    sign('LA MURIA VILLAGE', 0, -106.5, 0, 4.5, '#ffd84a');
    K.lanterns(ctx, [[-36, H(-36, -110) + 4, -110], [-12, H(-12, -110) + 4.4, -110], [12, H(12, -110) + 4.4, -110], [36, H(36, -110) + 4, -110]], {});

    /* ---------- NW: waterfalls + the Stone Ape ---------- */
    K.waterfall(ctx, -90.1, -.35, -64, 7, 10.6, Math.PI / 2); K.waterfall(ctx, -90.2, -.35, -55, 4, 10.2, Math.PI / 2); K.waterfall(ctx, -93.0, 9.6, -60.5, 6, 11.5, Math.PI / 2, { c1: 0xb0f0ff });
    A.apeHead(B.west, MT, -90, -2.5, -84, 7.5, npcYaw(-90, -84, -60, -66)); ctx.circles.push([-90, -84, 7.6]);
    ctx.T.push({ x: -79, z: -76, r: 4, label: () => tr('Listen to the Stone Ape', 'Escuchar al Simio de Piedra'), fn: () => { AV.toast(AV.pick([tr('“Every universe begins as a rhythm.”', '“Todo universo empieza como un ritmo.”'), tr('“Water remembers every song it has carried.”', '“El agua recuerda cada canción que ha llevado.”'), tr('“Be quiet long enough and even stone will dance.”', '“Guarda silencio el tiempo suficiente y hasta la piedra bailará.”'), tr('“The portal is not in the pipe. It is in the breath.”', '“El portal no está en la pipa. Está en el aliento.”')])); AV.audio && AV.audio.blip(98, 1.2, 'sine', .3) } });
    /* sculpted rock walls: tiered rows of mossy boulders climbing the cliff, with gaps for the cascades */
    for (const [bx, gap0, gap1, s0, s1] of [[-91.5, -70, -50, 3.5, 7.5], [-94.5, -66.5, -54, 4.5, 8.5], [-98, -64, -57, 5, 9]]) { A.boulders(B.west, MT, [[bx, -116], [bx, gap0]], H, rng, { s0, s1, step: 4.5 }); A.boulders(B.west, MT, [[bx, gap1], [bx + .5, -10], [bx + 1, 22]], H, rng, { s0, s1, step: 4.5 }) }
    for (const z of [-70.5, -49.5]) A.boulders(B.west, MT, [[-90.5, z], [-97, z]], H, rng, { s0: 3, s1: 5, step: 3 }); A.boulders(B.west, MT, [[-104, 72], [-90, 70.5]], H, rng, { s0: 3, s1: 6 }); A.boulders(B.west, MT, [[-81, 88], [-77, 98]], H, rng, { s0: 3, s1: 6 });
    sign('NORTH WATERFALL GARDENS', -66, -50, -Math.PI / 2 + .4, 5, '#7ff0ff');
    occ.push([-90, -84, 11]);

    /* ---------- SW: Temple Garden + south falls ---------- */
    const TX = -64, TZ = 38; B.west.add(MT.stone, A.geo('disc'), 0xd8c0a0, K.M(TX, H(TX, TZ) + .4, TZ, 3.2, .8, 3.2)); B.west.add(MT.stone, A.geo('disc'), 0xe8d4b0, K.M(TX, H(TX, TZ) + 1.0, TZ, 2.4, .4, 2.4));
    const statue = (C.classic ? C.classic.npc : C.npc)(0x9a8a78, 0x8a7a68, null);   // stone statue keeps the classic sculpt (its materials are repainted as stone) statue.traverse(o => { if (o.isMesh) o.material = AV.std(0xa89884, .95) }); statue.position.set(TX, H(TX, TZ) + 1.2 - 1.75, TZ); statue.scale.setScalar(1.9); statue.rotation.y = npcYaw(TX, TZ, 0, 20); statue.userData.lL.rotation.x = -1.4; statue.userData.lR.rotation.x = -1.4; statue.userData.aL.rotation.set(-.6, 0, -.4); statue.userData.aR.rotation.set(-.6, 0, .4); grp.add(statue);
    ctx.circles.push([TX, TZ, 3.4]); occ.push([TX, TZ, 6]);
    for (let i = 0; i < 3; i++) { const a = i / 3 * TAU + .5, p = [TX + Math.cos(a) * 5.4, TZ + Math.sin(a) * 5.4]; B.west.add(MT.wood, A.geo('box'), 0xffffff, K.M(p[0], H(p[0], p[1]) + 1.6, p[1], .2, 3.2, .2)); B.west.add(MT.shiny, A.geo('cone'), 0xffd84a, K.M(p[0], H(p[0], p[1]) + 2.6, p[1] + .25, .35, .6, .35), .4); ctx.circles.push([p[0], p[1], .3]) }
    ctx.T.push({ x: TX + 3.5, z: TZ - 3.5, r: 3.4, label: () => tr('Meditate with the Stone Ape (rest)', 'Meditar con el Simio de Piedra (descansar)'), fn: () => { AV.toast(tr('You breathe with the statue. The bells answer. You feel rested.', 'Respiras con la estatua. Las campanas responden. Te sientes descansado.')); if (AV.audio) [0, .35, .7].forEach((o, k) => setTimeout(() => AV.audio.blip([523, 659, 784][k], 1.4, 'sine', .12), o * 1000)) } });
    sign('TEMPLE GARDEN', -56, 32, Math.PI * .75, 4.2, '#ffd84a');
    K.waterfall(ctx, -78.5, -.35, 79.5, 4, 6.2, npcYaw(-78.5, 79.5, -74, 76));
    sign('SOUTH WATERFALL GARDENS', -66, 70, Math.PI * .8, 4.4, '#7ff0ff');

    /* ---------- W: Jungle Garden ---------- */
    sign('JUNGLE GARDEN', -72, 8, -Math.PI / 2 + .3, 4.2, '#7aff9a');

    /* ---------- NE: Portal Grove ---------- */
    const GX = 68, GZ = -68, DESTS = [['verdalux', 0x38e8a0, 0x7a5cff, 'Verdalux'], ['astro9', 0xff4ad2, 0x4ac8ff, 'Astro-9'], ['jungle_dub', 0xe8c030, 0x30c060, 'Jungle Dub'], ['chiang_mai', 0xff6ad5, 0xffd84a, 'Chiang Mai'], ['da_nang', 0x52d6c4, 0xffd84a, 'Đà Nẵng', 165]];   // V1.0: 5th gate → Đà Nẵng (explicit angle: 165° keeps it clear of the grove sign)
    const gates = [];
    DESTS.forEach((d, i) => {
      const a = d[4] != null ? deg(d[4]) : deg(-135 + i * 60) , x = GX + Math.cos(a) * 10, z = GZ + Math.sin(a) * 10, ry = npcYaw(x, z, GX, GZ), ok = AV.isPlayable(d[0]), y = H(x, z);
      gates.push({ x, y, z, s: 1.35, ry });
      const pm = new THREE.ShaderMaterial({ uniforms: { t: K.U.time, c1: { value: new THREE.Color(ok ? d[1] : 0x4a3a4a) }, c2: { value: new THREE.Color(ok ? d[2] : 0x2a2a2a) }, on: { value: ok ? 1 : .25 } }, transparent: true, side: THREE.DoubleSide, depthWrite: false,
        vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
        fragmentShader: 'uniform float t,on;uniform vec3 c1,c2;varying vec2 vUv;void main(){vec2 p=(vUv-.5)*vec2(1.,1.25);float r=length(p)*2.;float a=atan(p.y,p.x);float s=sin(a*5.+t*2.-r*9.)*.5+.5;vec3 col=mix(c1,c2,s)*(1.4-r*.6);float edge=smoothstep(1.,.85,r);gl_FragColor=vec4(col,edge*(.35+.5*s)*on);}' });
      const disc = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 4.4), pm); disc.position.set(x, y + 2.3, z); disc.rotation.y = ry; grp.add(disc);
      ctx.sign(d[3] + (ok ? '' : tr(' (soon)', ' (pronto)')), x - Math.sin(ry) * .3, y + 6.6, z - Math.cos(ry) * .3, ry, 3, ok ? '#7ff0c8' : '#aa8899');
      ctx.T.push({ x: GX + Math.cos(a) * 7.4, z: GZ + Math.sin(a) * 7.4, r: 2.6, label: () => ok ? tr('Step through: ', 'Atravesar: ') + d[3] : d[3] + ' — ' + tr('under construction', 'en construcción'), fn: () => { if (ok) AV.travel(d[0], 'ape_gate'); else AV.toast(d[3] + ': ' + tr('under construction. It is on the roadmap, not in this build.', 'en construcción. Está en la hoja de ruta, no en esta versión.')) } });
      const sx = Math.cos(ry), sz = -Math.sin(ry); ctx.circles.push([x + sx * 2.4, z + sz * 2.4, .7], [x - sx * 2.4, z - sz * 2.4, .7]); occ.push([x, z, 3.5]);
    });
    K.instModel(ctx, 'quaternius/arch', gates, it => { const parts = []; it.forEach(g => { const sx = Math.cos(g.ry), sz = -Math.sin(g.ry); for (const s of [-1, 1]) parts.push([A.geo('box'), 0xb8a48a, K.M(g.x + sx * s * 2.4, g.y + 2.5, g.z + sz * s * 2.4, 1.1, 5, 1.1, 0, g.ry, 0)]); parts.push([new THREE.TorusGeometry(2.4, .5, 6, 16, Math.PI), 0xb8a48a, K.M(g.x, g.y + 5, g.z, 1, .6, 1, 0, g.ry, 0)]) }); const m = new THREE.Mesh(K.merge(parts), MT.stone); grp.add(m); return m }, { minQ: 1 });
    B.east.add(MT.stone, A.geo('disc'), 0xd8c0a0, K.M(GX, H(GX, GZ) + .1, GZ, 4.5, .2, 4.5)); B.east.add(MT.v, new THREE.TorusGeometry(4.2, .12, 6, 48), 0xb07aff, K.M(GX, H(GX, GZ) + .25, GZ, 1, 1, 1, Math.PI / 2, 0, 0), 1);
    occ.push([GX, GZ, 13]);
    sign('PORTAL GROVE', GX - 4, GZ + 13, Math.PI * .85, 4.6, '#b07aff');

    /* ---------- E: Crystal Garden + Stone Ape Tunes (alien band) ---------- */
    const CRX = 86, CRZ = -30, crystals = [], gems = [];
    for (let i = 0; i < 16; i++) { const a = rng() * TAU, r = 2 + rng() * 9, x = CRX + Math.cos(a) * r, z = CRZ + Math.sin(a) * r; if (roadDist(x, z) < 1.5) continue; crystals.push({ x, y: H(x, z), z, s: 1.6 + rng() * 2.2, ry: rng() * TAU, tint: [0xffffff, 0xffb0e8, 0xb0f0ff, 0xd0b0ff][i % 4] }); ctx.circles.push([x, z, .9]) }
    for (let i = 0; i < 6; i++) gems.push({ x: CRX + Math.cos(i) * 6, y: H(CRX, CRZ) + 3.5 + (i % 2), z: CRZ + Math.sin(i) * 6, s: 1.8, ry: i });
    K.instModel(ctx, 'quaternius/crystal_big', crystals, it => K.scatter(ctx, K.species.crystal(0xb07aff, 0x7ff0ff), K.floraMat(0), it.map(o => Object.assign({}, o, { s: o.s * .9 }))));
    K.instModel(ctx, 'quaternius/gem_pink', gems, it => K.scatter(ctx, K.merge([[K.BG.oct, 0xff4a8a, K.M(0, 0, 0, .3, .5, .3), 1]]), K.floraMat(0), it));
    const cl = new THREE.PointLight(0x9af0ff, 1.2, 22); cl.position.set(CRX, H(CRX, CRZ) + 4, CRZ); grp.add(cl); occ.push([CRX, CRZ, 11]);
    ctx.T.push({ x: CRX - 4, z: CRZ + 4, r: 3.4, label: () => tr('Touch the singing crystal', 'Tocar el cristal cantor'), fn: () => { if (AV.audio) [0, .12, .24, .4].forEach((o, k) => setTimeout(() => AV.audio.blip([784, 988, 1175, 1568][k], 1.6, 'sine', .1), o * 1000)); cl.intensity = 4; setTimeout(() => cl.intensity = 1.2, 1600); AV.toast(tr('The crystal sings a chord that hangs in the air.', 'El cristal canta un acorde que queda flotando.')) } });
    sign('CRYSTAL GARDEN', CRX - 10, CRZ + 6, -Math.PI / 2 - .3, 4.2, '#b0f0ff');
    const ABX = 90, ABZ = 10; A.pavilion(B.east, MT, ctx, walk, { x: ABX, z: ABZ, r: 4, h: 3, n: 8, rh: 3.6, roof: 'dome', cRoof: 0x6ad86a, cTrim: 0xb07aff, cCol: 0xe8ffe0, cGem: 0xff4ad2, gaps: [2, 3, 4], ry: Math.PI / 8 }); occ.push([ABX, ABZ, 6]);
    /* soft-body aliens (chars_real.js C.alien): same pivot API as the villagers, so the bounce / arm / head code below drives them */
    const aliens = [['zib', 0x7ad86a, 0x9a4aff, 0x7ff0ff, -1.3], ['orbo', 0x8af0ff, 0xff4ad2, 0xffd84a, 1.3]].map(c => { const g = C.alien ? C.alien({ type: c[0], skin: c[1], suit: c[2], glow: c[3] }) : C.npc(c[1], c[2], null); g.position.set(ABX + c[4], .45, ABZ); g.rotation.y = -Math.PI / 2; g.scale.setScalar(.95); grp.add(g); return g });
    ctx.upd.push((dt, t) => { const on = AV.audio && AV.audio.ok && AV.audio.on, beat = on ? AV.audio.beat : t * 1.5, red = AV.S.set.reduce ? .3 : 1; aliens.forEach((g, i) => { const ph = (beat + i * .5) * Math.PI; g.position.y = .45 + Math.abs(Math.sin(ph)) * .12 * red; g.userData.aR.rotation.x = -1 + Math.sin(ph * 2) * .5 * red; g.userData.aL.rotation.x = -1 + Math.cos(ph * 2) * .5 * red; g.userData.head.rotation.z = Math.sin(ph) * .15 * red }) });
    ctx.T.push({ x: ABX - 5.6, z: ABZ, r: 3.2, label: () => tr('Listen to Stone Ape Tunes (alien band)', 'Escuchar a Stone Ape Tunes (banda alienígena)'), fn: () => AV.toast(tr('Two aliens play a song in a time signature that doesn’t exist yet. It slaps.', 'Dos alienígenas tocan en un compás que aún no existe. Suena increíble.')) });
    sign('STONE APE TUNES', ABX - 6.5, ABZ + 5.5, -Math.PI / 2, 3.8, '#7aff9a');

    /* ---------- SE: Desert Garden + Asia Garden ---------- */
    for (let i = 0; i < 16; i++) { const a = rng() * TAU, r = rng() * 12, x = 80 + Math.cos(a) * r * 1.1, z = 49 + Math.sin(a) * r * .9; if (roadDist(x, z) < 1.2) continue; A.cactus(B.east, MT, x, H(x, z), z, .7 + rng() * .8, [0x3a9a5a, 0x4ab06a, 0x2a8a6a][i % 3]); ctx.circles.push([x, z, .6]) }
    for (let i = 0; i < 10; i++) { const x = 70 + rng() * 22, z = 38 + rng() * 22; if (roadDist(x, z) < 1.2) continue; A.rock(B.east, MT, 0xd8a070, K.M(x, H(x, z) + .3, z, .8 + rng(), .5 + rng() * .6, .8 + rng(), 0, rng() * 3, 0), { dry: true }); ctx.circles.push([x, z, .8]) }
    occ.push([80, 49, 15]); sign('DESERT GARDEN', 66, 44, -Math.PI / 2 + .3, 4, '#ffb04a');
    const PX = 58, PZ = 88; A.pagoda(B.east, MT, ctx, PX, PZ, 4, 5.6, { y: H(PX, PZ) }); occ.push([PX, PZ, 7]);
    K.instModel(ctx, 'quaternius/bridge_small', [{ x: POOLS[2].x, y: H(POOLS[2].x, POOLS[2].z) - .3, z: POOLS[2].z, s: 1.1, ry: Math.PI / 2 }], it => null);
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, x = PX + Math.cos(a) * 8.5, z = PZ + Math.sin(a) * 8.5; if (roadDist(x, z) < 1) continue; const y = H(x, z); B.east.add(MT.stone, A.geo('box'), 0xc8b8a0, K.M(x, y + .6, z, .5, 1.2, .5)); B.east.add(MT.stone, A.geo('cone4'), 0xb0a090, K.M(x, y + 1.55, z, .7, .5, .7)); B.east.add(MT.v, A.geo('box'), 0xffe0a0, K.M(x, y + 1.2, z, .32, .3, .32), 1); ctx.circles.push([x, z, .4]) }
    sign('ASIA GARDEN', 46, 72, Math.PI * .8, 4, '#ff6a6a');
    K.field(ctx, K.species.bamboo(0x8ac83a), K.floraMat(.012), K.n(10), { x: PX, z: PZ, r0: 10, r1: 16 }, { H, s0: .9, s1: 1.4, col: .45, ok: (x, z) => free(x, z, 1.5) });

    /* ---------- BOUNCY TRAMPOLINES: step on to bounce, hold Space / Jump on landing to go higher, walk off the edge to stop ---------- */
    const TRAMPS = [[32, 68, 2.8, 0xff6ad5, 0x7ff0ff], [42, -64, 2.6, 0xffd84a, 0x9a5cff], [-50, -26, 2.6, 0x7aff9a, 0xff8a3a], [60, 22, 3.1, 0x4ac8ff, 0xffd84a], [-36, 64, 2.4, 0xb07aff, 0x7aff9a]];
    const TOP = .8, VMIN = 7.5, VMAX = 60;
    if (!BEDTEX) BEDTEX = paintBed(256);
    const tramps = TRAMPS.map(([x, z, r, c1, c2], i) => {
      const y = H(x, z), top = y + TOP, b = z > 40 ? B.south : z < -40 ? B.north : x < 0 ? B.west : B.east;
      for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + i, lx = x + Math.cos(a) * (r - .1), lz = z + Math.sin(a) * (r - .1); b.add(MT.shiny, A.geo('cyl'), 0xd0d0e0, K.M(lx, y + (TOP - .1) / 2, lz, .05, TOP - .1, .05)) }
      b.add(MT.shiny, new THREE.TorusGeometry(r, .06, 6, 48), 0xd0d0e0, K.M(x, top - .1, z, 1, 1, 1, Math.PI / 2, 0, 0));
      b.add(MT.dbl, new THREE.CylinderGeometry(r, r, .5, 32, 1, true), c2, K.M(x, top - .36, z), .1);
      for (let k = 0; k < 12; k++) b.add(MT.v, new THREE.TorusGeometry(r, .17, 6, 6, TAU / 12), k % 2 ? c2 : c1, K.M(x, top + .02, z, 1, 1, .55, Math.PI / 2, 0, k * TAU / 12), .2);
      const g = new THREE.RingGeometry(0, r - .1, 28, 5); g.rotateX(-Math.PI / 2); const pos = g.attributes.position, rr = new Float32Array(pos.count);
      for (let k = 0; k < pos.count; k++) rr[k] = 1 - (Math.hypot(pos.getX(k), pos.getZ(k)) / (r - .1)) ** 2;
      const bm = new THREE.MeshStandardMaterial({ map: BEDTEX, roughness: .85 }); bm.userData.lin = 1;
      const bed = new THREE.Mesh(g, bm); bed.position.set(x, top - .04, z); bed.receiveShadow = true; grp.add(bed);
      walk.pad(x, z, r + .2, top); occ.push([x, z, r + 2.5]);
      ctx.T.push({ x, z, r: r + 1.6, label: () => tr('Trampoline: hop on and bounce!', 'Cama elástica: ¡súbete y rebota!'), fn: () => AV.toast(HINT()) });
      return { x, z, r: r + .2, top, g, pos, rr, amp: 0, tt: 0 };
    });
    const HINT = () => tr('Boing! Keep holding Space / Jump: every landing launches you higher — all the way into the sky. Walk off the edge to stop.', '¡Boing! Sigue manteniendo Espacio / Saltar: cada caída te lanza más alto — hasta el cielo. Sal por el borde para parar.');
    const boing = (tp, v) => { tp.amp = .1 + v / VMAX * .4; tp.tt = 0; const g = 1 - Math.hypot(AV.P.x - tp.x, AV.P.z - tp.z) / 18; if (AV.audio && g > 0) { const f = 160 + v * 5; AV.audio.blip(f, .12, 'triangle', .12 * g); setTimeout(() => AV.audio.blip(f * 1.6, .18, 'sine', .08 * g), 70) } };
    /* a couple of locals who never get tired of it */
    const JUMP = [['ape', 3, 1.25], ['alien', 0, 1.45]].slice(0, AV.beings.n(ctx, 1, 2, 2));
    const jumpers = AV.beings.spawn(ctx, JUMP.map(([kind, ti], i) => ({ kind, x: tramps[ti].x + .6, z: tramps[ti].z - .4, y: tramps[ti].top, yaw: i * 2.4, mode: 'float', seed: 90 + i })))
      .map((b, i) => ({ b, tp: tramps[JUMP[i][1]], f: JUMP[i][2], ph: i * .37, last: 0 }));
    let prevVy = 0, hinted = false;
    /* the mat sags deeper the harder you land: a big launch bends it way down before it snaps back */
    ctx.upd.push((dt, t) => {
      const P = AV.P, red = AV.S.set.reduce ? .5 : 1;
      if (P.on && !AV.blocking()) for (const tp of tramps) {
        if (Math.hypot(P.x - tp.x, P.z - tp.z) > tp.r || Math.abs(P.y - tp.top) > .06) continue;
        const v = Math.min(VMAX, Math.max(VMIN, -prevVy * .9 + (AV.keys.Space || AV.T.jump ? 12 : 0)));
        P.vy = v; P.on = false; boing(tp, v);
        if (!hinted) { hinted = true; AV.toast(HINT()) } break;
      }
      prevVy = P.vy;
      for (const j of jumpers) { const p = (t * j.f + j.ph) % 1; if (p < j.last) boing(j.tp, 9); j.last = p; j.b.h.position.y = j.tp.top + 4 * 1.5 * red * p * (1 - p) }
      for (const tp of tramps) {
        if (tp.amp <= 0) continue; tp.tt += dt; const e = Math.exp(-4 * tp.tt), dip = e < .02 ? 0 : -tp.amp * e * Math.cos(11 * tp.tt) * red;
        for (let k = 0; k < tp.pos.count; k++) tp.pos.setY(k, dip * tp.rr[k]); tp.pos.needsUpdate = true; if (!dip) tp.amp = 0;
      }
    });

    /* ---------- vegetation: CC0 models where they fit, procedural elsewhere ---------- */
    const pick = (n, area, ok, sMin, sMax) => { const out = []; for (let i = 0, tries = 0; i < n && tries < n * 12; tries++) { let x, z; if (area.r1 != null) { const a = rng() * TAU, r = area.r0 + rng() * (area.r1 - area.r0); x = (area.x || 0) + Math.cos(a) * r; z = (area.z || 0) + Math.sin(a) * r } else { x = area.x0 + rng() * (area.x1 - area.x0); z = area.z0 + rng() * (area.z1 - area.z0) } if (!ok(x, z)) continue; out.push({ x, y: H(x, z), z, s: sMin + rng() * (sMax - sMin), ry: rng() * TAU }); i++ } return out };
    const palmsM = pick([0, 12, 18][q], { r0: 49.5, r1: 54 }, (x, z) => free(x, z, 1.2), 2.2, 3.0).concat(pick([0, 4, 7][q], { x0: -92, x1: -64, z0: -20, z1: 26 }, (x, z) => free(x, z, 1.2), 2.4, 3.2));
    palmsM.forEach(p => { ctx.circles.push([p.x, p.z, .45]); occ.push([p.x, p.z, 2]) });
    const pa = palmsM.filter((_, i) => i % 3 === 0), pb = palmsM.filter((_, i) => i % 3 === 1), pc = palmsM.filter((_, i) => i % 3 === 2), palmFb = it => K.scatter(ctx, K.species.palm(0x8a5a2a, 0x2fa04a), K.floraMat(.01), it.map(o => Object.assign({}, o, { s: o.s * .55 })));
    K.instModel(ctx, 'quaternius/palm_a', pa, palmFb, { sway: .004 }); K.instModel(ctx, 'quaternius/palm_b', pb, palmFb, { sway: .004 }); K.instModel(ctx, 'quaternius/palm_c', pc, palmFb, { sway: .004 });
    const palmsP = pick(K.n(14), { r0: 49.5, r1: 56 }, (x, z) => free(x, z, 1.2), 1.1, 1.6); palmsP.forEach(p => { ctx.circles.push([p.x, p.z, .35]); occ.push([p.x, p.z, 2]) }); K.scatter(ctx, K.species.palm(0x8a5a2a, 0x2fa04a), K.floraMat(.01), palmsP);
    const twisted = [[-48, 20], [58, -34], [-44, 74], [44, 64], [-56, -90], [96, -54]].slice(0, [0, 2, 4][q]).map(p => ({ x: p[0], y: H(p[0], p[1]), z: p[1], s: .55 + rng() * .15, ry: rng() * TAU }));
    twisted.forEach(p => { ctx.circles.push([p.x, p.z, 1.1]); occ.push([p.x, p.z, 5]) });
    K.instModel(ctx, 'quaternius/twisted_tree_a', twisted, it => K.scatter(ctx, K.species.candyTree(0x6a3a5a, 0xff4a6a, 0xff8ad8, 0xffd84a), K.floraMat(.01), it.map(o => Object.assign({}, o, { s: 1.6 }))), { minQ: 1, sway: .0015 });
    const shrooms = pick(K.n(18), { x0: -92, x1: -56, z0: -48, z1: 30 }, (x, z) => free(x, z, 1), 3, 6.5).concat(pick(K.n(8), { r0: 0, r1: 14, x: -70, z: -66 }, (x, z) => free(x, z, 1), 2.5, 5));
    shrooms.forEach(p => ctx.circles.push([p.x, p.z, .12 * p.s]));
    K.instModel(ctx, 'quaternius/mushroom_a', shrooms, it => K.scatter(ctx, K.species.mushroom(0xff4a6a, 0xf4e8d0, 0xffffff), K.floraMat(0), it.map(o => Object.assign({}, o, { s: o.s * .45 })), { far: K.far(false), cell: 64 }), { far: K.far(false), cell: 64 });
    K.field(ctx, K.species.mushroom(0xff4ad2, 0xfff0e0, 0x7ff0ff), K.floraMat(0), K.n(18), { x0: -95, x1: -50, z0: -95, z1: 40 }, { H, s0: 1.2, s1: 3.2, ok: (x, z) => free(x, z, .8), col: .15, far: K.far(false), cell: 64 });
    K.field(ctx, K.species.mushroom(0x7ff0ff, 0xf4e8d0, 0xff4ad2), K.floraMat(0), K.n(10), { x0: 50, x1: 100, z0: -50, z1: 20 }, { H, s0: 1, s1: 2.6, ok: (x, z) => free(x, z, .8), col: .15, far: K.far(false), cell: 64 });
    const ferns = pick(K.n(30), { x0: -95, x1: -52, z0: -60, z1: 40 }, (x, z) => free(x, z, .6), .22, .38);
    K.instModel(ctx, 'quaternius/fern', ferns, it => K.scatter(ctx, K.species.fern(0x2f9a3a), K.floraMat(.06, { double: true }), it.map(o => Object.assign({}, o, { s: o.s * 5 })), { shadow: false, cell: 48, far: K.far(true) }), { sway: .02, minQ: 1, shadow: false, cell: 48, far: K.far(true) });
    const bushes = pick(K.n(30), { x0: -110, x1: 110, z0: -110, z1: 100 }, (x, z) => free(x, z, 1) && Math.hypot(x, z) > 44, 1, 1.8);
    bushes.forEach(p => ctx.circles.push([p.x, p.z, .6 * p.s]));
    K.instModel(ctx, 'quaternius/bush', bushes, it => K.scatter(ctx, K.species.bush(0x3a9a4a, 0xff7ab8), K.floraMat(.03), it, { far: K.far(false), cell: 64 }), { sway: .015, far: K.far(false), cell: 64 });
    const grasses = pick(K.n(24), { x0: -105, x1: 105, z0: -105, z1: 95 }, (x, z) => free(x, z, .5) && Math.hypot(x, z) > 44, .45, .8);
    K.instModel(ctx, 'quaternius/flower_group', grasses, it => K.scatter(ctx, K.species.flower(0xff4ad2, 0xffe040), K.floraMat(.15), it.map(o => Object.assign({}, o, { s: o.s * 2.5 })), { shadow: false, cell: 48, far: K.far(true) }), { sway: .05, minQ: 1, shadow: false, cell: 48, far: K.far(true) });
    [[0xff4ad2, 0xffe040], [0xffb04a, 0xff4a8a], [0x9a7aff, 0xfff0a0], [0x4ac8ff, 0xffffff], [0xffffff, 0xffd84a]].forEach(c => K.field(ctx, K.species.flower(c[0], c[1]), K.floraMat(.15), K.n(26), { x0: -110, x1: 110, z0: -110, z1: 100 }, { H, s0: 1, s1: 2.2, shadow: false, cell: 48, far: K.far(true), ok: (x, z) => free(x, z, .4) && Math.hypot(x, z) > 43 }));
    K.field(ctx, K.species.giantFlower(0xff6ad5, 0xffe040), K.floraMat(.02), K.n(10), { x0: -100, x1: -50, z0: -40, z1: 50 }, { H, s0: 1.2, s1: 2, ok: (x, z) => free(x, z, 1), col: .2 });
    K.field(ctx, K.species.giantFlower(0x7ff0ff, 0xff4ad2), K.floraMat(.02), K.n(6), { x0: 40, x1: 100, z0: -60, z1: 30 }, { H, s0: 1.2, s1: 2, ok: (x, z) => free(x, z, 1), col: .2 });
    /* inner-ring garden beds between cafés */
    K.field(ctx, K.species.flower(0xff8ad8, 0xffe040), K.floraMat(.15), K.n(26), { r0: 23.5, r1: 34.5 }, { H, s0: .9, s1: 1.6, shadow: false, cell: 48, far: K.far(true), ok: (x, z) => !occ.some(o => Math.hypot(x - o[0], z - o[1]) < o[2]) && roadDist(x, z) > .5 && !bridgePairs.some(b => Math.abs(Math.atan2(Math.sin(Math.atan2(z, x) - deg(b[0])), Math.cos(Math.atan2(z, x) - deg(b[0])))) < .14) });
    /* rim forest (procedural, cheap) */
    K.field(ctx, K.species.candyTree(0x5a3a4a, 0x3aa04a, 0x2f8a5a, 0xff7ab8), K.floraMat(.006), K.n(26), { r0: 0, r1: 150 }, { H, s0: 1.4, s1: 2.4, ok: (x, z) => { const e = ell(x, z); return e > .94 && e < 1.18 && Math.abs(x) < 148 && Math.abs(z) < 148 } });

    /* ---------- ambience: fireflies, lantern strings, promenade lamps, floating islands, UFO ---------- */
    K.motes(ctx, { n: 220, x: 0, z: 0, r: 110, y0: .6, y1: 6, cols: [0xffe86a, 0xff9ae0, 0x9af0ff, 0x9aff9a], size: 2.6, night: true, H });
    K.motes(ctx, { n: 60, x: -82, z: -60, r: 14, y0: 0, y1: 4, cols: [0xffffff, 0xc8f0ff], size: 3, speed: 1.4, alpha: .5 });
    for (let i = 0; i < 24; i++) { const a = i / 24 * TAU + .13; if (bridgePairs.some(b => Math.abs(Math.atan2(Math.sin(a - deg(b[0])), Math.cos(a - deg(b[0])))) < .1)) continue; const p = polar(a, 43.6); lamp(B.core, p[0], p[1], 3.8, i) }
    for (const side of [-1, 1]) K.lanterns(ctx, [[side * 3, 5.5, 2], [side * 12, 4.2, 20], [side * 22, 4.6, 38]], {});
    A.island(B.sky, MT, -70, 58, -150, 9); A.island(B.sky, MT, 96, 66, -128, 7); A.island(B.sky, MT, 150, 50, 55, 8); A.island(B.sky, MT, -140, 62, 70, 6);
    const ufo = new THREE.Group(); ufo.add(new THREE.Mesh(new THREE.SphereGeometry(4, 20, 8), AV.std(0xc8c8d8, .3, .7))); ufo.children[0].scale.y = .28; const dm = new THREE.Mesh(new THREE.SphereGeometry(1.8, 16, 8, 0, TAU, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x9af0ff, emissive: 0x4ac8ff, emissiveIntensity: .8, transparent: true, opacity: .8 })); dm.position.y = .6; ufo.add(dm); const ur = new THREE.Mesh(new THREE.TorusGeometry(4.1, .18, 6, 36), new THREE.MeshBasicMaterial({ color: 0xff4ad2 })); ur.rotation.x = Math.PI / 2; ufo.add(ur); AV.lin(ufo); grp.add(ufo);
    ctx.upd.push((dt, t) => { const a = t * .03; ufo.position.set(Math.cos(a) * 140, 70 + Math.sin(t * .4) * 3, Math.sin(a) * 140 - 30); ufo.rotation.y = t * .6; ur.material.color.setHSL((t * .1) % 1, 1, .6) });

    /* ---------- flush batches (a few merged meshes per district) ---------- */
    const skyMeshes = B.sky.flush(ctx, { noShadow: true }); delete B.sky; for (const k in B) B[k].flush(ctx);
    ctx.upd.push((dt, t) => { const y = Math.sin(t * .35) * 1.6; skyMeshes.forEach(m => m.position.y = y) });

    ctx.leave.push(() => { M.resetFrames(); AV.FAC.length = 0; document.getElementById('c').classList.remove('kaleido'); if (shift) { shift = null; AV.$('pb').style.display = 'none' } });
    function kaleido() { const c = document.getElementById('c'); c.classList.remove('kaleido'); void c.offsetWidth; c.classList.add('kaleido'); setTimeout(() => c.classList.remove('kaleido'), AV.S.set.reduce ? 4000 : 10000) }

    const zilFront = [zilPos[0] - zout[0] * 13, zilPos[1] - zout[1] * 13];
    return {
      name: 'Ape Town', stage: { pos: stagePos }, fog: [70, 330], sky: { dome: { s1: 0xff6ad5, s2: 0x9a7aff, swirl: .42, cloud: .9, glow: .55 } },
      surface: (x, z) => { if (ell(x, z) >= 1) return null; const b = walk.bridgeAt(x, z); if (b !== undefined) return b; if (waterDepth(x, z) > -.2) return -.35; const h = H(x, z), p = walk.at(x, z); return p === undefined ? h : Math.max(p, h) },
      arrivals: { default: { x: 0, z: 95, yaw: 0 }, finca: { x: 0, z: 97, yaw: 0 }, pipe: { x: 0, z: 90, yaw: 0 }, ape_gate: { x: GX, z: GZ + 4, yaw: 0 },
        verdalux: { x: GX + Math.cos(deg(-135)) * 6, z: GZ + Math.sin(deg(-135)) * 6, yaw: faceYaw(GX + Math.cos(deg(-135)) * 6, GZ + Math.sin(deg(-135)) * 6, GX, GZ + 20) },
        astro9: { x: GX + Math.cos(deg(-75)) * 6, z: GZ + Math.sin(deg(-75)) * 6, yaw: Math.PI }, jungle_dub: { x: GX + Math.cos(deg(-15)) * 6, z: GZ + Math.sin(deg(-15)) * 6, yaw: Math.PI / 2 }, chiang_mai: { x: GX + Math.cos(deg(45)) * 6, z: GZ + Math.sin(deg(45)) * 6, yaw: faceYaw(GX + Math.cos(deg(45)) * 6, GZ + Math.sin(deg(45)) * 6, GX, GZ) },
        da_nang: { x: GX + Math.cos(deg(165)) * 6, z: GZ + Math.sin(deg(165)) * 6, yaw: faceYaw(GX + Math.cos(deg(165)) * 6, GZ + Math.sin(deg(165)) * 6, GX, GZ) } },
      defaultArrival: 'default',
      places: [{ id: 'finca', name: ['La Finca gateway & market', 'La Finca y el mercado'], x: 0, z: 97, yaw: 0 }, { id: 'stage', name: ['Lotus stage (Stone Ape Band)', 'Escenario de loto (Stone Ape Band)'], x: 0, z: 46.5, yaw: Math.PI },
        { id: 'plaza', name: ['Circular Plaza', 'Plaza Circular'], x: 0, z: 17, yaw: 0 }, { id: 'zil', name: ['Zil’s Café', 'Café de Zil'], x: zilFront[0], z: zilFront[1], yaw: faceYaw(zilFront[0], zilFront[1], zilPos[0], zilPos[1]) },
        { id: 'cinema', name: ['Outdoor cinema', 'Cine al aire libre'], x: 0, z: -46.5, yaw: 0 }, { id: 'gallery', name: ['Gallery Gardens', 'Jardines de la Galería'], x: -22, z: -50, yaw: faceYaw(-22, -50, -32, -66) },
        { id: 'muria', name: ['La Muria village & eco-lodge', 'Aldea de La Muria y eco-cabaña'], x: 6, z: -104, yaw: 0 }, { id: 'falls', name: ['Waterfalls & Stone Ape', 'Cascadas y Simio de Piedra'], x: -64, z: -56, yaw: faceYaw(-64, -56, -90, -70) },
        { id: 'jungle', name: ['Jungle Garden', 'Jardín de la Selva'], x: -62, z: 4, yaw: Math.PI / 2 }, { id: 'temple', name: ['Temple Garden', 'Jardín del Templo'], x: -52, z: 34, yaw: faceYaw(-52, 34, TX, TZ) },
        { id: 'grove', name: ['Portal Grove', 'Arboleda de Portales'], x: 56, z: -56, yaw: faceYaw(56, -56, GX, GZ) }, { id: 'crystal', name: ['Crystal Garden & alien band', 'Jardín de Cristal y banda alienígena'], x: 74, z: -10, yaw: faceYaw(74, -10, CRX, CRZ) },
        { id: 'asia', name: ['Asia & Desert gardens', 'Jardines de Asia y del Desierto'], x: 46, z: 66, yaw: faceYaw(46, 66, PX, PZ) }],
      musicProfile: { bpm: 88, root: 45, scale: [0, 3, 5, 7, 10], style: 'boom' },
      music: { playlist: 'stone_ape_band', pos: stagePos, bed: .35 }   // V0.9.3: the Stone Ape Band plays real Ztonedape tracks from the Lotus Stage
    };
  }
});
})(window.AV);
