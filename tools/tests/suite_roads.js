/* APEVERSE 2.1: routing fixes.  Madrid: the Pinar barrio street is joined to the grid by real connector streets (road_links.js),
   the taxi from the barrio stand now drives off on the street (no "waits on the main street"), AI traffic knows the new junctions,
   and when YOU drive a car the GPS route follows streets (not footpaths) while walking keeps the walkable route.
   Astro-9: after the background warm-up every sampled GPS route is fast.  run_tests.ps1 -Suite tools/tests/suite_roads.js -Gpu */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const go = async id => { AV.S.time = 12 * 60; AV.travel(id); const ok = await until(() => AV.W && AV.W.id === id && settled(), 240000); await sleep(2500); return ok };
  const segD = (px, pz, r) => { const dx = r[2] - r[0], dz = r[3] - r[1], l2 = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((px - r[0]) * dx + (pz - r[1]) * dz) / l2)); return Math.hypot(px - r[0] - dx * t, pz - r[1] - dz * t) };
  const onRoad = (W, pts) => { let n = 0; for (const p of pts) if ((W.mapRoads || []).some(r => r[4] >= 7 && segD(p[0], p[1], r) < r[4] / 2 + 1.5)) n++; return pts.length ? n / pts.length : 0 };
  step('boot', async c => { $('gq').value = 'Medium'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); await sleep(1500); AV.save = () => { }; AV.S.money = 9000 });
  step('Madrid: Pinar connector streets built', async c => { c('loads', await go('madrid')); const s = AV.roadLinks.stats.madrid; c('Pinar W + E built', s && s.built.includes('pinar_w') && s.built.includes('pinar_e'), JSON.stringify(s));
    const net = AV.rides.net(AV.W); c('fewer separate street pieces', net.pieces <= 5, net.pieces + ' pieces');
    const T = AV.traffic; c('traffic junction light at the new link (x -140, z 0)', T.net && T.net.nodes.some(n => n.light && Math.hypot(n.x + 140, n.z) < 2) && T.net.nodes.some(n => Math.hypot(n.x + 92, n.z) < 2), T.stats && JSON.stringify({ nodes: T.stats.nodes, lights: T.stats.lights }));
    const P = AV.P; P.x = -120; P.z = 9; P.y = AV.W.surface(P.x, P.z) || 0; P.yaw = Math.PI * .5 + .25; P.pitch = -.12; await sleep(1500) }, { shot: 'roads_pinar_link' });
  step('Madrid: barrio taxi drives off on the street', async c => { const W = AV.W, P = AV.P, T = W.T.find(t => t.kind === 'taxi' && Math.hypot(t.x, t.z) < 60); c('barrio stand', !!T); if (!T) return; P.x = T.x + 1; P.z = T.z + 1;
    const d = AV.transit.dests(W, P.x, P.z).find(r => r.d > 250 && r.d < 700); const plan = AV.rides.plan(W, { x: P.x, z: P.z }, { x: d.x, z: d.z });
    c('road route, picked up at the kerb (no walk to the main street)', plan.how === 'road' && !(plan.waits > 12), JSON.stringify({ how: plan.how, waits: plan.waits, roadIn: plan.roadIn, len: Math.round(plan.len) }));
    c('route on streets', onRoad(W, plan.pts) > .85, (onRoad(W, plan.pts) * 100).toFixed(0) + '% of points on a street') });
  step('Madrid: driving GPS follows streets, walking GPS does not have to', async c => { const W = AV.W, P = AV.P, G = AV.garage; const sc = G.owned().find(r => r.kind === 'car') || (() => { const T = W.T.find(t => /Autos y Motos/.test(t.label())); P.x = T.x; P.z = T.z; G.panel('madrid'); const b = document.querySelector('#cmp [data-buy="car"]'); b && b.click(); AV.closePanel('cmp'); return G.owned().find(r => r.kind === 'car') })();
    c('own a car', !!sc); if (!sc) return; await sleep(500); P.x = sc.x + 1; P.z = sc.z + 1; AV.veh.ride(sc); await sleep(800); c('driving', AV.rides.driving());
    const far = W.places.filter(p => Math.hypot(p.x - P.x, p.z - P.z) > 350).sort((a, b) => Math.hypot(a.x - P.x, a.z - P.z) - Math.hypot(b.x - P.x, b.z - P.z))[0]; AV.minimap.setDest(far.x, far.z, 'test'); await sleep(300);
    const dp = AV.minimap.dest.path, f = onRoad(W, dp); c('driving route on streets', f > .85, (f * 100).toFixed(0) + '% of ' + dp.length + ' points · to ' + far.id); AV.act.end('leave'); await sleep(500);
    AV.minimap.setDest(far.x, far.z, 'walk'); await sleep(300); c('walking route still the walkable one', AV.rides.stats.gpsRoad >= 1 && AV.minimap.dest.path.length > 0) });
  step('Astro-9: GPS fast after the warm-up', async c => { c('loads', await go('astro9')); const PF = AV.path, ok = await until(() => PF.stats.warmBins > 0 && PF.stats.warm >= PF.stats.warmBins, 150000); c('warm-up finished', ok, PF.stats.warm + '/' + PF.stats.warmBins + ' bins · ' + PF.stats.warmMs + ' ms wall');
    const W = AV.W, pl = (W.places || []).filter(p => W.surface(p.x, p.z) !== null); let worst = 0, n = 0; const res = [];
    for (let i = 0; i < pl.length && n < 10; i++) { const a = pl[i], b = pl[(i * 3 + Math.floor(pl.length / 2)) % pl.length]; if (a === b || Math.hypot(a.x - b.x, a.z - b.z) < 25) continue; const t = performance.now(); PF.route(W, a, b); const ms = performance.now() - t; worst = Math.max(worst, ms); n++; res.push(a.id + '>' + b.id + ' ' + ms.toFixed(0)) }
    c('every sampled route ≤ 150 ms (budget 400)', worst <= 150, worst.toFixed(0) + ' ms worst · ' + res.join(' | ')) });
  step('frame cost of the warm-up', async c => { const W = AV.W; AV.path.warmStart(W); let n = 0, worst = 0, last = performance.now(), on = true; const f = () => { const t = performance.now(); worst = Math.max(worst, t - last); last = t; n++; if (on) requestAnimationFrame(f) }; requestAnimationFrame(f); await sleep(3000); on = false;
    c('no long frames while warming', worst < 60, 'worst frame ' + worst.toFixed(0) + ' ms over ' + n + ' frames') });
  step('no JS errors', async c => c('clean', !$('err').textContent, $('err').textContent));
  let active = steps;
  return { names() { active = steps; return steps.map(s => s.name) }, async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
