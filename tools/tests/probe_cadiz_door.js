/* agent 4 probe: walk-in doorways + graph islands in a gw world (default Oaxaca).  run_tests.ps1 -Suite tools/tests/probe_cadiz_door.js -Gpu */
window.APE_T = (() => {
  const steps = [], step = (name, fn) => steps.push({ name, fn }), sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const WORLD = 'oaxaca';
  step('boot', async c => { $('gq').value = 'Medium'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); await sleep(1500); AV.save = () => { } });
  step('probe', async c => { AV.travel(WORLD); c('loads', await until(() => AV.W && AV.W.id === WORLD && $('fade').style.opacity === '0', 240000)); await sleep(3000); const W = AV.W, X = AV[WORLD], N = X.N;
    c('islands', true, JSON.stringify(X.rep.islands) + ' · doors widened ' + (X.stats.doorsWidened || 0) + ' · blocked ' + JSON.stringify(X.stats.doorsBlocked || []));
    for (const k in X.interiors) { const it = X.interiors[k], out = []; for (let i = 0; i <= 12; i++) { const t = i / 12, x = it.door[0] + (it.doorIn[0] - it.door[0]) * t, z = it.door[1] + (it.doorIn[1] - it.door[1]) * t; out.push([+x.toFixed(2), +z.toFixed(2), N.code(x, z), W.surface(x, z) == null ? null : +W.surface(x, z).toFixed(2)]) }
      const circ = W.circles.filter(q => Math.hypot(q[0] - it.door[0], q[1] - it.door[1]) < 4).map(q => q.map(v => +v.toFixed(2))); c(k, true, JSON.stringify({ lotY: it.lot.y, out, circ })) } });
  return { names() { return steps.map(s => s.name) }, async exec(i) { const s = steps[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: null } } };
})();
