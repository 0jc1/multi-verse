/* Worlds Reborn §5: Astro-9 district 2 - Art Avenue, Cinema 9 hall, Orbit Lounge, Glassopy (run_tests.ps1 -Suite tools\tests\suite_astro9_d2.js -StepTimeout 900) */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const $ = id => document.getElementById(id), lab = t => typeof t.label === 'function' ? t.label() : t.label;
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const tgt = re => AV.W.T.find(t => (!t.show || t.show()) && re.test(lab(t)));
  const at = t => { AV.P.x = t.x; AV.P.z = t.z; AV.P.y = AV.W.surface(t.x, t.z) || 0 };
  const walkable = (pts) => { const bad = []; for (let k = 1; k < pts.length; k++) { const [x0, z0] = pts[k - 1], [x1, z1] = pts[k], n = Math.ceil(Math.hypot(x1 - x0, z1 - z0)); for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, z = z0 + (z1 - z0) * i / n; if (AV.W.surface(x, z) === null || !AV.isFree(AV.W, x, z, .35)) bad.push(x.toFixed(1) + ',' + z.toFixed(1)) } } return bad };
  const D2 = () => AV.astro9m2;

  step('boot', async c => { $('gq').value = 'Low'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); await sleep(1500); AV.save = () => { }; AV.S.money = 300;
    AV.travel('astro9'); c('Astro-9', await until(() => AV.W && AV.W.id === 'astro9' && settled(), 90000)); c('no world error', !$('err').textContent, $('err').textContent) });

  step('plaza → Art Avenue → Observatory on foot', async c => {
    c('district 2 places listed', ['m2_ave', 'm2_cinema', 'm2_lounge', 'm2_obs'].every(id => AV.W.places.some(p => p.id === id)));
    const b = walkable([[0, 30], [0, 86], [6, 89], [6, 100], [3, 114], [3, 200], [0, 208]]); c('station → plaza → avenue → observatory, every metre walkable', !b.length, b.slice(0, 8).join(' '));
    c('6 living paintings', AV.W.T.filter(t => /Living painting/.test(lab(t))).length === 6); const t = tgt(/Glassopy telescope/); at(t); t.fn(); await sleep(400); c('telescope view opens', !!$('a9sky')); AV.closeTop();
  });

  step('Cinema 9 hall: walk in, popcorn, seat, the screen', async c => {
    const b = walkable([[0, 151], [-9, 151], [-10, 142], [-28, 142]]); c('through the door and down the aisle', !b.length, b.join(' '));
    c('hall walls block (no walking through the side)', !AV.isFree(AV.W, -20, 134.2, .35) || AV.W.surface(-20, 133) === null);
    const p = tgt(/Popcorn/); at(p); p.fn(); await sleep(300); const bb = document.querySelector('[data-buy="a9_popcorn"]'); bb && bb.click(); await sleep(400); AV.closeTop(); c('popcorn bought', AV.bag.count('a9_popcorn') === 1);
    const s = tgt(/take a seat/); at(s); s.fn(); c('seated facing the screen', Math.abs(AV.P.yaw - Math.PI / 2) < .01 && AV.P.x < -10, AV.P.x.toFixed(1) + ',' + AV.P.z.toFixed(1));
    const scr = AV.media.screens.find(x => /ART AVENUE/.test(x.name)); c('Cinema 9 screen with a programme', !!scr && scr.list.length > 0, scr && scr.list.length + ' items');
    c('the film starts when you sit (or the idle loop shows if the files are missing)', await until(() => scr.state === 'playing' || scr.state === 'loading' || scr.state === 'error', 90000), scr && scr.state);
  });

  step('Orbit Lounge: jazz, bar, band, jam', async c => {
    const b = walkable([[0, 150], [9, 150], [15, 141]]); c('walk into the lounge', !b.length, b.join(' '));
    AV.P.x = 18; AV.P.z = 150; c('the lounge jazz starts inside', await until(() => D2().jazz.on && D2().jazz.level > .5, 120000), D2().jazz.level.toFixed(2));
    c('world music ducks for the jazz', AV.media.extraDuck() > .5); const bar = tgt(/Orbit Lounge bar/); at(bar); bar.fn(); await sleep(300); const bb = document.querySelector('[data-buy="a9_cosmo"]'); bb && bb.click(); await sleep(400); AV.closeTop(); c('a supernova spritz', AV.bag.count('a9_cosmo') === 1);
    c('jazz trio on stage', (AV.beings.list || []).filter(x => x.h && x.h.position.x > 27 && x.h.position.z > 145 && x.h.position.z < 155).length >= 3);
    c('keys to sit in on the jam', AV.act.venues.some(v => v.type === 'inst' && v.p.kind === 'keys' && v.W === AV.W && v.x > 7));
    AV.P.x = 0; AV.P.z = 100; c('jazz fades away on the plaza', await until(() => D2().jazz.level < .05, 120000), D2().jazz.level.toFixed(2));
    c('Club Graviton zero-g unchanged', AV.W.gravityAt(0, -18) === 0); c('no JS errors', !$('err').textContent, $('err').textContent);
    AV.P.x = 0; AV.P.z = 124; AV.P.yaw = Math.PI; AV.P.pitch = .1; await sleep(4000);
  }, { shot: 'astro9_avenue' });

  let active = [];
  return { names(mobile) { active = steps.filter(s => !!s.mobile === !!mobile || s.name === 'boot'); return active.map(s => s.name) },
    async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
