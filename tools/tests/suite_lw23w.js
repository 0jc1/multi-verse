/* APEVERSE 2.3 - WHITE SCREEN regression (owner playtest): the creator's preview used to open a new WebGL context on every option
   change; past Chrome's ~16-context limit the game's own renderer was dropped -> a white, frozen world.  This suite goes through the
   real creator UI with 30 option changes, starts the game, and verifies the main context is alive and the frame is really rendered
   (pixels read back: not blank, not white, has variety), at home, outside, after travel to 3 worlds, and via the wake-up chooser.
   run_tests.ps1 -Suite tools/tests/suite_lw23w.js -Gpu -Port 8102 -StepTimeout 900 */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(150) } return false };
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const click = sel => { const b = document.querySelector(sel); if (b) b.click(); return !!b };
  const frame = () => { const R = AV.R, gl = R.getContext(); if (gl.isContextLost()) return { lost: true }; R.render(AV.scene, AV.cam); const w = gl.drawingBufferWidth, h = gl.drawingBufferHeight, N = 24, px = new Uint8Array(4); let sum = 0, white = 0, dark = 0; const vals = [];
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { gl.readPixels(Math.floor((i + .5) / N * w), Math.floor((j + .5) / N * h), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); const v = (px[0] + px[1] + px[2]) / 3; vals.push(v); sum += v; if (v > 245) white++; if (v < 4) dark++ }
    const mean = sum / vals.length, sd = Math.sqrt(vals.reduce((a, v) => a + (v - mean) * (v - mean), 0) / vals.length); return { lost: false, mean: +mean.toFixed(1), sd: +sd.toFixed(1), whiteShare: +(white / vals.length).toFixed(2), darkShare: +(dark / vals.length).toFixed(2) } };
  const ok = f => !f.lost && f.whiteShare < .6 && f.darkShare < .9 && f.sd > 6;
  const errs = () => (window.__APE_ERRS || []).filter(e => !/api\/mp\//.test(e));
  step('creator: 30 option changes (past the old context limit)', async c => { c('page scripts loaded', await until(() => window.AV && AV.LW && AV.LW.creator, 120000)); AV.saveKey = 'apeverse_test_lw23w'; AV.LW.creator(); await sleep(600);
    const inp = $('lwName'); inp.value = 'White Test'; inp.dispatchEvent(new Event('input')); const sels = ['[data-o="body"][data-v="female"]', '[data-o="body"][data-v="male"]', '[data-o="style"][data-v="afro"]', '[data-o="style"][data-v="long"]', '[data-o="top"][data-v="hawaii"]', '[data-o="top"][data-v="ztoned"]', '[data-o="bot"][data-v="shorts"]', '[data-o="bot"][data-v="denim"]', '[data-o="foot"][data-v="boots"]', '[data-o="foot"][data-v="flip"]'];
    for (let k = 0; k < 30; k++) { click(sels[k % sels.length]); await sleep(60) } c('the preview kept ONE renderer', AV.LW.previewContexts() === 1); c('the game context is still alive', !AV.R.getContext().isContextLost());
    click('[data-h="ams_jordaan_studio"]'); await sleep(100); $('gq').value = 'Medium'; click('#lwGo'); c('game starts', await until(() => AV.W && AV.running && settled(), 120000)); await sleep(3000) });
  step('at home: the world is rendered', async c => { const f = frame(); c('rendered frame (not white / blank)', ok(f), JSON.stringify(f)); c('no context loss', !AV.LW.stats.ctxLost) }, { shot: 'lw_w_home' });
  step('outside', async c => { if (AV.home.inside) AV.home.leave(); await sleep(1800); const f = frame(); c('rendered frame outside', ok(f), JSON.stringify(f)) }, { shot: 'lw_w_outside' });
  for (const w of ['astro9', 'amsterdam', 'ape_town']) step('travel: ' + w, async c => { AV.travel(w); c('arrives', await until(() => AV.W && AV.W.id === w && settled(), 240000)); await sleep(2500); const f = frame(); c('rendered frame in ' + w, ok(f), JSON.stringify(f)) }, { shot: 'lw_w_' + w });
  step('existing character: wake-up chooser', async c => { const s = JSON.parse(JSON.stringify(AV.S)); c('chooser offers the homes', AV.LW.wakeChooser(s)); const b = [...document.querySelectorAll('#lwOnb [data-sp]')].find(x => x.dataset.sp); b && b.click(); c('chooser sets the home + its world for waking up', s.homeSpawn === b.dataset.sp && s.world === AV.home.PROPS[b.dataset.sp].w, s.homeSpawn + ' @ ' + s.world); await until(() => AV.W && settled(), 120000); await sleep(2000); const f = frame(); c('rendered frame after continue', ok(f), JSON.stringify(f));
    c('no JS errors', !errs().length, errs().slice(-3).join(' | ')); try { localStorage.removeItem('apeverse_test_lw23w'); localStorage.removeItem('apeverse_test_lw23w_bak') } catch (e) { } }, { shot: 'lw_w_continue' });
  return { names() { return steps.map(s => s.name) }, async exec(i) { const s = steps[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
