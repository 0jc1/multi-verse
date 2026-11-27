/* APEVERSE 2.3 MILESTONE B (first pass) - missions exist and work in every world.
   For each of 21 worlds: the mission giver is present (a new local host or an existing character), 4 missions are defined, the
   discovery walk is offered, accepted and played (walk to the 3 real places, then the talk), and a timed courier run is completed
   through its on-the-spot hand-over interaction.  Then the coverage table.   run_tests.ps1 -Suite tools/tests/suite_lw23b.js -Gpu -Port 8102 -StepTimeout 900 */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const lbl = t => { try { return typeof t.label === 'function' ? t.label() : String(t.label) } catch (e) { return '' } };
  const put = (x, z) => { const P = AV.P; P.x = x; P.z = z; P.y = AV.W.surface(x, z) || 0; P.vx = P.vz = 0 };
  const errs = () => (window.__APE_ERRS || []).filter(e => !/api\/mp\//.test(e));
  const WORLDS = ['verdalux', 'astro9', 'jungle_dub', 'pai', 'koh_tao', 'koh_samui_jurassic', 'da_nang', 'vienna', 'jerusalem', 'judean_desert', 'madrid', 'amsterdam', 'tokyo', 'paris', 'barcelona', 'sevilla', 'cadiz', 'oaxaca', 'chefchaouen', 'rio'];
  step('boot (sandboxed save)', async c => { c('page scripts loaded', await until(() => window.AV && AV.boot && $('bNew') && $('bNew').onclick, 120000)); window.__real = localStorage.getItem('apeverse_v09');
    AV.saveKey = 'apeverse_test_lw23b'; $('gq').value = 'Low'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 60000)); await sleep(1500); AV.S.time = 11 * 60; c('content B loaded', !!(AV.LW.worlds2 && Object.keys(AV.LW.worlds2).length >= 20), Object.keys(AV.LW.worlds2 || {}).length) });
  for (const w of WORLDS) step(w + ': giver, tour, courier', async c => { AV.travel(w); c('loads', await until(() => AV.W && AV.W.id === w && settled(), 240000)); await sleep(2000); const D = AV.LW.worlds2[w], g = D.host.id;
    const n = AV.npc.find(g); c('mission giver present (' + g + ')', !!n); c('4 missions defined', ['tour', 'photo', 'courier', 'favour'].every(k => AV.mis.defs[w + '_' + k]));
    c('discovery walk offered by the giver', AV.mis.offersFor(g).some(d => d.id === w + '_tour'), AV.mis.offersFor(g).map(d => d.id).join(','));
    if (n) { put(n.g.position.x + 1.5, n.g.position.z + 1.5); await sleep(200) }
    c('offer talk opens', AV.mis.offer(w + '_tour') && !!AV.convo.cur); AV.convo.pick(/in\.|Deal|Me apunto/); await sleep(200); c('tour active', AV.mis.active(w + '_tour'));
    for (let i = 0; i < 3; i++) { const p = AV.mis.where(w + '_tour'); c('stop ' + (i + 1) + ' resolves to a real place', !!p, JSON.stringify(p)); if (!p) break; put(p.x, p.z); c('stop ' + (i + 1) + ' reached', await until(() => AV.mis.st().a[w + '_tour'] && AV.mis.st().a[w + '_tour'].s > i, 4000), JSON.stringify([Math.round(p.x), Math.round(p.z), AV.W.surface(p.x, p.z)])) }
    if (n) put(n.g.position.x + 1.5, n.g.position.z + 1.5); const m0 = AV.S.money; AV.mis.talkStage(w + '_tour'); await sleep(200); AV.convo.pick(/Loved it/); c('tour complete + paid 120', await until(() => AV.mis.done(w + '_tour') === 1, 3000) && (AV.S.money - m0 === 120 || AV.S.money - m0 === 270), AV.S.money - m0);
    c('photo + favour unlocked', AV.mis.available(w + '_photo') && AV.mis.available(w + '_favour'));
    AV.mis.start(w + '_courier'); await sleep(400); const q = AV.mis.where(w + '_courier'); c('courier destination resolves', !!q); if (q) { put(q.x, q.z); await sleep(700); const T = AV.W.T.find(t => /Hand over the parcel/.test(lbl(t))); c('hand-over interaction appears at the destination', !!T); const m1 = AV.S.money; T && T.fn(); c('courier done + paid', await until(() => AV.mis.done(w + '_courier') === 1, 2000) && AV.S.money > m1, AV.S.money - m1) }
    c('no new JS errors', !errs().length, errs().slice(-3).join(' | ')) }, { shot: 'lw_b_' + w });
  step('coverage', async c => { const per = {}; for (const id in AV.mis.defs) { const w = AV.mis.defs[id].w; per[w] = (per[w] || 0) + 1 } c('every world has 2.3 missions', WORLDS.concat(['ape_town', 'chiang_mai']).every(w => per[w] >= 4), JSON.stringify(per)); c("player's real save untouched", localStorage.getItem('apeverse_v09') === window.__real);
    try { localStorage.removeItem('apeverse_test_lw23b'); localStorage.removeItem('apeverse_test_lw23b_bak') } catch (e) { } });
  return { names() { return steps.map(s => s.name) }, async exec(i) { const s = steps[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
