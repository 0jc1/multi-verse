/* APEVERSE - world_pai.js : Worlds Reborn §10, PAI, rebuilt from the owner's illustrated map ("Apeverse - Pai: Mountain Town & Jungle Nights").
   North = -z. A green mountain valley wrapped in jungle:
     PAI WALKING STREET runs north-south through the middle: open-front wooden shophouses on both sides (timber posts, plaster, corrugated
       and thatch gable roofs, upper floors with lit windows and balconies, awnings, hanging boards, chalkboard menus, plants, tables),
       fairy-light strings zig-zagging overhead, a night market from 17:00, parked scooters. West side: RAINNY CAFÉ, GANITA CAFÉ, and a lane
       to the TEA & DRUM CIRCLE pavilion (floor cushions, drums, mural). East side: bars and shops, the scooter rental lot, and a lane to the river.
     North-west hill: SUNSET BAR (wood deck on the ridge, DJ booth, bar, cushions, purple canopy, valley view, techno from 17:00).
     North-east: PARADISE CIRCUS (fabric tents, string lights, sand fire ring, fire show 20:00-01:00 with a crowd).
     East: the PAI RIVER with the PAI RIVER JAM hostel on its bank (stilt cabins, bar deck, campfire, the pirate sign),
       a bamboo footbridge to rice fields and the jungle road to the JUNGLE RAVE.
     West: a WATERFALL in the jungle. South-west: HOT SPRINGS (steaming rock pools) and a BAMBOO BRIDGE over the creek.
     South: PAI CANYON (red ridges, a walking path, sunset viewpoint). Far north-west: YUN LAI VIEWPOINT. North-east: the road to Chiang Mai
       and the BUS & MINIVAN station.
   Sound: js/ambience.js zones (insects, birds, river, frogs at night, distant dogs, market chatter, café music, tea-circle drums, hostel jam,
   Sunset Bar techno, Paradise drums and crowd); world music ducks near the venues that play their own.
   Owner's memories: venue names as remembered (Rainny, Ganita); the pirate sign quote is a memory, not a verified real sign. */
'use strict';
(function (AV) {
const tr = AV.tr, TAU = Math.PI * 2, L = (e, s) => [e, s];
const RIV = { x: 90, w: 12 }, BR = { z: 2, w: 1.8 };
const PL = { sunset: [-42, -100], paradise: [44, -98], tea: [-26, 13], hostel: [70, 8], springs: [-86, 82], fall: [-124, -6], canyon: [4, 150], yunlai: [-108, -132], bus: [24, -68], rental: [10, 43], jungle: [158, -12] };
const cpx = z => 4 + 5 * Math.sin(Math.max(0, z - 128) / 14);   /* the canyon walking path */
const ss = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t) };
const gau = (x, z, cx, cz, s) => Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / (2 * s * s));
/* ---------- procedural textures (generated once, reused): tinted by each part's vertex colour ---------- */
const TX = {};
function ctex(key, size, draw, rep) { if (TX[key]) return TX[key]; const cv = document.createElement('canvas'); cv.width = cv.height = size; draw(cv.getContext('2d'), size, AV.rng(key.length * 131 + 7)); const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; if (rep) t.repeat.set(rep, rep); return TX[key] = t }
const woodTex = () => ctex('pai_wood', 256, (c, s, r) => { c.fillStyle = '#d8cfc2'; c.fillRect(0, 0, s, s); for (let x = 0; x < s; x += 32) { for (let y = 0; y < s; y += 2) { c.fillStyle = 'rgba(70,45,25,' + (.06 + .08 * Math.abs(Math.sin(y * .05 + x + r() * .4))).toFixed(3) + ')'; c.fillRect(x + 2 + Math.sin(y * .03 + x) * 3, y, 26, 2) } c.fillStyle = 'rgba(40,25,15,.55)'; c.fillRect(x, 0, 2, s); if (r() < .7) { c.strokeStyle = 'rgba(60,35,20,.45)'; c.lineWidth = 2; c.beginPath(); c.ellipse(x + 8 + r() * 16, r() * s, 3, 6, 0, 0, Math.PI * 2); c.stroke() } } });
const plasTex = () => ctex('pai_plaster', 256, (c, s, r) => { c.fillStyle = '#f2efe8'; c.fillRect(0, 0, s, s); for (let i = 0; i < 1600; i++) { c.fillStyle = 'rgba(' + (r() < .5 ? '90,80,60' : '255,255,255') + ',' + (r() * .08).toFixed(3) + ')'; c.fillRect(r() * s, r() * s, 2 + r() * 6, 2 + r() * 6) }
  const g = c.createLinearGradient(0, s, 0, s * .6); g.addColorStop(0, 'rgba(70,55,35,.45)'); g.addColorStop(1, 'rgba(70,55,35,0)'); c.fillStyle = g; c.fillRect(0, s * .6, s, s * .4);   /* grime at the bottom of every storey */
  c.strokeStyle = 'rgba(60,50,40,.35)'; c.lineWidth = 1; for (let i = 0; i < 5; i++) { c.beginPath(); let x = r() * s, y = r() * s; c.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (r() - .5) * 18; y += r() * 12; c.lineTo(x, y) } c.stroke() } });
const roofTex = () => ctex('pai_roof', 128, (c, s, r) => { for (let x = 0; x < s; x++) { const v = 200 + 40 * Math.sin(x / s * Math.PI * 16); c.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')'; c.fillRect(x, 0, 1, s) } for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(120,60,20,' + (r() * .35).toFixed(2) + ')'; c.beginPath(); c.arc(r() * s, r() * s, 2 + r() * 8, 0, Math.PI * 2); c.fill() } });
const groundTex = () => ctex('pai_ground', 256, (c, s, r) => { c.fillStyle = '#c8c8c0'; c.fillRect(0, 0, s, s); for (let i = 0; i < 5000; i++) { const k = r(); c.fillStyle = k < .4 ? 'rgba(40,70,20,.18)' : k < .7 ? 'rgba(255,255,230,.12)' : 'rgba(90,70,40,.16)'; c.fillRect(r() * s, r() * s, 1 + r() * 3, 3 + r() * 5) } }, 110);
const laneTex = () => ctex('pai_lane', 256, (c, s, r) => { c.fillStyle = '#d0c4b0'; c.fillRect(0, 0, s, s); for (let i = 0; i < 2200; i++) { c.fillStyle = 'rgba(' + (r() < .5 ? '80,60,40' : '255,250,235') + ',' + (r() * .22).toFixed(3) + ')'; c.beginPath(); c.arc(r() * s, r() * s, 1 + r() * 2.6, 0, Math.PI * 2); c.fill() } c.strokeStyle = 'rgba(90,75,55,.25)'; c.lineWidth = 2; for (let y = 0; y < s; y += 64) { c.beginPath(); c.moveTo(0, y); c.lineTo(s, y); c.stroke() } });
/* world-space box-mapped UVs for merged geometry, so textures never stretch with the part's scale */
function worldUV(g, sc, sy) { const p = g.attributes.position, n = g.attributes.normal, uv = new Float32Array(p.count * 2); for (let i = 0; i < p.count; i++) { const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i)), x = p.getX(i), y = p.getY(i), z = p.getZ(i);
  if (ay >= ax && ay >= az) { uv[i * 2] = x / sc; uv[i * 2 + 1] = z / sc } else if (ax >= az) { uv[i * 2] = z / sc; uv[i * 2 + 1] = y / (sy || sc) } else { uv[i * 2] = x / sc; uv[i * 2 + 1] = y / (sy || sc) } } g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); return g }
const texMat = (map, rough, metal) => { const m = new THREE.MeshStandardMaterial({ vertexColors: true, map, roughness: rough, metalness: metal || 0 }); m.userData.lin = 1; return m };
/* ---------- terrain ---------- */
function base(x, z) {
  let h = 0; const e = Math.hypot(x / 165, (z - 5) / 170); if (e > 1) h += (e - 1) * 70 * (1 + .3 * Math.sin(x * .05) * Math.cos(z * .04));
  const town = Math.max(0, 1 - Math.hypot(x / 34, z / 78)); h += (1 - town) * (Math.sin(x * .045) * Math.cos(z * .05) * 1.1 + Math.sin(x * .11 + z * .07) * .35);
  h += 6 * gau(x, z, -42, -100, 20) + 12 * gau(x, z, -108, -132, 24) + 2.5 * gau(x, z, 46, -100, 26);
  if (z > 92) { const k = ss(96, 126, z), lat = Math.max(0, 1 - Math.max(0, Math.abs(x - 4) - 46) / 18); let c = 8 * k * lat; const path = Math.abs(x - cpx(z)) < 3.8, n = Math.sin(x * .21) * Math.sin(z * .17) + Math.sin(x * .09 + z * .13) * .6;
    if (!path && k > .6 && n > .3 && z < 178) c -= 6.5 * Math.min(1, (n - .3) * 4) * k * lat; h += c }
  if (x < -128) h += Math.min(15, (-128 - x) * 3) * Math.max(0, 1 - Math.abs(z + 6) / 30);
  const rd = Math.abs(x - RIV.x); if (rd < 11) h = h * ss(6, 11, rd) + (-1.6 + rd * .12) * (1 - ss(6, 11, rd));
  return h;
}
const PADS = [[PL.sunset, 15, null], [PL.paradise, 15, null], [PL.yunlai, 7, null], [PL.bus, 10, 0], [PL.tea, 9, 0]];
PADS.forEach(p => { if (p[2] == null) p[2] = base(p[0][0], p[0][1]) });
function H(x, z) {
  let h = base(x, z); const town = (1 - ss(13, 19, Math.abs(x))) * (1 - ss(66, 76, Math.abs(z))); h *= 1 - town;            // the town floor is flat
  if (x > 54 && x < RIV.x - 6 && Math.abs(z - 8) < 42) h *= ss(RIV.x - 6, 54, x);                                         // flat hostel bank
  for (const [c, r, y] of PADS) { const d = Math.hypot(x - c[0], z - c[1]); if (d < r + 8) { const w = 1 - ss(r, r + 8, d); h = h * (1 - w) + y * w } }
  return h;
}
const SPR = [[-86, 82, 3.4], [-80, 88, 2.6], [-92, 89, 2.8]];
const inPool = (x, z) => Math.hypot(x - PL.fall[0] - 2, z - PL.fall[1]) < 6.5 || SPR.some(p => Math.hypot(x - p[0], z - p[1]) < p[2]);
const surf = (x, z) => { if (Math.hypot(x / 205, (z - 5) / 205) > 1) return null; if (Math.abs(z - BR.z) < BR.w && Math.abs(x - RIV.x) < RIV.w / 2 + 6) return Math.max(H(x, z), .2 - Math.max(0, Math.abs(x - RIV.x) - RIV.w / 2 - 1.5) * .3);   /* walk ON the bamboo bridge deck, with ramps at both ends */ if (Math.abs(x - RIV.x) < RIV.w / 2) return null; if (inPool(x, z)) return null; return H(x, z) };

Object.assign(AV.ITEMS, {
  pai_tea: { n: L('Pot of herbal tea', 'Tetera de té de hierbas'), cat: 'drink', ic: '🫖', use: 'drink', model: 'cup', col: 0xc8a060, fx: { type: 'sober', amt: .15 }, say: L('Lemongrass, butterfly pea, and a “special” blend the drummer only jokes about. Calm.', 'Hierbaluisa, flor de guisante azul y una mezcla “especial” de la que el tamborilero solo bromea. Calma.'), price: 15 },
  pai_bowl: { n: L('Smoothie bowl (Rainny Café)', 'Bol de smoothie (Rainny Café)'), cat: 'food', ic: '🥣', use: 'eat', model: 'bowl', col: 0xb04ad8, say: L('Dragon fruit, banana, granola, a tiny flower on top.', 'Pitahaya, plátano, granola y una florecita encima.'), price: 30 },
  pai_curry: { n: L('Vegan massaman curry', 'Curry massaman vegano'), cat: 'food', ic: '🍛', use: 'eat', model: 'bowl', col: 0xd8902a, say: L('Rich, mild, peanuts and potatoes. Mountain comfort food.', 'Suave, cremoso, cacahuetes y patatas. Comida de montaña.'), price: 45 },
  pai_roti: { n: L('Banana roti', 'Roti de plátano'), cat: 'food', ic: '🫓', use: 'eat', model: 'bowl', col: 0xf0d090, say: L('Crispy, buttery, condensed milk. The night market’s best friend.', 'Crujiente, mantecoso, con leche condensada. El mejor amigo del mercado nocturno.'), price: 20 }
});

AV.registerWorld({
  id: 'pai',
  build(ctx) {
    const K = AV.kit, CY = AV.city, q = ctx.q, rng = ctx.rng, grp = ctx.group, S = AV.S, wood = [], roof = [], glow = [], plaster = [];
    const T = (x, z, r, label, fn, show) => { const t = { x, z, r, label, fn, show }; ctx.T.push(t); return t };
    const B = (arr, col, x, y, z, sx, sy, sz, ry, rx, rz) => arr.push([K.BG.box, col, K.M(x, y, z, sx, sy, sz, rx || 0, ry || 0, rz || 0)]);
    const C = (arr, col, x, y, z, r, h) => arr.push([K.BG.cyl, col, K.M(x, y, z, r, h, r)]);
    const hour = () => (S.time / 60) % 24, night = () => { const h = hour(); return h >= 17.5 || h < 5.5 }, eve = () => { const h = hour(); return h >= 17 || h < 1 }, fireOn = () => { const h = hour(); return h >= 20 || h < 1 };
    const lin = h => new THREE.Color(h).convertSRGBToLinear();
    const PRISM = (() => { const sh = new THREE.Shape([new THREE.Vector2(-.5, 0), new THREE.Vector2(.5, 0), new THREE.Vector2(0, 1)]); const g = new THREE.ExtrudeGeometry(sh, { depth: 1, bevelEnabled: false }); g.translate(0, 0, -.5); return g })();
    /* ---------- terrain + water ---------- */
    AV.terrain(ctx, 440, [110, 150, 190][q], H, (x, z, h) => { const rd = Math.abs(x - RIV.x), n = Math.sin(x * .3) * Math.cos(z * .27) + Math.sin(x * .07 - z * .05);
      if (z > 100 && Math.abs(x - 4) < 66 && h > 1.5) return n > .4 ? 0xb8582e : n > -.3 ? 0xc86a38 : 0xa84a2a;
      if (rd < 12) return h < -.6 ? 0x6a6a52 : 0x9a8a5a;
      if (x > 100 && x < 160 && z > -50 && z < 64) return (Math.floor(x / 9) + Math.floor(z / 7)) % 3 ? (n > 0 ? 0x7ab83a : 0x8ac84a) : 0xb8c85a;
      if (Math.abs(x) < 16 && Math.abs(z) < 72) return 0x8a7a5a;
      return h > 9 ? (n > 0 ? 0x2e5a2e : 0x3a6a32) : n > .5 ? 0x4a7a32 : n > -.4 ? 0x3e7030 : 0x5a8a3a });
    { const tm = grp.children[grp.children.length - 1]; if (tm && tm.material && tm.isMesh) { tm.material.map = groundTex(); tm.material.needsUpdate = true } }   /* ground detail texture */
    K.waterPlane(ctx, new THREE.PlaneGeometry(14, 420), -.55, { deep: 0x3a5a46, shallow: 0x7a9a6a, iri: .05, sky: 0xd8c8a8, opacity: .92 }).position.x = RIV.x;
    const pool = (x, z, r, y, opt) => { const w = K.waterPlane(ctx, new THREE.CircleGeometry(r, 28), y, opt); w.position.x = x; w.position.z = z; return w };
    pool(PL.fall[0] + 2, PL.fall[1], 8, H(PL.fall[0] + 9, PL.fall[1]) - .4, { deep: 0x1a6a7a, shallow: 0x5ac8c8, iri: .1 });
    K.waterfall(ctx, -129.5, H(-129.5, -6) - 1, -6, 7, 13, Math.PI / 2, {}); K.waterfall(ctx, -129.3, H(-129.5, -6) + 4, -10, 3, 8, Math.PI / 2, {});
    SPR.forEach(([x, z, r]) => { pool(x, z, r, H(x + r + 1, z) - .3, { deep: 0x3a8a9a, shallow: 0x9ae0e0, iri: .02, opacity: .85 }); K.motes(ctx, { n: 30, x, z, r: r * .8, y0: H(x + r, z), y1: H(x + r, z) + 2.4, cols: [0xffffff, 0xe8f0f0], size: 6, speed: .5, alpha: .35 }) });
    /* ---------- shophouses on Walking Street ---------- */
    const WOOD = [0x8a5a36, 0x9a6a40, 0x7a4a2c, 0xa87a4c, 0x6a4632], PLAS = [0xe8dcc0, 0xd8c8a0, 0xc8d8c0, 0xe8c8a8, 0xd0c0d8], ROOF = [0x8a4a32, 0xb89a5a, 0x3a6a5a, 0x7a5a3a, 0x9a3a2a], AWN = [0xff6a4a, 0xffd84a, 0x4ac8c8, 0xff4ad2, 0x7aff8a, 0xff9a3a];
    const signs = [];
    function shophouse(side, zc, w, name, col, o) {
      o = o || {}; const s = side === 'w' ? -1 : 1, fx = s * 3.6, bx = s * 11.6, cx = (fx + bx) / 2, D = 8, h = o.h || 3.2, k = Math.abs(Math.round(zc / 9)) % 5, two = o.two != null ? o.two : (k % 2 === 0);
      B(plaster, 0x8a8478, cx, .07, zc, D, .14, w);
      B(o.wood ? wood : plaster, o.wood ? WOOD[k] : PLAS[k], bx - s * .12, h / 2, zc, .25, h, w); ctx.cols.push([Math.min(bx, bx - s * .3), Math.max(bx, bx - s * .3), zc - w / 2, zc + w / 2]);
      for (const e of [-1, 1]) { const ez = zc + e * (w / 2 - .12); B(o.wood ? wood : plaster, o.wood ? WOOD[k] : PLAS[k], cx, h / 2, ez, D, h, .25); ctx.cols.push([Math.min(fx, bx), Math.max(fx, bx), ez - .14, ez + .14]); C(wood, 0x4a3020, fx, h / 2, zc + e * (w / 2 - .2), .13, h) }
      if (two) { B(wood, WOOD[(k + 2) % 5], cx, h + 1.4, zc, D, 2.8, w); for (let i = -1; i <= 1; i += 2) B(glow, 0xffe0a0, fx + s * -.02, h + 1.5, zc + i * w / 4, .06, 1, w / 5);
        B(wood, 0x5a3a24, fx - s * .5, h + .05, zc, 1.1, .12, w); B(wood, 0x5a3a24, fx - s * 1, h + .6, zc, .06, .9, w) }
      const rh = two ? h + 2.8 : h; roof.push([PRISM, ROOF[(k + (o.roofk || 0)) % 5], K.M(cx, rh, zc, w + .8, 1.9, D + 1.2, 0, Math.PI / 2, 0)]);
      roof.push([K.BG.box, AWN[(k + 3) % 6], K.M(fx - s * .9, h - .25, zc, 1.9, .07, w - .4, 0, 0, s * .32)]);
      B(wood, 0x3a2a1c, fx + s * .15, h - .08, zc, .2, .2, w);
      const cw = Math.min(w - 2, 5); B(wood, WOOD[(k + 1) % 5], bx - s * 1.6, .55, zc, .8, 1.1, cw); ctx.cols.push([Math.min(bx - s * 2, bx - s * 1.2), Math.max(bx - s * 2, bx - s * 1.2), zc - cw / 2, zc + cw / 2]);
      for (let i = 0; i < 5; i++) B(glow, AWN[(i + k) % 6], bx - s * .3, 1.5 + (i % 2) * .5, zc - w / 3 + i * w / 7, .1, .25, .35);
      B(wood, 0x2a1a14, fx - s * .4, 2.25, zc + w / 2 - .5, .06, .9, 1.2); B(glow, col, fx - s * .44, 2.25, zc + w / 2 - .5, .03, .7, 1);
      if (o.chalk !== false) { B(wood, 0x1a1a1a, fx - s * .5, .55, zc - w / 2 + 1.1, .05, 1.05, .5); B(glow, 0xf0f0e0, fx - s * .53, .7, zc - w / 2 + 1.1, .02, .1, .42) }
      for (let i = 0; i < 3; i++) B(glow, [0xff4ad2, 0x4ad8ff, 0xffd84a][i], fx - s * .2, h - .45, zc - w / 3 + i * w / 3, .12, .12, .12);
      if (name) { signs.push([name, fx - s * 1.5, h + (two ? 3.3 : .95), zc - w / 2 + .6, Math.PI, Math.min(w - 2.4, 3.6), col]); if (o.wood) signs.push([name, fx + s * .1, h + (two ? 3.3 : .95), zc, s > 0 ? -Math.PI / 2 : Math.PI / 2, Math.min(w - 1.4, 6), col]) }   /* projecting board you read walking down the street + facade sign */
      return { s, fx, bx, cx, zc, w, h };
    }
    const cafe = (b, n) => { B(wood, 0x1a1a1a, b.bx - b.s * .2, 2.1, b.zc + 1.6, .05, 1, 1.6); for (let i = 0; i < 4; i++) B(glow, 0xf0f0e0, b.bx - b.s * .24, 1.75 + i * .2, b.zc + 1.6, .02, .05, 1.2); for (let i = 0; i < 2; i++) { C(wood, 0x2a2a2a, b.cx, b.h - .3, b.zc - b.w / 4 + i * b.w / 2, .01, .6); C(glow, 0xffd890, b.cx, b.h - .65, b.zc - b.w / 4 + i * b.w / 2, .16, .2) } for (let i = 0; i < n; i++) { const tx = b.cx + b.s * (i % 2 ? 1.1 : -1.1), tz = b.zc - b.w / 4 + (i >> 1) * (b.w / 2.4); C(wood, 0x6a4a30, tx, .72, tz, .5, .06); C(wood, 0x4a3020, tx, .36, tz, .05, .72); for (const d of [-.75, .75]) C(wood, 0x7a5a3a, tx, .23, tz + d, .2, .46); ctx.circles.push([tx, tz, .55]) } };
    const W = [[-55, 8, 'BAMBOO CRAFTS', '#ffb04a'], [-45, 10, 'RAINNY CAFÉ', '#7aff8a', { wood: true }], [-35, 8, 'HANDMADE ART', '#ff8ad8'], [-26, 10, 'GANITA CAFÉ', '#ffd84a', { wood: true }], [-16, 8, 'MOUNTAIN COFFEE', '#d8a060'], [-7, 8, 'REGGAE HUT', '#7aff8a'], [2, 8, 'TOURS · LAUNDRY', '#4ad8ff'],
      [24, 8, 'SILVER & STONES', '#e8e8f0'], [33, 8, 'NOODLES', '#ff8a3a'], [42, 8, 'MINIMART 24H', '#4ad8ff'], [51, 8, 'POSTCARDS', '#ff8ad8'], [60, 8, null, '#ffd84a']];
    const E = [[-55, 8, 'THAI MASSAGE', '#ff8ad8'], [-45, 8, 'SOUVENIRS', '#ffd84a'], [-36, 9, 'LIVE BLUES BAR', '#4ad8ff', { wood: true }], [-27, 8, 'ROTI & PANCAKES', '#ffb04a'], [-18, 8, 'TATTOO', '#c88aff'], [-9, 8, 'COCOA & TEA', '#d8a060'],
      [12, 8, 'BOOKS & VINYL', '#ff8a3a'], [21, 9, 'ELEPHANT PANTS', '#ff4ad2'], [30, 8, 'JUICE BAR', '#7aff8a'], [55, 8, 'BAKERY', '#ffd84a'], [63, 8, null, '#4ad8ff']];
    const built = {}; W.forEach(([z, w, n, c, o]) => built['w' + z] = shophouse('w', z, w, n, parseInt(c.slice(1), 16), o)); E.forEach(([z, w, n, c, o]) => built['e' + z] = shophouse('e', z, w, n, parseInt(c.slice(1), 16), o));
    cafe(built['w-45'], 4); cafe(built['w-26'], 4); cafe(built['e-36'], 3); cafe(built['e30'], 2);
    for (let z = -62; z <= 64; z += 3.6) if (rng() < .45) { const x = (rng() < .5 ? -1 : 1) * (4 + rng() * .3), zz = z + rng(); C(plaster, 0xb86a3a, x, .25, zz, .25, .5); plaster.push([K.BG.ico, 0x3a8a3a, K.M(x, .75, zz, .42, .45, .42)]) }
    const lm = new THREE.MeshStandardMaterial({ color: lin(0xb89c78), roughness: .92, map: (() => { const t = laneTex().clone(); t.needsUpdate = true; t.repeat.set(2, 40); return t })() }); lm.userData.lin = 1; const lane = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 140), lm); lane.rotation.x = -Math.PI / 2; lane.position.set(0, .02, 0); lane.receiveShadow = true; grp.add(lane);
    const zig = []; for (let z = -64; z <= 66; z += 7) zig.push([(zig.length % 2 ? 3.6 : -3.6), 4.3, z]); K.lanterns(ctx, zig, { per: 9, sag: .5, cols: [0xfff0b0, 0xffd080, 0xff9ad8, 0x9ae8ff] });
    const fz = []; for (let z = -64; z <= 66; z += 11) fz.push([(fz.length % 2 ? -3.6 : 3.6), 3.4, z]); K.lanterns(ctx, fz, { per: 7, sag: .3, cols: [0xff4ad2, 0xffd84a, 0x7aff8a] });
    const stallG = new THREE.Group(); grp.add(stallG); const stallParts = [];
    for (let z = -58; z <= 58; z += 6.5) { const s = (Math.round(z / 6.5) % 2) ? -1 : 1, x = s * 2.4; B(stallParts, 0xf0e8d8, x, .8, z, .8, .08, 1.8); for (const e of [-1, 1]) B(stallParts, 0x5a4a3a, x, 1.1, z + e * .8, .05, 2.2, .05); B(stallParts, AWN[Math.abs(Math.round(z)) % 6], x, 2.2, z, 1.2, .05, 2.2);
      for (let i = 0; i < 4; i++) B(stallParts, AWN[(i + Math.abs(Math.round(z))) % 6], x, .9, z - .6 + i * .4, .25, .12, .25) }
    stallG.add(new THREE.Mesh(K.merge(stallParts), K.floraMat(0, { rough: .8 })));
    if (CY && CY.parked) { const list = []; for (let z = -50; z < 60; z += 1.1) if (rng() < .3) list.push({ type: 'scooter', x: (rng() < .5 ? -1 : 1) * 13, z, yaw: Math.PI / 2 + (rng() - .5) * .3, col: [0xe8e4da, 0x2a2a2a, 0xc83a3a, 0x3a6ad8, 0x3ad06a][rng() * 5 | 0] });
      for (let i = 0; i < 10; i++) list.push({ type: 'scooter', x: PL.rental[0] + 1 + (i % 5) * 1.1, z: PL.rental[1] - 2 + (i / 5 | 0) * 2.4, yaw: 0, col: [0xe8e4da, 0x3ad06a, 0x2a2a2a][i % 3] }); try { CY.parked(ctx, list) } catch (e) { } }
    const pm = new THREE.MeshStandardMaterial({ color: lin(0x7a6a50), roughness: .95 }); pm.userData.lin = 1;
    const path = (x0, z0, x1, z1, w) => { const L2 = Math.hypot(x1 - x0, z1 - z0), g = new THREE.PlaneGeometry(w, L2, 1, Math.max(2, L2 / 3 | 0)); g.rotateX(-Math.PI / 2); g.rotateY(Math.atan2(x1 - x0, z1 - z0)); g.translate((x0 + x1) / 2, 0, (z0 + z1) / 2); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, H(p.getX(i), p.getZ(i)) + .06); g.computeVertexNormals(); const m = new THREE.Mesh(g, pm); m.receiveShadow = true; grp.add(m) };
    const ROUTES = [[-4, 13, PL.tea[0], PL.tea[1], 3], [4, 2, RIV.x - 4, BR.z, 3.4], [0, -66, PL.sunset[0] + 4, PL.sunset[1] + 10, 3], [6, -66, PL.paradise[0] - 4, PL.paradise[1] + 10, 3], [0, 66, 4, 128, 3], [4, 128, cpx(142), 142, 3], [cpx(142), 142, cpx(156), 156, 3], [cpx(156), 156, cpx(170), 170, 3], [-12, 30, PL.springs[0] + 4, PL.springs[1] - 8, 2.4], [-14, -8, PL.fall[0] + 12, PL.fall[1], 2.4], [RIV.x + 6, BR.z, PL.jungle[0], PL.jungle[1], 3.6], [PL.bus[0], PL.bus[1] - 4, 140, -175, 6], [PL.sunset[0] - 6, PL.sunset[1] - 6, PL.yunlai[0] + 4, PL.yunlai[1] + 4, 2.4]];
    ROUTES.forEach(r => path(...r));
    /* ---------- Rainny Café, Ganita Café, roti, blues bar ---------- */
    const rC = built['w-45'], gC = built['w-26'], roti = built['e-27'], blues = built['e-36'];
    T(rC.bx + 2.6, rC.zc, 2.4, () => tr('🥣 Rainny Café counter: smoothie bowls · vegan · healthy', '🥣 Mostrador del Rainny Café: boles de smoothie · vegano'), () => AV.shop && AV.shop.open({ id: 'pai_rainny', name: L('Rainny Café', 'Rainny Café'), greet: L('“Hello! Smoothie bowl today? Dragon fruit from the farm up the hill.”', '“¡Hola! ¿Bol de smoothie hoy? Pitahaya de la granja de la colina.”'), items: [['pai_bowl', 30], ['smoothie', 35], ['water', 10]] }));
    T(gC.bx + 2.6, gC.zc, 2.4, () => tr('🍛 Ganita Café counter: plant-based kitchen (name as remembered)', '🍛 Mostrador de Ganita Café: cocina vegetal (nombre recordado)'), () => AV.shop && AV.shop.open({ id: 'pai_vegan', name: L('Ganita Café', 'Ganita Café'), greet: L('“Sawasdee! Everything here is plant-based. The massaman is the one.”', '“¡Sawasdee! Aquí todo es vegetal. El massaman es el bueno.”'), items: [['pai_curry', 45], ['khao_soi', 40], ['mango', 25]] }));
    T(roti.bx - 2.6, roti.zc, 2.2, () => tr('🫓 Roti stand', '🫓 Puesto de roti'), () => AV.shop && AV.shop.open({ id: 'pai_roti', name: L('Roti & pancakes', 'Roti y tortitas'), greet: L('“Banana, Nutella, both? Both.”', '“¿Plátano, Nutella, las dos? Las dos.”'), items: [['pai_roti', 20], ['pineapple_shake', 18]] }));
    T(blues.bx - 2.6, blues.zc, 2.2, () => tr('🍺 Live Blues Bar', '🍺 Bar de blues en vivo'), () => AV.shop && AV.shop.open({ id: 'pai_blues', name: L('Live Blues Bar', 'Bar de blues'), greet: L('A guitarist tunes up in the corner. “Set starts at nine.”', 'Un guitarrista afina en la esquina. “El set empieza a las nueve.”'), items: [['beer', 20], ['water', 8]] }));
    /* ---------- Tea & Drum Circle pavilion ---------- */
    { const [x, z] = PL.tea; B(wood, 0x7a5a3a, x, .12, z, 13, .24, 10); for (const [px, pz] of [[-6, -4.6], [6, -4.6], [-6, 4.6], [6, 4.6]]) { C(wood, 0x4a3020, x + px, 1.8, z + pz, .16, 3.6); ctx.circles.push([x + px, z + pz, .22]) }
      roof.push([PRISM, 0xb89a5a, K.M(x, 3.6, z, 14, 2.2, 11, 0, 0, 0)]); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU; C(plaster, AWN[k % 6], x + Math.cos(a) * 3.4, .32, z + Math.sin(a) * 2.6, .45, .14) }
      for (let k = 0; k < 4; k++) C(wood, [0x8a5a3a, 0xa87a4c][k % 2], x - 1.5 + k, .45, z, .26, .6); B(wood, 0x3a2a20, x + 3.4, .38, z - 3, 1.4, .16, .8);
      const cv = document.createElement('canvas'); cv.width = 512; cv.height = 256; const g = cv.getContext('2d'), gr = g.createLinearGradient(0, 0, 512, 256); gr.addColorStop(0, '#5a1a8a'); gr.addColorStop(1, '#1a6a8a'); g.fillStyle = gr; g.fillRect(0, 0, 512, 256);
      for (let i = 0; i < 18; i++) { g.strokeStyle = ['#ff6ad5', '#ffe066', '#7ff0c8'][i % 3]; g.lineWidth = 6; g.beginPath(); g.arc(256, 128, 14 + i * 12, 0, TAU); g.stroke() } g.fillStyle = '#fff6d8'; g.beginPath(); g.ellipse(256, 110, 50, 24, 0, 0, TAU); g.fill(); g.fillStyle = '#3a1a5a'; g.beginPath(); g.arc(256, 110, 16, 0, TAU); g.fill(); g.font = 'bold 30px cursive'; g.textAlign = 'center'; g.fillStyle = '#ffe066'; g.fillText('TEA · DRUMS · LOVE', 256, 220);
      const mt = new THREE.CanvasTexture(cv); mt.encoding = THREE.sRGBEncoding; const mural = new THREE.Mesh(new THREE.PlaneGeometry(9, 4.5), new THREE.MeshBasicMaterial({ map: mt })); mural.position.set(x - 6.2, 2.3, z); mural.rotation.y = Math.PI / 2; grp.add(mural); B(wood, 0x3a2a20, x - 6.35, 2.3, z, .2, 4.6, 9.2); ctx.cols.push([x - 6.5, x - 6.1, z - 4.6, z + 4.6]);
      signs.push(['TEA & DRUM CIRCLE', x + 5, 4.4, z - 5.4, 0, 6, 0xc88aff]);
      T(x + 2, z - 2.5, 2.4, () => tr('🫖 Tea & Drum Circle: order a pot of tea (herb teas; the “special” ones are only jokes here)', '🫖 Té y Tambores: pedir una tetera (tés de hierbas; los “especiales” aquí solo son bromas)'), () => AV.shop && AV.shop.open({ id: 'pai_tea', name: L('Tea & Drum Circle', 'Té y Tambores'), greet: L('A drummer with a grey beard pours you a cup: “Sit. Listen first. Then play.”', 'Un tamborilero de barba gris te sirve una taza: “Siéntate. Escucha primero. Luego toca.”'), items: [['pai_tea', 15]] })) }
    /* ---------- Sunset Bar on the north-west ridge ---------- */
    { const [x, z] = PL.sunset, y = H(x, z); B(wood, 0x8a6a44, x, y + .1, z, 22, .2, 16); for (let i = -10; i <= 10; i += 2) { B(wood, 0x6a4a30, x + i, y + .7, z - 8, .1, 1.2, .1); if (Math.abs(i) > 2) B(wood, 0x6a4a30, x + i, y + .7, z + 8, .1, 1.2, .1) } for (let i = -7; i <= 7; i += 2) { B(wood, 0x6a4a30, x - 11, y + .7, z + i, .1, 1.2, .1); B(wood, 0x6a4a30, x + 11, y + .7, z + i, .1, 1.2, .1) }
      B(wood, 0x6a4a30, x, y + 1.3, z - 8, 22, .08, .08); B(wood, 0x6a4a30, x - 11, y + 1.3, z, .08, .08, 16); B(wood, 0x6a4a30, x + 11, y + 1.3, z, .08, .08, 16); ctx.cols.push([x - 11.1, x + 11.1, z - 8.1, z - 7.9], [x - 11.1, x - 10.9, z - 8, z + 8], [x + 10.9, x + 11.1, z - 8, z + 8]);
      B(wood, 0x5a3a24, x + 6, y + .65, z + 3, 6, 1.1, .9); ctx.cols.push([x + 3, x + 9, z + 2.55, z + 3.45]); for (let k = 0; k < 6; k++) C(glow, AWN[k % 6], x + 3.5 + k, y + 1.3, z + 3.2, .08, .25);
      for (const [cx2, cz2] of [[-6, -4], [-2, -5], [2, -4], [-7, 2]]) { B(plaster, AWN[(cx2 + 20) % 6], x + cx2, y + .35, z + cz2, 1.6, .3, 1.6); ctx.circles.push([x + cx2, z + cz2, .9]) }
      roof.push([K.BG.box, 0x9a3ad8, K.M(x - 2, y + 4.2, z + 2, 12, .08, 9, .08, 0, 0)]); for (const [px, pz] of [[-8, -2], [4, -2], [-8, 6], [4, 6]]) { C(wood, 0x4a3020, x + px, y + 2.1, z + pz, .12, 4.2); ctx.circles.push([x + px, z + pz, .18]) }
      B(glow, 0xff9a3a, x - 2, y + 3.4, z + 6.4, .9, .9, .06); K.lanterns(ctx, [[x - 11, y + 3, z - 8], [x - 4, y + 3.6, z - 8], [x + 4, y + 3.6, z - 8], [x + 11, y + 3, z - 8]], { per: 8, sag: .4, cols: [0xff9a3a, 0xff4ad2, 0xffd84a, 0x9a5aff] });
      signs.push(['SUNSET BAR · techno / DJ', x, y + 5.2, z + 8.3, 0, 7, 0xff8a3a]);
      T(x + 6, z + 4.8, 2.2, () => tr('🍺 Sunset Bar', '🍺 Sunset Bar') + (eve() ? tr(' · DJ tonight', ' · DJ esta noche') : tr(' · chill daytime', ' · tarde tranquila')), () => AV.shop && AV.shop.open({ id: 'pai_sunset', name: L('Sunset Bar', 'Sunset Bar'), greet: eve() ? L('“Party’s on! The DJ booth is open — want to play?”', '“¡Hay fiesta! La cabina está abierta, ¿quieres pinchar?”') : L('“Chill time. Come back for sunset, then it’s techno.”', '“Hora tranquila. Vuelve al atardecer; luego toca techno.”'), items: [['beer', 20], ['water', 10], ['pineapple_shake', 18]] }));
      T(x, z - 6, 3, () => tr('🌄 Sunset view over the Pai valley', '🌄 Vista del atardecer sobre el valle de Pai'), () => { AV.toast(tr('Mountains in layers of blue, rice fields glowing, scooters crawling home. Vibe +5.', 'Montañas en capas de azul, arrozales brillando, motos volviendo a casa. Vibe +5.')); AV.vitals && AV.vitals.add(0, 5) }) }
    /* ---------- Paradise Circus (north-east) ---------- */
    const fireG = new THREE.Group(), fireBalls = [], trail = []; let fireL = null;
    { const [x, z] = PL.paradise, y = H(x, z); const sand = new THREE.Mesh(new THREE.CircleGeometry(5.2, 32), AV.std(0xd8b880, .95)); sand.rotation.x = -Math.PI / 2; sand.position.set(x, y + .04, z); grp.add(sand);
      for (let k = 0; k < 16; k++) { const a = k / 16 * TAU; C(glow, k % 2 ? 0xffd84a : 0xff4ad2, x + Math.cos(a) * 5.6, y + .2, z + Math.sin(a) * 5.6, .14, .4) }
      for (const [tx, tz, c] of [[-10, -5, 0x9a3ad8], [10, -5, 0xff4ad2], [0, -12, 0x3ac8c8]]) { roof.push([K.BG.cone, c, K.M(x + tx, y + 4, z + tz, 4.4, 3, 4.4)]); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; C(wood, 0x4a3020, x + tx + Math.cos(a) * 4, y + 1.3, z + tz + Math.sin(a) * 4, .1, 2.6); ctx.circles.push([x + tx + Math.cos(a) * 4, z + tz + Math.sin(a) * 4, .16]) } }
      B(wood, 0x5a3a24, x + 10, y + .6, z + 1, .8, 1.1, 4); ctx.cols.push([x + 9.6, x + 10.4, z - 1, z + 3]);
      K.lanterns(ctx, [[x - 12, y + 4, z + 4], [x - 4, y + 5.5, z - 2], [x + 4, y + 5.5, z - 2], [x + 12, y + 4, z + 4]], { per: 9, sag: .7 }); K.lanterns(ctx, [[x - 12, y + 3.6, z - 8], [x, y + 5, z - 14], [x + 12, y + 3.6, z - 8]], { per: 9, sag: .6 });
      signs.push(['PARADISE CIRCUS · fire shows', x, y + 5.6, z + 7.4, 0, 7, 0xff4ad2]);
      fireG.position.set(x, y, z); grp.add(fireG); const fm = new THREE.MeshBasicMaterial({ color: 0xffb050 }); for (let k = 0; k < 2; k++) { const b = new THREE.Mesh(AV.G.sph, fm); b.scale.setScalar(.17); fireG.add(b); fireBalls.push(b) }
      for (let k = 0; k < 40; k++) { const m = new THREE.Mesh(AV.G.sph, new THREE.MeshBasicMaterial({ color: 0xff7a20, transparent: true, opacity: .5, blending: THREE.AdditiveBlending, depthWrite: false })); m.scale.setScalar(.12); fireG.add(m); trail.push(m) }
      fireL = new THREE.PointLight(0xff7a2a, 0, 18); fireL.position.set(x, y + 2, z); grp.add(fireL);
      T(x, z + 6.5, 3, () => fireOn() ? tr('🔥 Paradise Circus: watch the fire show', '🔥 Paradise Circus: ver el espectáculo de fuego') : tr('Paradise Circus (fire show 20:00–01:00)', 'Paradise Circus (fuego de 20:00 a 01:00)'), () => { if (!fireOn()) return AV.toast(tr('The fire spinners are still sleeping. Come back after 20:00.', 'Los malabaristas de fuego aún duermen. Vuelve después de las 20:00.')); AV.toast(tr('Poi chains whirl into rings of fire. Keep behind the rope — the crowd cheers!', 'Las cadenas de poi giran en anillos de fuego. Detrás de la cuerda: ¡el público aplaude!')); AV.vitals && AV.vitals.add(0, 6) });
      T(x + 8.6, z + 1, 2, () => tr('🍹 Paradise bar', '🍹 Barra de Paradise'), () => AV.shop && AV.shop.open({ id: 'pai_paradise', name: L('Paradise bar', 'Barra de Paradise'), greet: L('“Welcome to the circus. Grab a drink, find a cushion.”', '“Bienvenido al circo. Coge algo de beber y busca un cojín.”'), items: [['beer', 20], ['pineapple_shake', 18]] })) }
    /* ---------- Pai River Jam hostel & campground ---------- */
    const bank = RIV.x - RIV.w / 2, tubs = [];
    { for (const [cx, cz] of [[62, -26], [70, -18], [62, -8], [70, 26], [62, 32], [70, 40]]) { for (const [px, pz] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) C(wood, 0x4a3020, cx + px, .5, cz + pz, .1, 1); B(wood, 0x8a6a44, cx, 1.05, cz, 4.6, .14, 4.6); B(wood, WOOD[Math.abs(cx + cz) % 5], cx, 2.25, cz - .2, 4, 2.4, 3.6); roof.push([PRISM, 0xb89a5a, K.M(cx, 3.45, cz - .2, 5, 1.5, 4.6, 0, 0, 0)]);
        B(glow, 0xffd890, cx, 2.2, cz + 1.62, 1, .7, .04); B(wood, 0x5a3a24, cx, .55, cz + 2.6, 1.2, .1, .8); ctx.cols.push([cx - 2.3, cx + 2.3, cz - 2.3, cz + 1.7]) }
      const dx = bank - 6; B(wood, 0x8a6a44, dx + 2, .25, 8, 10, .15, 9); for (const [px, pz] of [[-3, -4], [6.5, -4], [-3, 4], [6.5, 4]]) { C(wood, 0x4a3020, dx + 2 + px, 1.6, 8 + pz, .12, 3.2); ctx.circles.push([dx + 2 + px, 8 + pz, .16]) }
      roof.push([PRISM, 0x9a7a4a, K.M(dx + 2, 3.2, 8, 11, 1.7, 10, 0, Math.PI / 2, 0)]); B(wood, 0x5a3a24, dx - 1.5, .6, 8, .8, 1.1, 5); ctx.cols.push([dx - 1.9, dx - 1.1, 5.5, 10.5]);
      C(plaster, 0x5a5a5a, dx + 3, .2, 17, .9, .3); const fire = new THREE.PointLight(0xff8a3a, 1.2, 9); fire.position.set(dx + 3, 1, 17); grp.add(fire); ctx.circles.push([dx + 3, 17, 1]); B(glow, 0xff8a2a, dx + 3, .5, 17, .45, .45, .45);
      K.lanterns(ctx, [[dx - 3, 3, 3], [dx + 2, 3.4, 5], [dx + 7, 3, 3]], { per: 7, sag: .3 });
      signs.push(['PAI RIVER JAM · hostel & campground', 52, 3.8, 8, -Math.PI / 2, 7, 0x7aff8a]); signs.push(['If you drink before noon, you’re a pirate.', dx + 2, 2.6, 12.8, 0, 4.4, 0xffffff]);
      T(dx + .8, 8, 2.4, () => tr('🍻 River Jam bar (the pirate sign is a memory, not a verified quote)', '🍻 Bar del River Jam (el cartel pirata es un recuerdo, no una cita verificada)'), () => AV.shop && AV.shop.open({ id: 'pai_jam', name: L('Pai River Jam bar', 'Bar Pai River Jam'), greet: L('“Jam starts when someone picks up the guitar. Could be you.”', '“El jam empieza cuando alguien coge la guitarra. Podrías ser tú.”'), items: [['beer', 18], ['water', 8]] }));
      T(70, -13, 2.2, () => tr('Your riverside cabin: rest until morning', 'Tu cabaña junto al río: descansar hasta la mañana'), () => { AV.fadeTo(1, 600); setTimeout(() => { if (S.time >= 8 * 60) S.day++; S.time = 8 * 60; AV.hud(); AV.fadeTo(0, 900); AV.toast(tr('River sounds, roosters, mist on the mountains. Good morning, Pai.', 'Sonido del río, gallos, niebla en las montañas. Buenos días, Pai.')) }, 700) });
      for (let xx = bank - 1; xx <= RIV.x + RIV.w / 2 + 1; xx += .5) B(wood, 0xc8b070, xx, .12, BR.z, .14, .1, BR.w * 2.1); for (const sd of [-1, 1]) { B(wood, 0x9a8a50, RIV.x, .95, BR.z + sd * BR.w, RIV.w + 2, .07, .07); for (let xx = bank; xx <= RIV.x + RIV.w / 2; xx += 2) C(wood, 0x9a8a50, xx, .5, BR.z + sd * BR.w, .04, 1) }
      for (let k = 0; k < 3; k++) { const tub = new THREE.Mesh(new THREE.TorusGeometry(.6, .22, 8, 16), AV.std([0xff4ad2, 0x4ad8ff, 0xffd84a][k], .5)); tub.rotation.x = Math.PI / 2; tub.position.set(RIV.x - 2 + k * 2, -.4, 20 + k * 14); grp.add(tub); tubs.push(tub) }
      K.field(ctx, K.species.grass(0x6a9a3a), K.floraMat(.04), K.n(70), { x0: bank - 2, x1: bank + .5, z0: -60, z1: 80 }, { H, s0: 1.4, s1: 2.2, ok: (x, z) => Math.abs(z - BR.z) > 3 && Math.abs(z - 8) > 7 }) }
    /* ---------- bus & minivan station + road to Chiang Mai ---------- */
    { const [x, z] = PL.bus; B(plaster, 0x8a8478, x, .08, z, 12, .16, 8); for (const [px, pz] of [[-5, -3], [5, -3], [-5, 3], [5, 3]]) { C(wood, 0x5a5a5a, x + px, 1.6, z + pz, .1, 3.2); ctx.circles.push([x + px, z + pz, .15]) } roof.push([K.BG.box, 0x3a6a8a, K.M(x, 3.25, z, 12.4, .12, 8.4, .06, 0, 0)]);
      B(wood, 0x6a4a30, x, .45, z - 2.4, 6, .12, .6); B(plaster, 0xe8e8f0, x + 9, 1.1, z - 1, 2.2, 2, 5.6); B(glow, 0x9ad8ff, x + 7.85, 1.5, z - 1, .04, .7, 4.6); ctx.cols.push([x + 7.9, x + 10.1, z - 3.8, z + 1.8]);
      signs.push(['PAI BUS STATION · Chiang Mai minivans', x, 4.1, z + 4.3, 0, 7, 0x4ad8ff]);
      T(x - 2, z + 1, 2.8, () => tr('🚐 Minivan to Chiang Mai (40 credits · 762 curves, condensed)', '🚐 Minivan a Chiang Mai (40 créditos · 762 curvas, resumidas)'), () => { if (!AV.txn(-40, 'Minivan Pai → Chiang Mai')) return; AV.toast(tr('Mountains, mist, a driver who knows every curve. Three hours later: Chiang Mai.', 'Montañas, niebla, un conductor que conoce cada curva. Tres horas después: Chiang Mai.')); AV.travel('chiang_mai') }) }
    /* ---------- waterfall, hot springs + bamboo bridge, canyon, Yun Lai viewpoint, jungle trail, temple ---------- */
    T(PL.fall[0] + 11, PL.fall[1], 3.5, () => tr('💦 Waterfall: cool off and listen', '💦 Cascada: refrescarse y escuchar'), () => { AV.toast(tr('Cold spray, mossy rocks, a kingfisher flashes blue. Energy +5.', 'Rocío frío, rocas con musgo, un martín pescador destella azul. Energía +5.')); AV.vitals && AV.vitals.add(5, 2) });
    T(PL.springs[0] + 4.5, PL.springs[1] - 4, 3, () => tr('♨ Hot springs: soak for a while', '♨ Aguas termales: remojarse un rato'), () => { AV.fadeTo(.6, 400); setTimeout(() => { AV.fadeTo(0, 700); S.time += 40; AV.toast(tr('Warm mineral water, steam, birdsong. Your shoulders forget the minivan. Energy +10.', 'Agua mineral tibia, vapor, pájaros. Tus hombros olvidan la minivan. Energía +10.')); AV.vitals && AV.vitals.add(10, 4) }, 500) });
    { const bx = -60, bz = 58, by = H(bx, bz); for (let k = -4; k <= 4; k += .5) B(wood, 0xc8b070, bx + k, by + .25 + Math.cos(k / 4 * 1.2) * .3, bz, .12, .1, 2); for (const sd of [-1, 1]) for (let k = -4; k <= 4; k += 1.6) C(wood, 0x9a8a50, bx + k, by + .8, bz + sd, .04, 1.1);
      const cr = K.waterPlane(ctx, new THREE.PlaneGeometry(3, 60), by - .15, { deep: 0x2a6a6a, shallow: 0x7ac8b8, iri: .05 }); cr.position.set(bx, by - .15, bz); cr.rotation.z = Math.PI / 2; signs.push(['BAMBOO BRIDGE', bx, by + 2.4, bz - 1.6, 0, 3.4, 0xc8b070]) }
    signs.push(['HOT SPRINGS', PL.springs[0] + 6, H(PL.springs[0] + 6, PL.springs[1] - 7) + 2.6, PL.springs[1] - 7, 0, 3.6, 0xff8ad8]); signs.push(['WATERFALL', PL.fall[0] + 15, H(PL.fall[0] + 15, PL.fall[1] + 4) + 2.6, PL.fall[1] + 4, Math.PI / 2, 3.6, 0x7ff0ff]);
    { const cz = 172, x = cpx(cz) - 4, y = H(x + 4, cz); B(wood, 0x6a4a30, x + 4, y + .1, cz, 6, .2, 4); for (let k = -3; k <= 3; k += 1.5) B(wood, 0x6a4a30, x + 4 + k, y + .7, cz + 2, .08, 1.2, .08); B(wood, 0x6a4a30, x + 4, y + 1.3, cz + 2, 6, .08, .08); ctx.cols.push([x + 1, x + 7, cz + 1.9, cz + 2.1]);
      signs.push(['PAI CANYON · sunset viewpoint', x + 4, y + 2.6, cz - 3, Math.PI, 5, 0xffb04a]);
      T(x + 4, cz - 1, 3, () => tr('🏜 Pai Canyon viewpoint', '🏜 Mirador del Cañón de Pai'), () => { AV.toast(tr('Red ridges falling away into the forest, the sun going orange. Careful near the edges. Vibe +6.', 'Crestas rojas que caen hacia el bosque, el sol volviéndose naranja. Cuidado con los bordes. Vibe +6.')); AV.vitals && AV.vitals.add(0, 6) }) }
    { const [x, z] = PL.yunlai, y = H(x, z); B(wood, 0x6a4a30, x, y + .15, z, 8, .3, 6); signs.push(['YUN LAI VIEWPOINT', x, y + 2.6, z + 3.4, 0, 4.4, 0xffd84a]); T(x, z, 3, () => tr('⛰ Yun Lai viewpoint', '⛰ Mirador Yun Lai'), () => { AV.toast(tr('The whole valley below: Walking Street lights, the river, the canyon. Vibe +6.', 'Todo el valle abajo: las luces de Walking Street, el río, el cañón. Vibe +6.')); AV.vitals && AV.vitals.add(0, 6) }) }
    { const [x, z] = PL.jungle, y = H(x, z); C(wood, 0x5a4030, x - 3, y + 1.4, z + 2, .12, 2.8); B(glow, 0xff4ad2, x - 3, y + 2.8, z + 2, .1, .7, 2.6); signs.push(['JUNGLE RAVE · secret forest party →', x - 6, y + 3, z - 3, -Math.PI / 2, 5, 0xff4ad2]);
      T(x - 2, z, 3, () => tr('🌿 Jungle trail → Jungle Dub / Jungle Rave', '🌿 Sendero de la jungla → Jungle Dub / Jungle Rave'), () => { AV.toast(tr('The bass grows louder through the trees... the jungle opens onto Jungle Dub.', 'El bajo suena cada vez más entre los árboles... la jungla se abre a Jungle Dub.')); AV.travel('jungle_dub') }) }
    { const x = -46, z = -58, y = H(x, z); B(plaster, 0xf0e8d8, x, y + .4, z, 10, .8, 8); B(plaster, 0xe8b040, x, y + 2.8, z, 8, 4, 6); roof.push([PRISM, 0x9a2a1a, K.M(x, y + 4.8, z, 9.5, 2.6, 7.5, 0, 0, 0)]); C(glow, 0xffd84a, x, y + 7.8, z, .3, 1.6); ctx.cols.push([x - 5, x + 5, z - 4, z + 4]);
      signs.push(['WAT (TEMPLE) · please be quiet', x + 7, y + 2.2, z + 4, 0, 4, 0xffd84a]);
      T(x, z + 5.6, 3, () => tr('Temple: sit quietly for a moment', 'Templo: sentarse en silencio un momento'), () => { AV.toast(tr('Bells, birds, a monk sweeping leaves. Your breathing slows. Calm +1.', 'Campanas, pájaros, un monje barriendo hojas. Tu respiración se calma. Calma +1.')); AV.vitals && AV.vitals.add(0, 3) }) }
    /* ---------- signs + merged architecture (4 draw calls for all buildings) ---------- */
    signs.forEach(([t, x, y, z, ry, w, c]) => ctx.sign(t, x, y, z, ry, w, '#' + c.toString(16).padStart(6, '0'), {}));
    const gM = new THREE.MeshBasicMaterial({ vertexColors: true }); gM.userData.lin = 1;
    for (const [arr, m, sh, sc, sy] of [[wood, texMat(woodTex(), .8), true, 2.2], [roof, texMat(roofTex(), .55, .25), true, 1.6], [plaster, texMat(plasTex(), .92), true, 3, 3.4], [glow, gM, false]]) { if (!arr.length) continue; const geo = K.merge(arr); if (sc) worldUV(geo, sc, sy); const mesh = new THREE.Mesh(geo, m); mesh.castShadow = sh && q === 2; mesh.receiveShadow = true; grp.add(mesh) }
    /* ---------- vegetation: jungle wraps the valley; open paths, quiet canyon ---------- */
    const segD = (x, z, r) => { const dx = r[2] - r[0], dz = r[3] - r[1], t = Math.max(0, Math.min(1, ((x - r[0]) * dx + (z - r[1]) * dz) / (dx * dx + dz * dz))); return Math.hypot(x - r[0] - dx * t, z - r[1] - dz * t) };
    const clear = (x, z) => { if (Math.abs(x) < 16 && Math.abs(z) < 72) return false; if (Math.abs(x - RIV.x) < 9) return false; for (const k in PL) { const p = PL[k]; if (k !== 'canyon' && Math.hypot(x - p[0], z - p[1]) < 17) return false } if (x > 52 && x < RIV.x && Math.abs(z - 8) < 44) return false; if (x > 100 && x < 160 && z > -50 && z < 64) return false; if (ROUTES.some(r => segD(x, z, r) < r[4] / 2 + 1.6)) return false; return surf(x, z) !== null };
    const wild = (x, z) => clear(x, z) && !(z > 100 && Math.abs(x - 4) < 60);
    const jungleTree = (() => { const M = K.M, BG = K.BG, p = [[BG.cylL, 0x5a4030, M(0, 2.5, 0, .3, 5, .3)]]; [[0, 6, 0, 2.6], [1.4, 5.2, .6, 1.8], [-1.3, 5.4, -.4, 1.9], [.3, 7.2, -.5, 1.6]].forEach((b, i) => p.push([BG.ico, [0x2e6a2a, 0x3a7a2e, 0x2a5a26, 0x4a8a34][i], M(b[0], b[1], b[2], b[3], b[3] * .8, b[3])])); return K.merge(p) })();
    const field = (geo, mat, n, area, opt) => K.field(ctx, geo, mat, K.n(n), area, Object.assign({ H, ok: wild }, opt));
    field(jungleTree, K.floraMat(.04), 300, { x0: -200, x1: 200, z0: -190, z1: 200 }, { s0: .9, s1: 1.8, col: .35 });
    field(K.species.palm(0x8a6a44, 0x3a8a3a), K.floraMat(.06, { double: true }), 100, { x0: -170, x1: 190, z0: -160, z1: 130 }, { s0: 1.4, s1: 2.4, col: .25 });
    field(K.species.bamboo(0x7aa83a), K.floraMat(.05), 80, { x0: -170, x1: 190, z0: -160, z1: 130 }, { s0: .9, s1: 1.4, col: .4 });
    field(K.species.bush(0x3a8a3a, 0xff7ab8), K.floraMat(.03), 260, { x0: -190, x1: 200, z0: -180, z1: 190 }, { s0: .8, s1: 1.8 });
    field(K.species.fern(0x3aa04a), K.floraMat(.05, { double: true }), 320, { x0: -190, x1: 200, z0: -180, z1: 190 }, { s0: .8, s1: 1.6 });
    K.field(ctx, K.species.palm(0x8a6a44, 0x3a9a3a), K.floraMat(.06, { double: true }), K.n(22), { x0: -26, x1: 26, z0: -80, z1: 80 }, { H, s0: 1.3, s1: 2, ok: (x, z) => Math.abs(x) > 13 && Math.abs(x) < 20 && surf(x, z) !== null && !ROUTES.some(r => segD(x, z, r) < r[4] / 2 + 1.6) && Math.abs(z) < 64, col: .3 });
    K.field(ctx, K.species.flower(0xff6ad5, 0xffe040), K.floraMat(.02), K.n(140), { x0: -60, x1: 60, z0: -110, z1: 100 }, { H, s0: .8, s1: 1.4, ok: (x, z) => clear(x, z) });
    K.field(ctx, K.species.grass(0x9ac84a), K.floraMat(.03), K.n(280), { x0: 100, x1: 160, z0: -50, z1: 64 }, { H, s0: 1, s1: 1.6, ok: (x, z) => !(Math.abs(z - BR.z) < 4) });
    K.field(ctx, K.species.rock(0x8a8070), K.floraMat(0), K.n(50), { x0: -140, x1: -70, z0: -30, z1: 100 }, { H, s0: .8, s1: 2.2, ok: (x, z) => !inPool(x, z) && clear(x, z) });
    K.field(ctx, K.species.rock(0xa8582e), K.floraMat(0), K.n(30), { x0: -50, x1: 60, z0: 110, z1: 180 }, { H, s0: 1, s1: 2.6, ok: (x, z) => Math.abs(x - cpx(z)) > 5 && Math.abs(z - 172) > 6 });
    K.field(ctx, K.species.rock(0x8a8a7a), K.floraMat(0), K.n(70), { x0: RIV.x - 9, x1: RIV.x + 9, z0: -170, z1: 170 }, { H: (x, z) => Math.max(H(x, z), -.9), s0: .7, s1: 2.2, ok: (x, z) => Math.abs(z - BR.z) > 6 && !(x < RIV.x && Math.abs(z - 8) < 44) });
    for (let i = 0; i < 18; i++) { const a = i / 18 * TAU, R = 300 + (i % 3) * 40, m = new THREE.Mesh(K.BG.cone, AV.std([0x3a5a50, 0x4a6a5a, 0x2e4a44][i % 3], .95)); m.scale.set(90 + (i % 4) * 20, 70 + (i * 37 % 50), 80); m.position.set(Math.cos(a) * R, 20, Math.sin(a) * R); grp.add(m) }
    K.motes(ctx, { n: 120, x: 0, z: 0, r: 90, y0: .5, y1: 4, cols: [0xd8ff7a, 0xffe060], size: 3, night: true, H });
    /* ---------- people: browsing, eating, partying, hanging out ---------- */
    const nodes = [], edges = []; const addN = (x, z) => { nodes.push([x, z]); return nodes.length - 1 };
    let prv = null; for (let z = -66; z <= 66; z += 6) { const a = addN(-1.4, z), b = addN(1.4, z); edges.push([a, b]); if (prv) edges.push([prv[0], a], [prv[1], b]); prv = [a, b] }
    const link = (from, pts) => { let last = from; pts.forEach(p => { const k = addN(p[0], p[1]); edges.push([last, k]); last = k }) };
    const at = (x, z) => nodes.findIndex(p => p[0] === x && p[1] === z);
    link(at(-1.4, 12), [[-12, 13], [PL.tea[0] + 4, PL.tea[1] - 2]]); link(at(1.4, 0), [[20, 1], [44, 2], [bank - 8, BR.z - 3]]);   /* (walkers stay on the flat valley floor; the hills have their own seated / dancing crowds) */
    const NAV = CY.nav(nodes, edges), crowd = CY.crowd(ctx), V = ['man', 'woman', 'tourist', 'tourist', 'woman'];
    for (let i = 0; i < [18, 28, 38][q]; i++) { const n0 = nodes[(rng() * 46) | 0]; crowd.add({ v: V[i % 5], x: n0[0], z: n0[1], nav: NAV, idleProb: .08 }) }
    const nightWalk = []; for (let i = 0; i < [8, 12, 18][q]; i++) { const n0 = nodes[(rng() * 46) | 0]; nightWalk.push(crowd.add({ v: V[(i + 2) % 5], x: n0[0], z: n0[1], nav: NAV, idleProb: .5 })) }
    const put = (x, z, yaw, m, v) => crowd.add({ v: v || V[Math.abs(Math.round(x * 7 + z)) % 5], x, z, y: H(x, z), yaw, mode: m || 'sit' });
    for (const b of [rC, gC, blues]) for (let i = 0; i < 3; i++) put(b.cx + b.s * (i % 2 ? 1.1 : -1.1), b.zc - b.w / 4 + (i >> 1) * (b.w / 2.4) + .75, b.s > 0 ? Math.PI / 2 : -Math.PI / 2);
    [[-2, -2.6], [2.4, -1.4], [2.6, 1.8], [-1.6, 2.6], [-3, 0]].forEach(([dx, dz], i) => put(PL.tea[0] + dx, PL.tea[1] + dz, Math.atan2(-dx, -dz), i < 2 ? 'drum' : 'sit', i < 2 ? 'drummer' : null));
    [[64, 4, 'sit'], [65, 12, 'talk'], [bank - 3, 15, 'sit'], [bank - 5, 18, 'sit'], [bank - 1, 18, 'talk']].forEach(([x, z, m]) => put(x, z, rng() * TAU, m));
    const party = []; for (let k = 0; k < [10, 16, 22][q]; k++) { const [x, z] = PL.sunset, a = rng() * TAU, r = 1.5 + rng() * 5; party.push(put(x - 2 + Math.cos(a) * r, z - 1 + Math.sin(a) * r * .7, rng() * TAU, 'dance', ['dancer', 'tourist', 'woman', 'man'][k % 4])) }
    const nW = [10, 16, 24][q], watchers = []; for (let k = 0; k < nW; k++) { const [x, z] = PL.paradise, a = k / nW * TAU, r = 6.8 + (k % 2) * 1.2; watchers.push(put(x + Math.cos(a) * r, z + Math.sin(a) * r, Math.atan2(-Math.cos(a), -Math.sin(a)), k % 5 === 0 ? 'dance' : 'idle')) }
    const spinner = put(PL.paradise[0], PL.paradise[1] + .6, 0, 'dance', 'dancer');
    crowd.build();
    /* warm street lamps for the evening (a few real lights; the lanterns do the rest) */
    const lamps = [-48, -16, 16, 48].map(z => { const l = new THREE.PointLight(0xffb060, 0, 26); l.position.set(0, 4, z); grp.add(l); return l });
    if (AV.beings && AV.beings.spawn) { const keep = AV.beings.list; try { AV.beings.spawn(ctx, [{ kind: 'human', x: -2, y: 0, z: -40, yaw: 0, mode: 'idle', seed: 7201 }, { kind: 'human', x: 60, y: 0, z: 2, yaw: 1, mode: 'idle', seed: 7203 }, { kind: 'ape', x: 2, y: 0, z: 18, yaw: Math.PI, mode: 'idle', seed: 7202 }, { kind: 'human', x: PL.sunset[0] + 4, y: H(PL.sunset[0] + 4, PL.sunset[1] + 6), z: PL.sunset[1] + 6, yaw: 0, mode: 'idle', seed: 7204 }].slice(0, [1, 2, 4][q]).map(b => Object.assign(b, { lod: true })));   /* coarser sculpt: these are background talkers */   /* realistic talkers are ~200k triangles each: 1 on Low, 2 Medium, 4 High */ AV.beings.list = (keep || []).concat(AV.beings.list || []) } catch (e) { console.warn('pai beings', e) } }
    /* ---------- life by the hour ---------- */
    ctx.upd.push((dt, t) => { const ev = eve(), fo = fireOn();
      stallG.visible = ev; nightWalk.forEach(w => w.vis = ev); const nk = AV.nightK || 0; lamps.forEach(l => l.intensity = nk * 1.6); party.forEach((w, i) => w.vis = ev || i < 3); watchers.forEach((w, i) => w.vis = fo || i < 4); spinner.vis = fo;
      fireG.visible = fo; fireL.intensity = fo ? 2.4 + Math.sin(t * 17) * .7 : 0;
      if (fo) { fireBalls.forEach((b, k) => { const a = t * 5.2 + k * Math.PI; b.position.set(Math.cos(a) * 1.15, 1.5 + Math.sin(a) * 1.15, Math.sin(t * 1.3) * .3) }); trail.forEach((m, i) => { const k = i % 2, a = (t - (i >> 1) * .02) * 5.2 + k * Math.PI; m.position.set(Math.cos(a) * 1.15, 1.5 + Math.sin(a) * 1.15, Math.sin(t * 1.3) * .3); m.material.opacity = .5 * (1 - (i >> 1) / 20) }) }
      tubs.forEach((o, k) => { o.position.y = -.42 + Math.sin(t + k) * .05; o.position.z = -60 + ((t * 1.1 + k * 40) % 140) }) });
    /* ---------- sound: you hear where you are ---------- */
    const P = AV.P, near = (p, r) => Math.max(0, 1 - Math.hypot(P.x - p[0], P.z - p[1]) / r), townK = () => Math.max(0, 1 - Math.max(0, Math.abs(P.x) - 6) / 18) * Math.max(0, 1 - Math.max(0, Math.abs(P.z) - 62) / 18);
    const natureK = () => Math.max(.15, 1 - townK()), riverK = () => Math.max(Math.max(0, 1 - Math.abs(P.x - RIV.x) / 34), near(PL.fall, 45) * 1.2, near(PL.springs, 22) * .5);
    const A2 = AV.amb; let ok = false; const bpmT = (bpm, f) => (c, t, out) => { f(c, t, out); return t + 60 / bpm };
    const layers = {
      insects: { loop: { filters: [['bandpass', 5400, 1.4]], lfo: [7, .7] }, vol: .22, gain: () => natureK() * (night() ? 1 : .45) },
      river: { loop: { filters: [['lowpass', 800], ['highpass', 110]], lfo: [.2, .2] }, vol: .5, gain: riverK },
      chatter: { loop: { filters: [['bandpass', 900, .8]], lfo: [1.3, .7] }, vol: .35, gain: () => townK() * (eve() ? 1 : .55) },
      birds: { vol: .5, gain: () => natureK() * (night() ? .05 : 1), tick: (c, t, o) => { const f = 2200 + Math.random() * 2400; for (let i = 0; i < 2 + (Math.random() * 3 | 0); i++) A2.tone(c, o, t + i * .11, f * (1 + i * .06), .09, 'sine', .07, 1.25); return t + 1.4 + Math.random() * 3.5 } },
      frogs: { vol: .5, gain: () => (night() ? 1 : 0) * Math.max(riverK(), near(PL.springs, 30)), tick: (c, t, o) => { for (let i = 0; i < 3; i++) A2.tone(c, o, t + i * .09, 190 + Math.random() * 40, .06, 'square', .05, .8); return t + .6 + Math.random() * 1.6 } },
      dogs: { vol: .35, gain: () => .6, tick: (c, t, o) => { if (Math.random() < .5) { A2.tone(c, o, t, 420, .14, 'sawtooth', .05, .7); A2.tone(c, o, t + .22, 400, .16, 'sawtooth', .045, .7) } return t + 18 + Math.random() * 40 } },
      cafe: { vol: .5, gain: () => Math.max(near([rC.cx, rC.zc], 16), near([gC.cx, gC.zc], 16), near([blues.cx, blues.zc], 18) * (hour() >= 21 || hour() < 1 ? 1.4 : .6)), tick: bpmT(72, (c, t, o) => { const ch = [[57, 60, 64], [55, 59, 62], [53, 57, 60], [52, 55, 59]][(t / 3.33 | 0) % 4]; ch.forEach((m, i) => A2.tone(c, o, t + i * .03, 440 * Math.pow(2, (m - 57) / 12), 1.1, 'sine', .05)) }) },
      drums: { vol: .7, gain: () => near(PL.tea, 34) * (hour() >= 11 ? 1 : .2), tick: bpmT(192, (c, t, o) => { const s = (t * 3.2 | 0) % 8; if ([1, 0, 1, 1, 0, 1, 1, 0][s] || Math.random() < .15) A2.tone(c, o, t, s % 3 ? 300 : 200, .13, 'sine', .18, .8) }) },
      jam: { vol: .6, gain: () => near(PL.hostel, 42) * (hour() >= 10 ? 1 : .2), tick: bpmT(176, (c, t, o) => { const ch = [[55, 59, 62, 67], [50, 54, 57, 62], [52, 55, 59, 64], [48, 52, 55, 60]][(t / 2.73 | 0) % 4]; A2.tone(c, o, t, 440 * Math.pow(2, (ch[(t * 2.93 | 0) % 4] - 57) / 12), .5, 'triangle', .08) }) },
      techno: { vol: .8, gain: () => near(PL.sunset, 75) * (eve() ? 1 : 0), tick: bpmT(248, (c, t, o) => { if (!(Math.round(t * 248 / 60) % 2)) A2.tone(c, o, t, 140, .3, 'sine', .55, .3); else A2.hit(c, o, t, .05, .12, 7000) }) },
      paradise: { vol: .7, gain: () => near(PL.paradise, 60) * (fireOn() ? 1 : 0), tick: bpmT(200, (c, t, o) => { const s = Math.round(t * 200 / 60) % 4; if (s === 0 || s === 3) A2.tone(c, o, t, s ? 150 : 100, .25, 'sine', .3, .6); if (Math.random() < .3) A2.hit(c, o, t, .08, .06, 1500, 5000); if (Math.random() < .02) A2.hit(c, o, t, 1.4, .1, 400, 3000) }) }
    };
    const startAmb = () => { if (!ok && A2 && AV.audio && AV.audio.ok) ok = A2.start(layers) }; startAmb(); ctx.upd.push(() => { if (!ok) startAmb() });
    ctx.leave.push(() => { A2 && A2.stop(); ok = false });
    if (AV.media) { AV.media.ducks = (AV.media.ducks || []).filter(f => !f._pai); const d = () => AV.W && AV.W.id === 'pai' && A2 && A2.on ? Math.max(A2.lv.techno || 0, A2.lv.paradise || 0, (A2.lv.jam || 0) * .8, (A2.lv.drums || 0) * .7, (A2.lv.cafe || 0) * .6) * 1.2 : 0; d._pai = 1; AV.media.ducks.push(d) }
    AV.paiDebug = { H, PL, RIV, BR, built, surf };
    return { name: 'Pai', surface: surf, fog: [70, 380], sky: { dome: { s1: 0xffc8a0, s2: 0x8ac0e8, swirl: .05, cloud: .55, glow: .55 } },
      arrivals: { default: { x: PL.bus[0] - 2, z: PL.bus[1] + 6, yaw: Math.PI }, pipe: { x: 0, z: -60, yaw: Math.PI }, ape_gate: { x: 0, z: -60, yaw: Math.PI }, bungalow: { x: 70, z: -12, yaw: 0 } }, defaultArrival: 'default',
      mapRoads: [[0, -68, 0, 68, 7]].concat(ROUTES),
      places: [{ id: 'walking', name: L('Pai Walking Street', 'Walking Street de Pai'), x: 0, z: 0, yaw: Math.PI }, { id: 'rainny', name: L('Rainny Café', 'Rainny Café'), x: -2, z: -45, yaw: Math.PI / 2 }, { id: 'ganita', name: L('Ganita Café', 'Ganita Café'), x: -2, z: -26, yaw: Math.PI / 2 }, { id: 'tea', name: L('Tea & Drum Circle', 'Té y Tambores'), x: PL.tea[0] + 6, z: PL.tea[1], yaw: Math.PI / 2 },
        { id: 'sunset', name: L('Sunset Bar', 'Sunset Bar'), x: PL.sunset[0] + 6, z: PL.sunset[1] + 10, yaw: 0 }, { id: 'paradise', name: L('Paradise Circus', 'Paradise Circus'), x: PL.paradise[0], z: PL.paradise[1] + 9, yaw: 0 }, { id: 'jam', name: L('Pai River Jam hostel', 'Hostal Pai River Jam'), x: 60, z: 2, yaw: 0 },
        { id: 'fall', name: L('Waterfall', 'Cascada'), x: PL.fall[0] + 14, z: PL.fall[1], yaw: Math.PI / 2 }, { id: 'springs', name: L('Hot springs', 'Aguas termales'), x: PL.springs[0] + 6, z: PL.springs[1] - 8, yaw: 0 }, { id: 'canyon', name: L('Pai Canyon', 'Cañón de Pai'), x: PL.canyon[0] + 4, z: 160, yaw: Math.PI },
        { id: 'yunlai', name: L('Yun Lai viewpoint', 'Mirador Yun Lai'), x: PL.yunlai[0], z: PL.yunlai[1] + 4, yaw: 0 }, { id: 'bus', name: L('Bus & minivan station', 'Estación de autobuses'), x: PL.bus[0] - 2, z: PL.bus[1] + 6, yaw: 0 }, { id: 'trail', name: L('Jungle trail to Jungle Rave', 'Sendero a Jungle Rave'), x: PL.jungle[0] - 4, z: PL.jungle[1], yaw: 0 }, { id: 'temple', name: L('Temple', 'Templo'), x: -46, z: -50, yaw: Math.PI }],
      musicProfile: { bpm: 84, root: 50, scale: [0, 2, 4, 7, 9], style: 'amb' } };
  }
});
/* venues from the shared systems: DJ at Sunset Bar, hand drums + ukulele jams, scooter rental */
addEventListener('load', () => { const P = AV.act && AV.act.PLACES; if (!P) return; P.pai = (P.pai || []).filter(p => !p._pai).concat([{ type: 'djbooth', x: PL.sunset[0] - 4, z: PL.sunset[1] + 3, ry: Math.PI, name: ['Sunset Bar', 'Sunset Bar'], col: 0xff8a3a }, { type: 'instspot', kind: 'bongo', x: PL.tea[0] - 2, z: PL.tea[1] + 3.5, name: ['Tea & Drum Circle', 'Té y Tambores'] }, { type: 'instspot', kind: 'uke', x: 64, z: 15, name: ['Pai River Jam', 'Pai River Jam'] }, { type: 'rental', id: 'pai_scoot', kind: 'scooter', x: PL.rental[0] + 3, z: PL.rental[1] - 6, ry: 0, price: 35, name: ['Scooter rental', 'Alquiler de motos'], col: 0x3ad06a, cols: [0xe8e4da, 0x3ad06a, 0x2a2a2a] }].map(p => Object.assign(p, { _pai: 1 }))) });
/* Chiang Mai gets the other end of the minivan: a stop next to Giant Hostel */
const prevE = AV.onWorldEnter; AV.onWorldEnter = function (W) { if (prevE) prevE(W); if (W.id !== 'chiang_mai') return; const sp = AV.safeSpot(W, 4, 44);
  W.T.push({ x: sp[0], z: sp[1], r: 2.4, label: () => tr('🚐 Minivan to Pai (40 credits · mountain road)', '🚐 Minivan a Pai (40 créditos · carretera de montaña)'), fn: () => { if (!AV.txn(-40, 'Minivan Chiang Mai → Pai')) return; AV.toast(tr('762 curves later, the valley opens: Pai.', '762 curvas después se abre el valle: Pai.')); AV.travel('pai') } }) };
})(window.AV);
