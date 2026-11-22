/* APEVERSE V0.9.1 - assets.js : optional GLB model loading with procedural fallback.
   AV.assets.model(ctx, key, fallbackFn, x, y, z, ry, s) -> THREE.Group placed in the world.
   The fallback (procedural) object appears immediately; if data/models.js registers `key` and the page is served over http(s),
   the GLB replaces it when loaded (cached and cloned for every use). A missing or broken file simply keeps the fallback. */
'use strict';
(function (AV) {
const A = AV.assets = { cache: {}, failed: {}, loaded: 0 };
const loader = THREE.GLTFLoader ? new THREE.GLTFLoader() : null;
A.available = key => !!(loader && !AV.isFile && AV.MODELS && AV.MODELS[key] && !A.failed[key]);
function load(key) {
  if (A.cache[key]) return A.cache[key]; const def = AV.MODELS[key];
  A.cache[key] = new Promise((ok, no) => loader.load(def.file, g => { A.loaded++; ok(g.scene) }, undefined, e => { A.failed[key] = 1; console.warn('model failed: ' + def.file, e); no(e) }));
  return A.cache[key];
}
function prepare(obj, def) {
  obj.traverse(o => {
    if (!o.isMesh) return; o.castShadow = o.receiveShadow = true;
    if (def.tint != null && o.material) { o.material = o.material.clone(); if (o.material.color) o.material.color.lerp(new THREE.Color(def.tint).convertSRGBToLinear(), def.tintAmt == null ? .35 : def.tintAmt) }
    if (o.material) o.material.userData.lin = 1;   // GLTF colours are already linear
  });
  return obj;
}
/* a model's meshes flattened into {geo, mat} parts (node transforms baked in), cached and shared by every world */
const partsCache = {};
A.parts = function (key) {
  if (partsCache[key]) return partsCache[key];
  return partsCache[key] = load(key).then(scene => {
    scene.updateMatrixWorld(true); const out = [];
    scene.traverse(o => { if (!o.isMesh) return; const g = o.geometry.clone(); g.applyMatrix4(o.matrixWorld); g.userData.shared = true;
      const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach(m => { m.userData.shared = true; m.userData.lin = 1; if (m.map) { m.map.userData = m.map.userData || {}; m.map.userData.keep = true } });
      out.push({ geo: g, mat: o.material }) });
    return out;
  });
};
/* start downloading every registered model right away (http only), so worlds can swap them in quickly */
A.preload = function (filter) { if (!loader || AV.isFile || !AV.MODELS) return; for (const k in AV.MODELS) if (!filter || filter(k, AV.MODELS[k])) A.parts(k).catch(() => { }) };
A.ready = function (ms) { const all = Object.values(partsCache); return Promise.race([Promise.all(all.map(p => p.catch(() => null))), new Promise(r => setTimeout(r, ms || 10000))]) };
A.model = function (ctx, key, fallback, x, y, z, ry, s) {
  const g = new THREE.Group(); g.position.set(x || 0, y || 0, z || 0); g.rotation.y = ry || 0; g.scale.setScalar(s || 1); ctx.group.add(g);
  const fb = fallback ? fallback(g) : null;
  if (A.available(key)) {
    const def = AV.MODELS[key];
    load(key).then(scene => { if (!g.parent) return; const m = prepare(scene.clone(true), def); m.scale.multiplyScalar(def.scale || 1); m.position.y += def.y || 0; if (fb) { g.remove(fb); AV.dispose(fb) } else g.children.slice().forEach(c => { g.remove(c); AV.dispose(c) }); g.add(m) }).catch(() => { });
  }
  return g;
};
})(window.AV);
