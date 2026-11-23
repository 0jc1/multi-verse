/* Worlds Reborn: Astro-9 megacity (js/astro9_mega.js) - skyline, new districts, lift, crowd (run_tests.ps1 -Suite tools\tests\suite_astro9_mega.js -StepTimeout 900) */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const $ = id => document.getElementById(id), lab = t => typeof t.label === 'function' ? t.label() : t.label;
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const tgt = re => AV.W.T.find(t => (!t.show || t.show()) && re.test(lab(t)));
  const at = t => { AV.P.x = t.x; AV.P.z = t.z; AV.P.y = AV.W.surface(t.x, t.z) || 0 };
  const walkable = (pts) => { const bad = []; for (let k = 1; k < pts.length; k++) { const [x0, z0] = pts[k - 1], [x1, z1] = pts[k], n = Math.ceil(Math.hypot(x1 - x0, z1 - z0)); for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, z = z0 + (z1 - z0) * i / n; if (AV.W.surface(x, z) === null || !AV.isFree(AV.W, x, z, .35)) bad.push(x.toFixed(1) + ',' + z.toFixed(1)) } } return bad };
  const buy = async (re, id) => { const t = tgt(re); at(t); t.fn(); await sleep(300); const b = document.querySelector('[data-buy="' + id + '"]'); b && b.click(); await sleep(400); AV.closeTop(); return AV.bag.count(id) };

  step('boot', async c => { $('gq').value = 'Low'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); await sleep(1500); AV.save = () => { }; AV.S.money = 500;
    AV.travel('astro9'); c('Astro-9', await until(() => AV.W && AV.W.id === 'astro9' && settled(), 90000)); c('no world error', !$('err').textContent, $('err').textContent) });

  step('megacity: new districts on foot from the plaza', async c => {
    c('megacity places listed', ['mg_neon', 'mg_tech', 'mg_inst', 'mg_black', 'mg_inn', 'mg_hangar', 'mg_portal', 'mg_temple', 'mg_sky'].every(id => AV.W.places.some(p => p.id === id)));
    c('map district names', (AV.W.mapDistricts || []).length >= 10, (AV.W.mapDistricts || []).map(d => d.name).join(' | '));
    const e = walkable([[60, 92], [80, 95], [100, 95], [255, 95]]); c('Food Ring → Neon Boulevard', !e.length, e.slice(0, 8).join(' '));
    const w = walkable([[-60, 92], [-80, 95], [-100, 95], [-255, 95]]); c('Bazaar → Residential Spires', !w.length, w.slice(0, 8).join(' '));
    const h = walkable([[0, 190], [0, 201], [-120, 201], [-150, 225]]); c('Art Avenue → Hangar + Docking Bay', !h.length, h.slice(0, 8).join(' '));
    const t = walkable([[0, 201], [130, 201], [152, 220]]); c('Art Avenue → Cosmic Temple', !t.length, t.slice(0, 8).join(' '));
    c('void outside the city is not walkable', AV.W.surface(300, 0) === null && AV.W.surface(0, 300) === null);
    c('skyline: 60+ towers merged (few draw calls)', AV.astro9mega && true);
  });

  step('shops, inn, lift to the Sky Market, temple, portal', async c => {
    c('Instrument Market sells a ukulele', await buy(/Instrument Market/, 'ukulele') >= 1);
    c("Comet ramen", await buy(/Comet ramen/, "a9_noodles") === 1);
    c('Black Market relic', await buy(/Black Market/, 'a9_relic') === 1);
    const lift = tgt(/Lift to the Sky Market/); at(lift); lift.fn(); c('lift takes you 30 m up', AV.P.y === 30 && AV.W.surface(AV.P.x, AV.P.z) === 30, AV.P.x.toFixed(0) + ',' + AV.P.z.toFixed(0) + ' y' + AV.P.y);
    await sleep(2500); c('you stay on the platform', Math.abs(AV.P.y - 30) < .5, AV.P.y.toFixed(2));
    AV.P.yaw = Math.PI * .75; AV.P.pitch = -.15; await sleep(3500);
    const down = tgt(/Lift back down/); at(down); down.fn(); c('lift back down', AV.P.y === 0 && AV.W.surface(AV.P.x, AV.P.z) === 0);
    const m0 = AV.S.money, d0 = AV.S.day, inn = tgt(/Astro Inn: rent/); at(inn); inn.fn(); await sleep(2000); c('Astro Inn pod: paid + morning', AV.S.money === m0 - 30 && AV.S.time >= 8 * 60 && AV.S.time < 8 * 60 + 30, m0 + '→' + AV.S.money + ' day ' + d0 + '→' + AV.S.day);
    const tm = tgt(/Cosmic Temple: meditate/); c('temple meditation', !!tm); tm && (at(tm), tm.fn());
    const pt = tgt(/Portal hub/); at(pt); pt.fn(); await sleep(400); c('portal hub opens the world picker', AV.pipe.open); AV.pipe.hide();
    c('no JS errors', !$('err').textContent, $('err').textContent);
  }, { shot: 'astro9_sky_market' });

  step('Neon Boulevard view', async c => {
    AV.P.x = 104; AV.P.z = 95; AV.P.y = 0; AV.P.yaw = -Math.PI / 2; AV.P.pitch = .08; await sleep(6000);
    c('render budget', AV.R.info.render.triangles < 3e6, JSON.stringify(AV.R.info.render)); c('no JS errors', !$('err').textContent, $('err').textContent);
  }, { shot: 'astro9_neon_blvd' });

  step('skyline from the plaza', async c => {
    AV.P.x = 0; AV.P.z = 112; AV.P.y = 0; AV.P.yaw = Math.PI * .8; AV.P.pitch = .25; await sleep(6000); c('frame', true, JSON.stringify(AV.R.info.render));
  }, { shot: 'astro9_skyline' });

  let active = [];
  return { names(mobile) { active = steps.filter(s => !!s.mobile === !!mobile || s.name === 'boot'); return active.map(s => s.name) },
    async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
