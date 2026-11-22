/* APEVERSE V0.9.3 - world_jungle_dub.js : Jungle Dub Party Planet (visual rebuild of the V0.9 slice).
   Same layout, interactions and positions as V0.9 (sound system, Bongo, one-drop spot, bamboo art wall, gold arch, arrivals),
   rebuilt with the shared kits: painted jungle ground, a real river with walkable bridges, a thatched sound-system stage
   with pumping woofers, light beams and a glowing dance floor, a dancing crowd, a bamboo village, a waterfall pool,
   CC0 models (palms, ferns, bushes, flowers, mushrooms, lily pads, boats, crystals) with procedural stand-ins on file:// and Low.
   Music: the real dub playlist (data/music.js) from the sound system; the procedural dub profile is the fallback. */
'use strict';
(function (AV) {
const tr = AV.tr, TAU = AV.TAU, MD = AV.media, K = AV.kit, A = AV.arch;

/* ======================= layout ======================= */
/* V0.9.8 (Stage 2): the jungle opens up — R 52 → 108 m. Beyond the old rim: Lotus Lagoon (floating bungalows), Roots Village (Rasta
   community + drum circle), Treehouse Lounge (performance zone), Healing Garden (herbs, pond, tea hut), Hidden Falls (secret chill zone). */
const R = 108, S = 232, RIV0 = 20.5, RIV1 = 24.5, POOL = { x: 0, z: -43, r: 5 }, WY = -.25;
const SX = 0, SZ = -8, DF = { x: 0, z: 1, r: 6.2 };                         // sound system + dance floor
const deg = d => d * Math.PI / 180, polar = (a, r) => [Math.cos(a) * r, Math.sin(a) * r];
const AP = (a, r) => polar(a * Math.PI / 180, r);
const ZONES = { lagoon: { c: AP(150, 82), r: 16 }, roots: { c: AP(30, 78), r: 14 }, tree: { c: AP(95, 74), r: 11 }, heal: { c: AP(-60, 75), r: 12 }, falls: { c: AP(210, 88), r: 10 } };
const LAG = { x: ZONES.lagoon.c[0], z: ZONES.lagoon.c[1], r: 15 };
const PONDS = [{ x: ZONES.heal.c[0] + 5, z: ZONES.heal.c[1] - 4, r: 4.5 }, { x: ZONES.falls.c[0] - 3, z: ZONES.falls.c[1] - 2, r: 5 }, { x: ZONES.roots.c[0] + 10, z: ZONES.roots.c[1] + 9, r: 3.5 }, { x: AP(-10, 62)[0], z: AP(-10, 62)[1], r: 4 }];
const TRAILS = [[AP(90, 33), AP(95, 48), AP(95, 64)], [AP(90, 33), AP(60, 44), AP(30, 56), AP(30, 66)], [AP(200, 33), AP(170, 45), AP(150, 56), AP(150, 64)], [AP(200, 33), AP(215, 48), AP(210, 60), AP(210, 79)], [AP(-40, 37), AP(-55, 52), AP(-60, 64)],
  /* V1.0 kit map: cinema bridge -> Mushroom Grove -> Dub Lab; waterfall pool -> Jungle Temple; south bridge -> River Bar */
  [AP(-40, 33), AP(-18, 39), AP(10, 36)], [[0, -37], AP(-112, 40)], [AP(90, 27.5), AP(118, 26.6)]];
/* V1.0 kit map places (polar degrees / radius from the dance floor) */
const V1 = { bar: AP(125, 29.5), bazaarA: AP(90, 33), bazaarB: AP(60, 44), lab: AP(10, 40), temple: AP(-115, 46), grove: AP(-18, 44.5) };
/* V1.0 Bass Check quest (kit data/quests.json dub_soundcheck): talk to the gorilla bassist -> fetch the dub plate at the Dub Lab -> bring it to the stage */
AV.quests.define('dub_bass_check', { giver: 'jd_gorilla', turnIn: 'jd_gorilla', turnName: ['the gorilla bassist at the Jungle Rave stage', 'el gorila bajista en el escenario Jungle Rave'], title: ['Bass Check', 'Prueba de bajo'],
  hint: ['Fetch the fresh dub plate from the Dub Lab (cross the cinema bridge, follow the trail past the Mushroom Grove) and bring it to the gorilla bassist on the Jungle Rave stage.', 'Recoge el dub plate en el Dub Lab (cruza el puente del cine y sigue el sendero junto a la Arboleda de Setas) y llévaselo al gorila bajista del escenario Jungle Rave.'],
  ready: S => ((S.items || {}).dub_plate || 0) > 0,
  reward() { AV.bag.remove('dub_plate'); AV.txn(45, 'Quest: Bass Check'); AV.jd && (AV.jd.cheer = AV.now() + 20); AV.vitals && AV.vitals.add(0, 15); return tr('The plate drops, the sub-bass rolls in like thunder and the whole jungle bounces. +45 credits.', 'El plato suena, el subgrave entra como un trueno y toda la jungla rebota. +45 créditos.') } });
const GAPS = [95, 30, 150, 210, -55];                                         // rim boulders leave these angles open for the trails
const faceYaw = (fx, fz, tx, tz) => Math.atan2(-(tx - fx), -(tz - fz));      // player yaw looking from f to t
const npcYaw = (fx, fz, tx, tz) => Math.atan2(tx - fx, tz - fz);            // model rotation facing t
const sstep = (a, b, v) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t) };
function segDist(x, z, a, b) { const dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz))); return Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t) }
function waterDepth(x, z) { const r = Math.hypot(x, z); let w = Math.max(Math.min(r - RIV0, RIV1 - r), POOL.r - Math.hypot(x - POOL.x, z - POOL.z), LAG.r - Math.hypot(x - LAG.x, z - LAG.z)); for (const p of PONDS) w = Math.max(w, p.r - Math.hypot(x - p.x, z - p.z)); return w }
/* V0.9 rolling hills, flattened for the central clearing and the river banks; V0.9.8: the old bowl rim becomes a walkable jungle plateau
   (gentle hills, flattened at the five zones and dipping to the lagoon / ponds), rising to a far rim only near the edge (r > 96) */
function zoneFlat(x, z) { let f = 0; for (const k in ZONES) { const Z = ZONES[k]; f = Math.max(f, 1 - sstep(Z.r * .8, Z.r + 6, Math.hypot(x - Z.c[0], z - Z.c[1]))) } return f }
function H(x, z) {
  const r = Math.hypot(x, z), wd = waterDepth(x, z);
  let h = Math.sin(x * .12) * Math.cos(z * .1) * 1.6 * Math.min(1, r / 16) * sstep(11, 17, r) * (1 - sstep(-5, -1, wd));
  if (r > 42) { const o = sstep(42, 56, r), hills = 2.2 + Math.sin(x * .07 + 1) * Math.cos(z * .06) * 2.2 * (1 - zoneFlat(x, z)); h += o * hills * (1 - sstep(-6, -1, wd)) * (1 - sstep(-4, -.5, POOL.r - Math.hypot(x - POOL.x, z - POOL.z))) }
  if (r > 96) h += Math.min(14, (r - 96) * .9);
  return h;
}
const BRIDGES = [90, -40, 200];                                              // degrees: north (to the gold arch), south-east, west
const PATHS = [
  { pts: [[0, 31], [0, 26.5]], w: 3.4 }, { pts: [[0, 18.5], [0, 7.5]], w: 3.4 }, { ring: 8.6, cx: DF.x, cz: DF.z, w: 2.2 },
  { pts: [polar(deg(-40), 18.5), [5.5, -4.5]], w: 2.6 }, { pts: [polar(deg(200), 18.5), [-7.5, -1]], w: 2.6 },
  { pts: [[-7, 5], [-12, 9], [-15, 12]], w: 2 }, { pts: [[6, 7], [10, 7.5]], w: 2 },
  { pts: [polar(deg(-40), 26.5), polar(deg(-40), 33)], w: 2.4 }, { pts: [polar(deg(200), 26.5), polar(deg(200), 33)], w: 2.4 }, { pts: [[0, -16], [0, -37]], w: 2.4 }
].concat(...TRAILS.map(t => t.slice(1).map((p, i) => ({ pts: [t[i], p], w: 2.2 }))));   /* V0.9.8: jungle trails out to the new zones */
function pathDist(x, z) { let d = 1e9; for (const p of PATHS) { if (p.ring) d = Math.min(d, Math.abs(Math.hypot(x - p.cx, z - p.cz) - p.ring) - p.w / 2); else d = Math.min(d, segDist(x, z, p.pts[0], p.pts[1]) - p.w / 2) } return d }
const HUTS = [[-14, 11, 1.9], [-17, 1, 2.1], [-13, -10, 1.8], [-5, 16.5, 1.7]];   // x, z, radius (bamboo village)
const ART = [8, 22, 36, 50].map(a => polar(deg(a), 15.5));                     // bamboo art wall: an arc facing the dance floor

/* ======================= painted textures (cached, survive world switches) ======================= */
const TX = {};
function canvasTex(w, h, draw, rep) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; t.wrapS = t.wrapT = rep ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping; t.userData = { keep: true }; return t }
function thatchTex() {
  return TX.thatch || (TX.thatch = canvasTex(256, 256, (c, w, h) => { const r = AV.rng(31); c.fillStyle = '#b48a44'; c.fillRect(0, 0, w, h);
    for (let row = 0; row < 8; row++) { const y0 = row * 32; for (let i = 0; i < 260; i++) { const x = r() * w, len = 18 + r() * 22, v = 150 + r() * 90 | 0; c.strokeStyle = 'rgba(' + v + ',' + (v * .78 | 0) + ',' + (v * .4 | 0) + ',.85)'; c.lineWidth = 1 + r() * 1.6; c.beginPath(); c.moveTo(x, y0 + r() * 6); c.lineTo(x + (r() - .5) * 5, y0 + len); c.stroke() } c.fillStyle = 'rgba(60,35,10,.35)'; c.fillRect(0, y0 + 29, w, 3) } }, true));
}
function cabinetTex() {
  return TX.cab || (TX.cab = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#1a1714'; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#6a4a2a'; c.lineWidth = 14; c.strokeRect(7, 7, w - 14, h - 14);
    for (let y = 22; y < h - 20; y += 6) { c.fillStyle = 'rgba(255,255,255,.04)'; c.fillRect(20, y, w - 40, 2) }
    c.fillStyle = '#c8a040'; [[20, 20], [w - 20, 20], [20, h - 20], [w - 20, h - 20]].forEach(p => { c.beginPath(); c.arc(p[0], p[1], 5, 0, TAU); c.fill() });
    c.font = 'bold 22px Georgia'; c.textAlign = 'center'; const g = c.createLinearGradient(60, 0, 196, 0); g.addColorStop(0, '#e83a30'); g.addColorStop(.5, '#ffd23a'); g.addColorStop(1, '#30c060'); c.fillStyle = g; c.fillText('JUNGLE DUB', 128, h - 26) }));
}
function floorTex() {
  return TX.floor || (TX.floor = canvasTex(1024, 1024, (c, w) => { const cx = w / 2, R0 = w / 2, cols = ['#c8302a', '#e8b828', '#2f9a4a', '#1a1410']; c.fillStyle = '#1a1410'; c.fillRect(0, 0, w, w);
    for (let k = 0; k < 9; k++) { const r0 = R0 * (1 - k / 9), r1 = R0 * (1 - (k + 1) / 9), n = 12 + (8 - k) * 4; for (let i = 0; i < n; i++) { const a0 = i / n * TAU, a1 = (i + 1) / n * TAU; c.fillStyle = cols[(i + k) % 3]; c.beginPath(); c.arc(cx, cx, r0 - 4, a0 + .01, a1 - .01); c.arc(cx, cx, r1 + 4, a1 - .01, a0 + .01, true); c.closePath(); c.fill() } }
    c.fillStyle = '#ffd23a'; c.beginPath(); for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, rr = i % 2 ? R0 * .07 : R0 * .13; c.lineTo(cx + Math.cos(a) * rr, cx + Math.sin(a) * rr) } c.closePath(); c.fill();
    const r = AV.rng(7); for (let i = 0; i < 5000; i++) { c.fillStyle = r() < .5 ? 'rgba(0,0,0,.18)' : 'rgba(255,255,255,.08)'; c.fillRect(r() * w, r() * w, 2, 2) } }));
}
function paintGround(N) {
  const key = 'g' + N; if (TX[key]) return TX[key];
  return TX[key] = canvasTex(N, N, (c) => {
    const r = AV.rng(53), P = v => (v + S / 2) / S * N, m = N / S;
    c.fillStyle = '#3f7a34'; c.fillRect(0, 0, N, N);
    const greens = ['#356e2e', '#4f8a3a', '#2f6a3a', '#5a9a42', '#3a7a4a', '#6a9a3a', '#2a5a2a'];
    for (let i = 0; i < 1600; i++) { const x = r() * N, y = r() * N, s = N * (.01 + r() * .04), g = c.createRadialGradient(x, y, 0, x, y, s); g.addColorStop(0, greens[i % greens.length]); g.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha = .4; c.fillStyle = g; c.fillRect(x - s, y - s, s * 2, s * 2) } c.globalAlpha = 1;
    const cell = Math.max(2, N / 512 | 0);
    for (let py = 0; py < N; py += cell) for (let px = 0; px < N; px += cell) {
      const x = px / m - S / 2, z = py / m - S / 2, wd = waterDepth(x, z), rr = Math.hypot(x, z); let col = null;
      if (wd > 0) col = wd > 1 ? '#164a48' : '#2a6a5a'; else if (wd > -1.5) col = '#a08a5a'; else if (rr > 49) col = rr > 55 ? '#4a5a3e' : '#46683a'; else if (Math.hypot(x - DF.x, z - DF.z) < 9.6) col = '#8a6a42';
      if (col) { c.fillStyle = col; c.fillRect(px, py, cell, cell) }
    }
    c.lineCap = c.lineJoin = 'round';
    const draw = (extra, col) => { c.strokeStyle = col; for (const p of PATHS) { c.lineWidth = (p.w + extra) * m; c.beginPath(); if (p.ring) c.arc(P(p.cx), P(p.cz), p.ring * m, 0, TAU); else { c.moveTo(P(p.pts[0][0]), P(p.pts[0][1])); c.lineTo(P(p.pts[1][0]), P(p.pts[1][1])) } c.stroke() } };
    draw(1.2, '#6a5030'); draw(0, '#a8835a');
    for (let i = 0; i < 30000; i++) { const x = r() * S - S / 2, z = r() * S - S / 2; if (pathDist(x, z) < -.3 || Math.hypot(x - DF.x, z - DF.z) < 9.4) { c.fillStyle = r() < .5 ? 'rgba(70,50,30,.28)' : 'rgba(230,210,170,.28)'; c.beginPath(); c.arc(P(x), P(z), (.03 + r() * .06) * m, 0, TAU); c.fill() } }   // fine gravel
    const fl = ['#ff4ad2', '#ffd23a', '#e83a30', '#7ff0ff', '#ffffff', '#ff8a3a'];
    for (let i = 0; i < 14000; i++) { const x = r() * S - S / 2, z = r() * S - S / 2; if (waterDepth(x, z) > -1.8 || pathDist(x, z) < .5 || Math.hypot(x - DF.x, z - DF.z) < 10) continue; c.fillStyle = r() < .7 ? 'rgba(20,50,20,.35)' : fl[i % fl.length]; c.globalAlpha = .5 + r() * .5; c.beginPath(); c.arc(P(x), P(z), (.1 + r() * .22) * m, 0, TAU); c.fill() } c.globalAlpha = 1;
  }, false);
}

AV.registerWorld({
  id: 'jungle_dub',
  build(ctx) {
    const q = ctx.q, rng = ctx.rng, grp = ctx.group, MT = A.mats(), walk = A.walk(), occ = [];
    const B = { stage: K.batch(), village: K.batch(), rim: K.batch(), misc: K.batch() };
    const thatch = K.floraMat(0, { map: thatchTex(), rough: .95, double: true });
    const free = (x, z, pad) => Math.hypot(x, z) < R - 3 && waterDepth(x, z) < -1.3 && pathDist(x, z) > (pad || .6) && !occ.some(o => Math.hypot(x - o[0], z - o[1]) < o[2]);
    const pick = (n, area, ok, s0, s1) => { const out = []; for (let i = 0, t = 0; i < n && t < n * 14; t++) { const a = rng() * TAU, r = area.r0 + rng() * (area.r1 - area.r0), x = (area.x || 0) + Math.cos(a) * r, z = (area.z || 0) + Math.sin(a) * r; if (!ok(x, z)) continue; out.push({ x, y: H(x, z), z, s: s0 + rng() * (s1 - s0), ry: rng() * TAU }); i++ } return out };
    MD.resetFrames();

    /* ---------- terrain: painted ground + detail grain, carved river bed ---------- */
    const seg = [100, 140, 170][q], tg = new THREE.PlaneGeometry(S, S, seg, seg); tg.rotateX(-Math.PI / 2);
    const tp = tg.attributes.position; for (let i = 0; i < tp.count; i++) { const x = tp.getX(i), z = tp.getZ(i), wd = waterDepth(x, z); tp.setY(i, H(x, z) - (wd > -.4 ? 1.8 * sstep(-.4, 1.2, wd) : 0)) } tg.computeVertexNormals();
    const gmat = new THREE.MeshStandardMaterial({ map: paintGround([1024, 2048, 2048][q]), roughness: .95 }), grain = A.tex('grain');
    gmat.onBeforeCompile = sh => { sh.uniforms.detailMap = { value: grain }; sh.fragmentShader = 'uniform sampler2D detailMap;\n' + sh.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n diffuseColor.rgb *= mix(1.0, texture2D(detailMap, vUv * 95.0).r * 1.45, .4);') };
    gmat.customProgramCacheKey = () => 'dubGround'; gmat.userData.lin = 1; const ground = new THREE.Mesh(tg, gmat); ground.receiveShadow = true; grp.add(ground);
    { const sk = new THREE.RingGeometry(S * .5 - 2, 420, 72, 4); sk.rotateX(-Math.PI / 2); const sp = sk.attributes.position; for (let i = 0; i < sp.count; i++) { const r = Math.hypot(sp.getX(i), sp.getZ(i)); sp.setY(i, 14 + (r - 114) * .05) } sk.computeVertexNormals(); grp.add(new THREE.Mesh(sk, AV.std(0x2f5a32, 1))) }

    /* ---------- water: river ring + waterfall pool, banks, bridges ---------- */
    const wopt = { deep: 0x0f5a62, shallow: 0x3ae0c0, sky: 0x9af0c8, iri: .3, opacity: .88 };
    K.waterPlane(ctx, new THREE.RingGeometry(RIV0 - .7, RIV1 + .7, 120, 1), WY, wopt);
    const pool = K.waterPlane(ctx, new THREE.CircleGeometry(POOL.r + .7, 48), WY, wopt); pool.position.x = POOL.x; pool.position.z = POOL.z;
    /* V0.9.8: Lotus Lagoon + ponds */ for (const w of [LAG].concat(PONDS)) { const m = K.waterPlane(ctx, new THREE.CircleGeometry(w.r + .7, 48), WY, wopt); m.position.x = w.x; m.position.z = w.z }
    for (const r of [RIV0, RIV1]) B.misc.add(MT.stone, new THREE.TorusGeometry(r, .3, 5, 120), 0xb8a888, K.M(0, .02, 0, 1, 1, .6, Math.PI / 2, 0, 0));
    const BCOL = [[0xe8c030, 0x30c060], [0x30c060, 0xe83a30], [0xe83a30, 0xe8c030]];
    BRIDGES.forEach((b, i) => { const p0 = polar(deg(b), RIV0 - 2), p1 = polar(deg(b), RIV1 + 2); A.bridge(B.misc, MT, ctx, walk, p0[0], p0[1], p1[0], p1[1], { w: 3.6, rise: 1.2, cRail: BCOL[i][0], cPost: BCOL[i][1] }) });
    /* lily pads + moored boats */
    const lilies = []; for (let i = 0; i < [10, 18, 26][q]; i++) { const a = rng() * TAU, r = RIV0 + .8 + rng() * (RIV1 - RIV0 - 1.6); if (BRIDGES.some(b => Math.abs(Math.atan2(Math.sin(a - deg(b)), Math.cos(a - deg(b)))) < .16)) continue; lilies.push({ x: Math.cos(a) * r, y: WY + .02, z: Math.sin(a) * r, s: 1.3 + rng(), ry: rng() * TAU }) }
    K.instModel(ctx, 'quaternius/lilypad', lilies, it => K.scatter(ctx, K.species.lotus(0xffa0d8, 0x2f8a4a), K.floraMat(0, { double: true }), it.map(o => Object.assign({}, o, { s: o.s * .7 })), { shadow: false }), { shadow: false });
    function boatFallback(gg, col) { const inner = new THREE.Group(); inner.scale.setScalar(1 / gg.scale.x); const hull = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 6, 0, TAU, Math.PI / 2, Math.PI / 2), AV.std(0x8a5a3a, .7)); hull.scale.set(.75, .5, 1.7); hull.position.y = .3; inner.add(hull); const rim = new THREE.Mesh(new THREE.TorusGeometry(1, .06, 6, 20), AV.std(col, .5, 0, col, .4)); rim.scale.set(.75, 1.7, 1); rim.rotation.x = Math.PI / 2; rim.position.y = .3; inner.add(rim); AV.lin(inner); gg.add(inner); return inner }
    const boats = [[150, 0xe8c030], [-75, 0x30c060]].map(b => { const p = polar(deg(b[0]), RIV1 - 1.1); return AV.assets.model(ctx, 'quaternius/boat_b', gg => boatFallback(gg, b[1]), p[0], WY - .05, p[1], -deg(b[0]), 4.6) });
    ctx.upd.push((dt, t) => boats.forEach((g, i) => { g.position.y = WY - .05 + Math.sin(t * 1.3 + i * 2) * .04; g.rotation.z = Math.sin(t * .9 + i) * .03 }));

    /* ---------- waterfall + cliff behind the pool (backdrop for the stage) ---------- */
    const FY = H(POOL.x, POOL.z - POOL.r - 2.5);
    K.waterfall(ctx, POOL.x, WY, POOL.z - POOL.r + 2.6, 4.4, FY + 8.6, 0, { c1: 0x7ff0e0, c2: 0xffffff });          // falls in front of the cliff, into the pool
    const cliff = []; for (let a = -70; a <= 70; a += 9) { const p = polar(deg(-90 + a), 9.4); cliff.push([POOL.x + p[0], POOL.z + p[1]]) }
    A.boulders(B.rim, MT, cliff, H, rng, { step: 2.6, s0: 2.6, s1: 4.4, lift: 1.6 });
    for (const sx of [-1, 1]) A.rock(B.rim, MT, 0x8a8a9a, K.M(POOL.x + sx * 3.4, FY + 4, POOL.z - POOL.r - 1.2, 2.2, 6, 2.2, .2, sx, 0));
    A.rock(B.rim, MT, 0x7a7a8a, K.M(POOL.x, FY + 8.8, POOL.z - POOL.r - 1.6, 4.4, 1.6, 2.4));
    const crystals = []; for (let i = 0; i < [4, 7, 10][q]; i++) { const a = deg(-160 + rng() * 140), r = POOL.r + 1.4 + rng() * 1.6, x = POOL.x + Math.cos(a) * r, z = POOL.z - Math.abs(Math.sin(a)) * r; crystals.push({ x, y: H(x, z), z, s: 1.4 + rng() * 1.6, ry: rng() * TAU, tint: [0xffffff, 0xb0fff0, 0xd0b0ff][i % 3] }); ctx.circles.push([x, z, .8]) }
    K.instModel(ctx, 'quaternius/crystal_big', crystals, it => K.scatter(ctx, K.species.crystal(0x7ff0e0, 0xb07aff), K.floraMat(0), it.map(o => Object.assign({}, o, { s: o.s * .9 }))));
    const pl2 = new THREE.PointLight(0x7ff0e0, 1.2, 18); pl2.position.set(POOL.x, 2.5, POOL.z); grp.add(pl2);
    K.motes(ctx, { n: 40, x: POOL.x, z: POOL.z - 2, r: 5, y0: 0, y1: 3, cols: [0xffffff, 0xc8fff0], size: 3, speed: 1.4, alpha: .5 });
    /* rim: mossy boulders close the clearing */
    const rimPts = []; for (let a = 0; a <= 360; a += 6) { if (a > 250 && a < 290) continue; if (GAPS.some(g => Math.abs(((a - g) % 360 + 540) % 360 - 180) < 8)) continue; rimPts.push(polar(deg(a), 55 + Math.sin(a * .11) * 2)) }
    A.boulders(B.rim, MT, rimPts, H, rng, { step: [9, 7, 6][q], s0: 3, s1: 6.5 });

    /* ======================= SOUND SYSTEM STAGE ======================= */
    const SY = H(SX, SZ);
    B.stage.add(MT.wood, A.geo('box'), 0xffffff, K.M(SX, SY + .45, SZ - 1, 13.2, .9, 7));                          // deck
    B.stage.add(MT.stone, A.geo('box'), 0xc8b090, K.M(SX, SY + .25, SZ + 2.55, 13.6, .5, .3));                       // front lip
    for (let x = -6.4; x <= 6.41; x += .46) { const h = 5.2 + Math.sin(x * 3.1) * .25; B.stage.add(MT.v, A.geo('cyl6'), 0x9ab84a, K.M(SX + x, SY + .9 + h / 2, SZ - 4.3, .12, h, .12)); for (let y = 1.6; y < h; y += 1.1) B.stage.add(MT.v, A.geo('cyl6'), 0x6a7a2a, K.M(SX + x, SY + .9 + y, SZ - 4.3, .14, .06, .14)) }
    for (const p of [[-5.6, SZ + 2.8], [5.6, SZ + 2.8], [-5.6, SZ - 4], [5.6, SZ - 4]]) B.stage.add(MT.v, A.geo('cyl6'), 0x8aa83a, K.M(SX + p[0], SY + 3.15, p[1], .2, 6.3, .2));
    B.stage.add(MT.wood, A.geo('box'), 0xffffff, K.M(SX, SY + 6.2, SZ + 2.8, 12, .3, .3));                            // front beam
    B.stage.add(thatch, A.geo('tent'), 0xffffff, K.M(SX, SY + 6.2, SZ - .6, 7.6, 3.1, 5.0));                        // thatched canopy (batched: flora material needs vertex colours)
    B.stage.add(MT.v, A.geo('ico'), 0xffd23a, K.M(SX, SY + 9.6, SZ - .6, .45, .6, .45), 1);
    ctx.cols.push([SX - 6.7, SX + 6.7, SZ - 4.6, SZ + 2.7]);
    /* speaker stacks: textured cabinets + 3D woofers that pump to the music */
    const cabMat = new THREE.MeshStandardMaterial({ map: cabinetTex(), roughness: .8 }); cabMat.userData.lin = 1;
    const wooferPos = [];
    for (const x of [-5, -2.2, 2.2, 5]) for (const k of [0, 1]) {
      const y = SY + .9 + .85 + k * 1.72, z = SZ - 2.2; B.stage.add(MT.v, A.geo('box'), 0x16141a, K.M(SX + x, y, z, 1.9, 1.68, 1.3));
      const face = new THREE.Mesh(AV.G.pln, cabMat); face.scale.set(1.86, 1.64, 1); face.position.set(SX + x, y, z + .66); grp.add(face);
      wooferPos.push([SX + x, y + .12, z + .67, k ? .62 : .7]);
    }
    const wg = new THREE.LatheGeometry([[0, -.02], [.18, .02], [.42, .1], [.56, .16], [.62, .1], [.62, 0]].map(p => new THREE.Vector2(p[0], p[1])), 24); wg.rotateX(Math.PI / 2);
    const woof = new THREE.InstancedMesh(wg, new THREE.MeshStandardMaterial({ color: 0x3a3a44, roughness: .45, metalness: .3 }), wooferPos.length); woof.castShadow = false; woof.frustumCulled = false; grp.add(woof);
    const caps = new THREE.InstancedMesh(new THREE.SphereGeometry(.14, 12, 8), new THREE.MeshStandardMaterial({ color: 0xffd23a, emissive: 0xffd23a, emissiveIntensity: .4, roughness: .3 }), wooferPos.length); caps.frustumCulled = false; grp.add(caps);
    /* DJ booth with spinning records */
    B.stage.add(MT.wood, A.geo('box'), 0xd0a070, K.M(SX, SY + 1.45, SZ + 1.3, 3.2, 1.1, 1));
    B.stage.add(MT.v, A.geo('box'), 0x22202a, K.M(SX, SY + 2.03, SZ + 1.3, 3.3, .06, 1.05));
    B.stage.add(MT.v, A.geo('box'), 0x30303a, K.M(SX, SY + 2.12, SZ + 1.3, .7, .12, .6), .2);
    const decks = [-1, 1].map(s => { const d = new THREE.Mesh(new THREE.CylinderGeometry(.34, .34, .04, 24), new THREE.MeshStandardMaterial({ map: cabinetTex(), color: 0x444444, roughness: .4 })); d.material.userData.lin = 1; d.position.set(SX + s * 1.05, SY + 2.1, SZ + 1.3); grp.add(d); return d });
    /* rasta lamps (V0.9) + bulb string on the beam + light beams over the dance floor */
    const cols = [0xe8c030, 0x30c060, 0xe84030], lamp = cols.map((c, i) => { const l = new THREE.PointLight(c, 1.4, 18); l.position.set(SX - 4 + i * 4, SY + 4.6, SZ + 3); grp.add(l); return l });
    K.lanterns(ctx, [[SX - 6, SY + 6, SZ + 3], [SX + 6, SY + 6, SZ + 3]], { cols: [0xe83a30, 0xffd23a, 0x30c060], per: 14, sag: .5 });
    const beamGeo = new THREE.ConeGeometry(1.3, 9, 20, 1, true); beamGeo.translate(0, -4.5, 0);
    const beams = [0xe83a30, 0xffd23a, 0x30c060, 0xffd23a].map((c, i) => { const m = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .1, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); m.position.set(SX - 4.5 + i * 3, SY + 5.9, SZ + 2.6); grp.add(m); return m });
    ctx.sign('JUNGLE DUB SOUND SYSTEM', SX, SY + 7.1, SZ + 5.6, 0, 6, '#e8c030');                                 // hangs just in front of the roof edge

    /* ---------- dance floor (glows to the beat at night) + dancing crowd ---------- */
    const fm = new THREE.MeshStandardMaterial({ map: floorTex(), emissiveMap: floorTex(), emissive: 0xffffff, emissiveIntensity: .1, roughness: .55 }); fm.userData.lin = 1;
    const floor = new THREE.Mesh(new THREE.CircleGeometry(DF.r, 64), fm); floor.rotation.x = -Math.PI / 2; floor.position.set(DF.x, H(DF.x, DF.z) + .05, DF.z); floor.receiveShadow = true; grp.add(floor);
    B.misc.add(MT.stone, new THREE.TorusGeometry(DF.r + .1, .14, 5, 64), 0xd8c4a0, K.M(DF.x, H(DF.x, DF.z) + .05, DF.z, 1, 1, .6, Math.PI / 2, 0, 0));
    const crowd = []; for (let i = 0, t = 0; crowd.length < [8, 14, 20][q] && t < 200; t++) { const a = rng() * TAU, r = 3.2 + rng() * 4.4, x = DF.x + Math.cos(a) * r, z = DF.z + Math.sin(a) * r; if (z < DF.z - 3.4 && Math.abs(x) < 3.5) continue; if (Math.hypot(x + 8, z - 3) < 2.4 || Math.hypot(x, z + 1.5) < 2.2 || crowd.some(c => Math.hypot(c[0] - x, c[2] - z) < 1.15)) continue; crowd.push([x, H(x, z) + .06, z, npcYaw(x, z, SX, SZ) + (rng() - .5) * .4]) }
    /* V0.9.7: rigged dancers (rasta apes, backpackers, a trippy frog) on the dance floor; frogs at the pool; villagers wandering the bamboo village */
    { const kinds = ['ape', 'human', 'ape', 'frog', 'human', 'ape', 'spirit']; AV.beings.spawn(ctx, crowd.map((c, i) => ({ kind: kinds[i % kinds.length], x: c[0], z: c[2], yaw: Math.atan2(SX - c[0], SZ - c[2]), mode: 'dance', seed: i + 21 })));
      AV.beings.spawn(ctx, [{ kind: 'frog', x: POOL.x + 6.4, z: POOL.z + 4, mode: 'idle', name: 'Ribbit Rick' }, { kind: 'frog', x: POOL.x - 6, z: POOL.z + 4.6, mode: 'idle' }, { kind: 'ape', x: -12, z: 4, area: { x: -12, z: 3, r: 9 } }, { kind: 'human', x: -6, z: 12, area: { x: -10, z: 6, r: 9 } }, { kind: 'ape', x: 10, z: 8, area: { x: 8, z: 6, r: 8 } }, { kind: 'human', x: 4, z: 14, area: { x: 0, z: 12, r: 8 } }].slice(0, AV.beings.n(ctx, 3, 5, 6)).map((s, i) => Object.assign(s, { seed: 70 + i }))) }
    /* bamboo poles with bulb strings around the floor */
    const poles = [20, 45, 68, 112, 135, 160].map(a => { const p = polar(deg(a), 10.4); return [DF.x + p[0], DF.z + p[1]] });   // no pole on the north path (90°)
    poles.forEach(p => { const y = H(p[0], p[1]); B.misc.add(MT.v, A.geo('cyl6'), 0x8aa83a, K.M(p[0], y + 2.3, p[1], .12, 4.6, .12)); B.misc.add(MT.v, A.geo('sph'), 0xffd23a, K.M(p[0], y + 4.7, p[1], .18, .18, .18), 1); ctx.circles.push([p[0], p[1], .25]) });
    K.lanterns(ctx, poles.map(p => [p[0], H(p[0], p[1]) + 4.5, p[1]]), { cols: [0xe83a30, 0xffd23a, 0x30c060, 0xff4ad2], per: 6, sag: .7 });
    K.lanterns(ctx, [[poles[0][0], 4.5, poles[0][1]], [SX + 6, SY + 6, SZ + 3]], { cols: [0xffd23a, 0x30c060, 0xe83a30], per: 6, sag: .6 });
    K.lanterns(ctx, [[poles[5][0], 4.5, poles[5][1]], [SX - 6, SY + 6, SZ + 3]], { cols: [0xffd23a, 0x30c060, 0xe83a30], per: 6, sag: .6 });

    /* ---------- elder Bongo + one-drop spot (V0.9 interactions, unchanged) ---------- */
    const bongo = AV.npc.spawn(ctx, 'bongo', { x: -8, z: 3, yaw: -.6, H, r: 3.4, arms: false }).g;
    B.misc.add(MT.wood, A.geo('cyl'), 0x8a5a3a, K.M(-8.9, H(-8.9, 2.4) + .35, 2.4, .32, .7, .32)); B.misc.add(MT.v, A.geo('cyl'), 0xe8d8b0, K.M(-8.9, H(-8.9, 2.4) + .72, 2.4, .3, .04, .3));
    ctx.T.push({ x: 0, z: -1.5, r: 4.2, label: () => tr('Feel the one-drop (move to the bass)', 'Siente el one-drop (muévete con el bajo)'), fn: () => { AV.toast(AV.pick([tr('Dub is space. The delay is the dance floor.', 'El dub es espacio. El delay es la pista.'), tr('One… (silence)… DROP. You feel it in your chest.', 'Uno… (silencio)… ¡CAE! Lo sientes en el pecho.'), tr('The sub-bass rearranges your ribs, politely.', 'El subgrave te reordena las costillas, con educación.')])); AV.audio && AV.audio.blip(70, .5, 'sine', .4); AV.dlg && AV.dlg.event('one_drop') } });

    /* ---------- bamboo village: thatched round huts ---------- */
    HUTS.forEach((h, i) => {
      const [x, z, r] = h, y = H(x, z), ry = npcYaw(x, z, DF.x, DF.z), fx = Math.sin(ry), fz = Math.cos(ry);
      B.village.add(MT.stone, A.geo('disc'), 0xb8a080, K.M(x, y + .1, z, r + .4, .25, r + .4));
      B.village.add(MT.wood, A.geo('cyl'), 0xe8c890, K.M(x, y + 1.35, z, r, 2.5, r));
      for (let k = 0; k < 10; k++) { const a = k / 10 * TAU; B.village.add(MT.v, A.geo('cyl6'), 0x9a7a3a, K.M(x + Math.cos(a) * (r + .05), y + 1.35, z + Math.sin(a) * (r + .05), .08, 2.6, .08)) }
      B.village.add(MT.v, A.geo('box'), 0x2a1a10, K.M(x + fx * (r + .02), y + 1.1, z + fz * (r + .02), 1, 1.9, .12, 0, ry, 0));
      for (const s of [-1, 1]) { const wx = x + fx * r * .72 + fz * s * r * .62, wz = z + fz * r * .72 - fx * s * r * .62; B.village.add(MT.v, A.geo('box'), 0xffd890, K.M(wx, y + 1.7, wz, .5, .45, .1, 0, ry + s * .75, 0), .9) }
      B.village.add(thatch, A.geo('tent'), 0xffffff, K.M(x, y + 2.55, z, r + .9, 2.2, r + .9, 0, i, 0));
      B.village.add(MT.v, A.geo('sph'), [0xe83a30, 0xffd23a, 0x30c060][i % 3], K.M(x + fx * (r + .5), y + 2.35, z + fz * (r + .5), .2, .26, .2), 1);
      ctx.circles.push([x, z, r + .2]); occ.push([x, z, r + 2.2]);
    });

    /* ---------- bamboo art wall (V0.9 placements, now on an arc facing the dance floor) ---------- */
    const pl = MD.placementsFor('jungle_dub');
    pl.forEach((p, i) => { const pt = ART[i % ART.length], x = pt[0], z = pt[1], y = H(x, z), ry = Math.atan2(-x, -z), bx = -Math.sin(ry) * .35, bz = -Math.cos(ry) * .35;
      MD.frame(ctx, p, x, y + 2.6, z, ry, 3.2);
      for (let k = -4; k <= 4; k++) { const ox = Math.cos(ry) * k * .3, oz = -Math.sin(ry) * k * .3; B.misc.add(MT.v, A.geo('cyl6'), k % 2 ? 0x9ab84a : 0x7a9a3a, K.M(x + bx + ox, y + 2.3, z + bz + oz, .12, 4.6, .12)) }
      B.misc.add(MT.v, A.geo('box'), 0x6a5a2a, K.M(x + bx, y + 4.6, z + bz, 3, .14, .14, 0, ry, 0)); ctx.circles.push([x + bx, z + bz, .9]); occ.push([x, z, 3]) });
    { const p = polar(deg(29), 19.6); ctx.sign('ARTWORK BAMBOO WALL (awaiting files)', p[0], H(p[0], p[1]) + 6.6, p[1], Math.atan2(-p[0], -p[1]), 5, '#7ff0c8', { posts: true }); occ.push([p[0], p[1], 3]) }

    /* ---------- gold portal arch back to Ape Town (V0.9) on bamboo pillars ---------- */
    const AY = H(0, 30);
    AV.mk(AV.G.tor, AV.std(0xe8c030, .4, 0, 0xe8c030, 1), 0, AY + 2.4, 30, 2.4, 2.4, 2.4, grp, false);
    const pm = new THREE.Mesh(AV.G.pln, new THREE.MeshBasicMaterial({ color: 0xffb04a, transparent: true, opacity: .4, side: THREE.DoubleSide })); pm.scale.set(4.6, 4.6, 1); pm.position.set(0, AY + 2.4, 30); grp.add(pm);
    for (const s of [-1, 1]) { B.misc.add(MT.v, A.geo('cyl6'), 0x8aa83a, K.M(s * 2.9, AY + 2.4, 30, .18, 4.8, .18)); B.misc.add(MT.v, A.geo('sph'), 0xffd23a, K.M(s * 2.9, AY + 4.95, 30, .3, .3, .3), 1); ctx.circles.push([s * 2.9, 30, .3]) }
    ctx.T.push({ x: 0, z: 28, r: 3, label: () => tr('Portal arch: back to Ape Town', 'Arco: volver a Ape Town'), fn: () => AV.travel('ape_town', 'jungle_dub') });
    occ.push([0, 30, 4]);

    /* =======================================================================================
       V1.0 (Expansion Kit, reference_maps/jungle_dub_world.png): River Bar, Bamboo Bazaar, Dub Lab, Jungle Temple, Mushroom Grove,
       the Stone Ape Band on the Jungle Rave main stage + the Bass Check quest. Built before the vegetation so plants keep clear (occ).
       ======================================================================================= */
    const jd = AV.jd = { cheer: 0 };
    const loc = (x, z, ry, lx, lz) => [x + lx * Math.cos(ry) + lz * Math.sin(ry), z - lx * Math.sin(ry) + lz * Math.cos(ry)];
    const C = AV.chars, S0 = () => AV.S;
    /* --- Stone Ape Band on the main stage (same trio + look as Ape Town's Lotus Stage) --- */
    const band = [[C.gorilla(), -3.6, SZ + .5, 0, 'jd_gorilla'], [C.ztone(), 0, SZ + 2.05, .5, 'jd_ztone'], [C.orangutan(), 3.6, SZ + .5, 1, 'jd_orangutan']].map(b => { const hold = new THREE.Group(); hold.position.set(SX + b[1], SY + .9, b[2]); b[0].userData.baseY = 0; hold.add(b[0]); grp.add(hold); return b });
    const bandTalk = {
      jd_ztone: { id: 'jd_ztone', name: ['Ztonedape · Stone Ape Band', 'Ztonedape · Stone Ape Band'], first: ['Yo! Welcome to the Jungle Rave. Stone Ape Band in the house — dub, reggae, hip-hop, live.', '¡Yo! Bienvenido al Jungle Rave. La Stone Ape Band en la casa: dub, reggae, hip-hop, en directo.'],
        back: ['You again! The jungle likes you.', '¡Tú otra vez! A la jungla le caes bien.'],
        opts: [{ label: ['What’s playing tonight?', '¿Qué suena esta noche?'], say: ['The sound system runs till sunrise. We jump on when the bass is right — ask our bassist, he’s fussy.', 'El sound system suena hasta el amanecer. Subimos cuando el bajo está bien: pregúntale a nuestro bajista, es muy exigente.'] },
          { label: ['Play one for me!', '¡Tocad una para mí!'], say: ['One for the people! Hands up!', '¡Una para la gente! ¡Manos arriba!'], fn: () => { jd.cheer = AV.now() + 10; AV.vitals && AV.vitals.add(0, 6) } },
          { label: ['Where are you from?', '¿De dónde sois?'], say: ['Ape Town’s Lotus Stage is home. Here is where we get loud.', 'El Escenario de Loto de Ape Town es nuestra casa. Aquí es donde subimos el volumen.'] }] },
      jd_gorilla: { id: 'jd_gorilla', name: ['Gorilla bassist · Stone Ape Band', 'Gorila bajista · Stone Ape Band'], first: ['(tunes the upright bass) …The low end ain’t right tonight.', '(afina el contrabajo) …El grave no está bien esta noche.'],
        back: S => (S.quests || {}).dub_bass_check === 'done' ? ['Felt that drop? That’s your plate, friend.', '¿Sentiste ese drop? Es tu plato, amigo.'] : ['Still waiting on that dub plate.', 'Sigo esperando ese dub plate.'],
        opts: [{ label: ['Need a hand with the bass?', '¿Te ayudo con el bajo?'], say: S => { const q = (S.quests || {}).dub_bass_check; return !q ? ['The Dub Lab cut us a fresh plate. Bring it here and I’ll pay you. Lab’s past the cinema bridge, by the glowing mushrooms.', 'El Dub Lab nos grabó un plato nuevo. Tráelo y te pago. El Lab está pasando el puente del cine, junto a las setas brillantes.'] : q === 'done' ? ['All good now. Bass is fat, crowd is happy.', 'Todo bien. El bajo suena gordo y la gente está feliz.'] : ['The plate, from the Dub Lab. Past the cinema bridge.', 'El plato, del Dub Lab. Pasando el puente del cine.'] }, fn: () => { if (AV.quests.canStart('dub_bass_check', 'jd_gorilla')) AV.quests.start('dub_bass_check'); else AV.quests.onTalk('jd_gorilla') } },
          { label: ['What makes good dub?', '¿Qué hace bueno al dub?'], say: ['Space. Leave room for the echo. The silence is part of the bassline.', 'Espacio. Deja sitio al eco. El silencio es parte de la línea de bajo.'] }] },
      jd_orangutan: { id: 'jd_orangutan', name: ['Orangutan sax · Stone Ape Band', 'Orangután saxo · Stone Ape Band'], first: ['(lowers the sax) Ah, an audience! Tell your friends. Tell your enemies.', '(baja el saxo) ¡Ah, público! Díselo a tus amigos. Y a tus enemigos.'],
        back: ['My favourite listener returns.', 'Vuelve mi oyente favorito.'],
        opts: [{ label: ['Tell me a joke', 'Cuéntame un chiste'], say: () => AV.pick([['Why do orangutans love brass? Long arms, longer notes.', '¿Por qué a los orangutanes les encanta el metal? Brazos largos, notas más largas.'], ['I tried playing quietly once. Worst three seconds of my life.', 'Una vez intenté tocar bajito. Los peores tres segundos de mi vida.']]) },
          { label: ['Any tips for the jungle?', '¿Algún consejo para la jungla?'], say: ['River Bar for a cold one, the Temple to slow down, and never eat the glowing mushrooms. Look, don’t taste.', 'El River Bar para algo frío, el Templo para bajar el ritmo y nunca te comas las setas brillantes. Mira, no pruebes.'] }] } };
    band.forEach(b => { const x = SX + b[1], z = SZ + 3.4; ctx.T.push({ x, z, r: 1.9, label: () => tr('Talk to ', 'Hablar con ') + tr(bandTalk[b[4]].name[0], bandTalk[b[4]].name[1]), fn: () => { AV.talk.open(bandTalk[b[4]]); if (b[4] === 'jd_gorilla') setTimeout(() => AV.quests.onTalk('jd_gorilla'), 500) } }) });
    ctx.upd.push((dt, t) => { const on = AV.audio && AV.audio.on && (AV.audio.ok || (AV.audio.track && AV.audio.track.active)), beat = on ? AV.audio.beat : t * 1.2, d = Math.hypot(AV.P.x - SX, AV.P.z - SZ);
      if (d > 70) return; const energy = jd.cheer > AV.now() ? 1.5 : 1; band.forEach(b => C.animate(b[0], t, beat, energy, b[3] * .5)) });

    /* --- River Bar: thatched riverside bar (south-west bank), bartender Ras Mo, real menu --- */
    { const [bx, bz] = V1.bar, by = H(bx, bz), ry = npcYaw(bx, bz, 0, 0), P = (lx, lz) => loc(bx, bz, ry, lx, lz);
      B.misc.add(MT.wood, A.geo('box'), 0xb08a5a, K.M(bx, by + .12, bz, 7.6, .3, 5.2, 0, ry, 0));
      { const [x, z] = P(0, 1.2); B.misc.add(MT.wood, A.geo('box'), 0x8a5a32, K.M(x, by + .55, z, 5, .9, .7, 0, ry, 0)); B.misc.add(MT.wood, A.geo('box'), 0xd8b080, K.M(x, by + 1.02, z, 5.3, .08, .9, 0, ry, 0)) }
      { const [x, z] = P(0, -1.7); B.misc.add(MT.wood, A.geo('box'), 0x6a4a2a, K.M(x, by + 1.1, z, 5, 2, .4, 0, ry, 0)); for (let k = 0; k < 9; k++) { const [px, pz] = P(-2 + k * .5, -1.45); B.misc.add(MT.v, A.geo('cyl'), [0x2a7a3a, 0x9ad8ff, 0x5a2a14, 0xffd23a][k % 4], K.M(px, by + 1.55, pz, .08, .3, .08), .6) } }
      for (const [lx, lz] of [[-3.4, -2.3], [3.4, -2.3], [-3.4, 2.3], [3.4, 2.3]]) { const [x, z] = P(lx, lz); B.misc.add(MT.v, A.geo('cyl6'), 0x8aa83a, K.M(x, by + 1.9, z, .16, 3.6, .16)); ctx.circles.push([x, z, .25]) }
      B.misc.add(thatch, A.geo('tent'), 0xffffff, K.M(bx, by + 3.9, bz, 5, 1.6, 3.6, 0, ry, 0));
      for (const lx of [-1.8, 0, 1.8]) { const [x, z] = P(lx, 2.15); B.misc.add(MT.wood, A.geo('cyl'), 0xe8c030, K.M(x, by + .45, z, .28, .7, .28)) }
      for (let k = -2; k <= 2; k++) { const [x, z] = P(k * 1.1, 1.2); ctx.circles.push([x, z, .55]) } for (let k = -2; k <= 2; k++) { const [x, z] = P(k * 1.1, -1.7); ctx.circles.push([x, z, .5]) }
      { const [a0, a1] = [P(-3.4, 2.3), P(3.4, 2.3)]; K.lanterns(ctx, [[a0[0], by + 3.4, a0[1]], [a1[0], by + 3.4, a1[1]]], { cols: [0xe83a30, 0xffd23a, 0x30c060, 0xff4ad2], per: 10, sag: .35 }) }
      { const [sx, sz] = P(-4.6, 2.8); ctx.sign('RIVER BAR · drinks · chill · sunset jams', sx, H(sx, sz) + 3.2, sz, ry, 4.8, '#ffd23a', { posts: true }) }
      occ.push([bx, bz, 6]);
      const [mx, mz] = P(0, -.35), mo = AV.beings.spawn(ctx, [{ kind: 'ape', x: mx, y: by + .27, z: mz, yaw: ry, mode: 'idle', name: 'Ras Mo', seed: 901 }])[0];
      const [cx, cz] = P(0, 2.6);
      const barV = jd.barVendor = { id: 'dub_riverbar', name: ['River Bar', 'River Bar'], x: cx, z: cz, reach: 6, greet: ['Ras Mo: “Cold drinks, warm river. What can I get you?”', 'Ras Mo: “Bebidas frías, río templado. ¿Qué te pongo?”'], again: ['Ras Mo: “Another %i? I remember my regulars.”', 'Ras Mo: “¿Otro %i? Me acuerdo de mis clientes.”'],
        items: [['water', 8], ['beer', 14], ['rum_cola', 30], ['coconut', 12], ['veggie_burger', 22]] };
      const barTalk = jd.barTalk = { id: 'ras_mo', name: ['Ras Mo · River Bar', 'Ras Mo · River Bar'], first: ['Welcome to the River Bar! First time in the jungle? Sit, breathe, the river does the rest.', '¡Bienvenido al River Bar! ¿Primera vez en la jungla? Siéntate, respira; el río hace el resto.'],
        back: S => { const v = (S.v1.vend.dub_riverbar || {}); return v.last ? ['Ras Mo: “Back for another ' + (AV.ITEMS[v.last] ? AV.ITEMS[v.last].n[0] : v.last) + '? Ha!”', 'Ras Mo: “¿Vienes a por otro ' + (AV.ITEMS[v.last] ? AV.ITEMS[v.last].n[1] : v.last) + '? ¡Ja!”'] : ['Ras Mo: “Good to see you again, bredren.”', 'Ras Mo: “Me alegra verte otra vez, hermano.”'] },
        opts: [{ label: ['What’s happening tonight?', '¿Qué pasa esta noche?'], say: () => (AV.nightK || 0) > .3 ? ['The sound system is cooking and the Stone Ape Band is on the main stage. Go dance!', 'El sound system está a tope y la Stone Ape Band está en el escenario principal. ¡Ve a bailar!'] : ['Sunset jam on the deck later. The band warms up on the main stage all day.', 'Más tarde, jam al atardecer en el muelle. La banda calienta en el escenario principal todo el día.'] },
          { label: ['Show me the menu', 'Enséñame la carta'], fn: () => AV.shop.open(barV) },
          { label: ['Any jobs?', '¿Hay algún trabajo?'], say: S => { const q = (S.quests || {}).dub_bass_check; return !q ? ['The gorilla bassist on the main stage is grumbling about his low end. Go ask him — he pays.', 'El gorila bajista del escenario principal se queja de sus graves. Pregúntale: paga bien.'] : q === 'done' ? ['Heard the drop after your Bass Check. My glasses are still rattling.', 'Escuché el drop después de tu Prueba de bajo. Mis vasos siguen temblando.'] : ['Dub Lab’s past the cinema bridge. Bring the plate to the band.', 'El Dub Lab está pasando el puente del cine. Lleva el plato a la banda.'] } }] };
      if (mo && mo.tg) { mo.tgFixed = true; mo.tg.x = cx; mo.tg.z = cz; mo.tg.r = 2.4; mo.tg.label = () => tr('River Bar: talk to Ras Mo (menu)', 'River Bar: hablar con Ras Mo (carta)'); mo.tg.fn = () => { AV.visit('dub_river_bar'); AV.talk.open(barTalk) } }
      else ctx.T.push({ x: cx, z: cz, r: 2.4, label: () => tr('River Bar: talk to Ras Mo (menu)', 'River Bar: hablar con Ras Mo (carta)'), fn: () => { AV.visit('dub_river_bar'); AV.talk.open(barTalk) } }) }

    /* --- Bamboo Bazaar: craft stalls along the trail to Roots Village --- */
    { const [ax, az] = V1.bazaarA, [bx2, bz2] = V1.bazaarB, dx = bx2 - ax, dz = bz2 - az, l = Math.hypot(dx, dz), px = -dz / l, pz = dx / l, cloth = [0xff4ad2, 0x30c060, 0xffd23a, 0xe83a30, 0x7ff0ff];
      const stall = (t, side, i) => { const x = ax + dx * t + px * 3.6 * side, z = az + dz * t + pz * 3.6 * side, y = H(x, z), ry = npcYaw(x, z, x - px * side, z - pz * side), P = (lx, lz) => loc(x, z, ry, lx, lz);
        { const [cx, cz] = P(0, .5); B.misc.add(MT.wood, A.geo('box'), 0xb08a5a, K.M(cx, y + .5, cz, 2.4, 1, .7, 0, ry, 0)); for (let k = 0; k < 4; k++) { const [ix, iz] = P(-.8 + k * .53, .5); B.misc.add(MT.v, A.geo(k % 2 ? 'sph' : 'box'), cloth[(i + k) % 5], K.M(ix, y + 1.12, iz, .2, .2, .2), .3) } }
        for (const [lx, lz] of [[-1.3, -.6], [1.3, -.6], [-1.3, 1], [1.3, 1]]) { const [qx, qz] = P(lx, lz); B.misc.add(MT.v, A.geo('cyl6'), 0x8aa83a, K.M(qx, y + 1.25, qz, .09, 2.5, .09)) }
        B.misc.add(MT.v, A.geo('box'), cloth[i % 5], K.M(x, y + 2.55, z, 3, .08, 2, .12, ry, 0), .15); ctx.circles.push([x, z, 1.4]); occ.push([x, z, 2.6]); return P };
      const P0 = stall(.42, 1, 0); stall(.64, 1, 1); stall(.86, 1, 2); stall(.5, -1, 3); stall(.78, -1, 4);
      const mid = [ax + dx * .64 + px * 1.4, az + dz * .64 + pz * 1.4];
      const [sx, sz] = [ax + dx * .3 + px * 4.6, az + dz * .3 + pz * 4.6]; ctx.sign('THE BAMBOO BAZAAR · art · crafts · clothes', sx, H(sx, sz) + 3.2, sz, npcYaw(sx, sz, ax, az), 4.6, '#ff8ac0', { posts: true });
      const [vx, vz] = P0(0, -.3), lua = AV.beings.spawn(ctx, [{ kind: 'human', x: vx, y: H(vx, vz), z: vz, yaw: npcYaw(vx, vz, mid[0], mid[1]), mode: 'idle', name: 'Maker Lua', seed: 902 }])[0];
      const bazV = jd.bazaarVendor = { id: 'dub_bazaar', name: ['Bamboo Bazaar', 'Bazar de Bambú'], x: ax + dx * .42 + px * 1.6, z: az + dz * .42 + pz * 1.6, reach: 6, greet: ['Maker Lua: “All handmade in the village. Have a look!”', 'Maker Lua: “Todo hecho a mano en la aldea. ¡Echa un vistazo!”'],
        items: [['flower_garland', 15], ['beads', 18], ['bamboo_flute', 35], ['elephant_pants', 45]] };
      const open = () => { AV.visit('dub_bazaar'); AV.shop.open(bazV) };
      if (lua && lua.tg) { lua.tgFixed = true; lua.tg.x = bazV.x; lua.tg.z = bazV.z; lua.tg.r = 2.4; lua.tg.label = () => tr('Bamboo Bazaar: browse crafts (Maker Lua)', 'Bazar de Bambú: ver artesanía (Maker Lua)'); lua.tg.fn = open } else ctx.T.push({ x: bazV.x, z: bazV.z, r: 2.4, label: () => tr('Bamboo Bazaar: browse crafts', 'Bazar de Bambú: ver artesanía'), fn: open }) }

    /* --- Dub Lab: studio hut with ON AIR light, mixing desk, the dub plate for the Bass Check --- */
    { const [lx0, lz0] = V1.lab, y = H(lx0, lz0), ry = npcYaw(lx0, lz0, 0, 0), P = (a, b) => loc(lx0, lz0, ry, a, b);
      B.misc.add(MT.wood, A.geo('box'), 0xc8a070, K.M(lx0, y + 1.5, lz0, 6, 3.2, 5, 0, ry, 0)); B.misc.add(thatch, A.geo('tent'), 0xffffff, K.M(lx0, y + 3.6, lz0, 4.4, 1.8, 3.8, 0, ry, 0));
      { const [x, z] = P(0, 2.52); B.misc.add(MT.v, A.geo('box'), 0x2a1a10, K.M(x, y + 1.05, z, 1.2, 2.1, .1, 0, ry, 0)) }
      { const [x, z] = P(1.9, 2.55); B.misc.add(MT.v, A.geo('box'), 0xff2a2a, K.M(x, y + 2.5, z, 1.1, .35, .08, 0, ry, 0), 1.2) }
      for (const s of [-1, 1]) { const [x, z] = P(s * 2.4, 3); B.misc.add(MT.v, A.geo('box'), 0x16141a, K.M(x, y + .8, z, .9, 1.6, .8, 0, ry, 0)); B.misc.add(MT.v, A.geo('cyl'), 0x3a3a44, K.M(x, y + .9, z + 0, .3, .05, .3, Math.PI / 2, ry, 0)); ctx.circles.push([x, z, .55]) }
      ctx.circles.push([lx0, lz0, 3.1]); occ.push([lx0, lz0, 5.5]);
      { const [sx, sz] = P(-3.6, 4); ctx.sign('DUB LAB · studio · mixing · sound system', sx, H(sx, sz) + 3, sz, ry, 4.4, '#7ff0c8', { posts: true }) }
      const [tx, tz] = P(0, 4.1);
      ctx.T.push({ x: tx, z: tz, r: 2.3, label: () => (AV.S.quests || {}).dub_bass_check === 'active' && !AV.bag.count('dub_plate') ? tr('Dub Lab: collect the fresh dub plate', 'Dub Lab: recoger el dub plate') : tr('Dub Lab: listen at the mixing desk', 'Dub Lab: escuchar en la mesa de mezclas'),
        fn: () => { AV.visit('dub_lab'); const S = AV.S; if ((S.quests || {}).dub_bass_check === 'active' && !AV.bag.count('dub_plate')) { AV.bag.add('dub_plate'); AV.toast(tr('The engineer hands you a warm acetate: “Careful, one-off cut. Take it to the band.”', 'El ingeniero te da un acetato caliente: “Cuidado, es único. Llévaselo a la banda.”')) }
          else { AV.audio && [55, 82, 55, 110].forEach((f, i) => setTimeout(() => AV.audio.blip(f, .35, 'sine', .3), i * 260)); AV.toast(AV.pick([tr('Spring reverb, tape delay, a bassline that loops forever. Pure dub science.', 'Reverb de muelle, delay de cinta, un bajo que se repite para siempre. Ciencia dub pura.'), tr('The engineer drops the drums out. Only bass and echo. Your chest hums.', 'El ingeniero quita la batería. Solo bajo y eco. Te vibra el pecho.')])); AV.vitals && AV.vitals.add(0, 4) } } }) }

    /* --- Jungle Temple: stepped stone temple with the carved ape face, sound-healing ceremony --- */
    { const [tx0, tz0] = V1.temple, y = H(tx0, tz0), ry = npcYaw(tx0, tz0, 0, -30), P = (a, b) => loc(tx0, tz0, ry, a, b);
      [[9, 2.4, 0], [7, 1.3, 1.85], [5, 1.3, 3.15]].forEach(([w, h, yy]) => B.rim.add(MT.stone, A.geo('box'), 0x8a8a6a, K.M(tx0, y + yy - (yy ? 0 : .6), tz0, w, h, w, 0, ry, 0)));
      { const [x, z] = P(0, -.6); B.rim.add(MT.stone, A.geo('sph'), 0xa8a07a, K.M(x, y + 5.6, z, 1.6, 2.1, 1.5)); B.rim.add(MT.stone, A.geo('cone'), 0xc8a040, K.M(x, y + 7.9, z, 1.1, 1.4, 1.1));
        for (const s of [-1, 1]) { const [ex, ez] = P(s * .55, .62); B.misc.add(MT.v, A.geo('sph'), 0x7ff0ff, K.M(ex, y + 5.9, ez, .18, .12, .1), 1.3); const [rx2, rz2] = P(s * 1.55, -.6); B.rim.add(MT.stone, A.geo('sph'), 0x9a926e, K.M(rx2, y + 5.8, rz2, .45, .6, .3)) }
        { const [mx2, mz2] = P(0, .75); B.rim.add(MT.stone, A.geo('sph'), 0xb8b08a, K.M(mx2, y + 5.05, mz2, .95, .7, .7)); const [nx2, nz2] = P(0, 1.38); B.misc.add(MT.v, A.geo('box'), 0x3a3428, K.M(nx2, y + 4.85, nz2, .6, .07, .05, 0, ry, 0)) } }
      for (const s of [-1, 1]) { const [x, z] = P(s * 2.6, 4.9); B.misc.add(MT.stone, A.geo('cyl6'), 0x7a7a5a, K.M(x, y + 1, z, .3, 2, .3)); B.misc.add(MT.v, A.geo('sph'), 0xffa040, K.M(x, y + 2.15, z, .22, .3, .22), 1.2); ctx.circles.push([x, z, .35]) }
      const tl = new THREE.PointLight(0x7ff0ff, 1, 12); { const [x, z] = P(0, 3); tl.position.set(x, y + 4, z) } grp.add(tl);
      ctx.circles.push([tx0, tz0, 4.9]); occ.push([tx0, tz0, 7.5]);
      { const [sx, sz] = P(-4, 6); ctx.sign('THE JUNGLE TEMPLE · music · healing · ceremony', sx, H(sx, sz) + 3.2, sz, ry, 4.8, '#ffd23a', { posts: true }) }
      const [qx, qz] = P(0, 5.9);
      ctx.T.push({ x: qx, z: qz, r: 2.4, label: () => tr('Jungle Temple: join the sound-healing ceremony', 'Templo de la Jungla: unirse a la ceremonia de sonido'), fn: () => { AV.visit('dub_temple'); AV.audio && [196, 247, 294, 392].forEach((f, i) => setTimeout(() => AV.audio.blip(f, 1.2, 'sine', .12), i * 380)); AV.vitals && AV.vitals.add(6, 12); AV.toast(tr('Singing bowls hum, the stone face seems to smile. You feel lighter. Energy + vibe up.', 'Los cuencos cantan y el rostro de piedra parece sonreír. Te sientes más ligero. Energía y vibra arriba.')) } });
      ctx.upd.push((dt, t) => tl.intensity = AV.calm() ? .9 : .8 + Math.sin(t * .8) * .3) }

    /* --- Mushroom Grove: giant glowing mushrooms, spores, a look-don't-taste walk --- */
    { const [gx, gz] = V1.grove, list = [];
      for (let i = 0; i < [6, 9, 12][q]; i++) { const a = i / [6, 9, 12][q] * TAU + rng() * .3, r0 = 2.5 + rng() * 4, x = gx + Math.cos(a) * r0, z = gz + Math.sin(a) * r0; if (pathDist(x, z) < 1) continue; const s = 4 + rng() * 4; list.push({ x, y: H(x, z), z, s: s * .45, ry: rng() * TAU }); ctx.circles.push([x, z, .12 * s]) }
      K.scatter(ctx, K.species.mushroom(0xff4ad2, 0xf4e8d0, 0x7ff0ff), K.floraMat(0), list);
      K.motes(ctx, { n: 70, x: gx, z: gz, r: 8, y0: .4, y1: 4, cols: [0xff4ad2, 0x7ff0ff, 0xffd84a], size: 2.4, H, night: false });
      const gl = new THREE.PointLight(0xff4ad2, 1.2, 14); gl.position.set(gx, H(gx, gz) + 3, gz); grp.add(gl); ctx.upd.push((dt, t) => gl.intensity = AV.calm() ? 1 : 1 + Math.sin(t * 1.3) * .35);
      occ.push([gx, gz, 8]);
      ctx.sign('MUSHROOM GROVE · art · trippy walks', gx - 6, H(gx - 6, gz + 2) + 3, gz + 2, npcYaw(gx - 6, gz + 2, 0, 0), 4.2, '#ff8ac0', { posts: true });
      ctx.T.push({ x: gx, z: gz, r: 7.6, label: () => tr('Mushroom Grove: slow trippy walk (look, don’t taste)', 'Arboleda de Setas: paseo lento y psicodélico (mirar, no probar)'), fn: () => { AV.visit('dub_grove'); AV.fx.add('glow', .25); AV.toast(tr('Spores glitter in the air and the caps pulse with the bass. Just looking is enough.', 'Las esporas brillan en el aire y los sombreros laten con el bajo. Con mirar basta.')) } }) }
    /* walking into a place counts as visiting it (journal / quests) */
    { const VP = [['dub_river_bar', V1.bar, 7], ['dub_bazaar', [(V1.bazaarA[0] + V1.bazaarB[0]) / 2, (V1.bazaarA[1] + V1.bazaarB[1]) / 2], 9], ['dub_lab', V1.lab, 7], ['dub_temple', V1.temple, 9], ['dub_grove', V1.grove, 8], ['dub_stage', [SX, SZ + 6], 8]]; let acc = 0;
      ctx.upd.push(dt => { acc += dt; if (acc < 1) return; acc = 0; for (const [id, p, r] of VP) if (Math.hypot(AV.P.x - p[0], AV.P.z - p[1]) < r) AV.visit(id) }) }

    /* ---------- vegetation: CC0 models where available, procedural elsewhere ---------- */
    const outer = { r0: 27.5, r1: 49 }, inner = { r0: 11, r1: 18.5 };
    const palms = pick([6, 14, 22][q], outer, (x, z) => free(x, z, 1.4), 2.2, 3.1).concat(pick([2, 4, 6][q], inner, (x, z) => free(x, z, 1.2), 2, 2.6));
    palms.forEach(p => { ctx.circles.push([p.x, p.z, .45]); occ.push([p.x, p.z, 2]) });
    const palmFb = it => K.scatter(ctx, K.species.palm(0x8a5a2a, 0x2fa04a), K.floraMat(.01), it.map(o => Object.assign({}, o, { s: o.s * .55 })));
    ['palm_a', 'palm_b', 'palm_c'].forEach((k, j) => K.instModel(ctx, 'quaternius/' + k, palms.filter((_, i) => i % 3 === j), palmFb, { sway: .004 }));
    K.field(ctx, K.species.bamboo(0x8ac83a), K.floraMat(.012), K.n(30), { r0: 29, r1: 50 }, { H, s0: .8, s1: 1.3, col: .45, ok: (x, z) => free(x, z, 1.6) });
    const ferns = pick(K.n(26), { r0: 26, r1: 50 }, (x, z) => free(x, z, .6), .22, .38).concat(pick(K.n(8), inner, (x, z) => free(x, z, .6), .2, .3));
    K.instModel(ctx, 'quaternius/fern', ferns, it => K.scatter(ctx, K.species.fern(0x2f9a3a), K.floraMat(.06, { double: true }), it.map(o => Object.assign({}, o, { s: o.s * 5 })), { shadow: false, cell: 48, far: K.far(true) }), { sway: .02, minQ: 1, shadow: false, cell: 48, far: K.far(true) });
    const bushes = pick(K.n(16), { r0: 26, r1: 50 }, (x, z) => free(x, z, 1), 1, 1.8).concat(pick(K.n(6), inner, (x, z) => free(x, z, 1), .9, 1.3));
    bushes.forEach(p => ctx.circles.push([p.x, p.z, .6 * p.s]));
    K.instModel(ctx, 'quaternius/bush', bushes, it => K.scatter(ctx, K.species.bush(0x2f8a3a, 0xff7ab8), K.floraMat(.03), it, { far: K.far(false), cell: 64 }), { sway: .015, far: K.far(false), cell: 64 });
    const fgroups = pick(K.n(16), { r0: 10, r1: 48 }, (x, z) => free(x, z, .5) && Math.hypot(x - DF.x, z - DF.z) > 10, .45, .8);
    K.instModel(ctx, 'quaternius/flower_group', fgroups, it => K.scatter(ctx, K.species.flower(0xff4ad2, 0xffe040), K.floraMat(.15), it.map(o => Object.assign({}, o, { s: o.s * 2.5 })), { shadow: false, cell: 48, far: K.far(true) }), { sway: .05, minQ: 1, shadow: false, cell: 48, far: K.far(true) });
    const shrooms = pick(K.n(10), { r0: 30, r1: 50 }, (x, z) => free(x, z, 1), 3, 6);
    shrooms.forEach(p => ctx.circles.push([p.x, p.z, .12 * p.s]));
    K.instModel(ctx, 'quaternius/mushroom_a', shrooms, it => K.scatter(ctx, K.species.mushroom(0xff4a6a, 0xf4e8d0, 0xffffff), K.floraMat(0), it.map(o => Object.assign({}, o, { s: o.s * .45 })), { far: K.far(false), cell: 64 }), { far: K.far(false), cell: 64 });
    K.field(ctx, K.species.mushroom(0x7ff0ff, 0xf4e8d0, 0xff4ad2), K.floraMat(0), K.n(12), { r0: 30, r1: 50 }, { H, s0: 1, s1: 2.6, ok: (x, z) => free(x, z, .8), col: .15, far: K.far(false), cell: 64 });
    [[0xff4ad2, 0xffe040], [0xffb04a, 0xff4a4a], [0x7ff0ff, 0xffffff], [0xffd23a, 0xe83a30]].forEach(c => K.field(ctx, K.species.flower(c[0], c[1]), K.floraMat(.15), K.n(24), { r0: 9.5, r1: 48 }, { H, s0: .8, s1: 1.7, shadow: false, cell: 48, far: K.far(true), ok: (x, z) => free(x, z, .4) && Math.hypot(x - DF.x, z - DF.z) > 9.6 }));
    K.field(ctx, K.species.giantFlower(0xffd23a, 0xe83a30), K.floraMat(.02), K.n(6), { r0: 28, r1: 46 }, { H, s0: 1.2, s1: 2, ok: (x, z) => free(x, z, 1), col: .2 });
    K.field(ctx, K.species.candyTree(0x5a3a4a, 0x2f8a3a, 0x3aa04a, 0xffd23a), K.floraMat(.006), K.n(14), { r0: 46, r1: 60 }, { H, s0: 1.6, s1: 2.6, ok: (x, z) => Math.hypot(x - POOL.x, z - POOL.z) > 12 && pathDist(x, z) > 1.8 });
    K.motes(ctx, { n: 160, x: 0, z: 0, r: 40, y0: .6, y1: 5, cols: [0xe8ff6a, 0x9aff7a, 0xffd84a], size: 2.6, H, night: true });

    /* ---------- V0.9.7 JUNGLE CINEMA: across the south-east bridge, jungle/cave episodes + ZtonedApe videos (film sound takes over near it) ---------- */
    { const a = deg(-40), sp = polar(a, 37), cx = sp[0], cz = sp[1], ry = Math.atan2(-cx, -cz), gy = H(cx, cz), nx = -Math.cos(a), nz = -Math.sin(a);
      const js = MD.cinemaScreen(ctx, cx, gy + 3.4, cz, ry, 8, { radius: 17, name: 'JUNGLE CINEMA', tags: ['jungle'], shorts: false, glow: 0x30c060 });
      for (const s of [-1, 1]) { const px = cx + Math.cos(ry) * s * 4.7, pz = cz - Math.sin(ry) * s * 4.7; B.misc.add(MT.v, A.geo('cyl6'), 0x8aa83a, K.M(px, H(px, pz) + 3.6, pz, .22, 7.4, .22)); ctx.circles.push([px, pz, .3]) }
      B.misc.add(thatch, A.geo('tent'), 0xffffff, K.M(cx - nx * .4, gy + 7.6, cz - nz * .4, 5.8, 1.6, 1.6, 0, ry, 0));
      for (let r = 0; r < 2; r++) for (let k = -2; k <= 2; k++) { const d = 6 + r * 2.2, x = cx + nx * d + Math.cos(ry) * k * 1.8, z = cz + nz * d - Math.sin(ry) * k * 1.8; B.misc.add(MT.wood, A.geo('cyl'), 0xb08a5a, K.M(x, H(x, z) + .22, z, .55, .44, .55)); ctx.circles.push([x, z, .45]) }
      ctx.T.push({ x: cx + nx * 4.6, z: cz + nz * 4.6, r: 2.4, label: () => tr('Jungle Cinema: choose a film', 'Cine de la Jungla: elegir película'), fn: () => MD.openCinema(js) }) }

    /* =======================================================================================
       V0.9.8 OUTER JUNGLE: five zones beyond the old rim, joined by trails (painted in PATHS)
       ======================================================================================= */
    const hut = (x, z, r, ry, y, cols) => { const fx = Math.sin(ry), fz = Math.cos(ry); y = y == null ? H(x, z) : y;
      B.village.add(MT.stone, A.geo('disc'), 0xb8a080, K.M(x, y + .1, z, r + .4, .25, r + .4)); B.village.add(MT.wood, A.geo('cyl'), 0xe8c890, K.M(x, y + 1.35, z, r, 2.5, r));
      for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; B.village.add(MT.v, A.geo('cyl6'), 0x9a7a3a, K.M(x + Math.cos(a) * (r + .05), y + 1.35, z + Math.sin(a) * (r + .05), .08, 2.6, .08)) }
      B.village.add(MT.v, A.geo('box'), 0x2a1a10, K.M(x + fx * (r + .02), y + 1.1, z + fz * (r + .02), 1, 1.9, .12, 0, ry, 0)); B.village.add(thatch, A.geo('tent'), 0xffffff, K.M(x, y + 2.55, z, r + .9, 2.2, r + .9, 0, ry, 0));
      B.village.add(MT.v, A.geo('sph'), (cols || [0xe83a30, 0xffd23a, 0x30c060])[Math.abs(Math.round(x)) % 3], K.M(x + fx * (r + .5), y + 2.35, z + fz * (r + .5), .2, .26, .2), 1); ctx.circles.push([x, z, r + .2]); occ.push([x, z, r + 2]) };
    const shop = (x, z, label, cost, item, msg) => ctx.T.push({ x, z, r: 2.2, label: () => tr(label[0], label[1]) + ' (' + cost + ')', fn: () => { if (AV.txn(-cost, label[0])) { AV.bag ? AV.bag.add(item, 1, true) : 0; AV.toast(tr(msg[0], msg[1])) } } });
    const ZB = [];   /* beings for the zones */
    /* --- Lotus Lagoon: floating bungalows on stilts with piers, lily pads, boats --- */
    { const Z = ZONES.lagoon; [200, 250, 110, 60].forEach((a, i) => { const s = polar(deg(a), LAG.r + 2.2), w = polar(deg(a), LAG.r - 4.2), bx = LAG.x + w[0], bz = LAG.z + w[1], ry = Math.atan2(-w[0], -w[1]) + Math.PI;
        A.bridge(B.misc, MT, ctx, walk, LAG.x + s[0], LAG.z + s[1], LAG.x + polar(deg(a), LAG.r - 1.6)[0], LAG.z + polar(deg(a), LAG.r - 1.6)[1], { w: 2.2, rise: .5, cRail: 0xe8c030, cPost: 0x8a5a2a });
        for (const [dx, dz] of [[-1.3, -1.3], [1.3, -1.3], [-1.3, 1.3], [1.3, 1.3]]) B.village.add(MT.wood, A.geo('cyl'), 0x6a4a2a, K.M(bx + dx, WY + .3, bz + dz, .12, 1.6, .12));
        B.village.add(MT.wood, A.geo('box'), 0xc8a070, K.M(bx, WY + 1.15, bz, 3.6, .2, 3.6)); hut(bx, bz, 1.5, ry + Math.PI, WY + 1.2, [0x30c060, 0xffd23a, 0xe83a30]); ctx.circles.push([bx, bz, 2]) });
      const lil = []; for (let i = 0; i < [8, 16, 24][q]; i++) { const a = rng() * TAU, r0 = rng() * (LAG.r - 2); lil.push({ x: LAG.x + Math.cos(a) * r0, y: WY + .02, z: LAG.z + Math.sin(a) * r0, s: 1.2 + rng(), ry: rng() * TAU }) }
      K.scatter(ctx, K.species.lotus(0xffa0d8, 0x2f8a4a), K.floraMat(0, { double: true }), lil, { shadow: false });
      const s0 = polar(deg(150), LAG.r + 4); ctx.sign('LOTUS LAGOON · floating bungalows', LAG.x + s0[0] + 6, H(LAG.x + s0[0] + 6, LAG.z + s0[1]) + 3.6, LAG.z + s0[1], Math.atan2(-(LAG.x + s0[0] + 6), -(LAG.z + s0[1])), 5, '#ffa0d8', { posts: true });
      shop(LAG.x + polar(deg(110), LAG.r + 3)[0], LAG.z + polar(deg(110), LAG.r + 3)[1], ['Lagoon bar: coconut', 'Bar de la laguna: coco'], 12, 'coconut', ['Fresh coconut, straw, sunset. Perfect.', 'Coco fresco, pajita, atardecer. Perfecto.']);
      ZB.push({ kind: 'frog', x: LAG.x + 3, z: LAG.z - LAG.r - 2, mode: 'idle', name: 'Lady Croak' }, { kind: 'human', x: LAG.x - LAG.r - 3, z: LAG.z, area: { x: LAG.x, z: LAG.z, r: LAG.r + 5 } }) }
    /* --- Roots Village: Rasta community, bonfire drum circle, ital kitchen, flags --- */
    { const Z = ZONES.roots, [cx, cz] = Z.c, gy = H(cx, cz);
      for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .3, x = cx + Math.cos(a) * 9.5, z = cz + Math.sin(a) * 9.5; hut(x, z, 1.8, Math.atan2(cx - x, cz - z)) }
      B.village.add(MT.stone, A.geo('disc'), 0x6a5a4a, K.M(cx, gy + .1, cz, 1.4, .3, 1.4)); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; B.village.add(MT.wood, A.geo('cyl'), 0x5a3a1a, K.M(cx + Math.cos(a) * .5, gy + .4, cz + Math.sin(a) * .5, .1, 1.1, .1, Math.sin(a) * .5, 0, Math.cos(a) * .5)) }
      const fire = new THREE.Mesh(new THREE.ConeGeometry(.6, 1.4, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, .7, .15), transparent: true, opacity: .85 })); fire.position.set(cx, gy + 1, cz); grp.add(fire); fire.material.userData.lin = 1;
      const fl = new THREE.PointLight(0xff8a3a, 1.4, 16); fl.position.set(cx, gy + 2, cz); grp.add(fl); ctx.circles.push([cx, cz, 1.2]);
      ctx.upd.push((dt, t) => { fire.scale.set(1 + Math.sin(t * 9) * .08, 1 + Math.sin(t * 7) * .15, 1 + Math.cos(t * 8) * .08); fl.intensity = 1.2 + Math.sin(t * 11) * .3 });
      for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, x = cx + Math.cos(a) * 13, z = cz + Math.sin(a) * 13; B.village.add(MT.v, A.geo('cyl6'), 0x8a6a3a, K.M(x, H(x, z) + 2, z, .07, 4, .07)); [0xe83a30, 0xffd23a, 0x30c060].forEach((c, k) => B.village.add(MT.v, A.geo('box'), c, K.M(x + .45, H(x, z) + 3.75 - k * .25, z, .9, .25, .03, 0, a, 0), .2)) }
      shop(cx + 4, cz - 3, ['Ital kitchen: mango + coconut stew', 'Cocina ital: guiso de mango y coco'], 20, 'mango', ['One love, one pot. Energy restored.', 'Un amor, una olla. Energía recuperada.']);
      ctx.sign('ROOTS VILLAGE · one love', cx - 8, gy + 4, cz - 12, Math.atan2(8, 12), 5, '#ffd23a', { posts: true });
      for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .5; ZB.push({ kind: i % 3 === 1 ? 'human' : 'ape', x: cx + Math.cos(a) * 4, z: cz + Math.sin(a) * 4, yaw: Math.atan2(-Math.cos(a), -Math.sin(a)), mode: 'dance' }) }
      ZB.push({ kind: 'ape', x: cx + 6, z: cz + 6, area: { x: cx, z: cz, r: 12 }, name: 'Elder Irie' }) }
    /* --- Treehouse Lounge: giant tree, hammocks, a little performance stage --- */
    { const Z = ZONES.tree, [cx, cz] = Z.c, gy = H(cx, cz);
      B.misc.add(MT.wood, A.geo('cyl'), 0x6a4a2a, K.M(cx, gy + 6, cz, 1.9, 12, 1.9)); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; B.misc.add(MT.wood, A.geo('cyl'), 0x5a3a1a, K.M(cx + Math.cos(a) * 2.2, gy + .5, cz + Math.sin(a) * 2.2, .5, 1.4, .5, Math.sin(a) * .6, 0, -Math.cos(a) * .6)) }
      for (let k = 0; k < 7; k++) { const a = k * 2.4, r0 = 2 + (k % 3) * 2; B.misc.add(MT.v, A.geo('sph'), [0x2f8a3a, 0x3aa04a, 0x267a32][k % 3], K.M(cx + Math.cos(a) * r0, gy + 11 + (k % 2) * 1.6, cz + Math.sin(a) * r0, 4.2, 2.6, 4.2)) }
      B.misc.add(MT.wood, A.geo('box'), 0xc8a070, K.M(cx, gy + 7, cz, 6, .25, 6)); ctx.circles.push([cx, cz, 2.3]);
      for (let k = 0; k < 3; k++) { const a = k / 3 * TAU + .8, x0 = cx + Math.cos(a) * 5, z0 = cz + Math.sin(a) * 5, x1 = cx + Math.cos(a + .7) * 7.5, z1 = cz + Math.sin(a + .7) * 7.5;
        for (const [x, z] of [[x0, z0], [x1, z1]]) { B.misc.add(MT.wood, A.geo('cyl6'), 0x7a5a3a, K.M(x, H(x, z) + 1, z, .1, 2, .1)); ctx.circles.push([x, z, .2]) }
        const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, l = Math.hypot(x1 - x0, z1 - z0); B.misc.add(MT.v, A.geo('box'), [0xe83a30, 0x30c060, 0xffd23a][k], K.M(mx, H(mx, mz) + .75, mz, l * .9, .06, .9, 0, Math.atan2(z1 - z0, x1 - x0) * -1, 0)) }
      const sx = cx + 6, sz = cz - 5; B.misc.add(MT.wood, A.geo('box'), 0xb08a5a, K.M(sx, H(sx, sz) + .3, sz, 4, .6, 3)); walk.pad(sx, sz, 1.8, H(sx, sz) + .6); ctx.sign('HIGH CANOPY CAMP · treehouse lounge', cx - 6, gy + 4, cz - 6, Math.atan2(6, 6), 4.6, '#7aff8a', { posts: true });
      ZB.push({ kind: 'human', x: sx, y: H(sx, sz) + .6, z: sz, mode: 'dance', name: 'Open-Mic Jules' }, { kind: 'spirit', x: cx - 3, z: cz + 4, mode: 'idle' }, { kind: 'ape', x: cx + 3, z: cz + 6, area: { x: cx, z: cz, r: 9 } }) }
    /* --- Healing Garden: raised herb beds, pond, tea hut --- */
    { const Z = ZONES.heal, [cx, cz] = Z.c, gy = H(cx, cz);
      for (let row = 0; row < 4; row++) { const x = cx - 6 + row * 3, z = cz + 2; B.misc.add(MT.wood, A.geo('box'), 0x7a5a3a, K.M(x, gy + .3, z, 1.6, .6, 7)); ctx.cols.push([x - .8, x + .8, z - 3.5, z + 3.5]); B.misc.add(MT.v, A.geo('box'), 0x3a2a1a, K.M(x, gy + .62, z, 1.4, .04, 6.8)) }
      const herbs = []; for (let row = 0; row < 4; row++) for (let k = 0; k < 6; k++) herbs.push({ x: cx - 6 + row * 3 + (rng() - .5) * .5, y: gy + .62, z: cz + 2 - 3 + k * 1.15, s: .8 + rng() * .4, ry: rng() * TAU });
      K.scatter(ctx, K.species.fern(0x3aa83a), K.floraMat(.04, { double: true }), herbs, { shadow: false });
      hut(cx + 7, cz + 7, 2, Math.atan2(-7, -7)); shop(cx + 4.6, cz + 4.6, ['Healing tea hut: herbal tea', 'Cabaña de té curativo: té de hierbas'], 12, 'thai_tea', ['Lemongrass, ginger, a pinch of jungle magic. Vibe up.', 'Hierba limón, jengibre y una pizca de magia de la jungla. Más vibra.']);
      ctx.sign('HERBAL GARDEN · healing plants', cx - 7, gy + 3.6, cz - 6, Math.atan2(7, 6), 4, '#7aff8a', { posts: true });
      ZB.push({ kind: 'human', x: cx - 2, z: cz - 3, area: { x: cx, z: cz, r: 9 }, name: 'Herbalist Noi' }, { kind: 'frog', x: PONDS[0].x - PONDS[0].r - 1, z: PONDS[0].z, mode: 'idle' }) }
    /* --- Hidden Falls: a secret pool behind the rocks, glowing mushrooms, floating spirits --- */
    { const Z = ZONES.falls, P0 = PONDS[1], gy = H(Z.c[0], Z.c[1]);
      const cliff = []; for (let a = -60; a <= 60; a += 15) { const p = polar(deg(210 + a), 7.5); cliff.push([P0.x + p[0], P0.z + p[1]]) } A.boulders(B.rim, MT, cliff, H, rng, { step: 1, s0: 3, s1: 5 });
      const fall = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 6), new THREE.MeshBasicMaterial({ color: 0xbff4ff, transparent: true, opacity: .55, side: THREE.DoubleSide })); const fp = polar(deg(210), 5.8); fall.position.set(P0.x + fp[0], WY + 3, P0.z + fp[1]); fall.rotation.y = Math.atan2(fp[0], fp[1]); grp.add(fall);
      ctx.upd.push((dt, t) => fall.material.opacity = .45 + Math.sin(t * 6) * .08);
      K.scatter(ctx, K.species.mushroom(0x7ff0ff, 0xf4e8d0, 0xff4ad2), K.floraMat(0), Array.from({ length: [6, 10, 14][q] }, () => { const a = rng() * TAU, r0 = P0.r + 1 + rng() * 4, x = P0.x + Math.cos(a) * r0, z = P0.z + Math.sin(a) * r0; return { x, y: H(x, z), z, s: .8 + rng() * 1.4, ry: rng() * TAU } }));
      for (const [dx, dz, c] of [[4, 3, 0xff4ad2], [5.5, .5, 0x7ff0ff], [3, 5, 0xffd23a]]) B.misc.add(MT.v, A.geo('cyl'), c, K.M(Z.c[0] + dx, gy + .2, Z.c[1] + dz, .7, .4, .7));
      ctx.T.push({ x: Z.c[0] + 4, z: Z.c[1] + 3, r: 2, label: () => tr('Chill on the cushions', 'Relajarse en los cojines'), fn: () => { AV.vitals && AV.vitals.add(4, 10); AV.toast(tr('The waterfall hums. Your shoulders drop two inches. Hidden Falls found!', 'La cascada zumba. Tus hombros bajan cinco centímetros. ¡Encontraste Hidden Falls!')) } });
      ZB.push({ kind: 'spirit', x: P0.x + 2, y: 1.6, z: P0.z + 2, mode: 'float', name: 'Waterfall Whisper' }, { kind: 'spirit', x: P0.x - 2, y: 2.4, z: P0.z + 3, mode: 'float' }) }
    /* outer jungle vegetation (trees, bamboo, flowers) + birds + the zone residents */
    const okOut = (x, z) => free(x, z, 1.8) && Math.hypot(x, z) > 56 && zoneFlat(x, z) < .2;
    K.field(ctx, K.species.palm(0x8a5a2a, 0x2fa04a), K.floraMat(.01), K.n(20), { r0: 56, r1: 100 }, { H, s0: 1, s1: 1.8, col: .45, ok: okOut, far: K.far(false), cell: 64 });
    K.field(ctx, K.species.candyTree(0x5a3a4a, 0x2f8a3a, 0x3aa04a, 0xffd23a), K.floraMat(.006), K.n(15), { r0: 58, r1: 104 }, { H, s0: 1.6, s1: 2.8, col: .6, ok: okOut, far: K.far(false), cell: 64 });
    K.field(ctx, K.species.bamboo(0x8ac83a), K.floraMat(.012), K.n(20), { r0: 56, r1: 100 }, { H, s0: .8, s1: 1.4, col: .45, ok: okOut, far: K.far(false), cell: 64 });
    [[0xff4ad2, 0xffe040], [0x7ff0ff, 0xffffff], [0xffd23a, 0xe83a30]].forEach(c => K.field(ctx, K.species.flower(c[0], c[1]), K.floraMat(.15), K.n(18), { r0: 54, r1: 100 }, { H, s0: .8, s1: 1.6, shadow: false, cell: 48, far: K.far(true), ok: (x, z) => free(x, z, .4) && Math.hypot(x, z) > 54 }));
    if (AV.city && AV.city.birds) AV.city.birds(ctx, [{ x: ZONES.roots.c[0], z: ZONES.roots.c[1], r: 18, y: 18, n: 8 }, { x: LAG.x, z: LAG.z, r: 20, y: 10, n: 10 }, { x: ZONES.tree.c[0], z: ZONES.tree.c[1], r: 10, y: 14, n: 6 }]);
    AV.beings.spawn(ctx, ZB.slice(0, [10, 16, 99][q]).map((b, i) => Object.assign({ seed: 120 + i }, b)));

    /* ---------- flush batches ---------- */
    for (const k in B) B[k].flush(ctx);

    /* ---------- animation: everything follows AV.audio.beat (real track or procedural fallback) ---------- */
    const mtx = new THREE.Matrix4();
    ctx.upd.push((dt, t) => {
      const on = AV.audio && AV.audio.on && (AV.audio.ok || (AV.audio.track && AV.audio.track.active)), beat = on ? AV.audio.beat : t * 1.2, red = AV.S.set.reduce ? .3 : 1, nk = AV.nightK || 0;
      const kickP = Math.pow(Math.max(0, Math.cos(beat * Math.PI)), 6), drop = Math.pow(Math.max(0, Math.cos((beat - 2) * Math.PI / 2)), 10);   // every beat + the "one-drop" on beat 3
      lamp.forEach((l, i) => l.intensity = 1 + Math.abs(Math.sin(beat * Math.PI * .5 + i)) * 1.2 * red);
      bongo.userData.aR.rotation.x = -.9 + Math.abs(Math.sin(beat * Math.PI)) * .4; bongo.userData.head.rotation.z = Math.sin(beat * Math.PI * .5) * .1;
      wooferPos.forEach((w, i) => { const p = (i % 2 ? kickP : Math.max(kickP * .6, drop)) * red; mtx.makeScale(w[3], w[3], w[3] * (1 + p * 1.6)); mtx.setPosition(w[0], w[1], w[2] + p * .05); woof.setMatrixAt(i, mtx); mtx.makeScale(1, 1, 1); mtx.setPosition(w[0], w[1], w[2] + .1 + p * .14); caps.setMatrixAt(i, mtx) });
      woof.instanceMatrix.needsUpdate = caps.instanceMatrix.needsUpdate = true; caps.material.emissiveIntensity = .3 + drop * 1.5 * red;
      decks.forEach((d, i) => d.rotation.y += dt * (on ? 3.5 : .6) * (i ? 1 : -1));
      fm.emissiveIntensity = (.05 + nk * (.25 + drop * .6 * red)) * (on ? 1 : .5);
      beams.forEach((b, i) => { b.visible = nk > .15; b.rotation.x = -.55 + Math.sin(beat * Math.PI * .25 + i) * .3 * red; b.rotation.z = Math.sin(beat * Math.PI * .125 + i * 1.7) * .45 * red; b.material.opacity = (.04 + .1 * nk) * (.6 + .6 * (i % 2 ? kickP : drop)) });
    });
    ctx.leave.push(() => MD.resetFrames());

    /* V1.0 places (stand in front, facing the venue) */
    const V1P = [['river_bar', 'River Bar', 'River Bar', V1.bar, 25.3], ['bazaar', 'Bamboo Bazaar', 'Bazar de Bambú', AP(73, 38.5), 0], ['dub_lab', 'Dub Lab', 'Dub Lab', V1.lab, 35], ['temple', 'Jungle Temple', 'Templo de la Jungla', V1.temple, 0], ['grove', 'Mushroom Grove', 'Arboleda de Setas', V1.grove, 37.5], ['band', 'Jungle Rave stage (Stone Ape Band)', 'Escenario Jungle Rave (Stone Ape Band)', [SX, SZ], 0]].map(([id, en, es, c, r]) => {
      let p; if (id === 'temple') p = loc(c[0], c[1], npcYaw(c[0], c[1], 0, -30), 0, 7.6); else if (id === 'band') p = [SX, SZ + 3.9]; else if (id === 'bazaar') { const B0 = V1.bazaarA, B1 = V1.bazaarB, dx = B1[0] - B0[0], dz = B1[1] - B0[1], l = Math.hypot(dx, dz); p = [B0[0] + dx * .36 - dz / l * 1.2, B0[1] + dz * .36 + dx / l * 1.2]; c = [B0[0] + dx * .42 - dz / l * 3.6, B0[1] + dz * .42 + dx / l * 3.6] } else p = AP(Math.atan2(c[1], c[0]) * 180 / Math.PI, r);
      const tc = c; return { id, name: [en, es], x: p[0], z: p[1], yaw: faceYaw(p[0], p[1], tc[0], tc[1]) } });
    const artFront = polar(deg(36), 12.6), artMid = polar(deg(29), 15.5);    // between two dance-floor poles, facing the middle of the arc
    return { name: 'Jungle Dub Party Planet', fog: [36, 210], sky: { tint: [0x2a7a60, 0x3a8a50, .55, .5], dome: { s1: 0xe8c030, s2: 0x30c060, swirl: .4, cloud: .9 } },
      surface: (x, z) => { if (Math.hypot(x, z) >= R) return null; const b = walk.bridgeAt(x, z); if (b !== undefined) return Math.max(b, H(x, z)); if (waterDepth(x, z) > -.25) return WY; const h = H(x, z), p = walk.at(x, z); return p === undefined ? h : Math.max(p, h) },
      arrivals: { default: { x: 0, z: 22, yaw: 0 }, pipe: { x: 0, z: 14, yaw: 0 }, ape_gate: { x: 0, z: 24, yaw: 0 } },
      places: [{ id: 'sound', name: ['Sound system', 'Sistema de sonido'], x: 0, z: 1, yaw: 0 }, { id: 'bongo', name: ['Bongo', 'Bongo'], x: -6, z: 6, yaw: .6 }, { id: 'art', name: ['Bamboo art wall', 'Muro de arte de bambú'], x: artFront[0], z: artFront[1], yaw: faceYaw(artFront[0], artFront[1], artMid[0], artMid[1]) }, { id: 'arch', name: ['Gold arch', 'Arco dorado'], x: 0, z: 25, yaw: 0 }].concat([['lagoon', 'Lotus Lagoon', 'Laguna del Loto', 150, 64], ['roots', 'Roots Village', 'Aldea Roots', 30, 64], ['tree', 'High Canopy Camp (Treehouse Lounge)', 'Campamento del Dosel (Salón del Árbol)', 95, 62], ['heal', 'Herbal Garden (Healing Garden)', 'Jardín de Hierbas (Jardín Curativo)', -60, 62], ['falls', 'Crystal Waterfalls (Hidden Falls)', 'Cascadas de Cristal (Cascada Escondida)', 210, 77]].map(([id, en, es, a, r]) => { const p = AP(a, r), c = ZONES[id].c; return { id, name: [en, es], x: p[0], z: p[1], yaw: faceYaw(p[0], p[1], c[0], c[1]) } })).concat(V1P),
      defaultArrival: 'default', musicProfile: { bpm: 72, root: 43, scale: [0, 3, 5, 7, 10], style: 'dub' }, stage: { pos: { x: SX, y: SY + 3, z: SZ } },
      music: { playlist: 'jungle_dub', pos: { x: SX, y: SY + 3, z: SZ }, bed: .4 } };   // V0.9.3: real dub tracks from the sound system (procedural profile = fallback)
  }
});
})(window.AV);
