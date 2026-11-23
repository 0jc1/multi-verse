/* APEVERSE - world_judean_desert.js : THE JUDEAN DESERT — Gold Coast of the Lowest Sea (game-sized slice of the real region).
   North = -z, ~520 × 420 m. The Dead Sea shore (white salt shoreline, turquoise water you can wade into — it floats you
   faster upward: buoyancy zone), Ein Gedi oasis (waterfall, pools, palm grove, ibex), Masada mesa to the south (Herod's
   palace terraces, the Roman ramp on the west slope, cable-car station, viewpoint), Qumran caves in the north-west cliffs
   (open cave mouth with the rock shelves), Route 90 with the bus stop, a Bedouin camp (goat-hair tents, campfire, sage
   tea, the saddled camel Zahra + a stray), the desert patrol outpost with a jeep and sandbags, beach kiosk (salt crystals,
   mud tubs, chairs, umbrellas), salt pillars (Lot's wife), a viewpoint on the cliff rim, jackal howls at night, heat
   shimmer. People: Sgt. Noa + patrol soldiers at the outpost, Salem the Bedouin host, Amir the Masada ranger, Tomer the
   lost hiker at Qumran, tourists floating in the sea. Missions: bring 3 water bottles to the outpost, find Tomer at the
   Qumran caves, lead Zahra the camel home. Interactions: float in the sea, mud bath, sage tea at the camp, camel ride,
   cable car up Masada, salt crystals, the bus back to Jerusalem, the portal. Press F for modes: Day / Sunset / Night. */
'use strict';
(function (AV) {
const tr = AV.tr, TAU = AV.TAU, K = AV.kit, A = AV.arch, CY = AV.city, MD = AV.media, C = AV.chars;
const M = K.M, BG = K.BG, deg = d => d * Math.PI / 180, npcYaw = (fx, fz, tx, tz) => Math.atan2(tx - fx, tz - fz);
const hourNow = () => (AV.S.time / 60) % 24, night = () => { const h = hourNow(); return h < 6 || h >= 19 };
const mode = () => AV.S.jdMode || 'day';

/* ======================= layout ======================= */
const XMIN = -140, XMAX = 220, ZMIN = -170, ZMAX = 130, GW = XMAX - XMIN, GD = ZMAX - ZMIN;
const SHORE = 60;                                   // water starts east of x = SHORE (sea occupies x > SHORE, beyond a wade strip)
const CLIFF = { x0: -130, x1: 40 };                 // limestone cliff band west / north-west
const OASIS = { x: -34, z: -52, r: 20 };            // Ein Gedi (spring, pools, waterfall)
const MASADA = { x: 66, z: 104, r: 34, h: 26 };     // the mesa (south-east, plateau top walkable)
const CAVES = { x: -96, z: -128 };                  // Qumran caves (cliff foot)
const CAMP = { x: -14, z: 26, r: 16 };              // Bedouin camp
const POST = { x: -64, z: -6, r: 12 };              // patrol outpost
const KIOSK = { x: 92, z: 18 };                     // beach kiosk
const BUS = { x: -2, z: -2 };                       // bus stop on the road
const PORTAL = { x: 100, z: 26 };                   // portal by the beach
const ROAD = [{ x: XMIN + 10, z: -2 }, { x: 40, z: -6 }, { x: 120, z: 2 }, { x: XMAX - 20, z: 10 }];   // Route 90
function roadD(x, z) { let d = 1e9; for (let i = 1; i < ROAD.length; i++) { const a = ROAD[i - 1], b = ROAD[i], dx = b.x - a.x, dz = b.z - a.z, L = dx * dx + dz * dz, t = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / L)); d = Math.min(d, Math.hypot(x - a.x - dx * t, z - a.z - dz * t) - 5) } return d }
const inRect = (r, x, z, m) => x > r.x0 - (m || 0) && x < r.x1 + (m || 0) && z > r.z0 - (m || 0) && z < r.z1 + (m || 0);
const inSea = (x, z) => x > SHORE + 6;
const inWade = (x, z) => x > SHORE && x <= SHORE + 6;

/* ======================= painted ground ======================= */
const TX = {};
function canvasTex(w, h, draw, rep) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; t.wrapS = t.wrapT = rep ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping; t.userData = { keep: true }; return t }
function groundTex(N) {
  return TX.ground || (TX.ground = canvasTex(N, Math.round(N * GD / GW), (c, w, h) => {
    const m = w / GW, P = (x, z) => [(x - XMIN) * m, (z - ZMIN) * m], r = AV.rng(53);
    c.fillStyle = '#c8a878'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 1500; i++) { const x = r() * w, y = r() * h, s = 2 + r() * 10; c.fillStyle = ['#bd9c6e', '#d2b284', '#c2a072', '#d8bc90'][i % 4]; c.globalAlpha = .3; c.beginPath(); c.arc(x, y, s, 0, TAU); c.fill() } c.globalAlpha = 1;
    const rect = (r0, col) => { const a = P(r0.x0 != null ? r0.x0 : r0[0], r0.z0 != null ? r0.z0 : r0[1]); c.fillStyle = col; c.fillRect(a[0], a[1], ((r0.x1 != null ? r0.x1 : r0[2]) - (r0.x0 != null ? r0.x0 : r0[0])) * m, ((r0.z1 != null ? r0.z1 : r0[3]) - (r0.z0 != null ? r0.z0 : r0[1])) * m) };
    /* salt-white shore band + sea */
    rect({ x0: SHORE - 4, x1: XMAX, z0: ZMIN, z1: ZMAX }, '#e8e2d2'); rect({ x0: SHORE + 4, x1: XMAX, z0: ZMIN, z1: ZMAX }, '#3aa8a8');
    /* darker blue deep sea */
    rect({ x0: SHORE + 26, x1: XMAX, z0: ZMIN, z1: ZMAX }, '#1a7a88');
    /* wavy shoreline */
    c.strokeStyle = '#f4efe0'; c.lineWidth = 2.4 * m; c.beginPath(); for (let z = ZMIN; z <= ZMAX; z += 2) { const x = SHORE + 3 + Math.sin(z * .08) * 2.2; const p = P(x, z); if (z === ZMIN) c.moveTo(p[0], p[1]); else c.lineTo(p[0], p[1]) } c.stroke();
    /* oasis green + palm grove */
    for (let i = 0; i < 160; i++) { const a = r() * TAU, d = Math.sqrt(r()) * OASIS.r, x = OASIS.x + Math.cos(a) * d, z = OASIS.z + Math.sin(a) * d; const p = P(x, z); c.fillStyle = ['#4a7a3a', '#5a8a44', '#3f6a30', '#6a9a4c'][i % 4]; c.beginPath(); c.arc(p[0], p[1], 1.5 + r() * 3, 0, TAU); c.fill() }
    /* canyon streaks from the cliff to the shore (wadis) */
    c.strokeStyle = 'rgba(140,110,74,.4)'; c.lineWidth = 2.6 * m; for (let k = 0; k < 7; k++) { const z0 = ZMIN + 20 + k * 38 + r() * 14; c.beginPath(); let x = CLIFF.x1 - 30 + r() * 30; const p0 = P(x, z0); c.moveTo(p0[0], p0[1]); for (let s = 1; s < 6; s++) { x += 8 + r() * 10; const p = P(Math.min(x, SHORE - 2), z0 + (r() - .5) * 12); c.lineTo(p[0], p[1]) } c.stroke() }
    /* cliff band tint */
    rect({ x0: CLIFF.x0, x1: CLIFF.x0 + 40, z0: ZMIN, z1: 40 }, '#b4906a');
    /* road */
    const seg = (a, b, w2, col) => { const p0 = P(a.x, a.z), p1 = P(b.x, b.z); c.strokeStyle = col; c.lineWidth = w2 * m; c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); c.stroke() };
    for (let i = 1; i < ROAD.length; i++) { seg(ROAD[i - 1], ROAD[i], 12, '#c8b894'); seg(ROAD[i - 1], ROAD[i], 9.6, '#6a6a62') }
    c.setLineDash([3 * m, 3 * m]); for (let i = 1; i < ROAD.length; i++) seg(ROAD[i - 1], ROAD[i], .2, '#e8d890'); c.setLineDash([]);
    for (let i = 0; i < 8000; i++) { const x = XMIN + r() * GW, z = ZMIN + r() * GD; if (roadD(x, z) < 0 && x < SHORE) { c.fillStyle = r() < .5 ? 'rgba(0,0,0,.1)' : 'rgba(255,255,255,.07)'; const q = P(x, z); c.fillRect(q[0], q[1], 1.5, 1.5) } }
    /* Masada ramp (west slope) + dirt path */
    c.strokeStyle = '#a08860'; c.lineWidth = 3.4 * m; { const p0 = P(MASADA.x - MASADA.r - 10, MASADA.z - 4), p1 = P(MASADA.x - 6, MASADA.z + 2); c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); c.stroke() }
    c.strokeStyle = '#b0906a'; c.lineWidth = 2 * m; { const p0 = P(KIOSK.x - 6, KIOSK.z - 4), p1 = P(PORTAL.x, PORTAL.z); c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); c.stroke() }
  }));
}

/* ======================= the world ======================= */
AV.registerWorld({
  id: 'judean_desert',
  build(ctx) {
    const S = AV.S, q = ctx.q, rng = ctx.rng, grp = ctx.group, MT = A.mats(), walk = A.walk();
    if (!S.jd) S.jd = { met: {}, camelHome: false, hikerFound: false, floated: 0, mud: false }; S.items = S.items || {};
    const md = mode();
    const SKY = md === 'sunset' ? { tint: [0xffb070, 0xffd8a8, .3, .3], dome: { s1: 0xff8a3a, s2: 0xff5a6a, swirl: .18, cloud: .4, glow: .8 } }
      : md === 'night' ? { tint: [0x6a7ab0, 0x8a94c8, .5, .5], dome: { swirl: .3, cloud: .3, glow: 1.2 } }
      : { tint: [0xffe0b0, 0xfff0d0, .14, .18], dome: { s1: 0xffd890, s2: 0xffb868, swirl: .06, cloud: .3, glow: .55 } };
    const B = { rock: K.batch(), build: K.batch(), decor: K.batch(), night: K.batch(), camp: K.batch() };
    const rockM = K.floraMat(0, { rough: .95, flat: true }), sandM = MT.v;
    const occ = [];
    const box = (b, mat, col, x0, x1, y0, y1, z0, z1, glow) => b.add(mat, BG.box, col, M((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, x1 - x0, y1 - y0, z1 - z0), glow);
    const solid = (x0, x1, z0, z1) => { ctx.cols.push([x0, x1, z0, z1]); occ.push({ x0, x1, z0, z1 }) };
    const sign = (txt, x, y, z, ry, w, col, posts) => ctx.sign(txt, x, y, z, ry, w, col, posts ? { posts: true } : undefined);
    MD.resetFrames();

    /* ---------- terrain ---------- */
    const H = (x, z) => {
      const d = Math.max(0, XMIN + 30 - x, x - (XMAX - 25), ZMIN + 25 - z, z - (ZMAX - 22));
      let h = Math.min(20, d * .7);
      /* desert bowl: high in the west, slopes down to the sea */
      h += Math.max(0, (SHORE - x) * .12) + Math.max(0, (40 - x) * .05);
      /* wadi dips */
      h -= 2 * Math.max(0, 1 - Math.abs(((z + 40) % 70) - 35) / 8) * Math.max(0, Math.min(1, (SHORE - x) / 40));
      /* Ein Gedi canyon */
      h -= 6 * Math.max(0, 1 - Math.hypot(x - OASIS.x, z - OASIS.z) / (OASIS.r + 8));
      /* Kidron-ish cliff band rise in the NW */
      h += 14 * Math.max(0, 1 - Math.hypot(x - (CLIFF.x0 + 34), z - (-80)) / 70) * (z < 40 ? 1 : .4);
      /* Masada mesa */
      const dm = Math.hypot(x - MASADA.x, z - MASADA.z);
      if (dm < MASADA.r + 16) { const t = Math.max(0, Math.min(1, (dm - MASADA.r) / 16)); h = h * t + (MASADA.h + 2) * (1 - t) }   // steep sides, flat top
      if (inSea(x, z)) h = -1.4; else if (inWade(x, z)) h = Math.min(h, -.5 + (x - SHORE) * .12);
      return h;
    };
    const sx = [150, 230, 300][q], sz = Math.round(sx * GD / GW), tg = new THREE.PlaneGeometry(GW, GD, sx, sz); tg.rotateX(-Math.PI / 2); tg.translate((XMIN + XMAX) / 2, 0, (ZMIN + ZMAX) / 2);
    const tp = tg.attributes.position; for (let i = 0; i < tp.count; i++) tp.setY(i, H(tp.getX(i), tp.getZ(i))); tg.computeVertexNormals();
    const gmat = new THREE.MeshStandardMaterial({ map: groundTex([1024, 2048, 2048][q]), roughness: .96 }), grain = A.tex('grain');
    gmat.onBeforeCompile = sh => { sh.uniforms.detailMap = { value: grain }; sh.fragmentShader = 'uniform sampler2D detailMap;\n' + sh.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n diffuseColor.rgb *= mix(1.0, texture2D(detailMap, vUv * 160.0).r * 1.4, .3);') };
    gmat.customProgramCacheKey = () => 'jdGround'; gmat.userData.lin = 1; const ground = new THREE.Mesh(tg, gmat); ground.receiveShadow = true; grp.add(ground);
    { const sk = new THREE.RingGeometry(Math.max(GW, GD) / 2, 900, 64, 2); sk.rotateX(-Math.PI / 2); sk.translate((XMIN + XMAX) / 2, -2.4, (ZMIN + ZMAX) / 2); grp.add(new THREE.Mesh(sk, AV.std(0xc8a878, 1))) }
    /* Jordan hills haze on the far east horizon */
    { const parts = [], r = AV.rng(43); for (let i = 0; i < 22; i++) { const a = deg(-50 + i * 8 + r() * 4), d = 760 + r() * 200, h = 90 + r() * 150; parts.push([BG.ico, [0x9ab4c4, 0xa8bcd0, 0x8aa8bc][i % 3], M((XMIN + XMAX) / 2 + Math.cos(a) * d, h * .32 - 24, (ZMIN + ZMAX) / 2 + Math.sin(a) * d, 160 + r() * 90, h, 130 + r() * 70), 0]) }
      const mm = new THREE.Mesh(K.merge(parts), new THREE.MeshBasicMaterial({ vertexColors: true, fog: false })); mm.material.userData.lin = 1; grp.add(mm); ctx.upd.push(() => mm.material.color.setScalar(1 - (AV.nightK || 0) * .72)) }

    /* ---------- the Dead Sea ---------- */
    const wopt = { deep: 0x1a7a88, shallow: 0x3ab8b8, sky: 0xc8e8f0, iri: .22, opacity: .93, scale: .5 };
    { const w = K.waterPlane(ctx, new THREE.PlaneGeometry(XMAX - SHORE - 4, GD), -.62, wopt); w.position.x = (SHORE + 4 + XMAX) / 2; w.position.z = (ZMIN + ZMAX) / 2 }
    /* salt crust chunks + foam line at the shore */
    { for (let i = 0; i < 40; i++) { const z = ZMIN + 10 + rng() * (GD - 20), x = SHORE + 4 + rng() * 3, y = H(x, z); if (y > 0) continue;
        B.decor.add(MT.v, BG.ico, 0xf2efe4, M(x, y + .1, z, .5 + rng() * .9, .25 + rng() * .3, .5 + rng() * .9, 0, rng() * TAU, 0)) }
      for (let z = ZMIN + 8; z < ZMAX - 8; z += 2.4) { const x = SHORE + 3.2 + Math.sin(z * .08) * 2.2, y = H(x, z); box(B.decor, MT.v, 0xf4efe2, x - 1, x + 1, y - .05, y + .12, z - 1, z + 1) } }
    /* salt pillars (Lot's wife) out in the shallows */
    for (const [px, pz, h] of [[SHORE + 16, 52, 4.6], [SHORE + 20, -34, 3.6]]) { B.rock.add(MT.v, new THREE.CylinderGeometry(.9, 1.4, h, 7), 0xe8e4d4, M(px, -.6 + h / 2, pz, 1, 1, 1, .12, 0, .1)); B.rock.add(MT.v, BG.ico, 0xf2efe4, M(px, -.6 + h, pz, 1.2, .7, 1.2)); sign('SALT PILLAR', px - 4, -.4 + h + 1.6, pz, -Math.PI / 2, 2.6, '#7ff0ff', true) }

    /* ---------- Ein Gedi oasis: pools, waterfall, palms ---------- */
    { const ox = OASIS.x, oz = OASIS.z, oy = H(ox, oz);
      /* canyon walls */
      for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { const px = ox + s * (8 + k * 6), pz = oz + (rng() - .5) * 26; B.rock.add(rockM, BG.ico, [0xb4906a, 0xa58460, 0xc0a078][k], M(px, H(px, pz) + 2 + k * 2.4, pz, 7 + rng() * 4, 5 + rng() * 4, 6 + rng() * 3, rng(), rng() * 3, rng())) }
      /* spring pools */
      for (const [px, pz, r0] of [[ox - 4, oz + 6, 3.4], [ox + 2, oz, 2.6], [ox + 7, oz - 7, 2]]) { const py = H(px, pz) + .1; const w = K.waterPlane(ctx, new THREE.CircleGeometry(r0, 30), py, { deep: 0x1a6a5a, shallow: 0x4ac8b0, sky: 0xb8e8f0, iri: .3, opacity: .92 }); w.position.x = px; w.position.z = pz; walk.pad(px, pz, r0 - 1, py) }
      /* waterfall from the cliff niche */
      const fx = ox - 9, fz = oz - 2, fy = H(fx, fz); K.waterfall(ctx, fx + 1.2, fy + 1, fz, 2.6, 7, 0, { c1: 0x9ae8ff });
      B.rock.add(rockM, BG.ico, 0xa58460, M(fx, fy + 8, fz, 4, 4, 3, 0, 0, .3));
      /* walkable stepping stones through the pools */
      for (let i = 0; i < 5; i++) { const px = ox - 6 + i * 3.2, pz = oz + 6 - i * 1.4, py = H(px, pz); B.decor.add(MT.stone, BG.ico, 0xb0a080, M(px, py + .15, pz, 1.1, .3, .9, 0, i, 0)); walk.pad(px, pz, .8, py + .28) }
      sign('EIN GEDI · oasis', ox + 10, H(ox + 10, oz + 14) + 3, oz + 14, -Math.PI / 2, 4, '#7aff9a', true) }

    /* ---------- Masada ---------- */
    { const mx = MASADA.x, mz = MASADA.z, top = MASADA.h + 2;
      /* plateau pad */
      walk.pad(mx, mz, MASADA.r - 2, top);
      /* cliff rim boulders */
      for (let k = 0; k < 26; k++) { const a = k / 26 * TAU, px = mx + Math.cos(a) * (MASADA.r + 3), pz = mz + Math.sin(a) * (MASADA.r + 3); B.rock.add(rockM, BG.ico, 0xb4906a, M(px, top - 6 - rng() * 4, pz, 5 + rng() * 4, 7 + rng() * 5, 5 + rng() * 4, rng(), rng() * 3, rng())) }
      /* Herod's northern palace terraces + storerooms + bath */
      box(B.build, MT.stucco, 0xd8ccb2, mx - 8, mx + 8, top, top + 3, mz - MASADA.r + 10, mz - MASADA.r + 18); solid(mx - 8, mx + 8, mz - MASADA.r + 10, mz - MASADA.r + 18);
      for (let t = 0; t < 3; t++) { const ty = top - t * 3.4, dd = 12 - t * 2.4; box(B.build, MT.stucco, 0xd8ccb2, mx - dd, mx + dd, ty, ty + 2.6, mz + MASADA.r - 14 - t * 4, mz + MASADA.r - 10 - t * 4); walk.pad(mx, mz + MASADA.r - 12 - t * 4, dd - 1, ty + 2.6) }
      /* columns on the lower terrace */
      for (let k = 0; k < 6; k++) { const px = mx - 8 + k * 3.2, pz = mz + MASADA.r - 16; B.build.add(MT.v, A.geo('cyl'), 0xe8dfc8, M(px, top - 10.2 + .9, pz, .4, 2.6, .4)) }
      /* cisterns (dark rooms) */
      box(B.build, MT.stone, 0x8a7a5e, mx + 10, mx + 22, top - 2.4, top + 2, mz - 6, mz + 6); solid(mx + 10, mx + 22, mz - 6, mz + 6);
      /* Roman ramp (west, dirt + stone, walkable!) */
      { const a0 = { x: mx - MASADA.r - 12, z: mz - 4 }, a1 = { x: mx - 4, z: mz + 2 }, L = Math.hypot(a1.x - a0.x, a1.z - a0.z), n = 14;
        for (let i = 0; i <= n; i++) { const f = i / n, px = a0.x + (a1.x - a0.x) * f, pz = a0.z + (a1.z - a0.z) * f, py = H(a0.x, a0.z) * (1 - f) + top * f;
          box(B.rock, MT.stone, 0xa8926e, px - 2.4, px + 2.4, py - 1.4, py + .25, pz - 2.4, pz + 2.4); walk.pad(px, pz, 2.6, py + .25) }
        sign('ROMAN RAMP', a0.x + 2, H(a0.x, a0.z) + 3.4, a0.z - 3, 0, 3.4, '#ffd84a', true) }
      /* cable car station (east foot) + cable */
      { const cx0 = mx + MASADA.r + 10, cz0 = mz + 4, cy0 = H(cx0, cz0);
        box(B.build, MT.shiny, 0x8a8a92, cx0 - 3, cx0 + 3, cy0, cy0 + 4, cz0 - 3, cz0 + 3); solid(cx0 - 3, cx0 + 3, cz0 - 3, cz0 + 3);
        box(B.build, MT.v, 0xb04a3a, cx0 - 3.4, cx0 + 3.4, cy0 + 4, cy0 + 4.6, cz0 - 3.4, cz0 + 3.4);
        const cable = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(cx0, cy0 + 4.4, cz0), new THREE.Vector3(mx, top + 4, mz)]), new THREE.LineBasicMaterial({ color: 0x3a3a3a })); grp.add(cable);
        sign('CABLE CAR', cx0, cy0 + 6, cz0, Math.PI / 2, 3.6, '#9ad8ff', true);
        ctx.T.push({ x: cx0, z: cz0 + 4, r: 3, label: () => tr('Cable car up Masada (10)', 'Teleférico a Masada (10)'), fn: () => { if (!AV.txn(-10, 'Cable car')) return; AV.audio && AV.audio.blip(392, .4, 'sine', .1); AV.fadeTo(1, 400); setTimeout(() => { const P = AV.P, sp = AV.safeSpot(AV.W, mx, mz - 6); P.x = sp[0]; P.z = sp[1]; P.y = AV.W.surface(P.x, P.z) || top; P.vx = P.vz = 0; S.time += 8; AV.fadeTo(0, 600); AV.toast(tr('The cabin sways up the cliff. Herod’s terraces unfold below.', 'La cabina se balancea subiendo el acantilado. Las terrazas de Herodes se abren abajo.')) }, 900) } }) }
      /* summit view sign + viewpoint bonus */
      sign('MASADA · גן לאומי', mx, top + 6, mz, 0, 5.4, '#ffd84a', true);
      ctx.T.push({ x: mx + 4, z: mz - 4, r: 6, label: () => tr('Look out over the Dead Sea', 'Mirar el Mar Muerto'), fn: () => { AV.P.yaw = Math.atan2(-(SHORE + 30 - AV.P.x), -(20 - AV.P.z)); AV.P.pitch = -.18; AV.vitals && AV.vitals.add(0, 10); AV.toast(tr('The sea gleams 430 metres below. Blue salt, white shore, haze over Jordan.', 'El mar brilla 430 metros más abajo. Sal azul, orilla blanca y bruma sobre Jordania.')) } }) }
    /* the dirt track up the east side (walkable ramp) */
    { const y0 = H(MASADA.x + MASADA.r + 8, MASADA.z + 8), y1 = MASADA.h + 2; for (let i = 0; i <= 34; i++) { const f = i / 34, px = MASADA.x + MASADA.r + 8 - f * (MASADA.r + 4), pz = MASADA.z + 8 - f * 10, py = y0 * (1 - f) + y1 * f; walk.pad(px, pz, 3, py + .2) } }

    /* ---------- Qumran caves ---------- */
    { const cx0 = CAVES.x, cz0 = CAVES.z, cy0 = H(cx0, cz0);
      /* cliff face behind */
      for (let k = 0; k < 5; k++) B.rock.add(rockM, BG.ico, 0xb4906a, M(cx0 - 6 - k * 5, cy0 + 6 + k * 3, cz0 + (rng() - .5) * 30, 8 + rng() * 5, 8 + rng() * 6, 8 + rng() * 4, rng(), rng() * 3, rng()));
      /* the open cave: mouth + shelves */
      box(B.rock, rockM, 0xa58460, cx0 - 5, cx0 + 5, cy0, cy0 + 5, cz0 - 5, cz0 - 2); solid(cx0 - 5, cx0 + 5, cz0 - 5, cz0 - 2);
      box(B.rock, MT.stone, 0x4a3826, cx0 - 3.4, cx0 + 3.4, cy0 + .2, cy0 + 3.6, cz0 - 2.2, cz0 + 2.6, 0);
      for (let k = 0; k < 3; k++) { box(B.decor, MT.wood, 0x6a4a2a, cx0 - 2.6 + k * 2.6, cx0 - 1.4 + k * 2.6, cy0 + .6 + k * .5, cy0 + .8 + k * .5, cz0 + .4, cz0 + 1.4); /* clay jars */ B.decor.add(MT.v, A.geo('cyl'), 0xa87a4a, M(cx0 - 2 + k * 2.6, cy0 + 1.1 + k * .5, cz0 + .9, .18, .5, .18, 0, 0, 0)); B.decor.add(MT.v, BG.sph, 0x8a6030, M(cx0 - 2 + k * 2.6, cy0 + 1.44 + k * .5, cz0 + .9, .2, .14, .2)) }
      walk.pad(cx0, cz0 + 1, 3, cy0 + .2);
      sign('QUMRAN CAVES · Dead Sea Scrolls', cx0, cy0 + 6.4, cz0 + 6, 0, 5.4, '#e8d890', true);
      /* the path marker to the caves */
      sign('CAVES →', cx0 + 12, cy0 + 2.6, cz0 + 14, 0, 2.6, '#ffd84a', true) }

    /* ---------- Bedouin camp ---------- */
    { const cx0 = CAMP.x, cz0 = CAMP.z, cy0 = H(cx0, cz0);
      /* goat-hair tents: low dark ridged tents */
      for (const [tx0, tz0, ry] of [[cx0 - 5, cz0 - 3, .3], [cx0 + 6, cz0 + 2, -.5], [cx0 - 1, cz0 + 8, 1.2]]) {
        const ty0 = H(tx0, tz0), L = 8, W2 = 5, Hh = 2.6;
        const tent = new THREE.Mesh(new THREE.CylinderGeometry(0, W2 * .72, Hh, 4, 1), K.floraMat(0, { rough: .95, flat: true }));
        tent.material.color.setHex(0x3a3228); tent.position.set(tx0, ty0 + Hh / 2, tz0); tent.rotation.y = ry; tent.scale.set(1, 1, 1.35); tent.castShadow = q === 2; grp.add(tent);
        box(B.camp, MT.wood, 0x5a4a34, tx0 - 2, tx0 + 2, ty0, ty0 + 2.2, tz0 + 1, tz0 + 1.4);   // entrance flap gap marker
        walk.pad(tx0, tz0 + 1.6, 2.6, ty0 + .25); solid(tx0 - W2 * .6, tx0 + W2 * .6, tz0 - 2.4, tz0 + .6);
      }
      /* campfire + kettle */
      const fx = cx0 + 1, fz = cz0 - 6, fy = H(fx, fz);
      for (let k = 0; k < 7; k++) { const a = k / 7 * TAU; B.camp.add(MT.stone, BG.ico, 0x8a7a62, M(fx + Math.cos(a) * 1, fy + .15, fz + Math.sin(a) * 1, .3, .25, .3)) }
      { const fire = new THREE.Group(); fire.position.set(fx, fy + .3, fz); grp.add(fire);
        for (let k = 0; k < 3; k++) { const m = new THREE.Mesh(BG.sph, new THREE.MeshBasicMaterial({ color: [0xff8a2a, 0xffd23a, 0xff5a1a][k] })); m.scale.set(.18 - k * .04, .3 - k * .07, .18 - k * .04); fire.add(m) }
        ctx.upd.push((dt, t) => { fire.visible = true; fire.children.forEach((m, k) => { const a = t * 3 + k * 2.1; m.position.set(Math.sin(a) * .1, .3 + Math.abs(Math.sin(a * 1.3)) * .5, Math.cos(a * .8) * .1); m.scale.y = (.3 - k * .07) * (1 + Math.sin(t * 7 + k) * .2) }) }) }
      B.camp.add(MT.v, A.geo('cyl'), 0x2a2a26, M(fx + .3, fy + .8, fz, .18, .4, .18)); B.camp.add(MT.v, A.geo('cyl'), 0x6a5a3a, M(fx + .3, fy + 1.06, fz, .1, .1, .1));
      K.motes(ctx, { n: 26, x: fx, z: fz, r: 2.4, y0: fy + .3, y1: fy + 2.6, cols: [0xffb060, 0xffd890], size: 2.2 });
      /* rugs + cushions + low tables */
      for (const [rx, rz, col] of [[cx0 - 2, cz0 + 1, 0x8a2a3a], [cx0 + 3, cz0 + 3, 0x2a5a6a]]) { const ry0 = H(rx, rz); box(B.camp, MT.v, col, rx - 1.4, rx + 1.4, ry0 + .04, ry0 + .1, rz - 1, rz + 1) }
      for (const [rx, rz] of [[cx0 - 3, cz0 + 2], [cx0 + 2, cz0 + 4], [cx0, cz0 + 6]]) B.camp.add(MT.v, BG.sph, [0xd84a8a, 0x4ac8c8, 0xffd84a][Math.abs(rx) % 3], M(rx, H(rx, rz) + .28, rz, .5, .32, .5));
      /* the saddled camel (Zahra) + a stray */
      const mkCamel = (x, z, saddled) => { const y = H(x, z), g = new THREE.Group(); g.position.set(x, y, z); grp.add(g);
        const body = [[BG.sph, 0xb08a5a, M(0, 1.5, 0, .9, .7, 1.7)], [BG.sph, 0xb08a5a, M(0, 2.15, .3, .55, .45, .7)], [BG.sph, 0xb08a5a, M(0, 2.15, -.35, .5, .4, .65)], [BG.cyl, 0xa87f50, M(0, 1.9, 1.6, .3, 1, .3, 1, 0, 0)], [BG.sph, 0xa87f50, M(0, 2.5, 2.05, .35, .38, .5)], [BG.sph, 0x2a1a10, M(0, 2.62, 2.32, .09, .07, .09)]];
        for (const [lx, lz] of [[-.55, 1.05], [.55, 1.05], [-.55, -.95], [.55, -.95]]) body.push([BG.cyl, 0xa87f50, M(lx, .75, lz, .14, 1.5, .14)]);
        body.push([BG.cyl, 0xa87f50, M(0, 2.5, 1.75, .12, .12, .12, 0, 0, 0)]);
        const bm = new THREE.Mesh(K.merge(body), K.floraMat(0, { rough: .9 })); bm.castShadow = q === 2; g.add(bm);
        const tail = new THREE.Mesh(K.merge([[BG.cyl, 0xa87f50, M(0, -.2, -.1, .06, .5, .06, -.4)]]), bm.material); tail.position.set(0, 1.9, -1.6); g.add(tail);
        if (saddled) { const red = K.floraMat(0, { rough: .7 }); const s1 = new THREE.Mesh(K.merge([[BG.box, 0xc83a2a, M(0, 0, 0, .9, .18, 1.3)], [BG.box, 0xc83a2a, M(.62, .28, 0, .08, .3, 1)], [BG.box, 0xc83a2a, M(-.62, .28, 0, .08, .3, 1)], [BG.sph, 0xffd23a, M(0, .45, -.55, .1, .18, .1), .6]]), red); s1.position.set(0, 2.15, 0); g.add(s1); g.userData.tassel = s1 }
        g.userData.home = [x, z]; return g };
      const zahra = mkCamel(cx0 + 9, cz0 - 9, true); ctx.circles.push([cx0 + 9, cz0 - 9, 1.2]);
      const camelHome = mkCamel(cx0 - 8, cz0 - 10, false); ctx.circles.push([cx0 - 8, cz0 - 10, 1.2]);
      /* camels wander a little */
      ctx.upd.push((dt, t) => { for (const c of [zahra, camelHome]) { const hm = c.userData.home; c.position.x = hm[0] + Math.sin(t * .07 + hm[0]) * 2.2; c.position.z = hm[1] + Math.cos(t * .05 + hm[1]) * 1.6 } });
      sign('BEDOUIN CAMP · مرحبا', cx0, H(cx0, cz0) + 4.4, cz0 - 12, 0, 4.6, '#ffd08a', true);
      /* camel ride + tea interactions */
      ctx.T.push({ x: cx0 + 9, z: cz0 - 9, r: 2.6, label: () => tr('Ride the camel (15)', 'Montar en la camella (15)'), fn: () => { if (!AV.txn(-15, 'Camel ride')) return; AV.toast(tr('Zahra stands up rear legs first. You lean back and hold on. The desert rolls by at camel speed — which is its own kind of perfect.', 'Zahra se levanta primero con las traseras. Te echas hacia atrás y te agarras. El desierto pasa a velocidad de camella: una clase de perfección.')); S.time += 15; AV.dlg && AV.dlg.event('camel_ride'); AV.vitals && AV.vitals.add(0, 8) } });
      ctx.T.push({ x: fx, z: fz + 1.4, r: 2.6, label: () => tr('Salem’s fire: drink sage tea (free)', 'Fuego de Salem: té de salvia (gratis)'), fn: () => { if (AV.bag) AV.bag.add('sage_tea', 1, true); else S.items.sage_tea = (S.items.sage_tea || 0) + 1; AV.toast(tr('Salem pours tea from a height, the way it must be poured. Sweet, hot, with desert sage.', 'Salem sirve el té desde lo alto, como hay que servirlo. Dulce, caliente y con salvia del desierto.')); AV.audio && AV.audio.blip(523, .3, 'sine', .1) } }) }

    /* ---------- desert patrol outpost ---------- */
    { const px0 = POST.x, pz0 = POST.z, py0 = H(px0, pz0);
      /* concrete hut + shade netting */
      box(B.build, MT.stucco, 0xcabf9e, px0 - 4, px0 + 4, py0, py0 + 3.4, pz0 - 3, pz0 + 3); solid(px0 - 4, px0 + 4, pz0 - 3, pz0 + 3);
      box(B.build, MT.v, 0x8a9aa8, px0 - 4.4, px0 + 4.4, py0 + 3.4, py0 + 4, pz0 - 3.4, pz0 + 3.4);
      for (const [cx2, cz2] of [[px0 - 5, pz0 + 5], [px0 + 5, pz0 + 5]]) { B.build.add(MT.v, A.geo('cyl'), 0x6a6a62, M(cx2, py0 + 1.5, cz2, .1, 3, .1)); ctx.circles.push([cx2, cz2, .2]) }
      box(B.build, MT.dbl, 0x8a9aa8, px0 - 6, px0 + 6, py0 + 2.9, py0 + 3.1, pz0 + 4, pz0 + 6.4);
      /* sandbags + antenna + water jerrycans (empty, hence the mission!) */
      for (let k = 0; k < 8; k++) box(B.decor, MT.v, 0xa89a72, px0 - 4.8 + k * 1.2, px0 - 3.9 + k * 1.2, py0, py0 + .5, pz0 + 4, pz0 + 4.8);
      B.build.add(MT.v, A.geo('cyl'), 0x8a8a84, M(px0 + 3.4, py0 + 5, pz0 - 2, .04, 6, .04)); ctx.circles.push([px0 + 3.4, pz0 - 2, .2]);
      for (let k = 0; k < 3; k++) B.decor.add(MT.v, A.geo('cyl'), 0x5a6a3a, M(px0 - 3 + k * .8, py0 + .3, pz0 - 4.4, .3, .6, .3));
      /* the patrol jeep */
      { const j = new THREE.Mesh(CY && CY.VB && CY.VB.jeep ? CY.VB.jeep(0xb8a27a) : BG.box, K.floraMat(0, { rough: .5 })); j.position.set(px0 + 8, H(px0 + 8, pz0 + 4), pz0 + 4); j.rotation.y = -.6; j.castShadow = q === 2; grp.add(j); ctx.cols.push([px0 + 6.6, px0 + 9.8, pz0 + 2.4, pz0 + 5.6]) }
      sign('DESERT PATROL OUTPOST', px0, py0 + 5.6, pz0 - 3.6, 0, 4.8, '#e8d08a', true) }

    /* ---------- beach kiosk + umbrellas + mud tubs ---------- */
    { const kx = KIOSK.x, kz = KIOSK.z, ky = H(kx, kz);
      box(B.build, MT.shiny, 0x2a8a8a, kx - 2.6, kx + 2.6, ky, ky + 2.6, kz - 2, kz + 2); solid(kx - 2.6, kx + 2.6, kz - 2, kz + 2);
      box(B.build, MT.roof, 0xe8e4d4, kx - 3.2, kx + 3.2, ky + 2.6, ky + 3.2, kz - 2.6, kz + 2.6);
      B.night.add(MT.v, BG.box, 0xfff0c0, M(kx, ky + 1.6, kz + 2.05, 2.2, .8, .1), .8);
      sign('DEAD SEA KIOSK', kx, ky + 4.6, kz, Math.PI, 4.2, '#7ff0ff', true);
      /* umbrellas + chairs along the shore */
      for (let k = 0; k < 6; k++) { const ux = SHORE + 3 + (k % 2) * 5, uz = -30 + k * 14, uy = H(ux, uz);
        B.decor.add(MT.v, A.geo('cyl'), 0xc0c0c0, M(ux, uy + 1.1, uz, .04, 2.2, .04)); B.decor.add(MT.dbl, A.geo('halfDome'), [0xff4ad2, 0xffd84a, 0x3ad8ff, 0x7aff8a, 0xff8a3a, 0x4ac8ff][k % 6], M(ux, uy + 2.2, uz, 1.5, .5, 1.5), .12); ctx.circles.push([ux, uz, .25]);
        B.decor.add(MT.v, BG.box, 0xf4f0e8, M(ux + 1.6, uy + .25, uz, .6, .5, .6)) }
      /* mud tubs */
      for (let k = 0; k < 2; k++) { const tx0 = SHORE + 12, tz0 = 8 + k * 6, ty0 = H(tx0, tz0); B.decor.add(MT.v, new THREE.CylinderGeometry(1.4, 1.1, 1, 12), 0x8a6a4a, M(tx0, ty0 + .5, tz0)); B.decor.add(MT.v, new THREE.CylinderGeometry(1.2, 1.2, .15, 12), 0x3a2e24, M(tx0, ty0 + .95, tz0)); ctx.circles.push([tx0, tz0, 1.5]);
        ctx.T.push({ x: tx0, z: tz0, r: 2, label: () => tr('Dead Sea mud bath', 'Baño de barro del Mar Muerto'), fn: () => { if (!S.jd.mud) { S.jd.mud = true; AV.vitals && AV.vitals.add(0, 8) } AV.toast(tr('You smear the famous black mineral mud over your arms. Your skin feels ten years younger and you look like a very relaxed statue.', 'Te untas el famoso barro negro mineral por los brazos. La piel se siente diez años más joven y pareces una estatua muy relajada.')) } }) } }

    /* ---------- Route 90 bus stop + portal ---------- */
    { const by0 = H(BUS.x, BUS.z); box(B.decor, MT.shiny, 0x2a4ab8, BUS.x - .2, BUS.x + .2, by0, by0 + 3.2, BUS.z - 1.6, BUS.z + 1.6); B.night.add(MT.v, BG.box, 0x3a6aff, M(BUS.x, by0 + 3.6, BUS.z, .3, 1.2, 1.2), 1);
      sign('BUS 486 · 444 · JERUSALEM', BUS.x - 6, by0 + 4.4, BUS.z - 2, Math.PI / 2, 4.2, '#9ad8ff', true);
      ctx.T.push({ x: BUS.x, z: BUS.z + 2.6, r: 2.6, label: () => tr('Bus to Jerusalem (8)', 'Autobús a Jerusalén (8)'), fn: () => { if (!AV.txn(-8, 'Bus to Jerusalem')) return; AV.audio && AV.audio.blip(523, .3, 'sine', .1); AV.fadeTo(1, 400); setTimeout(() => { AV.travel('jerusalem', 'pipe') }, 500) } });
      const portal = new THREE.Group(); portal.position.set(PORTAL.x, H(PORTAL.x, PORTAL.z) + 1.7, PORTAL.z); grp.add(portal);
      { const ring = new THREE.Mesh(new THREE.TorusGeometry(1.3, .14, 10, 40), new THREE.MeshBasicMaterial({ color: 0xb07aff })); portal.add(ring);
        const disc = new THREE.Mesh(new THREE.CircleGeometry(1.25, 40), new THREE.MeshBasicMaterial({ color: 0x7a3aff, transparent: true, opacity: .45, side: THREE.DoubleSide, depthWrite: false })); portal.add(disc);
        ctx.upd.push((dt, t) => { ring.rotation.z = t * .8; disc.material.opacity = .35 + Math.sin(t * 2) * .12; disc.material.color.setHSL((t * .05) % 1, .8, .5) }); ctx.circles.push([PORTAL.x, PORTAL.z, 1]) }
      sign('PORTAL TO APE TOWN', PORTAL.x, H(PORTAL.x, PORTAL.z) + 6.4, PORTAL.z, Math.PI / 2, 4, '#d8a0ff', true) }

    /* ---------- vegetation: palms, acacia, dry bushes ---------- */
    const freeV = (x, z, pad) => x > XMIN + 6 && x < XMAX - 6 && z > ZMIN + 6 && z < ZMAX - 6 && roadD(x, z) > (pad || 3) && !occ.some(o => inRect(o, x, z, (pad || 1.5))) && x < SHORE - 2 && Math.hypot(x - CAMP.x, z - CAMP.z) > CAMP.r && Math.hypot(x - POST.x, z - POST.z) > POST.r + 4;
    const pickV = (n, area, ok, s0, s1) => { const out = []; for (let i = 0, t = 0; i < n && t < n * 30; t++) { const x = area.x0 + rng() * (area.x1 - area.x0), z = area.z0 + rng() * (area.z1 - area.z0); if (!ok(x, z)) continue; out.push({ x, y: H(x, z), z, s: s0 + rng() * (s1 - s0), ry: rng() * TAU }); i++ } return out };
    /* palm grove at the oasis + a few near the camp */
    const palms = pickV(K.n(30), { x0: OASIS.x - 16, x1: OASIS.x + 18, z0: OASIS.z - 18, z1: OASIS.z + 18 }, (x, z) => Math.hypot(x - OASIS.x, z - OASIS.z) < OASIS.r && freeV(x, z, 3), 1.6, 2.4)
      .concat(pickV(6, { x0: CAMP.x - 20, x1: CAMP.x + 20, z0: CAMP.z - 16, z1: CAMP.z + 16 }, (x, z) => freeV(x, z, 3), 1.4, 2));
    palms.forEach(p => ctx.circles.push([p.x, p.z, .4]));
    ['palm_a', 'palm_b', 'palm_c'].forEach((k, j) => K.instModel(ctx, 'quaternius/' + k, palms.filter((_, i) => i % 3 === j), it => K.scatter(ctx, K.species.palm(0x8a5a2a, 0x4a9a3a), K.floraMat(.008), it.map(o => Object.assign({}, o, { s: o.s * .55 })), { far: K.far(false), cell: 70 }), { sway: .004, far: K.far(false), cell: 70 }));
    /* acacia: flat-topped desert trees */
    const acacia = pickV(K.n(14), { x0: XMIN + 20, x1: SHORE - 10, z0: ZMIN + 20, z1: ZMAX - 20 }, (x, z) => freeV(x, z, 4) && Math.hypot(x - OASIS.x, z - OASIS.z) > OASIS.r + 6, 1.4, 2);
    acacia.forEach(p => ctx.circles.push([p.x, p.z, .5]));
    K.scatter(ctx, K.merge([[BG.cyl, 0x6a5a42, M(0, 1, 0, .18, 2, .18, .1, 0, .08)], [BG.ico, 0x6a7a3a, M(0, 2.6, 0, 1.7, .5, 1.6)], [BG.ico0, 0x5a6a30, M(.8, 2.2, .3, .9, .35, .85)]]), K.floraMat(.005), acacia, { far: K.far(false), cell: 80 });
    /* dry bushes + desert flowers */
    K.field(ctx, K.species.bush(0x8a7a4a, 0xd8b860), K.floraMat(.02), K.n(60), { x0: XMIN + 10, x1: SHORE - 6, z0: ZMIN + 10, z1: ZMAX - 10 }, { H, s0: .7, s1: 1.2, shadow: false, cell: 64, ok: (x, z) => freeV(x, z, 2) });
    K.field(ctx, K.species.flower(0xe86a8a, 0xffd23a), K.floraMat(.08), K.n(30), { x0: OASIS.x - 30, x1: OASIS.x + 30, z0: OASIS.z - 30, z1: OASIS.z + 30 }, { H, s0: .8, s1: 1.3, shadow: false, cell: 48, far: K.far(true), ok: (x, z) => freeV(x, z, 1.6) });
    /* salt crystals at the shore (pickups handled by AV.PICKUPS) */
    for (let i = 0; i < 14; i++) { const x = SHORE + 4 + rng() * 5, z = ZMIN + 10 + rng() * (GD - 20), y = H(x, z); if (y > 0) continue; B.decor.add(MT.v, BG.oct, 0xf4f2ea, M(x, y + .3, z, .3 + rng() * .3, .5 + rng() * .5, .3 + rng() * .3, 0, rng() * TAU, 0), .25) }

    /* ======================= PEOPLE ======================= */
    const crew = {};
    const groundAt = (px, pz) => { const p2 = walk.at(px, pz); return p2 === undefined ? H(px, pz) : Math.max(p2, H(px, pz)) };   /* the world's own surface: AV.W is still the previous world during a build */
    const spawn = (id, body, x, z, yaw, anim) => { const n = AV.npc.spawn(ctx, id, { x, z, yaw, body, H: groundAt, r: 2.6, anim, speed: 1.2 }); n.tag.position.y = 2.25; n.bub.position.y = 2.95; crew[id] = n; return n };
    spawn('noa', C.regional.body('soldier', 71), POST.x - 1, POST.z + 5, Math.PI, (n, dt, t, d, talking) => { const u = n.g.userData; if (!n.path && !talking) { u.aR.rotation.x = -.6; u.aL.rotation.x = -.6 + Math.sin(t * .8) * .06 } });
    spawn('salem', C.regional.body('bedouin', 82), CAMP.x + 1, CAMP.z + 5, Math.PI, (n, dt, t, d, talking) => { const u = n.g.userData; if (!n.path && !talking && d > 6) u.aR.rotation.x = -.5 + Math.sin(t * .7) * .1 });
    spawn('amir', C.regional.body('guide', 93), MASADA.x + MASADA.r + 10, MASADA.z + 4 + 3, -Math.PI / 2 + .4);
    spawn('tomer', C.regional.body('student', 104), CAVES.x + 1, CAVES.z + 3, Math.PI);
    /* the lost hiker sits in the shade of the cave until found */
    const sitPose = (n, t, d) => { const u = n.g.userData; if (n.seat && !n.path && Math.hypot(n.g.position.x - n.seat.x, n.g.position.z - n.seat.z) < .4) { u.lL.rotation.x = u.lR.rotation.x = -1.45; n.g.position.y = groundAt(n.g.position.x, n.g.position.z) - .33 } };
    crew.tomer.seat = { x: CAVES.x + 1, z: CAVES.z + 3, yaw: Math.PI };
    /* interactions */
    const T = (x, z, r, label, fn, show) => { const t = { x, z, r, label, fn, show }; ctx.T.push(t); return t };
    const buy = (cost, what, msg, item) => { if (!AV.txn(-cost, what)) return false; if (item) { if (AV.bag) AV.bag.add(item, 1, true); else S.items[item] = (S.items[item] || 0) + 1; AV.quests && AV.quests.check(); msg += tr(' → backpack (I)', ' → mochila (I)') } AV.toast(msg); AV.audio && AV.audio.blip(660, .15, 'triangle', .12); return true };
    /* float in the Dead Sea (buoyancy: the surface check makes you bob up) */
    const seaT = T(SHORE + 8, 40, 30, () => tr('Float in the Dead Sea', 'Flotar en el Mar Muerto'), () => { const P = AV.P; P.x = SHORE + 12; P.z = P.z; P.y = 0; P.vx = P.vz = 0; S.jd.floated++; AV.quests && AV.quests.check(); AV.toast(tr('You lie back and the water holds you like a hammock. A salty leaf of mineral soup. Don’t splash your eyes!', 'Te tumbas y el agua te sostiene como una hamaca. Una hoja salada de sopa mineral. ¡No salpiques tus ojos!')); AV.vitals && AV.vitals.add(0, 6); AV.dlg && AV.dlg.event('dead_sea_float') });
    /* kiosk */
    T(KIOSK.x, KIOSK.z + 2.6, 2.2, () => tr('Kiosk: cold water (5)', 'Quiosco: agua fría (5)'), () => buy(5, 'Kiosk', tr('Ice cold. The best money can buy out here.', 'Hielo. Lo mejor que el dinero puede comprar aquí fuera.'), 'water'));
    T(KIOSK.x - 3, KIOSK.z + 2.6, 2.2, () => tr('Kiosk: Dead Sea mud (25)', 'Quiosco: barro del Mar Muerto (25)'), () => buy(25, 'Kiosk', tr('The famous black mud, in a pot.', 'El famoso barro negro, en un bote.'), 'dead_sea_mud'));
    T(KIOSK.x + 3, KIOSK.z + 2.6, 2.2, () => tr('Kiosk: salt crystal (free with a smile)', 'Quiosco: cristal de sal (gratis con una sonrisa)'), () => { if (AV.bag) AV.bag.add('salt_crystal', 1, true); else S.items.salt_crystal = (S.items.salt_crystal || 0) + 1; AV.quests && AV.quests.check(); AV.toast(tr('“Take one, take a photo too.” The kiosk owner grins.', '“Llévate uno y hazte una foto también.” El dueño del quiosco sonríe.')) });
    /* hiker found (quest) */
    T(CAVES.x + 1, CAVES.z + 4, 3, () => (S.quests || {}).jd_hiker === 'active' && !S.jd.hikerFound ? tr('Check on the hiker', 'Ver al excursionista') : tr('The Qumran cave', 'La cueva de Qumrán'), () => { if ((S.quests || {}).jd_hiker === 'active' && !S.jd.hikerFound) { S.jd.hikerFound = true; AV.quests && AV.quests.check(); AV.toast(tr('Tomer: “I’m FINE. Mostly. My phone is dead and my dignity is slightly injured. Tell the sergeant?”', 'Tomer: “Estoy BIEN. Casi. El móvil murió y la dignidad está algo herida. ¿Se lo dices a la sargento?”')) } else AV.toast(tr('Clay jars, rock shelves, two thousand years of silence.', 'Vasijas de arcilla, estantes de roca y dos mil años de silencio.')) });
    /* Zahra found (quest) */
    let zahraSpot = { x: MASADA.x - MASADA.r - 20, z: MASADA.z - 6 };
    { const y = 0; const zahra = new THREE.Group(); zahra.position.set(zahraSpot.x, H(zahraSpot.x, zahraSpot.z), zahraSpot.z); grp.add(zahra);
      const body = [[BG.sph, 0xb08a5a, M(0, 1.5, 0, .9, .7, 1.7)], [BG.sph, 0xb08a5a, M(0, 2.15, .3, .55, .45, .7)], [BG.sph, 0xb08a5a, M(0, 2.15, -.35, .5, .4, .65)], [BG.cyl, 0xa87f50, M(0, 1.9, 1.6, .3, 1, .3, 1, 0, 0)], [BG.sph, 0xa87f50, M(0, 2.5, 2.05, .35, .38, .5)], [BG.sph, 0x2a1a10, M(0, 2.62, 2.32, .09, .07, .09)]];
      for (const [lx, lz] of [[-.55, 1.05], [.55, 1.05], [-.55, -.95], [.55, -.95]]) body.push([BG.cyl, 0xa87f50, M(lx, .75, lz, .14, 1.5, .14)]);
      const bm = new THREE.Mesh(K.merge(body), K.floraMat(0, { rough: .9 })); bm.castShadow = q === 2; zahra.add(bm);
      const s1 = new THREE.Mesh(K.merge([[BG.box, 0xc83a2a, M(0, 0, 0, .9, .18, 1.3)], [BG.sph, 0xffd23a, M(0, .45, -.55, .1, .18, .1), .6]]), K.floraMat(0, { rough: .7 })); s1.position.set(0, 2.15, 0); zahra.add(s1);
      ctx.upd.push((dt, t) => { zahra.visible = (S.quests || {}).jd_camel === 'active' && !S.jd.camelHome; if (zahra.visible) { zahra.position.y = H(zahra.position.x, zahra.position.z) + Math.sin(t * 1.4) * .04; zahra.rotation.y = Math.PI + Math.sin(t * .2) * .3 } else if (!zahra._gone) { zahra._gone = true } });
      T(zahraSpot.x, zahraSpot.z, 4, () => tr('Lead Zahra home (speak softly)', 'Llevar a Zahra a casa (hablar bajito)'), () => { if ((S.quests || {}).jd_camel !== 'active' || S.jd.camelHome) return AV.toast(tr('No camel here. Salem said look near the foot of Masada…', 'Aquí no hay camella. Salem dijo que buscara al pie de Masada…')); S.jd.camelHome = true; AV.quests && AV.quests.check(); AV.toast(tr('You speak softly. Zahra considers. Zahra follows. Camels respect manners.', 'Hablas bajito. Zahra lo piensa. Zahra te sigue. Los camellos respetan las buenas maneras.')) }) }
    /* portal */
    T(PORTAL.x, PORTAL.z - 1.6, 2.4, () => tr('Apeverse Portal: travel to another world', 'Portal Apeverse: viajar a otro mundo'), () => { const ws = Object.keys(AV.worldDefs).filter(id => id !== 'judean_desert');
      const p = AV.panel('cmp', '<b>' + tr('Apeverse Portal', 'Portal Apeverse') + '</b><div class="grid">' + ws.map(id => '<button data-w="' + id + '">' + ((AV.worldMeta(id) || {}).name || id) + '</button>').join('') + '</div><button data-close>' + tr('Close', 'Cerrar') + '</button>');
      p.querySelectorAll('[data-w]').forEach(b => b.onclick = () => { AV.closePanel('cmp'); AV.audio && AV.audio.whoosh(); AV.travel(b.dataset.w, 'judean_desert') }) });

    /* --- crowd + hotspots --- */
    const nodes = [], edges = [];
    const chain = pts => { let prev = null; const ids = pts.map(([x, z]) => { nodes.push([x, z]); const id = nodes.length - 1; if (prev != null) edges.push([prev, id]); prev = id; return id }); return { first: ids[0], last: ids[ids.length - 1], ids } };
    { const R90 = chain([[XMIN + 16, 2], [30, -2], [80, 4], [140, 8], [XMAX - 24, 10]]);                                          // Route 90 roadside
      const BCH = chain([[30, 6], [60, 12], [KIOSK.x - 8, KIOSK.z + 6], [PORTAL.x - 4, PORTAL.z + 4]]);                              // to the beach + portal
      const MAS = chain([[80, 4], [MASADA.x + MASADA.r + 12, MASADA.z + 2]]);                                                       // to the cable car
      const CMP = chain([[30, -2], [-6, 14], [CAMP.x + 8, CAMP.z + 6], [CAMP.x - 2, CAMP.z + 4]]);                                   // to the Bedouin camp
      const PST = chain([[-6, 14], [POST.x + 6, POST.z + 2], [POST.x - 4, POST.z]]);                                                // to the outpost
      const OAS = chain([[XMIN + 16, 2], [-30, -8], [OASIS.x + 12, OASIS.z + 14], [OASIS.x, OASIS.z + 12]]);                        // to Ein Gedi
      const CAV = chain([[60, 12], [40, -30], [10, -70], [-20, -100], [CAVES.x + 6, CAVES.z + 12]]);                               // to Qumran
      edges.push([R90.ids[1], BCH.first], [R90.ids[2], MAS.first], [R90.ids[1], CMP.first], [CMP.ids[1], PST.first], [R90.first, OAS.first], [BCH.ids[1], CAV.first]);
    }
    const NAV = CY.nav(nodes, edges);
    const crowd = CY.crowd(ctx), nPed = [14, 26, 40][q];
    const VLIST = ['tourist', 'suit', 'soldier', 'keff', 'robe', 'hijab', 'monk', 'woman', 'man', 'nun'];
    for (let i = 0; i < nPed; i++) { const v = VLIST[i % VLIST.length], n0 = nodes[rng() * nodes.length | 0];
      const cols = (C.regional && C.regional.walkCols) ? C.regional.walkCols(v, rng) : null;
      crowd.add({ v, x: n0[0], z: n0[1], nav: NAV, idleProb: .3, cols: cols || undefined }) }
    /* soldiers at the outpost */
    for (const [x, z] of [[POST.x + 4, POST.z + 6], [POST.x - 2, POST.z + 7]]) crowd.add({ v: 'soldier', x, z, cols: { skin: 0xd8a47a, hair: 0x14100c, shirt: 0xb8a27a, pants: 0xa8946c }, yaw: Math.PI, mode: 'idle' });
    crowd.build();
    /* rigged characters */
    const roles = ['pilgrim', 'business', 'soldier', 'bedouin', 'hijabi', 'student', 'vendor', 'elder', 'embroidered'];
    const spots = [[KIOSK.x - 6, KIOSK.z + 6, 10], [PORTAL.x - 6, PORTAL.z + 6, 8], [SHORE + 14, 30, 12], [SHORE + 10, -10, 10], [CAMP.x + 10, CAMP.z + 4, 8], [MASADA.x + MASADA.r + 14, MASADA.z - 6, 10], [MASADA.x + 6, MASADA.z + MASADA.r - 16, 8], [POST.x + 8, POST.z + 8, 8], [OASIS.x + 14, OASIS.z + 16, 10]];
    AV.beings.spawn(ctx, spots.slice(0, AV.beings.n(ctx, 2, 3, 5)).map(([x, z, r], i) => { const role = roles[i % roles.length], a = C.regional.actor(role, 700 + i * 13);
      return { kind: 'human', x, z, area: { x, z, r }, seed: 700 + i, look: a.look, dress: a.dress, role,
        lines: [tr('They say you can read a newspaper while floating. It’s true. My hands got all wrinkly.', 'Dicen que puedes leer un periódico flotando. Es verdad. Se me arrugaron las manos.'), tr('Masada sunrise is worth the 4 a.m. alarm. Once. Maybe twice.', 'El amanecer en Masada merece el despertador de las 4. Una vez. Quizá dos.'), tr('The Ibex own Ein Gedi. We just visit.', 'Los íbices son los dueños de Ein Gedi. Nosotros solo visitamos.'), tr('Drink more water than you think you need. Then one more.', 'Bebes más agua de la que crees necesitar. Y una más.')][i % 4],
        greet: [tr('Hey! Lovely day to float.', '¡Hola! Qué día tan bueno para flotar.'), tr('Shalom! Watch the sun out here.', '¡Shalom! Cuidado con el sol aquí fuera.'), tr('Mind the salt — it crunches everywhere.', 'Ojo con la sal: cruje por todas partes.')][i % 3] } }));
    /* traffic on Route 90 */
    const CARC = [0xf2f2f0, 0xb8bcc0, 0x5a5e62, 0x15171a, 0x1f3e72, 0x9a1a1a];
    CY.traffic(ctx, [{ pts: ROAD.map(p => [p.x, p.z]), off: -2.2, w: 10 }], [{ type: 'car', cols: CARC, n: [2, 3, 5][q], speed: 9 }, { type: 'jeep', cols: [0xb8a27a, 0x8a8a5a, 0xa8946c], n: [1, 2, 3][q], speed: 7.5 }, { type: 'bus', cols: [0x2a8a4a], n: [1, 1, 2][q], speed: 6 }], { density: () => 1 });
    /* parked cars by the kiosk */
    { const list = []; for (let k = 0; k < 4; k++) { if (rng() < .3) continue; const x = KIOSK.x - 8 - k * 7; list.push({ type: rng() < .6 ? 'car' : 'jeep', x, z: KIOSK.z + 10, yaw: Math.PI / 2, col: CARC[rng() * CARC.length | 0] }); ctx.cols.push([x - 1.2, x + 1.2, KIOSK.z + 8.6, KIOSK.z + 11.4]) } CY.parked(ctx, list) }
    CY.birds(ctx, [{ x: OASIS.x, z: OASIS.z, r: 18, y: 20, n: 8 }, { x: SHORE + 30, z: 0, r: 40, y: 16, n: 10 }, { x: MASADA.x, z: MASADA.z, r: 40, y: 44, n: 6 }]);

    /* ---------- quests ---------- */
    const Q = AV.quests;
    const def = (id, giver, turnIn, title, hint, ready, reward) => Q.define(id, { giver, turnIn, title, hint, ready, reward });
    def('jd_water', 'noa', 'noa', ['Water Run', 'Operación agua'], ['Buy 3 bottles of water and bring them to Sgt. Noa at the desert patrol outpost.', 'Compra 3 botellas de agua y llévaselas a la sargento Noa en el puesto de la patrulla del desierto.'],
      S2 => ((S2.items.water || 0) >= 3), S2 => { S2.items.water -= 3; AV.txn(45, 'Mission: water run'); return tr('Noa: “Hydration is discipline. The squad salutes you.” +45 credits.', 'Noa: “La hidratación es disciplina. La escuadra te saluda.” +45 créditos.') });
    def('jd_hiker', 'noa', 'noa', ['The Lost Hiker', 'El excursionista perdido'], ['Hiker Tomer went to the Qumran caves and stopped answering. Go check the cave in the north-west cliffs, then report back to Noa.', 'El excursionista Tomer fue a las cuevas de Qumrán y dejó de contestar. Ve a la cueva de los acantilados del noroeste y vuelve a informar a Noa.'],
      S2 => !!S2.jd.hikerFound, () => { AV.txn(40, 'Mission: lost hiker'); return tr('Noa: “Good work. He owes you a very long email.” +40 credits.', 'Noa: “Buen trabajo. Te debe un correo muy largo.” +40 créditos.') });
    def('jd_camel', 'salem', 'salem', ['Zahra’s Walkabout', 'El paseo de Zahra'], ['Find Salem’s camel Zahra near the foot of Masada (south) and bring her home to the camp.', 'Encuentra a Zahra, la camella de Salem, al pie de Masada (al sur) y tráela al campamento.'],
      S2 => !!S2.jd.camelHome, () => { AV.txn(30, 'Mission: Zahra'); return tr('Salem: “She likes you. That is rare and slightly alarming.” +30 credits.', 'Salem: “Le gustas. Eso es raro y ligeramente alarmante.” +30 créditos.') });
    ctx.upd.push(() => { if (AV.chat.open && !S.jd.met[AV.chat.who]) { S.jd.met[AV.chat.who] = 1; AV.quests && AV.quests.check() } });
    /* crew barks */
    { const BARKS = [['noa', [tr('Water check!', '¡Comprobación de agua!'), tr('Hat on. Always.', 'La gorra puesta. Siempre.')]], ['salem', [tr('Tea is ready!', '¡El té está listo!'), tr('Welcome, traveller!', '¡Bienvenido, viajero!')]], ['amir', [tr('Sunrise tour at 5!', '¡Tour del amanecer a las 5!')]], ['tomer', [tr('Hello? Anybody?', '¿Hola? ¿Alguien?')]]];
      ctx.upd.push((() => { let acc = 0; return (dt, t) => { acc += dt; if (acc < 20) return; acc = 0; if (AV.blocking()) return; const [id, arr] = BARKS[Math.random() * BARKS.length | 0], n = crew[id]; if (!n) return; const d = Math.hypot(AV.P.x - n.g.position.x, AV.P.z - n.g.position.z); if (d < 14) AV.npc.bark(n, arr[Math.random() * arr.length | 0]) } })()) }
    /* jackals at night */
    ctx.upd.push((() => { let last = 0; return (dt, t) => { if (!night() || AV.now() - last < 26 + Math.random() * 30) return; last = AV.now(); if (Math.hypot(AV.P.x - 0, AV.P.z - 0) > 0) { AV.audio && AV.audio.blip(420, .9, 'sawtooth', .035); setTimeout(() => AV.audio && AV.audio.blip(380, 1.2, 'sawtooth', .03), 800); AV.toast(tr('A jackal sings somewhere in the dark.', 'Un chacal canta en algún lugar de la oscuridad.')) } } })());

    /* ---------- time of day HUD ---------- */
    const hudEl = AV.$('cmhud'); let hudT = 0;
    ctx.upd.push(() => { if (!hudEl || AV.now() < hudT) return; hudT = AV.now() + .5; const m2 = mode();
      hudEl.style.display = 'block'; hudEl.textContent = tr('Judean Desert · ', 'Desierto de Judea · ') + (m2 === 'sunset' ? tr('sunset', 'atardecer') : m2 === 'night' ? tr('night', 'noche') : tr('day', 'día')) + tr(' · F: time of day', ' · F: hora del día') });
    ctx.leave.push(() => { if (hudEl) hudEl.style.display = 'none' });
    AV.keymap.KeyF = () => { if (AV.W && AV.W.id === 'judean_desert') { const order = ['day', 'sunset', 'night'], S2 = AV.S; S2.jdMode = order[(order.indexOf(S2.jdMode || 'day') + 1) % 3]; AV.jd.lastPos = { x: AV.P.x, z: AV.P.z, yaw: AV.P.yaw }; AV.enterWorld('judean_desert', 'here');
      setTimeout(() => AV.toast(AV.tr('Time of day: ', 'Hora del día: ') + (S2.jdMode === 'day' ? AV.tr('day', 'día') : S2.jdMode === 'sunset' ? AV.tr('sunset — the cliffs glow red', 'atardecer: los acantilados se encienden') : AV.tr('night — stars and jackals', 'noche: estrellas y chacales')) + AV.tr(' (F: next)', ' (F: siguiente)')), 600) } };
    { const fb = AV.$('tF'); if (fb) { fb.style.display = AV.device === 'phone' ? 'block' : 'none'; ctx.leave.push(() => fb.style.display = 'none') } }
    const nightMeshes = B.night.flush(ctx, { noShadow: true }); delete B.night;

    /* ---------- flush ---------- */
    for (const k in B) B[k].flush(ctx);
    const here = AV.jd && AV.jd.lastPos || null; if (AV.jd) AV.jd.lastPos = null;
    return {
      name: 'Judean Desert · Dead Sea', fog: [90, 440], sky: SKY, glowScale: md === 'night' ? 1.4 : 1,
      surface: (x, z) => { if (x < XMIN + 3 || x > XMAX - 3 || z < ZMIN + 3 || z > ZMAX - 3) return null; if (inSea(x, z)) return -.62; const p = walk.at(x, z); return p === undefined ? H(x, z) : Math.max(p, H(x, z)) },
      arrivals: { default: { x: BUS.x + 4, z: BUS.z + 4, yaw: 0 }, pipe: { x: BUS.x + 4, z: BUS.z + 8, yaw: 0 }, judean_desert: { x: PORTAL.x - 1, z: PORTAL.z + 3, yaw: Math.PI }, ape_gate: { x: BUS.x + 4, z: BUS.z + 4, yaw: 0 }, here: here || { x: BUS.x + 4, z: BUS.z + 4, yaw: 0 } }, defaultArrival: 'default',
      places: [{ id: 'oasis', name: ['Ein Gedi oasis', 'Oasis de Ein Gedi'], x: OASIS.x + 6, z: OASIS.z + 12, yaw: Math.PI }, { id: 'masada', name: ['Masada', 'Masada'], x: MASADA.x + MASADA.r + 10, z: MASADA.z + 4, yaw: -Math.PI / 2 },
        { id: 'caves', name: ['Qumran caves', 'Cuevas de Qumrán'], x: CAVES.x + 4, z: CAVES.z + 10, yaw: Math.PI }, { id: 'camp', name: ['Bedouin camp', 'Campamento beduino'], x: CAMP.x + 2, z: CAMP.z + 8, yaw: Math.PI },
        { id: 'post', name: ['Patrol outpost', 'Puesto de patrulla'], x: POST.x + 2, z: POST.z + 6, yaw: Math.PI }, { id: 'beach', name: ['Dead Sea beach', 'Playa del Mar Muerto'], x: KIOSK.x - 4, z: KIOSK.z + 4, yaw: Math.PI }],
      chatLines: [tr('The sea is so salty that drowning is basically impossible. Flailing, however, is very possible.', 'El mar es tan salado que ahogarse es básicamente imposible. Agorazarse, en cambio, es muy posible.'), tr('Masada at sunrise. Bring a torch and a thermos.', 'Masada al amanecer. Linterna y termo.'), tr('Drink before you’re thirsty. Sergeant’s orders.', 'Bebe antes de tener sed. Órdenes de la sargento.'), tr('The ibex at Ein Gedi will steal your lunch. They have practice.', 'Los íbices de Ein Gedi te robarán el almuerzo. Tienen práctica.')],
      musicProfile: { bpm: 76, root: 41, scale: [0, 1, 4, 5, 7, 8, 11], style: 'maqam', sparse: true },
      music: { playlist: 'chiang_mai', pos: { x: CAMP.x, y: 2.5, z: CAMP.z }, bed: .35 }
    };
  }
});
AV.jd = AV.jd || {};
})(window.AV);
