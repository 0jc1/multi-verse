/* APEVERSE - world_jerusalem.js : JERUSALEM — City of Gold (game-sized map that follows the real city's layout).
   North = -z, east = +x. The Old City inside its Ottoman walls with 7 open gates (Jaffa + New on the west, Damascus +
   Herod's on the north, Lions' on the east, Dung + Zion on the south) and its four quarters; the Temple Mount esplanade
   (Haram al-Sharif) in the north-east with the golden Dome of the Rock and Al-Aqsa, reached by the wooden Mughrabi
   ramp beside the Western Wall plaza and by the west ramp from the souk; the Church of the Holy Sepulchre (with the
   "immovable ladder"); the Tower of David citadel inside Jaffa Gate; the Roman Cardo; the covered souk from Damascus Gate
   down to the Western Wall; ka'ak carts and the bus to the Dead Sea outside Damascus Gate. West of the walls: Mamilla
   avenue, Jaffa Road with the light rail (grass track, 3 rideable stops), Safra Square / City Hall, and Mahane Yehuda
   market. South: Mount Zion. East across the Kidron valley: the Mount of Olives with its church domes and olive groves.
   People: Dalia (guide), Yossi (founder), Karim (spice merchant), Miriam (baker), Elias (ceramicist) + business people,
   residents, vendors, students, pilgrims, monks, nuns and off-duty soldiers on their way home (soft-body characters
   + an instanced street crowd). The holy places are treated respectfully: no smoking stoners spawn here, and the
   backpack refuses smoking inside the walls. */
'use strict';
(function (AV) {
const tr = AV.tr, TAU = AV.TAU, K = AV.kit, A = AV.arch, CY = AV.city, MD = AV.media, C = AV.chars;
const M = K.M, BG = K.BG, deg = d => d * Math.PI / 180;
const hourNow = () => (AV.S.time / 60) % 24;

/* ======================= layout ======================= */
const OC = { x0: -70, x1: 70, z0: -95, z1: 65 };                 // Old City walls
const WALL = 2.6, WALLH = 9, GAP = 4;                             // wall thickness / height, half-width of a gate opening
const GATES = [                                                   // [name, x, z, side]
  ['JAFFA GATE', OC.x0, 8, 'w'], ['NEW GATE', OC.x0, -30, 'w'], ['DAMASCUS GATE', -14, OC.z0, 'n'], ['HEROD’S GATE', 42, OC.z0, 'n'],
  ['LIONS’ GATE', OC.x1, -14, 'e'], ['DUNG GATE', -16, OC.z1, 's'], ['ZION GATE', -52, OC.z1, 's']];
const TM = { x0: 12, x1: 66, z0: -88, z1: -46 };                  // Temple Mount esplanade
const DOME = { x: 39, z: -70, R: 9 };                             // Dome of the Rock
const AQSA = { x0: 18, x1: 38, z0: -54.5, z1: -47.5 };            // Al-Aqsa (south end of the esplanade)
const WW = { x0: 14, x1: 40, z0: -43.8, z1: -24 };                // Western Wall plaza (the wall is the esplanade's face at z = -46)
const MUGH = { x0: 41, x1: 44.6, z0: -46, z1: -36 };              // Mughrabi ramp (up to the esplanade)
const WRAMP = { x0: 0, x1: 12, z0: -64, z1: -60 };                // west ramp from the souk
const HS = { x0: -54, x1: -30, z0: -62, z1: -42 };                // Church of the Holy Sepulchre (forecourt to its south)
const HSF = { x0: -50, x1: -34, z0: -42, z1: -32 };
const TD = { x0: -64, x1: -50, z0: 18, z1: 34 };                  // Tower of David citadel
const CARDO = { x0: -58, x1: -30, z0: -7, z1: 3 };
const SOUK = [[-14, -89], [-14, -30], [8, -26], [8, -44]];        // covered souk alleys (Damascus Gate -> Western Wall)
const DPLAZA = { x0: -24, x1: -4, z0: -92.4, z1: -82 };           // inside Damascus Gate
const JPLAZA = { x0: -67.4, x1: -56, z0: 0, z1: 16 };             // inside Jaffa Gate
const BUSSTOP = { x: -32, z: -106 };                              // bus to the Dead Sea (outside Damascus Gate)
const JR = { z: -1, x0: -236, x1: -116 };                         // Jaffa Road (+ light rail)
const MAM = { x0: -116, x1: -78, z0: 8, z1: 22 };                 // Mamilla avenue
const SHUK = { x0: -230, x1: -178, z0: -30, z1: -12 };            // Mahane Yehuda market
const CITYHALL = { x0: -154, x1: -126, z0: 14, z1: 38 };          // Safra Square
const ZIONM = { x: -46, z: 110 };                                 // Mount Zion
const OLIV = { x: 130, z: -20 };                                  // Mount of Olives
const KIDRON = { x: 86, w: 14 };
const PORTAL = { x: -84, z: 38 };
const TRAM_Z = JR.z - 2.2, CAR_Z = JR.z + 2.6;
const XMIN = -256, XMAX = 190, ZMIN = -125, ZMAX = 150, GW = XMAX - XMIN, GD = ZMAX - ZMIN;
const inRect = (r, x, z, m) => x > r.x0 - (m || 0) && x < r.x1 + (m || 0) && z > r.z0 - (m || 0) && z < r.z1 + (m || 0);
const inKidron = (x, z) => Math.abs(x - KIDRON.x) < KIDRON.w && z < 60;

/* roads [x0, z0, x1, z1, width] : painted, kept free of buildings */
const ROADS = [
  [JR.x0, JR.z, JR.x1, JR.z, 10], [JR.x1, JR.z, OC.x0 - 6, JR.z, 8], [OC.x0 - 6, JR.z, OC.x0, 8, 7],              // Jaffa Road -> Jaffa Gate
  [OC.x0, 8, -30, 8, 6], [-30, 8, -30, -8, 6],                                                                    // into the city
  [-14, OC.z0, -14, -30, 6], [-14, -30, 8, -26, 6], [8, -26, 8, -46, 5],                                          // souk
  [OC.x1, -14, 64, -14, 6], [64, -14, 64, -30, 6],                                                                // Lions' Gate
  [-16, OC.z1, -16, 50, 5], [-52, OC.z1, -52, 50, 5],                                                             // Dung + Zion gates
  [JR.x1, JR.z + 2, JR.x1, 44, 7],                                                                               // King David St
  [-14, OC.z0, -14, -110, 7], [-14, -110, 60, -110, 7],                                                           // outside Damascus Gate
  [OC.x1, -14, 110, -30, 6], [110, -30, 120, -40, 6]];                                                            // down to the Kidron + Mount of Olives
function segD(x, z, r) { const dx = r[2] - r[0], dz = r[3] - r[1], L = dx * dx + dz * dz, t = L ? Math.max(0, Math.min(1, ((x - r[0]) * dx + (z - r[1]) * dz) / L)) : 0; return Math.hypot(x - r[0] - dx * t, z - r[1] - dz * t) - r[4] / 2 }
const roadDist = (x, z) => { let d = 1e9; for (const r of ROADS) d = Math.min(d, segD(x, z, r)); return d };
/* pedestrian graph polylines (also kept free of buildings) */
const NAVL = [
  [[-230, 5.6], [-200, 5.6], [-170, 5.6], [-140, 5.6], [-116, 5.6]],                         // Jaffa Rd south pavement
  [[-230, -7], [-200, -7], [-170, -7], [-140, -7], [-116, -7]],                              // north pavement
  [[-116, 5.6], [-116, 15], [-97, 15], [-78, 15], [-74, 8]],                                 // Mamilla -> Jaffa Gate
  [[-116, -7], [-116, 5.6]],
  [[-74, 8], [-62, 8], [-40, 8], [-30, 8], [-30, -4], [-14, -4]],                            // Jaffa Gate -> centre
  [[-14, -89], [-14, -30], [8, -26], [8, -44], [20, -40], [30, -34]],                        // souk -> Western Wall plaza
  [[30, -34], [36, -30], [52, -30], [64, -22], [64, -14]],                                   // plaza -> Lions' Gate
  [[64, -14], [60, 10], [50, 40], [20, 56], [-16, 58], [-52, 58], [-44, 40], [-40, 14], [-40, 8]],   // east + south lanes
  [[-30, -4], [-42, -20], [-42, -34], [-60, -36], [-62, -30]],                               // Sepulchre + New Gate
  [[-176, -7], [-180, -21], [-204, -21], [-226, -21]],                                       // Mahane Yehuda
  [[-14, -89], [-14, -100], [-32, -104]],                                                    // out of Damascus Gate to the bus
  [[64, -14], [76, -14], [100, -24], [116, -38]]];                                           // Lions' Gate -> Gethsemane
const navDist = (x, z) => { let d = 1e9; for (const pl of NAVL) for (let i = 1; i < pl.length; i++) d = Math.min(d, segD(x, z, [pl[i - 1][0], pl[i - 1][1], pl[i][0], pl[i][1], 0])); return d };

/* ======================= painted ground ======================= */
const TX = {};
function canvasTex(w, h, draw, rep) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; t.wrapS = t.wrapT = rep ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping; t.userData = { keep: true }; return t }
/* Jerusalem limestone ashlar (warm cream blocks) */
function stoneTex() { return TX.stone || (TX.stone = canvasTex(256, 256, (c, w, h) => { const r = AV.rng(21); c.fillStyle = '#d8ccb0'; c.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 32) for (let x = -(y / 32 % 2) * 24; x < w; x += 48) { const v = r() * 26 | 0; c.fillStyle = 'rgb(' + (225 + v) + ',' + (214 + v) + ',' + (188 + v * .8 | 0) + ')'; c.fillRect(x + 1.5, y + 1.5, 45, 29) }
  for (let i = 0; i < 500; i++) { c.fillStyle = 'rgba(120,100,70,' + (r() * .12).toFixed(2) + ')'; c.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 3) }
  for (let i = 0; i < 14; i++) { c.fillStyle = 'rgba(150,120,70,' + (.08 + r() * .12).toFixed(2) + ')'; c.beginPath(); c.arc(r() * w, r() * h, 8 + r() * 30, 0, TAU); c.fill() } }, true)) }
function groundTex(N) {
  return TX.ground || (TX.ground = canvasTex(N, Math.round(N * GD / GW), (c, w, h) => {
    const m = w / GW, P = (x, z) => [(x - XMIN) * m, (z - ZMIN) * m], r = AV.rng(31);
    c.fillStyle = '#c9b992'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 1200; i++) { c.fillStyle = ['#bfae86', '#d2c49e', '#c3b28c', '#cdbd94'][i % 4]; c.globalAlpha = .3; c.beginPath(); c.arc(r() * w, r() * h, 2 + r() * 9, 0, TAU); c.fill() } c.globalAlpha = 1;
    const rect = (q, col) => { const a = P(q.x0, q.z0); c.fillStyle = col; c.fillRect(a[0], a[1], (q.x1 - q.x0) * m, (q.z1 - q.z0) * m) };
    rect(OC, '#cbb994'); rect(WW, '#d8c8a6'); rect(HSF, '#c7b58e'); rect(JPLAZA, '#d0c2a0'); rect(DPLAZA, '#d0c2a0'); rect(CARDO, '#bfb08a');
    rect(MAM, '#dcd2b8'); rect(SHUK, '#b8a888'); rect(CITYHALL, '#8e8a84');
    rect({ x0: KIDRON.x - KIDRON.w, x1: KIDRON.x + KIDRON.w, z0: ZMIN, z1: 60 }, '#a89a6e');
    c.globalAlpha = .55; rect({ x0: OLIV.x - 46, x1: XMAX, z0: OLIV.z - 60, z1: OLIV.z + 60 }, '#a8a070'); c.globalAlpha = 1;
    c.lineCap = 'butt'; const seg = (rd, w2, col) => { const p0 = P(rd[0], rd[1]), p1 = P(rd[2], rd[3]); c.strokeStyle = col; c.lineWidth = w2 * m; c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); c.stroke() };
    for (const rd of ROADS) seg(rd, rd[4] + 2.4, '#c3b58e'); for (const rd of ROADS) seg(rd, rd[4], inRect(OC, (rd[0] + rd[2]) / 2, (rd[1] + rd[3]) / 2) ? '#b4a27e' : '#85837c');
    /* light rail grass track + car lane markings on Jaffa Road */
    seg([JR.x0, TRAM_Z, JR.x1, TRAM_Z, 3.4], 3.4, '#5e7c3c'); c.setLineDash([3 * m, 3 * m]); seg([JR.x0, CAR_Z, JR.x1, CAR_Z, .2], .2, '#e8d890'); c.setLineDash([]);
    for (let i = 0; i < 9000; i++) { const x = XMIN + r() * GW, z = ZMIN + r() * GD; if (roadDist(x, z) < 0) { c.fillStyle = r() < .5 ? 'rgba(0,0,0,.12)' : 'rgba(255,255,255,.08)'; const q = P(x, z); c.fillRect(q[0], q[1], 1.5, 1.5) } }
    for (let i = 0; i < 260; i++) { const x = OLIV.x - 40 + r() * 90, z = OLIV.z - 55 + r() * 110; if (Math.hypot(x - OLIV.x, z - OLIV.z) > 52) continue; const q = P(x, z); c.fillStyle = ['#5a6a3a', '#6a7a44', '#4a5a32'][i % 3]; c.fillRect(q[0], q[1], 2 * m, 2 * m) }
  }));
}
/* trilingual-looking ceramic street plaque (Hebrew, Arabic, English) */
function plaqueTex(he, ar, en) {
  const key = 'pl' + en; if (TX[key]) return TX[key];
  return TX[key] = canvasTex(512, 256, (c, w, h) => { c.fillStyle = '#f4f0e6'; c.fillRect(0, 0, w, h); c.strokeStyle = '#2a3a7a'; c.lineWidth = 10; c.strokeRect(8, 8, w - 16, h - 16);
    c.fillStyle = '#1a2a6a'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = 'bold 54px "Arial Hebrew","Noto Sans Hebrew",Arial,sans-serif'; c.fillText(he, w / 2, 64, w - 50);
    c.font = 'bold 50px "Geeza Pro","Noto Naskh Arabic",Arial,sans-serif'; c.fillText(ar, w / 2, 132, w - 50);
    c.font = 'bold 42px Arial,Helvetica,sans-serif'; c.fillText(en, w / 2, 200, w - 50) });
}

/* ======================= the world ======================= */
AV.registerWorld({
  id: 'jerusalem',
  build(ctx) {
    const S = AV.S, q = ctx.q, rng = ctx.rng, grp = ctx.group, MT = A.mats(), walk = A.walk();
    if (!S.jlm) S.jlm = { met: {}, tour: [] }; if (!S.jlm.tour) S.jlm.tour = []; if (!S.jlm.met) S.jlm.met = {}; S.items = S.items || {};
    const SKY = { tint: [0xffd8a0, 0xffe8c0, .12, .2], dome: { s1: 0xffc878, s2: 0xff9a4a, swirl: .04, cloud: .45, glow: .55 } };
    const B = { city: K.batch(), stone: K.batch(), dome: K.batch(), decor: K.batch(), shuk: K.batch() }, NIGHT = K.batch();
    const jer = K.floraMat(0, { map: stoneTex(), rough: .92 });
    const goldMat = K.floraMat(0, { rough: .22, metal: .7 }); if (AV.pbr && AV.pbr.env) { goldMat.envMap = AV.pbr.env(); goldMat.envMapIntensity = 1.1 }
    const occ = [];
    const box = (b, mat, col, x0, x1, y0, y1, z0, z1, glow) => b.add(mat, BG.box, col, M((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, x1 - x0, y1 - y0, z1 - z0), glow);
    const solid = (x0, x1, z0, z1) => { ctx.cols.push([x0, x1, z0, z1]); occ.push({ x0, x1, z0, z1 }) };
    MD.resetFrames();

    /* ---------- terrain: the Old City sits on a ridge; Mount of Olives + Mount Zion rise, the Kidron dips ---------- */
    const H = (x, z) => {
      const ridge = Math.max(0, 5 - Math.abs(z + 15) * .045 - Math.abs(x) * .01);
      const oliv = Math.max(0, 20 - Math.hypot(x - OLIV.x, z - OLIV.z) * .3);
      const zion = Math.max(0, 8 - Math.hypot(x - ZIONM.x, z - ZIONM.z) * .22);
      const kid = -3 * Math.max(0, 1 - Math.abs(x - KIDRON.x) / (KIDRON.w + 8)) * (z < 70 ? 1 : .3);
      const edge = Math.max(0, XMIN + 22 - x, x - (XMAX - 22), ZMIN + 18 - z, z - (ZMAX - 18));
      return ridge + oliv + zion + kid + Math.min(16, edge * .6);
    };
    /* raised surfaces: flat rectangles (y) and ramps (ya at the min coordinate -> yb at the max along ax) */
    const RECTS = [];
    const rectAt = (x, z) => { let h; for (const r of RECTS) { if (x < r.x0 || x > r.x1 || z < r.z0 || z > r.z1) continue; const y = r.ax ? r.ya + (r.yb - r.ya) * (r.ax === 'x' ? (x - r.x0) / (r.x1 - r.x0) : (z - r.z0) / (r.z1 - r.z0)) : r.y; if (h === undefined || y > h) h = y } return h };
    const SURF = (x, z) => { const r = rectAt(x, z); if (r !== undefined) return r; const h = H(x, z), p = walk.at(x, z); return p === undefined ? h : Math.max(p, h) };
    const sx = [150, 230, 300][q], sz = Math.round(sx * GD / GW), tg = new THREE.PlaneGeometry(GW, GD, sx, sz); tg.rotateX(-Math.PI / 2); tg.translate((XMIN + XMAX) / 2, 0, (ZMIN + ZMAX) / 2);
    const tp = tg.attributes.position; for (let i = 0; i < tp.count; i++) tp.setY(i, H(tp.getX(i), tp.getZ(i))); tg.computeVertexNormals();
    const gmat = new THREE.MeshStandardMaterial({ map: groundTex([1024, 2048, 2048][q]), roughness: .95 }), grain = A.tex('grain');
    gmat.onBeforeCompile = sh => { sh.uniforms.detailMap = { value: grain }; sh.fragmentShader = 'uniform sampler2D detailMap;\n' + sh.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n diffuseColor.rgb *= mix(1.0, texture2D(detailMap, vUv * 150.0).r * 1.4, .3);') };
    gmat.customProgramCacheKey = () => 'jlmGround'; gmat.userData.lin = 1; const ground = new THREE.Mesh(tg, gmat); ground.receiveShadow = true; grp.add(ground);
    { const sk = new THREE.RingGeometry(Math.max(GW, GD) / 2, 900, 64, 2); sk.rotateX(-Math.PI / 2); sk.translate((XMIN + XMAX) / 2, -2.4, (ZMIN + ZMAX) / 2); grp.add(new THREE.Mesh(sk, AV.std(0xb8a878, 1))) }
    /* the hills of Moab on the far eastern horizon (hazy, unlit) */
    { const parts = [], r = AV.rng(41); for (let i = 0; i < 26; i++) { const a = deg(-70 + i * 7 + r() * 4), d = 780 + r() * 180, h = 110 + r() * 170; parts.push([BG.ico, [0x9ab0c0, 0x8aa4b8, 0xa4b8c8][i % 3], M((XMIN + XMAX) / 2 + Math.cos(a) * d, h * .34 - 24, (ZMIN + ZMAX) / 2 + Math.sin(a) * d, 150 + r() * 90, h, 120 + r() * 70), 0]) }
      const mm = new THREE.Mesh(K.merge(parts), new THREE.MeshBasicMaterial({ vertexColors: true, fog: false })); mm.material.userData.lin = 1; grp.add(mm);
      ctx.upd.push(() => mm.material.color.setScalar(1 - (AV.nightK || 0) * .7)) }

    /* ---------- helpers ---------- */
    const signAt = (txt, x, dy, z, ry, w, col) => ctx.sign(txt, x, SURF(x, z) + dy, z, ry, w, col, { posts: true });
    const plaque = (he, ar, en, x, y, z, ry, w) => { const m = new THREE.Mesh(AV.G.pln, new THREE.MeshBasicMaterial({ map: plaqueTex(he, ar, en) })); m.material.userData.lin = 1; m.scale.set(w, w / 2, 1); m.position.set(x, y, z); m.rotation.y = ry; grp.add(m) };
    const domeOn = (b, x, z, r0, col, y) => { b.add(MT.v, A.geo('dome'), col, M(x, y, z, r0, r0 * 1.05, r0), .1); b.add(goldMat, A.geo('cyl'), 0xe8c040, M(x, y + r0 * 1.1, z, r0 * .1, r0 * .28, r0 * .1)) };
    const minaret = (b, x, z, h) => { const yy = SURF(x, z); b.add(jer, new THREE.CylinderGeometry(1.4, 1.8, h, 10), 0xffffff, M(x, yy + h / 2, z)); b.add(jer, new THREE.CylinderGeometry(2, 2, 1.4, 10), 0xf2ecdc, M(x, yy + h - 1, z)); b.add(MT.v, new THREE.ConeGeometry(1.4, 3.2, 10), 0x2a5a3a, M(x, yy + h + 1.6, z)); b.add(goldMat, A.geo('sph'), 0xe8c040, M(x, yy + h + 3.4, z, .3, .3, .3), .5); ctx.circles.push([x, z, 2]); occ.push({ x0: x - 2, x1: x + 2, z0: z - 2, z1: z + 2 }) };

    /* ---------- the Temple Mount esplanade (built first: everything else keeps clear of it) ---------- */
    const TMY = Math.max(H(TM.x0, TM.z0), H(TM.x1, TM.z0), H(TM.x0, TM.z1), H(TM.x1, TM.z1)) + 6;
    RECTS.push({ x0: TM.x0, x1: TM.x1, z0: TM.z0, z1: TM.z1, y: TMY });
    RECTS.push({ x0: MUGH.x0, x1: MUGH.x1, z0: MUGH.z0 - 2, z1: MUGH.z0, y: TMY });                                         // ramp landing on the esplanade
    RECTS.push({ x0: MUGH.x0, x1: MUGH.x1, z0: MUGH.z0, z1: MUGH.z1, ax: 'z', ya: TMY, yb: H((MUGH.x0 + MUGH.x1) / 2, MUGH.z1) });   // Mughrabi ramp
    RECTS.push({ x0: WRAMP.x0, x1: WRAMP.x1, z0: WRAMP.z0, z1: WRAMP.z1, ax: 'x', ya: H(WRAMP.x0, (WRAMP.z0 + WRAMP.z1) / 2), yb: TMY });   // west ramp
    occ.push(TM, MUGH, WRAMP);
    { const lo = Math.min(H(TM.x0, TM.z0), H(TM.x1, TM.z1), H(TM.x0, TM.z1), H(TM.x1, TM.z0)) - 1.5;
      box(B.stone, jer, 0xf2ecdc, TM.x0, TM.x1, lo, TMY, TM.z0, TM.z1);                                                  // the platform with its retaining walls
      for (let x = TM.x0; x < TM.x1; x += 2.4) box(B.stone, jer, 0xe8dfc8, x, x + 1.2, TMY, TMY + .7, TM.z0, TM.z0 + .6);   // parapet (north)
      /* the Western Wall: courses of giant ashlar on the south face, with notes tucked in the cracks */
      const wy0 = H((WW.x0 + WW.x1) / 2, WW.z0 + 2);
      for (let c = 0; wy0 + c * 1.1 < TMY + .9; c++) for (let x = WW.x0; x < WW.x1; x += 3.2) { const off = c % 2 ? 1.6 : 0; if (x + off + 3.1 > WW.x1) continue; box(B.stone, jer, c < 4 ? 0xcdbf9e : 0xd8ccb0, x + off, x + off + 3.1, wy0 + c * 1.1, wy0 + c * 1.1 + 1.05, -46, -45.4) }
      const noteM = new THREE.MeshBasicMaterial({ color: 0xfff6dc }); noteM.userData.lin = 1;
      for (let i = 0; i < 46; i++) { const n = new THREE.Mesh(BG.box, noteM); n.scale.set(.18, .14, .03); n.position.set(WW.x0 + 1 + rng() * (WW.x1 - WW.x0 - 2), wy0 + .5 + rng() * 2.6, -45.36); grp.add(n) }
      ctx.cols.push([WW.x0, WW.x1, -46, -45.3]);
      /* Mughrabi ramp: covered wooden walkway */
      { const ya = TMY, yb = H((MUGH.x0 + MUGH.x1) / 2, MUGH.z1), L = Math.hypot(MUGH.z1 - MUGH.z0, ya - yb), th = Math.atan2(ya - yb, MUGH.z1 - MUGH.z0), cx = (MUGH.x0 + MUGH.x1) / 2, cz = (MUGH.z0 + MUGH.z1) / 2, cy = (ya + yb) / 2;
        B.decor.add(MT.wood, BG.box, 0xb08a5a, M(cx, cy - .15, cz, MUGH.x1 - MUGH.x0, .3, L, th, 0, 0));
        for (const sd of [MUGH.x0 + .1, MUGH.x1 - .1]) { B.decor.add(MT.wood, BG.box, 0x8a6a44, M(sd, cy + 1.1, cz, .15, 2.2, L, th, 0, 0)); ctx.cols.push([sd - .1, sd + .1, MUGH.z0, MUGH.z1]) }
        B.decor.add(MT.wood, BG.box, 0x6a5034, M(cx, cy + 2.4, cz, MUGH.x1 - MUGH.x0 + .4, .12, L, th, 0, 0)) }
      /* west ramp: stone causeway from the souk */
      { const ya = H(WRAMP.x0, (WRAMP.z0 + WRAMP.z1) / 2), L = Math.hypot(WRAMP.x1 - WRAMP.x0, TMY - ya), th = Math.atan2(TMY - ya, WRAMP.x1 - WRAMP.x0);
        B.stone.add(jer, BG.box, 0xe8dfc8, M((WRAMP.x0 + WRAMP.x1) / 2, (ya + TMY) / 2 - .25, (WRAMP.z0 + WRAMP.z1) / 2, L, .5, WRAMP.z1 - WRAMP.z0, 0, 0, th));
        for (const z of [WRAMP.z0 + .1, WRAMP.z1 - .1]) { B.stone.add(jer, BG.box, 0xd8ccb0, M((WRAMP.x0 + WRAMP.x1) / 2, (ya + TMY) / 2 + .5, z, L, 1, .2, 0, 0, th)); ctx.cols.push([WRAMP.x0, WRAMP.x1, z - .1, z + .1]) } }
      /* Dome of the Rock: base, octagon with turquoise tile bands, drum, golden dome, finial */
      const dy = TMY, R = DOME.R;
      B.dome.add(jer, new THREE.CylinderGeometry(R + 2, R + 2.4, 1, 24), 0xe8dfc8, M(DOME.x, dy + .5, DOME.z)); ctx.circles.push([DOME.x, DOME.z, R + 2.2]);
      B.dome.add(jer, new THREE.CylinderGeometry(R, R, 7, 8).rotateY(Math.PI / 8), 0xf2ecdc, M(DOME.x, dy + 4.5, DOME.z));
      B.dome.add(MT.v, new THREE.CylinderGeometry(R * 1.01, R * 1.01, 3.6, 8, 1, true).rotateY(Math.PI / 8), 0x2a7a9a, M(DOME.x, dy + 5.6, DOME.z), .08);
      for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, wx = DOME.x + Math.cos(a) * R * .93, wz = DOME.z + Math.sin(a) * R * .93; B.dome.add(MT.v, BG.box, 0x1a3a5a, M(wx, dy + 5.4, wz, 1.2, 2.2, .3, 0, -a + Math.PI / 2, 0)) }
      B.dome.add(MT.v, new THREE.CylinderGeometry(R * .66, R * .7, 3, 16), 0x2a6a8a, M(DOME.x, dy + 9.5, DOME.z), .08);
      { const g = new THREE.Mesh(new THREE.SphereGeometry(R * .7, 28, 14, 0, TAU, 0, Math.PI / 2), goldMat); g.position.set(DOME.x, dy + 11, DOME.z); g.scale.y = 1.1; g.castShadow = q === 2; grp.add(g) }
      B.dome.add(goldMat, new THREE.CylinderGeometry(.18, .18, 3, 8), 0xe8c040, M(DOME.x, dy + 19.2, DOME.z), .4); B.dome.add(goldMat, new THREE.TorusGeometry(.7, .12, 6, 16, Math.PI * 1.4), 0xe8c040, M(DOME.x, dy + 21.1, DOME.z, 1, 1, 1, 0, 0, Math.PI * .8), .5);
      /* arcades (qanatir) at the top of the dome's steps */
      for (const [ax, az, ry] of [[DOME.x, DOME.z - R - 5, 0], [DOME.x, DOME.z + R + 5, 0], [DOME.x - R - 5, DOME.z, Math.PI / 2], [DOME.x + R + 5, DOME.z, Math.PI / 2]]) {
        for (let k = -1; k <= 1; k++) { const px = ax + Math.cos(ry) * k * 2.8, pz = az - Math.sin(ry) * k * 2.8; B.dome.add(MT.v, A.geo('cyl'), 0xf2ecdc, M(px, dy + 2, pz, .3, 4, .3)); ctx.circles.push([px, pz, .4]) }
        B.dome.add(MT.v, BG.box, 0xe8dfc8, M(ax, dy + 4.2, az, ry ? .8 : 7, .5, ry ? 7 : .8)) }
      /* Al-Aqsa with its lead-grey dome */
      box(B.dome, jer, 0xe8dfc8, AQSA.x0, AQSA.x1, dy, dy + 8, AQSA.z0, AQSA.z1); solid(AQSA.x0, AQSA.x1, AQSA.z0, AQSA.z1);
      for (let x = AQSA.x0 + 1.5; x < AQSA.x1 - 1; x += 2.6) B.dome.add(MT.v, A.geo('arc'), 0x8a7a5a, M(x, dy + 3.2, AQSA.z0 - .05, 1, 1.2, 1), 0);
      B.dome.add(MT.v, new THREE.CylinderGeometry(3.4, 3.6, 1.6, 16), 0xd8d0b4, M((AQSA.x0 + AQSA.x1) / 2, dy + 8.8, (AQSA.z0 + AQSA.z1) / 2));
      domeOn(B.dome, (AQSA.x0 + AQSA.x1) / 2, (AQSA.z0 + AQSA.z1) / 2, 3.3, 0x7a8a98, dy + 9.6);
      /* arcades + minarets at the corners, cypress planted later */
      for (const [x0, x1, z] of [[TM.x0 + 4, TM.x0 + 14, -80], [TM.x1 - 14, TM.x1 - 4, -80]]) { for (let x = x0; x <= x1; x += 3.3) B.dome.add(MT.v, A.geo('cyl'), 0xf2ecdc, M(x, dy + 2.2, z, .35, 4.4, .35)); B.dome.add(MT.v, BG.box, 0xe8dfc8, M((x0 + x1) / 2, dy + 4.6, z, x1 - x0 + 1, .5, 1.2)) }
      minaret(B.stone, TM.x0 + 2.5, TM.z0 + 2.5, 18); minaret(B.stone, TM.x1 - 2.5, TM.z0 + 2.5, 16); minaret(B.stone, TM.x0 + 2.5, TM.z1 - 2.5, 18); minaret(B.stone, TM.x1 - 2.5, TM.z1 - 2.5, 17);
      ctx.sign('HARAM AL-SHARIF · TEMPLE MOUNT', DOME.x, dy + 25, DOME.z, 0, 6.4, '#7ff0ff');
      ctx.sign('THE WESTERN WALL', (WW.x0 + WW.x1) / 2, TMY + 2.2, -45, 0, 5, '#ffd84a');
      /* Western Wall plaza furnishings: partition, prayer benches, menorah */
      box(B.decor, MT.wood, 0xc8b088, 26.8, 27.2, wy0, wy0 + 1.6, WW.z0, WW.z0 + 7); ctx.cols.push([26.8, 27.2, WW.z0, WW.z0 + 7]);
      for (let z = -34; z <= -27; z += 3.5) box(B.decor, MT.wood, 0x8a6a4a, 30, 38, wy0 + .35, wy0 + .5, z, z + .4);
      { const mx = WW.x0 + 2.5, mz = WW.z1 - 2, my = H(mx, mz); B.decor.add(goldMat, new THREE.CylinderGeometry(.45, .6, 1.6, 8), 0xe8c040, M(mx, my + .8, mz), .3);
        for (let k = -3; k <= 3; k++) { const r0 = Math.abs(k) * .32; B.decor.add(goldMat, new THREE.CylinderGeometry(.05, .05, 1.2 + r0, 6), 0xe8c040, M(mx + k * .32, my + 2.1 + r0 * .3, mz), .4) } ctx.circles.push([mx, mz, .7]) }
    }

    /* ---------- the Old City wall, gates, plaques ---------- */
    const wallRun = (x0, x1, z0, z1) => {   // split into short chunks so the wall follows the slope
      const alongX = x1 - x0 > z1 - z0, L = alongX ? x1 - x0 : z1 - z0, n = Math.max(1, Math.ceil(L / 10));
      for (let i = 0; i < n; i++) { const a = i / n, b = (i + 1) / n, cx0 = alongX ? x0 + L * a : x0, cx1 = alongX ? x0 + L * b : x1, cz0 = alongX ? z0 : z0 + L * a, cz1 = alongX ? z1 : z0 + L * b, y = H((cx0 + cx1) / 2, (cz0 + cz1) / 2) - 1;
        box(B.stone, jer, 0xffffff, cx0, cx1, y, y + WALLH + 1, cz0, cz1, .06);
        const segL = alongX ? cx1 - cx0 : cz1 - cz0; for (let k = 0; k + 1.1 < segL; k += 2.4) { if (alongX) box(B.stone, jer, 0xffffff, cx0 + k, cx0 + k + 1.1, y + WALLH + 1, y + WALLH + 2, cz0, cz1, .06); else box(B.stone, jer, 0xffffff, cx0, cx1, y + WALLH + 1, y + WALLH + 2, cz0 + k, cz0 + k + 1.1, .06) } }
      solid(x0, x1, z0, z1) };
    const SIDES = { n: [OC.x0, OC.x1, OC.z0, OC.z0 + WALL], s: [OC.x0, OC.x1, OC.z1 - WALL, OC.z1], w: [OC.x0, OC.x0 + WALL, OC.z0, OC.z1], e: [OC.x1 - WALL, OC.x1, OC.z0, OC.z1] };
    for (const sd in SIDES) {
      const [x0, x1, z0, z1] = SIDES[sd], alongX = sd === 'n' || sd === 's', gs = GATES.filter(g => g[3] === sd).map(g => alongX ? g[1] : g[2]).sort((a, b) => a - b);
      let cur = alongX ? x0 : z0; const end = alongX ? x1 : z1;
      for (const g of gs.concat([end + GAP])) { const a1 = g - GAP; if (a1 - cur > .5) { if (alongX) wallRun(cur, a1, z0, z1); else wallRun(x0, x1, cur, a1) } cur = g + GAP }
    }
    for (const [name, gx, gz, sd] of GATES) {
      const alongX = sd === 'n' || sd === 's', y = H(gx, gz) - 1, big = name === 'JAFFA GATE' || name === 'DAMASCUS GATE', tw = big ? 13 : 11;
      for (const s of [-1, 1]) { const tx = alongX ? gx + s * (GAP + 1.8) : gx, tz = alongX ? gz : gz + s * (GAP + 1.8), hx = alongX ? 1.8 : 2.4, hz = alongX ? 2.4 : 1.8;
        box(B.stone, jer, 0xf4ecd8, tx - hx, tx + hx, y, y + tw, tz - hz, tz + hz, .06); solid(tx - hx, tx + hx, tz - hz, tz + hz);
        for (let k = -1; k <= 1; k += 2) box(B.stone, jer, 0xf4ecd8, tx - hx * (alongX ? .4 : 1) + (alongX ? k * .9 : 0), tx + hx * (alongX ? .4 : 1) + (alongX ? k * .9 : 0), y + tw, y + tw + 1.1, tz - hz * (alongX ? 1 : .4) + (alongX ? 0 : k * .9), tz + hz * (alongX ? 1 : .4) + (alongX ? 0 : k * .9), .06) }
      /* lintel + arch over the opening (no collider: it is above head height) */
      if (alongX) box(B.stone, jer, 0xf4ecd8, gx - GAP, gx + GAP, y + 7, y + tw - 1, gz - WALL, gz + WALL, .06); else box(B.stone, jer, 0xf4ecd8, gx - WALL, gx + WALL, y + 7, y + tw - 1, gz - GAP, gz + GAP, .06);
      B.stone.add(jer, new THREE.TorusGeometry(GAP - .2, .45, 6, 14, Math.PI), 0xe8dcc0, M(gx, y + 6.6, gz, 1, 1, alongX ? 3 : 1, 0, alongX ? 0 : Math.PI / 2, 0), .06);
      /* plaques on both faces */
      const he = { 'JAFFA GATE': 'שער יפו', 'NEW GATE': 'השער החדש', 'DAMASCUS GATE': 'שער שכם', 'HEROD’S GATE': 'שער הפרחים', 'LIONS’ GATE': 'שער האריות', 'DUNG GATE': 'שער האשפות', 'ZION GATE': 'שער ציון' }[name];
      const ar = { 'JAFFA GATE': 'باب الخليل', 'NEW GATE': 'الباب الجديد', 'DAMASCUS GATE': 'باب العامود', 'HEROD’S GATE': 'باب الساهرة', 'LIONS’ GATE': 'باب الأسباط', 'DUNG GATE': 'باب المغاربة', 'ZION GATE': 'باب النبي داود' }[name];
      for (const s of [-1, 1]) { const off = WALL + .06; if (alongX) plaque(he, ar, name, gx + GAP + 1.8, y + 4.2, gz + s * off, s > 0 ? 0 : Math.PI, 2.6); else plaque(he, ar, name, gx + s * off, y + 4.2, gz + GAP + 1.8, s > 0 ? Math.PI / 2 : -Math.PI / 2, 2.6) }
    }
    /* Golden Gate (sealed) on the east wall */
    { const gz = -40, y = H(OC.x1, gz) - 1; box(B.stone, jer, 0xf4ecd8, OC.x1, OC.x1 + 3, y, y + 11, gz - 6, gz + 6, .06); solid(OC.x1, OC.x1 + 3, gz - 6, gz + 6); for (const s of [-1, 1]) domeOn(B.stone, OC.x1 + 1.5, gz + s * 3, 2, 0xd8ccb0, y + 11) }

    /* ---------- Holy Sepulchre ---------- */
    { const hy = H((HS.x0 + HS.x1) / 2, HS.z1); box(B.stone, jer, 0xd8ccb2, HS.x0, HS.x1, hy - 1, hy + 11, HS.z0, HS.z1); solid(HS.x0, HS.x1, HS.z0, HS.z1);
      domeOn(B.dome, HS.x0 + 7, (HS.z0 + HS.z1) / 2, 6, 0x8a9ab0, hy + 11); domeOn(B.dome, HS.x1 - 7, (HS.z0 + HS.z1) / 2, 3.6, 0x8a9ab0, hy + 11);
      box(B.stone, jer, 0xcdbf9e, HS.x1 - 5, HS.x1 - 1, hy, hy + 18, HS.z0 + 1, HS.z0 + 5); B.stone.add(MT.v, A.geo('hip'), 0x8a9ab0, M(HS.x1 - 3, hy + 19.4, HS.z0 + 3, 2.9, 2.8, 2.9));   // bell tower
      const fz = HS.z1 + .06, mx = (HS.x0 + HS.x1) / 2;
      for (const s of [-1, 1]) { box(B.dome, MT.v, s < 0 ? 0x3a2a1a : 0xcdbf9e, mx + s * 3 - 1.2, mx + s * 3 + 1.2, hy, hy + 3.4, fz - .05, fz + .05); B.dome.add(MT.v, A.geo('arc'), 0x8a7a5a, M(mx + s * 3, hy + 3.4, fz + .06, 1.3, 1.3, 1.3)); B.dome.add(MT.v, A.geo('arc'), 0x8a7a5a, M(mx + s * 3, hy + 7.4, fz + .06, 1, 1, 1)); box(B.dome, MT.v, 0x2a3a4a, mx + s * 3 - .8, mx + s * 3 + .8, hy + 5.6, hy + 7.4, fz - .05, fz + .05) }
      for (const [k, h] of [[0, 0], [1, .45], [2, .9], [3, 1.35]]) box(B.dome, MT.wood, 0x7a5a32, mx + 2.2, mx + 3.4, hy + 5 + h, hy + 5.06 + h, fz + .1, fz + .16);   // the immovable ladder (rungs)
      for (const s of [-1, 1]) box(B.dome, MT.wood, 0x7a5a32, mx + 2.8 + s * .6 - .04, mx + 2.8 + s * .6 + .04, hy + 4.6, hy + 6.6, fz + .1, fz + .2);
      for (const [cx, cz] of [[HSF.x0 + 1, HSF.z1 - 1], [HSF.x1 - 1, HSF.z1 - 1]]) { B.dome.add(MT.v, A.geo('cyl'), 0xd8ccb0, M(cx, H(cx, cz) + 2.5, cz, .45, 5, .45)); ctx.circles.push([cx, cz, .6]) }
      signAt('CHURCH OF THE HOLY SEPULCHRE', mx, 13.2, HS.z1 + .4, 0, 6, '#9ad8ff') }

    /* ---------- Tower of David citadel ---------- */
    { const ty = H((TD.x0 + TD.x1) / 2, (TD.z0 + TD.z1) / 2); box(B.stone, jer, 0xe8dfc8, TD.x0, TD.x1, ty - 1, ty + 8, TD.z0, TD.z1, .05); solid(TD.x0, TD.x1, TD.z0, TD.z1);
      for (const [cx, cz] of [[TD.x0 + 2, TD.z0 + 2], [TD.x1 - 2.5, TD.z0 + 2.5]]) box(B.stone, jer, 0xd8ccb2, cx - 2.4, cx + 2.4, ty - 1, ty + 12, cz - 2.4, cz + 2.4, .05);
      minaret(B.stone, TD.x0 + 4, TD.z1 - 4, 22);
      signAt('TOWER OF DAVID', (TD.x0 + TD.x1) / 2, 4.6, TD.z0 - .6, Math.PI, 4.4, '#ffd84a') }
    /* ---------- the Cardo: sunken Roman street with columns ---------- */
    { for (let x = CARDO.x0 + 2; x < CARDO.x1; x += 4) for (const z of [CARDO.z0 + .4, CARDO.z1 - .4]) { B.decor.add(MT.v, A.geo('cyl'), 0xcac0a8, M(x, H(x, z) + 2.2, z, .32, 4.4, .32)); ctx.circles.push([x, z, .4]) }
      signAt('THE CARDO · Roman street', CARDO.x0 + 3, 3.4, CARDO.z1 + .4, 0, 3.6, '#ffd84a') }
    /* ---------- souk: striped canopies + stalls along the alleys ---------- */
    const SOUKC = [0xe83a3a, 0x2a8a4a, 0xffd84a, 0x3a6ad8, 0xff8a3a, 0x8a3ab8], stalls = [];
    for (let si = 1; si < SOUK.length; si++) { const a = SOUK[si - 1], b = SOUK[si], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L, ry = Math.atan2(dx, dz);
      const n = Math.max(2, Math.round(L / 4));
      for (let i = 0; i < n; i++) { const f = (i + .5) / n, cx = a[0] + dx * f, cz = a[1] + dz * f, cy = H(cx, cz) + 3.6;
        B.shuk.add(MT.roof, A.geo('hip'), SOUKC[(si + i) % SOUKC.length], M(cx, cy, cz, 2.8, 1, L / n + .4, 0, ry, 0)); for (const sd of [-1, 1]) { const px = cx - uz * sd * 2.5, pz = cz + ux * sd * 2.5; B.shuk.add(MT.v, A.geo('cyl'), 0x7a5a3a, M(px, cy - 1.8, pz, .07, 3.6, .07)) } }
      for (let d = 3; d < L - 2; d += 5) { const cx = a[0] + ux * d, cz = a[1] + uz * d; for (const sd of [-1, 1]) { const sx0 = cx - uz * sd * 3, sz0 = cz + ux * sd * 3, sy = H(sx0, sz0);
          B.shuk.add(MT.wood, BG.box, 0xffffff, M(sx0, sy + .5, sz0, 2.2, 1, .9, 0, ry, 0));
          for (let k = 0; k < 5; k++) B.shuk.add(MT.v, A.geo('cone'), [0xc8682a, 0x8a3a3a, 0x3a8a5a, 0xd8b040, 0x6a4a8a, 0xa86a3a][(si + k + d) % 6], M(sx0 + Math.sin(ry) * (k - 2) * .4, sy + 1.2, sz0 + Math.cos(ry) * (k - 2) * .4, .18, .3, .18), .05);
          ctx.circles.push([sx0, sz0, .9]); occ.push({ x0: sx0 - 1.1, x1: sx0 + 1.1, z0: sz0 - 1.1, z1: sz0 + 1.1 }); stalls.push({ x: sx0, z: sz0 }) } } }
    signAt('OLD CITY SOUK', -14, 4.6, DPLAZA.z1 + 1, Math.PI, 4.4, '#ffb04a');
    /* ---------- outside Damascus Gate: ka'ak carts + the bus stop ---------- */
    const carts = [];
    { for (const cx of [-28, -23, -4]) { const cz = OC.z0 - 8, gy = H(cx, cz); B.decor.add(MT.wood, BG.box, 0xffffff, M(cx, gy + .7, cz, 2.2, 1.4, 1.4)); B.decor.add(MT.roof, A.geo('hip'), SOUKC[(cx + 30) % 6 | 0], M(cx, gy + 2.4, cz, 1.9, .7, 1.5));
        for (let j = 0; j < 5; j++) B.decor.add(MT.v, A.geo('ring'), 0xd8a050, M(cx - .8 + j * .4, gy + 1.5, cz + .1, .16, .16, .05, Math.PI / 2, 0, 0)); solid(cx - 1.2, cx + 1.2, cz - .8, cz + .8); carts.push([cx, cz + 1.8]) }
      signAt('KA’AK · sesame bread', -25.5, 3.8, OC.z0 - 9.4, Math.PI, 3.4, '#ffd84a');
      const by = H(BUSSTOP.x, BUSSTOP.z); box(B.decor, MT.shiny, 0x2a8a4a, BUSSTOP.x - .15, BUSSTOP.x + .15, by, by + 3.4, BUSSTOP.z - .8, BUSSTOP.z + .8); B.decor.add(MT.v, BG.box, 0x2a8a4a, M(BUSSTOP.x, by + 3.6, BUSSTOP.z, .2, .9, 1.6), .6); ctx.circles.push([BUSSTOP.x, BUSSTOP.z, .4]);
      box(B.decor, MT.shiny, 0x8a9aa8, BUSSTOP.x - 3, BUSSTOP.x + 3, by + 2.6, by + 2.75, BUSSTOP.z - 2.4, BUSSTOP.z - .9); signAt('BUS 486 · DEAD SEA · ים המלח', BUSSTOP.x + 5, 2.6, BUSSTOP.z - 2, 0, 4.2, '#9ad8ff') }

    /* ---------- Jaffa Road: light rail, stops, City Hall, Mahane Yehuda ---------- */
    const STOPS = [['Mahane Yehuda', 'Mahane Yehuda', -204], ['Jaffa Center', 'Jaffa Center', -170], ['City Hall', 'Ayuntamiento', -136]];
    { for (let x = JR.x0; x < JR.x1; x += 2) { const y = H(x, TRAM_Z); for (const o of [-.72, .72]) box(B.decor, MT.shiny, 0x8a8a90, x, x + 2.02, y + .02, y + .1, TRAM_Z + o - .05, TRAM_Z + o + .05) }
      for (let x = JR.x0 + 4; x < JR.x1; x += 14) { const y = H(x, TRAM_Z - 2.6); B.decor.add(MT.v, A.geo('cyl'), 0x5a5a5a, M(x, y + 3, TRAM_Z - 2.6, .09, 6, .09)); B.decor.add(MT.v, BG.box, 0x5a5a5a, M(x, y + 5.9, TRAM_Z - 1.3, .06, .06, 2.6)); ctx.circles.push([x, TRAM_Z - 2.6, .2]) }
      STOPS.forEach(([en, es, x]) => { const z = JR.z - 5.6, y = H(x, z); box(B.decor, MT.shiny, 0x9aa8b8, x - 3, x + 3, y + 2.6, y + 2.75, z - .8, z + .8); for (const s of [-1, 1]) { box(B.decor, MT.shiny, 0x6a6a72, x + s * 2.8 - .06, x + s * 2.8 + .06, y, y + 2.6, z - .06, z + .06); ctx.circles.push([x + s * 2.8, z, .2]) }
        NIGHT.add(MT.v, BG.box, 0xd8202a, M(x, y + 3.1, z, 1.6, .5, .1), 1); ctx.sign(en.toUpperCase(), x, y + 3.6, z - .2, Math.PI, 2.6, '#ff6a6a') }) }
    /* City Hall (Safra Square): flag poles + the hall */
    { for (let k = 0; k < 4; k++) { const fx = CITYHALL.x0 + 6 + k * 5.5, fz = CITYHALL.z0 + 3, y = H(fx, fz); B.decor.add(MT.shiny, A.geo('cyl'), 0xc8c8c8, M(fx, y + 5, fz, .1, 10, .1)); B.decor.add(MT.v, BG.box, [0x2a4ab8, 0xf2f0ea, 0xe8c040, 0x2a8a4a][k], M(fx + .9, y + 9.2, fz, 1.8, 1.1, .04)); ctx.circles.push([fx, fz, .2]) }
      signAt('SAFRA SQUARE · CITY HALL', (CITYHALL.x0 + CITYHALL.x1) / 2, 4, CITYHALL.z0 + .5, Math.PI, 5, '#9ad8ff') }
    /* Mahane Yehuda: roofed hall over the middle alley + produce stalls */
    { const cz = (SHUK.z0 + SHUK.z1) / 2, sy = H((SHUK.x0 + SHUK.x1) / 2, cz);
      B.shuk.add(MT.roof, BG.box, 0x8a9aa0, M((SHUK.x0 + SHUK.x1) / 2, sy + 5, cz, SHUK.x1 - SHUK.x0, .25, 8));
      for (let x = SHUK.x0 + 2; x < SHUK.x1; x += 6) for (const s of [-1, 1]) { B.shuk.add(MT.v, A.geo('cyl'), 0x5a5a5a, M(x, sy + 2.5, cz + s * 3.8, .1, 5, .1)); ctx.circles.push([x, cz + s * 3.8, .2]) }
      for (let x = SHUK.x0 + 4; x < SHUK.x1 - 2; x += 5.5) for (const s of [-1, 1]) { const z0 = cz + s * 3, y = H(x, z0); B.shuk.add(MT.wood, BG.box, 0xffffff, M(x, y + .45, z0, 3.6, .9, 1.3));
        for (let k = 0; k < 6; k++) B.shuk.add(MT.v, BG.sph, [0xe83a3a, 0xff8a2a, 0xffd84a, 0x6ab83a, 0x8a3a6a, 0xd8a050][(k + (x | 0)) % 6], M(x - 1.4 + k * .56, y + 1.05, z0, .26, .22, .26), .05);
        ctx.cols.push([x - 1.8, x + 1.8, z0 - .65, z0 + .65]); occ.push({ x0: x - 1.8, x1: x + 1.8, z0: z0 - .65, z1: z0 + .65 }) }
      signAt('MAHANE YEHUDA · שוק מחנה יהודה', (SHUK.x0 + SHUK.x1) / 2, 5.8, SHUK.z1 - 1, Math.PI, 6, '#ffd84a') }
    /* ---------- Mount Zion: the round abbey with its conical roof ---------- */
    { const zy = H(ZIONM.x, ZIONM.z); B.stone.add(jer, new THREE.CylinderGeometry(8, 8, 11, 20), 0xd8ccb2, M(ZIONM.x, zy + 4.5, ZIONM.z)); B.stone.add(MT.v, new THREE.ConeGeometry(9, 6, 20), 0x5a6a7a, M(ZIONM.x, zy + 13, ZIONM.z)); ctx.circles.push([ZIONM.x, ZIONM.z, 8.4]);
      box(B.stone, jer, 0xd8ccb2, ZIONM.x + 9, ZIONM.x + 13, zy - 1, zy + 20, ZIONM.z - 2, ZIONM.z + 2); B.stone.add(MT.v, new THREE.ConeGeometry(2.6, 4, 4).rotateY(Math.PI / 4), 0x5a6a7a, M(ZIONM.x + 11, zy + 22, ZIONM.z)); solid(ZIONM.x + 9, ZIONM.x + 13, ZIONM.z - 2, ZIONM.z + 2);
      signAt('MOUNT ZION', ZIONM.x, 3, ZIONM.z - 11, Math.PI, 4, '#9ad8ff') }
    /* ---------- Mount of Olives + Kidron ---------- */
    { for (const [cx, cz, r0, col] of [[116, -42, 4.5, 0x9ab8c8], [140, -30, 3.6, 0xe8c040], [150, -10, 3.2, 0x9ab8c8]]) { const cy = H(cx, cz); box(B.stone, jer, 0xd8ccb2, cx - r0 - 2, cx + r0 + 2, cy - 1, cy + 6, cz - r0 - 2, cz + r0 + 2); solid(cx - r0 - 2, cx + r0 + 2, cz - r0 - 2, cz + r0 + 2);
        if (col === 0xe8c040) for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; B.dome.add(goldMat, A.geo('onion'), 0xe8c040, M(cx + (k ? Math.cos(a) * 3 : 0), cy + 6, cz + (k ? Math.sin(a) * 3 : 0), k ? 1.1 : 1.6, k ? 2.2 : 3, k ? 1.1 : 1.6), .3) }
        else domeOn(B.dome, cx, cz, r0, col, cy + 6) }
      signAt('MOUNT OF OLIVES', 108, 3.4, -24, -Math.PI / 2, 4.6, '#9ad8ff');
      for (const [tx, tz, s] of [[KIDRON.x - 6, 10, 3], [KIDRON.x + 4, -2, 2.6], [KIDRON.x - 3, 26, 2.4]]) { const ty = H(tx, tz); box(B.stone, jer, 0xcabf9e, tx - s, tx + s, ty - .5, ty + s * 1.6, tz - s, tz + s); B.stone.add(jer, new THREE.ConeGeometry(s, s * 1.6, 10), 0xcabf9e, M(tx, ty + s * 2.4, tz)); solid(tx - s, tx + s, tz - s, tz + s) } }
    /* ---------- the Apeverse portal ---------- */
    { const py = H(PORTAL.x, PORTAL.z), portal = new THREE.Group(); portal.position.set(PORTAL.x, py + 1.7, PORTAL.z); portal.rotation.y = Math.PI / 2; grp.add(portal);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.3, .14, 10, 40), new THREE.MeshBasicMaterial({ color: 0xb07aff })); portal.add(ring);
      const disc = new THREE.Mesh(new THREE.CircleGeometry(1.25, 40), new THREE.MeshBasicMaterial({ color: 0x7a3aff, transparent: true, opacity: .45, side: THREE.DoubleSide, depthWrite: false })); portal.add(disc);
      ctx.upd.push((dt, t) => { ring.rotation.z = t * .8; disc.material.opacity = .35 + Math.sin(t * 2) * .12; disc.material.color.setHSL((t * .05) % 1, .8, .5) }); ctx.circles.push([PORTAL.x, PORTAL.z, 1]);
      for (const s of [-1, 1]) { box(B.decor, MT.stone, 0x9a8a7a, PORTAL.x - .3, PORTAL.x + .3, py, py + 4.4, PORTAL.z + s * 2.2 - .3, PORTAL.z + s * 2.2 + .3); ctx.circles.push([PORTAL.x, PORTAL.z + s * 2.2, .5]) }
      ctx.sign('PORTAL TO APE TOWN', PORTAL.x, py + 5.6, PORTAL.z, Math.PI / 2, 3.6, '#d8a0ff') }

    /* ======================= named characters + interactions (positions reserved before the houses are placed) ======================= */
    const NPC = { dalia: [-62, 12, -Math.PI / 2], yossi: [-97, 15, 0], karim: [8, -36, -Math.PI / 2], miriam: [-206, -21, 0], elias: [-60, -38, Math.PI / 2] };
    const SPOTS = [['western_wall', 'Stand at the Western Wall', 'Quédate ante el Muro Occidental', 'You place your palm on stones polished by centuries. The paper notes flutter; somebody nearby is singing quietly.', 'Apoyas la mano en piedras pulidas por siglos. Las notas de papel tiemblan; alguien canta bajito.', 21, -38],
      ['sepulchre', 'Visit the Holy Sepulchre', 'Visita el Santo Sepulcro', 'Candlelight, incense, marble, prayers in six languages at once. The ladder above the door has not moved in a century.', 'Velas, incienso, mármol, rezos en seis idiomas a la vez. La escalera sobre la puerta lleva un siglo sin moverse.', -42, -37],
      ['dome', 'Admire the Dome of the Rock', 'Admira la Cúpula de la Roca', 'The golden dome holds the sun like a bowl. The turquoise tiles hum with colour.', 'La cúpula dorada sostiene el sol como un cuenco. Los azulejos turquesa vibran de color.', DOME.x, DOME.z + DOME.R + 8],
      ['tower', 'Look up at the Tower of David', 'Contempla la Torre de David', 'The citadel’s tall minaret catches the light. Herod’s stones below, Ottoman ones above — typical Jerusalem.', 'El alto minarete de la ciudadela atrapa la luz. Piedras de Herodes abajo, otomanas arriba: muy de Jerusalén.', -57, 14],
      ['shuk', 'Taste Mahane Yehuda', 'Prueba Mahane Yehuda', 'Spices, fresh bread, chocolate, shouts of “motek!”. The market breathes around you.', 'Especias, pan, chocolate, gritos de “¡motek!”. El mercado respira a tu alrededor.', -196, -21]];
    const SHOPS = [
      [8, -33.6, 'Karim’s spices: za’atar halva (8)', 'Especias de Karim: halva con za’atar (8)', 8, 'halva', 'A sweet crumble of sesame with a pinch of thyme.', 'Un dulce de sésamo con una pizca de tomillo.'],
      [-14, -60, 'Souk café: mint tea (5)', 'Café del zoco: té de menta (5)', 5, 'mint_tea', 'Sweet, hot, endless refills.', 'Dulce, caliente, con rellenos infinitos.'],
      [-14, -48, 'Souk: hummus plate (15)', 'Zoco: plato de hummus (15)', 15, 'hummus', 'Warm, silky, olive oil, a pile of pita.', 'Caliente, sedoso, aceite de oliva y una montaña de pita.'],
      [-88, 15, 'Mamilla café: cardamom coffee (6)', 'Café de Mamilla: café con cardamomo (6)', 6, 'cardamom_coffee', 'Small cup, big wake-up.', 'Taza pequeña, despertar grande.'],
      [-106, 15, 'Ceramics: Armenian tile (45)', 'Cerámica: azulejo armenio (45)', 45, 'armenian_tile', 'Cobalt and turquoise, painted by hand.', 'Cobalto y turquesa, pintado a mano.'],
      [-112, 15, 'Olive-wood carver: camel (30)', 'Tallista: camello de olivo (30)', 30, 'olive_camel', 'It smells faintly of the tree it came from.', 'Huele un poco al árbol del que salió.'],
      [-202, -21, 'Miriam’s bakery: rugelach (10)', 'Panadería de Miriam: rugelach (10)', 10, 'rugelach', 'Still warm. “Motek!”', 'Aún caliente. “¡Motek!”'],
      [-222, -21, 'Shuk falafel: pita (12)', 'Falafel del mercado: pita (12)', 12, 'falafel', 'Crunch, tahini, pickles. Perfect.', 'Crujiente, tahini, encurtidos. Perfecto.'],
      [-186, -21, 'Juice stand: pomegranate (10)', 'Zumo: granada (10)', 10, 'pomegranate', 'Deep red, pressed while you wait.', 'Rojo intenso, exprimido al momento.'],
      [-160, 5.6, 'Jaffa Road café: shakshuka (18)', 'Café de Jaffa: shakshuka (18)', 18, 'shakshuka', 'Bubbling tomatoes, soft eggs, bread for dipping.', 'Tomate burbujeante, huevos tiernos y pan para mojar.']];
    /* clear zones: houses never cover a character, a checkpoint or a shop counter */
    const KEEP = [];
    for (const k in NPC) KEEP.push([NPC[k][0], NPC[k][1], 4]);
    for (const s of SPOTS) KEEP.push([s[5], s[6], 3.5]); for (const s of SHOPS) KEEP.push([s[0], s[1], 3]); for (const c of carts) KEEP.push([c[0], c[1], 2.5]);
    KEEP.push([PORTAL.x, PORTAL.z, 6], [BUSSTOP.x, BUSSTOP.z, 5]);
    for (const g of GATES) KEEP.push([g[1], g[2], 10]);
    const CLEAR = [WW, HSF, JPLAZA, DPLAZA, CARDO, MAM, SHUK, CITYHALL, { x0: MUGH.x0 - 2, x1: MUGH.x1 + 3, z0: MUGH.z0, z1: MUGH.z1 + 3 }, { x0: WRAMP.x0 - 4, x1: WRAMP.x1, z0: WRAMP.z0 - 1, z1: WRAMP.z1 + 1 }, { x0: TD.x0 - 2, x1: TD.x1 + 2, z0: TD.z0 - 6, z1: TD.z0 }];
    const rectFree = (x0, x1, z0, z1) => {
      if (occ.some(o => x0 < o.x1 + .4 && x1 > o.x0 - .4 && z0 < o.z1 + .4 && z1 > o.z0 - .4)) return false;
      if (CLEAR.some(o => x0 < o.x1 && x1 > o.x0 && z0 < o.z1 && z1 > o.z0)) return false;
      for (const [cx, cz, r0] of KEEP) { const nx = Math.max(x0, Math.min(cx, x1)), nz = Math.max(z0, Math.min(cz, z1)); if (Math.hypot(cx - nx, cz - nz) < r0) return false }
      for (let i = 0; i <= 4; i++) for (let j = 0; j <= 4; j++) { const x = x0 + (x1 - x0) * i / 4, z = z0 + (z1 - z0) * j / 4; if (roadDist(x, z) < .6 || navDist(x, z) < 2.6 || inKidron(x, z)) return false }
      return true;
    };

    /* ---------- houses: Jerusalem stone, flat roofs or small domes, arched windows (glow at night) ---------- */
    const house = (b, x, z, w, d, h, col, domed) => {
      const x0 = x - w / 2, x1 = x + w / 2, z0 = z - d / 2, z1 = z + d / 2; if (!rectFree(x0, x1, z0, z1)) return false;
      const yy = Math.min(H(x0, z0), H(x1, z0), H(x0, z1), H(x1, z1)) - .6, top = Math.max(H(x0, z0), H(x1, z0), H(x0, z1), H(x1, z1)) + h;
      box(b, jer, col, x0, x1, yy, top, z0, z1); solid(x0, x1, z0, z1);
      if (domed) domeOn(b, x, z, Math.min(w, d) * .36, 0xe8dcc0, top); else { box(b, jer, col, x0 - .2, x1 + .2, top, top + .35, z0 - .2, z1 + .2); if (rng() < .5) { b.add(MT.v, A.geo('cyl'), 0x2a2a2a, M(x + w * .25, top + .9, z, .45, 1.1, .45)); b.add(MT.shiny, BG.box, 0x2a3a5a, M(x - w * .2, top + .7, z, 1.6, .06, 1.1, -.6, 0, 0)) } }
      const floors = Math.max(1, Math.round((top - yy - .6) / 3.2)), nW = Math.max(1, Math.floor(w / 2.8));
      for (let f = 0; f < floors; f++) for (let i = 0; i < nW; i++) for (const sd of [-1, 1]) { const wx = x0 + (i + .5) * w / nW, wz = sd > 0 ? z1 + .04 : z0 - .04, wy = yy + 1.9 + f * 3.2;
        if (wy + 1.4 > top) continue; b.add(MT.v, BG.box, 0x2a2218, M(wx, wy, wz, .9, 1.3, .08)); b.add(MT.v, A.geo('arc'), 0x2a2218, M(wx, wy + .65, wz, .45, .45, .45), 0);
        if (rng() < .45) NIGHT.add(MT.v, BG.box, 0xffd890, M(wx, wy, wz + sd * .03, .8, 1.15, .04), 1) }
      return true;
    };
    const COLS = [0xe8dfc8, 0xefe6d0, 0xdfd2b4, 0xe6d8bc, 0xf2e8d4];
    /* Old City fabric: a jittered grid inside the walls; streets appear where roads, lanes and landmarks keep it clear */
    for (let gx = OC.x0 + WALL + 5; gx < OC.x1 - WALL - 4; gx += 8.5) for (let gz = OC.z0 + WALL + 5; gz < OC.z1 - WALL - 4; gz += 8.5) {
      const w = 5.6 + rng() * 2.4, d = 5.6 + rng() * 2.4, x = gx + (rng() - .5) * 1.2, z = gz + (rng() - .5) * 1.2;
      if (x - w / 2 < OC.x0 + WALL + .6 || x + w / 2 > OC.x1 - WALL - .6 || z - d / 2 < OC.z0 + WALL + .6 || z + d / 2 > OC.z1 - WALL - .6) continue;
      house(B.city, x, z, w, d, 4 + rng() * 4, COLS[rng() * COLS.length | 0], rng() < .2) }
    /* new city: Jaffa Road frontages, Mamilla shops, the blocks between */
    for (let x = JR.x0 + 6; x < JR.x1 - 4; x += 12.5) { house(B.city, x, JR.z - 13, 10.5, 9, 8 + rng() * 9, COLS[rng() * 5 | 0]); house(B.city, x, JR.z + 13, 10.5, 9, 8 + rng() * 9, COLS[rng() * 5 | 0]) }
    for (let x = MAM.x0 + 6; x < MAM.x1 - 2; x += 11) { house(B.city, x, MAM.z0 - 2.4, 10, 4.4, 5, COLS[rng() * 5 | 0]); house(B.city, x, MAM.z1 + 4.6, 10, 8, 6 + rng() * 3, COLS[rng() * 5 | 0]) }
    house(B.city, (CITYHALL.x0 + CITYHALL.x1) / 2, CITYHALL.z1 + 8, 26, 12, 18, 0xcbbf9e);
    for (let gx = XMIN + 26; gx < OC.x0 - 16; gx += 14) for (let gz = ZMIN + 24; gz < ZMAX - 24; gz += 14) { if (Math.abs(gz - JR.z) < 22) continue; house(B.city, gx + (rng() - .5) * 2, gz + (rng() - .5) * 2, 8 + rng() * 3, 8 + rng() * 3, 7 + rng() * 9, COLS[rng() * 5 | 0], rng() < .08) }
    /* East Jerusalem neighbourhood north of the walls */
    for (let gx = -60; gx < 70; gx += 11) for (let gz = ZMIN + 18; gz < OC.z0 - 20; gz += 11) house(B.city, gx + (rng() - .5) * 2, gz + (rng() - .5) * 2, 7 + rng() * 2, 7 + rng() * 2, 5 + rng() * 4, COLS[rng() * 5 | 0], rng() < .15);

    /* ---------- vegetation: cypress + olive groves (never on roads, lanes, plazas or landmarks) ---------- */
    const freeV = (x, z, pad) => x > XMIN + 6 && x < XMAX - 6 && z > ZMIN + 6 && z < ZMAX - 6 && roadDist(x, z) > pad && navDist(x, z) > pad + 1 && !occ.some(o => inRect(o, x, z, pad)) && !CLEAR.some(o => inRect(o, x, z, pad)) && !KEEP.some(k => Math.hypot(x - k[0], z - k[1]) < k[2]) && !inKidron(x, z) && !inRect(OC, x, z, 2);
    const pickV = (n, area, ok, s0, s1) => { const out = []; for (let i = 0, t = 0; i < n && t < n * 40; t++) { const x = area.x0 + rng() * (area.x1 - area.x0), z = area.z0 + rng() * (area.z1 - area.z0); if (!ok(x, z)) continue; out.push({ x, y: H(x, z), z, s: s0 + rng() * (s1 - s0), ry: rng() * TAU }); i++ } return out };
    const WORLD = { x0: XMIN, x1: XMAX, z0: ZMIN, z1: ZMAX };
    const cyp = pickV(K.n(26), WORLD, (x, z) => freeV(x, z, 2.4), 1, 1.5);
    /* cypress on the esplanade too (a few, clear of the buildings) */
    for (const [x, z] of [[20, -84], [30, -84], [52, -84], [60, -60], [56, -76], [18, -64]]) cyp.push({ x, y: TMY, z, s: 1.2, ry: 0 });
    cyp.forEach(p => ctx.circles.push([p.x, p.z, .45]));
    K.scatter(ctx, K.merge([[BG.cyl, 0x5a4a32, M(0, .6, 0, .16, 1.2, .16)], [BG.cone, 0x2a4a2a, M(0, 4.2, 0, .95, 7.2, .95)], [BG.sph, 0x2f5230, M(0, 2.4, 0, .85, 1.6, .85)]]), K.floraMat(.004), cyp, { far: K.far(false), cell: 70 });
    const olive = pickV(K.n(34), { x0: OLIV.x - 55, x1: OLIV.x + 55, z0: OLIV.z - 60, z1: OLIV.z + 60 }, (x, z) => Math.hypot(x - OLIV.x, z - OLIV.z) < 58 && freeV(x, z, 3), 1.1, 1.8)
      .concat(pickV(K.n(12), WORLD, (x, z) => freeV(x, z, 3), 1, 1.6));
    olive.forEach(p => ctx.circles.push([p.x, p.z, .5]));
    K.scatter(ctx, K.merge([[BG.cyl, 0x6a5a42, M(0, .9, 0, .2, 1.8, .2, .12, 0, .1)], [BG.ico, 0x7a8a5a, M(.25, 2.05, .1, 1.1, .75, 1.0)], [BG.ico0, 0x8a9a66, M(-.55, 1.6, -.3, .75, .55, .7)]]), K.floraMat(.004), olive, { far: K.far(false), cell: 70 });
    K.field(ctx, K.species.bush(0x5a6a3a, 0xc8b860), K.floraMat(.02), K.n(36), WORLD, { H, s0: .7, s1: 1.2, shadow: false, cell: 64, ok: (x, z) => freeV(x, z, 1.4) });
    K.field(ctx, K.species.flower(0xe86a8a, 0xc8a030), K.floraMat(.1), K.n(30), WORLD, { H, s0: .7, s1: 1.2, shadow: false, cell: 48, far: K.far(true), ok: (x, z) => freeV(x, z, 1.2) });

    /* ======================= people ======================= */
    const crew = {};
    const spawn = (id, role, seed, anim) => { const [x, z, yaw] = NPC[id], n = AV.npc.spawn(ctx, id, { x, z, yaw, body: C.regional.body(role, seed), H: SURF, r: 2.6, anim, speed: 1.2 }); n.tag.position.y = 2.25; n.bub.position.y = 2.95; crew[id] = n; return n };
    spawn('dalia', 'guide', 11); spawn('yossi', 'business', 22, (n, dt, t, d, talking) => { if (!n.path && !talking) n.g.userData.aR.rotation.x = -1.9 + Math.sin(t * 3) * .06 });
    spawn('karim', 'vendor', 33, (n, dt, t, d, talking) => { if (!n.path && !talking) n.g.userData.aR.rotation.x = -.8 + Math.sin(t * 1.4) * .12 });
    spawn('miriam', 'businesswoman', 44); spawn('elias', 'elder', 55);
    /* soft-body residents at the hotspots (priority order: Low gets the first few) */
    const HOT = [['business', -150, 6.4, 'idle', 0], ['soldier', -168, -8.4, 'idle', Math.PI], ['orthodox', 24, -40, 'idle', Math.PI], ['vendor', -8, -40, 'idle', -Math.PI / 2], ['student', -165, 5.6, 'wander', 0], ['pilgrim', -42, -35, 'wander', 0], ['hijabi', -14, -82, 'wander', 0],
      ['businesswoman', -128, 22, 'wander', 0], ['soldier', -171, -8.4, 'idle', Math.PI], ['monk', -40, -20, 'wander', 0], ['embroidered', -8, -84, 'idle', Math.PI], ['nun', -46, 50, 'wander', 0], ['elder', -60, 8, 'idle', Math.PI / 2], ['pilgrim', 34, -30, 'wander', 0]];
    AV.beings.spawn(ctx, HOT.slice(0, AV.beings.n(ctx, 4, 8, 14)).map(([role, x, z, mode, yaw], i) => C.regional.being(role, x, z, 500 + i * 17, { mode, yaw, y0: SURF(x, z), area: { x, z, r: 6 } })));
    /* instanced street crowd: walk the pedestrian graph, follow the terrain */
    const nodes = [], edges = [];
    for (const pl of NAVL) { let prev = null; for (const [x, z] of pl) { let id = nodes.findIndex(n => Math.hypot(n[0] - x, n[1] - z) < .8); if (id < 0) { nodes.push([x, z]); id = nodes.length - 1 } if (prev != null && prev !== id) edges.push([prev, id]); prev = id } }
    const NAV = CY.nav(nodes, edges), crowd = CY.crowd(ctx, { H });
    const VLIST = ['man', 'woman', 'tourist', 'suit', 'orthodox', 'keff', 'hijab', 'robe', 'woman', 'tourist', 'monk', 'nun', 'suit', 'man'];
    for (let i = 0; i < [18, 32, 48][q]; i++) { const v = VLIST[i % VLIST.length], n0 = nodes[rng() * nodes.length | 0]; crowd.add({ v, x: n0[0], z: n0[1], nav: NAV, idleProb: .22, cols: C.regional.walkCols(v, rng) || undefined }) }
    /* off-duty soldiers waiting for the light rail at Jaffa Center, vendors sitting in the souk */
    for (const [x, z, yaw] of [[-173, -8, Math.PI], [-167, -8.2, Math.PI]]) crowd.add({ v: 'soldier', x, z, yaw, mode: 'talk', cols: C.regional.walkCols('soldier', rng) });
    for (const st of stalls.filter((_, i) => i % 5 === 2).slice(0, 6)) crowd.add({ v: rng() < .5 ? 'keff' : 'man', x: st.x, z: st.z, yaw: 0, mode: 'idle', cols: C.regional.walkCols('keff', rng) || undefined });
    crowd.build();
    /* traffic: cars + green city buses on Jaffa Road, the light rail on its grass track */
    const CARC = [0xf2f2f0, 0xe8e6e0, 0xb8bcc0, 0x5a5e62, 0x15171a, 0x1f3e72, 0x9a1a1a];
    CY.traffic(ctx, [{ pts: [[JR.x0 + 6, CAR_Z], [JR.x1 - 4, CAR_Z]], off: 1.6, w: 6.4 }], [{ type: 'car', cols: CARC, n: [2, 4, 6][q], speed: 7 }, { type: 'bus', col: 0x2a8a4a, n: [1, 1, 2][q], speed: 5.5 }], { H, density: () => { const h = hourNow(); return h < 5 ? .3 : 1 } });
    CY.traffic(ctx, [{ pts: [[JR.x0 + 8, TRAM_Z], [JR.x1 - 8, TRAM_Z]], off: 0 }], [{ type: 'tram', col: 0xe8e8ec, n: 1, speed: 6 }], { H, density: () => 1 });
    CY.birds(ctx, [{ x: (HS.x0 + HS.x1) / 2, z: HS.z0, r: 16, y: 26, n: 8 }, { x: DOME.x, z: DOME.z, r: 22, y: 34, n: 10 }, { x: OLIV.x, z: OLIV.z, r: 30, y: 36, n: 8 }]);

    /* ---------- interactions ---------- */
    const T = (x, z, r, label, fn, show) => { const t = { x, z, r, label, fn, show }; ctx.T.push(t); return t };
    const give = item => { if (AV.bag) AV.bag.add(item, 1, true); else S.items[item] = (S.items[item] || 0) + 1; AV.quests && AV.quests.check() };
    const buy = (cost, what, msg, item) => { if (!AV.txn(-cost, what)) return false; give(item); AV.toast(msg + tr(' → backpack (I)', ' → mochila (I)')); AV.audio && AV.audio.blip(660, .15, 'triangle', .12); return true };
    for (const [x, z, en, es, cost, item, men, mes] of SHOPS) T(x, z, 2.2, () => tr(en, es), () => { if (buy(cost, en.split(':')[0], tr(men, mes), item) && x < -176 && x > -232 && !S.jlm.tour.includes('shuk') && false) S.jlm.tour.push('shuk') });
    for (const [cx, cz] of carts) T(cx, cz, 2, () => tr('Ka’ak cart: sesame bread (6)', 'Carrito de ka’ak: pan de sésamo (6)'), () => buy(6, 'Ka’ak cart', tr('A long ring of sesame bread, warm in your hand.', 'Un aro largo de pan de sésamo, caliente en la mano.'), 'kaak'));
    /* tour checkpoints (glowing rings) */
    for (const [id, en, es, men, mes, x, z] of SPOTS) {
      const y = SURF(x, z), ring = new THREE.Mesh(new THREE.TorusGeometry(.6, .07, 6, 24), new THREE.MeshBasicMaterial({ color: 0x7ff0c8 })); ring.material.userData.lin = 1; ring.position.set(x, y + .1, z); ring.rotation.x = Math.PI / 2; grp.add(ring);
      ctx.upd.push((dt, t) => { ring.position.y = y + .12 + Math.sin(t * 2) * .05; ring.rotation.z = t; ring.visible = !S.jlm.tour.includes(id) });
      T(x, z, 2.4, () => tr(en, es), () => { if (S.jlm.tour.includes(id)) return; S.jlm.tour.push(id); AV.toast(tr(men, mes) + '  (' + S.jlm.tour.length + '/5)'); AV.quests && AV.quests.check(); AV.audio && AV.audio.blip(880, .3, 'sine', .12) }, () => !S.jlm.tour.includes(id));
    }
    T(30, -44, 2.2, () => tr('Tuck a note into the Western Wall', 'Mete una nota en el Muro Occidental'), () => { AV.toast(tr('You fold your wish small and push it between the giant stones, next to hundreds of others.', 'Doblas tu deseo y lo metes entre las piedras gigantes, junto a cientos de otros.')); AV.vitals && AV.vitals.add(0, 4) });
    /* Miriam hands over Yossi's briefcase */
    T(-206, -19.2, 2.4, () => (S.quests || {}).jlm_briefcase === 'active' && !(S.items.briefcase > 0) ? tr('Miriam’s counter: take Yossi’s briefcase', 'Mostrador de Miriam: coger el maletín de Yossi') : tr('Miriam’s counter', 'Mostrador de Miriam'),
      () => { if ((S.quests || {}).jlm_briefcase === 'active' && !(S.items.briefcase > 0)) { give('briefcase'); AV.toast(tr('Miriam: “There. And tell that boy to EAT something.”', 'Miriam: “Ten. Y dile a ese chico que COMA algo.”')) } else AV.toast(tr('Trays of rugelach, flour everywhere, and Miriam humming.', 'Bandejas de rugelach, harina por todas partes y Miriam tarareando.')) });
    /* light rail rides */
    for (const [en, es, x] of STOPS) T(x, JR.z - 5.6, 2.6, () => tr('Light rail · ', 'Tranvía · ') + tr(en, es) + tr(': ride (3 credits)', ': viajar (3 créditos)'), () => {
      const p = AV.panel('cmp', '<b>' + tr('Jerusalem Light Rail', 'Tranvía de Jerusalén') + '</b><div class="note">' + tr('3 credits per ride. Mind the gap.', '3 créditos por viaje. Cuidado con el hueco.') + '</div><div class="grid">' + STOPS.filter(s => s[2] !== x).map(s => '<button data-x="' + s[2] + '">' + tr(s[0], s[1]) + '</button>').join('') + '</div><button data-close>' + tr('Close', 'Cerrar') + '</button>');
      p.querySelectorAll('[data-x]').forEach(b => b.onclick = () => { const tx = +b.dataset.x; if (!AV.txn(-3, 'Light rail')) return; AV.closePanel('cmp'); AV.fadeTo(1, 350); AV.audio && AV.audio.blip(660, .2, 'sine', .1);
        setTimeout(() => { const P = AV.P, sp = AV.safeSpot(AV.W, tx + 2, JR.z - 7.2); P.x = sp[0]; P.z = sp[1]; P.y = AV.W.surface(P.x, P.z) || 0; P.vx = P.vz = 0; S.time += 6; AV.fadeTo(0, 500); AV.toast(tr('“Next stop: ', '“Próxima parada: ') + tr(STOPS.find(s => s[2] === tx)[0], STOPS.find(s => s[2] === tx)[1]) + '.”') }, 900) }) });
    /* bus to the Dead Sea + the portal */
    T(BUSSTOP.x, BUSSTOP.z + 1.6, 2.6, () => tr('Bus 486 to the Dead Sea (8 credits)', 'Autobús 486 al Mar Muerto (8 créditos)'), () => { if (!AV.txn(-8, 'Bus to the Dead Sea')) return; AV.audio && AV.audio.blip(392, .3, 'sine', .1); AV.travel('judean_desert', 'bus') });
    T(PORTAL.x - 1.6, PORTAL.z, 2.4, () => tr('Apeverse Portal: travel to another world', 'Portal Apeverse: viajar a otro mundo'), () => { const ws = Object.keys(AV.worldDefs).filter(id => id !== 'jerusalem');
      const p = AV.panel('cmp', '<b>' + tr('Apeverse Portal', 'Portal Apeverse') + '</b><div class="grid">' + ws.map(id => '<button data-w="' + id + '">' + ((AV.worldMeta(id) || {}).name || id) + '</button>').join('') + '</div><button data-close>' + tr('Close', 'Cerrar') + '</button>');
      p.querySelectorAll('[data-w]').forEach(b => b.onclick = () => { AV.closePanel('cmp'); AV.audio && AV.audio.whoosh(); AV.travel(b.dataset.w, 'jerusalem') }) });
    /* the named characters chat to passers-by */
    { const BARKS = { dalia: [['Tours here! History included!', '¡Tours aquí! ¡Con historia!']], yossi: [['One minute! Big news coming!', '¡Un minuto! ¡Viene una noticia enorme!']], karim: [['Za’atar! Coffee! Welcome!', '¡Za’atar! ¡Café! ¡Bienvenidos!']], miriam: [['Rugelach, motek!', '¡Rugelach, motek!']], elias: [['Hand-painted. One of a kind.', 'Pintado a mano. Pieza única.']] };
      let acc = 0; ctx.upd.push(dt => { acc += dt; if (acc < 18) return; acc = 0; if (AV.blocking()) return; const ids = Object.keys(BARKS), id = ids[Math.random() * ids.length | 0], n = crew[id]; if (!n) return; if (Math.hypot(AV.P.x - n.g.position.x, AV.P.z - n.g.position.z) < 14) { const l = BARKS[id][0]; AV.npc.bark(n, tr(l[0], l[1])) } }) }
    ctx.upd.push(() => { if (AV.chat.open && crew[AV.chat.who] && !S.jlm.met[AV.chat.who]) { S.jlm.met[AV.chat.who] = 1; AV.quests && AV.quests.check() } });

    /* ---------- night lights + flush ---------- */
    const nightMeshes = NIGHT.flush(ctx, { noShadow: true });
    ctx.upd.push(() => { const on = (AV.nightK || 0) > .35; for (const m of nightMeshes) m.visible = on });
    for (const k in B) B[k].flush(ctx);
    return {
      name: 'Jerusalem · City of Gold', fog: [90, 430], sky: SKY, noStoners: true,
      noSmoke: (x, z) => inRect(OC, x, z, 4) || Math.hypot(x - OLIV.x, z - OLIV.z) < 50 || Math.hypot(x - ZIONM.x, z - ZIONM.z) < 20,
      surface: (x, z) => (x < XMIN + 3 || x > XMAX - 3 || z < ZMIN + 3 || z > ZMAX - 3) ? null : SURF(x, z),
      arrivals: { default: { x: OC.x0 - 7, z: 8, yaw: -Math.PI / 2 }, pipe: { x: OC.x0 - 7, z: 12, yaw: -Math.PI / 2 }, ape_gate: { x: PORTAL.x - 3, z: PORTAL.z, yaw: -Math.PI / 2 }, jerusalem: { x: PORTAL.x - 3, z: PORTAL.z, yaw: -Math.PI / 2 }, bus: { x: BUSSTOP.x + 2, z: BUSSTOP.z + 3, yaw: 0 } }, defaultArrival: 'default',
      places: [{ id: 'jaffa', name: ['Jaffa Gate', 'Puerta de Jaffa'], x: OC.x0 - 6, z: 8, yaw: -Math.PI / 2 }, { id: 'wall', name: ['Western Wall plaza', 'Plaza del Muro Occidental'], x: 22, z: -34, yaw: 0 },
        { id: 'dome', name: ['Temple Mount · Dome of the Rock', 'Explanada · Cúpula de la Roca'], x: DOME.x, z: DOME.z + DOME.R + 9, yaw: 0 }, { id: 'sepulchre', name: ['Holy Sepulchre', 'Santo Sepulcro'], x: -42, z: -35, yaw: 0 },
        { id: 'souk', name: ['Old City souk', 'Zoco de la Ciudad Vieja'], x: -14, z: -60, yaw: Math.PI }, { id: 'damascus', name: ['Damascus Gate', 'Puerta de Damasco'], x: -14, z: OC.z0 - 6, yaw: Math.PI },
        { id: 'shuk', name: ['Mahane Yehuda', 'Mahane Yehuda'], x: -196, z: -21, yaw: Math.PI / 2 }, { id: 'mamilla', name: ['Mamilla Avenue', 'Avenida Mamilla'], x: -97, z: 17, yaw: -Math.PI / 2 },
        { id: 'zion', name: ['Mount Zion', 'Monte Sion'], x: ZIONM.x, z: ZIONM.z - 14, yaw: 0 }, { id: 'olives', name: ['Mount of Olives', 'Monte de los Olivos'], x: 104, z: -22, yaw: -Math.PI / 2 }],
      chatLines: [['Every stone here has three stories, and they all disagree.', 'Cada piedra tiene tres historias y todas se contradicen.'], ['Friday afternoon the whole city smells of baking bread.', 'El viernes por la tarde toda la ciudad huele a pan.'], ['Best light: the walls at seven in the evening.', 'La mejor luz: las murallas a las siete de la tarde.'], ['The light rail is slow, but the view makes up for it.', 'El tranvía es lento, pero la vista lo compensa.']],
      musicProfile: { bpm: 92, root: 43, scale: [0, 1, 4, 5, 7, 8, 10], style: 'maqam' }
    };
  }
});

/* ---------- quests (defined at load time so saves with active tasks always list them) ---------- */
{ const Q = AV.quests, tr = AV.tr;
  Q.define('jlm_tour', { giver: 'dalia', turnIn: 'dalia', title: ['Dalia’s Grand Tour', 'El gran tour de Dalia'], hint: ['Find the 5 glowing rings: the Western Wall, the Holy Sepulchre, the Dome of the Rock, the Tower of David and Mahane Yehuda. Then talk to Dalia by Jaffa Gate.', 'Encuentra los 5 anillos brillantes: el Muro Occidental, el Santo Sepulcro, la Cúpula de la Roca, la Torre de David y Mahane Yehuda. Luego habla con Dalia junto a la Puerta de Jaffa.'],
    ready: S => ((S.jlm && S.jlm.tour) || []).length >= 5, reward: () => { AV.txn(40, 'Mission: Grand Tour'); return tr('Dalia: “A fine student of stones!” +40 credits.', 'Dalia: “¡Buen alumno de piedras!” +40 créditos.') } });
  Q.define('jlm_briefcase', { giver: 'yossi', turnIn: 'yossi', title: ['The Lost Briefcase', 'El maletín perdido'], hint: ['Yossi left his briefcase at Mahane Yehuda (light rail west along Jaffa Road). Take it from Miriam’s counter and bring it to Yossi on Mamilla.', 'Yossi dejó su maletín en Mahane Yehuda (tranvía al oeste por la calle Jaffa). Cógelo del mostrador de Miriam y llévaselo a Yossi en Mamilla.'],
    ready: S => ((S.items || {}).briefcase || 0) > 0, reward: S => { S.items.briefcase = 0; delete S.items.briefcase; AV.txn(60, 'Mission: the briefcase'); return tr('Yossi: “PITCH SAVED. You’re in the credits — slide 3.” +60 credits.', 'Yossi: “¡PITCH SALVADO! Sales en los créditos, diapositiva 3.” +60 créditos.') } });
  Q.define('jlm_kaak', { giver: 'karim', turnIn: 'karim', title: ['Ka’ak for Karim', 'Ka’ak para Karim'], hint: ['Buy a sesame ka’ak from the carts outside Damascus Gate and bring it to Karim in the souk.', 'Compra un ka’ak de sésamo en los carritos de fuera de la Puerta de Damasco y llévaselo a Karim en el zoco.'],
    ready: S => ((S.items || {}).kaak || 0) > 0, reward: S => { S.items.kaak--; AV.txn(20, 'Mission: ka’ak for Karim'); if (AV.bag) AV.bag.add('cardamom_coffee', 1, true); return tr('Karim: “Warm! Perfect! Now coffee is compulsory.” +20 credits and a coffee.', 'Karim: “¡Caliente! ¡Perfecto! Ahora el café es obligatorio.” +20 créditos y un café.') } }) }
/* ---------- world-side helpers used by dialogue (Dalia's checklist) ---------- */
AV.jlm = AV.jlm || {};
AV.jlm.SPOTS = [['western_wall', 'Western Wall', 'Muro Occidental'], ['sepulchre', 'Holy Sepulchre', 'Santo Sepulcro'], ['dome', 'Dome of the Rock', 'Cúpula de la Roca'], ['tower', 'Tower of David', 'Torre de David'], ['shuk', 'Mahane Yehuda', 'Mahane Yehuda']];
AV.jlm.tourList = function () { const done = (AV.S && AV.S.jlm && AV.S.jlm.tour) || []; return AV.jlm.SPOTS.map(([id, en, es]) => (done.indexOf(id) >= 0 ? '✔ ' : '○ ') + AV.tr(en, es)).join(' · ') };
})(window.AV);
