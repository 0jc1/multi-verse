/* APEVERSE 2 NEW WORLDS - world_paris.js : PARIS (present day), district 1 = the SEINE + SAINT-GERMAIN.  1 m = 1 m, north is -z.
   From the owner's illustrated "Apeverse Paris: Psychedelic Landmark Map" (mood / POI reference only; not a survey).
     The Seine runs east-west (real water between high stone quays) around the Île with the cathedral; the Pont Neuf (stone arches)
     and a footbridge cross it; bouquinistes' green boxes line the south parapet.  South of the river: the quai, three cobbled streets
     (Rue Dauphine, Rue de Seine, Rue Bonaparte) up to the Boulevard Saint-Germain, the Place with café terraces, the church with its
     Romanesque bell tower, the Rue de Buci market street and the north corner of the Luxembourg garden.  The Eiffel Tower stands on the
     western skyline (scenery).
   Architecture kit: Haussmann buildings (rusticated ground floor + shopfront with awning, cream limestone, tall French windows, the
   continuous iron balconies on the 2nd and 5th floors, cornices, grey zinc mansard roofs with dormers and chimney pots), lit at night;
   painted shopfronts with gold lettering; Guimard métro entrance, Morris columns, Wallace fountain, plane trees, lanterns.
   Every business is fictional; landmarks (the Seine, bridges, cathedral, church, garden, tower) are public places.  AV.paris */
'use strict';
(function (AV) {
const TAU = Math.PI * 2, PI = Math.PI;
const PAR = AV.paris = { stats: {} };
const XMIN = -300, XMAX = 340, ZMIN = -120, ZMAX = 230, WY = -4.5;
const ISLE = [160, 320, -24, 24];   /* Île: x0, x1, z0, z1 */
/* bridges: [x0, x1, z0, z1, rise, axis] (deck y = .25 + rise * (1 - t^2), t across the span) */
const BRIDGES = [[-70, -50, -36, 36, 1.1, 'z'], [56, 64, -36, 36, .7, 'z'], [170, 180, 23, 36, .25, 'z'], [183, 191, -36, -23, .25, 'z'], [300, 310, 23, 36, .25, 'z']];   /* + the Pont de l'Archevêché at the Île's east end */
function bridgeY(x, z) { for (const b of BRIDGES) if (x > b[0] && x < b[1] && z > b[2] && z < b[3]) { const c = (b[2] + b[3]) / 2, h = (b[3] - b[2]) / 2, t = (z - c) / h; return .25 + b[4] * (1 - t * t) } return null }
const inIsle = (x, z) => x > ISLE[0] && x < ISLE[1] && z > ISLE[2] && z < ISLE[3];
function surf(x, z) { if (PAR.mmSurf) { const s2 = PAR.mmSurf(x, z); if (s2 !== undefined) return s2 } if (x < XMIN || x > XMAX || z < ZMIN || z > ZMAX) return null; const b = bridgeY(x, z); if (b !== null) return b; if (z > -30 && z < 30 && !inIsle(x, z)) return null; return 0 }
PAR.surf = surf; PAR.WY = WY; PAR.ISLE = ISLE; PAR.BRIDGES = BRIDGES;

/* ======================= sign atlas (French shop signs, all fictional businesses) ======================= */
const SG = { r: {} };
const NW = () => AV.nwkit;
const SERIF = '"Didot", "Bodoni MT", "Playfair Display", Georgia, serif';
/* painted shopfront fascia: gold lettering on a dark painted board, optional subline */
const peint = (top, sub, bg, fg, o) => (g, w, h) => { o = o || {}; g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = o.line || fg; g.lineWidth = 3; g.strokeRect(10, 10, w - 20, h - 20); const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, o.light ? fg : '#f8e6a0'); gr.addColorStop(.6, fg); gr.addColorStop(1, o.light ? fg : '#9a7428'); g.fillStyle = gr; g.textAlign = 'center'; g.textBaseline = 'middle'; NW().fit(g, top, w - 60, h * .5, (o.font || 'italic 700 #px ') + (o.sans ? 'Arial, sans-serif' : SERIF), sub ? h * .42 : h * .52, w / 2);
  if (sub) { g.fillStyle = o.subc || fg; NW().fit(g, sub, w - 80, h * .18, '600 #px ' + (o.sans ? 'Arial, sans-serif' : SERIF), h * .8, w / 2) } };
const awn = (txt, c1, c2) => (g, w, h) => { for (let x = 0; x < w; x += 32) { g.fillStyle = (x / 32) % 2 ? c2 : c1; g.fillRect(x, 0, 32, h) } g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(0, h * .7, w, h * .3); if (txt) { g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle'; NW().fit(g, txt, w - 40, h * .32, 'italic 700 #px ' + SERIF, h * .84, w / 2) } };
const SIGNS = [
  ['cafe', 640, 128, peint('Café des Singes', 'depuis 1887 · terrasse · café · vins', '#1a2a1e', '#e8c868')],
  ['cave', 640, 128, (g, w, h) => { g.fillStyle = '#120c08'; g.fillRect(0, 0, w, h); g.shadowColor = '#ff9a3a'; g.shadowBlur = 16; g.fillStyle = '#ffcf7a'; g.textAlign = 'center'; g.textBaseline = 'middle'; NW().fit(g, 'Le Caveau des Singes', w - 60, 64, 'italic 700 #px ' + SERIF, 52, w / 2); g.shadowColor = '#ff4a6a'; g.fillStyle = '#ff9aaa'; NW().fit(g, 'JAZZ · CAVE VOÛTÉE · 21h — 3h', w - 120, 24, '800 #px Arial, sans-serif', 104, w / 2); g.shadowBlur = 0 }],
  ['boulangerie', 640, 128, peint('Au Pain Doré', 'BOULANGERIE · PÂTISSERIE', '#2a3a5a', '#f0d890')],
  ['librairie', 640, 128, peint('La Page Volante', 'LIBRAIRIE · livres anciens & nouveaux', '#3a1418', '#e8c868')],
  ['fromagerie', 640, 128, peint('Fromagerie Mère Lune', 'fromages affinés · crèmerie', '#f2ead0', '#3a5a2a', { light: true, subc: '#6a4a20' })],
  ['creperie', 448, 112, peint('Crêperie Ty Ape', 'crêpes · galettes · cidre', '#1a3a6a', '#f4f0e0', { light: true })],
  ['patisserie', 640, 128, peint('Macarons Rose-Thé', 'PÂTISSERIE · salon de thé', '#f4d0d8', '#8a2a4a', { light: true, subc: '#5a8a6a' })],
  ['brasserie', 640, 128, peint('Brasserie Le Zinc', 'steak frites · huîtres · vins au verre', '#1a1a1a', '#e8c868')],
  ['disques', 640, 128, peint('Groove Dealers Disques', 'VINYLES · occasions · jazz · dub', '#8a1a1a', '#f4e0a8')],
  ['tabac', 448, 112, (g, w, h) => { g.fillStyle = '#1a2a6a'; g.fillRect(0, 0, w, h); g.fillStyle = '#d82a2a'; g.beginPath(); g.moveTo(30, h / 2); g.lineTo(70, 14); g.lineTo(110, h / 2); g.lineTo(70, h - 14); g.fill(); g.fillStyle = '#fff'; g.textAlign = 'left'; g.textBaseline = 'middle'; NW().fit(g, 'TABAC · PRESSE', w - 150, 42, '900 #px Arial, sans-serif', h / 2, 130) }],
  ['fleuriste', 448, 112, peint('Les Fleurs de Buci', 'fleuriste', '#2a4a2a', '#f4e8d0', { light: true })],
  ['swag', 640, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#5a2a8a'); gr.addColorStop(.5, '#a83aa8'); gr.addColorStop(1, '#ff5ab0'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#f4ead0'; g.textAlign = 'center'; g.textBaseline = 'middle'; NW().fit(g, 'SWAG', w - 300, 70, '900 #px Arial Black, Arial, sans-serif', 52, w / 2); NW().fit(g, 'PARIS · Saint-Germain · streetwear', w - 80, 20, '700 #px Arial, sans-serif', 104, w / 2) }],
  ['glacier', 448, 112, peint("Glacier de l'Île", 'glaces · sorbets artisanaux', '#f4f0e4', '#2a6a8a', { light: true })],
  ['velape', 448, 112, (g, w, h) => { g.fillStyle = '#e8e8e4'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2a8a6a'; g.lineWidth = 6; for (const cx of [50, 104]) { g.beginPath(); g.arc(cx, 66, 22, 0, TAU); g.stroke() } g.fillStyle = '#2a8a6a'; g.textAlign = 'left'; g.textBaseline = 'middle'; NW().fit(g, "Vél'Ape", w - 180, 50, '900 #px Arial, sans-serif', 44, 150); g.fillStyle = '#5a5a5a'; NW().fit(g, 'vélos en libre-service · location', w - 180, 18, '600 #px Arial, sans-serif', 86, 150) }],
  ['bateau', 640, 128, peint('Bateaux-Singes', 'CROISIÈRE SUR LA SEINE · départ toutes les 20 min', '#f4f4f0', '#1a3a6a', { light: true, sans: true, font: '900 #px ', subc: '#d82a2a' })],
  ['metro', 512, 96, (g, w, h) => { g.fillStyle = '#2a4a3a'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2d890'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '700 44px "Arial Narrow", Arial, sans-serif'; g.fillText('MÉTROPOLITAIN', w / 2, h / 2 + 2); g.strokeStyle = '#f2d890'; g.lineWidth = 3; g.strokeRect(8, 8, w - 16, h - 16) }],
  ['plaque', 256, 80, (g, w, h) => { g.fillStyle = '#1a3a7a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e8e8e8'; g.lineWidth = 4; g.strokeRect(6, 6, w - 12, h - 12); g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '700 14px Arial'; g.fillText('6e Arrt', w / 2, 22); NW().fit(g, 'BOULEVARD SAINT-GERMAIN', w - 20, 20, '800 #px Arial, sans-serif', 52, w / 2) }],
  ['plaque_seine', 256, 80, (g, w, h) => { g.fillStyle = '#1a3a7a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e8e8e8'; g.lineWidth = 4; g.strokeRect(6, 6, w - 12, h - 12); g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '700 14px Arial'; g.fillText('6e Arrt', w / 2, 22); NW().fit(g, 'RUE DE SEINE', w - 20, 24, '800 #px Arial, sans-serif', 52, w / 2) }],
  ['morris', 256, 384, (g, w, h) => { g.fillStyle = '#2a4a3a'; g.fillRect(0, 0, w, h); const P2 = [['#ffd84a', 'JAZZ', 'Caveau des Singes'], ['#ff6a8a', 'FÊTE DE LA', 'MUSIQUE · samedi'], ['#4ad8ff', 'EXPO', "Les Singes de l'Art"]]; P2.forEach((p, i) => { g.fillStyle = p[0]; g.fillRect(14, 14 + i * 122, w - 28, 112); g.fillStyle = '#1a1a1a'; g.textAlign = 'center'; g.textBaseline = 'middle'; NW().fit(g, p[1], w - 50, 40, '900 #px Arial Black, Arial', 50 + i * 122, w / 2); NW().fit(g, p[2], w - 50, 20, '700 #px Arial', 92 + i * 122, w / 2) }) }],
  ['fete', 1024, 160, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); ['#ff4a6a', '#ffd84a', '#4ad8ff', '#a84aff'].forEach((c, i) => gr.addColorStop(i / 3, c)); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#1a1a2a'; g.textAlign = 'center'; g.textBaseline = 'middle'; NW().fit(g, 'FÊTE DE LA MUSIQUE', w - 100, 86, '900 #px Arial Black, Arial, sans-serif', 66, w / 2); NW().fit(g, 'tous les samedis · musique partout · Saint-Germain', w - 160, 26, '700 #px Arial, sans-serif', 132, w / 2) }],
  ['menu', 192, 256, (g, w, h) => { g.fillStyle = '#1a1a1a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#8a6a3a'; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); g.fillStyle = '#f4f4f0'; g.textAlign = 'center'; g.font = 'italic 700 26px ' + SERIF; g.fillText('Menu du jour', w / 2, 38); g.font = '18px ' + SERIF; ['Soupe à l’oignon', 'Croque-monsieur', 'Steak frites', 'Tarte Tatin', 'Café · 2€'].forEach((t, i) => g.fillText(t, w / 2, 80 + i * 34)) }],
  ['w_pain', 256, 160, (g, w, h) => { g.fillStyle = '#f4e6c8'; g.fillRect(0, 0, w, h); for (let i = 0; i < 7; i++) { g.fillStyle = ['#c8843a', '#b06a2a', '#d89a4a'][i % 3]; g.save(); g.translate(20 + i * 34, 70); g.rotate(-.4); g.beginPath(); g.ellipse(0, 0, 8, 46, 0, 0, TAU); g.fill(); g.restore() } for (let i = 0; i < 6; i++) { g.fillStyle = '#d8983a'; g.beginPath(); g.ellipse(24 + i * 40, 132, 16, 10, 0, 0, TAU); g.fill() } }],
  ['w_livres', 256, 160, (g, w, h) => { g.fillStyle = '#3a2a1e'; g.fillRect(0, 0, w, h); for (let r = 0; r < 3; r++) for (let x = 6; x < w - 6;) { const bw = 6 + Math.random() * 10; g.fillStyle = ['#8a2a2a', '#2a4a6a', '#e8dcc0', '#3a6a3a', '#c8a040', '#5a3a6a'][(Math.random() * 6) | 0]; g.fillRect(x, 10 + r * 50, bw, 40 - Math.random() * 8); x += bw + 1 } }],
  ['w_mode', 256, 160, (g, w, h) => { g.fillStyle = '#f4f0ea'; g.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++) { g.fillStyle = ['#1a1a1a', '#8a2a3a', '#2a3a5a', '#c8a888'][i]; g.beginPath(); g.moveTo(40 + i * 56, 34); g.lineTo(62 + i * 56, 34); g.lineTo(74 + i * 56, 140); g.lineTo(28 + i * 56, 140); g.fill(); g.fillStyle = '#e0c8a8'; g.beginPath(); g.arc(51 + i * 56, 22, 10, 0, TAU); g.fill() } }],
  ['w_macaron', 256, 160, (g, w, h) => { g.fillStyle = '#fff4f6'; g.fillRect(0, 0, w, h); for (let r = 0; r < 3; r++) for (let i = 0; i < 7; i++) { g.fillStyle = ['#f4a8c0', '#a8e0c8', '#f4e0a0', '#c8a8f0', '#f4c8a0', '#a8d0f4', '#8a5a3a'][(i + r) % 7]; g.beginPath(); g.ellipse(22 + i * 35, 34 + r * 46, 14, 9, 0, 0, TAU); g.fill() } }],
  ['w_fromage', 256, 160, (g, w, h) => { g.fillStyle = '#f2ead8'; g.fillRect(0, 0, w, h); for (let i = 0; i < 6; i++) { g.fillStyle = ['#f2d26a', '#f4f0e0', '#e8b84a', '#d8c890'][i % 4]; g.beginPath(); g.arc(30 + i * 40, 60 + (i % 2) * 50, 22, 0, TAU); g.fill(); g.fillStyle = '#8a6a3a'; g.fillRect(20 + i * 40, 54 + (i % 2) * 50, 20, 3) } }],
  /* awnings (stripes) */
  ['a_red', 512, 96, awn('', '#b8202a', '#f4f0e8')], ['a_green', 512, 96, awn('', '#1a5a3a', '#f4f0e8')], ['a_navy', 512, 96, awn('', '#1a2a5a', '#f4f0e8')], ['a_bord', 512, 96, awn('', '#6a1a2a', '#e8c868')],
  ['a_cafe', 512, 96, awn('Café des Singes', '#b8202a', '#b8202a')], ['a_zinc', 512, 96, awn('Le Zinc', '#1a2a1a', '#1a2a1a')], ['a_pain', 512, 96, awn('Au Pain Doré', '#2a3a5a', '#f4f0e8')],
  /* generic ground-floor shops that dress the streets */
  /* 2.2: businesses on the new streets */
  ['salon', 640, 128, peint('Salon Rivoli', 'SALON DE THÉ · chocolat chaud · pâtisseries', '#f4ead8', '#6a3a2a', { light: true, subc: '#8a6a3a' })],
  ['rivsouv', 448, 112, peint('Souvenirs de Paris', 'tour Eiffel · cartes · bérets', '#1a2a5a', '#f4f0e0', { light: true })],
  ['galerie', 640, 128, peint('Galerie Jacob', 'ART MODERNE · estampes · vernissage jeudi', '#f4f4f0', '#1a1a1a', { light: true, sans: true, font: '300 #px ' })],
  ['caveavin', 448, 112, peint('Le Bar à Vins Jacob', 'vins nature · fromages', '#3a0f14', '#e8c868')],
  ['bistro', 448, 112, peint('Bistrot Vaugirard', 'soupe à l’oignon · plat du jour', '#1a2a1e', '#e8c868')],
  ['papeterie2', 448, 112, peint('Papeterie du Luxembourg', 'carnets · encres · plumes', '#2a3a5a', '#f4f0e0', { light: true })],
  ['chocolat', 448, 112, peint('Chocolatier Dauphine', 'pralinés · ganaches', '#2a1a12', '#e8c868')],
  ['g_pharma', 448, 104, (g, w, h) => { g.fillStyle = '#f4f4f0'; g.fillRect(0, 0, w, h); g.fillStyle = '#2aa84a'; g.fillRect(20, 30, 46, 14); g.fillRect(36, 14, 14, 46); g.fillStyle = '#1a6a3a'; g.textAlign = 'left'; g.textBaseline = 'middle'; NW().fit(g, 'PHARMACIE', w - 120, 46, '900 #px Arial, sans-serif', h / 2, 90) }],
  ['g_galerie', 448, 104, peint('Galerie Ondine', 'art contemporain', '#f4f4f0', '#1a1a1a', { light: true, sans: true, font: '300 #px ' })],
  ['g_antiq', 448, 104, peint('Antiquités Belle Époque', '', '#2a1a12', '#e8c868')], ['g_mode', 448, 104, peint('Maison Lavande', 'prêt-à-porter', '#e8e0f0', '#4a2a6a', { light: true })],
  ['g_vin', 448, 104, peint('Cave à Vins Bacchus', 'vins · spiritueux', '#3a0f14', '#e8c868')], ['g_chocolat', 448, 104, peint('Chocolatier Cacao Noir', '', '#2a1a12', '#e8c868')],
  ['g_chapeau', 448, 104, peint('Chapellerie Gaston', 'chapeaux · bérets', '#1a2a3a', '#e8c868')], ['g_opticien', 448, 104, peint('Opticien Lumière', '', '#f4f4f0', '#1a3a6a', { light: true, sans: true })],
  ['g_bistrot', 448, 104, peint('Bistrot du Coin', 'plat du jour', '#1a1a1a', '#e8c868')], ['g_papeterie', 448, 104, peint('Papeterie Encre Bleue', 'cartes · carnets', '#1a3a6a', '#f4f0e0', { light: true })],
  ['g_parfum', 448, 104, peint('Parfums de Paris', '', '#f4e8e0', '#8a4a5a', { light: true })], ['g_epicerie', 448, 104, peint('Épicerie Fine Olive', 'thés · confitures', '#3a5a2a', '#f4f0e0', { light: true })]
];
const GEN = SIGNS.filter(s => /^g_/.test(s[0])).map(s => s[0]), AWN = ['a_red', 'a_green', 'a_navy', 'a_bord'];
function atlasTex() { return NW().makeAtlas(SIGNS, SG, 2048, 3072) }

/* ======================= Haussmann kit ======================= */
const STONE = [0xe8dcc0, 0xe0d4b6, 0xeee4cc, 0xd8cbac, 0xe4d8bc, 0xf0e6d0], DOORS = [0x1a3a2a, 0x1a2a4a, 0x3a1a1a, 0x2a2a2a, 0x1a3a3a], SHOPC = [0x1a2a1e, 0x1a1a1a, 0x2a1a3a, 0x3a1418, 0x1a2a4a, 0x2a3a5a];
const IRON = 0x1a1a1c, ZINC = 0x6a7078;
function haussmann(P, Gl, Gs, fx, fz, yaw, w, h, d, o) { const K = AV.kit, BG = K.BG, rng = o.rng, col = o.col;
  const base = new THREE.Matrix4().makeRotationY(yaw).premultiply(new THREE.Matrix4().makeTranslation(fx, o.y || 0, fz)), VIL = !!o.village;
  const put = (arr, geo, hex, x, y, z, sx, sy, sz, rx) => { const m = K.M(x, y, z, sx, sy, sz, rx || 0, 0, 0); m.premultiply(base); arr.push([geo, hex, m, 0]) };
  const gf = 4.6, fl = 3.15, nwin = Math.max(2, Math.round((w - .6) / 2.3)), ww = 1.15, wh = 2.15, litP = o.litP == null ? .3 : o.litP, warm = () => rng() < .7 ? 0xffd8a0 : 0xfff0d0;
  if (o.hollow) { const t = .3; put(P, BG.box, col, 0, (gf + h) / 2, -d / 2, w, h - gf, d); put(P, BG.box, col, 0, gf / 2, -d + t / 2, w, gf, t); for (const sx of [-1, 1]) put(P, BG.box, col, sx * (w / 2 - t / 2), gf / 2, -d / 2, t, gf, d);
    const dv = w / 2 - 1.1, sc = o.shopCol || 0x1a2a1e; put(P, BG.box, sc, 0, gf - .45, .06, w, .9, .16); put(P, BG.box, sc, -w / 2 + .2, (gf - .9) / 2, .06, .4, gf - .9, .16); put(P, BG.box, sc, dv - .85, (gf - .9) / 2, .06, .3, gf - .9, .16); put(P, BG.box, sc, w / 2 - .15, (gf - .9) / 2, .06, .3, gf - .9, .16);
    const gx0 = -w / 2 + .4, gx1 = dv - 1; put(Gs, BG.box, 0xa8c8d8, (gx0 + gx1) / 2, 1.85, .07, gx1 - gx0, 2.7, .04); put(P, BG.box, sc, (gx0 + gx1) / 2, .3, .07, gx1 - gx0, .6, .14) }
  else put(P, BG.box, col, 0, h / 2, -d / 2, w, h, d);
  if (o.y) put(P, BG.box, 0xb8ac90, 0, -3, -d / 2, w, 6.02, d);   /* stone plinth into the slope */
  /* ground floor: rustication grooves + shopfront or carriage door */
  for (let y = 1.1; y < gf - .2; y += .8) put(P, BG.box, 0xc8bca0, 0, y, .02, w, .05, .05);
  if (o.hollow) { }
  else if (o.shop) { const sc = o.shopCol || SHOPC[(rng() * SHOPC.length) | 0]; put(P, BG.box, sc, 0, gf - .45, .06, w - .2, .9, .14); for (const sx of [-1, 1]) put(P, BG.box, sc, sx * (w / 2 - .3), (gf - .9) / 2, .06, .4, gf - .9, .14);
    put(o.lit ? Gl : Gs, BG.box, o.lit ? warm() : 0xa8c8d8, -.4, 1.85, .09, w - 2.2, 2.7, .04); put(P, BG.box, 0x101010, w / 2 - 1.05, 1.5, .09, 1.1, 2.9, .05); put(P, BG.box, sc, -.4, .3, .08, w - 2.2, .6, .14) }
  else { put(P, BG.box, DOORS[(rng() * DOORS.length) | 0], w * .15, 2, .05, 2.4, 4, .1); put(P, BG.box, 0xc8a040, w * .15, 2, .11, .08, .3, .03); for (const sx of [-1, 1]) if (w > 7) { put(P, BG.box, 0x2a3440, sx * w * .34, 2.2, .05, 1.1, 2, .05); put(P, BG.box, IRON, sx * w * .34, 2.2, .1, 1.2, 2.1, .02) } }
  put(P, BG.box, 0xd4c8a8, 0, gf, .25, w + .1, .3, .5);   /* cornice over the shops */
  /* the étages */
  const nf = Math.max(3, Math.floor((h - gf - .6) / fl));
  for (let f = 0; f < nf; f++) { const y = gf + .5 + f * fl, cont = !VIL && (f === 1 || f === nf - 1);
    if (cont) { put(P, BG.box, 0xd8ccb0, 0, y - .08, .35, w - .1, .16, .7); put(P, BG.box, IRON, 0, y + .5, .68, w - .2, .8, .04); put(P, BG.box, IRON, 0, y + .14, .68, w - .2, .06, .05); for (let k = 0; k < Math.floor(w / 1.2); k++) put(P, BG.box, IRON, -w / 2 + .5 + k * 1.2, y + .5, .68, .04, .8, .04) }
    for (let i = 0; i < nwin; i++) { const x = (i - (nwin - 1) / 2) * ((w - .6) / nwin), L1 = rng() < litP;
      put(P, BG.box, 0xf0e8d4, x, y + wh / 2 + .1, .03, ww + .3, wh + .3, .08); put(L1 ? Gl : P, BG.box, L1 ? warm() : 0x2a3440, x, y + wh / 2 + .1, .08, ww, wh, .04);
      if (VIL) { for (const s of [-1, 1]) put(P, BG.box, [0x3a6a4a, 0x2a4a6a, 0x8a3a2a][(i + f) % 3], x + s * (ww / 2 + .32), y + wh / 2 + .1, .07, .5, wh, .04) } else if (!cont && f < nf - 1) put(P, BG.box, IRON, x, y + .45, .3, ww + .3, .7, .03);
      if (f === 0) put(P, BG.box, 0xd8ccb0, x, y + wh + .45, .08, ww + .5, .22, .2) } }
  /* main cornice + mansard roof (zinc slope, dormers, chimneys) */
  put(P, BG.box, 0xd8ccb0, 0, h + .1, .2, w + .15, .35, .6);
  if (VIL) { put(P, BG.box, 0x8a4a3a, 0, h + 1.2, -.9, w + .2, 2.6, .25, -.7); put(P, BG.box, 0x8a4a3a, 0, h + 1.9, -d / 2 - .4, w + .2, .25, d - 1.6); put(P, BG.box, 0xd8c8b0, w * .25, h + 2.6, -d / 2, .7, 1.6, .7); put(P, BG.box, 0x9a8e74, 0, .02, -d / 2, w, .04, d); return base }
  put(P, BG.box, ZINC, 0, h + 2.2, -.9, w, 4.6, .25, -.42); put(P, BG.box, ZINC, 0, h + 4.25, -d / 2 - .6, w, .2, d - 2.2);
  for (let i = 0; i < nwin; i += (nwin > 3 ? 1 : 1)) { const x = (i - (nwin - 1) / 2) * ((w - .6) / nwin); if (i % 2) continue; put(P, BG.box, 0xe8e0d0, x, h + 1.4, -.45, 1.15, 1.7, 1.1); put(rng() < litP ? Gl : P, BG.box, rng() < .5 ? warm() : 0x2a3440, x, h + 1.35, .1, .7, 1.1, .04); put(P, BG.box, ZINC, x, h + 2.35, -.4, 1.35, .25, 1.3) }
  for (const sx of [-1, 1]) { put(P, BG.box, 0xc8a888, sx * (w / 2 - .4), h + 5.2, -d / 2, .6, 2, 1.6); for (let k = 0; k < 3; k++) put(P, BG.cyl, 0xc86a3a, sx * (w / 2 - .4), h + 6.4, -d / 2 - .5 + k * .5, .1, .5, .1) }
  put(P, BG.box, 0x9a8e74, 0, .02, -d / 2, w, .04, d);
  return base }

/* ======================= the world ======================= */
AV.registerWorld({
  id: 'paris',
  build(ctx) {
    const K = AV.kit, CY = AV.city, BG = K.BG, q = ctx.q, rng = ctx.rng, grp = ctx.group, S = AV.S;
    const st = () => { S.paris = S.paris || { met: {}, q: {}, boat: 0, metro: 0 }; return S.paris };
    const T = (x, z, r, label, fn, show, kind) => { const t = { x, z, r, label, fn, show, kind }; ctx.T.push(t); return t };
    const P = [], Gl = [], Gs = [], Q = [], cols = ctx.cols, circ = ctx.circles;
    const box = (arr, hex, x0, x1, y0, y1, z0, z1) => arr.push([BG.box, hex, K.M((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0)), 0]);
    const sign = (k, x, y, z, w, h, ry, dbl) => { Q.push({ k, x, y, z, w, h, ry }); if (dbl) Q.push({ k, x: x - Math.sin(ry) * .03, y, z: z - Math.cos(ry) * .03, w, h, ry: ry + PI }) };
    const P0 = P, Gl0 = Gl, Gs0 = Gs, sign0 = sign;
    let gi = 0; const nextGen = () => GEN[(gi++ * 5) % GEN.length];
    /* ---------- ground: pale paving, asphalt for the quai + boulevard, cobbles (pavés) on the side streets ---------- */
    const tex = (fn, rep) => { const c = document.createElement('canvas'); c.width = c.height = 256; fn(c.getContext('2d')); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t };
    const pave = tex(g => { g.fillStyle = '#9a948a'; g.fillRect(0, 0, 256, 256); for (let y = 0; y < 256; y += 64) for (let x = 0; x < 256; x += 64) { const v = 170 + Math.random() * 25; g.fillStyle = 'rgb(' + (v | 0) + ',' + (v - 4 | 0) + ',' + (v - 14 | 0) + ')'; g.fillRect(x + 2, y + 2, 60, 60) } }, .5);
    { const sh2 = new THREE.Shape([[XMIN, ZMAX], [XMAX, ZMAX], [XMAX, ZMIN], [XMIN, ZMIN]].map(p => new THREE.Vector2(p[0], -p[1])));
      sh2.holes.push(new THREE.Path([[XMIN, -30], [ISLE[0], -30], [ISLE[0], -ISLE[2]], [ISLE[1], -ISLE[2]], [ISLE[1], -30], [XMAX, -30], [XMAX, 30], [ISLE[1], 30], [ISLE[1], -ISLE[3]], [ISLE[0], -ISLE[3]], [ISLE[0], 30], [XMIN, 30]].map(p => new THREE.Vector2(p[0], p[1]))));
      const g = new THREE.ShapeGeometry(sh2); g.rotateX(-PI / 2); const uv = g.attributes.uv, pp = g.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, pp.getX(i) / 2, pp.getZ(i) / 2);
      const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: pave, roughness: .9 })); m.position.y = -.01; m.receiveShadow = true; m.material.userData.lin = 1; grp.add(m) }
    const ASPH = 0x34353a, COB = 0x6e6a64, LINE = 0xe8e8e4;
    box(P, ASPH, XMIN, XMAX, 0, .03, 36, 46); box(P, ASPH, XMIN, XMAX, 0, .03, -46, -36); box(P, ASPH, XMIN, XMAX, 0, .03, 114, 126);   /* quai sud, quai nord, boulevard */
    for (let x = XMIN + 2; x < XMAX; x += 7) { box(P, LINE, x, x + 3.5, .03, .04, 40.9, 41.1); box(P, LINE, x, x + 3.5, .03, .04, -41.1, -40.9); box(P, LINE, x, x + 3.5, .03, .04, 119.9, 120.1) }
    for (const z of [35.9, 45.9, -46.1, -36.1, 113.9, 125.9]) box(P, 0xb8b0a0, XMIN, XMAX, 0, .15, z, z + .2);   /* kerbs */
    const cobbles = (x0, x1, z0, z1) => { box(P, COB, x0, x1, 0, .025, z0, z1); for (let z = z0 + .5; z < z1; z += 1.1) box(P, 0x5a5650, x0, x1, .025, .03, z, z + .06) };
    cobbles(-66, -54, 46, 114); cobbles(-6, 6, 46, 114); cobbles(54, 66, 46, 114); cobbles(-6, 6, 126, 230); cobbles(146, 156, 126, 150);
    for (const [x0, x1, z0, z1] of [[-70, -50, 112, 128], [-10, 10, 112, 128], [50, 70, 112, 128], [-70, -50, 34, 48], [-10, 10, 34, 48], [50, 70, 34, 48]]) for (let k = 0; k < 7; k++) { const vert = z1 - z0 < x1 - x0; if (vert) box(P, LINE, x0 + 1 + k * 2.6, x0 + 2.2 + k * 2.6, .03, .045, z0 + 1.5, z1 - 1.5); else box(P, LINE, x0 + 1.5, x1 - 1.5, .03, .045, z0 + 1 + k * 2, z0 + 2 + k * 2) }   /* zebras */
    /* ---------- the Seine: water, high stone quay walls, parapets, plane trees along the quais ---------- */
    const wm = K.water({ deep: 0x2a3a34, shallow: 0x4a5a50, sky: 0xc0ccd4, opacity: .94, iri: .03 });
    { const sh3 = new THREE.Shape([[XMIN, -30], [XMAX, -30], [XMAX, 30], [XMIN, 30]].map(p => new THREE.Vector2(p[0], -p[1]))); sh3.holes.push(new THREE.Path([[ISLE[0], -ISLE[2]], [ISLE[1], -ISLE[2]], [ISLE[1], -ISLE[3]], [ISLE[0], -ISLE[3]]].map(p => new THREE.Vector2(p[0], p[1]))));
      const g = new THREE.ShapeGeometry(sh3); g.rotateX(-PI / 2); const w = new THREE.Mesh(g, wm); w.position.y = WY; w.renderOrder = 1; grp.add(w) }
    const WALL = 0xb8aa8a; box(P, WALL, XMIN, XMAX, WY - 2, 0, -30.6, -30); box(P, WALL, XMIN, XMAX, WY - 2, 0, 30, 30.6); box(P, 0x2a2e28, XMIN, XMAX, WY - 2.1, WY - 2, -30, 30);
    box(P, WALL, ISLE[0], ISLE[1], WY - 2, 0, ISLE[2] - .6, ISLE[2]); box(P, WALL, ISLE[0], ISLE[1], WY - 2, 0, ISLE[3], ISLE[3] + .6); box(P, WALL, ISLE[0] - .6, ISLE[0], WY - 2, 0, ISLE[2], ISLE[3]); box(P, WALL, ISLE[1], ISLE[1] + .6, WY - 2, 0, ISLE[2], ISLE[3]);
    const para = (x0, x1, z0, z1) => { box(P, 0xd8ccb0, x0, x1, 0, 1, z0, z1); box(P, 0xe8dcc4, x0 - .05, x1 + .05, 1, 1.12, z0 - .05, z1 + .05); cols.push([x0, x1, z0, z1]) };
    const gaps = BRIDGES.map(b => [b[0], b[1]]); const segs = (z0, z1, x0, x1) => { let a = x0; for (const [g0, g1] of gaps.slice().sort((p, q2) => p[0] - q2[0])) { if (g1 < x0 || g0 > x1) continue; if (g0 > a) para(a, g0, z0, z1); a = Math.max(a, g1) } if (a < x1) para(a, x1, z0, z1) };
    segs(-31, -30.4, XMIN, XMAX); segs(30.4, 31, XMIN, XMAX);
    { const b = [ISLE[0], ISLE[1]]; para(b[0], 170, ISLE[3] - .6, ISLE[3]); para(180, 300, ISLE[3] - .6, ISLE[3]); para(310, b[1], ISLE[3] - .6, ISLE[3]); para(b[0], 183, ISLE[2], ISLE[2] + .6); para(191, b[1], ISLE[2], ISLE[2] + .6); para(b[1] - .6, b[1], ISLE[2], ISLE[3]) }
    /* ---------- bridges: the Pont Neuf (stone, arches, round bastions) + the footbridge (iron, timber deck) + the island bridges ---------- */
    const deck = (b, col, thick) => { const [x0, x1, z0, z1, rise] = b, n = 24; for (let i = 0; i < n; i++) { const za = z0 + (z1 - z0) * i / n, zb = z0 + (z1 - z0) * (i + 1) / n, t = ((za + zb) / 2 - (z0 + z1) / 2) / ((z1 - z0) / 2), y = .25 + rise * (1 - t * t); box(P, col, x0, x1, y - thick, y, za, zb + .02); for (const x of [x0, x1 - .5]) box(P, col === 0x8a6a4a ? IRON : 0xd8ccb0, x, x + .5, y, y + 1.1, za, zb + .02) } };
    deck(BRIDGES[0], 0xc8bca0, 1.4); for (const zc of [-18, 0, 18]) { box(P, 0xb8ac90, -71, -49, WY - 1, -.6, zc - 3, zc + 3); P.push([BG.cyl, 0xc8bca0, K.M(-60, WY + 2.5, zc, 3.2, 6, 3.2, PI / 2, 0, 0), 0]) } for (const zc of [-27, -9, 9, 27]) for (const x of [-71.5, -48.5]) P.push([BG.cyl, 0xc8bca0, K.M(x, -.4, zc, 1.8, 1.2, 1.8), 0]);
    deck(BRIDGES[1], 0x8a6a4a, .3); for (let z = -24; z <= 24; z += 12) { box(P, IRON, 56.5, 57, WY - 1, .2, z - .3, z + .3); box(P, IRON, 63, 63.5, WY - 1, .2, z - .3, z + .3); for (let k = 0; k < 6; k++) box(P, IRON, 56, 64, -2.8 + k * .45, -2.7 + k * .45, z - 6 + k * 1.1, z - 5.9 + k * 1.1) }
    deck(BRIDGES[2], 0xc8bca0, .6); deck(BRIDGES[3], 0xc8bca0, .6); deck(BRIDGES[4], 0xc8bca0, .6);
    PAR.stats.bridges = BRIDGES.length;
    /* bouquinistes: green boxes on the south parapet */
    const BOUQ = []; for (let x = -280; x < 330; x += 9) { if (gaps.some(([g0, g1]) => x > g0 - 6 && x < g1 + 4) || (x > 100 && x < 140) || (x > -54 && x < -28)) continue; const open2 = ((x / 9) | 0) % 3 !== 0; box(P, 0x2a5a3a, x, x + 6, 1.12, 1.9, 30.45, 31.3); if (open2) { box(P, 0x2a5a3a, x, x + 6, 1.9, 2, 30.2, 31.8); box(P, 0x2a5a3a, x, x + 6, 2, 2.9, 31.7, 31.8); for (let k = 0; k < 8; k++) box(P, [0xd8c8a0, 0x8a2a2a, 0x2a4a6a, 0xf4f0e0][k % 4], x + .3 + k * .7, x + .8 + k * .7, 2.05, 2.75, 31.65, 31.68) } BOUQ.push([x + 3, 32.4, open2]) }
    PAR.bouq = BOUQ;
    /* quai plane trees + lanterns */
    const planes = []; for (let x = XMIN + 6; x < XMAX; x += 13) { if (gaps.some(([g0, g1]) => x > g0 - 3 && x < g1 + 3)) continue; planes.push([x, -33.5]); if (!(x > 100 && x < 140)) planes.push([x, 47.5]) }
    for (let x = XMIN + 8; x < XMAX; x += 12) { if (x > 92 && x < 158) continue; planes.push([x, 111]); planes.push([x, 129]) }
    for (const [x, z] of planes) { const h = 8 + rng() * 3; box(P, 0x8a8268, x - .22, x + .22, 0, h * .55, z - .22, z + .22); for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; P.push([BG.ico, [0x4a6a2e, 0x5a7a34, 0x3e5e28][k % 3], K.M(x + Math.cos(a) * 1.8, h * .75 + (k % 2) * .7, z + Math.sin(a) * 1.8, 2.6, 2, 2.6), 0]) } P.push([BG.ico, 0x4a6a2e, K.M(x, h * .92, z, 2.8, 2.2, 2.8), 0]); box(P, 0x2a2a2a, x - .8, x + .8, 0, .03, z - .8, z + .8); circ.push([x, z, .35]) }
    PAR.stats.trees = planes.length;
    const lantern = (x, z, hh) => { box(P, 0x1a2a22, x - .08, x + .08, 0, hh || 4.4, z - .08, z + .08); box(P, 0x1a2a22, x - .2, x + .2, 0, .5, z - .2, z + .2); box(Gl, 0xffe0a0, x - .22, x + .22, (hh || 4.4) - .1, (hh || 4.4) + .5, z - .22, z + .22); box(P, 0x1a2a22, x - .28, x + .28, (hh || 4.4) + .5, (hh || 4.4) + .62, z - .28, z + .28); circ.push([x, z, .2]) };
    for (let x = XMIN + 12; x < XMAX; x += 24) { if (!gaps.some(([g0, g1]) => x > g0 - 2 && x < g1 + 2)) { lantern(x, -31.6); lantern(x, 34.6) } }
    for (const b of BRIDGES.slice(0, 2)) for (const z of [-20, 0, 20]) for (const x of [b[0] + .4, b[1] - .4]) { const y = bridgeY(x + (x < b[0] + 1 ? .5 : -.5), z); box(P, 0x1a2a22, x - .08, x + .08, y, y + 4, z - .08, z + .08); box(Gl, 0xffe0a0, x - .2, x + .2, y + 3.9, y + 4.4, z - .2, z + .2) }
    /* ---------- building rows ---------- */
    const SHOPS = {};
    const SPECIAL = [['salon', 'rivN', -150, 10, 10], ['rivsouv', 'rivS', 120, 8], ['galerie', 'jacN', -200, 9, 9], ['caveavin', 'jacS', -140, 8], ['bistro', 'vgN', 40, 9], ['papeterie2', 'vgS', -150, 8], ['chocolat', 'dsE', 165, 8],
      ['librairie', 'quaiS', -30, 9, 10], ['disques', 'bonaE', 80, 8], ['cafe', 'place', 126, 12, 6.5], ['brasserie', 'place', 108, 9],
      ['cave', 'seineW', 82, 10, 12], ['patisserie', 'bvdN', 25, 9], ['swag', 'bvdN', 200, 12], ['tabac', 'bvdN', -30, 7],
      ['boulangerie', 'buciW', 158, 9, 11], ['fromagerie', 'buciE', 160, 9], ['creperie', 'buciE', 176, 6], ['fleuriste', 'buciW', 180, 7], ['velape', 'quaiS', 92, 7]];
    let nB = 0;
    function row(id, ax, front, a0, a1, face, depth, o) { o = o || {}; nB += NW().rowWalk({ id, ax, front, a0, a1, face, depth, rng, SPECIAL, SHOPS, cols, gaps: o.gaps, wmin: o.wmin || 7, wmax: o.wmax || 12, lot: L => {
      const P = L.skip ? [] : P0, Gl = L.skip ? [] : Gl0, Gs = L.skip ? [] : Gs0, sign = L.skip ? () => { } : sign0;
      const h = (o.h0 || 18.5) + rng() * (o.hr || 3), shop = L.isSp || rng() < (o.shopP == null ? .75 : o.shopP);
      haussmann(P, Gl, Gs, L.fx, L.fz, L.yaw, L.w, h, depth, { rng, col: STONE[(rng() * STONE.length) | 0], shop, lit: shop && rng() < .8, hollow: L.isSp && L.sp[4], shopCol: L.isSp ? SHOPC[(L.ac | 0) & 3] : null, litP: o.litP });
      const sx = L.fx + L.out[0] * .24, sz = L.fz + L.out[1] * .24;
      if (shop && !L.isSp) { const gk = nextGen(); sign(gk, sx, 4.15, sz, L.w - .8, (L.w - .8) * .232, L.yaw); sign(['w_livres', 'w_mode', 'w_macaron', 'w_pain', 'w_fromage'][(rng() * 5) | 0], L.fx + L.out[0] * .15, 1.85, L.fz + L.out[1] * .15, Math.max(1, L.w - 2.4), 2.2, L.yaw) }
      if (shop && rng() < .55) { const ak = L.isSp && L.sp[0] === 'cafe' ? 'a_cafe' : L.isSp && L.sp[0] === 'brasserie' ? 'a_zinc' : L.isSp && L.sp[0] === 'boulangerie' ? 'a_pain' : AWN[(rng() * 4) | 0], aw = L.w - .6;
        const m = K.M(L.fx + L.out[0] * .9, 3.55, L.fz + L.out[1] * .9, aw, .9, .05, 0, L.yaw, 0); P.push([BG.box, 0x2a2a2a, K.M(L.fx + L.out[0] * 1.6, 3.15, L.fz + L.out[1] * 1.6, L.al[0] ? aw : .04, .05, L.al[1] ? aw : .04), 0]); void m;
        sign(ak, L.fx + L.out[0] * .95, 3.6, L.fz + L.out[1] * .95, aw, .95, L.yaw) } } }) }
    const fill = (x0, x1, z0, z1, h0, hr) => { for (let x = x0; x < x1 - .5; x += 24) for (let z = z0; z < z1 - .5; z += 24) { const xa = Math.min(x1, x + 24), za = Math.min(z1, z + 24), h = h0 + rng() * hr; box(P, STONE[(rng() * STONE.length) | 0], x, xa, 0, h, z, za); box(P, ZINC, x + .5, xa - .5, h, h + 3, z + .5, za - .5) } cols.push([x0, x1, z0, z1]) };
    /* north bank (Rive Droite): one long row facing the river */
    row('quaiN', 'x', -52, XMIN, -6, 1, 16, { h0: 19, hr: 3, shopP: .6, gaps: [[-300, -285], [-67, -53]] }); row('quaiN', 'x', -52, 6, XMAX, 1, 16, { h0: 19, hr: 3, shopP: .6, gaps: [[53, 67], [180, 194], [325, 341]] }); fill(-6, 6, -68, -56, 18, 2);
    /* Rue de Rivoli (z -100..-88) with arcades on its north side; cross streets to the quai at x -60, 60, 187; edge streets at x -291 and 331 */
    box(P, ASPH, XMIN, XMAX, 0, .03, -98, -90); for (const z of [-98.1, -89.9]) box(P, 0xb8b0a0, XMIN, XMAX, 0, .15, z - .1, z + .1); for (const [x0, x1] of [[-66, -54], [54, 66], [181, 193], [-296, -286], [326, 336]]) box(P, COB, x0, x1, 0, .025, -88, -52);
    const RS = { h0: 18, hr: 4, gaps: [[-300, -285], [325, 341]] }; row('rivN', 'x', -100, XMIN, XMAX, 1, 12, RS); for (const [x0, x1] of [[-285, -66], [-54, 54], [66, 181], [193, 325]]) { row('rivS', 'x', -88, x0, x1, -1, 12, { h0: 18, hr: 4 }); fill(x0, x1, -76, -68, 16, 4) } fill(XMIN, XMAX, ZMIN, -112, 20, 4); fill(XMIN, -296, -88, -52, 16, 4); fill(336, XMAX, -88, -52, 16, 4);
    for (let x = XMIN + 2; x < XMAX; x += 4) { if ((x > -298 && x < -284) || (x > 324 && x < 338)) continue; box(P, 0xd8ccb0, x - .3, x + .3, 0, 4.4, -100.4, -99.8) } box(P, 0xd8ccb0, XMIN, XMAX, 4.4, 4.8, -100.6, -96.4);
    /* south bank: the quai row, the streets, the boulevard */
    row('quaiS', 'x', 52, XMIN, -66, -1, 14, { gaps: [[-300, -285]] }); row('quaiS', 'x', 52, -54, -6, -1, 14); row('quaiS', 'x', 52, 6, 54, -1, 14); row('quaiS', 'x', 52, 66, 96, -1, 14); row('quaiS', 'x', 52, 96, 156, -1, 7, { gaps: [[139, 151]] }); row('quaiS', 'x', 52, 156, XMAX, -1, 14, { gaps: [[325, 341]] });
    const JG = { wmin: 6, wmax: 9, gaps: [[75, 85]] }; row('dauW', 'z', -66, 66, 94, 1, 14, JG); row('dauE', 'z', -54, 66, 94, -1, 14, JG); row('seineW', 'z', -6, 66, 94, 1, 14, JG); row('seineE', 'z', 6, 66, 94, -1, 14, JG);
    row('bonaW', 'z', 54, 66, 94, 1, 14, JG); row('bonaE', 'z', 66, 66, 94, -1, 14, JG); row('placeW', 'z', 96, 66, 94, 1, 14, JG); row('placeE', 'z', 156, 66, 94, -1, 14, { wmin: 6, wmax: 9 });
    row('place', 'x', 66, 96, 156, 1, 7, { wmin: 8, wmax: 12, gaps: [[139, 151]] }); box(P, COB, 140, 150, 0, .025, 46, 66); box(P, 0xd8ccb0, 140, 150, 4.6, 5.2, 52, 66);   /* the passage from the quai into the Place (a covered arcade) */
    /* Rue Jacob (z 76..84): from the west edge street through the blocks into the Place */
    row('jacN', 'x', 76, -285, -80, 1, 10, { wmin: 6, wmax: 10 }); row('jacS', 'x', 84, -285, -80, -1, 10, { wmin: 6, wmax: 10 }); box(P, COB, -296, 96, 0, .024, 76, 84);
    fill(XMIN, -296, 46, 230, 14, 4); fill(-40, -20, 66, 75, 18, 4); fill(-40, -20, 85, 94, 18, 4); fill(20, 40, 66, 75, 18, 4); fill(20, 40, 85, 94, 18, 4); fill(80, 82, 66, 75, 18, 4); fill(80, 82, 85, 94, 18, 4); fill(170, 325, 66, 94, 18, 4); fill(336, XMAX, 46, 146, 14, 4);
    box(P, COB, -296, -286, 0, .025, 46, 208); box(P, COB, 326, 336, 0, .025, 46, 212);
    row('bvdN', 'x', 108, XMIN, -66, 1, 14, { gaps: [[-300, -285]] }); row('bvdN', 'x', 108, -54, -6, 1, 14); row('bvdN', 'x', 108, 6, 54, 1, 14); row('bvdN', 'x', 108, 66, 96, 1, 14); row('bvdN', 'x', 108, 156, XMAX, 1, 14, { gaps: [[325, 341]] });
    row('bvdS', 'x', 132, XMIN, -6, -1, 14, { gaps: [[-300, -285], [-67, -53]] }); row('bvdS', 'x', 132, 6, 90, -1, 14); row('bvdS', 'x', 132, 156, XMAX, -1, 14, { shopP: .5, gaps: [[325, 341]] });
    row('buciW', 'z', -6, 146, ZMAX, 1, 14, { wmin: 6, wmax: 9, h0: 16, gaps: [[199, 209]] }); row('buciE', 'z', 6, 146, ZMAX, -1, 14, { wmin: 6, wmax: 9, h0: 16, gaps: [[199, 209]] });
    /* Rue Dauphine continues south (x -66..-54) to Rue de Vaugirard (z 200..208), which runs from the west edge street past Buci into the garden */
    const VG = { wmin: 6, wmax: 10, h0: 16, hr: 4 }; row('dsW', 'z', -66, 146, 188, 1, 12, VG); row('dsE', 'z', -54, 146, 188, -1, 12, VG); box(P, COB, -66, -54, 0, .025, 126, 200); box(P, COB, -296, 146, 0, .024, 200, 208);
    for (const [x0, x1, d] of [[-285, -66, 12], [-54, -20, 12], [20, 90, 12], [90, 146, 10]]) { row('vgN', 'x', 200, x0, x1, 1, d, VG); row('vgS', 'x', 208, x0, x1, -1, 12, VG) }
    fill(-285, -78, 146, 188, 16, 5); fill(-42, -20, 146, 188, 16, 5); fill(20, 90, 146, 188, 16, 5); fill(90, 96, 140, 190, 14, 4); fill(140, 146, 140, 150, 14, 2); fill(-285, 146, 220, ZMAX, 14, 4);
    PAR.stats.buildings = nB;
    /* ---------- landmarks ---------- */
    /* the church: Romanesque nave + square bell tower with a spire (x 96..140, z 134..190) */
    { const st2 = 0xd8ccb0; box(P, st2, 100, 136, 0, 18, 148, 190); box(P, 0x6a6a6a, 100, 136, 18, 19, 148, 190); P.push([BG.box, 0x5a5e62, K.M(118, 22, 169, 37, 8, 43, 0, 0, 0), 0]); box(P, st2, 104, 116, 0, 34, 134, 148); box(P, 0x5a5e62, 103.6, 116.4, 34, 35, 133.6, 148.4); P.push([BG.cone, 0x4a4e52, K.M(110, 41, 141, 8.6, 12, 8.6, 0, PI / 4, 0), 0]);
      for (const y of [22, 28]) for (const x of [106.5, 111, 113.5]) box(P, 0x2a2a2a, x - .6, x + .6, y, y + 3.4, 133.95, 134); box(P, 0x2a2018, 108, 112, 0, 4.4, 133.9, 134); for (let k = 0; k < 4; k++) box(P, st2, 107.6 - k * .25, 112.4 + k * .25, 4.4 + k * .25, 4.65 + k * .25, 133.8 - k * .1, 134);
      for (let z = 152; z < 188; z += 6) { box(P, 0x3a4a6a, 99.9, 100, 7, 13, z, z + 2); box(Gl, 0xc8a050, 99.85, 99.9, 7.5, 12.5, z + .3, z + 1.7) } for (const y of [10, 20, 33]) box(P, 0xc8bc9c, 103.7, 116.3, y, y + .5, 133.6, 134); for (const x of [103.6, 115.4]) box(P, 0xc8bc9c, x, x + 1, 0, 33, 133.4, 134.4); for (const x of [106.4, 112.6]) { box(P, 0x2a2a30, x - .5, x + .5, 12, 17, 133.9, 133.95); P.push([BG.cyl, 0x2a2a30, K.M(x, 17, 133.93, .5, .05, .5, PI / 2, 0, 0), 0]) } P.push([BG.cyl, 0xe8e0c8, K.M(110, 18.5, 133.9, 1.3, .1, 1.3, PI / 2, 0, 0), 0]); Gl.push([BG.cyl, 0xfff0c8, K.M(110, 18.5, 133.85, 1.1, .06, 1.1, PI / 2, 0, 0), 0]); P.push([BG.cyl, 0xc8bc9c, K.M(110, 4.4, 133.9, 2.4, .4, 2.4, PI / 2, 0, 0), 0]);
      for (let x = 118; x < 136; x += 4.5) { box(P, 0xc8bc9c, x - .4, x + .4, 0, 14, 147.2, 148); box(P, 0x2a2a30, x + 1.4, x + 2.6, 6, 11.5, 147.9, 147.95); P.push([BG.cyl, 0x2a2a30, K.M(x + 2, 11.5, 147.93, .6, .05, .6, PI / 2, 0, 0), 0]) }
      cols.push([100, 136, 147.2, 190], [103.4, 116.6, 133.4, 148]);
      for (const [x, z] of [[94, 138], [94, 146], [143, 140]]) { const h = 7; box(P, 0x6a5a48, x - .2, x + .2, 0, h * .5, z - .2, z + .2); P.push([BG.ico, 0x4a6a2e, K.M(x, h * .8, z, 2.6, 2.2, 2.6), 0]); circ.push([x, z, .3]) } }
    /* the cathedral on the Île (public landmark): west front with two towers + rose window, nave, flying buttresses, spire */
    { const st2 = 0xd8ceb4, x0 = 194, cz = 0; box(P, st2, x0, x0 + 12, 0, 46, cz - 20, cz + 20); for (const s of [-1, 1]) { box(P, st2, x0 - .5, x0 + 12, 0, 66, cz + s * 13 - 7, cz + s * 13 + 7); box(P, 0x9a9080, x0 - .6, x0 + 12.5, 66, 67, cz + s * 13 - 7.3, cz + s * 13 + 7.3); for (let k = 0; k < 3; k++) box(P, 0x2a2a2a, x0 - .55, x0 - .5, 50, 62, cz + s * 13 - 4.5 + k * 3, cz + s * 13 - 3.5 + k * 3) }
      box(P, 0x6a6a60, x0 - .6, x0, 30, 32, cz - 20, cz + 20); for (let k = 0; k < 28; k++) box(P, 0xc8bca0, x0 - .55, x0 - .2, 33, 37.5, cz - 13 + k * .95, cz - 12.6 + k * .95);   /* gallery of kings */
      P.push([BG.cyl, 0x9a8a6a, K.M(x0 - .3, 26, cz, 6, .3, 6, 0, 0, PI / 2), 0]); P.push([BG.cyl, 0xd84a6a, K.M(x0 - .4, 26, cz, 5.2, .2, 5.2, 0, 0, PI / 2), 1]); Gl.push([BG.cyl, 0x6a4ad8, K.M(x0 - .45, 26, cz, 3.4, .2, 3.4, 0, 0, PI / 2), 0]);
      for (const zz of [-13, 0, 13]) { box(P, 0x2a2018, x0 - .5, x0, 0, 10, cz + zz - 3, cz + zz + 3); for (let k = 0; k < 5; k++) box(P, st2, x0 - .9 + k * .08, x0 - .5, 10 + k * .5, 10.5 + k * .5, cz + zz - 3.5 - k * .1, cz + zz + 3.5 + k * .1) }
      box(P, st2, x0 + 12, x0 + 110, 0, 32, cz - 10, cz + 10); P.push([BG.box, 0x5a6066, K.M(x0 + 61, 36, cz, 98, 10, 16, 0, 0, 0), 0]); box(P, st2, x0 + 55, x0 + 75, 0, 30, cz - 18, cz + 18);
      for (let x = x0 + 18; x < x0 + 106; x += 9) for (const s of [-1, 1]) { box(P, st2, x - .6, x + .6, 0, 22, cz + s * 15.5 - 1, cz + s * 15.5 + 1); P.push([BG.box, st2, K.M(x, 26, cz + s * 12.6, 1, .9, 6.4, -s * .7, 0, 0), 0]); box(Gl, 0x5a4ac8, x + 2.5, x + 5, 12, 26, cz + s * 10.02, cz + s * 10.06) }
      P.push([BG.cone, 0x5a6066, K.M(x0 + 65, 58, cz, 2.2, 32, 2.2), 0]); box(P, 0x6a7078, x0 + 63, x0 + 67, 40, 44, cz - 2, cz + 2); cols.push([x0 - .7, x0 + 12.5, cz - 20.5, cz + 20.5], [x0 + 12, x0 + 110, cz - 16.7, cz + 16.7], [x0 + 55, x0 + 75, cz - 18.2, cz + 18.2]);
      for (const [x, z] of [[170, -12], [170, 12], [180, -14], [182, 14], [300, -12], [300, 12], [310, 0]]) { const h = 8; box(P, 0x6a5a48, x - .22, x + .22, 0, h * .55, z - .22, z + .22); for (let k = 0; k < 4; k++) { const a = k / 4 * TAU; P.push([BG.ico, 0x4a6a2e, K.M(x + Math.cos(a) * 1.6, h * .78, z + Math.sin(a) * 1.6, 2.4, 1.9, 2.4), 0]) } circ.push([x, z, .3]) }
      for (const z of [-6, 6]) for (const x of [164, 176, 186]) { box(P, 0x2a4a3a, x - .9, x + .9, .4, .5, z - .25, z + .25); box(P, 0x2a4a3a, x - .9, x + .9, .5, 1, z + .2, z + .25) } }
    /* the Eiffel Tower on the western skyline (scenery, beyond the edge of the world) */
    { const ex = -470, ez = -140, br = 0x6a5440, TP = [], seg = (x0, y0, z0, x1, y1, z1, w2) => { const dx = x1 - x0, dy = y1 - y0, dz = z1 - z0, L2 = Math.hypot(dx, dy, dz), m = new THREE.Matrix4().lookAt(new THREE.Vector3(x0, y0, z0), new THREE.Vector3(x1, y1, z1), new THREE.Vector3(0, 1, 0)); m.multiply(new THREE.Matrix4().makeScale(w2, w2, L2)); m.setPosition((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); TP.push([BG.box, br, m, 0]) };
      const lv = [[0, 38], [58, 20], [116, 10], [200, 4], [276, 1.2]]; for (let i = 0; i < lv.length - 1; i++) { const [y0, r0] = lv[i], [y1, r1] = lv[i + 1]; for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { seg(ex + sx * r0, y0, ez + sz * r0, ex + sx * r1, y1, ez + sz * r1, i < 2 ? 4 : 2.2); if (i < 3) { seg(ex + sx * r0, y0, ez + sz * r0, ex + sx * r1, y1, ez - sz * r1, .6); seg(ex + sx * r0, y0, ez + sz * r0, ex - sx * r1, y1, ez + sz * r1, .6) } } TP.push([BG.box, br, K.M(ex, y1, ez, r1 * 2 + 3, 2.4, r1 * 2 + 3), 0]) }
      for (const [sx, sz] of [[1, 0], [0, 1]]) TP.push([BG.cyl, br, K.M(ex, 30, ez, 24 * (sz ? .3 : 1), 3, 24 * (sx ? .3 : 1), PI / 2, sx ? PI / 2 : 0, 0), 0]); TP.push([BG.box, 0xd8d8d0, K.M(ex, 286, ez, .8, 22, .8), 0]);
      for (const y of [58, 116, 200]) for (let k = 0; k < 12; k++) { const a = k / 12 * TAU, r = y === 58 ? 22 : y === 116 ? 12 : 5; Gl.push([BG.box, 0xffd890, K.M(ex + Math.cos(a) * r, y + 1.6, ez + Math.sin(a) * r, .8, .8, .8), 0]) }
      const tm = new THREE.Mesh(K.merge(TP), K.floraMat(0, { rough: .7 })); tm.material.userData.lin = 1; tm.name = 'par_eiffel'; grp.add(tm); PAR.eiffel = tm }
    /* the north corner of the Luxembourg garden (x 146..340, z 150..230): gravel, lawns, the pond with toy boats, green chairs, the palace front */
    { box(P, 0xd8ccaa, 146, XMAX, 0, .02, 150, ZMAX); box(P, 0x9a8a6a, 156, 325, 0, 2.2, 146, 148); for (let x = 157; x < 325; x += 3) box(P, IRON, x, x + .08, 2.2, 3.4, 146.9, 147.1); cols.push([156, 325, 146, 148.2]);
      box(P, 0x5a8a3a, 170, 230, 0, .05, 160, 190); box(P, 0x5a8a3a, 260, 330, 0, .05, 160, 190); const pc = [245, 196]; P.push([BG.cyl, 0xb8ac90, K.M(pc[0], .4, pc[1], 14, .8, 14), 0]); PAR.pond = pc; circ.push([pc[0], pc[1], 13.4]);
      const pw = new THREE.Mesh(new THREE.CircleGeometry(13.4, 40), wm); pw.rotation.x = -PI / 2; pw.position.set(pc[0], .55, pc[1]); grp.add(pw); P.push([BG.cyl, 0xc8bca0, K.M(pc[0], 2.2, pc[1], 1.2, 3.4, 1.2), 0]);
      box(P, 0xe8dcc0, 170, 330, 0, 18, 216, ZMAX); box(P, ZINC, 170, 330, 18, 22, 218, ZMAX); box(P, 0xe8dcc0, 236, 264, 0, 26, 212, ZMAX); P.push([BG.hem, ZINC, K.M(250, 26, 220, 9, 7, 6), 0]); for (let x = 174; x < 328; x += 6) { box(P, 0x2a3440, x, x + 2, 4, 9, 215.9, 216); box(P, 0x2a3440, x, x + 2, 11, 15, 215.9, 216) } cols.push([170, 330, 212, ZMAX]);
      for (let k = 0; k < 14; k++) { const a = k / 14 * TAU, x = pc[0] + Math.cos(a) * 17, z = pc[1] + Math.sin(a) * 17; box(P, 0x2a5a3a, x - .25, x + .25, 0, .5, z - .25, z + .25); box(P, 0x2a5a3a, x - .25, x + .25, .5, 1, z + (Math.sin(a) > 0 ? .2 : -.25), z + (Math.sin(a) > 0 ? .25 : -.2)) }
      for (let x = 170; x < 335; x += 14) for (const z of [156, 204]) { const h = 9; box(P, 0x6a5a48, x - .25, x + .25, 0, h * .5, z - .25, z + .25); P.push([BG.box, 0x3e6a2a, K.M(x, h * .78, z, 4.4, 4.6, 4.4), 0]); circ.push([x, z, .35]) } }
    /* street furniture: Guimard métro entrance, Morris columns, Wallace fountain, benches, bike station, street plaques */
    const guimard = (x, z, ry) => { const c = Math.cos(ry), s = Math.sin(ry), at = (u, v) => [x + u * c + v * s, z - u * s + v * c]; for (const u of [-1.6, 1.6]) { const [px, pz] = at(u, 0); P.push([BG.cyl, 0x2a4a3a, K.M(px, 2, pz, .1, 4, .1), 0]); Gl.push([BG.sph, 0xff8a3a, K.M(px, 4.1, pz, .22, .32, .22), 0]) } const [mx, mz] = at(0, .05); sign('metro', mx, 3.4, mz, 3.2, .6, ry, true);
      for (const v of [-1.4, 1.4]) { const p0 = at(-1.6, v), p1 = at(1.6, v); box(P, 0x2a4a3a, Math.min(p0[0], p1[0]) - .04, Math.max(p0[0], p1[0]) + .04, 0, 1, Math.min(p0[1], p1[1]) - .04, Math.max(p0[1], p1[1]) + .04) } const b0 = at(-1.7, -1.5), b1 = at(1.7, 1.5); cols.push([Math.min(b0[0], b1[0]), Math.max(b0[0], b1[0]), Math.min(b0[1], b1[1]), Math.max(b0[1], b1[1])]); box(P, 0x1a1a1a, Math.min(b0[0], b1[0]) + .2, Math.max(b0[0], b1[0]) - .2, -.02, .02, Math.min(b0[1], b1[1]) + .2, Math.max(b0[1], b1[1]) - .2) };
    guimard(30, 111.8, 0); guimard(0, -49.2, PI); PAR.metro = [[30, 109], [0, -47]];
    for (const [x, z] of [[-40, 112], [140, 112], [-60, 32.8 + 2.7]]) { P.push([BG.cyl, 0x2a4a3a, K.M(x, 1.8, z, .6, 3.6, .6), 0], [BG.cone, 0x2a4a3a, K.M(x, 4.1, z, .7, 1, .7), 0]); for (let k = 0; k < 4; k++) sign('morris', x + Math.sin(k * PI / 2) * .61, 2, z + Math.cos(k * PI / 2) * .61, .9, 1.35, k * PI / 2); circ.push([x, z, .65]) }
    { const [x, z] = [126, 100]; box(P, 0x2a4a3a, x - .5, x + .5, 0, .6, z - .5, z + .5); for (const [dx, dz] of [[-.25, -.25], [.25, -.25], [-.25, .25], [.25, .25]]) P.push([BG.cyl, 0x2a4a3a, K.M(x + dx, 1.4, z + dz, .07, 1.6, .07), 0]); P.push([BG.cone, 0x2a4a3a, K.M(x, 2.5, z, .45, .6, .45), 0]); circ.push([x, z, .6]) }   /* Wallace fountain */
    for (const [x, z] of [[-210, 34.4], [-120, 34.4], [20, 34.4], [240, 34.4]]) { box(P, 0x2a4a3a, x - 1, x + 1, .45, .5, z - .3, z + .3); box(P, 0x2a4a3a, x - 1, x + 1, .5, 1, z + .25, z + .3) }
    sign('plaque', -54.2, 4.6, 108.6, 1.6, .5, PI / 2); sign('plaque_seine', -6.2, 4.6, 108.6, 1.6, .5, -PI / 2);
    /* the Place: terraces (tables + chairs), lanterns, the painter's spot */
    const TERR = []; for (let i = 0; i < 12; i++) { const x = 100 + (i % 6) * 9 + 4, z = 72 + ((i / 6) | 0) * 4.5; box(P, 0x8a8a8a, x - .05, x + .05, 0, .75, z - .05, z + .05); P.push([BG.cyl, 0xd8d8d0, K.M(x, .76, z, .4, .04, .4), 0]); for (const s of [-1, 1]) { box(P, 0xb8202a, x + s * .75 - .2, x + s * .75 + .2, .44, .48, z - .2, z + .2); box(P, 0x6a4a2a, x + s * .95 - .03, x + s * .95 + .03, .48, .95, z - .2, z + .2) } TERR.push([x, z]); circ.push([x, z, .5]) }
    PAR.terr = TERR; for (const [x, z] of [[100, 100], [152, 100], [100, 80], [152, 80]]) lantern(x, z, 4.2);
    /* ---------- the Fête de la Musique (built here, shown by paris_life on festival nights) ---------- */
    const fest = new THREE.Group(); fest.visible = false; grp.add(fest); PAR.festG = fest; const FP = [], FL = [], FQ = [];
    const STAGE = [126, 90]; { const [x, z] = STAGE; FP.push([BG.box, 0x1a1a1e, K.M(x, .5, z, 10, 1, 6), 0]); for (const [dx, dz] of [[-5, -3], [5, -3], [-5, 3], [5, 3]]) FP.push([BG.box, 0x3a3a3e, K.M(x + dx, 3, z + dz, .15, 6, .15), 0]); FP.push([BG.box, 0x2a2a2e, K.M(x, 6, z, 10.4, .3, 6.4), 0]);
      for (const s of [-1, 1]) FP.push([BG.box, 0x101010, K.M(x + s * 5.8, 1.6, z + 2, 1.2, 2.2, 1, 0, 0, 0), 0]); FQ.push({ k: 'fete', x, y: 5.4, z: z + 3.25, w: 8, h: 1.25, ry: 0 }); for (let k = 0; k < 6; k++) FL.push([BG.box, [0xff4a6a, 0xffd84a, 0x4ad8ff][k % 3], K.M(x - 4 + k * 1.6, 5.7, z + 3, .4, .3, .2), 0]) }
    const bulbs = (x0, z0, x1, z1, y) => { const n = Math.max(4, Math.round(Math.hypot(x1 - x0, z1 - z0) / 1.6)); for (let k = 0; k <= n; k++) { const t = k / n; FL.push([BG.sph, [0xffe8a0, 0xff9a6a, 0xa8e0ff, 0xffb0d8][k % 4], K.M(x0 + (x1 - x0) * t, y - Math.sin(t * PI) * .7, z0 + (z1 - z0) * t, .14, .14, .14), 0]) } };
    for (let z = 140; z < 228; z += 6) bulbs(-6, z, 6, z + 3, 6.5); for (let x = 98; x < 154; x += 7) bulbs(x, 68, x + 3, 106, 7.2); for (let x = -66; x < -54; x += 3) bulbs(x, 50, x + 2, 108, 6.2);
    PAR.STAGE = STAGE;
    const festM = new THREE.Mesh(K.merge(FP), K.floraMat(0, { rough: .7 })); festM.material.userData.lin = 1; fest.add(festM);
    /* ---------- the walk-in businesses ---------- */
    const sh = SHOPS, ITF = (k, fn) => NW().interior(sh[k], cols, box, P, Gl, fn);
    const bx2 = (arr, hex, it, u0, u1, y0, y1, f0, f1) => { const b = it.bb(u0, u1, f0, f1); box(arr, hex, b[0], b[1], y0, y1, b[2], b[3]) };
    const IN = {};
    IN.librairie = ITF('librairie', it => { for (let k = 0; k < 3; k++) { const u = 2.6 + k * 2.4; bx2(P, 0x4a2e1c, it, u, u + .6, 0, 2.6, -1.2, 3.6); for (let j = 0; j < 12; j++) bx2(P, ['#8a2a2a', '#2a4a6a', '#e8dcc0', '#3a6a3a', '#c8a040'].map(c => parseInt(c.slice(1), 16))[j % 5], it, u - .02, u + .62, .3 + (j % 4) * .6, .7 + (j % 4) * .6, -1 + (j >> 2) * 1.5, -.6 + (j >> 2) * 1.5) } bx2(P, 0x4a2e1c, it, it.depth - .6, it.depth - .3, 0, 3.4, -3.8, 4); bx2(P, 0x6a4a2a, it, 1, 2, 0, 1, 2.6, 4); it.cust = it.F(1.5, 1.9); it.staff = it.F(1.5, 3.4) });
    IN.cafe = ITF('cafe', it => { bx2(P, 0x8a8e94, it, 4.4, 5.1, 0, 1.1, -.4, 5); bx2(P, 0x6a4a2a, it, 4.3, 5.2, 1.1, 1.16, -.5, 5.1); for (let k = 0; k < 8; k++) bx2(P, [0x2a6a3a, 0xe8c868, 0x6a1a1a][k % 3], it, 6, 6.2, 1.4, 2.2, -.4 + k * .65, -.1 + k * .65); for (const f of [-3.6, -1.6]) { bx2(P, 0xd8d8d0, it, 2.4, 3, .72, .76, f, f + .6); bx2(P, 0xb8202a, it, 3.1, 3.4, 0, .5, f, f + .6) } it.cust = it.F(3.7, 2.2); it.staff = it.F(5.7, 2.2) });
    IN.cave = ITF('cave', it => { bx2(P, 0x6a4a3a, it, .4, it.depth, 3.4, 3.8, -it.hw + .4, it.hw - .4); bx2(P, 0x1a1410, it, it.depth - 3.4, it.depth - .4, 0, .6, -3.6, 3.6); bx2(P, 0x101010, it, it.depth - 2.6, it.depth - 1.2, .6, 1.6, -3, -1.2); for (let k = 0; k < 4; k++) bx2(Gl, [0xff9a3a, 0xff6a4a][k % 2], it, it.depth - 2, it.depth - 1.8, 3, 3.2, -3 + k * 2, -2.7 + k * 2);
      bx2(P, 0x3a2414, it, 1.4, 2.1, 0, 1.1, 2.4, 4.6); for (const f of [-2.4, -.4, 1.6]) bx2(P, 0x2a1a12, it, 4.2, 4.8, .7, .74, f, f + .6); it.cust = it.F(2.6, 3.5); it.staff = it.F(.9, 3.5); it.stage = it.F(it.depth - 1.9, -.2); it.floor = it.F(5.4, 0); it.piano = it.F(it.depth - 1.9, -2.1) });
    IN.salon = ITF('salon', it => { for (const [u, f] of [[3, -2.4], [3, .6], [5.6, -2.4], [5.6, .6]]) { bx2(P, 0xd8d8d0, it, u, u + 1, .72, .76, f, f + 1); bx2(P, 0x8a6a4a, it, u + .45, u + .55, 0, .72, f + .45, f + .55); bx2(P, 0xc84a6a, it, u - .5, u - .1, 0, .5, f + .3, f + .7) } bx2(P, 0xf4ead8, it, 8, 9, 0, 1.1, -3, 4); bx2(Gl, 0xffe0c0, it, 7.95, 8, .3, 1, -2.8, 3.8); it.cust = it.F(7.3, 1.6); it.staff = it.F(9.4, 1.6) });
    IN.galerie = ITF('galerie', it => { for (let k = 0; k < 6; k++) { const f = -2.8 + k * 1.3; bx2(P, 0x8a6a3a, it, it.depth - .45, it.depth - .38, 1, 2.6, f, f + 1); bx2(Gl, [0x4a8ad8, 0xd84a6a, 0xf2c230, 0x3aa85a, 0x8a4ad8, 0xff8a3a][k], it, it.depth - .5, it.depth - .46, 1.1, 2.5, f + .08, f + .92) } bx2(P, 0xf4f4f0, it, 1.2, 2.2, 0, 1, 2.4, 3.6); it.cust = it.F(1.7, 1.6); it.staff = it.F(1.7, 4); it.art = it.F(it.depth - 2.2, 0) });
    IN.boulangerie = ITF('boulangerie', it => { bx2(P, 0xe8dcc0, it, 3.4, 4.2, 0, 1.1, -1, 3.4); bx2(Gl, 0xffe0b0, it, 3.38, 3.42, .3, 1, -.9, 3.3); for (let k = 0; k < 10; k++) bx2(P, 0xc8843a, it, it.depth - .9 + (k % 2) * .1, it.depth - .5, .5 + (k >> 1) * .5, .62 + (k >> 1) * .5, -2.5, 3); it.cust = it.F(2.6, 1.2); it.staff = it.F(5.2, 1.2) });
    PAR.interiors = IN;
    /* ---------- districts in their own modules (paris_montmartre.js) ---------- */
    const sgShops = Object.keys(sh).length; PAR.MM = null; if (PAR.montmartre) try { PAR.MM = PAR.montmartre(ctx, { box, sign, P, Gl, Gs, Q, sh, SPECIAL, ITF, bx2, IN, guimard }) } catch (e) { console.warn('paris montmartre', e); PAR.stats.mmErr = String(e && e.stack || e).slice(0, 400) }
    /* signs over the named shopfronts */
    for (const k in sh) { const s = sh[k], d = SIGNS.find(x => x[0] === k); sign(k, s.x + s.out[0] * .06, s.signY || 4.15, s.z + s.out[1] * .06, s.w - .6, (s.w - .6) * d[2] / d[1], s.yaw); if (!s.hollow && !s.noWin) sign(/fromagerie/.test(k) ? 'w_fromage' : /patisserie|creperie/.test(k) ? 'w_macaron' : /disques|swag/.test(k) ? 'w_mode' : /tabac|fleuriste|velape/.test(k) ? 'w_livres' : 'w_pain', s.x - s.out[0] * .05, 1.85, s.z - s.out[1] * .05, s.w - 2.4, 2.2, s.yaw) }
    if (sh.cafe) { const s = sh.cafe; sign('menu', s.x + s.out[0] * 1.4 + s.al[0] * 4, 1, s.z + s.out[1] * 1.4 + s.al[1] * 4, .7, .93, s.yaw) }
    PAR.shops = sh; PAR.stats.shopsPlaced = sgShops; PAR.stats.allShops = Object.keys(sh).length;
    /* ---------- merge ---------- */
    atlasTex(); const solidM = K.floraMat(0, { rough: .82 }); solidM.userData.lin = 1; const CELL = 64, REG = (x, z) => z < -300 ? 'mm' : 'sg', RO = { region: REG }; PAR.region = null; PAR.chunks = NW().chunked(P, CELL, a => K.merge(a), solidM, grp, 'par_static', { shadow: true, region: REG });
    if (Gs.length) { const gm = new THREE.MeshStandardMaterial({ color: 0xa8c8d8, roughness: .05, metalness: .3, transparent: true, opacity: .3, depthWrite: false }); gm.userData.lin = 1; PAR.chunks.push(...NW().chunked(Gs, 128, a => K.merge(a), gm, grp, 'par_glass', { order: 2, region: REG })) }
    const glowM = new THREE.MeshBasicMaterial({ vertexColors: true }); glowM.userData.lin = 1; PAR.chunks.push(...NW().chunked(Gl, 128, a => K.merge(a), glowM, grp, 'par_glow', RO)); PAR.glowM = glowM;
    const flM = new THREE.MeshBasicMaterial({ vertexColors: true }); flM.userData.lin = 1; fest.add(new THREE.Mesh(K.merge(FL), flM));
    const signM = new THREE.MeshStandardMaterial({ map: SG.tex, emissiveMap: SG.tex, emissive: 0xffffff, emissiveIntensity: .2, roughness: .6, alphaTest: .3 }); signM.userData.lin = 1; PAR.chunks.push(...NW().chunked(Q, 128, a => NW().quadGeo(a, SG.r), signM, grp, 'par_signs', RO)); PAR.signM = signM; fest.add(new THREE.Mesh(NW().quadGeo(FQ, SG.r), signM));
    PAR.stats.parts = P.length + Gl.length; PAR.stats.signs = Q.length; PAR.stats.atlasOver = (SG.over || []).length; PAR.stats.atlasBad = (SG.bad || []).length; PAR.stats.atlasUsed = SG.used;
    ctx.upd.push(() => { const h = (S.time / 60) % 24, n = h > 20 || h < 5.5 ? 1 : h > 18.5 ? (h - 18.5) / 1.5 : h < 7 ? (7 - h) / 1.5 : 0; signM.emissiveIntensity = .2 + .7 * n; glowM.color.setScalar(.35 + .65 * n); PAR.night = n; const r = AV.P.z < -300 ? 'mm' : 'sg'; if (r !== PAR.region) { PAR.region = r; for (const m of PAR.chunks) m.visible = m.userData.region === r; if (PAR.mm && PAR.mm.terrain) PAR.mm.terrain.visible = r === 'mm'; if (PAR.eiffel) PAR.eiffel.visible = r === 'sg' } });
    PAR.ctx = ctx;
    /* ---------- map ---------- */
    const PLc = (id, en, es, x, z, yaw) => ({ id, name: [en, es], x, z, yaw });
    const mapRoads = [[XMIN, 41, XMAX, 41, 10], [XMIN, -41, XMAX, -41, 10], [XMIN, 120, XMAX, 120, 12], [-60, -36, -60, 36, 20], [60, -36, 60, 36, 8], [-60, 46, -60, 114, 12], [0, 46, 0, 114, 12], [60, 46, 60, 114, 12], [0, 126, 0, 230, 12], [151, 126, 151, 150, 10], [175, 24, 175, 36, 10], [187, -36, 187, -24, 8], [305, 24, 305, 36, 8], [XMIN, -94, XMAX, -94, 12], [-60, -88, -60, -52, 10], [60, -88, 60, -52, 10], [187, -88, 187, -52, 10], [-291, -94, -291, 208, 10], [331, -94, 331, 212, 10], [-291, 80, 96, 80, 8], [-60, 126, -60, 204, 10], [-291, 204, 146, 204, 8]];
    const places = [PLc('pontneuf', 'Pont Neuf', 'Pont Neuf', -60, 0, 0), PLc('passerelle', 'Footbridge (Pont des Singes)', 'Pasarela (Pont des Singes)', 60, 0, 0), PLc('quai', 'Quai (bouquinistes)', 'Muelle (buquinistas)', -20, 33.5, PI / 2), PLc('cathedrale', 'Cathedral (Île)', 'Catedral (Île)', 178, 0, -PI / 2), PLc('isle', 'Île · Glacier', 'Île · Heladería', 172, 8, 0),
      PLc('place', 'Place Saint-Germain (terraces)', 'Plaza Saint-Germain (terrazas)', 126, 86, PI), PLc('eglise', 'Saint-Germain church', 'Iglesia de Saint-Germain', 110, 131, PI), PLc('boulevard', 'Boulevard Saint-Germain', 'Bulevar Saint-Germain', -100, 111, PI / 2), PLc('buci', 'Rue de Buci market', 'Mercado de la Rue de Buci', 0, 180, PI),
      PLc('luxembourg', 'Luxembourg garden', 'Jardín de Luxemburgo', 245, 175, PI), PLc('metro_sg', 'Métro Saint-Germain', 'Metro Saint-Germain', 30, 109, PI), PLc('metro_pn', 'Métro (north bank)', 'Metro (orilla norte)', 0, -47, 0), PLc('bateau', 'Bateaux-Singes pier', 'Embarcadero Bateaux-Singes', 120, 34, PI), PLc('stage', 'Fête de la Musique stage', 'Escenario de la Fête de la Musique', 126, 96, PI),
      PLc('dauphine', 'Rue Dauphine', 'Rue Dauphine', -60, 80, PI), PLc('rivoli', 'Rue de Rivoli (arcades)', 'Rue de Rivoli (soportales)', 0, -94, PI / 2), PLc('jacob', 'Rue Jacob', 'Rue Jacob', -180, 80, PI / 2), PLc('vaugirard', 'Rue de Vaugirard', 'Rue de Vaugirard', -120, 204, PI / 2), PLc('passage', 'Passage to the Place', 'Pasaje a la plaza', 145, 58, PI), PLc('ruedeseine', 'Rue de Seine', 'Rue de Seine', 0, 80, PI), PLc('bonaparte', 'Rue Bonaparte', 'Rue Bonaparte', 60, 80, PI)];
    const NAMES = { salon: 'Salon Rivoli (salon de thé)', rivsouv: 'Souvenirs de Paris', galerie: 'Galerie Jacob', caveavin: 'Le Bar à Vins Jacob', bistro: 'Bistrot Vaugirard', papeterie2: 'Papeterie du Luxembourg', chocolat: 'Chocolatier Dauphine', librairie: 'Librairie La Page Volante', disques: 'Groove Dealers Disques', cafe: 'Café des Singes', brasserie: 'Brasserie Le Zinc', cave: 'Le Caveau des Singes (jazz)', patisserie: 'Macarons Rose-Thé', swag: 'SWAG Paris', tabac: 'Tabac · Presse', boulangerie: 'Au Pain Doré (boulangerie)', fromagerie: 'Fromagerie Mère Lune', creperie: 'Crêperie Ty Ape', fleuriste: 'Les Fleurs de Buci', velape: "Vél'Ape (bikes)" };
    for (const k in NAMES) { const s = sh[k]; if (s) places.push(PLc(k, NAMES[k], NAMES[k], s.x + s.out[0] * 3, s.z + s.out[1] * 3, Math.atan2(s.out[0], s.out[1]) + PI)) }
    if (PAR.MM) { for (const r of PAR.MM.roads) mapRoads.push(r); for (const p of PAR.MM.places) places.push(PLc(p[0], p[1], p[2], p[3], p[4], p[5])) }
    PAR.names = NAMES;
    if (PAR.life) try { PAR.life(ctx, { T, st, sh, IN, box, TERR, STAGE, BOUQ, fest }) } catch (e) { console.warn('paris life', e); PAR.stats.lifeErr = String(e && e.stack || e).slice(0, 400) }
    return { name: 'Paris', surface: surf, fog: [90, 720], sky: { exp: .9, tint: [0x9aa8c0, 0xe8dcd0, .3, .3], dome: { s1: 0xf0dcd0, s2: 0x9ab4d8, swirl: .01, cloud: .7, glow: .35 } },
      arrivals: { default: { x: -40, z: 34.6, yaw: -PI * .62 }, pipe: { x: -36, z: 34.6, yaw: -PI * .62 }, metro: { x: 30, z: 109, yaw: PI } }, defaultArrival: 'default',
      mapRoads, places, mapNav: PAR.nav || null, routeGroup: (x, z) => z < -300 ? 'montmartre' : 'main', routeVia: (a, b) => a.z < -300 ? [-60, -454.4] : [34.2, 108.6],   /* 2.2: Montmartre is one line-12 ride from Saint-Germain (no walking route). routeVia = the métro entrance on the start's side */
      greet: { human: [['Bonjour ! Always say bonjour first — then ask.', '¡Bonjour! Di siempre bonjour primero y luego pregunta.'], ['The best view of the cathedral is from the Pont Neuf at sunset.', 'La mejor vista de la catedral es desde el Pont Neuf al atardecer.']] },
      chatLines: [['Jazz tonight at the Caveau. Down the stone stairs.', 'Jazz esta noche en el Caveau. Bajando las escaleras de piedra.'], ['Saturday is the Fête de la Musique — music on every corner.', 'El sábado es la Fête de la Musique: música en cada esquina.'], ['A croissant from Au Pain Doré and a café on the terrace. Voilà, Paris.', 'Un cruasán de Au Pain Doré y un café en la terraza. Voilà, París.']],
      musicProfile: { bpm: 100, root: 52, scale: [0, 2, 4, 5, 7, 9, 11], style: 'amb' } };
  }
});
PAR.SIGNS = SIGNS; PAR.SG = SG; PAR.haussmann = haussmann;
})(window.AV);
