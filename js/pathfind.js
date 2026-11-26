/* APEVERSE 2.0 - pathfind.js : M13 street graphs + GPS for every world.  One router for the GPS (minimap) in all worlds:
   - clear line of sight -> straight;
   - otherwise A* over a walkability grid checked lazily against the world's real collision (buildings, walls, props, water /
     edges), carriageways cost more so routes keep to pavements and cross streets short; cell size 1.5 m for short trips,
     coarser for long ones (with a fine retry if a coarse grid cannot fit through a gap);
   - long trips in worlds with a street graph (W.mapNav: Madrid) use the graph in the middle + grid paths at both ends
     (the graph alone missed the Pinar barrio and cut through blocks there);
   - smoothed by line of sight.
   Collision is indexed per world in 16 m buckets (rebuilt only when the collision lists change), so a cell test touches only
   nearby boxes instead of every box in the world.   AV.path.route(W, {x,z}, {x,z}) -> [[x,z]...]   AV.path.stats */
'use strict';
(function (AV) {
const PF = AV.path = { stats: { routes: 0, ms: 0, maxMs: 0, fails: 0 } };
const B = 16, M = .4;
/* 2.1: the index used to be rebuilt (and its cost cache thrown away) whenever anything was added to W.cols / W.circles: a parked
   vehicle, a stall, a dealer lot... so GPS went cold again and again.  Collision lists only grow during play, so appended items are
   now added to the bins and only the cached cells of the 16 m bins they touch are dropped.  A shrink (or new roads) rebuilds. */
function index(W) { const I = W.__pf; if (I && I.nc === W.cols.length && I.nr === W.circles.length && I.nrd === (W.mapRoads || []).length) return I;
  if (I && I.nrd === (W.mapRoads || []).length && W.cols.length >= I.nc && W.circles.length >= I.nr && W.cols[I.nc - 1] === I.lastC && W.circles[I.nr - 1] === I.lastR) {
    const touch = (x0, x1, z0, z1) => { for (let bx = Math.floor(x0 / B) - 1; bx <= Math.floor(x1 / B) + 1; bx++) for (let bz = Math.floor(z0 / B) - 1; bz <= Math.floor(z1 / B) + 1; bz++) I.cache.delete(bx * 65536 + bz) };   /* one bin of margin: cell rounding at bin edges */
    const addB = (m, x0, x1, z0, z1, v) => { for (let bx = Math.floor(x0 / B); bx <= Math.floor(x1 / B); bx++) for (let bz = Math.floor(z0 / B); bz <= Math.floor(z1 / B); bz++) { const k = bx + ',' + bz; let a = m.get(k); if (!a) m.set(k, a = []); a.push(v) } touch(x0, x1, z0, z1) };
    for (let i = I.nc; i < W.cols.length; i++) { const c = W.cols[i]; addB(I.cols, c[0] - M, c[1] + M, c[2] - M, c[3] + M, c) }
    for (let i = I.nr; i < W.circles.length; i++) { const c = W.circles[i]; addB(I.circ, c[0] - c[2] - M, c[0] + c[2] + M, c[1] - c[2] - M, c[1] + c[2] + M, c) }
    I.nc = W.cols.length; I.nr = W.circles.length; I.lastC = W.cols[I.nc - 1]; I.lastR = W.circles[I.nr - 1]; PF.stats.incr = (PF.stats.incr || 0) + 1; return I }
  const cols = new Map(), circ = new Map(), roads = new Map(), add = (m, x0, x1, z0, z1, v) => { for (let bx = Math.floor(x0 / B); bx <= Math.floor(x1 / B); bx++) for (let bz = Math.floor(z0 / B); bz <= Math.floor(z1 / B); bz++) { const k = bx + ',' + bz; let a = m.get(k); if (!a) m.set(k, a = []); a.push(v) } };
  for (const c of W.cols) add(cols, c[0] - M, c[1] + M, c[2] - M, c[3] + M, c);
  for (const c of W.circles) add(circ, c[0] - c[2] - M, c[0] + c[2] + M, c[1] - c[2] - M, c[1] + c[2] + M, c);
  for (const r of W.mapRoads || []) { const h = (r[4] || 6) / 2; add(roads, Math.min(r[0], r[2]) - h, Math.max(r[0], r[2]) + h, Math.min(r[1], r[3]) - h, Math.max(r[1], r[3]) + h, r) }
  PF.stats.rebuilds = (PF.stats.rebuilds || 0) + 1; return W.__pf = { nc: W.cols.length, nr: W.circles.length, nrd: (W.mapRoads || []).length, lastC: W.cols[W.cols.length - 1], lastR: W.circles[W.circles.length - 1], cols, circ, roads, cache: new Map(), size: 0 } }
const segD = (px, pz, r) => { const dx = r[2] - r[0], dz = r[3] - r[1], l2 = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((px - r[0]) * dx + (pz - r[1]) * dz) / l2)); return Math.hypot(px - r[0] - dx * t, pz - r[1] - dz * t) };
/* 0 blocked, 1 walk, 2 carriageway */
function cost(W, I, x, z) { const qx = Math.round(x * 4), qz = Math.round(z * 4), bin = Math.floor(qx / 64) * 65536 + Math.floor(qz / 64); let bc = I.cache.get(bin); if (!bc) I.cache.set(bin, bc = new Map()); const k = qx * 131072 + qz; let v = bc.get(k); if (v !== undefined) return v; v = 1;
  const s = W.surface(x, z); if (s === null || W.surface(x + M, z) === null || W.surface(x - M, z) === null || W.surface(x, z + M) === null || W.surface(x, z - M) === null) v = 0;
  else { const bk = Math.floor(x / B) + ',' + Math.floor(z / B); for (const c of I.cols.get(bk) || []) if (x > c[0] - M && x < c[1] + M && z > c[2] - M && z < c[3] + M) { v = 0; break }
    if (v) for (const c of I.circ.get(bk) || []) if (Math.hypot(x - c[0], z - c[1]) < c[2] + M) { v = 0; break }
    if (v) for (const r of I.roads.get(bk) || []) if (segD(x, z, r) < (r[4] || 6) / 2) { v = 2; break } }
  if (++I.size > 600000) { I.cache.clear(); I.size = 0 } bc.set(k, v); return v }
PF.walkable = (W, x, z) => cost(W, index(W), x, z) > 0;
function los(W, I, a, b, strict) { const d = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(d / .25)); let road = 0; for (let i = 1; i < n; i++) { const t = i / n, v = cost(W, I, a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t); if (!v) return false; if (v === 2) road++ } return !strict || road * .25 < 16 }   /* 0.25 m samples: a diagonal cannot clip a thin wall corner */
function snap(W, I, p, cell) { if (cost(W, I, p[0], p[1])) return p; for (let r = cell; r < 14; r += cell * .5) for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2, x = p[0] + Math.cos(a) * r, z = p[1] + Math.sin(a) * r; if (cost(W, I, x, z)) return [x, z] } return null }
function stepFree(W, I, x0, z0, x1, z1) { const n = Math.ceil(Math.hypot(x1 - x0, z1 - z0) / .25); for (let i = 1; i < n; i++) if (!cost(W, I, x0 + (x1 - x0) * i / n, z0 + (z1 - z0) * i / n)) return false; return true }
function freeCell(W, I, p, C) { const cx = Math.round(p[0] / C), cz = Math.round(p[1] / C); let best = null, bd = 1e9; for (let r = 0; r <= 3 && !best; r++) for (let dx = -r; dx <= r; dx++) for (let dz = -r; dz <= r; dz++) { if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue; const x = cx + dx, z = cz + dz; if (!cost(W, I, x * C, z * C) || !stepFree(W, I, p[0], p[1], x * C, z * C)) continue; const d = Math.hypot(x * C - p[0], z * C - p[1]); if (d < bd) { bd = d; best = [x, z] } } return best || [cx, cz] }
function grid(W, I, A, Bp, C, cap) { const [sx, sz] = freeCell(W, I, A, C), [tx, tz] = freeCell(W, I, Bp, C), K = (x, z) => x * 100003 + z;   /* start / end on a free cell centre reachable from the point */
  const g = new Map([[K(sx, sz), 0]]), prev = new Map(), done = new Set(), heap = [[Math.hypot(tx - sx, tz - sz), sx, sz]]; let n = 0, found = null;
  const push = e => { heap.push(e); let i = heap.length - 1; while (i) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m } } return top };
  while (heap.length && n < cap) { const [, x, z] = pop(), k = K(x, z); if (done.has(k)) continue; done.add(k); n++; if (Math.abs(x - tx) <= 1 && Math.abs(z - tz) <= 1) { found = [x, z]; break }
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) { if (!dx && !dz) continue; const nx = x + dx, nz = z + dz, nk = K(nx, nz); if (done.has(nk)) continue; const cv = cost(W, I, nx * C, nz * C); if (!cv) continue;
      if (dx && dz && (!cost(W, I, (x + dx) * C, z * C) || !cost(W, I, x * C, (z + dz) * C))) continue; if (!stepFree(W, I, x * C, z * C, nx * C, nz * C)) continue;   /* a thin wall can sit between two free cells */ const nd = g.get(k) + (dx && dz ? 1.414 : 1) * (cv === 2 ? 3 : 1);
      if (nd < (g.has(nk) ? g.get(nk) : 1e18)) { g.set(nk, nd); prev.set(nk, k); push([nd + Math.hypot(tx - nx, tz - nz) * 1.08, nx, nz]) } } }
  PF.stats.lastN = n; if (!found) return null; const out = []; for (let k = K(found[0], found[1]); k != null; k = prev.get(k)) { const x = Math.round(k / 100003), z = k - x * 100003; out.unshift([x * C, z * C]) } const L = out[out.length - 1]; if (stepFree(W, I, L[0], L[1], Bp[0], Bp[1])) out.push([Bp[0], Bp[1]]); return out }
function smooth(W, I, p) { if (p.length < 3) return p; const out = [p[0]]; let i = 0; while (i < p.length - 1) { let j = Math.min(p.length - 1, i + 18); while (j > i + 1 && !los(W, I, p[i], p[j], true)) j--; out.push(p[j]); i = j } return out }
function nodeNear(N, x, z) { let bi = 0, bd = 1e18; for (let i = 0; i < N.nodes.length; i++) { const n = N.nodes[i], d = (n[0] - x) ** 2 + (n[1] - z) ** 2; if (d < bd) { bd = d; bi = i } } return bi }
function graph(N, s, t) { const n = N.nodes.length, g = new Float64Array(n).fill(1e18), prev = new Int32Array(n).fill(-1), done = new Uint8Array(n), open = [[0, s]]; g[s] = 0; const h = i => Math.hypot(N.nodes[i][0] - N.nodes[t][0], N.nodes[i][1] - N.nodes[t][1]);
  while (open.length) { let bi = 0; for (let i = 1; i < open.length; i++) if (open[i][0] < open[bi][0]) bi = i; const u = open.splice(bi, 1)[0][1]; if (done[u]) continue; done[u] = 1; if (u === t) break; for (const v of N.links[u]) { const nd = g[u] + Math.hypot(N.nodes[u][0] - N.nodes[v][0], N.nodes[u][1] - N.nodes[v][1]); if (nd < g[v]) { g[v] = nd; prev[v] = u; open.push([nd + h(v), v]) } } }
  if (!done[t]) return null; const out = []; for (let u = t; u >= 0; u = prev[u]) out.unshift([N.nodes[u][0], N.nodes[u][1]]); return out }
/* graph sections are checked against today's collision: blocked nodes snap to free ground, blocked edges (a kiosk, a terrace table
   added after the graph was built) are re-routed on the grid */
function repair(W, I, mid) { if (!mid) return null; const pts = mid.map(p => snap(W, I, p, 1) || p), out = [pts[0]]; for (let i = 1; i < pts.length; i++) { const a = out[out.length - 1], b = pts[i]; if (los(W, I, a, b, false)) { out.push(b); continue } const g = grid(W, I, a, b, 1, 8000); if (g) out.push(...smooth(W, I, g).slice(1)); else out.push(b); PF.stats.repaired = (PF.stats.repaired || 0) + 1 } return out }
PF.route = function (W, a, b) { const t0 = performance.now(), I = index(W), A = [a.x, a.z], Bp = [b.x, b.z], d = Math.hypot(Bp[0] - A[0], Bp[1] - A[1]); let out = null, how = 'straight';
  if (d < 2 || los(W, I, A, Bp, true)) { out = [Bp]; how = 'los' }
  else { const N = W.mapNav, hasG = N && N.nodes && N.nodes.length > 1;
    if (hasG && d > 220) { const s = nodeNear(N, A[0], A[1]), t = nodeNear(N, Bp[0], Bp[1]), mid = repair(W, I, graph(N, s, t)); if (mid) { const h0 = grid(W, I, snap(W, I, A, 1.5) || A, mid[0], 1.5, 20000) || [mid[0]], h1 = grid(W, I, mid[mid.length - 1], snap(W, I, Bp, 1.5) || Bp, 1.5, 20000) || [Bp]; out = smooth(W, I, h0).concat(mid.slice(1), smooth(W, I, h1).slice(1)); how = 'graph+grid' } }
    if (!out) { for (const C of d < 160 ? [1.5] : d < 420 ? [2.5, 1.5] : [4, 2.5, 1.5]) { const sa = snap(W, I, A, C), sb = snap(W, I, Bp, C); if (!sa || !sb) break; const p = grid(W, I, sa, sb, C, C > 2 ? 60000 : 90000); if (p) { out = smooth(W, I, p); how = 'grid ' + C; break } } }
    if (!out && hasG) { const mid = repair(W, I, graph(N, nodeNear(N, A[0], A[1]), nodeNear(N, Bp[0], Bp[1]))); if (mid) { out = mid.concat([Bp]); how = 'graph' } }
    if (!out) { out = [Bp]; how = 'straight (no path found)'; PF.stats.fails++ } }
  if (how !== 'los' && !how.startsWith('straight')) { const L = out[out.length - 1]; if ((L[0] !== Bp[0] || L[1] !== Bp[1]) && los(W, I, L, Bp, false)) out.push(Bp) }
  const ms = performance.now() - t0; PF.stats.routes++; PF.stats.ms = +ms.toFixed(1); PF.stats.maxMs = Math.max(PF.stats.maxMs, +ms.toFixed(1)); PF.stats.how = how; return out };
/* the GPS uses it in every world */
addEventListener('load', () => { const MM = AV.minimap; if (!MM) return; const r0 = MM._route; MM._routeOld = r0;
  /* minimap.js keeps its own routeTo for setDest + re-routing; route through AV.path by replacing the function it calls */
  MM._route = (x, z) => AV.W ? PF.route(AV.W, { x: AV.P.x, z: AV.P.z }, { x, z }) : [[x, z]];  });
})(window.AV);
