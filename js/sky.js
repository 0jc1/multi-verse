/* APEVERSE V0.10 - js/sky.js : realistic sky box, clouds, air and lighting.
   - Physically based single-scattering atmosphere (Rayleigh + Mie + a multiple-scattering term) for the sky colour.
   - Volumetric cumulus clouds (Beer-Powder, forward-scattering phase) inside the same atmosphere.
   - The sky is rendered into a CUBEMAP one face per frame (amortised), so the per-pixel cost on screen is a single
     cube lookup instead of a raymarch every frame. Camera translation needs no refresh (sky is at infinity).
     There is a cheap 8-bit fallback when half-float cube targets are missing.
   - Display pass adds the sun disk (limb darkened), the moon with its real phase, stars and an optional aurora, and
     blends into the fog colour at the horizon so distant terrain and sky meet without a seam.
   - Lighting: sun/moon colour and strength come from the atmospheric transmittance; the hemisphere light is sampled
     from the sky; the fog colour is sampled from the sky along the view direction. Shadows are texel-snapped.
   - Per world, `sky.dome` still drives cloud cover (cloud), swirl (aurora), s1/s2 (aurora tints), glow (flora),
     and `sky.fixed`/`sky.tint` still pin a night sky or tint the air (Verdalux, Astro-9, Chiang Mai, Jungle Dub). */
'use strict';
(function (AV) {
const TAU = AV.TAU || Math.PI * 2, R = AV.R, scene = AV.scene, cam = AV.cam;
if (!R || !scene) return;
const SK = AV.sky = {};
const V3 = (x, y, z) => new THREE.Vector3(x, y, z), COL = h => new THREE.Color(h);
const cl = (v, a, b) => v < a ? a : v > b ? b : v, ss = (a, b, x) => { const t = cl((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t) };

/* ---------- physical constants (metres) ---------- */
const RE = [5.8e-6, 13.5e-6, 33.1e-6], ME = 21e-6, HR = 8000, HM = 1200, RPL = 6360000, RAT = 6420000, CBASE = 1400, CTOP = 4200;
const SUN_E = 22;                       /* sun energy scale: tunes the sky against the scene lights */
SK.cons = { sunE: SUN_E };

/* ---------- state ---------- */
SK.time = 0; SK.nightK = 0; SK.dayK = 1; SK.cloud = .5; SK.exposure = 1.05; SK.fixed = null;
SK.sunDir = V3(0, 1, 0); SK.moonDir = V3(0, 1, 0);
SK.lightDir = V3(0, 1, 0); SK.lightCol = [1, 1, 1]; SK.lightIntensity = 1;
SK.nightTop = [.014, .020, .048]; SK.nightHor = [.045, .048, .062];
SK.tint = [1, 1, 1, 0]; SK.tintFog = [1, 1, 1, 0];
SK.aurora = 0; SK.cfg = {};

/* ---------- cube target ---------- */
const gl = R.getContext();
const HALF = !!(R.capabilities.isWebGL2 && (gl.getExtension('EXT_color_buffer_half_float') || gl.getExtension('EXT_color_buffer_float')));
SK.hdr = HALF;
SK.q = -1; SK.dirty = 6; SK.face = 0; SK.every = 1; SK.frameN = 0;
const QP = [
  { size: 96, steps: 6, lsteps: 1, every: 2 },
  { size: 160, steps: 10, lsteps: 2, every: 1 },
  { size: 224, steps: 14, lsteps: 2, every: 1 }
];
SK.qn = () => { const g = AV.S && AV.S.set && AV.S.set.gq; return { Low: 0, Medium: 1, High: 2 }[g] ?? 2; };

/* ---------- tileable noise texture (clouds, aurora, moon) ---------- */
let noiseTex = null;
function makeNoise(S) {
  const rng = AV.rng(1337);
  const oct = cells => { const g = new Float32Array(cells * cells); for (let i = 0; i < g.length; i++) g[i] = rng(); return (u, v) => {
    const x = u * cells, y = v * cells, xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const x0 = ((xi % cells) + cells) % cells, y0 = ((yi % cells) + cells) % cells, x1 = (x0 + 1) % cells, y1 = (y0 + 1) % cells;
    const a = g[y0 * cells + x0], b = g[y0 * cells + x1], c = g[y1 * cells + x0], d = g[y1 * cells + x1];
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy } };
  const o1 = oct(4), o2 = oct(8), o3 = oct(16), o4 = oct(32);
  const d = new Uint8Array(S * S * 4);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const u = x / S, v = y / S, i = (y * S + x) * 4;
    d[i] = cl(o1(u, v) * .55 + o2(u, v) * .3 + o3(u, v) * .15, 0, 1) * 255;
    d[i + 1] = cl(o2(u, v) * .5 + o3(u, v) * .35 + o4(u, v) * .15, 0, 1) * 255;
    d[i + 2] = cl(o3(u, v) * .6 + o4(u, v) * .4, 0, 1) * 255;
    d[i + 3] = rng() * 255;
  }
  const t = new THREE.DataTexture(d, S, S, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.minFilter = t.magFilter = THREE.LinearFilter; t.needsUpdate = true;
  return t;
}

/* ---------- shared uniforms ---------- */
const FU = SK.faceU = {
  uNoise: { value: null }, uSunDir: { value: V3(0, 1, 0) }, uSunCol: { value: COL(0xffffff) }, uSunE: { value: SUN_E },
  uTime: { value: 0 }, uWind: { value: new THREE.Vector2() }, uCover: { value: .5 }, uDens: { value: 1 },
  uCloudLight: { value: COL(0xffffff) }, uCloudAmb: { value: COL(0x8090a0) }, uNight: { value: 0 },
  uAur: { value: 0 }, uAur1: { value: COL(0x7affc8) }, uAur2: { value: COL(0xff6ad5) },
  uTint: { value: V3(1, 1, 1) }, uTintK: { value: 0 },
  uNightTop: { value: V3(.014, .020, .048) }, uNightHor: { value: V3(.045, .048, .062) }
};

/* ---------- GLSL: atmosphere ---------- */
const ATMO = `
const float PI = 3.14159265359;
const float RPL = ${RPL.toFixed(1)};
const float RAT = ${RAT.toFixed(1)};
const float HR = ${HR.toFixed(1)};
const float HM = ${HM.toFixed(1)};
const vec3 RE = vec3(${RE.map(v => v.toExponential(3)).join(',')});
const float ME = ${ME.toExponential(3)};
float rs(vec3 ro, vec3 rd, float r){ float b = dot(ro, rd), c = dot(ro, ro) - r * r, d = b * b - c; return d < 0.0 ? -1.0 : -b + sqrt(d); }
vec3 atmoT(vec3 p, vec3 sd){
  float t = rs(p, sd, RAT); if (t < 0.0) return vec3(0.0);
  const int LS = LSTEPS;
  float dt = t / float(LS); vec3 od = vec3(0.0);
  for (int i = 0; i < LS; i++) { vec3 q = p + sd * ((float(i) + 0.5) * dt); float h = max(length(q) - RPL, 0.0);
    od += (RE * exp(-h / HR) + vec3(ME) * exp(-h / HM)) * dt; }
  return exp(-od);
}
vec3 atmo(vec3 rd){
  vec3 ro = vec3(0.0, RPL + 2.0, 0.0), sun = uSunDir;
  float tmax = rs(ro, rd, RAT); if (tmax < 0.0) tmax = 30000.0;
  float tg = rs(ro, rd, RPL); if (tg > 0.0) tmax = min(tmax, tg);
  const int ST = STEPS;
  float dt = tmax / float(ST);
  vec3 odR = vec3(0.0), odM = vec3(0.0), sR = vec3(0.0), sM = vec3(0.0);
  for (int i = 0; i < ST; i++) {
    vec3 p = ro + rd * ((float(i) + 0.5) * dt);
    float h = max(length(p) - RPL, 0.0);
    float dR = exp(-h / HR) * dt, dM = exp(-h / HM) * dt;
    odR += dR; odM += dM;
    vec3 att = atmoT(p, sun);
    sR += dR * att; sM += dM * att;
  }
  float mu = dot(rd, sun);
  float pR = 0.0596831 * (1.0 + mu * mu);
  float g = 0.76;
  float pM = 0.1193662 * (1.0 - g * g) * (1.0 + mu * mu) / ((2.0 + g * g) * pow(max(1.0 + g * g - 2.0 * g * mu, 0.0001), 1.5));
  vec3 col = uSunCol * uSunE * (sR * RE * pR + sM * vec3(ME) * pM);
  /* cheap multiple-scattering: lifts the zenith/twilight so single scattering does not look soot-black */
  col += uSunCol * uSunE * (sR * RE * 0.55 + sM * vec3(ME) * 0.9) * 0.075;
  return col;
}`;

/* ---------- GLSL: volumetric clouds ---------- */
const CLOUDS = `
uniform sampler2D uNoise;
uniform float uTime, uCover, uDens;
uniform vec2 uWind;
uniform vec3 uCloudLight, uCloudAmb;
const float CBASE = ${CBASE.toFixed(1)};
const float CTOP = ${CTOP.toFixed(1)};
float cloudDensity(vec3 p, float cov){
  float h = (p.y - CBASE) / (CTOP - CBASE);
  if (h < 0.0 || h > 1.0) return 0.0;
  vec2 uv = p.xz * 0.00019 + uWind;
  float base = texture2D(uNoise, uv).r * 0.72 + texture2D(uNoise, uv * 2.13 + 0.37).r * 0.28;
  float shape = smoothstep(cov, cov + 0.28, base);
  float prof = smoothstep(0.0, 0.16, h) * smoothstep(1.0, 0.45, h);
  float det = texture2D(uNoise, uv * 3.1 + vec2(p.y * 0.0009, -p.y * 0.0007)).g;
  return clamp(shape * prof * (0.55 + 0.75 * det) * uDens, 0.0, 1.0);
}
float cloudLightOD(vec3 p, float cov){
  float od = 0.0;
  for (int j = 1; j <= LSTEPS; j++) { od += cloudDensity(p + uSunDir * (float(j) * (170.0 + 130.0 * float(j))), cov); }
  return od;
}
vec4 cloudLayer(vec3 rd, float cov){
  vec3 ro = vec3(0.0, ${(RPL + 2).toFixed(1)}, 0.0);
  float tb = rs(ro, rd, RPL + CBASE), tt = rs(ro, rd, RPL + CTOP);
  if (tb < 0.0 || tt < 0.0) return vec4(0.0, 0.0, 0.0, 1.0);
  float t0 = tt, t1 = min(tb, 46000.0);
  float span = t1 - t0; if (span < 80.0) return vec4(0.0, 0.0, 0.0, 1.0);
  const int CS = STEPS;
  float dt = span / float(CS);
  float dith = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  float T = 1.0; vec3 acc = vec3(0.0); float dist = t0;
  for (int i = 0; i < CS; i++) {
    float t = t0 + (float(i) + dith) * dt;
    vec3 p = ro + rd * t;
    float d = cloudDensity(p, cov);
    if (d > 0.004) {
      float od = cloudLightOD(p, cov);
      float sunT = exp(-od * 2.4) * 0.7 + 0.3 * exp(-od * 0.35);
      float mu = max(dot(rd, uSunDir), 0.0);
      float phase = 0.35 + 1.5 * pow(mu, 6.0) + 0.6 * pow(mu, 2.0);
      float h = clamp((p.y - CBASE) / (CTOP - CBASE), 0.0, 1.0);
      vec3 amb = uCloudAmb * (0.55 + 0.45 * h);
      vec3 lit = uCloudLight * sunT * phase;
      float a = 1.0 - exp(-d * dt * 0.0042);
      acc += (amb + lit) * a * T;
      T *= (1.0 - a);
      dist = t;
      if (T < 0.015) break;
    }
  }
  return vec4(acc, T);
}`;

const FACE_VS = 'varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
const FACE_FS = `
uniform vec3 uSunDir, uSunCol, uTint, uAur1, uAur2;
uniform float uSunE, uNight, uAur, uTintK;
uniform vec3 uNightTop, uNightHor;
varying vec3 vDir;
${ATMO}
${CLOUDS}
void main(){
  vec3 rd = normalize(vDir);
  bool below = rd.y < -0.02;
  vec3 col;
  float T = 1.0;
  if (!below) {
    col = atmo(normalize(vec3(rd.x, max(rd.y, 0.004), rd.z)));
    float cov = mix(0.98, 0.10, clamp(uCover, 0.0, 1.0));
    vec4 cl = cloudLayer(rd, cov);
    col = col * cl.a + cl.rgb;
    T = cl.a;
  } else {
    col = atmo(normalize(vec3(rd.x, 0.004, rd.z))) * mix(1.0, 0.78, smoothstep(0.0, -0.5, rd.y));
  }
  /* night sky (fixed worlds use their own colours; other worlds a deep blue) */
  float nt = smoothstep(-0.05, 0.6, rd.y);
  col += mix(uNightHor, uNightTop, nt) * uNight;
  /* aurora, faint and only at night */
  if (uAur > 0.002 && uNight > 0.1 && rd.y > 0.0) {
    float a = 0.0; vec3 ac = vec3(0.0);
    for (int i = 0; i < 3; i++) {
      vec2 q = rd.xz / (rd.y + 0.16) * 0.85 + vec2(uTime * 0.018, -uTime * 0.011) + float(i) * 2.7;
      float n = texture2D(uNoise, q).g;
      float band = smoothstep(0.5, 0.78, n) * smoothstep(0.02, 0.4, rd.y) * (1.0 - smoothstep(0.45, 1.0, rd.y));
      a += band; ac += mix(uAur1, uAur2, n) * band;
    }
    col += ac / 3.0 * uAur * uNight * 0.5;
  }
  if (uTintK > 0.0) { float l = dot(col, vec3(.2126, .7152, .0722)); col = mix(col, vec3(l) * uTint, uTintK); }
  col = max(col, vec3(0.0));
  #ifdef SRGB_OUT
  col = pow(col, vec3(1.0 / 2.2));
  #endif
  gl_FragColor = vec4(col, T);
}`;

/* ---------- cube building ---------- */
let cubeScene = null, cubeCam = null, faceMesh = null, faceMat = null;
function buildCube(size, steps, lsteps) {
  SK.rt = new THREE.WebGLCubeRenderTarget(size, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, generateMipmaps: false, format: THREE.RGBAFormat, type: HALF ? THREE.HalfFloatType : THREE.UnsignedByteType });
  SK.rt.texture.encoding = THREE.LinearEncoding;
  cubeCam = new THREE.CubeCamera(.1, 20, SK.rt);
  if (!cubeScene) {
    cubeScene = new THREE.Scene();
    SK.cubeScene = cubeScene; SK.cubeCam = cubeCam;      /* debug handles */
    faceMat = new THREE.ShaderMaterial({ uniforms: FU, vertexShader: FACE_VS, fragmentShader: FACE_FS, side: THREE.BackSide, depthTest: false, depthWrite: false, fog: false, toneMapped: false });
    faceMat.defines = { STEPS: steps, LSTEPS: lsteps };
    if (!HALF) faceMat.defines.SRGB_OUT = '';
    faceMesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), faceMat);
    faceMesh.frustumCulled = false;
    cubeScene.add(faceMesh);
  } else {
    faceMat.defines = Object.assign({}, faceMat.defines, { STEPS: steps, LSTEPS: lsteps });
    faceMat.needsUpdate = true;
  }
  SK.size = size;
}

/* ---------- display pass ---------- */
const DU = SK.dispU = {
  uSky: { value: null }, uNoise: { value: null }, uSunDir: { value: V3(0, 1, 0) }, uMoonDir: { value: V3(0, 1, 0) },
  uSunCol: { value: COL(0xffffff) }, uMoonCol: { value: COL(0xc8d8ff) },
  uSunAng: { value: .0062 }, uMoonAng: { value: .0056 }, uSunDisk: { value: 0 }, uMoonDisk: { value: 0 },
  uStar: { value: 0 }, uTime: { value: 0 }, uNight: { value: 0 }, uPix: { value: .001 },
  uFogCol: { value: V3(.5, .6, .7) }, uFogBand: { value: .05 },
  uAur: { value: 0 }, uAur1: { value: COL(0x7affc8) }, uAur2: { value: COL(0xff6ad5) }
};
const DISP_VS = 'varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
const DISP_FS = `
uniform samplerCube uSky; uniform sampler2D uNoise;
uniform vec3 uSunDir, uMoonDir, uSunCol, uMoonCol, uFogCol, uAur1, uAur2;
uniform float uSunAng, uMoonAng, uSunDisk, uMoonDisk, uStar, uTime, uNight, uPix, uFogBand, uAur;
varying vec3 vDir;
float h13(vec3 p){ p = fract(p * 0.1031); p += dot(p, p.yzx + 33.33); return fract((p.x + p.y) * p.z); }
vec3 h33(vec3 p){ p = fract(p * vec3(0.1031, 0.1030, 0.0973)); p += dot(p, p.yxz + 33.33); return fract((p.xxy + p.yxx) * p.zyx); }
void main(){
  vec3 d = normalize(vDir);
  vec4 s = textureCube(uSky, d);
  vec3 col = s.rgb;
  #ifdef SRGB_IN
  col = pow(col, vec3(2.2));
  #endif
  float trans = s.a;
  /* stars */
  if (uNight > 0.02 && d.y > -0.02) {
    vec3 g = d * 150.0, c = floor(g);
    float h = h13(c);
    float on = step(0.987, h);
    vec3 o = h33(c + 5.3);
    float dd = length(fract(g) - o);
    float tw = 0.65 + 0.35 * sin(uTime * 2.3 + h * 90.0);
    float br = 0.35 + 3.2 * pow(max((h - 0.987) / 0.013, 0.0), 3.0);
    float st = on * smoothstep(0.10, 0.0, dd) * tw * br * smoothstep(-0.02, 0.12, d.y);
    vec3 tint = mix(vec3(1.0), vec3(0.72, 0.82, 1.0), h33(c + 1.7).x);
    col += tint * st * uStar * trans * 0.9;
  }
  /* milky way band with dust lanes */
  if (uNight > 0.04) {
    float band = exp(-pow(dot(d, normalize(vec3(0.34, 0.52, -0.78))) * 4.6, 2.0));
    float dust = texture2D(uNoise, d.xz * 1.7 + d.y * .7).g;
    col += vec3(0.55, 0.62, 0.8) * band * (0.35 + 0.65 * dust) * uNight * 0.055 * smoothstep(0.0, 0.3, d.y);
  }
  /* aurora */
  if (uAur > 0.002 && uNight > 0.1 && d.y > 0.0) {
    float a = 0.0; vec3 ac = vec3(0.0);
    for (int i = 0; i < 3; i++) {
      vec2 q = d.xz / (d.y + 0.16) * 0.85 + vec2(uTime * 0.018, -uTime * 0.011) + float(i) * 2.7;
      float n = texture2D(uNoise, q).g;
      float b = smoothstep(0.5, 0.78, n) * smoothstep(0.02, 0.4, d.y) * (1.0 - smoothstep(0.45, 1.0, d.y));
      a += b; ac += mix(uAur1, uAur2, n) * b;
    }
    col += ac / 3.0 * uAur * uNight * 0.45 * trans;
  }
  /* sun disk (limb darkened, hidden by clouds) */
  {
    float ang = acos(clamp(dot(d, uSunDir), -1.0, 1.0));
    float k = smoothstep(uSunAng, uSunAng * 0.80, ang);
    float limb = 1.0 - 0.55 * pow(clamp(ang / uSunAng, 0.0, 1.0), 2.0);
    col += uSunCol * uSunDisk * k * limb * trans;
  }
  /* moon with a real phase */
  {
    float ang = acos(clamp(dot(d, uMoonDir), -1.0, 1.0));
    if (ang < uMoonAng * 1.7) {
      vec3 upv = abs(uMoonDir.y) > 0.95 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
      vec3 tx = normalize(cross(upv, uMoonDir)), ty = cross(uMoonDir, tx);
      vec2 c = vec2(dot(d, tx), dot(d, ty)) / uMoonAng;
      float r = length(c);
      if (r < 1.0) {
        float nz = sqrt(max(1.0 - r * r, 0.0));
        vec2 l2 = normalize(vec2(dot(uSunDir, tx), dot(uSunDir, ty)) + 1e-4);
        float lit = smoothstep(-0.05, 0.10, c.x * l2.x + c.y * l2.y);
        float maria = texture2D(uNoise, c * .9 + 3.0).r;
        float edge = smoothstep(1.0, 0.94, r);
        col += uMoonCol * uMoonDisk * (0.08 + lit * (0.72 + 0.28 * maria)) * edge * (0.35 + 0.65 * nz) * trans;
      }
    }
  }
  /* horizon haze: the same colour as the scene fog, so terrain melts into the sky */
  col = mix(col, uFogCol, smoothstep(uFogBand, -0.02, d.y));
  float dig = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  col += (dig - 0.5) / 255.0;
  gl_FragColor = vec4(max(col, vec3(0.0)), 1.0);
  #include <tonemapping_fragment>
  #include <encodings_fragment>
}`;

let disp = null;
function buildDisplay() {
  const m = new THREE.ShaderMaterial({ uniforms: DU, vertexShader: DISP_VS, fragmentShader: DISP_FS, side: THREE.BackSide, depthWrite: false, depthTest: true, fog: false });
  m.defines = {}; if (!HALF) m.defines.SRGB_IN = '';
  m.userData.lin = 1;
  disp = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), m);
  disp.frustumCulled = false; disp.renderOrder = 12;
  scene.add(disp);
  AV.kit = AV.kit || {}; AV.kit.dome = disp; SK.dome = disp;
}

/* ---------- CPU mirror of the atmosphere (fog colour, ambient, light colours) ---------- */
const SUN_W = [1, .98, .94];
function rsJ(ox, oy, oz, dx, dy, dz, r) { const b = ox * dx + oy * dy + oz * dz, c = ox * ox + oy * oy + oz * oz - r * r, d = b * b - c; return d < 0 ? -1 : -b + Math.sqrt(d) }
function transmitJ(dx, dy, dz) {
  const oy = RPL + 2, t = rsJ(0, oy, 0, dx, dy, dz, RAT); if (t < 0) return [0, 0, 0];
  const LS = 8, dt = t / LS; let odr = 0, odm = 0;
  for (let i = 0; i < LS; i++) { const px = dx * (i + .5) * dt, py = oy + dy * (i + .5) * dt, pz = dz * (i + .5) * dt, h = Math.max(Math.hypot(px, py, pz) - RPL, 0); odr += Math.exp(-h / HR) * dt; odm += Math.exp(-h / HM) * dt }
  return [0, 1, 2].map(k => Math.exp(-(RE[k] * odr + ME * odm)));
}
function scatterJ(dx, dy, dz) {
  const ox = 0, oy = RPL + 2, oz = 0, sd = SK.sunDir;
  let tmax = rsJ(ox, oy, oz, dx, dy, dz, RAT); if (tmax < 0) tmax = 30000;
  const tg = rsJ(ox, oy, oz, dx, dy, dz, RPL); if (tg > 0) tmax = Math.min(tmax, tg);
  const ST = 8, dt = tmax / ST; let odr = 0, odm = 0; const sr = [0, 0, 0], sm = [0, 0, 0];
  const at = transmitJ(sd.x, sd.y, sd.z);
  for (let i = 0; i < ST; i++) {
    const px = dx * (i + .5) * dt, py = oy + dy * (i + .5) * dt, pz = dz * (i + .5) * dt, h = Math.max(Math.hypot(px, py, pz) - RPL, 0);
    const dR = Math.exp(-h / HR) * dt, dM = Math.exp(-h / HM) * dt;
    odr += dR; odm += dM;
    for (let k = 0; k < 3; k++) { sr[k] += dR * at[k]; sm[k] += dM * at[k] }
  }
  const mu = dx * sd.x + dy * sd.y + dz * sd.z, pR = .0596831 * (1 + mu * mu), g = .76;
  const pM = .1193662 * (1 - g * g) * (1 + mu * mu) / ((2 + g * g) * Math.pow(Math.max(1 + g * g - 2 * g * mu, 1e-4), 1.5));
  return [0, 1, 2].map(k => SUN_E * (sr[k] * RE[k] * pR + sm[k] * ME * pM + (sr[k] * RE[k] * .55 + sm[k] * ME * .9) * .075));
}
function nightBaseJ(dy) {
  const t = ss(-.05, .6, dy);
  return [SK.nightHor[0] + (SK.nightTop[0] - SK.nightHor[0]) * t, SK.nightHor[1] + (SK.nightTop[1] - SK.nightHor[1]) * t, SK.nightHor[2] + (SK.nightTop[2] - SK.nightHor[2]) * t];
}
function radianceJ(dx, dy, dz) {
  const oy = Math.max(dy, 0.004), r = scatterJ(dx, oy, dz), n = nightBaseJ(oy);
  return [r[0] + n[0], r[1] + n[1], r[2] + n[2]];
}
function acesJ(v) { const x = v * SK.exposure / .6, a = x * (x + .0245786) - .000090537, b = x * (.983729 * x + .432951) + .238081; return cl(a / b, 0, 1) }
function dispJ(c) { return c.map(v => { const a = acesJ(v); return (a <= .0031308 ? a * 12.92 : 1.055 * Math.pow(a, 1 / 2.4) - .055) }) }
function undispJ(hex) {
  const col = COL(hex), tgt = [col.r, col.g, col.b].map(v => v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4));
  return tgt.map(t => { t = Math.max(t, 1e-4); let lo = 0, hi = 8; for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; if (acesJ(m) < t) lo = m; else hi = m } return (lo + hi) / 2 });
}

/* ---------- lights ---------- */
let HSl = AV.HS, SUNl = AV.SUN;
function applySun() {
  if (!SUNl) return;
  const d = SK.lightDir, P = AV.P || { x: 0, z: 0 }, dist = 80;
  let tx = P.x, tz = P.z;
  if (SUNl.shadow && SUNl.shadow.mapSize && SUNl.shadow.camera && SUNl.shadow.camera.right) {
    /* snap the shadow camera to texel increments so shadows do not shimmer while walking */
    const sc = SUNl.shadow.camera, texel = (sc.right - sc.left) / SUNl.shadow.mapSize.x;
    let rx = -d.z, rz = d.x; const rl = Math.hypot(rx, rz) || 1; rx /= rl; rz /= rl;
    const ux = -d.y * rz, uz = d.y * rx;
    const px = P.x * rx + P.z * rz, pz = P.x * ux + P.z * uz;
    const sx = Math.round(px / texel) * texel, sz = Math.round(pz / texel) * texel;
    tx += rx * (sx - px) + ux * (sz - pz); tz += rz * (sx - px) + uz * (sz - pz);
  }
  SUNl.position.set(tx + d.x * dist, Math.max(4, d.y * dist), tz + d.z * dist);
  SUNl.target.position.set(tx, 0, tz);
  SUNl.target.updateMatrixWorld();
}

/* ---------- per frame ---------- */
SK.tick = function (mins, dt) {
  const W = AV.W, D = (W && W.sky && W.sky.dome) || {}, F = (W && W.sky && W.sky.fixed) || null;
  SK.fixed = F; SK.cfg = D;
  SK.time = (SK.time + dt) % 1000;
  const P = AV.P || { x: 0, z: 0, yaw: 0 }, red = AV.S && AV.S.set && AV.S.set.reduce;
  const h = mins / 60, ang = (h - 6) / 12 * Math.PI;
  let sx = Math.cos(ang), sy = Math.sin(ang), sz = .25;
  if (F) { sy = -.62; sx = Math.cos(ang) * .7; sz = .45 }
  { const l = Math.hypot(sx, sy, sz); sx /= l; sy /= l; sz /= l }
  SK.sunDir.set(sx, sy, sz);
  let mx = -sx, my = -sy * .92 + .12, mz = -sz; if (F) { mx = -.35; my = .78; mz = -.55 }
  { const l = Math.hypot(mx, my, mz); mx /= l; my /= l; mz /= l }
  SK.moonDir.set(mx, my, mz);
  SK.dayK = F ? 0 : cl((sy + .06) / .32, 0, 1);
  SK.nightK = F ? (F.night == null ? 1 : F.night) : 1 - SK.dayK;
  AV.nightK = SK.nightK;
  SK.cloud = cl(D.cloud == null ? .62 : D.cloud, 0, 1.3);
  SK.aurora = F ? 0 : cl(D.swirl == null ? .22 : D.swirl, 0, 1) * SK.nightK * (red ? .5 : 1);
  SK.exposure = 1.05 + .22 * SK.nightK;

  /* world tint (Chiang Mai weather, Jungle Dub air) */
  const tn = (W && W.sky && W.sky.tint) || null;
  SK.tint = tn ? [COL(tn[0]).r, COL(tn[0]).g, COL(tn[0]).b, tn[2] == null ? .12 : tn[2]] : [1, 1, 1, 0];
  SK.tintFog = tn ? [COL(tn[1]).r, COL(tn[1]).g, COL(tn[1]).b, tn[3] == null ? .18 : tn[3]] : [1, 1, 1, 0];

  /* night sky colours */
  if (F) {
    const top = COL(F.bg), hor = COL(F.fog == null ? F.bg : F.fog);
    SK.nightTop = [top.r * .85, top.g * .85, top.b * .95];
    SK.nightHor = [hor.r * .6, hor.g * .6, hor.b * .7];
  } else { SK.nightTop = [.014, .020, .048]; SK.nightHor = [.045, .048, .062] }

  /* clouds' light direction: the sun by day, the moon at night */
  const moonUp = cl(my * 2.2, 0, 1);
  const useMoon = !F && SK.nightK > .82 && sy < .02;
  const ld = useMoon ? SK.moonDir : SK.sunDir;
  SK.lightDir.copy(ld);
  const T = useMoon ? [.55, .62, .85] : transmitJ(sx, sy, sz);
  let inten = useMoon ? (SK.nightK * moonUp * .55) : (1.55 * Math.pow(SK.dayK, .75) * (1 - .32 * SK.cloud));
  if (F) inten = F.sun == null ? .35 : F.sun;
  { const m = Math.max(T[0], T[1], T[2]) || 1; SK.lightCol = T.map(v => v / m) }
  SK.lightIntensity = inten;

  /* ambient sampled from the sky */
  let ar = 0, ag = 0, ab = 0;
  const dirs = [[0, 1, 0], [.7, .45, 0], [-.7, .45, 0], [0, .45, .7], [0, .45, -.7]];
  for (const v of dirs) { const c = radianceJ(v[0], v[1], v[2]); ar += c[0]; ag += c[1]; ab += c[2] }
  ar /= dirs.length; ag /= dirs.length; ab /= dirs.length;
  const al = Math.max(.2126 * ar + .7152 * ag + .0722 * ab, 1e-4), aim = F ? (F.hs == null ? .9 : F.hs) : .82 * (.35 + .65 * SK.dayK) + .16;

  /* face shader uniforms */
  FU.uSunDir.value.copy(SK.sunDir); FU.uSunE.value = SUN_E;
  FU.uSunCol.value.setRGB(SUN_W[0], SUN_W[1], SUN_W[2]);
  FU.uTime.value = SK.time;
  FU.uCover.value = SK.cloud; FU.uDens.value = .9 + .35 * SK.cloud;
  FU.uWind.value.set(SK.time * .0021, SK.time * .0013);
  FU.uNight.value = SK.nightK;
  FU.uCloudLight.value.setRGB(SK.lightCol[0] * inten * 1.15, SK.lightCol[1] * inten * 1.15, SK.lightCol[2] * inten * 1.15);
  FU.uCloudAmb.value.setRGB(ar * .5 * .5, ag * .5 * .5, ab * .5 * .5);
  FU.uAur.value = SK.aurora;
  FU.uAur1.value.setHex(D.s2 == null ? 0x7affc8 : D.s2); FU.uAur2.value.setHex(D.s1 == null ? 0xff6ad5 : D.s1);
  FU.uTint.value.set(SK.tint[0], SK.tint[1], SK.tint[2]); FU.uTintK.value = SK.tint[3];
  FU.uNightTop.value.set(SK.nightTop[0], SK.nightTop[1], SK.nightTop[2]);
  FU.uNightHor.value.set(SK.nightHor[0], SK.nightHor[1], SK.nightHor[2]);

  /* display uniforms */
  DU.uSunDir.value.copy(SK.sunDir); DU.uMoonDir.value.copy(SK.moonDir);
  DU.uTime.value = SK.time; DU.uNight.value = SK.nightK;
  DU.uStar.value = F ? (F.stars == null ? 1 : F.stars) : SK.nightK;
  DU.uAur.value = SK.aurora;
  DU.uAur1.value.setHex(D.s2 == null ? 0x7affc8 : D.s2); DU.uAur2.value.setHex(D.s1 == null ? 0xff6ad5 : D.s1);
  DU.uSunDisk.value = 34 * (F ? 0 : SK.dayK); DU.uMoonDisk.value = 1.35;
  DU.uSunCol.value.setRGB(SK.lightCol[0], SK.lightCol[1], SK.lightCol[2]);
  DU.uMoonCol.value.setRGB(.86, .90, 1.0);
  DU.uPix.value = 2 * Math.tan(cam.fov * Math.PI / 360) / Math.max(1, innerHeight);

  /* fog colour, sampled from the sky along the view direction */
  const fx = -Math.sin(P.yaw || 0), fz = -Math.cos(P.yaw || 0);
  let fog;
  if (F) fog = undispJ(F.fog == null ? F.bg : F.fog);
  else {
    fog = radianceJ(fx, .03, fz);
    const tf = SK.tintFog; if (tf[3] > 0) { const L = .2126 * fog[0] + .7152 * fog[1] + .0722 * fog[2]; fog = fog.map((v, i) => v * (1 - tf[3]) + L * tf[i] * tf[3]) }
  }
  SK.fogLinear = fog;
  const hdr = !!(AV.gfx && AV.gfx.active && AV.gfx.hdr);
  SK.fogDisplay = hdr ? fog : dispJ(fog);
  if (scene.fog) scene.fog.color.setRGB(SK.fogDisplay[0], SK.fogDisplay[1], SK.fogDisplay[2]);
  DU.uFogCol.value.set(fog[0], fog[1], fog[2]);

  /* lights */
  if (SUNl) { SUNl.color.setRGB(SK.lightCol[0], SK.lightCol[1], SK.lightCol[2]); SUNl.intensity = inten }
  applySun();
  if (HSl) {
    HSl.color.setRGB(ar / al * .5, ag / al * .5, ab / al * .5);
    HSl.groundColor.setRGB(.34, .26, .20);
    HSl.intensity = aim;
  }
  R.toneMappingExposure = SK.exposure;
  if (AV.gfx && AV.gfx.night) AV.gfx.night(SK.nightK);

  /* display mesh follows the camera, just inside the far plane */
  if (disp) { disp.position.copy(cam.position); disp.scale.setScalar(cam.far * .82) }

  /* refresh the cubemap, one face per frame */
  if (W && SK.rt) {
    if (SK.dirty > 0) { for (let f = 0; f < 6; f++) renderFace(f); SK.dirty = 0 }
    else { SK.frameN = (SK.frameN + 1) % (SK.every || 1); if (SK.frameN === 0) { renderFace(SK.face); SK.face = (SK.face + 1) % 6 } }
  }
};
function renderFace(f) {
  if (!SK.rt || !cubeCam) return;
  const prev = R.getRenderTarget();
  R.setRenderTarget(SK.rt, f);
  R.render(cubeScene, cubeCam.children[f]);
  R.setRenderTarget(prev);
}

/* ---------- quality ---------- */
SK.quality = function (force) {
  const q = SK.qn(); if (q === SK.q && !force) return;
  const P = QP[q]; SK.q = q;
  if (!SK.rt || SK.size !== P.size) {
    if (SK.rt) SK.rt.dispose();
    buildCube(P.size, P.steps, P.lsteps);
  } else { faceMat.defines = Object.assign({}, faceMat.defines, { STEPS: P.steps, LSTEPS: P.lsteps }); faceMat.needsUpdate = true }
  SK.every = P.every; SK.dirty = 6;
  if (DU.uSky) DU.uSky.value = SK.rt.texture;
};

/* ---------- boot ---------- */
SK.init = function () {
  noiseTex = makeNoise(256);
  FU.uNoise.value = noiseTex; DU.uNoise.value = noiseTex;
  SK.quality(true);
  buildDisplay();
  DU.uSky.value = SK.rt.texture;
  SK.tick((AV.S && AV.S.time) || 540, 0);
  SK.ready = true;
};

/* debug / benchmark helpers */
SK.benchFace = function () {
  if (!SK.rt) return null;
  const g2 = R.getContext(), px = new Uint8Array(4);
  const f = () => { for (let i = 0; i < 6; i++) renderFace(i); g2.readPixels(0, 0, 1, 1, g2.RGBA, g2.UNSIGNED_BYTE, px) };
  f(); const t0 = performance.now(); for (let i = 0; i < 4; i++) f(); return +((performance.now() - t0) / 24).toFixed(2);
};
SK.status = function () { return { q: SK.q, size: SK.size, hdr: HALF, night: +SK.nightK.toFixed(2), cloud: +SK.cloud.toFixed(2), sun: SK.sunDir.toArray().map(v => +v.toFixed(2)) } };
SK.statusText = function () {
  const n = SK.nightK > .5 ? 'night' : SK.dayK > .3 ? 'day' : 'twilight';
  return (AV.tr ? AV.tr('Sky: ', 'Cielo: ') : 'Sky: ') + n + ' · ' + (SK.size || '?') + '² cube · ' + (HALF ? 'HDR' : '8-bit');
};

SK.init();
})(window.AV);
