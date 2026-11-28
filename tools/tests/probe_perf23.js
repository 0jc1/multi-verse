/* perf A/B: Madrid arrival FPS with the police module off vs on (same session, same spot, 12 s settle) */
window.APE_T = (() => {
  const steps = [], step = (name, fn) => steps.push({ name, fn }), sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(150) } return false };
  const fps = async () => { const f = []; for (let i = 0; i < 8; i++) { await sleep(1000); f.push(Math.round(AV.fps || 0)) } return f };
  const go = async id => { AV.travel(id); return until(() => AV.W && AV.W.id === id && $('fade').style.opacity === '0', 240000) };
  step('boot', async c => { c('scripts', await until(() => window.AV && AV.boot && $('bNew').onclick, 120000)); AV.saveKey = 'apeverse_test_probe'; AV.LW.CFG.police = false; $('gq').value = 'Medium'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 60000)); await sleep(1500); AV.save = () => { } });
  step('police OFF', async c => { await go('madrid'); await sleep(20000); c('fps', true, JSON.stringify(await fps())) });
  step('police ON', async c => { AV.LW.CFG.police = true; await go('ape_town'); await sleep(3000); await go('madrid'); await sleep(20000); c('fps', true, JSON.stringify(await fps()) + ' parked ' + AV.LW.parked().length + ' hospital ' + !!AV.LW.hospital.madrid) });
  step('police OFF again', async c => { AV.LW.CFG.police = false; await go('ape_town'); await sleep(3000); await go('madrid'); await sleep(20000); c('fps', true, JSON.stringify(await fps())) });
  step('police ON again', async c => { AV.LW.CFG.police = true; await go('ape_town'); await sleep(3000); await go('madrid'); await sleep(20000); c('fps', true, JSON.stringify(await fps())) });
  return { names() { return steps.map(s => s.name) }, async exec(i) { const s = steps[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: null } } };
})();
