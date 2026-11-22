/* APEVERSE V0.9.3 - world_astro9.js : Astro-9 space station with Club Graviton (visual rebuild of the V0.9 slice).
   Same layout, interactions and rules as V0.9: low-gravity dance floor, DJ Nix, fictional-points casino (Gravity Points only,
   never credits/real money), artwork bay, portal arch back to Ape Town.
   New look: painted deck plating with glowing guide lines, station rim wall + glass dome ribs, hull below the deck,
   banded gas giant with a ring, moon, slow asteroid belt, passing ships; Club Graviton as a glass hall with pillars,
   a domed ceiling, an LED floor (one instanced mesh), mirror ball, light beams, speaker stacks and a dancing crowd;
   neon casino with real slot cabinets; artwork bay wall; planters with alien flora. */
'use strict';
(function (AV) {
const tr = AV.tr, G = AV.G, std = AV.std, TAU = AV.TAU, MD = AV.media, K = AV.kit, A = AV.arch;
const R = 46, CX = 0, CZ = -18, CZX = 24, CZZ = 6;
const PATHS = [[[0, 33], [0, -3]], [[0, 8], [19, 6]], [[0, 14], [-18, 17]]];
const PLANTERS = [[-10, 6, 2.2], [10, 20, 2.2], [-13, -3, 2], [13, -4, 2], [-30, 2, 2.6], [32, 24, 2.4], [-14, 30, 2], [14, 31, 2]];
const segDist = (x, z, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz))); return Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t) };

/* ======================= painted textures (cached) ======================= */
const TX = {};
function canvasTex(w, h, draw, rep) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; t.wrapS = t.wrapT = rep ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping; t.userData = { keep: true }; return t }
/* deck: colour map + matching glow map (guide lines, club ring, casino carpet edge) */
function deckTex(N) {
  const key = 'deck' + N; if (TX[key]) return TX[key];
  const m = N / (2 * R), P = v => (v + R) * m, r = AV.rng(9);
  const strokePaths = (c, w, col) => { c.strokeStyle = col; c.lineWidth = w * m; c.lineCap = 'round'; for (const p of PATHS) { c.beginPath(); c.moveTo(P(p[0][0]), P(p[0][1])); c.lineTo(P(p[1][0]), P(p[1][1])); c.stroke() } };
  const map = canvasTex(N, N, c => {
    c.fillStyle = '#20233a'; c.fillRect(0, 0, N, N);
    const pl = 4 * m; for (let y = 0; y < N; y += pl) for (let x = 0; x < N; x += pl) { const v = 30 + r() * 14 | 0; c.fillStyle = 'rgb(' + v + ',' + (v + 3) + ',' + (v + 22) + ')'; c.fillRect(x + 1, y + 1, pl - 2, pl - 2); c.fillStyle = 'rgba(150,160,220,.35)'; for (const [dx, dy] of [[.12, .12], [.88, .12], [.12, .88], [.88, .88]]) { c.beginPath(); c.arc(x + dx * pl, y + dy * pl, .06 * m, 0, TAU); c.fill() } if (r() < .12) { c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = .05 * m; for (let k = 1; k < 6; k++) { c.beginPath(); c.moveTo(x + pl * .2, y + k * pl / 6); c.lineTo(x + pl * .8, y + k * pl / 6); c.stroke() } } }
    strokePaths(c, 4.4, '#3a405e'); strokePaths(c, 3.6, '#454b6e');
    c.lineWidth = .7 * m; for (let a = 0; a < 64; a++) { c.strokeStyle = a % 2 ? '#e8c030' : '#181818'; c.beginPath(); c.arc(P(CX), P(CZ), 16.4 * m, a / 64 * TAU, (a + 1) / 64 * TAU); c.stroke() }
    c.fillStyle = '#3a1030'; c.fillRect(P(CZX - 6), P(CZZ - 8), 13 * m, 17 * m);
    c.strokeStyle = '#ff4ad2'; c.lineWidth = .15 * m; c.strokeRect(P(CZX - 6), P(CZZ - 8), 13 * m, 17 * m);
    for (let i = 0; i < 9000; i++) { c.fillStyle = r() < .5 ? 'rgba(0,0,0,.15)' : 'rgba(200,210,255,.06)'; c.fillRect(r() * N, r() * N, 1 + r() * 2, 1 + r() * 2) }
  });
  const glow = canvasTex(N, N, c => {
    c.fillStyle = '#000'; c.fillRect(0, 0, N, N);
    c.lineCap = 'butt';
    for (const p of PATHS) { const dx = p[1][0] - p[0][0], dz = p[1][1] - p[0][1], l = Math.hypot(dx, dz), nx = -dz / l * 1.9, nz = dx / l * 1.9; c.strokeStyle = '#3ad8ff'; c.lineWidth = .16 * m; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(P(p[0][0] + nx * s), P(p[0][1] + nz * s)); c.lineTo(P(p[1][0] + nx * s), P(p[1][1] + nz * s)); c.stroke() } }
    c.strokeStyle = '#7a4aff'; c.lineWidth = .2 * m; for (const rr of [16.9, 20]) { c.beginPath(); c.arc(P(CX), P(CZ), rr * m, 0, TAU); c.stroke() }
    c.strokeStyle = '#ff4ad2'; c.lineWidth = .15 * m; c.strokeRect(P(CZX - 6), P(CZZ - 8), 13 * m, 17 * m);
    c.strokeStyle = '#3ad8ff'; c.lineWidth = .25 * m; c.beginPath(); c.arc(P(0), P(0), (R - 1.6) * m, 0, TAU); c.stroke();
  });
  return TX[key] = { map, glow };
}
function panelTex() {
  return TX.panel || (TX.panel = canvasTex(256, 256, (c, w, h) => { const r = AV.rng(4); c.fillStyle = '#3a3f58'; c.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 64) for (let x = 0; x < w; x += 128) { const v = 60 + r() * 20 | 0; c.fillStyle = 'rgb(' + v + ',' + (v + 4) + ',' + (v + 24) + ')'; c.fillRect(x + 3, y + 3, 122, 58); c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(x + 3, y + 3, 122, 6) }
    c.fillStyle = '#ffb03a'; for (let x = 0; x < w; x += 32) { c.beginPath(); c.moveTo(x, h - 16); c.lineTo(x + 16, h - 16); c.lineTo(x + 8, h); c.fill() } }, true));
}
function giantTex() {
  return TX.giant || (TX.giant = canvasTex(512, 256, (c, w, h) => { const r = AV.rng(21), cols = ['#3a6ad8', '#5a8ae8', '#2a4aa8', '#8ab0f0', '#4a5ac8', '#c8a0e8', '#3a7ac8'];
    for (let y = 0; y < h; y += 4) { c.fillStyle = cols[(y / 4 + (r() * 2 | 0)) % cols.length]; c.globalAlpha = .55; c.fillRect(0, y + Math.sin(y * .3) * 2, w, 7) } c.globalAlpha = 1;
    c.fillStyle = 'rgba(255,180,220,.55)'; c.beginPath(); c.ellipse(340, 150, 38, 16, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(345, 148, 18, 7, 0, 0, TAU); c.fill() }, true));
}
function ringTex() {
  return TX.ring || (TX.ring = canvasTex(512, 8, (c, w, h) => { const r = AV.rng(5); for (let x = 0; x < w; x++) { const a = (.25 + r() * .6) * Math.sin(x / w * Math.PI); c.fillStyle = 'rgba(232,200,150,' + a.toFixed(2) + ')'; c.fillRect(x, 0, 1, h) } }));
}
function slotTex() {
  return TX.slot || (TX.slot = canvasTex(256, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2a0a3a'); g.addColorStop(1, '#0a0418'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#ffd84a'; c.lineWidth = 8; c.strokeRect(10, 10, w - 20, h - 20); c.font = 'bold 64px Georgia'; c.textAlign = 'center'; c.textBaseline = 'middle';
    ['★', '●', '▲'].forEach((s, i) => { c.fillStyle = '#fff8e0'; c.fillRect(24 + i * 72, 70, 64, 100); c.fillStyle = ['#e8302a', '#2a8ae8', '#2aa84a'][i]; c.fillText(s, 56 + i * 72, 122) });
    c.font = 'bold 28px Georgia'; c.fillStyle = '#ffd84a'; c.fillText('GRAVITY', 128, 40); c.fillText('10 GP', 128, 210) }));
}

AV.registerWorld({
  id: 'astro9',
  build(ctx) {
    const S = AV.S, q = ctx.q, rng = ctx.rng, grp = ctx.group, MT = A.mats(); if (S.gp == null) S.gp = 100;
    const refill = () => { if (S.gpDay !== S.day) { S.gpDay = S.day; if (S.gp < 100) S.gp = 100 } }; refill();   // fictional points refill to 100 each new game day
    const B = { hull: K.batch(), club: K.batch(), misc: K.batch(), sky: K.batch(), glass: K.batch() };
    const panel = K.floraMat(0, { map: panelTex(), rough: .5, metal: .45, double: true }), glass = new THREE.MeshStandardMaterial({ color: 0x8ad8ff, roughness: .05, metalness: .3, transparent: true, opacity: .2, side: THREE.DoubleSide, depthWrite: false });
    MD.resetFrames();

    /* ---------- deck (painted plating + glowing guide lines) ---------- */
    const dk = deckTex([1024, 2048, 2048][q]);
    const dm = new THREE.MeshStandardMaterial({ map: dk.map, emissiveMap: dk.glow, emissive: 0xffffff, emissiveIntensity: .9, roughness: .45, metalness: .35 }); dm.userData.lin = 1;
    const fl = new THREE.Mesh(new THREE.CircleGeometry(R, 96), dm); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; grp.add(fl);
    /* rim wall + glowing rail, hull under the deck */
    /* V0.9.8: rim wall + glowing rail built as arcs, leaving open gates to the districts (js/astro9_districts.js) */
    { const G = (AV.astro9x ? AV.astro9x.GATES : []).map(a => a * Math.PI / 180).sort((a, b) => a - b), half = .075, arcs = [];
      if (!G.length) arcs.push([0, TAU]); else G.forEach((g, i) => { const n = i + 1 < G.length ? G[i + 1] : G[0] + TAU; arcs.push([g + half, n - half]) });
      for (const [a0, a1] of arcs) { B.hull.add(panel, new THREE.CylinderGeometry(R, R, 1.4, Math.max(4, Math.round((a1 - a0) * 15)), 1, true, Math.PI / 2 - a1, a1 - a0), 0xffffff, K.M(0, .7, 0)); B.hull.add(MT.v, new THREE.TorusGeometry(R - .05, .09, 6, Math.max(4, Math.round((a1 - a0) * 20)), a1 - a0).rotateX(Math.PI / 2).rotateY(-a0), 0x3ad8ff, K.M(0, 1.45, 0), 1) } }
    B.hull.add(MT.shiny, new THREE.TorusGeometry(R, .22, 6, 128), 0x6a7090, K.M(0, .02, 0, 1, 1, 1, Math.PI / 2, 0, 0));
    B.hull.add(panel, new THREE.LatheGeometry([[R + .2, 0], [R + 1.4, -1.2], [R - 4, -6], [24, -16], [10, -28], [0, -32]].map(p => new THREE.Vector2(p[0], p[1])), 64), 0x9aa0c0, K.M(0, 0, 0));
    B.hull.add(MT.v, new THREE.TorusGeometry(R + .9, .16, 6, 128), 0xff4ad2, K.M(0, -.7, 0, 1, 1, 1, Math.PI / 2, 0, 0), 1);
    for (let i = 0; i < 28; i++) { const a = i / 28 * TAU; if (AV.astro9x && AV.astro9x.GATES.some(g => Math.abs(Math.atan2(Math.sin(a - g * Math.PI / 180), Math.cos(a - g * Math.PI / 180))) < .14)) continue; ctx.circles.push([Math.cos(a) * R * .98, Math.sin(a) * R * .98, 1.4]); B.hull.add(MT.shiny, A.geo('pillar'), 0x8a90b0, K.M(Math.cos(a) * (R - .3), 0, Math.sin(a) * (R - .3), .5, 1.6, .5)) }
    /* glass dome: meridian ribs + latitude rings (glowing), very faint glass */
    for (let i = 0; i < 10; i++) B.sky.add(MT.v, new THREE.TorusGeometry(R, .14, 4, 64, Math.PI), 0x6ab0ff, K.M(0, 1.4, 0, 1, .55, 1, 0, i / 10 * Math.PI, 0), .55);
    for (const rr of [.95, .78, .5]) { const y = R * .55 * Math.sqrt(1 - rr * rr); B.sky.add(MT.v, new THREE.TorusGeometry(R * rr, .12, 4, 96), 0x6ab0ff, K.M(0, 1.4 + y, 0, 1, 1, 1, Math.PI / 2, 0, 0), .55) }
    { const gm = new THREE.MeshBasicMaterial({ color: 0x4a6aff, transparent: true, opacity: .05, side: THREE.BackSide, depthWrite: false }); const dome = new THREE.Mesh(new THREE.SphereGeometry(R, 48, 16, 0, TAU, 0, Math.PI / 2), gm); dome.scale.y = .55; dome.position.y = 1.4; dome.renderOrder = 2; grp.add(dome) }

    /* ---------- space: gas giant + ring, moon, asteroid belt, passing ships ---------- */
    const giant = new THREE.Mesh(new THREE.SphereGeometry(40, 48, 32), new THREE.MeshStandardMaterial({ map: giantTex(), roughness: .9, emissive: 0x1a2a6a, emissiveIntensity: .35 })); giant.material.userData.lin = 1; giant.position.set(-90, 38, -150); grp.add(giant);
    const rg = new THREE.RingGeometry(50, 74, 96, 1), uv = rg.attributes.uv, pp = rg.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (Math.hypot(pp.getX(i), pp.getY(i)) - 50) / 24, .5);
    const ring = new THREE.Mesh(rg, new THREE.MeshBasicMaterial({ map: ringTex(), transparent: true, side: THREE.DoubleSide, depthWrite: false })); ring.material.userData.lin = 1; ring.position.copy(giant.position); ring.rotation.set(1.25, .3, 0); grp.add(ring);
    const moon = new THREE.Mesh(new THREE.SphereGeometry(9, 32, 20), new THREE.MeshStandardMaterial({ color: 0xb8b0c8, roughness: 1, emissive: 0x2a2840, emissiveIntensity: .5 })); moon.position.set(130, 62, -60); grp.add(moon);
    const belt = new THREE.Group(); grp.add(belt);
    { const parts = []; for (let i = 0; i < [18, 30, 44][q]; i++) { const a = rng() * TAU, d = 80 + rng() * 60, s = 1 + rng() * 4; parts.push([A.geo('ico'), [0x7a7088, 0x8a7a6a, 0x6a6a7a][i % 3], K.M(Math.cos(a) * d, 8 + rng() * 40, Math.sin(a) * d, s, s * (.6 + rng() * .5), s, rng() * 3, rng() * 3, 0), 0]) }
      belt.add(new THREE.Mesh(K.merge(parts), K.floraMat(0, { rough: 1, flat: true }))) }
    function ship(col) { const s = new THREE.Group(); const mat = std(0xd8dce8, .35, .6); [[AV.G.cyl, 0, 0, 0, .9, 5, .9, [Math.PI / 2, 0, 0]], [AV.G.cone, 0, 0, 3.2, .9, 1.6, .9, [Math.PI / 2, 0, 0]], [AV.G.box, 0, 0, -.5, 5, .12, 1.6], [AV.G.box, 0, .6, -1.5, .12, 1.2, 1.2]].forEach(p => { const m = new THREE.Mesh(p[0], mat); m.position.set(p[1], p[2], p[3]); m.scale.set(p[4], p[5], p[6]); if (p[7]) m.rotation.set(...p[7]); s.add(m) });
      const eng = new THREE.Mesh(AV.G.sph, new THREE.MeshBasicMaterial({ color: col })); eng.position.z = -2.6; eng.scale.set(.7, .7, .9); s.add(eng); grp.add(s); return s }
    const ships = [ship(0x3ad8ff), ship(0xff4ad2)];

    /* ======================= CLUB GRAVITON ======================= */
    B.club.add(MT.shiny, new THREE.CylinderGeometry(15, 15, .08, 72), 0x1a1a30, K.M(CX, .04, CZ));
    /* LED floor: one instanced mesh, colours change on the beat */
    const tilesXY = []; for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) { const x = CX + (i - 4) * 2.2, z = CZ + (j - 4) * 2.2; if (Math.hypot(x - CX, z - CZ) > 13) continue; tilesXY.push([x, z, i, j]) }
    const tiles = new THREE.InstancedMesh(AV.G.box, new THREE.MeshBasicMaterial({ color: 0xffffff }), tilesXY.length); tiles.material.userData.lin = 1;
    const tcol = new THREE.Color(); tilesXY.forEach((t, k) => { tiles.setMatrixAt(k, K.M(t[0], .1, t[1], 2.05, .05, 2.05)); tiles.setColorAt(k, tcol.setRGB(.1, .05, .3)) }); tiles.instanceMatrix.needsUpdate = true; grp.add(tiles);
    /* hall: pillars + glass panels (front open), domed ceiling with ribs */
    const isFront = a => Math.abs(Math.atan2(Math.sin(a - Math.PI / 2), Math.cos(a - Math.PI / 2))) < .55;
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + .2, a2 = (i + 1) / 16 * TAU + .2, px = CX + Math.cos(a) * 15, pz = CZ + Math.sin(a) * 15;
      if (!isFront(a) || !isFront(a2)) { B.club.add(MT.shiny, A.geo('pillar'), 0x8a7ab8, K.M(px, 0, pz, .9, 6.9, .9)); B.club.add(MT.v, A.geo('box'), 0xff4ad2, K.M(px, 3.4, pz, .08, 5.6, .08, 0, -a, 0), 1); ctx.circles.push([px, pz, .5]) }
      if (isFront(a) || isFront(a2)) continue; const mx = CX + Math.cos((a + a2) / 2) * 15, mz = CZ + Math.sin((a + a2) / 2) * 15, w = 2 * 15 * Math.sin(TAU / 32);
      B.glass.add(glass, A.geo('box'), 0x6ad0ff, K.M(mx, 3.2, mz, .08, 6, w, 0, -(a + a2) / 2, 0), .15); B.club.add(MT.v, A.geo('box'), 0x7a4aff, K.M(mx, 6.3, mz, .2, .2, w, 0, -(a + a2) / 2, 0), 1); ctx.circles.push([mx, mz, 1.3]) }
    B.club.add(MT.dbl, A.geo('dome'), 0x1e1a38, K.M(CX, 6.9, CZ, 16.4, 4.2, 16.4));
    for (let i = 0; i < 12; i++) B.club.add(MT.v, new THREE.TorusGeometry(16.3, .12, 4, 24, Math.PI), 0xb07aff, K.M(CX, 6.9, CZ, 1, 4.2 / 16.3, 1, 0, i / 12 * Math.PI, 0), .9);
    B.club.add(MT.v, new THREE.TorusGeometry(16.4, .3, 6, 96), 0x7a4aff, K.M(CX, 6.95, CZ, 1, 1, 1, Math.PI / 2, 0, 0), 1);
    const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1, 2), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .15, metalness: .9, flatShading: true, emissive: 0x6a6a8a, emissiveIntensity: .35 })); ball.position.set(CX, 6.2, CZ); grp.add(ball);
    B.club.add(MT.shiny, A.geo('cyl'), 0xaaaaaa, K.M(CX, 7.9, CZ, .03, 2.4, .03));
    const lights = [0xff4ad2, 0x4ac8ff, 0xffd84a].map((c, i) => { const l = new THREE.PointLight(c, .6, 22); l.position.set(CX + Math.cos(i * 2.1) * 6, 5, CZ + Math.sin(i * 2.1) * 6); grp.add(l); return l });
    const beamGeo = new THREE.ConeGeometry(1.1, 8, 18, 1, true); beamGeo.translate(0, -4, 0);
    const beams = [0xff4ad2, 0x4ac8ff, 0xffd84a, 0x7aff9a].map((c, i) => { const m = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .1, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); const a = i / 4 * TAU + .4; m.position.set(CX + Math.cos(a) * 8, 7.6, CZ + Math.sin(a) * 8); grp.add(m); return m });
    ctx.sign('CLUB GRAVITON', CX, 8.7, CZ + 18.4, 0, 7, '#7ff0ff');                                       // in front of the dome's rim
    /* DJ booth + speaker stacks + Nix */
    B.club.add(MT.shiny, A.geo('box'), 0x2a1a4a, K.M(CX, .8, CZ - 10, 5.4, 1.6, 1.4)); for (const s of [-1, 1]) B.club.add(MT.shiny, A.geo('cyl'), 0x2a1a4a, K.M(CX + s * 2.7, .8, CZ - 10, .7, 1.6, .7));
    B.club.add(MT.v, A.geo('box'), 0x4ac8ff, K.M(CX, 1.2, CZ - 9.28, 6.2, .08, .04), 1); B.club.add(MT.v, A.geo('box'), 0xff4ad2, K.M(CX, .5, CZ - 9.28, 6.2, .08, .04), 1);
    B.club.add(MT.v, A.geo('box'), 0x14141e, K.M(CX, 1.62, CZ - 10, 5.6, .05, 1.3));
    const decks = [-1, 1].map(s => { const d = new THREE.Mesh(new THREE.CylinderGeometry(.34, .34, .04, 24), std(0x222228, .3, .4)); d.position.set(CX + s * 1.3, 1.68, CZ - 10); grp.add(d); return d });
    B.club.add(MT.v, A.geo('box'), 0x30303a, K.M(CX, 1.7, CZ - 10, .6, .1, .5), .3);
    ctx.cols.push([CX - 3.4, CX + 3.4, CZ - 10.7, CZ - 9.3]);
    const woofPos = []; for (const s of [-1, 1]) for (const k of [0, 1]) { const x = CX + s * 5.4, y = .9 + k * 1.75, z = CZ - 11; B.club.add(MT.shiny, A.geo('box'), 0x16141e, K.M(x, y, z, 1.7, 1.7, 1.2)); woofPos.push([x, y, z + .61]); ctx.circles.push([x, z, 1.1]) }
    const woof = new THREE.InstancedMesh(new THREE.CylinderGeometry(.55, .55, .06, 24).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x3a3a48, roughness: .4, metalness: .4, emissive: 0x4ac8ff, emissiveIntensity: .2 }), woofPos.length); grp.add(woof);
    const nix = AV.npc.spawn(ctx, 'nix', { x: CX, z: CZ - 11.4, yaw: 0, tx: CX, tz: CZ - 7.5, r: 3.4, arms: false }).g;
    /* low-gravity dancers (bounce higher) */
    const crowd = []; for (let t = 0; crowd.length < [6, 10, 14][q] && t < 300; t++) { const a = rng() * TAU, r = 6.5 + rng() * 5, x = CX + Math.cos(a) * r, z = CZ + Math.sin(a) * r; if (z < CZ - 7 || (Math.abs(x - CX) < 2.5 && z > CZ)) continue; if (crowd.some(c => Math.hypot(c[0] - x, c[2] - z) < 1.3)) continue; crowd.push([x, .12 + (rng() < .55 ? .8 + rng() * 3.2 : 0), z, Math.atan2(CX - x, CZ - 10 - z) + (rng() - .5) * .5])   /* half the dancers float in zero g */ }
    /* V0.9.7: rigged dancers (aliens, robots, spirits, an ape, a frog) — half of them float in the zero-g air, all on the beat */
    { const kinds = ['alien', 'robot', 'alien', 'spirit', 'ape', 'alien', 'human', 'frog']; AV.beings.spawn(ctx, crowd.map((c, i) => ({ kind: kinds[i % kinds.length], x: c[0], y: c[1] > .5 ? c[1] : 0, z: c[2], yaw: c[3], mode: c[1] > .5 ? 'float' : 'dance', seed: i + 11 })));
      AV.beings.spawn(ctx, [{ kind: 'robot', x: 20, z: 10, area: { x: 16, z: 6, r: 8 }, name: 'Shopkeeper K-7' }, { kind: 'alien', x: 8, z: 24, area: { x: 0, z: 18, r: 14 } }, { kind: 'alien', x: -10, z: 12, area: { x: -8, z: 8, r: 12 } }, { kind: 'robot', x: 14, z: -32, area: { x: 18, z: -26, r: 9 } }, { kind: 'human', x: -4, z: 30, area: { x: 0, z: 26, r: 10 }, name: 'Lost Tourist' }, { kind: 'spirit', x: -30, z: -2, area: { x: -28, z: 0, r: 8 } }].slice(0, AV.beings.n(ctx, 3, 5, 6)).map((s, i) => Object.assign(s, { seed: 40 + i }))) }
    ctx.T.push({ x: CX, z: CZ, r: 6, label: () => tr('Dance floor: ZERO gravity!', 'Pista: ¡gravedad CERO!'), fn: () => AV.toast(tr('Zero gravity: jump and you float. Space / Jump rises, C / Sink goes down.', 'Gravedad cero: salta y flotas. Espacio / Saltar sube, C / Bajar baja.')) });

    /* ======================= CASINO (Gravity Points only) ======================= */
    B.misc.add(panel, A.geo('box'), 0xffffff, K.M(CZX + 6, 2.2, CZZ, 1, 4.4, 14)); ctx.cols.push([CZX + 5.5, CZX + 6.5, CZZ - 7, CZZ + 7]);
    B.misc.add(MT.v, A.geo('box'), 0xff4ad2, K.M(CZX + 5.45, 4.35, CZZ, .1, .12, 14), 1); B.misc.add(MT.v, A.geo('box'), 0xffd84a, K.M(CZX + 5.45, .25, CZZ, .1, .1, 14), 1);
    B.misc.add(MT.roof, A.geo('box'), 0xff6ad5, K.M(CZX + 3, 4.6, CZZ, 7, .15, 15)); for (const z of [CZZ - 7.2, CZZ + 7.2]) B.misc.add(MT.shiny, A.geo('pillar'), 0xd8c0e8, K.M(CZX, 0, z, .5, 4.6, .5));
    ctx.circles.push([CZX, CZZ - 7.2, .4], [CZX, CZZ + 7.2, .4]);
    K.lanterns(ctx, [[CZX - .4, 4.4, CZZ - 7.2], [CZX - .4, 4.4, CZZ + 7.2]], { cols: [0xffd84a, 0xff4ad2, 0x7ff0ff], per: 16, sag: .25 });
    const slotFace = new THREE.MeshBasicMaterial({ map: slotTex() }); slotFace.userData.lin = 1;
    const sym = ['★', '●', '▲', '♠'];
    for (let i = 0; i < 3; i++) { const z = CZZ - 4 + i * 4;
      B.misc.add(MT.shiny, A.geo('box'), 0xc81a5a, K.M(CZX + 4, 1.0, z, 1.3, 2.0, 1.3)); B.misc.add(MT.shiny, A.geo('halfDome'), 0xffd84a, K.M(CZX + 4, 2.0, z, .65, .5, .65, 0, Math.PI / 2, 0), .4);
      B.misc.add(MT.v, A.geo('box'), 0x2a0a2a, K.M(CZX + 3.3, .9, z, .2, .2, 1.0)); B.misc.add(MT.v, A.geo('sph'), 0xffe080, K.M(CZX + 4, 2.55, z, .12, .12, .12), 1);
      B.misc.add(MT.shiny, A.geo('cyl'), 0xc0c0c8, K.M(CZX + 4, 1.6, z + .75, .04, .7, .04)); B.misc.add(MT.v, A.geo('sph'), 0xe8302a, K.M(CZX + 4, 2.0, z + .75, .1, .1, .1), .3);
      const face = new THREE.Mesh(AV.G.pln, slotFace); face.position.set(CZX + 3.34, 1.45, z); face.rotation.y = -Math.PI / 2; face.scale.set(1.05, 1.05, 1); grp.add(face);
      ctx.cols.push([CZX + 3.3, CZX + 4.7, z - .7, z + .7]);
      ctx.T.push({ x: CZX + 2, z, r: 1.9, label: () => tr('Slot (10 Gravity Points, fictional)', 'Tragaperras (10 Puntos de Gravedad, ficticios)'), fn: () => {
        refill(); if (S.gp < 10) { AV.toast(tr('Out of Gravity Points. They are free play-money and refill to 100 each new day.', 'Sin Puntos de Gravedad. Son dinero de juguete y se recargan a 100 cada día nuevo.')); return } S.gp -= 10; AV.dlg && AV.dlg.event('slot'); const r = [0, 1, 2].map(() => sym[Math.random() * 4 | 0]); let w = 0; if (r[0] === r[1] && r[1] === r[2]) w = 80; else if (r[0] === r[1] || r[1] === r[2] || r[0] === r[2]) w = 15; S.gp += w;
        AV.toast(r.join(' ') + '  ' + (w ? '+' + w : '—') + ' GP · ' + tr('Gravity Points', 'Puntos de Gravedad') + ': ' + S.gp + ' (' + tr('fictional, no credits involved', 'ficticios, sin créditos') + ')'); AV.audio && AV.audio.blip(w ? 988 : 220, .25, 'square', .1); AV.save() } }) }
    B.misc.add(MT.shiny, A.geo('cyl6'), 0x2a1a3a, K.M(CZX + 2.4, 1.1, CZZ + 9.4, .35, 2.2, .35)); B.misc.add(MT.v, A.geo('ico'), 0x7ff0ff, K.M(CZX + 2.4, 2.6, CZZ + 9.4, .35, .5, .35), 1); ctx.circles.push([CZX + 2.4, CZZ + 9.4, .45]);
    ctx.T.push({ x: CZX + 1, z: CZZ + 8.5, r: 2.4, label: () => tr('Gravity Points: ', 'Puntos de Gravedad: ') + S.gp, fn: () => AV.toast(tr('Gravity Points are fictional play-money for the casino only. Never real money, never credits.', 'Los Puntos de Gravedad son dinero ficticio solo para el casino. Nunca dinero real ni créditos.')) });
    ctx.sign('CASINO (fictional points)', CZX + 5.4, 6.4, CZZ, -Math.PI / 2, 5, '#ff8ac0');                // stands above the canopy
    AV.npc.spawn(ctx, 'lyra', { x: CZX - 3, z: CZZ - 2, yaw: -Math.PI / 2, r: 3 });

    /* ======================= Captain Rook: dock master, patrols between the arrival arch and the club ======================= */
    AV.npc.spawn(ctx, 'rook', { x: 5, z: 24, yaw: Math.PI, r: 3, speed: 1.1, path: [[5, 24, 6], [6, 12, 3], [-6, 12, 4], [-5, 24, 3]] });

    /* ======================= ARTWORK BAY (no files supplied for Astro-9) ======================= */
    const pl = MD.placementsFor('astro9'); pl.forEach((p, i) => MD.frame(ctx, p, -26 + i * 4.6, 2.6, 20, Math.PI, 3.2));
    B.misc.add(panel, A.geo('box'), 0xffffff, K.M(-21.4, 2.6, 20.75, 15, 5.2, .4)); B.misc.add(MT.v, A.geo('box'), 0x7ff0c8, K.M(-21.4, 5.25, 20.5, 15, .1, .1), 1); B.misc.add(MT.v, A.geo('box'), 0x7ff0c8, K.M(-21.4, .1, 20.5, 15, .08, .1), 1);
    ctx.cols.push([-28.9, -13.9, 20.5, 21]);
    ctx.sign('ARTWORK BAY (awaiting files)', -22, 6.6, 20.3, Math.PI, 5, '#7ff0c8');

    /* ======================= V0.9.7 CINEMA 9: Club Graviton films + music videos (the film's sound takes over near the screen) ======================= */
    const c9 = MD.cinemaScreen(ctx, 27, 4.6, -27, -Math.PI / 4, 11, { radius: 24, name: 'CINEMA 9 · ASTRO-9', tags: ['astro'], shorts: false, glow: 0xff4ad2 });
    for (const s of [-1, 1]) { B.misc.add(MT.shiny, A.geo('pillar'), 0x8a7ab8, K.M(27 + .707 * s * 6.4, 0, -27 + .707 * s * 6.4, .5, 9.4, .5)); B.misc.add(MT.v, A.geo('ico'), 0xff4ad2, K.M(27 + .707 * s * 6.4, 9.6, -27 + .707 * s * 6.4, .35, .45, .35), 1); ctx.circles.push([27 + .707 * s * 6.4, -27 + .707 * s * 6.4, .5]) }
    for (let r = 0; r < 3; r++) for (let k = -2; k <= 2; k++) { const d = 7.5 + r * 2, x = 27 - .707 * d + .707 * k * 1.9, z = -27 + .707 * d + .707 * k * 1.9; B.misc.add(MT.shiny, A.geo('box'), [0x5a2a7a, 0x2a4a8a, 0x7a2a5a][r], K.M(x, .3, z, 1.5, .6, .7, 0, -Math.PI / 4, 0)); B.misc.add(MT.v, A.geo('box'), 0x7ff0ff, K.M(x, .02, z, 1.5, .03, .72, 0, -Math.PI / 4, 0), 1); ctx.circles.push([x, z, .6]) }
    ctx.T.push({ x: 27 - .707 * 6, z: -27 + .707 * 6, r: 2.6, label: () => tr('Cinema 9: choose a film', 'Cine 9: elegir película'), fn: () => MD.openCinema(c9) });

    /* ======================= return arch ======================= */
    AV.mk(AV.G.tor, std(0xff4ad2, .4, 0, 0xff4ad2, 1), 0, 2.4, 34, 2.4, 2.4, 2.4, grp, false);
    const pm = new THREE.Mesh(AV.G.pln, new THREE.MeshBasicMaterial({ color: 0xffb04a, transparent: true, opacity: .4, side: THREE.DoubleSide })); pm.scale.set(4.6, 4.6, 1); pm.position.set(0, 2.4, 34); grp.add(pm);
    for (const s of [-1, 1]) { B.misc.add(MT.shiny, A.geo('pillar'), 0x9aa0c0, K.M(s * 3, 0, 34, .7, 5, .7)); B.misc.add(MT.v, A.geo('ico'), 0xff4ad2, K.M(s * 3, 5.3, 34, .3, .4, .3), 1); ctx.circles.push([s * 3, 34, .45]) }
    B.misc.add(MT.shiny, A.geo('disc'), 0x3a3f58, K.M(0, .04, 34, 3.4, .08, 3.4));
    ctx.T.push({ x: 0, z: 31.5, r: 3, label: () => tr('Portal arch: back to Ape Town', 'Arco: volver a Ape Town'), fn: () => AV.travel('ape_town', 'astro9') });

    /* ---------- planters with alien flora ---------- */
    PLANTERS.forEach(([x, z, r], i) => { B.misc.add(MT.shiny, new THREE.CylinderGeometry(r, r * .92, .7, 32, 1, true), 0x5a6080, K.M(x, .35, z)); B.misc.add(MT.v, new THREE.TorusGeometry(r, .08, 4, 48), [0x3ad8ff, 0xff4ad2, 0x7aff9a][i % 3], K.M(x, .72, z, 1, 1, 1, Math.PI / 2, 0, 0), 1); B.misc.add(MT.v, A.geo('disc'), 0x2a3a2a, K.M(x, .6, z, r - .05, .1, r - .05)); ctx.circles.push([x, z, r + .1]) });
    const pick = (fn, n, s0, s1) => { const out = []; PLANTERS.forEach(([x, z, r], i) => { for (let k = 0; k < n; k++) { const a = rng() * TAU, d = rng() * (r - .6); out.push({ x: x + Math.cos(a) * d, y: .62, z: z + Math.sin(a) * d, s: s0 + rng() * (s1 - s0), ry: rng() * TAU }) } }); return out };
    K.scatter(ctx, K.species.crystal(0xb07aff, 0x7ff0ff), K.floraMat(0), pick(0, [1, 2, 2][q], .6, 1.1));
    K.scatter(ctx, K.species.giantFlower(0x7ff0ff, 0xff4ad2), K.floraMat(.02), pick(0, 1, .55, .8));
    K.scatter(ctx, K.species.mushroom(0xff4ad2, 0xf4e8d0, 0x7ff0ff), K.floraMat(0), pick(0, [2, 3, 4][q], .5, 1.1));
    K.motes(ctx, { n: 110, x: 0, z: 0, r: 44, y0: 1, y1: 12, cols: [0xff4ad2, 0x4ac8ff, 0xffd84a, 0xffffff], size: 2.2, alpha: .8 });

    /* ======================= V0.9.6 GAUDÍ SPIRAL PLAZA : cinematic graphics prototype =======================
       spiral tower GLB (procedural fallback), trencadís mosaic PBR, HDRI reflections, two alien NPCs: soft-body characters
       (chars_real.js C.alienActor), or the rigged forge / GLB aliens if the realistic character pipeline is not loaded */
    const FG = AV.forge, GX = AV.gfx, PX = -25, PZ = -12, info = { tower: 'procedural', aliens: ['procedural', 'procedural'] };
    let zib = null, orbo = null, plazaUpd = null;
    if (FG && GX) {
      const tex = [512, 512, 1024][q], shadow = q === 2, linc = h => new THREE.Color(h).convertSRGBToLinear();
      const pm = (n, h) => { const m = new THREE.MeshStandardMaterial({ color: linc(h || 0xffffff) }); m.name = n; return m };
      const dress = obj => { FG.dress(obj, { tex, shadow }).forEach(m => { if (m.userData.glowBase) GX.reg(ctx, m, 'glow', m.userData.glowK); else if (m.isMeshStandardMaterial) GX.reg(ctx, m, 'env', m.metalness > .9 ? .85 : m.metalness > .3 ? .3 : .16) }); return obj };
      const drop = obj => { obj.traverse(o => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => GX.mats.delete(m)); if (o.isSkinnedMesh && o.skeleton && o.skeleton.dispose) o.skeleton.dispose() }); AV.dispose(obj) };   /* skeletons own a bone texture in r128 */
      const plaza = new THREE.Group(); plaza.position.set(PX, 0, PZ); grp.add(plaza);
      /* floor: glossy dark stone disc, trencadís ring, neon edge */
      const base = new THREE.Mesh(new THREE.CircleGeometry(9, 72), new THREE.MeshStandardMaterial({ color: linc(0x4a4458), roughness: .32, metalness: .25 })); base.material.userData.lin = 1; base.rotation.x = -Math.PI / 2; base.position.y = .02; base.receiveShadow = true; plaza.add(base); GX.reg(ctx, base.material, 'env', .14);
      const ringM = new THREE.Mesh(FG.uvScale(new THREE.RingGeometry(3.9, 6.1, 72, 3), 8.7), pm('mosaic2')); ringM.rotation.x = -Math.PI / 2; ringM.position.y = .035; plaza.add(dress(ringM));
      const edge = new THREE.Mesh(new THREE.TorusGeometry(9, .05, 6, 128), pm('glow', 0x3ad8ff)); edge.rotation.x = Math.PI / 2; edge.position.y = .06; plaza.add(dress(edge));
      /* the tower: procedural now, the GLB replaces it when it arrives */
      const towerHolder = new THREE.Group(); plaza.add(towerHolder); let tw = dress(FG.tower(q ? 1 : .6)); towerHolder.add(tw); ctx.circles.push([PX, PZ, FG.TOWER.footprint]);
      GX.glb('assets/models/astro9/spiral_tower.glb').then(g => { if (!towerHolder.parent) return; towerHolder.remove(tw); drop(tw); tw = dress(g.scene); towerHolder.add(tw); info.tower = 'GLB'; GX.apply() }).catch(() => { });
      /* twisted lamp posts + serpentine bench */
      const lamp = dress(FG.lamp()); for (let i = 0; i < 6; i++) { const a = (30 + i * 60) * Math.PI / 180, l = i ? lamp.clone() : lamp; l.position.set(Math.cos(a) * 8.4, 0, Math.sin(a) * 8.4); plaza.add(l); ctx.circles.push([PX + Math.cos(a) * 8.4, PZ + Math.sin(a) * 8.4, .35]) }
      const bench = dress(FG.bench(2.2, 4.1, 4.75)); plaza.add(bench); bench.userData.path.forEach(p => ctx.circles.push([PX + p[0], PZ + p[1], .55]));
      const pl2 = new THREE.PointLight(0xffd6f0, .75, 22); pl2.position.set(PX + 6, 6, PZ + 4); grp.add(pl2);
      /* Orbo's boombox */
      const bx = PX + 8.4, bz = PZ - 2.4; B.misc.add(MT.shiny, A.geo('box'), 0x2a1a3a, K.M(bx, .45, bz, 1.1, .9, .6)); for (const s of [-1, 1]) B.misc.add(MT.v, A.geo('cyl'), 0xffd84a, K.M(bx + s * .3, .45, bz + .31, .2, .03, .2, Math.PI / 2, 0, 0), 1); ctx.circles.push([bx, bz, .6]);
      ctx.sign('GAUDÍ SPIRAL PLAZA', PX + 5.5, 4.4, PZ + 8.6, .55, 4.6, '#ffd84a');
      /* rigged aliens */
      const actor = (key, url, x, z, yaw) => {
        const h = new THREE.Group(); h.position.set(x, 0, z); h.rotation.y = yaw; grp.add(h);
        const a = { h, key, cur: null, acts: {}, mixer: null, src: 'procedural' };
        a.play = (n, f) => { if (a.cur === n || !a.acts[n]) return; const nx = a.acts[n], old = a.cur && a.acts[a.cur]; nx.reset(); nx.setEffectiveWeight(1); nx.play(); if (old) { if (f) nx.crossFadeFrom(old, f, false); else old.stop() } a.cur = n };
        a.use = (obj, clips) => { if (a.obj) { h.remove(a.obj); drop(a.obj) } a.obj = dress(obj); h.add(obj); a.mixer = new THREE.AnimationMixer(obj); a.acts = {}; clips.forEach(c => a.acts[c.name] = a.mixer.clipAction(c)); const n = a.cur || 'Idle'; a.cur = null; a.play(n) };
        const SA = AV.chars && AV.chars.alienActor;
        if (SA) {   /* soft-body Zib / Orbo (chars_real.js): sculpted, IK-planted feet, spring-bone belly + cranium + antennae; same play / acts / mixer API */
          const A = SA({ type: key, shadow }); h.add(A.root); Object.assign(a, { obj: A.root, actor: A, acts: A.acts, mixer: A.mixer, src: 'soft-body' });
          a.play = n => { A.play(n); a.cur = A.cur }; a.play('Idle');
          if (A.ready) A.ready.then(() => { if (h.parent) info.aliens[key === 'zib' ? 0 : 1] = 'soft-body' });
          return a;
        }
        const p = FG.alien(key); a.use(p.root, p.clips);
        GX.glb(url).then(g => { if (!h.parent) return; a.use(g.scene, g.animations); a.src = 'GLB'; info.aliens[key === 'zib' ? 0 : 1] = 'GLB'; GX.apply() }).catch(() => { });
        return a;
      };
      zib = actor('zib', 'assets/models/astro9/alien_zib.glb', PX + 6.6, PZ, 0); orbo = actor('orbo', 'assets/models/astro9/alien_orbo.glb', PX + 8, PZ - .6, -Math.PI / 2);
      ctx.leave.push(() => [zib, orbo].forEach(a => { if (!a.obj) return; a.mixer.stopAllAction(); a.mixer.uncacheRoot(a.obj); a.obj.traverse(o => { if (o.isSkinnedMesh && o.skeleton && o.skeleton.dispose) o.skeleton.dispose() }) }));
      const say = (who, L) => { const i = (L.i = ((L.i == null ? -1 : L.i) + 1) % L.length); AV.toast(who + ': ' + (AV.ui === 'es' ? L[i][1] : L[i][0])); const a = who === 'Zib' ? zib : orbo; if (a.actor) a.actor.talk(2.6) };
      const ZL = [["I'm Zib. Your spiral is the only thing on this station that twists the right way.", 'Soy Zib. Tu espiral es lo único en esta estación que gira hacia el lado correcto.'],
        ['The mosaic is made of broken tiles. On my planet we break things on purpose too.', 'El mosaico está hecho de azulejos rotos. En mi planeta también rompemos cosas a propósito.'],
        ['The neon helix hums at 124 beats a minute. Orbo says it is the station’s heartbeat.', 'La hélice de neón zumba a 124 pulsos por minuto. Orbo dice que es el latido de la estación.'],
        ['Those reflections are a real night sky from a city called Shanghai, folded into the chrome.', 'Esos reflejos son un cielo nocturno real de una ciudad llamada Shanghái, doblado dentro del cromo.']];
      const OL = [['Orbo dances. Orbo always dances.', 'Orbo baila. Orbo siempre baila.'], ['One eye, two moves, infinite groove.', 'Un ojo, dos pasos, ritmo infinito.'],
        ['Club Graviton is too heavy for Orbo. This floor is pretty AND light.', 'El Club Graviton es demasiado pesado para Orbo. Este suelo es bonito Y ligero.']];
      const Z = { th: 0, st: 'walk', t: 0, cd: 4 }, ZR = 6.6, ZS = 1.0, ZA = FG.ALIENS.zib, cyc = 4 * (ZA.thigh + ZA.shin) * Math.sin(FG.WALK_SWING), O = { t: -1, yaw: -Math.PI / 2 };
      zib.play('Walk'); if (zib.acts.Walk) zib.acts.Walk.timeScale = ZS / cyc; orbo.play('Dance');
      const turn = (a, b, k) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * Math.min(1, k);
      const zT = { x: 0, z: 0, r: 2.6, label: () => tr('Talk to Zib (alien)', 'Hablar con Zib (alienígena)'), fn: () => { say('Zib', ZL); Z.st = 'greet'; Z.t = 0; zib.play('Wave', .3) } };
      const oT = { x: orbo.h.position.x, z: orbo.h.position.z, r: 2.4, label: () => tr('Talk to Orbo (alien)', 'Hablar con Orbo (alienígena)'), fn: () => { say('Orbo', OL); O.t = 0; orbo.play('Wave', .25) } };
      ctx.T.push(zT, oT, { x: PX + 5.4, z: PZ + 1.2, r: 1.8, label: () => tr('Spiral tower: about this graphics prototype', 'Torre espiral: sobre este prototipo gráfico'),
        fn: () => AV.toast(tr('Gaudí Spiral Plaza: graphics prototype. ', 'Plaza Espiral Gaudí: prototipo gráfico. ') + GX.statusText()) });
      plazaUpd = (dt, t, beat) => {
        if (Z.st === 'walk' && zib.acts.Walk) zib.acts.Walk.timeScale = ZS / cyc;
        const pdx = AV.P.x - zib.h.position.x, pdz = AV.P.z - zib.h.position.z, pd = Math.hypot(pdx, pdz); Z.cd -= dt;
        if (Z.st === 'walk') { Z.th += ZS / ZR * dt; zib.h.position.set(PX + Math.cos(Z.th) * ZR, 0, PZ + Math.sin(Z.th) * ZR); zib.h.rotation.y = Math.atan2(-Math.sin(Z.th), Math.cos(Z.th)); if (pd < 3.2 && Z.cd <= 0) { Z.st = 'greet'; Z.t = 0; zib.play('Wave', .3) } }
        else { Z.t += dt; zib.h.rotation.y = turn(zib.h.rotation.y, Math.atan2(pdx, pdz), dt * 4); if (Z.st === 'greet' && Z.t > 2.2) { Z.st = 'idle'; zib.play('Idle', .4) } if (Z.st === 'idle' && (pd > 4.5 || Z.t > 9)) { Z.st = 'walk'; Z.cd = 12; zib.play('Walk', .4) } }
        zT.x = zib.h.position.x; zT.z = zib.h.position.z; zib.mixer.update(dt);
        if (O.t >= 0) { O.t += dt; orbo.h.rotation.y = turn(orbo.h.rotation.y, Math.atan2(AV.P.x - orbo.h.position.x, AV.P.z - orbo.h.position.z), dt * 5); if (O.t > 2.2) { O.t = -1; orbo.play('Dance', .3) } }
        else { orbo.h.rotation.y = turn(orbo.h.rotation.y, O.yaw, dt * 3); const d = orbo.acts.Dance; if (orbo.cur === 'Dance' && d && d.getEffectiveWeight() > .99) d.time = (((beat % 4) + 4) % 4) / 4 * d.getClip().duration }
        orbo.mixer.update(dt);
      };
      /* existing Astro-9 surfaces that should pick up the reflections */
      GX.reg(ctx, ball.material, 'env', 1); GX.reg(ctx, glass, 'env', .6);
    }

    /* ---------- V0.9.8: the districts beyond the dome ---------- */
    const ext = AV.astro9x ? AV.astro9x.build(ctx, { MT, ship }) : null;
    /* Captain Rook's station tour: the dock beacons log each district platform you walk onto */
    if (ext) ctx.upd.push(() => { if ((S.quests || {}).station_tour !== 'active') return; for (const d of AV.astro9x.DIST) if (Math.hypot(AV.P.x - d.c[0], AV.P.z - d.c[1]) < d.r - 2) AV.quests.mark('station_tour', d.id) });

    /* ---------- flush ---------- */
    for (const k of ['sky', 'glass']) { B[k].flush(ctx, { noShadow: true }).forEach(m => m.renderOrder = 2); delete B[k] } for (const k in B) B[k].flush(ctx);

    /* ---------- animation (beat-synced) ---------- */
    const mtx = new THREE.Matrix4(), cols3 = [new THREE.Color(0x6a3aff), new THREE.Color(0xff3ab0), new THREE.Color(0x3ac8ff)].map(c => c.convertSRGBToLinear()), dim = new THREE.Color();
    ctx.upd.push((dt, t) => {
      const on = AV.audio && AV.audio.on && (AV.audio.ok || (AV.audio.track && AV.audio.track.active)), beat = on ? AV.audio.beat : t * 2.07, red = S.set.reduce, kick = Math.pow(Math.max(0, Math.cos(beat * Math.PI)), 6);
      tilesXY.forEach((tt, k) => { const v = (Math.floor(beat) + tt[2] * 2 + tt[3] * 3) % 5, c = cols3[(tt[2] + tt[3]) % 3]; tiles.setColorAt(k, dim.copy(c).multiplyScalar(red ? .35 : (v === 0 ? 1.1 : .22))) }); tiles.instanceColor.needsUpdate = true;
      lights.forEach((l, i) => l.intensity = .35 + Math.abs(Math.sin(beat * Math.PI * .5 + i)) * (red ? .15 : .7)); ball.rotation.y = t * .8; giant.rotation.y = t * .03; moon.rotation.y = t * .02; belt.rotation.y = t * .004;
      beams.forEach((b, i) => { b.rotation.x = Math.sin(beat * Math.PI * .25 + i) * .45 * (red ? .3 : 1); b.rotation.z = Math.cos(beat * Math.PI * .125 + i * 1.7) * .45 * (red ? .3 : 1); b.material.opacity = .05 + .08 * (i % 2 ? kick : 1 - kick) });
      woofPos.forEach((w, i) => { const p = red ? 0 : kick; mtx.makeScale(1, 1, 1 + p * 2.5); mtx.setPosition(w[0], w[1], w[2] + p * .04); woof.setMatrixAt(i, mtx) }); woof.instanceMatrix.needsUpdate = true;
      decks.forEach((d, i) => d.rotation.y += dt * 3.5 * (i ? 1 : -1));
      ships.forEach((s, i) => { const a = t * (.05 + i * .02) + i * 3, rr = 120 + i * 30; s.position.set(Math.cos(a) * rr, 34 + i * 12 + Math.sin(t * .3 + i) * 2, Math.sin(a) * rr); s.rotation.y = -a + (i ? 0 : Math.PI) });
      nix.userData.aL.rotation.x = -1 + Math.sin(beat * Math.PI) * .4; nix.userData.aR.rotation.x = -1 + Math.cos(beat * Math.PI) * .4; nix.userData.head.rotation.z = Math.sin(beat * Math.PI) * .1;
      if (plazaUpd) plazaUpd(dt, t, beat) });
    ctx.leave.push(() => MD.resetFrames());
    return { name: 'Astro-9 · Club Graviton', surface: (x, z) => Math.hypot(x, z) < R - 1 ? 0 : ext ? ext.surface(x, z) : null, fog: [40, 220], sky: { fixed: { bg: 0x05030f, fog: 0x0a0618, sun: .5, hs: .9, stars: 1, night: 1 }, dome: { s1: 0xff4ad2, s2: 0x4ac8ff, swirl: .6, cloud: .25, top: 0x0a0428, hor: 0x2a0a4a } },
      post: { bloom: [.75, .4, 1.4], ldrThreshold: .86, grade: { exp: 1.05, con: 1.06, sat: 1.12, lift: [.01, .012, .035], gain: [1.02, .98, 1.05], vig: .35 } },
      gfxAssets: () => ({ tower: info.tower, aliens: info.aliens.slice() }), _plaza: { zib, orbo, x: PX, z: PZ },
      places: (ext ? ext.places : []).concat([{ id: 'plaza', name: ['Gaudí Spiral Plaza', 'Plaza Espiral Gaudí'], x: PX + 11, z: PZ + 1, yaw: Math.PI / 2 }, { id: 'club', name: ['Club Graviton dance floor', 'Pista del Club Graviton'], x: 0, z: -12, yaw: 0 }, { id: 'dj', name: ['DJ Nix', 'DJ Nix'], x: 0, z: -24, yaw: 0 }, { id: 'casino', name: ['Casino (fictional points)', 'Casino (puntos ficticios)'], x: 22, z: 6, yaw: -Math.PI / 2 }, { id: 'art', name: ['Artwork bay', 'Bahía de arte'], x: -18, z: 16, yaw: Math.PI }]),
      gravityAt: (x, z) => Math.hypot(x - CX, z - CZ) < 14.6 ? 0 : 1, zeroG: true, ceilingAt: (x, z) => Math.hypot(x - CX, z - CZ) < 14.6 ? 4.9 : null,   /* V0.9.7: TRUE zero gravity on Club Graviton */ arrivals: { default: { x: 0, z: 26, yaw: 0 }, pipe: { x: 0, z: 22, yaw: 0 }, ape_gate: { x: 0, z: 28, yaw: 0 } }, defaultArrival: 'default',
      musicProfile: { bpm: 124, root: 40, scale: [0, 3, 5, 7, 10], style: 'space' }, stage: { pos: { x: CX, y: 3, z: CZ - 10 } } };
  }
});
})(window.AV);
