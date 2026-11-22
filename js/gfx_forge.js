/* APEVERSE V0.9.6 - js/gfx_forge.js : the "asset forge" for the cinematic Astro-9 prototype.
   Plain three.js r128, no other AV dependency, so tools/forge.html can run the very same code to write GLB files.
   - F.mosaic(N, o)   trencadís mosaic textures (colour + normal + roughness maps), seamless, cached
   - F.tower()        Gaudí-style spiral tower: named meshes/materials  mosaic | stone | neon | chrome | glow
   - F.lamp(), F.bench(a0, a1, r0)   plaza dressing (twisted lamp post, serpentine mosaic bench)
   - F.alien(key)     a rigged alien: SkinnedMesh + 16-bone skeleton + Idle / Walk / Dance / Wave clips
   - F.dress(root, o) swaps placeholder materials (matched by NAME) for the runtime PBR materials.
   The game uses these functions as the procedural fallback; tools/forge_glb.ps1 exports them to assets/models/astro9/*.glb.
   A Blender GLB that uses the same material names (and, for characters, bone + clip names) drops in unchanged. */
'use strict';
(function (root) {
const AV = root.AV = root.AV || {};
const F = AV.forge = {}, TAU = Math.PI * 2;
const rng = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
const lin = h => new THREE.Color(h).convertSRGBToLinear();
const ph = (name, hex, o) => { const m = new THREE.MeshStandardMaterial(Object.assign({ color: lin(hex), roughness: .6, metalness: 0 }, o || {})); m.name = name; return m };
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const Mx = (x, y, z, sx, sy, sz, rx, ry, rz) => new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0)), V(sx == null ? 1 : sx, sy == null ? (sx == null ? 1 : sx) : sy, sz == null ? (sx == null ? 1 : sx) : sz));
F.uvScale = (g, su, sv) => { const u = g.attributes.uv; for (let i = 0; i < u.count; i++) u.setXY(i, u.getX(i) * su, u.getY(i) * (sv == null ? su : sv)); return g };

/* ---------- merge indexed geometries (position/normal/uv); optional skin binding + material groups ----------
   list: [{ g, m (Matrix4, optional), bone (index, optional), mat (group index, optional) }] */
F.merge = function (list) {
  const items = list.map(e => { let g = e.g.index ? e.g : null; if (!g) { g = e.g.clone(); const n = g.attributes.position.count, ix = []; for (let i = 0; i < n; i++) ix.push(i); g.setIndex(ix) } else g = g.clone(); if (e.m) g.applyMatrix4(e.m); if (!g.attributes.normal) g.computeVertexNormals(); return { g, bone: e.bone, mat: e.mat || 0 } });
  items.sort((a, b) => a.mat - b.mat);
  let nv = 0; items.forEach(e => nv += e.g.attributes.position.count);
  const P = new Float32Array(nv * 3), N = new Float32Array(nv * 3), U = new Float32Array(nv * 2), I = [], skin = items.some(e => e.bone != null);
  const SI = skin ? new Uint16Array(nv * 4) : null, SW = skin ? new Float32Array(nv * 4) : null, out = new THREE.BufferGeometry();
  let o = 0, gStart = 0, gMat = items.length ? items[0].mat : 0;
  for (const e of items) {
    const g = e.g, n = g.attributes.position.count;
    if (e.mat !== gMat) { out.addGroup(gStart, I.length - gStart, gMat); gStart = I.length; gMat = e.mat }
    P.set(g.attributes.position.array, o * 3); N.set(g.attributes.normal.array, o * 3); if (g.attributes.uv) U.set(g.attributes.uv.array, o * 2);
    const ix = g.index.array; for (let i = 0; i < ix.length; i++) I.push(ix[i] + o);
    if (skin) for (let i = 0; i < n; i++) { SI[(o + i) * 4] = e.bone || 0; SW[(o + i) * 4] = 1 }
    o += n;
  }
  out.addGroup(gStart, I.length - gStart, gMat);
  out.setAttribute('position', new THREE.BufferAttribute(P, 3)); out.setAttribute('normal', new THREE.BufferAttribute(N, 3)); out.setAttribute('uv', new THREE.BufferAttribute(U, 2));
  if (skin) { out.setAttribute('skinIndex', new THREE.BufferAttribute(SI, 4)); out.setAttribute('skinWeight', new THREE.BufferAttribute(SW, 4)) }
  out.setIndex(nv > 65535 ? new THREE.BufferAttribute(new Uint32Array(I), 1) : new THREE.BufferAttribute(new Uint16Array(I), 1));
  out.computeBoundingSphere(); return out;
};

/* surface of revolution with a free radius function fn(v, theta) -> [r, y]; seam normals welded */
function revolve(rows, segs, fn, us, vs) {
  const pos = [], uv = [], idx = [];
  for (let j = 0; j <= rows; j++) { const v = j / rows; for (let i = 0; i <= segs; i++) { const u = i / segs, th = u * TAU, ry = fn(v, th); pos.push(Math.cos(th) * ry[0], ry[1], Math.sin(th) * ry[0]); uv.push(u * us, v * vs) } }
  for (let j = 0; j < rows; j++) for (let i = 0; i < segs; i++) { const a = j * (segs + 1) + i, b = a + 1, c = a + segs + 1, d = c + 1; idx.push(a, c, b, b, c, d) }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const nr = g.attributes.normal; for (let j = 0; j <= rows; j++) { const a = j * (segs + 1), b = a + segs, x = nr.getX(a) + nr.getX(b), y = nr.getY(a) + nr.getY(b), z = nr.getZ(a) + nr.getZ(b), l = Math.hypot(x, y, z) || 1; nr.setXYZ(a, x / l, y / l, z / l); nr.setXYZ(b, x / l, y / l, z / l) }
  return g;
}

/* ======================= trencadís mosaic (broken-tile shards, grout, per-shard tilt) ======================= */
F.PAL = { gaudi: ['#1d4fb5', '#2f86dc', '#1fb3c4', '#f3c42f', '#ec6a2a', '#d8344a', '#f6f1e4', '#f6f1e4', '#43a86a', '#ff4ad2', '#7ff0ff'],
  sand: ['#e9dcc0', '#d8c39a', '#c9a878', '#f2ead8', '#9fc6d8', '#e8b8a0', '#5a8ad0', '#f2ead8'] };
const MC = {};
F.mosaic = function (N, o) {
  o = o || {}; const pal = F.PAL[o.pal || 'gaudi'], n = o.cells || 12, key = [N, o.pal, n, o.seed].join();
  if (MC[key]) return MC[key];
  const R = rng(o.seed || 11), K = n * n, sx = new Float32Array(K), sy = new Float32Array(K), cr = new Float32Array(K * 3), tx = new Float32Array(K), ty = new Float32Array(K), ro = new Float32Array(K);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const k = j * n + i, c = new THREE.Color(pal[R() * pal.length | 0]), v = .84 + R() * .22; sx[k] = (i + .1 + R() * .8) / n; sy[k] = (j + .1 + R() * .8) / n; cr[k * 3] = c.r * v; cr[k * 3 + 1] = c.g * v; cr[k * 3 + 2] = c.b * v; tx[k] = (R() - .5) * .6; ty[k] = (R() - .5) * .6; ro[k] = .1 + R() * .22 }
  const H = new Float32Array(N * N), cols = new Uint8ClampedArray(N * N * 4), rough = new Uint8ClampedArray(N * N * 4), gw = o.grout || .055, G = [.62, .6, .57];
  for (let py = 0; py < N; py++) { const v = (py + .5) / N, cj = Math.floor(v * n);
    for (let px = 0; px < N; px++) { const u = (px + .5) / N, ci = Math.floor(u * n); let d1 = 9, d2 = 9, b = 0, bx = 0, by = 0;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const ii = ci + di, jj = cj + dj, wi = (ii + n) % n, wj = (jj + n) % n, k = wj * n + wi, x = sx[k] + (ii - wi) / n, y = sy[k] + (jj - wj) / n, d = (x - u) * (x - u) + (y - v) * (y - v);
        if (d < d1) { d2 = d1; d1 = d; b = k; bx = x; by = y } else if (d < d2) d2 = d }
      const e = (Math.sqrt(d2) - Math.sqrt(d1)) * n, t0 = Math.min(1, Math.max(0, (e - gw) / .07)), t = t0 * t0 * (3 - 2 * t0), lu = (u - bx) * n, lv = (v - by) * n, sh = .94 + .12 * (lu + .5) * .5;
      const p = py * N + px; H[p] = t * (1 + tx[b] * lu + ty[b] * lv) * .5 + t * .5;
      cols[p * 4] = 255 * (G[0] + (cr[b * 3] * sh - G[0]) * t); cols[p * 4 + 1] = 255 * (G[1] + (cr[b * 3 + 1] * sh - G[1]) * t); cols[p * 4 + 2] = 255 * (G[2] + (cr[b * 3 + 2] * sh - G[2]) * t); cols[p * 4 + 3] = 255;
      const r = .95 + (ro[b] - .95) * t; rough[p * 4] = rough[p * 4 + 1] = rough[p * 4 + 2] = 255 * r; rough[p * 4 + 3] = 255 } }
  const nrm = new Uint8ClampedArray(N * N * 4), s = 2.2 * N / 1024;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const h = (xx, yy) => H[((yy + N) % N) * N + (xx + N) % N], dx = h(x + 1, y) - h(x - 1, y), dy = h(x, y + 1) - h(x, y - 1), nx = -dx * s, ny = dy * s, l = Math.hypot(nx, ny, 1), p = (y * N + x) * 4;
    nrm[p] = (nx / l * .5 + .5) * 255; nrm[p + 1] = (ny / l * .5 + .5) * 255; nrm[p + 2] = (1 / l * .5 + .5) * 255; nrm[p + 3] = 255 }
  const tex = (data, srgb) => { const cv = document.createElement('canvas'); cv.width = cv.height = N; cv.getContext('2d').putImageData(new ImageData(data, N, N), 0, 0); const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; if (srgb) t.encoding = THREE.sRGBEncoding; t.userData = { keep: true }; return t };
  return MC[key] = { map: tex(cols, true), normalMap: tex(nrm), roughnessMap: tex(rough) };
};

/* ======================= spiral tower (16 m, Sagrada-Família-like spire, neon helix, chrome crown) ======================= */
const TH = 16, towerR = y => { if (y < 2.2) return 3.0 - y * .08; const t = (y - 2.2) / (TH - 2.2); return .22 + 2.62 * Math.pow(Math.max(0, 1 - Math.pow(t, 1.6)), .8) };
F.TOWER = { H: TH, footprint: 4.7 };
F.tower = function (det) {
  det = det || 1; const grp = new THREE.Group(); grp.name = 'spiral_tower';
  const shell = revolve(Math.round(96 * det), Math.round(72 * det), (v, th) => { const y = v * TH, t = Math.max(0, (y - 2.2) / (TH - 2.2)); let r = towerR(y);
    if (y > 2.2) r += (.17 * Math.pow(Math.max(0, Math.cos(7 * th - t * 15)), 5) + .1 * Math.pow(Math.max(0, Math.sin(t * TAU * 4.5)), 10)) * (1 - t * .6);
    else r += .08 * Math.pow(Math.max(0, Math.cos(12 * th)), 8);
    return [r, y] }, 9, 8);
  const bulb = F.uvScale(new THREE.SphereGeometry(.75, 24, 16), 3, 2);
  const mosaic = F.merge([{ g: shell }, { g: bulb, m: Mx(0, TH - .1, 0) }]);
  const pts = []; for (let i = 0; i <= 360; i++) { const s = i / 360, y = 2.6 + s * (TH - 4.4), th = s * 4.5 * TAU, r = towerR(y) + .21; pts.push(V(Math.cos(th) * r, y, Math.sin(th) * r)) }
  const neon = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), Math.round(360 * det), .055, 6, false);
  const st = [{ g: new THREE.CylinderGeometry(3.5, 3.65, .35, 64), m: Mx(0, .175, 0) }, { g: new THREE.TorusGeometry(2.96, .16, 8, 72), m: Mx(0, 2.25, 0, 1, 1, 1, Math.PI / 2) }];
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .26, c = Math.cos(a), s = Math.sin(a), cv = new THREE.QuadraticBezierCurve3(V(c * 4.45, 0, s * 4.45), V(c * 4.35, 2.0, s * 4.35), V(c * 2.98, 2.85, s * 2.98));
    st.push({ g: new THREE.TubeGeometry(cv, 16, .2, 8, false) }, { g: new THREE.SphereGeometry(.32, 12, 8), m: Mx(c * 4.45, .12, s * 4.45, 1, .5, 1) }) }
  const stone = F.merge(st);
  const chrome = new THREE.SphereGeometry(.42, 32, 20).translate(0, TH + .85, 0);
  const gl = [[.55, 0], [-.55, 0], [0, .55], [0, -.55]].map(p => ({ g: new THREE.SphereGeometry(.12, 12, 8), m: Mx(p[0], TH + .85, p[1]) }));
  gl.push({ g: new THREE.SphereGeometry(.14, 12, 8), m: Mx(0, TH + 1.48, 0) }); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; gl.push({ g: new THREE.SphereGeometry(.07, 8, 6), m: Mx(Math.cos(a) * .8, TH - .1, Math.sin(a) * .8) }) }
  const glow = F.merge(gl);
  [['shell', mosaic, ph('mosaic', '#3a7ad8')], ['ribs', stone, ph('stone', '#cfc2a8')], ['helix', neon, ph('neon', '#ff4ad2')], ['crown', chrome, ph('chrome', '#eef0ff', { metalness: 1, roughness: .1 })], ['lights', glow, ph('glow', '#7ff0ff')]]
    .forEach(([n, g, m]) => { const o = new THREE.Mesh(g, m); o.name = n; grp.add(o) });
  return grp;
};

/* twisted lamp post (Gaudí-like), returns one Group with chrome / stone / glow meshes */
F.lamp = function () {
  const tw = []; for (let k = 0; k < 3; k++) { const pts = []; for (let i = 0; i <= 40; i++) { const s = i / 40, a = k / 3 * TAU + s * 2.2 * TAU, r = .1 * (1 - s * .3); pts.push(V(Math.cos(a) * r, .3 + s * 3.1, Math.sin(a) * r)) } tw.push({ g: new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, .035, 5, false) }) }
  const g = new THREE.Group(); g.name = 'lamp';
  [[F.merge(tw), ph('chrome', '#eef0ff')], [F.merge([{ g: new THREE.CylinderGeometry(.22, .3, .3, 12), m: Mx(0, .15, 0) }, { g: new THREE.CylinderGeometry(.16, .1, .14, 12), m: Mx(0, 3.42, 0) }]), ph('stone', '#cfc2a8')],
   [new THREE.SphereGeometry(.2, 16, 12).translate(0, 3.66, 0), ph('glow', '#ffd8a0')]].forEach(([geo, m]) => g.add(new THREE.Mesh(geo, m)));
  return g;
};

/* serpentine bench swept along an arc (Park Güell homage), plaza-local coordinates, mosaic ball at each end */
F.bench = function (a0, a1, r0) {
  const prof = [[-.38, 0], [-.4, .38], [-.36, .46], [.12, .46], [.2, .5], [.26, .9], [.34, 1.0], [.44, .96], [.46, .5], [.44, 0]], pl = [0];
  for (let i = 1; i < prof.length; i++) pl.push(pl[i - 1] + Math.hypot(prof[i][0] - prof[i - 1][0], prof[i][1] - prof[i - 1][1]));
  const rad = a => r0 + .3 * Math.sin(5 * a), steps = Math.max(8, Math.round(Math.abs(a1 - a0) * r0 / .14)), pos = [], uv = [], idx = []; let L = 0, px = null, pz = null;
  for (let s = 0; s <= steps; s++) { const a = a0 + (a1 - a0) * s / steps, r = rad(a), c = Math.cos(a), sn = Math.sin(a), cx = c * r, cz = sn * r; if (px != null) L += Math.hypot(cx - px, cz - pz); px = cx; pz = cz;
    prof.forEach((p, k) => { pos.push(cx + c * p[0], p[1], cz + sn * p[0]); uv.push(L, pl[k]) }) }
  const w = prof.length; for (let s = 0; s < steps; s++) for (let k = 0; k < w - 1; k++) { const a = s * w + k, b = a + 1, c = a + w, d = c + 1; idx.push(a, b, c, b, d, c) }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const ends = [a0, a1].map(a => ({ g: F.uvScale(new THREE.SphereGeometry(.5, 20, 14), 2, 1), m: Mx(Math.cos(a) * rad(a), .5, Math.sin(a) * rad(a)) }));
  const m = new THREE.Mesh(F.merge([{ g }].concat(ends)), ph('mosaic2', '#e9dcc0')); m.name = 'bench';
  m.userData.path = []; for (let s = 0; s <= steps; s += 4) { const a = a0 + (a1 - a0) * s / steps; m.userData.path.push([Math.cos(a) * rad(a), Math.sin(a) * rad(a)]) }
  return m;
};

/* ======================= rigged aliens ======================= */
F.ALIENS = {
  zib: { name: 'Zib', thigh: .46, shin: .44, spine: .14, chest: .27, neck: .2, uarm: .33, farm: .31, sh: .2, hw: .1, body: [.16, .2, .12], head: [.27, .36, .28], skin: '#86d0b4', suit: '#262a4a', glow: '#7ff0ff', eye: '#04050a', oneEye: false },
  orbo: { name: 'Orbo', thigh: .24, shin: .23, spine: .12, chest: .26, neck: .06, uarm: .22, farm: .2, sh: .31, hw: .13, body: [.3, .3, .27], head: [.3, .28, .28], skin: '#b07aff', suit: '#ff6ad5', glow: '#ffd84a', eye: '#04050a', oneEye: true }
};
F.ALIENS.zib.hip = F.ALIENS.zib.thigh + F.ALIENS.zib.shin + .07; F.ALIENS.orbo.hip = F.ALIENS.orbo.thigh + F.ALIENS.orbo.shin + .07;
F.WALK_SWING = .45;
F.alien = function (key) {
  const S = typeof key === 'string' ? F.ALIENS[key] : key, B = {}, list = [];
  const bone = (name, parent, x, y, z) => { const b = new THREE.Bone(); b.name = name; b.position.set(x, y, z); if (parent) B[parent].add(b); B[name] = b; b.userData.i = list.length; list.push(b); return b };
  bone('root', null, 0, 0, 0); bone('hips', 'root', 0, S.hip, 0); bone('spine', 'hips', 0, S.spine, 0); bone('chest', 'spine', 0, S.chest, 0); bone('neck', 'chest', 0, .04, 0); bone('head', 'neck', 0, S.neck, 0);
  bone('antL', 'head', -.1, S.head[1] * .78, -.03); bone('antR', 'head', .1, S.head[1] * .78, -.03);
  for (const [sd, s] of [['L', -1], ['R', 1]]) { bone('uArm' + sd, 'chest', s * S.sh, -.02, 0); bone('fArm' + sd, 'uArm' + sd, 0, -S.uarm, 0); bone('thigh' + sd, 'hips', s * S.hw, -.03, 0); bone('shin' + sd, 'thigh' + sd, 0, -S.thigh, 0) }
  B.root.updateMatrixWorld(true);
  const wp = (n, x, y, z) => B[n].getWorldPosition(V(0, 0, 0)).add(V(x || 0, y || 0, z || 0)), MI = { skin: 0, suit: 1, eye: 2, glow: 3 }, parts = [], SPH = new THREE.SphereGeometry(1, 18, 12);
  const sph = (b, mat, p, s, r) => parts.push({ g: SPH, bone: B[b].userData.i, mat: MI[mat], m: new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromEuler(new THREE.Euler(...(r || [0, 0, 0]))), Array.isArray(s) ? V(...s) : V(s, s, s)) });
  const seg = (b, mat, a, c, r0, r1) => { const d = c.clone().sub(a), L = d.length(), q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.clone().normalize()); parts.push({ g: new THREE.CylinderGeometry(r1, r0, L, 12, 1, true), bone: B[b].userData.i, mat: MI[mat], m: new THREE.Matrix4().compose(a.clone().add(d.multiplyScalar(.5)), q, V(1, 1, 1)) }) };
  const ring = (b, mat, p, sx, sz, tube) => parts.push({ g: new THREE.TorusGeometry(1, tube, 6, 40), bone: B[b].userData.i, mat: MI[mat], m: new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)), V(sx, sz, 1)) });
  /* torso */
  sph('hips', 'suit', wp('hips', 0, .02, 0), [S.body[0] * .92, .14, S.body[2] * 1.02]); ring('hips', 'glow', wp('hips', 0, .05, 0), S.body[0] * .95, S.body[2] * 1.06, .012);
  seg('spine', 'suit', wp('hips', 0, .04, 0), wp('chest', 0, -.08, 0), S.body[0] * .8, S.body[0] * .95);
  sph('chest', 'suit', wp('chest', 0, -.06, 0), S.body); ring('chest', 'glow', wp('chest', 0, -.1, 0), S.body[0] * 1.02, S.body[2] * 1.04, .013);
  /* neck + head */
  seg('neck', 'skin', wp('neck', 0, -.05, 0), wp('head', 0, .08, 0), .05, .045);
  sph('head', 'skin', wp('head', 0, S.head[1] * .45, 0), S.head, [-.12, 0, 0]); sph('head', 'skin', wp('head', 0, .02, S.head[2] * .35), [S.head[0] * .5, S.head[1] * .35, S.head[2] * .5]);
  if (S.oneEye) { sph('head', 'eye', wp('head', 0, S.head[1] * .5, S.head[2] * .8), [.15, .15, .08]); parts.push({ g: new THREE.TorusGeometry(1, .12, 6, 40), bone: B.head.userData.i, mat: MI.glow, m: new THREE.Matrix4().compose(wp('head', 0, S.head[1] * .5, S.head[2] * .87), new THREE.Quaternion(), V(.155, .155, .155)) }) }
  else for (const s of [-1, 1]) sph('head', 'eye', wp('head', s * S.head[0] * .42, S.head[1] * .45, S.head[2] * .8), [.105, .058, .05], [0, s * .35, s * .42]);
  sph('head', 'glow', wp('head', 0, S.head[1] * .08, S.head[2] * .78), [.05, .008, .01]);
  for (const a of ['antL', 'antR']) { const s = a === 'antL' ? -1 : 1, top = wp(a, s * .06, .26, 0); seg(a, 'skin', wp(a, 0, -.06, 0), top, .014, .01); sph(a, 'glow', top, .048) }
  /* arms + legs */
  for (const [sd, s] of [['L', -1], ['R', 1]]) {
    const sh = wp('uArm' + sd), el = wp('fArm' + sd), hd = wp('fArm' + sd, 0, -S.farm, 0);
    sph('uArm' + sd, 'suit', sh, .07); seg('uArm' + sd, 'suit', sh, el, .055, .045); sph('fArm' + sd, 'skin', el, .042); seg('fArm' + sd, 'skin', el, hd, .04, .03);
    sph('fArm' + sd, 'skin', hd.clone().add(V(0, -.04, 0)), [.05, .065, .035]); for (const f of [-1, 0, 1]) seg('fArm' + sd, 'skin', hd.clone().add(V(f * .025, -.08, 0)), hd.clone().add(V(f * .04, -.17, .01)), .012, .009);
    const hp = wp('thigh' + sd), kn = wp('shin' + sd), an = wp('shin' + sd, 0, -S.shin, 0);
    seg('thigh' + sd, 'suit', hp, kn, .078, .06); sph('shin' + sd, 'suit', kn, .062); seg('shin' + sd, 'suit', kn, an.clone().add(V(0, .03, 0)), .056, .046);
    sph('shin' + sd, 'suit', an.clone().add(V(0, .035, .05)), [.068, .05, .125]); sph('shin' + sd, 'glow', an.clone().add(V(0, .05, .165)), [.03, .014, .02]);
  }
  const geo = F.merge(parts), mats = [ph('skin', S.skin, { roughness: .45 }), ph('suit', S.suit, { roughness: .35, metalness: .4 }), ph('eye', S.eye, { roughness: .05 }), ph('glow', S.glow)];
  mats.forEach(m => m.skinning = true);
  const mesh = new THREE.SkinnedMesh(geo, mats); mesh.name = S.name + '_body'; mesh.add(B.root); B.root.updateMatrixWorld(true); mesh.bind(new THREE.Skeleton(list));
  const g = new THREE.Group(); g.name = S.name; g.add(mesh);
  return { root: g, clips: F.alienClips(S) };
};
/* procedural keyframed clips: fn(angle 0..2pi over the clip) -> { bone: [rx, ry, rz], hipsY } */
F.alienClips = function (S) {
  const E = new THREE.Euler(), Qt = new THREE.Quaternion(), sw = F.WALK_SWING, pos = x => Math.max(0, x);
  const make = (name, dur, steps, fn) => { const T = [], data = {}; for (let i = 0; i <= steps; i++) { const p = i / steps, f = fn(p * TAU); T.push(+(p * dur).toFixed(5)); for (const k in f) (data[k] = data[k] || []).push(f[k]) }
    const tracks = []; for (const k in data) { if (k === 'hipsY') { tracks.push(new THREE.VectorKeyframeTrack('hips.position', T, [].concat(...data[k].map(y => [0, y, 0])))); continue }
      const vals = []; for (const e of data[k]) { Qt.setFromEuler(E.set(e[0] || 0, e[1] || 0, e[2] || 0)); vals.push(Qt.x, Qt.y, Qt.z, Qt.w) } tracks.push(new THREE.QuaternionKeyframeTrack(k + '.quaternion', T, vals)) }
    return new THREE.AnimationClip(name, dur, tracks) };
  const rest = { uArmL: [0, 0, -.12], uArmR: [0, 0, .12], fArmL: [-.25, 0, 0], fArmR: [-.25, 0, 0] };
  return [
    make('Idle', 3, 24, p => Object.assign({}, rest, { chest: [Math.sin(p) * .03, 0, 0], head: [Math.sin(p) * .04, Math.sin(p) * .25, 0], antL: [Math.sin(2 * p) * .15, 0, Math.sin(p) * .1], antR: [Math.sin(2 * p + 1) * .15, 0, -Math.sin(p) * .1],
      uArmL: [0, 0, -.12 - Math.sin(p) * .03], uArmR: [0, 0, .12 + Math.sin(p) * .03], hipsY: S.hip - .008 * (1 + Math.sin(2 * p)) })),
    make('Walk', 1, 16, p => { const s = Math.sin(p); return { thighL: [-sw * s, 0, 0], thighR: [sw * s, 0, 0], shinL: [.08 + .6 * Math.pow(pos(Math.cos(p)), 1.5), 0, 0], shinR: [.08 + .6 * Math.pow(pos(-Math.cos(p)), 1.5), 0, 0],
      uArmL: [.42 * s, 0, -.1], uArmR: [-.42 * s, 0, .1], fArmL: [-.35, 0, 0], fArmR: [-.35, 0, 0], hips: [0, .12 * s, 0], spine: [.06, -.18 * s, 0], head: [0, .08 * s, 0],
      antL: [.25 * Math.sin(2 * p), 0, 0], antR: [.25 * Math.sin(2 * p + .8), 0, 0], hipsY: S.hip - .035 * (1 - Math.cos(2 * p)) / 2 } }),
    make('Dance', 4 * 60 / 124, 32, p => { const b = .5 + .5 * Math.cos(4 * p), s2 = Math.sin(2 * p); return { hipsY: S.hip - .07 * b, thighL: [-.38 * b, 0, -.08], thighR: [-.38 * b, 0, .08], shinL: [.75 * b, 0, 0], shinR: [.75 * b, 0, 0],
      uArmL: [-.3 * s2, 0, -(1.3 + (.5 + .5 * s2))], uArmR: [.3 * s2, 0, 1.3 + (.5 - .5 * s2)], fArmL: [-.6, 0, -.4 * Math.sin(4 * p)], fArmR: [-.6, 0, .4 * Math.sin(4 * p + 1)],
      hips: [0, .35 * s2, 0], spine: [0, -.15 * s2, .1 * s2], chest: [.06 * b, 0, 0], head: [.18 * b, -.2 * s2, .12 * s2], antL: [.4 * Math.sin(4 * p + 1), 0, .3 * s2], antR: [.4 * Math.sin(4 * p + 2), 0, -.3 * s2] } }),
    make('Wave', 2, 24, p => ({ uArmL: [0, 0, -.12], fArmL: [-.25, 0, 0], uArmR: [-.25, 0, 2.5], fArmR: [0, 0, .55 * Math.sin(3 * p)], head: [0, .1 * Math.sin(p), .12], chest: [0, .08, 0],
      antL: [.3 * Math.sin(3 * p), 0, 0], antR: [.3 * Math.sin(3 * p + 1), 0, 0], hipsY: S.hip }))
  ];
};

/* ======================= runtime materials (by name) ======================= */
F.runtimeMat = function (src, o) {
  const name = (src.name || '').toLowerCase().replace(/[._]\d+$/, ''), c = src.color ? src.color.clone() : new THREE.Color(1, 1, 1); let m;
  if (name === 'mosaic' || name === 'mosaic2') { const two = name === 'mosaic2', t = F.mosaic(o.tex || 1024, { pal: two ? 'sand' : 'gaudi', cells: two ? 10 : 12, seed: two ? 5 : 11 });
    m = new THREE.MeshStandardMaterial({ map: t.map, normalMap: t.normalMap, roughnessMap: t.roughnessMap, roughness: 1, metalness: 0, side: two ? THREE.DoubleSide : THREE.FrontSide }) }
  else if (name === 'stone') m = new THREE.MeshStandardMaterial({ color: c, roughness: .82, metalness: 0 });
  else if (name === 'chrome') m = new THREE.MeshStandardMaterial({ color: c, roughness: .07, metalness: 1 });
  else if (name === 'neon' || name === 'glow') { m = new THREE.MeshBasicMaterial({ color: c.clone() }); m.userData.glowBase = c.clone(); m.userData.glowK = name === 'neon' ? 5 : 3.2 }
  else if (name === 'eye') m = new THREE.MeshStandardMaterial({ color: c, roughness: .04, metalness: .2 });
  else if (name === 'skin') m = new THREE.MeshStandardMaterial({ color: c, roughness: .42, metalness: .05 });
  else if (name === 'suit') m = new THREE.MeshStandardMaterial({ color: c, roughness: .3, metalness: .55 });
  else return src;
  m.name = name; m.userData.lin = 1; m.userData.forge = 1; return m;
};
F.dress = function (root, o) {
  o = o || {}; const made = [];
  root.traverse(m => { if (!m.isMesh) return; const arr = Array.isArray(m.material), ms = arr ? m.material : [m.material];
    const out = ms.map(src => { const r = F.runtimeMat(src, o); if (r !== src) { if (src.dispose) src.dispose(); made.push(r) } r.skinning = !!m.isSkinnedMesh; r.userData.lin = 1; return r });
    m.material = arr ? out : out[0]; m.castShadow = !!o.shadow; m.receiveShadow = !m.isSkinnedMesh });
  return made;
};
})(window);
