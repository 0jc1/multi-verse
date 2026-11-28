/* APEVERSE 3.0 (experimental) - babylon_gfx.js : the first visible graphics upgrade of the Babylon build + Low/Medium/High/Ultra presets.
     - SKY: physically based sky (Babylon SkyMaterial) driven by the game's own sun -> real blue sky, sunsets, dark nights (replaces the
       Three.js sky-dome shader, which the mirror could only approximate)
     - IBL: the sky is captured into an environment cube (refreshed when the sun moves) -> image-based ambient light + reflections on
       PBR surfaces (glass, cars, water, metal)
     - SHADOWS: sun shadows around the player (Medium: 1024 PCF, High/Ultra: cascaded 2048), casters limited by distance
     - LIGHTS: the nearest street / shop point lights of the Three scene become real Babylon lights (2 on Medium, 4 High, 6 Ultra);
       neon signs, lamps and shop windows glow (GlowLayer)
     - WATER: canals become reflective animated water (procedural noise normal map) using the game's own deep/shallow colours
     - POST: neutral PBR tone mapping, light contrast; bloom on High/Ultra, ambient occlusion (SSAO2) on Ultra
   Presets: AV.bab.gfx.set('low'|'medium'|'high'|'ultra'), F6 cycles them in game (saved).  Medium is tuned for the Iris Xe laptop. */
'use strict';
(function (AV) {
const BB = AV.bab; if (!BB || !BB.want) return;
const PRESETS = {
  low: { label: 'Low', scale: 1.35, sky: true, ibl: false, shadows: 0, glow: false, bloom: false, ssao: false, lights: 0, water: false },
  medium: { label: 'Medium', scale: 1.15, sky: true, ibl: true, shadows: 1024, dist: 30, casterMax: 12, shadowEvery: 3, glow: true, glowRatio: .25, glowOnly: true, bloom: false, ssao: false, lights: 0, water: true },
  high: { label: 'High', scale: 1, sky: true, ibl: true, shadows: 2048, csm: 3, dist: 70, casterMax: 40, glow: true, glowRatio: .5, glowOnly: true, bloom: true, ssao: false, lights: 2, water: true },
  ultra: { label: 'Ultra', scale: .75, sky: true, ibl: true, shadows: 2048, csm: 4, dist: 160, glow: true, glowRatio: .5, bloom: true, ssao: true, lights: 6, water: true } };
let stored = null; try { stored = localStorage.getItem('apeverse_bab_gfx') } catch (e) { }
const GX = BB.gfx = { _lc: 0, presets: PRESETS, preset: PRESETS[stored] ? stored : 'medium', auto: !PRESETS[stored], ready: false, stats: {} };   /* no saved choice -> Auto (Medium, steps down to Low if the laptop cannot hold ~26 FPS) */
let B, scene, sky, skyMat, probe, sg, glow, pipe, ssao, noise, lastSun = null, waters = [], pls = [], libP = null;

/* sky-dome shader object of the Three scene: not mirrored when the real sky is on */
BB._skipObj = o => { const m = o.material; return !!(m && m.isShaderMaterial && m.uniforms && m.uniforms.uSunDir && m.uniforms.uSky) };
/* water shader -> reflective PBR water */
BB._shaderMat = (m, sc) => { const u = m.uniforms || {}; if (!(u.deep && u.shallow) || !PRESETS[GX.preset].water) return null; const Bx = window.BABYLON, w = new Bx.PBRMaterial('water' + waters.length, sc);
  const d = u.deep.value, s = u.shallow.value; w.albedoColor = new Bx.Color3((d.r + s.r) * .5, (d.g + s.g) * .5, (d.b + s.b) * .5); w.metallic = 0; w.roughness = .07; w.environmentIntensity = 1.1; w.reflectivityColor = new Bx.Color3(.25, .25, .25);
  w._wAlpha = u.op ? Math.max(.55, Math.min(.95, u.op.value)) : .85; w.freeze = () => { }; if (noise) { w.bumpTexture = noise; w.bumpTexture.level = .35 } waters.push(w); return w };

function libs() { if (!libP) libP = BB._load(BB._lib('babylonjs-materials') + 'babylonjs.materials.min.js').catch(() => null); return libP }

function setup() { B = window.BABYLON; scene = BB.scene; GX.ready = true;
  noise = new B.NoiseProceduralTexture('waterNoise', 256, scene); noise.animationSpeedFactor = 1.6; noise.persistence = .9; noise.brightness = .5; noise.octaves = 3; noise.uScale = noise.vScale = 8;
  for (const w of waters) { w.bumpTexture = noise; w.bumpTexture.level = .35 }
  libs().then(() => { if (!B.SkyMaterial) return; skyMat = new B.SkyMaterial('skyM', scene); skyMat.backFaceCulling = false; skyMat.useSunPosition = true; skyMat.turbidity = 4; skyMat.luminance = 1; skyMat.rayleigh = 1.6; skyMat.mieCoefficient = .004; skyMat.mieDirectionalG = .82; skyMat.fogEnabled = false;
    sky = B.MeshBuilder.CreateBox('skyBox', { size: 600, sideOrientation: B.Mesh.BACKSIDE }, scene); sky.material = skyMat; sky.infiniteDistance = true; sky.applyFog = false; sky.isPickable = false; sky.renderingGroupId = 0; apply() });
  addEventListener('keydown', e => { if (e.code !== 'F6' || !BB.on) return; e.preventDefault(); const k = Object.keys(PRESETS); GX.set(k[(k.indexOf(GX.preset) + 1) % k.length]); BB.note && BB.note('Graphics (Babylon): ' + PRESETS[GX.preset].label) });
  apply() }

function disposeFx() { if (sg) { sg.dispose(); sg = null } if (glow) { glow.dispose(); glow = null } if (pipe) { pipe.dispose(); pipe = null } if (ssao) { ssao.dispose(); ssao = null } if (probe) { scene.environmentTexture = null; probe.dispose(); probe = null } for (const l of pls) l.dispose(); pls = [] }

function apply() { if (!GX.ready) return; const P = PRESETS[GX.preset], cam = scene.activeCamera, sun = scene.lights.find(l => l.name === 'sun'); disposeFx();
  BB.engine.setHardwareScalingLevel(P.scale / Math.max(.75, Math.min(2, AV.R.getPixelRatio ? AV.R.getPixelRatio() : 1)));
  if (sky) sky.setEnabled(!!P.sky);
  const ip = scene.imageProcessingConfiguration; ip.toneMappingEnabled = GX.preset !== 'low'; ip.toneMappingType = B.ImageProcessingConfiguration.TONEMAPPING_KHR_PBR_NEUTRAL != null ? B.ImageProcessingConfiguration.TONEMAPPING_KHR_PBR_NEUTRAL : B.ImageProcessingConfiguration.TONEMAPPING_ACES; ip.exposure = 1.05; ip.contrast = 1.12;
  if (P.ibl && sky) { probe = new B.ReflectionProbe('env', 128, scene, true, true); probe.renderList.push(sky); probe.refreshRate = B.RenderTargetTexture.REFRESHRATE_RENDER_ONCE; probe.cubeTexture.realTimeFiltering = true; probe.cubeTexture.realTimeFilteringQuality = B.Constants.TEXTURE_FILTERING_QUALITY_LOW; scene.environmentTexture = probe.cubeTexture; lastSun = null }
  BB.hemiScale = P.ibl && sky ? .45 : 1;   /* the environment light now carries most of the ambient: avoid double lighting */
  if (P.shadows && sun) { const near = m => { if (!m.isEnabled() || m === sky || m.name === 'skyBox' || !m.material || m.skeleton) return false;   /* Babylon 7.31: the shadow depth pass throws for bone-texture skinned meshes, which left every character 'not ready' (invisible) */ const bs = m.getBoundingInfo().boundingSphere, c = scene.activeCamera.position; if (P.casterMax && bs.radiusWorld > P.casterMax) return false; return B.Vector3.Distance(bs.centerWorld, c) < P.dist + bs.radiusWorld };   /* big merged cells / terrain do not cast */
    if (P.csm && B.CascadedShadowGenerator) { sg = new B.CascadedShadowGenerator(P.shadows, sun); sg.numCascades = P.csm; sg.lambda = .8; sg.shadowMaxZ = P.dist; sg.stabilizeCascades = true; sg.filteringQuality = B.ShadowGenerator.QUALITY_MEDIUM; sg.autoCalcDepthBounds = false }
    else { sg = new B.ShadowGenerator(P.shadows, sun); sg.usePercentageCloserFiltering = true; sg.filteringQuality = B.ShadowGenerator.QUALITY_LOW; sun.autoUpdateExtends = false; sun.shadowFrustumSize = P.dist * 2; sun.shadowMinZ = 1; sun.shadowMaxZ = 260 }
    sg.bias = .0015; sg.normalBias = .02; sg.darkness = .25; const sm = sg.getShadowMap(); sm.renderListPredicate = near; if (!P.csm) sm.refreshRate = P.shadowEvery || 1 }
  if (P.glow) { glow = new B.GlowLayer('glow', scene, { mainTextureRatio: P.glowRatio, blurKernelSize: 32 }); glow.intensity = .65; if (P.glowOnly) { GX._glowSel = 0; refreshGlow() } else if (sky) glow.addExcludedMesh(sky) }
  for (let i = 0; i < P.lights; i++) { const l = new B.PointLight('pl' + i, B.Vector3.Zero(), scene); l.falloffType = B.Light.FALLOFF_STANDARD; l.setEnabled(false); pls.push(l) }
  BB.maxLights = 2 + P.lights; for (const m of scene.materials) if (m.maxSimultaneousLights != null) { if (m.isFrozen) m.unfreeze(); m.maxSimultaneousLights = 2 + P.lights; m.markAsDirty(B.Material.AllDirtyFlag); if (BB._frz && m.freeze.length === 0 && m.name.indexOf('water') !== 0) BB._frz.add(m) }   /* recompile with shadows / lights, refrozen a little later */
  if (P.bloom) { pipe = new B.DefaultRenderingPipeline('gfxPipe', true, scene, [cam]); pipe.fxaaEnabled = true; pipe.bloomEnabled = true; pipe.bloomThreshold = .85; pipe.bloomWeight = .3; pipe.bloomKernel = 48; pipe.bloomScale = .5; pipe.imageProcessingEnabled = false }
  if (P.ssao && B.SSAO2RenderingPipeline && B.SSAO2RenderingPipeline.IsSupported) { ssao = new B.SSAO2RenderingPipeline('ssao', scene, { ssaoRatio: .5, blurRatio: .5 }, [cam]); ssao.radius = 1.6; ssao.totalStrength = 1.1; ssao.samples = 16; ssao.maxZ = 120 }
  GX.stats = { auto: GX.auto, preset: GX.preset, sky: !!(sky && P.sky), ibl: !!probe, shadows: sg ? (P.csm ? 'csm' + P.csm + '@' + P.shadows : 'pcf@' + P.shadows) : 'off', glow: !!glow, lights: pls.length, bloom: !!pipe, ssao: !!ssao, water: waters.length } }

/* glow renders ONLY the clearly emissive meshes (neon, lamps, screens) instead of re-drawing the whole city */
function refreshGlow() { if (!glow) return; const keep = new Set(); for (const m of scene.meshes) { const mt = m.material; if (!mt || !m.isEnabled()) continue; const e = mt.emissiveColor; if ((e && e.r + e.g + e.b > .6) || mt.emissiveTexture) keep.add(m) }
  const cur = glow._includedOnlyMeshes || []; for (const id of cur.slice()) { const m = scene.getMeshByUniqueId(id); if (m && !keep.has(m)) glow.removeIncludedOnlyMesh(m) } for (const m of keep) glow.addIncludedOnlyMesh(m); GX.stats.glowMeshes = keep.size }
GX.set = (p, keepAuto) => { if (p === 'auto') { GX.auto = true; try { localStorage.removeItem('apeverse_bab_gfx') } catch (e) { } p = 'medium' } else if (!keepAuto) { GX.auto = false; try { localStorage.setItem('apeverse_bab_gfx', p) } catch (e) { } } if (!PRESETS[p]) return; GX.preset = p; apply() };
/* Auto: watch Babylon's own frame rate (measured by the watchdog every 2 s) */
let slow = 0, fast = 0, autoT = 0; function autoTune() { if (!GX.auto || performance.now() - autoT < 1900) return; autoT = performance.now(); const f = BB.stats.babFps; if (!f || !AV.running || document.hidden) return;
  const fade = document.getElementById('fade'); if (fade && +fade.style.opacity > .2) return;
  if (GX.preset === 'medium') { slow = f < 26 ? slow + 1 : 0; if (slow >= 3) { slow = 0; GX.set('low', true); BB.note && BB.note('Graphics: Auto switched to Low to keep the game smooth (choose a preset in Settings or with F6).') } }
  else if (GX.preset === 'low') { fast = f > 45 ? fast + 1 : 0; if (fast >= 15) { fast = 0; GX.set('medium', true) } } }

/* every frame, just before Babylon renders */
BB._lateHook = camPos => { if (!GX.ready) { if (BB.scene) setup(); return } autoTune(); const P = PRESETS[GX.preset], sun = scene.lights.find(l => l.name === 'sun');
  if (skyMat && sun) { const d = sun.direction; skyMat.sunPosition.set(-d.x * 100, -d.y * 100, -d.z * 100); const h = -d.y;   /* sun height: day / sunset / night */
    skyMat.luminance = h > .05 ? 1 : Math.max(.08, .1 + h * 18); skyMat.turbidity = h > .25 ? 4 : 9;
    if (probe && (!lastSun || B.Vector3.Distance(lastSun, d) > .03)) { lastSun = d.clone(); probe.cubeTexture.resetRefreshCounter() } if (probe) probe.position.copyFrom(camPos) }
  if (pls.length) { if (!GX._lt || ++GX._lc % 30 === 0) { GX._lt = []; AV.scene.traverse(o => { if (o.isPointLight) GX._lt.push(o) }) }   /* light list refreshed twice a second */
    const L = []; for (const o of GX._lt) if (o.visible && o.intensity > .05 && o.parent) { const p = o.getWorldPosition(new THREE.Vector3()); L.push([o, p, (p.x - camPos.x) ** 2 + (p.z - camPos.z) ** 2]) } L.sort((a, b) => a[2] - b[2]);
    for (let i = 0; i < pls.length; i++) { const l = pls[i], s = L[i]; if (!s) { l.setEnabled(false); continue } l.setEnabled(true); l.position.set(s[1].x, s[1].y, s[1].z); l.diffuse.set(s[0].color.r, s[0].color.g, s[0].color.b); l.intensity = s[0].intensity * 1.2; l.range = s[0].distance || 18 } }
  for (const w of waters) { w.alpha = w._wAlpha }
  if (glow && P.glowOnly && ++GX._lc % 120 === 7) refreshGlow() }   /* new neon (streaming, night) picked up every few seconds */
})(window.AV);
