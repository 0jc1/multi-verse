/* APEVERSE V0.9.8 - js/astro9_districts.js : Astro-9 grows beyond the dome (Stage 2).
   Four floating districts reached through gates in the station rim by curved, glowing walkways:
   STAR BAZAAR (alien market, food stands, Orbit Lounge bar) · GAUDÍ TOWERS (mosaic spires, Casa Trencadís café, hidden shrine)
   DOCKING BAY (parked ships, monorail station, the Weirdest Vending Machine) · GLOW GARDENS (glass dome, alien flora, spirits, tea).
   AV.astro9x.build(ctx, deps) returns { surface(x,z) | null, places, gates }. Angles: x = cos(a), z = sin(a). */
'use strict';
(function (AV) {
const tr = AV.tr, TAU = AV.TAU, X = AV.astro9x = {};
const P = (a, r) => [Math.cos(a * Math.PI / 180) * r, Math.sin(a * Math.PI / 180) * r];
X.R = 46;
X.DIST = [{ id: 'bazaar', a: -81, L: 16, r: 22, col: 0xff4ad2 }, { id: 'towers', a: 9, L: 14, r: 20, col: 0xffd84a }, { id: 'docks', a: 171, L: 12, r: 18, col: 0x3ad8ff }, { id: 'gardens', a: 45, L: 10, r: 14, col: 0x7aff8a }];
X.DIST.forEach(d => { d.c = P(d.a, X.R + d.L + d.r); const a0 = P(d.a, X.R - 2.5), a1 = P(d.a, X.R + d.L + 1.5), m = P(d.a + 7, X.R + d.L * .5); d.path = []; for (let i = 0; i <= 18; i++) { const t = i / 18, u = 1 - t; d.path.push([u * u * a0[0] + 2 * u * t * m[0] + t * t * a1[0], u * u * a0[1] + 2 * u * t * m[1] + t * t * a1[1]]) } });
X.GATES = X.DIST.map(d => d.a);
const segD = (x, z, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz))); return Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t) };
X.surface = (x, z) => { for (const d of X.DIST) { if (Math.hypot(x - d.c[0], z - d.c[1]) < d.r - .8) return 0; for (let i = 1; i < d.path.length; i++) if (segD(x, z, d.path[i - 1], d.path[i]) < 1.9) return 0 } return null };

X.build = function (ctx, deps) {
  const K = AV.kit, A = AV.arch, F = AV.forge, GX = AV.gfx, q = ctx.q, rng = ctx.rng, grp = ctx.group, MT = deps.MT, B = K.batch(), BS = K.batch(), lin = h => new THREE.Color(h).convertSRGBToLinear();
  const floorM = new THREE.MeshStandardMaterial({ color: lin(0x262a46), roughness: .38, metalness: .45 }); floorM.userData.lin = 1; if (GX) GX.reg(ctx, floorM, 'env', .25);
  const hullM = K.floraMat(0, { rough: .5, metal: .45, double: true });
  const shop = (x, z, label, cost, item, msg) => ctx.T.push({ x, z, r: 2.2, label: () => tr(label[0], label[1]) + ' (' + cost + ')', fn: () => { if (AV.txn(-cost, label[0])) { AV.bag && AV.bag.add(item, 1, true); AV.toast(tr(msg[0], msg[1])) } } });
  const beings = [], places = [];
  /* ---------- platforms + walkways ---------- */
  X.DIST.forEach(d => {
    const [cx, cz] = d.c, fl = new THREE.Mesh(new THREE.CircleGeometry(d.r, 64), floorM); fl.rotation.x = -Math.PI / 2; fl.position.set(cx, .01, cz); fl.receiveShadow = true; grp.add(fl);
    B.add(hullM, new THREE.LatheGeometry([[d.r + .2, 0], [d.r + .8, -.8], [d.r * .6, -5], [d.r * .25, -10], [0, -12]].map(p => new THREE.Vector2(p[0], p[1])), 40), 0x9aa0c0, K.M(cx, 0, cz));
    for (const rr of [d.r - .25, d.r * .62]) B.add(MT.v, new THREE.TorusGeometry(rr, rr > d.r - 1 ? .08 : .05, 4, 96), d.col, K.M(cx, .03, cz, 1, 1, 1, Math.PI / 2, 0, 0), 1);
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, ax = Math.atan2(d.path[d.path.length - 1][1] - cz, d.path[d.path.length - 1][0] - cx); if (Math.abs(Math.atan2(Math.sin(a - ax), Math.cos(a - ax))) < .25) continue; const x = cx + Math.cos(a) * (d.r - .3), z = cz + Math.sin(a) * (d.r - .3); B.add(MT.shiny, A.geo('pillar'), 0x8a90b0, K.M(x, 0, z, .25, 1.2, .25)); B.add(MT.v, A.geo('sph'), d.col, K.M(x, 1.25, z, .14, .14, .14), 1) }
    /* walkway ribbon + glowing edges + supports */
    const pos = [], idx = []; d.path.forEach((p, i) => { const n = d.path[Math.min(i + 1, d.path.length - 1)], b = d.path[Math.max(i - 1, 0)], tx = n[0] - b[0], tz = n[1] - b[1], l = Math.hypot(tx, tz) || 1, nx = -tz / l * 1.9, nz = tx / l * 1.9; pos.push(p[0] + nx, .02, p[1] + nz, p[0] - nx, .02, p[1] - nz); if (i) { const k = i * 2; idx.push(k - 2, k - 1, k, k - 1, k + 1, k) } });
    const wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); wg.setIndex(idx); wg.computeVertexNormals(); const wm = new THREE.Mesh(wg, floorM); wm.receiveShadow = true; grp.add(wm);
    for (const s of [1, -1]) { const pts = d.path.map((p, i) => { const n = d.path[Math.min(i + 1, d.path.length - 1)], b = d.path[Math.max(i - 1, 0)], tx = n[0] - b[0], tz = n[1] - b[1], l = Math.hypot(tx, tz) || 1; return new THREE.Vector3(p[0] - tz / l * 1.85 * s, .7, p[1] + tx / l * 1.85 * s) }); B.add(MT.v, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, .05, 4), d.col, new THREE.Matrix4(), 1);
      pts.forEach((v, i) => { if (i % 3) return; B.add(MT.shiny, A.geo('cyl'), 0x8a90b0, K.M(v.x, .35, v.z, .04, .7, .04)) }) }
    d.path.forEach((p, i) => { if (i % 5 !== 2) return; B.add(hullM, A.geo('cyl'), 0x6a7090, K.M(p[0], -4, p[1], .4, 8, .4)) });
    const g = P(d.a, X.R - 3); ctx.sign({ bazaar: 'STAR BAZAAR →', towers: 'GAUDÍ TOWERS →', docks: 'DOCKING BAY →', gardens: 'GLOW GARDENS →' }[d.id], g[0], 3.4, g[1], Math.atan2(-g[0], -g[1]), 4.2, '#' + new THREE.Color(d.col).getHexString(), { posts: true });
    const pe = d.path[d.path.length - 1]; places.push({ id: d.id, name: { bazaar: ['Star Bazaar', 'Bazar Estelar'], towers: ['Gaudí Towers', 'Torres Gaudí'], docks: ['Docking Bay', 'Muelle de naves'], gardens: ['Glow Gardens', 'Jardines Luminosos'] }[d.id], x: pe[0], z: pe[1], yaw: Math.atan2(-(cx - pe[0]), -(cz - pe[1])) });
  });
  const D = id => X.DIST.find(d => d.id === id);
  /* ---------- STAR BAZAAR ---------- */
  { const d = D('bazaar'), [cx, cz] = d.c, cols = [0xff4ad2, 0x3ad8ff, 0xffd84a, 0x7aff8a, 0xff8a3a, 0xb07aff];
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + .13, x = cx + Math.cos(a) * 14.5, z = cz + Math.sin(a) * 14.5, ry = Math.atan2(cx - x, cz - z), c = Math.cos(ry), s = Math.sin(ry);
      if (Math.hypot(x - d.path[d.path.length - 1][0], z - d.path[d.path.length - 1][1]) < 5) continue;
      B.add(MT.shiny, A.geo('box'), 0x3a2a5a, K.M(x, .55, z, 2.6, 1.1, .9, 0, ry, 0)); B.add(MT.v, A.geo('box'), cols[i % 6], K.M(x + s * .46, .9, z + c * .46, 2.4, .08, .04, 0, ry, 0), 1);
      for (const u of [-1.2, 1.2]) for (const v of [-.6, .9]) B.add(MT.shiny, A.geo('cyl'), 0xc0c0d0, K.M(x + u * c + v * s, 1.3, z - u * s + v * c, .04, 2.6, .04));
      B.add(MT.dbl, A.geo('halfDome'), cols[(i + 2) % 6], K.M(x - s * .15, 2.6, z - c * .15, 1.7, .7, 1.2, 0, ry, 0), .25);
      for (let k = 0; k < 3; k++) B.add(MT.v, A.geo('sph'), cols[(i + k) % 6], K.M(x + (k - 1) * .6 * c, 1.22, z - (k - 1) * .6 * s, .14, .14, .14), .6);
      ctx.cols.push([x - 1.3, x + 1.3, z - 1.3, z + 1.3].map((v, j) => v)); }
    const goods = [['Nebula noodles', 'Fideos nebulosa', 22, 'khao_soi', 'Space noodles that glow a bit. Delicious.', 'Fideos espaciales que brillan un poco. Deliciosos.'], ['Alien jelly', 'Gelatina alienígena', 18, 'alien_jelly', 'It wobbles back at you.', 'Te devuelve el temblor.'], ['Zero-g marble', 'Canica cero-g', 30, 'zero_g_marble', 'It refuses to fall. Respect.', 'Se niega a caer. Respeto.'], ['Star-fruit smoothie', 'Batido de carambola', 16, 'smoothie', 'Tastes like a sunrise on three moons.', 'Sabe a amanecer en tres lunas.']];
    goods.forEach((gd, i) => { const a = (i * 3 + 1) / 12 * TAU + .13, x = cx + Math.cos(a) * 12.4, z = cz + Math.sin(a) * 12.4; shop(x, z, [gd[0], gd[1]], gd[2], gd[3], [gd[4], gd[5]]) });
    /* Orbit Lounge bar in the middle: round counter, stools, crystal fountain */
    B.add(MT.shiny, new THREE.CylinderGeometry(3.4, 3.4, 1.1, 40, 1, true), 0x2a1a4a, K.M(cx, .55, cz)); B.add(MT.v, new THREE.TorusGeometry(3.4, .06, 4, 64), 0xff4ad2, K.M(cx, 1.12, cz, 1, 1, 1, Math.PI / 2, 0, 0), 1); ctx.circles.push([cx, cz, 3.6]);
    for (let k = 0; k < 10; k++) { const a = k / 10 * TAU, x = cx + Math.cos(a) * 4.3, z = cz + Math.sin(a) * 4.3; B.add(MT.shiny, A.geo('cyl'), 0x8a90b0, K.M(x, .4, z, .05, .8, .05)); B.add(MT.v, A.geo('cyl'), cols[k % 6], K.M(x, .82, z, .25, .06, .25), .4) }
    K.scatter(ctx, K.species.crystal(0xb07aff, 0x7ff0ff), K.floraMat(0), [{ x: cx, y: 0, z: cz, s: 1.5, ry: 0 }, { x: cx + .8, y: 0, z: cz + .4, s: .9, ry: 1 }, { x: cx - .7, y: 0, z: cz - .5, s: 1, ry: 2 }]);
    shop(cx + 4.4, cz + .5, ['Orbit Lounge: cosmic beer', 'Orbit Lounge: cerveza cósmica'], 30, 'beer', ['Brewed in orbit. Bubbles go sideways.', 'Fermentada en órbita. Las burbujas van de lado.']);
    ctx.sign('STAR BAZAAR · ORBIT LOUNGE', cx, 5.4, cz - d.r + 3, 0, 6, '#ff8ac0');
    K.lanterns(ctx, [[cx - 12, 3.4, cz - 6], [cx, 4.2, cz], [cx + 12, 3.4, cz + 6], [cx, 4.2, cz], [cx - 6, 3.4, cz + 12], [cx, 4.2, cz], [cx + 6, 3.4, cz - 12]], { cols: cols, per: 14, sag: .4 });
    for (let i = 0; i < 6; i++) { const a = (i * 2) / 12 * TAU + .13, x = cx + Math.cos(a) * 15.8, z = cz + Math.sin(a) * 15.8; beings.push({ kind: i % 2 ? 'alien' : 'robot', x, z, yaw: Math.atan2(cx - x, cz - z), mode: 'idle' }) }
    beings.push({ kind: 'alien', x: cx + 6, z: cz + 8, area: { x: cx, z: cz, r: 10 } }, { kind: 'human', x: cx - 6, z: cz + 8, area: { x: cx, z: cz, r: 10 }, name: 'Space Backpacker' }, { kind: 'frog', x: cx + 4.6, z: cz - 1.6, mode: 'idle', name: 'Bartender Croak' }) }
  /* ---------- GAUDÍ TOWERS ---------- */
  { const d = D('towers'), [cx, cz] = d.c;
    const ring = new THREE.Mesh(F.uvScale(new THREE.RingGeometry(3, 12, 64, 2), 8), (() => { const m = new THREE.MeshStandardMaterial(); m.name = 'mosaic2'; return m })()); ring.rotation.x = -Math.PI / 2; ring.position.set(cx, .025, cz); grp.add(ring);
    const dress = o => { F.dress(o, { tex: q === 2 ? 1024 : 512, shadow: q === 2 }).forEach(m => { if (m.userData.glowBase) GX && GX.reg(ctx, m, 'glow', m.userData.glowK); else if (m.isMeshStandardMaterial) GX && GX.reg(ctx, m, 'env', m.metalness > .9 ? .85 : .16) }); return o };
    dress(ring);
    [[0, 8, .55], [120, 9, .75], [240, 8.5, .62]].forEach(([a, r0, s]) => { const p = P(a + 30, r0), t = dress(F.tower(q ? .7 : .45)); t.scale.setScalar(s); t.position.set(cx + p[0], 0, cz + p[1]); grp.add(t); ctx.circles.push([cx + p[0], cz + p[1], F.TOWER.footprint * s]) });
    const lamp = dress(F.lamp()); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, l = i ? lamp.clone() : lamp; l.position.set(cx + Math.cos(a) * 13.5, 0, cz + Math.sin(a) * 13.5); grp.add(l); ctx.circles.push([cx + Math.cos(a) * 13.5, cz + Math.sin(a) * 13.5, .35]) }
    const bench = dress(F.bench(.4, 1.6, 4.2)); bench.position.set(cx, 0, cz); grp.add(bench); bench.userData.path.forEach(p => ctx.circles.push([cx + p[0], cz + p[1], .55]));
    /* Casa Trencadís café: mosaic counter, parasols */
    const cafe = P(200, 16), kx = cx + cafe[0], kz = cz + cafe[1]; B.add(MT.shiny, A.geo('box'), 0xf0e8d8, K.M(kx, .55, kz, 3.4, 1.1, 1.2, 0, Math.PI / 4, 0)); ctx.circles.push([kx, kz, 1.6]);
    for (const [dx, dz, c] of [[-3, 2, 0xff8a3a], [2, 3, 0x3a8ad8], [3, -2.4, 0xffd84a]]) { B.add(MT.shiny, A.geo('cyl'), 0xc0c0c0, K.M(kx + dx, 1.1, kz + dz, .04, 2.2, .04)); B.add(MT.dbl, A.geo('halfDome'), c, K.M(kx + dx, 2.2, kz + dz, 1.3, .4, 1.3), .15); ctx.circles.push([kx + dx, kz + dz, .2]) }
    shop(kx + 1.6, kz + 1.6, ['Casa Trencadís: churros + mocha', 'Casa Trencadís: churros + moca'], 18, 'mocha', ['Churros shaped like spirals. Of course.', 'Churros con forma de espiral. Cómo no.']);
    ctx.sign('GAUDÍ TOWERS · CASA TRENCADÍS', cx - 4, 6, cz - d.r + 3, 0, 6, '#ffd84a');
    /* hidden shrine behind the third tower: one crystal per day */
    const sp = P(240 + 30, 15.5), sx = cx + sp[0], sz = cz + sp[1]; B.add(MT.v, A.geo('ico'), 0x7ff0ff, K.M(sx, 1.2, sz, .4, .6, .4), 1); B.add(MT.shiny, A.geo('cyl'), 0xf0e8d8, K.M(sx, .4, sz, .5, .8, .5));
    ctx.T.push({ x: sx, z: sz, r: 1.8, label: () => tr('Hidden mosaic shrine', 'Santuario de mosaico escondido'), fn: () => { const S = AV.S; if (S.a9shrine === S.day) return AV.toast(tr('The shrine hums quietly. Come back tomorrow.', 'El santuario zumba en silencio. Vuelve mañana.')); S.a9shrine = S.day; AV.bag && AV.bag.add('space_crystal', 1, true); AV.toast(tr('You found the hidden shrine! A space crystal drops into your hand.', '¡Encontraste el santuario escondido! Un cristal espacial cae en tu mano.')) } });
    beings.push({ kind: 'human', x: cx + 5, z: cz + 6, area: { x: cx, z: cz, r: 12 }, name: 'Architect Rosa' }, { kind: 'alien', x: cx - 5, z: cz - 5, area: { x: cx, z: cz, r: 12 } }, { kind: 'robot', x: kx - 1.8, z: kz - 1.8, yaw: Math.PI / 4 + Math.PI, mode: 'idle', name: 'Barista Bot' }) }
  /* ---------- DOCKING BAY ---------- */
  { const d = D('docks'), [cx, cz] = d.c;
    [[-6, -6, 0x3ad8ff, .6], [6, -7, 0xff4ad2, -.8], [0, 8, 0xffd84a, 2.2]].forEach(([dx, dz, c, ry]) => { B.add(MT.v, new THREE.TorusGeometry(3.6, .1, 4, 48), c, K.M(cx + dx, .04, cz + dz, 1, 1, 1, Math.PI / 2, 0, 0), 1); const s = deps.ship(c); s.position.set(cx + dx, 1.6, cz + dz); s.rotation.y = ry; s.scale.setScalar(1.4); ctx.circles.push([cx + dx, cz + dz, 3.2]) });
    for (let i = 0; i < 10; i++) { const x = cx - 12 + (i % 5) * 1.3, z = cz + 3 + (i / 5 | 0) * 1.3; B.add(MT.shiny, A.geo('box'), [0x6a5a3a, 0x3a5a6a, 0x5a3a5a][i % 3], K.M(x, .55 + (i % 2) * .0, z, 1.1, 1.1, 1.1)) } ctx.cols.push([cx - 12.6, cx - 6.1, cz + 2.4, cz + 5]);
    /* monorail station */
    B.add(MT.shiny, A.geo('box'), 0x3a3f58, K.M(cx + 10, .4, cz + 2, 3, .8, 12)); B.add(MT.v, A.geo('box'), 0x3ad8ff, K.M(cx + 8.45, .82, cz + 2, .06, .06, 12), 1); ctx.cols.push([cx + 8.5, cx + 11.5, cz - 4, cz + 8]);
    const car = new THREE.Mesh(AV.G.box, AV.std(0xd8dce8, .3, .6)); car.scale.set(2.2, 2, 6); car.position.set(cx + 10, 1.8, cz + 2); grp.add(car); const winM = new THREE.Mesh(AV.G.box, new THREE.MeshBasicMaterial({ color: 0x9ad8ff })); winM.scale.set(2.25, .6, 5.4); winM.position.set(0, .25, 0); car.add(winM); winM.scale.set(1.02, .3, .9);
    ctx.upd.push((dt, t) => { car.position.z = cz + 2 + Math.sin(t * .15) * 4 });
    ctx.sign('DOCKING BAY · MONORAIL', cx, 5, cz - d.r + 3, 0, 5.5, '#7ff0ff');
    const vx = cx - 4, vz = cz + 12; B.add(MT.shiny, A.geo('box'), 0xc81a5a, K.M(vx, 1.1, vz, 1.2, 2.2, .8)); B.add(MT.v, A.geo('box'), 0xffd84a, K.M(vx, 1.5, vz - .41, .9, 1, .02), 1); ctx.circles.push([vx, vz, .8]);
    ctx.T.push({ x: vx, z: vz - 1.4, r: 1.8, label: () => tr('The Weirdest Vending Machine in the Galaxy (15)', 'La máquina expendedora más rara de la galaxia (15)'), fn: () => { if (!AV.txn(-15, 'Weird vending machine')) return; const it = ['alien_jelly', 'zero_g_marble', 'crisps', 'glow_moss', 'postcard', 'dub_cassette'][Math.random() * 6 | 0]; AV.bag && AV.bag.add(it, 1, true); AV.toast(tr('CLUNK. The machine giggles and drops: ', 'CLONC. La máquina se ríe y suelta: ') + ((AV.ITEMS[it] || {}).ic || '') + ' ' + it.replace(/_/g, ' ')) } });
    beings.push({ kind: 'robot', x: cx - 2, z: cz, area: { x: cx, z: cz, r: 12 }, name: 'Dock Unit D-4' }, { kind: 'robot', x: cx + 4, z: cz - 3, area: { x: cx, z: cz, r: 12 } }, { kind: 'alien', x: cx - 6, z: cz + 9, area: { x: cx, z: cz, r: 10 }, name: 'Freight Pilot Vexa' }) }
  /* ---------- GLOW GARDENS ---------- */
  { const d = D('gardens'), [cx, cz] = d.c;
    const gm = new THREE.MeshStandardMaterial({ color: 0x9ad8ff, roughness: .05, metalness: .3, transparent: true, opacity: .14, side: THREE.DoubleSide, depthWrite: false }); gm.userData.lin = 1; if (GX) GX.reg(ctx, gm, 'env', .8);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(d.r - .6, 40, 16, 0, TAU, 0, Math.PI / 2), gm); dome.position.set(cx, 0, cz); dome.scale.y = .7; dome.renderOrder = 2; grp.add(dome);
    for (let i = 0; i < 8; i++) B.add(MT.v, new THREE.TorusGeometry(d.r - .6, .06, 4, 32, Math.PI), d.col, K.M(cx, 0, cz, 1, .7, 1, 0, i / 8 * Math.PI, 0), .7);
    const pick = (n, s0, s1) => Array.from({ length: n }, () => { const a = rng() * TAU, r0 = 3 + rng() * (d.r - 5); return { x: cx + Math.cos(a) * r0, y: 0, z: cz + Math.sin(a) * r0, s: s0 + rng() * (s1 - s0), ry: rng() * TAU } });
    K.scatter(ctx, K.species.giantFlower(0x7ff0ff, 0xff4ad2), K.floraMat(.02), pick([3, 5, 7][q], .9, 1.5)); K.scatter(ctx, K.species.mushroom(0xff4ad2, 0xf4e8d0, 0x7ff0ff), K.floraMat(0), pick([6, 10, 14][q], .6, 1.3)); K.scatter(ctx, K.species.crystal(0x7aff8a, 0xb07aff), K.floraMat(0), pick([4, 6, 8][q], .6, 1.2));
    for (const [dx, dz, c] of [[-2, -2, 0xff4ad2], [-3.2, 0, 0x7ff0ff], [-1.4, 1.8, 0xffd84a]]) B.add(MT.v, A.geo('cyl'), c, K.M(cx + dx, .2, cz + dz, .7, .4, .7));
    shop(cx + 3, cz - 2, ['Glow tea stand: glow moss', 'Puesto de té luminoso: musgo brillante'], 14, 'glow_moss', ['It glows in your bag. Your bag is happy.', 'Brilla en tu mochila. Tu mochila está feliz.']);
    ctx.sign('GLOW GARDENS · chill zone', cx, 6.6, cz - d.r + 2.5, 0, 5, '#7aff8a');
    beings.push({ kind: 'spirit', x: cx + 2, y: 1.8, z: cz + 3, mode: 'float', name: 'Garden Glimmer' }, { kind: 'spirit', x: cx - 3, y: 2.6, z: cz - 3, mode: 'float' }, { kind: 'alien', x: cx + 4, z: cz + 2, area: { x: cx, z: cz, r: 8 }, name: 'Gardener Yuzu' }) }
  for (const b of [B, BS]) b.flush(ctx);
  AV.beings.spawn(ctx, beings.slice(0, [9, 14, 99][q]).map((b, i) => Object.assign({ seed: 200 + i }, b)));
  return { surface: X.surface, places };
};
})(window.AV);
