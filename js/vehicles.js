/* APEVERSE - vehicles.js : Living Playground, Milestone 6 (bicycles, scooters, e-scooters, hover scooter).
   You rent a vehicle at a stand (or take a free community bike), get on, and ride it yourself in first person:
     W / S (or the joystick) = throttle / brake + reverse, A / D = steer, the mouse / look also steers, Shift = pedal hard (bicycle),
     F / left click (phone: HORN / BELL) = horn or bell, Esc / Leave = get off. The vehicle stays parked where you got off and
     the rental lasts until midnight (game time). Return it at the stand, or it is collected after midnight.
   Riding uses the shared activity framework (AV.act): one activity at a time, punch off, phone ACTION + LEAVE buttons.
   Movement goes through AV.drive (core.js), so walls, kerbs, slopes and water stop a vehicle exactly like they stop you.
   Engine sounds are procedural (Web Audio); no audio files are added. */
'use strict';
(function (AV) {
const tr = AV.tr, $ = AV.$, ACT = AV.act, CY = AV.city, L = (e, s) => [e, s], say = a => tr(a[0], a[1]);
if (!ACT) return;
const A = AV.audio || {};
const KINDS = {
  bicycle: { n: L('Bicycle', 'Bicicleta'), icon: '🚲', top: 6, boost: 8.5, acc: 2.4, brake: 6, turn: 2.3, eye: 1.62, back: .25, horn: 'bell' },
  scooter: { n: L('Scooter', 'Moto'), icon: '🛵', top: 12.5, boost: 12.5, acc: 4.5, brake: 9, turn: 1.8, eye: 1.55, back: .28, horn: 'horn', engine: 'petrol', helmet: true },
  escooter: { n: L('E-scooter', 'Patinete eléctrico'), icon: '🛴', top: 6.5, boost: 6.5, acc: 3, brake: 7, turn: 2.5, eye: 1.78, back: 0, horn: 'bell', engine: 'electric' },
  hover: { n: L('Hover scooter', 'Patinete flotante'), icon: '🛸', top: 9, boost: 9, acc: 4, brake: 5, turn: 2.6, eye: 1.85, back: 0, horn: 'chime', engine: 'hover' },
  tuktuk: { n: L('Tuk-tuk', 'Tuk-tuk'), icon: '🛺', top: 9, boost: 10.5, acc: 3.2, brake: 8, turn: 1.5, eye: 1.55, back: -.36, horn: 'horn', engine: 'petrol' },
  car: { n: L('Small car', 'Coche pequeño'), icon: '🚗', top: 15, boost: 17, acc: 4.2, brake: 10, turn: 1.25, eye: 1.2, back: -.3, horn: 'horn', engine: 'petrol' },
  hoverbike: { n: L('Hover bike', 'Moto flotante'), icon: '🏍', top: 17, boost: 21, acc: 6.5, brake: 9, turn: 2, eye: 1.7, back: .3, horn: 'chime', engine: 'hover' }
};
const VEH = AV.veh = { KINDS };
const st = () => { const S = AV.S; S.veh = S.veh || { list: [], n: 0 }; return S.veh };
const blip = (f, d, w, v) => A.blip && A.blip(f, d, w, v);

/* ---------- meshes (front = +z, ground = y 0) ---------- */
const meshCache = {};
function geoFor(kind, col) {
  const k = kind + col; if (meshCache[k]) return meshCache[k];
  let g;
  if (/^(bicycle|scooter|tuktuk|car)$/.test(kind) && CY && CY.VB && CY.VB[kind]) g = CY.VB[kind](col, { rider: false });
  else if (kind === 'hoverbike') {   /* sleek alien hover bike: teardrop body, cockpit, windscreen, two glowing ring pods */
    const B = AV.kit.BG, M = AV.kit.M; g = AV.kit.merge([[B.sph, col, M(0, .55, 0, .38, .3, 1.15)], [B.sph, 0x1a1a24, M(0, .78, -.15, .24, .16, .5)], [B.box, 0x9ae8ff, M(0, .95, .55, .3, .22, .04, -.5, 0, 0)], [B.cyl, 0x2a2a32, M(0, .35, .75, .32, .12, .32, 0, 0, Math.PI / 2)], [B.cyl, 0x2a2a32, M(0, .35, -.75, .32, .12, .32, 0, 0, Math.PI / 2)], [B.cyl, 0xff4ad2, M(0, .2, .75, .34, .04, .34), 1], [B.cyl, 0x4ad8ff, M(0, .2, -.75, .34, .04, .34), 1], [B.box, 0x1a1a1a, M(0, 1.02, .42, .7, .04, .04)]]);
  } else {   /* kick e-scooter / hover scooter: deck, stem, bars, two small wheels (or a glow pad) */
    const K = AV.kit, BX = K.BG.box, M = K.M, hov = kind === 'hover', parts = [[BX, col, M(0, hov ? .32 : .12, 0, .2, .05, .8)], [BX, 0x2a2a2e, M(0, hov ? .7 : .58, .38, .04, .95, .04, -.12, 0, 0)], [BX, 0x1a1a1a, M(0, hov ? 1.15 : 1.04, .44, .5, .035, .035)], [BX, 0xe8f0ff, M(0, hov ? .9 : .8, .44, .08, .05, .03), 1]];
    if (hov) parts.push([BX, 0x4ad8ff, M(0, .2, 0, .26, .03, .86), 1]);
    else parts.push([K.BG.cyl, 0x141414, M(0, .1, .36, .1, .05, .1, 0, 0, Math.PI / 2)], [K.BG.cyl, 0x141414, M(0, .1, -.36, .1, .05, .1, 0, 0, Math.PI / 2)]);
    g = K.merge(parts);
  }
  return meshCache[k] = g;
}
let vmat = null; const mat = () => vmat || (vmat = CY && CY.vehMat ? CY.vehMat(null) : new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .5 }));
const mkMesh = (kind, col) => new THREE.Mesh(geoFor(kind, col), mat());

/* ---------- your rented vehicles in this world (parked, with a "Ride" interaction) ---------- */
let live = [];   // { rec, mesh, T }
const valid = r => r.until >= AV.S.day;
const fwd = yaw => [-Math.sin(yaw), -Math.cos(yaw)];
function placeMesh(o, x, z, yaw, y, lean) { const k = KINDS[o.rec.kind], f = fwd(yaw); o.mesh.position.set(x + f[0] * k.back, y + (/hover/.test(o.rec.kind) ? .12 + Math.sin(AV.now() * 3) * .04 : 0), z + f[1] * k.back); o.mesh.rotation.set(0, yaw + Math.PI, lean || 0) }
function spawnParked(W, rec) {
  const o = { rec, mesh: mkMesh(rec.kind, rec.col) }; W.group.add(o.mesh); placeMesh(o, rec.x, rec.z, rec.yaw, W.surface(rec.x, rec.z) || 0);
  o.T = { x: rec.x, z: rec.z, r: 1.8, show: () => !ACT.cur && valid(rec), label: () => KINDS[rec.kind].icon + ' ' + tr('Ride your ', 'Montar: ') + say(KINDS[rec.kind].n).toLowerCase() + (rec.price ? tr(' (rented until midnight)', ' (alquiler hasta medianoche)') : ''), fn: () => VEH.ride(rec) };
  W.T.push(o.T); live.push(o); return o;
}
function dropLive(o) { if (o.mesh.parent) o.mesh.parent.remove(o.mesh); const W = AV.W; if (W) { const i = W.T.indexOf(o.T); if (i >= 0) W.T.splice(i, 1) } live = live.filter(x => x !== o) }
VEH.mine = () => st().list.filter(r => AV.W && r.w === AV.W.id && valid(r));
VEH.live = () => live;

/* rent (or take) a vehicle: it appears at (x, z) and you get on at once */
VEH.rent = function (kind, x, z, yaw, opt) {
  opt = opt || {}; const W = AV.W, S = st(); if (!W || !KINDS[kind]) return null;
  const rec = { id: ++S.n, w: W.id, kind, x, z, yaw: yaw || 0, until: AV.S.day, price: opt.price || 0, stand: opt.stand || null, col: opt.col != null ? opt.col : 0x2a6ad8 };
  S.list.push(rec); spawnParked(W, rec); if (opt.ride !== false) VEH.ride(rec); return rec;
};
/* give it back (at a stand): removes it everywhere */
VEH.giveBack = function (rec) { if (!rec) return; if (ACT.cur && ACT.cur.id === 'ride' && ACT.cur.rec === rec) ACT.end('return'); const S = st(); S.list = S.list.filter(r => r !== rec); live.filter(o => o.rec === rec).forEach(dropLive) };
VEH.ride = rec => ACT.start('ride', { rec });
/* polish pass: a rented vehicle faces the most open direction (not a wall), preferring the stand's own heading */
VEH.openYaw = function (W, x, z, pref) { let best = pref, bl = -1; for (let k = 0; k < 16; k++) { const yaw = pref + k / 16 * Math.PI * 2, f = [-Math.sin(yaw), -Math.cos(yaw)]; let l = 0; while (l < 14 && W.surface(x + f[0] * (l + 1), z + f[1] * (l + 1)) !== null && AV.isFree(W, x + f[0] * (l + 1), z + f[1] * (l + 1), .9)) l += 1; if (l > bl + .5) { bl = l; best = yaw } if (l >= 14) break } return best };

/* ---------- the ride activity ---------- */
let eng = null;
function engineStart(K) {
  if (!K.engine || !A.ok || A.mute || !A.ctx) return null; const c = A.ctx, o = c.createOscillator(), o2 = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
  o.type = K.engine === 'petrol' ? 'sawtooth' : 'sine'; o2.type = K.engine === 'petrol' ? 'square' : 'triangle'; f.type = 'lowpass'; f.frequency.value = K.engine === 'petrol' ? 420 : 1800; g.gain.value = 0;
  o.connect(f); o2.connect(f); f.connect(g); g.connect(A.mediaBus || c.destination); o.start(); o2.start(); return { o, o2, f, g, K };
}
function engineSet(e, v, top) { if (!e) return; const c = A.ctx, u = Math.min(1, Math.abs(v) / top), t = c.currentTime;
  if (e.K.engine === 'petrol') { e.o.frequency.setTargetAtTime(38 + u * 70, t, .08); e.o2.frequency.setTargetAtTime(19 + u * 35, t, .08); e.g.gain.setTargetAtTime(.05 + u * .05, t, .1) }
  else if (e.K.engine === 'electric') { e.o.frequency.setTargetAtTime(300 + u * 900, t, .1); e.o2.frequency.setTargetAtTime(150 + u * 450, t, .1); e.g.gain.setTargetAtTime(u * .025, t, .1) }
  else { e.o.frequency.setTargetAtTime(110 + u * 160, t, .1); e.o2.frequency.setTargetAtTime(220 + u * 330, t, .1); e.g.gain.setTargetAtTime(.02 + u * .025, t, .1) } }
function engineStop(e) { if (!e) return; try { const t = A.ctx.currentTime; e.g.gain.setTargetAtTime(0, t, .08); e.o.stop(t + .4); e.o2.stop(t + .4) } catch (x) { } }
function horn(K) { if (K.horn === 'bell') { blip(1760, .25, 'sine', .14); setTimeout(() => blip(1760, .3, 'sine', .12), 140) } else if (K.horn === 'chime') { blip(880, .2, 'sine', .12); setTimeout(() => blip(1320, .3, 'sine', .1), 120) } else { blip(420, .32, 'square', .08); blip(530, .32, 'square', .06) } }

ACT.register('ride', {
  btn: ['HORN', 'BOCINA'],
  start(s) {
    const rec = s.rec, K = s.K = KINDS[rec.kind], P = AV.P, W = AV.W;
    s.o = live.find(o => o.rec === rec) || spawnParked(W, rec); s.v = 0; s.lean = 0; s.dist = 0; s.top = 0; s.bumps = 0;
    P.x = rec.x; P.z = rec.z; P.y = W.surface(P.x, P.z) || 0; P.vx = P.vz = P.vy = 0; P.yaw = rec.yaw; s.lx = P.x; s.lz = P.z;
    AV.drive = (dt, f, sd, run) => drive(s, dt, f, sd, run); eng = engineStart(K);
    if (K.horn === 'bell') blip(1760, .2, 'sine', .1); else if (K.engine === 'petrol') blip(140, .35, 'sawtooth', .06);
    const S = ACT.stats('ride'); if (!S.told) { S.told = 1; AV.toast(AV.device === 'phone' ? tr('Joystick: up = go, down = brake, sideways = steer. Leave = get off.', 'Joystick: arriba = acelerar, abajo = frenar, a los lados = girar. Salir = bajarte.') : tr('W / S: go and brake · A / D or the mouse: steer · Shift: pedal hard · F: ' + (K.horn === 'horn' ? 'horn' : 'bell') + ' · Esc: get off', 'W / S: acelerar y frenar · A / D o el ratón: girar · Shift: pedalear fuerte · F: ' + (K.horn === 'horn' ? 'bocina' : 'timbre') + ' · Esc: bajarte')) }
    if (K.helmet) AV.toast(tr('Helmet on. Keep left in Thailand, right in Vietnam!', 'Casco puesto. ¡Por la izquierda en Tailandia, por la derecha en Vietnam!'));
  },
  end(s, why) {
    AV.drive = null; engineStop(eng); eng = null; const P = AV.P, rec = s.rec, W = AV.W;
    if (why !== 'world' && why !== 'return' && W === s.W) {
      /* park where you got off (or where you were before a teleport) and step off to the side */
      const px = why === 'teleport' ? s.lx : P.x, pz = why === 'teleport' ? s.lz : P.z; rec.x = px; rec.z = pz; rec.yaw = P.yaw; placeMesh(s.o, px, pz, P.yaw, W.surface(px, pz) || 0); s.o.T.x = px; s.o.T.z = pz;
      if (why !== 'teleport') { const r = [Math.cos(P.yaw), -Math.sin(P.yaw)]; for (const d of [.9, -.9, 1.4, -1.4]) { const x = px + r[0] * d, z = pz + r[1] * d; if (AV.isFree(W, x, z, .35)) { P.x = x; P.z = z; break } } P.vx = P.vz = 0 }
    }
    AV.cam.rotation.z = 0; const S = ACT.stats('ride'); S.rides = (S.rides || 0) + 1; S.km = Math.round(((S.km || 0) + s.dist / 1000) * 1000) / 1000; S.top = Math.max(S.top || 0, Math.round(s.top * 3.6));
    S.by = S.by || {}; S.by[rec.kind] = (S.by[rec.kind] || 0) + Math.round(s.dist);
    if (!valid(rec)) { live.filter(o => o.rec === rec).forEach(dropLive); st().list = st().list.filter(r => r !== rec); AV.toast(tr('It’s past midnight: the rental shop collects the ', 'Es más de medianoche: la tienda se lleva el vehículo: ') + say(s.K.n).toLowerCase() + '.') }
    else if (why === 'leave') AV.toast(s.K.icon + ' ' + tr('Parked. ', 'Aparcado. ') + Math.round(s.dist) + ' m' + tr(' ridden.', ' recorridos.'));
  },
  press(s, on) { if (on) horn(s.K) },
  hud(s) { const K = s.K; return '<b>' + K.icon + ' ' + say(K.n) + '</b> · <b id="vSpd">0</b> km/h · <span id="vDist">0</span> m<br><small>' + (AV.device === 'phone' ? tr('Joystick: go / brake / steer', 'Joystick: acelerar / frenar / girar') : tr('W/S go · brake · A/D or mouse steer' + (K.boost > K.top ? ' · Shift pedal hard' : '') + ' · F ', 'W/S acelerar · frenar · A/D o ratón girar' + (K.boost > K.top ? ' · Shift pedalear fuerte' : '') + ' · F ') + (K.horn === 'horn' ? tr('horn', 'bocina') : tr('bell', 'timbre'))) + '</small>' },
  wire(s) { const b = $('actLeave'); if (b) b.textContent = tr('Get off (Esc)', 'Bajarse (Esc)'); if (AV.device === 'phone') { const g = $('actGo'); if (g) g.textContent = s.K.horn === 'horn' ? tr('HORN', 'BOCINA') : tr('BELL', 'TIMBRE') } },
  update(s, rdt, t) {
    const P = AV.P, W = AV.W, K = s.K, moved = Math.hypot(P.x - s.lx, P.z - s.lz);
    if (moved > 12) return ACT.end('teleport');   // a tuk-tuk, a portal, sleeping... moved you: the vehicle stays where it was
    if (W.gravityAt && W.gravityAt(P.x, P.z) === 0) { AV.toast(tr('No gravity here: you float off the ' + say(K.n).toLowerCase() + '.', 'Aquí no hay gravedad: sales flotando del vehículo.')); return ACT.end('leave') }
    /* real progress vs what the throttle asked for: a wall or kerb stops you (bump when fast) */
    if (s.want > .02) { const ratio = moved / s.want; if (ratio < .35 && Math.abs(s.v) > 1.2) { if (Math.abs(s.v) > 4.5) { s.bumps++; blip(90, .18, 'triangle', .2); AV.toast(tr('Bonk! Watch the walls.', '¡Pum! Cuidado con las paredes.')) } s.v *= .2 } }
    if (AV.blocking()) s.v *= Math.max(0, 1 - rdt * 3);
    s.want = 0; s.dist += moved; s.lx = P.x; s.lz = P.z; s.top = Math.max(s.top, Math.abs(s.v));
    const reduce = AV.S.set && AV.S.set.reduce, y = P.y, lean = reduce ? 0 : s.lean;
    placeMesh(s.o, P.x, P.z, P.yaw, y, -lean * .8);
    AV.cam.position.y = y + K.eye + (reduce || K.engine !== 'petrol' ? 0 : Math.sin(t * 40) * .004 * Math.min(1, Math.abs(s.v) / 3)); AV.cam.rotation.z = lean;
    engineSet(eng, s.v, K.top);
    if ((s.hudT = (s.hudT || 0) - rdt) <= 0) { s.hudT = .2; const a = $('vSpd'), d = $('vDist'); if (a) a.textContent = Math.round(Math.abs(s.v) * 3.6); if (d) d.textContent = Math.round(s.dist) }
  }
});
/* throttle + steering -> velocity (called by core.js every frame while you ride) */
function drive(s, dt, f, sd, run) {
  const K = s.K, P = AV.P, top = run ? K.boost : K.top;
  if (f > 0) { if (s.v < 0) s.v = Math.min(0, s.v + K.brake * dt); else if (s.v < top) s.v = Math.min(top, s.v + K.acc * f * dt * (1 - .5 * s.v / top)); else s.v = Math.max(top, s.v - K.brake * .4 * dt) }
  else if (f < 0) { if (s.v > 0) s.v = Math.max(0, s.v - K.brake * -f * dt); else s.v = Math.max(-1.6, s.v - 1.5 * -f * dt) }
  else { const drag = (.5 + .012 * s.v * s.v) * dt; s.v = Math.abs(s.v) <= drag ? 0 : s.v - Math.sign(s.v) * drag }
  if (!P.on) s.v *= 1 - Math.min(1, .3 * dt);
  const grip = Math.min(1, Math.abs(s.v) / 2.2 + .15), turn = K.turn * grip * (s.v < 0 ? -1 : 1) / (1 + Math.abs(s.v) * .04);
  P.yaw -= sd * turn * dt; const tl = -sd * Math.min(.16, Math.abs(s.v) / K.top * .16); s.lean += (tl - s.lean) * Math.min(1, dt * 5);
  s.want = Math.abs(s.v) * dt; const fv = fwd(P.yaw); return [fv[0] * s.v, fv[1] * s.v];
}

/* ---------- rental stands, placed from configuration (AV.act.PLACES) ---------- */
ACT.register('rental', { place(W, p) {
  const fs = (x, z, r) => { for (let d = 0; d < 14; d++) for (let k = 0; k < Math.max(1, d * 6); k++) { const a = k / Math.max(1, d * 6) * Math.PI * 2, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d; if (AV.isFree(W, px, pz, r) && !W.T.some(t => Math.hypot(t.x - px, t.z - pz) < t.r + 1)) return [px, pz] } return null };
  const sp = fs(p.x, p.z, 2.2); if (!sp) return null; const [x, z] = sp, y = W.surface(x, z) || 0, ry = p.ry || 0, K = KINDS[p.kind], g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry;
  /* a rack with three of them on display + a small sign post */
  const cols = p.cols || [0x2a6ad8, 0xc83a3a, 0x3a7a4a];
  for (let i = 0; i < 3; i++) { const m = mkMesh(p.kind, cols[i % cols.length]); m.position.set((-1.1 + i * 1.1) * (/car|tuktuk/.test(p.kind) ? 2.4 : /hoverbike/.test(p.kind) ? 1.5 : 1), /hover/.test(p.kind) ? .15 : 0, 0); g.add(m) }
  const post = new THREE.Mesh(AV.G.box, AV.std(0x3a3a3a, .6)); post.scale.set(.08, 2.4, .08); post.position.set(-2, 1.2, 0); g.add(post);
  const board = new THREE.Mesh(AV.G.box, AV.std(p.col || 0x2a9a7a, .5, 0, p.col || 0x2a9a7a, .3)); board.scale.set(.9, .55, .06); board.position.set(-2, 2.5, 0); g.add(board);
  AV.lin(g); W.group.add(g); W.circles.push([x, z, 1.9]);
  if (W.ctx && W.ctx.sign) W.ctx.sign(K.icon + ' ' + tr(p.name[0], p.name[1]).toUpperCase(), x - Math.cos(ry) * 2, y + 3.3, z + Math.sin(ry) * 2, ry, 3.4, '#ffd84a', {});
  const v = { type: 'rental', p, W, x, z, g }, front = [x + Math.sin(ry) * 1.8, z + Math.cos(ry) * 1.8];
  const mineHere = () => VEH.mine().find(r => r.stand === p.id);
  W.T.push({ x: front[0], z: front[1], r: 2.4, show: () => !ACT.cur || ACT.cur.id === 'ride',
    label: () => { const r = mineHere(), nm = say(K.n).toLowerCase(), a = /^[aeiou]/.test(K.n[0].toLowerCase()) ? 'an ' : 'a ';
      return K.icon + ' ' + (r ? tr('Return the ' + nm, 'Devolver: ' + nm) : p.price ? tr('Rent ' + a + nm + ' (' + p.price + ' credits, until midnight)', 'Alquilar: ' + nm + ' (' + p.price + ' créditos, hasta medianoche)') : tr('Take a free community ' + nm, 'Coger gratis: ' + nm + ' comunitaria')) + ' · ' + tr(p.name[0], p.name[1]) },
    fn: () => { const r = mineHere(); if (r) { VEH.giveBack(r); blip(660, .12, 'triangle', .1); return AV.toast(tr('Returned. Thanks for riding with ', 'Devuelta. Gracias por rodar con ') + tr(p.name[0], p.name[1]) + '!') }
      if (VEH.mine().some(q => q.kind === p.kind)) return AV.toast(tr('You already have one in this world: return it first, or ride the one you parked.', 'Ya tienes una en este mundo: devuélvela primero o usa la que aparcaste.'));
      if (p.price && !AV.txn(-p.price, say(K.n) + ' rental')) return;
      const s2 = fs(front[0] + Math.sin(ry) * 1.2, front[1] + Math.cos(ry) * 1.2, .6) || front;
      VEH.rent(p.kind, s2[0], s2[1], VEH.openYaw(W, s2[0], s2[1], ry + Math.PI), { price: p.price, stand: p.id, col: cols[(st().n) % cols.length] }) } });
  return v } });

/* rebuild your parked vehicles whenever you enter a world; rentals collected after midnight */
const prevEnter = AV.onWorldEnter; AV.onWorldEnter = function (W) { if (prevEnter) prevEnter(W); live = []; const S = st(); S.list = S.list.filter(valid); S.list.filter(r => r.w === W.id).forEach(r => { try { spawnParked(W, r) } catch (e) { console.warn('vehicle spawn failed', e) } }) };
let chkT = 0; AV.frameFns.push(() => { if (!live.length || AV.now() - chkT < 2) return; chkT = AV.now(); for (const o of live.slice()) if (!valid(o.rec) && !(ACT.cur && ACT.cur.rec === o.rec)) { dropLive(o); st().list = st().list.filter(r => r !== o.rec) } });

/* ---------- where (configuration) ---------- */
const add = (w, list) => { ACT.PLACES[w] = (ACT.PLACES[w] || []).concat(list) };
add('chiang_mai', [{ type: 'rental', id: 'cm_bike', kind: 'bicycle', x: -12, z: 44, ry: Math.PI, price: 15, name: ['Old City bicycle hire', 'Alquiler de bicis de la Ciudad Vieja'], col: 0x2a6ad8 }]);
add('da_nang', [{ type: 'rental', id: 'dn_scoot', kind: 'scooter', x: 210, z: 12, ry: Math.PI / 2, price: 40, name: ['Bạch Đằng scooter rental', 'Alquiler de motos Bạch Đằng'], col: 0xe86a1a, cols: [0xe8e4da, 0x2a2a2a, 0xc83a3a] }]);
add('vienna', [{ type: 'rental', id: 'vi_bike', kind: 'bicycle', x: 152, z: 122, ry: Math.PI * .75, price: 4, name: ['City bike station', 'Estación de bicis'], col: 0xd8202a, cols: [0xd8202a, 0xd8202a, 0xd8202a] }, { type: 'rental', id: 'vi_es', kind: 'escooter', x: 166, z: 108, ry: Math.PI * .75, price: 6, name: ['E-scooters', 'Patinetes eléctricos'], col: 0x3ad06a, cols: [0x3ad06a, 0x3ad06a, 0x3ad06a] }]);
add('ape_town', [{ type: 'rental', id: 'at_bike', kind: 'bicycle', x: 7, z: 92, ry: 0, price: 0, name: ['Ape Town community bikes', 'Bicis comunitarias de Ape Town'], col: 0x7a4a9a, cols: [0xffd84a, 0x7a4a9a, 0x3a9a5a] }]);
add('jungle_dub', [{ type: 'rental', id: 'jd_bike', kind: 'bicycle', x: 7, z: 26, ry: 0, price: 0, name: ['Bamboo bike rack', 'Bicis de bambú'], col: 0x6a8a3a, cols: [0xc8a04a, 0xb08a3a, 0xd8b85a] }]);
add('astro9', [{ type: 'rental', id: 'a9_hover', kind: 'hover', x: -7, z: 26, ry: 0, price: 10, name: ['Hover scooter dock', 'Muelle de patinetes flotantes'], col: 0x4ad8ff, cols: [0x4ad8ff, 0xff4ad2, 0xffd84a] }]);
VEH._drive = drive;
})(window.AV);
