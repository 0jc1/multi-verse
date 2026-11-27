/* APEVERSE 2.2 GLOBAL WORLDS: offline street-network check for a gw_kit city plan (no browser, no THREE).
   node tools/tests/gw_net_check.cjs [plan=sevilla] [out.png]
   Builds the network, lots and the walking graph, prints the connectivity report (components, raster reach from the arrival,
   ACCIDENTAL dead ends, intentional callejones, walkable cells touching the map edge) and multi-route checks between landmarks,
   and writes a PNG map (streets grey, plazas light, open ground ochre, water blue, landmarks red, lots by colour, filler dark).
   Exit code 1 if a gate fails. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), zlib = require('zlib');
const plan = process.argv[2] || 'sevilla', out = process.argv[3] || path.join(process.env.TEMP || '/tmp', 'gw_' + plan + '_net.png');
const root = path.join(__dirname, '..', '..');
const ctx = { console, Math, Map, Set, Uint8Array, Int32Array, Float32Array }; ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
ctx.window.AV = {};
for (const f of ['js/gw_kit.js', 'js/' + plan + '_plan.js']) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
const AV = ctx.AV, GW = AV.gwkit, PLAN = AV[plan + 'Plan'];
const t0 = Date.now(), N = PLAN.net(), t1 = Date.now();
const lots = N.lots(GW.rng(7), { wmin: 6, wmax: 11, dmax: 13 }), fill = N.filler(), t2 = Date.now();
const G = N.graph(), rep = N.check([PLAN.arrival.x, PLAN.arrival.z]), t3 = Date.now();
const gates = [];
const gate = (name, ok, info) => { gates.push([name, ok]); console.log((ok ? 'PASS ' : 'FAIL ') + name + (info != null ? '  · ' + info : '')) };
console.log('build ' + (t1 - t0) + ' ms · lots ' + (t2 - t1) + ' ms · graph+check ' + (t3 - t2) + ' ms');
console.log('streets ' + N.streets.length + ' · plazas ' + N.plazas.length + ' · lots ' + lots.length + ' · filler rects ' + fill.length + ' (visible ' + fill.filter(f => f.vis).length + ')');
gate('one connected walking graph', rep.components === 1, rep.components + ' components, main ' + (rep.mainFrac * 100).toFixed(1) + '%' + (rep.islands.length ? ' islands ' + JSON.stringify(rep.islands.slice(0, 6)) : ''));
gate('walkable ground reachable from the arrival', rep.reachFrac > .985, (rep.reachFrac * 100).toFixed(2) + '% of ' + rep.walkM2 + ' m2' + (rep.pockets.length ? ' pockets ' + JSON.stringify(rep.pockets.slice(0, 8)) : ''));
gate('no accidental dead ends', rep.deadEnds.length === 0, rep.deadEnds.length ? JSON.stringify(rep.deadEnds) : 'intentional callejones: ' + JSON.stringify(rep.culs));
gate('no street silently cut by a landmark', rep.splits.length === 0, rep.splits.length ? JSON.stringify(rep.splits) : '');
gate('no invisible walls (walkable ground at the map edge)', rep.edgeCells === 0, rep.edgeCells + ' cells');
/* routes: BFS shortest path on the graph between landmark pairs; and a SECOND route avoiding the first route's middle edges (loops) */
const near = (x, z) => N.nearNode(x, z);
function sp(a, b, ban) { const prev = new Int32Array(G.nodes.length).fill(-1), dist = new Float64Array(G.nodes.length).fill(1e18); dist[a] = 0; const Q = [[0, a]];
  while (Q.length) { Q.sort((p, q) => p[0] - q[0]); const [d, u] = Q.shift(); if (d > dist[u]) continue; if (u === b) break; for (const v of G.links[u]) { if (ban && ban.has(u < v ? u + ',' + v : v + ',' + u)) continue; const nd = d + Math.hypot(G.nodes[u][0] - G.nodes[v][0], G.nodes[u][1] - G.nodes[v][1]); if (nd < dist[v]) { dist[v] = nd; prev[v] = u; Q.push([nd, v]) } } }
  if (dist[b] >= 1e18) return null; const p = []; for (let u = b; u >= 0; u = prev[u]) p.push(u); return { len: dist[b], p: p.reverse() } }
for (const [an, a, bn, b] of PLAN.routes || []) { const A = near(a[0], a[1]), Bn = near(b[0], b[1]), r1 = sp(A, Bn); if (!r1) { gate('route ' + an + ' -> ' + bn, false, 'no path'); continue }
  const ban = new Set(); const m = r1.p.length; for (let i = Math.floor(m * .3); i < Math.floor(m * .7); i++) { const u = r1.p[i], v = r1.p[i + 1]; ban.add(u < v ? u + ',' + v : v + ',' + u) }
  const r2 = sp(A, Bn, ban); const straight = Math.hypot(b[0] - a[0], b[1] - a[1]);
  gate('route ' + an + ' -> ' + bn + ' (+ an alternative)', !!r2 && r1.len < straight * 2.2, Math.round(r1.len) + ' m (straight ' + Math.round(straight) + ') · alt ' + (r2 ? Math.round(r2.len) + ' m' : 'NONE')) }
/* PNG */
const S = 2, W = Math.ceil(N.nx / S), H = Math.ceil(N.nz / S), img = Buffer.alloc((W * 3 + 1) * H);
const lotCol = id => [150 + (id * 53) % 90, 120 + (id * 31) % 80, 100 + (id * 17) % 70];
for (let j = 0; j < H; j++) { img[j * (W * 3 + 1)] = 0; for (let i = 0; i < W; i++) { const k = (j * S) * N.nx + i * S, c = N.R[k], cl = N.CL[k]; let rgb;
    if (c === 0) rgb = cl ? lotCol(cl) : [70, 60, 55]; else if (c === 1) rgb = N.Wk[k] ? [205, 200, 190] : [170, 165, 155]; else if (c === 2) rgb = N.Wk[k] ? [240, 235, 215] : [200, 195, 180]; else if (c === 3) rgb = [215, 180, 110]; else if (c === 4) rgb = [60, 110, 170]; else if (c === 5) rgb = [190, 50, 40]; else if (c === 6) rgb = [120, 120, 130]; else if (c === 8) rgb = [250, 220, 120]; else rgb = [255, 0, 255];
    img.set(rgb, j * (W * 3 + 1) + 1 + i * 3) } }
for (const e of G.edges) { const a = G.nodes[e[0]], b = G.nodes[e[1]], n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / (N.c * S)); for (let t = 0; t <= n; t++) { const x = Math.floor(((a[0] + (b[0] - a[0]) * t / n) - N.x0) / N.c / S), z = Math.floor(((a[1] + (b[1] - a[1]) * t / n) - N.z0) / N.c / S); if (x >= 0 && z >= 0 && x < W && z < H) img.set([30, 140, 60], z * (W * 3 + 1) + 1 + x * 3) } }
for (const d of rep.deadEnds) { const x = Math.floor((d.at[0] - N.x0) / N.c / S), z = Math.floor((d.at[1] - N.z0) / N.c / S); for (let a = -4; a <= 4; a++) for (let b = -4; b <= 4; b++) if (x + a >= 0 && z + b >= 0 && x + a < W && z + b < H) img.set([255, 0, 255], (z + b) * (W * 3 + 1) + 1 + (x + a) * 3) }
const crcT = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcT[n] = c >>> 0 }
const crc = b => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 };
const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]), c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]) };
const ih = Buffer.alloc(13); ih.writeUInt32BE(W, 0); ih.writeUInt32BE(H, 4); ih[8] = 8; ih[9] = 2;
fs.writeFileSync(out, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(img)), chunk('IEND', Buffer.alloc(0))]));
console.log('map: ' + out);
process.exitCode = gates.every(g => g[1]) ? 0 : 1;
