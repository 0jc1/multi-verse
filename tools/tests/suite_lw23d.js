/* APEVERSE 2.3 MILESTONE D - businesses you can use + real serving + legality + recorded spatial ambience.
   Per city (Madrid, Amsterdam, Tokyo, Vienna, Rio, Chiang Mai): >= 40% of named businesses interactive (AV.LW.bizCoverage), an order at
   a venue counter is prepared, served into your hand and consumed; Amsterdam coffeeshops sell cannabis, Madrid's menus never do; gallery
   tickets and hostel naps work; recorded street bed + place emitters + recorded pass-bys play (CC0 / public-domain recordings).
   run_tests.ps1 -Suite tools/tests/suite_lw23d.js -Gpu -Port 8102 -StepTimeout 900 */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const go = async id => { if (AV.W && AV.W.id === id) return true; AV.travel(id); return until(() => AV.W && AV.W.id === id && settled(), 240000) };
  const put = (x, z) => { const P = AV.P; P.x = x; P.z = z; P.y = AV.W.surface(x, z) || 0; P.vx = P.vz = 0 };
  const errs = () => (window.__APE_ERRS || []).filter(e => !/api\/mp\//.test(e));
  const order = async (c, w, kinds) => { const T = AV.W.T.find(t => t.lwVenue && kinds.includes(t.lwVenue.kind)); c(w + ': a venue counter (' + kinds.join('/') + ')', !!T); if (!T) return; put(T.x, T.z); AV.S.money = Math.max(AV.S.money, 500); T.fn(); await sleep(300);
    const b = document.querySelector('[data-vb]'); c(w + ': local menu', !!b, $('cmp').textContent.slice(0, 120)); if (!b) return; const id = b.dataset.vb, it = AV.ITEMS[id], m0 = AV.S.money, n0 = AV.bag.count(id); b.click(); await sleep(150); c(w + ': paid', AV.S.money < m0);
    c(w + ': prepared then served into your hand', await until(() => AV.bag.count(id) === n0 + 1 && (it.keep || AV.bag.held().id === id), 4000), id);
    if (!it.keep) { let k = 0; for (; k < 300 && AV.bag.count(id) > n0; k++) { if (!AV.bag.busy()) AV.bag.use(id); await sleep(120) } c(w + ': consumed bit by bit', AV.bag.count(id) === n0, say(it.n)) } };
  const say = a => Array.isArray(a) ? a[0] : String(a);
  step('boot (sandboxed save)', async c => { c('page scripts loaded', await until(() => window.AV && AV.boot && $('bNew') && $('bNew').onclick, 120000)); window.__real = localStorage.getItem('apeverse_v09');
    AV.saveKey = 'apeverse_test_lw23d'; $('gq').value = 'Low'; $('mus').checked = true; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 60000)); await sleep(1500); AV.S.time = 13 * 60; c('venue kit loaded', !!(AV.LW.bizCoverage && AV.LW.venueCounter)) });
  for (const [w, kinds] of [['madrid', ['bar', 'cafe', 'food', 'restaurant']], ['amsterdam', ['cafe', 'food', 'bar', 'bakery']], ['tokyo', ['food', 'bar', 'cafe']], ['vienna', ['cafe', 'bakery', 'food', 'bar']], ['rio', ['bar', 'restaurant', 'cafe']], ['chiang_mai', ['food', 'bar', 'cafe']]])
    step(w + ': coverage + order a meal / drink', async c => { c('loads', await go(w)); await sleep(2500); const r = AV.LW.bizCoverage(); c('>= 40% of named businesses interactive', r.pct >= 40, r.interactive + '/' + r.total + ' = ' + r.pct + '% (before the venue kit ' + ((AV.LW.venueStats[w] || {}).before) + '%)'); await order(c, w, kinds); AV.closePanel('cmp') }, { shot: 'lw_d_' + w });
  step('legality by world (fictional rules)', async c => { c('Amsterdam coffeeshop menu sells cannabis', AV.LW.menuFor('canna', 'amsterdam').some(r => r[0] === 'pre')); c('Chiang Mai dispensary menu sells cannabis', AV.LW.menuFor('canna', 'chiang_mai').some(r => r[0] === 'pre'));
    for (const w of ['madrid', 'vienna', 'tokyo', 'paris', 'rio']) c(w + ': no cannabis on any menu', !['cafe', 'bar', 'food', 'restaurant', 'shop', 'canna'].some(k => AV.LW.menuFor(k, w).some(r => ['pre', 'herb'].includes(r[0])))) });
  step('gallery ticket + hostel nap', async c => { c('Amsterdam', await go('amsterdam')); await sleep(2000); const g = AV.W.T.find(t => t.lwVenue && t.lwVenue.kind === 'gallery'); c('a gallery counter', !!g); if (g) { put(g.x, g.z); g.fn(); await sleep(250); const m0 = AV.S.money, r0 = AV.LW.rep('amsterdam'); $('lwGal').click(); c('ticket paid, reputation + vibe', AV.S.money === m0 - 8 && AV.LW.rep('amsterdam') > r0) }
    const h = AV.W.T.find(t => t.lwVenue && t.lwVenue.kind === 'hostel'); c('a hostel reception', !!h); if (h) { put(h.x, h.z); h.fn(); await sleep(250); const t0 = AV.S.time, d0 = AV.S.day; $('lwNap').click(); c('a 2-hour nap', (AV.S.day - d0) * 1440 + AV.S.time - t0 === 120) } });
  step('recorded spatial ambience', async c => { const SC = AV.LW.scape; c('audio running', !!(AV.audio && AV.audio.ok)); c('recordings decoded', await until(() => SC.stats.loaded >= 12, 30000), SC.stats.loaded + ' loaded, ' + SC.stats.failed + ' failed');
    AV.S.time = 12 * 60; c('Madrid', await go('madrid')); await sleep(2500); const mk = (AV.W.places || []).find(p => AV.LW.scape.classify(p) === 'cafe' || AV.LW.scape.classify(p) === 'market'); c('a café / market place', !!mk); if (mk) { put(mk.x + 3, mk.z + 3); c('its recording plays from its position (panner emitter)', await until(() => AV.LW.scape.live().length > 0, 6000), JSON.stringify(AV.LW.scape.live())) }
    c('street bed playing outdoors in a city', await until(() => SC.stats.bed, 6000)); const p0 = SC.stats.passes; c('recorded vehicles pass by', await until(() => SC.stats.passes > p0, 40000), SC.stats.passes);
    c('no JS errors', !errs().length, errs().slice(-3).join(' | ')); c("player's real save untouched", localStorage.getItem('apeverse_v09') === window.__real); try { localStorage.removeItem('apeverse_test_lw23d'); localStorage.removeItem('apeverse_test_lw23d_bak') } catch (e) { } });
  return { names() { return steps.map(s => s.name) }, async exec(i) { const s = steps[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
