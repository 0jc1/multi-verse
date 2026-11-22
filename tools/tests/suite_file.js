/* file:// (double-click) smoke test: run with  run_tests.ps1 -FileMode -Suite tools\tests\suite_file.js */
window.APE_T = (() => {
  const sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (f, m) => { const t = Date.now(); while (Date.now() - t < m) { try { if (f()) return true } catch (e) { } await sleep(150) } return false };
  const steps = [{ name: 'file:// boot', fn: async c => {
    c('opened from file://', AV.isFile, 'probe: pipe=' + typeof AV.pipe + ' exhale=' + typeof (AV.pipe && AV.pipe.exhale) + ' summon=' + typeof (AV.pipe && AV.pipe.summon) + ' show=' + typeof (AV.pipe && AV.pipe.show) + ' smokeAlive=' + typeof (AV.pipe && AV.pipe.smokeAlive) + ' npc=' + typeof AV.npc + ' quests=' + typeof AV.quests + ' media=' + typeof AV.media + ' assets=' + typeof AV.assets + ' kit=' + typeof AV.kit + ' GLTF=' + typeof THREE.GLTFLoader + ' worlds=' + Object.keys(AV.worldDefs).join(',')); c('scripts loaded without errors', (window.__APE_ERRS || []).length === 0 && !!AV.pipe && !!AV.npc, (window.__APE_ERRS || []).join(' | '));
    $('gq').value = 'Medium'; $('bNew').click(); c('Ape Town loads', await until(() => AV.W && AV.W.id === 'ape_town', 15000)); await sleep(1500);
    const s = AV.media.screens[0]; AV.P.x = s.x + s.nx * 12; AV.P.z = s.z + s.nz * 12; await sleep(1500);
    c('cinema screen stays idle on file:// (no tainted video texture)', !s.video && s.state === 'idle');
    AV.media.openCinema(); c('cinema falls back to the pop-up player', $('cinema').style.display === 'block' && !!$('cv') && $('cv').style.display !== 'none'); AV.media.closeCinema();
    AV.keymap.KeyP(); await sleep(600); c('Portal Pipe opens', $('pipe').style.display === 'block'); AV.pipe.hide();
    AV.openChat('zil'); await AV.chatSend('hello'); c('NPC chat works', $('log').children.length >= 3); AV.closeChat();
    c('no JS errors on file://', (window.__APE_ERRS || []).length === 0, (window.__APE_ERRS || []).join(' | '));
  }, shot: 'file_mode' }];
  return { names: () => steps.map(s => s.name), async exec(i) { const checks = []; try { await steps[i].fn((n, p, d) => checks.push({ n, pass: !!p, d: d == null ? '' : String(d) })) } catch (e) { checks.push({ n: 'exception', pass: false, d: String(e) + ' | page errors: ' + (window.__APE_ERRS || []).join(' | ') }) } return { checks, shot: steps[i].shot } } };
})();
