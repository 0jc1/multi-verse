/* APEVERSE 2.2 GLOBAL WORLDS - gw_city.js : the city dresser (agent 4).  Turns a gw_kit network into a finished city, so each new
   city file only supplies its plan, palettes, signs, landmarks and life:
     GW.paint.*        sign painters: gold board, painted wall lettering, plain enamel, neon, azulejo tile panel
     GW.dress(ctx, o)  lots -> houses (medHouse) + shopfronts (sign, window display, awning) + wall lanterns + street-name plaques;
                       special businesses on chosen streets, walk-ins carved with a real door and a tiled, beamed interior;
                       leftover block land as blank walls / roofs; ground (setts, plaza slabs, sand/albero), car-road asphalt;
                       the sea or river with quay walls; trees, palms, lamps (each blocks the walk mask where it stands)
     GW.finish(ctx, d) merge everything: solids (culled beyond the fog), house detail + signs (distance LOD), glass, glow, the
                       festival layer; signs + windows brighten at night.  Returns the meshes and stats.
   Coordinates as in gw_kit (x east, z south).  Nothing here knows about a particular city. */
'use strict';
(function (AV) {
const GW = AV.gwkit, TAU = Math.PI * 2;
/* ---------------- sign painters ---------------- */
const fit = (...a) => GW.fit(...a), rr = (...a) => GW.rr(...a);
GW.paint = {
  gold: (top, sub, bg, gold) => (g, w, h) => { g.fillStyle = bg || '#1a2a1e'; g.fillRect(0, 0, w, h); g.strokeStyle = gold || '#c8a040'; g.lineWidth = 6; g.strokeRect(9, 9, w - 18, h - 18); const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#fbe6a0'); gr.addColorStop(.55, '#c89a3a'); gr.addColorStop(1, '#8a6420'); g.fillStyle = gr; g.textAlign = 'center'; g.textBaseline = 'middle'; fit(g, top, w - 70, h * .5, 'italic 700 #px Georgia, serif', h * .43, w / 2); g.fillStyle = '#efe2bc'; fit(g, sub, w - 90, h * .16, '#px Georgia, serif', h * .79, w / 2) },
  painted: (top, sub, ink, bg, font) => (g, w, h) => { g.fillStyle = bg || '#f4efe4'; g.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { g.fillStyle = 'rgba(120,100,70,' + Math.random() * .06 + ')'; g.fillRect(Math.random() * w, Math.random() * h, 3, 2) } g.fillStyle = 'rgba(0,0,0,.18)'; g.textAlign = 'center'; g.textBaseline = 'middle'; fit(g, top, w - 40, h * .56, font || '700 #px Georgia, serif', h * .44 + 3, w / 2 + 3); g.fillStyle = ink || '#7a2418'; fit(g, top, w - 40, h * .56, font || '700 #px Georgia, serif', h * .44, w / 2); if (sub) { g.fillStyle = ink || '#7a2418'; fit(g, sub, w - 60, h * .17, 'italic #px Georgia, serif', h * .82, w / 2) } },
  plain: (top, sub, bg, fg, ac, font) => (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = ac; g.fillRect(0, h - 9, w, 9); g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; fit(g, top, w - 50, h * .5, font || '800 #px Arial, sans-serif', h * .42, w / 2); g.fillStyle = ac; fit(g, sub, w - 60, h * .17, '600 #px Arial, sans-serif', h * .8, w / 2) },
  neon: (top, sub, c1, c2) => (g, w, h) => { g.fillStyle = '#120c10'; g.fillRect(0, 0, w, h); g.shadowColor = c1; g.shadowBlur = 16; g.fillStyle = c1; g.textAlign = 'center'; g.textBaseline = 'middle'; fit(g, top, w - 80, h * .5, 'italic 700 #px "Brush Script MT", "Segoe Script", Georgia, cursive', h * .42, w / 2); g.shadowColor = c2; g.fillStyle = c2; fit(g, sub, w - 80, h * .16, '700 #px Arial, sans-serif', h * .8, w / 2); g.shadowBlur = 0 },
  az: (t, sub, o) => GW.azulejo(t, Object.assign({ sub }, o || {}))
};
/* window displays shared by every Mediterranean city */
GW.WINDOWS = [
  ['w_ceramic', 256, 160, (g, w, h) => { g.fillStyle = '#f4ecd8'; g.fillRect(0, 0, w, h); for (let i = 0; i < 6; i++) { const x = 24 + i * 42, y = 50 + (i % 2) * 60; g.fillStyle = ['#1f4a9a', '#e8a820', '#2a8a4a'][i % 3]; g.beginPath(); g.arc(x, y, 19, 0, 7); g.fill(); g.fillStyle = '#f8f4ea'; g.beginPath(); g.arc(x, y, 11, 0, 7); g.fill() } }],
  ['w_dress', 256, 160, (g, w, h) => { g.fillStyle = '#2a1a1e'; g.fillRect(0, 0, w, h); for (let i = 0; i < 3; i++) { const x = 44 + i * 84; g.fillStyle = ['#c8143a', '#f2d23a', '#2a8ad8'][i]; g.beginPath(); g.moveTo(x, 20); g.lineTo(x + 16, 70); g.quadraticCurveTo(x + 40, 130, x + 34, 156); g.lineTo(x - 34, 156); g.quadraticCurveTo(x - 40, 130, x - 16, 70); g.closePath(); g.fill() } }],
  ['w_tapas', 256, 160, (g, w, h) => { g.fillStyle = '#3a2414'; g.fillRect(0, 0, w, h); for (let i = 0; i < 5; i++) { g.fillStyle = '#7a2a1a'; g.beginPath(); g.ellipse(26 + i * 50, 46, 14, 34, 0, 0, 7); g.fill() } for (let i = 0; i < 6; i++) { g.fillStyle = '#e8e0d0'; g.beginPath(); g.ellipse(22 + i * 42, 128, 18, 8, 0, 0, 7); g.fill(); g.fillStyle = ['#d8a040', '#c83a2a', '#6a8a3a'][i % 3]; g.beginPath(); g.ellipse(22 + i * 42, 124, 11, 5, 0, 0, 7); g.fill() } }],
  ['w_books', 256, 160, (g, w, h) => { g.fillStyle = '#3a2a1e'; g.fillRect(0, 0, w, h); for (let r = 0; r < 3; r++) for (let x = 6; x < w - 6;) { const bw = 6 + Math.random() * 10; g.fillStyle = ['#8a2a2a', '#2a4a6a', '#e8dcc0', '#3a6a3a', '#c8a040', '#5a3a6a'][(Math.random() * 6) | 0]; g.fillRect(x, 10 + r * 50, bw, 40 - Math.random() * 8); x += bw + 1 } }],
  ['w_goods', 256, 160, (g, w, h) => { g.fillStyle = '#ece6da'; g.fillRect(0, 0, w, h); g.fillStyle = '#9a8a7a'; g.fillRect(0, 74, w, 4); g.fillRect(0, 140, w, 4); for (let i = 0; i < 9; i++) { g.fillStyle = ['#c8143a', '#2a6ad8', '#3aa85a', '#f2c230', '#8a4ad8', '#1a1a1a'][(i * 5) % 6]; g.fillRect(10 + i * 27, 36 + (i % 3) * 6, 18, 38 - (i % 3) * 6); g.fillRect(14 + i * 27, 104, 16, 36) } }],
  ['w_sweets', 256, 160, (g, w, h) => { g.fillStyle = '#f6ead4'; g.fillRect(0, 0, w, h); for (let r = 0; r < 2; r++) for (let i = 0; i < 7; i++) { g.fillStyle = ['#e8b040', '#c87a2a', '#f4e0a0', '#8a4a2a'][(i + r) % 4]; g.beginPath(); g.arc(22 + i * 35, 50 + r * 62, 13, 0, 7); g.fill() } }],
  ['w_fish', 256, 160, (g, w, h) => { g.fillStyle = '#dfe8ec'; g.fillRect(0, 0, w, h); g.fillStyle = '#e8f0f4'; g.fillRect(0, 90, w, 70); for (let i = 0; i < 7; i++) { g.fillStyle = ['#8a9aa8', '#c8b8a0', '#6a7a88'][i % 3]; g.beginPath(); g.ellipse(24 + i * 34, 116 + (i % 2) * 14, 16, 6, .2, 0, 7); g.fill() } g.fillStyle = '#c84a2a'; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(30 + i * 46, 52, 10, 0, 7); g.fill() } }],
  ['w_masks', 256, 160, (g, w, h) => { g.fillStyle = '#1a1420'; g.fillRect(0, 0, w, h); for (let i = 0; i < 5; i++) { const x = 28 + i * 50, y = 60 + (i % 2) * 40; g.fillStyle = ['#e8c040', '#c8143a', '#2aa8d8', '#f2f0ea', '#8a4ad8'][i]; g.beginPath(); g.ellipse(x, y, 20, 13, 0, 0, 7); g.fill(); g.fillStyle = '#1a1420'; g.beginPath(); g.ellipse(x - 8, y - 2, 5, 3, 0, 0, 7); g.ellipse(x + 8, y - 2, 5, 3, 0, 0, 7); g.fill() } }]
];
GW.plaques = (list, o) => list.map(([id, name]) => ['n_' + id, 192, 72, GW.paint.az(name, null, Object.assign({ rows: 3, border: '#1f4a9a', accent: '#e8a820', ink: '#1a3a8a', font: '700 #px Georgia, serif' }, o || {}))]);
/* ---------------- ground textures ---------------- */
function canvasTex(size, fn, rep) { const c = document.createElement('canvas'); c.width = c.height = size; fn(c.getContext('2d'), size); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t }
GW.tex = {
  setts: (base) => canvasTex(256, (g, s) => { g.fillStyle = base || '#6e665c'; g.fillRect(0, 0, s, s); for (let y = 0; y < s; y += 16) for (let x = -16; x < s; x += 22) { const ox = (y / 16) % 2 ? 11 : 0, v = 120 + Math.random() * 46; g.fillStyle = 'rgb(' + (v + 8 | 0) + ',' + (v | 0) + ',' + (v - 12 | 0) + ')'; rr(g, x + ox + 1, y + 1, 20, 14, 3); g.fill() } }, 1 / 3.5),
  slabs: (tone) => canvasTex(256, (g, s) => { g.fillStyle = '#b8ab94'; g.fillRect(0, 0, s, s); for (let y = 0; y < s; y += 64) for (let x = 0; x < s; x += 64) { const v = (tone || 205) + Math.random() * 28; g.fillStyle = 'rgb(' + (v | 0) + ',' + (v - 10 | 0) + ',' + (v - 28 | 0) + ')'; g.fillRect(x + 2, y + 2, 60, 60) } }, 1 / 5),
  checker: () => canvasTex(256, (g, s) => { for (let y = 0; y < s; y += 32) for (let x = 0; x < s; x += 32) { g.fillStyle = ((x + y) / 32) % 2 ? '#e8e4dc' : '#3a3a3e'; g.fillRect(x, y, 32, 32) } }, 1 / 4),   /* black-and-white marble (Cádiz plazas) */
  sand: (c) => canvasTex(256, (g, s) => { g.fillStyle = c || '#e0c890'; g.fillRect(0, 0, s, s); for (let i = 0; i < 4000; i++) { const v = Math.random(); g.fillStyle = v < .5 ? 'rgba(170,140,90,.22)' : 'rgba(255,240,200,.25)'; g.fillRect(Math.random() * s, Math.random() * s, 2, 2) } }, 1 / 5)
};
/* ---------------- dress ----------------
   o = { N, lots, rng, q, styleFor(lot) -> style, shopP(street) -> probability, GEN [generic sign keys], WIN {sign: display}, SPECIAL [[key, street, [x,z], hollowDepth, minW, display]],
         walkIn(key, it, put, putG, blk) fit-out, ground { base, plaza, open(o) }, sea (water opts) + quay polygons, roads (asphalt), trees, palmsOn(street) }
   returns d = { P, Gl, Gs, D, Q, FP, FQ, FG, SH, IN, lots, box, obox, sign, stats } */
GW.dress = function (ctx, o) {
  const K = AV.kit, BG = K.BG, q = ctx.q, grp = ctx.group, N = o.N, rng = o.rng, lots = o.lots;
  const P = [], Gl = [], Gs = [], Q = [], FP = [], FQ = [], FG = [], D = [], stats = {};
  const box = (arr, hex, x0, x1, y0, y1, z0, z1, gl) => arr.push([BG.box, hex, K.M((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0)), gl || 0]);
  const obox = (arr, hex, ax, az, bx, bz, w, y0, y1, gl) => { const L2 = Math.hypot(bx - ax, bz - az); arr.push([BG.box, hex, K.M((ax + bx) / 2, (y0 + y1) / 2, (az + bz) / 2, L2, y1 - y0, w, 0, Math.atan2(-(bz - az), bx - ax), 0), gl || 0]) };
  const sign = (k, x, y, z, w, h, ry, arr) => (arr || Q).push({ k, x, y, z, w, h, ry });
  /* special businesses */
  const SH = {};
  for (const [k, sid, [ax, az], hd, minW] of o.SPECIAL || []) { let best = null, bd = 1e9; for (const l of lots) { if (l.src !== sid || l.sp || l.w < minW || (hd && l.d < hd + .4)) continue; const d = Math.hypot(l.x - ax, l.z - az); if (d < bd) { bd = d; best = l } }
    if (best) { best.sp = k; best.hollow = hd ? Math.min(hd, best.d - .4) : 0; SH[k] = best } else (stats.missingShops = stats.missingShops || []).push(k) }
  const spDisplay = {}; for (const s of o.SPECIAL || []) spDisplay[s[0]] = s[5] || 'w_goods';
  /* houses */
  const streetOf = {}; for (const s of N.streets) streetOf[s.id] = s;
  let gi = 0, nShop = 0, nLant = 0; const plaqueDone = {};
  if (N.height) for (const l of lots) { const ys = [N.height(l.x, l.z), N.height(l.x + l.nx * l.d, l.z + l.nz * l.d)]; l.y = Math.min(...ys); l.dy = Math.max(...ys) - l.y }
  for (const l of lots) { const sty = Object.assign({ q }, o.styleFor(l)), s = streetOf[l.src], shopP = l.sp ? 1 : (o.shopP ? o.shopP(s, l) : s ? (s.shops != null ? s.shops : s.kind === 'alley' ? .1 : s.kind === 'lane' ? .25 : .35) : .45);
    const isShop = !!l.sp || rng() < shopP, doorX = l.w / 2 - 1.5;
    const H = GW.medHouse(P, Gl, l, sty, rng, { D, shop: isShop, lit: isShop && rng() < .7, hollow: l.hollow || 0, doorX, glass: Gs, shopCol: [0x2a1e16, 0x1e3a2a, 0x3a1a14, 0x1a1a1a, 0x5a3418, 0x1a2a4a][(rng() * 6) | 0], floors: l.sp ? sty.floors[1] : 0 });
    l.H = H; const at = (x, z) => GW.localPt(H.base, x, z), ly = l.y || 0;
    if (isShop) { nShop++; const k = l.sp || o.GEN[(gi++ * 7 + (rng() * 3 | 0)) % o.GEN.length]; l.sign = k; const sw = Math.min(l.w - .8, l.sp ? 5.6 : 4.2), [sx, sz] = at(0, .2); sign(k, sx, 3.3 + ly, sz, sw, sw * (l.sp ? .208 : .219), l.yaw);
      if (!l.hollow) { const wk = l.sp ? spDisplay[k] : (o.WIN[k] || 'w_goods'), [wx, wz] = at(-.4, .17); sign(wk, wx, 1.45 + ly, wz, Math.min(l.w - 2.2, 3.2), 1.9, l.yaw) }
      if (q > 0 && rng() < (o.awning || .35) && !(s && s.toldo)) { const c = (o.awningCols || [[0x2a6a3a, 0xf2f0ea], [0xb01a1a, 0xf2f0ea], [0xe8a820, 0xf2f0ea], [0x1f4a7a, 0xf2f0ea]])[(rng() * 4) | 0], ww = Math.min(l.w - 1, 4.4), n = 6; for (let i = 0; i < n; i++) GW.putter(D, H.base)(BG.box, c[i % 2], -ww / 2 + ww * (i + .5) / n, 2.85, .65, ww / n, .05, 1.3, 0, .38, 0, 0) } }
    if (rng() < (o.lanterns || .22)) { const u = (rng() < .5 ? -1 : 1) * (l.w / 2 - .5), put = GW.putter(D, H.base), putG = GW.putter(Gl, H.base); put(BG.box, 0x1a1a1a, u, 4.35, .35, .06, .06, .7); put(BG.box, 0x1a1a1a, u, 4.2, .72, .34, .5, .34); putG(BG.box, 0xffd08a, u, 4.2, .72, .26, .38, .26, 1); nLant++ }
    const pk = s ? s.id : l.src; if (!plaqueDone[pk] && l.w > 5) { plaqueDone[pk] = 1; const [px, pz] = at(-(l.w / 2 - .7), .07); sign('n_' + pk, px, 3.95 + ly, pz, 1.05, .39, l.yaw) } }
  stats.houses = lots.length; stats.shopFronts = nShop; stats.lanterns = nLant;
  /* leftover block land */
  const fill = N.filler({ max: N.height ? 12 : 36 }); let nf = 0; const fy = (x, z) => N.height ? N.height(x, z) : 0;
  for (const f of fill) { const [x0, x1, z0, z1] = f.r, ys = [fy(x0, z0), fy(x1, z0), fy(x0, z1), fy(x1, z1)], y0 = Math.min(...ys), y1 = Math.max(...ys); if (f.vis) { const h = 6.5 + rng() * 4 + (y1 - y0), wc = o.fillerWall ? o.fillerWall((x0 + x1) / 2, (z0 + z1) / 2) : 0xf4f0e6; box(P, wc, x0, x1, y0 - (N.height ? 2 : 0), y0 + h, z0, z1); box(P, o.fillerCap || 0xb05a30, x0 - .12, x1 + .12, y0 + h, y0 + h + .22, z0 - .12, z1 + .12); box(P, o.fillerBase || 0xe0a830, x0 - .02, x1 + .02, y0 - (N.height ? 2 : 0), y0 + .9, z0 - .02, z1 + .02); nf++; if (o.onFiller) o.onFiller(f.r, h, y0) }
    else box(P, 0xc8beb0, x0, x1, y0 - (N.height ? 2 : 0), y1 + 8 + ((x0 * 7 + z0 * 3) & 3), z0, z1) }
  stats.filler = fill.length; stats.fillerVis = nf;
  /* walk-ins */
  const IN = {};
  for (const k in SH) { const l = SH[k]; if (!l.hollow) continue; const b = l.H.base, hd = l.hollow, w = l.w, dx = l.w / 2 - 1.5;
    N.carve(GW.lrect(b, -w / 2 + .3, w / 2 - .3, -(hd - .3), -.3), N.height ? l.y || 0 : null); N.carve(GW.lrect(b, dx - 1.3, dx + 1.3, -1.1, .8));
    const put = GW.putter(P, b), putG = GW.putter(Gl, b), blk = (x0, x1, z0, z1) => N.block(GW.lrect(b, x0, x1, z0, z1));
    const look = (o.interiorLook && o.interiorLook(k)) || {}, dado = look.dado || [0x1f4a9a, 0xe8a820], wallC = look.wall || 0xf2ece0;
    put(BG.box, look.floor || 0x8a6a4a, 0, .03, -hd / 2, w - .6, .06, hd - .6);
    for (const sx of [-1, 1]) { put(BG.box, wallC, sx * (w / 2 - .32), 2.2, -hd / 2, .04, 2.6, hd - .6); put(BG.box, dado[0], sx * (w / 2 - .33), .65, -hd / 2, .04, 1.3, hd - .6); put(BG.box, dado[1], sx * (w / 2 - .34), 1.33, -hd / 2, .04, .08, hd - .6) }
    put(BG.box, wallC, 0, 2.2, -hd + .32, w - .6, 2.6, .04); put(BG.box, dado[0], 0, .65, -hd + .33, w - .6, 1.3, .04); put(BG.box, dado[1], 0, 1.33, -hd + .34, w - .6, .08, .04);
    put(BG.box, 0xe8e0d0, 0, 3.52, -hd / 2, w - .6, .04, hd - .6); for (let z = -1; z > -hd + .5; z -= 1.2) put(BG.box, 0x4a2e1a, 0, 3.42, z, w - .6, .16, .18); put(BG.box, 0x1a1a1a, 0, 3.1, -hd / 2, .03, .7, .03); putG(BG.box, 0xffd890, 0, 2.7, -hd / 2, .4, .32, .4, 1);
    const it = IN[k] = { lot: l, base: b, hd, w, door: GW.localPt(b, dx, 1.2), doorIn: GW.localPt(b, dx, -1.4), mid: GW.localPt(b, 0, -hd / 2), at: (x, z) => GW.localPt(b, x, z) };
    /* the doorway must be walkable end to end (a diagonal door can pinch shut after erosion): widen it until it is */
    for (let k2 = 0; k2 < 3 && !N.lineWalk(it.door[0], it.door[1], it.doorIn[0], it.doorIn[1], .2); k2++) { N.carve(GW.lrect(b, dx - 1.5 - k2 * .2, dx + 1.5 + k2 * .2, -1.6, 1)); stats.doorsWidened = (stats.doorsWidened || 0) + 1 }
    if (!N.lineWalk(it.door[0], it.door[1], it.doorIn[0], it.doorIn[1], .2)) (stats.doorsBlocked = stats.doorsBlocked || []).push(k);
    if (o.walkIn) o.walkIn(k, it, put, putG, blk) }
  /* ground */
  const tex = o.ground || {}, gT = tex.base || GW.tex.setts(), sT = tex.plaza || GW.tex.slabs(), aT = tex.open || GW.tex.sand();
  const shapeMesh = (polys, t, y, rough, name) => { if (!polys.length) return null; const parts = polys.map(P2 => { const sh = new THREE.Shape(P2.map(p => new THREE.Vector2(p[0], -p[1]))); const g = new THREE.ShapeGeometry(sh); g.rotateX(-Math.PI / 2); if (N.height) { const pa = g.attributes.position; for (let i = 0; i < pa.count; i++) pa.setY(i, N.height(pa.getX(i), pa.getZ(i))) } return [g, 0xffffff, null, 0] });   /* draped over a slope */ const g = K.merge(parts); g.deleteAttribute('color'); g.deleteAttribute('aGlow'); const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: t, roughness: rough })); m.position.y = y; m.receiveShadow = true; m.material.userData.lin = 1; m.name = name; grp.add(m); return m };
  if (N.lands.length) shapeMesh(N.lands.map(l => l.poly), gT, -.01, .9, o.name + '_ground');
  else { const g = new THREE.PlaneGeometry(N.x1 - N.x0, N.z1 - N.z0); g.rotateX(-Math.PI / 2); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (N.x1 - N.x0), uv.getY(i) * (N.z1 - N.z0)); const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: gT, roughness: .9 })); m.position.set((N.x0 + N.x1) / 2, -.01, (N.z0 + N.z1) / 2); m.receiveShadow = true; m.material.userData.lin = 1; m.name = o.name + '_ground'; grp.add(m) }
  if (o.hill) { const [x0, x1, z0, z1] = o.hill, nx2 = Math.ceil((x1 - x0) / 3), nz2 = Math.ceil((z1 - z0) / 3), g = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx2, nz2); g.rotateX(-Math.PI / 2); const pa = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < pa.count; i++) { const x = pa.getX(i) + (x0 + x1) / 2, z = pa.getZ(i) + (z0 + z1) / 2; pa.setY(i, N.height(x, z) - .02); uv.setXY(i, x, -z) } g.computeVertexNormals(); const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: o.hillTex || aT, roughness: .95 })); m.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2); m.receiveShadow = true; m.material.userData.lin = 1; m.name = o.name + '_hill'; grp.add(m) }
  shapeMesh(N.plazas.filter(p => !p.noPave).map(p => p.poly).concat(o.extraPave || []), sT, .012, .8, o.name + '_plazas');
  shapeMesh(N.opens.filter(p => !p.pave).map(p => p.poly).concat(o.extraOpen || []), aT, .014, .95, o.name + '_open');
  if (N.opens.some(p => p.pave)) shapeMesh(N.opens.filter(p => p.pave).map(p => p.poly), o.quayTex || gT, .006, .9, o.name + '_quays');
  for (const s of N.streets) { if (!s.car || s.kind === 'promenade' || N.height) continue; for (let i = 0; i + 1 < s.pts.length; i++) { const [a, b] = [s.pts[i], s.pts[i + 1]]; obox(P, 0x3a3a3e, a[0], a[1], b[0], b[1], Math.max(3, s.w - 5), 0, .03) } }
  /* the sea: one water plane under everything, quay walls along the coast (not along the beach) */
  if (o.sea) { const wm = K.water(o.sea); const g = new THREE.PlaneGeometry(N.x1 - N.x0 + 600, N.z1 - N.z0 + 600); const w = new THREE.Mesh(g, wm); w.rotation.x = -Math.PI / 2; w.position.set((N.x0 + N.x1) / 2, o.seaY || -2.6, (N.z0 + N.z1) / 2); w.renderOrder = 1; w.name = o.name + '_sea'; grp.add(w);
    for (const l of N.lands) { const C = l.poly; for (let i = 0; i < C.length; i++) { const a = C[i], b = C[(i + 1) % C.length]; if (o.noQuay && o.noQuay(a, b)) continue; obox(P, o.quayCol || 0xc8b890, a[0], a[1], b[0], b[1], .9, (o.seaY || -2.6) - 1.4, .05); obox(P, 0xe0d4b4, a[0], a[1], b[0], b[1], 1.1, -.05, .3) } } }
  /* trees, palms, lamps */
  const trees = [], palms = [], lamps = [], freeAt = (x, z, m) => N.walk(x, z) && N.walk(x + m, z) && N.walk(x - m, z) && N.walk(x, z + m) && N.walk(x, z - m);
  for (const s of N.streets) { if (!(o.treesOn ? o.treesOn(s) : s.w >= 6.4)) continue; const sp = s.kind === 'avenue' || s.kind === 'promenade' ? 11 : 9, off = s.w / 2 - 1.5;
    for (let i = 0; i + 1 < s.pts.length; i++) { const [a, b] = [s.pts[i], s.pts[i + 1]], L2 = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L2, uz = (b[1] - a[1]) / L2;
      for (let t = sp / 2; t < L2 - 2; t += sp) for (const sd of s.sides ? s.sides.map(v => -v) : [1, -1]) { const x = a[0] + ux * t - uz * sd * off, z = a[1] + uz * t + ux * sd * off; if (s.toldo) continue; if (freeAt(x, z, 1.4)) ((o.palmsOn && o.palmsOn(s)) ? palms : trees).push([x, z]) } } }
  for (const p of N.plazas) { if (p.noTrees || p.market) continue; const P2 = p.poly; let cx = 0, cz = 0; for (const v of P2) { cx += v[0]; cz += v[1] } cx /= P2.length; cz /= P2.length; const r = p.r || Math.min(...P2.map(v => Math.hypot(v[0] - cx, v[1] - cz)));
    const n = Math.max(4, Math.round(r * TAU / 9)); for (let i = 0; i < n; i++) { const a = i / n * TAU, x = cx + Math.cos(a) * r * .72, z = cz + Math.sin(a) * r * .72; if (freeAt(x, z, 1.4)) ((o.plazaPalms && o.plazaPalms(p)) ? palms : trees).push([x, z]) } lamps.push([cx + r * .35, cz + r * .35]) }
  for (const pt of o.extraTrees || []) trees.push(pt); for (const pt of o.extraPalms || []) palms.push(pt);
  const tc = o.treeCols || [0x2e5a26, 0x3a6a2e, 0x34622a], fruit = o.fruit === undefined ? 0xf08a1a : o.fruit;
  const gy = (x, z) => N.height ? N.height(x, z) : 0, ts = o.treeScale || 1;
  for (const [x, z] of trees) { const h = (3.2 + rng() * .8) * ts, y0 = gy(x, z); box(P, 0x4a3a2a, x - .13 * ts, x + .13 * ts, y0, y0 + h * .45, z - .13 * ts, z + .13 * ts); P.push([q > 1 ? BG.ico : BG.ico0, tc[(rng() * 3) | 0], K.M(x, y0 + h * .72, z, 1.6 * ts, 1.25 * ts, 1.6 * ts), 0]); if (q > 0) P.push([BG.ico0, tc[1], K.M(x + .5 * ts, y0 + h * .9, z - .3, ts, .8 * ts, ts), 0]); if (fruit != null) for (let k = 0; k < (q ? 3 : 1); k++) { const a = rng() * TAU; D.push([BG.sphL, fruit, K.M(x + Math.cos(a) * 1.35, y0 + h * .7 + (rng() - .3) * .8, z + Math.sin(a) * 1.35, .12, .12, .12), 0]) } box(P, 0xb8a888, x - .55, x + .55, y0, y0 + .08, z - .55, z + .55); N.blockCircle(x, z, .25) }
  for (const [x, z] of palms) { const h = 9 + rng() * 5, y0 = gy(x, z); for (let k = 0; k < 4; k++) P.push([BG.cyl, 0x8a7a5a, K.M(x + k * .04, y0 + h * (k + .5) / 4, z, .22 - k * .02, h / 4, .22 - k * .02), 0]); for (let k = 0; k < 7; k++) { const a = k / 7 * TAU; P.push([BG.cone, [0x3a6a2a, 0x4a7a34][k % 2], K.M(x + Math.cos(a) * 1.5, y0 + h - .2, z + Math.sin(a) * 1.5, .5, 3.4, .12, Math.PI / 2 + .5, -a, 0), 0]) } N.blockCircle(x, z, .3) }
  for (const [x, z] of lamps.concat(trees.filter((t, i) => i % 6 === 3).map(([x2, z2]) => [x2 + 2.2, z2]))) { if (!freeAt(x, z, .8)) continue; const y0 = gy(x, z); box(P, 0x1a1a1a, x - .07, x + .07, y0, y0 + 3.9, z - .07, z + .07); box(P, 0x1a1a1a, x - .3, x + .3, y0 + 3.85, y0 + 3.95, z - .06, z + .06); for (const sx of [-.28, .28]) box(Gl, 0xffd89a, x + sx - .1, x + sx + .1, y0 + 3.95, y0 + 4.3, z - .1, z + .1, 1); N.blockCircle(x, z, .15) }
  stats.trees = trees.length; stats.palms = palms.length;
  return { P, Gl, Gs, D, Q, FP, FQ, FG, SH, IN, lots, box, obox, sign, stats, freeAt };
};
/* ---------------- finish: merge + LOD + night ---------------- */
GW.finish = function (ctx, d, o) {
  const K = AV.kit, q = ctx.q, grp = ctx.group, S = AV.S, SG = o.SG, out = {};
  GW.atlas(o.SIGNS, SG, 2048, o.atlasH || 4096);
  const solidM = K.floraMat(0, { rough: .86 }); solidM.userData.lin = 1; out.solids = GW.chunked(d.P, 64, K.merge, solidM, grp, o.name + '_static', { shadow: true }); out.farStat = GW.lod(ctx, out.solids.filter(m => !/wide/.test(m.name)), o.far || 470);
  out.detailStat = GW.lod(ctx, GW.chunked(d.D, 40, K.merge, solidM, grp, o.name + '_detail'), [55, 85, 130][q]);
  if (d.Gs.length) { const gm = new THREE.MeshStandardMaterial({ color: 0xa8c8d8, roughness: .05, metalness: .2, transparent: true, opacity: .28, depthWrite: false }); gm.userData.lin = 1; GW.chunked(d.Gs, 128, K.merge, gm, grp, o.name + '_glass', { order: 2 }) }
  const glowM = new THREE.MeshBasicMaterial({ vertexColors: true }); glowM.userData.lin = 1; GW.chunked(d.Gl, 128, K.merge, glowM, grp, o.name + '_glow');
  const signM = new THREE.MeshStandardMaterial({ map: SG.tex, emissiveMap: SG.tex, emissive: 0xffffff, emissiveIntensity: .22, roughness: .55, alphaTest: .3, side: THREE.DoubleSide }); signM.userData.lin = 1; out.signStat = GW.lod(ctx, GW.chunked(d.Q, 64, qs => GW.quadGeo(qs, SG.r), signM, grp, o.name + '_signs'), [120, 180, 260][q]); out.signM = signM;
  const fest = out.fest = new THREE.Group(); fest.visible = false; grp.add(fest);
  if (d.FP.length) { const fm = K.floraMat(0, { rough: .7 }); fm.userData.lin = 1; GW.chunked(d.FP, 64, K.merge, fm, fest, o.name + '_fest') }
  if (d.FG.length) { const fg = new THREE.MeshBasicMaterial({ vertexColors: true }); fg.userData.lin = 1; GW.chunked(d.FG, 128, K.merge, fg, fest, o.name + '_fest_glow'); out.festGlowM = fg }
  if (d.FQ.length) { const fs = new THREE.Mesh(GW.quadGeo(d.FQ, SG.r), signM); fs.name = o.name + '_fest_signs'; fest.add(fs) }
  ctx.upd.push(() => { const h = (S.time / 60) % 24, n = h > 20.5 || h < 6 ? 1 : h > 19 ? (h - 19) / 1.5 : h < 7.5 ? (7.5 - h) / 1.5 : 0; signM.emissiveIntensity = .22 + .8 * n; glowM.color.setScalar(.35 + .65 * n) });
  Object.assign(d.stats, { parts: d.P.length + d.Gl.length + d.Gs.length + d.D.length, detailParts: d.D.length, festParts: d.FP.length + d.FG.length, signs: d.Q.length, atlasOver: (SG.over || []).length, atlasBad: (SG.bad || []).length, shopsPlaced: Object.keys(d.SH).length });
  return out };
})(window.AV);
/* ---------------- seasonal festivals (not weekly): week `wk` of every 4-week cycle of the Apeverse calendar, hStart for lenMin each
   day of that week; AV.fest.force(id, true|false|null) is the manual switch (null = follow the season).  Call on 'load'. ---------------- */
(function (AV) { const GW = AV.gwkit; GW.seasonal = function (id, def, wk, guideLine) { const F = AV.fest; if (!F || !F.LIST || F.LIST[id]) return null; const tr = AV.tr, say = a => tr(a[0], a[1]);
  F.LIST[id] = Object.assign({ wd: -1, season: true }, def);
  const inWeek = d => Math.floor(d / 7) % 4 === wk, oa = F.activeAt, on = F.next, og = F.guideHtml, h0 = def.h * 60, len = def.len;
  F.activeAt = (i, a) => { if (i !== id || F.forced[i] != null) return oa(i, a); const d = Math.floor(a / 1440), t = a - d * 1440; return (inWeek(d) && t >= h0) || (inWeek(d - 1) && t < h0 + len - 1440) };
  F.next = i => { if (i !== id) return on(i); for (let k = 0; k < 29; k++) { const d = AV.S.day + k; if (inWeek(d) && (k > 0 || AV.S.time < 24 * 60)) return d } return null };
  F.guideHtml = () => { const FL = F.LIST[id]; delete F.LIST[id]; let h = ''; try { h = og() } finally { F.LIST[id] = FL } const d = F.next(id), now = F.active(id); return h + '<div class="note"><b>🎪 ' + say(FL.n) + '</b><br>' + (now ? '🔴 ' + tr('ON NOW', 'AHORA') + ' · ' : '') + say(guideLine) + (!now && d != null ? '<br>' + tr('Next: day ', 'Próximo: día ') + d : '') + '</div>' };
  return { inWeek, next: () => F.next(id) } } })(window.AV);
