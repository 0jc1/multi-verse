/* APEVERSE 2.3 MILESTONE A - the first playable loop, played through the real game objects (sandboxed save):
   new game with 10 000 credits -> Pip offers "Welcome to Ape Town" (marker + journal) -> branching talk -> buy a bissap and drink it
   sip by sip -> talk to Zil -> Remy's agency: rent a studio -> walk in -> sleep (saves, home spawn) -> reward + follow-ups unlocked.
   Then: a daily job (Sol, dialogue puzzle), a delivery against the clock, the old-save starter grant, NPC memory across talks,
   Chiang Mai reception shift + rooftop party, save round trip, and the inherited 2.2 bugs (short waypoint, consumables busy gap).
   run_tests.ps1 -Suite tools/tests/suite_lw23a.js -Gpu -W 1536 -H 864 -Port 8102 -StepTimeout 900 */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const go = async id => { if (AV.W && AV.W.id === id) return true; AV.travel(id); return until(() => AV.W && AV.W.id === id && settled(), 240000) };
  const lbl = t => { try { return typeof t.label === 'function' ? t.label() : String(t.label) } catch (e) { return '' } };
  const findT = re => AV.W.T.find(t => re.test(lbl(t)) && (!t.show || t.show()));
  const put = (x, z) => { const P = AV.P; P.x = x; P.z = z; P.y = AV.W.surface(x, z) || 0; P.vx = P.vz = 0 };
  const near = id => { const n = AV.npc.find(id); if (n) put(n.g.position.x + 1.6, n.g.position.z + 1.6); return n };
  const errs = () => (window.__APE_ERRS || []).filter(e => !/api\/mp\//.test(e));
  const pickAll = async res => { for (const re of res) { await until(() => AV.convo.cur, 2000); if (!AV.convo.pick(re)) return 'no option ' + re + ' in ' + JSON.stringify(AV.convo.options()); await sleep(150) } return '' };
  const stage = id => { const a = AV.mis.st().a[id]; return a ? a.s : (AV.mis.done(id) ? 'done' : 'none') };
  const paid = (d, base) => d === base || d === base + 150;   /* 2.3 C: every 3rd mission in a day adds the +150 hustle-streak bonus */
  const sumCons = () => { const d = (AV.S.cons && AV.S.cons.done) || {}; return Object.values(d).reduce((a, b) => a + b, 0) };

  step('boot: new game (sandboxed save)', async c => { c('page scripts loaded', await until(() => window.AV && AV.boot && $('bNew') && $('bNew').onclick, 120000));
    window.__real = localStorage.getItem('apeverse_v09'); AV.saveKey = 'apeverse_test_lw23a'; try { localStorage.removeItem(AV.saveKey); localStorage.removeItem(AV.saveKey + '_bak') } catch (e) { }
    $('gq').value = 'Medium'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 60000)); await sleep(2500);
    c('2.3 systems loaded (missions, dialogue, property, core)', !!(AV.mis && AV.convo && AV.LW && AV.LW.agency && AV.mis.defs.at_welcome));
    c('new game starts with 10 000 credits', AV.S.money === 10000, AV.S.money); c('starts in Ape Town', AV.W.id === 'ape_town', AV.W.id);
    c('new game: no starter-grant offer', AV.S.lw && AV.S.lw.grant === 'new', JSON.stringify(AV.S.lw)); c('no JS errors at boot', !errs().length, errs().join(' | ')) });

  step('Pip offers the first mission (marker, journal, offer talk)', async c => { await sleep(1200); const pip = AV.npc.find('pip'); c('Pip is in Ape Town', !!pip);
    c('Pip has work: a mission offer', AV.mis.offersFor('pip').some(d => d.id === 'at_welcome'));
    await sleep(800); c('gold ❗ marker over the giver (3D + minimap)', (AV.mis._marks || []).some(m => m.kind === 'give'), JSON.stringify((AV.mis._marks || []).map(m => m.key)));
    c('minimap shows mission marks', (AV.minimap.markers() || []).some(m => m.icon === '❗'));
    AV.mis.journal('av'); await sleep(300); c('journal lists it under Available', /Welcome to Ape Town/.test($('cmp').textContent)); AV.closePanel('cmp');
    near('pip'); AV.openChat('pip'); await sleep(700); const chip = [...document.querySelectorAll('#lwChips button')].find(b => /Welcome to Ape Town/.test(b.textContent)); c('mission chip in the chat with Pip', !!chip); chip && chip.click(); await sleep(400);
    c('offer conversation opens', !!AV.convo.cur, JSON.stringify(AV.convo.options())); c('offer explains the reward on request', !(await pickAll([/What do I get/])) && /credits|créditos/.test(AV.convo.lastLine()), AV.convo.lastLine());
    c('accept', !(await pickAll([/Deal/]))); c('mission active, step 1 (talk to Pip)', stage('at_welcome') === 0, stage('at_welcome'));
    await sleep(700); c('objective HUD shows the step', $('lwObj').style.display === 'block' && /Pip/.test($('lwObj').textContent), $('lwObj').textContent) }, { shot: 'lw_a_offer' });

  step('branching talk with Pip (choose who you are)', async c => { c('talk stage chip', AV.mis.talkStagesFor('pip').length === 1); AV.mis.talkStage('at_welcome'); await sleep(300);
    c('four life paths offered', AV.convo.options().length === 4, JSON.stringify(AV.convo.options()));
    const e = await pickAll([/Business/, /what first/, /On it/]); c('pick "entrepreneur" and continue', !e, e); await sleep(500);
    c('choice remembered (path + Pip flag)', AV.LW.st().path === 'biz' && AV.LW.rel('pip').f.path === 'biz'); c('advanced to step 2 (eat)', stage('at_welcome') === 1, stage('at_welcome')) }, { shot: 'lw_a_pip' });

  step('buy a bissap and drink it sip by sip (real kiosk + Consumables 2.0)', async c => { const T = findT(/Buy a bissap/); c('bissap kiosk', !!T); const m0 = AV.S.money, c0 = sumCons();
    put(T.x, T.z); T.fn(); await sleep(300); c('paid 6, carrying one', AV.S.money === m0 - 6 && AV.bag.count('bissap') === 1, AV.S.money + ' ' + AV.bag.count('bissap'));
    c('buying alone does not finish the step', stage('at_welcome') === 1);
    let sips = 0; for (let k = 0; k < 200 && AV.bag.count('bissap') > 0; k++) { if (!AV.bag.busy()) { AV.bag.use('bissap'); sips++ } await sleep(200) }
    c('drunk gradually (several sips), then gone', sips >= 2 && AV.bag.count('bissap') === 0 && sumCons() > c0, 'sips ' + sips);
    c('step done -> talk to Zil', await until(() => stage('at_welcome') === 2, 3000), stage('at_welcome')) });

  step('Zil (talk stage) -> Remy agency -> rent a studio', async c => { near('zil'); AV.mis.talkStage('at_welcome'); await sleep(300);
    c('Zil reacts to your chosen path', /entrepreneur/.test(AV.convo.lastLine()), AV.convo.lastLine()); const e = await pickAll([/Any work/, /Where do I live/, /Thanks/]); c('talk through work -> home', !e, e);
    c('step: find a home (Remy)', await until(() => stage('at_welcome') === 3, 2000)); const remy = near('remy'); c('Remy (estate agent) is on the plaza', !!remy);
    AV.convo.open('remy'); await sleep(300); c('Remy greets you', !!AV.convo.cur && AV.convo.lastLine().length > 10); await pickAll([/Rent or buy/]); c('advice depends on your money', /buy the studio|compra el estudio/.test(AV.convo.lastLine()), AV.convo.lastLine());
    await pickAll([/Listings/]); await sleep(300); c('agency lists homes with price, rent and what is included', /Mushroom Studio/.test($('cmp').textContent) && /Sleep/.test($('cmp').textContent));
    const m0 = AV.S.money, b = document.querySelector('[data-rent="at_mushroom_studio"]'); c('rent button', !!b); b && b.click(); await sleep(400);
    c('rented: paid 120, home is active', AV.S.money === m0 - 120 && AV.S.homes.at_mushroom_studio && AV.S.homes.at_mushroom_studio.st === 'rent', AV.S.money); AV.closePanel('cmp');
    c('step: go inside', await until(() => stage('at_welcome') === 4, 2000), stage('at_welcome')); c('navigation target = the studio door', !!AV.mis.where('at_welcome'), JSON.stringify(AV.mis.where('at_welcome'))) }, { shot: 'lw_a_agency' });

  step('walk in, sleep, mission complete (reward, follow-ups)', async c => { const p = AV.mis.where('at_welcome'); c('Navigate sets a GPS route to the door', AV.mis.navigate('at_welcome') && !!AV.minimap.dest);
    put(p.x, p.z); await sleep(200); const D = findT(/Your flat: go in/); c('door trigger', !!D); D && D.fn(); await sleep(1200); c('inside the studio', AV.home.inside === 'at_mushroom_studio');
    c('step: sleep', await until(() => stage('at_welcome') === 5, 2000)); const m0 = AV.S.money, d0 = AV.S.day; const bed = findT(/bed|cama/i); c('bed trigger', !!bed, AV.W.T.filter(t => Math.abs(t.x - AV.P.x) < 12 && Math.abs(t.z - AV.P.z) < 12).map(lbl).join(' | '));
    if (bed) { put(bed.x, bed.z); bed.fn(); await sleep(400); const sb = [...document.querySelectorAll('#cmp button, #cmp [data-a]')].find(x => /sleep|dormir/i.test(x.textContent)); if (sb) sb.click() } await sleep(600);

    c('slept: next morning, home spawn set', AV.S.day === d0 + 1 && AV.S.homeSpawn === 'at_mushroom_studio', AV.S.day + ' ' + AV.S.homeSpawn);
    c('mission complete', await until(() => AV.mis.done('at_welcome') === 1, 3000)); c('reward: +400 credits, +5 reputation', paid(AV.S.money - m0, 400) && AV.LW.rep('ape_town') >= 5, AV.S.money - m0);
    c('follow-up missions unlocked', ['at_zil_rush', 'at_dash_parcels', 'at_luma_canvas', 'at_sol_lunch'].every(id => AV.mis.available(id))); await sleep(600); AV.home.leave() }, { shot: 'lw_a_home' });

  step('daily job: lunch rush with Sol (dialogue puzzle, fail + retry)', async c => { await sleep(1200); near('sol'); c('offer', AV.mis.offer('at_sol_lunch')); await pickAll([/in\.|Deal|Me apunto/]);
    AV.mis.talkStage('at_sol_lunch'); let e = await pickAll([/bacon/, /Peanut/, /He can wait/, /Sorry/]); c('two wrong orders fail the job', !e && !AV.mis.active('at_sol_lunch') && AV.mis.st().f.at_sol_lunch === 1, e);
    c('failure does not block: available again', AV.mis.available('at_sol_lunch')); const m0 = AV.S.money; AV.mis.start('at_sol_lunch'); AV.mis.talkStage('at_sol_lunch');
    e = await pickAll([/Rainbow Bowl/, /Mango sorbet/, /Fruit salad/, /Same time/]); c('right orders: done + paid 110', !e && await until(() => AV.mis.done('at_sol_lunch') === 1, 2000) && paid(AV.S.money - m0, 110), e + ' ' + (AV.S.money - m0));
    c('repeatable, but once per day', !AV.mis.available('at_sol_lunch')) });

  step('delivery against the clock (Dash)', async c => { near('dash'); AV.mis.start('at_dash_parcels'); const r = AV.mis.st().a.at_dash_parcels.mv.route; c('random route of 3 drops', r && r.length === 3, JSON.stringify(r)); const m0 = AV.S.money;
    for (let i = 0; i < 3; i++) { const p = AV.mis.where('at_dash_parcels'); c('drop ' + (i + 1) + ' has a map point', !!p); if (!p) break; put(p.x + .5, p.z + .5); await until(() => !AV.mis.active('at_dash_parcels') || AV.mis.st().a.at_dash_parcels.s > i, 3000) }
    c('all delivered: paid 150', AV.mis.done('at_dash_parcels') === 1 && paid(AV.S.money - m0, 150), AV.S.money - m0) });

  step('NPC memory + reputation in conversation', async c => { near('zil'); AV.convo.open('zil'); await sleep(200); const met = AV.LW.rel('zil').met; c('Zil talk opens with greeting (met ' + met + ' times)', met >= 2 && !!AV.convo.cur);
    await pickAll([/say about me/]); c('Zil knows your reputation', /useful|fiar|reliable|útil/.test(AV.convo.lastLine()), AV.convo.lastLine()); await pickAll([/Back/, /See you/]);
    AV.convo.open('remy'); await sleep(200); c('Remy now greets you as a client', AV.convo.lastLine().length > 0, AV.convo.lastLine()); AV.convo.close() });

  step('old save: optional starter grant (never automatic)', async c => { const saved = JSON.parse(JSON.stringify(AV.S)); const lw = AV.S.lw; delete AV.S.lw; AV.S.money = 250;
    AV.LW.grantPanel(); await sleep(300); c('grant offered with an explanation', /starter grant/i.test($('cmp').textContent) && /250/.test($('cmp').textContent)); $('lwGrantNo').click(); c('declining keeps the balance', AV.S.money === 250 && AV.S.lw.grant === 'declined');
    delete AV.S.lw; AV.LW.grantPanel(); await sleep(200); $('lwGrantYes').click(); c('accepting adds 10 000 once', AV.S.money === 10250 && AV.S.lw.grant === 'taken'); AV.S.money = saved.money; AV.S.lw = lw });

  step('Chiang Mai: reception shift + rooftop party', async c => { c('travel', await go('chiang_mai')); await sleep(2500); c('Khun Pim (estate agent) is here', !!AV.npc.find('pim'));
    c('Mutt offers the reception shift', AV.mis.offersFor('mud').some(d => d.id === 'cm_reception')); near('mud'); AV.mis.start('cm_reception'); AV.mis.talkStage('cm_reception'); const m0 = AV.S.money;
    let e = await pickAll([/40 credits/, /Rooftop/, /Scooter at the desk/, /Same time/]); c('perfect shift: full pay 120', !e && AV.mis.done('cm_reception') === 1 && paid(AV.S.money - m0, 120), e + ' ' + (AV.S.money - m0));
    AV.mis.start('cm_rooftop'); for (const [who, re] of [['steve', /setlist/], ['nuni', /yourself/], ['zape', /Legend/], ['dino', /roof/]]) { near(who); await sleep(150); AV.mis.talkStage('cm_rooftop'); e = await pickAll([re]); c('invite / tell ' + who, !e, e); await sleep(250) }
    c('party mission complete, crew remembers it', AV.mis.done('cm_rooftop') === 1 && AV.LW.rel('steve').f.party === 1); c('follow-up: Big Blues jam unlocked', AV.mis.available('cm_steve_jam'));
    near('mud'); AV.convo.open('mud'); await sleep(200); c('Mutt remembers the party', /party|fiesta/i.test(AV.convo.lastLine()), AV.convo.lastLine()); AV.convo.close() }, { shot: 'lw_a_cm' });

  step('save round trip keeps missions, homes, relationships', async c => { const real = window.__realSave || null; const js = JSON.stringify(AV.S), o = JSON.parse(js);
    c('missions saved', o.mis && o.mis.d.at_welcome === 1 && o.mis.d.cm_rooftop === 1); c('home saved', o.homes && o.homes.at_mushroom_studio.st === 'rent'); c('relationships + reputation saved', o.rel && o.rel.zil.met >= 2 && o.lw.rep.ape_town >= 5);
    localStorage.setItem(AV.saveKey, js); const back = AV.loadSave(); c('reloads through AV.loadSave', back && back.s.mis.d.at_welcome === 1 && back.s.money === AV.S.money, back && back.from);
    c("the player's real save is untouched", localStorage.getItem('apeverse_v09') === window.__real) });

  step('2.2 bugs: short waypoint + consumables busy gap', async c => { const P = AV.P; AV.minimap.setDest(P.x + 8.8, P.z, 'kroket test'); await sleep(1500); c('a waypoint 8.8 m away is not cleared at once', !!AV.minimap.dest && AV.minimap.dest.name === 'kroket test');
    AV.minimap.setDest(P.x + 1.5, P.z, 'arrive'); await sleep(800); c('…and still arrives when you are on it', !AV.minimap.dest);
    AV.bag.add('beer', 1, true); AV.bag.equip('beer'); AV.bag.finish('beer'); let gap = 0; for (let k = 0; k < 700 && AV.bag.count('beer') > 0; k++) { if (!AV.bag.busy()) gap++; await sleep(60) }
    c('bag.busy() stays true between automatic sips', gap === 0 && AV.bag.count('beer') === 0, 'not-busy samples ' + gap + ', left ' + AV.bag.count('beer')) });

  step('no JS errors', async c => { c('no uncaught errors in the run', !errs().length, errs().slice(0, 5).join(' | ')); try { localStorage.removeItem('apeverse_test_lw23a'); localStorage.removeItem('apeverse_test_lw23a_bak') } catch (e) { } });

  return { names() { return steps.map(s => s.name) }, async exec(i) { const s = steps[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
