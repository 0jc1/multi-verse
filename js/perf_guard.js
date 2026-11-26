/* APEVERSE - perf_guard.js : keeps High / Medium graphics smooth without changing how the world looks up close.
   1) CHARACTER LOD (every quality): detailed characters (soft-body talkers, the Stone Ape Band, residents, wanderers: any group
      under the world root with a skinned or physical-material mesh, 0.8 - 5 m tall) get distance tiers, with 4 m hysteresis:
        near  < 40 m : full detail (shadows only < 12 m, High)
        mid  40-80 m : opaque body only (transparent fur shells / hair cards / glass hidden), no shadow
        far  80-150 m: a ~150-triangle proxy figure in the character's own colours (detail hidden)
        gone > 150 m : hidden (fog covers this range)   [distances for High; Medium x0.6, Low x0.5 (Cinematic V1 laptop tuning)]
      Distances shrink on Medium (x0.8) and Low (x0.65). Animation keeps running; only drawing changes.
   2) SHADOW BUDGET (High; shadows are off on Low / Medium): small instanced plants and props (flowers, ferns, grass, bushes, pots,
      stools...) stop casting shadows; trees, buildings, big props and nearby characters keep theirs.
   3) RESOLUTION GUARD (High / Medium): smoothed FPS; under ~28 FPS for 4 s -> render resolution x0.85 (then x0.7); over ~52 FPS for
      8 s -> back up. 20 s cooldown after any change, and if a step up is followed by a step down within 40 s that step stays locked
      for 3 minutes, so it never ping-pongs. High never goes below 1.0 device pixel.
   AV.perf = { stats(), step, tiers } for tests and the F3 overlay. */
'use strict';
(function (AV) {
const PF = AV.perf = { step: 0, small: 0, tiers: { near: 0, mid: 0, far: 0, gone: 0 }, changes: [] };
const STEPS = [1, .85, .7];
const q = () => (AV.S && AV.S.set && AV.S.set.gq) || 'High';
const tris = g => g ? (g.index ? g.index.count : g.attributes.position ? g.attributes.position.count : 0) / 3 : 0;
const matOf = o => Array.isArray(o.material) ? o.material[0] : o.material;
/* ---------- character LOD ---------- */
let groups = [], scanT = 0, lodT = 0;
const isCharMesh = o => o.isMesh && !o.isInstancedMesh && !o.userData.pfProxy;   /* any mesh inside a detected character group */
function proxyFor(gr, meshes) {
  /* size from the group's local bounding box; colours from its two biggest meshes */
  const box = new THREE.Box3(), inv = new THREE.Matrix4().copy(gr.matrixWorld).invert(), tmp = new THREE.Box3();
  for (const m of meshes) { if (!m.geometry.boundingBox) m.geometry.computeBoundingBox(); tmp.copy(m.geometry.boundingBox).applyMatrix4(m.matrixWorld).applyMatrix4(inv); box.union(tmp) }
  const s = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3()); if (!(s.y > .3)) return null;
  const big = meshes.slice().sort((a, b) => tris(b.geometry) - tris(a.geometry)), col = i => { const m = big[i] && matOf(big[i]); return m && m.color ? m.color.getHex() : 0x8a6a4a };
  const K = AV.kit, H = s.y, W2 = Math.max(.25, Math.min(s.x, s.z) * .5), parts = [[K.BG.cyl, col(0), K.M(c.x, box.min.y + H * .38, c.z, W2 * .55, H * .62, W2 * .4)], [K.BG.sph, col(1), K.M(c.x, box.min.y + H * .82, c.z, W2 * .32, H * .14, W2 * .32)], [K.BG.cyl, col(0), K.M(c.x - W2 * .2, box.min.y + H * .2, c.z, W2 * .14, H * .4, W2 * .14)], [K.BG.cyl, col(0), K.M(c.x + W2 * .2, box.min.y + H * .2, c.z, W2 * .14, H * .4, W2 * .14)]];
  const mat = PF._pmat || (PF._pmat = (() => { const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .8 }); m.userData.lin = 1; m.userData.shared = true; return m })());
  const p = new THREE.Mesh(K.merge(parts), mat); p.visible = false; p.castShadow = false; p.userData.pfProxy = 1; p.matrixAutoUpdate = false; (gr.parent || AV.W.group).add(p); return p }   /* a sibling: it can stay visible while the detailed group is hidden */
function scan(W) { const seen = new Set(groups.map(g => g.gr)); let small = 0;
  /* character roots: start at each skinned rig (or an object the engine marks as a person) and climb while the ancestor is still
     person-sized (<= 5 m tall, <= 4 m wide), so a district group that merely CONTAINS an NPC is never treated as the NPC */
  const roots = new Set(), box = new THREE.Box3(), sz = new THREE.Vector3(), small1 = o => { box.setFromObject(o); box.getSize(sz); return sz.y <= 5 && Math.max(sz.x, sz.z) <= 4 };
  W.group.traverse(o => { if (o.userData.pfSeen || o.userData.pfProxy) return; const u = o.userData; if (!(o.isSkinnedMesh || u.kind === 'stoner' || u.head || u.human)) return; o.userData.pfSeen = 1;
    let r = o.isSkinnedMesh ? o.parent : o; if (!r || r === W.group) return; while (r.parent && r.parent !== W.group && small1(r.parent)) r = r.parent; roots.add(r) });
  for (const gr of roots) { if (seen.has(gr) || gr.userData.pfSkip) continue; let inner = false; for (let a = gr.parent; a && a !== W.group; a = a.parent) if (roots.has(a) || seen.has(a)) inner = true; if (inner) continue;
    const meshes = []; gr.traverse(o => { if (isCharMesh(o)) meshes.push(o) }); if (!meshes.length) continue;
    let t = 0; meshes.forEach(m => t += tris(m.geometry)); if (t < 1500) { gr.userData.pfSkip = 1; continue }
    gr.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(gr), h = b.max.y - b.min.y; if (h < .8 || h > 5 || Math.max(b.max.x - b.min.x, b.max.z - b.min.z) > 4.5) { gr.userData.pfSkip = 1; continue }
    const all = []; gr.traverse(o => { if (o.isMesh && !o.userData.pfProxy) all.push({ o, shadow: o.castShadow, sec: !!(matOf(o) && matOf(o).transparent) }) });
    groups.push({ gr, all, tris: t, tier: 'near', proxy: null, meshes }) }
  W.group.traverse(o => { if (o.isInstancedMesh && o.castShadow && !o.userData.pfShadow) { const g = o.geometry; if (!g.boundingSphere) g.computeBoundingSphere(); if (g.boundingSphere.radius < 1.6) { o.castShadow = false; o.userData.pfShadow = 1; small++ } } });
  PF.small += small; groups = groups.filter(g => g.gr.parent) }
const v = new THREE.Vector3();
/* M13: BAKED MID-DISTANCE CHARACTER. A detailed character is ~4 skinned parts (body, shirt, pants, shoes: one PBR material each)
   + eyes / lids / hair: ~9 draw calls, and the frame in busy worlds is limited by CPU time in the render call (draw calls), not
   triangles.  In the mid tier the opaque skinned parts that share one skeleton are merged ONCE into a single skinned mesh with
   the material's 4-slot colour blend, ambient occlusion and the shirt print (decal) baked into vertex colours (same formulas as
   pbr.js); eyes + lids (tiny at that range) are hidden.  Near characters are untouched; leaving mid restores everything.
   Rebuilt if the parts or their materials change (async parts, outfit changes).  AV.perf.bakeMid = false turns it off. */
PF.bakeMid = true; PF.baked = 0;
const decalPx = new Map();
function texPixels(t) { const im = t && t.image; if (!im || !im.width) return null; let d = decalPx.get(im); if (d) return d; try { const c = document.createElement('canvas'), w = Math.min(256, im.width), h = Math.max(1, Math.round(im.height * w / im.width)); c.width = w; c.height = h; const x = c.getContext('2d'); x.drawImage(im, 0, 0, w, h); d = { w, h, px: x.getImageData(0, 0, w, h).data } } catch (e) { d = { fail: true } } decalPx.set(im, d); return d }
const linC = v => Math.pow(v / 255, 2.2);
function bakeMid(g) { const parts = g.all.map(e => e.o).filter(o => o.isSkinnedMesh && o.geometry && o.geometry.attributes.position && matOf(o) && !matOf(o).transparent && !(matOf(o).defines && 'SHELL' in matOf(o).defines) && !o.userData.pfProxy);
  if (parts.length < 2) return null; const skel = parts[0].skeleton; if (parts.some(o => o.skeleton !== skel || !o.bindMatrix.equals(parts[0].bindMatrix) || o.parent !== parts[0].parent)) return null;
  let nV = 0, nI = 0; for (const o of parts) { const gg = o.geometry; nV += gg.attributes.position.count; nI += gg.index ? gg.index.count : gg.attributes.position.count }
  const pos = new Float32Array(nV * 3), nor = new Float32Array(nV * 3), col = new Float32Array(nV * 3), si = new Float32Array(nV * 4), sw = new Float32Array(nV * 4), idx = new (nV > 65535 ? Uint32Array : Uint16Array)(nI); let vo = 0, io = 0;
  for (const o of parts) { const gg = o.geometry, A = gg.attributes, n = A.position.count, M = matOf(o), U = M.userData && M.userData.u, aM = A.aMat, aAO = A.aAO;
    const C = U ? [U.uC0.value, U.uC1.value, U.uC2.value, U.uC3.value] : null, base = M.color || new THREE.Color(.5, .5, .5);
    const dec = U && M.defines && 'DECAL' in M.defines && U.tDec.value ? { p: texPixels(U.tDec.value), r: U.uDec.value, side: U.uDecSide.value } : null;
    for (let i = 0; i < n; i++) { const j = vo + i; pos[j * 3] = A.position.getX(i); pos[j * 3 + 1] = A.position.getY(i); pos[j * 3 + 2] = A.position.getZ(i);
      if (A.normal) { nor[j * 3] = A.normal.getX(i); nor[j * 3 + 1] = A.normal.getY(i); nor[j * 3 + 2] = A.normal.getZ(i) }
      if (A.skinIndex) { si[j * 4] = A.skinIndex.getX(i); si[j * 4 + 1] = A.skinIndex.getY(i); si[j * 4 + 2] = A.skinIndex.getZ(i); si[j * 4 + 3] = A.skinIndex.getW(i); sw[j * 4] = A.skinWeight.getX(i); sw[j * 4 + 1] = A.skinWeight.getY(i); sw[j * 4 + 2] = A.skinWeight.getZ(i); sw[j * 4 + 3] = A.skinWeight.getW(i) }   /* r128: no getComponent */
      let r, gc, b; if (C && aM) { const w = [aM.getX(i), aM.getY(i), aM.getZ(i), aM.getW(i)]; r = C[0].r * w[0] + C[1].r * w[1] + C[2].r * w[2] + C[3].r * w[3]; gc = C[0].g * w[0] + C[1].g * w[1] + C[2].g * w[2] + C[3].g * w[3]; b = C[0].b * w[0] + C[1].b * w[1] + C[2].b * w[2] + C[3].b * w[3];
        if (dec && dec.p && !dec.p.fail) { const px = A.position.getX(i), py = A.position.getY(i), nz = A.normal ? A.normal.getZ(i) : 1; let u = (px - dec.r.x) / dec.r.z + .5; const v = (py - dec.r.y) / dec.r.w + .5;
          if (u > 0 && u < 1 && v > 0 && v < 1) { const s0 = x => Math.min(1, Math.max(0, (x - .15) / .3)), fac = dec.side === 0 ? s0(Math.abs(nz)) : s0(nz * dec.side); if (dec.side < 0) u = 1 - u;
            const X = Math.min(dec.p.w - 1, Math.floor(u * dec.p.w)), Y = Math.min(dec.p.h - 1, Math.floor((1 - v) * dec.p.h)), q = (Y * dec.p.w + X) * 4, a = dec.p.px[q + 3] / 255 * fac * w[0];
            r = r + (linC(dec.p.px[q]) - r) * a; gc = gc + (linC(dec.p.px[q + 1]) - gc) * a; b = b + (linC(dec.p.px[q + 2]) - b) * a } } }
      else { r = base.r; gc = base.g; b = base.b } const ao = aAO ? 1 + (aAO.getX(i) - 1) * .6 : 1; col[j * 3] = r * ao; col[j * 3 + 1] = gc * ao; col[j * 3 + 2] = b * ao }
    if (gg.index) for (let i = 0; i < gg.index.count; i++) idx[io++] = gg.index.getX(i) + vo; else for (let i = 0; i < n; i++) idx[io++] = vo + i; vo += n }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.setAttribute('skinIndex', new THREE.BufferAttribute(si, 4)); geo.setAttribute('skinWeight', new THREE.BufferAttribute(sw, 4)); geo.setIndex(new THREE.BufferAttribute(idx, 1));
  if (!parts[0].geometry.boundingSphere) parts[0].geometry.computeBoundingSphere(); geo.boundingSphere = parts[0].geometry.boundingSphere.clone(); geo.boundingSphere.radius *= 1.3;
  const mat = PF._bmat || (PF._bmat = (() => { const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .72, metalness: 0, envMap: AV.pbr && AV.pbr.env ? AV.pbr.env() : null, envMapIntensity: .8 }); m.skinning = true; m.userData.lin = 1; m.userData.shared = true; return m })());
  const mesh = new THREE.SkinnedMesh(geo, mat); mesh.bind(skel, parts[0].bindMatrix); mesh.frustumCulled = parts[0].frustumCulled; mesh.castShadow = false; mesh.receiveShadow = true; mesh.visible = false; mesh.userData.pfProxy = 1; mesh.userData.pfBake = 1; parts[0].parent.add(mesh);
  const sv = new THREE.Vector3(), small = g.all.map(e => e.o).filter(o => { if (o.isSkinnedMesh || !o.isMesh || !o.geometry || o.userData.pfProxy) return false; if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); o.getWorldScale(sv); return o.geometry.boundingSphere.radius * Math.max(sv.x, sv.y, sv.z) < .07 });
  PF.baked++; return { mesh, parts, small } }
PF.setBake = on => { PF.bakeMid = !!on; for (const g of groups) if (g.tier === 'mid') { if (on) midOn(g); else midOff(g) } };   /* A/B within one session */
PF.bakedNow = () => groups.filter(g => g.bakeOn).length;
const bakeSig = g => g.all.filter(e => e.o.isSkinnedMesh).map(e => e.o.geometry.uuid + matOf(e.o).uuid).join('|');
function midOn(g) { if (!PF.bakeMid || g.bakeOn) return;   /* already on: never re-save the hidden masks */ if (g.bk && g.bk.sig !== bakeSig(g)) { g.bk.mesh.parent && g.bk.mesh.parent.remove(g.bk.mesh); g.bk.mesh.geometry.dispose(); g.bk = null }
  if (!g.bk) { try { g.bk = bakeMid(g) } catch (e) { g.bk = null; PF.bakeErr = String(e && e.message || e) } if (g.bk) g.bk.sig = bakeSig(g) }   /* a bad character stays unbaked; never breaks the frame */ const b = g.bk; if (!b) return; b.saved = []; for (const o of b.parts.concat(b.small)) { b.saved.push([o, o.layers.mask]); o.layers.mask = 0 } b.mesh.visible = true; g.bakeOn = true }   /* layers, not .visible: the game re-shows eyes / lids (blinks) every frame */
function midOff(g) { const b = g.bk; if (!b || !g.bakeOn) return; for (const [o, m] of b.saved || []) o.layers.mask = m; b.saved = null; b.mesh.visible = false; g.bakeOn = false }

function setTier(g, tier) { const was = g.tier; if (was === tier) return; g.tier = tier;
  if (tier === 'far' && !g.proxy) g.proxy = proxyFor(g.gr, g.meshes);
  if (was === 'near' || was === 'mid') { if (tier === 'far' || tier === 'gone') { g.vis = g.gr.visible; g.gr.visible = false } }
  else if (tier === 'near' || tier === 'mid') g.gr.visible = g.vis !== false;   /* restore what the game had, not "true" */
  for (const e of g.all) { if (e.sec) { if (tier === 'mid' && was === 'near') { e.v = e.o.visible; e.o.visible = false } else if (tier === 'near' && e.v != null) { e.o.visible = e.v; e.v = null } } if (tier !== 'near' && e.o.castShadow) e.o.castShadow = false }
  if (tier === 'mid') midOn(g); else midOff(g);   /* M13: baked mid character */
  if (g.proxy) g.proxy.visible = tier === 'far' }
function lod() { const P = AV.P, k = q() === 'High' ? 1 : q() === 'Medium' ? .6 : .5, sh = q() === 'High' && AV.R && AV.R.shadowMap.enabled, T = { near: 0, mid: 0, far: 0, gone: 0 };
  /* Cinematic V1: also cap how many characters get full / body detail at once (crowded streets), nearest first */
  const capN = { High: 16, Medium: 10, Low: 6 }[q()] || 10, capM = { High: 30, Medium: 18, Low: 10 }[q()] || 18; let nN = 0, nM = 0;
  for (const g of groups) { g.gr.getWorldPosition(v); g._d = Math.hypot(v.x - P.x, v.z - P.z) } groups.sort((a, b) => a._d - b._d);
  for (const g of groups) { const d = g._d, cur = g.tier, h = 4;
    const lim = n => n * k + (cur === 'near' && n === 40 || cur === 'mid' && n === 80 || cur === 'far' && n === 150 ? h : -h * 0);   /* stay in the current tier until 4 m past its edge */
    let tier = d < lim(40) ? 'near' : d < lim(80) ? 'mid' : d < lim(150) ? 'far' : 'gone'; if (tier === 'near' && ++nN > capN) tier = 'mid'; if (tier === 'mid' && ++nM > capM) tier = 'far'; setTier(g, tier); T[tier]++; if (tier === 'far' && g.proxy) { g.gr.updateMatrixWorld(); g.proxy.matrix.copy(g.gr.matrixWorld); if (g.proxy.parent && g.proxy.parent.matrixWorld) g.proxy.matrix.premultiply(new THREE.Matrix4().copy(g.proxy.parent.matrixWorld).invert()) }
    if (tier === 'near') { const want = sh && d < (g.shadowOn ? 15 : 12); if (want !== !!g.shadowOn) { g.shadowOn = want; for (const e of g.all) e.o.castShadow = want && e.shadow } } else g.shadowOn = false }
  PF.tiers = T }
/* ---------- resolution guard ---------- */
let ema = 0, lowT = 0, highT = 0, cool = 0, lastPR = 0, lockUntil = 0, lastUpAt = -1e9, tPrev = 0, clock = 0;
const basePR = () => { const g = q(), d = devicePixelRatio || 1; return g === 'High' ? Math.min(d, 1.5) : g === 'Medium' ? Math.min(d, 1.15) : 1 };
function applyStep() { const R = AV.R; if (!R) return; const want = Math.max(q() === 'High' ? Math.min(1, basePR()) : .75, basePR() * STEPS[PF.step]); if (Math.abs(R.getPixelRatio() - want) > 1e-3) { R.setPixelRatio(want); AV.resize && AV.resize() } lastPR = want }
function change(dir) { PF.step += dir; cool = 20; lowT = highT = 0; PF.changes.push([+clock.toFixed(1), PF.step]); if (PF.changes.length > 20) PF.changes.shift();
  if (dir > 0 && clock - lastUpAt < 40) lockUntil = clock + 180; if (dir < 0) lastUpAt = clock; applyStep() }
AV.frameFns.push(() => {
  const W = AV.W; if (!W || !AV.running || !AV.R) return; const now = performance.now(), dt = tPrev ? (now - tPrev) / 1000 : 0; tPrev = now; if (dt <= 0) return; clock += Math.min(dt, 1);   /* slow frames still run LOD; they only skip the FPS average */
  if ((scanT -= dt) <= 0) { scanT = 3; if (W !== PF._w) { PF._w = W; PF.small = 0; groups = [] } scan(W) }
  if ((lodT -= dt) <= 0) { lodT = .25; lod() }
  if ((lightT -= dt) <= 0) { lightT = .5; lightBudget(W) }
  if (q() === 'Low' || document.hidden || dt > 1) return;
  ema = ema ? ema * .9 + (1 / dt) * .1 : 1 / dt; PF.fps = ema; if (cool > 0) { cool -= dt; return }
  if (Math.abs(AV.R.getPixelRatio() - lastPR) > 1e-3 && PF.step) applyStep();   /* a quality switch / world change reset it: re-apply */
  if (ema < 28) { lowT += dt; highT = 0 } else if (ema > 52) { highT += dt; lowT = 0 } else { lowT = Math.max(0, lowT - dt); highT = Math.max(0, highT - dt) }
  if (lowT > 4 && PF.step < STEPS.length - 1) change(1);
  else if (highT > 8 && PF.step > 0 && clock > lockUntil) change(-1) });
PF.stats = () => { const W = AV.W; let shadowTris = 0, charTris = 0; if (W) W.group.traverseVisible(o => { if (o.isMesh && o.castShadow) shadowTris += tris(o.geometry) * (o.isInstancedMesh ? o.count : 1) }); for (const g of groups) { if (g.gr.visible) g.gr.traverseVisible(o => { if (o.isMesh) charTris += tris(o.geometry) }); if (g.proxy && g.proxy.visible) charTris += tris(g.proxy.geometry) }
  return { step: PF.step, pr: AV.R && +AV.R.getPixelRatio().toFixed(2), small: PF.small, chars: groups.length, tiers: PF.tiers, charTris: Math.round(charTris), shadowTris: Math.round(shadowTris), lights: PF.lights, fps: PF.fps && +PF.fps.toFixed(1), changes: PF.changes.length } };
/* ---------- LIGHT BUDGET: only the K nearest point / spot lights are on (K = 2 / 4 / 6 by quality). Every lit pixel loops over every
   active light, so 18 lights cost a lot of fill rate on a laptop GPU. K stays constant while you move (one on, one off), so shaders
   are never recompiled; lights the game itself switched off are left alone. */
let lightT = 0, lightsW = null, lights = [];
function lightBudget(W) { if (lightsW !== W) { lightsW = W; lights = []; W.group.traverse(o => { if ((o.isPointLight || o.isSpotLight) && !o.userData.pfKeep) lights.push(o) }) }
  const K = { Low: 2, Medium: 4, High: 6 }[q()] || 4; if (lights.length <= K) { PF.lights = { total: lights.length, on: lights.length }; return }
  const P = AV.P, v2 = new THREE.Vector3(), ranked = lights.filter(l => l.visible || l.userData.pfOff).map(l => (l.getWorldPosition(v2), { l, d: Math.hypot(v2.x - P.x, v2.y - (P.y || 0), v2.z - P.z) })).sort((a, b) => a.d - b.d);
  ranked.forEach((r, i) => { const on = i < K; if (on && r.l.userData.pfOff) { r.l.visible = true; r.l.userData.pfOff = false } else if (!on && r.l.visible) { r.l.visible = false; r.l.userData.pfOff = true } });
  PF.lights = { total: lights.length, on: Math.min(K, ranked.length) } }
const prevE = AV.onWorldEnter; AV.onWorldEnter = function (W) { if (prevE) prevE(W); scanT = 0; lodT = 0; groups = [] };
})(window.AV);
