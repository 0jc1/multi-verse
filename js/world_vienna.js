/* APEVERSE V0.9.9 - world_vienna.js : VIENNA 2000s MEMORY WORLD (built from "Apeverse Vienna 2000s Memory Map").
   North = -z. ~380 × 300 m. Stephansplatz + cathedral in the middle, the Ringstraße (red trams, rideable) around the old town,
   Waxy's Irish Bar · Lukas Viennese Bar · Dons Shisha Bar, Würstel Stand, Happy Noodles, Flex + Badeschiff on the Donaukanal,
   Naschmarkt, Karlsplatz (Karlskirche, summer cinema, raves), Stadtpark (golden living statue), Prater (Riesenrad, coaster, carousel),
   Belvedere, Schönbrunn (palace, gardens, fountain, Gloriette), Christmas markets, Memory Zone (graffiti court), Kahlenberg viewpoint,
   the Danube + Donauinsel beaches, 22nd district towers + VIS school by the Alte Donau, U-Bahn fast travel, portal back to Ape Town.
   Modes: Summer / Winter (F or phone "Fest"). */
'use strict';
(function (AV) {
const tr = AV.tr, TAU = AV.TAU, K = AV.kit, A = AV.arch, CY = AV.city, MD = AV.media;
const XMIN = -190, XMAX = 190, ZMIN = -150, ZMAX = 150, CX = 0, CZ = -15, RING = 62, WY = -.35;
const season = () => (AV.S.vienna && AV.S.vienna.season) || 'summer';
const DAN0 = [30, -160], DD = [.894, .447], DN = [.447, -.894];
const danS = (x, z) => (x - DAN0[0]) * DN[0] + (z - DAN0[1]) * DN[1], danP = t => [DAN0[0] + DD[0] * t, DAN0[1] + DD[1] * t];
const CANAL = [[-20, -96], [-48, -34], [-70, 8], [-110, 46], [-196, 74]];
const segD = (x, z, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz))); return Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t) };
const canalD = (x, z) => { let d = 1e9; for (let i = 1; i < CANAL.length; i++) d = Math.min(d, segD(x, z, CANAL[i - 1], CANAL[i])); return d };
const PONDS = [{ x: 85, z: 50, r: 6 }, { x: -100, z: 128, r: 6 }, { x: 118, z: -140, r: 9 }];
const waterAt = (x, z) => { const s = Math.abs(danS(x, z)); if (s < 18 && s > 3.5) return true; if (canalD(x, z) < 4) return true; for (const p of PONDS) if (Math.hypot(x - p.x, z - p.z) < p.r) return true; return false };
const H = (x, z) => Math.max(0, 26 - Math.hypot(x + 150, z + 125) * .42);   // Kahlenberg
const RADIALS = [[[CX + 67, CZ], [188, -8]], [[CX, CZ + 67], [0, 148]], [[CX - 47, CZ + 47], [-150, 96]], [[CX - 67, CZ], [-188, -15]], [[CX - 44, CZ - 47], [-128, -136]], [[CX + 40, CZ - 52], [60, -112]], [[CX + 47, CZ + 47], [150, 118]]];
const roadD = (x, z) => { let d = Math.abs(Math.hypot(x - CX, z - CZ) - RING) - 5; for (const r of RADIALS) d = Math.min(d, segD(x, z, r[0], r[1]) - 4.5); return d };
const R = (x0, x1, z0, z1) => ({ x0, x1, z0, z1 });
const LAND = { steph: R(-34, 30, -54, 6), bars: R(14, 58, -60, -40), wurst: R(22, 62, -10, 14), flex: R(-58, -40, -14, 2), nasch: R(-84, -16, 48, 70), karl: R(-24, 52, 80, 124), stadt: R(60, 114, 26, 72),
  prater: R(108, 188, -48, 24), xmas: R(124, 182, 38, 90), belv: R(62, 118, 92, 136), schon: R(-146, -54, 92, 150), memory: R(-14, 26, 118, 146), portal: R(152, 186, 106, 140), d22: R(100, 190, -150, -96), kahl: R(-190, -100, -150, -80) };
const inRect = (r, x, z, m) => x > r.x0 - (m || 0) && x < r.x1 + (m || 0) && z > r.z0 - (m || 0) && z < r.z1 + (m || 0);

/* ---------- painted textures ---------- */
const TX = {};
function cv(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; t.userData = { keep: true }; return t }
const facadeTex = () => TX.fac || (TX.fac = cv(256, 224, (c, w, h) => { c.fillStyle = '#ece8e0'; c.fillRect(0, 0, w, h); c.fillStyle = '#d6d0c4'; c.fillRect(0, 0, w, 14); c.fillRect(0, h - 18, w, 18);
  c.fillStyle = '#f8f6f0'; c.beginPath(); c.moveTo(58, 46); c.lineTo(128, 22); c.lineTo(198, 46); c.fill(); c.fillStyle = '#ffffff'; c.fillRect(66, 52, 124, 128); c.fillStyle = '#3a4656'; c.fillRect(74, 58, 108, 116);
  c.fillStyle = '#ffffff'; c.fillRect(124, 58, 8, 116); c.fillRect(74, 104, 108, 6); c.fillStyle = 'rgba(160,200,230,.35)'; c.fillRect(78, 62, 40, 38); c.fillStyle = '#d6d0c4'; c.fillRect(62, 180, 132, 8) }));
const roofTex = () => TX.roof || (TX.roof = cv(256, 256, (c, w, h) => { const cols = ['#e8c030', '#2a7a4a', '#1a1a1a', '#f4f0e8']; for (let y = 0; y < h; y += 16) for (let x = 0; x < w; x += 16) { const k = (Math.floor(x / 16) + Math.floor(y / 16) * 2) % 4; c.fillStyle = cols[(Math.abs(((x / 16) | 0) - ((y / 16) | 0)) % 4 + k) % 4]; c.beginPath(); c.moveTo(x, y + 8); c.lineTo(x + 8, y); c.lineTo(x + 16, y + 8); c.lineTo(x + 8, y + 16); c.fill() } }));
const graffitiTex = () => TX.graf || (TX.graf = cv(512, 192, (c, w, h) => { const g = c.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#2a1a4a'); g.addColorStop(1, '#1a3a4a'); c.fillStyle = g; c.fillRect(0, 0, w, h); const r = AV.rng(77);
  for (let i = 0; i < 30; i++) { c.fillStyle = ['#ff4ad2', '#7ff0ff', '#ffd84a', '#7aff8a', '#ff8a3a'][i % 5]; c.globalAlpha = .5; c.beginPath(); c.arc(r() * w, r() * h, 6 + r() * 26, 0, TAU); c.fill() } c.globalAlpha = 1;
  c.font = 'bold 64px Impact, Arial Black, sans-serif'; c.textAlign = 'center'; c.lineWidth = 10; c.strokeStyle = '#1a1010'; c.fillStyle = '#ffd84a'; c.strokeText('MEMORIES', w / 2, 92); c.fillText('MEMORIES', w / 2, 92); c.font = 'bold 40px Impact, Arial Black, sans-serif'; c.fillStyle = '#7ff0ff'; c.strokeText('VIENNA 2000s', w / 2, 150); c.fillText('VIENNA 2000s', w / 2, 150) }));
function groundTex(N, winter) {
  return cv(N, Math.round(N * (ZMAX - ZMIN) / (XMAX - XMIN)), (c, w, h) => {
    const px = x => (x - XMIN) / (XMAX - XMIN) * w, pz = z => (z - ZMIN) / (ZMAX - ZMIN) * h, m = w / (XMAX - XMIN);
    c.fillStyle = winter ? '#9a9aa4' : '#56565e'; c.fillRect(0, 0, w, h);                                           // streets
    const r0 = AV.rng(5); for (let i = 0; i < 9000; i++) { c.fillStyle = r0() < .5 ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.05)'; c.fillRect(r0() * w, r0() * h, 2, 2) }
    const rect = (r, col) => { c.fillStyle = col; c.fillRect(px(r.x0), pz(r.z0), (r.x1 - r.x0) * m, (r.z1 - r.z0) * m) };
    const green = winter ? '#e8eef2' : '#5a8a3a', stone = winter ? '#e0e0e4' : '#c8bea8';
    for (const k of ['stadt', 'prater', 'belv', 'schon', 'kahl', 'memory']) rect(LAND[k], green);
    for (const k of ['steph', 'karl', 'nasch', 'xmas', 'bars', 'wurst', 'flex', 'portal']) rect(LAND[k], stone);
    c.fillStyle = winter ? '#f2f4f8' : '#4a7a32'; c.beginPath(); c.arc(px(-150), pz(-125), 62 * m, 0, TAU); c.fill();    // Kahlenberg
    if (!winter) { c.strokeStyle = 'rgba(40,90,30,.6)'; c.lineWidth = 2; for (let k = -60; k < 60; k += 4) { c.beginPath(); c.moveTo(px(-210), pz(-125 + k)); c.lineTo(px(-90), pz(-125 + k)); c.stroke() } }   // vineyard rows
    c.strokeStyle = '#3a3a40'; c.lineWidth = 10 * m; c.beginPath(); c.arc(px(CX), pz(CZ), RING * m, 0, TAU); c.stroke();
    c.strokeStyle = '#8a8a90'; c.lineWidth = .3 * m; for (const o of [-1.6, 1.6]) { c.beginPath(); c.arc(px(CX), pz(CZ), (RING + o) * m, 0, TAU); c.stroke() }   // tram tracks
    c.strokeStyle = '#3a3a40'; c.lineWidth = 9 * m; for (const r of RADIALS) { c.beginPath(); c.moveTo(px(r[0][0]), pz(r[0][1])); c.lineTo(px(r[1][0]), pz(r[1][1])); c.stroke() }
    c.strokeStyle = winter ? '#e8e8ec' : '#e8e0c8'; c.lineWidth = .25 * m; c.setLineDash([3 * m, 3 * m]); for (const r of RADIALS) { c.beginPath(); c.moveTo(px(r[0][0]), pz(r[0][1])); c.lineTo(px(r[1][0]), pz(r[1][1])); c.stroke() } c.setLineDash([]);
    c.fillStyle = winter ? '#f0f0f2' : '#e0cfa0'; for (let t = 40; t < 280; t += 3) { const p = danP(t); c.beginPath(); c.arc(px(p[0]), pz(p[1]), 3.8 * m, 0, TAU); c.fill() }   // Donauinsel beach
  });
}

AV.registerWorld({
  id: 'vienna',
  build(ctx) {
    const S = AV.S, q = ctx.q, rng = ctx.rng, grp = ctx.group, MT = A.mats(), walk = A.walk(), F = AV.forge, win = season() === 'winter';
    if (!S.vienna) S.vienna = { season: 'summer' };
    const B = { city: K.batch(), roofs: K.batch(), misc: K.batch(), glow: K.batch() }, facM = K.floraMat(0, { map: facadeTex(), rough: .8 }), roofM = K.floraMat(0, { map: roofTex(), rough: .6 });
    const box = (b, mat, col, x, y, z, sx, sy, sz, ry, gl) => b.add(mat, A.geo('box'), col, K.M(x, y, z, sx, sy, sz, 0, ry || 0, 0), gl);
    const tri = new THREE.Shape([new THREE.Vector2(-.5, 0), new THREE.Vector2(.5, 0), new THREE.Vector2(0, 1)]), PRISM = new THREE.ExtrudeGeometry(tri, { depth: 1, bevelEnabled: false }).translate(0, 0, -.5);
    const T = (x, z, r, label, fn, show) => ctx.T.push({ x, z, r, label, fn, show });
    const shop = (x, z, label, cost, item, msg) => T(x, z, 2.2, () => tr(label[0], label[1]) + ' (' + cost + ')', () => { if (AV.txn(-cost, label[0])) { AV.bag && AV.bag.add(item, 1, true); AV.toast(tr(msg[0], msg[1])) } });
    const reserved = (x, z, m) => { for (const k in LAND) if (inRect(LAND[k], x, z, m)) return true; return false };
    MD.resetFrames();
    { const fb = AV.$('tF'); if (fb) { fb.style.display = AV.device === 'phone' ? 'block' : 'none'; ctx.leave.push(() => fb.style.display = 'none') } }

    /* ---------- terrain + water ---------- */
    const seg = [110, 150, 190][q], tg = new THREE.PlaneGeometry(XMAX - XMIN, ZMAX - ZMIN, seg, Math.round(seg * .8)); tg.rotateX(-Math.PI / 2);
    const tp = tg.attributes.position; for (let i = 0; i < tp.count; i++) { const x = tp.getX(i), z = tp.getZ(i); tp.setY(i, waterAt(x, z) ? -1.6 : H(x, z)) } tg.computeVertexNormals();
    const gm = new THREE.MeshStandardMaterial({ map: groundTex([1024, 2048, 2048][q], win), roughness: .95 }); gm.userData.lin = 1; const ground = new THREE.Mesh(tg, gm); ground.receiveShadow = true; grp.add(ground);
    const wopt = { deep: 0x1a4a6a, shallow: 0x4a9ab8, sky: 0xb8d8f0, iri: .15, opacity: .9 };
    { const dc = danP(120), dm = K.waterPlane(ctx, new THREE.PlaneGeometry(420, 36), WY, wopt); dm.position.x = dc[0]; dm.position.z = dc[1]; dm.rotation.order = 'YXZ'; dm.rotation.y = -Math.atan2(DD[1], DD[0]) }   /* YXZ: yaw in world space, the plane stays flat */
    for (let i = 1; i < CANAL.length; i++) { const a = CANAL[i - 1], b = CANAL[i], l = Math.hypot(b[0] - a[0], b[1] - a[1]), m = K.waterPlane(ctx, new THREE.PlaneGeometry(l + 8, 8.6), WY, wopt); m.position.x = (a[0] + b[0]) / 2; m.position.z = (a[1] + b[1]) / 2; m.rotation.order = 'YXZ'; m.rotation.y = -Math.atan2(b[1] - a[1], b[0] - a[0]);
      for (const s of [-1, 1]) { const nx = -(b[1] - a[1]) / l * 4.25 * s, nz = (b[0] - a[0]) / l * 4.25 * s; box(B.misc, MT.stone, 0xb8b0a0, (a[0] + b[0]) / 2 + nx, -.5, (a[1] + b[1]) / 2 + nz, l, 1.2, .5, -Math.atan2(b[1] - a[1], b[0] - a[0])) } }
    for (const p of PONDS) { const m = K.waterPlane(ctx, new THREE.CircleGeometry(p.r + .6, 40), WY, wopt); m.position.x = p.x; m.position.z = p.z; B.misc.add(MT.stone, new THREE.TorusGeometry(p.r, .3, 5, 40), 0xc8c0b0, K.M(p.x, .05, p.z, 1, 1, .6, Math.PI / 2, 0, 0)) }
    /* bridges: four over the Donaukanal, two across the Danube + Donauinsel */
    [[.5, 1], [.55, 2], [.5, 3], [.35, 4]].forEach(([f, i]) => { const a = CANAL[i - 1], b = CANAL[i], x = a[0] + (b[0] - a[0]) * f, z = a[1] + (b[1] - a[1]) * f, l = Math.hypot(b[0] - a[0], b[1] - a[1]), nx = -(b[1] - a[1]) / l * 7.5, nz = (b[0] - a[0]) / l * 7.5; A.bridge(B.misc, MT, ctx, walk, x - nx, z - nz, x + nx, z + nz, { w: 5, rise: .9, cRail: 0x3a5a3a, cPost: 0xc8c0b0 }) });
    for (const t of [80, 150]) { const p = danP(t); A.bridge(B.misc, MT, ctx, walk, p[0] - DN[0] * 21, p[1] - DN[1] * 21, p[0] + DN[0] * 21, p[1] + DN[1] * 21, { w: 7, rise: 2.2, cRail: 0xd8402a, cPost: 0x8a8a90 }) }

    /* ---------- Gründerzeit city blocks (perimeter blocks with painted facades, gable roofs, lit shopfronts) ---------- */
    const PAL = [0xf2e6c8, 0xe8d4a0, 0xf0c8b8, 0xe0e8d0, 0xf4f0e8, 0xe8c87a, 0xd8c0a0, 0xc8d8e8], ROOFC = win ? [0xf4f6fa] : [0x7a6a6a, 0xa0603a, 0x6a6a72, 0x6aa08a];
    const bar = (x, z, len, dep, h, ry, col) => { const g = F.uvScale(new THREE.BoxGeometry(1, 1, 1), Math.max(1, Math.round(len / 4)), Math.max(1, Math.round(h / 3.5))); B.city.add(facM, g, col, K.M(x, h / 2, z, len, h, dep, 0, ry, 0));
      B.roofs.add(MT.v, PRISM, ROOFC[(Math.abs(x * 7 + z * 3) | 0) % ROOFC.length], K.M(x, h, z, dep + .6, 3.2, len + .6, 0, ry + Math.PI / 2, 0));
      const c = Math.cos(ry), s = Math.sin(ry); for (const sd of [-1, 1]) box(B.glow, MT.v, [0xffd890, 0xffb860, 0xfff0c8][(Math.abs(x + z) | 0) % 3], x + s * sd * (dep / 2 + .02), 1.5, z + c * sd * (dep / 2 + .02), len * .8, 1.6, .05, ry, .55) };
    const STEP = 30, HALF = 11.5, cityCols = [];
    for (let gx = XMIN + 16; gx < XMAX - 10; gx += STEP) for (let gz = ZMIN + 16; gz < ZMAX - 10; gz += STEP) {
      const x = gx + (rng() - .5) * 2, z = gz + (rng() - .5) * 2; let ok = true;
      for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, 0]]) { const px = x + dx * (HALF + 2), pz = z + dz * (HALF + 2); if (waterAt(px, pz) || canalD(px, pz) < 7 || Math.abs(danS(px, pz)) < 21 || roadD(px, pz) < 2 || reserved(px, pz, 2) || H(px, pz) > .2) ok = false } if (!ok) continue;
      const inner = Math.hypot(x - CX, z - CZ) < RING, hh = inner ? 16 + rng() * 6 : 13 + rng() * 6, col = PAL[(rng() * PAL.length) | 0], d = 7.5;
      bar(x, z - HALF + d / 2, HALF * 2, d, hh, 0, col); bar(x, z + HALF - d / 2, HALF * 2, d, hh + (rng() - .5) * 3, 0, PAL[(rng() * PAL.length) | 0]);
      bar(x - HALF + d / 2, z, HALF * 2 - d * 2, d, hh, Math.PI / 2, col); bar(x + HALF - d / 2, z, HALF * 2 - d * 2, d, hh, Math.PI / 2, PAL[(rng() * PAL.length) | 0]);
      ctx.cols.push([x - HALF, x + HALF, z - HALF, z + HALF]); cityCols.push([x, z]);
    }
    /* 22nd district: glass towers across the Danube */
    [[146, -128, 10, 46], [160, -142, 12, 72], [136, -146, 9, 38], [176, -146, 10, 56]].forEach(([x, z, w, h]) => { box(B.misc, MT.shiny, 0x7a98b8, x, h / 2, z, w, h, w); box(B.glow, MT.v, 0x9ad8ff, x, h / 2, z + w / 2 + .03, w * .9, h * .95, .05, 0, .25); ctx.cols.push([x - w / 2, x + w / 2, z - w / 2, z + w / 2]) });

    /* ---------- STEPHANSPLATZ + cathedral ---------- */
    { const sx = -2, sz = -30;
      box(B.misc, MT.stone, 0xc8b890, sx, 9, sz, 44, 18, 14); ctx.cols.push([sx - 22, sx + 22, sz - 7, sz + 7]);
      B.roofs.add(roofM, PRISM, 0xffffff, K.M(sx, 18, sz, 14.4, 15, 44.4, 0, Math.PI / 2, 0));
      for (let k = -4; k <= 4; k++) for (const s of [-1, 1]) B.misc.add(MT.stone, A.geo('cone'), 0xb8a880, K.M(sx + k * 5, 19.6, sz + s * 7, .5, 3.2, .5));
      box(B.misc, MT.stone, 0xbcae88, sx + 12, 12, sz - 12, 10, 24, 10); box(B.misc, MT.stone, 0xbcae88, sx + 12, 31, sz - 12, 8, 14, 8); ctx.cols.push([sx + 7, sx + 17, sz - 17, sz - 7]);
      B.misc.add(MT.stone, new THREE.CylinderGeometry(.25, 4.6, 40, 8), 0xb8a880, K.M(sx + 12, 58, sz - 12)); B.misc.add(MT.v, A.geo('sph'), 0xffd84a, K.M(sx + 12, 78.4, sz - 12, .4, .4, .4), .8);
      for (const s of [-1, 1]) { box(B.misc, MT.stone, 0xbcae88, sx - 23, 11, sz + s * 4, 4, 22, 4); B.misc.add(MT.stone, new THREE.CylinderGeometry(.2, 2, 9, 8), 0xb8a880, K.M(sx - 23, 26.5, sz + s * 4)) }
      box(B.misc, MT.stone, 0x8a6a4a, sx - 22.4, 4, sz, .3, 8, 4.6); box(B.glow, MT.v, 0xffd890, sx - 22.5, 9, sz, .1, 3, 3, 0, .6);
      ctx.sign('STEPHANSPLATZ', sx - 30, 4.4, sz + 14, -Math.PI / 2, 5, '#ffd84a', { posts: true });
      for (let k = 0; k < 6; k++) { const a = k / 6 * TAU, x = sx - 6 + Math.cos(a) * 24, z = sz + 18 + Math.sin(a) * 10; B.misc.add(MT.shiny, A.geo('cyl'), 0x2a2a2a, K.M(x, 2, z, .08, 4, .08)); B.misc.add(MT.v, A.geo('sph'), 0xfff0c0, K.M(x, 4.1, z, .25, .25, .25), 1) } }
    /* ---------- the bar street: Waxy's · Lukas · Dons (open fronts facing south) ---------- */
    const venue = (x, z, w, d, col, name, signCol, inside) => { const h = 4.6;
      box(B.misc, MT.stucco, col, x, h / 2, z - d / 2, w, h, .3); box(B.misc, MT.stucco, col, x - w / 2, h / 2, z, .3, h, d); box(B.misc, MT.stucco, col, x + w / 2, h / 2, z, .3, h, d); box(B.misc, MT.stucco, 0x3a3030, x, h + .2, z, w + .6, .4, d + .6);
      ctx.cols.push([x - w / 2, x + w / 2, z - d / 2 - .15, z - d / 2 + .15], [x - w / 2 - .15, x - w / 2 + .15, z - d / 2, z + d / 2], [x + w / 2 - .15, x + w / 2 + .15, z - d / 2, z + d / 2]);
      box(B.misc, MT.wood, 0x6a4028, x, .55, z - d / 2 + 1.2, w - 1.6, 1.1, .8); ctx.cols.push([x - w / 2 + .8, x + w / 2 - .8, z - d / 2 + .8, z - d / 2 + 1.6]); box(B.glow, MT.v, signCol, x, 3.6, z - d / 2 + .2, w - 2, .1, .05, 0, 1);
      for (let k = 0; k < 4; k++) box(B.misc, MT.wood, 0x4a2a18, x - w / 2 + 2 + k * (w - 4) / 3, .4, z - d / 2 + 2.4, .45, .8, .45);
      ctx.sign(name, x, h + 1.4, z + d / 2 + .3, 0, Math.min(6, w - .6), '#' + new THREE.Color(signCol).getHexString()); const l = new THREE.PointLight(signCol, .7, 12); l.position.set(x, 3.4, z); grp.add(l); if (inside) inside(x, z, w, d) };
    venue(22, -50, 10, 9, 0x2a5a2a, 'WAXY’S IRISH BAR', 0x7aff8a, (x, z, w, d) => { for (let k = 0; k < 3; k++) B.misc.add(MT.v, A.geo('cyl'), 0xffd84a, K.M(x - 2 + k * 2, 1.35, z - d / 2 + 1.2, .12, .3, .12)) });
    venue(34, -50, 10, 9, 0x6a3a1a, 'LUKAS · Viennese Bar', 0xffd890); venue(46, -50, 10, 9, 0x4a1a5a, 'DONS SHISHA BAR', 0xd87aff, (x, z, w, d) => { for (let k = 0; k < 3; k++) { B.misc.add(MT.v, A.geo('cyl'), 0x9a6aff, K.M(x - 3 + k * 3, .7, z + 1, .25, 1.4, .25), .3); for (let j = 0; j < 4; j++) B.misc.add(MT.v, A.geo('cyl'), [0xd84a8a, 0x4ac8c8][j % 2], K.M(x - 3 + k * 3 + Math.cos(j * 1.57) * 1.2, .2, z + 1 + Math.sin(j * 1.57) * 1.2, .5, .4, .5)) } });
    shop(22, -46.5, ['Waxy’s: cheap pint', 'Waxy’s: pinta barata'], 4, 'waxys_pint', ['“Cheap drinks and good vibes”, as promised.', '“Bebidas baratas y buen rollo”, como prometían.']);
    shop(34, -46.5, ['Lukas: Weißer Spritzer', 'Lukas: Spritzer blanco'], 5, 'spritzer', ['Lukas pours it like it’s 2007 again.', 'Lukas lo sirve como si fuera 2007 otra vez.']);
    shop(46, -46.5, ['Dons: shisha (adults)', 'Dons: shisha (adultos)'], 12, 'shisha', ['Don brings double apple and a story about his cousin.', 'Don trae doble manzana y una historia sobre su primo.']);
    if (!win) for (let k = 0; k < 6; k++) { const x = 19 + k * 5.6, z = -42.6; B.misc.add(MT.shiny, A.geo('cyl'), 0xc0c0c0, K.M(x, 1.1, z, .04, 2.2, .04)); B.misc.add(MT.dbl, A.geo('halfDome'), [0x2a8a4a, 0xe8d8b0, 0x8a2a8a][k % 3], K.M(x, 2.2, z, 1.4, .4, 1.4), .1) }   // summer terrace parasols
    /* ---------- Würstel Stand + Happy Noodles ---------- */
    box(B.misc, MT.shiny, 0x2a4a8a, 30, 1.3, 2, 4, 2.6, 2.4); box(B.misc, MT.v, 0xe83a30, 30, 2.8, 3.4, 4.4, .12, 1.4, 0, .3); box(B.glow, MT.v, 0xffd890, 30, 1.6, 3.22, 3.4, .8, .05, 0, .7); ctx.cols.push([28, 32, .8, 3.2]);
    ctx.sign('WÜRSTEL STAND · 24h', 30, 4.2, 3.4, 0, 3.6, '#ffd84a'); shop(30, 5.4, ['Würstel Stand: Käsekrainer', 'Würstelstand: Käsekrainer'], 5, 'kaesekrainer', ['“A Eitrige mit an Buckl und a 16er Blech.” You understood none of that. Delicious.', '“A Eitrige mit an Buckl und a 16er Blech.” No entendiste nada. Delicioso.']);
    shop(30.5, 5.6, ['Würstel Stand: Almdudler', 'Würstelstand: Almdudler'], 3, 'almdudler', ['Herbal fizz. Very Austrian.', 'Burbujas de hierbas. Muy austriaco.']);
    box(B.misc, MT.shiny, 0xe8402a, 48, 1.3, -4, 5, 2.6, 2.6); box(B.glow, MT.v, 0xffd84a, 48, 1.7, -2.68, 4.2, .9, .05, 0, .8); ctx.cols.push([45.5, 50.5, -5.3, -2.7]); ctx.sign('HAPPY NOODLES · Asian food', 48, 4.2, -2.6, 0, 4.4, '#ff8a3a');
    for (const [x, z] of [[44, 2], [48, 3], [52, 2]]) { B.misc.add(MT.wood, A.geo('cyl'), 0xc8a070, K.M(x, .75, z, .55, .06, .55)); B.misc.add(MT.v, A.geo('cyl'), 0x3a3a3a, K.M(x, .38, z, .05, .76, .05)); ctx.circles.push([x, z, .5]) }
    shop(48, -1.6, ['Happy Noodles: box noodles', 'Happy Noodles: fideos en caja'], 7, 'happy_noodles', ['Spicy, cheap, perfect at 2 a.m.', 'Picantes, baratos, perfectos a las 2 de la mañana.']);

    /* ---------- Donaukanal: FLEX + BADESCHIFF ---------- */
    { const fx = -49, fz = -6; box(B.misc, MT.stone, 0x5a5a60, fx, 2.6, fz - 4.5, 12, 5.2, .5); box(B.misc, MT.stone, 0x5a5a60, fx - 6, 2.6, fz, .5, 5.2, 9); box(B.misc, MT.stone, 0x5a5a60, fx + 6, 2.6, fz + 2.6, .5, 5.2, 3.8); box(B.misc, MT.stone, 0x4a4a50, fx, 5.3, fz, 12.6, .5, 9.6);
      ctx.cols.push([fx - 6, fx + 6, fz - 4.75, fz - 4.25], [fx - 6.25, fx - 5.75, fz - 4.5, fz + 4.5], [fx + 5.75, fx + 6.25, fz + .7, fz + 4.5]);
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 7), new THREE.MeshBasicMaterial({ color: 0x2a0a3a })); floor.rotation.x = -Math.PI / 2; floor.position.set(fx, .03, fz); grp.add(floor);
      box(B.misc, MT.shiny, 0x1a1a24, fx - 4, .7, fz - 3, 3, 1.4, 1.2); box(B.glow, MT.v, 0xff4ad2, fx - 4, 1.42, fz - 2.38, 3, .08, .04, 0, 1);
      ctx.sign('FLEX', fx + 6.4, 4.2, fz - 1.6, Math.PI / 2, 3.2, '#d87aff'); const l = new THREE.PointLight(0xb04aff, 1.2, 14); l.position.set(fx, 4, fz); grp.add(l);
      ctx.upd.push((dt, t) => { const b = AV.audio && AV.audio.beat || t * 2; l.color.setHSL((b * .05) % 1, .9, .6); floor.material.color.setHSL((b * .05 + .5) % 1, .7, .15 + .1 * Math.max(0, Math.cos(b * Math.PI))) }) }
    { const a = CANAL[0], b = CANAL[1], f = .66, cx = a[0] + (b[0] - a[0]) * f, cz = a[1] + (b[1] - a[1]) * f, l = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / l, uz = (b[1] - a[1]) / l, ry = -Math.atan2(uz, ux);
      box(B.misc, MT.shiny, 0x1a3a6a, cx, -.2, cz, 26, 1.6, 5.4, ry); box(B.glow, MT.v, 0x3ad8ff, cx, .62, cz, 10, .05, 3, ry, .8);   // hull + glowing pool
      A.bridge(B.misc, MT, ctx, walk, cx - ux * 12, cz - uz * 12, cx + ux * 12, cz + uz * 12, { w: 4.6, rise: .15, cRail: 0xffd84a, cPost: 0xffffff });
      const nx = -uz, nz = ux; A.bridge(B.misc, MT, ctx, walk, cx + nx * 1.5, cz + nz * 1.5, cx + nx * 6.5, cz + nz * 6.5, { w: 2, rise: .3, cRail: 0xffd84a, cPost: 0xffffff });
      K.lanterns(ctx, [[cx - ux * 12, 3, cz - uz * 12], [cx, 3.6, cz], [cx + ux * 12, 3, cz + uz * 12]], { cols: [0xff4ad2, 0x3ad8ff, 0xffd84a], per: 18, sag: .3 });
      ctx.sign('BADESCHIFF · club on the water', cx + nx * 7, 3.6, cz + nz * 7, Math.atan2(nx, nz), 5, '#3ad8ff', { posts: true }); LAND.badeschiff = { x: cx, z: cz, ux, uz } }

    /* ---------- NASCHMARKT ---------- */
    { const N = LAND.nasch, cols = [0xe83a30, 0x2a8a4a, 0xffd84a, 0x3a6ad8, 0xff8a3a];
      for (let i = 0; i < 9; i++) for (const s of [-1, 1]) { const x = N.x0 + 5 + i * 7, z = (N.z0 + N.z1) / 2 + s * 6; box(B.misc, MT.wood, 0xd8c8a8, x, 1.4, z, 5.6, 2.8, 4); B.roofs.add(MT.v, PRISM, cols[(i + (s > 0 ? 2 : 0)) % 5], K.M(x, 2.8, z, 4.6, 1.2, 6, 0, Math.PI / 2, 0)); box(B.glow, MT.v, 0xfff0c0, x, 1.4, z - s * 2.03, 4.6, 1.2, .05, 0, .5); ctx.cols.push([x - 2.8, x + 2.8, z - 2, z + 2]) }
      shop(N.x0 + 12, (N.z0 + N.z1) / 2 - 3, ['Naschmarkt: falafel + hummus', 'Naschmarkt: falafel y hummus'], 6, 'snack', ['Crispy falafel. The vendor insists you try the olives too.', 'Falafel crujiente. El vendedor insiste en que pruebes las aceitunas.']);
      shop(N.x0 + 33, (N.z0 + N.z1) / 2 + 3, ['Naschmarkt: fresh mango', 'Naschmarkt: mango fresco'], 3, 'mango', ['Sweet as the summer of 2006.', 'Dulce como el verano de 2006.']);
      ctx.sign('NASCHMARKT · food · markets', N.x0 - 2, 4.4, (N.z0 + N.z1) / 2, -Math.PI / 2, 5, '#ffd84a', { posts: true }) }

    /* ---------- KARLSPLATZ: Karlskirche, columns, pool, summer cinema, rave stage ---------- */
    { const kx = 14, kz = 114;
      box(B.misc, MT.stucco, 0xf0e8d8, kx, 9, kz, 26, 18, 14); ctx.cols.push([kx - 13, kx + 13, kz - 7, kz + 7]);
      B.misc.add(MT.stucco, A.geo('cyl'), 0xf0e8d8, K.M(kx, 21, kz, 8, 6, 8)); B.misc.add(MT.shiny, A.geo('dome'), 0x5ab89a, K.M(kx, 24, kz, 8.4, 9, 8.4)); B.misc.add(MT.v, A.geo('cyl'), 0x5ab89a, K.M(kx, 34, kz, .8, 3, .8)); B.misc.add(MT.v, A.geo('sph'), 0xffd84a, K.M(kx, 36, kz, .6, .6, .6), .6);
      for (let k = 0; k < 6; k++) B.misc.add(MT.stucco, A.geo('cyl'), 0xf4f0e8, K.M(kx - 7.5 + k * 3, 6, kz - 9, .7, 12, .7)); box(B.misc, MT.stucco, 0xf0e8d8, kx, 13, kz - 9, 18, 2.4, 3); B.roofs.add(MT.stucco, PRISM, 0xf0e8d8, K.M(kx, 14.2, kz - 9, 18, 3.5, 3.4)); ctx.cols.push([kx - 9, kx + 9, kz - 10, kz - 8]);
      for (const s of [-1, 1]) { B.misc.add(MT.stucco, A.geo('cyl'), 0xe8e0d0, K.M(kx + s * 17, 13, kz - 4, 1.6, 26, 1.6)); B.misc.add(MT.v, A.geo('sph'), 0xffd84a, K.M(kx + s * 17, 26.5, kz - 4, .9, .9, .9), .5); ctx.circles.push([kx + s * 17, kz - 4, 1.8]) }
      box(B.glow, MT.v, 0x3ab8e8, kx, .06, kz - 20, 22, .1, 8, 0, .5); ctx.cols.push([kx - 11, kx + 11, kz - 24, kz - 16]);
      const scr = MD.cinemaScreen(ctx, -16, 4.6, 92, Math.PI / 2, 10, { radius: 20, name: tr('KARLSPLATZ SUMMER CINEMA', 'CINE DE VERANO KARLSPLATZ'), tags: ['mv', 'lcb'], shorts: false, glow: 0xffd84a });
      for (let r = 0; r < 3; r++) for (let k = -2; k <= 2; k++) { const x = -8 + r * 2.4, z = 92 + k * 2; box(B.misc, MT.wood, 0x8a5a3a, x, .3, z, .7, .6, 1.6); ctx.circles.push([x, z, .5]) }
      T(-10, 92, 2.6, () => tr('Summer cinema: choose a film', 'Cine de verano: elegir película'), () => MD.openCinema(scr));
      box(B.misc, MT.wood, 0x2a2a30, 40, .5, 92, 8, 1, 5); box(B.misc, MT.shiny, 0x1a1a24, 40, 1.5, 90.6, 3.4, 1, 1.2); for (const s of [-1, 1]) box(B.misc, MT.shiny, 0x16141e, 40 + s * 4.6, 2, 90.2, 1.6, 3, 1.4); walk.pad(40, 92, 3.6, 1);
      box(B.glow, MT.v, 0xff4ad2, 40, 1.05, 94.52, 8, .1, .05, 0, 1); ctx.sign('KARLSPLATZ RAVE', 40, 6, 89.4, 0, 4.6, '#ff4ad2');
      ctx.sign('KARLSPLATZ · Karlskirche', kx + 24, 4.2, kz - 24, 0, 5, '#ffd84a', { posts: true }) }

    /* ---------- STADTPARK: trees, pond, golden living statue ---------- */
    const trees = [];
    const treeAt = (x, z, s) => { if (waterAt(x, z) || roadD(x, z) < 1) return; trees.push({ x, y: H(x, z), z, s: s || 1 + rng() * .5, ry: rng() * TAU }); ctx.circles.push([x, z, .45]) };
    { const P = LAND.stadt; for (let i = 0; i < [14, 22, 30][q]; i++) { const x = P.x0 + 3 + rng() * (P.x1 - P.x0 - 6), z = P.z0 + 3 + rng() * (P.z1 - P.z0 - 6); if (Math.hypot(x - PONDS[0].x, z - PONDS[0].z) > 9 && Math.hypot(x - 98, z - 38) > 4) treeAt(x, z) }
      box(B.misc, MT.stone, 0xe8e0d0, 98, .8, 38, 2.4, 1.6, 2.4); ctx.cols.push([96.8, 99.2, 36.8, 39.2]); ctx.sign('STADTPARK · relax · music', P.x0 + 2, 3.8, P.z0 + 2, -Math.PI / 4, 4.4, '#7aff8a', { posts: true }) }
    /* along the Ring: tree alleys */
    for (let a = 0; a < TAU; a += TAU / [40, 56, 72][q]) for (const rr of [RING - 7.5, RING + 7.5]) { const x = CX + Math.cos(a) * rr, z = CZ + Math.sin(a) * rr; if (!reserved(x, z, 0) && !waterAt(x, z) && roadD(x, z) > .5 && !ctx.cols.some(c => x > c[0] - 1 && x < c[1] + 1 && z > c[2] - 1 && z < c[3] + 1)) treeAt(x, z, 1.1) }

    /* ---------- PRATER: Riesenrad, roller coaster, carousel, Hauptallee ---------- */
    let wheel = null, carousel = null;
    { const P = LAND.prater, wx = 152, wz = -26, WR = 22;
      for (const s of [-1, 1]) { B.misc.add(MT.shiny, A.geo('cyl'), 0x8a2a2a, K.M(wx + 5, WR / 2 + 1, wz + s * 3, .5, WR + 4, .5, 0, 0, .25)); B.misc.add(MT.shiny, A.geo('cyl'), 0x8a2a2a, K.M(wx - 5, WR / 2 + 1, wz + s * 3, .5, WR + 4, .5, 0, 0, -.25)); ctx.circles.push([wx + 10, wz + s * 3, .8], [wx - 10, wz + s * 3, .8]) }
      wheel = new THREE.Group(); wheel.position.set(wx, WR + 3, wz); grp.add(wheel); const wm = new THREE.MeshStandardMaterial({ color: 0x9a2a2a, roughness: .5, metalness: .4 });
      for (const s of [-1, 1]) { const rim = new THREE.Mesh(new THREE.TorusGeometry(WR, .3, 6, 64), wm); rim.position.z = s * 2.6; wheel.add(rim); for (let k = 0; k < 15; k++) { const a = k / 15 * TAU, sp = new THREE.Mesh(AV.G.cyl, wm); sp.scale.set(.08, WR, .08); sp.position.set(Math.cos(a) * WR / 2, Math.sin(a) * WR / 2, s * 2.6); sp.rotation.z = a - Math.PI / 2; wheel.add(sp) } }
      const cabM = new THREE.MeshStandardMaterial({ color: 0xc83a2a, roughness: .5 }), cabins = []; for (let k = 0; k < 15; k++) { const a = k / 15 * TAU, c = new THREE.Mesh(AV.G.box, cabM); c.scale.set(3, 2.4, 4.2); c.position.set(Math.cos(a) * WR, Math.sin(a) * WR - 1.4, 0); wheel.add(c); cabins.push(c); const wl = new THREE.Mesh(AV.G.box, new THREE.MeshBasicMaterial({ color: 0xfff0c0 })); wl.scale.set(1.02, .3, .8); wl.position.y = .15; c.add(wl) }
      ctx.upd.push((dt, t) => { wheel.rotation.z = t * .04; cabins.forEach(c => c.rotation.z = -wheel.rotation.z) });
      const pts = []; for (let i = 0; i <= 64; i++) { const u = i / 64 * TAU; pts.push(new THREE.Vector3(124 + Math.cos(u) * 12, 4 + Math.sin(u * 3) * 3 + 3 * (1 + Math.cos(u)), 2 + Math.sin(u) * 8)) }
      const cc = new THREE.CatmullRomCurve3(pts, true); B.misc.add(MT.v, new THREE.TubeGeometry(cc, 160, .35, 6, true), 0xffd84a, new THREE.Matrix4(), .2); for (let i = 0; i < 64; i += 4) { const p = pts[i]; B.misc.add(MT.shiny, A.geo('cyl'), 0x3a6ad8, K.M(p.x, p.y / 2, p.z, .15, p.y, .15)); ctx.circles.push([p.x, p.z, .3]) }
      carousel = new THREE.Group(); carousel.position.set(170, 0, 6); grp.add(carousel); const cm = new THREE.MeshStandardMaterial({ color: 0xff8ad8, roughness: .5 }); const disc = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, .5, 24), cm); disc.position.y = .25; carousel.add(disc);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(6.6, 3, 24), new THREE.MeshStandardMaterial({ color: 0xffd84a, roughness: .5 })); roof.position.y = 5.5; carousel.add(roof); const pole = new THREE.Mesh(AV.G.cyl, cm); pole.scale.set(.4, 5, .4); pole.position.y = 2.5; carousel.add(pole);
      for (let k = 0; k < 8; k++) { const a = k / 8 * TAU, h = new THREE.Mesh(AV.G.box, new THREE.MeshStandardMaterial({ color: [0xffffff, 0x7ff0ff, 0xffd84a, 0xff4ad2][k % 4] })); h.scale.set(.5, 1, 1.6); h.position.set(Math.cos(a) * 4.5, 1.6, Math.sin(a) * 4.5); h.rotation.y = -a; carousel.add(h) } ctx.circles.push([170, 6, 6.4]);
      ctx.upd.push((dt, t) => { carousel.rotation.y = t * .5; carousel.children.slice(3).forEach((h, k) => h.position.y = 1.6 + Math.sin(t * 2 + k) * .4) });
      for (let k = 0; k < 10; k++) { treeAt(112 + k * 7, 14); treeAt(112 + k * 7, 22) }
      box(B.misc, MT.wood, 0x8a4a2a, 136, 1.3, 14, 5, 2.6, 3); box(B.glow, MT.v, 0xffd890, 136, 1.6, 15.52, 4.4, .9, .05, 0, .7); ctx.cols.push([133.5, 138.5, 12.5, 15.5]); shop(136, 17, ['Prater bar: beer', 'Bar del Prater: cerveza'], 4, 'beer', ['A beer under the Riesenrad. Very 2000s.', 'Una cerveza bajo la Noria. Muy de los 2000.']);
      K.lanterns(ctx, [[112, 4, 18], [130, 4.4, 18], [150, 4, 18], [170, 4.4, 18], [186, 4, 18]], { cols: [0xff4ad2, 0xffd84a, 0x7ff0ff, 0x7aff8a], per: 14, sag: .4 });
      ctx.sign('PRATER · Riesenrad · rides · bars', 114, 4.6, -4, -Math.PI / 2, 5.5, '#ff8ac0', { posts: true }) }

    /* ---------- CHRISTMAS MARKET (open in winter) ---------- */
    { const P = LAND.xmas, mx = (P.x0 + P.x1) / 2, mz = (P.z0 + P.z1) / 2;
      for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { if (i === 1 && j === 1) continue; const x = P.x0 + 8 + i * 13, z = P.z0 + 8 + j * 17; box(B.misc, MT.wood, 0x8a5a3a, x, 1.4, z, 5, 2.8, 3.6); B.roofs.add(MT.v, PRISM, win ? 0xf4f6fa : 0x5a3a2a, K.M(x, 2.8, z, 4.4, 1.4, 5.6, 0, Math.PI / 2, 0)); box(B.glow, MT.v, win ? 0xffd890 : 0x4a3a2a, x, 1.4, z + 1.82, 4.2, 1.2, .05, 0, win ? .8 : 0); ctx.cols.push([x - 2.5, x + 2.5, z - 1.8, z + 1.8]) }
      B.misc.add(MT.v, A.geo('cone'), 0x1a5a2a, K.M(mx, 7, mz, 5, 14, 5)); B.misc.add(MT.v, A.geo('cyl'), 0x5a3a1a, K.M(mx, .6, mz, .6, 1.2, .6)); ctx.circles.push([mx, mz, 3.5]); B.misc.add(MT.v, A.geo('ico'), 0xffd84a, K.M(mx, 14.6, mz, .8, .8, .8), win ? 1 : .2);
      if (win) for (let k = 0; k < 60; k++) { const h = rng() * 12, rr = (1 - h / 14) * 4.6 + .2, a = rng() * TAU; B.glow.add(MT.v, A.geo('sph'), [0xff4a4a, 0xffd84a, 0x7ff0ff, 0xffffff][k % 4], K.M(mx + Math.cos(a) * rr, 1 + h, mz + Math.sin(a) * rr, .18, .18, .18), 1) }
      if (win) { box(B.glow, MT.v, 0xd8f0ff, P.x0 + 40, .05, P.z1 - 8, 14, .1, 9, 0, .25); ctx.sign('ICE RINK', P.x0 + 40, 3, P.z1 - 13, 0, 3, '#9ad8ff') }
      ctx.sign(win ? 'CHRISTMAS MARKET · punch · Glühwein' : 'CHRISTMAS MARKET (winter only — press F)', mx, 4.6, P.z0 - 1, 0, 6, win ? '#ffd84a' : '#a8a8b8', { posts: true });
      if (win) { shop(P.x0 + 8, P.z0 + 10.6, ['Glühwein stand', 'Puesto de Glühwein'], 5, 'gluehwein', ['Hot, spiced, in a collectable mug.', 'Caliente, con especias, en una taza de recuerdo.']); shop(P.x0 + 21, P.z0 + 10.6, ['Punsch stand', 'Puesto de ponche'], 5, 'punsch', ['Orange punch. Your cheeks are now officially red.', 'Ponche de naranja. Tus mejillas ya están rojas oficialmente.']); shop(P.x0 + 34, P.z0 + 10.6, ['Sweets: Sachertorte slice', 'Dulces: porción de Sacher'], 6, 'sachertorte', ['Chocolate, apricot, cream. You hum a waltz.', 'Chocolate, albaricoque y nata. Tarareas un vals.']) } }

    /* ---------- BELVEDERE ---------- */
    { const bx = 90, bz = 124; box(B.misc, MT.stucco, 0xf4f0e8, bx, 7, bz, 50, 14, 12); ctx.cols.push([bx - 25, bx + 25, bz - 6, bz + 6]); for (const s of [-1, 0, 1]) B.misc.add(MT.shiny, A.geo('dome'), 0x5ab89a, K.M(bx + s * 18, 14, bz, s ? 4 : 6, s ? 4 : 6, s ? 4 : 6));
      box(B.glow, MT.v, 0x3ab8e8, bx, .06, bz - 20, 30, .1, 6, 0, .45); ctx.cols.push([bx - 15, bx + 15, bz - 23, bz - 17]); for (let k = 0; k < 8; k++) for (const s of [-1, 1]) treeAt(bx + s * 18, bz - 12 - k * 3.2, .8);
      ctx.sign('BELVEDERE · art · gardens', bx - 26, 4, bz - 26, 0, 5, '#9ad8ff', { posts: true }) }
    /* ---------- SCHÖNBRUNN ---------- */
    { const sx = -100, sz = 104; box(B.misc, MT.stucco, 0xf0c84a, sx, 8, sz, 84, 16, 13); ctx.cols.push([sx - 42, sx + 42, sz - 6.5, sz + 6.5]); B.roofs.add(MT.v, PRISM, win ? 0xf4f6fa : 0x5a8a6a, K.M(sx, 16, sz, 13.4, 3, 84.4, 0, Math.PI / 2, 0));
      for (let k = 0; k < 6; k++) for (const s of [-1, 1]) box(B.misc, MT.v, win ? 0xf0f4f8 : 0x3a8a3a, sx + s * (10 + k * 5), .15, 120, 3.6, .3, 8, 0, 0);
      B.misc.add(MT.stone, A.geo('cyl'), 0xe8e0d0, K.M(PONDS[1].x, 1.2, PONDS[1].z, 1, 2.4, 1)); B.misc.add(MT.v, A.geo('sph'), 0xffd84a, K.M(PONDS[1].x, 3, PONDS[1].z, .6, .9, .6), .3);
      for (let k = 0; k < 7; k++) { B.misc.add(MT.stucco, A.geo('cyl'), 0xf4f0e8, K.M(-118 + k * 6, 3, 144, .6, 6, .6)); ctx.circles.push([-118 + k * 6, 144, .7]) } box(B.misc, MT.stucco, 0xf4f0e8, -100, 6.4, 144, 40, 1.2, 2.4);
      ctx.sign('SCHÖNBRUNN · summer palace · gardens', sx + 46, 4.4, sz - 12, 0, 6, '#ffd84a', { posts: true }) }
    /* ---------- MEMORY ZONE: graffiti wall, basketball court, skate ramp ---------- */
    { const M0 = LAND.memory; const gw = new THREE.Mesh(new THREE.PlaneGeometry(24, 9), new THREE.MeshStandardMaterial({ map: graffitiTex(), roughness: .8 })); gw.material.userData.lin = 1; gw.position.set(6, 4.5, M0.z1 - 1.6); gw.rotation.y = Math.PI; grp.add(gw); box(B.misc, MT.stone, 0x8a8a90, 6, 4.5, M0.z1 - 1.2, 24.6, 9.2, .6); ctx.cols.push([-6.3, 18.3, M0.z1 - 1.6, M0.z1 - .9]);
      box(B.glow, MT.v, 0xd86a2a, 6, .04, 130, 15, .06, 9, 0, .2); for (const s of [-1, 1]) { B.misc.add(MT.shiny, A.geo('cyl'), 0xe8e8e8, K.M(6 + s * 7.2, 1.6, 130, .08, 3.2, .08)); box(B.misc, MT.v, 0xffffff, 6 + s * 6.9, 3, 130, .1, 1.1, 1.6) }
      B.misc.add(MT.stone, PRISM, 0x9a9aa0, K.M(-8, 0, 126, 6, 2, 4)); ctx.cols.push([-11, -5, 124, 128]);
      ctx.sign('MEMORY ZONE · 2000s · friends · growing up', 6, 4.4, M0.z0 - 1, 0, 6.4, '#7ff0ff', { posts: true }) }
    /* ---------- 22nd district: VIS school by the Alte Donau ---------- */
    { const vx = 172, vz = -122; box(B.misc, MT.stucco, 0xe8e8e8, vx, 6, vz, 22, 12, 12); for (let k = 0; k < 3; k++) box(B.glow, MT.v, 0x9ad8ff, vx, 2.2 + k * 3.6, vz + 6.04, 20, 1.6, .05, 0, .25); ctx.cols.push([vx - 11, vx + 11, vz - 6, vz + 6]);
      ctx.sign('VIENNA INTERNATIONAL SCHOOL · school memory zone', vx, 13.6, vz + 6.3, 0, 8, '#7ff0ff');
      if (!win) for (let k = 0; k < 6; k++) { const p = danP(70 + k * 18); B.misc.add(MT.shiny, A.geo('cyl'), 0xc0c0c0, K.M(p[0], 1.1, p[1], .04, 2.2, .04)); B.misc.add(MT.dbl, A.geo('halfDome'), [0xff4ad2, 0xffd84a, 0x3ad8ff][k % 3], K.M(p[0], 2.2, p[1], 1.4, .4, 1.4), .1); box(B.misc, MT.wood, 0xf4f0e8, p[0] + 1.4, .25, p[1], 1, .3, 2) } }
    /* ---------- KAHLENBERG viewpoint ---------- */
    { const kx = -150, kz = -125, ky = H(kx, kz); box(B.misc, MT.wood, 0x8a6a4a, kx, ky + .1, kz, 10, .3, 8); for (const s of [-1, 1]) box(B.misc, MT.wood, 0x6a4a2a, kx + s * 5, ky + .7, kz, .15, 1, 8);
      B.misc.add(MT.shiny, new THREE.CylinderGeometry(.4, 1.6, 70, 8), 0xd8d8e0, K.M(kx - 14, H(kx - 14, kz - 8) + 35, kz - 8)); B.misc.add(MT.v, A.geo('sph'), 0xff3a3a, K.M(kx - 14, H(kx - 14, kz - 8) + 70.5, kz - 8, .6, .6, .6), 1); ctx.circles.push([kx - 14, kz - 8, 1.8]);
      T(kx, kz + 2, 3, () => tr('Kahlenberg viewpoint: look over the city', 'Mirador del Kahlenberg: mirar la ciudad'), () => { AV.P.yaw = Math.atan2(-(0 - kx), -(-15 - kz)); AV.P.pitch = -.05; AV.vitals && AV.vitals.add(0, 8); AV.toast(tr('The whole city below: the cathedral spire, the Riesenrad, the Danube glittering. You remember everything.', 'Toda la ciudad abajo: la aguja de la catedral, la Noria, el Danubio brillando. Lo recuerdas todo.')) });
      ctx.sign('KAHLENBERG · viewpoint', kx + 8, ky + 3, kz + 6, Math.PI / 4, 4, '#7aff8a', { posts: true }) }
    /* ---------- portal home ---------- */
    { const px = 168, pz = 124; AV.mk(AV.G.tor, AV.std(0xb07aff, .4, 0, 0xb07aff, 1), px, 2.6, pz, 2.6, 2.6, 2.6, grp, false); const pm = new THREE.Mesh(AV.G.pln, new THREE.MeshBasicMaterial({ color: 0xb07aff, transparent: true, opacity: .45, side: THREE.DoubleSide })); pm.scale.set(5, 5, 1); pm.position.set(px, 2.6, pz); grp.add(pm);
      for (const s of [-1, 1]) { box(B.misc, MT.stone, 0x9a8a7a, px + s * 3.2, 2.7, pz, .8, 5.4, .8); ctx.circles.push([px + s * 3.2, pz, .5]) } T(px, pz - 2.5, 3, () => tr('Portal: back to Ape Town', 'Portal: volver a Ape Town'), () => AV.travel('ape_town', 'vienna'));
      ctx.sign('PORTAL TO APE TOWN', px, 6.6, pz, 0, 4, '#d8a0ff') }

    /* ---------- trees (parks + alleys) ---------- */
    { const LP = LAND.prater; for (let i = 0; i < [8, 14, 20][q]; i++) treeAt(LP.x0 + 4 + rng() * (LP.x1 - LP.x0 - 8), 20 + rng() * 3);
      const LS = LAND.schon; for (let i = 0; i < [8, 12, 16][q]; i++) { const x = LS.x0 + 4 + rng() * (LS.x1 - LS.x0 - 8), z = 132 + rng() * 8; if (Math.hypot(x - PONDS[1].x, z - PONDS[1].z) > 8) treeAt(x, z, .9) }
      const KH = LAND.kahl; for (let i = 0; i < [10, 16, 24][q]; i++) { const x = KH.x0 + 4 + rng() * 80, z = KH.z0 + 4 + rng() * 60; if (Math.hypot(x + 150, z + 125) > 9) treeAt(x, z, 1 + rng() * .4) }
      const green = trees.filter((_, i) => i % 3), pink = trees.filter((_, i) => !(i % 3));
      if (win) K.scatter(ctx, K.species.candyTree(0x5a4a40, 0xe8eef4, 0xf4f8fc, 0xffffff), K.floraMat(.004), trees, { far: K.far(false), cell: 64 });
      else { K.scatter(ctx, K.species.candyTree(0x5a3a2a, 0x3a8a3a, 0x4a9a3a, 0x7ac84a), K.floraMat(.004), green, { far: K.far(false), cell: 64 }); K.scatter(ctx, K.species.candyTree(0x5a3a3a, 0xf0a0c8, 0xffc0d8, 0xffffff), K.floraMat(.01), pink, { far: K.far(false), cell: 64 }) } }

    /* ---------- U-Bahn: fast travel between stations ---------- */
    const dp = danP(110), STATIONS = [['Stephansplatz', 14, -4], ['Karlsplatz', -4, 80], ['Praterstern', 110, -30], ['Schönbrunn', -100, 88], ['Kettenbrückengasse (Naschmarkt)', -28, 46], ['Donauinsel', dp[0], dp[1]], ['Kahlenberg (bus)', -134, -112]];
    STATIONS.forEach(([n, x, z]) => { box(B.misc, MT.shiny, 0x2a4ab8, x, 2.2, z, .3, 4.4, .3); box(B.glow, MT.v, 0x3a6aff, x, 4.8, z, 1.2, 1.2, .3, 0, 1); ctx.circles.push([x, z, .4]);
      T(x + 1.6, z, 2.4, () => tr('U-Bahn ', 'U-Bahn ') + n + tr(': ride (2 credits)', ': viajar (2 créditos)'), () => { const p = AV.panel('cmp', '<b>U-Bahn</b><div class="note">' + tr('Mind the gap. 2 credits per ride.', 'Cuidado con el hueco. 2 créditos por viaje.') + '</div><div class="grid">' + STATIONS.filter(s => s[0] !== n).map(s => '<button data-u="' + s[0] + '">U · ' + s[0] + '</button>').join('') + '</div><button data-close>' + tr('Close', 'Cerrar') + '</button>');
        p.querySelectorAll('[data-u]').forEach(b => b.onclick = () => { const s = STATIONS.find(v => v[0] === b.dataset.u); if (!AV.txn(-2, 'U-Bahn')) return; AV.closePanel('cmp'); AV.fadeTo(1, 350); AV.audio && AV.audio.blip(523, .2, 'sine', .1); setTimeout(() => { AV.audio && AV.audio.blip(392, .3, 'sine', .1); const P = AV.P, sp = AV.safeSpot(AV.W, s[1] + 2.2, s[2] + 1); P.x = sp[0]; P.z = sp[1]; P.y = AV.W.surface(P.x, P.z) || 0; P.vx = P.vz = 0; S.time += 8; AV.fadeTo(0, 500); AV.toast('U · ' + s[0] + tr(' — “Zurückbleiben, bitte!”', ' — “¡Zurückbleiben, bitte!”')) }, 900) }) }) });

    /* ---------- Ringstraße trams (traffic) + rideable Ring tram ---------- */
    const ringPts = []; for (let i = 0; i < 48; i++) { const a = i / 48 * TAU; ringPts.push([CX + Math.cos(a) * RING, CZ + Math.sin(a) * RING]) }
    if (CY.traffic) CY.traffic(ctx, [{ pts: ringPts, off: 1.6 }], [{ type: 'tram', col: 0xd8202a, n: [2, 3, 4][q], speed: 6 }, { type: 'bicycle', col: 0x2a6ad8, n: [2, 4, 6][q], speed: 4 }], { density: () => 1 });
    let ride = null; const tramM = K.floraMat(0, { rough: .5 });
    const endRide = () => { if (!ride) return; const r = ride; ride = AV.vienna.ride = null; grp.remove(r.mesh); r.mesh.geometry.dispose(); const P = AV.P, sp = AV.safeSpot(AV.W, CX + Math.cos(r.a) * (RING + 7.5), CZ + Math.sin(r.a) * (RING + 7.5)); P.x = sp[0]; P.z = sp[1]; P.y = 0; P.vx = P.vz = 0; AV.toast(tr('You hop off the tram. “Nächste Station…”', 'Te bajas del tranvía. “Nächste Station…”')) };
    [30, 120, 210, 300].forEach(d => { const a = d * Math.PI / 180, x = CX + Math.cos(a) * (RING + 7), z = CZ + Math.sin(a) * (RING + 7); box(B.misc, MT.shiny, 0xd8202a, x, 1.6, z, .2, 3.2, .2); box(B.glow, MT.v, 0xffffff, x, 3.2, z, .9, .5, .1, -a, .8);
      T(x, z, 2.6, () => tr('Ring tram stop: ride around the Ringstraße (2)', 'Parada de tranvía: dar la vuelta al Ring (2)'), () => { if (ride || !AV.txn(-2, 'Ring tram')) return; const m = new THREE.Mesh(CY.VB.tram(0xd8202a), tramM); grp.add(m); ride = AV.vienna.ride = { a, v: 0, mesh: m }; AV.P.yaw = -a + Math.PI; AV.toast(tr('All aboard the Ring tram! E / Act to hop off anywhere.', '¡Al tranvía del Ring! E / Act para bajarte donde quieras.')) }) });
    T(0, 0, 6, () => tr('Hop off the tram', 'Bajarse del tranvía'), endRide, () => !!ride); const rideT = ctx.T[ctx.T.length - 1];
    ctx.upd.push((dt0, t) => { if (!ride) return; const r = ride, now = AV.now(), dt = Math.min(.25, now - (r.last || now)); r.last = now; r.v += (7 - r.v) * Math.min(1, dt * .8); r.a += r.v / RING * dt;
      const x = CX + Math.cos(r.a) * (RING - 1.6), z = CZ + Math.sin(r.a) * (RING - 1.6), yaw = Math.atan2(-Math.sin(r.a), Math.cos(r.a)); r.mesh.position.set(x, 0, z); r.mesh.rotation.y = yaw;
      const P = AV.P; P.x = x - Math.sin(yaw) * 3; P.z = z - Math.cos(yaw) * 3; P.y = 0; P.vx = P.vz = P.vy = 0; AV.cam.position.set(P.x, 2.3, P.z); rideT.x = P.x; rideT.z = P.z });
    ctx.leave.push(() => { ride = null; if (AV.vienna) AV.vienna.ride = null });

    /* ---------- snow (winter) / sailboats (summer) ---------- */
    if (win) { const n = [600, 1200, 2000][q], a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = (rng() - .5) * 120; a[i * 3 + 1] = rng() * 40; a[i * 3 + 2] = (rng() - .5) * 120 }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(a, 3)); const snow = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: .18, transparent: true, opacity: .85, depthWrite: false })); snow.frustumCulled = false; grp.add(snow);
      ctx.upd.push((dt, t) => { const p = g.attributes.position; for (let i = 0; i < n; i++) { let y = p.getY(i) - dt * 2.2; if (y < 0) y += 40; p.setY(i, y); p.setX(i, p.getX(i) + Math.sin(t + i) * dt * .2) } p.needsUpdate = true; snow.position.set(AV.P.x, 0, AV.P.z) }) }
    else { const boats = [0, 1, 2].map(k => { const b = new THREE.Group(), hm = new THREE.Mesh(AV.G.box, AV.std(0xf4f0e8, .5)); hm.scale.set(1.6, .6, 4.5); b.add(hm); const sail = new THREE.Mesh(new THREE.ConeGeometry(1.4, 5, 3), AV.std([0xffffff, 0xff8a3a, 0x3ad8ff][k], .6)); sail.scale.z = .15; sail.position.y = 3; b.add(sail); grp.add(b); return b });
      ctx.upd.push((dt, t) => boats.forEach((b, k) => { const tt = (t * .015 + k * .33) % 1, p = danP(30 + tt * 260), off = (k - 1) * 8; b.position.set(p[0] + DN[0] * (off + (off ? 0 : 10)), WY + .1, p[1] + DN[1] * (off + (off ? 0 : 10))); b.rotation.y = -Math.atan2(DD[1], DD[0]) + Math.PI / 2; b.rotation.z = Math.sin(t + k) * .05 })) }

    /* ---------- people: friends, bartenders, ravers, tourists ---------- */
    const BS = [];
    const add = (kind, x, z, o) => BS.push(Object.assign({ kind, x, z }, o || {}));
    add('human', 24, -44, { mode: 'idle', name: 'Barman Sean (Waxy’s)', yaw: 0 }); add('human', 34, -53.4, { mode: 'idle', name: 'Lukas', yaw: 0 }); add('human', 46, -53.4, { mode: 'idle', name: 'Don', yaw: 0 });
    add('human', 30, -40, { area: { x: 34, z: -42, r: 6 }, name: 'Old friend Max' }); add('ape', 40, -40, { area: { x: 36, z: -40, r: 6 } }); add('human', 42, -44, { mode: 'dance' });
    for (let i = 0; i < 5; i++) add(i % 4 === 3 ? 'ape' : 'human', -49 + (i % 3) * 2.4 - 2, -6 + (i / 3 | 0) * 2.6, { mode: 'dance', yaw: Math.PI });
    add('human', -53, -9, { mode: 'idle', name: 'DJ at Flex', yaw: 0 });
    if (LAND.badeschiff) { const b = LAND.badeschiff; for (let i = 0; i < 4; i++) add('human', b.x + b.ux * (i * 3 - 4.5), b.z + b.uz * (i * 3 - 4.5), { y: .95, mode: 'dance' }) }
    for (let i = 0; i < 6; i++) add(['human', 'human', 'alien', 'ape'][i % 4], -6 + (i % 3) * 3, -4 + (i / 3 | 0) * 3, { area: { x: -4, z: 0, r: 14 } });
    for (let i = 0; i < 6; i++) add(i % 3 ? 'human' : 'ape', 34 + (i % 3) * 2.4, 98 + (i / 3 | 0) * 2.4, { mode: 'dance', yaw: Math.PI });
    add('human', 40, 89.4, { y: 1, mode: 'idle', name: 'DJ Karlsplatz', yaw: 0 });
    for (let i = 0; i < 4; i++) add('human', LAND.nasch.x0 + 6 + i * 14, (LAND.nasch.z0 + LAND.nasch.z1) / 2 - 3.8, { mode: 'idle', yaw: 0 });
    add('human', 6, 132, { area: { x: 6, z: 132, r: 9 }, name: 'Old friend Sophie' }); add('human', 2, 128, { area: { x: 6, z: 130, r: 9 }, name: 'Frau Huber (teacher)' }); add('human', 10, 126, { area: { x: 6, z: 130, r: 9 } });
    add('human', 140, 6, { area: { x: 150, z: 8, r: 14 } }); add('alien', 156, 0, { area: { x: 150, z: 6, r: 14 }, name: 'Alien Tourist Blix' }); add('ape', 128, 10, { area: { x: 140, z: 10, r: 12 } });
    add('human', 90, 40, { area: { x: 86, z: 42, r: 12 } }); add('human', 98, 38, { y: 1.6, mode: 'idle', name: 'Golden Johann (living statue)', yaw: Math.PI / 2, gold: true });
    if (win) for (let i = 0; i < 6; i++) add(i % 3 ? 'human' : 'ape', 140 + (i % 3) * 8, 52 + (i / 3 | 0) * 10, { area: { x: 152, z: 62, r: 18 } });
    else for (let i = 0; i < 4; i++) { const p = danP(80 + i * 22); add('human', p[0], p[1], { mode: i % 2 ? 'dance' : 'idle', yaw: rng() * TAU }) }
    add('human', 168, -112, { area: { x: 170, z: -112, r: 8 }, name: 'VIS classmate Jonas' }); add('human', -148, -122, { y: H(-148, -122), mode: 'idle', name: 'Hiker Greta' });
    const nB = Math.round(BS.length * [.45, .7, 1][q]); const beings = AV.beings.spawn(ctx, BS.slice(0, nB).map((b, i) => Object.assign({ seed: 300 + i }, b)));
    beings.forEach((b, i) => { if (BS[i] && BS[i].gold) { const gold = new THREE.MeshStandardMaterial({ color: 0xffc83a, metalness: 1, roughness: .25, skinning: true }); gold.userData.lin = 1; b.h.traverse(o => { if (o.isSkinnedMesh) o.material = Array.isArray(o.material) ? o.material.map(() => gold) : gold }) } });

    /* ---------- flush ---------- */
    for (const k in B) B[k].flush(ctx);
    ctx.leave.push(() => MD.resetFrames());
    const here = AV.vienna.lastPos || null; AV.vienna.lastPos = null;
    return {
      name: 'Vienna 2000s · ' + (win ? tr('Winter', 'Invierno') : tr('Summer', 'Verano')), fog: [70, 330], sky: win ? { tint: [0xb8c4d8, 0xd8dce8, .6, .6], dome: { cloud: 1, swirl: .15 } } : { dome: { cloud: .6, swirl: .2 } },
      surface: (x, z) => { if (x < XMIN + 2 || x > XMAX - 2 || z < ZMIN + 2 || z > ZMAX - 2) return null; const b = walk.bridgeAt(x, z); if (b !== undefined) return b; if (waterAt(x, z)) return WY; const p = walk.at(x, z); return p === undefined ? H(x, z) : Math.max(p, H(x, z)) },
      arrivals: { default: { x: 160, z: 116, yaw: Math.PI * .75 }, ape_gate: { x: 160, z: 116, yaw: Math.PI * .75 }, pipe: { x: 156, z: 112, yaw: Math.PI * .75 }, here: here || { x: 160, z: 116, yaw: Math.PI * .75 } }, defaultArrival: 'default',
      mapRoads: ringPts.map((p, i) => { const n = ringPts[(i + 1) % ringPts.length]; return [p[0], p[1], n[0], n[1], 9] }),   /* V1.1: the Ringstraße on the minimap */
      places: [['steph', 'Stephansplatz', 'Stephansplatz', -34, -12], ['bars', 'Waxy’s · Lukas · Dons', 'Waxy’s · Lukas · Dons', 34, -38], ['wurst', 'Würstel Stand', 'Würstelstand', 30, 9], ['flex', 'Flex (Donaukanal)', 'Flex (Donaukanal)', -40, -6], ['nasch', 'Naschmarkt', 'Naschmarkt', -50, 72], ['karl', 'Karlsplatz', 'Karlsplatz', 14, 84],
        ['stadt', 'Stadtpark', 'Stadtpark', 70, 40], ['prater', 'Prater · Riesenrad', 'Prater · Noria', 118, -6], ['xmas', 'Christmas market', 'Mercado navideño', 152, 36], ['belv', 'Belvedere', 'Belvedere', 90, 96], ['schon', 'Schönbrunn', 'Schönbrunn', -100, 90], ['memory', 'Memory Zone', 'Zona de Recuerdos', 6, 116],
        ['vis', 'VIS school (22nd)', 'Colegio VIS (distrito 22)', 172, -108], ['island', 'Donauinsel beach', 'Playa de la Donauinsel', dp[0], dp[1]], ['kahl', 'Kahlenberg viewpoint', 'Mirador del Kahlenberg', -148, -118]].map(([id, en, es, x, z]) => ({ id, name: [en, es], x, z, yaw: 0 })),
      chatLines: [['Remember when we burned party CDs every Friday?', '¿Te acuerdas de cuando grabábamos CDs para las fiestas cada viernes?'], ['MSN at 8, Flex at midnight, Würstel at 4. Legendary.', 'MSN a las 8, Flex a medianoche, Würstel a las 4. Legendario.'],
        ['The U6 at 4 a.m. has seen things.', 'La U6 a las 4 de la mañana ha visto cosas.'], ['Euro 2008 fan zone was right here. The noise!', 'La fan zone de la Euro 2008 estaba aquí mismo. ¡Qué ruido!'], ['My flip phone still has your number saved as “DONT ANSWER”.', 'Mi móvil de tapa aún tiene tu número guardado como “NO CONTESTAR”.'],
        ['Badeschiff in July, Christmas punch in December. That was the year.', 'Badeschiff en julio, ponche de Navidad en diciembre. Ese fue el año.'], ['The Riesenrad goes so slowly you can finish a whole conversation.', 'La Noria va tan despacio que te da tiempo a terminar una conversación entera.']],
      musicProfile: { bpm: 96, root: 45, scale: [0, 2, 3, 7, 9], style: 'boom' }, music: { playlist: 'vienna', pos: { x: 40, y: 3, z: 92 }, bed: .5 }, stage: { pos: { x: 40, y: 3, z: 92 } }
    };
  }
});
/* season switch: F / phone "Fest" inside Vienna */
AV.vienna = AV.vienna || {};
AV.vienna.toggleSeason = () => { const S = AV.S; if (!S.vienna) S.vienna = { season: 'summer' }; S.vienna.season = S.vienna.season === 'winter' ? 'summer' : 'winter'; AV.vienna.lastPos = { x: AV.P.x, z: AV.P.z, yaw: AV.P.yaw }; AV.enterWorld('vienna', 'here');
  setTimeout(() => AV.toast(S.vienna.season === 'winter' ? AV.tr('WINTER: snow, Christmas markets, punch + Glühwein, ice rink. (F: summer)', 'INVIERNO: nieve, mercadillos navideños, ponche + Glühwein, pista de hielo. (F: verano)') : AV.tr('SUMMER: terraces, Badeschiff, Donauinsel beaches, sailboats. (F: winter)', 'VERANO: terrazas, Badeschiff, playas de la Donauinsel, veleros. (F: invierno)')), 600) };
})(window.AV);
