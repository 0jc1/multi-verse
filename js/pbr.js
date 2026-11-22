/* APEVERSE V0.9 - pbr.js : procedural PBR for the characters.
   - Canvas-painted, tileable texture sets (fur variation, skin pores/wrinkles, jersey knit, denim twill, cargo twill, rib knit,
     tie-dye, Hawaiian floral, sneaker leather, flamed maple, iris) - no image files needed, works from file://.
   - A shader patch for MeshPhysicalMaterial: triplanar sampling in REST-POSE space (so patterns stick to skinned skin/cloth),
     4 per-vertex material channels (fur / skin / dark skin / nails, or fabric / print / trims), derivative bump mapping,
     baked SDF ambient occlusion on indirect light, front/back planar decals (shirt graphics).
   - Fur: one instanced draw of N skinned shells; strands come from a 3D cell pattern, tapered, root-darkened, drooping with
     gravity and lagging with motion. Distant fur falls back to alpha-to-coverage so it does not shimmer.
   - A small character-only environment map (PMREM) so brass, chrome, glasses and clearcoat read as real materials. */
'use strict';
(function (AV) {
const PBR = AV.pbr = {}, TAU = Math.PI * 2;

/* ---------- tileable noise helpers ---------- */
function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 4294967296 } }
function lattice(P, seed) { const r = rng(seed), a = new Float32Array(P * P); for (let i = 0; i < a.length; i++) a[i] = r(); return a }
function pn(L, P, x, y) {     // periodic value noise, x,y in lattice units
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const x0 = ((xi % P) + P) % P, y0 = ((yi % P) + P) % P, x1 = (x0 + 1) % P, y1 = (y0 + 1) % P;
  const a = L[y0 * P + x0], b = L[y0 * P + x1], c = L[y1 * P + x0], d = L[y1 * P + x1];
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(Ls, base, x, y, oct, gain) { let s = 0, a = .5, f = 1, n = 0; for (let o = 0; o < oct; o++) { s += a * pn(Ls[o % Ls.length], base * f, x * base * f, y * base * f); n += a; a *= gain || .5; f *= 2 } return s / n }
/* paints a size x size image from f(u,v) -> [r,g,b,a] (0..1) */
function paint(size, f, srgb) {
  const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d'), im = g.createImageData(size, size), d = im.data;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) { const p = f(x / size, y / size), i = (y * size + x) * 4; d[i] = p[0] * 255; d[i + 1] = p[1] * 255; d[i + 2] = p[2] * 255; d[i + 3] = (p[3] == null ? 1 : p[3]) * 255 }
  g.putImageData(im, 0, 0); return tex(c, srgb);
}
function tex(c, srgb) { const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; t.encoding = THREE.LinearEncoding; t.userData = { keep: true, srgbData: !!srgb }; return t }
const cl = (v, a, b) => v < a ? a : v > b ? b : v, sm = (a, b, x) => { const t = cl((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t) };
function hsl(h, s, l) { h = ((h % 1) + 1) % 1; const q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q, f = t => { t = ((t % 1) + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < .5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p }; return [f(h + 1 / 3), f(h), f(h - 1 / 3)] }

/* ---------- texture library (built lazily, cached forever) ---------- */
const T = {};
PBR.tex = function (name) { if (!T[name]) { T[name] = MAKE[name](); if (name === 'iris') T[name].wrapS = T[name].wrapT = THREE.ClampToEdgeWrapping } return T[name] };
const MAKE = {
  /* greyscale variation around 0.5 (multiplied x2 in the shader): clumps + streaks */
  furVar: () => { const L = [lattice(8, 11), lattice(16, 12), lattice(32, 13), lattice(64, 14)], S = [lattice(64, 15)];
    return paint(256, (u, v) => { const c = fbm(L, 4, u, v, 4), st = pn(S[0], 64, u * 64, v * 8); const g = .5 + (c - .5) * .5 + (st - .5) * .22; return [g, g, g] }) },
  /* height: fine directional strands (fur), used on fur channel */
  furH: () => { const S = [lattice(128, 21), lattice(64, 22)], L = [lattice(16, 23)];
    return paint(256, (u, v) => { const w = pn(L[0], 16, u * 16, v * 16) * .6; const a = pn(S[0], 128, (u + w * .05) * 128, v * 18), b = pn(S[1], 64, (u + w * .08) * 64, v * 10); const h = cl(a * .65 + b * .35, 0, 1); return [h, h, h] }) },
  /* height: skin pores + soft creases */
  skinH: () => { const P = [lattice(128, 31)], W = [lattice(8, 32), lattice(16, 33)], C = [lattice(32, 34)];
    return paint(256, (u, v) => { const pore = sm(.62, .8, pn(P[0], 128, u * 128, v * 128)), cr = Math.abs(fbm(W, 4, u, v, 2) - .5) * 2, line = sm(.05, 0, cr) * .55, bl = fbm([C[0]], 32, u, v, 1); const h = cl(.6 - pore * .35 - line * .6 + bl * .2, 0, 1); return [h, h, h] }) },
  /* jersey knit (tees): little V columns */
  jersey: () => paint(128, (u, v) => { const cu = u * 32, cv = v * 48, fu = cu - Math.floor(cu), fv = cv - Math.floor(cv), vv = Math.abs(fu - .5) * 2 - fv; const h = .5 + .5 * Math.cos(vv * Math.PI); return [h, h, h] }),
  /* denim twill height in R, white-weft albedo variation in G */
  denim: () => { const L = [lattice(64, 41)]; return paint(256, (u, v) => { const d = ((u * 64 + v * 64) % 1 + 1) % 1, tw = .5 + .5 * Math.sin(d * TAU), n = pn(L[0], 64, u * 64, v * 64); const h = cl(tw * .75 + n * .25, 0, 1); return [h, h, h] }) },
  denimAlb: () => { const L = [lattice(64, 42), lattice(8, 43), lattice(16, 44)]; return paint(256, (u, v) => { const d = ((u * 64 + v * 64) % 1 + 1) % 1, weft = sm(.75, 1, Math.sin(d * TAU) * .5 + .5) * .35, slub = (pn(L[0], 64, u * 64, v * 3) - .5) * .25, fade = fbm([L[1], L[2]], 8, u, v, 2); const g = cl(.46 + weft * .7 + slub * .6 + (fade - .5) * .3, 0, 1); return [g * .97, g * .99, g, 1] }) },
  twill: () => paint(128, (u, v) => { const d = ((u * 40 - v * 40) % 1 + 1) % 1, h = .5 + .5 * Math.sin(d * TAU); return [h, h, h] }),
  rib: () => { const L = [lattice(32, 51)]; return paint(128, (u, v) => { const r = .5 + .5 * Math.cos(u * 24 * TAU), loop = .5 + .5 * Math.cos(v * 40 * TAU + (Math.floor(u * 24) % 2) * Math.PI), n = pn(L[0], 32, u * 32, v * 32); const h = cl(r * .6 + loop * .25 + n * .15, 0, 1); return [h, h, h] }) },
  leather: () => { const L = [lattice(32, 61), lattice(64, 62)]; return paint(128, (u, v) => { const c = Math.abs(fbm(L, 8, u, v, 2) - .5) * 2, h = cl(.7 - sm(.06, 0, c) * .6 + (pn(L[1], 64, u * 64, v * 64) - .5) * .2, 0, 1); return [h, h, h] }) },
  /* tie-dye: domain-warped rainbow bands */
  tiedye: () => { const L = [lattice(4, 71), lattice(8, 72), lattice(16, 73)], W = [lattice(8, 74), lattice(16, 75)];
    return paint(512, (u, v) => { const wx = fbm(W, 2, u, v, 2), wy = fbm(W, 2, u + .37, v + .61, 2), f = fbm(L, 2, u + wx * .5, v + wy * .5, 3), crinkle = pn(L[2], 16, u * 16 + wx * 4, v * 16) * .12;
      const k = f * 5.0 + crinkle; const pal = [[.98, .22, .55], [1, .55, .12], [1, .9, .2], [.35, .85, .3], [.15, .7, .95], [.55, .3, .85]]; const i = Math.floor(k * 1.2) % 6, j = (i + 1) % 6, t = sm(.35, .65, k * 1.2 - Math.floor(k * 1.2));
      const c = [0, 1, 2].map(q => pal[i][q] * (1 - t) + pal[j][q] * t); const white = sm(.86, .98, pn(L[1], 8, u * 8 + wy * 3, v * 8)) * .35; return c.map(q => cl(q + white, 0, 1)) }, true) },
  /* the big tie-dye spiral printed front + back (decal, alpha falls off at the edge) */
  spiral: () => paint(512, (u, v) => { const x = u * 2 - 1, y = v * 2 - 1, r = Math.hypot(x, y), a = Math.atan2(y, x), k = (a / TAU + r * 2.4) % 1; const pal = [[.95, .2, .5], [1, .6, .1], [1, .92, .25], [.3, .85, .35], [.15, .65, .95], [.6, .3, .9]]; const f = (k + 1) * 6, i = Math.floor(f) % 6, j = (i + 1) % 6, t = sm(.3, .7, f - Math.floor(f)); const c = [0, 1, 2].map(q => pal[i][q] * (1 - t) + pal[j][q] * t); return [c[0], c[1], c[2], sm(1, .75, r)] }, true),
  /* Hawaiian floral (tileable: every motif is stamped with wrap-around copies) */
  floral: () => { const S = 512, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'), r = rng(808);
    g.fillStyle = '#f0c232'; g.fillRect(0, 0, S, S);
    const stamp = fn => { for (const dx of [-S, 0, S]) for (const dy of [-S, 0, S]) { g.save(); g.translate(dx, dy); fn(); g.restore() } };
    for (let i = 0; i < 26; i++) { const x = r() * S, y = r() * S, a = r() * TAU, l = 40 + r() * 50, col = ['#2e9a52', '#1f8a7a', '#5ab83a'][i % 3];
      stamp(() => { g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = col; g.beginPath(); g.ellipse(0, 0, l, l * .38, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(10,60,30,.6)'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-l, 0); g.lineTo(l, 0); g.stroke(); for (let k = -3; k <= 3; k++) { g.beginPath(); g.moveTo(k * l / 4, 0); g.lineTo(k * l / 4 + l * .18, (k % 2 ? 1 : -1) * l * .28); g.stroke() } g.restore() }) }
    for (let i = 0; i < 14; i++) { const x = r() * S, y = r() * S, R = 26 + r() * 22, col = ['#f06a24', '#e8452a', '#ff8a3a', '#2ab0a0'][i % 4], rot = r() * TAU;
      stamp(() => { g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = col; for (let p = 0; p < 5; p++) { g.rotate(TAU / 5); g.beginPath(); g.ellipse(R * .55, 0, R * .55, R * .38, 0, 0, TAU); g.fill() } g.fillStyle = '#fff2b0'; g.beginPath(); g.arc(0, 0, R * .2, 0, TAU); g.fill(); g.strokeStyle = '#ffe070'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(R * .9, -R * .2); g.stroke(); g.restore() }) }
    for (let i = 0; i < 60; i++) { const x = r() * S, y = r() * S; stamp(() => { g.fillStyle = 'rgba(255,250,220,.8)'; g.beginPath(); g.arc(x, y, 2 + r() * 3, 0, TAU); g.fill() }) }
    return tex(c, true) },
  /* STONE SAMPLES chest print: cream ink on transparent, slightly distressed */
  logo: () => { const S = 512, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'), r = rng(99);
    g.strokeStyle = g.fillStyle = '#f1e7d0'; g.lineWidth = 14; g.beginPath(); g.arc(256, 270, 205, 0, TAU); g.stroke();
    g.beginPath(); g.moveTo(186, 140); g.lineTo(206, 95); g.lineTo(231, 125); g.lineTo(256, 80); g.lineTo(281, 125); g.lineTo(306, 95); g.lineTo(326, 140); g.closePath(); g.fill();
    g.font = 'bold 92px Georgia'; g.textAlign = 'center'; g.fillText('STONE', 256, 262); g.fillText('SAMPLES', 256, 362);
    g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 900; i++) { g.fillStyle = 'rgba(0,0,0,' + (.3 + r() * .7) + ')'; g.fillRect(r() * S, r() * S, 1 + r() * 4, 1 + r() * 3) }
    const t = tex(c, true); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t },
  wood: () => { const L = [lattice(8, 81), lattice(16, 82), lattice(64, 83)]; return paint(512, (u, v) => { const w = fbm([L[0], L[1]], 8, u, v, 2), ring = .5 + .5 * Math.sin((u * 30 + w * 6) * TAU / 3), flame = .5 + .5 * Math.sin(v * 90 + w * 8 + Math.sin(u * 12) * 2), fine = pn(L[2], 64, u * 64, v * 4);
    const g = cl(.45 + ring * .18 + (flame - .5) * .22 + (fine - .5) * .12, 0, 1); return [g * .95, g * .55, g * .22] }, true) },
  iris: () => paint(128, (u, v) => { const x = u * 2 - 1, y = v * 2 - 1, r = Math.hypot(x, y), a = Math.atan2(y, x), fib = .5 + .5 * Math.sin(a * 40 + Math.sin(a * 7) * 2);
    if (r > .98) return [.93, .91, .88]; if (r < .44) return [.02, .015, .01]; const t = (r - .44) / .54, lim = sm(.8, 1, t); const b = [.45 + .2 * fib, .25 + .14 * fib, .07]; return b.map(q => q * (1 - lim * .7) * (1 - sm(.0, .12, .12 - Math.abs(t - .3)) * .3)) }, true)
};

/* ---------- environment (character reflections only) ---------- */
let ENV = null;
/* a small painted cube map (sky gradient + a few soft "studio" panels). No PMREM pass: that is cheap on any GPU and never
   risks a context loss on software renderers. three.js samples its mip chain for rough materials. */
PBR.env = function () {
  if (ENV) return ENV;
  const N = 64, dirs = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  const lights = [[[.45, .65, .6], [1, .95, .86], 5, .22], [[-.85, .3, .3], [1, .82, .94], 2.2, .25], [[.2, .25, -.95], [.72, .88, 1], 2, .3]];
  const faces = dirs.map((d, f) => { const c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d'), im = g.createImageData(N, N);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const u = (x + .5) / N * 2 - 1, v = (y + .5) / N * 2 - 1; let X, Y, Z;
      if (f === 0) { X = 1; Y = -v; Z = -u } else if (f === 1) { X = -1; Y = -v; Z = u } else if (f === 2) { X = u; Y = 1; Z = v } else if (f === 3) { X = u; Y = -1; Z = -v } else if (f === 4) { X = u; Y = -v; Z = 1 } else { X = -u; Y = -v; Z = -1 }
      const l = Math.hypot(X, Y, Z); X /= l; Y /= l; Z /= l;
      let col = Y > 0 ? [1 + (.55 - 1) * Math.pow(Y, .55), .86 + (.68 - .86) * Math.pow(Y, .55), .7 + (.95 - .7) * Math.pow(Y, .55)] : [.7 + (.22 - .7) * Math.pow(-Y, .45), .6 + (.17 - .6) * Math.pow(-Y, .45), .49 + (.13 - .49) * Math.pow(-Y, .45)];
      for (const L of lights) { const dd = X * L[0][0] + Y * L[0][1] + Z * L[0][2], k = Math.max(0, (dd - (1 - L[3])) / L[3]); col = col.map((q, i) => q + L[1][i] * L[2] * k * k) }
      const i = (y * N + x) * 4; for (let q = 0; q < 3; q++) im.data[i + q] = Math.min(255, Math.pow(col[q] / (1 + col[q] * .25), 1 / 2.2) * 255); im.data[i + 3] = 255;
    } g.putImageData(im, 0, 0); return c });
  ENV = new THREE.CubeTexture(faces); ENV.encoding = THREE.sRGBEncoding; ENV.generateMipmaps = true; ENV.minFilter = THREE.LinearMipmapLinearFilter; ENV.needsUpdate = true; ENV.userData = { keep: true };
  return ENV;
};
/* materials registered here get their env intensity scaled with the world's ambient light every frame */
const ENVMATS = new Set();
PBR.track = m => { ENVMATS.add(m); m.addEventListener('dispose', () => ENVMATS.delete(m)); return m };
PBR.untrack = m => ENVMATS.delete(m);
PBR.syncEnv = function () { const k = AV.HS ? Math.max(.12, Math.min(1.4, AV.HS.intensity / .55)) : 1; for (const m of ENVMATS) m.envMapIntensity = (m.userData.envBase || 1) * k };

/* ---------- character shader patch ---------- */
const VPARS = `
attribute vec4 aMat; attribute float aAO; attribute float aFur;
varying vec3 vRest; varying vec3 vRestN; varying vec4 vMat; varying float vAO; varying float vFur;
#ifdef SHELL
attribute float aShell; uniform float uFurK; uniform vec3 uGrav; uniform vec3 uLag; varying float vShell;
#endif`;
const FPARS = `
uniform vec3 uC0; uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3; uniform vec4 uRough; uniform vec4 uMetal; uniform vec3 uSheenK;
uniform sampler2D tAlb; uniform float uAlbS; uniform vec4 uAlbMask; uniform float uAlbMode;
uniform sampler2D tH; uniform float uHS; uniform vec4 uHMask; uniform sampler2D tH2; uniform float uH2S; uniform vec4 uH2Mask; uniform float uBump;
#ifdef DECAL
uniform sampler2D tDec; uniform vec4 uDec; uniform float uDecSide;
#endif
#ifdef SHELL
uniform float uStrandF; uniform vec3 uTip; varying float vShell;
#endif
varying vec3 vRest; varying vec3 vRestN; varying vec4 vMat; varying float vAO; varying float vFur;
vec3 avW(vec3 n){ vec3 w = pow(abs(n), vec3(6.0)); return w / (w.x + w.y + w.z + 1e-5); }
vec4 avTri(sampler2D t, vec3 p, vec3 w){ return texture2D(t, p.zy) * w.x + texture2D(t, p.xz) * w.y + texture2D(t, p.xy) * w.z; }
float avHash(vec3 p){ p = fract(p * 0.3183099 + vec3(.11,.17,.13)); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
vec3 avPerturb(vec3 sp, vec3 sn, vec2 dH, float fd){ vec3 sx = dFdx(sp), sy = dFdy(sp); vec3 R1 = cross(sy, sn), R2 = cross(sn, sx); float det = dot(sx, R1) * fd; vec3 g = sign(det) * (dH.x * R1 + dH.y * R2); return normalize(abs(det) * sn - g); }`;
function patch(m, cfg) {
  const U = m.userData.u = {
    uC0: { value: new THREE.Color() }, uC1: { value: new THREE.Color() }, uC2: { value: new THREE.Color() }, uC3: { value: new THREE.Color() },
    uRough: { value: new THREE.Vector4(...(cfg.rough || [.6, .55, .45, .35])) }, uMetal: { value: new THREE.Vector4(...(cfg.metal || [0, 0, 0, 0])) }, uSheenK: { value: new THREE.Vector3() },
    tAlb: { value: cfg.alb || PBR.tex('furVar') }, uAlbS: { value: cfg.albS || 3 }, uAlbMask: { value: new THREE.Vector4(...(cfg.albMask || [1, .6, .3, 0])) }, uAlbMode: { value: cfg.albMode || 0 },
    tH: { value: cfg.h || PBR.tex('furH') }, uHS: { value: cfg.hS || 6 }, uHMask: { value: new THREE.Vector4(...(cfg.hMask || [1, 0, 0, 0])) },
    tH2: { value: cfg.h2 || PBR.tex('skinH') }, uH2S: { value: cfg.h2S || 9 }, uH2Mask: { value: new THREE.Vector4(...(cfg.h2Mask || [0, 1, 1, .3])) }, uBump: { value: cfg.bump == null ? .0012 : cfg.bump },
    tDec: { value: cfg.decal ? cfg.decal.tex : null }, uDec: { value: new THREE.Vector4(...(cfg.decal ? cfg.decal.rect : [0, 0, 1, 1])) }, uDecSide: { value: cfg.decal ? cfg.decal.side : 1 },
    uFurK: { value: cfg.furK || 1 }, uGrav: { value: new THREE.Vector3(0, -1, 0) }, uLag: { value: new THREE.Vector3() }, uStrandF: { value: cfg.strandF || 260 }, uTip: { value: new THREE.Color(cfg.tip == null ? 0xffffff : cfg.tip) }
  };
  (cfg.cols || [0x808080, 0x808080, 0x303030, 0xd0c0b0]).forEach((c, i) => U['uC' + i].value.set(c).convertSRGBToLinear());
  m.defines = m.defines || {}; if (cfg.decal) m.defines.DECAL = ''; if (cfg.shell) m.defines.SHELL = '';
  m.extensions = { derivatives: true };
  const key = 'avchar' + (cfg.decal ? 'D' : '') + (cfg.shell ? 'S' : '');
  m.customProgramCacheKey = () => key;
  m.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>' + VPARS)
      .replace('#include <begin_vertex>', '#include <begin_vertex>\n vRest = position; vRestN = normal; vMat = aMat; vAO = aAO; vFur = aFur;')
      .replace('#include <displacementmap_vertex>', `#ifdef SHELL
  { float fl = aFur * uFurK; vShell = aShell; vec3 nn = normalize(objectNormal);
    transformed += nn * (fl * aShell + .0008) + (uGrav * .6 * fl + uLag) * aShell * aShell; }
#endif`);
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>' + FPARS)
      .replace('#include <color_fragment>', `
  vec3 avTw = avW(normalize(vRestN));
  vec3 avBase = uC0 * vMat.x + uC1 * vMat.y + uC2 * vMat.z + uC3 * vMat.w;
  vec3 avAlbR = avTri(tAlb, vRest * uAlbS, avTw).rgb;
  float avAm = dot(uAlbMask, vMat);
  vec3 avCol = uAlbMode > .5 ? mix(avBase, pow(avAlbR, vec3(2.2)), avAm) : avBase * mix(vec3(1.), avAlbR * 2., avAm);
#ifdef DECAL
  { vec2 duv = (vRest.xy - uDec.xy) / uDec.zw + .5; float fac = uDecSide == 0. ? smoothstep(.15, .45, abs(vRestN.z)) : smoothstep(.15, .45, vRestN.z * uDecSide);
    if (duv.x > 0. && duv.x < 1. && duv.y > 0. && duv.y < 1.) { if (uDecSide < 0.) duv.x = 1. - duv.x; vec4 dc = texture2D(tDec, duv); avCol = mix(avCol, pow(dc.rgb, vec3(2.2)), dc.a * fac * vMat.x); } }
#endif
#ifdef SHELL
  if (vFur < .0015) discard;
  { vec3 q = vRest * uStrandF, ci = floor(q); float rnd = avHash(ci), len = mix(.35, 1., rnd);
    vec3 c = fract(q) - .5 - (vec3(avHash(ci + 11.), avHash(ci + 27.), avHash(ci + 41.)) - .5) * .5; vec3 nR = normalize(vRestN);
    float r = length(c - dot(c, nR) * nR), th = .5 * (1. - vShell / len), fw = length(fwidth(vRest)) * uStrandF;
    float hard = step(r, th) * step(vShell, len), soft = clamp((1. - vShell) * 1.15 - .1, 0., 1.);
    float a = mix(hard, soft, smoothstep(.45, 1.4, fw)); if (a < .03) discard; diffuseColor.a = a;
    avCol *= mix(.32, 1., vShell) * mix(.85, 1.15, rnd); avCol = mix(avCol, avCol * uTip * 1.6, vShell * vShell * .45); }
#endif
  diffuseColor.rgb = avCol * mix(1., vAO, .6);`)
      .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = clamp(dot(uRough, vMat), .04, 1.);')
      .replace('#include <metalnessmap_fragment>', 'float metalnessFactor = dot(uMetal, vMat);')
      .replace('#include <normal_fragment_maps>', `
#ifndef SHELL
  { float hh = avTri(tH, vRest * uHS, avTw).r * dot(uHMask, vMat) + avTri(tH2, vRest * uH2S, avTw).r * dot(uH2Mask, vMat);
    normal = avPerturb(-vViewPosition, normal, vec2(dFdx(hh), dFdy(hh)) * uBump, faceDirection); }
#endif`)
      .replace('#include <aomap_fragment>', `
  { float ambientOcclusion = vAO; reflectedLight.indirectDiffuse *= ambientOcclusion;
  #if defined( USE_ENVMAP ) && defined( STANDARD )
    float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) ); reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.specularRoughness );
  #endif
  }`);
  };
  return m;
}
/* cfg: { cols[4], rough[4], metal[4], alb, albS, albMask[4], albMode, h, hS, hMask, h2, h2S, h2Mask, bump, decal{tex,rect,side}, sheen, env, shell, furK, strandF, tip } */
PBR.charMat = function (cfg) {
  const p = { roughness: 1, metalness: 0, envMap: cfg.env === false ? null : PBR.env() };
  const m = new THREE.MeshPhysicalMaterial(p);
  if (cfg.sheen) m.sheen = new THREE.Color(cfg.sheen);
  if (cfg.clearcoat) { m.clearcoat = cfg.clearcoat; m.clearcoatRoughness = cfg.clearcoatRoughness || .4 }
  m.userData.envBase = cfg.envI == null ? .9 : cfg.envI; m.userData.lin = 1;
  if (cfg.shell) { m.alphaToCoverage = true; m.transparent = false }
  m.skinning = cfg.skinning !== false;      // r128: skinned meshes need the flag on the material
  patch(m, cfg); return PBR.track(m);
};
/* plain physical material for props (instruments, glasses, chains): sRGB hex like the rest of the game */
PBR.propMat = function (o) {
  const p = Object.assign({ envMap: PBR.env() }, o); delete p.envI; const m = new THREE.MeshPhysicalMaterial(p); if (o.color != null) m.color.set(o.color).convertSRGBToLinear(); if (o.emissive != null) m.emissive.set(o.emissive).convertSRGBToLinear();
  if (o.map) o.map.encoding = THREE.sRGBEncoding;
  m.userData.lin = 1; m.userData.envBase = o.envI == null ? 1 : o.envI; return PBR.track(m);
};
})(window.AV);
