/* visual tour: screenshots of the new worlds from a few viewpoints (High graphics) */
window.APE_T = (() => {
  const steps = [], step = (n, fn, o) => steps.push(Object.assign({ name: n, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 20000)) { try { if (cond()) return true } catch (e) { } await sleep(200) } return false };
  const $ = id => document.getElementById(id);
  const look = (x, z, yaw, pitch) => { const W = AV.W; AV.P.x = x; AV.P.z = z; AV.P.y = W.surface(x, z) || 0; AV.P.vx = AV.P.vz = AV.P.vy = 0; AV.P.yaw = yaw; AV.P.pitch = pitch || 0 };
  const hideUi = () => { for (const id of ['hint', 'fps', 'prompt', 'toast', 'top', 'cmhud']) { const e = $(id); if (e) e.style.visibility = 'hidden' } };
  step('boot', async c => { $('gq').value = 'Medium'; const f = AV.fresh(); f.set.gq = 'Medium'; f.time = 16.5 * 60; AV.boot.begin(f); c('running', await until(() => AV.running && AV.W, 240000)) });
  step('jerusalem', async c => { AV.enterWorld('jerusalem', 'default', { instant: true }); await sleep(9000); c('in jerusalem', AV.W.id === 'jerusalem'); hideUi(); look(-82, 30, Math.atan2(-(-70 + 82), -(8 - 30)), .05); await sleep(1800) }, { shot: 'v_jaffa_gate' });
  step('dome', async c => { look(39, -48, 0, .18); await sleep(1500); c('ok', true) }, { shot: 'v_dome' });
  step('wall', async c => { look(26, -30, 0, .08); await sleep(1500); c('ok', true) }, { shot: 'v_western_wall' });
  step('souk', async c => { look(-14, -70, 0, 0); await sleep(1500); c('ok', true) }, { shot: 'v_souk' });
  step('sepulchre', async c => { look(-42, -30, 0, .2); await sleep(1500); c('ok', true) }, { shot: 'v_sepulchre' });
  step('jaffa road', async c => { look(-150, 4, -Math.PI / 2 + .3, .02); await sleep(1500); c('ok', true) }, { shot: 'v_jaffa_road' });
  step('people', async c => { look(-62, 18, Math.PI, 0); await sleep(1500); c('ok', true) }, { shot: 'v_dalia' });
  step('desert', async c => { AV.enterWorld('judean_desert', 'default', { instant: true }); await sleep(9000); c('in desert', AV.W.id === 'judean_desert'); hideUi(); look(84, 2, -Math.PI / 2 - .2, 0) ; await sleep(1500) }, { shot: 'v_dead_sea' });
  step('masada', async c => { look(100, 90, Math.PI / 2, .1); await sleep(1500); c('ok', true) }, { shot: 'v_masada' });
  step('camp', async c => { look(-2, 6, Math.atan2(-(-14 - (-2)), -(26 - 6)), .05); await sleep(1500); c('ok', true) }, { shot: 'v_camp' });
  step('outpost', async c => { look(-56, 12, Math.atan2(-(-64 + 56), -(-4 - 12)), 0); await sleep(1500); c('ok', true) }, { shot: 'v_outpost' });
  return { steps };
})();
