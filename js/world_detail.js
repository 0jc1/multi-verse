/* APEVERSE - world_detail.js : Polish pass, a shared ENVIRONMENT DETAIL layer for the existing worlds (added on world enter, after the
   world's own build, so no world file changes). Per world it samples the walkable ground and adds:
     FLORA       flower / fern / bush / grass clusters on open ground away from streets and interaction spots
     CLUTTER     things against walls: potted plants, stacked plastic chairs, tiny Vietnamese stools + tables, parked motorbikes, crates
     WIRES       Thai / Vietnamese street poles with sagging cable bundles (one LineSegments mesh)
     SHRINES     Thai spirit houses on pedestals with offerings
     STRINGS     lantern strings / prayer flags across lanes near the busy places
     PEOPLE      small groups of locals and visitors that fit the place (backpackers, vendors in aprons, monks, temple visitors,
                 café workers, buskers, elders) talking or sitting near the named places
   Everything is instanced or merged, distance-culled through AV.kit, and capped by graphics quality. */
'use strict';
(function (AV) {
const K = AV.kit, CY = AV.city; if (!K) return;
const CFG = {
  chiang_mai: { flora: ['flower', 'bush', 'fern'], cols: [0xff6ad5, 0xffd84a, 0xff8a3a], clutter: ['pot', 'chairs', 'moto', 'crate'], wires: 1, shrines: 6, strings: 'lantern', people: ['backpacker', 'tourist', 'apron', 'monk', 'woman', 'man', 'student'] },
  pai: { flora: ['flower', 'fern', 'bush', 'grass'], cols: [0xff6ad5, 0xffd84a, 0xffffff], clutter: ['pot', 'chairs', 'moto'], wires: 1, shrines: 3, strings: 'flags', people: ['backpacker', 'backpacker', 'artist', 'busker', 'tourist', 'apron', 'woman'] },
  da_nang: { flora: ['flower', 'bush', 'grass'], cols: [0xff4a6a, 0xffd84a, 0xffffff], clutter: ['stools', 'pot', 'moto', 'moto'], wires: 1, strings: 'lantern', people: ['nonla', 'vendor', 'apron', 'beach', 'tourist', 'man', 'woman'] },
  ape_town: { flora: ['flower', 'fern', 'bush'], cols: [0xff6ad5, 0x7ff0ff, 0xffd84a], clutter: ['pot', 'crate'], strings: 'lantern', people: ['artist', 'busker', 'tourist', 'woman', 'man', 'student'] },
  jungle_dub: { flora: ['fern', 'bush', 'flower'], cols: [0xff6ad5, 0xffd84a, 0xff8a3a], clutter: ['pot', 'crate'], strings: 'flags', people: ['busker', 'backpacker', 'man', 'woman'] },
  koh_samui_jurassic: { flora: ['fern', 'bush', 'grass'], cols: [0xff6a3a, 0xffd84a, 0xffffff], clutter: ['crate'], people: ['backpacker', 'tourist', 'beach'] },
  vienna: { flora: ['flower', 'bush'], cols: [0xe83a4a, 0xffffff, 0xc86ae8], clutter: ['pot'], people: ['elder', 'shopper', 'student', 'tourist'] }
};
const D = AV.detail = { CFG, stats: {} };
const segD = (x, z, r) => { const dx = r[2] - r[0], dz = r[3] - r[1], l2 = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((x - r[0]) * dx + (z - r[1]) * dz) / l2)); return Math.hypot(x - r[0] - dx * t, z - r[1] - dz * t) };
let GEO = null;
const geos = () => GEO || (GEO = (() => { const B = K.BG, M = K.M, cyl = B.cylL || B.cyl;
  return {
    pot: K.merge([[cyl, 0xb8643a, M(0, .25, 0, .32, .5, .32)], [cyl, 0x8a4a2a, M(0, .5, 0, .36, .06, .36)], [B.ico0 || B.ico, 0x3a8a3a, M(0, .85, 0, .45, .5, .45), .1], [B.ico0 || B.ico, 0x4a9a3a, M(.15, 1.05, .1, .3, .35, .3), .1]]),
    chairs: K.merge([0, 1, 2, 3, 4].map(k => [B.box, 0xd83a3a, M(0, .45 + k * .09, 0, .45, .05, .45)]).concat([[B.box, 0xd83a3a, M(0, .75, -.2, .45, .55, .05)], [B.box, 0xb82a2a, M(-.2, .22, -.2, .04, .44, .04)], [B.box, 0xb82a2a, M(.2, .22, .2, .04, .44, .04)], [B.box, 0xb82a2a, M(-.2, .22, .2, .04, .44, .04)], [B.box, 0xb82a2a, M(.2, .22, -.2, .04, .44, .04)]])),
    stools: K.merge([[B.box, 0x2a6ad8, M(-.5, .4, 0, .7, .04, .7)], [B.box, 0x2a6ad8, M(-.5, .2, 0, .6, .4, .6)], [B.box, 0xd83a3a, M(.3, .22, .4, .3, .02, .3)], [B.box, 0xd83a3a, M(.3, .11, .4, .26, .22, .26)], [B.box, 0x2a6ad8, M(.3, .22, -.4, .3, .02, .3)], [B.box, 0x2a6ad8, M(.3, .11, -.4, .26, .22, .26)], [B.box, 0xf0f0f0, M(-.5, .43, 0, .1, .06, .1)]]),
    moto: K.merge([[B.box, 0xe8e4da, M(0, .55, -.15, .32, .35, .9)], [B.box, 0xe8e4da, M(0, .72, .5, .3, .5, .12, -.3, 0, 0)], [B.box, 0x1a1a1a, M(0, .8, -.25, .28, .08, .6)], [cyl, 0x141414, M(0, .27, .62, .27, .1, .27, 0, 0, Math.PI / 2)], [cyl, 0x141414, M(0, .27, -.6, .27, .1, .27, 0, 0, Math.PI / 2)], [cyl, 0x8a8a8a, M(0, 1.02, .5, .02, .6, .02, 0, 0, Math.PI / 2)]]),
    crate: K.merge([[B.box, 0x8a6a3a, M(0, .25, 0, .6, .5, .45)], [B.box, 0x6a4a2a, M(0, .52, 0, .62, .04, .47)], [B.box, 0x7a5a32, M(.05, .78, .02, .5, .5, .4, 0, .3, 0)]]),
    pole: K.merge([[cyl, 0x8a8a84, M(0, 4, 0, .14, 8, .14)], [B.box, 0x6a6a64, M(0, 7.4, 0, 1.6, .1, .1)], [B.box, 0x6a6a64, M(0, 6.6, 0, 1.2, .08, .08)], [cyl, 0x5a5a58, M(.4, 5.8, 0, .25, .7, .25)]]),
    shrine: K.merge([[B.box, 0xe8e0d0, M(0, .7, 0, .25, 1.4, .25)], [B.box, 0xd8a83a, M(0, 1.45, 0, .8, .1, .8)], [B.box, 0xc83a2a, M(0, 1.8, 0, .55, .6, .5)], [B.cone || B.box, 0xd8a83a, M(0, 2.35, 0, .55, .55, .55)], [B.box, 0xffd84a, M(0, 1.55, .35, .5, .06, .1), .6], [B.sph, 0xff8ad8, M(-.2, 1.56, .3, .06, .06, .06), .4], [B.sph, 0xffd84a, M(.2, 1.56, .3, .06, .06, .06), .4], [cyl, 0x2a2a2a, M(0, 1.55, .25, .02, .2, .02)]])
  } })());
D.apply = function (W) {
  const c = CFG[W.id]; if (!c || !W.ctx || W.__detail) return; W.__detail = true;
  const ctx = W.ctx, q = ctx.q || 0, rng = AV.rng(9173 + W.id.length * 77), G = geos(), roads = W.mapRoads || [];
  /* domain: around the places + streets */
  let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; const grow = (x, z) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z) };
  (W.places || []).forEach(p => grow(p.x, p.z)); roads.forEach(r => { grow(r[0], r[1]); grow(r[2], r[3]) }); if (x0 > x1) return; x0 -= 40; x1 += 40; z0 -= 40; z1 += 40;
  const ar = W.arrivals && (W.arrivals.default || {}), Ts = W.T.slice(), priv = (x, z) => !!(W.noStrangersAt && W.noStrangersAt(x, z));
  const roadD = (x, z) => { let d = 1e9; for (const r of roads) d = Math.min(d, segD(x, z, r) - (r[4] || 6) / 2); return d };
  const nearT = (x, z, m) => Ts.some(t => Math.hypot(t.x - x, t.z - z) < (t.r || 2) + m);
  const flora = [], clut = {}, people = [], tries = [2500, 4500, 7000][q], capF = [140, 260, 320][q], capC = [50, 110, 180][q];
  for (let i = 0; i < tries && (flora.length < capF || Object.values(clut).reduce((a, b) => a + b.length, 0) < capC); i++) {
    const x = x0 + rng() * (x1 - x0), z = z0 + rng() * (z1 - z0), y = W.surface(x, z); if (y === null || y === undefined || Math.abs(y) > 40 || priv(x, z)) continue;
    if (ar && Math.hypot(x - ar.x, z - ar.z) < 7 || nearT(x, z, 1.2) || (W.places || []).some(p => Math.hypot(p.x - x, p.z - z) < 3) || !AV.isFree(W, x, z, .5)) continue;   /* never in front of a named entrance */ const rd = roadD(x, z);
    if (!AV.isFree(W, x, z, 1.7) && rd > .8) { const k = c.clutter[(rng() * c.clutter.length) | 0], n = Object.values(clut).reduce((a, b) => a + b.length, 0); if (n < capC) { (clut[k] = clut[k] || []).push({ x, y, z, s: .9 + rng() * .25, ry: rng() * Math.PI * 2, tint: k === 'moto' ? .5 + rng() * .5 : null }); ctx.circles.push([x, z, k === 'moto' ? .5 : .4]); W.circles = ctx.circles } }
    else if (rd > 2.5 && AV.isFree(W, x, z, 3) && flora.length < capF) flora.push({ x, y, z, s: .7 + rng() * .7, k: c.flora[(rng() * c.flora.length) | 0], col: c.cols[(rng() * c.cols.length) | 0] }) }
  /* flora: one instanced set per species + colour */
  const byK = {}; flora.forEach(f => { const key = f.k + (f.k === 'flower' ? f.col : ''); (byK[key] = byK[key] || { k: f.k, col: f.col, it: [] }).it.push({ x: f.x, y: f.y, z: f.z, s: f.s }) });
  const far = [120, 180, 260][q];
  for (const key in byK) { const b = byK[key], S = K.species, geo = b.k === 'flower' ? S.flower(b.col, 0xffe040) : b.k === 'fern' ? S.fern(0x3aa04a) : b.k === 'grass' ? S.grass(0x6a9a3a) : S.bush(0x3a8a3a, b.col); K.scatter(ctx, geo, K.floraMat(b.k === 'bush' ? .03 : .05, { double: b.k !== 'bush' }), b.it, { far, cell: 80, shadow: false }) }
  for (const k in clut) K.scatter(ctx, G[k].clone(), K.floraMat(k === 'pot' ? .02 : 0), clut[k], { far: far * .9, cell: 80, shadow: false });
  /* wires: poles along the longer streets, three sagging cables between consecutive poles */
  let poles = 0;
  if (c.wires) { const pl = [], pts = []; roads.forEach((r, ri) => { const l = Math.hypot(r[2] - r[0], r[3] - r[1]); if (l < 40) return; const ux = (r[2] - r[0]) / l, uz = (r[3] - r[1]) / l, side = ri % 2 ? 1 : -1, off = (r[4] || 6) / 2 + .9; let prev = null;
      for (let s = 10; s < l - 6; s += 30) { const x = r[0] + ux * s - uz * side * off, z = r[1] + uz * s + ux * side * off, y = W.surface(x, z); if (y === null || !AV.isFree(W, x, z, .4) || nearT(x, z, 1)) { prev = null; continue } pl.push({ x, y, z, s: 1, ry: Math.atan2(ux, uz) }); ctx.circles.push([x, z, .22]);
        if (prev) for (let k = 0; k < 4; k++) { const h = 6.5 + k * .3, o = (k - 1.5) * .4; for (let j = 0; j < 8; j++) { const a = j / 8, b2 = (j + 1) / 8, sag = t => Math.sin(t * Math.PI) * (.9 + k * .15); pts.push(prev.x + (x - prev.x) * a - uz * o, prev.y + (y - prev.y) * a + h - sag(a), prev.z + (z - prev.z) * a + ux * o, prev.x + (x - prev.x) * b2 - uz * o, prev.y + (y - prev.y) * b2 + h - sag(b2), prev.z + (z - prev.z) * b2 + ux * o) } }
        prev = { x, y, z } } });
    if (pl.length) { K.scatter(ctx, G.pole.clone(), K.floraMat(0), pl, { far: far * 1.4, cell: 120, shadow: false }); poles = pl.length }
    if (pts.length) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); const m = new THREE.LineBasicMaterial({ color: 0x1a1a1a }); m.userData.lin = 1; ctx.group.add(new THREE.LineSegments(g, m)) } }
  /* Thai spirit houses near the named places */
  let shrines = 0; if (c.shrines) { const sp = []; for (const p of (W.places || [])) { if (sp.length >= c.shrines) break; for (let k = 0; k < 10; k++) { const a = rng() * Math.PI * 2, x = p.x + Math.cos(a) * (5 + rng() * 6), z = p.z + Math.sin(a) * (5 + rng() * 6), y = W.surface(x, z); if (y === null || priv(x, z) || !AV.isFree(W, x, z, .9) || nearT(x, z, 1.5) || roadD(x, z) < 1) continue; sp.push({ x, y, z, s: 1, ry: Math.atan2(p.x - x, p.z - z) }); ctx.circles.push([x, z, .5]); break } }
    if (sp.length) { K.scatter(ctx, G.shrine.clone(), K.floraMat(0, { rough: .4 }), sp, { far, cell: 120, shadow: false }); shrines = sp.length;
      sp.forEach(s => W.T.push({ x: s.x, z: s.z, r: 1.8, label: () => AV.tr('🙏 Spirit house: leave a small offering', '🙏 Casa de los espíritus: dejar una ofrenda'), fn: () => { AV.toast(AV.tr('You leave a flower and a little red drink. The spirits of this place are content.', 'Dejas una flor y una bebida roja. Los espíritus del lugar están contentos.')); AV.vitals && AV.vitals.add(0, 2) } })) } }
  /* lantern strings / prayer flags across the lanes near busy places */
  let strings = 0; if (c.strings && K.lanterns) { const lines = []; (W.places || []).slice(0, 14).forEach(p => { let best = null; for (const r of roads) { const d = segD(p.x, p.z, r); if (d < 30 && (!best || d < best.d)) best = { r, d } } if (!best) return; const r = best.r, l = Math.hypot(r[2] - r[0], r[3] - r[1]) || 1, ux = (r[2] - r[0]) / l, uz = (r[3] - r[1]) / l, w = (r[4] || 6) / 2 + .6;
      const t = Math.max(0, Math.min(l, (p.x - r[0]) * ux + (p.z - r[1]) * uz + (t0 => t0 + 9 <= l ? 9 : -9)((p.x - r[0]) * ux + (p.z - r[1]) * uz))), cx = r[0] + ux * t, cz = r[1] + uz * t, a = [cx - uz * w, cz + ux * w], b = [cx + uz * w, cz - ux * w], ya = W.surface(a[0], a[1]), yb = W.surface(b[0], b[1]); if (ya === null && yb === null) return;
      lines.push([[a[0], (ya || 0) + 5, a[1]], [b[0], (yb || 0) + 5, b[1]]]) });
    lines.forEach(pts => { try { K.lanterns(ctx, pts, c.strings === 'flags' ? { cols: [0x2a6ad8, 0xffffff, 0xd83a3a, 0x3aa04a, 0xffd84a], per: 10, sag: .6 } : { per: 8, sag: .7 }) } catch (e) { } }); strings = lines.length }
  /* people: small groups near the places, in local outfits */
  if (CY && CY.crowd) { const VAR = (AV.chars && AV.chars.walkerVar) || {}, ok = v => !!VAR[v] || ['man', 'woman', 'tourist', 'dancer', 'drummer', 'monk'].includes(v), cr = CY.crowd(ctx);
    (W.places || []).slice(0, [8, 14, 20][q]).forEach((p, i) => { const a = rng() * Math.PI * 2, R = 4 + rng() * 3, gx = p.x + Math.cos(a) * R, gz = p.z + Math.sin(a) * R, gy = W.surface(gx, gz); if (gy === null || priv(gx, gz) || !AV.isFree(W, gx, gz, 1.4) || nearT(gx, gz, .6)) return;
      const n = 2 + (i % 2); for (let k = 0; k < n; k++) { const b = k / n * Math.PI * 2, x = gx + Math.cos(b) * .7, z = gz + Math.sin(b) * .7, v = c.people[(i * 3 + k) % c.people.length]; people.push(1); cr.add({ v: ok(v) ? v : 'man', x, z, y: gy, yaw: Math.atan2(gx - x, gz - z), mode: 'talk' }) } });
    if (people.length) try { cr.build() } catch (e) { console.warn('detail crowd', e) } }
  AV.lin && AV.lin(ctx.group);
  D.stats[W.id] = { flora: flora.length, clutter: Object.values(clut).reduce((a, b) => a + b.length, 0), poles, shrines, strings, people: people.length };
};
const prevE = AV.onWorldEnter; AV.onWorldEnter = function (W) { if (prevE) prevE(W); try { D.apply(W) } catch (e) { console.warn('world detail failed', e) } };
})(window.AV);
