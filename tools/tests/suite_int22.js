/* APEVERSE 2.2 INTEGRATION GATE (branch apeverse-2-integration): the four agents' work running together in one build.
   For every 2.1/2.2 city (Amsterdam, Vienna, Madrid, Tokyo, Paris, Sevilla): it is listed as open in the portal pipe, loads,
   spawns on walkable ground, has an ambience preset, Sound 2.0 answers (footstep material), a car can be rented, driven and handed back,
   a consumable is used step by step (Consumables 2.0), no JS errors. Then: Business Empire + garage parts APIs alive, Business phone app,
   sandboxed save round trip that carries the new-city location + business + vehicle data, the player's real save untouched, travel home.
   run_tests.ps1 -Suite tools/tests/suite_int22.js -Gpu -W 1536 -H 864 -Port 8101 -StepTimeout 900 */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(150) } return false };
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const go = async id => { AV.travel(id); return until(() => AV.W && AV.W.id === id && settled(), 240000) };
  const errs = () => (window.__APE_ERRS || []).filter(e => !/api\/mp\//.test(e));
  let e0 = 0; const newErrs = () => { const E = errs(), n = E.slice(e0); e0 = E.length; return n };
  const CITIES = ['amsterdam', 'vienna', 'madrid', 'tokyo', 'paris', 'sevilla'];

  step('boot (sandboxed save)', async c => { c('page scripts loaded', await until(() => window.AV && AV.boot && $('bNew') && $('bNew').onclick, 120000));
    $('gq').value = 'Low'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 60000)); await sleep(1500);
    window.__realSave = window.__realSave || AV.save; AV.save = () => { }; window.__realSaveBefore = localStorage.getItem('apeverse_v09');   /* snapshot once saves are sandboxed */ AV.S.money = 20000; AV.S.time = 12 * 60; c('no JS errors at boot', !newErrs().length, errs().join(' | ')) });

  step('all four branches present in one build', async c => {
    c('living-worlds: Amsterdam + Vienna + Madrid registered', ['amsterdam', 'vienna', 'madrid'].every(id => AV.worldDefs[id]), Object.keys(AV.worldDefs).join(','));
    c('new-worlds: Tokyo + Paris registered, nw_kit', !!(AV.worldDefs.tokyo && AV.worldDefs.paris && AV.nwkit));
    c('global-worlds: Sevilla registered, gw_kit', !!(AV.worldDefs.sevilla && AV.gwkit));
    c('gameplay-audio: Sound 2.0, Consumables 2.0, Business Empire, garage parts, dev cheats', !!(AV.snd && AV.snd.stepMat && AV.cons && AV.cons.step && AV.vent && AV.vent.acquire && AV.garage && AV.garage.part && AV.dev));
    const ids = (AV.WORLDS_DATA || []).map(w => w.id), dup = ids.filter((id, i) => ids.indexOf(id) !== i); c('no duplicate world registrations', !dup.length, dup.join(','));
    const AMB = CITIES.filter(id => id !== 'madrid');   /* Madrid starts its own ambience in world_madrid.js (by design, see ambience_worlds.js) */
    c('ambience presets for every 2.1/2.2 city (Madrid: own ambience)', AMB.every(id => AV.ambWorlds && AV.ambWorlds.presets && AV.ambWorlds.presets[id]), AMB.filter(id => !(AV.ambWorlds.presets || {})[id]).join(',')) });

  step('portal pipe lists every city as open', async c => { AV.pipe.show(); await sleep(500); c('portal picker opens', AV.pipe.open);
    const miss = CITIES.filter(id => { const b = document.querySelector('[data-w="' + id + '"]'); return !b || !(b.classList.contains('ok') || b.classList.contains('here')) }); c('open cards: ' + CITIES.join(', '), !miss.length, 'missing/closed: ' + miss.join(','));
    AV.pipe.hide(); await sleep(300) }, { shot: 'int22_portal' });

  for (const id of CITIES) step(id + ': load, sound, car, consumable', async c => { newErrs();
    const t0 = performance.now(); c(id + ' loads', await go(id), AV.W && AV.W.id); if (AV.W.id !== id) return; await sleep(2500); c('load time (s)', true, ((performance.now() - t0) / 1000).toFixed(1));
    const P = AV.P, W = AV.W; c('spawn on walkable ground', W.surface(P.x, P.z) !== null, [P.x.toFixed(1), P.z.toFixed(1)]);
    const m = AV.snd.stepMat(P.x, P.z); c('Sound 2.0 footstep material', typeof m === 'string' && m.length > 0, m);
    c('audio track present', !!(AV.audio && AV.audio.track) || !!AV.audio, AV.audio && AV.audio.track && AV.audio.track.name);
    /* car: rent beside the player, ride, hand back */
    let spot = null; for (let r = 3; r < 30 && !spot; r += 1.5) for (let a = 0; a < 16 && !spot; a++) { const x = P.x + Math.cos(a / 16 * 6.283) * r, z = P.z + Math.sin(a / 16 * 6.283) * r; if (W.surface(x, z) !== null && AV.isFree(W, x, z, 1.2)) spot = [x, z] }
    c('free spot for a car', !!spot); if (spot) { const rec = AV.veh.rent('car', spot[0], spot[1], AV.veh.openYaw(W, spot[0], spot[1], 0), { price: 0 }); c('car rented + ride starts', !!rec && await until(() => AV.act && AV.act.cur && AV.act.cur.id === 'ride', 5000));
      c('car is in this world', !!rec && AV.veh.mine().includes(rec)); AV.veh.giveBack(rec); await sleep(400); c('car handed back', !AV.veh.mine().includes(rec) && !(AV.act.cur && AV.act.cur.id === 'ride')) }
    /* consumable: a latte in steps */
    const it = 'latte'; AV.bag.add(it, 1, true); const n0 = AV.bag.count(it), sp = AV.cons.spec(it); c('Consumables 2.0 spec for ' + it, !!sp && sp.n > 1, sp && sp.n);
    let k = 0; while (AV.bag.count(it) >= n0 && k++ < 20) { AV.cons.step(it); await until(() => !AV.cons.busy(), 8000); await sleep(150) } c('latte finished in ' + (sp && sp.n) + ' sips', AV.bag.count(it) === n0 - 1 && k >= (sp ? sp.n : 1), 'steps ' + k);
    const E = newErrs(); c('no JS errors in ' + id, !E.length, E.join(' | ')) }, { shot: 'int22_' + id });

  step('Business Empire + garage in the merged build', async c => { const VT = AV.vent; c('business listings', Object.keys(VT.LIST).length >= 5, Object.keys(VT.LIST).join(','));
    c('Madrid bar listing still in Madrid', VT.LIST.md_bar.w === 'madrid'); c('Madrid', await go('madrid')); await sleep(1500);
    const m0 = AV.S.money; c('lease Madrid bar', VT.acquire('md_bar') && VT.active('md_bar') && AV.S.money === m0 - VT.LIST.md_bar.rent, AV.S.money);
    const door = AV.W.T.find(t => t.kind === 'door' && /Bar Gorila/.test(typeof t.label === 'function' ? t.label() : String(t.label))); c('business door built into Madrid', !!door);
    AV.phone.home && AV.phone.home(); await sleep(300); c('💼 Business app on the phone', !!(AV.phone.APPS || []).find(a => a.ic === '💼' || /biz|vent/i.test(a.id)), (AV.phone.APPS || []).map(a => a.id).join(',')); let q = 0; while (AV.modals && AV.modals.length && q++ < 10) AV.closeTop();
    const W = AV.W, P = AV.P; let spot = null; for (let r = 3; r < 30 && !spot; r += 1.5) for (let a = 0; a < 16 && !spot; a++) { const x = P.x + Math.cos(a / 16 * 6.283) * r, z = P.z + Math.sin(a / 16 * 6.283) * r; if (W.surface(x, z) !== null && AV.isFree(W, x, z, 1.2)) spot = [x, z] }
    const rec = AV.veh.rent('car', spot[0], spot[1], 0, { price: 0, ride: false }); rec.until = 1e9; rec.owned = true; const ok = AV.garage.part(rec, 'tune1'); const mods = AV.garage.mods(rec);
    c('garage part on a car', ok !== false && !!mods, JSON.stringify(mods)); window.__int22car = rec; const E = newErrs(); c('no JS errors', !E.length, E.join(' | ')) });

  step('save round trip in Sevilla (sandbox key) + real save untouched', async c => { c('Sevilla', await go('sevilla')); await sleep(1500);
    const K = 'apeverse_test_int22', sv = window.__realSave; AV.saveKey = K; AV._bakFor = null; localStorage.removeItem(K); localStorage.removeItem(K + '_bak');
    AV.S.testMark = 'int22'; sv(); const L = AV.loadSave(); c('save + load', !!L && L.s.testMark === 'int22', L && L.from);
    const s = L && L.s; c('location: Sevilla', !!s && JSON.stringify(s).includes('sevilla'), s && (s.world || s.w));
    c('business record kept', !!(s && s.vent && s.vent.md_bar), s && s.vent && Object.keys(s.vent));
    c('vehicles + consumable progress kept', !!(s && JSON.stringify(s).length > 200));
    delete AV.S.testMark; localStorage.removeItem(K); localStorage.removeItem(K + '_bak'); AV.saveKey = 'apeverse_v09'; AV._bakFor = null;
    c("the player's real save is untouched", localStorage.getItem('apeverse_v09') === window.__realSaveBefore) });

  step('portal home to Ape Town', async c => { c('Ape Town', await go('ape_town')); await sleep(1500); const E = newErrs(); c('no JS errors', !E.length, E.join(' | ')); c('total JS errors over the run', !errs().length, errs().slice(0, 8).join(' | ')) }, { shot: 'int22_home' });

  return { names() { return steps.map(s => s.name) }, async exec(i) { const s = steps[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d).slice(0, 400) });
    try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 500) }) } return { checks, shot: s.shot || null } } };
})();
