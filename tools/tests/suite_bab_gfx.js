/* APEVERSE 3.0 - graphics presets: same session, same viewpoints, before (Three.js stable renderer) vs after (Babylon Low / Medium /
   High / Ultra with the native static world). Screenshots + median FPS per preset per view.
   run_tests.ps1 -Suite tools/tests/suite_bab_gfx.js -Gpu -W 1536 -H 864 -Port 8103 -StepTimeout 600 */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(150) } return false };
  const look = (x, z, tx, tz, p) => { const P = AV.P; P.x = x; P.z = z; P.y = AV.W.surface(x, z) || 0; P.vx = P.vz = 0; P.yaw = Math.atan2(-(tx - x), -(tz - z)); P.pitch = p || 0 };
  const fps = async (n) => { const f = []; for (let i = 0; i < (n || 5); i++) { await sleep(1000); f.push(Math.round(AV.fps || 0)) } f.sort((a, b) => a - b); return { median: f[Math.floor(f.length / 2)], all: f } };
  const errs = () => (window.__APE_ERRS || []).filter(e => !/api\/mp\//.test(e));
  const R = {};
  step('boot (Medium quality, Babylon WebGL2)', async c => { c('page loaded', await until(() => window.AV && AV.boot && $('bNew') && $('bNew').onclick, 120000)); AV.saveKey = 'apeverse_test_babgfx'; $('gq').value = 'Medium'; $('bNew').click();
    c('game starts', await until(() => AV.W && AV.running, 60000)); c('Babylon on', await until(() => AV.bab && AV.bab.on && AV.bab.gfx && AV.bab.gfx.ready, 60000)); if (AV.mis) for (const id of Object.keys(AV.mis.st().a || {})) try { AV.mis.abandon && AV.mis.abandon(id) } catch (e) { }
    c('native static world baked', await until(() => AV.bab.native.state === 'baked', 90000), JSON.stringify(AV.bab.native.stats)) });
  const VIEWS = [[-6, 52, 4, 20, .06], [60, 0, 74, -10, .05]];
  for (const [mode, preset] of [['three', null], ['babylon', 'low'], ['babylon', 'medium'], ['babylon', 'high'], ['babylon', 'ultra']]) for (let v = 0; v < VIEWS.length; v++)
    step('view ' + (v + 1) + ': ' + (preset ? 'Babylon ' + preset : 'Three.js (stable)'), async c => { AV.bab.setOn(mode === 'babylon'); if (preset) AV.bab.gfx.set(preset); const [x, z, tx, tz, p] = VIEWS[v]; look(x, z, tx, tz, p); await sleep(3500); look(x, z, tx, tz, p); await sleep(500);
      const f = await fps(5); (R[preset || 'three'] = R[preset || 'three'] || []).push(f.median); c('fps', true, JSON.stringify({ fps: f.median, all: f.all, gfx: preset ? AV.bab.gfx.stats : 'three', chars: AV.bab.native.chars, ms: AV.bab.stats.ms })) }, { shot: 'gfx_v' + (v + 1) + '_' + (preset || 'three') });
  step('summary', async c => { AV.bab.gfx.set('medium'); AV.bab.setOn(true); const avg = a => Math.round(a.reduce((t, v) => t + v, 0) / a.length); c('median FPS per preset (2 views)', true, JSON.stringify(Object.fromEntries(Object.entries(R).map(([k, v]) => [k, { avg: avg(v), views: v }]))));
    c('Medium reaches 30 FPS', avg(R.medium) >= 30, avg(R.medium)); c('no JS errors', !errs().length, errs().slice(-3).join(' | ')); try { localStorage.removeItem('apeverse_test_babgfx'); localStorage.removeItem('apeverse_test_babgfx_bak') } catch (e) { } });
  return { names() { return steps.map(s => s.name) }, async exec(i) { const s = steps[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
