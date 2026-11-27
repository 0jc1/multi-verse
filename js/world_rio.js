/* APEVERSE 2.2 GLOBAL WORLDS - world_rio.js : RIO DE JANEIRO, district 1: COPACABANA + LEME (agent 4).  Network: rio_plan.js; dressing:
   gw_city.js (tower blocks + a few older low houses); life + Carnaval de rua: rio_life.js.
   Street level: 1940s-60s apartment blocks (art deco, ribbon windows, tiled, brise-soleil facades, balconies) over shops and lobbies;
   the black-and-white wave mosaic of the calçadão; beach kiosks, umbrellas, volleyball nets, lifeguard posts; the Copacabana Palace;
   the Forte on its point; the Pedra do Leme and the fishermen's path; green morros behind; the Sugar Loaf out to sea.  AV.rio */
'use strict';
(function (AV) {
const TAU = Math.PI * 2, L = (e, s) => [e, s], GW = AV.gwkit, PLAN = AV.rioPlan, PT = GW.paint;
const RIO = AV.rio = { stats: {} }, SG = RIO.SG = { r: {} };
const neonSign = (top, sub, c1, c2, bg) => (g, w, h) => { g.fillStyle = bg || '#101018'; g.fillRect(0, 0, w, h); g.shadowColor = c1; g.shadowBlur = 14; g.fillStyle = c1; g.textAlign = 'center'; g.textBaseline = 'middle'; GW.fit(g, top, w - 60, h * .5, '900 #px "Arial Black", Arial, sans-serif', h * .42, w / 2); g.shadowColor = c2; g.fillStyle = c2; GW.fit(g, sub, w - 70, h * .16, '700 #px Arial, sans-serif', h * .8, w / 2); g.shadowBlur = 0 };
const SIGNS = RIO.SIGNS = [
  ['pandeiro', 768, 160, (g, w, h) => { g.fillStyle = '#1a0e08'; g.fillRect(0, 0, w, h); g.fillStyle = '#e8b040'; g.beginPath(); g.arc(80, h / 2, 46, 0, 7); g.fill(); g.fillStyle = '#1a0e08'; g.beginPath(); g.arc(80, h / 2, 36, 0, 7); g.fill(); g.fillStyle = '#e8b040'; for (let k = 0; k < 10; k++) { const a = k / 10 * TAU; g.beginPath(); g.arc(80 + Math.cos(a) * 41, h / 2 + Math.sin(a) * 41, 5, 0, 7); g.fill() } g.textAlign = 'center'; g.textBaseline = 'middle'; GW.fit(g, 'Bar do Pandeiro', w - 200, 66, 'italic 900 #px Georgia, serif', 66, w / 2 + 60); g.fillStyle = '#f4e2b8'; GW.fit(g, 'RODA DE SAMBA · chope gelado · desde 1968', w - 220, 22, '700 #px Arial, sans-serif', 118, w / 2 + 60) }],
  ['sucos', 768, 160, (g, w, h) => { const c = ['#f2a020', '#3aa85a', '#e83a5a', '#8a3ad8', '#f2d040']; for (let i = 0; i < 10; i++) { g.fillStyle = c[i % 5]; g.fillRect(i * w / 10, 0, w / 10 + 1, h) } g.fillStyle = 'rgba(255,255,255,.92)'; GW.rr(g, 40, 22, w - 80, h - 44, 18); g.fill(); g.fillStyle = '#1a6a3a'; g.textAlign = 'center'; g.textBaseline = 'middle'; GW.fit(g, 'Casa dos Sucos', w - 140, 64, '900 #px "Arial Black", Arial, sans-serif', 66, w / 2); g.fillStyle = '#e83a5a'; GW.fit(g, 'AÇAÍ · COCO · SUCOS NATURAIS · SANDUÍCHES', w - 160, 20, '700 #px Arial, sans-serif', 112, w / 2) }],
  ['churrascaria', 768, 160, PT.gold('Churrascaria Gaúcha', 'rodízio · picanha · fraldinha · buffet de saladas', '#2a0e08', '#d8a040')],
  ['chinelos', 768, 160, neonSign('CHINELOS COPACABANA', 'sandálias · cangas · biquínis · sungas', '#ffe680', '#4ad8ff', '#0e2a4a')],
  ['musica', 768, 160, PT.painted('Sambaqui Instrumentos', 'pandeiros · tamborins · cavaquinhos · surdos', '#1a3a7a', '#f4e8c8')],
  ['padaria', 768, 160, PT.plain('PADARIA DO LEME', 'pão de queijo · pão na chapa · cafezinho', '#f4ead8', '#8a2a1a', '#8a2a1a', '900 #px Georgia, serif')],
  ['palace', 1024, 128, (g, w, h) => { g.fillStyle = '#f4f2ea'; g.fillRect(0, 0, w, h); g.fillStyle = '#1a1a1a'; g.textAlign = 'center'; g.textBaseline = 'middle'; GW.fit(g, 'COPACABANA PALACE', w - 120, 70, '400 #px Georgia, serif', h / 2, w / 2) }],
  ['quiosque', 384, 96, neonSign('Quiosque Posto 4', 'coco · caipirinha · mate · biscoito', '#ffe680', '#ff6a9a', '#0e3a2a')],
  ['carnaval', 1024, 192, (g, w, h) => { const c = ['#f2d040', '#3aa85a', '#e83a5a', '#2a8ad8', '#ff7a1a']; g.fillStyle = '#12104a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 160; i++) { g.fillStyle = c[i % 5]; g.save(); g.translate(Math.random() * w, Math.random() * h); g.rotate(Math.random() * 3); g.fillRect(-5, -2, 10, 4); g.restore() } g.fillStyle = '#ffe680'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = '#ff4ab0'; g.shadowBlur = 16; GW.fit(g, 'BLOCO DO MACACO FELIZ', w - 100, 96, '900 #px "Arial Black", Arial, sans-serif', h * .44, w / 2); g.shadowBlur = 0; g.fillStyle = '#f8f4ea'; GW.fit(g, 'Carnaval de rua · Copacabana', w - 160, 30, 'italic 700 #px Georgia, serif', h * .82, w / 2) }],
  ['g_farmacia', 512, 112, PT.plain('DROGARIA', 'farmácia 24h', '#f4f4f0', '#1a6a3a', '#e83a3a', '900 #px Arial, sans-serif')],
  ['g_lanchonete', 512, 112, neonSign('Lanchonete Arpoador', 'pastel · caldo de cana', '#ffe680', '#ff6a3a')],
  ['g_botequim', 512, 112, PT.painted('Botequim do Leme', 'chope · petiscos', '#1a3a7a', '#f4ead8')],
  ['g_banca', 512, 112, PT.plain('BANCA DE JORNAL', 'revistas · água · chiclete', '#1a3a7a', '#f2d040', '#f2d040', '800 #px Arial, sans-serif')],
  ['g_moda', 512, 112, neonSign('Moda Praia', 'biquínis · sungas', '#ff9ac8', '#4ad8ff')],
  ['g_otica', 512, 112, PT.plain('ÓTICA', 'óculos de sol · lentes', '#f4f4f4', '#1a1a1a', '#2a8ad8', '800 #px Arial, sans-serif')],
  ['g_salao', 512, 112, PT.plain('SALÃO DE BELEZA', 'cabelo · unhas', '#f4e8f0', '#b0306a', '#b0306a', '800 #px Georgia, serif')],
  ['g_sorveteria', 512, 112, PT.plain('SORVETERIA', 'açaí na tigela · sorvetes', '#f4e8f0', '#6a2a8a', '#3aa85a', '900 #px Georgia, serif')],
  ['g_livraria', 512, 112, PT.gold('Livraria Atlântica', 'livros · discos', '#1a2238')],
  ['g_cambio', 512, 112, PT.plain('CASA DE CÂMBIO', 'dólar · euro', '#1a3a1a', '#f2d040', '#f2d040', '800 #px Arial, sans-serif')],
  ['g_supermercado', 512, 112, PT.plain('MERCADINHO', 'hortifruti · bebidas', '#e83a3a', '#ffffff', '#f2d040', '900 #px Arial, sans-serif')],
  ['g_bar', 512, 112, neonSign('Bar Bossa', 'caipirinha · chope', '#4ad8ff', '#ffe680')]
].concat(GW.WINDOWS).concat(GW.FACADES).concat(GW.plaques(PLAN.streets.map(s => [s[0], s[4][0]]).concat(PLAN.plazas.map(p => [p[0], p[2][0]])), { border: '#1a3a7a', accent: '#f2d040', ink: '#f8f4ea', bg: '#1a3a7a' }));
const GEN = SIGNS.filter(s => /^g_/.test(s[0])).map(s => s[0]);
const WIN = { g_farmacia: 'w_goods', g_lanchonete: 'w_tapas', g_botequim: 'w_tapas', g_banca: 'w_books', g_moda: 'w_dress', g_otica: 'w_goods', g_salao: 'w_goods', g_sorveteria: 'w_sweets', g_livraria: 'w_books', g_cambio: 'w_goods', g_supermercado: 'w_goods', g_bar: 'w_tapas' };
const LOW = { walls: [0xf4f0e6, 0xe8c880, 0xa8d0c8, 0xe8a890, 0xf0e0b0], trim: [0xf8f6f0, 0xd8c8a0], base: [0x8a8478], shutter: [0x2a5a3a, 0x2a4a7a], door: [0x3a2414], iron: 0x18181a, roof: 'flat', floors: [2, 3], fh: 3.3, balcony: .5, cierro: 0, reja: true, pots: .4, mirador: 0 };
const TOWER = { walls: [0xf4efe6, 0xe8d0a8, 0x9ac8c0, 0xf2e6c0, 0xe8a890, 0xd8dce4, 0xf0d878, 0xb8a898], floors: [7, 12], fh: 3, facades: ['f_0', 'f_1', 'f_2', 'f_3', 'f_4', 'f_5', 'f_6', 'f_7'] };
const wave = () => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); g.fillStyle = '#f4f2ea'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#1a1a1a'; for (let row = -1; row < 5; row++) { g.beginPath(); for (let x = 0; x <= 256; x += 4) { const y = row * 64 + 32 + Math.sin(x / 256 * TAU * 2) * 18; x ? g.lineTo(x, y) : g.moveTo(x, y) } for (let x = 256; x >= 0; x -= 4) g.lineTo(x, row * 64 + 32 + Math.sin(x / 256 * TAU * 2) * 18 + 30); g.closePath(); g.fill() } const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / 4, 1 / 4); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t };   /* the calçadão's wave mosaic */
AV.registerWorld({
  id: 'rio',
  build(ctx) {
    const K = AV.kit, BG = K.BG, q = ctx.q, grp = ctx.group, rng = GW.rng((ctx.seed || 1) * 47 + 9), M = K.M, t0 = performance.now(), S = AV.S, H = PLAN.height;
    const N = RIO.N = PLAN.net(), lots = N.lots(GW.rng(19), { wmin: 8, wmax: 13, dmax: 16 });
    const T = (x, z, r, label, fn, show, kind) => { const t = { x, z, r, label, fn, show, kind }; ctx.T.push(t); return t };
    const st = () => { S.rio = S.rio || { met: {}, q: {}, rides: 0 }; return S.rio };
    RIO.ctx = ctx; RIO.T = T; RIO.st = st;
    const d = RIO.d = GW.dress(ctx, { N, lots, rng, q, name: 'rio', GEN, WIN, styleFor: () => LOW, buildingFor: l => (l.y || 0) > .5 || rng() < .12 ? 'low' : 'tower', towerStyle: TOWER,
      SPECIAL: [['pandeiro', 'x50', [50, 0], 8, 7, 'w_tapas'], ['sucos', 'copacabana', [-100, 24], 0, 6, 'w_sweets'], ['churrascaria', 'copacabana', [150, 22], 9, 8, 'w_tapas'], ['chinelos', 'copacabana', [-200, 22], 0, 6, 'w_dress'], ['musica', 'barata', [0, -36], 0, 6, 'w_goods'], ['padaria', 'x250', [250, 0], 0, 6, 'w_sweets']],
      interiorLook: k => k === 'pandeiro' ? { dado: [0x8a2a1a, 0xe8b040], wall: 0xe8d8b0, floor: 0x6a4a2a } : { dado: [0x2a6a3a, 0xf2d040], wall: 0xf4f0e6, floor: 0x8a5a3a },
      walkIn: (k, it, put, putG, blk) => { const w = it.w, hd = it.hd;
        if (k === 'pandeiro') { put(BG.box, 0x3a2414, -w / 2 + 1.1, .55, -hd / 2 - .5, .8, 1.1, hd - 2.6); blk(-w / 2 + .5, -w / 2 + 1.6, -hd + .9, -1.4); put(BG.box, 0x5a3a24, 1, .38, -hd + 2.4, 2.4, .76, 2.4); blk(-.4, 2.4, -hd + 1, -hd + 3.8); for (const [x, z] of [[-.2, -hd + 2.4], [2.2, -hd + 2.4], [1, -hd + 1.1]]) put(BG.box, 0x2a1a10, x, .25, z, .5, .5, .5); it.roda = GW.localPt(it.base, 1, -hd + 2.4); it.counter = GW.localPt(it.base, -w / 2 + 2.3, -hd / 2); it.staff = GW.localPt(it.base, -w / 2 + .7, -hd / 2 - .5) }
        else { put(BG.box, 0x5a2a14, -w / 2 + 1.4, .5, -hd / 2, 1.6, 1, hd - 3); blk(-w / 2 + .5, -w / 2 + 2.3, -hd + 1.5, -1.6); putG(BG.box, 0xff6a2a, -w / 2 + 1.4, 1.1, -hd / 2, 1, .1, hd - 3.4, 1); for (const [x, z] of [[0, -hd + 2], [w / 2 - 1.4, -hd + 2], [w / 2 - 1.4, -hd + 4.4]]) { put(BG.box, 0xe8e0d0, x, .74, z, 1.2, .06, 1.2); blk(x - .7, x + .7, z - .7, z + .7) } it.counter = GW.localPt(it.base, -w / 2 + 2.9, -hd / 2); it.staff = GW.localPt(it.base, -w / 2 + .7, -hd / 2) } },
      ground: { base: GW.tex.setts('#9a9488'), plaza: GW.tex.slabs(205), open: GW.tex.sand('#ecd8a8') }, hill: [PLAN.bounds.x0, PLAN.bounds.x1, PLAN.bounds.z0, -100], hillTex: GW.tex.sand('#4a7a3a'),
      sea: { deep: 0x1a5a7a, shallow: 0x4ab0c8, sky: 0xd8ecf4, opacity: .95, iri: .06 }, seaY: -1.2, noQuay: (a, b) => a[1] > 100 && b[1] > 100 && a[0] > -310 && b[0] < 320,
      treesOn: s => s.id === 'atlantica' || s.id === 'copacabana', palmsOn: s => s.id === 'atlantica', plazaPalms: p => p.id === 'praca_lido', fruit: null, treeCols: [0x2a6a2a, 0x3a7a34, 0x2e6226],
      skipFiller: (x, z) => H(x, z) > 1.5, extraTrees: (() => { const t = []; for (let x = -340; x < 340; x += 11) for (let z = -205; z < -112; z += 11) t.push([x + ((z * 7) % 5), z]); return t })(), treeScale: 1.4,
      fillerWall: () => 0xe8e0d0, fillerCap: 0x8a8a8a, fillerBase: 0x8a8478, awning: .3, awningCols: [[0x2a8ad8, 0xf4f0e6], [0xf2d040, 0x2a8a4a], [0xe83a5a, 0xf4f0e6], [0x3aa85a, 0xf4f0e6]], lanterns: .05 });
    const { P, Gl, Gs, D, Q, FP, FQ, FG, box, obox, sign } = d; RIO.stats.towers = lots.filter(l => l.tower).length;
    /* the calçadão: the wave mosaic over its strip */
    { const s = N.streets.find(x => x.id === 'calcadao'), pts = s.pts, poly = pts.map(p => [p[0], p[1] - s.w / 2]).concat(pts.slice().reverse().map(p => [p[0], p[1] + s.w / 2])); const sh = new THREE.Shape(poly.map(p => new THREE.Vector2(p[0], -p[1]))), g = new THREE.ShapeGeometry(sh); g.rotateX(-Math.PI / 2); const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: wave(), roughness: .8 })); m.position.y = .02; m.material.userData.lin = 1; m.name = 'rio_calcadao'; grp.add(m) }
    /* beach furniture: kiosks, lifeguard posts, umbrellas, volleyball nets, fishermen's boats at Posto 6 */
    const kiosks = []; for (const [x, n] of [[-220, 6], [-60, 4], [100, 3], [250, 1]]) { const z = 126 + (x > 200 ? -4 : 0); box(P, 0x2a6a4a, x - 2, x + 2, 0, 2.6, z - 1.5, z + 1.5); box(P, 0xf4f0e6, x - 2.6, x + 2.6, 2.6, 2.8, z - 2.2, z + 2.2); sign('quiosque', x, 2.2, z - 1.55, 3.6, .9, Math.PI); N.block(GW.rectPoly(x - 2, x + 2, z - 1.5, z + 1.5)); kiosks.push({ x, z: z - 3, n }) } RIO.kiosks = kiosks;
    for (let i = 1; i <= 6; i++) { const x = 300 - i * 95, z = 150; box(P, 0xf4f0e6, x - .1, x + .1, 0, 4, z - .1, z + .1); box(P, 0xe8803a, x - 1.2, x + 1.2, 4, 5.2, z - 1.2, z + 1.2); N.blockCircle(x, z, .3) }
    const uc = [0xe83a5a, 0xf2d040, 0x2a8ad8, 0x3aa85a, 0xf4f0e6, 0xff7a1a]; for (let i = 0; i < [30, 60, 90][q]; i++) { const x = -290 + rng() * 580, z = 134 + rng() * 26; if (N.code(x, z) !== 3) continue; P.push([BG.cyl, 0xe8e4dc, M(x, 1.1, z, .03, 2.2, .03), 0], [BG.cone, uc[i % 6], M(x, 2.3, z, 1.2, .5, 1.2), 0]); D.push([BG.box, uc[(i + 2) % 6], M(x + .6, .03, z + .4, .7, .02, 1.6), 0]) }
    for (const x of [-140, 40, 200]) { for (const sd of [-4, 4]) box(P, 0x2a2a2a, x + sd - .05, x + sd + .05, 0, 2.4, 146 - .05, 146 + .05); box(P, 0xf4f4f4, x - 4, x + 4, 1.6, 2.4, 145.98, 146.02) } RIO.courts = [[-140, 146], [40, 146], [200, 146]];
    for (let i = 0; i < 5; i++) { const x = -286 + i * 5, z = 150; P.push([BG.box, [0x2a6ad8, 0xe83a5a, 0xf2d040, 0x3aa85a, 0xf4f0e6][i], M(x, .4, z, 1.6, .6, 4.5, 0, .2, 0), 0]) }
    /* the Copacabana Palace */
    { const wh = 0xf6f4ec; box(P, wh, -44, -6, 0, 22, 48, 92); box(P, 0xe8e2d4, -44.3, -5.7, 0, 1.2, 47.7, 92.3); for (let y = 4; y < 21; y += 3.2) for (let x = -42; x < -7; x += 2.6) { box(P, 0xe8e4dc, x, x + 1.6, y, y + .2, 92, 92.6); box(Gl, 0xfff0c8, x + .2, x + 1.4, y + .4, y + 2.2, 92.04, 92.1, 1) } for (let x = -40; x < -8; x += 4) box(P, 0xe8e2d4, x - .3, x + .3, 0, 4, 92.2, 92.8); box(P, wh, -45, -5, 21.6, 23, 47, 93); sign('palace', -25, 19, 92.7, 18, 2.25, 0) }
    /* the Forte de Copacabana + the Pedra do Leme + the Sugar Loaf out to sea */
    { const c = [-336, 160], fc = 0xc8b890; for (let k = 0; k < 14; k++) { const a = k / 14 * TAU, b2 = (k + 1) / 14 * TAU; obox(P, fc, c[0] + Math.cos(a) * 11, c[1] + Math.sin(a) * 11, c[0] + Math.cos(b2) * 11, c[1] + Math.sin(b2) * 11, 1.6, -2, 4) } box(P, 0x5a6a5a, c[0] - 4, c[0] + 4, 0, 5, c[1] + 6, c[1] + 10); P.push([BG.hem, 0x6a7a6a, M(c[0], 5, c[1] + 8, 3.6, 2.6, 3.6), 0]); box(P, 0x2a2a2a, c[0] - .2, c[0] + .2, 5.8, 6.4, c[1] + 2, c[1] + 8) }
    { const R = PLAN.solids.find(s => s[0] === 'pedra_leme')[1]; let cx = 0, cz = 0; for (const p of R) { cx += p[0]; cz += p[1] } cx /= R.length; cz /= R.length; for (let k = 0; k < 9; k++) { const a = k / 9 * TAU; P.push([BG.ico, k % 2 ? 0x6a6a5a : 0x5a6a4a, M(cx + Math.cos(a) * 8, 10 + (k % 3) * 8, cz + Math.sin(a) * 30, 14, 22 + (k % 3) * 6, 14), 0]) } P.push([BG.ico, 0x3a6a2a, M(cx, 34, cz, 14, 10, 30), 0]) }
    { const sx = 520, sz = 330; P.push([BG.ico, 0x5a6a5a, M(sx, 40, sz, 60, 120, 50), 0], [BG.ico, 0x3a5a2a, M(sx - 20, 20, sz + 10, 70, 40, 60), 0], [BG.ico, 0x5a6a5a, M(sx - 140, 25, sz + 20, 45, 60, 40), 0]) }
    /* Carnival: the bloco's decorations along Atlântica (bunting, streamers), a trio elétrico truck (animated by the life file) */
    { const s = N.streets.find(x => x.id === 'atlantica'), cc = [0xf2d040, 0x3aa85a, 0xe83a5a, 0x2a8ad8, 0xff7a1a]; for (let i = 0; i + 1 < s.pts.length; i++) { const [a, b] = [s.pts[i], s.pts[i + 1]], Ls = Math.hypot(b[0] - a[0], b[1] - a[1]); for (let t = 5; t < Ls; t += 8) { const x = a[0] + (b[0] - a[0]) * t / Ls, z = a[1] + (b[1] - a[1]) * t / Ls; for (let k = 0; k < 9; k++) FP.push([BG.cone, cc[(k + i) % 5], M(x, 7 - Math.sin((k + .5) / 9 * Math.PI) * 1.2, z - 9 + k * 2.25, .3, .5, .04, Math.PI, Math.PI / 2, 0), 0]) } } FQ.push({ k: 'carnaval', x: 0, y: 8, z: 96.9, w: 14, h: 2.6, ry: 0 }) }
    const F = RIO.F = GW.finish(ctx, d, { SG, SIGNS, name: 'rio' }); RIO.festG = F.fest; RIO.festGlowM = F.festGlowM;
    Object.assign(RIO.stats, d.stats); RIO.lots = lots; RIO.shops = d.SH; RIO.interiors = d.IN;
    if (RIO.life) try { RIO.life(ctx, { N, T, st, SH: d.SH, IN: d.IN, kiosks }) } catch (e) { console.warn('rio life', e); RIO.stats.lifeErr = String(e && e.stack || e).slice(0, 300) }
    const G = RIO.navLinks && N.G ? N.G : N.graph(); RIO.rep = N.check([PLAN.arrival.x, PLAN.arrival.z]); Object.assign(RIO.stats, { navNodes: G.nodes.length, deadEnds: RIO.rep.deadEnds.length, components: RIO.rep.components, reach: RIO.rep.reachFrac, buildMs: Math.round(performance.now() - t0), lots: lots.length });
    RIO.nav = { nodes: G.nodes, links: G.links };
    const PLc = (id, en, es, x, z) => ({ id, name: [en, es], x, z, yaw: 0 }), places = [];
    for (const p of PLAN.plazas) { const sh = p[1]; let cx, cz; if (sh.c) { cx = sh.c[0]; cz = sh.c[1] } else { cx = sh.reduce((s2, v) => s2 + v[0], 0) / sh.length; cz = sh.reduce((s2, v) => s2 + v[1], 0) / sh.length } const sp = N.snap(cx, cz, 14) || [cx, cz]; places.push(PLc(p[0], p[2][0], p[2][1], sp[0], sp[1])) }
    for (const [id, x, z, en, es] of [['praia', 0, 140, 'Copacabana beach', 'Playa de Copacabana'], ['calcadao', 0, 119, 'Calçadão', 'Calçadão'], ['posto6', -280, 140, 'Posto 6 (fishermen)', 'Posto 6 (pescadores)'], ['leme', 280, 100, 'Leme', 'Leme'], ['morro', -30, -140, 'Morro (Ladeira dos Tabajaras)', 'Morro (Ladeira dos Tabajaras)']]) { const sp = N.snap(x, z, 10) || [x, z]; places.push(PLc(id, en, es, sp[0], sp[1])) }
    const SHN = { pandeiro: 'Bar do Pandeiro (samba)', sucos: 'Casa dos Sucos', churrascaria: 'Churrascaria Gaúcha', chinelos: 'Chinelos Copacabana', musica: 'Sambaqui Instrumentos', padaria: 'Padaria do Leme' };
    for (const k in d.SH) { const l = d.SH[k], [x, z] = GW.localPt(l.H.base, 0, 2.6); places.push(PLc(k, SHN[k] || k, SHN[k] || k, x, z)) }
    if (RIO.lifePlaces) for (const p of RIO.lifePlaces) places.push(p);
    return { name: 'Rio de Janeiro', surface: N.surface, fog: [120, 520], sky: { exp: 1.02, tint: [0x5aa8e8, 0xf4ecd8, .35, .3], dome: { s1: 0xeef6fa, s2: 0x4a9ae8, swirl: .01, cloud: .35, glow: .45 } },
      arrivals: { default: { x: PLAN.arrival.x, z: PLAN.arrival.z, yaw: PLAN.arrival.yaw }, pipe: { x: 6, z: 116, yaw: 0 }, train: { x: 225, z: -70, yaw: 0 } }, defaultArrival: 'default',
      mapRoads: N.mapRoads(), places, mapNav: RIO.nav, routeGroup: () => 'main', noCar: (x, z) => !N.carOK(x, z), stepMat: (x, z) => N.code(x, z) === 3 ? 'sand' : N.code(x, z) === 8 ? 'wood' : 'stone',
      greet: { human: [['E aí! The water is cold but the sand is hot.', '¡E aí! El agua está fría pero la arena quema.'], ['Bloco on Saturday? Bring glitter.', '¿Bloco el sábado? Trae purpurina.']] },
      chatLines: [['Coconut water, then the sea. That is the whole plan.', 'Agua de coco y luego el mar. Ese es todo el plan.'], ['Samba at Bar do Pandeiro tonight.', 'Esta noche, samba en el Bar do Pandeiro.'], ['From Leme you can see the Sugar Loaf.', 'Desde Leme se ve el Pan de Azúcar.']],
      musicProfile: { bpm: 104, root: 48, scale: [0, 2, 4, 5, 7, 9, 10], style: 'amb' } };
  }
});
})(window.AV);
