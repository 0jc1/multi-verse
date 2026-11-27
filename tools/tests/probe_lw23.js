/* 2.3 probe: dumps interactables, NPCs, homes and agents in Ape Town + Chiang Mai (design aid, not a pass/fail suite). */
window.APE_T = (() => {
  const steps = [], step = (name, fn) => steps.push({ name, fn }), sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const lbl = t => { try { return typeof t.label === 'function' ? t.label() : String(t.label) } catch (e) { return '?' } };
  step('boot', async c => { c('scripts', await until(() => window.AV && AV.boot && $('bNew').onclick, 120000)); $('gq').value = 'Low'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 60000)); await sleep(2500); AV.save = () => { };
    c('2.3 modules', !!(AV.LW && AV.convo && AV.mis && AV.LW.agency), ''); c('start money', AV.S.money === 10000, AV.S.money); c('errors', true, (window.__APE_ERRS || []).join(' | ')) });
  for (const w of ['ape_town', 'chiang_mai']) step('dump ' + w, async c => { if (AV.W.id !== w) { AV.travel(w); await until(() => AV.W && AV.W.id === w && $('fade').style.opacity === '0', 240000) } await sleep(3000); const W = AV.W;
    c('T', true, JSON.stringify(W.T.map(t => [Math.round(t.x), Math.round(t.z), t.npc ? '@' + t.npc.id : lbl(t).slice(0, 60)])));
    c('homes', true, JSON.stringify((W.places || []).filter(p => /^home_/.test(p.id)).map(p => [p.id, Math.round(p.x), Math.round(p.z)])) + ' · housing ' + JSON.stringify(AV.home.stats));
    c('agent', !!AV.npc.find(AV.LW.AGENTS[w].id), ''); c('spawn', true, JSON.stringify([AV.P.x, AV.P.z].map(Math.round)));
    c('errors', true, (window.__APE_ERRS || []).join(' | ')) });
  return { names() { return steps.map(s => s.name) }, async exec(i) { const s = steps[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: null } } };
})();
