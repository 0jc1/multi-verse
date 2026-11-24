/* Worlds Reborn §10: Pai rebuilt from the illustrated map (run_tests.ps1 -Suite tools\tests\suite_pai.js -StepTimeout 900) */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const $ = id => document.getElementById(id), lab = t => typeof t.label === 'function' ? t.label() : t.label;
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const travel = async id => { AV.travel(id); return until(() => AV.W && AV.W.id === id && settled(), 120000) };
  const tgt = re => AV.W.T.find(t => (!t.show || t.show()) && re.test(lab(t)));
  const at = (x, z) => { AV.P.x = x; AV.P.z = z; AV.P.y = AV.W.surface(x, z) || 0 };
  /* every metre along a polyline is ground, not inside a wall or post, and never a step the player can't climb (> 1 m per metre; the game climbs up to ~0.9 m per step) */
  const walk = pts => { const bad = []; for (let k = 1; k < pts.length; k++) { const [x0, z0] = pts[k - 1], [x1, z1] = pts[k], n = Math.ceil(Math.hypot(x1 - x0, z1 - z0)); let py = null; for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, z = z0 + (z1 - z0) * i / n, y = AV.W.surface(x, z); if (y === null || !AV.isFree(AV.W, x, z, .35) || (py != null && Math.abs(y - py) > 1.0)) { const W = AV.W, why = y === null ? 'void' : (py != null && Math.abs(y - py) > 1.0) ? 'climb ' + py.toFixed(1) + '>' + y.toFixed(1) : (() => { const c = W.circles.find(q => Math.hypot(x - q[0], z - q[1]) < q[2] + .35); if (c) return 'circle ' + c.map(v => +v.toFixed(2)).join(','); const r = W.cols.find(q => x > q[0] - .35 && x < q[1] + .35 && z > q[2] - .35 && z < q[3] + .35); return r ? 'col ' + r.map(v => +v.toFixed(2)).join(',') : 'edge (ground ends within .35 m)' })(); bad.push(x.toFixed(1) + ',' + z.toFixed(1) + ' [' + why + ']'); continue }   /* diagnostics: say what blocks */ if (false) bad.push(x.toFixed(1) + ',' + z.toFixed(1) + (y === null ? ' void' : '')); py = y } } return bad };
  const buy = async (re, item) => { const t = tgt(re); if (!t) return 'no target'; at(t.x, t.z); t.fn(); await sleep(300); const b = document.querySelector('[data-buy="' + item + '"]'); if (!b) { AV.closeTop(); return 'no item' } b.click(); await sleep(500); AV.closeTop(); return AV.bag.count(item) };
  const D = () => AV.paiDebug, PL = () => D().PL;
  const shot = async (x, z, yaw, pitch, hr) => { if (hr != null) AV.S.time = hr * 60; at(x, z); AV.P.yaw = yaw; AV.P.pitch = pitch || 0; await sleep(6000) };

  step('boot', async c => { $('gq').value = 'Low'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); await sleep(1500); AV.save = () => { }; AV.S.money = 500;
    c('Pai is its own world (Chiang Mai + Jungle Dub separate)', AV.isPlayable('pai') && AV.isPlayable('chiang_mai') && AV.isPlayable('jungle_dub')); c('Pai', await travel('pai')); c('no world error', !$('err').textContent, $('err').textContent);
    c('arrive at the bus station', Math.hypot(AV.P.x - PL().bus[0], AV.P.z - PL().bus[1]) < 12, AV.P.x.toFixed(1) + ',' + AV.P.z.toFixed(1)) });

  step('routes: no blocked paths', async c => {
    const R = { 'bus → Walking Street (north end → south end)': [[PL().bus[0] - 2, PL().bus[1] + 6], [0, -64], [0, 64]], 'street → Tea & Drum Circle lane': [[0, 13], [PL().tea[0] + 4, PL().tea[1] - 2]], 'street → river lane → hostel bar → bamboo bridge → east bank': [[0, 2], [60, 2], [84, 2], [100, 2]],
      'bridge → jungle trail': [[100, 2], [PL().jungle[0] - 2, PL().jungle[1]]], 'north end → Sunset Bar deck': [[0, -66], [PL().sunset[0] + 4, PL().sunset[1] + 10], [PL().sunset[0] + 8, PL().sunset[1] + 7], [PL().sunset[0] + 6, PL().sunset[1] + 4.8]], 'north end → Paradise Circus': [[6, -66], [PL().paradise[0] - 4, PL().paradise[1] + 10], [PL().paradise[0], PL().paradise[1] + 6.5]],
      'south end → Pai Canyon viewpoint (ridge path)': [[0, 66], [4, 128]].concat(Array.from({ length: 22 }, (_, i) => { const z = 129 + i * 2; return [4 + 5 * Math.sin(Math.max(0, z - 128) / 14), z] })), 'street → hot springs': [[-12, 30], [PL().springs[0] + 4, PL().springs[1] - 8]], 'street → waterfall': [[-14, -8], [PL().fall[0] + 12, PL().fall[1]]] };
    for (const k in R) { const b = walk(R[k]); c(k, !b.length, b.slice(0, 6).join(' | ')) }
  });

  step('venues: enter + order', async c => {
    c('Rainny Café: smoothie bowl', (await buy(/Rainny Café counter/, 'pai_bowl')) === 1); c('Ganita Café: massaman curry', (await buy(/Ganita Café counter/, 'pai_curry')) === 1);
    c('Tea & Drum Circle: pot of tea', (await buy(/Tea & Drum Circle: order/, 'pai_tea')) === 1); c('roti stand', (await buy(/Roti stand/, 'pai_roti')) === 1);
    AV.S.time = 14 * 60; c('Sunset Bar daytime: chill', /chill/.test(lab(tgt(/🍺 Sunset Bar/)))); c('Sunset Bar: buy a beer', (await buy(/🍺 Sunset Bar/, 'beer')) >= 1); c('Sunset Bar DJ booth', !!tgt(/DJ booth.*Sunset/));
    c('Paradise Circus closed by day', /20:00/.test(lab(tgt(/Paradise Circus/)))); AV.S.time = 21 * 60; c('Paradise at night: fire show', /watch the fire show/.test(lab(tgt(/Paradise Circus/))));
    c('River Jam bar', (await buy(/River Jam bar/, 'water')) >= 1); c('drums + ukulele jam spots, scooter rental', AV.act.venues.some(v => v.type === 'inst' && v.p.kind === 'bongo') && AV.act.venues.some(v => v.type === 'inst' && v.p.kind === 'uke') && !!tgt(/scooter/i));
    const s = tgt(/riverside cabin/); at(s.x, s.z); s.fn(); c('sleep in a riverside cabin until 08:00', await until(() => Math.abs(AV.S.time - 480) < 2, 20000));
    c('waterfall, hot springs, canyon, Yun Lai, temple', ['Waterfall: cool', 'Hot springs: soak', 'Pai Canyon viewpoint', 'Yun Lai viewpoint', 'Temple: sit'].every(n => !!tgt(new RegExp(n))));
  });

  step('ambience zones', async c => {
    const lv = () => AV.amb.lv; c('ambience engine running', await until(() => AV.amb.on, 60000));
    AV.S.time = 19 * 60; at(0, -10); c('town at night: market chatter', await until(() => lv().chatter > .6, 60000), JSON.stringify(lv()));
    at(PL().sunset[0] + 4, PL().sunset[1] + 5); c('Sunset Bar evening: techno', await until(() => lv().techno > .6, 60000), lv().techno);
    at(84, 30); c('riverbank: river sound', await until(() => lv().river > .6, 60000), lv().river); c('night by the river: frogs', lv().frogs > .3, lv().frogs);
    at(PL().tea[0] + 3, PL().tea[1]); AV.S.time = 15 * 60; c('Tea & Drum Circle: drums', await until(() => lv().drums > .6, 60000), lv().drums);
    at(-60, -120); c('in the jungle: insects + birds, no techno', await until(() => lv().birds > .5 && lv().techno < .05, 60000), JSON.stringify(lv()));
    c('world music ducks near the venues that play their own', (at(PL().tea[0] + 3, PL().tea[1]), await until(() => AV.media.ducks.some(f => f() > .5), 60000)));
  });

  step('countryside: rice paddies + bungalows', async c => { const b = walk([[96, 2], [102, 1.5], [108, 70]]); c('footpath east bank → bungalows walkable', !b.length, b.slice(0, 6).join(' | ')); c('rent a bungalow interaction', !!tgt(/Riverside bungalow/)); c('field hut interaction', !!tgt(/field hut/)); const r = walk([[100, 2], [156, -12]]); c('bridge → jungle road still clear through the paddies', !r.length, r.slice(0, 6).join(' | ')) });
  step('rice paddies view', async c => { await shot(104, -2, -Math.PI * .6, .12, 9); c('rendered', true) }, { shot: 'pai_rice' });
  step('bungalows view', async c => { await shot(108, 69, Math.PI * .8, .1, 17); c('rendered', true) }, { shot: 'pai_bungalows' });
  step('west façades', async c => { await shot(2.6, -42, Math.PI * .75, .18, 16); c('rendered', true) }, { shot: 'pai_facades_w' });
  step('east façades', async c => { await shot(-2.6, 20, -Math.PI * .75, .18, 16); c('rendered', true) }, { shot: 'pai_facades_e' });
  step('day street', async c => { await shot(0, -60, Math.PI, .02, 11); c('rendered', true) }, { shot: 'pai_street_day' });
  step('night street', async c => { await shot(0, -60, Math.PI, .02, 21); c('rendered', true) }, { shot: 'pai_street_night' });
  step('sunset bar', async c => { await shot(PL().sunset[0] + 3, PL().sunset[1] + 14, 0, .02, 18); c('rendered', true) }, { shot: 'pai_sunset_bar' });
  step('river hostel', async c => { await shot(48, 2, -Math.PI / 2, -.05, 17); c('rendered', true) }, { shot: 'pai_hostel' });

  step('minivan both ways + jungle trail; nothing broken', async c => {
    const m = tgt(/Minivan to Chiang Mai/); at(m.x, m.z); const m0 = AV.S.money; m.fn(); c('minivan → Chiang Mai (40)', await until(() => AV.W && AV.W.id === 'chiang_mai' && settled(), 120000) && AV.S.money === m0 - 40);
    const back = tgt(/Minivan to Pai/); c('Chiang Mai has the minivan back', !!back); if (back) { at(back.x, back.z); back.fn(); c('back in Pai', await until(() => AV.W && AV.W.id === 'pai' && settled(), 120000)) }
    const t = tgt(/Jungle trail/); at(t.x, t.z); t.fn(); c('trail → Jungle Dub', await until(() => AV.W && AV.W.id === 'jungle_dub' && settled(), 120000)); c('ambience stops outside Pai', !AV.amb.on);
    c('no JS errors', !$('err').textContent, $('err').textContent);
  });

  let active = [];
  return { names(mobile) { active = steps.filter(s => !!s.mobile === !!mobile || s.name === 'boot'); return active.map(s => s.name) },
    async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
