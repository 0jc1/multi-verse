/* APEVERSE - vienna_arch.js : Cinematic V1, Vienna milestone 7a - the city blocks become Viennese buildings.
   Used by world_vienna.js for every street side of its perimeter blocks (same footprints + collisions as before):
     4 façade styles (512 px, 2 bays x 2 floors, tinted per building): GRÜNDERZEIT historicist (pediments, consoles, rusticated pilasters),
       JUGENDSTIL (gilded floral ornament, tiled bands, arched windows), BAROQUE (pilasters, scrolled window crowns),
       BIEDERMEIER (plain stucco, green shutters). Lit windows show interiors (glow mask, brighter at night).
     rusticated stone ground floor with real shop portals: 24 unique shops (wood portal, window display, gold lettering) + 8 house doors /
       gates / shutters, cornices, string course, wrought-iron balconies, mansard roofs (copper / slate / tile) with dormers + chimneys,
       copper-domed corner towers, Litfaßsäulen, cable-hung street lamps over the side streets.
   AV.viennaArch.make(ctx, q) -> { bar(...), corner(...), lamp(...), litfass(...), flush(), shopsUsed } */
'use strict';
(function (AV) {
const VA = AV.viennaArch = {}, TAU = Math.PI * 2, L = (e, s) => [e, s];
Object.assign(AV.ITEMS, {
  v_melange: { n: L('Wiener Melange', 'Wiener Melange'), cat: 'drink', ic: '☕', use: 'drink', model: 'cup', col: 0xc8a07a, fx: { type: 'drink', amt: .1 }, say: L('Espresso, steamed milk, a cap of foam, a glass of water on a silver tray. As it has been for a century.', 'Espresso, leche, espuma y un vaso de agua en bandeja de plata. Como hace un siglo.'), price: 5 },
  v_strudel: { n: L('Apfelstrudel', 'Apfelstrudel'), cat: 'food', ic: '🥧', use: 'eat', model: 'bowl', col: 0xe8c070, say: L('Paper-thin pastry, warm apples, cinnamon, a cloud of cream.', 'Masa finísima, manzana tibia, canela y una nube de nata.'), price: 6 },
  v_torte: { n: L('Viennese chocolate torte', 'Tarta de chocolate vienesa'), cat: 'food', ic: '🍰', use: 'eat', model: 'bowl', col: 0x5a2a1a, say: L('Dense chocolate, apricot jam, glossy glaze. You need the Melange now.', 'Chocolate denso, mermelada de albaricoque, glaseado brillante. Ahora necesitas la Melange.'), price: 7 }
});
const TX = {};
const rnd = s => { let x = s; return () => (x = (x * 16807) % 2147483647) / 2147483647 };
const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c };
const tex = (c, rep) => { const t = new THREE.CanvasTexture(c); if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t };
/* ---------- façade styles: 512 x 512 = 2 bays (7 m) x 2 floors (7.2 m); neutral light stucco, tinted by vertex colour ---------- */
const room = (c, R, x, y, w, h) => { const g = c.createLinearGradient(x, y, x, y + h); g.addColorStop(0, '#ffe8b8'); g.addColorStop(1, '#c8905a'); c.fillStyle = g; c.fillRect(x, y, w, h); const k = (R() * 4) | 0; c.fillStyle = 'rgba(60,30,20,.55)';
  if (k === 0) { c.beginPath(); c.arc(x + w / 2, y + h * .18, w * .14, 0, TAU); c.fill(); c.fillRect(x + w / 2 - 2, y, 4, h * .1) }   /* chandelier */
  else if (k === 1) { for (let i = 0; i < 4; i++) c.fillRect(x + w * .1, y + h * (.2 + i * .18), w * .35, 4) }   /* bookshelf */
  else if (k === 2) { c.fillStyle = 'rgba(140,30,40,.6)'; c.fillRect(x, y, w * .28, h); c.fillRect(x + w * .72, y, w * .28, h) }   /* velvet curtains */
  else { c.fillRect(x + w * .55, y + h * .3, w * .3, h * .25) } };   /* a painting */
const pane = (c, R, x, y, w, h, lit, arch) => { c.save(); c.beginPath(); if (arch) { c.moveTo(x, y + h); c.lineTo(x, y + w / 2); c.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); c.lineTo(x + w, y + h) } else c.rect(x, y, w, h); c.clip();
  if (lit) room(c, R, x, y, w, h); else { const g = c.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, '#5a6a80'); g.addColorStop(.5, '#2a3446'); g.addColorStop(1, '#1a2030'); c.fillStyle = g; c.fillRect(x, y, w, h); c.fillStyle = 'rgba(255,255,255,.14)'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + w * .5, y); c.lineTo(x, y + h * .5); c.fill() }
  c.restore(); c.fillStyle = '#f4f0e6'; c.fillRect(x + w / 2 - 3, y, 6, h); c.fillRect(x, y + h * .38, w, 5) };
const STY = [
  (c, R, lit) => {   /* GRÜNDERZEIT */
    c.fillStyle = '#ece6da'; c.fillRect(0, 0, 512, 512); for (let i = 0; i < 1500; i++) { c.fillStyle = 'rgba(' + (R() < .5 ? '90,80,60,' : '255,255,250,') + (.03 + R() * .05) + ')'; c.fillRect(R() * 512, R() * 512, 2 + R() * 8, 2 + R() * 8) }
    for (const x of [0, 256]) { c.fillStyle = '#ddd5c4'; c.fillRect(x, 0, 26, 512); c.fillRect(x + 230, 0, 26, 512); for (let y = 0; y < 512; y += 24) { c.fillStyle = 'rgba(120,100,70,.25)'; c.fillRect(x, y, 26, 2); c.fillRect(x + 230, y, 26, 2) } }   /* rusticated pilasters */
    for (const fy of [0, 256]) { c.fillStyle = '#d8cfbc'; c.fillRect(0, fy + 228, 512, 14); for (const bx of [0, 256]) { const wx = bx + 78, wy = fy + 52, ww = 100, wh = 150; c.fillStyle = '#f8f4ea'; c.fillRect(wx - 12, wy - 10, ww + 24, wh + 18); pane(c, R, wx, wy, ww, wh, lit.push ? (R() < .35 && lit.push([wx, wy, ww, wh])) : 0);
      c.fillStyle = '#f8f4ea'; c.beginPath(); if (fy === 0) { c.moveTo(wx - 20, wy - 14); c.lineTo(wx + ww / 2, wy - 44); c.lineTo(wx + ww + 20, wy - 14) } else { c.moveTo(wx - 20, wy - 14); c.quadraticCurveTo(wx + ww / 2, wy - 50, wx + ww + 20, wy - 14) } c.fill(); c.strokeStyle = 'rgba(120,100,70,.4)'; c.lineWidth = 2; c.stroke();
      for (const sx of [wx - 8, wx + ww + 2]) { c.fillStyle = '#e8e0cc'; c.fillRect(sx, wy + wh + 4, 6, 14) } c.fillStyle = '#e8e0cc'; c.fillRect(wx - 16, wy + wh + 2, ww + 32, 8) } } },
  (c, R, lit) => {   /* JUGENDSTIL */
    c.fillStyle = '#f0ece2'; c.fillRect(0, 0, 512, 512); for (let i = 0; i < 1200; i++) { c.fillStyle = 'rgba(' + (R() < .5 ? '90,80,60,' : '255,255,250,') + (.03 + R() * .05) + ')'; c.fillRect(R() * 512, R() * 512, 2 + R() * 6, 2 + R() * 6) }
    for (const fy of [0, 256]) { for (let x = 0; x < 512; x += 16) { c.fillStyle = (x / 16) % 2 ? '#3a8a7a' : '#e8e0c8'; c.fillRect(x, fy + 232, 16, 12) }
      for (const bx of [0, 256]) { const wx = bx + 74, wy = fy + 40, ww = 108, wh = 168; pane(c, R, wx, wy, ww, wh, R() < .35 && lit.push([wx, wy, ww, wh]), true);
        c.strokeStyle = '#c8a030'; c.lineWidth = 4; for (const s of [-1, 1]) { c.beginPath(); const cx = wx + ww / 2 + s * (ww / 2 + 14); c.moveTo(cx, wy + wh); c.bezierCurveTo(cx + s * 20, wy + wh * .6, cx - s * 16, wy + wh * .3, cx + s * 8, wy); c.stroke(); for (let k = 0; k < 4; k++) { c.fillStyle = '#d8b040'; c.beginPath(); c.ellipse(cx + s * (6 + k * 2), wy + wh * (.8 - k * .2), 7, 3.5, s * .8, 0, TAU); c.fill() } }
        c.fillStyle = '#d8b040'; c.beginPath(); c.arc(wx + ww / 2, wy - 12, 9, 0, TAU); c.fill() } } },
  (c, R, lit) => {   /* BAROQUE */
    c.fillStyle = '#efe2b8'; c.fillRect(0, 0, 512, 512); for (let i = 0; i < 1200; i++) { c.fillStyle = 'rgba(' + (R() < .5 ? '110,80,40,' : '255,250,230,') + (.03 + R() * .05) + ')'; c.fillRect(R() * 512, R() * 512, 2 + R() * 8, 2 + R() * 8) }
    for (const x of [0, 256]) { const g = c.createLinearGradient(x + 8, 0, x + 40, 0); g.addColorStop(0, '#f8f0d8'); g.addColorStop(1, '#d8c898'); c.fillStyle = g; c.fillRect(x + 8, 0, 32, 512); c.fillRect(x + 216, 0, 32, 512) }   /* pilasters */
    for (const fy of [0, 256]) { c.fillStyle = '#f4ead0'; c.fillRect(0, fy + 6, 512, 10); for (const bx of [0, 256]) { const wx = bx + 80, wy = fy + 60, ww = 96, wh = 146; c.fillStyle = '#fbf6e6'; c.fillRect(wx - 10, wy - 8, ww + 20, wh + 14); pane(c, R, wx, wy, ww, wh, R() < .35 && lit.push([wx, wy, ww, wh]));
        c.fillStyle = '#fbf6e6'; c.beginPath(); c.moveTo(wx - 16, wy - 10); c.bezierCurveTo(wx + 10, wy - 46, wx + ww / 2 - 12, wy - 24, wx + ww / 2, wy - 40); c.bezierCurveTo(wx + ww / 2 + 12, wy - 24, wx + ww - 10, wy - 46, wx + ww + 16, wy - 10); c.fill(); c.strokeStyle = 'rgba(140,110,60,.45)'; c.lineWidth = 2; c.stroke() } } },
  (c, R, lit) => {   /* BIEDERMEIER */
    c.fillStyle = '#f2ece0'; c.fillRect(0, 0, 512, 512); for (let i = 0; i < 1300; i++) { c.fillStyle = 'rgba(' + (R() < .5 ? '90,80,60,' : '255,255,250,') + (.03 + R() * .05) + ')'; c.fillRect(R() * 512, R() * 512, 2 + R() * 8, 2 + R() * 8) }
    for (const fy of [0, 256]) { c.fillStyle = '#e4dccc'; c.fillRect(0, fy + 240, 512, 6); for (const bx of [0, 256]) { const wx = bx + 86, wy = fy + 56, ww = 84, wh = 140; c.fillStyle = '#ffffff'; c.fillRect(wx - 8, wy - 8, ww + 16, wh + 16); pane(c, R, wx, wy, ww, wh, R() < .35 && lit.push([wx, wy, ww, wh]));
        for (const s of [-1, 1]) { const sx = s < 0 ? wx - 50 : wx + ww + 8; c.fillStyle = '#3a6a4a'; c.fillRect(sx, wy - 4, 42, wh + 8); c.fillStyle = 'rgba(0,0,0,.25)'; for (let y = wy; y < wy + wh; y += 9) c.fillRect(sx + 4, y, 34, 3) } c.fillStyle = '#e4dccc'; c.fillRect(wx - 12, wy + wh + 6, ww + 24, 7) } } }
];
const styleTex = (k, q) => { if (TX['s' + k]) return TX['s' + k]; const s = q === 0 ? 256 : 512, c = canvas(s, s), g = c.getContext('2d'), lit = []; g.scale(s / 512, s / 512); STY[k](g, rnd(91 + k * 13), lit); g.fillStyle = '#3a3a40'; g.fillRect(0, 0, 8, 8);
  const m = canvas(128, 128), mg = m.getContext('2d'); mg.fillStyle = '#000'; mg.fillRect(0, 0, 128, 128); for (const [x, y, w, h] of lit) mg.drawImage(c, x * s / 512, y * s / 512, w * s / 512, h * s / 512, x / 4, y / 4, w / 4, h / 4);
  return TX['s' + k] = { map: tex(c, true), glow: tex(m, true) } };
/* rusticated stone base (7 m x 4.2 m tile) */
const baseTex = q => TX.base || (TX.base = (() => { const s = q === 0 ? 256 : 512, c = canvas(s, s / 2), g = c.getContext('2d'), R = rnd(5); g.scale(s / 512, s / 512); g.fillStyle = '#c8c0b0'; g.fillRect(0, 0, 512, 256);
  for (let y = 0, r = 0; y < 256; y += 32, r++) for (let x = (r % 2) * 48 - 48; x < 512; x += 96) { const v = 180 + R() * 30 | 0; g.fillStyle = 'rgb(' + v + ',' + (v - 6) + ',' + (v - 18) + ')'; g.fillRect(x + 3, y + 3, 90, 26); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x + 3, y + 3, 90, 3) }
  { const gr = g.createLinearGradient(0, 160, 0, 256); gr.addColorStop(0, 'rgba(60,50,40,0)'); gr.addColorStop(1, 'rgba(60,50,40,.18)'); g.fillStyle = gr; g.fillRect(0, 160, 512, 96) }   /* soft grime along the bottom, no stripes */
  return tex(c, true) })());
/* 32 shop portals (4 x 8 cells of 512 x 256 = 6 m x 3 m): 24 unique shops + 8 doors / gates / shutters */
const SHOPS = [['Café Zuckerl', 'cafe', '#2a3a2a'], ['Konditorei Ehrlich', 'cakes', '#5a1a2a'], ['Buchhandlung Wörtersee', 'books', '#1a2a3a'], ['Apotheke zum Goldenen Hirschen', 'pharma', '#1a3a2a'], ['Tabak Trafik', 'trafik', '#5a1a1a'], ['Bäckerei Kornblume', 'bread', '#6a4a2a'],
  ['Juwelier Glanz', 'jewel', '#141418'], ['Antiquariat Staub', 'antique', '#3a2a1a'], ['Schirm & Hut', 'hats', '#2a2a4a'], ['Feinkost Pichler', 'deli', '#3a4a1a'], ['Blumen Rosalie', 'flowers', '#2a4a3a'], ['Uhrmacher Pendel', 'clocks', '#2a1a14'],
  ['Musikalien Walzer', 'music', '#4a1a1a'], ['Wäscherei Blitzblank', 'laundry', '#2a4a6a'], ['Optiker Scharf', 'optic', '#1a1a2a'], ['Spielwaren Kreisel', 'toys', '#6a2a1a'], ['Weinhandel Rebe', 'wine', '#3a1a2a'], ['Galerie Goldblatt', 'gallery', '#e8e0d0'],
  ['Schuhmacher Sohle', 'shoes', '#3a2a1a'], ['Reisebüro Fernweh', 'travel', '#1a3a5a'], ['Papierwaren Feder', 'paper', '#2a3a4a'], ['Friseur Locke', 'barber', '#1a1a1a'], ['Heuriger zum Fass', 'heuriger', '#4a3a1a'], ['Gasthaus Grüner Baum', 'gasthaus', '#1a3a1a']];
const DOORS = ['door', 'gate', 'shutter', 'rent', 'door', 'gate', 'door', 'shutter'];
const portalTex = q => TX.port || (TX.port = (() => { const c = canvas(2048, 2048), g = c.getContext('2d'), R = rnd(33);
  const disp = (k, x, y, w, h) => { const gr = g.createLinearGradient(x, y, x, y + h); gr.addColorStop(0, '#fff0c8'); gr.addColorStop(1, '#c89a68'); g.fillStyle = gr; g.fillRect(x, y, w, h); const P = (col, px, py, pw, ph) => { g.fillStyle = col; g.fillRect(x + px * w, y + py * h, pw * w, ph * h) };
    if (k === 'cakes' || k === 'cafe') { for (let i = 0; i < 3; i++) { P('#f4f0e8', .1, .3 + i * .22, .8, .03); for (let j = 0; j < 4; j++) { g.fillStyle = ['#5a2a1a', '#f4d8e8', '#e8c86a', '#c83a4a'][(i + j) % 4]; g.beginPath(); g.ellipse(x + w * (.2 + j * .2), y + h * (.25 + i * .22), w * .07, h * .06, 0, 0, TAU); g.fill() } } }
    else if (k === 'books' || k === 'antique' || k === 'paper') { for (let i = 0; i < 4; i++) for (let j = 0; j < 9; j++) P(['#7a2a1a', '#1a3a6a', '#2a5a2a', '#c8a050', '#3a1a3a'][(i * 3 + j) % 5], .06 + j * .1, .12 + i * .21, .08, .17) }
    else if (k === 'pharma') { for (let i = 0; i < 3; i++) for (let j = 0; j < 6; j++) { g.fillStyle = '#e8e8f0'; g.fillRect(x + w * (.08 + j * .15), y + h * (.15 + i * .27), w * .1, h * .2); g.fillStyle = '#2a6a4a'; g.fillRect(x + w * (.08 + j * .15), y + h * (.2 + i * .27), w * .1, h * .05) } }
    else if (k === 'trafik') { for (let i = 0; i < 5; i++) P(['#c83a2a', '#2a5ab8', '#f4f0e8', '#e8c83a', '#1a1a1a'][i], .05 + i * .19, .15, .16, .5); g.fillStyle = '#1a1a1a'; g.font = '700 ' + (h * .12) + 'px Georgia'; g.textAlign = 'center'; g.fillText('ZEITUNGEN', x + w / 2, y + h * .85) }
    else if (k === 'bread') { for (let i = 0; i < 3; i++) for (let j = 0; j < 5; j++) { g.fillStyle = '#c88a3a'; g.beginPath(); g.ellipse(x + w * (.14 + j * .18), y + h * (.3 + i * .25), w * .07, h * .07, .3, 0, TAU); g.fill() } }
    else if (k === 'jewel' || k === 'clocks' || k === 'optic') { g.fillStyle = '#2a1a2a'; g.fillRect(x, y, w, h); for (let i = 0; i < 12; i++) { g.strokeStyle = k === 'clocks' ? '#e8c86a' : '#e8e8f0'; g.lineWidth = 3; g.beginPath(); g.arc(x + w * (.12 + (i % 4) * .25), y + h * (.25 + (i / 4 | 0) * .27), w * .05, 0, TAU); g.stroke() } }
    else if (k === 'flowers') { for (let i = 0; i < 30; i++) { g.fillStyle = ['#e83a6a', '#f4d83a', '#c84ad8', '#ffffff', '#2a8a3a'][i % 5]; g.beginPath(); g.arc(x + R() * w, y + h * .3 + R() * h * .65, w * .03 + R() * w * .02, 0, TAU); g.fill() } }
    else if (k === 'wine' || k === 'heuriger') { for (let i = 0; i < 3; i++) for (let j = 0; j < 8; j++) P(['#3a1a1a', '#2a4a1a', '#5a1a2a'][(i + j) % 3], .06 + j * .11, .12 + i * .28, .06, .22); if (k === 'heuriger') { g.fillStyle = '#2a5a1a'; g.beginPath(); g.arc(x + w * .85, y + h * .2, w * .08, 0, TAU); g.fill() } }
    else if (k === 'gallery') { g.fillStyle = '#f8f8f4'; g.fillRect(x, y, w, h); for (let j = 0; j < 3; j++) P(['#c83a2a', '#1a3a8a', '#e8c83a'][j], .1 + j * .3, .25, .2, .45) }
    else if (k === 'travel') { for (let j = 0; j < 3; j++) { const gg = g.createLinearGradient(0, y, 0, y + h); gg.addColorStop(0, ['#4ad8ff', '#ff8a3a', '#7ac83a'][j]); gg.addColorStop(1, '#f4f0e8'); g.fillStyle = gg; g.fillRect(x + w * (.06 + j * .32), y + h * .12, w * .26, h * .7) } }
    else if (k === 'barber') { for (let j = 0; j < 2; j++) { P('#1a1a1a', .15 + j * .45, .5, .25, .4); P('#c8c8d0', .2 + j * .45, .12, .15, .3) } }
    else { for (let i = 0; i < 10; i++) P(['#c83a2a', '#e8c83a', '#2a6ab8', '#3a8a3a', '#f4f0e8'][i % 5], .06 + (i % 5) * .19, .2 + (i / 5 | 0) * .35, .14, .25) }
    g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + w * .4, y); g.lineTo(x, y + h * .6); g.fill() };
  for (let i = 0; i < 32; i++) { const X = (i % 4) * 512, Y = (i / 4 | 0) * 256; g.save(); g.translate(X, Y); g.beginPath(); g.rect(0, 0, 512, 256); g.clip();
    if (i < 24) { const [n, k, fc] = SHOPS[i]; g.fillStyle = fc; g.fillRect(0, 0, 512, 256); g.fillStyle = 'rgba(255,255,255,.06)'; for (let x = 0; x < 512; x += 8) g.fillRect(x, 0, 2, 256);   /* wood portal */
      g.fillStyle = '#141414'; g.fillRect(14, 10, 484, 54); g.strokeStyle = '#d8b050'; g.lineWidth = 3; g.strokeRect(18, 14, 476, 46);
      g.fillStyle = '#e8c860'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = (k === 'heuriger' || k === 'gasthaus' ? 'italic 700 ' : '700 ') + '34px "Times New Roman",Georgia,serif'; g.fillText(n, 256, 38, 460);   /* gold lettering */
      disp(k, 22, 78, 180, 160); disp(k, 310, 78, 180, 160); g.fillStyle = '#2a1a10'; g.fillRect(214, 78, 84, 178); g.fillStyle = 'rgba(255,230,180,.5)'; g.fillRect(224, 88, 64, 70); g.fillStyle = '#d8b050'; g.beginPath(); g.arc(282, 190, 4, 0, TAU); g.fill();   /* door with glass */
      g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 6; g.strokeRect(22, 78, 180, 160); g.strokeRect(310, 78, 180, 160) }
    else { const k = DOORS[i - 24]; g.fillStyle = '#c8c0b0'; g.fillRect(0, 0, 512, 256);
      if (k === 'door') { g.fillStyle = '#3a2214'; g.fillRect(186, 30, 140, 226); g.strokeStyle = '#1a0e08'; g.lineWidth = 6; g.strokeRect(196, 40, 56, 100); g.strokeRect(262, 40, 56, 100); g.strokeRect(196, 150, 56, 96); g.strokeRect(262, 150, 56, 96); g.fillStyle = '#e8e8e8'; g.fillRect(232, 6, 48, 20); g.fillStyle = '#1a3a8a'; g.font = '700 16px Arial'; g.textAlign = 'center'; g.fillText(String(3 + i * 5), 256, 21) }
      else if (k === 'gate') { g.fillStyle = '#1a1a1a'; g.fillRect(170, 20, 172, 236); for (let x = 180; x < 336; x += 14) { g.fillStyle = '#3a3a3a'; g.fillRect(x, 30, 5, 226) } g.strokeStyle = '#2a2a2a'; g.lineWidth = 8; g.beginPath(); g.arc(256, 70, 80, Math.PI, 0); g.stroke() }
      else if (k === 'shutter') { g.fillStyle = '#7a7a80'; g.fillRect(40, 30, 432, 226); for (let y = 30; y < 256; y += 12) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(40, y, 432, 3) } g.fillStyle = '#ff4ad2'; g.font = '700 40px Impact'; g.textAlign = 'center'; g.fillText('TAG', 140 + R() * 200, 150) }
      else { g.fillStyle = '#2a2a30'; g.fillRect(40, 40, 432, 200); g.fillStyle = '#f4f0e8'; g.fillRect(150, 90, 212, 100); g.fillStyle = '#c83a2a'; g.font = '700 30px Arial'; g.textAlign = 'center'; g.fillText('ZU VERMIETEN', 256, 150) } }
    g.restore() } return tex(c) })());
/* 16 Nasenschilder (hanging shop signs): painted enamel / gilded wrought iron, 4 x 4 cells of 256 */
const BLADE = [['Café', 'cup', '#2a1a10', '#e8c860'], ['Konditorei', 'cake', '#5a1a2a', '#f4d8e8'], ['Apotheke', 'A', '#1a3a2a', '#e83a2a'], ['Tabak Trafik', 'trafik', '#c83a2a', '#f4f0e8'], ['Bäckerei', 'pretzel', '#3a2414', '#e8b860'], ['Uhren', 'clock', '#14141a', '#e8c860'], ['Juwelier', 'ring', '#1a1a2a', '#e8c860'], ['Weinstube', 'grapes', '#2a1a2a', '#8ac83a'],
  ['Friseur', 'scissors', '#1a2a4a', '#f4f0e8'], ['Hotel zur Post', 'stars', '#1a1a1a', '#e8c860'], ['Bierhaus', 'mug', '#3a2a14', '#e8c860'], ['Bücher', 'book', '#1a2a3a', '#f4ead0'], ['Optik', 'glasses', '#141418', '#c8d8e8'], ['Schuhe', 'boot', '#3a2a1a', '#e8c860'], ['Musikhaus', 'lyre', '#2a1a3a', '#e8c860'], ['Heuriger', 'pine', '#1a3a1a', '#e8c860']];
const bladeTex = () => TX.blade || (TX.blade = (() => { const c = canvas(1024, 1024), g = c.getContext('2d');
  BLADE.forEach(([n, k, bg, fg], i) => { const X = (i % 4) * 256, Y = (i / 4 | 0) * 256; g.save(); g.translate(X + 128, Y + 128);
    g.strokeStyle = '#c8a040'; g.lineWidth = 6; g.beginPath(); for (let a = 0; a < TAU; a += .02) { const r = 112 + Math.sin(a * 8) * 6; g.lineTo(Math.cos(a) * r, Math.sin(a) * r * .92) } g.closePath(); g.stroke();
    g.fillStyle = bg; g.beginPath(); g.ellipse(0, 0, 100, 92, 0, 0, TAU); g.fill(); g.strokeStyle = fg; g.lineWidth = 3; g.beginPath(); g.ellipse(0, 0, 90, 82, 0, 0, TAU); g.stroke();
    g.fillStyle = fg; g.strokeStyle = fg; g.lineWidth = 5;
    if (k === 'cup') { g.beginPath(); g.moveTo(-34, -20); g.lineTo(34, -20); g.lineTo(26, 18); g.lineTo(-26, 18); g.fill(); g.beginPath(); g.arc(40, -2, 12, -1.4, 1.4); g.stroke(); for (const sx of [-12, 4, 20]) { g.beginPath(); g.moveTo(sx, -30); g.quadraticCurveTo(sx + 8, -42, sx, -54); g.stroke() } }
    else if (k === 'cake') { g.fillRect(-36, -10, 72, 30); g.fillRect(-24, -30, 48, 22); g.beginPath(); g.arc(0, -36, 6, 0, TAU); g.fill() }
    else if (k === 'A') { g.font = '900 120px Georgia,serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('A', 0, -6) }
    else if (k === 'trafik') { g.fillStyle = '#f4f0e8'; g.fillRect(-90, -20, 180, 40); g.fillStyle = '#c83a2a'; g.font = '900 30px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('TABAK', 0, 1) }
    else if (k === 'pretzel') { g.lineWidth = 12; g.beginPath(); g.arc(-18, -6, 26, 0, TAU); g.stroke(); g.beginPath(); g.arc(18, -6, 26, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(-30, 18); g.lineTo(0, 30); g.lineTo(30, 18); g.stroke() }
    else if (k === 'clock') { g.lineWidth = 6; g.beginPath(); g.arc(0, -6, 44, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(0, -6); g.lineTo(0, -38); g.moveTo(0, -6); g.lineTo(24, 4); g.stroke() }
    else if (k === 'ring') { g.lineWidth = 9; g.beginPath(); g.arc(0, 0, 32, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(-12, -32); g.lineTo(0, -50); g.lineTo(12, -32); g.fill() }
    else if (k === 'grapes') { for (let r2 = 0; r2 < 4; r2++) for (let j = 0; j <= 3 - r2; j++) { g.beginPath(); g.arc(-18 * (3 - r2) / 2 + j * 18, -24 + r2 * 16, 9, 0, TAU); g.fill() } }
    else if (k === 'scissors') { g.lineWidth = 7; for (const s2 of [-1, 1]) { g.beginPath(); g.arc(s2 * 20, 26, 12, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(s2 * 14, 16); g.lineTo(-s2 * 20, -44); g.stroke() } }
    else if (k === 'stars') { g.font = '700 36px Georgia,serif'; g.textAlign = 'center'; g.fillText('HOTEL', 0, 6); g.font = '24px Georgia'; g.fillText('★★★', 0, -30) }
    else if (k === 'mug') { g.fillRect(-28, -30, 48, 64); g.lineWidth = 8; g.beginPath(); g.arc(26, 0, 16, -1.4, 1.4); g.stroke(); g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(-4, -34, 30, 10, 0, 0, TAU); g.fill() }
    else if (k === 'book') { g.fillRect(-40, -30, 38, 56); g.fillRect(2, -30, 38, 56); g.fillStyle = bg; g.fillRect(-1, -30, 2, 56) }
    else if (k === 'glasses') { g.lineWidth = 7; g.beginPath(); g.arc(-24, -4, 18, 0, TAU); g.stroke(); g.beginPath(); g.arc(24, -4, 18, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(-6, -6); g.lineTo(6, -6); g.stroke() }
    else if (k === 'boot') { g.beginPath(); g.moveTo(-20, -44); g.lineTo(6, -44); g.lineTo(6, 6); g.lineTo(36, 14); g.lineTo(36, 28); g.lineTo(-20, 28); g.fill() }
    else if (k === 'lyre') { g.lineWidth = 7; g.beginPath(); g.moveTo(-26, 30); g.quadraticCurveTo(-46, -30, -14, -44); g.moveTo(26, 30); g.quadraticCurveTo(46, -30, 14, -44); g.moveTo(-26, 30); g.lineTo(26, 30); g.stroke(); g.lineWidth = 2; for (const sx of [-8, 0, 8]) { g.beginPath(); g.moveTo(sx, 28); g.lineTo(sx, -36); g.stroke() } }
    else { g.beginPath(); g.moveTo(0, -46); g.lineTo(26, 0); g.lineTo(12, 0); g.lineTo(30, 30); g.lineTo(-30, 30); g.lineTo(-12, 0); g.lineTo(-26, 0); g.closePath(); g.fill() }
    g.fillStyle = fg; g.font = '700 ' + (n.length > 10 ? 18 : 22) + 'px Georgia,"Times New Roman",serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; if (k !== 'stars') g.fillText(n, 0, 64, 170);
    g.restore() }); return tex(c) })());
/* Gemeindebau inscription plates (the municipal housing blocks of Red Vienna carry the builder + years in red capitals) */
const inscTex = () => TX.insc || (TX.insc = (() => { const c = canvas(1024, 256), g = c.getContext('2d'); ['1925–1926', '1928–1930', '1951–1953', '1956–1958'].forEach((y, i) => { g.fillStyle = '#e6dfcf'; g.fillRect(0, i * 64, 1024, 64); g.strokeStyle = '#b8ae98'; g.lineWidth = 3; g.strokeRect(3, i * 64 + 3, 1018, 58);
  g.fillStyle = '#a8281e'; g.font = '700 31px Arial,Helvetica,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ERBAUT VON DER GEMEINDE WIEN IN DEN JAHREN ' + y, 512, i * 64 + 33, 990) }); return tex(c) })());
/* a soft warm pool of lamplight on the pavement (additive, only at night) */
const poolTex = () => TX.pool || (TX.pool = (() => { const c = canvas(128, 128), g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.35, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return tex(c) })());
const POOL = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
const cellUV = (g, i, cols, rows) => { const uv = g.attributes.uv, u0 = (i % cols) / cols, v1 = 1 - (i / cols | 0) / rows; for (let k = 0; k < uv.count; k++) uv.setXY(k, u0 + uv.getX(k) / cols, v1 - (1 - uv.getY(k)) / rows); return g };
/* Litfaßsäule posters */
const litTex = () => TX.lit || (TX.lit = (() => { const c = canvas(512, 256), g = c.getContext('2d'), R = rnd(8); const P = [['KONZERT', 'Walzernacht · Musikverein', '#c83a2a'], ['OPER', 'Die Zauberflöte', '#1a2a5a'], ['THEATER', 'Der Zerrissene', '#e8c83a'], ['AUSSTELLUNG', 'Klimt & Freunde', '#d8b040'], ['KINO', 'Sommerkino Karlsplatz', '#2a6a4a'], ['DONAUINSELFEST', 'Live · Gratis', '#ff4ad2']];
  P.forEach(([a, b, col], i) => { const x = i * 85; g.fillStyle = col; g.fillRect(x, 0, 85, 256); g.fillStyle = '#f4f0e8'; g.fillRect(x + 5, 160, 75, 90); g.save(); g.translate(x + 42, 80); g.rotate(-Math.PI / 2); g.font = '900 22px Georgia'; g.textAlign = 'center'; g.fillText(a, 0, 8, 150); g.restore(); g.fillStyle = '#1a1a1a'; g.font = '700 10px Georgia'; g.textAlign = 'center'; g.fillText(b, x + 42, 205, 72) }); return tex(c) })());
const ubox = (w, h, d, tw, th, v0) => { const g = new THREE.BoxGeometry(w, h, d), p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i) + h / 2, z = p.getZ(i); if (Math.abs(n.getY(i)) > .5) uv.setXY(i, .005, .995); else if (Math.abs(n.getX(i)) > .5) uv.setXY(i, (z + d / 2) / tw, (y + (v0 || 0)) / th); else uv.setXY(i, (x + w / 2) / tw, (y + (v0 || 0)) / th) } g.translate(0, h / 2, 0); return g };
const MANS = (() => { const sh = new THREE.Shape([new THREE.Vector2(-.5, 0), new THREE.Vector2(.5, 0), new THREE.Vector2(.4, .62), new THREE.Vector2(.22, 1), new THREE.Vector2(-.22, 1), new THREE.Vector2(-.4, .62)]); const g = new THREE.ExtrudeGeometry(sh, { depth: 1, bevelEnabled: false }); g.translate(0, 0, -.5); return g })();
const PRISM = (() => { const sh = new THREE.Shape([new THREE.Vector2(-.5, 0), new THREE.Vector2(.5, 0), new THREE.Vector2(0, 1)]); const g = new THREE.ExtrudeGeometry(sh, { depth: 1, bevelEnabled: false }); g.translate(0, 0, -.5); return g })();

VA.make = function (ctx, q, opt) {
  opt = opt || {}; const K = AV.kit, M = K.M, BG = K.BG, r = rnd(4711), win = !!opt.winter;
  const sty = [[], [], [], []], base = [], port = [], solid = [], metal = [], glow = [], lits = [], blades = [], insc = [], pools = []; let cur = {};   /* cur: the current block's look (roof type, trim, ornament) set by the city builder */
  const ST = VA.stats = VA.stats || { mans: 0, gable: 0, flat: 0, orn: 0, insc: 0, post: 0 };
  const ROOF = win ? [0xf4f6fa, 0xe8ecf2] : [0x5a8a7a, 0x4a4e58, 0x9a4a32, 0x5a6a72];
  VA._shop = VA._shop || { n: 0, used: [] }; let doorN = 0; const used = VA._shop.used; const SH = VA._shop;   /* shop names are unique across every neighbourhood instance */
  const LW = (x, z, ry, lx, lz) => [x + lx * Math.cos(ry) + lz * Math.sin(ry), z - lx * Math.sin(ry) + lz * Math.cos(ry)];
  const LM = (x, z, ry, y, lx, lz, sx, sy, sz, extra) => { const [wx, wz] = LW(x, z, ry, lx, lz); return M(wx, y, wz, sx, sy, sz, 0, ry + (extra || 0), 0) };
  /* one street side of a block: x, z = centre; len along local x; dep along local z; out = which local z side faces the street (+1 / -1) */
  const bar = (x, z, len, dep, h, ry, col, out, o) => { o = Object.assign({}, cur, o || {}); const k = o.style != null ? o.style : (Math.abs((x * 13 + z * 7) | 0)) % 4, y0 = o.y0 || 0;
    if (!o.noBase) base.push([ubox(len, 4.2, dep, 7, 4.2), 0xffffff, M(x, y0, z, 1, 1, 1, 0, ry, 0)]);
    sty[k].push([ubox(len, h - 4.2, dep, 7, 7.2), col, M(x, y0 + 4.2, z, 1, 1, 1, 0, ry, 0)]);
    solid.push([BG.box, o.trim || 0xe8e0d0, M(x, y0 + 4.25, z, 1, 1, 1, 0, ry, 0).multiply(new THREE.Matrix4().makeScale(len + .25, .3, dep + .3))], [BG.box, o.trim || 0xe0d8c8, M(x, y0 + h - .25, z, 1, 1, 1, 0, ry, 0).multiply(new THREE.Matrix4().makeScale(len + .5, .5, dep + .7))]);   /* string course + cornice */
    const rf = o.roof || 'mans', hk = Math.abs((x * 3 + z * 11) | 0), rc = win ? ROOF[hk % ROOF.length] : rf === 'gable' ? [0x9a4a32, 0xa85a3a, 0x8a3a2a][hk % 3] : rf === 'flat' ? 0x7a7672 : ROOF[hk % ROOF.length]; ST[rf]++;
    if (rf === 'flat') { solid.push([BG.box, o.trim || 0xd8d0c0, M(x, y0 + h + .35, z, 1, 1, 1, 0, ry, 0).multiply(new THREE.Matrix4().makeScale(len + .1, .7, dep + .1))], [BG.box, rc, M(x, y0 + h + .71, z, 1, 1, 1, 0, ry, 0).multiply(new THREE.Matrix4().makeScale(len - .6, .02, dep - .6))]); if (len > 10 && dep > 3.5) solid.push([BG.box, 0xc8c0b0, LM(x, z, ry, y0 + h + 1.7, len * .2, 0, 3, 2, Math.min(3, dep - 1))]) }   /* Gemeindebau: parapet, gravel roof, stair house */
    else solid.push([rf === 'gable' ? PRISM : MANS, rc, M(x, y0 + h, z, 1, 1, 1, 0, ry + Math.PI / 2, 0).multiply(new THREE.Matrix4().makeScale(dep + .4, rf === 'gable' ? 3.4 : 3.6, len + .2))]);   /* mansard roof, or a Biedermeier tiled gable */
    if (q > 0 && rf === 'mans') for (let lx = -len / 2 + 2; lx < len / 2 - 1.5; lx += 3.5) { if (r() < .35) continue; for (const s of q === 2 ? [out, -out] : [out]) {   /* Medium: street side only (the courtyard side is never seen); Low: none */ const lz = s * (dep / 2 - .4); solid.push([BG.box, 0xe8e0d0, LM(x, z, ry, y0 + h + 1.3, lx, lz, 1.1, 1.3, .8)], [PRISM, rc, LM(x, z, ry, y0 + h + 1.95, lx, lz, 1.3, .6, 1, Math.PI / 2)]); glow.push([BG.box, r() < .3 ? 0xffd890 : 0x2a3446, LM(x, z, ry, y0 + h + 1.25, lx, lz + s * .42, .6, .7, .02)]) } }   /* dormers */
    for (let n = 0; n < 1 + ((len / 9) | 0); n++) { const lx = (r() - .5) * (len - 2), lz = (r() - .5) * dep * .3; solid.push([BG.box, 0xb87a5a, LM(x, z, ry, y0 + h + (rf === 'flat' ? 1.5 : rf === 'gable' ? 2.9 : 3.3), lx, lz, .6, 1.6, .5)], [BG.box, 0x6a5a5a, LM(x, z, ry, y0 + h + (rf === 'flat' ? 2.35 : rf === 'gable' ? 3.75 : 4.15), lx, lz, .75, .12, .65)]) }   /* chimneys */
    if (len > 12 && r() < .55) { const lx = (r() - .5) * (len - 8); metal.push([BG.box, 0xd8d0c0, LM(x, z, ry, y0 + 7.8, lx, out * (dep / 2 + .45), 3.2, .16, .9)]); for (let i = 0; i <= 8; i++) metal.push([BG.box, 0x1a1a1e, LM(x, z, ry, y0 + 8.35, lx - 1.5 + i * .375, out * (dep / 2 + .85), .03, 1, .03)]); metal.push([BG.box, 0x1a1a1e, LM(x, z, ry, y0 + 8.85, lx, out * (dep / 2 + .85), 3.2, .05, .05)]) }   /* wrought-iron balcony */
    if (!o.noShops) { const n = Math.max(1, Math.floor((len - 3) / 7)); for (let i = 0; i < n; i++) { const lx = -((n - 1) * 7) / 2 + i * 7; let cell; if (r() < (o.shopP == null ? .62 : o.shopP) && SH.n < 24) { cell = SH.n++; used.push(SHOPS[cell][0]) } else cell = 24 + (doorN++ % 8);
        port.push([cellUV(new THREE.PlaneGeometry(6, 3), cell, 4, 8), 0xffffff, LM(x, z, ry, y0 + 1.75, lx, out * (dep / 2 + .04), 1, 1, 1, out < 0 ? Math.PI : 0)]);
        solid.push([BG.box, 0x5a5048, LM(x, z, ry, y0 + 3.35, lx, out * (dep / 2 + .1), 6.3, .2, .2)]) } }
    if (o.orn && len > 5) { ST.orn++; const fz = out * (dep / 2 + .06); metal.push([BG.box, 0xc8a040, LM(x, z, ry, y0 + h - .75, 0, fz, len - .4, .16, .06)]); solid.push([BG.box, 0x3a7a62, LM(x, z, ry, y0 + h - 1.25, 0, fz, len - .4, .5, .05)]);
      for (let lx = -len / 2 + 1.75; lx < len / 2 - 1; lx += 3.5) metal.push([BG.box, 0xc8a040, LM(x, z, ry, y0 + h - 1.25, lx, out * (dep / 2 + .1), .45, .45, .03, Math.PI / 4)]) }   /* Jugendstil: gilded band + green-tiled frieze with gold medallions under the cornice */
    if (o.insc && len >= 12 && !o.noBase) { ST.insc++; insc.push([cellUV(new THREE.PlaneGeometry(Math.min(len - 2, 11), .55), (o.insc - 1) % 4, 1, 4), 0xffffff, LM(x, z, ry, y0 + 3.85, 0, out * (dep / 2 + .05), 1, 1, 1, out < 0 ? Math.PI : 0)]) }   /* Gemeindebau inscription over the ground floor */
    if (o.corner) { const [cx, cz] = LW(x, z, ry, o.corner * (len / 2 - 3), 0); sty[k].push([ubox(6.2, h + 1.5 - 4.2, dep + .2, 7, 7.2), col, M(cx, y0 + 4.2, cz, 1, 1, 1, 0, ry, 0)]); solid.push([BG.cyl, 0xe0d8c8, M(cx, y0 + h + 2.1, cz, 3, 1.2, 3)], [BG.hem, win ? 0xf4f6fa : 0x5ab89a, M(cx, y0 + h + 2.7, cz, 3, 3.4, 3)], [BG.cyl, 0xe0d8c8, M(cx, y0 + h + 6.4, cz, .45, 1, .45)]); glow.push([BG.sph, 0xffd84a, M(cx, y0 + h + 7.2, cz, .35, .35, .35)]) } };   /* copper-domed corner tower */
  /* Litfaßsäule at a street corner */
  const litfass = (x, z) => { solid.push([BG.cyl, 0x2a4a3a, M(x, .2, z, .7, .4, .7)], [BG.cyl, 0x2a4a3a, M(x, 3.25, z, .66, .1, .66)], [BG.hem, 0x2a4a3a, M(x, 3.3, z, .66, .5, .66)]); const g = new THREE.CylinderGeometry(.62, .62, 2.8, 16, 1, true); lits.push([g, 0xffffff, M(x, 1.8, z, 1, 1, 1, 0, r() * TAU, 0)]); ctx.circles.push([x, z, .72]) };
  /* Viennese lamp hung on a cable across a side street */
  const cables = []; const lamp = (ax, az, bx, bz) => { const mx = (ax + bx) / 2, mz = (az + bz) / 2; for (const [px, pz] of [[ax, az], [bx, bz]]) { for (let j = 0; j < 6; j++) { const t0 = j / 6, t1 = (j + 1) / 6, y = t => 8.2 - Math.sin(t * Math.PI) * .5; cables.push(px + (mx - px) * t0, y(t0), pz + (mz - pz) * t0, px + (mx - px) * t1, y(t1), pz + (mz - pz) * t1) } }
    metal.push([BG.cyl, 0x2a2a2e, M(mx, 7.55, mz, .05, .5, .05)], [BG.cone, 0x2a2a2e, M(mx, 7.2, mz, .5, .3, .5)]); glow.push([BG.sph, 0xfff0c8, M(mx, 7, mz, .3, .18, .3)]); pools.push([POOL, 0xffffff, M(mx, .045, mz, 7, 1, 7)]) };
  /* a Nasenschild: hanging sign on a wrought-iron bracket, perpendicular to the facade (readable from both directions along the street) */
  const blade = (fx, fz, nx, nz, y, cell) => { const x = fx + nx * .95, z = fz + nz * .95, ry = Math.atan2(nx, nz) + Math.PI / 2;
    for (const e of [0, Math.PI]) blades.push([cellUV(new THREE.PlaneGeometry(.95, .95), cell % 16, 4, 4), 0xffffff, M(x, y, z, 1, 1, 1, 0, ry + e, 0)]);
    metal.push([BG.box, 0x1a1a1a, M(fx + nx * .55, y + .6, fz + nz * .55, Math.abs(nz) * .05 + Math.abs(nx) * 1.15, .05, Math.abs(nx) * .05 + Math.abs(nz) * 1.15)], [BG.box, 0xc8a040, M(fx + nx * .2, y + .3, fz + nz * .2, .06, .7, .06)]) };
  /* a Viennese street lamp post on the kerb: green cast-iron mast, two lanterns on a cross-arm */
  const post = (x, z) => { ST.post++; metal.push([BG.cyl, 0x2a3a32, M(x, 2.3, z, .07, 4.6, .07)], [BG.cyl, 0x2a3a32, M(x, .25, z, .16, .5, .16)], [BG.box, 0x2a3a32, M(x, 4.55, z, .7, .05, .05)]);
    for (const e of [-.32, .32]) { metal.push([BG.cone, 0x2a3a32, M(x + e, 4.48, z, .2, .16, .2)]); glow.push([BG.sph, 0xfff0c8, M(x + e, 4.3, z, .13, .16, .13)]) } pools.push([POOL, 0xffffff, M(x, .05, z, 6, 1, 6)]); ctx.circles.push([x, z, .16]) };
  const flush = () => { const grp = opt.group || ctx.group, det = opt.detail || grp, R0 = [];
    sty.forEach((parts, k) => { if (!parts.length) return; const T = styleTex(k, q), m = new THREE.MeshStandardMaterial({ map: T.map, vertexColors: true, roughness: .85, emissive: 0xffffff, emissiveMap: T.glow, emissiveIntensity: .25 }); m.userData.lin = 1; R0.push(m); grp.add(new THREE.Mesh(K.merge(parts), m)) });
    if (base.length) { const m = new THREE.MeshStandardMaterial({ map: baseTex(q), roughness: .9 }); m.userData.lin = 1; grp.add(new THREE.Mesh(K.merge(base), m)) }
    if (port.length) { const pt = portalTex(q), m = new THREE.MeshStandardMaterial({ map: pt, roughness: .55, emissive: 0xffffff, emissiveMap: pt, emissiveIntensity: .22, polygonOffset: true, polygonOffsetFactor: -2 }); m.userData.lin = 1; R0.push(m); det.add(new THREE.Mesh(K.merge(port), m)) }
    if (blades.length) { const bt = bladeTex(), m = new THREE.MeshStandardMaterial({ map: bt, side: THREE.FrontSide, roughness: .45, metalness: .3, emissive: 0xffffff, emissiveMap: bt, emissiveIntensity: .2, polygonOffset: true, polygonOffsetFactor: -1 }); m.userData.lin = 1; R0.push(m); det.add(new THREE.Mesh(K.merge(blades), m)) }
    if (insc.length) { const it = inscTex(), m = new THREE.MeshStandardMaterial({ map: it, roughness: .8, polygonOffset: true, polygonOffsetFactor: -2 }); m.userData.lin = 1; det.add(new THREE.Mesh(K.merge(insc), m)) }
    if (lits.length) { const m = new THREE.MeshStandardMaterial({ map: litTex(), roughness: .8 }); m.userData.lin = 1; det.add(new THREE.Mesh(K.merge(lits), m)) }
    const vm = o => { const m = new THREE.MeshStandardMaterial(Object.assign({ vertexColors: true }, o)); m.userData.lin = 1; return m };
    if (solid.length) grp.add(new THREE.Mesh(K.merge(solid), vm({ roughness: .8 }))); if (metal.length) det.add(new THREE.Mesh(K.merge(metal), vm({ roughness: .4, metalness: .6 })));
    if (glow.length) { const gm = new THREE.MeshBasicMaterial({ vertexColors: true }); gm.userData.lin = 1; det.add(new THREE.Mesh(K.merge(glow), gm)) }
    if (cables.length) { const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(cables, 3)); det.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0x1a1a1a }))) }
    let pm = null, pmesh = null; if (pools.length) { pm = new THREE.MeshBasicMaterial({ map: poolTex(), color: 0xffc070, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -3 }); pmesh = new THREE.Mesh(K.merge(pools), pm); pmesh.visible = false; pmesh.renderOrder = 2; det.add(pmesh) }
    ctx.upd.push(() => { const nk = AV.nightK || 0; for (const m of R0) m.emissiveIntensity = (m.map === TX.port ? .2 : .2) + nk * .8; if (pm) { pm.opacity = Math.max(0, nk - .15) * .7; pmesh.visible = nk > .2 } });
    VA.fx = { shops: SH.n, doors: (VA.fx ? VA.fx.doors : 0) + doorN, used } };
  return { bar, litfass, lamp, blade, post, flush, used, set: c => { cur = c || {} } };
};
})(window.AV);
