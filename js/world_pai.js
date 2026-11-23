/* APEVERSE - world_pai.js : Worlds Reborn §10, PAI (first playable slice). Present-day Pai as the owner remembers it, condensed.
   North = -z. Walking Street runs east-west (a narrow lane of low wooden shophouses, evening lanterns, night-market stalls), the Pai River
   is crossed by a bamboo bridge to the riverside bungalows of the Pai River Jam hostel. Venues (names from the owner's memory; real-world
   spelling and exact geography NOT verified, labelled as such where unsure):
     Rainny Café (walk in, smoothie bowls) · a vegan kitchen (real name unconfirmed) · Tea & Drum Circle (real name unconfirmed: tea + hand
     drums) · Sunset Bar (chill by day, DJ booth from 17:00) · Paradise Circus (fire show 20:00-01:00) · Pai River Jam hostel (bungalows,
     bar, jam, the remembered pirate joke sign) · a quiet temple · scooter rental · minivan to Chiang Mai · jungle trail to Jungle Dub.
   Separate Pipe entry; Chiang Mai and Jungle Dub stay separate worlds. */
'use strict';
(function (AV) {
const tr = AV.tr, TAU = Math.PI * 2, L = (e, s) => [e, s];
const RIV = [100, 112], BR = 1.7, BOUND = [-112, 152, -48, 44];
Object.assign(AV.ITEMS, {
  pai_tea: { n: L('Pot of herbal tea', 'Tetera de té de hierbas'), cat: 'drink', ic: '🫖', use: 'drink', model: 'cup', col: 0xc8a060, fx: { type: 'sober', amt: .15 }, say: L('Lemongrass, butterfly pea, something the drummer won’t name. Calm.', 'Hierbaluisa, flor de guisante azul, algo que el tamborilero no quiere nombrar. Calma.'), price: 15 },
  pai_bowl: { n: L('Smoothie bowl (Rainny Café)', 'Bol de smoothie (Rainny Café)'), cat: 'food', ic: '🥣', use: 'eat', model: 'bowl', col: 0xb04ad8, say: L('Dragon fruit, banana, granola, a tiny flower on top.', 'Pitahaya, plátano, granola y una florecita encima.'), price: 30 },
  pai_curry: { n: L('Vegan massaman curry', 'Curry massaman vegano'), cat: 'food', ic: '🍛', use: 'eat', model: 'bowl', col: 0xd8902a, say: L('Rich, mild, peanuts and potatoes. Mountain comfort food.', 'Suave, cremoso, cacahuetes y patatas. Comida de montaña.'), price: 45 }
});
AV.registerWorld({
  id: 'pai',
  build(ctx) {
    const K = AV.kit, q = ctx.q, rng = ctx.rng, grp = ctx.group, parts = [], glow = [], S = AV.S;
    const T = (x, z, r, label, fn, show) => { const t = { x, z, r, label, fn, show }; ctx.T.push(t); return t };
    const box = (col, x, y, z, sx, sy, sz, ry, gl) => (gl ? glow : parts).push([K.BG.box, col, K.M(x, y, z, sx, sy, sz, 0, ry || 0, 0)]);
    const cyl = (col, x, y, z, r, h, gl) => (gl ? glow : parts).push([K.BG.cyl, col, K.M(x, y, z, r, h, r)]);
    const hour = () => (S.time / 60) % 24, night = () => { const h = hour(); return h >= 17.5 || h < 5.5 };
    const lin = h => new THREE.Color(h).convertSRGBToLinear();
    const surf = (x, z) => { if (x < BOUND[0] || x > BOUND[1] || z < BOUND[2] || z > BOUND[3]) return null; if (x > RIV[0] && x < RIV[1] && Math.abs(z) > BR - .3) return null; return 0 };
    /* ---------- ground: grass valley, the lane, the river with its bamboo bridge, mountains all round ---------- */
    const gm = new THREE.MeshStandardMaterial({ color: lin(0x5a7a3a), roughness: .95 }); gm.userData.lin = 1;
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(BOUND[1] - BOUND[0] + 60, BOUND[3] - BOUND[2] + 60), gm); ground.rotation.x = -Math.PI / 2; ground.position.set((BOUND[0] + BOUND[1]) / 2, -.02, (BOUND[2] + BOUND[3]) / 2); ground.receiveShadow = true; grp.add(ground);
    const lm = new THREE.MeshStandardMaterial({ color: lin(0x6a6258), roughness: .9 }); lm.userData.lin = 1; const lane = new THREE.Mesh(new THREE.PlaneGeometry(196, 7), lm); lane.rotation.x = -Math.PI / 2; lane.position.set(0, .01, 0); grp.add(lane);
    const wm = new THREE.MeshStandardMaterial({ color: lin(0x4a6a5a), roughness: .2, metalness: .1, transparent: true, opacity: .9 }); wm.userData.lin = 1; const river = new THREE.Mesh(new THREE.PlaneGeometry(RIV[1] - RIV[0], 140), wm); river.rotation.x = -Math.PI / 2; river.position.set((RIV[0] + RIV[1]) / 2, -.35, 0); grp.add(river);
    for (let x = RIV[0] - 1; x <= RIV[1] + 1; x += .55) box(0xc8b070, x, .12, 0, .12, .1, BR * 2.2);   // bamboo slats
    for (const s of [-1, 1]) { box(0x9a8a50, (RIV[0] + RIV[1]) / 2, .95, s * BR, RIV[1] - RIV[0] + 2, .07, .07); for (let x = RIV[0]; x <= RIV[1]; x += 2) box(0x9a8a50, x, .5, s * BR, .07, 1, .07) }
    for (let k = 0; k < 16; k++) { const a = k / 16 * TAU, R = 230 + (k % 3) * 30, x = 20 + Math.cos(a) * R, z = Math.sin(a) * R * .8, h = 50 + (k * 37 % 40); parts.push([K.BG.cone || K.BG.cyl, [0x3a5a3a, 0x4a6a44, 0x2e4a34][k % 3], K.M(x, h / 2 - 2, z, 70 + (k % 4) * 10, h, 60, 0, a, 0)]) }
    /* ---------- Walking Street: wooden shophouses (north side = enterable, south side = open fronts + night market) ---------- */
    const woods = [0x8a5a3a, 0x9a6a44, 0x7a4a30, 0xa87a50, 0x6a4a3a];
    const shop = (x, w, name, col, inside) => { const b = ctx.building(x, -8.6, w, 8, 4.4, woods[Math.abs(Math.round(x / 9)) % 5], x, { floor: 0x5a4030, roof: 0x5a3a2a }); box(col, x, 4.9, -4.3, w * .7, .9, .12, 0, 1); ctx.sign(name, x, 5, -4.1, 0, Math.min(w - 1, 7), '#' + col.toString(16).padStart(6, '0'), {}); if (inside) inside(x); return b };
    shop(-40, 12, 'RAINNY CAFÉ', 0x7aff8a, x => { box(0x6a4a30, x, .55, -11, 5, 1.1, .8); ctx.cols.push([x - 2.5, x + 2.5, -11.4, -10.6]); for (const [tx, tz] of [[x - 3.5, -7], [x + 3.5, -7]]) { cyl(0xe8d8b8, tx, .75, tz, .5, .06); cyl(0x5a4030, tx, .37, tz, .05, .74); ctx.circles.push([tx, tz, .6]) } for (let k = 0; k < 6; k++) glow.push([K.BG.ico || K.BG.sph, 0x3aa84a, K.M(x - 5 + k * 2, 3.6, -12, .5, .4, .5)]) });
    T(-40, -9.4, 2.2, () => tr('🥣 Rainny Café counter (name as remembered)', '🥣 Mostrador del Rainny Café (nombre recordado)'), () => AV.shop && AV.shop.open({ id: 'pai_rainny', name: L('Rainny Café', 'Rainny Café'), greet: L('“Hello! Smoothie bowl today? We have dragon fruit from the farm up the hill.”', '“¡Hola! ¿Bol de smoothie hoy? Tenemos pitahaya de la granja de la colina.”'), items: [['pai_bowl', 30], ['smoothie', 35], ['water', 10]] }));
    shop(-12, 11, 'VEGAN KITCHEN', 0xffd84a, x => { box(0x6a4a30, x, .55, -11, 4, 1.1, .8); ctx.cols.push([x - 2, x + 2, -11.4, -10.6]) });
    T(-12, -9.4, 2.2, () => tr('🍛 Vegan kitchen (real name unconfirmed — owner remembers “Ganita / Katina’s”)', '🍛 Cocina vegana (nombre sin confirmar: “Ganita / Katina’s”)'), () => AV.shop && AV.shop.open({ id: 'pai_vegan', name: L('Vegan kitchen', 'Cocina vegana'), greet: L('“Sawasdee! Everything here is vegan. The massaman is the one.”', '“¡Sawasdee! Aquí todo es vegano. El massaman es el bueno.”'), items: [['pai_curry', 45], ['khao_soi', 40], ['mango', 25]] }));
    shop(22, 13, 'TEA & DRUM CIRCLE', 0xc88aff, x => { for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; cyl(0x8a5a3a, x + Math.cos(a) * 3, .25, -8.8 + Math.sin(a) * 2.2, .35, .5) } box(0x3a2a20, x, .3, -8.8, 2, .3, 1.2) });
    T(18, -6.2, 2, () => tr('🫖 Tea & Drum Circle: a pot of tea (real name unconfirmed)', '🫖 Té y tambores: una tetera (nombre real sin confirmar)'), () => AV.shop && AV.shop.open({ id: 'pai_tea', name: L('Tea & Drum Circle', 'Té y Tambores'), greet: L('A drummer with a grey beard pours you a cup: “Sit. Listen first. Then play.”', 'Un tamborilero de barba gris te sirve una taza: “Siéntate. Escucha primero. Luego toca.”'), items: [['pai_tea', 15]] }));
    for (const [x, w, n, c] of [[-70, 9, 'BAMBOO CRAFTS', 0xffb04a], [-56, 8, 'HANDMADE', 0xff8ad8], [4, 9, 'POSTCARDS · MAPS', 0x4ad8ff], [40, 10, 'MOUNTAIN COFFEE', 0xd8a060], [56, 9, 'SILVER', 0xe8e8f0]]) shop(x, w, n, c);
    for (let x = -88; x <= 86; x += 9) { if (Math.abs(x - 40) < 9 || Math.abs(x - 86) < 6 || ((x + 88) / 9) % 4 === 2) continue;   /* gaps: Paradise Circus, Sunset Bar and alleys */ const h = 3.6 + (x * 7 % 5) * .2, c = woods[(x / 9 + 60 | 0) % 5]; box(c, x, h / 2, 8.6, 8.4, h, 7); box(0x5a3a2a, x, h + .25, 8.2, 9, .3, 8); box(0x3a2a20, x, 1.3, 5.05, 7, 2.6, .1); ctx.cols.push([x - 4.2, x + 4.2, 5.1, 12.1]) }
    /* night-market stalls along the lane (open 17:00) + lantern strings */
    const stalls = []; for (let x = -84; x <= 84; x += 12) { const s = new THREE.Group(); s.position.set(x + 3, 0, 3.6); const t = new THREE.Mesh(AV.G.box, AV.std(0xf0e8d8, .8)); t.scale.set(1.8, .08, .8); t.position.y = .82; s.add(t); const can = new THREE.Mesh(AV.G.box, AV.std([0xff4a4a, 0xffd84a, 0x4ad8ff, 0x7aff8a][(x / 12 + 8 | 0) % 4], .7)); can.scale.set(2.1, .06, 1.2); can.position.y = 2.1; s.add(can); AV.lin(s); grp.add(s); stalls.push(s) }
    const NL = [40, 80, 120][q], lan = new THREE.InstancedMesh(new THREE.SphereGeometry(.16, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffc070 }), NL); const _m = new THREE.Matrix4();
    for (let i = 0; i < NL; i++) { const u = i / NL, x = -90 + u * 180, z = Math.sin(i * 1.7) * 3.2; _m.makeTranslation(x, 4.6 - Math.abs(Math.sin(u * 40)) * .5, z); lan.setMatrixAt(i, _m) } lan.material.userData.lin = 1; grp.add(lan);
    ctx.sign('PAI WALKING STREET', -92, 4.2, 0, Math.PI / 2, 8, '#ffd84a', { posts: true });
    /* ---------- Sunset Bar (east end, by the river): chill deck by day, DJ from 17:00 ---------- */
    box(0x7a5a3a, 86, .3, 22, 16, .6, 12); box(0x5a3a2a, 86, 1.1, 16.4, 7, 1.1, .8); ctx.cols.push([82.5, 89.5, 16, 16.8]); for (const [bx, bz] of [[80, 22], [86, 25], [92, 22]]) { box(0xe8c890, bx, .5, bz, 1.4, .25, 1.4); ctx.circles.push([bx, bz, .8]) }
    ctx.sign('SUNSET BAR', 86, 4.2, 15.6, Math.PI, 6, '#ff8a3a', { posts: true });
    T(86, 14.8, 2.2, () => tr('🍺 Sunset Bar', '🍺 Sunset Bar') + (night() ? tr(' · DJ tonight', ' · DJ esta noche') : tr(' · chill daytime', ' · tarde tranquila')), () => AV.shop && AV.shop.open({ id: 'pai_sunset', name: L('Sunset Bar', 'Sunset Bar'), greet: night() ? L('“Party’s on! The DJ booth is open — want to play?”', '“¡Hay fiesta! La cabina está abierta, ¿quieres pinchar?”') : L('“Chill time. Come back for sunset, then it’s techno.”', '“Hora tranquila. Vuelve al atardecer; luego toca techno.”'), items: [['beer', 20], ['water', 10], ['pineapple_shake', 18]] }));
    /* ---------- Paradise Circus: fire show at night (20:00 - 01:00) ---------- */
    box(0x3a2a40, 40, .2, 24, 14, .4, 10); ctx.sign('PARADISE CIRCUS', 40, 4.4, 18.6, Math.PI, 7, '#ff4ad2', { posts: true }); for (const [px, pz] of [[34, 30], [46, 30], [40, 31]]) { box(0x2a2030, px, .4, pz, 2.4, .5, .8); ctx.circles.push([px, pz, 1]) }
    const fire = new THREE.Group(); fire.position.set(40, 0, 24); grp.add(fire); const balls = []; for (let k = 0; k < 4; k++) { const m = new THREE.Mesh(AV.G.sph, new THREE.MeshBasicMaterial({ color: 0xff8a2a })); m.scale.setScalar(.16); fire.add(m); balls.push(m) }
    const fl = new THREE.PointLight(0xff7a2a, 0, 16); fl.position.set(40, 2, 24); grp.add(fl);
    const fireOn = () => { const h = hour(); return h >= 20 || h < 1 };
    T(40, 20.5, 3, () => fireOn() ? tr('🔥 Paradise Circus: watch the fire show', '🔥 Paradise Circus: ver el espectáculo de fuego') : tr('Paradise Circus (fire show 20:00–01:00)', 'Paradise Circus (fuego de 20:00 a 01:00)'), () => { if (!fireOn()) return AV.toast(tr('The fire spinners are still sleeping. Come back after 20:00.', 'Los malabaristas de fuego aún duermen. Vuelve después de las 20:00.')); AV.toast(tr('Poi chains whirl into rings of fire. Keep behind the rope — the crowd cheers!', 'Las cadenas de poi giran en anillos de fuego. Detrás de la cuerda: ¡el público aplaude!')); AV.vitals && AV.vitals.add(0, 6) });
    /* ---------- the temple: quiet, respectful ---------- */
    box(0xf0e8d8, -66, .4, -32, 12, .8, 9); box(0xd8a040, -66, 3.2, -32, 10, 4.8, 7); box(0x9a3a2a, -66, 6.4, -32, 12, 1.4, 9); glow.push([K.BG.cone || K.BG.cyl, 0xffd84a, K.M(-66, 8.4, -32, 1.4, 3, 1.4)]); ctx.cols.push([-71, -61, -35.5, -28.5]);
    T(-66, -26.6, 3, () => tr('Temple: sit quietly for a moment', 'Templo: sentarse en silencio un momento'), () => { AV.toast(tr('Bells, birds, a monk sweeping leaves. Your breathing slows. Calm +1.', 'Campanas, pájaros, un monje barriendo hojas. Tu respiración se calma. Calma +1.')); AV.vitals && AV.vitals.add(0, 3); if (AV.audio) [0, .7, 1.4].forEach((o, k) => setTimeout(() => AV.audio.blip([392, 523, 659][k], 1.8, 'sine', .07), o * 1000)) });
    ctx.sign('WAT (TEMPLE) · please be quiet', -66, 2.4, -26, 0, 5, '#ffd84a', { posts: true });
    /* ---------- across the bridge: Pai River Jam hostel & campground ---------- */
    for (const [bx, bz] of [[124, -14], [136, -16], [142, 6]]) { ctx.building(bx, bz, 6, 5, 3, 0xa87a50, bx, { floor: 0x6a4a30, roof: 0x4a3a2a }); }
    box(0x7a5a3a, 128, .25, 14, 12, .5, 8); box(0x5a3a2a, 128, 1.1, 10.6, 6, 1.1, .8); ctx.cols.push([125, 131, 10.2, 11]);
    ctx.sign('PAI RIVER JAM · hostel & camp', 120, 4.4, -4, -Math.PI / 2, 7, '#7aff8a', { posts: true });
    ctx.sign('Drink before noon? You’re a pirate!', 132, 2.4, 18.4, Math.PI, 4.6, '#ffffff', { posts: true });
    T(128, 12.4, 2.2, () => tr('🍻 River Jam bar (the pirate sign is the owner’s memory, not a verified quote)', '🍻 Bar del River Jam (el cartel pirata es un recuerdo, no una cita verificada)'), () => AV.shop && AV.shop.open({ id: 'pai_jam', name: L('Pai River Jam bar', 'Bar Pai River Jam'), greet: L('“Jam starts when someone picks up the guitar. Could be you.”', '“El jam empieza cuando alguien coge la guitarra. Podrías ser tú.”'), items: [['beer', 18], ['water', 8]] }));
    T(136, -12, 2, () => tr('Your bungalow: rest until morning', 'Tu bungaló: descansar hasta la mañana'), () => { AV.fadeTo(1, 600); setTimeout(() => { if (S.time >= 8 * 60) S.day++; S.time = 8 * 60; AV.hud(); AV.fadeTo(0, 900); AV.toast(tr('River sounds, roosters, mist on the mountains. Good morning, Pai.', 'Sonido del río, gallos, niebla en las montañas. Buenos días, Pai.')) }, 700) });
    /* ---------- getting around: minivan to Chiang Mai, jungle trail to Jungle Dub ---------- */
    box(0x3a6a8a, -100, 1.3, 10, 6, 2.6, 2.4); box(0x9ad8ff, -100, 1.8, 8.8, 5, .8, .05, 0, 1); ctx.sign('BUS & MINIVAN', -100, 4, 6, 0, 5, '#4ad8ff', { posts: true });
    T(-100, 7.5, 2.6, () => tr('🚐 Minivan to Chiang Mai (40 credits · 762 curves, condensed)', '🚐 Minivan a Chiang Mai (40 créditos · 762 curvas, resumidas)'), () => { if (!AV.txn(-40, 'Minivan Pai → Chiang Mai')) return; AV.toast(tr('Mountains, mist, a driver who knows every curve. Three hours later: Chiang Mai.', 'Montañas, niebla, un conductor que conoce cada curva. Tres horas después: Chiang Mai.')); AV.travel('chiang_mai') });
    cyl(0x5a4030, -60, 1.4, -40, .12, 2.8); box(0x7aff8a, -60, 2.8, -40, 2.4, .6, .1, 0, 1);
    T(-60, -38, 2.6, () => tr('🌿 Jungle trail → Jungle Dub / Jungle Rave', '🌿 Sendero de la jungla → Jungle Dub / Jungle Rave'), () => { AV.toast(tr('You follow the bass through the trees... the jungle opens onto Jungle Dub.', 'Sigues el bajo entre los árboles... la jungla se abre a Jungle Dub.')); AV.travel('jungle_dub') });
    /* ---------- merge decor ---------- */
    const sm = new THREE.Mesh(K.merge(parts), K.floraMat(0, { rough: .85 })); sm.castShadow = q === 2; sm.receiveShadow = true; grp.add(sm);
    const gmat = new THREE.MeshBasicMaterial({ vertexColors: true }); gmat.userData.lin = 1; grp.add(new THREE.Mesh(K.merge(glow), gmat));
    /* ---------- people: travellers, locals, musicians ---------- */
    if (AV.beings && AV.beings.spawn) { const keep = AV.beings.list, list = []; const n = [12, 18, 26][q]; for (let i = 0; i < n; i++) { const x = -80 + rng() * 160, z = (rng() - .5) * 4.5; list.push({ kind: ['human', 'human', 'ape', 'human'][i % 4], x, y: 0, z, yaw: rng() * TAU, mode: i % 3 ? 'walk' : 'idle', seed: 7100 + i }) }
      list.push({ kind: 'human', x: 84, y: 0, z: 24, yaw: Math.PI, mode: 'idle', seed: 7190 }, { kind: 'ape', x: 130, y: 0, z: 16, yaw: Math.PI, mode: 'idle', seed: 7191 });
      try { AV.beings.spawn(ctx, list.filter(b => AV.isFree({ surface: surf, cols: ctx.cols, circles: ctx.circles }, b.x, b.z, .5))); AV.beings.list = (keep || []).concat(AV.beings.list || []) } catch (e) { console.warn('pai crowd', e) } }
    /* ---------- evening: lanterns, market, fire ---------- */
    ctx.upd.push((dt, t) => { const nk = AV.nightK || 0, ev = night(); lan.material.color.setRGB(1, .75 + nk * .2, .45 + nk * .2).convertSRGBToLinear(); stalls.forEach(s => s.visible = ev);
      const on = fireOn() && nk > .2; fire.visible = on; fl.intensity = on ? 2.2 + Math.sin(t * 17) * .6 : 0; if (on) balls.forEach((b, k) => { const a = t * 4.2 + k * Math.PI / 2; b.position.set(Math.cos(a) * 1.1, 1.6 + Math.sin(a) * 1.1, 0) }) });
    return { name: 'Pai', surface: surf, fog: [60, 320], sky: { dome: { s1: 0xffd0a8, s2: 0x8ac0e8, swirl: .04, cloud: .55, glow: .5 } },
      arrivals: { default: { x: -96, z: 4, yaw: -Math.PI / 2 }, pipe: { x: -90, z: 2, yaw: -Math.PI / 2 }, ape_gate: { x: -90, z: 2, yaw: -Math.PI / 2 }, bungalow: { x: 132, z: -8, yaw: 0 } }, defaultArrival: 'default',
      mapRoads: [[-98, 0, 98, 0, 7], [RIV[0] - 2, 0, RIV[1] + 2, 0, 3.4]],
      places: [{ id: 'walking', name: L('Pai Walking Street', 'Walking Street de Pai'), x: -20, z: 0, yaw: 0 }, { id: 'rainny', name: L('Rainny Café', 'Rainny Café'), x: -40, z: -3, yaw: Math.PI }, { id: 'tea', name: L('Tea & Drum Circle', 'Té y Tambores'), x: 22, z: -3, yaw: Math.PI },
        { id: 'sunset', name: L('Sunset Bar', 'Sunset Bar'), x: 86, z: 19, yaw: 0 }, { id: 'paradise', name: L('Paradise Circus', 'Paradise Circus'), x: 40, z: 19, yaw: 0 }, { id: 'jam', name: L('Pai River Jam hostel', 'Hostal Pai River Jam'), x: 126, z: 4, yaw: 0 },
        { id: 'temple', name: L('Temple', 'Templo'), x: -66, z: -25, yaw: Math.PI }, { id: 'bus', name: L('Bus & minivan station', 'Estación de autobuses'), x: -98, z: 6, yaw: 0 }, { id: 'trail', name: L('Jungle trail to Jungle Dub', 'Sendero a Jungle Dub'), x: -60, z: -36, yaw: 0 }],
      musicProfile: { bpm: 84, root: 50, scale: [0, 2, 4, 7, 9], style: 'amb' } };
  }
});
/* venues from the shared systems: DJ at Sunset Bar, hand drums + ukulele jams, scooter rental */
addEventListener('load', () => { const P = AV.act && AV.act.PLACES; if (!P) return; P.pai = (P.pai || []).concat([{ type: 'djbooth', x: 90, z: 26, ry: Math.PI, name: ['Sunset Bar', 'Sunset Bar'], col: 0xff8a3a }, { type: 'instspot', kind: 'bongo', x: 24, z: -10.5, name: ['Tea & Drum Circle', 'Té y Tambores'] }, { type: 'instspot', kind: 'uke', x: 122, z: 14, name: ['Pai River Jam', 'Pai River Jam'] }, { type: 'rental', id: 'pai_scoot', kind: 'scooter', x: -84, z: -14, ry: 0, price: 35, name: ['Aya-style scooter rental', 'Alquiler de motos'], col: 0x3ad06a, cols: [0xe8e4da, 0x3ad06a, 0x2a2a2a] }]) });
/* Chiang Mai gets the other end of the minivan: a stop next to Giant Hostel */
const prev = AV.onWorldEnter; AV.onWorldEnter = function (W) { if (prev) prev(W); if (W.id !== 'chiang_mai') return; const sp = AV.safeSpot(W, 4, 44);
  W.T.push({ x: sp[0], z: sp[1], r: 2.4, label: () => tr('🚐 Minivan to Pai (40 credits · mountain road)', '🚐 Minivan a Pai (40 créditos · carretera de montaña)'), fn: () => { if (!AV.txn(-40, 'Minivan Chiang Mai → Pai')) return; AV.toast(tr('762 curves later, the valley opens: Pai.', '762 curvas después se abre el valle: Pai.')); AV.travel('pai') } }) };
})(window.AV);
