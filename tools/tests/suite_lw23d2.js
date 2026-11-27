/* APEVERSE 2.3 MILESTONE D2 - physically enterable businesses (owner: 40% must be walk-in interiors, not entrance menus).
   Per city: >= 40% of named businesses ENTERABLE (service point enclosed by walls on 3+ sides), a 2.3 interior has a walkable route
   from the street through its door to the counter (the GPS router finds it and no point is inside a wall), the counter is enclosed,
   and an order placed inside is served into your hand.   run_tests.ps1 -Suite tools/tests/suite_lw23d2.js -Gpu -Port 8102 -StepTimeout 900 */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const go = async id => { if (AV.W && AV.W.id === id) return true; AV.travel(id); return until(() => AV.W && AV.W.id === id && settled(), 240000) };
  const put = (x, z) => { const P = AV.P; P.x = x; P.z = z; P.y = AV.W.surface(x, z) || 0; P.vx = P.vz = 0 };
  const look = (x, z, tx, tz, p) => { put(x, z); AV.P.yaw = Math.atan2(-(tx - x), -(tz - z)); AV.P.pitch = p || 0 };
  const inWall = (W, x, z) => W.cols.some(c => x > c[0] + .05 && x < c[1] - .05 && z > c[2] + .05 && z < c[3] - .05);
  const errs = () => (window.__APE_ERRS || []).filter(e => !/api\/mp\//.test(e));
  step('boot (sandboxed save)', async c => { c('page scripts loaded', await until(() => window.AV && AV.boot && $('bNew') && $('bNew').onclick, 120000)); window.__real = localStorage.getItem('apeverse_v09'); AV.saveKey = 'apeverse_test_lw23d2';
    $('gq').value = 'Medium'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 60000)); await sleep(1500); AV.S.time = 12 * 60; AV.S.money = 2000; c('interiors kit', !!(AV.LW.interiors && AV.LW.enclosed)) });
  for (const w of ['madrid', 'amsterdam', 'tokyo', 'vienna', 'oaxaca', 'chiang_mai', 'rio', 'barcelona']) step(w + ': walk-in businesses', async c => { c('loads', await go(w)); await until(() => AV.LW.interiorStats[w], 15000); await sleep(800); const r = AV.LW.bizCoverage();
    c('>= 40% of named businesses physically enterable', r.pctEnter >= 40, r.enterable + '/' + r.total + ' = ' + r.pctEnter + '% (before ' + ((AV.LW.interiorStats[w] || {}).before) + '%, built ' + ((AV.LW.interiorStats[w] || {}).built) + ')');
    const b = AV.LW.interiors.list.find(x => x.W === AV.W); if (!b) { c('a 2.3 interior here (or enough existing walk-ins)', r.pctEnter >= 40); return } const W = AV.W;
    const route = AV.path.route(W, { x: b.front[0], z: b.front[1] }, { x: b.counter[0], z: b.counter[1] }); const bad = route.filter(p => inWall(W, p[0], p[1])).length;
    c('a walking route from the street, through the door, to the counter', route.length >= 1 && bad === 0 && AV.path.stats.how !== 'straight (no path found)', AV.path.stats.how + ' · ' + route.length + ' pts');
    c('the counter is inside (walls on 3+ sides)', AV.LW.enclosed(W, b.counter[0], b.counter[1])); const T = W.T.find(t => t.lwInside && Math.hypot(t.x - b.counter[0], t.z - b.counter[1]) < .5); c('service counter inside', !!T);
    if (T) { put(T.x, T.z); T.fn(); await sleep(300); const btn = document.querySelector('[data-vb]'); if (btn) { const id = btn.dataset.vb, n0 = AV.bag.count(id); btn.click(); c('ordered inside and served', await until(() => AV.bag.count(id) === n0 + 1, 4000), id) } else c('kind with its own panel (gallery / hostel)', /ticket|Nap|Siesta|Entrada/i.test($('cmp').textContent)); AV.closePanel('cmp') }
    const f = b.front, c2 = b.counter; look(f[0] + (f[0] - c2[0]) * .9, f[1] + (f[1] - c2[1]) * .9, c2[0], c2[1], .02); await sleep(1500) }, { shot: 'lw_d2_' + w });
  step('inside view', async c => { c('Madrid', await go('madrid')); await sleep(1500); const b = AV.LW.interiors.list.find(x => x.W === AV.W); if (!b) return; const f = b.front, c2 = b.counter; look(f[0] + (c2[0] - f[0]) * .35, f[1] + (c2[1] - f[1]) * .35, c2[0], c2[1], -.05); await sleep(1500); c('no JS errors', !errs().length, errs().slice(-3).join(' | '));
    c("player's real save untouched", localStorage.getItem('apeverse_v09') === window.__real); try { localStorage.removeItem('apeverse_test_lw23d2'); localStorage.removeItem('apeverse_test_lw23d2_bak') } catch (e) { } }, { shot: 'lw_d2_inside' });
  return { names() { return steps.map(s => s.name) }, async exec(i) { const s = steps[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
