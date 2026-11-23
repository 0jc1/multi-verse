/* APEVERSE - world_judean_desert.js : THE JUDEAN DESERT & THE DEAD SEA (game-sized slice of the real region).
   North = -z, east = +x. The desert climbs west to the limestone cliffs; the Dead Sea fills the east (white salt shore,
   turquoise water you can float in, salt pillars). Route 90 runs north-south along the shore with the bus stop back to
   Jerusalem. Ein Gedi oasis (waterfall, pools, palms) at the cliff foot; Masada mesa to the south (walkable Roman ramp
   on the west, cable car from the east station, Herod's terraces and cisterns on top); the Qumran cave in the
   north-west cliffs; a Bedouin camp (goat-hair tents, fire, sage tea, camels); the desert patrol outpost (hut,
   sandbags, jeep); the beach kiosk with umbrellas and mud tubs; the portal home.
   People: Sgt. Noa + off-duty patrol soldiers, Salem the Bedouin host, Amir the Masada ranger, Tomer the lost hiker,
   tourists, hikers, vendors. Missions: Water Run, The Lost Hiker, Zahra's Walkabout. F: Day / Sunset / Night. */
'use strict';
(function (AV) {
const tr = AV.tr, TAU = AV.TAU, K = AV.kit, A = AV.arch, CY = AV.city, MD = AV.media, C = AV.chars;
const M = K.M, BG = K.BG, deg = d => d * Math.PI / 180;
const hourNow = () => (AV.S.time / 60) % 24, night = () => { const h = hourNow(); return h < 6 || h >= 19 };
const mode = () => AV.S.jdMode || 'day';

/* ======================= layout ======================= */
const XMIN = -140, XMAX = 220, ZMIN = -170, ZMAX = 130, GW = XMAX - XMIN, GD = ZMAX - ZMIN;
const SHORE = 120, WADE = 6, WY = -.62;                 // land west of SHORE, shallows to SHORE + WADE, then the sea
const OASIS = { x: -34, z: -52, r: 20 };                // Ein Gedi
const MASADA = { x: 34, z: 82, r: 26, h: 26 };          // the mesa (flat top at h + 2)
const CAVES = { x: -96, z: -128 };                      // Qumran cave
const CAMP = { x: -14, z: 26 };                         // Bedouin camp
const POST = { x: -64, z: -6 };                         // patrol outpost
const KIOSK = { x: 108, z: 18 };                        // beach kiosk
const PORTAL = { x: 112, z: 36 };
const BUS = { x: 86, z: -2 };                           // bus stop (west side of Route 90)
const ROAD = [[95, ZMIN + 8], [92, -40], [97, 40], [94, ZMAX - 8]];   // Route 90
const ZAHRA = { x: MASADA.x - MASADA.r - 18, z: MASADA.z - 8 };
const inRect = (r, x, z, m) => x > r.x0 - (m || 0) && x < r.x1 + (m || 0) && z > r.z0 - (m || 0) && z < r.z1 + (m || 0);
const inSea = x => x > SHORE + WADE, inWade = x => x > SHORE && x <= SHORE + WADE;
function segD(x, z, a, b, w) { const dx = b[0] - a[0], dz = b[1] - a[1], L = dx * dx + dz * dz, t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / L)); return Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t) - w / 2 }
const roadD = (x, z) => { let d = 1e9; for (let i = 1; i < ROAD.length; i++) d = Math.min(d, segD(x, z, ROAD[i - 1], ROAD[i], 10)); return d };
const roadX = z => { for (let i = 1; i < ROAD.length; i++) { const a = ROAD[i - 1], b = ROAD[i]; if (z >= a[1] && z <= b[1]) return a[0] + (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) } return ROAD[0][0] };
/* pedestrian graph */
const NAVL = [
  [[86, ZMIN + 16], [86, -40], [88, 0], [90, 40], [88, ZMAX - 16]],                           // west verge of Route 90
  [[88, 6], [100, 12], [KIOSK.x - 6, KIOSK.z + 5], [PORTAL.x - 4, PORTAL.z + 2]],            // to the beach + portal
  [[90, 60], [MASADA.x + MASADA.r + 23, MASADA.z + 6]],                                       // to the cable car
  [[88, -2], [40, 10], [CAMP.x + 10, CAMP.z + 4], [CAMP.x - 2, CAMP.z + 8]],                  // to the Bedouin camp
  [[40, 10], [POST.x + 8, POST.z + 6], [POST.x - 4, POST.z + 7]],                              // to the outpost
  [[40, 10], [-10, -30], [OASIS.x + 12, OASIS.z + 14], [OASIS.x + 2, OASIS.z + 12]],          // to Ein Gedi
  [[-10, -30], [-50, -90], [CAVES.x + 6, CAVES.z + 12]]];                                     // to Qumran
const navDist = (x, z) => { let d = 1e9; for (const pl of NAVL) for (let i = 1; i < pl.length; i++) d = Math.min(d, segD(x, z, pl[i - 1], pl[i], 0)); return d };

/* ======================= painted ground ======================= */
const TX = {};
function canvasTex(w, h, draw) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; t.userData = { keep: true }; return t }
function groundTex(N) {
  return TX.ground || (TX.ground = canvasTex(N, Math.round(N * GD / GW), (c, w, h) => {
    const m = w / GW, P = (x, z) => [(x - XMIN) * m, (z - ZMIN) * m], r = AV.rng(53);
    c.fillStyle = '#c8a878'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 1500; i++) { c.fillStyle = ['#bd9c6e', '#d2b284', '#c2a072', '#d8bc90'][i % 4]; c.globalAlpha = .3; c.beginPath(); c.arc(r() * w, r() * h, 2 + r() * 10, 0, TAU); c.fill() } c.globalAlpha = 1;
    const rect = (x0, x1, z0, z1, col) => { const a = P(x0, z0); c.fillStyle = col; c.fillRect(a[0], a[1], (x1 - x0) * m, (z1 - z0) * m) };
    rect(XMIN, XMIN + 50, ZMIN, ZMAX, '#b4906a');                                                         // cliff band
    rect(SHORE - 8, SHORE + WADE, ZMIN, ZMAX, '#ece6d6'); rect(SHORE + WADE, XMAX, ZMIN, ZMAX, '#3aa8a8'); rect(SHORE + 30, XMAX, ZMIN, ZMAX, '#1a7a88');
    for (let i = 0; i < 180; i++) { const a = r() * TAU, d = Math.sqrt(r()) * OASIS.r, q = P(OASIS.x + Math.cos(a) * d, OASIS.z + Math.sin(a) * d); c.fillStyle = ['#4a7a3a', '#5a8a44', '#3f6a30', '#6a9a4c'][i % 4]; c.beginPath(); c.arc(q[0], q[1], 1.5 + r() * 3, 0, TAU); c.fill() }
    c.strokeStyle = 'rgba(140,110,74,.4)'; c.lineWidth = 2.6 * m; for (let k = 0; k < 6; k++) { const z0 = ZMIN + 30 + k * 44 + r() * 14; let x = XMIN + 40; c.beginPath(); const p0 = P(x, z0); c.moveTo(p0[0], p0[1]); for (let s = 1; s < 9; s++) { x += 18 + r() * 8; const p = P(Math.min(x, SHORE - 6), z0 + (r() - .5) * 14); c.lineTo(p[0], p[1]) } c.stroke() }
    const seg = (a, b, w2, col) => { const p0 = P(a[0], a[1]), p1 = P(b[0], b[1]); c.strokeStyle = col; c.lineWidth = w2 * m; c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); c.stroke() };
    for (let i = 1; i < ROAD.length; i++) { seg(ROAD[i - 1], ROAD[i], 13, '#c8b894'); seg(ROAD[i - 1], ROAD[i], 9.6, '#6a6a62') } c.setLineDash([3 * m, 3 * m]); for (let i = 1; i < ROAD.length; i++) seg(ROAD[i - 1], ROAD[i], .2, '#e8d890'); c.setLineDash([]);
    for (const pl of NAVL) for (let i = 1; i < pl.length; i++) seg(pl[i - 1], pl[i], 2.2, 'rgba(168,140,100,.55)');   // dirt tracks
    seg([MASADA.x - MASADA.r - 16, MASADA.z - 4], [MASADA.x - 6, MASADA.z], 5, '#a08860');                              // Roman ramp
  }));
}

/* ======================= the world ======================= */
AV.registerWorld({
  id: 'judean_desert',
  build(ctx) {
    const S = AV.S, q = ctx.q, rng = ctx.rng, grp = ctx.group, MT = A.mats(), walk = A.walk(), md = mode();
    if (!S.jd) S.jd = {}; for (const k of ['camelHome', 'hikerFound', 'mud']) if (S.jd[k] == null) S.jd[k] = false; if (!S.jd.met) S.jd.met = {}; S.items = S.items || {};
    const SKY = md === 'sunset' ? { tint: [0xffb070, 0xffd8a8, .3, .3], dome: { s1: 0xff8a3a, s2: 0xff5a6a, swirl: .18, cloud: .4, glow: .8 } }
      : md === 'night' ? { tint: [0x6a7ab0, 0x8a94c8, .5, .5], fixed: { bg: 0x0a1228, fog: 0x1a2240, night: 1, sun: .2, hs: .6 }, dome: { swirl: .3, cloud: .2, glow: 1.2 } }
      : { tint: [0xffe0b0, 0xfff0d0, .14, .18], dome: { s1: 0xffd890, s2: 0xffb868, swirl: .04, cloud: .25, glow: .55 } };
    const B = { rock: K.batch(), build: K.batch(), decor: K.batch(), camp: K.batch() }, NIGHT = K.batch();
    const rockM = K.floraMat(0, { rough: .95, flat: true });
    const occ = [];
    const box = (b, mat, col, x0, x1, y0, y1, z0, z1, glow) => b.add(mat, BG.box, col, M((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, x1 - x0, y1 - y0, z1 - z0), glow);
    const solid = (x0, x1, z0, z1) => { ctx.cols.push([x0, x1, z0, z1]); occ.push({ x0, x1, z0, z1 }) };
    MD.resetFrames();

    /* ---------- terrain ---------- */
    const H = (x, z) => {
      if (inSea(x)) return -1.6;
      let h = Math.max(0, (SHORE - x) * .06) + 16 * Math.max(0, Math.min(1, (XMIN + 70 - x) / 50));            // rises west to the cliffs
      h += Math.sin(x * .05 + z * .03) * .8 + Math.sin(z * .07 - x * .02) * .6;                                // dunes
      h -= 5 * Math.max(0, 1 - Math.hypot(x - OASIS.x, z - OASIS.z) / (OASIS.r + 10));                          // Ein Gedi hollow
      const dm = Math.hypot(x - MASADA.x, z - MASADA.z); if (dm < MASADA.r + 14) { const t = Math.max(0, Math.min(1, (dm - MASADA.r) / 14)); h = h * t + (MASADA.h + 2) * (1 - t) }   // the mesa
      const e = Math.max(0, XMIN + 22 - x, ZMIN + 20 - z, z - (ZMAX - 18)); h += Math.min(14, e * .6);
      if (inWade(x)) h = Math.min(h, -(x - SHORE) * .16);
      return h;
    };
    const SURF = (x, z) => { if (inSea(x)) return WY - .5; const h = H(x, z), p = walk.at(x, z); return p === undefined ? h : Math.max(p, h) };   // in the sea you float: head + shoulders above the water
    const sx = [150, 230, 300][q], sz = Math.round(sx * GD / GW), tg = new THREE.PlaneGeometry(GW, GD, sx, sz); tg.rotateX(-Math.PI / 2); tg.translate((XMIN + XMAX) / 2, 0, (ZMIN + ZMAX) / 2);
    const tp = tg.attributes.position; for (let i = 0; i < tp.count; i++) tp.setY(i, H(tp.getX(i), tp.getZ(i))); tg.computeVertexNormals();
    const gmat = new THREE.MeshStandardMaterial({ map: groundTex([1024, 2048, 2048][q]), roughness: .96 }), grain = A.tex('grain');
    gmat.onBeforeCompile = sh => { sh.uniforms.detailMap = { value: grain }; sh.fragmentShader = 'uniform sampler2D detailMap;\n' + sh.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n diffuseColor.rgb *= mix(1.0, texture2D(detailMap, vUv * 160.0).r * 1.4, .3);') };
    gmat.customProgramCacheKey = () => 'jdGround'; gmat.userData.lin = 1; const ground = new THREE.Mesh(tg, gmat); ground.receiveShadow = true; grp.add(ground);
    { const sk = new THREE.RingGeometry(Math.max(GW, GD) / 2, 900, 64, 2); sk.rotateX(-Math.PI / 2); sk.translate((XMIN + XMAX) / 2, -2.4, (ZMIN + ZMAX) / 2); grp.add(new THREE.Mesh(sk, AV.std(0x2a8a98, 1))) }
    /* the mountains of Moab across the sea (east), hazy */
    { const parts = [], r = AV.rng(43); for (let i = 0; i < 22; i++) { const a = deg(-60 + i * 6 + r() * 4), d = 520 + r() * 160, h = 90 + r() * 140; parts.push([BG.ico, [0xc8a8a0, 0xb89a9a, 0xd0b4a8][i % 3], M((XMIN + XMAX) / 2 + Math.cos(a) * d, h * .3 - 20, (ZMIN + ZMAX) / 2 + Math.sin(a) * d, 150 + r() * 90, h, 120 + r() * 70), 0]) }
      const mm = new THREE.Mesh(K.merge(parts), new THREE.MeshBasicMaterial({ vertexColors: true, fog: false })); mm.material.userData.lin = 1; grp.add(mm); ctx.upd.push(() => mm.material.color.setScalar(1 - (AV.nightK || 0) * .72)) }
    /* the cliffs (escarpment) along the west edge */
    for (let z = ZMIN + 6; z < ZMAX - 6; z += 13) for (let k = 0; k < 3; k++) { const x = XMIN + 14 + k * 9 + rng() * 4, zz = z + (rng() - .5) * 6; B.rock.add(rockM, BG.dod, [0xc8a070, 0xb89060, 0xd4b080][(k + (z / 13 | 0)) % 3], M(x, H(x, zz) + 1.2 - k * .4, zz, 11 + rng() * 5, 2.6 + rng() * 2.2, 8 + rng() * 4, 0, rng() * .6 - .3, 0)) }   // strata ledges of the escarpment

    /* ---------- the Dead Sea ---------- */
    { const w = K.waterPlane(ctx, new THREE.PlaneGeometry(XMAX - SHORE + 2, GD), WY, { deep: 0x1a7a88, shallow: 0x3ab8b8, sky: 0xc8e8f0, iri: .2, opacity: .93, scale: .5 }); w.position.x = (SHORE + XMAX) / 2 + 1; w.position.z = (ZMIN + ZMAX) / 2 }
    for (let z = ZMIN + 6; z < ZMAX - 6; z += 2.6) { const x = SHORE + 1 + Math.sin(z * .08) * 1.2; B.decor.add(MT.v, BG.box, 0xf4efe2, M(x, H(x, z) + .02, z, 2, .14, 2.4)) }                // salt crust line
    for (let i = 0; i < 40; i++) { const z = ZMIN + 10 + rng() * (GD - 20), x = SHORE + 1 + rng() * (WADE - 1.5); B.decor.add(MT.v, BG.ico, 0xf2efe4, M(x, H(x, z) + .1, z, .5 + rng() * .8, .25 + rng() * .25, .5 + rng() * .8, 0, rng() * TAU, 0)) }
    for (const [px, pz, h] of [[SHORE + 22, 52, 4.6], [SHORE + 26, -34, 3.6]]) { B.rock.add(MT.v, new THREE.CylinderGeometry(.9, 1.4, h, 7), 0xe8e4d4, M(px, -1.6 + h / 2, pz, 1, 1, 1, .1, 0, .08)); B.rock.add(MT.v, BG.ico, 0xf2efe4, M(px, -1.6 + h, pz, 1.2, .7, 1.2)); ctx.circles.push([px, pz, 1.4]) }
    ctx.sign('THE DEAD SEA · −430 m', SHORE - 4, H(SHORE - 4, 44) + 3, 44, Math.PI / 2, 4.2, '#7ff0ff', { posts: true });

    /* ---------- Ein Gedi oasis ---------- */
    { const ox = OASIS.x, oz = OASIS.z;
      for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { const px = ox - 16 + k * 2, pz = oz + s * (16 + k * 3); B.rock.add(rockM, BG.dod, [0xb4906a, 0xa58460, 0xc0a078][k], M(px, H(px, pz) + 3, pz, 8, 7, 7, rng(), rng() * 3, rng())) }
      for (const [px, pz, r0] of [[ox - 2, oz + 4, 3.4], [ox + 4, oz - 2, 2.6], [ox + 8, oz - 9, 2]]) { const w = K.waterPlane(ctx, new THREE.CircleGeometry(r0, 30), H(px, pz) + .15, { deep: 0x1a6a5a, shallow: 0x4ac8b0, sky: 0xb8e8f0, iri: .3, opacity: .92 }); w.position.x = px; w.position.z = pz }
      const fx = ox - 12, fz = oz, fy = H(fx, fz); B.rock.add(rockM, BG.dod, 0xa58460, M(fx - 3, fy + 6, fz, 6, 9, 7)); K.waterfall(ctx, fx + 1, fy + .2, fz, 2.6, 8, Math.PI / 2, { c1: 0x9ae8ff }); occ.push({ x0: fx - 8, x1: fx + 1, z0: fz - 5, z1: fz + 5 }); solid(fx - 8, fx, fz - 4, fz + 4);
      ctx.sign('EIN GEDI · oasis', ox + 14, H(ox + 14, oz + 16) + 3.2, oz + 16, -Math.PI / 2, 4, '#7aff9a', { posts: true }) }

    /* ---------- Masada ---------- */
    const TOP = MASADA.h + 2;
    { const mx = MASADA.x, mz = MASADA.z;
      { const base = H(mx + MASADA.r + 14, mz) - 1.5, hh = TOP - base + .3, GAPW = .24;   /* three.js cylinders start at +z and turn towards +x: west (-x) is theta = 3PI/2 */
        const cg = new THREE.CylinderGeometry(MASADA.r + .6, MASADA.r + 12, hh, 40, 4, true, 1.5 * Math.PI + GAPW, TAU - 2 * GAPW), cp = cg.attributes.position, cr = AV.rng(808);
        for (let i = 0; i < cp.count; i++) { const y = cp.getY(i); if (y > hh / 2 - .01) continue; const k = 1 + (cr() - .5) * .12; cp.setX(i, cp.getX(i) * k); cp.setZ(i, cp.getZ(i) * k); cp.setY(i, y + (cr() - .5) * .8) }
        cg.computeVertexNormals(); B.rock.add(rockM, cg, 0xc09468, M(mx, base + hh / 2, mz));
        for (let k = 0; k < 4; k++) B.rock.add(rockM, new THREE.CylinderGeometry(MASADA.r + 3 + k * 2.4, MASADA.r + 3.4 + k * 2.4, .5, 40, 1, true, 1.5 * Math.PI + GAPW, TAU - 2 * GAPW), [0xa88058, 0xd0a878][k % 2], M(mx, TOP - 4 - k * 5.2, mz)) }   // dark strata bands
      /* casemate wall around the rim (low), Herod's northern terraces, storerooms, cistern */
      for (let k = 0; k < 40; k++) { const a = k / 40 * TAU; if (Math.abs(Math.atan2(Math.sin(a - Math.PI), Math.cos(a - Math.PI))) < .25 || Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) < .25) continue; const px = mx + Math.cos(a) * (MASADA.r - 1.5), pz = mz + Math.sin(a) * (MASADA.r - 1.5); B.build.add(MT.stone, BG.box, 0xc8b490, M(px, TOP + .5, pz, 3.6, 1, .8, 0, -a + Math.PI / 2, 0)) }
      for (let t = 0; t < 3; t++) box(B.build, MT.stucco, 0xd8ccb2, mx - 9 + t * 1.5, mx + 9 - t * 1.5, TOP, TOP + 1.2 + t * .8, mz - MASADA.r + 5 + t * 3, mz - MASADA.r + 7 + t * 3);
      for (let k = 0; k < 6; k++) B.build.add(MT.v, A.geo('cyl'), 0xe8dfc8, M(mx - 7.5 + k * 3, TOP + 1.3, mz - MASADA.r + 9.5, .35, 2.6, .35));
      for (let k = 0; k < 4; k++) { box(B.build, MT.stone, 0xb8a480, mx + 4 + k * 3.4, mx + 6.4 + k * 3.4, TOP, TOP + 2.2, mz - 4, mz + 8); solid(mx + 4 + k * 3.4, mx + 6.4 + k * 3.4, mz - 4, mz + 8) }   // storerooms
      box(B.build, MT.stone, 0x6a5a44, mx - 12, mx - 5, TOP - .02, TOP + .1, mz + 6, mz + 12);   // cistern mouth (dark)
      /* Roman ramp on the west (walkable: many shallow steps) */
      { const a0 = [mx - MASADA.r - 16, mz - 4], a1 = [mx - MASADA.r + 2, mz], y0 = H(a0[0], a0[1]), n = 40;
        for (let i = 0; i <= n; i++) { const f = i / n, px = a0[0] + (a1[0] - a0[0]) * f, pz = a0[1] + (a1[1] - a0[1]) * f, py = y0 + (TOP - y0) * f; walk.pad(px, pz, 2.8, py + .05); if (i % 3 === 0) box(B.rock, MT.stone, 0xa8926e, px - 2.4, px + 2.4, py - 2, py + .05, pz - 2.4, pz + 2.4) }
        ctx.sign('ROMAN RAMP', a0[0] + 2, y0 + 3.2, a0[1] - 3.4, -Math.PI / 2, 3.2, '#ffd84a', { posts: true }) }
      /* cable car: lower station, cable, upper station */
      { const cx0 = mx + MASADA.r + 19, cz0 = mz + 2, cy0 = H(cx0, cz0);
        box(B.build, MT.shiny, 0x8a8a92, cx0 - 3, cx0 + 3, cy0 - .5, cy0 + 4, cz0 - 3, cz0 + 3); solid(cx0 - 3, cx0 + 3, cz0 - 3, cz0 + 3); box(B.build, MT.v, 0xb04a3a, cx0 - 3.4, cx0 + 3.4, cy0 + 4, cy0 + 4.6, cz0 - 3.4, cz0 + 3.4);
        box(B.build, MT.shiny, 0x8a8a92, mx + MASADA.r - 6, mx + MASADA.r - 2, TOP, TOP + 3, mz - 2, mz + 6);
        const cable = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(cx0, cy0 + 4.4, cz0), new THREE.Vector3(mx + MASADA.r - 4, TOP + 3, mz + 2)]), new THREE.LineBasicMaterial({ color: 0x3a3a3a })); grp.add(cable);
        const cab = new THREE.Mesh(BG.box, AV.std(0xd8402a, .5)); cab.scale.set(2, 1.8, 2.4); grp.add(cab);
        ctx.upd.push((dt, t) => { const f = .5 + .5 * Math.sin(t * .12); cab.position.set(cx0 + (mx + MASADA.r - 4 - cx0) * f, cy0 + 3.4 + (TOP + 2 - cy0 - 3.4) * f, cz0 + (mz + 2 - cz0) * f) });
        ctx.sign('CABLE CAR · רכבל', cx0, cy0 + 6.2, cz0 + 3.4, 0, 3.6, '#9ad8ff') }
      ctx.sign('MASADA', mx, TOP + 4.4, mz + 4, Math.PI, 4.2, '#ffd84a', { posts: true }) }
    walk.pad(MASADA.x, MASADA.z, MASADA.r - .5, TOP);
    /* the cliffs: a ring of colliders at the foot, open only where the Roman ramp climbs (west) */
    for (let k = 0; k < 96; k++) { const a = k / 96 * TAU; if (Math.abs(Math.atan2(Math.sin(a - Math.PI), Math.cos(a - Math.PI))) < .2) continue; ctx.circles.push([MASADA.x + Math.cos(a) * (MASADA.r + 12.5), MASADA.z + Math.sin(a) * (MASADA.r + 12.5), 1.9]) }
    const UPPER = [MASADA.x + 12, MASADA.z - 8];   // where the cable car lets you off on the summit

    /* ---------- Qumran cave ---------- */
    { const cx0 = CAVES.x, cz0 = CAVES.z, cy0 = H(cx0, cz0);
      for (let k = 0; k < 5; k++) B.rock.add(rockM, BG.dod, 0xb4906a, M(cx0 - 4 + k * 4 - 8, cy0 + 6 + k, cz0 - 9 - k * 2, 9, 9 + k, 8, rng(), rng() * 3, rng()));
      box(B.rock, rockM, 0xa58460, cx0 - 6, cx0 + 6, cy0 - 1, cy0 + 6, cz0 - 7, cz0 - 2); solid(cx0 - 6, cx0 + 6, cz0 - 7, cz0 - 2);
      box(B.rock, MT.v, 0x2a2016, cx0 - 2.6, cx0 + 2.6, cy0, cy0 + 3.4, cz0 - 1.98, cz0 - 1.94);   // the dark cave mouth
      for (let k = 0; k < 3; k++) { B.decor.add(MT.v, A.geo('cyl'), 0xa87a4a, M(cx0 + 3.5 + k * .8, cy0 + .45, cz0 - .8, .22, .9, .22)); B.decor.add(MT.v, BG.sph, 0x8a6030, M(cx0 + 3.5 + k * .8, cy0 + .95, cz0 - .8, .24, .14, .24)) }   // clay jars
      ctx.sign('QUMRAN · Dead Sea Scrolls cave', cx0, cy0 + 5, cz0 + 4, 0, 4.6, '#e8d890', { posts: true }) }

    /* ---------- Bedouin camp ---------- */
    const tentM = K.floraMat(0, { rough: .95, flat: true });
    { const cx0 = CAMP.x, cz0 = CAMP.z;
      for (const [tx, tz, ry] of [[cx0 - 6, cz0 - 2, .25], [cx0 + 7, cz0 + 1, -.4], [cx0, cz0 + 11, 0]]) { const ty = H(tx, tz);
        B.camp.add(tentM, new THREE.CylinderGeometry(0, 3.6, 2.6, 4, 1).rotateY(Math.PI / 4), 0x3a3228, M(tx, ty + 1.3, tz, 1.5, 1, 1, 0, ry, 0)); for (const s of [-1, 1]) B.camp.add(MT.wood, A.geo('cyl'), 0x5a4a34, M(tx + s * 2.5, ty + 1.4, tz, .06, 2.8, .06)); solid(tx - 3.4, tx + 3.4, tz - 2.4, tz + 2.4) }
      const fx = cx0 + 1, fz = cz0 - 7, fy = H(fx, fz);
      for (let k = 0; k < 7; k++) { const a = k / 7 * TAU; B.camp.add(MT.stone, BG.ico, 0x8a7a62, M(fx + Math.cos(a), fy + .15, fz + Math.sin(a), .3, .25, .3)) } ctx.circles.push([fx, fz, 1.2]);
      const fire = new THREE.Group(); fire.position.set(fx, fy + .3, fz); grp.add(fire);
      for (let k = 0; k < 3; k++) { const m = new THREE.Mesh(BG.sph, new THREE.MeshBasicMaterial({ color: [0xff8a2a, 0xffd23a, 0xff5a1a][k] })); m.material.userData.lin = 1; m.scale.set(.18 - k * .04, .3 - k * .07, .18 - k * .04); fire.add(m) }
      ctx.upd.push((dt, t) => fire.children.forEach((m, k) => { const a = t * 3 + k * 2.1; m.position.set(Math.sin(a) * .1, .3 + Math.abs(Math.sin(a * 1.3)) * .5, Math.cos(a * .8) * .1) }));
      K.motes(ctx, { n: 24, x: fx, z: fz, r: 2.2, y0: fy + .3, y1: fy + 2.6, cols: [0xffb060, 0xffd890], size: 2.2 });
      B.camp.add(MT.v, A.geo('cyl'), 0x2a2a26, M(fx + .3, fy + .8, fz, .18, .4, .18));
      for (const [rx, rz, col] of [[cx0 - 2, cz0 + 4, 0x8a2a3a], [cx0 + 4, cz0 + 5, 0x2a5a6a]]) { const ry0 = H(rx, rz); box(B.camp, MT.v, col, rx - 1.4, rx + 1.4, ry0 + .03, ry0 + .09, rz - 1, rz + 1) }
      ctx.sign('BEDOUIN CAMP · أهلا وسهلا', cx0 - 10, H(cx0 - 10, cz0 - 10) + 3.6, cz0 - 10, Math.PI, 4.4, '#ffd08a', { posts: true }) }
    /* camels (merged mesh; Zahra wears the red saddle) */
    const camelGeo = saddled => { const p = [[BG.sph, 0xb08a5a, M(0, 1.5, 0, .9, .7, 1.7)], [BG.sph, 0xb08a5a, M(0, 2.15, .3, .55, .45, .7)], [BG.sph, 0xb08a5a, M(0, 2.15, -.35, .5, .4, .65)], [BG.cyl, 0xa87f50, M(0, 1.9, 1.6, .3, 1, .3, 1, 0, 0)], [BG.sph, 0xa87f50, M(0, 2.5, 2.05, .35, .38, .5)], [BG.sph, 0x2a1a10, M(0, 2.62, 2.32, .09, .07, .09)]];
      for (const [lx, lz] of [[-.55, 1.05], [.55, 1.05], [-.55, -.95], [.55, -.95]]) p.push([BG.cyl, 0xa87f50, M(lx, .75, lz, .14, 1.5, .14)]);
      if (saddled) p.push([BG.box, 0xc83a2a, M(0, 2.3, 0, .9, .18, 1.3)], [BG.sph, 0xffd23a, M(0, 2.6, -.55, .1, .18, .1), .6]);
      return K.merge(p) };
    const camelM = K.floraMat(0, { rough: .9 }), camels = [];
    const mkCamel = (x, z, saddled, ry) => { const m = new THREE.Mesh(camelGeo(saddled), camelM); m.position.set(x, H(x, z), z); m.rotation.y = ry || 0; m.castShadow = q === 2; grp.add(m); camels.push({ m, home: [x, z] }); return m };
    const rideCamel = mkCamel(CAMP.x + 10, CAMP.z - 8, true, -.6); ctx.circles.push([CAMP.x + 10, CAMP.z - 8, 1.3]);
    mkCamel(CAMP.x - 9, CAMP.z - 9, false, .8); ctx.circles.push([CAMP.x - 9, CAMP.z - 9, 1.3]);
    const zahra = mkCamel(ZAHRA.x, ZAHRA.z, true, Math.PI);
    ctx.upd.push((dt, t) => { for (const c of camels) { if (c.m === zahra) continue; c.m.rotation.y += Math.sin(t * .3 + c.home[0]) * .002 } const lost = (S.quests || {}).jd_camel === 'active' && !S.jd.camelHome; zahra.visible = lost; if (lost) zahra.position.y = H(ZAHRA.x, ZAHRA.z) + Math.sin(t * 1.4) * .03 });

    /* ---------- desert patrol outpost ---------- */
    { const px0 = POST.x, pz0 = POST.z, py0 = H(px0, pz0);
      box(B.build, MT.stucco, 0xcabf9e, px0 - 4, px0 + 4, py0 - .5, py0 + 3.4, pz0 - 3, pz0 + 3); solid(px0 - 4, px0 + 4, pz0 - 3, pz0 + 3); box(B.build, MT.v, 0x8a9aa8, px0 - 4.4, px0 + 4.4, py0 + 3.4, py0 + 3.8, pz0 - 3.4, pz0 + 3.4);
      box(B.build, MT.dbl, 0x7a8a6a, px0 - 6, px0 + 6, py0 + 2.9, py0 + 3.05, pz0 + 3.2, pz0 + 6.4); for (const s of [-1, 1]) { B.build.add(MT.v, A.geo('cyl'), 0x6a6a62, M(px0 + s * 5.6, py0 + 1.5, pz0 + 6, .1, 3, .1)); ctx.circles.push([px0 + s * 5.6, pz0 + 6, .2]) }
      for (let k = 0; k < 7; k++) box(B.decor, MT.v, 0xa89a72, px0 - 4.2 + k * 1.2, px0 - 3.3 + k * 1.2, py0 - .1, py0 + .5, pz0 - 4.6, pz0 - 3.8); ctx.cols.push([px0 - 4.2, px0 + 4.2, pz0 - 4.6, pz0 - 3.8]);
      B.build.add(MT.v, A.geo('cyl'), 0x8a8a84, M(px0 + 3.4, py0 + 6, pz0 - 2, .05, 6, .05));
      for (let k = 0; k < 3; k++) B.decor.add(MT.v, A.geo('cyl'), 0x5a6a3a, M(px0 - 6 + k * .7, H(px0 - 6, pz0) + .3, pz0 + 1, .26, .6, .26));
      const jx = px0 + 9, jz = pz0 + 2, j = new THREE.Mesh(CY.VB.jeep(0xb8a27a), K.floraMat(0, { rough: .5 })); j.position.set(jx, H(jx, jz), jz); j.rotation.y = -.5; j.castShadow = q === 2; grp.add(j); solid(jx - 1.8, jx + 1.8, jz - 2.6, jz + 2.6);
      ctx.sign('DESERT PATROL · OUTPOST 12', px0, py0 + 5.2, pz0 - 3.6, Math.PI, 4.6, '#e8d08a', { posts: true }) }

    /* ---------- beach: kiosk, umbrellas, mud tubs ---------- */
    { const kx = KIOSK.x, kz = KIOSK.z, ky = H(kx, kz);
      box(B.build, MT.shiny, 0x2a8a8a, kx - 2.6, kx + 2.6, ky - .3, ky + 2.6, kz - 2, kz + 2); solid(kx - 2.6, kx + 2.6, kz - 2, kz + 2); box(B.build, MT.roof, 0xe8e4d4, kx - 3.2, kx + 3.2, ky + 2.6, ky + 3.1, kz - 2.6, kz + 2.6);
      NIGHT.add(MT.v, BG.box, 0xfff0c0, M(kx - 2.65, ky + 1.5, kz, .1, .8, 2.4), 1); ctx.sign('DEAD SEA KIOSK', kx, ky + 4.4, kz, -Math.PI / 2, 3.8, '#7ff0ff');
      for (let k = 0; k < 7; k++) { const ux = SHORE - 6 + (k % 2) * 4, uz = -36 + k * 12, uy = H(ux, uz); B.decor.add(MT.v, A.geo('cyl'), 0xc0c0c0, M(ux, uy + 1.1, uz, .04, 2.2, .04)); B.decor.add(MT.dbl, A.geo('halfDome'), [0xff4ad2, 0xffd84a, 0x3ad8ff, 0x7aff8a, 0xff8a3a][k % 5], M(ux, uy + 2.2, uz, 1.5, .5, 1.5), .1); ctx.circles.push([ux, uz, .25]); B.decor.add(MT.v, BG.box, 0xf4f0e8, M(ux + 1.4, uy + .25, uz, .6, .5, 1.4)) }
      for (const tz of [2, 8]) { const tx = SHORE - 10, ty = H(tx, tz); B.decor.add(MT.v, new THREE.CylinderGeometry(1.4, 1.1, 1, 12), 0x8a6a4a, M(tx, ty + .5, tz)); B.decor.add(MT.v, new THREE.CylinderGeometry(1.25, 1.25, .1, 12), 0x3a2e24, M(tx, ty + .98, tz)); ctx.circles.push([tx, tz, 1.5]) } }
    /* ---------- Route 90 bus stop + portal ---------- */
    { const by0 = H(BUS.x, BUS.z); box(B.decor, MT.shiny, 0x2a8a4a, BUS.x - .15, BUS.x + .15, by0, by0 + 3.4, BUS.z - .8, BUS.z + .8); B.decor.add(MT.v, BG.box, 0x2a8a4a, M(BUS.x, by0 + 3.6, BUS.z, .2, .9, 1.6), .6); ctx.circles.push([BUS.x, BUS.z, .4]);
      box(B.decor, MT.shiny, 0x8a9aa8, BUS.x - 3, BUS.x, by0 + 2.6, by0 + 2.75, BUS.z - 3, BUS.z + 3); ctx.sign('BUS 486 · JERUSALEM · ירושלים', BUS.x - 1, by0 + 4.4, BUS.z - 4, 0, 4.2, '#9ad8ff');
      const py = H(PORTAL.x, PORTAL.z), portal = new THREE.Group(); portal.position.set(PORTAL.x, py + 1.7, PORTAL.z); portal.rotation.y = Math.PI / 2; grp.add(portal);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.3, .14, 10, 40), new THREE.MeshBasicMaterial({ color: 0xb07aff })); portal.add(ring);
      const disc = new THREE.Mesh(new THREE.CircleGeometry(1.25, 40), new THREE.MeshBasicMaterial({ color: 0x7a3aff, transparent: true, opacity: .45, side: THREE.DoubleSide, depthWrite: false })); portal.add(disc);
      ctx.upd.push((dt, t) => { ring.rotation.z = t * .8; disc.material.opacity = .35 + Math.sin(t * 2) * .12; disc.material.color.setHSL((t * .05) % 1, .8, .5) }); ctx.circles.push([PORTAL.x, PORTAL.z, 1]);
      ctx.sign('PORTAL TO APE TOWN', PORTAL.x, py + 5.4, PORTAL.z, -Math.PI / 2, 3.6, '#d8a0ff') }

    /* ---------- vegetation ---------- */
    const KEEP = [[BUS.x, BUS.z, 5], [PORTAL.x, PORTAL.z, 5], [KIOSK.x, KIOSK.z, 6], [ZAHRA.x, ZAHRA.z, 5], [CAMP.x, CAMP.z, 18], [POST.x, POST.z, 14], [CAVES.x, CAVES.z + 4, 8]];
    const freeV = (x, z, pad) => x > XMIN + 8 && x < SHORE - 8 && z > ZMIN + 8 && z < ZMAX - 8 && roadD(x, z) > pad && navDist(x, z) > pad + .5 && !occ.some(o => inRect(o, x, z, pad)) && !KEEP.some(k => Math.hypot(x - k[0], z - k[1]) < k[2]) && Math.hypot(x - MASADA.x, z - MASADA.z) > MASADA.r + 16;
    const pickV = (n, area, ok, s0, s1) => { const out = []; for (let i = 0, t = 0; i < n && t < n * 40; t++) { const x = area.x0 + rng() * (area.x1 - area.x0), z = area.z0 + rng() * (area.z1 - area.z0); if (!ok(x, z)) continue; out.push({ x, y: H(x, z), z, s: s0 + rng() * (s1 - s0), ry: rng() * TAU }); i++ } return out };
    const palms = pickV(K.n(26), { x0: OASIS.x - 18, x1: OASIS.x + 18, z0: OASIS.z - 18, z1: OASIS.z + 18 }, (x, z) => Math.hypot(x - OASIS.x, z - OASIS.z) < OASIS.r && freeV(x, z, 2.6) && Math.hypot(x - OASIS.x, z - OASIS.z) > 6, 1.5, 2.3)
      .concat(pickV(6, { x0: SHORE - 20, x1: SHORE - 8, z0: -40, z1: 60 }, (x, z) => freeV(x, z, 3), 1.4, 2));
    palms.forEach(p => ctx.circles.push([p.x, p.z, .4]));
    ['palm_a', 'palm_b', 'palm_c'].forEach((k, j) => K.instModel(ctx, 'quaternius/' + k, palms.filter((_, i) => i % 3 === j), it => K.scatter(ctx, K.species.palm(0x8a5a2a, 0x4a9a3a), K.floraMat(.008), it.map(o => Object.assign({}, o, { s: o.s * .55 })), { far: K.far(false), cell: 70 }), { sway: .004, far: K.far(false), cell: 70 }));
    const acacia = pickV(K.n(16), { x0: XMIN + 30, x1: SHORE - 12, z0: ZMIN + 20, z1: ZMAX - 20 }, (x, z) => freeV(x, z, 4) && Math.hypot(x - OASIS.x, z - OASIS.z) > OASIS.r + 6, 1.4, 2);
    acacia.forEach(p => ctx.circles.push([p.x, p.z, .5]));
    K.scatter(ctx, K.merge([[BG.cyl, 0x6a5a42, M(0, 1, 0, .18, 2, .18, .1, 0, .08)], [BG.ico, 0x6a7a3a, M(0, 2.6, 0, 1.7, .5, 1.6)], [BG.ico0, 0x5a6a30, M(.8, 2.2, .3, .9, .35, .85)]]), K.floraMat(.005), acacia, { far: K.far(false), cell: 80 });
    K.field(ctx, K.species.bush(0x8a7a4a, 0xd8b860), K.floraMat(.02), K.n(50), { x0: XMIN + 20, x1: SHORE - 8, z0: ZMIN + 10, z1: ZMAX - 10 }, { H, s0: .6, s1: 1.1, shadow: false, cell: 64, ok: (x, z) => freeV(x, z, 1.6) });

    /* ======================= people ======================= */
    const crew = {};
    const spawn = (id, role, seed, x, z, yaw, anim) => { const n = AV.npc.spawn(ctx, id, { x, z, yaw, body: C.regional.body(role, seed, q < 2 ? { lod: true } : null), H: SURF, r: 2.6, anim, speed: 1.2 }); n.tag.position.y = 2.25; n.bub.position.y = 2.95; crew[id] = n; return n };
    spawn('noa', 'soldier', 71, POST.x - 1, POST.z + 5, 0);
    spawn('salem', 'bedouin', 82, CAMP.x + 1, CAMP.z - 4.5, Math.PI);
    spawn('amir', 'guide', 93, MASADA.x + MASADA.r + 22, MASADA.z + 8, -Math.PI / 2);
    const tomer = spawn('tomer', 'student', 104, CAVES.x - 2, CAVES.z + 2.4, 0, n => { if (S.jd.hikerFound) { if (!n.stood) { n.stood = true; n.g.position.y = SURF(n.g.position.x, n.g.position.z) } return } const u = n.g.userData; u.lL.rotation.x = u.lR.rotation.x = -1.45; n.g.position.y = SURF(n.g.position.x, n.g.position.z) - .33 });
    /* soft-body residents (priority order: Low gets the first few) */
    const HOT = [['soldier', POST.x + 5, POST.z + 7, 'idle', Math.PI], ['pilgrim', KIOSK.x - 7, KIOSK.z + 6, 'wander', 0], ['bedouin', CAMP.x - 4, CAMP.z + 5, 'idle', 0], ['business', SHORE - 9, -18, 'idle', Math.PI / 2],
      ['soldier', POST.x - 3, POST.z + 8, 'idle', Math.PI], ['student', OASIS.x + 12, OASIS.z + 14, 'wander', 0], ['pilgrim', MASADA.x, MASADA.z - 6, 'wander', 0], ['hijabi', SHORE - 8, 30, 'wander', 0], ['embroidered', CAMP.x + 5, CAMP.z + 6, 'idle', 0]];
    AV.beings.spawn(ctx, HOT.slice(0, AV.beings.n(ctx, 3, 5, 7)).map(([role, x, z, md2, yaw], i) => C.regional.being(role, x, z, 700 + i * 13, { mode: md2, yaw, y0: SURF(x, z), area: { x, z, r: 6 } })));
    /* instanced crowd on the tracks */
    const nodes = [], edges = [];
    for (const pl of NAVL) { let prev = null; for (const [x, z] of pl) { let id = nodes.findIndex(n => Math.hypot(n[0] - x, n[1] - z) < .8); if (id < 0) { nodes.push([x, z]); id = nodes.length - 1 } if (prev != null && prev !== id) edges.push([prev, id]); prev = id } }
    const NAV = CY.nav(nodes, edges), crowd = CY.crowd(ctx, { H: SURF });
    const VLIST = ['tourist', 'soldier', 'keff', 'robe', 'tourist', 'hijab', 'man', 'woman', 'suit'];
    for (let i = 0; i < [10, 18, 28][q]; i++) { const v = VLIST[i % VLIST.length], n0 = nodes[rng() * nodes.length | 0]; crowd.add({ v, x: n0[0], z: n0[1], nav: NAV, idleProb: .3, cols: C.regional.walkCols(v, rng) || undefined }) }
    for (let i = 0; i < [3, 5, 8][q]; i++) crowd.add({ v: ['tourist', 'woman', 'man'][i % 3], x: SHORE + 9 + rng() * 14, z: -30 + rng() * 80, yaw: rng() * TAU, mode: 'idle', dy: -.7 });   // floating in the sea
    crowd.build();
    /* Route 90 traffic (cars, patrol jeeps, the green bus) */
    const CARC = [0xf2f2f0, 0xb8bcc0, 0x5a5e62, 0x15171a, 0x1f3e72, 0x9a1a1a];
    CY.traffic(ctx, [{ pts: ROAD.slice(), off: 2.2, w: 10 }], [{ type: 'car', cols: CARC, n: [2, 3, 5][q], speed: 9 }, { type: 'jeep', col: 0xb8a27a, n: [1, 1, 2][q], speed: 7.5 }, { type: 'bus', col: 0x2a8a4a, n: 1, speed: 6 }], { H, density: () => 1 });
    CY.birds(ctx, [{ x: OASIS.x, z: OASIS.z, r: 18, y: 20, n: 8 }, { x: MASADA.x, z: MASADA.z, r: 34, y: 46, n: 6 }, { x: SHORE + 30, z: 0, r: 40, y: 16, n: 8 }]);

    /* ---------- interactions ---------- */
    const T = (x, z, r, label, fn, show) => { const t = { x, z, r, label, fn, show }; ctx.T.push(t); return t };
    const give = item => { if (AV.bag) AV.bag.add(item, 1, true); else S.items[item] = (S.items[item] || 0) + 1; AV.quests && AV.quests.check() };
    const buy = (cost, what, msg, item) => { if (!AV.txn(-cost, what)) return false; give(item); AV.toast(msg + tr(' → backpack (I)', ' → mochila (I)')); AV.audio && AV.audio.blip(660, .15, 'triangle', .12); return true };
    T(KIOSK.x - 3.6, KIOSK.z - 1, 2.2, () => tr('Kiosk: cold water (5)', 'Quiosco: agua fría (5)'), () => buy(5, 'Kiosk water', tr('Ice cold. The best thing money can buy out here.', 'Helada. Lo mejor que se puede comprar aquí.'), 'water'));
    T(KIOSK.x - 3.6, KIOSK.z + 2, 2.2, () => tr('Kiosk: Dead Sea mud (25)', 'Quiosco: barro del Mar Muerto (25)'), () => buy(25, 'Kiosk mud', tr('The famous black mud, in a pot.', 'El famoso barro negro, en un bote.'), 'dead_sea_mud'));
    T(KIOSK.x + .5, KIOSK.z + 3, 2.2, () => tr('Kiosk: dates (8)', 'Quiosco: dátiles (8)'), () => buy(8, 'Kiosk dates', tr('Soft Medjool dates from the oasis.', 'Dátiles Medjool del oasis.'), 'dates'));
    T(OASIS.x + 10, OASIS.z + 10, 2.4, () => tr('Ein Gedi spring: fill a water bottle (free)', 'Manantial de Ein Gedi: llenar una botella (gratis)'), () => { if (S.jd.springDay === S.day) return AV.toast(tr('The ranger smiles: one bottle a day from the spring, please.', 'El guarda sonríe: una botella al día del manantial, por favor.')); S.jd.springDay = S.day; give('water'); AV.toast(tr('Cold spring water from the cliff. → backpack (I)', 'Agua fría del manantial. → mochila (I)')) });
    for (const tz of [2, 8]) T(SHORE - 10, tz, 2, () => tr('Dead Sea mud bath', 'Baño de barro del Mar Muerto'), () => { if (!S.jd.mud) { S.jd.mud = true; AV.vitals && AV.vitals.add(0, 8) } AV.toast(tr('You smear the black mineral mud over your arms. Your skin feels ten years younger and you look like a very relaxed statue.', 'Te untas el barro negro por los brazos. La piel se siente diez años más joven y pareces una estatua muy relajada.')) });
    T(SHORE + 2, 20, 4, () => tr('Wade in and float in the Dead Sea', 'Entrar y flotar en el Mar Muerto'), () => { const P = AV.P; P.x = SHORE + WADE + 6; P.y = SURF(P.x, P.z); P.vx = P.vz = P.vy = 0; AV.toast(tr('You lie back and the water holds you like a hammock. Don’t splash your eyes!', 'Te tumbas y el agua te sostiene como una hamaca. ¡Que no te salpique a los ojos!')); AV.vitals && AV.vitals.add(0, 6); AV.dlg && AV.dlg.event('dead_sea_float') });
    T(MASADA.x + MASADA.r + 19, MASADA.z + 6.4, 3, () => tr('Cable car up Masada (10)', 'Teleférico a Masada (10)'), () => { if (!AV.txn(-10, 'Cable car')) return; AV.audio && AV.audio.blip(392, .4, 'sine', .1); AV.fadeTo(1, 400);
      setTimeout(() => { const P = AV.P, sp = AV.safeSpot(AV.W, UPPER[0], UPPER[1]); P.x = sp[0]; P.z = sp[1]; P.y = AV.W.surface(P.x, P.z) || TOP; P.vx = P.vz = 0; P.yaw = Math.PI / 2; S.time += 8; AV.fadeTo(0, 600); AV.toast(tr('The cabin sways up the cliff. Herod’s terraces open up below you.', 'La cabina se balancea por el acantilado. Las terrazas de Herodes se abren a tus pies.')) }, 900) });
    T(UPPER[0], UPPER[1], 2.6, () => tr('Cable car down (free)', 'Teleférico de bajada (gratis)'), () => { AV.fadeTo(1, 400); setTimeout(() => { const P = AV.P, sp = AV.safeSpot(AV.W, MASADA.x + MASADA.r + 23, MASADA.z + 6); P.x = sp[0]; P.z = sp[1]; P.y = AV.W.surface(P.x, P.z) || 0; P.vx = P.vz = 0; AV.fadeTo(0, 600) }, 500) });
    T(MASADA.x, MASADA.z - 4, 6, () => tr('Look out over the Dead Sea', 'Mirar el Mar Muerto'), () => { AV.P.yaw = -Math.PI / 2; AV.P.pitch = -.18; AV.vitals && AV.vitals.add(0, 10); AV.toast(tr('The sea gleams far below: blue salt, white shore, the hills of Moab in the haze.', 'El mar brilla muy abajo: sal azul, orilla blanca y los montes de Moab en la bruma.')) });
    T(CAMP.x + 10, CAMP.z - 8, 2.6, () => tr('Ride the camel (15)', 'Montar en camello (15)'), () => { if (!AV.txn(-15, 'Camel ride')) return; AV.fadeTo(1, 500); setTimeout(() => { S.time += 15; AV.fadeTo(0, 700); AV.vitals && AV.vitals.add(0, 8); AV.toast(tr('She stands up rear legs first — you lean back and hold on. The desert rolls by at camel speed, its own kind of perfect.', 'Se levanta primero con las patas traseras: te echas hacia atrás y te agarras. El desierto pasa a velocidad de camello, su propia clase de perfección.')) }, 600) });
    T(CAMP.x + 1, CAMP.z - 5.6, 2.4, () => tr('Salem’s fire: a glass of sage tea (free)', 'El fuego de Salem: un vaso de té de salvia (gratis)'), () => { give('sage_tea'); AV.toast(tr('Salem pours it from high up, the proper way. Sweet, hot, smelling of desert sage. → backpack (I)', 'Salem lo sirve desde lo alto, como debe ser. Dulce, caliente y con olor a salvia. → mochila (I)')) });
    T(CAVES.x - 2, CAVES.z + 3, 2.8, () => (S.quests || {}).jd_hiker === 'active' && !S.jd.hikerFound ? tr('Check on the hiker', 'Ver cómo está el excursionista') : tr('The Qumran cave', 'La cueva de Qumrán'), () => {
      if ((S.quests || {}).jd_hiker === 'active' && !S.jd.hikerFound) { S.jd.hikerFound = true; give('water'); AV.quests && AV.quests.check(); AV.npc.bark(tomer, tr('Thank you! I’m fine — just embarrassed.', '¡Gracias! Estoy bien, solo avergonzado.')); AV.toast(tr('You share some water. Tomer: “I’m FINE. My phone died and my dignity is slightly injured. Tell the sergeant?”', 'Compartes agua. Tomer: “Estoy BIEN. Se me murió el móvil y la dignidad está algo herida. ¿Se lo dices a la sargento?”')) }
      else AV.toast(tr('Clay jars, rock shelves and two thousand years of silence.', 'Vasijas de barro, estantes de roca y dos mil años de silencio.')) });
    T(ZAHRA.x, ZAHRA.z, 3.4, () => tr('Lead Zahra home (speak softly)', 'Llevar a Zahra a casa (habla bajito)'), () => { S.jd.camelHome = true; AV.quests && AV.quests.check(); AV.toast(tr('You speak softly. Zahra thinks about it… and follows you all the way back to the camp.', 'Hablas bajito. Zahra se lo piensa… y te sigue hasta el campamento.')) }, () => (S.quests || {}).jd_camel === 'active' && !S.jd.camelHome);
    T(BUS.x, BUS.z + 2.4, 2.6, () => tr('Bus 486 to Jerusalem (8 credits)', 'Autobús 486 a Jerusalén (8 créditos)'), () => { if (!AV.txn(-8, 'Bus to Jerusalem')) return; AV.audio && AV.audio.blip(523, .3, 'sine', .1); AV.travel('jerusalem', 'bus') });
    T(PORTAL.x - 1.6, PORTAL.z, 2.4, () => tr('Apeverse Portal: travel to another world', 'Portal Apeverse: viajar a otro mundo'), () => { const ws = Object.keys(AV.worldDefs).filter(id => id !== 'judean_desert');
      const p = AV.panel('cmp', '<b>' + tr('Apeverse Portal', 'Portal Apeverse') + '</b><div class="grid">' + ws.map(id => '<button data-w="' + id + '">' + ((AV.worldMeta(id) || {}).name || id) + '</button>').join('') + '</div><button data-close>' + tr('Close', 'Cerrar') + '</button>');
      p.querySelectorAll('[data-w]').forEach(b => b.onclick = () => { AV.closePanel('cmp'); AV.audio && AV.audio.whoosh(); AV.travel(b.dataset.w, 'judean_desert') }) });
    ctx.upd.push(() => { if (AV.chat.open && crew[AV.chat.who] && !S.jd.met[AV.chat.who]) { S.jd.met[AV.chat.who] = 1; AV.quests && AV.quests.check() } });
    /* barks + jackals at night */
    { const BARKS = { noa: [['Water check!', '¡Control de agua!'], ['Hat on. Always.', 'Gorra puesta. Siempre.']], salem: [['Tea is ready!', '¡El té está listo!']], amir: [['Sunrise tour at five!', '¡Tour del amanecer a las cinco!']], tomer: [['Hello? Anybody?', '¿Hola? ¿Alguien?']] };
      let acc = 0, howl = 0; ctx.upd.push(dt => { acc += dt; if (acc > 20 && !AV.blocking()) { acc = 0; const ids = Object.keys(BARKS), id = ids[Math.random() * ids.length | 0], n = crew[id]; if (n && Math.hypot(AV.P.x - n.g.position.x, AV.P.z - n.g.position.z) < 14) { const a = BARKS[id], l = a[Math.random() * a.length | 0]; AV.npc.bark(n, tr(l[0], l[1])) } }
        if (night() && (howl += dt) > 40) { howl = 0; if (AV.audio) { AV.audio.blip(420, .9, 'sawtooth', .03); setTimeout(() => AV.audio.blip(380, 1.2, 'sawtooth', .025), 800) } } }) }

    /* ---------- HUD + flush ---------- */
    const hudEl = AV.$('cmhud'); let hudT = 0;
    ctx.upd.push(() => { if (!hudEl || AV.now() < hudT) return; hudT = AV.now() + .5; hudEl.style.display = 'block'; hudEl.textContent = tr('Judean Desert · ', 'Desierto de Judea · ') + (md === 'sunset' ? tr('sunset', 'atardecer') : md === 'night' ? tr('night', 'noche') : tr('day', 'día')) + tr(' · F: time of day', ' · F: hora del día') });
    ctx.leave.push(() => { if (hudEl) hudEl.style.display = 'none' });
    { const fb = AV.$('tF'); if (fb) { fb.style.display = AV.device === 'phone' ? 'block' : 'none'; ctx.leave.push(() => fb.style.display = 'none') } }
    const nightMeshes = NIGHT.flush(ctx, { noShadow: true });
    ctx.upd.push(() => { const on = (AV.nightK || 0) > .35; for (const m of nightMeshes) m.visible = on });
    for (const k in B) B[k].flush(ctx);
    const here = AV.jd.lastPos || null; AV.jd.lastPos = null;
    return {
      name: 'Judean Desert · Dead Sea', fog: [90, 440], sky: SKY, glowScale: md === 'night' ? 1.4 : 1,
      surface: (x, z) => (x < XMIN + 3 || x > XMAX - 3 || z < ZMIN + 3 || z > ZMAX - 3) ? null : SURF(x, z),
      arrivals: { default: { x: BUS.x - 2, z: BUS.z + 4, yaw: -Math.PI / 2 }, bus: { x: BUS.x - 2, z: BUS.z + 4, yaw: -Math.PI / 2 }, pipe: { x: BUS.x - 2, z: BUS.z + 7, yaw: -Math.PI / 2 }, ape_gate: { x: PORTAL.x - 5, z: PORTAL.z - 5, yaw: -Math.PI / 2 }, judean_desert: { x: PORTAL.x - 5, z: PORTAL.z - 5, yaw: -Math.PI / 2 }, here: here || { x: BUS.x - 2, z: BUS.z + 4, yaw: -Math.PI / 2 } }, defaultArrival: 'default',
      places: [{ id: 'beach', name: ['Dead Sea beach', 'Playa del Mar Muerto'], x: KIOSK.x - 7, z: KIOSK.z + 6, yaw: -Math.PI / 2 }, { id: 'oasis', name: ['Ein Gedi oasis', 'Oasis de Ein Gedi'], x: OASIS.x + 12, z: OASIS.z + 12, yaw: Math.PI / 2 },
        { id: 'masada', name: ['Masada (cable car)', 'Masada (teleférico)'], x: MASADA.x + MASADA.r + 24, z: MASADA.z + 6, yaw: Math.PI / 2 }, { id: 'caves', name: ['Qumran cave', 'Cueva de Qumrán'], x: CAVES.x + 2, z: CAVES.z + 8, yaw: 0 },
        { id: 'camp', name: ['Bedouin camp', 'Campamento beduino'], x: CAMP.x + 4, z: CAMP.z - 12, yaw: Math.PI }, { id: 'post', name: ['Patrol outpost', 'Puesto de patrulla'], x: POST.x + 2, z: POST.z + 9, yaw: Math.PI }],
      chatLines: [['The sea is so salty that sinking is basically impossible. Flailing, however, is very possible.', 'El mar es tan salado que hundirse es casi imposible. Patalear, en cambio, es muy posible.'], ['Masada at sunrise. Bring a torch and a thermos.', 'Masada al amanecer. Linterna y termo.'], ['Drink before you are thirsty. Sergeant’s orders.', 'Bebe antes de tener sed. Órdenes de la sargento.'], ['The ibex at Ein Gedi will steal your lunch. They have practice.', 'Los íbices de Ein Gedi te robarán el almuerzo. Tienen práctica.']],
      musicProfile: { bpm: 76, root: 41, scale: [0, 1, 4, 5, 7, 8, 11], style: 'maqam', sparse: true }
    };
  }
});

/* ---------- quests (load time, so saved active tasks always list correctly) ---------- */
{ const Q = AV.quests, tr = AV.tr;
  Q.define('jd_water', { giver: 'noa', turnIn: 'noa', title: ['Water Run', 'Operación agua'], hint: ['Bring 3 bottles of water to Sgt. Noa at the desert patrol outpost (the beach kiosk sells them; Ein Gedi spring gives one a day).', 'Lleva 3 botellas de agua a la sargento Noa en el puesto de la patrulla (las vende el quiosco de la playa; el manantial de Ein Gedi da una al día).'],
    ready: S => ((S.items || {}).water || 0) >= 3, reward: S => { S.items.water -= 3; AV.txn(45, 'Mission: water run'); return tr('Noa: “Hydration is discipline. The squad salutes you.” +45 credits.', 'Noa: “La hidratación es disciplina. La escuadra te saluda.” +45 créditos.') } });
  Q.define('jd_hiker', { giver: 'noa', turnIn: 'noa', title: ['The Lost Hiker', 'El excursionista perdido'], hint: ['Tomer went to the Qumran cave in the north-west cliffs and stopped answering. Find him, then report back to Noa.', 'Tomer fue a la cueva de Qumrán, en los acantilados del noroeste, y dejó de contestar. Encuéntralo y vuelve a informar a Noa.'],
    ready: S => !!(S.jd && S.jd.hikerFound), reward: () => { AV.txn(40, 'Mission: lost hiker'); return tr('Noa: “Good work. He owes you a very long thank-you message.” +40 credits.', 'Noa: “Buen trabajo. Te debe un mensaje de agradecimiento muy largo.” +40 créditos.') } });
  Q.define('jd_camel', { giver: 'salem', turnIn: 'salem', title: ['Zahra’s Walkabout', 'El paseo de Zahra'], hint: ['Find Salem’s camel Zahra (red saddle) near the foot of Masada, west of the Roman ramp, and lead her home.', 'Encuentra a Zahra (silla roja), la camella de Salem, al pie de Masada, al oeste de la rampa romana, y llévala a casa.'],
    ready: S => !!(S.jd && S.jd.camelHome), reward: S => { AV.txn(30, 'Mission: Zahra'); if (AV.bag) AV.bag.add('sage_tea', 1, true); return tr('Salem: “She likes you. That is rare, and slightly alarming.” +30 credits and tea.', 'Salem: “Le gustas. Eso es raro y algo alarmante.” +30 créditos y té.') } }) }
/* F: day -> sunset -> night (rebuilds around you); other worlds keep their own F */
AV.jd = AV.jd || {};
{ const prevF = AV.keymap.KeyF; AV.keymap.KeyF = e => { if (AV.W && AV.W.id === 'judean_desert') { const order = ['day', 'sunset', 'night'], S = AV.S; S.jdMode = order[(order.indexOf(S.jdMode || 'day') + 1) % 3]; AV.jd.lastPos = { x: AV.P.x, z: AV.P.z, yaw: AV.P.yaw }; AV.enterWorld('judean_desert', 'here');
  setTimeout(() => AV.toast(AV.tr('Time of day: ', 'Hora del día: ') + (S.jdMode === 'day' ? AV.tr('day', 'día') : S.jdMode === 'sunset' ? AV.tr('sunset — the cliffs glow red', 'atardecer: los acantilados se encienden') : AV.tr('night — stars and jackals', 'noche: estrellas y chacales')) + AV.tr(' (F: next)', ' (F: siguiente)')), 600); return } if (prevF) prevF(e) } }
})(window.AV);
