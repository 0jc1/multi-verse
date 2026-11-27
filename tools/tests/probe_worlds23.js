/* 2.3 probe (design aid): for every registered world, the talkable characters (id, name, position), named places and interactables.
   Output is the check detail (JSON); window.__W23 keeps it.  run_tests.ps1 -Suite tools/tests/probe_worlds23.js -Gpu -Port 8102 -StepTimeout 900 */
window.APE_T = (() => {
  const steps = [], step = (name, fn) => steps.push({ name, fn }), sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(150) } return false };
  const lbl = t => { try { return typeof t.label === 'function' ? t.label() : String(t.label) } catch (e) { return '?' } };
  step('boot', async c => { c('scripts', await until(() => window.AV && AV.boot && $('bNew').onclick, 120000)); AV.saveKey = 'apeverse_test_probe'; $('gq').value = 'Low'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 60000)); await sleep(1500); AV.save = () => { }; window.__W23 = {} });
  const ids = ['ape_town', 'verdalux', 'astro9', 'jungle_dub', 'chiang_mai', 'pai', 'koh_tao', 'koh_samui_jurassic', 'da_nang', 'nimbus', 'vienna', 'jerusalem', 'judean_desert', 'madrid', 'amsterdam', 'tokyo', 'paris', 'barcelona', 'sevilla', 'cadiz', 'oaxaca', 'chefchaouen', 'rio'];
  for (const id of ids) step(id, async c => { if (!AV.worldDefs[id]) { c('registered', false, 'missing'); return } if (AV.W.id !== id) { AV.travel(id); c('loads', await until(() => AV.W && AV.W.id === id && $('fade').style.opacity === '0', 240000)) } await sleep(2500); const W = AV.W;
    const npcs = W.T.filter(t => t.npc).map(t => [t.npc.id, (AV.NPCS[t.npc.id] || {}).name || '', Math.round(t.npc.g.position.x), Math.round(t.npc.g.position.z)]);
    const other = W.T.filter(t => !t.npc).map(t => [Math.round(t.x), Math.round(t.z), lbl(t).slice(0, 48)]);
    const places = (W.places || []).map(p => [p.id, (p.name && p.name[0]) || '', Math.round(p.x), Math.round(p.z)]);
    window.__W23[id] = { npcs, places, n: W.T.length, spawn: [Math.round(AV.P.x), Math.round(AV.P.z)] };
    c('npcs', true, JSON.stringify(npcs)); c('places', true, JSON.stringify(places)); c('T', true, JSON.stringify(other.slice(0, 140))); c('spawn', true, JSON.stringify(window.__W23[id].spawn)) });
  return { names() { return steps.map(s => s.name) }, async exec(i) { const s = steps[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: null } } };
})();
