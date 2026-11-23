/* APEVERSE - world_jerusalem.js : JERUSALEM — City of Gold (built from the real city's layout, game-sized).
   North = -z. ~500 × 360 m. The Old City inside its Ottoman walls (8 gates, 4 quarters: Christian, Muslim, Jewish,
   Armenian), the Temple Mount esplanade with the Dome of the Rock + Al-Aqsa under construction hoardings, the Western
   Wall plaza below it, the Church of the Holy Sepulchre, the Tower of David citadel by Jaffa Gate, the Cardo,
   the covered souk alleys (spice shop, ka'ak carts outside Damascus Gate), Mamilla Avenue of shops to the west,
   Jaffa Road + the light rail east to City Hall and Mahane Yehuda Market (rugelach bakery, spice stalls, night bars),
   Mount Zion + the dormition dome south, the Mount of Olives + its church domes east across the Kidron valley,
   the police/patrol post and the portal back to Ape Town by Jaffa Gate.
   People: Dalia (guide), Yossi (founder), Karim (spice merchant), Miriam (baker), Elias (ceramicist) + businessmen,
   soldiers, orthodox walkers, vendors, students, pilgrims, monks, nuns. Vehicles: the Jerusalem light rail on its
   grass track, cars, buses. Interactions: tour mission, briefcase mission, ka'ak mission, tram, shops, stones of the
   Western Wall, Market bars at night, the Portal. Press E on glowing spots for the guided tour checkpoints. */
'use strict';
(function (AV) {
const tr = AV.tr, TAU = AV.TAU, K = AV.kit, A = AV.arch, CY = AV.city, MD = AV.media, C = AV.chars;
const M = K.M, BG = K.BG, deg = d => d * Math.PI / 180, npcYaw = (fx, fz, tx, tz) => Math.atan2(tx - fx, tz - fz);
const hourNow = () => (AV.S.time / 60) % 24, night = () => { const h = hourNow(); return h < 6 || h >= 18.5 };

/* ======================= layout (game-sized map of the real city, north = -z) ======================= */
/* The Old City is a rough quadrilateral ~1 km wide; here it is 200 m. The Jaffa Gate is on the west side,
   Damascus Gate north, Lions' Gate east, Dung/Zion south. The Mount of Olives is east across the Kidron. */
const OC = { x0: -70, x1: 70, z0: -95, z1: 65 };                       // Old City walls (x 140, z 160)
const WALL = 2.6, WALLH = 9;                                            // wall thickness / height
const JAFFA = [-OC.x1, 8], DAMASCUS = [-14, -OC.z0], HEROD = [42, -OC.z0], LIONS = [OC.x1, -14], DUNG = [-16, OC.z1], ZION = [-52, OC.z1], NEWG = [-OC.x1, -30], GOLDEN = [OC.x1, -46];
const TM = { x0: 12, x1: 66, z0: -88, z1: -46 };                        // Temple Mount esplanade (NE corner of the Old City)
const WW = { x: 30, z0: -46, z1: -24 };                                 // Western Wall plaza (just south of the Mount)
const HS = { x: -22, z: -26 };                                          // Holy Sepulchre (Christian quarter)
const TD = { x: -58, z: 14 };                                           // Tower of David (by Jaffa Gate)
const CARD0 = [-30, -2], CARD1 = [-58, -2];                             // the Cardo (Roman main street, Jewish quarter)
const SOUK = [{ a: [-14, -OC.z0 + 4], b: [-14, -30] }, { a: [-14, -30], b: [8, -26] }, { a: [8, -26], b: [8, -46] }, { a: [8, -46], b: [30, -46] }];   // covered alleys -> Temple Mount
const MAM = { x0: -OC.x1 - 46, x1: -OC.x1 - 8, z0: -4, z1: 12 };        // Mamilla avenue (west of Jaffa Gate)
const JR = { z: -1, x0: MAM.x0 - 120, x1: MAM.x0 };                     // Jaffa Road (east-west, west of Mamilla)
const SHUK = { x0: JR.x0 + 6, x1: JR.x0 + 58, z0: -30, z1: -12 };       // Mahane Yehuda market
const CITYHALL = { x: JR.x0 + 6, z: 26 };                               // City Hall square
const ZIONM = { x: -46, z: 110 };                                       // Mount Zion (dormition abbey dome)
const OLIV = { x: 130, z: -20 };                                        // Mount of Olives (east, across the Kidron)
const KIDRON = { x: 86, w: 14 };                                        // Kidron valley
const POST = { x: -30, z: 40 };                                         // patrol post (south-west inside walls, game fiction)
const PORTAL = [-OC.x1 - 8, 26];                                        // Apeverse portal west of Jaffa Gate
const TRAM = [{ x: JR.x0, z: JR.z - 2.2 }, { x: MAM.x0, z: JR.z - 2.2 }, { x: MAM.x1 + 8, z: -6 }];   // light rail path
const XMIN = JR.x0 - 20, XMAX = OLIV.x + 60, ZMIN = OC.z0 - 30, ZMAX = Math.max(ZIONM.z, 130) + 20;
const GW = XMAX - XMIN, GD = ZMAX - ZMIN;
const inRect = (r, x, z, m) => x > r.x0 - (m || 0) && x < r.x1 + (m || 0) && z > r.z0 - (m || 0) && z < r.z1 + (m || 0);
/* roads (for the painted ground + traffic loops) */
const ROADS = [];
ROADS.push([JR.x0, JR.z, MAM.x0, JR.z, 10], [MAM.x0, JR.z, JAFFA[0], JR.z, 8]);   // Jaffa Road -> Mamilla -> Jaffa Gate
ROADS.push([JAFFA[0], 8, -30, 8, 6], [-30, 8, -30, -8, 6]);                        // into the citadel square
ROADS.push([DAMASCUS[0], DAMASCUS[1], DAMASCUS[0], -30, 6], [DAMASCUS[0], -30, 8, -26, 6], [8, -26, 8, -46, 5], [8, -46, WW.x, -46, 5]);   // Nablus Rd + souk chain
ROADS.push([WW.x, -46, WW.x, WW.z1, 6]);                                           // down to the Western Wall plaza
ROADS.push([LIONS[0], LIONS[1], TM.x1 - 4, TM.z1, 5], [TM.x1 - 4, TM.z1, TM.x1 - 4, -60, 5]);   // Lions' Gate up to the Mount
ROADS.push([DUNG[0], DUNG[1], -16, 30, 5], [-16, 30, POST.x + 6, POST.z, 5]);      // Dung gate area
ROADS.push([JAFFA[0], 30, ZION[0], ZION[1] - 6, 6]);                               // road south to Zion
ROADS.push([MAM.x0, JR.z + 2, MAM.x0, 40, 7], [MAM.x0, 40, MAM.x0 - 60, 60, 7]);   // King George / south-west loop
ROADS.push([JR.x0 + 30, JR.z, JR.x0 + 30, -OC.z0 - 6, 6]);                         // north loop
function segD(x, z, r) { const dx = r[2] - r[0], dz = r[3] - r[1], L = dx * dx + dz * dz, t = Math.max(0, Math.min(1, ((x - r[0]) * dx + (z - r[1]) * dz) / L)); return Math.hypot(x - r[0] - dx * t, z - r[1] - dz * t) - r[4] / 2 }
const roadDist = (x, z) => { let d = 1e9; for (const r of ROADS) d = Math.min(d, segD(x, z, r)); return d };
const inOC = (x, z) => x > OC.x0 + 1 && x < OC.x1 - 1 && z > OC.z0 + 1 && z < OC.z1 - 1;
const inTM = (x, z) => inRect(TM, x, z, 0);
const inKidron = (x, z) => Math.abs(x - KIDRON.x) < KIDRON.w && z < 60;

/* ======================= painted ground ======================= */
const TX = {};
function canvasTex(w, h, draw, rep) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; t.wrapS = t.wrapT = rep ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping; t.userData = { keep: true }; return t }
function stoneTex(vary) { return canvasTex(256, 256, (c, w, h) => { const r = AV.rng(vary || 21); c.fillStyle = '#e8dfc8'; c.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 32) for (let x = -(y / 32 % 2) * 24; x < w; x += 48) { const v = r() * 26 | 0; c.fillStyle = 'rgb(' + (225 + v) + ',' + (214 + v) + ',' + (188 + v * .8 | 0) + ')'; c.fillRect(x + 1.5, y + 1.5, 45, 29) }
  for (let i = 0; i < 500; i++) { c.fillStyle = 'rgba(120,100,70,' + (r() * .12).toFixed(2) + ')'; c.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 3) } for (let i = 0; i < 14; i++) { c.fillStyle = 'rgba(150,120,70,' + (.08 + r() * .12).toFixed(2) + ')'; c.beginPath(); c.arc(r() * w, r() * h, 8 + r() * 30, 0, TAU); c.fill() } }, true) }
function groundTex(N) {
  return TX.ground || (TX.ground = canvasTex(N, Math.round(N * GD / GW), (c, w, h) => {
    const m = w / GW, P = (x, z) => [(x - XMIN) * m, (z - ZMIN) * m], r = AV.rng(31);
    const fillC = (x, z, col) => { const a = P(x, z); c.fillStyle = col; c.fillRect(a[0], a[1], 2 * m, 2 * m) };
    c.fillStyle = '#c9b992'; c.fillRect(0, 0, w, h);                                     // Jerusalem hillside base
    for (let i = 0; i < 1200; i++) { const x = r() * w, y = r() * h, s = 2 + r() * 9; c.fillStyle = ['#bfae86', '#d2c49e', '#c3b28c', '#cdbd94'][i % 4]; c.globalAlpha = .3; c.beginPath(); c.arc(x, y, s, 0, TAU); c.fill() } c.globalAlpha = 1;
    const rect = (r0, col) => { const a = P(r0.x0 != null ? r0.x0 : r0[0], r0.z0 != null ? r0.z0 : r0[1]); c.fillStyle = col; c.fillRect(a[0], a[1], ((r0.x1 != null ? r0.x1 : r0[2]) - (r0.x0 != null ? r0.x0 : r0[0])) * m, ((r0.z1 != null ? r0.z1 : r0[3]) - (r0.z0 != null ? r0.z0 : r0[1])) * m) };
    rect({ x0: OC.x0, x1: OC.x1, z0: OC.z0, z1: OC.z1 }, '#cbb994');                      // Old City paving
    rect(TM, '#d8cdb0'); rect({ x0: TM.x0, x1: TM.x1, z0: TM.z1, z1: WW.z1 }, '#d4c9ac');  // esplanade + approach
    rect({ x0: WW.x - 8, x1: WW.x + 8, z0: WW.z0 - 4, z1: WW.z1 }, '#c9a97e');            // Western Wall plaza
    rect({ x0: HS.x - 16, x1: HS.x + 16, z0: HS.z - 14, z1: HS.z + 12 }, '#c7b58e');      // Holy Sepulchre forecourt
    rect({ x0: TD.x - 12, x1: TD.x + 10, z0: TD.z - 10, z1: TD.z + 12 }, '#c7b58e');      // citadel courtyard
    rect(MAM, '#dcd2b8'); rect(SHUK, '#b8a888');
    rect({ x0: MAM.x0 - 120, x1: MAM.x0, z0: JR.z - 8, z1: JR.z + 8 }, '#9a9a92');        // Jaffa Road asphalt
    for (const s of SOUK) rect({ x0: Math.min(s.a[0], s.b[0]) - 2, x1: Math.max(s.a[0], s.b[0]) + 2, z0: Math.min(s.a[1], s.b[1]) - 2, z1: Math.max(s.a[1], s.b[1]) + 2 }, '#b09a72');   // souk alleys
    rect({ x0: KIDRON.x - KIDRON.w, x1: KIDRON.x + KIDRON.w, z0: ZMIN, z1: 60 }, '#a89a6e');   // Kidron valley floor
    rect({ x0: OLIV.x - 40, x1: OLIV.x + 50, z0: OLIV.z - 60, z1: OLIV.z + 60 }, '#b4a67c');   // Mount of Olives slope
    /* green strips of the light rail (grass track) */
    c.fillStyle = '#5a7a3a'; { const a = P(TRAM[0].x, TRAM[0].z), b = P(TRAM[TRAM.length - 1].x, TRAM[TRAM.length - 1].z); c.fillRect(a[0], a[1] - 3 * m, b[0] - a[0], 6 * m) }
    /* roads */
    c.lineCap = 'butt'; const seg = (rd, w2, col) => { const p0 = P(rd[0], rd[1]), p1 = P(rd[2], rd[3]); c.strokeStyle = col; c.lineWidth = w2 * m; c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); c.stroke() };
    for (const rd of ROADS) seg(rd, rd[4] + 3.4, '#c3b58e'); for (const rd of ROADS) seg(rd, rd[4], rd[0] > MAM.x0 ? '#a8987a' : '#8a8a82');
    c.setLineDash([3 * m, 3 * m]); for (const rd of ROADS) if (rd[4] >= 7 && rd[0] < MAM.x0) seg(rd, .18, '#e8d890'); c.setLineDash([]);
    for (let i = 0; i < 9000; i++) { const x = XMIN + r() * GW, z = ZMIN + r() * GD, d = roadDist(x, z); if (d < 0) { c.fillStyle = r() < .5 ? 'rgba(0,0,0,.14)' : 'rgba(255,255,255,.08)'; const q = P(x, z); c.fillRect(q[0], q[1], 1.5, 1.5) } }
    /* olive groves on the Mount of Olives + Kidron tombs speckle */
    for (let i = 0; i < 240; i++) { const x = OLIV.x - 40 + r() * 90, z = OLIV.z - 55 + r() * 110; if (Math.hypot(x - OLIV.x, z - OLIV.z) > 52) continue; fillC(x, z, ['#5a6a3a', '#6a7a44', '#4a5a32'][i % 3]) }
  }));
}

/* ======================= the world ======================= */
AV.registerWorld({
  id: 'jerusalem',
  build(ctx) {
    const S = AV.S, q = ctx.q, rng = ctx.rng, grp = ctx.group, MT = A.mats(), walk = A.walk();
    if (!S.jlm) S.jlm = { met: {}, tour: [], bought: {} }; S.items = S.items || {};
    const SKY = { tint: [0xffd8a0, 0xffe8c0, .12, .2], dome: { s1: 0xffc878, s2: 0xff9a4a, swirl: .08, cloud: .5, glow: .55 } };
    const B = { city: K.batch(), stone: K.batch(), dome: K.batch(), decor: K.batch(), night: K.batch(), shuk: K.batch() };
    const jer = K.floraMat(0, { map: stoneTex(21), rough: .92 }), gold = MT.shiny;
    const goldMat = K.floraMat(0, { rough: .18, metal: .75 });
    const occ = [];
    const box = (b, mat, col, x0, x1, y0, y1, z0, z1, glow) => b.add(mat, BG.box, col, M((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, x1 - x0, y1 - y0, z1 - z0), glow);
    const solid = (x0, x1, z0, z1) => { ctx.cols.push([x0, x1, z0, z1]); occ.push({ x0, x1, z0, z1 }) };
    const sign = (txt, x, y, z, ry, w, col, posts) => ctx.sign(txt, x, y, z, ry, w, col, posts ? { posts: true } : undefined);
    MD.resetFrames();

    /* ---------- terrain ---------- */
    const H = (x, z) => {                                     // gentle hills: Old City on a ridge, Mount of Olives + Zion rise, Kidron dips
      const ridge = Math.max(0, 6 - Math.abs(z - (OC.z0 + OC.z1) / 2) * .06 - Math.abs(x - 0) * .012);
      const oliv = Math.max(0, 22 - Math.hypot(x - OLIV.x, z - OLIV.z) * .34);
      const zion = Math.max(0, 12 - Math.hypot(x - ZIONM.x, z - ZIONM.z) * .3);
      const kid = -3.2 * Math.max(0, 1 - Math.abs(x - KIDRON.x) / (KIDRON.w + 8)) * (z < 70 ? 1 : .3);
      const edge = Math.max(0, XMIN + 25 - x, x - (XMAX - 25), ZMIN + 20 - z, z - (ZMAX - 20));
      return ridge + oliv + zion + kid + Math.min(16, edge * .6) - (inTM(x, z) ? ridge : 0);
    };
    const sx = [150, 230, 300][q], sz = Math.round(sx * GD / GW), tg = new THREE.PlaneGeometry(GW, GD, sx, sz); tg.rotateX(-Math.PI / 2); tg.translate((XMIN + XMAX) / 2, 0, (ZMIN + ZMAX) / 2);
    const tp = tg.attributes.position; for (let i = 0; i < tp.count; i++) tp.setY(i, H(tp.getX(i), tp.getZ(i))); tg.computeVertexNormals();
    const gmat = new THREE.MeshStandardMaterial({ map: groundTex([1024, 2048, 2048][q]), roughness: .95 }), grain = A.tex('grain');
    gmat.onBeforeCompile = sh => { sh.uniforms.detailMap = { value: grain }; sh.fragmentShader = 'uniform sampler2D detailMap;\n' + sh.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n diffuseColor.rgb *= mix(1.0, texture2D(detailMap, vUv * 150.0).r * 1.4, .3);') };
    gmat.customProgramCacheKey = () => 'jlmGround'; gmat.userData.lin = 1; const ground = new THREE.Mesh(tg, gmat); ground.receiveShadow = true; grp.add(ground);
    { const sk = new THREE.RingGeometry(Math.max(GW, GD) / 2, 900, 64, 2); sk.rotateX(-Math.PI / 2); sk.translate((XMIN + XMAX) / 2, -2.4, (ZMIN + ZMAX) / 2); grp.add(new THREE.Mesh(sk, AV.std(0xb8a878, 1))) }
    /* Jordan hills + Moab mountains on the far horizon (east), hazy */
    { const parts = [], r = AV.rng(41); for (let i = 0; i < 26; i++) { const a = deg(-70 + i * 7 + r() * 4), d = 780 + r() * 180, h = 110 + r() * 170; parts.push([BG.ico, [0x9ab0c0, 0x8aa4b8, 0xa4b8c8][i % 3], M((XMIN + XMAX) / 2 + Math.cos(a) * d, h * .34 - 24, (ZMIN + ZMAX) / 2 + Math.sin(a) * d, 150 + r() * 90, h, 120 + r() * 70), 0]) }
      const mm = new THREE.Mesh(K.merge(parts), new THREE.MeshBasicMaterial({ vertexColors: true, fog: false })); mm.material.userData.lin = 1; grp.add(mm);
      ctx.upd.push(() => mm.material.color.setScalar(1 - (AV.nightK || 0) * .7)) }

    /* ---------- helpers ---------- */
    const stoneH = (x, z) => { const h = H(x, z), p = walk.at(x, z); return p === undefined ? h : Math.max(p, h) };
    const domeOn = (b, x, z, r0, col, y, gold2) => { const yy = y != null ? y : stoneH(x, z); b.add(MT.v, A.geo('dome'), col, M(x, yy, z, r0, r0 * 1.05, r0), gold2 ? .3 : .1); b.add(goldMat, A.geo('cyl'), 0xe8c040, M(x, yy + r0 * 1.1, z, r0 * .1, r0 * .28, r0 * .1)) };
    const minaret = (b, x, z, h) => { const yy = stoneH(x, z); b.add(jer, new THREE.CylinderGeometry(1.5, 1.9, h, 10), 0xffffff, M(x, yy + h / 2, z)); b.add(jer, new THREE.CylinderGeometry(2.1, 2.1, 1.6, 10), 0xf2ecdc, M(x, yy + h - 1, z)); b.add(jer, new THREE.ConeGeometry(1.5, 3.4, 10), 0x2a5a3a, M(x, yy + h + 2.6, z)); b.add(goldMat, A.geo('sph'), 0xe8c040, M(x, yy + h + 4.4, z, .3, .3, .3), .5); solid(x - 2, x + 2, z - 2, z + 2) };
    const archRow = (b, x0, x1, z, y, n, col, r0) => { for (let i = 0; i < n; i++) { const x = x0 + (i + .5) * (x1 - x0) / n; b.add(MT.v, new THREE.TorusGeometry(r0 || 1.5, .22, 6, 12, Math.PI), col, M(x, y, z, 1, 1, 1, 0, 0, 0)) } };
    const house = (b, x, z, w, d, h, col, opt) => {   // Jerusalem stone house, flat roof or dome, arched windows
      opt = opt || {}; const yy = H(x, z); const domed = opt.dome;
      box(b, jer, col, x - w / 2, x + w / 2, yy, yy + h, z - d / 2, z + d / 2); solid(x - w / 2, x + w / 2, z - d / 2, z + d / 2);
      if (domed) domeOn(b, x, z, Math.min(w, d) * .52, opt.domeCol || 0x9ab8c8, yy + h);
      else box(b, jer, col, x - w / 2 - .3, x + w / 2 + .3, yy + h, yy + h + .4, z - d / 2 - .3, z + d / 2 + .3);
      /* arched windows + door (glow at night) */
      const nW = Math.max(1, Math.round(w / 3));
      for (let i = 0; i < nW; i++) for (const sd of [-1, 1]) { const wx = x + (i - (nW - 1) / 2) * (w - 1.6) / Math.max(1, nW - 1 || 1), wz = z + sd * (d / 2 + .03);
        box(b, MT.v, 0x3a2a1a, wx - .55, wx + .55, yy + h * .45, yy + h * .8, wz - .05, wz + .05); b.add(MT.v, A.geo('arc'), 0x3a2a1a, M(wx, yy + h * .8, wz, .55, .55, .55, 0, sd > 0 ? 0 : Math.PI, 0), .0);
        if (nightish()) B.night.add(MT.v, BG.box, 0xffd890, M(wx, yy + h * .62, wz + sd * .04, 1.05, 1.3, .12, 0, 0, 0), .8) }
      if (opt.door) { const dz = z + d / 2 + .04; box(b, MT.wood, 0x5a3a20, x - .9, x + .9, yy, yy + 2.6, dz - .05, dz + .05); b.add(MT.v, A.geo('arc'), 0x5a3a20, M(x, yy + 2.6, dz + .05, .9, .9, .9)) }
      return { y: yy, top: yy + h };
    };
    let nightish = () => false;   // set below before houses are built (windows glow only on High where the night batch flushes late)
    /* a row of Old-City houses along a line (face: 'n'|'s'|'e'|'w' side towards the street) */
    const houses = (b, x0, z0, x1, z1, face, r) => {
      const along = face === 'n' || face === 's', L = along ? Math.abs(x1 - x0) : Math.abs(z1 - z0); let a = 0;
      const sx1 = Math.sign(x1 - x0) || 1, sz1 = Math.sign(z1 - z0) || 1;
      while (a < L - 3) { const w = 5 + r() * 4, d = 6 + r() * 3, h = 4.5 + r() * 2.5;
        const domed = r() < .18, col = [0xe8dfc8, 0xefe6d0, 0xdfd2b4, 0xe6d8bc][r() * 4 | 0];
        /* centre of the house: along the line, offset inward (away from the street side) by d/2 */
        const inward = face === 'n' ? -1 : face === 's' ? 1 : face === 'e' ? 1 : -1;
        const cx = along ? x0 + sx1 * (a + w / 2) : x0 + inward * d / 2, cz = along ? z0 + inward * d / 2 : z0 + sz1 * (a + w / 2);
        house(b, cx, cz, along ? w : d, along ? d : w, h, col, { dome: domed, door: r() < .5 });
        a += w + .3 } };

    /* ---------- Old City wall + gates ---------- */
    const merlon = (b, x0, x1, y, z0, z1) => { const L = Math.max(x1 - x0, z1 - z0), n = Math.max(2, Math.floor(L / 3)); for (let i = 0; i < n; i += 2) { const t = i / n; if (x1 - x0 > z1 - z0) box(b, jer, 0xffffff, x0 + t * L, x0 + t * L + 1.2, y, y + 1.1, z0, z1); else box(b, jer, 0xffffff, x0, x1, y, y + 1.1, z0 + t * L, z0 + t * L + 1.2) } };
    const wallSeg = (x0, x1, z0, z1) => { box(B.stone, jer, 0xffffff, x0, x1, H((x0 + x1) / 2, (z0 + z1) / 2), H((x0 + x1) / 2, (z0 + z1) / 2) + WALLH, z0, z1); merlon(B.stone, x0, x1, H((x0 + x1) / 2, (z0 + z1) / 2) + WALLH, z0, z1); solid(x0, x1, z0, z1) };
    const GAP = 5.5;
    const GATES = [
      { p: JAFFA, name: 'JAFFA GATE', ry: Math.PI / 2, tower: true }, { p: DAMASCUS, name: 'DAMASCUS GATE', ry: 0, tower: true },
      { p: HEROD, name: 'HEROD’S GATE', ry: 0 }, { p: LIONS, name: 'LIONS’ GATE', ry: Math.PI / 2 },
      { p: DUNG, name: 'DUNG GATE', ry: Math.PI / 2 }, { p: ZION, name: 'ZION GATE', ry: Math.PI / 2 }, { p: NEWG, name: 'NEW GATE', ry: Math.PI / 2 }];
    /* wall segments with gaps at the gates */
    for (const side of ['n', 's', 'e', 'w']) {
      const gates = GATES.filter(g => side === 'n' ? g.p[1] === OC.z0 : side === 's' ? g.p[1] === OC.z1 : side === 'w' ? g.p[0] === OC.x0 : g.p[0] === OC.x1).map(g => g.p[side === 'n' || side === 's' ? 0 : 1]).sort((a, b) => a - b);
      let cur = side === 'n' || side === 's' ? OC.x0 : OC.z0;
      const spans = gates.length ? gates : []; const end = side === 'n' || side === 's' ? OC.x1 : OC.z1;
      const put = (a0, a1) => { if (a1 - a0 < .5) return; if (side === 'n') wallSeg(a0, a1, OC.z0, OC.z0 + WALL); else if (side === 's') wallSeg(a0, a1, OC.z1 - WALL, OC.z1); else if (side === 'w') wallSeg(OC.x0, OC.x0 + WALL, a0, a1); else wallSeg(OC.x1 - WALL, OC.x1, a0, a1) };
      if (!spans.length) put(cur, end); else for (const g of spans) { put(cur, g - GAP); cur = g + GAP } if (spans.length) put(cur, end);
    }
    /* gate towers + crenellated gatehouse + signs */
    GATES.forEach((g, i) => { const [gx, gz] = g.p, yy = H(gx, gz), tw = g.tower ? 12 : 9;
      box(B.stone, jer, 0xffffff, gx - (g.ry === 0 ? 3.4 : 2.2), gx + (g.ry === 0 ? 3.4 : 2.2), yy, yy + tw, gz - (g.ry === 0 ? 2.2 : 3.4), gz + (g.ry === 0 ? 2.2 : 3.4)); solid(gx - (g.ry === 0 ? 3.4 : 2.2), gx + (g.ry === 0 ? 3.4 : 2.2), gz - (g.ry === 0 ? 2.2 : 3.4), gz + (g.ry === 0 ? 2.2 : 3.4));
      box(B.stone, jer, 0xf2ecdc, gx - (g.ry === 0 ? 3.8 : 2.6), gx + (g.ry === 0 ? 3.8 : 2.6), yy + tw, yy + tw + 1, gz - (g.ry === 0 ? 2.6 : 3.8), gz + (g.ry === 0 ? 2.6 : 3.8));
      merlon(B.stone, gx - (g.ry === 0 ? 3.8 : 2.6), gx + (g.ry === 0 ? 3.8 : 2.6), yy + tw + 1, gz - (g.ry === 0 ? 2.6 : 3.8), gz + (g.ry === 0 ? 2.6 : 3.8));
      const ox = g.ry === 0 ? 0 : Math.sign(gx || 1) * 10, oz = g.ry === 0 ? Math.sign(gz) * 10 : 0;
      sign(g.name, gx + ox, yy + 6.5, gz + oz + (g.ry === 0 ? 0 : 0), g.ry === 0 ? 0 : gx < 0 ? Math.PI / 2 : -Math.PI / 2, 4.6, '#ffd84a', true);
    });
    /* ramparts walk (the wall-walk is a real thing; make the top walkable via pads along the wall) — simple: pads over each wall run */
    for (const [x0, x1, z0, z1] of [[OC.x0, OC.x1, OC.z0, OC.z0 + WALL], [OC.x0, OC.x1, OC.z1 - WALL, OC.z1], [OC.x0, OC.x0 + WALL, OC.z0, OC.z1], [OC.x1 - WALL, OC.x1, OC.z0, OC.z1]])
      for (let x = x0 + 4; x < x1 - 4; x += 8) for (let z = z0 + 4; z < z1 - 4; z += 8) walk.pad(x, z, 6, H(x, z) + WALLH - .2);

    /* ---------- Temple Mount: esplanade, Dome of the Rock, Al-Aqsa ---------- */
    { const yy0 = H((TM.x0 + TM.x1) / 2, TM.z1 + 2);
      /* retaining wall + esplanade platform */
      box(B.stone, jer, 0xf2ecdc, TM.x0 - 2, TM.x1 + 2, yy0 - 1, yy0 + 1.6, TM.z1 - 2, TM.z1 + 1); solid(TM.x0 - 2, TM.x1 + 2, TM.z1 - 2, TM.z1 + 1);
      walk.pad((TM.x0 + TM.x1) / 2, (TM.z0 + TM.z1) / 2, Math.max(TM.x1 - TM.x0, TM.z1 - TM.z0) / 2 + 2, yy0 + 1.8);   // the whole esplanade is one pad
      for (let x = TM.x0; x < TM.x1; x += 7) { box(B.stone, jer, 0xe8dfc8, x, x + 5, yy0 + 1.8, yy0 + 2.2, TM.z1 - 1.5, TM.z1 - .5) }   // stair band on the south edge
      /* Dome of the Rock (center of the esplanade) */
      const dx = (TM.x0 + TM.x1) / 2 - 8, dz = (TM.z0 + TM.z1) / 2 + 2, dy = yy0 + 1.8, R = 11;
      B.dome.add(jer, new THREE.CylinderGeometry(R + 2, R + 2.6, 2.2, 24), 0xe8dfc8, M(dx, dy + 1.1, dz)); solid(dx - R - 2, dx + R + 2, dz - R - 2, dz + R + 2);
      B.dome.add(jer, new THREE.CylinderGeometry(R, R, 6.5, 24), 0xf2ecdc, M(dx, dy + 5.5, dz));
      for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, wx = dx + Math.cos(a) * (R + .1), wz = dz + Math.sin(a) * (R + .1); box(B.dome, MT.v, 0x2a5a6a, wx - .4, wx + .4, dy + 2, dy + 8.4, wz - .4, wz + .4) }
      B.dome.add(jer, new THREE.CylinderGeometry(R * .72, R * .8, 2.4, 24), 0xf2ecdc, M(dx, dy + 9.6, dz));
      { const g = new THREE.Mesh(new THREE.SphereGeometry(R * .92, 24, 14, 0, TAU, 0, Math.PI / 2), goldMat); g.position.set(dx, dy + 10.6, dz); g.scale.y = .62; grp.add(g); }
      B.dome.add(goldMat, new THREE.CylinderGeometry(.5, .5, 4.6, 8), 0xe8c040, M(dx, dy + 18, dz), .4); B.dome.add(goldMat, new THREE.CylinderGeometry(1.5, .1, 1.6, 10), 0xe8c040, M(dx, dy + 20.6, dz), .5);
      /* octagon drum accents (turquoise tiles band) */
      B.dome.add(MT.v, new THREE.CylinderGeometry(R * 1.01, R * 1.01, 1.4, 24, 1, true), 0x2a7a8a, M(dx, dy + 3, dz), .1);
      /* Al-Aqsa (south end, under restoration hoardings) */
      const ax = TM.x0 + 16, az = TM.z1 - 12, ay = yy0 + 1.8;
      box(B.dome, jer, 0xe8dfc8, ax - 12, ax + 12, ay, ay + 7, az - 7, az + 7); solid(ax - 12, ax + 12, az - 7, az + 7);
      B.dome.add(jer, new THREE.CylinderGeometry(7, 7.4, 1.2, 20), 0xd8d0b4, M(ax, ay + 7.4, az));
      { const g = new THREE.Mesh(new THREE.SphereGeometry(6.6, 22, 12, 0, TAU, 0, Math.PI / 2), MT.v); g.material.color.setHex(0x4a5a68); g.position.set(ax, ay + 7.8, az); g.scale.y = .55; grp.add(g) }
      box(B.dome, MT.v, 0x8a8a7a, ax - 13, ax + 13, ay + 8.4, ay + 9.2, az - 8, az + 8, 0);   // hoarding platform
      for (let x = ax - 12; x < ax + 12; x += 2.6) box(B.dome, MT.wood, 0x8a6a4a, x, x + .2, ay + 7.4, ay + 9, az - 8.1, az - 7.9);   // scaffolding poles
      sign('AL-AQSA · restoration in progress', ax, ay + 10.6, az - 8.6, 0, 5, '#e8d890', true);
      /* free-standing arcades on the esplanade */
      for (const [x0, x1, z] of [[TM.x0 + 2, TM.x0 + 18, TM.z0 + 4], [TM.x1 - 16, TM.x1 - 2, TM.z0 + 4]]) { for (let x = x0; x <= x1; x += 3.2) B.dome.add(MT.v, A.geo('cyl'), 0xf2ecdc, M(x, yy0 + 4.2, z, .4, 4.6, .4)); B.dome.add(MT.v, BG.box, 0xe8dfc8, M((x0 + x1) / 2, yy0 + 6.8, z, x1 - x0 + 1, .5, 1.4)); }
      minaret(B.stone, TM.x0 + 3, TM.z1 - 3, 18); minaret(B.stone, TM.x1 - 3, TM.z1 - 3, 18); minaret(B.stone, TM.x0 + 3, TM.z0 + 3, 17); minaret(B.stone, TM.x1 - 3, TM.z0 + 3, 17);
      sign('TEMPLE MOUNT · الحرم الشريف · הר הבית', dx, dy + 23, dz, 0, 6.4, '#7ff0ff', true);
    }
    /* ---------- Western Wall plaza (below the Mount, south) ---------- */
    { const wy0 = H(WW.x, WW.z1 + 4);
      walk.pad(WW.x, (WW.z0 + WW.z1) / 2 + 2, 9, wy0);      // plaza pad (mechanical wall is solid, no walking into it)
      /* the wall itself: 7 courses of giant ashlar with the little notes (papers) tucked between */
      for (let z = WW.z0; z < WW.z1; z += 1.3) { for (let c = 0; c < 8; c++) { const y = wy0 + c * 1.05, inset = c % 2 ? .65 : 0; box(B.stone, jer, 0xd8ccb2, WW.x - 2.2 + inset, WW.x + 2.2 + inset, y, y + 1, z, z + 1.25) } }
      solid(WW.x - 2.6, WW.x + 2.6, WW.z0, WW.z1);
      /* notes in the cracks */
      const noteM = new THREE.MeshBasicMaterial({ color: 0xfff8e0 }); for (let i = 0; i < 40; i++) { const z = WW.z0 + 1 + rng() * (WW.z1 - WW.z0 - 2), y = wy0 + .4 + rng() * 6.4; const n = new THREE.Mesh(BG.box, noteM); n.scale.set(.16, .22, .02); n.position.set(WW.x - 2.35 + (rng() < .5 ? 0 : 4.55), y, z); n.rotation.y = Math.PI / 2; grp.add(n) }
      /* mehitza partitions + wooden benches + the big menorah by the Dung side */
      for (const z of [WW.z0 + 5, WW.z0 + 12]) { box(B.decor, MT.wood, 0xc8b088, WW.x - 5.4, WW.x - 4.9, wy0, wy0 + 1.8, z, z + 10) }
      for (let z = WW.z0 + 2; z < WW.z1 - 2; z += 3) box(B.decor, MT.wood, 0x8a6a4a, WW.x + 3.2, WW.x + 5.6, wy0 + .3, wy0 + .55, z, z + .4);
      B.decor.add(goldMat, new THREE.CylinderGeometry(.5, .6, 2.2, 8), 0xe8c040, M(WW.x - 8, wy0 + 1.1, WW.z1 - 1), .3);
      for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + k * .3; B.decor.add(goldMat, new THREE.CylinderGeometry(.045, .045, 1.7, 6), 0xe8c040, M(WW.x - 8 + Math.cos(a) * .55, wy0 + 2.6 + Math.abs(Math.sin(a)) * .5, WW.z1 - 1), .4) }
      solid(WW.x - 8.6, WW.x - 7.4, WW.z1 - 1.6, WW.z1 - .4);
      /* divider arches (Wilson's Arch suggestion) */
      archRow(B.stone, WW.x - 12, WW.x - 4, WW.z0 + 2, wy0 + 4.5, 3, 0xe8dfc8, 1.8);
      sign('THE WESTERN WALL · הכותל', WW.x - 10, wy0 + 8, WW.z0 - 1, Math.PI, 5.4, '#ffd84a', true);
    }

    /* ---------- Church of the Holy Sepulchre ---------- */
    { const hx = HS.x, hz = HS.z, hy = H(hx, hz);
      box(B.stone, jer, 0xd8ccb2, hx - 14, hx + 12, hy, hy + 10, hz - 12, hz + 10); solid(hx - 14, hx + 12, hz - 12, hz + 10);
      /* two domes: the bigger one over the rotunda, grey-blue */
      domeOn(B.dome, hx + 4, hz - 2, 6.4, 0x8a9ab0, hy + 10); domeOn(B.dome, hx - 8, hz - 2, 3.6, 0x8a9ab0, hy + 10);
      B.dome.add(goldMat, new THREE.CylinderGeometry(.35, .35, 3, 8), 0xe8c040, M(hx + 4, hy + 18, hz - 2), .4);
      /* facade with two blue doors + ladder (the immovable ladder!) */
      box(B.stone, jer, 0xcbbf9e, hx - 14, hx - 12.6, hy, hy + 8.5, hz - 8, hz + 6);
      box(B.dome, MT.v, 0x2a4a6a, hx - 12.5, hx - 12.3, hy + .2, hy + 3.2, hz - 3.4, hz - 1.4); box(B.dome, MT.v, 0x2a4a6a, hx - 12.5, hx - 12.3, hy + .2, hy + 3.2, hz + 1.4, hz + 3.4);
      box(B.dome, MT.wood, 0x8a6a3a, hx - 12.6, hx - 12.4, hy + 3.6, hy + 5.2, hz - .6, hz + .8);   // the ladder
      for (const [ax2, az2] of [[hx - 13, hz + 8], [hx + 12, hz + 8], [hx - 13, hz - 12], [hx + 12, hz - 12]]) { B.dome.add(MT.v, A.geo('cyl'), 0x9ab0c0, M(ax2, hy + 4, az2, .5, 8, .5)); ctx.circles.push([ax2, az2, .7]) }
      sign('CHURCH OF THE HOLY SEPULCHRE', hx, hy + 11.6, hz + 12.6, 0, 6, '#9ad8ff', true);
    }

    /* ---------- Tower of David citadel (by Jaffa Gate) ---------- */
    { const tx = TD.x, tz = TD.z, ty = H(tx, tz);
      box(B.stone, jer, 0xe8dfc8, tx - 9, tx + 5, ty, ty + 7, tz - 9, tz + 9); solid(tx - 9, tx + 5, tz - 9, tz + 9);
      minaret(B.stone, tx + 1, tz + 4, 20);   // the famous tower
      for (const [mx, mz] of [[tx - 7, tz - 7], [tx - 7, tz + 7]]) box(B.stone, jer, 0xd8ccb2, mx - 2, mx + 2, ty, ty + 10, mz - 2, mz + 2);
      walk.pad(tx - 2, tz, 6, ty + 7.2);      // courtyard roof deck (viewpoint)
      sign('TOWER OF DAVID', tx + 8, ty + 9, tz, -Math.PI / 2, 4.6, '#ffd84a', true);
    }
    /* ---------- the Cardo + Jewish quarter houses ---------- */
    { for (let x = CARD1[0]; x < CARD0[0]; x += 4) { box(B.stone, MT.stone, 0xd8ccb2, x, x + 2.4, H(x + 1.2, CARD0[1]), H(x + 1.2, CARD0[1]) + .25, CARD0[1] - 5, CARD0[1] + 5) }   // paved cardo strip
      for (let z = -10; z < 50; z += 6) { box(B.decor, MT.v, 0x8a8a7a, CARD1[0] + 1, CARD1[0] + 2, H(CARD1[0] + 1, z), H(CARD1[0] + 1, z) + 1.1, z, z + .3) }   // columns
      const r = rng; houses(B.city, OC.x0 + 8, 18, OC.x1 - 40, 18, 'n', r); houses(B.city, OC.x0 + 8, 46, OC.x1 - 60, 46, 'n', r); houses(B.city, OC.x0 + 10, 10, OC.x0 + 10, 55, 'w', r); houses(B.city, 40, 12, 40, 50, 'e', r); }

    /* ---------- souk alleys (covered markets with striped awnings) ---------- */
    const stalls = [];
    const SOUKC = [0xe83a3a, 0x2a8a4a, 0xffd84a, 0x3a6ad8, 0xff8a3a, 0x8a3ab8];
    { let si = 0; for (const s of SOUK) { const dx = s.b[0] - s.a[0], dz = s.b[1] - s.a[1], L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L, ry = Math.atan2(dx, dz);
        const y0 = H(s.a[0], s.a[1]), y1 = H(s.b[0], s.b[1]);
        /* striped canopy along the alley */
        const n = Math.max(2, Math.round(L / 4));
        for (let i = 0; i < n; i++) { const f = (i + .5) / n, cx = s.a[0] + dx * f, cz = s.a[1] + dz * f, cy = y0 + (y1 - y0) * f + 3.4;
          B.shuk.add(MT.roof, A.geo('hip'), SOUKC[(si + i) % SOUKC.length], M(cx, cy, cz, 2.6, 1.1, L / n + .5, 0, ry, 0));
          for (const sd of [-1, 1]) B.shuk.add(MT.v, A.geo('cyl'), 0x8a6a4a, M(cx - uz * sd * 2.2, cy - 1.7, cz + ux * sd * 2.2, .07, 3.4, .07)); ctx.circles.push([cx - uz * 2.2, cz + ux * 2.2, .25], [cx + uz * 2.2, cz - ux * 2.2, .25]) }
        /* stalls along both sides */
        for (let d = 3; d < L - 2; d += 5) { const cx = s.a[0] + ux * d, cz = s.a[1] + uz * d; for (const sd of [-1, 1]) { const sx0 = cx - uz * sd * 3.1, sz0 = cz + ux * sd * 3.1, sy = H(sx0, sz0);
            B.shuk.add(MT.wood, BG.box, 0xffffff, M(sx0, sy + .5, sz0, 2.4, 1, 1, 0, ry, 0)); B.shuk.add(MT.wood, BG.box, 0x6a4a2a, M(sx0 - ux * .5, sy + 1.06, sz0 - uz * .5, 2.2, .1, .9, 0, ry, 0));
            for (let k = 0; k < 6; k++) B.shuk.add(MT.v, BG.box, [0xc8682a, 0x8a3a3a, 0x3a8a5a, 0xd8b040, 0x6a4a8a, 0xa86a3a][(si + k) % 6], M(sx0 + Math.cos(ry + k) * .7, sy + 1.3, sz0 - Math.sin(ry + k) * .7, .3, .22, .3, 0, ry, 0), .05);
            ctx.cols.push([sx0 - 1.2, sx0 + 1.2, sz0 - 1.2, sz0 + 1.2]); stalls.push({ x: sx0, z: sz0, ry }) } }
        si++ } }
    sign('OLD CITY SOUK', -14, 5.6, -OC.z0 + 6, 0, 4.6, '#ffb04a', true);

    /* ---------- Damascus Gate: ka'ak carts outside ---------- */
    { const gy = H(DAMASCUS[0], DAMASCUS[1] - 8); for (let k = 0; k < 3; k++) { const cx = DAMASCUS[0] - 6 + k * 6, cz = DAMASCUS[1] - 9;
        B.decor.add(MT.wood, BG.box, 0xffffff, M(cx, gy + .7, cz, 2.2, 1.4, 1.4)); B.decor.add(MT.roof, A.geo('hip'), SOUKC[k], M(cx, gy + 2.4, cz, 1.9, .7, 1.5));
        for (let j = 0; j < 5; j++) B.decor.add(MT.v, A.geo('ring'), 0xd8a050, M(cx - .8 + j * .4, gy + 1.5, cz + .1, .16, .16, .05, Math.PI / 2, 0, 0));
        solid(cx - 1.2, cx + 1.2, cz - .8, cz + .8); stalls.push({ x: cx, z: cz - 1.6, ry: Math.PI, kaak: true }) }
      sign('KA’AK · sesame bread', DAMASCUS[0] - 6, gy + 4.4, DAMASCUS[1] - 9, Math.PI, 3.4, '#ffd84a', true) }

    /* ---------- Mamilla avenue (open-air mall west of Jaffa Gate) ---------- */
    { const r = rng; for (let x = MAM.x0; x < MAM.x1 - 6; x += 13) { house(B.city, x + 4, MAM.z0 - 5, 10, 8, 5 + r() * 2, [0xe8dfc8, 0xefe6d0, 0xe6d8bc][r() * 3 | 0], { door: true }); house(B.city, x + 4, MAM.z1 + 5, 10, 8, 5 + r() * 2, [0xdfd2b4, 0xe8dfc8][r() * 2 | 0], { door: true }) }
      for (let x = MAM.x0 + 6; x < MAM.x1; x += 7) { B.decor.add(MT.v, A.geo('cyl'), 0x6a5a3a, M(x, H(x, MAM.z0 + 4) + 1.6, MAM.z0 + 4, .1, 3.2, .1)); B.night.add(MT.v, BG.sph, 0xfff0c0, M(x, H(x, MAM.z0 + 4) + 3.4, MAM.z0 + 4, .22, .22, .22), 1); ctx.circles.push([x, MAM.z0 + 4, .2]) }
      sign('MAMILLA AVENUE', (MAM.x0 + MAM.x1) / 2, 5.8, MAM.z0 - 6, Math.PI, 5, '#ff8ac0', true) }

    /* ---------- Jaffa Road + light rail + City Hall + Mahane Yehuda ---------- */
    { const r = rng; for (let x = JR.x0 + 4; x < JR.x1 - 10; x += 15) { house(B.city, x + 5, JR.z - 11, 11, 9, 9 + r() * 7, [0xe8dfc8, 0xefe6d0, 0xdcd2b8][r() * 3 | 0]); house(B.city, x + 5, JR.z + 12, 11, 9, 8 + r() * 8, [0xdfd2b4, 0xe8dfc8][r() * 2 | 0]) }
      /* City Hall plaza: dark stone plaza + flag poles */
      { const cy0 = H(CITYHALL.x, CITYHALL.z); box(B.city, MT.stone, 0x8a8a84, CITYHALL.x - 14, CITYHALL.x + 14, cy0, cy0 + .2, CITYHALL.z - 12, CITYHALL.z + 12); walk.pad(CITYHALL.x, CITYHALL.z, 13, cy0 + .2);
        house(B.city, CITYHALL.x, CITYHALL.z - 22, 26, 12, 22, 0xcbbf9e); for (let k = 0; k < 3; k++) { B.decor.add(MT.v, A.geo('cyl'), 0x8a8a8a, M(CITYHALL.x - 8 + k * 8, cy0 + 6, CITYHALL.z + 8, .12, 12, .12)); ctx.circles.push([CITYHALL.x - 8 + k * 8, CITYHALL.z + 8, .2]) }
        sign('SAFRA SQUARE · CITY HALL', CITYHALL.x, cy0 + 5, CITYHALL.z + 13, 0, 5, '#9ad8ff', true) }
      /* Mahane Yehuda: roofed market hall + painted shutter bars (night) */
      { const sy = H((SHUK.x0 + SHUK.x1) / 2, (SHUK.z0 + SHUK.z1) / 2);
        B.shuk.add(MT.roof, BG.box, 0x6a5a4a, M((SHUK.x0 + SHUK.x1) / 2, sy + 4.6, (SHUK.z0 + SHUK.z1) / 2, SHUK.x1 - SHUK.x0 + 2, .4, SHUK.z1 - SHUK.z0 + 2));
        for (let x = SHUK.x0 + 2; x < SHUK.x1; x += 4.4) for (const sd of [-1, 1]) B.shuk.add(MT.v, A.geo('cyl'), 0x8a6a4a, M(x, sy + 2.3, (SHUK.z0 + SHUK.z1) / 2 + sd * (SHUK.z1 - SHUK.z0) / 2, .12, 4.6, .12));
        for (let x = SHUK.x0 + 4; x < SHUK.x1 - 2; x += 6) { for (const sd of [-1, 1]) { const sz0 = (SHUK.z0 + SHUK.z1) / 2 + sd * (SHUK.z1 - SHUK.z0) / 2 - sd * 1.6;
            B.shuk.add(MT.wood, BG.box, 0xffffff, M(x, sy + .5, sz0, 3, 1, 1.4)); ctx.cols.push([x - 1.5, x + 1.5, sz0 - .8, sz0 + .8]); stalls.push({ x, z: sz0 - sd * 1.4, ry: sd < 0 ? 0 : Math.PI, shuk: true }) } }
        sign('MAHANE YEHUDA MARKET', (SHUK.x0 + SHUK.x1) / 2, sy + 6.2, SHUK.z1 + 1, Math.PI, 6, '#ffd84a', true) } }
    /* light rail track + overhead wires + stations */
    { const railM = MT.shiny; for (let i = 0; i < TRAM.length - 1; i++) { const a = TRAM[i], b = TRAM[i + 1], L = Math.hypot(b.x - a.x, b.z - a.z), n = Math.floor(L / 6);
        for (let k = 0; k <= n; k++) { const f = k / n, x = a.x + (b.x - a.x) * f, z = a.z + (b.z - a.z) * f, y = H(x, z);
          box(B.decor, railM, 0x8a8a90, x - .7, x + .7, y + .02, y + .12, z - 2.6, z + 2.6); box(B.decor, railM, 0x6a7a3a, x - .7, x + .7, y, y + .02, z - 2.6, z + 2.6);
          if (k % 2 === 0) { B.decor.add(MT.v, A.geo('cyl'), 0x5a5a5a, M(x + 3.4, y + 3, z, .09, 6, .09)); ctx.circles.push([x + 3.4, z, .2]) } } }
      const STOPS = [['Mahane Yehuda', SHUK.x1 + 10, JR.z - 2.2], ['City Hall', CITYHALL.x - 12, JR.z - 2.2], ['Jaffa Center', JR.x0 + 40, JR.z - 2.2]];
      STOPS.forEach(([n, x, z]) => { const y = H(x, z); box(B.decor, MT.shiny, 0x2a4ab8, x, y + 2.4, z, .3, 4.8, 1.6); box(B.night, MT.v, 0x3a6aff, M(x, y + 5.2, z, 1.2, 1.2, .3), 1); ctx.circles.push([x, z, .5]);
        ctx.T.push({ x: x + 1.8, z, r: 2.4, label: () => tr('Light rail: ', 'Tranvía: ') + n + tr(' (3 credits)', ' (3 créditos)'), fn: () => { if (!AV.txn(-3, 'Light rail')) return; AV.audio && AV.audio.blip(660, .2, 'sine', .1); AV.fadeTo(1, 350); setTimeout(() => { const P = AV.P, sp = AV.safeSpot(AV.W, x + 2.2, z + 1.4); P.x = sp[0]; P.z = sp[1]; P.y = AV.W.surface(P.x, P.z) || 0; P.vx = P.vz = 0; S.time += 6; AV.fadeTo(0, 500); AV.toast(tr('“Hashava mehu PendingIntent” — the recorded lady says the doors are closing. You are somewhere else now.', 'La grabación dice que las puertas se cierran. Ahora estás en otra parte.')) }, 900) } }) }) }
    /* ---------- Mount Zion (dormition abbey) ---------- */
    { const zx = ZIONM.x, zz = ZIONM.z, zy = H(zx, zz); box(B.stone, jer, 0xd8ccb2, zx - 12, zx + 12, zy, zy + 12, zz - 12, zz + 12); solid(zx - 12, zx + 12, zz - 12, zz + 12);
      domeOn(B.dome, zx, zz, 8.5, 0x6a7a8a, zy + 12); B.dome.add(goldMat, new THREE.CylinderGeometry(.4, .4, 4, 8), 0xe8c040, M(zx, zy + 23, zz), .4);
      for (let k = 0; k < 4; k++) { const a = k / 4 * TAU + .4; B.dome.add(MT.v, A.geo('cyl'), 0x8a9ab0, M(zx + Math.cos(a) * 11, zy + 6, zz + Math.sin(a) * 11, 1, 12, 1)) }
      sign('MOUNT ZION', zx + 14, zy + 8, zz + 8, -Math.PI / 4, 4.6, '#9ad8ff', true) }
    /* ---------- Mount of Olives + Kidron + church domes ---------- */
    { const ox = OLIV.x, oz = OLIV.z;
      for (const [cx2, cz2, r0, col] of [[ox - 16, oz - 8, 6, 0x9ab8c8], [ox + 6, oz - 14, 4.4, 0x9ab8c8], [ox + 14, oz + 6, 4, 0x9ab8c8]]) { const cy0 = H(cx2, cz2); box(B.stone, jer, 0xd8ccb2, cx2 - r0 - 2, cx2 + r0 + 2, cy0, cy0 + 6, cz2 - r0 - 2, cz2 + r0 + 2); domeOn(B.dome, cx2, cz2, r0, col, cy0 + 6) }
      sign('MOUNT OF OLIVES', ox - 24, H(ox - 24, oz + 30) + 4, oz + 30, -Math.PI / 2, 5, '#9ad8ff', true);
      /* Kidron: ancient tomb cubes in the valley */
      for (const [tx2, tz2, s] of [[KIDRON.x - 6, 10, 4], [KIDRON.x + 4, -6, 3.4], [KIDRON.x - 4, 26, 3]]) { const ty0 = H(tx2, tz2); box(B.stone, jer, 0xcabf9e, tx2 - s, tx2 + s, ty0, ty0 + s * 1.6, tz2 - s, tz2 + s); solid(tx2 - s, tx2 + s, tz2 - s, tz2 + s) } }
    /* ---------- patrol post (game fiction) ---------- */
    { const px0 = POST.x, pz0 = POST.z, py0 = H(px0, pz0); box(B.city, MT.stucco, 0xcabf9e, px0 - 5, px0 + 5, py0, py0 + 3.6, pz0 - 4, pz0 + 4); solid(px0 - 5, px0 + 5, pz0 - 4, pz0 + 4);
      box(B.decor, MT.v, 0xe8e4d8, px0 - 1, px0 + 1, py0 + 3.6, py0 + 5.4, pz0 - .3, pz0 + .3); sign('DESERT PATROL · JERUSALEM POST', px0, py0 + 4.6, pz0 - 4.6, 0, 4.4, '#e8d08a', true) }

    /* ---------- Apeverse portal (west of Jaffa Gate) ---------- */
    { const px0 = PORTAL[0], pz0 = PORTAL[1], py0 = H(px0, pz0);
      const portal = new THREE.Group(); portal.position.set(px0, py0 + 1.7, pz0); grp.add(portal);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.3, .14, 10, 40), new THREE.MeshBasicMaterial({ color: 0xb07aff })); portal.add(ring);
      const disc = new THREE.Mesh(new THREE.CircleGeometry(1.25, 40), new THREE.MeshBasicMaterial({ color: 0x7a3aff, transparent: true, opacity: .45, side: THREE.DoubleSide, depthWrite: false })); portal.add(disc);
      ctx.upd.push((dt, t) => { ring.rotation.z = t * .8; disc.material.opacity = .35 + Math.sin(t * 2) * .12; disc.material.color.setHSL((t * .05) % 1, .8, .5) }); ctx.circles.push([px0, pz0, 1]);
      for (const s of [-1, 1]) { box(B.decor, MT.stone, 0x9a8a7a, px0 - .6, px0 + .6, py0, py0 + 4.4, pz0 + s * 2.2 - .3, pz0 + s * 2.2 + .3); ctx.circles.push([px0, pz0 + s * 2.2, .5]) }
      sign('PORTAL TO APE TOWN', px0, py0 + 6.4, pz0, Math.PI / 2, 4, '#d8a0ff', true) }
    nightish = () => true;   // window glow from here on

    /* ---------- vegetation: cypress + olive trees ---------- */
    const freeV = (x, z, pad) => x > XMIN + 6 && x < XMAX - 6 && z > ZMIN + 6 && z < ZMAX - 6 && roadDist(x, z) > (pad || 3) && !occ.some(o => inRect(o, x, z, (pad || 1.5))) && !inRect(TM, x, z, 2) && !inRect(SHUK, x, z, 2) && !inRect(MAM, x, z, 1) && !inKidron(x, z);
    const pickV = (n, area, ok, s0, s1) => { const out = []; for (let i = 0, t = 0; i < n && t < n * 30; t++) { const x = area.x0 + rng() * (area.x1 - area.x0), z = area.z0 + rng() * (area.z1 - area.z0); if (!ok(x, z)) continue; out.push({ x, y: H(x, z), z, s: s0 + rng() * (s1 - s0), ry: rng() * TAU }); i++ } return out };
    const WORLD = { x0: XMIN, x1: XMAX, z0: ZMIN, z1: ZMAX };
    /* cypress: tall dark cones */
    const cyp = pickV(K.n(36), WORLD, (x, z) => freeV(x, z, 3), 1.6, 2.6); cyp.forEach(p => ctx.circles.push([p.x, p.z, .4]));
    K.scatter(ctx, K.species.candyTree(0x5a4a32, 0x2a4a2a, 0x345a34, 0x2a4a2a), K.floraMat(.005), cyp.map(o => Object.assign({}, o, { s: o.s * .55, sy: 1.7 })), { far: K.far(false), cell: 70 });
    /* olive trees: gnarled, silver-green (Mount of Olives + scattered) */
    const olive = pickV(K.n(30), { x0: OLIV.x - 50, x1: OLIV.x + 50, z0: OLIV.z - 55, z1: OLIV.z + 55 }, (x, z) => Math.hypot(x - OLIV.x, z - OLIV.z) < 55 && freeV(x, z, 3.4), 1.4, 2.2)
      .concat(pickV(K.n(12), WORLD, (x, z) => freeV(x, z, 3.4) && x < OC.x0, 1.2, 2));
    olive.forEach(p => ctx.circles.push([p.x, p.z, .5]));
    K.scatter(ctx, (() => { const p = [ [BG.cyl, 0x6a5a42, M(0, .9, 0, .2, 1.8, .2, .12, 0, .1)], [BG.ico, 0x7a8a5a, M(.25, 2.05, .1, 1.1, .75, 1.0)], [BG.ico0, 0x8a9a66, M(-.55, 1.6, -.3, .75, .55, .7)] ]; return K.merge(p) })(), K.floraMat(.004), olive, { far: K.far(false), cell: 70 });
    K.field(ctx, K.species.bush(0x5a6a3a, 0xc8b860), K.floraMat(.02), K.n(40), WORLD, { H, s0: .8, s1: 1.3, shadow: false, cell: 64, ok: (x, z) => freeV(x, z, 1.6) });
    K.field(ctx, K.species.flower(0xe8c040, 0xc8a030), K.floraMat(.1), K.n(40), WORLD, { H, s0: .8, s1: 1.3, shadow: false, cell: 48, far: K.far(true), ok: (x, z) => freeV(x, z, 1.4) });

    /* ======================= PEOPLE ======================= */
    /* --- named characters (soft-body puppets) --- */
    const crew = {}, H0 = x => stoneH(x, 0);
    const spawn = (id, body, x, z, yaw, anim) => { const n = AV.npc.spawn(ctx, id, { x, z, yaw, body: body || C.regional.body(null, 0), H: (px, pz) => stoneH(px, pz), r: 2.6, anim, speed: 1.25 }); n.tag.position.y = 2.25; n.bub.position.y = 2.95; crew[id] = n; return n };
    spawn('dalia', C.regional.body('guide', 11), JAFFA[0] + 4, JAFFA[1] + 5, Math.PI / 2);
    spawn('yossi', C.regional.body('business', 22), (MAM.x0 + MAM.x1) / 2, MAM.z0 + 3, 0, (n, dt, t, d, talking) => { const u = n.g.userData; if (!n.path && !talking && Math.hypot(n.g.position.x - (MAM.x0 + MAM.x1) / 2, n.g.position.z - (MAM.z0 + 3)) < .5) { u.aR.rotation.x = -1.9 + Math.sin(t * 3) * .06; if (u.st) u.head.rotation.y = Math.sin(t * .8) * .3 } });
    spawn('karim', C.regional.body('vendor', 33), 4, -34, 0, (n, dt, t) => { const u = n.g.userData; if (!n.path && !talking) u.aR.rotation.x = -.8 + Math.sin(t * 1.4) * .12 });
    spawn('miriam', C.regional.body('businesswoman', 44), (SHUK.x0 + SHUK.x1) / 2 - 2, (SHUK.z0 + SHUK.z1) / 2, Math.PI);
    spawn('elias', C.regional.body('elder', 55), HS.x - 18, HS.z + 14, Math.PI * .8);
    /* --- interactions --- */
    const T = (x, z, r, label, fn, show) => { const t = { x, z, r, label, fn, show }; ctx.T.push(t); return t };
    const buy = (cost, what, msg, item) => { if (!AV.txn(-cost, what)) return false; if (item) { if (AV.bag) AV.bag.add(item, 1, true); else S.items[item] = (S.items[item] || 0) + 1; AV.quests && AV.quests.check(); msg += tr(' → backpack (I)', ' → mochila (I)') } AV.toast(msg); AV.audio && AV.audio.blip(660, .15, 'triangle', .12); return true };
    /* tour checkpoints (jlm_tour) */
    const SPOTS = [['western_wall', tr('Stand at the Western Wall', 'Quédate en el Muro Occidental'), tr('You place your palm on stones polished by centuries. The paper notes flutter. Somebody is singing quietly.', 'Apoyas la mano en piedras pulidas por siglos. Las notas de papel tiemblan. Alguien canta bajito.'), WW.x + 3, (WW.z0 + WW.z1) / 2],
      ['sepulchre', tr('Visit the Holy Sepulchre', 'Visita el Santo Sepulcro'), tr('Candlelight, incense, marble, six languages of prayer at once. The ladder is still there. It has been there for a century.', 'Luz de velas, incienso, mármol, seis idiomas rezando a la vez. La escalera sigue ahí. Lleva ahí un siglo.'), HS.x - 10, HS.z + 9],
      ['dome', tr('Look at the Dome of the Rock', 'Mira la Cúpula de la Roca'), tr('The golden dome holds the morning sun like a bowl. The turquoise tiles hum with colour.', 'La cúpula dorada sostiene el sol de la mañana como un cuenco. Los azulejos turquesa vibran de color.'), TM.x0 - 4, TM.z1 + 3],
      ['tower', tr('Climb the Tower of David courtyard', 'Sube al patio de la Torre de David'), tr('From the citadel walls the whole city unfolds: domes, rooftops, hills, haze.', 'Desde las murallas de la ciudadela la ciudad entera se despliega: cúpulas, tejados, colinas y bruma.'), TD.x - 2, TD.z],
      ['shuk', tr('Taste Mahane Yehuda', 'Prueba Mahane Yehuda'), tr('You eat rugelach in the crowd. Spices, fish, chocolate, shouts of “motek!”. The market breathes.', 'Comes rugelach entre la multitud. Especias, pescado, chocolate, gritos de “¡motek!”. El mercado respira.'), (SHUK.x0 + SHUK.x1) / 2, (SHUK.z0 + SHUK.z1) / 2]];
    for (const [id, label, msg, x, z] of SPOTS) {
      const y = stoneH(x, z), ring = new THREE.Mesh(new THREE.TorusGeometry(.6, .07, 6, 24), new THREE.MeshBasicMaterial({ color: 0x7ff0c8 })); ring.position.set(x, y + .1, z); ring.rotation.x = Math.PI / 2; grp.add(ring);
      ctx.upd.push((dt, t) => { ring.position.y = y + .12 + Math.sin(t * 2) * .05; ring.rotation.z = t; const done = S.jlm.tour.includes(id); ring.material.color.setHex(done ? 0x3a5a4a : 0x7ff0c8) });
      T(x, z, 2.4, () => label, () => { if (S.jlm.tour.includes(id)) return AV.toast(tr('Checkpoint done ✔', 'Punto hecho ✔')); S.jlm.tour.push(id); AV.toast(msg); AV.quests && AV.quests.check(); AV.audio && AV.audio.blip(880, .3, 'sine', .12) }, () => !(S.jlm && S.jlm.tour && S.jlm.tour.includes(id)));
    }
    /* Western Wall: press a note */
    T(WW.x + 3.2, WW.z0 + 4, 1.8, () => tr('Tuck your note into the wall', 'Mete tu nota en la muralla'), () => { AV.toast(tr('You fold your wish small and push it between the giant stones. Old ones crunch under your fingers.', 'Doblas tu deseo pequeñito y lo metes entre las piedras gigantes. Las viejas crujen bajo tus dedos.')); AV.dlg && AV.dlg.event('western_wall'); AV.vitals && AV.vitals.add(0, 4) });
    /* shops */
    const SHOPS = [
      [4, -35.4, 'Karim’s spices: za’atar (8)', 'Especias de Karim: za’atar (8)', 8, 'kaak', tr('The smell follows you for an hour. Worth it.', 'El olor te acompaña una hora. Merece la pena.'), 'halva'],
      [(MAM.x0 + MAM.x1) / 2, MAM.z1 + 3, 'Mamilla café: cardamom coffee (6)', 'Café de Mamilla: café con cardamomo (6)', 6, 'cardamom_coffee', tr('Small cup, big wake-up.', 'Taza pequeña, despertar grande.'), 'cardamom_coffee'],
      [(MAM.x0 + MAM.x1) / 2 - 6, MAM.z1 + 3, 'Ceramics: Armenian tile (45)', 'Cerámica: azulejo armenio (45)', 45, 'armenian_tile', tr('Cobalt and turquoise, painted by hand.', 'Cobalto y turquesa, pintado a mano.'), 'armenian_tile'],
      [(SHUK.x0 + SHUK.x1) / 2 + 4, (SHUK.z0 + SHUK.z1) / 2, 'Miriam’s bakery: rugelach (10)', 'Panadería de Miriam: rugelach (10)', 10, 'rugelach', tr('Still warm. “Motek!”', 'Aún caliente. “¡Motek!”'), 'rugelach'],
      [SHUK.x0 + 10, (SHUK.z0 + SHUK.z1) / 2, 'Shuk falafel: pita (12)', 'Falafel del mercado: pita (12)', 12, 'falafel', tr('Crunch, tahini, pickles. Perfect.', 'Crujiente, tahini, encurtidos. Perfecto.'), 'falafel'],
      [SHUK.x1 - 8, (SHUK.z0 + SHUK.z1) / 2, 'Juice stand: pomegranate (10)', 'Zumo: granada (10)', 10, 'pomegranate', tr('Deep red, pressed while you wait.', 'Rojo intenso, exprimido delante de ti.'), 'pomegranate'],
      [-10, -34, 'Souk coffee: mint tea (5)', 'Café del zoco: té de menta (5)', 5, 'mint_tea', tr('Sweet, hot, endless refills.', 'Dulce, caliente, con rellenos infinitos.'), 'mint_tea']];
    for (const [x, z, en, es, cost, item, msg, item2] of SHOPS) T(x, z, 2.2, () => tr(en, es), () => buy(cost, en.split(':')[0], msg, item));
    /* ka'ak cart (quest-related) */
    const kaakCart = stalls.find(s => s.kaak);
    T(kaakCart.x, kaakCart.z, 2.2, () => tr('Ka’ak cart: sesame bread (6)', 'Carrito de ka’ak: pan de sésamo (6)'), () => buy(6, 'Ka’ak cart', tr('A long sesame ring, warm in your hand.', 'Un aro largo de sésamo, caliente en la mano.'), 'kaak'));
    /* Miriam hands over the briefcase (quest) */
    T((SHUK.x0 + SHUK.x1) / 2 - 2, (SHUK.z0 + SHUK.z1) / 2 + 2, 2.4, () => (S.quests || {}).jlm_briefcase === 'active' && !((S.items || {}).briefcase) ? tr('Miriam’s counter: take Yossi’s briefcase', 'Mostrador de Miriam: coger el maletín de Yossi') : tr('Miriam’s counter', 'Mostrador de Miriam'), () => { if ((S.quests || {}).jlm_briefcase === 'active' && !((S.items || {}).briefcase)) { if (AV.bag) AV.bag.add('briefcase', 1, true); else S.items.briefcase = 1; AV.quests && AV.quests.check(); AV.toast(tr('Miriam: “There. And tell that boy to EAT something.”', 'Miriam: “Ten. Y dile a ese chico que COMA algo.”')) } else AV.toast(tr('Rugelach trays, flour, and one brown briefcase (sometimes).', 'Bandejas de rugelach, harina y, a veces, un maletín marrón.')) });
    /* tram note + portal */
    T(PORTAL[0], PORTAL[1] - 1.6, 2.4, () => tr('Apeverse Portal: travel to another world', 'Portal Apeverse: viajar a otro mundo'), () => { const ws = Object.keys(AV.worldDefs).filter(id => id !== 'jerusalem');
      const p = AV.panel('cmp', '<b>' + tr('Apeverse Portal', 'Portal Apeverse') + '</b><div class="grid">' + ws.map(id => '<button data-w="' + id + '">' + ((AV.worldMeta(id) || {}).name || id) + '</button>').join('') + '</div><button data-close>' + tr('Close', 'Cerrar') + '</button>');
      p.querySelectorAll('[data-w]').forEach(b => b.onclick = () => { AV.closePanel('cmp'); AV.audio && AV.audio.whoosh(); AV.travel(b.dataset.w, 'jerusalem') }) });

    /* --- crowd: instanced walkers on a street graph --- */
    const nodes = [], edges = [], idx = {}; const addN = (k, x, z) => { idx[k] = nodes.length; nodes.push([x, z]) };
    const chain = pts => { let prev = null; pts.forEach(([x, z]) => { const id = nodes.length; nodes.push([x, z]); if (prev != null) edges.push([prev, id]); prev = id }); return prev };
    { const a = chain([[JR.x0 + 6, JR.z + 3], [JR.x0 + 40, JR.z + 3], [JR.x0 + 80, JR.z + 3], [MAM.x0 + 4, JR.z + 3], [MAM.x0 + 30, JR.z + 3], [MAM.x1 + 2, JR.z + 3]]);   // Jaffa Rd south pavement
      const b = chain([[JR.x0 + 6, JR.z - 3], [JR.x0 + 40, JR.z - 3], [JR.x0 + 80, JR.z - 3], [MAM.x0 + 4, JR.z - 3], [MAM.x0 + 30, JR.z - 3], [MAM.x1 + 2, JR.z - 3]]);  // north pavement
      edges.push([a, b]);
      const m = chain([[MAM.x1 + 2, JR.z + 3], [MAM.x0 + 30, 14], [MAM.x0 + 10, 12], [JAFFA[0] + 6, 10]]); edges.push([a + 4, m], [a + 5, idx[Object.keys(idx).find(() => false)] || nodes.length - 1]);
      const j = chain([[JAFFA[0] + 6, 10], [JAFFA[0] + 8, 2], [JAFFA[0] + 8, -12], [JAFFA[0] + 10, -30], [DAMASCUS[0] - 6, DAMASCUS[1] - 6]]); edges.push([m + 3, j], [a + 5, m + 1]);
      const k0 = chain([[DAMASCUS[0] - 4, DAMASCUS[1] - 4], [DAMASCUS[0], -40], [DAMASCUS[0] + 2, -30], [4, -32], [2, -40], [WW.x, -44], [WW.x + 3, -38]]); edges.push([j + 4, k0], [b + 5, j]);
      const t0 = chain([[WW.x + 3, -38], [WW.x + 3, -30], [TM.x1 - 6, -44], [TM.x1 - 6, -58], [LIONS[0] - 6, LIONS[1] - 4]]); edges.push([k0 + 5, t0], [k0 + 3, t0]);
      const s0 = chain([[LIONS[0] - 6, LIONS[1] - 4], [OC.x1 - 8, 6], [OC.x1 - 10, 30], [-10, OC.z1 - 6], [-40, OC.z1 - 6], [JAFFA[0] + 8, 20]]); edges.push([t0 + 4, s0], [s0 + 5, j + 1]);
      const sh = chain([[JR.x0 + 60, JR.z - 3], [JR.x0 + 62, JR.z - 8], [SHUK.x0 + 6, SHUK.z0 + 2], [(SHUK.x0 + SHUK.x1) / 2, (SHUK.z0 + SHUK.z1) / 2], [SHUK.x1 - 4, (SHUK.z0 + SHUK.z1) / 2]]); edges.push([b + 2, sh], [sh + 3, sh + 4]);
    }
    const NAV = CY.nav(nodes, edges);
    const crowd = CY.crowd(ctx), nPed = [20, 36, 54][q];
    const VLIST = ['man', 'woman', 'tourist', 'suit', 'orthodox', 'keff', 'hijab', 'soldier', 'robe', 'student', 'monk', 'nun'];
    for (let i = 0; i < nPed; i++) { const v = VLIST[i % VLIST.length], n0 = nodes[rng() * nodes.length | 0];
      const cols = (C.regional && C.regional.walkCols) ? C.regional.walkCols(v, rng) : null;
      crowd.add({ v, x: n0[0], z: n0[1], nav: NAV, idleProb: .22, cols: cols || undefined }) }
    /* soldiers by the gates + Mount (patrol pairs) */
    const pat = []; for (const [x, z, x2, z2] of [[JAFFA[0] + 6, 12, JAFFA[0] + 10, -8], [DAMASCUS[0] - 5, DAMASCUS[1] - 5, DAMASCUS[0] + 4, DAMASCUS[1] - 5], [TM.x1 - 6, TM.z1 - 2, TM.x1 - 10, TM.z1 - 6]]) {
      for (const [px, pz] of [[x, z], [x2, z2]]) pat.push(crowd.add({ v: 'soldier', x: px, z: pz, cols: { skin: 0xd8a47a, hair: 0x14100c, shirt: 0xb8a27a, pants: 0xa8946c }, yaw: Math.atan2(px - x2 || 1, pz - z2 || 1), mode: 'idle' })) }
    crowd.build();
    /* rigged characters at the hotspots (V0.9.7 pattern) */
    const roles = ['business', 'businesswoman', 'orthodox', 'vendor', 'student', 'pilgrim', 'hijabi', 'soldier', 'monk', 'nun', 'elder', 'embroidered', 'bedouin'];
    const spots = [[JAFFA[0] + 8, 8, 14], [MAM.x0 + 20, MAM.z0 + 3, 12], [(MAM.x0 + MAM.x1) / 2, MAM.z0 + 3, 10], [4, -30, 12], [-10, -36, 10], [8, -30, 10], [WW.x + 5, -36, 10], [TM.x0 - 2, TM.z1 + 4, 10], [HS.x - 12, HS.z + 14, 10], [HS.x + 16, HS.z + 8, 8], [CITYHALL.x - 10, CITYHALL.z + 4, 12], [(SHUK.x0 + SHUK.x1) / 2 + 6, (SHUK.z0 + SHUK.z1) / 2, 12], [-30, 30, 10]];
    AV.beings.spawn(ctx, spots.slice(0, AV.beings.n(ctx, 3, 6, 9)).map(([x, z, r], i) => { const role = roles[i % roles.length], a = C.regional.actor(role, 500 + i * 17);
      return { kind: 'human', x, z, area: { x, z, r }, seed: 500 + i, look: a.look, dress: a.dress, role,
        lines: [tr('The light rail is free with a daily pass. Cheap and slow and perfect.', 'El tranvía es gratis con el pase de un día. Barato, lento y perfecto.'), tr('Best falafel is a matter of religion. And of the queue length.', 'El mejor falafel es cuestión de religión. Y del tamaño de la cola.'), tr('The stones here are golden at seven. Every photographer knows.', 'Las piedras se vuelven doradas a las siete. Todo fotógrafo lo sabe.'), tr('Watch the cats of the Old City. They own everything.', 'Cuidado con los gatos de la Ciudad Vieja. Ellos son los dueños.')][i % 4],
        greet: [tr('Shalom! Nice day for stones.', '¡Shalom! Buen día para piedras.'), tr('Salaam! Welcome to the Old City.', '¡Salam! Bienvenido a la Ciudad Vieja.'), tr('Water, hat, and comfortable shoes — the holy trinity of Jerusalem.', 'Agua, sombrero y zapatos cómodos: la sagrada trinidad de Jerusalén.')][i % 3] } }));
    /* traffic: cars + buses on Jaffa Rd / Mamilla loop */
    const CARC = [0xf2f2f0, 0xe8e6e0, 0xb8bcc0, 0x5a5e62, 0x15171a, 0x1f3e72, 0x9a1a1a, 0x2a6a4a];
    const traffic = CY.traffic(ctx, [{ pts: [[JR.x0 + 8, JR.z - 2], [MAM.x0, JR.z - 2], [MAM.x0, 30], [MAM.x0 - 30, 44], [MAM.x0 - 80, 44], [MAM.x0 - 120, 20], [JR.x0 + 20, JR.z], [JR.x0 + 8, JR.z]], off: -2, w: 10 }].concat(JR.x0 > MAM.x0 - 130 ? [{ pts: [[JR.x0 + 8, JR.z + 2], [JR.x0 + 90, JR.z + 2], [JR.x0 + 130, JR.z - 10], [JR.x0 + 90, JR.z - 2], [JR.x0 + 8, JR.z + 2]], off: -2, w: 10 }] : []),
      [{ type: 'car', cols: CARC, n: [2, 4, 6][q], speed: 7 }, { type: 'bus', cols: [0x2a8a4a, 0x2a6a4a], n: [1, 2, 2][q], speed: 5.5 }, { type: 'scooter', cols: [0x15171a, 0xf0f0ec, 0xb01e1e], n: [1, 3, 4][q], speed: 8 }], { density: () => { const h = hourNow(); return h < 5 ? .3 : 1 } });
    /* parked cars along Jaffa Rd */
    { const list = []; for (let x = JR.x0 + 14; x < JR.x1 - 6; x += 9) { if (rng() < .5) continue; list.push({ type: rng() < .7 ? 'car' : 'pickup', x, z: JR.z - 6.6, yaw: 0, col: CARC[rng() * CARC.length | 0] }); ctx.cols.push([x - 1, x + 1, JR.z - 8.6, JR.z - 4.6]) } CY.parked(ctx, list) }
    CY.birds(ctx, [{ x: HS.x, z: HS.z, r: 16, y: 24, n: 8 }, { x: (TM.x0 + TM.x1) / 2, z: (TM.z0 + TM.z1) / 2, r: 20, y: 30, n: 10 }, { x: OLIV.x, z: OLIV.z, r: 30, y: 34, n: 8 }]);

    /* ---------- quests ---------- */
    const Q = AV.quests;
    const def = (id, giver, turnIn, title, hint, ready, reward) => Q.define(id, { giver, turnIn, title, hint, ready, reward });
    def('jlm_tour', 'dalia', 'dalia', ['Dalia’s Grand Tour', 'El gran tour de Dalia'], ['Stand at 5 glowing checkpoints: the Western Wall, the Holy Sepulchre, the Dome of the Rock, the Tower of David courtyard and Mahane Yehuda.', 'Quédate en 5 puntos brillantes: el Muro Occidental, el Santo Sepulcro, la Cúpula de la Roca, el patio de la Torre de David y Mahane Yehuda.'],
      S2 => S2.jlm.tour.length >= 5, () => { AV.txn(40, 'Mission: Grand Tour'); return tr('Dalia: “A fine student of stones!” +40 credits.', 'Dalia: “¡Buen alumno de piedras!” +40 créditos.') });
    def('jlm_briefcase', 'yossi', 'yossi', ['The Lost Briefcase', 'El maletín perdido'], ['Yossi left his briefcase at Mahane Yehuda. Talk to Miriam at her bakery counter, take the briefcase, bring it to Yossi at Mamilla.', 'Yossi dejó su maletín en Mahane Yehuda. Habla con Miriam, coge el maletín en su mostrador y llévaselo a Yossi en Mamilla.'],
      S2 => (S2.items.briefcase || 0) > 0 && S2.jlm.met && S2.jlm.met.yossi, S2 => { S2.items.briefcase--; AV.txn(60, 'Mission: the briefcase'); return tr('Yossi: “PITCH SAVED. You’re in the deck credits. Slide 3.” +60 credits.', 'Yossi: “¡PITCH SALVADO! Sales en los créditos. Diapositiva 3.” +60 créditos.') });
    def('jlm_kaak', 'karim', 'karim', ['Ka’ak for Karim', 'Ka’ak para Karim'], ['Buy a sesame ka’ak from the carts outside Damascus Gate and bring it to Karim at his spice shop.', 'Compra un ka’ak de sésamo en los carritos junto a la Puerta de Damasco y llévaselo a Karim en su tienda de especias.'],
      S2 => (S2.items.kaak || 0) > 0, S2 => { S2.items.kaak--; AV.txn(20, 'Mission: ka’ak for Karim'); return tr('Karim: “Warm! Perfect! Coffee is compulsory now.” +20 credits.', 'Karim: “¡Caliente! ¡Perfecto! Ahora el café es obligatorio.” +20 créditos.') });
    /* meeting the named characters (tour mission turn-in requires Dalia talk) */
    ctx.upd.push(() => { if (AV.chat.open && !S.jlm.met[AV.chat.who]) { S.jlm.met[AV.chat.who] = 1; AV.quests && AV.quests.check() } });
    /* the named crew also greet passers-by */
    { const BARKS = [['dalia', [tr('Tours here! History included!', '¡Tours aquí! ¡Con historia!')]], ['yossi', [tr('One minute! Big news coming!', '¡Un minuto! ¡Viene una noticia enorme!')]], ['karim', [tr('Za’atar! Coffee! Welcome!', '¡Za’atar! ¡Café! ¡Bienvenidos!')]], ['miriam', [tr('Rugelach, motek!', '¡Rugelach, motek!')]], ['elias', [tr('Hand-painted. One of a kind.', 'Pintado a mano. Pieza única.')]]];
      ctx.upd.push((() => { let acc = 0; return (dt, t) => { acc += dt; if (acc < 18) return; acc = 0; if (AV.blocking()) return; const [id, arr] = BARKS[Math.random() * BARKS.length | 0], n = crew[id]; if (!n) return; const d = Math.hypot(AV.P.x - n.g.position.x, AV.P.z - n.g.position.z); if (d < 14) AV.npc.bark(n, arr[Math.random() * arr.length | 0]) } })()) }

    /* ---------- time of day + music ---------- */
    let lastHour = -1;
    ctx.upd.push((dt, t) => { const h = Math.floor(hourNow()); if (h !== lastHour) { if (lastHour >= 0) { if (h === 18) AV.toast(tr('The stone turns gold. Jerusalem of gold.', 'La piedra se vuelve dorada. Jerusalén de oro.')) } lastHour = h }
      if (AV.audio && AV.audio.track && AV.audio.track.active) AV.audio.track.pos = { x: (SHUK.x0 + SHUK.x1) / 2, y: 3, z: (SHUK.z0 + SHUK.z1) / 2 } });
    /* night window glow + lamp bulbs follow the sky (B.night flush) */
    const nightMeshes = B.night.flush(ctx, { noShadow: true }); delete B.night;

    /* ---------- flush ---------- */
    for (const k in B) B[k].flush(ctx);
    return {
      name: 'Jerusalem · City of Gold', fog: [90, 430], sky: SKY,
      surface: (x, z) => { if (x < XMIN + 3 || x > XMAX - 3 || z < ZMIN + 3 || z > ZMAX - 3) return null; const p = walk.at(x, z); return p === undefined ? H(x, z) : Math.max(p, H(x, z)) },
      arrivals: { default: { x: JAFFA[0] - 6, z: 8, yaw: -Math.PI / 2 }, pipe: { x: JAFFA[0] - 6, z: 12, yaw: -Math.PI / 2 }, jerusalem: { x: PORTAL[0] - 1, z: PORTAL[1], yaw: -Math.PI / 2 }, ape_gate: { x: JAFFA[0] - 6, z: 8, yaw: -Math.PI / 2 } }, defaultArrival: 'default',
      places: [{ id: 'jaffa', name: ['Jaffa Gate', 'Puerta de Jaffa'], x: JAFFA[0] - 4, z: 8, yaw: -Math.PI / 2 }, { id: 'wall', name: ['Western Wall', 'Muro Occidental'], x: WW.x + 3, z: (WW.z0 + WW.z1) / 2, yaw: -Math.PI / 2 },
        { id: 'dome', name: ['Dome of the Rock', 'Cúpula de la Roca'], x: TM.x0 - 3, z: TM.z1 + 3, yaw: -Math.PI / 2 }, { id: 'sepulchre', name: ['Holy Sepulchre', 'Santo Sepulcro'], x: HS.x - 12, z: HS.z + 10, yaw: Math.PI },
        { id: 'shuk', name: ['Mahane Yehuda', 'Mahane Yehuda'], x: (SHUK.x0 + SHUK.x1) / 2, z: (SHUK.z0 + SHUK.z1) / 2, yaw: Math.PI }, { id: 'mamilla', name: ['Mamilla Avenue', 'Avenida Mamilla'], x: (MAM.x0 + MAM.x1) / 2, z: 4, yaw: Math.PI / 2 },
        { id: 'olives', name: ['Mount of Olives', 'Monte de los Olivos'], x: OLIV.x - 30, z: OLIV.z + 20, yaw: 0 }],
      chatLines: [tr('Every stone here has three stories and they all disagree.', 'Cada piedra tiene tres historias y todas se contradicen.'), tr('The light rail is slow but the dome makes up for it.', 'El tranvía es lento, pero la cúpula lo compensa.'), tr('Friday afternoon the whole city smells of baking.', 'El viernes por la tarde toda la ciudad huele a pan horneándose.'), tr('Best view: Tower of David walls at seven.', 'La mejor vista: las murallas de la Torre de David a las siete.')],
      musicProfile: { bpm: 92, root: 43, scale: [0, 1, 4, 5, 7, 8, 10], style: 'maqam' },
      music: { playlist: 'chiang_mai', pos: { x: (SHUK.x0 + SHUK.x1) / 2, y: 3, z: (SHUK.z0 + SHUK.z1) / 2 }, bed: .4 }
    };
  }
});
})(window.AV);
