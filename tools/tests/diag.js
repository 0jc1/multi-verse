/* find out why a world build fails */
window.APE_T = (() => {
  const steps = [], step = (n, fn) => steps.push({ name: n, fn });
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 20000)) { try { if (cond()) return true } catch (e) { } await sleep(200) } return false };
  const $ = id => document.getElementById(id);
  step('boot low', async c => {
    $('gq').value = 'Low'; $('bNew').click();
    c('game running', await until(() => AV.running && AV.W, 180000), AV.W && AV.W.id);
    await sleep(1500);
  });
  step('build jerusalem', async c => {
    document.getElementById('err').textContent = '';
    AV.enterWorld('jerusalem', 'default', { instant: true });
    await sleep(6000);
    c('AV.W is jerusalem', AV.W && AV.W.id === 'jerusalem', AV.W && AV.W.id);
    const e = $('err').textContent;
    c('no world error', !e, e.slice(0, 300));
    c('scene groups', AV.scene.children.filter(o => o.isGroup).length, '');
  });
  step('build desert', async c => {
    document.getElementById('err').textContent = '';
    AV.enterWorld('judean_desert', 'default', { instant: true });
    await sleep(8000);
    c('AV.W is judean_desert', AV.W && AV.W.id === 'judean_desert', AV.W && AV.W.id);
    const e = $('err').textContent;
    c('no world error', !e, e.slice(0, 300));
  });
  return { steps };
})();