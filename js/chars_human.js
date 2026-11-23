/* APEVERSE - chars_human.js : human characters (classic pivot API: userData head/aL/aR/lL/lR/torso + props).
   Realistic build: a sculpted head (signed-distance skull + face sampled along rays from the head centre), a painted face
   generated per character (skin tone, eyes, brows, lips, nose shading, age lines, makeup, stubble / beards, scalp hair),
   hair and beard shells that follow the skull, and an anatomical torso / limbs with real proportions.
   C.human(o)        -> animated character, o.seed picks the face (otherwise derived from the look)
   C.crew.mud() ...  -> classic Giant Hostel crew (chars_soft.js replaces C.crew with soft bodies; these stay as C.classicCrew)
   C.walkerKit(v,lo) -> baked per-pivot geometry for instanced pedestrians (js/city_life.js); colour slots in the aGlow channel:
                        0 fixed, 1 skin, 2 shirt, 3 pants, 4 hair, 5 face (samples the face atlas, C.faceAtlas()).
   C.walkerFace(v,r) -> per-instance face index + head-shape weights for city_life.js (iFace / iShape). */
'use strict';
(function (AV) {
const C = AV.chars, std = AV.std, TAU = AV.TAU, KK = C._kit, { part, GH, GL, hiresTex, shade } = KK;
/* ultra-light geometry for instanced pedestrians (dozens on screen at once) */
const GU = (() => { const P = [[0, 0], [.78, 0], [.88, .25], [.95, .6], [1, .8], [.8, .96], [.3, 1.02], [0, 1.03]].map(p => new THREE.Vector2(p[0], p[1]));
  const s = { sph: new THREE.SphereGeometry(1, 8, 5), sphH: new THREE.SphereGeometry(1, 10, 7), dot: new THREE.SphereGeometry(1, 5, 3), torso: new THREE.LatheGeometry(P, 9), taper: new THREE.CylinderGeometry(1, .82, 1, 6), cyl: new THREE.CylinderGeometry(1, 1, 1, 6),
    fing: new THREE.CylinderGeometry(1, .85, 1, 3), smile: new THREE.TorusGeometry(1, .18, 3, 6, Math.PI), box: new THREE.BoxGeometry(1, 1, 1), frust: new THREE.CylinderGeometry(.62, 1, 1, 8), hem: new THREE.SphereGeometry(1, 8, 4, 0, TAU, 0, Math.PI / 2), ring: new THREE.TorusGeometry(1, .22, 3, 8) };
  for (const k in s) s[k].userData.shared = true; return s })();

/* ---------------- printed fabrics (canvas, cached) ---------------- */
const TX = {};
const fab = (k, draw) => TX[k] || (TX[k] = hiresTex(256, draw));
const T = {
  giantTee: () => fab('giant', c => { c.fillStyle = '#16161a'; c.fillRect(0, 0, 128, 128); c.strokeStyle = '#f4f0e8'; c.lineWidth = 3; c.beginPath(); c.arc(64, 60, 34, 0, TAU); c.stroke(); c.fillStyle = '#f4f0e8'; c.textAlign = 'center'; c.font = 'bold 15px Georgia'; c.fillText('GIANT', 64, 57); c.fillText('HOSTEL', 64, 72); c.font = '7px Georgia'; c.fillText('CHIANG MAI', 64, 84); for (let i = 0; i < 10; i++) { const a = -Math.PI * .9 + i * .2; c.beginPath(); c.arc(64 + Math.cos(a) * 30, 60 + Math.sin(a) * 30, 1.2, 0, TAU); c.fill() } }),
  ztonedTee: () => fab('ztee', c => { c.fillStyle = '#2a1c1c'; c.fillRect(0, 0, 128, 128); c.fillStyle = '#c86a4a'; c.beginPath(); c.arc(64, 70, 20, 0, TAU); c.fill(); c.fillStyle = '#1a1010'; c.fillRect(48, 63, 32, 7); c.fillStyle = '#ff9ad8'; c.font = 'bold italic 17px Georgia'; c.textAlign = 'center'; c.fillText('ZtonedApe', 64, 42); c.fillStyle = '#e83a30'; for (const x of [44, 64, 84]) { c.beginPath(); c.arc(x, 104, 7, Math.PI, 0); c.fill() } c.fillStyle = '#fff'; for (const x of [42, 47, 62, 67, 82, 87]) { c.beginPath(); c.arc(x, 101, 1.3, 0, TAU); c.fill() } c.fillStyle = '#7ad84a'; c.beginPath(); c.moveTo(64, 14); c.lineTo(70, 26); c.lineTo(64, 23); c.lineTo(58, 26); c.fill() }),
  heartTee: () => fab('heart', c => { c.fillStyle = '#202024'; c.fillRect(0, 0, 128, 128); c.fillStyle = '#f4f0e8'; c.font = 'bold 18px Georgia'; c.textAlign = 'center'; c.fillText('I', 40, 60); c.fillStyle = '#e8303a'; c.beginPath(); c.moveTo(64, 66); c.bezierCurveTo(44, 50, 52, 36, 64, 46); c.bezierCurveTo(76, 36, 84, 50, 64, 66); c.fill(); c.fillStyle = '#f4f0e8'; c.font = 'bold 13px Georgia'; c.fillText('Chiang Mai', 64, 84) }),
  elephant: () => fab('ele', c => { c.fillStyle = '#8a1a1e'; c.fillRect(0, 0, 128, 128); c.fillStyle = '#e8d0a8'; for (let y = 0; y < 128; y += 32) { c.fillRect(0, y, 128, 2); for (let x = 4; x < 128; x += 8) c.fillRect(x, y + 4, 4, 2) }
    const ele = (x, y) => { c.beginPath(); c.ellipse(x, y, 9, 6, 0, 0, TAU); c.fill(); c.beginPath(); c.arc(x + 8, y - 3, 4.5, 0, TAU); c.fill(); c.fillRect(x + 10, y - 2, 2.5, 9); for (const lx of [-6, -2, 3, 6]) c.fillRect(x + lx, y + 3, 2.4, 6) };
    for (let y = 16; y < 128; y += 32) for (let x = 12; x < 128; x += 34) ele(x + (y / 32 % 2) * 14, y) }),
  hawaii: () => fab('haw', c => { c.fillStyle = '#2a7ac8'; c.fillRect(0, 0, 128, 128); const r = AV.rng(8); for (let i = 0; i < 16; i++) { const x = r() * 128, y = r() * 128; c.fillStyle = i % 2 ? '#ffffff' : '#ffd84a'; for (let p = 0; p < 5; p++) { const a = p / 5 * TAU; c.beginPath(); c.ellipse(x + Math.cos(a) * 5, y + Math.sin(a) * 5, 5, 3, a, 0, TAU); c.fill() } c.fillStyle = '#e8603a'; c.beginPath(); c.arc(x, y, 2, 0, TAU); c.fill() } c.strokeStyle = '#2a9a5a'; c.lineWidth = 3; for (let i = 0; i < 8; i++) { const x = r() * 128, y = r() * 128; c.beginPath(); c.ellipse(x, y, 10, 3, r() * 3, 0, TAU); c.stroke() } }),
  tank: () => fab('tank', c => { c.fillStyle = '#c83a3a'; c.fillRect(0, 0, 128, 128); c.fillStyle = 'rgba(255,255,255,.15)'; for (let y = 0; y < 128; y += 8) c.fillRect(0, y, 128, 2) }),
  reggae: () => fab('reg', c => { ['#2a9a4a', '#ffd23a', '#e8303a'].forEach((col, i) => { c.fillStyle = col; c.fillRect(0, i * 43, 128, 43) }); c.fillStyle = '#1a1a1a'; c.font = 'bold 14px Georgia'; c.textAlign = 'center'; c.fillText('ONE LOVE', 64, 70) }),
  tieDye: () => fab('tie', c => {
    c.fillStyle = '#f0e8d0'; c.fillRect(0, 0, 128, 128); const r = AV.rng(12), cols = ['#ff4ad2', '#ffd84a', '#4ac8ff', '#7aff8a', '#ff8a3a', '#9a5cff'];
    for (let i = 0; i < 5; i++) { const cx = 12 + r() * 104, cy = 12 + r() * 104; for (let k = 0; k < 7; k++) { c.strokeStyle = cols[(i + k) % cols.length]; c.lineWidth = 5.4 - k * .5; c.beginPath(); c.arc(cx, cy, 4 + k * 7, 0, TAU); c.stroke() } }
    for (let i = 0; i < 70; i++) { c.fillStyle = cols[i % cols.length]; c.globalAlpha = .35; c.beginPath(); c.arc(r() * 128, r() * 128, 1.5 + r() * 2.5, 0, TAU); c.fill() } c.globalAlpha = 1;
  })
};
const mat = (k, rough) => { const m = new THREE.MeshStandardMaterial({ map: T[k](), roughness: rough || .85 }); return m };

/* ======================= HEAD: sculpted skull + face (signed distance field sampled along rays) =======================
   Units: k (= userData.k). Origin = head pivot (brow level, mid-depth); +z forward, +y up; ~.49k wide, ~.82k chin to crown.
   The mesh is a polar grid around the mid-face (tilted TILT below +z). UVs come from the same directions: azimuthal
   equidistant out to A0 (the face gets most of the texture), then squeezed towards the back of the head (the rim of the
   disc). Sculpt, hair / beard shells and the painted face therefore share one mapping. */
const clamp = (x, a, b) => x < a ? a : x > b ? b : x, lerp = (a, b, t) => a + (b - a) * t;
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t) };
const smin = (a, b, k) => { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * .25 };
const smax = (a, b, k) => -smin(-a, -b, k);
const TILT = Math.atan2(.12, .3), cT = Math.cos(TILT), sT = Math.sin(TILT), DEG = 180 / Math.PI;
const A0 = .96, NP = 7, C1 = NP / (Math.PI - A0 + NP * A0), R0 = C1 * A0;
const rhoOf = a => a <= A0 ? C1 * a : R0 + (1 - R0) * (1 - Math.pow(1 - (a - A0) / (Math.PI - A0), NP));
const alOf = r => r <= R0 ? r / C1 : A0 + (Math.PI - A0) * (1 - Math.pow(1 - clamp((r - R0) / (1 - R0), 0, 1), 1 / NP));
function polarDir(al, be, o) { const sa = Math.sin(al), ly = sa * Math.sin(be), lz = Math.cos(al); o[0] = sa * Math.cos(be); o[1] = ly * cT - lz * sT; o[2] = ly * sT + lz * cT; return o }
function uvOf(x, y, z) { const l = Math.hypot(x, y, z) || 1, dy = y / l, dz = z / l, ly = dy * cT + dz * sT, lz = -dy * sT + dz * cT, be = Math.atan2(ly, x / l), r = rhoOf(Math.acos(clamp(lz, -1, 1))) * .5; return [.5 + r * Math.cos(be), .5 + r * Math.sin(be)] }
function dirOfUV(u, v, o) { const rx = u * 2 - 1, ry = v * 2 - 1; return polarDir(alOf(Math.min(1, Math.hypot(rx, ry))), Math.atan2(ry, rx), o) }
function sdE(x, y, z, rx, ry, rz) { const a = x / rx, b = y / ry, c = z / rz, k0 = Math.sqrt(a * a + b * b + c * c), k1 = Math.sqrt(a * a / (rx * rx) + b * b / (ry * ry) + c * c / (rz * rz)); return k1 < 1e-9 ? -Math.min(rx, ry, rz) : k0 * (k0 - 1) / k1 }
function sdCap(x, y, z, ax, ay, az, bx, by, bz, r1, r2) { const px = x - ax, py = y - ay, pz = z - az, ex = bx - ax, ey = by - ay, ez = bz - az, t = clamp((px * ex + py * ey + pz * ez) / (ex * ex + ey * ey + ez * ez), 0, 1); return Math.hypot(px - ex * t, py - ey * t, pz - ez * t) - (r1 + (r2 - r1) * t) }
/* face shape: multipliers around an average adult; fem pulls in the female averages, canon = no individual jitter (crowd) */
function faceShape(r, fem, canon) {
  const f = fem ? 1 : 0, v = a => canon ? 0 : (r() * 2 - 1) * a;
  return { fem: f, cw: 1 + v(.04) - .03 * f, fw: 1 + v(.05) - .04 * f, cheek: 1 + v(.2) + .05 * f, jaw: 1 + v(.09) - .1 * f, jl: 1 + v(.05) - .04 * f, chin: 1 + v(.15) - .12 * f,
    brow: (f ? .2 : .75) + v(.25), es: 1 + v(.035), nl: 1 + v(.1) - .06 * f, nw: 1 + v(.14) - .1 * f, np: 1 + v(.05) - .03 * f, nt: 1 + v(.15), mw: 1 + v(.08) - .03 * f,
    lu: 1 + v(.2) + .12 * f, ll: 1 + v(.2) + .12 * f, fat: Math.max(0, .3 + v(.4)), gon: f ? .55 : 1 + v(.3) };
}
function headSDF(x, y, z, S) {
  const ax = Math.abs(x), es = .098 * S.es;
  let d = sdE(x, y - .035, z + .03, .245 * S.cw, .29, .305);                                           // cranium
  d = smin(d, sdE(x, y - .07, z - .07, .2 * S.cw, .2, .2), .05);                                        // forehead
  d = smin(d, sdE(x, y + .15, z - .1, .195 * S.fw, .16, .21), .06);                                     // mid-face
  d = smin(d, sdE(ax - .158 * S.fw, y + .085, z - .16, .07, .042 * S.cheek, .075 * S.cheek), .06);     // cheekbones
  d = smin(d, sdE(x, y + .31 * S.jl, z - .08, .158 * S.jaw, .13 * S.jl, .19), .07);                    // jaw
  d = smin(d, sdE(ax - .128 * S.jaw, y + .33 * S.jl, z, .048, .07, .085), .05 / S.gon);                 // jaw angles
  d = smin(d, sdE(x, y + .3, z - .2, .09 * S.mw, .08, .1), .05);                                        // round the mouth
  d = smin(d, sdE(x, y + .43 * S.jl, z - .2, .072 * S.chin, .062, .085), .05);                         // chin
  d = smin(d, sdE(ax - .12, y + .2, z - .17, .07, .065, .07 + .02 * S.fat), .05);                       // cheek fat
  d = smin(d, sdE(x, y + .005, z - .22, .19, .045, .07 + .015 * S.brow), .04);                          // brow ridge
  d = smax(d, -sdE(ax - .255, y - .02, z - .13, .03, .06, .06), .03);                                   // temples
  d = smax(d, -sdE(ax - es, y + .062, z - .29, .056, .042, .06), .03);                                  // eye sockets
  d = smin(d, Math.hypot(ax - es, y + .064, z - .235) - .04, .012);                                     // eyeballs
  d = smin(d, sdCap(x, y, z, 0, -.05, .27, 0, -.195 * S.nl, .345 * S.np, .015 * S.nw, .026 * S.nw), .02);   // nose bridge
  d = smin(d, Math.hypot(x, y + .2 * S.nl, z - .345 * S.np) - .031 * S.nt, .025);                      // nose tip
  d = smin(d, sdE(ax - .033 * S.nw, y + .222 * S.nl, z - .315 * S.np, .024 * S.nw, .022, .026), .015);   // nostril wings
  d = smin(d, sdE(x, y + .292, z - .285, .066 * S.mw, .028, .038 * S.lu), .028);                       // upper lip
  d = smin(d, sdE(x, y + .336, z - .275, .06 * S.mw, .028, .043 * S.ll), .02);                        // lower lip
  return smax(d, -sdE(x, y + .313, z - .335, .062 * S.mw, .0045, .03), .008);                         // mouth line
}
/* surface landmarks (k, +x side) for the face painter */
function landmarks(S) {
  const es = .098 * S.es;
  return { eye: [es, -.064, .275], brow: [es + .006, -.02, .293], tip: [0, -.2 * S.nl, .374 * S.np], sub: [0, -.24 * S.nl, .3], ala: [.042 * S.nw, -.226 * S.nl, .318 * S.np],
    mouth: [0, -.313, .333], lipTop: [0, -.278, .329], lipBot: [0, -.352, .312], corner: [.064 * S.mw, -.313, .3], cheek: [.122, -.15, .262], forehead: [0, .1, .262] };
}
/* outermost surface along a ray from the head centre (sphere tracing inwards + bisection) */
function rayR(f, dx, dy, dz) {
  let t = .64, pr = t;
  for (let i = 0; i < 90; i++) { const v = f(dx * t, dy * t, dz * t); if (v < 1e-4) break; pr = t; t -= Math.max(v * .85, 2e-4); if (t < .03) return .03 }
  let a = t, b = pr; for (let i = 0; i < 6; i++) { const m = (a + b) * .5; if (f(dx * m, dy * m, dz * m) > 0) b = m; else a = m }
  return (a + b) * .5;
}
function sdfN(f, x, y, z, o) { const e = .002; o[0] = f(x + e, y, z) - f(x - e, y, z); o[1] = f(x, y + e, z) - f(x, y - e, z); o[2] = f(x, y, z + e) - f(x, y, z - e); const l = Math.hypot(o[0], o[1], o[2]) || 1; o[0] /= l; o[1] /= l; o[2] /= l; return o }
const HRES = [[22, 24, 1.3], [30, 36, 1.25], [44, 56, 1.2]];   // polar rings, segments, ring spacing power: crowd / low / high
function headSamples(S, lvl) {
  const [N, M, gm] = HRES[lvl], f = (x, y, z) => headSDF(x, y, z, S), nV = 1 + N * M, R = new Float32Array(nV), D = new Float32Array(nV * 3), NR = new Float32Array(nV * 3), UV = new Float32Array(nV * 2), d = [0, 0, 0], n = [0, 0, 0];
  for (let i = 0; i <= N; i++) {
    const al = Math.PI * Math.pow(i / N, gm), rr = rhoOf(al) * .5;
    for (let j = 0, nj = i ? M : 1; j < nj; j++) {
      const v = i ? 1 + (i - 1) * M + j : 0, be = j / M * TAU; polarDir(al, be, d); const r = rayR(f, d[0], d[1], d[2]); sdfN(f, d[0] * r, d[1] * r, d[2] * r, n);
      R[v] = r; D.set(d, v * 3); NR.set(n, v * 3); UV[v * 2] = .5 + rr * Math.cos(be); UV[v * 2 + 1] = .5 + rr * Math.sin(be);
    }
  }
  return { N, M, R, D, NR, UV, S, f };
}
const HCACHE = {}, MCACHE = {};
const headData = (S, lvl, key) => HCACHE[key] || (HCACHE[key] = headSamples(S, lvl));
/* crowd head-shape blend targets (radial deltas): nose, jaw, cheeks, chin; weights come per instance (iShape) */
const MORPH = [{ nl: .22, np: .05, nw: .2, nt: .3 }, { jaw: .14, gon: .35 }, { fat: .6, cheek: .2, fw: .05 }, { jl: .07, chin: .25 }];
function headMorph(S, lvl, key) {
  if (MCACHE[key]) return MCACHE[key]; const H0 = headData(S, lvl, key), nV = H0.R.length, out = new Float32Array(nV * 4);
  MORPH.forEach((mp, c) => { const S1 = Object.assign({}, S); for (const q in mp) S1[q] += mp[q]; const H1 = headSamples(S1, lvl); for (let v = 0; v < nV; v++) out[v * 4 + c] = H1.R[v] - H0.R[v] });
  return MCACHE[key] = out;
}
/* one geometry from the polar grid: layer null = skin surface, else a shell { mask(d) 0..1, thick(d, m) } that sinks under the
   skin where the mask is 0 (so hairlines / beard edges blend in). Every layer keeps the face UVs. */
function gridGeo(H, layers, morph) {
  const { N, M, R, D, NR, UV } = H, nV = R.length, nL = layers.length, P = new Float32Array(nV * nL * 3), Nn = new Float32Array(nV * nL * 3), U = new Float32Array(nV * nL * 2), Mo = morph ? new Float32Array(nV * nL * 4) : null, idx = [];
  const vi = (i, j) => i ? 1 + (i - 1) * M + (j % M) : 0;
  layers.forEach((ly, l) => {
    const o = l * nV, keep = new Uint8Array(nV);
    for (let v = 0; v < nV; v++) {
      const dx = D[v * 3], dy = D[v * 3 + 1], dz = D[v * 3 + 2]; let r = R[v];
      if (!ly) keep[v] = 1; else { const m = ly.mask(dx, dy, dz); if (m > .002) { keep[v] = 1; r += ly.thick(dx, dy, dz, m) } else r -= .006 }
      P[(o + v) * 3] = dx * r; P[(o + v) * 3 + 1] = dy * r; P[(o + v) * 3 + 2] = dz * r;
      Nn.set(NR.subarray(v * 3, v * 3 + 3), (o + v) * 3); U.set(UV.subarray(v * 2, v * 2 + 2), (o + v) * 2); if (Mo) Mo.set(morph.subarray(v * 4, v * 4 + 4), (o + v) * 4);
    }
    const tri = (a, b, c) => { if (keep[a] || keep[b] || keep[c]) idx.push(o + a, o + b, o + c) };
    for (let j = 0; j < M; j++) tri(0, vi(1, j), vi(1, j + 1));
    for (let i = 1; i < N; i++) for (let j = 0; j < M; j++) { tri(vi(i, j), vi(i + 1, j), vi(i + 1, j + 1)); tri(vi(i, j), vi(i + 1, j + 1), vi(i, j + 1)) }
  });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.BufferAttribute(Nn, 3)); g.setAttribute('uv', new THREE.BufferAttribute(U, 2));
  if (Mo) g.setAttribute('aMorph', new THREE.BufferAttribute(Mo, 4));
  g.setIndex(idx); g.computeBoundingSphere(); return g;
}
/* ---- hairline, beard and cap regions (directions; shared by the shells and the face painter) ---- */
const azEl = (dx, dy, dz) => [Math.atan2(dx, dz) * DEG, Math.asin(clamp(dy, -1, 1)) * DEG];
const plin = (T, x) => { if (x <= T[0][0]) return T[0][1]; for (let i = 1; i < T.length; i++) if (x <= T[i][0]) { const a = T[i - 1], b = T[i]; return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]) } return T[T.length - 1][1] };
/* hair edge elevation (deg) by |azimuth| (0 forehead .. 180 nape). o: { fem, recede 0..1, low (deg, + = more hair), peak, ph } */
function hairline(o) {
  const r = o.recede || 0, lo = o.low || 0;
  const T = o.fem ? [[0, 31], [30, 27], [62, 12], [80, 2], [96, 0], [125, -22], [180, -52]] : [[0, 35 + 7 * r], [30, 31 + 12 * r], [62, 14 + 3 * r], [80, -7], [92, 5], [120, -12], [180, -44]];
  return { T: T.map(p => [p[0], p[1] - lo]), peak: o.peak || 0, ph: o.ph || 0, soft: o.soft || 2 };
}
function hairMask(H, dx, dy, dz) {
  if (!H) return 0; const [az, el] = azEl(dx, dy, dz), a = Math.abs(az);
  const E = plin(H.T, a) - H.peak * 5 * sstep(12, 0, a) + Math.sin(az * .21 + H.ph) * .9 + Math.sin(az * .55 + H.ph * 2.1) * .5;
  return sstep(E - H.soft, E + H.soft, el);
}
/* beard region from the mouth landmarks. type: 'full' | 'goatee' | 'mustache' | 'stubble' */
function beardDef(S, type) {
  const L = landmarks(S), el = p => Math.atan2(p[1], Math.hypot(p[0], p[2])) * DEG;
  return { type, sub: el(L.sub), top: el(L.lipTop), bot: el(L.lipBot), cAz: Math.atan2(L.corner[0], L.corner[2]) * DEG + 1.5, cEl: el(L.corner) };
}
function beardMask(B, dx, dy, dz) {
  if (!B || dy > .25) return 0; const [az, el] = azEl(dx, dy, dz), a = Math.abs(az), s = 1.6;
  const top = plin([[0, B.bot - 1], [B.cAz, B.cEl + 1], [30, -32], [55, -19], [80, -6], [92, -5], [104, -14], [114, -40]], a);
  let jaw = sstep(top + s, top - s, el) * sstep(118, 110, a);
  const mus = sstep(B.cAz + 3, B.cAz, a) * sstep(B.top - 1.6, B.top - .8, el) * sstep(B.sub + .3, B.sub - .5, el);
  const lips = sstep(B.cAz + 1.5, B.cAz - 1.5, a) * sstep(B.bot - 1, B.bot + .5, el) * sstep(B.top - .7, B.top - 1.5, el);
  if (B.type === 'goatee') jaw *= sstep(B.cAz + 9, B.cAz + 3, a);
  if (B.type === 'mustache') jaw = 0;
  return Math.max(0, Math.max(jaw, mus) - lips);
}
function capMask(dx, dy, dz) { const [az, el] = azEl(dx, dy, dz), E = plin([[0, 22], [40, 17], [80, 7], [110, 3], [180, -4]], Math.abs(az)); return sstep(E - 1.2, E + 1.2, el) }
const wob3 = (x, y, z, f, p) => Math.sin(x * f + p) * Math.sin(y * f * 1.13 + p * 1.7) * Math.sin(z * f * .87 + p * 2.3);
/* hair shell thickness (k) per style; m = hair mask */
const HAIRT = {
  short: (x, y, z, m) => m * .016 * (1 + .5 * Math.max(0, y) + .3 * Math.max(0, -z)),
  messy: (x, y, z, m) => m * (.03 + .02 * wob3(x, y, z, 9, 1.3) + .012 * wob3(x, y, z, 17, 4.1)) * (1 + .4 * Math.max(0, y)),
  bun: (x, y, z, m) => m * .012, long: (x, y, z, m) => m * (.02 + .014 * Math.max(0, -z)), cap: (x, y, z, m) => m * .012
};
HAIRT.blond = HAIRT.messy;

/* ======================= FACE PAINTER =======================
   Paints a face in the head's UV layout. Hero: one canvas in real colours (the head's map). Crowd atlas ("coded"): RGB is
   relative to the per-instance tint (white = iSkin, grey = iHair) and a mask canvas says what each texel is (white skin,
   mid-grey hair, black fixed colour: eyes, lashes, lipstick). Features are drawn in local frames (units k) through uvOf(). */
const rgbOf = h => [h >> 16 & 255, h >> 8 & 255, h & 255];
const lin3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const css = (c, a) => 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + (a == null ? 1 : a) + ')';
const CLS = { skin: 255, hair: 128, abs: 0 };
const hash2 = (x, y, s) => { let h = (x * 374761393 + y * 668265263 + s * 1442695041) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296 };
const nrm = p => { const l = Math.hypot(p[0], p[1], p[2]); return [p[0] / l, p[1] / l, p[2] / l] };
const ang2 = (d, c) => 2 * (1 - (d[0] * c[0] + d[1] * c[1] + d[2] * c[2]));
function painter(g, m, X, Y, S, coded, skinHex, hairHex) {
  const sk = coded ? null : rgbOf(skinHex), hr = coded ? null : rgbOf(hairHex);
  return { g, m, X, Y, S, coded, px: S / 256,
    sk: M => coded ? M : [sk[0] * M[0] / 255, sk[1] * M[1] / 255, sk[2] * M[2] / 255],
    hr: M => coded ? [M[0] * .989, M[1] * .989, M[2] * .989] : [Math.min(255, hr[0] * M[0] / 232), Math.min(255, hr[1] * M[1] / 232), Math.min(255, hr[2] * M[2] / 232)] };
}
/* local frame at head point (x, y, z): +x sideways (mirrored by sx), +y up, units k -> canvas pixels */
function frame(P, x, y, z, sx) {
  const e = .008, o = uvOf(x, y, z), a = uvOf(x + e * sx, y, z), b = uvOf(x, y + e, z), S = P.S;
  const t = [(a[0] - o[0]) / e * S, -(a[1] - o[1]) / e * S, (b[0] - o[0]) / e * S, -(b[1] - o[1]) / e * S, P.X + o[0] * S, P.Y + (1 - o[1]) * S];
  P.g.setTransform(t[0], t[1], t[2], t[3], t[4], t[5]); if (P.m) P.m.setTransform(t[0], t[1], t[2], t[3], t[4], t[5]);
}
const unframe = P => { P.g.setTransform(1, 0, 0, 1, 0, 0); if (P.m) P.m.setTransform(1, 0, 0, 1, 0, 0) };
/* cls: what the stroke turns the texel into on the mask (null = colour shading only) */
function fillOp(P, path, col, a, cls) {
  P.g.fillStyle = css(col, a); P.g.beginPath(); path(P.g); P.g.fill();
  if (P.m && cls) { const v = CLS[cls]; P.m.fillStyle = css([v, v, v], cls === 'abs' ? 1 : a); P.m.beginPath(); path(P.m); P.m.fill() }
}
function lineOp(P, path, col, a, w, cls) {
  const one = (g, c, al) => { g.strokeStyle = css(c, al); g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); path(g); g.stroke() };
  one(P.g, col, a); if (P.m && cls) { const v = CLS[cls]; one(P.m, [v, v, v], cls === 'abs' ? 1 : a) }
}
function blob(g, x, y, rx, ry, col, a) { g.save(); g.translate(x, y); g.scale(rx, ry); const gr = g.createRadialGradient(0, 0, 0, 0, 0, 1); gr.addColorStop(0, css(col, a)); gr.addColorStop(1, css(col, 0)); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 1, 0, TAU); g.fill(); g.restore() }
/* almond eye opening in the eye frame (+x = towards the ear) */
function eyeShape(F) {
  const EW = .047, Uo = .0165 * F.eyeOpen, Lo = .011 * F.eyeOpen, IC = [-EW, -.002], OC = [EW, .002 + F.eyeTilt], U1 = [-EW * .55, Uo * 1.3], U2 = [EW * .35, Uo * 1.32];
  const lowC = g => g.bezierCurveTo(EW * .45, -Lo * 1.15, -EW * .45, -Lo * 1.2, IC[0], IC[1]);
  return { EW, Uo, Lo, IC, OC, U1, U2,
    upper: g => { g.moveTo(IC[0], IC[1]); g.bezierCurveTo(U1[0], U1[1], U2[0], U2[1], OC[0], OC[1]) },
    open: g => { g.moveTo(IC[0], IC[1]); g.bezierCurveTo(U1[0], U1[1], U2[0], U2[1], OC[0], OC[1]); lowC(g); g.closePath() },
    lower: g => { g.moveTo(OC[0], OC[1]); lowC(g) },
    at: t => { const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t; return [a * IC[0] + b * U1[0] + c * U2[0] + d * OC[0], a * IC[1] + b * U1[1] + c * U2[1] + d * OC[1]] } };
}
/* texel pass over a cell: skin tone + mottling, cheek / nose flush, jaw shadow, stubble base, scalp hair (n x n, upscaled) */
function basePass(P, F, CX, CY, CS, n) {
  const cv = document.createElement('canvas'); cv.width = cv.height = n; const cg = cv.getContext('2d'), im = cg.createImageData(n, n), Dt = im.data, mk = P.m ? cg.createImageData(n, n) : null, Dm = mk && mk.data;
  const d = [0, 0, 0], L = F.L, chk = [nrm(L.cheek), nrm([-L.cheek[0], L.cheek[1], L.cheek[2]])], tip = nrm(L.tip), base = P.sk([255, 255, 255]), hb = P.hr([232, 232, 232]), bb = P.hr([150, 145, 140]), bden = F.beard ? F.beardBase : 0;
  for (let py = 0; py < n; py++) for (let px = 0; px < n; px++) {
    const u = (CX + (px + .5) / n * CS - P.X) / P.S, v = 1 - (CY + (py + .5) / n * CS - P.Y) / P.S; dirOfUV(u, v, d);
    const n1 = wob3(d[0], d[1], d[2], 6.3, F.ph) * .6 + wob3(d[0], d[1], d[2], 14, F.ph * 1.7) * .4, mo = 1 + .02 * n1 + (hash2(px, py, F.seed) - .5) * .03;
    const wc = F.blush * Math.exp(-Math.min(ang2(d, chk[0]), ang2(d, chk[1])) / .028), wn = .7 * Math.exp(-ang2(d, tip) / .006), ao = sstep(.45, .8, -d[1]) * (1 - sstep(.3, .65, d[2]));
    let r = base[0] * mo * (1 - .1 * ao), g = base[1] * mo * (1 - .12 * wc - .07 * wn - .12 * ao), b = base[2] * mo * (1 - .16 * wc - .09 * wn - .1 * ao), k = 1;
    if (bden) { const w = beardMask(F.beard, d[0], d[1], d[2]) * bden; if (w > 0) { r = lerp(r, bb[0], w); g = lerp(g, bb[1], w); b = lerp(b, bb[2], w); k = lerp(k, .5, w) } }
    const hm = hairMask(F.hl, d[0], d[1], d[2]);
    if (hm > 0) { const be = Math.atan2(v - .5, u - .5), st = .86 + .1 * Math.sin(be * 160 + 4 * Math.sin(be * 23 + F.ph)) + .06 * Math.sin(be * 61 + F.ph * 3); r = lerp(r, hb[0] * st, hm); g = lerp(g, hb[1] * st, hm); b = lerp(b, hb[2] * st, hm); k = lerp(k, .5, hm) }
    const i = (py * n + px) * 4; Dt[i] = r; Dt[i + 1] = g; Dt[i + 2] = b; Dt[i + 3] = 255;
    if (Dm) { Dm[i] = Dm[i + 1] = Dm[i + 2] = k * 255; Dm[i + 3] = 255 }
  }
  cg.putImageData(im, 0, 0); P.g.drawImage(cv, CX, CY, CS, CS);
  if (mk) { cg.putImageData(mk, 0, 0); P.m.drawImage(cv, CX, CY, CS, CS) }
}
/* features on top of the base pass (every random number is drawn outside the path callbacks: they run once per canvas) */
function paintFace(P, F) {
  const L = F.L, S = F.S, age = F.age, r = AV.rng(F.seed * 7 + 3), E = eyeShape(F), g = P.g, SIDES = [1, -1];
  /* skin shading: sockets, under-eyes, crow's feet, cheek hollows, nose sides, alar creases, nostrils, philtrum */
  for (const sx of SIDES) {
    frame(P, sx * L.eye[0], L.eye[1], L.eye[2], sx);
    blob(g, -.004, .008, .066, .05, P.sk([162, 128, 136]), .16 + .08 * age);
    blob(g, .004, -.026, .046, .015, P.sk([175, 140, 150]), .07 + .18 * age);
    if (age > .35) for (let j = -1; j <= 1; j++) lineOp(P, q => { q.moveTo(E.EW + .006, j * .005); q.lineTo(E.EW + .024, j * .013 + .002) }, P.sk([170, 132, 125]), .22 * (age - .3), .0022, null);
    frame(P, sx * L.cheek[0], L.cheek[1], L.cheek[2], sx); blob(g, .06, -.04, .05, .07, P.sk([210, 182, 175]), .08);
  }
  frame(P, 0, -.13 * S.nl, .33 * S.np, 1);
  for (const sx of SIDES) blob(g, sx * .027 * S.nw, .012, .015, .05, P.sk([190, 156, 148]), .12);
  for (const sx of SIDES) { frame(P, sx * L.ala[0], L.ala[1], L.ala[2], sx); lineOp(P, q => q.arc(-.004, .003, .015, -.2, Math.PI * .95), P.sk([158, 112, 104]), .32, .003, null) }
  frame(P, 0, -.232 * S.nl, .33 * S.np, 1);
  blob(g, 0, -.007, .034, .011, P.sk([150, 108, 100]), .36);
  for (const sx of SIDES) fillOp(P, q => q.ellipse(sx * .015 * S.nw, .001, .0082 * S.nw, .0042, -sx * .4, 0, TAU), P.sk([78, 42, 38]), .75, null);
  /* forehead + frown lines with age */
  if (age > .25) { frame(P, L.forehead[0], L.forehead[1], L.forehead[2], 1); const nL = 1 + Math.round(age * 3); for (let i = 0; i < nL; i++) { const y = -.03 + i * .024, w = .095 - i * .008; lineOp(P, q => { q.moveTo(-w, y + .004); q.quadraticCurveTo(0, y - .006, w, y + .004) }, P.sk([172, 136, 128]), .04 + .12 * (age - .2), .0024, null) } }
  if (age > .55) { frame(P, 0, -.012, .296, 1); for (const sx of SIDES) lineOp(P, q => { q.moveTo(sx * .011, .022); q.lineTo(sx * .008, -.004) }, P.sk([165, 128, 120]), .3 * (age - .45), .0025, null) }
  /* nasolabial folds, marionette lines, mouth */
  frame(P, L.mouth[0], L.mouth[1], L.mouth[2], 1);
  const W = .064 * S.mw, Uh = .019 * S.lu, Lh = .025 * S.ll;
  for (const sx of SIDES) {
    const nl = q => { q.moveTo(sx * .05, .078); q.quadraticCurveTo(sx * .09, .045, sx * .084, -.008) };
    lineOp(P, nl, P.sk([170, 128, 120]), .03 + .08 * age, .014, null); lineOp(P, nl, P.sk([158, 116, 108]), .05 + .14 * age, .005, null);
    if (age > .5) lineOp(P, q => { q.moveTo(sx * (W + .004), -.006); q.quadraticCurveTo(sx * (W + .01), -.03, sx * (W + .008), -.055) }, P.sk([165, 125, 118]), .3 * (age - .4), .004, null);
  }
  const up = q => { q.moveTo(-W, 0); q.bezierCurveTo(-W * .7, Uh * .55, -W * .35, Uh * 1.05, -.012, Uh); q.quadraticCurveTo(0, Uh * .7, .012, Uh); q.bezierCurveTo(W * .35, Uh * 1.05, W * .7, Uh * .55, W, 0); q.quadraticCurveTo(0, -.003, -W, 0); q.closePath() };
  const lo = q => { q.moveTo(-W * .95, -.0008); q.quadraticCurveTo(0, -.003, W * .95, -.0008); q.bezierCurveTo(W * .65, -Lh * .98, -W * .65, -Lh * .98, -W * .95, -.0008); q.closePath() };
  blob(g, 0, -Lh - .008, .034, .009, P.sk([168, 126, 116]), .26);
  if (F.lipstick) { fillOp(P, up, F.lipstick, .96, 'abs'); fillOp(P, lo, lin3(F.lipstick, [255, 255, 255], .08), .96, 'abs') }
  else { fillOp(P, up, P.sk(F.fem ? [212, 136, 140] : [198, 132, 124]), .9, null); fillOp(P, lo, P.sk(F.fem ? [226, 152, 154] : [212, 148, 138]), .82, null) }
  lineOp(P, q => { q.moveTo(-W, 0); q.quadraticCurveTo(0, -.0035, W, 0) }, P.sk([88, 50, 46]), .7, .0022, null);
  for (const sx of SIDES) blob(g, sx * W, -.0005, .006, .004, P.sk([110, 66, 60]), .5);
  /* freckles, moles */
  if (F.freck) { frame(P, 0, -.12, .33, 1); const FR = []; for (let i = 0, n = 90 * F.freck; i < n; i++) { const x = (r() * 2 - 1) * .13; FR.push([x, (r() - .5) * .08 - Math.abs(x) * .15, .0018 + r() * .0022]) } fillOp(P, q => { for (const e of FR) { q.moveTo(e[0] + e[2], e[1]); q.arc(e[0], e[1], e[2], 0, TAU) } }, P.sk([170, 112, 86]), .38, null) }
  for (let i = 0; i < F.moles; i++) { const sx = r() < .5 ? 1 : -1, rad = .003 + r() * .002; frame(P, sx * (.08 + r() * .08), -.1 - r() * .2, .26, sx); fillOp(P, q => q.arc(0, 0, rad, 0, TAU), P.sk([86, 50, 38]), .75, null) }
  /* eyes */
  for (const sx of SIDES) {
    frame(P, sx * L.eye[0], L.eye[1], L.eye[2], sx);
    const crease = q => { q.moveTo(-E.EW * .85, E.Uo * 1.1); q.bezierCurveTo(-E.EW * .4, E.Uo * 2.45, E.EW * .45, E.Uo * 2.45, E.EW * 1.02, E.Uo * .95) };
    if (F.shadow) fillOp(P, q => { crease(q); q.lineTo(E.OC[0], E.OC[1]); q.bezierCurveTo(E.U2[0], E.U2[1], E.U1[0], E.U1[1], E.IC[0], E.IC[1]); q.closePath() }, P.sk(F.shadow), .45, null);
    if (F.crease) lineOp(P, crease, P.sk([150, 106, 98]), .42, .003, null); else blob(g, 0, E.Uo * 1.7, E.EW * .9, .008, P.sk([168, 128, 122]), .3);
    fillOp(P, E.open, F.redEye ? [226, 148, 138] : [238, 232, 224], 1, 'abs');
    g.save(); g.beginPath(); E.open(g); g.clip();
    blob(g, E.IC[0] + .006, 0, .014, .012, [215, 150, 148], .55); blob(g, E.OC[0] - .006, 0, .014, .012, [150, 140, 140], .35);
    if (F.redEye) for (let j = 0; j < 6; j++) { const sd = j < 3 ? -1 : 1, y0 = (j % 3 - 1) * .004, wy = (r() - .5) * .01; g.strokeStyle = 'rgba(190,24,20,.55)'; g.lineWidth = .0009; g.beginPath(); g.moveTo(sd * E.EW, y0); g.quadraticCurveTo(sd * .03, y0 + wy, sd * .019, y0 * .5); g.stroke() }
    const ic = [0, .0012], ir = .0188, I = F.iris, gr = g.createRadialGradient(ic[0], ic[1], 0, ic[0], ic[1], ir);
    gr.addColorStop(0, css(lin3(I, [255, 255, 255], .1))); gr.addColorStop(.45, css(I)); gr.addColorStop(.8, css(lin3(I, [0, 0, 0], .3))); gr.addColorStop(1, css(lin3(I, [0, 0, 0], .72)));
    g.fillStyle = gr; g.beginPath(); g.arc(ic[0], ic[1], ir, 0, TAU); g.fill();
    for (let h = 0; h < 2; h++) { g.strokeStyle = css(h ? lin3(I, [255, 255, 255], .3) : lin3(I, [0, 0, 0], .35), .35); g.lineWidth = .001; g.beginPath(); for (let j = h; j < 26; j += 2) { const a = j / 26 * TAU + r() * .2, r1 = ir * .4, r2 = ir * (.78 + r() * .15); g.moveTo(ic[0] + Math.cos(a) * r1, ic[1] + Math.sin(a) * r1); g.lineTo(ic[0] + Math.cos(a) * r2, ic[1] + Math.sin(a) * r2) } g.stroke() }
    g.fillStyle = F.redEye ? 'rgb(80,8,6)' : 'rgb(12,10,10)'; g.beginPath(); g.arc(ic[0], ic[1], .0068 * F.pupil, 0, TAU); g.fill();
    const ls = g.createLinearGradient(0, E.Uo * 1.3, 0, -E.Lo * .3); ls.addColorStop(0, 'rgba(25,12,10,.6)'); ls.addColorStop(.5, 'rgba(25,12,10,.15)'); ls.addColorStop(1, 'rgba(25,12,10,0)'); g.fillStyle = ls; g.fillRect(-E.EW * 1.3, -E.Lo * 1.6, E.EW * 2.6, E.Uo * 3);
    g.restore();
    lineOp(P, E.lower, P.sk([112, 76, 70]), .45, .0016, null);
    lineOp(P, E.upper, [26, 18, 16], .95, F.fem ? .0044 : .0032, 'abs');
    if (F.fem) for (let j = 0; j < 9; j++) { const t = .3 + j * .085, p = E.at(t), q2 = E.at(Math.min(1, t + .02)), an = Math.atan2(q2[1] - p[1], q2[0] - p[0]) + Math.PI / 2 - .35 * t, l = .006 + .003 * t; lineOp(P, q => { q.moveTo(p[0], p[1]); q.quadraticCurveTo(p[0] + Math.cos(an) * l * .6, p[1] + Math.sin(an) * l * .6, p[0] + Math.cos(an - .4) * l, p[1] + Math.sin(an - .4) * l) }, [22, 16, 14], .9, .0012, 'abs') }
    if (F.liner) fillOp(P, q => { q.moveTo(E.OC[0] - .012, E.OC[1] + .004); q.lineTo(E.OC[0] + .011, E.OC[1] + .008); q.lineTo(E.OC[0] - .002, E.OC[1] - .001); q.closePath() }, [20, 14, 14], .95, 'abs');
    fillOp(P, q => q.ellipse(E.IC[0] + .0046, E.IC[1] + .0004, .0042, .0032, 0, 0, TAU), P.sk([255, 160, 160]), .85, 'skin');
  }
  /* eyebrows: a soft base + individual hairs (inner ones point up, the rest follow the arch) */
  for (const sx of SIDES) {
    frame(P, sx * L.brow[0], L.brow[1], L.brow[2], sx);
    const bt = F.browThick, ar = F.browArch, A = [-.052, -.003], K = [.02, .006 + .007 * ar], T2 = [.066, -.005 - .005 * ar];
    const c = t => { const u = 1 - t; return [u * u * A[0] + 2 * u * t * K[0] + t * t * T2[0], u * u * A[1] + 2 * u * t * K[1] + t * t * T2[1]] }, w = t => lerp(.016, .0045, Math.pow(t, 1.2)) * bt;
    fillOp(P, q => { for (let i = 0; i <= 12; i++) { const t = i / 12, p = c(t); if (i) q.lineTo(p[0], p[1] + w(t) * .5); else q.moveTo(p[0], p[1] + w(t) * .5) } for (let i = 12; i >= 0; i--) { const t = i / 12, p = c(t); q.lineTo(p[0], p[1] - w(t) * .5) } q.closePath() }, P.hr([150, 150, 150]), .5, 'hair');
    const BH = [[], []];
    for (let i = 0; i < 46; i++) {
      const t = Math.pow(r(), .9), p = c(t), p2 = c(Math.min(1, t + .02)), tg = Math.atan2(p2[1] - p[1], p2[0] - p[0]), a = t < .18 ? lerp(1.4, .7, t / .18) : tg + .28, l = .007 + r() * .006, y = p[1] + (r() - .5) * w(t) * .8, x = p[0] - Math.cos(a) * l * .4;
      BH[i & 1].push([x, y, x + Math.cos(a) * l, y + Math.sin(a) * l]);
    }
    BH.forEach((L, t) => lineOp(P, q => { for (const e of L) { q.moveTo(e[0], e[1]); q.lineTo(e[2], e[3]) } }, P.hr([92 + t * 30, 88 + t * 30, 84 + t * 30]), .6, .0016, 'hair'));
  }
  /* scalp hair strands (UV space: radial = combed back from the face), beard strands, stubble */
  unframe(P);
  const d = [0, 0, 0], SS = P.S, px = P.px, uvC = (u, v) => [P.X + u * SS, P.Y + (1 - v) * SS];
  const strands = (n, test, dirFn, len, shade, alpha, wid) => {   /* 4 shade buckets, one path each (a few canvas calls per face) */
    const B = [[], [], [], []];
    for (let i = 0, tries = 0; i < n && tries < n * 8; tries++) {
      const u = r(), v = r(); dirOfUV(u, v, d); if (!test(d)) continue;
      const a = dirFn(u, v, d) + (r() - .5) * .5, l = len() * px, [x0, y0] = uvC(u, v);
      B[i++ % 4].push([x0, y0, x0 + Math.cos(a) * l * .5 + (r() - .5) * px, y0 + Math.sin(a) * l * .5, x0 + Math.cos(a + .15) * l, y0 + Math.sin(a + .15) * l]);
    }
    B.forEach((L, t) => { if (L.length) lineOp(P, q => { for (const e of L) { q.moveTo(e[0], e[1]); q.quadraticCurveTo(e[2], e[3], e[4], e[5]) } }, P.hr([shade(t), shade(t) * .98, shade(t) * .96]), alpha(t), wid * px, 'hair') });
  };
  if (F.hl) strands(P.coded ? 420 : Math.round(1500 * SS / 512), q => hairMask(F.hl, q[0], q[1], q[2]) > .6, (u, v) => Math.atan2(-(v - .5), u - .5), () => 3 + r() * 7, t => 150 + t * 30, t => .3 + t * .05, 1);
  if (F.beard) {
    const down = (u, v, q) => { const a = uvOf(q[0], q[1], q[2]), b = uvOf(q[0], q[1] - .05, q[2] + .01); return Math.atan2(-(b[1] - a[1]), b[0] - a[0]) };
    if (F.beard.type !== 'stubble') strands(P.coded ? 220 : Math.round(900 * SS / 512), q => beardMask(F.beard, q[0], q[1], q[2]) > .5, down, () => 2 + r() * 3.5, t => 110 + t * 32, () => .5, .95);
    strands(P.coded ? 500 : Math.round(1800 * SS / 512), q => beardMask(F.beard, q[0], q[1], q[2]) > .3, down, () => 1.2, t => 80 + t * 14, () => .16, .55);
  }
  /* catchlights (same side on both eyes) */
  for (const sx of SIDES) { frame(P, sx * L.eye[0], L.eye[1], L.eye[2], sx); fillOp(P, q => q.arc(-.0055 * sx, .0075, .0026, 0, TAU), [255, 255, 255], .85, 'abs') }
  unframe(P);
}
const IRIS = [[62, 38, 22], [84, 52, 30], [46, 30, 20], [110, 82, 44], [86, 108, 64], [66, 104, 146], [104, 122, 136], [72, 46, 26]];
/* painting parameters for one face. o: { hl, beard (type), redEye, iris [rgb], age, lipstick, liner, shadow, freck } */
function faceLook(seed, S, o) {
  const r = AV.rng(seed * 977 + 13), fem = S.fem, pk = a => a[Math.floor(r() * a.length) % a.length], bt = o.beard || null;
  return { seed: seed | 0, ph: r() * 6, S, L: landmarks(S), fem, hl: o.hl, redEye: !!o.redEye,
    age: o.age != null ? o.age : Math.pow(r(), 1.4) * .8, blush: fem ? .45 + r() * .45 : .2 + r() * .35,
    iris: o.redEye ? [235, 45, 20] : o.iris || (o.dark ? pk([IRIS[0], IRIS[1], IRIS[2], IRIS[7]]) : pk(IRIS)), eyeOpen: .88 + r() * .24, eyeTilt: (r() - .35) * .008, crease: r() < .78, pupil: .85 + r() * .3,
    browThick: fem ? .62 + r() * .25 : .9 + r() * .35, browArch: fem ? .9 + r() * .7 : .2 + r() * .5,
    lipstick: o.lipstick !== undefined ? o.lipstick : fem && r() < .38 ? pk([[168, 34, 52], [196, 82, 100], [140, 40, 72], [184, 72, 66]]) : null,
    liner: o.liner != null ? o.liner : fem && r() < .45, shadow: o.shadow !== undefined ? o.shadow : fem && r() < .3 ? pk([[200, 170, 205], [190, 160, 140], [170, 150, 190]]) : null,
    freck: o.freck != null ? o.freck : r() < .15 ? .4 + r() * .6 : 0, moles: r() < .5 ? 0 : r() < .7 ? 1 : 2,
    beard: bt ? beardDef(S, bt) : null, beardBase: { full: .82, goatee: .8, mustache: .8, stubble: .32 }[bt] || 0 };
}
/* hero face texture (real colours) + an emissive map for glowing red eyes */
function heroFace(F, size, skinHex, hairHex) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const P = painter(cv.getContext('2d'), null, 0, 0, size, false, skinHex, hairHex);
  basePass(P, F, 0, 0, size, Math.min(size, 256)); paintFace(P, F);
  const map = new THREE.CanvasTexture(cv); map.encoding = THREE.sRGBEncoding; map.anisotropy = 4; map.wrapS = map.wrapT = THREE.ClampToEdgeWrapping;
  let glow = null;
  if (F.redEye) {
    const gv = document.createElement('canvas'); gv.width = gv.height = size; const gg = gv.getContext('2d'), Q = { g: gg, m: null, X: 0, Y: 0, S: size }, E = eyeShape(F);
    gg.fillStyle = '#000'; gg.fillRect(0, 0, size, size);
    for (const sx of [1, -1]) { gg.save(); frame(Q, sx * F.L.eye[0], F.L.eye[1], F.L.eye[2], sx); gg.beginPath(); E.open(gg); gg.clip(); gg.setTransform(1, 0, 0, 1, 0, 0); gg.drawImage(cv, 0, 0); gg.restore() }
    glow = new THREE.CanvasTexture(gv); glow.encoding = THREE.sRGBEncoding;
  }
  return { map, glow };
}
/* shared skin detail for hero heads: G = roughness (wet eyes, glossy lips, oily T-zone) */
let DETAIL = null;
function detailTex() {
  if (DETAIL) return DETAIL;
  const n = 256, cv = document.createElement('canvas'); cv.width = cv.height = n; const g = cv.getContext('2d'), im = g.createImageData(n, n), D = im.data, L = landmarks(faceShape(null, 0, true)), d = [0, 0, 0];
  const ae = p => azEl(...nrm(p)), eye = ae(L.eye), mouth = ae(L.mouth), tz = nrm([0, -.05, .3]);
  for (let py = 0; py < n; py++) for (let px = 0; px < n; px++) {
    dirOfUV((px + .5) / n, 1 - (py + .5) / n, d); const [az, el] = azEl(d[0], d[1], d[2]), a = Math.abs(az);
    const we = sstep(1.15, .75, ((a - eye[0]) / 6.5) ** 2 + ((el - eye[1]) / 2.4) ** 2), wl = sstep(1.2, .8, (a / 12) ** 2 + ((el - mouth[1] + .8) / 4.2) ** 2);
    const rough = lerp(lerp(.74 - .06 * Math.exp(-ang2(d, tz) / .02), .5, wl), .16, we), i = (py * n + px) * 4;
    D[i] = 128 + (hash2(px, py, 77) - .5) * 40 * (1 - we); D[i + 1] = rough * 255; D[i + 2] = 0; D[i + 3] = 255;
  }
  g.putImageData(im, 0, 0); DETAIL = new THREE.CanvasTexture(cv); DETAIL.userData = { keep: true }; return DETAIL;
}
/* crowd face atlas: 4 x 4 coded faces (0-7 men, 8-15 women) on the canonical head shapes; built once, kept for the session */
const ATLAS_N = 4, ATLAS_PAD = .035;
const ATLAS_SPEC = [{ age: .12 }, { age: .3, beard: 'stubble' }, { age: .45 }, { age: .62, beard: 'mustache' }, { age: .25, beard: 'goatee' }, { age: .78, beard: 'stubble' }, { age: .4, beard: 'full' }, { age: .2, freck: .7 },
  { age: .12, lipstick: null }, { age: .25, lipstick: [168, 34, 52] }, { age: .42, lipstick: null }, { age: .58, lipstick: [196, 82, 100] }, { age: .2, liner: true, lipstick: null }, { age: .72, lipstick: null }, { age: .3, shadow: [190, 160, 140], lipstick: [140, 40, 72] }, { age: .15, freck: .8, lipstick: null }];
let ATL = null;
C.faceAtlas = function () {
  if (ATL) return ATL;
  const N = ATLAS_N, cs = 256, W = N * cs, cv = document.createElement('canvas'), mv = document.createElement('canvas'); cv.width = cv.height = mv.width = mv.height = W;
  const g = cv.getContext('2d'), m = mv.getContext('2d'); m.fillStyle = '#fff'; m.fillRect(0, 0, W, W);
  for (let i = 0; i < N * N; i++) {
    const fem = i >= 8 ? 1 : 0, S = faceShape(null, fem, true), r = AV.rng(9001 + i * 131), CX = (i % N) * cs, CY = (i / N | 0) * cs, pad = ATLAS_PAD * cs;
    const F = faceLook(9001 + i * 131, S, Object.assign({ hl: hairline({ fem, low: 1 + r() * 2, ph: r() * 6 }), iris: IRIS[(i * 5 + (fem ? 3 : 0)) % IRIS.length] }, ATLAS_SPEC[i]));
    const P = painter(g, m, CX + pad, CY + pad, cs - 2 * pad, true);
    for (const q of [g, m]) { q.save(); q.beginPath(); q.rect(CX, CY, cs, cs); q.clip() }
    basePass(P, F, CX, CY, cs, 128); paintFace(P, F);
    g.restore(); m.restore();
  }
  const a = g.getImageData(0, 0, W, W).data, b = m.getImageData(0, 0, W, W).data, out = new Uint8Array(W * W * 4);
  for (let y = 0; y < W; y++) { const sy = (W - 1 - y) * W; for (let x = 0; x < W; x++) { const o = (y * W + x) * 4, s = (sy + x) * 4; out[o] = a[s]; out[o + 1] = a[s + 1]; out[o + 2] = a[s + 2]; out[o + 3] = b[s] } }
  const t = new THREE.DataTexture(out, W, W, THREE.RGBAFormat); t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.anisotropy = 4; t.needsUpdate = true; t.userData = { keep: true };
  return ATL = { tex: t, N, pad: ATLAS_PAD };
};

/* ======================= BODY: anatomical torso + limbs (shared geometry per detail level) =======================
   Heights in s (feet at 0, crown ~2.32s): hip joints 1.165, waist 1.36, chest 1.62, shoulders 1.84, neck 1.91, head pivot 2.16.
   Torso rows: [y, half width, front depth, back depth] (male / female); bust, pecs, belly and glutes are added as bumps. */
const TOR = {
  m: [[1.06, .05, .04, .05], [1.1, .16, .1, .12], [1.17, .19, .11, .145], [1.26, .18, .115, .13], [1.36, .168, .118, .113], [1.46, .175, .124, .114], [1.56, .19, .134, .12], [1.64, .2, .143, .125], [1.72, .203, .138, .124], [1.8, .188, .118, .118], [1.86, .148, .085, .094], [1.915, .08, .062, .066], [1.94, .02, .02, .02]],
  f: [[1.06, .05, .04, .05], [1.1, .165, .1, .13], [1.17, .2, .11, .16], [1.26, .188, .108, .14], [1.36, .152, .102, .103], [1.46, .158, .108, .103], [1.54, .168, .12, .108], [1.6, .174, .128, .11], [1.66, .178, .125, .113], [1.72, .182, .118, .113], [1.8, .168, .1, .108], [1.86, .132, .074, .084], [1.915, .074, .058, .062], [1.94, .02, .02, .02]]
};
/* limb profiles [radius, y] bottom -> top, unit length hanging from 0 to -1 (lathed) */
const LP = {
  uarm: [[0, -1.02], [.74, -1], [.8, -.9], [.9, -.7], [.99, -.45], [1, -.25], [.94, -.06], [.7, .03], [0, .06]],
  farm: [[0, -1.02], [.62, -1], [.66, -.85], [.8, -.55], [.97, -.25], [1, -.12], [.88, 0], [0, .03]],
  thigh: [[0, -1.02], [.7, -1], [.74, -.92], [.85, -.7], [.95, -.4], [1, -.15], [.96, 0], [0, .04]],
  calf: [[0, -1.02], [.5, -1], [.54, -.85], [.72, -.6], [.95, -.35], [1, -.22], [.86, -.04], [0, 0]],
  trou: [[0, -1], [.92, -1], [.9, -.6], [.88, -.3], [.86, 0], [0, .02]],
  tube: [[1.14, -1], [1.1, -.6], [1.06, -.2], [1.03, 0]]        // open sleeve / shorts leg
};
function tprof(f, y) {
  const T = TOR[f]; let i = 1; while (i < T.length - 1 && T[i][0] < y) i++;
  const a = T[Math.max(0, i - 2)], b = T[i - 1], c = T[i], d = T[Math.min(T.length - 1, i + 1)], t = clamp((y - b[0]) / (c[0] - b[0]), 0, 1);
  const cr = k => .5 * (2 * b[k] + (-a[k] + c[k]) * t + (2 * a[k] - 5 * b[k] + 4 * c[k] - d[k]) * t * t + (-a[k] + 3 * b[k] - 3 * c[k] + d[k]) * t * t * t);
  return [cr(1), cr(2), cr(3)];
}
const tbump = (f, y, x) => { const ax = Math.abs(x); return f === 'f' ? .046 * Math.exp(-(((y - 1.6) / .055) ** 2)) * Math.exp(-(((ax - .085) / .06) ** 2)) : .012 * Math.exp(-(((y - 1.66) / .06) ** 2)) * Math.exp(-(((ax - .09) / .075) ** 2)) + .008 * Math.exp(-(((y - 1.33) / .06) ** 2)) * Math.exp(-((ax / .1) ** 2)) };
const gbump = (y, x) => .022 * Math.exp(-(((y - 1.19) / .07) ** 2)) * Math.exp(-(((Math.abs(x) - .085) / .08) ** 2));
/* point on the torso at height y, angle ph (0 = back centre, PI = front centre) */
function tpoint(f, y, ph, scl, out) {
  const [W, Fd, Bd] = tprof(f, y), sn = Math.sin(ph), cs = -Math.cos(ph), e = .82, x = -W * Math.sign(sn) * Math.pow(Math.abs(sn), e);
  let z = (cs > 0 ? Fd : Bd) * Math.sign(cs) * Math.pow(Math.abs(cs), e);
  if (cs > 0) z += tbump(f, y, x) * Math.pow(cs, .6); else z -= gbump(y, x) * Math.pow(-cs, .6);
  out[0] = x * scl; out[1] = y; out[2] = z * scl; return out;
}
/* front surface depth at height y and sideways offset x (prints, ties, collars) */
function torsoFront(f, y, x) { const [W, Fd] = tprof(f, y), sn = Math.min(1, Math.pow(Math.abs(x) / W, 1 / .82)), cs = Math.sqrt(Math.max(0, 1 - sn * sn)); return Fd * Math.pow(cs, .82) + tbump(f, y, x) * Math.pow(cs, .6) }
function torsoGeo(f, y0, y1, scl, nr, ns) {
  const pos = [], uv = [], idx = [], p = [0, 0, 0], row = ns + 1;
  for (let i = 0; i <= nr; i++) { const y = lerp(y0, y1, i / nr); for (let j = 0; j <= ns; j++) { tpoint(f, y, j / ns * TAU, scl, p); pos.push(p[0], y - y0, p[2]); uv.push(j / ns, i / nr) } }
  const nb = pos.length / 3, top = nr * row; pos.push(0, -.012, 0, 0, y1 - y0 + .01, -.005); uv.push(.5, 0, .5, 1);
  for (let i = 0; i < nr; i++) for (let j = 0; j < ns; j++) { const a = i * row + j, b = a + row; idx.push(a, b, a + 1, b, b + 1, a + 1) }
  for (let j = 0; j < ns; j++) idx.push(nb, j, j + 1, nb + 1, top + j + 1, top + j);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  if (g.attributes.normal.getZ(Math.round(nr / 2) * row + Math.round(ns / 2)) < 0) { for (let t = 0; t < idx.length; t += 3) { const q = idx[t + 1]; idx[t + 1] = idx[t + 2]; idx[t + 2] = q } g.setIndex(idx); g.computeVertexNormals() }
  const Nm = g.attributes.normal;
  for (let i = 0; i <= nr; i++) { const a = i * row, b = a + ns, x = Nm.getX(a) + Nm.getX(b), y = Nm.getY(a) + Nm.getY(b), z = Nm.getZ(a) + Nm.getZ(b), l = Math.hypot(x, y, z) || 1; Nm.setXYZ(a, x / l, y / l, z / l); Nm.setXYZ(b, x / l, y / l, z / l) }
  g.userData = { shared: true, y0 }; return g;
}
const BODY = [];
function bodyGeo(lvl) {
  if (BODY[lvl]) return BODY[lvl];
  const seg = [6, 8, 12][lvl], ns = [10, 16, 24][lvl], B = { torso: {} };
  for (const k in LP) { B[k] = new THREE.LatheGeometry(LP[k].map(p => new THREE.Vector2(p[0], p[1])), seg); B[k].userData.shared = true }
  for (const f of ['m', 'f']) B.torso[f] = { lo: torsoGeo(f, 1.06, 1.36, 1, [3, 5, 8][lvl], ns), up: torsoGeo(f, 1.29, 1.94, 1.035, [8, 12, 18][lvl], ns) };
  return BODY[lvl] = B;
}
/* arm: pivot at the shoulder joint; the parts hang in a slightly abducted 'lean' group (clears the chest) */
function harm(g, Gx, B, side, o) {
  const pv = new THREE.Group(); pv.position.set(side * o.x, o.y, 0); g.add(pv);
  const a = new THREE.Group(); a.rotation.z = side * .075; pv.add(a); pv.userData.lean = a;
  const th = o.th, ua = o.len * .52, fa = o.len * .48, s = o.s, hy = -o.len, J = o.lite ? Gx.dot : Gx.sph;
  part(a, Gx.sph, o.srole === 'skin' ? o.skin : o.slm, side * th * .1, -th * .62, 0, th * 1.04, th * 1.3, th * 1.06, o.srole);   // deltoid
  part(a, B.uarm, o.skin, 0, 0, 0, th, ua, th * .94, 'skin');
  if (o.srole !== 'skin') part(a, B.tube, o.slm, 0, 0, 0, th, ua * .56, th * .96, o.srole);                                       // short sleeve
  part(a, J, o.skin, 0, -ua, 0, th * .74, th * .74, th * .72, 'skin');                                                             // elbow
  part(a, B.farm, o.skin, 0, -ua, 0, th * .84, fa, th * .78, 'skin');
  /* hand: palm towards the thigh, thumb forward, fingers curled in */
  part(a, Gx.sph, o.skin, -side * .004 * s, hy - .048 * s, .004 * s, .02 * s, .052 * s, .04 * s, 'skin');
  part(a, Gx.fing, o.skin, -side * .006 * s, hy - .03 * s, .036 * s, .011 * s, .05 * s, .011 * s, 'skin', [-.55, 0, -side * .35]);
  if (!o.lite) for (let i = 0; i < 4; i++) part(a, Gx.fing, o.skin, -side * .01 * s, hy - .108 * s + Math.abs(i - 1.2) * .006 * s, (.021 - i * .014) * s, .0085 * s, .056 * s, .0095 * s, 'skin', [0, 0, -side * .28]);
  return pv;
}
/* leg: pivot at the hip joint; thigh, knee, calf (bare in shorts) or trouser leg, then sneaker or flip-flop */
function hleg(g, Gx, B, side, o) {
  const pv = new THREE.Group(); pv.position.set(side * o.x, o.y, 0); g.add(pv);
  const s = o.s, th = o.th, tl = o.len * .478, sl = o.len * .447, ky = -tl, ay = -tl - sl, fy = -o.len, J = o.lite ? Gx.dot : Gx.sph;
  if (o.shorts) { part(pv, B.thigh, o.skin, 0, 0, 0, th, tl, th * .96, 'skin'); part(pv, B.tube, o.pants, 0, .04 * s, 0, th * .98, tl * .7, th * .95, 'pants') }
  else part(pv, B.thigh, o.pants, 0, 0, 0, th * 1.04, tl, th, 'pants');
  part(pv, J, o.shorts ? o.skin : o.pants, 0, ky, .008 * s, th * .7, th * .78, th * .74, o.shorts ? 'skin' : 'pants');
  if (o.shorts) part(pv, B.calf, o.skin, 0, ky, 0, th * .78, sl, th * .8, 'skin'); else part(pv, B.trou, o.pants, 0, ky, 0, th * .76, sl + .03 * s, th * .74, 'pants');
  if (o.shorts || o.foot === 'flip') part(pv, J, o.skin, 0, ay, 0, th * .43, th * .5, th * .45, 'skin');
  if (o.foot === 'flip') {
    part(pv, Gx.sph, o.skin, 0, fy + .034 * s, .06 * s, .045 * s, .03 * s, .125 * s, 'skin');
    part(pv, Gx.box, o.shoe, 0, fy + .007 * s, .06 * s, .1 * s, .014 * s, .3 * s, 'fixed');
    if (!o.lite) { for (const sz of [-1, 1]) part(pv, Gx.box, o.shoe, sz * .022 * s, fy + .04 * s, .11 * s, .007 * s, .012 * s, .085 * s, 'fixed', [0, sz * .55, 0]); for (let i = 0; i < 4; i++) part(pv, Gx.dot, o.skin, (-.03 + i * .019) * s, fy + .025 * s, .185 * s, .012 * s, .012 * s, .016 * s, 'skin') }
  } else {
    part(pv, Gx.sph, o.sole, 0, fy + .019 * s, .055 * s, .058 * s, .022 * s, .175 * s, 'fixed');
    part(pv, Gx.sph, o.shoe, 0, fy + .052 * s, .045 * s, .052 * s, .055 * s, .15 * s, 'fixed');
    if (!o.lite) { part(pv, Gx.sph, o.shoe, 0, fy + .036 * s, .16 * s, .047 * s, .034 * s, .06 * s, 'fixed'); part(pv, Gx.cyl, o.shoe, 0, fy + .085 * s, -.03 * s, .046 * s, .06 * s, .05 * s, 'fixed'); part(pv, Gx.box, o.sole, 0, fy + .088 * s, .07 * s, .032 * s, .006 * s, .085 * s, 'fixed', [-.32, 0, 0]) }
  }
  return pv;
}
/* the head: sculpted skull + painted face (hero) or the canonical crowd head (walker), hair / beard / cap shells, ears, style extras */
function makeHead(head, o, A) {
  const { fem, k, lvl, walker, seed, lite } = A, Gx = lvl === 2 ? GL : A.Gx, r = AV.rng(seed * 31 + 5), st = o.style || 'short', key = 'w' + (fem ? 1 : 0) + lvl;
  const S = faceShape(r, fem, walker), H = walker ? headData(S, lvl, key) : headSamples(S, lvl), morph = walker ? headMorph(S, lvl, key) : null;
  const hl = st === 'bald' ? null : hairline(walker ? { fem, low: -4 } : { fem, recede: !fem && r() < .3 ? .3 + r() * .5 : 0, peak: r() < .2 ? 1 : 0, low: fem ? r() * 3 : r() * 2 - 1, ph: r() * 6 });
  const bType = o.beard ? (o.beard === true ? 'full' : o.beard) : null, bd = bType ? beardDef(S, bType) : null;
  const hairL = hl ? { mask: st === 'cap' ? (x, y, z) => hairMask(hl, x, y, z) * (1 - capMask(x, y, z)) : (x, y, z) => hairMask(hl, x, y, z), thick: HAIRT[st] || HAIRT.short } : null;
  const beardL = bd && bType !== 'stubble' ? { mask: (x, y, z) => beardMask(bd, x, y, z), thick: (x, y, z, m) => .003 + m * (bType === 'full' ? .018 : .011) } : null;
  let F = null, mat;
  if (walker) mat = std(0xffffff, .72);
  else {
    const sc = rgbOf(A.skinHex); F = faceLook(seed, S, { hl, beard: bType, redEye: o.redEye, iris: o.eye != null ? rgbOf(o.eye) : null, dark: sc[0] * .3 + sc[1] * .59 + sc[2] * .11 < 150 });
    const t = heroFace(F, lvl === 2 ? 512 : 256, A.skinHex, A.hairHex), D = detailTex();
    mat = new THREE.MeshStandardMaterial({ map: t.map, roughness: 1, roughnessMap: D });
    if (t.glow) { mat.emissive = new THREE.Color(0xffffff); mat.emissiveMap = t.glow; mat.emissiveIntensity = .55 }
    mat.userData.lin = 1;
  }
  const layers = [null]; if (hairL) layers.push(hairL); if (beardL && !walker) layers.push(beardL);
  part(head, gridGeo(H, layers, morph), mat, 0, 0, 0, k, k, k, 'face');
  if (beardL && walker) part(head, gridGeo(H, [beardL], morph), A.hair, 0, 0, 0, k, k, k, 'hair');
  /* ears: outer plate, concha, lobe */
  const skinD = std(shade(A.skinHex, .78), .7);
  for (const sx of [-1, 1]) {
    part(head, Gx.sph, A.skin, sx * .238 * k, -.078 * k, -.035 * k, .022 * k, .088 * k, .052 * k, 'skin', [-.12, -sx * .38, 0]);
    if (!lite) { part(head, Gx.dot, skinD, sx * .252 * k, -.084 * k, -.022 * k, .011 * k, .034 * k, .022 * k, 'skin', [-.12, -sx * .38, 0]); part(head, Gx.dot, A.skin, sx * .236 * k, -.15 * k, -.024 * k, .016 * k, .024 * k, .02 * k, 'skin') }
  }
  const on = (az, el) => { const d = [Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)]; return [d, rayR(H.f, d[0], d[1], d[2])] };
  const at = (d, q) => [d[0] * q * k, d[1] * q * k, d[2] * q * k];
  if (st === 'messy' || st === 'blond') { const rr = AV.rng(seed + (st === 'messy' ? 3 : 7)), n = lite ? 6 : 14; for (let i = 0, t = 0; i < n && t < 90; t++) { const [d, R] = on((rr() * 2 - 1) * 2.6, .3 + rr() * 1.0); if (hairMask(hl, d[0], d[1], d[2]) < .7) continue; i++; const p = at(d, R + .03 + rr() * .015); part(head, Gx.sph, A.hair, p[0], p[1], p[2], (.05 + rr() * .03) * k, (.04 + rr() * .025) * k, (.05 + rr() * .03) * k, 'hair') } }
  if (st === 'bun') { const [d, R] = on(Math.PI, .75), p = at(d, R + .06), q = at(d, R + .012); part(head, Gx.sph, A.hair, p[0], p[1], p[2], .085 * k, .08 * k, .085 * k, 'hair'); part(head, Gx.ring, std(0xe8303a, .6), q[0], q[1], q[2], .05 * k, .05 * k, .05 * k, 'fixed', [Math.atan2(-d[1], d[2]), 0, 0]) }
  if (st === 'long') {
    part(head, Gx.sph, A.hair, 0, -.33 * k, -.2 * k, .215 * k, .4 * k, .1 * k, 'hair');
    for (const sx of [-1, 1]) part(head, Gx.sph, A.hair, sx * .215 * k, -.2 * k, -.035 * k, .05 * k, .26 * k, .085 * k, 'hair');
    if (o.flower) for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; part(head, Gx.dot, std(o.flower, .5), .246 * k, (.11 + Math.sin(a) * .03) * k, (.1 + Math.cos(a) * .03) * k, .012 * k, .025 * k, .025 * k, 'fixed') }
  }
  if (st === 'cap') {
    const cm = std(o.capCol || 0x2a6a3a, .8); part(head, gridGeo(H, [{ mask: capMask, thick: (x, y, z, m) => .006 + .026 * m }], morph), cm, 0, 0, 0, k, k, k, 'fixed');
    const [d, R] = on(0, .36); part(head, Gx.sph, cm, 0, (d[1] * (R + .03) - .012) * k, (d[2] * (R + .03) + .085) * k, .15 * k, .012 * k, .12 * k, 'fixed', [-.12, 0, 0]);
  }
  if (o.glasses) {
    const fr = std(o.glasses === true ? 0x18120e : o.glasses, .4), es = .098 * S.es;
    for (const sx of [-1, 1]) { part(head, Gx.ring, fr, sx * es * k, -.062 * k, .318 * k, .07 * k, .056 * k, .05 * k, 'fixed'); part(head, Gx.cyl, fr, sx * .236 * k, -.058 * k, .14 * k, .007 * k, .34 * k, .007 * k, 'fixed', [Math.PI / 2, 0, 0]) }
    part(head, Gx.box, fr, 0, -.054 * k, .322 * k, .05 * k, .01 * k, .01 * k, 'fixed');
  }
  return { S, F, hl };
}
const hashLook = o => { let h = 2166136261; for (const v of [o.skin, o.hair, o.style, o.s, o.big, o.beard, o.glasses, o.eye, o.capCol]) { const t = String(v); for (let i = 0; i < t.length; i++) h = Math.imul(h ^ t.charCodeAt(i), 16777619) } return h >>> 0 };
/* o: {skin, hair, style:'messy'|'bun'|'long'|'blond'|'cap'|'short'|'bald', beard (true|'full'|'goatee'|'mustache'|'stubble'), glasses, eye (iris hex),
       redEye, shirt(mat), sleeve(mat|'skin'), pants(mat), shorts(bool), foot:'flip'|'sneaker', shoe(hex), s, slim, fem, big, lite, lod, capCol, flower, seed} */
C.human = function (o) {
  const lowQ = AV.kit && AV.kit.q && AV.kit.q() === 0, walker = !!o.walker, lvl = o.ultra ? 0 : o.lod || lowQ ? 1 : 2, Gx = [GU, GL, GH][lvl], B = bodyGeo(lvl), lite = !!o.lite;
  const fem = o.fem != null ? !!o.fem : !!o.slim && !o.beard, f = fem ? 'f' : 'm';
  const g = new THREE.Group(), s = o.s || .8, big = o.big || (o.slim ? .84 : .92), bw = big / .92, k = s * .43, seed = o.seed != null ? o.seed | 0 : hashLook(o);
  const skinHex = o.skin || 0xd8a47a, hairHex = o.hair == null ? 0x3a2416 : o.hair, skin = std(skinHex, .7), hair = std(hairHex, .9);
  const shirt = o.shirt || std(0x4a8ad8, .85), pants = o.pants || std(0x3a3a52, .9);
  const sleeveM = o.sleeve === 'skin' ? skin : (o.sleeve || shirt), sleeveRole = o.sleeve === 'skin' ? 'skin' : 'shirt';
  const T = B.torso[f];
  part(g, T.lo, pants, 0, T.lo.userData.y0 * s, 0, s * bw, s, s * bw, 'pants');
  const torso = part(g, T.up, shirt, 0, T.up.userData.y0 * s, 0, s * bw, s, s * bw, 'shirt'); torso.userData.torso = true;
  part(g, Gx.cyl, skin, 0, 1.96 * s, -.012 * s, .066 * s, .26 * s, .06 * s, 'skin');                                                     // neck
  if (!lite) part(g, Gx.ring, shirt, 0, 1.895 * s, -.006 * s, .075 * s * bw, .068 * s * bw, .05 * s, 'shirt', [Math.PI / 2 + .12, 0, 0]);   // collar
  const head = new THREE.Group(); head.position.set(0, 2.16 * s, 0); g.add(head);
  const hd = makeHead(head, o, { fem, k, lvl, walker, Gx, seed, lite, skin, hair, skinHex, hairHex });
  const Gl = lvl === 2 ? GL : Gx, armL = .74 * s, A = side => harm(g, Gl, B, side, { x: (fem ? .2 : .222) * bw * s, y: 1.835 * s, len: armL, th: (fem ? .052 : .06) * Math.sqrt(bw) * s, slm: sleeveM, srole: sleeveRole, skin, lite, s });
  const aL = A(-1), aR = A(1);
  const shoe = std(o.shoe || (o.foot === 'flip' ? 0x3a4a2a : 0x2a2a2a), .8), sole = std(0xf0ece4, .7), hipY = 1.165 * s;
  const Lg = side => hleg(g, Gl, B, side, { x: (fem ? .1 : .097) * bw * s, y: hipY, len: hipY, th: (fem ? .1 : .097) * Math.sqrt(bw) * s, pants, skin, shorts: !!o.shorts, foot: o.foot, shoe, sole, lite, s });
  const lL = Lg(-1), lR = Lg(1), chestY = (fem ? 1.6 : 1.62) * s;
  g.userData = { head, aL, aR, lL, lR, torso, s, k, Gx, big, bw, fem, human: true, extra: [aL.userData.lean, aR.userData.lean], seed, face: hd.F,
    armL, hipY, waistY: 1.36 * s, chestY, chestZ: torsoFront(f, chestY / s, 0) * bw * s * 1.035, backZ: -tprof(f, chestY / s)[2] * bw * s * 1.035, neckZ: (torsoFront(f, 1.88, 0) + .01) * bw * s };
  return g;
};
/* a prop group attached to a hand (pivot at the hand), compacted with the character */
function handProp(u, side) { const arm = side > 0 ? u.aR : u.aL, p = new THREE.Group(); p.position.set(-side * .004 * u.s, -(u.armL || .8 * u.s) - .03 * u.s, .03 * u.s); (arm.userData.lean || arm).add(p); u.extra.push(p); return p }
C.props = {
  joint(u, side) { const p = handProp(u, side || 1), s = u.s; part(p, u.Gx.cyl, std(0xf4f0e4, .8), 0, -.02 * s, .1 * s, .012 * s, .11 * s, .012 * s, 'fixed', [Math.PI / 2 - .3, 0, 0]); part(p, u.Gx.dot, std(0xff6a2a, .4, 0, 0xff5a1a, 1.4), 0, .0, .155 * s, .016 * s, .016 * s, .016 * s, 'fixed'); u.joint = p; return p },
  beer(u, side) { const p = handProp(u, side || -1), s = u.s, gl = std(0x2a7a3a, .15, .2); part(p, u.Gx.cyl, gl, 0, -.02 * s, .05 * s, .045 * s, .2 * s, .045 * s); part(p, u.Gx.taper, gl, 0, .12 * s, .05 * s, .02 * s, .07 * s, .02 * s, 'fixed', [Math.PI, 0, 0]); part(p, u.Gx.cyl, std(0xe8d8a0, .6), 0, -.03 * s, .096 * s, .046 * s, .07 * s, .002 * s); u.beer = p; return p },
  ukulele(u) { const p = new THREE.Group(), s = u.s; p.position.set(.05 * s, 1.5 * s, (u.chestZ || .2 * s) + .08 * s); p.rotation.set(0, 0, -.9); u.extra.push(p);
    const body = new THREE.Group(); p.add(body); const wood = std(0xc8803a, .5);
    part(p, u.Gx.sph, wood, 0, -.12 * s, 0, .17 * s, .15 * s, .05 * s); part(p, u.Gx.sph, wood, 0, .06 * s, 0, .13 * s, .11 * s, .05 * s); part(p, u.Gx.dot, std(0x2a1408, .5), 0, -.02 * s, .05 * s, .045 * s, .045 * s, .01 * s);
    part(p, u.Gx.box, std(0x3a2414, .5), 0, .35 * s, .02 * s, .045 * s, .42 * s, .02 * s); part(p, u.Gx.box, std(0x6a4020, .5), 0, .58 * s, .02 * s, .06 * s, .08 * s, .025 * s);
    for (const x of [-.012, -.004, .004, .012]) part(p, u.Gx.cyl, std(0xeeeeee, .3), x * s, .2 * s, .045 * s, .002 * s, .7 * s, .002 * s);
    u.uke = p; return p },
  cue(u) { const p = handProp(u, 1), s = u.s; part(p, u.Gx.taper, std(0xd8b080, .5), 0, .55 * s, .05 * s, .018 * s, 1.5 * s, .018 * s, 'fixed', [0, 0, 0]); part(p, u.Gx.cyl, std(0x1a1a1a, .5), 0, -.1 * s, .05 * s, .021 * s, .2 * s, .021 * s); u.cue = p; return p },
  phone(u) { const p = handProp(u, 1), s = u.s; part(p, u.Gx.box, std(0x1a1a22, .3, .3), 0, .0, .06 * s, .07 * s, .13 * s, .012 * s, 'fixed', [-1, 0, 0]); part(p, u.Gx.box, std(0x6ac8ff, .3, 0, 0x6ac8ff, 1), 0, .0, .066 * s, .06 * s, .11 * s, .004 * s, 'fixed', [-1, 0, 0]); return p },
  gun(u, col) { const p = handProp(u, 1), s = u.s, c = std(col || 0x2ab8e8, .4); part(p, u.Gx.box, c, 0, -.02 * s, .15 * s, .07 * s, .07 * s, .34 * s); part(p, u.Gx.cyl, std(0xffd84a, .4), 0, .08 * s, .1 * s, .06 * s, .14 * s, .06 * s); part(p, u.Gx.cyl, c, 0, -.02 * s, .34 * s, .015 * s, .08 * s, .015 * s, 'fixed', [Math.PI / 2, 0, 0]); u.gun = p; return p }
};
/* a decal print on the chest (textured plane, kept separate from compact) */
function chestPrint(g, key, w) {
  const u = g.userData, s = u.s, f = u.fem ? 'f' : 'm', bw = u.bw || 1, y0 = u.fem ? 1.64 : 1.6, geo = new THREE.PlaneGeometry(w, w, 8, 8), P = geo.attributes.position;
  for (let i = 0; i < P.count; i++) P.setZ(i, torsoFront(f, y0 + P.getY(i), P.getX(i) / bw) * bw * 1.035 + .006);   // bent onto the chest
  geo.computeVertexNormals(); const m = new THREE.Mesh(geo, mat(key)); m.position.set(0, y0 * s, 0); m.scale.setScalar(s); g.add(m); return m;
}

/* ---------------- the Giant Hostel crew ---------------- */
C.crew = {
  /* Mutt: slim Thai woman, black Giant Hostel tee with the round white logo (reference: hostel map art) */
  mud() { const g = C.human({ seed: 11, skin: 0xc89068, hair: 0x14100c, style: 'bun', slim: true, s: .76, shirt: std(0x16161a, .85), pants: std(0x4a5a7a, .9), foot: 'sneaker', shoe: 0xf0f0f0 }); chestPrint(g, 'giantTee', .34); g.userData.kind = 'mud'; return C.compact(g) },
  /* Nuni: the owner's sister, pool champion; long black hair, flower, red tank top, beer */
  nuni() { const g = C.human({ seed: 12, skin: 0xc8946a, hair: 0x100c0a, style: 'long', flower: 0xff7ab8, slim: true, s: .74, shirt: mat('tank'), sleeve: 'skin', pants: std(0x2a2a34, .9), shorts: true, foot: 'flip', shoe: 0xe8303a }); C.props.beer(g.userData, -1); g.userData.kind = 'nuni'; return C.compact(g) },
  /* Steve: blond ukulele player (no reference supplied: generic look) */
  steve() { const g = C.human({ seed: 13, skin: 0xf0c0a0, hair: 0xe8c860, style: 'blond', s: .82, shirt: mat('hawaii'), pants: std(0xc8b088, .9), shorts: true, foot: 'flip', shoe: 0x6a4a2a, eye: 0x3a6ab8 }); C.props.ukulele(g.userData); g.userData.kind = 'steve'; return C.compact(g) },
  /* Dino: laid-back resident stoner (no reference supplied: generic look) */
  dino() { const g = C.human({ seed: 14, skin: 0xd8a47a, hair: 0x5a5048, style: 'cap', capCol: 0x2a8a4a, beard: true, redEye: true, s: .8, big: 1.02, shirt: mat('reggae'), pants: std(0x6a6a5a, .9), shorts: true, foot: 'flip', shoe: 0x2a2a2a }); C.props.joint(g.userData, 1); g.userData.kind = 'dino'; return C.compact(g) },
  /* ZtonedApe: messy brown hair, glasses, beard, dark printed tee, red elephant shorts, olive slides (reference: "Glasses at the Giant Hostel") */
  zape() { const g = C.human({ seed: 15, skin: 0xdca47c, hair: 0x4a2c18, style: 'messy', beard: true, glasses: true, redEye: true, s: .82, shirt: std(0x2a1c1c, .85), pants: mat('elephant'), shorts: true, foot: 'flip', shoe: 0x4a5a2a }); chestPrint(g, 'ztonedTee', .34); C.props.joint(g.userData, 1); g.userData.kind = 'zape'; return C.compact(g) },
  nunyin() { const g = C.human({ seed: 16, skin: 0xc89068, hair: 0x18120e, style: 'bun', slim: true, s: .74, shirt: std(0x1a1a1a, .85), sleeve: 'skin', pants: std(0x3a3a4a, .9) }); g.userData.kind = 'nunyin'; return C.compact(g) },
  golf() { const g = C.human({ seed: 17, skin: 0xd09a70, hair: 0x14100c, style: 'short', glasses: true, s: .72, big: 1.1, shirt: std(0x22222a, .85), pants: std(0x3a3a3a, .9), shorts: true, shoe: 0x202020 }); C.props.phone(g.userData); g.userData.kind = 'golf'; return C.compact(g) },
  guest(seed) { const r = AV.rng(seed * 31 + 7), pick = a => a[Math.floor(r() * a.length)]; const g = C.human({ seed: seed * 31 + 7, skin: pick([0xf0c8a8, 0xd8a47a, 0xb07a50, 0x8a5a3a, 0xe8b890]), hair: pick([0x2a1a10, 0xd8b860, 0x8a4a20, 0x14100c, 0xb0b0b0]), style: pick(['short', 'long', 'messy', 'cap', 'bun']), beard: r() < .3, glasses: r() < .25, s: .74 + r() * .1, slim: r() < .4, shirt: std(pick([0xe8603a, 0x3a8ad8, 0xf2e8d8, 0x2a9a6a, 0xd84a8a, 0x2a2a2a, 0xffd84a]), .85), pants: std(pick([0x3a3a52, 0xc8b088, 0x2a2a2a, 0x6a8ab8]), .9), shorts: r() < .6, foot: r() < .5 ? 'flip' : 'sneaker', shoe: pick([0x2a2a2a, 0xe8e8e8, 0x8a5a3a]) }); if (r() < .35) C.props.beer(g.userData, -1); return C.compact(g) }
};
/* ---------------- multiverse cloud-watchers (js/stoners.js spawns them in every world) ----------------
   A red-eyed, joint-smoking human in mismatched festival clothes. Wild hair, no two alike, always mid-thought. */
C.stoner = function (seed) {
  const r = AV.rng((seed || 1) * 131 + 17), pick = a => a[Math.floor(r() * a.length) % a.length];
  const style = pick(['messy', 'messy', 'long', 'bun', 'blond', 'cap']);
  const o = {
    skin: pick([0xf0c8a8, 0xd8a47a, 0xc8946a, 0xb07a50, 0x8a5a3a, 0x6a4028]),
    hair: pick([0x14100c, 0x4a2c18, 0xd8b860, 0xb0b0b0, 0xa83a1a, 0xe8e0d0]),
    style, redEye: true, beard: r() < .32,
    flower: style === 'long' && r() < .5 ? pick([0xff6ad5, 0xffd84a, 0x7ff0ff]) : null,
    capCol: pick([0x2a8a4a, 0xe8303a, 0xffd84a, 0x7a4ac8]),
    s: .76 + r() * .12, big: .92 + r() * .16,
    shirt: pick([() => mat('reggae'), () => mat('hawaii'), () => mat('tieDye'), () => std(0xff6a3a, .85), () => std(0x7a4ac8, .85), () => std(0x2a9a6a, .85)])(),
    pants: std(pick([0x3a3a52, 0x6a6a5a, 0xc8b088, 0x2a2a2a, 0x4a6a3a, 0x6a2a4a]), .9),
    shorts: r() < .7, foot: r() < .65 ? 'flip' : 'sneaker',
    shoe: pick([0x2a2a2a, 0xe8e8e8, 0xe8303a, 0x3a6ad8, 0x8a5a3a])
  };
  if (r() < .45) o.sleeve = 'skin';
  o.seed = (seed || 1) * 131 + 17; o.fem = !o.beard && (style === 'long' || style === 'bun' ? r() < .7 : r() < .15);
  const g = C.human(o);
  C.props.joint(g.userData, r() < .5 ? 1 : -1);
  g.userData.kind = 'stoner';
  return C.compact(g);
};

/* ---------------- instanced pedestrians: baked per-pivot geometry ---------------- */
const SLOT = { skin: 1, shirt: 2, pants: 3, hair: 4, fur: 4, face: 5 };
/* Vietnamese street-vendor props (used through the VAR extra hook) */
function nonLa(u) { const straw = std(0xe8d8a8, .85); part(u.head, AV.kit.BG.cone, straw, 0, .24 * u.k, 0, .5 * u.k, .28 * u.k, .5 * u.k, 'fixed'); part(u.head, GU.cyl, straw, 0, .1 * u.k, 0, .5 * u.k, .012 * u.k, .5 * u.k, 'fixed') }
function shoulderPole(g, u) { const s = u.s, bam = std(0xb89a5a, .8), bsk = std(0x8a6a3a, .9); part(g, GU.cyl, bam, .2 * s, 1.93 * s, 0, .02 * s, 1.9 * s, .02 * s, 'fixed', [Math.PI / 2, 0, 0]);
  for (const sz of [-1, 1]) { part(g, GU.cyl, bsk, .2 * s, .95 * s, sz * .86 * s, .24 * s, .26 * s, .24 * s, 'fixed'); part(g, GU.cyl, std(sz > 0 ? 0xe8b830 : 0x3a8a3a, .7), .2 * s, 1.1 * s, sz * .86 * s, .2 * s, .06 * s, .2 * s, 'fixed'); part(g, GU.cyl, bam, .2 * s, 1.45 * s, sz * .86 * s, .008 * s, .8 * s, .008 * s, 'fixed') } }
const VAR = {
  man: { style: 'short', shorts: false }, woman: { style: 'long', slim: true, shorts: true, foot: 'flip' }, tourist: { style: 'cap', shorts: true, foot: 'flip' },
  monk: { style: 'bald', shorts: false, foot: 'flip' }, dancer: { style: 'bun', slim: true, shorts: false, crown: true }, drummer: { style: 'short', drum: true },
  splasher: { style: 'messy', shorts: true, foot: 'flip', gun: true },
  /* Da Nang: street vendor (nón lá conical hat + đòn gánh shoulder pole with two baskets), beachgoer in shorts */
  vendor: { style: 'long', slim: true, shorts: false, foot: 'flip', extra: (g, u) => { nonLa(u); shoulderPole(g, u) } }, beach: { style: 'short', shorts: true, foot: 'flip' }, nonla: { style: 'long', slim: true, shorts: false, foot: 'flip', extra: (g, u) => nonLa(u) }
};
C.walkerVar = VAR;
const walkCache = {};
C.walkerKit = function (v, lo) {
  /* the instanced crowd keeps light geometry (one canonical sculpted head per body type, coarse limbs); faces come from the
     shared atlas (iFace) and the head shape varies per instance through four radial blend targets (iShape x aMorph) */
  const key = v + (lo ? 'L' : 'H'); if (walkCache[key]) return walkCache[key];
  const o = Object.assign({ lite: true, ultra: true, walker: true, lod: lo, skin: 0xffffff, hair: 0xffffff, shirt: std(0xffffff, .8), pants: std(0xfffffe, .9), s: .78 }, VAR[v]);
  const g = C.human(o), u = g.userData, s = u.s;
  if (o.crown) part(u.head, u.Gx.cyl, std(0xe8b830, .3, .7), 0, .28 * u.k, 0, .09 * u.k, .3 * u.k, .09 * u.k, 'fixed');
  if (o.drum) { part(g, u.Gx.cyl, std(0xc83a2a, .6), 0, 1.3 * s, .3 * s, .2 * s, .28 * s, .2 * s, 'fixed', [Math.PI / 2, 0, 0]); part(g, u.Gx.cyl, std(0xf0e8d0, .6), 0, 1.3 * s, .45 * s, .19 * s, .02 * s, .19 * s, 'fixed', [Math.PI / 2, 0, 0]) }
  if (o.gun) C.props.gun(u, 0x2ab8e8);
  if (o.extra) o.extra(g, u, KK);   /* regional outfits (js/chars_regional.js): hats, robes, briefcases... */
  g.updateMatrixWorld(true);
  const pivots = { root: g, head: u.head, aL: u.aL, aR: u.aR, lL: u.lL, lR: u.lR }, out = {}, pvList = Object.values(pivots), _s = new THREE.Vector3();
  const hexOf = m => { const c = m.color.clone(); if (m.userData.lin) c.convertLinearToSRGB(); return c.getHex() };
  for (const name in pivots) {
    const pv = pivots[name], inv = new THREE.Matrix4().copy(pv.matrixWorld).invert(), parts = [];
    pv.traverse(ch => { if (!ch.isMesh) return; let p = ch.parent; while (p && p !== pv && !pvList.includes(p)) p = p.parent; if (p !== pv) return;
      const slot = SLOT[ch.userData.role] || 0, mm = new THREE.Matrix4().multiplyMatrices(inv, ch.matrixWorld); parts.push([ch.geometry, slot ? 0xffffff : hexOf(ch.material), mm, slot]) });
    if (!parts.length) continue;
    const geo = AV.kit.merge(parts), mor = new Float32Array(geo.attributes.position.count * 4); let off = 0;
    /* per-vertex blend targets (pivot units) for the parts that carry them: the head and its shells */
    for (const p of parts) { const q = p[0], n = q.index ? q.index.count : q.attributes.position.count, am = q.attributes.aMorph;
      if (am) { const sc = _s.setFromMatrixScale(p[2]).x; for (let i = 0; i < n; i++) { const vi = q.index ? q.index.getX(i) : i; for (let c = 0; c < 4; c++) mor[(off + i) * 4 + c] = am.array[vi * 4 + c] * sc } }
      off += n }
    const gl = geo.attributes.aGlow.array, uv = geo.attributes.uv.array, sl = new Float32Array(gl.length * 3); for (let i = 0; i < gl.length; i++) { sl[i * 3] = gl[i]; sl[i * 3 + 1] = uv[i * 2]; sl[i * 3 + 2] = uv[i * 2 + 1] }
    geo.setAttribute('aMorph', new THREE.BufferAttribute(mor, 4)); geo.setAttribute('aSlot', new THREE.BufferAttribute(sl, 3)); geo.deleteAttribute('aGlow'); geo.deleteAttribute('uv');
    out[name] = { geo, pos: pv === g ? new THREE.Vector3() : pv.position.clone() };
  }
  /* seated pose drop that keeps the hips at the old bench height (city_life.js 'sit') */
  Object.defineProperty(out, 'meta', { value: { sitLift: (.96 * s - .42) - u.hipY, fem: u.fem }, enumerable: false });
  return walkCache[key] = out;
};
/* per-instance face for an instanced walker: an atlas face of the right sex + head-shape weights (city_life.js iFace / iShape) */
C.walkerFace = function (v, r) {
  const o = VAR[v] || {}, fem = o.fem != null ? !!o.fem : !!o.slim && !o.beard;
  return { face: (fem ? 8 : 0) + Math.floor(r() * 8) % 8, shape: [r() * 2 - 1, r() * 2 - 1, r() * 2 - 1, r() * 2 - 1] };
};
/* material: vertex colour × per-instance colour picked by the slot stored in aGlow; slot 5 samples the face atlas, whose alpha
   says skin (1, × iSkin), hair (.5, × iHair) or fixed colour (0: eyes, lashes, lipstick); aMorph × iShape reshapes the head */
C.walkerMat = function () {
  const A = C.faceAtlas(), N = A.N.toFixed(1), N1 = (A.N - 1).toFixed(1), pad = A.pad.toFixed(4), sc = (1 - 2 * A.pad).toFixed(4);
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .8 });
  m.onBeforeCompile = sh => {
    sh.uniforms.uFaces = { value: A.tex };
    sh.vertexShader = 'attribute vec3 aSlot; attribute vec3 iSkin; attribute vec3 iShirt; attribute vec3 iPants; attribute vec3 iHair; attribute float iFace; attribute vec4 iShape; attribute vec4 aMorph;\nvarying vec3 vSkinT; varying vec3 vHairT; varying vec2 vFUV; varying float vFace;\n' + sh.vertexShader
      .replace('#include <begin_vertex>', `#include <begin_vertex>
      if (dot(aMorph, aMorph) > 0.0) transformed += normalize(position) * dot(aMorph, iShape);`)
      .replace('#include <color_vertex>', `#include <color_vertex>
      vec3 tint = vec3(1.0); float aGlow = aSlot.x;
      if (aGlow > .5 && aGlow < 1.5) tint = iSkin; else if (aGlow > 1.5 && aGlow < 2.5) tint = iShirt; else if (aGlow > 2.5 && aGlow < 3.5) tint = iPants; else if (aGlow > 3.5 && aGlow < 4.5) tint = iHair;
      vColor.xyz *= tint;
      vFace = aGlow > 4.5 ? 1.0 : 0.0; vSkinT = iSkin; vHairT = iHair;
      vFUV = (vec2(mod(iFace, ${N}), ${N1} - floor(iFace / ${N})) + ${pad} + aSlot.yz * ${sc}) / ${N};`);
    sh.fragmentShader = 'uniform sampler2D uFaces; varying vec3 vSkinT; varying vec3 vHairT; varying vec2 vFUV; varying float vFace;\n' + sh.fragmentShader
      .replace('#include <color_fragment>', `#include <color_fragment>
      if (vFace > .5) { vec4 ft = texture2D(uFaces, vFUV); vec3 hairT = vHairT * 1.26;
        vec3 tint = ft.a > .5 ? mix(hairT, vSkinT, ft.a * 2.0 - 1.0) : mix(vec3(1.0), hairT, ft.a * 2.0);
        diffuseColor.rgb *= pow(ft.rgb, vec3(2.2)) * tint; }`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
      if (vFace > .5) roughnessFactor = .72;`);
  };
  m.customProgramCacheKey = () => 'walker3'; m.userData.lin = 1; return m;
};
})(window.AV);
