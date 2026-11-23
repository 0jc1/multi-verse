/* Living Playground suite: activity framework, basketball (3 worlds + low-G), photography (run_tests.ps1 -Suite tools\tests\suite_play.js [-Mobile]) */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const $ = id => document.getElementById(id), lab = t => typeof t.label === 'function' ? t.label() : t.label;
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const travel = async (id, arr) => { AV.travel(id, arr); return until(() => AV.W && AV.W.id === id && settled(), 60000) };
  const tgt = re => AV.W.T.find(t => (!t.show || t.show()) && re.test(lab(t)));
  const closeAll = () => { let n = 0; while (AV.modals.length && n++ < 10) AV.closeTop() };
  const venue = () => AV.act.venues.find(v => v.type === 'hoops');
  /* stand on the court facing the hoop, `d` metres out */
  const stand = (v, d) => { const h = v.hoops[0], c = v.L(v.p.half ? 3 : 0, 0), dx = c[0] - h.rim.x, dz = c[1] - h.rim.z, l = Math.hypot(dx, dz), x = h.rim.x + dx / l * d, z = h.rim.z + dz / l * d; AV.P.x = x; AV.P.z = z; AV.P.y = AV.W.surface(x, z); AV.P.vx = AV.P.vz = 0; AV.P.yaw = Math.atan2(-(h.rim.x - x), -(h.rim.z - z)); AV.P.pitch = .25 };
  const def = () => AV.act.types.hoops;
  /* a shot with a chosen charge (k = 'ideal' or number), waits until the ball comes back */
  const shot = async k => { const s = AV.act.cur; await until(() => s.state === 'hold' && s.turn === 'you', 20000); await sleep(100); s.state = 'charge'; s.press = true; s.charge = k === 'ideal' ? AV.act._ideal(s) : k; s.dir = 0; const m0 = s.made, ideal = s.charge; def().press(s, false); s.press = false; const f = s.flight, h = f && f.h, tr = []; for (let i = 0; i < 360 && AV.act.cur === s && s.flight === f && f; i++) { def().update(s, 1 / 60, 0); if (f && Math.abs(f.pos.y - h.rim.y) < .5 && Math.hypot(f.pos.x - h.rim.x, f.pos.z - h.rim.z) < .8) tr.push([f.t.toFixed(2), (f.pos.x - h.rim.x).toFixed(2), (f.pos.y - h.rim.y).toFixed(2), (f.pos.z - h.rim.z).toFixed(2)].join('/')) } AV.act._ff(4); M.lastTrace = JSON.stringify({ ideal: +ideal.toFixed(3), cam: AV.cam.position.toArray().map(n => +n.toFixed(2)), P: [AV.P.x, AV.P.y, AV.P.z].map(n => +n.toFixed(2)), yaw: +AV.P.yaw.toFixed(3), pitch: AV.P.pitch, near: tr.slice(0, 14) }); return s.made > m0 };
  const M = {};

  step('boot', async c => { $('gq').value = 'Low'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); await sleep(1500); AV.save = () => { } });

  step('Chiang Mai court: placed from config', async c => {
    c('travel to Chiang Mai', await travel('chiang_mai')); c('no world error', !$('err').textContent, $('err').textContent);
    const v = venue(); c('court venue built', !!v, v && v.p.name[0]); if (!v) return;
    c('court floor is walkable', AV.W.surface(v.p.x, v.p.z) !== null && AV.isFree(AV.W, v.p.x, v.p.z, .3));
    c('pick-up target', !!tgt(/Basketball: pick up/)); c('court regular to challenge', !!(v.npc && /Challenge/.test(lab(v.npc.tg))), v.npc && lab(v.npc.tg));
    c('camera given in the backpack', AV.bag.count('camera') === 1);
  });

  step('casual: pick up, aim, shoot, score', async c => {
    const v = venue(), t = tgt(/Basketball: pick up/); AV.P.x = t.x; AV.P.z = t.z; t.fn(); await sleep(150); const b = document.querySelector('#cmp [data-m="casual"]'); c('mode menu', !!b); b && b.click();
    c('activity running', await until(() => AV.act.cur && AV.act.cur.id === 'hoops', 3000)); const s = AV.act.cur; c('ball held in first person', s.ball.parent === AV.cam);
    c('HUD with charge meter', !!document.querySelector('#actHud .meter'));
    stand(v, 4.6); c('free-throw shot goes in', await shot('ideal'), JSON.stringify({ made: s.made, att: s.att, msg: s.msg }) + ' ' + M.lastTrace);
    c('score shown', /1 \/ 1/.test($('actHud').textContent), $('actHud').textContent.slice(0, 120));
    c('underpowered shot misses', !(await shot(.02)) && s.att === 2);
    stand(v, 7.5); c('three-pointer goes in', await shot('ideal') && s.score === 5, 'score ' + s.score);
    const e = new KeyboardEvent('keydown', { code: 'Escape', key: 'Escape', bubbles: true }); document.body.dispatchEvent(e); c('Esc leaves the activity', !AV.act.cur);
    c('ball back on the rack, walking again', v.ball.parent === v.g && v.ball.position.distanceTo(v.rack) < .01);
    c('progress saved', (AV.S.act.hoops.made || 0) >= 2 && AV.S.act.hoops.att >= 3, JSON.stringify(AV.S.act.hoops));
  });
  step('court view', async c => { const v = venue(); stand(v, 6); AV.P.pitch = .12; await sleep(2500); c('rendered', true) }, { shot: 'play_court_cm' });

  step('first to 5 vs the court regular', async c => {
    const v = venue(), S = AV.S.act.hoops, w0 = (S.wins || 0) + (S.losses || 0); v.npc.tg.fn(); c('match starts', await until(() => AV.act.cur && AV.act.cur.mode === 'npc', 3000)); const s = AV.act.cur;
    stand(v, 4.6); let n = 0; while (AV.act.cur === s && n++ < 14) { await shot('ideal'); if (AV.act.cur === s) { await until(() => s.npcShot || AV.act.cur !== s, 8000); AV.act._ff(6) } }
    c('match finishes with a winner', !AV.act.cur && (S.wins || 0) + (S.losses || 0) === w0 + 1, JSON.stringify({ you: s.made, npc: s.npcScore }));
    c('the regular took shots too', s.npcScore > 0 || s.made === 5, 'npc ' + s.npcScore);
  });

  step('60-second challenge', async c => {
    const v = venue(), t = tgt(/Basketball: pick up/); AV.P.x = t.x; AV.P.z = t.z; t.fn(); await sleep(100); document.querySelector('#cmp [data-m="timed"]').click();
    c('challenge starts', await until(() => AV.act.cur && AV.act.cur.mode === 'timed', 3000)); const s = AV.act.cur; stand(v, 4.6); await shot('ideal'); s.tEnd = AV.now() - .1; AV.act._ff(.2);
    c('time runs out → result + record', await until(() => !AV.act.cur, 8000) && (AV.S.act.hoops.best60 || 0) >= 2, 'best ' + AV.S.act.hoops.best60);
  });

  step('photo mode: snap, album, download', async c => {
    AV.keymap.KeyK(); c('photo mode (K)', AV.act.cur && AV.act.cur.id === 'photo'); c('interface hidden', $('top').style.visibility === 'hidden');
    const n0 = (await AV.photo.list()).length; const s = AV.act.cur; s.filter = 'warm'; AV.act.types.photo.press(s, true);
    c('photo saved to the album', await until(() => !s.busy, 90000) && (await AV.photo.list()).length === n0 + 1); const L = await AV.photo.list();
    c('photo knows the world + filter', L[0].world === 'chiang_mai' && L[0].filter === 'warm' && /^data:image\/jpeg/.test(L[0].url), L[0].world + ' ' + L[0].filter + ' ' + L[0].url.length + ' bytes');
    document.body.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', key: 'Escape', bubbles: true })); c('Esc leaves, interface back', !AV.act.cur && $('top').style.visibility !== 'hidden');
    let dl = null; const ck = HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click = function () { dl = this.download }; await AV.photo.album(); const b = document.querySelector('#cmp [data-dl]'); b && b.click(); HTMLAnchorElement.prototype.click = ck;
    c('album lists it and offers a download', !!b && /^apeverse_chiang_mai_\d+\.jpg$/.test(dl || ''), dl); closeAll();
    AV.bag.use('camera'); c('backpack camera opens photo mode', AV.act.cur && AV.act.cur.id === 'photo'); AV.act.end('leave');
  });

  step('Astro-9 low-gravity court', async c => {
    c('travel to Astro-9', await travel('astro9')); const v = venue(); c('low-G court', !!v && v.grav < 5, v && v.grav); if (!v) return;
    const t = tgt(/Basketball: pick up/); AV.P.x = t.x; AV.P.z = t.z; t.fn(); await sleep(100); document.querySelector('#cmp [data-m="casual"]').click(); await until(() => AV.act.cur, 3000);
    const s = AV.act.cur; stand(v, 4.6); const t0 = performance.now(); c('floaty shot goes in', await shot('ideal'), JSON.stringify({ made: s.made, msg: s.msg })); M.lowgFlight = Math.round(performance.now() - t0);
    AV.act.end('leave'); stand(v, 7); AV.P.pitch = .15; await sleep(2500);
  }, { shot: 'play_court_astro9' });

  step('Ape Town + Vienna courts', async c => {
    c('Ape Town', await travel('ape_town')); let v = venue(); c('Ape Town court', !!v && AV.W.surface(v.p.x, v.p.z) !== null); if (v) { stand(v, 6); AV.P.pitch = .12; await sleep(2000) }
    c('Vienna', await travel('vienna')); v = venue(); c('Vienna court', !!v && AV.W.surface(v.p.x, v.p.z) !== null);
    c('no JS errors', !$('err').textContent, $('err').textContent);
  }, { shot: 'play_court_apetown' });

  step('phone: hold SHOOT, release, Leave', async c => {
    $('gq').value = 'Low'; $('bNew').click(); await until(() => AV.W && AV.running, 30000); await sleep(1500); AV.save = () => { };
    c('travel (Low)', await travel('ape_town')); const v = venue(); const t = tgt(/Basketball: pick up/); AV.P.x = t.x; AV.P.z = t.z; t.fn(); await sleep(100); document.querySelector('#cmp [data-m="casual"]').click(); await until(() => AV.act.cur, 3000);
    c('SHOOT + Leave buttons', getComputedStyle($('actGo')).display === 'block' && getComputedStyle($('actExit')).display === 'block'); c('Act/Punch buttons hidden meanwhile', getComputedStyle($('tE')).display === 'none');
    const s = AV.act.cur; stand(v, 4.6); await sleep(100); $('actGo').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); c('holding charges', s.state === 'charge'); s.charge = AV.act._ideal(s); s.dir = 0; $('actGo').dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    AV.act._ff(6); c('release shoots and scores', s.made === 1, s.msg);
    $('actExit').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); c('Leave ends it, buttons restored', !AV.act.cur && getComputedStyle($('tE')).display !== 'none');
  }, { mobile: true, shot: 'play_phone' });

  let active = [];
  return { names(mobile) { active = steps.filter(s => !!s.mobile === !!mobile || s.name === 'boot'); return active.map(s => s.name) },
    async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
