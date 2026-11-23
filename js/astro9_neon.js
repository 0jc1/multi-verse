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
    const base = { industrial: '#3a3d44', organic: '#d9cdb4', crystal: '#141a24', dense: '#5a5650', ceramic: '#e8e6e0' }[fam]; c.fillStyle = base; c.fillRect(0, 0, S, S);
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
    /* tower masses: family-specific silhouettes, world-scaled facade texture, corner neon */
    const tD = D - 1, setb = 2.2;
    if (fam === 1) {   /* organic: round bio-concrete tower + mosaic cap + an arch */
      const rad = Math.min(Lw, tD) / 2 - .4, [ax, az] = W(Lw / 2, tD / 2 + .5); F.push([ucyl(rad, H1 - PD, 8), 0xffffff, M(ax, (PD + H1) / 2, az, 1, 1, 1)]); trim.push([BG.hem || BG.sph, 0xd8c8a8, M(ax, H1, az, rad * 1.02, rad * .7, rad * 1.02)]); glow.push([BG.cyl, 0x7affd8, M(ax, H1 - .2, az, rad * 1.03, .12, rad * 1.03), 1]);
      if (H2) { F.push([ucyl(rad * .6, H2 - H1, 8), 0xffffff, M(ax, (H1 + H2) / 2, az, 1, 1, 1)]); trim.push([BG.hem || BG.sph, 0xe8a8c8, M(ax, H2, az, rad * .62, rad * .5, rad * .62)]) } }
    else {
      box(F, 0xffffff, .3, Lw - .3, PD, H1, .2, tD, 8); if (H2) box(F, 0xffffff, .3 + setb * .5, Lw - .3 - setb * .5, H1, H2, setb, tD - 1, 8);
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
      for (let k = 0; k < 3; k++) { box(trim, 0x34303e, 1, Lw - 1, .8 + k * 1, .86 + k * 1, D - 2.2, D - 1.1, 0); for (let j = 0; j < Math.floor(Lw - 2); j++) box(glow, NEO[(j + k + li) % 6], 1.3 + j, 1.7 + j, .9 + k, 1.25 + k, D - 1.9, D - 1.5, 0, 1) }   /* glowing shelves */
      { const [ax, az] = W(Lw / 2, cv2 + 1.6); lot.clerk = [ax, az]; const [lx, lz] = W(Lw / 2, D / 2); interiorLights.push([lx, lz, NEO[li % 6]]); lot.inside = W(Lw / 2, cv2 - 1.2); lot.door = W(Lw / 2, -1) }
    }
  });
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
    clerks.forEach((m, i) => { m.rotation.z = Math.sin(t * 1.4 + i) * .03; m.position.y = Math.abs(Math.sin(t * 1.1 + i)) * .03 });
    if ((at += dt) > .2) { at = 0; ads.forEach(a => a.draw(t)) } });
  NB.lots = lots; NB.named = Object.keys(named);
  NB.districts = [{ id: 'neon', name: 'Neon Boulevard', x: 175, z: 95 }];
  return { places: Object.keys(named).map(k => ({ id: 'nb_' + k, name: { tech: L('Tech Market', 'Mercado Tech'), synth: L('Synth & Strings', 'Synth & Strings'), ramen: L('Comet Ramen', 'Ramen Cometa'), robot: L('Robot Repair', 'Taller de robots') }[k], x: named[k].door[0], z: named[k].door[1], yaw: 0 })).concat([{ id: 'nb_black', name: L('Black Market alley', 'Callejón del mercado negro'), x: (ALLEY[0] + ALLEY[1]) / 2, z: Z0 + 1, yaw: 0 }]) };
};
})(window.AV);
