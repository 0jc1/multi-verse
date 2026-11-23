/* APEVERSE - astro9_neon.js : Cinematic V1, Astro-9 hero street. NEON BOULEVARD rebuilt as a continuous 170 m cyberpunk alien street.
   Cross-section (north -> south): building line z 84 · 6 m sidewalk · 10 m hover lane (two directions, median studs + planter islands,
   light-strip crossings) · 6 m sidewalk · building line z 106. Hover cars fly the lane at 3.4 m; pedestrians keep to the sidewalks.
   FRONTAGE: ~16 street buildings in five architectural families, each with its own canvas facade texture + emissive window map:
     industrial (gunmetal panels, vents, pipes)   organic (bio-concrete, mosaic bands, round towers, Gaudi caps)
     crystal (dark curtain glass, cyan mullions, fins)   dense (stacked megastructure, balconies, AC units, cables)   ceramic (white tile, copper fins)
   Every building: recessed shopfront (lit interior view), canopy with a light strip, a unique framed shop sign (16-sign atlas, each in
   its own design language, alien glyph script + English), setbacks, roof gear / alien gardens, corner neon.
   ENTERABLE: Tech Market, Synth & Strings, Comet Ramen, Robot Repair (rooms with counters, shelves, a clerk; the existing buy
   interactions are moved inside) + the Black Market alley (a real 6 m side alley with a stall).
   Other street life: animated holo-adverts, cables with lanterns across the street, alien planters, lamps, vending machines, benches.
   AV.astro9neon = { surface, reserve, build(ctx) }. astro9_mega/astro9_more switch their old Neon Boulevard pieces off when present. */
'use strict';
(function (AV) {
const tr = AV.tr, TAU = Math.PI * 2, L = (e, s) => [e, s];
const NB = AV.astro9neon = {};
const Z0 = 84, Z1 = 106, X0 = 92, X1 = 262, D = 16;   /* boulevard + lot depth */
const ALLEY = [196, 202, 72, 84];                       /* Black Market side alley (north) */
const ENTER = { tech: { side: 'n', at: 120 }, synth: { side: 'n', at: 160 }, ramen: { side: 's', at: 112 }, robot: { side: 's', at: 240 } };
const rooms = [];                                        /* walkable interior rects, filled at build */
const inR = (x, z, r, p) => x >= r[0] - (p || 0) && x <= r[1] + (p || 0) && z >= r[2] - (p || 0) && z <= r[3] + (p || 0);
NB.surface = (x, z) => (inR(x, z, ALLEY) || rooms.some(r => inR(x, z, r))) ? 0 : null;
NB.reserve = (x, z, p) => x > X0 - 2 - p && x < X1 + 2 + p && ((z > Z0 - D - p && z < Z0 + 1) || (z > Z1 - 1 && z < Z1 + D + p));
/* ---------------- textures ---------------- */
const TX = {};
const cv = (w, h, f, rep) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; return t };
const rnd = s => { let x = s; return () => (x = (x * 16807) % 2147483647) / 2147483647 };
/* alien glyph script: geometric strokes from a seeded alphabet (no real-world letters) */
function glyphs(c, txt, x, y, size, col, seed) { const r = rnd(seed || 7); c.save(); c.strokeStyle = col; c.lineWidth = Math.max(2, size * .12); c.lineCap = 'round'; c.shadowColor = col; c.shadowBlur = size * .4;
  for (let i = 0; i < txt.length; i++) { const ch = txt.charCodeAt(i), gx = x + i * size * .9, rr = rnd(ch * 31 + (seed || 1)); c.beginPath();
    const n = 2 + (ch % 3); for (let k = 0; k < n; k++) { const a = rr() * TAU, ax = gx + Math.cos(a) * size * .35, ay = y + Math.sin(a) * size * .4; if (k === 0) c.moveTo(ax, ay); else if (rr() < .4) c.arc(gx, y, size * (.15 + rr() * .2), a, a + 2); else c.lineTo(ax, ay) }
    c.stroke(); if (ch % 2) { c.beginPath(); c.arc(gx, y - size * .45, size * .06, 0, TAU); c.fillStyle = col; c.fill() } }
  c.restore(); void r }
/* facade families: map (albedo) + emissive (lit windows / light lines); a 512 px tile = 8 m */
const FAM = ['industrial', 'organic', 'crystal', 'dense', 'ceramic'];
function facade(fam) { if (TX['f' + fam]) return TX['f' + fam];
  const r = rnd(fam.length * 911), S = 512, win = [];
  const map = cv(S, S, (c) => {
    const base = { industrial: '#4e525c', organic: '#d9cdb4', crystal: '#1e2836', dense: '#5a5650', ceramic: '#e8e6e0' }[fam]; c.fillStyle = base; c.fillRect(0, 0, S, S);
    for (let i = 0; i < 6000; i++) { c.fillStyle = 'rgba(' + (r() < .5 ? '0,0,0' : '255,255,255') + ',' + (r() * .05).toFixed(3) + ')'; c.fillRect(r() * S, r() * S, 1 + r() * 3, 1 + r() * 3) }
    if (fam === 'industrial') { c.strokeStyle = 'rgba(0,0,0,.55)'; c.lineWidth = 3; for (let y = 0; y <= S; y += 64) { c.beginPath(); c.moveTo(0, y); c.lineTo(S, y); c.stroke() } for (let x = 0; x <= S; x += 128) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, S); c.stroke() }
      c.fillStyle = 'rgba(200,200,210,.5)'; for (let y = 8; y < S; y += 64) for (let x = 8; x < S; x += 32) c.fillRect(x, y, 3, 3);
      for (let y = 0; y < S; y += 128) for (let x = 0; x < S; x += 128) { if (r() < .55) { win.push([x + 20, y + 34, 88, 40]); c.fillStyle = '#0c0e12'; c.fillRect(x + 20, y + 34, 88, 40); c.fillStyle = '#5a5e66'; for (let k = 0; k < 6; k++) c.fillRect(x + 20, y + 36 + k * 7, 88, 2) } else { c.fillStyle = '#2a2c30'; c.fillRect(x + 30, y + 80, 68, 30); c.fillStyle = '#1a1c20'; for (let k = 0; k < 7; k++) c.fillRect(x + 32 + k * 9, y + 82, 5, 26) } }
      for (let i = 0; i < 18; i++) { const x = r() * S, g = c.createLinearGradient(0, 0, 0, 160); g.addColorStop(0, 'rgba(120,70,30,.35)'); g.addColorStop(1, 'rgba(120,70,30,0)'); c.fillStyle = g; c.fillRect(x, r() * S, 4, 160) } }
    else if (fam === 'organic') { for (let y = 0; y < S; y += 128) { c.fillStyle = '#c8b898'; c.fillRect(0, y + 100, S, 10); for (let x = 0; x < S; x += 12) { c.fillStyle = ['#2a9a9a', '#e86a8a', '#e8c84a', '#4a7ac8', '#f4f0e8'][(x / 12 + y / 128 * 3) % 5 | 0]; c.fillRect(x, y + 112, 10, 10) }
        for (let x = 0; x < S; x += 128) { win.push([x + 34, y + 20, 60, 70]); c.fillStyle = '#1a1410'; c.beginPath(); c.moveTo(x + 34, y + 90); c.lineTo(x + 34, y + 50); c.quadraticCurveTo(x + 64, y + 4, x + 94, y + 50); c.lineTo(x + 94, y + 90); c.fill(); c.strokeStyle = '#a89878'; c.lineWidth = 5; c.stroke() } } }
    else if (fam === 'crystal') { for (let y = 0; y < S; y += 32) for (let x = 0; x < S; x += 64) { const g = c.createLinearGradient(x, y, x + 64, y + 32); g.addColorStop(0, '#1c2838'); g.addColorStop(1, '#0a1018'); c.fillStyle = g; c.fillRect(x + 2, y + 2, 60, 28); if (r() < .35) win.push([x + 4, y + 4, 56, 24]) }
      c.fillStyle = '#4ad8ff'; for (let x = 0; x <= S; x += 64) c.fillRect(x, 0, 2, S) }
    else if (fam === 'dense') { for (let y = 0; y < S; y += 64) { c.fillStyle = '#3e3a36'; c.fillRect(0, y + 54, S, 10); for (let x = 0; x < S; x += 64) { const w = 40 + r() * 14; win.push([x + 6, y + 10, w, 36]); c.fillStyle = '#16140f'; c.fillRect(x + 6, y + 10, w, 36); c.strokeStyle = '#8a8478'; c.lineWidth = 2; c.strokeRect(x + 6, y + 10, w, 36); if (r() < .4) { c.fillStyle = '#d8d6d0'; c.fillRect(x + 8, y + 40, 24, 12) } if (r() < .3) { c.strokeStyle = '#2a2a2a'; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(x + 6 + k * 12, y + 10); c.lineTo(x + 6 + k * 12, y + 46); c.stroke() } } } }
      for (let i = 0; i < 30; i++) { const x = r() * S, y = r() * S; c.fillStyle = ['#ff4ad2', '#4ad8ff', '#ffd84a'][i % 3]; c.globalAlpha = .5; c.fillRect(x, y, 3 + r() * 20, 3); c.globalAlpha = 1 } }
    else { for (let y = 0; y < S; y += 16) for (let x = 0; x < S; x += 32) { c.fillStyle = r() < .1 ? '#d8d4cc' : '#efede8'; c.fillRect(x + 1 + ((y / 16) % 2) * 16, y + 1, 30, 14) } for (let y = 0; y < S; y += 128) for (let x = 0; x < S; x += 64) { win.push([x + 12, y + 30, 40, 70]); c.fillStyle = '#20242a'; c.fillRect(x + 12, y + 30, 40, 70); c.fillStyle = '#b87a3a'; c.fillRect(x + 8, y + 26, 4, 78); c.fillRect(x + 52, y + 26, 4, 78) } }
  }, true);
  const em = cv(S, S, (c) => { c.fillStyle = '#000'; c.fillRect(0, 0, S, S); const r2 = rnd(fam.length * 37);
    const cols = { industrial: ['#ffb86a', '#ff8a3a', '#ffd8a0'], organic: ['#ffd8a0', '#ff9ad8', '#9affd8'], crystal: ['#4ad8ff', '#9ae8ff', '#ff4ad2'], dense: ['#ffd8a0', '#ff4ad2', '#4ad8ff', '#7aff8a'], ceramic: ['#fff0d0', '#ffd8a0'] }[fam];
    for (const [x, y, w, h] of win) { if (r2() < .42) continue; c.fillStyle = cols[(r2() * cols.length) | 0]; c.globalAlpha = .45 + r2() * .55; c.fillRect(x + 2, y + 2, w - 4, h - 4); c.globalAlpha = 1 }
    if (fam === 'crystal') { c.fillStyle = 'rgba(74,216,255,.8)'; for (let x = 0; x <= S; x += 64) c.fillRect(x, 0, 2, S) }
    if (fam === 'industrial') { c.fillStyle = 'rgba(255,140,40,.9)'; for (let y = 60; y < S; y += 128) c.fillRect(0, y, S, 2) } }, true);
  return TX['f' + fam] = { map, em } }
/* 16 unique shop signs (4 x 4 cells of 512 x 256), each its own design language */
const SIGNS = [
  ['TECH MARKET', 'chips · bots · holo-gear', 'holo', '#4ad8ff', '#06121c'], ['SYNTH & STRINGS', 'instruments from 40 worlds', 'gold', '#ffd84a', '#1c1206'],
  ['COMET RAMEN', 'noodles · broth · open late', 'tube', '#ff8a3a', '#140806'], ['ROBOT REPAIR', 'servos · oil · tune-ups', 'stencil', '#1a1a1a', '#e8c81a'],
  ['ORBITAL OPTICS', 'lenses for every eye count', 'ceramic', '#2a4a8a', '#f2f0ea'], ['XENO GENETICS', 'clinic · symbiotes', 'clinic', '#1ac8a8', '#e8f6f2'],
  ['VOID ARCADE', 'free play · no real money', 'pixel', '#ff4ad2', '#0a0614'], ['GRAV-BOOTS', 'walk on any ceiling', 'chrome', '#c8d0e0', '#20242c'],
  ['HOLO INK', 'light tattoos · removable', 'tube', '#ff4ad2', '#100818'], ['DATA BATHS', 'float · forget · reboot', 'ripple', '#4a8aff', '#06101e'],
  ['MOON PAWN', 'we buy relics', 'gold', '#e8b830', '#1a0e04'], ['SPORE CAFÉ', 'mushroom tea · fungal toast', 'bio', '#7aff8a', '#0a2414'],
  ['HAB UNITS', 'capsule homes to let', 'ceramic', '#8a3a2a', '#efe8dc'], ['SKY TAXI', 'any district · any time', 'transit', '#ffffff', '#0a3a8a'],
  ['NEBULA NAILS', 'twelve fingers? no problem', 'tube', '#c88aff', '#120818'], ['CARGO 9', 'freight · lockers · couriers', 'stencil', '#f2f0ea', '#2a4a3a']];
function signAtlas() { return TX.signs || (TX.signs = cv(2048, 1024, (c) => {
  SIGNS.forEach(([t, sub, sty, fg, bg], i) => { const X = (i % 4) * 512, Y = (i / 4 | 0) * 256, W = 512, H = 256; c.save(); c.translate(X, Y); c.beginPath(); c.rect(0, 0, W, H); c.clip(); c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = bg; c.fillRect(0, 0, W, H);
    const big = (f, col, y, glow) => { c.font = f; c.shadowColor = col; c.shadowBlur = glow || 0; c.fillStyle = col; c.fillText(t, W / 2, y, W - 40); c.shadowBlur = 0 };
    if (sty === 'holo') { for (let y = 0; y < H; y += 6) { c.fillStyle = 'rgba(74,216,255,.08)'; c.fillRect(0, y, W, 2) } c.strokeStyle = fg; c.lineWidth = 4; c.strokeRect(10, 10, W - 20, H - 20); for (const [x, y] of [[10, 10], [W - 10, 10], [10, H - 10], [W - 10, H - 10]]) { c.fillStyle = fg; c.fillRect(x - 8, y - 8, 16, 16) } glyphs(c, 'TCHMRKT', 120, 52, 30, fg, 3); big('bold 62px "Segoe UI",Arial,sans-serif', '#ffffff', 128, 18) }
    else if (sty === 'gold') { c.strokeStyle = fg; c.lineWidth = 3; c.strokeRect(14, 14, W - 28, H - 28); c.strokeRect(22, 22, W - 44, H - 44); glyphs(c, 'SYNTHSTR', 110, 54, 28, fg, 9); big('italic bold 56px Georgia,"Times New Roman",serif', fg, 132, 10) }
    else if (sty === 'tube') { c.lineWidth = 6; c.strokeStyle = fg; c.shadowColor = fg; c.shadowBlur = 20; c.beginPath(); c.moveTo(40, 30); c.arcTo(W - 20, 30, W - 20, H - 20, 30); c.arcTo(W - 20, H - 30, 20, H - 30, 30); c.arcTo(20, H - 30, 20, 20, 30); c.arcTo(20, 30, W - 20, 30, 30); c.stroke(); c.shadowBlur = 0;
      if (t === 'COMET RAMEN') { c.strokeStyle = '#ffd84a'; c.lineWidth = 5; c.beginPath(); c.arc(78, 120, 34, 0, Math.PI); c.stroke(); for (const k of [-12, 0, 12]) { c.beginPath(); c.moveTo(78 + k, 96); c.bezierCurveTo(70 + k, 80, 86 + k, 70, 78 + k, 56); c.stroke() } }
      big('bold 58px "Segoe Script","Brush Script MT",cursive', '#ffffff', 112, 24); c.lineWidth = 2; c.strokeStyle = fg; c.font = 'bold 58px "Segoe Script","Brush Script MT",cursive'; c.strokeText(t, W / 2, 112, W - 40); glyphs(c, t.slice(0, 6), 170, 200, 22, fg, 11) }
    else if (sty === 'stencil') { for (let x = -H; x < W; x += 40) { c.fillStyle = 'rgba(0,0,0,.85)'; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 20, 0); c.lineTo(x + 20 + H, H); c.lineTo(x + H, H); c.fill() } c.fillStyle = bg; c.fillRect(24, 50, W - 48, H - 100); c.font = 'bold 60px "Courier New",monospace'; c.fillStyle = fg; c.fillText(t, W / 2, H / 2 + 2, W - 60);
      c.strokeStyle = fg; c.lineWidth = 6; c.beginPath(); c.arc(56, H / 2, 20, 0, TAU); c.stroke(); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; c.fillStyle = fg; c.fillRect(56 + Math.cos(a) * 24 - 4, H / 2 + Math.sin(a) * 24 - 4, 8, 8) } }
    else if (sty === 'ceramic') { c.fillStyle = '#d8d2c6'; for (let y = 0; y < H; y += 32) for (let x = 0; x < W; x += 32) c.fillRect(x + 31, y, 1, 32); for (let y = 0; y < H; y += 32) c.fillRect(0, y + 31, W, 1); c.fillStyle = fg; c.fillRect(30, 40, W - 60, 6); c.fillRect(30, H - 46, W - 60, 6); big('300 52px "Segoe UI Light","Segoe UI",Arial,sans-serif', fg, 118); glyphs(c, t.slice(0, 7), 150, 70, 18, fg, 5) }
    else if (sty === 'clinic') { c.fillStyle = fg; c.beginPath(); c.arc(70, H / 2, 46, 0, TAU); c.fill(); c.strokeStyle = bg; c.lineWidth = 10; c.beginPath(); c.moveTo(70, H / 2 - 28); c.lineTo(70, H / 2 + 28); c.moveTo(42, H / 2); c.lineTo(98, H / 2); c.stroke(); c.textAlign = 'left'; c.font = 'bold 44px "Segoe UI",Arial,sans-serif'; c.fillStyle = '#0e3a34'; c.fillText(t, 136, 112, W - 150); c.textAlign = 'center' }
    else if (sty === 'pixel') { for (let y = 0; y < H; y += 8) for (let x = 0; x < W; x += 8) { if ((x * 7 + y * 13) % 97 < 6) { c.fillStyle = ['#4ad8ff', '#ff4ad2', '#ffd84a'][(x + y) % 3]; c.fillRect(x, y, 7, 7) } } big('bold 70px "Courier New",monospace', fg, 116, 16) }
    else if (sty === 'chrome') { const g = c.createLinearGradient(0, 70, 0, 170); g.addColorStop(0, '#ffffff'); g.addColorStop(.5, '#7a8494'); g.addColorStop(.55, '#2a3040'); g.addColorStop(1, '#c8d0e0'); c.font = 'italic bold 72px "Arial Black",Impact,sans-serif'; c.fillStyle = g; c.fillText(t, W / 2, 118, W - 40); c.strokeStyle = '#4ad8ff'; c.lineWidth = 2; c.strokeText(t, W / 2, 118, W - 40) }
    else if (sty === 'ripple') { for (let k = 1; k < 8; k++) { c.strokeStyle = 'rgba(74,138,255,' + (.6 - k * .07) + ')'; c.lineWidth = 3; c.beginPath(); c.ellipse(W / 2, H / 2, k * 40, k * 14, 0, 0, TAU); c.stroke() } big('bold 60px "Segoe UI",Arial,sans-serif', '#e8f0ff', 112, 22) }
    else if (sty === 'bio') { c.fillStyle = '#1a5a2a'; c.beginPath(); for (let a = 0; a <= TAU + .01; a += .15) { const rr = 1 + .1 * Math.sin(a * 6); c.lineTo(W / 2 + Math.cos(a) * (W / 2 - 30) * rr, H / 2 + Math.sin(a) * (H / 2 - 30) * rr) } c.fill(); for (let k = 0; k < 20; k++) { c.fillStyle = 'rgba(160,255,160,.4)'; c.beginPath(); c.arc(40 + (k * 97) % (W - 80), 30 + (k * 53) % (H - 60), 4 + k % 5 * 2, 0, TAU); c.fill() } big('italic bold 56px Georgia,serif', fg, 116, 20) }
    else { c.fillStyle = fg; c.beginPath(); c.arc(64, H / 2, 40, 0, TAU); c.fill(); c.fillStyle = bg; c.font = 'bold 44px Arial'; c.fillText('⇄', 64, H / 2 + 2); c.textAlign = 'left'; c.font = 'bold 58px "Segoe UI",Arial,sans-serif'; c.fillStyle = fg; c.fillText(t, 124, 110, W - 140); c.textAlign = 'center' }
    c.font = '22px "Segoe UI",Arial,sans-serif'; c.fillStyle = sty === 'ceramic' || sty === 'clinic' ? '#3a3a3a' : 'rgba(255,255,255,.85)'; c.fillText(sub, W / 2, H - 30, W - 60);
    for (let k = 0; k < 400; k++) { c.fillStyle = 'rgba(0,0,0,' + (Math.random() * .08).toFixed(3) + ')'; c.fillRect(Math.random() * W, Math.random() * H, 2, 2) }   /* grime */
    c.restore() }) }, false)) }
/* lit shop interiors seen through the glass (4 x 4 cells) */
function shopAtlas() { return TX.shops || (TX.shops = cv(2048, 1024, (c) => { const r = rnd(55);
  for (let i = 0; i < 16; i++) { const X = (i % 4) * 512, Y = (i / 4 | 0) * 256, W = 512, H = 256, [, , , fg] = SIGNS[i]; c.save(); c.translate(X, Y); c.beginPath(); c.rect(0, 0, W, H); c.clip();
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a2438'); g.addColorStop(.6, '#141020'); g.addColorStop(1, '#0a0810'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.fillStyle = fg; c.globalAlpha = .55; c.fillRect(0, 12, W, 6); c.globalAlpha = 1;
    for (let s = 0; s < 3; s++) { c.fillStyle = '#3a3448'; c.fillRect(20, 60 + s * 50, W - 40, 5); for (let k = 0; k < 16; k++) { c.fillStyle = ['#4ad8ff', '#ff4ad2', '#ffd84a', '#7aff8a', '#c88aff', '#ffffff'][(k + s + i) % 6]; c.globalAlpha = .4 + r() * .6; const w = 10 + r() * 14; c.fillRect(26 + k * 29, 60 + s * 50 - 6 - r() * 18, w, 6 + r() * 18) } c.globalAlpha = 1 }
    c.fillStyle = '#1a1624'; c.fillRect(W * .3, H - 70, W * .4, 70); c.fillStyle = fg; c.fillRect(W * .3, H - 72, W * .4, 3);
    c.fillStyle = 'rgba(20,10,30,.9)'; c.beginPath(); c.ellipse(W * .5, H - 96, 14, 18, 0, 0, TAU); c.fill(); c.fillRect(W * .5 - 16, H - 82, 32, 14);   /* a clerk silhouette */
    const gl = c.createLinearGradient(0, 0, W, H); gl.addColorStop(0, 'rgba(255,255,255,.12)'); gl.addColorStop(.4, 'rgba(255,255,255,0)'); c.fillStyle = gl; c.fillRect(0, 0, W, H);
    c.restore() } }, false)) }
/* vertical blade signs (8 cells of 256 x 1024): stacked alien glyphs + an English word running down the side */
const BLADES = [['NOODLES', '#ff8a3a', '#1a0a04'], ['REPAIR', '#e8c81a', '#141414'], ['HOTEL', '#4ad8ff', '#04101c'], ['ARCADE', '#ff4ad2', '#12041a'], ['CLINIC', '#1ac8a8', '#04140f'], ['KARAOKE', '#c88aff', '#0e0618'], ['PAWN', '#ffd84a', '#1a1204'], ['TAXI', '#ffffff', '#0a2a6a']];
function bladeAtlas() { return TX.blades || (TX.blades = cv(2048, 1024, (c) => {
  BLADES.forEach(([word, fg, bg], i) => { const X = i * 256, W = 256, H = 1024; c.save(); c.translate(X, 0); c.beginPath(); c.rect(0, 0, W, H); c.clip();
    c.fillStyle = bg; c.fillRect(0, 0, W, H); c.strokeStyle = fg; c.lineWidth = 8; c.shadowColor = fg; c.shadowBlur = 18; c.strokeRect(14, 14, W - 28, H - 28); c.shadowBlur = 0;
    for (let k = 0; k < 6; k++) glyphs(c, word.charAt(k % word.length) + 'x', W * .38, 110 + k * 140, 64, fg, i * 13 + k);
    c.save(); c.translate(W * .8, H / 2); c.rotate(Math.PI / 2); c.font = 'bold 44px "Segoe UI",Arial,sans-serif'; c.fillStyle = '#ffffff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = fg; c.shadowBlur = 10; c.fillText(word.split('').join(' '), 0, 0, H - 80); c.restore();
    for (let k = 0; k < 300; k++) { c.fillStyle = 'rgba(0,0,0,' + (Math.random() * .1).toFixed(3) + ')'; c.fillRect(Math.random() * W, Math.random() * H, 2, 2) }
    c.restore() }) }, false)) }
const paveTex = () => TX.pave || (TX.pave = cv(512, 512, (c) => { const r = rnd(4); c.fillStyle = '#2a2836'; c.fillRect(0, 0, 512, 512); const S = 64, h = S * Math.sqrt(3) / 2;
  for (let y = -1; y < 9; y++) for (let x = -1; x < 9; x++) { const cx = x * S * .75 * 1.333 + (y % 2) * S * .5, cy = y * h * 1.15; c.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; c.lineTo(cx + Math.cos(a) * S * .48, cy + Math.sin(a) * S * .48) } c.closePath(); c.fillStyle = 'rgb(' + (52 + r() * 14 | 0) + ',' + (50 + r() * 12 | 0) + ',' + (64 + r() * 14 | 0) + ')'; c.fill(); c.strokeStyle = '#16141c'; c.lineWidth = 3; c.stroke() }
  for (let i = 0; i < 4000; i++) { c.fillStyle = 'rgba(0,0,0,' + (r() * .12).toFixed(3) + ')'; c.fillRect(r() * 512, r() * 512, 2, 2) } }, true));
const roadTex = () => TX.road || (TX.road = cv(256, 512, (c) => { const r = rnd(8); c.fillStyle = '#16151c'; c.fillRect(0, 0, 256, 512); for (let i = 0; i < 5000; i++) { c.fillStyle = 'rgba(' + (r() < .5 ? '0,0,0' : '90,90,110') + ',.25)'; c.fillRect(r() * 256, r() * 512, 2, 2) }
  for (let i = 0; i < 8; i++) { c.fillStyle = 'rgba(40,40,60,.5)'; c.beginPath(); c.ellipse(r() * 256, r() * 512, 20 + r() * 40, 8 + r() * 16, r() * 3, 0, TAU); c.fill() } }, true));
function holoAd(text, sub, c1, c2) { const cvs = document.createElement('canvas'); cvs.width = 256; cvs.height = 512; const g = cvs.getContext('2d'), t = new THREE.CanvasTexture(cvs); t.encoding = THREE.sRGBEncoding;
  return { t, draw(time) { const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.fillRect(0, 0, 256, 512); g.globalAlpha = .18; for (let y = (time * 80) % 8; y < 512; y += 8) { g.fillStyle = '#fff'; g.fillRect(0, y, 256, 2) } g.globalAlpha = 1;
    g.save(); g.translate(128, 200); g.rotate(Math.sin(time * .8) * .05); g.font = 'bold 54px "Arial Black",Impact,sans-serif'; g.textAlign = 'center'; g.shadowColor = '#fff'; g.shadowBlur = 16; g.fillStyle = '#fff'; text.split(' ').forEach((w, i) => g.fillText(w, 0, i * 58 - 30, 236)); g.restore();
    glyphs(g, text.replace(/ /g, '').slice(0, 5), 60, 360, 22, '#ffffff', 21); g.font = '20px Arial'; g.textAlign = 'center'; g.fillStyle = 'rgba(255,255,255,.9)'; g.fillText(sub, 128, 450, 236); t.needsUpdate = true } } }
/* a box whose UVs are in world units (tile T metres), so facade textures keep their scale on every building */
function ubox(w, h, d, T) { const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]]; for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) { const k = f * 4 + i; uv.setXY(k, uv.getX(k) * dims[f][0] / T, uv.getY(k) * dims[f][1] / T) } return g }
function ucyl(rad, h, T) { const g = new THREE.CylinderGeometry(rad, rad, h, 20, 1), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * TAU * rad / T, uv.getY(i) * h / T); return g }
function cellPlane(w, h, i, cols, rows) { const g = new THREE.PlaneGeometry(w, h), uv = g.attributes.uv, u0 = (i % cols) / cols, v1 = 1 - (i / cols | 0) / rows; for (let k = 0; k < uv.count; k++) uv.setXY(k, u0 + uv.getX(k) / cols, v1 - (1 - uv.getY(k)) / rows); return g }

NB.build = function (ctx) {
  const K = AV.kit, q = ctx.q, grp = ctx.group, M = K.M, BG = K.BG, rng = rnd(9090);
  const T = (x, z, r, label, fn) => { const t = { x, z, r, label, fn }; ctx.T.push(t); return t };
  const famParts = FAM.map(() => []), trim = [], glow = [], signs = [], shops = [], street = [], roadP = [], plants = [];
  const mat = (o) => { const m = new THREE.MeshStandardMaterial(Object.assign({ vertexColors: true }, o)); m.userData.lin = 1; return m };
  const NEO = [0xff4ad2, 0x4ad8ff, 0xffd84a, 0x7aff8a, 0xc88aff, 0xff8a3a];
  /* ---------- street: sidewalks (hex pavers), hover lane (wet dark asphalt), kerbs, studs, crossings ---------- */
  const len = X1 - X0, cx = (X0 + X1) / 2;
  const plane = (arr, x0, x1, z0, z1, y, T2) => { const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0); g.rotateX(-Math.PI / 2); const uv = g.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k) * (x1 - x0) / T2, uv.getY(k) * (z1 - z0) / T2); arr.push([g, 0xffffff, M((x0 + x1) / 2, y, (z0 + z1) / 2, 1, 1, 1)]) };
  plane(street, X0, X1, Z0, 90, .02, 6); plane(street, X0, X1, 100, Z1, .02, 6); plane(street, ALLEY[0], ALLEY[1], ALLEY[2], Z0, .02, 6);
  plane(roadP, X0, X1, 90, 100, .015, 12);
  for (const z of [90, 100]) { trim.push([BG.box, 0x8a8a9a, M(cx, .07, z, len, .14, .3)]); glow.push([BG.box, 0x4ad8ff, M(cx, .145, z + (z === 90 ? .16 : -.16), len, .015, .04)]) }
  for (let x = X0 + 2; x < X1; x += 4) glow.push([BG.box, (x / 4 | 0) % 2 ? 0xffd84a : 0xffd84a, M(x, .03, 95, 1.6, .02, .14)]);   /* median studs */
  for (const xc of [125, 175, 235]) for (let k = 0; k < 8; k++) glow.push([BG.box, 0xffffff, M(xc, .028, 90.9 + k * 1.18, 3.2, .01, .55)]);   /* light-strip crossings */
  for (let x = X0 + 14; x < X1 - 8; x += 38) { trim.push([BG.cyl, 0x2a2a34, M(x, .3, 95, 1.3, .6, 1.3)]); plants.push([x, 95, 1]); ctx.circles.push([x, 95, 1.4]) }   /* median planter islands */
  for (let x = X0 + 24; x < X1 - 10; x += 20) for (const [z, dir] of [[92.4, 1], [97.6, -1]]) for (const s2 of [-1, 1]) glow.push([BG.box, 0x4ad8ff, M(x + dir * .5, .035, z + s2 * .55, 1.3, .015, .16, 0, s2 * dir * .6, 0), 1]);   /* lane chevrons (direction of travel) */
  for (const z of [89.55, 100.45]) for (let x = X0 + 1; x < X1 - 1; x += .6) trim.push([BG.box, 0xc8a83a, M(x, .03, z, .4, .02, .4)]);   /* tactile paving along the kerbs */
  for (const x of [133, 221]) for (const z of [89.0, 101.0]) { trim.push([BG.box, 0x1a1820, M(x, .02, z, 1.4, .04, 1.0)]); trim.push([BG.cyl, 0x3a2a3a, M(x, 1.2, z, .14, 2.4, .14)]); plants.push([x, z, 1.6, 2.2]); ctx.circles.push([x, z, .45]) }   /* alien trees in kerbside pits */
  /* ---------- buildings ---------- */
  const lots = []; { const W = [14, 18, 12, 16, 20, 13, 15, 17, 12, 16, 14, 19];
    const NOBUILD = { n: [[ALLEY[0], ALLEY[1]]], s: [[130, 150], [172, 188]] };   /* alley, Club Subterra facade, Biotech path */
    for (const side of ['n', 's']) { let x = X0 + 4, i = side === 'n' ? 0 : 5; while (x < X1 - 8) { let w = W[i++ % W.length]; if (x + w > X1 - 2) w = X1 - 2 - x;
        const hit = NOBUILD[side].find(f => x < f[1] && x + w > f[0]); if (hit) { if (hit[0] - x >= 8) w = hit[0] - x; else { x = hit[1]; continue } }
        if (w >= 8) lots.push({ side, x0: x, x1: x + w }); x += w } } }
  const named = {}; for (const k in ENTER) { const e = ENTER[k], lot = lots.find(l => l.side === e.side && l.x0 <= e.at && l.x1 >= e.at); if (lot) { lot.enter = k; named[k] = lot } }
  const SIGNOF = { tech: 0, synth: 1, ramen: 2, robot: 3 }; let free = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], fi = 0;
  const interiorLights = [];
  lots.forEach((lot, li) => {
    const { side, x0, x1 } = lot, Lw = x1 - x0, zf = side === 'n' ? Z0 : Z1, s = side === 'n' ? -1 : 1, nz = -s, fam = li % 5, si = lot.enter ? SIGNOF[lot.enter] : free[fi++ % free.length];
    const W = (u, v) => [x0 + u, zf + s * v], F = famParts[fam];
    const nearSky = x1 > 205 && x0 < 255 && side === 'n';
    const H1 = nearSky ? 10 : 16 + (rng() * 22 | 0), H2 = nearSky ? 0 : (rng() < .7 ? H1 + 6 + (rng() * 18 | 0) : 0), PD = 5;
    /* podium (ground floor): recessed 0.8 m; enterable lots get a real room instead of a solid body */
    const box = (arr, col, u0, u1, y0, y1, v0, v1, T2, gl) => { const [ax, az] = W((u0 + u1) / 2, (v0 + v1) / 2), w = u1 - u0, h = y1 - y0, d = Math.abs(v1 - v0); arr.push([T2 ? ubox(w, h, d, T2) : BG.box, col, T2 ? M(ax, (y0 + y1) / 2, az, 1, 1, 1) : M(ax, (y0 + y1) / 2, az, w, h, d), gl || 0]) };
    const pil = 0x2a2a30;
    box(trim, pil, 0, .5, 0, PD, 0, D, 0); box(trim, pil, Lw - .5, Lw, 0, PD, 0, D, 0);   /* party walls / pilasters */
    box(trim, 0x1e1e26, .5, Lw - .5, 4.1, PD, 0, D, 0);   /* fascia slab */
    if (!lot.enter) { box(F, 0xffffff, .5, Lw - .5, 0, 4.1, .8, D, 8); ctx.cols.push(side === 'n' ? [x0, x1, zf - D, zf] : [x0, x1, zf, zf + D]) }
    /* shopfront glass with a lit interior view (enterable: door gap in the middle) */
    const gw = Lw - 1.2, door = lot.enter ? 2.8 : 0;
    const glassPanel = (u0, u1) => { if (u1 - u0 < .3) return; const g = cellPlane(u1 - u0, 3.5, si, 4, 4), [ax, az] = W((u0 + u1) / 2, .8); shops.push([g, 0xffffff, M(ax, 2.05, az, 1, 1, 1, 0, side === 'n' ? 0 : Math.PI, 0)]); trim.push([BG.box, 0x9aa0b0, M(ax, .15, az, u1 - u0, .3, .12)]) };
    if (door) { glassPanel(.6, Lw / 2 - door / 2); glassPanel(Lw / 2 + door / 2, Lw - .6); for (const u of [Lw / 2 - door / 2, Lw / 2 + door / 2]) { box(trim, 0x6a7080, u - .1, u + .1, 0, 3.9, .7, .9, 0); box(glow, NEO[li % 6], u - .03, u + .03, .2, 3.8, .65, .7, 0, 1) } box(glow, NEO[li % 6], Lw / 2 - door / 2, Lw / 2 + door / 2, 3.85, 3.92, .65, .9, 0, 1) }
    else glassPanel(.6, Lw - .6);
    for (let u = 2.2; u < Lw - 1; u += 3) if (!door || Math.abs(u - Lw / 2) > door / 2 + .3) box(trim, 0x6a7080, u - .05, u + .05, .3, 3.8, .78, .86, 0);   /* mullions */
    /* canopy with a light strip + the framed shop sign above it */
    { const [ax, az] = W(Lw / 2, -.6); trim.push([BG.box, 0x24242c, M(ax, 4.0, az, Lw - .8, .14, 2.8, side === 'n' ? -.08 : .08, 0, 0)]); const [bx, bz] = W(Lw / 2, -1.95); glow.push([BG.box, NEO[(li + 2) % 6], M(bx, 3.92, bz, Lw - .9, .05, .08), 1]) }
    { const sw = Math.min(Lw - 1.6, 7), sh = sw / 2, [ax, az] = W(Lw / 2, -.12); trim.push([BG.box, 0x16161c, M(ax, PD + .3 + sh / 2, az, sw + .3, sh + .3, .16)]); const [bx, bz] = W(Lw / 2, -.22); signs.push([cellPlane(sw, sh, si, 4, 4), 0xffffff, M(bx, PD + .3 + sh / 2, bz, 1, 1, 1, 0, side === 'n' ? 0 : Math.PI, 0)]);
      for (const u of [Lw / 2 - sw / 2 + .3, Lw / 2 + sw / 2 - .3]) box(trim, 0x3a3a44, u - .06, u + .06, PD, PD + .4, -.3, .2, 0) }
    /* ---- storefront identity for the named shops (each its own architecture, not just a sign) ---- */
    { const Q = (arr, g, col, u, y, v, sx, sy, sz, rx, ry, rz, gl) => { const [px, pz] = W(u, v); arr.push([g, col, M(px, y, pz, sx, sy, sz, rx || 0, ry || 0, rz || 0), gl || 0]) }, mid = Lw / 2, cornerU = li % 2 ? 1.7 : Lw - 1.7, fy = side === 'n' ? 0 : Math.PI;
      if (lot.enter === 'ramen') {
        for (let u = 1; u < Lw - .8; u += .5) box(trim, 0x6a3a1e, u - .2, u + .2, 4.12, 4.95, -.06, .04, 0);   /* timber slats on the fascia */
        for (let k = -2; k <= 2; k++) { const u = mid + k * .56; Q(trim, BG.box, k % 2 ? 0x7a1010 : 0x8a1a14, u, 3.25, .55, .5, 1.25, .03); Q(glow, BG.sph, 0xffffff, u, 3.35, .53, .07, .07, .02, 0, 0, 0, 1) }   /* noren curtains over the door */
        for (let u = .9; u < Lw - .6; u += .95) { Q(trim, BG.cyl, 0x1a1a1a, u, 3.75, -1.9, .015, .3, .015); Q(glow, BG.sph, 0xff4a2a, u, 3.45, -1.9, .2, .27, .2, 0, 0, 0, 1) }   /* lantern row under the canopy */
        Q(trim, BG.hem || BG.sph, 0xf4ece0, mid, 4.7, -1.0, 1.15, .75, 1.15, Math.PI, 0, 0); Q(trim, BG.cyl, 0xc83a2a, mid, 4.7, -1.0, 1.17, .06, 1.17); Q(glow, BG.cyl, 0xffb84a, mid, 4.68, -1.0, 1.05, .02, 1.05, 0, 0, 0, 1);   /* 3D ramen bowl sign */
        for (const s2 of [-1, 1]) Q(trim, BG.box, 0x3a2410, mid + s2 * .25, 5.4, -1.0, .06, 1.7, .06, 0, 0, s2 * .3);
        for (let k = 0; k < 6; k++) Q(glow, BG.box, 0xffe8b0, mid - .55 + k * .22, 4.95, -1.0 + (k % 2) * .2, .05, .5, .05, 0, 0, (k - 2.5) * .12, 1);
        (lot.steam = lot.steam || []).push(W(mid, -1.0).concat(5.1)) }
      if (lot.enter === 'tech') {   /* holographic portal frame around the door + a floating gadget */
        const d2 = 1.6; for (const u of [mid - d2, mid + d2]) box(glow, 0x4ad8ff, u - .09, u + .09, 0, 4.0, -.15, .05, 0, 1); box(glow, 0x4ad8ff, mid - d2, mid + d2, 3.92, 4.08, -.15, .05, 0, 1);
        for (let k = 0; k < 4; k++) box(glow, 0x9ae8ff, mid - d2 + .3, mid + d2 - .3, .6 + k * .85, .63 + k * .85, -.12, -.08, 0, 1);
        Q(glow, BG.oct || BG.sph, 0x4ad8ff, cornerU, 6.6, -.6, .5, .8, .5, 0, .6, 0, 1); Q(trim, BG.cyl, 0x2a2a34, cornerU, 5.6, -.6, .05, 1.6, .05) }
      if (lot.enter === 'synth') {   /* giant neon guitar outline up the facade + speaker-grill panels beside the door */
        const gu = cornerU, gy = 7.6; for (const [r0, dy] of [[.95, 0], [.72, 1.35]]) Q(glow, new THREE.TorusGeometry(1, .06, 6, 28), 0xffd84a, gu, gy + dy, -.25, r0, r0 * 1.15, 1, 0, fy, 0, 1);
        Q(glow, BG.box, 0xffd84a, gu, gy + 3.0, -.25, .14, 2.6, .05, 0, 0, 0, 1); Q(glow, BG.box, 0xff4ad2, gu, gy + 4.4, -.25, .34, .5, .05, 0, 0, 0, 1); Q(glow, BG.cyl, 0xff4ad2, gu, gy + .1, -.25, .28, .05, .28, Math.PI / 2, 0, 0, 1);
        for (const s2 of [-1, 1]) { const u = mid + s2 * 2.6; box(trim, 0x141418, u - .5, u + .5, .4, 3.4, -.1, .1, 0); for (let k = 0; k < 6; k++) box(trim, 0x2a2a30, u - .42, u + .42, .55 + k * .48, .65 + k * .48, -.14, -.1, 0) } }
      if (lot.enter === 'robot') {   /* half-raised garage shutter with hazard stripes + a 3D gear */
        box(trim, 0x8a8a90, .7, Lw - .7, 3.05, 3.95, .6, .75, 0); for (let u = .8; u < Lw - .7; u += .7) box(trim, (u / .7 | 0) % 2 ? 0x1a1a1a : 0xe8c81a, u, u + .35, 2.9, 3.05, .55, .7, 0);
        const gu = cornerU; Q(glow, new THREE.TorusGeometry(1, .22, 6, 24), 0xe8c81a, gu, 7.2, -.3, .9, .9, 1, 0, fy, 0, 1); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; Q(glow, BG.box, 0xe8c81a, gu + Math.cos(a) * 1.15, 7.2 + Math.sin(a) * 1.15, -.3, .3, .3, .15, 0, 0, a, 1) } } }
    /* ---- every building: an uplight strip above the shopfront ---- */
    box(glow, NEO[(li + 4) % 6], .5, Lw - .5, PD + .02, PD + .08, -.08, .02, 0, 1);
    /* tower masses: family-specific silhouettes, world-scaled facade texture, corner neon */
    const tD = D - 1, setb = 2.2;
    if (fam === 1) {   /* organic: round bio-concrete tower + mosaic cap + an arch */
      const rad = Math.min(Lw, tD) / 2 - .4, [ax, az] = W(Lw / 2, tD / 2 + .5); F.push([ucyl(rad, H1 - PD, 8), 0xffffff, M(ax, (PD + H1) / 2, az, 1, 1, 1)]); trim.push([BG.hem || BG.sph, 0xd8c8a8, M(ax, H1, az, rad * 1.02, rad * .7, rad * 1.02)]); glow.push([BG.cyl, 0x7affd8, M(ax, H1 - .2, az, rad * 1.03, .12, rad * 1.03), 1]);
      if (H2) { F.push([ucyl(rad * .6, H2 - H1, 8), 0xffffff, M(ax, (H1 + H2) / 2, az, 1, 1, 1)]); trim.push([BG.hem || BG.sph, 0xe8a8c8, M(ax, H2, az, rad * .62, rad * .5, rad * .62)]) } }
    else {
      box(F, 0xffffff, .3, Lw - .3, PD, H1, .2, tD, 8); if (H2) box(F, 0xffffff, .3 + setb * .5, Lw - .3 - setb * .5, H1, H2, setb, tD - 1, 8);
      for (let y = PD + 4.5; y < H1 - 1; y += 4.5) box(trim, 0x2a2a34, .15, Lw - .15, y, y + .2, -.32, .3, 0);   /* floor ledges give the facade rhythm */
      box(glow, NEO[(li + 1) % 6], .25, Lw - .25, H1 - .06, H1 + .06, -.05, .25, 0, 1); if (H2) box(glow, NEO[(li + 3) % 6], .3 + setb * .5, Lw - .3 - setb * .5, H2 - .06, H2 + .06, setb - .05, setb + .2, 0, 1);   /* neon rooflines */
      for (const u of [.25, Lw - .25]) box(glow, NEO[(li + (u > 1 ? 1 : 0)) % 6], u - .06, u + .06, PD, H1, .1, .3, 0, 1);
      if (fam === 0) { for (let k = 0; k < 3; k++) box(trim, 0x5a5e66, 1 + k * .7, 1.4 + k * .7, PD, H1, -.25, .15, 0); for (let y = PD + 3; y < H1 - 1; y += 6) box(trim, 0x4a4e56, Lw * .6, Lw * .6 + 1.4, y, y + .8, -.35, .2, 0) }   /* pipes + vent boxes */
      if (fam === 2) for (let u = 1.5; u < Lw - 1; u += 2.2) box(trim, 0x8ae8ff, u - .05, u + .05, PD, H1, -.5, .2, 0);   /* crystal fins */
      if (fam === 3) for (let y = PD + 3.2; y < H1 - 1; y += 3.2) { if (rng() < .5) box(trim, 0x6a6660, 1, Lw * .5, y, y + .12, -1.2, .2, 0); if (rng() < .5) box(trim, 0xd8d6d0, Lw - 2.2, Lw - 1.2, y + .2, y + .8, -.5, .2, 0) }   /* balconies + AC units */
      if (fam === 4) for (let u = 1; u < Lw - .5; u += 1.6) box(trim, 0xb87a3a, u - .04, u + .04, PD + 1, H1 - 1, -.4, .2, 0);   /* copper fins */
      const top = H2 || H1;
      if (rng() < .6) { box(trim, 0x6a6a74, Lw * .3, Lw * .3 + 2, top, top + 1.6, tD * .4, tD * .4 + 2, 0); box(trim, 0x8a8a94, Lw * .7, Lw * .7 + .1, top, top + 5, tD * .5, tD * .5 + .1, 0); box(glow, 0xff4a4a, Lw * .7 - .1, Lw * .7 + .2, top + 5, top + 5.3, tD * .5 - .1, tD * .5 + .2, 0, 1) }
      if (H2) for (let k = 0; k < 4; k++) { const [px, pz] = W(1.5 + k * (Lw - 3) / 3, 1.2); plants.push([px, pz, .8, H1]) }   /* setback garden */
    }
    /* enterable room */
    if (lot.enter) {
      const zA = side === 'n' ? zf - D + 1 : zf, zB = side === 'n' ? zf : zf + D - 1,   /* includes the 0.8 m shopfront recess so the doorway is walkable */ r = [x0 + .6, x1 - .6, Math.min(zA, zB), Math.max(zA, zB)]; rooms.push(r);
      const inner = 0x2a2634; box(trim, inner, .5, .7, 0, 4.1, .9, D - .8, 0); box(trim, inner, Lw - .7, Lw - .5, 0, 4.1, .9, D - .8, 0); box(trim, inner, .5, Lw - .5, 0, 4.1, D - 1, D - .8, 0);
      ctx.cols.push(side === 'n' ? [x0, x0 + .7, zf - D, zf - .9] : [x0, x0 + .7, zf + .9, zf + D], side === 'n' ? [x1 - .7, x1, zf - D, zf - .9] : [x1 - .7, x1, zf + .9, zf + D], side === 'n' ? [x0, x1, zf - D, zf - D + .95] : [x0, x1, zf + D - .95, zf + D]);
      const gl = (Lw - door) / 2 - .6; ctx.cols.push(side === 'n' ? [x0 + .5, x0 + .6 + gl, zf - .95, zf - .65] : [x0 + .5, x0 + .6 + gl, zf + .65, zf + .95], side === 'n' ? [x1 - .6 - gl, x1 - .5, zf - .95, zf - .65] : [x1 - .6 - gl, x1 - .5, zf + .65, zf + .95]);
      plane(street, x0 + .6, x1 - .6, r[2], r[3], .025, 3);
      const cv2 = 4.6; box(trim, 0x1a1824, 2.2, Lw - 2.2, 0, 1.05, cv2, cv2 + .8, 0); box(glow, NEO[li % 6], 2.2, Lw - 2.2, 1.04, 1.1, cv2, cv2 + .06, 0, 1);   /* counter */
      { const [ax, az] = W(Lw / 2, cv2 + .4); ctx.cols.push([ax - (Lw - 4.4) / 2, ax + (Lw - 4.4) / 2, az - .45, az + .45]) }
      const kind = lot.enter, P3 = (arr, g, col, u, y, v, sx, sy, sz, rx, ry, rz, gl) => { const [px, pz] = W(u, v); arr.push([g, col, M(px, y, pz, sx, sy, sz, rx || 0, ry || 0, rz || 0), gl || 0]) }, mid = Lw / 2;
      lot.customers = lot.customers || []; lot.steam = lot.steam || []; lot.sparks = lot.sparks || [];
      if (kind !== 'synth' && kind !== 'robot') for (let k = 0; k < 3; k++) { box(trim, 0x34303e, 1, Lw - 1, .8 + k * 1, .86 + k * 1, D - 2.2, D - 1.1, 0); for (let j = 0; j < Math.floor(Lw - 2); j++) box(glow, NEO[(j + k + li) % 6], 1.3 + j, 1.7 + j, .9 + k, 1.25 + k, D - 1.9, D - 1.5, 0, 1) }   /* glowing shelves */
      if (kind === 'ramen') {   /* noodle bar: stools along the counter, bowls, pots, paper lanterns, menu board, two seated diners */
        for (let u = 2.8; u < Lw - 2.6; u += 1.25) { if (Math.abs(u - mid) < 1.1) continue; P3(trim, BG.cyl, 0x8a2a1a, u, .72, cv2 - .55, .26, .08, .26); P3(trim, BG.cyl, 0x2a2a2a, u, .36, cv2 - .55, .05, .72, .05); const [sx, sz] = W(u, cv2 - .55); ctx.circles.push([sx, sz, .3]); if (lot.customers.length < 2 && (u < mid - 2 || u > mid + 2)) lot.customers.push([sx, sz, side === 'n' ? Math.PI : 0, .72]) }
        for (let u = 3; u < Lw - 2.5; u += 1.6) { P3(trim, BG.hem || BG.sph, 0xe8e0d0, u, 1.12, cv2 + .35, .22, .14, .22, Math.PI, 0, 0); P3(glow, BG.cyl, 0xffb84a, u, 1.13, cv2 + .35, .19, .01, .19, 0, 0, 0, 1); P3(trim, BG.box, 0x3a2a1a, u + .12, 1.2, cv2 + .3, .02, .02, .34, .4, 0, 0) }
        for (const u of [mid - 2, mid, mid + 2]) { P3(trim, BG.cyl, 0x8a8a94, u, 1.35, cv2 + 1.4, .4, .6, .4); lot.steam.push(W(u, cv2 + 1.4).concat(1.7)) }
        for (let v = 2; v < D - 3; v += 2.4) for (const u of [Lw * .3, Lw * .7]) P3(glow, BG.sph, 0xff4a3a, u, 3.2, v, .32, .42, .32, 0, 0, 0, 1);
        box(trim, 0x141018, mid - 2.4, mid + 2.4, 1.6, 3.4, D - 1.15, D - 1.05, 0); for (let k = 0; k < 5; k++) box(glow, [0xffd84a, 0xff8a3a, 0xffffff, 0xff8a3a, 0xffd84a][k], mid - 2, mid - .2 + (k % 2) * 1.6, 3.05 - k * .32, 3.12 - k * .32, D - 1.17, D - 1.15, 0, 1) }
      if (kind === 'synth') {   /* instrument shop: guitar wall, keyboards on stands, a drum kit, speaker stack */
        box(trim, 0x2a1a14, .8, Lw - .8, .2, 3.6, D - 1.2, D - 1.05, 0);
        for (let i = 0, u = 1.6; u < Lw - 1.4; u += 1.1, i++) { const col = [0xc83a2a, 0x2a5aa8, 0xe8c84a, 0x1a1a1a, 0xe8e0d0, 0x3a8a4a][i % 6]; P3(trim, BG.sph, col, u, 1.75, D - 1.32, .34, .44, .08); P3(trim, BG.sph, col, u, 2.2, D - 1.32, .26, .32, .08); P3(trim, BG.box, 0x5a3a22, u, 2.85, D - 1.3, .07, .9, .05); P3(trim, BG.box, 0x2a1a10, u, 3.32, D - 1.3, .12, .2, .06); P3(glow, BG.box, 0xffd84a, u, 3.55, D - 1.28, .5, .03, .03, 0, 0, 0, 1) }
        for (const u of [1.7, Lw - 1.7]) { P3(trim, BG.box, 0x16141c, u, .95, 2.4, .5, .1, 1.3); P3(glow, BG.box, 0xf4f2ee, u, 1.01, 2.4, .32, .02, 1.2, 0, 0, 0, 1); P3(trim, BG.box, 0x3a3a44, u, .45, 2.4, .05, .9, .9, .6, 0, 0); P3(trim, BG.box, 0x3a3a44, u, .45, 2.4, .05, .9, .9, -.6, 0, 0); const [kx, kz] = W(u, 2.4); ctx.circles.push([kx, kz, .55]) }
        { const u = Lw - 2.4, v = cv2 + 2.6; for (const [du, dv, r0, h] of [[0, 0, .45, .5], [.7, .3, .3, .35], [-.7, .3, .3, .35], [.4, -.5, .25, .3]]) P3(trim, BG.cyl, du ? 0xc8c8d0 : 0x8a1a2a, u + du, .3 + h / 2, v + dv, r0, h, r0); P3(glow, BG.cyl, 0xffd84a, u + .6, 1.1, v - .4, .3, .02, .3, 0, 0, 0, 1) }
        for (const u of [1.2, 2.1]) { P3(trim, BG.box, 0x141418, u, 1.2, cv2 + 2.2, .8, 2.4, .7); P3(trim, BG.cyl, 0x2a2a30, u, 1.6, cv2 + 1.84, .26, .04, .26, Math.PI / 2, 0, 0); P3(trim, BG.cyl, 0x2a2a30, u, .7, cv2 + 1.84, .18, .04, .18, Math.PI / 2, 0, 0) } }
      if (kind === 'robot') {   /* workshop: bench + vice + robot arm, parts bins, a robot half-repaired on a lift, welding sparks */
        box(trim, 0x3a3a44, .8, 2.0, 0, .95, 6.5, 11.5, 0); box(trim, 0x8a8a94, .8, 2.0, .95, 1.0, 6.5, 11.5, 0); { const [bx0, bz0] = W(.8, 6.5), [bx1, bz1] = W(2, 11.5); ctx.cols.push([Math.min(bx0, bx1), Math.max(bx0, bx1), Math.min(bz0, bz1), Math.max(bz0, bz1)]) }
        P3(trim, BG.cyl, 0xe8c81a, 1.4, 1.4, 8, .12, .8, .12); P3(trim, BG.cyl, 0xe8c81a, 1.4, 1.95, 8.35, .1, .8, .1, .7, 0, 0); P3(trim, BG.box, 0x2a2a2a, 1.4, 2.2, 8.85, .14, .14, .3); lot.sparks.push(W(1.4, 9.05).concat(2.05));
        for (let r2 = 0; r2 < 3; r2++) for (let j = 0; j < Math.floor(Lw - 2.2); j++) { box(trim, [0x2a5aa8, 0xc83a2a, 0xe8c81a, 0x3a8a4a][(j + r2) % 4], 1.2 + j, 1.9 + j, .5 + r2 * .9, 1.0 + r2 * .9, D - 1.9, D - 1.2, 0); box(trim, 0x8a8a94, 1.25 + j, 1.85 + j, 1.0 + r2 * .9, 1.05 + r2 * .9, D - 1.95, D - 1.15, 0) }
        { const u = Lw - 2.4, v = 8.6; P3(trim, BG.cyl, 0x4a4a54, u, .15, v, 1.1, .3, 1.1); P3(glow, BG.cyl, 0x7aff8a, u, .31, v, 1.12, .02, 1.12, 0, 0, 0, 1); P3(trim, BG.box, 0xb8c0d0, u, 1.0, v, .7, .9, .5); P3(trim, BG.box, 0x8a90a0, u + .2, 1.75, v, .45, .42, .4, 0, 0, .4); P3(trim, BG.cyl, 0x5a5a6a, u - .45, 1.0, v, .08, .7, .08, 0, 0, 1.2); const [rx, rz] = W(u, v); ctx.circles.push([rx, rz, 1.15]); lot.sparks.push([rx - .3, rz, 1.3]) }
        box(trim, 0xe8c81a, .8, Lw - .8, .01, .02, cv2 - .9, cv2 - .7, 0) }
      if (kind === 'tech') {   /* display tables with floating holo-gadgets + a browsing customer */
        for (const u of [2.6, Lw - 2.6]) { P3(trim, BG.box, 0x1a1824, u, .45, 2.6, 1.6, .9, 1.0); P3(glow, BG.box, 0x4ad8ff, u, .91, 2.6, 1.6, .02, 1.0, 0, 0, 0, 1); for (const du of [-.45, 0, .45]) P3(glow, BG.oct || BG.sph, NEO[(li + (du * 10 | 0) + 9) % 6], u + du, 1.25, 2.6, .12, .18, .12, 0, du, 0, 1); const [tx, tz] = W(u, 2.6); ctx.circles.push([tx, tz, .95]) }
        const [cx2, cz2] = W(2.6, 3.7); lot.customers.push([cx2, cz2, side === 'n' ? 0 : Math.PI, 0]) }
      { const [ax, az] = W(Lw / 2, cv2 + 1.6); lot.clerk = [ax, az]; const [lx, lz] = W(Lw / 2, D / 2); interiorLights.push([lx, lz, NEO[li % 6]]); lot.inside = W(Lw / 2, cv2 - 1.2); lot.door = W(Lw / 2, -1) }
    }
  });
  /* ---------- vertical blade signs jutting from the facades (double-sided, read down the street) ---------- */
  const blades = []; const BLADE_OF = { ramen: 0, robot: 1, tech: 3 };
  lots.forEach((lot, li) => { if (li % 3 === 1 && !lot.enter) return;
    const { side, x0, x1 } = lot, Lw = x1 - x0, zf = side === 'n' ? Z0 : Z1, s = side === 'n' ? -1 : 1, low = x1 > 205 && x0 < 255 && side === 'n';
    const u = li % 2 ? Lw - 1.1 : 1.1, x = x0 + u, h = low ? 3.6 : 5.6, w = h / 4, y0 = low ? 5.6 : 6.4, y1 = y0 + h, v0 = .35, v1 = v0 + w, zc = zf + s * -((v0 + v1) / 2), cell = lot.enter && BLADE_OF[lot.enter] != null ? BLADE_OF[lot.enter] : (li * 5 + 2) % 8, col = NEO[li % 6];
    for (const ry of [Math.PI / 2, -Math.PI / 2]) blades.push([cellPlane(w, h, cell, 8, 1), 0xffffff, M(x + (ry > 0 ? .03 : -.03), (y0 + y1) / 2, zc, 1, 1, 1, 0, ry, 0)]);
    for (const yb of [y0 + .1, y1 - .1]) trim.push([BG.box, 0x2a2a34, M(x, yb, zf + s * -((v1 + .2) / 2), .07, .07, v1 + .2)]);
    glow.push([BG.box, col, M(x, (y0 + y1) / 2, zf + s * -(v1 + .04), .1, h, .05), 1]) });
  /* ---------- Black Market alley: wet lane, cables, a stall under a tarp, glyph signs ---------- */
  { const [a0, a1, b0, b1] = ALLEY, mx = (a0 + a1) / 2; trim.push([BG.box, 0x1a1420, M(mx, 1.2, b0 + 2, 3.4, 1.1, 1.4)]); glow.push([BG.box, 0xc88aff, M(mx, 1.78, b0 + 2, 3.4, .05, 1.4), 1]); trim.push([BG.box, 0x3a2a4a, M(mx, 3.1, b0 + 2.2, 4.6, .08, 3, .15, 0, 0)]); ctx.circles.push([mx, b0 + 2, 1.5]);
    for (let k = 0; k < 6; k++) glow.push([BG.sph, NEO[k], M(a0 + .5 + k * 1, 3.4 - (k % 2) * .3, b0 + 4 + k * 1.2, .14, .18, .14), 1]);
    for (const z of [b0 + 3, b0 + 7]) { trim.push([BG.box, 0x16141c, M(a0 + .1, 3.2, z, .1, 1.8, .9)]); signs.push([cellPlane(.8, 1.6, 4 + (z | 0) % 8, 4, 4), 0xffffff, M(a0 + .17, 3.2, z, 1, 1, 1, 0, Math.PI / 2, 0)]) }
    signs.push([cellPlane(3.6, 1.8, 10, 4, 4), 0xffffff, M(mx, 5.6, Z0 - .1, 1, 1, 1)]); }
  /* ---------- street furniture: organic lamps, benches, vending machines, holo kiosk, cables + lanterns across the street ---------- */
  for (let x = X0 + 8, k = 0; x < X1 - 4; x += 22, k++) for (const z of [89.2, 100.8]) {
    trim.push([BG.cyl, 0x2a2a34, M(x, 3.5, z, .12, 7, .12)]); trim.push([BG.box, 0x2a2a34, M(x, 7, z + (z < 95 ? .9 : -.9), .1, .1, 1.9)]); glow.push([BG.sph, k % 2 ? 0xffd8a0 : 0x9ae8ff, M(x, 6.85, z + (z < 95 ? 1.7 : -1.7), .35, .18, .35), 1]); ctx.circles.push([x, z, .2]) }
  for (let x = X0 + 19; x < X1 - 6; x += 44) for (const z of [88.9, 101.1]) { trim.push([BG.box, 0x3a3644, M(x, .45, z, 2, .1, .55)]); trim.push([BG.box, 0x3a3644, M(x, .75, z + (z < 95 ? .25 : -.25), 2, .5, .08)]); ctx.circles.push([x, z, .6]) }   /* at the kerb, facing the shops, off the walking line */
  for (const [x, z, c] of [[109, 85.2, 0xff4ad2], [186, 104.8, 0x4ad8ff], [251, 85.2, 0x7aff8a]]) { trim.push([BG.box, 0x1a1a24, M(x, 1.1, z, 1.1, 2.2, .8)]); glow.push([BG.box, c, M(x, 1.4, z + (z < 95 ? .41 : -.41), .9, 1.3, .02), 1]); ctx.circles.push([x, z, .7]) }
  const cablePts = []; for (let x = X0 + 12; x < X1 - 6; x += 16) { const sag = 1 + (x % 3) * .4, y = 9 + (x % 5); for (let k = 0; k < 10; k++) { const a = k / 10, b = (k + 1) / 10, f = t2 => y - Math.sin(t2 * Math.PI) * sag; cablePts.push(x, f(a), Z0 - .5 + (Z1 - Z0 + 1) * a, x + 2, f(b), Z0 - .5 + (Z1 - Z0 + 1) * b) }
    if (q > 0) for (let k = 1; k < 5; k++) glow.push([BG.sph, NEO[(k + x) % 6], M(x + .2 * k, y - Math.sin(k / 5 * Math.PI) * sag - .4, Z0 + (Z1 - Z0) * k / 5, .18, .24, .18), 1]) }
  { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(cablePts, 3)); const m = new THREE.LineBasicMaterial({ color: 0x0a0a10 }); m.userData.lin = 1; grp.add(new THREE.LineSegments(g, m)) }
  /* alien planters along the building fronts (never in doorways) */
  lots.forEach((lot, i) => { if (i % 2) return; const zf = lot.side === 'n' ? Z0 + .7 : Z1 - .7; for (const u of [1.1, lot.x1 - lot.x0 - 1.1]) { const x = lot.x0 + u; if (lot.enter && Math.abs(u - (lot.x1 - lot.x0) / 2) < 2.4) continue; trim.push([BG.box, 0x2a2630, M(x, .35, zf, 1, .7, 1)]); plants.push([x, zf, .6, .7]); ctx.circles.push([x, zf, .65]) } });
  /* ---------- merge ---------- */
  FAM.forEach((f, i) => { if (!famParts[i].length) return; const tx = facade(f), m = mat({ map: tx.map, emissive: 0xffffff, emissiveMap: tx.em, emissiveIntensity: 1.1, roughness: f === 'crystal' ? .18 : f === 'ceramic' ? .45 : .7, metalness: f === 'crystal' ? .55 : f === 'industrial' ? .5 : .05 }); const me = new THREE.Mesh(K.merge(famParts[i]), m); me.receiveShadow = true; grp.add(me) });
  if (trim.length) grp.add(new THREE.Mesh(K.merge(trim), mat({ roughness: .45, metalness: .55 })));
  if (glow.length) { const gm = new THREE.MeshBasicMaterial({ vertexColors: true }); gm.userData.lin = 1; grp.add(new THREE.Mesh(K.merge(glow), gm)) }
  if (signs.length) { const sm = new THREE.MeshBasicMaterial({ map: signAtlas(), toneMapped: false }); sm.userData.lin = 1; grp.add(new THREE.Mesh(K.merge(signs), sm)) }
  if (blades.length) { const bm = new THREE.MeshBasicMaterial({ map: bladeAtlas(), toneMapped: false }); bm.userData.lin = 1; grp.add(new THREE.Mesh(K.merge(blades), bm)) }
  if (shops.length) { const sm = new THREE.MeshBasicMaterial({ map: shopAtlas() }); sm.userData.lin = 1; grp.add(new THREE.Mesh(K.merge(shops), sm)) }
  { const pm = mat({ map: paveTex(), roughness: .55, metalness: .15 }); grp.add(new THREE.Mesh(K.merge(street), pm)); const rm = mat({ map: roadTex(), roughness: .22, metalness: .35 }); grp.add(new THREE.Mesh(K.merge(roadP), rm)) }
  /* alien plants (instanced glow bulbs + fronds) */
  { const pg = K.merge([[BG.cone, 0x2a6a5a, M(0, .5, 0, .25, 1, .25)], ...[0, 1, 2, 3, 4].map(k => [BG.sph, 0x3a9a7a, M(Math.cos(k * 1.26) * .35, .9 + k * .05, Math.sin(k * 1.26) * .35, .12, .5, .12, Math.sin(k) * .5, 0, Math.cos(k) * .5)]), [BG.sph, 0x7affd8, M(0, 1.25, 0, .16, .16, .16), 1], [BG.sph, 0xff8ad8, M(.25, 1.05, .1, .1, .1, .1), 1]]);
    const items = plants.map(([x, z, s, y]) => ({ x, y: y || .7, z, s: s * 1.3 })); if (items.length) K.scatter(ctx, pg, K.floraMat(.03), items, { far: 160, cell: 60, shadow: false }) }
  /* a soft night fill so facade materials read (Astro-9 is permanently night; neon stays the key light) */
  { const hl = new THREE.HemisphereLight(0x7a6ac8, 0x1a1024, .55); grp.add(hl) }
  /* interior lights (few, only the 4 rooms) */
  interiorLights.slice(0, 4).forEach(([x, z, c]) => { const l = new THREE.PointLight(c, 1.4, 14); l.position.set(x, 3.4, z); grp.add(l) });
  /* ---------- holo adverts on facades (animated) ---------- */
  const ads = [['ZTONEDAPE LIVE', 'tonight · Club Graviton', '#ff4ad2', '#2a0a4a', 134, 64, 1], ['VOID SODA', 'tastes like nothing', '#1a1a3a', '#4ad8ff', 180, 64, 1], ['HOVER 3000', 'rent one on this street', '#ffd84a', '#ff4a4a', 162, 124, -1], ['SPORE TEA', 'grow your mind', '#2a8a4a', '#0a2a14', 252, 124, -1]].map(([t, s, a, b, x, z, f]) => {
    const ad = holoAd(t, s, a, b), m = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 7), new THREE.MeshBasicMaterial({ map: ad.t, transparent: true, opacity: .9, toneMapped: false, depthWrite: false })); m.position.set(x, 13, f > 0 ? Z0 - D + 15.2 + .9 : Z1 + D - 15.2 - .9); m.position.z = f > 0 ? Z0 - .1 : Z1 + .1; m.position.y = 12.5; m.rotation.y = f > 0 ? 0 : Math.PI; grp.add(m); ad.draw(0); return ad });
  /* ---------- hover traffic in the lane (two directions, 3.4 m up) ---------- */
  const NC = [6, 10, 14][q], carG = K.merge([[BG.sph, 0xffffff, M(0, 0, 0, .9, .38, 2.1)], [BG.sph, 0x1a2a3a, M(0, .25, .1, .6, .28, 1.1)], [BG.box, 0x4ad8ff, M(0, -.3, 0, 1.2, .04, 3.4), 1], [BG.sph, 0xffffff, M(-.5, 0, 1.9, .12, .08, .08), 1], [BG.sph, 0xffffff, M(.5, 0, 1.9, .12, .08, .08), 1], [BG.sph, 0xff2a2a, M(-.5, 0, -2, .1, .08, .06), 1], [BG.sph, 0xff2a2a, M(.5, 0, -2, .1, .08, .06), 1]]);
  const cm = mat({ roughness: .25, metalness: .7, emissive: 0x111111 }), cars = new THREE.InstancedMesh(carG, cm, NC), cc = new THREE.Color(); cars.frustumCulled = false; const CAR = []; for (let i = 0; i < NC; i++) { cars.setColorAt(i, cc.setHex([0xe8e8f0, 0x2a2a3a, 0xc83a5a, 0x3a8ad8, 0xffd84a][i % 5]).convertSRGBToLinear()); CAR.push({ dir: i % 2 ? -1 : 1, t: i / NC, sp: .012 + (i % 3) * .004, bob: i }) } grp.add(cars);
  const m4 = new THREE.Matrix4(), qq = new THREE.Quaternion(), e3 = new THREE.Euler(), v3 = new THREE.Vector3(), s3 = new THREE.Vector3(1, 1, 1);
  /* ---------- clerks (an alien + a robot species) behind the counters ---------- */
  const alienG = K.merge([[BG.sph, 0x7affd8, M(0, 1.0, 0, .3, .75, .25)], [BG.sph, 0x7affd8, M(0, 1.95, 0, .28, .36, .28)], [BG.sph, 0x111111, M(-.1, 2.0, .22, .07, .1, .05)], [BG.sph, 0x111111, M(.1, 2.0, .22, .07, .1, .05)], [BG.sph, 0x111111, M(0, 2.14, .2, .05, .07, .04)], [BG.box, 0x3a3a5a, M(0, 1.2, .2, .4, .5, .05)]]);
  const robotG = K.merge([[BG.box, 0xb8c0d0, M(0, 1.0, 0, .7, .9, .5)], [BG.box, 0x8a90a0, M(0, 1.75, 0, .45, .42, .4)], [BG.box, 0x4ad8ff, M(0, 1.78, .21, .34, .1, .02), 1], [BG.cyl, 0x5a5a6a, M(-.45, 1.1, .1, .08, .7, .08, .4, 0, 0)], [BG.cyl, 0x5a5a6a, M(.45, 1.1, .1, .08, .7, .08, .4, 0, 0)], [BG.cyl, 0x3a3a48, M(0, .3, 0, .35, .6, .35)]]);
  const clerkM = mat({ roughness: .5, metalness: .3 }), clerks = [];
  for (const k in named) { const lot = named[k]; if (!lot.clerk) continue; const g = k === 'robot' || k === 'tech' ? robotG : alienG, m = new THREE.Mesh(g, clerkM); m.position.set(lot.clerk[0], 0, lot.clerk[1]); m.rotation.y = lot.side === 'n' ? 0 : Math.PI; grp.add(m); clerks.push(m) }
  /* customers: seated diners at the ramen counter, a browser at the tech tables */
  for (const lot of lots) for (const [x, z, yaw, seat] of (lot.customers || [])) { const m = new THREE.Mesh(alienG, clerkM); m.position.set(x, seat ? seat - .38 : 0, z); m.rotation.y = yaw; m.scale.setScalar(seat ? .85 : .95); m.userData.y0 = m.position.y; grp.add(m); clerks.push(m) }
  /* steam (ramen pots + street grates) and welding sparks: a few additive sprites */
  const puffTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c) })();
  const emit = [].concat(...lots.map(l => l.steam || [])), grates = []; for (const [gx, gz] of [[140, 87.6], [190, 102.4], [214, 87.6], [246, 102.4]]) { grates.push([BG.box, 0x101014, M(gx, .025, gz, 1.2, .03, .7)]); for (let k = 0; k < 5; k++) grates.push([BG.box, 0x6a4a8a, M(gx - .45 + k * .22, .045, gz, .08, .01, .6), 1]); emit.push([gx, gz, .1]) } grp.add(new THREE.Mesh(K.merge(grates), mat({ roughness: .4, metalness: .6 })));
  const puffs = []; emit.forEach(([x, z, y0], i) => { for (let k = 0; k < 3; k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, color: 0xd8d0e8, transparent: true, depthWrite: false, opacity: .3 })); sp.position.set(x, y0, z); grp.add(sp); puffs.push({ sp, x, z, y0, ph: k / 3 + i * .17 }) } });
  const sparks = []; for (const lot of lots) for (const [x, z, y] of (lot.sparks || [])) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, color: 0xffb84a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); sp.position.set(x, y, z); sp.scale.setScalar(.25); grp.add(sp); sparks.push({ sp, x, z, y }) }
  /* ---------- move the existing shop interactions inside the rooms + the black market into its alley ---------- */
  const moveT = (re, x, z) => { const t = ctx.T.find(t => { try { return re.test(typeof t.label === 'function' ? t.label() : t.label) } catch (e) { return false } }); if (t) { t.x = x; t.z = z } return t };
  const inside = k => named[k] && named[k].inside;
  if (inside('tech')) moveT(/Tech Market/, ...inside('tech')); if (inside('synth')) moveT(/Instrument Market/, ...inside('synth')); if (inside('ramen')) moveT(/ramen bar/, ...inside('ramen')); if (inside('robot')) moveT(/Robot repair/, ...inside('robot'));
  moveT(/Black Market lane/, (ALLEY[0] + ALLEY[1]) / 2, ALLEY[2] + 3.8);
  /* ---------- per-frame: cars, ad animation, clerk idle ---------- */
  let at = 0; ctx.upd.push((dt, t) => {
    if (AV.P.y < -10) return;   /* inside Club Subterra */
    for (let i = 0; i < NC; i++) { const c = CAR[i]; c.t = (c.t + c.sp * dt * .25 * (1 + (i % 2) * .2)) % 1; const x = c.dir > 0 ? X0 + c.t * (X1 - X0) : X1 - c.t * (X1 - X0), z = c.dir > 0 ? 92.6 : 97.4;
      e3.set(Math.sin(t + c.bob) * .02, c.dir > 0 ? Math.PI / 2 : -Math.PI / 2, 0); qq.setFromEuler(e3); m4.compose(v3.set(x, 3.4 + Math.sin(t * 1.3 + c.bob) * .12, z), qq, s3); cars.setMatrixAt(i, m4) } cars.instanceMatrix.needsUpdate = true;
    clerks.forEach((m, i) => { m.rotation.z = Math.sin(t * 1.4 + i) * .03; m.position.y = (m.userData.y0 || 0) + Math.abs(Math.sin(t * 1.1 + i)) * .03 });
    for (const p of puffs) { const f = (t * .35 + p.ph) % 1; p.sp.position.set(p.x + Math.sin(t + p.ph * 9) * .15 * f, p.y0 + f * 2.4, p.z); p.sp.scale.setScalar(.5 + f * 1.6); p.sp.material.opacity = .32 * (1 - f) * Math.min(1, f * 6) }
    for (const s of sparks) { const on = Math.random() < .35; s.sp.visible = on; if (on) { s.sp.position.set(s.x + (Math.random() - .5) * .2, s.y + (Math.random() - .5) * .2, s.z + (Math.random() - .5) * .2); s.sp.scale.setScalar(.12 + Math.random() * .3) } }
    if ((at += dt) > .2) { at = 0; ads.forEach(a => a.draw(t)) } });
  NB.lots = lots; NB.named = Object.keys(named); NB.fx = { blades: blades.length / 2, steam: puffs.length, sparks: sparks.length, customers: lots.reduce((n, l) => n + (l.customers || []).length, 0) };
  NB.districts = [{ id: 'neon', name: 'Neon Boulevard', x: 175, z: 95 }];
  return { places: Object.keys(named).map(k => ({ id: 'nb_' + k, name: { tech: L('Tech Market', 'Mercado Tech'), synth: L('Synth & Strings', 'Synth & Strings'), ramen: L('Comet Ramen', 'Ramen Cometa'), robot: L('Robot Repair', 'Taller de robots') }[k], x: named[k].door[0], z: named[k].door[1], yaw: 0 })).concat([{ id: 'nb_black', name: L('Black Market alley', 'Callejón del mercado negro'), x: (ALLEY[0] + ALLEY[1]) / 2, z: Z0 + 1, yaw: 0 }]) };
};
})(window.AV);
