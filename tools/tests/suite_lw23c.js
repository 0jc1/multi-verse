/* APEVERSE 2.3 MILESTONE C - mission density + reward loops.
   In Ape Town, Chiang Mai, Amsterdam, Tokyo, Oaxaca and Rio: the job board stands by the arrival point (trigger + ❗ marker), its
   panel lists the jobs, and each job type is played through its real interactions (taxi fares pay by distance, flyers, food rush
   with time-based tips, street gig where you must stay with the crowd). Then: the local-hero goal and its +20% pay perk, the daily
   hustle-streak bonus, and that every world has at least 9 missions.   run_tests.ps1 -Suite tools/tests/suite_lw23c.js -Gpu -Port 8102 -StepTimeout 900 */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const lbl = t => { try { return typeof t.label === 'function' ? t.label() : String(t.label) } catch (e) { return '' } };
  const put = (x, z) => { const P = AV.P; P.x = x; P.z = z; P.y = AV.W.surface(x, z) || 0; P.vx = P.vz = 0 };
  const say = a => Array.isArray(a) ? a[0] : String(a);
  const errs = () => (window.__APE_ERRS || []).filter(e => !/api\/mp\//.test(e));
  const spot = async id => { const p = AV.mis.where(id); if (!p) return 'no point'; put(p.x, p.z); await sleep(700); const T = AV.W.T.filter(t => Math.hypot(t.x - p.x, t.z - p.z) < 1 && !t.npc).pop(); if (!T) return 'no trigger at ' + JSON.stringify(p); const s0 = AV.mis.st().a[id] && AV.mis.st().a[id].s; T.fn(); await sleep(250); return '' };
  step('boot (sandboxed save)', async c => { c('page scripts loaded', await until(() => window.AV && AV.boot && $('bNew') && $('bNew').onclick, 120000)); window.__real = localStorage.getItem('apeverse_v09');
    AV.saveKey = 'apeverse_test_lw23c'; $('gq').value = 'Low'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 60000)); await sleep(1500); AV.S.time = 12 * 60; c('job boards defined', Object.keys(AV.LW.BOARDS).length >= 22, Object.keys(AV.LW.BOARDS).length) });
  for (const w of ['ape_town', 'chiang_mai', 'amsterdam', 'tokyo', 'oaxaca', 'rio']) step(w + ': job board + all job types', async c => { if (AV.W.id !== w) { AV.travel(w); c('loads', await until(() => AV.W && AV.W.id === w && settled(), 240000)) } await sleep(2000);
    const G = AV.LW.BOARDS[w]; c('board placed on walkable ground near the arrival', G.x != null && AV.W.surface(G.x, G.z) !== null, JSON.stringify([G.x, G.z]));
    const T = AV.W.T.find(t => /Job board|Tablón/.test(lbl(t))); c('board trigger', !!T); await sleep(700); c('❗ marker over the board', (AV.mis._marks || []).some(m => m.kind === 'give' && Math.hypot(m.x - G.x, m.z - G.z) < 1));
    put(T.x, T.z); T.fn(); await sleep(300); c('board panel lists the 5 jobs', ['Fares across town', 'Flyer the party', 'Hot food rush', 'Street gig', 'Local hero'].every(s => $('cmp').textContent.includes(s))); const take = document.querySelector('[data-take="' + w + '_taxi"]'); c('take a job from the board', !!take); take && take.click(); await sleep(300);
    let m0 = AV.S.money; c('taxi: 4 real stops picked', AV.mis.active(w + '_taxi') && AV.mis.st().a[w + '_taxi'].mv.pts.length === 4); for (let i = 0; i < 4; i++) { const e = await spot(w + '_taxi'); c('taxi stop ' + (i + 1), !e, e) }
    c('taxi: paid by distance', AV.mis.done(w + '_taxi') === 1 && AV.S.money > m0 + 69, AV.S.money - m0);
    AV.mis.start(w + '_flyers'); m0 = AV.S.money; for (let i = 0; i < 3; i++) { const e = await spot(w + '_flyers'); c('flyers ' + (i + 1), !e, e) } c('flyers paid', AV.mis.done(w + '_flyers') === 1 && AV.S.money >= m0 + 110, AV.S.money - m0);
    AV.mis.start(w + '_food'); m0 = AV.S.money; for (let i = 0; i < 2; i++) { const e = await spot(w + '_food'); c('food ' + (i + 1), !e, e) } c('fast food delivery: base + tip', AV.mis.done(w + '_food') === 1 && AV.S.money >= m0 + 150, AV.S.money - m0);
    AV.mis.start(w + '_busk'); m0 = AV.S.money; let e = await spot(w + '_busk'); c('gig spot', !e, e); const p = AV.mis.st().a[w + '_busk'].mv.pts[0]; { const q = AV.safeSpot(AV.W, p[0] + 30, p[1] + 30); put(q[0], q[1]) } await sleep(2500); c('walking away: no progress', (AV.mis.st().a[w + '_busk'].mv.play || 0) < .5);
    put(p[0], p[1]); c('staying with the crowd 20 s: gig done + tips', await until(() => AV.mis.done(w + '_busk') === 1, 30000) && AV.S.money > m0 + 59, AV.S.money - m0);
    c('no repeat of a daily job the same day', !AV.mis.available(w + '_taxi')); c('no JS errors', !errs().length, errs().slice(-3).join(' | ')) }, { shot: 'lw_c_' + w });
  step('local hero + hustle streak', async c => { const w = AV.W.id; c('hustle streak paid (every 3rd mission in a day)', AV.S.log.filter(l => l.t === 'Daily hustle streak').length >= 5, AV.S.log.filter(l => l.t === 'Daily hustle streak').length);
    AV.mis.start(w + '_courier'); await spot(w + '_courier'); AV.S.day++; AV.mis.start(w + '_flyers'); for (let i = 0; i < 3; i++) await spot(w + '_flyers'); c('6 missions done here (taxi, flyers ×2, food, gig, courier)', AV.LW.doneIn(w) >= 6, AV.LW.doneIn(w));
    AV.mis.start(w + '_hero'); c('local hero completes after 6 missions here', await until(() => AV.mis.done(w + '_hero') === 1, 3000), AV.LW.doneIn(w)); c('perk: jobs here pay 20% more', (AV.LW.st().perks || {})[w] === 'hero');
    AV.S.day++; const m0 = AV.S.money; AV.mis.start(w + '_flyers'); for (let i = 0; i < 3; i++) await spot(w + '_flyers'); c('flyers now pay 132 (110 × 1.2)', AV.S.money - m0 === 132 || AV.S.money - m0 === 282, AV.S.money - m0) });
  step("What's Happening? phone app", async c => { AV.travel('ape_town'); await until(() => AV.W && AV.W.id === 'ape_town' && settled(), 240000); await sleep(2000); AV.S.time = 14 * 60;
    AV.phone.home(); await sleep(300); const b = document.querySelector('[data-app="happening"]'); c('🔥 app on the phone home screen', !!b); b && b.click(); await sleep(400);
    const rows = AV.LW.happening(); c('feed has missions, jobs, a concert, properties', rows.some(r => /Mission|Misión/.test(say(r.kind))) && rows.some(r => /Job/.test(say(r.kind))) && rows.some(r => r.ic === '🎸') && rows.some(r => r.ic === '🏠'), rows.length);
    c('three time tabs (now / later today / coming days)', ['now', 'tonight', 'later'].every(k => document.querySelector('[data-ht="' + k + '"]')));
    c('festivals in the coming days', rows.some(r => r.ic === '🎪' && r.when === 'later'), rows.filter(r => r.ic === '🎪').map(r => r.when + ':' + r.t).slice(0, 4).join(' | '));
    AV.LW.aff('zil', 3); const inv = AV.LW.happening().find(r => r.npc === 'zil'); c('friend invitation appears once affinity is high', !!inv, inv && inv.sub);
    const go = [...document.querySelectorAll('[data-go]')].find(b => +b.dataset.dist >= 4); c('a row with a GPS button', !!go); go && go.click(); await sleep(300); c('GPS route set from the app', !!AV.minimap.dest, JSON.stringify({ d: go && go.dataset.dist, row: go && go.parentNode.parentNode.textContent.slice(0, 80), toast: $('toast').textContent, P: [AV.P.x, AV.P.z].map(Math.round) }));
    AV.LW.happeningApp('now'); await sleep(200); const tv = document.querySelector('[data-tv]'); c('rows in other worlds offer travel', !!tv); tv && tv.click(); c('travel works from the app', await until(() => AV.W && AV.W.id !== 'ape_town' && settled(), 240000), AV.W.id) }, { shot: 'lw_c_happening' });
  step('coverage', async c => { const per = {}; for (const id in AV.mis.defs) { const w = AV.mis.defs[id].w; per[w] = (per[w] || 0) + 1 } c('every 2.3 world has at least 9 missions', Object.keys(AV.LW.BOARDS).every(w => per[w] >= 9), JSON.stringify(per)); c('total missions', Object.keys(AV.mis.defs).length >= 200, Object.keys(AV.mis.defs).length);
    c("player's real save untouched", localStorage.getItem('apeverse_v09') === window.__real); try { localStorage.removeItem('apeverse_test_lw23c'); localStorage.removeItem('apeverse_test_lw23c_bak') } catch (e) { } });
  return { names() { return steps.map(s => s.name) }, async exec(i) { const s = steps[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
