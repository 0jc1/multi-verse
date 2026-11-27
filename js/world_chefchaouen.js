/* APEVERSE 2.2 GLOBAL WORLDS - world_chefchaouen.js : CHEFCHAOUEN, the blue medina (agent 4).  Network: chefchaouen_plan.js; dressing:
   gw_city.js; life + Festival Alegría: chefchaouen_life.js.
   Architecture: every wall washed in a different blue (cobalt, sky, powder, indigo, turquoise) with white and a blue-painted plinth;
   small windows behind green and blue iron grilles; doors under little green-tiled canopies; flowerpots everywhere; flat roofs with
   terraces.  Landmarks: the Kasbah's ochre walls, towers and garden (walk in), the Grand Mosque's octagonal minaret over Uta el-Hammam,
   Ras El Maa (the spring, the river tumbling out of the mountain, the stone washing basins), two footbridges, the hillside path to the
   white Spanish Mosque.  The whole town lies on the slope: houses step up the hill on foundations.  Every business is fictional.  AV.chefchaouen */
'use strict';
(function (AV) {
const TAU = Math.PI * 2, L = (e, s) => [e, s], GW = AV.gwkit, PLAN = AV.chefchaouenPlan, PT = GW.paint;
const CHF = AV.chefchaouen = { stats: {} }, SG = CHF.SG = { r: {} };
const zellige = (top, sub, ink) => (g, w, h) => { const T = h / 4; for (let y = 0; y < h; y += T) for (let x = 0; x < w; x += T) { const k = ((x / T | 0) + (y / T | 0)) % 4; g.fillStyle = ['#1f5aa8', '#f4f0e6', '#2a8a6a', '#f4f0e6'][k]; g.fillRect(x, y, T, T); g.fillStyle = ['#f4f0e6', '#d8a030', '#f4f0e6', '#1f5aa8'][k]; g.beginPath(); g.moveTo(x + T / 2, y + 3); g.lineTo(x + T - 3, y + T / 2); g.lineTo(x + T / 2, y + T - 3); g.lineTo(x + 3, y + T / 2); g.fill() }
  g.fillStyle = 'rgba(244,240,230,.94)'; GW.rr(g, T * .6, T * .55, w - T * 1.2, h - T * 1.1, 10); g.fill(); g.fillStyle = ink || '#1f3a7a'; g.textAlign = 'center'; g.textBaseline = 'middle'; GW.fit(g, top, w - T * 2, h * .34, '700 #px Georgia, serif', h * .44, w / 2); if (sub) GW.fit(g, sub, w - T * 2.4, h * .13, 'italic #px Georgia, serif', h * .7, w / 2) };   /* zellige-tiled frame, the Moroccan shop sign */
const painted = (top, ar, sub, bg, ink) => (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = ink; g.textAlign = 'center'; g.textBaseline = 'middle'; GW.fit(g, ar, w - 60, h * .34, '700 #px "Segoe UI", "Arial Unicode MS", Arial, sans-serif', h * .28, w / 2); GW.fit(g, top, w - 60, h * .26, '700 #px Georgia, serif', h * .62, w / 2); if (sub) GW.fit(g, sub, w - 70, h * .12, 'italic #px Georgia, serif', h * .86, w / 2) };   /* Arabic + Latin lettering, like the town's real signs */
const SIGNS = CHF.SIGNS = [
  ['babouches', 768, 192, painted('Babouches Hassan', 'بلغة حسن', 'babouches de cuir · faites à la main', '#f2c030', '#5a2a10')],
  ['tissage', 768, 192, zellige('Tissage Al Andalus', 'coopérative de tisserands · couvertures · jellabas', '#1a3a6a')],
  ['cafe', 768, 192, painted('Café Ras El Maa', 'مقهى رأس الماء', 'thé à la menthe · jus d\'orange · terrasse', '#2a8a6a', '#f4f0e6')],
  ['epices', 768, 192, painted('Épices & Pigments Bleus', 'توابل و ألوان', 'ras el hanout · safran · indigo · henné', '#5a2a5a', '#f2c030')],
  ['tajine', 768, 192, zellige('Dar Tajine', 'tajines · bissara · pastilla · fromage de chèvre', '#5a1a10')],
  ['four', 640, 160, painted('Four du Quartier', 'فرن الحومة', 'pain cuit au feu de bois', '#c8603a', '#f8f4ea')],
  ['hammam', 640, 160, zellige('Hammam Sidi Ali', 'bain traditionnel · savon noir', '#1a3a6a')],
  ['alegria', 1024, 192, (g, w, h) => { g.fillStyle = '#12224a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { g.fillStyle = ['#f2c030', '#4ad8ff', '#ff6a9a'][i % 3]; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, 3 + Math.random() * 5, 0, 7); g.fill() } g.fillStyle = '#f8f4ea'; g.textAlign = 'center'; g.textBaseline = 'middle'; GW.fit(g, 'FESTIVAL ALEGRÍA', w - 120, 90, '900 #px Georgia, serif', h * .42, w / 2); g.fillStyle = '#f2c030'; GW.fit(g, 'musiques de la Méditerranée · Chefchaouen', w - 160, 28, 'italic 700 #px Georgia, serif', h * .8, w / 2) }],
  ['g_epicerie', 512, 112, painted('Épicerie', 'بقالة', 'tout pour la maison', '#f4f0e6', '#1f5aa8')],
  ['g_tapis', 512, 112, zellige('Tapis du Rif', 'tapis · kilims', '#5a1a10')],
  ['g_cuir', 512, 112, painted('Maroquinerie', 'جلد', 'sacs · ceintures', '#8a4a2a', '#f8f4ea')],
  ['g_bijoux', 512, 112, painted('Bijoux Berbères', 'حلي', 'argent · ambre', '#1a1a2a', '#e8c040')],
  ['g_the', 512, 112, painted('Salon de Thé', 'شاي', 'menthe · pâtisseries', '#2a8a6a', '#f4f0e6')],
  ['g_fromage', 512, 112, painted('Fromage de Chèvre', 'جبن', 'du Rif', '#f4f0e6', '#2a6a3a')],
  ['g_poterie', 512, 112, zellige('Poterie', 'tajines · plats', '#5a2a10')],
  ['g_coiffeur', 512, 112, PT.plain('COIFFEUR', 'حلاق', '#f4f4f4', '#1a1a1a', '#1f5aa8', '800 #px Arial, sans-serif')],
  ['g_tailleur', 512, 112, painted('Tailleur', 'خياط', 'jellabas sur mesure', '#1f5aa8', '#f4f0e6')],
  ['g_boulangerie', 512, 112, painted('Pâtisserie', 'حلويات', 'cornes de gazelle · chebakia', '#f2c030', '#5a2a10')],
  ['g_lampes', 512, 112, zellige('Lanternes', 'cuivre · verre', '#1a3a6a')],
  ['g_herbes', 512, 112, painted('Herboriste', 'عشاب', 'plantes · savon noir', '#4a6a2a', '#f4f0e6')],
  ['fw', 128, 160, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#f4f0e6'; g.fillRect(14, 14, w - 28, h - 28); g.fillStyle = '#1e3040'; g.fillRect(24, 24, w - 48, h - 48); g.fillStyle = '#2a8a6a'; for (let x = 34; x < w - 24; x += 16) g.fillRect(x, 24, 4, h - 48); g.fillRect(24, h / 2 - 2, w - 48, 4); g.fillStyle = '#2a8a6a'; g.fillRect(8, 6, w - 16, 10) }]   /* a small grilled window under a tiled lintel, for blank walls */
].concat(GW.WINDOWS).concat([['w_pigments', 256, 160, (g, w, h) => { g.fillStyle = '#e8e0d0'; g.fillRect(0, 0, w, h); const c = ['#1f5aa8', '#4a8ad8', '#c8143a', '#e8a020', '#2a8a4a', '#8a3ad8']; for (let i = 0; i < 6; i++) { const x = 22 + i * 42; g.fillStyle = c[i]; g.beginPath(); g.moveTo(x - 18, 140); g.lineTo(x, 70); g.lineTo(x + 18, 140); g.fill() } }], ['w_babouches', 256, 160, (g, w, h) => { g.fillStyle = '#3a2414'; g.fillRect(0, 0, w, h); for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) { g.fillStyle = ['#f2c030', '#c8143a', '#f4f0e6', '#1f5aa8'][(i + r) % 4]; g.beginPath(); g.ellipse(22 + i * 42, 30 + r * 50, 16, 8, 0, 0, 7); g.fill() } }]])
  .concat(GW.plaques(PLAN.streets.map(s => [s[0], s[4][0]]).concat(PLAN.plazas.map(p => [p[0], p[2][0]])), { border: '#1f5aa8', accent: '#2a8a6a', ink: '#1a3a7a', bg: '#f4f0e6' }));
const GEN = SIGNS.filter(s => /^g_/.test(s[0])).map(s => s[0]);
const WIN = { g_epicerie: 'w_goods', g_tapis: 'w_dress', g_cuir: 'w_babouches', g_bijoux: 'w_goods', g_the: 'w_sweets', g_fromage: 'w_goods', g_poterie: 'w_ceramic', g_coiffeur: 'w_goods', g_tailleur: 'w_dress', g_boulangerie: 'w_sweets', g_lampes: 'w_goods', g_herbes: 'w_pigments' };
const BLUES = [0x3a70c8, 0x4a8ad8, 0x6aa8e8, 0x8ac0f0, 0xa8d0f0, 0x2a5aa8, 0x58b0d8, 0x7a9ae0, 0xf4f0e6];
const STY = { medina: { walls: BLUES, trim: [0xf4f0e6, 0x2a5aa8], base: [0x2a5aa8, 0x1f4a8a, 0x3a70c8], shutter: [0x2a8a6a, 0x1f5aa8], door: [0x2a5aa8, 0x2a8a6a, 0x6a3a1a, 0xc8a040], iron: 0x1f4a5a, roof: 'flat', floors: [2, 3], fh: 3, balcony: .12, cierro: 0, reja: true, pots: .9, mirador: 0 } };
AV.registerWorld({
  id: 'chefchaouen',
  build(ctx) {
    const K = AV.kit, BG = K.BG, q = ctx.q, grp = ctx.group, rng = GW.rng((ctx.seed || 1) * 43 + 5), M = K.M, t0 = performance.now(), S = AV.S, H = PLAN.height;
    const fwin = [];
    const N = CHF.N = PLAN.net(), lots = N.lots(GW.rng(17), { wmin: 5, wmax: 8.5, dmax: 11, order: ['plaza', 'lane', 'promenade', 'road', 'street', 'alley'] });
    const T = (x, z, r, label, fn, show, kind) => { const t = { x, z, r, label, fn, show, kind }; ctx.T.push(t); return t };
    const st = () => { S.chf = S.chf || { met: {}, q: {}, rides: 0 }; return S.chf };
    CHF.ctx = ctx; CHF.T = T; CHF.st = st;
    const d = CHF.d = GW.dress(ctx, { N, lots, rng, q, name: 'chf', GEN, WIN, styleFor: () => STY.medina, shopP: (s) => s ? (s.shops != null ? s.shops : s.kind === 'alley' ? .12 : .3) : .3,
      SPECIAL: [['babouches', 'souk', [-70, 90], 7.5, 6, 'w_babouches'], ['tissage', 'bab_ain', [-130, 100], 7.5, 6, 'w_dress'], ['cafe', 'calle_ras', [120, -140], 0, 5, 'w_sweets'], ['epices', 'souk', [-40, 60], 0, 5, 'w_pigments'], ['tajine', 'l8', [-30, 90], 7, 6, 'w_tapas'], ['four', 'l2', [-60, -80], 0, 5, 'w_sweets'], ['hammam', 'calle_ras', [55, -55], 0, 5, 'w_goods']],
      interiorLook: k => ({ dado: [0x1f5aa8, 0xf4f0e6], wall: k === 'tajine' ? 0xe8d0a0 : 0xf4f0e6, floor: 0x8a5a3a }),
      walkIn: (k, it, put, putG, blk) => { const w = it.w, hd = it.hd;
        if (k === 'babouches') { for (let r = 0; r < 4; r++) { put(BG.box, 0x5a3a24, -w / 2 + .5, .6 + r * .5, -hd / 2, .5, .05, hd - 2); for (let i = 0; i < 8; i++) put(BG.box, [0xf2c030, 0xc8143a, 0xf4f0e6, 0x1f5aa8][(i + r) % 4], -w / 2 + .55, .67 + r * .5, -1.6 - i * (hd - 3) / 8, .3, .1, .14) } blk(-w / 2 + .2, -w / 2 + .9, -hd + .8, -1); put(BG.box, 0x4a2a18, w / 2 - 1.1, .45, -hd + 1.6, .8, .9, 1.8); blk(w / 2 - 1.6, w / 2 - .6, -hd + .6, -hd + 2.6); it.counter = GW.localPt(it.base, w / 2 - 2, -hd + 1.6); it.staff = GW.localPt(it.base, w / 2 - .5, -hd + 1.6) }
        else if (k === 'tissage') { for (let i = 0; i < 2; i++) { const z = -2.4 - i * 2.6; put(BG.box, 0x6a4a2a, -w / 2 + 1.4, 1, z, 1.8, .1, 1.2); put(BG.box, 0x6a4a2a, -w / 2 + .6, 1, z, .1, 2, 1.2); put(BG.box, 0x6a4a2a, -w / 2 + 2.2, 1, z, .1, 2, 1.2); put(BG.box, [0xc8143a, 0x1f5aa8][i], -w / 2 + 1.4, 1.5, z, 1.5, .9, .04) } blk(-w / 2 + .4, -w / 2 + 2.4, -hd + .6, -1.6); put(BG.box, 0x4a2a18, w / 2 - 1.1, .45, -hd + 1.6, .8, .9, 1.8); blk(w / 2 - 1.6, w / 2 - .6, -hd + .6, -hd + 2.6); it.counter = GW.localPt(it.base, w / 2 - 2, -hd + 1.6); it.staff = GW.localPt(it.base, -w / 2 + 1.4, -3.6) }
        else { put(BG.box, 0x5a3a24, 0, .02, -hd / 2, 2.6, .04, 2.6); for (const [x, z] of [[-w / 2 + 1.4, -2.4], [-w / 2 + 1.4, -4.8]]) { put(BG.box, 0x8a5a3a, x, .3, z, 1, .6, 1); blk(x - .6, x + .6, z - .6, z + .6) } put(BG.box, 0x4a2a18, w / 2 - 1, .5, -hd + 1.4, .8, 1, 1.6); blk(w / 2 - 1.5, w / 2 - .5, -hd + .6, -hd + 2.2); putG(BG.box, 0xff8a3a, -w / 2 + .8, .7, -hd + 1, .8, .6, .8, 1); it.counter = GW.localPt(it.base, w / 2 - 2, -hd + 1.4); it.staff = GW.localPt(it.base, w / 2 - .5, -hd + 1.4) } },
      ground: { base: GW.tex.setts('#8a94a8'), plaza: GW.tex.slabs(200), open: GW.tex.sand('#8aa06a') }, hill: [PLAN.bounds.x0, PLAN.bounds.x1, PLAN.bounds.z0, PLAN.bounds.z1], hillTex: GW.tex.setts('#7a8aa8'),
      treesOn: s => s.id === 'avenida_hassan', fruit: null, treeCols: [0x2e5a26, 0x3a6a2e, 0x34622a],
      extraTrees: [[-56, -16], [-44, -16], [-56, 6], [-44, 6], [-50, -6], [-10, -16], [12, -16], [-10, 16], [12, 16]], fillerWall: () => BLUES[(rng() * BLUES.length) | 0], fillerCap: 0xf4f0e6, fillerBase: 0x2a5aa8, awning: .15, lanterns: .3,
      onFiller: (r, h, y0) => { const [x0, x1, z0, z1] = r; for (const [fx, fz, ry, len, ax, az] of [[(x0 + x1) / 2, z0 - .04, Math.PI, x1 - x0, 1, 0], [(x0 + x1) / 2, z1 + .04, 0, x1 - x0, 1, 0], [x0 - .04, (z0 + z1) / 2, -Math.PI / 2, z1 - z0, 0, 1], [x1 + .04, (z0 + z1) / 2, Math.PI / 2, z1 - z0, 0, 1]]) { if (len < 3) continue; const ox = Math.sin(ry) * 1.6, oz = Math.cos(ry) * 1.6; if (!N.walk(fx + ox, fz + oz)) continue; const n = Math.max(1, Math.min(3, Math.floor(len / 3.2))); for (let k = 0; k < n; k++) { const u = (k - (n - 1) / 2) * (len / n); for (const fl of [2.4, 5.4]) if (fl + 1 < h) fwin.push({ k: 'fw', x: fx + ax * u, y: (y0 || 0) + fl, z: fz + az * u, w: .9, h: 1.15, ry }) } } } });
    const { P, Gl, Gs, D, Q, FP, FQ, FG, box, obox, sign } = d; for (const q2 of fwin) Q.push(q2); CHF.stats.fillerWindows = fwin.length;
    /* the Kasbah: ochre walls with crenellated towers round a garden */
    { const oc = 0xb8643a, x0 = -70, x1 = -30, z0 = -30, z1 = 24, yb = H(-50, 0) - 3; for (const [a, b] of [[[x0, z0], [x1, z0]], [[x1, z0], [x1, -6]], [[x1, 2], [x1, z1]], [[x1, z1], [x0, z1]], [[x0, z1], [x0, z0]]]) { obox(P, oc, a[0], a[1], b[0], b[1], 2.4, yb, H((a[0] + b[0]) / 2, (a[1] + b[1]) / 2) + 8); const Lw = Math.hypot(b[0] - a[0], b[1] - a[1]); for (let t = 1; t < Lw; t += 2.2) { const x = a[0] + (b[0] - a[0]) * t / Lw, z = a[1] + (b[1] - a[1]) * t / Lw; P.push([BG.box, oc, M(x, H(x, z) + 8.6, z, 1, 1.2, 1), 0]) } }
      for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) { const y = H(x, z); box(P, oc, x - 3, x + 3, yb, y + 13, z - 3, z + 3); for (let k = 0; k < 4; k++) { const a = k / 4 * TAU; P.push([BG.box, oc, M(x + Math.cos(a) * 2.4, y + 13.6, z + Math.sin(a) * 2.4, 1.2, 1.2, 1.2), 0]) } }
      box(P, 0xa85a34, -31, -29, H(-30, -2), H(-30, -2) + 5.6, -7, 3); /* gate frame */ P.push([BG.cyl, 0x8aa8c8, M(-50, H(-50, -2) + .4, -2, 2, .8, 2), 0]); N.blockCircle(-50, -2, 2.3) }
    /* the Grand Mosque's octagonal minaret over the plaza */
    { const x = 46, z = 4, y = H(41, 12); box(P, 0xf4ead8, 30, 52, y - 3, y + 8, 0, 24); P.push([new THREE.CylinderGeometry(3.4, 3.4, 22, 8), 0xe8d8b8, M(x, y + 11, z, 1, 1, 1), 0], [new THREE.CylinderGeometry(3.6, 3.6, 1, 8), 0x2a8a6a, M(x, y + 17, z, 1, 1, 1), 0], [new THREE.CylinderGeometry(2.2, 2.2, 4, 8), 0xe8d8b8, M(x, y + 24, z, 1, 1, 1), 0], [BG.cone, 0x2a8a6a, M(x, y + 27.5, z, 2.6, 3, 2.6), 0], [BG.sph, 0xe8c040, M(x, y + 29.5, z, .4, .4, .4), 0]); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; Gl.push([BG.box, 0x2a2018, M(x + Math.cos(a) * 3.42, y + 19, z + Math.sin(a) * 3.42, 1, 2.2, .1, 0, -a + Math.PI / 2, 0), 1]) } }
    /* Ras El Maa: the river down its rocky bed (a strip that follows the slope), the stone washing basins, the cascade */
    { const g = new THREE.PlaneGeometry(PLAN.river.x1 - PLAN.river.x0 + 2, PLAN.bounds.z1 - PLAN.bounds.z0 + 40, 4, 60); g.rotateX(-Math.PI / 2); const pa = g.attributes.position, cx = (PLAN.river.x0 + PLAN.river.x1) / 2, cz = (PLAN.bounds.z0 + PLAN.bounds.z1) / 2; for (let i = 0; i < pa.count; i++) pa.setY(i, H(PLAN.river.x0, pa.getZ(i) + cz) - 1.6); g.computeVertexNormals(); const w = new THREE.Mesh(g, K.water({ deep: 0x2a6a7a, shallow: 0x6ab8c8, opacity: .92, iri: .05 })); w.position.set(cx, 0, cz); w.renderOrder = 1; w.name = 'chf_river'; grp.add(w);
      for (const x of [PLAN.river.x0, PLAN.river.x1]) for (let z = PLAN.bounds.z0; z < PLAN.bounds.z1; z += 6) { const y = H(x, z + 3); box(P, 0x9a9488, x - .6, x + .6, y - 4, y + .2, z, z + 6.2) }
      for (let z = -206; z < -172; z += 3.4) { const y = H(174, z); box(P, 0xb8b0a0, 172.5, 176.5, y - .4, y + .7, z, z + 2.6); box(P, 0x5a9ab8, 173, 176, y + .5, y + .55, z + .3, z + 2.3); N.block(GW.rectPoly(172.5, 176.5, z, z + 2.6)) } CHF.basins = [174, -190];
      for (let k = 0; k < 6; k++) Gl.push([BG.box, 0xe8f4f8, M(186, H(186, -232) - .6 - k * .6, -232 + k * 1.2, 10, .5, 1.3), 0]) }
    /* bridges (simple timber decks following N.bridgeY) */
    for (const b of N.bridges) { const [a, e] = b.pts, Lb = Math.hypot(e[0] - a[0], e[1] - a[1]); for (let i = 0; i < 20; i++) { const t0b = i / 20, t1 = (i + 1) / 20, x = a[0] + (e[0] - a[0]) * (t0b + t1) / 2, z = a[1] + (e[1] - a[1]) * (t0b + t1) / 2, y = N.bridgeY(x, z); P.push([BG.box, 0x7a5a3a, M(x, y - .08, z, Lb / 20 + .05, .16, b.w, 0, Math.atan2(-(e[1] - a[1]), e[0] - a[0]), 0), 0]); for (const sd of [-1, 1]) P.push([BG.box, 0x5a3a24, M(x, y + .9, z + sd * b.w / 2, Lb / 20, .08, .08), 0]) } }
    /* the Spanish Mosque on the hill */
    { const y = H(211, -143); box(P, 0xf4f0e6, 204, 218, y - 2, y + 7, -150, -136); P.push([BG.box, 0xf4f0e6, M(216, y + 11, -148, 3, 16, 3), 0], [BG.box, 0xc8a070, M(216, y + 19.4, -148, 3.4, .8, 3.4), 0]) }
    /* cats on the steps (Chefchaouen has many) */
    const cats = []; for (let i = 0; i < [12, 24, 36][q]; i++) { for (let k = 0; k < 10; k++) { const x = -180 + rng() * 350, z = -200 + rng() * 380; if (!N.walk(x, z)) continue; const y = H(x, z), c = [0xf4f0e6, 0x2a2a2a, 0xd8a050, 0x8a8a8a][i % 4], a = rng() * TAU; D.push([BG.box, c, M(x, y + .18, z, .45, .22, .2, 0, a, 0), 0], [BG.box, c, M(x + Math.cos(a) * .25, y + .32, z - Math.sin(a) * .25, .16, .16, .16, 0, a, 0), 0]); cats.push([x, z]); break } } CHF.cats = cats;
    /* Festival Alegría: lanterns + stages (shown while it runs) */
    { const st2 = (x, z, ry) => { const y = H(x, z); FP.push([BG.box, 0x2a1a2a, M(x, y + .5, z, 10, 1, 5, 0, ry, 0), 0], [BG.box, 0x12224a, M(x - Math.sin(ry) * 2.4, y + 3.6, z - Math.cos(ry) * 2.4, 10, 5, .2, 0, ry, 0), 0]); FQ.push({ k: 'alegria', x: x - Math.sin(ry) * 2.3, y: y + 5.2, z: z - Math.cos(ry) * 2.3, w: 9, h: 1.7, ry }) }; st2(0, -14, 0); st2(152, -200, 0); CHF.stageWall = GW.rectPoly(-5, 5, -16.5, -11.5); CHF.stage = [0, -8]; }
    for (const sid of ['souk', 'bab_ain', 'calle_ras', 'l8']) { const s = N.streets.find(x => x.id === sid); for (let i = 0; i + 1 < s.pts.length; i++) { const [a, b] = [s.pts[i], s.pts[i + 1]], Ls = Math.hypot(b[0] - a[0], b[1] - a[1]); for (let t = 2; t < Ls; t += 3.2) { const x = a[0] + (b[0] - a[0]) * t / Ls, z = a[1] + (b[1] - a[1]) * t / Ls; FG.push([BG.oct, [0xf2c030, 0xff6a3a, 0x4ad8ff, 0xffe680][((t / 3.2) | 0) % 4], M(x, H(x, z) + 4.6 + Math.sin(t) * .2, z, .3, .4, .3), 1]) } } }
    const F = CHF.F = GW.finish(ctx, d, { SG, SIGNS, name: 'chf' }); CHF.festG = F.fest; CHF.festGlowM = F.festGlowM;
    Object.assign(CHF.stats, d.stats); CHF.lots = lots; CHF.shops = d.SH; CHF.interiors = d.IN;
    if (CHF.life) try { CHF.life(ctx, { N, T, st, SH: d.SH, IN: d.IN }) } catch (e) { console.warn('chefchaouen life', e); CHF.stats.lifeErr = String(e && e.stack || e).slice(0, 300) }
    const G = CHF.navLinks && N.G ? N.G : N.graph(); CHF.rep = N.check([PLAN.arrival.x, PLAN.arrival.z]); Object.assign(CHF.stats, { navNodes: G.nodes.length, deadEnds: CHF.rep.deadEnds.length, components: CHF.rep.components, reach: CHF.rep.reachFrac, buildMs: Math.round(performance.now() - t0), lots: lots.length, cats: cats.length });
    CHF.nav = { nodes: G.nodes, links: G.links };
    const PLc = (id, en, es, x, z) => ({ id, name: [en, es], x, z, yaw: 0 }), places = [];
    for (const p of PLAN.plazas) { const sh = p[1]; let cx, cz; if (sh.c) { cx = sh.c[0]; cz = sh.c[1] } else { cx = sh.reduce((s2, v) => s2 + v[0], 0) / sh.length; cz = sh.reduce((s2, v) => s2 + v[1], 0) / sh.length } const sp = N.snap(cx, cz, 14) || [cx, cz]; places.push(PLc(p[0], p[2][0], p[2][1], sp[0], sp[1])) }
    for (const [id, x, z, en, es] of [['kasbah', -50, 0, 'Kasbah garden', 'Jardín de la Alcazaba'], ['souk', -70, 90, 'Souk', 'Zoco'], ['spanish_mosque', 210, -120, 'Spanish Mosque path', 'Camino a la Mezquita Española'], ['bab_ain', -190, 144, 'Bab el-Ain gate', 'Puerta Bab el-Ain'], ['washing', 172, -190, 'Washing basins', 'Lavaderos']]) { const sp = N.snap(x, z, 10) || [x, z]; places.push(PLc(id, en, es, sp[0], sp[1])) }
    const SHN = { babouches: 'Babouches Hassan', tissage: 'Tissage Al Andalus (weavers)', cafe: 'Café Ras El Maa', epices: 'Épices & Pigments Bleus', tajine: 'Dar Tajine', four: 'Four du Quartier (bakery)', hammam: 'Hammam Sidi Ali' };
    for (const k in d.SH) { const l = d.SH[k], [x, z] = GW.localPt(l.H.base, 0, 2.6); places.push(PLc(k, SHN[k] || k, SHN[k] || k, x, z)) }
    if (CHF.lifePlaces) for (const p of CHF.lifePlaces) places.push(p);
    return { name: 'Chefchaouen', surface: N.surface, fog: [90, 420], sky: { exp: 1, tint: [0x7aa8e0, 0xf0e8d8, .35, .3], dome: { s1: 0xf0f4f8, s2: 0x6aa0e0, swirl: .01, cloud: .45, glow: .35 } },
      arrivals: { default: { x: PLAN.arrival.x, z: PLAN.arrival.z, yaw: PLAN.arrival.yaw }, pipe: { x: 6, z: 10, yaw: PLAN.arrival.yaw }, train: { x: -190, z: 150, yaw: 0 } }, defaultArrival: 'default',
      mapRoads: N.mapRoads(), places, mapNav: CHF.nav, routeGroup: () => 'main', noCar: (x, z) => !N.carOK(x, z), stepMat: (x, z) => N.code(x, z) === 8 ? 'wood' : N.code(x, z) === 3 ? 'dirt' : 'stone',
      greet: { human: [['Salam! Up is Ras El Maa, down is Bab el-Ain. Everything else is blue.', '¡Salam! Arriba está Ras El Maa, abajo Bab el-Ain. Todo lo demás es azul.'], ['Mind the cats on the steps.', 'Cuidado con los gatos de las escaleras.']] },
      chatLines: [['They say the blue keeps the mosquitoes away. Or the heat. Or both.', 'Dicen que el azul aleja los mosquitos. O el calor. O las dos cosas.'], ['Fresh goat cheese from the Rif this morning.', 'Queso de cabra fresco del Rif esta mañana.'], ['Festival week: music on every square.', 'Semana de festival: música en cada plaza.']],
      musicProfile: { bpm: 90, root: 50, scale: [0, 1, 4, 5, 7, 8, 10], style: 'amb' } };
  }
});
})(window.AV);
