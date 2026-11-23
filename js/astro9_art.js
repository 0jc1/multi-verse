/* APEVERSE - astro9_art.js : Cinematic V1, Astro-9 district 2 dressing = ART AVENUE becomes a real arts quarter.
     PRISM GALLERY (west, x -24..-7, z 120..133): an enterable white-cube gallery - textured facade with display windows, 8 unique
       framed works, 3 sculptures on plinths, a bench, track lights, a curator at the desk and a print shop.
     MURAL ALLEY (east): a street-art shortcut from Art Avenue (x 7, z 121..127) to the Food Ring (x 34..40, z 104) - six different
       large murals, an open "tag wall" where you can spray your own name (kept in your save), a spray artist at work, string lights,
       pipes, bins, wet asphalt. Loft facades on the outer faces so the block reads as buildings from the plaza and the Food Ring.
     SPRAY LAB (east, x 7..32, z 127..135.6): an art-supply shopfront on the avenue (paint, zines).
     AVENUE: paint-splattered terrazzo, gallery-spot lamp posts with 8 different exhibition banners, a kinetic ring sculpture,
       chalk drawings on the ground, an easel with the painter Lyx, small groups of people actually talking (beings 'chat'/'look' modes).
   Everything static is merged per material; one point light (gallery). AV.astro9art.build(ctx) -> { places }, called from astro9_metro.js. */
'use strict';
(function (AV) {
const tr = AV.tr, TAU = Math.PI * 2, L = (e, s) => [e, s];
const AR = AV.astro9art = {};
const GAL = [-24, -7, 120, 133], ALW = [7, 40, 121, 127], ALN = [34, 40, 104, 127], SPR = [7, 32, 127, 135.6];
const inR = (x, z, r) => x >= r[0] && x <= r[1] && z >= r[2] && z <= r[3];
Object.assign(AR, { GAL, ALW, ALN, SPR });
AR.surface = (x, z) => (inR(x, z, GAL) || inR(x, z, ALW) || inR(x, z, ALN)) ? 0 : null;
AR.gap = (sx, z) => sx < 0 ? z > 119 && z < 134 : z > 119.5 && z < 136;   /* Art Avenue railings open onto the gallery, the alley and the Spray Lab */
if (AV.astro9m2) { const base = AV.astro9m2.surface; AV.astro9m2.surface = (x, z) => { const a = base(x, z); return a !== null ? a : AR.surface(x, z) } }
Object.assign(AV.ITEMS, {
  a9_print: { n: L('Prism Gallery print', 'Lámina de la Galería Prisma'), cat: 'misc', ic: '🖼', use: 'look', keep: true, model: 'card', col: 0x7ff0ff, say: L('“New Moons”, signed by an artist with three hands. The ink shifts colour in your pocket.', '“Lunas Nuevas”, firmada por una artista con tres manos. La tinta cambia de color en tu bolsillo.'), price: 30 },
  a9_zine: { n: L('Art Avenue zine', 'Fanzine de la Avenida del Arte'), cat: 'misc', ic: '📖', use: 'look', keep: true, model: 'card', col: 0xffd84a, say: L('Photocopied, stapled, glorious. Page 4 is a map of every mural in Astro-9.', 'Fotocopiado, grapado, glorioso. La página 4 es un mapa de todos los murales de Astro-9.'), price: 9 },
  a9_spray: { n: L('Spray can (cosmic teal)', 'Spray (verde cósmico)'), cat: 'misc', ic: '🎨', use: 'look', keep: true, model: 'can', col: 0x1ad8c8, say: L('Rattles like a tiny maraca. Smells of ozone.', 'Suena como una maraca diminuta. Huele a ozono.'), price: 12 }
});
const TX = {};
const rnd = s => { let x = s; return () => (x = (x * 16807) % 2147483647) / 2147483647 };
const cv = (w, h, f, sc) => { sc = sc || 1; const c = document.createElement('canvas'); c.width = w * sc; c.height = h * sc; const g = c.getContext('2d'); g.scale(sc, sc); f(g, w, h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t };
const cell = (w, h, i, cols, rows) => { const g = new THREE.PlaneGeometry(w, h), uv = g.attributes.uv, u0 = (i % cols) / cols, v1 = 1 - (i / cols | 0) / rows; for (let k = 0; k < uv.count; k++) uv.setXY(k, u0 + uv.getX(k) / cols, v1 - (1 - uv.getY(k)) / rows); return g };

/* ---------- street-art painting helpers ---------- */
const drips = (c, R, x0, x1, y, col, n) => { c.fillStyle = col; for (let i = 0; i < n; i++) { const x = x0 + R() * (x1 - x0), l = 10 + R() * 60, w = 2 + R() * 4; c.fillRect(x - w / 2, y, w, l); c.beginPath(); c.arc(x, y + l, w * .9, 0, TAU); c.fill() } };
const sprayCloud = (c, x, y, r, col) => { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2) };
const bubble = (c, t, x, y, size, fills, o1, o2, shadow) => { c.save(); c.font = '900 ' + size + 'px "Arial Black","Impact",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  if (shadow) { c.fillStyle = shadow; c.fillText(t, x + size * .08, y + size * .08); c.strokeStyle = shadow; c.lineWidth = size * .3; c.strokeText(t, x + size * .08, y + size * .08) }
  c.strokeStyle = o2; c.lineWidth = size * .3; c.strokeText(t, x, y); c.strokeStyle = o1; c.lineWidth = size * .16; c.strokeText(t, x, y);
  const g = c.createLinearGradient(0, y - size / 2, 0, y + size / 2); fills.forEach((f, i) => g.addColorStop(i / (fills.length - 1), f)); c.fillStyle = g; c.fillText(t, x, y);
  c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 2; c.strokeText(t, x - 2, y - 3); c.restore() };
const tags = (c, R, n, y0, y1, w) => { for (let i = 0; i < n; i++) { c.strokeStyle = ['#111', '#e8e8e8', '#ff4ad2', '#4ad8ff', '#ffd84a', '#7aff8a'][(R() * 6) | 0]; c.lineWidth = 2 + R() * 3; c.lineCap = 'round'; c.beginPath(); let x = R() * (w || 1024), y = y0 + R() * (y1 - y0); c.moveTo(x, y); for (let k = 0; k < 6; k++) { const nx = x + 6 + R() * 16, ny = y + (R() - .5) * 26; c.quadraticCurveTo(x + (R() - .5) * 20, y - 14 + R() * 28, nx, ny); x = nx; y = ny } c.stroke() } };
const concrete = (c, R, w, h, base) => { c.fillStyle = base; c.fillRect(0, 0, w, h); for (let i = 0; i < 1600; i++) { c.fillStyle = 'rgba(' + (R() < .5 ? '0,0,0,' : '255,255,255,') + (.03 + R() * .06) + ')'; const s = 2 + R() * 10; c.fillRect(R() * w, R() * h, s, s) } };

/* six murals, 2 x 3 cells of 1024 x 512 */
const MURALS = [
  (c, R) => {   /* COSMIC WHALE */
    const g = c.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, '#0a1450'); g.addColorStop(1, '#5a1a7a'); c.fillStyle = g; c.fillRect(0, 0, 1024, 512);
    for (let i = 0; i < 160; i++) { c.fillStyle = 'rgba(255,255,255,' + (.3 + R() * .7) + ')'; const s = 1 + R() * 3; c.fillRect(R() * 1024, R() * 400, s, s) }
    c.fillStyle = '#ff8a3a'; c.beginPath(); c.arc(860, 110, 64, 0, TAU); c.fill(); c.strokeStyle = '#ffd84a'; c.lineWidth = 8; c.beginPath(); c.ellipse(860, 110, 110, 22, -.3, 0, TAU); c.stroke();
    c.lineWidth = 10; c.strokeStyle = '#0a0a14'; const wg = c.createLinearGradient(150, 160, 700, 380); wg.addColorStop(0, '#1ad8c8'); wg.addColorStop(1, '#ff4ad2'); c.fillStyle = wg;
    c.beginPath(); c.moveTo(130, 290); c.bezierCurveTo(170, 150, 520, 120, 650, 240); c.bezierCurveTo(700, 280, 760, 270, 800, 200); c.lineTo(850, 160); c.lineTo(830, 260); c.lineTo(880, 330); c.lineTo(800, 300); c.bezierCurveTo(740, 330, 690, 360, 620, 370); c.bezierCurveTo(420, 410, 180, 390, 130, 290); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = 'rgba(10,10,20,.6)'; c.lineWidth = 4; for (let k = 0; k < 7; k++) { c.beginPath(); c.moveTo(210 + k * 50, 345 + k * 2); c.lineTo(250 + k * 50, 380 - k); c.stroke() }
    c.fillStyle = '#fff'; c.beginPath(); c.arc(240, 270, 16, 0, TAU); c.fill(); c.fillStyle = '#0a0a14'; c.beginPath(); c.arc(244, 272, 8, 0, TAU); c.fill();
    for (let k = 0; k < 14; k++) { c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.arc(330 + R() * 300, 200 + R() * 120, 4 + R() * 10, 0, TAU); c.fill() }
    for (let k = 0; k < 9; k++) { c.strokeStyle = '#7ff0ff'; c.lineWidth = 3; c.beginPath(); c.arc(120 - k * 4 + R() * 40, 220 - k * 22, 5 + R() * 6, 0, TAU); c.stroke() }
    bubble(c, 'DREAM DEEP', 512, 462, 52, ['#ffd84a', '#ff8a3a'], '#0a0a14', '#ffffff'); drips(c, R, 120, 880, 395, 'rgba(255,74,210,.8)', 10) },
  (c, R) => {   /* ASTRO APE portrait */
    c.fillStyle = '#ffb81a'; c.fillRect(0, 0, 1024, 512); for (let k = 0; k < 24; k++) { c.fillStyle = k % 2 ? '#ff8a1a' : '#ffd84a'; c.beginPath(); c.moveTo(512, 256); const a0 = k / 24 * TAU, a1 = (k + 1) / 24 * TAU; c.lineTo(512 + Math.cos(a0) * 900, 256 + Math.sin(a0) * 900); c.lineTo(512 + Math.cos(a1) * 900, 256 + Math.sin(a1) * 900); c.fill() }
    for (let y = 0; y < 512; y += 14) for (let x = 0; x < 1024; x += 14) { const d = Math.hypot(x - 512, y - 256) / 600; c.fillStyle = 'rgba(200,40,20,.35)'; c.beginPath(); c.arc(x, y, 1 + d * 5, 0, TAU); c.fill() }
    c.fillStyle = '#e8f0ff'; c.beginPath(); c.arc(512, 256, 230, 0, TAU); c.fill(); c.lineWidth = 14; c.strokeStyle = '#0a0a14'; c.stroke(); c.fillStyle = '#1a1a3a'; c.beginPath(); c.arc(512, 256, 190, 0, TAU); c.fill();
    c.fillStyle = '#5a3a2a'; c.beginPath(); c.ellipse(512, 270, 150, 160, 0, 0, TAU); c.fill(); c.fillStyle = '#c89a7a'; c.beginPath(); c.ellipse(512, 330, 100, 72, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(450, 225, 52, 46, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(574, 225, 52, 46, 0, 0, TAU); c.fill();
    c.fillStyle = '#0a0a14'; for (const ex of [455, 569]) { c.beginPath(); c.arc(ex, 228, 18, 0, TAU); c.fill() } c.fillStyle = '#fff'; for (const ex of [462, 576]) { c.beginPath(); c.arc(ex, 222, 6, 0, TAU); c.fill() }
    c.fillStyle = '#3a2418'; for (const nx of [495, 529]) { c.beginPath(); c.ellipse(nx, 312, 9, 6, 0, 0, TAU); c.fill() } c.strokeStyle = '#3a2418'; c.lineWidth = 7; c.beginPath(); c.arc(512, 335, 40, .15 * Math.PI, .85 * Math.PI); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(420, 150, 70, 26, -.6, 0, TAU); c.fill(); c.strokeStyle = '#ff4ad2'; c.lineWidth = 8; c.beginPath(); c.arc(512, 256, 238, 0, TAU); c.stroke();
    bubble(c, 'ASTRO', 150, 256, 74, ['#4ad8ff', '#1a4ab8'], '#0a0a14', '#ffffff', 'rgba(0,0,0,.4)'); bubble(c, 'APE', 880, 256, 92, ['#ff4ad2', '#8a1a6a'], '#0a0a14', '#ffffff', 'rgba(0,0,0,.4)') },
  (c, R) => {   /* ASTRO-9 wildstyle */
    c.fillStyle = '#14081e'; c.fillRect(0, 0, 1024, 512); for (let k = 0; k < 14; k++) sprayCloud(c, R() * 1024, R() * 512, 80 + R() * 160, ['rgba(255,74,210,.5)', 'rgba(74,216,255,.45)', 'rgba(255,216,74,.35)'][k % 3]);
    for (let k = 0; k < 40; k++) { c.fillStyle = '#fff'; const x = R() * 1024, y = R() * 512, s = 3 + R() * 7; c.beginPath(); c.moveTo(x, y - s); c.lineTo(x + s * .25, y - s * .25); c.lineTo(x + s, y); c.lineTo(x + s * .25, y + s * .25); c.lineTo(x, y + s); c.lineTo(x - s * .25, y + s * .25); c.lineTo(x - s, y); c.lineTo(x - s * .25, y - s * .25); c.fill() }
    c.save(); c.translate(512, 250); c.rotate(-.06); bubble(c, 'ASTRO·9', 0, 0, 190, ['#ffe84a', '#ff8a1a', '#ff2a6a'], '#14081e', '#7ff0ff', '#4a1a8a'); c.restore();
    drips(c, R, 150, 880, 330, '#7ff0ff', 16); c.strokeStyle = '#ffd84a'; c.lineWidth = 7; c.beginPath(); c.moveTo(150, 120); c.lineTo(180, 70); c.lineTo(205, 105); c.lineTo(235, 60); c.lineTo(260, 105); c.lineTo(290, 70); c.lineTo(310, 120); c.stroke();
    c.font = 'italic 34px "Segoe Print",cursive'; c.fillStyle = '#fff'; c.textAlign = 'right'; c.fillText('- Nix & the Orbit crew', 990, 480) },
  (c, R) => {   /* NEON JUNGLE */
    const g = c.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, '#04241a'); g.addColorStop(1, '#0a3a2a'); c.fillStyle = g; c.fillRect(0, 0, 1024, 512);
    for (let layer = 0; layer < 3; layer++) for (let k = 0; k < 26; k++) { const x = R() * 1100 - 40, y = 512 - R() * 200 - layer * 110, s = 60 + R() * 90, a = -1.2 + R() * 2.4, col = [['#0a5a3a', '#1a8a4a'], ['#1a9a5a', '#3ad87a'], ['#4aff9a', '#c8ff4a']][layer];
      c.save(); c.translate(x, y); c.rotate(a); const lg = c.createLinearGradient(0, -s, 0, 0); lg.addColorStop(0, col[1]); lg.addColorStop(1, col[0]); c.fillStyle = lg; c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(s * .55, -s * .3, s * .4, -s * .85, 0, -s); c.bezierCurveTo(-s * .4, -s * .85, -s * .55, -s * .3, 0, 0); c.fill(); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -s * .95); c.stroke(); c.restore() }
    for (let k = 0; k < 7; k++) { const x = 100 + R() * 820, y = 120 + R() * 260; c.fillStyle = '#ffd84a'; for (const dx of [-14, 14]) { c.beginPath(); c.ellipse(x + dx, y, 10, 7, 0, 0, TAU); c.fill() } c.fillStyle = '#0a0a0a'; for (const dx of [-14, 14]) { c.beginPath(); c.ellipse(x + dx, y, 3, 6, 0, 0, TAU); c.fill() } }
    for (let k = 0; k < 60; k++) sprayCloud(c, R() * 1024, R() * 512, 6 + R() * 10, 'rgba(200,255,120,.9)');
    c.font = '900 46px "Arial Black",sans-serif'; c.fillStyle = 'rgba(200,255,120,.9)'; c.textAlign = 'left'; c.fillText('THE GARDEN IS WATCHING', 40, 70) },
  (c, R) => {   /* PLANET STACK - geometric */
    c.fillStyle = '#f4e8d8'; c.fillRect(0, 0, 1024, 512); for (let x = 0; x < 1024; x += 32) for (let y = 440; y < 512; y += 32) { c.fillStyle = ((x + y) / 32) % 2 ? '#14142a' : '#f4e8d8'; c.fillRect(x, y, 32, 32) }
    const P = [[200, 300, 120, '#ff4a6a'], [420, 220, 80, '#1a8ad8'], [600, 320, 140, '#ffd84a'], [820, 200, 90, '#2ab88a'], [700, 110, 40, '#c88aff']];
    P.forEach(([x, y, r, col], i) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.arc(x + r * .3, y, r, -Math.PI / 2, Math.PI / 2); c.fill(); if (i % 2 === 0) { c.strokeStyle = '#14142a'; c.lineWidth = 6; c.beginPath(); c.ellipse(x, y, r * 1.6, r * .3, -.25, 0, TAU); c.stroke() } });
    c.strokeStyle = '#14142a'; c.lineWidth = 4; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(40 + k * 18, 40); c.lineTo(40 + k * 18, 400); c.stroke() } c.fillStyle = '#ff4a6a'; c.beginPath(); c.moveTo(900, 420); c.lineTo(990, 420); c.lineTo(945, 330); c.fill();
    c.font = '900 64px "Arial Black",sans-serif'; c.fillStyle = '#14142a'; c.textAlign = 'right'; c.fillText('ORBIT', 1000, 80) },
  (c, R) => {   /* wheat-paste posters */
    concrete(c, R, 1024, 512, '#8a8a94'); const TXT = ['IGNORE GRAVITY', 'WE COME IN PEACE', 'LOST CAT · 3 TAILS', 'BASS NIGHT · LVL -2', 'ARE YOU A SIMULATION?', 'FREE HUGS (4 ARMS)'];
    for (let k = 0; k < 14; k++) { const x = (k % 7) * 146 + R() * 20, y = (k / 7 | 0) * 240 + 20 + R() * 20, w = 120 + R() * 30, h = 190 + R() * 20; c.save(); c.translate(x + w / 2, y + h / 2); c.rotate((R() - .5) * .12);
      c.fillStyle = ['#f4ead0', '#ffd84a', '#ff8ad8', '#e8e8e8', '#7ff0ff'][k % 5]; c.fillRect(-w / 2, -h / 2, w, h);
      c.fillStyle = '#14142a'; c.beginPath(); c.ellipse(0, -h * .12, w * .28, w * .36, 0, 0, TAU); c.fill(); c.fillStyle = c.strokeStyle = ['#f4ead0', '#ffd84a', '#ff8ad8', '#e8e8e8', '#7ff0ff'][k % 5]; c.beginPath(); c.ellipse(-w * .1, -h * .14, w * .07, w * .11, -.4, 0, TAU); c.fill(); c.beginPath(); c.ellipse(w * .1, -h * .14, w * .07, w * .11, .4, 0, TAU); c.fill();
      c.fillStyle = '#14142a'; c.font = '900 15px "Arial Black",sans-serif'; c.textAlign = 'center'; c.fillText(TXT[k % 6], 0, h * .36, w - 10);
      c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.moveTo(w / 2, -h / 2 + 30); c.lineTo(w / 2 - 26, -h / 2); c.lineTo(w / 2, -h / 2); c.fill(); c.restore() }
    tags(c, R, 30, 380, 500) }
];
const muralTex = sc => TX.mur || (TX.mur = cv(2048, 1536, c => MURALS.forEach((f, i) => { const R = rnd(901 + i * 17); c.save(); c.translate((i % 2) * 1024, (i / 2 | 0) * 512); c.beginPath(); c.rect(0, 0, 1024, 512); c.clip(); f(c, R); tags(c, R, 6, 470, 505); c.restore() }), sc));
/* loft facades: red brick, steel windows (some lit), fire-escape lines */
const loftTex = sc => TX.loft || (TX.loft = cv(1024, 256, (c) => { const R = rnd(555); c.fillStyle = '#6a3a30'; c.fillRect(0, 0, 1024, 256);
  for (let y = 0; y < 256; y += 8) for (let x = (y / 8) % 2 ? -8 : 0; x < 1024; x += 16) { c.fillStyle = 'rgba(' + (120 + R() * 50 | 0) + ',' + (60 + R() * 30 | 0) + ',' + (50 + R() * 20 | 0) + ',.9)'; c.fillRect(x + 1, y + 1, 14, 6) }
  for (let x = 30; x < 1000; x += 96) for (const y of [40, 140]) { c.fillStyle = '#2a2a30'; c.fillRect(x, y, 60, 62); const lit = R() < .45; c.fillStyle = lit ? 'rgba(255,200,120,.95)' : 'rgba(40,60,90,.95)'; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) c.fillRect(x + 4 + i * 19, y + 4 + j * 19, 16, 16); c.fillStyle = '#4a4a50'; c.fillRect(x - 4, y + 62, 68, 6) }
  c.strokeStyle = '#1a1a20'; c.lineWidth = 3; for (const fx of [300, 700]) { for (const y of [108, 208]) { c.strokeRect(fx - 50, y, 100, 4); for (let k = 0; k < 10; k++) { c.beginPath(); c.moveTo(fx - 50 + k * 11, y); c.lineTo(fx - 50 + k * 11, y - 26); c.stroke() } c.beginPath(); c.moveTo(fx - 50, y - 26); c.lineTo(fx + 50, y - 26); c.stroke() } c.beginPath(); c.moveTo(fx - 40, 208); c.lineTo(fx + 40, 112); c.stroke() }
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(0, 0, 1024, 10); tags(c, R, 18, 215, 252) }, sc));
/* Prism Gallery facade (13 x 6 m, faces the avenue): white concrete frame, two display windows, name, door cut out */
const galTex = sc => TX.gal || (TX.gal = cv(1024, 512, (c) => { const R = rnd(31); concrete(c, R, 1024, 512, '#ecebe6');
  const px = 1024 / 13, py = 512 / 6, d0 = (6.5 - 1.4) * px, d1 = (6.5 + 1.4) * px, dTop = 512 - 3.2 * py;
  for (const [x0, x1] of [[.5 * px, 4.7 * px], [8.3 * px, 12.5 * px]]) { c.fillStyle = '#2a2a30'; c.fillRect(x0 - 8, 150, x1 - x0 + 16, 300); const g = c.createLinearGradient(x0, 150, x1, 450); g.addColorStop(0, '#1a2a4a'); g.addColorStop(.5, '#2a3a5a'); g.addColorStop(1, '#0a1428'); c.fillStyle = g; c.fillRect(x0, 158, x1 - x0, 284);
    for (let k = 0; k < 2; k++) { const ax = x0 + 30 + k * (x1 - x0) / 2, aw = (x1 - x0) / 2 - 60; c.fillStyle = ['#ff4a6a', '#4ad8ff', '#ffd84a', '#c88aff'][(x0 > 400 ? 2 : 0) + k]; c.fillRect(ax, 210, aw, aw * .9); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(ax + aw * .2, 230, aw * .3, aw * .5) }
    c.fillStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.moveTo(x0, 158); c.lineTo(x0 + 80, 158); c.lineTo(x0 + 10, 442); c.lineTo(x0, 442); c.fill(); c.fillStyle = '#c8c8c0'; c.fillRect(x0 - 8, 442, x1 - x0 + 16, 10) }
  c.fillStyle = '#14142a'; c.fillRect(d0 - 14, dTop - 14, d1 - d0 + 28, 512 - dTop + 14);
  c.fillStyle = '#14142a'; c.font = '300 76px "Segoe UI Light","Helvetica Neue",Arial,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('P R I S M', 512, 62); c.font = '400 22px "Segoe UI",Arial,sans-serif'; c.fillText('GALLERY  ·  contemporary alien art', 512, 112);
  const rg = c.createLinearGradient(300, 0, 724, 0); ['#ff4a6a', '#ffd84a', '#7aff8a', '#4ad8ff', '#c88aff'].forEach((s, i) => rg.addColorStop(i / 4, s)); c.fillStyle = rg; c.fillRect(300, 128, 424, 5);
  c.fillStyle = '#14142a'; c.font = '600 18px "Segoe UI",Arial,sans-serif'; c.fillText('NOW SHOWING: NEW MOONS', 512, dTop - 34);
  c.globalCompositeOperation = 'destination-out'; c.fillRect(d0, dTop, d1 - d0, 512 - dTop); c.globalCompositeOperation = 'source-over' }, sc));
/* 8 gallery works (4 x 2 cells of 512) */
const ARTS = [
  (c, R) => { c.fillStyle = '#2a0a14'; c.fillRect(0, 0, 512, 512); [['#c81a3a', 40, 60, 330], ['#ff8a3a', 40, 250, 150], ['#4a0a2a', 40, 420, 60]].forEach(([col, x, y, h]) => { c.fillStyle = col; c.filter = 'blur(6px)'; c.fillRect(x, y - (h > 300 ? 20 : 0), 432, h * .55); c.filter = 'none' }) },
  (c, R) => { c.fillStyle = '#f4f0e6'; c.fillRect(0, 0, 512, 512); c.strokeStyle = '#14142a'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(120, 470); c.bezierCurveTo(100, 300, 160, 140, 256, 120); c.bezierCurveTo(360, 100, 420, 220, 380, 320); c.bezierCurveTo(350, 400, 260, 380, 250, 300); c.bezierCurveTo(240, 240, 300, 220, 320, 260); c.moveTo(190, 230); c.bezierCurveTo(200, 200, 230, 210, 220, 240); c.moveTo(256, 120); c.lineTo(230, 40); c.moveTo(300, 118); c.lineTo(340, 36); c.stroke(); c.fillStyle = '#ff4a6a'; c.beginPath(); c.arc(230, 40, 8, 0, TAU); c.arc(340, 36, 8, 0, TAU); c.fill() },
  (c, R) => { c.fillStyle = '#050314'; c.fillRect(0, 0, 512, 512); for (let i = 0; i < 5000; i++) { const a = R() * TAU, r = Math.pow(R(), .6) * 230, x = 256 + Math.cos(a) * r * (1 + .4 * Math.sin(a * 3)), y = 256 + Math.sin(a) * r * .7; c.fillStyle = 'hsla(' + (260 + r * .5 + R() * 40) + ',90%,' + (40 + R() * 40) + '%,.8)'; c.fillRect(x, y, 2.5, 2.5) } },
  (c, R) => { c.fillStyle = '#f4e8d8'; c.fillRect(0, 0, 512, 512); const C = ['#14142a', '#ff4a6a', '#1a8ad8', '#ffd84a', '#2ab88a']; for (let k = 0; k < 9; k++) { c.fillStyle = C[k % 5]; c.beginPath(); c.moveTo(R() * 512, R() * 512); c.lineTo(R() * 512, R() * 512); c.lineTo(R() * 512, R() * 512); c.closePath(); c.fill() } },
  (c, R) => { c.fillStyle = '#0a0a1a'; c.fillRect(0, 0, 512, 512); for (let k = 0; k < 8; k++) { const x = 96 + (k % 4) * 106, y = 170 + (k / 4 | 0) * 170; c.fillStyle = '#e8e8d8'; c.beginPath(); c.arc(x, y, 40, 0, TAU); c.fill(); c.fillStyle = '#0a0a1a'; c.beginPath(); c.arc(x + (k - 3.5) * 11, y, 40, 0, TAU); c.fill() } c.fillStyle = '#e8e8d8'; c.font = '300 22px "Segoe UI",sans-serif'; c.textAlign = 'center'; c.fillText('NEW MOONS', 256, 470) },
  (c, R) => { c.fillStyle = '#e8e0d0'; c.fillRect(0, 0, 512, 512); for (let k = 0; k < 18; k++) { c.strokeStyle = ['#14142a', '#c81a3a', '#1a4ab8', '#e8a82a'][k % 4]; c.lineWidth = 8 + R() * 30; c.lineCap = 'round'; c.globalAlpha = .75; c.beginPath(); c.moveTo(R() * 512, R() * 512); c.bezierCurveTo(R() * 512, R() * 512, R() * 512, R() * 512, R() * 512, R() * 512); c.stroke() } c.globalAlpha = 1 },
  (c, R) => { const n = 16, s = 512 / n; for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const on = Math.hypot(x - 7.5, y - 7.5) < 6 && ((x * 3 + y * 5) % 7 < 4); c.fillStyle = on ? ['#4ad8ff', '#ff4ad2', '#ffd84a'][(x + y) % 3] : (x + y) % 2 ? '#14142a' : '#1a1a34'; c.fillRect(x * s + 1, y * s + 1, s - 2, s - 2) } },
  (c, R) => { const g = c.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, '#ff8a5a'); g.addColorStop(1, '#4a1a5a'); c.fillStyle = g; c.fillRect(0, 0, 512, 512); c.fillStyle = '#ffe8b0'; c.beginPath(); c.arc(256, 300, 150, 0, TAU); c.fill(); c.fillStyle = '#14081e'; c.beginPath(); c.moveTo(120, 512); c.bezierCurveTo(140, 380, 200, 330, 256, 330); c.bezierCurveTo(312, 330, 372, 380, 392, 512); c.fill(); c.beginPath(); c.arc(256, 290, 62, 0, TAU); c.fill(); c.beginPath(); c.arc(196, 270, 22, 0, TAU); c.arc(316, 270, 22, 0, TAU); c.fill() }
];
const artTex = sc => TX.art || (TX.art = cv(2048, 1024, c => ARTS.forEach((f, i) => { c.save(); c.translate((i % 4) * 512, (i / 4 | 0) * 512); c.beginPath(); c.rect(0, 0, 512, 512); c.clip(); f(c, rnd(300 + i * 11)); c.restore() }), sc));
/* 8 exhibition banners (8 x 1 cells of 256 x 512) */
const BAN = [['PRISM', 'gallery', 'NEW MOONS', '#14142a', '#ffffff', '#ff4a6a'], ['LYX', 'living paint', 'AVENUE WALL', '#ff4ad2', '#14081e', '#ffd84a'], ['CINEMA 9', 'premiere', 'TONIGHT 21H', '#1a0a2a', '#ff4ad2', '#7ff0ff'], ['ORBIT', 'lounge', 'JAZZ NIGHTS', '#0a1a3a', '#7ff0ff', '#ffd84a'],
  ['SPRAY LAB', 'open wall', 'BRING A CAN', '#ffd84a', '#14142a', '#ff4a6a'], ['GLASSOPY', 'observatory', 'STAR NIGHT', '#050314', '#c88aff', '#ffffff'], ['ZERO-G', 'ceramics', 'POTS THAT FLOAT', '#e8e0d0', '#1a4ab8', '#c81a3a'], ['MURAL', 'alley', 'SHORTCUT →', '#14081e', '#7aff8a', '#ff8a3a']];
const banTex = sc => TX.ban || (TX.ban = cv(2048, 512, (c) => BAN.forEach(([a, b, d, bg, fg, ac], i) => { c.save(); c.translate(i * 256, 0); c.fillStyle = bg; c.fillRect(0, 0, 256, 512); c.fillStyle = ac; c.fillRect(0, 0, 256, 16); c.fillRect(0, 496, 256, 16);
  c.fillStyle = ac; c.globalAlpha = .9; if (i % 3 === 0) { c.beginPath(); c.arc(128, 330, 70, 0, TAU); c.fill() } else if (i % 3 === 1) { c.fillRect(40, 270, 176, 120) } else { c.beginPath(); c.moveTo(128, 250); c.lineTo(210, 400); c.lineTo(46, 400); c.fill() } c.globalAlpha = 1;
  c.fillStyle = fg; c.textAlign = 'center'; c.font = '900 ' + (a.length > 7 ? 34 : 46) + 'px "Arial Black",sans-serif'; c.fillText(a, 128, 90, 236); c.font = 'italic 26px Georgia,serif'; c.fillText(b, 128, 140, 236); c.font = '700 22px "Segoe UI",Arial,sans-serif'; c.fillText(d, 128, 460, 236); c.restore() }), sc));
/* signs (2 cells 1024 x 256): MURAL ALLEY from each end; Spray Lab shopfront (separate) */
const alleySignTex = sc => TX.asg || (TX.asg = cv(1024, 512, (c) => [['shortcut → Food Ring', '#7aff8a'], ['shortcut → Art Avenue', '#ff8ad8']].forEach(([s, col], i) => { c.save(); c.translate(0, i * 256); c.fillStyle = '#14081e'; c.fillRect(0, 0, 1024, 256); c.strokeStyle = col; c.lineWidth = 6; c.strokeRect(10, 10, 1004, 236);
  bubble(c, 'MURAL ALLEY', 512, 110, 92, ['#ffe84a', '#ff8a1a'], '#14081e', col); c.font = 'italic 34px "Segoe Print",cursive'; c.fillStyle = col; c.textAlign = 'center'; c.fillText(s, 512, 212); c.restore() }), sc));
const sprayTex = sc => TX.spr || (TX.spr = cv(1024, 768, (c) => { const R = rnd(77); concrete(c, R, 1024, 768, '#3a3a44');   /* 8.6 x 7 m */
  const px = 1024 / 8.6, py = 768 / 7; c.fillStyle = '#14142a'; c.fillRect(0, 0, 1024, 150); bubble(c, 'SPRAY LAB', 512, 70, 96, ['#7aff8a', '#1ad8c8'], '#14142a', '#ffd84a'); c.font = '600 28px "Segoe UI",Arial,sans-serif'; c.fillStyle = '#ffd84a'; c.textAlign = 'center'; c.fillText('PAINT · MARKERS · STENCILS · ZINES', 512, 128);
  const sx0 = 1 * px, sx1 = 7.6 * px, sTop = 768 - 3.4 * py; c.fillStyle = '#9a9aa4'; c.fillRect(sx0, sTop, sx1 - sx0, (768 - sTop) * .55); for (let y = sTop; y < sTop + (768 - sTop) * .55; y += 14) { c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(sx0, y, sx1 - sx0, 3) }   /* roll-up shutter, half open */
  c.save(); c.beginPath(); c.rect(sx0, sTop, sx1 - sx0, (768 - sTop) * .55); c.clip(); bubble(c, 'OPEN', 512, sTop + 80, 90, ['#ff4ad2', '#ff8a3a'], '#14142a', '#ffffff'); tags(c, R, 14, sTop, sTop + 170); c.restore();
  const gy = sTop + (768 - sTop) * .55; const g = c.createLinearGradient(0, gy, 0, 768); g.addColorStop(0, '#ffe8b0'); g.addColorStop(1, '#c89a6a'); c.fillStyle = g; c.fillRect(sx0, gy, sx1 - sx0, 768 - gy);   /* lit shop inside */
  for (let k = 0; k < 4; k++) for (let j = 0; j < 22; j++) { c.fillStyle = 'hsl(' + (j * 37 + k * 90) % 360 + ',85%,55%)'; c.fillRect(sx0 + 20 + j * 34, gy + 14 + k * 36, 20, 30); c.fillStyle = '#e8e8e8'; c.fillRect(sx0 + 24 + j * 34, gy + 8 + k * 36, 12, 8) }   /* shelves of cans */
  c.fillStyle = '#2a2a30'; c.fillRect(sx0 - 10, sTop - 10, 10, 768 - sTop + 10); c.fillRect(sx1, sTop - 10, 10, 768 - sTop + 10); c.fillRect(sx0 - 10, sTop - 10, sx1 - sx0 + 20, 10);
  tags(c, R, 30, 160, sTop - 20); for (let k = 0; k < 5; k++) sprayCloud(c, 80 + R() * 860, 200 + R() * 120, 40 + R() * 50, ['rgba(255,74,210,.45)', 'rgba(74,216,255,.45)', 'rgba(122,255,138,.4)'][k % 3]);
  c.font = 'italic 40px "Segoe Print",cursive'; c.fillStyle = '#fff'; c.textAlign = 'center'; c.fillText('ask about the open wall ↗', 512, sTop - 40) }, sc));
/* avenue paving: terrazzo with paint splatters (tiles 3.5 m, repeats) */
const terrTex = () => { if (TX.ter) return TX.ter; const t = cv(512, 512, (c) => { const R = rnd(4040); c.fillStyle = '#c8c0b8'; c.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2600; i++) { c.fillStyle = ['#8a7a6a', '#e8e0d8', '#5a5a6a', '#d88a6a', '#6a8aa8', '#f4ead0'][(R() * 6) | 0]; const x = R() * 512, y = R() * 512, s = 2 + R() * 6; c.beginPath(); c.moveTo(x, y); c.lineTo(x + s, y + R() * s); c.lineTo(x + R() * s, y + s); c.fill() }
  for (let k = 0; k < 7; k++) { const x = R() * 512, y = R() * 512, col = ['#ff4ad2', '#4ad8ff', '#ffd84a', '#7aff8a'][k % 4]; c.fillStyle = col; c.globalAlpha = .7; c.beginPath(); c.arc(x, y, 6 + R() * 14, 0, TAU); c.fill(); for (let j = 0; j < 12; j++) { const a = R() * TAU, r = 10 + R() * 40; c.beginPath(); c.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, 1 + R() * 4, 0, TAU); c.fill() } c.globalAlpha = 1 }
  c.strokeStyle = 'rgba(60,50,50,.6)'; c.lineWidth = 3; c.strokeRect(0, 0, 512, 512); c.strokeStyle = 'rgba(200,190,180,.8)'; c.lineWidth = 2; c.beginPath(); c.moveTo(256, 0); c.lineTo(256, 512); c.moveTo(0, 256); c.lineTo(512, 256); c.stroke() }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return TX.ter = t };
/* chalk drawings (2 cells 512, transparent) */
const chalkTex = () => TX.chk || (TX.chk = cv(1024, 512, (c) => { const R = rnd(66); c.clearRect(0, 0, 1024, 512); const chalk = (f, col) => { c.strokeStyle = col; c.lineCap = 'round'; for (let p = 0; p < 3; p++) { c.globalAlpha = .45; c.lineWidth = 5 + p * 2; c.beginPath(); f((R() - .5) * 3, (R() - .5) * 3); c.stroke() } c.globalAlpha = 1 };
  for (let k = 0; k < 8; k++) { const x = 256 + (k % 2 ? 50 : -50) * (k > 0 && k < 7 ? 1 : 0), y = 460 - k * 56; chalk((ox, oy) => c.arc(x + ox, y + oy, 26, 0, TAU), ['#ff8ad8', '#7ff0ff', '#ffd84a', '#7aff8a'][k % 4]); c.globalAlpha = .7; c.fillStyle = '#fff'; c.font = '700 26px "Segoe Print",cursive'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(k + 1), x, y); c.globalAlpha = 1 }
  c.save(); c.translate(512, 0); chalk((ox, oy) => { c.ellipse(256 + ox, 280 + oy, 150, 180, 0, 0, TAU) }, '#7aff8a'); chalk((ox, oy) => { c.ellipse(196 + ox, 250 + oy, 40, 60, -.3, 0, TAU); c.moveTo(356 + ox, 250); c.ellipse(316 + ox, 250 + oy, 40, 60, .3, 0, TAU) }, '#ffffff');
  chalk((ox, oy) => { c.moveTo(200 + ox, 120); c.lineTo(150, 30); c.moveTo(312 + ox, 120); c.lineTo(362, 30) }, '#7aff8a'); chalk((ox, oy) => c.arc(256 + ox, 370 + oy, 50, .15 * Math.PI, .85 * Math.PI), '#ff8ad8'); c.globalAlpha = .8; c.fillStyle = '#ffd84a'; c.font = '700 54px "Segoe Print",cursive'; c.textAlign = 'center'; c.fillText('HI!', 430, 80); c.restore() }));
/* the open tag wall: redrawn from the save */
const TAGW = { c: null, t: null };
const drawTags = () => { const c = TAGW.c.getContext('2d'), R = rnd(12); concrete(c, R, 512, 256, '#d8d4cc'); c.strokeStyle = '#14142a'; c.lineWidth = 4; c.strokeRect(4, 4, 504, 248); c.fillStyle = '#14142a'; c.font = '700 18px "Segoe UI",Arial,sans-serif'; c.textAlign = 'left'; c.fillText('OPEN WALL · add your tag', 14, 28);
  const list = (AV.S && AV.S.a9tags) || []; list.forEach((t, i) => { const r = rnd(1000 + i * 7 + t.n.length); c.save(); c.translate(40 + r() * 400, 70 + r() * 160); c.rotate((r() - .5) * .4); bubble(c, t.n, 0, 0, 28 + r() * 20, [t.c, '#ffffff'], '#14142a', t.c); c.restore() });
  if (!list.length) { c.globalAlpha = .5; bubble(c, 'your name here', 256, 140, 30, ['#bbbbbb', '#888888'], '#14142a', '#ffffff'); c.globalAlpha = 1 } TAGW.t.needsUpdate = true };

AR.build = function (ctx) {
  const K = AV.kit, q = ctx.q, grp = ctx.group, M = K.M, BG = K.BG, r = rnd(2626), sc = q === 0 ? .5 : 1;
  const solid = [], glow = [], floor = [], murals = [], lofts = [], galF = [], arts = [], bans = [], asg = [], sprF = [];
  const T = (x, z, rr, label, fn) => ctx.T.push({ x, z, r: rr, label, fn });
  const col = (x0, x1, z0, z1) => ctx.cols.push([x0, x1, z0, z1]), circ = (x, z, rr) => ctx.circles.push([x, z, rr]);
  const wall = (x0, x1, z0, z1, h, c, collide) => { solid.push([BG.box, c, M((x0 + x1) / 2, h / 2, (z0 + z1) / 2, x1 - x0, h, z1 - z0)]); if (collide !== false) col(x0, x1, z0, z1) };
  const pl = (arr, geo, x, y, z, ry) => arr.push([geo, 0xffffff, M(x, y, z, 1, 1, 1, 0, ry || 0, 0)]);

  /* ================= PRISM GALLERY ================= */
  { const [x0, x1, z0, z1] = GAL, H = 6, t = .4, dz = 126.5, dw = 1.4;
    wall(x0, x1, z0, z0 + t, H, 0xf4f2ee); wall(x0, x1, z1 - t, z1, H, 0xf4f2ee); wall(x0, x0 + t, z0, z1, H, 0xf4f2ee);
    wall(x1 - t, x1, z0, dz - dw, H, 0xf4f2ee); wall(x1 - t, x1, dz + dw, z1, H, 0xf4f2ee); solid.push([BG.box, 0xf4f2ee, M(x1 - t / 2, (3.2 + H) / 2, dz, t, H - 3.2, dw * 2)]);
    solid.push([BG.box, 0xe8e6e0, M((x0 + x1) / 2, H + .15, (z0 + z1) / 2, x1 - x0 + .6, .3, z1 - z0 + .6)], [BG.box, 0x2a2a30, M(x1 + .15, 3.35, dz, .3, .2, dw * 2 + .6)]);
    glow.push([BG.box, 0x7ff0ff, M(x1 + .32, H + .02, (z0 + z1) / 2, .06, .08, z1 - z0 + .6)]);
    pl(galF, cell(13, 6, 0, 1, 1), x1 + .02, 3, (z0 + z1) / 2, Math.PI / 2);
    floor.push([new THREE.PlaneGeometry(x1 - x0 - .8, z1 - z0 - .8), 0x34343c, M((x0 + x1) / 2, .02, (z0 + z1) / 2, 1, 1, 1, -Math.PI / 2, 0, 0)]);
    /* works: 3 on the north wall, 3 on the south wall, 2 on the west wall; black or oak frames + labels */
    const WK = [[-20, z0 + t + .03, 0, 2.6], [-15.5, z0 + t + .03, 0, 2.2], [-11, z0 + t + .03, 0, 2.6], [-20, z1 - t - .03, Math.PI, 2.4], [-15.5, z1 - t - .03, Math.PI, 2.8], [-11, z1 - t - .03, Math.PI, 2.2], [x0 + t + .03, 124, Math.PI / 2, 2.6], [x0 + t + .03, 129, Math.PI / 2, 2.6]];
    WK.forEach(([x, z, ry, s], i) => { const nx = Math.sin(ry), nz = Math.cos(ry); arts.push([cell(s, s, i, 4, 2), 0xffffff, M(x + nx * .06, 2.5, z + nz * .06, 1, 1, 1, 0, ry, 0)]);
      solid.push([BG.box, i % 3 ? 0x14141a : 0x8a6a3a, M(x + nx * .02, 2.5, z + nz * .02, Math.abs(nz) * (s + .2) + .04, s + .2, Math.abs(nx) * (s + .2) + .04)]);
      const lx = x + (Math.abs(nz) > .5 ? (s / 2 + .5) : 0), lz = z + (Math.abs(nx) > .5 ? (s / 2 + .5) : 0); solid.push([BG.box, 0xffffff, M(lx + nx * .02, 1.5, lz + nz * .02, Math.abs(nz) * .35 + .02, .22, Math.abs(nx) * .35 + .02)]);
      glow.push([BG.box, 0xfff4e0, M(x + nx * 1.2, 5.6, z + nz * 1.2, .25, .12, .25)]) });   /* ceiling spot over each work */
    for (const zz of [123, 130]) glow.push([BG.box, 0x2a2a30, M(-15.5, 5.75, zz, 15, .06, .08)]);   /* track rails */
    /* sculptures on plinths + bench */
    solid.push([BG.box, 0xffffff, M(-19.6, .55, 126.5, 1.1, 1.1, 1.1)], [new THREE.TorusKnotGeometry(.42, .13, 64, 8, 2, 3), 0xff4a6a, M(-19.6, 1.75, 126.5, 1, 1, 1, .3, 0, 0)]); circ(-19.6, 126.5, .85);
    solid.push([BG.box, 0xffffff, M(-11.5, .45, 124, .9, .9, .9)], [BG.oct, 0x7ff0ff, M(-11.5, 1.45, 124, .35, .6, .35)], [BG.oct, 0xc88aff, M(-11.3, 1.2, 124.25, .2, .35, .2, .3, 0, .4)]); circ(-11.5, 124, .75);
    solid.push([BG.box, 0xffffff, M(-11.5, .45, 129.2, .9, .9, .9)]); [.35, .27, .2, .14].forEach((rr, k) => solid.push([BG.sph, [0xffd84a, 0xff8a3a, 0x1a8ad8, 0x14142a][k], M(-11.5, .9 + rr + k * .5, 129.2, rr, rr, rr)])); circ(-11.5, 129.2, .75);
    solid.push([BG.box, 0x2a2a30, M(-16, .42, 126.5, 3, .1, .7)], [BG.box, 0x8a8a90, M(-17.2, .2, 126.5, .1, .4, .6)], [BG.box, 0x8a8a90, M(-14.8, .2, 126.5, .1, .4, .6)]); col(-17.5, -14.5, 126.15, 126.85);
    solid.push([BG.box, 0xffffff, M(-9.4, .5, 131.2, 2.2, 1, .7)], [BG.box, 0x14141a, M(-9.4, 1.02, 131.2, 2.3, .04, .8)]); col(-10.5, -8.3, 130.85, 131.55);   /* curator desk */
    const gl = new THREE.PointLight(0xfff0e0, 1.2, 22); gl.position.set(-15.5, 5, 126.5); grp.add(gl);
    T(-15.5, 121.9, 2, () => tr('🖼 Read the wall text: “New Moons”', '🖼 Leer el texto de sala: “Lunas Nuevas”'), () => AV.toast(AV.pick([tr('“New Moons: eight artists from five planets paint the night sky they grew up under.”', '“Lunas Nuevas: ocho artistas de cinco planetas pintan el cielo nocturno bajo el que crecieron.”'), tr('“Lot 3: pointillism, 5,000 dots, applied one per day by a very patient snail.”', '“Obra 3: puntillismo, 5.000 puntos, uno al día, por un caracol muy paciente.”')])));
    T(-19.6, 128.2, 1.8, () => tr('🗿 Walk around the sculpture', '🗿 Rodear la escultura'), () => AV.toast(tr('“Knot of Home”: from one side a heart, from the other an alien road map. The plaque says: no touching (it bites).', '“Nudo de Hogar”: de un lado un corazón, del otro un mapa alienígena. La placa dice: no tocar (muerde).')));
    T(-9.4, 130, 1.8, () => tr('🖼 Prism Gallery shop: prints & zines', '🖼 Tienda de la Galería Prisma: láminas y fanzines'), () => AV.shop && AV.shop.open({ id: 'a9_gallery', name: L('Prism Gallery shop', 'Tienda de la Galería Prisma'), greet: L('The curator adjusts three pairs of glasses: “Prints, zines. Originals by appointment, and by astrology.”', 'La comisaria se ajusta tres pares de gafas: “Láminas, fanzines. Originales con cita previa, y según los astros.”'), items: [['a9_print', 30], ['a9_zine', 9]] })) }

  /* ================= MURAL ALLEY ================= */
  { const H = 7;
    wall(7, 34, 120.6, 121, H, 0x6a3a30); wall(33.6, 34, 104, 121, H, 0x6a3a30); wall(40, 40.4, 104, 127.4, H, 0x6a3a30); wall(32, 40.4, 127, 127.4, H, 0x6a3a30);
    wall(SPR[0], SPR[1], SPR[2], SPR[3], H, 0x3a3a44); solid.push([BG.box, 0x2a2a30, M((SPR[0] + SPR[1]) / 2, H + .15, (SPR[2] + SPR[3]) / 2, SPR[1] - SPR[0] + .4, .3, SPR[3] - SPR[2] + .4)]);
    for (const [x, z, sx, sz] of [[20.5, 120.8, 27.4, .8], [33.8, 112.5, .8, 17.4], [40.2, 115.7, .8, 23.8], [36.2, 127.2, 8.8, .8]]) solid.push([BG.box, 0x3a2a28, M(x, H + .12, z, sx, .24, sz)]);   /* cornices */
    /* murals: inner faces */
    pl(murals, cell(13, 6.5, 0, 2, 3), 14, 3.45, 121.02, 0); pl(murals, cell(12, 6, 1, 2, 3), 27.5, 3.3, 121.02, 0);
    pl(murals, cell(14, 7, 2, 2, 3), 15, 3.5, 126.98, Math.PI); pl(murals, cell(14, 7, 3, 2, 3), 34.02, 3.5, 112.5, Math.PI / 2);
    pl(murals, cell(14, 7, 4, 2, 3), 39.98, 3.5, 112, -Math.PI / 2); pl(murals, cell(6, 3, 5, 2, 3), 39.98, 2.4, 124, -Math.PI / 2);
    /* loft facades: outer faces (seen from the plaza and the Food Ring) */
    pl(lofts, new THREE.PlaneGeometry(27, 7), 20.5, 3.5, 120.58, Math.PI); pl(lofts, new THREE.PlaneGeometry(17, 7), 33.58, 3.5, 112.5, -Math.PI / 2); pl(lofts, new THREE.PlaneGeometry(23.4, 7), 40.42, 3.5, 115.7, Math.PI / 2); pl(lofts, new THREE.PlaneGeometry(8.6, 7), SPR[1] + .02, 3.5, (SPR[2] + SPR[3]) / 2, Math.PI / 2);
    /* Spray Lab shopfront on the avenue + alley signs at both ends */
    pl(sprF, new THREE.PlaneGeometry(SPR[3] - SPR[2], 7), SPR[0] - .02, 3.5, (SPR[2] + SPR[3]) / 2, -Math.PI / 2);
    pl(asg, cell(6, 1.5, 0, 1, 2), 7.25, 5.9, 124, -Math.PI / 2); pl(asg, cell(6, 1.5, 1, 1, 2), 37, 5.9, 104.25, Math.PI);
    solid.push([BG.box, 0x2a2a30, M(7.3, 5.9, 124, .12, 1.7, 6.2)], [BG.box, 0x2a2a30, M(37, 5.9, 104.3, 6.2, 1.7, .12)]);
    floor.push([new THREE.PlaneGeometry(ALW[1] - ALW[0], ALW[3] - ALW[2]), 0x1a1a22, M((ALW[0] + ALW[1]) / 2, .02, (ALW[2] + ALW[3]) / 2, 1, 1, 1, -Math.PI / 2, 0, 0)], [new THREE.PlaneGeometry(ALN[1] - ALN[0], 121 - ALN[2]), 0x1a1a22, M((ALN[0] + ALN[1]) / 2, .02, (ALN[2] + 121) / 2, 1, 1, 1, -Math.PI / 2, 0, 0)]);
    for (const [x, z, w, d] of [[15, 124.5, 2.2, 1.2], [36.8, 110, 1.4, 2.6], [26, 122.6, 1.6, 1]]) floor.push([new THREE.CircleGeometry(.5, 16), 0x0a0a12, M(x, .03, z, w, d, 1, -Math.PI / 2, 0, 0)]);   /* puddles */
    /* pipes, AC units, bins, paint cans, a ladder */
    for (const [x, z, len, along] of [[20, 121.25, 27, 'x'], [39.75, 115, 22, 'z'], [34.25, 112, 16, 'z']]) for (const y of [5.6, 6.1]) solid.push([BG.cyl, 0x5a5a64, along === 'x' ? M(x, y, z, .12, len, .12, 0, 0, Math.PI / 2) : M(x, y, z, .12, len, .12, Math.PI / 2, 0, 0)]);
    for (const [x, z, ry] of [[12, 121.5, 0], [30, 126.5, Math.PI], [39.5, 107, -Math.PI / 2]]) { solid.push([BG.box, 0x8a8a94, M(x, 4.2, z, 1.2, .8, .6, 0, ry, 0)], [BG.cyl, 0x4a4a54, M(x, 4.2, z + (ry === Math.PI ? -.31 : ry ? 0 : .31), .3, .05, .3, Math.PI / 2, 0, 0)]) }
    for (const [x, z, c] of [[9.2, 126.2, 0x2a6a3a], [39.2, 120.2, 0x3a3a8a]]) { solid.push([BG.box, c, M(x, .65, z, 1.8, 1.3, 1.1)], [BG.box, 0x1a1a22, M(x, 1.33, z, 1.9, .06, 1.2)]); col(x - .95, x + .95, z - .6, z + .6) }
    for (let k = 0; k < 9; k++) { const x = 22 + (k % 3) * .3 + r() * .3, z = 121.5 + r() * .5; solid.push([BG.cyl, [0xff4ad2, 0x4ad8ff, 0xffd84a, 0x7aff8a][k % 4], M(x, .12, z, .07, .24, .07)]) }
    solid.push([BG.box, 0x8a6a3a, M(24.6, 1.4, 121.6, .06, 2.8, .06, -.12, 0, 0)], [BG.box, 0x8a6a3a, M(25.4, 1.4, 121.6, .06, 2.8, .06, -.12, 0, 0)]); for (let k = 0; k < 6; k++) solid.push([BG.box, 0x8a6a3a, M(25, .3 + k * .45, 121.55 + k * .05, .8, .05, .05)]); col(24.4, 25.6, 121, 122);
    /* the open tag wall */
    TAGW.c = document.createElement('canvas'); TAGW.c.width = 512; TAGW.c.height = 256; TAGW.t = new THREE.CanvasTexture(TAGW.c); TAGW.t.encoding = THREE.sRGBEncoding; drawTags();
    { const m = new THREE.MeshStandardMaterial({ map: TAGW.t, roughness: .9 }); m.userData.lin = 1; const tw = new THREE.Mesh(new THREE.PlaneGeometry(7, 3.5), m); tw.position.set(30.5, 2.2, 126.96); tw.rotation.y = Math.PI; grp.add(tw) }
    T(30.5, 125.6, 2, () => tr('🎨 Spray your tag on the open wall', '🎨 Pintar tu firma en el muro libre'), () => { const n = String((AV.S && (AV.S.name || AV.S.nick)) || tr('APE', 'MONO')).slice(0, 10).toUpperCase(), cols = ['#ff4ad2', '#4ad8ff', '#ffd84a', '#7aff8a', '#ff8a3a', '#c88aff']; AV.S.a9tags = (AV.S.a9tags || []).concat([{ n, c: cols[(Math.random() * 6) | 0] }]).slice(-10); drawTags(); AV.vitals && AV.vitals.add(0, 4); AV.toast(tr('Pssshhht. Your tag is on the wall. Nix gives you a nod.', 'Psssht. Tu firma está en el muro. Nix te saluda con la cabeza.')) });
    T(14, 122.4, 2, () => tr('🐋 Look at the mural “Dream Deep”', '🐋 Mirar el mural “Sueña Hondo”'), () => AV.toast(tr('A whale swimming through the stars. Painted overnight; the paint is still a little tacky.', 'Una ballena nadando entre estrellas. Pintada en una noche; la pintura aún está algo pegajosa.')));
    T(35.4, 112.5, 2, () => tr('🌿 Look at the mural “The Garden Is Watching”', '🌿 Mirar el mural “El Jardín Te Observa”'), () => AV.toast(tr('Count the eyes. Then count again. There is always one more.', 'Cuenta los ojos. Vuelve a contar. Siempre hay uno más.')));
    T(6.2, 131.3, 2, () => tr('🎨 Spray Lab: paint, markers, zines', '🎨 Spray Lab: pintura, rotuladores, fanzines'), () => AV.shop && AV.shop.open({ id: 'a9_spraylab', name: L('Spray Lab', 'Spray Lab'), greet: L('A teenager with paint up to the antennae: “Cosmic teal is back. Wall’s open round the corner.”', 'Una adolescente con pintura hasta las antenas: “Ha vuelto el verde cósmico. El muro libre está a la vuelta.”'), items: [['a9_spray', 12], ['a9_zine', 9]] }));
    /* string lights zig-zagging across the alley */
    const pts = [], bulbs = []; for (let x = 8, s = 0; x < 34; x += 3, s ^= 1) { const a = [x, 5.2, s ? 121.1 : 126.9], b = [x + 3, 5.2, s ? 126.9 : 121.1]; pts.push(...a, ...b); for (let k = 1; k < 4; k++) bulbs.push([a[0] + (b[0] - a[0]) * k / 4, 5.2 - Math.sin(k / 4 * Math.PI) * .45, a[2] + (b[2] - a[2]) * k / 4]) }
    for (let z = 106, s = 0; z < 121; z += 3, s ^= 1) { const a = [s ? 34.1 : 39.9, 5.2, z], b = [s ? 39.9 : 34.1, 5.2, z + 3]; pts.push(...a, ...b); for (let k = 1; k < 4; k++) bulbs.push([a[0] + (b[0] - a[0]) * k / 4, 5.2 - Math.sin(k / 4 * Math.PI) * .45, a[2] + (b[2] - a[2]) * k / 4]) }
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); grp.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0x1a1a1a })));
    bulbs.forEach(([x, y, z], i) => glow.push([BG.sph, [0xffd88a, 0xff8ad8, 0x7ff0ff][i % 3], M(x, y, z, .09, .12, .09)])) }

  /* ================= ART AVENUE street ================= */
  { const tm = new THREE.MeshStandardMaterial({ map: terrTex(), roughness: .55, metalness: .05 }); tm.userData.lin = 1; const tg = new THREE.PlaneGeometry(14, 81); const uv = tg.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k) * 14 / 3.5, uv.getY(k) * 81 / 3.5);
    const tf = new THREE.Mesh(tg, tm); tf.rotation.x = -Math.PI / 2; tf.position.set(0, .022, 119 + 40.5); tf.receiveShadow = true; grp.add(tf);
    /* gallery-spot lamp posts with exhibition banners */
    const LAMPS = [[-6.2, 136], [-6.2, 143], [-6.2, 161], [-6.2, 168.5], [-6.2, 196], [6.2, 140], [6.2, 160], [6.2, 168.5], [6.2, 196], [6.2, 118]];
    LAMPS.forEach(([x, z], i) => { const s = Math.sign(x); solid.push([BG.cyl, 0x2a2a34, M(x, 2.6, z, .09, 5.2, .09)], [BG.box, 0x2a2a34, M(x - s * .5, 5.1, z, 1.1, .07, .07)], [BG.cone, 0x2a2a34, M(x - s * 1, 4.85, z, .22, .35, .22, Math.PI, 0, 0)]); glow.push([BG.sph, 0xfff4e0, M(x - s * 1, 4.62, z, .14, .06, .14)]); circ(x, z, .2);
      if (i < BAN.length) bans.push([cell(.9, 1.9, i, 8, 1), 0xffffff, M(x - s * .45, 3.6, z, 1, 1, 1, 0, s > 0 ? -Math.PI / 2 : Math.PI / 2, 0)], [cell(.9, 1.9, i, 8, 1), 0xffffff, M(x - s * .45 + .01 * s, 3.6, z, 1, 1, 1, 0, s > 0 ? Math.PI / 2 : -Math.PI / 2, 0)]) });
    /* kinetic ring sculpture (west side, leaves the middle of the avenue free) */
    solid.push([BG.cyl, 0x2a2a34, M(-3.6, .3, 164.5, 1, .6, 1)], [BG.cyl, 0x8a90b0, M(-3.6, 1.6, 164.5, .06, 2.4, .06)]); circ(-3.6, 164.5, 1.1);
    AR.kin = new THREE.Group(); AR.kin.position.set(-3.6, 3.2, 164.5); grp.add(AR.kin); const km = new THREE.MeshStandardMaterial({ color: 0xd8dce8, metalness: .9, roughness: .2, emissive: 0x2a1a4a, emissiveIntensity: .4 });
    [[1.3, 0], [1, 1], [.7, 2]].forEach(([rr, k]) => { const m = new THREE.Mesh(new THREE.TorusGeometry(rr, .05, 6, 40), km); m.userData.k = k; AR.kin.add(m) });
    T(-2.2, 164.5, 2, () => tr('🌀 Kinetic sculpture “Three Orbits”', '🌀 Escultura cinética “Tres Órbitas”'), () => AV.toast(tr('Three rings, no motor. They turn with the street’s footsteps, says the plaque.', 'Tres anillos, sin motor. Giran con los pasos de la calle, dice la placa.')));
    /* chalk on the ground + an easel by the living paintings */
    const ch = new THREE.MeshBasicMaterial({ map: chalkTex(), transparent: true, depthWrite: false, opacity: .8, polygonOffset: true, polygonOffsetFactor: -2 }); const chalkM = new THREE.Mesh(K.merge([[cell(3.4, 3.4, 0, 2, 1), 0xffffff, M(3, .035, 141, 1, 1, 1, -Math.PI / 2, 0, 0)], [cell(4, 4, 1, 2, 1), 0xffffff, M(-1.6, .035, 193, 1, 1, 1, -Math.PI / 2, 0, 0)]]), ch); grp.add(chalkM);
    solid.push([BG.box, 0x8a6a3a, M(4.4, .9, 180, .05, 1.8, .05, .2, 0, 0)], [BG.box, 0x8a6a3a, M(4.4, .9, 180.6, .05, 1.8, .05, -.2, 0, 0)], [BG.box, 0x8a6a3a, M(4.8, .9, 180.3, .05, 1.8, .05, 0, 0, -.25)], [BG.box, 0xf4f0e6, M(4.38, 1.45, 180.3, .04, .9, .7)]); circ(4.5, 180.3, .5) }

  /* ================= merge ================= */
  const mat = o => { const m = new THREE.MeshStandardMaterial(Object.assign({ vertexColors: true }, o)); m.userData.lin = 1; return m };
  const tex = (parts, map, o) => { if (!parts.length) return; const m = new THREE.MeshStandardMaterial(Object.assign({ map, roughness: .85 }, o || {})); m.userData.lin = 1; grp.add(new THREE.Mesh(K.merge(parts), m)) };
  grp.add(new THREE.Mesh(K.merge(solid), mat({ roughness: .7, metalness: .1 })));
  { const gm = new THREE.MeshBasicMaterial({ vertexColors: true }); gm.userData.lin = 1; grp.add(new THREE.Mesh(K.merge(glow), gm)) }
  { const fm = mat({ roughness: .25, metalness: .35 }); const f = new THREE.Mesh(K.merge(floor), fm); f.receiveShadow = true; grp.add(f) }
  tex(murals, muralTex(sc), { roughness: .9 }); tex(lofts, loftTex(sc), { roughness: .95 }); tex(galF, galTex(sc), { alphaTest: .5, roughness: .6 }); tex(arts, artTex(sc), { roughness: .8 });
  tex(bans, banTex(sc), { side: THREE.DoubleSide, roughness: .9, emissive: 0x1a1a1a, emissiveIntensity: .3 }); tex(asg, alleySignTex(sc), { emissive: 0xffffff, emissiveMap: alleySignTex(sc), emissiveIntensity: .55 }); tex(sprF, sprayTex(sc), { roughness: .85 });

  /* ================= people: gallery curator + visitors, spray artist, painter, two conversations ================= */
  if (AV.beings && AV.beings.spawn) { const keep = AV.beings.list;
    const P = [{ kind: 'alien', x: -9.4, y: 0, z: 132.2, yaw: Math.PI / 2, mode: 'idle', name: 'Ostra (curator)', seed: 7101, lines: [L('Art is just a message that took the long way round.', 'El arte es solo un mensaje que tomó el camino largo.'), L('The pointillist one? A snail. I’m serious.', '¿El puntillista? Un caracol. Lo digo en serio.')] },
      { kind: 'alien', x: 24, y: 0, z: 122.6, mode: 'look', face: [24, 121], name: 'Nix (spray artist)', seed: 7102, lines: [L('The whale took one night and eleven cans.', 'La ballena me llevó una noche y once botes.'), L('Open wall’s round the corner. Leave your tag, I dare you.', 'El muro libre está a la vuelta. Deja tu firma, te reto.')] },
      { kind: 'human', x: -2.5, y: 0, z: 138, mode: 'chat', face: [-1.2, 139.3], seed: 7103 }, { kind: 'alien', x: -1.2, y: 0, z: 139.3, mode: 'chat', face: [-2.5, 138], seed: 7104 },
      { kind: 'ape', x: 3.4, y: 0, z: 180.3, mode: 'look', face: [4.4, 180.3], name: 'Lyx (painter)', seed: 7105, lines: [L('My paintings paint back. Stand still and they’ll do you.', 'Mis cuadros pintan de vuelta. Quédate quieto y te retratan.')] },
      { kind: 'human', x: -18.6, y: 0, z: 122.4, mode: 'look', face: [-20, 120.4], seed: 7106 }, { kind: 'alien', x: -13.4, y: 0, z: 130.4, mode: 'look', face: [-11, 132.6], seed: 7107 },
      { kind: 'ape', x: 2.6, y: 0, z: 196.5, mode: 'chat', face: [3.8, 195.6], seed: 7108 }, { kind: 'alien', x: 3.8, y: 0, z: 195.6, mode: 'chat', face: [2.6, 196.5], seed: 7109 }];
    const n = [5, 7, 9][q]; try { AV.beings.spawn(ctx, P.slice(0, n)); AV.beings.list = (keep || []).concat(AV.beings.list || []) } catch (e) { AV.beings.list = keep } }

  /* ================= animation: sculpture rings, spray mist ================= */
  const sprayN = 14, sg = new THREE.BufferGeometry(), sp = new Float32Array(sprayN * 3); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const sprayPts = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0x7ff0ff, size: .12, transparent: true, opacity: .7, depthWrite: false })); sprayPts.frustumCulled = false; grp.add(sprayPts);
  let burst = 0;
  ctx.upd.push((dt, t) => { const P = AV.P; if (Math.abs(P.x - 8) > 90 || Math.abs(P.z - 150) > 90) return;
    if (AR.kin) AR.kin.children.forEach(m => { const k = m.userData.k; m.rotation.set(t * (.3 + k * .17), t * (.2 - k * .11), k * .7) });
    burst = (t % 5) < 2.2; sprayPts.visible = burst; if (burst) for (let i = 0; i < sprayN; i++) { const f = ((t * 1.7 + i / sprayN) % 1); sp[i * 3] = 24.25 + Math.sin(i * 7.3 + t * 3) * .25 * f; sp[i * 3 + 1] = 1.75 + Math.cos(i * 3.1) * .2 * f; sp[i * 3 + 2] = 122.2 - f * 1.1 } sg.attributes.position.needsUpdate = true });
  AR.fx = { murals: murals.length, lofts: lofts.length, works: arts.length, banners: bans.length / 2, lamps: 10, people: AV.beings ? [5, 7, 9][q] : 0 };
  return { places: [{ id: 'ar_gallery', name: L('Prism Gallery', 'Galería Prisma'), x: -9, z: 126.5, yaw: -Math.PI / 2 }, { id: 'ar_alley', name: L('Mural Alley', 'Callejón de los Murales'), x: 9, z: 124, yaw: Math.PI / 2 }] };
};
})(window.AV);
