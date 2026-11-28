/* APEVERSE 3.0 (experimental) - babylon_mirror.js : the Babylon.js renderer adapter.
   The whole existing game keeps running unchanged (AV.* gameplay, missions, dialogue, shops, money, inventory, vehicles, homes, DJ,
   police, minigames, UI).  Its Three.js scene graph becomes the "world model"; this adapter mirrors it into a Babylon.js scene every frame
   and Babylon renders it (WebGPU when available, WebGL2 fallback), with PBR materials, cascaded shadows, ACES tone mapping, FXAA, bloom.
     - geometry: one BABYLON.Geometry per Three BufferGeometry (shared), meshes placed by Three's world matrix (right-handed scene, same
       coordinates and identifiers as the Three version);  InstancedMesh -> thin instances (matrix + colour buffers);  Sprite -> billboard
     - materials: MeshStandard/Physical -> PBRMaterial (colour, roughness, metalness, emissive, maps, alpha, vertex colours, double side);
       MeshBasic -> unlit StandardMaterial;  custom ShaderMaterials (sky dome, water, flora sway) -> approximations (listed in the audit)
     - textures: canvas textures -> DynamicTexture (re-copied when Three bumps the version), images -> Texture, video -> VideoTexture
     - lights: sun -> DirectionalLight + CascadedShadowGenerator, hemisphere -> HemisphericLight, nearest point lights; fog + clear colour
     - camera: copied from AV.cam every frame
   Off with ?engine=three (A/B benchmark on the same build).  AV.bab = { on, engine, scene, stats, exportGLB(), exportWorld() } */
'use strict';
(function (AV) {
const WANT = !/engine=three/.test(location.search);
const BB = AV.bab = { on: false, want: WANT, stats: { meshes: 0, geos: 0, mats: 0, tex: 0, inst: 0, dyn: 0, skipped: 0, api: null, fps: 0, draws: 0 }, map: new Map() };
if (!WANT) return;
const V = '7.31.0', CDN = 'https://cdn.jsdelivr.net/npm/';
const load = src => new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => no(new Error('failed ' + src)); document.head.appendChild(s) });
BB._load = load; BB._lib = name => CDN + name + '@' + V + '/';
BB.libs = load(CDN + 'babylonjs@' + V + '/babylon.js').then(() => load(CDN + 'babylonjs-serializers@' + V + '/babylonjs.serializers.min.js').catch(() => null)).catch(e => { console.warn('Babylon unavailable, staying on Three.js', e); BB.error = String(e) });
/* start when the game begins (tests / settings can choose the backend first: window.__BAB_API = 'webgl' | 'webgpu') */
const st0 = setInterval(() => { if (!AV.running || !window.BABYLON) return; clearInterval(st0); BB.ready = Promise.resolve().then(() => engine ? null : init()).catch(e => { BB.error = String(e); console.warn('Babylon init failed', e) }) }, 200);
let B, engine, scene, cam, sun, hemi, csm, pipe, cv;
async function init() { B = window.BABYLON;
  /* upstream Babylon 7.31 bug: vertexColorMixing multiplies by instanceColor when INSTANCESCOLOR is set even without INSTANCES, where the
     attribute is not declared (vertex + instance colours, readiness checks without instancing): guard it like the declaration is guarded */
  for (const st of [B.Effect && B.Effect.IncludesShadersStore, B.ShaderStore && B.ShaderStore.IncludesShadersStoreWGSL]) { const k = 'vertexColorMixing'; if (st && typeof st[k] === 'string') st[k] = st[k].split('#ifdef INSTANCESCOLOR\nvColor').join('#if defined(INSTANCESCOLOR) && defined(INSTANCES)\nvColor').split('#ifdef INSTANCESCOLOR\nvertexOutputs.vColor').join('#if defined(INSTANCESCOLOR) && defined(INSTANCES)\nvertexOutputs.vColor') }
  const host = AV.R.domElement; cv = document.createElement('canvas'); cv.id = 'bcv'; cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;display:block;z-index:0;outline:none'; host.parentNode.insertBefore(cv, host.nextSibling); host.style.visibility = 'hidden';
  /* backend: WebGL2 by default.  Babylon 7's WebGPU path converts every GLSL material to WGSL at runtime; with Ape Town's ~350 PBR
     materials that stalled real Chrome at 0 frames (owner's black screen).  WebGPU stays opt-in: ?engine=webgpu or __BAB_API='webgpu'. */
  let want = window.__BAB_API || (/engine=webgpu/.test(location.search) ? 'webgpu' : 'webgl'); try { want = localStorage.getItem('apeverse_bab_api') || want } catch (e) { }
  let api = 'WebGL2'; try { if (want === 'webgpu' && navigator.gpu && B.WebGPUEngine && await B.WebGPUEngine.IsSupportedAsync) { engine = new B.WebGPUEngine(cv, { antialias: true, adaptToDeviceRatio: true }); await engine.initAsync(); api = 'WebGPU' } } catch (e) { engine = null }
  if (!engine) engine = new B.Engine(cv, true, { stencil: true, preserveDrawingBuffer: true }, true); BB.stats.api = api; BB.engine = engine;
  scene = new B.Scene(engine); scene.useRightHandedSystem = true; scene.skipPointerMovePicking = true; scene.autoClear = true; BB.scene = scene;
  cam = new B.UniversalCamera('cam', B.Vector3.Zero(), scene); cam.inputs.clear(); cam.rotationQuaternion = new B.Quaternion(); cam.minZ = .1; scene.activeCamera = cam;
  hemi = new B.HemisphericLight('hemi', new B.Vector3(0, 1, 0), scene); sun = new B.DirectionalLight('sun', new B.Vector3(-.4, -1, -.3), scene); sun.position = new B.Vector3(40, 80, 30);
  scene.performancePriority = B.ScenePerformancePriority ? B.ScenePerformancePriority.Intermediate : undefined;
  if (window.__BAB_SHADOWS) try { csm = new B.CascadedShadowGenerator(1024, sun); csm.numCascades = 3; csm.lambda = .85; csm.shadowMaxZ = 120; csm.stabilizeCascades = true; csm.filteringQuality = B.ShadowGenerator.QUALITY_MEDIUM } catch (e) { csm = null }
  const ip = scene.imageProcessingConfiguration; ip.toneMappingEnabled = AV.R.toneMapping > 0;   /* match Three: r128 here renders without tone mapping */ ip.toneMappingType = B.ImageProcessingConfiguration.TONEMAPPING_ACES; ip.exposure = AV.R.toneMappingExposure || 1; ip.contrast = 1;
  engine.setHardwareScalingLevel(1 / Math.max(.5, Math.min(2, AV.R.getPixelRatio ? AV.R.getPixelRatio() : 1)));   /* same resolution as the Three renderer (quality setting) */
  if (window.__BAB_POST) try { pipe = new B.DefaultRenderingPipeline('pipe', true, scene, [cam]); pipe.fxaaEnabled = true; pipe.bloomEnabled = true; pipe.bloomThreshold = .82; pipe.bloomWeight = .25; pipe.bloomKernel = 48; pipe.imageProcessingEnabled = true; pipe.imageProcessing.toneMappingEnabled = true; pipe.imageProcessing.toneMappingType = B.ImageProcessingConfiguration.TONEMAPPING_ACES; pipe.imageProcessing.exposure = 1.05; pipe.imageProcessing.contrast = 1.08 } catch (e) { }
  scene.fogMode = B.Scene.FOGMODE_LINEAR; BB.instr = new B.EngineInstrumentation(engine); BB.instr.captureGPUFrameTime = false;
  /* take over rendering: the game's own frame loop still runs every system; only the final draw goes to Babylon */
  const r0 = AV.R.render.bind(AV.R); BB.threeRender = r0; AV.R.render = (s, c) => { if (!BB.on) return r0(s, c); if (s !== AV.scene) return;   /* Three's own environment-cube / helper renders: not needed while Babylon draws (each used to cost a whole extra Babylon frame) */
    if (c !== AV.cam || AV.R.getRenderTarget()) return r0(s, c);   /* photo / render-to-texture views stay on Three */ try { frame() } catch (e) { console.warn('bab frame', e); BB.on = false; host.style.visibility = 'visible'; cv.style.display = 'none' } };
  if (AV.gfx && AV.gfx.render) { const g0 = AV.gfx.render; AV.gfx.render = function () { return BB.on ? false : g0.apply(this, arguments) } }   /* Three's EffectComposer is bypassed: Babylon has its own pipeline */
  BB.setOn = v => { BB.on = !!v; host.style.visibility = BB.on ? 'hidden' : 'visible'; cv.style.display = BB.on ? 'block' : 'none'; if (BB.on) engine.resize() };
  addEventListener('resize', () => engine.resize()); BB.on = true; watchdog();
  try { engine.onContextLostObservable.add(() => fallback('the graphics context was lost (e.g. after sleep)')) } catch (e) { } console.log('[Apeverse] Babylon.js ' + V + ' renderer on (' + api + ')') }
/* ---------- conversion ---------- */
const GEO = new Map(), MAT = new Map(), TEX = new Map(), toC = (c, k) => new B.Color3(c.r * (k == null ? 1 : k), c.g * (k == null ? 1 : k), c.b * (k == null ? 1 : k));
/* characters (chars_real) colour themselves in an onBeforeCompile shader: albedo = palette uC0..uC3 weighted by the aMat attribute.
   The adapter bakes that into vertex colours per (geometry, palette); the fur 'shell' layers are skipped. */
function pal(m, g) { if (!m || !m.onBeforeCompile || !g.attributes.aMat) return null; if (m._avPal !== undefined) return m._avPal; const sh = { uniforms: {}, defines: {}, vertexShader: '#include <begin_vertex> #include <common>', fragmentShader: '#include <common>' };
  try { m.onBeforeCompile(sh) } catch (e) { } const u = sh.uniforms; m._avPal = u.uC0 && u.uC1 ? { c: [u.uC0, u.uC1, u.uC2, u.uC3].map(x => x && x.value && x.value.isColor ? x.value : null), rough: u.uRough && u.uRough.value } : null; if (m._avPal) m._avPal.key = m._avPal.c.map(c => c ? c.getHexString() : '-').join(''); return m._avPal }
function geo(g, P) { const gk = g.uuid + (P ? ':' + P.key : ''); let G = GEO.get(gk); if (G && !G.isDisposed()) return G;   /* a geometry is released when its last mesh is disposed */ const vd = new B.VertexData(), p = g.attributes.position; if (!p) return null; vd.positions = p.array instanceof Float32Array ? p.array : Float32Array.from(p.array);
  if (g.attributes.normal) vd.normals = g.attributes.normal.array; if (g.attributes.uv) vd.uvs = g.attributes.uv.array; if (g.attributes.color) { const c = g.attributes.color, n = c.count, a = new Float32Array(n * 4); for (let i = 0; i < n; i++) { a[i * 4] = c.getX(i); a[i * 4 + 1] = c.getY(i); a[i * 4 + 2] = c.getZ(i); a[i * 4 + 3] = 1 } vd.colors = a }
  if (g.attributes.skinIndex && g.attributes.skinWeight) { vd.matricesIndices = Float32Array.from(g.attributes.skinIndex.array); vd.matricesWeights = Float32Array.from(g.attributes.skinWeight.array) }
  if (g.index) vd.indices = g.index.array; else { const n = p.count, ix = new Uint32Array(n); for (let i = 0; i < n; i++) ix[i] = i; vd.indices = ix } if (!vd.normals) { const nn = []; B.VertexData.ComputeNormals(vd.positions, vd.indices, nn); vd.normals = nn }
  for (const k of ['positions', 'normals', 'uvs', 'colors']) { const a = vd[k]; if (!a) continue; let bad = -1; for (let i = 0; i < a.length; i++) if (a[i] !== a[i]) { bad = i; break } if (bad < 0) continue; const b = Float32Array.from(a); for (let i = bad; i < b.length; i++) if (b[i] !== b[i]) b[i] = k === 'normals' && i % 3 === 1 ? 1 : 0; vd[k] = b; BB.stats.nanFixed = (BB.stats.nanFixed || 0) + 1 }   /* degenerate Three data (NaN normals/uvs) breaks glTF export */
  if (P) { const a = g.attributes.aMat, n = a.count, col = new Float32Array(n * 4), C = P.c; for (let i = 0; i < n; i++) { const w = [a.getX(i), a.getY(i), a.getZ(i), a.getW(i)]; let r = 0, gg = 0, b = 0; for (let k = 0; k < 4; k++) if (C[k] && w[k]) { r += C[k].r * w[k]; gg += C[k].g * w[k]; b += C[k].b * w[k] } const ao = g.attributes.aAO ? .55 + .45 * g.attributes.aAO.getX(i) : 1; col[i * 4] = r * ao; col[i * 4 + 1] = gg * ao; col[i * 4 + 2] = b * ao; col[i * 4 + 3] = 1 } vd.colors = col }
  G = new B.Geometry('g' + GEO.size, scene, vd, false); GEO.set(gk, G); BB.stats.geos++; return G }
function tex(t) { if (!t) return null; let e = TEX.get(t.uuid); const img = t.image; if (e && e.v === t.version) return e.bt; if (!img) return null;
  let bt = e && e.bt; try { if (img.tagName === 'VIDEO') { if (!bt) bt = new B.VideoTexture('v' + TEX.size, img, scene, false, !t.flipY) }
    else if (img.tagName === 'IMG' && img.src && !e) { bt = new B.Texture(img.src, scene, false, t.flipY !== false) }
    else if (img.width && img.height) { if (!bt) bt = new B.DynamicTexture('d' + TEX.size, { width: img.width, height: img.height }, scene, true); const ctx = bt.getContext(); ctx.clearRect(0, 0, img.width, img.height); ctx.drawImage(img, 0, 0); bt.update(t.flipY !== false); bt.hasAlpha = true }
    else return null } catch (x) { if (bt && !(e && e.bt === bt)) bt.dispose(); return e ? e.bt : null }   /* never leave a half-made texture in the scene: it would never be 'ready' and blocks the exporter */
  if (bt) { const rep = t.wrapS === 1000; bt.wrapU = bt.wrapV = rep ? B.Texture.WRAP_ADDRESSMODE : B.Texture.CLAMP_ADDRESSMODE; bt.uScale = t.repeat.x; bt.vScale = t.repeat.y; bt.uOffset = t.offset.x; bt.vOffset = t.offset.y }
  TEX.set(t.uuid, { bt, v: t.version }); if (!e) BB.stats.tex++; return bt }
/* materials are SHARED by look: Ape Town's ~900 Three materials collapse to ~270 Babylon materials, which also lets static batching group
   meshes (same geometry + same look). A shared material is never mutated: a changed Three material simply maps to another look. */
const SIG = new Map(), hx = c => c ? c.getHexString() : '';
const sig = m => (m.isShaderMaterial || m.isRawShaderMaterial) ? 'sh' + m.uuid : [m.type, hx(m.color), hx(m.emissive), m.emissiveIntensity, m.roughness, m.metalness, m.map && m.map.uuid, m.emissiveMap && m.emissiveMap.uuid, m.transparent, m.opacity, m.side, m.alphaTest, m.visible].join('|');
function mat(m, vc, ic) { if (Array.isArray(m)) m = m[0]; const key = m.uuid + (vc ? 'v' : '') + (ic ? 'i' : '');   /* ic: per-instance colours need their own (frozen) shader variant */ let M = MAT.get(key); tex(m.map); tex(m.emissiveMap); if (M && M.v === m.version) return M.bm;
  const sk = sig(m) + (vc ? 'v' : '') + (ic ? 'i' : ''); let bm = SIG.get(sk); if (bm) { MAT.set(key, { bm, v: m.version }); return bm }
  if (m.isMeshBasicMaterial || m.isSpriteMaterial || m.isPointsMaterial) { if (!bm) bm = new B.StandardMaterial('s' + MAT.size, scene); bm.disableLighting = true; bm.emissiveColor = toC(m.color); const tx = tex(m.map); bm.diffuseTexture = tx; bm.emissiveTexture = tx; if (tx) bm.emissiveColor = toC(m.color) }
  else if ((m.isShaderMaterial || m.isRawShaderMaterial) && BB._shaderMat && (bm = BB._shaderMat(m, scene))) { BB.stats.shaderNative = (BB.stats.shaderNative || 0) + 1 }   /* graphics module: real water etc. */
  else if (m.isShaderMaterial || m.isRawShaderMaterial) { if (!bm) bm = new B.PBRMaterial('sh' + MAT.size, scene); const u = m.uniforms || {}, c = (u.color || u.col || u.uColor || u.tint || {}).value; bm.albedoColor = c && c.isColor ? toC(c) : new B.Color3(.55, .62, .5); bm.roughness = .85; bm.metallic = 0; BB.stats.shaderFallback = (BB.stats.shaderFallback || 0) + 1 }
  else { if (!bm) bm = new B.PBRMaterial('p' + MAT.size, scene); bm.albedoColor = m.color ? toC(m.color) : new B.Color3(1, 1, 1); bm.roughness = m.roughness != null ? m.roughness : .8; bm.metallic = m.metalness || 0; bm.albedoTexture = tex(m.map);
    if (m.emissive) bm.emissiveColor = toC(m.emissive, m.emissiveIntensity == null ? 1 : m.emissiveIntensity); bm.emissiveTexture = tex(m.emissiveMap); bm.environmentIntensity = .6 }
  bm.maxSimultaneousLights = BB.maxLights || 2; bm.sideOrientation = B.Material.CounterClockWiseSideOrientation;   /* Three's front faces are CCW (right-handed scene) */
  bm.backFaceCulling = m.side !== 2; bm.alpha = m.transparent ? (m.opacity == null ? 1 : m.opacity) : 1; if (m.transparent && bm.albedoTexture) bm.useAlphaFromAlbedoTexture = true; if (m.transparent && bm.diffuseTexture) bm.useAlphaFromDiffuseTexture = true; if (m.alphaTest) bm.transparencyMode = 1;
  if (vc || m.vertexColors) { /* Babylon multiplies vertex colours in when the mesh has them */ }
  SIG.set(sk, bm); MAT.set(key, { bm, v: m.version }); BB.stats.mats++; FRZ.add(bm); return bm }
const FRZ = new Set();   /* materials are frozen a few frames after creation/change (textures must load first) */
/* ---------- mirror ---------- */
const SEEN = new Set(); let tick = 0; BB.prof = { n: 0, scan: 0, sync: 0, render: 0 };
function vis(o) { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true }
function make(o) { let n = null; if (o.userData.__baked || (BB._skipObj && BB._skipObj(o))) { BB.map.set(o, null); return null }   /* drawn by the native static world (babylon_native.js) */
  if (o.isSprite) { n = B.MeshBuilder.CreatePlane('sp', { size: 1 }, scene); n.billboardMode = B.Mesh.BILLBOARDMODE_ALL; n.material = mat(o.material) }
  else if (o.isMesh) { if (o.material && (o.material.isShaderMaterial) && o.geometry && o.geometry.boundingSphere == null) o.geometry.computeBoundingSphere(); if (o.material && o.material.isShaderMaterial && o.geometry.boundingSphere && o.geometry.boundingSphere.radius > 250) { BB.stats.skipped++; return null }   /* sky dome: Babylon clear colour + fog instead */
    const m0 = Array.isArray(o.material) ? o.material[0] : o.material; if (m0 && m0.defines && m0.defines.SHELL !== undefined) { BB.stats.skipped++; return null }   /* fur shells */
    const PL = pal(m0, o.geometry), G = geo(o.geometry, PL); if (!G) return null; n = new B.Mesh((o.name || (o.parent && o.parent.name) || 'mesh') + '#' + o.id, scene); G.applyToMesh(n);   /* node names keep the Three ids (Blender round trip) */ n._G = G; n.material = mat(o.material, !!(o.geometry.attributes.color || PL), n._ic = !!(o.isInstancedMesh && o.instanceColor)); n.useVertexColors = n._vc = !!(o.geometry.attributes.color || PL);
    if (o.isInstancedMesh) { n.thinInstanceSetBuffer('matrix', new Float32Array(o.instanceMatrix.array), 16, false); if (o.instanceColor) n.thinInstanceSetBuffer('color', rgba(o.instanceColor.array), 4, false); n.thinInstanceCount = o.count; n._iv = o.instanceMatrix.version; BB.stats.inst++ }
    if (o.isSkinnedMesh && o.skeleton && n.isVerticesDataPresent('matricesIndices')) skin(o, n);
    n.receiveShadows = true; if (csm && o.castShadow && !o.isInstancedMesh) csm.addShadowCaster(n, false) }
  else return null;
  n.isPickable = false; n.doNotSyncBoundingInfo = false; n._m = new Float64Array(16);   /* Float64: a Float32 copy never equals Three's doubles, which made every mesh look 'moved' every frame */ n._bm = B.Matrix.Identity(); n._still = 0; BB.map.set(o, n); BB.stats.meshes++; return n }
/* skinned characters: Three keeps animating its bones; Babylon gets the final bone matrices (bindMatrixInverse * bone * bindMatrix, the same
   maths as Three's skinning shader), computed only for meshes Babylon actually draws this frame */
const _sm = new THREE.Matrix4(), _bm4 = new THREE.Matrix4();
const SKEL = new Map();   /* one Babylon skeleton per Three skeleton (a character's parts share it); bones go up as ONE float texture per frame */
function skin(o, n) { const S = o.skeleton, N = S.bones.length, ident = o.bindMatrix.equals(_bm4.identity()); const key = S.uuid + (ident ? '' : ':' + o.id); let K = SKEL.get(key);
  if (!K) { const sk = new B.Skeleton('sk' + o.id, 'sk' + o.id, scene); for (let i = 0; i < N; i++) new B.Bone('b' + i, sk); const arr = new Float32Array(16 * (N + 1)); arr.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], N * 16);
    let tx = null; try { tx = B.RawTexture.CreateRGBATexture(arr, (N + 1) * 4, 1, scene, false, false, B.Constants.TEXTURE_NEAREST_SAMPLINGMODE, B.Constants.TEXTURETYPE_FLOAT) } catch (e) { tx = null }
    sk.useTextureToStoreBoneMatrices = !!tx; sk.prepare = () => { };
    const upd = () => { if (sk._ft === tick) return; sk._ft = tick; if (S._bt !== tick) { S._bt = tick; S.update() } const bmx = S.boneMatrices;
      /* Three 'attached' skins refresh bindMatrixInverse = inverse(matrixWorld) every frame, so the world placement is NOT applied twice;
         using the bone matrices alone (the old shortcut) drew every character at twice its distance from the origin */
      for (let i = 0; i < N; i++) { _bm4.fromArray(bmx, i * 16); _sm.multiplyMatrices(o.bindMatrixInverse, _bm4); if (!ident) _sm.multiply(o.bindMatrix); arr.set(_sm.elements, i * 16) } if (tx) tx.update(arr) };
    sk.getTransformMatrices = () => { upd(); return arr }; sk.getTransformMatrixTexture = () => { upd(); return tx }; K = { sk, tx }; SKEL.set(key, K); BB.stats.skeletons = (BB.stats.skeletons || 0) + 1 }
  const sk = K.sk;
  n.skeleton = sk; n.numBoneInfluencers = 4; n._skin = sk; BB.stats.skinned = (BB.stats.skinned || 0) + 1 }
const rgba = a => { const n = a.length / 3, o = new Float32Array(n * 4); for (let i = 0; i < n; i++) { o[i * 4] = a[i * 3]; o[i * 4 + 1] = a[i * 3 + 1]; o[i * 4 + 2] = a[i * 3 + 2]; o[i * 4 + 3] = 1 } return o };
const M4 = () => B.Matrix.Identity();
/* skinned characters: the bind-pose bounding box sits where the rig was authored, not where the character walks -> Babylon culled
   them. Their bounds follow the root bone instead (refreshed a few times a second). */
const _bv = new THREE.Vector3(), _iv = new THREE.Matrix4();
function skinBounds(o, n) { const S = o.skeleton, b = S && S.bones[0]; if (!b) return; b.getWorldPosition(_bv); _bv.applyMatrix4(_iv.copy(o.matrixWorld).invert()); const r = 1.6;
  n.setBoundingInfo(new B.BoundingInfo(new B.Vector3(_bv.x - r, _bv.y - 2.2, _bv.z - r), new B.Vector3(_bv.x + r, _bv.y + 2.2, _bv.z + r))); n._bm && n.freezeWorldMatrix(n._bm, true) }
function syncObj(o, n) { if (n._skin && (tick + n.uniqueId) % 6 === 0) skinBounds(o, n); if (n._still > 120 && (tick + n.uniqueId) % 30) return;   /* settled objects are re-checked twice a second */
  const e = o.matrixWorld.elements, m = n._m; let ch = false; for (let i = 0; i < 16; i++) if (m[i] !== e[i]) { ch = true; m[i] = e[i] } if (ch) { B.Matrix.FromArrayToRef(m, 0, n._bm); n.freezeWorldMatrix(n._bm, true); BB.stats.dyn++; n._still = 0 } else n._still++
  const v = vis(o) && !(o.material && o.material.visible === false) && !(o.isInstancedMesh && !o.count); let mc = false;   /* 0 instances: Babylon would compile an instance-colour shader without instancing */
  if (o.isInstancedMesh && (n._iv !== o.instanceMatrix.version || n.thinInstanceCount !== o.count)) { n.thinInstanceSetBuffer('matrix', new Float32Array(o.instanceMatrix.array), 16, false); if (o.instanceColor) n.thinInstanceSetBuffer('color', rgba(o.instanceColor.array), 4, false); n.thinInstanceCount = o.count; n._iv = o.instanceMatrix.version }
  if (o.material && !Array.isArray(o.material)) { const M = MAT.get(o.material.uuid + (n._vc ? 'v' : '') + (n._ic ? 'i' : '')); if (!M || M.v !== o.material.version || (o.material.map && TEX.get(o.material.map.uuid) && TEX.get(o.material.map.uuid).v !== o.material.map.version)) { const nm = mat(o.material, !!n._vc, n._ic); mc = nm !== n.material; n.material = nm } }
  if (n._inB) { if (ch || !v || mc || n.material !== n._inB.mat) unbatch(n); else return }
  if (n._cm) { if (!v || mc) BB._uncm && BB._uncm(n); else { if (ch) n._cm.freezeWorldMatrix(n._bm, true); return } }   /* merged into its character's single skinned mesh (babylon_native.js) */
  if (n.isEnabled() !== v) n.setEnabled(v);
  if (v && BB.batching && n._still > 120 && n._G && o.isMesh && !o.isInstancedMesh && !o.isSkinnedMesh && n.material && !(o.material && o.material.transparent) && n._bm.determinant() > 1e-9) batch(n) }
/* static batching: meshes that have not moved for ~2 s and share a material (look) are MERGED per 128 m cell into one mesh - one draw call
   instead of dozens (Babylon's per-draw CPU cost is the bottleneck on integrated GPUs).  Joins are debounced (rebuild once a cell settles);
   an object that moves, hides or changes look leaves at once (its cell is rebuilt that frame) and waits longer before it may rejoin. */
const BAT = new Map(), DIRTY = new Map(); BB.batching = window.__BAB_BATCH !== false;
function batch(n) { const e = n._m, G = n._G, k = n.material.uniqueId + (G.isVerticesDataPresent('color') ? 'c' : '') + (G.isVerticesDataPresent('uv') ? 'u' : '') + '@' + Math.floor(e[12] / 128) + ',' + Math.floor(e[14] / 128);
  let b = BAT.get(k); if (!b) { b = { k, mat: n.material, items: new Set(), mesh: null, live: new Set() }; BAT.set(k, b) } b.items.add(n); n._inB = b; DIRTY.set(b, tick) }
function unbatch(n) { const b = n._inB; if (!b) return; b.items.delete(n); n._inB = null; n._still = -480; if (b.live.has(n)) { b.live.delete(n); rebuild(b) } else DIRTY.set(b, tick) }
function rebuild(b) { if (b.mesh) { b.mesh.dispose(false, false); b.mesh = null } for (const n of b.live) if (!b.items.has(n)) n.setEnabled(true); b.live = new Set(b.items); const list = [...b.items];
  if (list.length > 1) { let m = null; try { m = B.Mesh.MergeMeshes(list, false, true, undefined, false, false) } catch (e) { m = null }
    if (m) { m.name = 'batch@' + b.k; m.material = b.mat; m.isPickable = false; m.receiveShadows = true; m._isBatch = true; m.freezeWorldMatrix(); b.mesh = m; for (const n of list) n.setEnabled(false); BB.stats.batches = (BB.stats.batches || 0) + 1 } else b.live = new Set() }
  else b.live = new Set() }
function flush() { for (const [b, t] of DIRTY) if (tick - t > 40) { DIRTY.delete(b); rebuild(b) } let s = 0, nb = 0; for (const b of BAT.values()) { s += b.live.size; if (b.mesh) nb++ } BB.stats.batched = s; BB.stats.batchMeshes = nb }
function scan() { const live = new Set(); AV.scene.traverse(o => { if (!(o.isMesh || o.isSprite)) return; live.add(o); if (!BB.map.has(o)) make(o) }); for (const [o, n] of BB.map) if (!live.has(o)) { if (n) { unbatch(n); if (n._cm && BB._uncm) BB._uncm(n); n.dispose(false, false) } BB.map.delete(o) } }
let FLIP = null;
const _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _d = new THREE.Vector3();
/* ---------- safety: never a black screen ----------
   If Babylon is not really drawing (frame counter stalls, or the picture reads back blank/black several times) or its GPU context is
   lost, rendering goes back to the stable Three.js renderer and the player sees a short notice instead of a black world. */
BB.frames = 0;
function notice(msg) { let n = document.getElementById('babNotice'); if (!n) { n = document.createElement('div'); n.id = 'babNotice'; n.style.cssText = 'position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:99999;background:rgba(20,10,40,.92);color:#ffe9a8;border:1px solid #c79cff;border-radius:10px;padding:10px 16px;font:14px system-ui,sans-serif;max-width:80vw;box-shadow:0 6px 24px rgba(0,0,0,.4)'; document.body.appendChild(n) } n.textContent = msg; clearTimeout(n._t); n._t = setTimeout(() => n.remove(), 9000) }
BB.note = msg => notice(msg);
function fallback(why) { if (!BB.on && BB.fellBack) return; BB.fellBack = why; BB.setOn(false); console.warn('[Apeverse] Babylon off: ' + why); notice('Babylon renderer switched off (' + why + '). The game continues with the stable renderer.') }
function blank() { try { const c = document.createElement('canvas'); c.width = 32; c.height = 18; const g = c.getContext('2d'); g.drawImage(cv, 0, 0, 32, 18); const d = g.getImageData(0, 0, 32, 18).data; let s = 0, s2 = 0; const n = d.length / 4; for (let i = 0; i < d.length; i += 4) { const v = (d[i] + d[i + 1] + d[i + 2]) / 3; s += v; s2 += v * v } const m = s / n, sd = Math.sqrt(Math.max(0, s2 / n - m * m)); return m < 3 || sd < 1.5 } catch (e) { return false } }
function watchdog() { let lastF = BB.frames, lastT = performance.now(), blanks = 0; const iv = setInterval(() => { if (!BB.on) return; if (!AV.running || document.hidden) { lastF = BB.frames; lastT = performance.now(); return }
    const now = performance.now(), fps = (BB.frames - lastF) * 1000 / (now - lastT); lastF = BB.frames; lastT = now; BB.stats.babFps = Math.round(fps);
    const fade = document.getElementById('fade'), covered = fade && +fade.style.opacity > .2; if (fps < 1 && (AV.fps || 0) > 5 && !covered) return fallback('no frames were being drawn');   /* the game loop runs but Babylon does not */
    if (!covered && blank()) { if (++blanks >= 3) return fallback('the picture stayed black') } else blanks = 0 }, 2000); BB._wd = iv }
function frame() { BB.frames++; if (!FLIP) FLIP = new B.Quaternion(0, 1, 0, 0); if (tick % 30 === 15 && FRZ.size) { for (const bm of FRZ) if (bm.isReady && bm.getScene && !bm.isFrozen) { const t = [bm.albedoTexture, bm.diffuseTexture, bm.emissiveTexture].filter(Boolean); if (t.every(x => x.isReady())) { bm.freeze(); FRZ.delete(bm) } } }
  const t0 = performance.now(), c = AV.cam; c.updateMatrixWorld(); AV.scene.updateMatrixWorld(); if (tick++ % 20 === 0) scan(); const t1 = performance.now();
  for (const [o, n] of BB.map) if (n) syncObj(o, n); if (AV.W && AV.W.id !== sweepW) { sweepW = AV.W.id; sweepAt = performance.now() + 5000 } if (sweepAt && performance.now() > sweepAt && tick % 20 === 5) { sweepAt = 0;   /* 5 s after arrival, once everything was scanned */ try { BB.lastSweep = BB.sweep() } catch (e) { console.warn('bab sweep', e) } }
  if (DIRTY.size) flush(); if (BB._frameHook) try { BB._frameHook(tick) } catch (e) { console.warn('bab hook', e) } const t2 = performance.now();
  const p = _p, q = _q, s = _s; c.matrixWorld.decompose(p, q, s); cam.position.set(p.x, p.y, p.z); cam.rotationQuaternion.set(q.x, q.y, q.z, q.w).multiplyInPlace(FLIP);   /* Babylon cameras look down +Z, Three's down -Z: turn 180 degrees about the camera's own up axis */ cam.fov = c.fov * Math.PI / 180; cam.maxZ = c.far; cam.minZ = c.near;
  /* lights + fog from the Three scene (time of day keeps working) */
  const S = AV.SUN, H = AV.HS; if (S) { const d = _d.subVectors(S.target.position, S.position).normalize(); sun.direction.set(d.x, d.y, d.z); sun.diffuse = toC(S.color); sun.intensity = S.intensity; sun.position.set(p.x - d.x * 80, p.y - d.y * 80, p.z - d.z * 80) }
  if (H) { hemi.diffuse = toC(H.color); hemi.groundColor = toC(H.groundColor); hemi.intensity = H.intensity * (BB.hemiScale == null ? 1 : BB.hemiScale) }
  const f = AV.scene.fog; if (f) { scene.fogColor = toC(f.color); scene.fogStart = f.near; scene.fogEnd = f.far; const sk = H ? H.color : f.color, mx = Math.max(1, sk.r, sk.g, sk.b); scene.clearColor = new B.Color4(.35 + .65 * sk.r / mx, .35 + .65 * sk.g / mx, .35 + .65 * sk.b / mx, 1); const fm = Math.max(1, f.color.r, f.color.g, f.color.b); if (fm > 1) { const cc = scene.clearColor; scene.fogColor.set(cc.r, cc.g, cc.b) } }   /* Three's fog colour is HDR here (>1): distant hills would burn to white, so fade to the sky tint */   /* sky dome shader not mirrored yet: sky tint from the hemisphere light */ else if (AV.scene.background && AV.scene.background.isColor) scene.clearColor = new B.Color4(AV.scene.background.r, AV.scene.background.g, AV.scene.background.b, 1);
  if (BB._lateHook) try { BB._lateHook(p) } catch (e) { console.warn('bab late hook', e) }   /* graphics module: sky, IBL, shadows, lights */
  scene.render(); const t3 = performance.now(), PR = BB.prof; PR.n++; PR.scan += t1 - t0; PR.sync += t2 - t1; PR.render += t3 - t2; if (PR.n >= 60) { BB.stats.ms = { scan: +(PR.scan / PR.n).toFixed(2), sync: +(PR.sync / PR.n).toFixed(2), render: +(PR.render / PR.n).toFixed(2), active: scene.getActiveMeshes().length }; PR.n = PR.scan = PR.sync = PR.render = 0 } BB.stats.fps = Math.round(engine.getFps()); BB.stats.draws = BB.instr ? BB.instr.drawCallsCounter && BB.instr.drawCallsCounter.current : 0 }
/* ---------- export pipeline (GLB of the mirrored world + portable world data) ---------- */
/* memory: after a world change, free every texture / material / geometry the new world no longer uses (each trip used to keep the
   previous world's GPU resources alive -> growing memory, very slow frames, eventually a crashed tab) */
BB.sweep = function () { if (!scene) return { tex: 0, mat: 0, geo: 0 }; const used = new Set(); for (const m of scene.meshes) if (m.material) used.add(m.material); let nt = 0, nm = 0, ng = 0;
  for (const [k, M] of MAT) if (!used.has(M.bm)) MAT.delete(k); for (const [k, bm] of SIG) if (!used.has(bm)) { SIG.delete(k); FRZ.delete(bm); try { bm.dispose(false, false) } catch (e) { } nm++ }
  const usedTex = new Set(); for (const m of scene.materials) for (const t of m.getActiveTextures ? m.getActiveTextures() : []) usedTex.add(t);
  for (const [k, e] of TEX) if (e.bt && !usedTex.has(e.bt)) { try { e.bt.dispose() } catch (x) { } TEX.delete(k); nt++ }
  for (const [k, G] of GEO) if (G.isDisposed() || !G.meshes || !G.meshes.length) { try { if (!G.isDisposed()) G.dispose() } catch (e) { } GEO.delete(k); ng++ }
  const liveSk = new Set(); for (const m of scene.meshes) if (m.skeleton) liveSk.add(m.skeleton); let ns = 0; for (const [k, K] of SKEL) if (!liveSk.has(K.sk)) { try { K.sk.dispose(); if (K.tx) K.tx.dispose() } catch (e) { } SKEL.delete(k); ns++ }
  BB.stats.swept = (BB.stats.swept || 0) + nt + nm + ng + ns; return { tex: nt, mat: nm, geo: ng, skel: ns } };
let sweepW = null, sweepAt = 0;
/* internals the native static world needs */
BB._frz = FRZ; BB._unbatch = n => unbatch(n); BB._tick = () => tick; BB._mat = (m, vc, ic) => mat(m, vc, ic); BB._flushHook = null;
BB.exportGLB = async function (name, filter) { if (!B || !B.GLTF2Export) throw new Error('serializers not loaded');
  /* the glTF writer reads local TRS, the mirror drives frozen world matrices: decompose them for the export; drop zero-scale (pooled, hidden)
     thin instances whose rotation would be NaN; batched objects are exported as their own nodes, the batch meshes are skipped */
  const ok = new Set(), restore = []; for (const b of BAT.values()) if (b.mesh && b.items.size && (!filter || filter(b.mesh))) ok.add(b.mesh);   /* batches export once, as EXT_mesh_gpu_instancing (shared geometry) */
  for (const [o, n] of BB.map) { if (!n || (n._inB && n._inB.live.has(n)) || !n.isEnabled() || (filter && !filter(n, o))) continue; if (Math.abs(n._bm.determinant()) < 1e-12) continue; n.rotationQuaternion = n.rotationQuaternion || new B.Quaternion(); n._bm.decompose(n.scaling, n.rotationQuaternion, n.position); ok.add(n);
    if (n.thinInstanceCount > 0 && n._thinInstanceDataStorage && n._thinInstanceDataStorage.matrixData) { const src = n._thinInstanceDataStorage.matrixData, cnt = n.thinInstanceCount, keepI = [], M = B.Matrix.Identity(); for (let i = 0; i < cnt; i++) { B.Matrix.FromArrayToRef(src, i * 16, M); if (Math.abs(M.determinant()) > 1e-12) keepI.push(i) }
      if (keepI.length < cnt) { const a = new Float32Array(Math.max(1, keepI.length) * 16); keepI.forEach((j, i) => a.set(src.subarray(j * 16, j * 16 + 16), i * 16)); restore.push([n, new Float32Array(src.subarray(0, cnt * 16)), cnt]); n.thinInstanceSetBuffer('matrix', a, 16, false); n.thinInstanceCount = keepI.length; if (!keepI.length) ok.delete(n) } } }
  for (const t of scene.textures.slice()) if (!t.isReady() && t.getClassName() === 'DynamicTexture') { try { t.update() } catch (x) { } if (!t.isReady()) { BB.stats.texDropped = (BB.stats.texDropped || 0) + 1; for (const m of scene.materials) for (const k of ['albedoTexture', 'diffuseTexture', 'emissiveTexture']) if (m[k] === t) { if (m.isFrozen) m.unfreeze(); m[k] = null } t.dispose() } }
  const detached = [], pulled = scene.textures.filter(t => !t.isReady()); for (const t of pulled) for (const m of scene.materials) for (const k of ['albedoTexture', 'diffuseTexture', 'emissiveTexture']) if (m[k] === t) { if (m.isFrozen) m.unfreeze(); detached.push([m, k, t]); m[k] = null }
  for (const t of pulled) scene.removeTexture(t);   /* e.g. a video that never plays in a headless browser */
  /* the scene has been rendering every frame, so everything is compiled; Babylon 7.31's whenReady re-checks instanced
     materials WITHOUT instancing (vertex + instance colour -> 'instanceColor undeclared'), which would never become ready */
  const wr = scene.whenReadyAsync; scene.whenReadyAsync = () => Promise.resolve();
  for (const n of ok) if (n._skin) n.skeleton = null; BB.expStage = 'exporting ' + ok.size + ' nodes';
  const limit = new Promise((_, no) => setTimeout(() => { let nr = []; try { nr = scene.meshes.filter(m => m.isEnabled() && !m.isReady(true)).slice(0, 6).map(m => m.name + (m.material ? '/' + m.material.name : '')) } catch (e) { } const tx = scene.textures.filter(t => !t.isReady()).slice(0, 6).map(t => t.getClassName() + ':' + t.name); no(new Error('GLB export timed out at: ' + BB.expStage + ' | sceneReady=' + scene.isReady() + ' | notReadyMeshes=' + nr.join(',') + ' | notReadyTex=' + tx.join(','))) }, BB.exportTimeout || 120000));
  let r; try { r = await Promise.race([B.GLTF2Export.GLBAsync(scene, name || 'world', { shouldExportNode: x => ok.has(x), shouldExportTexture: t => { BB.expStage = 'texture ' + (t && t.name); return true } }), limit]); BB.expStage = 'done' } finally { scene.whenReadyAsync = wr; for (const t of pulled) scene.addTexture(t); for (const [m, k, t] of detached) m[k] = t; for (const n of ok) { if (n._skin) n.skeleton = n._skin; if (n._isBatch) continue; n.position.set(0, 0, 0); n.scaling.set(1, 1, 1); n.rotationQuaternion.set(0, 0, 0, 1); n.freezeWorldMatrix(n._bm, true) } for (const [n, a, c] of restore) { n.thinInstanceSetBuffer('matrix', a, 16, false); n.thinInstanceCount = c } }
  const k = Object.keys(r.glTFFiles)[0]; BB.stats.exported = ok.size; return r.glTFFiles[k] };
BB.exportWorld = function () { const W = AV.W, lbl = t => { try { return typeof t.label === 'function' ? t.label() : String(t.label || '') } catch (e) { return '' } };
  return { format: 'apeverse-world/1', world: W.id, name: W.name, exportedAt: new Date().toISOString(), arrivals: W.arrivals, places: W.places, cols: W.cols, circles: W.circles, mapRoads: W.mapRoads || [], mapNav: W.mapNav || null,
    interactables: W.T.map(t => ({ x: +t.x.toFixed(2), z: +t.z.toFixed(2), r: t.r, label: lbl(t), npc: t.npc ? t.npc.id : null, venue: t.lwVenue || null, inside: !!t.lwInside })),
    npcs: W.T.filter(t => t.npc).map(t => ({ id: t.npc.id, name: (AV.NPCS[t.npc.id] || {}).name, x: +t.npc.g.position.x.toFixed(2), z: +t.npc.g.position.z.toFixed(2) })),
    missions: AV.mis ? Object.values(AV.mis.defs).filter(d => d.w === W.id).map(d => ({ id: d.id, cat: d.cat, title: d.title, blurb: d.blurb, giver: typeof d.giver === 'string' ? d.giver : 'board', repeat: !!d.repeat, after: d.after || [], stages: d.stages.map(s => ({ k: s.k, npc: s.npc, p: s.p, x: s.x, z: s.z, ev: s.ev, item: s.item })), reward: { money: typeof (d.reward || {}).money === 'number' ? d.reward.money : 'dynamic', rep: (d.reward || {}).rep } })) : [],
    businesses: AV.LW && AV.LW.bizCoverage ? AV.LW.bizCoverage().list.map(b => ({ name: b.name, kind: b.kind, x: b.x, z: b.z, interactive: !!b.ok, enterable: !!b.enter })) : [],
    homes: AV.LW && AV.LW.props ? AV.LW.props(W.id).map(x => ({ id: x.id, name: x.P.name, cat: x.P.cat, price: x.P.price, rent: x.P.rent })) : [], dialogueCharacters: Object.keys((AV.convo && AV.convo.trees) || {}) } };
})(window.AV);
