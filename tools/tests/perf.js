/* perf probe: frame time, draw calls, triangles and scene growth per world */
window.APE_T = (() => {
  const steps = [], step = (n, fn) => steps.push({ name: n, fn });
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 20000)) { try { if (cond()) return true } catch (e) { } await sleep(200) } return false };
  const $ = id => document.getElementById(id);
  const start = gq => { $('gq').value = gq; const f = AV.fresh(); f.set.gq = gq; AV.boot.begin(f) };
  const measure = async (label, c) => {
    const t0 = performance.now(); let n = 0;
    await new Promise(res => { const f = () => { n++; if (performance.now() - t0 > 3000) return res(); requestAnimationFrame(f) }; requestAnimationFrame(f) });
    const ms = (performance.now() - t0) / n, info = AV.R.info.render, groups = AV.scene.children.filter(o => o.isGroup).length;
    let objs = 0; AV.scene.traverse(o => { if (o.isMesh || o.isPoints || o.isLine) objs++ });
    c(label + ': ' + ms.toFixed(1) + ' ms/frame · ' + info.calls + ' calls · ' + (info.triangles / 1000).toFixed(0) + 'k tris · groups ' + groups + ' · objects ' + objs + ' · geo ' + AV.R.info.memory.geometries + ' tex ' + AV.R.info.memory.textures, true);
    return { ms, calls: info.calls, tris: info.triangles, groups, objs };
  };
  step('start (Low)', async c => {
    start('Low');
    c('running', await until(() => AV.running && AV.W && AV.W.id === 'ape_town', 180000), AV.W && AV.W.id);
    await sleep(4000);
    await measure('Ape Town Low', c);
  }, { shot: 'perf_ape_town' });
  step('Jerusalem', async c => {
    document.getElementById('err').textContent = '';
    AV.enterWorld('jerusalem', 'default', { instant: true }); await sleep(7000);
    c('world is jerusalem', AV.W && AV.W.id === 'jerusalem', AV.W && AV.W.id);
    c('no error banner', !$('err').textContent, $('err').textContent.slice(0, 200));
    const m = await measure('Jerusalem Low', c);
    c('only this world in the scene', m.groups <= 2, m.groups);
  }, { shot: 'perf_jerusalem' });
  step('Desert', async c => {
    document.getElementById('err').textContent = '';
    AV.enterWorld('judean_desert', 'default', { instant: true }); await sleep(7000);
    c('world is judean_desert', AV.W && AV.W.id === 'judean_desert', AV.W && AV.W.id);
    c('no error banner', !$('err').textContent, $('err').textContent.slice(0, 200));
    const m = await measure('Desert Low', c);
    c('only this world in the scene', m.groups <= 2, m.groups);
  }, { shot: 'perf_desert' });
  step('back to Ape Town (leak check)', async c => {
    AV.enterWorld('ape_town', 'default', { instant: true }); await sleep(6000);
    const m = await measure('Ape Town again', c);
    c('scene did not grow after 3 world changes', m.groups <= 2, 'groups ' + m.groups);
  }, { shot: 'perf_return' });
  return { steps };
})();