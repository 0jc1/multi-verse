/* APEVERSE 2.2 NEW WORLDS - barcelona_gracia.js : BARCELONA district 2 = GRÀCIA, the old village at the top of Passeig de Gràcia.
   Joined to the Eixample on foot: every Eixample street that reaches Mallorca crosses the Diagonal (a tree-lined avenue) and continues
   as a Gràcia street (Gran de Gràcia continues Passeig de Gràcia; Verdi continues Rambla de Catalunya), plus the two edge streets.
   And by metro (Diagonal + Fontana stations on L3).
   Inside: Verdi, Gran de Gràcia, two lanes, Travessera de Gràcia, Carrer Gran, the north street; three squares — Plaça del Sol
   (bars, terraces, the night crowd), Plaça de la Vila (the clock tower), Plaça de la Virreina (the church).  Low three/four-storey
   village houses in bright stucco.  Businesses (fictional): Bar del Sol, Cinemes Verdi Simi, Vintage Gràcia (walk-in), Gra de Cafè
   (walk-in), Teteria Lluna, Vermuteria La Vila, Taller de Ceràmica (walk-in, throw a pot).  The FESTA MAJOR DE GRÀCIA: paper-decorated
   streets and a concert in Plaça del Sol (Tuesdays).  Plugs into world_barcelona.js (BCN.grSurf, BCN.gracia) and barcelona_life.js
   (BCN.graciaLife). */
'use strict';
(function (AV) {
const BCN = AV.barcelona; if (!BCN) return;
const PI = Math.PI, TAU = PI * 2, tr = AV.tr, L = (e, s) => [e, s], say = a => tr(a[0], a[1]);
const X0 = -197, X1 = 197, Z0 = -590, Z1 = -322;
BCN.grSurf = (x, z) => { if (z >= Z1) return undefined; if (x < X0 || x > X1 || z < Z0) return null; return 0 };
const SG = { r: {} }, NW = () => AV.nwkit, SANS = 'Arial, sans-serif', SERIF = 'Georgia, "Times New Roman", serif';
const rot = (top, sub, bg, fg, o) => (g, w, h) => { o = o || {}; g.fillStyle = bg; g.fillRect(0, 0, w, h); if (o.tiles) for (let x = 0; x < w; x += 16) { g.fillStyle = o.tiles[((x / 16) | 0) % o.tiles.length]; g.fillRect(x, 0, 16, 9); g.fillRect(x, h - 9, 16, 9) }
  g.strokeStyle = fg; g.lineWidth = 3; g.strokeRect(14, 14, w - 28, h - 28); g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; NW().fit(g, top, w - 70, h * .46, (o.font || '700 #px ') + (o.serif ? SERIF : SANS), sub ? h * .42 : h * .52, w / 2);
  if (sub) { g.fillStyle = o.subc || fg; NW().fit(g, sub, w - 90, h * .16, '600 #px ' + SANS, h * .78, w / 2) } };
const plaque = name => (g, w, h) => { g.fillStyle = '#eeeae2'; g.fillRect(0, 0, w, h); g.strokeStyle = '#8a8478'; g.lineWidth = 4; g.strokeRect(5, 5, w - 10, h - 10); g.fillStyle = '#2a2a2a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '600 13px ' + SANS; g.fillText('Gràcia', w / 2, 20); NW().fit(g, name, w - 24, 26, '700 #px ' + SERIF, 52, w / 2) };
const SIGNS = [
  ['grsol', 448, 112, rot('Bar del Sol', 'terrassa · cerveses · braves', '#f2a83a', '#2a1a0a')],
  ['grcine', 640, 128, (g, w, h) => { g.fillStyle = '#141414'; g.fillRect(0, 0, w, h); for (let x = 12; x < w; x += 22) { g.fillStyle = '#ffe08a'; g.beginPath(); g.arc(x, 9, 4, 0, TAU); g.arc(x, h - 9, 4, 0, TAU); g.fill() } g.fillStyle = '#ffe08a'; g.textAlign = 'center'; g.textBaseline = 'middle'; NW().fit(g, 'CINEMES VERDI SIMI', w - 70, 58, '900 #px ' + SANS, 54, w / 2); g.fillStyle = '#f4f0e0'; NW().fit(g, 'versió original · 16:00 — 24:00', w - 110, 22, '700 #px ' + SANS, 98, w / 2) }],
  ['grvint', 448, 112, rot('Vintage Gràcia', 'roba de segona mà', '#2a5a5a', '#f4e0b0', { serif: true })],
  ['grcafe', 448, 112, rot('Gra de Cafè', 'specialty coffee · torrat aquí', '#f4f0e8', '#2a1a12')],
  ['grte', 448, 112, rot('Teteria Lluna', 'tes del món · pastissos', '#3a2a5a', '#f4d890', { serif: true })],
  ['grvermut', 448, 112, rot('Vermuteria La Vila', 'vermut · conserves', '#7a1a1a', '#f4e0b0', { serif: true })],
  ['grtaller', 448, 112, rot('Taller de Ceràmica', 'classes · torn · forn', '#e8d8c0', '#6a3a1a', { tiles: ['#2a5a9a', '#e8a03a', '#3aa85a'] })],
  ['festa', 1024, 160, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); ['#ff4a8a', '#ffd84a', '#4ad8a8', '#8a4aff'].forEach((c, i) => gr.addColorStop(i / 3, c)); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#1a1a2a'; g.textAlign = 'center'; g.textBaseline = 'middle'; NW().fit(g, 'FESTA MAJOR DE GRÀCIA', w - 100, 80, '900 #px ' + SANS, 64, w / 2); NW().fit(g, 'carrers guarnits · concerts a la plaça del Sol', w - 160, 26, '800 #px ' + SANS, 130, w / 2) }],
  ['pl_verdi', 256, 80, plaque('Carrer de Verdi')], ['pl_sol', 256, 80, plaque('Plaça del Sol')], ['pl_vila', 256, 80, plaque('Plaça de la Vila')]];

BCN.gracia = function (ctx, E) {
  const K = AV.kit, BG = K.BG, rng = ctx.rng, grp = ctx.group, cols = ctx.cols, circ = ctx.circles, { row, blk, fill, box, P, Gl, Gs, sh, SPECIAL, ITF, bx2, IN, tree, lamp, metroE, road, pave } = E;
  const Q2 = [], sign2 = (k, x, y, z, w, h, ry, dbl) => { Q2.push({ k, x, y, z, w, h, ry }); if (dbl) Q2.push({ k, x: x - Math.sin(ry) * .03, y, z: z - Math.cos(ry) * .03, w, h, ry: ry + PI }) };
  /* ground */
  { const g = new THREE.PlaneGeometry(X1 - X0, Z1 - Z0); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (X1 - X0) / 2, uv.getY(i) * (Z1 - Z0) / 2); g.rotateX(-PI / 2);
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: pave, roughness: .9 })); m.position.set((X0 + X1) / 2, -.01, (Z0 + Z1) / 2); m.receiveShadow = true; m.material.userData.lin = 1; grp.add(m) }
  /* the Diagonal (z -330..-306): carriageway, tree-lined median and north sidewalk */
  road(X0, X1, -324, -312); const VXg = [-180.5, -171.5, -92, -46, -6, 6, 46, 92, 171.5, 180.5], near = (x, r) => VXg.some(v => Math.abs(x - v) < r) || Math.abs(x + 20) < 4;
  for (let x = -190; x < 192; x += 12) { if (near(x, 4)) continue; tree(x, -309, 9); tree(x, -328.8, 8) }
  /* the Gràcia streets */
  road(-4, 4, -574, -330); road(-183, 183, -412, -406); for (const x of [-176, 176]) road(x - 3.5, x + 3.5, -574, -330);
  for (const r of [[-96, -88, -574, -330], [-49, -43, -574, -330], [43, 49, -574, -330], [88, 96, -574, -330], [-183, 183, -494, -486], [-183, 183, -574, -566]]) box(P, 0x9a9080, r[0], r[1], 0, .018, r[2], r[3]);
  /* the specials */
  for (const s of [['grsol', 'gr01E', -450, 9], ['grcine', 'gr00E', -370, 14], ['grvint', 'gr10W', -360, 9, 8], ['grcafe', 'gr21E', -430, 9, 8], ['grte', 'gr41W', -460, 8], ['grvermut', 'gr30S', 25, 9], ['grtaller', 'gr52W', -520, 9, 8]]) SPECIAL.push(s);
  /* the blocks (three of them are squares) */
  const XC = [[-169, -96], [-88, -49], [-43, -8], [8, 43], [49, 88], [96, 169]], ZR = [[-404, -330], [-486, -414], [-566, -494]], GO = { h0: 11, hr: 4, shopP: .75, wmin: 6, wmax: 9, d: 11, modP: .15 };
  for (let c = 0; c < 6; c++) for (let r = 0; r < 3; r++) { if ((c === 1 || c === 3) && r === 1) continue; if (c === 4 && r === 2) continue; blk('gr' + c + r, XC[c][0], XC[c][1], ZR[r][0], ZR[r][1], GO) }
  row('grN', 'x', -574, X0, X1, 1, 16, { wmin: 10, wmax: 14, h0: 13, hr: 3, shopP: .4 });
  /* Plaça del Sol: open, a few trees at the edges, café tables */
  box(P, 0xd8c8a8, -88, -49, 0, .02, -486, -414); for (const [x, z] of [[-82, -480], [-55, -480], [-82, -420], [-55, -420]]) tree(x, z, 7);
  const TABLES = []; for (let i = 0; i < 8; i++) { const x = -80 + (i % 4) * 6.5, z = (i < 4 ? -462 : -438); P.push([BG.cyl, 0xd8d8d0, K.M(x, .74, z, .4, .04, .4), 0]); box(P, 0x8a8a8a, x - .05, x + .05, 0, .74, z - .05, z + .05); circ.push([x, z, .45]); TABLES.push([x, z]) }
  sign2('pl_sol', -88.2 + .1, 3.6, -470, 1.6, .5, PI / 2);
  /* Plaça de la Vila: paving, the clock tower */
  box(P, 0xd0c4a8, 8, 43, 0, .02, -486, -414); { const x = 32, z = -465; box(P, 0xc8b8a0, x - 2, x + 2, 0, 22, z - 2, z + 2); box(P, 0x9a8a6a, x - 2.3, x + 2.3, 22, 23, z - 2.3, z + 2.3); P.push([BG.cone, 0x6a5a4a, K.M(x, 25, z, 2, 4, 2, 0, PI / 4, 0), 0]); for (const [dx, dz, ry] of [[0, 2.02, 0], [0, -2.02, PI], [2.02, 0, PI / 2], [-2.02, 0, -PI / 2]]) { P.push([BG.cyl, 0xf4f0e0, K.M(x + dx, 18, z + dz, 1.3, .08, 1.3, PI / 2, ry, 0), 0]); box(P, 0x1a1a1a, x + dx - .05, x + dx + .05, 17.4, 18.6, z + dz - .05, z + dz + .05) } cols.push([x - 2, x + 2, z - 2, z + 2]); BCN.grTower = [x, z + 3.5] }
  sign2('pl_vila', 8.2, 3.6, -440, 1.6, .5, -PI / 2);
  /* Plaça de la Virreina: square + the church on its north side */
  box(P, 0xd8ccb0, 49, 88, 0, .02, -548, -494); { const st2 = 0xc8b494; box(P, st2, 52, 85, 0, 20, -566, -548); P.push([BG.cyl, 0x8a7a5e, K.M(68.5, 13, -547.9, 3.4, .3, 3.4, PI / 2, 0, 0), 0]); Gl.push([BG.cyl, 0xf2c230, K.M(68.5, 13, -547.8, 2.8, .2, 2.8, PI / 2, 0, 0), 0]); box(P, 0x2a2018, 66, 71, 0, 5.5, -548.05, -547.9); box(P, st2, 63, 74, 20, 30, -566, -556); P.push([BG.cone, 0x6a5a4a, K.M(68.5, 33, -561, 4, 6, 4, 0, PI / 4, 0), 0]); cols.push([52, 85, -566, -548]); fill(49, 52, -566, -548, 10, 2); fill(85, 88, -566, -548, 10, 2); BCN.grChurch = [68.5, -544] }
  for (const [x, z] of [[56, -500], [81, -500], [56, -540], [81, -540]]) tree(x, z, 7);
  /* metro L3: Diagonal (on the median) + Fontana (Plaça de la Vila) */
  metroE(-20, -309, 0); metroE(32, -431, 0); BCN.metro.diagonal = [-20, -307]; BCN.metro.fontana = [32, -429];
  /* Gràcia lamps along Verdi + Gran de Gràcia (wall brackets) */
  for (let z = -560; z < -335; z += 18) for (const x of [-95.6, -88.4, -7.6, 7.6]) box(Gl, 0xffe0a0, x - .2, x + .2, 4.2, 4.6, z - .2, z + .2);
  /* ---------- the Festa Major (decorated streets + a stage in Plaça del Sol), shown on festival days by graciaLife ---------- */
  const fest = new THREE.Group(); fest.visible = false; grp.add(fest); const FP = [], FQ = [];
  const PAPER = [0xff4a8a, 0xffd84a, 0x4ad8a8, 0x8a4aff, 0xff8a3a, 0x4a8aff];
  for (const [x0, x1] of [[-96, -88], [-49, -43]]) for (let z = -566, k = 0; z < -332; z += 3.2, k++) { FP.push([BG.box, PAPER[k % PAPER.length], K.M((x0 + x1) / 2, 6.3 + Math.sin(k) * .2, z, x1 - x0, .06, 1.6), 0]); if (k % 4 === 0) FP.push([BG.sph, PAPER[(k + 2) % PAPER.length], K.M((x0 + x1) / 2, 5.6, z, .9, .9, .9), 0]) }
  { const x = -60, z = -470; FP.push([BG.box, 0x1a1a1e, K.M(x, .5, z, 8, 1, 5), 0]); for (const [dx, dz] of [[-4, -2.5], [4, -2.5], [-4, 2.5], [4, 2.5]]) FP.push([BG.box, 0x3a3a3e, K.M(x + dx, 3, z + dz, .15, 6, .15), 0]); FP.push([BG.box, 0x2a2a2e, K.M(x, 6, z, 8.4, .3, 5.4), 0]); FQ.push({ k: 'festa', x, y: 5.3, z: z + 2.75, w: 7.6, h: 1.19, ry: 0 }) }
  FQ.push({ k: 'festa', x: -92, y: 7.4, z: -334, w: 7.6, h: 1.19, ry: PI }); FQ.push({ k: 'festa', x: -92, y: 7.4, z: -333.97, w: 7.6, h: 1.19, ry: 0 });
  BCN.grStage = [-60, -470]; BCN.grFest = fest; const fm = new THREE.Mesh(K.merge(FP), K.floraMat(0, { rough: .7 })); fm.material.userData.lin = 1; fest.add(fm);
  /* ---------- walk-ins ---------- */
  IN.grvint = ITF('grvint', it => { for (let k = 0; k < 3; k++) { bx2(P, 0xb8b8b8, it, 2 + k * 1.8, 2.1 + k * 1.8, 0, 1.7, -3, 3); for (let j = 0; j < 5; j++) bx2(P, [0x8a4a2a, 0x2a5a5a, 0xd8a050, 0x5a2a5a, 0x3a3a3a][(j + k) % 5], it, 1.8 + k * 1.8, 2.3 + k * 1.8, .7, 1.6, -2.6 + j * 1.2, -2 + j * 1.2) } bx2(P, 0x6a4a2a, it, 1, 1.7, 0, 1, 2.6, 3.8); it.cust = it.F(1.3, 2.2); it.staff = it.F(1.3, 3.4) });
  IN.grcafe = ITF('grcafe', it => { bx2(P, 0xd8d0c0, it, 1.2, 1.9, 0, 1.05, 1.8, 3.8); bx2(P, 0x3a3a3a, it, 1.3, 1.8, 1.05, 1.5, 3, 3.6); for (const f of [-2.8, -1]) { bx2(P, 0x8a6a4a, it, 4.4, 5, .72, .76, f, f + .6) } it.cust = it.F(2.6, 2.8); it.staff = it.F(.8, 2.8) });
  IN.grtaller = ITF('grtaller', it => { for (const f of [-2.6, -.6]) { bx2(P, 0x8a8a88, it, 3, 3.6, 0, .7, f, f + .6); bx2(P, 0xb8784a, it, 3.15, 3.45, .7, .85, f + .15, f + .45) } for (let k = 0; k < 8; k++) bx2(P, [0x2a5a9a, 0xe8a03a, 0x3aa85a, 0xc8281e][k % 4], it, it.depth - .5, it.depth - .3, .9 + (k >> 2) * .6, 1.2 + (k >> 2) * .6, -3 + (k % 4) * 1.4, -2.6 + (k % 4) * 1.4); bx2(P, 0x5a3a2a, it, 1, 1.7, 0, 1, 2.4, 3.6); it.cust = it.F(1.3, 1.8); it.staff = it.F(1.3, 3); it.wheel = it.F(3.3, -1.7) });
  /* own signs over the shopfronts */
  for (const k of ['grsol', 'grcine', 'grvint', 'grcafe', 'grte', 'grvermut', 'grtaller']) { const s = sh[k]; if (!s) continue; s.ownSign = true; const d = SIGNS.find(x => x[0] === k), w = Math.min(s.w - .6, 9); sign2(k, s.x + s.out[0] * .06, 4.1, s.z + s.out[1] * .06, w, w * d[2] / d[1], s.yaw) }
  if (sh.grcine) { const s = sh.grcine; for (let k = 0; k < 30; k++) box(Gl, 0xffe08a, s.x + s.out[0] * .7 + s.al[0] * (k - 15) * .45 - .07, s.x + s.out[0] * .7 + s.al[0] * (k - 15) * .45 + .07, 5.2, 5.34, s.z + s.out[1] * .7 + s.al[1] * (k - 15) * .45 - .07, s.z + s.out[1] * .7 + s.al[1] * (k - 15) * .45 + .07) }
  NW().makeAtlas(SIGNS, SG, 1024, 1024); const sm = new THREE.MeshStandardMaterial({ map: SG.tex, emissiveMap: SG.tex, emissive: 0xffffff, emissiveIntensity: .3, roughness: .6, alphaTest: .3 }); sm.userData.lin = 1; const sMesh = new THREE.Mesh(NW().quadGeo(Q2, SG.r), sm); sMesh.name = 'gr_signs'; grp.add(sMesh); fest.add(new THREE.Mesh(NW().quadGeo(FQ, SG.r), sm));
  ctx.upd.push(() => { const h = (AV.S.time / 60) % 24, n = h > 20.5 || h < 6 ? 1 : h > 19 ? (h - 19) / 1.5 : h < 7.5 ? (7.5 - h) / 1.5 : 0; sm.emissiveIntensity = .3 + .8 * n; sMesh.visible = AV.P.z < -250 });
  BCN.grStats = { signs: Q2.length, atlasOver: (SG.over || []).length, shops: ['grsol', 'grcine', 'grvint', 'grcafe', 'grte', 'grvermut', 'grtaller'].filter(k => sh[k]).length };
  /* ---------- map + walking lines ---------- */
  const roads = [[X0, -318, X1, -318, 12], [0, -330, 0, -574, 8], [-176, -330, -176, -574, 7], [176, -330, 176, -574, 7], [X0, -409, X1, -409, 6], [-92, -330, -92, -574, 5], [-46, -330, -46, -574, 4], [46, -330, 46, -574, 4], [92, -330, 92, -574, 5], [X0, -490, X1, -490, 5], [X0, -570, X1, -570, 5]];
  const places = [['gracia', 'Gràcia: Gran de Gràcia', 'Gràcia: Gran de Gràcia', 0, -450, PI], ['diagonal', 'Avinguda Diagonal', 'Avenida Diagonal', 0, -318, PI / 2], ['sol', 'Plaça del Sol', 'Plaza del Sol', -68.5, -450, 0], ['vila', 'Plaça de la Vila (clock tower)', 'Plaza de la Vila (torre del reloj)', 25.5, -450, 0], ['virreina', 'Plaça de la Virreina', 'Plaza de la Virreina', 68.5, -520, PI], ['verdi', 'Carrer de Verdi', 'Calle de Verdi', -92, -430, PI], ['travessera', 'Travessera de Gràcia', 'Travesera de Gràcia', 120, -409, PI / 2]];
  const NM = { grsol: 'Bar del Sol', grcine: 'Cinemes Verdi Simi', grvint: 'Vintage Gràcia', grcafe: 'Gra de Cafè', grte: 'Teteria Lluna', grvermut: 'Vermuteria La Vila', grtaller: 'Taller de Ceràmica' };
  for (const k in NM) { const s = sh[k]; if (s) places.push([k, NM[k], NM[k], s.x + s.out[0] * 3, s.z + s.out[1] * 3, Math.atan2(s.out[0], s.out[1]) + PI]) }
  const lines = []; for (const x of VXg) lines.push([[x, -303.5], [x, -570]]);
  lines.push([[-180.5, -327.5], [180.5, -327.5]], [[-180.5, -412.5], [180.5, -412.5]], [[-180.5, -405.5], [180.5, -405.5]], [[-180.5, -490], [180.5, -490]], [[-180.5, -570], [180.5, -570]]);
  lines.push([[-85, -483], [-52, -483], [-52, -417], [-85, -417], [-85, -483]], [[-92, -450], [-46, -450]], [[-68.5, -490], [-68.5, -412.5]]);
  lines.push([[11, -483], [40, -483], [40, -417], [11, -417], [11, -483]], [[6, -440], [46, -440]], [[18, -490], [18, -412.5]]);
  lines.push([[52, -545], [85, -545], [85, -497], [52, -497], [52, -545]], [[46, -520], [52, -520]], [[85, -520], [92, -520]], [[68.5, -497], [68.5, -490]]);
  return { roads, places, lines, TABLES, stn: { diagonal: L('Diagonal', 'Diagonal'), fontana: L('Fontana', 'Fontana') }, traffic: [[-180, -318, 180, -318, 3], [-180, -409, 180, -409, 1.5]] };
};

/* ======================= life ======================= */
const I = (id, o) => { if (!AV.ITEMS[id]) AV.ITEMS[id] = o };
I('es_te', { n: L('Pot of mint tea', 'Tetera de té moruno'), cat: 'drink', ic: '🫖', use: 'drink', fx: { type: 'sober', amt: .1 }, model: 'cup', col: 0x8ab84a, price: 4, say: L('Poured from a great height, sweet and fresh.', 'Servido desde muy alto, dulce y fresco.') });
I('es_flat', { n: L('Flat white', 'Flat white'), cat: 'drink', ic: '☕', use: 'drink', fx: { type: 'sober', amt: .2 }, model: 'cup', col: 0xc8a07a, price: 3, say: L('Beans roasted in the back room this morning.', 'Grano tostado esta mañana en la trastienda.') });
I('es_jaqueta', { n: L('Vintage denim jacket', 'Chaqueta vaquera vintage'), cat: 'souvenir', ic: '🧥', use: 'look', keep: true, model: 'card', col: 0x2a4a7a, price: 22, say: L('Someone else’s adventures, already worn in.', 'Las aventuras de otro, ya rodadas.') });
I('es_bol', { n: L('Your own ceramic bowl', 'Tu propio cuenco de cerámica'), cat: 'souvenir', ic: '🥣', use: 'look', keep: true, model: 'card', col: 0x2a5a9a, price: 0, say: L('Slightly wonky, glazed blue. You made it.', 'Algo torcido, esmaltado en azul. Lo hiciste tú.') });
I('es_conserves', { n: L('Tin of mussels in escabeche', 'Lata de mejillones en escabeche'), cat: 'food', ic: '🥫', use: 'eat', model: 'bowl', col: 0xc85a2a, price: 5, say: L('With crisps and a dash of the vermut’s own sauce.', 'Con patatas fritas y un chorrito de salsa.') });

BCN.graciaLife = function (ctx, E) {
  const S = AV.S, T = E.T, st = E.st, crowd = E.crowd, IN = E.IN, sh = E.sh, staff = E.staff, front = E.front, rng = ctx.rng, GR = BCN.GR;
  const hour = () => (S.time / 60) % 24, festOn = () => !!(AV.fest && AV.fest.active && AV.fest.active('festa_gracia')), gs = () => { const s = st(); s.gr = s.gr || { met: {}, q: {} }; return s.gr };
  const counterAt = (pt, V2, label, show) => { if (!pt) return null; Object.assign(V2, { x: pt[0], z: pt[1], reach: 5 }); return T(pt[0], pt[1], 2, () => tr(label[0], label[1]), () => AV.shop.open(V2), show || null, 'shop') };
  for (const k of ['grvint', 'grcafe', 'grtaller']) if (IN[k]) staff(IN[k].staff, 'woman', [0x2a5a5a, 0xf4f0e8, 0x6a3a1a][['grvint', 'grcafe', 'grtaller'].indexOf(k)]);
  /* Plaça del Sol: terrace sitters by day, the night crowd (20:00-03:00) */
  const V = ['woman', 'man', 'backpacker', 'tourist'], night = [], nightOn = () => { const h = hour(); return h >= 20 || h < 3 };
  for (const [x, z] of GR.TABLES.slice(0, [4, 6, 8][ctx.q])) crowd.add({ v: V[(x | 0) & 3], x: x + .75, z, mode: 'sit', yaw: -PI / 2 }).y = 0;
  for (let i = 0; i < [8, 12, 18][ctx.q]; i++) { const w = crowd.add({ v: V[i % 4], x: -84 + rng() * 30, z: -480 + rng() * 60, mode: i % 3 ? 'idle' : 'dance' }); w.yaw = rng() * TAU; w.vis = false; night.push(w) }
  const band = [], dancers = []; { const [sx, sz] = BCN.grStage; for (const [dx, mode] of [[-2.5, 'drum'], [0, 'idle'], [2.5, 'idle']]) { const w = crowd.add({ v: dx ? 'man' : 'woman', x: sx + dx, y: 1, z: sz - .5, mode, yaw: PI, cols: { skin: 0xd8a47a, hair: 0x1a1a1a, shirt: [0xff4a8a, 0x4ad8a8, 0xffd84a][band.length], pants: 0x1a1a1a } }); w.vis = false; band.push(w) }
    for (let i = 0; i < [8, 12, 18][ctx.q]; i++) { const w = crowd.add({ v: V[i % 4], x: sx - 10 + rng() * 20, z: sz + 6 + rng() * 10, mode: 'dance', yaw: PI }); w.vis = false; dancers.push(w) } }
  ctx.upd.push(() => { const n = nightOn(), f = festOn(); night.forEach(w => w.vis = n); band.forEach(w => w.vis = f && hour() >= 19); dancers.forEach(w => w.vis = f && hour() >= 19); BCN.grFest.visible = f; BCN.grStats.fest = f });
  /* residents: Marc (projectionist), Aina (ceramicist) */
  const PEOPLE = { marc: { n: 'Marc', role: L('projectionist at the Verdi', 'proyeccionista del Verdi'), v: 'man', cols: { skin: 0xf0d0b0, hair: 0x3a2a1a, shirt: 0x2a2a3a, pants: 0x1a1a1a }, sched: [[10, front('grcafe', 2)], [15, front('grcine', 2)], [0, [-68.5, -450]]] },
    aina: { n: 'Aina', role: L('ceramicist', 'ceramista'), v: 'woman', cols: { skin: 0xd8a47a, hair: 0x8a4a1a, shirt: 0xb8784a, pants: 0x3a3a52 }, sched: [[9, IN.grtaller ? IN.grtaller.cust : [68.5, -520]], [19, [68.5, -510]], [21, front('grsol', 2)]] } };
  const named = {}, slotOf = p => { const h = hour(); let s = null; for (const e of p.sched) if (e[0] <= h && (!s || e[0] > s[0])) s = e; if (!s) s = p.sched.reduce((a, e) => e[0] > a[0] ? e : a); return s };
  for (const [id, p] of Object.entries(PEOPLE)) { const s0 = slotOf(p), at = s0[1] || [-68.5, -450]; const w = crowd.add({ v: p.v, x: at[0], z: at[1], mode: 'idle', cols: p.cols }); named[id] = { p, w, slot: s0 }; named[id].t = T(w.x, w.z, 2, () => tr('Talk to ', 'Hablar con ') + p.n + ' (' + say(p.role) + ')', () => talk(id)) }
  ctx.upd.push(() => { for (const id in named) { const o = named[id], s = slotOf(o.p); if (s !== o.slot && s[1]) { o.slot = s; o.w.x = s[1][0]; o.w.z = s[1][1] } o.t.x = o.w.x; o.t.z = o.w.z } });
  /* shops + things to do */
  counterAt(front('grsol', 1.4), { id: 'bcn_grsol', name: L('Bar del Sol', 'Bar del Sol'), greet: L('“A caña, braves, and a seat in the sun — or under the stars.”', '“Una caña, bravas y un sitio al sol… o bajo las estrellas.”'), items: [['es_vermut', 4], ['es_bravas', 5], ['es_cava', 5], ['water', 1]] }, L('🍻 Bar del Sol (terrace on the plaça)', '🍻 Bar del Sol (terraza en la plaza)'));
  counterAt(IN.grcafe && IN.grcafe.cust, { id: 'bcn_grcafe', name: L('Gra de Cafè', 'Gra de Cafè'), greet: L('“Flat white? Ethiopian beans this week.”', '“¿Flat white? Esta semana, grano etíope.”'), items: [['es_flat', 3], ['es_cafe', 2], ['es_ensaimada', 3]] }, L('☕ Gra de Cafè (walk-in)', '☕ Gra de Cafè (entra)'));
  counterAt(IN.grvint && IN.grvint.cust, { id: 'bcn_grvint', name: L('Vintage Gràcia', 'Vintage Gràcia'), greet: L('“Everything is one of a kind. Literally.”', '“Todo es pieza única. Literalmente.”'), items: [['es_jaqueta', 22], ['es_mocador', 18]].filter(([i]) => AV.ITEMS[i]) }, L('🧥 Vintage Gràcia (walk-in)', '🧥 Vintage Gràcia (entra)'));
  counterAt(front('grte', 1.4), { id: 'bcn_grte', name: L('Teteria Lluna', 'Teteria Lluna'), greet: L('“Mint tea, poured from high up. Pastries from Fez.”', '“Té con menta, servido desde lo alto. Pastas de Fez.”'), items: [['es_te', 4], ['es_coca', 3]] }, L('🫖 Teteria Lluna', '🫖 Teteria Lluna'));
  counterAt(front('grvermut', 1.4), { id: 'bcn_grvermut', name: L('Vermuteria La Vila', 'Vermuteria La Vila'), greet: L('“Vermut, a tin of mussels, crisps. The holy trinity.”', '“Vermú, una lata de mejillones, patatas. La santísima trinidad.”'), items: [['es_vermut', 4], ['es_conserves', 5], ['es_olives', 2]] }, L('🍷 Vermuteria La Vila', '🍷 Vermuteria La Vila'));
  { const p2 = front('grcine', 1.4); if (p2) T(p2[0], p2[1], 2.2, () => { const h = hour(); return h >= 16 ? tr('🎬 Cinemes Verdi Simi: watch a film, original version (7)', '🎬 Cinemes Verdi Simi: ver una película en versión original (7)') : tr('🎬 Cinemes Verdi Simi: sessions 16:00-24:00', '🎬 Cinemes Verdi Simi: sesiones de 16:00 a 24:00') },
    () => { if (hour() < 16) return AV.toast(tr('The ticket window opens at four.', 'La taquilla abre a las cuatro.')); if (!AV.txn(-7, 'Cinema')) return; AV.fadeTo(1, 300); setTimeout(() => { S.time = (S.time + 105) % 1440; gs().film = (gs().film || 0) + 1; AV.vitals && AV.vitals.add(4, 10); AV.fadeTo(0, 500); AV.toast(tr('🎬 A subtitled film about a lighthouse keeper. Half the room cries. Marc waves from the projection booth.', '🎬 Una película subtitulada sobre un farero. Media sala llora. Marc saluda desde la cabina.')) }, 350) }, null, 'venue') }
  if (IN.grtaller) T(IN.grtaller.wheel[0], IN.grtaller.wheel[1], 1.8, () => tr('🏺 Throw a pot on the wheel (6)', '🏺 Tornear una pieza (6)'), () => { if (!AV.txn(-6, 'Ceramics')) return; AV.fadeTo(1, 300); setTimeout(() => { S.time = (S.time + 60) % 1440; gs().pots = (gs().pots || 0) + 1; AV.bag.add('es_bol', 1, true); AV.fadeTo(0, 500); AV.toast(tr('🏺 Clay everywhere. Aina rescues it twice. Your bowl comes out of the kiln slightly wonky and very blue.', '🏺 Barro por todas partes. Aina la salva dos veces. Tu cuenco sale del horno algo torcido y muy azul.')) }, 350) }, null, 'game');
  if (BCN.grTower) T(BCN.grTower[0], BCN.grTower[1], 2.2, () => tr('🕰️ The clock tower of Plaça de la Vila', '🕰️ La torre del reloj de la plaza de la Vila'), () => AV.toast(tr('🕰️ It chimes the hour a little late, as it always has. Nobody minds.', '🕰️ Da la hora con un poco de retraso, como siempre. A nadie le importa.')), null, 'look');
  if (BCN.grChurch) T(BCN.grChurch[0], BCN.grChurch[1], 2.2, () => tr('⛪ The Virreina church', '⛪ La iglesia de la Virreina'), () => AV.toast(tr('⛪ Kids play football against its walls; the priest pretends not to see.', '⛪ Los niños juegan a fútbol contra sus muros; el cura hace como que no los ve.')), null, 'look');
  { const [sx, sz] = BCN.grStage; T(sx, sz + 7, 2.6, () => tr('🎉 Dance at the Festa Major', '🎉 Bailar en la Festa Major'), () => { const s = gs(); s.festa = (s.festa || 0) + 1; AV.vitals && AV.vitals.add(-3, 14); AV.toast(tr('🎉 Paper streamers overhead, a brass band, the whole square dancing a sardana that turns into rumba.', '🎉 Serpentinas de papel, una charanga, toda la plaza bailando una sardana que acaba en rumba.')) }, () => festOn() && hour() >= 19, 'venue') }
  /* conversations */
  const TK = AV.talk, setL = (en, es) => { const e = document.getElementById('tkL'); e && (e.textContent = tr(en, es)) }, goto = (x, z, n) => { AV.minimap && AV.minimap.setDest && AV.minimap.setDest(x, z, n) };
  function talk(id) { const o = named[id]; if (!o || !TK) return; const s = gs(); s.met[id] = (s.met[id] || 0) + 1;
    const O = { marc: [{ label: L('What’s on tonight?', '¿Qué echan esta noche?'), say: L('“A Korean thriller, a French comedy, and a documentary about bees. All in original version.”', '“Un thriller coreano, una comedia francesa y un documental sobre abejas. Todo en versión original.”') },
        { label: L('Is Gràcia a village?', '¿Gràcia es un pueblo?'), say: L('“It was, until the Eixample swallowed the fields. We still act like one.”', '“Lo era, hasta que el Eixample se tragó los campos. Seguimos actuando como uno.”') },
        { label: L('Where do people go after the film?', '¿Adónde va la gente después del cine?'), say: L('“Plaça del Sol. Everyone, always.”', '“A la plaza del Sol. Todo el mundo, siempre.”') },
        { label: L('Show me the cinema', 'Enséñame el cine'), fn: () => { AV.closePanel('cmp'); const p2 = front('grcine', 1.4); p2 && goto(p2[0], p2[1], 'Cinemes Verdi Simi') } }],
      aina: [{ label: L('What do you make?', '¿Qué haces?'), say: L('“Bowls, mostly. Blue ones. The sea gets into everything here.”', '“Cuencos, sobre todo. Azules. Aquí el mar se mete en todo.”') },
        { label: L('Can I try?', '¿Puedo probar?'), say: L('“Of course. Six credits, an apron, and patience.”', '“Claro. Seis créditos, un delantal y paciencia.”') },
        { label: L('What’s the Festa Major?', '¿Qué es la Festa Major?'), say: () => festOn() ? L('“It’s now! Look up — every street decorated by its neighbours.”', '“¡Es ahora! Mira arriba: cada calle decorada por sus vecinos.”') : L('“Every Tuesday here: the neighbours decorate the streets and there’s a concert in Plaça del Sol.”', '“Aquí, cada martes: los vecinos decoran las calles y hay concierto en la plaza del Sol.”') },
        { label: L('Take me to the workshop', 'Llévame al taller'), fn: () => { AV.closePanel('cmp'); if (IN.grtaller) goto(IN.grtaller.cust[0], IN.grtaller.cust[1], 'Taller de Ceràmica') } }] }[id];
    TK.open({ id: 'bcn_' + id, name: o.p.n + ' · ' + say(o.p.role), first: L('“Ei! Sóc ' + o.p.n + '.”', '“¡Ei! Soy ' + o.p.n + '.”'), back: L('“Tornes? Gràcia enganxa.”', '“¿Vuelves? Gràcia engancha.”'), opts: O.map(x => Object.assign({}, x, { say: typeof x.say === 'function' ? x.say() : x.say })) }) }
  GR.talk = talk; GR.named = named;
};
addEventListener('load', () => { const F = AV.fest; if (F && F.LIST && !F.LIST.festa_gracia) F.LIST.festa_gracia = { w: 'barcelona', where: L('Barcelona: the decorated streets of Gràcia, Plaça del Sol', 'Barcelona: las calles decoradas de Gràcia, la plaza del Sol'), wd: 1, h: 18, len: 8 * 60, n: L('Festa Major de Gràcia', 'Festa Major de Gràcia'), head: { h: 22, len: 120, n: L('Concert in Plaça del Sol', 'Concierto en la plaza del Sol') } } });
})(window.AV);
