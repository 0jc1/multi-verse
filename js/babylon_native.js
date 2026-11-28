/* APEVERSE 3.0 (experimental) - babylon_native.js : the NATIVE STATIC WORLD for Ape Town (Stage 3, step 1).
   The mirror (babylon_mirror.js) copies the live Three.js scene every frame.  Here, once Ape Town has settled after arrival, everything
   static (buildings, ground, props that have not moved) is BAKED into native Babylon meshes:
     - merged per material (look) and per 96 m cell (frustum culling stays useful),
     - vertices welded (Three's geometry is mostly non-indexed: 3 vertices per triangle) -> indexed, much less memory,
     - world matrices, normals, materials and bounding info frozen: Babylon does no per-frame work for them at all,
     - the Three objects are no longer mirrored (no matrix compare, no sync).
   Only moving things (people, animals, vehicles, animated props, screens) keep being mirrored.  A baked object that later moves or
   hides (a parked car driven away, a door) leaves the bake automatically and is mirrored again.  Baking is time-sliced (a few ms per
   frame) so arrival does not freeze.  ?native=0 turns it off (pure mirror) for A/B comparisons; AV.bab.native = { stats, exportGLB() }. */
'use strict';
(function (AV) {
const BB = AV.bab; if (!BB || !BB.want) return;
const NV = BB.native = { on: !/native=0/.test(location.search), worlds: ['ape_town'], state: 'idle', stats: { groups: 0, items: 0, verts: 0, tris: 0, srcVerts: 0, bakeMs: 0, unbaked: 0 } };
let B, worldId = null, settleT = 0, queue = [], groups = [], watchI = 0;
const CELL = 96;

function clearAll() { for (const g of groups) { if (g.mesh) g.mesh.dispose(false, false); for (const [o] of g.items) if (o.userData.__baked) { delete o.userData.__baked; BB.map.delete(o) } }
  groups = []; queue = []; NV.state = 'idle'; Object.assign(NV.stats, { groups: 0, items: 0, verts: 0, tris: 0, srcVerts: 0, bakeMs: 0 }) }

function vis(o) { for (let p = o; p; p = p.parent) if (!p.visible) return false; return !(o.material && o.material.visible === false) }

function collect() { const G = new Map(); let n0 = 0; const why = NV.why = {}, no = k => { why[k] = (why[k] || 0) + 1 };
  for (const [o, n] of BB.map) { if (!n) { no(o.userData.__baked ? 'baked' : 'null'); continue } if (n._isBatch) continue; if (o.isSprite) { no('sprite'); continue } if (o.isSkinnedMesh || n.skeleton) { no('skinned'); continue } if (o.isInstancedMesh) { no('instanced'); continue } if (!o.isMesh) { no('other'); continue }
    if (!n._G || !n.material) { no('nogeo'); continue } if (!vis(o)) { no('hidden'); continue } if (n._still < 120) { no('moving'); continue } if (o.material && (o.material.transparent || Array.isArray(o.material))) { no('transparent'); continue }
    if (n._bm.determinant() <= 1e-9) { no('mirrored/flat'); continue } if (n.material.name.startsWith('sh')) { no('shader'); continue }   /* custom-shader approximations stay mirrored */
    const geo = n._G, e = n._m, k = n.material.uniqueId + (geo.isVerticesDataPresent('color') ? 'c' : '') + (geo.isVerticesDataPresent('uv') ? 'u' : '') + '@' + Math.floor(e[12] / CELL) + ',' + Math.floor(e[14] / CELL);
    let g = G.get(k); if (!g) G.set(k, g = { k, mat: n.material, vc: !!n.useVertexColors && geo.isVerticesDataPresent('color'), uv: geo.isVerticesDataPresent('uv'), items: [], mesh: null }); g.items.push([o, n]); n0++ }
  return [...G.values()] }

/* weld + merge one group into a native mesh (positions/normals in world space, indices 32-bit when needed) */
const _v = { x: 0, y: 0, z: 0 };
function build(g) { const pos = [], nor = [], uv = [], col = [], idx = []; let src = 0;
  const P3 = new B.Vector3(), N3 = new B.Vector3(), NM = new B.Matrix();
  for (const [o, n] of g.items) { const G = n._G, P = G.getVerticesData('position'), N = G.getVerticesData('normal'), U = g.uv ? G.getVerticesData('uv') : null, C = g.vc ? G.getVerticesData('color') : null, I = G.getIndices(); if (!P || !I) continue;
    const M = n._bm; M.invertToRef(NM); NM.transposeToRef(NM); const nv = P.length / 3, cStride = C ? Math.round(C.length / nv) : 4, local = new Map(), remap = new Int32Array(nv); src += nv;
    for (let v = 0; v < nv; v++) { B.Vector3.TransformCoordinatesFromFloatsToRef(P[v * 3], P[v * 3 + 1], P[v * 3 + 2], M, P3); let nx = 0, ny = 1, nz = 0;
      if (N) { B.Vector3.TransformNormalFromFloatsToRef(N[v * 3], N[v * 3 + 1], N[v * 3 + 2], NM, N3); N3.normalize(); nx = N3.x; ny = N3.y; nz = N3.z }
      const u0 = U ? U[v * 2] : 0, u1 = U ? U[v * 2 + 1] : 0, c0 = C ? C[v * cStride] : 1, c1 = C ? C[v * cStride + 1] : 1, c2 = C ? C[v * cStride + 2] : 1;
      const key = Math.round(P3.x * 500) + ',' + Math.round(P3.y * 500) + ',' + Math.round(P3.z * 500) + ',' + Math.round(nx * 64) + ',' + Math.round(ny * 64) + ',' + Math.round(nz * 64) + (U ? ',' + Math.round(u0 * 4096) + ',' + Math.round(u1 * 4096) : '') + (C ? ',' + Math.round(c0 * 255) + ',' + Math.round(c1 * 255) + ',' + Math.round(c2 * 255) : '');
      let w = local.get(key); if (w === undefined) { w = pos.length / 3; local.set(key, w); pos.push(P3.x, P3.y, P3.z); nor.push(nx, ny, nz); if (g.uv) uv.push(u0, u1); if (g.vc) col.push(c0, c1, c2, 1) } remap[v] = w }
    for (let i = 0; i < I.length; i++) idx.push(remap[I[i]]) }
  if (!idx.length) return null;
  const vd = new B.VertexData(); vd.positions = new Float32Array(pos); vd.normals = new Float32Array(nor); if (g.uv) vd.uvs = new Float32Array(uv); if (g.vc) vd.colors = new Float32Array(col); vd.indices = pos.length / 3 > 65535 ? new Uint32Array(idx) : new Uint16Array(idx);
  const m = new B.Mesh('native@' + g.k, BB.scene); vd.applyToMesh(m, false); m.material = g.mat; m.useVertexColors = g.vc; m.isPickable = false; m.receiveShadows = true; m._native = true;
  m.freezeWorldMatrix(); m.doNotSyncBoundingInfo = true; m.freezeNormals(); m.cullingStrategy = B.AbstractMesh.CULLINGSTRATEGY_BOUNDINGSPHERE_ONLY;
  NV.stats.verts += pos.length / 3; NV.stats.tris += idx.length / 3; NV.stats.srcVerts += src; return m }

function adopt(g) { g.mats = []; for (const [o, n] of g.items) { if (n._inB) BB._unbatch(n); n.dispose(false, false); BB.map.set(o, null); o.userData.__baked = g; g.mats.push(Float64Array.from(o.matrixWorld.elements)) } }

function bakeSome(budget) { const t0 = performance.now(); while (queue.length && performance.now() - t0 < budget) { const g = queue.shift(), t1 = performance.now(); g.items = g.items.filter(([o, n]) => n && !n.isDisposed() && BB.map.get(o) === n);
    if (g.items.length) { g.mesh = build(g); if (g.mesh) { adopt(g); groups.push(g); NV.stats.groups++; NV.stats.items += g.items.length } } NV.stats.bakeMs += performance.now() - t1 }
  if (!queue.length && NV.state === 'baking') { NV.state = 'baked'; console.log('[Apeverse] native static world: ' + NV.stats.items + ' objects -> ' + NV.stats.groups + ' meshes, ' + NV.stats.srcVerts + ' -> ' + NV.stats.verts + ' vertices, ' + Math.round(NV.stats.bakeMs) + ' ms') } }

/* a baked object that moves or hides leaves the bake (its group is rebuilt without it, and the mirror picks it up again) */
function unbake(g, i) { const [o] = g.items[i]; g.items.splice(i, 1); g.mats.splice(i, 1); delete o.userData.__baked; BB.map.delete(o); NV.stats.unbaked++;
  const old = g.mesh; NV.stats.items--; g.mesh = g.items.length ? build(g) : null; if (old) old.dispose(false, false); if (!g.mesh) groups.splice(groups.indexOf(g), 1) }
function watch() { if (!groups.length) return; let budget = 120;   /* ~120 objects per call, 4 calls a second: every baked object is re-checked every few seconds */
  while (budget-- > 0) { if (watchI >= groups.length) watchI = 0; const g = groups[watchI]; if (!g) return; g._wi = (g._wi || 0) % Math.max(1, g.items.length); const i = g._wi++; if (g._wi >= g.items.length) { g._wi = 0; watchI++ } const it = g.items[i]; if (!it) continue;
    const o = it[0], e = o.matrixWorld.elements, s = g.mats[i]; let moved = !o.parent || !vis(o); if (!moved) for (let k = 0; k < 16; k++) if (Math.abs(e[k] - s[k]) > 1e-6) { moved = true; break } if (moved) { unbake(g, i); return } } }

/* ---------- characters: one skinned mesh per character ----------
   chars_real builds each person from several skinned parts (body, clothes, hair...) sharing one skeleton: ~270 draws for ~70 people.
   Parts with the same skeleton, material and transform are merged (in their own local space, bone weights kept) into ONE skinned mesh.
   A part that hides or changes look splits the character again (the next pass re-merges what still fits). Works in every world. */
const CM = NV.chars = { on: /chars=1/.test(location.search),   /* opt-in: no measurable gain yet, and merged characters need more validation */ merged: 0, parts: 0 };
BB._uncm = n => { const m = n._cm; if (!m) return; for (const it of m._items) { it._cm = null; if (!it.isDisposed()) it.setEnabled(true) } CM.merged--; CM.parts -= m._items.length; m.dispose(false, false) };
function mergeChars() { const G = new Map();
  for (const [o, n] of BB.map) { if (!n || !o.isSkinnedMesh || !n._skin || n._cm || !n.isEnabled() || !n.material || !n.isVerticesDataPresent('matricesIndices')) continue;
    const k = n._skin.uniqueId + '|' + n.material.uniqueId + '|' + (n.useVertexColors ? 'c' : '') + (n.isVerticesDataPresent('uv') ? 'u' : '') + '|' + Array.prototype.map.call(n._m, v => v.toFixed(4)).join(','); let g = G.get(k); if (!g) G.set(k, g = []); g.push([o, n]) }
  for (const g of G.values()) { if (g.length < 2) continue; let vd = null; try { for (const [, n] of g) { const d = B.VertexData.ExtractFromMesh(n, false, true); if (!vd) vd = d; else vd.merge(d, true) } } catch (e) { continue }
    if (!vd) continue; const n0 = g[0][1], m = new B.Mesh('char@' + n0._skin.name, BB.scene); vd.applyToMesh(m, false); m.material = n0.material; m.useVertexColors = n0.useVertexColors; m.skeleton = n0._skin; m.numBoneInfluencers = n0.numBoneInfluencers || 4;
    m.isPickable = false; m.receiveShadows = true; m.freezeWorldMatrix(n0._bm, true); m._items = g.map(x => x[1]); m._src = g[0][0]; for (const [, n] of g) { n._cm = m; n.setEnabled(false) } CM.merged++; CM.parts += g.length } }
/* merged characters keep their culling box on the character (root bone), like the mirror does for single parts */
const _cv = new THREE.Vector3(), _ci = new THREE.Matrix4();
function charBounds() { for (const m of BB.scene.meshes) { if (!m._items || m.isDisposed()) continue; const o = m._src, b = o.skeleton && o.skeleton.bones[0]; if (!b) continue; b.getWorldPosition(_cv); _cv.applyMatrix4(_ci.copy(o.matrixWorld).invert());
  m.setBoundingInfo(new B.BoundingInfo(new B.Vector3(_cv.x - 1.6, _cv.y - 2.2, _cv.z - 1.6), new B.Vector3(_cv.x + 1.6, _cv.y + 2.2, _cv.z + 1.6))); m.freezeWorldMatrix(m._items[0]._bm, true) } }

BB._frameHook = tick => { if (!BB.on) return; B = window.BABYLON; if (CM.on) { if (tick % 30 === 11) mergeChars(); if (tick % 6 === 3) charBounds() } if (!NV.on) return;   /* (while Three.js renders, the bake simply waits) */ const W = AV.W; if (!W) return;
  if (W.id !== worldId) { clearAll(); worldId = W.id; settleT = performance.now(); NV._t0 = tick; NV.state = NV.worlds.includes(W.id) ? 'waiting' : 'off' }
  if (NV.state === 'off') return; const fade = document.getElementById('fade'); if (fade && +fade.style.opacity > .05) { settleT = performance.now(); NV._t0 = tick; return }
  if (NV.state === 'waiting' && performance.now() - settleT > 4000 && tick - NV._t0 > 240) { queue = collect(); const n = queue.reduce((a, g) => a + g.items.length, 0);   /* objects must have been still for 120 checked frames */
    if (n < 50 && tick - NV._t0 < 1200) { NV._t0 += 120; queue = [] } else NV.state = 'baking' }
  if (NV.state === 'baking') bakeSome(6); else if (NV.state === 'baked' && tick % 15 === 0) watch() };

NV.set = v => { NV.on = !!v; if (!v) { clearAll(); NV.state = 'off' } else { worldId = null } };   /* A/B: off = everything mirrored again */
/* the native world as a compact GLB (welded, indexed, merged per material): the asset the native loader will read */
NV.exportGLB = async function (name) { if (!B || !B.GLTF2Export) throw new Error('serializers not loaded'); const sc = BB.scene, keep = new Set(groups.map(g => g.mesh).filter(Boolean));
  const wr = sc.whenReadyAsync; sc.whenReadyAsync = () => Promise.resolve(); const pulled = sc.textures.filter(t => !t.isReady()); for (const t of pulled) sc.removeTexture(t);
  try { const r = await B.GLTF2Export.GLBAsync(sc, name || (worldId + '.static'), { shouldExportNode: x => keep.has(x) }); return r.glTFFiles[Object.keys(r.glTFFiles)[0]] } finally { sc.whenReadyAsync = wr; for (const t of pulled) sc.addTexture(t) } };
})(window.AV);
