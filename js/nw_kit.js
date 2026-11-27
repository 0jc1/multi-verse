/* APEVERSE 2 NEW WORLDS - nw_kit.js : small shared helpers for the new-world cities (agent 2).  No world logic, no globals besides AV.nwkit.
   - fit / rr: canvas text fitting + rounded rects for authored signs
   - makeAtlas(LIST, SG, W, H): packs [key, w, h, drawFn] signs into one canvas texture (SG.r[key] = uv rect, SG.over = keys that did not fit)
   - quadGeo(quads, R): one BufferGeometry of textured quads { k, x, y, z, w, h, ry } (ry = direction the face looks, 0 = +z)
   - rowWalk(...): walks a building row along an axis and hands each lot to a builder (shared row logic: special lots, widths, colliders)
   - interior(...): turns a lot into a walk-in room with a door gap (door-relative fitting coordinates) */
'use strict';
(function (AV) {
const NW = AV.nwkit = {};
NW.fit = (g, t, w, px, fam, y, x) => { let n = px; do { g.font = fam.replace('#', n); n -= 2 } while (g.measureText(t).width > w && n > 9); g.fillText(t, x, y) };
NW.rr = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath() };
NW.makeAtlas = function (LIST, SG, W, H) { if (SG.tex) return SG.tex; SG.r = SG.r || {}; const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); const sh = []; let top = 0;
  for (const [k, w, h, fn] of LIST.slice().sort((a, b) => b[2] - a[2] || b[1] - a[1])) { let s = sh.find(q => q.h >= h && q.x + w <= W); if (!s) { if (top + h > H) { (SG.over = SG.over || []).push(k); continue } s = { y: top, h, x: 0 }; sh.push(s); top += h + 4 } g.save(); g.translate(s.x, s.y); g.beginPath(); g.rect(0, 0, w, h); g.clip(); try { fn(g, w, h) } catch (e) { (SG.bad = SG.bad || []).push(k) } g.restore(); SG.r[k] = [s.x / W, 1 - (s.y + h) / H, w / W, h / H]; s.x += w + 4 }
  SG.used = top; const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; SG.tex = t; return t };
NW.quadGeo = function (qs, R) { const n = qs.length, pos = new Float32Array(n * 18), nor = new Float32Array(n * 18), uv = new Float32Array(n * 12); let o = 0;
  qs.forEach(q => { const r = R[q.k]; if (!r) return; const c = Math.cos(q.ry), s = Math.sin(q.ry), hw = q.w / 2, hh = q.h / 2, P = (a, b) => [q.x + a * c, q.y + b, q.z - a * s];
    const v = [[P(-hw, -hh), [r[0], r[1]]], [P(hw, -hh), [r[0] + r[2], r[1]]], [P(hw, hh), [r[0] + r[2], r[1] + r[3]]], [P(-hw, hh), [r[0], r[1] + r[3]]]];
    for (const i of [0, 1, 2, 0, 2, 3]) { pos.set(v[i][0], o * 3); nor.set([s, 0, c], o * 3); uv.set(v[i][1], o * 2); o++ } });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos.subarray(0, o * 3), 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor.subarray(0, o * 3), 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv.subarray(0, o * 2), 2)); g.computeBoundingSphere(); return g };
/* rowWalk: lots along axis ax ('z': fronts at x = front, 'x': fronts at z = front), facing +/- (face), from a0 to a1.
   SPECIAL = [[key, rowId, centre, width, hollowDepth?]]; SHOPS receives special lots.  lot(L) builds one lot and returns nothing.
   L = { fx, fz, yaw, w, a, ac, out, al, isSp, sp, c0 (collider), lsx (sign of the building's local +x along the row) } */
NW.rowWalk = function (o) { const { id, ax, front, a0, a1, face, depth, rng, SPECIAL, SHOPS, cols, lot } = o; const out = ax === 'z' ? [face, 0] : [0, face], al = ax === 'z' ? [0, 1] : [1, 0], yaw = ax === 'z' ? (face > 0 ? Math.PI / 2 : -Math.PI / 2) : (face > 0 ? 0 : Math.PI), lsx = Math.round(Math.cos(yaw) * al[0] - Math.sin(yaw) * al[1]);
  let a = a0, n = 0; while (a < a1 - 3) { let w = (o.wmin || 6) + rng() * ((o.wmax || 10) - (o.wmin || 6)); const sp = SPECIAL.find(s => s[1] === id && !SHOPS[s[0]] && s[2] - s[3] / 2 < a + w + 1 && s[2] + s[3] / 2 > a);
    if (sp) { const sa = sp[2] - sp[3] / 2; if (sa - a >= 3) w = sa - a > (o.wmax || 10) + 3 ? w : sa - a; else w = sp[3] } if (a + w > a1) w = a1 - a; if (w < 3) break; const isSp = !!(sp && w === sp[3]);
    const ac = a + w / 2, fx = ax === 'z' ? front : ac, fz = ax === 'z' ? ac : front;
    const c0 = ax === 'z' ? [Math.min(front, front - face * depth), Math.max(front, front - face * depth), a + .05, a + w - .05] : [a + .05, a + w - .05, Math.min(front, front - face * depth), Math.max(front, front - face * depth)];
    const skip = !isSp && !!o.gaps && o.gaps.some(g => a < g[1] && a + w > g[0]);
    if (!(isSp && sp[4]) && !skip) cols.push(c0);
    if (isSp) SHOPS[sp[0]] = { k: sp[0], x: fx + out[0] * .2, z: fz + out[1] * .2, yaw, w, face, ax, out, al, d: depth, hollow: sp[4] || 0, c: c0, lsx };
    lot({ fx, fz, yaw, w, a, ac, out, al, isSp, sp: isSp ? sp : null, c0, lsx, skip }); n++; a += w + .02 } return n };
/* chunked merge: parts ([geo, hex, matrix, flag]) or sign quads ({x, z, ...}) are bucketed by position into cell x cell tiles and merged per
   tile, so the renderer's frustum culling skips the tiles you can't see (one merged mesh for a whole city is always drawn in full).
   Pieces longer than a tile (viaduct decks, quay walls) go to their own "wide" bucket.  Returns the meshes. */
NW.chunked = function (items, cell, build, mat, grp, name, o) { o = o || {}; if (NW.noChunks) cell = 1e7;   /* debug/A-B: one mesh per layer */ const B = new Map(), key = (x, z) => Math.floor(x / cell) + ',' + Math.floor(z / cell);
  for (const it of items) { let x, z, wide = false; if (Array.isArray(it)) { const e = it[2].elements; x = e[12]; z = e[14]; const sx = Math.hypot(e[0], e[1], e[2]), sz = Math.hypot(e[8], e[9], e[10]); wide = Math.max(sx, sz) > cell * 1.5 } else { x = it.x; z = it.z }
    const k = (o.region ? o.region(x, z) + '|' : '') + (wide ? 'wide' : key(x, z)); let a = B.get(k); if (!a) B.set(k, a = []); a.push(it) }
  const out = []; for (const [k, arr] of B) { if (!arr.length) continue; const g = build(arr); if (!g || !g.attributes.position || !g.attributes.position.count) continue; g.computeBoundingSphere(); const m = new THREE.Mesh(g, mat); m.name = name + '_' + k; if (o.region) m.userData.region = k.split('|')[0]; if (o.shadow) m.castShadow = m.receiveShadow = true; if (o.order) m.renderOrder = o.order; grp.add(m); out.push(m) }
  return out };
/* interior: hollow special lot -> side/back walls + front wall with the door gap; returns { F(u, f), bb(u0,u1,f0,f1), door, doorIn, mid, ... }
   u = metres in from the front, f = door-relative position along the row (door at f = -(hw - 1.1)) */
NW.interior = function (s, cols, box, P, Gl, fitFn) { if (!s || !s.hollow) return null; const depth = s.hollow, f = s.out, a = s.al, PT = (u, v) => [s.x - f[0] * u + a[0] * v, s.z - f[1] * u + a[1] * v];
  const bbV = (u0, u1, v0, v1) => { const p = PT(u0, v0), q = PT(u1, v1); return [Math.min(p[0], q[0]), Math.max(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[1], q[1])] };
  const hw = s.w / 2, dv = s.lsx * (hw - 1.1);
  cols.push(bbV(.1, depth, -hw, -hw + .35), bbV(.1, depth, hw - .35, hw), bbV(depth - .35, depth + .3, -hw, hw), bbV(0, .35, -hw, dv - .7), bbV(0, .35, dv + .7, hw));
  if (depth + .3 < s.d) cols.push(bbV(depth + .3, s.d, -hw, hw));
  const F = (u, ff) => PT(u, -s.lsx * ff), bb = (u0, u1, f0, f1) => bbV(u0, u1, -s.lsx * f0, -s.lsx * f1);
  const it = { key: s.k, PT, F, bb, depth, w: s.w, hw, door: PT(-1, dv), doorIn: PT(1.2, dv), mid: PT(depth / 2, 0), dv };
  const fl = bbV(.2, depth, -hw + .3, hw - .3); box(P, it.floorCol || 0x8a7a68, fl[0], fl[1], .01, .05, fl[2], fl[3]); const lb = bbV(depth * .3, depth * .7, -hw + 1, hw - 1); box(Gl, 0xfff0d8, lb[0], lb[1], 4.1, 4.16, lb[2], lb[3]);
  it.inside = (x, z) => { const b = bbV(.5, depth, -hw + .3, hw - .3); return x > b[0] && x < b[1] && z > b[2] && z < b[3] };
  fitFn && fitFn(it); return it };
})(window.AV);
