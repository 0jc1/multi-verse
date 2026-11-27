/* APEVERSE 2.2 NEW WORLDS - barcelona_barceloneta.js : BARCELONA district 3 = LA BARCELONETA + the beach.
   Joined on foot: the east edge street runs into it; the Born's lane, a north street and the port road + promenade continue into it;
   the beach is one long boardwalk from the north street round to the port.  And by metro (Barceloneta station on the Passeig).
   Inside: six long narrow blocks of four-storey houses ("quarts de casa") with laundry strung across five lanes, two cross streets,
   Passeig Marítim (palms), the sand (parasols, loungers, two xiringuitos, a volleyball net, a lifeguard tower) and the sea.
   Businesses (fictional): Bodega La Ona (walk-in: bombes, sardines), Bar Vermut La Platja, Surf Ape (board rental), Can Simi del Mar.
   Residents: Txell (surf instructor), Ramon (fisherman).  Plugs into world_barcelona.js (BCN.btSurf, BCN.barceloneta) and
   barcelona_life.js (BCN.barcLife). */
'use strict';
(function (AV) {
const BCN = AV.barcelona; if (!BCN) return;
const PI = Math.PI, TAU = PI * 2, tr = AV.tr, L = (e, s) => [e, s], say = a => tr(a[0], a[1]);
BCN.btSurf = (x, z) => { if (x <= 197) return undefined; if (x > 370) return null; if (x <= 300 && z >= 138 && z <= 372) return 0; if (x > 300 && z >= 110 && z <= 420) return 0; if (x >= 200 && x <= 300 && z > 372 && z <= 420) return 0; return null };
const SG = { r: {} }, NW = () => AV.nwkit, SANS = 'Arial, sans-serif', SERIF = 'Georgia, "Times New Roman", serif';
const rot = (top, sub, bg, fg, o) => (g, w, h) => { o = o || {}; g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = fg; g.lineWidth = 3; g.strokeRect(14, 14, w - 28, h - 28); g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; NW().fit(g, top, w - 70, h * .46, (o.font || '700 #px ') + (o.serif ? SERIF : SANS), sub ? h * .42 : h * .52, w / 2); if (sub) { g.fillStyle = o.subc || fg; NW().fit(g, sub, w - 90, h * .16, '600 #px ' + SANS, h * .78, w / 2) } };
const SIGNS = [['btbodega', 448, 112, rot('Bodega La Ona', 'bombes · sardines · vermut', '#1a3a5a', '#f4e0b0', { serif: true })], ['btvermut', 448, 112, rot('Bar Vermut La Platja', 'vermut · olives · patates', '#c8281e', '#f4f0e0')],
  ['btsurf', 448, 112, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#2ab0d8'); gr.addColorStop(1, '#2ad8a8'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; NW().fit(g, 'SURF APE', w - 60, 56, '900 #px Arial Black, Arial, sans-serif', 50, w / 2); NW().fit(g, 'taules · classes · lloguer', w - 90, 18, '700 #px ' + SANS, 92, w / 2) }],
  ['btpeix', 640, 128, rot('Can Simi del Mar', 'peix fresc · arròs · terrassa', '#f4f0e0', '#1a4a6a', { serif: true })], ['xiringuito', 448, 112, rot('Xiringuito Simi', 'mojitos · sucs · gelats', '#f2c230', '#1a1a1a')]];

BCN.barceloneta = function (ctx, E) {
  const K = AV.kit, BG = K.BG, rng = ctx.rng, grp = ctx.group, cols = ctx.cols, circ = ctx.circles, { row, blk, box, P, Gl, Gs, sh, SPECIAL, ITF, bx2, IN, palm, metroE, road, pave } = E;
  const Q2 = [], sign2 = (k, x, y, z, w, h, ry, dbl) => { Q2.push({ k, x, y, z, w, h, ry }); if (dbl) Q2.push({ k, x: x - Math.sin(ry) * .03, y, z: z - Math.cos(ry) * .03, w, h, ry: ry + PI }) };
  /* ground, sand, sea */
  { const g = new THREE.PlaneGeometry(103, 234); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 103 / 2, uv.getY(i) * 234 / 2); g.rotateX(-PI / 2); const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: pave, roughness: .9 })); m.position.set(248.5, -.01, 255); m.receiveShadow = true; m.material.userData.lin = 1; grp.add(m) }
  const SAND = 0xd2bc8e; box(P, SAND, 300, 370, -.01, .03, 110, 420); box(P, SAND, 200, 300, -.01, .03, 372, 420); for (let z = 112; z < 420; z += 6) Gl.push([BG.box, 0xf4f8ff, K.M(368.6 + Math.sin(z) * .4, .05, z + 3, 1.4, .04, 5.6), 0]); for (let x = 202; x < 368; x += 6) Gl.push([BG.box, 0xf4f8ff, K.M(x + 3, .05, 418.6 + Math.sin(x) * .4, 5.6, .04, 1.4), 0]);
  { const wm = K.water({ deep: 0x1a5a7a, shallow: 0x3a8aa8, sky: 0xb8d0e0, opacity: .94, iri: .04 }); const w = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), wm); w.rotation.x = -PI / 2; w.position.set(820, BCN.WY, -60); w.renderOrder = 1; grp.add(w) }
  /* streets: the port road + promenade continue, lanes, cross streets, the Passeig Marítim */
  road(197, 300, 342.5, 351.5); box(P, 0xc8c0ac, 197, 300, 0, .02, 354, 372);
  for (const x of [195, 213, 231, 249, 267]) box(P, 0x948a7a, x, x + 6, 0, .018, 158, 340); for (const [z0, z1] of [[150, 158], [236, 244], [290, 296]]) box(P, 0x948a7a, 183, 300, 0, .018, z0, z1); box(P, 0xd8d0c0, 285, 300, 0, .02, 150, 342.5);
  for (let z = 162; z < 340; z += 14) { if (Math.abs(z - 226) < 6 || Math.abs(z - 240) < 6 || Math.abs(z - 293) < 6) continue; palm(292.5, z, 10) }
  /* the narrow blocks */
  for (const s of [['btbodega', 'bt20E', 200, 7, 5], ['btvermut', 'bt50E', 200, 8], ['btsurf', 'bt51E', 267, 8], ['btpeix', 'bt52E', 318, 10]]) SPECIAL.push(s);
  const BX = [[183, 195], [201, 213], [219, 231], [237, 249], [255, 267], [273, 285]], BZ = [[158, 236], [244, 290], [296, 340]], BO = { sides: 'WE', pri: 'WE', d: 6, h0: 12, hr: 3, wmin: 5, wmax: 7, shopP: .55, modP: .05 };
  for (let i = 0; i < 6; i++) for (let s = 0; s < 3; s++) blk('bt' + i + s, BX[i][0], BX[i][1], BZ[s][0], BZ[s][1], BO);
  row('btN', 'x', 150, 197, 285, 1, 12, { wmin: 7, wmax: 10, h0: 13, hr: 3, shopP: .4 });
  /* laundry across the lanes */
  const CL = [0xf4f4f0, 0xd84a6a, 0x2a7ad8, 0xf2c230, 0x3aa85a, 0xff8a3a];
  for (const x of [198, 216, 234, 252, 270]) for (let z = 164; z < 338; z += 17) { if (Math.abs(z - 240) < 7 || Math.abs(z - 293) < 7) continue; const y = 6.5 + (z % 3); box(P, 0x4a4a4a, x - 3, x + 3, y, y + .03, z - .02, z + .02); for (let k = 0; k < 3; k++) { const cx = x - 2 + k * 1.8 + (rng() - .5) * .4; P.push([BG.box, CL[(k + z) % CL.length], K.M(cx, y - .45, z, .8, .9, .04), 0]) } }
  /* the beach: parasols + loungers, two xiringuitos, the volleyball net, the lifeguard tower */
  const PAR = [[0xc8281e, 0xf4f0e0], [0x2a7ad8, 0xf4f0e0], [0xf2c230, 0x2a7ad8]], LOUNGE = [];
  for (const x of [318, 334, 350]) for (let z = 170; z < 412; z += 22) { if (Math.abs(z - 196) < 10 || Math.abs(z - 318) < 10 || (x === 334 && Math.abs(z - 260) < 12) || (x === 350 && Math.abs(z - 300) < 8)) continue; const c = PAR[((x + z) / 2 | 0) % 3]; box(P, 0xe8e8e4, x - .05, x + .05, 0, 2.4, z - .05, z + .05); P.push([BG.cone, c[0], K.M(x, 2.6, z, 1.6, .6, 1.6), 0]); box(P, c[1], x + .6, x + 2.4, .25, .35, z - .4, z + .4); circ.push([x, z, .2]); LOUNGE.push([x + 1.5, z]) }
  const XR = []; for (const z of [196, 318]) { const x = 322; box(P, 0x8a6a4a, x - 3, x + 3, 0, 3, z - 2, z + 2); box(P, 0xf2c230, x - 3.6, x + 3.6, 3, 3.2, z - 2.6, z + 2.6); box(P, 0xf4f0e0, x - 3.2, x - 3, .9, 1.1, z - 1.8, z + 1.8); cols.push([x - 3, x + 3, z - 2, z + 2]); sign2('xiringuito', x - 3.05, 2.4, z, 4, 1, -PI / 2); XR.push([x - 4.6, z]) }
  for (const z of [255, 265]) { box(P, 0xe8e8e4, 339.9, 340.1, 0, 2.5, z - .1, z + .1); circ.push([340, z, .2]) } box(P, 0xf4f4f0, 339.97, 340.03, 1.6, 2.5, 255, 265);
  { const x = 352, z = 300; for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(P, 0xe8e8e4, x + dx - .1, x + dx + .1, 0, 3, z + dz - .1, z + dz + .1); box(P, 0xd84a2a, x - 1.3, x + 1.3, 3, 4.4, z - 1.3, z + 1.3); cols.push([x - 1.2, x + 1.2, z - 1.2, z + 1.2]) }
  /* scenery: the sail-shaped hotel at the south tip */
  { const m = new THREE.Mesh(K.merge([[BG.box, 0x8aa8c8, K.M(470, 50, 520, 34, 100, 10, 0, -.5, 0)], [BG.cone, 0x8aa8c8, K.M(470, 104, 520, 8, 10, 3, 0, -.5, 0)]]), K.floraMat(0, { rough: .3 })); m.material.userData.lin = 1; m.name = 'bt_sail'; grp.add(m) }
  /* metro: Barceloneta (on the Passeig) */
  metroE(292.5, 226, 0); BCN.metro.barceloneta = [292.5, 228];
  /* the walk-in */
  IN.btbodega = ITF('btbodega', it => { bx2(P, 0x3a2a1a, it, 1.1, 1.7, 0, 1.05, .8, 3); for (let k = 0; k < 6; k++) bx2(P, 0x6a3a1a, it, it.depth - .4, it.depth - .25, .9 + (k >> 1) * .5, 1.3 + (k >> 1) * .5, -2.4 + (k & 1) * 2, -1.6 + (k & 1) * 2); it.cust = it.F(2.2, 1.9); it.staff = it.F(.6, 1.9) });
  for (const k of ['btbodega', 'btvermut', 'btsurf', 'btpeix']) { const s = sh[k]; if (!s) continue; s.ownSign = true; const d = SIGNS.find(x => x[0] === k), w = Math.min(s.w - .6, 9); sign2(k, s.x + s.out[0] * .06, 4.1, s.z + s.out[1] * .06, w, w * d[2] / d[1], s.yaw) }
  NW().makeAtlas(SIGNS, SG, 1024, 512); const sm = new THREE.MeshStandardMaterial({ map: SG.tex, emissiveMap: SG.tex, emissive: 0xffffff, emissiveIntensity: .3, roughness: .6, alphaTest: .3 }); sm.userData.lin = 1; const sMesh = new THREE.Mesh(NW().quadGeo(Q2, SG.r), sm); sMesh.name = 'bt_signs'; grp.add(sMesh);
  ctx.upd.push(() => { const h = (AV.S.time / 60) % 24, n = h > 20.5 || h < 6 ? 1 : h > 19 ? (h - 19) / 1.5 : h < 7.5 ? (7.5 - h) / 1.5 : 0; sm.emissiveIntensity = .3 + .8 * n; sMesh.visible = AV.P.x > 60 && AV.P.z > 60 });
  BCN.btStats = { signs: Q2.length, atlasOver: (SG.over || []).length, shops: ['btbodega', 'btvermut', 'btsurf', 'btpeix'].filter(k => sh[k]).length };
  /* map + walking lines */
  const roads = [[197, 347, 300, 347, 9], [183, 154, 300, 154, 6], [183, 240, 300, 240, 6], [183, 293, 300, 293, 5], [292.5, 150, 292.5, 342, 10]]; for (const x of [198, 216, 234, 252, 270]) roads.push([x, 158, x, 340, 4]);
  const places = [['barceloneta', 'La Barceloneta', 'La Barceloneta', 234, 240, PI / 2], ['maritim', 'Passeig Marítim', 'Paseo Marítimo', 292.5, 270, PI], ['platja', 'The beach (platja)', 'La playa', 335, 280, -PI / 2], ['xiringuito', 'Xiringuito Simi', 'Xiringuito Simi', 317, 196, -PI / 2]];
  const NM = { btbodega: 'Bodega La Ona', btvermut: 'Bar Vermut La Platja', btsurf: 'Surf Ape', btpeix: 'Can Simi del Mar' }; for (const k in NM) { const s = sh[k]; if (s) places.push([k, NM[k], NM[k], s.x + s.out[0] * 3, s.z + s.out[1] * 3, Math.atan2(s.out[0], s.out[1]) + PI]) }
  const lines = []; for (const x of [198, 216, 234, 252, 270]) lines.push([[x, 154], [x, 341.5]]);
  lines.push([[288, 154], [288, 341.5]], [[297, 154], [297, 341.5]], [[180.5, 154], [305, 154]], [[180.5, 240], [305, 240]], [[180.5, 293], [305, 293]], [[194, 341.5], [297, 341.5]], [[194, 365], [305, 365]], [[305, 154], [305, 380], [205, 380], [205, 365]]);
  return { roads, places, lines, LOUNGE, XR, stn: { barceloneta: L('Barceloneta', 'Barceloneta') } };
};

/* ======================= life ======================= */
const I = (id, o) => { if (!AV.ITEMS[id]) AV.ITEMS[id] = o };
I('es_bomba', { n: L('Bomba (with two sauces)', 'Bomba (con dos salsas)'), cat: 'food', ic: '💣', use: 'eat', model: 'bowl', col: 0xc8702a, price: 4, say: L('A potato-and-meat croquette the size of a fist. Spicy sauce on top. Boom.', 'Una croqueta de patata y carne del tamaño de un puño. Salsa picante encima. Bum.') });
I('es_sardines', { n: L('Grilled sardines', 'Sardinas a la plancha'), cat: 'food', ic: '🐟', use: 'eat', model: 'bowl', col: 0x8aa8b8, price: 6, say: L('Six of them, salt, lemon, eaten with your fingers.', 'Seis, con sal y limón, comidas con los dedos.') });
I('es_mojito', { n: L('Mojito', 'Mojito'), cat: 'drink', ic: '🍹', use: 'drink', fx: { type: 'drink', amt: .3 }, model: 'cup', col: 0xb8e08a, price: 6, say: L('Mint, lime, ice, sand between your toes.', 'Menta, lima, hielo, arena entre los dedos.') });

BCN.barcLife = function (ctx, E) {
  const S = AV.S, T = E.T, st = E.st, crowd = E.crowd, IN = E.IN, staff = E.staff, front = E.front, rng = ctx.rng, BT = BCN.BT;
  const hour = () => (S.time / 60) % 24, day = () => hour() >= 8 && hour() < 20.5, bs = () => { const s = st(); s.bt = s.bt || { met: {}, q: {} }; return s.bt };
  const counterAt = (pt, V2, label, show) => { if (!pt) return null; Object.assign(V2, { x: pt[0], z: pt[1], reach: 5 }); return T(pt[0], pt[1], 2, () => tr(label[0], label[1]), () => AV.shop.open(V2), show || null, 'shop') };
  if (IN.btbodega) staff(IN.btbodega.staff, 'man', 0x1a3a5a);
  /* sunbathers by day, xiringuito staff */
  const V = ['woman', 'man', 'tourist', 'backpacker'], sun = []; for (const [x, z] of BT.LOUNGE.slice(0, [8, 12, 16][ctx.q])) { const w = crowd.add({ v: V[(z | 0) & 3], x, z, mode: 'sit', yaw: -PI / 2, cols: { skin: [0xf0c8a8, 0xd8a47a, 0x8a5a3a][(x | 0) % 3], hair: 0x3a2a1a, shirt: [0xd84a6a, 0x2a7ad8, 0xf2c230, 0xf4f4f0][(z | 0) & 3], pants: 0x2a3a5a } }); w.y = .3; w.vis = false; sun.push(w) }
  for (const [x, z] of BT.XR) staff([x + 2.4, z], 'man', 0xf2c230, 0x2a3a5a);
  ctx.upd.push(() => { const d = day(); sun.forEach(w => w.vis = d) });
  /* residents: Txell (surf instructor), Ramon (fisherman) */
  const PEOPLE = { txell: { n: 'Txell', role: L('surf instructor', 'instructora de surf'), v: 'woman', cols: { skin: 0xd8a47a, hair: 0xd8b060, shirt: 0x2ab0d8, pants: 0x1a1a1a }, sched: [[8, [330, 240]], [14, front('btsurf', 2)], [20, front('btvermut', 2)]] },
    ramon: { n: 'Ramon', role: L('fisherman', 'pescador'), v: 'man', cols: { skin: 0xc8946a, hair: 0xb8b8b8, shirt: 0x1a3a5a, pants: 0x3a3a3a }, sched: [[6, [250, 368]], [12, front('btpeix', 2)], [19, front('btbodega', 2)]] } };
  const named = {}, slotOf = p => { const h = hour(); let s = null; for (const e of p.sched) if (e[0] <= h && (!s || e[0] > s[0])) s = e; if (!s) s = p.sched.reduce((a, e) => e[0] > a[0] ? e : a); return s };
  for (const [id, p] of Object.entries(PEOPLE)) { const s0 = slotOf(p), at = s0[1] || [292.5, 270]; const w = crowd.add({ v: p.v, x: at[0], z: at[1], mode: 'idle', cols: p.cols }); named[id] = { p, w, slot: s0 }; named[id].t = T(w.x, w.z, 2, () => tr('Talk to ', 'Hablar con ') + p.n + ' (' + say(p.role) + ')', () => talk(id)) }
  ctx.upd.push(() => { for (const id in named) { const o = named[id], s = slotOf(o.p); if (s !== o.slot && s[1]) { o.slot = s; o.w.x = s[1][0]; o.w.z = s[1][1] } o.t.x = o.w.x; o.t.z = o.w.z } });
  /* shops */
  counterAt(IN.btbodega && IN.btbodega.cust, { id: 'bcn_btbodega', name: L('Bodega La Ona', 'Bodega La Ona'), greet: L('“A bomba, the hot sauce on top? Sardines are from this morning.”', '“¿Una bomba con la salsa picante? Las sardinas son de esta mañana.”'), items: [['es_bomba', 4], ['es_sardines', 6], ['es_vermut', 4], ['es_cava', 5]] }, L('💣 Bodega La Ona: bombes (walk-in)', '💣 Bodega La Ona: bombas (entra)'));
  counterAt(front('btvermut', 1.4), { id: 'bcn_btvermut', name: L('Bar Vermut La Platja', 'Bar Vermut La Platja'), greet: L('“Vermut, olives, crisps — and the sea at the end of the street.”', '“Vermú, aceitunas, patatas… y el mar al final de la calle.”'), items: [['es_vermut', 4], ['es_olives', 2], ['es_conserves', 5]].filter(([i]) => AV.ITEMS[i]) }, L('🍷 Bar Vermut La Platja', '🍷 Bar Vermut La Platja'));
  counterAt(front('btpeix', 1.4), { id: 'bcn_btpeix', name: L('Can Simi del Mar', 'Can Simi del Mar'), greet: L('“Fish from Ramon’s boat, rice for two — or for one, we don’t judge.”', '“Pescado de la barca de Ramon, arroz para dos… o para uno, no juzgamos.”'), items: [['es_paella', 14], ['es_sardines', 6], ['es_cava', 5]] }, L('🐟 Can Simi del Mar (seafood)', '🐟 Can Simi del Mar (marisquería)'));
  for (const [x, z] of BT.XR) counterAt([x, z], { id: 'bcn_xir' + z, name: L('Xiringuito Simi', 'Xiringuito Simi'), greet: L('“Mojito? Juice? Ice cream before it melts?”', '“¿Mojito? ¿Zumo? ¿Helado antes de que se derrita?”'), items: [['es_mojito', 6], ['es_suc', 2], ['es_gelat', 4], ['water', 1]] }, L('🍹 Xiringuito Simi (beach bar)', '🍹 Xiringuito Simi (chiringuito)'));
  /* surf: rent a board at Surf Ape, then surf from the shore */
  const surfing = () => (bs().surf || 0) > AV.abs();
  { const p2 = front('btsurf', 1.4); if (p2) T(p2[0], p2[1], 2, () => surfing() ? tr('🏄 Surf Ape: your board is rented (go to the shore)', '🏄 Surf Ape: tu tabla está alquilada (ve a la orilla)') : tr('🏄 Surf Ape: rent a board for 3 hours (8)', '🏄 Surf Ape: alquilar una tabla 3 horas (8)'), () => { if (surfing()) return AV.toast(tr('“The waves are at the end of the beach. Go!”', '“Las olas están al final de la playa. ¡Ve!”')); if (!AV.txn(-8, 'Surfboard')) return; bs().surf = AV.abs() + 180; AV.toast(tr('🏄 A soft-top board under your arm. Txell: “Paddle, pop up, smile.”', '🏄 Una tabla blanda bajo el brazo. Txell: “Rema, levántate, sonríe.”')) }, null, 'shop') }
  T(364, 250, 2.6, () => surfing() ? tr('🏄 Surf the waves', '🏄 Surfear las olas') : tr('🌊 Swim in the sea', '🌊 Nadar en el mar'), () => { const s = bs(); AV.fadeTo(1, 300); setTimeout(() => { S.time = (S.time + 30) % 1440; if (surfing()) { s.surfed = (s.surfed || 0) + 1; AV.vitals && AV.vitals.add(-8, 18); AV.toast(tr('🏄 Six falls, one wave, three glorious seconds standing. Worth it.', '🏄 Seis caídas, una ola, tres gloriosos segundos de pie. Merece la pena.')) } else { s.swim = (s.swim || 0) + 1; AV.vitals && AV.vitals.add(4, 10); AV.toast(tr('🌊 Cold for ten seconds, perfect after. The city looks small from out here.', '🌊 Fría diez segundos, perfecta después. La ciudad se ve pequeña desde aquí.')) } AV.fadeTo(0, 500) }, 350) }, null, 'game');
  T(364, 350, 2.6, () => tr('🌊 Swim in the sea', '🌊 Nadar en el mar'), () => { const s = bs(); s.swim = (s.swim || 0) + 1; AV.vitals && AV.vitals.add(4, 10); AV.toast(tr('🌊 You float on your back and listen to the beach.', '🌊 Flotas boca arriba y escuchas la playa.')) }, null, 'game');
  { const [x, z] = BT.LOUNGE[0] || [319.5, 170]; T(x + 1, z, 1.8, () => tr('🏖️ Rent a sun lounger for an hour (2)', '🏖️ Alquilar una tumbona una hora (2)'), () => { if (!AV.txn(-2, 'Sun lounger')) return; AV.fadeTo(1, 300); setTimeout(() => { S.time = (S.time + 60) % 1440; bs().lounge = (bs().lounge || 0) + 1; AV.vitals && AV.vitals.add(10, 4); AV.fadeTo(0, 500); AV.toast(tr('🏖️ An hour of sun, a sea breeze, someone selling cold beer. You nap a little.', '🏖️ Una hora de sol, brisa de mar, alguien vendiendo cerveza fría. Echas una cabezadita.')) }, 350) }, () => day(), 'look') }
  T(336, 260, 2.4, () => tr('🏐 Join a game of beach volleyball', '🏐 Unirse a un partido de vóley playa'), () => { const s = bs(); s.volley = (s.volley || 0) + 1; AV.vitals && AV.vitals.add(-8, 12); AV.toast(tr('🏐 You dive, you miss, you get sand everywhere. Your team wins anyway.', '🏐 Te tiras, fallas, arena por todas partes. Tu equipo gana igual.')) }, () => day(), 'game');
  /* conversations */
  const TK = AV.talk, setL = (en, es) => { const e = document.getElementById('tkL'); e && (e.textContent = tr(en, es)) };
  function talk(id) { const o = named[id]; if (!o || !TK) return; const s = bs(); s.met[id] = (s.met[id] || 0) + 1;
    const O = { txell: [{ label: L('Are there real waves here?', '¿Hay olas de verdad aquí?'), say: L('“In winter, with a llevant wind. In summer, perfect for learning.”', '“En invierno, con viento de levante. En verano, perfectas para aprender.”') },
        { label: L('First-timer tips?', '¿Consejos para principiantes?'), say: L('“Look at the horizon, not your feet. And laugh when you fall.”', '“Mira al horizonte, no a los pies. Y ríete cuando te caigas.”') },
        { label: L('Where do surfers eat?', '¿Dónde comen los surfistas?'), say: L('“Bombes at La Ona. Ask for the spicy sauce, then regret it.”', '“Bombas en La Ona. Pide la salsa picante y luego arrepiéntete.”') },
        { label: L('Rent me a board', 'Alquílame una tabla'), fn: () => { AV.closePanel('cmp'); setL('“Surf Ape, on the Passeig. Eight credits, three hours.”', '“Surf Ape, en el Paseo. Ocho créditos, tres horas.”') } }],
      ramon: [{ label: L('What did you catch today?', '¿Qué has pescado hoy?'), say: L('“Sardines, a few red mullet, and a boot. The boot I kept.”', '“Sardinas, unos salmonetes y una bota. La bota me la quedé.”') },
        { label: L('Was the Barceloneta always like this?', '¿La Barceloneta siempre fue así?'), say: L('“Fishermen’s houses, washing on every balcony, kids on the beach. That hasn’t changed.”', '“Casas de pescadores, ropa en cada balcón, niños en la playa. Eso no ha cambiado.”') },
        { label: L('Best rice in the neighbourhood?', '¿El mejor arroz del barrio?'), say: L('“Can Simi del Mar. My fish, their pan.”', '“Can Simi del Mar. Mi pescado, su paella.”') },
        { label: L('Any stories?', '¿Alguna historia?'), say: L('“A dolphin followed my boat into the port once. The whole quay came out to see.”', '“Una vez un delfín siguió mi barca hasta el puerto. Todo el muelle salió a verlo.”') }] }[id];
    TK.open({ id: 'bcn_' + id, name: o.p.n + ' · ' + say(o.p.role), first: L('“Ei! Sóc ' + o.p.n + '.”', '“¡Ei! Soy ' + o.p.n + '.”'), back: L('“Una altra vegada per la platja?”', '“¿Otra vez por la playa?”'), opts: O }) }
  BT.talk = talk; BT.named = named;
};
})(window.AV);
