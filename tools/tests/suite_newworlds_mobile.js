/* APEVERSE 2 NEW WORLDS: phone check for Tokyo + Paris (run with -Mobile: emulated touch phone, 915x412 landscape).
   Per world: loads as a phone, touch controls shown, the joystick (AV.T) walks you, the ▶ act button uses the nearest interaction
   (a shop opens, its panel fits the screen), the portal panel fits, the minimap + GPS work, FPS sample, screenshot.
   run_tests.ps1 -Suite tools/tests/suite_newworlds_mobile.js -Gpu -Mobile -Port 8098 */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const lbl = t => { try { return typeof t.label === 'function' ? t.label() : t.label } catch (e) { return '' } };
  const findT = re => AV.W.T.find(t => re.test(lbl(t)) && (!t.show || t.show()));
  const put = (x, z, yaw) => { const p = AV.P; p.x = x; p.z = z; p.y = AV.W.surface(x, z) || 0; if (yaw != null) p.yaw = yaw; p.vx = p.vz = 0 };
  const fits = el => { if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 50 && r.left >= -1 && r.right <= innerWidth + 1 };
  const shown = id => { const e = $(id); return !!e && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().width > 0 };
  const sample = async s => { let n = 0, on = true; const f = () => { n++; if (on) requestAnimationFrame(f) }; requestAnimationFrame(f); await sleep(s * 1000); on = false; return +(n / s).toFixed(1) };
  step('boot (phone)', async c => { await until(() => window.AV && AV.worldDefs && $('bNew'), 30000); $('gq').value = 'Medium'; $('bNew').click(); if (!await until(() => AV.W && AV.running, 30000)) $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); await sleep(1500); AV.save = () => { }; AV.S.money = 3000;
    c('detected as a phone', AV.device === 'phone', AV.device); c('touch controls shown', shown('tc') && shown('tE'), innerWidth + 'x' + innerHeight) });
  for (const [wid, shopRe, spot] of [['tokyo', /ApeMart Express \(konbini\)/, [-30, -36, Math.PI / 2]], ['paris', /Brasserie Le Zinc|Café des Singes: the zinc/, [126, 100, Math.PI]]]) {
    step(wid + ' on a phone', async c => { AV.S.time = 12 * 60; AV.travel(wid); c('loads', await until(() => AV.W && AV.W.id === wid && settled(), 240000)); await sleep(3000); c('no error', !$('err').textContent && !(AV[wid === 'tokyo' ? 'tokyo' : 'paris'].stats.lifeErr));
      c('touch controls still shown', shown('tc') && shown('tE')); const p = AV.P, x0 = p.x, z0 = p.z; AV.T.y = -1; await sleep(2000); AV.T.y = 0; await sleep(300); c('joystick walks you', Math.hypot(p.x - x0, p.z - z0) > 2, Math.hypot(p.x - x0, p.z - z0).toFixed(1) + ' m');
      const S0 = findT(shopRe); c('a shop counter', !!S0); if (S0) { put(S0.x, S0.z); await sleep(700); AV.interact(); await sleep(500); const cm = $('cmp'); c('▶ act opens the shop', !!cm && /data-buy/.test(cm.innerHTML)); c('shop panel fits the phone screen', fits(cm && (cm.firstElementChild || cm)), cm ? Math.round(cm.getBoundingClientRect().width) + '/' + innerWidth : ''); AV.closePanel('cmp') }
      const PT = findT(/Apeverse Portal/); if (PT) { PT.fn(); await sleep(400); c('portal panel fits', fits($('cmp'))); AV.closePanel('cmp') }
      AV.minimap.setDest(spot[0], spot[1], 'test'); c('GPS route', await until(() => AV.minimap.dest && AV.minimap.dest.path && AV.minimap.dest.path.length >= 1, 3000));
      put(spot[0], spot[1], spot[2]); await sleep(1500); const f = await sample(2.5); c('frame (phone emulation on this GPU)', true, f + ' fps') }, { shot: wid + '_phone' });
  }
  step('no JS errors', async c => c('clean', !$('err').textContent, $('err').textContent));
  return { names() { return steps.map(s => s.name) }, async exec(i) { const s = steps[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
