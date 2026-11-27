/* Apeverse V0.9.5 - backpack + effects test suite (run: run_tests.ps1 -Suite tools\tests\suite_bag.js [-Mobile]) */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const $ = id => document.getElementById(id), lab = t => typeof t.label === 'function' ? t.label() : t.label;
  const tgt = re => AV.W && AV.W.T.find(t => (!t.show || t.show()) && re.test(lab(t)));
  const place = (x, z, yaw) => { const W = AV.W, s = AV.safeSpot(W, x, z); AV.P.x = s[0]; AV.P.z = s[1]; AV.P.y = W.surface(s[0], s[1]) || 0; AV.P.vx = AV.P.vy = AV.P.vz = 0; if (yaw != null) AV.P.yaw = yaw };
  const settled = () => AV.W && $('fade').style.opacity === '0', closeAll = () => { let n = 0; while (AV.modals.length && n++ < 10) AV.closeTop() };
  const travel = async id => { AV.travel(id); return until(() => AV.W && AV.W.id === id && settled(), 25000) };
  const C = id => (AV.S.items || {})[id] || 0;

  step('boot', async c => { $('gq').value = 'Low'; $('bNew').click(); c('Ape Town loads', await until(() => AV.W && AV.W.id === 'ape_town' && AV.running, 20000)); await sleep(2500); c('starter items in the backpack', C('water') === 1 && C('coconut') === 1) });

  step('backpack panel', async c => {
    AV.toggleInv(); c('I opens the backpack', $('inv').style.display === 'block'); c('item cards with Use / Hold / Drop', $('inv').querySelectorAll('.bitem').length >= 2 && !!$('inv').querySelector('[data-u="water"]') && !!$('inv').querySelector('[data-d="water"]'));
    c('effects settings (intensity, duration, reduced motion, clear)', !!$('fxI') && !!$('fxD') && !!$('fxR') && !!$('fxX')); AV.toggleInv(); c('closes', $('inv').style.display !== 'block');
  });

  step('pick up + use with effects', async c => {
    const p = tgt(/Pick up .*Glowing mushroom/); c('glowing pickups on Ape Town', !!p); if (!p) return; place(p.x, p.z); await until(() => AV.nearTarget() === p, 5000); p.fn(); c('picked up into the backpack', C('magic_mushroom') === 1);
    c('picked item disappears from the world', !AV.W.T.includes(p));
    AV.bag.equip('magic_mushroom'); await sleep(300); c('held in first-person view', AV.cam.children.some(o => o.visible && o.children.length >= 2));
    AV.keymap.KeyU(); await until(() => !AV.bag.busy(), 20000); c('2.2: one bite does not eat it all', C('magic_mushroom') === 1); AV.bag.finish('magic_mushroom'); c('eat animation starts and item is consumed at the end', await until(() => C('magic_mushroom') === 0, 60000));
    const l0 = AV.fx.level('psy'); await sleep(6000); const l1 = AV.fx.level('psy'); c('effect ramps in gradually (not instant)', l1 > l0 && l1 > .05, l0.toFixed(2) + ' → ' + l1.toFixed(2));
    c('visible filter on the 3D view', /hue-rotate/.test($('c').style.filter), $('c').style.filter); c('vignette fades in', +$('fxv').style.opacity > .02, $('fxv').style.opacity);
    c('effect lasts minutes', AV.fx.active().some(e => e.type === 'psy' && e.left > 120), JSON.stringify(AV.fx.active()));
    if (AV.audio && AV.audio.tone) c('music softens (low-pass)', AV.audio.tone.frequency.value < 19000, Math.round(AV.audio.tone.frequency.value) + ' Hz');
    AV.S.set.reduce = true; await sleep(2500); c('reduced motion: no camera roll', Math.abs(AV.cam.rotation.z) < 1e-6); AV.S.set.reduce = false;
    AV.S.set.fxInt = 0; await sleep(300); c('intensity 0 removes the effect', AV.fx.level('psy') === 0); AV.S.set.fxInt = .7;
    AV.keymap.KeyX(); await sleep(400); c('X clears all effects immediately', AV.fx.active().length === 0 && $('c').style.filter === '');
  }, { shot: 'bag_mushroom' });

  step('drink + drop + persistence', async c => {
    closeAll(); AV.bag.finish('water'); c('drinking a bottle of water (sip by sip)', await until(() => C('water') === 0, 60000));
    place(0, 90, 0); AV.bag.drop('coconut'); await sleep(300); const t = tgt(/Pick up .*coconut/i); c('dropped item lies in the world', !!t && C('coconut') === 0);
    c('drop saved for this world', (AV.S.drops.ape_town || []).some(d => d.id === 'coconut'));
    await travel('jungle_dub'); c('backpack works on Jungle Dub (pickups there)', !!tgt(/Pick up/)); await travel('ape_town'); await sleep(800);
    const t2 = AV.W.T.find(x => /Pick up .*coconut/i.test(lab(x)) && Math.hypot(x.x - t.x, x.z - t.z) < 1); c('dropped coconut is still there after travelling', !!t2); if (t2) { t2.fn(); c('picked back up', C('coconut') === 1) }
    AV.save(); let s = null; try { s = JSON.parse(localStorage.getItem('apeverse_v09')) } catch (e) { } c('backpack saved with the game', s && s.items && s.items.coconut === 1);
  });

  step('instrument + alien item', async c => {
    closeAll(); const f = tgt(/Pick up .*Bamboo flute/); c('flute pickup', !!f); if (f) { place(f.x, f.z); f.fn() }
    AV.bag.use('bamboo_flute'); await until(() => !AV.bag.busy(), 60000); c('instruments are kept after playing', C('bamboo_flute') === 1);
    await travel('astro9'); const cr = tgt(/Pick up .*crystal/i); c('Astro-9 alien crystal pickup', !!cr); if (cr) { place(cr.x, cr.z); cr.fn(); AV.bag.use('space_crystal'); await until(() => !AV.bag.busy(), 60000); await sleep(4000); c('alien item works and is reusable', C('space_crystal') === 1 && AV.fx.level('psy') > 0) } AV.fx.reset();
  });

  step('Chiang Mai shop + smoking rules', async c => {
    await travel('chiang_mai'); await sleep(1500); closeAll(); AV.S.money = 500;
    place(27.5, 54.4, Math.PI); AV.cm.shopPanel(); await sleep(200); for (const id of ['beer', 'pre', 'pipe', 'herb']) $('cmp').querySelector('[data-i="' + id + '"]').click(); AV.closePanel('cmp');
    c('hostel shop sells into the backpack', C('beer') === 1 && C('pre') === 1 && C('pipe') === 1 && C('herb') === 1);
    AV.bag.use('pre'); await sleep(300); c('no smoking inside the hostel (Mutt’s rule)', C('pre') === 1 && /Terrace only|Solo en la terraza/.test($('toast').textContent) && !AV.bag.busy(), $('toast').textContent);
    place(25, 49.5, 0); AV.bag.finish('pre'); c('smoking on the terrace works (drag by drag, to the end)', await until(() => C('pre') === 0, 60000)); await sleep(5000); c('smoke effect builds up', AV.fx.level('smoke') > .05, AV.fx.level('smoke').toFixed(2));
    await until(() => !AV.bag.busy(), 60000); AV.bag.use('pipe'); await until(() => C('herb') === 0, 60000); c('the pipe uses a herb pouch and is kept', C('pipe') === 1 && C('herb') === 0);
    await until(() => !AV.bag.busy(), 60000); AV.bag.finish('pipe'); await until(() => !AV.bag.busy() && AV.S.cons.open.pipe.left === 0, 60000); AV.bag.use('pipe'); await sleep(300); c('empty pipe refuses without herb', /Empty|Vacía/.test($('toast').textContent), $('toast').textContent);
    await until(() => !AV.bag.busy(), 60000); AV.bag.finish('beer'); await until(() => C('beer') === 0, 40000); await sleep(4000); c('beer makes you tipsy (gradually)', AV.fx.level('drink') > .03, AV.fx.level('drink').toFixed(2)); AV.fx.reset();
  }, { shot: 'bag_chiang_mai' });

  /* phone */
  step('phone: Use button', async c => {
    $('bNew').click(); await until(() => AV.W && AV.running, 20000); await sleep(2500);
    AV.bag.equip('water'); await sleep(200); c('Use button appears when holding an item', getComputedStyle($('tU')).display === 'block');
    $('tU').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); c('Use button uses the held item', await until(() => (AV.S.items.water || 0) === 0, 10000));
    $('tI').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); await sleep(300); c('Bag button opens the backpack', $('inv').style.display === 'block');
  }, { mobile: true, shot: 'bag_phone' });

  let active = [];
  return { names(mobile) { active = steps.filter(s => !!s.mobile === !!mobile); return active.map(s => s.name) },
    async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
