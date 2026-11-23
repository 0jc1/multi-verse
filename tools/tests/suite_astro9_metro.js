/* Worlds Reborn §5: Astro-9 metropolis, first district (run_tests.ps1 -Suite tools\tests\suite_astro9_metro.js -StepTimeout 900) */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const $ = id => document.getElementById(id), lab = t => typeof t.label === 'function' ? t.label() : t.label;
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const tgt = re => AV.W.T.find(t => (!t.show || t.show()) && re.test(lab(t)));
  const at = t => { AV.P.x = t.x; AV.P.z = t.z; AV.P.y = AV.W.surface(t.x, t.z) || 0 };
  /* every metre along a line is walkable ground and not inside a wall / post */
  const walkable = (x0, z0, x1, z1) => { const n = Math.ceil(Math.hypot(x1 - x0, z1 - z0)), bad = []; for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, z = z0 + (z1 - z0) * i / n; if (AV.W.surface(x, z) === null || !AV.isFree(AV.W, x, z, .35)) bad.push(x.toFixed(1) + ',' + z.toFixed(1)) } return bad };

  step('boot', async c => { $('gq').value = 'Low'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); await sleep(1500); AV.save = () => { }; AV.S.money = 300;
    AV.travel('astro9'); c('Astro-9', await until(() => AV.W && AV.W.id === 'astro9' && settled(), 90000)); c('no world error', !$('err').textContent, $('err').textContent) });

  step('walk out of the station through the south gate to the Spiral Plaza', async c => {
    c('metropolis places listed', ['m_plaza', 'm_bazaar', 'm_food', 'm_gate'].every(id => AV.W.places.some(p => p.id === id)));
    const b1 = walkable(0, 30, 0, 86); c('arrival → south gate → boulevard → plaza: every metre walkable', !b1.length, b1.slice(0, 6).join(' '));
    const b2 = walkable(-12, 94, -90, 94); c('plaza → bazaar street', !b2.length, b2.slice(0, 6).join(' '));
    const b3 = walkable(12, 94, 88, 94); c('plaza → food ring', !b3.length, b3.slice(0, 6).join(' '));
    c('Club Graviton zero gravity still there', AV.W.gravityAt(0, -18) === 0); c('the plaza has normal gravity', AV.W.gravityAt(0, 94) !== 0);
  });

  step('Intergalactic Bazaar: walk into a shop and buy', async c => {
    const shops = AV.W.T.filter(t => /🛍/.test(lab(t))); c('4 enterable shops', shops.length === 4, shops.map(lab).join(' | '));
    const s = shops[0], door = [s.x, 84]; const b = walkable(door[0], 90, door[0], 77.8); c('through the door to the counter', !b.length, b.join(' '));
    at(s); const m0 = AV.S.money; s.fn(); await sleep(200); const btn = document.querySelector('[data-buy]'); c('shop panel with items', !!btn); if (btn) { btn.click(); await sleep(300) } c('bought a singing crystal', AV.bag.count('a9_crystal') === 1 && AV.S.money === m0 - 40, (m0 - AV.S.money) + ' credits');
    AV.closeTop(); const s2 = shops[1]; at(s2); s2.fn(); await sleep(500); const b2 = document.querySelector('[data-buy]'); b2 && b2.click(); await sleep(300); c('second shop: alien mixtape', AV.bag.count('a9_tape') === 1); AV.closeTop();
  });

  step('Food Ring + Astro Café', async c => {
    const cafe = tgt(/Astro Café counter/); c('café counter', !!cafe); const b = walkable(40, 92, 40, 75.6); c('walk in through the café door', !b.length, b.join(' '));
    at(cafe); cafe.fn(); await sleep(200); const btn = document.querySelector('[data-buy="a9_nebula_tea"]'); c('café menu: nebula tea', !!btn); btn && btn.click(); await sleep(300); c('tea in the backpack', AV.bag.count('a9_nebula_tea') === 1); AV.closeTop();
    c('3 food stalls', AV.W.T.filter(t => /🍜/.test(lab(t))).length === 3);
  });

  step('hover shuttle: plaza → Club Graviton → Food Ring', async c => {
    const st = tgt(/Hover shuttle stop · Spiral Plaza/); c('shuttle stop on the plaza', !!st); at(st); st.fn(); await sleep(200); $('cmp').querySelector('[data-st="club"]').click();
    c('riding in a pod', !!AV.astro9m.cur && AV.astro9m.cur.to.id === 'club'); AV.astro9m.skip(); c('arrived next to Club Graviton', Math.hypot(AV.P.x + 22, AV.P.z + 6) < 6, AV.P.x.toFixed(1) + ',' + AV.P.z.toFixed(1));
    const s2 = tgt(/Hover shuttle stop · Club Graviton/); at(s2); s2.fn(); await sleep(200); $('cmp').querySelector('[data-st="food"]').click(); c('pod flies along a raised curve', AV.astro9m.cur && AV.astro9m.cur.curve.getPointAt(.5).y > 8);
    c('the pod moves with real time', await until(() => !AV.astro9m.cur || AV.astro9m.cur.s > 0, 120000)); AV.astro9m.skip(); c('arrived at the Food Ring', Math.hypot(AV.P.x - 86, AV.P.z - 100) < 6);
  });

  step('alive: crowd, busker, map', async c => {
    const near = (AV.beings.list || []).filter(b => b.h && Math.hypot(b.h.position.x, b.h.position.z - 94) < 30).length; c('crowd on and around the plaza', near >= 5, near + ' characters');
    c('street synth busker spot on the plaza', AV.act.venues.some(v => v.type === 'inst' && v.z > 60), AV.act.venues.map(v => v.type + '@' + Math.round(v.z || 0)).join(' '));
    if (AV.minimap) { AV.minimap._buildNow && (AV.minimap.base && AV.minimap.base.W === AV.W) && AV.minimap._buildNow(); const px = AV.minimap._px && AV.minimap._px(0, 94); c('the plaza is on the minimap', !px || px[3] === 255, JSON.stringify(px)) }
    AV.P.x = 0; AV.P.z = 75; AV.P.y = 0; AV.P.yaw = Math.PI; AV.P.pitch = .12; await sleep(4000); c('no JS errors', !$('err').textContent, $('err').textContent);
  }, { shot: 'astro9_plaza' });

  let active = [];
  return { names(mobile) { active = steps.filter(s => !!s.mobile === !!mobile || s.name === 'boot'); return active.map(s => s.name) },
    async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
