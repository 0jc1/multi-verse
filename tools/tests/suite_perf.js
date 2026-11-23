/* Performance budget on High graphics (run_tests.ps1 -Suite tools\tests\suite_perf.js -StepTimeout 900).
   Headless software rendering cannot measure real FPS; this checks the work per frame instead: triangles (incl. the shadow pass),
   draw calls and shadow-casting triangles at fixed views, with the shadow budget of js/perf_guard.js active. */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(150) } return false };
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const measure = async () => { await sleep(7000); const r = Object.assign({}, AV.R.info.render), s = AV.perf ? AV.perf.stats() : {}; return { r, s } };
  step('boot', async c => { $('gq').value = 'High'; $('bNew').click(); c('game starts on High', await until(() => AV.W && AV.running, 30000)); AV.save = () => { }; c('shadows on', AV.R.shadowMap.enabled) });
  const view = (id, x, z, yaw, budget) => step(id + ' on High', async c => { if (AV.W.id !== id) { AV.travel(id); await until(() => AV.W && AV.W.id === id && settled(), 150000) } if (x != null) { const P = AV.P; P.x = x; P.z = z; P.y = AV.W.surface(x, z) || 0; P.yaw = yaw; P.pitch = 0 }
    const { r, s } = await measure(); c('triangles per frame (incl. shadows) under ' + budget[0] + 'M', r.triangles < budget[0] * 1e6, (r.triangles / 1e6).toFixed(2) + 'M'); c('draw calls under ' + budget[1], r.calls < budget[1], r.calls);
    c('shadow budget + character LOD active', !AV.perf || (s.small > 0 && s.chars > 0), JSON.stringify(s)); c('resolution guard does not ping-pong', !AV.perf || s.changes <= 2, s.changes); c('no JS errors', !$('err').textContent, $('err').textContent) }, { shot: 'perf_' + id });
  view('ape_town', null, null, 0, [6, 1300]); view('madrid', 0, 40, Math.PI, [6, 900]); view('astro9', 0, 112, Math.PI * .8, [5, 900]); view('chiang_mai', null, null, 0, [5, 900]); view('pai', null, null, 0, [5, 900]);
  let active = [];
  return { names(mobile) { active = steps.filter(s => !!s.mobile === !!mobile || s.name === 'boot'); return active.map(s => s.name) },
    async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
