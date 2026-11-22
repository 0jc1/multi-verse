/* APEVERSE V1.0 - world_da_nang.js : ĐÀ NẴNG — the river city by the sea (central Vietnam). North = -z, the East Sea is +x.
   ~630 × 360 m playable. West bank (Hải Châu): Bạch Đằng riverside promenade, Hàn Market, the pink Da Nang Cathedral
   ("Rooster Church"), Cồn Market, Asia Park with the Sun Wheel, tube-house streets and riverside towers.
   The Hàn River: Dragon Bridge (Cầu Rồng — LED-lit, breathes fire then water at 21:00), the Hàn River swing bridge (truss),
   Trần Thị Lý cable-stayed bridge, the Love Pier (Cầu Tình Yêu) with the Carp-Dragon fountain, river cruise boats.
   East bank (Sơn Trà / An Hải): Sơn Trà night market, beach hotels, Võ Nguyên Giáp beach road, then MỸ KHÊ BEACH:
   coconut palms, thatched umbrellas + sunbeds, lifeguard towers, thúng chai basket boats, fishing boats, rolling surf with
   foam, swimmable sea (you float when it gets deep), sunrise over the sea. Backdrop: Sơn Trà peninsula + Lady Buddha (north),
   Marble Mountains (south-east), Trường Sơn range (west).
   Life: instanced pedestrians (nón lá vendors with shoulder poles, beachgoers, swimmers), scooter-heavy RIGHT-hand traffic,
   scooters parked on the sidewalks, rigged locals, seagulls. Bucket list (F / phone "List"): 9 Da Nang experiences. */
'use strict';
(function (AV) {
const tr = AV.tr, TAU = AV.TAU, K = AV.kit, A = AV.arch, CY = AV.city, M = K.M, BG = K.BG;
const hourNow = () => (AV.S.time / 60) % 24;

/* ======================= layout ======================= */
const XMIN = -250, XMAX = 380, ZMIN = -180, ZMAX = 180, GW = XMAX - XMIN, GD = ZMAX - ZMIN;
const RIV0 = -46, RIV1 = 14, RWY = -3.2, SWY = -.3, PROM = 222;
const shoreX = z => 292 + Math.sin(z * .011) * 5 + Math.sin(z * .031 + 1) * 1.5;
/* beach profile: low dune → flat dry sand → steeper beach face → gently shelving sea bed (keep in sync with the sea shader) */
const bedY = (x, z) => { const p = x - shoreX(z); if (p >= 0) return SWY - p * .05 - Math.max(0, p - 30) * .06; if (p > -12) return .1 - .4 * (p + 12) / 12;
  return Math.min(1, Math.max(0, (x - PROM) / 3)) * .3 - .2 * Math.min(1, Math.max(0, (p + 62) / 50)) };
/* streets: verticals [x, z0, z1, w], horizontals [z, x0, x1, w] (west bank x < RIV0, east bank x > RIV1) */
const VR = [[-236, -180, 120, 8], [-190, -180, 120, 8], [-144, -180, 120, 8], [-100, -180, 180, 8], [-66, -180, 180, 12],
  [26, -180, 180, 10], [70, -180, 180, 8], [116, -180, 180, 8], [160, -180, 180, 8], [205, -180, 180, 14]];
const HR = [[-150, -250, -66, 7], [-110, -250, -66, 10], [-60, -250, -66, 7], [0, -250, -66, 12], [60, -250, -66, 7], [120, -250, -66, 10], [160, -100, -66, 7],
  [-150, 26, 205, 7], [-110, 26, 205, 10], [-60, 26, 205, 7], [0, 26, 205, 12], [60, 26, 205, 7], [120, 26, 205, 10], [160, 26, 205, 7]];
const ROADS = VR.map(v => [v[0], v[1], v[0], v[2], v[3]]).concat(HR.map(h => [h[1], h[0], h[2], h[0], h[3]]));
const BRIDGES = [{ id: 'han', z: -110, w: 16, road: 10 }, { id: 'dragon', z: 0, w: 22, road: 14 }, { id: 'ttl', z: 120, w: 17, road: 10 }];
function segD(x, z, r) { const dx = r[2] - r[0], dz = r[3] - r[1], L = dx * dx + dz * dz, t = Math.max(0, Math.min(1, ((x - r[0]) * dx + (z - r[1]) * dz) / L)); return Math.hypot(x - r[0] - dx * t, z - r[1] - dz * t) - r[4] / 2 }
const roadDist = (x, z) => { let d = 1e9; for (const r of ROADS) d = Math.min(d, segD(x, z, r)); return d };
const R = (x0, x1, z0, z1) => ({ x0, x1, z0, z1 });
const inRect = (r, x, z, m) => x > r.x0 - (m || 0) && x < r.x1 + (m || 0) && z > r.z0 - (m || 0) && z < r.z1 + (m || 0);
const HANM = R(-97, -71, -104, -66), CATH = R(-97, -71, -54, -7), CONM = R(-184, -150, 6, 55), ASIA = R(-246, -106, 126, 180), NIGHTM = R(32, 65, 7, 55);
const TW1 = R(-97, -71, -147, -114), TW2 = R(-97, -71, 5, 55), TW3 = R(-97, -71, 125, 156), HOT = R(163, 199, -180, 180);
const SEAFOOD = R(226, 250, 62, 86), BAR = R(226, 242, -46, -28);
const RESERVED = [HANM, CATH, CONM, ASIA, NIGHTM, TW1, TW2, TW3, HOT];
const PX = 217, PZ = -18;   // Apeverse portal on the beach promenade

/* ======================= canvas textures ======================= */
const TX = {};
function canvasTex(w, h, draw, rep) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; t.wrapS = t.wrapT = rep ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping; t.userData = { keep: true }; return t }
function groundTex(N) {
  const key = 'g' + N; if (TX[key]) return TX[key];
  return TX[key] = canvasTex(N, Math.round(N * GD / GW), (c, w, h) => {
    const m = w / GW, P = (x, z) => [(x - XMIN) * m, (z - ZMIN) * m], r = AV.rng(88);
    c.fillStyle = '#b3ada3'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 2200; i++) { const x = r() * w, y = r() * h, s = w * (.003 + r() * .012); c.fillStyle = ['#a8a298', '#bcb6aa', '#a49c90', '#c0b8aa'][i % 4]; c.globalAlpha = .35; c.beginPath(); c.arc(x, y, s, 0, TAU); c.fill() } c.globalAlpha = 1;
    const rect = (q, col) => { const a = P(q.x0, q.z0); c.fillStyle = col; c.fillRect(a[0], a[1], (q.x1 - q.x0) * m, (q.z1 - q.z0) * m) };
    rect(ASIA, '#6f9e4c'); rect(R(-60, -46, ZMIN, ZMAX), '#c9b9a2'); rect(R(14, 21, ZMIN, ZMAX), '#c9b9a2'); rect(NIGHTM, '#9a8e7c'); rect(CONM, '#a2988a'); rect(HANM, '#a2988a');
    for (let z = ZMIN; z < ZMAX; z += 9) { rect(R(-58.5, -56, z, z + 5), '#6a9a48'); rect(R(-49.5, -47.5, z + 2, z + 7), '#6a9a48') }   // grass strips on the Bạch Đằng promenade
    { const a = P(RIV0, ZMIN); c.fillStyle = '#34443a'; c.fillRect(a[0], a[1], (RIV1 - RIV0) * m, GD * m) }
    /* beach: per row, so the shoreline curves (promenade tiles → dry sand → wet sand → sand under water getting darker) */
    for (let py = 0; py < h; py++) { const z = ZMIN + py / m, sh = shoreX(z), g = c.createLinearGradient(P(212, 0)[0], 0, w, 0), X = x => Math.min(1, Math.max(0, (x - 212) / (XMAX - 212)));
      g.addColorStop(0, '#d9c6aa'); g.addColorStop(X(PROM - .1), '#d9c6aa'); g.addColorStop(X(PROM + .1), '#e8d6ad'); g.addColorStop(X(sh - 16), '#ecdbb4'); g.addColorStop(X(sh - 9), '#d8c39a'); g.addColorStop(X(sh - .5), '#bba57c'); g.addColorStop(X(sh + 6), '#c9b68d'); g.addColorStop(X(sh + 40), '#a89a76'); g.addColorStop(1, '#7c7660');
      c.fillStyle = g; c.fillRect(P(212, 0)[0], py, w - P(212, 0)[0], 1) }
    for (let i = 0; i < 26000; i++) { const x = PROM + r() * (XMAX - PROM), z = ZMIN + r() * GD, q = P(x, z); c.fillStyle = r() < .5 ? 'rgba(120,95,60,.18)' : 'rgba(255,250,235,.25)'; c.fillRect(q[0], q[1], 1.2, 1.2) }
    c.strokeStyle = 'rgba(150,130,110,.35)'; c.lineWidth = 1; for (let z = ZMIN; z < ZMAX; z += 1.2) { const a = P(212, z), b = P(PROM, z); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke() }   // promenade tiles
    /* streets: sidewalk (patterned tiles), kerb, asphalt, markings */
    c.lineCap = 'butt'; const seg = (rd, w2, col) => { const p0 = P(rd[0], rd[1]), p1 = P(rd[2], rd[3]); c.strokeStyle = col; c.lineWidth = w2 * m; c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); c.stroke() };
    for (const rd of ROADS) seg(rd, rd[4] + 4.6, '#c7b9a6'); for (const rd of ROADS) seg(rd, rd[4] + .5, '#8e8a82'); for (const rd of ROADS) seg(rd, rd[4], '#45464b');
    for (let i = 0; i < 20000; i++) { const x = XMIN + r() * (PROM - XMIN), z = ZMIN + r() * GD, d = roadDist(x, z), q = P(x, z); if (d < 0) { c.fillStyle = r() < .5 ? 'rgba(0,0,0,.16)' : 'rgba(255,255,255,.06)'; c.fillRect(q[0], q[1], 1.4, 1.4) } else if (d < 2.3 && (Math.floor(x * 2) + Math.floor(z * 2)) % 3 === 0) { c.fillStyle = 'rgba(150,70,50,.22)'; c.fillRect(q[0], q[1], 1.5, 1.5) } }
    c.setLineDash([3 * m, 4 * m]); for (const rd of ROADS) if (rd[4] >= 8 && rd[4] < 12) seg(rd, .15, '#f0f0e8'); c.setLineDash([]);
    for (const rd of ROADS) if (rd[4] >= 12) { const dx = rd[2] - rd[0], dz = rd[3] - rd[1], L = Math.hypot(dx, dz), nx = -dz / L, nz = dx / L; for (const o of [-.15, .15]) seg([rd[0] + nx * o, rd[1] + nz * o, rd[2] + nx * o, rd[3] + nz * o, 0], .1, '#e8c23a') }   // double yellow centre line
    /* zebra crossings */
    c.fillStyle = 'rgba(240,240,232,.85)'; for (const v of VR) for (const hz of HR) { if (hz[0] < v[1] || hz[0] > v[2] || v[0] < hz[1] || v[0] > hz[2]) continue; for (const sd of [-1, 1]) for (let k = -v[3] / 2 + .5; k < v[3] / 2 - .3; k += 1.1) { const q = P(v[0] + k, hz[0] + sd * (hz[3] / 2 + .4) - (sd < 0 ? 2 : 0)); c.fillRect(q[0], q[1], .6 * m, 2 * m) } }
  });
}
function wallTex() {
  return TX.wall || (TX.wall = canvasTex(512, 512, (c, w, h) => {
    const r = AV.rng(818); c.fillStyle = '#f0ede6'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) { c.fillStyle = r() < .5 ? 'rgba(90,80,70,' + (.03 + r() * .05).toFixed(3) + ')' : 'rgba(255,255,255,.08)'; c.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 3) }
    for (let i = 0; i < 26; i++) { const x = r() * w, y = r() * h, rr = 20 + r() * 70, g = c.createRadialGradient(x, y, 0, x, y, rr); g.addColorStop(0, 'rgba(' + (r() < .5 ? '120,110,95' : '255,255,250') + ',' + (.05 + r() * .08).toFixed(3) + ')'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x - rr, y - rr, rr * 2, rr * 2) }
    for (let i = 0; i < 160; i++) { const x = r() * w, y = r() * 30, l = 40 + r() * (r() < .3 ? 420 : 160), g = c.createLinearGradient(0, y, 0, y + l); g.addColorStop(0, 'rgba(60,62,52,' + (.08 + r() * .16).toFixed(3) + ')'); g.addColorStop(1, 'rgba(60,62,52,0)'); c.fillStyle = g; c.fillRect(x, y, 1 + r() * 4, l) }   // monsoon rain streaks
    { const g = c.createLinearGradient(0, h - 90, 0, h); g.addColorStop(0, 'rgba(70,75,60,0)'); g.addColorStop(1, 'rgba(58,66,48,.45)'); c.fillStyle = g; c.fillRect(0, h - 90, w, 90) }
  }, true));
}
function awnTex() {
  return TX.awn || (TX.awn = canvasTex(256, 256, (c, w, h) => { const r = AV.rng(919); for (let x = 0; x < w; x++) { const v = 205 + Math.sin(x / w * 24 * TAU) * 30 | 0; c.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')'; c.fillRect(x, 0, 1, h) }
    for (let i = 0; i < 40; i++) { const x = r() * w, y = r() * h, l = 10 + r() * 60, g = c.createLinearGradient(0, y, 0, y + l); g.addColorStop(0, 'rgba(140,80,40,' + (.1 + r() * .2).toFixed(3) + ')'); g.addColorStop(1, 'rgba(140,80,40,0)'); c.fillStyle = g; c.fillRect(x, y, 2 + r() * 5, l) } }, true));
}
/* glass-and-concrete tower facade (4 bays × 8 floors per repeat); lit = emissive mask of lit windows at night */
function towerTex(lit) {
  return TX['tw' + lit] || (TX['tw' + lit] = canvasTex(256, 512, (c) => { const r = AV.rng(lit ? 61 : 60); r(); if (lit) { c.fillStyle = '#000'; c.fillRect(0, 0, 256, 512) }
    const r2 = AV.rng(77);
    for (let f = 0; f < 8; f++) for (let k = 0; k < 4; k++) { const x = k * 64, y = f * 64, on = r2() < .4, warm = r2();
      if (!lit) { c.fillStyle = '#dcd8d0'; c.fillRect(x, y, 64, 64); const g = c.createLinearGradient(x, y, x + 64, y + 64); g.addColorStop(0, '#7894aa'); g.addColorStop(.5, '#34495c'); g.addColorStop(1, '#56728a'); c.fillStyle = g; c.fillRect(x + 3, y + 13, 58, 49);
        c.fillStyle = 'rgba(255,255,255,.13)'; c.fillRect(x + 9, y + 13, 9, 49); c.fillStyle = '#c4c0b8'; c.fillRect(x + 31, y + 13, 2, 49); if (on) { c.fillStyle = 'rgba(232,214,176,.6)'; c.fillRect(x + 3 + (warm < .5 ? 0 : 29), y + 13, 29, 49) } c.fillStyle = 'rgba(40,40,40,.25)'; c.fillRect(x, y + 10, 64, 3) }
      else if (on) { c.fillStyle = ['#ffd890', '#fff0c8', '#ffc070', '#e8f0ff'][warm * 4 | 0]; c.fillRect(x + 3, y + 13, 58, 49) } }
  }, true));
}
/* facade atlas (1024²): 16 Vietnamese shop signs, 8 shopfronts, 16 windows, 2 railings, AC unit, national flag, balcony door, 8 blade signs */
const FAS = 1024;
function vnAtlas() {
  if (TX.fa) return TX.fa; const RR = {};
  const tex = canvasTex(FAS, FAS, (c) => {
    const r = AV.rng(5151), F = 'Arial,"Helvetica Neue",Helvetica,sans-serif';
    const grime = (x, y, w, h, a) => { const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, 'rgba(40,35,30,0)'); g.addColorStop(1, 'rgba(40,35,30,' + a + ')'); c.fillStyle = g; c.fillRect(x, y, w, h) };
    const clip = (x, y, w, h, f) => { c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); f(); c.restore() };
    c.clearRect(0, 0, FAS, FAS);
    /* ---- shop signs (256x64): big Vietnamese name, small line (what / phone number) ---- */
    [['#c8102e', '#ffd84a', 'CÀ PHÊ', 'CÀ PHÊ SỮA ĐÁ · ĐT 0905 214 368'], ['#1d5fa8', '#ffffff', 'PHỞ BÒ', 'PHỞ · BÚN BÒ HUẾ · 45K'], ['#f2c230', '#8a1a1a', 'BÁNH MÌ', 'BÁNH MÌ THỊT · ỐP LA'], ['#1f7a3a', '#ffffff', 'NHÀ THUỐC', 'PHARMACY · ĐT 0236 382 115'],
      ['#0f3a5a', '#ffffff', 'KHÁCH SẠN', 'HOTEL · ROOMS · WIFI'], ['#e8402a', '#ffffff', 'HẢI SẢN', 'HẢI SẢN TƯƠI SỐNG · SEAFOOD'], ['#f6f4ee', '#c8102e', 'TẠP HÓA', 'GROCERY · ĐT 0935 771 902'], ['#8a1a1a', '#ffd84a', 'VÀNG BẠC', 'GOLD · SILVER · ĐÁ QUÝ'],
      ['#2a2a2a', '#ffd84a', 'SỬA XE', 'SỬA XE MÁY · VÁ XE · RỬA XE'], ['#5a2a6a', '#ffffff', 'SPA · MASSAGE', 'THƯ GIÃN · GỘI ĐẦU'], ['#e86a1a', '#ffffff', 'MÌ QUẢNG', 'MÌ QUẢNG GÀ · CÁ · TÔM THỊT'], ['#1a6a6a', '#ffffff', 'ĐIỆN THOẠI', 'MOBILE · SIM · SỬA CHỮA'],
      ['#f2eee4', '#2a2a2a', 'THỜI TRANG', 'FASHION · ÁO DÀI MAY ĐO'], ['#c83a5a', '#ffffff', 'BIA HƠI', 'BIA TƯƠI · NHẬU · LẨU'], ['#3a2416', '#f0d8a0', 'TRÀ SỮA', 'MILK TEA · TRÀ CHANH'], ['#1a4a8a', '#ffd84a', 'NHÀ NGHỈ', 'GUEST HOUSE · ĐT 0236 3']
    ].forEach(([bg, fg, a, b], i) => { const x = (i % 4) * 256, y = (i / 4 | 0) * 64; RR['s' + i] = [x, y, 256, 64];
      c.fillStyle = bg; c.fillRect(x, y, 256, 64); c.strokeStyle = fg; c.globalAlpha = .55; c.lineWidth = 2; c.strokeRect(x + 5, y + 5, 246, 54); c.globalAlpha = 1;
      c.fillStyle = fg; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = 'bold 31px ' + F; c.fillText(a, x + 128, y + 25, 232); c.font = 'bold 11px ' + F; c.fillText(b, x + 128, y + 50, 236); grime(x, y + 30, 256, 34, .2) });
    /* ---- shopfronts (256x128) ---- */
    const shutter = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); for (let k = y; k < y + h; k += 4) { c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(x, k + 3, w, 1); c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(x, k, w, 1) } c.fillStyle = 'rgba(30,30,30,.6)'; c.fillRect(x, y + h - 5, w, 5); grime(x, y + h * .5, w, h * .5, .32) };
    const inside = (x, y, w, h, wall, warm) => { const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, warm ? '#d2a06a' : '#dfe4e2'); g.addColorStop(.3, wall); g.addColorStop(1, '#1c1814'); c.fillStyle = g; c.fillRect(x, y, w, h); c.fillStyle = warm ? '#fff0c8' : '#f4fbff'; for (let k = x + 16; k < x + w - 30; k += 58) c.fillRect(k, y + 5, 34, 3) };
    const goods = (x, y, w, h) => { for (let sy = y; sy < y + h - 4; sy += 13) { c.fillStyle = '#5a5248'; c.fillRect(x, sy + 11, w, 2); for (let k = x + 1; k < x + w - 4; k += 2.5 + r() * 3) { c.fillStyle = 'hsl(' + (r() * 360 | 0) + ',' + (25 + r() * 45 | 0) + '%,' + (32 + r() * 28 | 0) + '%)'; const gh = 4 + r() * 6; c.fillRect(k, sy + 11 - gh, 2 + r() * 2, gh) } } };
    const stools = (x, y, n, gap) => { for (let k = 0; k < n; k++) { const sx = x + k * gap, col = ['#d83a3a', '#2a6ad8', '#e8c83a', '#d83a3a'][k % 4]; c.fillStyle = col; c.fillRect(sx, y, 15, 4); c.fillRect(sx + 1, y + 4, 3, 15); c.fillRect(sx + 11, y + 4, 3, 15) } };
    const alu = (x, y, w, h) => { c.strokeStyle = '#a6a8aa'; c.lineWidth = 5; c.strokeRect(x + 2.5, y + 2.5, w - 5, h - 5) };
    const SF = [
      (x, y, w, h) => shutter(x, y, w, h, '#9aa6ae'),
      (x, y, w, h) => { inside(x, y, w, h, '#4a4038'); c.strokeStyle = '#61666a'; c.lineWidth = 3; for (let k = 0; k < w; k += 14) { c.beginPath(); c.moveTo(x + k, y); c.lineTo(x + k + 7, y + h / 2); c.lineTo(x + k, y + h); c.stroke() } c.fillStyle = '#3a3e42'; c.fillRect(x, y, w, 7); c.fillRect(x, y + h - 7, w, 7) },
      (x, y, w, h) => { inside(x, y, w, h, '#8a6a48', true); c.fillStyle = '#2a1e16'; c.fillRect(x + 160, y + 20, 70, 40); c.fillStyle = 'rgba(255,255,255,.8)'; c.font = 'bold 9px ' + F; c.textAlign = 'left'; ['CÀ PHÊ ĐEN 15K', 'CÀ PHÊ SỮA 20K', 'BẠC XỈU 25K', 'NƯỚC DỪA 20K'].forEach((s, i) => c.fillText(s, x + 164, y + 30 + i * 9));
        c.fillStyle = '#d8d4c8'; for (const k of [30, 110]) c.fillRect(x + k, y + h - 32, 46, 5); c.fillStyle = '#9a9890'; for (const k of [34, 72, 114, 152]) c.fillRect(x + k, y + h - 27, 3, 27); stools(x + 8, y + h - 21, 9, 27) },
      (x, y, w, h) => { inside(x, y, w, h, '#c8b498', true); c.fillStyle = '#b8bcc0'; c.fillRect(x + 8, y + h - 52, 92, 52); c.fillStyle = '#8a8e92'; c.fillRect(x + 14, y + h - 80, 38, 30); c.fillRect(x + 58, y + h - 72, 30, 22); c.fillStyle = 'rgba(255,255,255,.4)'; for (let k = 0; k < 5; k++) { c.beginPath(); c.ellipse(x + 30 + k * 6, y + h - 92 - k * 7, 10, 6, 0, 0, TAU); c.fill() }
        c.fillStyle = '#e8303a'; c.fillRect(x + 60, y + 14, 120, 18); c.fillStyle = '#ffd84a'; c.font = 'bold 13px ' + F; c.textAlign = 'center'; c.fillText('PHỞ BÒ 45K', x + 120, y + 27); c.fillStyle = '#e8e4d8'; c.fillRect(x + 130, y + h - 36, 100, 5); stools(x + 118, y + h - 22, 5, 26) },
      (x, y, w, h) => { inside(x, y, w, h, '#b8b4a8'); goods(x + 6, y + 14, w - 12, h - 46); for (let k = 0; k < 7; k++) { c.fillStyle = ['#c8302a', '#2a6a3a', '#e8c040', '#2a4a8a'][k % 4]; c.fillRect(x + 8 + k * 34, y + h - 30, 28, 26); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x + 8 + k * 34, y + h - 18, 28, 2) } },
      (x, y, w, h) => { inside(x, y, w, h, '#4a4440'); c.strokeStyle = '#151515'; c.lineWidth = 6; for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(x + 26 + k * 38, y + 34, 14, 0, TAU); c.stroke() } c.fillStyle = '#2a2a2c'; c.beginPath(); c.ellipse(x + 128, y + h - 22, 50, 14, 0, 0, TAU); c.fill(); c.fillStyle = '#b02020'; c.fillRect(x + 104, y + h - 50, 40, 20); c.fillStyle = 'rgba(20,20,20,.5)'; c.beginPath(); c.ellipse(x + 60, y + h - 4, 40, 6, 0, 0, TAU); c.fill() },
      (x, y, w, h) => { inside(x, y, w, h, '#eaf0f2'); for (let k = 0; k < 18; k++) { c.fillStyle = 'hsl(' + (r() * 360 | 0) + ',55%,55%)'; c.fillRect(x + 12 + k * 13, y + 34, 10, 52) } c.fillStyle = '#8a8c8e'; c.fillRect(x + 8, y + 32, w - 16, 3); clip(x, y, w, h, () => { const g = c.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, 'rgba(200,220,235,.45)'); g.addColorStop(.5, 'rgba(120,150,170,.15)'); g.addColorStop(1, 'rgba(210,225,240,.4)'); c.fillStyle = g; c.fillRect(x, y, w, h) }); alu(x, y, w, h); c.fillStyle = '#a6a8aa'; c.fillRect(x + 126, y, 5, h) },
      (x, y, w, h) => { inside(x, y, w, h, '#f0f4f0'); for (let s = 0; s < 4; s++) { c.fillStyle = '#c8ccc8'; c.fillRect(x + 10, y + 30 + s * 22, w - 20, 3); for (let k = 0; k < 24; k++) { c.fillStyle = ['#ffffff', '#e83a3a', '#3a8ad8', '#3ac85a'][(k + s) % 4]; c.fillRect(x + 14 + k * 9.5, y + 20 + s * 22, 6, 10) } } c.fillStyle = '#1f9a4a'; c.fillRect(x + 112, y + 6, 32, 10); c.fillRect(x + 123, y - 5 + 6, 10, 32); alu(x, y, w, h) }];
    SF.forEach((f, i) => { const x = (i % 4) * 256, y = 256 + (i / 4 | 0) * 128; RR['f' + i] = [x, y, 256, 128]; clip(x, y, 256, 128, () => f(x, y, 256, 128)) });
    /* ---- windows (128x128): 8 kinds × 2 frame colours ---- */
    const glass = (x, y, w, h) => clip(x, y, w, h, () => { const g = c.createLinearGradient(x, y, x + w * .6, y + h); g.addColorStop(0, '#8aa0ae'); g.addColorStop(.45, '#3c4e5c'); g.addColorStop(.6, '#5c6e7e'); g.addColorStop(1, '#26323c'); c.fillStyle = g; c.fillRect(x, y, w, h); c.fillStyle = 'rgba(255,255,255,.14)'; c.beginPath(); c.moveTo(x + w * .25, y); c.lineTo(x + w * .5, y); c.lineTo(x + w * .15, y + h); c.lineTo(x - w * .1, y + h); c.fill() });
    const curtains = (x, y, w, h, col) => { c.fillStyle = col || '#e0c690'; c.fillRect(x, y, w, h); for (let k = x; k < x + w; k += 7) { c.fillStyle = 'rgba(120,80,40,.2)'; c.fillRect(k, y, 3, h) } c.fillStyle = '#4a3424'; c.fillRect(x + w * .45, y, w * .1, h) };
    const louvre = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); c.fillStyle = 'rgba(0,0,0,.28)'; for (let k = y + 5; k < y + h - 3; k += 5) c.fillRect(x + 5, k, w - 10, 2); c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(x + w / 2 - 1.5, y, 3, h); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 3; c.strokeRect(x + 2, y + 2, w - 4, h - 4) };
    const grille = (x, y, w, h) => { c.strokeStyle = '#2a2a2a'; c.lineWidth = 2.5; for (let gy = y; gy < y + h; gy += 22) for (let gx = x; gx < x + w; gx += 22) { c.beginPath(); c.arc(gx + 11, gy + 11, 8, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(gx + 11, gy); c.lineTo(gx + 11, gy + 22); c.stroke() } };
    for (let i = 0; i < 16; i++) {
      const x = (i % 8) * 128, y = 512 + (i / 8 | 0) * 128, t = i % 8, fc = i < 8 ? '#e4e2dc' : '#5a4a3a', ix = x + 8, iy = y + 8, iw = 112, ih = 112; RR['w' + i] = [x, y, 128, 128];
      c.fillStyle = fc; c.fillRect(x, y, 128, 128);
      if (t === 1) louvre(ix, iy, iw, ih, '#3a8a5a'); else if (t === 4) louvre(ix, iy, iw, ih, '#3a6aa8');
      else { if (t === 2 || t === 3 || t === 6) curtains(ix, iy, iw, ih, t === 6 ? '#f0e0b8' : '#d8c08c'); else if (t === 7) { c.fillStyle = '#e8e2d4'; c.fillRect(ix, iy, iw, ih); c.fillStyle = 'rgba(100,90,70,.35)'; for (let k = iy; k < iy + ih; k += 6) c.fillRect(ix, k, iw, 1) } else glass(ix, iy, iw, ih);
        c.fillStyle = fc; c.fillRect(x + 61, y, 6, 128); if (t === 3) grille(ix, iy, iw, ih); if (t === 5) { c.fillStyle = '#2a2a2a'; for (let k = ix + 8; k < ix + iw; k += 12) c.fillRect(k, iy, 3, ih) } }
      { const g = c.createLinearGradient(0, y + 8, 0, y + 24); g.addColorStop(0, 'rgba(0,0,0,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(ix, iy, iw, 16) }
    }
    /* ---- railings (alpha-tested gaps): wrought iron with curls, stainless ---- */
    RR.rail0 = [0, 768, 256, 64]; c.fillStyle = '#2a2a2c'; c.fillRect(0, 768, 256, 6); c.fillRect(0, 826, 256, 6); c.strokeStyle = '#2a2a2c'; c.lineWidth = 3; for (let k = 0; k < 256; k += 16) { c.fillRect(k, 774, 3, 52); c.beginPath(); c.arc(k + 8, 790, 6, Math.PI, TAU); c.stroke(); c.beginPath(); c.arc(k + 8, 812, 6, 0, Math.PI); c.stroke() }
    RR.rail1 = [256, 768, 256, 64]; c.fillStyle = '#c8ccd0'; c.fillRect(256, 768, 256, 6); c.fillRect(256, 798, 256, 3); c.fillRect(256, 828, 256, 4); for (let k = 260; k < 512; k += 12) c.fillRect(k, 774, 3, 54);
    /* ---- AC condenser, national flag, balcony door ---- */
    RR.ac = [0, 832, 128, 96]; c.fillStyle = '#ebe9e3'; c.fillRect(0, 832, 128, 96); c.strokeStyle = '#b8b6b0'; c.lineWidth = 3; c.strokeRect(2, 834, 124, 92); c.fillStyle = '#3a3a3a'; c.beginPath(); c.arc(80, 880, 34, 0, TAU); c.fill(); c.strokeStyle = '#8a8a8a'; c.lineWidth = 2; for (const rr of [10, 20, 30]) { c.beginPath(); c.arc(80, 880, rr, 0, TAU); c.stroke() } c.fillStyle = '#a8a6a0'; for (let k = 846; k < 916; k += 6) c.fillRect(10, k, 28, 2); grime(0, 880, 128, 48, .3);
    RR.flag = [0, 928, 128, 96]; c.fillStyle = '#da251d'; c.fillRect(0, 928, 128, 96); { const cx = 64, cy = 976, R0 = 30, R1 = 12; c.fillStyle = '#ffde00'; c.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? R1 : R0; c.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr) } c.fill() }
    RR.bdoor = [384, 832, 128, 192]; c.fillStyle = '#e4e2dc'; c.fillRect(384, 832, 128, 192); glass(392, 840, 112, 176); curtains(392, 840, 30, 176); curtains(474, 840, 30, 176); c.fillStyle = '#e4e2dc'; c.fillRect(445, 832, 6, 192); c.fillRect(384, 900, 128, 4);
    RR.gate = [128, 832, 256, 192]; inside(128, 832, 256, 192, '#6a5a48', true); goods(140, 880, 232, 100); c.fillStyle = 'rgba(40,40,40,.0)';
    /* ---- vertical blade signs (64x256, text runs bottom → top) ---- */
    [['#c8102e', '#ffd84a', 'KHÁCH SẠN'], ['#1a5a3a', '#ffffff', 'MASSAGE'], ['#1a1a1a', '#ffd84a', 'KARAOKE'], ['#f2c230', '#8a1a1a', 'NHÀ HÀNG'], ['#0f3a5a', '#ffffff', 'HOMESTAY'], ['#3a2416', '#f0d8a0', 'CÀ PHÊ'], ['#7a3a8a', '#ffffff', 'NAIL · TÓC'], ['#f4f0e6', '#c8102e', 'NHÀ NGHỈ']
    ].forEach(([bg, fg, txt], i) => { const x = 512 + i * 64, y = 768; RR['v' + i] = [x, y, 64, 256]; c.fillStyle = bg; c.fillRect(x, y, 64, 256); c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 3; c.strokeRect(x + 4, y + 4, 56, 248);
      c.save(); c.translate(x + 32, y + 128); c.rotate(-Math.PI / 2); c.fillStyle = fg; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = 'bold 28px ' + F; c.fillText(txt, 0, 0, 236); c.restore(); grime(x, y + 160, 64, 96, .2) });
  });
  return TX.fa = { tex, R: RR };
}
/* plain painted sign (real signage look, not the hand-drawn psychedelic one): returns a texture */
function plainTex(lines, bg, fg, W, H, frame) {
  return canvasTex(W, H, (c, w, h) => { c.fillStyle = bg; c.fillRect(0, 0, w, h); if (frame) { c.strokeStyle = frame; c.lineWidth = Math.max(4, h * .05); c.strokeRect(c.lineWidth, c.lineWidth, w - c.lineWidth * 2, h - c.lineWidth * 2) }
    c.fillStyle = fg; c.textAlign = 'center'; c.textBaseline = 'middle'; const n = lines.length;
    lines.forEach((s, i) => { const big = i === 0, fs = big ? h * (n > 1 ? .42 : .62) : h * .2; c.font = 'bold ' + (fs | 0) + 'px Arial,Helvetica,sans-serif'; c.fillText(s, w / 2, n > 1 ? (big ? h * .4 : h * .8) : h / 2, w * .92) }) });
}
const PRISM = (() => { const g = new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(-.5, 0), new THREE.Vector2(.5, 0), new THREE.Vector2(0, 1)]), { depth: 1, bevelEnabled: false }); g.translate(0, 0, -.5); g.rotateY(Math.PI / 2); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 6, uv.getY(i) * 6); return g })();
const shadeHex = (h, k) => new THREE.Color(h).multiplyScalar(k).getHex();

/* ======================= the sea (custom shader: depth colour, waves, sun glint, breaking surf + shore swash) ======================= */
function seaMat(amp) {
  const lin = h => new THREE.Color(h).convertSRGBToLinear();
  const m = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uSun: { value: new THREE.Vector3(0, 1, 0) }, uDay: { value: 1 }, uSky: { value: new THREE.Color(.55, .7, .85) }, uAmp: { value: amp },
      cShal: { value: lin(0x52d6c4) }, cMid: { value: lin(0x1c9ab4) }, cDeep: { value: lin(0x0b4a7a) } }]),
    vertexShader: 'uniform float uT,uAmp;varying vec3 vW;varying float vP;\n#include <fog_pars_vertex>\nvoid main(){vec4 w=modelMatrix*vec4(position,1.);float sh=292.+sin(w.z*.011)*5.+sin(w.z*.031+1.)*1.5;float p=w.x-sh;vP=p;' +
      'float a=uAmp*smoothstep(-3.,8.,p)*(1.-smoothstep(90.,140.,p));float ph=(w.x+sin(w.z*.045)*4.)*.42+uT*1.7;' +
      'w.y+=a*(.15*sin(ph)+.06*sin(ph*2.3+w.z*.11+uT*.6)+.04*sin(w.z*.23-uT*1.3+w.x*.05));vW=w.xyz;vec4 mvPosition=viewMatrix*w;gl_Position=projectionMatrix*mvPosition;\n#include <fog_vertex>\n}',
    fragmentShader: 'uniform float uT,uDay;uniform vec3 uSun,uSky,cShal,cMid,cDeep;varying vec3 vW;varying float vP;\n#include <fog_pars_fragment>\n' +
      'float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}' +
      'void main(){float p=vP,d=max(0.,p*.05+max(0.,p-30.)*.06),t=uT;vec2 q=vW.xz;' +
      'vec3 col=mix(cShal,cMid,smoothstep(.05,1.6,d));col=mix(col,cDeep,smoothstep(1.6,7.,d));' +
      'vec3 N=normalize(vec3(.09*cos(q.x*.42+t*1.7+sin(q.y*.045)*1.7)+.05*cos(q.x*1.3-q.y*.9+t*2.4)+.03*cos(q.x*3.1+q.y*2.2+t*3.1),1.,.05*cos(q.y*.8-t*1.2+q.x*.2)+.04*cos(q.y*2.1+q.x*1.1+t*2.7)+.02*cos(q.y*3.7-q.x*2.9-t*3.3)));' +
      'vec3 V=normalize(cameraPosition-vW);float fr=.02+.98*pow(1.-max(dot(N,V),0.),5.);float day=.16+.84*uDay;col*=day;col=mix(col,uSky,clamp(fr,0.,1.)*.8);' +
      'vec3 Rf=reflect(-uSun,N);float sp=pow(max(dot(Rf,V),0.),240.)*3.2+pow(max(dot(Rf,V),0.),28.)*.1;col+=vec3(1.,.93,.8)*sp*uDay*step(0.,uSun.y);' +
      'float n=vn(q*1.7+vec2(t*.3,0.))*.6+vn(q*4.3-vec2(0.,t*.5))*.4;float wv=sin((vW.x+sin(vW.z*.045)*4.)*.42+t*1.7);' +
      'float brk=smoothstep(.55,.95,wv)*smoothstep(-1.,4.,p)*(1.-smoothstep(10.,26.,p));float sw=1.-smoothstep(0.,3.2,p+sin(t*.85+vW.z*.06)*1.6-1.);' +
      'float foam=clamp(brk*.85+sw,0.,1.)*smoothstep(.35,.75,n+sw*.25);col=mix(col,vec3(.93,.95,.96)*day,foam*.9);' +
      'float al=mix(.45,.94,smoothstep(0.,2.2,d));al=max(al,foam*.95)*smoothstep(-1.,1.,p);gl_FragColor=vec4(col,al);\n#include <encodings_fragment>\n#include <fog_fragment>\n}',
    transparent: true, fog: true, depthWrite: false
  });
  m.uniforms.uT = K.U.time; m.userData.lin = 1; return m;
}

AV.registerWorld({
  id: 'da_nang',
  build(ctx) {
    const S = AV.S, q = ctx.q, rng = ctx.rng, grp = ctx.group, MT = A.mats(), walk = A.walk(), lo = q === 0, hi = q === 2;
    S.dn = S.dn || { done: {}, weather: 'clear', locks: 0 }; S.dn.done = S.dn.done || {};
    const SKY = { tint: [0xfff2dc, 0xdceeff, .05, .1], dome: { s1: 0xdde6ee, s2: 0xa8c8e8, swirl: .02, cloud: .55, glow: .55 } };
    const B = { city: K.batch(), east: K.batch(), land: K.batch(), beach: K.batch(), decor: K.batch(), night: K.batch(), sky: K.batch() };
    const occ = [], lit = [];
    const box = (b, mat, col, x0, x1, y0, y1, z0, z1, glow) => b.add(mat, BG.box, col, M((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, x1 - x0, y1 - y0, z1 - z0), glow);
    const solid = (x0, x1, z0, z1) => { ctx.cols.push([x0, x1, z0, z1]); occ.push({ x0, x1, z0, z1 }) };
    const T = (x, z, r, label, fn, show) => { const t = { x, z, r, label, fn, show }; ctx.T.push(t); return t };
    /* real-looking signs: lit at night */
    const label = (lines, x, y, z, ry, w, h, bg, fg, frame, back) => { const tx = plainTex(lines, bg, fg, 512, Math.round(512 * h / w), frame), m = new THREE.MeshStandardMaterial({ map: tx, emissiveMap: tx, emissive: 0xffffff, emissiveIntensity: .05, roughness: .6 }); m.userData.lin = 1;
      const s = new THREE.Mesh(AV.G.pln, m); s.position.set(x, y, z); s.rotation.y = ry; s.scale.set(w, h, 1); grp.add(s); lit.push(m); if (back !== false) B.decor.add(MT.v, BG.box, 0x3a3a3c, M(x - Math.sin(ry) * .06, y, z - Math.cos(ry) * .06, w + .1, h + .1, .1, 0, ry, 0)); return s };
    ctx.upd.push(() => { const nk = AV.nightK || 0; for (const m of lit) m.emissiveIntensity = .05 + nk * .85 });

    /* ---------- terrain: painted ground, carved river, beach profile ---------- */
    const sx = [150, 230, 315][q], sz = Math.round(sx * GD / GW), tg = new THREE.PlaneGeometry(GW, GD, sx, sz); tg.rotateX(-Math.PI / 2); tg.translate((XMIN + XMAX) / 2, 0, 0);
    const tp = tg.attributes.position; for (let i = 0; i < tp.count; i++) { const x = tp.getX(i), z = tp.getZ(i); tp.setY(i, x > RIV0 + .6 && x < RIV1 - .6 ? -5.5 : x >= PROM ? bedY(x, z) : 0) }
    tg.computeVertexNormals();
    const gmat = new THREE.MeshStandardMaterial({ map: groundTex([1024, 2048, 2048][q]), roughness: .95 }), grain = A.tex('grain');
    gmat.onBeforeCompile = sh => { sh.uniforms.detailMap = { value: grain }; sh.fragmentShader = 'uniform sampler2D detailMap;\n' + sh.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n diffuseColor.rgb *= mix(1.0, texture2D(detailMap, vUv * 180.0).r * 1.45, .35);') };
    gmat.customProgramCacheKey = () => 'dnGround'; gmat.userData.lin = 1; const ground = new THREE.Mesh(tg, gmat); ground.receiveShadow = true; grp.add(ground);
    /* outer land / coast beyond the playable area (coarse, vertex coloured; grid lines coincide with the play-area edges) */
    { const OX0 = -1600, OX1 = 500, OZ0 = -900, OZ1 = 900, st = 15, g = new THREE.PlaneGeometry(OX1 - OX0, OZ1 - OZ0, (OX1 - OX0) / st, (OZ1 - OZ0) / st); g.rotateX(-Math.PI / 2); g.translate((OX0 + OX1) / 2, 0, 0);
      const p = g.attributes.position, col = new Float32Array(p.count * 3), cc = new THREE.Color();
      for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), inside = x > XMIN + .1 && x < XMAX - .1 && z > ZMIN + .1 && z < ZMAX - .1; let y = 0, hx = 0x8e8a80;
        if (x > RIV0 && x < RIV1) { y = -5.5; hx = 0x34443a } else if (x >= PROM) { y = bedY(x, z); const sp = x - shoreX(z); hx = sp < -9 ? 0xe8d6ad : sp < 0 ? 0xc9b48a : 0xa89a76 } else if (Math.abs(x - PROM + 6) < 6) hx = 0xc7b9a6;
        if (inside) y = Math.min(y, -9); p.setY(i, y); cc.setHex(hx).convertSRGBToLinear(); col.set([cc.r, cc.g, cc.b], i * 3) }
      g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals(); const om = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 })); om.receiveShadow = true; grp.add(om) }

    /* ---------- water: Hàn River + the East Sea ---------- */
    { const rw = K.waterPlane(ctx, new THREE.PlaneGeometry(RIV1 - RIV0, 1800), RWY, { deep: 0x1e3a3a, shallow: 0x4a6a58, sky: 0xa8c0cc, iri: .02, opacity: .93, scale: .6 }); rw.position.x = (RIV0 + RIV1) / 2 }
    const seaNear = seaMat(1), seaFar = seaMat(0);
    { const g = new THREE.PlaneGeometry(190, 1240, [50, 80, 95][q], [160, 260, 330][q]); g.rotateX(-Math.PI / 2); const m = new THREE.Mesh(g, seaNear); m.position.set(345, SWY, 0); m.renderOrder = 1; m.frustumCulled = false; grp.add(m);
      const g2 = new THREE.PlaneGeometry(2400, 3000); g2.rotateX(-Math.PI / 2); const m2 = new THREE.Mesh(g2, seaFar); m2.position.set(440 + 1200, SWY, 0); m2.renderOrder = 1; grp.add(m2);
      const g3 = new THREE.PlaneGeometry(400, 880); g3.rotateX(-Math.PI / 2); for (const s of [-1, 1]) { const m3 = new THREE.Mesh(g3, seaFar); m3.position.set(240, SWY - .02, s * 1060); grp.add(m3) } }
    ctx.upd.push(() => { const SK = AV.sky || {}, fl = SK.fogLinear || [.6, .7, .8], d = SK.dayK == null ? 1 : SK.dayK; for (const m of [seaNear, seaFar]) { if (SK.sunDir) m.uniforms.uSun.value.copy(SK.sunDir); m.uniforms.uDay.value = d; m.uniforms.uSky.value.setRGB(fl[0] * .8 + .05 * d, fl[1] * .85 + .1 * d, fl[2] * .9 + .18 * d) } });
    /* river embankments (stone walls + railings), with gaps at the bridges and the Love Pier */
    for (const x of [RIV0, RIV1]) box(B.land, MT.stone, 0xc8bca8, x - .5, x + .5, -5.6, .15, -900, 900);
    { const gaps = BRIDGES.map(b => [b.z - b.w / 2, b.z + b.w / 2]).concat([[-36.5, -25.5]]), segs = [];
      let z = ZMIN; for (const [a, b] of gaps.sort((p, o) => p[0] - o[0])) { segs.push([z, a]); z = b } segs.push([z, ZMAX]);
      for (const [x, sd] of [[RIV0 - .7, -1], [RIV1 + .7, 1]]) for (const [z0, z1] of segs) { if (z1 - z0 < 1) continue; box(B.land, MT.shiny, 0x5a6a70, x - .06, x + .06, .9, 1.02, z0, z1); for (let zz = z0 + .6; zz < z1; zz += 2.4) box(B.land, MT.shiny, 0x5a6a70, x - .05, x + .05, 0, .95, zz - .05, zz + .05); ctx.cols.push([x - .35, x + .35, z0, z1]) } }
    /* distant scenery: Sơn Trà peninsula + Lady Buddha (N), Hải Vân / Trường Sơn range (W), Marble Mountains (SE) — unlit pale haze */
    { const parts = [], r = AV.rng(41);
      for (let i = 0; i < 30; i++) { const x = -120 + i * 24 + r() * 10, z = -440 - r() * 120 + Math.min(0, x - 120) * .25, h = (x > 100 && x < 480 ? 120 : 75) + r() * 80; parts.push([BG.ico, [0x6f8f80, 0x7a9a8a, 0x668a78, 0x85a292][i % 4], M(x, h * .3 - 22, z, 60 + r() * 45, h, 55 + r() * 40, 0, r() * 3, 0), 0]) }
      parts.push([BG.ico, 0x6f9080, M(300, -14, -360, 120, 74, 95), 0]);
      for (let i = 0; i < 26; i++) { const z = -620 + i * 50, x = -760 - r() * 170, h = 140 + r() * 160; parts.push([BG.ico, [0x8aa2b4, 0x98b0c0, 0x7c96aa][i % 3], M(x, h * .3 - 22, z, 150 + r() * 90, h, 120 + r() * 60, 0, r() * 3, 0), 0]) }
      [[250, 520, 46], [290, 556, 62], [330, 512, 40], [365, 560, 52], [214, 566, 34]].forEach(([x, z, h]) => { parts.push([BG.sph, 0x93a596, M(x, h * .45, z, 16, h, 14, 0, r() * 3, .08), 0]); parts.push([BG.ico, 0x7d9a82, M(x + 3, h * .9, z, 8, 7, 8), 0]) });
      /* Lady Buddha of Linh Ứng pagoda (white, facing the bay) + pagoda roofs */
      const LB = [300, 44, -312]; parts.push([A.geo('cyl'), 0xe0dccf, M(LB[0], LB[1] + 2, LB[2], 7, 4, 7), 0]);
      parts.push([new THREE.LatheGeometry([[0, 0], [5.2, 0], [5.6, 4], [4.6, 14], [3.6, 22], [3.9, 26], [3.2, 28], [0, 29]].map(p => new THREE.Vector2(p[0], p[1])), 16), 0xf2f0ea, M(LB[0], LB[1] + 4, LB[2]), 0]);
      parts.push([BG.sph, 0xf4f2ec, M(LB[0], LB[1] + 35.5, LB[2], 2.6, 3.2, 2.6), 0], [BG.sph, 0xf4f2ec, M(LB[0], LB[1] + 39, LB[2], 1.3, 1.6, 1.3), 0], [A.geo('cyl'), 0xe8e4d8, M(LB[0], LB[1] + 31, LB[2], 1.6, 4, 1.6), 0]);
      for (const s of [-1, 1]) parts.push([A.geo('cyl'), 0xeeece4, M(LB[0] + s * 4.2, LB[1] + 21, LB[2] + 1.2, 1, 9, 1, .3, 0, s * .2), 0]);
      for (let k = 0; k < 3; k++) parts.push([A.geo('hip'), 0x9a4a3a, M(LB[0] - 26 - k * 3, LB[1] - 2 + k * 3.2, LB[2] - 6, 9 - k * 2, 2.4, 9 - k * 2), 0]);
      const mm = new THREE.Mesh(K.merge(parts), new THREE.MeshBasicMaterial({ vertexColors: true, fog: false })); mm.material.userData.lin = 1; grp.add(mm);
      ctx.upd.push(() => mm.material.color.setScalar(1 - (AV.nightK || 0) * .74)) }
    /* outskirts: low-detail city masses beyond the edges (fogged) */
    { const parts = [], r = AV.rng(55), add = (x, z) => { if (x > RIV0 - 8 && x < RIV1 + 8) return; if (x > PROM - 10) return; const tall = r() < .12, h = tall ? 30 + r() * 45 : 7 + r() * 18, w = 6 + r() * (tall ? 14 : 10), d = 6 + r() * 12;
        parts.push([BG.box, [0xe8e0cc, 0xd8d4c8, 0xf0d8a8, 0xc8d8d8, 0xe8c8c0, 0xb8c4cc][r() * 6 | 0], M(x, h / 2, z, w, h, d), 0]) };
      for (let i = 0; i < [160, 260, 340][q]; i++) { const sd = r() < .5 ? -1 : 1; add(-560 + r() * 780, sd * (192 + r() * 240)) } for (let i = 0; i < [70, 110, 140][q]; i++) add(-262 - r() * 330, -180 + r() * 360);
      for (let i = 0; i < 28; i++) { const sd = i % 2 ? -1 : 1, z = sd * (200 + (i >> 1) * 28 + r() * 8), h = 30 + r() * 40; parts.push([BG.box, [0xe8e4dc, 0xd0dce4, 0xf0e8d8][i % 3], M(181 + r() * 10, h / 2, z, 14, h, 12), 0]) }   // beach hotels continuing along the coast
      const om = new THREE.Mesh(K.merge(parts), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .9 })); grp.add(om) }

    /* ======================= tube houses (nhà ống): narrow, deep, tall, colourful, balconies + signs ======================= */
    const FA = vnAtlas(), NU = { value: 0 }, facM = (() => {
      const m = new THREE.MeshStandardMaterial({ vertexColors: true, map: FA.tex, roughness: .8, alphaTest: .5 });
      m.onBeforeCompile = sh => { sh.uniforms.uNight = NU; sh.vertexShader = 'attribute float aGlow;varying float vGlow;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vGlow = aGlow;');
        sh.fragmentShader = 'uniform float uNight;varying float vGlow;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance += diffuseColor.rgb * vGlow * uNight * 1.25;') };
      m.customProgramCacheKey = () => 'dnFacade'; m.userData.lin = 1; return m })();
    ctx.upd.push(() => { NU.value = AV.nightK || 0 });
    const wallM = K.floraMat(0, { map: wallTex(), rough: .93 }), awnM = K.floraMat(0, { map: awnTex(), rough: .6, double: true }), ROOF = MT.tile;
    MT.stucco = wallM; MT.roof = awnM;
    const CG = {}, cell = k => CG[k] || (CG[k] = (() => { const R0 = FA.R[k], g = new THREE.BoxGeometry(1, 1, 1), uv = g.attributes.uv, p = 1.5; for (let i = 0; i < uv.count; i++) uv.setXY(i, (R0[0] + p + uv.getX(i) * (R0[2] - 2 * p)) / FAS, 1 - (R0[1] + p + (1 - uv.getY(i)) * (R0[3] - 2 * p)) / FAS); return g })());
    const VNW = [0xf2d16b, 0xf4e3a1, 0xe9c46a, 0xbfe0c0, 0xa8d0e8, 0xf0c0c8, 0xf4f1ea, 0xf0b070, 0xd8c8e8, 0xe8e0cc, 0xc8e0d8, 0xf6efe0, 0xe8b0a0, 0xd0d8a0, 0xffffff, 0xf4f1ea];
    const AWN = [0x2a6ad8, 0xd83a3a, 0x3a9a5a, 0xe8c040, 0xe6e4dc, 0x9a8a7a], LITW = { 2: 1, 3: 1, 6: 1, 7: 1 };
    const SHOP = ['f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f0', 'f1', 'f2', 'f3', 'f4', 'f2'], OPEN = { f2: 1, f3: 1, f4: 1, f5: 1, f6: 1, f7: 1 };
    const FR = new THREE.Matrix4(), _p = new THREE.Vector3(), _sc = new THREE.Vector3(), _qq = new THREE.Quaternion(), _ee = new THREE.Euler();
    function tubeHouse(b, x0, x1, z0, z1, face, r, maxF) {   // face: side towards the street ('n'|'s'|'e'|'w'); local frame: u along the street, +v out of the facade
      const along = face === 'n' || face === 's', L = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0;
      FR.makeRotationY({ s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 }[face]).setPosition({ s: x0, n: x1, e: x1, w: x0 }[face], 0, { s: z1, n: z0, e: z1, w: z0 }[face]);
      const P = (mat, geo, col, u, y, v, su, sy, sv, glow, tilt, yaw) => { _qq.setFromEuler(_ee.set(tilt || 0, yaw || 0, 0)); b.add(mat, geo, col, new THREE.Matrix4().compose(_p.set(u, y, v), _qq, _sc.set(su, sy, sv)).premultiply(FR), glow) };
      const nF = Math.min(maxF || 6, 2 + (r() * 4.4 | 0) + (r() < .2 ? 2 : 0)), G0 = 4, FH = 3.3, top = G0 + (nF - 1) * FH, h = top + .9, col = VNW[r() * VNW.length | 0], sh = k => shadeHex(col, k);
      solid(x0, x1, z0, z1);
      P(wallM, BG.box, col, L / 2, h / 2, -D / 2, L, h, D);
      for (const u of [.1, L - .1]) P(wallM, BG.box, sh(.88), u, h / 2, .06, .2, h, .14);
      /* ground floor: shopfront, full-width signboard, canvas awning, red lanterns on some */
      const sf = SHOP[r() * SHOP.length | 0]; P(facM, cell(sf), 0xffffff, L / 2, 1.6, .03, L - .4, 3.2, .06, OPEN[sf] ? .75 : 0);
      P(wallM, BG.box, sh(.92), L / 2, 3.3, .07, L - .2, .22, .16);
      { const sw = L - .35, shh = Math.min(1.05, sw / 4.1); P(facM, cell('s' + (r() * 16 | 0)), 0xffffff, L / 2, 3.5 + shh / 2, .18, sw, shh, .1, .9) }
      if (r() < .55) { const ac = AWN[r() * AWN.length | 0], dep = 1.4 + r() * .6; P(awnM, BG.box, ac, L / 2, 3.05, dep / 2, L - .3, .04, dep, 0, .22); P(awnM, BG.box, ac, L / 2, 3.05 - Math.sin(.22) * dep / 2 - .1, dep * Math.cos(.22) - .02, L - .3, .2, .03) }
      if (!lo && r() < .22) for (const u of [.8, L - .8]) { P(MT.v, BG.sph, 0xd8281e, u, 2.6, .5, .22, .28, .22, .9); P(MT.v, A.geo('cyl6'), 0xe8c040, u, 2.3, .5, .1, .06, .1, .4) }
      if (!lo && nF > 2 && r() < .25) P(facM, cell('v' + (r() * 8 | 0)), 0xffffff, L - .4, G0 + 1.8, .55, .08, 2.6, .6, .9);
      /* upper floors: balconies (slab, railing, glass door, pots) or windows with sills + hoods; AC units; the national flag on some */
      const wt = r() * 8 | 0, fAlt = r() < .35 ? 8 : 0, flagF = r() < .14 ? 1 + (r() * (nF - 1) | 0) : -1;
      for (let k = 1; k < nF; k++) {
        const y0 = G0 + (k - 1) * FH;
        P(wallM, BG.box, sh(.9), L / 2, y0, .1, L, .22, .2);
        if (r() < .62 && L > 3.2) {
          const rl = r() < .55 ? 'rail0' : 'rail1', dep = .9 + r() * .3; P(wallM, BG.box, sh(.95), L / 2, y0 + .05, dep / 2, L - .1, .2, dep); P(facM, cell(rl), 0xffffff, L / 2, y0 + .62, dep - .03, L - .2, 1.05, .05);
          for (const u of [.12, L - .12]) P(facM, cell(rl), 0xffffff, u, y0 + .62, dep / 2, .05, 1.05, dep - .05);
          P(facM, cell('bdoor'), 0xffffff, L / 2, y0 + 1.35, .03, Math.min(2.6, L - 1), 2.5, .06, r() < .45 ? 1 : 0);
          if (!lo && r() < .55) for (let pk = 0; pk < 2; pk++) { const u = .5 + pk * (L - 1); P(MT.v, A.geo('cyl'), 0x9a5a3a, u, y0 + .32, dep - .3, .2, .3, .2); P(MT.v, BG.sph, [0x3a8a3a, 0x4a9a3a, 0xd83a7a][r() * 3 | 0], u, y0 + .72, dep - .3, .35, .45, .35) }
          if (hi && r() < .25) P(MT.v, BG.box, [0xf0f0f0, 0x3a6ad8, 0xe8c040, 0xd83a3a][r() * 4 | 0], L * .3 + r() * L * .4, y0 + 1.6, dep - .08, .7, .9, .02);   // laundry
        } else {
          const nW = Math.max(1, Math.round(L / 2.2)), ww = Math.min(1.4, L / nW - .5);
          for (let i = 0; i < nW; i++) { const cx = (i + .5) * L / nW, t = r() < .8 ? wt : r() * 8 | 0; P(facM, cell('w' + (t + fAlt)), 0xffffff, cx, y0 + 1.55, .03, ww, 1.5, .06, LITW[t] && r() < .55 ? 1 : 0);
            if (lo) continue; P(wallM, BG.box, sh(.95), cx, y0 + .76, .1, ww + .16, .07, .22); P(wallM, BG.box, sh(.86), cx, y0 + 2.42, .28, ww + .4, .06, .55, 0, .2) }
        }
        if (!lo && r() < .3) { const u = .5 + r() * (L - 1); P(facM, cell('ac'), 0xffffff, u, y0 + 2.6, .25, .75, .52, .3) }
        if (k === flagF) { P(MT.v, A.geo('cyl6'), 0xc8c8c8, .5, y0 + 2.2, .6, .025, 1.6, .025, 0, -.7); P(facM, cell('flag'), 0xffffff, .5, y0 + 2.55, 1.05, .04, .62, .9, .3) }
      }
      /* roof: parapet, stainless water tank, small red-tiled roof (mái Thái) or a tin-roofed terrace */
      P(wallM, BG.box, sh(.85), L / 2, h - .05, .02, L + .02, .14, .3);
      if (lo) return;
      if (r() < .3) P(ROOF, A.geo('hip'), 0xffffff, L / 2, h + .7, -D * .35, (L + .4) / 1.414, 1.4, (Math.min(D * .6, 9)) / 1.414);
      else if (r() < .35) { const sd = Math.min(5, D * .4); P(awnM, BG.box, 0x8a9aa8, L / 2, h + 2.4, -sd / 2 - .5, L - .3, .05, sd, 0, -.08); for (const u of [.3, L - .3]) P(MT.v, BG.box, 0x5a5a5a, u, h + 1.2, -.5, .08, 2.4, .08) }
      if (r() < .65) { const u = .9 + r() * Math.max(.1, L - 1.8), v = -D * (.55 + r() * .3); P(MT.v, BG.box, 0x6a6a6a, u, h + .35, v, .9, .7, .9); P(MT.shiny, A.geo('cyl'), 0xdadde2, u, h + 1.25, v, .55, 1.2, .55, 0, Math.PI / 2) }
      if (r() < .2) P(MT.v, A.geo('cyl6'), 0x8a8a8a, L * .7, h + 1.6, -1.4, .03, 3.2, .03);
      if (r() < .35) P(MT.v, A.geo('cyl6'), 0x8a8a84, r() < .5 ? .3 : L - .3, h / 2, .17, .06, h, .06);
    }
    const blockRows = (bx0, bx1, bz0, bz1, b, r, maxF) => {
      const d = Math.min(13, (bz1 - bz0) / 2 - .5), dw = Math.min(13, (bx1 - bx0) / 2 - .5);
      const row = (a0, a1, f0, f1, face, alongX) => { let a = a0; while (a < a1 - 3) { const w = Math.min(a1 - a, 3.8 + r() * 2.6 + (r() < .15 ? 3 : 0)); const R0 = alongX ? { x0: a, x1: a + w, z0: f0, z1: f1 } : { x0: f0, x1: f1, z0: a, z1: a + w };
        if (w > 2.8 && !RESERVED.some(rs => R0.x0 < rs.x1 && R0.x1 > rs.x0 && R0.z0 < rs.z1 && R0.z1 > rs.z0)) tubeHouse(b, R0.x0 + .05, R0.x1 - .05, R0.z0, R0.z1, face, r, maxF); a += w } };
      row(bx0, bx1, bz0, bz0 + d, 'n', true); row(bx0, bx1, bz1 - d, bz1, 's', true); row(bz0 + d + .2, bz1 - d - .2, bx0, bx0 + dw, 'w', false); row(bz0 + d + .2, bz1 - d - .2, bx1 - dw, bx1, 'e', false);
    };
    { const r = AV.rng(4321); const sides = [VR.filter(v => v[0] < RIV0), VR.filter(v => v[0] > RIV1)];
      sides.forEach((vs, si) => { for (let i = 0; i < vs.length - 1; i++) { const a = vs[i], b = vs[i + 1], mx = (a[0] + b[0]) / 2, hz = HR.filter(h => mx > h[1] && mx < h[2]).sort((p, o) => p[0] - o[0]), zs = [{ z: ZMIN - 4, w: 0 }].concat(hz.map(h => ({ z: h[0], w: h[3] })), [{ z: Math.min(ZMAX, a[2], b[2]) + 4, w: 0 }]);
        for (let j = 0; j < zs.length - 1; j++) { const bx0 = a[0] + a[3] / 2 + 2.3, bx1 = b[0] - b[3] / 2 - 2.3, bz0 = Math.max(ZMIN + .5, zs[j].z + zs[j].w / 2 + 2.3), bz1 = Math.min(ZMAX - .5, zs[j + 1].z - zs[j + 1].w / 2 - 2.3); if (bz1 - bz0 < 8) continue; blockRows(bx0, bx1, bz0, bz1, si ? B.east : B.city, r, si && i === vs.length - 2 ? 9 : 6) } } });
      /* thin strip between the west edge and the first street */
      for (let z = ZMIN + 1; z < 118; z += 0) { const w = 4 + r() * 2.5; if (!HR.some(h => h[0] < -66 && Math.abs(h[0] - (z + w / 2)) < h[3] / 2 + 3)) tubeHouse(B.city, -249.5, -242.3, z, z + w - .1, 'e', r, 4); z += w } }
    /* ---------- towers: riverside skyline + beach hotels ---------- */
    const towerM = K.floraMat(0, { map: towerTex(0), rough: .3, metal: .3 }); towerM.emissiveMap = towerTex(1); towerM.emissive = new THREE.Color(0xffffff); towerM.emissiveIntensity = 0;
    ctx.upd.push(() => { towerM.emissiveIntensity = (AV.nightK || 0) * .95 });
    const boxUV = (w, h, d) => { const g = new THREE.BoxGeometry(1, 1, 1), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) { const f = i / 4 | 0, u = uv.getX(i), v = uv.getY(i); if (f === 2 || f === 3) uv.setXY(i, .01, .985); else uv.setXY(i, u * (f < 2 ? d : w) / 10.4, v * h / 26.4) } return g };
    const tower = (b, x, z, w, d, h, col, name, ry) => { b.add(towerM, boxUV(w, h, d), col, M(x, h / 2, z, w, h, d, 0, ry || 0, 0)); b.add(MT.v, BG.box, 0xd8d4cc, M(x, .3 + 2.2, z, w + .6, 4.4, d + .6, 0, ry || 0, 0), .2); b.add(MT.v, BG.box, 0xc8c4bc, M(x, h + .6, z, w * .7, 1.2, d * .7, 0, ry || 0, 0));
      b.add(MT.v, BG.box, 0xe8e4dc, M(x, h + .1, z, w + .3, .3, d + .3, 0, ry || 0, 0)); B.night.add(MT.v, BG.sph, 0xff3030, M(x, h + 1.5, z, .25, .25, .25), 1);
      const c = Math.cos(ry || 0), s = Math.sin(ry || 0), hw = (Math.abs(w * c) + Math.abs(d * s)) / 2, hd = (Math.abs(w * s) + Math.abs(d * c)) / 2; solid(x - hw - .3, x + hw + .3, z - hd - .3, z + hd + .3);
      if (name) { for (const sd of [-1, 1]) label([name], x + sd * (hw + .32) * (Math.abs(c) > .5 ? 1 : 0) + (Math.abs(c) > .5 ? 0 : 0), h - 3, z + (Math.abs(c) > .5 ? 0 : sd * (hd + .32)), Math.abs(c) > .5 ? (sd > 0 ? Math.PI / 2 : -Math.PI / 2) : (sd > 0 ? 0 : Math.PI), Math.min(d, 16) * .9, 2.2, '#0e2a4a', '#ffffff', null, false) } };
    /* Da Nang Administrative Centre (tall glass tower) + riverside hotels */
    { const x = -84, z = -131, b = B.city; const g = new THREE.CylinderGeometry(7.5, 10, 96, 8, 1); { const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 6, uv.getY(i) * 96 / 26.4) } b.add(towerM, g, 0x9ac0d8, M(x, 48, z, 1, 1, 1, 0, Math.PI / 8, 0));
      b.add(MT.shiny, new THREE.CylinderGeometry(2, 7.4, 14, 8), 0xc8d8e0, M(x, 103, z, 1, 1, 1, 0, Math.PI / 8, 0)); b.add(MT.v, BG.box, 0xd8d4cc, M(x, 4, z, 24, 8, 26)); B.night.add(MT.v, BG.sph, 0xff3030, M(x, 111, z, .5, .5, .5), 1); solid(x - 12, x + 12, z - 13, z + 13) }
    tower(B.city, -84, 30, 20, 16, 64, 0xdfe8ee, 'NOVA RIVERSIDE HOTEL'); tower(B.city, -84, 141, 18, 14, 46, 0xe8e0d0, 'SÔNG HÀN TOWER');
    { const r = AV.rng(777), names = ['BIỂN XANH HOTEL', 'SÓNG BIỂN', 'MỸ KHÊ PLAZA', 'AN HẢI HOTEL', 'SƠN TRÀ BAY', 'BLUE OCEAN', 'GOLDEN SAND', 'COCO BEACH'];
      let n = 0; for (const [z0, z1] of [[-178, -157], [-143, -117], [-103, -67], [-53, -10], [10, 53], [67, 113], [127, 153], [167, 178]]) { let z = z0; while (z1 - z > 10) { const d = Math.min(z1 - z, 12 + r() * 8); if (d < 10) break; const h = 26 + r() * 46; tower(B.east, 181, z + d / 2, 26, d - 2, h, [0xeef0f2, 0xe8e0d0, 0xd8e8ee, 0xf2ece0][n % 4], r() < .6 ? names[n % names.length] : null); n++; z += d + 1.5 } } }

    /* ======================= electricity poles with Vietnam's famous wire tangles + street lamps ======================= */
    { const wire = [], cable = [];
      for (const rd of ROADS) { if (rd[4] < 7) continue; const L = Math.hypot(rd[2] - rd[0], rd[3] - rd[1]), n = Math.floor(L / 24), ux = (rd[2] - rd[0]) / L, uz = (rd[3] - rd[1]) / L, off = rd[4] / 2 + 1.1; let prev = null;
        for (let i = 0; i <= n; i++) { const x = rd[0] + ux * i * L / n - uz * off, z = rd[1] + uz * i * L / n + ux * off; if (x > RIV0 - 2 && x < RIV1 + 2 || x > 214 || occ.some(o => inRect(o, x, z, .3)) || roadDist(x, z) < .2 || RESERVED.some(rs => inRect(rs, x, z, -1))) { prev = null; continue }
          B.decor.add(MT.stone, A.geo('cyl6'), 0xb8b2a6, M(x, 4, z, .16, 8, .16)); B.decor.add(MT.v, BG.box, 0x5a5a5a, M(x, 7.4, z, 1.4, .1, .1)); ctx.circles.push([x, z, .22]);
          if (q > 0 && i % 2) for (let k = 0; k < 3; k++) B.decor.add(MT.v, new THREE.TorusGeometry(.32, .05, 4, 10), 0x1a1a1a, M(x + .1, 5.6 - k * .35, z, 1, 1, 1, Math.PI / 2 + k * .3, 0, 0));   // coiled cable bundles
          if (q > 0 && i % 4 === 1) B.decor.add(MT.shiny, A.geo('cyl'), 0x8a9098, M(x, 6.5, z + .4, .32, .8, .32));
          if (prev) for (let k = 0; k < (q ? 7 : 3); k++) { const y = 7.3 - k * .22, s = .4 + k * .18 + (k % 3) * .1; for (let t = 0; t < 6; t++) { const f0 = t / 6, f1 = (t + 1) / 6; wire.push(prev[0] + (x - prev[0]) * f0, y - Math.sin(f0 * Math.PI) * s, prev[1] + (z - prev[1]) * f0, prev[0] + (x - prev[0]) * f1, y - Math.sin(f1 * Math.PI) * s, prev[1] + (z - prev[1]) * f1) } }
          prev = [x, z] }
        /* main roads: double-arm lamp posts on the other side */
        if (rd[4] >= 10) for (let s = 12; s < L; s += 30) { const x = rd[0] + ux * s + uz * off, z = rd[1] + uz * s - ux * off; if (x > RIV0 - 2 && x < RIV1 + 2 || occ.some(o => inRect(o, x, z, .3)) || roadDist(x, z) < .2) continue;
          B.decor.add(MT.shiny, A.geo('cyl6'), 0x4a5a5a, M(x, 4.5, z, .12, 9, .12)); for (const a of [-1, 1]) { B.decor.add(MT.shiny, BG.box, 0x4a5a5a, M(x - uz * a * .9, 8.9, z + ux * a * .9, Math.abs(uz) * 1.8 + .06, .06, Math.abs(ux) * 1.8 + .06)); B.night.add(MT.v, BG.sph, 0xfff0c8, M(x - uz * a * 1.7, 8.7, z + ux * a * 1.7, .3, .14, .3), 1) } ctx.circles.push([x, z, .2]) } }
      grp.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(wire, 3)), new THREE.LineBasicMaterial({ color: 0x161616 }))) }

    /* ======================= BRIDGES ======================= */
    const dragonM = K.floraMat(0, { rough: .32, metal: .55 }), ledM = K.floraMat(0, { rough: .4, metal: .4 });
    const bridgeDeck = (bz, w, road) => { const b = B.land, x0 = RIV0 - 2, x1 = RIV1 + 2;
      walk.bridges.push({ x0, z0: bz, ux: 1, uz: 0, len: x1 - x0, w, rise: 0, y: -.12 });
      box(b, MT.stone, 0xb8b4ac, x0, x1, -1.1, -.02, bz - w / 2, bz + w / 2); box(b, MT.v, 0x45464b, x0, x1, -.02, .01, bz - road / 2, bz + road / 2); box(b, MT.v, 0xc7b9a6, x0, x1, -.02, .03, bz - w / 2, bz - road / 2); box(b, MT.v, 0xc7b9a6, x0, x1, -.02, .03, bz + road / 2, bz + w / 2);
      for (const s of [-1, 1]) { box(b, MT.shiny, 0x8a9098, x0, x1, .95, 1.08, bz + s * (w / 2 - .1) - .06, bz + s * (w / 2 - .1) + .06); for (let x = x0 + .5; x < x1; x += 1.6) box(b, MT.shiny, 0x8a9098, x - .04, x + .04, 0, 1, bz + s * (w / 2 - .1) - .04, bz + s * (w / 2 - .1) + .04); box(b, MT.stone, 0xb8b4ac, x0, x1, 0, .3, bz + s * (road / 2 + .1) - .1, bz + s * (road / 2 + .1) + .1) }
      for (let x = RIV0 + 8; x < RIV1 - 4; x += 15) box(b, MT.stone, 0xa8a49c, x - 1.2, x + 1.2, -5.6, -1, bz - w / 2 + 1, bz + w / 2 - 1);
      for (let x = x0 + 4; x < x1; x += 16) for (const s of [-1, 1]) { b.add(MT.shiny, A.geo('cyl6'), 0x4a5a5a, M(x, 3.5, bz + s * (w / 2 - .3), .1, 7, .1)); B.night.add(MT.v, BG.sph, 0xfff0c8, M(x, 7.1, bz + s * (w / 2 - .9), .3, .15, .3), 1) } };
    BRIDGES.forEach(b => bridgeDeck(b.z, b.w, b.road));
    /* --- Dragon Bridge: undulating golden steel dragon in the median, head to the sea --- */
    const HEAD = new THREE.Vector3(18.5, 9.4, 0), MOUTH = new THREE.Vector3(22.6, 8.7, 0);
    { const pts = []; for (let x = -46; x <= 11; x += 1) pts.push(new THREE.Vector3(x, 1.1 + 8.2 * Math.pow(Math.abs(Math.sin(Math.PI * (x + 46) / 11.4)), .85) + (x < -40 ? (x + 40) * -.12 : 0), 0));
      pts.push(new THREE.Vector3(13, 6.2, 0), new THREE.Vector3(15.2, 8.4, 0), new THREE.Vector3(17.2, 9.3, 0));
      const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal'), TS = 260, RS = 10, tube = new THREE.TubeGeometry(curve, TS, 1, RS, false), tp2 = tube.attributes.position, cp = new THREE.Vector3();
      for (let i = 0; i <= TS; i++) { const u = i / TS, rr = .3 + .75 * Math.min(1, u * 1.4); curve.getPointAt(u, cp); for (let j = 0; j <= RS; j++) { const k = i * (RS + 1) + j; tp2.setXYZ(k, cp.x + (tp2.getX(k) - cp.x) * rr, cp.y + (tp2.getY(k) - cp.y) * rr, cp.z + (tp2.getZ(k) - cp.z) * rr) } }
      tube.computeVertexNormals();
      const parts = [[tube, 0xe8b420, null, 0]];
      for (let u = .02; u < .99; u += .011) { curve.getPointAt(u, cp); const rr = .3 + .75 * Math.min(1, u * 1.4); parts.push([BG.cone, 0xd88a1a, M(cp.x, cp.y + rr * .9, cp.z, .14 + rr * .1, .5 + rr * .5, .14 + rr * .1), .1]) }
      for (let u = .05; u < .98; u += .035) { curve.getPointAt(u, cp); const rr = .3 + .75 * Math.min(1, u * 1.4); parts.push([new THREE.TorusGeometry(1, .08, 5, 14), 0xb88218, M(cp.x, cp.y, cp.z, rr * 1.02, rr * 1.02, rr * 1.02, 0, Math.PI / 2, 0), 0]) }
      /* tail tuft */ for (let k = 0; k < 5; k++) parts.push([BG.cone, 0xe8a020, M(-46.6 - k * .2, 1.2 + k * .25, (k - 2) * .25, .14, 1.4, .14, 0, 0, 1.2 + k * .1), .2]);
      /* head: skull, snout, open jaws, teeth, eyes, horns, mane, whiskers, beard */
      const H = HEAD, hp = (geo, col, x, y, z, sx, sy, sz, rx, ry, rz, gl) => parts.push([geo, col, M(H.x + x, H.y + y, H.z + z, sx, sy, sz, rx || 0, ry || 0, rz || 0), gl || 0]);
      hp(BG.sph, 0xe8b420, 0, 0, 0, 1.9, 1.35, 1.25); hp(BG.sph, 0xe8b420, 2.1, -.05, 0, 2.2, .75, .95, 0, 0, -.08); hp(BG.sph, 0xe8b420, 3.6, -.05, 0, .75, .55, .8); hp(BG.box, 0xd89a1a, 2.3, -1.05, 0, 2.6, .32, 1.1, 0, 0, -.3);
      for (const s of [-1, 1]) { hp(BG.sph, 0xffffff, .9, .55, s * .82, .38, .3, .2, 0, 0, 0, .6); hp(BG.sph, 0xd81a1a, 1.02, .55, s * .92, .18, .18, .1, 0, 0, 0, 1); hp(BG.cone, 0xf2d050, -.8, 1.3, s * .55, .22, 2.6, .22, s * .25, 0, 1.15); hp(BG.cone, 0xf2d050, -1.3, 1.0, s * .9, .18, 1.8, .18, s * .5, 0, 1.4);
        hp(A.geo('cyl6'), 0xd89a1a, 3.2, -.55, s * .55, .05, 3, .05, s * .4, 0, .9); hp(BG.sph, 0x2a1a0a, 4.1, .1, s * .3, .12, .1, .1); for (let k = 0; k < 4; k++) { hp(BG.cone, 0xffffff, 2.6 + k * .45, -.42, s * .45, .06, .3, .06, Math.PI, 0, 0); hp(BG.cone, 0xffffff, 2.1 + k * .45, -.82, s * .42, .06, .3, .06, 0, 0, -.3) } }
      for (let k = 0; k < 9; k++) hp(BG.cone, 0xe07a10, -1.2 - k * .35, .9 - k * .25, (k % 2 ? 1 : -1) * .3, .2, 1.2, .2, 0, 0, .9 + k * .1, .2);
      hp(BG.cone, 0xd89a1a, 1.2, -1.6, 0, .35, 1.2, .25, Math.PI, 0, 0);
      const dm = new THREE.Mesh(K.merge(parts), dragonM); dm.castShadow = hi; grp.add(dm);
      ctx.circles.push([HEAD.x, HEAD.z, 2.2]);
      label(['CẦU RỒNG', 'DRAGON BRIDGE · HÀN RIVER'], -52, 3.6, 12.5, -Math.PI / 2, 5, 2.2, '#8a1a1a', '#ffd84a', '#ffd84a') }
    /* --- Hàn River Bridge (steel truss swing bridge) --- */
    { const bz = -110, w = 16, b = B.land, x0 = RIV0 - 2, x1 = RIV1 + 2, parts = [];
      for (const s of [-1, 1]) { const zz = bz + s * (w / 2 - 1.2); parts.push([BG.box, 0x8aa0b0, M((x0 + x1) / 2, 6.2, zz, x1 - x0, .5, .5)]); for (let x = x0; x <= x1 + .1; x += 4) { parts.push([BG.box, 0x8aa0b0, M(x, 3.1, zz, .35, 6.2, .35)]); if (x + 4 <= x1 + .1) parts.push([BG.box, 0x8aa0b0, M(x + 2, 3.1, zz, .25, 7.3, .25, 0, 0, (Math.floor((x - x0) / 4) % 2 ? 1 : -1) * .57)]) } }
      for (let x = x0; x <= x1 + .1; x += 8) parts.push([BG.box, 0x8aa0b0, M(x, 6.2, bz, .3, .3, w - 2.4)]);
      parts.push([A.geo('cyl'), 0xa8a49c, M(-16, -3, bz, 6, 6, 6)]);
      const tm = new THREE.Mesh(K.merge(parts), ledM); tm.castShadow = hi; grp.add(tm);
      for (const s of [-1, 1]) ctx.cols.push([x0, x1, bz + s * (w / 2 - 1.2) - .3, bz + s * (w / 2 - 1.2) + .3]);
      label(['CẦU SÔNG HÀN', 'HÀN RIVER BRIDGE · 1997'], -52, 3.6, bz + 10.5, -Math.PI / 2, 5, 2.2, '#1d3f6a', '#ffffff', '#ffffff') }
    /* --- Trần Thị Lý bridge (single inclined pylon, fan of stay cables) --- */
    { const bz = 120, px = 6, ph = 52, lean = .32, cab = [], parts = [];
      parts.push([BG.box, 0xf2f2f0, M(px - Math.sin(lean) * ph / 2, Math.cos(lean) * ph / 2, bz, 2.4, ph, 1.8, 0, 0, lean)]);
      parts.push([BG.box, 0xe8e8e4, M(px + 3, 5, bz, 1.4, 11, 1.4, 0, 0, -.3)]);
      const top = (f) => [px - Math.sin(lean) * ph * f, Math.cos(lean) * ph * f];
      for (let k = 0; k < 14; k++) { const [tx, ty] = top(.55 + k * .032), dx = px - 4 - k * 3.4; for (const s of [-1, 1]) cab.push(tx, ty, bz + s * .5, dx, .6, bz + s * .9) }
      for (let k = 0; k < 6; k++) { const [tx, ty] = top(.6 + k * .06); for (const s of [-1, 1]) cab.push(tx, ty, bz + s * .5, px + 6 + k * 1.6, .6, bz + s * 1.2) }
      const pm = new THREE.Mesh(K.merge(parts), ledM); pm.castShadow = hi; grp.add(pm); ctx.circles.push([px, bz, 1.6]);
      grp.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(cab, 3)), new THREE.LineBasicMaterial({ color: 0xe8e8e8 })));
      label(['CẦU TRẦN THỊ LÝ', 'TRAN THI LY BRIDGE'], -52, 3.6, bz - 10.5, -Math.PI / 2, 5, 2.2, '#1d3f6a', '#ffffff', '#ffffff') }
    ctx.upd.push((dt, t) => { const nk = AV.nightK || 0, show = showOn(); dragonM.emissive.setHSL((t * .05) % 1, .9, .5).multiplyScalar(nk * (show ? .25 : .55)); if (show && nk > .2) dragonM.emissive.setRGB(.9, .45, .1).multiplyScalar(.6 + .4 * Math.sin(t * 9));
      ledM.emissive.setHSL((t * .03 + .5) % 1, .8, .5).multiplyScalar(nk * .45) });

    /* ======================= LOVE PIER (Cầu Tình Yêu) + Carp-Dragon fountain ======================= */
    const PIER = { x0: -10, x1: RIV1 + 1, z0: -36, z1: -26 }, CARP = [-7.5, -31];
    { const b = B.land, zc = -31; walk.bridges.push({ x0: RIV1 + 1, z0: zc, ux: -1, uz: 0, len: RIV1 + 1 - PIER.x0, w: 10, rise: 0, y: -.12 });
      box(b, MT.wood, 0xc8a070, PIER.x0, PIER.x1, -.5, .0, PIER.z0, PIER.z1); for (let x = PIER.x0 + 1; x < RIV1; x += 4) for (const z of [PIER.z0 + .8, PIER.z1 - .8]) b.add(MT.stone, A.geo('cyl'), 0x9a948a, M(x, -3, z, .35, 6, .35));
      for (const z of [PIER.z0 + .1, PIER.z1 - .1]) { box(b, MT.shiny, 0x2a2a2a, PIER.x0, RIV1, .95, 1.05, z - .05, z + .05); for (let x = PIER.x0 + .3; x < RIV1; x += 1.2) box(b, MT.shiny, 0x2a2a2a, x - .03, x + .03, 0, 1, z - .03, z + .03); ctx.cols.push([PIER.x0, RIV1, z - .25, z + .25]) }
      box(b, MT.shiny, 0x2a2a2a, PIER.x0 - .1, PIER.x0 + .1, .95, 1.05, PIER.z0, PIER.z1); ctx.cols.push([PIER.x0 - .4, PIER.x0 + .1, PIER.z0, PIER.z1]);
      const r = AV.rng(14); for (let i = 0; i < [80, 200, 320][q]; i++) { const z = r() < .5 ? PIER.z0 + .16 : PIER.z1 - .16, x = PIER.x0 + .3 + r() * (RIV1 - PIER.x0 - .6); b.add(MT.shiny, BG.box, [0xe8c040, 0xd8d8d8, 0xd83a5a, 0x3a8ad8][i % 4], M(x, .55 + r() * .4, z, .07, .1, .05)) }   // padlocks
      for (let x = PIER.x0 + 2; x < RIV1; x += 3.2) for (const z of [PIER.z0 + .1, PIER.z1 - .1]) { b.add(MT.shiny, A.geo('cyl6'), 0x2a2a2a, M(x, 1.4, z, .05, 2.8, .05)); for (const s of [-1, 1]) B.night.add(MT.v, BG.sph, 0xff2a5a, M(x + s * .13, 3.0, z, .2, .2, .12), 1); B.night.add(MT.v, BG.cone, 0xff2a5a, M(x, 2.75, z, .3, .4, .1, Math.PI, 0, 0), 1) }
      /* Carp transforming into a dragon (white stone), spouting water into the river */
      const [cx, cz] = CARP, sp = [];
      sp.push([A.geo('cyl'), 0xd8d4cc, M(cx, .5, cz, 2.2, 1, 2.2)], [A.geo('cyl'), 0xe8e4dc, M(cx, 1.6, cz, 1.4, 1.4, 1.4)]);
      const arc = []; for (let k = 0; k <= 10; k++) { const a = k / 10 * Math.PI * .95; arc.push([cx + Math.cos(a) * 2.2 - .2, 2.3 + Math.sin(a) * 3.6, cz]) }
      arc.forEach(([x, y, z], k) => { const s = .65 + Math.sin(k / 10 * Math.PI) * .55; sp.push([BG.sph, 0xf2efe8, M(x, y, z, s, s, s * .85)]) });
      sp.push([BG.sph, 0xf2efe8, M(cx - 2.6, 4.5, cz, 1.2, .95, .9)], [BG.sph, 0xf2efe8, M(cx - 3.5, 4.2, cz, .7, .55, .6)], [BG.cone, 0xf2efe8, M(cx - 1.8, 5.6, cz - .4, .2, 1.8, .2, -.3, 0, .9)], [BG.cone, 0xf2efe8, M(cx - 1.8, 5.6, cz + .4, .2, 1.8, .2, .3, 0, .9)]);
      for (let k = 0; k < 5; k++) sp.push([BG.sph, 0xf2efe8, M(cx + 2.1 + (k - 2) * .15, 2.2 - Math.abs(k - 2) * .2, cz + (k - 2) * .45, .25, 1.1, .12, 0, 0, (k - 2) * .2)]);
      for (const s of [-1, 1]) sp.push([BG.sph, 0xeae6de, M(cx - .5, 4.6, cz + s * .7, 1.2, .2, .7, s * .5, 0, 0)], [BG.sph, 0x1a1a1a, M(cx - 2.9, 4.8, cz + s * .55, .12, .12, .1)]);
      const cm = new THREE.Mesh(K.merge(sp), K.floraMat(0, { rough: .75 })); cm.castShadow = hi; grp.add(cm); ctx.circles.push([cx, cz, 2.3]);
      /* entrance arch */
      for (const s of [-1, 1]) b.add(MT.shiny, A.geo('cyl6'), 0x2a2a2a, M(RIV1 + 1.5, 2.2, -31 + s * 4.2, .12, 4.4, .12)); b.add(MT.shiny, new THREE.TorusGeometry(4.2, .1, 6, 24, Math.PI), 0x2a2a2a, M(RIV1 + 1.5, 4.2, -31, 1, .5, 1, 0, Math.PI / 2, 0));
      label(['CẦU TÌNH YÊU', 'LOVE PIER · ĐÀ NẴNG'], RIV1 + 1.45, 4.6, -31, Math.PI / 2, 4.4, 1.4, '#c81a4a', '#ffffff', null, false) }
    const carpSpray = CY.spray(ctx, [160, 260, 360][q]);
    ctx.upd.push(() => { const P = AV.P; if (Math.hypot(P.x - CARP[0], P.z - CARP[1]) > 120) return; carpSpray.emit(CARP[0] - 4, 4.4, CARP[1], -1, .35, 0, 2, .08, 6.5) });

    /* ======================= DRAGON SHOW: fire then water at 21:00 ======================= */
    const showOn = () => { const h = hourNow(); return h >= 21 && h < 21.7 }, showFire = () => hourNow() < 21.35;
    const fire = (() => { const n = [90, 160, 240][q], im = new THREE.InstancedMesh(new THREE.SphereGeometry(.5, 7, 5), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .85, depthWrite: false, blending: THREE.AdditiveBlending }), n), cc = new THREE.Color(), Z = new THREE.Matrix4().makeScale(0, 0, 0);
      im.frustumCulled = false; im.material.userData.lin = 1; grp.add(im); const P = []; for (let i = 0; i < n; i++) { P.push({ life: 0 }); im.setMatrixAt(i, Z); im.setColorAt(i, cc.setRGB(1, .5, .1)) } let head = 0;
      const api = { emit(water) { const p = P[head]; head = (head + 1) % n; Object.assign(p, { x: MOUTH.x, y: MOUTH.y, z: MOUTH.z, vx: (water ? 14 : 11) + Math.random() * 3, vy: (water ? 4 : 1.2) + Math.random() * 1.5, vz: (Math.random() - .5) * 2.4, life: water ? 2.2 : 1.1, max: water ? 2.2 : 1.1, water }); im.setColorAt((head + n - 1) % n, water ? cc.setRGB(.6, .85, 1) : cc.setRGB(1, .55 + Math.random() * .2, .12)); im.instanceColor.needsUpdate = true } };
      const m4 = new THREE.Matrix4(); ctx.upd.push(dt => { for (let i = 0; i < n; i++) { const p = P[i]; if (p.life <= 0) continue; p.life -= dt; if (p.life <= 0) { im.setMatrixAt(i, Z); continue } p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.vy += (p.water ? -6 : 2.5) * dt; p.vx *= p.water ? 1 : .97;
        const a = 1 - p.life / p.max, s = p.water ? .35 + a * .5 : .5 + a * 2.4; m4.makeScale(s, s, s); m4.setPosition(p.x, p.y, p.z); im.setMatrixAt(i, m4) } im.instanceMatrix.needsUpdate = true });
      return api })();
    const fireLight = new THREE.PointLight(0xff8a2a, 0, 60); fireLight.position.copy(MOUTH).add(new THREE.Vector3(4, 0, 0)); grp.add(fireLight);
    let showWasOn = false, burstT = 0;
    ctx.upd.push((dt, t) => { const on = showOn(); fireLight.intensity = 0;
      if (on) { const P = AV.P, near = Math.hypot(P.x - HEAD.x, P.z - HEAD.z) < 180; if (!showWasOn && near) AV.toast(tr('21:00 — the Dragon Bridge show begins! Fire first, then water.', '21:00 — ¡empieza el espectáculo del Puente del Dragón! Primero fuego, luego agua.'));
        if (near) { done('dragon'); const f = showFire(), ph = (t % 4); if (ph < 2.6) { burstT += dt; while (burstT > (f ? .02 : .012)) { burstT -= f ? .02 : .012; fire.emit(!f) } if (f) { fireLight.intensity = 2.5 + Math.random() * 1.5; if (Math.random() < .08 && AV.audio) AV.audio.blip(60 + Math.random() * 30, .25, 'sawtooth', .07) } } } }
      showWasOn = on });

    /* ======================= HÀN MARKET (Chợ Hàn) ======================= */
    const room = (b, x0, x1, z0, z1, h, doors, col) => { const t = .3, segs = { n: [x0, x1, z0, z0 + t, 'x'], s: [x0, x1, z1 - t, z1, 'x'], w: [x0, x0 + t, z0, z1, 'z'], e: [x1 - t, x1, z0, z1, 'z'] };
      for (const sd in segs) { const [a0, a1, b0, b1, ax] = segs[sd], ds = doors.filter(d => d.side === sd).sort((p, o) => p.at - o.at); let cur = ax === 'x' ? a0 : b0; const end = ax === 'x' ? a1 : b1;
        const put = (c0, c1) => { if (c1 - c0 < .05) return; const bb = ax === 'x' ? [c0, c1, b0, b1] : [a0, a1, c0, c1]; box(b, wallM, col, bb[0], bb[1], 0, h, bb[2], bb[3]); ctx.cols.push(bb) };
        for (const d of ds) { put(cur, d.at - d.w / 2); const bb = ax === 'x' ? [d.at - d.w / 2, d.at + d.w / 2, b0, b1] : [a0, a1, d.at - d.w / 2, d.at + d.w / 2]; box(b, wallM, col, bb[0], bb[1], 3.4, h, bb[2], bb[3]); cur = d.at + d.w / 2 } put(cur, end) } };
    const stalls = [], STC = [0xd83a3a, 0x2a6ad8, 0xe8c040, 0x2a9a5a, 0xe86a1a, 0xd84a8a];
    const stall = (b, x, z, ry, col, umbrella) => { const c = Math.cos(ry), s = Math.sin(ry), P = (g, mat, cc, u, y, v, su, sy, sv, gl) => b.add(mat, g, cc, M(x + u * c + v * s, y, z - u * s + v * c, su, sy, sv, 0, ry, 0), gl);
      if (umbrella) { P(A.geo('cyl6'), MT.v, 0xd8d8d8, 0, 1.3, 0, .04, 2.6, .04); P(A.geo('cone'), MT.dbl, col, 0, 2.75, 0, 1.6, .55, 1.6) } else { for (const [u, v] of [[-1.3, -1], [1.3, -1], [-1.3, 1], [1.3, 1]]) P(A.geo('cyl6'), MT.v, 0xd8d8d8, u, 1.2, v, .05, 2.4, .05); P(A.geo('hip'), MT.roof, col, 0, 2.75, 0, 2.2, .8, 1.7) }
      P(BG.box, MT.wood, 0xffffff, 0, .45, .7, 2.6, .9, .6); stalls.push({ x: x + .7 * s, z: z + .7 * c, ry }); ctx.circles.push([x + .7 * s, z + .7 * c, .9]) };
    { const b = B.city, H = HANM, h = 9.5; room(b, H.x0, H.x1, H.z0, H.z1, h, [{ side: 'e', at: -85, w: 7 }, { side: 'w', at: -85, w: 7 }, { side: 'n', at: -84, w: 4 }, { side: 's', at: -84, w: 4 }], 0xeae2cc);
      box(b, wallM, 0xd8ccb0, H.x0 - .3, H.x1 + .3, h, h + .5, H.z0 - .3, H.z1 + .3); box(b, wallM, 0xd8ccb0, H.x0 - .2, H.x1 + .2, 4.6, 5, H.z0 - .2, H.z1 + .2); box(b, MT.v, 0xb8b0a0, H.x0 + .3, H.x1 - .3, .02, .06, H.z0 + .3, H.z1 - .3);
      for (let z = H.z0 + 2; z < H.z1 - 1; z += 3.2) for (const x of [H.x1 + .02, H.x0 - .02]) { if (Math.abs(z + 85) < 4) continue; box(b, facM === null ? MT.v : MT.v, 0x3a5a6a, x - .02, x + .02, 5.8, 8.6, z - 1, z + 1, .3) }
      label(['CHỢ HÀN', 'HAN MARKET · SINCE 1940'], H.x1 + .2, 7.2, -85, Math.PI / 2, 12, 3.2, '#1a4f8a', '#ffffff', '#ffffff');
      for (let i = 0; i < 3; i++) for (let j = 0; j < 6; j++) { if (j === 3) continue; stall(b, H.x0 + 5 + i * 8, H.z0 + 4 + j * 5.8, j % 2 ? 0 : Math.PI, STC[(i + j) % 6]) }
      const l = new THREE.PointLight(0xffe0b0, .9, 30); l.position.set(-84, 4, -85); grp.add(l) }
    /* ======================= DA NANG CATHEDRAL (pink "Rooster Church", 1923) ======================= */
    { const b = B.city, z = -31, PINK = 0xf3a7b9, TRIM = 0xfff6f2;
      box(b, wallM, PINK, -91, -75, 0, 9, z - 6, z + 6); b.add(ROOF, PRISM, 0x9a6a6a, M(-83, 9, z, 16.6, 4.2, 13.2, 0, 0, 0)); solid(-91, -75, z - 6, z + 6);
      for (const s of [-1, 1]) for (let x = -89; x <= -77; x += 3) { box(b, wallM, PINK, x - .35, x + .35, 0, 8, z + s * 6 - .4, z + s * 6 + .4); box(b, MT.v, 0x5a7aa8, x + 1.1, x + 1.9, 2.5, 6.5, z + s * 6.02 - .03, z + s * 6.02 + .03, .35); b.add(MT.v, BG.cone, TRIM, M(x + 1.5, 6.9, z + s * 6.05, .55, .9, .06)) }
      box(b, wallM, PINK, -97, -91, 0, 22, z - 3.2, z + 3.2); solid(-97, -91, z - 3.2, z + 3.2);
      for (const yy of [8, 15]) box(b, wallM, TRIM, -97.2, -90.8, yy, yy + .4, z - 3.4, z + 3.4);
      box(b, MT.v, 0x4a2a2a, -97.25, -97.1, 0, 3.6, z - 1.1, z + 1.1); b.add(MT.v, BG.cone, PINK, M(-97.2, 4.3, z, .12, 1.4, 1.2));
      b.add(MT.v, A.geo('disc'), 0x6a8ac8, M(-97.25, 11.5, z, 1.4, .1, 1.4, 0, 0, Math.PI / 2), .35); b.add(MT.v, new THREE.TorusGeometry(1.45, .12, 6, 24), TRIM, M(-97.3, 11.5, z, 1, 1, 1, 0, Math.PI / 2, 0));
      for (const s of [-1, 1]) for (const yy of [16.5, 19]) box(b, MT.v, 0x3a3a4a, -97.25, -97.1, yy, yy + 1.6, z + s * 1.4 - .35, z + s * 1.4 + .35);
      b.add(MT.v, BG.cone, 0x9a7a7a, M(-94, 28.5, z, 2.6, 13, 2.6, 0, Math.PI / 8, 0)); for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) b.add(MT.v, BG.cone, PINK, M(-94 + dx * 2.7, 23.5, z + dz * 2.9, .4, 3, .4));
      b.add(MT.shiny, A.geo('cyl6'), 0xe8c040, M(-94, 36, z, .06, 2.4, .06)); b.add(MT.shiny, BG.sph, 0xe8c040, M(-94, 37.4, z, .35, .3, .15), .3); b.add(MT.shiny, BG.cone, 0xe8c040, M(-93.75, 37.65, z, .1, .3, .05, 0, 0, -.6), .3);   // the rooster weathervane
      for (let x = CATH.x0; x <= CATH.x1; x += 1.2) for (const zz of [CATH.z0, CATH.z1]) box(b, MT.shiny, 0x2a2a2a, x - .03, x + .03, 0, 1.6, zz - .03, zz + .03); for (const zz of [CATH.z0, CATH.z1]) { box(b, MT.shiny, 0x2a2a2a, CATH.x0, CATH.x1, 1.5, 1.6, zz - .04, zz + .04); ctx.cols.push([CATH.x0, CATH.x1, zz - .2, zz + .2]) }
      box(b, MT.v, 0xe8e4d8, -86, -82, 0, 1.2, z - 15, z - 13); b.add(MT.v, BG.sph, 0xf4f4f8, M(-84, 2.2, z - 14, .4, 1, .4), .3); b.add(MT.v, BG.sph, 0x7aa8e8, M(-84, 3.4, z - 14, .3, .3, .3), .2); solid(-86, -82, z - 15, z - 13);
      label(['NHÀ THỜ CHÍNH TÒA ĐÀ NẴNG', 'DA NANG CATHEDRAL · 1923'], -98.6, 2.4, z + 9, -Math.PI / 2, 6.5, 1.4, '#f6f0e8', '#8a2a3a', '#c8a0a8') }
    /* ======================= CỒN MARKET (food court under a big roof) ======================= */
    { const b = B.city, C = CONM, cx = (C.x0 + C.x1) / 2, cz = (C.z0 + C.z1) / 2;
      for (let x = C.x0; x <= C.x1 + .1; x += 8.5) for (const z of [C.z0, C.z1]) { b.add(MT.shiny, A.geo('cyl'), 0x7a8a8a, M(x, 3.5, z, .25, 7, .25)); ctx.circles.push([x, z, .35]) }
      b.add(awnM, PRISM, 0x9aa8b0, M(cx, 7, cz, C.x1 - C.x0 + 3, 3.6, C.z1 - C.z0 + 3, 0, Math.PI / 2, 0)); b.add(awnM, PRISM, 0xb04a3a, M(cx, 6.9, cz, C.x1 - C.x0 + 3.2, 3.6, C.z1 - C.z0 + 3.2, 0, Math.PI / 2, 0));
      for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) stall(b, C.x0 + 6 + i * 11, C.z0 + 6 + j * 12, Math.PI / 2, STC[(i * 4 + j) % 6]);
      label(['CHỢ CỒN', 'CON MARKET · ĂN VẶT · STREET FOOD'], cx, 5.6, C.z0 - .6, Math.PI, 11, 2.6, '#c8302a', '#ffd84a', '#ffd84a') }
    /* low plastic stool + table sets (the Vietnamese sidewalk restaurant) */
    const stoolSet = (b, x, z, n) => { b.add(MT.v, BG.box, [0xd8d4c8, 0x3a6ad8, 0xd83a3a][(x * 7 + z | 0) % 3 < 0 ? 0 : (x * 7 + z | 0) % 3], M(x, .45, z, .7, .06, .7)); b.add(MT.v, BG.box, 0x9a9890, M(x, .22, z, .5, .44, .5)); for (let k = 0; k < (n || 4); k++) { const a = k / (n || 4) * TAU + .4; b.add(MT.v, BG.box, [0xd83a3a, 0x2a6ad8, 0xe8c040][k % 3], M(x + Math.cos(a) * .72, .2, z + Math.sin(a) * .72, .3, .4, .3)) } ctx.circles.push([x, z, .7]) };
    { const C = CONM; for (let i = 0; i < 8; i++) stoolSet(B.city, C.x0 + 6 + (i % 4) * 7.5, C.z0 + 18 + (i / 4 | 0) * 12) }
    /* ======================= SƠN TRÀ NIGHT MARKET (17:00–24:00) ======================= */
    { const N = NIGHTM, b = B.east; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { if (i === 1 && (j === 1 || j === 2)) continue; stall(b, N.x0 + 5 + i * 8, N.z0 + 6 + j * 12, i % 2 ? -Math.PI / 2 : Math.PI / 2, STC[(i + j * 2) % 6], (i + j) % 2 === 0) }
      for (let k = 0; k < 6; k++) stoolSet(b, N.x0 + 12 + (k % 2) * 3.5, N.z0 + 15 + (k / 2 | 0) * 8);
      for (const s of [-1, 1]) b.add(MT.v, A.geo('cyl'), 0xc8302a, M(48 + s * 5, 2.6, N.z0 - .5, .25, 5.2, .25)); box(b, MT.v, 0xc8302a, 42.5, 53.5, 5.1, 5.6, N.z0 - .7, N.z0 - .3);
      label(['CHỢ ĐÊM SƠN TRÀ', 'SON TRA NIGHT MARKET · 17:00–24:00'], 48, 6.4, N.z0 - .8, Math.PI, 9, 1.8, '#c8302a', '#ffd84a', '#ffd84a', false);
      for (let j = 0; j < 4; j++) K.lanterns(ctx, [[N.x0 + 1, 3.6, N.z0 + 2 + j * 12.5], [N.x1 - 1, 3.6, N.z0 + 2 + j * 12.5]], { cols: [0xff3030, 0xffc040, 0xff6ad5, 0x3ad8ff, 0x7aff8a], per: 14, sag: .5 });
      const l = new THREE.PointLight(0xffc890, 0, 36); l.position.set(48, 4, 30); grp.add(l); ctx.upd.push(() => { l.intensity = nightMarketOpen() ? 1.1 * (AV.nightK || 0) + .2 : 0 }) }
    const nightMarketOpen = () => { const h = hourNow(); return h >= 17 || h < .5 }, hanOpen = () => { const h = hourNow(); return h >= 6 && h < 19 }, conOpen = () => { const h = hourNow(); return h >= 6 && h < 21 };
    const goodsOpen = K.batch(), goodsClosed = K.batch(), nmStalls = [], dayStalls = [];
    stalls.forEach((st, i) => { const inNm = inRect(NIGHTM, st.x, st.z, 1), arr = inNm ? nmStalls : dayStalls; arr.push(st); const bo = inNm ? goodsOpen : goodsOpen;
      bo.add(MT.v, BG.box, STC[i % 6], M(st.x, 1.0, st.z, 1.2, .2, .4, 0, st.ry, 0), .3); for (let k = 0; k < 4; k++) bo.add(MT.v, BG.sph, [0xff8a3a, 0xe8c040, 0x7ad84a, 0xd83a3a][k], M(st.x + Math.cos(st.ry) * (k - 1.5) * .45, 1.18, st.z - Math.sin(st.ry) * (k - 1.5) * .45, .14, .12, .14), .2); bo.add(MT.v, BG.sph, 0xfff0c0, M(st.x, 2.3, st.z, .15, .15, .15), 1);
      goodsClosed.add(MT.roof, BG.box, 0x5a6a8a, M(st.x, .95, st.z, 2.7, .1, .7, 0, st.ry, 0)); st.nm = inNm });

    /* ======================= BẠCH ĐẰNG PROMENADE + riverside café ======================= */
    { const b = B.land; for (let z = ZMIN + 6; z < ZMAX - 4; z += 14) { if (BRIDGES.some(bb => Math.abs(z - bb.z) < bb.w / 2 + 2)) continue; b.add(MT.shiny, A.geo('cyl6'), 0x2a3a3a, M(-48.6, 2.2, z, .08, 4.4, .08)); B.night.add(MT.v, BG.sph, 0xfff0c8, M(-48.6, 4.5, z, .28, .28, .28), 1); ctx.circles.push([-48.6, z, .15]) }
      for (let z = ZMIN + 13; z < ZMAX - 4; z += 14) { if (BRIDGES.some(bb => Math.abs(z - bb.z) < bb.w / 2 + 3) || Math.abs(z - 17) < 6) continue; box(b, MT.wood, 0xb8865a, -52.6, -51.8, .42, .5, z - 1, z + 1); box(b, MT.shiny, 0x3a3a3a, -52.6, -51.8, .02, .44, z - .9, z - .8); box(b, MT.shiny, 0x3a3a3a, -52.6, -51.8, .02, .44, z + .8, z + .9); ctx.circles.push([-52.2, z, .7]) }
      /* café kiosk (cà phê sữa đá) with plastic stools looking over the river */
      box(b, wallM, 0xf2d16b, -59, -54, 0, 3, 13, 18); box(b, MT.roof, 0x3a7a4a, -59.4, -53.4, 3, 3.15, 12.4, 18.6); box(b, MT.wood, 0x7a4a2a, -54.1, -53.6, 0, 1.05, 13.2, 17.8); solid(-59, -53.6, 13, 18);
      label(['CÀ PHÊ SÔNG HÀN', 'CÀ PHÊ SỮA ĐÁ 25K'], -53.55, 2.4, 15.5, Math.PI / 2, 3.6, 1, '#3a2416', '#f0d8a0', null, false);
      for (let k = 0; k < 6; k++) { const z = 11 + k * 1.6; for (const x of [-50.8, -49.2]) B.land.add(MT.v, BG.box, [0xd83a3a, 0x2a6ad8][k % 2], M(x, .2, z + (x > -50 ? .4 : 0), .32, .4, .32)); ctx.circles.push([-50, z, .45]) }
      const l = new THREE.PointLight(0xffd8a0, .8, 14); l.position.set(-53, 2.6, 15.5); grp.add(l) }

    /* ======================= ASIA PARK + SUN WHEEL ======================= */
    const WX = -178, WZ = 152, WR = 26, WH = WR + 5;
    const wheel = new THREE.Group(); wheel.position.set(WX, WH, WZ); wheel.rotation.y = Math.PI / 2; grp.add(wheel);
    const spin = new THREE.Group(); wheel.add(spin); const cabins = [];
    { const wm = new THREE.MeshStandardMaterial({ color: 0xf2f2f4, roughness: .4, metalness: .5 }), rimL = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xff40c0, emissiveIntensity: 0, roughness: .4 });
      for (const s of [-1, 1]) { const rim = new THREE.Mesh(new THREE.TorusGeometry(WR, .35, 6, 72), rimL); rim.position.z = s * 1.6; spin.add(rim); for (let k = 0; k < 16; k++) { const a = k / 16 * TAU, sp2 = new THREE.Mesh(AV.G.cyl, wm); sp2.scale.set(.1, WR, .1); sp2.position.set(Math.cos(a) * WR / 2, Math.sin(a) * WR / 2, s * 1.6); sp2.rotation.z = a - Math.PI / 2; spin.add(sp2) } }
      const hub = new THREE.Mesh(AV.G.cyl, wm); hub.scale.set(2.2, 4.4, 2.2); hub.rotation.x = Math.PI / 2; spin.add(hub);
      const cabM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .3, metalness: .2 }), glassC = new THREE.MeshStandardMaterial({ color: 0x9ad8ff, roughness: .1, metalness: .3, emissive: 0xffe8b0, emissiveIntensity: 0 });
      for (let k = 0; k < 32; k++) { const a = k / 32 * TAU, c = new THREE.Group(); c.position.set(Math.cos(a) * WR, Math.sin(a) * WR, 0); spin.add(c); const body = new THREE.Mesh(AV.G.box, cabM); body.scale.set(2.4, 2.2, 2.4); body.position.y = -1.4; c.add(body);
        const gl = new THREE.Mesh(AV.G.box, glassC); gl.scale.set(2.46, 1.1, 2.46); gl.position.y = -1.1; c.add(gl); const tp3 = new THREE.Mesh(AV.G.box, [cabM][0]); tp3.scale.set(.15, .8, .15); tp3.position.y = -.1; c.add(tp3); cabins.push(c) }
      for (const sx of [-1, 1]) for (const sz2 of [-1, 1]) { const leg = new THREE.Mesh(AV.G.cyl, wm), dx = sx * 3.2, dz = sz2 * 12; leg.position.set(WX + dx / 2, WH / 2, WZ + dz / 2); leg.scale.set(.6, Math.hypot(WH, dz, dx), .6); leg.lookAt(WX + dx, 0, WZ + dz); leg.rotateX(Math.PI / 2); grp.add(leg); ctx.circles.push([WX + dx, WZ + dz, .8]) }
      ctx.upd.push((dt, t) => { spin.rotation.z = -t * .06; cabins.forEach(c => c.rotation.z = -spin.rotation.z); const nk = AV.nightK || 0; rimL.emissive.setHSL((t * .04) % 1, .9, .5); rimL.emissiveIntensity = nk * 1.2; glassC.emissiveIntensity = nk * .5 });
      solid(WX - 5, WX + 5, WZ - 3, WZ + 3); box(B.land, MT.stone, 0xd8d0c0, WX - 4, WX + 4, 0, .6, WZ - 4, WZ + 4);
      label(['SUN WHEEL', 'ASIA PARK · VÒNG QUAY MẶT TRỜI'], -108, 4, 140, Math.PI / 2, 7, 2.2, '#e8402a', '#ffffff', '#ffd84a');
      K.lanterns(ctx, [[-110, 3.5, 128], [-140, 4, 132], [-170, 3.5, 128], [-200, 4, 132], [-236, 3.5, 128]], { cols: [0xff4ad2, 0xffd84a, 0x3ad8ff, 0x7aff8a, 0xff8a3a], per: 16, sag: .5 });
      for (let k = 0; k < 6; k++) stall(B.land, -126 - k * 18, 170, Math.PI, STC[k]) }

    /* ======================= MỸ KHÊ BEACH ======================= */
    const bb = B.beach;
    /* beach-road median palms, promenade palms, lamps, benches, showers */
    const palms = []; for (let z = ZMIN + 4; z < ZMAX - 3; z += 11) { if (Math.abs(z) > 9) palms.push({ x: 205, y: .3, z, s: 2.1 + rng() * .5, ry: rng() * TAU }); palms.push({ x: 219.2, y: 0, z: z + 5, s: 2.3 + rng() * .7, ry: rng() * TAU }) }
    for (let z = ZMIN + 4; z < ZMAX - 4; z += 13) { if (Math.abs(z) < 7) continue; bb.add(MT.stone, BG.box, 0xd8d0c0, M(205, .15, z, 1.4, .3, 1.4)) }
    box(bb, MT.stone, 0xc8c0b0, 204.3, 205.7, 0, .18, ZMIN, -8); box(bb, MT.stone, 0xc8c0b0, 204.3, 205.7, 0, .18, 8, ZMAX);
    for (let z = ZMIN + 10; z < ZMAX - 5; z += 24) { bb.add(MT.shiny, A.geo('cyl6'), 0x3a4a4a, M(214.5, 2.6, z, .09, 5.2, .09)); B.night.add(MT.v, BG.sph, 0xfff0c8, M(214.5, 5.3, z, .3, .3, .3), 1); ctx.circles.push([214.5, z, .15]) }
    for (let z = ZMIN + 16; z < ZMAX - 5; z += 24) { box(bb, MT.wood, 0xb8865a, 216.3, 217.1, .42, .5, z - 1, z + 1); ctx.circles.push([216.7, z, .7]) }
    for (let z = -150; z < 170; z += 60) { bb.add(MT.shiny, A.geo('cyl6'), 0xc8ccd0, M(225, 1.3, z, .06, 2.6, .06)); bb.add(MT.shiny, BG.box, 0xc8ccd0, M(225.3, 2.55, z, .6, .05, .05)); box(bb, wallM, 0xd8e8f0, 228, 230.5, 0, 2.3, z + 3, z + 7); solid(228, 230.5, z + 3, z + 7) }
    /* thatched umbrellas + sunbeds, colourful umbrellas, beach goers' spots */
    const SUNBED = [];
    { const r = AV.rng(321); for (let z = ZMIN + 8; z < ZMAX - 6; z += 8.5) for (const x of [243, 255]) { if (inRect(SEAFOOD, x, z, 4) || inRect(BAR, x, z, 4) || Math.abs(z + 60) < 9 && x > 250) continue; if (r() < .18) continue; const y = bedY(x, z), thatch = r() < .6;
      bb.add(MT.wood, A.geo('cyl6'), 0x8a6a4a, M(x, y + 1.4, z, .08, 2.8, .08)); if (thatch) { bb.add(MT.dbl, A.geo('cone'), 0xc8a868, M(x, y + 2.95, z, 1.9, .9, 1.9)); bb.add(MT.dbl, A.geo('cone'), 0xb89858, M(x, y + 2.6, z, 2.05, .35, 2.05)) } else bb.add(MT.dbl, A.geo('halfDome'), [0x2a6ad8, 0xd83a3a, 0xe8c040, 0x3ab8a0, 0xffffff][r() * 5 | 0], M(x, y + 2.4, z, 1.8, .55, 1.8), .05);
      ctx.circles.push([x, z, .2]);
      for (const s of [-1, 1]) { const bx = x + .2, bz = z + s * .95, col = thatch ? 0xe8e4dc : 0x3a7ad8; bb.add(MT.v, BG.box, col, M(bx, y + .34, bz, 1.9, .08, .62)); bb.add(MT.v, BG.box, col, M(bx - .82, y + .58, bz, .5, .08, .62, 0, 0, -.9)); bb.add(MT.v, BG.box, 0x9a9a9a, M(bx, y + .16, bz, 1.7, .3, .5)); SUNBED.push([bx, y, bz]); ctx.circles.push([bx, bz, .5]) } } }
    /* lifeguard towers */
    const LG = [[266, -96], [266, 34], [266, 132]];
    LG.forEach(([x, z]) => { const y = bedY(x, z); for (const [dx, dz] of [[-.8, -.8], [.8, -.8], [-.8, .8], [.8, .8]]) bb.add(MT.wood, A.geo('cyl6'), 0xd8d0c0, M(x + dx, y + 1.5, z + dz, .08, 3, .08)); box(bb, MT.v, 0xd83a2a, x - 1.1, x + 1.1, y + 3, y + 3.9, z - 1.1, z + 1.1); box(bb, MT.v, 0xe8c83a, x - 1.12, x + 1.12, y + 3.35, y + 3.55, z - 1.12, z + 1.12);
      bb.add(MT.dbl, A.geo('hip'), 0xd83a2a, M(x, y + 4.9, z, 1.4, .7, 1.4)); for (let k = 0; k < 4; k++) bb.add(MT.wood, BG.box, 0xd8d0c0, M(x - 1.4 - k * .35, y + .4 + k * .75, z, .3, .06, .9)); bb.add(MT.v, A.geo('cyl6'), 0x8a8a8a, M(x + 1, y + 5.4, z + 1, .03, 2, .03)); bb.add(MT.dbl, BG.box, 0xd83a2a, M(x + 1.4, y + 6.1, z + 1, .8, .5, .02)); ctx.circles.push([x, z, 1.3]) });
    /* basket boats (thúng chai) on the sand */
    const basketGeo = K.merge([[BG.hem, 0x6a4a2a, M(0, .62, 0, 1.15, -.62, 1.15)], [new THREE.TorusGeometry(1.15, .07, 5, 24), 0x4a3018, M(0, .62, 0, 1, 1, 1, Math.PI / 2, 0, 0)], [BG.cyl, 0x2a3a6a, M(0, .62, 0, 1.1, .02, 1.1)]]);
    for (let i = 0; i < 9; i++) { const x = 280 + (i % 3) * 2.8 - (i / 3 | 0) * 1.2, z = -66 + (i / 3 | 0) * 2.9 + (i % 2) * .6; bb.add(MT.v, basketGeo, 0xffffff, M(x, bedY(x, z) - .02, z, 1, 1, 1, i % 4 === 0 ? 2.6 : 0, i * .7, 0)); ctx.circles.push([x, z, 1.1]) }
    /* volleyball, beach sign, buoy line */
    { const vx = 252, vz = 112, y = bedY(vx, vz); for (const s of [-1, 1]) bb.add(MT.shiny, A.geo('cyl6'), 0xd8d8d8, M(vx, y + 1.25, vz + s * 4.5, .05, 2.5, .05)); bb.add(MT.v, BG.box, 0xf0f0f0, M(vx, y + 2.1, vz, .02, .8, 9)); ctx.circles.push([vx, vz - 4.5, .2], [vx, vz + 4.5, .2]) }
    label(['BIỂN MỸ KHÊ', 'MY KHE BEACH · ĐÀ NẴNG'], 232, 2.3, -9, -Math.PI / 2 + .5, 5.6, 2, '#1a6aa8', '#ffffff', '#ffffff'); for (const s of [-1, 1]) bb.add(MT.v, A.geo('cyl6'), 0x3a3a3a, M(232 + Math.cos(-Math.PI / 2 + .5) * s * 2.4 * 0 - s * 1.1, 1, -9 + s * 2.4, .07, 2, .07));
    { const bl = []; for (let z = ZMIN + 4; z < ZMAX - 4; z += 3) bl.push({ x: 350 + Math.sin(z * .02) * 3, y: SWY + .1, z, s: 1, ry: 0 }); K.scatter(ctx, K.merge([[BG.sphL, 0xff7a1a, M(0, 0, 0, .25, .22, .25), .2]]), K.floraMat(0), bl, { shadow: false, cell: 90 }) }
    /* beach bar + seafood restaurant */
    { const b = bb, X = BAR; for (const [x, z] of [[X.x0, X.z0], [X.x1, X.z0], [X.x0, X.z1], [X.x1, X.z1]]) { b.add(MT.wood, A.geo('cyl6'), 0x8a6a4a, M(x, 1.6, z, .12, 3.2, .12)); ctx.circles.push([x, z, .2]) }
      b.add(MT.dbl, A.geo('hip'), 0xc8a868, M((X.x0 + X.x1) / 2, 3.9, (X.z0 + X.z1) / 2, (X.x1 - X.x0) * .8, 1.6, (X.z1 - X.z0) * .8)); box(b, MT.wood, 0x7a4a2a, X.x0 + 1, X.x0 + 2, .3, 1.35, X.z0 + 3, X.z1 - 3); ctx.cols.push([X.x0 + 1, X.x0 + 2, X.z0 + 3, X.z1 - 3]);
      for (let k = 0; k < 4; k++) { const x = X.x0 + 6 + (k % 2) * 5, z = X.z0 + 4.5 + (k >> 1) * 8; b.add(MT.wood, A.geo('cyl'), 0xc8a070, M(x, .9, z, .6, .06, .6)); b.add(MT.v, A.geo('cyl'), 0x3a3a3a, M(x, .45, z, .05, .9, .05)); for (const a of [0, 2.1, 4.2]) b.add(MT.v, A.geo('cyl'), 0x2a6ad8, M(x + Math.cos(a) * .8, .3, z + Math.sin(a) * .8, .2, .6, .2)); ctx.circles.push([x, z, .6]) }
      label(['MỸ KHÊ BEACH BAR', 'BIA LARUE · NƯỚC MÍA · DỪA'], X.x0 + .2, 2.6, (X.z0 + X.z1) / 2, -Math.PI / 2, 5, 1.2, '#1a6aa8', '#ffffff', null, false);
      K.lanterns(ctx, [[X.x0, 3.1, X.z0], [X.x1, 3.1, X.z0], [X.x1, 3.1, X.z1], [X.x0, 3.1, X.z1], [X.x0, 3.1, X.z0]], { cols: [0xffd890, 0xffb860], per: 12, sag: .25 });
      const S0 = SEAFOOD; for (let x = S0.x0; x <= S0.x1 + .1; x += 6) for (const z of [S0.z0, S0.z1]) { b.add(MT.shiny, A.geo('cyl'), 0x7a8a8a, M(x, 1.9, z, .15, 3.8, .15)); ctx.circles.push([x, z, .25]) }
      b.add(awnM, PRISM, 0x2a7ab8, M((S0.x0 + S0.x1) / 2, 3.8, (S0.z0 + S0.z1) / 2, S0.x1 - S0.x0 + 2, 2.2, S0.z1 - S0.z0 + 2, 0, Math.PI / 2, 0));
      for (let k = 0; k < 4; k++) { const z = S0.z0 + 3 + k * 5.5; box(b, MT.shiny, 0x7a8a8a, S0.x0 + .5, S0.x0 + 1.9, 0, .6, z - 2, z + 2); box(b, MT.v, 0x3aa8d8, S0.x0 + .6, S0.x0 + 1.8, .6, 1.6, z - 1.9, z + 1.9, .4); for (let f = 0; f < 5; f++) b.add(MT.v, BG.sph, [0xe8603a, 0xd83a2a, 0x8a9aa8][f % 3], M(S0.x0 + 1.2, .9 + (f % 2) * .35, z - 1.5 + f * .7, .18, .1, .28), .2); ctx.cols.push([S0.x0 + .5, S0.x0 + 1.9, z - 2, z + 2]) }
      for (let k = 0; k < 6; k++) stoolSet(b, S0.x0 + 8 + (k % 3) * 5, S0.z0 + 6 + (k / 3 | 0) * 11, 6);
      label(['HẢI SẢN BIỂN MỸ KHÊ', 'FRESH SEAFOOD · NHÀ HÀNG'], S0.x0 - .3, 3.3, (S0.z0 + S0.z1) / 2, -Math.PI / 2, 8, 1.6, '#e8402a', '#ffffff', '#ffd84a', false);
      const l = new THREE.PointLight(0xffd8a0, .9, 26); l.position.set(238, 3, 74); grp.add(l); const l2 = new THREE.PointLight(0xffc890, .8, 20); l2.position.set(234, 2.8, -37); grp.add(l2) }
    /* coconut cart + bánh mì carts */
    const cart = (b, x, z, col, txt) => { box(b, MT.shiny, col, x - .9, x + .9, .55, 1.35, z - .5, z + .5); box(b, MT.v, 0x9ad8ff, x - .85, x + .85, 1.35, 1.9, z - .45, z + .45, .3); for (const s of [-1, 1]) b.add(MT.v, A.geo('cyl'), 0x1a1a1a, M(x + s * .7, .28, z, .28, .1, .28, Math.PI / 2, 0, 0)); ctx.circles.push([x, z, 1]); if (txt) label([txt], x, 2.3, z - .52, Math.PI, 1.7, .45, '#f2c230', '#8a1a1a', null, false) };
    cart(bb, 212.6, -26, 0xe8e8e4, 'BÁNH MÌ'); cart(B.city, -62, -6, 0xe8e8e4, 'BÁNH MÌ'); cart(B.east, 22.5, 26, 0xe8e8e4, 'BÁNH MÌ');
    { const x = 236, z = 12; box(bb, MT.wood, 0x7a5a3a, x - 1, x + 1, 0, .9, z - .6, z + .6); for (let k = 0; k < 9; k++) bb.add(MT.v, BG.sph, 0x4a8a2a, M(x - .6 + (k % 3) * .6, 1.1 + (k / 9) * .2, z - .3 + (k / 3 | 0) * .3, .24, .26, .24)); bb.add(MT.dbl, A.geo('halfDome'), 0x2a9a5a, M(x, 2.6, z, 1.4, .4, 1.4)); bb.add(MT.v, A.geo('cyl6'), 0x8a8a8a, M(x, 1.7, z, .04, 1.8, .04)); ctx.circles.push([x, z, 1.1]) }
    /* palms (CC0 models when available, realistic procedural otherwise) */
    { const extra = []; for (let i = 0; i < [30, 60, 90][q]; i++) { const x = 226 + rng() * 52, z = ZMIN + 4 + rng() * (GD - 8); if (SUNBED.some(s => Math.hypot(s[0] - x, s[2] - z) < 3) || inRect(SEAFOOD, x, z, 3) || inRect(BAR, x, z, 3) || x > shoreX(z) - 14 || LG.some(([lx, lz]) => Math.hypot(lx - x, lz - z) < 4)) continue; extra.push({ x, y: bedY(x, z), z, s: 2 + rng() * 1.2, ry: rng() * TAU }) }
      const all = palms.concat(extra); all.forEach(p => ctx.circles.push([p.x, p.z, .35]));
      const palmFb = it => K.scatter(ctx, K.species.palm(0x8a6a4a, 0x2fa04a), K.floraMat(.01), it.map(o => Object.assign({}, o, { s: o.s * .55 })), { far: K.far(false), cell: 70 });
      ['palm_a', 'palm_b', 'palm_c'].forEach((k, j) => K.instModel(ctx, 'quaternius/' + k, all.filter((_, i) => i % 3 === j), palmFb, { sway: .004, far: K.far(false), cell: 70 }));
      K.scatter(ctx, K.species.grass(0x8aa04a), K.floraMat(.05), Array.from({ length: [40, 80, 120][q] }, () => { const z = ZMIN + 2 + rng() * (GD - 4), x = PROM + .5 + rng() * 6; return { x, y: bedY(x, z), z, s: 1 + rng(), ry: rng() * TAU } }), { shadow: false, cell: 60, far: K.far(true) }) }
    /* the Apeverse portal on the promenade */
    { const b = B.decor; for (const s of [-1, 1]) { box(b, MT.stone, 0x9a8a7a, PX - .4, PX + .4, 0, 4.6, PZ + s * 2.3 - .4, PZ + s * 2.3 + .4); ctx.circles.push([PX, PZ + s * 2.3, .5]) } }
    const portal = new THREE.Group(); portal.position.set(PX, 2.2, PZ); portal.rotation.y = Math.PI / 2; grp.add(portal);
    { const ring = new THREE.Mesh(new THREE.TorusGeometry(1.7, .14, 10, 40), new THREE.MeshBasicMaterial({ color: 0xb07aff })); portal.add(ring); const disc = new THREE.Mesh(new THREE.CircleGeometry(1.65, 40), new THREE.MeshBasicMaterial({ color: 0x7a3aff, transparent: true, opacity: .45, side: THREE.DoubleSide, depthWrite: false })); portal.add(disc);
      ctx.upd.push((dt, t) => { ring.rotation.z = t * .8; disc.material.opacity = .35 + Math.sin(t * 2) * .12; disc.material.color.setHSL((t * .05) % 1, .8, .5) }); ctx.circles.push([PX, PZ, .9]) }
    label(['APEVERSE PORTAL', 'CỔNG APEVERSE · E'], PX - .9, 5.3, PZ, -Math.PI / 2, 3.2, .8, '#2a1240', '#d8b0ff', '#b07aff', false);

    /* ---------- street trees + parked scooters on the sidewalks ---------- */
    { const trees = [], flame = [], r = AV.rng(99);
      for (const rd of ROADS) { const L = Math.hypot(rd[2] - rd[0], rd[3] - rd[1]), ux = (rd[2] - rd[0]) / L, uz = (rd[3] - rd[1]) / L; if (rd[0] >= 205 && rd[2] >= 205) continue;
        for (let s = 6 + r() * 6; s < L - 4; s += 13 + r() * 5) for (const sd of [-1, 1]) { const off = rd[4] / 2 + 1.25, x = rd[0] + ux * s - uz * off * sd, z = rd[1] + uz * s + ux * off * sd;
          if (roadDist(x, z) < .6 || occ.some(o => inRect(o, x, z, .6)) || RESERVED.some(rs => inRect(rs, x, z, 1)) || x > RIV0 - 3 && x < RIV1 + 3 || x > 212 || ctx.circles.some(c => Math.hypot(c[0] - x, c[1] - z) < 1.6)) continue;
          (r() < .25 ? flame : trees).push({ x, y: 0, z, s: .8 + r() * .35, ry: r() * TAU }); ctx.circles.push([x, z, .35]) } }
      for (let z = ZMIN + 8; z < ZMAX - 4; z += 9) { const x = -55.5 + (z % 2) * 0; if (BRIDGES.some(b => Math.abs(z - b.z) < b.w / 2 + 2) || Math.abs(z - 15.5) < 5) continue; trees.push({ x: -57.2, y: 0, z, s: 1, ry: r() * TAU }); ctx.circles.push([-57.2, z, .35]) }
      for (let i = 0; i < 26; i++) { const x = ASIA.x0 + 6 + r() * (ASIA.x1 - ASIA.x0 - 12), z = ASIA.z0 + 4 + r() * (ASIA.z1 - ASIA.z0 - 8); if (Math.hypot(x - WX, z - WZ) < 15 || z > 166) continue; (i % 3 ? trees : flame).push({ x, y: 0, z, s: 1 + r() * .4, ry: r() * TAU }); ctx.circles.push([x, z, .4]) }
      K.scatter(ctx, K.species.candyTree(0x5a4a3a, 0x3a7a34, 0x2f6a30, 0x4a8a3a), K.floraMat(.005), trees, { far: K.far(false), cell: 70 });
      K.scatter(ctx, K.species.candyTree(0x5a4a3a, 0xe8402a, 0x3a7a34, 0xf05a2a), K.floraMat(.005), flame, { far: K.far(false), cell: 70 });   // phượng vĩ (flame trees)
      const SCOC = [0x15171a, 0xf0f0ec, 0xb01e1e, 0x1f4e9a, 0x8a8e92, 0xe8c8c8, 0x2a2c30, 0xd84a7a, 0x3a8a6a], list = [], dens = [.35, .6, .85][q];
      for (const rd of ROADS) { if (rd[4] > 8 || rd[0] >= 205) continue; const L = Math.hypot(rd[2] - rd[0], rd[3] - rd[1]), ux = (rd[2] - rd[0]) / L, uz = (rd[3] - rd[1]) / L;
        for (const sd of [-1, 1]) { let s = 4; while (s < L - 4) { const n = 2 + (r() * 6 | 0), len = n * .8; if (r() < dens) { const off = rd[4] / 2 + 1.05, ok = []; for (let k = 0; k < n; k++) { const ss = s + k * .8, x = rd[0] + ux * ss - uz * off * sd, z = rd[1] + uz * ss + ux * off * sd; if (roadDist(x, z) < .5 || ctx.circles.some(c => Math.hypot(c[0] - x, c[1] - z) < 1.1) || occ.some(o => inRect(o, x, z, .3)) || x > RIV0 - 3 && x < RIV1 + 3) { ok.length = 0; break } ok.push([x, z]) }
              ok.forEach(([x, z]) => list.push({ type: r() < .93 ? 'scooter' : 'bicycle', x, z, yaw: Math.atan2(-uz * sd, ux * sd) * 0 + Math.atan2(uz * sd * -1 * -1, -ux * sd * -1) + (r() - .5) * .3, col: SCOC[r() * SCOC.length | 0], chunk: rd.join('') }));
              if (ok.length) { const xs = ok.map(p => p[0]), zs = ok.map(p => p[1]); ctx.cols.push([Math.min(...xs) - .5, Math.max(...xs) + .5, Math.min(...zs) - .5, Math.max(...zs) + .5]) } }
            s += len + 2 + r() * 8 } } }
      list.forEach(v => { const rd = null; v.yaw = v.yaw }); CY.parked(ctx, list) }

    /* ======================= LIFE: pedestrians, traffic, beach, boats, birds ======================= */
    const nodes = [], edges = [], NI = new Map(), nd = (x, z) => { const k = x.toFixed(1) + ',' + z.toFixed(1); if (!NI.has(k)) { NI.set(k, nodes.length); nodes.push([x, z]) } return NI.get(k) };
    const X = (v, h) => h[0] >= v[1] && h[0] <= v[2] && v[0] >= h[1] && v[0] <= h[2];
    const corner = (v, h, a, b) => nd(v[0] + a * (v[3] / 2 + 1.6), h[0] + b * (h[3] / 2 + 1.6));
    for (const v of VR) { const hs = HR.filter(h => X(v, h)).sort((p, o) => p[0] - o[0]); hs.forEach((h, j) => { const c = (a, b) => corner(v, h, a, b); edges.push([c(-1, -1), c(1, -1)], [c(1, -1), c(1, 1)], [c(1, 1), c(-1, 1)], [c(-1, 1), c(-1, -1)]); if (j + 1 < hs.length) for (const a of [-1, 1]) edges.push([c(a, 1), corner(v, hs[j + 1], a, -1)]) }) }
    for (const h of HR) { const vs = VR.filter(v => X(v, h)).sort((p, o) => p[0] - o[0]); for (let i = 0; i + 1 < vs.length; i++) for (const b of [-1, 1]) edges.push([corner(vs[i], h, 1, b), corner(vs[i + 1], h, -1, b)]) }
    for (const br of BRIDGES) { const hw = HR.find(h => h[0] === br.z && h[2] === -66), he = HR.find(h => h[0] === br.z && h[1] === 26); for (const b of [-1, 1]) edges.push([corner(VR[4], hw, 1, b), corner(VR[5], he, -1, b)]) }
    { let prev = null; for (let z = ZMIN + 6; z < ZMAX - 5; z += 12) { const id = nd(218.5, z); if (prev != null) edges.push([prev, id]); prev = id } for (const h of HR.filter(h => h[2] === 205)) edges.push([corner(VR[9], h, 1, 1), nd(218.5, ZMIN + 6 + Math.round((h[0] - ZMIN - 6) / 12) * 12)]) }
    { let prev = null; for (let z = ZMIN + 6; z < ZMAX - 5; z += 12) { const id = nd(-53.5, z); if (prev != null) edges.push([prev, id]); prev = id } }
    const NAV = CY.nav(nodes, edges), crowd = CY.crowd(ctx);
    for (let i = 0; i < [26, 44, 64][q]; i++) { const n0 = nodes[rng() * nodes.length | 0]; crowd.add({ v: ['man', 'woman', 'nonla', 'tourist', 'man', 'woman', 'vendor'][i % 7], x: n0[0], z: n0[1], nav: NAV, idleProb: .2 }) }
    /* beach life: strollers along the waterline, sun-bathers, swimmers, vendors */
    const beachFolk = [], SKIN = [0xf0c8a8, 0xe0b088, 0xd8a47a, 0xc8946a, 0xb07a50];
    for (let i = 0; i < [8, 14, 20][q]; i++) { const z0 = -160 + rng() * 300, z1 = z0 + (rng() < .5 ? -1 : 1) * (40 + rng() * 60), lane = -6 - rng() * 6; beachFolk.push(crowd.add({ v: i % 5 === 4 ? 'vendor' : i % 2 ? 'beach' : 'woman', x: shoreX(z0) + lane, z: z0, route: [[shoreX(z0) + lane, z0], [shoreX(z1) + lane, z1, 3, 'idle']], speed: .7 + rng() * .4 })) }
    beachFolk.forEach(w => { w.route.forEach(p => p[0] += 0); w.y = 0; w.beach = true });
    SUNBED.forEach((s, i) => { if (rng() > [.25, .4, .55][q]) return; const sk = SKIN[i % 5]; beachFolk.push(crowd.add({ v: 'beach', x: s[0] + .3, z: s[2], y: s[1] + .5, yaw: Math.PI / 2, mode: 'sit', cols: { skin: sk, hair: 0x14100c, shirt: rng() < .5 ? sk : [0xff8ad8, 0x4ac8ff, 0xffd84a, 0xffffff][i % 4], pants: [0x2a6ad8, 0xd83a3a, 0x1a1a1a, 0xe8c040][i % 4] } })) });
    const swimmers = []; for (let i = 0; i < [6, 10, 16][q]; i++) { const z = -150 + rng() * 300, x = shoreX(z) + 8 + rng() * 22, sk = SKIN[i % 5]; swimmers.push(crowd.add({ v: 'beach', x, z, y: Math.max(bedY(x, z), SWY - 1.2) - .25, yaw: -Math.PI / 2 + (rng() - .5), mode: i % 3 ? 'idle' : 'talk', cols: { skin: sk, hair: 0x14100c, shirt: sk, pants: 0x2a6ad8 } })) }
    for (let i = 0; i < 4; i++) { const z = -120 + i * 70; beachFolk.push(crowd.add({ v: 'vendor', x: 214, z, route: [[214, z], [214, z + 40, 4, 'idle'], [214, z]], speed: .6 })) }
    crowd.build();
    /* rigged locals with names (talk to them: E) */
    AV.beings.spawn(ctx, [[-52, 18, 'Cô Hoa · cà phê', 'idle', Math.PI / 2], [268.5, 33, 'Anh Tuấn · lifeguard', 'idle', -Math.PI / 2], [286, -60, 'Chú Bảy · basket boats', 'idle', -Math.PI / 2], [214, -24, 'Chị Lan · bánh mì', 'idle', -Math.PI / 2], [10, -31, 'Minh · student', 'wander'], [48, 30, 'Bé Mai · night market', 'wander'], [236, 70, 'Anh Long · seafood', 'idle', -Math.PI / 2], [-64, -85, 'Bà Sáu · Hàn Market', 'idle', Math.PI / 2], [240, 0, 'Backpacker Sam', 'wander']]
      .slice(0, AV.beings.n(ctx, 4, 7, 9)).map(([x, z, name, mode, yaw], i) => ({ kind: 'human', x, z, name, mode, yaw: yaw || 0, area: { x, z, r: 8 }, seed: 410 + i })));
    /* traffic: RIGHT-hand driving; rectangles run both ways (no U-turns), long avenues as two-way pairs */
    const loopsR = [[[-236, -110], [205, -110], [205, 0], [-236, 0]], [[-144, 0], [205, 0], [205, 120], [-144, 120]]], loops = [];
    loopsR.forEach(p => { loops.push({ pts: p, off: 2.6, w: 12 }, { pts: p.slice().reverse(), off: 2.6, w: 12 }) });
    loops.push({ pts: [[-66, -176], [-66, 176]], off: 2.6, w: 12 }, { pts: [[26, -176], [26, 176]], off: 2.4, w: 10 }, { pts: [[205, -176], [205, 176]], off: 3.3, w: 14 }, { pts: [[116, -176], [116, 176]], off: 2, w: 8 }, { pts: [[-190, -176], [-190, 116]], off: 2, w: 8 });
    const CARC = [0xf2f2f0, 0xf2f2f0, 0xe8e6e0, 0xb8bcc0, 0xa0a4a8, 0x15171a, 0x9a1a1a, 0x1f3e72, 0x1e8a4a, 0x1e8a4a, 0xf2f2f0];
    const SCC = [0x15171a, 0xf0f0ec, 0xb01e1e, 0x1f4e9a, 0x8a8e92, 0xe8c8c8, 0x2a2c30, 0xd84a7a, 0x1e8a4a, 0xe8c040];
    const traffic = CY.traffic(ctx, loops, [{ type: 'scooter', cols: SCC, n: [18, 34, 52][q], speed: 8 }, { type: 'car', cols: CARC, n: [5, 9, 13][q], speed: 8 }, { type: 'pickup', cols: CARC, n: [1, 2, 3][q], speed: 7 }, { type: 'bicycle', cols: [0x2a6ad8, 0x1a1a1a, 0xe8e8e0, 0x3a7a4a, 0xc83a3a], n: [2, 3, 5][q], speed: 3.5 }]);
    /* boats: fishing boats + floating basket boats (sea), river cruise boats with lights */
    const boatGeo = K.merge([[BG.box, 0x2a5aa8, M(0, .35, 0, 2.2, .9, 6.4)], [BG.box, 0xd83a2a, M(0, .62, 0, 2.24, .14, 6.44)], [A.geo('cone4'), 0x2a5aa8, M(0, .35, 3.6, 1.56, 1.4, .64, Math.PI / 2, Math.PI / 4, 0)], [BG.box, 0xe8e4dc, M(0, 1.3, -1.4, 1.6, 1.1, 2)], [BG.box, 0x2a6a3a, M(0, 1.9, -1.4, 1.8, .1, 2.3)], [A.geo('cyl6'), 0x6a4a2a, M(0, 2.8, 1, .06, 4, .06)], [BG.sph, 0xffffff, M(.9, .55, 2.9, .12, .12, .06)], [BG.sph, 0xffffff, M(-.9, .55, 2.9, .12, .12, .06)], [BG.sph, 0xfff0c0, M(0, 4.85, 1, .15, .15, .15), 1]]);
    const seaBoats = new THREE.InstancedMesh(boatGeo, K.floraMat(0, { rough: .6 }), 12), floatBaskets = new THREE.InstancedMesh(basketGeo, K.floraMat(0, { rough: .9 }), 8), BOATS = [], BASK = [];
    for (let i = 0; i < 12; i++) BOATS.push({ x: 330 + rng() * 260, z: -170 + rng() * 360, ry: rng() * TAU, ph: rng() * 9 }); for (let i = 0; i < 8; i++) { const z = -90 + rng() * 70; BASK.push({ x: shoreX(z) + 14 + rng() * 30, z, ry: 0, ph: rng() * 9, spin: rng() < .3 ? .6 : .05 }) }
    for (const im of [seaBoats, floatBaskets]) { im.frustumCulled = false; im.castShadow = hi; grp.add(im) }
    const cruiseGeo = K.merge([[BG.box, 0xf4f0e8, M(0, .4, 0, 3.4, 1, 13)], [BG.box, 0xc8302a, M(0, .85, 0, 3.44, .18, 13.04)], [A.geo('cone4'), 0xf4f0e8, M(0, .4, 7.2, 2.4, 1.4, 1, Math.PI / 2, Math.PI / 4, 0)], [BG.box, 0xe8c040, M(0, 1.55, -.8, 2.8, 1.3, 9)], [BG.box, 0xfff0c8, M(0, 1.6, -.8, 2.86, .6, 8.6), 1], [BG.box, 0xc8302a, M(0, 2.3, -.8, 3.2, .12, 9.6)], [BG.sph, 0xff3a3a, M(1.5, 2.6, 2.6, .2, .25, .2), 1], [BG.sph, 0xff3a3a, M(-1.5, 2.6, 2.6, .2, .25, .2), 1], [BG.sph, 0xffd84a, M(1.5, 2.6, -4, .2, .25, .2), 1], [BG.sph, 0xffd84a, M(-1.5, 2.6, -4, .2, .25, .2), 1]]);
    const cruise = new THREE.InstancedMesh(cruiseGeo, K.floraMat(0, { rough: .5 }), 3); cruise.frustumCulled = false; grp.add(cruise);
    const CR = [0, 1, 2].map(i => ({ s: i * 260 })), RL = 340, RRAD = 9, loopLen = 2 * RL + 2 * Math.PI * RRAD;
    const crAt = s => { s = ((s % loopLen) + loopLen) % loopLen; const xc = -16; if (s < RL) return [xc - RRAD, -RL / 2 + s, 0]; s -= RL; if (s < Math.PI * RRAD) { const a = s / RRAD; return [xc - Math.cos(a) * RRAD, RL / 2 + Math.sin(a) * RRAD, a] } s -= Math.PI * RRAD; if (s < RL) return [xc + RRAD, RL / 2 - s, Math.PI]; s -= RL; const a = s / RRAD; return [xc + Math.cos(a) * RRAD, -RL / 2 - Math.sin(a) * RRAD, Math.PI + a] };
    const _m4 = new THREE.Matrix4(), _q4 = new THREE.Quaternion(), _e4 = new THREE.Euler(), _v4 = new THREE.Vector3(), _s4 = new THREE.Vector3(1, 1, 1);
    ctx.upd.push((dt, t) => {
      BOATS.forEach((b, i) => { _q4.setFromEuler(_e4.set(Math.sin(t * .9 + b.ph) * .05, b.ry + Math.sin(t * .1 + b.ph) * .2, Math.sin(t * 1.1 + b.ph) * .06)); seaBoats.setMatrixAt(i, _m4.compose(_v4.set(b.x, SWY - .3 + Math.sin(t * 1.2 + b.ph) * .15, b.z), _q4, _s4)) }); seaBoats.instanceMatrix.needsUpdate = true;
      BASK.forEach((b, i) => { b.ry += b.spin * dt; _q4.setFromEuler(_e4.set(Math.sin(t * 1.3 + b.ph) * .08, b.ry, Math.cos(t * 1.1 + b.ph) * .08)); floatBaskets.setMatrixAt(i, _m4.compose(_v4.set(b.x, SWY - .55 + Math.sin(t * 1.6 + b.ph) * .1, b.z), _q4, _s4)) }); floatBaskets.instanceMatrix.needsUpdate = true;
      CR.forEach((c, i) => { c.s += 2.2 * dt; const [x, z, a] = crAt(c.s); _q4.setFromAxisAngle(_v4.set(0, 1, 0), a); cruise.setMatrixAt(i, _m4.compose(_v4.set(x, RWY - .35 + Math.sin(t + i) * .03, z), _q4, _s4)) }); cruise.instanceMatrix.needsUpdate = true });
    CY.birds(ctx, [{ x: 300, z: -40, r: 30, y: 14, n: 9 }, { x: 320, z: 80, r: 40, y: 18, n: 8 }, { x: -16, z: -60, r: 30, y: 16, n: 6 }, { x: 290, z: 140, r: 24, y: 12, n: 6 }]);
    const smoke = CY.smoke(ctx, 60, { color: 0xe8e8e8, opacity: .3 }), rainFx = CY.rain(ctx);
    ctx.upd.push((() => { let acc = 0; return dt => { acc += dt; if (acc < .5) return; acc = 0; if (!nightMarketOpen()) return; const st = nmStalls[Math.random() * nmStalls.length | 0]; if (st && Math.hypot(AV.P.x - st.x, AV.P.z - st.z) < 50) smoke.puff(st.x, 1.6, st.z) } })());

    /* ======================= interactions ======================= */
    const buy = (cost, what, msg, item, bucket) => { if (!AV.txn(-cost, what)) return false; if (item) { if (AV.bag) AV.bag.add(item, 1, true); else S.items[item] = (S.items[item] || 0) + 1; msg += tr(' → backpack (I)', ' → mochila (I)') } AV.toast(msg); AV.audio && AV.audio.blip(660, .15, 'triangle', .12); if (bucket) done(bucket); return true };
    T(-53.6, 15.5, 2.4, () => tr('Cà Phê Sông Hàn: cà phê sữa đá (25)', 'Cà Phê Sông Hàn: café con leche helado (25)'), () => buy(25, 'Cà phê sữa đá', tr('Thick drip coffee over condensed milk and ice. Your heart starts tapping a beat.', 'Café de goteo espeso sobre leche condensada y hielo. Tu corazón empieza a marcar el ritmo.'), 'ca_phe_sua_da', 'coffee'));
    for (const [x, z] of [[212.6, -24.8], [-62, -4.8], [22.5, 27.2]]) T(x, z, 2, () => tr('Bánh mì cart: bánh mì thịt (20)', 'Carrito de bánh mì: bocadillo vietnamita (20)'), () => buy(20, 'Bánh mì', tr('Crackling baguette, pâté, pork, pickles, chilli, coriander. Best 20 credits you ever spent.', 'Baguette crujiente, paté, cerdo, encurtidos, chile y cilantro. Los mejores 20 créditos de tu vida.'), 'banh_mi', 'banhmi'));
    T(236, 13.4, 2.2, () => tr('Fresh coconut (20)', 'Coco fresco (20)'), () => buy(20, 'Coconut', tr('Machete, straw, done. Ice-cold coconut water on the sand.', 'Machete, pajita y listo. Agua de coco helada en la arena.'), 'coconut'));
    T(BAR.x0 + 2.4, (BAR.z0 + BAR.z1) / 2, 2.6, () => tr('Beach bar: Bia Larue (25) · nước mía next to it', 'Bar de playa: cerveza Larue (25) · nước mía al lado'), () => buy(25, 'Bia Larue', tr('Cold Larue with ice in the glass, the way Da Nang drinks it. Một, hai, ba, dzô!', 'Larue fría con hielo en el vaso, como se bebe en Da Nang. ¡Một, hai, ba, dzô!'), 'beer_larue'));
    T(BAR.x0 + 2.4, BAR.z0 + 2.5, 2, () => tr('Nước mía: fresh sugarcane juice (15)', 'Nước mía: zumo de caña de azúcar (15)'), () => buy(15, 'Nước mía', tr('Pressed in front of you with a little kumquat. Sweet, green, cold.', 'Prensado delante de ti con un poco de kumquat. Dulce, verde y frío.'), 'nuoc_mia'));
    T(SEAFOOD.x0 + 3, (SEAFOOD.z0 + SEAFOOD.z1) / 2, 3, () => tr('Seafood restaurant: grilled seafood platter (90)', 'Marisquería: parrillada de marisco (90)'), () => buy(90, 'Seafood platter', tr('You point at the tanks: squid, prawns, scallops with scallion oil. Grilled at the table. The sea breeze does the rest.', 'Señalas las peceras: calamar, gambas, vieiras con aceite de cebolleta. A la parrilla en la mesa. La brisa hace el resto.'), 'seafood'));
    const nmT = (i, en, es, cost, item, msg) => { const st = nmStalls[i % Math.max(1, nmStalls.length)]; if (!st) return; T(st.x - Math.sin(st.ry) * 1.3, st.z - Math.cos(st.ry) * 1.3, 2.2, () => nightMarketOpen() ? tr(en, es) + ' (' + cost + ')' : tr('Night market (opens 17:00)', 'Mercado nocturno (abre a las 17:00)'), () => nightMarketOpen() ? buy(cost, en, msg, item) : AV.toast(tr('The stalls are still covered. Come back after 17:00.', 'Los puestos siguen tapados. Vuelve después de las 17:00.'))) };
    nmT(0, 'Night market: grilled squid', 'Mercado nocturno: calamar a la brasa', 35, 'grilled_squid', tr('Charcoal squid with chilli-lime salt. The smoke follows you for an hour.', 'Calamar al carbón con sal de lima y chile. El humo te sigue una hora.'));
    nmT(3, 'Night market: bánh tráng nướng', 'Mercado nocturno: bánh tráng nướng', 25, 'banh_trang_nuong', tr('“Vietnamese pizza”: rice paper, egg, scallion, crispy everything.', '“Pizza vietnamita”: papel de arroz, huevo, cebolleta, todo crujiente.'));
    nmT(6, 'Night market: chè (sweet soup)', 'Mercado nocturno: chè (sopa dulce)', 20, 'che', tr('Beans, jelly, coconut milk and crushed ice. Dessert you drink with a spoon.', 'Judías, gelatina, leche de coco y hielo picado. Postre que se bebe con cuchara.'));
    const dayT = (st, en, es, cost, item, msg, open) => { if (!st) return; T(st.x - Math.sin(st.ry) * 1.3, st.z - Math.cos(st.ry) * 1.3, 2.2, () => open() ? tr(en[0], es[0]) + ' (' + cost + ')' : tr(en[1], es[1]), () => open() ? buy(cost, en[0], msg, item) : AV.toast(tr(en[1], es[1]))) };
    const hanSt = dayStalls.filter(s => inRect(HANM, s.x, s.z)), conSt = dayStalls.filter(s => inRect(CONM, s.x, s.z, 1));
    dayT(hanSt[0], ['Hàn Market: nón lá conical hat', 'Hàn Market (06:00–19:00)'], ['Mercado Hàn: sombrero nón lá', 'Mercado Hàn (06:00–19:00)'], 50, 'non_la', tr('Palm-leaf conical hat. Instantly 10° cooler and 100% more photogenic.', 'Sombrero cónico de hoja de palma. 10° más fresco y un 100% más fotogénico.'), hanOpen);
    dayT(hanSt[5], ['Hàn Market: Vietnamese coffee beans', 'Hàn Market (06:00–19:00)'], ['Mercado Hàn: café vietnamita en grano', 'Mercado Hàn (06:00–19:00)'], 60, 'coffee_beans', tr('A bag of dark robusta and a tiny aluminium phin filter. The aunt throws in a free sample.', 'Una bolsa de robusta oscuro y un filtro phin de aluminio. La señora te regala una muestra.'), hanOpen);
    dayT(conSt[1], ['Cồn Market: bánh xèo', 'Cồn Market (06:00–21:00)'], ['Mercado Cồn: bánh xèo', 'Mercado Cồn (06:00–21:00)'], 30, 'banh_xeo', tr('Sizzling turmeric crêpe with prawns and bean sprouts, rolled in herbs and rice paper.', 'Crep de cúrcuma chisporroteante con gambas y brotes de soja, enrollado en hierbas y papel de arroz.'), conOpen);
    dayT(conSt[6], ['Cồn Market: mì Quảng', 'Cồn Market (06:00–21:00)'], ['Mercado Cồn: mì Quảng', 'Mercado Cồn (06:00–21:00)'], 35, 'mi_quang', tr('Flat turmeric noodles, a little rich broth, peanuts and a rice cracker on top. Pure Quảng Nam.', 'Fideos planos de cúrcuma, un poco de caldo intenso, cacahuetes y una galleta de arroz encima. Puro Quảng Nam.'), conOpen);
    T(-99.5, -31, 3, () => tr('Da Nang Cathedral: step inside', 'Catedral de Da Nang: entrar'), () => { done('cathedral'); AV.toast(tr('Cool air, pink light through the stained glass. Locals call it the Rooster Church for the weathervane on the spire.', 'Aire fresco y luz rosa por las vidrieras. Los vecinos la llaman la Iglesia del Gallo por la veleta de la aguja.')); if (AV.audio) [0, .5, 1].forEach((o, k) => setTimeout(() => AV.audio.blip([523, 659, 784][k], 1.6, 'sine', .07), o * 1000)) });
    T(-3, -31, 3, () => tr('Love Pier: lock a padlock (10)', 'Muelle del Amor: cerrar un candado (10)'), () => { if (!AV.txn(-10, 'Love lock')) return; S.dn.locks = (S.dn.locks || 0) + 1; B.decor; const m = new THREE.Mesh(AV.G.box, AV.std(0xe8c040, .3, .8)); m.scale.set(.1, .14, .06); m.position.set(AV.P.x, .75, AV.P.z < -31 ? PIER.z0 + .2 : PIER.z1 - .2); grp.add(m); done('love'); AV.toast(tr('Click. The key goes into the Hàn River, like everyone else’s. The carp-dragon approves.', 'Clic. La llave va al río Hàn, como la de todos. El carpa-dragón lo aprueba.')) });
    const showT = (x, z) => T(x, z, 4, () => showOn() ? tr('The Dragon Bridge show is on! (watch the head)', '¡Está el espectáculo del Puente del Dragón! (mira la cabeza)') : tr('Dragon Bridge: wait for the 21:00 fire & water show', 'Puente del Dragón: esperar al espectáculo de fuego y agua de las 21:00'), () => { if (showOn()) return AV.toast(tr('Fire first, then water. Stand back — people in front get soaked!', 'Primero fuego, luego agua. ¡Atrás, que los de delante se empapan!')); AV.fadeTo(1, 500); setTimeout(() => { const h = hourNow(); if (h > 21) S.day++; S.time = 20 * 60 + 58; AV.hud(); AV.fadeTo(0, 700); AV.toast(tr('20:58. The crowd gathers on the bridge. Phones up…', '20:58. La gente se reúne en el puente. Móviles arriba…')) }, 520) });
    showT(23, 14); showT(-52, -12);
    /* basket boat spin (thúng chai) */
    let basketRide = null; const basketMesh = new THREE.Mesh(basketGeo, K.floraMat(0, { rough: .9 })); basketMesh.visible = false; grp.add(basketMesh);
    T(284, -62, 3, () => tr('Thúng chai: basket boat spin with Chú Bảy (60)', 'Thúng chai: giro en barca-cesta con Chú Bảy (60)'), () => { if (basketRide || !AV.txn(-60, 'Basket boat ride')) return; AV.fadeTo(1, 400); setTimeout(() => { basketRide = { t: 0, x: shoreX(-62) + 18, z: -62, back: [AV.P.x, AV.P.z] }; basketMesh.visible = true; AV.fadeTo(0, 500); AV.toast(tr('Chú Bảy rocks the basket and spins it like a top! Hold on! (E to stop)', '¡Chú Bảy mece la cesta y la hace girar como una peonza! ¡Agárrate! (E para parar)')) }, 420) });
    const endBasket = () => { if (!basketRide) return; const b = basketRide; basketRide = null; basketMesh.visible = false; AV.fadeTo(1, 300); setTimeout(() => { AV.P.x = b.back[0]; AV.P.z = b.back[1]; AV.P.y = 0; AV.fadeTo(0, 500); done('basket'); AV.toast(tr('Dizzy, soaked and grinning. Chú Bảy laughs: “Vui không?” (Fun?)', 'Mareado, empapado y sonriendo. Chú Bảy se ríe: “Vui không?” (¿Divertido?)')) }, 320) };
    const basketT = T(0, 0, 6, () => tr('Stop the spin', 'Parar el giro'), endBasket, () => !!basketRide);
    ctx.upd.push((dt, t) => { if (!basketRide) return; const b = basketRide; b.t += dt; const sp = b.t < 2 ? b.t * 1.5 : b.t < 9 ? 3.2 + Math.sin(b.t * 2) * .6 : Math.max(0, 3.2 - (b.t - 9) * 1.5), P = AV.P; b.ry = (b.ry || 0) + sp * dt;
      basketMesh.position.set(b.x, SWY - .55 + Math.sin(t * 5) * .08, b.z); basketMesh.rotation.set(Math.sin(t * 4) * .15, b.ry, Math.cos(t * 3.4) * .15); P.x = b.x; P.z = b.z; P.y = SWY - .4; P.vx = P.vz = P.vy = 0; P.yaw += sp * dt; AV.cam.position.set(b.x, SWY + .55 + Math.sin(t * 5) * .08, b.z); basketT.x = P.x; basketT.z = P.z;
      if (Math.random() < .06 && AV.audio) AV.audio.blip(300 + Math.random() * 200, .1, 'sine', .04); if (b.t > 11) endBasket() });
    /* sunbed rest */
    T(255, -10, 3, () => tr('Rent a sunbed + umbrella for an hour (30)', 'Alquilar hamaca + sombrilla una hora (30)'), () => { if (!AV.txn(-30, 'Sunbed')) return; AV.fadeTo(1, 600); setTimeout(() => { S.time += 60; AV.vitals && AV.vitals.add(15, 12); AV.hud(); AV.fadeTo(0, 900); AV.toast(tr('An hour of waves, wind in the casuarinas and a vendor offering you grilled corn. Bliss.', 'Una hora de olas, viento y una vendedora ofreciéndote maíz asado. Gloria.')) }, 650) });
    /* Sun Wheel ride */
    let wheelRide = null;
    T(WX + 9, WZ, 4, () => tr('Sun Wheel: ride one full turn (50)', 'Sun Wheel: dar una vuelta completa (50)'), () => { if (wheelRide || !AV.txn(-50, 'Sun Wheel')) return; let best = 0, by = 1e9; const v = new THREE.Vector3(); cabins.forEach((c, i) => { c.getWorldPosition(v); if (v.y < by) { by = v.y; best = i } }); wheelRide = { c: cabins[best], a0: spin.rotation.z }; AV.toast(tr('You climb into a glass cabin. Da Nang slowly rises around you… (E to get off)', 'Subes a una cabina de cristal. Da Nang se eleva despacio a tu alrededor… (E para bajar)')) });
    const wheelT = T(0, 0, 8, () => tr('Get off the Sun Wheel', 'Bajar del Sun Wheel'), () => endWheel(), () => !!wheelRide);
    const endWheel = () => { if (!wheelRide) return; const full = Math.abs(spin.rotation.z - wheelRide.a0) > TAU * .9; wheelRide = null; const P = AV.P, sp = AV.safeSpot(AV.W, WX + 9, WZ); P.x = sp[0]; P.z = sp[1]; P.y = 0; P.vx = P.vz = P.vy = 0; if (full) done('wheel'); AV.toast(full ? tr('One full turn: the river, the bridges, the beach and the mountains in one look.', 'Una vuelta completa: el río, los puentes, la playa y las montañas de un vistazo.') : tr('You hop off early.', 'Te bajas antes de tiempo.')) };
    ctx.upd.push(() => { if (!wheelRide) return; const v = new THREE.Vector3(); wheelRide.c.getWorldPosition(v); const P = AV.P; P.x = v.x; P.z = v.z; P.y = v.y - 3.3; P.vx = P.vz = P.vy = 0; AV.cam.position.set(v.x, v.y - 1.4, v.z); wheelT.x = v.x; wheelT.z = v.z; if (Math.abs(spin.rotation.z - wheelRide.a0) > TAU) { done('wheel'); endWheel() } });
    /* portal */
    T(PX - 1.2, PZ, 2.6, () => tr('Apeverse Portal: travel to another world', 'Portal Apeverse: viajar a otro mundo'), () => { const ws = Object.keys(AV.worldDefs).filter(id => id !== 'da_nang');
      const p = AV.panel('cmp', '<b>' + tr('Apeverse Portal', 'Portal Apeverse') + '</b><div class="grid">' + ws.map(id => '<button data-w="' + id + '">' + ((AV.worldMeta(id) || {}).name || id) + '</button>').join('') + '</div><div class="note">' + tr('The Portal Pipe (P) works here too.', 'La Pipa-Portal (P) también funciona aquí.') + '</div><button data-close>' + tr('Close', 'Cerrar') + '</button>');
      p.querySelectorAll('[data-w]').forEach(b => b.onclick = () => { AV.closePanel('cmp'); AV.audio && AV.audio.whoosh(); AV.travel(b.dataset.w, 'da_nang') }) });

    /* ======================= bucket list (F) ======================= */
    const LIST = [['dragon', 'Watch the Dragon Bridge breathe fire (21:00)', 'Ver al Puente del Dragón escupir fuego (21:00)'], ['love', 'Lock a padlock on the Love Pier', 'Cerrar un candado en el Muelle del Amor'], ['swim', 'Swim at My Khe Beach', 'Nadar en la playa My Khe'],
      ['basket', 'Spin in a thúng chai basket boat', 'Girar en una barca-cesta thúng chai'], ['coffee', 'Cà phê sữa đá by the Hàn River', 'Cà phê sữa đá junto al río Hàn'], ['banhmi', 'Eat a bánh mì from a street cart', 'Comer un bánh mì de un carrito'], ['wheel', 'Ride the Sun Wheel', 'Subir al Sun Wheel'],
      ['sunrise', 'Watch the sunrise over the sea (05:00–06:30)', 'Ver el amanecer sobre el mar (05:00–06:30)'], ['cathedral', 'Visit the pink Rooster Church', 'Visitar la Iglesia del Gallo rosa']];
    function done(k) { const D = S.dn.done; if (D[k]) return; D[k] = 1; const it = LIST.find(l => l[0] === k), n = LIST.filter(l => D[l[0]]).length; AV.toast('✔ ' + tr(it[1], it[2]) + ' · ' + tr('Da Nang bucket list ', 'Lista de Da Nang ') + n + '/' + LIST.length); AV.audio && AV.audio.blip(880, .25, 'triangle', .12);
      if (n === LIST.length && !S.dn.reward) { S.dn.reward = 1; AV.txn(150, 'Da Nang bucket list complete'); setTimeout(() => AV.toast(tr('Bucket list complete! +150 credits. Da Nang says: hẹn gặp lại — see you again!', '¡Lista completa! +150 créditos. Da Nang dice: hẹn gặp lại — ¡hasta pronto!')), 2200) } AV.save() }
    AV.dn.listPanel = () => { const D = S.dn.done; AV.panel('cmp', '<b>' + tr('Da Nang bucket list', 'Lista de deseos de Da Nang') + '</b><div class="note">' + tr('Do all nine for a 150-credit reward. Places: Portal Pipe (P) lists them for quick hops.', 'Haz las nueve para ganar 150 créditos. La Pipa-Portal (P) tiene saltos rápidos a cada lugar.') + '</div>' + LIST.map(l => '<div style="margin:6px 0">' + (D[l[0]] ? '✔ ' : '○ ') + tr(l[1], l[2]) + '</div>').join('') + '<button data-close>' + tr('Close', 'Cerrar') + '</button>') };
    { const fb = AV.$('tF'); if (fb) { const old = fb.textContent; fb.textContent = tr('List', 'Lista'); fb.style.display = AV.device === 'phone' ? 'block' : 'none'; ctx.leave.push(() => { fb.textContent = old; fb.style.display = 'none' }) } }

    /* ======================= time of day, weather, swimming, HUD ======================= */
    const gO = goodsOpen.flush(ctx, { noShadow: true }), gC = goodsClosed.flush(ctx, { noShadow: true });
    const hudEl = AV.$('cmhud'); let hudT = 0, lastHour = -1, splashT = 0;
    ctx.upd.push((dt, t) => {
      const h = hourNow(), hi2 = Math.floor(h), P = AV.P, nm = nightMarketOpen();
      gO.forEach(m => m.visible = true); gC.forEach(m => m.visible = !nm);
      beachFolk.forEach(w => w.vis = h >= 5 && h < 19.5); swimmers.forEach(w => w.vis = h >= 5 && h < 18.5);
      if (hi2 !== lastHour) { if (lastHour >= 0) { if (hi2 === 17) AV.toast(tr('Sơn Trà night market is opening — grills on!', 'Abre el mercado nocturno de Sơn Trà: ¡parrillas encendidas!')); if (hi2 === 5) AV.toast(tr('Dawn. Half of Da Nang is already swimming or doing tai chi on My Khe beach.', 'Amanece. Medio Da Nang ya nada o hace taichí en la playa My Khe.')); if (hi2 % 3 === 0) rollWeather() } lastHour = hi2 }
      /* swimming */
      const depth = P.x > PROM ? SWY - bedY(P.x, P.z) : 0, swim = depth > 1.45 - .02 && !basketRide && !wheelRide;
      if (P.x > PROM && depth > .9) done('swim');
      if (swim) { AV.cam.position.y = SWY + .25 + Math.sin(t * 1.7) * .07; if ((splashT -= dt) < 0 && Math.hypot(P.vx, P.vz) > .5) { splashT = .9; AV.audio && AV.audio.blip(180 + Math.random() * 80, .2, 'sine', .04) } }
      if (h >= 5 && h < 6.6 && P.x > PROM - 12 && !lo + 1) done('sunrise');
      if (hudEl && AV.now() > hudT) { hudT = AV.now() + .4; const n = LIST.filter(l => S.dn.done[l[0]]).length, w = { clear: '☀', cloudy: '☁', rain: '🌧' }[S.dn.weather] || ''; hudEl.style.display = 'block'; hudEl.textContent = 'Đà Nẵng ' + w + (swim ? tr(' · swimming', ' · nadando') : '') + (showOn() ? tr(' · 🐉 dragon show!', ' · 🐉 ¡espectáculo del dragón!') : '') + ' · ' + tr('bucket list ', 'lista ') + n + '/' + LIST.length + ' · F' }
    });
    function rollWeather() { const r = Math.random(); S.dn.weather = r < .7 ? 'clear' : r < .88 ? 'cloudy' : 'rain'; applyWeather(); if (S.dn.weather === 'rain') AV.toast(tr('A warm tropical downpour sweeps in from the sea. Scooters sprout ponchos.', 'Un chaparrón tropical llega del mar. Las motos se llenan de chubasqueros.')) }
    function applyWeather() { const w = S.dn.weather; rainFx.on = w === 'rain'; SKY.tint = w === 'rain' ? [0x5a6a7a, 0x7a8a8a, .55, .6] : w === 'cloudy' ? [0x9aa8b8, 0xb8c0c8, .3, .3] : [0xfff2dc, 0xdceeff, .05, .1]; SKY.dome.cloud = w === 'clear' ? .55 : 1.15; seaNear.uniforms.uAmp.value = w === 'rain' ? 1.6 : 1; if (AV.W && AV.W.sky === SKY) { AV.scene.fog.near = w === 'rain' ? 40 : 80; AV.scene.fog.far = w === 'rain' ? 260 : 460 } }
    ctx.upd.push((() => { let once = false; return () => { if (!once) { once = true; applyWeather() } } })());
    ctx.leave.push(() => { if (hudEl) hudEl.style.display = 'none'; basketRide = null; wheelRide = null; MDreset() });
    const MDreset = () => { if (AV.media && AV.media.resetFrames) AV.media.resetFrames() };

    /* ---------- flush ---------- */
    B.night.flush(ctx, { noShadow: true }); delete B.night; B.sky.flush(ctx, { noShadow: true }); delete B.sky; for (const k in B) B[k].flush(ctx);

    const here = AV.dn.lastPos || null; AV.dn.lastPos = null;
    const PL = (id, en, es, x, z, yaw) => ({ id, name: [en, es], x, z, yaw });
    return {
      name: 'Đà Nẵng', fog: [80, 460], sky: SKY,
      surface: (x, z) => { if (x < XMIN + 2 || x > XMAX - 2 || z < ZMIN + 2 || z > ZMAX - 2) return null; const b = walk.bridgeAt(x, z); if (b !== undefined) return b; if (x > RIV0 && x < RIV1) return null;
        if (x >= PROM) return Math.max(bedY(x, z), SWY - 1.45); const p = walk.at(x, z); return p === undefined ? 0 : Math.max(0, p) },
      speedMul: () => { const P = AV.P; return P.x > PROM && SWY - bedY(P.x, P.z) > .7 ? .55 : 1 },
      arrivals: { default: { x: 218, z: 6, yaw: -Math.PI / 2 }, pipe: { x: 219, z: 2, yaw: -Math.PI / 2 }, ape_gate: { x: PX + 1.5, z: PZ + 4, yaw: -Math.PI / 2 }, here: here || { x: 218, z: 6, yaw: -Math.PI / 2 } },
      defaultArrival: 'default',
      places: [PL('beach', 'My Khe Beach', 'Playa My Khe', 218, 6, -Math.PI / 2), PL('dragon', 'Dragon Bridge (east end)', 'Puente del Dragón (lado este)', 24, 16, Math.PI / 2), PL('love', 'Love Pier & Carp-Dragon', 'Muelle del Amor y Carpa-Dragón', 19, -31, Math.PI / 2),
        PL('han', 'Hàn Market', 'Mercado Hàn', -62, -85, Math.PI / 2), PL('cathedral', 'Da Nang Cathedral', 'Catedral de Da Nang', -104, -31, -Math.PI / 2), PL('night', 'Sơn Trà night market', 'Mercado nocturno de Sơn Trà', 48, 3, Math.PI),
        PL('wheel', 'Sun Wheel · Asia Park', 'Sun Wheel · Asia Park', -158, 152, Math.PI / 2), PL('con', 'Cồn Market', 'Mercado Cồn', -167, 1, Math.PI), PL('cafe', 'Bạch Đằng riverside café', 'Café del paseo Bạch Đằng', -50, 22, Math.PI / 2)],
      greet: { human: [['Xin chào! First time in Đà Nẵng?', '¡Xin chào! ¿Primera vez en Đà Nẵng?'], ['Chào bạn! You came at the perfect time — the sea is calm.', '¡Chào bạn! Llegas en el momento perfecto: el mar está en calma.'], ['Hello! Nice fur. Very beach-ready.', '¡Hola! Buen pelo. Muy de playa.']] },
      chatLines: [['Saturday and Sunday at nine, the Dragon Bridge breathes fire. Here it does it every night, lucky you.', 'Sábados y domingos a las nueve el Puente del Dragón escupe fuego. Aquí lo hace cada noche, qué suerte.'], ['My Khe at 5 a.m. is the real Da Nang: swimming, tai chi, badminton, old men doing push-ups.', 'My Khe a las 5 de la mañana es el Da Nang de verdad: natación, taichí, bádminton, señores haciendo flexiones.'],
        ['Try mì Quảng at Cồn Market. Not too much broth — that’s the rule.', 'Prueba el mì Quảng en el mercado Cồn. No mucho caldo, esa es la regla.'], ['The Lady Buddha on Sơn Trà watches over the fishermen. You can see her from the beach.', 'La Dama Buda de Sơn Trà protege a los pescadores. Se la ve desde la playa.'], ['Typhoon season is October–November. Today is a gift.', 'La temporada de tifones es octubre-noviembre. Hoy es un regalo.'], ['Basket boats spin because the fishermen show off. Ask Chú Bảy.', 'Las barcas-cesta giran porque los pescadores presumen. Pregúntale a Chú Bảy.']],
      musicProfile: { bpm: 88, root: 45, scale: [0, 2, 4, 7, 9], style: 'boom' },
      music: { playlist: AV.MUSIC && AV.MUSIC.da_nang ? 'da_nang' : 'chiang_mai', pos: { x: 234, y: 2.5, z: -37 }, bed: .55 }
    };
  }
});
AV.dn = AV.dn || {};
/* F (and the phone "List" button) opens the Da Nang bucket list; other worlds keep their own F action */
{ const prevF = AV.keymap.KeyF; AV.keymap.KeyF = e => { if (AV.W && AV.W.id === 'da_nang') { if (AV.dn.listPanel) AV.dn.listPanel(); return } if (prevF) prevF(e) } }
})(window.AV);
