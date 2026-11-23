/* APEVERSE - Agent 4 / Sevilla. First implementation slice, NOT a completed Madrid-quality city.
   Uses only existing core, city-life, inventory, music, map, and portal APIs.
   All shop rooms have actual door apertures and physical traversable interiors.
   Dense centre + Triana + continuously connected city-scale walking routes; distant
   Alameda, Plaza de España and fairground are early detail passes, not final art. */
'use strict';
(function (AV) {
const P = AV.agent4Seville;
if (!P) throw new Error('Agent 4 Sevilla layout missing: load js/agent4_seville_plan.js first');
const TAU = Math.PI * 2;
const L = (en, es) => [en, es || en], tr = AV.tr;

/* New items register through the normal backpack/economy without changing save format. */
Object.assign(AV.ITEMS, {
  sev_gazpacho: { n: L('Andalusian gazpacho', 'Gazpacho andaluz'), cat: 'food', ic: '🥣', use: 'eat', model: 'bowl', col: 0xb34b38,
    say: L('Cool tomato, cucumber, olive oil and bread.', 'Tomate fresco, pepino, aceite de oliva y pan.'), price: 8 },
  sev_espinacas: { n: L('Espinacas con garbanzos (vegan)', 'Espinacas con garbanzos (vegano)'), cat: 'food', ic: '🥬', use: 'eat', model: 'bowl', col: 0x57834a,
    say: L('Spinach, chickpeas and warm spices. Delicious.', 'Espinacas, garbanzos y especias. Riquísimo.'), price: 10 },
  sev_tinto: { n: L('Tinto de verano (alcoholic)', 'Tinto de verano (con alcohol)'), cat: 'drink', ic: '🍷', use: 'drink', model: 'cup', col: 0x762436,
    fx: { type: 'drink', amt: .3 }, say: L('A summer drink on a shady Sevillian patio.', 'Una bebida veraniega en un patio sevillano.'), price: 7 },
  sev_tostada: { n: L('Toast with tomato and olive oil', 'Tostada con tomate y aceite'), cat: 'food', ic: '🍞', use: 'eat', model: 'sack', col: 0xdaa35a,
    say: L('Breakfast Sevillian-style, simple and good.', 'Desayuno sevillano, sencillo y rico.'), price: 6 },
  sev_zumo: { n: L('Fresh Seville orange juice', 'Zumo natural de naranja'), cat: 'drink', ic: '🍊', use: 'drink', model: 'cup', col: 0xef9934,
    say: L('Freshly squeezed, sweet and bright.', 'Recién exprimido, dulce y fresco.'), price: 5 },
  sev_azulejo: { n: L('Hand-painted ceramic tile', 'Azulejo pintado a mano'), cat: 'souvenir', ic: '🎨', use: 'look', keep: true, model: 'cube', col: 0x237cb0,
    say: L('A little piece of Triana craftsmanship.', 'Un recuerdo de la artesanía de Triana.'), price: 12 },
  sev_postal: { n: L('Sevilla illustrated postcard', 'Postal ilustrada de Sevilla'), cat: 'souvenir', ic: '💌', use: 'look', keep: true, model: 'sack', col: 0xe9c597,
    say: L('Cathedral, oranges, river: a memory to keep.', 'Catedral, naranjos y río: un recuerdo para guardar.'), price: 4 }
});

AV.registerWorld({
  id: 'seville',
  build(ctx) {
    const K = AV.kit, BG = K.BG, M = K.M, q = ctx.q, rand = ctx.rng, group = ctx.group;
    const CY = AV.city, G = { box: BG.box, cyl: BG.cyl, sph: BG.sph, ico: BG.ico };
    const state = AV.S.agent4 || (AV.S.agent4 = {});
    if (state.sevilleFeria == null) state.sevilleFeria = false;
    // City-specific local material atlas: weathered mineral render, carved stone,
    // ceramic clay roof tiles and timber grain. Procedural, original, CC0-safe.
    function wallTexture(seed, style) {
      const cv = document.createElement('canvas'); cv.width = cv.height = 256;
      const c = cv.getContext('2d'), rr = AV.rng(4000 + seed);
      c.fillStyle = '#faf8f4'; c.fillRect(0, 0, 256, 256);
      if (style === 'roof') {
        for (let y = 0; y < 256; y += 31) for (let x = (y / 31 % 2) * 17 - 18; x < 256; x += 34) {
          c.strokeStyle = 'rgba(73,36,26,.42)'; c.lineWidth = 2;
          c.strokeRect(x + 1, y + 1, 32, 28);
          c.fillStyle = 'rgba(104,61,33,.10)'; c.fillRect(x + 3, y + 3, 28, 5);
        }
      } else if (style === 'wood') {
        for (let i = 0; i < 32; i++) { const x = i * 8 + rr() * 3;
          c.fillStyle = 'rgba(57,39,20,' + (.12 + rr() * .16).toFixed(2) + ')'; c.fillRect(x, 0, 1 + rr() * 2, 256) }
      } else if (style === 'stone') {
        for (let y = 0; y < 256; y += 48) for (let x = -(y / 48 % 2) * 48; x < 256; x += 96) {
          c.strokeStyle = 'rgba(63,57,48,.15)'; c.strokeRect(x + 1, y + 1, 94, 46);
        }
      }
      // Fine aggregate and weathered mineral flecks, no expensive full-resolution decals.
      for (let i = 0; i < 1400; i++) {
        c.fillStyle = rr() < .5 ? 'rgba(63,47,40,.075)' : 'rgba(255,255,255,.16)';
        c.fillRect(rr() * 256, rr() * 256, .7 + rr() * 3.2, .7 + rr() * 3.2);
      }
      const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding;
      t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4;
      return t; // world.dispose releases textures; no leaking 'keep' between visits
    }
    const mat = {
      plaster: K.floraMat(0, { rough: .93, map: wallTexture(1, 'stucco') }),
      stone: K.floraMat(0, { rough: .86, map: wallTexture(2, 'stone') }),
      tiles: K.floraMat(0, { rough: .8, map: wallTexture(3, 'roof') }),
      iron: K.floraMat(0, { rough: .45, metal: .35 }),
      wood: K.floraMat(0, { rough: .84, map: wallTexture(4, 'wood') }),
      glass: K.floraMat(0, { rough: .38, metal: .08 }),
      leaves: K.floraMat(.008, { rough: .88, double: true }), fruits: K.floraMat(0, { rough: .7 })
    };
    const B = K.batch();
    const add = (key, geo, col, x, y, z, sx, sy, sz, ry = 0, glow = 0) =>
      B.add(mat[key], geo || G.box, col, M(x, y, z, sx, sy, sz, 0, ry, 0), glow);
    const box = (key, col, x, y, z, sx, sy, sz) => add(key, G.box, col, x, y, z, sx, sy, sz);
    const target = (x, z, r, label, fn, show) => { const t = { x, z, r, label, fn, show }; ctx.T.push(t); return t };
    const rngCol = (arr, i) => arr[Math.abs(i) % arr.length];

    /* Physically split land at the Guadalquivir. The river is NOT a walkable green field. */
    const r = P.river, ex = P.extent;
    for (const [a, b, hex] of [[ex.x0, r.x0, 0xc7b49a], [r.x1, ex.x1, 0xd4c3a3]]) {
      const p = ctx.mk(new THREE.PlaneGeometry(b - a, ex.z1 - ex.z0), AV.std(hex, .94), (a + b) / 2, -.07, (ex.z0 + ex.z1) / 2);
      p.rotation.x = -Math.PI / 2; p.receiveShadow = true;
    }
    if (K.waterPlane) {
      const water = K.waterPlane(ctx, new THREE.PlaneGeometry(r.x1 - r.x0, ex.z1 - ex.z0), -.22,
        { deep: 0x285a63, shallow: 0x55878b, sky: 0x9fbec7, iri: .025, opacity: .96, scale: .35 });
      water.position.x = (r.x0 + r.x1) / 2;
    }
    // Pedestrian and car corridors are one continuous network: no district teleports.
    for (const [x0, z0, x1, z1, width] of P.roads) {
      const horizontal = Math.abs(x1 - x0) > Math.abs(z1 - z0);
      const len = Math.hypot(x1 - x0, z1 - z0);
      // Bridge decks are made separately to avoid asphalt concealing the river surface.
      if (horizontal && x0 < r.x0 && x1 > r.x1) {
        for (const [a, b] of [[x0, r.x0], [r.x1, x1]]) {
          box('stone', 0x9b9187, (a + b) / 2, .005, z0, b - a, .065, width);
          box('stone', 0xd1c3ae, (a + b) / 2, .045, z0 + width / 2 + .9, b - a, .11, 1.4);
          box('stone', 0xd1c3ae, (a + b) / 2, .045, z0 - width / 2 - .9, b - a, .11, 1.4);
        }
      } else {
        add('stone', G.box, width < 8 ? 0xbeb29e : 0x8e8b85,
          (x0 + x1) / 2, .01, (z0 + z1) / 2, horizontal ? len : width, .07, horizontal ? width : len);
      }
    }
    // River quay paving + parapets, interrupted at bridges.
    for (const [x, side] of [[r.x0 - 2, -1], [r.x1 + 2, 1]]) {
      box('stone', 0xcfbea5, x, .045, 0, 8, .09, ex.z1 - ex.z0);
      let start = ex.z0;
      for (const bridge of r.bridges.concat([{ z: ex.z1 + 30, w: 1 }])) {
        const end = bridge.z - bridge.w / 2 - 2;
        if (end - start > 2) {
          box('stone', 0xb2a188, x - side * 2, .55, (start + end) / 2, .62, 1.1, end - start);
          ctx.cols.push([x - side * 2 - .31, x - side * 2 + .31, start, end]);
        }
        start = bridge.z + bridge.w / 2 + 2;
      }
    }
    for (const bridge of r.bridges) {
      const z = bridge.z, ww = bridge.w;
      box('stone', 0xc5b69e, (r.x0 + r.x1) / 2, .11, z, r.x1 - r.x0 + 10, .35, ww - 1.2);
      for (const s of [-1, 1]) {
        const rz = z + s * (ww / 2 - .3);
        box('iron', 0x48515a, (r.x0 + r.x1) / 2, .83, rz, r.x1 - r.x0 + 9, .08, .1);
        for (let x = r.x0 - 2; x <= r.x1 + 2; x += 3.2) {
          box('iron', 0x41464b, x, .43, rz, .07, .83, .09);
        }
        ctx.cols.push([r.x0 - 3, r.x1 + 3, rz - .15, rz + .15]);
      }
      // Shallow structural masonry arches, safely below the traversable deck.
      for (let i = 0; i < 3; i++) {
        const x = r.x0 + 7 + i * 13;
        add('stone', G.cyl, 0xa5957e, x, -.9, z, 1.5, 1.4, 1.5);
      }
    }

    /* Buildings vary by block. Every non-enterable facade adds a true solid collider. */
    const reserved = [
      [-80, 17, -10, 110], [21, 48, -30, 15], [91, 210, 120, 252],
      [-5, 163, 422, 572], [-18, 65, -305, -233], [-32, 70, -505, -411],
      [-475, -366, 390, 560]
    ].concat(P.venues.map(v => v.r));
    const intersects = (a, b, p = 2) => a[0] < b[1] + p && a[1] > b[0] - p && a[2] < b[3] + p && a[3] > b[2] - p;
    const roadOverlap = rr => P.roads.some(rd => {
      const w = rd[4] / 2 + 1.2;
      if (rd[0] === rd[2]) return rr[0] < rd[0] + w && rr[1] > rd[0] - w && rr[2] < Math.max(rd[1], rd[3]) && rr[3] > Math.min(rd[1], rd[3]);
      if (rd[1] === rd[3]) return rr[2] < rd[1] + w && rr[3] > rd[1] - w && rr[0] < Math.max(rd[0], rd[2]) && rr[1] > Math.min(rd[0], rd[2]);
      return false;
    });
    let buildings = 0;
    function facade(rr, style, index) {
      if (reserved.some(a => intersects(rr, a)) || roadOverlap(rr)) return;
      const [x0, x1, z0, z1] = rr, x = (x0 + x1) / 2, z = (z0 + z1) / 2;
      const width = x1 - x0, depth = z1 - z0;
      const facingZ = width >= depth; // decorative windows on the longer street face
      const floors = style === 'triana' ? 2 + index % 2 : style === 'santacruz' ? 2 + index % 3 : 3 + index % 3;
      const H = 3.35 * floors, colours = style === 'triana' ? [0xf3e8d8, 0xe9dbc5, 0xe5d5bd, 0xdac8b4] :
        [0xf4ead9, 0xf0debd, 0xeed7a5, 0xe8d8c3, 0xf9efdf, 0xdccab6];
      const c = rngCol(colours, index * 3 + floors), roof = rngCol([0xa85b3c, 0xb86c45, 0x95604a, 0xc27649], index);
      box('plaster', c, x, H / 2, z, width, H, depth);
      box('tiles', roof, x, H + .35, z, width + .8, .7, depth + .8);
      // Cornice, drip lines, mineral-stained base, tiled roof ridges, real dimensional relief.
      box('stone', 0xd8cab5, x, H - .25, z, width + .55, .32, depth + .55);
      box('stone', 0xc7b7a2, x, .25, z, width + .12, .5, depth + .12);
      for (let k = 0; k < Math.min([2, 2, 3][q], Math.floor((facingZ ? width : depth) / 2.4)); k++) {
        const long = facingZ ? width : depth, n = Math.max(2, Math.floor(long / 3.4)), a = -long / 2 + (k + .5) * long / n;
        if (k >= n) break;
        for (let f = 0; f < floors; f++) {
          if (q === 0 && f > 0 && f < floors - 1) continue; // LOD: no hidden middle-window detail on Iris Xe/Android Low
          const yy = .95 + f * 3.35, xw = facingZ ? x + a : x + width / 2 + .06;
          const zw = facingZ ? z + depth / 2 + .06 : z + a;
          add('glass', G.box, (f + index + k) % 4 === 0 ? 0xffdc99 : 0x526978, xw, yy + .45, zw,
            facingZ ? 1.12 : .09, 1.5, facingZ ? .09 : 1.12, 0, (f + k) % 6 === 0 ? .1 : 0);
          // wood shutters and carved lintels
          if (q > 0) for (const sign of (q === 1 ? [-1] : [-1, 1])) {
            box('wood', (index + k) % 3 ? 0x5f7355 : 0x506a79,
              xw + (facingZ ? sign * .73 : 0), yy + .45, zw + (facingZ ? 0 : sign * .73),
              facingZ ? .27 : .1, 1.68, facingZ ? .1 : .27);
          }
          box('stone', 0xf0e6d4, xw, yy + 1.33, zw, facingZ ? 1.75 : .25, .18, facingZ ? .25 : 1.75);
          if (f && q > 0) {
            box('stone', 0xcfbd9d, xw, yy - .47, zw + (facingZ ? .43 : 0), facingZ ? 1.65 : .94, .14, facingZ ? .94 : 1.65);
            box('iron', 0x272824, xw, yy + .02, zw + (facingZ ? .8 : .0), facingZ ? 1.65 : .08, .06, facingZ ? .08 : 1.65);
            if (q === 2) for (const a2 of [-.6, .6]) box('iron', 0x242424,
              xw + (facingZ ? a2 : 0), yy - .2, zw + (facingZ ? .8 : a2), .045, .47, .045);
          }
        }
      }
      // Distinctive Andalusian patio roof parapets and chimney pots, not random sky cubes.
      if (q > 0) for (let k = 0; k < 2; k++) add('tiles', G.cyl, roof, x - width / 3 + k * width / 3, H + 1.05, z - depth / 4, .27, 1.1, .27);
      ctx.cols.push(rr.slice()); buildings++;
    }
    function frontage(o) {
      const dist = o.to - o.from;
      let t = o.from + 1.2, i = 0;
      while (t + 7.5 < o.to) {
        const len = Math.min(9 + ((i * 7 + o.seed) % 10), o.to - t - .6), dp = o.depth || 13;
        const rr = o.axis === 'z' ?
          [o.front + Math.min(0, o.side * dp), o.front + Math.max(0, o.side * dp), t, t + len] :
          [t, t + len, o.front + Math.min(0, o.side * dp), o.front + Math.max(0, o.side * dp)];
        facade(rr, o.style, i + o.seed);
        t += len + 1.4 + (i % 3) * .5; i++;
      }
    }
    [
      { axis: 'z', front: 55, side: -1, from: -543, to: -140, style: 'centro', seed: 4 },
      { axis: 'z', front: 95, side: 1, from: -540, to: 98, style: 'centro', seed: 7 },
      { axis: 'z', front: 54, side: -1, from: 103, to: 389, style: 'centro', seed: 9 },
      { axis: 'z', front: 95, side: 1, from: 103, to: 392, style: 'santacruz', seed: 10 },
      { axis: 'z', front: 157, side: -1, from: -150, to: 101, style: 'santacruz', seed: 13, depth: 11 },
      { axis: 'z', front: 188, side: 1, from: -145, to: 105, style: 'santacruz', seed: 19 },
      { axis: 'z', front: 215, side: 1, from: 104, to: 305, style: 'santacruz', seed: 22 },
      { axis: 'z', front: -163, side: 1, from: -548, to: 347, style: 'centro', seed: 28 },
      { axis: 'z', front: -188, side: -1, from: -541, to: 346, style: 'centro', seed: 32 },
      { axis: 'z', front: -338, side: 1, from: -520, to: 355, style: 'triana', seed: 37 },
      { axis: 'z', front: -373, side: -1, from: -519, to: 355, style: 'triana', seed: 41 },
      { axis: 'x', front: -93, side: -1, from: -163, to: 72, style: 'centro', seed: 45 },
      { axis: 'x', front: -33, side: 1, from: -165, to: 72, style: 'centro', seed: 49 },
      { axis: 'x', front: 119, side: 1, from: -165, to: 75, style: 'centro', seed: 54 },
      { axis: 'x', front: 328, side: 1, from: -165, to: 72, style: 'centro', seed: 60 }
    ].forEach(frontage);

    /* Cathedral precinct: a different silhouette, buttresses, portals, chapel roofs and La Giralda. */
    {
      const C = [-75, 9, -9, 104], h = 26;
      box('stone', 0xc7b395, (C[0] + C[1]) / 2, h / 2, (C[2] + C[3]) / 2, C[1] - C[0], h, C[3] - C[2]);
      box('stone', 0xe2d2b6, (C[0] + C[1]) / 2, h + 1.1, (C[2] + C[3]) / 2, C[1] - C[0] + 5, 2.2, C[3] - C[2] + 5);
      for (let z = 0; z < 104; z += 12.5) {
        for (const x of [-75, 9]) {
          box('stone', 0xd6c5a5, x, 11, z, 3.4, 22, 3.3);
          add('glass', G.box, 0x4e6474, x + (x < 0 ? -.17 : .17), 16, z, .3, 7, 2.6);
        }
      }
      // Roof pinnacles, tympanum and large ceremonial doors.
      for (let x = -65; x < 9; x += 11) {
        add('stone', new THREE.ConeGeometry(1.9, 5, 5), 0xd8c5a3, x, h + 4, 50, 1, 1, 1);
      }
      box('wood', 0x604631, -31, 4.2, -9.25, 9, 8.4, .65);
      box('stone', 0xe4d3b4, -31, 9, -9.3, 12, 1, 1);
      ctx.cols.push(C);
      const gx = 34, gz = 0;
      for (const [a, hh, wid, hex] of [[0, 22, 13, 0xcbb38d], [22, 22, 11.2, 0xbfa57d], [44, 11, 10.4, 0xc0aa86], [55, 7, 8, 0xb98f65]]) {
        box('stone', hex, gx, a + hh / 2, gz, wid, hh, wid);
        for (const s of [-1, 1]) {
          add('glass', G.box, 0x475861, gx + s * (wid / 2 + .055), a + hh * .66, gz, .13, Math.min(5, hh * .33), 2.1);
          add('glass', G.box, 0x475861, gx, a + hh * .66, gz + s * (wid / 2 + .055), 2.1, Math.min(5, hh * .33), .13);
        }
      }
      add('tiles', new THREE.SphereGeometry(5.4, 14, 8, 0, TAU, 0, Math.PI / 2), 0xa17851, gx, 60.7, gz, 1, 1, 1);
      add('iron', G.cyl, 0x655942, gx, 65.3, gz, .15, 6, .15);
      add('iron', G.sph, 0x997f55, gx, 68.7, gz, .58, .58, .58);
      ctx.cols.push([gx - 6.7, gx + 6.7, gz - 6.7, gz + 6.7]);
    }
    /* Alcázar: separate south/east garden compound, merlons, pool and low palace wings. */
    {
      const a = [93, 209, 126, 253];
      box('plaster', 0xdac49c, 148, 6.4, 190, 110, 12.8, 46);
      box('tiles', 0xa96546, 148, 13.15, 190, 112, .9, 47);
      for (let x = 95; x < 207; x += 5) {
        box('stone', 0xdec8a7, x, 13.8, 126, 2.5, 1.6, 2);
        box('stone', 0xdec8a7, x, 13.8, 253, 2.5, 1.6, 2);
      }
      for (let z = 128; z <= 250; z += 5) {
        // Short visible wall to the east: iconic garden remains a reserved future interior.
        box('stone', 0xc9b58f, 209, 9, z, 1.2, 18, 2.5);
      }
      ctx.cols.push(a);
    }
    /* Plaza de España: early horseshoe elevation and water-ring visual; centre remains traversable. */
    {
      const cx = 77, cz = 490, n = q === 0 ? 16 : 30;
      for (let i = 0; i < n; i++) {
        const a = .12 * Math.PI + i / (n - 1) * .77 * Math.PI;
        const x = cx + Math.cos(a) * 125, z = cz + Math.sin(a) * 74;
        add('stone', G.box, i % 3 ? 0xcaa780 : 0xd9b897, x, 8.5, z, 10.3, 17, 11.4, -a + Math.PI / 2);
        add('tiles', G.box, 0x9f6243, x, 17.6, z, 10.8, 1.2, 12, -a + Math.PI / 2);
        if (i % 6 === 0) add('stone', G.cyl, 0xc1a07b, x, 19, z, 4.2, 37, 4.2);
      }
      const ring = new THREE.Mesh(new THREE.RingGeometry(49, 54, 80), new THREE.MeshStandardMaterial({ color: 0x5d898d, roughness: .25, metalness: .08, side: THREE.DoubleSide }));
      ring.rotation.x = -Math.PI / 2; ring.scale.set(1.32, 1, 1); ring.position.set(cx, .025, cz); group.add(ring);
      add('stone', G.cyl, 0xe2d1b8, cx, .3, cz, 3.4, .6, 3.4);
      add('stone', G.cyl, 0xc9ad87, cx, 1.65, cz, 1.25, 2.3, 1.25);
    }
    /* Las Setas and Alameda are navigable early landmark passes, not finished districts. */
    for (const [x, z] of [[16, -267], [42, -267], [16, -242], [42, -242]]) {
      add('stone', G.cyl, 0xd9c8ac, x, 9, z, 2.6, 18, 2.6);
      add('wood', G.sph, 0xe8d6bd, x, 19, z, 14, 2.8, 12);
    }
    for (const x of [-16, 65]) for (const z of [-502, -416]) {
      add('stone', G.cyl, 0xdac9ad, x, 4.5, z, 1.6, 9, 1.6);
    }

    /* Each business has a cut-out doorway, windows, floor, tables, counter and real goods. */
    const businessTargets = [];
    for (const venue of P.venues) {
      const [x0, x1, z0, z1] = venue.r, d = venue.door, H = 8.1, W = x1 - x0, D = z1 - z0;
      const wm = AV.std(venue.kind === 'craft' ? 0xe2ceb1 : 0xeee0c9, .89);
      ctx.wall(x0, x1, z0, z0 + .4, 0, H, wm);
      ctx.wall(x0, x1, z1 - .4, z1, 0, H, wm);
      ctx.wall(x1 - .4, x1, z0, z1, 0, H, wm);
      ctx.wall(x0, x0 + .4, z0, d - 1.65, 0, H, wm);
      ctx.wall(x0, x0 + .4, d + 1.65, z1, 0, H, wm);
      ctx.wall(x0, x0 + .4, d - 1.65, d + 1.65, 2.8, H, wm, false);
      box('tiles', 0xa85d44, (x0 + x1) / 2, H + .2, (z0 + z1) / 2, W + 1, .4, D + 1);
      box('tiles', 0xb6a189, (x0 + x1) / 2, .035, (z0 + z1) / 2, W - .8, .07, D - .8);
      // A recognisable courtyard floor and substantial interior counter.
      box('wood', 0x87613b, x0 + W * .72, 1.12, d, .9, 1.2, 8.2);
      box('stone', 0xede0cb, x0 + W * .72, 1.78, d, 1.4, .14, 8.5);
      ctx.cols.push([x0 + W * .72 - .6, x0 + W * .72 + .6, d - 4.1, d + 4.1]);
      for (let i = 0; i < 3; i++) {
        const zz = z0 + 5 + i * 7;
        box('wood', 0x876443, x0 + W * .37, .75, zz, 2.1, .12, 1.55);
        box('iron', 0x3a3530, x0 + W * .37, .37, zz, .1, .75, .1);
        box('wood', 0x9a744c, x0 + W * .37, .47, zz - 1.5, 1.6, .1, .4);
        box('wood', 0x9a744c, x0 + W * .37, .47, zz + 1.5, 1.6, .1, .4);
        // Deliberately leave the table/wall corridor navigable beside the counter.
      }
      // In-world localized signs use actual Canvas typography, not a glowing rectangle label.
      const xx = x0 - .085, zz = d + 3.4;
      sign(venue.sign, xx, 4.4, zz, 3.5, .85, -Math.PI / 2, venue.accent, '#fff2d8');
      for (const dz of [-8.4, 8.4]) {
        box('glass', 0x476b77, x0 - .07, 1.85, d + dz, .07, 2.4, 2.65);
        box('stone', 0xede2cc, x0 - .13, 3.15, d + dz, .3, .24, 3.2);
      }
      const shop = { id: venue.id, name: venue.name,
        greet: L('“Welcome! Take a look around.”', '«¡Bienvenido! Pasa y mira.»'),
        again: L('“Lovely to see you again.”', '«Qué alegría verte de nuevo.»'),
        items: venue.items, x: x0 + 3.65, z: d, reach: 4.7 };
      const t = target(x0 + 3.65, d, 2.7,
        () => tr('🛍 Browse ', '🛍 Comprar en ') + tr(venue.name[0], venue.name[1]),
        () => AV.shop && AV.shop.open(shop));
      businessTargets.push({ t, venue, shop });
      const staff = target(x0 + W * .64, d + 3.4, 2.3,
        () => tr('Talk to ', 'Hablar con ') + venue.staff,
        () => AV.talk && AV.talk.open({ id: venue.id + '_staff', name: venue.staff,
          first: L('“Hello! This neighbourhood has a story.”', '«¡Hola! Este barrio tiene mucha historia.»'),
          opts: [
            { label: L('What is special around here?', '¿Qué hay de especial aquí?'),
              say: L('Walk between the cathedral, orange-tree patios and the river. Triana is across Isabel II bridge.', 'Pasea entre la catedral, los patios de naranjos y el río. Triana queda al otro lado del puente de Isabel II.') },
            { label: L('Tell me about the Feria', 'Háblame de la Feria'),
              say: L('The Feria de Abril has casetas, lanterns, horse parades and sevillanas; the city is still here after the celebration.', 'La Feria de Abril tiene casetas, farolillos, paseos de caballos y sevillanas; la ciudad sigue viva el resto del año.') },
            { label: L('Where can I eat vegetarian?', '¿Dónde puedo comer vegetariano?'),
              say: L('Ask for espinacas con garbanzos or gazpacho; check each recipe, because menus vary.', 'Prueba las espinacas con garbanzos o el gazpacho; pregunta por los ingredientes, que cambian según el local.') }
          ] })) ;
      staff._seville = true;
    }

    /* Street furniture, roots and differentiated canopy; only local trees receive colliders. */
    const orange = (x, z, seed) => {
      add('wood', G.cyl, 0x7b6147, x, 2, z, .43, 4, .43);
      for (let i = 0; i < 4; i++) {
        const a = i / 4 * TAU + seed;
        add('wood', G.cyl, 0x846c50, x + Math.cos(a) * .45, 3.2, z + Math.sin(a) * .45, .12, 2.0, .12);
      }
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * TAU + seed * .5, rad = i % 3 === 0 ? 1.25 : 1.9;
        add('leaves', G.ico, rngCol([0x426c3a, 0x527943, 0x60854a, 0x355f35], i + seed | 0),
          x + Math.cos(a) * rad, 4.8 + (i % 3) * .45, z + Math.sin(a) * rad, 2.2, 1.7, 2.0);
      }
      if (q > 0) for (let i = 0; i < 12; i++) {
        const a = (i * 2.4 + seed) % TAU;
        add('fruits', G.sph, 0xeb923c, x + Math.cos(a) * (1.3 + i % 3 * .34), 3.75 + i % 5 * .44,
          z + Math.sin(a) * (1.2 + i % 3 * .32), .19, .19, .19);
      }
      ctx.circles.push([x, z, .47]);
    };
    const palm = (x, z) => {
      add('wood', G.cyl, 0x85704f, x, 4.1, z, .48, 8.2, .48);
      for (let k = 0; k < 11; k++) {
        const a = k * TAU / 11;
        add('leaves', G.sph, k % 3 ? 0x476f3c : 0x617d44,
          x + Math.cos(a) * 3.2, 8.2 - k % 3 * .3, z + Math.sin(a) * 3.2, 4.2, .15, .6, a);
      }
      ctx.circles.push([x, z, .5]);
    };
    for (const x of [-151, -113, -76]) for (let z = -525; z <= 380; z += 49) {
      if (P.distanceToRoad(x, z) < 5 && P.surface(x, z) !== null) orange(x, z, rand() * 10);
    }
    for (const x of [53, 100]) for (let z = -380; z <= 354; z += 55) {
      if (P.surface(x, z) === null || reserved.some(v => intersects([x - 3, x + 3, z - 3, z + 3], v))) continue;
      orange(x, z, rand() * 15);
    }
    // Quay trees and Maria Luisa palms, pulled off the walking routes.
    for (let z = -520; z <= 580; z += 62) orange(-205, z, rand() * 12);
    for (let z = 373; z < 625; z += 38) {
      palm(260 + (z % 3) * 4, z);
      orange(300, z + 12, rand() * 20);
    }
    for (let i = 0; i < 35; i++) {
      const x = -210 + (i * 67 % 360), z = -520 + (i * 83 % 1040);
      if (P.surface(x, z) === null || P.distanceToRoad(x, z) < 5 || reserved.some(a => intersects([x - 3, x + 3, z - 3, z + 3], a))) continue;
      orange(x, z, i * .3);
    }
    // Lamps: pooled unlit meshes + only a few active PointLights, not a light per lamppost.
    const lamppoints = [[-158, -110], [-154, 102], [54, -70], [54, 110], [54, 300], [-200, 250], [-345, 250], [184, 100]];
    const lights = [];
    lamppoints.forEach(([x, z], i) => {
      add('iron', G.cyl, 0x39413c, x, 2.75, z, .13, 5.5, .13);
      add('glass', G.sph, 0xffd69a, x, 5.6, z, .35, .35, .35, 0, .8);
      if (i < 4) { const li = new THREE.PointLight(0xffc48b, 0, 32); li.position.set(x, 5.5, z); group.add(li); lights.push(li) }
    });
    for (let i = 0; i < 65; i++) {
      const rd = P.roads[i % P.roads.length], t = (i + .5) / 66;
      const x = rd[0] + (rd[2] - rd[0]) * t, z = rd[1] + (rd[3] - rd[1]) * t;
      if (P.surface(x, z) === null) continue;
      add('iron', G.cyl, 0x52595a, x + (i % 2 ? 2 : -2), .015, z, .36, .045, .36);
    }
    // Localized ceramic street plaques and individually painted storefront signs.
    const streetSigns = [
      ['CALLE MATEOS GAGO', 97, -102, 2.7, -Math.PI / 2],
      ['CALLE ÁLVAREZ QUINTERO', 54, -220, 2.7, Math.PI / 2],
      ['BARRIO DE SANTA CRUZ', 188, 18, 2.7, -Math.PI / 2],
      ['PLAZA DEL TRIUNFO', 76, 122, 2.7, Math.PI / 2],
      ['CALLE BETIS', -338, 11, 2.7, -Math.PI / 2],
      ['TRIANA', -346, -149, 2.8, Math.PI / 2],
      ['LAS SETAS', 75, -279, 2.8, Math.PI / 2],
      ['PARQUE DE MARÍA LUISA', 242, 409, 2.8, -Math.PI / 2]
    ];
    streetSigns.forEach(([word, x, z, y, ry]) => sign(word, x, y, z, 3.2, .55, ry, '#f1e9cf', '#183b82'));

    /* Festival occupies Los Remedios but is freely toggled; the normal map never disappears. */
    const fiesta = new THREE.Group(); group.add(fiesta);
    const fl = [], casetaWalls = [];
    const fest = (geo, col, x, y, z, sx, sy, sz) => fl.push([geo, col, M(x, y, z, sx, sy, sz)]);
    for (let i = 0; i < 7; i++) for (let j = 0; j < 4; j++) {
      const x = -480 + i * 17.2, z = 403 + j * 34;
      const col = j % 2 ? 0xe8d1a3 : 0xfff0d8;
      // Three solid walls, an open front, a roof, furniture and lanterns:
      // players can genuinely WALK INSIDE fair casetas, not through opaque cubes.
      for (const s of [-1, 1]) {
        fest(G.box, col, x + s * 6.43, 2.2, z, .34, 4.4, 20);
        casetaWalls.push([x + s * 6.43 - .17, x + s * 6.43 + .17, z - 10, z + 10]);
      }
      fest(G.box, col, x, 2.2, z + 9.82, 13.2, 4.4, .36);
      casetaWalls.push([x - 6.6, x + 6.6, z + 9.64, z + 10]);
      fest(G.box, i % 2 ? 0xc93d49 : 0x347bb1, x, 4.7, z, 14.5, .8, 22);
      fest(G.box, 0xf7efe4, x, .045, z, 12.4, .09, 19.3);
      fest(G.box, 0x5b382d, x, 3.75, z - 9.92, 8.2, 1.25, .35);
      // Caseta tables and benches, raised as real 3D furniture.
      for (const s of [-1, 1]) {
        fest(G.box, 0x927153, x + s * 3, .75, z + 1.5, 1.5, .16, 4.4);
        fest(G.box, 0x6b5346, x + s * 3, .4, z + 1.5, .35, .8, .4);
      }
      for (let n = 0; n < 5; n++) {
        fest(G.sph, (i + n) % 2 ? 0xffd34c : 0xed5b62, x - 5 + n * 2.5, 5.35, z - 8.8, .38, .52, .38);
      }
    }
    const fm = new THREE.Mesh(K.merge(fl), K.floraMat(0, { rough: .83 })); fiesta.add(fm);
    const festivalNow = () => !!state.sevilleFeria;
    let casetasCollide = false;
    const updateFeria = () => {
      fiesta.visible = festivalNow();
      if (festivalNow() && !casetasCollide) { ctx.cols.push(...casetaWalls); casetasCollide = true }
      if (!festivalNow() && casetasCollide) {
        // Remove our own dynamic wall rectangles only; preserve every other city's collision system.
        for (const wall of casetaWalls) { const idx = ctx.cols.indexOf(wall); if (idx >= 0) ctx.cols.splice(idx, 1) }
        casetasCollide = false;
      }
    };
    updateFeria();
    const feriaToggle = () => { state.sevilleFeria = !state.sevilleFeria; updateFeria(); AV.save();
      AV.toast(state.sevilleFeria ? tr('Feria de Abril mode: lanterns and casetas!', 'Modo Feria de Abril: ¡farolillos y casetas!') : tr('Normal Sevilla restored.', 'Vuelve la Sevilla cotidiana.')); };
    target(-402.5, 430, 6, () => state.sevilleFeria ? tr('Finish Feria celebration', 'Terminar la Feria') : tr('Begin Feria de Abril celebration', 'Empezar Feria de Abril'), feriaToggle);
    // Festival-specific gameplay: a real stocked stall and an optional dance activity.
    const fairStock = { id: 'sev_feria_stall', name: L('Feria refreshments', 'Puesto de la Feria'),
      greet: L('“¡Buenas! A little something for the paseo?”', '«¡Buenas! ¿Algo para el paseo?»'),
      items: [['sev_zumo', 5], ['sev_espinacas', 10], ['sev_tinto', 7]], x: -394, z: 399, reach: 5 };
    target(-394, 399, 3.2, () => tr('Buy Feria refreshments', 'Comprar en la Feria'),
      () => AV.shop && AV.shop.open(fairStock), festivalNow);
    target(-402.5, 420, 3.8, () => tr('Join a sevillanas dance', 'Bailar sevillanas'),
      () => { if (AV.visit) AV.visit('sev_feria_dance');
        AV.toast(tr('You join a few steps of sevillanas. ¡Olé!', 'Bailas unos pasos de sevillanas. ¡Olé!'));
        if (AV.audio) AV.audio.blip(620, .2, 'triangle', .08); }, festivalNow);
    target(53, 340, 4, () => tr('About the Feria de Abril', 'Sobre la Feria de Abril'), () => AV.talk && AV.talk.open({
      id: 'sev_festival_guide', name: L('Festival guide', 'Guía de la Feria'),
      first: L('The fairground is across the river in Los Remedios. You can enter it through San Telmo bridge.', 'El recinto ferial está al otro lado del río, en Los Remedios. Puedes llegar por el puente de San Telmo.'),
      opts: [{ label: L('Toggle the Feria now', 'Activar o desactivar la Feria'), fn: feriaToggle, say: L('The festivities are set. Explore!', 'Festejos preparados. ¡A explorar!') },
        { label: L('Does the city work year-round?', '¿Se puede visitar el resto del año?'), say: L('Yes: the cathedral, patios, markets and businesses remain open outside festival mode.', 'Sí: la catedral, los patios, mercados y negocios siguen ahí fuera del modo feria.') }] }));
    // A walkable return portal, and a second one at the fairground for convenience.
    for (const [x, z] of [[-116, -50], [-399, 263]]) target(x, z, 3.3,
      () => tr('Portal to Ape Town', 'Portal a Ape Town'), () => AV.travel('ape_town', 'finca'));

    /* Human interaction uses existing authored NPCs + instanced background crowd. */
    if (AV.beings && AV.beings.spawn) {
      const specs = [
        ['Carmen', 104, -58, 'idle', 'cafe worker'], ['Luis', 104, 35, 'idle', 'cafe owner'],
        ['Rafa', -328, -75, 'idle', 'ceramic artist'], ['Inés', 194, 64, 'idle', 'hostel host'],
        ['Amparo', 194, -17, 'idle', 'music teacher'], ['Pablo', 67, -120, 'wander', 'bookseller'],
        ['Lucía', 65, 170, 'wander', 'student'], ['Nerea', -361, 230, 'wander', 'cyclist'],
        ['Álvaro', -177, 10, 'idle', 'river guide'], ['Sara', 56, -370, 'wander', 'florist']
      ].slice(0, [5, 8, 10][q]);
      AV.beings.spawn(ctx, specs.map(([name, x, z, mode, role], i) => ({ kind: 'human', name, x, z, y: 0, mode, seed: 900 + i * 31,
        lod: q < 2, role, area: { x, z, r: 5 }, greet: [name + ': ¡Buenas!', name + ': Hello!'],
        lines: [L('The city feels different every hour.', 'La ciudad cambia a cada hora.'), L('Try the markets and patios.', 'Visita los mercados y patios.')] })));
    }
    let crowd = null;
    const navNodes = [], navEdges = [], navSeen = new Map();
    const navNode = pt => { const key = pt[0] + ':' + pt[1]; if (!navSeen.has(key)) { navSeen.set(key, navNodes.length); navNodes.push(pt) } return navSeen.get(key) };
    Object.values(P.walkRoutes).forEach(pts => { for (let i = 1; i < pts.length; i++) navEdges.push([navNode(pts[i - 1]), navNode(pts[i])]) });
    const nav = CY && CY.nav ? CY.nav(navNodes, navEdges) : null;
    if (CY && CY.crowd && nav) {
      crowd = CY.crowd(ctx, { H: () => 0, far: [38, 70, 95][q] });
      for (let i = 0; i < [8, 18, 30][q]; i++) {
        const p = navNodes[(i * 7) % navNodes.length]; crowd.add({ v: ['woman', 'man', 'tourist', 'suit'][i % 4], x: p[0], z: p[1], nav, idleProb: .3 });
      }
    }
    if (CY && CY.traffic) {
      const loops = [{ pts: [[73, -430], [73, 350], [-176, 350], [-176, -430]], w: 12, off: 2.1 }];
      CY.traffic(ctx, loops, [
        { type: 'car', n: [2, 4, 7][q], speed: 7, cols: [0xe1d6c7, 0x3e6a86, 0x6b4b3e] },
        { type: 'scooter', n: [1, 2, 3][q], speed: 5, cols: [0x8b3a32, 0x2a5551, 0xc9b277] },
        { type: 'bicycle', n: [1, 2, 2][q], speed: 3.5, col: 0x425c4a }
      ]);
    }
    B.flush(ctx, { noShadow: q === 0 });
    let ambienceOn = false;
    const A = AV.amb;
    const ambStart = () => {
      if (ambienceOn || !A || !AV.audio || !AV.audio.ok || !AV.W || AV.W.id !== 'seville') return;
      ambienceOn = !!A.start({
        bustle: { loop: { filters: [['bandpass', 720, .75]], lfo: [.7, .45] }, vol: .35, gain: () => Math.max(.18, 1 - Math.hypot(AV.P.x - 73, AV.P.z - 20) / 290) },
        river: { loop: { filters: [['lowpass', 300]], lfo: [.25, .3] }, vol: .22, gain: () => Math.max(0, 1 - Math.abs(AV.P.x + 245) / 90) },
        birds: { vol: .4, gain: () => AV.nightK > .7 ? .06 : .65,
          tick: (c, t, o) => { A.tone(c, o, t, 2000, .11, 'sine', .06, 1.5); A.tone(c, o, t + .1, 2420, .08, 'sine', .05, 1.5); return t + 2 + Math.random() * 4 } },
        feria: { vol: .5, gain: () => state.sevilleFeria ? Math.max(0, 1 - Math.hypot(AV.P.x + 409, AV.P.z - 445) / 180) : 0,
          tick: (c, t, o) => { A.hit(c, o, t, .08, .18, 4000); A.tone(c, o, t, 246, .25, 'triangle', .11); return t + .48 } }
      });
    };
    ctx.upd.push(() => { if (!ambienceOn) ambStart();
      lights.forEach(li => { li.intensity = (AV.nightK || 0) * 1.0 }); });
    ctx.leave.push(() => { if (ambienceOn && A) A.stop(); ambienceOn = false });
    // Windows/Android: the existing Activities/Agent3 vehicle hooks, not duplicate physics.
    return {
      name: 'Sevilla · development preview', surface: P.surface, fog: [105, 780],
      arrivals: { default: { x: -116, z: -55, yaw: -Math.PI / 2 }, pipe: { x: -116, z: -55, yaw: -Math.PI / 2 },
        centro: { x: 73, z: -55, yaw: 0 }, triana: { x: -355, z: -112, yaw: 0 }, feria: { x: -405, z: 370, yaw: 0 } },
      defaultArrival: 'default',
      sky: { tint: [0xd4be9e, 0x98b7c7, .15, .3], dome: { s1: 0xffd7a6, s2: 0x90b8d9, swirl: .02, cloud: .13, glow: .28 } },
      mapRoads: P.roads, mapNav: nav,
      mapDistricts: P.districts, places: P.places,
      chatLines: [L('Seville is a city of courtyards, ceramics and conversation.', 'Sevilla es una ciudad de patios, cerámica y conversación.'),
        L('Cross Isabel II bridge to find Triana and its artists.', 'Cruza el puente de Isabel II para conocer Triana y sus artistas.')],
      musicProfile: { bpm: 104, root: 52, scale: [0, 2, 4, 5, 7, 9, 10], style: 'amb' },
      agent4: { phase: 'first playable district / preview', buildings, venues: businessTargets.length, festival: festivalNow }
    };

    function sign(text, x, y, z, w, h, ry, bg, fg) {
      const cv = document.createElement('canvas'); cv.width = 768; cv.height = 196;
      const c = cv.getContext('2d');
      c.fillStyle = bg || '#ece4d2'; c.fillRect(0, 0, cv.width, cv.height);
      c.lineWidth = 12; c.strokeStyle = fg || '#173d7b'; c.strokeRect(8, 8, cv.width - 16, cv.height - 16);
      c.fillStyle = fg || '#173d7b'; c.textAlign = 'center'; c.textBaseline = 'middle';
      let sz = 54; do { c.font = `600 ${sz}px Georgia,serif`; sz -= 2 } while (c.measureText(text).width > 700 && sz > 21);
      c.fillText(text, 384, 98, 698);
      // Genuine custom readable text; canvas textures render from file:// too.
      const tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding;
      const material = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, transparent: false });
      material.userData.lin = 1;
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
      mesh.position.set(x, y, z); mesh.rotation.y = ry || 0; group.add(mesh);
    }
  }
});
/* Existing rental/activity API adds kiosks without touching Agent 3 physics. */
addEventListener('load', () => {
  if (!AV.act || !AV.act.PLACES) return;
  const list = AV.act.PLACES.seville || (AV.act.PLACES.seville = []);
  if (list.some(o => o._agent4)) return;
  list.push(
    { type: 'rental', id: 'sev_bike', kind: 'bicycle', x: 78, z: -152, ry: 0, price: 3, name: L('Sevilla public bicycle rental', 'Alquiler de bicicleta'), col: 0x3a825a, _agent4: 1 },
    { type: 'rental', id: 'sev_scoot', kind: 'scooter', x: -351, z: 143, ry: Math.PI, price: 5, name: L('Triana scooter rental', 'Alquiler de moto en Triana'), col: 0x9e5440, _agent4: 1 });
});
})(window.AV);
