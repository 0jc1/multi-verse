/* APEVERSE 2.2 GLOBAL WORLDS - sevilla_landmarks.js : Sevilla's monuments, bridges, fountains and the April Fair ground (agent 4).
   Called by world_sevilla.js with the shared part lists.  Landmark masses come from the plan's footprints minus the walkable
   carve-outs, so what you see is exactly what blocks you.  Returns { casetas, noria, tiovivo, market, fountains } for the life file.
   Interpretations, not replicas: proportions are compressed, detail is suggestive (pointed arches, sebka panels, crenellations). */
'use strict';
(function (AV) {
const SEV = AV.sevilla, GW = AV.gwkit, PLAN = AV.sevillaPlan, TAU = Math.PI * 2;
/* merge a 2 m grid of "inside the footprint, outside every carve" into rectangles */
function massRects(poly, carves, g) { g = g || 2; let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (const p of poly) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); z0 = Math.min(z0, p[1]); z1 = Math.max(z1, p[1]) }
  const nx = Math.ceil((x1 - x0) / g), nz = Math.ceil((z1 - z0) / g), A = new Uint8Array(nx * nz), out = [];
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const x = x0 + (i + .5) * g, z = z0 + (j + .5) * g; A[j * nx + i] = GW.inPoly(x, z, poly) && !carves.some(c => GW.inPoly(x, z, c)) ? 1 : 0 }
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { if (!A[j * nx + i]) continue; let w = 0; while (i + w < nx && A[j * nx + i + w]) w++; let h = 1; while (j + h < nz) { let ok = true; for (let a = 0; a < w; a++) if (!A[(j + h) * nx + i + a]) { ok = false; break } if (!ok) break; h++ } for (let b = 0; b < h; b++) for (let a = 0; a < w; a++) A[(j + b) * nx + i + a] = 0; out.push([x0 + i * g, Math.min(x1, x0 + (i + w) * g), z0 + j * g, Math.min(z1, z0 + (j + h) * g)]) }
  return out }
SEV.massRects = massRects;
SEV.landmarks = function (ctx, E) {
  const K = AV.kit, BG = K.BG, { N, P, Gl, Gs, Q, FP, FQ, FG, box, obox, sign, rng, q } = E, grp = ctx.group, M = K.M;
  const sol = id => PLAN.solids.find(s => s[0] === id)[1], carves = PLAN.carves.map(c => c[1]);
  const pinn = (x, y, z, s, col) => { P.push([BG.box, col, M(x, y + s * .6, z, s * .5, s * 1.2, s * .5), 0], [BG.cone, col, M(x, y + s * 1.2 + s * .6, z, s * .35, s * 1.2, s * .35), 0]) };
  const arch = (arr, col, x, y, z, w, h, ry) => { arr.push([BG.box, col, M(x, y + h * .35, z, w, h * .7, .2, 0, ry || 0, 0), 0]); arr.push([BG.box, col, M(x, y + h * .78, z, w * .72, h * .22, .2, 0, ry || 0, 0), 0]); arr.push([BG.box, col, M(x, y + h * .93, z, w * .34, h * .14, .2, 0, ry || 0, 0), 0]) };   /* a pointed (stepped) opening */
  const out = {};
  /* ======================= Cathedral + Giralda ======================= */
  { const st = 0xd8c49c, st2 = 0xcab48a, dk = 0x1e1a16;
    box(P, st, -22, 42, 0, 21, -64, 4); box(P, st, 42, 58, 0, 21, -64, 4);   /* aisles + chapels */
    box(P, st2, -14, 48, 21, 34, -54, -6); box(P, st2, 8, 30, 21, 35, -64, 4);   /* nave + transept */
    box(P, 0xb8a47e, -14.4, 48.4, 34, 34.8, -54.4, -5.6); box(P, 0xb8a47e, 7.6, 30.4, 35, 35.8, -64.4, 4.4);
    box(P, st, 12, 26, 35, 44, -37, -23); P.push([BG.cone, st2, M(19, 47.5, -30, 5.5, 7, 5.5), 0]);   /* crossing lantern */
    for (let x = -19; x <= 55; x += 6) for (const [z, s] of [[-64, -1], [4, 1]]) { box(P, st2, x - .7, x + .7, 0, 21, z - (s < 0 ? .45 : 0), z + (s > 0 ? .45 : 0)); if (Math.abs(x - 19) > 6) arch(P, dk, x + 3, 7, z + s * .06, 1.6, 10.5) }
    for (let z = -61; z <= 1; z += 6) for (const [x, s] of [[-22, -1], [58, 1]]) { box(P, st2, x - (s < 0 ? .45 : 0), x + (s > 0 ? .45 : 0), 0, 21, z - .7, z + .7); if (s > 0 || Math.abs(z + 30) > 20) arch(P, dk, x + s * .06, 7, z + 3, 1.6, 10.5, Math.PI / 2) }
    for (let x = -10; x <= 44; x += 6) for (const z of [-54.05, -5.95]) arch(Gl, 0x3a2a1a, x + 3, 23.5, z, 1.4, 8, 0);
    for (let x = -18; x <= 54; x += 6) for (const z of [-62.5, 2.5]) pinn(x, 21, z, 1.6, st2);
    for (let z = -58; z <= 0; z += 6) for (const x of [-20.5, 56.5]) pinn(x, 21, z, 1.6, st2);
    for (let x = -10; x <= 44; x += 6) for (const z of [-54, -6]) { obox(P, st2, x, z + (z < -30 ? -8 : 8), x, z, .8, 26, 27.5) }   /* flying buttresses */
    /* west front (Avenida): three portals + rose window; south: Puerta del Príncipe */
    for (const z of [-44, -30, -16]) { arch(P, dk, -22.15, 0, z, z === -30 ? 5 : 3.6, z === -30 ? 11 : 8, Math.PI / 2); arch(P, st2, -22.3, 0, z, (z === -30 ? 5 : 3.6) + 1.2, (z === -30 ? 11 : 8) + 1.4, Math.PI / 2) }
    Gl.push([BG.cyl, 0xffc870, M(-22.25, 25, -30, 3.4, .2, 3.4, 0, 0, Math.PI / 2), 1]); P.push([BG.cyl, st2, M(-22.35, 25, -30, 4.2, .2, 4.2, 0, 0, Math.PI / 2), 0]);
    arch(P, dk, 19, 0, 4.15, 5, 11); arch(P, st2, 19, 0, 4.3, 6.4, 12.6);
    /* La Giralda */
    const gx = 50, gz = -72, br = 0xd6a274, sb = 0xe4b88c;
    box(P, br, gx - 7, gx + 7, 0, 52, gz - 7, gz + 7); box(P, 0xc8946a, gx - 7.2, gx + 7.2, 0, 3, gz - 7.2, gz + 7.2); arch(P, 0x1e1a16, gx, 0, gz - 7.1, 2.4, 4.2);
    for (const [fx, fz, ry] of [[0, 7.08, 0], [0, -7.08, 0], [7.08, 0, Math.PI / 2], [-7.08, 0, Math.PI / 2]]) { for (const o of [-3.8, 3.8]) { const x = gx + (ry ? fx : o), z = gz + (ry ? o : fz); P.push([BG.box, sb, M(x, 37, z, 3.6, 22, .16, 0, ry, 0), 0]); for (let y = 28; y < 46; y += 1.6) P.push([BG.box, 0xc08860, M(x, y, z + (ry ? 0 : Math.sign(fz) * .05), 3.2, .12, .12, 0, ry, 0), 0]) }
      for (let y = 26; y < 50; y += 5.5) { const x = gx + fx, z = gz + fz; arch(P, dk, x, y, z, 1.1, 2.6, ry) } }
    box(P, 0xeedcb4, gx - 6.5, gx + 6.5, 52, 62, gz - 6.5, gz + 6.5); for (const [fx, fz, ry] of [[0, 6.6, 0], [0, -6.6, 0], [6.6, 0, Math.PI / 2], [-6.6, 0, Math.PI / 2]]) for (const o of [-3.2, 0, 3.2]) { const x = gx + (ry ? fx : o), z = gz + (ry ? o : fz); arch(Gl, 0x2a2018, x, 53.5, z, 1.8, 5.5, ry) }
    box(P, 0xd8c49c, gx - 7, gx + 7, 61.6, 62.4, gz - 7, gz + 7); box(P, 0xeedcb4, gx - 4.5, gx + 4.5, 62.4, 68, gz - 4.5, gz + 4.5); box(P, 0xd6a274, gx - 3, gx + 3, 68, 72, gz - 3, gz + 3);
    P.push([BG.cyl, 0xeedcb4, M(gx, 73.5, gz, 2.2, 3, 2.2), 0], [BG.hem, 0x9ab0a0, M(gx, 75, gz, 2.3, 2, 2.3), 0], [BG.box, 0x5a4a2a, M(gx, 78.5, gz, .5, 3, .5), 0], [BG.box, 0x5a4a2a, M(gx, 79.6, gz, 1.6, .4, .3), 0]);
    Gl.push([BG.box, 0xfff0c8, M(gx, 52.2, gz, 13.2, .25, 13.2), 1]);   /* the belfry glows at night */
    out.giralda = [gx, gz] }
  /* ======================= Archivo de Indias ======================= */
  { box(P, 0xc07a58, -22, 14, 0, 15, 14, 48); box(P, 0xe8dcc0, -22.2, 14.2, 0, 1.2, 13.8, 48.2); box(P, 0xe8dcc0, -22.3, 14.3, 7.2, 7.8, 13.7, 48.3); box(P, 0xe8dcc0, -22.4, 14.4, 14.4, 15.4, 13.6, 48.4);
    for (let x = -20; x <= 12; x += 4) { box(P, 0xe8dcc0, x - .35, x + .35, 0, 15, 13.7, 14); for (const y of [3.6, 10.6]) { box(P, 0xe8dcc0, x + 1.2, x + 2.8, y - 1.6, y + 1.6, 13.75, 13.9); box(P, 0x2a2a2a, x + 1.4, x + 2.6, y - 1.4, y + 1.4, 13.7, 13.8) } pinn(x, 15.4, 14.2, .7, 0xe8dcc0) }
    for (let z = 16; z <= 46; z += 4) { box(P, 0xe8dcc0, -22.3, -22, 0, 15, z - .35, z + .35); for (const y of [3.6, 10.6]) box(P, 0x2a2a2a, -22.35, -22.2, y - 1.4, y + 1.4, z + 1.4, z + 2.6) } }
  /* ======================= Real Alcázar ======================= */
  { const R0 = sol('alcazar'), och = 0xd8a860, och2 = 0xc8985a, wall = 0xd0a46a;
    for (const [x0, x1, z0, z1] of massRects(R0, carves)) { const inner = x0 > -14 && x1 < 94 && z0 > 54 && z1 < 166; box(P, inner ? 0xeadcc0 : och, x0, x1, 0, inner ? 12 : 10, z0, z1) }
    /* crenellated outer wall (gaps at the Puerta del León and the Callejón del Agua gate) */
    const cren = (ax, az, bx, bz, gaps) => { const L2 = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L2, uz = (bz - az) / L2; for (let t = 1; t < L2; t += 2.2) { const x = ax + ux * t, z = az + uz * t; if ((gaps || []).some(g => Math.hypot(x - g[0], z - g[1]) < g[2])) continue; P.push([BG.box, och2, M(x, 10.6, z, ux ? 1.1 : .8, 1.2, uz ? 1.1 : .8), 0]) } };
    cren(-22, 48.3, 100.3, 48.3, [[40, 48.3, 5]]); cren(100.6, 48, 100.6, 170, [[100.6, 142, 5]]); cren(-22, 170, 100.3, 170); cren(-22.3, 48, -22.3, 170);
    for (const [x, z] of [[-22, 48], [100.3, 48], [-22, 170], [100.3, 170], [30, 48], [50, 48]]) { box(P, och2, x - 2.2, x + 2.2, 0, 13, z - 2.2, z + 2.2); for (let k = 0; k < 4; k++) { const a = k / 4 * TAU; P.push([BG.box, och2, M(x + Math.cos(a) * 1.8, 13.6, z + Math.sin(a) * 1.8, 1, 1.2, 1), 0]) } }
    /* Puerta del León: red wall, the lion azulejo over the arch */
    box(P, 0xa8402a, 30, 50, 0, 12, 46.6, 48.4); box(P, 0x1e1a16, 37, 43, 0, 5.2, 46.4, 48.6); sign('leon', 40, 8, 46.35, 4.2, 4.2, Math.PI); box(P, 0xe0d0b0, 36.2, 43.8, 5.2, 5.8, 46.3, 48.7);
    /* Patio de las Doncellas: an arcade round a long pool and sunken gardens */
    const D = [28, 58, 86, 108]; for (let x = D[0] + 1.5; x <= D[1] - 1.5; x += 3) for (const z of [D[2] + 1.2, D[3] - 1.2]) { box(P, 0xf0e8d8, x - .18, x + .18, 0, 3.4, z - .18, z + .18); box(P, 0xf0e8d8, x - 1.5, x + 1.5, 3.4, 4.6, z - .3, z + .3) }
    for (let z = D[2] + 1.2; z <= D[3] - 1.2; z += 3) for (const x of [D[0] + 1.2, D[1] - 1.2]) box(P, 0xf0e8d8, x - .18, x + .18, 0, 3.4, z - .18, z + .18);
    box(P, 0xf0e8d8, D[0] + .8, D[1] - .8, 4.4, 4.8, D[2] + .8, D[3] - .8);
    box(P, 0x8a7a60, 40.6, 45.4, -.4, .05, 88, 106); { const w = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 17.6), K.water({ deep: 0x2a5a4a, shallow: 0x5a8a7a, opacity: .95 })); w.rotation.x = -Math.PI / 2; w.position.set(43, -.12, 97); grp.add(w) } N.block(GW.rectPoly(40.8, 45.2, 88.2, 105.8));
    for (const x of [34, 52]) for (let z = 89; z < 106; z += 3.4) { P.push([BG.ico, 0x3a6a2e, M(x, .9, z, .8, .8, .8), 0]); P.push([BG.sphL, 0xf08a1a, M(x + .4, 1.2, z, .1, .1, .1), 0]) }
    /* Patio del León: the Sala de la Justicia front, a fountain */
    box(P, 0xf0e8d8, 18, 62, 0, .3, 79, 80); P.push([BG.cyl, 0xd8ccb0, M(40, .35, 70, 1.4, .7, 1.4), 0], [BG.cyl, 0xd8ccb0, M(40, 1.2, 70, .25, 1.6, .25), 0]); N.blockCircle(40, 70, 1.5);
    /* the gardens: hedged parterres, a pavilion, the Mercury pond */
    for (const [x0, x1, z0, z1] of [[0, 18, 124, 125], [0, 18, 136, 137], [28, 50, 124, 125], [28, 50, 152, 153], [62, 84, 124, 125], [62, 84, 152, 153]]) { box(P, 0x2e5a26, x0, x1, 0, .9, z0 - .4, z1 + .4); N.block(GW.rectPoly(x0, x1, z0 - .4, z1 + .4)) }
    box(P, 0xe8dcc0, 66, 74, 0, 4.5, 140, 148); box(P, 0xa8542e, 65.5, 74.5, 4.5, 5, 139.5, 148.5); P.push([BG.hem, 0xb8644a, M(70, 5, 144, 3.4, 2, 3.4), 0]); N.block(GW.rectPoly(66, 74, 140, 148));
    P.push([BG.cyl, 0xc8b890, M(8, .4, 156, 4, .8, 4), 0]); { const w = new THREE.Mesh(new THREE.CircleGeometry(3.6, 24), K.water({ deep: 0x2a5a4a, shallow: 0x5a8a7a, opacity: .95 })); w.rotation.x = -Math.PI / 2; w.position.set(8, .62, 156); grp.add(w) } N.blockCircle(8, 156, 4.1);
    out.alcazar = { gate: [40, 52], doncellas: [43, 97], gardens: [40, 140], waterGate: [96, 142] } }
  /* ======================= Ayuntamiento (+ the arquillo through it) ======================= */
  { const s1 = 0xe8dcc4, s2 = 0xd8c8a8; box(P, s1, -38, -22, 0, 16, -182, -166); box(P, s1, -38, -22, 0, 16, -160, -140); box(P, s1, -38, -22, 5.4, 16, -166, -160); arch(P, s2, -37.9, 0, -163, 7.4, 6.4, Math.PI / 2); arch(P, s2, -22.1, 0, -163, 7.4, 6.4, Math.PI / 2);
    for (const x of [-38.15, -21.85]) for (let z = -180; z < -142; z += 3.6) { if (Math.abs(z + 163) < 4) continue; box(P, s2, x - .15, x + .15, 0, 16, z - .25, z + .25); for (const y of [3, 9]) { box(P, s2, x - .2, x + .2, y - 1.6, y + 1.6, z + .5, z + 2.6); box(P, 0x2a2a2a, x - .22, x + .22, y - 1.4, y + 1.4, z + .7, z + 2.4) } }
    box(P, s2, -38.6, -21.4, 15.6, 16.6, -182.6, -139.4); for (let z = -180; z <= -142; z += 6) for (const x of [-38, -22]) pinn(x, 16.6, z, .7, s2) }
  /* ======================= Iglesia del Salvador ======================= */
  { const pk = 0xe6ae98, tr2 = 0xeadcbc; box(P, pk, 56, 92, 0, 20, -262, -236); box(P, tr2, 55.8, 92.2, 19, 20.6, -262.2, -235.8);
    for (const x of [64, 74, 84]) { arch(P, 0x241c16, x, 0, -235.85, x === 74 ? 4 : 3, x === 74 ? 8 : 6.4); for (const sx of [-1, 1]) box(P, tr2, x + sx * (x === 74 ? 2.6 : 2), x + sx * (x === 74 ? 2.6 : 2) + .7 * sx, 0, 13, -235.9, -235.6) } P.push([BG.cyl, pk, M(74, 23, -250, 7, 6, 7), 0], [BG.hem, 0xb8644a, M(74, 26, -250, 7.4, 7, 7.4), 0], [BG.cyl, tr2, M(74, 34, -250, 1.6, 3, 1.6), 0], [BG.cone, 0xb8644a, M(74, 36.5, -250, 1.8, 2, 1.8), 0]);
    box(P, pk, 86, 92, 20, 30, -262, -256); box(P, tr2, 85.6, 92.4, 30, 31, -262.4, -255.6); arch(Gl, 0x2a2018, 89, 23, -255.9, 2.4, 5) }
  /* ======================= La Maestranza ======================= */
  { const c = [-130, 0], r = 32, wh = 0xf6f2e8, al = 0xe8b040; const ring = new THREE.CylinderGeometry(r, r, 12, 56, 1, true); P.push([ring, wh, M(c[0], 6, c[1]), 0]);
    P.push([new THREE.CylinderGeometry(r + .5, r - 5, 3, 56, 1, true), 0xb05a30, M(c[0], 13.4, c[1]), 0]); P.push([new THREE.CylinderGeometry(r + .25, r + .25, .8, 56, 1, true), al, M(c[0], 11.8, c[1]), 0]); P.push([new THREE.CylinderGeometry(r + .2, r + .2, 1.2, 56, 1, true), al, M(c[0], .6, c[1]), 0]);
    for (let k = 0; k < 48; k++) { const a = k / 48 * TAU, x = c[0] + Math.cos(a) * (r + .1), z = c[1] + Math.sin(a) * (r + .1); P.push([BG.box, al, M(x, 6, z, .7, 11, .25, 0, -a + Math.PI / 2, 0), 0]); if (k % 2) arch(P, 0x3a2e24, c[0] + Math.cos(a + TAU / 96) * (r + .12), 6.8, c[1] + Math.sin(a + TAU / 96) * (r + .12), 1.6, 3.2, -a - TAU / 96 + Math.PI / 2) }
    /* Puerta del Príncipe, towards the river */
    box(P, 0xd8c49c, c[0] - r - 1.4, c[0] - r + 2, 0, 14, -6, 6); arch(P, 0x1e1a16, c[0] - r - 1.5, 0, 0, 4, 8, Math.PI / 2); box(P, al, c[0] - r - 1.6, c[0] - r + 2, 13.4, 14.6, -6.4, 6.4) }
  /* ======================= Hospital de la Caridad ======================= */
  { box(P, 0xf6f2e8, -160, -128, 0, 14, 62, 96); box(P, 0xa8402a, -160.2, -127.8, 0, 1.2, 61.8, 96.2); box(P, 0xa8402a, -160.3, -127.7, 13.4, 14.4, 61.7, 96.3);
    for (let x = -156; x < -130; x += 6.4) { sign('caridad', x, 7.5, 61.75, 2.8, 2.8, Math.PI); box(P, 0xa8402a, x - 1.7, x + 1.7, 5.9, 9.1, 61.8, 61.9) } box(P, 0xf6f2e8, -147, -141, 14, 21, 62, 64); box(P, 0xa8402a, -147.3, -140.7, 20.6, 21.4, 61.8, 64.2); for (const x of [-145.6, -142.4]) arch(Gl, 0x2a2018, x, 15.6, 61.9, 1.4, 3.6, 0) }
  /* ======================= Torre del Oro ======================= */
  { const c = [-176, 142], go = 0xdcb878; P.push([new THREE.CylinderGeometry(6, 6.2, 15, 12), go, M(c[0], 7.5, c[1]), 0]); for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; P.push([BG.box, go, M(c[0] + Math.cos(a) * 5.7, 15.6, c[1] + Math.sin(a) * 5.7, 1.2, 1.2, 1.2, 0, -a, 0), 0]); arch(P, 0x2a2018, c[0] + Math.cos(a) * 6.02, 9, c[1] + Math.sin(a) * 6.02, 1, 2.2, -a + Math.PI / 2) }
    P.push([new THREE.CylinderGeometry(3.8, 3.8, 7.5, 12), 0xe8c888, M(c[0], 19, c[1]), 0], [new THREE.CylinderGeometry(2.6, 2.6, 4, 12), go, M(c[0], 24.7, c[1]), 0], [BG.hem, 0xe8c860, M(c[0], 26.7, c[1], 2.7, 2.6, 2.7), 0]); Gl.push([new THREE.CylinderGeometry(3.85, 3.85, .3, 12), 0xffe0a0, M(c[0], 18, c[1]), 1]) }
  /* ======================= Mercado de Triana (walk-through hall) ======================= */
  { const x0 = -279, x1 = -245, z0 = -112, z1 = -73, br = 0xb8643a; const stalls = [];
    for (let x = x0 + 3; x <= x1 - 2; x += 8) for (let z = z0 + 3; z <= z1 - 2; z += 9.5) { box(P, 0x3a4a3a, x - .2, x + .2, 0, 6.6, z - .2, z + .2); N.blockCircle(x, z, .2) }
    box(P, 0xd8cfc0, x0, x1, 6.6, 7.2, z0, z1); box(P, 0x8ab0c0, x0 + 6, x1 - 6, 7.2, 8.6, z0 + 6, z1 - 6); box(Gs, 0xa8c8d8, x0 + 6.2, x1 - 6.2, 8.6, 8.7, z0 + 6.2, z1 - 6.2);
    /* neo-mudéjar brick front towards the Altozano */
    box(P, br, x0, x1, 4.6, 9.6, z1 - .6, z1); for (let x = x0 + 3; x < x1 - 2; x += 5) { arch(P, 0xe8d8b8, x, 4.8, z1 + .05, 2.6, 4) } sign('mercado', (x0 + x1) / 2, 8.4, z1 + .08, 12, 1.5, 0); for (const x of [x0, x1]) { box(P, br, x - 1, x + 1, 0, 11, z1 - 2, z1); pinn(x, 11, z1 - 1, 1, br) }
    const cols2 = [0xc8143a, 0xf2c230, 0x3aa85a, 0xe8e0d0, 0xd86a2a, 0x8a2a1a];
    for (const [sx, sz, kind] of [[-272, -104, 'fruta'], [-262, -104, 'pescado'], [-252, -104, 'jamon'], [-272, -88, 'especias'], [-262, -88, 'flores'], [-252, -88, 'tapas']]) { box(P, 0x6a4a2a, sx - 2.4, sx + 2.4, 0, 1, sz - .7, sz + .7); box(P, 0xe8e0d0, sx - 2.5, sx + 2.5, 1, 1.06, sz - .8, sz + .8); for (let k = 0; k < 6; k++) box(P, cols2[(k + stalls.length) % 6], sx - 2.1 + k * .8, sx - 1.5 + k * .8, 1.06, 1.3, sz - .5, sz + .2); box(P, 0xf2f0ea, sx - 2.6, sx + 2.6, 2.9, 3, sz - 1.4, sz + .9); box(Gl, 0xfff0c8, sx - .4, sx + .4, 2.6, 2.9, sz - .1, sz + .1, 1); N.block(GW.rectPoly(sx - 2.5, sx + 2.5, sz - .8, sz + .8)); stalls.push({ x: sx, z: sz - 1.9, kind, staff: [sx, sz + 1.6] }) }
    out.market = stalls }
  /* ======================= bridges ======================= */
  for (const b of N.bridges) { const [a, e] = b.pts, dx = e[0] - a[0], dz = e[1] - a[1], Lb = Math.hypot(dx, dz), th = Math.atan2(-dz, dx), base = new THREE.Matrix4().makeRotationY(th).premultiply(new THREE.Matrix4().makeTranslation((a[0] + e[0]) / 2, 0, (a[1] + e[1]) / 2));
    const deck = (dy, flip) => { const g = new THREE.PlaneGeometry(Lb, b.w, 48, 1); g.rotateX(-Math.PI / 2); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const t = p.getX(i) / Lb + .5; p.setY(i, .02 + b.rise * Math.sin(t * Math.PI) + dy) } if (flip) { const ix = g.index.array; for (let i = 0; i < ix.length; i += 3) { const k = ix[i]; ix[i] = ix[i + 1]; ix[i + 1] = k } } g.computeVertexNormals(); return g };
    const triana = b.id === 'isabel_ii'; P.push([deck(.02), triana ? 0x6a6660 : 0x8a8478, base.clone(), 0], [deck(-.6, true), 0x5a5a5a, base.clone(), 0]);
    const yAt = t => .02 + b.rise * Math.sin(t * Math.PI), put = GW.putter(P, base);
    for (let i = 0; i < 40; i++) { const t0 = i / 40, t1 = (i + 1) / 40, xm = ((t0 + t1) / 2 - .5) * Lb, y = yAt((t0 + t1) / 2); for (const sd of [-1, 1]) { put(BG.box, triana ? 0x2a3a3a : 0xd8d0c0, xm, y + 1, sd * (b.w / 2 - .1), Lb / 40, .08, .14); if (i % 2 === 0) put(BG.box, triana ? 0x2a3a3a : 0xd8d0c0, xm, y + .5, sd * (b.w / 2 - .1), .08, 1, .08) } }
    if (triana) { /* the iron arches with their rings (the bridge's signature) */ const spans = 3, sw = (PLAN.river.x1 - PLAN.river.x0) / spans; for (let s = 0; s < spans; s++) { for (const sd of [-1, 1]) { for (let k = 0; k < 16; k++) { const u0 = k / 16, u1 = (k + 1) / 16, xa = -Lb / 2 + (Lb - (PLAN.river.x1 - PLAN.river.x0)) / 2 + s * sw, ya = y2 => -2 + 1.8 * Math.sin(y2 * Math.PI); const xs = xa + sw * (u0 + u1) / 2, yy = ya((u0 + u1) / 2); put(BG.box, 0x2a3a3a, xs, yy, sd * (b.w / 2 - .4), sw / 16 + .05, .35, .3) }
          for (let k = 1; k < 6; k++) { const xs = -Lb / 2 + (Lb - (PLAN.river.x1 - PLAN.river.x0)) / 2 + s * sw + sw * k / 6, ty = (xs / Lb) + .5, yd = yAt(ty) - .6, ya2 = -2 + 1.8 * Math.sin(k / 6 * Math.PI), rr2 = Math.max(.3, (yd - ya2) / 2 - .05); P.push([new THREE.TorusGeometry(rr2, .07, 6, 14), 0x2a3a3a, new THREE.Matrix4().multiplyMatrices(base, M(xs, (yd + ya2) / 2, sd * (b.w / 2 - .4))), 0]) } }
        const px = -Lb / 2 + (Lb - (PLAN.river.x1 - PLAN.river.x0)) / 2 + s * sw; put(BG.box, 0xc8b890, px, -2.4, 0, 2.2, 3.6, b.w + .6) } }
    else for (let s = 1; s < 4; s++) put(BG.box, 0xc8b890, -Lb / 2 + (Lb - 50) / 2 + s * 12.5, -2.2, 0, 2.4, 3.2, b.w) }
  /* ======================= fountains + statues ======================= */
  const fountains = [];
  { /* Plaza Nueva: San Fernando on horseback */ const [x, z] = [-66, -158]; box(P, 0xd8ccb0, x - 2.6, x + 2.6, 0, 1, z - 3.2, z + 3.2); box(P, 0xc8bca0, x - 1.8, x + 1.8, 1, 4.6, z - 2.6, z + 2.6); const br = 0x3a4a40; box(P, br, x - .7, x + .7, 5.6, 7, z - 1.8, z + 1.8); for (const sz of [-1.3, 1.3]) for (const sx of [-.45, .45]) box(P, br, x + sx - .12, x + sx + .12, 4.6, 5.8, z + sz - .12, z + sz + .12); box(P, br, x - .35, x + .35, 6.6, 8, z - 2.4, z - 1.6); box(P, br, x - .35, x + .35, 7, 8.6, z - .3, z + .3); P.push([BG.sph, br, M(x, 9, z, .3, .3, .3), 0]); N.block(GW.rectPoly(x - 2.6, x + 2.6, z - 3.2, z + 3.2)) }
  { /* Puerta de Jerez: the Hispalis fountain */ const [x, z] = [-30, 178]; P.push([BG.cyl, 0xd8ccb0, M(x, .45, z, 6, .9, 6), 0], [BG.cyl, 0xd8ccb0, M(x, 1.6, z, 1.2, 2.4, 1.2), 0], [BG.cyl, 0xd8ccb0, M(x, 2.9, z, 2.6, .3, 2.6), 0], [BG.cyl, 0xd8ccb0, M(x, 4, z, .5, 2, .5), 0]); P.push([BG.box, 0x3a4a40, M(x, 5.6, z, .6, 1.8, .5), 0]); const w = new THREE.Mesh(new THREE.CircleGeometry(5.6, 32), K.water({ deep: 0x2a5a6a, shallow: 0x5a9aaa, opacity: .9 })); w.rotation.x = -Math.PI / 2; w.position.set(x, .75, z); grp.add(w); N.blockCircle(x, z, 6.2); fountains.push([x, z]) }
  { /* Virgen de los Reyes: the lamp-fountain */ const [x, z] = [76, -86]; P.push([BG.cyl, 0xd8ccb0, M(x, .4, z, 3, .8, 3), 0], [BG.cyl, 0x2a2a2a, M(x, 3, z, .22, 6, .22), 0]); for (let k = 0; k < 4; k++) { const a = k / 4 * TAU; box(P, 0x2a2a2a, x + Math.cos(a) * .4 - .5, x + Math.cos(a) * .4 + .5, 5.4, 5.5, z + Math.sin(a) * .4 - .05, z + Math.sin(a) * .4 + .05); box(Gl, 0xffd89a, x + Math.cos(a) * .9 - .18, x + Math.cos(a) * .9 + .18, 5.5, 6.1, z + Math.sin(a) * .9 - .18, z + Math.sin(a) * .9 + .18, 1) } const w = new THREE.Mesh(new THREE.CircleGeometry(2.7, 24), K.water({ deep: 0x2a5a6a, shallow: 0x5a9aaa, opacity: .9 })); w.rotation.x = -Math.PI / 2; w.position.set(x, .7, z); grp.add(w); N.blockCircle(x, z, 3.2); fountains.push([x, z]) }
  { /* Plaza de Santa Cruz: the wrought-iron cross */ const [x, z] = [190, 40]; for (let k = 0; k < 8; k++) { const a = k / 8 * TAU, b2 = (k + 1) / 8 * TAU; obox(P, 0x1a1a1a, x + Math.cos(a) * 2, z + Math.sin(a) * 2, x + Math.cos(b2) * 2, z + Math.sin(b2) * 2, .05, .1, 1.1) } P.push([BG.cyl, 0xb8b0a0, M(x, .3, z, .9, .6, .9), 0]); box(P, 0x1a1a1a, x - .12, x + .12, .6, 5.6, z - .12, z + .12); box(P, 0x1a1a1a, x - 1, x + 1, 4.3, 4.5, z - .1, z + .1); for (let k = 0; k < 4; k++) P.push([BG.box, 0x1a1a1a, M(x, 5.8 + k * .1, z, .6 - k * .1, .05, .6 - k * .1, 0, k * .4, 0), 0]); N.blockCircle(x, z, 2) }
  { /* Doña Elvira: little tiled fountain + azulejo benches */ const [x, z] = [128, -38]; P.push([BG.cyl, 0x1f4a9a, M(x, .35, z, 1.4, .7, 1.4), 0], [BG.cyl, 0xe8e0d0, M(x, .9, z, .25, 1, .25), 0]); N.blockCircle(x, z, 1.5); for (let k = 0; k < 4; k++) { const a = k / 4 * TAU + .4, bx = x + Math.cos(a) * 6.2, bz = z + Math.sin(a) * 6.2; P.push([BG.box, 0x1f4a9a, M(bx, .25, bz, 2.2, .5, .6, 0, -a + Math.PI / 2, 0), 0], [BG.box, 0xe8a820, M(bx, .52, bz, 2.3, .06, .66, 0, -a + Math.PI / 2, 0), 0]); N.blockCircle(bx, bz, .5) } fountains.push([x, z]) }
  { /* Altozano: the matador's statue */ const [x, z] = [-258, -60]; P.push([BG.cyl, 0xd8ccb0, M(x, 1, z, 1.6, 2, 1.6), 0], [BG.box, 0x3a4a40, M(x, 2.9, z, .5, 1.8, .4), 0], [BG.sph, 0x3a4a40, M(x, 4, z, .22, .22, .22), 0]); N.blockCircle(x, z, 1.7) }
  { /* Plaza de Cuba */ const [x, z] = [-262, 218]; P.push([BG.cyl, 0xd8ccb0, M(x, .4, z, 4, .8, 4), 0], [BG.cyl, 0xd8ccb0, M(x, 1.6, z, .5, 2.4, .5), 0]); const w = new THREE.Mesh(new THREE.CircleGeometry(3.7, 24), K.water({ deep: 0x2a5a6a, shallow: 0x5a9aaa, opacity: .9 })); w.rotation.x = -Math.PI / 2; w.position.set(x, .7, z); grp.add(w); N.blockCircle(x, z, 4.2); fountains.push([x, z]) }
  out.fountains = fountains;
  /* ======================= Real de la Feria (structures shown only while the fair is on) ======================= */
  { const casetas = [], cs = 9, FX = [[-444, -381], [-365, -302]], rows = [[256, -1], [268, 1], [294, -1], [306, 1], [332, -1]];   /* [front z, faces: 1 = front faces north (-z), -1 = south] */
    const stripes = [[0x2a7a3a, 0xf6f2e6], [0xc8143a, 0xf6f2e6], [0x1f4a9a, 0xf6f2e6], [0xe8a820, 0xf6f2e6]];
    let ci = 0; for (const [fz, f] of rows) for (const [xa, xb] of FX) for (let x = xa; x + cs <= xb + .1; x += cs) { const d = 11.5, zB = fz + f * d, zc = (fz + zB) / 2, s = stripes[ci % 4], xc = x + cs / 2;
      /* canvas: two sloped roof sides in stripes, side + back walls, a scalloped pelmet, the wooden railing with its gap */
      for (let k = 0; k < 6; k++) { const xs = x + cs * (k + .5) / 6; for (const side of [-1, 1]) FP.push([BG.box, s[k % 2], M(xs, 3.9, zc + side * d / 4, cs / 6 + .02, .06, d / 2 + .3, side * f * .2, 0, 0), 0]) }
      FP.push([BG.box, s[0], M(x + .1, 1.7, zc, .12, 3.4, d), 0], [BG.box, s[0], M(x + cs - .1, 1.7, zc, .12, 3.4, d), 0], [BG.box, s[1], M(xc, 1.7, zB, cs, 3.4, .12), 0]);
      for (let k = 0; k < 9; k++) FP.push([BG.box, s[k % 2], M(x + cs * (k + .5) / 9, 3.2, fz, cs / 9, .5, .08), 0]);
      for (const sx of [-1, 1]) FP.push([BG.box, 0x6a4a2a, M(xc + sx * (cs / 4 + .7), .55, fz - f * .2, cs / 2 - 1.4, 1.1, .1), 0]);
      FP.push([BG.box, 0x5a3a20, M(xc, .55, zB - f * 1.2, cs - 1.6, 1.1, .8), 0], [BG.box, 0xe8e0d0, M(xc, 1.12, zB - f * 1.2, cs - 1.4, .05, 1), 0]);
      for (let k = 0; k < 3; k++) { const tz = fz + f * (3 + k * 2.4); FP.push([BG.box, 0xf2f0ea, M(xc - 1.6, .75, tz, 1, .05, 1), 0], [BG.box, 0xf2f0ea, M(xc + 1.6, .75, tz, 1, .05, 1), 0]) }
      for (let k = 0; k < 5; k++) FG.push([BG.oct, [0xfff6d8, 0xffd060, 0xff6a4a][k % 3], M(x + cs * (k + .5) / 5, 3.2, zc, .22, .26, .22), 1]);
      FQ.push({ k: 'cs' + (ci % CASETAS_N), x: xc, y: 3.75, z: fz - f * .06, w: 3.4, h: .85, ry: f > 0 ? Math.PI : 0 });
      const walls = [GW.rectPoly(x, x + .25, Math.min(fz, zB), Math.max(fz, zB)), GW.rectPoly(x + cs - .25, x + cs, Math.min(fz, zB), Math.max(fz, zB)), GW.rectPoly(x, x + cs, zB - (f > 0 ? 0 : .25), zB + (f > 0 ? .25 : 0)), GW.rectPoly(x + .25, xc - 1.3, fz - .15, fz + .15), GW.rectPoly(xc + 1.3, x + cs - .25, fz - .15, fz + .15), GW.rectPoly(xc - (cs - 1.6) / 2, xc + (cs - 1.6) / 2, Math.min(zB - f * .8, zB - f * 1.6), Math.max(zB - f * .8, zB - f * 1.6))];
      casetas.push({ x: xc, z: zc, front: [xc, fz - f * 1.2], bar: [xc, zB - f * 2.4], staff: [xc, zB - f * .6], f, walls, name: (SEV.CASETAS || [])[ci % CASETAS_N] || 'Caseta' }); ci++ }
    /* farolillos: paper lanterns strung over every calle of the Real */
    const fl = [0xfff6ea, 0xc8143a, 0x2a7a3a, 0xfff6ea, 0xe8a820];
    for (const zc of [262, 300, 338]) for (const dz of [-3.6, 0, 3.6]) { for (let x = -444; x < -302; x += 2.1) { const y = 5.6 - .5 * Math.sin(((x + 444) % 12.6) / 12.6 * Math.PI); FG.push([BG.oct, fl[((x / 2.1) | 0) % 5 < 0 ? 0 : Math.abs((x / 2.1) | 0) % 5], M(x, y, zc + dz, .28, .34, .28), 1]) } FP.push([BG.box, 0x2a2a2a, M(-373, 5.9, zc + dz, 142, .03, .03), 0]) }
    for (let z = 250; z < 350; z += 2.1) for (const dx of [-3, 0, 3]) FG.push([BG.oct, fl[Math.abs((z / 2.1) | 0) % 5], M(-373 + dx, 5.8 - .4 * Math.sin(((z - 250) % 12.6) / 12.6 * Math.PI), z, .28, .34, .28), 1]);
    for (let x = -440; x < -300; x += 14) for (const z of [256, 344]) { FP.push([BG.box, 0x2a2a2a, M(x, 3, z, .14, 6, .14), 0]) }
    /* the portada (lit gateway) at the top of Calle Asunción */
    FQ.push({ k: 'portada', x: -373, y: 15.5, z: 246.2, w: 36, h: 31.5, ry: Math.PI }, { k: 'portada', x: -373, y: 15.5, z: 246.3, w: 36, h: 31.5, ry: 0 });
    for (const sx of [-1, 1]) { FP.push([BG.box, 0xe8e0d0, M(-373 + sx * 17.3, 15, 246.25, 1.2, 30, 1.2), 0]); } FQ.push({ k: 'feria', x: -373, y: 26.6, z: 246, w: 12, h: 1.9, ry: Math.PI });
    const portadaWalls = [GW.rectPoly(-391.5, -389.5, 245.4, 247.1), GW.rectPoly(-356.5, -354.5, 245.4, 247.1)];
    /* the funfair (Calle del Infierno): a Ferris wheel and a carousel, animated by the life file */
    const noria = new THREE.Group(); noria.position.set(-420, 11.5, 353); const wheelP = [];
    for (let k = 0; k < 24; k++) { const a = k / 24 * TAU, b2 = (k + 1) / 24 * TAU; wheelP.push([BG.box, 0xe8e0d0, M((Math.cos(a) + Math.cos(b2)) * 4.5, (Math.sin(a) + Math.sin(b2)) * 4.5, 0, 2.4, .2, .2, 0, 0, (a + b2) / 2 + Math.PI / 2), 0]); if (k % 3 === 0) { wheelP.push([BG.box, 0xc8c0b0, M(Math.cos(a) * 4.5, Math.sin(a) * 4.5, 0, .1, 9, .1, 0, 0, a + Math.PI / 2), 0]); wheelP.push([BG.box, [0xc8143a, 0x1f4a9a, 0xe8a820, 0x2a7a3a][k % 4], M(Math.cos(a) * 9, Math.sin(a) * 9 - 1, 0, 1.4, 1.2, 1.4), 0]) } }
    const wheelG = K.merge(wheelP), wm = K.floraMat(0, { rough: .6 }); wm.userData.lin = 1; const wheel = new THREE.Mesh(wheelG, wm); noria.add(wheel); E.festWheel = wheel;
    const bulbs = []; for (let k = 0; k < 48; k++) { const a = k / 48 * TAU; bulbs.push([BG.ico, k % 2 ? 0xffe680 : 0xff6a4a, M(Math.cos(a) * 9.3, Math.sin(a) * 9.3, .3, .2, .2, .2), 1]) } const bm = new THREE.MeshBasicMaterial({ vertexColors: true }); bm.userData.lin = 1; wheel.add(new THREE.Mesh(K.merge(bulbs), bm));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) FP.push([BG.box, 0xd8d0c0, M(-420 + sx * 3, 5.7, 353 + sz * 1.6, .3, 12.5, .3, 0, 0, sx * .26), 0]);
    const tiovivo = new THREE.Group(); tiovivo.position.set(-340, 0, 353); const tp = [[BG.cyl, 0xe8e0d0, M(0, .3, 0, 5, .6, 5), 0], [BG.cone, 0xc8143a, M(0, 5.2, 0, 5.6, 2, 5.6), 0], [BG.cyl, 0xe8a820, M(0, 2.6, 0, .4, 4.4, .4), 0]]; for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; tp.push([BG.box, 0xf6f2e6, M(Math.cos(a) * 3.6, 1.2, Math.sin(a) * 3.6, .35, .9, 1.2, 0, -a, 0), 0], [BG.box, 0xe8a820, M(Math.cos(a) * 3.6, 2.6, Math.sin(a) * 3.6, .06, 3, .06), 0]) }
    const tvm = new THREE.Mesh(K.merge(tp), wm); tiovivo.add(tvm);
    const fun = new THREE.Group(); fun.add(noria); fun.add(tiovivo); E.funfair = fun;
    out.casetas = casetas; out.portadaWalls = portadaWalls; out.noria = noria; out.wheel = wheel; out.tiovivo = tiovivo; out.funfair = fun;
    out.funWalls = [GW.rectPoly(-424, -416, 350.5, 355.5), GW.circPoly(-340, 353, 5.4, 12)];
    /* year-round: a few lamp posts on the albero */
    for (let x = -436; x < -300; x += 34) for (const z of [262, 300, 338]) { box(P, 0x1a1a1a, x - .08, x + .08, 0, 4.4, z - .08, z + .08); box(Gl, 0xffd89a, x - .22, x + .22, 4.3, 4.8, z - .22, z + .22, 1); N.blockCircle(x, z, .15) } }
  return out };
const CASETAS_N = 10;
})(window.AV);
