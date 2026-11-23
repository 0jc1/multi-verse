/* APEVERSE - astro9_market.js : Cinematic V1, Astro-9 district 1 (the arrival district) gets three distinct identities on top of the
   existing streets, shops and counters (nothing is moved; doors, stalls, stops and routes stay where they were):
     INTERGALACTIC BAZAAR (x -98..-20) : an alien SOUK - fabric canopies strung across the street, hanging brass lamps, rugs, spice sacks,
       crates and pots between the shop doors, mashrabiya-style lattice screens + striped awnings on the shop facades, carved horseshoe
       gateways at both ends with an ornate gold-on-teal sign.
     FOOD RING (x 20..92) : a NIGHT STREET-FOOD MARKET - zig-zag string lights, umbrellas + grills (smoke) over the food stalls, hand-lettered
       menu boards (6 food signs), table clusters with stools and seated diners in the middle of the street, walking lanes kept free.
     CENTRAL SPIRAL PLAZA : a Gaudi mosaic COLONNADE ring (trencadis columns + arches, open at the four street mouths) and curved mosaic
       benches inside the plaza.
   AV.astro9market.build(ctx) -> { places }. Called from astro9_metro.js after the other Astro-9 modules. */
'use strict';
(function (AV) {
const tr = AV.tr, TAU = Math.PI * 2, L = (e, s) => [e, s];
const MK = AV.astro9market = {};
const TX = {};
const cv = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t };
const rnd = s => { let x = s; return () => (x = (x * 16807) % 2147483647) / 2147483647 };
/* rugs: 4 patterns side by side (1024 x 256) */
const rugTex = () => TX.rug || (TX.rug = cv(1024, 256, (c) => { const P = [['#8a1a2a', '#e8c86a', '#1a3a6a'], ['#1a4a5a', '#e8a84a', '#f4ead0'], ['#4a1a5a', '#ff8ad8', '#e8d84a'], ['#6a3a1a', '#f4ead0', '#2a8a7a']];
  P.forEach(([a, b, d], i) => { const X = i * 256; c.fillStyle = a; c.fillRect(X, 0, 256, 256); c.strokeStyle = b; c.lineWidth = 8; c.strokeRect(X + 14, 14, 228, 228); c.strokeStyle = d; c.lineWidth = 4; c.strokeRect(X + 30, 30, 196, 196);
    for (let k = 0; k < 5; k++) { c.fillStyle = k % 2 ? b : d; c.beginPath(); c.moveTo(X + 128, 52 + k * 8); c.lineTo(X + 200 - k * 12, 128); c.lineTo(X + 128, 204 - k * 8); c.lineTo(X + 56 + k * 12, 128); c.closePath(); c.fill() }
    for (let k = 0; k < 16; k++) { c.fillStyle = b; c.fillRect(X + 16 + k * 14.5, 4, 3, 10); c.fillRect(X + 16 + k * 14.5, 242, 3, 10) } }) }));
/* lattice screen (alpha-tested) */
const latticeTex = () => TX.lat || (TX.lat = cv(256, 256, (c) => { c.clearRect(0, 0, 256, 256); c.strokeStyle = '#d8b878'; c.lineWidth = 7; for (let y = 0; y <= 256; y += 32) for (let x = 0; x <= 256; x += 32) { c.beginPath(); c.arc(x, y, 16, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(x - 16, y); c.lineTo(x, y - 16); c.lineTo(x + 16, y); c.lineTo(x, y + 16); c.closePath(); c.stroke() } }));
/* the souk gate sign: gold on teal, glyph border */
const gateTex = () => TX.gate || (TX.gate = cv(1024, 256, (c) => { const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#0e4a52'); g.addColorStop(1, '#062a30'); c.fillStyle = g; c.fillRect(0, 0, 1024, 256);
  c.strokeStyle = '#e8c86a'; c.lineWidth = 6; c.strokeRect(12, 12, 1000, 232); c.lineWidth = 2; c.strokeRect(24, 24, 976, 208);
  for (let x = 40; x < 990; x += 26) { c.fillStyle = '#e8c86a'; c.beginPath(); c.arc(x, 40, 5, 0, TAU); c.fill(); c.beginPath(); c.arc(x, 216, 5, 0, TAU); c.fill() }
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = 'bold 78px Georgia,"Times New Roman",serif'; c.shadowColor = '#ffd88a'; c.shadowBlur = 14; c.fillStyle = '#f4d88a'; c.fillText('INTERGALACTIC BAZAAR', 512, 112, 940); c.shadowBlur = 0;
  c.font = 'italic 30px Georgia,serif'; c.fillStyle = '#d8f0ec'; c.fillText('spices · rugs · relics · records · crystals', 512, 182, 900) }));
/* 6 hand-lettered food signs (4 x 2 cells of 256 x 256) */
const FOODS = [['STAR DUMPLINGS', '#ffd84a', '#7a1a14'], ['GLOWFRUIT', '#7aff8a', '#0a2a14'], ['NEBULA TEA', '#c88aff', '#14082a'], ['COMET SKEWERS', '#ff8a3a', '#1a0a04'], ['VOID NOODLES', '#4ad8ff', '#04141c'], ['MOON TACOS', '#ffffff', '#2a5a1a']];
const foodTex = () => TX.food || (TX.food = cv(1024, 512, (c) => { FOODS.forEach(([t, fg, bg], i) => { const X = (i % 4) * 256, Y = (i / 4 | 0) * 256; c.save(); c.translate(X, Y); c.fillStyle = bg; c.fillRect(0, 0, 256, 256); c.strokeStyle = fg; c.lineWidth = 6; c.strokeRect(10, 10, 236, 236);
  c.fillStyle = fg; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = 'bold 34px "Segoe Print","Comic Sans MS",cursive'; const w = t.split(' '); w.forEach((s, k) => c.fillText(s, 128, 70 + k * 44, 220));
  c.font = '22px "Segoe Print",cursive'; c.fillStyle = '#ffffff'; c.fillText(['12 ¢', '8 ¢', '14 ¢', '10 ¢', '15 ¢', '11 ¢'][i], 128, 200); c.restore() }) }));
/* 4 souk shop facades (2 x 2 cells of 1024 x 512 = 13 x 5.2 m): lime plaster, zellige dado, carved frieze, horseshoe door arch cut out (alpha) */
const ZEL = [['#1a6a7a', '#e8d8b0', '#c8501a'], ['#2a4a9a', '#f4ead0', '#e8b82a'], ['#7a2a4a', '#f0e0c8', '#2a8a6a'], ['#2a7a4a', '#f4ead0', '#b8301a']], PLA = ['#e8d2b0', '#d8c0a0', '#ecdcc0', '#dcc8b4'];
const facTex = () => TX.fac || (TX.fac = cv(2048, 1024, (c) => { for (let i = 0; i < 4; i++) { const X = (i % 2) * 1024, Y = (i / 2 | 0) * 512, [a, b, d] = ZEL[i], R = rnd(77 + i), px = 1024 / 13;
  c.save(); c.translate(X, Y); c.fillStyle = PLA[i]; c.fillRect(0, 0, 1024, 512);
  for (let k = 0; k < 2600; k++) { c.fillStyle = 'rgba(' + (R() < .5 ? '90,60,30,' : '255,250,235,') + (.04 + R() * .08) + ')'; const s = 2 + R() * 14; c.fillRect(R() * 1024, R() * 512, s, s * (.4 + R())) }   /* lime plaster mottling */
  for (let k = 0; k < 14; k++) { c.strokeStyle = 'rgba(80,50,30,.18)'; c.lineWidth = 1; c.beginPath(); let x = R() * 1024, y = R() * 400; c.moveTo(x, y); for (let s = 0; s < 6; s++) { x += (R() - .5) * 30; y += 8 + R() * 14; c.lineTo(x, y) } c.stroke() }   /* hairline cracks */
  c.fillStyle = a; c.fillRect(0, 430, 1024, 82);   /* zellige dado */
  for (let x = 0; x < 1024; x += 24) for (let y = 434; y < 512; y += 24) { c.fillStyle = ((x + y) / 24) % 2 ? b : d; c.beginPath(); c.moveTo(x + 12, y); c.lineTo(x + 24, y + 12); c.lineTo(x + 12, y + 24); c.lineTo(x, y + 12); c.closePath(); c.fill() }
  c.fillStyle = b; c.fillRect(0, 424, 1024, 8);
  c.fillStyle = 'rgba(120,80,40,.35)'; c.fillRect(0, 38, 1024, 46); c.strokeStyle = '#8a6a40'; c.lineWidth = 3; c.strokeRect(-4, 38, 1032, 46);   /* carved frieze */
  for (let x = 10; x < 1024; x += 34) { c.strokeStyle = 'rgba(90,60,30,.55)'; c.lineWidth = 3; c.beginPath(); c.arc(x + 17, 84, 15, Math.PI, 0); c.stroke(); c.beginPath(); c.moveTo(x + 17, 46); c.lineTo(x + 25, 60); c.lineTo(x + 17, 74); c.lineTo(x + 9, 60); c.closePath(); c.stroke() }
  const dx = 512, dwp = 1.3 * px, dtop = 512 - 2.6 * 512 / 5.2;   /* door opening: x +-1.3 m, 2.6 m high */
  c.fillStyle = a; c.beginPath(); c.moveTo(dx - dwp - 26, 512); c.lineTo(dx - dwp - 26, dtop + 10); c.arc(dx, dtop + 10, dwp + 26, Math.PI * 1.05, Math.PI * 1.95 + .0); c.lineTo(dx + dwp + 26, 512); c.closePath(); c.fill();   /* tiled arch surround */
  c.strokeStyle = b; c.lineWidth = 5; c.beginPath(); c.arc(dx, dtop + 10, dwp + 16, Math.PI * 1.02, Math.PI * 1.98); c.stroke();
  c.globalCompositeOperation = 'destination-out'; c.fillRect(dx - dwp, dtop, dwp * 2, 512 - dtop); c.globalCompositeOperation = 'source-over';
  for (const wx of [dx - 5.4 * px, dx + 5.4 * px]) { c.fillStyle = 'rgba(60,40,30,.75)'; c.fillRect(wx - 26, 300, 52, 90); c.beginPath(); c.arc(wx, 300, 26, Math.PI, 0); c.fill(); c.strokeStyle = b; c.lineWidth = 4; c.stroke(); c.fillStyle = 'rgba(255,190,100,.55)'; c.fillRect(wx - 18, 300, 36, 82) }   /* small lit arched windows */
  c.restore() } }));
const cell = (w, h, i, cols, rows) => { const g = new THREE.PlaneGeometry(w, h), uv = g.attributes.uv, u0 = (i % cols) / cols, v1 = 1 - (i / cols | 0) / rows; for (let k = 0; k < uv.count; k++) uv.setXY(k, u0 + uv.getX(k) / cols, v1 - (1 - uv.getY(k)) / rows); return g };

MK.build = function (ctx) {
  const K = AV.kit, q = ctx.q, grp = ctx.group, M = K.M, BG = K.BG, r = rnd(4242);
  const solid = [], glow = [], cloth = [], rugs = [], foodS = [], lat = [], gateS = [], diners = [], facs = [];
  const T = (x, z, rr, label, fn) => ctx.T.push({ x, z, r: rr, label, fn });
  const circ = (x, z, rr) => ctx.circles.push([x, z, rr]);
  const NEO = [0xff4ad2, 0x4ad8ff, 0xffd84a, 0x7aff8a, 0xc88aff, 0xff8a3a];
  /* ================= INTERGALACTIC BAZAAR: the souk ================= */
  const DOORS = [-84, -66, -48, -30], nearDoor = x => DOORS.some(d => Math.abs(x - d) < 3.2);
  const CLOTH = [0xc81a5a, 0xe8a82a, 0x1a8a8a, 0x6a2a8a, 0xe85a1a, 0x2a6ab8];
  for (let x = -94, k = 0; x <= -24; x += 5, k++) {   /* fabric canopies strung across the street, sagging in the middle */
    const col = CLOTH[k % CLOTH.length], y0 = 6.2, sag = .9;
    for (const [z0, z1] of [[84.5, 94], [94, 103.5]]) { const zm = (z0 + z1) / 2, len = z1 - z0, tilt = (z0 < 94 ? 1 : -1) * Math.atan2(sag, len); cloth.push([BG.box, col, M(x, y0 - sag / 2, zm, 3.6, .03, Math.hypot(len, sag), tilt, 0, 0)]) }
    if (!nearDoor(x)) { solid.push([BG.cyl, 0x3a2a1a, M(x, 3.1, 84.6, .07, 6.2, .07)]); circ(x, 84.6, .12) } solid.push([BG.cyl, 0x3a2a1a, M(x, 3.1, 103.4, .07, 6.2, .07)]); circ(x, 103.4, .12);   /* no pole in a doorway */
    if (k % 2 === 0) { solid.push([BG.cyl, 0x2a2a2a, M(x, 5.1, 94, .015, .9, .015)], [BG.cone, 0xb8862a, M(x, 4.55, 94, .3, .45, .3)]); glow.push([BG.sph, 0xffc86a, M(x, 4.35, 94, .2, .2, .2), 1]) } }   /* brass lamps */
  for (let i = 0; i < 4; i++) { const x = -84 + i * 18; rugs.push([cell(3.2, 2.2, i, 4, 1), 0xffffff, M(x, .03, 99.8 + (i % 2) * .4, 1, 1, 1, -Math.PI / 2, 0, 0)]) }   /* rugs laid out in front of the south stalls */
  for (let x = -92; x < -22; x += 1.7) { if (nearDoor(x) || r() < .3) continue; const z = 85.4 + r() * .6, kind = (r() * 3) | 0;   /* spice sacks, crates, pots between the shop doors */
    if (kind === 0) { solid.push([BG.hem || BG.sph, [0xc8501a, 0xe8b82a, 0x8a2a1a, 0x5a7a2a][(r() * 4) | 0], M(x, .02, z, .38, .5, .38)]) }
    else if (kind === 1) { solid.push([BG.box, 0x7a5a32, M(x, .3, z, .6, .6, .6, 0, r(), 0)]); if (r() < .5) solid.push([BG.box, 0x6a4a28, M(x, .85, z, .5, .5, .5, 0, r(), 0)]) }
    else solid.push([BG.cyl, 0xa85a2a, M(x, .45, z, .28, .9, .28)], [BG.cyl, 0x8a4a20, M(x, .92, z, .18, .06, .18)]);
    circ(x, z, .42) }
  for (const sx of DOORS) {   /* facade dressing on each shop front (street face z = 84): lattice screens + a striped awning over the door */
    facs.push([cell(13, 5.2, DOORS.indexOf(sx), 2, 2), 0xffffff, M(sx, 2.6, 84.03, 1, 1, 1)]);   /* textured plaster skin with the door cut out */
    for (const dx of [-4, 4]) lat.push([new THREE.PlaneGeometry(2.6, 1.8), 0xffffff, M(sx + dx, 3.6, 84.08, 1, 1, 1)]);
    for (let k = 0; k < 6; k++) cloth.push([BG.box, k % 2 ? 0xf4ead0 : CLOTH[Math.abs(sx | 0) % 6], M(sx - 1.5 + k * .6, 3.05, 84.75, .6, .04, 1.5, -.25, 0, 0)]) }
  /* carved horseshoe gateways at both ends of the street */
  for (const gx of [-96.5, -22]) { for (const gz of [85.2, 102.8]) { solid.push([BG.box, 0xd8b88a, M(gx, 3.2, gz, 1.4, 6.4, 1.4)], [BG.box, 0xb8946a, M(gx, 6.5, gz, 1.7, .3, 1.7)]); ctx.cols.push([gx - .7, gx + .7, gz - .7, gz + .7]) }
    solid.push([new THREE.TorusGeometry(8.8, .7, 8, 32, Math.PI), 0xd8b88a, M(gx, 6.2, 94, 1, .55, 1, 0, Math.PI / 2, 0)]); glow.push([new THREE.TorusGeometry(8.8, .12, 6, 40, Math.PI), 0xffd88a, M(gx + .5, 6.2, 94, 1, .55, 1, 0, Math.PI / 2, 0), 1]);
    for (const fx of [1, -1]) gateS.push([new THREE.PlaneGeometry(7.6, 1.9), 0xffffff, M(gx + fx * .45, 8.3, 94, 1, 1, 1, 0, fx * Math.PI / 2, 0)]) }
  T(-75, 99.5, 1.8, () => tr('🧶 Rug dealer: feel the weave', '🧶 Vendedor de alfombras: tocar el tejido'), () => AV.toast(AV.pick([tr('“Woven in zero-g. No two threads agree on which way is up.”', '“Tejida en gravedad cero. Ningún hilo está de acuerdo sobre dónde es arriba.”'), tr('“This one flies. Slowly. Only on Tuesdays.”', '“Esta vuela. Despacio. Solo los martes.”')])));
  T(-57, 86, 1.8, () => tr('🌶 Smell the spice sacks', '🌶 Oler los sacos de especias'), () => AV.toast(tr('Cinnamon, ozone and something that hums. Your nose tingles.', 'Canela, ozono y algo que zumba. Te cosquillea la nariz.')));
  /* ================= FOOD RING: the night street-food market ================= */
  const pts = [], bulbs = []; for (let x = 22, k = 0; x < 90; x += 6, k++) { const za = k % 2 ? 84.6 : 103.4, zb = k % 2 ? 103.4 : 84.6, y = 5.2; for (let s = 0; s < 8; s++) { const a = s / 8, b2 = (s + 1) / 8, f = t => y - Math.sin(t * Math.PI) * .8; pts.push(x + 3 * a, f(a), za + (zb - za) * a, x + 3 * b2, f(b2), za + (zb - za) * b2) }
    for (let s = 1; s < 8; s++) bulbs.push([BG.sph, [0xffe0a0, 0xffd84a, 0xff8ad8, 0x9ae8ff][s % 4], M(x + 3 * s / 8, y - Math.sin(s / 8 * Math.PI) * .8 - .12, za + (zb - za) * s / 8, .1, .14, .1), 1]) }
  { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); const m = new THREE.LineBasicMaterial({ color: 0x111111 }); m.userData.lin = 1; grp.add(new THREE.LineSegments(g, m)) }
  glow.push(...bulbs);
  const grills = []; [[30, 0], [58, 1], [74, 2], [44, 3], [50, 5]].forEach(([x, fi], i) => { const z = i < 3 ? 101.2 : 101.6;   /* umbrellas + grills + menu boards over the food stalls */
    solid.push([BG.cone, NEO[(i + 2) % 6], M(x, 3.3, z, 2.1, .7, 2.1)], [BG.cyl, 0x3a3a44, M(x, 1.65, z + .8, .05, 3.3, .05)]);
    if (i >= 3) { solid.push([BG.box, 0x3a2a24, M(x, .5, z, 2.2, 1, 1.0)]); circ(x, z, 1.1) }
    solid.push([BG.box, 0x2a2a30, M(x + .7, 1.1, z - .1, .7, .1, .5)]); glow.push([BG.box, 0xff6a2a, M(x + .7, 1.16, z - .1, .6, .02, .4), 1]); grills.push([x + .7, z - .1]);
    foodS.push([cell(1.3, 1.3, fi, 4, 2), 0xffffff, M(x - .6, 2.1, z - .55, 1, 1, 1, 0, Math.PI, 0)]); solid.push([BG.box, 0x1a1a1a, M(x - .6, 2.1, z - .5, 1.4, 1.4, .05)]) });
  [[48, 91], [64, 91], [80, 91]].forEach(([x, z], i) => { for (const dx of [-1.6, 1.6]) { const tx = x + dx; solid.push([BG.cyl, 0xe8e0d0, M(tx, .74, z, .55, .05, .55)], [BG.cyl, 0x4a4a54, M(tx, .37, z, .06, .74, .06)]); circ(tx, z, .62);
      for (const a of [0, Math.PI]) { const sx = tx + Math.sin(a) * .85, sz = z + Math.cos(a) * .85; solid.push([BG.cyl, NEO[(i + 3) % 6], M(sx, .45, sz, .2, .06, .2)], [BG.cyl, 0x3a3a44, M(sx, .22, sz, .04, .44, .04)]); if ((i + (dx > 0 ? 1 : 0)) % 2 === 0 && a === 0) diners.push([sx, sz, Math.PI]) } } });
  T(64, 91, 2, () => tr('🍢 Sit at a food-market table', '🍢 Sentarse en una mesa del mercado'), () => { AV.toast(tr('You share a table with a family of three-eyed locals. They recommend the comet skewers.', 'Compartes mesa con una familia local de tres ojos. Te recomiendan las brochetas cometa.')); AV.vitals && AV.vitals.add(1, 2) });
  /* ================= CENTRAL SPIRAL PLAZA: mosaic colonnade + benches ================= */
  const PC = { x: 0, z: 94 }, openings = [-Math.PI / 2, Math.PI / 2, Math.PI, 0], MOS = [0xff4ad2, 0x4ad8ff, 0xffd84a, 0x7aff8a, 0xc88aff, 0xff8a3a];
  for (let k = 0; k < 30; k++) { const a = k / 30 * TAU, R = 25.8; if (openings.some(o => Math.abs(((a - o + Math.PI * 3) % TAU) - Math.PI) < .3)) continue; const x = PC.x + Math.cos(a) * R, z = PC.z + Math.sin(a) * R;
    solid.push([BG.cyl, 0xf0e8d8, M(x, 2.8, z, .45, 5.6, .45)], [BG.cyl, MOS[k % 6], M(x, 5.7, z, .62, .3, .62)]); for (let b = 0; b < 3; b++) glow.push([BG.cyl, MOS[(k + b) % 6], M(x, 1 + b * 1.6, z, .47, .12, .47), 1]);
    const a2 = (k + 1) / 30 * TAU; if (!openings.some(o => Math.abs(((a2 - o + Math.PI * 3) % TAU) - Math.PI) < .3)) { const mx = PC.x + Math.cos((a + a2) / 2) * R, mz = PC.z + Math.sin((a + a2) / 2) * R, span = TAU / 30 * R; solid.push([new THREE.TorusGeometry(span / 2, .28, 6, 16, Math.PI), 0xe8dcc8, M(mx, 5.6, mz, 1, .7, 1, 0, -(a + a2) / 2 + Math.PI / 2, 0)]) } }
  for (const a of [Math.PI * .25, Math.PI * .75, Math.PI * 1.25, Math.PI * 1.75]) { for (let s = -2; s <= 2; s++) { const aa = a + s * .07, x = PC.x + Math.cos(aa) * 21.2, z = PC.z + Math.sin(aa) * 21.2; solid.push([BG.box, MOS[(s + 3) % 6], M(x, .45, z, 1.6, .9, .6, 0, -aa, 0)]); circ(x, z, .7) } }
  /* ================= merge ================= */
  const mat = o => { const m = new THREE.MeshStandardMaterial(Object.assign({ vertexColors: true }, o)); m.userData.lin = 1; return m };
  if (solid.length) grp.add(new THREE.Mesh(K.merge(solid), mat({ roughness: .55, metalness: .15 })));
  if (glow.length) { const gm = new THREE.MeshBasicMaterial({ vertexColors: true }); gm.userData.lin = 1; grp.add(new THREE.Mesh(K.merge(glow), gm)) }
  if (cloth.length) grp.add(new THREE.Mesh(K.merge(cloth), mat({ roughness: .9, side: THREE.DoubleSide, emissive: 0x2a1a20, emissiveIntensity: .6 })));
  if (rugs.length) { const m = new THREE.MeshStandardMaterial({ map: rugTex(), roughness: .95 }); m.userData.lin = 1; grp.add(new THREE.Mesh(K.merge(rugs), m)) }
  if (lat.length) { const m = new THREE.MeshStandardMaterial({ map: latticeTex(), alphaTest: .5, side: THREE.DoubleSide, roughness: .7, emissive: 0x6a4a20, emissiveIntensity: .4 }); m.userData.lin = 1; grp.add(new THREE.Mesh(K.merge(lat), m)) }
  if (facs.length) { const m = new THREE.MeshStandardMaterial({ map: facTex(), alphaTest: .5, roughness: .92 }); m.userData.lin = 1; grp.add(new THREE.Mesh(K.merge(facs), m)) }
  if (gateS.length) { const m = new THREE.MeshBasicMaterial({ map: gateTex(), toneMapped: false }); m.userData.lin = 1; grp.add(new THREE.Mesh(K.merge(gateS), m)) }
  if (foodS.length) { const m = new THREE.MeshBasicMaterial({ map: foodTex(), toneMapped: false }); m.userData.lin = 1; grp.add(new THREE.Mesh(K.merge(foodS), m)) }
  /* seated diners (alien species, varied colours) + grill smoke */
  const dinerG = K.merge([[BG.sph, 0xffffff, M(0, .75, 0, .3, .55, .25)], [BG.sph, 0xffffff, M(0, 1.5, 0, .27, .32, .27)], [BG.sph, 0x111111, M(-.1, 1.55, .21, .07, .09, .05)], [BG.sph, 0x111111, M(.1, 1.55, .21, .07, .09, .05)], [BG.sph, 0x111111, M(0, 1.72, .2, .05, .07, .04)]]);
  const dm = mat({ roughness: .5 }), dIM = new THREE.InstancedMesh(dinerG, dm, Math.max(1, diners.length)), dc = new THREE.Color(), m4 = new THREE.Matrix4(); diners.forEach(([x, z, yaw], i) => { m4.makeRotationY(yaw); m4.setPosition(x, .15, z); dIM.setMatrixAt(i, m4); dIM.setColorAt(i, dc.setHex([0x7affd8, 0xff8ad8, 0xc88aff, 0xffd84a][i % 4]).convertSRGBToLinear()) }); dIM.count = diners.length; grp.add(dIM);
  const puff = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,.85)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c) })();
  const smoke = []; grills.forEach(([x, z], i) => { for (let k = 0; k < (q ? 3 : 2); k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: puff, color: 0xc8c0d0, transparent: true, depthWrite: false, opacity: .25 })); grp.add(sp); smoke.push({ sp, x, z, ph: k / 3 + i * .23 }) } });
  ctx.upd.push((dt, t) => { if (AV.P.y < -10) return; for (const s of smoke) { const f = (t * .3 + s.ph) % 1; s.sp.position.set(s.x + Math.sin(t + s.ph * 7) * .2 * f, 1.3 + f * 2.6, s.z); s.sp.scale.setScalar(.4 + f * 1.4); s.sp.material.opacity = .28 * (1 - f) * Math.min(1, f * 5) } });
  MK.fx = { canopies: cloth.length, diners: diners.length, smoke: smoke.length, columns: solid.length };
  return { places: [{ id: 'mk_souk_gate', name: L('Bazaar souk gate', 'Puerta del zoco del Bazar'), x: -22, z: 94, yaw: Math.PI / 2 }, { id: 'mk_food_tables', name: L('Food Ring tables', 'Mesas del Anillo de Comida'), x: 64, z: 88, yaw: 0 }] };
};
})(window.AV);
