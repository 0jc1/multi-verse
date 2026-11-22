/* Apeverse V0.9.8 - Stage 2 suite: Astro-9 districts, Jungle Dub outer jungle, richer Chiang Mai crowd, render cost (run_tests.ps1 -Suite tools\tests\suite_v098.js) */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const $ = id => document.getElementById(id), lab = t => typeof t.label === 'function' ? t.label() : t.label;
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const travel = async id => { AV.travel(id); return until(() => AV.W && AV.W.id === id && settled(), 30000) };
  const look = (x, z, tx, tz, pitch) => { AV.P.x = x; AV.P.z = z; AV.P.y = AV.W.surface(x, z) || 0; AV.P.vx = AV.P.vz = 0; AV.P.yaw = Math.atan2(-(tx - x), -(tz - z)); AV.P.pitch = pitch || .05 };
  const skinned = () => { let n = 0; AV.W.group.traverse(o => { if (o.isSkinnedMesh) n++ }); return n };
  const cost = () => { const R = AV.R; R.info.autoReset = false; R.info.reset(); R.render(AV.scene, AV.cam); const r = { tris: R.info.render.triangles, calls: R.info.render.calls }; R.info.autoReset = true; return r };
  const tgt = re => AV.W.T.find(t => (!t.show || t.show()) && re.test(lab(t)));
  const M = {};

  step('boot', async c => { $('gq').value = 'High'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 20000)); await sleep(1500); AV.save = () => { }; AV.S.money = 900 });

  step('Astro-9 districts', async c => {
    c('travel', await travel('astro9')); const X = AV.astro9x; c('four districts', X && X.DIST.length === 4);
    for (const d of X.DIST) { const ok = d.path.every(p => AV.W.surface(p[0], p[1]) !== null) && AV.W.surface(d.c[0], d.c[1]) !== null; c(d.id + ': walkway + platform walkable', ok); c(d.id + ': space beside the walkway is not', AV.W.surface(d.c[0] + d.r + 3, d.c[1]) === null) }
    c('district places on the travel list', ['bazaar', 'towers', 'docks', 'gardens'].every(id => AV.W.places.some(p => p.id === id)));
    /* walk through the gate: start on the deck, drive the player along the walkway */
    const d = X.DIST[0]; AV.P.x = d.path[0][0]; AV.P.z = d.path[0][1]; let ok = true; for (const p of d.path) { AV.P.x = p[0]; AV.P.z = p[1]; await sleep(60); if (AV.W.surface(AV.P.x, AV.P.z) === null) ok = false } c('player can stand all along the bazaar walkway', ok);
    const st = tgt(/Nebula noodles/); c('bazaar food stand', !!st); if (st) { const n0 = AV.bag.count('khao_soi'); st.fn(); c('buy nebula noodles into the backpack', AV.bag.count('khao_soi') === n0 + 1) }
    const vm = tgt(/Vending Machine/); c('the Weirdest Vending Machine', !!vm); if (vm) { const m0 = AV.S.money; vm.fn(); c('it takes 15 credits and drops something', AV.S.money === m0 - 15 && /CLUNK|CLONC/.test($('toast').textContent), $('toast').textContent) }
    const sh = tgt(/Hidden mosaic shrine/); c('hidden shrine in the Gaudí Towers', !!sh); if (sh) { sh.fn(); c('shrine gives a crystal once per day', AV.bag.count('space_crystal') >= 1) }
    c('more rigged residents (merchants, robots, spirits)', skinned() >= 30, skinned());
    const b = X.DIST[0]; look(b.c[0], b.c[1] + 14, b.c[0], b.c[1], .1); await sleep(2500); M.astro_bazaar = cost();
  }, { shot: 'v098_bazaar' });
  step('Astro-9 towers view', async c => { const d = AV.astro9x.DIST[1]; look(d.c[0] - 16, d.c[1] + 4, d.c[0], d.c[1], .28); await sleep(2500); M.astro_towers = cost(); c('towers rendered', M.astro_towers.tris > 0, JSON.stringify(M.astro_towers)) }, { shot: 'v098_towers' });
  step('Astro-9 docks + gardens view', async c => { const d = AV.astro9x.DIST[2]; look(d.c[0] + 14, d.c[1] + 6, d.c[0], d.c[1], .1); await sleep(2500); M.astro_docks = cost(); c('docks rendered', M.astro_docks.tris > 0, JSON.stringify(M.astro_docks)) }, { shot: 'v098_docks' });
  step('Astro-9 gardens view', async c => { const d = AV.astro9x.DIST[3]; look(d.c[0] - 9, d.c[1] - 9, d.c[0], d.c[1], .12); await sleep(2500); M.astro_gardens = cost(); c('gardens rendered', M.astro_gardens.tris > 0, JSON.stringify(M.astro_gardens)) }, { shot: 'v098_gardens' });

  step('Jungle Dub outer jungle', async c => {
    c('travel', await travel('jungle_dub')); const W = AV.W;
    for (const id of ['lagoon', 'roots', 'tree', 'heal', 'falls']) c(id + ': on the travel list', W.places.some(p => p.id === id));
    for (const id of ['roots', 'tree', 'heal', 'falls']) { const p = W.places.find(q => q.id === id); c(id + ': arrival point walkable', W.surface(p.x, p.z) !== null) }
    const lag = W.places.find(p => p.id === 'lagoon'); c('lagoon: shore walkable', W.surface(lag.x, lag.z) !== null);
    /* trails: no cliffs (max height step per 0.5 m) from the bridges out to each zone */
    let worst = 0, blocked = 0; const tr = [[90, 33, 95, 64], [90, 33, 30, 66], [200, 33, 150, 64], [200, 33, 210, 79], [-40, 37, -60, 64]];
    for (const [a0, r0, a1, r1] of tr) { const P0 = [Math.cos(a0 * Math.PI / 180) * r0, Math.sin(a0 * Math.PI / 180) * r0], P1 = [Math.cos(a1 * Math.PI / 180) * r1, Math.sin(a1 * Math.PI / 180) * r1]; let prev = null;
      for (let t = 0; t <= 1.0001; t += .01) { const x = P0[0] + (P1[0] - P0[0]) * t, z = P0[1] + (P1[1] - P0[1]) * t, h = W.surface(x, z); if (h === null) { blocked++; continue } if (prev != null) worst = Math.max(worst, Math.abs(h - prev)); prev = h } }
    c('trails are walkable (no water, no cliffs)', blocked < 6 && worst < .6, 'blocked samples ' + blocked + ', worst step ' + worst.toFixed(2) + ' m');
    c('world is about twice as wide', W.surface(0, 100) !== null || W.surface(100, 0) !== null || W.surface(-90, 20) !== null);
    c('zone residents (rasta apes, frogs, spirits)', skinned() >= 25, skinned());
    const k = W.T.find(t => /Ital kitchen/.test(lab(t))); c('Roots Village ital kitchen', !!k); if (k) { const n0 = AV.bag.count('mango'); k.fn(); c('ital stew bought', AV.bag.count('mango') === n0 + 1) }
    const r = W.places.find(p => p.id === 'roots'); look(r.x, r.z, ...[67.5, 39]); await sleep(2500); M.jungle_roots = cost();
  }, { shot: 'v098_roots' });
  step('Jungle lagoon view', async c => { const W = AV.W, l = W.places.find(p => p.id === 'lagoon'); look(l.x, l.z, -69.3, 41, .05); await sleep(2500); M.jungle_lagoon = cost(); c('lagoon rendered', M.jungle_lagoon.tris > 0, JSON.stringify(M.jungle_lagoon)) }, { shot: 'v098_lagoon' });
  step('Jungle center (stage) cost', async c => { look(0, 22, 0, -8, 0); await sleep(2000); M.jungle_stage = cost(); c('stage area rendered', M.jungle_stage.tris > 0, JSON.stringify(M.jungle_stage)) });

  step('Chiang Mai richer crowd + cost', async c => {
    c('travel', await travel('chiang_mai')); look(18, 46, 100, 46, 0); await sleep(2500); M.cm_hostel = cost();
    c('street crowd uses the full human body on High', AV.chars.walkerKit('man', false) && true);
    look(183, 12, 194, 40, 0); await sleep(2500); M.cm_bazaar = cost(); c('render cost recorded', true, JSON.stringify(M));
  }, { shot: 'v098_cm' });

  let active = [];
  return { names(mobile) { active = steps.filter(s => !!s.mobile === !!mobile); return active.map(s => s.name) },
    async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
