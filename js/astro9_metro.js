/* APEVERSE - astro9_metro.js : Worlds Reborn §5, Astro-9 grows into an alien metropolis. First district (Milestone 4 slice):
   south of the station, through a new SOUTH GATE in the hull (angle 90°):
     Spiral Boulevard → CENTRAL SPIRAL PLAZA (mosaic spiral floor, giant organic arch, the "9" monument, Gaudí-style towers, market ring,
     alien crowd, street synth) → west: INTERGALACTIC BAZAAR street (4 enterable shops with counters + open stalls) →
     east: FOOD RING (food stalls + Astro Café you can walk into). HOVER SHUTTLE stops (plaza, south gate, bazaar, food ring, Club Graviton)
     fly you between districts; hover cars cross the sky. Everything is merged per material (a few draw calls) and lit by emissive mosaics.
   AV.astro9m.build(ctx, deps) -> { surface(x,z), places }. Stays out of the existing station / districts. */
'use strict';
(function (AV) {
const tr = AV.tr, TAU = Math.PI * 2, L = (e, s) => [e, s];
const M = AV.astro9m = {};
if (AV.astro9x && AV.astro9x.GATES.indexOf(90) < 0) AV.astro9x.GATES.push(90);   // open the hull to the south
/* ---------- layout (metres; the station dome is centred at (0,-18), radius 46, south rim at z = 28) ---------- */
const PL = { x: 0, z: 94, r: 24 }, BLVD = [-5, 5, 24, 72], BAZ = [-98, -20, 70, 104], FOOD = [20, 92, 70, 104];
const STOPS = [{ id: 'plaza', x: 13, z: 112, n: L('Spiral Plaza', 'Plaza Espiral') }, { id: 'gate', x: 8, z: 36, n: L('South Gate', 'Puerta Sur') }, { id: 'bazaar', x: -90, z: 100, n: L('Intergalactic Bazaar', 'Bazar Intergaláctico') }, { id: 'food', x: 86, z: 100, n: L('Food Ring', 'Anillo de Comida') }, { id: 'club', x: -22, z: -6, n: L('Club Graviton', 'Club Graviton') }];
M.STOPS = STOPS; M.PLAZA = PL;
const inR = (x, z, r) => x >= r[0] && x <= r[1] && z >= r[2] && z <= r[3];   /* inclusive: shared edges (doors, street joins) stay walkable */
const MG2 = (x, z) => { const a = AV.astro9m2 ? AV.astro9m2.surface(x, z) : null; return a !== null ? a : AV.astro9mega ? AV.astro9mega.surface(x, z) : null };   /* + district 2 + megacity (astro9_mega.js) */
M.surface = (x, z) => (Math.hypot(x - PL.x, z - PL.z) < PL.r || inR(x, z, BLVD) || inR(x, z, BAZ) || inR(x, z, FOOD)) ? 0 : MG2(x, z);   /* + district 2 (astro9_district2.js) */

/* ---------- items sold here ---------- */
Object.assign(AV.ITEMS, {
  a9_glowfruit: { n: L('Glowfruit', 'Frutabrillo'), cat: 'food', ic: '🍈', use: 'eat', model: 'coconut', col: 0x7aff8a, say: L('Fizzy, sweet, faintly luminous. Your teeth glow for a minute.', 'Burbujeante, dulce, un poco luminosa. Te brillan los dientes un minuto.'), price: 12 },
  a9_nebula_tea: { n: L('Nebula tea', 'Té nebulosa'), cat: 'drink', ic: '🍵', use: 'drink', model: 'cup', col: 0xc88aff, fx: { type: 'sober', amt: .2 }, say: L('Swirling purple tea. Tastes like a calm Tuesday on Saturn.', 'Té morado en remolino. Sabe a un martes tranquilo en Saturno.'), price: 14 },
  a9_crystal: { n: L('Singing crystal', 'Cristal cantor'), cat: 'misc', ic: '🔮', use: 'look', keep: true, model: 'crystal', col: 0x4ad8ff, say: L('Hums a low note when you hold it to the light.', 'Zumba una nota grave cuando lo acercas a la luz.'), price: 40 },
  a9_tape: { n: L('Alien mixtape', 'Mixtape alienígena'), cat: 'misc', ic: '📼', use: 'look', keep: true, model: 'cassette', col: 0xff4ad2, say: L('Side A: whale songs from Kepler. Side B: unexplained bass.', 'Cara A: cantos de ballena de Kepler. Cara B: bajos inexplicables.'), price: 25 },
  a9_plant: { n: L('Pocket moonplant', 'Planta lunar de bolsillo'), cat: 'misc', ic: '🪴', use: 'look', keep: true, model: 'moss', col: 0x3aff9a, say: L('It turns slowly to face you. Friendly, probably.', 'Se gira despacio hacia ti. Amistosa, probablemente.'), price: 30 },
  a9_bot: { n: L('Helper micro-bot', 'Micro-robot ayudante'), cat: 'misc', ic: '🤖', use: 'look', keep: true, model: 'cube', col: 0xffd84a, say: L('Beeps encouragingly. Cannot actually help.', 'Pita para animarte. En realidad no ayuda.'), price: 55 },
  a9_dumpling: { n: L('Star dumplings', 'Empanadillas estelares'), cat: 'food', ic: '🥟', use: 'eat', model: 'bowl', col: 0xf4e0b0, say: L('Six dumplings, each a different flavour of somewhere.', 'Seis empanadillas, cada una con sabor a otro lugar.'), price: 16 }
});
const SHOPS = [
  { id: 'a9_crystals', x: -84, n: L('Zyx’s Crystal Cave', 'Cueva de Cristales de Zyx'), col: 0x4ad8ff, greet: L('Zyx (four arms, one smile): “Every crystal sings. Some only on Thursdays.”', 'Zyx (cuatro brazos, una sonrisa): “Todos los cristales cantan. Algunos solo los jueves.”'), items: [['a9_crystal', 40]] },
  { id: 'a9_records', x: -66, n: L('Orbit Records', 'Discos Órbita'), col: 0xff4ad2, greet: L('Mira, the record keeper: “Tapes from 40 planets. Ztonedape’s stuff is behind the counter.”', 'Mira, la guardiana de discos: “Cintas de 40 planetas. Lo de Ztonedape está tras el mostrador.”'), items: [['a9_tape', 25]] },
  { id: 'a9_plants', x: -48, n: L('Moonplant Nursery', 'Vivero Lunar'), col: 0x3aff9a, greet: L('Old Ferno waves a leafy hand: “They like music and low gravity. Like you.”', 'El viejo Ferno saluda con una mano frondosa: “Les gusta la música y la baja gravedad. Como a ti.”'), items: [['a9_plant', 30]] },
  { id: 'a9_tech', x: -30, n: L('Tech Market: Bolt & Byte', 'Mercado Tech: Bolt & Byte'), col: 0xffd84a, greet: L('A robot clerk: “WELCOME. ALL BOTS ARE 100% FRIENDLY. 87% OF THE TIME.”', 'Un robot dependiente: “BIENVENIDO. TODOS LOS BOTS SON 100% AMIGABLES. EL 87% DEL TIEMPO.”'), items: [['a9_bot', 55]] }
];

M.build = function (ctx, deps) {
  const K = AV.kit, grp = ctx.group, q = ctx.q, rng = ctx.rng, parts = [], glow = [], T = (x, z, r, label, fn, show) => { const t = { x, z, r, label, fn, show }; ctx.T.push(t); return t };
  const box = (col, x, y, z, sx, sy, sz, ry, gl) => (gl ? glow : parts).push([K.BG.box, col, K.M(x, y, z, sx, sy, sz, 0, ry || 0, 0)]);
  const cyl = (col, x, y, z, r, h, gl) => (gl ? glow : parts).push([K.BG.cyl, col, K.M(x, y, z, r, h, r)]);
  const MOS = [0xff4ad2, 0x4ad8ff, 0xffd84a, 0x7aff8a, 0xc88aff, 0xff8a3a];
  /* ---------- floors: mosaic spiral plaza (canvas), boulevard, bazaar + food streets ---------- */
  const tex = (() => { const c = document.createElement('canvas'); c.width = c.height = 1024; const g = c.getContext('2d'), r = AV.rng(909); g.fillStyle = '#1e1838'; g.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 2600; i++) { const a = i * .11, rr = 6 + i * .19, x = 512 + Math.cos(a) * rr, y = 512 + Math.sin(a) * rr; g.fillStyle = ['#ff4ad2', '#4ad8ff', '#ffd84a', '#7aff8a', '#c88aff', '#ff8a3a'][(i / 40 | 0) % 6]; g.globalAlpha = .55 + r() * .4; g.save(); g.translate(x, y); g.rotate(r() * TAU); g.fillRect(-7, -5, 12 + r() * 6, 9 + r() * 5); g.restore() }
    g.globalAlpha = 1; for (let i = 0; i < 9000; i++) { g.fillStyle = 'rgba(255,255,255,' + (r() * .06).toFixed(3) + ')'; g.fillRect(r() * 1024, r() * 1024, 3, 3) } const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t })();
  const plazaM = new THREE.MeshStandardMaterial({ map: tex, roughness: .35, metalness: .25, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: .35 }); plazaM.userData.lin = 1;
  const pf = new THREE.Mesh(new THREE.CircleGeometry(PL.r, 72), plazaM); pf.rotation.x = -Math.PI / 2; pf.position.set(PL.x, .02, PL.z); pf.receiveShadow = true; grp.add(pf);
  const streetM = new THREE.MeshStandardMaterial({ color: new THREE.Color(0x2a2640).convertSRGBToLinear(), roughness: .4, metalness: .4 }); streetM.userData.lin = 1;
  for (const r of [BLVD, BAZ, FOOD]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(r[1] - r[0], r[3] - r[2]), streetM); m.rotation.x = -Math.PI / 2; m.position.set((r[0] + r[1]) / 2, .015, (r[2] + r[3]) / 2); m.receiveShadow = true; grp.add(m) }
  /* glowing kerb lines + railings (you can't walk off the edge: the surface ends, and the rails show where) */
  for (let z = BLVD[2]; z < BLVD[3]; z += 2.5) for (const sx of [BLVD[0], BLVD[1]]) { box(0x8a90b0, sx, .5, z, .08, 1, .08); box(MOS[(z / 2.5 | 0) % 6], sx, 1.02, z, .1, .06, 2.5, 0, 1) }
  for (let k = 0; k < 96; k++) { const a = k / 96 * TAU, x = PL.x + Math.cos(a) * (PL.r - .3), z = PL.z + Math.sin(a) * (PL.r - .3); if (Math.abs(x) < 6 && z < PL.z) continue; if (Math.abs(x) < 8 && z > PL.z) continue; if (z > PL.z - 10 && z < PL.z + 10 && Math.abs(x) > 18) continue; box(0x8a90b0, x, .5, z, .08, 1, .08); box(MOS[k % 6], x, 1.02, z, .1, .06, 1.6, -a, 1) }
  /* ---------- Gaudí towers around the plaza: sinuous lathe spires with mosaic bands ---------- */
  const tower = (x, z, h, w, col) => { const pts = []; for (let i = 0; i <= 14; i++) { const t = i / 14; pts.push(new THREE.Vector2(w * (1 - t * .75) * (1 + .22 * Math.sin(t * 9 + x)), t * h)) } const g = new THREE.LatheGeometry(pts, 14); parts.push([g, col, K.M(x, 0, z, 1, 1, 1)]);
    for (let b = 1; b < 5; b++) { const t = b / 5; glow.push([new THREE.TorusGeometry(w * (1 - t * .75) * 1.02, .09, 5, 18), MOS[(b + (x | 0)) % 6], K.M(x, t * h, z, 1, 1, 1, Math.PI / 2, 0, 0)]) }
    glow.push([K.BG.sph, MOS[(z | 0) % 6], K.M(x, h + .6, z, .7, 1.1, .7)]); ctx.circles.push([x, z, w * 1.05]) };
  for (let k = 0; k < 9; k++) { const a = k / 9 * TAU + .3, R = PL.r + 9 + (k % 3) * 4, x = PL.x + Math.cos(a) * R, z = PL.z + Math.sin(a) * R; const pad = r => [r[0] - 5, r[1] + 5, r[2] - 5, r[3] + 5]; if (inR(x, z, pad(BAZ)) || inR(x, z, pad(FOOD)) || inR(x, z, pad(BLVD))) continue; if (AV.astro9m2 && [[0, 0], [5, 5], [-5, 5], [5, -5], [-5, -5]].some(o => AV.astro9m2.surface(x + o[0], z + o[1]) !== null)) continue;   /* never inside a street or a building */ tower(x, z, 18 + (k % 4) * 7, 3 + (k % 2), [0xe8d8c8, 0xd8b8e8, 0xc8e0e8][k % 3]) }
  /* the giant organic arch over the boulevard + the "9" spiral monument */
  glow.push([new THREE.TorusGeometry(9, .7, 10, 40, Math.PI), 0xc88aff, K.M(0, 0, 70, 1, 1.25, 1)]); parts.push([new THREE.TorusGeometry(9, 1.1, 8, 40, Math.PI), 0xe8d8c8, K.M(0, 0, 70.6, 1, 1.25, 1)]); ctx.circles.push([-9, 70, 1.2], [9, 70, 1.2]);
  { const pts = []; for (let i = 0; i <= 20; i++) { const t = i / 20; pts.push(new THREE.Vector2(2.4 * (1 - t) + .4 + .5 * Math.sin(t * 12), t * 11)) } parts.push([new THREE.LatheGeometry(pts, 20), 0xe8e0f0, K.M(PL.x, 0, PL.z, 1, 1, 1)]); ctx.circles.push([PL.x, PL.z, 3]) }
  const ring9 = new THREE.Mesh(new THREE.TorusGeometry(4.2, .25, 8, 48), new THREE.MeshStandardMaterial({ color: 0xc88aff, emissive: 0xc88aff, emissiveIntensity: 2.2 })); ring9.position.set(PL.x, 12.5, PL.z); grp.add(ring9);
  ctx.sign('ASTRO-9 · CENTRAL SPIRAL PLAZA', 0, 9.8, 70.4, Math.PI, 10, '#ffd84a', {});
  /* ---------- the plaza's market ring (open stalls with canopies) ---------- */
  const stall = (x, z, ry, col) => { box(0x3a3048, x, .5, z, 2.2, 1, 1, ry); box(col, x, 2.6, z, 2.6, .12, 1.8, ry, 1); for (const s of [-1, 1]) box(0x8a90b0, x + Math.cos(ry) * s * 1.1, 1.3, z - Math.sin(ry) * s * 1.1, .08, 2.6, .08, ry); ctx.circles.push([x, z, 1.1]) };
  for (let k = 0; k < 10; k++) { const a = Math.PI * .15 + k / 10 * Math.PI * .7, x = PL.x + Math.cos(a) * (PL.r - 5), z = PL.z + Math.sin(a) * (PL.r - 5); if (Math.abs(x) < 6) continue; stall(x, z, -a + Math.PI / 2, MOS[k % 6]) }
  /* ---------- Intergalactic Bazaar: 4 enterable shops (north side, doors onto the street) + stalls (south side) ---------- */
  ctx.sign('INTERGALACTIC BAZAAR · trade · art · curios', -60, 6.4, 104.3, Math.PI, 9, '#ff8ad8', { posts: true });
  SHOPS.forEach((s, i) => { const b = ctx.building(s.x, 78, 13, 12, 5.2, [0xe0c8e8, 0xc8e0f0, 0xe8e0c0, 0xd0e8d0][i], s.x, { floor: 0x2a2440, roof: s.col });
    box(0x3a3048, s.x, .55, 76, 4, 1.1, .8); box(s.col, s.x, 1.12, 76, 4.1, .06, .9, 0, 1); for (let k = 0; k < 6; k++) glow.push([K.BG.sph, s.col, K.M(s.x - 5 + k * 2, 3.2, 73, .25, .25, .25)]);
    ctx.cols.push([s.x - 2, s.x + 2, 75.6, 76.4]);
    ctx.sign(tr(s.n[0], s.n[1]), s.x, 6.2, 84.3, 0, 6, '#' + s.col.toString(16).padStart(6, '0'), {});
    const v = { id: s.id, name: s.n, greet: s.greet, items: s.items, x: s.x, z: 77.6, reach: 3.5 };
    T(s.x, 77.6, 2.2, () => '🛍 ' + tr(s.n[0], s.n[1]) + tr(': counter', ': mostrador'), () => AV.shop ? AV.shop.open(v) : null) });
  for (let k = 0; k < 7; k++) stall(-92 + k * 11, 100, 0, MOS[(k + 2) % 6]);
  /* ---------- Food Ring: stalls + the Astro Café (walk in, sit, order) ---------- */
  ctx.sign('FOOD RING · global & alien street food', 56, 6.4, 104.3, Math.PI, 8.5, '#7aff8a', { posts: true });
  ctx.building(40, 78, 14, 12, 5, 0xf0e0c8, 40, { floor: 0x3a2a22, roof: 0xff8a3a }); ctx.sign(tr('ASTRO CAFÉ · vegan · alien food · Earth flavours', 'ASTRO CAFÉ · vegano · comida alienígena · sabores de la Tierra'), 40, 6, 84.3, 0, 8, '#ffd84a', {});
  for (const [tx, tz] of [[36, 76], [44, 76], [36, 80.5], [44, 80.5]]) { cyl(0xf4f0e4, tx, .75, tz, .6, .06); cyl(0x6a6a7a, tx, .37, tz, .06, .74); ctx.circles.push([tx, tz, .7]) }
  box(0x5a3a2a, 40, .55, 73.5, 6, 1.1, .8); ctx.cols.push([37, 43, 73.1, 73.9]);
  T(40, 75.4, 2.2, () => tr('☕ Astro Café counter (Pip the waiter-bot)', '☕ Mostrador del Astro Café (Pip el robot camarero)'), () => AV.shop && AV.shop.open({ id: 'a9_cafe', name: L('Astro Café', 'Astro Café'), greet: L('Pip: “Table for one carbon-based lifeform? The nebula tea is today’s special.”', 'Pip: “¿Mesa para una forma de vida basada en carbono? El té nebulosa es la especialidad de hoy.”'), items: [['a9_nebula_tea', 14], ['a9_glowfruit', 12], ['a9_dumpling', 16]] }));
  [[30, 'a9_dumpling', 16, L('Grandma Oolo’s star dumplings', 'Empanadillas estelares de la abuela Oolo')], [58, 'a9_glowfruit', 12, L('Glowfruit cart', 'Carrito de frutabrillo')], [74, 'a9_nebula_tea', 14, L('Tea from 9 nebulae', 'Té de 9 nebulosas')]].forEach(([x, id, p, n], k) => { stall(x, 100, 0, MOS[(k + 4) % 6]);
    T(x, 98.4, 2.2, () => '🍜 ' + tr(n[0], n[1]) + ' (' + p + ')', () => AV.shop && AV.shop.open({ id: 'a9_food_' + k, name: n, greet: L('“Hot, fresh, from somewhere far away. Try it!”', '“Caliente, recién hecho, de algún lugar lejano. ¡Pruébalo!”'), items: [[id, p]] })) });
  /* ---------- merge: two draw calls for all of the above ---------- */
  const solidM = K.floraMat(0, { rough: .45, metal: .25 }), glowM = new THREE.MeshBasicMaterial({ vertexColors: true }); glowM.userData.lin = 1;
  const sm = new THREE.Mesh(K.merge(parts), solidM); sm.castShadow = q === 2; sm.receiveShadow = true; grp.add(sm);
  const gm = new THREE.Mesh(K.merge(glow), glowM); grp.add(gm);
  for (const [x, z, c] of [[0, 94, 0xc88aff], [-60, 88, 0xff4ad2], [56, 92, 0x7aff8a], [0, 50, 0x4ad8ff]]) { const l = new THREE.PointLight(c, 1.4, 34); l.position.set(x, 7, z); grp.add(l) }
  /* ---------- the crowd: aliens, apes and visitors meeting, shopping, chatting ---------- */
  if (AV.beings && AV.beings.spawn) { const keep = AV.beings.list, list = [], kinds = ['alien', 'alien', 'ape', 'human', 'alien'];
    const n = [14, 22, 30][q]; for (let i = 0; i < n; i++) { const zone = i % 3, a = rng() * TAU, x = zone === 0 ? PL.x + Math.cos(a) * (6 + rng() * 12) : zone === 1 ? -90 + rng() * 66 : 24 + rng() * 64, z = zone === 0 ? PL.z + Math.sin(a) * (6 + rng() * 12) : 88 + rng() * 10;
      if (!AV.isFree({ surface: M.surface, cols: ctx.cols, circles: ctx.circles }, x, z, .5)) continue; list.push({ kind: kinds[i % 5], x, y: 0, z, yaw: rng() * TAU, mode: i % 4 === 0 ? 'walk' : 'idle', seed: 9000 + i }) }
    try { AV.beings.spawn(ctx, list); AV.beings.list = (keep || []).concat(AV.beings.list || []) } catch (e) { console.warn('metro crowd', e) } }
  /* ---------- hover traffic in the sky (instanced pods on loops; a whoosh when one passes close) ---------- */
  const NF = [6, 10, 14][q], fl = new THREE.InstancedMesh(new THREE.SphereGeometry(1.2, 12, 8).scale(.8, .55, 1.8), new THREE.MeshStandardMaterial({ color: 0xd8e0f0, metalness: .6, roughness: .3, emissive: 0x4ad8ff, emissiveIntensity: .5 }), NF); fl.frustumCulled = false; grp.add(fl);
  const flyers = []; for (let i = 0; i < NF; i++) flyers.push({ cx: (i % 3 - 1) * 40, cz: 90 + (i % 2) * 20, rx: 50 + (i % 4) * 14, rz: 26 + (i % 3) * 10, y: 9 + (i % 5) * 2.5, sp: (.09 + (i % 3) * .03) * (i % 2 ? 1 : -1), ph: i * 1.7, near: false });
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler();
  ctx.upd.push((dt, t) => { ring9.rotation.y = t * .5; ring9.position.y = 12.5 + Math.sin(t) * .4;
    flyers.forEach((f, i) => { const a = f.ph + t * f.sp, x = f.cx + Math.cos(a) * f.rx, z = f.cz + Math.sin(a) * f.rz, y = f.y + Math.sin(t * .7 + i) * .5; _e.set(Math.PI / 2, 0, -a - (f.sp > 0 ? 0 : Math.PI)); _q.setFromEuler(_e); _m.compose(new THREE.Vector3(x, y, z), _q, new THREE.Vector3(1, 1, 1)); fl.setMatrixAt(i, _m);
      const d = Math.hypot(AV.P.x - x, AV.P.z - z, (AV.P.y + 1.7) - y), nr = d < 16; if (nr && !f.near && AV.audio && AV.audio.blip) { AV.audio.blip(140, .6, 'sawtooth', .025); AV.audio.blip(95, .8, 'sine', .04) } f.near = nr });
    fl.instanceMatrix.needsUpdate = true });
  /* ---------- hover shuttle between districts (you ride inside a pod; E / Act skips) ---------- */
  const podM = new THREE.MeshStandardMaterial({ color: 0xf0f0ff, metalness: .5, roughness: .25, emissive: 0xc88aff, emissiveIntensity: .25 }); let ride = null;
  STOPS.forEach(s => { cyl(0x8a90b0, s.x, 1.6, s.z, .1, 3.2); const sg = new THREE.Mesh(new THREE.CylinderGeometry(.9, .9, .12, 20), new THREE.MeshStandardMaterial({ color: 0x4ad8ff, emissive: 0x4ad8ff, emissiveIntensity: 1.2 })); sg.position.set(s.x, 3.3, s.z); grp.add(sg); ctx.circles.push([s.x, s.z, .25]);
    T(s.x, s.z, 2.4, () => '🛸 ' + tr('Hover shuttle stop · ', 'Parada del lanzadera flotante · ') + tr(s.n[0], s.n[1]), () => { const p = AV.panel('cmp', '<b>🛸 ' + tr('Hover shuttle', 'Lanzadera flotante') + '</b><div class="note">' + tr('Free for everyone on Astro-9. Hold on to your drink.', 'Gratis para todos en Astro-9. Agarra bien tu bebida.') + '</div><div class="grid">' + STOPS.filter(o => o !== s).map(o => '<button data-st="' + o.id + '">' + tr(o.n[0], o.n[1]) + '<small>' + Math.round(Math.hypot(o.x - s.x, o.z - s.z)) + ' m</small></button>').join('') + '</div><button data-close>' + tr('Close', 'Cerrar') + '</button>');
      p.querySelectorAll('[data-st]').forEach(b => b.onclick = () => { AV.closePanel('cmp'); if (AV.act && AV.act.cur && AV.act.cur.id === 'ride') AV.act.end('leave'); M.ride(s, STOPS.find(o => o.id === b.dataset.st)) }) }) });
  M.ride = (a, b) => { const P = AV.P, mid = new THREE.Vector3((a.x + b.x) / 2, 14, (a.z + b.z) / 2), curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(a.x, 3.4, a.z), mid, new THREE.Vector3(b.x, 3.4, b.z)), pod = new THREE.Mesh(new THREE.SphereGeometry(1.4, 16, 12), podM); pod.scale.set(1, .7, 1.6); grp.add(pod);
    ride = M.cur = { curve, len: curve.getLength(), s: 0, pod, to: b }; AV.audio && AV.audio.blip && AV.audio.blip(330, .4, 'sine', .08); AV.toast(tr('Shuttle to ', 'Lanzadera a ') + tr(b.n[0], b.n[1]) + tr(' — E / Act to skip.', ' — E / Act para saltar.')) };
  const endRide = () => { if (!ride) return; const r = ride; ride = M.cur = null; grp.remove(r.pod); r.pod.geometry.dispose(); const P = AV.P, sp = AV.safeSpot(AV.W, r.to.x - 2, r.to.z - 2); P.x = sp[0]; P.z = sp[1]; P.y = AV.W.surface(P.x, P.z) || 0; P.vx = P.vz = P.vy = 0; AV.toast(tr('Arrived: ', 'Llegada: ') + tr(r.to.n[0], r.to.n[1])) };
  M.skip = endRide; const rideT = T(0, 0, 6, () => tr('Skip the shuttle ride', 'Saltar el viaje'), endRide, () => !!ride);
  ctx.upd.push((dt0, t) => { if (!ride) return; const r = ride, now = AV.now(), dt = Math.min(.25, now - (r.last || now)); r.last = now; r.s += 14 * dt; const u = Math.min(1, r.s / r.len), p = r.curve.getPointAt(u), tg = r.curve.getTangentAt(u);
    r.pod.position.copy(p); r.pod.rotation.y = Math.atan2(tg.x, tg.z); const P = AV.P; P.x = p.x; P.z = p.z; P.y = p.y - 1.2; P.vx = P.vz = P.vy = 0; AV.cam.position.set(p.x, p.y + .3, p.z); rideT.x = p.x; rideT.z = p.z; if (u >= 1) endRide() });
  ctx.leave.push(() => { ride = M.cur = null });
  /* ---------- places (minimap, portal pipe, NPC directions) ---------- */
  const places = [{ id: 'm_plaza', name: L('Central Spiral Plaza', 'Plaza Espiral Central'), x: PL.x + 6, z: PL.z - 12, yaw: 0 }, { id: 'm_gate', name: L('South Gate & Spiral Boulevard', 'Puerta Sur y Bulevar Espiral'), x: 0, z: 40, yaw: Math.PI },
    { id: 'm_bazaar', name: L('Intergalactic Bazaar', 'Bazar Intergaláctico'), x: -60, z: 94, yaw: Math.PI / 2 }, { id: 'm_food', name: L('Food Ring & Astro Café', 'Anillo de Comida y Astro Café'), x: 50, z: 94, yaw: -Math.PI / 2 }].concat(SHOPS.map(s => ({ id: 'm_' + s.id, name: s.n, x: s.x, z: 86, yaw: Math.PI })));
  const d2 = AV.astro9m2 ? AV.astro9m2.build(ctx) : null; const d3 = AV.astro9mega ? AV.astro9mega.build(ctx) : null;
  return { surface: M.surface, places: places.concat(d2 ? d2.places : [], d3 ? d3.places : []) };
};
/* a street musician with the alien synth on the plaza (shared instrument activity, music_play.js) */
addEventListener('load', () => { if (AV.act && AV.act.PLACES) AV.act.PLACES.astro9 = (AV.act.PLACES.astro9 || []).concat([{ type: 'instspot', kind: 'alien', x: -10, z: 106, name: ['Spiral Plaza buskers', 'músicos de la Plaza Espiral'] }]) });
})(window.AV);
