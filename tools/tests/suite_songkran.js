/* Worlds Reborn §35A: playable Songkran water fight (run_tests.ps1 -Suite tools\tests\suite_songkran.js -StepTimeout 900 [-Mobile]) */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const $ = id => document.getElementById(id), lab = t => typeof t.label === 'function' ? t.label() : t.label;
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const tgt = re => AV.W.T.find(t => (!t.show || t.show()) && re.test(lab(t)));
  const SK = () => AV.sk, K = () => AV.cm.sk;
  const mode = async m => { AV.cm.setMode(m); await sleep(500); return until(() => AV.W && AV.W.id === 'chiang_mai' && settled() && (m === 'songkran') === !!AV.cm.sk, 120000) };
  /* stand 3 m in front of a visible crowd character, facing them */
  const faceSomeone = () => { const w = K().crowd.list.find(w => w.shown && AV.isFree(AV.W, w.x, w.z + 3, .3)) || K().crowd.list.find(w => w.shown); if (!w) return null; AV.P.x = w.x; AV.P.z = w.z + 3; AV.P.y = AV.W.surface(AV.P.x, AV.P.z) || 0; AV.P.yaw = 0; AV.P.pitch = 0; w.react = 0; return w };
  const click = () => $('c').dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
  const release = () => window.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));

  step('boot', async c => { $('gq').value = 'Low'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); await sleep(1500); AV.save = () => { }; AV.S.money = 200;
    AV.travel('chiang_mai'); c('Chiang Mai', await until(() => AV.W && AV.W.id === 'chiang_mai' && settled(), 90000)); c('Songkran mode (F)', await mode('songkran')); c('no world error', !$('err').textContent, $('err').textContent) });

  step('festival street: crowd, tubs, stall, NPC water fights', async c => {
    c('denser splasher crowd (24 on Low)', K().splashers.length >= 24, K().splashers.length);
    c('blue refill tubs placed', SK().tubs.length >= 4, SK().tubs.length); c('Songkran stall near Giant Hostel', !!SK().stall && !!tgt(/Songkran stall/));
    const seen = new Set(); const ok = await until(() => { K().splashers.forEach(w => { if (w.mode === 'splash') seen.add(w) }); return seen.size >= 5 }, 400000); c('5+ different NPCs throw water on their own', ok, seen.size + ' seen splashing · ' + K().splashers.filter(w => w.shown).length + ' shown · near: ' + K().splashers.filter(w => Math.hypot(w.x - AV.P.x, w.z - AV.P.z) < 40).length);
    c('empty hands: no water HUD, clicks are not taken', !SK().tool() && SK().act(true) === false && $('skHud').style.display === 'none');
  });

  step('bucket: grab at a tub, click = full throw, empties, refill, throw again', async c => {
    const t = tgt(/grab a free bucket/); c('tub offers a free bucket', !!t, t && lab(t)); if (!t) return; AV.P.x = t.x; AV.P.z = t.z; t.fn();
    c('bucket in hand, full', SK().tool() === 'sk_bucket' && SK().fill('sk_bucket') === 100); const h = AV.bag.held(); c('bucket model with water inside', !!(h.item && h.item.getObjectByName('water') && h.item.getObjectByName('water').visible));
    const w = faceSomeone(); c('someone to splash', !!w); if (!w) return;
    click(); c('click (mouse not captured yet) starts the throw', SK().anim && SK().anim.kind === 'bucket'); SK()._ff(1);
    c('one big throw: bucket empty, the person flinches', SK().fill('sk_bucket') === 0 && SK().last.kind === 'bucket' && SK().last.hits >= 1 && w.react > 0, JSON.stringify(SK().last));
    c('water shown empty in the bucket', !AV.bag.held().item.getObjectByName('water').visible);
    click(); SK()._ff(.5); c('empty bucket: nothing thrown', SK().fill('sk_bucket') === 0 && !SK().anim);
    const tb = tgt(/Refill/); AV.P.x = tb.x; AV.P.z = tb.z; tb.fn(); c('refill at the tub', SK().fill('sk_bucket') === 100);
    faceSomeone(); click(); SK()._ff(1); c('second throw', SK().fill('sk_bucket') === 0 && SK().last.hits >= 1, JSON.stringify(SK().last));
    c('water HUD shows the bucket', /bucket/i.test($('skHud').textContent) && $('skHud').style.display === 'block', $('skHud').textContent);
  });

  step('water gun: hold = stream, release = stop; bottle: click = flick, not a punch', async c => {
    const st = tgt(/Songkran stall/); AV.P.x = st.x; AV.P.z = st.z; st.fn(); await sleep(200); const m0 = AV.S.money; $('cmp').querySelector('[data-sk="sk_gun"]').click();
    c('bought a water gun (25), in hand, full', SK().tool() === 'sk_gun' && AV.S.money === m0 - 25 && SK().fill('sk_gun') === 100);
    faceSomeone(); click(); c('hold: spraying', SK().spraying === true); SK()._ff(1.5); const f1 = SK().fill('sk_gun'); c('the tank drains while you hold', f1 < 85 && f1 > 70, f1.toFixed(1)); c('the stream soaks people', S0h() > 0);
    release(); c('release: stops at once', SK().spraying === false); SK()._ff(1); c('no more water used after release', SK().fill('sk_gun') === f1);
    st.fn(); await sleep(200); $('cmp').querySelector('[data-sk="sk_bottle"]').click(); c('squeeze bottle in hand', SK().tool() === 'sk_bottle');
    faceSomeone(); AV.punch.punch(); c('V / punch with the bottle = a water flick', SK().anim && SK().anim.kind === 'bottle'); SK()._ff(.6); c('one flick uses 20%', SK().fill('sk_bottle') === 80, SK().fill('sk_bottle'));
    for (let i = 0; i < 6; i++) { click(); SK()._ff(.6) } c('5 flicks per fill, then empty', SK().fill('sk_bottle') === 0);
    c('no JS errors', !$('err').textContent, $('err').textContent);
  });
  const S0h = () => AV.S.sk.hits;

  step('switch Songkran off and on: festival goes, tools stay', async c => {
    c('Normal mode', await mode('normal')); c('no festival tubs or stall', !AV.cm.sk && !SK().tubs.length && !tgt(/Songkran stall|Water tub/), JSON.stringify({ sk: !!AV.cm.sk, tubs: SK().tubs.length, t: !!tgt(/Songkran stall|Water tub/) })); c('water HUD hidden', await until(() => $('skHud').style.display === 'none', 120000));
    c('tools kept in the backpack', AV.bag.count('sk_bucket') && AV.bag.count('sk_gun') && AV.bag.count('sk_bottle'));
    AV.bag.equip('sk_gun'); click(); c('outside Songkran a click is not a water shot', !SK().spraying); release();
    c('Songkran again', await mode('songkran')); c('tubs back', SK().tubs.length >= 4); c('no JS errors', !$('err').textContent, $('err').textContent);
  });

  step('phone: SPLASH button tap and hold', async c => {
    $('gq').value = 'Low'; $('bNew').click(); await until(() => AV.W && AV.running, 30000); await sleep(1500); AV.save = () => { };
    AV.travel('chiang_mai'); await until(() => AV.W && AV.W.id === 'chiang_mai' && settled(), 90000); c('Songkran', await mode('songkran'));
    AV.bag.add('sk_gun', 1, true); AV.bag.equip('sk_gun'); const b = $('tU'); c('SPLASH button shown', getComputedStyle(b).display === 'block' && b.textContent === 'SPLASH', b.textContent);
    faceSomeone(); b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); c('hold SPLASH: spraying', SK().spraying === true); await sleep(600); SK()._ff(1); c('still spraying while held', SK().spraying === true);
    b.dispatchEvent(new PointerEvent('pointerup', { bubbles: true })); c('let go: stops', SK().spraying === false);
    AV.bag.add('sk_bucket', 1, true); AV.bag.equip('sk_bucket'); AV.S.sk.fill.sk_bucket = 100; b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); b.dispatchEvent(new PointerEvent('pointerup', { bubbles: true })); SK()._ff(1); c('tap SPLASH with the bucket: throw', SK().fill('sk_bucket') === 0);
  }, { mobile: true, shot: 'songkran_phone' });

  let active = [];
  return { names(mobile) { active = steps.filter(s => !!s.mobile === !!mobile || s.name === 'boot'); return active.map(s => s.name) },
    async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
