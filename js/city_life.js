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
        w.shown = true; step(w, d > far * .6 ? dt * 3 : dt); if (opt.H) w.y = opt.H(w.x, w.z) + (w.dy || 0); const lift = pose(w, t, beat);
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

/* ======================= vehicles (V1.0: realistic Thai street fleet) =======================
   Every builder returns ONE merged geometry (front = +z, ground = y 0). Side silhouettes are extruded profiles (hood, windscreen,
   roof, boot, wheel arches) instead of stacked boxes. Parts flagged as body paint (5th entry = 1) get an `aPaint` vertex attribute:
   InstancedMeshes built with CY.vehMat() tint ONLY those parts per instance (instanceColor), so one draw call can show white,
   silver, black and red cars while glass, tyres, chrome and lights keep their own colours. Called with a colour, paint is baked in. */
const VB = {}, VG = {}, BX = K.BG.box, CYL12 = new THREE.CylinderGeometry(1, 1, 1, 12), CYL6 = new THREE.CylinderGeometry(1, 1, 1, 6), PI2 = Math.PI / 2;
const CHROME = 0xc4c8cc, GLASS = 0x26323a, TYRE = 0x141414, RIM = 0xa8acb2, PLATE = 0xf2f2ea, HEAD = 0xe6ecf0, TAIL = 0x9a1010;
function vmerge(parts) { const g = K.merge(parts), a = new Float32Array(g.attributes.position.count); let o = 0; for (const p of parts) { const k = p[0].index ? p[0].index.count : p[0].attributes.position.count; if (p[4]) a.fill(1, o, o + k); o += k } g.setAttribute('aPaint', new THREE.BufferAttribute(a, 1)); return g }
/* side profile [[z, y], ...] extruded across the width w (cached per key) */
function prof(key, pts, w) { return VG[key] || (VG[key] = (() => { const g = new THREE.ExtrudeGeometry(new THREE.Shape(pts.map(q => new THREE.Vector2(q[0], q[1]))), { depth: w, bevelEnabled: false, curveSegments: 1 }); g.translate(0, 0, -w / 2); g.rotateY(-PI2); return g })()) }
/* wheel-arch cut-out for a profile's lower edge (rear -> front) */
const arch = (cz, cy, R) => { const o = []; for (let i = 0; i <= 6; i++) { const a = Math.PI - i / 6 * Math.PI; o.push([cz + Math.cos(a) * R, cy + Math.sin(a) * R]) } return o };
/* tyre + rim + hub, axle along x */
const wheel = (x, y, z, r, w) => [[CYL12, TYRE, M(x, y, z, r, w, r, 0, 0, PI2)], [K.BG.cyl, RIM, M(x + Math.sign(x || 1) * .012, y, z, r * .62, w * 1.02, r * .62, 0, 0, PI2)], [CYL6, 0x5a5e64, M(x + Math.sign(x || 1) * .02, y, z, r * .18, w * 1.04, r * .18, 0, 0, PI2)]];
/* seated rider: torso, head, open-face helmet, bent legs, arms reaching forward to the bars */
function riderParts(x, y, z, shirt, helm, s, reach) {
  s = s || 1; reach = reach || .5; const B = K.BG, skin = 0xc8946a, pants = 0x2a2c38;
  const o = [[B.sphL, shirt, M(x, y + .34 * s, z, .2 * s, .3 * s, .14 * s)], [B.sphL, skin, M(x, y + .74 * s, z + .02 * s, .095 * s, .115 * s, .105 * s)], [B.hemL, helm, M(x, y + .77 * s, z - .01 * s, .13 * s, .13 * s, .14 * s)], [BX, 0x1a1a1a, M(x, y + .81 * s, z + .12 * s, .2 * s, .03 * s, .05 * s)]];
  for (const sd of [-1, 1]) o.push([B.cylL, pants, M(x + sd * .1 * s, y + .04 * s, z + .2 * s, .075 * s, .42 * s, .075 * s, 1.5, 0, 0)], [B.cylL, pants, M(x + sd * .11 * s, y - .2 * s, z + .42 * s, .06 * s, .44 * s, .06 * s, -.15, 0, 0)], [BX, 0x2a2420, M(x + sd * .11 * s, y - .42 * s, z + .48 * s, .09 * s, .06 * s, .2 * s)],
    [B.cylL, shirt, M(x + sd * .2 * s, y + .5 * s, z + reach * .25 * s, .05 * s, .3 * s, .05 * s, .9, 0, 0)], [B.cylL, skin, M(x + sd * .23 * s, y + .44 * s, z + reach * .72 * s, .04 * s, .32 * s, .04 * s, 1.35, 0, 0)]);
  return o;
}
/* small helpers: o = fixed colour part, p = body-paint part */
const pk = (col) => ({ o: (g, c, x, y, z, sx, sy, sz, rx, ry, rz, gl) => [g, c, M(x, y, z, sx, sy, sz, rx, ry, rz), gl || 0, 0], p: (g, x, y, z, sx, sy, sz, rx, ry, rz) => [g, col, M(x, y, z, sx, sy, sz, rx, ry, rz), 0, 1] });
/* Thai three-wheeler: fibreglass nose over the front wheel, raked windscreen, driver bench, passenger tub + bench, chrome posts, canopy */
VB.tuktuk = col => { const { o, p } = pk(col), out = [
  o(BX, 0x1e1e20, 0, .38, -.05, .9, .1, 2.2), [prof('tkN', [[.55, .32], [1.2, .36], [1.42, .55], [1.4, .82], [1.25, 1.02], [1.05, 1.06], [.75, .72], [.55, .62]], .82), col, null, 0, 1],
  o(CYL12, HEAD, 0, .84, 1.41, .1, .05, .1, PI2, 0, 0, 1), o(CYL12, CHROME, 0, .84, 1.39, .13, .05, .13, PI2), o(BX, 0xff9a1a, -.3, 1.0, 1.3, .1, .06, .05, 0, 0, 0, .4), o(BX, 0xff9a1a, .3, 1.0, 1.3, .1, .06, .05, 0, 0, 0, .4),
  o(BX, 0x46586a, 0, 1.4, 1.1, 1.05, .6, .03, -.18), o(BX, CHROME, 0, 1.71, 1.05, 1.1, .04, .05), o(CYL6, 0x2a2a2a, 0, 1.08, .9, .022, .8, .022, 0, 0, PI2), p(BX, 0, 1.03, .98, .9, .1, .2),
  o(BX, 0x1a1a1a, 0, .8, .4, .55, .12, .45), o(BX, 0x1a1a1a, 0, 1.05, .16, .55, .4, .06), p(BX, 0, .6, .4, .72, .38, .7),
  [prof('tkT', [[-1.45, .45], [.02, .45], [.08, .7], [.02, .98], [-.15, 1.02], [-1.42, 1.02], [-1.5, .8]], 1.34), col, null, 0, 1],
  o(BX, 0x6a1414, 0, 1.07, -.75, 1.16, .12, .55), o(BX, 0x6a1414, 0, 1.38, -1.1, 1.16, .6, .12), p(BX, 0, 1.25, -1.37, 1.34, .55, .06),
  o(BX, CHROME, -.68, 1.03, -.7, .03, .04, 1.5), o(BX, CHROME, .68, 1.03, -.7, .03, .04, 1.5), o(BX, CHROME, 0, .5, -1.52, 1.3, .08, .06), o(BX, TAIL, -.5, .82, -1.51, .16, .1, .04, 0, 0, 0, .6), o(BX, TAIL, .5, .82, -1.51, .16, .1, .04, 0, 0, 0, .6), o(BX, PLATE, 0, .66, -1.51, .34, .12, .02),
  p(BX, 0, 1.94, -.12, 1.46, .07, 2.6), o(BX, 0x1c1c1e, 0, 1.99, -.12, 1.3, .04, 2.4), o(BX, CHROME, 0, 1.9, 1.19, 1.46, .1, .04), o(BX, CHROME, 0, 1.9, -1.43, 1.46, .1, .04)];
  for (const s of [-1, 1]) { out.push(o(CYL6, CHROME, s * .7, 1.45, 1.08, .025, 1.0, .025), o(CYL6, CHROME, s * .7, 1.47, -.1, .025, .9, .025), o(CYL6, CHROME, s * .7, 1.47, -1.36, .025, .9, .025), o(CYL6, CHROME, s * .7, 1.32, -.72, .02, 1.2, .02, PI2)); out.push(...wheel(s * .6, .27, -.85, .27, .16)) }
  out.push(...wheel(0, .25, 1.1, .25, .14)); return vmerge(out.concat(riderParts(0, .76, .36, 0xe8e4da, 0x1a1a1a, .92, .55))) };
/* automatic scooter (Click / Wave / Fino class): leg shield, footboard, under-seat body, bar cowl with headlight, mirrors */
VB.scooter = (col, opt) => { const { o, p } = pk(col), out = [
  [prof('scA', [[.32, .4], [.55, .52], [.72, .78], [.74, 1.02], [.62, 1.08], [.48, .98], [.3, .6]], .44), col, null, 0, 1],
  o(BX, 0x2a2a2c, 0, .36, .08, .36, .08, .55), [prof('scB', [[-.15, .32], [.1, .32], [.18, .5], [.12, .78], [-.25, .84], [-.88, .86], [-1.0, .78], [-.85, .55], [-.45, .42]], .38), col, null, 0, 1],
  o(BX, 0x3a3a3c, .1, .38, -.45, .16, .2, .6), o(BX, 0x161616, 0, .92, -.42, .32, .1, .74), o(BX, 0x3a3a3c, 0, .92, -.86, .3, .04, .12), o(BX, TAIL, 0, .8, -.99, .18, .07, .05, 0, 0, 0, .7), o(BX, PLATE, 0, .6, -1.0, .18, .12, .02, -.3),
  o(CYL6, 0x9a9ea4, -.06, .7, .6, .025, .7, .025, -.3), o(CYL6, 0x9a9ea4, .06, .7, .6, .025, .7, .025, -.3), p(BX, 0, 1.1, .56, .46, .13, .2), o(BX, HEAD, 0, 1.08, .665, .22, .08, .03, 0, 0, 0, 1),
  o(CYL6, 0x1a1a1a, 0, 1.13, .5, .02, .7, .02, 0, 0, PI2), p(BX, 0, .56, .66, .12, .04, .42, -.1), o(CYL6, 0x8a8e94, .16, .34, -.62, .05, .5, .05, PI2)];
  for (const s of [-1, 1]) out.push(o(CYL6, 0x2a2a2a, s * .2, 1.25, .5, .01, .25, .01), o(BX, 0x1a1a1a, s * .22, 1.38, .5, .1, .06, .02));
  out.push(...wheel(0, .27, .64, .27, .1), ...wheel(0, .27, -.6, .27, .1));
  return vmerge(opt && opt.rider === false ? out : out.concat(riderParts(0, .9, -.28, 0x3a5a8a, 0xe8e8e8, 1, .55))) };
/* city bicycle with a front basket */
VB.bicycle = (col, opt) => { const { o, p } = pk(col), T = new THREE.TorusGeometry(.32, .025, 4, 18), out = [
  p(CYL6, 0, .55, 0, .025, .95, .025, PI2 - .25), p(CYL6, 0, .45, .25, .025, .8, .025, 1.1), p(CYL6, 0, .45, -.25, .025, .8, .025, -1.1), p(CYL6, 0, .62, -.3, .025, .6, .025, -.25), o(BX, 0x1a1a1a, 0, .95, -.3, .12, .05, .25),
  [T, TYRE, M(0, .32, .55, 1, 1, 1, 0, PI2, 0), 0, 0], [T, TYRE, M(0, .32, -.55, 1, 1, 1, 0, PI2, 0), 0, 0], o(CYL6, 0x404040, 0, 1.05, .45, .018, .55, .018, 0, 0, PI2), o(BX, 0x8a6a3a, 0, .9, .68, .3, .2, .25)];
  return vmerge(opt && opt.rider === false ? out : out.concat(riderParts(0, .95, -.25, 0xd8d0c0, 0x2a6ad8, .95, .6))) };
/* compact sedan (Vios / City class) */
VB.car = col => { const { o, p } = pk(col), out = [
  [prof('carB', [[-2.2, .34], ...arch(-1.26, .31, .38), ...arch(1.32, .31, .38), [2.2, .34], [2.25, .52], [2.2, .7], [2.02, .8], [1.0, .9], [-1.45, .94], [-1.62, .97], [-2.16, .95], [-2.25, .75], [-2.24, .5]], 1.72), col, null, 0, 1],
  [prof('carG', [[1.05, .86], [.22, 1.38], [-.9, 1.42], [-1.58, .96], [-1.58, .86]], 1.5), GLASS, null, 0, 0],
  p(BX, 0, 1.415, -.33, 1.52, .06, 1.18), o(BX, 0x15171a, 0, .58, 2.22, .8, .14, .06), o(BX, 0x15171a, 0, .4, 2.2, 1.1, .1, .06), o(BX, PLATE, 0, .47, 2.255, .44, .13, .02), o(BX, PLATE, 0, .6, -2.26, .44, .13, .02)];
  for (const s of [-1, 1]) { out.push(p(BX, s * .74, 1.12, .635, .06, .06, .98, .55), p(BX, s * .74, 1.19, -1.24, .06, .06, .82, -.595), p(BX, s * .745, 1.14, -.3, .06, .5, .1), p(BX, s * .88, .98, .92, .12, .09, .14),
    o(BX, HEAD, s * .6, .72, 2.17, .42, .12, .1, 0, 0, 0, 1), o(BX, TAIL, s * .62, .8, -2.2, .4, .12, .1, 0, 0, 0, .5), o(BX, 0x2a2a2a, s * .86, .36, 0, .04, .06, 2.4)); out.push(...wheel(s * .76, .31, -1.26, .31, .2), ...wheel(s * .76, .31, 1.32, .31, .2)) }
  return vmerge(out) };
/* double-cab pickup (Hilux / D-Max class) - the most common vehicle in northern Thailand */
VB.pickup = col => { const { o, p } = pk(col), out = [
  [prof('puB', [[-2.65, .42], ...arch(-1.45, .38, .45), ...arch(1.6, .38, .45), [2.62, .42], [2.68, .7], [2.62, 1.0], [2.45, 1.08], [1.25, 1.16], [-.75, 1.2], [-.75, .92], [-2.65, .92]], 1.82), col, null, 0, 1],
  [prof('puG', [[1.25, 1.12], [.45, 1.72], [-.62, 1.74], [-.78, 1.62], [-.78, 1.12]], 1.64), GLASS, null, 0, 0],
  p(BX, 0, 1.75, -.08, 1.66, .06, 1.12), p(BX, 0, 1.07, -2.62, 1.82, .3, .06), o(BX, 0x2a2a2a, 0, .93, -1.7, 1.7, .02, 1.85), o(BX, 0x1a1c1f, 0, .86, 2.66, 1.1, .32, .06), o(BX, CHROME, 0, .92, 2.695, 1.12, .05, .04),
  o(BX, 0x8a8e94, 0, .55, 2.66, 1.84, .2, .14), o(BX, 0x8a8e94, 0, .5, -2.68, 1.8, .14, .14), o(BX, PLATE, 0, .55, 2.74, .44, .13, .02), o(BX, PLATE, 0, .78, -2.66, .44, .13, .02)];
  for (const s of [-1, 1]) { out.push(p(BX, s * .88, 1.07, -1.7, .06, .3, 1.9), p(BX, s * .81, 1.42, .85, .06, .06, 1.0, .6435), p(BX, s * .815, 1.43, .05, .06, .6, .1), p(BX, s * .815, 1.43, -.7, .06, .6, .14), p(BX, s * .96, 1.22, 1.1, .12, .12, .14),
    o(BX, HEAD, s * .7, .95, 2.6, .36, .14, .1, 0, 0, 0, 1), o(BX, TAIL, s * .9, 1.02, -2.6, .06, .32, .08, 0, 0, 0, .5), o(BX, 0x2a2a2a, s * .95, .45, .3, .14, .05, 1.6)); out.push(...wheel(s * .78, .38, -1.45, .38, .26), ...wheel(s * .78, .38, 1.6, .38, .26)) }
  return vmerge(out) };
/* Chiang Mai "rot daeng" songthaew: pickup cab + long covered bed, open window band, side benches, roof rails, rear step */
VB.songthaew = col => { const { o, p } = pk(col), out = [
  [prof('stB', [[-2.95, .42], ...arch(-1.45, .38, .45), ...arch(1.6, .38, .45), [2.62, .42], [2.68, .7], [2.62, 1.0], [2.45, 1.08], [1.25, 1.16], [.1, 1.2], [.1, .92], [-2.95, .92]], 1.82), col, null, 0, 1],
  [prof('stG', [[1.25, 1.12], [.45, 1.72], [.12, 1.72], [.12, 1.12]], 1.64), GLASS, null, 0, 0], p(BX, 0, 1.74, .3, 1.66, .05, .42), p(BX, 0, 1.92, .1, 1.84, .36, .05),
  p(BX, 0, 2.12, -1.14, 1.98, .08, 3.68), o(BX, 0xf4f0e0, 0, 2.3, .55, 1.3, .24, .08, 0, 0, 0, .3), o(BX, 0x3a2a24, 0, .93, -1.42, 1.78, .02, 3.0),
  o(BX, CHROME, 0, .62, -3.05, 1.5, .05, .3), o(BX, 0x1a1c1f, 0, .86, 2.66, 1.1, .32, .06), o(BX, CHROME, 0, .92, 2.695, 1.12, .05, .04), o(BX, 0x8a8e94, 0, .55, 2.66, 1.84, .2, .14), o(BX, PLATE, 0, .55, 2.74, .44, .13, .02), o(BX, PLATE, 0, .8, -2.97, .44, .13, .02)];
  for (const s of [-1, 1]) { out.push(p(BX, s * .92, 1.14, -1.42, .06, .44, 3.06), p(BX, s * .92, 2.02, -1.42, .06, .14, 3.06), o(BX, 0x5a2a20, s * .62, 1.12, -1.5, .4, .1, 2.6), o(BX, CHROME, s * .95, 2.22, -1.14, .04, .08, 3.6), o(CYL6, CHROME, s * .78, 1.55, -2.95, .025, 1.2, .025),
    p(BX, s * .81, 1.42, .85, .06, .06, 1.0, .6435), o(BX, HEAD, s * .7, .95, 2.6, .36, .14, .1, 0, 0, 0, 1), o(BX, TAIL, s * .88, 1.1, -2.96, .1, .3, .06, 0, 0, 0, .5), p(BX, s * .96, 1.22, 1.1, .12, .12, .14));
    for (const z of [-.05, -1.0, -1.95, -2.9]) out.push(p(BX, s * .92, 1.68, z, .06, .64, .08)); out.push(...wheel(s * .78, .38, -1.45, .38, .26), ...wheel(s * .78, .38, 1.6, .38, .26)) }
  return vmerge(out) };
/* V0.9.9: red Viennese tram (front = +z) */
VB.tram = col => K.merge([[K.BG.box, col, M(0, 1.6, 0, 2.4, 2.6, 15)], [K.BG.box, 0xf4f0e8, M(0, 1.05, 0, 2.42, .5, 15.02)], [K.BG.box, 0x9ad8ff, M(0, 2.25, 0, 2.44, .9, 14.2), .25], [K.BG.box, 0x2a2a2a, M(0, .25, 0, 2.2, .3, 14.4)],
  [K.BG.box, col, M(0, 2.98, 0, 2.2, .14, 14.6)], [K.BG.box, 0x3a3a3a, M(0, 3.3, 2, .08, .6, 1.6, .6, 0, 0)], [K.BG.box, 0x3a3a3a, M(0, 3.62, 2.3, 1.4, .05, .06)], [K.BG.box, 0x9ad8ff, M(0, 2.1, 7.52, 2.1, 1.2, .04), .3], [K.BG.sph, 0xfff0c0, M(-.8, 1.0, 7.52, .12, .12, .05), 1], [K.BG.sph, 0xfff0c0, M(.8, 1.0, 7.52, .12, .12, .05), 1]]);
CY.VB = VB;   /* V0.9.7: vehicle meshes reused by the tuk-tuk rides */
/* vehicle material: vertex colours + night glow (headlights/tail lights) + per-instance body paint on aPaint parts; reflections on Medium/High */
CY.vehMat = function (ctx) {
  const m = K.floraMat(0, { rough: .42, metal: .1 }), ob = m.onBeforeCompile;
  m.onBeforeCompile = sh => { ob(sh); sh.vertexShader = 'attribute float aPaint;\n' + sh.vertexShader.replace('#include <color_vertex>', '#include <color_vertex>\n#ifdef USE_INSTANCING_COLOR\n  vColor.xyz = color.xyz * mix(vec3(1.0), instanceColor.xyz, aPaint);\n#endif') };
  m.customProgramCacheKey = () => 'veh'; if (ctx && AV.gfx && AV.gfx.reg) AV.gfx.reg(ctx, m, 'env', .25); return m;
};
const _c = new THREE.Color(), pick = a => a[Math.random() * a.length | 0];
const TWO = { scooter: 1, bicycle: 1 }, VLEN = { tuktuk: 3, scooter: 1.9, bicycle: 1.8, songthaew: 6.1, car: 4.5, pickup: 5.4, tram: 15 };
CY.VLEN = VLEN;   /* regional vehicles (chars_regional.js) register their lengths here */
/* parked vehicles (static): list [{type, x, z, yaw, col, chunk?}] -> one instanced draw call per type and chunk (e.g. per street).
   Each chunk's geometry gets a bounding sphere around all of its instances, so whole streets are frustum-culled. Lights are off. */
CY.parked = function (ctx, list) {
  const by = {}, mat = CY.vehMat(ctx), out = []; list.forEach(v => { const k = v.type + '|' + (v.chunk || 0); (by[k] = by[k] || []).push(v) });
  for (const k in by) { const a = by[k], g = VB[a[0].type](0xffffff, { rider: false }), im = new THREE.InstancedMesh(g, mat, a.length), box = new THREE.Box3();
    g.attributes.aGlow.array.fill(0);   // parked: headlights / tail lights off
    a.forEach((v, i) => { _q.setFromAxisAngle(_v.set(0, 1, 0), v.yaw); _m.compose(_v.set(v.x, v.y || 0, v.z), _q, _s); im.setMatrixAt(i, _m); im.setColorAt(i, _c.setHex(v.col).convertSRGBToLinear()); box.expandByPoint(_v.set(v.x, (v.y || 0) + 1, v.z)) });
    g.boundingSphere = box.getBoundingSphere(new THREE.Sphere()); g.boundingSphere.radius += 3.5;
    im.instanceColor.needsUpdate = true; im.castShadow = K.q() === 2; im.receiveShadow = true; im.name = 'parked_' + a[0].type; ctx.group.add(im); out.push(im) }
  return out;
};
/* loops: [{pts:[[x,z],...], off, w?}] ; spec: [{type, col, n, speed, cols?}] (cols = paint palette, one colour picked per vehicle)
   V1.0: vehicles keep their distance (queue behind the one ahead), scooters and bicycles ride kerbside and filter past cars */
CY.traffic = function (ctx, loops, spec, opt) {
  opt = opt || {}; const cars = [], meshes = [], mat = CY.vehMat(ctx);
  const L = loops.map(lp => { const p = lp.pts, cum = [0]; for (let i = 1; i <= p.length; i++) { const a = p[i - 1], b = p[i % p.length]; cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1])) } const off = lp.off == null ? 1.7 : lp.off, kerb = lp.w ? Math.min(1.5, Math.max(0, lp.w / 2 - Math.abs(off) - .55)) : .8; return { p, cum, len: cum[cum.length - 1], off, kerb, mixed: !!lp.w && kerb < 1.25 } });   /* w = road width: wide roads give two-wheelers their own kerbside strip, narrow ones make everybody queue */
  spec.forEach((sp, si) => { const n = sp.n; if (!n) return; const tint = !!sp.cols, im = new THREE.InstancedMesh(VB[sp.type](tint ? 0xffffff : sp.col), mat, n); im.name = 'traffic_' + sp.type; im.frustumCulled = false; im.castShadow = K.q() === 2; im.receiveShadow = true; ctx.group.add(im); meshes.push(im);
    for (let i = 0; i < n; i++) { const li = (si + i) % L.length; if (tint) im.setColorAt(i, _c.setHex(pick(sp.cols)).convertSRGBToLinear()); cars.push({ im, i, li, s: (i / n + si * .13) * L[li].len, v: sp.speed * (.85 + Math.random() * .3), vmax: sp.speed * (.9 + Math.random() * .2), honkT: 0, type: sp.type, wake: i / n, two: !!TWO[sp.type], len: VLEN[sp.type] || 4 }) }
    if (im.instanceColor) im.instanceColor.needsUpdate = true });
  const at = (lp, s, kerb) => { s = ((s % lp.len) + lp.len) % lp.len; let i = 1; while (lp.cum[i] < s) i++; const a = lp.p[i - 1], b = lp.p[i % lp.p.length], f = (s - lp.cum[i - 1]) / (lp.cum[i] - lp.cum[i - 1]), dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz), off = lp.off + (kerb ? Math.sign(lp.off || 1) * lp.kerb : 0); return [a[0] + dx * f - dz / l * off, a[1] + dz * f + dx / l * off, Math.atan2(dx, dz)] };
  const api = { cars, density: () => { const h = hourNow(); return h < 5 ? .25 : h < 7 ? .6 : h < 22 ? 1 : .55 }, stopAt: null };
  ctx.upd.push((dt, t) => {
    const P = AV.P, dens = opt.density ? opt.density() : api.density();
    for (const c of cars) c.active = c.wake < dens;
    for (const c of cars) {
      const lp = L[c.li]; if (!c.active) { c.im.setMatrixAt(c.i, ZERO); continue }
      const p = at(lp, c.s, c.two), ahead = at(lp, c.s + 3.2, c.two), dP = Math.hypot(ahead[0] - P.x, ahead[1] - P.z), stop = dP < 2.4 || (api.stopAt && api.stopAt(p[0], p[1]));
      let gap = 1e9; for (const o of cars) { if (o === c || !o.active || o.li !== c.li || (!lp.mixed && o.two !== c.two)) continue; const d = (((o.s - c.s) % lp.len) + lp.len) % lp.len - (o.len + c.len) / 2; if (d < gap) gap = d }   // bumper-to-bumper distance to the vehicle ahead
      const want = stop ? 0 : Math.min(c.vmax, gap < 1.8 ? 0 : gap < 9 ? c.vmax * (gap - 1.8) / 7.2 : c.vmax);
      c.v += (want - c.v) * Math.min(1, dt * (want < c.v ? 4 : 1.2)); c.s += c.v * dt;
      if (dP < 2.4 && t > c.honkT && AV.audio) { c.honkT = t + 3; AV.audio.blip(c.type === 'scooter' ? 660 : 420, .18, 'square', .06); setTimeout(() => AV.audio.blip(c.type === 'scooter' ? 660 : 420, .14, 'square', .05), 200) }
      const gy = opt.H ? opt.H(p[0], p[1]) : 0; _q.setFromAxisAngle(_v.set(0, 1, 0), p[2]); _m.compose(_v.set(p[0], gy + ((c.type === 'scooter' || c.type === 'bicycle') ? Math.sin(t * 9 + c.i) * .01 : 0), p[1]), _q, _s); c.im.setMatrixAt(c.i, _m); c.x = p[0]; c.z = p[1]; c.yaw = p[2];
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
CY.smoke = function (ctx, n, opt) {
  opt = opt || {}; n = n || 90; const im = new THREE.InstancedMesh(new THREE.SphereGeometry(.07, 6, 4), new THREE.MeshBasicMaterial({ color: opt.color == null ? 0xd8d8e0 : opt.color, transparent: true, opacity: opt.opacity == null ? .35 : opt.opacity, depthWrite: false }), n); im.frustumCulled = false; im.material.userData.lin = 1; ctx.group.add(im);
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
