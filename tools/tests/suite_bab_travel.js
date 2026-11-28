/* APEVERSE 3.0 - Babylon across many world trips: GPU resources of the previous world are freed (sweep), Babylon keeps drawing,
   scene counts and JS heap stay bounded, no crash.  run_tests.ps1 -Suite tools/tests/suite_bab_travel.js -Gpu -W 1536 -H 864 -Port 8103 -StepTimeout 900 */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(150) } return false };
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const snap = () => { const sc = AV.bab.scene; return { meshes: sc.meshes.length, mats: sc.materials.length, tex: sc.textures.length, geos: sc.geometries.length, skel: sc.skeletons.length, heapMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null } };
  const errs = () => (window.__APE_ERRS || []).filter(e => !/api\/mp\//.test(e));
  const R = [];
  step('boot', async c => { c('page loaded', await until(() => window.AV && AV.boot && $('bNew') && $('bNew').onclick, 120000)); AV.saveKey = 'apeverse_test_babtrav'; $('gq').value = 'Medium'; AV.wormhole && AV.wormhole.setMode('instant'); $('bNew').click();
    c('Babylon on', await until(() => AV.W && AV.running && AV.bab && AV.bab.on, 90000)); await sleep(8000); R.push(['start', snap()]) });
  for (const w of ['amsterdam', 'chiang_mai', 'ape_town', 'tokyo', 'ape_town', 'amsterdam']) step('travel: ' + w, async c => { AV.travel(w); c('arrives', await until(() => AV.W && AV.W.id === w && settled(), 300000)); await sleep(9000);
    const f0 = AV.bab.frames; await sleep(2000); const bf = (AV.bab.frames - f0) / 2, s = snap(); R.push([w, s]); c('Babylon drawing', AV.bab.on && bf >= 3, JSON.stringify({ babFps: bf, gameFps: Math.round(AV.fps || 0), sweep: AV.bab.lastSweep, scene: s })) }, { shot: 'trav_' + w });
  step('bounded', async c => { const at = R.filter(r => r[0] === 'ape_town').map(r => r[1]); c('second Ape Town visit does not keep the other worlds alive (materials, textures)', at.length < 2 || (at[1].mats <= at[0].mats * 1.35 + 40 && at[1].tex <= at[0].tex * 1.35 + 40), JSON.stringify(at));
    c('trace', true, JSON.stringify(R)); c('no JS errors', !errs().length, errs().slice(-3).join(' | ')); AV.wormhole && AV.wormhole.setMode('cinematic'); try { localStorage.removeItem('apeverse_test_babtrav'); localStorage.removeItem('apeverse_test_babtrav_bak') } catch (e) { } });
  return { names() { return steps.map(s => s.name) }, async exec(i) { const s = steps[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
