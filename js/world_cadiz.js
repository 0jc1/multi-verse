/* APEVERSE 2.2 GLOBAL WORLDS - world_cadiz.js : CÁDIZ, the old town on its peninsula (agent 4).  Network: cadiz_plan.js; dressing:
   gw_city.js; life + Carnival: cadiz_life.js.
   Architecture: tall 18th-century merchant houses (3-4 floors) in sea-faded pastels and white, piedra ostionera (shell-stone) trims,
   glazed cierros on every other floor, flat azoteas crowned with torres miradores (the watchtowers merchants used to spot their
   ships); La Viña lower and whiter, El Pópulo in old stone; Campo del Sur's row of bright façades facing the Atlantic.
   Landmarks: the Cathedral (golden-tiled dome, two towers) on its plaza, Torre Tavira, the Ayuntamiento on San Juan de Dios, the Roman
   theatre, Gran Teatro Falla (neo-mudéjar brick), the Puerta de Tierra and the land walls, the Mercado Central's colonnade, the
   Balneario de la Palma on La Caleta between Santa Catalina's star fort and the Castillo de San Sebastián (causeway, lighthouse).
   Every business is fictional.  AV.cadiz */
'use strict';
(function (AV) {
const TAU = Math.PI * 2, L = (e, s) => [e, s], GW = AV.gwkit, PLAN = AV.cadizPlan;
const CAD = AV.cadiz = { stats: {} }, PT = GW.paint;
const SG = CAD.SG = { r: {} };
const SIGNS = CAD.SIGNS = [
  ['freiduria', 768, 160, PT.plain('FREIDURÍA LA CALETA', 'pescaíto frito · cazón · tortillitas de camarones · desde 1931', '#f6f0e0', '#1a3a7a', '#1a3a7a', '900 #px Georgia, serif')],
  ['sardina', 768, 160, PT.az('Taberna La Sardina', 'vino de Chiclana · manzanilla · chicharrones · La Viña', { rows: 4, border: '#1f4a9a', accent: '#e8a820', ink: '#1a3a8a' })],
  ['disfraces', 768, 160, (g, w, h) => { const cols = ['#e8c040', '#c8143a', '#2aa8d8', '#8a4ad8', '#3aa85a']; g.fillStyle = '#1a1420'; g.fillRect(0, 0, w, h); for (let i = 0; i < 70; i++) { g.fillStyle = cols[i % 5]; g.fillRect(Math.random() * w, Math.random() * h, 6, 3) } g.fillStyle = '#f8f4ea'; GW.rr(g, 40, 24, w - 80, h - 48, 16); g.fill(); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#c8143a'; GW.fit(g, 'DISFRACES ER TIPO', w - 140, 62, '900 #px "Arial Black", Arial, sans-serif', 66, w / 2); g.fillStyle = '#1a1420'; GW.fit(g, 'tipos de chirigota · antifaces · pelucas · confeti', w - 150, 22, 'italic 700 #px Georgia, serif', 112, w / 2) }],
  ['pena', 768, 160, PT.gold('Peña Flamenca La Perla', 'cante · guitarra · ensayos de chirigota · cada noche', '#0e0a0a', '#c8a040')],
  ['confiteria', 768, 160, PT.az('Confitería El Pópulo', 'pan de Cádiz · tocino de cielo · piñonate', { rows: 4, border: '#6a3a1a', accent: '#e8c040', ink: '#5a2a10', bg: '#f8f0dc' })],
  ['heladeria', 640, 160, PT.plain('HELADERÍA ER BARQUILLO', 'helados artesanos · granizados · horchata', '#f4e8f0', '#b0306a', '#4aa8a8', '800 #px Georgia, serif')],
  ['ostiones', 768, 160, PT.painted('Ostionería El Puertito', 'ostiones · erizos · camarones · cañaíllas', '#1f4a7a', '#eef2f0', 'italic 700 #px Georgia, serif')],
  ['libreria', 768, 160, PT.gold('Librería La Caleta', 'libros del mar · mapas · postales antiguas', '#1a2238')],
  ['gaditana', 768, 160, PT.gold('Almacenes La Gaditana', 'tejidos · moda · complementos · desde 1898', '#2a1018', '#d8b060')],
  ['cafe', 640, 160, PT.gold('Café El Faro', 'desayunos · tostadas · chocolate con churros', '#1a2a3a')],
  ['mercado', 1024, 128, (g, w, h) => { g.fillStyle = '#e8d8b0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#7a5a2a'; g.lineWidth = 5; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = '#5a3a1a'; g.textAlign = 'center'; g.textBaseline = 'middle'; GW.fit(g, 'MERCADO CENTRAL DE ABASTOS', w - 120, 74, '700 #px Georgia, serif', h / 2, w / 2) }],
  ['falla', 1024, 128, (g, w, h) => { g.fillStyle = '#8a2a1a'; g.fillRect(0, 0, w, h); g.fillStyle = '#f4e2b8'; g.textAlign = 'center'; g.textBaseline = 'middle'; GW.fit(g, 'GRAN TEATRO FALLA', w - 120, 76, '700 #px Georgia, serif', h / 2, w / 2) }],
  ['tavira', 512, 128, PT.az('Torre Tavira', 'cámara oscura · mirador', { rows: 3, border: '#1f4a9a', accent: '#e8a820', ink: '#1a3a8a' })],
  ['carnaval', 1024, 192, (g, w, h) => { const cols = ['#e8c040', '#c8143a', '#2aa8d8', '#8a4ad8', '#3aa85a', '#ff7a1a']; g.fillStyle = '#1a1420'; g.fillRect(0, 0, w, h); for (let i = 0; i < 160; i++) { g.fillStyle = cols[i % 6]; g.save(); g.translate(Math.random() * w, Math.random() * h); g.rotate(Math.random() * 3); g.fillRect(-5, -2, 10, 4); g.restore() } g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffe680'; g.shadowColor = '#ff4ab0'; g.shadowBlur = 18; GW.fit(g, '¡CARNAVAL DE CÁDIZ!', w - 100, 110, '900 #px "Arial Black", Arial, sans-serif', h * .45, w / 2); g.shadowBlur = 0; g.fillStyle = '#f8f4ea'; GW.fit(g, 'chirigotas · comparsas · coros · cuartetos', w - 160, 30, 'italic 700 #px Georgia, serif', h * .82, w / 2) }],
  ['chirigota', 512, 128, PT.neon('Chirigota "Los Monos del Muelle"', '¡a cantar en la calle!', '#ffe680', '#ff7ac8')],
  ['chiringuito', 512, 128, PT.plain('CHIRINGUITO LA CALETA', 'tinto · cerveza · espetos', '#f2c230', '#1a3a7a', '#1a3a7a', '900 #px Georgia, serif')],
  /* generic ground-floor shops */
  ['g_farmacia', 512, 112, (g, w, h) => { g.fillStyle = '#f4f4f0'; g.fillRect(0, 0, w, h); g.fillStyle = '#18a84a'; g.shadowColor = '#3aff7a'; g.shadowBlur = 10; g.fillRect(47, h / 2 - 40, 18, 80); g.fillRect(16, h / 2 - 9, 80, 18); g.shadowBlur = 0; g.fillStyle = '#1a6a3a'; g.textAlign = 'center'; g.textBaseline = 'middle'; GW.fit(g, 'FARMACIA', w - 150, 54, '800 #px Georgia, serif', h / 2, w / 2 + 50) }],
  ['g_estanco', 512, 112, PT.plain('ESTANCO Nº 7', 'tabacos · sellos · lotería', '#5a2a14', '#f2c230', '#f2c230', '800 #px Arial, sans-serif')],
  ['g_ultramarinos', 512, 112, PT.gold('Ultramarinos El Ancla', 'conservas · vinos de Jerez · aceite', '#2a1a10')],
  ['g_pescaderia', 512, 112, PT.plain('PESCADERÍA LA BAHÍA', 'pescado fresco de la lonja', '#e8f0f8', '#1a3a7a', '#1a3a7a', '900 #px Georgia, serif')],
  ['g_panaderia', 512, 112, PT.painted('Panadería La Viña', 'pan de horno · roscos', '#6a3a14')],
  ['g_merceria', 512, 112, PT.painted('Mercería Las Niñas', 'botones · hilos · encajes', '#7a2418')],
  ['g_joyeria', 512, 112, PT.gold('Joyería El Ancla de Oro', 'plata · relojes', '#101018')],
  ['g_zapateria', 512, 112, PT.plain('ZAPATERÍA EL MUELLE', 'calzado · bolsos', '#1a1a1a', '#f2f0ea', '#c8a040', '700 #px Georgia, serif')],
  ['g_barberia', 512, 112, PT.plain('BARBERÍA PACO', 'corte · afeitado', '#f4f4f4', '#1a1a1a', '#c8143a', '800 #px Arial, sans-serif')],
  ['g_bar1', 512, 112, PT.az('Bar La Marea', 'cañas · montaditos · café', { rows: 3, border: '#1f4a9a', accent: '#e8a820', ink: '#1a3a8a' })],
  ['g_bar2', 512, 112, PT.painted('Bodega El Faro', 'manzanilla · vino de Chiclana', '#2a1a10')],
  ['g_bar3', 512, 112, PT.neon('Bar La Chirigota', 'copas · carnaval todo el año', '#ff5a8a', '#7ad8ff')],
  ['g_recuerdos', 512, 112, PT.plain('RECUERDOS DE CÁDIZ', 'imanes · postales · camisetas', '#f2c230', '#1a3a7a', '#1a3a7a', '900 #px Georgia, serif')],
  ['g_vinos', 512, 112, PT.gold('Vinos y Licores Sanlúcar', 'manzanilla · fino · moscatel', '#3a0f14')],
  ['g_tejidos', 512, 112, PT.gold('Tejidos Columela', 'telas · mantelería', '#1f2a22')],
  ['g_ferreteria', 512, 112, PT.plain('FERRETERÍA EL TIMÓN', 'herramientas · efectos navales', '#2a3a5a', '#f2d23a', '#f2d23a', '800 #px Arial, sans-serif')],
  ['g_libreria', 512, 112, PT.gold('Librería Gades', 'libros nuevos y de viejo', '#1a2238')],
  ['g_cafe', 512, 112, PT.gold('Café Columela', 'desayunos · tostadas', '#1a2a3a')],
  ['g_confiteria', 512, 112, PT.az('Confitería Cádiz', 'pan de Cádiz · pestiños', { rows: 3, border: '#6a3a1a', accent: '#e8c040', ink: '#5a2a10' })],
  ['g_disfraces', 512, 112, PT.plain('DISFRACES LA MÁSCARA', 'tipos de carnaval', '#1a1420', '#ffe680', '#ff5a8a', '900 #px Arial Black, Arial, sans-serif')],
  ['g_pescaito', 512, 112, PT.plain('FREIDURÍA EL CHOCO', 'cartuchos de pescaíto', '#f6f0e0', '#c8143a', '#1a3a7a', '900 #px Georgia, serif')]
].concat(GW.WINDOWS).concat(GW.plaques(PLAN.streets.map(s => [s[0], s[4][1]]).concat(PLAN.plazas.map(p => [p[0], p[2][1]]))));
const GEN = SIGNS.filter(s => /^g_/.test(s[0])).map(s => s[0]);
const WIN = { g_farmacia: 'w_goods', g_estanco: 'w_goods', g_ultramarinos: 'w_tapas', g_pescaderia: 'w_fish', g_panaderia: 'w_sweets', g_merceria: 'w_goods', g_joyeria: 'w_goods', g_zapateria: 'w_goods', g_barberia: 'w_goods', g_bar1: 'w_tapas', g_bar2: 'w_tapas', g_bar3: 'w_tapas', g_recuerdos: 'w_ceramic', g_vinos: 'w_tapas', g_tejidos: 'w_dress', g_ferreteria: 'w_goods', g_libreria: 'w_books', g_cafe: 'w_sweets', g_confiteria: 'w_sweets', g_disfraces: 'w_masks', g_pescaito: 'w_fish' };
/* palettes */
const STY = {
  centro: { walls: [0xf2e6c8, 0xe8c070, 0xe8b0a8, 0xa8c8e0, 0xf4f0e6, 0xb8d8c0, 0xf0d070, 0xf4f0e6], trim: [0xf8f6f0, 0xd8c8a0, 0xc8b088], base: [0x9a9488, 0xb8a078, 0x8a8478], shutter: [0x2a5a3a, 0x2a4a7a, 0x1e4030], door: [0x3a2414, 0x2a4a3a, 0x1a2a4a], iron: 0x18181a, roof: 'flat', floors: [3, 4], fh: 3.4, balcony: .42, cierro: .32, reja: true, pots: .4, mirador: .22 },
  campo: { walls: [0xe8c040, 0xe87a6a, 0x7ab8e0, 0xf4f0e6, 0xe8a0c0, 0x8ad0b0, 0xf0d070, 0xd8a060], trim: [0xf8f6f0], base: [0x9a9488, 0xb8a078], shutter: [0x2a5a3a, 0x2a4a7a], door: [0x3a2414, 0x1a2a4a], iron: 0x18181a, roof: 'flat', floors: [3, 4], fh: 3.4, balcony: .45, cierro: .35, reja: true, pots: .4, mirador: .25 },
  vina: { walls: [0xf8f6ee, 0xf8f6ee, 0xf4f0e6, 0xf2e8c8, 0xa8c8e0, 0xf8f6ee], trim: [0x2a5aa8, 0xe8c040, 0xb0482e, 0x2a8a5a], base: [0x2a5aa8, 0xb0482e, 0x9a9488], shutter: [0x2a5a3a, 0x2a4a7a], door: [0x2a4a7a, 0x2a6a4a, 0x8a2a1a], iron: 0x18181a, roof: 'flat', floors: [2, 3], fh: 3.2, balcony: .45, cierro: .1, reja: true, pots: .75, mirador: .05 },
  populo: { walls: [0xd8c8a0, 0xc8b088, 0xf2e6c8, 0xe8d8b8], trim: [0xf8f6f0, 0xb8a078], base: [0x8a8478, 0x9a9488], shutter: [0x2a5a3a, 0x4a2e1e], door: [0x3a2414, 0x4a1e14], iron: 0x18181a, roof: 'mix', tile: 0xa8542e, floors: [2, 3], fh: 3.3, balcony: .35, cierro: .12, reja: true, pots: .5, mirador: .06 }
};
const district = (x, z, src) => src === 'campo_sur' ? 'campo' : (x < -110 && z > -30) ? 'vina' : (x > 140 && z > 0 && z < 150) ? 'populo' : 'centro';
CAD.district = district;
AV.registerWorld({
  id: 'cadiz',
  build(ctx) {
    const K = AV.kit, BG = K.BG, q = ctx.q, grp = ctx.group, S = AV.S, rng = GW.rng((ctx.seed || 1) * 37 + 11), M = K.M, t0 = performance.now();
    const N = CAD.N = PLAN.net(), lots = N.lots(GW.rng(11), { wmin: 5.5, wmax: 9.5, dmax: 12, order: ['plaza', 'promenade', 'avenue', 'road', 'street', 'lane', 'alley'] });   /* the sea promenades get their frontage first: façades face the sea */
    const T = (x, z, r, label, fn, show, kind) => { const t = { x, z, r, label, fn, show, kind }; ctx.T.push(t); return t };
    const st = () => { S.cad = S.cad || { met: {}, q: {}, rides: 0 }; return S.cad };
    CAD.ctx = ctx; CAD.T = T; CAD.st = st;
    const beachEdge = (a, b) => [a, b].every(p => p[0] < -212 && p[0] > -345 && p[1] > -5 && p[1] < 84);
    const d = CAD.d = GW.dress(ctx, { N, lots, rng, q, name: 'cad', GEN, WIN,
      styleFor: l => STY[district(l.x, l.z, l.src)],
      SPECIAL: [['freiduria', 'flores', [52, -12], 7, 6.5, 'w_fish'], ['sardina', 'virgen_palma', [-168, 22], 8, 7, 'w_tapas'], ['disfraces', 'ancha', [60, -90], 8, 7, 'w_masks'], ['pena', 'campo_sur', [175, 155], 8.5, 7.5, 'w_goods'],
        ['confiteria', 'populo_arco', [170, 40], 0, 5, 'w_sweets'], ['heladeria', 'columela', [4, -110], 0, 5.5, 'w_sweets'], ['ostiones', 'virgen_palma', [-195, 58], 0, 5.5, 'w_fish'], ['libreria', 'san_francisco', [61, -150], 0, 5.5, 'w_books'],
        ['gaditana', 'columela', [6, -30], 0, 6, 'w_dress'], ['cafe', 'san_antonio', [-78, -120], 0, 5.5, 'w_sweets']],
      interiorLook: k => k === 'pena' ? { dado: [0x8a1a1a, 0xe8a820], wall: 0x2a1a14, floor: 0x3a1a14 } : k === 'disfraces' ? { dado: [0x8a4ad8, 0xe8c040], wall: 0xf2ece0 } : k === 'sardina' ? { dado: [0x1f4a9a, 0xf2f0ea] } : {},
      walkIn: (k, it, put, putG, blk) => { const w = it.w, hd = it.hd;
        if (k === 'freiduria' || k === 'sardina') { put(BG.box, 0x3a2414, -w / 2 + 1.1, .55, -hd / 2 - .5, .8, 1.1, hd - 2.6); put(BG.box, 0xd8d0c0, -w / 2 + 1.1, 1.13, -hd / 2 - .5, 1, .06, hd - 2.4); blk(-w / 2 + .5, -w / 2 + 1.6, -hd + .9, -1.4); if (k === 'sardina') for (let i = 0; i < 4; i++) put(BG.box, 0x6a2a1a, -w / 2 + .45, 1.6 + (i % 2) * .5, -1.8 - i * 1.1, .4, .5, .5); else putG(BG.box, 0xff9a3a, -w / 2 + .5, 1.3, -hd + 1.4, .6, .5, 1.2, 1);
          put(BG.box, 0x4a2a18, 1, .5, -hd + 1.6, 1, 1, 1); blk(.4, 1.6, -hd + 1, -hd + 2.2); it.counter = GW.localPt(it.base, -w / 2 + 2.3, -hd / 2); it.staff = GW.localPt(it.base, -w / 2 + .7, -hd / 2 - .5) }
        else if (k === 'disfraces') { for (let i = 0; i < 5; i++) { const z = -1.6 - i * 1.2; put(BG.box, 0x1a1a1a, -w / 2 + .8, .95, z, .05, 1.9, .05); put(BG.box, [0xe8c040, 0xc8143a, 0x2aa8d8, 0x8a4ad8, 0x3aa85a][i], -w / 2 + .8, 1.15, z, .7, 1.2, .5) } blk(-w / 2 + .3, -w / 2 + 1.3, -hd + .8, -1); put(BG.box, 0x3a1a1e, w / 2 - 1.2, .5, -hd + 1.6, .8, 1, 2); blk(w / 2 - 1.7, w / 2 - .7, -hd + .5, -hd + 2.7); putG(BG.box, 0xfff0e0, 0, 2.2, -hd + .35, 1.6, 2.2, .04, 1); it.counter = GW.localPt(it.base, w / 2 - 2.1, -hd + 1.6); it.staff = GW.localPt(it.base, w / 2 - .5, -hd + 1.6) }
        else if (k === 'pena') { put(BG.box, 0x2a1a10, 0, .25, -hd + 1.5, w - .8, .5, 2.4); blk(-w / 2 + .4, w / 2 - .4, -hd + .3, -hd + 2.7); put(BG.box, 0x1a1a1a, 0, 2.2, -hd + .35, w - .8, 3, .06); putG(BG.box, 0xffa040, 0, 3.3, -hd + 1.5, w - 1.2, .06, .3, 1); for (let i = 0; i < 3; i++) { put(BG.box, 0x4a2a18, -w / 2 + 1.5 + i * 1.6, .38, -2.4, .7, .76, .7) } blk(-w / 2 + .8, -w / 2 + 5.4, -2.9, -1.9); put(BG.box, 0x3a2414, w / 2 - .7, .55, -hd + 4, .7, 1.1, 2); it.stage = GW.localPt(it.base, 0, -hd + 1.5); it.counter = GW.localPt(it.base, w / 2 - 1.2, -hd + 4); it.staff = GW.localPt(it.base, w / 2 - .6, -hd + 4) } },
      ground: { base: GW.tex.setts('#8a8478'), plaza: GW.tex.checker(), open: GW.tex.sand('#e4cc96') },
      sea: { deep: 0x1a4a6a, shallow: 0x3a8aa8, sky: 0xc8dce8, opacity: .95, iri: .05 }, seaY: -2.6, noQuay: beachEdge, quayCol: 0xc8b088,
      treesOn: s => s.kind === 'promenade' || s.id === 'avenida_genoves', palmsOn: s => s.id === 'campo_sur' || s.id === 'paseo_caleta' || s.id === 'avenida_genoves', plazaPalms: p => /san_juan|constitucion|flores/.test(p.id), fruit: null, treeCols: [0x2a5a2a, 0x3a6a34, 0x2e5226],
      extraTrees: (() => { const t = []; for (let x = -252; x < -156; x += 12) for (let z = -142; z < -66; z += 12) if (((x + z) | 0) % 5) t.push([x, z]); for (let x = -14; x < 28; x += 10) for (const z of [-158, -137]) t.push([x, z]); return t })(),
      fillerWall: (x, z) => district(x, z) === 'vina' ? 0xf8f6ee : 0xf2e6c8, fillerCap: 0xd8ccb0, fillerBase: 0x9a9488, awningCols: [[0x1f4a7a, 0xf2f0ea], [0xb01a1a, 0xf2f0ea], [0xe8c040, 0xf2f0ea], [0x2a8a5a, 0xf2f0ea]] });
    const { P, Gl, Gs, D, Q, FP, FQ, FG, box, obox, sign } = d;
    const arch = (arr, col, x, y, z, w, h, ry) => { arr.push([BG.box, col, M(x, y + h * .4, z, w, h * .8, .2, 0, ry || 0, 0), 0], [BG.cyl, col, M(x, y + h * .8, z, w / 2, .2, w / 2, Math.PI / 2, ry || 0, 0), 0]) };   /* round-headed opening */
    const ost = 0xd8c8a0, ost2 = 0xc8b088, wh = 0xf6f2e8;
    /* ---------- the Cathedral: two towers, the golden dome ---------- */
    { box(P, ost, 60, 122, 0, 22, 96, 124); box(P, wh, 59.6, 122.4, 0, 1.2, 95.6, 124.4); for (let x = 64; x < 120; x += 5) { box(P, wh, x - .5, x + .5, 1.2, 20, 95.4, 96); } box(P, wh, 59.5, 122.5, 21, 22.6, 95.4, 124.6);
      for (const tx of [67, 115]) { box(P, ost, tx - 6, tx + 6, 0, 36, 95, 107); box(P, wh, tx - 6.3, tx + 6.3, 35.4, 36.4, 94.7, 107.3); box(P, wh, tx - 4.4, tx + 4.4, 36.4, 44, 96.6, 105.4); for (const [ox, oz, ry] of [[0, -4.5, 0], [4.5, 0, Math.PI / 2], [-4.5, 0, Math.PI / 2]]) arch(Gl, 0x2a2018, tx + ox, 37.4, 101 + oz, 2.2, 5, ry); P.push([BG.hem, 0xe8b840, M(tx, 44, 101, 4.6, 4, 4.6), 0], [BG.cone, 0xe8dcc0, M(tx, 49.2, 101, .8, 2.6, .8), 0]) }
      arch(P, 0x241c16, 91, 0, 95.3, 6, 11); for (const x of [83, 99]) { box(P, wh, x - .8, x + .8, 0, 20, 94.8, 95.8); } arch(P, 0x241c16, 76, 0, 95.3, 3.4, 7); arch(P, 0x241c16, 106, 0, 95.3, 3.4, 7);
      P.push([BG.cyl, ost, M(91, 26, 113, 10, 8, 10), 0]); for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; arch(Gl, 0x2a2018, 91 + Math.cos(a) * 10.05, 23, 113 + Math.sin(a) * 10.05, 1.6, 4, -a + Math.PI / 2) }
      P.push([BG.hem, 0xe8b840, M(91, 30, 113, 10.6, 11, 10.6), 0]); for (let k = 0; k < 16; k++) { const a = k / 16 * TAU; P.push([BG.box, 0xd8a830, M(91 + Math.cos(a) * 7.6, 37, 113 + Math.sin(a) * 7.6, .4, 9, .4, Math.sin(a) * .7, 0, -Math.cos(a) * .7), 0]) }
      P.push([BG.cyl, wh, M(91, 42.5, 113, 2, 3, 2), 0], [BG.hem, 0xe8b840, M(91, 44, 113, 2.2, 2, 2.2), 0], [BG.box, 0x5a4a2a, M(91, 47, 113, .25, 2.5, .25), 0]);
      Gl.push([BG.cyl, 0xffe0a0, M(91, 29.8, 113, 10.65, .2, 10.65), 1]) }
    /* ---------- Ayuntamiento (San Juan de Dios) ---------- */
    { box(P, wh, 182, 230, 0, 16, -62, -42); box(P, ost2, 181.6, 230.4, 0, 1.4, -62.4, -41.6); box(P, ost2, 181.5, 230.5, 15.4, 16.6, -62.5, -41.5); for (let x = 186; x < 228; x += 4.5) { box(P, ost2, x - .4, x + .4, 1.4, 15.4, -41.8, -41.5); for (const y of [4, 10]) { box(P, 0x2a3440, x + 1.2, x + 3.2, y - 1.5, y + 1.5, -41.7, -41.55); box(P, 0x18181a, x + 1.1, x + 3.3, y - 1.7, y - 1.6, -41.4, -40.9) } }
      box(P, wh, 198, 214, 16, 24, -56, -46); box(P, ost2, 197.5, 214.5, 23.6, 24.6, -56.5, -45.5); P.push([BG.hem, 0x5a7a6a, M(206, 24.6, -51, 4.5, 4, 4.5), 0]); P.push([BG.cyl, 0xf8f6f0, M(206, 20, -45.9, 1.8, .15, 1.8, Math.PI / 2, 0, 0), 0]); Gl.push([BG.cyl, 0xfff4d8, M(206, 20, -45.8, 1.5, .1, 1.5, Math.PI / 2, 0, 0), 1]) }
    /* ---------- the Roman theatre: excavated cavea ---------- */
    { const cx = 207, cz = 98; for (let r = 0; r < 7; r++) for (let k = 0; k < 14; k++) { const a = Math.PI + k / 13 * Math.PI, rr2 = 8 + r * 2.4; P.push([BG.box, r % 2 ? 0xc8b890 : 0xd8c8a0, M(cx + Math.cos(a) * rr2, -1.4 + r * .55, cz + Math.sin(a) * rr2, 2.6, .55, 2.2, 0, -a + Math.PI / 2, 0), 0]) } box(P, 0xb8a888, 190, 225, -2, -1.4, 55, 100); for (let x = 191; x < 225; x += 2.4) { box(P, 0x2a2a2a, x - .03, x + .03, 0, 1.1, 54.9, 55.1) } box(P, 0x2a2a2a, 190, 225, 1.05, 1.1, 54.9, 55.1); for (const x of [196, 204, 212]) box(P, 0xd8c8a0, x - .6, x + .6, -1.4, 3, 92, 93.2) }
    /* ---------- Gran Teatro Falla ---------- */
    { const br = 0xa8482e; box(P, br, -215, -182, 0, 17, -70, -35); box(P, 0xe8d8b8, -215.4, -181.6, 16.4, 17.4, -70.4, -34.6); for (let z = -66; z < -36; z += 4) { arch(P, 0xe8d8b8, -181.8, 4, z + 2, 2, 5, Math.PI / 2); box(P, br, -181.9, -181.6, 0, 17, z - .3, z + .3) } for (const z of [-58, -52]) arch(P, 0x241c16, -181.7, 0, z, 3.4, 6.4, Math.PI / 2); sign('falla', -181.5, 13.6, -52.5, 14, 1.75, Math.PI / 2); for (const z of [-70, -35]) { box(P, br, -217, -211, 0, 22, z - 3, z + 3); P.push([BG.hem, 0x3a7a6a, M(-214, 22, z, 3.2, 3, 3.2), 0]) } }
    /* ---------- Puerta de Tierra + the land walls ---------- */
    { const st2 = 0xe8dcc0; box(P, st2, 225, 240, 0, 9, 112, 128); box(P, st2, 225, 240, 0, 9, 138, 186); box(P, st2, 225, 240, 6.4, 9, 128, 138); for (let z = 113; z < 186; z += 2.6) box(P, 0xd8c8a0, 238.5, 240.5, 9, 10.2, z, z + 1.4);
      box(P, wh, 228, 240, 9, 21, 126, 140); box(P, ost2, 227.5, 240.5, 20.6, 21.6, 125.5, 140.5); P.push([BG.box, wh, M(234, 23.5, 133, 6, 4, 6), 0], [BG.hem, 0x5a7a6a, M(234, 25.5, 133, 3.4, 3, 3.4), 0]); P.push([BG.cyl, 0xf8f6f0, M(240.15, 15, 133, 1.6, .15, 1.6, 0, 0, Math.PI / 2), 0]); Gl.push([BG.cyl, 0xfff4d8, M(240.25, 15, 133, 1.3, .1, 1.3, 0, 0, Math.PI / 2), 1]); for (const z of [130, 136]) arch(P, 0x2a2420, 240.3, 0, z, 3.2, 6.2, Math.PI / 2) }
    /* ---------- Torre Tavira ---------- */
    { box(P, 0xe8c070, 20, 28, 0, 15, -68, -60); box(P, wh, 19.6, 28.4, 14.6, 15.6, -68.4, -59.6); box(P, 0xd8a050, 21, 27, 15.6, 30, -67, -61); box(P, wh, 20.6, 27.4, 29.6, 30.6, -67.4, -60.6); box(P, 0xe8c070, 22, 26, 30.6, 34, -66, -62); P.push([BG.hem, 0xb05a30, M(24, 34, -64, 2.4, 1.6, 2.4), 0]); for (const [ox, oz, ry] of [[0, 3.05, 0], [3.05, 0, Math.PI / 2], [-3.05, 0, Math.PI / 2]]) { arch(Gl, 0x2a2018, 24 + ox, 25, -64 + oz, 1.4, 3, ry); arch(Gl, 0x2a2018, 24 + ox, 31, -64 + oz * .66, .9, 2, ry) } sign('tavira', 24, 4.2, -59.85, 3.2, .8, 0) }
    /* ---------- Mercado Central: a colonnade round a hall with stalls ---------- */
    const stalls = []; { const x0 = -6, x1 = 45, z0 = 24, z1 = 76, oc = 0xe8c888;
      for (let x = x0 + 1; x <= x1 - 1; x += 4) for (const z of [z0 + 1, z1 - 1]) { P.push([BG.cyl, oc, M(x, 2.4, z, .35, 4.8, .35), 0]); N.blockCircle(x, z, .35) } for (let z = z0 + 5; z <= z1 - 5; z += 4) for (const x of [x0 + 1, x1 - 1]) { P.push([BG.cyl, oc, M(x, 2.4, z, .35, 4.8, .35), 0]); N.blockCircle(x, z, .35) }
      box(P, oc, x0, x1, 4.8, 5.6, z0, z0 + 2.4); box(P, oc, x0, x1, 4.8, 5.6, z1 - 2.4, z1); box(P, oc, x0, x0 + 2.4, 4.8, 5.6, z0, z1); box(P, oc, x1 - 2.4, x1, 4.8, 5.6, z0, z1); box(P, 0xc8a870, x0 - .2, x1 + .2, 5.6, 6, z0 - .2, z1 + .2);
      box(P, 0xd8d0c0, x0 + 12, x1 - 12, 6.5, 7, z0 + 14, z1 - 14); for (const [x, z] of [[x0 + 12, z0 + 14], [x1 - 12, z0 + 14], [x0 + 12, z1 - 14], [x1 - 12, z1 - 14]]) { box(P, 0x3a4a3a, x - .2, x + .2, 0, 6.5, z - .2, z + .2); N.blockCircle(x, z, .3) } sign('mercado', (x0 + x1) / 2, 5.2, z0 - .05, 14, 1.75, Math.PI);
      const cols2 = [0xc8143a, 0xf2c230, 0x3aa85a, 0xe8e0d0, 0xd86a2a, 0x8a9aa8];
      for (const [sx, sz, kind] of [[8, 40, 'pescado'], [19.5, 40, 'marisco'], [31, 40, 'fruta'], [8, 58, 'chacinas'], [19.5, 58, 'especias'], [31, 58, 'flores']]) { box(P, 0x6a4a2a, sx - 2.4, sx + 2.4, 0, 1, sz - .7, sz + .7); box(P, kind === 'pescado' || kind === 'marisco' ? 0xe8f0f4 : 0xe8e0d0, sx - 2.5, sx + 2.5, 1, 1.06, sz - .8, sz + .8); for (let k = 0; k < 6; k++) box(P, cols2[(k + stalls.length) % 6], sx - 2.1 + k * .8, sx - 1.5 + k * .8, 1.06, 1.3, sz - .5, sz + .2); box(P, 0xf2f0ea, sx - 2.6, sx + 2.6, 2.9, 3, sz - 1.4, sz + .9); box(Gl, 0xfff0c8, sx - .4, sx + .4, 2.6, 2.9, sz - .1, sz + .1, 1); N.block(GW.rectPoly(sx - 2.5, sx + 2.5, sz - .8, sz + .8)); stalls.push({ x: sx, z: sz - 1.9, kind, staff: [sx, sz + 1.6] }) } }
    /* ---------- the castles + the Balneario on La Caleta ---------- */
    { const fc = 0xc8b088; const C = PLAN.solids.find(s => s[0] === 'santa_catalina')[1]; for (let i = 0; i < C.length; i++) { const a = C[i], b = C[(i + 1) % C.length]; obox(P, fc, a[0], a[1], b[0], b[1], 2.4, -3, 8); for (let t = .05; t < 1; t += .08) P.push([BG.box, fc, M(a[0] + (b[0] - a[0]) * t, 8.5, a[1] + (b[1] - a[1]) * t, 1, 1, 1), 0]) } box(P, 0xe8dcc0, -316, -306, 0, 6.4, -46, -43); arch(P, 0x2a2420, -311, 0, -42.8, 3, 5) }
    { const c = [-340, 74]; P.push([new THREE.CylinderGeometry(10, 10.5, 9, 16, 1, true), 0xc8b088, M(c[0], 1.9, c[1]), 0]); for (let k = 0; k < 16; k++) { const a = k / 16 * TAU; P.push([BG.box, 0xc8b088, M(c[0] + Math.cos(a) * 10, 6.9, c[1] + Math.sin(a) * 10, 1.2, 1, 1.2, 0, -a, 0), 0]) }
      for (let k = 0; k < 4; k++) { const a = k / 4 * TAU; P.push([BG.box, 0xf4f4f4, M(c[0] - 6 + Math.cos(a) * 1.2, 20, c[1] - 2 + Math.sin(a) * 1.2, .25, 30, .25), 0]) } P.push([BG.cyl, 0xf4f4f4, M(c[0] - 6, 35.5, c[1] - 2, 1.6, 2.4, 1.6), 0], [BG.hem, 0xb01a1a, M(c[0] - 6, 36.8, c[1] - 2, 1.7, 1.4, 1.7), 0]); Gl.push([BG.cyl, 0xfff4b0, M(c[0] - 6, 35.5, c[1] - 2, 1.45, 2, 1.45), 1]); CAD.lighthouse = [c[0] - 6, 35.5, c[1] - 2] }
    { const x0 = -266, x1 = -236, z0 = 64, z1 = 84; for (let x = x0 + 2; x < x1; x += 4) for (const z of [z0 + 1, z1 - 1]) box(P, 0xe8e4dc, x - .25, x + .25, -2.8, 1, z - .25, z + .25); box(P, 0xf6f4ee, x0, x1, 1, 1.4, z0, z1); box(P, wh, x0 + 2, x1 - 2, 1.4, 6.5, z0 + 2, z1 - 2); for (const x of [x0 + 4, x1 - 4]) P.push([BG.hem, 0xe8e4dc, M(x, 6.5, (z0 + z1) / 2, 3.4, 3, 3.4), 0]); for (let x = x0 + 4; x < x1 - 3; x += 3) arch(Gl, 0x2a3a4a, x, 2.4, z0 + 1.9, 1.4, 3, 0); box(P, 0x1a1a1a, x0, x1, 2.3, 2.36, z0 - .05, z0 + .05) }
    /* ---------- the Campo del Sur seawall railing + the Alameda's sea rail ---------- */
    for (const sid of ['campo_sur', 'alameda']) { const s = N.streets.find(x => x.id === sid), sd = s.sides[0]; for (let i = 0; i + 1 < s.pts.length; i++) { const [a, b] = [s.pts[i], s.pts[i + 1]], Ls = Math.hypot(b[0] - a[0], b[1] - a[1]), nx = -(b[1] - a[1]) / Ls * -sd, nz = (b[0] - a[0]) / Ls * -sd, o2 = s.w / 2 - .4; obox(P, 0xe8e4dc, a[0] + nx * o2, a[1] + nz * o2, b[0] + nx * o2, b[1] + nz * o2, .35, 0, .9) } }
    /* ---------- Carnival structures (shown while Carnaval runs): stage, streamers, bunting, confetti ---------- */
    { const sx = -78, sz = -112; FP.push([BG.box, 0x2a1a2a, M(sx, .6, sz, 12, 1.2, 6), 0], [BG.box, 0x1a1420, M(sx, 4, sz - 3, 12, 6, .3), 0]); FQ.push({ k: 'carnaval', x: sx, y: 6.2, z: sz - 2.8, w: 11, h: 2.06, ry: 0 }); for (const ox of [-6, 6]) { FP.push([BG.box, 0x1a1a1a, M(sx + ox, 3.6, sz + 2.6, .2, 7.2, .2), 0]); for (let k = 0; k < 5; k++) FG.push([BG.oct, [0xff4ab0, 0x4ad8ff, 0xffe680, 0x7aff8a, 0xff7a1a][k], M(sx + ox, 6.8 - k * .4, sz + 2.6, .35, .35, .35), 1]) } CAD.stageWall = GW.rectPoly(sx - 6, sx + 6, sz - 3.2, sz + 3); CAD.stage = { x: sx, z: sz, front: [sx, sz + 5] } }
    const CR = ['virgen_palma', 'columela', 'ancha', 'sagasta', 'concepcion', 'lazaro_dou', 'libertad_w'], cc = [0xe8c040, 0xc8143a, 0x2aa8d8, 0x8a4ad8, 0x3aa85a, 0xff7a1a];
    for (const sid of CR) { const s = N.streets.find(x => x.id === sid); for (let i = 0; i + 1 < s.pts.length; i++) { const [a, b] = [s.pts[i], s.pts[i + 1]], Ls = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / Ls, uz = (b[1] - a[1]) / Ls; for (let t = 4; t < Ls - 2; t += 6) { const x = a[0] + ux * t, z = a[1] + uz * t, hw = s.w / 2 + .3;
          for (let k = 0; k < 7; k++) { const u = -hw + 2 * hw * (k + .5) / 7, y = 6.2 - Math.sin((k + .5) / 7 * Math.PI) * .9; FP.push([BG.cone, cc[(k + i) % 6], M(x - uz * u, y, z + ux * u, .28, .5, .04, Math.PI, Math.atan2(ux, uz), 0), 0]) }   /* bunting across the street */
          if (q > 0) for (let k = 0; k < 3; k++) FP.push([BG.box, cc[(k * 2 + i + (t | 0)) % 6], M(x + (rng() - .5) * s.w * .6, .02, z + (rng() - .5) * 4, .05, .01, .12, 0, rng() * 3, 0), 0]) } } }   /* a few confetti strips on the ground */
    for (let i = 0; i < [20, 40, 70][q]; i++) { const n = (() => { for (let k = 0; k < 20; k++) { const x = -200 + rng() * 260, z = -60 + rng() * 140; if (N.walk(x, z)) return [x, z] } return null })(); if (n) FG.push([BG.box, cc[i % 6], M(n[0], 4.5 + rng() * 2, n[1], .06, 1.6, .06, rng(), 0, rng()), 0]) }   /* serpentinas hanging */
    /* ---------- finish ---------- */
    const F = CAD.F = GW.finish(ctx, d, { SG, SIGNS, name: 'cad' }); CAD.festG = F.fest; CAD.festGlowM = F.festGlowM;
    Object.assign(CAD.stats, d.stats); CAD.lots = lots; CAD.shops = d.SH; CAD.interiors = d.IN; CAD.stalls = stalls;
    if (CAD.life) try { CAD.life(ctx, { N, T, st, SH: d.SH, IN: d.IN, stalls }) } catch (e) { console.warn('cadiz life', e); CAD.stats.lifeErr = String(e && e.stack || e).slice(0, 300) }
    const G = CAD.navLinks && N.G ? N.G : N.graph(); CAD.rep = N.check([PLAN.arrival.x, PLAN.arrival.z]); Object.assign(CAD.stats, { navNodes: G.nodes.length, deadEnds: CAD.rep.deadEnds.length, components: CAD.rep.components, reach: CAD.rep.reachFrac, buildMs: Math.round(performance.now() - t0), lots: lots.length });
    CAD.nav = { nodes: G.nodes, links: G.links };
    const PLc = (id, en, es, x, z) => ({ id, name: [en, es], x, z, yaw: 0 }), places = [];
    for (const p of PLAN.plazas) { const sh = p[1]; let cx, cz; if (sh.c) { cx = sh.c[0]; cz = sh.c[1] } else { cx = sh.reduce((s2, v) => s2 + v[0], 0) / sh.length; cz = sh.reduce((s2, v) => s2 + v[1], 0) / sh.length } const sp = N.snap(cx, cz, 14) || [cx, cz]; places.push(PLc(p[0], p[2][0], p[2][1], sp[0], sp[1])) }
    for (const [id, x, z, en, es] of [['caleta', -290, 50, 'La Caleta (beach)', 'La Caleta (playa)'], ['genoves', -205, -105, 'Parque Genovés', 'Parque Genovés'], ['alameda', 0, -200, 'Alameda Apodaca (bay)', 'Alameda Apodaca (bahía)'], ['campo_sur', 0, 127, 'Campo del Sur (Atlantic)', 'Campo del Sur (Atlántico)'], ['populo', 178, 32, 'El Pópulo (arches)', 'El Pópulo (arcos)'], ['vina', -160, 50, 'La Viña', 'La Viña'], ['sebastian', -340, 74, 'Castillo de San Sebastián', 'Castillo de San Sebastián'], ['catalina', -309, -72, 'Castillo de Santa Catalina', 'Castillo de Santa Catalina'], ['puerto', 244, -20, 'Port quay', 'Muelle del puerto']]) { const sp = N.snap(x, z, 10) || [x, z]; places.push(PLc(id, en, es, sp[0], sp[1])) }
    const SHN = { freiduria: 'Freiduría La Caleta', sardina: 'Taberna La Sardina', disfraces: 'Disfraces Er Tipo (costumes)', pena: 'Peña Flamenca La Perla', confiteria: 'Confitería El Pópulo', heladeria: 'Heladería Er Barquillo', ostiones: 'Ostionería El Puertito', libreria: 'Librería La Caleta', gaditana: 'Almacenes La Gaditana', cafe: 'Café El Faro' };
    for (const k in d.SH) { const l = d.SH[k], [x, z] = GW.localPt(l.H.base, 0, 2.6); places.push(PLc(k, SHN[k] || k, SHN[k] || k, x, z)) }
    if (CAD.lifePlaces) for (const p of CAD.lifePlaces) places.push(p);
    return { name: 'Cádiz', surface: N.surface, fog: [100, 480], sky: { exp: .98, tint: [0x7ab0e0, 0xf4e8d0, .35, .3], dome: { s1: 0xeef4f8, s2: 0x6aa8e0, swirl: .01, cloud: .3, glow: .4 } },
      arrivals: { default: { x: PLAN.arrival.x, z: PLAN.arrival.z, yaw: PLAN.arrival.yaw }, pipe: { x: 205, z: -20, yaw: PLAN.arrival.yaw }, train: { x: 266, z: 120, yaw: Math.PI } }, defaultArrival: 'default',
      mapRoads: N.mapRoads(), places, mapNav: CAD.nav, routeGroup: () => 'main', noCar: (x, z) => !N.carOK(x, z), stepMat: (x, z) => { const c = N.code(x, z); return c === 8 ? 'wood' : c === 3 ? 'sand' : c === 6 ? 'stone' : 'stone' },
      greet: { human: [['¡Quillo! Welcome to the tacita de plata.', '¡Quillo! Bienvenido a la tacita de plata.'], ['Every street ends at the sea. You cannot get lost for long.', 'Todas las calles acaban en el mar. No te pierdes mucho rato.']] },
      chatLines: [['The levante is blowing — hold on to your hat.', 'Sopla levante: agarra el sombrero.'], ['Carnival week? Then nobody sleeps in La Viña.', '¿Semana de Carnaval? Entonces en La Viña no duerme nadie.'], ['Sunset at La Caleta. Everyone claps when the sun goes in.', 'Atardecer en La Caleta. Todo el mundo aplaude cuando se mete el sol.']],
      musicProfile: { bpm: 112, root: 50, scale: [0, 1, 4, 5, 7, 8, 10], style: 'amb' } };
  }
});
})(window.AV);
