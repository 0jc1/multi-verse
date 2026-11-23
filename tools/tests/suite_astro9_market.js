/* Cinematic V1: Astro-9 district 1 (js/astro9_market.js) - souk Bazaar, night-market Food Ring, mosaic colonnade plaza.
   run_tests.ps1 -Suite tools\tests\suite_astro9_market.js -StepTimeout 900 */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(150) } return false };
  const at = (x, z, yaw, pitch) => { const P = AV.P; P.x = x; P.z = z; P.y = AV.W.surface(x, z) || 0; P.vx = P.vz = P.vy = 0; if (yaw != null) P.yaw = yaw; P.pitch = pitch || 0 };
  const bad = pts => { const out = []; for (let k = 1; k < pts.length; k++) { const [x0, z0] = pts[k - 1], [x1, z1] = pts[k], n = Math.ceil(Math.hypot(x1 - x0, z1 - z0)); for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, z = z0 + (z1 - z0) * i / n; if (AV.W.surface(x, z) === null || !AV.isFree(AV.W, x, z, .35)) out.push(x.toFixed(1) + ',' + z.toFixed(1)) } } return out };
  step('boot', async c => { $('gq').value = 'Medium'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); await sleep(1500); AV.save = () => { };
    AV.travel('astro9'); c('Astro-9', await until(() => AV.W && AV.W.id === 'astro9' && $('fade').style.opacity === '0', 150000)); c('no world error', !$('err').textContent, $('err').textContent) });
  step('district 1: built + walkable', async c => {
    const f = AV.astro9market && AV.astro9market.fx; c('market district built', !!f && f.canopies > 20 && f.diners >= 3 && f.smoke >= 8, JSON.stringify(f));
    let b = bad([[-94, 94], [-24, 94]]); c('Bazaar: centre of the souk walkable end to end', !b.length, b.slice(0, 6).join(' '));
    b = bad([[-94, 88.5], [-24, 88.5]]); c('Bazaar: shop-front lane walkable', !b.length, b.slice(0, 6).join(' '));
    for (const sx of [-84, -66, -48, -30]) { b = bad([[sx, 90], [sx, 84.6], [sx, 78.5]]); c('Bazaar shop at x ' + sx + ': door reachable', !b.length, b.join(' ')) }
    b = bad([[24, 86.5], [90, 86.5]]); c('Food Ring: north lane walkable', !b.length, b.slice(0, 6).join(' '));
    b = bad([[24, 96.5], [90, 96.5]]); c('Food Ring: south lane walkable', !b.length, b.slice(0, 6).join(' '));
    b = bad([[40, 88], [40, 84.4], [40, 76.5]]); c('Astro Café door reachable', !b.length, b.join(' '));
    for (const [x, z] of [[0, 72], [0, 116], [-22, 94], [22, 94]]) { const a = Math.atan2(z - 94, x), sx = Math.cos(a) * 12, sz = 94 + Math.sin(a) * 12; b = bad([[sx, sz], [x, z]]); c('plaza → mouth ' + x + ',' + z + ' (outside the central monument)', !b.length, b.slice(0, 4).join(' ')) }
    { const ring = []; for (let k = 0; k <= 48; k++) { const a = k / 48 * Math.PI * 2; ring.push([Math.cos(a) * 17.5, 94 + Math.sin(a) * 17.5]) } b = bad(ring); c('plaza: full loop at r 17.5 (outside the busker synth stand at -10,106)', !b.length, b.slice(0, 6).join(' ')) }
    c('no JS errors', !$('err').textContent, $('err').textContent) });
  step('Bazaar souk view', async c => { at(-26, 94, Math.PI / 2, .08); await sleep(6000); c('render', true, JSON.stringify(AV.R.info.render)) }, { shot: 'market_bazaar' });
  step('Bazaar shop fronts', async c => { at(-60, 98, 0, .1); await sleep(5000); c('render', true, JSON.stringify(AV.R.info.render)) }, { shot: 'market_bazaar_fronts' });
  step('Food Ring night market', async c => { at(24, 92, -Math.PI / 2, .05); await sleep(6000); c('render', true, JSON.stringify(AV.R.info.render)) }, { shot: 'market_food' });
  step('Spiral Plaza colonnade', async c => { at(0, 76, Math.PI, .12); await sleep(6000); c('render', true, JSON.stringify(AV.R.info.render)); c('no JS errors', !$('err').textContent, $('err').textContent) }, { shot: 'market_plaza' });
  let active = [];
  return { names(mobile) { active = steps.filter(s => !!s.mobile === !!mobile || s.name === 'boot'); return active.map(s => s.name) },
    async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
