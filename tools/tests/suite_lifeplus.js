/* APEVERSE 2.1 corrective pass, Milestone B: NPC realism.  No camping / squatting scenes in the cities (no Wandering Market campfire,
   no stoners loitering at arrival points), ordinary city life instead (errands into real businesses, friends chatting, a queue),
   and the village market still works (picnic table instead of a campfire; the crew goes home at night).
   run_tests.ps1 -Suite tools/tests/suite_lifeplus.js -Gpu */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(150) } return false };
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const stoners = () => { const ids = AV.stoners.profiles.map(p => p.id); return AV.W.T.filter(t => t.npc && ids.includes(t.npc.id)).map(t => t.npc) };
  const sample = async s => { let n = 0, on = true; const f = () => { n++; if (on) requestAnimationFrame(f) }; requestAnimationFrame(f); await sleep(s * 1000); on = false; return +(n / s).toFixed(1) };
  const R = window.__life = {};
  step('boot', async c => { $('gq').value = 'Medium'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 60000)); await sleep(1500); AV.save = () => { } });
  for (const [id, view] of [['madrid', null], ['chiang_mai', [18, 46, 0]], ['vienna', null], ['amsterdam', [0, -40, Math.PI]], ['astro9', null]]) step('city life: ' + id, async c => {
    AV.S.time = 12 * 60; AV.travel(id); c('loads', await until(() => AV.W && AV.W.id === id && settled(), 240000)); await sleep(3500); const W = AV.W;
    c('no Wandering Market camp in the city', !W.market, W.market ? 'market at ' + W.market.c.x.toFixed(0) + ',' + W.market.c.z.toFixed(0) : '');
    const st = AV.lifePlus.stats[id]; c('ordinary city life added (errands, chats)', st && st.errands >= 4 && st.chats >= 1, JSON.stringify(st) + (AV.lifePlus.stats.err || ''));
    c('people go into businesses (an errand walker steps inside)', await until(() => AV.lifePlus.errands.some(w => w.inside), 45000), AV.lifePlus.errands.length + ' walkers');
    const sn = stoners(); c('stoners only as regulars of a smoking venue (or none)', sn.length <= (AV.stoners.lastVenues || 0) * 1 && sn.length <= 2, sn.length + ' stoners · ' + (AV.stoners.lastVenues || 0) + ' venues');
    if (view) { AV.P.x = view[0]; AV.P.z = view[1]; AV.P.y = W.surface(view[0], view[1]) || 0; AV.P.yaw = view[2] } await sleep(1500); R[id] = await sample(2.5); c('frame (Medium)', true, R[id] + ' fps')
  }, { shot: 'life_' + id });
  step('village market (Ape Town): picnic table, no campfire; the crew goes home at night', async c => {
    AV.S.time = 12 * 60; AV.travel('ape_town'); c('loads', await until(() => AV.W && AV.W.id === 'ape_town' && settled(), 240000)); await sleep(3000); const S = AV.W.market;
    c('market still built in Ape Town', !!S && AV.npc.brains().length >= 4, S ? AV.npc.brains().length + ' workers' : 'none'); if (!S) return;
    c('no campfire (no flames, no fire light)', S.camp.flames.length === 0 && !S.camp.light);
    AV.P.x = S.c.x + 20; AV.P.z = S.c.z + 20; AV.S.time = 30; const crew = AV.npc.brains().filter(b => b.id !== 'bix');
    c('at night the crew goes home (hidden, not sleeping rough)', await until(() => crew.every(b => b.fsm.state === 'sleep' && b.fsm.data.at && !b.n.g.visible), 90000), crew.map(b => b.id + ':' + b.fsm.state + (b.n.g.visible ? '(visible)' : '')).join(' '));
    AV.S.time = 8 * 60; c('they come back in the morning', await until(() => crew.every(b => b.n.g.visible && b.fsm.state !== 'sleep'), 60000)); AV.S.time = 12 * 60;
    AV.P.x = S.camp.x + 5; AV.P.z = S.camp.z + 5; AV.P.yaw = Math.atan2(-(S.camp.x - AV.P.x), -(S.camp.z - AV.P.z)); AV.P.pitch = -.2; await sleep(1500) }, { shot: 'life_market' });
  step('summary', async c => c('fps', true, JSON.stringify(R)));
  step('no JS errors', async c => c('clean', !$('err').textContent, $('err').textContent));
  let active = steps;
  return { names() { active = steps; return steps.map(s => s.name) }, async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
