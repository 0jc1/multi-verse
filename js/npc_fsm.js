/* APEVERSE - npc_fsm.js : state machines for NPCs.
   AV.fsm.create(def, self)  a small finite state machine (any object can own one):
       def = { initial, states: { name: { enter(self, m), update(self, dt, m), exit(self, m), on: { event: next | fn }, pri, transient } },
               on: { event: next | fn }            events every state understands (a state's own `on` wins)
               any: [{ to, pri, when(self, m) }] } interrupts, checked every tick; one fires only if its pri beats the current state's
     A transition is a state name, or [name, data] to pass parameters (read as m.data in the new state). enter/update/handlers return one
     (or nothing to stay). 'back' returns to the state before a transient one (a wave, a bark), with its data. pri may be a function.
     m.state · m.t (seconds in state) · m.data · m.go(next, why) · m.send(event, data) · m.update(dt) · m.log (latest transitions first)
   AV.npc.brain(ctx, n, opt)  puts an AV.npc character under a state machine (opt.fsm) and gives the states a toolkit:
       needs (energy, hunger, social: 0..1, drifting over time) · walkTo (route planned around colliders, timeout = B.stuck) ·
       pose (work poses layered on the classic pivots) · hold (props carried in front of the body) · status line under the name tag ·
       say (speech bubble) · faceTo / lockYaw · mem (scratch memory) · stats (what this NPC has accomplished).
     Talking to the NPC pauses its machine ('chatted' is sent afterwards); a punch sends 'knocked' and, once back up, 'hit'.
   AV.npc.brains()  the brains in the current world · AV.npc.debug()  prints them (state, needs, last transitions) to the console. */
'use strict';
(function (AV) {
const tr = AV.tr, NP = AV.npc;
const lerp = (a, b, k) => a + (b - a) * k, wrap = a => Math.atan2(Math.sin(a), Math.cos(a)), clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;

/* ======================= generic state machine ======================= */
const FSM = AV.fsm = {};
FSM.create = function (def, self) {
  const m = { def, self, state: null, data: null, prev: null, prevData: null, t: 0, log: [], listeners: [] };
  const parse = r => r == null || r === false ? null : Array.isArray(r) ? { to: r[0], data: r[1] } : { to: r, data: undefined };
  m.pri = () => { const S = m.state && def.states[m.state]; return !S ? -1 : typeof S.pri === 'function' ? S.pri(self, m) : S.pri || 0 };
  m.go = function (next, why, depth) {
    const r = parse(next); if (!r) return false;
    if (r.to === 'back') { r.to = m.prev || def.initial; if (r.data === undefined) r.data = m.prevData }
    const S = def.states[r.to]; if (!S) { console.warn('fsm: unknown state "' + r.to + '"'); return false }
    if ((depth || 0) > 8) { console.warn('fsm: transition loop at "' + r.to + '"'); return false }
    const from = m.state, cur = from && def.states[from];
    if (cur && cur.exit) cur.exit(self, m);
    if (from && !cur.transient) { m.prev = from; m.prevData = m.data }
    m.state = r.to; m.data = r.data === undefined ? {} : r.data; m.t = 0;
    m.log.unshift({ from, to: r.to, why: why || '', at: AV.now() }); if (m.log.length > 12) m.log.length = 12;
    for (const f of m.listeners) f(r.to, from, m);
    if (S.enter) { const n2 = S.enter(self, m); if (n2) m.go(n2, 'enter', (depth || 0) + 1) }
    return true;
  };
  m.send = function (evt, data) {
    if (!m.state) return false;
    const S = def.states[m.state], h = (S.on && S.on[evt]) || (def.on && def.on[evt]); if (!h) return false;
    const r = typeof h === 'function' ? h(self, m, data) : h;
    return r ? m.go(r, evt) : false;
  };
  m.update = function (dt) {
    if (!m.state) { m.go(def.initial, 'start'); return }
    m.t += dt;
    const pri = m.pri();
    if (def.any) for (const a of def.any) if ((a.pri || 0) > pri && a.to !== m.state && a.when(self, m)) { m.go(a.to, a.why || 'interrupt'); return }
    const S = def.states[m.state];
    if (S.update) { const r = S.update(self, dt, m); if (r) m.go(r, 'update') }
  };
  m.is = (...names) => names.indexOf(m.state) >= 0;
  return m;
};

/* ======================= navigation ======================= */
/* only the colliders near a segment, so long walks in big cities stay cheap */
function near(W, x0, z0, x1, z1, m) {
  const a = Math.min(x0, x1) - m, b = Math.max(x0, x1) + m, c = Math.min(z0, z1) - m, d = Math.max(z0, z1) + m;
  return { cols: W.cols.filter(k => k[1] > a && k[0] < b && k[3] > c && k[2] < d), circ: W.circles.filter(k => k[0] + k[2] > a && k[0] - k[2] < b && k[1] + k[2] > c && k[1] - k[2] < d) };
}
/* can a person walk the straight line a -> b (no walls, no water/void, no cliff steps)? endpoints are not tested */
NP.clear = function (W, ax, az, bx, bz, m) {
  m = m == null ? .3 : m; const L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.ceil(L / .6)), bl = near(W, ax, az, bx, bz, m);
  let py = W.surface(ax, az);
  for (let i = 1; i < n; i++) {
    const f = i / n, x = ax + (bx - ax) * f, z = az + (bz - az) * f, y = W.surface(x, z);
    if (y == null || (py != null && Math.abs(y - py) > .9)) return false; py = y;
    for (const k of bl.cols) if (x > k[0] - m && x < k[1] + m && z > k[2] - m && z < k[3] + m) return false;
    for (const k of bl.circ) if (Math.hypot(x - k[0], z - k[1]) < k[2] + m) return false;
  }
  return true;
};
/* a short route (1-3 legs) around whatever is in the way, or null */
NP.route = function (W, ax, az, bx, bz) {
  if (NP.clear(W, ax, az, bx, bz)) return [[bx, bz]];
  const dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz) || 1, px = -dz / L, pz = dx / L, ok = (x, z) => AV.isFree(W, x, z, .45);
  for (const f of [.5, .3, .7]) for (const o of [2.5, -2.5, 5, -5, 8, -8, 12, -12]) {
    const mx = ax + dx * f + px * o, mz = az + dz * f + pz * o;
    if (ok(mx, mz) && NP.clear(W, ax, az, mx, mz) && NP.clear(W, mx, mz, bx, bz)) return [[mx, mz], [bx, bz]];
  }
  for (const o of [3, -3, 6, -6, 10, -10]) {
    const m1 = [ax + px * o + dx * .15, az + pz * o + dz * .15], m2 = [ax + px * o + dx * .85, az + pz * o + dz * .85];
    if (ok(m1[0], m1[1]) && ok(m2[0], m2[1]) && NP.clear(W, ax, az, m1[0], m1[1]) && NP.clear(W, m1[0], m1[1], m2[0], m2[1]) && NP.clear(W, m2[0], m2[1], bx, bz)) return [m1, m2, [bx, bz]];
  }
  return null;
};

/* ======================= poses (on top of npc.js, which runs first every frame) ======================= */
/* channels: aRx aRz aLx aLz (arms), legs (both legs; < -1 seats the soft rig), head (pitch, + looks down). A missing channel is left to
   npc.js (walk swing, talking gestures); a channel that stops being posed blends back smoothly. */
const POSES = NP.poses = {
  sit: () => ({ legs: -1.45, aRx: -.3, aLx: -.3 }),
  sleep: t => ({ legs: -1.45, aRx: -.2, aLx: -.2, head: .55 + Math.sin(t * .8) * .03 }),
  carry: () => ({ aRx: -1.2, aLx: -1.2, aRz: -.12, aLz: .12 }),
  water: t => ({ aRx: -1.0 + Math.sin(t * 1.3) * .05, aRz: .08, head: .3 }),
  fill: () => ({ aRx: -.45, head: .4 }),
  sweep: t => { const s = Math.sin(t * 3.4); return { aRx: -.75 + s * .3, aLx: -.55 + s * .3, aRz: -.22, aLz: .22, head: .3 } },
  lean: () => ({ aRx: -.75, aLx: -.6, aRz: -.15, aLz: .15 }),
  lift: () => ({ aRx: -.95, aLx: -.95, head: .5 }),
  give: () => ({ aRx: -1.35, aLx: -1.35 }),
  arrange: t => ({ aRx: -.9 + Math.sin(t * 5) * .25, aLx: -.9 - Math.sin(t * 5) * .25, head: .4 }),
  hawk: t => ({ aRx: -2.5, aRz: .35 + Math.sin(t * 8) * .25 }),
  wave: t => ({ aRx: -2.7, aRz: .5 + Math.sin(t * 10) * .4 }),
  call: () => ({ aRx: -2.0, aLx: -2.0, aRz: -.25, aLz: .25 }),
  scold: t => ({ aRx: -1.5 + Math.sin(t * 9) * .2, aRz: .1, head: -.05 }),
  play: t => ({ aLx: -.95, aLz: -.45, aRx: -.75 + Math.sin(t * 12) * .12, head: .15 }),
  eat: t => ({ aRx: (t % 3) < 1.2 ? -2.0 : -.6, head: .1 }),
  bow: () => ({ head: .6, aRx: -.3, aLx: -.3 }),
  talk: t => ({ aRx: -.6 + Math.sin(t * 3) * .25, aLx: -.3 + Math.sin(t * 2.3 + 1) * .1 }),
  inspect: () => ({ head: .55, aRx: -.6 }),
  dump: () => ({ aRx: -1.6, aLx: -1.6 }),
  lantern: () => ({ aLx: -.5 })
};
const CH = ['aRx', 'aRz', 'aLx', 'aLz', 'legs', 'head'];
function readCh(u, c) { return c === 'aRx' ? u.aR.rotation.x : c === 'aRz' ? u.aR.rotation.z : c === 'aLx' ? u.aL.rotation.x : c === 'aLz' ? u.aL.rotation.z : c === 'legs' ? u.lL.rotation.x : u.head.rotation.x }
function writeCh(u, c, v) { if (c === 'aRx') u.aR.rotation.x = v; else if (c === 'aRz') u.aR.rotation.z = v; else if (c === 'aLx') u.aL.rotation.x = v; else if (c === 'aLz') u.aL.rotation.z = v; else if (c === 'legs') { u.lL.rotation.x = v; u.lR.rotation.x = v } else u.head.rotation.x = v }
function applyPose(B, dt, t, talking, moving) {
  const n = B.n, g = n.g, u = g.userData; if (!u.aR || !u.aL || !u.lL || !u.head) return;
  const f = !talking && POSES[B.pose], tg = f ? f(t, B) : {}, k = 1 - Math.exp(-8 * dt);
  if (moving) delete tg.legs;
  for (const c of CH) {
    const cur = readCh(u, c);
    if (tg[c] != null) { B.pc[c] = lerp(B.pc[c] == null ? cur : B.pc[c], tg[c], k); writeCh(u, c, B.pc[c]) }
    else if (B.pc[c] != null) { const base = c === 'aRz' || c === 'aLz' ? 0 : cur; B.pc[c] = lerp(B.pc[c], base, k); writeCh(u, c, B.pc[c]); if (Math.abs(B.pc[c] - base) < .01) B.pc[c] = null }
  }
  /* work facing: keep looking at the job instead of turning to every passer-by (npc.js turns to the player when close) */
  if (B.lockYaw != null && !talking && !moving) { B.ry += wrap(B.lockYaw - B.ry) * Math.min(1, 6 * dt); g.rotation.y = B.ry } else B.ry = g.rotation.y;
  for (const k2 in B.props) { const p = B.props[k2]; if (p.visible && p.userData.anim) p.userData.anim(p, t, B) }
  if (B.fx) for (const fn of B.fx) fn(dt, t);
}

/* ======================= status line under the name tag ======================= */
function statusTex(icon, text) {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 72; const c = cv.getContext('2d');
  let fs = 30; do { c.font = 'bold ' + fs + 'px "Segoe UI","Helvetica Neue",Arial,sans-serif'; fs -= 2 } while (c.measureText(icon + '  ' + text).width > 470 && fs > 14);
  const w = Math.min(500, c.measureText(icon + '  ' + text).width + 36), x0 = 256 - w / 2;
  c.fillStyle = 'rgba(20,8,34,.78)'; c.beginPath(); c.moveTo(x0 + 18, 8); c.arcTo(x0 + w, 8, x0 + w, 64, 28); c.arcTo(x0 + w, 64, x0, 64, 28); c.arcTo(x0, 64, x0, 8, 28); c.arcTo(x0, 8, x0 + w, 8, 28); c.closePath(); c.fill();
  c.fillStyle = '#fff4d8'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(icon + '  ' + text, 256, 37);
  const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; return t;
}
NP.showStatus = true;

/* ======================= brain ======================= */
NP.brains = () => (AV.W && AV.W.ctx && AV.W.ctx.brainList) || [];
NP.hour = () => (AV.S.time / 60) % 24;
NP.brain = function (ctx, n, opt) {
  const r = Math.random, B = {
    n, ctx, id: n.id, role: opt.role || '', needs: { energy: .75 + r() * .25, hunger: r() * .35, social: r() * .35 },
    rate: Object.assign({ energy: 1 / 260, hunger: 1 / 210, social: 1 / 170 }, opt.rates || {}),
    pose: null, pc: {}, props: {}, lockYaw: null, ry: n.g.rotation.y, mem: {}, stats: {}, fx: [],
    dist: 1e9, arrived: false, stuck: false, walkT: 0, walkMax: 0, sayT: 0, statusKey: '', statusLine: ['', ''], down: false, talking: false
  };
  n.brain = B;
  /* --- walking --- */
  B.walkTo = function (x, z, speed) {
    const W = AV.W, g = n.g; B.arrived = false; B.stuck = false; B.walkT = 0;
    if (Math.hypot(x - g.position.x, z - g.position.z) < .35) { B.stop(); B.arrived = true; return true }
    let path = W ? NP.route(W, g.position.x, g.position.z, x, z) : null;
    if (!path && Math.hypot(x - g.position.x, z - g.position.z) < 4) path = [[x, z]];
    if (!path) return false;
    let len = 0, px = g.position.x, pz = g.position.z; for (const p of path) { len += Math.hypot(p[0] - px, p[1] - pz); px = p[0]; pz = p[1] }
    const sp = speed || 1.2; B.walkMax = len / sp * 2 + 8;
    n.go(path.map(p => [p[0], p[1], 0]), { speed: sp, onArrive: () => { B.arrived = true } });
    return true;
  };
  B.stop = () => { n.path = null; n.onArrive = null };
  B.near = (x, z, r) => Math.hypot(x - n.g.position.x, z - n.g.position.z) < (r || .6);
  B.faceTo = (x, z) => { const a = Math.atan2(x - n.g.position.x, z - n.g.position.z); n.yaw = a; B.lockYaw = a; return a };
  B.free = () => { B.lockYaw = null };
  /* --- props carried in front of the body (factories in NP.props) --- */
  B.hold = function (...names) {
    for (const k in B.props) B.props[k].visible = names.indexOf(k) >= 0;
    for (const k of names) if (k && !B.props[k] && NP.props[k]) { const p = NP.props[k](B); AV.lin(p); n.g.add(p); B.props[k] = p; p.visible = true }
  };
  /* --- talking --- */
  B.say = function (lines, force) {
    const now = AV.now(); if (!lines || (!force && now < B.sayT) || B.dist > 24 || n.ko) return;
    const l = Array.isArray(lines[0]) ? lines[Math.random() * lines.length | 0] : lines;
    NP.bark(n, tr(l[0], l[1]).replace(/%n/g, AV.S.name || tr('stranger', 'forastero'))); B.sayT = now + 7;
  };
  /* --- status line --- */
  const tagY = n.tag.position.y, sp = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false, fog: false }));
  sp.material.userData.lin = 1; sp.scale.set(2.1, .3, 1); sp.position.set(0, tagY - .36, 0); sp.visible = false; n.g.add(sp); B.label = sp;
  B.status = function (icon, line) {
    const key = icon + line[0] + AV.ui; B.statusLine = line; B.statusIcon = icon; if (key === B.statusKey) return; B.statusKey = key;
    const m = sp.material; if (m.map) m.map.dispose(); m.map = statusTex(icon, tr(line[0], line[1])); m.needsUpdate = true;
  };
  B.fsm = FSM.create(opt.fsm, B);
  if (opt.init) opt.init(B);
  /* pose layer runs right after the NPC's own animation */
  const anim0 = n.anim; n.anim = (n2, dt, t, d, talking, moving) => { if (anim0) anim0(n2, dt, t, d, talking, moving); applyPose(B, dt, t, talking, moving) };
  if (!ctx.brainList) { ctx.brainList = []; ctx.upd.push((dt, t) => tick(ctx.brainList, dt, t)) }
  ctx.brainList.push(B);
  return B;
};
NP.props = {};

let lastP = null;
function tick(list, dt, t) {
  dt = Math.min(dt, .1);
  const P = AV.P, ch = AV.chat, now = AV.now();
  /* the player's ground speed, shared by every brain this frame (guards notice running) */
  if (lastP) { const v = Math.hypot(P.x - lastP[0], P.z - lastP[1]) / Math.max(dt, 1e-3); NP.playerSpeed = AV.drive || v > 15 ? 0 : v }   // > 15 m/s: a teleport, not a sprint
  lastP = [P.x, P.z];
  for (const B of list) {
    const n = B.n, g = n.g;
    B.dist = Math.hypot(P.x - g.position.x, P.z - g.position.z);
    B.label.visible = NP.showStatus && B.dist < 16 && !n.ko && !(ch.open && ch.who === n.id);
    if (n.ko) { if (!B.down) { B.down = true; B.stop(); B.fsm.send('knocked') } continue }
    if (B.down) { B.down = false; B.fsm.send('hit') }
    if (ch.open && ch.who === n.id) { B.talking = true; continue }
    if (B.talking) { B.talking = false; B.fsm.send('chatted') }
    const nd = B.needs, S = B.fsm.def.states[B.fsm.state], effort = S && S.effort != null ? S.effort : .5;
    nd.energy = clamp01(nd.energy - B.rate.energy * dt * effort); nd.hunger = clamp01(nd.hunger + B.rate.hunger * dt); nd.social = clamp01(nd.social + B.rate.social * dt);
    if (n.path) { if (B.dist > 3.4) B.walkT += dt; if (B.walkT > B.walkMax) { B.stuck = true; B.stop() } }
    B.fsm.update(dt);
  }
}

/* console helper: who is doing what, and why they changed their mind */
NP.debug = function () {
  const rows = NP.brains().map(B => ({ npc: B.n.id, role: B.role, state: B.fsm.state, secs: +B.fsm.t.toFixed(1), energy: +B.needs.energy.toFixed(2), hunger: +B.needs.hunger.toFixed(2), social: +B.needs.social.toFixed(2),
    stats: JSON.stringify(B.stats), last: B.fsm.log.slice(0, 4).map(l => (l.from || '·') + '→' + l.to + (l.why ? ' (' + l.why + ')' : '')).join(', ') }));
  console.table(rows); return rows;
};
})(window.AV);
