/* APEVERSE 2.2 GLOBAL WORLDS - world_sevilla.js : SEVILLA, first connected district (agent 4).  1 m ≈ 0.6 real m, north is -z.
   The street network comes first (sevilla_plan.js + gw_kit.js); this file dresses it:
   - every street and plaza edge is lined with Sevillian houses: whitewash, albero-yellow and almagra-red walls with painted
     surrounds, zócalos, wrought-iron rejas and balconies, glazed cierros, geranium pots, flat azoteas and tiled roofs, miradores;
     Triana in its own brighter palette.  Ground-floor shops with authored Spanish signs (azulejo tile panels, painted lettering,
     gilded boards, a little neon), window displays, canvas awnings, azulejo street-name plaques at the corners.
   - landmarks (sevilla_landmarks.js): Cathedral + Giralda, Real Alcázar (walk in: Patio del León, Doncellas, gardens),
     Archivo de Indias, Ayuntamiento + arquillo, El Salvador, the Maestranza, Hospital de la Caridad, Torre del Oro, Triana bridge,
     San Telmo bridge, Mercado de Triana (walk-through hall), fountains and statues; the Real de la Feria (April Fair) structures.
   - orange trees on the streets and plazas, palms on the river and the big squares, fernandina wall lanterns, toldos (sun sails)
     over Sierpes and Tetuán, the Metrocentro tram rails, the green bike lanes.
   Buildings are solid because the walk mask says so (no colliders); walk-ins are carved out of their lots with a real door.
   Every business is fictional; landmarks and streets are public places.  AV.sevilla (debug + tests) */
'use strict';
(function (AV) {
const TAU = Math.PI * 2, tr = AV.tr, L = (e, s) => [e, s];
const SEV = AV.sevilla = { stats: {} };
const GW = AV.gwkit, PLAN = AV.sevillaPlan;
/* ======================= signs (all fictional businesses) ======================= */
const SG = { r: {} };
const fit = (...a) => GW.fit(...a), rr = (...a) => GW.rr(...a);
const goldBoard = (top, sub, bg, gold) => (g, w, h) => { g.fillStyle = bg || '#1a2a1e'; g.fillRect(0, 0, w, h); g.strokeStyle = gold || '#c8a040'; g.lineWidth = 6; g.strokeRect(9, 9, w - 18, h - 18); const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#fbe6a0'); gr.addColorStop(.55, '#c89a3a'); gr.addColorStop(1, '#8a6420'); g.fillStyle = gr; g.textAlign = 'center'; g.textBaseline = 'middle'; fit(g, top, w - 70, h * .5, 'italic 700 #px Georgia, serif', h * .43, w / 2); g.fillStyle = '#efe2bc'; fit(g, sub, w - 90, h * .16, '#px Georgia, serif', h * .79, w / 2) };
const painted = (top, sub, ink, bg, font) => (g, w, h) => { g.fillStyle = bg || '#f4efe4'; g.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { g.fillStyle = 'rgba(120,100,70,' + Math.random() * .06 + ')'; g.fillRect(Math.random() * w, Math.random() * h, 3, 2) } g.fillStyle = 'rgba(0,0,0,.18)'; g.textAlign = 'center'; g.textBaseline = 'middle'; fit(g, top, w - 40, h * .56, font || '700 #px Georgia, serif', h * .44 + 3, w / 2 + 3); g.fillStyle = ink || '#7a2418'; fit(g, top, w - 40, h * .56, font || '700 #px Georgia, serif', h * .44, w / 2); if (sub) { g.fillStyle = ink || '#7a2418'; fit(g, sub, w - 60, h * .17, 'italic #px Georgia, serif', h * .82, w / 2) } };
const plain = (top, sub, bg, fg, ac, font) => (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = ac; g.fillRect(0, h - 9, w, 9); g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; fit(g, top, w - 50, h * .5, font || '800 #px Arial, sans-serif', h * .42, w / 2); g.fillStyle = ac; fit(g, sub, w - 60, h * .17, '600 #px Arial, sans-serif', h * .8, w / 2) };
const neon = (top, sub, c1, c2) => (g, w, h) => { g.fillStyle = '#120c10'; g.fillRect(0, 0, w, h); g.shadowColor = c1; g.shadowBlur = 16; g.fillStyle = c1; g.textAlign = 'center'; g.textBaseline = 'middle'; fit(g, top, w - 80, h * .5, 'italic 700 #px "Brush Script MT", "Segoe Script", Georgia, cursive', h * .42, w / 2); g.shadowColor = c2; g.fillStyle = c2; fit(g, sub, w - 80, h * .16, '700 #px Arial, sans-serif', h * .8, w / 2); g.shadowBlur = 0 };
const AZ = (t, sub, o) => GW.azulejo(t, Object.assign({ sub }, o || {}));
const SIGNS = [
  ['casafermin', 768, 160, goldBoard('Bodega Casa Fermín', 'vinos de la tierra · tapas · desde 1897', '#163222')],
  ['solea', 768, 160, (g, w, h) => { g.fillStyle = '#0e0a0a'; g.fillRect(0, 0, w, h); g.fillStyle = '#b01a1a'; g.fillRect(0, h - 16, w, 16); g.fillStyle = '#e8c070';   /* a dancer: the bata de cola sweep */
    g.save(); g.translate(78, h / 2 + 6); g.beginPath(); g.arc(0, -46, 9, 0, 7); g.fill(); g.beginPath(); g.moveTo(-3, -36); g.lineTo(-26, -66); g.lineTo(-20, -68); g.lineTo(2, -40); g.lineTo(24, -60); g.lineTo(28, -56); g.lineTo(6, -32); g.lineTo(10, 0); g.quadraticCurveTo(40, 30, 58, 44); g.lineTo(-34, 44); g.quadraticCurveTo(-18, 24, -8, 0); g.closePath(); g.fill(); g.restore();
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#f4e6c8'; fit(g, 'Tablao La Soleá', w - 200, 70, 'italic 700 #px Georgia, serif', 66, w / 2 + 60); g.fillStyle = '#e8c070'; fit(g, 'FLAMENCO EN VIVO · cada noche 21:00', w - 220, 24, '700 #px Arial, sans-serif', 122, w / 2 + 60) }],
  ['ceramica', 768, 192, AZ('Cerámica La Cava', 'azulejos de Triana · fábrica desde 1905', { rows: 4, border: '#1f4a9a', accent: '#e8a820', ink: '#1a3a8a', padL: 140, motif: (g, w, h, T) => { const cx = T * 2.4, cy = h / 2; g.fillStyle = '#e8a820'; g.beginPath(); g.arc(cx, cy, h * .3, 0, 7); g.fill(); g.fillStyle = '#1f4a9a'; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; g.beginPath(); g.ellipse(cx + Math.cos(a) * h * .17, cy + Math.sin(a) * h * .17, h * .07, h * .035, a, 0, 7); g.fill() } g.fillStyle = '#2a8a4a'; g.beginPath(); g.arc(cx, cy, h * .07, 0, 7); g.fill() } })],
  ['volantes', 768, 160, (g, w, h) => { g.fillStyle = '#c8143a'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,.9)'; for (let y = 14; y < h; y += 30) for (let x = (y / 30 % 2) * 15 + 10; x < w; x += 30) { g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill() }
    g.fillStyle = '#1a0a0e'; rr(g, 60, 26, w - 120, h - 52, 18); g.fill(); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffd0dc'; fit(g, 'Volantes de Triana', w - 170, 64, 'italic 700 #px "Brush Script MT", "Segoe Script", Georgia, cursive', 70, w / 2); g.fillStyle = '#f4c040'; fit(g, 'MODA FLAMENCA · MANTONES · COMPLEMENTOS', w - 190, 20, '700 #px Arial, sans-serif', 118, w / 2) }],
  ['guitarreria', 768, 160, (g, w, h) => { g.fillStyle = '#5a3418'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 6) { g.fillStyle = 'rgba(0,0,0,' + (.05 + Math.random() * .08) + ')'; g.fillRect(0, y, w, 3) }
    g.fillStyle = '#e8c890'; g.save(); g.translate(70, h / 2); g.beginPath(); g.ellipse(0, 22, 26, 30, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(0, -16, 20, 22, 0, 0, 7); g.fill(); g.fillRect(-4, -78, 8, 50); g.fillStyle = '#2a1408'; g.beginPath(); g.arc(0, 8, 9, 0, 7); g.fill(); g.restore();
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#f4e2b8'; fit(g, 'Guitarrería Hermanos Vidal', w - 190, 56, '700 #px Georgia, serif', 62, w / 2 + 50); g.fillStyle = '#e8b860'; fit(g, 'guitarras flamencas · taller artesano · cuerdas', w - 210, 24, 'italic #px Georgia, serif', 118, w / 2 + 50) }],
  ['convento', 640, 192, AZ('Convento de Santa Brígida', 'dulces de las hermanas · se vende por el torno', { rows: 4, border: '#6a3a1a', accent: '#e8c040', ink: '#5a2a10', bg: '#f8f0dc' })],
  ['freiduria', 768, 160, plain('FREIDURÍA ER GUADALQUIVÍ', 'pescaíto frito · cazón en adobo · boquerones', '#f2c230', '#1a3a7a', '#1a3a7a', '900 #px Georgia, serif')],
  ['orilla', 768, 160, painted('Bar La Orilla', 'terraza al río · montaditos · rebujito', '#1f4a7a', '#f6f2e6', 'italic 700 #px Georgia, serif')],
  ['abanicos', 768, 160, goldBoard('Abanicos y Mantones Lola', 'casa fundada en 1921 · pintados a mano', '#0e0e12')],
  ['abaceria', 768, 160, painted('Abacería El Postigo', 'ultramarinos · chacinas · vinos · tapas', '#2a4a2a', '#efe6cc')],
  ['heladeria', 640, 160, plain('HELADERÍA LA ABUELA', 'helados artesanos · horchata · granizados', '#f4e8f0', '#b0306a', '#4aa8a8', '800 #px Georgia, serif')],
  ['sombreros', 640, 160, goldBoard('Sombrerería Maera', 'sombreros cordobeses · gorras · flores de feria', '#2a1410')],
  ['taberna', 768, 160, AZ('Taberna Er Salvador', 'vino de naranja · aceitunas · chicharrones', { rows: 4, border: '#2a6a3a', accent: '#e8a820', ink: '#1a4a2a' })],
  ['mercado', 1024, 128, (g, w, h) => { g.fillStyle = '#7a2a18'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e8c890'; g.lineWidth = 4; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = '#f4e2b8'; g.textAlign = 'center'; g.textBaseline = 'middle'; fit(g, 'MERCADO DE TRIANA', w - 120, 78, '700 #px Georgia, serif', h / 2, w / 2) }],
  ['metro', 256, 384, (g, w, h) => { g.fillStyle = '#f4f4f4'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8202a'; g.fillRect(0, 0, w, 110); g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '900 44px Arial'; g.fillText('METRO', w / 2, 40); g.font = '700 34px Arial'; g.fillText('CENTRO', w / 2, 82); g.fillStyle = '#1a1a1a'; g.font = 'bold 28px Arial'; g.fillText('Plaza Nueva', w / 2, 160); g.fillText('Archivo', w / 2, 205); g.fillText('Pta. de Jerez', w / 2, 250); g.font = '22px Arial'; g.fillText('cada 6 min', w / 2, 320) }],
  ['leon', 512, 512, (g, w, h) => { GW.azulejo('', { rows: 8, border: '#1a4a8a', accent: '#e8a820' })(g, w, h); g.fillStyle = '#e8a820'; g.beginPath(); g.ellipse(w / 2, h / 2 + 30, 120, 70, 0, 0, 7); g.fill(); g.beginPath(); g.arc(w / 2 + 90, h / 2 - 50, 60, 0, 7); g.fill(); g.fillStyle = '#c87a18'; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; g.beginPath(); g.arc(w / 2 + 90 + Math.cos(a) * 62, h / 2 - 50 + Math.sin(a) * 62, 18, 0, 7); g.fill() } g.fillStyle = '#e8a820'; g.beginPath(); g.arc(w / 2 + 90, h / 2 - 50, 46, 0, 7); g.fill(); for (const x of [-80, -20, 40, 100]) g.fillRect(w / 2 + x, h / 2 + 70, 22, 80); g.fillStyle = '#1a3a7a'; g.textAlign = 'center'; g.font = 'italic 700 30px Georgia'; g.fillText('Puerta del León', w / 2, h - 52) }],
  ['caridad', 384, 384, (g, w, h) => { GW.azulejo('', { rows: 8, border: '#1a4a8a', accent: '#e8a820' })(g, w, h); g.fillStyle = '#1a4a8a'; g.beginPath(); g.moveTo(w / 2, 70); g.lineTo(w / 2 + 70, 250); g.lineTo(w / 2 - 70, 250); g.closePath(); g.fill(); g.fillStyle = '#e8a820'; g.beginPath(); g.arc(w / 2, 96, 28, 0, 7); g.fill(); g.fillStyle = '#1a3a7a'; g.font = 'italic 700 34px Georgia'; g.textAlign = 'center'; g.fillText('Caritas', w / 2, h - 70) }],
  ['feria', 1024, 160, (g, w, h) => { g.fillStyle = '#f4f0e6'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8143a'; for (let x = 0; x < w; x += 40) { g.beginPath(); g.arc(x + 20, 14, 9, 0, 7); g.fill(); g.beginPath(); g.arc(x + 20, h - 14, 9, 0, 7); g.fill() } g.fillStyle = '#2a7a3a'; g.textAlign = 'center'; g.textBaseline = 'middle'; fit(g, 'FERIA DE ABRIL', w - 120, 80, '900 #px Georgia, serif', h / 2 - 4, w / 2) }],
  ['portada', 768, 672, (g, w, h) => { g.clearRect(0, 0, w, h); g.save(); g.scale(w / 1024, h / 896); w = 1024; h = 896;   /* the fairground's lit gateway: a facade of light bulbs, transparent arches */
    const facade = new Path2D(); facade.moveTo(40, h); facade.lineTo(40, 300); facade.lineTo(170, 300); facade.lineTo(170, 180); facade.lineTo(330, 180); facade.lineTo(330, 90); facade.quadraticCurveTo(w / 2, -10, w - 330, 90); facade.lineTo(w - 330, 180); facade.lineTo(w - 170, 180); facade.lineTo(w - 170, 300); facade.lineTo(w - 40, 300); facade.lineTo(w - 40, h); facade.closePath();
    const arch = (cx, bw, top) => { const p = new Path2D(); p.moveTo(cx - bw, h); p.lineTo(cx - bw, top + bw); p.arc(cx, top + bw, bw, Math.PI, 0); p.lineTo(cx + bw, h); p.closePath(); return p };
    g.fillStyle = '#f4ead0'; g.fill(facade); g.globalCompositeOperation = 'destination-out'; for (const [cx, bw, t] of [[w / 2, 120, 420], [230, 60, 560], [w - 230, 60, 560]]) g.fill(arch(cx, bw, t)); g.globalCompositeOperation = 'source-atop';
    for (let y = 30; y < h; y += 22) for (let x = 40; x < w - 30; x += 22) { const k = ((x / 22) + (y / 22)) % 7; g.fillStyle = k < 1 ? '#ff6a4a' : k < 2 ? '#7ad8ff' : k < 3 ? '#ffe680' : '#fff6d8'; g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill() }
    g.fillStyle = 'rgba(200,40,60,.5)'; for (let i = 0; i < 6; i++) g.fillRect(40, 300 + i * 90, w - 80, 8); g.globalCompositeOperation = 'source-over'; g.restore() }],
  ['cartel', 256, 384, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f4c84a'); gr.addColorStop(1, '#e86a2a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#c8143a'; g.beginPath(); g.moveTo(w / 2, 70); g.quadraticCurveTo(w / 2 + 70, 170, w / 2 + 90, 290); g.lineTo(w / 2 - 90, 290); g.quadraticCurveTo(w / 2 - 50, 170, w / 2, 70); g.fill(); g.fillStyle = '#fff'; for (let i = 0; i < 26; i++) { g.beginPath(); g.arc(w / 2 - 70 + Math.random() * 140, 120 + Math.random() * 160, 5, 0, 7); g.fill() } g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(w / 2, 56, 22, 0, 7); g.fill(); g.textAlign = 'center'; g.fillStyle = '#1a2a6a'; g.font = '900 34px Georgia'; g.fillText('FERIA', w / 2, 330); g.font = 'italic 700 22px Georgia'; g.fillText('de Abril · Sevilla', w / 2, 360) }],
  /* window displays */
  ['w_ceramic', 256, 160, (g, w, h) => { g.fillStyle = '#f4ecd8'; g.fillRect(0, 0, w, h); for (let i = 0; i < 6; i++) { const x = 24 + i * 42, y = 50 + (i % 2) * 60; g.fillStyle = ['#1f4a9a', '#e8a820', '#2a8a4a'][i % 3]; g.beginPath(); g.arc(x, y, 19, 0, 7); g.fill(); g.fillStyle = '#f8f4ea'; g.beginPath(); g.arc(x, y, 11, 0, 7); g.fill(); g.fillStyle = ['#e8a820', '#1f4a9a', '#c8143a'][i % 3]; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill() } }],
  ['w_dress', 256, 160, (g, w, h) => { g.fillStyle = '#2a1a1e'; g.fillRect(0, 0, w, h); for (let i = 0; i < 3; i++) { const x = 44 + i * 84; g.fillStyle = ['#c8143a', '#f2d23a', '#2a8ad8'][i]; g.beginPath(); g.moveTo(x, 20); g.lineTo(x + 16, 70); g.quadraticCurveTo(x + 40, 130, x + 34, 156); g.lineTo(x - 34, 156); g.quadraticCurveTo(x - 40, 130, x - 16, 70); g.closePath(); g.fill(); g.fillStyle = '#fff'; for (let k = 0; k < 14; k++) { g.beginPath(); g.arc(x - 22 + Math.random() * 44, 60 + Math.random() * 90, 3, 0, 7); g.fill() } } }],
  ['w_fans', 256, 160, (g, w, h) => { g.fillStyle = '#1a1214'; g.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++) { const x = 34 + i * 62, y = 110; g.fillStyle = ['#c8143a', '#e8d0a0', '#2a4a8a', '#f2f0ea'][i]; g.beginPath(); g.moveTo(x, y); g.arc(x, y, 46, Math.PI * 1.1, Math.PI * 1.9); g.closePath(); g.fill(); g.strokeStyle = '#d8b060'; g.lineWidth = 2; g.stroke() } }],
  ['w_tapas', 256, 160, (g, w, h) => { g.fillStyle = '#3a2414'; g.fillRect(0, 0, w, h); for (let i = 0; i < 5; i++) { g.fillStyle = '#7a2a1a'; g.beginPath(); g.ellipse(26 + i * 50, 46, 14, 34, 0, 0, 7); g.fill(); g.fillStyle = '#e8d0b0'; g.fillRect(24 + i * 50, 8, 4, 10) } for (let i = 0; i < 6; i++) { g.fillStyle = '#e8e0d0'; g.beginPath(); g.ellipse(22 + i * 42, 128, 18, 8, 0, 0, 7); g.fill(); g.fillStyle = ['#d8a040', '#c83a2a', '#6a8a3a'][i % 3]; g.beginPath(); g.ellipse(22 + i * 42, 124, 11, 5, 0, 0, 7); g.fill() } }],
  ['w_books', 256, 160, (g, w, h) => { g.fillStyle = '#3a2a1e'; g.fillRect(0, 0, w, h); for (let r = 0; r < 3; r++) for (let x = 6; x < w - 6;) { const bw = 6 + Math.random() * 10; g.fillStyle = ['#8a2a2a', '#2a4a6a', '#e8dcc0', '#3a6a3a', '#c8a040', '#5a3a6a'][(Math.random() * 6) | 0]; g.fillRect(x, 10 + r * 50, bw, 40 - Math.random() * 8); x += bw + 1 } }],
  ['w_goods', 256, 160, (g, w, h) => { g.fillStyle = '#ece6da'; g.fillRect(0, 0, w, h); g.fillStyle = '#9a8a7a'; g.fillRect(0, 74, w, 4); g.fillRect(0, 140, w, 4); for (let i = 0; i < 9; i++) { g.fillStyle = ['#c8143a', '#2a6ad8', '#3aa85a', '#f2c230', '#8a4ad8', '#1a1a1a'][(i * 5) % 6]; g.fillRect(10 + i * 27, 36 + (i % 3) * 6, 18, 38 - (i % 3) * 6); g.fillRect(14 + i * 27, 104, 16, 36) } }],
  ['w_sweets', 256, 160, (g, w, h) => { g.fillStyle = '#f6ead4'; g.fillRect(0, 0, w, h); for (let r = 0; r < 2; r++) for (let i = 0; i < 7; i++) { g.fillStyle = ['#e8b040', '#c87a2a', '#f4e0a0', '#8a4a2a'][(i + r) % 4]; g.beginPath(); g.arc(22 + i * 35, 50 + r * 62, 13, 0, 7); g.fill() } }],
  ['w_guitar', 256, 160, (g, w, h) => { g.fillStyle = '#2a1a10'; g.fillRect(0, 0, w, h); for (let i = 0; i < 3; i++) { const x = 46 + i * 80; g.fillStyle = ['#e8c890', '#c8904a', '#a8682a'][i]; g.beginPath(); g.ellipse(x, 118, 26, 30, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(x, 78, 20, 22, 0, 0, 7); g.fill(); g.fillRect(x - 3, 8, 6, 60); g.fillStyle = '#1a0a04'; g.beginPath(); g.arc(x, 104, 8, 0, 7); g.fill() } }],
  /* generic ground-floor shops (not every door is a business you can use) */
  ['g_farmacia', 512, 112, (g, w, h) => { g.fillStyle = '#f4f4f0'; g.fillRect(0, 0, w, h); g.fillStyle = '#18a84a'; g.shadowColor = '#3aff7a'; g.shadowBlur = 10; const c = 56, s = 18; g.fillRect(c - s / 2, h / 2 - 40, s, 80); g.fillRect(c - 40, h / 2 - s / 2, 80, s); g.shadowBlur = 0; g.fillStyle = '#1a6a3a'; g.textAlign = 'center'; g.textBaseline = 'middle'; fit(g, 'FARMACIA', w - 150, 54, '800 #px Georgia, serif', h / 2, w / 2 + 50) }],
  ['g_estanco', 512, 112, (g, w, h) => { g.fillStyle = '#5a2a14'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2c230'; g.fillRect(14, 14, 84, 84); g.fillStyle = '#5a2a14'; g.font = '900 72px Georgia'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('T', 56, 60); g.fillStyle = '#f2c230'; fit(g, 'ESTANCO · Nº 42', w - 150, 40, '800 #px Arial, sans-serif', h / 2 - 12, w / 2 + 50); g.font = '600 20px Arial'; g.fillText('tabacos · sellos · lotería', w / 2 + 50, h - 22) }],
  ['g_merceria', 512, 112, painted('Mercería La Aguja', 'botones · encajes · hilos', '#7a2418')],
  ['g_libreria', 512, 112, goldBoard('Librería Hispalense', 'libros nuevos y de viejo', '#1a2238')],
  ['g_confiteria', 512, 112, AZ('Confitería Ochoa', 'tortas de aceite · yemas · pestiños', { rows: 3, border: '#6a3a1a', accent: '#e8c040', ink: '#5a2a10' })],
  ['g_zapateria', 512, 112, plain('ZAPATERÍA RUBIO', 'calzado · bolsos · hecho en España', '#1a1a1a', '#f2f0ea', '#c8a040', '700 #px Georgia, serif')],
  ['g_joyeria', 512, 112, goldBoard('Joyería Nervión', 'relojes · plata · medallas', '#101018')],
  ['g_peluqueria', 512, 112, plain('PELUQUERÍA', 'caballeros · señoras', '#f4f4f4', '#1a1a1a', '#c8143a', '800 #px Arial, sans-serif')],
  ['g_ferreteria', 512, 112, plain('FERRETERÍA LA LLAVE', 'herramientas · menaje · cerrajería', '#2a3a5a', '#f2d23a', '#f2d23a', '800 #px Arial, sans-serif')],
  ['g_bar1', 512, 112, AZ('Bar Los Arcos', 'cañas · montaditos · café', { rows: 3, border: '#1f4a9a', accent: '#e8a820', ink: '#1a3a8a' })],
  ['g_bar2', 512, 112, painted('Bodeguita Antonio', 'manzanilla · chicharrones', '#2a1a10')],
  ['g_bar3', 512, 112, neon('Bar El Duende', 'copas · música', '#ff5a8a', '#7ad8ff')],
  ['g_recuerdos', 512, 112, plain('RECUERDOS DE SEVILLA', 'abanicos · imanes · camisetas', '#f2c230', '#c8143a', '#c8143a', '900 #px Georgia, serif')],
  ['g_panaderia', 512, 112, painted('Panadería Santa Ana', 'pan de leña · molletes', '#6a3a14')],
  ['g_ultramarinos', 512, 112, goldBoard('Ultramarinos Paco', 'aceite · conservas · vinos', '#2a1a10')],
  ['g_cereria', 512, 112, painted('Cerería del Salvador', 'cirios · velas · cera artesana', '#5a1a2a', '#f2ead4')],
  ['g_bordados', 512, 112, goldBoard('Bordados en Oro', 'mantos · estandartes · encargos', '#3a0a14')],
  ['g_ceramica2', 512, 112, AZ('Taller de Cerámica', 'platos · azulejos · encargos', { rows: 3, border: '#2a6a3a', accent: '#e8a820', ink: '#1a4a2a' })],
  ['g_antiguedades', 512, 112, goldBoard('Antigüedades El Arco', 'muebles · azulejos antiguos', '#2a1a12')],
  ['g_papeleria', 512, 112, plain('PAPELERÍA', 'prensa · revistas · regalos', '#e8f0f8', '#1a3a7a', '#1a3a7a', '800 #px Arial, sans-serif')],
  ['g_moda', 512, 112, plain('MODA GITANA', 'trajes · batas · flores', '#1a0a10', '#ff9ac8', '#ff9ac8', 'italic 800 #px Georgia, serif')],
  ['g_cafe', 512, 112, goldBoard('Café Central', 'desayunos · tostadas · zumo de naranja', '#1a2a3a')],
  /* toldo / sign colours for small items */
  ['dot', 64, 64, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h) }]
];
/* street-name plaques: an azulejo tile panel per street (and plazas) */
for (const s of PLAN.streets) SIGNS.push(['n_' + s[0], 192, 72, AZ(s[4][1], null, { rows: 3, border: '#1f4a9a', accent: '#e8a820', ink: '#1a3a8a', font: '700 #px Georgia, serif' })]);
for (const p of PLAN.plazas) SIGNS.push(['n_' + p[0], 192, 72, AZ(p[2][1], null, { rows: 3, border: '#1f4a9a', accent: '#e8a820', ink: '#1a3a8a', font: '700 #px Georgia, serif' })]);
/* caseta signs (Feria) */
const CASETAS = SEV.CASETAS = ['Los Ápicos', 'Er Mono Feliz', 'La Pará', 'Peña El Albero', 'Los Rebujitos', 'Amigos de Triana', 'El Farolillo', 'La Sevillana', 'Los Cabales', 'Er Compás'];
CASETAS.forEach((n, i) => SIGNS.push(['cs' + i, 384, 96, (g, w, h) => { g.fillStyle = ['#2a7a3a', '#c8143a', '#1f4a9a', '#e8a820'][i % 4]; g.fillRect(0, 0, w, h); g.fillStyle = '#f8f4ea'; rr(g, 8, 8, w - 16, h - 16, 10); g.fill(); g.fillStyle = ['#2a7a3a', '#c8143a', '#1f4a9a', '#a86a10'][i % 4]; g.textAlign = 'center'; g.textBaseline = 'middle'; fit(g, n, w - 40, 46, 'italic 700 #px Georgia, serif', h / 2, w / 2) }]));
const GEN = SIGNS.filter(s => /^g_/.test(s[0])).map(s => s[0]);
const WIN = { g_farmacia: 'w_goods', g_estanco: 'w_goods', g_merceria: 'w_goods', g_libreria: 'w_books', g_confiteria: 'w_sweets', g_zapateria: 'w_goods', g_joyeria: 'w_goods', g_peluqueria: 'w_goods', g_ferreteria: 'w_goods', g_bar1: 'w_tapas', g_bar2: 'w_tapas', g_bar3: 'w_tapas', g_recuerdos: 'w_fans', g_panaderia: 'w_sweets', g_ultramarinos: 'w_tapas', g_cereria: 'w_goods', g_bordados: 'w_dress', g_ceramica2: 'w_ceramic', g_antiguedades: 'w_ceramic', g_papeleria: 'w_books', g_moda: 'w_dress', g_cafe: 'w_sweets' };
SEV.SIGNS = SIGNS; SEV.SG = SG;
/* ======================= palettes ======================= */
const STY = {
  centro: { walls: [0xf4f0e6, 0xf4f0e6, 0xf2ece0, 0xf4f0e6, 0xe8b84a, 0xe0b048, 0xb0482e, 0xf0e0c0, 0xe8c4b0], trim: [0xe0a830, 0xa8402a, 0xb8b0a0, 0xd8a038], base: [0xe0a830, 0xa8402a, 0x8a8478, 0xc8a050], shutter: [0x2a5a3a, 0x4a2e1e, 0x1e4030, 0x6a2a1a], door: [0x5a3420, 0x3a2414, 0x2a4a3a, 0x4a1e14], iron: 0x18181a, roof: 'mix', tile: 0xa8542e, floors: [2, 4], fh: 3.3, balcony: .5, cierro: .12, reja: true, pots: .55, mirador: .08 },
  triana: { walls: [0xf4f0e6, 0xf2e2b0, 0xa8c8e0, 0xe8c0b0, 0xf0d070, 0xb8d8b8, 0xf4f0e6, 0xe8a888, 0xd8a8c8], trim: [0xf8f6f0, 0xe0a830, 0x1f4a9a, 0xa8402a], base: [0x1f4a9a, 0xe0a830, 0xa8402a, 0x2a6a4a], shutter: [0x2a5a3a, 0x1f4a7a, 0x4a2e1e], door: [0x2a4a6a, 0x5a3420, 0x2a4a3a], iron: 0x18181a, roof: 'mix', tile: 0xb05a30, floors: [2, 3], fh: 3.2, balcony: .55, cierro: .08, reja: true, pots: .7, mirador: .04 },
  santacruz: { walls: [0xf8f6ee, 0xf8f6ee, 0xf4f0e6, 0xf2e8c8, 0xe8b84a, 0xf8f6ee], trim: [0xe0a830, 0xa8402a, 0xe0a830], base: [0xe0a830, 0xa8402a], shutter: [0x2a5a3a, 0x1e4030], door: [0x3a2414, 0x2a4a3a], iron: 0x18181a, roof: 'flat', tile: 0xa8542e, floors: [2, 3], fh: 3.2, balcony: .45, cierro: .05, reja: true, pots: .85, mirador: .03 }
};
const district = (x, z) => x < -185 ? 'triana' : (x > 92 && z > -140 && z < 190) ? 'santacruz' : 'centro';
SEV.district = district;
/* ======================= ground textures ======================= */
function canvasTex(size, fn, rep) { const c = document.createElement('canvas'); c.width = c.height = size; fn(c.getContext('2d'), size); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t }
const setts = () => canvasTex(256, (g, s) => { g.fillStyle = '#6e665c'; g.fillRect(0, 0, s, s); for (let y = 0; y < s; y += 16) for (let x = -16; x < s; x += 22) { const ox = (y / 16) % 2 ? 11 : 0, v = 120 + Math.random() * 46; g.fillStyle = 'rgb(' + (v + 8 | 0) + ',' + (v | 0) + ',' + (v - 12 | 0) + ')'; rr(g, x + ox + 1, y + 1, 20, 14, 3); g.fill() } }, 1 / 3.5);
const slabs = () => canvasTex(256, (g, s) => { g.fillStyle = '#b8ab94'; g.fillRect(0, 0, s, s); for (let y = 0; y < s; y += 64) for (let x = 0; x < s; x += 64) { const v = 205 + Math.random() * 28; g.fillStyle = 'rgb(' + (v | 0) + ',' + (v - 10 | 0) + ',' + (v - 28 | 0) + ')'; g.fillRect(x + 2, y + 2, 60, 60); for (let k = 0; k < 30; k++) { g.fillStyle = 'rgba(90,70,50,' + Math.random() * .08 + ')'; g.fillRect(x + Math.random() * 60, y + Math.random() * 60, 2, 2) } } g.fillStyle = 'rgba(160,60,40,.5)'; g.fillRect(0, 126, s, 4); g.fillRect(126, 0, 4, s) }, 1 / 6);
const albero = () => canvasTex(256, (g, s) => { g.fillStyle = '#d8a850'; g.fillRect(0, 0, s, s); for (let i = 0; i < 4000; i++) { const v = Math.random(); g.fillStyle = v < .5 ? 'rgba(170,110,40,.25)' : 'rgba(250,220,150,.25)'; g.fillRect(Math.random() * s, Math.random() * s, 2, 2) } }, 1 / 5);
/* ======================= the world ======================= */
AV.registerWorld({
  id: 'sevilla',
  build(ctx) {
    const K = AV.kit, CY = AV.city, BG = K.BG, q = ctx.q, grp = ctx.group, S = AV.S, rng = GW.rng((ctx.seed || 1) * 31 + 7);
    const t0 = performance.now();
    const N = SEV.N = PLAN.net();
    const lots = N.lots(GW.rng(7), { wmin: 6, wmax: 11, dmax: 13 });   /* fixed seed: the city is the same for everyone */
    const P = [], Gl = [], Gs = [], Q = [], FP = [], FQ = [], FG = [];   /* solid, glow, glass, sign quads; festival solid/sign/glow */
    const box = (arr, hex, x0, x1, y0, y1, z0, z1, gl) => arr.push([BG.box, hex, K.M((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0)), gl || 0]);
    const obox = (arr, hex, ax, az, bx, bz, w, y0, y1, gl) => { const L2 = Math.hypot(bx - ax, bz - az); arr.push([BG.box, hex, K.M((ax + bx) / 2, (y0 + y1) / 2, (az + bz) / 2, L2, y1 - y0, w, 0, Math.atan2(-(bz - az), bx - ax), 0), gl || 0]) };   /* a box along a segment */
    const sign = (k, x, y, z, w, h, ry, arr) => (arr || Q).push({ k, x, y, z, w, h, ry });
    const T = (x, z, r, label, fn, show, kind) => { const t = { x, z, r, label, fn, show, kind }; ctx.T.push(t); return t };
    const st = () => { S.sev = S.sev || { met: {}, q: {}, tram: 0, coche: 0, barco: 0 }; return S.sev };
    SEV.ctx = ctx; SEV.T = T; SEV.st = st; SEV.box = box;
    /* ---------- special businesses: the nearest suitable lot to an anchor on a given street ---------- */
    const SPECIAL = [ // key, street, anchor, hollow depth (walk-in), min width
      ['casafermin', 'mateos_gago', [150, -121], 8, 7], ['solea', 'ximenez', [150, 8], 8.5, 7.5], ['ceramica', 'alfareria', [-317, -30], 8, 7], ['volantes', 'sierpes', [-2, -236], 8, 7],
      ['guitarreria', 'pureza', [-268, 10], 0, 5.5], ['convento', 'boteros', [148, -252], 0, 6.5], ['freiduria', 'betis', [-240, 60], 0, 6], ['orilla', 'betis', [-240, 150], 0, 6],
      ['abanicos', 'tetuan', [-65, -212], 0, 6], ['abaceria', 'garcia_vinuesa', [-72, -22], 0, 6], ['heladeria', 'alemanes', [8, -69], 0, 6], ['sombreros', 'cuna', [40, -244], 0, 6], ['taberna', 'salvador', [70, -210], 0, 6]];
    const SH = SEV.shops = {};
    for (const [k, sid, [ax, az], hd, minW] of SPECIAL) { let best = null, bd = 1e9; for (const l of lots) { if (l.src !== sid || l.sp || l.w < minW || (hd && l.d < hd + .4)) continue; const d = Math.hypot(l.x - ax, l.z - az); if (d < bd) { bd = d; best = l } }
      if (best) { best.sp = k; best.hollow = hd ? Math.min(hd, best.d - .4) : 0; SH[k] = best } else (SEV.stats.missingShops = SEV.stats.missingShops || []).push(k) }
    /* ---------- houses ---------- */
    const glass = Gs; let nShop = 0, gi = 0, nHouse = 0;
    const streetOf = {}; for (const s of N.streets) streetOf[s.id] = s;
    const lanternAt = [], plaqueDone = {};
    for (const l of lots) { const dist = district(l.x, l.z), sty = Object.assign({ q }, STY[dist]); const s = streetOf[l.src], shopP = l.sp ? 1 : s ? (s.shops != null ? s.shops : s.kind === 'alley' ? .1 : s.kind === 'lane' ? .25 : .35) : .45;
      const isShop = !!l.sp || rng() < shopP; const doorX = l.w / 2 - 1.5;
      const H = GW.medHouse(P, Gl, l, sty, rng, { shop: isShop, lit: isShop && rng() < .7, hollow: l.hollow || 0, doorX, glass, shopCol: [0x2a1e16, 0x1e3a2a, 0x3a1a14, 0x1a1a1a, 0x5a3418][(rng() * 5) | 0], floors: l.sp ? 3 : 0 });
      l.H = H; nHouse++;
      const at = (x, z) => GW.localPt(H.base, x, z);
      if (isShop) { nShop++; const k = l.sp || GEN[(gi++ * 7 + (rng() * 3 | 0)) % GEN.length]; l.sign = k; const sw = Math.min(l.w - .8, l.sp ? 5.6 : 4.2), [sx, sz] = at(0, .2); sign(k, sx, 3.3, sz, sw, sw * (l.sp ? .208 : .219), l.yaw);
        if (!l.hollow) { const wk = l.sp ? ({ casafermin: 'w_tapas', ceramica: 'w_ceramic', volantes: 'w_dress', guitarreria: 'w_guitar', convento: 'w_sweets', freiduria: 'w_tapas', orilla: 'w_tapas', abanicos: 'w_fans', abaceria: 'w_tapas', heladeria: 'w_sweets', sombreros: 'w_goods', taberna: 'w_tapas' })[k] || 'w_goods' : WIN[k] || 'w_goods'; const [wx, wz] = at(-.4, .17); sign(wk, wx, 1.45, wz, Math.min(l.w - 2.2, 3.2), 1.9, l.yaw) }
        /* canvas awning on some shops */
        if (q > 0 && rng() < .35 && !(s && s.toldo)) { const c = [[0x2a6a3a, 0xf2f0ea], [0xb01a1a, 0xf2f0ea], [0xe8a820, 0xf2f0ea], [0x1f4a7a, 0xf2f0ea]][(rng() * 4) | 0], ww = Math.min(l.w - 1, 4.4), n = 6; for (let i = 0; i < n; i++) GW.putter(P, H.base)(BG.box, c[i % 2], -ww / 2 + ww * (i + .5) / n, 2.85, .65, ww / n, .05, 1.3, 0, .38, 0, 0) } }
      /* fernandina wall lantern on some facades */
      if (rng() < .22) { const u = (rng() < .5 ? -1 : 1) * (l.w / 2 - .5), put = GW.putter(P, H.base), putG = GW.putter(Gl, H.base); put(BG.box, 0x1a1a1a, u, 4.35, .35, .06, .06, .7); put(BG.box, 0x1a1a1a, u, 4.2, .72, .34, .5, .34); putG(BG.box, 0xffd08a, u, 4.2, .72, .26, .38, .26, 1); lanternAt.push(at(u, .8)) }
      /* azulejo street-name plaque at the first lot of each street end */
      if (s && !plaqueDone[s.id] && SG && l.w > 5) { plaqueDone[s.id] = 1; const [px, pz] = at(-(l.w / 2 - .7), .07); sign('n_' + s.id, px, 3.95, pz, 1.05, .39, l.yaw) }
      else if (!s && !plaqueDone[l.src]) { plaqueDone[l.src] = 1; const [px, pz] = at(-(l.w / 2 - .7), .07); sign('n_' + l.src, px, 3.95, pz, 1.05, .39, l.yaw) } }
    SEV.lots = lots; SEV.stats.houses = nHouse; SEV.stats.shopFronts = nShop; SEV.stats.lanterns = lanternAt.length;
    /* ---------- leftover block land: blank convent walls with tiled coping where seen, plain roofs where not ---------- */
    const fill = N.filler({ max: 36 }); let nf = 0;
    for (const f of fill) { const [x0, x1, z0, z1] = f.r; if (f.vis) { const h = 6.5 + rng() * 4, wc = district((x0 + x1) / 2, (z0 + z1) / 2) === 'triana' ? 0xf0e6d0 : 0xf4f0e6; box(P, wc, x0, x1, 0, h, z0, z1); box(P, 0xb05a30, x0 - .12, x1 + .12, h, h + .22, z0 - .12, z1 + .12); box(P, 0xe0a830, x0 - .02, x1 + .02, 0, .9, z0 - .02, z1 + .02); nf++ }
      else box(P, 0xc8beb0, x0, x1, 0, 8 + ((x0 * 7 + z0 * 3) & 3), z0, z1) }
    SEV.stats.filler = fill.length; SEV.stats.fillerVis = nf;
    /* ---------- walk-ins: carve the interior + a 2 m door, fit them out ---------- */
    const IN = SEV.interiors = {};
    for (const k in SH) { const l = SH[k]; if (!l.hollow) continue; const b = l.H.base, hd = l.hollow, w = l.w, dx = l.w / 2 - 1.5;
      N.carve(GW.lrect(b, -w / 2 + .3, w / 2 - .3, -(hd - .3), -.3)); N.carve(GW.lrect(b, dx - 1, dx + 1, -.9, .7));
      const put = GW.putter(P, b), putG = GW.putter(Gl, b);
      put(BG.box, k === 'solea' ? 0x3a1a14 : 0x8a6a4a, 0, .03, -hd / 2, w - .6, .06, hd - .6);   /* floor */
      putG(BG.box, 0xffe0b0, 0, 3.45, -hd / 2, w - 1.6, .05, hd - 2, 1);   /* ceiling light */
      { const dado = k === 'solea' ? [0x8a1a1a, 0xe8a820] : k === 'volantes' ? [0xe85a8a, 0xf6f0e8] : [0x1f4a9a, 0xe8a820], wallC = k === 'solea' ? 0x2a1a14 : 0xf2ece0;   /* azulejo dado, limewashed walls, beamed ceiling, a lamp */
        for (const sx of [-1, 1]) { put(BG.box, wallC, sx * (w / 2 - .32), 2.2, -hd / 2, .04, 2.6, hd - .6); put(BG.box, dado[0], sx * (w / 2 - .33), .65, -hd / 2, .04, 1.3, hd - .6); put(BG.box, dado[1], sx * (w / 2 - .34), 1.33, -hd / 2, .04, .08, hd - .6) }
        put(BG.box, wallC, 0, 2.2, -hd + .32, w - .6, 2.6, .04); put(BG.box, dado[0], 0, .65, -hd + .33, w - .6, 1.3, .04); put(BG.box, dado[1], 0, 1.33, -hd + .34, w - .6, .08, .04);
        put(BG.box, 0xe8e0d0, 0, 3.52, -hd / 2, w - .6, .04, hd - .6); for (let z = -1; z > -hd + .5; z -= 1.2) put(BG.box, 0x4a2e1a, 0, 3.42, z, w - .6, .16, .18); put(BG.box, 0x1a1a1a, 0, 3.1, -hd / 2, .03, .7, .03); putG(BG.box, 0xffd890, 0, 2.7, -hd / 2, .4, .32, .4, 1) }
      const blk = (x0, x1, z0, z1) => N.block(GW.lrect(b, x0, x1, z0, z1));
      const it = IN[k] = { lot: l, base: b, hd, w, door: GW.localPt(b, dx, 1.2), doorIn: GW.localPt(b, dx, -1.4), mid: GW.localPt(b, 0, -hd / 2), at: (x, z) => GW.localPt(b, x, z) };
      if (k === 'casafermin') { put(BG.box, 0x3a2414, -w / 2 + 1.1, .55, -hd / 2 - .5, .8, 1.1, hd - 2.6); put(BG.box, 0x5a3a20, -w / 2 + 1.1, 1.13, -hd / 2 - .5, 1, .06, hd - 2.4); blk(-w / 2 + .5, -w / 2 + 1.6, -hd + .9, -1.4);
        for (let i = 0; i < 5; i++) put(BG.box, 0x6a2a1a, -w / 2 + .45, 1.6 + (i % 2) * .5, -1.8 - i * 1.1, .4, .5, .5);   /* casks */
        for (let i = 0; i < 4; i++) put(BG.box, 0x7a2a1a, -w / 2 + 1.6, 2.6, -2 - i * 1.4, .14, .55, .14);   /* hams hanging */
        put(BG.box, 0x4a2a18, 1, .5, -hd + 1.6, 1, 1, 1); put(BG.box, 0x4a2a18, 1, .5, -hd + 3.4, 1, 1, 1); blk(.4, 1.6, -hd + 1, -hd + 4);   /* barrel tables */
        it.counter = GW.localPt(b, -w / 2 + 2.3, -hd / 2); it.staff = GW.localPt(b, -w / 2 + .7, -hd / 2 - .5) }
      else if (k === 'solea') { put(BG.box, 0x2a1a10, 0, .25, -hd + 1.6, w - .8, .5, 2.6); blk(-w / 2 + .4, w / 2 - .4, -hd + .3, -hd + 2.9);   /* the tablao stage */
        putG(BG.box, 0xffa040, 0, 3.3, -hd + 1.6, w - 1.2, .06, .3, 1); put(BG.box, 0xb01a1a, 0, 2.2, -hd + .35, w - .8, 3, .06);   /* red backdrop */
        for (let i = 0; i < 3; i++) { put(BG.box, 0x4a2a18, -w / 2 + 1.5 + i * 1.6, .38, -2.4, .7, .76, .7); for (const sx of [-.5, .5]) put(BG.box, 0x2a1a10, -w / 2 + 1.5 + i * 1.6 + sx, .23, -2.4, .4, .46, .4) } blk(-w / 2 + .8, -w / 2 + 5.4, -2.9, -1.9);
        it.stage = GW.localPt(b, 0, -hd + 1.6); it.counter = GW.localPt(b, w / 2 - 1.2, -hd + 4); it.staff = GW.localPt(b, w / 2 - .6, -hd + 4); put(BG.box, 0x3a2414, w / 2 - .7, .55, -hd + 4, .7, 1.1, 2) }
      else if (k === 'ceramica') { for (let i = 0; i < 3; i++) { put(BG.box, 0x6a4a2a, -w / 2 + .6, 1 + i * .7, -hd / 2, .5, .06, hd - 2); for (let p2 = 0; p2 < 6; p2++) put(BG.box, [0x1f4a9a, 0xe8a820, 0x2a8a4a, 0xf2f0ea][(p2 + i) % 4], -w / 2 + .6, 1.18 + i * .7, -2 - p2 * (hd - 3) / 6, .36, .3, .3) } blk(-w / 2 + .3, -w / 2 + 1, -hd + .6, -1.2);
        put(BG.box, 0x3a2414, w / 2 - 1.6, .5, -hd + 1.6, 1.4, 1, 1.2); blk(w / 2 - 2.3, w / 2 - .9, -hd + 1, -hd + 2.2); putG(BG.box, 0xff8a3a, w / 2 - .7, .9, -hd + .8, .8, 1.2, .5, 1);   /* wheel + kiln glow */
        it.counter = GW.localPt(b, w / 2 - 1.6, -hd + 2.8); it.staff = GW.localPt(b, w / 2 - 1.6, -hd + 1.6) }
      else if (k === 'volantes') { for (let i = 0; i < 4; i++) { const z = -1.8 - i * 1.4; put(BG.box, 0x1a1a1a, -w / 2 + .8, .95, z, .05, 1.9, .05); put(BG.box, [0xc8143a, 0xf2d23a, 0x2a8ad8, 0xf2f0ea][i], -w / 2 + .8, 1.15, z, .7, 1.2, .5) } blk(-w / 2 + .3, -w / 2 + 1.3, -hd + 1.2, -1.2);
        put(BG.box, 0x3a1a1e, w / 2 - 1.2, .5, -hd + 1.6, .8, 1, 2); blk(w / 2 - 1.7, w / 2 - .7, -hd + .5, -hd + 2.7); putG(BG.box, 0xfff0e0, 0, 2.2, -hd + .35, 1.6, 2.2, .04, 1);   /* mirror */
        it.counter = GW.localPt(b, w / 2 - 2.1, -hd + 1.6); it.staff = GW.localPt(b, w / 2 - .5, -hd + 1.6) } }
    /* ---------- ground: granite setts everywhere, stone plazas, albero gardens + fairground ---------- */
    const gT = setts(), sT = slabs(), aT = albero();
    { const g = new THREE.PlaneGeometry(N.x1 - N.x0, N.z1 - N.z0); g.rotateX(-Math.PI / 2); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (N.x1 - N.x0), uv.getY(i) * (N.z1 - N.z0)); const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: gT, roughness: .9 })); m.position.set((N.x0 + N.x1) / 2, -.01, (N.z0 + N.z1) / 2); m.receiveShadow = true; m.material.userData.lin = 1; m.name = 'sev_ground'; grp.add(m) }
    const shapeMesh = (polys, tex, y, rough, name) => { const gs = polys.map(P2 => { const sh = new THREE.Shape(P2.map(p => new THREE.Vector2(p[0], -p[1]))); const g = new THREE.ShapeGeometry(sh); g.rotateX(-Math.PI / 2); return g }); if (!gs.length) return; const parts = gs.map(g => [g, 0xffffff, null, 0]); const g = K.merge(parts); g.deleteAttribute('color'); g.deleteAttribute('aGlow'); const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tex, roughness: rough })); m.position.y = y; m.receiveShadow = true; m.material.userData.lin = 1; m.name = name; grp.add(m); return m };
    shapeMesh(N.plazas.filter(p => !p.feria).map(p => p.poly).concat(PLAN.carves.filter(c => /patio|doncellas|arquillo|puerta/.test(c[0])).map(c => c[1])), sT, .012, .8, 'sev_plazas');
    shapeMesh(N.plazas.filter(p => p.feria).map(p => p.poly).concat(N.opens.map(o => o.poly)).concat(PLAN.carves.filter(c => /jardines/.test(c[0])).map(c => c[1])), aT, .014, .95, 'sev_albero');
    /* asphalt + bike lanes + tram rails on the roads; kerbs */
    for (const s of N.streets) { if (!/road|avenue/.test(s.kind) || s.id === 'avenida') continue; for (let i = 0; i + 1 < s.pts.length; i++) { const [a, b] = [s.pts[i], s.pts[i + 1]]; obox(P, 0x3a3a3e, a[0], a[1], b[0], b[1], s.w - 5, 0, .03); if (s.kind === 'avenue' || s.id === 'menendez_pelayo') { const L2 = Math.hypot(b[0] - a[0], b[1] - a[1]), nx = -(b[1] - a[1]) / L2, nz = (b[0] - a[0]) / L2, o = -(s.w / 2 - 1.6); obox(P, 0x2a7a4a, a[0] + nx * o, a[1] + nz * o, b[0] + nx * o, b[1] + nz * o, 1.8, 0, .035) } } }
    for (const x of [-30.72, -29.28]) box(P, 0x8a8a90, x - .05, x + .05, .01, .05, -132, 174);   /* Metrocentro rails down the Avenida */
    /* ---------- the river: water, quay walls ---------- */
    { const wm = K.water({ deep: 0x2a4a3a, shallow: 0x4a6a54, sky: 0xc8d4dc, opacity: .94, iri: .03 }); const g = new THREE.PlaneGeometry(PLAN.river.x1 - PLAN.river.x0 + 2, N.z1 - N.z0); const w = new THREE.Mesh(g, wm); w.rotation.x = -Math.PI / 2; w.position.set((PLAN.river.x0 + PLAN.river.x1) / 2, -2.2, (N.z0 + N.z1) / 2); w.renderOrder = 1; w.name = 'sev_river'; grp.add(w);
      for (const x of [PLAN.river.x0, PLAN.river.x1]) { box(P, 0xc8b890, x - .4, x + .4, -3.4, 0, N.z0, N.z1); box(P, 0xe0d4b4, x - .5, x + .5, -.05, .18, N.z0, N.z1) }
      box(P, 0x2a2a24, PLAN.river.x0, PLAN.river.x1, -3.6, -3.4, N.z0, N.z1) }
    /* ---------- trees, palms, lamps, benches, toldos (props block the walk mask where they stand) ---------- */
    const trees = [], palms = [], lamps = [];
    const freeAt = (x, z, m) => N.walk(x, z) && N.walk(x + m, z) && N.walk(x - m, z) && N.walk(x, z + m) && N.walk(x, z - m);
    for (const s of N.streets) { if (s.w < 6.4 || s.kind === 'road' && s.w > 10) { if (!(s.kind === 'avenue')) continue } const sp = s.kind === 'avenue' ? 11 : 9, off = s.w / 2 - 1.5;
      for (let i = 0; i + 1 < s.pts.length; i++) { const [a, b] = [s.pts[i], s.pts[i + 1]], L2 = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L2, uz = (b[1] - a[1]) / L2;
        for (let t = sp / 2; t < L2 - 2; t += sp) for (const sd of s.sides ? s.sides.map(v => -v) : [1, -1]) { const x = a[0] + ux * t - uz * sd * off, z = a[1] + uz * t + ux * sd * off; if (s.toldo) continue; if (freeAt(x, z, 1.4)) (s.id === 'paseo_colon' || s.id === 'betis' || s.id === 'paseo_o' ? palms : trees).push([x, z]) } } }
    for (const p of N.plazas) { if (p.feria || /mercado|corral|banderas/.test(p.id)) continue; const P2 = p.poly; let cx = 0, cz = 0; for (const v of P2) { cx += v[0]; cz += v[1] } cx /= P2.length; cz /= P2.length; const r = p.r || Math.min(...P2.map(v => Math.hypot(v[0] - cx, v[1] - cz)));
      const n = Math.max(4, Math.round(r * TAU / 9)); for (let i = 0; i < n; i++) { const a = i / n * TAU, x = cx + Math.cos(a) * r * .72, z = cz + Math.sin(a) * r * .72; if (freeAt(x, z, 1.4)) (/nueva|jerez|cuba/.test(p.id) ? palms : trees).push([x, z]) } lamps.push([cx + r * .35, cz + r * .35]) }
    for (let z = 116; z < 162; z += 9) for (let x = -8; x < 90; x += 11) if (freeAt(x, z, 1.6) && ((x + z) | 0) % 3) trees.push([x, z]);   /* Alcázar gardens */
    for (let z = 156; z < 182; z += 8) for (let x = 112; x < 198; x += 10) if (freeAt(x, z, 1.6)) (((x / 10) | 0) % 3 ? trees : palms).push([x, z]);   /* Murillo */
    const orangeP = q ? 3 : 1;
    for (const [x, z] of trees) { const h = 3.2 + rng() * .8; box(P, 0x4a3a2a, x - .13, x + .13, 0, h * .45, z - .13, z + .13); P.push([BG.ico, [0x2e5a26, 0x3a6a2e, 0x34622a][(rng() * 3) | 0], K.M(x, h * .72, z, 1.6, 1.25, 1.6), 0]); if (q > 0) P.push([BG.ico, 0x3a6a2e, K.M(x + .5, h * .9, z - .3, 1, .8, 1), 0]); for (let k = 0; k < orangeP; k++) { const a = rng() * TAU; P.push([BG.sphL, 0xf08a1a, K.M(x + Math.cos(a) * 1.35, h * .7 + (rng() - .3) * .8, z + Math.sin(a) * 1.35, .12, .12, .12), 0]) } box(P, 0xb8a888, x - .55, x + .55, 0, .08, z - .55, z + .55); N.blockCircle(x, z, .25) }
    for (const [x, z] of palms) { const h = 9 + rng() * 5; for (let k = 0; k < 4; k++) P.push([BG.cyl, 0x8a7a5a, K.M(x + k * .04, h * (k + .5) / 4, z, .22 - k * .02, h / 4, .22 - k * .02), 0]); for (let k = 0; k < 7; k++) { const a = k / 7 * TAU; P.push([BG.cone, [0x3a6a2a, 0x4a7a34][k % 2], K.M(x + Math.cos(a) * 1.5, h - .2, z + Math.sin(a) * 1.5, .5, 3.4, .12, Math.PI / 2 + .5, -a, 0), 0]) } N.blockCircle(x, z, .3) }
    for (const [x, z] of lamps.concat(trees.filter((t, i) => i % 6 === 3).map(([x2, z2]) => [x2 + 2.2, z2]))) { if (!freeAt(x, z, .8)) continue; box(P, 0x1a1a1a, x - .07, x + .07, 0, 3.9, z - .07, z + .07); box(P, 0x1a1a1a, x - .3, x + .3, 3.85, 3.95, z - .06, z + .06); for (const sx of [-.28, .28]) box(Gl, 0xffd89a, x + sx - .1, x + sx + .1, 3.95, 4.3, z - .1, z + .1, 1); N.blockCircle(x, z, .15) }
    /* toldos over Sierpes + Tetuán: canvas sails every 7 m */
    for (const s of N.streets) { if (!s.toldo) continue; for (let i = 0; i + 1 < s.pts.length; i++) { const [a, b] = [s.pts[i], s.pts[i + 1]], L2 = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L2, uz = (b[1] - a[1]) / L2; for (let t = 3; t < L2 - 2; t += 7) { const x = a[0] + ux * t, z = a[1] + uz * t; P.push([BG.box, (t | 0) % 2 ? 0xf4eedc : 0xece2c4, K.M(x, 7.4, z, s.w + .4, .05, 5.2, 0, Math.atan2(-uz, ux) + Math.PI / 2, 0), 0]) } } }
    SEV.stats.trees = trees.length; SEV.stats.palms = palms.length;
    /* ---------- landmarks + the fair (sevilla_landmarks.js) ---------- */
    SEV.LM = null; if (SEV.landmarks) try { SEV.LM = SEV.landmarks(ctx, { N, P, Gl, Gs, Q, FP, FQ, FG, box, obox, sign, T, rng, q }) } catch (e) { console.warn('sevilla landmarks', e); SEV.stats.lmErr = String(e && e.stack || e).slice(0, 300) }
    /* ---------- the walking graph (after every carve and prop) + the connectivity report ---------- */
    /* ---------- merge: chunked so the tiles you can't see are culled ---------- */
    GW.atlas(SIGNS, SG, 2048, 4096);
    const solidM = K.floraMat(0, { rough: .86 }); solidM.userData.lin = 1; SEV.solids = GW.chunked(P, 64, K.merge, solidM, grp, 'sev_static', { shadow: true });
    if (Gs.length) { const gm = new THREE.MeshStandardMaterial({ color: 0xa8c8d8, roughness: .05, metalness: .2, transparent: true, opacity: .28, depthWrite: false }); gm.userData.lin = 1; GW.chunked(Gs, 128, K.merge, gm, grp, 'sev_glass', { order: 2 }) }
    const glowM = new THREE.MeshBasicMaterial({ vertexColors: true }); glowM.userData.lin = 1; GW.chunked(Gl, 128, K.merge, glowM, grp, 'sev_glow');
    const signM = new THREE.MeshStandardMaterial({ map: SG.tex, emissiveMap: SG.tex, emissive: 0xffffff, emissiveIntensity: .22, roughness: .55, alphaTest: .3, side: THREE.DoubleSide }); signM.userData.lin = 1; GW.chunked(Q, 128, qs => GW.quadGeo(qs, SG.r), signM, grp, 'sev_signs'); SEV.signM = signM;
    /* festival layer (shown only while the Feria is on) */
    const fest = SEV.festG = new THREE.Group(); fest.visible = false; grp.add(fest); if (SEV.LM && SEV.LM.funfair) fest.add(SEV.LM.funfair);
    if (FP.length) { const fm = K.floraMat(0, { rough: .7 }); fm.userData.lin = 1; GW.chunked(FP, 64, K.merge, fm, fest, 'sev_fest') }
    if (FG.length) { const fg = new THREE.MeshBasicMaterial({ vertexColors: true }); fg.userData.lin = 1; GW.chunked(FG, 128, K.merge, fg, fest, 'sev_fest_glow'); SEV.festGlowM = fg }
    if (FQ.length) { const fs = new THREE.Mesh(GW.quadGeo(FQ, SG.r), signM); fs.name = 'sev_fest_signs'; fest.add(fs) }
    SEV.stats.parts = P.length + Gl.length + Gs.length; SEV.stats.festParts = FP.length + FG.length; SEV.stats.signs = Q.length; SEV.stats.atlasOver = (SG.over || []).length; SEV.stats.atlasBad = (SG.bad || []).length; SEV.stats.lots = lots.length; SEV.stats.shopsPlaced = Object.keys(SH).length;
    /* night: lit windows + signs */
    ctx.upd.push(() => { const h = (S.time / 60) % 24, n = h > 20.5 || h < 6 ? 1 : h > 19 ? (h - 19) / 1.5 : h < 7.5 ? (7.5 - h) / 1.5 : 0; signM.emissiveIntensity = .22 + .8 * n; glowM.color.setScalar(.35 + .65 * n) });
    /* ---------- life: people, shops, rides, the Feria (sevilla_life.js) ---------- */
    if (SEV.life) try { SEV.life(ctx, { N, T, st, SH, IN, box, fest }) } catch (e) { console.warn('sevilla life', e); SEV.stats.lifeErr = String(e && e.stack || e).slice(0, 300) }
    /* the walking graph (built by the life file after its props; rebuilt here if life failed) + the connectivity report */
    const G = SEV.navLinks && N.G ? N.G : N.graph(); SEV.rep = N.check([PLAN.arrival.x, PLAN.arrival.z]); SEV.stats.navNodes = G.nodes.length; SEV.stats.deadEnds = SEV.rep.deadEnds.length; SEV.stats.components = SEV.rep.components; SEV.stats.reach = SEV.rep.reachFrac;
    SEV.nav = { nodes: G.nodes, links: G.links };
    SEV.stats.buildMs = Math.round(performance.now() - t0);
    /* ---------- map ---------- */
    const PLc = (id, en, es, x, z, yaw) => ({ id, name: [en, es], x, z, yaw });
    const places = [];
    for (const p of PLAN.plazas) { const sh = p[1]; let cx, cz; if (sh.c) { cx = sh.c[0]; cz = sh.c[1] } else { cx = sh.reduce((s2, v) => s2 + v[0], 0) / sh.length; cz = sh.reduce((s2, v) => s2 + v[1], 0) / sh.length } const sp = N.snap(cx, cz, 12) || [cx, cz]; places.push(PLc(p[0], p[2][0], p[2][1], sp[0], sp[1], 0)) }
    for (const [id, x, z, en, es] of [['giralda', 76, -96, 'La Giralda (Cathedral)', 'La Giralda (Catedral)'], ['alcazar', 40, 64, 'Real Alcázar', 'Real Alcázar'], ['alcazar_jardines', 40, 140, 'Alcázar gardens', 'Jardines del Alcázar'], ['maestranza', -150, -40, 'La Maestranza (bullring)', 'La Maestranza (plaza de toros)'], ['callejon_agua', 102.5, 60, 'Callejón del Agua', 'Callejón del Agua'], ['sierpes', -4, -250, 'Calle Sierpes', 'Calle Sierpes'], ['betis', -240, 100, 'Calle Betis (river)', 'Calle Betis (río)'], ['puente_triana', -212, -60, 'Triana bridge', 'Puente de Triana'], ['alfareria', -318, -40, 'Calle Alfarería (potters)', 'Calle Alfarería (alfareros)'], ['murillo', 150, 166, 'Jardines de Murillo', 'Jardines de Murillo']]) { const sp = N.snap(x, z, 8) || [x, z]; places.push(PLc(id, en, es, sp[0], sp[1], 0)) }
    const SHN = { casafermin: 'Bodega Casa Fermín', solea: 'Tablao La Soleá (flamenco)', ceramica: 'Cerámica La Cava', volantes: 'Volantes de Triana (flamenco fashion)', guitarreria: 'Guitarrería Hermanos Vidal', convento: 'Convento de Santa Brígida (sweets)', freiduria: 'Freiduría Er Guadalquiví', orilla: 'Bar La Orilla', abanicos: 'Abanicos y Mantones Lola', abaceria: 'Abacería El Postigo', heladeria: 'Heladería La Abuela', sombreros: 'Sombrerería Maera', taberna: 'Taberna Er Salvador' };
    for (const k in SH) { const l = SH[k], [x, z] = GW.localPt(l.H.base, 0, 2.6); places.push(PLc(k, SHN[k] || k, SHN[k] || k, x, z, l.yaw + Math.PI)) }
    if (SEV.lifePlaces) for (const p of SEV.lifePlaces) places.push(p);
    return { name: 'Sevilla', surface: N.surface, fog: [90, 460], sky: { exp: .95, tint: [0x8ab0d8, 0xf0dcb8, .35, .3], dome: { s1: 0xf4e4c8, s2: 0x7aa8dc, swirl: .01, cloud: .35, glow: .4 } },
      arrivals: { default: { x: PLAN.arrival.x, z: PLAN.arrival.z, yaw: PLAN.arrival.yaw }, pipe: { x: -60, z: -150, yaw: PLAN.arrival.yaw }, train: { x: -30, z: -126, yaw: Math.PI } }, defaultArrival: 'default',
      mapRoads: N.mapRoads(), places, mapNav: SEV.nav, routeGroup: () => 'main',
      greet: { human: [['¡Buenas! Mind the bikes on the green lane.', '¡Buenas! Cuidado con las bicis del carril verde.'], ['The Giralda is your compass: you can see it from everywhere.', 'La Giralda es tu brújula: se ve desde todas partes.']] },
      chatLines: [['The orange trees smell like heaven in March. Azahar.', 'Los naranjos huelen a gloria en marzo. Azahar.'], ['Feria on Thursday — the whole city goes to the Real.', 'Feria el jueves: toda la ciudad se va al Real.'], ['Best pescaíto is across the bridge, on Betis.', 'El mejor pescaíto, cruzando el puente, en Betis.'], ['In Santa Cruz even the locals get lost. That is the point.', 'En Santa Cruz hasta los sevillanos se pierden. De eso se trata.']],
      musicProfile: { bpm: 104, root: 52, scale: [0, 1, 4, 5, 7, 8, 10], style: 'amb' } };
  }
});
})(window.AV);
