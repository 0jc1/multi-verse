/* APEVERSE V0.9.1 - world_kit.js : shared building blocks for richer worlds.
   - AV.terrain (moved here from world_verdalux.js; same signature)
   - merged + instanced psychedelic flora (1 draw call per species, wind sway + night glow in the shader)
   - painted sky dome, iridescent water, waterfalls, fireflies/spores, hand-drawn signs, floating name tags, lantern strings
   Everything is procedural (works from file:// and on phones). */
'use strict';
(function (AV) {
const TAU = AV.TAU, K = AV.kit = {};
const _o = new THREE.Object3D(), _c = new THREE.Color();
K.M = (x, y, z, sx, sy, sz, rx, ry, rz) => { _o.position.set(x, y, z); _o.rotation.set(rx || 0, ry || 0, rz || 0); _o.scale.set(sx == null ? 1 : sx, sy == null ? (sx == null ? 1 : sx) : sy, sz == null ? (sx == null ? 1 : sx) : sz); _o.updateMatrix(); return _o.matrix.clone() };
K.q = () => (AV.S && AV.S.set && { Low: 0, Medium: 1, High: 2 }[AV.S.set.gq]) ?? 2;
K.n = base => Math.round(base * [.6, 1.3, 2][K.q()]);   // vegetation density by graphics quality

/* ---------------- terrain (unchanged behaviour) ---------------- */
AV.terrain = function (ctx, size, seg, fn, colfn) {
  const g = new THREE.PlaneGeometry(size, size, seg, seg); g.rotateX(-Math.PI / 2); const pos = g.attributes.position, col = new Float32Array(pos.count * 3), c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), z = pos.getZ(i), h = fn(x, z); pos.setY(i, h); c.setHex(colfn(x, z, h)).convertSRGBToLinear(); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals(); const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .95, flatShading: false })); m.receiveShadow = true; ctx.group.add(m); return m;
};

/* ---------------- geometry merge with per-part colour + glow ---------------- */
const BG = { sph: new THREE.SphereGeometry(1, 10, 8), hem: new THREE.SphereGeometry(1, 12, 6, 0, TAU, 0, Math.PI / 2), cyl: new THREE.CylinderGeometry(1, 1, 1, 8), cone: new THREE.ConeGeometry(1, 1, 8),
  ico: new THREE.IcosahedronGeometry(1, 1), oct: new THREE.OctahedronGeometry(1, 0), dod: new THREE.DodecahedronGeometry(1, 0), box: new THREE.BoxGeometry(1, 1, 1), tcyl: new THREE.CylinderGeometry(.7, 1, 1, 8),
  /* low-poly variants for small, numerous plants (keeps triangle counts phone-friendly) */
  sphL: new THREE.SphereGeometry(1, 7, 5), hemL: new THREE.SphereGeometry(1, 9, 4, 0, TAU, 0, Math.PI / 2), cylL: new THREE.CylinderGeometry(1, 1, 1, 5, 1, true), coneL: new THREE.ConeGeometry(1, 1, 5, 1, true), tcylL: new THREE.CylinderGeometry(.7, 1, 1, 6, 1, true), ico0: new THREE.IcosahedronGeometry(1, 0) };
K.BG = BG;
/* parts: [geometry, hexColour, Matrix4, glow(0..1)] */
K.merge = function (parts) {
  let n = 0; const gs = parts.map(p => { const q = p[0].index ? p[0].toNonIndexed() : p[0].clone(); if (p[2]) q.applyMatrix4(p[2]); n += q.attributes.position.count; return [q, p[1], p[3] || 0] });
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 3), glw = new Float32Array(n), uv = new Float32Array(n * 2); let o = 0;
  for (const [q, hex, gl] of gs) { const k = q.attributes.position.count; pos.set(q.attributes.position.array, o * 3); if (!q.attributes.normal) q.computeVertexNormals(); nor.set(q.attributes.normal.array, o * 3); if (q.attributes.uv) uv.set(q.attributes.uv.array, o * 2); _c.setHex(hex).convertSRGBToLinear(); for (let i = 0; i < k; i++) { col[(o + i) * 3] = _c.r; col[(o + i) * 3 + 1] = _c.g; col[(o + i) * 3 + 2] = _c.b; glw[o + i] = gl } o += k; q.dispose() }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setAttribute('aGlow', new THREE.BufferAttribute(glw, 1)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.computeBoundingSphere(); return g;
};

/* ---------------- shared animated uniforms ---------------- */
const U = K.U = { time: { value: 0 }, glow: { value: .3 } };
/* vertex-coloured standard material with wind sway (by local height) and night glow (per-vertex aGlow) */
K.floraMat = function (sway, opt) {
  opt = opt || {}; const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: opt.rough == null ? .72 : opt.rough, metalness: opt.metal || 0, flatShading: !!opt.flat, side: opt.double ? THREE.DoubleSide : THREE.FrontSide });
  if (opt.map) m.map = opt.map;
  return K.swayify(m, sway, opt);
};
/* add wind sway (by local height) + night glow (aGlow attribute) to any MeshStandardMaterial, incl. GLB model materials */
K.swayify = function (m, sway, opt) {
  opt = opt || {}; const sw = { value: sway || 0 }; m.userData.sway = sway || 0;
  m.onBeforeCompile = sh => {
    sh.uniforms.uTime = U.time; sh.uniforms.uGlow = U.glow; sh.uniforms.uSway = sw;
    sh.vertexShader = 'uniform float uTime;uniform float uSway;attribute float aGlow;varying float vGlow;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      vGlow = aGlow;
      #ifdef USE_INSTANCING
        vec3 ip = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
      #else
        vec3 ip = vec3(0.0);
      #endif
      float hh = max(position.y, 0.0);
      transformed.x += (sin(uTime*1.3 + ip.x*.35 + ip.z*.27)*.6 + sin(uTime*2.9 + ip.x*.8)*.22) * hh * hh * uSway;
      transformed.z += cos(uTime*1.1 + ip.z*.33) * .45 * hh * hh * uSway;`);
    sh.fragmentShader = 'uniform float uGlow;varying float vGlow;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      #ifdef USE_COLOR
        totalEmissiveRadiance += vColor.rgb * vGlow * uGlow;
      #endif`);
  };
  m.customProgramCacheKey = () => 'flora' + (opt.flat ? 'f' : '') + (opt.double ? 'd' : '') + (m.map ? 'm' : '') + (m.vertexColors ? 'v' : '') + (m.alphaTest ? 'a' : '');
  m.userData.lin = 1; return m;
};

/* batch: collect parts per material, flush into one merged mesh per material (a district = a few draw calls) */
K.batch = function () {
  const groups = new Map();
  return {
    add(mat, geo, color, matrix, glow) { let a = groups.get(mat); if (!a) groups.set(mat, a = []); a.push([geo, color, matrix, glow || 0]) },
    flush(ctx, opt) { const out = []; for (const [mat, parts] of groups) { if (!parts.length) continue; const g = K.merge(parts), m = new THREE.Mesh(g, mat); m.castShadow = K.q() === 2 && !(opt && opt.noShadow); m.receiveShadow = true; ctx.group.add(m); out.push(m) } groups.clear(); return out }
  };
};

/* GLB model as instanced meshes (few draw calls for many copies). items: [{x,y,z,s,ry,tint}]
   fallback(items) builds a procedural stand-in immediately (also used on file:// and when the model is skipped for quality). */
K.instModel = function (ctx, key, items, fallback, opt) {
  opt = opt || {}; if (!items.length) return;
  let fb = fallback ? fallback(items) : null;
  const A = AV.assets; if (!A || !A.available(key) || (opt.minQ != null && K.q() < opt.minQ)) return;
  A.parts(key).then(parts => {
    if (!ctx.group.parent) return; const def = AV.MODELS[key] || {}, base = (def.scale || 1) * (opt.scale || 1), col = new THREE.Color();
    const grp = new THREE.Group(); items.forEach(it => it._sc = (it.s || 1) * base);
    for (const pt of parts) K.instChunks(grp, pt.geo, opt.sway != null ? K.swayClone(pt.mat, opt.sway) : pt.mat, items, opt,
      it => M(it.x, it.y || 0, it.z, (it.s || 1) * base, (it.s || 1) * base * (it.sy || 1), (it.s || 1) * base, 0, it.ry || 0, 0), it => col.setHex(it.tint == null ? 0xffffff : it.tint).convertSRGBToLinear());
    ctx.group.add(grp);
    if (fb) { const list = Array.isArray(fb) ? fb : [fb]; list.forEach(o => { if (o && o.parent) { o.parent.remove(o); AV.dispose(o) } }); fb = null }
  }).catch(() => { });
};
const swayCache = new Map();
K.swayClone = function (mat, sway) { const k = mat.uuid + ':' + sway; if (!swayCache.has(k)) { const m = mat.clone(); m.userData = Object.assign({}, mat.userData, { shared: true, lin: 1 }); K.swayify(m, sway); swayCache.set(k, m) } return swayCache.get(k) };

/* ---------------- flora species (unit scale, origin at the ground) ---------------- */
const M = K.M, P = (g, c, m, gl) => [g, c, m, gl];
K.species = {
  mushroom(cap, stem, spot) {
    const p = [P(BG.tcylL, stem || 0xf4e8d0, M(0, .32, 0, .13, .64, .13), .25), P(BG.hemL, cap, M(0, .58, 0, .5, .36, .5), .9), P(BG.cylL, cap, M(0, .58, 0, .5, .02, .5), .5)];
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .3, r = i % 2 ? .3 : .18; p.push(P(BG.oct, spot || 0xfff6e0, M(Math.cos(a) * r, .58 + .34 * Math.sqrt(1 - (r / .5) ** 2), Math.sin(a) * r, .06, .03, .06), 1)) }
    return K.merge(p);
  },
  flower(petal, center, n) {
    n = n || 6; const p = [P(BG.cylL, 0x2f8a3a, M(0, .25, 0, .02, .5, .02), 0), P(BG.oct, 0x3aa04a, M(.07, .2, 0, .08, .015, .035, 0, 0, .5), 0)];
    for (let i = 0; i < n; i++) { const a = i / n * TAU; p.push(P(BG.oct, petal, M(Math.cos(a) * .1, .52, Math.sin(a) * .1, .11, .025, .05, 0, -a, 0), 1)) }
    p.push(P(BG.oct, center || 0xffe040, M(0, .53, 0, .05, .04, .05), 1)); return K.merge(p);
  },
  palm(trunk, leaf) {
    const p = []; let x = 0, y = 0;
    for (let i = 0; i < 6; i++) { const nx = x + .09 * i * .4; p.push(P(BG.cylL, i % 2 ? trunk : 0x6a4a28, M((x + nx) / 2, y + .4, 0, .16 - i * .012, .82, .16 - i * .012, 0, 0, -.08 * i * .4), 0)); x = nx; y += .78 }
    for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; p.push(P(BG.sphL, leaf, M(x + Math.cos(a) * .85, y + .05, Math.sin(a) * .85, 1.0, .05, .26, 0, -a, -.45), .35)) }
    p.push(P(BG.sph, 0x6a3a1a, M(x, y - .05, 0, .2, .2, .2), 0)); return K.merge(p);
  },
  candyTree(trunk, c1, c2, c3) {
    const p = []; let x = 0, z = 0;
    for (let i = 0; i < 5; i++) { const nx = Math.sin(i * 1.3) * .14, nz = Math.cos(i * 1.7) * .14; p.push(P(BG.cyl, trunk, M((x + nx) / 2, i * .7 + .35, (z + nz) / 2, .24 - i * .03, .76, .24 - i * .03), .05)); x = nx; z = nz }
    const cs = [c1, c2, c3 || c1, c2];
    [[0, 4.2, 0, 1.6], [-.9, 3.6, .3, 1.1], [.9, 3.7, -.2, 1.2], [.1, 3.4, .95, 1.0], [-.2, 5.0, -.3, 1.0]].forEach((b, i) => p.push(P(BG.ico, cs[i % 4], M(b[0], b[1], b[2], b[3], b[3] * .85, b[3]), .55)));
    return K.merge(p);
  },
  spiralTree(trunk, c1, c2) {   // dr-seuss-like stacked discs
    const p = [P(BG.cyl, trunk, M(0, 2, 0, .14, 4, .14), .1)];
    for (let i = 0; i < 5; i++) p.push(P(BG.sph, i % 2 ? c1 : c2, M(Math.sin(i * 2) * .15, 1.6 + i * .7, 0, 1.2 - i * .18, .22, 1.2 - i * .18), .7));
    p.push(P(BG.sph, c1, M(0, 5.3, 0, .3, .3, .3), 1)); return K.merge(p);
  },
  bush(c1, c2) { return K.merge([P(BG.ico, c1, M(0, .5, 0, .8, .65, .8), .15), P(BG.ico0, c2 || c1, M(.55, .4, .2, .55, .5, .55), .15), P(BG.ico0, c1, M(-.5, .38, -.15, .55, .45, .55), .15), P(BG.oct, c2 || 0xff7ab8, M(.2, .95, .3, .12, .12, .12), 1), P(BG.oct, c2 || 0xff7ab8, M(-.35, .8, .35, .1, .1, .1), 1)]) },
  fern(c) { const p = []; for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; p.push(P(BG.coneL, c, M(Math.cos(a) * .35, .35, Math.sin(a) * .35, .09, .9, .03, Math.sin(a) * .9, 0, -Math.cos(a) * .9), .2)) } return K.merge(p) },
  grass(c) { const p = []; for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; p.push(P(BG.coneL, c, M(Math.cos(a) * .08, .22, Math.sin(a) * .08, .04, .45, .04, Math.sin(a) * .35, 0, -Math.cos(a) * .35), .05)) } return K.merge(p) },
  crystal(c1, c2) { const p = []; [[0, 0, .9, .3], [.35, .2, .6, .2], [-.3, .15, .55, .2], [.1, -.35, .45, .16], [-.15, -.2, .7, .18]].forEach((k, i) => p.push(P(BG.oct, i % 2 ? c2 || c1 : c1, M(k[0], k[2], k[1], k[3], k[2], k[3], k[0] * .5, i, -k[0] * .6), 1))); return K.merge(p) },
  rock(c) { return K.merge([P(BG.dod, c, M(0, .35, 0, .7, .5, .6, .2, .5, .1), 0), P(BG.dod, c, M(.5, .2, .2, .35, .3, .35, .5, 0, 0), 0)]) },
  lotus(petal, pad) { const p = [P(BG.cylL, pad || 0x2f8a4a, M(0, .02, 0, .7, .03, .7), .1)]; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; p.push(P(BG.coneL, petal, M(Math.cos(a) * .16, .2, Math.sin(a) * .16, .1, .38, .06, Math.sin(a) * .6, 0, -Math.cos(a) * .6), 1)) } p.push(P(BG.sphL, 0xffe060, M(0, .14, 0, .09, .07, .09), 1)); return K.merge(p) },
  bamboo(c) { const p = []; for (let i = 0; i < 5; i++) { const a = i * 1.7, r = i ? .35 : 0, h = 5 + (i * 37 % 4); p.push(P(BG.cylL, c, M(Math.cos(a) * r, h / 2, Math.sin(a) * r, .07, h, .07), 0)); for (let j = 1; j < h; j += 1.2) p.push(P(BG.cylL, 0x8a9a3a, M(Math.cos(a) * r, j, Math.sin(a) * r, .085, .06, .085), 0)); p.push(P(BG.sphL, 0x5aa83a, M(Math.cos(a) * r + .3, h, Math.sin(a) * r, .5, .06, .15, 0, a, -.3), .1)) } return K.merge(p) },
  giantFlower(petal, center) { const p = [P(BG.cyl, 0x2f8a3a, M(0, 1.4, 0, .07, 2.8, .07), 0), P(BG.sphL, 0x3aa04a, M(.4, 1, 0, .5, .05, .2, 0, 0, .4), 0)]; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; p.push(P(BG.sphL, petal, M(Math.cos(a) * .55, 2.85, Math.sin(a) * .55, .55, .06, .26, 0, -a, .25), 1)) } p.push(P(BG.sph, center || 0xffe040, M(0, 2.9, 0, .28, .2, .28), 1)); return K.merge(p) }
};

/* instanced scatter. items: [{x,y,z,s,ry,sy?,tint?}] -> one InstancedMesh */
/* Spatially chunked instancing: items are split into grid cells; each cell is its own InstancedMesh whose geometry wrapper
   (sharing the GPU buffers) carries a bounding sphere around that cell's instances. Off-screen cells are frustum-culled,
   and the shadow pass only draws cells near the player. (r128 would otherwise cull by the base geometry at the origin.) */
K.instChunks = function (parent, geo, mat, items, opt, matFn, colFn) {
  opt = opt || {}; const cell = opt.cell || 110, cells = new Map();
  items.forEach(it => { const k = Math.floor(it.x / cell) + ',' + Math.floor(it.z / cell); if (!cells.has(k)) cells.set(k, []); cells.get(k).push(it) });
  if (!geo.boundingSphere) geo.computeBoundingSphere(); const gr = geo.boundingSphere.radius + geo.boundingSphere.center.length(), out = [];
  for (const list of cells.values()) {
    const g2 = new THREE.BufferGeometry(); if (geo.index) g2.setIndex(geo.index); for (const n in geo.attributes) g2.setAttribute(n, geo.attributes[n]); geo.groups.forEach(g => g2.addGroup(g.start, g.count, g.materialIndex));
    let cx = 0, cy = 0, cz = 0; list.forEach(it => { cx += it.x; cy += it.y || 0; cz += it.z }); cx /= list.length; cy /= list.length; cz /= list.length;
    let r = 0; list.forEach(it => { r = Math.max(r, Math.hypot(it.x - cx, (it.y || 0) - cy, it.z - cz) + gr * (it._sc || 1) * Math.max(1, it.sy || 1)) });
    g2.boundingSphere = new THREE.Sphere(new THREE.Vector3(cx, cy, cz), r + .5);
    const im = new THREE.InstancedMesh(g2, mat, list.length); list.forEach((it, i) => { im.setMatrixAt(i, matFn(it, i)); const c = colFn && colFn(it); if (c) im.setColorAt(i, c) });
    im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
    im.castShadow = opt.shadow !== false && K.q() === 2; im.receiveShadow = true; im.userData.lin = 1; parent.add(im); out.push(im);
    if (opt.far) { im.userData.far = opt.far; LOD.push(im) }
  }
  return out;
};
/* distance culling for small vegetation chunks (opt.far metres; fog hides them anyway) */
const LOD = K._lod = []; let lodT = 0;
AV.frameFns.push(dt => {
  if ((lodT += dt) < .3 || !LOD.length) return; lodT = 0; const p = AV.cam.position;
  for (let i = LOD.length - 1; i >= 0; i--) { const m = LOD[i]; if (!m.parent || !m.parent.parent) { LOD.splice(i, 1); continue } const s = m.geometry.boundingSphere; m.visible = s.center.distanceTo(p) - s.radius < m.userData.far }
});
K.far = small => small ? [45, 75, 120][K.q()] : [90, 140, 220][K.q()];
K.scatter = function (ctx, geo, mat, items, opt) {
  opt = opt || {}; if (!items.length) { geo.dispose(); return null }
  const col = new THREE.Color(), tinted = items.some(it => it.tint != null), grp = new THREE.Group(); mat.userData.lin = 1;
  items.forEach(it => it._sc = it.s || 1);
  K.instChunks(grp, geo, mat, items, opt, (it, i) => M(it.x, it.y || 0, it.z, it.s || 1, (it.s || 1) * (it.sy || 1), it.s || 1, 0, it.ry == null ? i * 2.39 : it.ry, 0), tinted ? (it => col.setScalar(it.tint == null ? 1 : it.tint)) : null);
  ctx.group.add(grp); return grp;
};
/* convenience: scatter a species with random placement in a ring/rect, respecting an "allowed(x,z)" test and terrain height fn */
K.field = function (ctx, geo, mat, n, area, opt) {
  opt = opt || {}; const rng = opt.rng || ctx.rng, items = [], H = opt.H || (() => 0);
  for (let i = 0, tries = 0; i < n && tries < n * 6; tries++) {
    let x, z; if (area.r1 != null) { const a = rng() * TAU, r = Math.sqrt(area.r0 * area.r0 + rng() * (area.r1 * area.r1 - area.r0 * area.r0)); x = (area.x || 0) + Math.cos(a) * r; z = (area.z || 0) + Math.sin(a) * r } else { x = area.x0 + rng() * (area.x1 - area.x0); z = area.z0 + rng() * (area.z1 - area.z0) }
    if (opt.ok && !opt.ok(x, z)) continue; const s = (opt.s0 || .8) + rng() * ((opt.s1 || 1.3) - (opt.s0 || .8));
    items.push({ x, y: H(x, z), z, s, ry: rng() * TAU, tint: opt.tint ? .8 + rng() * .4 : null }); if (opt.col) ctx.circles.push([x, z, opt.col * s]); i++;
  }
  return K.scatter(ctx, geo, mat, items, opt);
};

/* ---------------- sky (js/sky.js owns the dome, clouds and air) ---------------- */
const NOISE = '\n#ifndef OCT\n#define OCT 4\n#endif\nfloat hs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hs(i),hs(i+vec2(1,0)),f.x),mix(hs(i+vec2(0,1)),hs(i+vec2(1,1)),f.x),f.y);}float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<OCT;i++){v+=a*vn(p);p*=2.03;a*=.5;}return v;}';
/* night glow for the instanced flora (the sky keeps its own uniforms now) */
AV.frameFns.push((dt, t) => {
  U.time.value = t; const W = AV.W; if (!W) return; const nk = AV.nightK || 0, D = (W.sky && W.sky.dome) || {};
  U.glow.value = (D.glow == null ? .12 + .9 * nk : D.glow * (.4 + .6 * nk)) * (W.glowScale == null ? 1 : W.glowScale);
});

/* ---------------- water (fogged, iridescent, animated) ---------------- */
K.water = function (opt) {
  opt = opt || {}; const lin = h => new THREE.Color(h).convertSRGBToLinear();
  const m = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { deep: { value: lin(opt.deep || 0x1a5a9a) }, shallow: { value: lin(opt.shallow || 0x3ad0d8) }, skyc: { value: lin(opt.sky || 0xc8b0ff) }, op: { value: opt.opacity == null ? .88 : opt.opacity }, iri: { value: opt.iri == null ? .28 : opt.iri }, sc: { value: opt.scale || 1 } }]),
    vertexShader: 'varying vec3 vW;\n#include <fog_pars_vertex>\nvoid main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vec4 mvPosition=viewMatrix*w;gl_Position=projectionMatrix*mvPosition;\n#include <fog_vertex>\n}',
    fragmentShader: 'uniform vec3 deep,shallow,skyc;uniform float op,iri,sc,uT;varying vec3 vW;\n#include <fog_pars_fragment>\nvoid main(){vec2 q=vW.xz*sc;float t=uT;' +
      'float r1=sin(q.x*.8+t*1.3+sin(q.y*.5+t*.7)*1.5),r2=sin(q.y*1.1-t*1.1+sin(q.x*.6-t*.5)*1.2),rip=(r1+r2)*.25+.5;' +
      'vec3 ir=.5+.5*cos(6.2831*(vec3(0.,.33,.67)+rip*.5+t*.04+q.x*.015));vec3 col=mix(deep,shallow,rip*.8);col=mix(col,ir*mix(deep,shallow,.6)*1.6,iri);' +
      'vec3 V=normalize(cameraPosition-vW);float fr=pow(1.-clamp(V.y,0.,1.),3.);col=mix(col,skyc,fr*.55);col+=vec3(1.)*pow(max(r1*r2,0.),10.)*.55;' +
      'gl_FragColor=vec4(col,op);\n#include <encodings_fragment>\n#include <fog_fragment>\n}',
    transparent: true, fog: true, depthWrite: false, side: THREE.DoubleSide
  });
  m.uniforms.uT = U.time; m.userData.lin = 1; return m;
};
K.waterPlane = function (ctx, geo, y, opt) { const w = new THREE.Mesh(geo, K.water(opt)); w.rotation.x = -Math.PI / 2; w.position.y = y; w.renderOrder = 1; w.receiveShadow = false; ctx.group.add(w); return w };

/* ---------------- waterfall: scrolling streak shader + mist ---------------- */
K.waterfall = function (ctx, x, y, z, w, h, ry, opt) {
  opt = opt || {};
  const m = new THREE.ShaderMaterial({ uniforms: { uT: U.time, c1: { value: new THREE.Color(opt.c1 || 0x8ae8ff).convertSRGBToLinear() }, c2: { value: new THREE.Color(opt.c2 || 0xffffff).convertSRGBToLinear() } },
    vertexShader: 'varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: 'uniform float uT;uniform vec3 c1,c2;varying vec2 vU;' + NOISE + 'void main(){float n=fbm(vec2(vU.x*9.,vU.y*3.+uT*1.6));float s=smoothstep(.45,.75,fract(vU.y*5.+uT*1.4+n*1.8));vec3 col=mix(c1,c2,s*.8+n*.3);float a=(.72+.28*s)*smoothstep(0.,.08,vU.x)*smoothstep(1.,.92,vU.x);gl_FragColor=vec4(col,a);\n#include <encodings_fragment>\n}',
    transparent: true, depthWrite: false, side: THREE.DoubleSide });
  m.userData.lin = 1; const g = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 1, 1), m); g.position.set(x, y + h / 2, z); g.rotation.y = ry || 0; ctx.group.add(g);
  K.motes(ctx, { n: 26, x, z, r: w * .6, y0: y, y1: y + 1.4, cols: [0xffffff, 0xc8f0ff], size: 2.4, speed: 1.6, alpha: .55 });
  return g;
};

/* ---------------- motes: fireflies / spores / mist (additive points) ---------------- */
K.motes = function (ctx, o) {
  const n = Math.max(4, Math.round(o.n * [.4, .7, 1][K.q()])), pos = new Float32Array(n * 3), col = new Float32Array(n * 3), ph = new Float32Array(n), rng = ctx.rng, H = o.H || (() => 0);
  for (let i = 0; i < n; i++) { const a = rng() * TAU, r = Math.sqrt(rng()) * o.r, x = o.x + Math.cos(a) * r, z = o.z + Math.sin(a) * r; pos[i * 3] = x; pos[i * 3 + 1] = H(x, z) + o.y0 + rng() * (o.y1 - o.y0); pos[i * 3 + 2] = z; _c.setHex(o.cols[i % o.cols.length]); col[i * 3] = _c.r; col[i * 3 + 1] = _c.g; col[i * 3 + 2] = _c.b; ph[i] = rng() * 100 }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aCol', new THREE.BufferAttribute(col, 3)); g.setAttribute('aPh', new THREE.BufferAttribute(ph, 1));
  const m = new THREE.ShaderMaterial({ uniforms: { uT: U.time, uG: U.glow, sz: { value: (o.size || 3) * (AV.R ? AV.R.getPixelRatio() : 1) }, sp: { value: o.speed || 1 }, al: { value: o.alpha || 1 }, nightOnly: { value: o.night ? 1 : 0 } },
    vertexShader: 'attribute vec3 aCol;attribute float aPh;uniform float uT,sz,sp,uG,nightOnly;varying vec3 vC;varying float vA;void main(){vec3 p=position+vec3(sin(uT*.6*sp+aPh)*.7,sin(uT*.9*sp+aPh*1.3)*.45,cos(uT*.5*sp+aPh)*.7);vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=sz*(60./max(-mv.z,1.));vC=aCol;vA=(.55+.45*sin(uT*2.3+aPh*7.))*mix(1.,clamp(uG*1.4,0.,1.),nightOnly);}',
    fragmentShader: 'uniform float al;varying vec3 vC;varying float vA;void main(){vec2 d=gl_PointCoord-.5;float r=length(d);if(r>.5)discard;float a=smoothstep(.5,0.,r);gl_FragColor=vec4(vC*a*vA*al,a*vA*al);}',
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  m.userData.lin = 1; const p = new THREE.Points(g, m); p.frustumCulled = false; ctx.group.add(p); return p;
};

/* ---------------- hand-drawn psychedelic sign (compatible with ctx.sign signature) ---------------- */
K.signTex = function (txt, col, opt) {
  opt = opt || {}; const cv = document.createElement('canvas'); cv.width = 512; cv.height = 256; const c = cv.getContext('2d'), r = AV.rng(txt.length * 97 + 3);
  const rr = (x, y, w, h, k) => { c.beginPath(); c.moveTo(x + k, y); c.arcTo(x + w, y, x + w, y + h, k); c.arcTo(x + w, y + h, x, y + h, k); c.arcTo(x, y + h, x, y, k); c.arcTo(x, y, x + w, y, k); c.closePath() };
  const gr = c.createLinearGradient(0, 0, 512, 256); ['#ff4ad2', '#ffb04a', '#ffe94a', '#4aff9a', '#4ac8ff', '#9a5cff'].forEach((h, i) => gr.addColorStop(i / 5, h));
  rr(4, 4, 504, 248, 34); c.fillStyle = gr; c.fill();
  rr(16, 16, 480, 224, 26); c.fillStyle = opt.bg || '#3a1d4e'; c.fill();
  c.globalAlpha = .18; for (let i = 0; i < 26; i++) { c.strokeStyle = i % 2 ? '#000' : '#ffffff'; c.lineWidth = 1 + r() * 2; c.beginPath(); const y = 24 + r() * 210; c.moveTo(20, y); c.bezierCurveTo(150, y + r() * 14 - 7, 360, y + r() * 14 - 7, 492, y); c.stroke() } c.globalAlpha = 1;
  for (let i = 0; i < 9; i++) { c.fillStyle = ['#ff8ad8', '#ffe066', '#7ff0c8', '#9ab8ff'][i % 4]; const x = 30 + r() * 452, y = r() < .5 ? 30 : 226; c.beginPath(); c.arc(x, y, 3 + r() * 4, 0, TAU); c.fill() }
  const words = String(txt).split(' '), lines = []; let fs = 64, l = '';
  const font = s => 'bold ' + s + 'px "Segoe Print","Comic Sans MS","Chalkboard SE",cursive';
  for (; fs > 26; fs -= 4) { c.font = font(fs); lines.length = 0; l = ''; for (const w of words) { const t = l ? l + ' ' + w : w; if (c.measureText(t).width > 440 && l) { lines.push(l); l = w } else l = t } lines.push(l); if (lines.length * fs * 1.08 < 190) break }
  c.textAlign = 'center'; c.textBaseline = 'middle'; const y0 = 128 - (lines.length - 1) * fs * .54, tg = c.createLinearGradient(0, y0 - fs, 0, y0 + lines.length * fs);
  tg.addColorStop(0, '#fff6d8'); tg.addColorStop(.5, col || '#ffb04a'); tg.addColorStop(1, '#ff6ad5');
  lines.forEach((s, i) => { const y = y0 + i * fs * 1.08; c.lineWidth = 9; c.strokeStyle = '#1a0a26'; c.lineJoin = 'round'; c.strokeText(s, 256, y); c.fillStyle = tg; c.fillText(s, 256, y) });
  const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t;
};
K.sign = function (ctx, txt, x, y, z, ry, w, col, opt) {
  opt = opt || {}; const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; ctx.group.add(g);
  const face = new THREE.Mesh(AV.G.pln, new THREE.MeshBasicMaterial({ map: K.signTex(txt, col, opt), transparent: true, side: THREE.FrontSide })); face.scale.set(w, w * .5, 1); face.position.z = .04; g.add(face);
  /* backing board + posts merged into one mesh (2 draw calls per sign) */
  const parts = [[BG.box, 0x2a1236, M(0, 0, -.01, w * .985, w * .49, .06), 0]];
  if (opt.posts) for (const s of [-1, 1]) parts.push([BG.cyl, 0x5a3418, M(s * w * .38, -y / 2, -.14, .08, y, .08), 0]);
  if (!K._signMat) { K._signMat = K.floraMat(0, { rough: .8 }); K._signMat.userData.shared = true }
  const back = new THREE.Mesh(K.merge(parts), K._signMat); back.castShadow = !!opt.posts; g.add(back);
  return g;
};

/* ---------------- floating name tag (sprite) ---------------- */
K.tag = function (name, sub, col) {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 160; const c = cv.getContext('2d');
  let fs = 54; do { c.font = 'bold ' + fs + 'px "Segoe Print","Comic Sans MS",cursive'; fs -= 2 } while (c.measureText(name).width > 480 && fs > 20);   // shrink long names to fit
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  c.lineWidth = 10; c.strokeStyle = 'rgba(20,6,32,.92)'; c.strokeText(name, 256, 58); c.fillStyle = col || '#ffe08a'; c.fillText(name, 256, 58);
  if (sub) { let ss = 30; do { c.font = ss + 'px Georgia,serif'; ss -= 2 } while (c.measureText(sub).width > 490 && ss > 14); c.lineWidth = 7; c.strokeText(sub, 256, 122); c.fillStyle = '#e8f6ff'; c.fillText(sub, 256, 122) }
  const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, fog: false })); s.scale.set(2.4, .75, 1); s.userData.lin = 1; s.material.userData.lin = 1; return s;
};

/* ---------------- lantern string between points (instanced glowing bulbs + wire) ---------------- */
K.lanterns = function (ctx, pts, opt) {
  opt = opt || {}; const cols = opt.cols || [0xff4ad2, 0xffd84a, 0x4ac8ff, 0x7aff8a, 0xff8a3a], per = opt.per || 7, items = [], wire = [];
  for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; for (let k = 0; k <= per; k++) { const f = k / per, sag = Math.sin(f * Math.PI) * (opt.sag || .8); const x = a[0] + (b[0] - a[0]) * f, y = a[1] + (b[1] - a[1]) * f - sag, z = a[2] + (b[2] - a[2]) * f; wire.push(new THREE.Vector3(x, y, z)); if (k && k < per) items.push([x, y - .12, z]) } }
  const im = new THREE.InstancedMesh(BG.sphL, new THREE.MeshBasicMaterial({ color: 0xffffff }), items.length), cc = new THREE.Color();
  items.forEach((p, i) => { im.setMatrixAt(i, M(p[0], p[1], p[2], .13, .17, .13)); im.setColorAt(i, cc.setHex(cols[i % cols.length]).convertSRGBToLinear()) }); im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true; im.userData.lin = 1; im.material.userData.lin = 1; ctx.group.add(im);
  const ln = new THREE.Line(new THREE.BufferGeometry().setFromPoints(wire), new THREE.LineBasicMaterial({ color: 0x2a1a20 })); ctx.group.add(ln); return im;
};

/* a ring of flat stepping stones / path segment helper */
K.disc = function (ctx, x, y, z, r, color, opt) { const m = new THREE.Mesh(new THREE.CircleGeometry(r, opt && opt.seg || 40), opt && opt.mat || AV.std(color, .9)); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.receiveShadow = true; ctx.group.add(m); return m };
})(window.AV);
