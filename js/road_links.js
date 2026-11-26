/* APEVERSE 2.1 - road_links.js : real connector streets where a world's car streets were drawn as separate pieces.
   Madrid: the Pinar barrio street (z 0, x -92..92) stopped 48 m short of the grid avenues at x = ±140 on both sides, across paved
   plazas, so taxis from the barrio had to wait on the main street and nothing could drive in.  Now two short "calles" are built
   across the plaza edges: asphalt 8 m wide with kerbs, a dashed centre line and zebra crossings where the plaza's foot traffic
   crosses, and they join W.mapRoads BEFORE traffic.js reads it (AI cars and junction traffic lights use them too).
   Gran Vía east (x 118) gets a 22 m link to the avenue at x = 140, built only if a lane-width clearance check passes.
   Pedestrian streets (Calle Montera, Malasaña: stone paving) are deliberately NOT connected: cars never route through them.
   Every connector is checked against the world's collision at build time; one that is not clear is skipped (and reported). */
'use strict';
(function (AV) {
const RL = AV.roadLinks = { stats: {} };
const LINKS = {
  madrid: [
    { id: 'pinar_w', a: [-140, 0], b: [-92, 0], w: 8, clear: 4.2, zebra: [-132, -100], name: 'Calle del Pinar (oeste)' },
    { id: 'pinar_e', a: [92, 0], b: [140, 0], w: 8, clear: 4.2, zebra: [100, 132], name: 'Calle del Pinar (este)' },
    { id: 'granvia_e', a: [118, 876], b: [140, 876], w: 7, clear: 1.8, name: 'Gran Vía · enlace' }
  ]
};
function clearLine(W, a, b, r) { const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.ceil(L); for (let i = 1; i < n; i++) { const x = a[0] + (b[0] - a[0]) * i / n, z = a[1] + (b[1] - a[1]) * i / n; if (W.surface(x, z) === null || !AV.isFree(W, x, z, r)) return false } return true }
function build(W, list) {
  const K = AV.kit, BG = K.BG, parts = [], built = [], skipped = [];
  for (const L of list) { if (!clearLine(W, L.a, L.b, L.clear)) { skipped.push(L.id); continue }
    const [x0, z0] = L.a, [x1, z1] = L.b, len = Math.hypot(x1 - x0, z1 - z0), ang = Math.atan2(x1 - x0, z1 - z0), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, y = (W.surface(cx, cz) || 0);
    const M = (lx, ly, lz, sx, sy, sz) => { const c = Math.cos(ang), s = Math.sin(ang); return K.M(cx + lx * c + lz * s, y + ly, cz - lx * s + lz * c, sx, sy, sz, 0, ang, 0) };
    parts.push([BG.box, 0x3a3a3e, M(0, .03, 0, L.w, .05, len + .4)]);                                              /* asphalt */
    for (const sd of [-1, 1]) parts.push([BG.box, 0xb8b4a8, M(sd * (L.w / 2 + .12), .07, 0, .24, .14, len)]);      /* kerbs */
    for (let t = -len / 2 + 1.5; t < len / 2 - 1.5; t += 4) parts.push([BG.box, 0xf4f4f0, M(0, .06, t, .14, .01, 2)]);   /* dashed centre line */
    for (const zx of L.zebra || []) { const t = (zx - (x0 + x1) / 2) * Math.sign(x1 - x0 || 1); for (let k = -L.w / 2 + .5; k < L.w / 2; k += 1) parts.push([BG.box, 0xf4f4f0, M(k, .061, t, .5, .01, 3)]) }   /* zebra crossings */
    W.mapRoads = W.mapRoads || []; W.mapRoads.push([x0, z0, x1, z1, Math.max(10, L.w + 2)]);   /* map width matches the barrio street so traffic.js accepts it */
    built.push(L.id) }
  if (parts.length) { const m = new THREE.Mesh(K.merge(parts), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .9, polygonOffset: true, polygonOffsetFactor: -2 })); m.material.userData.lin = 1; m.receiveShadow = true; m.name = 'road_links'; W.group.add(m) }
  W._rideNet = undefined; RL.stats[W.id] = { built, skipped }; return built }
RL.LINKS = LINKS;
const prevE = AV.onWorldEnter; AV.onWorldEnter = function (W) { if (prevE) prevE(W); if (!W || W.__roadLinks || !LINKS[W.id]) return; W.__roadLinks = true; try { build(W, LINKS[W.id]) } catch (e) { console.warn('road links', e); RL.stats[W.id] = { err: String(e) } } };
})(window.AV);
