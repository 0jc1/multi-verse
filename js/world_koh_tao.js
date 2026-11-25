/* APEVERSE 2.0 - world_koh_tao.js : M15 new destination, KOH TAO (Sairee Beach + Sairee village + Mae Haad pier), authored,
   compact, quality first.  1 m = 1 m.  North is -z, the Gulf of Thailand is to the WEST (sunsets over the sea).
   - Sairee Beach: a long curved bay of pale sand with coconut palms and the island's rounded granite boulders at both ends.
   - Sairee village: a narrow concrete walking lane behind the beach (dive centres, cafés, a mini mart, roti, massage...),
     beachfront bars between the lane and the sand, five sois (alleys) to the beach -> several walking loops.
   - Hill road up the jungle slope to a boulder viewpoint; Mae Haad pier in the south with the ferry (travel map).
   - ENTERABLE: Blue Turtle Divers (real door, interior: counter, wetsuits, tanks, fins, briefing board).
   - ACTIVITY: snorkelling the house reef. Get a mask + snorkel at the dive shop, wade in past the shallows and you see under
     the water (blue fog, light shafts): coral heads, sea fans and 7 reef species to log (parrotfish, butterflyfish, pink
     anemonefish, yellowtail barracuda school, blue-spotted stingray, hawksbill turtle, blacktip reef shark). Log all 7 ->
     Reef Explorer card + reward.  Without a mask you can only wade the shallows.
   - Life: walkers on the lane + beach, people at the bars, divers, a longtail captain; fire show at Firefly Beach Bar 20:00-01:00
     (fire poi, torches, fairy lights); "Sairee Fire Night" festival every Friday (AV.fest calendar: more dancers + beach lanterns).
   - Sound: waves by the shore, bar reggae, longtail engines, geckos + insects at night, chatter in the lane.
   All business names are fictional.  AV.kohtao (debug + tests) */
'use strict';
(function (AV) {
const TAU = Math.PI * 2, tr = AV.tr, L = (e, s) => [e, s], say = a => tr(a[0], a[1]);
const XMIN = -175, XMAX = 150, ZMIN = -150, ZMAX = 178, SEAY = 0;
const ss = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t) };
const shoreX = z => -38 + 4 * Math.sin(z * .021) - (z > 120 ? (z - 120) * .1 : 0);
const LANE = 0, PIER = { z: 165, x0: -112, x1: -24, w: 4.5 }, VIEW = [96, -46], REEF = { z0: -70, z1: 70 };
const SOIS = [-90, -45, 0, 45, 90];
function H(x, z) { const sx = shoreX(z), n = Math.sin(x * .13) * Math.cos(z * .11) * .25 + Math.sin(x * .05 + z * .07) * .2;
  if (x < sx) { const d = sx - x; let h = -Math.min(5.5, d * .1 + d * d * .0016); if (z > REEF.z0 && z < REEF.z1 && d > 12 && d < 48) h = Math.max(h, -3.2 + Math.sin(x * .4) * Math.cos(z * .35) * .5); return h + n * .4 }
  if (x < -13) return (x - sx) * .045 + .05;
  const vil = 1.25; if (x < 22) return vil;
  const hill = Math.pow(ss(22, 120, x), 1.25) * 34 * (1 - ss(120, 175, Math.abs(z - 10))), vp = Math.hypot(x - VIEW[0], z - VIEW[1]) < 12 ? 1 : 0;
  return vil + hill + n * 2 * ss(30, 60, x) + vp * 0 }
const inPier = (x, z) => x > PIER.x0 && x < PIER.x1 && Math.abs(z - PIER.z) < PIER.w / 2;
const SPECIES = [
  { id: 'parrot', n: L('Parrotfish', 'Pez loro'), col: 0x3ad8a8, col2: 0x2a6ae8, len: .55, n0: 8, z: -40, depth: -1.8, r: 6, sp: .5 },
  { id: 'butterfly', n: L('Butterflyfish', 'Pez mariposa'), col: 0xffd84a, col2: 0x202020, len: .22, n0: 12, z: -10, depth: -1.6, r: 4, sp: .7 },
  { id: 'anemone', n: L('Pink anemonefish', 'Pez payaso rosa'), col: 0xff9a7a, col2: 0xffffff, len: .14, n0: 5, z: 18, depth: -2.6, r: 1.2, sp: .4 },
  { id: 'barracuda', n: L('Yellowtail barracuda (school)', 'Barracuda cola amarilla (banco)'), col: 0xc8d0d8, col2: 0xf0e040, len: .6, n0: 26, z: 44, depth: -1.4, r: 7, sp: .9 },
  { id: 'ray', n: L('Blue-spotted stingray', 'Raya de puntos azules'), col: 0xa88a5a, col2: 0x3a8aff, len: .5, n0: 2, z: -58, depth: -3.6, r: 3, sp: .2, flat: true },
  { id: 'turtle', n: L('Hawksbill turtle', 'Tortuga carey'), col: 0x7a5a2a, col2: 0xd8c08a, len: 1, n0: 1, z: 60, depth: -2.2, r: 10, sp: .25, turtle: true },
  { id: 'shark', n: L('Blacktip reef shark', 'Tiburón de puntas negras'), col: 0x8a96a0, col2: 0x111111, len: 1.3, n0: 1, z: -66, depth: -2.8, r: 14, sp: .55 } ];
const KT = AV.kohtao = { SPECIES, H, shoreX, PIER, SOIS, stats: {} };

AV.registerWorld({
  id: 'koh_tao',
  build(ctx) {
    const K = AV.kit, CY = AV.city, q = ctx.q, rng = ctx.rng, grp = ctx.group, S = AV.S;
    const st = () => { S.kohtao = S.kohtao || { log: {}, card: false }; return S.kohtao };
    const T = (x, z, r, label, fn, show) => { const t = { x, z, r, label, fn, show }; ctx.T.push(t); return t };
    const hour = () => (S.time / 60) % 24, night = () => { const h = hour(); return h >= 18.5 || h < 6 }, fireOn = () => { const h = hour(); return h >= 20 || h < 1 };
    const fest = () => !!(AV.fest && AV.fest.active && AV.fest.active('sairee_fire_night'));
    const plaster = [], wood = [], roof = [], glow = [], rockP = [], sandP = [];
    const B = (arr, col, x, y, z, sx, sy, sz, ry) => arr.push([K.BG.box, col, K.M(x, y, z, sx, sy, sz, 0, ry || 0, 0)]);
    const Cy = (arr, col, x, y, z, r, h) => arr.push([K.BG.cyl, col, K.M(x, y, z, r, h, r)]);
    const wall = (x0, x1, z0, z1, y0, y1, arr, col) => { B(arr, col, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, x1 - x0, y1 - y0, z1 - z0); ctx.cols.push([x0, x1, z0, z1]) };

    /* ---------- terrain + sea ---------- */
    AV.terrain(ctx, 360, [120, 170, 220][q], H, (x, z, h) => { const sx = shoreX(z), n = Math.sin(x * .7) * Math.cos(z * .6) + Math.sin(x * .19 + z * .23);
      if (x < sx) return h > -1.2 ? 0xd8c08a : h > -2.6 ? (n > .3 ? 0xb8a070 : 0xc8b07e) : 0x8a7a5a;
      if (x < sx + 3) return 0xc8ac78; if (x < -13) return n > .8 ? 0xe2c896 : 0xe8d2a2;
      if (x < 22) return 0x7e7462; return h > 10 ? (n > 0 ? 0x2e6a32 : 0x3a7a36) : n > .3 ? 0x4a8a3a : 0x568a3e });
    const sea = K.waterPlane(ctx, new THREE.PlaneGeometry(260, 380, 1, 1), SEAY, { deep: 0x0a5a7a, shallow: 0x2ac8c0, iri: .08, sky: 0x9ad8e8, opacity: .86 }); sea.position.set(-160, SEAY, 20);
    const under = new THREE.Mesh(new THREE.PlaneGeometry(260, 380), new THREE.MeshBasicMaterial({ color: 0x6ad8e8, transparent: true, opacity: .35, side: THREE.BackSide, depthWrite: false })); under.rotation.x = -Math.PI / 2; under.position.set(-160, SEAY - .02, 20); grp.add(under);   /* the surface seen from below */

    /* ---------- Sairee lane: concrete strip + shops ---------- */
    B(plaster, 0x8e887c, LANE, 1.27, 15, 4.2, .04, 250);
    const SH = [['BLUE TURTLE DIVERS', null], ['ISLAND MART', 0x2a8a4a], ['SAIREE ROTI', 0xd88a3a], ['COCONUT CAFÉ', 0x8a5a3a], ['THAI MASSAGE', 0x8a3a6a], ['MANGO STICKY RICE', 0xe8a83a], ['REEF DIVE CENTRE', 0x2a6aa8], ['TATTOO', 0x1a1a1e], ['SCOOTER RENT', 0xc83a2a], ['BOOK EXCHANGE', 0x5a7a3a], ['LAUNDRY', 0x3a8aa8], ['SMOOTHIES', 0xd84a8a]];
    const PLAS = [0xe8c890, 0x8ac8b8, 0xe8a088, 0xd8d0b0, 0x98b8d8], ROOF = [0x8a4a32, 0x3a6a8a, 0xb88a4a, 0x6a6a6a, 0x9a3a2a];
    const shop = (side, zc, w, name, col, k) => { const s = side, fx = s * 2.6, bx = s * 11, d = Math.abs(bx - fx), cx = (fx + bx) / 2, h = 3.4;
      wall(Math.min(bx, bx - s * .3), Math.max(bx, bx - s * .3), zc - w / 2, zc + w / 2, 1.25, 1.25 + h, plaster, PLAS[k % 5]);
      for (const e of [-1, 1]) wall(Math.min(fx, bx), Math.max(fx, bx), zc + e * (w / 2) - .15, zc + e * (w / 2) + .15, 1.25, 1.25 + h, plaster, PLAS[k % 5]);
      B(roof, ROOF[k % 5], cx, 1.25 + h + .2, zc, d + 1.6, .3, w + .6); B(glow, 0xffe0a0, fx + s * .2, 1.25 + h - .3, zc, .08, .12, w - .6);
      B(wood, 0x6a4a2a, fx + s * 2, 1.7, zc, 1.2, .9, Math.min(3, w - 2)); if (col != null) ctx.sign(name, fx - s * .15, 1.25 + h - .7, zc, s > 0 ? -Math.PI / 2 : Math.PI / 2, Math.min(w - .6, 4.2), '#' + col.toString(16).padStart(6, '0'), {}) };
    let k = 0; for (let z = -110; z <= 110; z += 10) { if (SOIS.some(s => Math.abs(s - z) < 6)) continue; if (z > -14 && z < 0) continue; const nm = SH[(k % (SH.length - 1)) + 1]; shop(1, z, 9.4, nm[0], nm[1], k); k++ }
    /* west side of the lane: beachfront bars + bungalows, with gaps at the sois */
    const BARS = [{ z: 20, n: 'FIREFLY BEACH BAR', col: '#ff8a3a', fire: true }, { z: -66, n: 'LAZY TIDE BAR', col: '#4ad8ff' }, { z: 66, n: 'SUNSET SWING', col: '#ffd84a' }];
    for (let z = -112; z <= 112; z += 14) { if (SOIS.some(s => Math.abs(s - z) < 7) || BARS.some(b => Math.abs(b.z - z) < 9)) continue; const x0 = -12.5, x1 = -3; B(wood, 0x8a6a46, (x0 + x1) / 2, 1.25 + 1.6, z, x1 - x0, 3.2, 8.4); ctx.cols.push([x0, x1, z - 4.2, z + 4.2]); B(roof, 0xb89a5a, (x0 + x1) / 2, 4.6, z, x1 - x0 + 1.4, .35, 9.4) }   /* bungalow blocks */
    const barSpots = [];
    for (const b of BARS) { const x = -10; B(wood, 0x7a5a36, x, 1.25 + .05, b.z, 9, .1, 10); for (const e of [-1, 1]) for (const f of [-1, 1]) Cy(wood, 0x5a3a20, x + e * 4, 1.25 + 1.6, b.z + f * 4.6, .12, 3.2); B(roof, 0xc8a860, x, 4.6, b.z, 10, .3, 11);
      B(wood, 0x5a3a22, x + 3.6, 1.8, b.z, .8, 1.1, 5); ctx.cols.push([x + 3.2, x + 4, b.z - 2.5, b.z + 2.5]); ctx.sign(b.n, -3.2, 3.9, b.z, -Math.PI / 2, 4.6, b.col, {});
      for (let i = 0; i < 6; i++) { const bx = -17 - (i % 3) * 2.4, bz = b.z - 3 + (i >> 1 & 1) * 6 + (i % 2) * .6, c = [0xff4ad2, 0x4ad8ff, 0xffd84a, 0x7aff8a, 0xff8a3a][i % 5]; sandP.push([K.BG.sph || K.BG.box, c, K.M(bx, H(bx, bz) + .3, bz, .9, .45, .9)]); barSpots.push([bx, bz]) }
      if (K.lanterns) K.lanterns(ctx, [[-6, 4.2, b.z - 5], [-14, 3.6, b.z - 5.5], [-22, 3, b.z - 5]], { per: 6, sag: .4 }) }
    /* ---------- the enterable dive shop (real door facing the hill-road soi) ---------- */
    const DV = { x: 8, z: -8, w: 10, d: 9 };
    ctx.building(DV.x, DV.z, DV.w, DV.d, 3.6, 0xe8f0f4, DV.x - 1.5, { y: 1.19, roof: 0x2a6aa8, floor: 0x9ab8c8 });   /* y < 1.2: ctx.wall only makes walls solid when they start below 1.2 m */
    ctx.sign('BLUE TURTLE DIVERS', DV.x, 1.25 + 4.1, DV.z + DV.d / 2 + .05, 0, 5, '#2a6aa8', {});
    { const y = 1.25, x0 = DV.x - DV.w / 2, z0 = DV.z - DV.d / 2; B(wood, 0x6a4a2a, DV.x + 2.6, y + .55, DV.z - 1.6, 3, 1.1, .8); ctx.cols.push([DV.x + 1.1, DV.x + 4.1, DV.z - 2, DV.z - 1.2]);
      for (let i = 0; i < 5; i++) { B(plaster, [0x111418, 0x1a2a3a, 0x2a3a5a, 0x111418, 0x3a1a2a][i], x0 + .5, y + 1.3, z0 + 1.2 + i * .7, .12, 1.6, .5) } B(wood, 0x3a3a3a, x0 + .6, y + 2.2, z0 + 2.6, .08, .06, 3.6);
      for (let i = 0; i < 6; i++) Cy(plaster, [0xe8e83a, 0xc8c8c8, 0xe8e83a, 0x3a6ae8, 0xc8c8c8, 0xe8e83a][i], DV.x - 3.2 + i * .45, y + .45, z0 + .5, .17, .9);
      for (let i = 0; i < 4; i++) B(glow, [0xffd84a, 0xff4ad2, 0x4ad8ff, 0x7aff8a][i], DV.x + DV.w / 2 - .25, y + 1.6 + (i % 2) * .5, DV.z - 2.5 + (i >> 1) * 1.2, .05, .5, .22);
      const bd = AV.kit.signTex ? null : null; ctx.sign('DIVE BRIEFING · REEF RULES: look, never touch', DV.x - .5, y + 2.2, z0 + .25, 0, 3.6, '#ffffff', {}) }
    const counter = T(DV.x + 2.6, DV.z - .4, 1.8, () => tr('🤿 Blue Turtle Divers: snorkel gear, reef log, briefing', '🤿 Blue Turtle Divers: equipo de snorkel, registro del arrecife'), () => KT.panel());
    /* ---------- Mae Haad pier + ferry ---------- */
    B(wood, 0x8a7050, (PIER.x0 + PIER.x1) / 2, 1.5, PIER.z, PIER.x1 - PIER.x0, .2, PIER.w); for (let x = PIER.x0 + 2; x < PIER.x1; x += 6) for (const e of [-1, 1]) Cy(wood, 0x4a3a2a, x, -1.5, PIER.z + e * (PIER.w / 2 - .2), .18, 6);
    B(plaster, 0xf0f0f0, PIER.x0 + 9, 1.1, PIER.z - 6.5, 22, 2.2, 6); B(plaster, 0x2a6aa8, PIER.x0 + 9, 2.4, PIER.z - 6.5, 20, 1, 5.4); B(glow, 0xfff4d0, PIER.x0 + 9, 2.4, PIER.z - 3.75, 18, .5, .06);   /* the ferry alongside */
    ctx.sign('MAE HAAD PIER', PIER.x1 - 2, 4, PIER.z + 3, -Math.PI / 2, 4.4, '#ffd84a', { posts: true });
    T(PIER.x1 - 8, PIER.z, 2.4, () => tr('🛳 Ferry office: island hopping (travel map)', '🛳 Oficina del ferry: saltar de isla (mapa de viaje)'), () => AV.toggleMap && AV.toggleMap());
    B(plaster, 0xb8b0a0, -12, 1.27, PIER.z, 26, .04, 6); B(plaster, 0xb8b0a0, LANE, 1.27, 140, 4.2, .04, 50);
    /* ---------- hill road + viewpoint ---------- */
    const road = []; for (let x = 2; x < VIEW[0] - 6; x += 2) { const z = x < 22 ? 0 : -(x - 22) * .62; road.push([x, z]) }
    for (let i = 1; i < road.length; i++) { const [x0, z0] = road[i - 1], [x1, z1] = road[i], mx = (x0 + x1) / 2, mz = (z0 + z1) / 2; B(plaster, 0xa8a090, mx, H(mx, mz) + .05, mz, 3.6, .1, Math.hypot(x1 - x0, z1 - z0) + .3, Math.atan2(x1 - x0, z1 - z0)) }
    ctx.sign('VIEWPOINT · ROCKS · 800 m', 20, 3.4, 2.6, 0, 3.4, '#7aff8a', { posts: true });
    T(VIEW[0], VIEW[1] + 3, 4, () => tr('🪨 Sairee viewpoint: watch the bay', '🪨 Mirador de Sairee: contemplar la bahía'), () => { AV.vitals && AV.vitals.add(0, 6); AV.toast(tr('The whole bay below: longtails, the reef darker under the turquoise, the pier, the ferry turning.', 'Toda la bahía abajo: longtails, el arrecife más oscuro bajo el turquesa, el muelle, el ferry virando.')) });
    /* ---------- granite boulders (headlands, the viewpoint, in the sea) ---------- */
    const rockG = K.species && K.species.rock ? K.species.rock(0xb8a898) : new THREE.IcosahedronGeometry(1, 1), rocks = [];
    const addRock = (x, z, s, col) => { rocks.push({ x, y: H(x, z) + s * .25, z, s, ry: rng() * TAU }); if (H(x, z) > -1.2) ctx.circles.push([x, z, s * .55]) };
    for (let i = 0; i < 16; i++) addRock(shoreX(-128 - i * 1.2) + rng() * 22 - 6, -124 - rng() * 22, 2.5 + rng() * 4);
    for (let i = 0; i < 12; i++) addRock(shoreX(124 + i * 2) + rng() * 16 - 8, 122 + rng() * 26, 2.2 + rng() * 3.4);
    for (let i = 0; i < 9; i++) addRock(VIEW[0] + (rng() - .5) * 20, VIEW[1] + (rng() - .5) * 16 - 6, 3 + rng() * 4);
    for (let i = 0; i < 7; i++) addRock(shoreX(0) - 30 - rng() * 40, -100 + rng() * 200, 1.8 + rng() * 2.5);
    K.scatter(ctx, rockG, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .92 }), rocks, { shadow: true, cell: 60 });
    /* ---------- palms + jungle ---------- */
    const palms = []; for (let z = -118; z < 120; z += 7 + rng() * 4) { const x = -15 - rng() * 6; if (BARS.some(b => Math.abs(b.z - z) < 7) || SOIS.some(s => Math.abs(s - z) < 2.5)) continue; palms.push({ x, y: H(x, z), z, s: 2 + rng() * 1.2, ry: rng() * TAU }) }
    for (let i = 0; i < [30, 60, 90][q]; i++) { const x = 26 + rng() * 110, z = -120 + rng() * 260; if (Math.abs(z - (x < 22 ? 0 : -(x - 22) * .62)) < 5 || Math.hypot(x - VIEW[0], z - VIEW[1]) < 14) continue; palms.push({ x, y: H(x, z), z, s: 1.8 + rng() * 1.4, ry: rng() * TAU }) }
    palms.forEach(p => { if (p.x < 22) ctx.circles.push([p.x, p.z, .35]) });
    const palmFb = it => K.scatter(ctx, K.species.palm(0x8a6a4a, 0x2fa04a), K.floraMat(.01), it.map(o => Object.assign({}, o, { s: o.s * .55 })), { far: K.far(false), cell: 70 });
    ['palm_a', 'palm_b', 'palm_c'].forEach((key, j) => K.instModel(ctx, 'quaternius/' + key, palms.filter((_, i) => i % 3 === j), palmFb, { sway: .004, far: K.far(false), cell: 70 }));
    K.scatter(ctx, K.species.bush(0x3a8a3a), K.floraMat(.04), Array.from({ length: [60, 110, 160][q] }, () => { const x = 24 + rng() * 120, z = -130 + rng() * 270; return Math.abs(z - -(x - 22) * .62) < 4 ? null : { x, y: H(x, z), z, s: 1.2 + rng() * 1.5 } }).filter(Boolean), { shadow: false, cell: 60, far: K.far(true) });
    /* ---------- longtail boats (bobbing) + reef ---------- */
    const boats = []; for (const [z, c] of [[-30, 0xff4ad2], [8, 0x4ad8ff], [52, 0xffd84a]]) { const g = new THREE.Group(), x = shoreX(z) - 16; g.position.set(x, SEAY - .1, z); g.rotation.y = .3;
      const hull = new THREE.Mesh(new THREE.BoxGeometry(1.4, .7, 9), new THREE.MeshStandardMaterial({ color: 0x8a5a2a, roughness: .8 })); hull.position.y = .2; g.add(hull); const prow = new THREE.Mesh(new THREE.ConeGeometry(.5, 2.4, 4), new THREE.MeshStandardMaterial({ color: 0x8a5a2a })); prow.rotation.x = -Math.PI / 2 - .6; prow.position.set(0, .9, -5.2); g.add(prow);
      const rib = new THREE.Mesh(new THREE.BoxGeometry(.6, .05, .8), new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: .3 })); rib.position.set(0, 1.6, -5.6); g.add(rib); const roofB = new THREE.Mesh(new THREE.BoxGeometry(1.6, .06, 4), new THREE.MeshStandardMaterial({ color: 0x3a8ac8 })); roofB.position.set(0, 1.8, .5); g.add(roofB); grp.add(g); boats.push(g) }
    const coralCols = [0xff6a8a, 0xffa84a, 0xb84aff, 0x4ad8c8, 0xffd84a, 0xe84a4a], corals = [], fans = [];
    for (let i = 0; i < [120, 220, 320][q]; i++) { const z = REEF.z0 + rng() * (REEF.z1 - REEF.z0), x = shoreX(z) - 14 - rng() * 32, y = H(x, z); corals.push({ x, y, z, s: .5 + rng() * 1.1, ry: rng() * TAU, c: coralCols[i % 6] }); if (i % 4 === 0) fans.push({ x: x + .8, y, z: z + .4, s: .8 + rng(), c: coralCols[(i + 2) % 6] }) }
    const coralM = new THREE.MeshStandardMaterial({ roughness: .7, emissive: 0x111111 }), coralIM = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(.6, 1), coralM, corals.length), cc = new THREE.Color();
    corals.forEach((c, i) => { coralIM.setMatrixAt(i, K.M(c.x, c.y + c.s * .3, c.z, c.s, c.s * .7, c.s, 0, c.ry, 0)); coralIM.setColorAt(i, cc.setHex(c.c)) }); coralIM.instanceMatrix.needsUpdate = true; coralIM.instanceColor.needsUpdate = true; grp.add(coralIM);
    const fanIM = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.2, 1.4), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: .8, transparent: true, opacity: .85 }), fans.length);
    fans.forEach((c, i) => { fanIM.setMatrixAt(i, K.M(c.x, c.y + .7 * c.s, c.z, c.s, c.s, c.s, 0, i * 1.3, 0)); fanIM.setColorAt(i, cc.setHex(c.c)) }); fanIM.instanceMatrix.needsUpdate = true; fanIM.instanceColor.needsUpdate = true; grp.add(fanIM);
    /* ---------- reef life: instanced fish per species, schooling around a home spot ---------- */
    const fishG = new THREE.ConeGeometry(.5, 1, 6); fishG.rotateX(Math.PI / 2); const turtleG = new THREE.SphereGeometry(.6, 10, 6); turtleG.scale(1, .35, 1.3); const rayG = new THREE.CircleGeometry(.6, 10); rayG.rotateX(-Math.PI / 2);
    const fish = SPECIES.map((sp, si) => { const hx = shoreX(sp.z) - 22 - (si % 3) * 6, home = { x: hx, y: Math.max(H(hx, sp.z) + .6, sp.depth), z: sp.z }; const geo = sp.turtle ? turtleG : sp.flat ? rayG : fishG;
      const im = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color: sp.col, emissive: sp.col2, emissiveIntensity: .12, roughness: .5 }), sp.n0); im.frustumCulled = false; grp.add(im);
      const ind = Array.from({ length: sp.n0 }, (_, i) => ({ a: rng() * TAU, r: sp.r * (.4 + rng() * .6), y: (rng() - .5) * .8, w: sp.sp * (.7 + rng() * .6) * (rng() < .5 ? 1 : -1) })); return { sp, home, im, ind } });
    KT.fish = fish;
    /* ---------- snorkel mode ---------- */
    const veil = document.createElement('div'); veil.id = 'ktVeil'; veil.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:5;display:none;background:radial-gradient(ellipse at 50% 40%,rgba(80,200,230,.05) 30%,rgba(5,40,70,.55) 100%)'; document.body.appendChild(veil);
    const hud = document.createElement('div'); hud.id = 'ktHud'; hud.style.cssText = 'position:fixed;left:50%;top:64px;transform:translateX(-50%);z-index:6;display:none;font:13px Georgia,serif;color:#e8fbff;background:rgba(5,40,70,.6);padding:4px 12px;border-radius:12px'; document.body.appendChild(hud);
    ctx.leave.push(() => { veil.remove(); hud.remove(); KT.snork = false });
    const hasMask = () => AV.bag && AV.bag.count && AV.bag.count('kt_mask') > 0;
    const deepAt = (x, z) => x < shoreX(z) && H(x, z) < -1.1;
    let spotT = {}; KT.snork = false;
    function logSpecies(sp) { const s = st(); if (s.log[sp.id]) return; s.log[sp.id] = AV.S.day; AV.vitals && AV.vitals.add(0, 5); AV.txn(10, tr('Reef log: ', 'Registro: ') + say(sp.n)); AV.toast('🐠 ' + tr('Logged: ', 'Registrado: ') + say(sp.n) + ' (' + Object.keys(s.log).length + '/' + SPECIES.length + ')'); KT.stats.logged = Object.keys(s.log).length;
      if (Object.keys(s.log).length === SPECIES.length && !s.card) { s.card = true; AV.bag && AV.bag.add('kt_reef_card'); AV.txn(150, tr('Reef Explorer', 'Explorador del arrecife')); AV.toast('🏅 ' + tr('Reef Explorer! All 7 species logged. +150 and your Reef Explorer card.', '¡Explorador del arrecife! Las 7 especies. +150 y tu tarjeta.')) } AV.save() }
    ctx.upd.push((dt, t) => { const P = AV.P, cam = AV.cam, inSea = deepAt(P.x, P.z), sn = inSea && hasMask(); KT.inSea = inSea;
      if (sn !== KT.snork) { KT.snork = sn; veil.style.display = hud.style.display = sn ? 'block' : 'none'; if (!sn) { AV.scene.fog.near = ctx.W ? ctx.W.fog[0] : 90; } KT.stats.snorkelled = (KT.stats.snorkelled || 0) + (sn ? 1 : 0) }
      if (inSea && !sn) cam.position.y = Math.max(cam.position.y, SEAY + .35 + Math.sin(t * 1.6) * .05);   /* no mask: head above water */
      if (sn) { cam.position.y = SEAY - .45 + Math.sin(t * 1.3) * .04; const f = AV.scene.fog; f.color.setHex(0x1a7a9a); f.near = 2; f.far = 38; const s = st(); hud.textContent = '🤿 ' + tr('Reef log ', 'Registro ') + Object.keys(s.log).length + '/' + SPECIES.length + ' · ' + tr('swim close to fish to log them', 'acércate a los peces para registrarlos') }
      else if (KT._wasSn) { AV.scene.fog.near = 90; AV.scene.fog.far = 520 } KT._wasSn = sn;
      boats.forEach((b, i) => { b.position.y = SEAY - .1 + Math.sin(t * 1.1 + i) * .08; b.rotation.z = Math.sin(t * .9 + i) * .04 });
      if (Math.abs(P.x - shoreX(P.z)) > 120) return;   /* fish only animate when you are near the bay */
      for (const F of fish) { const sp = F.sp; let cx = 0, cz = 0; F.ind.forEach((f, i) => { f.a += f.w * dt / Math.max(1, f.r); const x = F.home.x + Math.cos(f.a) * f.r, z = F.home.z + Math.sin(f.a) * f.r * (sp.turtle ? 1.6 : 1), y = (sp.flat ? H(x, z) + .08 : F.home.y + f.y + Math.sin(t * 1.7 + i) * .15);
          F.im.setMatrixAt(i, K.M(x, y, z, sp.len * (sp.flat ? 1.4 : .5), sp.len * (sp.flat ? 1 : .5), sp.len, 0, f.a + (f.w > 0 ? Math.PI : 0), 0)); cx += x; cz += z });
        F.im.instanceMatrix.needsUpdate = true; cx /= F.ind.length; cz /= F.ind.length; F.c = [cx, cz];
        if (sn) { const d = Math.hypot(P.x - cx, P.z - cz); if (d < 6 + sp.r * .35) { spotT[sp.id] = (spotT[sp.id] || 0) + dt; if (spotT[sp.id] > 1.2) logSpecies(sp) } else spotT[sp.id] = 0 } } });
    Object.assign(AV.ITEMS, { kt_mask: { n: L('Mask + snorkel', 'Gafas y tubo'), cat: 'misc', ic: '🤿', use: 'look', keep: true, model: 'card', col: 0x2a8ac8, price: 30, say: L('Spit, rinse, seal. Breathe slowly; the reef is right there.', 'Escupe, aclara, ajusta. Respira despacio: el arrecife está ahí.') },
      kt_reef_card: { n: L('Reef Explorer card (Koh Tao)', 'Tarjeta Explorador del arrecife (Koh Tao)'), cat: 'misc', ic: '🏅', use: 'look', keep: true, model: 'card', col: 0x4ad8c8, say: L('Seven species, one island, zero coral touched.', 'Siete especies, una isla, ningún coral tocado.') } });
    KT.panel = () => { const s = st(), got = Object.keys(s.log).length; const h = '<b>🤿 Blue Turtle Divers</b><div class="note">' + tr('House reef just off Sairee Beach: walk in from the sand between the bars, swim west past the shallows. Look, never touch: no gloves, no feeding, keep off the coral.', 'Arrecife frente a Sairee: entra desde la arena entre los bares y nada al oeste pasando los bajíos. Mirar, nunca tocar: sin guantes, sin dar de comer, sin pisar el coral.') + '</div>' +
      '<div class="note">' + tr('Reef log: ', 'Registro: ') + got + '/' + SPECIES.length + '<br>' + SPECIES.map(sp => (s.log[sp.id] ? '✓ ' : '· ') + say(sp.n)).join('<br>') + '</div><div class="row">' + (hasMask() ? '<span class="note">' + tr('You have a mask + snorkel.', 'Ya tienes gafas y tubo.') + '</span>' : '<button data-buy>' + tr('Mask + snorkel (30)', 'Gafas y tubo (30)') + '</button>') + '<button data-close>' + tr('Done', 'Listo') + '</button></div>';
      const p = AV.panel('cmp', h), b = p.querySelector('[data-buy]'); if (b) b.onclick = () => { if (AV.txn(-30, tr('Mask + snorkel', 'Gafas y tubo'))) { AV.bag.add('kt_mask'); AV.save(); KT.panel() } } };

    /* ---------- fire show at Firefly Beach Bar + torches + festival lanterns ---------- */
    const FB = BARS[0], fireG = new THREE.Group(); fireG.position.set(-24, H(-24, FB.z), FB.z); grp.add(fireG); const fm = new THREE.MeshBasicMaterial({ color: 0xffa040 });
    const balls = [0, 1, 2, 3].map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(.12, 8, 6), fm); fireG.add(m); return m }); const fireL = new THREE.PointLight(0xff8a30, 0, 14, 2); fireL.position.set(0, 2, 0); fireG.add(fireL);
    const torches = []; for (let z = -100; z <= 100; z += 25) { const x = -18, g = new THREE.Group(); g.position.set(x, H(x, z), z); const pole = new THREE.Mesh(new THREE.CylinderGeometry(.05, .06, 1.6, 6), new THREE.MeshStandardMaterial({ color: 0x5a3a20 })); pole.position.y = .8; g.add(pole);
      const fl = new THREE.Mesh(new THREE.ConeGeometry(.12, .4, 6), new THREE.MeshBasicMaterial({ color: 0xffb040 })); fl.position.y = 1.8; g.add(fl); grp.add(g); torches.push(fl); ctx.circles.push([x, z, .2]) }
    const festG = new THREE.Group(); grp.add(festG); if (K.lanterns) { const f2 = Object.assign({}, ctx, { group: festG }); for (const z0 of [-80, -20, 40]) K.lanterns(f2, [[-20, 3.6, z0], [-26, 4.2, z0 + 20], [-22, 3.6, z0 + 40]], { per: 10, sag: .6 }) }
    const lamps = [-80, -30, 20, 70].map(z => { const l = new THREE.PointLight(0xffa860, 0, 14, 2); l.position.set(0, 5, z); grp.add(l); return l });
    /* ---------- people ---------- */
    const nodes = [], edges = [], addN = (x, z) => { nodes.push([x, z]); return nodes.length - 1 }; let prv = null; const laneN = {};
    for (let z = -110; z <= 110; z += 8) { const a = addN(-1, z), b = addN(1, z); edges.push([a, b]); if (prv) edges.push([prv[0], a], [prv[1], b]); prv = [a, b]; laneN[z] = a }
    let bp = null; const beachN = {}; for (let z = -110; z <= 110; z += 10) { const x = shoreX(z) + 9, n = addN(x, z); if (bp != null) edges.push([bp, n]); bp = n; beachN[z] = n }
    const laneL = Object.values(laneN), beachL = Object.values(beachN), nearOf = (L, z) => L.reduce((bi, i) => Math.abs(nodes[i][1] - z) < Math.abs(nodes[bi][1] - z) ? i : bi, L[0]);
    for (const s of SOIS) { const m = addN(-8, s), w = addN(-15, s); edges.push([nearOf(laneL, s), m], [m, w], [w, nearOf(beachL, s)]) }   /* the sois: lane <-> beach (walking loops) */
    const NAV = CY.nav(nodes, edges), crowd = CY.crowd(ctx), V = ['tourist', 'backpacker', 'woman', 'man', 'tourist'];
    for (let i = 0; i < [10, 16, 24][q]; i++) { const n0 = nodes[(rng() * nodes.length) | 0]; crowd.add({ v: V[i % 5], x: n0[0], z: n0[1], nav: NAV, idleProb: .25 }) }
    const put = (x, z, yaw, m, v) => crowd.add({ v: v || V[Math.abs(Math.round(x * 7 + z)) % 5], x, z, y: H(x, z), yaw, mode: m || 'sit' });
    barSpots.forEach(([x, z], i) => { if (i % 2 === 0) put(x, z, -Math.PI / 2, 'sit') });
    const dancers = []; for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; dancers.push(put(-24 + Math.cos(a) * 5, FB.z + Math.sin(a) * 4, Math.atan2(-Math.cos(a), -Math.sin(a)), i % 3 ? 'dance' : 'idle', i % 3 ? 'dancer' : 'tourist')) }
    const spinner = put(-24, FB.z + .8, 0, 'dance', 'dancer'); put(DV.x + 3.2, DV.z + 1, Math.PI, 'idle', 'man'); put(shoreX(8) + 4, 6, -Math.PI / 2, 'idle', 'man');
    crowd.build();
    /* ---------- life by the hour ---------- */
    ctx.upd.push((dt, t) => { const fo = fireOn(), fe = fest(), nk = AV.nightK || 0; fireG.visible = fo; fireL.intensity = fo ? 2.2 + Math.sin(t * 17) * .6 + (fe ? 1 : 0) : 0; spinner.vis = fo; dancers.forEach((w, i) => w.vis = fo && (fe || i < 5)); festG.visible = fe && night();
      torches.forEach((f, i) => { f.visible = night(); f.scale.y = 1 + Math.sin(t * 13 + i) * .2 }); lamps.forEach(l => l.intensity = nk * 1.2); KT.stats.fire = fo; KT.stats.fest = fe;
      if (fo) balls.forEach((b, k) => { const a = t * 5.4 + k * Math.PI / 2, r = k < 2 ? 1.1 : .7; b.position.set(Math.cos(a) * r, 1.5 + Math.sin(a) * r, k < 2 ? .3 : -.3) }) });
    /* ---------- sound ---------- */
    const P = AV.P, near = (p, r) => Math.max(0, 1 - Math.hypot(P.x - p[0], P.z - p[1]) / r), shoreK = () => Math.max(0, 1 - Math.abs(P.x - shoreX(P.z)) / 40);
    const A2 = AV.amb; let ok = false; const bpmT = (bpm, f) => (c, t, out) => { f(c, t, out); return t + 60 / bpm };
    const layers = { waves: { loop: { filters: [['lowpass', 900], ['highpass', 90]], lfo: [.13, .55] }, vol: .55, gain: () => KT.snork ? .15 : Math.max(.12, shoreK()) },
      under: { loop: { filters: [['lowpass', 320]], lfo: [.08, .3] }, vol: .6, gain: () => KT.snork ? 1 : 0 },
      chatter: { loop: { filters: [['bandpass', 900, .8]], lfo: [1.3, .7] }, vol: .3, gain: () => Math.max(0, 1 - Math.abs(P.x) / 14) * (night() ? 1 : .5) },
      insects: { loop: { filters: [['bandpass', 5200, 1.4]], lfo: [7, .7] }, vol: .2, gain: () => (night() ? 1 : .3) * Math.min(1, Math.max(0, P.x - 10) / 30 + .3) },
      gecko: { vol: .4, gain: () => night() ? 1 : 0, tick: (c, t, o) => { if (Math.random() < .5) for (let i = 0; i < 5; i++) { A2.tone(c, o, t + i * .55, 520, .12, 'square', .04, .7); A2.tone(c, o, t + i * .55 + .2, 380, .14, 'square', .035, .7) } return t + 14 + Math.random() * 30 } },
      longtail: { vol: .35, gain: () => KT.snork ? 0 : shoreK(), tick: (c, t, o) => { if (Math.random() < .35) for (let i = 0; i < 40; i++) A2.tone(c, o, t + i * .05, 70 + Math.random() * 8, .05, 'sawtooth', .03 * Math.sin(i / 40 * Math.PI), .8); return t + 20 + Math.random() * 30 } },
      bar: { vol: .6, gain: () => Math.max(near([-12, FB.z], 40) * (hour() >= 17 || hour() < 2 ? 1 : .4), near([-12, BARS[1].z], 26) * .6), tick: bpmT(76, (c, t, o) => { const s = Math.round(t * 76 / 60) % 4; if (s === 1 || s === 3) { [[57, 60, 64], [55, 59, 62]][(t / 6.3 | 0) % 2].forEach(n => A2.tone(c, o, t, 440 * Math.pow(2, (n - 57) / 12), .18, 'triangle', .05)) } if (s === 0) A2.tone(c, o, t, 82, .4, 'sine', .3, .7) }) } };
    const startAmb = () => { if (!ok && A2 && AV.audio && AV.audio.ok) ok = A2.start(layers) }; startAmb(); ctx.upd.push(() => { if (!ok) startAmb() }); ctx.leave.push(() => { A2 && A2.stop(); ok = false });
    /* ---------- merge architecture ---------- */
    const mk = (arr, mat) => { if (arr.length) { const m = new THREE.Mesh(K.merge(arr), mat); m.castShadow = m.receiveShadow = true; grp.add(m) } };
    mk(plaster, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .85 })); mk(wood, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .8 })); mk(roof, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .7 })); mk(sandP, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .9 }));
    { const gm = new THREE.MeshBasicMaterial({ vertexColors: true }); gm.userData.lin = 1; if (glow.length) grp.add(new THREE.Mesh(K.merge(glow), gm)) }
    KT.debug = { DV, BARS, palms: palms.length, rocks: rocks.length, corals: corals.length, nodes: nodes.length };
    const surf = (x, z) => { if (x < XMIN + 2 || x > XMAX - 2 || z < ZMIN + 2 || z > ZMAX - 2) return null; if (inPier(x, z)) return 1.6; const sx = shoreX(z); if (x < sx - 62) return null;
      const h = H(x, z); return x < sx ? Math.max(h, SEAY - 1.7) : h };
    KT.surf = surf;
    const PLc = (id, en, es, x, z, yaw) => ({ id, name: [en, es], x, z, yaw });
    return { name: 'Koh Tao', surface: surf, fog: [90, 520], sky: { tint: [0xfff2dc, 0xdceeff, .05, .1], dome: { s1: 0xd8e4ee, s2: 0x98c0e8, swirl: .02, cloud: .55, glow: .45 } },
      speedMul: () => (AV.P.x < shoreX(AV.P.z) ? .55 : 1),
      post: { bloom: [.28, .35, 2.4], ldrThreshold: .97, grade: { exp: null, con: 1.08, sat: 1.16, lift: [0, 0, .005], gain: [1, 1, 1], vig: .12, grain: .006 } },   /* bright sand + sea: the default bloom washed the whole frame white */
      arrivals: { default: { x: PIER.x1 + 4, z: PIER.z - 2, yaw: 0 }, pipe: { x: 0, z: -100, yaw: Math.PI }, ferry: { x: PIER.x1 - 4, z: PIER.z, yaw: -Math.PI / 2 } }, defaultArrival: 'default',
      mapRoads: [[LANE, -112, LANE, 165, 4], [0, 0, 22, 0, 4], [22, 0, VIEW[0] - 6, -(VIEW[0] - 28) * .62, 4], [PIER.x0, PIER.z, 0, PIER.z, 4]].concat(SOIS.map(s => [-12, s, 0, s, 3])),
      places: [PLc('sairee', 'Sairee Beach', 'Playa de Sairee', shoreX(0) + 10, 4, Math.PI / 2), PLc('lane', 'Sairee walking lane', 'Calle de Sairee', 0, -30, Math.PI), PLc('divers', 'Blue Turtle Divers', 'Blue Turtle Divers', DV.x - 1.5, DV.z + DV.d / 2 + 2, Math.PI),
        PLc('firefly', 'Firefly Beach Bar (fire show)', 'Firefly Beach Bar (espectáculo de fuego)', -20, FB.z + 6, Math.PI / 2), PLc('reef', 'House reef (snorkel)', 'Arrecife (snorkel)', shoreX(0) + 2, 0, Math.PI / 2), PLc('view', 'Sairee viewpoint', 'Mirador de Sairee', VIEW[0], VIEW[1] + 5, -Math.PI / 2),
        PLc('pier', 'Mae Haad pier (ferry)', 'Muelle de Mae Haad (ferry)', PIER.x1 + 4, PIER.z - 2, 0)],
      greet: { human: [['Sawasdee! First dive? The reef is right off the beach.', '¡Sawasdee! ¿Primera inmersión? El arrecife está frente a la playa.'], ['Fire show at Firefly tonight. Bring a coconut.', 'Espectáculo de fuego en Firefly esta noche. Trae un coco.']] },
      chatLines: [['Saw a hawksbill on the house reef this morning!', '¡Esta mañana vi una tortuga carey en el arrecife!'], ['Reef rule one: look, never touch.', 'Regla uno del arrecife: mirar, nunca tocar.'], ['The ferry is late again. Island time.', 'El ferry llega tarde otra vez. Hora de isla.']],
      musicProfile: { bpm: 76, root: 45, scale: [0, 2, 4, 7, 9], style: 'amb' } };
  }
});
/* festival on the shared calendar (themed, not a real-world event): Fridays */
addEventListener('load', () => { const F = AV.fest; if (!F || !F.LIST) return; F.LIST.sairee_fire_night = { w: 'koh_tao', where: L('Koh Tao, Sairee Beach', 'Koh Tao, playa de Sairee'), wd: 4, h: 19, len: 7 * 60, n: L('Sairee Fire Night', 'Noche de Fuego de Sairee'), head: { h: 21, len: 120, n: L('Fire show finale', 'Final del espectáculo de fuego') } } });
})(window.AV);
