/* APEVERSE 2.0 - traffic.js : M7C. NPC traffic on a world's real road network (first: Madrid's street grid).
   - Graph: every road segment of W.mapRoads [x0,z0,x1,z1,w] wide enough for cars becomes two directed lanes (right-hand
     traffic, lane centre a quarter of the road width from the middle); endpoints snap into intersection nodes.
   - Traffic lights at every junction of 3+ roads: north-south and east-west phases (green 11 s, amber 3 s, all-red 1.5 s),
     visible lamps on poles at the corners (instanced, coloured by the live phase), drawn near the player only.
   - Cars follow their lane, keep a bumper-to-bumper gap to the car ahead (same lane, or just past the junction), stop at
     the stop line on red / amber, turn through junctions on a smooth curve, never U-turn unless it is a dead end.
   - They stop for people: you on foot, your vehicle (also a solid obstacle for your car: AV.dynBlock), crowd pedestrians
     and ambient people in the lane ahead; a short horn if you stand in the way.
   - Streaming: a fixed pool (Low 12 / Medium 26 / High 38) lives in a bubble around you; cars that fall behind beyond
     230 m respawn on a lane 70-190 m away, preferably out of sight. One instanced mesh per vehicle type.
   - Replaces the older looping avenue traffic in worlds that opt in (those meshes are hidden).
   AV.traffic = { net, cars, lights, phase(node), blockAt(), stats } */
'use strict';
(function (AV) {
const tr = AV.tr, TAU = Math.PI * 2;
const CFG = { madrid: { minW: 10, n: [12, 26, 38], mix: [['car', .72, [0xffffff, 0xe8e8ea, 0x2a2a2e, 0x8a1a1a, 0x1a3a6a, 0x8a8a8e, 0xd8b04a, 0x3a5a3a]], ['pickup', .1, [0xe8e8ea, 0x2a4a8a]], ['scooter', .18, [0xc83a2a, 0x2a2a2e, 0xe8e4da, 0x2a6ad8]]], speed: [8.5, 11.5], hideOld: true } };
const T = AV.traffic = { stats: {} };
const GREEN = 11, AMBER = 3, ALLRED = 1.5, CYCLE = 2 * (GREEN + AMBER + ALLRED);
/* phase for an approach axis ('x' = travelling along x, 'z' = along z): 0 green, 1 amber, 2 red */
T.phaseOf = (node, axis, t) => { const u = ((t + node.off) % CYCLE + CYCLE) % CYCLE, half = GREEN + AMBER + ALLRED, mine = axis === 'z' ? u < half : u >= half, v = u % half; return !mine ? 2 : v < GREEN ? 0 : v < GREEN + AMBER ? 1 : 2 };

function buildNet(W, cfg) { const key = (x, z) => Math.round(x * 2) + ',' + Math.round(z * 2), nodes = [], idx = new Map(), node = (x, z) => { const k = key(x, z); if (!idx.has(k)) { idx.set(k, nodes.length); nodes.push({ x, z, out: [], deg: 0, light: false, off: 0 }) } return nodes[idx.get(k)] };
  const lanes = [];
  for (const r of W.mapRoads || []) { const [x0, z0, x1, z1, w] = r, L = Math.hypot(x1 - x0, z1 - z0); if ((w || 6) < cfg.minW || L < 8) continue; if (Math.abs(x1 - x0) > .5 && Math.abs(z1 - z0) > .5) continue;   /* axis-aligned streets only */
    const a = node(x0, z0), b = node(x1, z1); a.deg++; b.deg++;
    for (const [p, q] of [[a, b], [b, a]]) { const dx = (q.x - p.x) / L, dz = (q.z - p.z) / L, off = (w || 12) / 4; lanes.push({ a: p, b: q, L, dx, dz, rx: -dz, rz: dx, off, w: w || 12, axis: Math.abs(dx) > .5 ? 'x' : 'z', cars: [] }); p.out.push(lanes[lanes.length - 1]) } }
  nodes.forEach((n, i) => { n.light = n.deg >= 3; n.off = (i * 7.3) % CYCLE });
  return { nodes, lanes } }

const v3 = new THREE.Vector3(), q4 = new THREE.Quaternion(), m4 = new THREE.Matrix4(), s3 = new THREE.Vector3(1, 1, 1), ZERO = new THREE.Matrix4().makeScale(0, 0, 0), col = new THREE.Color();
let S = null;   /* per-world state */
function setup(W) { const cfg = CFG[W.id]; if (!cfg || !W.mapRoads || !AV.city || !AV.city.VB) return; const t0 = performance.now(), net = buildNet(W, cfg); if (!net.lanes.length) return;
  const q = (W.ctx && W.ctx.q) || 0, N = cfg.n[q], mat = AV.city.vehMat ? AV.city.vehMat(W.ctx) : new THREE.MeshStandardMaterial({ vertexColors: true }), VLEN = { car: 4.5, pickup: 5.4, scooter: 1.9 };
  const types = cfg.mix.map(([k, share, cols]) => ({ k, n: Math.max(1, Math.round(N * share)), cols })), meshes = {}, cars = [];
  for (const ty of types) { const im = new THREE.InstancedMesh(AV.city.VB[ty.k](0xffffff), mat, ty.n); im.name = 'traffic2_' + ty.k; im.frustumCulled = false; W.ctx.group.add(im); meshes[ty.k] = im;
    for (let i = 0; i < ty.n; i++) { im.setColorAt(i, col.setHex(ty.cols[(i * 3 + 1) % ty.cols.length]).convertSRGBToLinear()); cars.push({ im, i, k: ty.k, len: VLEN[ty.k] || 4.5, vmax: cfg.speed[0] + ((i * 37) % 10) / 10 * (cfg.speed[1] - cfg.speed[0]) * (ty.k === 'scooter' ? .9 : 1), v: 0, lane: null, s: 0, turn: null, x: 0, z: 0, yaw: 0, id: cars.length }) } if (im.instanceColor) im.instanceColor.needsUpdate = true }
  /* lights: up to 4 poles per junction, drawn for the 60 junctions nearest to you */
  const LN = 60, poleG = new THREE.CylinderGeometry(.07, .07, 3.4, 6).translate(0, 1.7, 0), headG = new THREE.BoxGeometry(.32, .32, .16).translate(0, 3.3, 0);
  const poles = new THREE.InstancedMesh(poleG, new THREE.MeshStandardMaterial({ color: 0x2a2e2a, roughness: .6 }), LN * 4), heads = new THREE.InstancedMesh(headG, new THREE.MeshBasicMaterial({ color: 0xffffff }), LN * 4); poles.frustumCulled = heads.frustumCulled = false; poles.name = 'traffic2_poles'; heads.name = 'traffic2_lamps'; W.ctx.group.add(poles); W.ctx.group.add(heads);
  for (let i = 0; i < LN * 4; i++) heads.setColorAt(i, col.setHex(0xff2020)); heads.instanceColor.needsUpdate = true;
  if (cfg.hideOld) W.group.traverse(o => { if (o.isInstancedMesh && /^traffic_/.test(o.name)) { o.visible = false; T.stats.hidOld = (T.stats.hidOld || 0) + 1 } });
  S = { W, cfg, net, cars, meshes, poles, heads, lightNodes: [], t: 0, ms: Math.round(performance.now() - t0) };
  Object.assign(T, { net, cars, S }); T.stats.nodes = net.nodes.length; T.stats.lanes = net.lanes.length; T.stats.lights = net.nodes.filter(n => n.light).length; T.stats.cars = cars.length; T.stats.ms = S.ms; T.stats.violations = 0; T.stats.respawns = 0; T.stats.stopsForPeople = 0;
  for (const c of cars) spawn(c, true);
  W.ctx.upd.push((dt) => tick(Math.min(dt, .1)));
  W.ctx.leave.push(() => { S = null; T.net = null; T.cars = [] }) }

/* lane geometry */
const posOn = (ln, s) => [ln.a.x + ln.dx * s + ln.rx * ln.off, ln.a.z + ln.dz * s + ln.rz * ln.off];
const STOPBACK = ln => ln.w / 2 + 2.2;   /* stop line: before the crossing road's half-width + crosswalk */
function spawn(c, initial) { const P = AV.P, L = S.net.lanes; let best = null;
  for (let k = 0; k < 40; k++) { const ln = L[(Math.random() * L.length) | 0], s = 6 + Math.random() * Math.max(1, ln.L - 12), [x, z] = posOn(ln, s), d = Math.hypot(x - P.x, z - P.z); if (d > 190 || d < (initial ? 12 : 70)) continue;
    const behind = (-Math.sin(P.yaw) * (x - P.x) + -Math.cos(P.yaw) * (z - P.z)) < 0; if (ln.cars.some(o => Math.abs(o.s - s) < 9)) continue; best = { ln, s }; if (behind || initial) break }
  if (c.lane) { const i = c.lane.cars.indexOf(c); if (i >= 0) c.lane.cars.splice(i, 1) } if (!best) { c.lane = null; c.im.setMatrixAt(c.i, ZERO); return } c.lane = best.ln; c.s = best.s; c.turn = null; c.next = null; c.v = c.vmax * .6; best.ln.cars.push(c); [c.x, c.z] = posOn(best.ln, best.s); c.yaw = Math.atan2(best.ln.dx, best.ln.dz);   /* position now: a stale (0,0) made it look 230 m away and respawn forever */ if (!initial) T.stats.respawns++ }
function nextLane(ln) { const outs = ln.b.out.filter(o => o.b !== ln.a); const pool = outs.length ? outs : ln.b.out; if (!pool.length) return null; const st = pool.find(o => o.axis === ln.axis && o.dx === ln.dx && o.dz === ln.dz); return Math.random() < .55 && st ? st : pool[(Math.random() * pool.length) | 0] }
/* obstacle in front: you, your vehicle, crowd pedestrians, ambient people */
function blockedAhead(c, x, z, hx, hz) { const P = AV.P, look = 4 + c.v * .9, test = (px, pz, r) => { const rx = px - x, rz = pz - z, along = rx * hx + rz * hz, side = Math.abs(rx * -hz + rz * hx); return along > 0 && along < look + c.len / 2 && side < 1.2 + r };
  if (test(P.x, P.z, AV.act && AV.act.cur && AV.act.cur.id === 'ride' ? 1 : .3)) return 'you';
  const W = S.W; for (const cr of (W.ctx && W.ctx.crowds) || []) for (const w of cr.list) if (w.vis !== false && w.x != null && Math.abs(w.x - x) < 12 && Math.abs(w.z - z) < 12 && test(w.x, w.z, .3)) return 'ped';
  for (const b of (AV.beings && AV.beings.list) || []) { const h = b.h && b.h.position; if (h && Math.abs(h.x - x) < 12 && Math.abs(h.z - z) < 12 && test(h.x, h.z, .3)) return 'ped' } return null }
let honkT = 0;
function tick(dt) { if (!S) return; S.t += dt; const P = AV.P, t = S.t;
  for (const c of S.cars) { if (!c.lane) { if (Math.random() < .05) spawn(c); continue }
    if (Math.hypot(c.x - P.x, c.z - P.z) > 230) { spawn(c); continue }
    const ln = c.lane; let x, z, yaw, hx, hz;
    if (c.turn) { const tn = c.turn; tn.u = Math.min(1, tn.u + c.v * dt / tn.len); const u = tn.u, iu = 1 - u; x = iu * iu * tn.p0[0] + 2 * iu * u * tn.p1[0] + u * u * tn.p2[0]; z = iu * iu * tn.p0[1] + 2 * iu * u * tn.p1[1] + u * u * tn.p2[1];
      hx = 2 * iu * (tn.p1[0] - tn.p0[0]) + 2 * u * (tn.p2[0] - tn.p1[0]); hz = 2 * iu * (tn.p1[1] - tn.p0[1]) + 2 * u * (tn.p2[1] - tn.p1[1]); const l = Math.hypot(hx, hz) || 1; hx /= l; hz /= l;
      const blk = blockedAhead(c, x, z, hx, hz); c.v += ((blk ? 0 : Math.min(c.vmax * .55, 6)) - c.v) * Math.min(1, dt * (blk ? 5 : 1.5));
      if (u >= 1) { const i = ln.cars.indexOf(c); if (i >= 0) ln.cars.splice(i, 1); c.lane = tn.to; c.s = tn.s2; c.turn = null; tn.to.cars.push(c) } }
    else { [x, z] = posOn(ln, c.s); hx = ln.dx; hz = ln.dz;
      /* leader on my lane */ let gap = 1e9; for (const o of ln.cars) if (o !== c && !o.turn && o.s > c.s) gap = Math.min(gap, o.s - c.s - (o.len + c.len) / 2);
      if (gap > 30 && c.next) for (const o of c.next.cars) if (!o.turn && o.s < 20) gap = Math.min(gap, ln.L - c.s + o.s - (o.len + c.len) / 2);
      for (const o of S.cars) if (o.turn && o.turn.from === ln && o !== c) gap = Math.min(gap, ln.L - c.s - c.len / 2 - 1);   /* someone turning out ahead */
      /* light */ const stopS = ln.L - STOPBACK(ln); let mustStop = false; if (ln.b.light) { const ph = T.phaseOf(ln.b, ln.axis, t); if (ph === 2 || (ph === 1 && c.s < stopS - c.v * 1.2)) mustStop = c.s < stopS + .3; else if (ph === 1 && c.s < stopS) c.goAmber = true }   /* committed on amber: it may finish crossing */ const toLine = stopS - c.s - c.len / 2;
      const blk = blockedAhead(c, x, z, hx, hz); if (blk && c.v > 1 && !c.stopped) { c.stopped = true; T.stats.stopsForPeople++ } if (!blk) c.stopped = false;
      if (blk === 'you' && S.t > honkT && Math.hypot(P.x - x, P.z - z) < 7 && AV.audio && AV.audio.blip) { honkT = S.t + 4; AV.audio.blip(c.k === 'scooter' ? 660 : 400, .18, 'square', .05) }
      let want = c.vmax; if (gap < 30) want = Math.min(want, gap < 1.5 ? 0 : c.vmax * (gap - 1.5) / 12); if (mustStop) want = Math.min(want, toLine < .2 ? 0 : Math.min(c.vmax, toLine * .9)); if (blk) want = 0;
      c.v += (want - c.v) * Math.min(1, dt * (want < c.v ? 4.5 : 1.3)); if (c.v < .02 && want === 0) c.v = 0;
      const s0 = c.s; c.s += c.v * dt; if (ln.b.light && s0 < stopS && c.s >= stopS) { if (T.phaseOf(ln.b, ln.axis, t) === 2 && !c.goAmber) T.stats.violations++; c.goAmber = false }
      /* reaching the junction: plan the turn */ if (!c.next) c.next = nextLane(ln); const turnAt = ln.L - ln.w / 2 - 1.5;
      if (c.s >= turnAt) { const to = c.next || nextLane(ln); c.next = null; if (!to) { spawn(c); continue } const s2 = to.w / 2 + 1.5, p0 = posOn(ln, c.s), p2 = posOn(to, s2), straight = to.axis === ln.axis, p1 = straight ? [(p0[0] + p2[0]) / 2, (p0[1] + p2[1]) / 2] : [ln.axis === 'x' ? p2[0] : p0[0], ln.axis === 'x' ? p0[1] : p2[1]];
        c.turn = { from: ln, to, s2, u: 0, p0, p1, p2, len: Math.max(1, Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) + Math.hypot(p2[0] - p1[0], p2[1] - p1[1])) } } }
    c.x = x; c.z = z; c.yaw = Math.atan2(hx, hz); q4.setFromAxisAngle(v3.set(0, 1, 0), c.yaw); m4.compose(v3.set(x, (S.W.surface(x, z) || 0) + .01, z), q4, s3); c.im.setMatrixAt(c.i, m4) }
  for (const k in S.meshes) S.meshes[k].instanceMatrix.needsUpdate = true;
  /* lights near you */ if ((S.lt = (S.lt || 0) - dt) <= 0) { S.lt = .25; const ln2 = S.net.nodes.filter(n => n.light).map(n => [n, Math.hypot(n.x - P.x, n.z - P.z)]).sort((a, b) => a[1] - b[1]).slice(0, 60); S.lightNodes = ln2.map(a => a[0]); let k = 0;
    for (const n of S.lightNodes) { const wmax = Math.max(...n.out.map(o => o.w)); for (const ln of n.out) { /* a pole at the corner the approaching traffic sees: far right of the incoming lane */ const ax = n.x + ln.dx * (wmax / 2 + 1) - ln.rx * (ln.w / 2 + 1.2), az = n.z + ln.dz * (wmax / 2 + 1) - ln.rz * (ln.w / 2 + 1.2);   /* on the road that comes IN (opposite of this outgoing lane), at its drivers' right, before the junction */
        if (k >= S.poles.count) break; q4.setFromAxisAngle(v3.set(0, 1, 0), Math.atan2(ln.dx, ln.dz)); m4.compose(v3.set(ax, S.W.surface(ax, az) || 0, az), q4, s3); S.poles.setMatrixAt(k, m4); (S.polePos = S.polePos || [])[k] = [ax, az]; S.heads.setMatrixAt(k, m4); const ph = T.phaseOf(n, ln.axis, S.t); S.heads.setColorAt(k, col.setHex(ph === 0 ? 0x30ff60 : ph === 1 ? 0xffb020 : 0xff2020)); k++ } }
    for (; k < S.poles.count; k++) { S.poles.setMatrixAt(k, ZERO); S.heads.setMatrixAt(k, ZERO) } S.poles.instanceMatrix.needsUpdate = S.heads.instanceMatrix.needsUpdate = true; S.heads.instanceColor.needsUpdate = true } }
/* traffic cars are solid for your vehicle (vehicles.js bumper probes ask AV.dynBlock) */
T.blockAt = (x, z, r) => { if (!S) return false; for (const c of S.cars) if (c.lane && Math.abs(c.x - x) < 4 && Math.abs(c.z - z) < 4) { const hx = Math.sin(c.yaw), hz = Math.cos(c.yaw), rx = x - c.x, rz = z - c.z, a = rx * hx + rz * hz, s = rx * -hz + rz * hx; if (Math.abs(a) < c.len / 2 + (r || 0) && Math.abs(s) < (c.k === 'scooter' ? .4 : .95) + (r || 0)) return true } return false };
const db0 = AV.dynBlock; AV.dynBlock = (x, z, r) => T.blockAt(x, z, r) || !!(db0 && db0(x, z, r));
T.phase = (node) => S ? { x: T.phaseOf(node, 'x', S.t), z: T.phaseOf(node, 'z', S.t) } : null;
T.time = () => S ? S.t : 0;
const prevEnter = AV.onWorldEnter; AV.onWorldEnter = function (W) { if (prevEnter) prevEnter(W); S = null; T.net = null; T.cars = []; try { setup(W) } catch (e) { console.warn('traffic failed', e); T.stats.err = String(e) } };
})(window.AV);
