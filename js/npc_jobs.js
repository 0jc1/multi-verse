/* APEVERSE - npc_jobs.js : The Wandering Market, a travelling crew that sets up shop in every world. Every member runs on a state
   machine (js/npc_fsm.js) and their jobs feed each other:
     Mae  (vendor)    sells fruit at her stall (passers-by, the crew); when stock runs low she shouts an order for a crate.
     Dash (courier)   waits at the depot, picks up Mae's order and carries the crate over. Punch him and he drops it, then goes back for it.
     Fern (gardener)  finds the thirstiest potted plant (they wilt over time), waters it, refills her can at the water barrel.
     Tam  (sweeper)   sweeps up litter (the crew drops wrappers after snacks), empties the full bag into the bin.
     Bix  (guard)     patrols; tells you off for sprinting through the market; chases you down if you punch anyone. Night shift.
     Melo (busker)    plays for tips (real notes, E to tip him), packs up, spends his tips at Mae's stall, plays again.
   Shared behaviour: tired -> sits on a bench, hungry -> buys fruit from Mae, lonely -> walks over to chat with a crewmate,
   bedtime -> closes up and goes home (they walk to the depot and leave; Bix takes his break in the afternoon instead).
   2.1 corrective pass (owner): no campfire / sleeping-rough scene any more, and the market only sets up where a village market fits
   (Ape Town, Jungle Dub, Verdalux). Cities get ordinary city life instead (js/city_life_plus.js). They wave when you come close, react when punched, and pause
   while you talk to them. The status line under each name tag shows the current state. Try AV.npc.debug() in the console.
   A world can opt out with `noWorkers: true`; private places (W.noStrangersAt) are avoided. Dialogue: data/npcs_workers.js. */
'use strict';
(function (AV) {
const tr = AV.tr, TAU = AV.TAU, NP = AV.npc, G = AV.G; if (!NP || !NP.brain) return;
const L = (en, es) => [en, es], rnd = Math.random;
const hash = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h) };
const inHours = (h, w) => w[0] < w[1] ? h >= w[0] && h < w[1] : h >= w[0] || h < w[1];
const isNight = () => inHours(NP.hour(), [19, 6]);
const walk = (x, z, then, o) => ['walk', Object.assign({ x, z, then }, o || {})];
const stat = (B, k, d) => { B.stats[k] = (B.stats[k] || 0) + (d == null ? 1 : d) };
const nameOf = B => AV.NPCS[B.id].name;
/* dialogue lines live in data/npcs_workers.js ({stat} placeholders are filled from what this NPC has done) */
const lines = (B, k) => { const N = AV.NPCS[B.id], a = N && N.lines && N.lines[k]; return a ? a.map(l => l.map(s => s.replace(/\{(\w+)\}/g, (_, s2) => B.stats[s2] || 0))) : null };

/* ======================= props held in front of the body (body space: +z forward, +x the classic aR side) ======================= */
const mat = (c, r, e, ei) => AV.std(c, r == null ? .8 : r, 0, e || 0, ei || 1);
const P = NP.props;
P.crate = () => { const g = new THREE.Group(); AV.mk(G.box, mat(0xa8743a, .85), 0, 0, 0, .5, .34, .4, g); AV.mk(G.box, mat(0x7a5228, .9), 0, 0, .205, .52, .06, .02, g);
  for (let i = 0; i < 3; i++) AV.mk(G.sph, mat([0xffa020, 0xffd040, 0xff5a3a][i], .55), -.14 + i * .14, .2, 0, .08, .08, .08, g); g.position.set(0, 1.02, .42); return g };
P.can = () => { const g = new THREE.Group(), m = AV.std(0x3a8a5a, .4, .3); AV.mk(G.cyl, m, 0, 0, 0, .09, .2, .09, g);
  const sp = AV.mk(G.cyl, m, 0, .05, .15, .016, .26, .016, g); sp.rotation.x = 1.0; const tip = new THREE.Object3D(); tip.position.set(0, .12, .26); g.add(tip); g.userData.tip = tip;
  g.position.set(.22, 1.0, .42); g.userData.anim = (p, t, B) => { p.rotation.x += ((B.pose === 'water' ? .55 : 0) - p.rotation.x) * .1 }; return g };
P.broom = () => { const g = new THREE.Group(), piv = new THREE.Group(); g.add(piv); piv.rotation.x = .5;
  AV.mk(G.cyl, mat(0x9a6a3a, .7), 0, -.55, 0, .02, 1.2, .02, piv); AV.mk(G.box, mat(0xd8b860, .95), 0, -1.17, 0, .34, .12, .08, piv);
  g.position.set(.08, 1.02, .3); g.userData.anim = (p, t, B) => { piv.rotation.z = B.pose === 'sweep' ? Math.sin(t * 3.4) * .38 : piv.rotation.z * .9 }; return g };
P.guitar = () => { const g = new THREE.Group(), wood = mat(0xc8843a, .45), dark = mat(0x3a2010, .6);
  AV.mk(G.sph, wood, 0, -.12, 0, .17, .21, .06, g); AV.mk(G.cyl, dark, 0, -.1, .055, .05, .01, .05, g).rotation.x = Math.PI / 2; AV.mk(G.box, dark, 0, .2, 0, .045, .44, .03, g); AV.mk(G.box, dark, 0, .45, 0, .07, .1, .03, g);
  g.userData.anim = (p, t, B) => { if (B.pose === 'play') { p.position.set(0, 1.1, .24); p.rotation.set(0, 0, .9) } else { p.position.set(0, 1.18, -.2); p.rotation.set(0, Math.PI, .7) } }; return g };
P.lantern = () => { const g = new THREE.Group(); AV.mk(G.box, mat(0x2a2a2a, .5), 0, .14, 0, .14, .03, .14, g); AV.mk(G.sph, AV.std(0xffd080, .4, 0, 0xffa040, 2.4), 0, 0, 0, .07, .1, .07, g, false);
  AV.mk(G.box, mat(0x2a2a2a, .5), 0, -.12, 0, .14, .03, .14, g); g.position.set(-.3, .82, .22); g.userData.anim = (p, t) => { p.rotation.z = Math.sin(t * 2.2) * .12 }; return g };
P.fruit = () => { const g = new THREE.Group(); AV.mk(G.sph, mat(0xffa020, .55), 0, 0, 0, .065, .07, .065, g);
  g.userData.anim = (p, t, B) => { const up = B.pose === 'eat' && (t % 3) < 1.2; p.position.set(.16, up ? 1.52 : 1.0, up ? .16 : .34) }; return g };

/* ======================= the market site ======================= */
const toW = (s, lx, lz) => { const c = Math.cos(s.yaw), n = Math.sin(s.yaw); return { x: s.x + lx * c + lz * n, z: s.z - lx * n + lz * c } };
function part(g, geo, col, x, y, z, sx, sy, sz, o) { o = o || {}; const m = AV.mk(geo, AV.std(col, o.r == null ? .8 : o.r, 0, o.e || 0, o.ei || 1), x, y, z, sx, sy, sz, g); if (o.rx) m.rotation.x = o.rx; if (o.ry) m.rotation.y = o.ry; if (o.rz) m.rotation.z = o.rz; return m }
function holder(S, s) { const g = new THREE.Group(); g.position.set(s.x, s.y, s.z); g.rotation.y = s.yaw; S.root.add(g); return g }

/* the most open, flat, reachable spot near the arrival (a world place if possible) */
function findCenter(W, rng) {
  const priv = (x, z) => !!(W.noStrangersAt && W.noStrangersAt(x, z)), ax = AV.P.x, az = AV.P.z, cands = [];
  for (const p of W.places || []) { const q = Array.isArray(p) ? { x: +p[3], z: +p[4] } : p && { x: +p.x, z: +p.z }; if (q && isFinite(q.x) && isFinite(q.z)) cands.push(q) }
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + rng() * .3, r = 18 + (i % 3) * 9; cands.push({ x: ax + Math.cos(a) * r, z: az + Math.sin(a) * r }) }
  let best = null, bs = 0;
  for (const c of cands) {
    const d = Math.hypot(c.x - ax, c.z - az); if (d < 14 || d > 75 || priv(c.x, c.z) || !AV.isFree(W, c.x, c.z, 1)) continue;
    const y0 = W.surface(c.x, c.z); let free = 0, flat = 0;
    for (let i = 0; i < 40; i++) { const a = i * 2.4, r = 2 + i / 40 * 13, x = c.x + Math.cos(a) * r, z = c.z + Math.sin(a) * r; if (AV.isFree(W, x, z, .8) && !priv(x, z)) { free++; if (Math.abs(W.surface(x, z) - y0) < 1.2) flat++ } }
    const s = (free + flat) / 80 - d / 500 + (NP.clear(W, ax, az, c.x, c.z) ? .08 : 0);
    if (s > bs) { bs = s; best = c }
  }
  return bs > .72 ? { x: best.x, z: best.z, y: W.surface(best.x, best.z) || 0 } : null;
}
/* free spots around the centre, spaced apart, reachable from it, facing it (local +z points at the centre) */
function spotter(W, c, rng) {
  const used = [], priv = (x, z) => !!(W.noStrangersAt && W.noStrangersAt(x, z)), roads = W.mapRoads || [];
  /* M1: market props never stand on a sidewalk or a road: keep them 6 m beyond every mapped road edge and out of a world's no-decoration zones (it used to land on the Pinar sidewalks, depending on the save seed) */
  const sideD = (x, z) => { let d = 1e9; for (const q of roads) { const dx = q[2] - q[0], dz = q[3] - q[1], l2 = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((x - q[0]) * dx + (z - q[1]) * dz) / l2)); d = Math.min(d, Math.hypot(x - q[0] - dx * t, z - q[1] - dz * t) - (q[4] || 6) / 2) } return d };
  return function (r0, r1, rad, o) {
    o = o || {};
    for (let i = 0; i < 120; i++) {
      const a = o.ang != null ? o.ang + (rng() - .5) * 1.2 : rng() * TAU, r = r0 + rng() * (r1 - r0), x = c.x + Math.cos(a) * r, z = c.z + Math.sin(a) * r, y = W.surface(x, z);
      if (y == null || Math.abs(y - c.y) > 1.2 || !AV.isFree(W, x, z, Math.max(.6, rad)) || priv(x, z)) continue;
      if (used.some(u => Math.hypot(u[0] - x, u[1] - z) < u[2] + rad + .6) || !NP.clear(W, c.x, c.z, x, z, .4) || (o.check && !o.check(x, z)) || (!o.ghost && (sideD(x, z) < rad + 6 || (W.noDecor && W.noDecor(x, z))))) continue;
      if (!o.ghost) used.push([x, z, rad]);
      return { x, z, y, yaw: Math.atan2(c.x - x, c.z - z) };
    }
    return null;
  };
}

function buildStall(S, s) {
  const g = holder(S, s), dark = 0x5a3a20;
  part(g, G.box, 0x9a6a3a, 0, .45, 0, 2.0, .9, .8); part(g, G.box, 0xe8d8b0, 0, .92, 0, 2.06, .04, .86);
  for (const x of [-.95, .95]) { part(g, G.box, dark, x, 1.25, -.38, .07, 2.5, .07); part(g, G.box, dark, x, 1.05, .38, .07, 2.1, .07) }
  for (let i = 0; i < 5; i++) part(g, G.box, i % 2 ? 0xfff4e0 : 0xff6a3a, -.8 + i * .4, 2.3, .08, .4, .04, 1.4, { rx: .38 });
  for (const x of [-.5, .5]) part(g, G.box, 0xb07a40, x, 1.0, .05, .7, .14, .5);
  part(g, G.cyl, dark, 0, .21, -1.15, .2, .42, .2);
  const max = 12, im = new THREE.InstancedMesh(G.sph, new THREE.MeshStandardMaterial({ roughness: .55 }), max), cc = new THREE.Color(), mm = new THREE.Matrix4();
  for (let i = 0; i < max; i++) { const k = i % 6, x = (i < 6 ? -.5 : .5) + (k % 3 - 1) * .2, z = .05 + (k < 3 ? -.11 : .11); mm.makeScale(.1, .1, .1).setPosition(x, 1.16 + (i % 2) * .02, z); im.setMatrixAt(i, mm); im.setColorAt(i, cc.setHex([0xffa020, 0xffd040, 0xff5a3a][i % 3]).convertSRGBToLinear()) }
  im.material.userData.lin = 1; im.castShadow = true; im.frustumCulled = false; g.add(im);
  for (const lx of [-.55, .55]) { const p = toW(s, lx, 0); S.ctx.circles.push([p.x, p.z, .62]) }
  const sg = toW(s, 0, .55); AV.kit.sign(S.ctx, tr('The Wandering Market', 'El Mercado Errante'), sg.x, s.y + 2.95, sg.z, s.yaw, 1.7, '#ffd84a');
  return { x: s.x, z: s.z, yaw: s.yaw, im, stock: 9, max, back: toW(s, 0, -1.15), cust: toW(s, 0, 1.3) };
}
function buildDepot(S, s) {
  const g = holder(S, s), w = 0xa8743a;
  part(g, G.box, 0x7a5a3a, 0, .06, 0, 1.4, .12, 1.1);
  for (const [x, y, z] of [[-.33, .32, -.25], [.33, .32, -.25], [-.33, .32, .28], [.33, .32, .28], [0, .72, 0]]) part(g, G.box, w, x, y, z, .6, .4, .48);
  part(g, G.box, w, 0, .21, 1.8, .5, .42, .42);
  S.ctx.circles.push([s.x, s.z, .95]);
  return { x: s.x, z: s.z, stand: toW(s, 0, 1.35), seat: Object.assign(toW(s, 0, 1.8), { yaw: s.yaw }) };
}
function buildWell(S, s) {
  const g = holder(S, s);
  part(g, G.cyl, 0x7a5228, 0, .45, 0, .42, .9, .42); for (const y of [.2, .7]) part(g, G.cyl, 0x3a3a3a, 0, y, 0, .43, .04, .43, { r: .4 });
  part(g, G.cyl, 0x3a8ac8, 0, .9, 0, .38, .02, .38, { r: .1 }); part(g, G.box, 0x8a8a8a, 0, .3, .44, .06, .06, .1, { r: .4 });
  S.ctx.circles.push([s.x, s.z, .5]);
  return { x: s.x, z: s.z, stand: toW(s, 0, 1.0) };
}
function buildBin(S, s) {
  const g = holder(S, s); part(g, G.cyl, 0x2a5a3a, 0, .4, 0, .3, .8, .3);
  const lid = new THREE.Group(); lid.position.set(0, .82, -.3); g.add(lid); part(lid, G.cyl, 0x1f4a2e, 0, 0, .3, .32, .05, .32);
  S.ctx.circles.push([s.x, s.z, .36]);
  return { x: s.x, z: s.z, stand: toW(s, 0, .9), lid, open: false };
}
const PLANTS = [{ n: L('the hibiscus', 'el hibisco'), f: 0xff3a6a }, { n: L('the sunflower', 'el girasol'), f: 0xffd030 }, { n: L('the lavender', 'la lavanda'), f: 0xa070ff },
  { n: L('the marigold', 'la caléndula'), f: 0xff8a20 }, { n: L('the bluebells', 'las campanillas'), f: 0x5a8aff }];
function buildPlant(S, s, i) {
  const g = holder(S, s), K = PLANTS[i % PLANTS.length];
  part(g, G.cyl, 0xb8643a, 0, .17, 0, .22, .34, .22); part(g, G.cyl, 0x3a2a1a, 0, .345, 0, .2, .02, .2);
  const lm = new THREE.MeshStandardMaterial({ roughness: .7 }); lm.userData.lin = 1;
  const bush = new THREE.Group(); bush.position.y = .36; g.add(bush);
  for (const [x, y, z, r] of [[0, .22, 0, .2], [-.12, .14, .05, .14], [.11, .16, -.05, .15]]) { const m = new THREE.Mesh(G.sph, lm); m.position.set(x, y, z); m.scale.setScalar(r); m.castShadow = true; bush.add(m) }
  const fl = part(bush, G.sph, K.f, 0, .44, 0, .09, .09, .09, { r: .5 });
  S.ctx.circles.push([s.x, s.z, .3]);
  return { x: s.x, z: s.z, name: K.n, water: .3 + rnd() * .55, rate: 1 / (90 + rnd() * 70), bush, fl, mat: lm, stand: toW(s, 0, .8) };
}
function buildBench(S, s) {
  const g = holder(S, s); part(g, G.box, 0x8a5a30, 0, .42, 0, 1.5, .07, .44); for (const x of [-.6, .6]) part(g, G.box, 0x4a3a2a, x, .2, 0, .08, .4, .38);
  return [-.38, .38].map(lx => { const p = toW(s, lx, -.05), f = toW(s, lx, 3); return { x: p.x, z: p.z, fx: f.x, fz: f.z, kind: 'bench', by: null } });
}
function buildCamp(S, s, n) {   /* 2.1: the crew's rest corner is a market picnic table under a parasol (it used to be a campfire ring) */
  const g = holder(S, s), flames = [], seats = [], light = null;
  part(g, G.box, 0x9a6a3a, 0, .74, 0, 2.2, .07, .9); for (const x of [-.9, .9]) part(g, G.box, 0x6a4a2a, x, .37, 0, .08, .74, .8);
  for (const z of [-.85, .85]) { part(g, G.box, 0x8a5a30, 0, .44, z, 2.2, .06, .34); for (const x of [-.9, .9]) part(g, G.box, 0x6a4a2a, x, .22, z, .08, .44, .3) }
  part(g, G.cyl, 0xd8d0c0, 0, 1.3, 0, .03, 2.6, .03); part(g, G.cone, 0x2a8a8a, 0, 2.55, 0, 1.5, .45, 1.5);
  for (let i = 0; i < n; i++) {
    const side = i % 2 ? 1 : -1, lx = -.75 + (Math.floor(i / 2) % 3) * .75, lz = side * .85;
    const p = toW(s, lx, lz), f = toW(s, lx, 0); seats.push({ x: p.x, z: p.z, fx: f.x, fz: f.z, kind: 'camp', by: null });
  }
  S.ctx.circles.push([s.x, s.z, .7]);
  return { x: s.x, z: s.z, flames, light, seats };
}
function buildBusk(S, s) {
  const g = holder(S, s); part(g, G.box, 0x8a2a5a, 0, .012, .4, 1.4, .02, 1.6, { r: .95 });
  const hat = new THREE.Group(); hat.position.set(0, 0, 1.1); g.add(hat); part(hat, G.cyl, 0x2a2a34, 0, .07, 0, .13, .13, .13); part(hat, G.cyl, 0x2a2a34, 0, .01, 0, .22, .015, .22); hat.visible = false;
  const im = new THREE.InstancedMesh(G.cyl, AV.std(0xffd040, .3, .8), 10), mm = new THREE.Matrix4();
  for (let i = 0; i < 10; i++) { mm.makeScale(.035, .008, .035).setPosition((rnd() - .5) * .14, .14 + i * .006, (rnd() - .5) * .14); im.setMatrixAt(i, mm) } im.count = 0; im.frustumCulled = false; hat.add(im);
  return { x: s.x, z: s.z, yaw: s.yaw, hat, im, coins: 0, hatW: toW(s, 0, 1.1) };
}
function buildLitter(S, n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const can = i % 3 === 2, m = can ? AV.mk(G.cyl, mat(0xd83a3a, .4), 0, 0, 0, .045, .12, .045, S.root) : AV.mk(G.ico, mat(i % 2 ? 0xf4ecd8 : 0xe8d8a0, .9), 0, 0, 0, .09, .06, .08, S.root);
    if (can) m.rotation.z = Math.PI / 2; m.visible = false; out.push({ m, on: false, x: 0, z: 0, by: null, k: 1, base: m.scale.clone() });
  }
  return out;
}

function buildSite(W, ctx, c, rng, cast) {
  const spot = spotter(W, c, rng), has = id => cast.indexOf(id) >= 0, ringOk = (x, z) => { for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; if (!AV.isFree(W, x + Math.cos(a) * 2.2, z + Math.sin(a) * 2.2, .5)) return false } return true };
  /* plan every spot first; build nothing unless the essentials fit */
  const sp = { stall: spot(1, 4, 1.4), depot: spot(9, 14, 1.2), camp: spot(8, 14, 2.8, { check: ringOk }), bin: spot(3, 7, .5), benches: [spot(4, 9, .9), spot(4, 9, .9)] };
  if (!sp.stall || !sp.depot || !sp.camp || !sp.bin) return null;
  if (has('fern')) { sp.well = spot(6, 11, .6); sp.plants = [0, 1, 2, 3, 4].map(() => spot(4, 12, .5)).filter(Boolean); if (!sp.well || sp.plants.length < 3) cast.splice(cast.indexOf('fern'), 1) }
  if (has('melo')) { sp.busk = spot(5, 11, 1.4); if (!sp.busk) cast.splice(cast.indexOf('melo'), 1) }
  if (has('bix')) { sp.patrol = [0, 1, 2, 3].map(i => spot(10, 18, .4, { ang: i / 4 * TAU, ghost: true })).filter(Boolean); if (sp.patrol.length < 3) cast.splice(cast.indexOf('bix'), 1) }

  const root = new THREE.Group(); ctx.group.add(root);
  const S = { W, ctx, c, root, brains: [], order: null, vendor: null, litterT: 12, seats: [] };
  S.stall = buildStall(S, sp.stall); S.depot = buildDepot(S, sp.depot); S.bin = buildBin(S, sp.bin);
  const camp = S.camp = buildCamp(S, sp.camp, Math.max(4, cast.length)); S.seats.push(...camp.seats);
  for (const b of sp.benches) if (b) S.seats.push(...buildBench(S, b));
  for (let i = 0; i < cast.length; i++) { const h = S.depot.stand; S.seats.push({ x: h.x + (i % 3 - 1) * .5, z: h.z + (i / 3 | 0) * .5, fx: S.depot.x, fz: S.depot.z, kind: 'home', by: null }) }
  if (has('fern')) { S.well = buildWell(S, sp.well); S.plants = sp.plants.map((p, i) => buildPlant(S, p, i)) } else S.plants = [];
  if (has('melo')) S.busk = buildBusk(S, sp.busk);
  S.patrol = sp.patrol || [];
  S.litter = buildLitter(S, 12);
  AV.lin(root);

  /* ---------- site services the states call ---------- */
  S.free = (x, z) => W.surface(x, z) != null && AV.isFree(W, x, z, .35) && !(W.noStrangersAt && W.noStrangersAt(x, z));
  S.randomSpot = () => { for (let i = 0; i < 24; i++) { const a = rnd() * TAU, r = 3 + rnd() * 11, x = c.x + Math.cos(a) * r, z = c.z + Math.sin(a) * r; if (S.free(x, z) && NP.clear(W, c.x, c.z, x, z)) return { x, z } } return null };
  S.drop = (x, z) => { if (!S.free(x, z)) return; const l = S.litter.find(k => !k.on); if (!l) return; l.on = true; l.by = null; l.k = 1; l.x = x; l.z = z; l.m.position.set(x, (W.surface(x, z) || 0) + .04, z); l.m.rotation.y = rnd() * TAU; l.m.visible = true };
  S.clearLitter = l => { l.on = false; l.by = null; l.m.visible = false };
  S.nearestLitter = B => { const p = B.n.g.position; let best = null, bd = 1e9; for (const l of S.litter) if (l.on && (!l.by || l.by === B)) { const d = Math.hypot(l.x - p.x, l.z - p.z); if (d < bd) { bd = d; best = l } } return best };
  S.thirstiest = () => S.plants.reduce((a, p) => !a || p.water < a.water ? p : a, null);
  S.buy = B => { const v = S.vendor; if (!v || v.fsm.is('sleep') || S.stall.stock <= 0) return false; S.stall.stock--; stat(v, 'sold'); v.fsm.send('served', B); return true };
  S.claimSeat = (B, kinds) => {
    S.releaseSeat(B); const p = B.n.g.position;
    for (const k of kinds) { let best = null, bd = 1e9; for (const s of S.seats) if (s.kind === k && !s.by) { const d = Math.hypot(s.x - p.x, s.z - p.z); if (d < bd) { bd = d; best = s } } if (best) { best.by = B; B.mem.seat = best; return best } }
    return null;
  };
  S.releaseSeat = B => { if (B.mem.seat && B.mem.seat.by === B) B.mem.seat.by = null; B.mem.seat = null };
  S.partnerFor = B => { const p = B.n.g.position; let best = null, bd = 30; for (const o of S.brains) { if (o === B || o.mem.talkTo || o.n.ko || !o.fsm.def.states[o.fsm.state].chatty) continue; const d = Math.hypot(o.n.g.position.x - p.x, o.n.g.position.z - p.z); if (d < bd) { bd = d; best = o } } return best };
  S.meetPoint = (p, from) => {
    if (p === S.vendor) return S.stall.cust;
    const q = p.n.g.position, f = from.n.g.position, a0 = Math.atan2(f.x - q.x, f.z - q.z);
    for (const da of [0, .6, -.6, 1.2, -1.2, 2, -2, 3]) { const x = q.x + Math.sin(a0 + da) * 1.3, z = q.z + Math.cos(a0 + da) * 1.3; if (S.free(x, z)) return { x, z } }
    return { x: q.x, z: q.z };
  };
  S.alarm = victim => { for (const b of S.brains) if (b.role === 'guard') b.fsm.send('alarm', { victim }) };
  S.dropCrate = B => {
    const g = B.n.g, m = P.crate(); AV.lin(m); m.position.set(g.position.x + Math.sin(g.rotation.y) * .6, (W.surface(g.position.x, g.position.z) || 0) + .17, g.position.z + Math.cos(g.rotation.y) * .6); m.rotation.y = g.rotation.y + .4; root.add(m);
    B.mem.dropped = { x: m.position.x, z: m.position.z, qty: B.mem.crate.qty, m }; B.mem.crate = null; B.hold();
  };
  S.pickCrate = B => { const d = B.mem.dropped; root.remove(d.m); B.mem.crate = { qty: d.qty }; B.mem.dropped = null };
  return S;
}

/* ======================= per-frame site upkeep (plants wilt, litter appears, campfire, bin lid, tip hat) ======================= */
const DRY = new THREE.Color(0x9a7a3a).convertSRGBToLinear(), WET = new THREE.Color(0x3a9a3a).convertSRGBToLinear();
function siteTick(S, dt, t) {
  dt = Math.min(dt, .1); const night = isNight();
  for (const p of S.plants) {
    p.water = Math.max(0, p.water - dt * p.rate * (night ? .3 : 1)); const w = Math.min(1, p.water * 1.5), b = Math.max(0, Math.min(1, (p.water - .45) / .4));
    p.mat.color.copy(DRY).lerp(WET, w); p.bush.scale.y = .62 + .38 * w; p.bush.rotation.z = (1 - w) * .3; p.fl.visible = b > 0; p.fl.scale.setScalar(.02 + .08 * b);
  }
  S.stall.im.count = S.stall.stock;
  if ((S.litterT -= dt) <= 0) { S.litterT = 20 + rnd() * 25; if (S.litter.filter(l => l.on).length < 5) { const p = S.randomSpot(); if (p) S.drop(p.x, p.z) } }
  for (const l of S.litter) if (l.on) l.m.scale.copy(l.base).multiplyScalar(Math.max(.05, l.k));
  S.bin.lid.rotation.x += ((S.bin.open ? -1.2 : 0) - S.bin.lid.rotation.x) * Math.min(1, 8 * dt);
  const cf = S.camp, fl = night ? 1 : .35;
  cf.flames.forEach((f, i) => { f.scale.set(.14 * fl, (.42 + Math.sin(t * 9 + i * 2.1) * .08) * fl, .14 * fl); f.position.y = .1 + f.scale.y / 2 });
  if (cf.light) cf.light.intensity = night ? 1.5 + Math.sin(t * 11) * .2 + Math.sin(t * 7.3) * .15 : 0;
  if (S.busk) S.busk.im.count = Math.min(10, S.busk.coins);
}

/* ======================= shared states (every role gets these) ======================= */
const fail = () => ['idle', { for: 2 + rnd() * 3 }];
function needs(B) {
  const nd = B.needs, S = B.site;
  if (nd.hunger > .8 && S.vendor && S.vendor !== B) return 'eat';
  if (nd.energy < .25) return 'rest';
  if (nd.social > .85) { const p = S.partnerFor(B); if (p) return ['visit', { p }]; nd.social = .6 }
  return null;
}
const COMMON = {
  decide: { enter(B) { B.pose = null; B.free(); B.mem.talkTo = null; B.site.releaseSeat(B) }, update(B) { return ROLES[B.role].decide(B) } },
  idle: { enter(B) { B.pose = null; B.status('🤔', L('Figuring out what next', 'Pensando qué hacer')) }, update(B, dt, m) { if (m.t > (m.data.for || 3)) return 'decide' } },
  /* generic travel: walk somewhere, then continue with data.then (any state, with parameters) */
  walk: {
    pri: (B, m) => m.data.pri || 0, effort: .7,
    enter(B, m) {
      const d = m.data; B.free(); B.pose = d.pose || null; if (d.hold !== undefined) B.hold(...[].concat(d.hold || [])); B.status(d.icon || '🚶', d.label || L('Walking', 'Caminando'));
      if (!B.walkTo(d.x, d.z, d.speed)) return d.fail || fail();
    },
    update(B, dt, m) { if (B.arrived) return m.data.then; if (B.stuck) return m.data.fail || fail() },
    exit(B) { B.stop() }
  },
  rest: {
    pri: 2, effort: -8, chatty: true,
    enter(B, m) {
      if (!m.data.at) { const s = B.site.claimSeat(B, ['bench', 'camp']); if (!s) { B.needs.energy = .6; return 'decide' } return walk(s.x, s.z, ['rest', { at: true }], { pri: 2, icon: '🥱', label: L('Off for a sit-down', 'Se va a sentar un rato'), hold: null }) }
      const s = B.mem.seat; if (!s) return 'decide'; B.faceTo(s.fx, s.fz); B.pose = 'sit'; B.hold(); B.status('☕', L('Taking a break', 'Tomándose un descanso'));
    },
    update(B, dt, m) { if (B.needs.energy > .97 || m.t > 45) return 'decide' },
    exit(B, m) { B.pose = null; if (m.data.at) B.site.releaseSeat(B) }
  },
  eat: {
    pri: 2, effort: .3,
    enter(B, m) {
      const S = B.site, c = S.stall.cust; if (!S.vendor) { B.needs.hunger = 0; return 'decide' }
      if (!m.data.at) return walk(c.x, c.z, ['eat', { at: true }], { pri: 2, icon: '🍑', label: L('Off to buy a snack from Mae', 'Va a comprarle algo a Mae'), hold: null });
      B.faceTo(S.stall.x, S.stall.z);
      if (!S.buy(B)) { B.say(AV.WORKER_LINES.soldOut, true); B.needs.hunger = .55; return ['idle', { for: 2 }] }
      B.pose = 'eat'; B.hold('fruit'); B.status('🍑', L('Snacking on a mango', 'Comiéndose un mango'));
    },
    update(B, dt, m) {
      if (m.t < 7) return;
      B.needs.hunger = 0; stat(B, 'snacks');
      if (rnd() < .6) { const p = B.n.g.position; B.site.drop(p.x + (rnd() - .5) * 3, p.z + (rnd() - .5) * 3) }   // the wrapper goes... somewhere. Tam will find it.
      return 'decide';
    },
    exit(B) { B.hold(); B.pose = null }
  },
  /* social: walk over to a crewmate who agreed to chat, then trade lines about the day */
  visit: {
    pri: 2,
    enter(B, m) {
      const p = m.data.p; if (!p.fsm.send('invite', B)) { B.needs.social = .55; return 'decide' }
      B.mem.talkTo = p; const mp = B.site.meetPoint(p, B);
      return walk(mp.x, mp.z, ['chatWith', { p, lead: true }], { pri: 2, icon: '💬', label: L('Going over to chat with ' + nameOf(p), 'Va a charlar con ' + nameOf(p)), hold: null, fail: 'decide' });
    }
  },
  chatWith: {
    pri: 2, effort: .2,
    enter(B, m) { const p = m.data.p; B.pose = null; B.hold(); B.faceTo(p.n.g.position.x, p.n.g.position.z); B.status('💬', L('Chatting with ' + nameOf(p), 'Charlando con ' + nameOf(p))); m.data.i = 0; m.data.cT = 1 },
    update(B, dt, m) {
      const p = m.data.p; if (p.mem.talkTo !== B || !p.fsm.is('walk', 'chatWith', 'greet') || m.t > 45) return 'decide';
      B.faceTo(p.n.g.position.x, p.n.g.position.z);
      if (!m.data.lead || p.fsm.state !== 'chatWith' || (m.data.cT -= dt) > 0) return;
      if (m.data.i >= 4) { B.needs.social = p.needs.social = 0; stat(B, 'chats'); stat(p, 'chats'); p.fsm.send('chatDone'); return 'decide' }
      const sp = m.data.i % 2 ? p : B, ot = sp === B ? p : B; sp.say(lines(sp, 'small'), true); sp.pose = 'talk'; ot.pose = null; m.data.i++; m.data.cT = 3.4;
    },
    exit(B) { B.mem.talkTo = null; B.pose = null },
    on: { chatDone: 'decide' }
  },
  sleep: {
    pri: 5, effort: -4,
    enter(B, m) {
      if (!m.data.at) { const s = B.site.claimSeat(B, ['home']); if (s) return walk(s.x, s.z, ['sleep', { at: true }], { pri: 5, icon: '🏠', label: L('Closing up and heading home', 'Recoge y se va a casa'), hold: null }); m.data.at = true }
      B.hold(); B.n.g.visible = false; B.status('🏠', L('Gone home for the night', 'Se ha ido a casa'));   /* 2.1: they leave; nobody sleeps rough at the market */
    },
    update(B) { if (!inHours(NP.hour(), ROLES[B.role].sleep)) { B.say(lines(B, 'morning'), true); stat(B, 'nights'); return 'decide' } },
    exit(B, m) { B.pose = null; B.n.g.visible = true; if (m.data.at) B.site.releaseSeat(B) }
  },
  greet: {
    pri: 1, transient: true,
    enter(B) { const now = AV.now(); B.mem.greetAt = now + 150; B.mem.hawkAt = now + 25; B.faceTo(AV.P.x, AV.P.z); B.pose = 'wave'; B.say(lines(B, 'hello'), true) },
    update(B, dt, m) { if (m.t > 2.2) return 'back' },
    exit(B) { B.pose = null }
  },
  rattled: {
    pri: 8, effort: .2,
    enter(B) { B.stop(); B.faceTo(AV.P.x, AV.P.z); B.pose = 'scold'; B.status('😵', L('Seeing stars', 'Viendo las estrellas')); stat(B, 'punched'); B.site.alarm(B) },
    update(B, dt, m) { if (m.t > 2.8 && !m.data.said) { m.data.said = true; B.say(lines(B, 'ouch'), true) } if (m.t > 5) return 'decide' },
    exit(B) { B.pose = null }
  }
};
const ON = {
  hit: 'rattled',
  knocked: B => { const R = ROLES[B.role]; if (R.onKnock) R.onKnock(B); return null },
  invite: (B, m, from) => { if (!m.def.states[m.state].chatty || B.mem.talkTo || B.needs.social < .2) return null; B.mem.talkTo = from; return ['chatWith', { p: from, lead: false }] },
  chatted: B => { B.say(lines(B, 'bye'), true); return null }
};
const ANY = [
  { to: 'sleep', pri: 5, why: 'bedtime', when: B => inHours(NP.hour(), ROLES[B.role].sleep) },
  { to: 'greet', pri: 1, why: 'player came close', when: B => B.dist < 4.5 && AV.now() > (B.mem.greetAt || 0) && AV.running && !AV.blocking() }
];

/* ======================= the six jobs ======================= */
const ROLES = {
  vendor: {
    sleep: [22.5, 6], rates: { hunger: 1 / 300 },
    home: S => Object.assign({ yaw: S.stall.yaw }, S.stall.back),
    init(B) { B.site.vendor = B },
    decide(B) { return B.needs.hunger > .8 && B.site.stall.stock > 0 ? 'snack' : 'tend' },
    states: {
      tend: {
        chatty: true, effort: -.5,
        enter(B, m) {
          const st = B.site.stall; if (!B.near(st.back.x, st.back.z, .5)) return walk(st.back.x, st.back.z, 'tend', { icon: '🍑', label: L('Back to the stall', 'Vuelve al puesto'), hold: null });
          B.faceTo(st.cust.x, st.cust.z); B.pose = 'sit'; B.hold(); m.data.sale = 5 + rnd() * 8;
        },
        update(B, dt, m) {
          const S = B.site, st = S.stall;
          if (B.needs.hunger > .8 && st.stock > 0) return 'snack';
          if (st.stock <= 3 && !S.order) return 'order';
          if (B.dist < 8 && st.stock > 0 && AV.now() > (B.mem.hawkAt || 0)) { B.mem.hawkAt = AV.now() + 30; return 'hawk' }
          if (m.t > m.data.sale) { m.data.sale = m.t + 9 + rnd() * 9; if (st.stock > 0 && rnd() < .65) { st.stock--; stat(B, 'sold'); return 'serve' } }   // a passer-by buys one
          B.status('🍑', st.stock ? L('Selling fruit · ' + st.stock + ' left', 'Vendiendo fruta · quedan ' + st.stock) : L('Sold out · waiting for Dash', 'Agotado · esperando a Dash'));
        }
      },
      hawk: { pri: 1, transient: true, enter(B) { B.faceTo(AV.P.x, AV.P.z); B.pose = 'hawk'; B.say(lines(B, 'hawk'), true) }, update(B, dt, m) { if (m.t > 2.6) return 'back' }, exit(B) { B.pose = null } },
      serve: { pri: 1, transient: true, enter(B) { B.pose = 'give'; B.status('🍑', L('Serving a customer', 'Atendiendo a un cliente')) }, update(B, dt, m) { if (m.t > 1.4) return 'back' }, exit(B) { B.pose = null } },
      order: {
        enter(B) { const S = B.site; S.order = { qty: 8, by: B, taken: null }; stat(B, 'orders'); B.pose = 'call'; B.say(lines(B, 'order'), true); B.status('📣', L('Ordering a new crate', 'Pidiendo otra caja')) },
        update(B, dt, m) { if (m.t > 2.4) return 'tend' }, exit(B) { B.pose = null }
      },
      restock: {
        pri: 3, effort: 1,
        enter(B, m) { const st = B.site.stall; if (!m.data.at && !B.near(st.back.x, st.back.z, .5)) return walk(st.back.x, st.back.z, ['restock', Object.assign({}, m.data, { at: true })], { pri: 3, hold: null }); B.faceTo(st.cust.x, st.cust.z); B.pose = 'arrange'; m.data.t = 0; B.status('🍑', L('Restocking the stall', 'Reponiendo el puesto')) },
        update(B, dt, m) {
          const st = B.site.stall; if ((m.data.t -= dt) > 0) return; m.data.t = .45;
          if (m.data.qty > 0 && st.stock < st.max) { st.stock++; m.data.qty--; return }
          B.site.order = null; stat(B, 'restocks'); B.say(lines(B, 'thanks'), true); return 'tend';
        },
        exit(B) { B.pose = null }
      },
      snack: {
        pri: 2, effort: -.5,
        enter(B) { const st = B.site.stall; if (st.stock <= 0) return 'tend'; st.stock--; B.pose = 'eat'; B.hold('fruit'); B.status('🍑', L('Eating her own stock (shh)', 'Comiéndose su propia fruta (chis)')) },
        update(B, dt, m) { if (m.t > 6) { B.needs.hunger = 0; stat(B, 'snacks'); return 'tend' } }, exit(B) { B.hold(); B.pose = null }
      }
    },
    on: { delivery: (B, m, d) => ['restock', { qty: d.qty }], served: (B, m) => m.state === 'tend' ? 'serve' : null }
  },

  courier: {
    sleep: [22, 6.5],
    home: S => Object.assign({ yaw: S.depot.seat.yaw }, S.depot.seat),
    onKnock(B) { if (B.mem.crate) B.site.dropCrate(B) },
    decide(B) {
      const S = B.site; if (B.mem.dropped) return 'recover'; if (B.mem.crate) return 'deliver';
      if (S.order && (!S.order.taken || S.order.taken === B)) return 'pickup';
      return needs(B) || 'wait';
    },
    states: {
      wait: {
        chatty: true, effort: -.4,
        enter(B, m) { const s = B.site.depot.seat; if (!B.near(s.x, s.z, .5)) return walk(s.x, s.z, 'wait', { icon: '📦', label: L('Back to the depot', 'Vuelve al almacén'), hold: null }); B.faceTo(B.site.c.x, B.site.c.z); B.pose = 'sit'; B.hold(); B.status('📦', L('Waiting for orders', 'Esperando pedidos')); m.data.bored = 20 + rnd() * 20 },
        update(B, dt, m) { const S = B.site; if (S.order && !S.order.taken) return 'pickup'; if (B.needs.hunger > .8 || B.needs.social > .85) return 'decide'; if (m.t > m.data.bored) return 'restack' }
      },
      restack: {
        effort: 1,
        enter(B, m) { const d = B.site.depot; if (!m.data.at) return walk(d.stand.x, d.stand.z, ['restack', { at: true }], { icon: '📦', label: L('Tidying the depot', 'Ordenando el almacén') }); B.faceTo(d.x, d.z); B.pose = 'arrange'; B.status('📦', L('Restacking crates', 'Apilando cajas')) },
        update(B, dt, m) { if (m.t > 5) { stat(B, 'restacks'); return 'decide' } }, exit(B) { B.pose = null }
      },
      pickup: {
        pri: 1, effort: 1,
        enter(B, m) {
          const S = B.site, d = S.depot; if (!S.order) return 'decide'; S.order.taken = B;
          if (!m.data.at) return walk(d.stand.x, d.stand.z, ['pickup', { at: true }], { pri: 1, speed: 1.6, icon: '📦', label: L('Fetching a crate for Mae', 'Va a por una caja para Mae'), hold: null });
          B.faceTo(d.x, d.z); B.pose = 'lift'; B.status('📦', L('Loading a crate', 'Cargando una caja'));
        },
        update(B, dt, m) { if (m.t > 1.8) { B.mem.crate = { qty: B.site.order ? B.site.order.qty : 8 }; return 'deliver' } }, exit(B) { B.pose = null }
      },
      deliver: {
        pri: 1, effort: 1.4,
        enter(B, m) {
          const S = B.site, c = S.stall.cust;
          if (!m.data.at) return walk(c.x, c.z, ['deliver', { at: true }], { pri: 1, speed: 1.7, pose: 'carry', hold: 'crate', icon: '📦', label: L('Delivering a crate to Mae', 'Llevándole una caja a Mae') });
          B.faceTo(S.stall.x, S.stall.z); B.hold('crate'); B.pose = 'give'; B.status('📦', L('Handing over the crate', 'Entregando la caja'));
        },
        update(B, dt, m) {
          if (m.t < 1.4) return;
          const S = B.site, qty = B.mem.crate ? B.mem.crate.qty : 8; B.mem.crate = null; B.hold(); stat(B, 'deliveries');
          if (S.vendor) S.vendor.fsm.send('delivery', { qty }); B.say(lines(B, 'deliver'), true); return 'decide';
        },
        exit(B) { B.pose = null }
      },
      recover: {
        pri: 1,
        enter(B, m) {
          const d = B.mem.dropped; if (!d) return 'decide';
          if (!m.data.at) { const p = B.n.g.position, a = Math.atan2(p.x - d.x, p.z - d.z); return walk(d.x + Math.sin(a) * .7, d.z + Math.cos(a) * .7, ['recover', { at: true }], { pri: 1, icon: '📦', label: L('Going back for the dropped crate', 'Vuelve a por la caja que se le cayó'), hold: null }) }
          B.faceTo(d.x, d.z); B.pose = 'lift'; B.status('📦', L('Picking the crate back up', 'Recogiendo la caja'));
        },
        update(B, dt, m) { if (m.t > 1.6) { B.site.pickCrate(B); stat(B, 'recovered'); return 'deliver' } }, exit(B) { B.pose = null }
      }
    }
  },

  gardener: {
    sleep: [21.5, 5.5],
    home: S => S.well.stand,
    init(B) { B.mem.can = 1; dropletFx(B) },
    decide(B) {
      const S = B.site, nd = needs(B); if (nd) return nd;
      const p = S.thirstiest(); if (p && p.water < .6) return B.mem.can < .15 ? 'refill' : ['water', { p }];
      return ['inspect', { p: S.plants[rnd() * S.plants.length | 0] }];
    },
    states: {
      water: {
        effort: 1,
        enter(B, m) {
          const p = m.data.p; if (!m.data.at) return walk(p.stand.x, p.stand.z, ['water', { p, at: true }], { hold: 'can', icon: '🌿', label: L('Off to water ' + p.name[0], 'Va a regar ' + p.name[1]) });
          B.faceTo(p.x, p.z); B.hold('can'); B.pose = 'water'; B.mem.drip = true; B.status('💧', L('Watering ' + p.name[0], 'Regando ' + p.name[1]));
        },
        update(B, dt, m) {
          const p = m.data.p; if (m.t < .6) return;
          p.water = Math.min(1, p.water + dt * .3); B.mem.can = Math.max(0, B.mem.can - dt * .09);
          if (p.water >= 1) { stat(B, 'watered'); return 'decide' }
          if (B.mem.can <= 0) return 'refill';
        },
        exit(B) { B.mem.drip = false; B.pose = null }
      },
      refill: {
        effort: .8,
        enter(B, m) { const w = B.site.well; if (!m.data.at) return walk(w.stand.x, w.stand.z, ['refill', { at: true }], { hold: 'can', icon: '🪣', label: L('Taking the can to the water barrel', 'Lleva la regadera al barril') }); B.faceTo(w.x, w.z); B.pose = 'fill'; B.status('🪣', L('Filling the watering can', 'Llenando la regadera')) },
        update(B, dt, m) { if (m.t > 3) { B.mem.can = 1; stat(B, 'refills'); if (rnd() < .4) B.say(lines(B, 'refill')); return 'decide' } }, exit(B) { B.pose = null }
      },
      inspect: {
        effort: .3, chatty: true,
        enter(B, m) { const p = m.data.p; if (!m.data.at) return walk(p.stand.x, p.stand.z, ['inspect', { p, at: true }], { hold: 'can', icon: '🌿', label: L('Doing the rounds of the plants', 'Revisando las plantas') }); B.faceTo(p.x, p.z); B.pose = 'inspect'; B.status('🌿', L('Checking on ' + p.name[0], 'Mirando cómo está ' + p.name[1])) },
        update(B, dt, m) { if (m.t > 6) return 'decide' }, exit(B) { B.pose = null }
      }
    }
  },

  sweeper: {
    sleep: [22, 6],
    home: S => S.bin.stand,
    init(B) { B.mem.bag = 0 },
    decide(B) {
      const S = B.site, nd = needs(B); if (nd) return nd;
      if (B.mem.bag >= 4) return 'empty';
      const l = S.nearestLitter(B); if (l) return ['sweep', { l }];
      return rnd() < .5 ? 'lean' : 'stroll';
    },
    states: {
      sweep: {
        effort: 1.1,
        enter(B, m) {
          const l = m.data.l; if (!l.on || (l.by && l.by !== B)) return 'decide'; l.by = B;
          if (!m.data.at) { const p = B.n.g.position, a = Math.atan2(p.x - l.x, p.z - l.z); return walk(l.x + Math.sin(a) * .65, l.z + Math.cos(a) * .65, ['sweep', { l, at: true }], { hold: 'broom', icon: '🧹', label: L('Spotted some litter', 'Ha visto basura') }) }
          B.faceTo(l.x, l.z); B.hold('broom'); B.pose = 'sweep'; B.status('🧹', L('Sweeping up', 'Barriendo'));
        },
        update(B, dt, m) {
          const l = m.data.l; if (!l.on) return 'decide';
          l.k = 1 - m.t / 2.6; if (m.t < 2.6) return;
          B.site.clearLitter(l); B.mem.bag++; stat(B, 'swept'); return 'decide';
        },
        exit(B, m) { const l = m.data.l; if (l && l.by === B) { l.by = null; l.k = 1 } B.pose = null }
      },
      empty: {
        effort: .8,
        enter(B, m) { const b = B.site.bin; if (!m.data.at) return walk(b.stand.x, b.stand.z, ['empty', { at: true }], { hold: 'broom', icon: '🗑', label: L('Taking the rubbish to the bin', 'Lleva la basura al cubo') }); B.faceTo(b.x, b.z); B.pose = 'dump'; b.open = true; B.status('🗑', L('Emptying the bag', 'Vaciando la bolsa')) },
        update(B, dt, m) { if (m.t > 2) { B.mem.bag = 0; stat(B, 'bags'); return 'decide' } },
        exit(B) { B.site.bin.open = false; B.pose = null }
      },
      lean: {
        chatty: true, effort: .1,
        enter(B, m) { B.hold('broom'); B.pose = 'lean'; B.faceTo(B.site.c.x, B.site.c.z); B.status('🧹', L('Leaning on the broom', 'Apoyado en la escoba')); m.data.for = 6 + rnd() * 6 },
        update(B, dt, m) { if (m.t > m.data.for || (m.t > 1.5 && B.site.nearestLitter(B))) return 'decide' }, exit(B) { B.pose = null }
      },
      stroll: {
        enter(B) { const p = B.site.randomSpot(); if (!p) return 'lean'; return walk(p.x, p.z, 'lean', { hold: 'broom', icon: '🧹', label: L('Looking for litter', 'Buscando basura') }) }
      }
    }
  },

  guard: {
    sleep: [13, 16.5], rates: { social: 1 / 260 },
    home: S => S.patrol[0],
    decide(B) { if (B.mem.alarm) return 'pursue'; return needs(B) || 'patrol' },
    any: [{ to: 'warn', pri: 3, why: 'player sprinting', when: B => NP.playerSpeed > 6 && B.dist < 12 && AV.now() > (B.mem.warnAt || 0) && AV.running && !AV.blocking() }],
    states: {
      patrol: {
        enter(B) {
          const S = B.site, i = B.mem.pi = ((B.mem.pi == null ? -1 : B.mem.pi) + 1) % S.patrol.length, p = S.patrol[i], night = isNight();
          return walk(p.x, p.z, 'lookout', { hold: night ? 'lantern' : null, pose: night ? 'lantern' : null, icon: night ? '🏮' : '🛡', label: night ? L('Walking the night round', 'Haciendo la ronda nocturna') : L('On patrol', 'De ronda') });
        }
      },
      lookout: {
        chatty: true, effort: .2,
        enter(B, m) { m.data.yaw = B.n.g.rotation.y; B.status('🛡', L('Keeping watch', 'Vigilando')); if (isNight()) { B.hold('lantern'); B.pose = 'lantern' } },
        update(B, dt, m) { B.lockYaw = m.data.yaw + Math.sin(m.t * .8) * .9; if (m.t > 5) { stat(B, 'rounds'); return 'decide' } }
      },
      warn: {
        pri: 3, transient: true,
        enter(B) { B.mem.warnAt = AV.now() + 40; B.stop(); B.faceTo(AV.P.x, AV.P.z); B.pose = 'scold'; B.say(lines(B, 'running'), true); stat(B, 'warnings'); B.status('✋', L('No running in the market!', '¡No se corre en el mercado!')) },
        update(B, dt, m) { if (m.t > 2.5) return 'back' }, exit(B) { B.pose = null }
      },
      pursue: {
        pri: 6, effort: 1.5,
        enter(B, m) { B.mem.alarm = null; B.hold(); B.pose = null; B.free(); m.data.rt = 0; B.status('🚨', L('Chasing down a troublemaker', 'Persiguiendo a un alborotador')); B.say(lines(B, 'chase'), true) },
        update(B, dt, m) {
          if (B.dist < 3.3) return 'scold';
          if (B.dist > 45 || m.t > 30) { B.say(lines(B, 'giveup'), true); return 'decide' }
          if ((m.data.rt -= dt) <= 0 || B.arrived || B.stuck) { m.data.rt = 1.2; B.walkTo(AV.P.x, AV.P.z, 2.6) }
        },
        exit(B) { B.stop() }
      },
      scold: {
        pri: 6,
        enter(B) { B.mem.strikes = (B.mem.strikes || 0) + 1; B.faceTo(AV.P.x, AV.P.z); B.pose = 'scold'; B.say(lines(B, B.mem.strikes > 1 ? 'scold2' : 'scold1'), true); stat(B, 'scoldings'); B.status('✋', L('Giving you a talking-to', 'Echándote la bronca')) },
        update(B, dt, m) { B.faceTo(AV.P.x, AV.P.z); if (m.t > 4) return 'watch' }, exit(B) { B.pose = null }
      },
      watch: {
        pri: 4, effort: .6,
        enter(B, m) { m.data.rt = 0; B.status('👀', L('Keeping an eye on you', 'Vigilándote')) },
        update(B, dt, m) {
          if (m.t > 14 || B.dist > 40) return 'decide';
          if (B.dist > 7 && (m.data.rt -= dt) <= 0) { m.data.rt = 1.5; B.walkTo(AV.P.x, AV.P.z, 1.8) } else if (B.dist < 5 && B.n.path) B.stop();
          if (!B.n.path) B.faceTo(AV.P.x, AV.P.z);
        },
        exit(B) { B.stop() }
      }
    },
    on: { alarm: (B, m, d) => { B.mem.alarm = d; return m.pri() < 6 ? 'pursue' : null } }
  },

  busker: {
    sleep: [23.5, 7.5], rates: { hunger: 1 / 170 },
    home: S => Object.assign({ yaw: S.busk.yaw }, S.busk),
    init(B) { B.mem.wallet = 0; musicFx(B); tipTarget(B) },
    decide(B) { return needs(B) || 'busk' },
    states: {
      busk: {
        chatty: true, effort: .9,
        enter(B, m) {
          const k = B.site.busk; if (!m.data.at) return walk(k.x, k.z, ['busk', { at: true }], { hold: 'guitar', icon: '🎸', label: L('Off to play some music', 'Va a tocar un rato') });
          B.faceTo(B.site.c.x, B.site.c.z); B.hold('guitar'); B.pose = 'play'; k.hat.visible = true; m.data.len = 45 + rnd() * 25; m.data.beat = 0; m.data.near = 0;
        },
        update(B, dt, m) {
          const k = B.site.busk; if (!m.data.at) return;
          if ((m.data.beat -= dt) <= 0) { m.data.beat = B.dist < 9 ? .26 : .36; strum(B) }
          if (rnd() < dt / 14) { k.coins++; stat(B, 'tips') }                       // passers-by drop a coin now and then
          if (B.dist < 7) { if ((m.data.near += dt) > 10 && !m.data.thanked) { m.data.thanked = true; B.say(lines(B, 'listener'), true) } } else m.data.near = 0;
          B.status('🎸', L('Busking · ' + k.coins + ' coins in the hat', 'Tocando en la calle · ' + k.coins + ' monedas'));
          if (m.t > m.data.len || B.needs.hunger > .8) return 'packup';
        },
        exit(B) { B.pose = null }
      },
      bow: { pri: 1, transient: true, enter(B) { B.pose = 'bow'; B.say(lines(B, 'tipped'), true) }, update(B, dt, m) { if (m.t > 1.8) return 'back' }, exit(B) { B.pose = null } },
      packup: {
        effort: .5,
        enter(B) { B.pose = 'lift'; B.status('🎸', L('Packing up', 'Recogiendo')) },
        update(B, dt, m) { if (m.t < 2) return; const k = B.site.busk; B.mem.wallet += k.coins; stat(B, 'earned', k.coins); stat(B, 'sets'); k.coins = 0; k.hat.visible = false; return 'decide' },
        exit(B) { B.pose = null }
      }
    },
    on: { tipped: (B, m) => m.state === 'busk' ? 'bow' : null }
  }
};

/* ======================= role extras: watering droplets, busker music + notes, tip hat ======================= */
function dropletFx(B) {
  const S = B.site, mt = new THREE.MeshBasicMaterial({ color: 0x8ac8ff, transparent: true, opacity: .8 }); mt.userData.lin = 1;
  const drops = []; for (let i = 0; i < 6; i++) { const d = new THREE.Mesh(G.sph, mt); d.scale.setScalar(.025); d.visible = false; S.root.add(d); drops.push({ d, t: i / 6 }) }
  const v = new THREE.Vector3();
  B.fx.push(dt => {
    const can = B.props.can, on = B.mem.drip && can && can.visible; if (on) can.userData.tip.getWorldPosition(v);
    for (const p of drops) { p.d.visible = on; if (!on) continue; p.t = (p.t + dt * 1.6) % 1; p.d.position.set(v.x + Math.sin(B.n.g.rotation.y) * p.t * .25, v.y - p.t * p.t * .9, v.z + Math.cos(B.n.g.rotation.y) * p.t * .25) }
  });
}
const MELODY = [0, 4, 7, 9, 7, 4, 2, 4, 0, 2, 4, 7, 12, 9, 7, 4];
let noteTex = null;
function musicFx(B) {
  const S = B.site;
  if (!noteTex || !noteTex.image) noteTex = AV.mkc(64, c => { c.font = 'bold 52px Georgia,serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#ffe08a'; c.strokeStyle = '#3a1d4e'; c.lineWidth = 6; c.strokeText('♪', 32, 34); c.fillText('♪', 32, 34) });
  const notes = []; for (let i = 0; i < 4; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: noteTex, transparent: true, depthWrite: false })); s.material.userData.lin = 1; s.scale.setScalar(.28); s.visible = false; S.root.add(s); notes.push({ s, t: 1 }) }
  B.mem.notes = notes; B.mem.ni = 0;
  B.fx.push(dt => { for (const n of notes) { if (n.t >= 1) { n.s.visible = false; continue } n.t += dt * .6; n.s.position.y += dt * .7; n.s.position.x += Math.sin(n.t * 9) * dt * .2; n.s.material.opacity = 1 - n.t } });
}
function strum(B) {
  const m = B.mem, i = m.mi = (m.mi || 0) + 1, n = m.notes[m.ni++ % m.notes.length], g = B.n.g.position;
  n.t = 0; n.s.visible = B.dist < 35; n.s.position.set(g.x + (rnd() - .5) * .4, g.y + 1.5, g.z + (rnd() - .5) * .4);
  const A = AV.audio; if (!A || !A.blip || B.dist > 18) return;
  const f = 262 * Math.pow(2, MELODY[i % MELODY.length] / 12), v = .07 * (1 - B.dist / 18);
  A.blip(f, .35, 'triangle', v); if (i % 4 === 0) A.blip(f / 2, .55, 'sine', v * .7);
}
function tipTarget(B) {
  const k = B.site.busk;
  B.ctx.T.push({ x: k.hatW.x, z: k.hatW.z, r: 1.5, label: () => tr('Tip ', 'Dar propina a ') + nameOf(B) + tr(' (2 credits)', ' (2 créditos)'),
    show: () => B.fsm.state === 'busk' && !!B.fsm.data.at && !B.n.ko,
    fn: () => { if (!AV.txn(-2, 'Tip for ' + nameOf(B))) return; k.coins++; stat(B, 'playerTips'); B.fsm.send('tipped'); AV.audio && AV.audio.blip(1320, .12, 'triangle', .12) } });
}
/* every sleeper gets a little "z z Z" above the head */
let zTex = null;
function zzzFx(B) {
  if (!zTex || !zTex.image) zTex = AV.mkc(128, c => { c.font = 'bold 40px Georgia,serif'; c.fillStyle = '#e8f0ff'; c.strokeStyle = '#1a1030'; c.lineWidth = 5; [['z', 20, 100, 26], ['z', 50, 70, 34], ['Z', 82, 38, 44]].forEach(([s, x, y, f]) => { c.font = 'bold ' + f + 'px Georgia,serif'; c.strokeText(s, x, y); c.fillText(s, x, y) }) });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: zTex, transparent: true, depthWrite: false })); s.material.userData.lin = 1; s.scale.setScalar(.55); s.visible = false; B.n.g.add(s);
  B.fx.push((dt, t) => { const on = B.fsm.state === 'sleep' && !!B.fsm.data.at; s.visible = on; if (on) { s.position.set(.25, 1.75 + (t * .25 % .3), .1); s.material.opacity = .6 + Math.sin(t * 2) * .3 } });
}

/* ======================= state machine definitions + spawning ======================= */
const DEFS = {};
function defFor(role) {
  const R = ROLES[role];
  return DEFS[role] || (DEFS[role] = { initial: 'decide', states: Object.assign({}, COMMON, R.states), on: Object.assign({}, ON, R.on || {}), any: (R.any || []).concat(ANY).sort((a, b) => b.pri - a.pri) });
}
const ORDER = ['mae', 'dash', 'tam', 'fern', 'bix', 'melo'];
const MARKET_WORLDS = ['ape_town', 'jungle_dub', 'verdalux'];   /* 2.1: village / fantasy settings only; a world can also ask with workers: true */
function spawnWorld(W) {
  if (!W || W.__workers || W.noWorkers || !W.ctx || !W.surface) return; if (!(W.workers || MARKET_WORLDS.indexOf(W.id) >= 0)) return; W.__workers = true;
  const ctx = W.ctx, rng = AV.rng((AV.S.seed || 1) * 31 + hash(W.id)), cast = (ctx.q === 0 ? ORDER.slice(0, 4) : ORDER.slice()).filter(id => AV.NPCS[id]);
  const c = findCenter(W, rng); if (!c) return;
  const S = buildSite(W, ctx, c, rng, cast); if (!S) return;
  const H = (x, z) => { const s = W.surface(x, z); return s == null ? 0 : s };
  for (const id of cast) {
    const N = AV.NPCS[id], R = ROLES[N.role], h = R.home(S);
    const n = NP.spawn(ctx, id, { x: h.x, z: h.z, y: H(h.x, h.z), H, yaw: h.yaw || 0, r: 3, speed: 1.2 });
    NP.brain(ctx, n, { role: N.role, fsm: defFor(N.role), rates: R.rates, init: B => { B.site = S; S.brains.push(B); zzzFx(B); if (R.init) R.init(B) } });
  }
  ctx.upd.push((dt, t) => siteTick(S, dt, t));
  W.market = S;
}
const prevEnter = AV.onWorldEnter;
AV.onWorldEnter = function (W) { if (prevEnter) prevEnter(W); try { spawnWorld(W) } catch (e) { console.warn('workers:', e) } };
AV.workers = { roles: ROLES, spawnWorld, defFor, site: () => AV.W && AV.W.market };
})(window.AV);
