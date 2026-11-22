/* APEVERSE V0.9.6 - js/gfx.js : cinematic graphics layer (prototype, enabled by worlds that declare `post`, currently Astro-9).
   - Post-processing on three.js r128's own EffectComposer: scene -> UnrealBloomPass -> colour-grading pass (ACES, lift/gain,
     saturation, contrast, vignette, fine grain). HDR (half-float) render target + MSAA when the GPU supports it, else an 8-bit path.
   - Image-based lighting: Poly Haven CC0 HDRI (assets/hdri/shanghai_bund_1k.hdr) through PMREMGenerator; a procedural neon
     environment is used on file:// or if the HDRI cannot load. Applied only to materials registered with AV.gfx.reg().
   - GLB loading for forge/Blender assets (cached download, parsed fresh on every world entry so disposal stays safe).
   - Settings: post-processing Auto/On/Off, bloom strength, reflections Auto/On/Off. Auto = on for Medium + High, off for Low. */
'use strict';
(function (AV) {
const tr = AV.tr, R = AV.R, scene = AV.scene, cam = AV.cam;
const X = AV.gfx = { active: false, hdr: false, msaa: 0, envKind: null, world: null, mats: new Map() };
if (!R) return;
const gl = R.getContext();
X.hdr = !!(R.capabilities.isWebGL2 && gl.getExtension('EXT_color_buffer_float'));
const Q = () => ({ Low: 0, Medium: 1, High: 2 }[AV.S && AV.S.set && AV.S.set.gq] ?? 2);
X.opt = () => { const s = AV.S.set, d = { post: 'auto', bloom: 1, refl: 'auto' }; if (!s.gfx) s.gfx = {}; for (const k in d) if (s.gfx[k] == null) s.gfx[k] = d[k]; return s.gfx };   /* same object every call (settings keep a reference) */
X.supported = () => !!(THREE.EffectComposer && THREE.RenderPass && THREE.UnrealBloomPass && THREE.ShaderPass);
X.postWanted = () => { const o = X.opt(); return !!(X.world && X.world.post) && X.supported() && (o.post === 'auto' ? Q() > 0 : o.post === 'on') };
X.reflWanted = () => { const o = X.opt(); return o.refl === 'auto' ? Q() > 0 : o.refl === 'on' };

/* ---------- colour grading pass ---------- */
const GradeShader = {
  uniforms: { tDiffuse: { value: null }, uHdr: { value: 1 }, uExp: { value: 1.05 }, uCon: { value: 1 }, uSat: { value: 1 }, uLift: { value: new THREE.Vector3() }, uGain: { value: new THREE.Vector3(1, 1, 1) }, uVig: { value: 0 }, uGrain: { value: .012 }, uTime: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: [
    'uniform sampler2D tDiffuse; uniform float uHdr, uExp, uCon, uSat, uVig, uGrain, uTime; uniform vec3 uLift, uGain; varying vec2 vUv;',
    'vec3 fitRRT(vec3 v){ vec3 a = v * (v + 0.0245786) - 0.000090537; vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081; return a / b; }',
    'vec3 aces(vec3 c){ const mat3 I = mat3(vec3(0.59719,0.07600,0.02840), vec3(0.35458,0.90834,0.13383), vec3(0.04823,0.01566,0.83777));',
    '  const mat3 O = mat3(vec3(1.60475,-0.10208,-0.00327), vec3(-0.53108,1.10813,-0.07276), vec3(-0.07367,-0.00605,1.07602));',
    '  c *= uExp / 0.6; c = I * c; c = fitRRT(c); c = O * c; return clamp(c, 0.0, 1.0); }',
    'vec3 srgb(vec3 c){ return mix(pow(c, vec3(0.41666)) * 1.055 - vec3(0.055), c * 12.92, vec3(lessThanEqual(c, vec3(0.0031308)))); }',
    'void main(){ vec3 c = texture2D(tDiffuse, vUv).rgb;',
    '  if (uHdr > 0.5) c = srgb(aces(c));',
    '  c = c * uGain + uLift * (1.0 - c);',
    '  float l = dot(c, vec3(0.2126, 0.7152, 0.0722)); c = mix(vec3(l), c, uSat);',
    '  c = (c - 0.5) * uCon + 0.5;',
    '  vec2 d = vUv - 0.5; c *= 1.0 - uVig * dot(d, d) * 1.6;',
    '  float n = fract(sin(dot(vUv + uTime, vec2(12.9898, 78.233))) * 43758.5453); c += (n - 0.5) * uGrain;',
    '  gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0); }'].join('\n')
};

/* ---------- composer (rebuilt when quality / size changes) ---------- */
let C = null, bloom = null, grade = null, builtFor = '';
function size() { const pr = R.getPixelRatio(); return [Math.max(1, Math.floor(innerWidth * pr)), Math.max(1, Math.floor(innerHeight * pr))] }
/* per-preset tuning [Low, Medium, High]: MSAA samples, half-resolution bloom, pixel-ratio cap while post-processing is on */
/* measured on Intel Iris Xe at 1600x900 (Astro-9 plaza): MSAA 4x on the HDR target cost ~12 ms, FXAA ~1 ms, so FXAA + pixel ratio 1 is the default */
X.tune = { msaa: [0, 0, 0], fxaa: [true, true, true], halfBloom: [true, true, false], prCap: [1, 1, 1] };
function build() {
  const q = Q(), key = q + '|' + X.hdr + '|' + JSON.stringify(X.tune); if (C && builtFor === key) return; dispose(); builtFor = key;
  const [w, h] = size(), wantMs = X.tune.msaa ? X.tune.msaa[q] : 0, useMs = wantMs > 0 && R.capabilities.isWebGL2 && THREE.WebGLMultisampleRenderTarget;
  const RT = useMs ? THREE.WebGLMultisampleRenderTarget : THREE.WebGLRenderTarget;
  const rt = new RT(w, h, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, type: X.hdr ? THREE.HalfFloatType : THREE.UnsignedByteType });
  if (useMs) rt.samples = wantMs; X.msaa = useMs ? rt.samples : 0;
  if (!X.hdr) rt.texture.encoding = THREE.sRGBEncoding;          // 8-bit path: store sRGB to avoid banding in the dark sky
  C = new THREE.EffectComposer(R, rt);
  C.addPass(new THREE.RenderPass(scene, cam));
  bloom = new THREE.UnrealBloomPass(new THREE.Vector2(w, h), 1, .5, .9);
  const half = X.tune.halfBloom[q], ss = bloom.setSize.bind(bloom); bloom.setSize = (a, b) => ss(Math.max(1, a * (half ? .5 : 1)), Math.max(1, b * (half ? .5 : 1)));
  C.addPass(bloom);
  grade = new THREE.ShaderPass(GradeShader); C.addPass(grade);
  fxaa = null; if (X.tune.fxaa[q] && THREE.FXAAShader) { fxaa = new THREE.ShaderPass(THREE.FXAAShader); C.addPass(fxaa) }   // cheap edge smoothing instead of MSAA
  X.aa = X.msaa ? 'MSAA ' + X.msaa + '×' : fxaa ? 'FXAA' : 'none';
  C.setSize(w, h); fxaaRes(w, h);
}
let fxaa = null; const fxaaRes = (w, h) => { if (fxaa) fxaa.uniforms.resolution.value.set(1 / w, 1 / h) };
function dispose() { if (!C) return; [C.renderTarget1, C.renderTarget2].forEach(t => t && t.dispose()); if (bloom) { bloom.renderTargetsHorizontal.concat(bloom.renderTargetsVertical, [bloom.renderTargetBright]).forEach(t => t.dispose()) } C = bloom = grade = null; builtFor = '' }
X.resize = () => { if (C) { const s = size(); C.setSize(...s); fxaaRes(...s) } };
X.debug = () => ({ C, bloom, grade, rebuild() { dispose(); build(); X.resize(); params() } });
addEventListener('resize', () => setTimeout(X.resize, 0));

function params() {
  const P = X.world && X.world.post || {}, g = P.grade || {}, b = P.bloom || [.8, .5, .9], o = X.opt();
  bloom.strength = b[0] * o.bloom; bloom.radius = b[1]; bloom.threshold = X.hdr ? b[2] : (P.ldrThreshold || .72);
  const u = grade.uniforms; u.uHdr.value = X.hdr ? 1 : 0; u.uExp.value = g.exp || 1.05; u.uCon.value = g.con || 1; u.uSat.value = g.sat || 1; u.uVig.value = AV.S.set.reduce ? 0 : (g.vig || 0);
  u.uLift.value.fromArray(g.lift || [0, 0, 0]); u.uGain.value.fromArray(g.gain || [1, 1, 1]); u.uGrain.value = g.grain == null ? .012 : g.grain;
}
function setToneMapping(t) {
  if (R.toneMapping === t) return; R.toneMapping = t;
  /* the sky dome shader writes display colours directly; in the linear HDR path it must output linear light */
  const d = AV.kit && AV.kit.dome; if (d) { const m = d.material, df = Object.assign({}, m.defines); if (t === THREE.NoToneMapping) df.LIN_OUT = 1; else delete df.LIN_OUT; m.defines = df; m.needsUpdate = true }
  scene.traverse(o => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.needsUpdate = true) }) }

/* ---------- environment (HDRI or procedural) ---------- */
let envP = null, envTex = null;
function proceduralEnv(pm) {
  const s = new THREE.Scene(), g = new THREE.SphereGeometry(10, 32, 16), cA = new THREE.Color(0x0a0620), cB = new THREE.Color(0x5a1a6a), col = [];
  for (let i = 0; i < g.attributes.position.count; i++) { const y = g.attributes.position.getY(i) / 10, c = cA.clone().lerp(cB, Math.pow(1 - Math.abs(y), 3)); col.push(c.r, c.g, c.b) }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); s.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  [[0xff4ad2, 6, 1, 0], [0x3ad8ff, -6, 2, 3], [0xffd8a0, 0, 7, -2], [0x7a4aff, 3, -1, -7]].forEach(([c, x, y, z]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.2, .2), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(4) })); m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m) });
  const t = pm.fromScene(s, .02).texture; s.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose() }); return t;
}
X.env = function () {
  if (envP) return envP;
  return envP = new Promise(ok => {
    const pm = new THREE.PMREMGenerator(R), done = (t, kind) => { pm.dispose(); envTex = t; X.envKind = kind; ok(t) };
    const fb = () => done(proceduralEnv(pm), 'procedural');
    if (AV.isFile || !THREE.RGBELoader) return fb();
    new THREE.RGBELoader().setDataType(THREE.UnsignedByteType).load('assets/hdri/shanghai_bund_1k.hdr', tex => { const t = pm.fromEquirectangular(tex).texture; tex.dispose(); done(t, 'hdri') }, undefined, e => { console.warn('HDRI failed, using procedural environment', e); fb() });
  });
};
/* register a material for reflections ('env', with intensity) or HDR glow boost ('glow') */
X.reg = function (ctx, m, kind, k) { X.mats.set(m, { id: ctx.id, kind: kind || 'env', k: k == null ? 1 : k }); if (kind === 'glow' && !m.userData.glowBase) { m.userData.glowBase = m.color.clone(); m.userData.glowK = k || 3 } };
function applyMats() {
  const refl = X.reflWanted() && envTex, boost = X.active && X.hdr;
  X.mats.forEach((v, m) => {
    if (v.kind === 'env') { const want = refl ? envTex : null; if (m.envMap !== want) { m.envMap = want; m.envMapIntensity = v.k; m.needsUpdate = true } }
    else if (v.kind === 'glow' && m.userData.glowBase) m.color.copy(m.userData.glowBase).multiplyScalar(boost ? m.userData.glowK : 1.25);
  });
}

/* ---------- world switching + apply ---------- */
X.setWorld = function (W) {
  X.world = W; for (const [m, v] of X.mats) if (!W || v.id !== W.id) X.mats.delete(m);
  if (W && X.reflWanted() && X.mats.size) X.env().then(() => { if (X.world === W) applyMats() });
  X.apply();
};
const basePR = () => { const g = AV.S.set.gq, d = devicePixelRatio || 1; return g === 'High' ? Math.min(d, 1.5) : g === 'Medium' ? Math.min(d, 1.15) : 1 };   // same as core.js applyQuality
function setPR(on) { const want = on ? Math.min(basePR(), X.tune.prCap[Q()]) : basePR(); if (Math.abs(R.getPixelRatio() - want) > 1e-3) { R.setPixelRatio(want); AV.resize() } }
X.apply = function () {
  const on = X.postWanted(); setPR(on);
  if (on) { build(); X.resize(); params() } else if (C && Q() === 0) dispose();
  X.active = on;
  setToneMapping(on && X.hdr ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping);
  if (X.reflWanted() && X.mats.size && !envTex) X.env().then(applyMats);
  applyMats();
};
X.render = function () {
  if (!X.active || !C) return false;
  grade.uniforms.uTime.value = (performance.now() % 10000) / 10000; C.render(); return true;
};
X.status = function () {
  return { post: X.active, hdr: X.hdr, msaa: X.active ? X.msaa : 0, aa: X.active ? X.aa : null, pr: +R.getPixelRatio().toFixed(2), bloom: X.active ? +bloom.strength.toFixed(2) : 0, env: X.reflWanted() ? (X.envKind || 'loading') : 'off', world: X.world && X.world.id, assets: X.world && X.world.gfxAssets ? X.world.gfxAssets() : null };
};
X.statusText = function () {
  const s = X.status(), a = s.assets || {};
  return tr('Post-processing: ', 'Postprocesado: ') + (s.post ? tr('on', 'activo') + ' (' + (s.hdr ? 'HDR' : '8-bit') + (s.aa ? ', ' + s.aa : '') + ')' : tr('off', 'apagado')) +
    ' · ' + tr('Reflections: ', 'Reflejos: ') + (s.env === 'hdri' ? 'Poly Haven HDRI' : s.env === 'procedural' ? tr('procedural', 'procedural') : s.env) +
    (a.tower ? ' · ' + tr('Tower: ', 'Torre: ') + a.tower + ' · ' + tr('Aliens: ', 'Alienígenas: ') + a.aliens.join(' / ') : '');
};

/* ---------- GLB assets (forge / Blender exports) ---------- */
const bufs = {};
X.glb = function (url) {
  if (AV.isFile || !THREE.GLTFLoader) return Promise.reject(new Error('GLB needs http(s)'));
  const p = bufs[url] || (bufs[url] = fetch(url).then(r => { if (!r.ok) throw new Error(url + ' ' + r.status); return r.arrayBuffer() }));
  return p.then(b => new Promise((ok, no) => new THREE.GLTFLoader().parse(b.slice(0), '', ok, no)));
};

/* ---------- settings panel section ---------- */
X.settingsHtml = function () {
  const o = X.opt(), sel = (id, v) => '<select id="' + id + '">' + [['auto', tr('Auto (Medium/High)', 'Auto (Medio/Alto)')], ['on', tr('On', 'Activo')], ['off', tr('Off', 'Apagado')]].map(a => '<option value="' + a[0] + '"' + (v === a[0] ? ' selected' : '') + '>' + a[1] + '</option>').join('') + '</select>';
  return '<p style="margin-top:12px"><b>' + tr('Cinematic graphics (prototype: Astro-9)', 'Gráficos cinemáticos (prototipo: Astro-9)') + '</b></p>' +
    '<p>' + tr('Bloom + colour grading', 'Resplandor + gradación de color') + ' ' + sel('gPost', o.post) + '</p>' +
    '<p>' + tr('Bloom strength', 'Intensidad del resplandor') + ' <input id="gBloom" type="range" min="0" max="2" step=".1" value="' + o.bloom + '"></p>' +
    '<p>' + tr('HDRI reflections', 'Reflejos HDRI') + ' ' + sel('gRefl', o.refl) + '</p>' +
    '<p id="gStat" style="font-size:12px;opacity:.75">' + X.statusText() + '</p>';
};
X.bindSettings = function () {
  const $ = id => document.getElementById(id), o = X.opt(), upd = () => { X.apply(); AV.save(); setTimeout(() => { const e = $('gStat'); if (e) e.textContent = X.statusText() }, 400) };
  if (!$('gPost')) return;
  $('gPost').onchange = e => { o.post = e.target.value; upd() }; $('gRefl').onchange = e => { o.refl = e.target.value; upd() };
  $('gBloom').oninput = e => { o.bloom = +e.target.value; if (X.active) params() }; $('gBloom').onchange = () => AV.save();
};

/* hooks: world entry (chained) + quality changes */
const prevEnter = AV.onWorldEnter; AV.onWorldEnter = W => { if (prevEnter) prevEnter(W); X.setWorld(W) };
const prevQ = AV.applyQuality; AV.applyQuality = function () { prevQ.apply(this, arguments); X.apply() };
})(window.AV);
