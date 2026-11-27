/* 2.3 Milestone D - business coverage probe (owner rule: >= 40% of named businesses per major city must be really interactive).
   Businesses = named places whose name says business (shop, bar, café, market, hostel, gallery...) + registered storefronts
   (AV.storefront.list) + 2.3 stores, de-duplicated within 6 m.  Interactive = a working service interaction within 9 m of its front:
   a trigger whose label offers buying / ordering / renting / playing / working / browsing / a menu, or a staff character.
   Decorative signs and closed doors do not count.  The same rules run inside the game as AV.LW.bizCoverage() (lw_venues.js). */
window.APE_T = (() => {
  const steps = [], step = (name, fn) => steps.push({ name, fn }), sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(150) } return false };
  step('boot', async c => { c('scripts', await until(() => window.AV && AV.boot && $('bNew').onclick, 120000)); AV.saveKey = 'apeverse_test_probe'; $('gq').value = 'Low'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 60000)); await sleep(1500); AV.save = () => { }; window.__BIZ = {} });
  const CITIES = ['ape_town', 'chiang_mai', 'pai', 'koh_tao', 'da_nang', 'vienna', 'jerusalem', 'madrid', 'amsterdam', 'tokyo', 'paris', 'barcelona', 'sevilla', 'cadiz', 'oaxaca', 'chefchaouen', 'rio', 'astro9'];
  for (const id of CITIES) step(id, async c => { if (AV.W.id !== id) { AV.travel(id); c('loads', await until(() => AV.W && AV.W.id === id && $('fade').style.opacity === '0', 240000)) } await sleep(5000);
    const r = AV.LW.bizCoverage ? AV.LW.bizCoverage() : null; c('coverage', !!r && r.pctEnter >= 40, r ? JSON.stringify({ total: r.total, enterable: r.enterable, pctEnter: r.pctEnter, enterBefore: (AV.LW.interiorStats[id] || {}).before, built: (AV.LW.interiorStats[id] || {}).built, interactive: r.interactive, pct: r.pct, before: (AV.LW.venueStats[id] || {}).before, added: (AV.LW.venueStats[id] || {}).added, kinds: r.list.reduce((m, b) => (m[b.kind] = (m[b.kind] || 0) + 1, m), {}) }) : 'no AV.LW.bizCoverage'); if (!r) return; window.__BIZ[id] = r;
    c('not interactive', true, JSON.stringify(r.missing.slice(0, 80).map(b => [b.name.slice(0, 34), Math.round(b.x), Math.round(b.z), b.kind]))) });
  return { names() { return steps.map(s => s.name) }, async exec(i) { const s = steps[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: null } } };
})();
