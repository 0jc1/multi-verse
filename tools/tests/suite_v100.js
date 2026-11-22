/* Apeverse V1.0 kit milestones 1-3 suite: Jungle Dub vertical slice (run_tests.ps1 -Suite tools\tests\suite_v100.js [-Mobile]) */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const $ = id => document.getElementById(id), lab = t => typeof t.label === 'function' ? t.label() : t.label;
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const travel = async (id, arr) => { AV.travel(id, arr); return until(() => AV.W && AV.W.id === id && settled(), 40000) };
  const tgt = re => AV.W.T.find(t => (!t.show || t.show()) && re.test(lab(t)));
  const closeAll = () => { let n = 0; while (AV.modals.length && n++ < 10) AV.closeTop() };
  const goPlace = id => { const p = AV.W.places.find(x => x.id === id); if (!p) return null; AV.P.x = p.x; AV.P.z = p.z; AV.P.y = AV.W.surface(p.x, p.z) || 0; AV.P.vx = AV.P.vz = 0; AV.P.yaw = p.yaw; AV.P.pitch = .05; return p };
  const nearest = () => { let best = null, bd = 1e9; for (const t of AV.W.T) { if (t.show && !t.show()) continue; const d = Math.hypot(t.x - AV.P.x, t.z - AV.P.z); if (d < t.r && d < bd) { bd = d; best = t } } return best };
  const at = t => { AV.P.x = t.x; AV.P.z = t.z; AV.P.y = AV.W.surface(t.x, t.z) || 0 };
  const btn = sel => document.querySelector(sel);
  const cost = () => { const R = AV.R; R.info.autoReset = false; R.info.reset(); R.render(AV.scene, AV.cam); const r = { tris: R.info.render.triangles, calls: R.info.render.calls }; R.info.autoReset = true; return r };
  const M = {};

  step('boot', async c => { $('gq').value = 'High'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 20000)); await sleep(1500); AV.save = () => { }; AV.S.money = 200 });

  step('Jungle Dub: kit map places', async c => {
    c('travel to Jungle Dub', await travel('jungle_dub')); c('no world error', !$('err').textContent, $('err').textContent);
    const W = AV.W, want = ['river_bar', 'bazaar', 'dub_lab', 'temple', 'grove', 'band', 'lagoon', 'roots', 'tree', 'heal', 'falls'];
    const miss = want.filter(id => !W.places.find(p => p.id === id)); c('map places on the travel list', !miss.length, miss.join(','));
    const bad = W.places.filter(p => W.surface(p.x, p.z) === null).map(p => p.id); c('every place is walkable', !bad.length, bad.join(','));
    const names = W.places.map(p => p.name[0]).join(' | '); c('names follow the map (High Canopy Camp, Herbal Garden, Crystal Waterfalls)', /High Canopy Camp/.test(names) && /Herbal Garden/.test(names) && /Crystal Waterfalls/.test(names), names);
    const reach = {}; for (const [id, re] of [['river_bar', /River Bar: talk/], ['bazaar', /Bamboo Bazaar/], ['dub_lab', /Dub Lab/], ['temple', /Jungle Temple/], ['grove', /Mushroom Grove/], ['band', /Ztonedape/]]) { goPlace(id); const n = nearest(); reach[id] = !!n && re.test(lab(n)) }
    c('standing at each place, its interaction is the one offered', Object.values(reach).every(Boolean), JSON.stringify(reach));
  });

  step('River Bar: talk, menu, buy', async c => {
    goPlace('river_bar'); await sleep(300); const t = tgt(/River Bar: talk to Ras Mo/); c('bartender counter target', !!t); if (!t) return; at(t); t.fn(); await sleep(150);
    const opts = document.querySelectorAll('#cmp [data-o], #cmp [data-close]').length; c('dialogue has 2-4 choices + goodbye', opts >= 3 && opts <= 5, opts); c('first-meeting greeting', /Welcome to the River Bar/.test($('tkL').textContent), $('tkL').textContent);
    btn('#cmp [data-o="2"]').click(); c('“Any jobs?” points to the band', /bassist/.test($('tkL').textContent));
    btn('#cmp [data-o="1"]').click(); await sleep(100); c('menu opens with prices + Buy', document.querySelectorAll('#cmp [data-buy]').length === 5);
    const m0 = AV.S.money, b0 = AV.bag.count('beer'), b = btn('#cmp [data-buy="beer"]'); b.click(); b.click(); b.click();
    c('rapid triple tap = one beer, one debit', AV.bag.count('beer') === b0 + 1 && AV.S.money === m0 - 14, (AV.bag.count('beer') - b0) + ' beers, ' + (AV.S.money - m0) + ' credits');
    c('receipt shows the item', /Cold beer/.test($('shM').textContent), $('shM').textContent); await sleep(500);
    const w0 = AV.bag.count('water'); btn('#cmp [data-buy="water"]').click(); c('buy water', AV.bag.count('water') === w0 + 1);
    await sleep(500); AV.S.money = 5; const r0 = AV.bag.count('rum_cola'); btn('#cmp [data-buy="rum_cola"]').click();
    c('not enough credits: no item, no debit, clear message', AV.bag.count('rum_cola') === r0 && AV.S.money === 5 && /credits/.test($('shM').textContent), $('shM').textContent);
    AV.S.money = 200; await sleep(500); AV.P.x += 15; btn('#cmp [data-buy="rum_cola"]').click(); c('walked away: purchase refused', AV.bag.count('rum_cola') === r0, $('shM').textContent); at(t);
    closeAll(); t.fn(); c('Ras Mo remembers your order', /another/i.test($('tkL').textContent), $('tkL').textContent); closeAll();
  });
  step('River Bar view', async c => { goPlace('river_bar'); AV.P.pitch = .12; await sleep(2500); M.bar = cost(); c('rendered', M.bar.tris > 0, JSON.stringify(M.bar)) }, { shot: 'v100_river_bar' });

  step('hold + drink + effect + accessibility + expiry', async c => {
    closeAll(); AV.S.set.fxDur = 1; AV.fx.list.length = 0; const n0 = AV.bag.count('beer'); AV.bag.equip('beer'); c('beer held in first person', AV.S.bag.eq === 'beer');
    AV.bag.use('beer'); c('drinking animation runs', AV.bag.busy()); c('item not spent before the sip', AV.bag.count('beer') === n0);
    c('animation finishes', await until(() => !AV.bag.busy(), 8000)); c('exactly one beer consumed', AV.bag.count('beer') === n0 - 1, AV.bag.count('beer'));
    c('tipsy effect active with a timer', AV.fx.active().some(e => e.type === 'drink' && e.left > 60), JSON.stringify(AV.fx.active()));
    await sleep(15000); c('screen effect visible', AV.$('c').style.filter.length > 0, AV.$('c').style.filter);
    AV.hud(); c('HUD effect badge with time left', !!$('fxBadge') && /tipsy \d+:\d\d/.test($('fxBadge').textContent), $('fxBadge') && $('fxBadge').textContent);
    /* software rendering draws this world at < 1 fps: wait for frames instead of fixed sleeps */
    AV.S.set.noIntox = true; c('Disable intoxication visuals: clean screen, timer still running', await until(() => AV.$('c').style.filter === '', 10000) && AV.fx.active().length > 0, AV.$('c').style.filter);
    AV.S.set.noIntox = false; AV.S.set.reduce = true; c('Reduced motion: no camera roll', await until(() => Math.abs(AV.cam.rotation.z) < .002, 10000), AV.cam.rotation.z.toFixed(4)); AV.S.set.reduce = false;
    AV.fx.list.forEach(e => e.t0 -= e.dur); c('effect expires and the screen returns to normal', await until(() => !AV.fx.active().length && AV.$('c').style.filter === '', 10000));
    AV.toggleSettings(); c('settings: disable intoxication visuals / no flashing / clear effects', !!$('sNoI') && !!$('sNoF') && !!$('sClr')); closeAll();
  });

  step('Stone Ape Band + Bass Check quest', async c => {
    const ts = ['Ztonedape', 'Gorilla bassist', 'Orangutan sax'].map(n => tgt(new RegExp('Talk to ' + n))); c('band trio on the Jungle Rave stage', ts.every(Boolean));
    const lines = []; for (const t of ts) { if (!t) continue; at(t); t.fn(); await sleep(120); lines.push($('tkL').textContent); closeAll() } c('each member has their own lines', new Set(lines).size === 3, lines.join(' / '));
    const g = ts[1]; at(g); g.fn(); await sleep(100); btn('#cmp [data-o="0"]').click(); c('gorilla starts Bass Check', AV.S.quests.dub_bass_check === 'active'); closeAll(); AV.hud(); c('HUD shows the task', !!$('taskLine') && /Bass Check/.test($('taskLine').textContent));
    const m0 = AV.S.money; at(g); g.fn(); await sleep(900); c('no reward without the plate', AV.S.quests.dub_bass_check === 'active' && AV.S.money === m0); closeAll();
    const lab = tgt(/Dub Lab: collect/); c('Dub Lab offers the plate', !!lab); if (lab) { at(lab); lab.fn() } c('dub plate in the backpack', AV.bag.count('dub_plate') === 1); c('Dub Lab visit recorded', !!AV.S.v1.poi.dub_lab);
    at(g); g.fn(); c('turn in: quest done, +45 once', await until(() => AV.S.quests.dub_bass_check === 'done', 15000) && AV.S.money === m0 + 45, AV.S.money - m0); closeAll();
    at(g); g.fn(); await sleep(900); closeAll(); c('reward not paid twice', AV.S.money === m0 + 45 && !AV.bag.count('dub_plate'));
    goPlace('band'); AV.P.pitch = .18; await sleep(2500); M.band = cost();
  }, { shot: 'v100_band' });

  step('Bazaar, Temple, Mushroom Grove', async c => {
    goPlace('bazaar'); let t = nearest(); c('bazaar vendor', !!t && /Bamboo Bazaar/.test(lab(t))); if (t) { t.fn(); await sleep(100); const n0 = AV.bag.count('flower_garland'); btn('#cmp [data-buy="flower_garland"]').click(); c('buy a garland', AV.bag.count('flower_garland') === n0 + 1); closeAll() }
    goPlace('temple'); t = nearest(); const v0 = AV.vitals.get().vibe; if (t) t.fn(); c('temple ceremony lifts the vibe', AV.vitals.get().vibe > v0 && !!AV.S.v1.poi.dub_temple);
    goPlace('grove'); t = nearest(); if (t) t.fn(); c('grove walk: gentle glow + visit', AV.fx.active().some(e => e.type === 'glow') && !!AV.S.v1.poi.dub_grove); AV.fx.reset();
    goPlace('temple'); AV.P.pitch = .2; await sleep(2500); M.temple = cost();
  }, { shot: 'v100_temple' });
  step('Mushroom Grove view', async c => { goPlace('grove'); AV.P.pitch = .1; await sleep(2500); M.grove = cost(); c('rendered', M.grove.tris > 0) }, { shot: 'v100_grove' });

  step('save + portal home + return', async c => {
    const s = JSON.parse(AV.exportSave()); c('save holds quest, items, vendor memory, accessibility', s.quests.dub_bass_check === 'done' && s.items.flower_garland >= 1 && s.v1.vend.dub_riverbar.n >= 2 && 'noIntox' in s.set, JSON.stringify({ q: s.quests, v: s.v1 && s.v1.vend }));
    const p = tgt(/Portal arch: back to Ape Town/); c('portal arch', !!p); if (p) { at(p); p.fn(); c('back in Ape Town', await until(() => AV.W.id === 'ape_town' && settled(), 40000)) }
    c('return to Jungle Dub', await travel('jungle_dub')); c('quest + items survive the trip', AV.S.quests.dub_bass_check === 'done' && AV.bag.count('water') >= 1);
    c('render cost', true, JSON.stringify(M));
  });

  step('phone: buy + drink with touch', async c => {
    $('gq').value = 'Low'; $('bNew').click(); await until(() => AV.W && AV.running, 20000); await sleep(1500); AV.save = () => { }; AV.S.money = 100;
    c('travel (Low)', await travel('jungle_dub')); goPlace('river_bar'); const t = nearest(); c('bar target reachable', !!t && /River Bar/.test(lab(t))); if (!t) return;
    t.fn(); await sleep(100); btn('#cmp [data-o="1"]').dispatchEvent(new MouseEvent('click', { bubbles: true })); await sleep(100); const n0 = AV.bag.count('beer'); btn('#cmp [data-buy="beer"]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    c('tap Buy', AV.bag.count('beer') === n0 + 1 && AV.S.money === 86); closeAll(); AV.bag.equip('beer'); c('Use button shown while holding', getComputedStyle($('tU')).display === 'block');
    $('tU').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); c('tap Use drinks it', await until(() => AV.bag.count('beer') === n0, 9000));
  }, { mobile: true, shot: 'v100_phone' });

  let active = [];
  return { names(mobile) { active = steps.filter(s => !!s.mobile === !!mobile || s.name === 'boot'); return active.map(s => s.name) },
    async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
