/* APEVERSE - flora_real.js : realistic, higher-poly plants and rocks with procedural PBR textures.
   - Medium/High graphics (and Settings > "Realistic plants & rocks" on): K.species fern, bush, flower, grass, mushroom, palm,
     bamboo and rock are rebuilt as detailed meshes (individual leaflets, petals, ringed trunks, gills, warts...) that share one
     generated texture atlas (albedo + normal map). Low graphics keeps the original light species (phones).
   - Rocks/boulders: noise-displaced, chiselled icospheres with baked cavity shading, instanced (indexed geometry, few draw
     calls) and shaded with a world-space triplanar rock material (albedo + normal map, moss on up-facing surfaces).
   - Prefers these procedural plants over the low-poly CC0 GLB stand-ins for the same species.
   All textures are generated once at first use and kept across worlds. */
'use strict';
(function (AV) {
const K = AV.kit, A = AV.arch, TAU = AV.TAU;
const R = K.real = {};
R.on = () => K.q() >= 1 && !(AV.S && AV.S.set && AV.S.set.realFlora === false);

/* ======================= small math helpers ======================= */
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], sc = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const nrm = a => { const l = Math.hypot(a[0], a[1], a[2]); return l > 1e-9 ? [a[0] / l, a[1] / l, a[2] / l] : [0, 1, 0] };
const lerp = (a, b, t) => a + (b - a) * t, fade = t => t * t * (3 - 2 * t), cl01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
const smooth = (a, b, x) => { const t = cl01((x - a) / (b - a)); return t * t * (3 - 2 * t) };

/* ======================= noise ======================= */
const hashI = (x, y, z) => { let h = (x * 374761393 + y * 668265263 + z * 1274126177) | 0; h = Math.imul(h ^ (h >>> 13), 1103515245); h ^= h >>> 16; return (h >>> 0) / 4294967296 };
function vnoise3(x, y, z, s) {
  const X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z), u = fade(x - X), v = fade(y - Y), w = fade(z - Z), S = s * 7919, h = (a, b, c) => hashI(a + S, b, c);
  return lerp(lerp(lerp(h(X, Y, Z), h(X + 1, Y, Z), u), lerp(h(X, Y + 1, Z), h(X + 1, Y + 1, Z), u), v),
    lerp(lerp(h(X, Y, Z + 1), h(X + 1, Y, Z + 1), u), lerp(h(X, Y + 1, Z + 1), h(X + 1, Y + 1, Z + 1), u), v), w);
}
function fbm3(x, y, z, oct, s) { let r = 0, a = .5, n = 0; for (let i = 0; i < oct; i++) { r += a * vnoise3(x, y, z, s + i); n += a; x *= 2.03; y *= 2.03; z *= 2.03; a *= .5 } return r / n }
/* tileable 2D value noise (period P lattice cells over the unit square) */
const LAT = {};
function lat(P, s) { const k = P + ':' + s; if (!LAT[k]) { const a = new Float32Array(P * P); for (let j = 0; j < P; j++) for (let i = 0; i < P; i++) a[j * P + i] = hashI(i, j, s); LAT[k] = a } return LAT[k] }
function pnoise(u, v, P, s) {
  const a = lat(P, s), x = u * P, y = v * P, X = Math.floor(x), Y = Math.floor(y), fx = fade(x - X), fy = fade(y - Y);
  const x0 = ((X % P) + P) % P, y0 = ((Y % P) + P) % P, x1 = (x0 + 1) % P, y1 = (y0 + 1) % P;
  return lerp(lerp(a[y0 * P + x0], a[y0 * P + x1], fx), lerp(a[y1 * P + x0], a[y1 * P + x1], fx), fy);
}
function pfbm(u, v, P, oct, s) { let r = 0, a = .5, n = 0; for (let i = 0; i < oct; i++) { r += a * pnoise(u, v, P, s + i * 31); n += a; P *= 2; a *= .5 } return r / n }

/* ======================= textures ======================= */
const TX = {};
function dataTex(data, size, srgb) {
  const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true;
  t.anisotropy = AV.R ? Math.min(8, AV.R.capabilities.getMaxAnisotropy()) : 1; if (srgb) t.encoding = THREE.sRGBEncoding;
  t.needsUpdate = true; t.userData = { keep: true }; return t;
}
/* height field -> tangent-space normal map. cell > 0 clamps neighbour lookups inside atlas cells (no bleeding), 0 = wrap */
function normalData(H, S, str, cell) {
  const d = new Uint8Array(S * S * 4);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    let xl, xr, yd, yu;
    if (cell) { const cx = x - x % cell, cy = y - y % cell; xl = Math.max(cx, x - 1); xr = Math.min(cx + cell - 1, x + 1); yd = Math.max(cy, y - 1); yu = Math.min(cy + cell - 1, y + 1) }
    else { xl = (x - 1 + S) % S; xr = (x + 1) % S; yd = (y - 1 + S) % S; yu = (y + 1) % S }
    const s = typeof str === 'function' ? str(x, y) : str, nx = -(H[y * S + xr] - H[y * S + xl]) * s, ny = -(H[yu * S + x] - H[yd * S + x]) * s, l = Math.hypot(nx, ny, 1), i = (y * S + x) * 4;
    d[i] = (nx / l * .5 + .5) * 255; d[i + 1] = (ny / l * .5 + .5) * 255; d[i + 2] = (1 / l * .5 + .5) * 255; d[i + 3] = 255;
  }
  return d;
}
/* tileable rock: lumpy fbm + fine grain + cracks + granite specks + pale lichen */
R.rockTex = function () {
  if (TX.rock) return TX.rock;
  const S = 512, H = new Float32Array(S * S), c = new Uint8Array(S * S * 4);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const u = x / S, v = y / S, i = y * S + x;
    const h1 = pfbm(u, v, 4, 5, 11), h2 = pfbm(u, v, 32, 3, 23), cr = 1 - Math.abs(2 * pfbm(u, v, 5, 4, 37) - 1), crack = smooth(.9, .985, cr), li = smooth(.62, .72, pfbm(u, v, 12, 3, 51));
    const sp = hashI(x, y, 5), speck = sp < .05 ? -.2 : sp > .965 ? .12 : 0;
    H[i] = h1 * .6 + h2 * .3 - crack * .45 + speck * .04;
    const L = .76 + (h1 - .5) * .5 + (h2 - .5) * .28 - crack * .4 + speck;
    let r = L, g = L * .975, b = L * .93;
    r = lerp(r, L * .9 + .08, li * .45); g = lerp(g, L * .88 + .08, li * .45); b = lerp(b, L * .62, li * .45);
    c[i * 4] = cl01(r) * 255; c[i * 4 + 1] = cl01(g) * 255; c[i * 4 + 2] = cl01(b) * 255; c[i * 4 + 3] = 255;
  }
  return TX.rock = { map: dataTex(c, S, false), nrm: dataTex(normalData(H, S, 14, 0), S, false) };
};

/* plant atlas: 4x4 cells of 256 px, drawn as greyscale relief (veins, fibres, gills...). The relief gives the normal map and,
   remapped per cell, the albedo detail (near-neutral, so the species' vertex colours still set the hue).
   Canvas y inside a cell = texture v (0 = leaf base / stem bottom). */
const CELL = { leaf: [0, 0], frond: [1, 0], blade: [2, 0], petal: [3, 0], bark: [0, 1], stem: [1, 1], cap: [2, 1], gill: [3, 1], pollen: [0, 2], plain: [1, 2], culm: [2, 2] };
const CS = 256, AS = 1024, INS = .035;
/* [albedo low, albedo high, normal strength, vein yellowing] */
const CPAR = { leaf: [.5, 1.05, 2.6, 1], frond: [.52, 1.05, 2.2, 1], blade: [.55, 1.02, 2, .6], petal: [.62, 1.04, 1.4, 0], bark: [.35, 1.05, 4.5, 0], stem: [.6, 1.02, 2, 0],
  cap: [.6, 1.06, 2, 0], gill: [.55, 1.02, 3.5, 0], pollen: [.5, 1.1, 3, 0], plain: [.85, .95, 1, 0], culm: [.55, 1.04, 2.2, 0] };
const cuv = (cell, u, v) => [(cell[0] + INS + u * (1 - 2 * INS)) / 4, (cell[1] + INS + v * (1 - 2 * INS)) / 4];
R.atlas = function () {
  if (TX.atlas) return TX.atlas;
  const cv = document.createElement('canvas'); cv.width = cv.height = AS; const c = cv.getContext('2d'), r = AV.rng(4711), S = CS;
  const g = (v, a) => 'rgba(' + (v | 0) + ',' + (v | 0) + ',' + (v | 0) + ',' + (a == null ? 1 : a) + ')';
  const line = (x0, y0, x1, y1, w, v, a) => { c.strokeStyle = g(v, a); c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke() };
  const blobs = (n, v0, v1, r0, r1, a) => { for (let i = 0; i < n; i++) { c.fillStyle = g(v0 + r() * (v1 - v0), a); c.beginPath(); c.arc(r() * S, r() * S, r0 + r() * (r1 - r0), 0, TAU); c.fill() } };
  const midrib = (w0, w1, v) => { for (let y = 0; y < S; y += 3) line(S / 2, y, S / 2, y + 4, w0 + (w1 - w0) * y / S, v) };
  const draw = {
    leaf() { c.fillStyle = g(118); c.fillRect(0, 0, S, S); blobs(240, 96, 140, 3, 8, .35);
      for (let k = 0; k < 9; k++) { const y0 = 10 + k * 26; for (const sd of [-1, 1]) {
        c.strokeStyle = g(180); c.lineWidth = 2.8 - k * .17; c.beginPath(); c.moveTo(S / 2, y0); c.quadraticCurveTo(S / 2 + sd * S * .22, y0 + 12, S / 2 + sd * S * .5, y0 + 46); c.stroke();
        for (let j = 1; j < 5; j++) { const f = j / 5, px = S / 2 + sd * S * .5 * f, py = y0 + 46 * f * f + 4; line(px, py, px + sd * 6, py + 16, .8, 150, .7) } } }
      midrib(7, 1.5, 225) },
    frond() { c.fillStyle = g(120); c.fillRect(0, 0, S, S); blobs(160, 100, 140, 2, 5, .3);
      for (let k = 0; k < 22; k++) { const y0 = k * 12; for (const sd of [-1, 1]) line(S / 2, y0, S / 2 + sd * S * .5, y0 + 22, 1.3, 168, .9) } midrib(4.5, 1, 215) },
    blade() { c.fillStyle = g(126); c.fillRect(0, 0, S, S); for (let k = 0; k < 11; k++) { const x = S * (k + .5) / 11; line(x, 0, x, S, 1.2, 160 + r() * 20, .9) } blobs(120, 110, 140, 1, 3, .3); midrib(3.5, 2, 205) },
    petal() { c.fillStyle = g(150); c.fillRect(0, 0, S, S); for (let k = 0; k < 18; k++) { c.strokeStyle = g(190, .9); c.lineWidth = 1.3; c.beginPath(); c.moveTo(S / 2, 0); c.quadraticCurveTo(S / 2 + (k / 17 - .5) * S * .4, S * .5, S * (k + .5) / 18, S); c.stroke() }
      const gr = c.createLinearGradient(0, 0, 0, S * .4); gr.addColorStop(0, 'rgba(0,0,0,.4)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gr; c.fillRect(0, 0, S, S) },
    bark() { c.fillStyle = g(105); c.fillRect(0, 0, S, S); for (let i = 0; i < 160; i++) { const x = r() * S; line(x, r() * 40, x + (r() - .5) * 10, S - r() * 40, 1 + r() * 2, 70 + r() * 90, .55) }
      let gr = c.createLinearGradient(0, 0, 0, 34); gr.addColorStop(0, 'rgba(0,0,0,.75)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gr; c.fillRect(0, 0, S, 34);
      gr = c.createLinearGradient(0, S - 60, 0, S); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,.4)'); c.fillStyle = gr; c.fillRect(0, S - 60, S, 60);
      for (let i = 0; i < 40; i++) { const y = 40 + r() * (S - 80), x = r() * S; line(x, y, x + 6 + r() * 14, y + (r() - .5) * 4, 1, 50, .6) } },
    stem() { c.fillStyle = g(150); c.fillRect(0, 0, S, S); for (let i = 0; i < 46; i++) { const x = r() * S; line(x, 0, x, S, 1 + r() * 1.5, 115 + r() * 80, .6) } },
    cap() { c.fillStyle = g(140); c.fillRect(0, 0, S, S); blobs(300, 105, 178, 4, 14, .3); for (let i = 0; i < 130; i++) { const x = r() * S; line(x, r() * 60, x, S, 1, 110 + r() * 70, .25) }
      for (let x = 0; x < S; x += 8) line(x, S - 30, x, S, 2, 95, .5) },
    gill() { c.fillStyle = g(70); c.fillRect(0, 0, S, S); for (let k = 0; k < 32; k++) line(S * (k + .5) / 32, 0, S * (k + .5) / 32, S, 4.2, 215) },
    pollen() { c.fillStyle = g(110); c.fillRect(0, 0, S, S); blobs(520, 190, 245, 1.5, 3.6, 1) },
    plain() { c.fillStyle = g(210); c.fillRect(0, 0, S, S); blobs(80, 195, 225, 4, 12, .4) },
    culm() { c.fillStyle = g(175); c.fillRect(0, 0, S, S); for (let i = 0; i < 34; i++) { const x = r() * S; line(x, 0, x, S, 1, 150 + r() * 60, .35) }
      c.fillStyle = g(95); c.fillRect(0, 0, S, 7); c.fillStyle = g(225); c.fillRect(0, S - 12, S, 7); c.fillStyle = g(120); c.fillRect(0, S - 5, S, 5) }
  };
  const byIdx = [];
  for (const k in CELL) { const [cx, cy] = CELL[k]; c.save(); c.translate(cx * S, cy * S); c.beginPath(); c.rect(0, 0, S, S); c.clip(); draw[k](); c.restore(); byIdx[cy * 4 + cx] = CPAR[k] }
  const px = c.getImageData(0, 0, AS, AS).data, H = new Float32Array(AS * AS), col = new Uint8Array(AS * AS * 4), DEF = [.8, .9, 1, 0];
  for (let y = 0; y < AS; y++) for (let x = 0; x < AS; x++) {
    const i = y * AS + x, h = px[i * 4] / 255, P = byIdx[(y / CS | 0) * 4 + (x / CS | 0)] || DEF, L = (P[0] + (P[1] - P[0]) * h) * (1 + (hashI(x, y, 3) - .5) * .06), t = P[3] * smooth(.6, .85, h);
    H[i] = h; col[i * 4] = cl01(L * (1 + .08 * t)) * 255; col[i * 4 + 1] = cl01(L * (1 + .05 * t)) * 255; col[i * 4 + 2] = cl01(L * (1 - .3 * t)) * 255; col[i * 4 + 3] = 255;
  }
  return TX.atlas = { map: dataTex(col, AS, true), nrm: dataTex(normalData(H, AS, (x, y) => (byIdx[(y / CS | 0) * 4 + (x / CS | 0)] || DEF)[2], CS), AS, false) };
};
/* give a (per-world) flora material the atlas textures */
R.plantify = function (m) {
  const T = R.atlas(); m.map = T.map; m.normalMap = T.nrm; m.normalScale.set(.9, .9); m.side = THREE.DoubleSide; m.roughness = .62; m.needsUpdate = true; return m;
};

/* ======================= triplanar rock material ======================= */
const RMAT = {};
R.rockMat = function (moss) {
  const key = moss ? 'moss' : 'dry'; if (RMAT[key]) return RMAT[key];
  const T = R.rockTex(), m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .9, metalness: 0 });
  const U = { tRA: { value: T.map }, tRN: { value: T.nrm }, uRS: { value: .38 }, uMA: { value: moss ? .9 : 0 }, uMC: { value: new THREE.Color(0x56702c).convertSRGBToLinear() } };
  m.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = 'varying vec3 vRW;\n' + sh.vertexShader.replace('#include <project_vertex>', `#include <project_vertex>
      vec4 rwp = vec4(transformed, 1.0);
      #ifdef USE_INSTANCING
        rwp = instanceMatrix * rwp;
      #endif
      vRW = (modelMatrix * rwp).xyz;`);
    sh.fragmentShader = `uniform sampler2D tRA, tRN; uniform float uRS, uMA; uniform vec3 uMC; varying vec3 vRW;
      vec3 rkW(vec3 n){ vec3 b = pow(abs(n), vec3(4.0)); return b / (b.x + b.y + b.z); }
      vec3 rkTri(sampler2D t, vec3 p, vec3 b){ return texture2D(t, p.zy).rgb * b.x + texture2D(t, p.xz).rgb * b.y + texture2D(t, p.xy).rgb * b.z; }
      ` + sh.fragmentShader
      .replace('#include <map_fragment>', `
        vec3 rkN = normalize((vec4(normalize(vNormal), 0.0) * viewMatrix).xyz);
        vec3 rkB = rkW(rkN);
        vec3 rkA = rkTri(tRA, vRW * uRS, rkB);
        float rkM = dot(rkTri(tRA, vRW * uRS * 0.17 + 7.3, rkB), vec3(0.333));
        rkA = pow(rkA, vec3(2.2)) * mix(0.65, 1.35, rkM);
        diffuseColor.rgb *= rkA;
        float rkMoss = uMA * smoothstep(0.42, 0.85, rkN.y + (rkM - 0.5) * 1.3);`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        diffuseColor.rgb = mix(diffuseColor.rgb, uMC * (0.45 + 1.1 * rkA.g), rkMoss);`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        roughnessFactor = mix(roughnessFactor, 1.0, rkMoss);`)
      .replace('#include <normal_fragment_maps>', `{
        vec3 wn = normalize((vec4(normal, 0.0) * viewMatrix).xyz); vec3 bw = rkW(wn); vec3 p = vRW * uRS;
        vec3 tx = texture2D(tRN, p.zy).xyz * 2.0 - 1.0, ty = texture2D(tRN, p.xz).xyz * 2.0 - 1.0, tz = texture2D(tRN, p.xy).xyz * 2.0 - 1.0;
        float ns = 1.0 - rkMoss * 0.6; tx.xy *= ns; ty.xy *= ns; tz.xy *= ns;
        tx = vec3(tx.xy + wn.zy, abs(tx.z) * wn.x); ty = vec3(ty.xy + wn.xz, abs(ty.z) * wn.y); tz = vec3(tz.xy + wn.xy, abs(tz.z) * wn.z);
        normal = normalize((viewMatrix * vec4(normalize(tx.zyx * bw.x + ty.xzy * bw.y + tz.xyz * bw.z), 0.0)).xyz);
      }`);
  };
  m.customProgramCacheKey = () => 'rockTri';
  m.userData.lin = 1; m.userData.shared = true; return RMAT[key] = m;
};

/* ======================= rock geometry ======================= */
function icosphere(det) {
  const t = (1 + Math.sqrt(5)) / 2, V = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]].map(nrm);
  let F = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
  for (let d = 0; d < det; d++) {
    const cache = new Map(), F2 = [], mid = (a, b) => { const k = a < b ? a * 1e6 + b : b * 1e6 + a; let i = cache.get(k); if (i == null) { i = V.length; V.push(nrm(sc(add(V[a], V[b]), .5))); cache.set(k, i) } return i };
    for (const [a, b, c] of F) { const ab = mid(a, b), bc = mid(b, c), ca = mid(c, a); F2.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]) } F = F2;
  }
  return { V, F };
}
const NV = 6, RV = {};
R.rockDetail = () => [1, 3, 4][K.q()];
/* one rock shape (indexed, shared, cached): displaced + chiselled by random planes + flattened base, cavity AO in vertex colours */
R.rockVariant = function (v, det) {
  det = det == null ? R.rockDetail() : det; const key = v + ':' + det; if (RV[key]) return RV[key];
  const seed = 101 + v * 37, rng = AV.rng(seed), { V, F } = icosphere(det), o = [rng() * 50, rng() * 50, rng() * 50], planes = [], el = [.9 + rng() * .35, .72 + rng() * .3, .9 + rng() * .3];
  for (let i = 0, n = 3 + (rng() * 3 | 0); i < n; i++) { const a = rng() * TAU; planes.push([nrm([Math.cos(a), (rng() - .3) * 1.4, Math.sin(a)]), .6 + rng() * .25]) }
  const P = V.map(p => {
    const n1 = fbm3(p[0] * 1.3 + o[0], p[1] * 1.3 + o[1], p[2] * 1.3 + o[2], 4, seed), rd = 1 - Math.abs(2 * vnoise3(p[0] * 3.1 + o[1], p[1] * 3.1 + o[2], p[2] * 3.1 + o[0], seed + 7) - 1);
    const n3 = det > 2 ? fbm3(p[0] * 7 + o[2], p[1] * 7, p[2] * 7 + o[0], 3, seed + 3) : .5, r = .72 + n1 * .5 - rd * rd * .08 + (n3 - .5) * .09;
    let q = [p[0] * r * el[0], p[1] * r * el[1], p[2] * r * el[2]];
    for (const [n, d] of planes) { const e = dot(q, n) - d; if (e > 0) q = sub(q, sc(n, e * .88)) }
    if (q[1] < -.3) q[1] = -.3 + (q[1] + .3) * .25;
    return q;
  });
  const g = new THREE.BufferGeometry(), pos = new Float32Array(P.length * 3); P.forEach((p, i) => pos.set(p, i * 3));
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(F.flat()); g.computeVertexNormals();
  /* cavity: how far a vertex sits below the average of its neighbours (along its normal), relative to the local edge length */
  const nb = P.map(() => new Set()); for (const [a, b, c] of F) { nb[a].add(b).add(c); nb[b].add(a).add(c); nb[c].add(a).add(b) }
  const N = g.attributes.normal, col = new Float32Array(P.length * 3);
  P.forEach((p, i) => {
    let av = [0, 0, 0], el2 = 0; for (const j of nb[i]) { av = add(av, P[j]); el2 += Math.hypot(...sub(P[j], p)) } const n = nb[i].size; av = sc(av, 1 / n); el2 /= n;
    const conv = dot(sub(p, av), [N.getX(i), N.getY(i), N.getZ(i)]) / (el2 || 1), ao = Math.max(.5, Math.min(1.12, .95 + conv * 1.6)) * (.55 + .45 * smooth(-.3, .2, p[1]));
    col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = ao;
  });
  g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeBoundingSphere(); g.userData.shared = true;
  return RV[key] = g;
};
/* the given (often pastel/psychedelic) rock colour pulled toward natural stone */
const _rc = new THREE.Color(), _nat = new THREE.Color(0x8d877e);
R.rockColor = (hex, out) => (out || _rc).setHex(hex).lerp(_nat, .45).convertSRGBToLinear();

/* batches get .rock(colour, matrix, {dry}) -> flushed as instanced, spatially chunked rocks */
const _batch = K.batch;
K.batch = function () {
  const b = _batch.apply(this, arguments), rocks = [], fl = b.flush;
  b.rock = (col, m, opt) => rocks.push({ col, m, dry: !!(opt && opt.dry), v: opt && opt.v });
  b.flush = function (ctx, opt) { const out = fl.call(b, ctx, opt); if (rocks.length) { out.push(...R.flushRocks(ctx, rocks)); rocks.length = 0 } return out };
  return b;
};
R.flushRocks = function (ctx, rocks) {
  const grp = new THREE.Group(), lists = new Map(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), col = new THREE.Color();
  rocks.forEach((r, i) => {
    r.m.decompose(_p, _q, _s); const v = (r.v != null ? r.v : i * 7 + Math.floor(Math.abs(_p.x * 3 + _p.z * 5))) % NV, k = v + (r.dry ? 'd' : 'm');
    if (!lists.has(k)) lists.set(k, { v, dry: r.dry, items: [] }); lists.get(k).items.push({ x: _p.x, y: _p.y, z: _p.z, _sc: Math.max(_s.x, _s.y, _s.z), m: r.m, col: r.col, k: .88 + (i % 5) * .06 });
  });
  for (const L of lists.values()) K.instChunks(grp, R.rockVariant(L.v), R.rockMat(!L.dry), L.items, { cell: 60 }, it => it.m, it => R.rockColor(it.col, col).multiplyScalar(it.k));
  ctx.group.add(grp); return grp.children;
};
/* a single rock in a batch (realistic when enabled, else the original textured icosahedron) */
A.rock = function (B, MT, col, m, opt) { if (R.on() && B.rock) B.rock(col, m, opt); else B.add(MT.stone, A.geo('ico'), col, m) };
const _boulders = A.boulders;
A.boulders = function (B, MT, pts, H, rng, o) {
  if (!R.on() || !B.rock) return _boulders.apply(this, arguments);
  o = o || {};   /* same rng() consumption as the original, so the rest of the world is laid out identically */
  for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / (o.step || 5)); for (let k = 0; k < n; k++) {
    const f = k / n, x = a[0] + (b[0] - a[0]) * f + (rng() - .5) * 2, z = a[1] + (b[1] - a[1]) * f + (rng() - .5) * 2, s = (o.s0 || 3) + rng() * ((o.s1 || 7) - (o.s0 || 3));
    B.rock([0xb8a0b0, 0xa898a8, 0xc8b0a0, 0x9a8aa8][(i + k) % 4], K.M(x, H(x, z) - s * .25 + (o.lift || 0), z, s, s * (.8 + rng() * .7), s * (.8 + rng() * .4), rng() * .5, rng() * 3, rng() * .3));
    if (rng() < .5) { rng(); rng() }   // (moss blobs are now part of the rock shader)
  } }
};

/* ======================= plant geometry builder ======================= */
const _lc = new THREE.Color(), _hsl = {};
/* hex -> linear rgb, optional HSL jitter */
function lin(hex, rng, jh, js, jl) {
  _lc.setHex(hex); if (rng) { _lc.getHSL(_hsl); _lc.setHSL((_hsl.h + (rng() - .5) * jh + 1) % 1, cl01(_hsl.s * (1 + (rng() - .5) * js)), cl01(_hsl.l * (1 + (rng() - .5) * jl))) }
  _lc.convertSRGBToLinear(); return [_lc.r, _lc.g, _lc.b];
}
const mul = (c, k) => [c[0] * k, c[1] * k, c[2] * k], mixc = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
class MB {
  constructor() { this.P = []; this.U = []; this.C = []; this.G = []; this.I = []; this.bend = [] }
  get n() { return this.P.length / 3 }
  /* (nu+1)x(nv+1) vertex grid; f(i,j) -> [pos, uv, rgb, glow]. Face normal = d/du x d/dv */
  grid(nu, nv, f) {
    const b = this.n;
    for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) { const [p, uv, c, g] = f(i, j); this.P.push(p[0], p[1], p[2]); this.U.push(uv[0], uv[1]); this.C.push(c[0], c[1], c[2]); this.G.push(g || 0) }
    for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { const a = b + j * (nu + 1) + i, c = a + nu + 1; this.I.push(a, a + 1, c, a + 1, c + 1, c) }
    return b;
  }
  /* small noisy icosphere blob (warts, coconuts, inner foliage mass, flower centres) */
  blob(c, s, det, cell, col, glow, rng) {
    const { V, F } = icosphere(det), b = this.n;
    for (const v of V) { const k = rng ? .85 + rng() * .3 : 1; this.P.push(c[0] + v[0] * s[0] * k, c[1] + v[1] * s[1] * k, c[2] + v[2] * s[2] * k); const uv = cuv(cell, .5 + v[0] * .5, .5 + v[2] * .5); this.U.push(uv[0], uv[1]); this.C.push(col[0], col[1], col[2]); this.G.push(glow || 0) }
    for (const f of F) this.I.push(b + f[0], b + f[1], b + f[2]);
  }
  build() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(this.U, 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.C, 3)); g.setAttribute('aGlow', new THREE.Float32BufferAttribute(this.G, 1));
    g.setIndex(this.I); g.computeVertexNormals();
    const N = g.attributes.normal;   /* foliage: bend leaf normals toward the canopy's outward direction (soft, volumetric shading) */
    for (const [s, e, d, k] of this.bend) for (let i = s; i < e; i++) { const n = nrm([lerp(N.getX(i), d[0], k), lerp(N.getY(i), d[1], k), lerp(N.getZ(i), d[2], k)]); N.setXYZ(i, n[0], n[1], n[2]) }
    g.computeBoundingSphere(); g.userData.real = 'plant'; return g;
  }
}
/* width profiles along a leaf (t: 0 base -> 1 tip), as fraction of full width */
const PROF = {
  broad: t => Math.max(.08, Math.pow(Math.sin(Math.PI * Math.pow(t, .75)), .75)),
  lance: t => Math.max(.06, Math.sin(Math.PI * Math.pow(t, .62))),
  blade: t => Math.pow(1 - t, .75) * (.55 + .45 * Math.min(1, t * 6)),
  petal: t => Math.max(.1, Math.pow(Math.sin(Math.PI * (.08 + .8 * Math.pow(t, 1.3))), .6))
};
/* a leaf blade: origin o, length axis L, front faces toward nh; droop bends the tip down (world), fold > 0 lifts the edges (V/cup) */
function leaf(m, o, L, nh, len, wid, prof, droop, fold, segT, cell, col, glow, shade) {
  let W = cross(L, nh); if (Math.hypot(...W) < 1e-4) W = cross(L, [1, 0, 0]); W = nrm(W); const N = cross(W, L);
  return m.grid(2, segT, (i, j) => {
    const s = i / 2, t = j / segT, hw = prof(t) * wid * .5, x = (s * 2 - 1) * hw, y = fold * Math.abs(s * 2 - 1) * hw, dz = droop * t * t * len, k = shade ? shade(s, t) : .72 + .28 * Math.min(1, t * 2.5);
    return [[o[0] + L[0] * t * len + W[0] * x + N[0] * y, o[1] + L[1] * t * len + W[1] * x + N[1] * y - dz, o[2] + L[2] * t * len + W[2] * x + N[2] * y], cuv(cell, s, t), mul(col, k), glow];
  });
}
/* tube along a polyline (parallel-transport frames). rad(t), colFn(t), t in 0..1 */
function tube(m, pts, rad, nr, cell, colFn, glow) {
  const n = pts.length, T = [], B1 = [], B2 = [];
  for (let i = 0; i < n; i++) T.push(nrm(sub(pts[Math.min(n - 1, i + 1)], pts[Math.max(0, i - 1)])));
  let b = nrm(cross(T[0], Math.abs(T[0][1]) < .95 ? [0, 1, 0] : [1, 0, 0]));
  for (let i = 0; i < n; i++) { if (i) b = nrm(sub(b, sc(T[i], dot(b, T[i])))); B1.push(b); B2.push(cross(T[i], b)) }
  m.grid(nr, n - 1, (i, j) => { const a = i / nr * TAU, t = j / (n - 1), r = rad(t); return [add(pts[j], add(sc(B1[j], Math.cos(a) * r), sc(B2[j], Math.sin(a) * r))), cuv(cell, i / nr, t), colFn(t), glow] });
}
/* surface of revolution around +Y at o; prof = [[r, y], ...] */
function lathe(m, prof, nr, cell, colFn, glow, o) {
  o = o || [0, 0, 0]; const L = prof.length - 1;
  m.grid(nr, L, (i, j) => { const a = i / nr * TAU, [r, y] = prof[j], t = j / L; return [[o[0] + Math.cos(a) * r, o[1] + y, o[2] + Math.sin(a) * r], cuv(cell, i / nr, t), colFn(t), glow] });
}
/* planar arching curve: starts at elevation el (rad above horizontal) heading yaw, turns down by `bend` over its length */
function arc(o, yaw, el, len, bend, n) {
  const pts = [], tan = [], cy = Math.cos(yaw), sy = Math.sin(yaw), ds = len / n; let p = o.slice(), a = el;
  for (let i = 0; i <= n; i++) { const t = [Math.cos(a) * cy, Math.sin(a), Math.cos(a) * sy]; pts.push(p.slice()); tan.push(t); p = add(p, sc(t, ds)); a -= bend / n }
  return { pts, at(t) { const f = cl01(t) * n, i = Math.min(n - 1, Math.floor(f)), k = f - i; return { p: add(pts[i], sc(sub(pts[i + 1], pts[i]), k)), t: nrm(add(tan[i], sc(sub(tan[i + 1], tan[i]), k))) } } };
}
const hseed = (...a) => a.reduce((s, v) => (Math.imul(s ^ (v | 0), 16777619) >>> 0), 2166136261) % 100000;

/* ======================= realistic species (unit scale, origin at the ground, same footprint as the originals) ======================= */
const RS = {
  fern(c) {
    const q = K.q(), rng = AV.rng(hseed(1, c)), m = new MB(), nF = q > 1 ? 11 : 8, nP = q > 1 ? 13 : 9, sT = q > 1 ? 3 : 2;
    for (let f = 0; f < nF; f++) {
      const yaw = f / nF * TAU + (rng() - .5) * .5, len = .8 + rng() * .35, el = .75 + rng() * .45, fc = lin(c, rng, .03, .15, .2);
      const A = arc([Math.cos(yaw) * .03, .02, Math.sin(yaw) * .03], yaw, el, len, el + .55 + rng() * .4, q > 1 ? 10 : 6), side = [-Math.sin(yaw), 0, Math.cos(yaw)];
      tube(m, A.pts, t => .012 * (1 - t * .7), 3, CELL.stem, () => mul(fc, .62), .1);
      for (let k = 0; k < nP; k++) {
        const t = .12 + .86 * (k + .5) / nP, at = A.at(t), pl = len * .27 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.05)), .7) + .015;
        for (const sd of [-1, 1]) leaf(m, at.p, nrm(add(sc(side, sd * .8), sc(at.t, .55))), [0, 1, 0], pl, pl * .34, PROF.lance, .25, .15, sT, CELL.frond, fc, .2, (s, tt) => .68 + .32 * tt);
      }
    }
    if (q > 1) for (let k = 0; k < 2; k++) {   /* fiddleheads: young fronds still coiled */
      const yaw = rng() * TAU, d = [Math.cos(yaw), 0, Math.sin(yaw)], h = .2 + rng() * .08, pts = [], C0 = [d[0] * .045, h, d[2] * .045];
      for (let i = 0; i <= 6; i++) pts.push([0, h * i / 6, 0]);
      for (let i = 1; i <= 18; i++) { const ph = i / 18 * 3.5 * Math.PI, rho = .045 * (1 - ph / (3.6 * Math.PI)) + .004; pts.push(add(C0, add(sc(d, -Math.cos(ph) * rho), [0, Math.sin(ph) * rho, 0]))) }
      tube(m, pts, t => .011 * (1 - t * .5), 4, CELL.stem, () => lin(c, null), .15);
    }
    return m.build();
  },
  bush(c1, c2) {
    const q = K.q(), rng = AV.rng(hseed(2, c1, c2)), m = new MB(), nL = q > 1 ? 230 : 120, sT = q > 1 ? 2 : 1, wood = lin(0x4a3424);
    const lobes = [[0, .55, 0, .8, .62, .8], [.55, .42, .2, .55, .45, .55], [-.5, .4, -.15, .55, .42, .55]], vol = lobes.map(l => l[3] * l[4] * l[5]), vs = vol[0] + vol[1] + vol[2];
    for (const lb of lobes) m.blob([lb[0], lb[1], lb[2]], [lb[3] * .8, lb[4] * .78, lb[5] * .8], 1, CELL.leaf, mul(lin(c1), .36), .05, rng);   /* inner mass hides gaps */
    for (let i = 0; i < 7; i++) {
      const lb = lobes[i % 3], a = rng() * TAU, tip = [lb[0] + Math.cos(a) * lb[3] * .6, lb[1] + lb[4] * (.1 + rng() * .5), lb[2] + Math.sin(a) * lb[5] * .6], pts = [];
      for (let k = 0; k <= 5; k++) { const t = k / 5; pts.push([tip[0] * t + Math.sin(t * 3 + i) * .03, tip[1] * Math.pow(t, .8), tip[2] * t]) }
      tube(m, pts, t => .035 * (1 - t * .7), q > 1 ? 5 : 4, CELL.bark, () => wood, 0);
    }
    const onHull = minY => { let pk = rng() * vs, li = 0; while (li < 2 && pk > vol[li]) pk -= vol[li++]; const lb = lobes[li]; let d;
      do { d = [rng() * 2 - 1, rng() * 2 - 1, rng() * 2 - 1] } while (dot(d, d) > 1 || dot(d, d) < .05 || nrm(d)[1] < minY); d = nrm(d);
      return { d, lb } };
    for (let i = 0; i < nL; i++) {
      const { d, lb } = onHull(-.45), rf = .78 + rng() * .26, o = [lb[0] + d[0] * lb[3] * rf, lb[1] + d[1] * lb[4] * rf, lb[2] + d[2] * lb[5] * rf]; if (o[1] < .05) continue;
      const L = nrm(add(sc(d, .55), [rng() - .5, rng() - .25, rng() - .5])), len = .2 + rng() * .1, st = m.n;
      leaf(m, o, L, d, len, len * .55, PROF.broad, .25, .18, sT, CELL.leaf, lin(c1, rng, .05, .2, .32), .12);
      m.bend.push([st, m.n, d, .55]);
    }
    const fl = c2 == null ? 0xff7ab8 : c2, ctr = lin(0xffe07a);
    for (let i = 0; i < (q > 1 ? 14 : 8); i++) {
      const { d, lb } = onHull(.15), o = [lb[0] + d[0] * lb[3] * 1.03, lb[1] + d[1] * lb[4] * 1.03, lb[2] + d[2] * lb[5] * 1.03], W0 = nrm(cross(d, Math.abs(d[1]) < .9 ? [0, 1, 0] : [1, 0, 0])), V0 = cross(d, W0), a0 = rng() * TAU, pc = lin(fl, rng, .02, .1, .15);
      for (let p = 0; p < 5; p++) { const a = a0 + p / 5 * TAU; leaf(m, o, nrm(add(add(sc(W0, Math.cos(a)), sc(V0, Math.sin(a))), sc(d, .3))), d, .075, .065, PROF.petal, 0, .2, sT, CELL.petal, pc, .8, (s, t) => .7 + .3 * t) }
      m.blob(add(o, sc(d, .01)), [.018, .018, .018], 0, CELL.pollen, ctr, .9);
    }
    return m.build();
  },
  flower(petal, center, n) {
    n = n || 6; const q = K.q(), rng = AV.rng(hseed(3, petal, center, n)), m = new MB(), sT = q > 1 ? 3 : 2, ns = q > 1 ? 6 : 4, H = .52, bx = (rng() - .5) * .08, bz = (rng() - .5) * .08, pts = [];
    for (let k = 0; k <= ns; k++) { const t = k / ns; pts.push([bx * t * t, H * t, bz * t * t]) }
    const stemC = lin(0x3f7f34); tube(m, pts, t => .011 * (1 - t * .35), q > 1 ? 5 : 4, CELL.stem, t => mul(stemC, .8 + .2 * t), 0);
    for (let k = 0; k < 2; k++) { const a = rng() * TAU + k * Math.PI; leaf(m, [0, .03 + k * .06, 0], nrm([Math.cos(a), .9, Math.sin(a)]), [0, 1, 0], .2 + rng() * .06, .055, PROF.lance, .55, .25, sT, CELL.blade, lin(0x3a9a44, rng, .02, .1, .2), 0) }
    const top = pts[ns], up = nrm(sub(top, pts[ns - 1])), W0 = nrm(cross(up, [1, 0, 0])), V0 = cross(up, W0), dir = a => add(sc(W0, Math.cos(a)), sc(V0, Math.sin(a)));
    for (let k = 0; k < 5; k++) leaf(m, top, nrm(add(dir(k / 5 * TAU), sc(up, -.5))), up, .04, .02, PROF.lance, 0, .1, 1, CELL.blade, stemC, 0);   /* sepals */
    const pc = lin(petal), a0 = rng() * TAU, wid = n <= 6 ? .085 : .06;
    for (let k = 0; k < n; k++) { const a = a0 + k / n * TAU + (rng() - .5) * .15; leaf(m, add(top, sc(up, .006)), nrm(add(dir(a), sc(up, .45))), up, .12 + rng() * .015, wid, PROF.petal, .22, .2, sT, CELL.petal, mul(pc, .92 + rng() * .16), .9, (s, t) => .68 + .32 * t) }
    if (q > 1 && n <= 6) for (let k = 0; k < n; k++) { const a = a0 + (k + .5) / n * TAU; leaf(m, add(top, sc(up, .012)), nrm(add(dir(a), sc(up, .95))), up, .085, wid * .85, PROF.petal, .1, .3, 2, CELL.petal, pc, .9, (s, t) => .62 + .38 * t) }
    lathe(m, [[0, .03], [.02, .028], [.032, .018], [.036, .007], [.028, 0]], q > 1 ? 10 : 7, CELL.pollen, () => lin(center || 0xffe040), 1, add(top, sc(up, .004)));
    return m.build();
  },
  grass(c) {
    const q = K.q(), rng = AV.rng(hseed(4, c)), m = new MB(), nB = q > 1 ? 16 : 10, sT = q > 1 ? 4 : 3;
    for (let i = 0; i < nB; i++) { const a = rng() * TAU, r = rng() * .07, out = [Math.cos(a), 0, Math.sin(a)];
      leaf(m, [out[0] * r, 0, out[2] * r], nrm([out[0] * (.15 + rng() * .3), 1, out[2] * (.15 + rng() * .3)]), out, .3 + rng() * .2, .028, PROF.blade, .35 + rng() * .3, .3, sT, CELL.blade, lin(c, rng, .04, .2, .3), .05, (s, t) => .6 + .4 * t) }
    return m.build();
  },
  mushroom(cap, stem, spot) {
    const q = K.q(), rng = AV.rng(hseed(5, cap, stem, spot)), m = new MB(), nr = q > 1 ? 24 : 14, ns = q > 1 ? 16 : 10, stc = lin(stem || 0xf4e8d0), cc = lin(cap), spc = lin(spot || 0xfff6e0);
    lathe(m, [[.085, .6], [.1, .52], [.11, .4], [.12, .25], [.14, .12], [.18, .05], [.17, .015], [.12, 0]], ns, CELL.stem, t => mul(stc, .95 - .2 * t), .25);   /* stalk with bulbous base */
    lathe(m, [[.1, .5], [.14, .485], [.175, .45], [.19, .42]], ns, CELL.gill, () => mul(stc, .9), .25);   /* ring */
    const R0 = .5, Hc = .36, y0 = .58, rows = q > 1 ? 10 : 6, capP = [];
    for (let k = 0; k <= rows; k++) { const t = k / rows; capP.push([R0 * Math.sin(t * Math.PI / 2), y0 + Hc * Math.pow(Math.cos(t * Math.PI / 2), .8)]) }
    capP.push([R0 * 1.0, y0 - .02], [R0 * .95, y0 - .035]);
    lathe(m, capP, nr, CELL.cap, t => mul(cc, .78 + .3 * t), .85);
    lathe(m, [[R0 * .95, y0 - .035], [R0 * .6, y0 + .01], [.1, y0 + .04]], nr, CELL.gill, () => mul(stc, .82), .25);   /* gills */
    for (let i = 0, nS = q > 1 ? 11 : 7; i < nS; i++) {
      const t = .1 + rng() * .75, a = rng() * TAU, ca = Math.cos(a), sa = Math.sin(a), r = R0 * Math.sin(t * Math.PI / 2), y = y0 + Hc * Math.pow(Math.cos(t * Math.PI / 2), .8);
      const dr = R0 * Math.PI / 2 * Math.cos(t * Math.PI / 2), dy = -Hc * .8 * Math.pow(Math.max(1e-3, Math.cos(t * Math.PI / 2)), -.2) * Math.sin(t * Math.PI / 2) * Math.PI / 2, nn = nrm([-dy, dr, 0]), N = nrm([ca * nn[0], nn[1], sa * nn[0]]);
      const s = .035 + rng() * .025; m.blob(add([ca * r, y, sa * r], sc(N, .006)), [s, s * .5, s], q > 1 ? 1 : 0, CELL.plain, spc, 1, rng);
    }
    return m.build();
  },
  palm(trunk, leafC) {
    const q = K.q(), rng = AV.rng(hseed(6, trunk, leafC)), m = new MB(), H = 4.68, lean = .54, nRing = q > 1 ? 16 : 10, nr = q > 1 ? 10 : 7, tc = lin(trunk);
    const P = t => [lean * Math.pow(t, 1.8), H * t, 0], rad = t => .16 * (1 - t * .38) + .07 * Math.pow(Math.max(0, 1 - t * 6), 2);
    for (let k = 0; k < nRing; k++) { const t0 = k / nRing, t1 = (k + 1) / nRing, col = mul(tc, .78 + rng() * .32);
      tube(m, [P(t0), P((t0 + t1) / 2), P(t1)], tt => rad(t0 + (t1 - t0) * tt) * (.94 + .1 * tt), nr, CELL.bark, tt => mul(col, .72 + .28 * tt), 0) }
    const top = P(1);
    lathe(m, [[0, .38], [.07, .33], [.13, .2], [.14, .06], [.11, -.04]], nr, CELL.stem, () => lin(0x6a6a30), 0, top);
    for (let k = 0, nc = q > 1 ? 4 : 3; k < nc; k++) { const a = k / nc * TAU + rng(); m.blob(add(top, [Math.cos(a) * .15, -.05 - rng() * .08, Math.sin(a) * .15]), [.1, .11, .1], q > 1 ? 1 : 0, CELL.stem, lin(0x5a4a1a), 0) }
    const nF = q > 1 ? 12 : 8, nP = q > 1 ? 22 : 14, sT = q > 1 ? 3 : 2, dry = lin(0x8a8a3a);
    for (let f = 0; f < nF; f++) {
      const yaw = f / nF * TAU + (rng() - .5) * .4, age = (f * 5 % nF) / nF, el = .75 - age * 1.05, len = 1.6 + rng() * .4, side = [-Math.sin(yaw), 0, Math.cos(yaw)];
      const A = arc(add(top, [0, .3, 0]), yaw, el, len, .9 + rng() * .5, q > 1 ? 12 : 8), fc = mixc(lin(leafC, rng, .03, .15, .2), dry, age * .35);
      tube(m, A.pts, t => .028 * (1 - t * .8), 4, CELL.stem, () => mul(fc, .7), .05);
      for (let k = 0; k < nP; k++) {
        const t = .06 + .92 * (k + .5) / nP, at = A.at(t), ll = .48 * Math.pow(Math.sin(Math.PI * Math.min(1, .15 + t * .9)), .6) + .06;
        for (const sd of [-1, 1]) leaf(m, at.p, nrm(add(add(sc(side, sd * .75), sc(at.t, .5)), [0, -.3, 0])), nrm(add([0, 1, 0], sc(side, -sd * .4))), ll, .055, PROF.lance, .35, .12, sT, CELL.frond, fc, .2, (s, tt) => .7 + .3 * tt);
      }
    }
    return m.build();
  },
  bamboo(c) {
    const q = K.q(), rng = AV.rng(hseed(7, c)), m = new MB(), nr = q > 1 ? 8 : 6, cc = lin(c), nodeC = lin(0x8a9a3a), lc = 0x5aa83a, sT = q > 1 ? 2 : 1;
    for (let i = 0; i < 5; i++) {
      const a = i * 1.7, r = i ? .35 : 0, h = 5 + (i * 37 % 4), lx = Math.cos(a) * (i ? .06 : .02), lz = Math.sin(a) * (i ? .06 : .02), base = [Math.cos(a) * r, 0, Math.sin(a) * r];
      const P = y => [base[0] + lx * y * y / h, y, base[2] + lz * y * y / h];
      let y = 0, k = 0;
      while (y < h - .05) {
        const seg = Math.min(h - y, .45 + .06 * k + rng() * .1), y1 = y + seg, R0 = .07 - .025 * (y / h), R1 = .07 - .025 * (y1 / h);
        tube(m, [0, .5, .9, 1].map(t => P(y + seg * t)), t => lerp(R0, R1, t) * (1 + .14 * smooth(.85, 1, t)), nr, CELL.culm, t => mixc(cc, nodeC, smooth(.8, 1, t)), 0);
        if (y1 > h * .45 && (q > 1 || k % 2)) {   /* leafy twig at the node */
          const az = rng() * TAU, o = add(P(y1), [Math.cos(az) * .12, .05, Math.sin(az) * .12]);
          tube(m, [P(y1), o], () => .008, 3, CELL.stem, () => nodeC, 0);
          for (let j = 0; j < 3 + (rng() * 2 | 0); j++) { const b = az + (j - 1.5) * .5; leaf(m, o, nrm([Math.cos(b) * .9, -.2 + rng() * .35, Math.sin(b) * .9]), [0, 1, 0], .3 + rng() * .1, .05, PROF.lance, .45, .15, sT, CELL.blade, lin(lc, rng, .04, .15, .25), .1) }
        }
        y = y1; k++;
      }
      const tp = P(h); for (let j = 0; j < 4; j++) { const b = rng() * TAU; leaf(m, tp, nrm([Math.cos(b) * .7, .5, Math.sin(b) * .7]), [0, 1, 0], .32, .05, PROF.lance, .4, .15, sT, CELL.blade, lin(lc, rng, .04, .15, .25), .1) }
    }
    return m.build();
  },
  rock(c) {
    const g = R.rockVariant(hseed(8, c) % NV).clone(), col = g.attributes.color, rc = R.rockColor(c);
    for (let i = 0; i < col.count; i++) col.setXYZ(i, col.getX(i) * rc.r, col.getY(i) * rc.g, col.getZ(i) * rc.b);
    g.userData = { real: 'rock' }; return g;
  }
};
R.species = RS;
const OLD = R.classic = Object.assign({}, K.species);
for (const name in RS) K.species[name] = function () {
  if (R.on()) { try { return RS[name].apply(this, arguments) } catch (e) { console.warn('realistic ' + name + ' failed, using the classic look', e) } }
  return OLD[name].apply(this, arguments);
};

/* scatter: realistic geometries get the atlas (plants) or the triplanar rock material */
const _scatter = K.scatter;
K.scatter = function (ctx, geo, mat, items, opt) {
  const r = geo && geo.userData && geo.userData.real;
  /* rocks share one material with the instanced boulders, which always carry instance colours; r128 does not switch programs on
     that difference, so give every scattered rock an instance colour too */
  if (r === 'rock') { mat = R.rockMat(true); items = items.map(it => it.tint == null ? Object.assign({}, it, { tint: 1 }) : it) }
  else if (r === 'plant') R.plantify(mat);
  return _scatter.call(this, ctx, geo, mat, items, opt);
};
/* the low-poly CC0 GLB versions of these species are replaced by the detailed procedural ones */
const PREFER = /^quaternius\/(fern|bush|bush_flowers|flower_group|mushroom_a|palm_[abc])$/;
R.prefersProcedural = key => R.on() && PREFER.test(key);
const _inst = K.instModel;
K.instModel = function (ctx, key, items, fallback, opt) {
  if (fallback && R.prefersProcedural(key)) { if (items.length) fallback(items); return }
  return _inst.apply(this, arguments);
};
})(window.AV);
