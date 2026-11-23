/* call a world build directly with a minimal context so the error + stack come back as data */
window.APE_T = (() => {
  const steps = [], step = (n, fn) => steps.push({ name: n, fn });
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const mkctx = (id, q) => {
    const group = new THREE.Group(); AV.scene.add(group);
    const ctx = { id, group, q: q == null ? 2 : q, cols: [], circles: [], T: [], upd: [], leave: [], rng: AV.rng(7), seed: 7 };
    ctx.mk = (g, m, x, y, z, sx, sy, sz, sh) => AV.mk(g, m, x, y, z, sx, sy, sz, group, sh);
    ctx.sign = (txt, x, y, z, ry, w, col, o) => AV.kit.sign(ctx, txt, x, y, z, ry, w, col, o);
    return ctx;
  };
  step('loaded?', async c => {
    await sleep(6000);
    c('worldDefs keys: ' + Object.keys(AV.worldDefs).join(','), true);
    c('jerusalem registered', !!AV.worldDefs.jerusalem);
    c('desert registered', !!AV.worldDefs.judean_desert);
  });
  step('build jerusalem', async c => {
    let err = '';
    try { AV.worldDefs.jerusalem.build(mkctx('jerusalem')); } catch (e) { err = (e && e.stack || String(e)).slice(0, 1400) }
    c('jerusalem builds', !err, err);
  });
  step('build judean_desert', async c => {
    let err = '';
    try { AV.worldDefs.judean_desert.build(mkctx('judean_desert')); } catch (e) { err = (e && e.stack || String(e)).slice(0, 1400) }
    c('judean_desert builds', !err, err);
  });
  return { steps };
})();