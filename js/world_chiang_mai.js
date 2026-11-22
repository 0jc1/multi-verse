/* APEVERSE V0.9.4 - world_chiang_mai.js : Chiang Mai — the Living Festival City.
   Game-friendly Chiang Mai (north = -z): the walled Old City inside its moat (4 gates, brick wall, bastions), Giant Hostel (home base,
   fully enterable: terrace, reception, shop counter, lounge, pool table, guest rooms), Blue's Live Music Bar, Pineapple Express,
   Khun Kae's Juice Bar, Chada's Vegetarian, a 24h mini-mart, Wat Chedi Luang, Wat Phra Singh, a teak temple, Buak Hard Park,
   the Gecko Shrine; outside: Tha Phae Gate plaza, Tha Phae Road, the Rack & Roll Pool Bar, the Night Bazaar, Warorot Market,
   the Ping River (pier, footbridge, east bank), the Lantern Field, and Doi Suthep on the western horizon.
   Life: hostel crew with schedules, conversations and missions; instanced pedestrians, monks, traffic (tuk-tuks, scooters, bicycles,
   songthaews), dogs, birds, markets that open and close, weather, random events.
   Modes (F key or the festival board): Normal · Yi Peng & Loy Krathong (lanterns, parade, candles, krathongs, sky lanterns) · Songkran
   (water war). Transport: tuk-tuk stands (30 credits), scooter rental. Portals: Apeverse Portal on the hostel terrace. */
'use strict';
(function (AV) {
const tr = AV.tr, TAU = AV.TAU, K = AV.kit, A = AV.arch, C = AV.chars, CY = AV.city, MD = AV.media;
const M = K.M, BG = K.BG, deg = d => d * Math.PI / 180;
const faceYaw = (fx, fz, tx, tz) => Math.atan2(-(tx - fx), -(tz - fz)), npcYaw = (fx, fz, tx, tz) => Math.atan2(tx - fx, tz - fz);
const hourNow = () => (AV.S.time / 60) % 24, night = () => { const h = hourNow(); return h < 6 || h >= 18.5 };
const mode = () => AV.S.cmMode || 'normal';

/* ======================= layout ======================= */
const XMIN = -230, XMAX = 330, ZMIN = -175, ZMAX = 175, GW = 560, GD = 350, GCX = (XMIN + XMAX) / 2, GCZ = (ZMIN + ZMAX) / 2;
const WALL0 = 100, WALL1 = 103, MOAT0 = 103, MOAT1 = 113, RING = 119, RIV0 = 258, RIV1 = 288, WY = -.55;
const XS = [-94, -60, 0, 60, 94], ZS = [-94, -60, 0, 44, 94];
const RW = (axis, v) => axis === 'z' ? (v === 0 ? 10 : v === 44 ? 7 : 6) : (v === 0 ? 8 : 6);       // road widths
const ROADS = [];                                      // [x0,z0,x1,z1,w]
XS.forEach(x => ROADS.push([x, -97, x, 97, RW('x', x)])); ZS.forEach(z => ROADS.push([-97, z, 97, z, RW('z', z)]));
ROADS.push([-RING - 4, -RING, RING + 4, -RING, 8], [-RING - 4, RING, RING + 4, RING, 8], [-RING, -RING, -RING, RING, 8], [RING, -RING, RING, RING, 8]);   // outer ring
ROADS.push([97, 0, 246, 0, 10], [-97, 0, -136, 0, 8], [0, 97, 0, 123, 7], [0, -97, 0, -123, 7]);   // Tha Phae Rd, to Lantern Field, south & north gates
ROADS.push([246, -160, 246, 160, 8]);                  // river road
function segD(x, z, r) { const dx = r[2] - r[0], dz = r[3] - r[1], L = dx * dx + dz * dz, t = Math.max(0, Math.min(1, ((x - r[0]) * dx + (z - r[1]) * dz) / L)); return Math.hypot(x - r[0] - dx * t, z - r[1] - dz * t) - r[4] / 2 }
const roadDist = (x, z) => { let d = 1e9; for (const r of ROADS) d = Math.min(d, segD(x, z, r)); return d };
const inMoat = (x, z) => { const m = Math.max(Math.abs(x), Math.abs(z)); if (m < MOAT0 || m > MOAT1) return false; const ax = Math.abs(x) > Math.abs(z) ? Math.abs(z) : Math.abs(x); return ax > 4.5 };   // bridges at the four gates
const inRiver = (x, z) => x > RIV0 && x < RIV1 && !(z > -42.5 && z < -37.5) && !(x < 266 && z > 26 && z < 34);   // footbridge + pier
const inWall = (x, z) => { const m = Math.max(Math.abs(x), Math.abs(z)); if (m < WALL0 || m > WALL1) return false; const ax = Math.abs(x) > Math.abs(z) ? Math.abs(z) : Math.abs(x); return ax > 5 };
/* named places */
/* V0.9.7: Blue's Live Music Bar moved directly OPPOSITE Giant Hostel (across Moon Muang Rd), Pineapple Express moved next door.
   Blue's interior was designed at x 34..52 / z 52..70 facing north; bX/bZ rotate it 180° onto its new plot (front faces the hostel). */
const bX = x => 60 - x, bZ = z => 92.5 - z;
const HOS = { x0: 8, x1: 32, z0: 52, z1: 88 }, BLUES = { x0: 8, x1: 26, z0: 22.5, z1: 40.5 }, MART = { x0: -16, x1: -4, z0: 48, z1: 60 };
const PINE = { x0: 35, x1: 51, z0: 53.5, z1: 68 }, KAE = { x0: 28, x1: 40, z0: 28, z1: 40.5 }, CHADA = { x0: 44, x1: 56, z0: 26, z1: 40.5 }, POOLBAR = { x0: 142, x1: 160, z0: -26, z1: -5 };
const RESERVED = [{ x0: 6, x1: 57, z0: 47.5, z1: 91 }, BLUES, KAE, CHADA, MART, { x0: -52, x1: -6, z0: 5, z1: 40.5 }, { x0: -91, x1: -63, z0: -57, z1: -5 }, { x0: -91, x1: -63, z0: 47.5, z1: 91 }, { x0: -54, x1: -24, z0: 50, z1: 82 }, { x0: -91, x1: -62, z0: -91, z1: -66 }];
const PLAZA = { x0: 124, x1: 140, z0: -22, z1: 22 }, BAZAAR = { x0: 160, x1: 230, z0: 20, z1: 78 }, WARO = { x0: 172, x1: 226, z0: -78, z1: -34 }, FIELD = { x0: -225, x1: -140, z0: -70, z1: 70 };
const DOOR_IN = [15.5, 54], DOOR_OUT = [15.5, 50];
const inRect = (r, x, z, m) => x > r.x0 - (m || 0) && x < r.x1 + (m || 0) && z > r.z0 - (m || 0) && z < r.z1 + (m || 0);

/* ======================= painted ground ======================= */
const TX = {};
function canvasTex(w, h, draw, rep) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; t.wrapS = t.wrapT = rep ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping; t.userData = { keep: true }; return t }
function groundTex(N) {
  const key = 'g' + N; if (TX[key]) return TX[key];
  return TX[key] = canvasTex(N, N * GD / GW | 0, (c, w, h) => {
    const m = w / GW, P = (x, z) => [(x - XMIN) * m, (z - ZMIN) * m], r = AV.rng(77);
    c.fillStyle = '#5a9440'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 1400; i++) { const [x, y] = [r() * w, r() * h], s = w * (.004 + r() * .015); c.fillStyle = ['#4f8a3a', '#6aa24a', '#4a8048', '#78a850'][i % 4]; c.globalAlpha = .35; c.beginPath(); c.arc(x, y, s, 0, TAU); c.fill() } c.globalAlpha = 1;
    const rect = (r0, col) => { const a = P(r0.x0, r0.z0); c.fillStyle = col; c.fillRect(a[0], a[1], (r0.x1 - r0.x0) * m, (r0.z1 - r0.z0) * m) };
    rect({ x0: -100, x1: 100, z0: -100, z1: 100 }, '#b8ac98');                                  // old city lanes / courtyards
    rect({ x0: 123, x1: 252, z0: -90, z1: 90 }, '#b0a894'); rect(PLAZA, '#b0583a'); rect(BAZAAR, '#9a8a70'); rect(WARO, '#a09078');
    rect({ x0: -91, x1: -63, z0: 47.5, z1: 91 }, '#5aa040'); rect({ x0: -52, x1: -6, z0: 5, z1: 40.5 }, '#e8dcc0'); rect({ x0: -91, x1: -63, z0: -57, z1: -5 }, '#e8dcc0'); rect({ x0: -54, x1: -24, z0: 50, z1: 82 }, '#e0d4b8');
    rect(FIELD, '#6aa848'); rect({ x0: 288, x1: 330, z0: -175, z1: 175 }, '#5a9440');
    /* water beds */
    c.fillStyle = '#1e4a50'; for (const s of [-1, 1]) { let a = P(-MOAT1, s * MOAT0); c.fillRect(a[0], s > 0 ? a[1] : P(0, -MOAT1)[1], 2 * MOAT1 * m, 10 * m); a = P(s > 0 ? MOAT0 : -MOAT1, -MOAT1); c.fillRect(a[0], a[1], 10 * m, 2 * MOAT1 * m) }
    let a = P(RIV0, ZMIN); c.fillStyle = '#2a5a5a'; c.fillRect(a[0], a[1], (RIV1 - RIV0) * m, GD * m);
    /* sidewalks then roads */
    c.lineCap = 'butt'; const seg = (rd, w2, col) => { const p0 = P(rd[0], rd[1]), p1 = P(rd[2], rd[3]); c.strokeStyle = col; c.lineWidth = w2 * m; c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); c.stroke() };
    for (const rd of ROADS) seg(rd, rd[4] + 4.4, '#cfc6b4'); for (const rd of ROADS) seg(rd, rd[4] + .6, '#8a8478'); for (const rd of ROADS) seg(rd, rd[4], '#45464c');
    c.setLineDash([3 * m, 3 * m]); for (const rd of ROADS) if (rd[4] >= 7) seg(rd, .18, '#e8d890'); c.setLineDash([]);
    for (let i = 0; i < 16000; i++) { const x = XMIN + r() * GW, z = ZMIN + r() * GD, d = roadDist(x, z); if (d < 0) { c.fillStyle = r() < .5 ? 'rgba(0,0,0,.18)' : 'rgba(255,255,255,.07)'; const q = P(x, z); c.fillRect(q[0], q[1], 1.5, 1.5) } else if (d < 2.2) { c.fillStyle = 'rgba(90,80,60,.25)'; const q = P(x, z); c.fillRect(q[0], q[1], 1, 1) } }
    /* zebra crossings at old-city intersections */
    c.fillStyle = 'rgba(240,240,230,.85)'; for (const x of XS) for (const z of ZS) { if (Math.abs(x) === 94 || Math.abs(z) === 94) continue; for (let k = -3; k <= 3; k++) { let q = P(x + k * 1.1 - .35, z + RW('z', z) / 2 + .4); c.fillRect(q[0], q[1], .7 * m, 2 * m); q = P(x + k * 1.1 - .35, z - RW('z', z) / 2 - 2.4); c.fillRect(q[0], q[1], .7 * m, 2 * m) } }
    /* hostel terrace tiles */ rect({ x0: 6, x1: 34, z0: 47.6, z1: 52 }, '#c8a888');
  });
}
function brickTex() { return TX.brick || (TX.brick = canvasTex(256, 256, (c, w, h) => { const r = AV.rng(12); c.fillStyle = '#7a3a28'; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) for (let x = -(y / 16 % 2) * 16; x < w; x += 32) { const v = r() * 40 | 0; c.fillStyle = 'rgb(' + (150 + v) + ',' + (78 + v / 2 | 0) + ',' + (52 + v / 3 | 0) + ')'; c.fillRect(x + 1, y + 1, 30, 14) } for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(60,110,50,.35)'; c.beginPath(); c.arc(r() * w, r() * h, 4 + r() * 12, 0, TAU); c.fill() } }, true)) }
function giantSignTex() {
  return TX.gsign || (TX.gsign = canvasTex(1024, 512, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#f6ead0'); g.addColorStop(1, '#e8d4ac'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    const r = AV.rng(4); for (let i = 0; i < 900; i++) { c.fillStyle = 'rgba(120,90,50,' + (r() * .12).toFixed(2) + ')'; c.fillRect(r() * w, r() * h, 2 + r() * 6, 1 + r() * 3) }
    c.fillStyle = '#c8306a'; c.fillRect(0, 0, w, 96); c.fillStyle = '#ffffff'; c.font = 'italic bold 62px Georgia'; c.textAlign = 'center'; c.fillText('New SiriSuk', w / 2, 70);
    c.lineJoin = 'round'; c.font = 'bold 168px Georgia'; c.lineWidth = 16; c.strokeStyle = '#5a1010'; c.strokeText('GIANT HOSTEL', w / 2 - 30, 270); c.fillStyle = '#d8281e'; c.fillText('GIANT HOSTEL', w / 2 - 30, 270);
    c.fillStyle = '#3a2a1a'; c.font = 'italic 64px Georgia'; c.fillText('— Chiang Mai —', w / 2, 380);
    const lx = w - 90, ly = 300; c.fillStyle = '#2a9a3a'; for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * .42; c.save(); c.translate(lx, ly); c.rotate(a + Math.PI / 2); c.beginPath(); c.ellipse(0, -46 + Math.abs(i - 3) * 6, 9, 46 - Math.abs(i - 3) * 8, 0, 0, TAU); c.fill(); c.restore() }
    c.strokeStyle = '#5a3a1a'; c.lineWidth = 14; c.strokeRect(7, 7, w - 14, h - 14);
  }));
}
function muralTex() {
  return TX.mural || (TX.mural = canvasTex(512, 512, (c, w, h) => {
    c.fillStyle = '#f4f0ea'; c.fillRect(0, 0, w, h); const r = AV.rng(9);
    for (let i = 0; i < 40; i++) { const x = r() * w, y = r() * h; c.fillStyle = ['#ff7ab8', '#7ad84a', '#4ac8ff', '#ffd84a', '#c87aff'][i % 5]; for (let p = 0; p < 5; p++) { const a = p / 5 * TAU; c.beginPath(); c.ellipse(x + Math.cos(a) * 9, y + Math.sin(a) * 9, 9, 5, a, 0, TAU); c.fill() } }
    c.fillStyle = '#f2a0c8'; c.beginPath(); c.ellipse(256, 270, 120, 130, 0, 0, TAU); c.fill(); for (const s of [-1, 1]) { c.beginPath(); c.ellipse(256 + s * 150, 250, 70, 110, s * .3, 0, TAU); c.fill() }
    c.fillStyle = '#f2a0c8'; c.beginPath(); c.moveTo(230, 330); c.quadraticCurveTo(200, 470, 290, 480); c.lineTo(300, 455); c.quadraticCurveTo(250, 440, 280, 330); c.fill();
    c.fillStyle = '#ffffff'; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(256 + s * 40, 340); c.lineTo(256 + s * 70, 400); c.lineTo(256 + s * 52, 345); c.fill() }
    c.fillStyle = '#1a1a1a'; for (const s of [-1, 1]) { c.beginPath(); c.arc(256 + s * 50, 240, 10, 0, TAU); c.fill() }
    c.fillStyle = '#e8b830'; c.beginPath(); c.moveTo(160, 160); c.lineTo(352, 160); c.lineTo(330, 70); c.lineTo(300, 120); c.lineTo(256, 30); c.lineTo(212, 120); c.lineTo(182, 70); c.fill(); c.fillStyle = '#e83a3a'; c.beginPath(); c.arc(256, 130, 14, 0, TAU); c.fill();
    c.strokeStyle = '#e8b830'; c.lineWidth = 10; c.beginPath(); c.arc(256, 260, 210, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
  }));
}
function rainbowTex() { return TX.rb || (TX.rb = canvasTex(512, 64, (c, w, h) => { const g = c.createLinearGradient(0, 0, w, 0); ['#ff3a6a', '#ff9a3a', '#ffe83a', '#3aff7a', '#3ac8ff', '#7a5aff', '#ff3ad8'].forEach((x, i) => g.addColorStop(i / 6, x)); c.fillStyle = g; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(0,0,0,.25)'; for (let x = 0; x < w; x += 12) c.fillRect(x, 0, 4, h) }, true)) }
/* ======================= V1.0 realistic street textures ======================= */
/* weathered cement render: fine grain, patch repairs, rain streaks from the roof line, damp band at the foot (tinted per building) */
function wallTex() {
  return TX.wall || (TX.wall = canvasTex(512, 512, (c, w, h) => {
    const r = AV.rng(808); c.fillStyle = '#eeeae2'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) { c.fillStyle = r() < .5 ? 'rgba(90,80,70,' + (.03 + r() * .05).toFixed(3) + ')' : 'rgba(255,255,255,.08)'; c.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 3) }
    for (let i = 0; i < 26; i++) { const x = r() * w, y = r() * h, rr = 20 + r() * 70, g = c.createRadialGradient(x, y, 0, x, y, rr); g.addColorStop(0, 'rgba(' + (r() < .5 ? '120,110,95' : '255,255,250') + ',' + (.05 + r() * .08).toFixed(3) + ')'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x - rr, y - rr, rr * 2, rr * 2) }
    for (let i = 0; i < 140; i++) { const x = r() * w, y = r() * 30, l = 40 + r() * (r() < .3 ? 420 : 160), sw = 1 + r() * 4, g = c.createLinearGradient(0, y, 0, y + l); g.addColorStop(0, 'rgba(60,58,52,' + (.08 + r() * .14).toFixed(3) + ')'); g.addColorStop(1, 'rgba(60,58,52,0)'); c.fillStyle = g; c.fillRect(x, y, sw, l) }
    { const g = c.createLinearGradient(0, h - 80, 0, h); g.addColorStop(0, 'rgba(70,75,60,0)'); g.addColorStop(1, 'rgba(62,66,50,.42)'); c.fillStyle = g; c.fillRect(0, h - 80, w, 80) }
    c.strokeStyle = 'rgba(60,55,50,.35)'; c.lineWidth = 1; for (let i = 0; i < 9; i++) { let x = r() * w, y = r() * h; c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 7; k++) { x += (r() - .5) * 18; y += 6 + r() * 12; c.lineTo(x, y) } c.stroke() }
  }, true));
}
/* corrugated metal / fibreglass sheet (awnings, sheds, market roofs): ridges + rust + dirt, light base so vertex colours tint it */
function awnTex() {
  return TX.awn || (TX.awn = canvasTex(256, 256, (c, w, h) => {
    const r = AV.rng(909); for (let x = 0; x < w; x++) { const v = 200 + Math.sin(x / w * 28 * TAU) * 34 | 0; c.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')'; c.fillRect(x, 0, 1, h) }
    for (let i = 0; i < 40; i++) { const x = r() * w, y = r() * h, l = 10 + r() * 60, g = c.createLinearGradient(0, y, 0, y + l); g.addColorStop(0, 'rgba(140,70,30,' + (.12 + r() * .2).toFixed(3) + ')'); g.addColorStop(1, 'rgba(140,70,30,0)'); c.fillStyle = g; c.fillRect(x, y, 2 + r() * 5, l) }
    for (let i = 0; i < 2500; i++) { c.fillStyle = 'rgba(60,50,40,' + (r() * .08).toFixed(3) + ')'; c.fillRect(r() * w, r() * h, 2, 2) }
  }, true));
}
/* facade atlas (1024²): 16 shop signs, 8 shopfronts, 16 windows, railings, AC unit, wooden shutters + folding doors, balcony door,
   8 vertical blade signs. R[key] = [x, y, w, h] in pixels. Lit-able cells (curtains/blinds) glow warm at night. */
const FAS = 1024;
function facadeAtlas() {
  if (TX.fa) return TX.fa; const R = {};
  const tex = canvasTex(FAS, FAS, (c) => {
    const r = AV.rng(5150), TH = '"Thonburi","Leelawadee UI","Leelawadee","Tahoma","Noto Sans Thai",sans-serif', EN = 'Arial,Helvetica,sans-serif';
    const grime = (x, y, w, h, a) => { const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, 'rgba(40,35,30,0)'); g.addColorStop(1, 'rgba(40,35,30,' + a + ')'); c.fillStyle = g; c.fillRect(x, y, w, h) };
    const clip = (x, y, w, h, f) => { c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); f(); c.restore() };
    c.clearRect(0, 0, FAS, FAS);
    /* ---- horizontal shop signs ---- */
    [['#c8102e', '#ffffff', 'ร้านขายยา', 'PHARMACY · DRUGSTORE'], ['#1d5fa8', '#ffffff', 'ซัก อบ รีด', 'LAUNDRY 40฿ / KG'], ['#f2c230', '#3a1a00', 'ก๋วยเตี๋ยวเรือ', 'BOAT NOODLES'], ['#2a6a3a', '#ffffff', 'นวดแผนไทย', 'THAI MASSAGE · FOOT 250฿'],
      ['#3a2416', '#f0d8a0', 'COFFEE', 'กาแฟสด · ROASTERY'], ['#f6f4ee', '#c8102e', 'มินิมาร์ท', 'MINI MART · 24 HRS'], ['#8a1a1a', '#ffd84a', 'ห้างทอง', 'GOLD SHOP'], ['#0f3a5a', '#ffffff', 'GUEST HOUSE', 'ROOMS · WIFI · AIRCON'],
      ['#e86a1a', '#ffffff', 'เช่ารถมอเตอร์ไซค์', 'MOTORBIKE RENT 200฿'], ['#f2eee4', '#2a2a2a', 'TOUR & TRAVEL', 'DOI SUTHEP · DOI INTHANON'], ['#5a2a6a', '#ffffff', 'ร้านเสริมสวย', 'HAIR & NAIL SALON'], ['#1a1a1a', '#e8e8e8', 'TATTOO', 'สักลาย · INK STUDIO'],
      ['#2a5a9a', '#ffffff', 'EXCHANGE', 'แลกเงิน · BEST RATE'], ['#e8dcc0', '#7a3a10', 'ข้าวซอย', 'KHAO SOI · NORTHERN FOOD'], ['#1a6a6a', '#ffffff', 'BOOKS', 'ร้านหนังสือ · USED BOOKS'], ['#b8324a', '#ffffff', 'ร้านอาหาร', 'RESTAURANT · ห้องแอร์']
    ].forEach(([bg, fg, a, b], i) => { const x = (i % 4) * 256, y = (i / 4 | 0) * 64; R['s' + i] = [x, y, 256, 64];
      c.fillStyle = bg; c.fillRect(x, y, 256, 64); c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 4; c.strokeRect(x + 2, y + 2, 252, 60);
      c.fillStyle = fg; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = 'bold 28px ' + (/[a-z]/i.test(a) ? EN : TH); c.fillText(a, x + 128, y + 25, 232); c.font = 'bold 13px ' + EN; c.fillText(b, x + 128, y + 50, 236); grime(x, y + 28, 256, 36, .22) });
    /* ---- shopfronts (256x128) ---- */
    const shutter = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); for (let k = y; k < y + h; k += 4) { c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(x, k + 3, w, 1); c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(x, k, w, 1) } c.fillStyle = 'rgba(30,30,30,.6)'; c.fillRect(x, y + h - 5, w, 5); grime(x, y + h * .5, w, h * .5, .32) };
    const inside = (x, y, w, h, wall, warm) => { const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, warm ? '#c89a68' : '#d4d8d6'); g.addColorStop(.3, wall); g.addColorStop(1, '#1c1814'); c.fillStyle = g; c.fillRect(x, y, w, h); c.fillStyle = warm ? '#fff0c8' : '#f4fbff'; for (let k = x + 16; k < x + w - 30; k += 58) c.fillRect(k, y + 5, 34, 3) };
    const goods = (x, y, w, h) => { for (let sy = y; sy < y + h - 4; sy += 13) { c.fillStyle = '#5a5248'; c.fillRect(x, sy + 11, w, 2); for (let k = x + 1; k < x + w - 4; k += 2.5 + r() * 3) { c.fillStyle = 'hsl(' + (r() * 360 | 0) + ',' + (18 + r() * 34 | 0) + '%,' + (30 + r() * 28 | 0) + '%)'; const gh = 4 + r() * 6; c.fillRect(k, sy + 11 - gh, 2 + r() * 2, gh) } } };
    const alu = (x, y, w, h) => { c.strokeStyle = '#9a9c9e'; c.lineWidth = 5; c.strokeRect(x + 2.5, y + 2.5, w - 5, h - 5) };
    const SF = [
      (x, y, w, h) => shutter(x, y, w, h, '#a6aaac'),
      (x, y, w, h) => { shutter(x, y, w, h, '#6f8c98'); c.fillStyle = '#f4f0e0'; c.fillRect(x + w / 2 - 34, y + 34, 68, 34); c.fillStyle = '#c8102e'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = 'bold 15px ' + TH; c.fillText('ให้เช่า', x + w / 2, y + 45); c.font = 'bold 9px ' + EN; c.fillText('FOR RENT', x + w / 2, y + 60) },
      (x, y, w, h) => { inside(x, y, w, h, '#bcc4c0'); goods(x + 6, y + 18, 70, h - 30); goods(x + w - 76, y + 18, 70, h - 30); c.fillStyle = '#6a5a4a'; c.fillRect(x + 90, y + h - 40, 76, 40); c.fillStyle = '#d8d0c0'; c.fillRect(x + 90, y + h - 42, 76, 4); goods(x + 92, y + 30, 72, 34); alu(x, y, w, h) },
      (x, y, w, h) => { inside(x, y, w, h, '#7a5236', true); c.fillStyle = '#1e1a16'; c.fillRect(x + 150, y + 22, 70, 36); c.fillStyle = 'rgba(255,255,255,.75)'; for (let k = 0; k < 5; k++) c.fillRect(x + 156, y + 28 + k * 6, 30 + r() * 26, 2); c.fillStyle = '#4a3020'; c.fillRect(x + 130, y + h - 44, 110, 44); c.fillStyle = '#c8a070'; c.fillRect(x + 130, y + h - 46, 110, 4);
        c.fillStyle = '#3a2618'; for (const k of [30, 82]) { c.beginPath(); c.ellipse(x + k, y + h - 34, 20, 5, 0, 0, TAU); c.fill(); c.fillRect(x + k - 2, y + h - 34, 4, 30); c.fillRect(x + k - 22, y + h - 24, 8, 24); c.fillRect(x + k + 14, y + h - 24, 8, 24) } c.fillStyle = '#ffd890'; for (const k of [40, 100, 170]) { c.beginPath(); c.arc(x + k, y + 16, 5, 0, TAU); c.fill() } c.fillStyle = '#3a6a32'; c.beginPath(); c.arc(x + 112, y + h - 30, 13, 0, TAU); c.fill() },
      (x, y, w, h) => { inside(x, y, w, h, '#b8b4a8'); goods(x + 6, y + 40, w - 12, h - 48); shutter(x, y, w, 46, '#a0a4a6') },
      (x, y, w, h) => { inside(x, y, w, h, '#a8b0b4'); goods(x + 10, y + 40, w - 20, h - 50); clip(x, y, w, h, () => { const g = c.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, 'rgba(190,215,230,.5)'); g.addColorStop(.5, 'rgba(120,150,170,.25)'); g.addColorStop(1, 'rgba(200,220,235,.45)'); c.fillStyle = g; c.fillRect(x, y, w, h) });
        c.fillStyle = '#9a9c9e'; for (const k of [0, 84, 168, 252]) c.fillRect(x + k, y, 5, h); c.fillRect(x, y + 26, w, 4); c.fillStyle = '#3a3c3e'; c.fillRect(x + 120, y + 70, 3, 18); c.fillStyle = '#e83a5a'; c.fillRect(x + 20, y + 40, 30, 40); c.fillStyle = '#2a7ad8'; c.fillRect(x + 190, y + 44, 28, 36) },
      (x, y, w, h) => { inside(x, y, w, h, '#c8d8e0'); c.fillStyle = '#1d5fa8'; c.fillRect(x + 70, y + 14, 116, 14); c.fillStyle = '#fff'; c.font = 'bold 10px ' + TH; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ซักผ้าหยอดเหรียญ COIN LAUNDRY', x + 128, y + 21, 112);
        for (let row = 0; row < 2; row++) for (let k = 0; k < 8; k++) { const mx = x + 10 + k * 30, my = y + 52 + row * 36; c.fillStyle = '#eeeeea'; c.fillRect(mx, my, 26, 33); c.fillStyle = '#b8bcbe'; c.fillRect(mx, my, 26, 5); c.fillStyle = '#3a4048'; c.beginPath(); c.arc(mx + 13, my + 20, 8, 0, TAU); c.fill(); c.fillStyle = '#8ab0c8'; c.beginPath(); c.arc(mx + 13, my + 20, 5, 0, TAU); c.fill() } },
      (x, y, w, h) => { inside(x, y, w, h, '#5a5248'); goods(x + 6, y + 20, w - 12, h - 26); c.strokeStyle = '#7a7c7e'; c.lineWidth = 3; for (let k = -h; k < w; k += 16) { c.beginPath(); c.moveTo(x + k, y + h); c.lineTo(x + k + h, y); c.stroke(); c.beginPath(); c.moveTo(x + k, y); c.lineTo(x + k + h, y + h); c.stroke() } c.fillStyle = '#5a5c5e'; for (let k = 0; k < w; k += 16) c.fillRect(x + k, y, 3, h); c.fillRect(x, y, w, 6); c.fillRect(x, y + h - 6, w, 6) }];
    SF.forEach((f, i) => { const x = (i % 4) * 256, y = 256 + (i / 4 | 0) * 128; R['f' + i] = [x, y, 256, 128]; clip(x, y, 256, 128, () => f(x, y, 256, 128)) });
    /* ---- windows (128x128): 8 kinds x 2 frame colours (white / bronze aluminium) ---- */
    const glass = (x, y, w, h) => clip(x, y, w, h, () => { const g = c.createLinearGradient(x, y, x + w * .6, y + h); g.addColorStop(0, '#8a9cab'); g.addColorStop(.45, '#3c4c5a'); g.addColorStop(.6, '#5a6c7c'); g.addColorStop(1, '#26323c'); c.fillStyle = g; c.fillRect(x, y, w, h); c.fillStyle = 'rgba(255,255,255,.14)'; c.beginPath(); c.moveTo(x + w * .25, y); c.lineTo(x + w * .5, y); c.lineTo(x + w * .15, y + h); c.lineTo(x - w * .1, y + h); c.fill() });
    const curtains = (x, y, w, h) => { c.fillStyle = '#d8b884'; c.fillRect(x, y, w, h); for (let k = x; k < x + w; k += 7) { c.fillStyle = 'rgba(120,80,40,.22)'; c.fillRect(k, y, 3, h) } c.fillStyle = '#4a3424'; c.fillRect(x + w * .44, y, w * .12, h) };
    const woodShut = (x, y, w, h) => { c.fillStyle = '#7a4a2a'; c.fillRect(x, y, w, h); c.fillStyle = 'rgba(30,15,5,.5)'; for (let k = y + 6; k < y + h - 4; k += 6) c.fillRect(x + 6, k, w - 12, 2); c.fillStyle = '#5a341c'; c.fillRect(x + w / 2 - 2, y, 4, h); c.strokeStyle = '#4a2a14'; c.lineWidth = 4; c.strokeRect(x + 2, y + 2, w - 4, h - 4) };
    for (let i = 0; i < 16; i++) {
      const x = (i % 8) * 128, y = 512 + (i / 8 | 0) * 128, t = i % 8, fc = i < 8 ? '#dcdcd4' : '#6a5a48', ix = x + 8, iy = y + 8, iw = 112, ih = 112; R['w' + i] = [x, y, 128, 128];
      c.fillStyle = fc; c.fillRect(x, y, 128, 128);
      if (t === 4) woodShut(ix, iy, iw, ih);
      else if (t === 5) { curtains(ix + 26, iy, iw - 52, ih); woodShut(ix, iy, 26, ih); woodShut(ix + iw - 26, iy, 26, ih) }
      else { if (t === 2 || t === 3) curtains(ix, iy, iw, ih); else if (t === 7) { c.fillStyle = '#e6dfd0'; c.fillRect(ix, iy, iw, ih); c.fillStyle = 'rgba(100,90,70,.35)'; for (let k = iy; k < iy + ih; k += 6) c.fillRect(ix, k, iw, 1) } else glass(ix, iy, iw, ih);
        if (t === 6) { c.fillStyle = 'rgba(230,240,245,.35)'; for (let k = iy; k < iy + ih; k += 10) c.fillRect(ix, k, iw, 2) }
        c.fillStyle = fc; c.fillRect(x + 61, y, 6, 128);
        if (t === 1 || t === 3) { c.strokeStyle = '#2a2a2a'; c.lineWidth = 3; for (let k = ix + 6; k < ix + iw; k += 13) { c.beginPath(); c.moveTo(k, iy); c.lineTo(k, iy + ih); c.stroke() } for (const f of [.33, .66]) { c.beginPath(); c.moveTo(ix, iy + ih * f); c.lineTo(ix + iw, iy + ih * f); c.stroke() } c.beginPath(); c.arc(x + 64, iy + ih * .5, 18, 0, TAU); c.stroke() } }
      { const g = c.createLinearGradient(0, y + 8, 0, y + 24); g.addColorStop(0, 'rgba(0,0,0,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(ix, iy, iw, 16) }
    }
    /* ---- railings (transparent gaps, alpha-tested) ---- */
    R.rail0 = [0, 768, 256, 64]; c.fillStyle = '#dcd6cc'; c.fillRect(0, 768, 256, 9); c.fillRect(0, 824, 256, 8); for (let k = 4; k < 256; k += 16) { c.fillRect(k + 2, 777, 6, 47); c.beginPath(); c.ellipse(k + 5, 802, 6, 11, 0, 0, TAU); c.fill() } grime(0, 768, 256, 64, .18);
    R.rail1 = [256, 768, 256, 64]; c.fillStyle = '#3a3c3e'; c.fillRect(256, 768, 256, 6); c.fillRect(256, 828, 256, 4); c.fillRect(256, 798, 256, 3); for (let k = 260; k < 512; k += 10) c.fillRect(k, 774, 3, 54);
    /* ---- AC condenser, wooden shutter window, Lanna folding teak doors, balcony door ---- */
    R.ac = [0, 832, 128, 96]; c.fillStyle = '#e8e6e0'; c.fillRect(0, 832, 128, 96); c.strokeStyle = '#b8b6b0'; c.lineWidth = 3; c.strokeRect(2, 834, 124, 92); c.fillStyle = '#3a3a3a'; c.beginPath(); c.arc(80, 880, 34, 0, TAU); c.fill(); c.strokeStyle = '#8a8a8a'; c.lineWidth = 2; for (const rr of [10, 20, 30]) { c.beginPath(); c.arc(80, 880, rr, 0, TAU); c.stroke() } c.fillStyle = '#a8a6a0'; for (let k = 846; k < 916; k += 6) c.fillRect(10, k, 28, 2); grime(0, 880, 128, 48, .3);
    R.wshut = [0, 928, 128, 96]; c.fillStyle = '#5a341c'; c.fillRect(0, 928, 128, 96); woodShut(6, 934, 58, 84); woodShut(64, 934, 58, 84);
    R.fwood = [128, 832, 256, 192]; c.fillStyle = '#3a2214'; c.fillRect(128, 832, 256, 192); inside(128 + 64, 840, 128, 184, '#8a6040', true); goods(128 + 70, 880, 116, 100);
    for (let k = 0; k < 8; k++) { if (k >= 2 && k < 6) continue; const px = 128 + k * 32; c.fillStyle = k % 2 ? '#6a3e22' : '#74462a'; c.fillRect(px + 1, 840, 30, 184); c.strokeStyle = 'rgba(30,15,5,.6)'; c.lineWidth = 2; c.strokeRect(px + 5, 852, 22, 70); c.strokeRect(px + 5, 934, 22, 80) }
    c.fillStyle = '#4a2c18'; c.fillRect(128, 832, 256, 10); grime(128, 960, 256, 64, .3);
    R.bdoor = [384, 832, 128, 192]; c.fillStyle = '#dcdcd4'; c.fillRect(384, 832, 128, 192); curtains(392, 840, 112, 176); c.fillStyle = '#dcdcd4'; c.fillRect(445, 832, 6, 192);
    /* ---- vertical blade signs (64x256, text runs bottom -> top) ---- */
    [['#c8102e', '#ffffff', 'โรงแรม HOTEL'], ['#1a5a3a', '#ffffff', 'นวด MASSAGE'], ['#1a1a1a', '#ffd84a', 'BAR · LIVE'], ['#f2c230', '#8a1a1a', 'ร้านอาหาร'], ['#0f3a5a', '#ffffff', 'GUESTHOUSE'], ['#3a2416', '#f0d8a0', 'COFFEE'], ['#7a3a8a', '#ffffff', 'SPA · นวด'], ['#f4f0e6', '#c8102e', 'ห้องพัก ROOMS']
    ].forEach(([bg, fg, txt], i) => { const x = 512 + i * 64, y = 768; R['v' + i] = [x, y, 64, 256]; c.fillStyle = bg; c.fillRect(x, y, 64, 256); c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 3; c.strokeRect(x + 4, y + 4, 56, 248);
      c.save(); c.translate(x + 32, y + 128); c.rotate(-Math.PI / 2); c.fillStyle = fg; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = 'bold 30px ' + TH; c.fillText(txt, 0, 0, 236); c.restore(); grime(x, y + 160, 64, 96, .2) });
  });
  return TX.fa = { tex, R };
}
/* gable roof prism (ridge along local x), tile UVs repeated */
const PRISM = (() => { const g = new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(-.5, 0), new THREE.Vector2(.5, 0), new THREE.Vector2(0, 1)]), { depth: 1, bevelEnabled: false }); g.translate(0, 0, -.5); g.rotateY(Math.PI / 2); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 6, uv.getY(i) * 6); return g })();
function leafNeonTex() { return TX.leaf || (TX.leaf = canvasTex(256, 256, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = '#6aff6a'; c.lineWidth = 7; c.shadowColor = '#3aff3a'; c.shadowBlur = 18; for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * .42; c.save(); c.translate(128, 150); c.rotate(a + Math.PI / 2); c.beginPath(); c.ellipse(0, -48 + Math.abs(i - 3) * 6, 10, 48 - Math.abs(i - 3) * 8, 0, 0, TAU); c.stroke(); c.restore() } c.fillStyle = '#ffb04a'; c.shadowColor = '#ff8a2a'; c.font = 'bold 46px Arial'; c.textAlign = 'center'; c.fillText('OPEN', 128, 230) })) }

AV.registerWorld({
  id: 'chiang_mai',
  build(ctx) {
    const S = AV.S, q = ctx.q, rng = ctx.rng, grp = ctx.group, MT = A.mats(), walk = A.walk(), md = mode();
    /* V1.0: natural tropical sky outside festival nights (no psychedelic swirl bands; soft white cumulus) */
    const SKY = { tint: [0xffc890, 0xffe0b0, .12, .18], dome: md === 'lantern' ? { s1: 0xffb04a, s2: 0xff6a3a, swirl: .5, cloud: .8, glow: .6 } : { s1: 0xdde6ee, s2: 0xa8c8e8, swirl: .02, cloud: .8, glow: .6 } };
    S.cm = S.cm || { met: {}, bed: 0, scooter: -1, weather: 'clear', soak: 0, hooks: 0 }; S.items = S.items || {};
    const B = { oc: K.batch(), east: K.batch(), temple: K.batch(), hostel: K.batch(), decor: K.batch(), night: K.batch(), sky: K.batch(), fest: K.batch() };
    const brick = K.floraMat(0, { map: brickTex(), rough: .9, double: true }), ROOF = MT.tile, glassM = new THREE.MeshStandardMaterial({ color: 0x9ad8ff, roughness: .1, metalness: .3, transparent: true, opacity: .25, depthWrite: false });
    const occ = [];  // footprints that vegetation must avoid
    const box = (b, mat, col, x0, x1, y0, y1, z0, z1, glow) => b.add(mat, BG.box, col, M((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, x1 - x0, y1 - y0, z1 - z0), glow);
    const solid = (x0, x1, z0, z1) => { ctx.cols.push([x0, x1, z0, z1]); occ.push({ x0, x1, z0, z1 }) };
    const sign = (txt, x, y, z, ry, w, col, posts) => ctx.sign(txt, x, y, z, ry, w, col, posts ? { posts: true } : undefined);
    MD.resetFrames();

    /* ---------- terrain: painted ground, carved moat + river ---------- */
    const sx = [150, 230, 300][q], sz = Math.round(sx * GD / GW), tg = new THREE.PlaneGeometry(GW, GD, sx, sz); tg.rotateX(-Math.PI / 2); tg.translate(GCX, 0, GCZ);
    const tp = tg.attributes.position; for (let i = 0; i < tp.count; i++) { const x = tp.getX(i), z = tp.getZ(i), m = Math.max(Math.abs(x), Math.abs(z)), moat = m > MOAT0 + .8 && m < MOAT1 - .8, riv = x > RIV0 + .8 && x < RIV1 - .8; if (moat || riv) tp.setY(i, -1.8); const dx = Math.max(0, XMIN + 30 - x, x - (XMAX - 20)), dz = Math.max(0, ZMIN + 25 - z, z - (ZMAX - 25)); if (dx || dz) tp.setY(i, Math.min(14, (dx + dz) * .5)) }
    tg.computeVertexNormals();
    const gmat = new THREE.MeshStandardMaterial({ map: groundTex([1024, 2048, 2048][q]), roughness: md === 'songkran' ? .45 : .95 }), grain = A.tex('grain');
    gmat.onBeforeCompile = sh => { sh.uniforms.detailMap = { value: grain }; sh.fragmentShader = 'uniform sampler2D detailMap;\n' + sh.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n diffuseColor.rgb *= mix(1.0, texture2D(detailMap, vUv * 160.0).r * 1.45, .35);') };
    gmat.customProgramCacheKey = () => 'cmGround'; gmat.userData.lin = 1; const ground = new THREE.Mesh(tg, gmat); ground.receiveShadow = true; grp.add(ground);
    { const sk = new THREE.RingGeometry(150, 900, 64, 2); sk.rotateX(-Math.PI / 2); sk.translate(GCX, -2.2, GCZ); grp.add(new THREE.Mesh(sk, AV.std(0x4a7a44, 1))) }   // skirt below the city ground
    /* Doi Suthep + mountains (west horizon, hazy, not fogged) */
    { const parts = [], r = AV.rng(31), DS = [Math.cos(deg(182)) * 700, Math.sin(deg(182)) * 700 - 40];
      for (let i = 0; i < 30; i++) { const a = deg(115 + i * 4.8 + r() * 3), d = 720 + r() * 160, h = 90 + r() * 150; parts.push([BG.ico, [0x8aa8b8, 0x98b4c2, 0x7c9cac, 0xa4bcc8][i % 4], M(Math.cos(a) * d, h * .35 - 20, Math.sin(a) * d - 40, 130 + r() * 90, h, 110 + r() * 70, 0, r() * 3, 0), 0]) }
      parts.push([BG.ico, 0x7c9cac, M(DS[0], 60, DS[1], 230, 260, 200), 0]);                                           // Doi Suthep massif
      for (let i = 0; i < 20; i++) { const a = deg(10 + i * 16), d = 820 + r() * 80, h = 50 + r() * 70; parts.push([BG.ico, 0xb4c8d0, M(Math.cos(a) * d, h * .3 - 20, Math.sin(a) * d, 160, h, 160), 0]) }
      const mm = new THREE.Mesh(K.merge(parts), new THREE.MeshBasicMaterial({ vertexColors: true, fog: false })); mm.material.userData.lin = 1; grp.add(mm);    // unlit, pale: reads as distant haze
      const ds = new THREE.Group(); ds.position.set(DS[0] + 30, 0, DS[1]); grp.add(ds);
      const gold = new THREE.Mesh(K.merge([[BG.cyl, 0xe8b830, M(0, 312, 0, 9, 6, 9)], [BG.cone, 0xf2c840, M(0, 332, 0, 6, 30, 6)], [BG.sph, 0xf2c840, M(0, 318, 0, 7, 8, 7)]]), new THREE.MeshBasicMaterial({ vertexColors: true, fog: false })); ds.add(gold);
      const gt = canvasTex(64, 64, (c) => { const g = c.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,220,140,1)'); g.addColorStop(1, 'rgba(255,200,100,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64) });
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: gt, transparent: true, opacity: .0, depthWrite: false, fog: false, blending: THREE.AdditiveBlending })); glow.scale.set(70, 70, 1); glow.position.y = 322; ds.add(glow); glow.material.userData.lin = 1;
      ctx.upd.push(() => { glow.material.opacity = (AV.nightK || 0) * .7; mm.material.color.setScalar(1 - (AV.nightK || 0) * .72) }) }

    /* ---------- moat, wall, gates, river ---------- */
    /* V1.0: the real moat is still, olive-green water; the Ping runs silty brown-green (no iridescence outside the lantern festival) */
    const wopt = { deep: 0x1e3a30, shallow: 0x4a6a48, sky: md === 'lantern' ? 0xffb070 : 0xa8c0cc, iri: md === 'lantern' ? .12 : .02, opacity: .92, scale: .6 };
    for (const s of [-1, 1]) { const w1 = K.waterPlane(ctx, new THREE.PlaneGeometry(2 * MOAT1, MOAT1 - MOAT0), WY, wopt); w1.position.z = s * (MOAT0 + MOAT1) / 2; const w2 = K.waterPlane(ctx, new THREE.PlaneGeometry(MOAT1 - MOAT0, 2 * MOAT0), WY, wopt); w2.position.x = s * (MOAT0 + MOAT1) / 2 }
    { const rw = K.waterPlane(ctx, new THREE.PlaneGeometry(RIV1 - RIV0, GD), WY, Object.assign({}, wopt, { deep: 0x3a3a28, shallow: 0x6a6a4a })); rw.position.x = (RIV0 + RIV1) / 2; rw.position.z = GCZ }
    for (const s of [-1, 1]) for (const r of [MOAT0, MOAT1]) { box(B.oc, brick, 0xffffff, -r - .4, r + .4, -1.8, .25, s * r - .4, s * r + .4); box(B.oc, brick, 0xffffff, s * r - .4, s * r + .4, -1.8, .25, -r, r) }
    for (const x of [RIV0, RIV1]) box(B.east, MT.stone, 0xd8c8a8, x - .5, x + .5, -1.8, .3, ZMIN, ZMAX);
    /* city wall with gaps at the gates, crenellations, corner bastions, gate towers */
    const wallSeg = (x0, x1, z0, z1) => { box(B.oc, brick, 0xffffff, x0, x1, 0, 3.6, z0, z1); ctx.cols.push([x0, x1, z0, z1]); const L = Math.max(x1 - x0, z1 - z0), n = Math.floor(L / 2.2), alongX = x1 - x0 > z1 - z0; for (let i = 0; i < n; i += 2) { const t = i / n; if (alongX) box(B.oc, brick, 0xffffff, x0 + t * L, x0 + t * L + 1.1, 3.6, 4.3, z0, z1); else box(B.oc, brick, 0xffffff, x0, x1, 3.6, 4.3, z0 + t * L, z0 + t * L + 1.1) } };
    for (const s of [-1, 1]) { wallSeg(-WALL1, -5, s > 0 ? WALL0 : -WALL1, s > 0 ? WALL1 : -WALL0); wallSeg(5, WALL1, s > 0 ? WALL0 : -WALL1, s > 0 ? WALL1 : -WALL0); wallSeg(s > 0 ? WALL0 : -WALL1, s > 0 ? WALL1 : -WALL0, -WALL0, -5); wallSeg(s > 0 ? WALL0 : -WALL1, s > 0 ? WALL1 : -WALL0, 5, WALL0) }
    for (const cx of [-1, 1]) for (const cz of [-1, 1]) { const x = cx * 101.5, z = cz * 101.5; box(B.oc, brick, 0xffffff, x - 5, x + 5, 0, 5.4, z - 5, z + 5); solid(x - 5, x + 5, z - 5, z + 5) }
    const GATES = [[101.5, 0, 'x', 'THA PHAE GATE'], [-101.5, 0, 'x', 'SUAN DOK GATE'], [0, 101.5, 'z', 'CHIANG MAI GATE'], [0, -101.5, 'z', 'CHANG PHUAK GATE']];
    GATES.forEach(([gx, gz, ax, name], i) => { for (const s of [-1, 1]) { const ox = ax === 'x' ? 0 : s * 7.5, oz = ax === 'x' ? s * 7.5 : 0; box(B.oc, brick, 0xffffff, gx + ox - 2.6, gx + ox + 2.6, 0, 7.4, gz + oz - 2.6, gz + oz + 2.6); box(B.oc, MT.stone, 0xd8c8a8, gx + ox - 2.8, gx + ox + 2.8, 7.4, 7.8, gz + oz - 2.8, gz + oz + 2.8); solid(gx + ox - 2.6, gx + ox + 2.6, gz + oz - 2.6, gz + oz + 2.6) }
      const bx = ax === 'x' ? gx + Math.sign(gx) * 6.5 : gx, bz = ax === 'z' ? gz + Math.sign(gz) * 6.5 : gz;   // bridge over the moat
      if (ax === 'x') { box(B.oc, MT.stone, 0xc8b8a0, MOAT0 * Math.sign(gx) - (gx > 0 ? 0 : 10), MOAT0 * Math.sign(gx) + (gx > 0 ? 10 : 0), -.4, .02, -4.6, 4.6); for (const s of [-1, 1]) box(B.oc, MT.stone, 0xe0d0b0, Math.min(MOAT0 * Math.sign(gx), MOAT1 * Math.sign(gx)), Math.max(MOAT0 * Math.sign(gx), MOAT1 * Math.sign(gx)), 0, .9, s * 4.6 - .2, s * 4.6 + .2) }
      else { box(B.oc, MT.stone, 0xc8b8a0, -4.6, 4.6, -.4, .02, Math.min(MOAT0 * Math.sign(gz), MOAT1 * Math.sign(gz)), Math.max(MOAT0 * Math.sign(gz), MOAT1 * Math.sign(gz))); for (const s of [-1, 1]) box(B.oc, MT.stone, 0xe0d0b0, s * 4.6 - .2, s * 4.6 + .2, 0, .9, Math.min(MOAT0 * Math.sign(gz), MOAT1 * Math.sign(gz)), Math.max(MOAT0 * Math.sign(gz), MOAT1 * Math.sign(gz))) }
      if (i === 0) sign(name, 116.5, 5.2, -9.5, Math.PI / 2, 6, '#ffd84a', true); else sign(name, gx + (ax === 'x' ? Math.sign(gx) * 14 : 9), 4.2, gz + (ax === 'z' ? Math.sign(gz) * 14 : 0), ax === 'x' ? (gx > 0 ? Math.PI / 2 : -Math.PI / 2) : (gz > 0 ? 0 : Math.PI), 4.5, '#ffd84a', true) });   // signs face visitors arriving from outside
    /* Ping River footbridge (iron bridge) + pier + river promenade rail */
    box(B.east, MT.shiny, 0x6a7080, RIV0 - .5, RIV1 + .5, -.1, .1, -42.5, -37.5); for (const s of [-1, 1]) { box(B.east, MT.shiny, 0x8a90a0, RIV0, RIV1, 0, 1.1, -40 + s * 2.4 - .08, -40 + s * 2.4 + .08); for (let x = RIV0; x <= RIV1; x += 3) box(B.east, MT.shiny, 0x5a6070, x - .1, x + .1, 0, 3.2, -40 + s * 2.4 - .1, -40 + s * 2.4 + .1) } box(B.east, MT.shiny, 0x5a6070, RIV0, RIV1, 3, 3.25, -42.6, -37.4);
    box(B.east, MT.wood, 0xffffff, RIV0 - .5, 266, -.15, .05, 26, 34); for (const z of [26, 34]) box(B.east, MT.wood, 0xffffff, RIV0, 266, 0, .9, z - .08, z + .08);
    for (let z = ZMIN + 10; z < ZMAX - 10; z += 3) { if (z > -43 && z < -37) continue; if (z > 25 && z < 35) continue; box(B.east, MT.shiny, 0x8a8a7a, RIV0 - .7, RIV0 - .5, 0, 1, z, z + .12) } box(B.east, MT.shiny, 0x8a8a7a, RIV0 - .75, RIV0 - .45, .95, 1.05, ZMIN + 10, ZMAX - 10);
    ctx.cols.push([RIV0 - .9, RIV0 - .45, ZMIN, -43], [RIV0 - .9, RIV0 - .45, -37, 25.5], [RIV0 - .9, RIV0 - .45, 34.5, ZMAX]);
    sign('PING RIVER PIER · Loy Krathong', 252.5, 3, 37.5, -Math.PI / 2, 4.6, '#7ff0ff', true);

    /* ---------- shophouses (V1.0: realistic Thai row houses — "tuk thaew" concrete shophouses + Lanna teak houses, batched) ----------
       Each facade is built in a local frame (x along the street, +z out of the wall) so textured parts (signs, shutters, windows) face
       the street the right way round. Facade atlas = 1 material: shop signs, open/closed shopfronts, windows, railings, AC units. */
    const FA = facadeAtlas(), NU = { value: 0 }, facM = (() => {
      const m = new THREE.MeshStandardMaterial({ vertexColors: true, map: FA.tex, roughness: .8, alphaTest: .5 });
      m.onBeforeCompile = sh => { sh.uniforms.uNight = NU; sh.vertexShader = 'attribute float aGlow;varying float vGlow;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vGlow = aGlow;');
        sh.fragmentShader = 'uniform float uNight;varying float vGlow;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance += diffuseColor.rgb * vGlow * uNight * 1.25;') };   // lit signs / windows glow with their own picture
      m.customProgramCacheKey = () => 'cmFacade'; m.userData.lin = 1; return m })();
    ctx.upd.push(() => { NU.value = AV.nightK || 0 });
    const wallM = K.floraMat(0, { map: wallTex(), rough: .93 }), awnM = K.floraMat(0, { map: awnTex(), rough: .5, metal: .25, double: true });
    MT.stucco = wallM; MT.roof = awnM;   // hostel, venues and market stalls also get weathered render + corrugated sheets (instead of the painted flower/stripe textures)
    const CG = {}, cell = k => CG[k] || (CG[k] = (() => { const R0 = FA.R[k], g = new THREE.BoxGeometry(1, 1, 1), uv = g.attributes.uv, p = 1.5; for (let i = 0; i < uv.count; i++) uv.setXY(i, (R0[0] + p + uv.getX(i) * (R0[2] - 2 * p)) / FAS, 1 - (R0[1] + p + (1 - uv.getY(i)) * (R0[3] - 2 * p)) / FAS); return g })());
    const WALLS = [0xf1ece2, 0xe9dfca, 0xddd8ce, 0xf0e1b6, 0xdcc9a6, 0xc9d3c6, 0xe8d0c0, 0xd3d7da, 0xbfb9ac, 0xe8d6a2, 0xcfdcd5, 0xf4f1ea, 0xd9c2a0, 0xc6cfd6];
    const AWN = [0xb4b8bc, 0xb4b8bc, 0x8aa0b8, 0x7aa088, 0xb86a5a, 0xe6e4dc, 0xd89a4a, 0x9a8a7a], LITW = { 2: 1, 3: 1, 5: 1, 7: 1 };
    const SHOP = ['f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f0', 'f1', 'f2', 'f3', 'f5', 'f4'], OPEN = { f2: 1, f3: 1, f4: 1, f5: 1, f6: 1, fwood: 1 };
    const FR = new THREE.Matrix4(), _p = new THREE.Vector3(), _sc = new THREE.Vector3(), _qq = new THREE.Quaternion(), _ee = new THREE.Euler();
    function shophouse(b, x0, x1, z0, z1, face, r) {   // face: 'n' | 's' | 'e' | 'w' (side towards the street)
      const lo = q === 0, hi = q === 2, along = face === 'n' || face === 's', L = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0;
      FR.makeRotationY({ s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 }[face]).setPosition({ s: x0, n: x1, e: x1, w: x0 }[face], 0, { s: z1, n: z0, e: z1, w: z0 }[face]);
      const P = (mat, geo, col, u, y, v, su, sy, sv, glow, tilt) => { _qq.setFromEuler(_ee.set(tilt || 0, 0, 0)); b.add(mat, geo, col, new THREE.Matrix4().compose(_p.set(u, y, v), _qq, _sc.set(su, sy, sv)).premultiply(FR), glow) };
      const lanna = r() < .14, nF = lanna ? 2 : [2, 2, 2, 3, 3, 3, 3, 4, 4, 5][r() * 10 | 0], G0 = 4, FH = 3.1, top = G0 + (nF - 1) * FH, h = top + (lanna ? 0 : .9);
      const col = WALLS[r() * WALLS.length | 0], sh = k => shadeHex(col, k); solid(x0, x1, z0, z1);
      /* body (Lanna: masonry ground floor + overhanging teak upper floor under a tiled gable roof) */
      if (lanna) { P(wallM, BG.box, col, L / 2, G0 / 2, -D / 2, L, G0, D); P(MT.wood, BG.box, 0xa87a58, L / 2, G0 + FH / 2, -D / 2 + .2, L, FH, D + .4); P(MT.wood, BG.box, 0x6a4a32, L / 2, G0 + .08, .25, L, .16, .3) }
      else P(wallM, BG.box, col, L / 2, h / 2, -D / 2, L, h, D);
      /* ground floor: party-wall pilasters, shopfront (open shop / roller shutter / glass / folding gate), fascia, sign, awning */
      if (!lanna) for (const u of [.12, L - .12]) P(wallM, BG.box, sh(.9), u, h / 2, .05, .24, h, .12);
      const sf = lanna ? 'fwood' : SHOP[r() * SHOP.length | 0];
      P(facM, cell(sf), 0xffffff, L / 2, 1.58, .03, L - .55, 3.15, .06, OPEN[sf] ? .75 : 0);
      P(wallM, BG.box, sh(.94), L / 2, 3.25, .06, L - .3, .2, .14);
      if (!lanna || r() < .6) { const sw = Math.min(L - .9, 4.6), shh = Math.min(lanna ? .52 : .95, sw / 4.4); P(facM, cell('s' + (r() * 16 | 0)), 0xffffff, L / 2, 3.38 + shh / 2, .16, sw, shh, .1, .9) }
      if (!lanna && r() < .75) { const ac = AWN[r() * AWN.length | 0], dep = 1.3 + r() * .5; P(awnM, BG.box, ac, L / 2, 3.0, dep / 2, L - .3, .04, dep, 0, .2); P(awnM, BG.box, ac, L / 2, 3.0 - Math.sin(.2) * dep / 2 - .07, dep * Math.cos(.2) - .02, L - .3, .14, .03);
        if (!lo) for (const u of [.4, L - .4]) P(MT.v, BG.box, 0x3a3a3a, u, 2.92, dep / 2 - .05, .04, .04, dep, 0, .2) }
      if (!lo && !lanna && nF > 1 && r() < .28) P(facM, cell('v' + (r() * 8 | 0)), 0xffffff, L - .45, G0 + 1.6, .5, .08, 2.2, .55, .9);   // blade sign
      /* upper floors: slab band, windows with sills + sun hoods + grilles, AC condensers, some balconies */
      const wt = r() * 8 | 0, fAlt = r() < .4 ? 8 : 0;
      for (let k = 1; k < nF; k++) {
        const y0 = G0 + (k - 1) * FH, nW = Math.max(1, Math.round(L / 2.4)), ww = Math.min(1.35, L / nW - .55);
        if (!lanna) P(wallM, BG.box, sh(.88), L / 2, y0, .1, L, .22, .2);
        if (lanna) { for (let i = 0; i < nW; i++) P(facM, cell('wshut'), 0xffffff, (i + .5) * L / nW, y0 + 1.5, .43, ww, 1.2, .06); continue }
        if (!lo && r() < .3 && L > 4) {   // balcony: slab, railing, sliding door
          const rl = r() < .5 ? 'rail0' : 'rail1'; P(wallM, BG.box, sh(.92), L / 2, y0 + .02, .6, L - .5, .16, 1.2); P(facM, cell(rl), 0xffffff, L / 2, y0 + .6, 1.17, L - .5, 1.0, .05);
          for (const u of [.27, L - .27]) P(facM, cell(rl), 0xffffff, u, y0 + .6, .6, .05, 1.0, 1.15);
          P(facM, cell('bdoor'), 0xffffff, L / 2, y0 + 1.3, .03, Math.min(2.2, L - 1.6), 2.4, .06, r() < .5 ? 1 : 0);
          if (hi && r() < .6) { P(MT.v, A.geo('cyl'), 0x9a5a3a, .7, y0 + .3, .75, .2, .35, .2); P(MT.v, BG.sph, 0x3a7a34, .7, y0 + .7, .75, .35, .45, .35) }
          continue }
        for (let i = 0; i < nW; i++) {
          const cx = (i + .5) * L / nW, t = r() < .8 ? wt : r() * 8 | 0; P(facM, cell('w' + (t + fAlt)), 0xffffff, cx, y0 + 1.55, .03, ww, 1.45, .06, LITW[t] && r() < .55 ? 1 : 0);
          if (lo) continue;
          P(wallM, BG.box, sh(.95), cx, y0 + .78, .1, ww + .16, .07, .22); P(wallM, BG.box, sh(.86), cx, y0 + 2.4, .26, ww + .4, .06, .5, 0, .22);   // sill + sun hood
          if (r() < .28) { P(facM, cell('ac'), 0xffffff, cx, y0 + .42, .2, .8, .56, .32); P(MT.v, BG.box, 0x5a5a5a, cx, y0 + .12, .22, .7, .04, .36) }
        }
      }
      /* roof: parapet cap + cornice, then a gable (Lanna), hip roof, or flat roof clutter (water tanks, antenna, dish, sheet-metal shed) */
      if (lanna) { P(ROOF, PRISM, r() < .5 ? 0xffffff : 0x9a8a80, L / 2, top, -D / 2 + .2, L + .4, 2.2, D + 1.6) }
      else {
        P(wallM, BG.box, sh(.84), L / 2, h - .05, .02, L + .02, .12, .3); P(wallM, BG.box, sh(.9), L / 2, top + .08, .1, L, .16, .22);
        if (nF <= 3 && r() < .14) P(ROOF, A.geo('hip'), 0xffffff, L / 2, h + .6, -D / 2, (L + .5) / 1.414, 1.3, (D + .5) / 1.414);
        else if (!lo) {
          if (r() < .55) { const u = .8 + r() * (L - 1.6), tc = r() < .5 ? [MT.shiny, 0xd8dce0] : [MT.v, 0x2a5aa8]; P(MT.v, BG.box, 0x6a6a6a, u, h + .3, -D * .6, .9, .6, .9); P(tc[0], A.geo('cyl'), tc[1], u, h + 1.15, -D * .6, .5, 1.1, .5) }
          if (r() < .35) { const u = .5 + r() * (L - 1); P(MT.v, A.geo('cyl6'), 0x8a8a8a, u, h + 1.4, -1.2, .03, 2.8, .03); if (hi) for (const y of [2.3, 2.7]) P(MT.v, BG.box, 0x8a8a8a, u, h + y, -1.2, 1.2, .03, .03) }
          if (r() < .15) P(MT.v, BG.hem, 0xe8e8e4, L * .7, h + .5, -.8, .38, .12, .38, 0, -1.1);
          if (r() < .18) { const sd = Math.min(4, D * .4); P(awnM, BG.box, 0xa8acb0, L / 2, h + 2.3, -D + sd / 2 + .3, L - .4, .05, sd, 0, -.1); for (const u of [.4, L - .4]) P(MT.v, BG.box, 0x5a5a5a, u, h + 1.15, -D + sd + .2, .08, 2.3, .08) }
        }
      }
      /* street level clutter: drain pipe, electricity meter, potted plants */
      if (lo) return;
      if (!lanna && r() < .4) P(MT.v, A.geo('cyl6'), 0x8a8a84, r() < .5 ? .32 : L - .32, h / 2, .16, .06, h, .06);
      if (r() < .3) P(MT.v, BG.box, 0x9a9a94, .55, 1.8, .1, .34, .44, .14);
      if (r() < .35) { const u = r() < .5 ? .5 : L - .5; P(MT.v, A.geo('cyl'), 0x8a4a2a, u, .2, .4, .24, .4, .24); P(MT.v, BG.sph, 0x3a7a3a, u, .65, .4, .38, .45, .38) }
    }
    const blockRows = (bx0, bx1, bz0, bz1, b, r) => {
      const d = Math.min(12, (bz1 - bz0) / 2 - 1), dw = Math.min(12, (bx1 - bx0) / 2 - 1);
      const row = (a0, a1, fixed0, fixed1, face, alongX) => { let a = a0; while (a < a1 - 3.5) { const w = Math.min(a1 - a, 5 + r() * 4); const R0 = alongX ? { x0: a, x1: a + w, z0: fixed0, z1: fixed1 } : { x0: fixed0, x1: fixed1, z0: a, z1: a + w }; if (!RESERVED.some(rs => R0.x0 < rs.x1 && R0.x1 > rs.x0 && R0.z0 < rs.z1 && R0.z1 > rs.z0)) shophouse(b, R0.x0 + .15, R0.x1 - .15, R0.z0, R0.z1, face, r); a += w } };
      row(bx0, bx1, bz0, bz0 + d, 'n', true); row(bx0, bx1, bz1 - d, bz1, 's', true); row(bz0 + d + .3, bz1 - d - .3, bx0, bx0 + dw, 'w', false); row(bz0 + d + .3, bz1 - d - .3, bx1 - dw, bx1, 'e', false);
    };
    { const r = AV.rng(1234); for (let i = 0; i < XS.length - 1; i++) for (let j = 0; j < ZS.length - 1; j++) { const bx0 = XS[i] + RW('x', XS[i]) / 2 + 2.2, bx1 = XS[i + 1] - RW('x', XS[i + 1]) / 2 - 2.2, bz0 = ZS[j] + RW('z', ZS[j]) / 2 + 2.2, bz1 = ZS[j + 1] - RW('z', ZS[j + 1]) / 2 - 2.2; blockRows(bx0, bx1, bz0, bz1, B.oc, r) }
      /* east: Tha Phae Road frontage */
      const ER = [{ x0: 146, x1: 246, z0: -18, z1: -7.2, face: 's' }, { x0: 146, x1: 246, z0: 7.2, z1: 18, face: 'n' }]; for (const e of ER) { let a = e.x0; while (a < e.x1 - 4) { const w = 5 + r() * 4, R0 = { x0: a, x1: Math.min(e.x1, a + w), z0: e.z0, z1: e.z1 }; if (!inRect(POOLBAR, (R0.x0 + R0.x1) / 2, (R0.z0 + R0.z1) / 2, 1) && !(R0.x0 < 188 && R0.x1 > 179 && e.face === 'n') && !(R0.x0 < 182 && R0.x1 > 174 && e.face === 's')) /* gaps: Night Bazaar entrance (south side), Warorot entrance (north side) */ shophouse(B.east, R0.x0 + .15, R0.x1 - .15, R0.z0, R0.z1, e.face, r); a += w } }
      for (let z = -80; z <= 80; z += 9) { if (Math.abs(z) < 10 || (z > -50 && z < -32)) continue; shophouse(B.east, 234, 242, z, z + 8.5, 'e', r) }   // river road frontage
    }

    /* ---------- electric poles + tangled wires, street lamps ---------- */
    { const wire = [], poles = []; for (const rd of ROADS) { if (rd[4] < 6.5) continue; const L = Math.hypot(rd[2] - rd[0], rd[3] - rd[1]), n = Math.floor(L / 24), ux = (rd[2] - rd[0]) / L, uz = (rd[3] - rd[1]) / L, off = rd[4] / 2 + 1.6; let prev = null;
        for (let i = 0; i <= n; i++) { const x = rd[0] + ux * i * L / n - uz * off, z = rd[1] + uz * i * L / n + ux * off; if (inMoat(x, z) || inRiver(x, z) || inWall(x, z) || occ.some(o => inRect(o, x, z, .4))) { prev = null; continue } poles.push([x, z]); if (prev) for (let k = 0; k < 4; k++) { const y = 6.6 - k * .3, s = .5 + k * .15; for (let t = 0; t < 6; t++) { const f0 = t / 6, f1 = (t + 1) / 6; wire.push(prev[0] + (x - prev[0]) * f0, y - Math.sin(f0 * Math.PI) * s, prev[1] + (z - prev[1]) * f0, prev[0] + (x - prev[0]) * f1, y - Math.sin(f1 * Math.PI) * s, prev[1] + (z - prev[1]) * f1) } } prev = [x, z] } }
      poles.forEach(([x, z], i) => { B.decor.add(MT.stone, A.geo('cyl6'), 0xb8b0a0, M(x, 3.5, z, .14, 7, .14)); B.decor.add(MT.v, BG.box, 0x5a5a5a, M(x, 6.6, z, 1.4, .1, .1)); if (i % 2 === 0) { B.decor.add(MT.v, BG.box, 0x3a3a3a, M(x, 5.2, z, .6, .08, .08)); B.night.add(MT.v, BG.sph, 0xfff0c0, M(x + .3, 5.05, z, .2, .12, .2), 1) }
        if (q > 0 && i % 5 === 2) { B.decor.add(MT.shiny, A.geo('cyl'), 0x8a9098, M(x, 5.6, z + .45, .32, .8, .32)); B.decor.add(MT.v, BG.box, 0x4a4a4a, M(x, 5.6, z + .22, .08, .5, .3)); for (const s of [-1, 1]) B.decor.add(MT.v, A.geo('cyl6'), 0xd8d0c0, M(x + s * .12, 6.12, z + .45, .04, .2, .04)) }   // pole-top transformer
        if (q > 0 && i % 3 === 1) B.decor.add(MT.v, BG.box, 0x8a8a84, M(x, 2.2, z, .3, .4, .3));   // junction box
        ctx.circles.push([x, z, .2]) });
      const wl = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(wire, 3)), new THREE.LineBasicMaterial({ color: 0x1a1a1a })); grp.add(wl) }

    /* =======================================================================================
       GIANT HOSTEL (home base): terrace, sign, mural, canopy, reception, shop counter, lounge, pool table, corridor, guest rooms
       ======================================================================================= */
    const H = HOS, hb = B.hostel, wallC = 0xf2efe8, wH = 4.2;
    const room = (x0, x1, z0, z1, doors, col, mat) => {   // walls with door gaps; doors: [{side:'n'|'s'|'e'|'w', at, w}]
      const t = .22, segs = { n: [x0, x1, z0, z0 + t, 'x'], s: [x0, x1, z1 - t, z1, 'x'], w: [x0, x0 + t, z0, z1, 'z'], e: [x1 - t, x1, z0, z1, 'z'] };
      for (const sd in segs) { const [a0, a1, b0, b1, ax] = segs[sd], ds = doors.filter(d => d.side === sd).sort((p, q2) => p.at - q2.at); let cur = ax === 'x' ? a0 : b0; const end = ax === 'x' ? a1 : b1;
        const put = (c0, c1) => { if (c1 - c0 < .05) return; const bb = ax === 'x' ? [c0, c1, b0, b1] : [a0, a1, c0, c1]; box(hb, mat || MT.stucco, col || wallC, bb[0], bb[1], 0, wH, bb[2], bb[3]); ctx.cols.push(bb) };
        for (const d of ds) { put(cur, d.at - d.w / 2); const bb = ax === 'x' ? [d.at - d.w / 2, d.at + d.w / 2, b0, b1] : [a0, a1, d.at - d.w / 2, d.at + d.w / 2]; box(hb, mat || MT.stucco, col || wallC, bb[0], bb[1], 2.5, wH, bb[2], bb[3]); cur = d.at + d.w / 2 } put(cur, end) }
    };
    room(H.x0, H.x1, H.z0, H.z1, [{ side: 'n', at: 15.5, w: 2.6 }, { side: 'n', at: 25, w: 13.6 }], wallC); ctx.cols.push([18.2, 31.8, H.z0 - .1, H.z0 + .25]);   // entrance + glass shopfront
    room(H.x0, H.x1, 70, 73.3, [{ side: 'n', at: 12, w: 2.4 }, { side: 's', at: 11, w: 1.4 }, { side: 's', at: 17, w: 1.4 }, { side: 's', at: 23, w: 1.4 }, { side: 's', at: 29, w: 1.4 }], 0xe8e0d0);
    for (const xr of [14, 20, 26]) { box(hb, MT.stucco, 0xe8e0d0, xr - .11, xr + .11, 0, wH, 73.3, H.z1); ctx.cols.push([xr - .11, xr + .11, 73.3, H.z1]) }
    box(hb, MT.wood, 0xffffff, H.x0, H.x1, .0, .06, H.z0, H.z1);                                                   // wooden floor
    box(hb, MT.stucco, 0xd8d0c0, H.x0 - .3, H.x1 + .3, wH, wH + .35, H.z0 - .3, H.z1 + .3);                         // roof slab
    box(hb, MT.v, 0x8aa0b0, 26, 29, wH + .35, wH + 2.2, 80, 83); box(hb, MT.v, 0x6a6a6a, 12, 12.1, wH, wH + 3, 84, 84.1);   // rooftop water tank + antenna
    /* front: big shop window glass, terrace canopy with rainbow strip, sign, mural, neon */
    const gw = new THREE.Mesh(BG.box, glassM); gw.position.set(26, 1.6, H.z0 + .1); gw.scale.set(9.5, 2.6, .05); grp.add(gw);
    box(hb, MT.shiny, 0x8a8a8a, 18.2, 31.8, 0, .25, H.z0 - .05, H.z0 + .25); box(hb, MT.shiny, 0x8a8a8a, 18.2, 31.8, 2.85, 3.1, H.z0 - .05, H.z0 + .25);
    box(hb, MT.shiny, 0x6a6a72, H.x0 - .5, H.x1 + .5, 3.35, 3.45, 47.4, H.z0); for (const x of [H.x0 - .3, 20, H.x1 + .3]) { box(hb, MT.shiny, 0x8a8a8a, x - .08, x + .08, 0, 3.4, 47.6, 47.76); ctx.circles.push([x, 47.7, .15]) }
    { const rb = new THREE.Mesh(BG.box, new THREE.MeshStandardMaterial({ map: rainbowTex(), emissiveMap: rainbowTex(), emissive: 0xffffff, emissiveIntensity: .25, roughness: .6 })); rb.material.userData.lin = 1; rb.position.set(20, 3.25, 47.5); rb.scale.set(H.x1 - H.x0 + 1, .5, .06); grp.add(rb); ctx.upd.push(() => rb.material.emissiveIntensity = .15 + (AV.nightK || 0) * .9) }
    { const sm = new THREE.MeshStandardMaterial({ map: giantSignTex(), emissiveMap: giantSignTex(), emissive: 0xffffff, emissiveIntensity: .1, roughness: .8 }); sm.userData.lin = 1; const sg = new THREE.Mesh(AV.G.pln, sm); sg.position.set(19.5, 6.35, H.z0 - .32); sg.scale.set(10.4, 5.2, 1); sg.rotation.y = Math.PI; grp.add(sg); /* faces the street (north), above the canopy */ box(hb, MT.wood, 0x5a3a1a, 14.1, 24.9, 3.6, 9.1, H.z0 - .28, H.z0 - .18); ctx.upd.push(() => sm.emissiveIntensity = .08 + (AV.nightK || 0) * .55) }
    { const mm = new THREE.MeshStandardMaterial({ map: muralTex(), roughness: .9 }); mm.userData.lin = 1; const mu = new THREE.Mesh(AV.G.pln, mm); mu.position.set(10.9, 1.75, H.z0 - .14); mu.scale.set(5, 3.3, 1); mu.rotation.y = Math.PI; grp.add(mu) }
    { const nm = new THREE.MeshBasicMaterial({ map: leafNeonTex(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }); nm.userData.lin = 1; const ne = new THREE.Mesh(AV.G.pln, nm); ne.position.set(22.6, 1.9, H.z0 - .16); ne.scale.set(1.6, 1.6, 1); ne.rotation.y = Math.PI; grp.add(ne); ctx.upd.push((dt, t) => nm.opacity = .75 + Math.sin(t * 11) * .03 + (Math.sin(t * .7) > .97 ? -.4 : 0)) }
    /* terrace furniture: ZtonedApe's bench, tables, Dino's cushion corner, plants, gecko */
    const bench = (x, z, ry, w) => { const c = Math.cos(ry), s = Math.sin(ry), P = (u, y, v, su, sy, sv, col) => hb.add(MT.wood, BG.box, col || 0xffffff, M(x + u * c + v * s, y, z - u * s + v * c, su, sy, sv, 0, ry, 0)); P(0, .45, 0, w, .08, .5); P(0, .78, -.24, w, .5, .07); for (const u of [-w / 2 + .15, w / 2 - .15]) P(u, .22, 0, .08, .45, .45, 0x6a4a2a); ctx.circles.push([x, z, Math.min(.6, w / 3)]) };
    bench(13.6, 49.3, Math.PI, 2.2); bench(17.6, 49.3, Math.PI, 2.2);   // backs to the hostel, facing the street
    const table = (x, z, r0) => { hb.add(MT.wood, A.geo('cyl'), 0xffffff, M(x, .72, z, r0, .06, r0)); hb.add(MT.v, A.geo('cyl'), 0x3a3a3a, M(x, .36, z, .05, .72, .05)); ctx.circles.push([x, z, r0 * .8]) };
    table(10.9, 50.7, .45); table(24, 50.3, .5); bench(24, 49.1, Math.PI, 1.6);   // (door path at x 14.2–16.8 stays clear)
    for (const [x, z] of [[28.5, 49.6], [30.2, 49.6], [29.4, 50.9]]) hb.add(MT.v, A.geo('cyl'), [0xd84a8a, 0x4ac8c8, 0xffd84a][Math.round(x) % 3], M(x, .2, z, .55, .4, .55));   // cushions
    hb.add(MT.v, A.geo('cyl'), 0x3a3a3a, M(29.4, .25, 50.1, .3, .5, .3)); hb.add(MT.v, A.geo('cyl'), 0xe8303a, M(29.4, .52, 50.1, .22, .06, .22)); hb.add(MT.v, A.geo('cyl'), 0xffd84a, M(29.4, .54, 50.1, .14, .06, .14));   // rasta ashtray stand
    for (const [x, z, s] of [[8.6, 48.6, 1], [31.4, 48.5, 1.1], [19.8, 51.2, .8], [33.3, 50.5, .9]]) { hb.add(MT.v, A.geo('cyl'), 0x7a4a2a, M(x, .3, z, .32 * s, .6, .32 * s)); for (let k = 0; k < 9; k++) { const a = k * 2.39, el = .55 + (k % 3) * .25; hb.add(MT.dbl, A.geo('petal'), k % 2 ? 0x3a9a3a : 0x2f8a3a, M(x + Math.cos(a) * .1 * s, .55 * s, z + Math.sin(a) * .1 * s, .16 * s, el * s * 1.6, .07 * s, 0, -a, 0).multiply(M(0, 0, 0, 1, 1, 1, -.55, 0, 0)), .05) } ctx.circles.push([x, z, .4]) }   // leafy potted plants
    const gecko = (x, y, z, ry) => { hb.add(MT.v, BG.sph, 0x7ad84a, M(x, y, z, .12, .05, .3, 0, ry, 0), .3); hb.add(MT.v, BG.sph, 0x9aff6a, M(x + Math.sin(ry) * .32, y, z + Math.cos(ry) * .32, .08, .05, .1, 0, ry, 0), .3) };
    gecko(H.x1 + .02, 2.6, 49.5, 0); gecko(9, 3.2, H.z0 - .05, Math.PI / 2);
    /* reception, festival board, key rack */
    box(hb, MT.wood, 0xffffff, 9, 13.2, 0, 1.1, 55.6, 56.6); box(hb, MT.v, 0x2a2a2a, 9, 13.2, 1.1, 1.16, 55.5, 56.7); ctx.cols.push([9, 13.2, 55.6, 56.6]);
    hb.add(MT.shiny, BG.sph, 0xe8c040, M(12.6, 1.2, 55.8, .08, .05, .08)); box(hb, MT.v, 0x3a3a3a, 10, 10.6, 1.16, 1.5, 56, 56.4, .4);                                // bell + screen
    box(hb, MT.v, 0x2a3a2a, 8.25, 8.35, 1.2, 2.8, 57.5, 60.5); for (let k = 0; k < 9; k++) box(hb, MT.v, [0xff4ad2, 0xffd84a, 0x4ac8ff][k % 3], 8.36, 8.4, 1.4 + (k % 3) * .45, 1.7 + (k % 3) * .45, 57.7 + (k / 3 | 0) * 1, 58.4 + (k / 3 | 0) * 1, .8);   // festival board
    /* shop counter (adults-only cannabis counter) with jar shelves */
    box(hb, MT.wood, 0xffffff, 23, 31.6, 0, 1.05, 55, 56); ctx.cols.push([23, 31.6, 55, 56]); box(hb, MT.v, 0x1a1a1a, 23, 31.6, 1.05, 1.1, 54.9, 56.1);
    for (let k = 0; k < 2; k++) box(hb, MT.wood, 0xd8b080, 23.5, 31.5, 1.6 + k * .7, 1.66 + k * .7, 57.6, 58.1);
    box(hb, MT.v, 0x2a2020, 23.4, 31.6, 1.1, 3.2, 58.1, 58.3); ctx.cols.push([23.4, 31.6, 57.6, 58.3]);
    for (let k = 0; k < 14; k++) { const x = 24 + (k % 7) * 1.05, y = 1.66 + (k / 7 | 0) * .7; hb.add(MT.dbl, A.geo('cyl'), 0xd8f0e8, M(x, y + .17, 57.85, .13, .34, .13), .05); hb.add(MT.v, BG.sph, 0x6a9a3a, M(x, y + .12, 57.85, .1, .1, .1)); hb.add(MT.v, A.geo('cyl'), 0x2a2a2a, M(x, y + .36, 57.85, .13, .04, .13)) }
    box(hb, MT.v, 0x16161a, 25, 30, 2.4, 3.4, 58.32, 58.4, .2); sign('SHOP · adults only', 27.5, 3.6, 58.0, Math.PI, 2.6, '#7aff9a');
    /* lounge: sofas, bean bags, TV, low tables, posters, string lights */
    const sofa = (x, z, ry, col) => { const c = Math.cos(ry), s = Math.sin(ry), P = (u, y, v, su, sy, sv, cc) => hb.add(MT.v, BG.box, cc || col, M(x + u * c + v * s, y, z - u * s + v * c, su, sy, sv, 0, ry, 0)); P(0, .25, 0, 2.4, .5, .9); P(0, .75, -.38, 2.4, .7, .2); P(-1.15, .5, 0, .2, .6, .9); P(1.15, .5, 0, .2, .6, .9); P(-.6, .55, .05, .9, .14, .7, 0xffd84a); ctx.circles.push([x, z, 1.1]) };
    sofa(12, 66.5, Math.PI, 0x7a3aa8); sofa(9.2, 63, -Math.PI / 2, 0x2a8a8a); table(12, 63.6, .55);
    for (const [x, z, c] of [[16.5, 61.5, 0xff8a3a], [17.6, 64.4, 0x4ac8ff]]) hb.add(MT.v, BG.sph, c, M(x, .35, z, .55, .4, .55));
    box(hb, MT.v, 0x111116, 13, 15.6, 1.4, 2.9, 69.6, 69.75, .25); box(hb, MT.v, 0x2a2a2a, 13.2, 15.4, 0, .5, 69.1, 69.7);
    for (const [x, col] of [[17.5, 0x2a9a4a], [19.8, 0xe83a30], [21.4, 0xffd23a]]) box(hb, MT.v, col, x, x + 1.4, 1.6, 3, 69.65, 69.72, .15);
    K.lanterns(ctx, [[H.x0 + .3, 3.9, 58.5], [H.x1 - .3, 3.9, 60.5], [H.x0 + .3, 3.9, 66], [H.x1 - .3, 3.9, 68]], { cols: [0xffd84a, 0xff4ad2, 0x7ff0ff, 0x7aff8a], per: 9, sag: .3 });
    /* pool table (3D) */
    const poolTable = (b, x, z, ry) => { const c = Math.cos(ry), s = Math.sin(ry), P = (u, y, v, su, sy, sv, col, mat, gl) => b.add(mat || MT.v, BG.box, col, M(x + u * c + v * s, y, z - u * s + v * c, su, sy, sv, 0, ry, 0), gl);
      P(0, .78, 0, 2.7, .06, 1.45, 0x1a7a5a); P(0, .7, 0, 2.95, .2, 1.7, 0x5a2e14, MT.wood); for (const u of [-1.2, 1.2]) for (const v of [-.55, .55]) P(u, .35, v, .16, .7, .16, 0x3a1e0c, MT.wood);
      for (const sd of [-1, 1]) { P(0, .86, sd * .79, 2.95, .1, .12, 0x5a2e14, MT.wood); P(sd * 1.42, .86, 0, .12, .1, 1.7, 0x5a2e14, MT.wood) }
      for (const [u, v] of [[-1.36, -.7], [0, -.73], [1.36, -.7], [-1.36, .7], [0, .73], [1.36, .7]]) P(u, .84, v, .13, .03, .13, 0x0a0a0a);
      const bc = [0xf2c41a, 0x1a4ad8, 0xd8281a, 0x5a2a9a, 0xf07a1a, 0x1a8a3a, 0x111111]; for (let k = 0; k < 7; k++) { const u = .5 + (k % 3) * .06, v = ((k % 3) - 1) * .06 + (k / 3 | 0) * .03; b.add(MT.shiny, BG.sph, bc[k], M(x + u * c + v * s, .845, z - u * s + v * c, .03, .03, .03)) } b.add(MT.shiny, BG.sph, 0xf4f0e4, M(x - .6 * c, .845, z + .6 * s, .03, .03, .03));
      P(0, 2.4, 0, 1.4, .12, .3, 0xfff0c0, MT.v, 1); ctx.circles.push([x - .9 * c, z + .9 * s, .9], [x, z, .9], [x + .9 * c, z - .9 * s, .9]) };
    poolTable(hb, 25.5, 64, 0); box(hb, MT.wood, 0xffffff, 31.3, 31.6, .5, 2.4, 61.5, 63.5); for (let k = 0; k < 4; k++) hb.add(MT.wood, A.geo('cyl'), 0xd8b080, M(31.45, 1.4, 61.8 + k * .5, .02, 1.6, .02));
    /* guest rooms (4): bunks, lockers, window, lamp */
    for (let k = 0; k < 4; k++) { const rx = H.x0 + k * 6, cx2 = rx + 3; for (const side of [-1, 1]) { const bx = cx2 + side * 1.9; box(hb, MT.wood, 0x8a5a3a, bx - .55, bx + .55, .3, .55, 77.5, 81.5); box(hb, MT.v, 0xf0f0f0, bx - .5, bx + .5, .55, .7, 77.6, 81.4); box(hb, MT.v, [0x4ac8ff, 0xff8ad8, 0x8aff8a, 0xffd84a][k], bx - .5, bx + .5, .7, .76, 78.6, 81.4); box(hb, MT.wood, 0x8a5a3a, bx - .55, bx + .55, 1.8, 2.0, 77.5, 81.5); box(hb, MT.v, 0xf0f0f0, bx - .5, bx + .5, 2.0, 2.15, 77.6, 81.4); for (const zz of [77.5, 81.4]) box(hb, MT.wood, 0x6a4a2a, bx - .55, bx - .45, 0, 2.6, zz, zz + .1); ctx.cols.push([bx - .55, bx + .55, 77.5, 81.5]) }
      box(hb, MT.v, 0x6a7a8a, rx + 1.4, rx + 4.6, 0, 1.8, H.z1 - .6, H.z1 - .25); ctx.cols.push([rx + 1.4, rx + 4.6, H.z1 - .6, H.z1 - .25]); box(hb, MT.v, 0xffe0a0, rx + 2.2, rx + 3.8, 2.2, 3.2, H.z1 - .3, H.z1 - .2, .8); box(hb, MT.v, 0xfff0c0, cx2 - .3, cx2 + .3, 3.9, 4.1, 79.4, 79.8, 1) }
    sign('Rooms 1–4', 15, 3.4, 70.35, Math.PI, 2, '#ffd84a');
    { const l = new THREE.PointLight(0xffc98a, 1.3, 22); l.position.set(18, 3.6, 62); grp.add(l); const l2 = new THREE.PointLight(0xffb08a, .7, 14); l2.position.set(20, 3.5, 80); grp.add(l2) }
    occ.push({ x0: 5, x1: 34, z0: 47, z1: 89 });

    /* ---------- Blue's Live Music Bar: directly OPPOSITE the hostel (interior authored in the old coordinates, mapped by bX/bZ) ---------- */
    { const O = { x0: 34, x1: 52, z0: 52, z1: 70 }, bb = (mat, col, x0, x1, y0, y1, z0, z1, gl) => box(hb, mat, col, bX(x1), bX(x0), y0, y1, bZ(z1), bZ(z0), gl), bc = (x0, x1, z0, z1) => ctx.cols.push([bX(x1), bX(x0), bZ(z1), bZ(z0)]);
      bb(MT.stucco, 0x2a3a6a, O.x0, O.x1, 0, 4.6, O.z1 - .25, O.z1); bb(MT.stucco, 0x2a3a6a, O.x0, O.x0 + .25, 0, 4.6, O.z0, O.z1); bb(MT.stucco, 0x2a3a6a, O.x1 - .25, O.x1, 0, 4.6, O.z0, O.z1); bc(O.x0, O.x1, O.z1 - .25, O.z1); bc(O.x0, O.x0 + .25, O.z0, O.z1); bc(O.x1 - .25, O.x1, O.z0, O.z1);
      bb(MT.stucco, 0x1a2a4a, O.x0, O.x1, 4.6, 5, O.z0 - .5, O.z1); bb(MT.wood, 0xffffff, O.x0 + .3, O.x1 - .3, 0, .06, O.z0, O.z1); bb(MT.wood, 0xffffff, 37, 49, 0, .6, 63.5, 69.6); bc(37, 49, 64.2, 69.6); walk.pad(bX(43), bZ(66.5), 4.5, .6);
      for (const x of [38.5, 47.5]) { bb(MT.v, 0x16141e, x - .7, x + .7, .6, 2.6, 68, 69.2); hb.add(MT.v, A.geo('cyl'), 0x3a3a48, M(bX(x), 1.9, bZ(67.95), .45, .04, .45, Math.PI / 2, 0, 0)) }
      hb.add(MT.v, A.geo('cyl'), 0xc83a2a, M(bX(43), 1.0, bZ(66.5), .35, .5, .35)); hb.add(MT.v, A.geo('cyl'), 0xf0e8d0, M(bX(43), 1.27, bZ(66.5), .34, .03, .34)); hb.add(MT.shiny, A.geo('cyl'), 0xe0c040, M(bX(42.2), 1.6, bZ(66.2), .3, .02, .3));   // drum kit
      for (const [x, z] of [[37, 56], [41, 58], [45.5, 56], [49, 58.5], [39, 61]]) { table(bX(x), bZ(z), .5); for (const a of [0, 2.1, 4.2]) hb.add(MT.v, A.geo('cyl'), 0x3a2a5a, M(bX(x + Math.cos(a) * .85), .25, bZ(z + Math.sin(a) * .85), .22, .5, .22)) }
      bb(MT.wood, 0x5a3a2a, 49.2, 51.6, 0, 1.1, 55, 62); bc(49.2, 51.6, 55, 62); bb(MT.v, 0x4a8aff, O.x0 + .3, O.x1 - .3, 4.3, 4.4, 52.2, 52.4, 1);
      const l = new THREE.PointLight(0x6a8aff, 1.2, 18); l.position.set(bX(43), 3.8, bZ(64)); grp.add(l); sign('BLUE’S Live Music Bar', bX(43), 5.6, bZ(O.z0 - .6), 0, 6, '#6ab8ff') }
    occ.push({ x0: 7, x1: 27, z0: 21.5, z1: 41.5 });

    /* ---------- other enterable venues (open front rooms) ---------- */
    const venue = (r0, face, col, name, signCol, furnish) => {
      const t = .25, x0 = r0.x0, x1 = r0.x1, z0 = r0.z0, z1 = r0.z1, mid = face === 's' ? (x0 + x1) / 2 : face === 'n' ? (x0 + x1) / 2 : (z0 + z1) / 2, dw = Math.min(3, (face === 'n' || face === 's' ? x1 - x0 : z1 - z0) * .3);
      const doors = [{ side: face, at: mid, w: dw }]; const old = hb; room(x0, x1, z0, z1, doors, col);
      box(hb, MT.stucco, shadeHex(col, .85), x0 - .2, x1 + .2, wH, wH + .4, z0 - .2, z1 + .2); box(hb, MT.wood, 0xffffff, x0 + t, x1 - t, 0, .05, z0 + t, z1 - t);
      const sx2 = face === 'n' || face === 's' ? mid : face === 'e' ? x1 + .35 : x0 - .35, sz2 = face === 'n' ? z0 - .35 : face === 's' ? z1 + .35 : mid, ry = face === 'n' ? Math.PI : face === 's' ? 0 : face === 'e' ? Math.PI / 2 : -Math.PI / 2;   // sign faces the street
      sign(name, sx2, 3.6, sz2, ry, Math.min(6, (face === 'n' || face === 's' ? x1 - x0 : z1 - z0) - 1), signCol);
      const l = new THREE.PointLight(0xffd8a0, .8, 12); l.position.set((x0 + x1) / 2, 3.4, (z0 + z1) / 2); grp.add(l);
      if (furnish) furnish(x0, x1, z0, z1); occ.push({ x0: x0 - 1, x1: x1 + 1, z0: z0 - 1, z1: z1 + 1 });
    };
    function shadeHex(h, k) { return new THREE.Color(h).multiplyScalar(k).getHex() }
    /* Pineapple Express: now next door to the hostel (door on the north side, facing the street) */
    venue(PINE, 'n', 0x3a6a3a, 'PINEAPPLE EXPRESS · chill bar', '#ffd84a', (x0, x1, z0, z1) => { for (const [x, z] of [[x0 + 4, z0 + 5], [x0 + 8, z0 + 8], [x0 + 12, z0 + 4.5]]) { table(x, z, .5); for (const a of [0, 3.1]) hb.add(MT.v, BG.sph, [0xff8a3a, 0x4ac8c8][a > 1 ? 1 : 0], M(x + Math.cos(a) * .9, .3, z + Math.sin(a) * .9, .45, .3, .45)) } box(hb, MT.wood, 0xffd84a, x0 + 1, x0 + 5, 0, 1.05, z1 - 1.4, z1 - .6); ctx.cols.push([x0 + 1, x0 + 5, z1 - 1.4, z1 - .6]); hb.add(MT.v, BG.sph, 0xffd23a, M(x1 - 2.5, 3.2, z1 - 1.2, .5, .7, .5), .6); hb.add(MT.v, BG.cone, 0x3a9a3a, M(x1 - 2.5, 3.9, z1 - 1.2, .3, .5, .3)) });
    venue(KAE, 's', 0xf2d8a8, 'KHUN KAE’S Juice Bar', '#ff7ab8', (x0, x1, z0, z1) => { box(hb, MT.wood, 0xffffff, 29, 39, 0, 1.05, 29.2, 30); ctx.cols.push([29, 39, 29.2, 30]); for (let k = 0; k < 8; k++) hb.add(MT.v, BG.sph, [0xff8a3a, 0xffd23a, 0xe83a5a, 0x7ad84a][k % 4], M(29.6 + k * 1.2, 1.18, 29.6, .14, .14, .14), .2); table(33, 36, .5); table(37, 37, .45) });
    venue(CHADA, 's', 0xd8e8c8, 'CHADA’S Vegetarian', '#7aff9a', (x0, x1, z0, z1) => { for (const [x, z] of [[47, 31], [52, 31], [47, 36], [52, 36]]) { table(x, z, .55); for (const a of [0, 1.57, 3.14, 4.71]) hb.add(MT.v, A.geo('cyl'), 0x8a5a3a, M(x + Math.cos(a) * .8, .25, z + Math.sin(a) * .8, .18, .5, .18)) } box(hb, MT.wood, 0xffffff, 44.5, 55.5, 0, 1.05, 26.6, 27.4); ctx.cols.push([44.5, 55.5, 26.6, 27.4]) });
    venue(MART, 'n', 0xf4f4f4, '24H MINI MART', '#ff8a3a', (x0, x1, z0, z1) => { for (const z of [51.5, 54.5, 57.5]) { box(hb, MT.v, 0xd8d8d8, -14.5, -5.5, 0, 1.8, z - .3, z + .3); ctx.cols.push([-14.5, -5.5, z - .3, z + .3]); for (let k = 0; k < 12; k++) hb.add(MT.v, BG.box, [0xe83a3a, 0x3a8ad8, 0xffd84a, 0x3ac85a, 0xff8ad8][k % 5], M(-14 + k * .75, 1.0 + (k % 3) * .35, z, .3, .3, .5), .1) } box(hb, MT.v, 0x9ad8ff, -15.6, -14.9, 0, 2, 49, 59, .3) });
    /* Rack & Roll Pool Bar (Nuni's mission) */
    venue(POOLBAR, 's', 0x2a1a3a, 'RACK & ROLL Pool Bar', '#ff4ad2', (x0, x1, z0, z1) => { poolTable(hb, 147, -16, 0); poolTable(hb, 155, -16, 0); box(hb, MT.wood, 0x5a3a2a, 143, 145, 0, 1.1, -24.5, -18); ctx.cols.push([143, 145, -24.5, -18]); for (let k = 0; k < 10; k++) hb.add(MT.dbl, A.geo('cyl'), [0x2a7a3a, 0x8a5a1a, 0xd8d8d8][k % 3], M(143.3 + (k % 2) * .4, 1.25, -24 + k * .6, .05, .3, .05), .1); box(hb, MT.v, 0xff4ad2, x0 + .3, x1 - .3, 3.9, 4, z0 + .3, z0 + .45, 1); box(hb, MT.v, 0x2a9a4a, 158.5, 159.6, 1.3, 2.9, -25.5, -25.4, .3); box(hb, MT.v, 0xffd23a, 156.5, 157.8, 1.3, 2.9, -25.5, -25.4, .3) });
    /* ---------- temples ---------- */
    const gableGeo = (() => { const s = new THREE.Shape(); s.moveTo(-.5, 0); s.lineTo(.5, 0); s.lineTo(0, 1); s.lineTo(-.5, 0); const g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false }); g.translate(0, 0, -.5); return g })();
    const viharn = (b, x, z, w, d, ry, opt) => {   // Lanna temple hall: platform, steps, walls, 3 layered red roofs with gold trims and chofa
      opt = opt || {}; const c = Math.cos(ry), s = Math.sin(ry), P = (g, mat, col, u, y, v, su, sy, sv, gl, rx, rz) => b.add(mat, g, col, M(x + u * c + v * s, y, z - u * s + v * c, su, sy, sv, rx || 0, ry, rz || 0), gl);
      P(BG.box, MT.stucco, 0xf4f0e8, 0, .4, 0, w + 2, .8, d + 2); for (let k = 0; k < 3; k++) P(BG.box, MT.stucco, 0xf4f0e8, 0, .14 + k * .13, d / 2 + 1.3 + (2 - k) * .35, 3.2, .27 + k * .26, .35);
      for (const su of [-1, 1]) { P(BG.box, MT.v, 0x3a9a5a, su * 1.9, 1.1, d / 2 + 1.6, .25, 1.2, 1.6, .1); P(BG.cone, MT.shiny, 0xe8b830, su * 1.9, 1.9, d / 2 + 2.3, .2, .5, .2, .3) }   // naga balustrades
      P(BG.box, MT.stucco, opt.wall || 0xe8d8b8, 0, 2.6, -d / 2 + .2, w, 3.6, .3); for (const su of [-1, 1]) P(BG.box, MT.stucco, opt.wall || 0xe8d8b8, su * (w / 2 - .15), 2.6, 0, .3, 3.6, d);
      for (let k = 0; k < 6; k++) { const v = -d / 2 + (k + .5) * d / 6; for (const su of [-1, 1]) P(A.geo('cyl'), MT.v, 0xa83a2a, su * (w / 2 - .7), 2.6, v, .25, 3.6, .25) }
      for (let t = 0; t < 3; t++) { const ww = w + 2.2 - t * 1.6, hh = 2.2 - t * .2, yy = 4.4 + t * 1.3, dd = d + 1.6 - t * 1.6; P(gableGeo, ROOF, 0xc83a2a, 0, yy, 0, ww, hh, dd); P(BG.box, MT.shiny, 0xe8b830, 0, yy + hh - .05, 0, .18, .18, dd + .2, .25);
        for (const vz of [-1, 1]) for (const su of [-1, 1]) P(BG.box, MT.shiny, 0xe8b830, su * ww / 4, yy + hh / 2, vz * (dd / 2 + .02), ww * .56, .12, .1, .25, 0, su * -Math.atan2(hh, ww / 2));
        for (const vz of [-1, 1]) P(BG.cone, MT.shiny, 0xf2c840, 0, yy + hh + .35, vz * (dd / 2 + .1), .12, .8, .12, .4, vz * .4) }
      P(BG.box, MT.shiny, 0xe8b830, 0, 3.9, d / 2 + .05, w, .5, .08, .3); P(BG.box, MT.v, 0x7a1a1a, 0, 2.1, d / 2 + .05, 2.6, 3, .06);   // gold lintel, door
      /* seated golden Buddha inside */
      const bu = (u, v, sc) => { P(A.geo('cyl'), MT.shiny, 0xe8b830, u, 1.25 * sc + .8, v, .9 * sc, .5 * sc, .9 * sc, .2); P(BG.sph, MT.shiny, 0xf2c840, u, 1.75 * sc + .8, v, .85 * sc, .35 * sc, .55 * sc, .25); P(BG.sph, MT.shiny, 0xf2c840, u, 2.55 * sc + .8, v, .5 * sc, .75 * sc, .4 * sc, .25); P(BG.sph, MT.shiny, 0xf2c840, u, 3.5 * sc + .8, v, .3 * sc, .35 * sc, .3 * sc, .3); P(BG.cone, MT.shiny, 0xf2c840, u, 4.0 * sc + .8, v, .12 * sc, .4 * sc, .12 * sc, .4) };
      bu(0, -d / 2 + 2, 1); ctx.cols.push(rotRect(x, z, w + 2, d + 2, ry));
    };
    const rotRect = (x, z, w, d, ry) => { const c = Math.abs(Math.cos(ry)), s = Math.abs(Math.sin(ry)), hw = (w * c + d * s) / 2, hd = (w * s + d * c) / 2; return [x - hw, x + hw, z - hd, z + hd] };
    const goldChedi = (b, x, z, sc) => { const pts = [[0, 0], [3, 0], [3, 1], [2.6, 1], [2.6, 2], [2.2, 2], [2.2, 2.6], [2.4, 3.4], [2.2, 4.8], [1.6, 5.8], [.9, 6.4], [.7, 7], [.5, 7.6], [.35, 8.4], [.08, 10.5], [0, 10.6]].map(p => new THREE.Vector2(p[0] * sc, p[1] * sc)); b.add(MT.shiny, new THREE.LatheGeometry(pts, 24), 0xf0c040, M(x, 0, z), .35); ctx.circles.push([x, z, 3.1 * sc]) };
    /* Wat Chedi Luang: huge ruined brick chedi on a stepped base, naga stairs, elephants */
    { const x = -28, z = 24, b = B.temple; for (let t = 0; t < 3; t++) { const w = 28 - t * 7, y0 = t * 4.4; box(b, brick, 0xffffff, x - w / 2, x + w / 2, y0, y0 + 4.4, z - w / 2, z + w / 2) }
      b.add(brick, new THREE.LatheGeometry([[0, 0], [5.5, 0], [5.2, 3], [4.2, 6], [2.6, 8.5], [1.2, 9.6], [0, 9.8]].map(p => new THREE.Vector2(p[0], p[1])), 16), 0xffffff, M(x, 13.2, z, 1, 1, 1, .05, 0, .07));
      for (const [dx, dz] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) { for (let k = 0; k < 10; k++) { const p = 14.5 - k * .7; box(b, brick, 0xe8c8b8, x + dx * p - (dz ? 2.2 : .35), x + dx * p + (dz ? 2.2 : .35), 0, k * 1.32 + .4, z + dz * p - (dx ? 2.2 : .35), z + dz * p + (dx ? 2.2 : .35)) } for (const s2 of [-1, 1]) b.add(MT.v, BG.box, 0x5aa06a, M(x + dx * 11 + dz * s2 * 2.5, 3.5, z + dz * 11 + dx * s2 * 2.5, dz ? .4 : 7, 1, dx ? .4 : 7, 0, 0, 0), .05) }
      for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + .39, ex = x + Math.cos(a) * 14.5, ez = z + Math.sin(a) * 14.5; if (Math.abs(Math.cos(a)) > .9 || Math.abs(Math.sin(a)) > .9) continue; b.add(MT.stone, BG.sph, 0x9a8a80, M(ex, 1.1, ez, .9, .8, 1.3, 0, a, 0)); b.add(MT.stone, BG.sph, 0x9a8a80, M(ex + Math.cos(a) * .2, 1.6, ez + Math.sin(a) * .2, .6, .6, .6)) }
      solid(x - 14.2, x + 14.2, z - 14.2, z + 14.2); viharn(B.temple, -28, 8.6, 9, 4.6, 0, { wall: 0xf0e0c8 }); sign('WAT CHEDI LUANG', -14, 3.4, 7.4, Math.PI, 4.6, '#ffd84a', true) }
    /* Wat Phra Singh (west end of the main road) + gold chedi */
    viharn(B.temple, -77, -22, 11, 18, 0, { wall: 0xf4ecd8 }); goldChedi(B.temple, -77, -45, 1.1); sign('WAT PHRA SINGH', -66, 3.6, -6.6, Math.PI / 4, 4.6, '#ffd84a', true);
    /* teak temple near the hostel */
    viharn(B.temple, -39, 66, 8, 12, 0, { wall: 0x6a3a1a }); goldChedi(B.temple, -39, 77, .55);
    /* Gecko Shrine (Dino's secret) */
    { const x = -80, z = -80, b = B.temple; box(b, MT.stone, 0xd8c8b0, x - 2, x + 2, 0, .5, z - 2, z + 2); box(b, MT.v, 0xa83a2a, x - .8, x + .8, .5, 2.3, z - .8, z + .8); b.add(ROOF, A.geo('hip'), 0xffffff, M(x, 2.9, z, 1.4, 1.2, 1.4, 0, Math.PI / 4, 0)); b.add(MT.v, BG.sph, 0x7ad84a, M(x, 1.5, z + .82, .2, .5, .06), .8); b.add(MT.v, BG.sph, 0x9aff6a, M(x, 2.0, z + .84, .14, .14, .06), .8); solid(x - 2, x + 2, z - 2, z + 2);
      for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; b.add(MT.v, BG.cone, 0x4a9a3a, M(x + Math.cos(a) * 5, .9, z + Math.sin(a) * 5, .5, 1.8, .5)) } }
    /* Buak Hard Park: pond, paths, benches */
    { const pw = K.waterPlane(ctx, new THREE.CircleGeometry(7, 40), .03, { deep: 0x2a6a6a, shallow: 0x4ac8b0, sky: 0xb0e0ff, iri: .2, opacity: .9 }); pw.position.set(-77, 0, 66); ctx.circles.push([-77, 66, 7]); for (const [x, z, r0] of [[-84, 82, 0], [-68, 80, 1.57], [-70, 54, 3.14]]) bench(x, z, r0, 2); sign('BUAK HARD PARK', -64, 2.6, 49.5, Math.PI * .75, 3.6, '#7aff9a', true) }
    /* ---------- Tha Phae Gate plaza ---------- */
    box(B.east, MT.stone, 0xe8d8b8, 127, 133, 0, .5, 8, 14); ctx.cols.push([127, 133, 8, 14]); walk.pad(130, 11, 3, .5);   // busker stage
    for (const [x, z] of [[126, -18], [138, -18], [126, 19], [138, 19]]) { B.east.add(MT.v, A.geo('cyl'), 0x3a3a3a, M(x, 2, z, .1, 4, .1)); B.night.add(MT.v, BG.sph, 0xfff0c0, M(x, 4.1, z, .3, .3, .3), 1) }
    /* ---------- Night Bazaar (stalls open 17:00–24:00) + Warorot Market (06:00–18:00) ---------- */
    const stalls = [], STC = [0xe83a3a, 0x3a8ad8, 0xffd84a, 0x2a9a5a, 0xff8ad8, 0xff8a3a];
    const stall = (b, x, z, ry, col, goods) => { const c = Math.cos(ry), s = Math.sin(ry), P = (g, mat, cc, u, y, v, su, sy, sv, gl) => b.add(mat, g, cc, M(x + u * c + v * s, y, z - u * s + v * c, su, sy, sv, 0, ry, 0), gl);
      for (const [u, v] of [[-1.3, -1], [1.3, -1], [-1.3, 1], [1.3, 1]]) P(A.geo('cyl6'), MT.v, 0xd8d8d8, u, 1.2, v, .05, 2.4, .05); P(A.geo('hip'), MT.roof, col, 0, 2.8, 0, 2.2, .9, 1.7); P(BG.box, MT.wood, 0xffffff, 0, .45, .7, 2.6, .9, .6); stalls.push({ x: x + .7 * s, z: z + .7 * c, ry }); ctx.circles.push([x + .7 * s, z + .7 * c, .9]) };
    { const r = AV.rng(55); for (let i = 0; i < 6; i++) for (let j = 0; j < 5; j++) { const x = BAZAAR.x0 + 6 + i * 11, z = BAZAAR.z0 + 6 + j * 12; if (i === 2 && j === 2) continue; stall(B.east, x, z, j % 2 ? 0 : Math.PI, STC[(i + j) % 6]) } }
    const goodsOpen = K.batch(), goodsClosed = K.batch();
    stalls.forEach((st, i) => { goodsOpen.add(MT.v, BG.box, STC[i % 6], M(st.x, 1.0, st.z, 1.2, .2, .4, 0, st.ry, 0), .3); goodsOpen.add(MT.v, BG.sph, 0xfff0c0, M(st.x, 2.3, st.z, .15, .15, .15), 1); goodsClosed.add(MT.roof, BG.box, 0x6a7a9a, M(st.x, .95, st.z, 2.7, .1, .7, 0, st.ry, 0)) });
    /* food court tables in the middle */
    for (let k = 0; k < 6; k++) table(BAZAAR.x0 + 26 + (k % 3) * 2.6, BAZAAR.z0 + 26 + (k / 3 | 0) * 2.6, .5);
    sign('NIGHT BAZAAR', 183.5, 4.6, 9.6, Math.PI, 6, '#ff8ac0', true); sign('WAROROT MARKET', 178, 4.6, -9.6, 0, 5, '#ffd84a', true);
    { const b = B.east, w = WARO; for (let x = w.x0; x <= w.x1; x += 6) for (const z of [w.z0, w.z1]) { b.add(MT.v, A.geo('cyl'), 0x8a8a8a, M(x, 3.5, z, .25, 7, .25)); ctx.circles.push([x, z, .3]) } b.add(ROOF, gableGeo, 0xc8503a, M((w.x0 + w.x1) / 2, 7, (w.z0 + w.z1) / 2, w.z1 - w.z0 + 3, 4, w.x1 - w.x0 + 3, 0, Math.PI / 2, 0));
      for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) stall(b, w.x0 + 8 + i * 12, w.z0 + 9 + j * 12, Math.PI / 2, STC[(i * 3 + j) % 6]) }
    /* ---------- Lantern Field (Yi Peng venue, west outside the moat) ---------- */
    { const b = B.decor, cx = (FIELD.x0 + FIELD.x1) / 2, cz = 0; box(b, MT.stone, 0xe8d8b8, cx - 8, cx + 8, 0, .8, -5, 5); walk.pad(cx, 0, 4.9, .8); ctx.cols.push([cx - 8, cx + 8, -5, -4.2], [cx - 8, cx + 8, 4.2, 5]);
      for (const s of [-1, 1]) { b.add(MT.v, A.geo('cyl'), 0xc83a2a, M(cx + s * 7, 3.5, -5, .3, 7, .3)); b.add(MT.v, A.geo('cyl'), 0xc83a2a, M(cx + s * 7, 3.5, 5, .3, 7, .3)) } b.add(ROOF, gableGeo, 0xc83a2a, M(cx, 7, 0, 17, 2.4, 11, 0, 0, 0));
      for (let k = 0; k < 24; k++) { const a = k / 24 * TAU, x = cx + Math.cos(a) * 26, z = Math.sin(a) * 26; b.add(MT.v, A.geo('cyl'), 0x8a5a3a, M(x, 1, z, .08, 2, .08)); B.night.add(MT.v, BG.sph, 0xffb040, M(x, 2.1, z, .2, .26, .2), 1) }
      sign('LANTERN FIELD · Yi Peng', -138, 3.2, -6.5, Math.PI / 2, 4.6, '#ffd84a', true) }

    /* ---------- Apeverse Portal + stone ape with headphones (terrace, west end) ---------- */
    const PX = 5.6, PZ = 48.8;
    { const b = B.decor; b.add(MT.stone, BG.sph, 0x9a8a78, M(PX - 1.4, .9, PZ + .6, .55, .6, .5)); b.add(MT.stone, BG.sph, 0x9a8a78, M(PX - 1.4, 1.65, PZ + .6, .42, .42, .4)); b.add(MT.v, A.geo('ring'), 0xff4ad2, M(PX - 1.4, 1.75, PZ + .6, .44, .44, .3, 0, Math.PI / 2, 0), .8); for (const s of [-1, 1]) b.add(MT.v, BG.sph, 0xffd84a, M(PX - 1.4 + s * .42, 1.65, PZ + .6, .1, .16, .16), .6) }
    const portal = new THREE.Group(); portal.position.set(PX, 1.7, PZ); grp.add(portal); { const ring = new THREE.Mesh(new THREE.TorusGeometry(1.3, .14, 10, 40), new THREE.MeshBasicMaterial({ color: 0xb07aff })); portal.add(ring); const disc = new THREE.Mesh(new THREE.CircleGeometry(1.25, 40), new THREE.MeshBasicMaterial({ color: 0x7a3aff, transparent: true, opacity: .45, side: THREE.DoubleSide, depthWrite: false })); portal.add(disc); ctx.upd.push((dt, t) => { ring.rotation.z = t * .8; disc.material.opacity = .35 + Math.sin(t * 2) * .12; disc.material.color.setHSL((t * .05) % 1, .8, .5) }); ctx.circles.push([PX, PZ, 1]) }

    /* ---------- vegetation ---------- */
    const freeV = (x, z, pad) => x > XMIN + 5 && x < XMAX - 5 && z > ZMIN + 5 && z < ZMAX - 5 && roadDist(x, z) > (pad || 2.8) && !inMoat(x, z) && !inRiver(x, z) && !inWall(x, z) && Math.abs(Math.max(Math.abs(x), Math.abs(z)) - MOAT0) > 1 && !occ.some(o => inRect(o, x, z, pad || 1.5)) && !inRect(PLAZA, x, z, 2) && !inRect(BAZAAR, x, z, 1) && !inRect(WARO, x, z, 2) && !(x > RIV0 - 3 && x < RIV1 + 3);
    const pickV = (n, area, ok, s0, s1) => { const out = []; for (let i = 0, t = 0; i < n && t < n * 30; t++) { const x = area.x0 + rng() * (area.x1 - area.x0), z = area.z0 + rng() * (area.z1 - area.z0); if (!ok(x, z)) continue; out.push({ x, y: 0, z, s: s0 + rng() * (s1 - s0), ry: rng() * TAU }); i++ } return out };
    const WORLD = { x0: XMIN, x1: XMAX, z0: ZMIN, z1: ZMAX };
    /* (city budget: CC0 palm models only; bushes and ferns are cheap procedural species — the flowering-bush and fern GLBs are ~10k triangles each) */
    const palms = pickV([24, 40, 56][q], WORLD, (x, z) => freeV(x, z, 3), 2, 3); palms.forEach(p => ctx.circles.push([p.x, p.z, .4]));
    const palmFb = it => K.scatter(ctx, K.species.palm(0x8a5a2a, 0x2fa04a), K.floraMat(.01), it.map(o => Object.assign({}, o, { s: o.s * .55 })), { far: K.far(false), cell: 70 });
    ['palm_a', 'palm_b', 'palm_c'].forEach((k, j) => K.instModel(ctx, 'quaternius/' + k, palms.filter((_, i) => i % 3 === j), palmFb, { sway: .004, far: K.far(false), cell: 70 }));
    const rain = pickV([30, 50, 70][q], WORLD, (x, z) => freeV(x, z, 4), 1.8, 2.8); rain.forEach(p => ctx.circles.push([p.x, p.z, .6]));
    K.scatter(ctx, K.species.candyTree(0x5a3a2a, 0x3a8a3a, 0x2f7a3a, 0x4a9a3a), K.floraMat(.006), rain, { far: K.far(false), cell: 80 });
    const bush = pickV(K.n(40), WORLD, (x, z) => freeV(x, z, 2.2), .9, 1.6); K.scatter(ctx, K.species.bush(0x3a9a4a, 0xff6ab8), K.floraMat(.03), bush, { far: K.far(false), cell: 64 });
    K.field(ctx, K.species.bush(0x3a8a3a, 0xff3aa8), K.floraMat(.03), K.n(40), { x0: -98, x1: 98, z0: -98, z1: 98 }, { H: () => 0, s0: .8, s1: 1.4, ok: (x, z) => Math.max(Math.abs(x), Math.abs(z)) > 96.5 && Math.max(Math.abs(x), Math.abs(z)) < 99.5 && roadDist(x, z) > 1, far: K.far(false), cell: 64 });   // bougainvillea along the wall
    K.scatter(ctx, K.species.fern(0x2f9a3a), K.floraMat(.06, { double: true }), pickV(K.n(30), WORLD, (x, z) => freeV(x, z, 2), 1.1, 1.8), { shadow: false, cell: 48, far: K.far(true) });
    [[0xff4ad2, 0xffe040], [0xffd84a, 0xe83a30], [0xffffff, 0xffd84a]].forEach(c => K.field(ctx, K.species.flower(c[0], c[1]), K.floraMat(.15), K.n(60), WORLD, { H: () => 0, s0: .9, s1: 1.6, shadow: false, cell: 48, far: K.far(true), ok: (x, z) => freeV(x, z, 1.2) }));
    { const lp = []; for (let i = 0; i < [30, 60, 90][q]; i++) { const side = rng() * 4 | 0, t = (rng() * 2 - 1) * 108, d = 104.5 + rng() * 7.5; const x = side === 0 ? t : side === 1 ? t : side === 2 ? d : -d, z = side === 0 ? d : side === 1 ? -d : t; if (!inMoat(x, z)) continue; lp.push({ x, y: WY + .02, z, s: 1.1 + rng(), ry: rng() * TAU }) } K.instModel(ctx, 'quaternius/lilypad', lp, it => K.scatter(ctx, K.species.lotus(0xffa0d8, 0x2f8a4a), K.floraMat(0, { double: true }), it.map(o => Object.assign({}, o, { s: o.s * .7 })), { shadow: false }), { shadow: false }) }
    K.field(ctx, K.species.giantFlower(0xffd84a, 0xe83a30), K.floraMat(.02), K.n(10), FIELD, { H: () => 0, s0: 1, s1: 1.6, ok: (x, z) => Math.hypot(x - (FIELD.x0 + FIELD.x1) / 2, z) > 30 });
    K.motes(ctx, { n: 120, x: -77, z: 66, r: 20, y0: .5, y1: 4, cols: [0xe8ff6a, 0x9aff7a], size: 2.4, H: () => 0, night: true });

    /* ======================= LIFE: pedestrians, monks, traffic, animals ======================= */
    /* street graph: corners of every old-city intersection + Tha Phae Rd + bazaar + promenade + field */
    const nodes = [], edges = [], idx = {}; const addN = (k, x, z) => { idx[k] = nodes.length; nodes.push([x, z]) };
    XS.forEach((x, i) => ZS.forEach((z, j) => { const ox = RW('x', x) / 2 + 1.4, oz = RW('z', z) / 2 + 1.4; for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) addN(i + ',' + j + ',' + a + ',' + b, x + a * ox, z + b * oz) }));
    XS.forEach((x, i) => ZS.forEach((z, j) => { const k = (a, b) => idx[i + ',' + j + ',' + a + ',' + b]; edges.push([k(-1, -1), k(1, -1)], [k(1, -1), k(1, 1)], [k(1, 1), k(-1, 1)], [k(-1, 1), k(-1, -1)]);
      if (i + 1 < XS.length) for (const b of [-1, 1]) edges.push([k(1, b), idx[(i + 1) + ',' + j + ',-1,' + b]]); if (j + 1 < ZS.length) for (const a of [-1, 1]) edges.push([k(a, 1), idx[i + ',' + (j + 1) + ',' + a + ',-1']]) }));
    const chain = (pts) => { let prev = null; pts.forEach(([x, z]) => { const id = nodes.length; nodes.push([x, z]); if (prev != null) edges.push([prev, id]); prev = id }); return prev };
    { const gE = idx['4,2,1,-1'], gE2 = idx['4,2,1,1']; const a = nodes.length; chain([[97, -3], [110, -3], [125, -6.4], [140, -6.4], [160, -6.4], [180, -6.4], [200, -6.4], [222, -6.4], [244, -6.4]]); edges.push([gE, a]);   // through Tha Phae Gate
      const b = nodes.length; chain([[97, 3], [110, 3], [125, 6.4], [140, 6.4], [160, 6.4], [180, 6.4], [200, 6.4], [222, 6.4], [244, 6.4]]); edges.push([gE2, b]); edges.push([a + 3, b + 3], [a + 5, b + 5], [a + 8, b + 8]);
      const pr = nodes.length; chain([[252, -100], [252, -60], [252, -40], [252, -10], [252, 10], [252, 30], [252, 60], [252, 100]]); edges.push([a + 8, pr + 3], [b + 8, pr + 4]);
      const bz = nodes.length; chain([[183, 9], [183, 30], [183, 50], [194, 50], [205, 50], [205, 30], [194, 22], [183, 22]]); edges.push([b + 5, bz]); edges.push([bz + 1, bz + 5]);
      const wr = nodes.length; chain([[178, -9], [178, -32], [199, -32], [199, -38], [178, -38]]); edges.push([a + 5, wr]);
      const fd = nodes.length; chain([[-97, -3], [-110, -3], [-125, -3.6], [-140, -6], [-160, -14], [-180, -10], [-195, 8], [-175, 20], [-155, 12], [-140, 6], [-125, 3.6], [-110, 3], [-97, 3]]); edges.push([idx['0,2,1,-1'], fd], [fd + 12, idx['0,2,1,1']]) }
    const NAV = CY.nav(nodes, edges);
    const crowd = CY.crowd(ctx), nPed = [22, 40, 60][q];
    for (let i = 0; i < nPed; i++) { const n0 = nodes[rng() * nodes.length | 0]; crowd.add({ v: ['man', 'woman', 'tourist', 'woman', 'man'][i % 5], x: n0[0], z: n0[1], nav: NAV, idleProb: .2 }) }
    const monks = []; for (let i = 0; i < 5; i++) monks.push(crowd.add({ v: 'monk', x: 90 - i * 2.2, z: -6.6, route: [[90, -6.6], [-55, -6.6, 8, 'idle'], [-55, 6.6], [90, 6.6, 6, 'idle']], speed: .8 }));
    /* venue regulars: sitting / talking at the bars, the bazaar food court, the pool bar, Blue's band */
    const regulars = [];
    const seat = (x, z, yaw, v, m) => regulars.push(crowd.add({ v: v || ['man', 'woman', 'tourist'][regulars.length % 3], x, z, yaw, mode: m || 'sit' }));
    seat(bX(36.2), bZ(56.4), 1.57 + Math.PI); seat(bX(41), bZ(57.1), Math.PI); seat(bX(45.5), bZ(55.1), 0, 'woman'); seat(bX(49.8), bZ(58.5), -1.6 + Math.PI, 'tourist', 'talk'); seat(bX(38.4), bZ(61.7), 2.4 + Math.PI);   // Blue's (mapped)
    const band = [crowd.add({ v: 'drummer', x: bX(43), z: bZ(67.3), y: .6, yaw: 0, mode: 'drum' }), crowd.add({ v: 'man', x: bX(40.5), z: bZ(66.6), y: .6, yaw: 0, mode: 'dance' })];
    seat(11, 31.9, 3.1); seat(15, 34.9, 3.1, 'woman'); seat(20, 31.4, 0, 'tourist'); seat(47, 31.8, 3.1); seat(52, 35.2, 0, 'woman'); seat(33, 36.9, 3.1);
    seat(146, -14.4, 3.1, 'man', 'talk'); seat(156, -17.6, 0, 'woman', 'talk'); seat(144.2, -21, 1.57, 'man', 'idle'); seat(152, -11, 3.1, 'tourist', 'talk');
    const bazaarFolk = []; stalls.slice(0, 29).forEach((st, i) => { if (i % 2) return; bazaarFolk.push(crowd.add({ v: i % 4 ? 'woman' : 'man', x: st.x - Math.sin(st.ry) * 1.2, z: st.z - Math.cos(st.ry) * 1.2, yaw: st.ry, mode: 'idle' })) });
    for (let k = 0; k < 6; k++) bazaarFolk.push(crowd.add({ v: 'tourist', x: BAZAAR.x0 + 26 + (k % 3) * 2.6 + .7, z: BAZAAR.z0 + 26 + (k / 3 | 0) * 2.6, yaw: -1.57, mode: 'sit' }));
    const guests = []; for (const [x, z, yaw, m] of [[10.3, 63, 1.57, 'sit'], [13.4, 65.6, 3.1, 'sit'], [17, 60.5, 2.5, 'talk'], [22.5, 50.4, 0, 'sit'], [27.4, 63.5, -1.4, 'idle']]) guests.push(crowd.add({ v: ['tourist', 'woman', 'man'][guests.length % 3], x, z, yaw, mode: m }));
    /* festival crowds */
    const parade = [], splashers = [], dancers = [];
    if (md === 'lantern') {
      for (let i = 0; i < [12, 20, 28][q]; i++) parade.push(crowd.add({ v: i % 3 === 2 ? 'drummer' : 'dancer', x: 90, z: 0, mode: 'follow', cols: i % 3 === 2 ? null : { skin: 0xc8946a, hair: 0x14100c, shirt: [0xe8b830, 0xc83a5a, 0x7a3ab8, 0xe8603a][i % 4], pants: [0xc83a5a, 0xe8b830, 0x3a7ab8][i % 3] } }));
      for (let i = 0; i < [8, 14, 20][q]; i++) { const a = rng() * TAU, r = 6 + rng() * 14; dancers.push(crowd.add({ v: ['woman', 'man', 'tourist'][i % 3], x: (FIELD.x0 + FIELD.x1) / 2 + Math.cos(a) * r, z: Math.sin(a) * r, yaw: rng() * TAU, mode: rng() < .5 ? 'dance' : 'talk' })) }
      for (let i = 0; i < [6, 10, 14][q]; i++) dancers.push(crowd.add({ v: ['woman', 'man', 'tourist'][i % 3], x: 253.5 + rng() * 2, z: -20 + rng() * 60, yaw: Math.PI / 2, mode: 'idle' }));
    }
    if (md === 'songkran') for (let i = 0; i < [14, 24, 36][q]; i++) { const n0 = nodes[rng() * nodes.length | 0]; splashers.push(crowd.add({ v: 'splasher', x: n0[0], z: n0[1], nav: NAV, idleProb: .35, cols: { skin: [0xf0c8a8, 0xd8a47a, 0xc8946a, 0xb07a50][i % 4], hair: [0x14100c, 0x4a2c18, 0xd8b860][i % 3], shirt: [0xff8ad8, 0x4ac8ff, 0xffd84a, 0x7aff8a, 0xff8a3a][i % 5], pants: [0x3a6ad8, 0x2a2a2a, 0xc8b088][i % 3] } })) }
    crowd.build();
    /* V0.9.7: rigged locals + backpackers (more detailed than the instanced street crowd): hostel street, Night Bazaar, Tha Phae Gate */
    AV.beings.spawn(ctx, [[30, 44, 12], [6, 44, 10], [194, 30, 12], [188, 14, 9], [132, 8, 10], [60, 44, 10], [200, 42, 10], [-20, 44, 10], [150, 4, 8]].slice(0, AV.beings.n(ctx, 3, 6, 9)).map(([x, z, r], i) => ({ kind: 'human', x, z, area: { x, z, r }, seed: 90 + i })));
    /* traffic (drives on the left) */
    const loops = [{ pts: [[-94, -94], [94, -94], [94, 94], [-94, 94]], off: -1.6, w: 6 }, { pts: [[-RING, -RING], [RING, -RING], [RING, RING], [-RING, RING]], off: -2, w: 8 }, { pts: [[RING, 0], [244, 0]], off: -2.4, w: 10 }, { pts: [[0, -92], [0, 92]], off: -2, w: 8 }, { pts: [[246, -150], [246, 150]], off: -2, w: 8 }];
    if (md !== 'lantern') loops.push({ pts: [[-92, 0], [92, 0]], off: -2.4, w: 10 });
    /* V1.0 fleet: real-world paint palettes (white/silver/grey/black dominate Thai car colours; Chiang Mai songthaews are mostly red) */
    const CARC = [0xf2f2f0, 0xf2f2f0, 0xe8e6e0, 0xf2f2f0, 0xb8bcc0, 0xb8bcc0, 0xa0a4a8, 0x6a6e72, 0x5a5e62, 0x15171a, 0x15171a, 0x9a1a1a, 0x1f3e72, 0x7a6a52, 0x2a4a3a];
    const SCOC = [0x15171a, 0x15171a, 0xf0f0ec, 0xb01e1e, 0x1f4e9a, 0x8a8e92, 0xe8c8c8, 0x6a7a5a, 0xd8c8a0, 0x2a2c30];
    const TUKC = [0x2a7a5a, 0x1f5aa8, 0xd8a81a, 0xb82a2a, 0x2a8a9a, 0x2a7a5a];
    const SONC = [0xb81e1e, 0xb81e1e, 0xb81e1e, 0xb81e1e, 0xa81a1a, 0xe8c020, 0xe8e8e4, 0x2a6ac8, 0x3a8a4a];
    const traffic = CY.traffic(ctx, loops, [{ type: 'tuktuk', cols: TUKC, n: [3, 5, 7][q], speed: 6 }, { type: 'scooter', cols: SCOC, n: [8, 14, 20][q], speed: 8 }, { type: 'songthaew', cols: SONC, n: [2, 4, 5][q], speed: 5.5 },
      { type: 'car', cols: CARC, n: [3, 6, 9][q], speed: 7 }, { type: 'pickup', cols: CARC, n: [2, 3, 5][q], speed: 6.5 }, { type: 'bicycle', cols: [0x2a6ad8, 0x1a1a1a, 0xe8e8e0, 0x3a7a4a, 0xc83a3a], n: [1, 3, 4][q], speed: 3.5 }], { density: () => md === 'lantern' ? .5 : traffic.density() });
    /* parked cars, pickups and scooter rows on the quiet sois (no traffic loops): x = ±60, z = -60, z = 44 (not in front of the hostel / bars) */
    { const pr = AV.rng(4242), list = [], keep = [[-24, 64]], dens = [.45, .75, 1][q], STANDS0 = [[-5.5, 46.8], [-64, 6.4], [-14, 6.6], [-65.5, 48.6]];   // tuk-tuk stands near the sois
      const quiet = [['x', -60], ['x', 60], ['z', -60], ['z', 44]];
      for (const [ax, c0] of quiet) { const w = RW(ax, c0), cross = (ax === 'x' ? ZS : XS).map(v => [v, RW(ax === 'x' ? 'z' : 'x', v) / 2 + 5]);
        for (const sd of [-1, 1]) { let t = -92;
          while (t < 92) {
            const k = pr(), type = k < .42 ? 'car' : k < .55 ? 'pickup' : k < .85 ? 'scooters' : null, len = type === 'car' ? 4.6 : type === 'pickup' ? 5.5 : type ? 1 + (2 + pr() * 4 | 0) * .8 : 3 + pr() * 6;
            const a0 = t, a1 = t + len; t = a1 + .8 + pr() * 1.4;
            if (!type || pr() > dens || cross.some(([v, hw]) => a1 > v - hw && a0 < v + hw) || (ax === 'z' && c0 === 44 && keep.some(([u0, u1]) => a1 > u0 && a0 < u1)) || STANDS0.some(([sx, sz]) => Math.hypot((ax === 'x' ? c0 : (a0 + a1) / 2) - sx, (ax === 'x' ? (a0 + a1) / 2 : c0) - sz) < 6)) continue;
            const off = c0 + sd * (w / 2 - (type === 'scooters' ? .95 : 1.0)), mid = (a0 + a1) / 2, pos = (along, across) => ax === 'x' ? [across, along] : [along, across];
            if (type !== 'scooters') { const [x, z] = pos(mid, off), yaw = ax === 'x' ? (sd < 0 ? Math.PI : 0) : (sd < 0 ? Math.PI / 2 : -Math.PI / 2); list.push({ type, x, z, yaw, col: CARC[pr() * CARC.length | 0], chunk: ax + c0 });
              const hl = type === 'car' ? 2.25 : 2.7, hw = .9; ctx.cols.push(ax === 'x' ? [x - hw, x + hw, z - hl, z + hl] : [x - hl, x + hl, z - hw, z + hw]) }
            else { for (let u = a0 + .5; u < a1 - .3; u += .8) { const [x, z] = pos(u, off), yaw = (ax === 'x' ? (sd < 0 ? -Math.PI / 2 : Math.PI / 2) : (sd < 0 ? Math.PI : 0)) + (pr() - .5) * .3; list.push({ type: pr() < .9 ? 'scooter' : 'bicycle', x, z, yaw, col: SCOC[pr() * SCOC.length | 0], chunk: ax + c0 }) }
              const [x0, z0] = pos(a0 + .2, off - .95), [x1, z1] = pos(a1 - .2, off + .95); ctx.cols.push([Math.min(x0, x1), Math.max(x0, x1), Math.min(z0, z1), Math.max(z0, z1)]) }
          } } }
      CY.parked(ctx, list) }
    CY.birds(ctx, [{ x: -28, z: 24, r: 18, y: 26, n: 10 }, { x: -77, z: 66, r: 14, y: 14, n: 8 }, { x: 270, z: 0, r: 30, y: 12, n: 10 }, { x: -77, z: -30, r: 16, y: 20, n: 7 }]);
    /* dogs: Bobo (street dog, adopted by Giant), Frenchie (French bulldog), and strays */
    const bobo = CY.dog(0xc8945a, { s: 1.05, c2: 0xe8c890 }); bobo.position.set(17, 0, 51.2); bobo.rotation.y = .4; grp.add(bobo); ctx.circles.push([17, 51.2, .4]);
    const frenchie = CY.dog(0xd8b890, { frenchie: true, s: .9, collar: 0x2a3a8a }); frenchie.position.set(16, 0, 62); grp.add(frenchie);
    const strays = [[60, 46.5], [-60, -2], [130, 18], [190, 40]].map(([x, z], i) => { const d = CY.dog([0x8a6a4a, 0xe8e0d0, 0x3a2a20, 0xb08a5a][i], { s: .95 }); d.position.set(x, 0, z); d.userData.home = [x, z]; d.userData.t = 0; grp.add(d); return d });
    ctx.T.push({ x: 17, z: 51.2, r: 1.8, label: () => tr('Pet Bobo', 'Acariciar a Bobo'), fn: () => { AV.toast(AV.pick([tr('Bobo thumps his tail and sighs like a tiny old man.', 'Bobo golpea la cola y suspira como un viejecito.'), tr('Bobo rolls over. Belly rubs are mandatory.', 'Bobo se pone panza arriba. Las caricias son obligatorias.')])); AV.audio && AV.audio.blip(520, .1, 'triangle', .08) } });
    const smoke = CY.smoke(ctx), spray = CY.spray(ctx, md === 'songkran' ? 420 : 40), rainFx = CY.rain(ctx);

    /* ======================= THE CREW ======================= */
    const crew = {}, H0 = () => 0;
    const spawn = (id, body, x, z, yaw, anim) => { const n = AV.npc.spawn(ctx, id, { x, z, yaw, body, H: H0, r: 2.6, anim, speed: 1.3 }); n.tag.position.y = 2.25; n.bub.position.y = 2.95; n.home = { x, z, yaw }; crew[id] = n; return n };
    const sitPose = (n, yawSeat, t, d) => { const u = n.g.userData; n.g.position.y = -.33; u.lL.rotation.x = u.lR.rotation.x = -1.45; n.g.rotation.y = yawSeat; if (d < 7) { let hy = Math.atan2(AV.P.x - n.g.position.x, AV.P.z - n.g.position.z) - yawSeat; hy = Math.atan2(Math.sin(hy), Math.cos(hy)); u.head.rotation.y = Math.max(-1, Math.min(1, hy)) } else u.head.rotation.y *= .95 };
    const smokeAnim = (n, t, period, side) => { const u = n.g.userData, ph = (t + n.g.id * .37) % period, arm = side > 0 ? u.aR : u.aL; if (ph < 1.6) { arm.rotation.x = -2.15 + Math.sin(ph * 2) * .05; arm.rotation.z = side * -.35; if (ph > 1.1 && ph < 1.15 && !AV.S.set.reduce) { const p = new THREE.Vector3(); u.head.getWorldPosition(p); smoke.puff(p.x + Math.sin(n.g.rotation.y) * .25, p.y - .1, p.z + Math.cos(n.g.rotation.y) * .25) } } else { arm.rotation.x += (-.35 - arm.rotation.x) * .1; arm.rotation.z += (side * -.1 - arm.rotation.z) * .1 } };
    const isSeated = n => n.seat && !n.path && Math.hypot(n.g.position.x - n.seat.x, n.g.position.z - n.seat.z) < .4;
    spawn('mud', C.crew.mud(), 11, 57.4, Math.PI, (n, dt, t, d, talking) => { const u = n.g.userData; if (!n.path && !talking && Math.hypot(n.g.position.x - 11, n.g.position.z - 57.4) < .5) { u.aR.rotation.x = -.9 + Math.sin(t * 6) * .08; u.aL.rotation.x = -.85 + Math.cos(t * 5) * .08 } });
    spawn('nuni', C.crew.nuni(), 22.2, 64.6, Math.PI / 2, (n, dt, t, d, talking) => { const u = n.g.userData; if (n.mode === 'pool' && !n.path && !talking) { u.aR.rotation.x = -1.2 + Math.sin(t * 1.1) * .25; u.aL.rotation.x = -1.0; n.g.rotation.x = .25 } else { n.g.rotation.x = 0; if (!n.path) { const ph = t % 9; if (ph < 1.3) u.aL.rotation.x = -2.2 } } });
    spawn('steve', C.crew.steve(), 12, 66.4, Math.PI, (n, dt, t, d, talking) => { const u = n.g.userData; if (isSeated(n)) sitPose(n, n.seat.yaw, t, d); else if (!n.moving) n.g.position.y = n.mode === 'stage' && !n.path ? .6 : 0; if (!n.path) { u.aR.rotation.x = -.7 + Math.sin(t * 12) * .25 * (talking ? .3 : 1); u.aL.rotation.x = -1.05; u.aL.rotation.z = -.5; if (u.uke) u.uke.visible = true } });
    spawn('dino', C.crew.dino(), 29.4, 49.6, Math.PI, (n, dt, t, d, talking) => { if (isSeated(n)) sitPose(n, n.seat.yaw, t, d); else if (!n.moving) n.g.position.y = 0; if (!n.path) smokeAnim(n, t, 7, 1) });
    spawn('zape', C.crew.zape(), 13.6, 49.35, Math.PI, (n, dt, t, d, talking) => { if (isSeated(n)) sitPose(n, n.seat.yaw, t, d); else if (!n.moving) n.g.position.y = 0; if (!n.path && !talking) smokeAnim(n, t, 8, 1) });
    spawn('nunyin', C.crew.nunyin(), 27, 56.9, Math.PI);
    spawn('golf', C.crew.golf(), 18.6, 50.9, Math.PI, (n, dt, t, d, talking) => { const u = n.g.userData; if (isSeated(n)) sitPose(n, n.seat.yaw, t, d); u.aR.rotation.x = -1.2; u.aL.rotation.x = -1.1; if (!talking) u.head.rotation.x = .35 });
    crew.steve.seat = { x: 12, z: 66.4, yaw: Math.PI }; crew.dino.seat = { x: 29.4, z: 49.6, yaw: Math.PI }; crew.zape.seat = { x: 13.6, z: 49.35, yaw: Math.PI }; crew.golf.seat = { x: 18.6, z: 50.9, yaw: Math.PI };
    /* routes that respect walls: through the hostel door when crossing the front wall */
    const insideH = (x, z) => x > H.x0 && x < H.x1 && z > H.z0 && z < 70;
    /* leaving an enclosed venue goes out through its door first */
    const EXITS = [[BLUES, [[bX(43), bZ(61.5)], [bX(43), 42.4]]], [MART, [[-10, 46.5]]], [PINE, [[43, 52.4], [43, 48.6]]]];
    const routeTo = (n, tx, tz, yaw, opt) => { const p = n.g.position, path = []; const a = insideH(p.x, p.z), b = insideH(tx, tz);
      for (const [r0, wp] of EXITS) if (inRect(r0, p.x, p.z) && !inRect(r0, tx, tz)) wp.forEach(w => path.push(w));
      if (a && !b) path.push([DOOR_IN[0], DOOR_IN[1]], [DOOR_OUT[0], DOOR_OUT[1]]); else if (!a && b) path.push([DOOR_OUT[0], DOOR_OUT[1]], [DOOR_IN[0], DOOR_IN[1]]);
      if (opt && opt.via) opt.via.forEach(v => path.push(v)); path.push([tx, tz, 0, yaw]); n.go(path, Object.assign({ loop: false }, opt || {})) };
    /* schedules: where each crew member wants to be (hour, mode) — [x, z, yaw, activity, via waypoints] */
    const SPOTS = {
      mud: (h, m) => m === 'songkran' ? [21, 49.6, Math.PI, 'stand'] : m === 'lantern' ? [24, 49.4, Math.PI, 'stand'] : h >= 20 || h < 1 ? [22.6, 50.8, Math.PI, 'stand'] : [11, 57.4, Math.PI, 'desk'],
      nuni: (h, m) => m === 'songkran' ? [15.5, 47.2, Math.PI, 'stand'] : m === 'lantern' ? [196, 44, 0, 'stand'] : h >= 17 || h < 2 ? [24.2, 62.8, 0, 'pool'] : [16.6, 50.4, Math.PI, 'stand'],
      steve: (h, m) => m === 'lantern' ? [130, 11, -Math.PI / 2, 'stand'] : m === 'songkran' ? [12, 66.4, Math.PI, 'sit'] : h >= 19 && h < 23 ? [bX(43), bZ(66.5), 0, 'stage', [[bX(43), 45], [bX(43), 42.4], [bX(43), bZ(61.5)]]] : [12, 66.4, Math.PI, 'sit'],
      dino: (h, m) => m === 'lantern' ? [-178, 12, -.6, 'stand'] : m === 'songkran' ? [29.4, 49.6, Math.PI, 'sit'] : h >= 14 && h < 15.5 ? [43, 60, 0, 'stand', [[43, 48.6], [43, 52.4]]] : [29.4, 49.6, Math.PI, 'sit'],
      zape: (h, m) => m === 'lantern' ? [253, 28, Math.PI / 2, 'stand'] : h >= 17 && h < 17.6 ? [-10, 50, 3.1, 'stand', [[2, 46.5], [-10, 46.5]]] : [13.6, 49.35, Math.PI, 'sit']
    };
    let lastPlan = {};
    const plan = (force) => { const h = hourNow(), m = mode(); for (const id in SPOTS) { const n = crew[id]; if (n.busy) continue; const sp = SPOTS[id](h, m), key = sp.join(','); if (!force && lastPlan[id] === key) continue; lastPlan[id] = key; n.mode = sp[3];
      if (id === 'steve' && n.seat) n.seat = sp[3] === 'sit' ? { x: sp[0], z: sp[1], yaw: sp[2] } : null; if ((id === 'dino' || id === 'zape') ) n.seat = sp[3] === 'sit' ? { x: sp[0], z: sp[1], yaw: sp[2] } : null;
      const p = n.g.position; if (Math.hypot(p.x - sp[0], p.z - sp[1]) > 60 || force === 'teleport') { p.set(sp[0], sp[3] === 'stage' ? .6 : 0, sp[1]); n.g.rotation.y = n.yaw = sp[2]; n.path = null } else routeTo(n, sp[0], sp[1], sp[2], sp[4] ? { via: sp[4] } : undefined) } };
    plan('teleport');
    ctx.upd.push((() => { let acc = 0; return dt => { acc += dt; if (acc < 3) return; acc = 0; plan(false) } })());
    /* the crew talk to each other */
    const CHATS = [['nuni', 'zape', ['Another beer, Ape?', '¿Otra cerveza, Ape?'], ['Is the sky blue? Is the bench comfy?', '¿El cielo es azul? ¿El banco es cómodo?']], ['dino', 'zape', ['Bro, the moon is following me.', 'Tío, la luna me está siguiendo.'], ['Film it. That’s a music video.', 'Grábalo. Eso es un videoclip.']],
      ['mud', 'nuni', ['Nuni, stop hustling the guests.', 'Nuni, deja de timar a los huéspedes.'], ['It’s not hustling, it’s education.', 'No es timar, es educación.']], ['steve', 'dino', ['New song: “Gecko Blues”.', 'Canción nueva: “Gecko Blues”.'], ['I’m already crying, man.', 'Ya estoy llorando, tío.']],
      ['mud', 'golf', ['Cough, the door is not a sofa.', 'Cough, la puerta no es un sofá.'], ['Five more minutes, boss fight.', 'Cinco minutos más, jefe final.']], ['steve', 'nuni', ['Jam tonight?', '¿Jam esta noche?'], ['Only if you lose at pool first.', 'Solo si primero pierdes al billar.']], ['zape', 'golf', ['Cough, put me in your game.', 'Cough, mételo en tu juego.'], ['You are the final boss.', 'Eres el jefe final.']]];
    ctx.upd.push((() => { let acc = 0; return dt => { acc += dt; if (acc < 16) return; acc = 0; const P = AV.P; const ok = CHATS.filter(([a, b]) => crew[a] && crew[b] && crew[a].g.position.distanceTo(crew[b].g.position) < 7 && Math.hypot(P.x - crew[a].g.position.x, P.z - crew[a].g.position.z) < 24 && !AV.chat.open); if (!ok.length) return; const [a, b, la, lb] = ok[Math.random() * ok.length | 0]; AV.npc.bark(crew[a], tr(la[0], la[1])); setTimeout(() => crew[b] && AV.npc.bark(crew[b], tr(lb[0], lb[1])), 2600) } })());

    /* ======================= interactions ======================= */
    const T = (x, z, r, label, fn, show) => { const t = { x, z, r, label, fn, show }; ctx.T.push(t); return t };
    /* V0.9.5: purchases go into the backpack */
    const buy = (cost, what, msg, item) => { if (!AV.txn(-cost, what)) return false; if (item) { if (AV.bag) AV.bag.add(item, 1, true); else S.items[item] = (S.items[item] || 0) + 1; AV.quests && AV.quests.check(); msg += tr(' → backpack (I)', ' → mochila (I)') } AV.toast(msg); AV.audio && AV.audio.blip(660, .15, 'triangle', .12); return true };
    /* reception: rent a bed, scooter, festival board */
    T(11, 54.4, 1.8, () => tr('Reception bell: rent a bed (40 credits/night)', 'Timbre de recepción: alquilar cama (40 créditos/noche)'), () => { if (S.cm.bed >= S.day) return AV.toast(tr('You already have a bed tonight: Room 1, back corridor.', 'Ya tienes cama esta noche: habitación 1, pasillo del fondo.')); if (AV.txn(-40, 'Giant Hostel bed')) { S.cm.bed = S.day; AV.toast(tr('Mutt hands you key #1. “Room 1, top bunk, no smoking inside, love you.”', 'Mutt te da la llave n.º 1. “Habitación 1, litera de arriba, no se fuma dentro, te quiero.”')) } });
    T(9.2, 59, 1.7, () => tr('Festival board: choose Chiang Mai mode (F)', 'Tablón de fiestas: elegir modo de Chiang Mai (F)'), () => AV.cm.modePanel());
    T(13.2, 54.6, 1.4, () => S.cm.scooter === S.day ? tr('Return the scooter', 'Devolver la moto') : tr('Rent a scooter for today (50 credits)', 'Alquilar moto por hoy (50 créditos)'), () => { if (S.cm.scooter === S.day) { S.cm.scooter = -1; AV.toast(tr('Scooter returned. Your legs are back in charge.', 'Moto devuelta. Tus piernas vuelven a mandar.')) } else if (AV.txn(-50, 'Scooter rental')) { S.cm.scooter = S.day; AV.toast(tr('Scooter rented until midnight: you ride twice as fast in Chiang Mai. Helmet on!', 'Moto alquilada hasta medianoche: vas el doble de rápido por Chiang Mai. ¡Casco puesto!')) } updScooter() });
    T(11, 79.5, 2.2, () => tr('Sleep in your bunk (Room 1)', 'Dormir en tu litera (habitación 1)'), () => { if (S.cm.bed < S.day && !(S.cm.freeNight)) return AV.toast(tr('This bunk is not yours yet. Rent a bed at reception.', 'Esta litera aún no es tuya. Alquila una cama en recepción.')); if (S.cm.freeNight && S.cm.bed < S.day) { S.cm.freeNight = false; S.cm.bed = S.day } AV.fadeTo(1, 600); setTimeout(() => { if (S.time >= 8 * 60) S.day++; S.time = 8 * 60; AV.hud(); AV.fadeTo(0, 900); AV.toast(tr('You sleep like a gecko on a warm wall. Good morning, Chiang Mai!', 'Duermes como un geco en una pared caliente. ¡Buenos días, Chiang Mai!')) }, 700) });
    T(27.5, 54.2, 1.8, () => tr('Shop counter (Nunyin)', 'Mostrador (Nunyin)'), () => AV.cm.shopPanel());
    T(25.5, 61.6, 2.2, () => tr('Pool table: friendly game vs Nuni', 'Mesa de billar: partida amistosa contra Nuni'), () => { if (crew.nuni.g.position.distanceTo(new THREE.Vector3(25.5, 0, 64)) > 8) return AV.toast(tr('Nuni isn’t here. She’s usually at this table from 17:00.', 'Nuni no está. Suele estar en esta mesa desde las 17:00.')); AV.cm.act('nuni', 'pool_here') });
    T(PX, PZ - .6, 2.2, () => tr('Apeverse Portal: travel to another world', 'Portal Apeverse: viajar a otro mundo'), () => AV.cm.portalPanel());
    /* food & shops */
    T(38.4, 64.4, 2, () => tr('Pineapple Express: pineapple shake (15)', 'Pineapple Express: batido de piña (15)'), () => buy(15, 'Pineapple shake', tr('Cold, sweet, served in a pineapple. Life is good.', 'Frío, dulce, servido en una piña. La vida es buena.'), 'pineapple_shake'));
    T(34, 31, 2.2, () => tr('Khun Kae’s: smoothie bowl (35)', 'Khun Kae: bol de smoothie (35)'), () => buy(35, 'Smoothie bowl', tr('Açaí, mango, dragon fruit. You feel 4% healthier.', 'Açaí, mango, pitahaya. Te sientes un 4% más sano.'), 'smoothie'));
    T(50, 28.6, 2, () => tr('Chada’s: vegan khao soi (40)', 'Chada: khao soi vegano (40)'), () => buy(40, 'Vegan khao soi', tr('Curry noodles, crispy on top, perfect. Chada waves from the kitchen.', 'Fideos al curry, crujientes arriba, perfectos. Chada saluda desde la cocina.'), 'khao_soi'));
    T(-10, 50, 2, () => tr('Mini mart: cold drink (12)', 'Minimercado: bebida fría (12)'), () => buy(12, 'Cold drink', tr('The air-con alone was worth it.', 'Solo el aire acondicionado ya valía la pena.'), 'water'));
    T(147, -14.2, 2.2, () => AV.cm.poolLabel(), () => AV.cm.poolBarTable());
    const bazaarOpen = () => { const h = hourNow(); return mode() !== 'normal' || (h >= 17 || h < .5) }, waroOpen = () => { const h = hourNow(); return h >= 6 && h < 18 };
    T(stalls[0].x - .6, stalls[0].z - 1.2, 2.2, () => bazaarOpen() ? tr('Night Bazaar: mango sticky rice (25)', 'Night Bazaar: mango con arroz glutinoso (25)') : tr('Night Bazaar (opens 17:00)', 'Night Bazaar (abre a las 17:00)'), () => { if (!bazaarOpen()) return AV.toast(tr('The stalls are covered. Come back after 17:00.', 'Los puestos están tapados. Vuelve después de las 17:00.')); buy(25, 'Mango sticky rice', tr('Mango sticky rice, packed for later (inventory: I).', 'Mango con arroz glutinoso, para llevar (inventario: I).'), 'mango') });
    T(stalls[4].x - .6, stalls[4].z - 1.2, 2.2, () => bazaarOpen() ? tr('Night Bazaar: khao soi (30)', 'Night Bazaar: khao soi (30)') : tr('Night Bazaar (opens 17:00)', 'Night Bazaar (abre a las 17:00)'), () => bazaarOpen() ? buy(30, 'Khao soi', tr('Golden curry, crunchy noodles, lime. Chiang Mai in a bowl.', 'Curry dorado, fideos crujientes, lima. Chiang Mai en un bol.'), 'khao_soi') : AV.toast(tr('Closed until 17:00.', 'Cerrado hasta las 17:00.')));
    T(stalls[8].x - .6, stalls[8].z - 1.2, 2.2, () => tr('Night Bazaar: elephant pants (60)', 'Night Bazaar: pantalones de elefantes (60)'), () => bazaarOpen() ? buy(60, 'Elephant pants', tr('Now you match ZtonedApe. He will notice.', 'Ahora vas a juego con ZtonedApe. Lo notará.'), 'elephant_pants') : AV.toast(tr('Closed until 17:00.', 'Cerrado hasta las 17:00.')));
    T(WARO.x0 + 8, WARO.z0 + 7.5, 2.4, () => waroOpen() ? tr('Warorot Market: mango sticky rice (25)', 'Mercado Warorot: mango con arroz (25)') : tr('Warorot Market (06:00–18:00)', 'Mercado Warorot (06:00–18:00)'), () => waroOpen() ? buy(25, 'Mango sticky rice', tr('Mango sticky rice from Warorot, wrapped in banana leaf.', 'Mango con arroz de Warorot, envuelto en hoja de plátano.'), 'mango') : AV.toast(tr('The market is closed. Open 06:00–18:00.', 'El mercado está cerrado. Abre de 06:00 a 18:00.')));
    T(WARO.x0 + 20, WARO.z0 + 7.5, 2.4, () => tr('Warorot: sai ua sausage (20)', 'Warorot: salchicha sai ua (20)'), () => waroOpen() ? buy(20, 'Sai ua', tr('Herby, spicy, northern. Dino would approve.', 'Herbal, picante, del norte. Dino lo aprobaría.'), 'sai_ua') : AV.toast(tr('Closed.', 'Cerrado.')));
    T(-28, 6, 3, () => tr('Wat Chedi Luang: light incense and sit quietly', 'Wat Chedi Luang: encender incienso y sentarse en silencio'), () => { AV.toast(tr('The old chedi breathes with the evening. A monk smiles at you. Calm +1.', 'El viejo chedi respira con la tarde. Un monje te sonríe. Calma +1.')); if (AV.audio) [0, .6, 1.2].forEach((o, k) => setTimeout(() => AV.audio.blip([392, 523, 659][k], 1.8, 'sine', .08), o * 1000)) });
    T(-77, -10.5, 3, () => tr('Wat Phra Singh: make merit (5)', 'Wat Phra Singh: hacer mérito (5)'), () => buy(5, 'Merit at Wat Phra Singh', tr('You drop a coin in the bowl. The gold chedi catches the sun.', 'Dejas una moneda en el cuenco. El chedi dorado atrapa el sol.')));
    T(130, 11, 3, () => tr('Tha Phae busker stage: listen', 'Escenario de Tha Phae: escuchar'), () => AV.toast(perf.on ? tr('The performer bows. The crowd cheers. Pigeons do not care.', 'El artista hace una reverencia. La gente aplaude. A las palomas les da igual.') : tr('Nobody is performing right now. Buskers come in the evening.', 'Ahora no actúa nadie. Los artistas vienen por la tarde.')));
    T(-80, -77.4, 2.2, () => tr('The Gecko Shrine', 'El Santuario del Geco'), () => { S.cm.gecko = true; AV.quests && AV.quests.check(); AV.toast(tr('The stone gecko winks. You are sure of it. Absolutely sure. Dino nods solemnly.', 'El geco de piedra te guiña un ojo. Estás seguro. Segurísimo. Dino asiente con solemnidad.')) });
    /* tuk-tuk stands */
    const STANDS = [['hostel', -5.5, 46.8, tr('Giant Hostel', 'Giant Hostel'), 16, 46, Math.PI], ['gate', 135, 14, tr('Tha Phae Gate', 'Puerta Tha Phae'), 132, 3, -Math.PI / 2], ['bazaar', 162, 6.2, tr('Night Bazaar', 'Night Bazaar'), 183, 12, Math.PI], ['river', 251.4, 12, tr('Ping River pier', 'Muelle del río Ping'), 252, 22, Math.PI], ['singh', -64, 6.4, tr('Wat Phra Singh', 'Wat Phra Singh'), -70, 3, 0], ['luang', -14, 6.6, tr('Wat Chedi Luang', 'Wat Chedi Luang'), -20, 3, 0], ['field', -132, 6, tr('Lantern Field', 'Campo de Farolillos'), -150, 0, Math.PI / 2], ['waro', 170, -6.2, tr('Warorot Market', 'Mercado Warorot'), 178, -12, 0], ['pool', 140, -6.6, tr('Rack & Roll Pool Bar', 'Bar de billar Rack & Roll'), 151, -3.4, 0], ['park', -65.5, 48.6, tr('Buak Hard Park', 'Parque Buak Hard'), -70, 46, Math.PI]];
    STANDS.forEach(([id, x, z]) => { B.decor.add(MT.v, A.geo('cyl6'), 0x3a3a3a, M(x, 1.3, z, .06, 2.6, .06)); B.decor.add(MT.v, BG.box, 0x2a9a7a, M(x, 2.7, z, .9, .5, .06), .5); T(x, z, 2.2, () => tr('Tuk-tuk stand: ride (30 credits)', 'Parada de tuk-tuk: viaje (30 créditos)'), () => AV.cm.tukPanel(id)); ctx.circles.push([x, z, .15]) });
    /* krathong pier + sky lantern launch (festival) */
    T(260, 30, 3, () => mode() === 'lantern' ? tr('Float a krathong (10 credits)', 'Soltar un krathong (10 créditos)') : tr('Ping River pier (krathongs float on Loy Krathong: F)', 'Muelle del Ping (los krathongs flotan en Loy Krathong: F)'), () => { if (mode() !== 'lantern') return AV.toast(tr('Switch to Yi Peng & Loy Krathong mode (F) to float krathongs.', 'Cambia al modo Yi Peng y Loy Krathong (F) para soltar krathongs.')); if (!AV.txn(-10, 'Krathong')) return; krath && krath.add(270, 30); S.cm.krathong = true; AV.quests && AV.quests.check(); AV.toast(tr('Your krathong drifts away, candle flickering. Make a wish!', 'Tu krathong se aleja con la vela titilando. ¡Pide un deseo!')) });
    T((FIELD.x0 + FIELD.x1) / 2, 0, 5.5, () => mode() === 'lantern' ? tr('Release a sky lantern (20 credits)', 'Soltar un farolillo (20 créditos)') : tr('Lantern Field (sky lanterns fly on Yi Peng: F)', 'Campo de Farolillos (vuelan en Yi Peng: F)'), () => { if (mode() !== 'lantern') return AV.toast(tr('Sky lanterns are released in Yi Peng mode (F).', 'Los farolillos se sueltan en modo Yi Peng (F).')); if (!AV.txn(-20, 'Sky lantern')) return; sky.launch(AV.P.x + Math.sin(-AV.P.yaw) * 1.5, AV.P.z - Math.cos(AV.P.yaw) * 1.5, 1, .2); S.cm.sky = true; AV.quests && AV.quests.check(); AV.toast(tr('Your lantern rises, slow and golden, joining a thousand others.', 'Tu farolillo sube, lento y dorado, uniéndose a otros mil.')) });

    /* ======================= MODES: Yi Peng & Loy Krathong · Songkran ======================= */
    let sky = { launch() { }, rate: 0 }, krath = null, floats = [];
    const PARADE = [[92, -2.6], [-56, -2.6], [-56, 2.6], [92, 2.6]];
    const pCum = [0]; for (let i = 1; i <= PARADE.length; i++) { const a = PARADE[i - 1], b = PARADE[i % PARADE.length]; pCum.push(pCum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1])) } const pLen = pCum[pCum.length - 1];
    const pAt = s => { s = ((s % pLen) + pLen) % pLen; let i = 1; while (pCum[i] < s) i++; const a = PARADE[i - 1], b = PARADE[i % PARADE.length], f = (s - pCum[i - 1]) / (pCum[i] - pCum[i - 1]); return { x: a[0] + (b[0] - a[0]) * f, z: a[1] + (b[1] - a[1]) * f, yaw: Math.atan2(b[0] - a[0], b[1] - a[1]) } };
    if (md === 'lantern') {
      /* hundreds of hanging lanterns along every street (one instanced mesh + one wire mesh) */
      const lan = [], wires = [], cols = [0xff3a3a, 0xff8a2a, 0xffd23a, 0xff5ab8, 0xffb04a];
      for (const rd of ROADS) { if (rd[4] < 6 || rd[0] > 247) continue; const L = Math.hypot(rd[2] - rd[0], rd[3] - rd[1]), ux = (rd[2] - rd[0]) / L, uz = (rd[3] - rd[1]) / L, off = rd[4] / 2 + 1.2;
        for (let s = 0; s < L; s += 12) { for (const sd of [-1, 1]) { const x0 = rd[0] + ux * s - uz * off * sd, z0 = rd[1] + uz * s + ux * off * sd; if (inMoat(x0, z0) || inWall(x0, z0) || inRiver(x0, z0)) continue; const x1 = x0 + ux * 12, z1 = z0 + uz * 12; wires.push(x0, 5.2, z0, x1, 5.2, z1); for (let k = 1; k < 5; k++) { const f = k / 5; lan.push([x0 + (x1 - x0) * f, 5.0 - Math.sin(f * Math.PI) * .8, z0 + (z1 - z0) * f]) } } if (s % 24 === 0) { const xa = rd[0] + ux * s - uz * off, za = rd[1] + uz * s + ux * off, xb = rd[0] + ux * s + uz * off, zb = rd[1] + uz * s - ux * off; if (!inMoat(xa, za) && !inMoat(xb, zb)) { wires.push(xa, 5.6, za, xb, 5.6, zb); for (let k = 1; k < 7; k++) { const f = k / 7; lan.push([xa + (xb - xa) * f, 5.5 - Math.sin(f * Math.PI) * .9, za + (zb - za) * f]) } } } } }
      [[H.x0, 3.6, 47.8, H.x1], [BLUES.x0, 4.5, BLUES.z1 + .9, BLUES.x1]].forEach(([x0, y, z, x1]) => { for (let x = x0; x <= x1; x += .9) lan.push([x, y - Math.sin((x - x0) / (x1 - x0) * Math.PI) * .3, z]) });
      const lm = new THREE.InstancedMesh(new THREE.SphereGeometry(.26, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffffff }), lan.length), cc = new THREE.Color(); lan.forEach((p, i) => { lm.setMatrixAt(i, M(p[0], p[1], p[2], 1, 1.3, 1)); lm.setColorAt(i, cc.setHex(cols[i % 5]).convertSRGBToLinear()) }); lm.instanceMatrix.needsUpdate = true; lm.instanceColor.needsUpdate = true; lm.frustumCulled = false; lm.material.userData.lin = 1; grp.add(lm);
      grp.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(wires, 3)), new THREE.LineBasicMaterial({ color: 0x2a1a10 })));
      AV.cm.lanternCount = lan.length;
      /* temples lit by thousands of candles */
      const cand = []; const ringC = (x, z, w, d, y, step) => { for (let u = -w / 2; u <= w / 2; u += step) for (const v of [-d / 2, d / 2]) cand.push([x + u, y, z + v]); for (let v = -d / 2; v <= d / 2; v += step) for (const u of [-w / 2, w / 2]) cand.push([x + u, y, z + v]) };
      for (let t = 0; t < 3; t++) ringC(-28, 24, 28 - t * 7, 28 - t * 7, t * 4.4 + 4.45, .7); ringC(-28, 24, 32, 32, .1, .8); ringC(-28, 8.6, 11.5, 7, .85, .5); ringC(-77, -22, 13.5, 20.5, .85, .5); ringC(-77, -45, 8, 8, .1, .5); ringC(-39, 66, 10.5, 14.5, .85, .5);
      for (let i = 0; i < 400; i++) { const a = rng() * TAU, r = 16 + rng() * 6; cand.push([-28 + Math.cos(a) * r, .1, 24 + Math.sin(a) * r]) }
      CY.candles(ctx, cand, 2.6); AV.cm.candleCount = cand.length;
      /* temple eaves hung with lanterns */
      for (const [x, z] of [[-28, 8.6], [-77, -22], [-39, 66]]) K.lanterns(ctx, [[x - 6, 4.3, z + 4], [x + 6, 4.3, z + 4]], { cols: [0xffd23a, 0xff8a2a], per: 12, sag: .3 });
      /* floating krathongs on the Ping + lit pier, sky lantern stream + mass releases */
      krath = CY.krathongs(ctx, { fx: () => 273, z0: -170, z1: 170, w: 24, y: WY }, [50, 90, 140][q]);
      sky = CY.skyLanterns(ctx, { x: (FIELD.x0 + FIELD.x1) / 2, z: 0, r: 40 }); sky.rate = [1.2, 2, 3][q]; sky.launch((FIELD.x0 + FIELD.x1) / 2, 0, [40, 80, 140][q], 50);
      /* parade floats: lotus float, naga float, giant lantern float, drum cart */
      const floatGeo = [
        K.merge([[BG.box, 0x8a2a2a, M(0, .5, 0, 3, 1, 5.5)], [A.geo('petal'), 0xff8ad8, M(0, 1, 0, 1.4, 2, .8)], [A.geo('petal'), 0xffb0e0, M(0, 1, 0, 1.4, 2, .8, 0, 1.2, 0)], [A.geo('petal'), 0xff6ac0, M(0, 1, 0, 1.4, 2, .8, 0, 2.4, 0)], [BG.sph, 0xffd23a, M(0, 2.4, 0, .5, .5, .5), 1], [BG.box, 0xffd23a, M(0, 1.05, 2.8, 3.1, .15, .1), 1], [BG.box, 0xffd23a, M(0, 1.05, -2.8, 3.1, .15, .1), 1]]),
        K.merge([[BG.box, 0x2a3a8a, M(0, .5, 0, 3, 1, 6)], [new THREE.TorusGeometry(1.1, .32, 8, 20, Math.PI), 0x3ac85a, M(0, 1, -1.2, 1, 1.2, 1, 0, Math.PI / 2, 0), .5], [new THREE.TorusGeometry(1.1, .32, 8, 20, Math.PI), 0x3ac85a, M(0, 1, 1.1, 1, 1, 1, 0, Math.PI / 2, 0), .5], [BG.sph, 0x3ac85a, M(0, 2.6, 2.6, .55, .6, .8), .5], [BG.cone, 0xffd23a, M(0, 3.3, 2.6, .2, .6, .2), 1], [BG.sph, 0xffd23a, M(-.25, 2.75, 3.2, .1, .1, .1), 1], [BG.sph, 0xffd23a, M(.25, 2.75, 3.2, .1, .1, .1), 1]]),
        K.merge([[BG.box, 0x6a2a8a, M(0, .5, 0, 3, 1, 5)], [A.geo('cyl'), 0xff8a2a, M(0, 2.6, 0, 1.3, 3, 1.3), 1], [A.geo('cyl'), 0xffd23a, M(0, 4.15, 0, 1.35, .15, 1.35), 1], [A.geo('cyl'), 0xffd23a, M(0, 1.05, 0, 1.35, .15, 1.35), 1], [BG.cone, 0xffd23a, M(0, 4.7, 0, .5, .8, .5), 1]]),
        K.merge([[BG.box, 0x8a5a2a, M(0, .5, 0, 2.6, 1, 4)], [A.geo('cyl'), 0xc83a2a, M(0, 1.6, 0, 1, 1.2, 1, Math.PI / 2, 0, 0)], [A.geo('cyl'), 0xf0e8d0, M(0, 1.6, .62, .95, .04, .95, Math.PI / 2, 0, 0)], [A.geo('cyl'), 0xf0e8d0, M(0, 1.6, -.62, .95, .04, .95, Math.PI / 2, 0, 0)], [BG.sph, 0xffd23a, M(0, 2.8, 0, .3, .3, .3), 1]])];
      floats = floatGeo.map((g, i) => { const m = new THREE.Mesh(g, K.floraMat(0, { rough: .6 })); m.castShadow = q === 2; grp.add(m); return { m, s: i * 22 } });
      floats.forEach((f, i) => { const l = new THREE.PointLight([0xff8ad8, 0x7aff9a, 0xffb04a, 0xffd23a][i], .9, 14); l.position.y = 3; f.m.add(l) });
      parade.forEach((w, i) => { const fi = i % floats.length, slot = Math.floor(i / floats.length), side = (slot % 2 ? 1 : -1) * 1.6; w.lead = () => { const p = pAt(floats[fi].s - 4.5 - Math.floor(slot / 2) * 1.8); return { x: p.x + Math.cos(p.yaw) * side, z: p.z - Math.sin(p.yaw) * side, yaw: p.yaw } } });
      ctx.upd.push((dt, t) => { floats.forEach((f, i) => { f.s += .9 * dt; const p = pAt(f.s); f.m.position.set(p.x, Math.sin(t * 2 + i) * .03, p.z); f.m.rotation.y = p.yaw }); const P = AV.P, near = Math.hypot(P.x - floats[3].m.position.x, P.z - floats[3].m.position.z); if (near < 35 && AV.audio && !AV.S.set.reduce) { const b = Math.floor(AV.audio.beat * 2); if (b !== ctx._pb) { ctx._pb = b; AV.audio.blip(b % 4 === 0 ? 70 : b % 2 ? 140 : 95, .25, 'sine', .35 * (1 - near / 35)) } } });
      /* mass release at the top of each in-game hour + hostel hooks quest */
      let lastH = -1; ctx.upd.push(() => { const h = Math.floor(hourNow()); if (h !== lastH) { if (lastH >= 0) { sky.launch((FIELD.x0 + FIELD.x1) / 2, 0, [60, 120, 200][q], 60); if (Math.abs(AV.P.x - (FIELD.x0 + FIELD.x1) / 2) < 80) AV.toast(tr('MASS RELEASE! Hundreds of lanterns rise over the field.', '¡SUELTA MASIVA! Cientos de farolillos se elevan sobre el campo.')) } lastH = h } });
      const HOOKS = [[10.5, 3.3, 47.6], [20, 3.3, 47.6], [30, 3.3, 47.6]], hung = [];
      HOOKS.forEach((hk, i) => { const lamp = new THREE.Mesh(new THREE.CylinderGeometry(.35, .25, .6, 10), new THREE.MeshBasicMaterial({ color: 0xff8a2a })); lamp.position.set(hk[0], hk[1] - .5, hk[2]); lamp.visible = (S.cm.hooks || 0) > i; grp.add(lamp); hung.push(lamp);
        T(hk[0], hk[2] + .6, 1.6, () => tr('Hang a lantern here', 'Colgar un farolillo aquí'), () => { if (lamp.visible) return AV.toast(tr('Already glowing.', 'Ya brilla.')); lamp.visible = true; S.cm.hooks = hung.filter(l => l.visible).length; AV.quests && AV.quests.check(); AV.toast(tr('Lantern hung (' + S.cm.hooks + '/3).', 'Farolillo colgado (' + S.cm.hooks + '/3).')) }, () => AV.S.quests && AV.S.quests.cm_lanterns === 'active' && !lamp.visible) });
    }
    if (md === 'songkran') {
      /* bunting across the streets, water barrels, HAPPY SONGKRAN banner */
      const fl = [], cols = [0xff3a8a, 0x3ac8ff, 0xffd23a, 0x3aff8a, 0xff8a3a];
      for (const rd of ROADS) { if (rd[4] < 6 || rd[0] > 247) continue; const L = Math.hypot(rd[2] - rd[0], rd[3] - rd[1]), ux = (rd[2] - rd[0]) / L, uz = (rd[3] - rd[1]) / L, off = rd[4] / 2 + 1.2; for (let s = 0; s < L; s += 14) { const xa = rd[0] + ux * s - uz * off, za = rd[1] + uz * s + ux * off, xb = rd[0] + ux * s + uz * off, zb = rd[1] + uz * s - ux * off; if (inMoat(xa, za) || inMoat(xb, zb)) continue; for (let k = 0; k < 10; k++) { const f = (k + .5) / 10; fl.push([xa + (xb - xa) * f, 5.2 - Math.sin(f * Math.PI) * .8, za + (zb - za) * f, Math.atan2(xb - xa, zb - za)]) } } }
      const tri = new THREE.BufferGeometry(); tri.setAttribute('position', new THREE.Float32BufferAttribute([-.25, 0, 0, .25, 0, 0, 0, -.45, 0], 3)); tri.computeVertexNormals();
      const fm = new THREE.InstancedMesh(tri, new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }), fl.length), cc = new THREE.Color(); fl.forEach((p, i) => { fm.setMatrixAt(i, M(p[0], p[1], p[2], 1, 1, 1, 0, p[3] + Math.PI / 2, 0)); fm.setColorAt(i, cc.setHex(cols[i % 5]).convertSRGBToLinear()) }); fm.instanceMatrix.needsUpdate = fm.instanceColor.needsUpdate = true; fm.frustumCulled = false; fm.material.userData.lin = 1; grp.add(fm);
      const BARRELS = [[20, 47.4], [-4, 4.5], [4, -4.5], [60, 4], [-60, -4], [126, 4], [180, 9.8], [0, 40]]; BARRELS.forEach(([x, z]) => { B.fest.add(MT.v, A.geo('cyl'), 0x2a7ad8, M(x, .55, z, .45, 1.1, .45)); B.fest.add(MT.v, A.geo('cyl'), 0x9ad8ff, M(x, 1.1, z, .42, .02, .42), .4); ctx.circles.push([x, z, .5]); T(x, z, 1.8, () => tr('Refill your water gun', 'Recargar la pistola de agua'), () => { gun.ammo = 100; AV.toast(tr('Tank full! (Q or Splash to shoot)', '¡Tanque lleno! (Q o Splash para disparar)')); AV.audio && AV.audio.blip(300, .3, 'sine', .15) }) });
      sign('HAPPY SONGKRAN · Sawasdee Pee Mai!', 112, 6.4, 0, -Math.PI / 2, 6, '#7ff0ff');
      document.body.classList.add('songkran');
      /* NPC water fights + trucks throwing water */
      ctx.upd.push((() => { let acc = 0; return (dt, t) => { acc += dt; if (acc < .35) return; acc = 0; const P = AV.P; const sh = splashers[Math.random() * splashers.length | 0]; if (!sh || !sh.shown) return;
        const dP = Math.hypot(P.x - sh.x, P.z - sh.z); let tx, tz, ty; if (dP < 7 && Math.random() < .45) { tx = P.x; tz = P.z; ty = 1.4 } else { const o = crowd.list.find(w => w !== sh && w.shown && Math.hypot(w.x - sh.x, w.z - sh.z) < 8); if (!o) return; tx = o.x; tz = o.z; ty = 1.2; o.react = 1.2 }
        const dx = tx - sh.x, dz = tz - sh.z, d = Math.hypot(dx, dz) || 1; sh.yaw = Math.atan2(dx, dz); sh.mode = 'splash'; sh.pause = 1; spray.emit(sh.x + dx / d * .4, 1.25, sh.z + dz / d * .4, dx / d, .35 + d * .03, dz / d, 18, .25, 6 + d * .5);
        if (tx === P.x && tz === P.z) setTimeout(() => soaked(), 300) } })());
      ctx.upd.push((() => { let acc = 0; return dt => { acc += dt; if (acc < 1.2) return; acc = 0; for (const c of traffic.cars) { if (c.type !== 'songthaew' || !c.active || Math.random() < .5) continue; const sd = Math.random() < .5 ? 1 : -1; spray.emit(c.x - Math.cos(c.yaw) * sd * 1, 1.9, c.z + Math.sin(c.yaw) * sd * 1, -Math.cos(c.yaw) * sd, .5, Math.sin(c.yaw) * sd, 30, .5, 5); if (Math.hypot(AV.P.x - c.x, AV.P.z - c.z) < 4.5) soaked() } } })());
    }
    const splashEl = AV.$('splash'); let soakT = 0;
    function soaked() { if (!splashEl) return; splashEl.style.opacity = 1; clearTimeout(soakT); soakT = setTimeout(() => splashEl.style.opacity = 0, 650); if (Math.random() < .3) AV.toast(AV.pick([tr('SPLASH! You got soaked!', '¡SPLASH! ¡Te han empapado!'), tr('Sawasdee pee mai! *drenched*', '¡Sawasdee pee mai! *empapado*'), tr('Ice water. Someone used ICE water.', 'Agua con hielo. Alguien usó agua con HIELO.')])); AV.audio && AV.audio.blip(200, .2, 'sawtooth', .05) }
    /* the player's water gun (Q / Splash button) */
    const gun = { ammo: 100, cd: 0 };
    AV.cm.shoot = () => { if (mode() !== 'songkran' || !AV.W || AV.W.id !== 'chiang_mai' || AV.blocking()) return; if (gun.cd > AV.now()) return; gun.cd = AV.now() + .12; if (gun.ammo <= 0) return AV.toast(tr('Empty! Refill at a blue water barrel.', '¡Vacía! Recarga en un barril azul.')); gun.ammo -= 4;
      const P = AV.P, dx = -Math.sin(P.yaw) * Math.cos(P.pitch), dy = Math.sin(P.pitch), dz = -Math.cos(P.yaw) * Math.cos(P.pitch); spray.emit(P.x + dx * .6, P.y + 1.45, P.z + dz * .6, dx, dy + .12, dz, 14, .12, 13); AV.audio && AV.audio.blip(900, .05, 'triangle', .04);
      for (const w of crowd.list) { if (!w.shown) continue; const ex = w.x - P.x, ez = w.z - P.z, d = Math.hypot(ex, ez); if (d > 11 || d < .3) continue; const cos = (ex * dx + ez * dz) / (d * Math.hypot(dx, dz)); if (cos < .95) continue; if (w.react > 0) continue; w.react = 1.3; if (S.quests && S.quests.cm_soak === 'active' && AV.now() < S.cm.soakUntil) { S.cm.soak++; AV.quests.check() } if (w.v === 'splasher' && Math.random() < .6) setTimeout(() => { spray.emit(w.x, 1.25, w.z, -ex / d, .4, -ez / d, 16, .25, 9); setTimeout(soaked, 300) }, 600); break }
      for (const id in crew) { const n = crew[id], ex = n.g.position.x - P.x, ez = n.g.position.z - P.z, d = Math.hypot(ex, ez); if (d < 9 && (ex * dx + ez * dz) / d > .95 && Math.random() < .2) AV.npc.bark(n, AV.pick([tr('HEY! *laughs* Payback time!', '¡EY! *se ríe* ¡Me vengaré!'), tr('Sawasdee pee mai to you too!', '¡Sawasdee pee mai para ti también!')])) } };

    /* ======================= time of day, markets, weather, random events, HUD ======================= */
    const nightMeshes = B.night.flush(ctx, { noShadow: true }); delete B.night; const gOpen = goodsOpen.flush(ctx, { noShadow: true }), gClosed = goodsClosed.flush(ctx, { noShadow: true });
    const perf = { on: false }; const perfG = new THREE.Group(); perfG.position.set(130, .5, 11); grp.add(perfG); { const fire = []; for (let k = 0; k < 3; k++) { const m = new THREE.Mesh(BG.sph, new THREE.MeshBasicMaterial({ color: 0xff8a2a })); m.scale.setScalar(.12); perfG.add(m); fire.push(m) } const pr = crowd.list; perf.fire = fire }
    const perfW = crowd.add ? null : null;
    let lastHour = -1;
    ctx.upd.push((dt, t) => {
      const h = hourNow(), hi = Math.floor(h), m = mode(), nk = AV.nightK || 0;
      const bo = bazaarOpen(); gOpen.forEach(x => x.visible = bo); gClosed.forEach(x => x.visible = !bo); bazaarFolk.forEach(w => w.vis = bo);
      monks.forEach(w => w.vis = m === 'normal' && h >= 6 && h < 8.5); band.forEach(w => w.vis = (h >= 19 || h < 1) || m !== 'normal'); regulars.forEach((w, i) => w.vis = i < 5 ? (h >= 18 || h < 1.5 || m !== 'normal') : h >= 8 && h < 23);
      perf.on = (h >= 18 && h < 23) || m === 'lantern'; perfG.visible = perf.on && nk > .3; if (perfG.visible) perf.fire.forEach((f, k) => { const a = t * 3.2 + k * 2.1; f.position.set(Math.cos(a) * .5, 1.6 + Math.abs(Math.sin(a)) * 1.6, 0) });
      if (hi !== lastHour) { if (lastHour >= 0 && m === 'normal') { if (hi === 17) AV.toast(tr('The Night Bazaar is opening — lanterns on, woks on.', 'Abre el Night Bazaar: farolillos encendidos, woks al fuego.')); if (hi === 6) AV.toast(tr('Morning bells. Monks walk the alms round on the main road.', 'Campanas de la mañana. Los monjes hacen la ronda de limosnas por la calle principal.')); if (hi === 18) AV.toast(tr('Warorot Market closes. Street food takes over.', 'Cierra el mercado Warorot. Manda la comida callejera.')); if (hi % 3 === 0) rollWeather() } lastHour = hi }
      /* strays wander */ strays.forEach((d, i) => { const u = d.userData; u.t -= dt; if (u.t <= 0) { u.t = 3 + Math.random() * 6; u.tx = u.home[0] + (Math.random() - .5) * 14; u.tz = u.home[1] + (Math.random() - .5) * 6 } const dx = u.tx - d.position.x, dz = u.tz - d.position.z, dd = Math.hypot(dx, dz), mv = dd > .3; if (mv) { d.position.x += dx / dd * dt * 1.4; d.position.z += dz / dd * dt * 1.4; d.rotation.y = Math.atan2(dx, dz) } CY.animDog(d, t + i, mv, false) });
      CY.animDog(bobo, t, false, true);
      { const P = AV.P, dF = Math.hypot(P.x - frenchie.position.x, P.z - frenchie.position.z), follow = dF < 6 && dF > 1.4 && insideH(P.x, P.z); if (follow) { frenchie.position.x += (P.x - frenchie.position.x) / dF * dt * 1.6; frenchie.position.z += (P.z - frenchie.position.z) / dF * dt * 1.6; frenchie.rotation.y = Math.atan2(P.x - frenchie.position.x, P.z - frenchie.position.z) } CY.animDog(frenchie, t, follow, !follow) }
      /* music comes from the nearest venue */
      if (AV.audio && AV.audio.track && AV.audio.track.active) { const P = AV.P; let best = VENUES[0], bd = 1e9; for (const v of VENUES) { const d = Math.hypot(P.x - v[0], P.z - v[2]); if (d < bd) { bd = d; best = v } } AV.audio.track.pos = { x: best[0], y: best[1], z: best[2] } }
      /* HUD */ hud(h);
      if (S.quests && S.quests.cm_soak === 'active' && S.cm.soakUntil && AV.now() > S.cm.soakUntil && S.cm.soak < 15) { S.quests.cm_soak = null; delete S.quests.cm_soak; AV.toast(tr('Time! You soaked ' + S.cm.soak + ' people. Ask ZtonedApe for a rematch.', '¡Tiempo! Empapaste a ' + S.cm.soak + ' personas. Pide revancha a ZtonedApe.')) }
    });
    const VENUES = [[18, 2.5, 62], [43, 2.5, 66], [151, 2.5, -16], [130, 2, 11], [196, 3, 40], [(FIELD.x0 + FIELD.x1) / 2, 3, 0], [16, 2.5, 33]];
    function rollWeather() { const r = Math.random(); S.cm.weather = mode() !== 'normal' ? 'clear' : r < .65 ? 'clear' : r < .85 ? 'cloudy' : 'rain'; applyWeather(); if (S.cm.weather === 'rain') AV.toast(tr('A tropical shower rolls over the city. Everyone ducks under the awnings.', 'Un chaparrón tropical cruza la ciudad. Todos se meten bajo los toldos.')) }
    function applyWeather() { const w = S.cm.weather; rainFx.on = w === 'rain'; SKY.tint = w === 'rain' ? [0x5a6a7a, 0x7a8a8a, .55, .6] : w === 'cloudy' ? [0x9aa8b8, 0xb8c0c8, .35, .35] : [0xffc890, 0xffe0b0, .12, .18]; SKY.dome.cloud = w === 'clear' ? .7 : 1.2; if (AV.W && AV.W.sky === SKY) { AV.scene.fog.near = w === 'rain' ? 40 : 80; AV.scene.fog.far = w === 'rain' ? 240 : 420 } }
    ctx.upd.push((() => { let once = false; return () => { if (!once) { once = true; applyWeather() } } })());
    const hudEl = AV.$('cmhud'); let hudT = 0;
    function hud(h) { if (!hudEl || AV.now() < hudT) return; hudT = AV.now() + .4; const m = mode(), name = m === 'lantern' ? tr('Yi Peng & Loy Krathong', 'Yi Peng y Loy Krathong') : m === 'songkran' ? tr('Songkran water festival', 'Festival del agua Songkran') : tr('Chiang Mai', 'Chiang Mai'); let extra = '';
      if (m === 'songkran') extra = ' · ' + tr('water', 'agua') + ' ' + Math.max(0, gun.ammo) + '% · Q';
      if (S.quests && S.quests.cm_soak === 'active') extra += ' · ' + tr('soaked ', 'empapados ') + S.cm.soak + '/15 · ' + Math.max(0, Math.ceil(S.cm.soakUntil - AV.now())) + 's';
      if (S.cm.scooter === S.day) extra += ' · 🛵';
      const w = { clear: '☀', cloudy: '☁', rain: '🌧' }[S.cm.weather] || ''; hudEl.style.display = 'block'; hudEl.textContent = name + ' ' + (m === 'normal' ? w : '✦') + extra + ' · F: ' + tr('festival modes', 'modos de fiesta') }
    /* scooter handlebars in view */
    const bars = new THREE.Group(); { const m = AV.std(0x2a2a2a, .4, .5); [[0, -.55, -.9, .9, .04, .04], [-.45, -.52, -.9, .1, .1, .12], [.45, -.52, -.9, .1, .1, .12], [0, -.75, -.85, .1, .4, .1]].forEach(p => { const b = new THREE.Mesh(BG.box, m); b.position.set(p[0], p[1], p[2]); b.scale.set(p[3], p[4], p[5]); bars.add(b) }); const mir = new THREE.Mesh(BG.sph, AV.std(0xb0c8d8, .1, .8)); mir.position.set(-.5, -.35, -.95); mir.scale.set(.08, .06, .02); bars.add(mir) }
    function updScooter() { const on = S.cm.scooter === S.day; if (on && !bars.parent) AV.cam.add(bars); else if (!on && bars.parent) AV.cam.remove(bars) }
    updScooter(); applyWeather();
    ctx.leave.push(() => { AV.cam.remove(bars); document.body.classList.remove('songkran'); if (hudEl) hudEl.style.display = 'none'; MD.resetFrames(); AV.cm.cur = null; if (AV.pool && AV.pool.open) AV.pool.close(true) });

    /* ======================= missions ======================= */
    const Q = AV.quests;
    const def = (id, giver, turnIn, title, hint, ready, reward) => Q.define(id, { giver, turnIn, title, hint, ready, reward });
    def('cm_welcome', 'mud', 'mud', ['Welcome to Giant', 'Bienvenido al Giant'], ['Meet Nuni, Steve, Dino and ZtonedApe, then talk to Mutt.', 'Conoce a Nuni, Steve, Dino y ZtonedApe y luego habla con Mutt.'], S2 => ['nuni', 'steve', 'dino', 'zape'].every(k => S2.cm.met[k]), S2 => { AV.txn(30, 'Mission: Welcome to Giant'); S2.cm.freeNight = true; return tr('Mutt: “Now you are family. 30 credits and one free night.”', 'Mutt: “Ahora eres familia. 30 créditos y una noche gratis.”') });
    def('cm_errand', 'mud', 'mud', ['Mango sticky rice for Mutt', 'Mango con arroz para Mutt'], ['Buy mango sticky rice (Night Bazaar or Warorot Market) and bring it to Mutt.', 'Compra mango con arroz glutinoso (Night Bazaar o mercado Warorot) y llévaselo a Mutt.'], S2 => (S2.items.mango || 0) > 0, S2 => { S2.items.mango--; AV.txn(25, 'Mission: mango for Mutt'); return tr('Mutt eats it in four seconds flat. +25 credits.', 'Mutt se lo come en cuatro segundos. +25 créditos.') });
    def('cm_lanterns', 'mud', 'mud', ['Light up Giant', 'Ilumina el Giant'], ['Hang 3 lanterns on the glowing hooks of the hostel terrace, then talk to Mutt.', 'Cuelga 3 farolillos en los ganchos brillantes de la terraza y habla con Mutt.'], S2 => (S2.cm.hooks || 0) >= 3, () => { AV.txn(30, 'Mission: lanterns'); return tr('Mutt: “Beautiful. Best hostel on the street.” +30 credits.', 'Mutt: “Precioso. El mejor hostal de la calle.” +30 créditos.') });
    def('cm_pool', 'nuni', 'nuni', ['Get Your Ass Kicked by Nuni', 'Que Nuni te dé una paliza'], ['Follow Nuni to the Rack & Roll Pool Bar on Tha Phae Road (or take a tuk-tuk) and challenge her at the table.', 'Sigue a Nuni al bar de billar Rack & Roll en Tha Phae Road (o coge un tuk-tuk) y desafíala en la mesa.'], S2 => !!S2.cm.poolPlayed, S2 => { if (S2.cm.poolWon) { AV.txn(100, 'Beat Nuni at pool'); return tr('Nuni, stunned: “Nobody tells Mutt.” She pays the 100-credit bet.', 'Nuni, atónita: “Que nadie se lo cuente a Mutt.” Paga la apuesta de 100 créditos.') } AV.txn(15, 'Nuni’s pity money'); return tr('Nuni buys you a beer and slips you 15 credits “for therapy”.', 'Nuni te invita a una cerveza y te da 15 créditos “para terapia”.') });
    def('cm_jam', 'steve', 'steve', ['Jam at Blue’s', 'Jam en el Blue’s'], ['Keep the beat with Steve at Blue’s Live Music Bar.', 'Lleva el ritmo con Steve en el Blue’s Live Music Bar.'], S2 => !!S2.cm.jammed, () => { AV.txn(20, 'Mission: jam with Steve'); return tr('Steve: “You’ve got hands, mate!” +20 credits from the tip jar.', 'Steve: “¡Tienes manos, colega!” +20 créditos del bote de propinas.') });
    def('cm_dino_tour', 'dino', 'dino', ['Dino’s weird shortcut', 'El atajo raro de Dino'], ['Follow Dino through the Old City and touch the Gecko Shrine, then talk to him.', 'Sigue a Dino por la Ciudad Vieja, toca el Santuario del Geco y habla con él.'], S2 => !!S2.cm.gecko, () => { AV.txn(15, 'Mission: Gecko Shrine'); return tr('Dino: “The geckos accept you.” He gives you 15 credits and a sticker.', 'Dino: “Los gecos te aceptan.” Te da 15 créditos y una pegatina.') });
    def('cm_skylantern', 'dino', 'dino', ['A lantern for the sky', 'Un farolillo para el cielo'], ['Release a sky lantern at the Lantern Field (Yi Peng mode), then talk to Dino.', 'Suelta un farolillo en el Campo de Farolillos (modo Yi Peng) y habla con Dino.'], S2 => !!S2.cm.sky, () => { AV.txn(20, 'Mission: sky lantern'); return tr('Dino wipes a tear. “It went to Laos, man.” +20 credits.', 'Dino se seca una lágrima. “Se fue a Laos, tío.” +20 créditos.') });
    def('cm_krathong', 'zape', 'zape', ['Float a krathong', 'Suelta un krathong'], ['Float a krathong at the Ping River pier (Loy Krathong mode), then talk to ZtonedApe.', 'Suelta un krathong en el muelle del río Ping (modo Loy Krathong) y habla con ZtonedApe.'], S2 => !!S2.cm.krathong, () => { AV.txn(20, 'Mission: krathong'); return tr('ZtonedApe: “I filmed it. It’s going in the next video.” +20 credits.', 'ZtonedApe: “Lo grabé. Sale en el próximo vídeo.” +20 créditos.') });
    def('cm_soak', 'zape', 'zape', ['Songkran water war', 'Guerra de agua de Songkran'], ['Soak 15 people in 2 minutes with your water gun (Q), then talk to ZtonedApe.', 'Empapa a 15 personas en 2 minutos con tu pistola (Q) y habla con ZtonedApe.'], S2 => (S2.cm.soak || 0) >= 15, () => { AV.txn(30, 'Mission: water war'); return tr('ZtonedApe: “Legend of Songkran!” +30 credits.', 'ZtonedApe: “¡Leyenda de Songkran!” +30 créditos.') });
    /* meeting the crew (welcome mission) */
    ctx.upd.push(() => { if (AV.chat.open && crew[AV.chat.who] && !S.cm.met[AV.chat.who]) { S.cm.met[AV.chat.who] = 1; AV.quests.check() } });

    /* ======================= AV.cm : world-side actions used by dialogue, UI and keys ======================= */
    const cur = AV.cm.cur = { crew, ctx, crowd };
    const poolBarPos = { x: 147, z: -12.2 };
    AV.cm.metList = () => { const m = S.cm.met, a = ['nuni', 'steve', 'dino', 'zape'].map(k => (m[k] ? '✔ ' : '○ ') + AV.NPCS[k].name); return a.join(', ') };
    AV.cm.allowed = (who, what) => (who === 'nuni' && what === 'pool_here') || (who === 'steve' && what === 'jam');
    AV.cm.onQuest = id => {
      if (id === 'cm_pool') { const n = crew.nuni; n.busy = true; n.mode = 'lead'; routeTo(n, poolBarPos.x - 1.2, poolBarPos.z - 2.2, 0, { lead: true, speed: 1.9, via: [[16, 46.2], [62.6, 46.2], [62.6, 2.5], [151, 2.5], [151, -7]], onArrive: nn => { nn.mode = 'pool'; nn.atBar = true; AV.npc.bark(nn, tr('This is my table. Challenge me when you’re ready.', 'Esta es mi mesa. Desafíame cuando estés listo.')) } }); AV.toast(tr('Follow Nuni! (or take a tuk-tuk to the “Rack & Roll Pool Bar” — she rides with you for free)', '¡Sigue a Nuni! (o coge un tuk-tuk al “bar de billar Rack & Roll”; ella viaja contigo gratis)')) }
      if (id === 'cm_dino_tour') { const n = crew.dino; n.busy = true; n.seat = null; routeTo(n, -80, -76.6, Math.PI, { lead: true, speed: 1.4, via: [[1.6, 46], [1.6, 2.8], [-61.4, 2.8], [-61.4, -61.6], [-62, -78], [-74, -76]], onArrive: nn => AV.npc.bark(nn, tr('Behold. The Gecko Shrine. Touch it, man.', 'Contempla. El Santuario del Geco. Tócalo, tío.')) }); AV.toast(tr('Follow Dino through the Old City.', 'Sigue a Dino por la Ciudad Vieja.')) }
      if (id === 'cm_soak') { S.cm.soak = 0; S.cm.soakUntil = AV.now() + 120; AV.toast(tr('GO! 2 minutes. Q (or Splash) to shoot. Refill at blue barrels.', '¡YA! 2 minutos. Q (o Splash) para disparar. Recarga en los barriles azules.')) }
    };
    AV.cm.act = (who, what) => {
      if (what === 'pool_here') { AV.pool.openGame({ onEnd: win => { AV.toast(win ? tr('You beat Nuni at the hostel table! She demands a rematch immediately.', '¡Ganaste a Nuni en la mesa del hostal! Exige revancha inmediatamente.') : tr('Nuni wins. She takes a bow for nobody in particular.', 'Gana Nuni. Hace una reverencia a nadie en particular.')) } }) }
      if (what === 'jam') jam();
    };
    AV.cm.poolLabel = () => S.quests && S.quests.cm_pool === 'active' ? (crew.nuni.atBar ? tr('Challenge Nuni (8-ball)', 'Desafiar a Nuni (bola 8)') : tr('Pool table — wait for Nuni', 'Mesa de billar: espera a Nuni')) : tr('Pool table', 'Mesa de billar');
    AV.cm.poolBarTable = () => { const n = crew.nuni; if (!(S.quests && S.quests.cm_pool === 'active')) return AV.toast(tr('A regular racks up. Nuni plays here on her mission: ask her at Giant Hostel.', 'Un habitual coloca las bolas. Nuni juega aquí en su misión: pregúntale en el Giant Hostel.')); if (!n.atBar) return AV.toast(tr('Nuni isn’t here yet. Follow her or take a tuk-tuk together.', 'Nuni aún no ha llegado. Síguela o coged un tuk-tuk juntos.'));
      AV.pool.openGame({ onEnd: win => { S.cm.poolPlayed = true; S.cm.poolWon = !!win; AV.quests.check(); AV.npc.bark(n, win ? tr('Impossible. IMPOSSIBLE.', 'Imposible. IMPOSIBLE.') : tr('Ass: kicked. As promised.', 'Paliza: entregada. Como prometí.')); AV.toast(tr('Talk to Nuni to finish the mission.', 'Habla con Nuni para terminar la misión.')) } }) };
    /* panels */
    const panel = (html) => AV.panel('cmp', html);
    AV.cm.modePanel = () => { const m = mode(), btn = (id, en, es, den, des) => '<button data-m="' + id + '" class="' + (m === id ? 'on' : '') + '">' + tr(en, es) + '<small>' + tr(den, des) + '</small></button>';
      const p = panel('<b>' + tr('Chiang Mai mode', 'Modo de Chiang Mai') + '</b><div class="grid">' + btn('normal', 'Normal city', 'Ciudad normal', 'Daily life, markets, traffic, weather', 'Vida diaria, mercados, tráfico, clima') + btn('lantern', 'Yi Peng & Loy Krathong', 'Yi Peng y Loy Krathong', 'Lanterns, parade, candles, krathongs, sky lanterns (starts 19:30)', 'Farolillos, desfile, velas, krathongs, farolillos al cielo (empieza 19:30)') + btn('songkran', 'Songkran', 'Songkran', 'Water festival — water guns, splashing, trucks (starts 11:00)', 'Festival del agua: pistolas, salpicones, camionetas (empieza 11:00)') + '</div><button data-close>' + tr('Close', 'Cerrar') + '</button>');
      p.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { AV.closePanel('cmp'); AV.cm.setMode(b.dataset.m) }) };
    /* V0.9.7: switching modes rebuilds the city around you (lanterns, parade, candles, krathongs / water fights) and jumps to the festival hour */
    AV.cm.setMode = nm => { if (nm === mode()) return; S.cmMode = nm; if (nm === 'lantern') S.time = 19.5 * 60; if (nm === 'songkran') S.time = 11 * 60; S.cm.weather = 'clear'; AV.cm.lastPos = { x: AV.P.x, z: AV.P.z, yaw: AV.P.yaw }; AV.enterWorld('chiang_mai', 'here');
      setTimeout(() => AV.toast(nm === 'lantern' ? tr('Yi Peng & Loy Krathong! Lanterns, candles, the parade on Tha Phae Rd, krathongs on the river, sky lanterns over the Lantern Field. (F: next mode)', '¡Yi Peng y Loy Krathong! Farolillos, velas, el desfile en Tha Phae, krathongs en el río y farolillos al cielo en el Campo. (F: siguiente modo)') : nm === 'songkran' ? tr('Songkran! Water fight city-wide. Fill up at a blue barrel, Q / Splash to shoot. (F: next mode)', '¡Songkran! Guerra de agua en toda la ciudad. Llena en un barril azul, Q / Splash para disparar. (F: siguiente modo)') : tr('Back to everyday Chiang Mai. (F: festival modes)', 'De vuelta al Chiang Mai de cada día. (F: modos de fiesta)')), 600) };
    AV.cm.cycleMode = () => { const order = ['normal', 'lantern', 'songkran']; AV.cm.setMode(order[(order.indexOf(mode()) + 1) % order.length]) };
    { const fb = AV.$('tF'); if (fb) { fb.style.display = AV.device === 'phone' ? 'block' : 'none'; ctx.leave.push(() => fb.style.display = 'none') } }
    AV.cm.portalPanel = () => { const ws = Object.keys(AV.worldDefs).filter(id => id !== 'chiang_mai');
      const p = panel('<b>' + tr('Apeverse Portal', 'Portal Apeverse') + '</b><div class="grid">' + ws.map(id => '<button data-w="' + id + '">' + ((AV.worldMeta(id) || {}).name || id) + '</button>').join('') + '</div><div class="note">' + tr('The Portal Pipe (P) works here too.', 'La Pipa-Portal (P) también funciona aquí.') + '</div><button data-close>' + tr('Close', 'Cerrar') + '</button>');
      p.querySelectorAll('[data-w]').forEach(b => b.onclick = () => { AV.closePanel('cmp'); AV.audio && AV.audio.whoosh(); AV.travel(b.dataset.w, 'chiang_mai') }) };
    AV.cm.shopPanel = () => { const items = [['beer', 'Cold beer', 'Cerveza fría', 40], ['water', 'Bottle of water', 'Botella de agua', 10], ['thai_tea', 'Thai iced tea', 'Té tailandés helado', 15], ['snack', 'Snacks', 'Snacks', 20], ['tee', 'Giant Hostel tee', 'Camiseta del Giant Hostel', 120], ['ukulele', 'Ukulele', 'Ukelele', 150], ['pre', 'Adults-only counter (pre-roll)', 'Mostrador solo adultos (porro liado)', 60], ['herb', 'Adults-only counter (herb pouch)', 'Mostrador solo adultos (bolsita de hierba)', 30], ['pipe', 'Glass pipe', 'Pipa de cristal', 50]];
      const p = panel('<b>' + tr('Giant Hostel shop', 'Tienda del Giant Hostel') + '</b><div class="note">' + tr('Adults only at the cannabis counter (legal for adults in this fictional Chiang Mai). Smoke outside on the terrace.', 'Mostrador de cannabis solo para adultos (legal para adultos en este Chiang Mai ficticio). Se fuma fuera, en la terraza.') + '</div><div class="grid">' + items.map(i => '<button data-i="' + i[0] + '">' + tr(i[1], i[2]) + '<small>' + i[3] + ' ' + tr('credits', 'créditos') + '</small></button>').join('') + '</div><button data-close>' + tr('Close', 'Cerrar') + '</button>');
      p.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { const it = items.find(i => i[0] === b.dataset.i); if (AV.txn(-it[3], it[1])) { if (AV.bag) AV.bag.add(it[0], 1, true); else S.items[it[0]] = (S.items[it[0]] || 0) + 1; AV.toast(it[0] === 'pre' ? tr('Nunyin: “Terrace only, okay?” Dino already looks interested.', 'Nunyin: “Solo en la terraza, ¿vale?” Dino ya parece interesado.') : it[0] === 'tee' ? tr('You are now 30% more Giant.', 'Ahora eres un 30% más Giant.') : tr('Crunchy and cold. Perfect.', 'Crujiente y frío. Perfecto.')) } }) };
    AV.cm.tukPanel = from => { const withNuni = S.quests && S.quests.cm_pool === 'active' && !crew.nuni.atBar && Math.hypot(AV.P.x - crew.nuni.g.position.x, AV.P.z - crew.nuni.g.position.z) < 25;
      const p = panel('<b>' + tr('Tuk-tuk', 'Tuk-tuk') + '</b><div class="note">' + tr('30 credits per ride. The driver knows a shortcut. Probably.', '30 créditos por viaje. El conductor conoce un atajo. Probablemente.') + '</div><div class="grid">' + STANDS.filter(s => s[0] !== from).map(s => '<button data-s="' + s[0] + '">' + s[3] + (s[0] === 'pool' && withNuni ? '<small>' + tr('with Nuni — free!', 'con Nuni: ¡gratis!') + '</small>' : '') + '</button>').join('') + '</div><button data-close>' + tr('Close', 'Cerrar') + '</button>');
      p.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { const s = STANDS.find(x => x[0] === b.dataset.s), free = s[0] === 'pool' && withNuni; if (!free && !AV.txn(-30, 'Tuk-tuk to ' + s[3])) return; AV.closePanel('cmp'); startRide(s, free) }) };
    /* ---------- V0.9.7: REAL tuk-tuk rides — you sit in the back while it drives the street graph to the stop; E / Act skips ---------- */
    const rideMat = CY.vehMat(ctx); let ride = null;
    const navPath = (a, b) => { const n = nodes.length, dist = new Float64Array(n).fill(1e9), prev = new Int32Array(n).fill(-1), done = new Uint8Array(n); dist[a] = 0;
      for (;;) { let u = -1, bd = 1e9; for (let i = 0; i < n; i++) if (!done[i] && dist[i] < bd) { bd = dist[i]; u = i } if (u < 0 || u === b) break; done[u] = 1;
        for (const v of NAV.links[u]) { const d = bd + Math.hypot(nodes[u][0] - nodes[v][0], nodes[u][1] - nodes[v][1]); if (d < dist[v]) { dist[v] = d; prev[v] = u } } }
      const out = []; for (let u = b; u >= 0; u = prev[u]) out.unshift(nodes[u]); return out };
    const arrive = (s, free) => { const P = AV.P; P.x = s[4]; P.z = s[5]; P.y = 0; P.vx = P.vz = P.vy = 0; P.yaw = s[6]; S.time += 6;
      if (free) { const n = crew.nuni; n.path = null; n.g.position.set(poolBarPos.x - 1.2, 0, poolBarPos.z - 2.2); n.g.rotation.y = 0; n.mode = 'pool'; n.atBar = true; AV.npc.bark(n, tr('Tuk-tuk driver was faster than you. Respect.', 'El del tuk-tuk fue más rápido que tú. Respeto.')) }
      AV.toast(tr('Tuk-tuk ride: ', 'Viaje en tuk-tuk: ') + s[3] + (free ? tr(' (Nuni paid!)', ' (¡pagó Nuni!)') : '')) };
    const startRide = (s, free) => {
      const P = AV.P, raw = [[P.x, P.z]].concat(navPath(NAV.near(P.x, P.z), NAV.near(s[4], s[5])), [[s[4], s[5]]]), pts = [];
      raw.forEach(p => { if (!pts.length || Math.hypot(p[0] - pts[pts.length - 1][0], p[1] - pts[pts.length - 1][1]) > 1.5) pts.push(p) }); if (pts.length < 2) { arrive(s, free); return }
      const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p[0], 0, p[1])), false, 'centripetal', .5), tk = new THREE.Mesh(CY.VB.tuktuk(0x2a7a5a), rideMat);
      tk.castShadow = q === 2; grp.add(tk); const t0 = curve.getTangentAt(0); P.yaw = Math.atan2(t0.x, t0.z) + Math.PI;
      ride = AV.cm.ride = { curve, len: curve.getLength(), s: 0, v: 0, tk, dest: s, free }; AV.audio && AV.audio.blip(330, .3, 'square', .05);
      AV.toast(tr('Hop in! The driver takes the streets to ', '¡Sube! El conductor va por las calles hasta ') + s[3] + ' (' + Math.round(ride.len) + ' m)' + tr(' — E / Act to skip.', ' — E / Act para saltar.')) };
    const endRide = () => { if (!ride) return; const r = ride; ride = AV.cm.ride = null; grp.remove(r.tk); r.tk.geometry.dispose(); arrive(r.dest, r.free) };
    AV.cm.skipRide = endRide;
    const rideT = { x: 0, z: 0, r: 5, show: () => !!ride, label: () => tr('Skip the ride (arrive now)', 'Saltar el viaje (llegar ya)'), fn: endRide }; ctx.T.push(rideT);
    ctx.upd.push((dt0, t) => { if (!ride) return; const r = ride, now = AV.now(), dt = Math.min(.25, now - (r.last || now)), left = r.len - r.s; r.last = now; /* real time: same ride length on slow devices */ r.v += (Math.min(10, left * .7 + 1.5) - r.v) * Math.min(1, dt * 1.1); r.s += r.v * dt;
      const u = Math.min(1, r.s / r.len), p = r.curve.getPointAt(u), tg = r.curve.getTangentAt(u), yaw = Math.atan2(tg.x, tg.z); r.tk.position.set(p.x, Math.sin(t * 14) * .015, p.z); r.tk.rotation.y = yaw;
      const P = AV.P; P.x = p.x - Math.sin(yaw) * .7; P.z = p.z - Math.cos(yaw) * .7; P.y = 0; P.vx = P.vz = P.vy = 0; AV.cam.position.set(P.x, 1.38 + Math.sin(t * 14) * .015, P.z); rideT.x = P.x; rideT.z = P.z;
      if (u >= 1) endRide() });
    ctx.leave.push(() => { ride = AV.cm.ride = null });
    /* ---------- V0.9.7: evening live music at Blue's (19:00–01:00) — positional, heard from across the street at the hostel ---------- */
    let liveT = -9; ctx.upd.push(() => { if (AV.now() - liveT < 1.2) return; liveT = AV.now(); const W = AV.W; if (!W || W.id !== 'chiang_mai' || !AV.audio || !AV.audio.track) return;
      const h = hourNow(), live = mode() !== 'songkran' && (h >= 19 || h < 1), want = live ? 'live' : 'day'; if (W._live === want) return; const first = W._live == null; W._live = want;
      W.music = live ? { playlist: 'stone_ape_band', pos: { x: bX(43), y: 2.6, z: bZ(66.5) }, bed: .12 } : { playlist: 'chiang_mai', pos: { x: 18, y: 2.5, z: 62 }, bed: .45 };
      AV.audio.track.setWorld(W); if (live && !first || live && first && Math.hypot(AV.P.x - 17, AV.P.z - 40) < 40) AV.toast(tr('♪ Live band at Blue’s across the street tonight!', '♪ ¡Banda en directo en el Blue’s, al otro lado de la calle!')) });
    /* quest completion: crew go back to their routine */
    ctx.upd.push(() => { const qs = S.quests || {}; if (crew.nuni.busy && qs.cm_pool === 'done' && Math.hypot(AV.P.x - crew.nuni.g.position.x, AV.P.z - crew.nuni.g.position.z) > 30) { crew.nuni.busy = false; crew.nuni.atBar = false; lastPlan.nuni = null; plan('teleport') } if (crew.dino.busy && qs.cm_dino_tour === 'done' && Math.hypot(AV.P.x - crew.dino.g.position.x, AV.P.z - crew.dino.g.position.z) > 30) { crew.dino.busy = false; lastPlan.dino = null; plan('teleport') } });
    /* re-entering the world mid-mission: Nuni waits at her pool table, Dino at the shrine */
    if (S.quests && S.quests.cm_pool === 'active') { const n = crew.nuni; n.busy = true; n.path = null; n.g.position.set(poolBarPos.x - 1.2, 0, poolBarPos.z - 2.2); n.g.rotation.y = n.yaw = 0; n.mode = 'pool'; n.atBar = true }
    if (S.quests && S.quests.cm_dino_tour === 'active') { const n = crew.dino; n.busy = true; n.seat = null; n.path = null; n.g.position.set(-80, 0, -76.6); n.g.rotation.y = n.yaw = Math.PI }
    /* Steve's jam: a tiny rhythm game on the beat */
    function jam() { const P = AV.P; AV.fadeTo(1, 300); setTimeout(() => { P.x = bX(43); P.z = bZ(61.5); P.y = 0; P.yaw = Math.PI; const n = crew.steve; n.path = null; n.g.position.set(bX(41.2), .6, bZ(66.4)); n.g.rotation.y = 0; n.seat = null; n.busy = true; AV.fadeTo(0, 400);
        let hits = 0, total = 0, lastB = -1, open = true; const p = panel('<b>' + tr('Jam with Steve', 'Jam con Steve') + '</b><div class="note">' + tr('Hit on every beat when the ring flashes: Space, E or the button. 16 beats.', 'Golpea en cada pulso cuando parpadee el anillo: Espacio, E o el botón. 16 pulsos.') + '</div><div id="jring" style="width:120px;height:120px;border-radius:50%;margin:16px auto;border:8px solid #6ab8ff;transition:transform .08s"></div><div id="jsc" style="text-align:center;font-size:18px">0 / 0</div><div class="row" style="justify-content:center"><button id="jhit" style="font-size:20px;padding:12px 28px">' + tr('HIT!', '¡GOLPE!') + '</button><button data-close>' + tr('Stop', 'Parar') + '</button></div>');
        const ring = AV.$('jring'), sc = AV.$('jsc'); const beat = () => AV.audio && AV.audio.ok ? AV.audio.beat : AV.now() * 1.5;
        const hit = () => { const b = beat(), off = Math.abs(b - Math.round(b)); const good = off < .18; if (good) hits++; AV.audio && AV.audio.blip(good ? 196 : 110, .15, 'sine', .3); ring.style.borderColor = good ? '#7aff9a' : '#ff6a6a' };
        AV.$('jhit').onclick = hit; const key = e => { if (!open) return; if (e.code === 'Space' || e.code === 'KeyE') { e.preventDefault(); e.stopPropagation(); hit() } }; addEventListener('keydown', key, true);
        const tick = () => { if (!open || AV.$('cmp').style.display !== 'block') { open = false; removeEventListener('keydown', key, true); n.busy = false; lastPlan.steve = null; return } const b = beat(), bi = Math.floor(b); ring.style.transform = 'scale(' + (1 + Math.max(0, .25 - (b - bi)) * 1.6) + ')'; if (bi !== lastB) { lastB = bi; total++; ring.style.borderColor = '#6ab8ff' } sc.textContent = hits + ' / ' + Math.min(16, total);
          if (total > 16) { open = false; removeEventListener('keydown', key, true); AV.closePanel('cmp'); n.busy = false; lastPlan.steve = null; const ok = hits >= 10; if (ok) { S.cm.jammed = true; AV.quests.check() } AV.npc.bark(n, ok ? tr('YES! That groove!', '¡SÍ! ¡Ese groove!') : tr('Close! Again later?', '¡Casi! ¿Otra luego?')); AV.toast(tr('Jam score: ', 'Puntuación del jam: ') + hits + '/16' + (ok ? tr(' — Steve is impressed. Talk to him.', ' — Steve está impresionado. Habla con él.') : tr(' — need 10 for Steve’s mission.', ' — necesitas 10 para la misión de Steve.'))); return } requestAnimationFrame(tick) }; requestAnimationFrame(tick) }, 350) }

    /* ---------- flush ---------- */
    for (const k of ['sky', 'fest']) { B[k].flush(ctx, { noShadow: true }); delete B[k] } for (const k in B) B[k].flush(ctx);

    const here = AV.cm.lastPos || null; AV.cm.lastPos = null;
    return {
      name: 'Chiang Mai', fog: [80, 420], glowScale: md === 'lantern' ? 1.4 : 1, sky: SKY,
      surface: (x, z) => { if (x < XMIN + 3 || x > XMAX - 3 || z < ZMIN + 3 || z > ZMAX - 3) return null; if (inMoat(x, z) || inRiver(x, z)) return WY; const p = walk.at(x, z); return p === undefined ? 0 : Math.max(0, p) },
      speedMul: () => S.cm && S.cm.scooter === S.day ? 2 : 1,
      arrivals: { default: { x: 18, z: 46, yaw: Math.PI }, pipe: { x: 22, z: 45.6, yaw: Math.PI }, ape_gate: { x: PX + .5, z: 46.2, yaw: Math.PI }, here: here || { x: 18, z: 46, yaw: Math.PI } },
      defaultArrival: 'default',
      places: [{ id: 'hostel', name: ['Giant Hostel', 'Giant Hostel'], x: 18, z: 46, yaw: Math.PI }, { id: 'gate', name: ['Tha Phae Gate', 'Puerta Tha Phae'], x: 132, z: 0, yaw: -Math.PI / 2 }, { id: 'bazaar', name: ['Night Bazaar', 'Night Bazaar'], x: 183, z: 11, yaw: Math.PI },
        { id: 'luang', name: ['Wat Chedi Luang', 'Wat Chedi Luang'], x: -28, z: 4, yaw: Math.PI }, { id: 'river', name: ['Ping River pier', 'Muelle del río Ping'], x: 252, z: 30, yaw: -Math.PI / 2 }, { id: 'field', name: ['Lantern Field', 'Campo de Farolillos'], x: -150, z: 0, yaw: Math.PI / 2 }, { id: 'pool', name: ['Rack & Roll Pool Bar', 'Bar de billar Rack & Roll'], x: 151, z: -3, yaw: 0 }],
      musicProfile: { bpm: 90, root: 45, scale: [0, 2, 4, 7, 9], style: 'boom' },
      music: { playlist: 'chiang_mai', pos: { x: 18, y: 2.5, z: 62 }, bed: .45 }
    };
  }
});
/* global hooks (keys, touch) — act only inside Chiang Mai */
AV.cm = AV.cm || {};
/* V0.9.7: F (and the phone "Fest" button) switches festival mode directly: Normal → Yi Peng & Loy Krathong → Songkran → Normal.
   The festival board at reception still opens the full mode menu. */
AV.keymap.KeyF = () => { if (AV.W && AV.W.id === 'chiang_mai' && AV.cm.cycleMode) AV.cm.cycleMode(); else if (AV.W && AV.W.id === 'vienna' && AV.vienna && AV.vienna.toggleSeason) AV.vienna.toggleSeason() };   /* V0.9.9: also Vienna summer / winter */
{ const fb = document.getElementById('tF'); if (fb) fb.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); if (AV.running && !AV.blocking()) AV.keymap.KeyF() }) }
AV.keymap.KeyQ = () => { if (AV.cm.shoot) AV.cm.shoot() };
/* meeting the crew counts as soon as a conversation opens (welcome mission) */
{ const oc = AV.openChat; AV.openChat = function (who) { oc(who); if (AV.W && AV.W.id === 'chiang_mai' && AV.S.cm && ['nuni', 'steve', 'dino', 'zape'].indexOf(who) >= 0 && !AV.S.cm.met[who]) { AV.S.cm.met[who] = 1; AV.quests && AV.quests.check() } } }
{ const b = document.getElementById('tW'); if (b) { let iv = 0; b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); AV.cm.shoot && AV.cm.shoot(); clearInterval(iv); iv = setInterval(() => AV.cm.shoot && AV.cm.shoot(), 140) }); ['pointerup', 'pointercancel', 'pointerleave'].forEach(n => b.addEventListener(n, () => clearInterval(iv))) } }
})(window.AV);
