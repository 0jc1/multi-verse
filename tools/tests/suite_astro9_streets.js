/* Cinematic V1 "Living Megacity": the connected Astro-9 street network (js/astro9_streets.js + js/astro9_blocks.js).
   Walks every new street, 8 complete loops, the raised court, the sunken Undergrid passage, the Skylift ramps + bridge, checks heights
   never jump more than a step, vehicle clearance on the roads, shops reachable, and shoots each neighbourhood.
   run_tests.ps1 -Suite tools/tests/suite_astro9_streets.js -StepTimeout 900 */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(150) } return false };
  const at = (x, z, yaw, pitch) => { const P = AV.P; P.x = x; P.z = z; P.y = AV.W.surface(x, z) || 0; P.vx = P.vz = P.vy = 0; if (yaw != null) P.yaw = yaw; P.pitch = pitch || 0 };
  /* walk a route in .5 m steps: every point walkable + free (margin m), never a climb of more than .6 m between steps */
  const bad = (pts, m) => { const out = [], W = AV.W; let py = null; for (let k = 1; k < pts.length; k++) { const [x0, z0] = pts[k - 1], [x1, z1] = pts[k], n = Math.ceil(Math.hypot(x1 - x0, z1 - z0) * 2); for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, z = z0 + (z1 - z0) * i / n, y = W.surface(x, z);
    if (y === null || !AV.isFree(W, x, z, m || .35)) out.push(x.toFixed(1) + ',' + z.toFixed(1)); else { if (py !== null && y - py > .6) out.push('climb@' + x.toFixed(1) + ',' + z.toFixed(1) + ':' + py.toFixed(1) + '>' + y.toFixed(1)); py = y } } } return [...new Set(out)] };
  const route = (c, name, pts, m) => { const b = bad(pts, m); c(name, !b.length, b.slice(0, 6).join(' ')) };
  /* real path finding (8-neighbour grid search, .5 m cells, no climbs over .6 m) between consecutive waypoints, for legs through open districts with decor */
  const reach = (a, b) => { const W = AV.W, s = .5, x0 = Math.min(a[0], b[0]) - 25, z0 = Math.min(a[1], b[1]) - 25, nx = Math.ceil((Math.abs(a[0] - b[0]) + 50) / s), nz = Math.ceil((Math.abs(a[1] - b[1]) + 50) / s);
    const id = (i, j) => j * nx + i, seen = new Uint8Array(nx * nz), Y = new Float32Array(nx * nz), ok = (i, j) => { const x = x0 + i * s, z = z0 + j * s, y = W.surface(x, z); if (y === null || !AV.isFree(W, x, z, .35)) return null; return y };
    const si = Math.round((a[0] - x0) / s), sj = Math.round((a[1] - z0) / s), ti = Math.round((b[0] - x0) / s), tj = Math.round((b[1] - z0) / s); const y0 = ok(si, sj); if (y0 === null) return false; const Q = [si, sj]; seen[id(si, sj)] = 1; Y[id(si, sj)] = y0;
    for (let h = 0; h < Q.length; h += 2) { const i = Q[h], j = Q[h + 1]; if (Math.abs(i - ti) <= 1 && Math.abs(j - tj) <= 1) return true; for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) { const u = i + di, v = j + dj; if (u < 0 || v < 0 || u >= nx || v >= nz || seen[id(u, v)]) continue; const y = ok(u, v); seen[id(u, v)] = 1; if (y === null || y - Y[id(i, j)] > .6) continue; Y[id(u, v)] = y; Q.push(u, v) } } return false };
  const path = (c, name, pts) => { const miss = []; for (let k = 1; k < pts.length; k++) if (!reach(pts[k - 1], pts[k])) miss.push(pts[k - 1] + ' > ' + pts[k]); c(name, !miss.length, miss.join(' | ')) };
  step('boot', async c => { $('gq').value = 'Medium'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); await sleep(1500); AV.save = () => { };
    AV.travel('astro9'); c('Astro-9', await until(() => AV.W && AV.W.id === 'astro9' && $('fade').style.opacity === '0', 150000)); c('no world error', !$('err').textContent, $('err').textContent) });
  step('every new street walkable end to end', async c => { const S = AV.astro9streets; c('network built', !!S && S.fx && S.fx.streets === 19 /* 17 + Nebula Market Street + Dockside Loop (2.1) */, JSON.stringify(S && S.fx));
    for (const s of S.ST) route(c, 'street ' + s.id + ' (' + s.n[0] + ')', s.p) });
  step('complete loops (leave by one street, come back by another)', async c => {
    route(c, 'loop A: Neon > Kepler > Ring Lane > Coil St > Neon', [[150, 103.5], [100, 103.5], [88, 103.5], [88, 104], [90, 130], [96, 160], [98.7, 168], [120, 166], [142, 162], [138, 148], [146, 134], [156, 120], [156, 106], [156, 103.5], [150, 103.5]]);
    route(c, 'loop B: Kepler > Gutter Lane > Undergrid (sunken) > Ring Lane > Kepler', [[104, 184], [99.5, 186], [90, 188], [76, 191], [61, 195], [60, 193], [60, 184], [60, 169], [88, 168], [98.7, 168], [104, 184]]);
    route(c, 'loop C: Kepler > Temple path > Undergrid > Ring arch > Art Avenue > Temple path', [[108, 201], [64, 201], [64, 198], [60, 193], [60, 169], [50, 172], [14, 168], [3, 168], [0, 168], [0, 201], [108, 201]]);
    path(c, 'loop D: Ring Lane > Biotech > Neon > Sporeline > Biotech > Greenway > Temple', [[153, 158], [160, 150], [172, 140], [180, 130], [180, 113], [180, 103.5], [207, 103.5], [207, 105.5], [206, 118], [199, 129], [200, 150], [196, 170], [190, 177], [178, 186], [164, 192], [155, 205]]);
    route(c, 'loop E: Kepler > Terrace Steps > raised court > Coil > Ring > Kepler', [[92, 140], [96.5, 140], [110.5, 140], [119, 140], [127.5, 140], [140, 140], [143, 140], [146, 134], [143, 140], [138, 148], [142, 162], [120, 166], [98.7, 168], [96, 160], [92, 140]]);
    path(c, 'loop F: West street > Hangar Road > Terrace St > Alien Homes > West street', [[-120, 95], [-120, 105.5], [-127, 140], [-126, 164], [-140, 161], [-152, 158], [-154, 152], [-170, 150], [-180, 130], [-180, 104], [-180, 95], [-120, 95]]);
    route(c, 'loop G: Terrace St > Cinema Passage > Art Avenue > Hangar path > Hangar Road', [[-122, 165], [-80, 170], [-40, 175], [-41, 175.5], [-6, 176.5], [0, 176.5], [0, 201], [-60, 201], [-118, 201], [-122, 198], [-126, 170], [-122, 165]]);
    path(c, 'loop H: Bazaar > Souk Lane > boulevard > plaza > Lantern Lane > Bazaar', [[-75, 94], [-75, 72], [-75, 60], [-40, 56], [-5, 54], [0, 54], [0, 72], [0, 82], [-21, 92], [-39, 92], [-39, 72], [-39, 56], [-40, 56]]);
    route(c, 'Fuse Court: Ring Lane > court > Gutter Lane', [[83, 169], [83, 175], [83, 181], [83, 187], [83, 189]]) });
  step('Skylift ramps + bridge to the Sky Market', async c => { route(c, 'walk all four ramps to y 30 and across the bridge', [[182, 92], [182, 85], [182, 66], [181.7, 64.5], [181.7, 43.5], [185.1, 43.5], [185.1, 64.5], [188.5, 64.5], [188.5, 43.5], [191.9, 43.5], [191.9, 62.5], [200, 62.5], [212, 62.5], [222, 62]]);
    c('top of the ramps is at the Sky Market height', Math.abs(AV.W.surface(191.9, 64) - 30) < .01 && Math.abs(AV.W.surface(222, 62) - 30) < .01, AV.W.surface(191.9, 64) + ' / ' + AV.W.surface(222, 62));
    c('no shortcut between ramp strips (rails)', !AV.isFree(AV.W, 183.4, 55, .2) && !AV.isFree(AV.W, 186.8, 50, .2), '');
    c('sunken passage is 3 m down', Math.abs(AV.W.surface(60, 184) + 3) < .01, AV.W.surface(60, 184)) });
  step('vehicles fit the roads', async c => { const S = AV.astro9streets; for (const id of ['kepler', 'ring', 'coil', 'hangar', 'terrace']) { const p = S.ST.find(s => s.id === id).p.map(q => q.slice()), a = p[0], b = p[1], l = Math.hypot(b[0] - a[0], b[1] - a[1]); a[0] += (b[0] - a[0]) / l * 3; a[1] += (b[1] - a[1]) / l * 3; const e = p[p.length - 1], f = p[p.length - 2], l2 = Math.hypot(f[0] - e[0], f[1] - e[1]); e[0] += (f[0] - e[0]) / l2 * 3; e[1] += (f[1] - e[1]) / l2 * 3; route(c, 'hover-bike clearance on ' + id, p, .8) } });
  step('shops along the new streets', async c => { const B = AV.astro9blocks; if (!B || !B.shops) { c('blocks module present', false, 'no shops yet'); return }
    for (const s of B.shops) { route(c, 'walk into ' + s.name + ' and reach the counter', s.walk); c(s.name + ': interaction at the counter', AV.W.T.some(t => Math.hypot(t.x - s.tx, t.z - s.tz) < .5)) }
    c('buildings placed', B.fx && B.fx.buildings > 60, JSON.stringify(B.fx)) });
  step('old features intact', async c => { const W = AV.W, lab = l => typeof l === 'function' ? l() : String(l), has = s => W.T.some(t => lab(t.label).includes(s));
    for (const s of ['Comet ramen', 'Subterra', 'Skylift', 'Prism Gallery', 'Cinema 9', 'Astro Inn']) c('interaction still there: ' + s, has(s));
    const N = AV.astro9neon; c('Neon Boulevard still has its 4 enterable shops', N && N.named && N.named.length === 4, N && N.named);
    c('no JS errors', !$('err').textContent, $('err').textContent) });
  step('city map: streets, districts, landmarks', async c => { const W = AV.W; c('street names on the map', (W.mapStreets || []).length >= 12, (W.mapStreets || []).map(s => s.name).join(', '));
    const dn = (W.mapDistricts || []).map(d => d.name); for (const n of ['The Undergrid', 'Residential Terraces', 'Biotech Quarter', 'Kepler Street', 'Sky District · Skylift', 'Hangar Road', 'Kepler Arcology']) c('district on the map: ' + n, dn.includes(n));
    at(110, 150, Math.PI); await sleep(500); AV.minimap.atlas(); await sleep(2500); const V = AV.minimap._view; V.cx = 60; V.cz = 140; V.sc = 1.6; AV.minimap.zoomFull(1); await sleep(1500); c('full map open', AV.minimap.atlasOpen()) }, { shot: 'net_map' });
  step('close map', async c => { if (AV.minimap.atlasOpen()) AV.minimap.closeAtlas(); await sleep(500); c('closed', !AV.minimap.atlasOpen()) });
  const shot = (name, file, x, z, yaw, pitch) => step(name, async c => { at(x, z, yaw, pitch); await sleep(5000); c('render', true, JSON.stringify(AV.R.info.render)) }, { shot: file });
  shot('Kepler Street from the Food Ring', 'net_kepler', 88, 106, Math.PI, .02);
  shot('Kepler x Ring Lane junction', 'net_kepler_ring', 95, 150, Math.PI, .05);
  shot('Undergrid Row going down', 'net_undergrid', 60, 170, Math.PI, .15);
  shot('sunken Undergrid passage', 'net_undergrid_sunk', 60, 181, Math.PI, .05);
  shot('Fuse Court', 'net_fuse', 83, 176, Math.PI, .08);
  shot('Terrace Steps to the raised court', 'net_steps', 97, 140, -Math.PI / 2, .05);
  shot('Coil Street', 'net_coil', 156, 108, Math.PI, .05);
  shot('Greenway', 'net_greenway', 189, 178, Math.PI * .75, .05);
  shot('Sporeline Passage', 'net_spore', 207, 106, Math.PI, .05);
  shot('Souk Lane', 'net_souk', -75, 70, 0, .05);
  shot('Terrace Street (west)', 'net_terrace', -124, 165, Math.PI / 2 + .1, .05);
  shot('Hangar Road', 'net_hangar', -121, 108, Math.PI, .05);
  shot('Skylift ramps from the bottom', 'net_skylift', 182, 80, 0, .45);
  shot('view from the Skybridge', 'net_skybridge', 206, 62.5, Math.PI * .75, -.25);
  let active = [];
  return { names(mobile) { active = steps.filter(s => !!s.mobile === !!mobile || s.name === 'boot'); return active.map(s => s.name) },
    async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
