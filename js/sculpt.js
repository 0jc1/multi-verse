/* APEVERSE V0.9 - sculpt.js : procedural "digital clay".
   Characters are described as signed-distance primitives (round cones, ellipsoids, rounded boxes, cut planes) blended with
   smooth unions/subtractions, then polygonised with SPARSE surface nets (only blocks near the surface are visited), every
   vertex projected back onto the true surface (Newton step) and given an analytic SDF normal.
   Per vertex it also bakes: 4 bone weights (soft membership of the primitives -> their bones, plus "jiggle" soft-body bones),
   4 material channel weights, fur length, and ambient occlusion sampled from the SDF. Pure math: no THREE dependency, so it
   also runs in Node (tools/bench_sculpt.js). */
'use strict';
(function (factory) { const root = typeof window !== 'undefined' ? window : globalThis; factory(root); if (root.AV) (root.AV._gensrc = root.AV._gensrc || []).push(factory.toString()) })(function (root) {
  const SC = {};
  const STRIDE = 24, BLK = 8, LIP = 1.3;

  /* ---------- primitive constructors (all coordinates in metres, character space: y up, facing +z, left = +x) ---------- */
  function opts(o, d) { return Object.assign({ op: 'add', k: .02, bone: 0, bone2: -1, t0: 0, t1: 1, mat: 0, fur: 0 }, d || {}, o || {}) }
  SC.sph = (c, r, o) => opts(o, { type: 0, c, r });
  SC.cone = (a, b, ra, rb, o) => opts(o, { type: 1, a, b, ra, rb });
  SC.cap = (a, b, r, o) => SC.cone(a, b, r, r, o);
  SC.ell = (c, r, o) => opts(o, { type: 2, c, r });              // o.rot = [xAxis, yAxis, zAxis] (local axes expressed in char space)
  SC.box = (c, half, round, o) => opts(o, { type: 3, c, half, round });
  SC.frustum = (a, b, ra, rb, round, o) => opts(o, { type: 5, a, b, ra, rb, round: round || 0 });   // capped cone with rounded rims (brims, cuffs, soles)
SC.plane = (p, n, o) => opts(o, { type: 4, p, n, op: 'int', k: .004 });   // keeps the side the normal points AWAY from
  /* rotation helpers for o.rot */
  const nrm3 = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l] };
  const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  SC.basisY = (yDir, hintZ) => {       // local y axis along yDir, z as close to hintZ as possible
    const y = nrm3(yDir), hz = hintZ || [0, 0, 1]; let x = cross3(y, hz); if (Math.hypot(x[0], x[1], x[2]) < 1e-4) x = cross3(y, [1, 0, 0]); x = nrm3(x); const z = cross3(x, y); return [x, y, z];
  };
  SC.basisEuler = (rx, ry, rz) => {    // XYZ intrinsic, returns local axes in char space
    const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry), cz = Math.cos(rz), sz = Math.sin(rz);
    // R = Rx*Ry*Rz (column vectors = local axes)
    const m = [[cy * cz, -cy * sz, sy], [cx * sz + sx * sy * cz, cx * cz - sx * sy * sz, -sx * cy], [sx * sz - cx * sy * cz, sx * cz + cx * sy * sz, cx * cy]];
    return [[m[0][0], m[1][0], m[2][0]], [m[0][1], m[1][1], m[2][1]], [m[0][2], m[1][2], m[2][2]]];
  };

  /* ---------- compile ---------- */
  function compile(prims) {
    const n = prims.length, P = new Float64Array(n * STRIDE), T = new Int8Array(n), OP = new Int8Array(n), K = new Float64Array(n), BS = new Float64Array(n * 4);
    prims.forEach((p, i) => {
      const o = i * STRIDE; T[i] = p.type; OP[i] = p.op === 'add' ? 0 : p.op === 'sub' ? 1 : 2; K[i] = Math.max(1e-5, p.k);
      const rot = p.rot ? p.rot.map(nrm3) : null, setRot = (at) => { const r = rot || [[1, 0, 0], [0, 1, 0], [0, 0, 1]]; for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) P[o + at + a * 3 + b] = r[a][b] };   // rows = local axes -> world->local
      if (p.type === 0) { P[o] = p.c[0]; P[o + 1] = p.c[1]; P[o + 2] = p.c[2]; P[o + 3] = p.r; BS.set([p.c[0], p.c[1], p.c[2], p.r], i * 4) }
      else if (p.type === 1) {
        const ba = [p.b[0] - p.a[0], p.b[1] - p.a[1], p.b[2] - p.a[2]], l2 = Math.max(1e-10, ba[0] * ba[0] + ba[1] * ba[1] + ba[2] * ba[2]), rr = p.ra - p.rb;
        P.set([p.a[0], p.a[1], p.a[2], ba[0], ba[1], ba[2], l2, rr, l2 - rr * rr, 1 / l2, p.ra, p.rb], o);
        BS.set([(p.a[0] + p.b[0]) / 2, (p.a[1] + p.b[1]) / 2, (p.a[2] + p.b[2]) / 2, Math.sqrt(l2) / 2 + Math.max(p.ra, p.rb)], i * 4);
      } else if (p.type === 2) { P.set([p.c[0], p.c[1], p.c[2], p.r[0], p.r[1], p.r[2]], o); setRot(6); BS.set([p.c[0], p.c[1], p.c[2], Math.max(p.r[0], p.r[1], p.r[2])], i * 4) }
      else if (p.type === 3) { P.set([p.c[0], p.c[1], p.c[2], p.half[0], p.half[1], p.half[2], p.round], o); setRot(7); BS.set([p.c[0], p.c[1], p.c[2], Math.hypot(p.half[0], p.half[1], p.half[2])], i * 4) }
      else if (p.type === 5) { const ba = [p.b[0] - p.a[0], p.b[1] - p.a[1], p.b[2] - p.a[2]], bb = ba[0] * ba[0] + ba[1] * ba[1] + ba[2] * ba[2], r = p.round;
      P.set([p.a[0], p.a[1], p.a[2], ba[0], ba[1], ba[2], bb, p.ra - r, p.rb - r, r], o); BS.set([(p.a[0] + p.b[0]) / 2, (p.a[1] + p.b[1]) / 2, (p.a[2] + p.b[2]) / 2, Math.sqrt(bb) / 2 + Math.max(p.ra, p.rb)], i * 4) }
    else { const nn = nrm3(p.n); P.set([p.p[0], p.p[1], p.p[2], nn[0], nn[1], nn[2]], o); BS.set([p.p[0], p.p[1], p.p[2], 1e9], i * 4) }
    });
    return { n, P, T, OP, K, BS, prims };
  }
  /* single primitive distance */
  function pd(C, i, x, y, z) {
    const P = C.P, o = i * STRIDE;
    switch (C.T[i]) {
      case 0: { const dx = x - P[o], dy = y - P[o + 1], dz = z - P[o + 2]; return Math.sqrt(dx * dx + dy * dy + dz * dz) - P[o + 3] }
      case 1: {
        const pax = x - P[o], pay = y - P[o + 1], paz = z - P[o + 2], bax = P[o + 3], bay = P[o + 4], baz = P[o + 5], l2 = P[o + 6], rr = P[o + 7], a2 = P[o + 8], il2 = P[o + 9];
        const yy = pax * bax + pay * bay + paz * baz, zz = yy - l2, qx = pax * l2 - bax * yy, qy = pay * l2 - bay * yy, qz = paz * l2 - baz * yy, x2 = qx * qx + qy * qy + qz * qz, y2 = yy * yy * l2, z2 = zz * zz * l2;
        const k = Math.sign(rr) * rr * rr * x2;
        if (Math.sign(zz) * a2 * z2 > k) return Math.sqrt(x2 + z2) * il2 - P[o + 11];
        if (Math.sign(yy) * a2 * y2 < k) return Math.sqrt(x2 + y2) * il2 - P[o + 10];
        return (Math.sqrt(x2 * a2 * il2) + yy * rr) * il2 - P[o + 10];
      }
      case 2: {
        const dx = x - P[o], dy = y - P[o + 1], dz = z - P[o + 2];
        const lx = (P[o + 6] * dx + P[o + 7] * dy + P[o + 8] * dz) / P[o + 3], ly = (P[o + 9] * dx + P[o + 10] * dy + P[o + 11] * dz) / P[o + 4], lz = (P[o + 12] * dx + P[o + 13] * dy + P[o + 14] * dz) / P[o + 5];
        const k0 = Math.sqrt(lx * lx + ly * ly + lz * lz), k1 = Math.sqrt(lx * lx / (P[o + 3] * P[o + 3]) + ly * ly / (P[o + 4] * P[o + 4]) + lz * lz / (P[o + 5] * P[o + 5]));
        return k1 < 1e-9 ? -Math.min(P[o + 3], P[o + 4], P[o + 5]) : k0 * (k0 - 1) / k1;
      }
      case 3: {
        const dx = x - P[o], dy = y - P[o + 1], dz = z - P[o + 2], r = P[o + 6];
        const qx = Math.abs(P[o + 7] * dx + P[o + 8] * dy + P[o + 9] * dz) - P[o + 3] + r, qy = Math.abs(P[o + 10] * dx + P[o + 11] * dy + P[o + 12] * dz) - P[o + 4] + r, qz = Math.abs(P[o + 13] * dx + P[o + 14] * dy + P[o + 15] * dz) - P[o + 5] + r;
        const mx = Math.max(qx, 0), my = Math.max(qy, 0), mz = Math.max(qz, 0);
        return Math.sqrt(mx * mx + my * my + mz * mz) + Math.min(Math.max(qx, qy, qz), 0) - r;
      }
      case 5: {
      const pax = x - P[o], pay = y - P[o + 1], paz = z - P[o + 2], bax = P[o + 3], bay = P[o + 4], baz = P[o + 5], baba = P[o + 6], ra = P[o + 7], rb = P[o + 8], rba = rb - ra;
      const papa = pax * pax + pay * pay + paz * paz, paba = (pax * bax + pay * bay + paz * baz) / baba, xx = Math.sqrt(Math.max(0, papa - paba * paba * baba));
      const cax = Math.max(0, xx - (paba < .5 ? ra : rb)), cay = Math.abs(paba - .5) - .5, kk = rba * rba + baba, f = Math.min(1, Math.max(0, (rba * (xx - ra) + paba * baba) / kk));
      const cbx = xx - ra - f * rba, cby = paba - f, sg = (cbx < 0 && cay < 0) ? -1 : 1;
      return sg * Math.sqrt(Math.min(cax * cax + cay * cay * baba, cbx * cbx + cby * cby * baba)) - P[o + 9];
    }
    default: return (x - P[o]) * P[o + 3] + (y - P[o + 1]) * P[o + 4] + (z - P[o + 2]) * P[o + 5];
    }
  }
  function smin(a, b, k) { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * .25 }
  function smax(a, b, k) { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.max(a, b) + h * h * k * .25 }

  /* ---------- value noise (for cloth folds / skin lumps) ---------- */
  function hash3(x, y, z) { let h = (x * 374761393 + y * 668265263 + z * 1274126177) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296 }
  function vnoise(x, y, z) {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = x - xi, yf = y - yi, zf = z - zi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
    const l = (a, b, t) => a + (b - a) * t;
    return l(l(l(hash3(xi, yi, zi), hash3(xi + 1, yi, zi), u), l(hash3(xi, yi + 1, zi), hash3(xi + 1, yi + 1, zi), u), v),
      l(l(hash3(xi, yi, zi + 1), hash3(xi + 1, yi, zi + 1), u), l(hash3(xi, yi + 1, zi + 1), hash3(xi + 1, yi + 1, zi + 1), u), v), w) * 2 - 1;
  }
  SC.vnoise = vnoise;

  /* ---------- mesher ---------- */
  /* spec: { prims, h (cell size), offset (inflate, m), disp(x,y,z)->m, tauB, tauM, jig:[{bone,c,r,s}], ao:true, name } */
  /* a culled, cached distance field for a spec: F(x,y,z) -> signed distance (negative inside) */
  function field(spec) {
    const C = compile(spec.prims), h = spec.h || .011, off = spec.offset || 0, disp = spec.disp || null, dispA = spec.dispAmp || 0;
    const adds = [], others = []; for (let i = 0; i < C.n; i++) (C.OP[i] === 0 ? adds : others).push(i);
    let kmax = 0; for (let i = 0; i < C.n; i++) kmax = Math.max(kmax, C.K[i]);
    const tauB = spec.tauB || .012, tauM = spec.tauM || .006, attrMargin = Math.max(kmax, 6 * tauB, 8 * tauM) + off + dispA;
    /* bounds from additive primitives */
    const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
    for (const i of adds) for (let a = 0; a < 3; a++) { mn[a] = Math.min(mn[a], C.BS[i * 4 + a] - C.BS[i * 4 + 3]); mx[a] = Math.max(mx[a], C.BS[i * 4 + a] + C.BS[i * 4 + 3]) }
    const pad = off + dispA + kmax + 3 * h; for (let a = 0; a < 3; a++) { mn[a] -= pad; mx[a] += pad }
    const NX = Math.ceil((mx[0] - mn[0]) / h), NY = Math.ceil((mx[1] - mn[1]) / h), NZ = Math.ceil((mx[2] - mn[2]) / h), NX1 = NX + 1, NY1 = NY + 1;
    const ox = mn[0], oy = mn[1], oz = mn[2], SQ = Math.sqrt(3) / 2 * LIP;
    /* two-level culling: macro blocks (8 cells) cull from all primitives, micro blocks (4 cells) cull from their macro's list */
    const MB = BLK, mb = BLK / 2, BX = Math.ceil(NX / MB), BY = Math.ceil(NY / MB), BZ = Math.ceil(NZ / MB), bwM = MB * h, hbM = bwM * SQ;
    const mX = BX * 2, mY = BY * 2, mZ = BZ * 2, bwm = mb * h, hbm = bwm * SQ;
    const macro = new Array(BX * BY * BZ), micro = new Array(mX * mY * mZ);
    const tmpD = new Float64Array(C.n), ALL = Int32Array.from(adds), OTH = Int32Array.from(others);
    function cull(src, srcO, cx, cy, cz, hb) {
      let dmin = 1e9, kmin = 0; for (let j = 0; j < src.length; j++) { const i = src[j], d = pd(C, i, cx, cy, cz); tmpD[i] = d; if (d < dmin) { dmin = d; kmin = C.K[i] } }
      const keep = [], loose = []; for (let j = 0; j < src.length; j++) { const i = src[j], dd = tmpD[i] - 2 * hb - dmin; if (dd < C.K[i] + kmin + dispA) keep.push(i); if (dd < attrMargin) loose.push(i) }
      const ko = []; for (let j = 0; j < srcO.length; j++) { const i = srcO[j]; if (C.OP[i] === 2) { ko.push(i); continue } const d = pd(C, i, cx, cy, cz); if (d - hb < 2 * hb + C.K[i] + Math.max(0, -(dmin - off))) ko.push(i) }
      const L = { a: Int32Array.from(keep), o: Int32Array.from(ko), al: Int32Array.from(loose) }; L.dc = evalL(L, cx, cy, cz); return L;
    }
    function macroList(b) {
      let L = macro[b]; if (L) return L; const bz = (b / (BX * BY)) | 0, by = ((b - bz * BX * BY) / BX) | 0, bx = b - bz * BX * BY - by * BX;
      L = macro[b] = cull(ALL, OTH, ox + (bx + .5) * bwM, oy + (by + .5) * bwM, oz + (bz + .5) * bwM, hbM); L.near = Math.abs(L.dc) < hbM + kmax + dispA; return L;
    }
    function microList(b) {
      let L = micro[b]; if (L) return L; const bz = (b / (mX * mY)) | 0, by = ((b - bz * mX * mY) / mX) | 0, bx = b - bz * mX * mY - by * mX;
      const P = macroList((bx >> 1) + BX * ((by >> 1) + BY * (bz >> 1)));
      L = micro[b] = cull(P.al, P.o, ox + (bx + .5) * bwm, oy + (by + .5) * bwm, oz + (bz + .5) * bwm, hbm); L.near = Math.abs(L.dc) < hbm + kmax + dispA; return L;
    }
    function evalL(L, x, y, z) {
      const A = L.a; let d = 1e9;
      for (let j = 0; j < A.length; j++) { const i = A[j]; d = smin(d, pd(C, i, x, y, z), C.K[i]) }
      if (disp) d += disp(x, y, z); d -= off;
      const O = L.o; for (let j = 0; j < O.length; j++) { const i = O[j], e = pd(C, i, x, y, z); d = C.OP[i] === 1 ? smax(d, -e, C.K[i]) : smax(d, e, C.K[i]) }
      return d;
    }
    function blockIndexAt(x, y, z) {
      let bx = Math.floor((x - ox) / bwm), by = Math.floor((y - oy) / bwm), bz = Math.floor((z - oz) / bwm);
      bx = bx < 0 ? 0 : bx >= mX ? mX - 1 : bx; by = by < 0 ? 0 : by >= mY ? mY - 1 : by; bz = bz < 0 ? 0 : bz >= mZ ? mZ - 1 : bz; return bx + mX * (by + mY * bz);
    }
    const blockList = microList;
    const F = (x, y, z) => evalL(blockList(blockIndexAt(x, y, z)), x, y, z);
    return { C, h, off, disp, dispA, adds, others, kmax, tauB, tauM, NX, NY, NZ, NX1, NY1, ox, oy, oz, BX, BY, BZ, mX, mY, mZ, mb, macroList, microList, blockList, blockIndexAt, F, tmpD, evalL };
  }
  SC.field = spec => field(spec).F;
  SC.build = function (spec) {
    const now = () => (typeof performance !== 'undefined' ? performance : Date).now(), t0 = now();
    const FD = field(spec), { C, h, off, dispA, kmax, tauB, tauM, NX, NY, NZ, NX1, NY1, ox, oy, oz, BX, BY, BZ, mX, mY, mZ, mb, macroList, microList, blockList, blockIndexAt, F, tmpD } = FD;
    /* corner cache */
    const cache = new Float32Array(NX1 * NY1 * (NZ + 1)).fill(NaN);
    function cv(ix, iy, iz) { const id = ix + NX1 * (iy + NY1 * iz); let v = cache[id]; if (v !== v) { const x = ox + ix * h, y = oy + iy * h, z = oz + iz * h; v = F(x, y, z); if (v === 0) v = 1e-7; cache[id] = v } return v }
    /* cells -> vertices */
    const vmap = new Map(), VP = [];
    const E = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
    const cvals = new Float64Array(8);
    function cellVert(i, j, k) {
      const key = i + NX * (j + NY * k); let v = vmap.get(key); if (v !== undefined) return v;
      for (let c = 0; c < 8; c++) cvals[c] = cv(i + (c & 1), j + ((c >> 1) & 1), k + ((c >> 2) & 1));
      let sx = 0, sy = 0, sz = 0, n = 0;
      for (const e of E) {
        const a = cvals[e[0]], b = cvals[e[1]]; if ((a < 0) === (b < 0)) continue; const t = a / (a - b);
        const ax = e[0] & 1, ay = (e[0] >> 1) & 1, az = (e[0] >> 2) & 1, bx = e[1] & 1, by = (e[1] >> 1) & 1, bz = (e[1] >> 2) & 1;
        sx += ax + (bx - ax) * t; sy += ay + (by - ay) * t; sz += az + (bz - az) * t; n++
      }
      v = VP.length / 3; VP.push(ox + (i + sx / n) * h, oy + (j + sy / n) * h, oz + (k + sz / n) * h); vmap.set(key, v); return v;
    }
    /* sweep active blocks, emit quads for sign-changing edges */
    const IDX = [], qd = [0, 0, 0, 0];
    for (let b = 0; b < BX * BY * BZ; b++) {
      if (!macroList(b).near) continue;
      const bz0 = (b / (BX * BY)) | 0, by0 = ((b - bz0 * BX * BY) / BX) | 0, bx0 = b - bz0 * BX * BY - by0 * BX;
      for (let sb = 0; sb < 8; sb++) {
        const bx = bx0 * 2 + (sb & 1), by = by0 * 2 + ((sb >> 1) & 1), bz = bz0 * 2 + (sb >> 2);
        if (!microList(bx + mX * (by + mY * bz)).near) continue;
        for (let k = bz * mb; k < Math.min(NZ + 1, bz * mb + mb); k++) for (let j = by * mb; j < Math.min(NY + 1, by * mb + mb); j++) for (let i = bx * mb; i < Math.min(NX + 1, bx * mb + mb); i++) {
          const v0 = cv(i, j, k);
          for (let a = 0; a < 3; a++) {
            const i2 = i + (a === 0), j2 = j + (a === 1), k2 = k + (a === 2); if (i2 > NX || j2 > NY || k2 > NZ) continue;
            const v1 = cv(i2, j2, k2); if ((v0 < 0) === (v1 < 0)) continue;
            /* the 4 cells around this edge, ordered (u-1,w-1),(u,w-1),(u,w),(u-1,w) */
            const c = [i, j, k], u = (a + 1) % 3, w = (a + 2) % 3, lim = [NX, NY, NZ];
            if (c[u] < 1 || c[w] < 1 || c[u] >= lim[u] || c[w] >= lim[w]) continue;
            const cell = (du, dw) => { const q = [c[0], c[1], c[2]]; q[u] += du; q[w] += dw; return cellVert(q[0], q[1], q[2]) };
            qd[0] = cell(-1, -1); qd[1] = cell(0, -1); qd[2] = cell(0, 0); qd[3] = cell(-1, 0);
            if (!(v0 < 0)) { const t = qd[1]; qd[1] = qd[3]; qd[3] = t }
            const d02 = dist2(qd[0], qd[2]), d13 = dist2(qd[1], qd[3]);
            if (d02 < d13) IDX.push(qd[0], qd[1], qd[2], qd[0], qd[2], qd[3]); else IDX.push(qd[0], qd[1], qd[3], qd[1], qd[2], qd[3]);
          }
        }
      }
    }
    function dist2(a, b) { const x = VP[a * 3] - VP[b * 3], y = VP[a * 3 + 1] - VP[b * 3 + 1], z = VP[a * 3 + 2] - VP[b * 3 + 2]; return x * x + y * y + z * z }
    const nv = VP.length / 3, pos = new Float32Array(VP), nor = new Float32Array(nv * 3);
    /* project onto the surface + analytic normals */
    const e = h * .3, g = [0, 0, 0];
    function grad(x, y, z, d0) { g[0] = F(x + e, y, z) - d0; g[1] = F(x, y + e, z) - d0; g[2] = F(x, y, z + e) - d0; const l = Math.hypot(g[0], g[1], g[2]) || 1; g[0] /= l; g[1] /= l; g[2] /= l }
    const tP = now();
    for (let v = 0; v < nv; v++) {
      let x = pos[v * 3], y = pos[v * 3 + 1], z = pos[v * 3 + 2]; const x0 = x, y0 = y, z0 = z;
      let d = F(x, y, z); grad(x, y, z, d); x -= g[0] * d; y -= g[1] * d; z -= g[2] * d;
      const mvx = x - x0, mvy = y - y0, mvz = z - z0, ml = Math.hypot(mvx, mvy, mvz); if (ml > h) { x = x0 + mvx / ml * h; y = y0 + mvy / ml * h; z = z0 + mvz / ml * h }
      pos[v * 3] = x; pos[v * 3 + 1] = y; pos[v * 3 + 2] = z; d = F(x, y, z); grad(x, y, z, d); nor[v * 3] = g[0]; nor[v * 3 + 1] = g[1]; nor[v * 3 + 2] = g[2];
    }
    const tA = now();
    /* attributes: bones, materials, fur, AO */
    const nb = spec.bones || 64, skI = new Uint16Array(nv * 4), skW = new Float32Array(nv * 4), mat = new Float32Array(nv * 4), fur = new Float32Array(nv), ao = new Float32Array(nv);
    const acc = new Float64Array(nb), used = [], jig = spec.jig || [];
    const add = (bi, w) => { if (!acc[bi]) used.push(bi); acc[bi] += w };
    for (let v = 0; v < nv; v++) {
      const x = pos[v * 3], y = pos[v * 3 + 1], z = pos[v * 3 + 2], L = blockList(blockIndexAt(x, y, z)), A = L.al;
      let dmin = 1e9; for (let j = 0; j < A.length; j++) { const d = pd(C, A[j], x, y, z); tmpD[A[j]] = d; if (d < dmin) dmin = d }
      let m0 = 0, m1 = 0, m2 = 0, m3 = 0, ms = 0, fs = 0; used.length = 0;
      for (let j = 0; j < A.length; j++) {
        const i = A[j], pr = C.prims[i], dd = tmpD[i] - dmin;
        if (dd < 8 * tauM) { const wm = Math.exp(-dd / tauM); const mi = pr.mat; if (mi === 0) m0 += wm; else if (mi === 1) m1 += wm; else if (mi === 2) m2 += wm; else m3 += wm; ms += wm; fs += wm * pr.fur }
        if (dd < 6 * tauB && pr.bone >= 0) {
          let wb = Math.exp(-dd / tauB) * (pr.wb || 1);
          if (pr.bone2 >= 0 && C.T[i] === 1) {     // split along the cone axis between bone and bone2
            const o = i * STRIDE, t = ((x - C.P[o]) * C.P[o + 3] + (y - C.P[o + 1]) * C.P[o + 4] + (z - C.P[o + 2]) * C.P[o + 5]) * C.P[o + 9];
            let s = (t - pr.t0) / (pr.t1 - pr.t0); s = s < 0 ? 0 : s > 1 ? 1 : s; s = s * s * (3 - 2 * s);
            add(pr.bone, wb * (1 - s)); add(pr.bone2, wb * s);
          } else add(pr.bone, wb);
        }
      }
      mat[v * 4] = m0 / ms; mat[v * 4 + 1] = m1 / ms; mat[v * 4 + 2] = m2 / ms; mat[v * 4 + 3] = m3 / ms; fur[v] = fs / ms;
      /* jiggle (soft-body) bones: position falloff */
      let tw = 0; for (const b of used) tw += acc[b];
      for (const b of used) acc[b] /= tw;
      for (const J of jig) { const dx = (x - J.c[0]) / J.r[0], dy = (y - J.c[1]) / J.r[1], dz = (z - J.c[2]) / J.r[2], r = Math.sqrt(dx * dx + dy * dy + dz * dz); if (r >= 1) continue; let f = 1 - r; f = f * f * (3 - 2 * f) * J.s; if (J.only && !used.some(b => J.only.includes(b) && acc[b] > .3)) continue; for (const b of used) acc[b] *= 1 - f; if (!acc[J.bone]) { used.push(J.bone); acc[J.bone] = 0 } acc[J.bone] += f }
      used.sort((a, b) => acc[b] - acc[a]); let s4 = 0; for (let q = 0; q < 4 && q < used.length; q++) s4 += acc[used[q]];
      for (let q = 0; q < 4; q++) { if (q < used.length) { skI[v * 4 + q] = used[q]; skW[v * 4 + q] = acc[used[q]] / s4 } }
      for (const b of used) acc[b] = 0;
      /* SDF ambient occlusion */
      if (spec.ao !== false) {
        const nx = nor[v * 3], ny = nor[v * 3 + 1], nz = nor[v * 3 + 2], s = spec.aoScale || 1; let occ = 0, sca = 1;
        for (let q = 1; q <= 4; q++) { const hh = (.01 + .035 * q) * s; occ += (hh - F(x + nx * hh, y + ny * hh, z + nz * hh)) * sca; sca *= .7 }
        ao[v] = Math.max(.18, Math.min(1, 1 - (spec.aoK || 2.2) * occ / s));
      } else ao[v] = 1;
    }
    const t1 = now();
    return { stages: { mesh: tP - t0, project: tA - tP, attrs: t1 - tA }, pos, nor, idx: nv > 65535 ? new Uint32Array(IDX) : new Uint16Array(IDX), skI, skW, mat, fur, ao, nv, nt: IDX.length / 3, ms: t1 - t0, grid: [NX, NY, NZ], name: spec.name || '' };
  };

  /* sub-mesh: keep triangles whose 3 vertices pass keep(v) (used for fur shells); compacts the vertex arrays */
  SC.subset = function (m, keep) {
    const map = new Int32Array(m.nv).fill(-1), I = [], src = m.idx; let n = 0;
    for (let t = 0; t < src.length; t += 3) { const a = src[t], b = src[t + 1], c = src[t + 2]; if (!(keep(a) || keep(b) || keep(c))) continue; for (const v of [a, b, c]) { if (map[v] < 0) map[v] = n++; I.push(map[v]) } }
    const o = { nv: n, nt: I.length / 3, idx: n > 65535 ? new Uint32Array(I) : new Uint16Array(I) };
    const cp = (arr, w) => { const r = new arr.constructor(n * w); for (let v = 0; v < m.nv; v++) if (map[v] >= 0) for (let q = 0; q < w; q++) r[map[v] * w + q] = arr[v * w + q]; return r };
    o.pos = cp(m.pos, 3); o.nor = cp(m.nor, 3); o.skI = cp(m.skI, 4); o.skW = cp(m.skW, 4); o.mat = cp(m.mat, 4); o.fur = cp(m.fur, 1); o.ao = cp(m.ao, 1); return o;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = SC; else { root.AV = root.AV || {}; root.AV.sculpt = SC }
});
