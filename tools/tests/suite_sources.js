/* APEVERSE 2.1 Phase 2: world-appropriate consumable sources (js/consume_sources.js).  Full chain per source, as a player would:
   walk to the door / stall -> interact -> (adults gate / membership) -> buy with credits -> item in the backpack -> use it (first-person
   animation) -> the effect starts -> "disable intoxication visuals" leaves the screen clean while the timer runs -> clear (X).
   Madrid La Nube: street door -> lounge -> member card -> counter -> out again.  Screenshots of each sign.
   run_tests.ps1 -Suite tools/tests/suite_sources.js -Gpu */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const go = async id => { AV.S.time = 12 * 60; AV.travel(id); const ok = await until(() => AV.W && AV.W.id === id && settled(), 240000); await sleep(2500); return ok };
  const findT = re => AV.W.T.find(t => { try { return re.test(typeof t.label === 'function' ? t.label() : t.label) } catch (e) { return false } });
  const stand = (T, back) => { const P = AV.P; P.x = T.x; P.z = T.z; P.y = AV.W.surface(T.x, T.z) || 0; P.vx = P.vz = 0; return P };
  const look = (x, z) => { const P = AV.P; P.yaw = Math.atan2(-(x - P.x), -(z - P.z)); P.pitch = .05 };
  const buy = async (c, id) => { const b = document.querySelector('#cmp [data-buy="' + id + '"]'); c('menu lists ' + id, !!b); if (!b) return false; const n0 = AV.bag.count(id), m0 = AV.S.money; b.click(); await sleep(500); c('bought ' + id + ' (credits debited, in backpack)', AV.bag.count(id) === n0 + 1 && AV.S.money < m0, (m0 - AV.S.money) + ' credits'); return true };
  const use = async (c, id, type) => { AV.closePanel('cmp'); await sleep(300); AV.fx.reset(); AV.bag.use(id); await sleep(500); c('first-person animation (item in hand)', AV.bag.held().VM.visible && AV.bag.held().id === id); await sleep(2600);
    const on = AV.fx.active().some(e => e.type === type); c('effect starts: ' + type, on, JSON.stringify(AV.fx.active().map(e => e.type)));
    AV.S.set.noIntox = true; AV.fx.refresh && AV.fx.refresh(); await sleep(500); c('visuals off: screen clean, timer kept', ($('c').style.filter || '') === '' && AV.fx.active().some(e => e.type === type)); AV.S.set.noIntox = false; AV.fx.reset(); await sleep(300); c('clear (X) removes it', AV.fx.list.length === 0) };
  step('boot', async c => { $('gq').value = 'Medium'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); await sleep(1500); AV.save = () => { }; AV.S.money = 2000; c('module', !!AV.consumeSources) });
  step('Madrid: La Nube street door', async c => { c('loads', await go('madrid')); const st = AV.consumeSources.stats; c('built', st.madrid && st.madrid.built, JSON.stringify(st)); const T = findT(/La Nube · social club/); c('door interaction', !!T); if (!T) return;
    const P = stand(T); P.x -= 9; P.z += 1; P.y = AV.W.surface(P.x, P.z) || 0; look(T.x + 1, T.z - .6); await sleep(1500); c('door spot walkable', AV.W.surface(T.x, T.z) !== null && AV.isFree(AV.W, T.x, T.z, .3)) }, { shot: 'src_madrid_door' });
  step('Madrid: inside, join, buy, smoke', async c => { const T = findT(/La Nube · social club/); stand(T); T.fn(); await sleep(1200); const P = AV.P; c('inside the lounge', P.x > 2390 && P.x < 2410, P.x.toFixed(1));
    const K = findT(/Counter \(Rocío\)/); c('counter', !!K); stand(K); await sleep(300); K.fn(); await sleep(300); const j = $('nubeJoin'); c('membership offer (adults only)', !!j); const m0 = AV.S.money; j.click(); await sleep(700); c('member: 15 credits', m0 - AV.S.money === 15 && !!AV.S.v21.nube);
    await buy(c, 'pre'); await buy(c, 'md_cafe'); await use(c, 'pre', 'smoke'); look(2400, -4.5); P.x = 2400; P.z = 2.5; await sleep(900) }, { shot: 'src_madrid_lounge' });
  step('Madrid: back out to the street', async c => { const T = findT(/Back out to Calle Malasaña/); c('exit', !!T); stand(T); T.fn(); await sleep(1200); const P = AV.P; c('on the street', P.x < 0 && AV.W.surface(P.x, P.z) !== null && AV.isFree(AV.W, P.x, P.z, .3), P.x.toFixed(1) + ',' + P.z.toFixed(1)) });
  const STALLS = [['pai', /Pai Herb Corner/, 'pre', 'smoke', true], ['koh_tao', /Sairee Leaf Shack/, 'pre', 'smoke', true], ['jerusalem', /Café Nargila/, 'nargila', 'smoke', false], ['koh_samui_jurassic', /Ranger Snack Hut/, 'coconut', null, false], ['verdalux', /Forage Basket/, 'coconut', null, false]];
  for (const [id, re, item, fx, gated] of STALLS) step('stall in ' + id, async c => { c('loads', await go(id)); const T = findT(re); c('stall interaction', !!T, AV.consumeSources.stats[id === 'koh_samui_jurassic' ? 'samui' : id]); if (!T) return;
    const P = stand(T); c('stall front walkable', AV.W.surface(P.x, P.z) !== null && AV.isFree(AV.W, P.x, P.z, .3)); T.fn(); await sleep(400);
    if (gated) { const b = $('hgOk'); c('adults (20+) notice first', !!b); b && b.click(); await sleep(600) }
    await buy(c, item); if (fx) await use(c, item, fx); else { AV.closePanel('cmp'); await sleep(200); const n = AV.bag.count(item); AV.bag.use(item); await sleep(3200); c('eaten / drunk (animation, item used)', AV.bag.count(item) === n - 1) }
    const s = AV.consumeSources.stalls; const k = Object.keys(s).find(q => s[q].world === id); if (k) { P.x = s[k].x + 2; P.z = s[k].z + 6.5; P.y = AV.W.surface(P.x, P.z) || 0; look(s[k].x, s[k].z) } await sleep(1200) }, { shot: 'src_' + id });
  step('Koh Samui: cave mushroom once a day', async c => { await go('koh_samui_jurassic'); const T = findT(/glowing cave mushroom/); c('pickup', !!T); if (!T) return; const n = AV.bag.count('magic_mushroom'); T.fn(); await sleep(300); T.fn(); await sleep(300); c('one per day', AV.bag.count('magic_mushroom') === n + 1) });
  step('no JS errors', async c => c('clean', !$('err').textContent, $('err').textContent));
  let active = steps;
  return { names() { active = steps; return steps.map(s => s.name) }, async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
