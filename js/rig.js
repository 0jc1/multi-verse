/* APEVERSE V0.9 - rig.js : runtime skeleton for the procedural characters.
   - Rig: THREE.Bone hierarchy built from anatomy.js (identity rest rotations), a small FK solver in character space,
     analytic two-bone IK (law of cosines + pole vector, frame-aligned so twist is stable) and helpers to aim bones.
   - Spring: damped spring "jiggle" bones in world space -> soft-body belly, cheeks, throat sac, chest, shirt hem.
   - Rope: Verlet chains with sphere colliders, rendered as a live tube (dreadlocks, neck chains, bead necklaces, long hair).
   Everything is allocation-free per frame. */
'use strict';
(function (AV) {
const RG = AV.rig = {};
const V = THREE.Vector3, Q = THREE.Quaternion, M4 = THREE.Matrix4, M3 = THREE.Matrix3;
const _a = new V(), _b = new V(), _c = new V(), _d = new V(), _e = new V(), _q = new Q(), _m = new M4(), _m2 = new M4(), _m3 = new M3();

function basis(out, a, n) { _e.crossVectors(a, n); return out.makeBasis(a, n, _e) }

class Rig {
  constructor(K) {
    this.K = K; this.I = K.idx; const n = this.n = K.bones.length;
    this.bones = []; this.off = []; this.par = []; this.rest = []; this.q = []; this.t = []; this.Q = []; this.P = [];
    K.bones.forEach((b, i) => {
      const bone = new THREE.Bone(); bone.name = b.name; const rp = new V().fromArray(b.pos), pp = b.parent >= 0 ? new V().fromArray(K.bones[b.parent].pos) : new V();
      const off = rp.clone().sub(pp); bone.position.copy(off); if (b.parent >= 0) this.bones[b.parent].add(bone);
      this.bones.push(bone); this.off.push(off); this.par.push(b.parent); this.rest.push(rp); this.q.push(new Q()); this.t.push(new V()); this.Q.push(new Q()); this.P.push(rp.clone());
    });
    this.chains = {};
  }
  /* attach to the character group (must be at the origin, unposed) and create the shared skeleton */
  mount(group) { this.group = group; group.add(this.bones[0]); group.updateMatrixWorld(true); this.skeleton = new THREE.Skeleton(this.bones); return this }
  b(name) { return this.I[name] }
  reset() { for (let i = 0; i < this.n; i++) { this.q[i].set(0, 0, 0, 1); this.t[i].set(0, 0, 0) } }
  fk() {
    const { par, Q: QQ, P, q, t, off } = this;
    for (let i = 0; i < this.n; i++) { const p = par[i]; if (p < 0) { QQ[i].copy(q[i]); P[i].copy(off[i]).add(t[i]) } else { QQ[i].multiplyQuaternions(QQ[p], q[i]); P[i].copy(off[i]).add(t[i]).applyQuaternion(QQ[p]).add(P[p]) } }
  }
  apply() { for (let i = 0; i < this.n; i++) { this.bones[i].position.copy(this.off[i]).add(this.t[i]); this.bones[i].quaternion.copy(this.q[i]) } }
  /* set a bone's rotation in character space (parent's Q must be current) */
  setChar(i, Qc) { const p = this.par[i]; if (p < 0) this.q[i].copy(Qc); else this.q[i].copy(this.Q[p]).conjugate().multiply(Qc); this.Q[i].copy(Qc) }
  /* refresh Q/P for one bone from its parent (cheap partial FK) */
  fk1(i) { const p = this.par[i]; this.Q[i].multiplyQuaternions(this.Q[p], this.q[i]); this.P[i].copy(this.off[i]).add(this.t[i]).applyQuaternion(this.Q[p]).add(this.P[p]) }
  chain(name, u, l, e) {
    const R = this.rest, Pu = R[u], Pl = R[l], Pe = R[e], l1 = Pu.distanceTo(Pl), l2 = Pl.distanceTo(Pe);
    const dir = Pe.clone().sub(Pu).normalize(), bend = Pl.clone().sub(Pu); bend.sub(dir.clone().multiplyScalar(bend.dot(dir))).normalize();
    const n = new V().crossVectors(bend, dir).normalize(), dU = Pl.clone().sub(Pu).normalize(), dL = Pe.clone().sub(Pl).normalize();
    const Bu = basis(new M4(), dU, n).transpose(), Bl = basis(new M4(), dL, n).transpose();
    return this.chains[name] = { u, l, e, l1, l2, Bu, Bl, restBend: bend, reach: 0 };
  }
  /* two-bone IK in character space. target/pole: char-space points. endQ: char-space rotation for the end bone (or null). */
  ik(ch, target, pole, endQ) {
    const S = this.P[ch.u], l1 = ch.l1, l2 = ch.l2;
    _a.subVectors(target, S); let dist = _a.length(); const dir = _a.multiplyScalar(1 / (dist || 1));
    dist = Math.max(Math.abs(l1 - l2) + 1e-3, Math.min((l1 + l2) * .9995, dist)); ch.reach = dist / (l1 + l2);
    _b.subVectors(pole, S); _b.addScaledVector(dir, -_b.dot(dir)); if (_b.lengthSq() < 1e-8) _b.copy(ch.restBend); _b.normalize();
    const a = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist), hh = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    _c.copy(S).addScaledVector(dir, a).addScaledVector(_b, hh);                           // elbow / knee
    _d.copy(S).addScaledVector(dir, dist);                                                   // wrist / ankle
    const nn = _nn.crossVectors(_b, dir).normalize(), dU = _du.subVectors(_c, S).normalize(), dL = _dl.subVectors(_d, _c).normalize();
    _q.setFromRotationMatrix(basis(_m, dU, nn).multiply(ch.Bu)); this.setChar(ch.u, _q);
    _q.setFromRotationMatrix(basis(_m, dL, nn).multiply(ch.Bl)); this.setChar(ch.l, _q);
    this.P[ch.l].copy(_c); if (endQ) this.setChar(ch.e, endQ); else this.Q[ch.e].multiplyQuaternions(this.Q[ch.l], this.q[ch.e]);
    this.P[ch.e].copy(_d);
  }
  /* rotation (char space) that maps the rest frame (a0, b0) onto (a1, b1); a = primary axis, b = secondary (orthogonalised) */
  static frame(out, a0, b0, a1, b1) {
    _fa.copy(a0).normalize(); _fb.copy(b0); _fb.addScaledVector(_fa, -_fb.dot(_fa)).normalize(); basis(_m2, _fa, _fb).transpose();
    _fa.copy(a1).normalize(); _fb.copy(b1); _fb.addScaledVector(_fa, -_fb.dot(_fa)).normalize(); basis(_m, _fa, _fb).multiply(_m2);
    return out.setFromRotationMatrix(_m);
  }
  /* parent a rigid object authored in rest character space to a bone */
  attach(name, obj) { const i = this.I[name]; obj.position.sub(this.rest[i]); this.bones[i].add(obj); return obj }
  /* world <-> character space */
  toChar(out, w) { _m.copy(this.group.matrixWorld).invert(); return out.copy(w).applyMatrix4(_m) }
  toWorld(out, c) { return out.copy(c).applyMatrix4(this.group.matrixWorld) }
}
const _nn = new V(), _du = new V(), _dl = new V(), _fa = new V(), _fb = new V();
RG.Rig = Rig;

/* ---------- soft-body spring bones ---------- */
class Spring {
  constructor(rig, name, o) { this.rig = rig; this.i = rig.I[name]; this.p = rig.par[this.i]; this.k = o.k || 160; this.c = o.c || 9; this.max = o.max || .06; this.gain = o.gain || 1; this.x = new V(); this.v = new V(); this.goal = new V(); this.init = false; this.lift = o.lift || 0 }
  update(dt) {
    const R = this.rig, i = this.i, p = this.p;
    this.goal.copy(R.off[i]).applyQuaternion(R.Q[p]).add(R.P[p]).applyMatrix4(R.group.matrixWorld);
    if (!this.init || dt > .2) { this.x.copy(this.goal); this.v.set(0, 0, 0); this.init = true }
    const steps = Math.max(1, Math.ceil(dt / (1 / 120))), h = dt / steps;
    for (let s = 0; s < steps; s++) { _a.subVectors(this.goal, this.x).multiplyScalar(this.k).addScaledVector(this.v, -this.c); _a.y -= this.lift; this.v.addScaledVector(_a, h); this.x.addScaledVector(this.v, h) }
    _a.subVectors(this.x, this.goal); const L = _a.length(), mx = this.max * (R.scaleW || 1); if (L > mx) { _a.multiplyScalar(mx / L); this.x.copy(this.goal).add(_a) }
    _m3.setFromMatrix4(R.group.matrixWorld).invert(); _a.applyMatrix3(_m3).applyQuaternion(_q.copy(R.Q[p]).conjugate()).multiplyScalar(this.gain);
    R.t[i].copy(_a);
  }
  kick(x, y, z) { this.v.x += x; this.v.y += y; this.v.z += z }
}
RG.Spring = Spring;

/* ---------- Verlet rope rendered as a tube ---------- */
class Rope {
  /* o: { n, seg, radius(t), mat, anchor(outW), anchor2(outW)?, colliders:[{c(outW), r}], damp, grav, sides, parent } */
  constructor(o) {
    this.o = o; const n = this.n = o.n, S = this.S = o.sides || 6; this.p = []; this.pp = []; for (let i = 0; i < n; i++) { this.p.push(new V()); this.pp.push(new V()) }
    this.local = []; for (let i = 0; i < n; i++) this.local.push(new V());
    const g = new THREE.BufferGeometry(), pos = new Float32Array(n * S * 3), nor = new Float32Array(n * S * 3), idx = [];
    for (let i = 0; i < n - 1; i++) for (let k = 0; k < S; k++) { const a = i * S + k, b = i * S + (k + 1) % S, c = a + S, d = b + S; idx.push(a, c, b, b, c, d) }
    g.setIndex(idx); g.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3).setUsage(THREE.DynamicDrawUsage));
    this.mesh = new THREE.Mesh(g, o.mat); this.mesh.frustumCulled = false; this.mesh.castShadow = true; o.parent.add(this.mesh); this.init = false;
  }
  reset() { const o = this.o; o.anchor(_a); for (let i = 0; i < this.n; i++) { this.p[i].copy(_a); this.p[i].y -= i * o.seg; if (o.anchor2) { o.anchor2(_b); this.p[i].lerpVectors(_a, _b, i / (this.n - 1)); this.p[i].y -= Math.sin(i / (this.n - 1) * Math.PI) * o.seg * 2 } this.pp[i].copy(this.p[i]) } this.init = true }
  update(dt, group) {
    const o = this.o, n = this.n, P = this.p, PP = this.pp; if (!this.init || dt > .2) this.reset();
    const damp = o.damp == null ? .97 : o.damp, g = -(o.grav == null ? 9.8 : o.grav) * dt * dt;
    for (let i = 1; i < n; i++) { const p = P[i], q = PP[i]; _a.subVectors(p, q).multiplyScalar(damp); q.copy(p); p.add(_a); p.y += g }
    o.anchor(P[0]); const last = o.anchor2 ? n - 1 : n;
    for (let it = 0; it < 5; it++) {
      for (let i = 0; i < n - 1; i++) { const a = P[i], b = P[i + 1]; _a.subVectors(b, a); const L = _a.length() || 1e-6, df = (L - o.seg) / L; if (i === 0) b.addScaledVector(_a, -df); else if (i + 1 === n - 1 && o.anchor2) a.addScaledVector(_a, df); else { a.addScaledVector(_a, df * .5); b.addScaledVector(_a, -df * .5) } }
      if (o.anchor2) o.anchor2(P[n - 1]);
      if (o.colliders) for (const C of o.colliders) { C.c(_c); const r = C.r; for (let i = 1; i < last; i++) { _a.subVectors(P[i], _c); const L = _a.length(); if (L < r) P[i].copy(_c).addScaledVector(_a, r / (L || 1)) } }
    }
    /* tube in group-local space */
    _m.copy(group.matrixWorld).invert(); for (let i = 0; i < n; i++) this.local[i].copy(P[i]).applyMatrix4(_m);
    const pos = this.mesh.geometry.attributes.position, nor = this.mesh.geometry.attributes.normal, S = this.S, up = _d.set(0, 0, 1);
    for (let i = 0; i < n; i++) {
      const L = this.local; _a.subVectors(L[Math.min(n - 1, i + 1)], L[Math.max(0, i - 1)]).normalize();
      _b.crossVectors(_a, up); if (_b.lengthSq() < 1e-6) _b.set(1, 0, 0); _b.normalize(); _c.crossVectors(_b, _a).normalize(); up.copy(_c);
      const r = o.radius(i / (n - 1));
      for (let k = 0; k < S; k++) { const t = k / S * Math.PI * 2, cs = Math.cos(t), sn = Math.sin(t), j = (i * S + k) * 3; const nx = _b.x * cs + _c.x * sn, ny = _b.y * cs + _c.y * sn, nz = _b.z * cs + _c.z * sn;
        pos.array[j] = L[i].x + nx * r; pos.array[j + 1] = L[i].y + ny * r; pos.array[j + 2] = L[i].z + nz * r; nor.array[j] = nx; nor.array[j + 1] = ny; nor.array[j + 2] = nz }
    }
    pos.needsUpdate = nor.needsUpdate = true;
  }
  /* sample a point at arc fraction f (group-local) */
  sample(out, f) { const n = this.n, x = f * (n - 1), i = Math.min(n - 2, Math.floor(x)); return out.lerpVectors(this.local[i], this.local[i + 1], x - i) }
}
RG.Rope = Rope;
})(window.AV);
