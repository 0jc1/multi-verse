/* APEVERSE 2.1: owned vehicles in more worlds (garage.js dealers). Per world: the dealer lot builds (local sign), you buy the
   headline vehicle at the counter (credits debited, owned, parked in that world), get on, drive it under throttle, park it.
   Then portal freight: an owned scooter is shipped to another world that allows it, a car is refused where cars don't belong.
   Sandboxed save -> loadSave keeps every owned vehicle with its world.  run_tests.ps1 -Suite tools/tests/suite_dealers.js -Gpu */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const G = () => AV.garage, P = () => AV.P, R = window.__dealers = {};
  const go = async id => { AV.S.time = 12 * 60; AV.travel(id); const ok = await until(() => AV.W && AV.W.id === id && settled(), 240000); await sleep(2500); return ok };
  step('boot', async c => { $('gq').value = 'Medium'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); await sleep(1500); window.__realSave = window.__realSave || AV.save; AV.save = () => { }; AV.S.money = 9000; c('garage', !!AV.garage && !!AV.garage.ship) });
  for (const [wid, kind] of [['chiang_mai', 'scooter'], ['pai', 'scooter'], ['koh_tao', 'scooter'], ['da_nang', 'scooter'], ['astro9', 'hoverbike'], ['vienna', 'woblr']]) step('dealer + buy + drive: ' + wid, async c => {
    c('loads', await go(wid)); const dl = G().dealers[wid]; c('dealer lot built', dl && dl.ok, dl && dl.D && dl.D.id); if (!dl || !dl.ok) return; R[wid] = {};
    const p = P(); p.x = dl.counter[0]; p.z = dl.counter[1]; p.y = AV.W.surface(p.x, p.z) || 0; G().panel(wid); await sleep(400); const b = document.querySelector('#cmp [data-buy="' + kind + '"]'); c('for sale: ' + kind, !!b); if (!b) return;
    const m0 = AV.S.money, n0 = G().owned().length; b.click(); await sleep(600); const rec = G().owned().find(r => r.kind === kind && r.w === wid && !R.used?.includes(r)); c('bought + owned in ' + wid, !!rec && G().owned().length === n0 + 1 && AV.S.money < m0, (m0 - AV.S.money) + ' credits'); AV.closePanel('cmp'); if (!rec) return; (R.used = R.used || []).push(rec);
    const x0 = rec.x, z0 = rec.z; p.x = rec.x + 1; p.z = rec.z + 1; AV.veh.ride(rec); await sleep(800); c('riding', AV.act.cur && AV.act.cur.id === 'ride');
    let best = 0; for (const yaw of [rec.yaw, rec.yaw + Math.PI / 2, rec.yaw - Math.PI / 2, rec.yaw + Math.PI]) { p.yaw = yaw; const sx = p.x, sz = p.z; AV.keys.KeyW = 1; await sleep(2500); AV.keys.KeyW = 0; await sleep(900); best = Math.max(best, Math.hypot(p.x - sx, p.z - sz)); if (best > 6) break }
    c('drives (moved under throttle)', best > 6, best.toFixed(1) + ' m'); AV.act.end('leave'); await sleep(600); const r2 = G().owned().find(r => r === rec); c('parked where you left it', r2 && Math.hypot(r2.x - x0, r2.z - z0) > 4 && r2.w === wid, r2 && r2.x.toFixed(1) + ',' + r2.z.toFixed(1));
    const L = dl.lot, cs = Math.cos(L.ry), sn = Math.sin(L.ry); p.x = L.x + 9 * sn; p.z = L.z + 9 * cs; p.y = AV.W.surface(p.x, p.z) || 0; p.yaw = Math.atan2(-(L.x - p.x), -(L.z - p.z)); p.pitch = .05; await sleep(1200) }, { shot: 'dealer_' + wid });
  step('portal freight: ship the Chiang Mai scooter to Astro-9; a car is refused on Koh Tao', async c => { await go('astro9'); const sc = G().owned().find(r => r.w === 'chiang_mai' && r.kind === 'scooter'); c('scooter owned in Chiang Mai', !!sc); if (!sc) return;
    const m0 = AV.S.money; c('shipped (scooters are allowed on Astro-9)', G().ship(sc) && sc.w === 'astro9' && m0 - AV.S.money === G().SHIP, sc.w);
    AV.veh.ride(sc); await sleep(700); c('ride it here', AV.act.cur && AV.act.cur.id === 'ride'); AV.act.end('leave'); await sleep(400);
    await go('koh_tao'); const car = G().owned().find(r => r.kind === 'woblr'); c('Zip-EV owned', !!car); c('refused on Koh Tao (no cars on its lanes)', car && !G().ship(car) && car.w === 'vienna');
    G().panel(); await sleep(400); c('panel explains why', /not allowed in this world/.test($('cmp').textContent)); AV.closePanel('cmp');
    await go('madrid'); c('shipped to Madrid', G().ship(car) && car.w === 'madrid') });
  step('save -> loadSave roundtrip (sandbox)', async c => { const K = 'apeverse_test_dealers', real = localStorage.getItem('apeverse_v09'); AV.saveKey = K; AV._bakFor = null; localStorage.removeItem(K); window.__realSave(); const L = AV.loadSave(), list = L && L.s.veh.list.filter(r => r.owned);
    c('owned vehicles kept with their worlds', list && list.length >= 6 && ['pai', 'koh_tao', 'da_nang', 'astro9', 'madrid'].every(w => list.some(r => r.w === w)), list && list.map(r => r.kind + '@' + r.w).join(' '));
    localStorage.removeItem(K); localStorage.removeItem(K + '_bak'); AV.saveKey = 'apeverse_v09'; AV._bakFor = null; c("player's real save untouched", localStorage.getItem('apeverse_v09') === real) });
  step('no JS errors', async c => c('clean', !$('err').textContent, $('err').textContent));
  let active = steps;
  return { names() { active = steps; return steps.map(s => s.name) }, async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
