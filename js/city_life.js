/* APEVERSE V0.9.4 - city_life.js : performance-friendly "living city" systems (used by Chiang Mai).
   - AV.city.crowd(ctx)      instanced pedestrians: ~6 draw calls per body type for ANY number of people; walk / idle / talk / sit /
                             dance / splash / drum / monk poses; wander a street graph or follow a route; distance LOD
   - AV.city.traffic(ctx)    tuk-tuks, scooters, bicycles, red songthaews on road loops (instanced, per-hour density, honk + brake)
   - AV.city.birds / dogs    flocks with flapping wings, street dogs with wagging tails
   - AV.city.spray / rain / smoke / skyLanterns / krathongs / candles   particle-style effects (instanced or points) */
'use strict';
(function (AV) {
const K = AV.kit, TAU = AV.TAU, M = K.M, C = AV.chars;
const CY = AV.city = {};
const _m = new THREE.Matrix4(), _l = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3(1, 1, 1), ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
const lin = h => new THREE.Color(h).convertSRGBToLinear();
const hourNow = () => (AV.S.time / 60) % 24;

/* ======================= pedestrians ======================= */
const PAL = { skin: [0xf0c8a8, 0xe0b088, 0xd8a47a, 0xc8946a, 0xb07a50, 0x8a5a3a, 0x6a4028], hair: [0x14100c, 0x2a1a10, 0x4a2c18, 0x8a4a20, 0xd8b860, 0xb0b0b0, 0x3a2a20],
  shirt: [0xe8603a, 0x3a8ad8, 0xf2e8d8, 0x2a9a6a, 0xd84a8a, 0x2a2a2a, 0xffd84a, 0x7a4ac8, 0xff8a3a, 0x4ac8c8, 0xffffff, 0xc83a3a], pants: [0x3a3a52, 0xc8b088, 0x2a2a2a, 0x6a8ab8, 0x8a5a3a, 0x4a6a3a] };
CY.crowd = function (ctx, opt) {
  opt = opt || {}; const lo = K.q() < 2, mat = C.walkerMat(), sets = {}, list = [], rng = ctx.rng, far = opt.far || [55, 80, 110][K.q()];
  const cr = {
    list,
    add(w) {   // w: {v, x, z, yaw, mode, route, loop, speed, nav, cols, y, idleProb}
      const r = rng; w.v = w.v || 'man'; w.cols = w.cols || { skin: PAL.skin[r() * 7 | 0], hair: w.v === 'monk' ? PAL.skin[2] : PAL.hair[r() * 7 | 0], shirt: w.v === 'monk' ? 0xe8801a : PAL.shirt[r() * 12 | 0], pants: w.v === 'monk' ? 0xe8801a : PAL.pants[r() * 6 | 0] };
      Object.assign(w, { ph: r() * TAU, sp: w.speed || (.9 + r() * .5), y: w.y || 0, t: 0, pause: 0, ri: 0, vis: true, yaw: w.yaw || 0, mode: w.mode || 'walk', base: w.mode || 'walk', react: 0 }); list.push(w); return w;
    },
    build() {
      const by = {}; list.forEach(w => (by[w.v] = by[w.v] || []).push(w));
      for (const v in by) {
        const kit = C.walkerKit(v, lo), ws = by[v], n = ws.length, attrs = {};
        for (const a of ['iSkin', 'iShirt', 'iPants', 'iHair']) attrs[a] = new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3);
        ws.forEach((w, i) => { const c = w.cols; [['iSkin', c.skin], ['iShirt', c.shirt], ['iPants', c.pants], ['iHair', c.hair]].forEach(([a, h]) => { const cc = lin(h); attrs[a].setXYZ(i, cc.r, cc.g, cc.b) }); w.si = i });
        const meshes = {};
        for (const p in kit) { const g = kit[p].geo.clone(); for (const a in attrs) g.setAttribute(a, attrs[a]); const im = new THREE.InstancedMesh(g, mat, n); im.frustumCulled = false; im.castShadow = false; im.receiveShadow = false; /* many small bodies: no shadow pass */ ctx.group.add(im); meshes[p] = { im, pos: kit[p].pos } }
        sets[v] = { ws, meshes };
      }
      cr.built = true; return cr;
    },
    setVisible(fn) { list.forEach(w => w.vis = fn(w)) }
  };
  /* movement */
  function step(w, dt) {
    if (w.mode === 'follow' && w.lead) { const p = w.lead(w); const dx = p.x - w.x, dz = p.z - w.z, d = Math.hypot(dx, dz); if (d > .05) { w.x += dx * Math.min(1, dt * 3); w.z += dz * Math.min(1, dt * 3); w.yaw = p.yaw != null ? p.yaw : Math.atan2(dx, dz) } w.moving = d > .02; return }
    if (w.pause > 0) { w.pause -= dt; w.moving = false; if (w.pause <= 0) w.mode = w.base; return }
    let tx, tz;
    if (w.nav) { if (w.to == null) { w.to = w.nav.near(w.x, w.z) } const n = w.nav.nodes[w.to]; tx = n[0]; tz = n[1] }
    else if (w.route) { const p = w.route[w.ri]; tx = p[0]; tz = p[1] } else { w.moving = false; return }
    const dx = tx - w.x, dz = tz - w.z, d = Math.hypot(dx, dz);
    if (d < .3) {
      if (w.nav) { const links = w.nav.links[w.to].filter(j => j !== w.from); w.from = w.to; w.to = links.length ? links[Math.random() * links.length | 0] : w.from; if (Math.random() < (w.idleProb == null ? .15 : w.idleProb)) { w.pause = 2 + Math.random() * 6; w.mode = Math.random() < .5 ? 'idle' : 'talk' } }
      else { const p = w.route[w.ri]; if (p[2]) { w.pause = p[2]; w.mode = p[3] || 'idle' } w.ri++; if (w.ri >= w.route.length) { if (w.loop === false) { w.route = null; w.ri = 0 } else w.ri = 0 } }
      w.moving = false; return;
    }
    const sp = w.sp * (w.v === 'monk' ? .7 : 1), s = Math.min(d, sp * dt); w.x += dx / d * s + (w.side || 0) * 0; w.z += dz / d * s; w.moving = true;
    let dy = Math.atan2(dx, dz) - w.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); w.yaw += dy * Math.min(1, dt * 6);
  }
  /* pose -> per-pivot euler [x, y, z], body lift */
  const P = {}; ['head', 'aL', 'aR', 'lL', 'lR'].forEach(k => P[k] = [0, 0, 0]);
  function pose(w, t, beat) {
    for (const k in P) { P[k][0] = 0; P[k][1] = 0; P[k][2] = 0 } let lift = 0, red = AV.S.set.reduce ? .4 : 1;
    const m = w.react > 0 ? 'react' : w.mode;
    if (w.moving) { w.ph += .016 * 7.5 * w.sp; const sw = Math.sin(w.ph); P.lL[0] = sw * .55; P.lR[0] = -sw * .55; P.aL[0] = -sw * .4; P.aR[0] = sw * .4; lift = Math.abs(Math.cos(w.ph)) * .035; if (w.v === 'monk') { P.aL[0] = -1.1; P.aR[0] = -1.1 } if (m === 'splash' || w.v === 'splasher') { P.aR[0] = -1.4 } if (w.v === 'drummer') { P.aL[0] = -1.1 + Math.abs(Math.sin(beat * Math.PI)) * .5; P.aR[0] = -1.1 + Math.abs(Math.cos(beat * Math.PI)) * .5 } if (w.v === 'dancer') { P.aL[2] = -1.9 + Math.sin(t * 3 + w.ph) * .4 * red; P.aR[2] = 1.9 + Math.cos(t * 3 + w.ph) * .4 * red } }
    else if (m === 'sit') { P.lL[0] = P.lR[0] = -1.45; P.aL[0] = P.aR[0] = -.5; lift = -.42; P.head[1] = Math.sin(t * .5 + w.ph) * .3 }
    else if (m === 'dance') { const ph = (beat + w.ph) * Math.PI; P.aL[2] = -2.3 + Math.sin(ph) * .4 * red; P.aR[2] = 2.3 - Math.sin(ph) * .4 * red; lift = Math.abs(Math.sin(ph)) * .12 * red; P.head[2] = Math.sin(ph) * .15 * red }
    else if (m === 'talk') { P.aR[0] = -.6 + Math.sin(t * 4 + w.ph) * .3 * red; P.aL[0] = -.2; P.head[0] = Math.sin(t * 7 + w.ph) * .06 * red }
    else if (m === 'splash') { P.aR[0] = -1.5; P.aL[0] = -1.2; P.aL[2] = .3; lift = Math.abs(Math.sin(t * 3 + w.ph)) * .03 }
    else if (m === 'drum') { const ph = beat * Math.PI * 2; P.aL[0] = -1.1 + Math.max(0, Math.sin(ph)) * .6; P.aR[0] = -1.1 + Math.max(0, -Math.sin(ph)) * .6 }
    else if (m === 'react') { P.aL[2] = -2.6; P.aR[2] = 2.6; lift = Math.abs(Math.sin(t * 14)) * .15; w.react -= .016 }
    else if (m === 'shop') { P.aR[0] = -.9; P.head[0] = .25 }
    else { P.head[1] = Math.sin(t * .7 + w.ph) * .4; P.aR[0] = Math.sin(t * 1.3 + w.ph) * .05 }
    return lift;
  }
  let frameI = 0;
  ctx.upd.push((dt, t) => {
    if (!cr.built) return; frameI++; const cam = AV.cam.position, on = AV.audio && AV.audio.on && (AV.audio.ok || (AV.audio.track && AV.audio.track.active)), beat = on ? AV.audio.beat : t * 1.8;
    for (const v in sets) {
      const S = sets[v], ms = S.meshes;
      for (const w of S.ws) {
        const d = Math.hypot(w.x - cam.x, w.z - cam.z), show = w.vis && d < far;
        if (!show) { if (w.shown !== false) { for (const p in ms) ms[p].im.setMatrixAt(w.si, ZERO); w.shown = false } if (w.vis) step(w, dt * (frameI % 4 === 0 ? 4 : 0)); continue }
        if (d > far * .6 && (frameI + w.si) % 3 !== 0 && w.shown) { step(w, dt); continue }   // distant: animate every 3rd frame
        w.shown = true; step(w, d > far * .6 ? dt * 3 : dt); const lift = pose(w, t, beat);
        _q.setFromAxisAngle(_v.set(0, 1, 0), w.yaw); _m.compose(_v.set(w.x, w.y + lift, w.z), _q, _s);
        for (const p in ms) { if (p === 'root') { ms[p].im.setMatrixAt(w.si, _m); continue } const e = P[p]; _e.set(e[0], e[1], e[2]); _q.setFromEuler(_e); _l.compose(ms[p].pos, _q, _s); _l.premultiply(_m); ms[p].im.setMatrixAt(w.si, _l) }
      }
      for (const p in ms) ms[p].im.instanceMatrix.needsUpdate = true;
    }
  });
  return cr;
};
/* street graph: nodes [[x,z]], links [[i,j]] ; near(x,z) -> nearest node */
CY.nav = function (nodes, edges) { const links = nodes.map(() => []); edges.forEach(([a, b]) => { links[a].push(b); links[b].push(a) }); return { nodes, links, near(x, z) { let b = 0, bd = 1e9; nodes.forEach((n, i) => { const d = Math.hypot(n[0] - x, n[1] - z); if (d < bd) { bd = d; b = i } }); return b } } };

/* ======================= vehicles ======================= */
const VB = {};
function riderParts(x, y, z, col, s) { s = s || 1; const BG = K.BG; return [[BG.sph, col, M(x, y + .35 * s, z, .2 * s, .28 * s, .16 * s)], [BG.sph, 0xd8a47a, M(x, y + .78 * s, z + .02, .12 * s, .14 * s, .13 * s)], [BG.sph, [0x2a2a2a, 0xe8e8e8, 0xd83a3a, 0x3a6ad8][Math.abs(col) % 4], M(x, y + .84 * s, z, .14 * s, .1 * s, .15 * s)], [BG.cyl, 0x3a3a52, M(x - .1 * s, y + .1 * s, z + .18 * s, .07 * s, .4 * s, .07 * s, 1.3, 0, 0)], [BG.cyl, 0x3a3a52, M(x + .1 * s, y + .1 * s, z + .18 * s, .07 * s, .4 * s, .07 * s, 1.3, 0, 0)], [BG.cyl, 0xd8a47a, M(x - .17 * s, y + .45 * s, z + .2 * s, .05 * s, .4 * s, .05 * s, 1.1, 0, 0)], [BG.cyl, 0xd8a47a, M(x + .17 * s, y + .45 * s, z + .2 * s, .05 * s, .4 * s, .05 * s, 1.1, 0, 0)]] }
const wheel = (x, y, z, r, w) => [K.BG.cyl, 0x1a1a1a, M(x, y, z, r, w, r, 0, 0, Math.PI / 2)];
VB.tuktuk = col => K.merge([[K.BG.box, col, M(0, .75, -.35, 1.3, .9, 1.5)], [K.BG.box, 0x1a1a22, M(0, 1.7, -.2, 1.45, .1, 2.3)], [K.BG.box, col, M(0, .7, .9, .7, .7, .9)], [K.BG.box, 0x9ad8ff, M(0, 1.25, 1.2, .9, .5, .05), .3],
  [K.BG.cyl, 0xc0c0c0, M(-.68, 1.25, .95, .03, .9, .03)], [K.BG.cyl, 0xc0c0c0, M(.68, 1.25, .95, .03, .9, .03)], [K.BG.cyl, 0xc0c0c0, M(-.68, 1.25, -1.2, .03, .9, .03)], [K.BG.cyl, 0xc0c0c0, M(.68, 1.25, -1.2, .03, .9, .03)],
  [K.BG.box, 0x8a2a2a, M(0, .95, -.7, 1.2, .25, .5)], [K.BG.box, 0xffd84a, M(0, 1.78, -.2, 1.5, .08, 2.35), .2], wheel(0, .25, 1.25, .25, .15), wheel(-.62, .25, -.75, .25, .16), wheel(.62, .25, -.75, .25, .16), [K.BG.sph, 0xfff0c0, M(0, .85, 1.36, .1, .1, .05), 1]].concat(riderParts(0, .55, .55, 0x2a6ad8, .9)));
VB.scooter = col => K.merge([[K.BG.box, col, M(0, .5, 0, .3, .35, 1.1)], [K.BG.box, 0x1a1a1a, M(0, .75, -.15, .3, .1, .6)], [K.BG.cyl, 0x404040, M(0, .85, .5, .04, .8, .04, -.3, 0, 0)], [K.BG.cyl, 0x404040, M(0, 1.2, .6, .03, .6, .03, 0, 0, Math.PI / 2)], wheel(0, .25, .6, .25, .1), wheel(0, .25, -.6, .25, .1), [K.BG.sph, 0xfff0c0, M(0, 1.05, .7, .07, .07, .05), 1]].concat(riderParts(0, .62, -.12, col)));
VB.bicycle = col => K.merge([[K.BG.cyl, col, M(0, .55, 0, .03, 1.0, .03, 0, 0, 0)], [K.BG.cyl, col, M(0, .45, .25, .03, .8, .03, 1.1, 0, 0)], [K.BG.cyl, col, M(0, .45, -.25, .03, .8, .03, -1.1, 0, 0)], [K.BG.box, 0x1a1a1a, M(0, .95, -.25, .12, .05, .25)], [new THREE.TorusGeometry(.32, .03, 4, 16), 0x1a1a1a, M(0, .32, .55, 1, 1, 1, 0, Math.PI / 2, 0)], [new THREE.TorusGeometry(.32, .03, 4, 16), 0x1a1a1a, M(0, .32, -.55, 1, 1, 1, 0, Math.PI / 2, 0)], [K.BG.cyl, 0x404040, M(0, 1.05, .45, .02, .5, .02, 0, 0, Math.PI / 2)]].concat(riderParts(0, .7, -.1, col)));
VB.songthaew = col => K.merge([[K.BG.box, col, M(0, .9, 1.4, 1.8, 1.1, 1.3)], [K.BG.box, 0x9ad8ff, M(0, 1.25, 2.06, 1.6, .5, .04), .3], [K.BG.box, col, M(0, .8, -.9, 1.9, .6, 3.2)], [K.BG.box, col, M(0, 2.0, -.9, 1.95, .12, 3.3)],
  [K.BG.cyl, 0xd0d0d0, M(-.92, 1.45, .55, .03, 1.1, .03)], [K.BG.cyl, 0xd0d0d0, M(.92, 1.45, .55, .03, 1.1, .03)], [K.BG.cyl, 0xd0d0d0, M(-.92, 1.45, -2.4, .03, 1.1, .03)], [K.BG.cyl, 0xd0d0d0, M(.92, 1.45, -2.4, .03, 1.1, .03)], [K.BG.box, 0xffffff, M(0, 1.6, .58, 1.9, .2, .04)],
  wheel(-.85, .35, 1.4, .35, .2), wheel(.85, .35, 1.4, .35, .2), wheel(-.85, .35, -1.6, .35, .2), wheel(.85, .35, -1.6, .35, .2), [K.BG.sph, 0xfff0c0, M(-.6, .95, 2.06, .1, .1, .05), 1], [K.BG.sph, 0xfff0c0, M(.6, .95, 2.06, .1, .1, .05), 1]]);
/* V0.9.9: red Viennese tram (front = +z) */
VB.tram = col => K.merge([[K.BG.box, col, M(0, 1.6, 0, 2.4, 2.6, 15)], [K.BG.box, 0xf4f0e8, M(0, 1.05, 0, 2.42, .5, 15.02)], [K.BG.box, 0x9ad8ff, M(0, 2.25, 0, 2.44, .9, 14.2), .25], [K.BG.box, 0x2a2a2a, M(0, .25, 0, 2.2, .3, 14.4)],
  [K.BG.box, col, M(0, 2.98, 0, 2.2, .14, 14.6)], [K.BG.box, 0x3a3a3a, M(0, 3.3, 2, .08, .6, 1.6, .6, 0, 0)], [K.BG.box, 0x3a3a3a, M(0, 3.62, 2.3, 1.4, .05, .06)], [K.BG.box, 0x9ad8ff, M(0, 2.1, 7.52, 2.1, 1.2, .04), .3], [K.BG.sph, 0xfff0c0, M(-.8, 1.0, 7.52, .12, .12, .05), 1], [K.BG.sph, 0xfff0c0, M(.8, 1.0, 7.52, .12, .12, .05), 1]]);
CY.VB = VB;   /* V0.9.7: vehicle meshes reused by the tuk-tuk rides */
/* loops: [{pts:[[x,z],...], closed}] ; spec: [{type, col, n, speed}] */
CY.traffic = function (ctx, loops, spec, opt) {
  opt = opt || {}; const cars = [], meshes = [], mat = K.floraMat(0, { rough: .55 });
  const L = loops.map(lp => { const p = lp.pts, cum = [0]; for (let i = 1; i <= p.length; i++) { const a = p[i - 1], b = p[i % p.length]; cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1])) } return { p, cum, len: cum[cum.length - 1], off: lp.off == null ? 1.7 : lp.off } });
  spec.forEach((sp, si) => { const n = sp.n; if (!n) return; const im = new THREE.InstancedMesh(VB[sp.type](sp.col), mat, n); im.frustumCulled = false; im.castShadow = K.q() === 2; ctx.group.add(im); meshes.push(im);
    for (let i = 0; i < n; i++) { const li = (si + i) % L.length; cars.push({ im, i, li, s: (i / n + si * .13) * L[li].len, v: sp.speed * (.85 + Math.random() * .3), vmax: sp.speed, honkT: 0, type: sp.type, wake: i / n }) } });
  const at = (lp, s) => { s = ((s % lp.len) + lp.len) % lp.len; let i = 1; while (lp.cum[i] < s) i++; const a = lp.p[i - 1], b = lp.p[i % lp.p.length], f = (s - lp.cum[i - 1]) / (lp.cum[i] - lp.cum[i - 1]), dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz); return [a[0] + dx * f - dz / l * lp.off, a[1] + dz * f + dx / l * lp.off, Math.atan2(dx, dz)] };
  const api = { cars, density: () => { const h = hourNow(); return h < 5 ? .25 : h < 7 ? .6 : h < 22 ? 1 : .55 }, stopAt: null };
  ctx.upd.push((dt, t) => {
    const P = AV.P, dens = opt.density ? opt.density() : api.density();
    for (const c of cars) {
      const lp = L[c.li]; c.active = c.wake < dens; if (!c.active) { c.im.setMatrixAt(c.i, ZERO); continue }
      const p = at(lp, c.s), ahead = at(lp, c.s + 3.2), dP = Math.hypot(ahead[0] - P.x, ahead[1] - P.z), stop = dP < 2.4 || (api.stopAt && api.stopAt(p[0], p[1]));
      c.v += ((stop ? 0 : c.vmax) - c.v) * Math.min(1, dt * (stop ? 4 : 1.2)); c.s += c.v * dt;
      if (dP < 2.4 && t > c.honkT && AV.audio) { c.honkT = t + 3; AV.audio.blip(c.type === 'scooter' ? 660 : 420, .18, 'square', .06); setTimeout(() => AV.audio.blip(c.type === 'scooter' ? 660 : 420, .14, 'square', .05), 200) }
      _q.setFromAxisAngle(_v.set(0, 1, 0), p[2]); _m.compose(_v.set(p[0], (c.type === 'scooter' || c.type === 'bicycle') ? Math.sin(t * 9 + c.i) * .01 : 0, p[1]), _q, _s); c.im.setMatrixAt(c.i, _m); c.x = p[0]; c.z = p[1]; c.yaw = p[2];
    }
    meshes.forEach(m => m.instanceMatrix.needsUpdate = true);
  });
  return api;
};

/* ======================= birds ======================= */
CY.birds = function (ctx, flocks) {
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, .25, -.6, .15, -.1, 0, 0, -.2, 0, 0, .25, .6, .15, -.1, 0, 0, -.2], 3)); g.computeVertexNormals();
  const n = flocks.reduce((a, f) => a + f.n, 0), im = new THREE.InstancedMesh(g, new THREE.MeshBasicMaterial({ color: 0x2a2228, side: THREE.DoubleSide }), n); im.frustumCulled = false; ctx.group.add(im);
  const bs = []; flocks.forEach(f => { for (let i = 0; i < f.n; i++) bs.push({ f, a: Math.random() * TAU, r: f.r * (.6 + Math.random() * .5), h: f.y + Math.random() * 6, sp: (.3 + Math.random() * .2) * (Math.random() < .5 ? 1 : -1), ph: Math.random() * TAU }) });
  ctx.upd.push((dt, t) => { bs.forEach((b, i) => { b.a += b.sp * dt; const x = b.f.x + Math.cos(b.a) * b.r, z = b.f.z + Math.sin(b.a) * b.r, y = b.h + Math.sin(t * .7 + b.ph) * 1.5; _q.setFromAxisAngle(_v.set(0, 1, 0), -b.a + (b.sp > 0 ? 0 : Math.PI)); _m.compose(_v.set(x, y, z), _q, _s.set(1, .3 + Math.abs(Math.sin(t * 9 + b.ph)) * 1.6, 1)); im.setMatrixAt(i, _m) }); _s.set(1, 1, 1); im.instanceMatrix.needsUpdate = true });
};
/* ======================= dogs ======================= */
CY.dog = function (col, opt) {
  opt = opt || {}; const g = new THREE.Group(), BG = K.BG, s = opt.s || 1, fr = !!opt.frenchie, c2 = opt.c2 || AV.chars._kit.shade(col, .75);
  const body = [[BG.sph, col, M(0, .42 * s, 0, .2 * s, .2 * s, fr ? .3 * s : .38 * s)], [BG.sph, col, M(0, .55 * s, (fr ? .3 : .42) * s, .17 * s, .16 * s, .17 * s)], [BG.sph, c2, M(0, .5 * s, (fr ? .44 : .58) * s, .08 * s, .07 * s, fr ? .05 * s : .12 * s)], [BG.sph, 0x1a1210, M(0, .53 * s, (fr ? .5 : .69) * s, .035 * s, .03 * s, .03 * s)],
    [BG.sph, 0x1a1210, M(-.07 * s, .6 * s, (fr ? .45 : .55) * s, .025 * s, .03 * s, .02 * s)], [BG.sph, 0x1a1210, M(.07 * s, .6 * s, (fr ? .45 : .55) * s, .025 * s, .03 * s, .02 * s)], [BG.cone, c2, M(-.1 * s, .72 * s, (fr ? .3 : .4) * s, .06 * s, fr ? .14 * s : .12 * s, .04 * s, 0, 0, .3)], [BG.cone, c2, M(.1 * s, .72 * s, (fr ? .3 : .4) * s, .06 * s, fr ? .14 * s : .12 * s, .04 * s, 0, 0, -.3)]];
  for (const [x, z] of [[-.11, .22], [.11, .22], [-.11, -.22], [.11, -.22]]) body.push([BG.cyl, col, M(x * s, .17 * s, z * s * (fr ? .75 : 1), .05 * s, .34 * s, .05 * s)]);
  if (opt.collar) body.push([BG.cyl, opt.collar, M(0, .5 * s, (fr ? .25 : .34) * s, .15 * s, .04 * s, .15 * s, .4, 0, 0)]);
  const bm = new THREE.Mesh(K.merge(body), K.floraMat(0, { rough: .9 })); bm.castShadow = true; g.add(bm);
  const tail = new THREE.Group(); tail.position.set(0, .5 * s, -(fr ? .28 : .36) * s); g.add(tail); const tm = new THREE.Mesh(K.merge([[BG.cyl, col, M(0, .1 * s, -.04 * s, .03 * s, fr ? .08 * s : .25 * s, .03 * s, -.6, 0, 0)]]), bm.material); tail.add(tm);
  g.userData = { body: bm, tail, s }; return g;
};
CY.animDog = function (d, t, moving, sit) { const u = d.userData; u.tail.rotation.y = Math.sin(t * (moving ? 10 : 6)) * .6; u.body.position.y = moving ? Math.abs(Math.sin(t * 10)) * .03 : 0; u.body.rotation.x = sit ? -.25 : 0 };

/* ======================= particles ======================= */
/* water spray: instanced droplets with gravity */
CY.spray = function (ctx, n) {
  n = n || 360; const im = new THREE.InstancedMesh(new THREE.SphereGeometry(.06, 6, 4), new THREE.MeshBasicMaterial({ color: 0xa8e8ff, transparent: true, opacity: .75 }), n); im.frustumCulled = false; im.material.userData.lin = 1; ctx.group.add(im);
  const P = []; for (let i = 0; i < n; i++) { P.push({ x: 0, y: -10, z: 0, vx: 0, vy: 0, vz: 0, life: 0 }); im.setMatrixAt(i, ZERO) } let head = 0;
  ctx.upd.push(dt => { for (let i = 0; i < n; i++) { const p = P[i]; if (p.life <= 0) continue; p.life -= dt; p.vy -= 9.8 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; if (p.y < 0 || p.life <= 0) { p.life = 0; im.setMatrixAt(i, ZERO); continue } _m.makeScale(1, 1.6, 1); _m.setPosition(p.x, p.y, p.z); im.setMatrixAt(i, _m) } im.instanceMatrix.needsUpdate = true });
  return { emit(x, y, z, dx, dy, dz, k, spread, speed) { for (let j = 0; j < k; j++) { const p = P[head]; head = (head + 1) % n; const sp = speed * (.85 + Math.random() * .3); p.x = x; p.y = y; p.z = z; p.vx = (dx + (Math.random() - .5) * spread) * sp; p.vy = (dy + (Math.random() - .5) * spread) * sp; p.vz = (dz + (Math.random() - .5) * spread) * sp; p.life = 1.6 } } };
};
/* rain: falling streaks around the camera */
CY.rain = function (ctx, n) {
  n = n || [300, 700, 1100][K.q()]; const pos = new Float32Array(n * 6), g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const ln = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0xb8c8e8, transparent: true, opacity: .45 })); ln.frustumCulled = false; ln.visible = false; ctx.group.add(ln);
  const seed = () => { const c = AV.cam.position; for (let i = 0; i < n; i++) { const x = c.x + (Math.random() - .5) * 50, y = c.y + Math.random() * 25 - 5, z = c.z + (Math.random() - .5) * 50; pos.set([x, y, z, x + .05, y - .7, z], i * 6) } }; seed();
  const api = { on: false, ln };
  ctx.upd.push(dt => { ln.visible = api.on; if (!api.on) return; const c = AV.cam.position; for (let i = 0; i < n; i++) { const o = i * 6; let y = pos[o + 1] - 26 * dt; if (y < 0 || Math.abs(pos[o] - c.x) > 26 || Math.abs(pos[o + 2] - c.z) > 26) { pos[o] = c.x + (Math.random() - .5) * 50; pos[o + 2] = c.z + (Math.random() - .5) * 50; y = c.y + 14 + Math.random() * 10 } pos[o + 1] = y; pos[o + 3] = pos[o] + .05; pos[o + 4] = y - .7; pos[o + 5] = pos[o + 2] } g.attributes.position.needsUpdate = true });
  return api;
};
/* smoke puffs (joints, food stalls) */
CY.smoke = function (ctx, n) {
  n = n || 90; const im = new THREE.InstancedMesh(new THREE.SphereGeometry(.07, 6, 4), new THREE.MeshBasicMaterial({ color: 0xd8d8e0, transparent: true, opacity: .35, depthWrite: false }), n); im.frustumCulled = false; im.material.userData.lin = 1; ctx.group.add(im);
  const P = []; for (let i = 0; i < n; i++) { P.push({ life: 0 }); im.setMatrixAt(i, ZERO) } let head = 0;
  ctx.upd.push(dt => { for (let i = 0; i < n; i++) { const p = P[i]; if (p.life <= 0) continue; p.life -= dt; p.y += .35 * dt; p.x += Math.sin(p.life * 3 + i) * .05 * dt; const s = 1 + (2.6 - p.life) * 1.6; if (p.life <= 0) { im.setMatrixAt(i, ZERO); continue } _m.makeScale(s, s, s); _m.setPosition(p.x, p.y, p.z); im.setMatrixAt(i, _m) } im.instanceMatrix.needsUpdate = true });
  return { puff(x, y, z) { const p = P[head]; head = (head + 1) % n; p.x = x; p.y = y; p.z = z; p.life = 2.6 } };
};
/* sky lanterns: warm glowing paper lanterns rising and drifting; stream(on/off) + burst(k) */
CY.skyLanterns = function (ctx, site, n) {
  n = n || [140, 260, 400][K.q()]; const geo = new THREE.CylinderGeometry(.32, .22, .7, 8, 1, true), im = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }), n); im.frustumCulled = false; im.material.userData.lin = 1; ctx.group.add(im);
  const L = [], col = new THREE.Color(); for (let i = 0; i < n; i++) { L.push({ on: false }); im.setMatrixAt(i, ZERO); im.setColorAt(i, col.setHSL(.07 + Math.random() * .05, 1, .55 + Math.random() * .15)) } im.instanceColor.needsUpdate = true;
  const api = { rate: 0, launch(x, z, k, spread) { for (let j = 0; j < k; j++) { const l = L.find(o => !o.on); if (!l) return; Object.assign(l, { on: true, x: x + (Math.random() - .5) * (spread || 2), y: .5 + Math.random() * .5, z: z + (Math.random() - .5) * (spread || 2), vy: .9 + Math.random() * .9, vx: .25 + Math.random() * .35, vz: (Math.random() - .5) * .3, ph: Math.random() * TAU, delay: j * .05 * Math.random() }) } } };
  let acc = 0;
  ctx.upd.push((dt, t) => { acc += api.rate * dt; while (acc > 1) { acc--; api.launch(site.x + (Math.random() - .5) * site.r, site.z + (Math.random() - .5) * site.r, 1) }
    for (let i = 0; i < n; i++) { const l = L[i]; if (!l.on) continue; if (l.delay > 0) { l.delay -= dt; continue } l.y += l.vy * dt; l.x += (l.vx + Math.sin(t * .3 + l.ph) * .2) * dt; l.z += l.vz * dt; if (l.y > 170) { l.on = false; im.setMatrixAt(i, ZERO); continue } const s = 1 + Math.sin(t * 6 + l.ph) * .04; _m.makeScale(s, s, s); _m.setPosition(l.x, l.y, l.z); im.setMatrixAt(i, _m) } im.instanceMatrix.needsUpdate = true });
  return api;
};
/* krathongs: lotus floats with a candle, drifting down a river line (x = fx(z)) */
CY.krathongs = function (ctx, river, n) {
  n = n || [40, 80, 130][K.q()]; const geo = K.species.lotus(0xffd0e8, 0x3a9a4a), im = new THREE.InstancedMesh(geo, K.floraMat(0, { double: true }), n); im.frustumCulled = false; ctx.group.add(im);
  const fl = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ color: 0xffc860, size: .35, transparent: true, opacity: .95, depthWrite: false })); const fp = new Float32Array(n * 3); fl.geometry.setAttribute('position', new THREE.BufferAttribute(fp, 3)); fl.frustumCulled = false; fl.material.userData.lin = 1; ctx.group.add(fl);
  const ks = []; for (let i = 0; i < n; i++) ks.push({ z: river.z0 + Math.random() * (river.z1 - river.z0), o: (Math.random() - .5) * river.w, sp: .4 + Math.random() * .5, ph: Math.random() * TAU });
  const api = { add(x, z) { const k = ks[Math.random() * n | 0]; k.z = z; k.o = x - river.fx(z); k.mine = true; return k } };
  ctx.upd.push((dt, t) => { ks.forEach((k, i) => { k.z += k.sp * dt; if (k.z > river.z1) { k.z = river.z0; k.o = (Math.random() - .5) * river.w; k.mine = false } const x = river.fx(k.z) + k.o + Math.sin(t * .4 + k.ph) * .3; _q.setFromAxisAngle(_v.set(0, 1, 0), t * .1 + k.ph); _m.compose(_v.set(x, river.y + .02, k.z), _q, _s.set(.9, .9, .9)); im.setMatrixAt(i, _m); fp[i * 3] = x; fp[i * 3 + 1] = river.y + .35 + Math.sin(t * 9 + k.ph) * .02; fp[i * 3 + 2] = k.z }); _s.set(1, 1, 1); im.instanceMatrix.needsUpdate = true; fl.geometry.attributes.position.needsUpdate = true });
  return api;
};
/* candle fields: flickering warm points (thousands, one draw call) */
CY.candles = function (ctx, pts, size) {
  const n = pts.length, pos = new Float32Array(n * 3), ph = new Float32Array(n); pts.forEach((p, i) => { pos.set(p, i * 3); ph[i] = Math.random() * 100 });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aPh', new THREE.BufferAttribute(ph, 1));
  const m = new THREE.ShaderMaterial({ uniforms: { uT: K.U.time, sz: { value: (size || 3) * (AV.R ? AV.R.getPixelRatio() : 1) } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'attribute float aPh;uniform float uT,sz;varying float vA;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=sz*(60./max(-mv.z,1.));vA=.65+.35*sin(uT*9.+aPh)*sin(uT*5.3+aPh*2.);}',
    fragmentShader: 'varying float vA;void main(){vec2 d=gl_PointCoord-.5;float r=length(d);if(r>.5)discard;float a=smoothstep(.5,0.,r);gl_FragColor=vec4(vec3(1.,.72,.32)*a*vA,a*vA);}' });
  m.userData.lin = 1; const p = new THREE.Points(g, m); p.frustumCulled = false; ctx.group.add(p); return p;
};
})(window.AV);
