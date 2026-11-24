/* APEVERSE - static_merge.js : Cinematic V1 performance. After a world is built, many static pieces are still separate meshes
   (walls from ctx.building, merged prop meshes from each module, ...). Every one is a draw call. This pass merges the top-level
   meshes that share an identical material setup into one mesh per material per 120 m cell (so frustum culling still works).
   Safety rules: only direct children of the world group, opaque, no custom shader hooks (sway / glow materials keep their own),
   no skinned / instanced meshes, no single-use textures (painted canvases that get redrawn), userData.noMerge respected, and every
   candidate must not have moved or changed for 2.5 s before it is merged. Nothing is deleted: merged originals are just detached.
   AV.staticMerge.run(W) -> { before, after, merged }; worlds opt in through AV.staticMerge.WORLDS. */
'use strict';
(function (AV) {
const SM = AV.staticMerge = { WORLDS: { astro9: 1 }, last: null };
const baseHook = THREE.Material.prototype.onBeforeCompile;
const keyOf = (o, cell) => { const m = o.material, g = o.geometry, att = Object.keys(g.attributes).sort().join(',');
  return [m.type, m.vertexColors ? 1 : 0, m.color ? m.color.getHexString() : '', m.roughness, m.metalness, m.emissive ? m.emissive.getHexString() : '', m.emissiveIntensity, m.side, m.map ? m.map.uuid : '', m.emissiveMap ? m.emissiveMap.uuid : '', m.alphaTest, m.polygonOffset ? m.polygonOffsetFactor : 'n', m.flatShading ? 1 : 0, m.toneMapped, m.fog, att, o.castShadow ? 1 : 0, o.receiveShadow ? 1 : 0, cell].join('|') };
function candidates(W) { const out = [], maps = new Map(); W.group.children.forEach(o => { if (!o.isMesh || o.isSkinnedMesh || o.isInstancedMesh || !o.visible || o.userData.noMerge || Array.isArray(o.material)) return; const m = o.material, g = o.geometry;
    if (!g || !g.attributes || !g.attributes.position || g.morphAttributes && Object.keys(g.morphAttributes).length || m.transparent || m.isShaderMaterial || m.onBeforeCompile !== baseHook || o.children.length || o.onBeforeRender !== THREE.Object3D.prototype.onBeforeRender) return;
    out.push(o); for (const t of [m.map, m.emissiveMap]) if (t) maps.set(t.uuid, (maps.get(t.uuid) || 0) + 1) });
  return out.filter(o => [o.material.map, o.material.emissiveMap].every(t => !t || maps.get(t.uuid) > 1 || o.geometry.attributes.position.count > 200)) }   /* single-use small textured planes (paintings, screens) stay apart */
function snap(o) { o.updateMatrix(); const m = o.material; return o.matrix.elements.join(',') + '|' + (m.color ? m.color.getHex() : '') + '|' + (m.emissive ? m.emissive.getHex() : '') + '|' + m.emissiveIntensity + '|' + o.visible + '|' + (o.parent ? o.parent.uuid : '') }
function mergeGroup(list) { const geos = list.map(o => { const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); o.updateMatrix(); g.applyMatrix4(o.matrix); return g });
  const names = Object.keys(geos[0].attributes), out = new THREE.BufferGeometry(); let n = 0; geos.forEach(g => n += g.attributes.position.count);
  for (const a of names) { const sz = geos[0].attributes[a].itemSize, arr = new Float32Array(n * sz); let off = 0; for (const g of geos) { const at = g.attributes[a]; arr.set(at.array.length === at.count * sz ? at.array : Array.from({ length: at.count * sz }, (_, i) => at.getComponent ? at.getComponent(Math.floor(i / sz), i % sz) : at.array[i]), off); off += at.count * sz } out.setAttribute(a, new THREE.BufferAttribute(arr, sz)) }
  geos.forEach(g => g.dispose()); out.computeBoundingSphere(); const me = new THREE.Mesh(out, list[0].material); me.castShadow = list[0].castShadow; me.receiveShadow = list[0].receiveShadow; me.name = 'static_merge'; me.userData.noMerge = 1; me.userData.mergedFrom = list.length; return me }
SM.run = function (W) { const c0 = candidates(W), shot = new Map(c0.map(o => [o, snap(o)])), before = W.group.children.filter(o => o.isMesh).length;
  return new Promise(res => setTimeout(() => { if (AV.W !== W) return res(null);
    const ok = c0.filter(o => o.parent === W.group && snap(o) === shot.get(o)); const buckets = new Map();
    for (const o of ok) { o.geometry.computeBoundingSphere(); const p = o.geometry.boundingSphere.center.clone().applyMatrix4(o.matrix), cell = Math.floor(p.x / 120) + ',' + Math.floor(p.z / 120), k = keyOf(o, cell); if (!buckets.has(k)) buckets.set(k, []); buckets.get(k).push(o) }
    let merged = 0; for (const list of buckets.values()) { if (list.length < 2) continue; try { const me = mergeGroup(list); W.group.add(me); for (const o of list) W.group.remove(o); merged += list.length } catch (e) { console.warn('static merge skipped a bucket', e) } }
    SM.last = { world: W.id, candidates: c0.length, stable: ok.length, merged, before, after: W.group.children.filter(o => o.isMesh).length }; res(SM.last) }, 2500)) };
const prev = AV.onWorldEnter; AV.onWorldEnter = function (W) { if (prev) prev(W); if (W && SM.WORLDS[W.id] && !(AV.S && AV.S.set && AV.S.set.noMerge)) setTimeout(() => { if (AV.W === W) SM.run(W) }, 1500) };
})(window.AV);
