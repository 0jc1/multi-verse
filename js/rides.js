/* APEVERSE 2.1 - rides.js : HIRED RIDES THAT ACTUALLY DRIVE YOU THERE (Phase 2).
   Before: every taxi / shuttle stand (transit.js) and the map's 🚕 button faded to black and teleported you.  Now the hired vehicle is
   real: it pulls up, you get in (short step-in), and it drives you the whole way while you sit in the back seat and can look around.
     - Route: in worlds with a street map (W.mapRoads) the driver follows the ROAD network (segments split at every crossing, shortest
       path, keeps to the right-hand lane).  If you or the destination are off the roads (or a world has none) it follows the
       walkable route finder (AV.path, avoids walls) instead; hover taxis fly that route 2-3 m up.
     - Driving: accelerates, slows for corners and the kerb, stops at red / amber lights (Madrid's junction lights, traffic.js),
       stops for traffic cars and pedestrians in front (creeps on after a while so nothing deadlocks).  Engine sound + horn.
     - Time: real time, ~10 m/s in cities (a 600 m ride ≈ 1 min); very long rides go a little faster, capped near 90 s.
     - Leave (Esc / phone LEAVE): the driver pulls over and you get out where you are; the unused part of the fare is refunded.
       E / ACT: "skip to arrival" for players who don't want to watch the drive (labelled, never the default).
     - Arrival: the car stops at the kerb nearest the place, you step out beside it, it drives off.  Fare stays the same as before.
   Vehicle per world (meshes from city_life.js VB, one draw call each + a simple driver): Madrid white taxi with the red stripe,
   Chiang Mai red songthaew, Pai pickup, Da Nang xe ôm (you ride pillion), Ape Town shuttle, Koh Samui jeep, Astro-9 hover cab,
   Jungle Dub buggy, Vienna black taxi, and any world added to transit.js later.
   AV.rides = { start(dest), cancel(), skip(), cur, stats, net(W) } */
'use strict';
(function (AV) {
const tr = AV.tr, ACT = AV.act;
if (!ACT) return;
const RD = AV.rides = { cur: null, stats: { rides: 0, road: 0, path: 0, straight: 0, skipped: 0, cancelled: 0, redStops: 0, blockStops: 0, maxBlocked: 0, lastLen: 0, lastSecs: 0 } };
const VEH = {
  madrid: { vb: 'car', col: 0xf4f4f0, stripe: 0xc8202a, v: 11, eng: 'petrol' },
  vienna: { vb: 'car', col: 0x1c1c20, v: 10.5, eng: 'petrol' },
  chiang_mai: { vb: 'songthaew', col: 0xc8202a, v: 8.5, eng: 'petrol', seat: [.0, -1.6], left: true },
  pai: { vb: 'pickup', col: 0xe8e4da, v: 9, eng: 'petrol', seat: [.35, -1.5], left: true },
  da_nang: { vb: 'scooter', col: 0x2a8a3a, v: 9, eng: 'petrol', pillion: true },
  ape_town: { vb: 'songthaew', col: 0x7a4a9a, v: 7.5, eng: 'electric', seat: [0, -1.6] },
  koh_samui_jurassic: { vb: 'pickup', col: 0x6a7a3a, v: 9, eng: 'petrol', seat: [.35, -1.5], left: true },
  astro9: { vb: 'car', col: 0x4ad8ff, v: 15, eng: 'electric', hover: 2.6 },
  jungle_dub: { vb: 'pickup', col: 0x3a7a3a, v: 7.5, eng: 'petrol', seat: [.35, -1.5] },
  koh_tao: { vb: 'songthaew', col: 0x2a7ac8, v: 8.5, eng: 'petrol', seat: [0, -1.6], left: true },
  jerusalem: { vb: 'car', col: 0xf2f2ea, v: 9.5, eng: 'petrol' },
  judean_desert: { vb: 'pickup', col: 0xc8a060, v: 11, eng: 'petrol', seat: [.35, -1.5] },
  verdalux: { vb: 'car', col: 0x7aff8a, v: 12, eng: 'electric', hover: 2.2 }
};
RD.VEH = VEH;
const vehOf = W => VEH[W.id] || { vb: 'car', col: 0xe8e8e8, v: 10, eng: 'petrol' };

/* ---------------- road network: mapRoads split at crossings + T-junctions ---------------- */
function segX(a, b) { const [ax, az, bx, bz] = a, [cx, cz, dx, dz] = b, rx = bx - ax, rz = bz - az, sx = dx - cx, sz = dz - cz, den = rx * sz - rz * sx; if (Math.abs(den) < 1e-9) return null;
  const t = ((cx - ax) * sz - (cz - az) * sx) / den, u = ((cx - ax) * rz - (cz - az) * rx) / den; return [t, u] }
RD.net = function (W) {
  if (W._rideNet !== undefined) return W._rideNet; const t0 = performance.now();
  const minW = vehOf(W).vb === 'scooter' ? 3.5 : 7;   /* cars need a real street; a motorbike taxi takes the lanes too */
  const segs = (W.mapRoads || []).filter(r => (r[4] || 6) >= minW && Math.hypot(r[2] - r[0], r[3] - r[1]) > 2 && W.surface((r[0] + r[2]) / 2, (r[1] + r[3]) / 2) !== null);
  if (segs.length < 3) return (W._rideNet = null);
  const cuts = segs.map(() => [0, 1]), L = segs.map(r => Math.hypot(r[2] - r[0], r[3] - r[1]));
  for (let i = 0; i < segs.length; i++) { const a = segs[i], ax0 = Math.min(a[0], a[2]) - 3, ax1 = Math.max(a[0], a[2]) + 3, az0 = Math.min(a[1], a[3]) - 3, az1 = Math.max(a[1], a[3]) + 3;
    for (let j = i + 1; j < segs.length; j++) { const b = segs[j]; if (Math.max(b[0], b[2]) < ax0 || Math.min(b[0], b[2]) > ax1 || Math.max(b[1], b[3]) < az0 || Math.min(b[1], b[3]) > az1) continue;
      const x = segX(a, b); if (!x) continue; const ea = 2.5 / L[i], eb = 2.5 / L[j];   /* within 2.5 m past an end = a T-junction that was drawn a little short */
      if (x[0] > -ea && x[0] < 1 + ea && x[1] > -eb && x[1] < 1 + eb) { cuts[i].push(Math.min(1, Math.max(0, x[0]))); cuts[j].push(Math.min(1, Math.max(0, x[1]))) } } }
  const nodes = [], idx = new Map(), key = (x, z) => Math.round(x / 1.6) + ',' + Math.round(z / 1.6);
  const node = (x, z) => { const k = key(x, z); if (!idx.has(k)) { idx.set(k, nodes.length); nodes.push({ x, z, e: [] }) } return idx.get(k) };
  const edges = [];
  segs.forEach((r, i) => { const c = [...new Set(cuts[i].map(t => Math.round(t * 1e4) / 1e4))].sort((p, q) => p - q), w = r[4] || 6;
    for (let k = 0; k < c.length - 1; k++) { const x0 = r[0] + (r[2] - r[0]) * c[k], z0 = r[1] + (r[3] - r[1]) * c[k], x1 = r[0] + (r[2] - r[0]) * c[k + 1], z1 = r[1] + (r[3] - r[1]) * c[k + 1], l = Math.hypot(x1 - x0, z1 - z0); if (l < .4) continue;
      const a = node(x0, z0), b = node(x1, z1); if (a === b) continue; const e = { a, b, l, w }; edges.push(e); nodes[a].e.push(e); nodes[b].e.push(e) } });
  /* connected pieces: rides use the biggest one (a street drawn without a junction would otherwise strand the planner) */
  const comp = new Int32Array(nodes.length).fill(-1), size = []; for (let i = 0; i < nodes.length; i++) { if (comp[i] >= 0) continue; const k = size.length, st = [i]; comp[i] = k; let n = 0; while (st.length) { const u = st.pop(); n++; for (const e of nodes[u].e) { const v = e.a === u ? e.b : e.a; if (comp[v] < 0) { comp[v] = k; st.push(v) } } } size.push(n) }
  const main = size.indexOf(Math.max(...size)); edges.forEach(e => e.main = comp[e.a] === main);
  RD.stats.netMs = Math.round(performance.now() - t0); RD.stats.netPieces = size.length;
  return (W._rideNet = { nodes, edges, ms: RD.stats.netMs, pieces: size.length });
};
function nearestEdge(net, x, z) { let best = null; for (const e of net.edges) { if (!e.main) continue; const A = net.nodes[e.a], B = net.nodes[e.b], dx = B.x - A.x, dz = B.z - A.z, t = Math.max(0, Math.min(1, ((x - A.x) * dx + (z - A.z) * dz) / (e.l * e.l))), px = A.x + dx * t, pz = A.z + dz * t, d = Math.hypot(x - px, z - pz); if (!best || d < best.d) best = { e, t, x: px, z: pz, d } } return best }
function dijkstra(net, from, to) {   /* from / to: nearestEdge results; returns node chain incl. the two projected points */
  const n = net.nodes.length, dist = new Float64Array(n + 1).fill(Infinity), prev = new Int32Array(n + 1).fill(-1), done = new Uint8Array(n + 1), heap = [];
  const push = (i, d) => { heap.push([d, i]); let k = heap.length - 1; while (k > 0) { const p = (k - 1) >> 1; if (heap[p][0] <= heap[k][0]) break; [heap[p], heap[k]] = [heap[k], heap[p]]; k = p } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let k = 0; for (;;) { const l = 2 * k + 1, r = l + 1; let m = k; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === k) break; [heap[m], heap[k]] = [heap[k], heap[m]]; k = m } } return top };
  const fe = from.e, te = to.e, END = n;
  for (const [i, d] of [[fe.a, fe.l * from.t], [fe.b, fe.l * (1 - from.t)]]) if (d < dist[i]) { dist[i] = d; prev[i] = -2; push(i, d) }
  if (fe === te) { dist[END] = Math.abs(from.t - to.t) * fe.l; prev[END] = -2 }
  while (heap.length) { const [d, u] = pop(); if (done[u]) continue; done[u] = 1; if (u === END) break;
    if (u === te.a || u === te.b) { const dd = d + (u === te.a ? te.l * to.t : te.l * (1 - to.t)); if (dd < dist[END]) { dist[END] = dd; prev[END] = u; push(END, dd) } }
    for (const e of net.nodes[u].e) { const v = e.a === u ? e.b : e.a, dd = d + e.l; if (dd < dist[v]) { dist[v] = dd; prev[v] = u; push(v, dd) } } }
  if (!isFinite(dist[END])) return null; const chain = []; for (let u = prev[END]; u >= 0; u = prev[u]) chain.unshift(u);
  const pts = [[from.x, from.z]].concat(chain.map(i => [net.nodes[i].x, net.nodes[i].z]), [[to.x, to.z]]);
  return { pts, len: dist[END], lights: chain.map(i => net.nodes[i]) };
}
/* keep to the driving side (right; Thailand left): shift each corner by the averaged right-hand normal, a quarter of the road width (max 2.4 m) */
function keepRight(pts, off) { const out = []; for (let i = 0; i < pts.length; i++) { const p = pts[Math.max(0, i - 1)], q = pts[Math.min(pts.length - 1, i + 1)], dx = q[0] - p[0], dz = q[1] - p[1], l = Math.hypot(dx, dz) || 1; out.push([pts[i][0] - dz / l * off, pts[i][1] + dx / l * off]) } return out }
const dedupe = pts => { const o = []; for (const p of pts) if (!o.length || Math.hypot(p[0] - o[o.length - 1][0], p[1] - o[o.length - 1][1]) > .8) o.push(p); return o };

/* plan: road route if both ends are near the street network, otherwise the walkable route finder */
const dens = (pts, step) => { const o = [pts[0]]; for (let i = 1; i < pts.length; i++) { const p = o[o.length - 1], q = pts[i], L = Math.hypot(q[0] - p[0], q[1] - p[1]), n = Math.max(1, Math.ceil(L / step)); for (let k = 1; k <= n; k++) o.push([p[0] + (q[0] - p[0]) * k / n, p[1] + (q[1] - p[1]) * k / n]) } return o };
/* string-pulling: the walkable route is a 1.5-2.5 m grid path; drop every corner whose shortcut is clear for a vehicle (r .9 m),
   so rides take smooth lines instead of zigzags (fewer corner slow-downs, nicer to watch) */
const lineClear = (W, p, q) => { const L = Math.hypot(q[0] - p[0], q[1] - p[1]), n = Math.max(1, Math.ceil(L / .75)); for (let k = 1; k < n; k++) { const x = p[0] + (q[0] - p[0]) * k / n, z = p[1] + (q[1] - p[1]) * k / n; if (W.surface(x, z) === null || !AV.isFree(W, x, z, .9)) return false } return true };
const pull = (W, pts) => { if (pts.length < 3) return pts; const out = [pts[0]]; let i = 0; while (i < pts.length - 1) { let j = Math.min(pts.length - 1, i + 40); while (j > i + 1 && !lineClear(W, pts[i], pts[j])) j--; out.push(pts[j]); i = j } return out };
const walk = (W, a, b) => { let pts = null; try { pts = AV.path && AV.path.route ? AV.path.route(W, { x: a[0], z: a[1] }, { x: b[0], z: b[1] }) : null } catch (e) { pts = null } return pts && pts.length ? pull(W, [a].concat(pts.map(q => Array.isArray(q) ? q : [q.x, q.z]))) : [a, b] };
/* plan: the street network wherever it can be reached (a short walkable-route leg onto the nearest street, and off it at the end),
   otherwise the walkable route finder.  Points are densified every 2.5 m so the smoothed curve cannot cut corners into walls. */
RD.plan = function (W, a, b) {
  const net = RD.net(W), A = [a.x, a.z], B = [b.x, b.z];
  if (net) { const f = nearestEdge(net, a.x, a.z), t = nearestEdge(net, b.x, b.z);
    if (f && t && f.d < 220 && t.d < 220) { const r = dijkstra(net, f, t); if (r && r.len > 40 && r.len > f.d + t.d) { const w = Math.min(f.e.w, t.e.w), road = keepRight(dedupe(r.pts), Math.min(2.4, Math.max(1.1, w / 4)) * (vehOf(W).left ? -1 : 1));
        /* the taxi waits on the street when that is within 60 m (the step-in covers the walk to it); further away it comes to you */
        const clear = pts => { const d = dens(pts, 1.5); return d.every(p => AV.isFree(W, p[0], p[1], 1.1)) };   /* room for a car: 1.1 m either side of its centre line */
        let head = f.d <= 25 ? [] : walk(W, A, road[0]); if (head.length && !clear(head)) head = [];   /* no car-wide way out: the taxi waits on the street */
        let tail = t.d > 25 ? walk(W, road[road.length - 1], B).slice(1) : []; if (tail.length && !clear([road[road.length - 1]].concat(tail))) tail = [];   /* drop at the kerb; the GPS shows the last bit on foot */
        const pts = dedupe(dens(head.length ? head.concat(road.slice(1), tail) : road.concat(tail), 2.5)); return { how: 'road', pts, drop: pts[pts.length - 1], lights: r.lights, len: r.len, roadIn: Math.round(f.d), waits: !head.length && f.d > 3 ? Math.round(f.d) : 0 } } } }
  const w = walk(W, A, B); if (w.length >= 2) { const p = dedupe(dens(w, 2.5)); return { how: w.length > 2 ? 'path' : 'straight', pts: p, drop: p[p.length - 1] } }
  return { how: 'straight', pts: [A, B], drop: B };
};

/* ---------------- the vehicle ---------------- */
function build(W, V) {
  const CY = AV.city, g = new THREE.Group(); let body = null;
  try { if (CY && CY.VB && CY.VB[V.vb]) { const geo = V.vb === 'scooter' ? CY.VB.scooter(V.col, { rider: true }) : CY.VB[V.vb](V.col); body = new THREE.Mesh(geo, RD._mat || (RD._mat = CY.vehMat(W.ctx))); g.add(body) } } catch (e) { body = null }
  if (!body) { body = new THREE.Mesh(AV.G.box, AV.std(V.col, .4)); body.scale.set(1.8, 1.3, 4.2); body.position.y = .8; g.add(body) }
  if (V.stripe) { const s = new THREE.Mesh(AV.G.box, AV.std(V.stripe, .5)); s.scale.set(1.76, .09, 3.2); s.position.set(0, .62, .05); g.add(s); const sign = new THREE.Mesh(AV.G.box, AV.std(0x3ad06a, .4, 0, 0x3ad06a, .9)); sign.scale.set(.45, .16, .1); sign.position.set(0, 1.5, -.3); g.add(sign) }
  if (!V.pillion) { const skin = AV.std(0xc8946a, .7), shirt = AV.std(W.id === 'astro9' || W.id === 'verdalux' ? 0x8a8a9a : 0x2a4a6a, .7);   /* the driver, front left */
    const ks = V.left ? 1 : -1, dx = V.vb === 'car' ? -ks * .4 : V.vb === 'songthaew' || V.vb === 'pickup' ? -ks * .4 : 0, dz = V.vb === 'car' ? .15 : V.vb === 'songthaew' ? 1.9 : V.vb === 'pickup' ? 1.0 : .4, y = V.vb === 'car' ? .42 : 1.0;
    const t = new THREE.Mesh(AV.G.box, shirt); t.scale.set(.42, .5, .26); t.position.set(dx, y + .25, dz); g.add(t); const h = new THREE.Mesh(new THREE.SphereGeometry(.13, 10, 8), skin); h.position.set(dx, y + .64, dz); g.add(h) }
  if (V.hover) { const glow = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.3, .08, 20), AV.std(0x1a1a2a, .3, .5, 0x4ad8ff, 1.2)); glow.position.y = .05; glow.scale.set(1, 1, 2); g.add(glow) }
  AV.lin && AV.lin(g); g.traverse(o => { if (o.isMesh) { o.castShadow = false; o.userData.rideVeh = 1 } }); return g;
}
function engine(V) { const A = AV.audio; if (!A || !A.ok || A.mute || !A.ctx) return null; try { const c = A.ctx, o = c.createOscillator(), o2 = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain(), el = V.eng === 'electric';
  o.type = el ? 'sine' : 'sawtooth'; o2.type = el ? 'triangle' : 'square'; f.type = 'lowpass'; f.frequency.value = el ? 1600 : 380; g.gain.value = 0; o.connect(f); o2.connect(f); f.connect(g); g.connect(A.mediaBus || c.destination); o.start(); o2.start(); return { o, o2, g, el } } catch (e) { return null } }
function engineSet(e, v, top) { if (!e) return; const t = AV.audio.ctx.currentTime, u = Math.min(1, Math.abs(v) / top);
  if (e.el) { e.o.frequency.setTargetAtTime(260 + u * 700, t, .1); e.o2.frequency.setTargetAtTime(130 + u * 350, t, .1); e.g.gain.setTargetAtTime(.008 + u * .02, t, .1) }
  else { e.o.frequency.setTargetAtTime(36 + u * 62, t, .08); e.o2.frequency.setTargetAtTime(18 + u * 31, t, .08); e.g.gain.setTargetAtTime(.035 + u * .04, t, .12) } }
function engineStop(e) { if (!e) return; try { const t = AV.audio.ctx.currentTime; e.g.gain.setTargetAtTime(0, t, .1); e.o.stop(t + .5); e.o2.stop(t + .5) } catch (x) { } }
const horn = () => { const A = AV.audio; if (A && A.blip) { A.blip(420, .28, 'square', .06); A.blip(530, .28, 'square', .045) } };

/* ---------------- the ride (an AV.act activity: one at a time, Leave = pull over) ---------------- */
ACT.register('taxiride', {
  btn: ['Arrive', 'Llegar'],
  hud: s => { const r = s.r, left = Math.max(0, r.len - r.s), eta = Math.round(left / Math.max(4, r.vmax * .8));
    return '<b>' + s.icon + ' ' + s.title + '</b><br>' + tr('To ', 'A ') + s.name + ' · ' + (left > 999 ? (left / 1000).toFixed(1) + ' km' : Math.round(left) + ' m') + ' · ~' + eta + ' s' +
      '<br><small>' + (r.wait ? '⏸ ' + r.wait + ' · ' : '') + tr('Mouse looks around · C view · F / ARRIVE skips the drive · Esc pulls over', 'Ratón para mirar · C vista · F / LLEGAR salta el viaje · Esc para y bajas') + '</small>' },
  press: (s, v) => { if (v) RD.skip() },
  start: s => { s.lastHud = 0 },
  update: (s, dt, t) => tick(s, dt, t),
  end: (s, why) => finish(s, why)
});
RD.start = function (o) {   /* o = { x, z, name, price, icon, title } ; fare already paid by the caller */
  const W = AV.W; if (!W || ACT.cur || RD.cur) return false; const P = AV.P, V = vehOf(W);
  const plan = RD.plan(W, { x: P.x, z: P.z }, { x: o.x, z: o.z }); if (plan.pts.length < 2) return false;
  const curve = new THREE.CatmullRomCurve3(plan.pts.map(p => new THREE.Vector3(p[0], 0, p[1])), false, 'centripetal', .5), len = curve.getLength();
  const top = Math.max(V.v, Math.min(V.v * 2.2, len / 80));   /* long rides a bit faster: about 90 s at most */
  const veh = build(W, V), T0 = curve.getTangentAt(0); veh.position.set(plan.pts[0][0], (W.surface(plan.pts[0][0], plan.pts[0][1]) || 0) + (V.hover || 0), plan.pts[0][1]); veh.rotation.y = Math.atan2(T0.x, T0.z); W.group.add(veh); AV.P.yaw = veh.rotation.y + Math.PI; AV.P.pitch = 0;
  const lights = (plan.lights || []).map(n => ({ x: n.x, z: n.z, s: null, done: false }));
  const r = { chase: !(V.vb === 'songthaew' || V.vb === 'pickup'), W, V, veh, curve, len, s: 0, v: 0, vmax: top, how: plan.how, lights, price: o.price || 0, blocked: 0, wait: '', eng: engine(V), dest: { x: o.x, z: o.z }, drop: plan.drop, t0: AV.now() };
  /* arc length of each light along the curve (sampled) */
  if (lights.length) { const N = Math.max(40, Math.round(len / 2)); for (let i = 0; i <= N; i++) { const p = curve.getPointAt(i / N); for (const L of lights) { const d = Math.hypot(p.x - L.x, p.z - L.z); if (L.s == null || d < L.best) { L.best = d; L.s = i / N * len } } } }
  RD.cur = r; RD.stats.rides++; RD.stats[plan.how]++; RD.stats.lastLen = Math.round(len); AV.fadeTo(1, 220);
  const ok = ACT.start('taxiride', { r, name: o.name, icon: o.icon || '🚕', title: o.title || tr('Taxi', 'Taxi') }); if (!ok) { W.group.remove(veh); RD.cur = null; AV.fadeTo(0, 200); return false }
  setTimeout(() => AV.fadeTo(0, 380), 260); horn(); AV.toast((o.icon || '🚕') + ' ' + (plan.waits > 12 ? tr('Your ride waits on the main street (' + plan.waits + ' m) — you walk over and get in. ', 'Te espera en la calle principal (' + plan.waits + ' m): vas andando y subes. ') : tr('You get in. ', 'Subes. ')) + (plan.how === 'road' ? tr('The driver takes the streets: ', 'El conductor va por las calles: ') : tr('Off we go: ', 'En marcha: ')) + Math.round(len) + ' m');
  return true;
};
function aheadBlocked(r, x, z, hx, hz) { const W = r.W, look = 3.5 + r.v * .7, test = (px, pz, rad) => { const rx = px - x, rz = pz - z, al = rx * hx + rz * hz, sd = Math.abs(rx * -hz + rz * hx); return al > 1.5 && al < look + 2 && sd < 1.1 + rad };
  if (r.V.hover) return null;
  if (AV.dynBlock) { for (const k of [3, 6]) if (AV.dynBlock(x + hx * (k + r.v * .3), z + hz * (k + r.v * .3), .9)) return tr('traffic ahead', 'tráfico delante') }
  for (const cr of (W.ctx && W.ctx.crowds) || []) for (const w of cr.list || []) if (w.vis !== false && w.x != null && Math.abs(w.x - x) < 10 && Math.abs(w.z - z) < 10 && test(w.x, w.z, .3)) return tr('pedestrian crossing', 'peatón cruzando');
  return null }
function tick(s, dt, t) {
  const r = RD.cur; if (!r || r.W !== AV.W) return; const P = AV.P, W = r.W, left = r.len - r.s;
  const u = Math.min(1, r.s / r.len), p = r.curve.getPointAt(u), tg = r.curve.getTangentAt(u), yaw = Math.atan2(tg.x, tg.z);
  /* corner speed: compare the heading 9 m ahead */
  const u2 = Math.min(1, (r.s + 9) / r.len), tg2 = r.curve.getTangentAt(u2); let turn = Math.abs(Math.atan2(tg2.x, tg2.z) - yaw); if (turn > Math.PI) turn = 2 * Math.PI - turn;
  let target = Math.min(r.vmax, Math.max(3.2, r.vmax * (1 - turn / 1.5)), Math.sqrt(2 * 3.2 * Math.max(0, left)) + .3); r.wait = '';
  /* traffic lights (Madrid): stop before the junction on amber / red */
  const TF = AV.traffic; if (TF && TF.S && TF.S.W === W && r.lights.length) for (const L of r.lights) { if (L.done || L.s == null) continue; const d = L.s - r.s; if (d < -2) { L.done = true; continue } if (d > 20) continue;
    const tn = L.tn !== undefined ? L.tn : (L.tn = (TF.net.nodes.find(n => n.light && Math.hypot(n.x - L.x, n.z - L.z) < 4) || null)); if (!tn) { L.done = true; continue }
    const axis = Math.abs(tg.x) > Math.abs(tg.z) ? 'x' : 'z', ph = AV.traffic.phaseOf(tn, axis, TF.S.t), stopAt = d - 6.5; if (ph === 0 || stopAt < -.5) { if (stopAt < -.5) L.done = true; continue }
    if (!L.counted) { L.counted = true; RD.stats.redStops++ } target = Math.min(target, stopAt < .3 ? 0 : Math.sqrt(2 * 4 * stopAt)); r.wait = tr('red light', 'semáforo en rojo'); break }
  const blk = aheadBlocked(r, p.x, p.z, Math.sin(yaw), Math.cos(yaw));
  /* traffic: wait up to 7 s; people (instanced crowds never step aside): honk, wait 3 s, then creep through at walking pace */
  const maxWait = blk === tr('traffic ahead', 'tráfico delante') ? 7 : 3;
  const edging = maxWait === 3 && AV.now() < (r.edgeUntil || 0);   /* busy walking lane: once the driver has edged through, it keeps rolling slowly for 8 s instead of stopping for every person */
  if (blk && edging) { target = Math.min(target, 2.2); r.wait = tr('edging through the crowd', 'avanzando entre la gente'); r.blocked = 0 }
  else if (blk) { if (maxWait === 3) { r.pedWait = (r.pedWait || 0) + dt; if (r.pedWait > 3) { r.edgeUntil = AV.now() + 8; r.pedWait = 0 } }   /* stop-start in a crowd adds up: 3 s in total also switches to edging */
    r.blocked += dt; RD.stats.maxBlocked = Math.max(RD.stats.maxBlocked, r.blocked); if (r.blocked < maxWait) { if (!r.blockCounted) { r.blockCounted = true; RD.stats.blockStops++ } target = 0; r.wait = blk; if (r.blocked > 1.2 && !r.honked) { r.honked = true; horn() } } else { target = Math.min(target, 2.2); r.wait = tr('edging past', 'pasando despacio'); if (maxWait === 3) r.edgeUntil = AV.now() + 8 } }
  else { r.blocked = 0; r.honked = false; r.blockCounted = false; r.pedWait = Math.max(0, (r.pedWait || 0) - dt * .3) }
  r.v += Math.max(-7 * dt, Math.min(2.6 * dt, target - r.v)); r.s = Math.min(r.len, r.s + r.v * dt); engineSet(r.eng, r.v, r.vmax);
  const gy = W.surface(p.x, p.z), y = (gy == null ? (r.y || 0) : gy) + (r.V.hover ? r.V.hover + Math.sin(t * 2) * .08 : 0); r.y = y;
  r.veh.position.set(p.x, y + (r.V.hover ? 0 : Math.sin(t * 13) * .01 * Math.min(1, r.v / 4)), p.z); r.veh.rotation.y = yaw;
  /* passenger seat (back right; pillion behind the rider on a motorbike), eye ~1.2 m when seated */
  const ks = r.V.left ? 1 : -1, seat = r.V.pillion ? [0, -.45] : r.V.seat ? [r.V.seat[0] * ks, r.V.seat[1]] : [ks * .42, -.55], sx = Math.cos(yaw) * seat[0] + Math.sin(yaw) * seat[1], sz = -Math.sin(yaw) * seat[0] + Math.cos(yaw) * seat[1];
  P.x = p.x + sx; P.z = p.z + sz; P.y = y; P.vx = P.vz = P.vy = 0;
  /* view: chase camera behind the vehicle (default for cars, hover cabs, motorbikes) or the seat (open-back pickups / songthaews); C toggles.
     The chase view follows the vehicle's turns unless you are looking around with the mouse (then it waits 1.5 s). */
  const now = AV.now(); if (r.lastYaw != null && Math.abs(P.yaw - r.lastYaw) > 1e-4) r.userT = now;
  if (now - (r.userT || -9) > 1.5) { let dy = (yaw + Math.PI) - P.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); P.yaw += dy * Math.min(1, dt * 2.2) }
  if (r.chase) { const fx = -Math.sin(P.yaw), fz = -Math.cos(P.yaw); let dist = 7.2; for (; dist > 2.4; dist -= .6) { const cx = p.x - fx * dist, cz = p.z - fz * dist; if (W.surface(cx, cz) !== null && AV.isFree(W, cx, cz, .2)) break }
    AV.cam.position.set(p.x - fx * dist, y + 2.9, p.z - fz * dist); AV.cam.lookAt(p.x + fx * 4, y + 1.1, p.z + fz * 4) }
  else AV.cam.position.set(P.x, y + (r.V.pillion ? 1.45 : r.V.vb === 'car' ? 1.12 : 1.3), P.z);
  r.lastYaw = P.yaw;
  if (AV.now() - (s.lastHud || 0) > .5) { s.lastHud = AV.now(); ACT.draw() }
  if (r.s >= r.len - .05 && r.v < .4) { r.arrived = true; ACT.end('arrive') }
}
function finish(s, why) {
  const r = RD.cur; if (!r) return; RD.cur = null; engineStop(r.eng); RD.stats.lastSecs = Math.round(AV.now() - r.t0); const W = r.W, P = AV.P;
  if (why === 'leave' && !r.arrived) { RD.stats.cancelled++; const back = r.price ? Math.floor(r.price * Math.max(0, 1 - r.s / r.len)) : 0; if (back > 0) AV.txn(back, tr('Taxi: refund for the unused part', 'Taxi: devolución de la parte no usada'));
    AV.toast(tr('The driver pulls over. You get out here.', 'El conductor para. Te bajas aquí.') + (back ? ' +' + back : '')) }
  if (why === 'world') { try { W.group.remove(r.veh) } catch (e) { } return }
  /* step out on the kerb side: try right of the car, then left, then behind */
  const yaw = r.veh.rotation.y, ks = r.V.left ? 1 : -1, out = [[1.9 * ks, 0], [-1.9 * ks, 0], [0, -3.2], [2.6 * ks, 1.5]].map(([a, b]) => [r.veh.position.x + Math.cos(yaw) * a + Math.sin(yaw) * b, r.veh.position.z - Math.sin(yaw) * a + Math.cos(yaw) * b]);
  let spot = out.find(q => W.surface(q[0], q[1]) !== null && AV.isFree(W, q[0], q[1], .5)) || (AV.safeSpot ? AV.safeSpot(W, r.veh.position.x, r.veh.position.z) : [P.x, P.z]);
  P.x = spot[0]; P.z = spot[1]; P.y = W.surface(spot[0], spot[1]) || 0; P.vx = P.vz = P.vy = 0; P.yaw = Math.atan2(-(r.dest.x - P.x), -(r.dest.z - P.z));
  if (why === 'arrive' || why === 'skip') { AV.toast((s.icon || '🚕') + ' ' + tr('You arrive at ', 'Llegas a ') + s.name + (r.price ? ' · ' + r.price + tr(' credits', ' créditos') : ''));
    if (Math.hypot(r.dest.x - P.x, r.dest.z - P.z) > 18 && AV.minimap && AV.minimap.setDest) try { AV.minimap.setDest(r.dest.x, r.dest.z, s.name) } catch (e) { } }
  AV.S.time = Math.min(24 * 60 - 1, AV.S.time + Math.max(2, Math.round(r.len / 150)));
  /* the car drives off and disappears */
  const veh = r.veh, c = r.curve; let k = 0; const away = () => { k += 1 / 30; veh.position.x += Math.sin(veh.rotation.y) * .35; veh.position.z += Math.cos(veh.rotation.y) * .35; if (k < 2.5 && AV.W === W) requestAnimationFrame(away); else try { W.group.remove(veh) } catch (e) { } };
  setTimeout(away, 900); AV.hud && AV.hud(); AV.save();
}
RD.skip = function () { const r = RD.cur; if (!r || !ACT.cur || ACT.cur.id !== 'taxiride') return; RD.stats.skipped++; AV.fadeTo(1, 250); setTimeout(() => { if (RD.cur !== r) return; r.s = r.len; const p = r.curve.getPointAt(1), tg = r.curve.getTangentAt(1); r.veh.position.set(p.x, r.veh.position.y, p.z); r.veh.rotation.y = Math.atan2(tg.x, tg.z); r.arrived = true; ACT.end('skip'); AV.fadeTo(0, 400) }, 270) };
RD.cancel = () => { if (ACT.cur && ACT.cur.id === 'taxiride') ACT.end('leave') };
addEventListener('keydown', e => { if (!ACT.cur || ACT.cur.id !== 'taxiride' || AV.blocking()) return; if (e.code === 'KeyE') { e.stopImmediatePropagation(); RD.skip() } else if (e.code === 'KeyC' && RD.cur) { e.stopImmediatePropagation(); RD.cur.chase = !RD.cur.chase } }, true);
RD.view = chase => { if (RD.cur) RD.cur.chase = chase == null ? !RD.cur.chase : !!chase };

/* ---------------- transit.js stands + the map's taxi button now use the real ride ---------------- */
const TR = AV.transit;
if (TR) { const go0 = TR.go; TR.go0 = go0;
  TR.go = function (x, z, name, price) { const W = AV.W; if (!W) return false; if (RD.cur) return false; if (ACT.cur && ACT.cur.id === 'ride') ACT.end('leave'); if (ACT.cur) return false;
    if (price && !AV.txn(-price, 'Taxi: ' + name)) return false; AV.closePanel && AV.closePanel('cmp');
    const c = (TR.CFG && TR.CFG[W.id]) || {}, ok = RD.start({ x, z, name, price, icon: c.taxi ? c.taxi.icon : '🚕', title: c.taxi ? tr(c.taxi.n[0], c.taxi.n[1]) : 'Taxi' });
    if (!ok) { if (price) AV.txn(price, 'Taxi refund'); return go0.call(TR, x, z, name, 0) }   /* could not plan a drive: old fade ride, free */
    TR.rides = (TR.rides || 0) + 1; return true } }
const prevE = AV.onWorldEnter; AV.onWorldEnter = function (W) { if (prevE) prevE(W); RD.cur = null };
})(window.AV);
