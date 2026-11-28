/* APEVERSE 3.0 - owner's black-screen report: the real path in a VISIBLE Chrome (run with -Headed), default backend (WebGPU when
   available, no test override): creator -> start -> wake up at home -> leave the flat -> travel -> reload + continue.
   Each step records the Babylon frame counter (is Babylon really drawing?), the game FPS, the backend and errors; screenshots are
   taken by Chrome itself (composited output, works for WebGPU canvases).
   run_tests.ps1 -Suite tools/tests/suite_bab_vis.js -Gpu -Headed -W 1536 -H 864 -Port 8103 -StepTimeout 900 */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(150) } return false };
  const settled = () => AV.W && $('fade') && $('fade').style.opacity === '0';
  const probe = async () => { const B = AV.bab || {}, sc = B.scene; const f0 = B.frames || 0; await sleep(2000); const f1 = B.frames || 0;
    return { on: !!B.on, api: B.stats && B.stats.api, babFramesPerSec: (f1 - f0) / 2, gameFps: Math.round(AV.fps || 0), err: B.error || null, notice: !!$('babNotice'), meshes: B.stats && B.stats.meshes } };
  const errs = () => (window.__APE_ERRS || []).filter(e => !/api\/mp\//.test(e));
  const drawing = p => !p.on || p.babFramesPerSec >= 5;
  step('creator -> start (default backend)', async c => { c('page loaded', await until(() => window.AV && AV.LW && AV.LW.creator && $('bNew'), 120000)); AV.saveKey = 'apeverse_test_babvis'; $('bNew').click(); await until(() => $('lwGo'), 20000);
    const inp = $('lwName'); if (inp) { inp.value = 'Visible Test'; inp.dispatchEvent(new Event('input')) } const go = $('lwGo'); c('creator open', !!go); go && go.click();
    c('game starts', await until(() => AV.W && AV.running && settled(), 120000)); await sleep(4000); const p = await probe(); c('renderer is drawing frames (not frozen / black)', drawing(p), JSON.stringify(p)) }, { shot: 'vis_1_home' });
  step('leave the flat', async c => { if (AV.home && AV.home.inside) AV.home.leave(); await sleep(3000); const p = await probe(); c('drawing outside', drawing(p), JSON.stringify(p)) }, { shot: 'vis_2_outside' });
  step('travel to Chiang Mai', async c => { AV.travel('chiang_mai'); c('arrives', await until(() => AV.W && AV.W.id === 'chiang_mai' && settled(), 240000)); await sleep(3000); const p = await probe(); c('drawing after travel', drawing(p), JSON.stringify(p)) }, { shot: 'vis_3_travel' });
  step('back to Ape Town', async c => { AV.travel('ape_town'); c('arrives', await until(() => AV.W && AV.W.id === 'ape_town' && settled(), 240000)); await sleep(3000); const p = await probe(); c('drawing after return', drawing(p), JSON.stringify(p)); c('no JS errors', !errs().length, errs().slice(-3).join(' | '));
    try { localStorage.removeItem('apeverse_test_babvis'); localStorage.removeItem('apeverse_test_babvis_bak') } catch (e) { } }, { shot: 'vis_4_back' });
  return { names() { return steps.map(s => s.name) }, async exec(i) { const s = steps[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
