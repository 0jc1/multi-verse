/* Worlds Reborn §10: Pai first playable slice (run_tests.ps1 -Suite tools\tests\suite_pai.js -StepTimeout 900) */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const $ = id => document.getElementById(id), lab = t => typeof t.label === 'function' ? t.label() : t.label;
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const travel = async id => { AV.travel(id); return until(() => AV.W && AV.W.id === id && settled(), 90000) };
  const tgt = re => AV.W.T.find(t => (!t.show || t.show()) && re.test(lab(t)));
  const at = t => { AV.P.x = t.x; AV.P.z = t.z; AV.P.y = AV.W.surface(t.x, t.z) || 0 };
  const walkable = (x0, z0, x1, z1) => { const n = Math.ceil(Math.hypot(x1 - x0, z1 - z0)), bad = []; for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, z = z0 + (z1 - z0) * i / n; if (AV.W.surface(x, z) === null || !AV.isFree(AV.W, x, z, .35)) bad.push(x.toFixed(1) + ',' + z.toFixed(1)) } return bad };
  const buy = async (re, item) => { const t = tgt(re); if (!t) return 'no target'; at(t); t.fn(); await sleep(300); const b = document.querySelector('[data-buy="' + item + '"]'); if (!b) { AV.closeTop(); return 'no item' } b.click(); await sleep(500); AV.closeTop(); return AV.bag.count(item) };

  step('boot', async c => { $('gq').value = 'Low'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); await sleep(1500); AV.save = () => { }; AV.S.money = 400;
    c('Pai is a separate playable world', AV.isPlayable('pai') && AV.isPlayable('chiang_mai') && AV.isPlayable('jungle_dub')); c('Pai', await travel('pai')); c('no world error', !$('err').textContent, $('err').textContent) });

  step('Walking Street, café, vegan kitchen, tea & drums', async c => {
    const b = walkable(-95, 0, 95, 0); c('the whole Walking Street is walkable', !b.length, b.slice(0, 6).join(' '));
    const d = walkable(-40, 0, -40, -9.4); c('walk into Rainny Café', !d.length, d.join(' ')); c('smoothie bowl at Rainny Café', (await buy(/Rainny Café counter/, 'pai_bowl')) === 1);
    c('vegan massaman curry', (await buy(/Vegan kitchen/, 'pai_curry')) === 1); c('pot of tea at the Tea & Drum Circle', (await buy(/Tea & Drum Circle/, 'pai_tea')) === 1);
    c('hand drums to join', AV.act.venues.some(v => v.type === 'inst' && v.p.kind === 'bongo' && v.W === AV.W)); c('scooter rental', !!tgt(/scooter/i));
  });

  step('Sunset Bar + Paradise fire show by time of day', async c => {
    const b = walkable(86, 2, 86, 14.8); c('alley from the lane to Sunset Bar', !b.length, b.join(' ')); const p = walkable(40, 2, 40, 20.5); c('open front to Paradise Circus', !p.length, p.join(' '));
    AV.S.time = 14 * 60; c('daytime: Sunset Bar is chill', /chill/.test(lab(tgt(/Sunset Bar/))), lab(tgt(/Sunset Bar/))); c('Sunset Bar DJ booth', !!tgt(/DJ booth.*Sunset/));
    c('fire show not before 20:00', /20:00/.test(lab(tgt(/Paradise Circus/))));
    AV.S.time = 21 * 60; c('night: DJ tonight', /DJ tonight/.test(lab(tgt(/Sunset Bar/)))); c('night: fire show on', /watch the fire show/.test(lab(tgt(/Paradise Circus/))));
    AV.P.x = 40; AV.P.z = 6; AV.P.yaw = Math.PI; AV.P.pitch = .05; await sleep(5000);
  }, { shot: 'pai_night' });

  step('bridge, river hostel, bungalow, temple', async c => {
    const b = walkable(92, 0, 126, 0); c('bamboo bridge across the Pai River', !b.length, b.join(' ')); c('the river itself is water', AV.W.surface(106, 12) === null);
    c('River Jam bar + pirate sign', !!tgt(/River Jam bar/)); c('ukulele jam spot', AV.act.venues.some(v => v.type === 'inst' && v.p.kind === 'uke' && v.W === AV.W));
    const s = tgt(/Your bungalow/); at(s); s.fn(); c('sleep in a riverside bungalow until 08:00', await until(() => Math.abs(AV.S.time - 480) < 2, 20000), AV.S.time);
    c('quiet temple', !!tgt(/Temple: sit quietly/));
  });

  step('minivan to Chiang Mai and back, jungle trail to Jungle Dub', async c => {
    const m = tgt(/Minivan to Chiang Mai/); at(m); const m0 = AV.S.money; m.fn(); c('minivan → Chiang Mai (40)', await until(() => AV.W && AV.W.id === 'chiang_mai' && settled(), 90000) && AV.S.money === m0 - 40);
    const back = tgt(/Minivan to Pai/); c('Chiang Mai has the minivan back to Pai', !!back); if (back) { at(back); back.fn(); c('back in Pai', await until(() => AV.W && AV.W.id === 'pai' && settled(), 90000)) }
    const tr2 = tgt(/Jungle trail/); at(tr2); tr2.fn(); c('trail → Jungle Dub', await until(() => AV.W && AV.W.id === 'jungle_dub' && settled(), 90000));
    c('no JS errors', !$('err').textContent, $('err').textContent);
  });

  let active = [];
  return { names(mobile) { active = steps.filter(s => !!s.mobile === !!mobile || s.name === 'boot'); return active.map(s => s.name) },
    async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
