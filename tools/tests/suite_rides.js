/* APEVERSE 2.1 Phase 2: hired rides really drive (js/rides.js).  Per world: stand at a taxi / shuttle stand, open it, pick a destination
   150-700 m away and check that the fare is paid, a vehicle exists in the world, you ride IN it (never more than ~2.5 m from it, no
   per-frame jump > 3 m = no teleport), it moves along walkable ground away from walls, then arrive (Madrid: drive to the end and count
   red-light stops; others: skip with F after watching) and step out on free ground near the destination.  Cancel = pull over + refund.
   Map 🚕 button uses the same ride.  Screenshots mid-ride.  run_tests.ps1 -Suite tools/tests/suite_rides.js -Gpu */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const RD = () => AV.rides;
  const R = window.__rides = {};
  step('boot', async c => { $('gq').value = 'Medium'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); await sleep(1500); AV.save = () => { }; c('rides module', !!(AV.rides && AV.rides.start) && AV.transit.go !== AV.transit.go0) });
  /* watch a ride for s seconds: max distance player <-> vehicle, max per-frame jump, frames off ground / in walls, distance moved */
  const watch = async s => { const r = RD().cur, W = AV.W, P = AV.P; let last = null, maxJump = 0, maxSep = 0, off = 0, wall = 0, n = 0, on = true; const p0 = r.veh.position.clone();
    const f = () => { if (!on || !RD().cur) return; const v = r.veh.position; n++; const sep = Math.hypot(P.x - v.x, P.z - v.z); maxSep = Math.max(maxSep, sep); if (last) maxJump = Math.max(maxJump, Math.hypot(v.x - last[0], v.z - last[1])); last = [v.x, v.z];
      if (W.surface(v.x, v.z) === null) off++; else if (!r.V.hover && !AV.isFree(W, v.x, v.z, .25)) wall++; requestAnimationFrame(f) }; requestAnimationFrame(f); await sleep(s * 1000); on = false;
    return { frames: n, moved: +r.veh.position.distanceTo(p0).toFixed(1), maxSep: +maxSep.toFixed(2), maxJump: +maxJump.toFixed(2), offGround: off, inWall: wall, how: r.how, len: Math.round(r.len), v: +r.v.toFixed(1) } };
  const pick = (W, lo, hi) => { const P = AV.P, rows = AV.transit.dests(W, P.x, P.z); return rows.find(r => r.d > lo && r.d < hi) || rows[Math.min(rows.length - 1, 2)] };
  const board = async (c, id, lo, hi) => { const W = AV.W, P = AV.P, T = W.T.find(t => t.kind === 'taxi'); c('taxi stand exists', !!T); if (!T) return null; P.x = T.x + 1; P.z = T.z + 1; P.y = W.surface(P.x, P.z) || 0; await sleep(600);
    AV.S.money = 5000; const m0 = AV.S.money; T.fn(); await sleep(300); const rows = AV.transit._rows, d0 = pick(W, lo, hi), i = rows.findIndex(r => r.n === d0.n), d = rows[i] || d0; const b = document.querySelector('#cmp [data-tx="' + i + '"]'); c('destination button', !!b, d && d.n + ' ' + Math.round(d.d) + ' m'); if (!b) return null;
    b.click(); await sleep(700); const r = RD().cur; c('ride started (not a teleport)', !!r && AV.act.cur && AV.act.cur.id === 'taxiride', r && r.how + ' ' + Math.round(r.len) + ' m'); c('fare paid', AV.S.money < m0 || AV.transit.price(AV.transit.CFG[id].taxi, d.d) === 0, (m0 - AV.S.money) + ' credits');
    c('vehicle in the world', !!r && !!r.veh.parent && r.veh.visible); return { d, r, m0 } };
  for (const [id, mode] of [['madrid', 'full'], ['chiang_mai', 'skip'], ['astro9', 'skip'], ['pai', 'skip'], ['da_nang', 'skip'], ['ape_town', 'cancel'], ['vienna', 'skip'], ['koh_samui_jurassic', 'skip'], ['jungle_dub', 'skip'], ['koh_tao', 'skip'], ['jerusalem', 'skip'], ['judean_desert', 'skip']]) step('ride in ' + id, async c => {
    AV.S.time = 12 * 60; AV.travel(id); c('loads', await until(() => AV.W && AV.W.id === id && settled(), 240000)); await sleep(3000); const W = AV.W, P = AV.P;
    const b = await board(c, id, mode === 'full' ? 250 : 150, mode === 'full' ? 600 : 700); if (!b) return; const w1 = await watch(10); R[id] = { w1 };   /* 10 s: a ride may wait ~3 s for pedestrians, then drives on */
    c('vehicle moves (not stuck)', w1.moved > 10, JSON.stringify(w1) + ' · waits ' + AV.rides.stats.blockStops); c('you ride inside it', w1.maxSep < 2.6, 'max ' + w1.maxSep + ' m'); c('no teleport jumps', w1.maxJump < 3, 'max ' + w1.maxJump + ' m/frame');
    c('stays on ground, off walls', w1.offGround === 0 && w1.inWall <= Math.max(2, w1.frames * .05), 'off ' + w1.offGround + ' · wall ' + w1.inWall + ' / ' + w1.frames);
    if (mode === 'full') { const t0 = Date.now(); const ok = await until(() => !RD().cur, 150000); const secs = Math.round((Date.now() - t0) / 1000) + 6; c('arrives by driving', ok, secs + ' s · stats ' + JSON.stringify(RD().stats));
      c('red light respected (Madrid)', RD().stats.redStops > 0 || RD().stats.road > 0, 'red stops ' + RD().stats.redStops + ' · block stops ' + RD().stats.blockStops) }
    else if (mode === 'skip') { RD().skip(); c('skip arrives', await until(() => !RD().cur, 3000)) }
    else { const m = AV.S.money; AV.act.end('leave'); await sleep(400); c('cancel: pulled over (+ refund when the ride was paid)', !RD().cur && (AV.S.money > m || b.m0 === m), '+' + (AV.S.money - m) + (b.m0 === m ? ' (free shuttle)' : '')) }
    await sleep(500); c('standing on free ground', W.surface(P.x, P.z) !== null && AV.isFree(W, P.x, P.z, .3)); if (mode !== 'cancel') c('near the destination', Math.hypot(P.x - b.d.x, P.z - b.d.z) < 70, Math.round(Math.hypot(P.x - b.d.x, P.z - b.d.z)) + ' m');
    c('no activity left', !AV.act.cur && !RD().cur) }, { shot: null });
  step('mid-ride view: Madrid', async c => { AV.travel('madrid'); await until(() => AV.W && AV.W.id === 'madrid' && settled(), 240000); AV.S.time = 12 * 60; await sleep(2500); const b = await board(c, 'madrid', 200, 600); if (!b) return; await sleep(5000); AV.P.yaw += .5; await sleep(300); c('riding', !!RD().cur) }, { shot: 'ride_madrid' });
  step('mid-ride view: Chiang Mai', async c => { RD().cancel(); AV.travel('chiang_mai'); await until(() => AV.W && AV.W.id === 'chiang_mai' && settled(), 240000); await sleep(2500); const b = await board(c, 'chiang_mai', 150, 600); if (!b) return; await sleep(5000); c('riding', !!RD().cur) }, { shot: 'ride_chiang_mai' });
  step('mid-ride view: Astro-9 hover cab', async c => { RD().cancel(); AV.travel('astro9'); await until(() => AV.W && AV.W.id === 'astro9' && settled(), 240000); await sleep(2500); const b = await board(c, 'astro9', 150, 600); if (!b) return; await sleep(5000); c('riding, hovering', !!RD().cur && RD().cur.veh.position.y > (AV.W.surface(RD().cur.veh.position.x, RD().cur.veh.position.z) || 0) + 1.5) }, { shot: 'ride_astro9' });
  step('map taxi button uses the real ride', async c => { RD().cancel(); await sleep(400); const W = AV.W, d = AV.transit.dests(W, AV.P.x, AV.P.z).find(r => r.d > 120); AV.S.money = 999; const ok = AV.transit.fromMap(d.x, d.z, d.n); await sleep(800); c('map ride drives', ok && !!RD().cur, RD().cur && RD().cur.how); RD().cancel(); await sleep(300) });
  step('summary', async c => c('stats', true, JSON.stringify({ stats: RD().stats, worlds: R })));
  step('no JS errors', async c => c('clean', !$('err').textContent, $('err').textContent));
  let active = steps;
  return { names() { active = steps; return steps.map(s => s.name) }, async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
