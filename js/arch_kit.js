/* APEVERSE V0.9.2 - arch_kit.js : hand-painted textures + organic architecture builders for big worlds.
   Everything is batched (K.batch) into a few merged, vertex-coloured meshes per district, so detail stays cheap.
   Builders return collision data; walkable heights (platforms, bridges, tiers) are registered in a "walk" object
   that the world's surface() function queries. */
'use strict';
(function (AV) {
const K = AV.kit, TAU = AV.TAU, M = K.M, BG = K.BG;
const A = AV.arch = {};

/* ======================= painted textures (generated once, kept across worlds) ======================= */
const TX = {};
function canvasTex(n, w, h, draw, rep) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d'); draw(c, w, h, AV.rng(n));
  const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; t.wrapS = t.wrapT = rep === false ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping; t.userData = { keep: true }; return t;
}
A.tex = function (name) {
  if (TX[name]) return TX[name];
  const T = {
    stone: () => canvasTex(11, 512, 512, (c, w, h, r) => {
      c.fillStyle = '#b8a48a'; c.fillRect(0, 0, w, h); let y = 0;
      while (y < h) { const bh = 44 + r() * 30; let x = -r() * 60; while (x < w) { const bw = 60 + r() * 70, v = 150 + r() * 60 | 0; c.fillStyle = 'rgb(' + v + ',' + (v - 14 - r() * 20 | 0) + ',' + (v - 38 - r() * 20 | 0) + ')'; c.beginPath(); c.roundRect ? c.roundRect(x + 3, y + 3, bw - 6, bh - 6, 9) : c.rect(x + 3, y + 3, bw - 6, bh - 6); c.fill(); x += bw } y += bh }
      for (let i = 0; i < 2500; i++) { c.fillStyle = r() < .5 ? 'rgba(60,40,30,.18)' : 'rgba(255,240,220,.18)'; c.fillRect(r() * w, r() * h, 2 + r() * 3, 2 + r() * 3) }
      for (let i = 0; i < 26; i++) { c.fillStyle = 'rgba(70,130,60,' + (.25 + r() * .3) + ')'; c.beginPath(); c.arc(r() * w, r() * h, 6 + r() * 22, 0, TAU); c.fill() }
    }),
    wood: () => canvasTex(12, 256, 256, (c, w, h, r) => { for (let y = 0; y < h; y += 32) { const v = 150 + r() * 50 | 0; c.fillStyle = 'rgb(' + v + ',' + (v * .68 | 0) + ',' + (v * .45 | 0) + ')'; c.fillRect(0, y, w, 30); c.strokeStyle = 'rgba(60,30,10,.35)'; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(0, y + 4 + r() * 22); c.bezierCurveTo(80, y + r() * 30, 170, y + r() * 30, w, y + 4 + r() * 22); c.stroke() } c.fillStyle = 'rgba(40,20,5,.6)'; c.fillRect(0, y + 30, w, 2) } }),
    stripes: () => canvasTex(13, 512, 256, (c, w, h, r) => { for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#d8c8e8'; c.fillRect(i * w / 16, 0, w / 16, h) } c.fillStyle = 'rgba(255,230,140,.95)'; for (let i = 0; i < 32; i++) { c.beginPath(); c.arc(i * w / 32 + 8, h - 10, 10, 0, Math.PI); c.fill() } c.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 90; i++) { c.beginPath(); c.arc(r() * w, r() * h * .8, 2 + r() * 3, 0, TAU); c.fill() } c.strokeStyle = 'rgba(120,60,160,.5)'; c.lineWidth = 3; for (let i = 0; i < 16; i++) { c.beginPath(); for (let y = 0; y < h; y += 8) c.lineTo(i * w / 16 + Math.sin(y / 18) * 5, y); c.stroke() } }),
    tiles: () => canvasTex(14, 256, 256, (c, w, h, r) => { c.fillStyle = '#c86a3a'; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 22) for (let x = (y / 22 % 2) * 16; x < w + 16; x += 32) { const v = r() * 40 | 0; c.fillStyle = 'rgb(' + (200 + v) + ',' + (100 + v) + ',' + (60 + v / 2) + ')'; c.beginPath(); c.arc(x, y + 18, 15, Math.PI, 0); c.lineTo(x + 15, y); c.lineTo(x - 15, y); c.fill(); c.strokeStyle = 'rgba(90,30,10,.5)'; c.stroke() } }),
    stucco: () => canvasTex(15, 256, 256, (c, w, h, r) => { c.fillStyle = '#f2e6d4'; c.fillRect(0, 0, w, h); for (let i = 0; i < 1800; i++) { c.fillStyle = r() < .5 ? 'rgba(120,90,60,.06)' : 'rgba(255,255,255,.1)'; c.fillRect(r() * w, r() * h, 3 + r() * 6, 3 + r() * 6) } c.strokeStyle = 'rgba(80,140,90,.45)'; c.lineWidth = 3; c.beginPath(); for (let x = 0; x <= w; x += 4) c.lineTo(x, h - 30 + Math.sin(x / 20) * 10); c.stroke(); for (let x = 10; x < w; x += 40) { c.fillStyle = ['#ff7ab8', '#ffd84a', '#9a7aff'][x / 40 % 3 | 0]; c.beginPath(); c.arc(x, h - 30 + Math.sin(x / 20) * 10, 6, 0, TAU); c.fill() } }),
    mosaic: () => canvasTex(16, 1024, 1024, (c, w, h, r) => {
      const cx = w / 2, cy = h / 2, R = w / 2; c.fillStyle = '#e8d2a0'; c.fillRect(0, 0, w, h);
      const ring = ['#d27a4a', '#7ac8b8', '#e8b040', '#c85a7a', '#5a7ac8', '#9ad86a', '#e8d2a0', '#ff8ad8'];
      for (let i = 12; i > 0; i--) { c.fillStyle = ring[i % ring.length]; c.beginPath(); c.arc(cx, cy, R * i / 12, 0, TAU); c.fill() }
      for (let k = 0; k < 3; k++) { const n = [24, 16, 12][k], rr = R * [.95, .66, .4][k]; for (let a = 0; a < n; a++) { const t = a / n * TAU; c.save(); c.translate(cx + Math.cos(t) * rr * .86, cy + Math.sin(t) * rr * .86); c.rotate(t); c.fillStyle = ['#fff3c8', '#ffe066', '#ff6ad5'][k]; c.beginPath(); c.ellipse(0, 0, rr * .12, rr * .045, 0, 0, TAU); c.fill(); c.restore() } }
      c.strokeStyle = 'rgba(60,30,20,.35)'; c.lineWidth = 2; for (let a = 0; a < 48; a++) { c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a / 48 * TAU) * R, cy + Math.sin(a / 48 * TAU) * R); c.stroke() }
      for (let i = 0; i < 6000; i++) { c.fillStyle = 'rgba(40,20,10,.12)'; const a = r() * TAU, d = r() * R; c.fillRect(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 2, 2) }
    }, false),
    grain: () => canvasTex(17, 256, 256, (c, w, h, r) => { c.fillStyle = '#b0b0b0'; c.fillRect(0, 0, w, h); for (let i = 0; i < 9000; i++) { const v = 120 + r() * 135 | 0; c.fillStyle = 'rgba(' + v + ',' + v + ',' + v + ',.5)'; c.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 3) } for (let i = 0; i < 300; i++) { c.strokeStyle = 'rgba(70,70,70,.25)'; c.beginPath(); const x = r() * w, y = r() * h; c.moveTo(x, y); c.lineTo(x + r() * 6 - 3, y - 4 - r() * 6); c.stroke() } })
  };
  return TX[name] = T[name]();
};

/* ======================= materials for one world build ======================= */
A.mats = function () {
  return {
    v: K.floraMat(0, { rough: .7 }), stone: K.floraMat(0, { map: A.tex('stone'), rough: .9, double: true }), wood: K.floraMat(0, { map: A.tex('wood'), rough: .8, double: true }),
    roof: K.floraMat(0, { map: A.tex('stripes'), rough: .55, double: true }), tile: K.floraMat(0, { map: A.tex('tiles'), rough: .85 }), stucco: K.floraMat(0, { map: A.tex('stucco'), rough: .9 }),
    shiny: K.floraMat(0, { rough: .25, metal: .55 }), dbl: K.floraMat(0, { rough: .6, double: true })
  };
};

/* ======================= walkable extras (queried by the world's surface()) ======================= */
A.walk = function () {
  const pads = [], bridges = [], tiers = [];
  return {
    pads, bridges, tiers,
    pad(x, z, r, h) { pads.push([x, z, r * r, h]) },
    /* bridge deck height at (x,z) or undefined */
    bridgeAt(x, z) {
      for (const b of bridges) { const dx = x - b.x0, dz = z - b.z0, t = dx * b.ux + dz * b.uz, l = -dx * b.uz + dz * b.ux; if (t >= -.3 && t <= b.len + .3 && Math.abs(l) <= b.w / 2) return b.y + b.rise * Math.sin(Math.PI * Math.min(1, Math.max(0, t / b.len))) + .12 }
    },
    /* platform / tier height at (x,z) or undefined */
    at(x, z) {
      let h; for (const p of pads) { const dx = x - p[0], dz = z - p[1]; if (dx * dx + dz * dz < p[2] && (h === undefined || p[3] > h)) h = p[3] }
      for (const t of tiers) { const dx = x - t.x, dz = z - t.z, r = Math.hypot(dx, dz); if (r < t.r0 || r > t.r1) continue; let a = Math.atan2(dz, dx) - t.a0; a = ((a % TAU) + TAU) % TAU; if (a > t.span) continue; const v = t.y + Math.floor((r - t.r0) / t.step) * t.dh; if (h === undefined || v > h) h = v }
      return h;
    }
  };
};

/* ======================= builders (all add into a batch B with materials MT) ======================= */
const geo = {}; const G = k => geo[k] || (geo[k] = ({
  pillar: () => new THREE.LatheGeometry([[.3, 0], [.3, .05], [.22, .08], [.17, .12], [.15, .5], [.17, .86], [.22, .91], [.3, .95], [.3, 1]].map(p => new THREE.Vector2(p[0], p[1])), 7),
  onion: () => new THREE.LatheGeometry([[1.02, 0], [1.12, .12], [1.14, .28], [1.0, .46], [.72, .64], [.4, .8], [.16, .92], [.05, .98], [.01, 1]].map(p => new THREE.Vector2(p[0], p[1])), 14),
  dome: () => new THREE.LatheGeometry([[1.05, 0], [1.02, .2], [.93, .42], [.76, .63], [.52, .8], [.26, .93], [.01, 1]].map(p => new THREE.Vector2(p[0], p[1])), 14),
  tent: () => new THREE.LatheGeometry([[1.18, -.06], [1.08, 0], [.78, .16], [.5, .38], [.26, .66], [.1, .88], [.01, 1]].map(p => new THREE.Vector2(p[0], p[1])), 12),
  arc: () => new THREE.TorusGeometry(1, .09, 4, 9, Math.PI),
  ring: () => new THREE.TorusGeometry(1, .14, 6, 32),
  sph: () => new THREE.SphereGeometry(1, 8, 6), ico: () => new THREE.IcosahedronGeometry(1, 1), cyl: () => new THREE.CylinderGeometry(1, 1, 1, 8), cyl6: () => new THREE.CylinderGeometry(1, 1, 1, 6), cone: () => new THREE.ConeGeometry(1, 1, 7), cone4: () => new THREE.ConeGeometry(1, 1, 4), hip: () => new THREE.ConeGeometry(1, 1, 4).rotateY(Math.PI / 4), box: () => new THREE.BoxGeometry(1, 1, 1),
  halfDome: () => new THREE.SphereGeometry(1, 16, 8, 0, Math.PI, 0, Math.PI / 2), petal: () => new THREE.SphereGeometry(1, 8, 5, 0, TAU, 0, Math.PI * .55), disc: () => new THREE.CylinderGeometry(1, 1, 1, 20)
})[k]());
A.geo = G;

/* Pavilion: platform, turned columns, scalloped arches, eave ring, hanging scallops, onion/dome/tent roof, finial, lantern. */
A.pavilion = function (B, MT, ctx, walk, o) {
  const { x, z } = o, r = o.r || 4, h = o.h || 3.4, n = o.n || 8, rh = o.rh || r * 1.1, y0 = o.y || 0, ry = o.ry || 0;
  const cR = o.cRoof || 0xff6ad5, cC = o.cCol || 0xfff0e0, cT = o.cTrim || 0xffd84a, cB = o.cBase || 0xd8c0a0;
  B.add(MT.stone, G('disc'), cB, M(x, y0 + .12, z, r + 1.1, .24, r + 1.1)); B.add(MT.stone, G('disc'), cB, M(x, y0 + .34, z, r + .55, .22, r + .55));
  walk.pad(x, z, r + 1.1, y0 + .24); walk.pad(x, z, r + .55, y0 + .45);
  const top = y0 + .45 + h;
  for (let i = 0; i < n; i++) {
    const a = ry + i / n * TAU, px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r;
    B.add(MT.v, G('pillar'), cC, M(px, y0 + .45, pz, 1, h, 1)); ctx.circles.push([px, pz, .32]);
    const a2 = ry + (i + 1) / n * TAU, qx = x + Math.cos(a2) * r, qz = z + Math.sin(a2) * r, mx = (px + qx) / 2, mz = (pz + qz) / 2, half = Math.hypot(qx - px, qz - pz) / 2;
    if (!(o.gaps && o.gaps.indexOf(i) >= 0)) B.add(MT.v, G('arc'), cT, M(mx, top - half * .55, mz, half, half * .55, half, 0, -Math.atan2(qz - pz, qx - px), 0), .35);
  }
  B.add(MT.v, new THREE.TorusGeometry(r + .35, .17, 5, 28), cT, M(x, top + .05, z, 1, 1, 1, Math.PI / 2, 0, 0), .4);
  for (let i = 0; i < n * 2; i++) { const a = ry + (i + .5) / (n * 2) * TAU; B.add(MT.v, G('cone'), i % 2 ? cR : cT, M(x + Math.cos(a) * (r + .42), top - .22, z + Math.sin(a) * (r + .42), .16, .42, .16, Math.PI, 0, 0), .6) }
  const shape = o.roof === 'dome' ? 'dome' : o.roof === 'tent' ? 'tent' : 'onion';
  B.add(MT.roof, G(shape), cR, M(x, top + .1, z, r + .55, rh, r + .55, 0, ry, 0), .12);
  const tipY = top + .1 + rh; B.add(MT.shiny, G('sph'), cT, M(x, tipY + .15, z, .28, .28, .28), .5); B.add(MT.shiny, G('cone'), cT, M(x, tipY + .7, z, .1, .9, .1), .5); B.add(MT.v, G('ico'), o.cGem || 0x7ff0ff, M(x, tipY + 1.25, z, .22, .32, .22), 1);
  if (o.lantern !== false) { B.add(MT.v, G('sph'), 0xffe0a0, M(x, top - .9, z, .45, .55, .45), 1); B.add(MT.v, G('cyl'), 0x3a2a20, M(x, top - .2, z, .03, 1.1, .03)) }
  return { top, tipY };
};

/* ring bar counter (with an opening) — returns nothing; adds colliders along the arc */
A.ringCounter = function (B, MT, ctx, x, z, ri, ro, h, gapAt, gapW, y0) {
  const span = TAU - gapW, start = gapAt + gapW / 2, pts = [[ri, 0], [ro, 0], [ro, h], [ro + .12, h], [ro + .12, h + .08], [ri - .1, h + .08], [ri - .1, h], [ri, h], [ri, 0]].map(p => new THREE.Vector2(p[0], p[1]));
  const g = new THREE.LatheGeometry(pts, 24, Math.PI / 2 - start - span, span); B.add(MT.wood, g, 0xffffff, M(x, y0 || 0, z));
  for (let i = 0; i <= 14; i++) { const a = start + span * i / 14; ctx.circles.push([x + Math.cos(a) * (ri + ro) / 2, z + Math.sin(a) * (ri + ro) / 2, (ro - ri) / 2 + .15]) }
};

/* arched bridge from (x0,z0) to (x1,z1) — walkable deck, railings with balusters, end lanterns */
A.bridge = function (B, MT, ctx, walk, x0, z0, x1, z1, o) {
  o = o || {}; const w = o.w || 3.4, rise = o.rise || 1.4, y = o.y || 0, len = Math.hypot(x1 - x0, z1 - z0), ux = (x1 - x0) / len, uz = (z1 - z0) / len, ang = Math.atan2(uz, ux), seg = Math.max(8, Math.round(len / .8));
  walk.bridges.push({ x0, z0, ux, uz, len, w, rise, y });
  const hy = t => y + rise * Math.sin(Math.PI * t);
  for (let i = 0; i < seg; i++) {
    const t0 = i / seg, t1 = (i + 1) / seg, tm = (t0 + t1) / 2, cx = x0 + ux * len * tm, cz = z0 + uz * len * tm, dy = hy(t1) - hy(t0), sl = Math.atan2(dy, len / seg);
    B.add(MT.wood, G('box'), o.cDeck || 0xffffff, M(cx, hy(tm), cz, len / seg + .05, .22, w, 0, -ang, sl));
    for (const s of [-1, 1]) {
      const rx = cx - uz * s * (w / 2 - .1), rz = cz + ux * s * (w / 2 - .1);
      B.add(MT.v, G('box'), o.cRail || 0xff6ad5, M(rx, hy(tm) + 1.0, rz, len / seg + .06, .12, .14, 0, -ang, sl), .25);
      if (i % 2 === 0) B.add(MT.v, G('cyl6'), o.cPost || 0xfff0e0, M(rx, hy(tm) + .5, rz, .06, 1, .06));
    }
  }
  for (const t of [0, 1]) for (const s of [-1, 1]) {
    const px = x0 + ux * len * t - uz * s * (w / 2 + .1), pz = z0 + uz * len * t + ux * s * (w / 2 + .1);
    B.add(MT.stone, G('box'), 0xd8c0a0, M(px, y + .7, pz, .45, 1.4, .45)); B.add(MT.v, G('sph'), 0xffe08a, M(px, y + 1.65, pz, .22, .26, .22), 1); ctx.circles.push([px, pz, .35]);
  }
};

/* Mediterranean house (La Muria): stucco walls, terracotta hip roof, arched door, glowing windows, shutters, flower boxes */
A.house = function (B, MT, ctx, x, z, w, d, h, ry, o) {
  o = o || {}; const y = o.y || 0, c = Math.cos(ry), s = Math.sin(ry), L = (lx, lz) => [x + lx * c - lz * s, z + lx * s + lz * c];
  const P = (g, mat, col, lx, ly, lz, sx, sy, sz, gl) => { const p = L(lx, lz); B.add(mat, g, col, M(p[0], y + ly, p[1], sx, sy, sz, 0, -ry, 0), gl) };
  P(G('box'), MT.stucco, o.cWall || 0xfff4e6, 0, h / 2, 0, w, h, d);
  P(G('box'), MT.stone, 0xc8b08a, 0, .25, 0, w + .25, .5, d + .25);
  const roof = L(0, 0); B.add(MT.tile, G('hip'), o.cRoof || 0xffffff, M(roof[0], y + h + h * .22, roof[1], (w + .6) * .7071, h * .45, (d + .6) * .7071, 0, -ry, 0));
  P(G('box'), MT.tile, 0xffffff, 0, h + .04, 0, w + .5, .12, d + .5);
  P(G('box'), MT.wood, 0x8a5a3a, 0, 1.05, d / 2 + .02, 1.1, 2.1, .1); P(G('cyl'), MT.wood, 0x8a5a3a, 0, 2.1, d / 2 + .02, .55, .1, .55);
  for (const wx of [-w / 3, w / 3]) { P(G('box'), MT.v, 0xffd890, wx, h * .62, d / 2 + .03, .8, 1, .05, .9); for (const sx of [-1, 1]) P(G('box'), MT.v, o.cShut || 0x3aa0a0, wx + sx * .62, h * .62, d / 2 + .06, .4, 1.1, .05); P(G('box'), MT.wood, 0x6a4a2a, wx, h * .62 - .62, d / 2 + .22, 1, .2, .35); for (let k = 0; k < 4; k++) P(G('sph'), MT.v, [0xff4ad2, 0xffd84a, 0xff7a3a, 0x9a7aff][k], wx - .35 + k * .23, h * .62 - .45, d / 2 + .25, .13, .13, .13, .3) }
  P(G('box'), MT.stone, 0xb09070, w / 3, h + h * .35, -d / 5, .5, h * .5, .5);
  const corners = [L(-w / 2, -d / 2), L(w / 2, d / 2)]; ctx.cols.push([Math.min(corners[0][0], corners[1][0], L(w / 2, -d / 2)[0], L(-w / 2, d / 2)[0]), Math.max(corners[0][0], corners[1][0], L(w / 2, -d / 2)[0], L(-w / 2, d / 2)[0]), Math.min(corners[0][1], corners[1][1], L(w / 2, -d / 2)[1], L(-w / 2, d / 2)[1]), Math.max(corners[0][1], corners[1][1], L(w / 2, -d / 2)[1], L(-w / 2, d / 2)[1])]);
  return { door: L(0, d / 2 + 1.4) };
};

/* pagoda with upturned eaves */
A.pagoda = function (B, MT, ctx, x, z, tiers, base, o) {
  o = o || {}; let y = o.y || 0, w = base;
  B.add(MT.stone, G('box'), 0xc8b08a, M(x, y + .3, z, w + 2, .6, w + 2)); y += .6;
  for (let i = 0; i < tiers; i++) {
    const bh = 2.4 - i * .25; B.add(MT.v, G('box'), 0xd83a3a, M(x, y + bh / 2, z, w, bh, w)); for (const s of [-1, 1]) for (const t of [-1, 1]) B.add(MT.v, G('cyl'), 0xffd84a, M(x + s * w / 2, y + bh / 2, z + t * w / 2, .14, bh, .14));
    B.add(MT.v, G('box'), 0xffe8a0, M(x, y + bh * .55, z, w + .02, .5, w * .5), .8); y += bh;
    B.add(MT.tile, G('cone4'), 0x6a3a8a, M(x, y + .55, z, w * 1.05, 1.1, w * 1.05, 0, Math.PI / 4, 0));
    for (const s of [-1, 1]) for (const t of [-1, 1]) B.add(MT.v, G('cone'), 0xffd84a, M(x + s * w * .74, y + .25, z + t * w * .74, .14, .7, .14, -t * .6, 0, s * .6), .5);
    y += .6; w *= .78;
  }
  B.add(MT.shiny, G('cyl'), 0xffd84a, M(x, y + 1.4, z, .1, 2.8, .1), .4); for (let k = 0; k < 4; k++) B.add(MT.shiny, G('ring'), 0xffd84a, M(x, y + .6 + k * .45, z, .3 - k * .05, .3 - k * .05, .5, Math.PI / 2, 0, 0), .4);
  ctx.cols.push([x - base / 2 - 1, x + base / 2 + 1, z - base / 2 - 1, z + base / 2 + 1]);
};

/* the Stone Ape: a giant carved head (moss, glowing eyes at night) */
A.apeHead = function (B, MT, x, y, z, s, ry) {
  const c = Math.cos(ry), sn = Math.sin(ry), P = (g, col, lx, ly, lz, sx, sy, sz, rx, rz, gl, mat) => B.add(mat || MT.stone, g, col, M(x + (lx * c + lz * sn) * s, y + ly * s, z + (-lx * sn + lz * c) * s, sx * s, sy * s, sz * s, rx || 0, ry, rz || 0), gl);
  P(G('sph'), 0x9a8a78, 0, 1.0, 0, 1.0, 1.05, .95);
  P(G('sph'), 0x8a7a68, 0, .82, .55, .78, .22, .45, -.15);
  P(G('sph'), 0xa89884, 0, .38, .7, .62, .48, .5);
  P(G('sph'), 0x8a7a68, 0, .18, .74, .5, .2, .38);
  for (const sx of [-1, 1]) { P(G('sph'), 0x2a2030, sx * .3, .62, .78, .14, .12, .08, 0, 0, 0, MT.v); P(G('sph'), 0x7ff0c8, sx * .3, .62, .84, .06, .05, .04, 0, 0, 1, MT.v); P(G('sph'), 0x8a7a68, sx * .98, .82, .05, .26, .34, .16); P(G('sph'), 0x4a3a40, sx * .12, .42, 1.12, .06, .05, .04, 0, 0, 0, MT.v) }
  P(G('box'), 0x5a4a40, 0, .16, .98, .5, .05, .05, 0, 0, 0, MT.v);
  for (let i = 0; i < 14; i++) { const a = i * 2.4, el = .6 + (i % 5) * .2; P(G('ico'), i % 3 ? 0x4a9a4a : 0x6ac85a, Math.cos(a) * .82, el + .55, Math.sin(a) * .5 - .2, .28, .14, .28, 0, 0, .15, MT.v) }
};

/* amphitheater: concentric stepped sectors facing a point; registers walkable tiers */
A.tiers = function (B, MT, walk, x, z, r0, rows, step, dh, a0, span, col) {
  for (let i = 0; i < rows; i++) {
    const ri = r0 + i * step, ro = ri + step, hh = (i + 1) * dh, pts = [[ri, 0], [ro, 0], [ro, hh], [ri, hh], [ri, 0]].map(p => new THREE.Vector2(p[0], p[1]));
    const g = new THREE.LatheGeometry(pts, 24, Math.PI / 2 - a0 - span, span); B.add(MT.stone, g, i % 2 ? col : 0xe8dcc8, M(x, 0, z));
  }
  walk.tiers.push({ x, z, r0, r1: r0 + rows * step, step, dh, y: dh, a0, span });
};

/* giant lotus: petal rings (for the concert stage) */
/* o.gap: math angle of an open sector (no petals, e.g. in front of a stage), o.gapW: its half-width; o.h: petal height factor; o.rings: how many rings */
A.lotus = function (B, MT, x, y, z, R, o) {
  o = o || {}; const hf = o.h || .55, rings = [[R, 16, 1.0, .9], [R * .86, 14, 1.15, .6], [R * .55, 10, 1.3, .25]].slice(0, o.rings || 3);
  rings.forEach((rg, k) => { for (let i = 0; i < rg[1]; i++) { const a = i / rg[1] * TAU + k * .2; if (o.gap != null && Math.abs(Math.atan2(Math.sin(a - o.gap), Math.cos(a - o.gap))) < (o.gapW || .7)) continue; const px = x + Math.cos(a) * rg[0], pz = z + Math.sin(a) * rg[0];
    B.add(MT.dbl, G('petal'), [0xff9ad8, 0xffc8ec, 0xff6ac0][k], M(px, y + .2, pz, rg[0] * .26, rg[0] * hf * rg[2], rg[0] * .13, 0, -a + Math.PI / 2, 0).multiply(M(0, 0, 0, 1, 1, 1, -rg[3], 0, 0)), .45) } });
};
/* cliff boulders along a polyline to give rock faces an organic, sculpted look */
A.boulders = function (B, MT, pts, H, rng, o) {
  o = o || {}; for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / (o.step || 5)); for (let k = 0; k < n; k++) { const f = k / n, x = a[0] + (b[0] - a[0]) * f + (rng() - .5) * 2, z = a[1] + (b[1] - a[1]) * f + (rng() - .5) * 2, s = (o.s0 || 3) + rng() * ((o.s1 || 7) - (o.s0 || 3));
    B.add(MT.stone, G('ico'), [0xb8a0b0, 0xa898a8, 0xc8b0a0, 0x9a8aa8][(i + k) % 4], M(x, H(x, z) - s * .25 + (o.lift || 0), z, s, s * (.8 + rng() * .7), s * (.8 + rng() * .4), rng(), rng() * 3, rng() * .5)); if (rng() < .5) B.add(MT.v, G('ico'), 0x4a9a4a, M(x + (rng() - .5) * s, H(x, z) + s * .6 + (o.lift || 0), z + (rng() - .5) * s, s * .35, s * .15, s * .35, 0, 0, 0)) } }
};
/* curved bench rows (cinema seating): a sector of low benches with backrests, colliders along each row */
A.benchRows = function (B, MT, ctx, x, z, r0, rows, gap, a0, span, col) {
  for (let i = 0; i < rows; i++) {
    const r = r0 + i * gap, ps = Math.PI / 2 - a0 - span, seat = [[r, 0], [r + .7, 0], [r + .7, .5], [r, .5], [r, 0]].map(p => new THREE.Vector2(p[0], p[1])), back = [[r + .62, .5], [r + .78, .5], [r + .82, 1.15], [r + .66, 1.15], [r + .62, .5]].map(p => new THREE.Vector2(p[0], p[1]));
    B.add(MT.wood, new THREE.LatheGeometry(seat, 24, ps, span), 0xffffff, M(x, 0, z)); B.add(MT.v, new THREE.LatheGeometry(back, 24, ps, span), i % 2 ? col : 0xff8ad8, M(x, 0, z), .1);
    const n = Math.ceil(span * r / 1.2); for (let k = 0; k <= n; k++) { const a = a0 + span * k / n; ctx.circles.push([x + Math.cos(a) * (r + .4), z + Math.sin(a) * (r + .4), .45]) }
  }
};

/* cactus */
A.cactus = function (B, MT, x, y, z, s, col) {
  B.add(MT.v, G('cyl'), col || 0x3a9a5a, M(x, y + 1.5 * s, z, .35 * s, 3 * s, .35 * s)); B.add(MT.v, G('sph'), col || 0x3a9a5a, M(x, y + 3 * s, z, .35 * s, .35 * s, .35 * s));
  for (const sx of [-1, 1]) { B.add(MT.v, G('cyl'), col || 0x3a9a5a, M(x + sx * .6 * s, y + 1.6 * s, z, .22 * s, .2 * s * 3, .22 * s, 0, 0, Math.PI / 2)); B.add(MT.v, G('cyl'), col || 0x3a9a5a, M(x + sx * .85 * s, y + 2.1 * s, z, .22 * s, s, .22 * s)); B.add(MT.v, G('sph'), 0xff4ad2, M(x + sx * .85 * s, y + 2.65 * s, z, .16 * s, .12 * s, .16 * s), .8) }
};

/* floating island (rock cone + grassy top + crystal) */
A.island = function (B, MT, x, y, z, r) {
  B.add(MT.stone, G('cone'), 0x9a7a9a, M(x, y - r * .9, z, r, r * 1.8, r, Math.PI, 0, 0)); B.add(MT.v, G('disc'), 0x5ac85a, M(x, y + .1, z, r * 1.02, .4, r * 1.02));
  B.add(MT.v, G('ico'), 0x7ff0ff, M(x, y + 1.4, z, .5, 1.3, .5), 1); for (let i = 0; i < 5; i++) { const a = i * 1.3; B.add(MT.v, G('ico'), 0x3aa04a, M(x + Math.cos(a) * r * .6, y + .7, z + Math.sin(a) * r * .6, .9, .7, .9)) }
};

/* ring of distant mountains (vertex-coloured, fogged) */
A.mountains = function (ctx, R, n, hMin, hMax, cols) {
  const parts = [], rng = AV.rng(77); for (let i = 0; i < n; i++) { const a = i / n * TAU + rng() * .1, d = R + rng() * 40, h = hMin + rng() * (hMax - hMin); parts.push([G('cone'), cols[i % cols.length], M(Math.cos(a) * d, h / 2 - 4, Math.sin(a) * d, 18 + rng() * 22, h, 18 + rng() * 22, 0, rng() * 3, 0), 0]) }
  const m = new THREE.Mesh(K.merge(parts), K.floraMat(0, { rough: 1 })); ctx.group.add(m); return m;
};

/* dancing crowd: one instanced mesh, animated per frame */
A.crowd = function (ctx, spots, opt) {
  /* two instanced meshes sharing the same matrices: fur (head, muzzle, ears, raised arms, legs) + shirt (torso, tinted per dancer) */
  opt = opt || {}; const sph = G('sph'), cyl = G('cyl6');
  const fur = [[sph, 0xffffff, M(0, 1.62, 0, .25, .26, .24)], [sph, 0xe8c8a0, M(0, 1.56, .17, .15, .12, .1)], [sph, 0x1a1210, M(-.08, 1.66, .2, .035, .04, .02)], [sph, 0x1a1210, M(.08, 1.66, .2, .035, .04, .02)], [sph, 0xffffff, M(-.24, 1.63, 0, .07, .09, .05)], [sph, 0xffffff, M(.24, 1.63, 0, .07, .09, .05)],
    [cyl, 0xffffff, M(-.34, 1.45, 0, .075, .62, .075, 0, 0, .55)], [cyl, 0xffffff, M(.34, 1.45, 0, .075, .62, .075, 0, 0, -.55)], [sph, 0xe8c8a0, M(-.5, 1.72, 0, .08, .08, .08)], [sph, 0xe8c8a0, M(.5, 1.72, 0, .08, .08, .08)], [cyl, 0x3a3a52, M(-.12, .36, 0, .1, .72, .1)], [cyl, 0x3a3a52, M(.12, .36, 0, .1, .72, .1)], [G('box'), 0x2a2a2a, M(-.12, .04, .06, .16, .08, .26)], [G('box'), 0x2a2a2a, M(.12, .04, .06, .16, .08, .26)]];
  const shirt = [[sph, 0xffffff, M(0, 1.02, 0, .33, .4, .25)], [sph, 0xffffff, M(0, 1.3, 0, .3, .14, .22)]];
  /* V0.9.3: sculpted apes from chars.js (fur + shirt tinted per dancer, face/hands/jeans/sneakers fixed); old primitive look as fallback */
  if (K.q() === 0 && spots.length > 12) spots = spots.filter((_, i) => i % 2 === 0);   // Low graphics: half the dancers
  const CG = AV.chars && AV.chars.crowdGeo ? AV.chars.crowdGeo(true) : null;   // low-detail mesh: dancers are many and usually seen from a distance
  const mF = new THREE.InstancedMesh(CG ? CG.fur : K.merge(fur), K.floraMat(0, CG ? { rough: .95, map: CG.furMap } : { rough: .85 }), spots.length), mS = new THREE.InstancedMesh(CG ? CG.shirt : K.merge(shirt), K.floraMat(0, { rough: .7 }), spots.length), col = new THREE.Color();
  const mX = CG ? new THREE.InstancedMesh(CG.fixed, K.floraMat(0, { rough: .7 }), spots.length) : null, all = [mF, mS].concat(mX ? [mX] : []);
  const furC = [0x6b4328, 0x3a3b3f, 0xc8581a, 0x8a6a4a, 0x5a3a2a, 0xa07850], shirtC = [0xff4ad2, 0x7ff0c8, 0xffd84a, 0x9a7aff, 0xff8a3a, 0x4ac8ff, 0xffffff];
  spots.forEach((s, i) => { mF.setColorAt(i, col.setHex(furC[i % furC.length]).convertSRGBToLinear()); mS.setColorAt(i, col.setHex(shirtC[(i * 3) % shirtC.length]).convertSRGBToLinear()) });
  for (const im of all) { if (im.instanceColor) im.instanceColor.needsUpdate = true; im.castShadow = K.q() === 2; im.frustumCulled = false; ctx.group.add(im) }
  ctx.upd.push((dt, t) => { const on = AV.audio && AV.audio.on && (AV.audio.ok || (AV.audio.track && AV.audio.track.active)), beat = on ? AV.audio.beat : t * 1.4, red = AV.S.set.reduce ? .3 : 1;
    spots.forEach((s, i) => { const ph = (beat + i * .37) * Math.PI, b = Math.abs(Math.sin(ph)) * .18 * red, m = M(s[0], s[1] + b, s[2], 1, 1 + Math.sin(ph) * .03 * red, 1, 0, s[3] + Math.sin(ph * .5 + i) * .25 * red, Math.sin(ph) * .06 * red); all.forEach(im => im.setMatrixAt(i, m)) }); all.forEach(im => im.instanceMatrix.needsUpdate = true) });
  return mF;
};
})(window.AV);
