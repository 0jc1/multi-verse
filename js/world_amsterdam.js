/* APEVERSE 2.1 - world_amsterdam.js : AMSTERDAM (present day), first playable district.  1 m = 1 m, north is -z.
   Built from the owner's illustrated Amsterdam map (mood / POI reference only) and the 2.1 city brief.  Pilot slice:
     Centraal Station + Stationsplein (arrival, tram stop, taxis, bike racks)  ->  Damrak (tram rails, red bike lanes, the Damrak
     basin with its leaning canal-house row)  ->  Dam Square (palace, monument)  ->  two canals of the ring (Singel, Herengracht)
     with 7 walkable brick bridges  ->  the Jordaan lane (independent shops).
   Architecture kit: canal houses with stepped / neck / bell / spout / cornice gables, brick + black-painted + stucco fronts, a slight
   forward lean, tall white-framed windows (lit at night), hoist beams, authored Dutch shopfronts.  Quays with Amsterdammertje bollards,
   elms, parked bikes, houseboats, cast-iron lamps.  Canals are real water (you can't walk on it; bridges arch over it).
   Every business is fictional; landmarks (Dam, Centraal, the canals) are public places.  AV.amsterdam (debug + tests) */
'use strict';
(function (AV) {
const TAU = Math.PI * 2, tr = AV.tr, L = (e, s) => [e, s], say = a => tr(a[0], a[1]);
const AMS = AV.amsterdam = { stats: {} };
const XMIN = -342, XMAX = 122, ZMIN = -190, ZMAX = 352, WY = -1.4;
const CAN = [{ id: 'singel', x0: -118, x1: -102, z0: -135, z1: 65 }, { id: 'heren', x0: -168, x1: -152, z0: -135, z1: 65 }, { id: 'basin', x0: 14, x1: 34, z0: -112, z1: -62 }, { id: 'buiten', x0: -340, x1: 120, z0: 134, z1: 148 }];
const BR = [['singel', -100], ['singel', -60], ['singel', 10], ['singel', 45], ['heren', -60], ['heren', 10], ['heren', 45]], BW = 4.2;   /* half width of a bridge */
/* bridges over the Singelgracht run north-south: [x, half width, rise] (the tram/road bridge is wide and nearly flat) */
const BRZ = [[0, 9, .35], [-110, 3.6, .95], [70, 3.6, .95], [-224, 7, .35]];   /* + the Leidsebrug (tram 2) */
/* ponds and pools (Vondelpark lakes, the Museumplein pool): ellipses [cx, cz, rx, rz] or rects [x0, x1, z0, z1]; y = water level */
const PONDS = [{ id: 'vondel1', e: [-180, 255, 36, 20], y: -.55 }, { id: 'vondel2', e: [-255, 215, 22, 14], y: -.55 }, { id: 'vondel3', e: [-120, 290, 14, 10], y: -.55 }, { id: 'plein', r: [-9, 9, 222, 270], y: -.3 }];
const pondAt = (x, z) => PONDS.find(p => p.e ? ((x - p.e[0]) / p.e[2]) ** 2 + ((z - p.e[1]) / p.e[3]) ** 2 < 1 : x > p.r[0] && x < p.r[1] && z > p.r[2] && z < p.r[3]) || null;
const canalAt = (x, z) => CAN.find(c => x > c.x0 && x < c.x1 && z > c.z0 && z < c.z1) || null;
function bridgeY(x, z) { if (z > 131.5 && z < 150.5) for (const [bx, hw, rise] of BRZ) if (Math.abs(x - bx) < hw) { const t = (z - 141) / 9.5; return .05 + rise * (1 - t * t) } for (const [cid, bz] of BR) { const c = CAN.find(q => q.id === cid); if (Math.abs(z - bz) > BW || x < c.x0 - 2.5 || x > c.x1 + 2.5) continue; const cx = (c.x0 + c.x1) / 2, hw = (c.x1 - c.x0) / 2 + 2.5, t = (x - cx) / hw; return .05 + .95 * (1 - t * t) } return null }
function surf(x, z) { if (z < ZMIN) return AMS.noordSurf ? AMS.noordSurf(x, z) : null; if (x < XMIN || x > XMAX || z < ZMIN || z > ZMAX || (z < 80 && x < -262) || (z < 116 && x > 92)) return null; const b = bridgeY(x, z); if (b !== null) return b; if (canalAt(x, z) || pondAt(x, z)) return null; return 0 }
AMS.pondPath = p => { const h = new THREE.Path(); if (p.e) h.absellipse(p.e[0], -p.e[1], p.e[2], p.e[3], 0, Math.PI * 2, false); else { h.moveTo(p.r[0], -p.r[3]); h.lineTo(p.r[1], -p.r[3]); h.lineTo(p.r[1], -p.r[2]); h.lineTo(p.r[0], -p.r[2]); h.closePath() } return h };
AMS.surf = surf; AMS.CAN = CAN; AMS.BR = BR; AMS.BRZ = BRZ; AMS.PONDS = PONDS; AMS.pondAt = pondAt; AMS.WY = WY;

/* ======================= sign atlas (Dutch shop signs, all fictional businesses) ======================= */
const SG = { r: {} };
const fit = (g, t, w, px, fam, y, x) => { let n = px; do { g.font = fam.replace('#', n); n -= 2 } while (g.measureText(t).width > w && n > 9); g.fillText(t, x, y) };
const rr = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath() };
const goldBoard = (top, sub, bg) => (g, w, h) => { g.fillStyle = bg || '#141414'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c8a040'; g.lineWidth = 6; g.strokeRect(8, 8, w - 16, h - 16); const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f8e090'); gr.addColorStop(.55, '#c89a3a'); gr.addColorStop(1, '#8a6420'); g.fillStyle = gr; g.textAlign = 'center'; g.textBaseline = 'middle'; fit(g, top, w - 60, h * .5, 'italic 700 #px Georgia, serif', h * .44, w / 2); g.fillStyle = '#e8d8a8'; fit(g, sub, w - 80, h * .16, '#px Georgia, serif', h * .8, w / 2) };
const plainBoard = (top, sub, bg, fg, ac, font) => (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = ac; g.fillRect(0, h - 10, w, 10); g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; fit(g, top, w - 50, h * .5, font || '800 #px Arial, sans-serif', h * .42, w / 2); g.fillStyle = ac; fit(g, sub, w - 60, h * .17, '600 #px Arial, sans-serif', h * .78, w / 2) };
const SIGNS = [
  ['kraantje', 768, 160, goldBoard("Café 't Gouden Kraantje", 'bruin café · bier · jenever · bitterballen')],
  ['lantaarn', 768, 160, (g, w, h) => { g.fillStyle = '#0c1a3a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#4ad8ff'; g.lineWidth = 5; rr(g, 10, 10, w - 20, h - 20, 18); g.stroke(); g.fillStyle = '#ffd84a'; g.beginPath(); g.moveTo(70, 40); g.lineTo(100, 40); g.lineTo(110, 70); g.lineTo(100, 120); g.lineTo(70, 120); g.lineTo(60, 70); g.closePath(); g.fill(); g.fillStyle = '#0c1a3a'; g.fillRect(78, 60, 14, 40);
    g.fillStyle = '#9ae8ff'; g.textAlign = 'left'; g.textBaseline = 'middle'; fit(g, 'COFFEESHOP', w - 190, 44, '900 #px Arial, sans-serif', 58, 140); g.fillStyle = '#ffd84a'; fit(g, 'De Blauwe Lantaarn · 18+', w - 190, 34, 'italic 700 #px Georgia, serif', 112, 140) }],
  ['platen', 768, 160, (g, w, h) => { g.fillStyle = '#8a1a1a'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff4c8'; for (let x = 20; x < w; x += 34) { g.beginPath(); g.arc(x, 14, 5, 0, 7); g.fill(); g.beginPath(); g.arc(x, h - 14, 5, 0, 7); g.fill() } g.fillStyle = '#f4e0a8'; g.textAlign = 'center'; g.textBaseline = 'middle'; fit(g, 'GROOVE DEALERS PLATEN', w - 70, 62, '900 #px Georgia, serif', 66, w / 2); g.font = 'bold 24px Georgia'; g.fillText('TWEEDEHANDS & NIEUW · VINYL · AUDIO', w / 2, 116) }],
  ['fietsen', 768, 160, (g, w, h) => { g.fillStyle = '#f4f2ea'; g.fillRect(0, 0, w, h); g.strokeStyle = '#1a1a1a'; g.lineWidth = 7; for (const cx of [70, 150]) { g.beginPath(); g.arc(cx, 92, 32, 0, 7); g.stroke() } g.beginPath(); g.moveTo(70, 92); g.lineTo(105, 52); g.lineTo(150, 92); g.moveTo(105, 52); g.lineTo(135, 52); g.stroke();
    g.fillStyle = '#1a1a1a'; g.textAlign = 'left'; g.textBaseline = 'middle'; fit(g, "Jasper's Fietsen", w - 230, 62, '900 #px Arial, sans-serif', 64, 205); g.fillStyle = '#d82a2a'; fit(g, 'VERHUUR · VERKOOP · REPARATIE', w - 230, 26, '700 #px Arial, sans-serif', 116, 205) }],
  ['molen', 768, 160, (g, w, h) => { g.fillStyle = '#f2e6c8'; g.fillRect(0, 0, w, h); g.strokeStyle = '#6a3a1a'; g.lineWidth = 4; g.strokeRect(10, 10, w - 20, h - 20); g.fillStyle = '#6a3a1a'; g.textAlign = 'center'; g.textBaseline = 'middle'; fit(g, 'Bakkerij Van der Molen', w - 80, 60, 'italic 700 #px Georgia, serif', 66, w / 2); g.fillStyle = '#a8742a'; fit(g, 'brood · banket · stroopwafels · appeltaart', w - 100, 26, '#px Georgia, serif', 118, w / 2) }],
  ['frites', 512, 160, plainBoard('VLAAMSE FRITES', 'met mayo · satésaus · oorlog', '#f2c230', '#c82a1a', '#1a1a1a', '900 #px Arial Black, Arial, sans-serif')],
  ['proeflokaal', 768, 160, (g, w, h) => { g.fillStyle = '#1f3a2a'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2c230'; g.textAlign = 'center'; g.textBaseline = 'middle'; fit(g, 'MONKEY BREW', w - 120, 70, '900 #px Georgia, serif', 62, w / 2); g.fillStyle = '#e8dcc0'; fit(g, 'PROEFLOKAAL · ambachtelijk bier · kombucha', w - 90, 26, 'italic #px Georgia, serif', 118, w / 2) }],
  ['waterkant', 768, 160, (g, w, h) => { g.fillStyle = '#16101e'; g.fillRect(0, 0, w, h); g.shadowColor = '#ff4ab0'; g.shadowBlur = 18; g.fillStyle = '#ff7ac8'; g.textAlign = 'center'; g.textBaseline = 'middle'; fit(g, 'De Waterkant', w - 120, 76, 'italic 700 #px "Brush Script MT", "Segoe Script", Georgia, cursive', 64, w / 2); g.shadowColor = '#4ad8ff'; g.fillStyle = '#9ae8ff'; fit(g, 'LIVE MUZIEK · elke avond vanaf 20:00', w - 100, 26, '700 #px Arial, sans-serif', 122, w / 2); g.shadowBlur = 0 }],
  ['kaas', 512, 160, plainBoard('KAASHANDEL JANSEN', 'jong · belegen · oud', '#1f2a5a', '#f2d23a', '#f2d23a', '900 #px Georgia, serif')],
  ['bloemen', 512, 128, plainBoard('BLOEMEN', 'tulpen · bollen · boeketten', '#2a5a2a', '#ffffff', '#ff5a8a', '900 #px Georgia, serif')],
  ['station', 1024, 128, (g, w, h) => { g.fillStyle = '#1a2440'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2d23a'; g.textAlign = 'center'; g.textBaseline = 'middle'; fit(g, 'CENTRAAL STATION', w - 100, 80, '700 #px Georgia, serif', 66, w / 2) }],
  ['tram', 256, 384, (g, w, h) => { g.fillStyle = '#f4f4f4'; g.fillRect(0, 0, w, h); g.fillStyle = '#1f4ab8'; g.fillRect(0, 0, w, 110); g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '900 64px Arial'; g.fillText('TRAM', w / 2, 58); g.fillStyle = '#1a1a1a'; g.font = 'bold 30px Arial'; g.fillText('Centraal', w / 2, 170); g.fillText('Damrak', w / 2, 220); g.fillText('Dam', w / 2, 270); g.font = '22px Arial'; g.fillText('elke 6 min', w / 2, 330) }],
  ['w_bakery', 256, 160, (g, w, h) => { g.fillStyle = '#f4e6c8'; g.fillRect(0, 0, w, h); g.fillStyle = '#8a6a4a'; g.fillRect(0, 60, w, 6); g.fillRect(0, 120, w, 6); for (let i = 0; i < 6; i++) { g.fillStyle = ['#c8843a', '#b06a2a', '#d89a4a'][i % 3]; g.beginPath(); g.ellipse(24 + i * 42, 46, 18, 12, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(24 + i * 42, 106, 16, 11, 0, 0, 7); g.fill() } g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(0, 0, w, 20) }],
  ['w_books', 256, 160, (g, w, h) => { g.fillStyle = '#3a2a1e'; g.fillRect(0, 0, w, h); for (let r = 0; r < 3; r++) for (let x = 6; x < w - 6;) { const bw = 6 + Math.random() * 10; g.fillStyle = ['#8a2a2a', '#2a4a6a', '#e8dcc0', '#3a6a3a', '#c8a040', '#5a3a6a'][(Math.random() * 6) | 0]; g.fillRect(x, 10 + r * 50, bw, 40 - Math.random() * 8); x += bw + 1 } }],
  ['w_goods', 256, 160, (g, w, h) => { g.fillStyle = '#e8e4dc'; g.fillRect(0, 0, w, h); g.fillStyle = '#9a8a7a'; g.fillRect(0, 74, w, 4); g.fillRect(0, 140, w, 4); for (let i = 0; i < 9; i++) { g.fillStyle = ['#d82a2a', '#2a6ad8', '#3aa85a', '#f2c230', '#8a4ad8', '#1a1a1a'][(i * 5) % 6]; g.fillRect(10 + i * 27, 36 + (i % 3) * 6, 18, 38 - (i % 3) * 6); g.fillRect(14 + i * 27, 104, 16, 36) } }],
  ['koningsdag', 1024, 160, (g, w, h) => { g.fillStyle = '#ff7a1a'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffffff'; for (let x = 0; x < w; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 32, 26); g.lineTo(x + 64, 0); g.fill() } g.fillStyle = '#1a1a1a'; g.textAlign = 'center'; g.textBaseline = 'middle'; fit(g, 'KONINGSDAG', w - 120, 70, '900 #px Arial Black, Arial, sans-serif', 84, w / 2); g.fillStyle = '#ffffff'; fit(g, 'vrijmarkt · muziek · oranje!', w - 120, 28, '700 #px Arial, sans-serif', 134, w / 2) }],
  ['vrijmarkt', 512, 128, plainBoard('VRIJMARKT', 'tweedehands · alles moet weg!', '#ff7a1a', '#ffffff', '#1a1a1a', '900 #px Arial Black, Arial, sans-serif')],
  /* ground-floor shops that dress the streets (not every door is a business you can use) */
  ['g_drogist', 512, 112, plainBoard('DROGISTERIJ', 'zeep · thee · kruiden', '#e8f0ea', '#1a5a3a', '#1a5a3a', '800 #px Georgia, serif')],
  ['g_boeken', 512, 112, goldBoard('Boekhandel De Kade', 'nieuw & antiquarisch', '#1f2a22')],
  ['g_kapper', 512, 112, plainBoard('KAPPER', 'knippen zonder afspraak', '#1a1a1a', '#f4f4f4', '#d82a2a', '800 #px Arial, sans-serif')],
  ['g_antiek', 512, 112, goldBoard('Antiek & Curiosa', 'tegels · klokken · kaarten', '#2a1a12')],
  ['g_wijn', 512, 112, goldBoard('Wijnhandel Kuiper', 'wijn · gedistilleerd', '#3a0f14')],
  ['g_tabak', 512, 112, plainBoard('TABAK · KRANTEN', 'loten · postzegels', '#2a3a6a', '#f2d23a', '#f2d23a', '800 #px Arial, sans-serif')],
  ['g_koffie', 512, 112, goldBoard('Koffiebranderij', 'vers gebrand · thee', '#3a2414')],
  ['g_kaarsen', 512, 112, plainBoard('KAARSEN & ZEEP', 'handgemaakt in de Jordaan', '#f4ead8', '#6a3a5a', '#6a3a5a', 'italic 800 #px Georgia, serif')],
  ['g_fiets2', 512, 112, plainBoard('FIETSENMAKER', 'banden · sloten · lampjes', '#1a1a1a', '#f2c230', '#f2c230', '800 #px Arial, sans-serif')],
  ['g_vis', 512, 112, plainBoard('VISHANDEL', 'haring · kibbeling', '#e8f0f8', '#1a3a7a', '#1a3a7a', '900 #px Georgia, serif')],
  ['g_galerie', 512, 112, plainBoard('galerie noord', 'hedendaagse kunst', '#f4f4f4', '#1a1a1a', '#1a1a1a', '300 #px Arial, sans-serif')],
  ['g_snoep', 512, 112, plainBoard('SNOEPWINKEL', 'drop · zuurtjes · stroopwafels', '#ff8ab0', '#ffffff', '#7a1a4a', '900 #px Georgia, serif')]
];
const GEN = SIGNS.filter(s => /^g_/.test(s[0])).map(s => s[0]);
function atlas() { return makeAtlas(SIGNS, SG, 2048, 2048) }
function makeAtlas(LIST, SG, W, H) { if (SG.tex) return SG.tex; SG.r = SG.r || {}; const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); const sh = []; let top = 0;
  for (const [k, w, h, fn] of LIST.slice().sort((a, b) => b[2] - a[2] || b[1] - a[1])) { let s = sh.find(q => q.h >= h && q.x + w <= W); if (!s) { if (top + h > H) { (SG.over = SG.over || []).push(k); continue } s = { y: top, h, x: 0 }; sh.push(s); top += h + 4 } g.save(); g.translate(s.x, s.y); g.beginPath(); g.rect(0, 0, w, h); g.clip(); try { fn(g, w, h) } catch (e) { } g.restore(); SG.r[k] = [s.x / W, 1 - (s.y + h) / H, w / W, h / H]; s.x += w + 4 }
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; SG.tex = t; return t }
/* quads into one geometry */
function quadGeo(qs, R) { R = R || SG.r; const n = qs.length, pos = new Float32Array(n * 18), nor = new Float32Array(n * 18), uv = new Float32Array(n * 12); let o = 0;
  qs.forEach(q => { const r = R[q.k]; if (!r) return; const c = Math.cos(q.ry), s = Math.sin(q.ry), hw = q.w / 2, hh = q.h / 2, P = (a, b) => [q.x + a * c, q.y + b, q.z - a * s];
    const v = [[P(-hw, -hh), [r[0], r[1]]], [P(hw, -hh), [r[0] + r[2], r[1]]], [P(hw, hh), [r[0] + r[2], r[1] + r[3]]], [P(-hw, hh), [r[0], r[1] + r[3]]]];
    for (const i of [0, 1, 2, 0, 2, 3]) { pos.set(v[i][0], o * 3); nor.set([s, 0, c], o * 3); uv.set(v[i][1], o * 2); o++ } });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.computeBoundingSphere(); return g }

/* ======================= canal-house kit ======================= */
const GCACHE = {};
function gableGeo(style, w, gh) { const k = style + Math.round(w * 2) + Math.round(gh * 2); if (GCACHE[k]) return GCACHE[k]; const s = new THREE.Shape(), hw = w / 2;
  if (style === 'step') { const n = 4, sw = hw * .7 / n, sh = gh / (n + 1); s.moveTo(-hw, 0); let x = -hw, y = 0; for (let i = 0; i < n; i++) { y += sh; s.lineTo(x, y); x += sw; s.lineTo(x, y) } s.lineTo(x, gh); s.lineTo(-x, gh); y = gh - sh; for (let i = 0; i < n; i++) { s.lineTo(-x, y); x -= sw; s.lineTo(-x, y); y -= sh } s.lineTo(hw, 0) }
  else if (style === 'neck') { const nw = hw * .45; s.moveTo(-hw, 0); s.quadraticCurveTo(-hw, gh * .45, -nw, gh * .5); s.lineTo(-nw, gh * .92); s.quadraticCurveTo(0, gh * 1.08, nw, gh * .92); s.lineTo(nw, gh * .5); s.quadraticCurveTo(hw, gh * .45, hw, 0) }
  else if (style === 'bell') { s.moveTo(-hw, 0); s.bezierCurveTo(-hw, gh * .55, -hw * .25, gh * .35, -hw * .3, gh * .85); s.quadraticCurveTo(0, gh * 1.12, hw * .3, gh * .85); s.bezierCurveTo(hw * .25, gh * .35, hw, gh * .55, hw, 0) }
  else if (style === 'spout') { s.moveTo(-hw, 0); s.lineTo(-hw * .3, gh * .82); s.lineTo(-hw * .3, gh); s.lineTo(hw * .3, gh); s.lineTo(hw * .3, gh * .82); s.lineTo(hw, 0) }
  else { s.moveTo(-hw, 0); s.lineTo(-hw, gh * .25); s.lineTo(hw, gh * .25); s.lineTo(hw, 0) }   /* cornice (lijstgevel) */
  return GCACHE[k] = new THREE.ExtrudeGeometry(s, { depth: .45, bevelEnabled: false }) }
const BRICK = [0x6a3428, 0x7a3a2a, 0x5a2a22, 0x4a2a24, 0x8a4a34, 0x6a2a20], PAINT = [0x1e1e22, 0x2a3a4a, 0xe8e0d0, 0x5a6a52, 0xa8743a, 0x3a2a3a, 0xd8cdb8], DOORC = [0x1e3a2a, 0x3a1a1a, 0x1a2a3a, 0x1a1a1a, 0x5a1a2a];
/* house at front point (fx, fz), facing yaw (0 = front faces +z), width w, height h, depth d. parts pushed into P (solid) and Gl (lit windows) */
function house(P, Gl, fx, fz, yaw, w, h, d, o) { const rng = o.rng, style = o.style, col = o.col, gh = style === 'cornice' ? 2 : 3 + w * .4, lean = (rng() - .5) * .025 + .008;
  const base = new THREE.Matrix4().makeRotationY(yaw).premultiply(new THREE.Matrix4().makeTranslation(fx, 0, fz)).multiply(new THREE.Matrix4().makeRotationX(lean));
  const put = (arr, geo, hex, x, y, z, sx, sy, sz, gl) => { const m = AV.kit.M(x, y, z, sx, sy, sz); m.premultiply(base); arr.push([geo, hex, m, gl || 0]) }, BG = AV.kit.BG;
  if (o.hollow) { put(P, BG.box, col, 0, (3.7 + h) / 2, -d / 2, w, h - 3.7, d); put(P, BG.box, col, 0, 1.85, -d + .15, w, 3.7, .3); for (const sx of [-1, 1]) put(P, BG.box, col, sx * (w / 2 - .15), 1.85, -d / 2, .3, 3.7, d);
    const dx = w / 2 - .9; put(P, BG.box, o.shopCol || 0x1a1a1a, 0, 3.35, .06, w - .3, .7, .14); put(P, BG.box, o.shopCol || 0x1a1a1a, -w / 2 + .3, 1.5, .06, .4, 3, .14); put(P, BG.box, o.shopCol || 0x1a1a1a, dx - .75, 1.5, .06, .3, 3, .14); put(P, BG.box, o.shopCol || 0x1a1a1a, w / 2 - .2, 1.5, .06, .3, 3, .14); put(o.glass || Gl, BG.box, 0xa8c8d8, (-w / 2 + .5 + dx - .9) / 2, 1.6, .1, dx - .9 + w / 2 - .5, 2.3, .04, 0); put(P, BG.box, 0x2a1a12, (-w / 2 + .5 + dx - .9) / 2, .3, .08, dx - .9 + w / 2 - .5, .6, .12) }
  else put(P, BG.box, col, 0, h / 2, -d / 2, w, h, d);   /* body */
  { const m = new THREE.Matrix4().makeTranslation(0, h, -.45).premultiply(base); P.push([gableGeo(style, w, gh), col, m, 0]) }
  put(P, BG.box, 0x2a2a30, 0, h + gh * .35, -d / 2 - .3, w * .55, gh * .7, d - 1);   /* roof mass behind the gable */
  put(P, BG.box, 0xf0ece2, 0, h + .02, .04, w + .1, .18, .14);   /* cornice band */
  if (style !== 'cornice') put(P, BG.box, 0x3a2a1a, 0, h + gh * .78, .35, .14, .14, .8);   /* hoist beam */
  const floors = Math.max(2, Math.floor((h - 3.2) / 2.9)), nw = w > 6.4 ? 3 : 2, ww = 1.05, wh = 1.75;
  for (let f = 0; f < floors; f++) { const y = 3.9 + f * 2.9; if (y + wh / 2 > h - .3) break; for (let i = 0; i < nw; i++) { const x = (i - (nw - 1) / 2) * (w / nw) * .92; put(P, BG.box, 0xf4f0e8, x, y, .02, ww + .2, wh + .2, .08); put(rng() < .3 ? Gl : P, BG.box, rng() < .3 ? 0xffd79a : 0x1e2a32, x, y, .07, ww, wh, .05, 1); put(P, BG.box, 0xf4f0e8, x, y, .09, .06, wh, .03) } }
  if (o.back) for (let f = 0; f < floors; f++) { const y = 3.9 + f * 2.9; if (y + wh / 2 > h - .3) break; for (let i = 0; i < nw; i++) { const x = (i - (nw - 1) / 2) * (w / nw) * .92; put(P, BG.box, 0xf4f0e8, x, y, -d - .02, ww + .2, wh + .2, .08); put(rng() < .25 ? Gl : P, BG.box, rng() < .25 ? 0xffd79a : 0x1e2a32, x, y, -d - .07, ww, wh, .05, 1) } }
  if (style !== 'cornice') { const y = h + gh * .4; put(P, BG.box, 0xf4f0e8, 0, y, .03, .9, 1.1, .08); put(rng() < .3 ? Gl : P, BG.box, 0x1e2a32, 0, y, .08, .72, .92, .04, 1) }
  if (o.hollow) { }
  else if (!o.shop) { put(P, BG.box, DOORC[(rng() * DOORC.length) | 0], w * .28, 1.25, .04, 1.1, 2.4, .1); put(P, BG.box, 0xf4f0e8, w * .28, 2.6, .05, 1.3, .25, .1); put(P, BG.box, 0x9aa8b0, 0, .35, .05, w, .7, .1);   /* door, transom, stoop */
    put(P, BG.box, 0xf4f0e8, -w * .18, 1.8, .02, 1.3, 1.7, .08); put(P, BG.box, 0x1e2a32, -w * .18, 1.8, .07, 1.1, 1.5, .05) }
  else { put(P, BG.box, o.shopCol || 0x1a1a1a, 0, 1.6, .06, w - .3, 3.0, .12); put(o.lit ? Gl : P, BG.box, o.lit ? 0xffe8b8 : 0x2a3a44, -.5, 1.5, .14, w - 2.2, 2.2, .04, 1); put(P, BG.box, 0x101010, w / 2 - .9, 1.3, .14, 1.1, 2.4, .05) }
  return base }

AMS.kit = { house, gableGeo, quadGeo, makeAtlas, fit, rr, goldBoard, plainBoard, BRICK, PAINT, DOORC };
/* ======================= the world ======================= */
AV.registerWorld({
  id: 'amsterdam',
  build(ctx) {
    const K = AV.kit, CY = AV.city, BG = K.BG, q = ctx.q, rng = ctx.rng, grp = ctx.group, S = AV.S;
    const st = () => { S.ams = S.ams || { met: {}, boat: 0, tram: 0 }; return S.ams };
    const T = (x, z, r, label, fn, show, kind) => { const t = { x, z, r, label, fn, show, kind }; ctx.T.push(t); return t };
    const P = [], Gl = [], Gs = [], Q = [], cols = ctx.cols, box = (arr, hex, x0, x1, y0, y1, z0, z1, gl) => arr.push([BG.box, hex, K.M((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0)), gl || 0]);
    const sign = (k, x, y, z, w, h, ry, dbl) => { Q.push({ k, x, y, z, w, h, ry }); if (dbl) Q.push({ k, x: x - Math.sin(ry) * .02, y, z: z - Math.cos(ry) * .02, w, h, ry: ry + Math.PI }) };
    let gi = 0; const nextGen = () => GEN[(gi++) % GEN.length];
    /* ---------- ground: klinkers (brick pavers), quays, Damrak carriageway, red bike lanes, Dam square, Stationsplein ---------- */
    const klink = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); g.fillStyle = '#6a4a3e'; g.fillRect(0, 0, 256, 256); for (let y = 0; y < 256; y += 16) for (let x = -16; x < 256; x += 32) { const ox = (y / 16) % 2 ? 16 : 0, v = 90 + Math.random() * 40; g.fillStyle = 'rgb(' + (v + 40 | 0) + ',' + (v * .62 | 0) + ',' + (v * .5 | 0) + ')'; g.fillRect(x + ox + 1, y + 1, 30, 14) } const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(.45, .45); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t })();
    /* the paved ground has holes where the canals are (UVs in metres: one paver tile every ~2.2 m) */
    { const sh2 = new THREE.Shape([[XMIN, ZMAX], [XMAX, ZMAX], [XMAX, 116], [92, 116], [92, ZMIN], [-262, ZMIN], [-262, 80], [XMIN, 80]].map(p => new THREE.Vector2(p[0], -p[1])));
      for (const c of CAN) sh2.holes.push(new THREE.Path([new THREE.Vector2(c.x0, -c.z1), new THREE.Vector2(c.x0, -c.z0), new THREE.Vector2(c.x1, -c.z0), new THREE.Vector2(c.x1, -c.z1)]));
      for (const p of PONDS) sh2.holes.push(AMS.pondPath(p));
      const g = new THREE.ShapeGeometry(sh2); g.rotateX(-Math.PI / 2); const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: klink, roughness: .85 })); m.position.y = -.01; m.receiveShadow = true; m.material.userData.lin = 1; grp.add(m) }
    box(P, 0x3a3a3e, -6, 6, 0, .03, -150, 134); for (const x of [-8.2, 6.4]) box(P, 0xa83a2a, x, x + 1.8, 0, .035, -150, -45);   /* Damrak / Rokin asphalt + red fietspaden */
    for (const x of [-2.2, -.9, .9, 2.2]) box(P, 0x8a8a90, x - .05, x + .05, .03, .06, -150, 133.6);   /* tram rails */
    box(P, 0xb8b0a0, -48, 45, 0, .02, -45, 0); box(P, 0xb0a898, -60, 60, 0, .02, -152, -120);   /* Dam square stone, Stationsplein */
    /* ---------- canals: water, quay walls (brick), coping stones ---------- */
    const wm = K.water({ deep: 0x1f2e26, shallow: 0x3e5244, sky: 0xb8c4cc, opacity: .93, iri: .04 });
    for (const c of CAN) { const g = new THREE.PlaneGeometry(c.x1 - c.x0, c.z1 - c.z0); const w = new THREE.Mesh(g, wm); w.rotation.x = -Math.PI / 2; w.position.set((c.x0 + c.x1) / 2, WY, (c.z0 + c.z1) / 2); w.renderOrder = 1; grp.add(w);
      box(P, 0x5a3a2e, c.x0 - .4, c.x0, WY - 1.5, 0, c.z0, c.z1); box(P, 0x5a3a2e, c.x1, c.x1 + .4, WY - 1.5, 0, c.z0, c.z1); box(P, 0x5a3a2e, c.x0, c.x1, WY - 1.5, 0, c.z0 - .4, c.z0); box(P, 0x5a3a2e, c.x0, c.x1, WY - 1.5, 0, c.z1, c.z1 + .4);
      for (const x of [c.x0 - .45, c.x1 + .05]) box(P, 0x9a968c, x, x + .4, 0, .12, c.z0, c.z1); box(P, 0x2a2a24, c.x0, c.x1, WY - 1.6, WY - 1.5, c.z0, c.z1) }
    /* ---------- bridges: brick arch, stone deck edge, iron railings ---------- */
    const arch = (hw, w, dy, flip) => { const g = new THREE.PlaneGeometry(2 * hw, w, 32, 1); g.rotateX(-Math.PI / 2); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const t = p.getX(i) / hw; p.setY(i, .05 + .95 * (1 - t * t) + dy) } if (flip) { const ix = g.index.array; for (let i = 0; i < ix.length; i += 3) { const a = ix[i]; ix[i] = ix[i + 1]; ix[i + 1] = a } } g.computeVertexNormals(); return g };
    for (const [cid, bz] of BR) { const c = CAN.find(q2 => q2.id === cid), cx = (c.x0 + c.x1) / 2, hw = (c.x1 - c.x0) / 2 + 2.5; const n = 30;
      P.push([arch(hw, 2 * BW, .02), 0x8a5a4a, new THREE.Matrix4().makeTranslation(cx, 0, bz), 0], [arch(hw, 2 * BW, -.32, true), 0x6a3a2e, new THREE.Matrix4().makeTranslation(cx, 0, bz), 0]);   /* one smooth arched deck (brick pavers) + its underside */
      for (let i = 0; i < n; i++) { const x0 = cx - hw + i * 2 * hw / n, x1 = x0 + 2 * hw / n, t = ((x0 + x1) / 2 - cx) / hw, y = .05 + .95 * (1 - t * t); for (const sd of [-1, 1]) box(P, 0x1a1a1a, x0, x1, y + .9, y + .96, bz + sd * BW - .04, bz + sd * BW + .04) }
      for (const sd of [-1, 1]) { box(P, 0x6a3a2e, c.x0, c.x0 + 3, WY - 1, .3, bz + sd * BW - .3, bz + sd * BW); box(P, 0x6a3a2e, c.x1 - 3, c.x1, WY - 1, .3, bz + sd * BW - .3, bz + sd * BW); box(P, 0x6a3a2e, c.x0, c.x1, .15, .35, bz + sd * BW - .3, bz + sd * BW);   /* abutments + arch band: boats pass underneath */ for (let k = 0; k < 9; k++) { const x = cx - hw + k * hw * 2 / 8; box(P, 0x1a1a1a, x - .04, x + .04, .1, 1.95 * 0 + (.05 + .95 * (1 - ((x - cx) / hw) ** 2)) + .95, bz + sd * BW - .04, bz + sd * BW + .04) } }
    }
    { const cb = CAN.find(c => c.id === 'buiten'), R90 = new THREE.Matrix4().makeRotationY(Math.PI / 2);
      for (const [bx, hw, rise] of BRZ) { const span = 9.5, road = hw > 5; const deck = (dy, flip) => { const g = arch(span, 2 * hw, 0, flip); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const t = p.getX(i) / span; p.setY(i, .05 + rise * (1 - t * t) + dy) } g.computeVertexNormals(); return g };
        const m = new THREE.Matrix4().makeTranslation(bx, 0, 141).multiply(R90); P.push([deck(.02), road ? 0x3a3a3e : 0x8a5a4a, m, 0], [deck(-.32, true), 0x6a3a2e, m.clone(), 0]);
        for (let i = 0; i < 24; i++) { const z0 = 141 - span + i * 2 * span / 24, z1 = z0 + 2 * span / 24, t = ((z0 + z1) / 2 - 141) / span, y = .05 + rise * (1 - t * t); for (const sd of [-1, 1]) { box(P, road ? 0x2a4a3a : 0x1a1a1a, bx + sd * hw - .04, bx + sd * hw + .04, y + .9, y + .96, z0, z1); if (i % 3 === 0) box(P, road ? 0x2a4a3a : 0x1a1a1a, bx + sd * hw - .04, bx + sd * hw + .04, y, y + .95, z0, z0 + .08) } }
        for (const sd of [-1, 1]) box(P, 0x6a3a2e, bx + sd * hw - (sd > 0 ? .3 : 0), bx + sd * hw + (sd < 0 ? .3 : 0), WY - 1, .04, cb.z0, cb.z1);
        if (road) for (const x of [-2.2, -.9, .9, 2.2]) for (let i = 0; i < 24; i++) { const z0 = 141 - span + i * 2 * span / 24, z1 = z0 + 2 * span / 24, t = ((z0 + z1) / 2 - 141) / span, y = .05 + rise * (1 - t * t); box(P, 0x8a8a90, bx + x - .05, bx + x + .05, y + .02, y + .05, z0, z1) } } }
    /* ---------- house rows ---------- */
    const STY = ['step', 'step', 'neck', 'bell', 'spout', 'cornice', 'cornice', 'neck'];
    const SHOPS = {};   /* named shop lots: key -> { x, z, yaw, w } (filled while building rows) */
    const special = [['kraantje', 'jordaanE', -40], ['lantaarn', 'jordaanE', -10], ['platen', 'jordaanW', -28], ['fietsen', 'herenW', -90], ['molen', 'damrakW', -100], ['proeflokaal', 'singelW', -22], ['waterkant', 'herenE', 25], ['kaas', 'singelE', -82]];
    function row(id, fx, z0, z1, face, depth, breaks, back) {   /* a row along z, front at x = fx, facing +x (face 1) or -x (face -1) */
      let z = z0; while (z < z1 - 4) { const br = (breaks || []).find(b => z + 4 > b[0] && z < b[1]); if (br) { z = br[1]; continue } let w = 5 + rng() * 3; if (z + w > z1) w = z1 - z; if (w < 4) break; const nb = (breaks || []).find(b => z + w > b[0] && z < b[0]); if (nb) w = nb[0] - z; if (w < 4) { z = nb[1]; continue }
        const zc = z + w / 2, yaw = face > 0 ? Math.PI / 2 : -Math.PI / 2, sp = special.find(s => s[1] === id && Math.abs(s[2] - zc) < w / 2 + .5 && !SHOPS[s[0]]);
        const brick = rng() < .62, h = 10.5 + rng() * 6.5, shop = !!sp || rng() < .35;
        house(P, Gl, fx, zc, yaw, w, sp ? 11 : h, depth, { back, glass: Gs, hollow: !!sp && ['kraantje', 'lantaarn', 'platen'].includes(sp[0]), rng, style: STY[(rng() * STY.length) | 0], col: brick ? BRICK[(rng() * BRICK.length) | 0] : PAINT[(rng() * PAINT.length) | 0], shop, lit: shop && rng() < .6, shopCol: sp ? 0x101010 : [0x1a1a1a, 0x1e3a2a, 0x3a1a1a, 0x1a2a4a][(rng() * 4) | 0] });
        cols.push([Math.min(fx, fx - face * depth), Math.max(fx, fx - face * depth), z + .05, z + w - .05]);
        if (sp) SHOPS[sp[0]] = { x: fx + face * .2, z: zc, yaw, w, face }; else if (shop) { const gk = nextGen(); sign(gk, fx + face * .22, 3.35, zc, w - .6, (w - .6) * .22, yaw); sign(gk === 'g_boeken' || gk === 'g_antiek' ? 'w_books' : gk === 'g_snoep' || gk === 'g_koffie' ? 'w_bakery' : 'w_goods', fx + face * .21, 1.5, zc + face * .5, w - 2.4, 2.0, yaw) }
        z += w + .02 } }
    const BRK = [[-64, -56], [6, 14]];
    row('singelE', -96, -132, 62, -1, 12, BRK); row('singelW', -124, -132, 62, 1, 11, BRK); row('herenE', -146, -132, 62, -1, 11, BRK); row('herenW', -174, -132, 62, 1, 12, BRK);
    row('jordaanE', -194, -132, 62, -1, 8, BRK); row('jordaanW', -200, -132, 62, 1, 10, BRK);
    row('vijzelW', -13, 31, 128, 1, 12, [[76, 84]], true); row('vijzelE', 13, 31, 128, -1, 12, [[76, 84]], true);
    row('damrakW', -12, -118, -48, 1, 12, [[-64, -56]]); row('basinE', 36, -112, -62, -1, 12, []); row('damrakE', 12, -62, -48, -1, 12, []); row('damrakEn', 12, -120, -112, -1, 12, []);
    /* Dam south side (facing north) + Rokin */
    for (let x = -46; x < -14; x += 6.2) { house(P, Gl, x + 3.1, 16, Math.PI, 6.2, 12 + rng() * 4, 12, { rng, style: STY[(rng() * STY.length) | 0], col: BRICK[(rng() * BRICK.length) | 0], shop: rng() < .5 }); cols.push([x, x + 6.2, 16, 28]) }
    for (let x = 14; x < 44; x += 6.2) { house(P, Gl, x + 3.1, 16, Math.PI, 6.2, 12 + rng() * 4, 12, { rng, style: STY[(rng() * STY.length) | 0], col: PAINT[(rng() * PAINT.length) | 0], shop: rng() < .5 }); cols.push([x, x + 6.2, 16, 28]) }
    /* ---------- landmarks: Centraal Station, the palace on the Dam, the monument, a Westertoren-like church tower over the Jordaan ---------- */
    { const brick = 0x8a4434, stone = 0xd8cdb4, slate = 0x3a3e44; box(P, brick, -70, -4, 0, 14, -178, -152); box(P, brick, 4, 70, 0, 14, -178, -152); box(P, brick, -4, 4, 6, 14, -178, -152);   /* a passage under the middle to the IJ side */ box(P, slate, -71, 71, 14, 18, -179, -151); for (const x of [-22, 22]) { box(P, brick, x - 5, x + 5, 0, 30, -172, -152); box(P, slate, x - 5.4, x + 5.4, 30, 34, -172.4, -151.6); box(P, 0xc8a040, x - 2, x + 2, 24, 28, -151.8, -151.7, 1) }
      box(P, stone, -12, -4, 0, 12, -153, -151); box(P, stone, 4, 12, 0, 12, -153, -151); box(P, stone, -4, 4, 6, 12, -153, -151); box(P, 0x101418, -8, -4, 0, 8, -151, -150.9); box(P, 0x101418, 4, 8, 0, 8, -151, -150.9); for (let x = -64; x < 64; x += 5) if (Math.abs(x) > 14 && Math.abs(Math.abs(x) - 22) > 6) { box(P, stone, x, x + 3, 4, 10, -152.1, -151.9); box(Gl, 0x3a4a5a, x + .3, x + 2.7, 4.3, 9.7, -151.9, -151.8, 1) }
      cols.push([-70, -4, -178, -152], [4, 70, -178, -152]); sign('station', 0, 13, -150.8, 24, 3, 0) }
    { const stone = 0xd8ccb0, dark = 0x8a8270; box(P, stone, -80, -50, 0, 22, -42, -6); box(P, dark, -80.2, -49.8, 0, 3.4, -42.2, -5.8); box(P, 0xe8e0cc, -80.2, -49.6, 21.4, 22.6, -42.2, -5.8); box(P, 0x5a6a5a, -78, -52, 22.6, 24.5, -40, -8);
      for (let z = -41; z < -6; z += 2.6) box(P, 0xe8e0cc, -49.85, -49.6, 3.4, 21.4, z, z + .5);   /* pilasters */
      for (let y = 5; y < 20; y += 4.6) for (let z = -40; z < -8; z += 2.6) { box(P, 0xf0ead8, -49.8, -49.7, y - .1, y + 2.9, z + .75, z + 2.05); box(P, 0x2a3440, -49.7, -49.6, y, y + 2.8, z + .85, z + 1.95) }
      for (let k = 0; k < 7; k++) { const t = k / 6, hw = 7 * (1 - t); box(P, 0xe8e0cc, -50.2, -49.4, 22.6 + k * .6, 23.2 + k * .6, -24 - hw, -24 + hw) }   /* pediment */
      for (const z of [-27, -21]) box(P, dark, -50.2, -49.2, 0, 4.2, z - 1, z + 1); box(P, 0x101418, -49.5, -49.4, 0, 3.6, -25.6, -22.4);
      P.push([BG.cyl, 0xd8ccb0, K.M(-65, 26.5, -24, 3.2, 4, 3.2), 0], [BG.hem, 0x5a7a6a, K.M(-65, 28.5, -24, 3.4, 3, 3.4), 0], [BG.cyl, 0xd8ccb0, K.M(-65, 32, -24, .8, 2.4, .8), 0]); box(P, 0xc8a040, -65.4, -64.6, 33.2, 35.6, -24.4, -23.6, 1);
      cols.push([-80.3, -49.2, -42.3, -5.7]) }
    { box(P, 0xe8e4d8, 15, 25, 0, 1.2, -27, -17); box(P, 0xf0ece4, 18, 22, 1.2, 22, -24, -20); box(P, 0xe8e4d8, 17.5, 22.5, 22, 23, -24.5, -19.5); cols.push([15, 25, -27, -17]) }
    { box(P, 0x6a3a2a, -236, -224, 0, 26, -46, -34); box(P, 0xd8ccb0, -234, -226, 26, 38, -44, -36); box(P, 0x3a6a8a, -232, -228, 38, 50, -42, -38); box(P, 0xc8a040, -230.5, -229.5, 50, 53, -40.5, -39.5, 1); cols.push([-236, -224, -46, -34]) }
    /* ---------- quay dressing: Amsterdammertjes, elms, lamps, parked bikes, houseboats ---------- */
    const trees = [], bikes = [];
    for (const c of CAN.slice(0, 2)) for (const side of [-1, 1]) { const qx = side < 0 ? c.x0 - 1.2 : c.x1 + 1.2; for (let z = c.z0 + 3; z < c.z1 - 2; z += 2.4) { if (BR.some(b => b[0] === c.id && Math.abs(z - b[1]) < BW + 1.5)) continue; box(P, 0x5a2218, qx - .09, qx + .09, 0, .95, z - .09, z + .09); box(P, 0xf4f0e8, qx - .1, qx + .1, .7, .74, z - .1, z + .1); ctx.circles.push([qx, z, .12]) }
      for (let z = c.z0 + 8; z < c.z1 - 4; z += 13) { if (BR.some(b => b[0] === c.id && Math.abs(z - b[1]) < BW + 3)) continue; trees.push([qx + side * 1.6, z]) }
      for (let z = c.z0 + 6; z < c.z1 - 4; z += 3.1) { if (BR.some(b => b[0] === c.id && Math.abs(z - b[1]) < BW + 2)) continue; if (rng() < .55) bikes.push([qx + side * .7, z, side]) } }
    for (const [x, z] of trees) { const h = 7 + rng() * 3; box(P, 0x3a2e24, x - .25, x + .25, 0, h * .5, z - .25, z + .25); for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; P.push([BG.ico, [0x3a6a2e, 0x4a7a34, 0x2e5a26][k % 3], K.M(x + Math.cos(a) * 1.6, h * .7 + (k % 2) * .8, z + Math.sin(a) * 1.6, 2.4, 1.9, 2.4), 0]) } P.push([BG.ico, 0x3a6a2e, K.M(x, h * .85, z, 2.6, 2.2, 2.6), 0]); ctx.circles.push([x, z, .35]) }
    for (let z = -140; z < 80; z += 16) for (const x of [-10.6, 10.6]) { if (z > -116 && z < -58 && x > 0) continue; box(P, 0x1a2a22, x - .07, x + .07, 0, 4.2, z - .07, z + .07); box(Gl, 0xffe0a0, x - .25, x + .25, 4.1, 4.6, z - .25, z + .25, 1) }
    for (const c of CAN.slice(0, 2)) for (let z = c.z0 + 10; z < c.z1; z += 22) for (const x of [c.x0 - 3, c.x1 + 3]) { box(P, 0x1a2a22, x - .07, x + .07, 0, 4, z - .07, z + .07); box(Gl, 0xffe0a0, x - .22, x + .22, 3.9, 4.4, z - .22, z + .22, 1) }
    const bm = new THREE.Matrix4(); bikes.forEach(([x, z, side], i) => { const g = CY.VB.bicycle([0x1a1a1a, 0x2a4a8a, 0x8a1a1a, 0x3a6a3a, 0xe8e4da][i % 5], { rider: false }); bm.makeRotationY(side > 0 ? .15 : Math.PI - .15).setPosition(x, 0, z); P.push([g, [0x1a1a1a, 0x2a4a8a, 0x8a1a1a, 0x3a6a3a, 0x6a6a6a][i % 5], bm.clone(), 0]) });
    for (const c of CAN.slice(0, 2)) for (let z = c.z0 + 18; z < c.z1 - 10; z += 37) { if (BR.some(b => b[0] === c.id && Math.abs(z - b[1]) < 12)) continue; const x = c.x0 + 2.4, col = [0x2a4a3a, 0x6a2a2a, 0x2a3a5a][(z | 0) % 3 < 0 ? 0 : (Math.abs(z | 0)) % 3]; box(P, 0x2a2a2a, x - 1.8, x + 1.8, WY - .2, WY + .6, z - 7, z + 7); box(P, col, x - 1.6, x + 1.6, WY + .6, WY + 2.8, z - 6, z + 6); box(P, 0x3a3a3a, x - 1.8, x + 1.8, WY + 2.8, WY + 3, z - 6.3, z + 6.3); for (let k = -4; k <= 4; k += 2.5) box(Gl, 0xffd79a, x + 1.62, x + 1.65, WY + 1.4, WY + 2.2, z + k - .6, z + k + .6, 1) }
    AMS.stats.trees = trees.length; AMS.stats.bikes = bikes.length;
    /* ---------- the businesses you can use: interiors behind their shopfronts ---------- */
    const sh = SHOPS;
    function interior(key, depth, fit) { const s = sh[key]; if (!s) return null; const f = s.face, ix = s.x - f * .6, x0 = Math.min(ix, ix - f * depth), x1 = Math.max(ix, ix - f * depth), z0 = s.z - s.w / 2 + .35, z1 = s.z + s.w / 2 - .35;
      /* hollow the house: drop its solid collider and use walls with the shop door open (the facade's door bay) */
      for (let i = cols.length - 1; i >= 0; i--) { const c = cols[i]; if (s.z > c[2] && s.z < c[3] && ((f < 0 && c[0] < s.x + .3 && c[1] > s.x) || (f > 0 && c[1] > s.x - .3 && c[0] < s.x))) cols.splice(i, 1) }
      const dz = s.z - f * (s.w / 2 - .9); cols.push([x0, x1, z0 - .3, z0], [x0, x1, z1, z1 + .3], f < 0 ? [x1, x1 + .3, z0, z1] : [x0 - .3, x0, z0, z1]);
      const fxw = f < 0 ? [x0 - .25, x0] : [x1, x1 + .25]; cols.push([fxw[0], fxw[1], z0, dz - .6], [fxw[0], fxw[1], dz + .6, z1]);
      box(P, 0x3a2a1e, x0, x1, .02, .06, z0, z1); box(Gl, 0xffe0b0, x0 + 1, x1 - 1, 3.5, 3.55, z0 + .8, z1 - .8, 1);
      const X = u => s.x - f * u; fit(X, z0, z1, dz); return { X, z0, z1, dz, door: [X(-1), dz], f } }
    /* signs over the shopfronts */
    for (const k in sh) { const s = sh[k]; sign(k, s.x + s.face * .25, 3.4, s.z, s.w - .4, (s.w - .4) * .21, s.face > 0 ? Math.PI / 2 : -Math.PI / 2); if (!['kraantje', 'lantaarn', 'platen'].includes(k)) sign(k === 'molen' || k === 'kaas' ? 'w_bakery' : 'w_goods', s.x + s.face * .02, 1.5, s.z + s.face * .5, s.w - 2.4, 2.0, s.face > 0 ? Math.PI / 2 : -Math.PI / 2) }
    const kr = interior('kraantje', 8, (X, z0, z1) => { box(P, 0x3a2414, X(5.6), X(6.4), 0, 1.1, z0 + .5, z1 - .5); for (let k = 0; k < 5; k++) box(P, [0xd8a040, 0x2a4a2a, 0x6a1a1a][k % 3], X(7.3), X(7.5), 1.2 + (k % 2) * .5, 1.5 + (k % 2) * .5, z0 + 1 + k * .9, z0 + 1.4 + k * .9); box(P, 0x2a1a10, X(1.5), X(3), .7, .76, z0 + .6, z0 + 2.2); box(P, 0x2a1a10, X(1.5), X(3), .7, .76, z1 - 2.2, z1 - .6) });
    const ln = interior('lantaarn', 7, (X, z0, z1) => { box(P, 0x1a2a4a, X(5), X(5.8), 0, 1.05, z0 + .5, z1 - .8); box(P, 0x2a1a3a, X(1.2), X(2), .3, .7, z0 + .3, z1 - 1.5); for (let k = 0; k < 4; k++) P.push([BG.ico, 0x3a8a3a, K.M(X(6.6), 1.8, z0 + .8 + k * 1.2, .4, .5, .4), 0]); box(Gl, 0x4ad8ff, X(6.95), X(7), 1.6, 2.6, z0 + .5, z1 - .5, 1) });
    const pl = interior('platen', 9, (X, z0, z1) => { for (let i = 0; i < 4; i++) { const u = 2.2 + i * 1.6; box(P, 0x5a3a24, X(u), X(u + 1.2), 0, .8, z0 + .3, z0 + 1.3); for (let k = 0; k < 9; k++) box(P, [0xd82a2a, 0xf2c230, 0x2a8ad8, 0x3aa85a, 0x8a4ad8, 0x1a1a1a][(k + i) % 6], X(u + .08 + k * .12), X(u + .16 + k * .12), .8, 1.1, z0 + .4, z0 + 1.2) } box(P, 0x2a1a12, X(7.2), X(8), 0, 1, z1 - 3, z1 - .5); box(P, 0x111111, X(7.4), X(7.8), 1, 1.04, z1 - 2.2, z1 - 1.6) });
    /* ---------- the Damrak / Herengracht quay shops: walk-up counters at the shopfront ---------- */
    AMS.shops = sh; AMS.interiors = { kr, ln, pl };
    /* ---------- tram stop, taxi stand area, Stationsplein bike racks ---------- */
    for (const [z, nm] of [[-124, 'c'], [-40, 'd']]) { box(P, 0x2a2a2e, 10.4, 10.55, 0, 2.8, z - 3, z + 3); box(P, 0xd8e8f0, 10.55, 10.6, .9, 2.6, z - 3, z + 3); box(P, 0x1f4ab8, 9.2, 10.7, 2.8, 3, z - 3.2, z + 3.2); sign('tram', 9.3, 1.7, z + 2.6, .9, 1.35, -Math.PI / 2); cols.push([10.35, 10.65, z - 3, z + 3]) }
    for (let x = -50; x < 50; x += 1.4) if (Math.abs(x) > 14) { const g = CY.VB.bicycle(0x1a1a1a, { rider: false }); P.push([g, [0x1a1a1a, 0x3a3a5a, 0x5a1a1a][Math.abs(Math.round(x)) % 3], new THREE.Matrix4().makeRotationY(Math.PI / 2).setPosition(x, 0, -147), 0]) } cols.push([-50, -14, -148, -146], [14, 50, -148, -146]);
    /* ---------- King's Day decorations (only while the festival runs) ---------- */
    const fest = new THREE.Group(); fest.visible = false; grp.add(fest); AMS.festG = fest; const FP = [], FQ = [];
    for (const z of [-110, -90, -70, -50]) { for (let k = 0; k < 14; k++) { const x = -11 + k * 1.6, y = 6 - Math.sin(k / 13 * Math.PI) * 1.2; FP.push([BG.cone, k % 2 ? 0xff7a1a : 0xffffff, K.M(x, y, z, .35, .6, .05, Math.PI, 0, 0), 1]) } }
    for (const c of CAN.slice(0, 2)) for (const bz of [-60, 10]) for (let k = 0; k < 10; k++) { const x = c.x0 - 3 + k * (c.x1 - c.x0 + 6) / 9; FP.push([BG.cone, k % 2 ? 0xff7a1a : 0xffffff, K.M(x, 4.5 - Math.sin(k / 9 * Math.PI) * .8, bz, .35, .6, .05, Math.PI, 0, 0), 1]) }
    FQ.push({ k: 'koningsdag', x: 0, y: 7.2, z: -122, w: 12, h: 1.9, ry: Math.PI }, { k: 'koningsdag', x: 0, y: 7.2, z: -122.05, w: 12, h: 1.9, ry: 0 });
    const STALLS = []; for (let i = 0; i < 8; i++) { const x = -40 + i * 8.5, z = -6 - (i % 2) * 3; FP.push([BG.box, [0xff7a1a, 0x2a4a8a, 0xd82a2a, 0x3aa85a][i % 4], K.M(x, .02, z, 2.4, .04, 1.6), 0]); for (let k = 0; k < 5; k++) FP.push([BG.box, [0xf2c230, 0x8a4ad8, 0xe8e4da, 0x1a1a1a, 0xff7a1a][(k + i) % 5], K.M(x - .9 + k * .45, .15, z + ((k % 2) - .5) * .6, .3, .22, .3), 0]); STALLS.push([x, z + 1.6]) }
    FQ.push({ k: 'vrijmarkt', x: -6, y: 2.2, z: -4, w: 3.2, h: .8, ry: Math.PI });
    /* a DJ boat moored on the Singel */
    { const x = -110, z = -30; FP.push([BG.box, 0xff7a1a, K.M(x, WY + .3, z, 3.6, 1, 12), 0], [BG.box, 0x1a1a1a, K.M(x, WY + 1.2, z + 3, 2.4, .8, 2), 0], [BG.box, 0xf4f4f4, K.M(x, WY + 2.4, z, .1, 2.4, .1), 0]); for (let k = 0; k < 6; k++) FP.push([BG.cone, k % 2 ? 0xff7a1a : 0xffffff, K.M(x, WY + 3.4 - k * .1, z - 5 + k * 2, .3, .5, .05, Math.PI, 0, 0), 1]) }
    const festMesh = new THREE.Mesh(K.merge(FP), K.floraMat(0, { rough: .7 })); festMesh.material.userData.lin = 1; fest.add(festMesh);
    /* ---------- the Museum quarter + Vondelpark (amsterdam_zuid.js) ---------- */
    AMS.Z = null; if (AMS.zuid) try { AMS.Z = AMS.zuid(ctx, { T, st, box, sign }) } catch (e) { console.warn('amsterdam zuid', e); AMS.stats.zuidErr = String(e && e.stack || e).slice(0, 300) }
    /* ---------- Leidseplein nightlife (amsterdam_leidse.js) ---------- */
    AMS.LP = null; if (AMS.leidse) try { AMS.LP = AMS.leidse(ctx, { T, st }) } catch (e) { console.warn('amsterdam leidse', e); AMS.stats.leidseErr = String(e && e.stack || e).slice(0, 300) }
    /* ---------- the IJ, the ferries and Amsterdam-Noord (amsterdam_noord.js) ---------- */
    AMS.ND = null; if (AMS.noord) try { AMS.ND = AMS.noord(ctx, { T, st }) } catch (e) { console.warn('amsterdam noord', e); AMS.stats.noordErr = String(e && e.stack || e).slice(0, 300) }
    /* ---------- merge everything static ---------- */
    atlas(); const solidM = K.floraMat(0, { rough: .82 }); solidM.userData.lin = 1; const solid = new THREE.Mesh(K.merge(P), solidM); solid.castShadow = solid.receiveShadow = true; solid.name = 'ams_static'; grp.add(solid);
    if (Gs.length) { const gm = new THREE.MeshStandardMaterial({ color: 0xa8c8d8, roughness: .05, metalness: .2, transparent: true, opacity: .25, depthWrite: false }); gm.userData.lin = 1; const gmesh = new THREE.Mesh(K.merge(Gs), gm); gmesh.renderOrder = 2; gmesh.name = 'ams_glass'; grp.add(gmesh) }
    const glowM = new THREE.MeshBasicMaterial({ vertexColors: true }); glowM.userData.lin = 1; const glow = new THREE.Mesh(K.merge(Gl), glowM); glow.name = 'ams_glow'; grp.add(glow); AMS.glow = glow;
    const signM = new THREE.MeshStandardMaterial({ map: SG.tex, emissiveMap: SG.tex, emissive: 0xffffff, emissiveIntensity: .25, roughness: .55, alphaTest: .3 }); signM.userData.lin = 1; const signs = new THREE.Mesh(quadGeo(Q), signM); signs.name = 'ams_signs'; grp.add(signs); AMS.signM = signM;
    const fsigns = new THREE.Mesh(quadGeo(FQ), signM); fest.add(fsigns);
    AMS.stats.parts = P.length + Gl.length; AMS.stats.signs = Q.length; AMS.stats.atlasOver = (SG.over || []).length;
    /* night: lit windows dim by day, signs brighten at night */
    ctx.upd.push(() => { const h = (S.time / 60) % 24, n = h > 20 || h < 6 ? 1 : h > 18.5 ? (h - 18.5) / 1.5 : h < 7.5 ? (7.5 - h) / 1.5 : 0; signM.emissiveIntensity = .25 + .8 * n; glowM.color.setScalar(.35 + .65 * n) });
    AMS.ctx = ctx; AMS.stalls = STALLS;
    if (AMS.life) try { AMS.life(ctx, { T, sh, kr, ln, pl, st, box, STALLS, fest }) } catch (e) { console.warn('amsterdam life', e); AMS.stats.lifeErr = String(e && e.stack || e).slice(0, 300) }
    const PLc = (id, en, es, x, z, yaw) => ({ id, name: [en, es], x, z, yaw });
    const mapRoads = [[0, -150, 0, 90, 12], [-60, -136, 60, -136, 30], [-48, -22, 45, -22, 40], [-12, -60, -200, -60, 8], [-12, 10, -200, 10, 8], [-99, -132, -99, 62, 6], [-121, -132, -121, 62, 6], [-149, -132, -149, 62, 6], [-171, -132, -171, 62, 6], [-197, -132, -197, 62, 6], [13, -112, 13, -62, 3]];
    const places = [PLc('centraal', 'Centraal Station', 'Estación Central', -22, -136, Math.PI), PLc('damrak', 'Damrak', 'Damrak', 0, -85, Math.PI), PLc('dam', 'Dam Square', 'Plaza Dam', 0, -24, Math.PI), PLc('paleis', 'Royal Palace (Dam)', 'Palacio Real (Dam)', -45, -24, -Math.PI / 2),
      PLc('singel', 'Singel bridge', 'Puente del Singel', -110, -60, -Math.PI / 2), PLc('heren', 'Herengracht', 'Herengracht', -149, 10, Math.PI), PLc('jordaan', 'Jordaan lane', 'Calle del Jordaan', -197, -20, Math.PI), PLc('boat', 'Canal boat stop', 'Parada de barcos', -149, -110, Math.PI)];
    for (const [k, en] of [['kraantje', "Café 't Gouden Kraantje"], ['lantaarn', 'Coffeeshop De Blauwe Lantaarn'], ['platen', 'Groove Dealers Platen'], ['fietsen', "Jasper's Fietsen"], ['molen', 'Bakkerij Van der Molen'], ['proeflokaal', 'Monkey Brew Proeflokaal'], ['waterkant', 'De Waterkant (live music)'], ['kaas', 'Kaashandel Jansen']]) { const s = sh[k]; if (s) places.push(PLc(k, en, en, s.x + s.face * 3, s.z, s.face > 0 ? -Math.PI / 2 : Math.PI / 2)) }
    if (AMS.Z) { for (const r of AMS.Z.roads) mapRoads.push(r); for (const p of AMS.Z.places) places.push(PLc(p[0], p[1], p[2], p[3], p[4], p[5])) }
    if (AMS.ND) { for (const r of AMS.ND.roads) mapRoads.push(r); for (const p of AMS.ND.places) places.push(PLc(p[0], p[1], p[2], p[3], p[4], p[5])) }
    if (AMS.LP) { for (const r of AMS.LP.roads) mapRoads.push(r); for (const p of AMS.LP.places) places.push(PLc(p[0], p[1], p[2], p[3], p[4], p[5])) }
    AMS.stats.shopsPlaced = Object.keys(sh).length;
    return { name: 'Amsterdam', surface: surf, fog: [80, 420], sky: { exp: .86, tint: [0x7a92a8, 0xc8d0d8, .35, .3], dome: { s1: 0xd8dce2, s2: 0x9ab0c8, swirl: .01, cloud: .75, glow: .3 } },
      arrivals: { default: { x: -22, z: -136, yaw: Math.PI * .88 }, pipe: { x: -24, z: -130, yaw: Math.PI * .88 }, train: { x: -14, z: -146, yaw: Math.PI } }, defaultArrival: 'default',
      mapRoads, places, mapNav: AMS.nav || null, routeGroup: (x, z) => z < -260 ? 'noord' : 'main',   /* the IJ separates Noord: you cross it by ferry */
      greet: { human: [['Goedemorgen! Mind the bike lane — it is red for a reason.', '¡Goedemorgen! Cuidado con el carril bici: es rojo por algo.'], ['Dam is that way. Follow the tram rails.', 'Dam está por allí. Sigue los raíles del tranvía.']] },
      chatLines: [['Fietsen everywhere. I counted twelve on one bridge.', 'Bicis por todas partes. Conté doce en un puente.'], ['Koningsdag this Sunday — everything goes orange.', 'Koningsdag este domingo: todo se vuelve naranja.'], ['Best stroopwafels are at the bakery on Damrak.', 'Los mejores stroopwafels, en la panadería de Damrak.']],
      musicProfile: { bpm: 96, root: 48, scale: [0, 2, 3, 5, 7, 10], style: 'amb' } };
  }
});
})(window.AV);
