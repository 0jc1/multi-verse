/* APEVERSE 2.2 GLOBAL WORLDS - gw_kit.js : the street-network-first city kit (agent 4).  No world logic; only AV.gwkit.
   A city is drawn as a NETWORK first (streets, lanes, alleys, plazas, open ground, water, bridges, landmark footprints); the kit
   rasterises it (0.5 m cells) into a walk mask that the world's surface() answers from, so buildings are solid exactly where the
   street network says they are (no thousands of colliders: the engine treats surface() === null as a wall and slides along it).
   Then:
     - graph(): a walking graph from the street centre lines, plazas and open ground, joined wherever two features really meet
       (checked against the walk mask) -> crowds (AV.city.nav), GPS (W.mapNav) and the minimap (mapRoads)
     - check(): connectivity report: graph components, raster flood fill from the arrival, ACCIDENTAL dead ends (a street end that
       joins nothing and is not marked as an intentional cul-de-sac), walkable ground touching the map edge (an invisible wall)
     - lots(): building lots along every street / plaza edge (frontage), each as deep as the block allows, never overlapping
     - filler(): the leftover block interiors as merged rectangles (blank convent walls / roofs), so no block shows a hole
     - medHouse(): a parametric Mediterranean house (Andalusia, Cádiz, Ibiza, Chefchaouen, colonial Oaxaca...) built from boxes
     - chunked(): merge parts per map tile so frustum culling skips what you can't see
     - atlas() / quadGeo() / fit() / rr() / azulejo(): canvas sign atlases and tile-panel lettering
   Coordinates: metres, x east, z south (north is -z).  AV.gwkit */
'use strict';
(function (AV) {
const GW = AV.gwkit = { version: 1 };
const C_BLD = 0, C_ST = 1, C_PLZ = 2, C_OPEN = 3, C_WAT = 4, C_SOL = 5, C_BRG = 6, C_IN = 8;
GW.CODES = { C_BLD, C_ST, C_PLZ, C_OPEN, C_WAT, C_SOL, C_BRG, C_IN };
const WALKC = new Uint8Array(16); for (const c of [C_ST, C_PLZ, C_OPEN, C_BRG, C_IN]) WALKC[c] = 1;
GW.rng = seed => { let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296 } };
const circPoly = (cx, cz, r, n) => { const p = []; n = n || 20; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; p.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]) } return p };
GW.circPoly = circPoly;
GW.rectPoly = (x0, x1, z0, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
/* oriented rectangle: centre of the front edge (fx, fz), unit along (ax, az), unit "in" (into the building) (nx, nz), width w, depth d */
GW.oRect = (fx, fz, ax, az, nx, nz, w, d, u0, v0) => { u0 = u0 || 0; v0 = v0 || 0; const hw = w / 2; return [[fx - ax * hw + nx * u0, fz - az * hw + nz * u0], [fx + ax * hw + nx * u0, fz + az * hw + nz * u0], [fx + ax * hw + nx * d, fz + az * hw + nz * d], [fx - ax * hw + nx * d, fz - az * hw + nz * d]] };
const segD = (px, pz, ax, az, bx, bz) => { const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz; let t = l2 ? ((px - ax) * dx + (pz - az) * dz) / l2 : 0; t = t < 0 ? 0 : t > 1 ? 1 : t; return Math.hypot(px - ax - dx * t, pz - az - dz * t) };
const inPoly = (x, z, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[i], b = P[j]; if ((a[1] > z) !== (b[1] > z) && x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0]) c = !c } return c };
GW.inPoly = inPoly; GW.segD = segD;

/* ======================= the network ======================= */
GW.Net = function (o) {
  const N = { x0: o.x0, x1: o.x1, z0: o.z0, z1: o.z1, c: o.cell || .5, streets: [], plazas: [], opens: [], waters: [], solids: [], bridges: [], carves: [], blocks: [], height: o.height || null, built: false };
  const c = N.c, nx = N.nx = Math.ceil((N.x1 - N.x0) / c), nz = N.nz = Math.ceil((N.z1 - N.z0) / c);
  const R = N.R = new Uint8Array(nx * nz), Wk = N.Wk = new Uint8Array(nx * nz), CL = N.CL = new Int32Array(nx * nz);   /* code, walk mask, lot claim (lot id + 1) */
  const ix = x => Math.floor((x - N.x0) / c), iz = z => Math.floor((z - N.z0) / c);
  N.idx = (x, z) => { const i = ix(x), j = iz(z); return i < 0 || j < 0 || i >= nx || j >= nz ? -1 : j * nx + i };
  N.code = (x, z) => { const k = N.idx(x, z); return k < 0 ? -1 : R[k] };
  N.walk = (x, z) => { const k = N.idx(x, z); return k >= 0 && Wk[k] === 1 };
  /* ---- authoring (before build) ---- */
  N.street = (id, pts, w, so) => { const s = Object.assign({ id, pts, w, kind: 'street', front: true }, so || {}); N.streets.push(s); return s };
  N.plaza = (id, poly, po) => { const p = Object.assign({ id, poly, front: true }, po || {}); N.plazas.push(p); return p };
  N.circle = (id, cx, cz, r, po) => N.plaza(id, circPoly(cx, cz, r, Math.max(12, Math.round(r * 1.2))), Object.assign({ c: [cx, cz], r }, po || {}));
  N.open = (id, poly, oo) => { const p = Object.assign({ id, poly }, oo || {}); N.opens.push(p); return p };
  N.water = (id, poly, wo) => { const p = Object.assign({ id, poly }, wo || {}); N.waters.push(p); return p };
  N.solid = (id, poly, so) => { const p = Object.assign({ id, poly }, so || {}); N.solids.push(p); return p };
  N.bridge = (id, a, b, w, rise, bo) => { const p = Object.assign({ id, pts: [a, b], w, rise: rise || 1, kind: 'bridge' }, bo || {}); N.bridges.push(p); return p };
  /* ---- painting ---- */
  function paintPoly(P, code) { let zmin = 1e9, zmax = -1e9; for (const p of P) { zmin = Math.min(zmin, p[1]); zmax = Math.max(zmax, p[1]) }
    for (let j = Math.max(0, iz(zmin)); j <= Math.min(nz - 1, iz(zmax)); j++) { const z = N.z0 + (j + .5) * c, xs = [];
      for (let i = 0, k = P.length - 1; i < P.length; k = i++) { const a = P[i], b = P[k]; if ((a[1] > z) !== (b[1] > z)) xs.push((b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0]) }
      xs.sort((a, b) => a - b); for (let q = 0; q + 1 < xs.length; q += 2) { const i0 = Math.max(0, Math.ceil((xs[q] - N.x0) / c - .5)), i1 = Math.min(nx - 1, Math.floor((xs[q + 1] - N.x0) / c - .5)); for (let i = i0; i <= i1; i++) R[j * nx + i] = code } } }
  function paintCapsule(pts, r, code) { for (let s = 0; s + 1 < pts.length; s++) { const a = pts[s], b = pts[s + 1];
      const i0 = Math.max(0, ix(Math.min(a[0], b[0]) - r)), i1 = Math.min(nx - 1, ix(Math.max(a[0], b[0]) + r)), j0 = Math.max(0, iz(Math.min(a[1], b[1]) - r)), j1 = Math.min(nz - 1, iz(Math.max(a[1], b[1]) + r));
      for (let j = j0; j <= j1; j++) { const z = N.z0 + (j + .5) * c; for (let i = i0; i <= i1; i++) { const x = N.x0 + (i + .5) * c; if (segD(x, z, a[0], a[1], b[0], b[1]) <= r) R[j * nx + i] = code } } } }
  N.paintPoly = paintPoly; N.paintCapsule = paintCapsule;
  /* erode: walkable = walkable code and every 8-neighbour walkable code (half a metre from any wall) */
  function erode(i0, i1, j0, j1) { i0 = Math.max(0, i0); j0 = Math.max(0, j0); i1 = Math.min(nx - 1, i1); j1 = Math.min(nz - 1, j1);
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const k = j * nx + i; let w = WALKC[R[k]]; if (w && (i === 0 || j === 0 || i === nx - 1 || j === nz - 1)) w = 0;
      if (w) for (let dj = -1; dj <= 1 && w; dj++) for (let di = -1; di <= 1; di++) if (!WALKC[R[k + dj * nx + di]]) { w = 0; break } Wk[k] = w } }
  N.build = function () {
    for (const p of N.opens) paintPoly(p.poly, C_OPEN);
    for (const p of N.plazas) paintPoly(p.poly, C_PLZ);
    for (const s of N.streets) paintCapsule(s.pts, s.w / 2, C_ST);
    for (const p of N.solids) paintPoly(p.poly, C_SOL);
    for (const p of N.waters) paintPoly(p.poly, C_WAT);
    for (const b of N.bridges) paintCapsule(b.pts, b.w / 2, C_BRG);
    erode(0, nx - 1, 0, nz - 1); N.built = true; return N };
  /* after build: carve walkable floor (interiors, gates, passages) or block (counters, fountains) and re-erode locally */
  const touch = (P, code) => { paintPoly(P, code); let a = 1e9, b = -1e9, d = 1e9, e = -1e9; for (const p of P) { a = Math.min(a, p[0]); b = Math.max(b, p[0]); d = Math.min(d, p[1]); e = Math.max(e, p[1]) } erode(ix(a) - 2, ix(b) + 2, iz(d) - 2, iz(e) + 2) };
  N.carve = P => { N.carves.push(P); touch(P, C_IN) };
  N.block = P => { N.blocks.push(P); touch(P, C_SOL) };
  N.blockCircle = (x, z, r) => N.block(circPoly(x, z, r, 10));
  N.setCode = (P, code) => touch(P, code);   /* toggles (festival structures): paint any code and re-erode locally */
  /* ---- surface: null where you can't stand; bridges arch ---- */
  N.bridgeY = (x, z) => { for (const b of N.bridges) { const [a, e] = b.pts, dx = e[0] - a[0], dz = e[1] - a[1], L = Math.hypot(dx, dz), t = ((x - a[0]) * dx + (z - a[1]) * dz) / (L * L); if (t < -.02 || t > 1.02) continue; if (segD(x, z, a[0], a[1], e[0], e[1]) > b.w / 2 + .1) continue; const tt = Math.max(0, Math.min(1, t)); return .02 + b.rise * Math.sin(tt * Math.PI) } return 0 };
  N.surface = (x, z) => { const k = N.idx(x, z); if (k < 0 || !Wk[k]) return null; if (R[k] === C_BRG) return N.bridgeY(x, z); return N.height ? N.height(x, z) : 0 };
  /* can you walk from a to b: straight, or round a small obstacle (a tree, a lamp) via a side-step? */
  N.reach = (ax, az, bx, bz) => { if (N.lineWalk(ax, az, bx, bz)) return true; const L = Math.hypot(bx - ax, bz - az); if (L < .1) return true; const px = -(bz - az) / L, pz = (bx - ax) / L, mx = (ax + bx) / 2, mz = (az + bz) / 2; for (const k of [1.2, -1.2, 2.4, -2.4, 3.6, -3.6]) { const x = mx + px * k, z = mz + pz * k; if (N.lineWalk(ax, az, x, z) && N.lineWalk(x, z, bx, bz)) return true } return false };
  N.lineWalk = (ax, az, bx, bz, step) => { const L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.ceil(L / (step || .5))); for (let i = 0; i <= n; i++) if (!N.walk(ax + (bx - ax) * i / n, az + (bz - az) * i / n)) return false; return true };
  /* ======================= walking graph ======================= */
  N.graph = function (go) { go = go || {}; const nodes = [], feat = [], edges = [], ES = new Set(), sp = go.spacing || 6;
    const add = (x, z, f) => { if (!N.walk(x, z)) { const s = N.snap(x, z, 2.5); if (!s) return -1; x = s[0]; z = s[1] } nodes.push([x, z]); feat.push(f); return nodes.length - 1 };
    const link = (a, b) => { if (a < 0 || b < 0 || a === b) return; const k = a < b ? a + ',' + b : b + ',' + a; if (ES.has(k)) return; ES.add(k); edges.push([a, b]) };
    const ends = [];
    const poly = (pts, f) => { let prev = -1, first = -1; for (let s = 0; s + 1 < pts.length; s++) { const a = pts[s], b = pts[s + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / sp));
        for (let k = s ? 1 : 0; k <= n; k++) { const id = add(a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n, f); if (id < 0) continue; if (first < 0) first = id; if (prev >= 0 && N.reach(nodes[prev][0], nodes[prev][1], nodes[id][0], nodes[id][1])) link(prev, id); prev = id } } return [first, prev] };
    N.streets.forEach((s, i) => { const e = poly(s.pts, 's' + i); ends.push({ s, i, a: e[0], b: e[1] }) });
    N.bridges.forEach((b, i) => { const e = poly(b.pts, 'b' + i); ends.push({ s: b, i: 'b' + i, a: e[0], b: e[1], bridge: true }) });
    const area = (P, f, step) => { let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (const p of P) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); z0 = Math.min(z0, p[1]); z1 = Math.max(z1, p[1]) }
      const ids = []; for (let z = z0 + step / 2; z < z1; z += step) for (let x = x0 + step / 2; x < x1; x += step) if (inPoly(x, z, P) && N.walk(x, z)) { nodes.push([x, z]); feat.push(f); ids.push(nodes.length - 1) }
      if (!ids.length) { const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, id = add(cx, cz, f); if (id >= 0) ids.push(id) }
      for (const a of ids) for (const b of ids) if (a < b && Math.hypot(nodes[a][0] - nodes[b][0], nodes[a][1] - nodes[b][1]) < step * 1.5 && N.reach(nodes[a][0], nodes[a][1], nodes[b][0], nodes[b][1])) link(a, b) };
    N.plazas.forEach((p, i) => area(p.poly, 'p' + i, p.r && p.r < 14 ? 5 : 8));
    N.opens.forEach((p, i) => area(p.poly, 'o' + i, p.step || 12));
    N.carves.forEach((P, i) => { let A = 0; for (let k = 0, j = P.length - 1; k < P.length; j = k++) A += (P[j][0] + P[k][0]) * (P[j][1] - P[k][1]); area(P, 'c' + i, Math.abs(A) / 2 < 150 ? 2.5 : 6) });   /* rooms get a finer grid so the graph threads between furniture */
    (go.extra || []).forEach((pts, i) => poly(pts, 'x' + i));
    /* join different features where they really meet */
    const H = new Map(), B = 10, hk = (x, z) => Math.floor(x / B) + ',' + Math.floor(z / B);
    nodes.forEach((n, i) => { const k = hk(n[0], n[1]); let a = H.get(k); if (!a) H.set(k, a = []); a.push(i) });
    const J = go.join || 12;
    nodes.forEach((n, i) => { const bx = Math.floor(n[0] / B), bz = Math.floor(n[1] / B); const best = new Map();
      for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) for (const j of H.get((bx + dx) + ',' + (bz + dz)) || []) { if (j <= i || feat[j] === feat[i]) continue; const d = Math.hypot(nodes[j][0] - n[0], nodes[j][1] - n[1]); if (d > J) continue; const f = feat[j], b0 = best.get(f); if (!b0 || d < b0[1]) best.set(f, [j, d]) }
      for (const [, [j]] of best) if (N.reach(n[0], n[1], nodes[j][0], nodes[j][1])) link(i, j) });
    /* a node left with no link (a furnished room's centre): join it to the nearest node it can actually reach */
    { const deg = new Int32Array(nodes.length); edges.forEach(([a, b]) => { deg[a]++; deg[b]++ }); nodes.forEach((n, i) => { if (deg[i]) return; const c2 = []; nodes.forEach((m, j) => { if (j !== i) { const d = Math.hypot(m[0] - n[0], m[1] - n[1]); if (d < 14) c2.push([d, j]) } }); c2.sort((p, q) => p[0] - q[0]); for (const [, j] of c2.slice(0, 8)) if (N.reach(n[0], n[1], nodes[j][0], nodes[j][1]) || N.reach(nodes[j][0], nodes[j][1], n[0], n[1])) { link(i, j); break } }) }
    const links = nodes.map(() => []); edges.forEach(([a, b]) => { links[a].push(b); links[b].push(a) });
    N.G = { nodes, edges, links, feat, ends }; return N.G };
  N.snap = (x, z, r) => { if (N.walk(x, z)) return [x, z]; for (let rr = c; rr <= (r || 4); rr += c) for (let a = 0; a < 16; a++) { const px = x + Math.cos(a / 16 * Math.PI * 2) * rr, pz = z + Math.sin(a / 16 * Math.PI * 2) * rr; if (N.walk(px, pz)) return [px, pz] } return null };
  N.nearNode = (x, z) => { const G = N.G; let b = -1, bd = 1e9; G.nodes.forEach((n, i) => { const d = (n[0] - x) ** 2 + (n[1] - z) ** 2; if (d < bd) { bd = d; b = i } }); return b };
  /* ======================= connectivity report ======================= */
  N.check = function (from) { const G = N.G || N.graph(), rep = { nodes: G.nodes.length, edges: G.edges.length };
    /* graph components */
    const comp = new Int32Array(G.nodes.length).fill(-1); let nc = 0; const sizes = [];
    for (let i = 0; i < G.nodes.length; i++) { if (comp[i] >= 0) continue; const st = [i]; comp[i] = nc; let n = 0; while (st.length) { const a = st.pop(); n++; for (const b of G.links[a]) if (comp[b] < 0) { comp[b] = nc; st.push(b) } } sizes.push(n); nc++ }
    const main = sizes.indexOf(Math.max(...sizes)); rep.components = nc; rep.mainFrac = +(sizes[main] / G.nodes.length).toFixed(4);
    rep.islands = []; for (let k = 0; k < nc; k++) if (k !== main) { const i = comp.indexOf(k); rep.islands.push({ at: G.nodes[i].map(v => Math.round(v)), nodes: sizes[k], feat: G.feat[i] }) }
    /* accidental dead ends: a street end whose node links only along its own street */
    rep.deadEnds = []; rep.culs = [];
    for (const e of G.ends) { const s = e.s; for (const [end, nid] of [['start', e.a], ['end', e.b]]) { if (nid < 0) continue; const own = G.feat[nid], other = G.links[nid].some(j => G.feat[j] !== own);
        /* the end may join via a node just before it (short final segment) */
        const near = other || G.links[nid].some(j => G.links[j].some(k => G.feat[k] !== own && Math.hypot(G.nodes[k][0] - G.nodes[nid][0], G.nodes[k][1] - G.nodes[nid][1]) < 12));
        if (near) continue; const cul = s.cul && (s.cul === true || s.cul === end || (Array.isArray(s.cul) && s.cul.includes(end))); (cul ? rep.culs : rep.deadEnds).push({ id: s.id, end, at: G.nodes[nid].map(v => Math.round(v)) }) } }
    /* raster flood fill from the arrival */
    if (from) { const s = N.snap(from[0], from[1], 6); if (s) { const seen = new Uint8Array(nx * nz), q = new Int32Array(nx * nz); let h = 0, t = 0; const k0 = N.idx(s[0], s[1]); seen[k0] = 1; q[t++] = k0; let tot = 0;
        while (h < t) { const k = q[h++]; const i = k % nx; for (const d of [1, -1, nx, -nx]) { const m = k + d; if (m < 0 || m >= nx * nz || seen[m] || !Wk[m]) continue; if ((d === 1 && i === nx - 1) || (d === -1 && i === 0)) continue; seen[m] = 1; q[t++] = m } }
        for (let k = 0; k < nx * nz; k++) if (Wk[k]) tot++; rep.reachFrac = +(t / tot).toFixed(4); rep.reachM2 = Math.round(t * c * c); rep.walkM2 = Math.round(tot * c * c);
        /* unreached walkable pockets bigger than 6 m2 */
        rep.pockets = []; const pk = new Uint8Array(nx * nz); for (let k = 0; k < nx * nz; k++) { if (!Wk[k] || seen[k] || pk[k]) continue; let n = 0, h2 = 0, t2 = 0; const q2 = [k]; pk[k] = 1; let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
          while (h2 < q2.length) { const a = q2[h2++]; n++; const i = a % nx, j = (a / nx) | 0; x0 = Math.min(x0, i); x1 = Math.max(x1, i); z0 = Math.min(z0, j); z1 = Math.max(z1, j); for (const d of [1, -1, nx, -nx]) { const m = a + d; if (m < 0 || m >= nx * nz || pk[m] || !Wk[m] || seen[m]) continue; if ((d === 1 && i === nx - 1) || (d === -1 && i === 0)) continue; pk[m] = 1; q2.push(m) } }
          if (n * c * c > 6) rep.pockets.push({ m2: Math.round(n * c * c), x: Math.round(N.x0 + (x0 + x1) / 2 * c), z: Math.round(N.z0 + (z0 + z1) / 2 * c) }) } } }
    /* invisible walls: walkable ground within 1.5 m of the map edge */
    { let n = 0; const m = Math.ceil(1.5 / c); for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) if ((i < m || j < m || i >= nx - m || j >= nz - m) && Wk[j * nx + i]) n++; rep.edgeCells = n }
    N.rep = rep; return rep };
  /* ======================= frontage lots ======================= */
  N.lots = function (rng, lo) { lo = lo || {}; const lots = [], wmin = lo.wmin || 5, wmax = lo.wmax || 9, dmax = lo.dmax || 13, dmin = lo.dmin || 3.2;
    const isB = (x, z) => { const k = N.idx(x, z); return k >= 0 && R[k] === C_BLD && CL[k] === 0 };
    const claim = (P, id) => { let zmin = 1e9, zmax = -1e9; for (const p of P) { zmin = Math.min(zmin, p[1]); zmax = Math.max(zmax, p[1]) }
      for (let j = Math.max(0, iz(zmin)); j <= Math.min(nz - 1, iz(zmax)); j++) { const z = N.z0 + (j + .5) * c, xs = []; for (let i = 0, k = P.length - 1; i < P.length; k = i++) { const a = P[i], b = P[k]; if ((a[1] > z) !== (b[1] > z)) xs.push((b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0]) }
        xs.sort((a, b) => a - b); for (let q = 0; q + 1 < xs.length; q += 2) for (let i = Math.max(0, Math.ceil((xs[q] - N.x0) / c - .5)); i <= Math.min(nx - 1, Math.floor((xs[q + 1] - N.x0) / c - .5)); i++) { const k = j * nx + i; if (R[k] === C_BLD && !CL[k]) CL[k] = id } } };
    /* one edge: from point a to b, building on the side of unit normal n (pointing away from the street) */
    function edge(ax, az, bx, bz, nxv, nzv, src) { const L = Math.hypot(bx - ax, bz - az); if (L < wmin) return; const ux = (bx - ax) / L, uz = (bz - az) / L; let t = 0;
      while (t < L - 3) { let w = wmin + rng() * (wmax - wmin); if (t + w > L) w = L - t; if (w < 3.2) break;
        const fx = ax + ux * (t + w / 2), fz = az + uz * (t + w / 2);
        /* front row must be fresh building land */
        let ok = true; for (let s = -w / 2 + .35; s <= w / 2 - .35 + 1e-6; s += .9) if (!isB(fx + ux * s + nxv * .3, fz + uz * s + nzv * .3)) { ok = false; break }
        if (!ok) { t += 1; continue }
        let d = .8; while (d < dmax) { const dd = d + .5; let good = true; for (const s of [-w / 2 + .35, 0, w / 2 - .35]) if (!isB(fx + ux * s + nxv * dd, fz + uz * s + nzv * dd)) { good = false; break } if (!good) break; d = dd }
        if (d < dmin) { t += 1; continue }
        const id = lots.length + 1, lot = { id, x: fx, z: fz, ax: ux, az: uz, nx: nxv, nz: nzv, w, d, yaw: Math.atan2(-nxv, -nzv), src: src.id, kind: src.kind || 'plaza', name: src.name };
        claim(GW.oRect(fx, fz, ux, uz, nxv, nzv, w, d), id); lots.push(lot); t += w + .02 } }
    const order = lo.order || ['plaza', 'avenue', 'road', 'street', 'promenade', 'lane', 'alley'];
    const feats = [];
    N.plazas.forEach(p => { if (p.front === false) return; feats.push({ o: p, rank: order.indexOf('plaza') }) });
    N.streets.forEach(s => { if (s.front === false) return; feats.push({ o: s, rank: order.indexOf(s.kind) < 0 ? 9 : order.indexOf(s.kind) }) });
    feats.sort((a, b) => a.rank - b.rank);
    for (const { o } of feats) {
      if (o.poly) { const P = o.poly; let cx = 0, cz = 0; for (const p of P) { cx += p[0]; cz += p[1] } cx /= P.length; cz /= P.length;
        for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 3) continue; let nxv = (b[1] - a[1]) / L, nzv = -(b[0] - a[0]) / L; const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2; if ((mx + nxv - cx) ** 2 + (mz + nzv - cz) ** 2 < (mx - cx) ** 2 + (mz - cz) ** 2) { nxv = -nxv; nzv = -nzv }
          edge(a[0] + nxv * .02, a[1] + nzv * .02, b[0] + nxv * .02, b[1] + nzv * .02, nxv, nzv, o) } }
      else { const hw = o.w / 2; for (let s = 0; s + 1 < o.pts.length; s++) { const a = o.pts[s], b = o.pts[s + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 2) continue; const ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
          for (const sd of (o.sides || [1, -1])) { const nxv = -uz * sd, nzv = ux * sd; edge(a[0] + nxv * (hw + .02), a[1] + nzv * (hw + .02), b[0] + nxv * (hw + .02), b[1] + nzv * (hw + .02), nxv, nzv, o) } } } }
    N.lotList = lots; return lots };
  /* ======================= filler: leftover building land, merged rectangles on a 1 m grid ======================= */
  N.filler = function (fo) { fo = fo || {}; const g = 1, gx = Math.floor((N.x1 - N.x0) / g), gz = Math.floor((N.z1 - N.z0) / g), r = Math.round(g / c), A = new Uint8Array(gx * gz), out = [];
    for (let j = 0; j < gz; j++) for (let i = 0; i < gx; i++) { let ok = 1; for (let b = 0; b < r && ok; b++) for (let a = 0; a < r; a++) { const k = (j * r + b) * nx + i * r + a; if (R[k] !== C_BLD || CL[k]) { ok = 0; break } } A[j * gx + i] = ok }
    for (let j = 0; j < gz; j++) for (let i = 0; i < gx; i++) { if (!A[j * gx + i]) continue; let w = 0; while (i + w < gx && A[j * gx + i + w] && w < (fo.max || 40)) w++; let h = 1;
      while (j + h < gz && h < (fo.max || 40)) { let ok = true; for (let a = 0; a < w; a++) if (!A[(j + h) * gx + i + a]) { ok = false; break } if (!ok) break; h++ }
      for (let b = 0; b < h; b++) for (let a = 0; a < w; a++) A[(j + b) * gx + i + a] = 0;
      const x0 = N.x0 + i * g, z0 = N.z0 + j * g, rect = [x0, x0 + w * g, z0, z0 + h * g];
      /* visible from a street? (walkable ground within 2 m of its edge) */
      let vis = false; for (let x = rect[0] - 1.5; x <= rect[1] + 1.5 && !vis; x += 1) for (const z of [rect[2] - 1.5, rect[3] + 1.5]) if (N.walk(x, z)) { vis = true; break }
      for (let z = rect[2] - 1.5; z <= rect[3] + 1.5 && !vis; z += 1) for (const x of [rect[0] - 1.5, rect[1] + 1.5]) if (N.walk(x, z)) { vis = true; break }
      out.push({ r: rect, vis }) }
    return out };
  N.mapRoads = () => { const out = []; for (const s of N.streets) for (let i = 0; i + 1 < s.pts.length; i++) out.push([s.pts[i][0], s.pts[i][1], s.pts[i + 1][0], s.pts[i + 1][1], Math.max(2, s.w)]); for (const b of N.bridges) out.push([b.pts[0][0], b.pts[0][1], b.pts[1][0], b.pts[1][1], b.w]); return out };
  return N };

/* ======================= parts, merging, chunking ======================= */
/* a part is [geometry, hex colour, Matrix4, glowFlag] like AV.kit.merge expects */
GW.basis = (x, z, yaw, y) => new THREE.Matrix4().makeRotationY(yaw).premultiply(new THREE.Matrix4().makeTranslation(x, y || 0, z));
GW.putter = (arr, base) => (geo, hex, x, y, z, sx, sy, sz, gl, rx, ry, rz) => { const m = AV.kit.M(x, y, z, sx, sy, sz, rx, ry, rz); m.premultiply(base); arr.push([geo, hex, m, gl || 0]) };
GW.chunked = function (items, cell, build, mat, grp, name, o) { o = o || {}; if (GW.noChunks) cell = 1e7; const B = new Map(), key = (x, z) => Math.floor(x / cell) + ',' + Math.floor(z / cell);
  for (const it of items) { let x, z, wide = false; if (Array.isArray(it)) { const e = it[2].elements; x = e[12]; z = e[14]; const sx = Math.hypot(e[0], e[1], e[2]), sz = Math.hypot(e[8], e[9], e[10]); wide = Math.max(sx, sz) > cell * 1.5 } else { x = it.x; z = it.z }
    const k = wide ? 'wide' : key(x, z); let a = B.get(k); if (!a) B.set(k, a = []); a.push(it) }
  const out = []; for (const [k, arr] of B) { if (!arr.length) continue; const g = build(arr); if (!g || !g.attributes.position || !g.attributes.position.count) continue; g.computeBoundingSphere(); const m = new THREE.Mesh(g, mat); m.name = name + '_' + k; if (o.shadow) m.castShadow = m.receiveShadow = true; if (o.order) m.renderOrder = o.order; grp.add(m); out.push(m) }
  return out };
/* ======================= signs ======================= */
GW.fit = (g, t, w, px, fam, y, x) => { let n = px; do { g.font = fam.replace('#', n); n -= 2 } while (g.measureText(t).width > w && n > 9); g.fillText(t, x, y) };
GW.rr = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath() };
GW.atlas = function (LIST, SG, W, H) { if (SG.tex) return SG.tex; SG.r = SG.r || {}; const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d'); const sh = []; let top = 0;
  for (const [k, w, h, fn] of LIST.slice().sort((a, b) => b[2] - a[2] || b[1] - a[1])) { let s = sh.find(q => q.h >= h && q.x + w <= W); if (!s) { if (top + h > H) { (SG.over = SG.over || []).push(k); continue } s = { y: top, h, x: 0 }; sh.push(s); top += h + 4 } g.save(); g.translate(s.x, s.y); g.beginPath(); g.rect(0, 0, w, h); g.clip(); try { fn(g, w, h) } catch (e) { (SG.bad = SG.bad || []).push(k) } g.restore(); SG.r[k] = [s.x / W, 1 - (s.y + h) / H, w / W, h / H]; s.x += w + 4 }
  SG.used = top; SG.canvas = cv; const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; SG.tex = t; return t };
GW.quadGeo = function (qs, R) { const n = qs.length, pos = new Float32Array(n * 18), nor = new Float32Array(n * 18), uv = new Float32Array(n * 12); let o = 0;
  qs.forEach(q => { const r = R[q.k]; if (!r) return; const c = Math.cos(q.ry), s = Math.sin(q.ry), hw = q.w / 2, hh = q.h / 2, P = (a, b) => [q.x + a * c, q.y + b, q.z - a * s];
    const v = [[P(-hw, -hh), [r[0], r[1]]], [P(hw, -hh), [r[0] + r[2], r[1]]], [P(hw, hh), [r[0] + r[2], r[1] + r[3]]], [P(-hw, hh), [r[0], r[1] + r[3]]]];
    for (const i of [0, 1, 2, 0, 2, 3]) { pos.set(v[i][0], o * 3); nor.set([s, 0, c], o * 3); uv.set(v[i][1], o * 2); o++ } });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos.subarray(0, o * 3), 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor.subarray(0, o * 3), 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv.subarray(0, o * 2), 2)); g.computeBoundingSphere(); return g };
/* azulejo (glazed tile) panel with lettering: the classic Andalusian shop / street-name sign.  o: { bg, ink, border, sub, font, motif } */
GW.azulejo = (text, o) => (g, w, h) => { o = o || {}; const T = Math.max(16, Math.round(h / (o.rows || 4))); g.fillStyle = o.bg || '#f6f0e0'; g.fillRect(0, 0, w, h);
  /* tile grid + glaze variation */
  for (let y = 0; y < h; y += T) for (let x = 0; x < w; x += T) { g.fillStyle = 'rgba(' + (o.glaze || '40,60,120') + ',' + (.02 + Math.random() * .05) + ')'; g.fillRect(x + 1, y + 1, T - 2, T - 2) }
  g.strokeStyle = 'rgba(120,110,90,.35)'; g.lineWidth = 1; for (let y = 0; y <= h; y += T) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke() } for (let x = 0; x <= w; x += T) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke() }
  /* border of little four-petal motifs */
  const bc = o.border || '#1f4a9a', ac = o.accent || '#e8a820'; g.fillStyle = bc; g.fillRect(0, 0, w, T * .5); g.fillRect(0, h - T * .5, w, T * .5); g.fillRect(0, 0, T * .5, h); g.fillRect(w - T * .5, 0, T * .5, h);
  g.fillStyle = ac; for (let x = T * .25; x < w; x += T) { for (const y of [T * .25, h - T * .25]) { g.beginPath(); g.arc(x, y, T * .12, 0, 7); g.fill() } } for (let y = T * .25; y < h; y += T) for (const x of [T * .25, w - T * .25]) { g.beginPath(); g.arc(x, y, T * .12, 0, 7); g.fill() }
  if (o.motif) o.motif(g, w, h, T);
  g.fillStyle = o.ink || '#1f3a8a'; g.textAlign = 'center'; g.textBaseline = 'middle'; const sub = o.sub;
  GW.fit(g, text, w - T * 1.6 - (o.padL || 0), (sub ? h * .42 : h * .56), o.font || 'italic 700 #px Georgia, "Times New Roman", serif', sub ? h * .42 : h * .52, w / 2 + (o.padL || 0) / 2);
  if (sub) { g.fillStyle = o.ink2 || o.ink || '#1f3a8a'; GW.fit(g, sub, w - T * 2 - (o.padL || 0), h * .17, o.font2 || '600 #px Georgia, serif', h * .76, w / 2 + (o.padL || 0) / 2) } };

/* ======================= Mediterranean house =======================
   lot = { x, z (front centre on the facade line), yaw (front faces the street), w, d }.  st = style:
   { walls: [hex], trim: [hex], base: [hex], shutter: [hex], door: [hex], iron: hex, roof: 'flat'|'tile'|'mix', tile: hex,
     floors: [min, max], fh: floor height, balcony: probability, cierro: probability (glazed box balcony), reja: bool,
     pots: probability, mirador: probability, q: quality 0..2 }
   o = { shop: bool (shopfront ground floor), lit, hollow (depth: walk-in, front wall with a door gap), floors (force), wall (force colour) }
   Returns { base (Matrix4), h (eave height), signY, shopW, door: [x,z] world } */
GW.medHouse = function (P, Gl, lot, st, rng, o) { o = o || {}; const BG = AV.kit.BG, base = GW.basis(lot.x, lot.z, lot.yaw), put = GW.putter(P, base), putG = GW.putter(Gl, base), q = st.q == null ? 2 : st.q;
  const pick = a => a[(rng() * a.length) | 0], w = lot.w, d = lot.d, fh = st.fh || 3.3;
  const nf = o.floors || (st.floors[0] + ((rng() * (st.floors[1] - st.floors[0] + 1)) | 0)), h = nf * fh + .6;
  const wall = o.wall || pick(st.walls), trim = pick(st.trim), zoc = pick(st.base), shut = pick(st.shutter), iron = st.iron || 0x1a1a1a;
  /* body (front at local z = 0, extends to z = -d) */
  if (o.hollow) { const hd = o.hollow, hh = fh + .3; put(BG.box, wall, 0, (hh + h) / 2, -d / 2, w, h - hh, d); put(BG.box, wall, -w / 2 + .15, hh / 2, -hd / 2, .3, hh, hd); put(BG.box, wall, w / 2 - .15, hh / 2, -hd / 2, .3, hh, hd); put(BG.box, wall, 0, hh / 2, -hd + .15, w, hh, .3);
    if (d > hd + .5) put(BG.box, wall, 0, hh / 2, -(hd + d) / 2, w, hh, d - hd);
    put(BG.box, 0x3a2a20, 0, hh - .05, -hd / 2, w - .6, .1, hd - .4) }
  else put(BG.box, wall, 0, h / 2, -d / 2, w, h, d);
  /* zócalo (painted plinth), cornice, parapet */
  put(BG.box, zoc, 0, .5, .03, w + .02, 1, .08);
  put(BG.box, trim, 0, h - .55, .06, w + .12, .28, .2); put(BG.box, wall, 0, h + .35, .0, w, .7, .3); put(BG.box, trim, 0, h + .72, .02, w + .06, .08, .36);
  /* corner pilasters on wider houses */
  if (w > 6.5 && q > 0) for (const sx of [-1, 1]) put(BG.box, trim, sx * (w / 2 - .18), h / 2, .04, .36, h - .4, .1);
  /* roof */
  const roof = st.roof === 'mix' ? (rng() < .45 ? 'tile' : 'flat') : st.roof;
  if (roof === 'tile') { const rh = 1.6; put(BG.box, st.tile || 0xa8542e, 0, h + .2 + rh / 2, -d * .3, w + .3, .18, d * .62, 0, -.42, 0, 0); put(BG.box, st.tile || 0xa8542e, 0, h + .2 + rh / 2, -d * .7, w + .3, .18, d * .62, 0, .42, 0, 0) }
  else { put(BG.box, 0xd8d0c0, 0, h + .02, -d / 2, w - .2, .1, d - .2); if (q > 0 && rng() < .3) { put(BG.box, wall, w * .25, h + 1.1, -d * .6, 2.2, 2.2, 2.2); put(BG.box, trim, w * .25, h + 2.25, -d * .6, 2.4, .12, 2.4) } }
  if (q > 0 && rng() < (st.mirador || 0)) { const mx = (rng() - .5) * (w - 3); put(BG.box, wall, mx, h + 1.6, -1.6, 2.6, 3.2, 2.6); put(BG.box, trim, mx, h + 3.25, -1.6, 2.9, .14, 2.9); for (const sx of [-.6, .6]) putG(BG.box, 0x2a3440, mx + sx, h + 1.8, -.28, .7, 1.4, .05, 1) }
  /* openings: bays */
  const nb = w > 8.4 ? 3 : w > 5.4 ? 2 : 1, bw = w / nb, door = o.shop ? -1 : ((rng() * nb) | 0);
  const win = (x, y, ww, wh, bal) => { put(BG.box, trim, x, y, .05, ww + .34, wh + .34, .08);   /* painted surround (albero yellow, almagra red, grey) */
    const lit = rng() < .22, closed = rng() < .4; if (closed && q > 0) { put(BG.box, shut, x, y, .1, ww, wh, .06) } else (lit ? putG : put)(BG.box, lit ? 0xffd9a0 : 0x1e262c, x, y, .09, ww, wh, .04, lit ? 1 : 0);
    if (bal === 'cierro') { put(BG.box, 0xf2f0ea, x, y - wh / 2 - .08, .38, ww + .5, .14, .7); put(BG.box, 0x2a2a2a, x, y + wh / 2 + .1, .38, ww + .5, .14, .7); putG(BG.box, 0x9ab8c8, x, y, .72, ww + .4, wh, .04, 0); for (const sx of [-1, 1]) put(BG.box, 0xf2f0ea, x + sx * (ww / 2 + .22), y, .38, .06, wh, .68) }
    else if (bal) { put(BG.box, 0x9a948a, x, y - wh / 2 - .08, .32, ww + .7, .12, .6); put(BG.box, iron, x, y - wh / 2 + .48, .6, ww + .66, .04, .04); put(BG.box, iron, x, y - wh / 2 + .9, .6, ww + .7, .05, .06); if (q > 1) for (let k = 1; k < 4; k++) put(BG.box, iron, x - (ww + .66) / 2 + k * (ww + .66) / 4, y - wh / 2 + .45, .6, .03, .9, .03);
      for (const sx of [-1, 1]) put(BG.box, iron, x + sx * (ww / 2 + .33), y - wh / 2 + .45, .32, .03, .9, .56);
      if (q > 0 && rng() < (st.pots || 0)) for (const px of [-ww / 2 + .1, ww / 2 - .1]) { put(BG.box, 0xa8542e, x + px, y - wh / 2 + .12, .62, .22, .2, .12); put(BG.box, [0xd8203a, 0xe84a8a, 0xf2f0ea, 0xd85a1a][(rng() * 4) | 0], x + px, y - wh / 2 + .34, .66, .3, .2, .2) } }
    else if (st.reja) { for (const k of [-.33, 0, .33]) put(BG.box, iron, x + k * ww, y, .26, .035, wh + .2, .035); put(BG.box, iron, x, y + wh * .2, .26, ww + .2, .035, .035); put(BG.box, iron, x, y - wh / 2 - .1, .2, ww + .3, .08, .2) } };
  /* ground floor */
  if (o.hollow) { const dx = o.doorX || 0, hh = fh + .3, l0 = -w / 2, r1 = w / 2;   /* front wall with a 2 m door gap + a shop window in the wider side */
    put(BG.box, wall, (l0 + dx - 1) / 2, hh / 2, -.15, dx - 1 - l0, hh, .3); put(BG.box, wall, (dx + 1 + r1) / 2, hh / 2, -.15, r1 - dx - 1, hh, .3); put(BG.box, wall, dx, (2.7 + hh) / 2, -.15, 2, hh - 2.7, .3);
    put(BG.box, o.shopCol || 0x2a1e16, dx, 2.75, .05, 2.3, .14, .12); for (const sx of [-1, 1]) put(BG.box, o.shopCol || 0x2a1e16, dx + sx * 1.08, 1.35, .05, .14, 2.7, .12);
    const ws = dx > 0 ? [l0 + .6, dx - 1.4] : [dx + 1.4, r1 - .6]; if (ws[1] - ws[0] > 1) { put(BG.box, o.shopCol || 0x2a1e16, (ws[0] + ws[1]) / 2, 1.5, .05, ws[1] - ws[0] + .2, 2.3, .1); (o.glass || Gl).push([BG.box, 0xc8dce4, new THREE.Matrix4().multiplyMatrices(base, AV.kit.M((ws[0] + ws[1]) / 2, 1.55, .12, ws[1] - ws[0], 1.9, .04)), 0]) } }
  else if (o.shop) { put(BG.box, o.shopCol || 0x2a1e16, 0, 1.55, .07, w - .5, 3.1, .1); (o.lit ? putG : put)(BG.box, o.lit ? 0xffe2b0 : 0x3a3a34, 0, 1.45, .14, w - 1.3, 2.4, .04, o.lit ? 1 : 0) }
  else for (let b = 0; b < nb; b++) { const x = -w / 2 + bw * (b + .5); if (b === door) { put(BG.box, trim, x, 1.35, .05, 1.7, 2.9, .08); put(BG.box, pick(st.door || [0x5a3420]), x, 1.25, .1, 1.3, 2.5, .06); if (q > 0 && rng() < .35) put(BG.box, iron, x, 2.75, .12, 1.3, .3, .03) } else win(x, 1.7, Math.min(1.2, bw * .5), 1.5, false) }
  for (let f = 1; f < nf; f++) for (let b = 0; b < nb; b++) { const x = -w / 2 + bw * (b + .5), y = f * fh + 1.5, r = rng(); win(x, y, Math.min(1.1, bw * .42), 1.75, r < (st.cierro || 0) ? 'cierro' : r < (st.cierro || 0) + (st.balcony || 0) ? 'bal' : false) }
  return { base, h, nf, signY: 3.25, wall, trim } };
/* lot-local polygon (x along the local facade axis, z: 0 = facade, negative = inside) -> world polygon */
GW.localPoly = (base, pts) => { const v = new THREE.Vector3(); return pts.map(([x, z]) => { v.set(x, 0, z).applyMatrix4(base); return [v.x, v.z] }) };
GW.localPt = (base, x, z) => { const v = new THREE.Vector3(x, 0, z).applyMatrix4(base); return [v.x, v.z] };
GW.lrect = (base, x0, x1, z0, z1) => GW.localPoly(base, [[x0, z0], [x1, z0], [x1, z1], [x0, z1]]);
/* a world-space point from lot-local (u along the facade, v out of the facade towards the street, y up) */
GW.lp = (lot, u, v) => [lot.x + lot.ax * u - lot.nx * v, lot.z + lot.az * u - lot.nz * v];
})(window.AV);
