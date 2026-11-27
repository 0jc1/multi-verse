/* APEVERSE 2.1 - walk_graph.js : a walking network for worlds that have no planned street graph (W.mapNav).
   Built from the world's REAL walkable surface after it loads: a lattice of nodes every `step` metres on free ground (collisions
   respected), linked to their 8 neighbours when the straight step between them stays on free ground and the height change is a walkable
   ramp; tiny islands are dropped. The work is spread over frames (~3 ms each), so arriving never stalls. When finished it becomes the
   world's mapNav: the GPS + pathfinder use it for long trips, city life routes on it.
   Enabled per world in WG.worlds (Astro-9 first; other worlds keep their current routing).  AV.walkGraph = { worlds, stats } */
'use strict';
(function (AV) {
const WG = AV.walkGraph = { worlds: { astro9: { step: 4, pad: 60 } }, stats: {} };
let job = null;
function start(W) {
  const cfg = WG.worlds[W.id]; if (!cfg || (W.mapNav && W.mapNav.nodes && W.mapNav.nodes.length)) return;
  let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (const p of W.places || []) { const x = Array.isArray(p) ? +p[3] : p.x, z = Array.isArray(p) ? +p[4] : p.z; if (!isFinite(x) || !isFinite(z)) continue; x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z) }
  if (!isFinite(x0)) return; const s = cfg.step, pad = cfg.pad; x0 -= pad; x1 += pad; z0 -= pad; z1 += pad; const nx = Math.ceil((x1 - x0) / s) + 1, nz = Math.ceil((z1 - z0) / s) + 1;
  job = { W, s, x0, z0, nx, nz, H: new Float32Array(nx * nz).fill(NaN), k: 0, phase: 0, t0: performance.now(), links: null };
  WG.stats[W.id] = { state: 'building' } }
function comps(J, N) { const c = new Int32Array(N).fill(-1), size = []; for (let k = 0; k < N; k++) { if (isNaN(J.H[k]) || c[k] >= 0 || !J.links[k]) continue; const id = size.length; let n = 0; const st = [k]; c[k] = id; while (st.length) { const u = st.pop(); n++; for (const v of J.links[u] || []) if (c[v] < 0) { c[v] = id; st.push(v) } } size.push(n) } return { c, size, big: size.indexOf(Math.max(-1, ...size)) } }
const ok = (W, x, z) => { const h = W.surface(x, z); if (h === null || h === undefined) return null; return AV.isFree(W, x, z, .4) ? h : null };
function step() {
  const J = job; if (!J || J.W !== AV.W) { job = null; return } const W = J.W, t0 = performance.now(), N = J.nx * J.nz;
  while (performance.now() - t0 < 3) {
    if (J.phase === 0) { if (J.k >= N) { J.phase = 1; J.k = 0; J.links = Array.from({ length: N }, () => null); continue } const i = (J.k / J.nz) | 0, j = J.k % J.nz, h = ok(W, J.x0 + i * J.s, J.z0 + j * J.s); if (h !== null) J.H[J.k] = h; J.k++ }
    else if (J.phase === 1) { if (J.k >= N) { J.phase = 2; J.k = 0; J.comp = comps(J, N); continue } const k = J.k++; if (isNaN(J.H[k])) continue; const i = (k / J.nz) | 0, j = k % J.nz, x = J.x0 + i * J.s, z = J.z0 + j * J.s;
      for (const [di, dj] of [[1, 0], [0, 1], [1, 1], [1, -1]]) { const a = i + di, b = j + dj; if (a >= J.nx || b < 0 || b >= J.nz) continue; const v = a * J.nz + b; if (isNaN(J.H[v]) || Math.abs(J.H[v] - J.H[k]) > 1.4 * Math.hypot(di, dj)) continue;
        let good = true; for (const f of [.25, .5, .75]) { const h = ok(W, x + di * J.s * f, z + dj * J.s * f); if (h === null || Math.abs(h - (J.H[k] + (J.H[v] - J.H[k]) * f)) > 1.2) { good = false; break } } if (!good) continue;
        (J.links[k] || (J.links[k] = [])).push(v); (J.links[v] || (J.links[v] = [])).push(k) } }
    else if (J.phase === 2) { /* bridge: a node off the main network links to a main-network node up to 2 cells away when a fine 0.5 m walk
         between them stays on free ground with a walkable slope (narrow doors, stairs, gaps the coarse lattice steps over) */
      if (J.k >= N) { J.phase = 3; continue } const k = J.k++; if (isNaN(J.H[k]) || J.comp.c[k] === J.comp.big || J.comp.c[k] < 0) continue; const i = (k / J.nz) | 0, j = k % J.nz, x = J.x0 + i * J.s, z = J.z0 + j * J.s;
      for (let di = -2; di <= 2; di++) for (let dj = -2; dj <= 2; dj++) { const a = i + di, b = j + dj; if ((!di && !dj) || a < 0 || b < 0 || a >= J.nx || b >= J.nz) continue; const v = a * J.nz + b; if (J.comp.c[v] !== J.comp.big) continue;
        const L = Math.hypot(di, dj) * J.s, n = Math.ceil(L / .5); let good = true, hp = J.H[k]; for (let q = 1; q < n; q++) { const h = ok(W, x + di * J.s * q / n, z + dj * J.s * q / n); if (h === null || Math.abs(h - hp) > .6) { good = false; break } hp = h } if (!good || Math.abs(J.H[v] - hp) > .6) continue;
        (J.links[k] || (J.links[k] = [])).push(v); (J.links[v] || (J.links[v] = [])).push(k); J.bridged = (J.bridged || 0) + 1; break } }
    else { /* keep components that matter (>= 12 nodes), compact the indices, publish */
      const C = comps(J, N), comp = C.c, size = C.size;
      const idx = new Int32Array(N).fill(-1), nodes = []; for (let k = 0; k < N; k++) if (comp[k] >= 0 && size[comp[k]] >= 12) { idx[k] = nodes.length; nodes.push([J.x0 + ((k / J.nz) | 0) * J.s, J.z0 + (k % J.nz) * J.s]) }
      const links = nodes.map(() => []); for (let k = 0; k < N; k++) if (idx[k] >= 0) for (const v of J.links[k] || []) if (idx[v] >= 0) links[idx[k]].push(idx[v]);
      const kept = size.filter(n => n >= 12), big = Math.max(0, ...kept); W.mapNav = { nodes, links };
      WG.stats[W.id] = { state: 'ready', nodes: nodes.length, edges: links.reduce((a, l) => a + l.length, 0) / 2, components: kept.length, bridged: J.bridged || 0, largestShare: +(big / Math.max(1, nodes.length)).toFixed(3), ms: Math.round(performance.now() - J.t0) };
      job = null; return } } }
AV.frameFns.push(() => { if (job && AV.running) step() });
{ const pe = AV.onWorldEnter; AV.onWorldEnter = function (W) { if (pe) pe(W); job = null; setTimeout(() => { if (AV.W === W) try { start(W) } catch (e) { WG.stats.err = String(e) } }, 2500) } }
})(window.AV);
