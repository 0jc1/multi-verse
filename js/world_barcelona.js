/* APEVERSE 2.2 NEW WORLDS - world_barcelona.js : BARCELONA (present day), built to the interconnected-city standard from the start.
   1 m = 1 m, north is -z.  Street network first (see docs/BARCELONA.md):
     EIXAMPLE (north): a grid of chamfered 70 m blocks (xamfrans) — Passeig de Gràcia (x 0, 30 m), Rambla de Catalunya (x -92, pedestrian),
       two more streets + the edge streets; Gran Via, Aragó, València, Mallorca across.  One block has its garden courtyard open, with
       passatges through the rows.
     PLAÇA DE CATALUNYA (the hub) between the Eixample and the old town.
     CIUTAT VELLA (south): LA RAMBLA (promenade between two narrow roads) down to the port; the GOTHIC QUARTER east of it — narrow lanes,
       the cathedral square, Plaça del Pi with its church, Plaça Sant Jaume, Plaça Reial (arcaded, palms), Carrer de Ferran, Escudellers;
       the RAVAL west of it (the market hall, two lanes); Via Laietana and the BORN beyond it; the port promenade, the Columbus column.
   Architecture kit: Eixample buildings (ochre/pink/cream stucco, tall windows with green louvred shutters, individual iron balconies,
   a continuous balcony on the principal floor, glazed corner tribunes, roof terraces, occasional modernista tile bands) and Gothic
   sandstone buildings (smaller windows, flower pots, wall lanterns).  Every business is fictional; public places and monuments are
   real places.  AV.barcelona */
'use strict';
(function (AV) {
const TAU = Math.PI * 2, PI = Math.PI;
const BCN = AV.barcelona = { stats: {} };
const XMIN = -197, XMAX = 197, ZMIN = -322, ZQ = 372, WY = -1.6;
const PIER = [36, 44, 372, 394];
function surf(x, z) { for (const hk of [BCN.grSurf, BCN.btSurf]) if (hk) { const s2 = hk(x, z); if (s2 !== undefined) return s2 } if (x < XMIN || x > XMAX || z < ZMIN) return null; if (z > ZQ) return x > PIER[0] && x < PIER[1] && z < PIER[3] ? .2 : null; return 0 }
BCN.surf = surf; BCN.WY = WY; BCN.ZQ = ZQ;

/* ======================= sign atlas (Catalan shop signs, all fictional businesses) ======================= */
const SG = { r: {} }, NW = () => AV.nwkit;
const SANS = 'Arial, sans-serif', SERIF = 'Georgia, "Times New Roman", serif', MODF = '"Trebuchet MS", "Gill Sans", Arial, sans-serif';
const rot = (top, sub, bg, fg, o) => (g, w, h) => { o = o || {}; g.fillStyle = bg; g.fillRect(0, 0, w, h); if (o.tiles) for (let x = 0; x < w; x += 16) { g.fillStyle = o.tiles[((x / 16) | 0) % o.tiles.length]; g.fillRect(x, 0, 16, 9); g.fillRect(x, h - 9, 16, 9) }
  g.strokeStyle = fg; g.lineWidth = 3; g.strokeRect(14, 14, w - 28, h - 28); g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; NW().fit(g, top, w - 70, h * .46, (o.font || '700 #px ') + (o.serif ? SERIF : o.mod ? MODF : SANS), sub ? h * .42 : h * .52, w / 2);
  if (sub) { g.fillStyle = o.subc || fg; NW().fit(g, sub, w - 90, h * .16, '600 #px ' + SANS, h * .78, w / 2) } };
const plaque = (dist, name) => (g, w, h) => { g.fillStyle = '#eeeae2'; g.fillRect(0, 0, w, h); g.strokeStyle = '#8a8478'; g.lineWidth = 4; g.strokeRect(5, 5, w - 10, h - 10); g.fillStyle = '#2a2a2a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '600 13px ' + SANS; g.fillText(dist, w / 2, 20); NW().fit(g, name, w - 24, 26, '700 #px ' + SERIF, 52, w / 2) };
const awn = (c1, c2) => (g, w, h) => { for (let x = 0; x < w; x += 32) { g.fillStyle = (x / 32) % 2 ? c2 : c1; g.fillRect(x, 0, 32, h) } g.fillStyle = 'rgba(0,0,0,.14)'; g.fillRect(0, h * .72, w, h * .28) };
const SIGNS = [
  ['casasimi', 512, 128, rot('CASA SIMI', 'modernisme · 1906 · visites', '#f4ecd8', '#5a3a1a', { serif: true, tiles: ['#3ab0c8', '#e8a03a', '#8ac83a', '#d84a6a'] })],
  ['moda', 640, 128, rot('Moda Gràcia', 'prêt-à-porter · Passeig de Gràcia', '#141414', '#f4f0e8', { font: '300 #px ' })],
  ['llibreria', 640, 128, rot('Llibreria El Drac', 'llibres · còmics · mapes', '#2a4a2a', '#f2d890', { serif: true })],
  ['vermut', 448, 112, rot('Vermuteria Can Pep', 'vermut de la casa · olives', '#7a1a1a', '#f4e0b0', { serif: true })],
  ['pastis', 448, 112, rot('Pastisseria La Mona', 'coques · ensaïmades · bombons', '#f4dce4', '#7a2a4a', { serif: true, subc: '#3a6a5a' })],
  ['magatzems', 1024, 128, rot('GRANS MAGATZEMS SIMI', 'moda · llar · souvenirs · terrassa', '#1a2a4a', '#f4f0e0')],
  ['granja', 640, 128, rot('Granja La Banana', 'xocolata desfeta · xurros · melindros', '#f4e8c8', '#5a2a12', { serif: true, subc: '#8a5a2a' })],
  ['tapes', 640, 128, rot('Bar de Tapes El Simi', 'braves · pa amb tomàquet · vermut', '#1a2a1e', '#f2c860')],
  ['forn', 448, 112, rot('Forn Sant Simi', 'pa · coca · ensaïmada', '#3a2a1a', '#f4d890', { serif: true })],
  ['jazz', 640, 160, (g, w, h) => { g.fillStyle = '#0c0a14'; g.fillRect(0, 0, w, h); g.shadowColor = '#4ad8ff'; g.shadowBlur = 18; g.fillStyle = '#bff0ff'; g.textAlign = 'center'; g.textBaseline = 'middle'; NW().fit(g, 'SALA SIMI JAZZ CLUB', w - 60, 60, 'italic 800 #px ' + SERIF, 60, w / 2); g.shadowColor = '#ff4ab0'; g.fillStyle = '#ffc0e0'; NW().fit(g, 'JAZZ · RUMBA · JAM SESSION · 21h — 3h', w - 100, 24, '800 #px ' + SANS, 122, w / 2); g.shadowBlur = 0 }],
  ['flamenc', 640, 128, (g, w, h) => { g.fillStyle = '#1a0a0a'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8281e'; g.fillRect(0, 0, w, 10); g.fillRect(0, h - 10, w, 10); g.fillStyle = '#f4d890'; g.textAlign = 'center'; g.textBaseline = 'middle'; NW().fit(g, 'TABLAO EL DUENDE', w - 60, 60, 'italic 700 #px ' + SERIF, 54, w / 2); g.fillStyle = '#ff9a7a'; NW().fit(g, 'FLAMENC · espectacle 20:00 · 22:00', w - 90, 20, '700 #px ' + SANS, 102, w / 2) }],
  ['souvenir', 448, 112, rot('Records de Barcelona', 'imants · ventalls · samarretes', '#f2c230', '#1a1a1a')],
  ['samarreta', 448, 112, rot('La Samarreta', 'SIMI FC · botiga de futbol', '#1a3a8a', '#f2c230')],
  ['cava', 448, 112, rot('Xampanyeria Bombolles', 'cava · entrepans', '#f4f0e0', '#1a3a2a', { serif: true })],
  ['paella', 640, 128, rot('La Paella del Port', 'arròs · peix · terrassa al mar', '#f4f0e0', '#c8501a', { serif: true, subc: '#1a4a6a' })],
  ['bicis', 448, 112, rot('BiciApe', 'lloguer de bicis · bike rental', '#e8e8e4', '#c8281e')],
  ['cafe', 640, 128, rot('Cafè de la Rambla', 'des de 1902 · cafè · orxata', '#2a1a12', '#e8c868', { serif: true })],
  ['disc', 640, 128, rot('Groove Dealers Discos', 'VINILS · jazz · rumba · dub', '#8a1a1a', '#f4e0a8')],
  ['gelat', 448, 112, rot('Gelats Mediterrani', 'gelats artesans · orxata', '#f4f4ec', '#2a7a9a')],
  ['mercat', 1024, 192, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); ['#c8281e', '#f2a83a', '#3aa85a', '#2a7ad8', '#c84ad8'].forEach((c, i) => gr.addColorStop(i / 4, c)); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#f4f0e0'; g.fillRect(16, 16, w - 32, h - 32); g.fillStyle = '#1a3a2a'; g.textAlign = 'center'; g.textBaseline = 'middle'; NW().fit(g, 'MERCAT DE LA RAMBLA', w - 120, 96, '900 #px ' + MODF, 82, w / 2); NW().fit(g, 'fruita · pernil · peix · olives · torrons', w - 200, 30, '700 #px ' + SANS, 150, w / 2) }],
  ['metro', 256, 256, (g, w, h) => { g.fillStyle = '#c8281e'; g.beginPath(); g.moveTo(w / 2, 6); g.lineTo(w - 6, h / 2); g.lineTo(w / 2, h - 6); g.lineTo(6, h / 2); g.closePath(); g.fill(); g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '900 120px ' + SANS; g.fillText('M', w / 2, h / 2 + 6) }],
  ['metrolbl', 512, 96, (g, w, h) => { g.fillStyle = '#c8281e'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; NW().fit(g, 'METRO · L3', w - 40, 52, '900 #px ' + SANS, h / 2, w / 2) }],
  ['merce', 1024, 160, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); ['#f2c230', '#c8281e', '#f2c230', '#c8281e'].forEach((c, i) => gr.addColorStop(i / 3, c)); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#1a1a1a'; g.textAlign = 'center'; g.textBaseline = 'middle'; NW().fit(g, 'FESTES DE LA MERCÈ', w - 100, 84, '900 #px ' + MODF, 64, w / 2); NW().fit(g, 'castells · correfoc · gegants · concerts al port', w - 160, 26, '800 #px ' + SANS, 130, w / 2) }],
  ['palau', 640, 96, rot('PALAU DE LA GENERALITAT', '', '#d8ccb0', '#3a3022', { serif: true })], ['ajunt', 640, 96, rot('AJUNTAMENT DE BARCELONA', '', '#d8ccb0', '#3a3022', { serif: true })],
  ['pl_pdg', 256, 80, plaque('Eixample', 'Passeig de Gràcia')], ['pl_rambla', 256, 80, plaque('Ciutat Vella', 'La Rambla')], ['pl_reial', 256, 80, plaque('Ciutat Vella', 'Plaça Reial')], ['pl_bisbe', 256, 80, plaque('Barri Gòtic', 'Carrer del Bisbe')], ['pl_ferran', 256, 80, plaque('Barri Gòtic', 'Carrer de Ferran')],
  /* generic ground-floor shops that dress the streets */
  ['g_farmacia', 448, 104, (g, w, h) => { g.fillStyle = '#f4f4f0'; g.fillRect(0, 0, w, h); g.fillStyle = '#2aa84a'; g.fillRect(20, 30, 46, 14); g.fillRect(36, 14, 14, 46); g.fillStyle = '#1a6a3a'; g.textAlign = 'left'; g.textBaseline = 'middle'; NW().fit(g, 'FARMÀCIA', w - 120, 46, '900 #px ' + SANS, h / 2, 90) }],
  ['g_estanc', 448, 104, (g, w, h) => { g.fillStyle = '#7a3a12'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2c230'; g.textAlign = 'center'; g.textBaseline = 'middle'; NW().fit(g, 'ESTANC · Tabacs · Segells', w - 50, 40, '900 #px ' + SANS, h / 2, w / 2) }],
  ['g_bodega', 448, 104, rot('Bodega Can Ramon', 'vins a granel', '#3a0f14', '#e8c868', { serif: true })], ['g_roba', 448, 104, rot('Roba Núria', 'moda dona', '#f4e8f0', '#6a2a5a')],
  ['g_sabates', 448, 104, rot('Sabateria Vidal', 'espardenyes', '#1a2a3a', '#f4e0b0')], ['g_joieria', 448, 104, rot('Joieria Or i Plata', '', '#141414', '#e8c868', { serif: true })],
  ['g_ferreteria', 448, 104, rot('Ferreteria Puig', 'eines · pany · claus', '#2a4a6a', '#f4f0e0')], ['g_fruita', 448, 104, rot('Fruites i Verdures', 'de l’horta', '#3a6a2a', '#f4f0e0')],
  ['g_optica', 448, 104, rot('Òptica Llum', '', '#f4f4f0', '#1a3a6a', { font: '300 #px ' })], ['g_bar', 448, 104, rot('Bar Manolo', 'esmorzars · menú', '#c8281e', '#f4f0e0')],
  ['g_forn', 448, 104, rot('Forn de Pa', 'pa · pastes', '#e8d0a0', '#5a3a1a', { serif: true })], ['g_ceramica', 448, 104, rot('Ceràmica Blava', 'rajoles · plats', '#2a5a9a', '#f4f0e0', { tiles: ['#2a5a9a', '#f4f0e0'] })],
  ['g_perruq', 448, 104, rot('Perruqueria Glòria', '', '#f4dce4', '#5a2a3a')], ['g_vins', 448, 104, rot('Vins i Caves', 'del Penedès', '#2a1a12', '#e8c868', { serif: true })],
  ['g_queviures', 448, 104, rot('Queviures Ferrer', 'embotits · formatges', '#1a3a2a', '#f4e0b0')], ['g_merceria', 448, 104, rot('Merceria La Agulla', 'fils · botons', '#f4ecd8', '#3a2a5a')],
  ['w_roba', 256, 160, (g, w, h) => { g.fillStyle = '#f4f0ea'; g.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++) { g.fillStyle = ['#c8281e', '#1a1a1a', '#2a5a9a', '#e8a03a'][i]; g.beginPath(); g.moveTo(40 + i * 56, 34); g.lineTo(62 + i * 56, 34); g.lineTo(74 + i * 56, 140); g.lineTo(28 + i * 56, 140); g.fill(); g.fillStyle = '#d8b898'; g.beginPath(); g.arc(51 + i * 56, 22, 10, 0, TAU); g.fill() } }],
  ['w_menjar', 256, 160, (g, w, h) => { g.fillStyle = '#f2e6c8'; g.fillRect(0, 0, w, h); for (let i = 0; i < 6; i++) { g.fillStyle = ['#8a3a1a', '#d8983a', '#c8281e', '#e8c060'][i % 4]; g.beginPath(); g.ellipse(26 + i * 40, 60 + (i % 2) * 44, 16, 22, .3, 0, TAU); g.fill() } }],
  ['w_ceramica', 256, 160, (g, w, h) => { g.fillStyle = '#f4f0e6'; g.fillRect(0, 0, w, h); for (let r = 0; r < 3; r++) for (let i = 0; i < 5; i++) { g.fillStyle = ['#2a5a9a', '#e8a03a', '#3aa85a', '#c8281e'][(i + r) % 4]; g.beginPath(); g.arc(28 + i * 50, 30 + r * 50, 18, 0, TAU); g.fill(); g.fillStyle = '#f4f0e6'; g.beginPath(); g.arc(28 + i * 50, 30 + r * 50, 8, 0, TAU); g.fill() } }],
  ['w_llibres', 256, 160, (g, w, h) => { g.fillStyle = '#3a2a1e'; g.fillRect(0, 0, w, h); for (let r = 0; r < 3; r++) for (let x = 6, k = 0; x < w - 14; k++) { const bw = 6 + ((k * 7 + r * 3) % 9); g.fillStyle = ['#8a2a2a', '#2a4a6a', '#e8dcc0', '#3a6a3a', '#c8a040'][(k + r) % 5]; g.fillRect(x, 10 + r * 50, bw, 38); x += bw + 1 } }],
  ['a_red', 512, 96, awn('#c8281e', '#f4f0e8')], ['a_green', 512, 96, awn('#1a5a3a', '#f4f0e8')], ['a_blue', 512, 96, awn('#1a4a8a', '#f4f0e8')], ['a_ochre', 512, 96, awn('#d8902a', '#f4f0e8')]];
const GEN = SIGNS.filter(s => /^g_/.test(s[0])).map(s => s[0]), WIN = ['w_roba', 'w_menjar', 'w_ceramica', 'w_llibres'], AWN = ['a_red', 'a_green', 'a_blue', 'a_ochre'];

/* ======================= architecture kit ======================= */
const EIX = [0xe8cfa8, 0xdcc0a0, 0xf0dcc0, 0xe6c4b0, 0xd8c8b4, 0xe0b890, 0xd0c8b8, 0xead8b8], GOT = [0xb8a078, 0xc4ac84, 0xa89470, 0xbcaa88, 0xcab694];
const SHUT = [0x3a6a4a, 0x2a5a3a, 0x4a7a5a, 0x6a5a3a], SHOPC = [0x1a2a1e, 0x2a1a12, 0x1a1a1a, 0x3a1418, 0x1a2a4a, 0x2a3a2a], MODC = [0x3ab0c8, 0xe8a03a, 0x8ac83a, 0xd84a6a, 0x2a7ad8];
const IRON = 0x1e1e20, FRAME = 0xeadcc4;
/* one building on a lot: front face at local z = 0 looking +z, body back to -d */
function edifici(P, Gl, Gs, fx, fz, yaw, w, h, d, o) { const K = AV.kit, BG = K.BG, rng = o.rng, col = o.col, got = !!o.got;
  const base = new THREE.Matrix4().makeRotationY(yaw).premultiply(new THREE.Matrix4().makeTranslation(fx, 0, fz));
  const put = (arr, geo, hex, x, y, z, sx, sy, sz, rx) => { const m = K.M(x, y, z, sx, sy, sz, rx || 0, 0, 0); m.premultiply(base); arr.push([geo, hex, m, 0]) };
  const gf = got ? 4 : 4.6, fl = got ? 3.1 : 3.35, ww = got ? .95 : 1.2, wh = got ? 1.9 : 2.3, litP = o.litP == null ? .3 : o.litP, warm = () => rng() < .7 ? 0xffd8a0 : 0xfff0d0;
  const nwin = Math.max(1, Math.round((w - .8) / (got ? 2.4 : 2.7))), dark = got ? 0x2a2620 : 0x2a3038;
  if (o.pass) { put(P, BG.box, col, 0, (5.2 + h) / 2, -d / 2, w, h - 5.2, d); for (const s of [-1, 1]) put(P, BG.box, col, s * (w / 2 - .4), 2.6, -d / 2, .8, 5.2, d); put(P, BG.box, got ? 0x9a8462 : 0xc8b898, 0, 5, .02, w, .4, .1); put(P, BG.box, 0x6a6258, 0, .015, -d / 2, w - 1.6, .02, d) }
  else if (o.hollow) { const t = .3; put(P, BG.box, col, 0, (gf + h) / 2, -d / 2, w, h - gf, d); put(P, BG.box, col, 0, gf / 2, -d + t / 2, w, gf, t); for (const sx of [-1, 1]) put(P, BG.box, col, sx * (w / 2 - t / 2), gf / 2, -d / 2, t, gf, d);
    const dv = w / 2 - 1.1, sc = o.shopCol || SHOPC[0]; put(P, BG.box, sc, 0, gf - .45, .06, w, .9, .16); put(P, BG.box, sc, -w / 2 + .2, (gf - .9) / 2, .06, .4, gf - .9, .16); put(P, BG.box, sc, dv - .85, (gf - .9) / 2, .06, .3, gf - .9, .16); put(P, BG.box, sc, w / 2 - .15, (gf - .9) / 2, .06, .3, gf - .9, .16);
    const gx0 = -w / 2 + .4, gx1 = dv - 1; put(Gs, BG.box, 0xa8c8d8, (gx0 + gx1) / 2, 1.85, .07, gx1 - gx0, 2.7, .04); put(P, BG.box, sc, (gx0 + gx1) / 2, .3, .07, gx1 - gx0, .6, .14) }
  else put(P, BG.box, col, 0, h / 2, -d / 2, w, h, d);
  /* ground floor */
  if (!o.pass) put(P, BG.box, got ? 0x9a8462 : 0xb8a888, 0, .4, .03, w, .8, .06);
  if (o.pass || o.hollow) { }
  else if (o.shop) { const sc = o.shopCol || SHOPC[(rng() * SHOPC.length) | 0]; put(P, BG.box, sc, 0, gf - .5, .06, w - .2, .8, .14); for (const sx of [-1, 1]) put(P, BG.box, got ? 0x8a7458 : 0xc8b898, sx * (w / 2 - .3), (gf - .9) / 2, .06, .5, gf - .9, .16);
    put(o.lit ? Gl : Gs, BG.box, o.lit ? warm() : 0xa8c8d8, -.4, 1.75, .09, w - 2.4, 2.5, .04); put(P, BG.box, 0x141414, w / 2 - 1.1, 1.45, .09, 1.1, 2.8, .05) }
  else { put(P, BG.box, got ? 0x3a2a1a : [0x2a3a2a, 0x3a2a1a, 0x1a2a3a][(rng() * 3) | 0], 0, 1.8, .05, 2, 3.6, .1); if (got) put(P, BG.box, 0x9a8462, 0, 3.75, .06, 2.6, .3, .14); for (const sx of [-1, 1]) if (w > 7) { put(P, BG.box, dark, sx * w * .32, 2.1, .05, 1, 1.6, .05); put(P, BG.box, IRON, sx * w * .32, 2.1, .1, 1.1, 1.7, .02) } }
  put(P, BG.box, got ? 0x9a8462 : FRAME, 0, gf, .12, w + .06, .22, .26);
  /* floors */
  const nf = Math.max(2, Math.floor((h - gf - .8) / fl)), trib = !got && o.trib && w > 7;
  for (let f = 0; f < nf; f++) { const y = gf + .4 + f * fl, princ = !got && f === 0;
    if (princ) { put(P, BG.box, FRAME, 0, y - .05, .4, w - .3, .14, .8); put(P, BG.box, IRON, 0, y + .5, .78, w - .4, .85, .04) }
    for (let i = 0; i < nwin; i++) { const x = (i - (nwin - 1) / 2) * ((w - .6) / nwin), L1 = rng() < litP, s = rng();
      if (trib && f === 1 && nwin > 2 && i === ((nwin - 1) / 2 | 0)) continue;
      put(P, BG.box, got ? 0xd8c8a8 : FRAME, x, y + wh / 2 + .1, .03, ww + .32, wh + .3, .06);
      if (s < .22) put(P, BG.box, SHUT[(rng() * SHUT.length) | 0], x, y + wh / 2 + .1, .07, ww, wh, .05);
      else { put(L1 ? Gl : P, BG.box, L1 ? warm() : dark, x, y + wh / 2 + .1, .05, ww, wh, .04); if (!got && s < .55) { const sc = SHUT[(i + f) % SHUT.length]; for (const sd of [-1, 1]) put(P, BG.box, sc, x + sd * (ww / 2 + .3), y + wh / 2 + .1, .09, .52, wh, .04) } }
      if (!princ && (got ? rng() < .45 : f < nf - 1)) { put(P, BG.box, got ? 0xb8a888 : FRAME, x, y - .02, .32, ww + .7, .12, .64); put(P, BG.box, IRON, x, y + .45, .62, ww + .7, .8, .03); if (got && rng() < .5) put(P, BG.sph, [0xd8302a, 0xe85a9a, 0x3a8a3a][(rng() * 3) | 0], x - ww / 2, y + .3, .45, .35, .3, .3) } }
    if (!got && f < nf - 1) put(P, BG.box, FRAME, 0, y + fl - .25, .05, w, .1, .1) }
  if (trib) { const y = gf + .4 + fl; put(P, BG.box, FRAME, 0, y + 1.2, .55, w * .38, 2.9, 1.1); put(Gs, BG.box, 0xa8c8d8, 0, y + 1.25, 1.11, w * .34, 2.4, .03); put(Gl, BG.box, 0xfff0d0, 0, y + 1.25, 1.06, w * .3, .25, .02) }
  /* top: modernista band + crest, cornice, roof terrace parapet, rooftop clutter */
  if (o.mod) { const mc = MODC[(rng() * MODC.length) | 0]; put(P, BG.box, mc, 0, h - .7, .08, w, .8, .08); for (let k = 0; k < 5; k++) put(P, BG.box, k % 2 ? col : mc, (k - 2) * w / 5, h + .5 + (k === 2 ? 1.2 : k % 2 ? .7 : .3), .05, w / 5, 1.2 + (k === 2 ? 1.2 : 0), .3) }
  put(P, BG.box, got ? 0xa89474 : FRAME, 0, h + .12, .18, w + .1, .28, .5); if (!o.mod) put(P, BG.box, col, 0, h + .7, -.12, w, .9, .26);
  if (rng() < .5) put(P, BG.cyl, 0x8a8a88, (rng() - .5) * w * .6, h + 1.2, -d * .5, .9, 1.6, .9); else put(P, BG.box, got ? 0xb89a78 : 0xe8e0d0, (rng() - .5) * w * .5, h + 1.1, -d * .55, 2.4, 2.2, 2.4);
  return base }

/* ======================= the world ======================= */
AV.registerWorld({
  id: 'barcelona',
  build(ctx) {
    const K = AV.kit, BG = K.BG, rng = ctx.rng, grp = ctx.group, S = AV.S;
    const st = () => { S.barcelona = S.barcelona || { met: {}, q: {}, metro: 0, boat: 0 }; return S.barcelona };
    const T = (x, z, r, label, fn, show, kind) => { const t = { x, z, r, label, fn, show, kind }; ctx.T.push(t); return t };
    const P = [], Gl = [], Gs = [], Q = [], cols = ctx.cols, circ = ctx.circles;
    const box = (arr, hex, x0, x1, y0, y1, z0, z1) => arr.push([BG.box, hex, K.M((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0)), 0]);
    const sign = (k, x, y, z, w, h, ry, dbl) => { Q.push({ k, x, y, z, w, h, ry }); if (dbl) Q.push({ k, x: x - Math.sin(ry) * .03, y, z: z - Math.cos(ry) * .03, w, h, ry: ry + PI }) };
    const P0 = P, Gl0 = Gl, Gs0 = Gs, sign0 = sign;
    let gi = 0; const nextGen = () => GEN[(gi++ * 7) % GEN.length];
    /* ---------- ground: grey panot paving everywhere, asphalt for the carriageways, darker stone in the old-town lanes ---------- */
    const tex = (fn, rep) => { const c = document.createElement('canvas'); c.width = c.height = 256; fn(c.getContext('2d')); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t };
    const pave = tex(g => { g.fillStyle = '#a8a29a'; g.fillRect(0, 0, 256, 256); g.strokeStyle = '#8e8880'; g.lineWidth = 3; for (let y = 0; y < 256; y += 64) for (let x = 0; x < 256; x += 64) { g.strokeRect(x + 2, y + 2, 60, 60); g.beginPath(); g.arc(x + 32, y + 32, 14, 0, TAU); g.stroke(); for (const [a, b] of [[x + 32, y + 2], [x + 32, y + 62], [x + 2, y + 32], [x + 62, y + 32]]) { g.beginPath(); g.arc(a, b, 6, 0, TAU); g.stroke() } } }, .5);
    { const g = new THREE.PlaneGeometry(XMAX - XMIN, ZQ - ZMIN); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (XMAX - XMIN) / 2, uv.getY(i) * (ZQ - ZMIN) / 2); g.rotateX(-PI / 2);
      const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: pave, roughness: .9 })); m.position.set((XMIN + XMAX) / 2, -.01, (ZMIN + ZQ) / 2); m.receiveShadow = true; m.material.userData.lin = 1; grp.add(m) }
    const ASPH = 0x38393e, LINE = 0xe8e8e4, KERB = 0xb8b0a4, STN = 0x948a7a;
    const road = (x0, x1, z0, z1) => { box(P, ASPH, x0, x1, 0, .03, z0, z1); if (x1 - x0 > z1 - z0) { box(P, KERB, x0, x1, 0, .14, z0 - .2, z0); box(P, KERB, x0, x1, 0, .14, z1, z1 + .2); for (let x = x0 + 2; x < x1 - 2; x += 7) box(P, LINE, x, x + 3.5, .03, .04, (z0 + z1) / 2 - .1, (z0 + z1) / 2 + .1) } else { box(P, KERB, x0 - .2, x0, 0, .14, z0, z1); box(P, KERB, x1, x1 + .2, 0, .14, z0, z1); for (let z = z0 + 2; z < z1 - 2; z += 7) box(P, LINE, (x0 + x1) / 2 - .1, (x0 + x1) / 2 + .1, .03, .04, z, z + 3.5) } };
    /* Eixample streets: [centre, width, from, to] */
    const VX = [[-176, 14, -306, 340], [-92, 14, -306, -40], [0, 30, -306, -40], [92, 14, -306, 34], [176, 14, -306, 340]], HZ = [[-299, -183, 183], [-215, -183, 183], [-131, -183, 183], [-47, -183, 183], [27, -183, 183]];
    for (const [x, w, z0, z1] of VX) { if (x === -92) { box(P, 0x9a9488, x - 2, x + 2, 0, .02, z0, z1); continue } const a = x === 0 ? 9 : 3.5; road(x - a, x + a, z0, z1) }
    for (const [z, x0, x1] of HZ) road(x0, x1, z - 3.5, z + 3.5);
    road(XMIN, XMAX, 342.5, 351.5); road(104, 116, 34, 340); road(-86, -80, 34, 340); road(-64, -58, 34, 340);   /* Passeig de Colom, Via Laietana, the two Rambla roads */
    for (const [z0, z1] of [[-302.5, -295.5], [-218.5, -211.5], [-134.5, -127.5], [-50.5, -43.5], [23.5, 30.5]]) for (const x of [-176, 0, 92, 176]) { const a = x === 0 ? 9 : 3.5; for (let k = 0; k < 6; k++) box(P, LINE, x - a - 3 - .4, x - a - .6, .03, .045, z0 + .3 + k * 1.2, z0 + .9 + k * 1.2) }   /* zebras */
    /* old-town lanes: darker stone */
    const LANES = [[-30, -23, 34, 325], [12, 24, 34, 108], [16, 24, 108, 325], [64, 72, 34, 108], [64, 72, 207, 325], [-55, 100, 100, 108], [-55, 16, 160, 167], [-55, 16, 215, 222], [24, 100, 200, 207], [-55, 16, 250, 258], [64, 100, 250, 258], [-55, 100, 325, 333], [-140, -132, 34, 340], [-169, -89, 110, 118], [-169, -89, 220, 228], [120, 169, 130, 138], [120, 169, 236, 244]];
    for (const r of LANES) box(P, STN, r[0], r[1], 0, .018, r[2], r[3]);
    /* ---------- building rows ---------- */
    const SHOPS = {}, SPB = {}, PC = BCN.passC = {};   /* where each passatge really landed (the row walker may shift a special lot) */
    const SPECIAL = [['casasimi', 'x21W', -173, 24], ['moda', 'x12E', -95, 12, 10], ['llibreria', 'x12W', -80, 11, 9], ['vermut', 'x22S', 50, 9], ['pastis', 'x11S', -62, 9], ['gelat', 'x32W', -80, 8], ['disc', 'x02E', -90, 9],
      ['pas_x11N', 'x11N', -50, 8, 14], ['pas_x11S', 'x11S', -42, 8, 14], ['magatzems', 'gmW', -10, 56],
      ['granja', 'gA1E', 70, 8, 9], ['tapes', 'gA2S', -5, 10, 10], ['forn', 'gA2W', 60, 7], ['jazz', 'reS', -14, 9, 7], ['flamenc', 'reN', 10, 8, 7], ['souvenir', 'gD1W', 236, 8], ['samarreta', 'gB1W', 130, 8],
      ['pas_reN', 'reN', -3, 6, 8], ['pas_reS', 'reS', -3, 6, 8], ['pas_reW', 'reW', 291, 6, 8], ['pas_reE', 'reE', 291, 6, 8],
      ['cafe', 'rvA1E', 70, 10, 9], ['cava', 'bo2N', 145, 9], ['paella', 'prom', 40, 12], ['bicis', 'prom', 80, 8], ['palau', 'palS', 44, 40], ['ajunt', 'ajN', 44, 40]];
    let nB = 0;
    function row(id, ax, front, a0, a1, face, depth, o) { o = o || {}; nB += NW().rowWalk({ id, ax, front, a0, a1, face, depth, rng, SPECIAL, SHOPS, cols, gaps: o.gaps, wmin: o.wmin || 7, wmax: o.wmax || 11, lot: L => {
      const P = L.skip ? [] : P0, Gl = L.skip ? [] : Gl0, Gs = L.skip ? [] : Gs0, sign = L.skip ? () => { } : sign0, got = o.kind === 'got', h = (o.h0 || 19) + rng() * (o.hr || 4);
      if (L.isSp && L.sp[0].startsWith('pas_')) { edifici(P, Gl, Gs, L.fx, L.fz, L.yaw, L.w, h, depth, { rng, col: (got ? GOT : EIX)[(rng() * 5) | 0], got, pass: true }); const a = L.a, b = L.a + L.w, f0 = Math.min(front, front - face * depth), f1 = Math.max(front, front - face * depth);
        for (const [u0, u1] of [[a, a + .8], [b - .8, b]]) cols.push(ax === 'z' ? [f0, f1, u0, u1] : [u0, u1, f0, f1]); PC[L.sp[0]] = ax === 'z' ? [(f0 + f1) / 2, L.ac] : [L.ac, (f0 + f1) / 2]; return }
      if (L.isSp && SPB[L.sp[0]]) { SPB[L.sp[0]](P, Gl, Gs, L, depth); return }
      const shop = L.isSp || rng() < (o.shopP == null ? .7 : o.shopP);
      edifici(P, Gl, Gs, L.fx, L.fz, L.yaw, L.w, h, depth, { rng, col: (got ? GOT : EIX)[(rng() * (got ? GOT : EIX).length) | 0], got, shop, lit: shop && rng() < .8, hollow: L.isSp && L.sp[4], mod: !got && rng() < (o.modP || .08), trib: !got && rng() < .25, litP: o.litP, shopCol: L.isSp ? SHOPC[(L.ac | 0) & 3] : null });
      const sx = L.fx + L.out[0] * .24, sz = L.fz + L.out[1] * .24, gy = got ? 3.5 : 4.1;
      if (shop && !L.isSp) { sign(nextGen(), sx, gy, sz, L.w - .9, (L.w - .9) * .232, L.yaw); if (rng() < .6) sign(WIN[(rng() * WIN.length) | 0], L.fx + L.out[0] * .15, 1.75, L.fz + L.out[1] * .15, Math.max(1, L.w - 2.6), 2, L.yaw) }
      if (shop && rng() < .4) { const aw = L.w - .8; P.push([BG.box, 0x2a2a2a, K.M(L.fx + L.out[0] * 1.5, gy - .8, L.fz + L.out[1] * 1.5, L.al[0] ? aw : .04, .05, L.al[1] ? aw : .04), 0]); sign(AWN[(rng() * 4) | 0], L.fx + L.out[0] * .9, gy - .55, L.fz + L.out[1] * .9, aw, .9, L.yaw) } } }) }
    const fill = (x0, x1, z0, z1, h0, hr, kind) => { if (x1 - x0 < .5 || z1 - z0 < .5) return; for (let x = x0; x < x1 - .5; x += 22) for (let z = z0; z < z1 - .5; z += 22) { const xa = Math.min(x1, x + 22), za = Math.min(z1, z + 22), h = h0 + rng() * hr; box(P, (kind === 'got' ? GOT : EIX)[(rng() * 5) | 0], x, xa, 0, h, z, za); box(P, 0xc8c0b0, x + .4, xa - .4, h, h + .5, z + .4, za - .4) } cols.push([x0, x1, z0, z1]) };
    /* a block: rows on its street sides (o.sides), a filled core; Eixample blocks get chamfered corners with a corner building each */
    const blk = (id, x0, x1, z0, z1, o) => { o = o || {}; const S2 = o.sides || 'NSWE', C = o.cham ? 9 : 0, dz = Math.min(o.d || 14, (z1 - z0) / 2), dx = Math.min(o.d || 14, (x1 - x0) / 2), WE = o.pri === 'WE';
      const hasN = S2.includes('N'), hasS = S2.includes('S'), hasW = S2.includes('W'), hasE = S2.includes('E');
      const nx0 = C ? x0 + C : WE && hasW ? x0 + dx : x0, nx1 = C ? x1 - C : WE && hasE ? x1 - dx : x1, wz0 = C ? z0 + C : !WE && hasN ? z0 + dz : z0, wz1 = C ? z1 - C : !WE && hasS ? z1 - dz : z1;
      if (hasN) row(id + 'N', 'x', z0, nx0, nx1, -1, dz, o); if (hasS) row(id + 'S', 'x', z1, nx0, nx1, 1, dz, o);
      if (hasW) row(id + 'W', 'z', x0, wz0, wz1, -1, dx, o); if (hasE) row(id + 'E', 'z', x1, wz0, wz1, 1, dx, o);
      if (C) for (const [cx, cz, sx, sz] of [[x0, z0, 1, 1], [x1, z0, -1, 1], [x0, z1, 1, -1], [x1, z1, -1, -1]]) { const mx = cx + sx * C / 2, mz = cz + sz * C / 2, yaw = Math.atan2(-sx, -sz), h = (o.h0 || 19) + 2 + rng() * 3, shop = rng() < .8;
        edifici(P, Gl, Gs, mx, mz, yaw, C * Math.SQRT2, h, 9, { rng, col: EIX[(rng() * EIX.length) | 0], shop, lit: shop, trib: true, mod: rng() < .15 }); if (shop) sign(nextGen(), mx - sx * .17, 4.1, mz - sz * .17, C * Math.SQRT2 - 1, (C * Math.SQRT2 - 1) * .232, yaw);
        for (let k = 1; k < 4; k++) { const a = k * C / 4, b = (k + 1) * C / 4, v0 = C - a; const xs = [cx + sx * a, cx + sx * b], zs = [cz + sz * v0, cz + sz * C]; cols.push([Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)]); const zs2 = [cz + sz * a, cz + sz * b], xs2 = [cx + sx * v0, cx + sx * C]; cols.push([Math.min(...xs2), Math.max(...xs2), Math.min(...zs2), Math.max(...zs2)]) } }
      const c0 = x0 + (hasW ? dx : 0), c1 = x1 - (hasE ? dx : 0), c2 = z0 + (hasN ? dz : 0), c3 = z1 - (hasS ? dz : 0); if (o.core === 'garden') return [c0, c1, c2, c3]; if (c1 - c0 > .5 && c3 - c2 > .5) fill(c0, c1, c2, c3, o.core0 || 5, 5, o.kind); return [c0, c1, c2, c3] };
    /* special lots with their own builders */
    SPB.casasimi = (P, Gl, Gs, L, depth) => { edifici(P, Gl, Gs, L.fx, L.fz, L.yaw, L.w, 24, depth, { rng, col: 0xd8e0e4, shop: false, mod: true, trib: true, litP: .5 }); const M = new THREE.Matrix4().makeRotationY(L.yaw).premultiply(new THREE.Matrix4().makeTranslation(L.fx, 0, L.fz));
      for (let f = 0; f < 5; f++) for (let k = 0; k < 6; k++) { const m = K.M((k - 2.5) * L.w / 6, 5 + f * 3.35, .7, L.w / 6.6, .3, 1.1 + .4 * Math.sin(k + f), 0, 0, 0); m.premultiply(M); P.push([BG.box, MODC[(k + f) % MODC.length], m, 0]) }
      for (let k = 0; k < 7; k++) { const m = K.M((k - 3) * L.w / 7, 26 + (k % 2) * 1.2, -depth / 2 + (k % 3) - 1, 1, 2.2 + (k % 2), 1, 0, 0, 0); m.premultiply(M); P.push([BG.cyl, MODC[k % MODC.length], m, 0]) }
      const m = K.M(0, 26.8, -1.5, L.w * .9, 2.4, 4, -.3, 0, 0); m.premultiply(M); P.push([BG.box, 0x3a8a9a, m, 0]); sign0('casasimi', L.fx + L.out[0] * .3, 3.2, L.fz + L.out[1] * .3, 5, 1.25, L.yaw); BCN.casa = [L.fx + L.out[0] * 2.5, L.fz + L.out[1] * 2.5] };
    const stoneFront = (P, Gl, L, depth, h, key) => { edifici(P, Gl, Gs, L.fx, L.fz, L.yaw, L.w, h, depth, { rng, col: 0xd8ccb0, got: true, shop: false, litP: .4 }); const M = new THREE.Matrix4().makeRotationY(L.yaw).premultiply(new THREE.Matrix4().makeTranslation(L.fx, 0, L.fz)), add = (geo, hex, x, y, z, sx, sy, sz) => { const m = K.M(x, y, z, sx, sy, sz, 0, 0, 0); m.premultiply(M); P.push([geo, hex, m, 0]) };
      for (let k = 0; k < 4; k++) add(BG.cyl, 0xe0d4b8, (k - 1.5) * 4.4, 3.6, .8, .7, 7.2, .7); add(BG.box, 0xd0c4a4, 0, 7.4, .8, 16, .6, 1.8); add(BG.box, IRON, 0, 8.3, 1.65, 15, .9, .05); add(BG.box, 0x2a2018, 0, 2.4, .1, 3.6, 4.8, .1);
      for (const s of [-1, 1]) { add(BG.cyl, 0xc8c8c8, s * 3, 11.5, 1.4, .06, 4, .06); add(BG.box, 0xf2c230, s * 3 + .8, 12.6, 1.4, 1.6, 1.1, .03); for (let k = 0; k < 4; k++) add(BG.box, 0xc8281e, s * 3 + .8, 12.2 + k * .25, 1.42, 1.6, .1, .03) } sign0(key, L.fx + L.out[0] * .25, 9.6, L.fz + L.out[1] * .25, 10, 1.5, L.yaw) };
    SPB.palau = (P, Gl, Gs, L, depth) => { stoneFront(P, Gl, L, depth, 21, 'palau'); BCN.palau = [L.fx + L.out[0] * 3, L.fz + L.out[1] * 3] };
    SPB.ajunt = (P, Gl, Gs, L, depth) => { stoneFront(P, Gl, L, depth, 20, 'ajunt'); BCN.ajunt = [L.fx + L.out[0] * 3, L.fz + L.out[1] * 3] };
    SPB.magatzems = (P, Gl, Gs, L, depth) => { const M = new THREE.Matrix4().makeRotationY(L.yaw).premultiply(new THREE.Matrix4().makeTranslation(L.fx, 0, L.fz)), add = (arr, hex, x, y, z, sx, sy, sz) => { const m = K.M(x, y, z, sx, sy, sz, 0, 0, 0); m.premultiply(M); arr.push([BG.box, hex, m, 0]) };
      add(P, 0xe4dccc, 0, 14, -depth / 2, L.w, 28, depth); for (let y = 6; y < 26; y += 4) add(Gs, 0xa8c8d8, 0, y, .05, L.w - 2, 2.4, .04); for (let y = 6; y < 26; y += 4) add(Gl, 0xfff0d0, 0, y - .6, .06, L.w - 2, .12, .02); add(P, 0x1a2a4a, 0, 4.5, .1, L.w, 1, .2); add(Gs, 0xa8c8d8, 0, 2, .08, L.w - 4, 3.2, .04);
      for (let k = -3; k <= 3; k++) add(P, 0x1a2a4a, k * 8, 2, .12, .5, 4, .2); sign0('magatzems', L.fx + L.out[0] * .3, 24, L.fz + L.out[1] * .3, 26, 3.25, L.yaw); BCN.magatzems = [L.fx + L.out[0] * 2.4, L.fz + L.out[1] * 2.4] };
    /* EIXAMPLE: 4 x 3 chamfered blocks */
    const XS = [[-169, -99], [-85, -15], [15, 85], [99, 169]], ZS = [[-292, -222], [-208, -138], [-124, -54]], EO = { cham: true, h0: 19, hr: 5, shopP: .65, modP: .1 };
    let garden = null; for (let c = 0; c < 4; c++) for (let r = 0; r < 3; r++) { const id = 'x' + c + r, o = Object.assign({}, EO, id === 'x11' ? { core: 'garden' } : {}); const core = blk(id, XS[c][0], XS[c][1], ZS[r][0], ZS[r][1], o); if (id === 'x11') garden = core }
    /* the edges: west + east rows the full height of the city, the north row */
    const GRn = !!BCN.gracia, BTn = !!BCN.barceloneta; row('edW', 'z', -183, GRn ? -590 : -306, 340, 1, 14, { wmin: 9, wmax: 14, h0: 18, hr: 4, shopP: .5 }); row('edE', 'z', 183, GRn ? -590 : -306, BTn ? 150 : 340, -1, 14, { wmin: 9, wmax: 14, h0: 18, hr: 4, shopP: .5 }); if (!GRn) row('edN', 'x', -306, XMIN, XMAX, 1, 16, { wmin: 10, wmax: 14, h0: 20, hr: 4, shopP: .4 });
    /* south of the Gran Via: two blocks, the department store, the plaça */
    blk('gw', -169, -99, -40, 20, { h0: 19, hr: 4 }); blk('ge', 99, 169, -40, 20, { h0: 19, hr: 4 }); row('gmW', 'z', 60, -40, 20, -1, 25, {});
    /* CIUTAT VELLA - the Raval (west of La Rambla) */
    const RO = { kind: 'got', h0: 14, hr: 5, shopP: .7, wmin: 6, wmax: 9, pri: 'WE' };
    blk('rvA1', -132, -89, 34, 110, RO); blk('rvA2a', -132, -89, 118, 140, Object.assign({ sides: 'NWE' }, RO)); blk('rvA2b', -132, -89, 190, 220, Object.assign({ sides: 'SWE' }, RO)); blk('rvA3', -132, -89, 228, 340, RO);
    blk('rvB1', -169, -140, 34, 110, RO); blk('rvB2', -169, -140, 118, 220, RO); blk('rvB3', -169, -140, 228, 340, RO);
    /* the Gothic Quarter */
    const GO = { kind: 'got', h0: 13, hr: 5, shopP: .75, wmin: 5.5, wmax: 8.5 }, GW = Object.assign({ pri: 'WE' }, GO);
    blk('gA1', -55, -30, 34, 100, GW); blk('gA2', -23, 12, 34, 100, GO); blk('gA3', 24, 64, 34, 100, GO); blk('gA4', 72, 100, 34, 100, GO);
    blk('gB1', -55, -30, 108, 160, GW); blk('gB2', -23, 16, 108, 160, GO); blk('gC1', -55, -30, 167, 215, GW);
    blk('gD1', -55, -30, 222, 250, GW); blk('gD2', -23, 16, 222, 250, GO); blk('pal', 24, 64, 207, 222, Object.assign({ sides: 'NS' }, GO)); blk('gD4', 72, 100, 207, 250, GO);
    blk('gE1', -55, -30, 258, 325, GW); blk('aj', 24, 64, 280, 325, GO); blk('gE4', 72, 100, 258, 325, GO);
    /* Plaça Reial: an arcaded ring of buildings round the square, four passages through it */
    { const RR = Object.assign({}, GO, { h0: 16, hr: 1, shopP: .9, wmin: 6, wmax: 8 }); row('reN', 'x', 266, -23, 16, 1, 8, RR); row('reS', 'x', 317, -23, 16, -1, 8, RR); row('reW', 'z', -15, 266, 317, 1, 8, RR); row('reE', 'z', 8, 266, 317, -1, 8, RR);
      for (const [x0, x1, z0, z1] of [[-15, 8, 266, 267.6], [-15, 8, 315.4, 317], [-15, -13.4, 266, 317], [6.4, 8, 266, 317]]) { box(P, 0xd8ccb0, x0, x1, 4.4, 4.9, z0, z1) }
      for (let x = -14; x < 8; x += 3.2) for (const z of [267.3, 315.7]) { const pc = PC[z < 290 ? 'pas_reN' : 'pas_reS']; if (pc && Math.abs(x - pc[0]) < 4) continue; box(P, 0xd8ccb0, x - .25, x + .25, 0, 4.4, z - .25, z + .25); circ.push([x, z, .3]) } for (let z = 268; z < 316; z += 3.2) for (const x of [-14.3, 7.3]) { const pc = PC[x < 0 ? 'pas_reW' : 'pas_reE']; if (pc && Math.abs(z - pc[1]) < 4) continue; box(P, 0xd8ccb0, x - .25, x + .25, 0, 4.4, z - .25, z + .25); circ.push([x, z, .3]) } }
    /* promenade strip (between Escudellers and the port road) */
    row('prom', 'x', 340, -55, 100, 1, 7, Object.assign({}, GO, { shopP: .85, wmin: 7, wmax: 10 }));
    /* the Born (east of Via Laietana) */
    const BO = Object.assign({ pri: 'WE' }, GO, { h0: 14 }); blk('bo1', 120, 169, 34, 130, BO); blk('bo2', 120, 169, 138, 236, BO); blk('bo3', 120, 169, 244, 340, BO);
    for (const k in SHOPS) if (k.startsWith('pas_')) delete SHOPS[k];
    BCN.stats.buildings = nB;
    /* ---------- the garden courtyard (interior d'illa) inside block x11 ---------- */
    if (garden) { const [g0, g1, g2, g3] = garden; box(P, 0x6a8a3a, g0 + 3, g1 - 3, 0, .04, g2 + 3, g3 - 3); const gN = (PC.pas_x11N || [-50])[0], gS = (PC.pas_x11S || [-42])[0]; box(P, 0xc8b890, gN - 2, gN + 2, 0, .05, g2, -160); box(P, 0xc8b890, Math.min(gN, gS) - 2, Math.max(gN, gS) + 2, 0, .05, -162, -158); BCN.garden = [(g0 + g1) / 2, (g2 + g3) / 2];
      for (const [x, z] of [[g0 + 6, g2 + 6], [g1 - 6, g2 + 6], [g0 + 6, g3 - 6], [g1 - 6, g3 - 6], [g0 + 12, (g2 + g3) / 2], [g1 - 12, (g2 + g3) / 2]]) { box(P, 0x6a5a48, x - .25, x + .25, 0, 4, z - .25, z + .25); P.push([BG.ico, 0x4a7a2e, K.M(x, 5.2, z, 3, 2.6, 3), 0]); circ.push([x, z, .4]) }
      P.push([BG.cyl, 0xc8bca0, K.M(-36, .35, -182, 2.4, .7, 2.4), 0]); P.push([BG.cyl, 0x6a9ab8, K.M(-36, .72, -182, 2, .1, 2), 0]); circ.push([-36, -182, 2.5]); box(P, 0xc8b890, gS - 2, gS + 2, 0, .05, -160, g3); for (const s of [-1, 1]) { box(P, 0x6a4a2a, -50 + s * 6 - .9, -50 + s * 6 + .9, .4, .48, BCN.garden[1] - 4, BCN.garden[1] - 3.4) } }
    /* ---------- PLAÇA DE CATALUNYA (the hub): lawns, two fountains, the compass-star paving, trees ---------- */
    { box(P, 0xd8d0c0, -99, 60, 0, .02, -40, 20); for (const [x0, x1, z0, z1] of [[-90, -55, -34, -16], [-90, -55, -4, 14], [15, 52, -34, -16], [15, 52, -4, 14]]) box(P, 0x5a8a3a, x0, x1, 0, .05, z0, z1);
      for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; P.push([BG.box, k % 2 ? 0x8a7a6a : 0xe8e0d0, K.M(-20 + Math.cos(a) * 6, .035, -10 + Math.sin(a) * 6, 2.2, .02, 12, 0, -a + PI / 2, 0), 0]) } P.push([BG.cyl, 0xc8a050, K.M(-20, .04, -10, 3, .03, 3), 0]);
      for (const fx of [-38, 0]) { P.push([BG.cyl, 0xc8bca0, K.M(fx, .4, -10, 5, .8, 5), 0]); P.push([BG.cyl, 0x6a9ab8, K.M(fx, .72, -10, 4.5, .1, 4.5), 0]); P.push([BG.cyl, 0xc8bca0, K.M(fx, 1.6, -10, .6, 2.4, .6), 0]); Gl.push([BG.sph, 0xd8f0ff, K.M(fx, 3, -10, .8, 1, .8), 0]); circ.push([fx, -10, 5.2]) }
      for (const [x, z] of [[-80, -25], [-65, -25], [-80, 6], [-65, 6], [25, -25], [42, -25], [25, 6], [42, 6]]) { box(P, 0x6a5a48, x - .25, x + .25, 0, 5, z - .25, z + .25); P.push([BG.ico, 0x4a6a2e, K.M(x, 6.4, z, 3.4, 2.8, 3.4), 0]); circ.push([x, z, .4]) }
      BCN.placa = [-20, -10] }
    /* ---------- trees + lamps along the Eixample streets (plane trees) ---------- */
    const tree = (x, z, h) => { box(P, 0x8a8268, x - .2, x + .2, 0, h * .55, z - .2, z + .2); for (let k = 0; k < 3; k++) { const a = k / 3 * TAU + x; P.push([BG.ico, [0x4a6a2e, 0x5a7a34, 0x3e5e28][k], K.M(x + Math.cos(a) * 1.4, h * .78 + (k % 2) * .6, z + Math.sin(a) * 1.4, 2.4, 2, 2.4), 0]) } circ.push([x, z, .3]) };
    const nearX = (v, list, r) => list.some(c => Math.abs(v - c) < r);
    const HZc = [-299, -215, -131, -47, 27], VXc = [-176, -92, 0, 92, 176];
    for (const [x, w, z0, z1] of VX) { const off = x === 0 ? 13.5 : 5.8; if (x === -92) { for (let z = z0 + 6; z < z1; z += 12) { if (!nearX(z, HZc, 9)) tree(x, z, 8) } continue } for (let z = z0 + 6; z < Math.min(z1, 20); z += 16) { if (nearX(z, HZc, 10)) continue; tree(x - off, z, 9); tree(x + off, z, 9) } }
    for (const [z] of HZ) for (let x = -170; x < 175; x += 16) { if (nearX(x, VXc, 12) || (z === 27 && (x > -95 && x < 60 || nearX(x, [-136, -26.5, 18, 68, 110], 6)))) continue; tree(x, z - 5.8, 8.5); tree(x, z + 5.8, 8.5) }
    const lamp = (x, z, hh) => { box(P, 0x2a2a2a, x - .07, x + .07, 0, hh || 5, z - .07, z + .07); box(Gl, 0xffe8b0, x - .25, x + .25, (hh || 5) - .1, (hh || 5) + .35, z - .25, z + .25); circ.push([x, z, .15]) };
    for (const z of HZc.filter(z => z < 0)) for (const x of VXc) for (const [dx, dz] of [[-8, -8], [8, 8]]) { const ax = x === 0 ? 16 : 8; lamp(x + Math.sign(dx) * ax, z + dz) }
    /* ---------- LA RAMBLA: plane trees along the promenade, kiosks, flower stalls, the pavement mosaic, living statues' plinths ---------- */
    { for (let z = 40; z < 336; z += 10) { tree(-78.6, z, 10); tree(-65.4, z, 10) } box(P, 0xc8c0b0, -79.8, -64.2, 0, .02, 34, 340);
      const kiosk = (x, z, colr, name) => { box(P, colr, x - 1.8, x + 1.8, 0, 2.6, z - 1.4, z + 1.4); box(P, 0x2a3a2a, x - 2.3, x + 2.3, 2.6, 2.8, z - 1.9, z + 1.9); box(P, 0x2a3a2a, x - .1, x + .1, 2.8, 3.4, z - .1, z + .1); cols.push([x - 1.8, x + 1.8, z - 1.4, z + 1.4]); return [x, z] };
      BCN.kiosks = { flors1: kiosk(-72, 62, 0x3a6a3a), premsa: kiosk(-72, 96, 0x2a3a5a), flors2: kiosk(-72, 128, 0x3a6a3a), records: kiosk(-72, 262, 0xc8a040) };
      for (const [x, z] of [[-72, 62], [-72, 128]]) for (let k = 0; k < 10; k++) P.push([BG.sph, [0xd8302a, 0xf2c230, 0xe85a9a, 0xf4f0e0, 0x8a3ad8][k % 5], K.M(x - 1.6 + (k % 5) * .8, 1.1 + ((k / 5) | 0) * .4, z + (k % 2 ? 1.6 : -1.6), .35, .35, .35), 0]);
      for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; P.push([BG.box, MODC[k % MODC.length], K.M(-72 + Math.cos(a) * 2.2, .03, 178 + Math.sin(a) * 2.2, 1.4, .02, .9, 0, -a, 0), 0]) } P.push([BG.cyl, 0xf2c230, K.M(-72, .035, 178, 1.2, .02, 1.2), 0]);
      for (const [x, z] of [[-70, 146], [-74, 290]]) { P.push([BG.cyl, 0x8a8a88, K.M(x, .3, z, .7, .6, .7), 0]); circ.push([x, z, .7]) } BCN.statues = [[-70, 146], [-74, 290]];
      sign('pl_rambla', -55.2, 4.2, 40, 1.6, .5, -PI / 2); sign('pl_rambla', -88.8, 4.2, 40, 1.6, .5, PI / 2) }
    sign('pl_pdg', 14.8, 4.2, -60, 1.6, .5, -PI / 2); sign('pl_bisbe', 15.8, 4, 150, 1.6, .5, PI / 2); sign('pl_ferran', -40, 3.8, 249.8, 1.6, .5, PI);
    /* ---------- the market hall (x -132..-89, z 140..190): iron and glass, open to La Rambla and the Raval lane ---------- */
    { const X0 = -132, X1 = -89, Z0 = 140, Z1 = 190, H = 12, wl = (x0, x1, z0, z1, y1) => { box(P, 0xc8b8a0, x0, x1, 0, y1 || H, z0, z1); cols.push([x0, x1, z0, z1]) };
      wl(X0, X1, Z0, Z0 + .6); wl(X0, X1, Z1 - .6, Z1); wl(X1 - .6, X1, Z0, 158); wl(X1 - .6, X1, 172, Z1); wl(X0, X0 + .6, Z0, 159); wl(X0, X0 + .6, 171, Z1); box(P, 0xc8b8a0, X1 - .6, X1, 8, H, 158, 172); box(P, 0xc8b8a0, X0, X0 + .6, 8, H, 159, 171);
      box(Gs, 0xa8c8d8, X0, X1, H - .1, H, Z0, Z1); for (let x = X0 + 3; x < X1; x += 6) box(P, IRON, x - .1, x + .1, H - .8, H, Z0, Z1); for (let k = 0; k < 7; k++) box(Gl, MODC[k % MODC.length], X1 + .02, X1 + .06, 8.3, 9.2, 158.4 + k * 1.95, 160 + k * 1.95);
      sign('mercat', X1 + .1, 10.4, 165, 13, 2.44, PI / 2); sign('mercat', X0 - .1, 10.4, 165, 11, 2.06, -PI / 2);
      const stall = (x0, x1, z0, z1, hue) => { box(P, 0xe8e4dc, x0, x1, 0, 1, z0, z1); cols.push([x0, x1, z0, z1]); for (let x = x0 + .5; x < x1 - .4; x += .9) for (const z of [z0 + .5, z1 - .5]) P.push([BG.box, hue[((x * 3) | 0) % hue.length], K.M(x, 1.15, z, .7, .3, .7), 0]); box(P, 0x2a2a2a, x0 + .3, x0 + .45, 1, 3, z0 + .3, z0 + .45); box(P, 0x2a2a2a, x1 - .45, x1 - .3, 1, 3, z1 - .45, z1 - .3); box(Gl, 0xfff0c8, x0, x1, 3, 3.15, (z0 + z1) / 2 - .3, (z0 + z1) / 2 + .3) };
      const FR = [0xd8302a, 0xf2a83a, 0x7ac83a, 0xf2e04a, 0x8a3ad8, 0xff6a8a], HM = [0x8a3a1a, 0xc87a4a, 0x3a5a2a], SF = [0xe8a080, 0xd8d8d0, 0x3a6a9a], SW = [0xf4e0a0, 0xc8843a, 0xf4f0e0];
      stall(-108, -94, 150, 158, FR); stall(-127, -112, 150, 158, HM); stall(-108, -94, 172, 180, SF); stall(-127, -112, 172, 180, SW);
      for (let x = -126; x < -113; x += 1.5) P.push([BG.cone, 0x8a3a1a, K.M(x, 2.4, 151, .25, .7, .25, PI, 0, 0), 0]);
      BCN.market = { juice: [-101, 160.4], jamon: [-120, 160.4], seafood: [-101, 170.2], sweets: [-120, 170.2], staffJ: [-101, 148.6], staffH: [-120, 148.6], staffS: [-101, 181.4], staffW: [-120, 181.4], mid: [-110, 165] } }
    /* ---------- the cathedral (public landmark): Gothic facade on the square, two octagonal towers, the central spire ---------- */
    { const st2 = 0xc4b494, x0 = 30, x1 = 95, z0 = 135, z1 = 200; box(P, st2, x0, x1, 0, 26, z0, z1); box(P, 0x8a8478, x0, x1, 26, 27, z0, z1); box(P, st2, x0 + 8, x1 - 8, 0, 36, z0 - 1.6, z0);
      for (const tx of [36, 89]) { P.push([BG.cyl, st2, K.M(tx, 24, z0 + 2, 5.4, 48, 5.4), 0]); P.push([BG.cone, 0x8a7a62, K.M(tx, 52, z0 + 2, 5, 8, 5), 0]) } P.push([BG.cone, 0x9a8a6a, K.M(62.5, 54, z0 + 6, 5, 36, 5), 0]); box(P, st2, 58.5, 66.5, 26, 40, z0 + 2, z0 + 10);
      for (let x = x0 + 9; x < x1 - 8; x += 4.4) P.push([BG.cone, st2, K.M(x, 38.5, z0 - .8, .7, 5, .7), 0]); box(P, 0x2a2018, 58, 67, 0, 10, z0 - 1.7, z0 - 1.6); for (let k = 0; k < 5; k++) box(P, st2, 57 - k * .4, 68 + k * .4, 10 + k * .5, 10.5 + k * .5, z0 - 2, z0 - 1.6);
      for (const s of [-1, 1]) box(P, 0x2a2018, 62.5 + s * 14 - 2.5, 62.5 + s * 14 + 2.5, 0, 7, z0 - 1.7, z0 - 1.6); P.push([BG.cyl, 0x9a8a6a, K.M(62.5, 19, z0 - 1.7, 4.4, .3, 4.4, PI / 2, 0, 0), 0]); Gl.push([BG.cyl, 0x6a4ad8, K.M(62.5, 19, z0 - 1.85, 3.6, .2, 3.6, PI / 2, 0, 0), 0]);
      for (let z = z0 + 10; z < z1; z += 9) for (const x of [x0 - 1.2, x1 + .2]) box(P, st2, x, x + 1, 0, 20, z, z + 1.4); cols.push([x0 - 1.3, x1 + 1.3, z0 - 1.7, z1]); BCN.cathedral = [62.5, 132] }
    /* ---------- the Pi church (public landmark) facing Plaça del Pi, its rose window and octagonal bell tower ---------- */
    { const st2 = 0xb8a47e; box(P, st2, -20, 13, 0, 24, 196, 214); P.push([BG.cyl, 0x8a7a5e, K.M(-3.5, 15, 195.9, 5.4, .3, 5.4, PI / 2, 0, 0), 0]); Gl.push([BG.cyl, 0xd84a6a, K.M(-3.5, 15, 195.8, 4.6, .2, 4.6, PI / 2, 0, 0), 0]); box(P, 0x2a2018, -6, -1, 0, 6, 195.8, 196);
      P.push([BG.cyl, st2, K.M(9, 22, 210, 3.6, 44, 3.6), 0]); box(P, 0x8a7a5e, 5, 13, 44, 45, 206, 214); cols.push([-20, 13, 196, 214]); fill(-23, -20, 195, 215, 10, 3, 'got'); fill(13, 16, 195, 215, 10, 3, 'got'); BCN.pi = [-3.5, 192] }
    /* ---------- PLAÇA REIAL: palms, the central fountain, the helmeted lamp posts ---------- */
    const palm = (x, z, h) => { for (let k = 0; k < 6; k++) P.push([BG.cyl, 0x8a6a4a, K.M(x + Math.sin(k * .4) * .15, k * h / 6 + h / 12, z, .32 - k * .02, h / 6 + .05, .32 - k * .02), 0]); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; P.push([BG.box, 0x3a7a2a, K.M(x + Math.cos(a) * 1.6, h - .2 - (k % 2) * .3, z + Math.sin(a) * 1.6, 3.4, .1, .7, 0, -a, -.35), 0]) } circ.push([x, z, .45]) };
    { box(P, 0xd8d0bc, -15, 8, 0, .02, 266, 317); for (const [x, z] of [[-10, 272], [3, 272], [-10, 284], [3, 284], [-10, 298], [3, 298], [-10, 310], [3, 310]]) palm(x, z, 11); P.push([BG.cyl, 0xc8bca0, K.M(-3.5, .4, 291, 3.4, .8, 3.4), 0]); P.push([BG.cyl, 0x6a9ab8, K.M(-3.5, .72, 291, 3, .1, 3), 0]); P.push([BG.cyl, 0xc8bca0, K.M(-3.5, 2, 291, .5, 3, .5), 0]); circ.push([-3.5, 291, 3.6]);
      for (const [x, z] of [[-3.5, 278], [-3.5, 304]]) { box(P, 0x2a3a2a, x - .12, x + .12, 0, 4.8, z - .12, z + .12); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; box(Gl, 0xffe0a0, x + Math.cos(a) * .9 - .15, x + Math.cos(a) * .9 + .15, 4.2, 4.7, z + Math.sin(a) * .9 - .15, z + Math.sin(a) * .9 + .15) } P.push([BG.cone, 0xc8281e, K.M(x, 5.4, z, .7, 1, .7), 0]); circ.push([x, z, .3]) }
      sign('pl_reial', -6.4, 3.8, 265.8, 1.6, .5, PI); BCN.reial = [-3.5, 291] }
    /* ---------- Plaça Sant Jaume + the cathedral square + Plaça del Pi: paving ---------- */
    box(P, 0xd0c8b4, 24, 64, 0, .02, 222, 280); box(P, 0xd0c8b4, 24, 100, 0, .02, 108, 135); box(P, 0xd0c8b4, -23, 16, 0, .02, 167, 195); BCN.sj = [44, 251];
    for (const [x, z] of [[-12, 176], [5, 176], [-12, 188], [5, 188]]) tree(x, z, 8);
    /* the Bisbe bridge (neo-Gothic, over Carrer del Bisbe, z 150) */
    { const st2 = 0xc4b494; box(P, st2, 16, 30, 7, 11, 147, 153); for (let k = 0; k < 8; k++) box(P, st2, 16 + k * 1.75, 16.6 + k * 1.75, 11, 12.4, 147, 153); box(Gl, 0x5a4ac8, 16.5, 29.5, 8, 10.4, 146.95, 147) }
    /* ---------- the port: promenade (moll), palms, the Columbus column, water, boats, the pier ---------- */
    { box(P, 0xc8c0ac, XMIN, XMAX, 0, .02, 354, ZQ); for (let x = XMIN + 8; x < XMAX; x += 18) { if (Math.abs(x + 72) < 9 || Math.abs(x - 40) < 8) continue; palm(x, 358, 10) }
      box(P, 0xa89a80, XMIN, XMAX, WY - 2, 0, ZQ, ZQ + .6); for (let x = XMIN + 1; x < XMAX; x += 3) { if (x > PIER[0] - 1 && x < PIER[1] + 1) continue; box(P, IRON, x - .05, x + .05, 0, 1, ZQ - .3, ZQ - .2) } box(P, IRON, XMIN, PIER[0], .95, 1.05, ZQ - .35, ZQ - .15); box(P, IRON, PIER[1], XMAX, .95, 1.05, ZQ - .35, ZQ - .15); cols.push([XMIN, PIER[0], ZQ - .4, ZQ + 1], [PIER[1], XMAX, ZQ - .4, ZQ + 1]);
      box(P, 0x8a6a4a, PIER[0], PIER[1], -.3, .2, PIER[2], PIER[3]); for (let z = PIER[2] + 2; z < PIER[3]; z += 4) for (const x of [PIER[0] + .3, PIER[1] - .3]) box(P, 0x5a4a3a, x - .2, x + .2, WY - 2, .2, z - .2, z + .2); cols.push([PIER[0] - .5, PIER[0], ZQ, PIER[3]], [PIER[1], PIER[1] + .5, ZQ, PIER[3]], [PIER[0], PIER[1], PIER[3], PIER[3] + .5]);
      const wm = K.water({ deep: 0x1a4a6a, shallow: 0x2a6a8a, sky: 0xb8d0e0, opacity: .94, iri: .04 }); const w = new THREE.Mesh(new THREE.PlaneGeometry(1400, 600), wm); w.rotation.x = -PI / 2; w.position.set(0, WY, ZQ + 300); w.renderOrder = 1; grp.add(w);
      const cx = -72, cz = 357; P.push([BG.cyl, 0xc8bca0, K.M(cx, 3, cz, 3.2, 6, 3.2), 0]); P.push([BG.cyl, 0x8a7a5a, K.M(cx, 8, cz, 2, 4, 2), 0]); P.push([BG.cyl, 0x6a5a40, K.M(cx, 30, cz, .9, 40, .9), 0]); P.push([BG.sph, 0x6a5a40, K.M(cx, 50.8, cz, 1.4, 1.4, 1.4), 0]); P.push([BG.cyl, 0x4a3a2a, K.M(cx, 53.5, cz, .5, 3.6, .5), 0]); box(P, 0x4a3a2a, cx - .1, cx + .1, 54, 54.3, cz - 2.2, cz); circ.push([cx, cz, 3.4]); BCN.colom = [cx, cz];
      for (let k = 0; k < 6; k++) { const x = -160 + k * 34, z = 384 + (k % 2) * 6; P.push([BG.box, [0xf4f4f0, 0x1a3a6a, 0xc8281e][k % 3], K.M(x, WY + .6, z, 3, 1.4, 11), 0]); P.push([BG.cyl, 0xd8d8d0, K.M(x, WY + 6, z, .1, 10, .1), 0]) } }
    /* ---------- skyline scenery: the basilica's spires to the north-east, Montjuïc with its castle to the south-west ---------- */
    { const SP = []; const bx = 330, bz = -620; for (let k = 0; k < 8; k++) { const x = bx + (k % 4) * 14 - 21, z = bz + ((k / 4) | 0) * 40, h = 90 + (k % 4 === 1 || k % 4 === 2 ? 30 : 0); SP.push([BG.cyl, 0xb8a88a, K.M(x, h / 2, z, 3.2, h, 3.2), 0]); SP.push([BG.cone, 0xc8b898, K.M(x, h + 9, z, 3, 18, 3), 0]); SP.push([BG.sph, MODC[k % 5], K.M(x, h + 19, z, 1.6, 1.6, 1.6), 0]) } SP.push([BG.cyl, 0xb8a88a, K.M(bx, 70, bz + 20, 9, 140, 9), 0]); SP.push([BG.cone, 0xc8b898, K.M(bx, 160, bz + 20, 8, 40, 8), 0]);
      SP.push([BG.hem, 0x5a7a3a, K.M(-520, -10, 560, 300, 90, 240), 0]); SP.push([BG.box, 0xb8a888, K.M(-520, 82, 560, 60, 14, 50), 0]);
      const sm = new THREE.Mesh(K.merge(SP), K.floraMat(0, { rough: .8 })); sm.material.userData.lin = 1; sm.name = 'bcn_skyline'; grp.add(sm); BCN.skyline = sm }
    /* ---------- metro entrances (L3): Catalunya, Passeig de Gràcia, Liceu, Drassanes ---------- */
    const metroE = (x, z, ry) => { box(P, 0x2a2a2a, x - 1.6, x + 1.6, 0, .9, z - .05, z + .05); box(P, 0x2a2a2a, x - 1.6, x - 1.5, 0, .9, z - 3, z); box(P, 0x2a2a2a, x + 1.5, x + 1.6, 0, .9, z - 3, z); box(P, 0x101010, x - 1.5, x + 1.5, -.02, .02, z - 3, z); box(P, 0x2a2a2a, x - .06, x + .06, 0, 3.4, z + .2, z + .3); sign('metro', x, 3.9, z + .32, 1, 1, ry, true); cols.push([x - 1.6, x + 1.6, z - 3, z + .1]) };
    BCN.metro = { catalunya: [-40, 17], pdg: [14, -188], liceu: [-72, 196], drassanes: [-72, 330] }; metroE(-40, 15, 0); metroE(14, -190, 0); metroE(-72, 194, 0); metroE(-72, 328, 0);
    /* ---------- La Mercè (built here, shown by barcelona_life on festival nights): banners, the port stage ---------- */
    const fest = new THREE.Group(); fest.visible = false; grp.add(fest); BCN.festG = fest; const FP = [], FL = [], FQ = [];
    const STAGE = [120, 364]; { const [x, z] = STAGE; FP.push([BG.box, 0x1a1a1e, K.M(x, .6, z, 12, 1.2, 7), 0]); for (const [dx, dz] of [[-6, -3.5], [6, -3.5], [-6, 3.5], [6, 3.5]]) FP.push([BG.box, 0x3a3a3e, K.M(x + dx, 3.5, z + dz, .15, 7, .15), 0]); FP.push([BG.box, 0x2a2a2e, K.M(x, 7, z, 12.4, .3, 7.4), 0]); FQ.push({ k: 'merce', x, y: 6.2, z: z - 3.75, w: 10, h: 1.56, ry: PI }); for (let k = 0; k < 8; k++) FL.push([BG.box, [0xf2c230, 0xc8281e][k % 2], K.M(x - 5 + k * 1.4, 6.6, z - 3.6, .5, .3, .2), 0]) }
    for (const [x, z, ry] of [[-72, 36, 0], [110, 36, 0], [44, 224, 0]]) FQ.push({ k: 'merce', x, y: 7, z, w: 12, h: 1.88, ry, dbl: 1 });
    const bulbs = (x0, z0, x1, z1, y) => { const n = Math.max(4, Math.round(Math.hypot(x1 - x0, z1 - z0) / 1.6)); for (let k = 0; k <= n; k++) { const t = k / n; FL.push([BG.sph, [0xf2c230, 0xc8281e, 0xffe8a0][k % 3], K.M(x0 + (x1 - x0) * t, y - Math.sin(t * PI) * .7, z0 + (z1 - z0) * t, .14, .14, .14), 0]) } };
    for (let z = 40; z < 330; z += 12) bulbs(-86, z, -58, z + 4, 6.5); for (let z = 230; z < 280; z += 8) bulbs(24, z, 64, z + 2, 7); for (let z = 110; z < 324; z += 10) bulbs(-30, z, -23, z + 3, 5.4);
    for (const q2 of FQ.filter(f => f.dbl)) { FQ.push({ k: q2.k, x: q2.x, y: q2.y, z: q2.z - .03, w: q2.w, h: q2.h, ry: q2.ry + PI }); FP.push([BG.box, 0x2a2a2a, K.M(q2.x - q2.w / 2 - .2, q2.y / 2, q2.z, .15, q2.y + 1, .15), 0], [BG.box, 0x2a2a2a, K.M(q2.x + q2.w / 2 + .2, q2.y / 2, q2.z, .15, q2.y + 1, .15), 0]) }
    BCN.STAGE = STAGE; const festM = new THREE.Mesh(K.merge(FP), K.floraMat(0, { rough: .7 })); festM.material.userData.lin = 1; fest.add(festM);
    /* ---------- the walk-in businesses ---------- */
    const sh = SHOPS, ITF = (k, fn) => NW().interior(sh[k], cols, box, P, Gl, fn);
    const bx2 = (arr, hex, it, u0, u1, y0, y1, f0, f1) => { const b = it.bb(u0, u1, f0, f1); box(arr, hex, b[0], b[1], y0, y1, b[2], b[3]) };
    const IN = {};
    IN.cafe = ITF('cafe', it => { bx2(P, 0x6a4a2a, it, 4.6, 5.3, 0, 1.1, -.6, 3.6); bx2(P, 0x8a6a4a, it, 4.5, 5.4, 1.1, 1.16, -.7, 3.7); for (const f of [-3.2, -1.2]) { bx2(P, 0xd8d8d0, it, 2.4, 3, .72, .76, f, f + .6); bx2(P, 0x2a2a2a, it, 3.1, 3.4, 0, .5, f, f + .6) } for (let k = 0; k < 6; k++) bx2(Gl, 0xffe0b0, it, 7.6, 7.7, 2.6, 3.4, -3.4 + k * 1.3, -3 + k * 1.3); it.cust = it.F(3.9, 1.6); it.staff = it.F(6, 1.6) });
    IN.granja = ITF('granja', it => { bx2(P, 0xe8dcc0, it, 3.8, 4.5, 0, 1.05, -2.4, 2.6); for (const u of [2, 5.8]) { bx2(P, 0xf4f0e8, it, u, u + .7, .72, .76, 1.6, 2.4); bx2(P, 0x5a3a1a, it, u + .2, u + .5, 0, .72, 1.85, 2.15) } bx2(P, 0x8a5a2a, it, it.depth - .5, it.depth - .3, 1, 2.6, -3, 3); it.cust = it.F(3.2, -.4); it.staff = it.F(5.2, -.4) });
    IN.tapes = ITF('tapes', it => { bx2(P, 0x3a2a1a, it, 1.4, 2.1, 0, 1.1, 1.6, 4.4); bx2(P, 0x8a6a4a, it, 1.3, 2.2, 1.1, 1.16, 1.5, 4.5); for (let k = 0; k < 8; k++) bx2(P, [0xd8983a, 0xc8281e, 0x3a8a3a, 0xe8d8b0][k % 4], it, 1.5 + (k % 4) * .15, 1.6 + (k % 4) * .15, 1.18, 1.3, 1.8 + k * .3, 2 + k * .3); for (let k = 0; k < 6; k++) bx2(P, 0x8a3a1a, it, 1.5, 1.7, 2.6, 3.6, 1.8 + k * .45, 1.95 + k * .45); for (const f of [-2.4, -.2]) bx2(P, 0x4a3a2a, it, 5.2, 6.2, 0, 1.05, f, f + 1); it.cust = it.F(2.8, 3); it.staff = it.F(.9, 3) });
    IN.jazz = ITF('jazz', it => { bx2(P, 0x1a1410, it, it.depth - 2.6, it.depth - .4, 0, .5, -3.2, 3.2); bx2(P, 0x101010, it, it.depth - 2.2, it.depth - 1, .5, 1.5, -2.6, -1.2); for (let k = 0; k < 4; k++) bx2(Gl, [0x4ad8ff, 0xff4ab0][k % 2], it, it.depth - 2, it.depth - 1.8, 3, 3.2, -2.6 + k * 1.7, -2.3 + k * 1.7); bx2(P, 0x2a1a12, it, 1.2, 1.9, 0, 1.1, 2, 4); it.cust = it.F(2.6, 3); it.staff = it.F(.8, 3); it.stage = it.F(it.depth - 1.5, 0); it.floor = it.F(3.6, -.6); it.piano = it.F(it.depth - 1.6, -1.9) });
    IN.llibreria = ITF('llibreria', it => { for (let k = 0; k < 3; k++) { const u = 2.4 + k * 2.2; bx2(P, 0x4a2e1c, it, u, u + .5, 0, 2.4, -1, 3.4); for (let j = 0; j < 9; j++) bx2(P, [0x8a2a2a, 0x2a4a6a, 0xe8dcc0, 0x3a6a3a, 0xc8a040][j % 5], it, u - .02, u + .52, .3 + (j % 3) * .7, .75 + (j % 3) * .7, -.8 + (j / 3 | 0) * 1.4, -.3 + (j / 3 | 0) * 1.4) } bx2(P, 0x6a4a2a, it, 1, 1.8, 0, 1, 2.6, 4.2); it.cust = it.F(1.4, 2); it.staff = it.F(1.4, 3.6) });
    IN.moda = ITF('moda', it => { for (let k = 0; k < 4; k++) { bx2(P, 0xc8c8c8, it, 2.2 + k * 1.8, 2.3 + k * 1.8, 0, 1.7, -3.4, 3.4); for (let j = 0; j < 5; j++) bx2(P, [0x1a1a1a, 0xc8281e, 0xf4f0e8, 0x2a5a9a, 0xd8a050][(j + k) % 5], it, 2 + k * 1.8, 2.5 + k * 1.8, .7, 1.6, -3 + j * 1.3, -2.4 + j * 1.3) } bx2(P, 0xf4f4f0, it, 1, 1.8, 0, 1, 3.2, 5.2); it.cust = it.F(1.4, 2.6); it.staff = it.F(1.4, 4.4) });
    /* ---------- districts in their own modules: Gràcia (barcelona_gracia.js), the Barceloneta + beach (barcelona_barceloneta.js) ---------- */
    const mainShops = Object.keys(sh).length, EM = { row, blk, fill, box, sign, P, Gl, Gs, sh, SPECIAL, ITF, bx2, IN, tree, lamp, palm, metroE, road, pave };
    BCN.GR = null; if (BCN.gracia) try { BCN.GR = BCN.gracia(ctx, EM) } catch (e) { console.warn('barcelona gracia', e); BCN.stats.grErr = String(e && e.stack || e).slice(0, 400) }
    BCN.BT = null; if (BCN.barceloneta) try { BCN.BT = BCN.barceloneta(ctx, EM) } catch (e) { console.warn('barcelona barceloneta', e); BCN.stats.btErr = String(e && e.stack || e).slice(0, 400) }
    BCN.stats.buildings = nB;
    BCN.interiors = IN;
    /* signs over the named shopfronts */
    for (const k in sh) { const s = sh[k], d = SIGNS.find(x => x[0] === k); if (!d || SPB[k] || s.ownSign) continue; sign(k, s.x + s.out[0] * .06, s.signY || (/granja|tapes|forn|jazz|flamenc|souvenir|samarreta|cafe|cava|paella|bicis/.test(k) ? 3.5 : 4.1), s.z + s.out[1] * .06, Math.min(s.w - .6, 9), Math.min(s.w - .6, 9) * d[2] / d[1], s.yaw); if (!s.hollow) sign(/moda|samarreta|souvenir/.test(k) ? 'w_roba' : /llibreria|disc/.test(k) ? 'w_llibres' : 'w_menjar', s.x - s.out[0] * .05, 1.75, s.z - s.out[1] * .05, s.w - 2.6, 2, s.yaw) }
    BCN.shops = sh; BCN.stats.shopsPlaced = mainShops; BCN.stats.allShops = Object.keys(sh).length;
    /* ---------- merge (district regions: the Eixample, the old town) ---------- */
    const solidM = K.floraMat(0, { rough: .82 }); solidM.userData.lin = 1; const REG = (x, z) => z < -330 ? 'gr' : x > 183 && z > 140 ? 'bt' : z < -40 ? 'ex' : 'cv', RO2 = { region: REG }; BCN.region = null;
    NW().makeAtlas(SIGNS, SG, 2048, 2560); BCN.chunks = NW().chunked(P, 64, a => K.merge(a), solidM, grp, 'bcn_static', { shadow: true, region: REG });
    if (Gs.length) { const gm = new THREE.MeshStandardMaterial({ color: 0xa8c8d8, roughness: .05, metalness: .3, transparent: true, opacity: .3, depthWrite: false }); gm.userData.lin = 1; BCN.chunks.push(...NW().chunked(Gs, 128, a => K.merge(a), gm, grp, 'bcn_glass', { order: 2, region: REG })) }
    const glowM = new THREE.MeshBasicMaterial({ vertexColors: true }); glowM.userData.lin = 1; BCN.chunks.push(...NW().chunked(Gl, 128, a => K.merge(a), glowM, grp, 'bcn_glow', RO2));
    const flM = new THREE.MeshBasicMaterial({ vertexColors: true }); flM.userData.lin = 1; fest.add(new THREE.Mesh(K.merge(FL), flM));
    const signM = new THREE.MeshStandardMaterial({ map: SG.tex, emissiveMap: SG.tex, emissive: 0xffffff, emissiveIntensity: .2, roughness: .6, alphaTest: .3 }); signM.userData.lin = 1; BCN.chunks.push(...NW().chunked(Q, 128, a => NW().quadGeo(a, SG.r), signM, grp, 'bcn_signs', RO2)); fest.add(new THREE.Mesh(NW().quadGeo(FQ, SG.r), signM));
    BCN.stats.parts = P.length + Gl.length; BCN.stats.signs = Q.length; BCN.stats.atlasOver = (SG.over || []).length; BCN.stats.atlasBad = (SG.bad || []).length; BCN.stats.atlasUsed = SG.used;
    ctx.upd.push(() => { const h = (S.time / 60) % 24, n = h > 20.5 || h < 6 ? 1 : h > 19 ? (h - 19) / 1.5 : h < 7.5 ? (7.5 - h) / 1.5 : 0; signM.emissiveIntensity = .2 + .7 * n; glowM.color.setScalar(.35 + .65 * n); BCN.night = n;
      const p = AV.P, vs = []; if (p.z < -250) vs.push('gr'); if (p.z < 60 && p.z > -420) vs.push('ex'); if (p.z > -110) vs.push('cv'); if (p.x > 60 && p.z > 60) vs.push('bt'); const r = BCN.noRegion ? 'all' : vs.join('+'); if (r !== BCN.region) { BCN.region = r; for (const m of BCN.chunks) m.visible = r === 'all' || vs.includes(m.userData.region) } });
    BCN.ctx = ctx;
    /* ---------- map ---------- */
    const PLc = (id, en, es, x, z, yaw) => ({ id, name: [en, es], x, z, yaw });
    const mapRoads = []; for (const [x, w, z0, z1] of VX) mapRoads.push([x, z0, x, z1, x === 0 ? 18 : x === -92 ? 4 : 7]); for (const [z, x0, x1] of HZ) mapRoads.push([x0, z, x1, z, 7]);
    mapRoads.push([XMIN, 347, XMAX, 347, 9], [110, 34, 110, 340, 12], [-83, 34, -83, 340, 6], [-61, 34, -61, 340, 6]);
    for (const r of LANES) { const vert = r[3] - r[2] > r[1] - r[0]; mapRoads.push(vert ? [(r[0] + r[1]) / 2, r[2], (r[0] + r[1]) / 2, r[3], Math.min(5, r[1] - r[0] - 2)] : [r[0], (r[2] + r[3]) / 2, r[1], (r[2] + r[3]) / 2, Math.min(5, r[3] - r[2] - 2)]) }
    const places = [PLc('placa', 'Plaça de Catalunya', 'Plaza de Cataluña', -20, -10, 0), PLc('pdg', 'Passeig de Gràcia', 'Paseo de Gracia', 0, -170, PI), PLc('rcat', 'Rambla de Catalunya', 'Rambla de Cataluña', -92, -170, PI), PLc('rambla', 'La Rambla', 'La Rambla', -72, 110, 0), PLc('mercat', 'Market hall (Mercat de la Rambla)', 'Mercado (Mercat de la Rambla)', -110, 165, -PI / 2),
      PLc('liceu', 'Liceu (pavement mosaic)', 'Liceu (mosaico)', -72, 178, 0), PLc('catedral', 'Cathedral square', 'Plaza de la Catedral', 62, 121, 0), PLc('pi', 'Plaça del Pi', 'Plaza del Pi', -3.5, 181, 0), PLc('santjaume', 'Plaça Sant Jaume', 'Plaza Sant Jaume', 44, 251, 0), PLc('reial', 'Plaça Reial', 'Plaza Real', -3.5, 291, 0),
      PLc('bisbe', 'Carrer del Bisbe (the bridge)', 'Calle del Bisbe (el puente)', 20, 150, 0), PLc('ferran', 'Carrer de Ferran', 'Calle de Ferran', -30, 254, PI / 2), PLc('escudellers', 'Carrer dels Escudellers', 'Calle de Escudellers', 30, 329, PI / 2), PLc('laietana', 'Via Laietana', 'Vía Laietana', 110, 180, 0), PLc('born', 'El Born', 'El Born', 145, 240, PI / 2),
      PLc('raval', 'El Raval (Carrer de l’Hospital)', 'El Raval (calle del Hospital)', -150, 224, PI / 2), PLc('colom', 'Columbus column (Port Vell)', 'Monumento a Colón (Port Vell)', -72, 352, 0), PLc('port', 'Port promenade (Moll)', 'Paseo del puerto (Moll)', 40, 364, PI), PLc('garden', 'Garden courtyard (interior d’illa)', 'Patio-jardín (interior de manzana)', -50, -173, 0), PLc('granvia', 'Gran Via', 'Gran Vía', 120, -47, PI / 2)];
    const NAMES = { casasimi: 'Casa Simi (modernista house)', moda: 'Moda Gràcia', llibreria: 'Llibreria El Drac', vermut: 'Vermuteria Can Pep', pastis: 'Pastisseria La Mona', gelat: 'Gelats Mediterrani', disc: 'Groove Dealers Discos', magatzems: 'Grans Magatzems Simi', granja: 'Granja La Banana', tapes: 'Bar de Tapes El Simi', forn: 'Forn Sant Simi', jazz: 'Sala Simi Jazz Club', flamenc: 'Tablao El Duende (flamenco)', souvenir: 'Records de Barcelona', samarreta: 'La Samarreta', cafe: 'Cafè de la Rambla', cava: 'Xampanyeria Bombolles', paella: 'La Paella del Port', bicis: 'BiciApe (bikes)', palau: 'Palau de la Generalitat', ajunt: 'Ajuntament (city hall)' };
    for (const k in NAMES) { const s = sh[k]; if (s) places.push(PLc(k, NAMES[k], NAMES[k], s.x + s.out[0] * 3, s.z + s.out[1] * 3, Math.atan2(s.out[0], s.out[1]) + PI)) }
    for (const D of [BCN.GR, BCN.BT]) if (D) { for (const r of D.roads) mapRoads.push(r); for (const p of D.places) places.push(PLc(p[0], p[1], p[2], p[3], p[4], p[5])) }
    BCN.names = NAMES;
    if (BCN.life) try { BCN.life(ctx, { T, st, sh, IN, box, STAGE, fest }) } catch (e) { console.warn('barcelona life', e); BCN.stats.lifeErr = String(e && e.stack || e).slice(0, 400) }
    return { name: 'Barcelona', surface: surf, fog: [90, 680], sky: { exp: .95, tint: [0x8ab8e0, 0xf4e0c0, .3, .3], dome: { s1: 0xf8e0c0, s2: 0x7ab0e0, swirl: .01, cloud: .45, glow: .45 } },
      arrivals: { default: { x: -20, z: 8, yaw: PI }, pipe: { x: -24, z: 8, yaw: PI }, metro: { x: -40, z: 19, yaw: PI } }, defaultArrival: 'default',
      mapRoads, places, mapNav: BCN.nav || null,
      greet: { human: [['Bon dia! In Barcelona you say bon dia first — then ask.', '¡Bon dia! En Barcelona se dice bon dia primero y luego se pregunta.'], ['The Rambla runs from the plaça down to the sea. Get lost in the Gothic lanes on the left.', 'La Rambla baja de la plaza al mar. Piérdete por las callejuelas góticas de la izquierda.']] },
      chatLines: [['Thursday night is La Mercè: castells in Sant Jaume, the correfoc down Via Laietana.', 'El jueves por la noche es La Mercè: castells en Sant Jaume, el correfoc por Via Laietana.'], ['Xocolata amb xurros at the Granja on Petritxol, then the Plaça del Pi.', 'Chocolate con churros en la Granja de Petritxol y luego la plaza del Pi.'], ['Jazz in Plaça Reial after nine. The palms are lit up.', 'Jazz en la Plaza Real después de las nueve. Las palmeras están iluminadas.']],
      musicProfile: { bpm: 104, root: 50, scale: [0, 1, 4, 5, 7, 8, 10], style: 'amb' } };
  }
});
BCN.SIGNS = SIGNS; BCN.SG = SG; BCN.edifici = edifici;
})(window.AV);
