/* APEVERSE - Giant Hostel photo-skin test suite: boots the game, travels to Chiang Mai, screenshots the hostel. */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const $ = id => document.getElementById(id);
  step('boot + travel to Chiang Mai', async c => {
    $('gq').value = 'Medium'; $('bNew').click();
    c('Ape Town loads', await until(() => AV.W && AV.W.id === 'ape_town' && AV.running, 25000));
    AV.enterWorld("chiang_mai", "default");
    c('Chiang Mai loads', await until(() => AV.W && AV.W.id === "chiang_mai" && AV.running, 60000));
    await sleep(4000);
    c('TEX_GH pack present', !!AV.TEX_GH && Object.keys(AV.TEX_GH).length === 10, Object.keys(AV.TEX_GH).join(','));
  }, { shot: 'gh_arrival' });
  step('hostel front view', async c => {
    AV.P.x = 15; AV.P.z = 38; AV.P.yaw = 0; AV.P.pitch = .05; await sleep(4000);
  }, { shot: 'gh_front' });
  step('door closeup', async c => {
    AV.P.x = 15.5; AV.P.z = 44; AV.P.yaw = 0; AV.P.pitch = 0; await sleep(4000);
  }, { shot: 'gh_door' });
  step('canopy + lightbox closeup', async c => {
    AV.P.x = 22; AV.P.z = 42; AV.P.yaw = .3; AV.P.pitch = .08; await sleep(4000);
  }, { shot: 'gh_terrace' });
  step('inside the lounge', async c => {
    AV.P.x = 15; AV.P.z = 58; AV.P.yaw = 0; AV.P.pitch = .05; await sleep(4000);
  }, { shot: 'gh_lounge' });
  return { steps };
})();
