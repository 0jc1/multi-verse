/* probe: which worlds registered, what errors happened, what is in the scene */
window.APE_T = (() => {
  const steps = [], step = (n, fn) => steps.push({ name: n, fn });
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  step('probe', async c => {
    await sleep(1000);
    c('worldDefs: ' + Object.keys(AV.worldDefs).join(','), Object.keys(AV.worldDefs).length > 0);
    c('isPlayable jerusalem', AV.isPlayable('jerusalem'));
    c('isPlayable judean_desert', AV.isPlayable('judean_desert'));
    c('typeof AV.chars.regional', !!AV.chars.regional);
    c('typeof AV.registerWorld', typeof AV.registerWorld);
    c('scene children', AV.scene.children.length, 'groups ' + AV.scene.children.filter(o => o.isGroup).length);
    c('WORLDS_DATA len', (AV.WORLDS_DATA || []).length);
    const errs = window.__errs || [];
    c('errors: ' + errs.slice(0, 6).join(' | ').slice(0, 400), errs.length === 0);
  });
  return { steps };
})();