/* 2.3 visual probe: the creator with a female look, then the avatar in third person on a street (screenshots only). */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {})), sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(150) } return false };
  const click = sel => { const b = document.querySelector(sel); if (b) b.click(); return !!b };
  step('creator', async c => { c('ready', await until(() => window.AV && AV.LW && AV.LW.creator, 120000)); AV.saveKey = 'apeverse_test_look'; AV.LW.creator(); await sleep(500); const i = $('lwName'); i.value = 'Mila'; i.dispatchEvent(new Event('input'));
    click('[data-o="body"][data-v="female"]'); await sleep(200); click('[data-o="style"][data-v="long"]'); click('[data-t="flower"]'); click('[data-o="top"][data-v="hawaii"]'); click('[data-o="bot"][data-v="shorts"]'); await sleep(2500); c('open', $('lwOnb').style.display === 'block') }, { shot: 'look_creator' });
  step('third person', async c => { click('#lwGo'); c('starts', await until(() => AV.W && AV.running && $('fade').style.opacity === '0', 120000)); await sleep(3000); if (AV.home.inside) AV.home.leave(); await sleep(1500); AV.S.time = 11 * 60; AV.LW.toggleTP(true); await sleep(2500); c('avatar visible', AV.LW.avatar.g && AV.LW.avatar.g.visible) }, { shot: 'look_tp' });
  step('ape', async c => { AV.S.me = Object.assign({}, AV.S.me, { body: 'ape', fur: 0x3a2a1e, top: 'ztoned', bot: 'elephant' }); await sleep(2500); c('ape avatar', AV.LW.avatar.stats.builds >= 2) }, { shot: 'look_ape' });
  return { names() { return steps.map(s => s.name) }, async exec(i) { const s = steps[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
