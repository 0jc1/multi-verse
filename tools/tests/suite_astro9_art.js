/* Cinematic V1: Astro-9 district 2 (js/astro9_art.js) - Art Avenue, Prism Gallery, Mural Alley, Spray Lab.
   run_tests.ps1 -Suite tools/tests/suite_astro9_art.js -StepTimeout 900 */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(150) } return false };
  const at = (x, z, yaw, pitch) => { const P = AV.P; P.x = x; P.z = z; P.y = AV.W.surface(x, z) || 0; P.vx = P.vz = P.vy = 0; if (yaw != null) P.yaw = yaw; P.pitch = pitch || 0 };
  const bad = pts => { const out = []; for (let k = 1; k < pts.length; k++) { const [x0, z0] = pts[k - 1], [x1, z1] = pts[k], n = Math.ceil(Math.hypot(x1 - x0, z1 - z0)); for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, z = z0 + (z1 - z0) * i / n; if (AV.W.surface(x, z) === null || !AV.isFree(AV.W, x, z, .35)) out.push(x.toFixed(1) + ',' + z.toFixed(1)) } } return out };
  step('boot', async c => { $('gq').value = 'Medium'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); await sleep(1500); AV.save = () => { };
    AV.travel('astro9'); c('Astro-9', await until(() => AV.W && AV.W.id === 'astro9' && $('fade').style.opacity === '0', 150000)); c('no world error', !$('err').textContent, $('err').textContent) });
  step('district 2: built + walkable', async c => {
    const f = AV.astro9art && AV.astro9art.fx; c('art district built', !!f && f.murals === 6 && f.works === 8 && f.banners === 8, JSON.stringify(f));
    let b = bad([[0, 119], [0, 200], [0, 205]]); c('Art Avenue: walkable end to end, plaza → Glassopy', !b.length, b.slice(0, 6).join(' '));
    b = bad([[0, 126.5], [-8, 126.5], [-13, 126.5], [-13, 122], [-21.5, 122], [-21.5, 131], [-13, 131], [-9.4, 129.6]]); c('Prism Gallery: door → loop past every wall → shop desk', !b.length, b.slice(0, 6).join(' '));
    b = bad([[0, 124], [8, 124], [37, 124], [37, 104], [37, 97]]); c('Mural Alley: Art Avenue → Food Ring shortcut', !b.length, b.slice(0, 6).join(' '));
    b = bad([[0, 131.3], [5.4, 131.3]]); c('Spray Lab counter reachable', !b.length, b.join(' '));
    b = bad([[0, 151], [-8, 151]]); c('Cinema 9 door still open', !b.length, b.join(' '));
    b = bad([[0, 150], [8, 150]]); c('Orbit Lounge door still open', !b.length, b.join(' '));
    const W = AV.W, lab = l => typeof l === 'function' ? l() : String(l); const has = s => W.T.some(t => lab(t.label).includes(s));
    for (const s of ['Prism Gallery shop', 'open wall', 'Spray Lab', 'Kinetic sculpture', 'wall text']) c('interaction: ' + s, has(s));
    const ppl = (AV.beings.list || []).filter(p => p.mode === 'chat' || p.mode === 'look'); c('expressive people (chat / look) spawned', ppl.length >= 4, ppl.length);
    const tag = W.T.find(t => lab(t.label).includes('open wall')); const n0 = (AV.S.a9tags || []).length; tag.fn(); c('tag wall: spraying adds your tag', (AV.S.a9tags || []).length === Math.min(10, n0 + 1));
    c('no JS errors', !$('err').textContent, $('err').textContent) });
  step('Art Avenue looking south', async c => { at(0, 120, Math.PI, .06); await sleep(6000); c('render', true, JSON.stringify(AV.R.info.render)) }, { shot: 'art_avenue' });
  step('Prism Gallery facade', async c => { at(5.5, 126.5, Math.PI / 2, .1); await sleep(5000); c('render', true, JSON.stringify(AV.R.info.render)) }, { shot: 'art_gallery_facade' });
  step('Prism Gallery inside', async c => { at(-8.2, 127.5, Math.PI / 2 - .25, .05); await sleep(5000); c('render', true, JSON.stringify(AV.R.info.render)) }, { shot: 'art_gallery_inside' });
  step('Mural Alley', async c => { at(8.5, 124, -Math.PI / 2, .08); await sleep(5000); c('render', true, JSON.stringify(AV.R.info.render)) }, { shot: 'art_alley' });
  step('Mural Alley north leg', async c => { at(37, 125.5, 0, .1); await sleep(5000); c('render', true, JSON.stringify(AV.R.info.render)) }, { shot: 'art_alley_leg' });
  step('alley mouth from the Food Ring', async c => { at(37, 96, Math.PI, .1); await sleep(5000); c('render', true, JSON.stringify(AV.R.info.render)) }, { shot: 'art_alley_food' });
  step('living paintings + painter', async c => { at(0, 168, Math.PI, .05); await sleep(5000); c('render', true, JSON.stringify(AV.R.info.render)); c('no JS errors', !$('err').textContent, $('err').textContent) }, { shot: 'art_paintings' });
  let active = [];
  return { names(mobile) { active = steps.filter(s => !!s.mobile === !!mobile || s.name === 'boot'); return active.map(s => s.name) },
    async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
