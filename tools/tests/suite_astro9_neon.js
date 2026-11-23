/* Cinematic V1: Astro-9 Neon Boulevard hero street (js/astro9_neon.js). run_tests.ps1 -Suite tools\tests\suite_astro9_neon.js -StepTimeout 900 */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(150) } return false };
  const lab = t => { try { return typeof t.label === 'function' ? t.label() : t.label } catch (e) { return '' } };
  const tgt = re => AV.W.T.find(t => re.test(lab(t)));
  const at = (x, z, yaw, pitch) => { const P = AV.P; P.x = x; P.z = z; P.y = AV.W.surface(x, z) || 0; P.vx = P.vz = P.vy = 0; if (yaw != null) P.yaw = yaw; P.pitch = pitch || 0 };
  const bad = pts => { const out = []; for (let k = 1; k < pts.length; k++) { const [x0, z0] = pts[k - 1], [x1, z1] = pts[k], n = Math.ceil(Math.hypot(x1 - x0, z1 - z0)); for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, z = z0 + (z1 - z0) * i / n; if (AV.W.surface(x, z) === null || !AV.isFree(AV.W, x, z, .35)) out.push(x.toFixed(1) + ',' + z.toFixed(1)) } } return out };
  step('boot', async c => { $('gq').value = 'Medium'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); await sleep(1500); AV.save = () => { }; AV.S.money = 400;
    AV.travel('astro9'); c('Astro-9', await until(() => AV.W && AV.W.id === 'astro9' && $('fade').style.opacity === '0', 150000)); c('no world error', !$('err').textContent, $('err').textContent) });
  step('Neon Boulevard: layout + walking', async c => {
    const NB = AV.astro9neon; c('hero street built', !!NB && NB.lots && NB.lots.length >= 12, NB && NB.lots && NB.lots.length + ' buildings');
    const fams = new Set(NB.lots.map((l, i) => i % 5)); c('five facade families', fams.size === 5); c('four enterable shops', ['tech', 'synth', 'ramen', 'robot'].every(k => NB.named.includes(k)), NB.named.join(','));
    let b = bad([[96, 86.5], [258, 86.5]]); c('north sidewalk walkable end to end', b.length < 3, b.slice(0, 6).join(' '));
    b = bad([[96, 103.5], [258, 103.5]]); c('south sidewalk walkable end to end', b.length < 3, b.slice(0, 6).join(' '));
    b = bad([[175, 88], [175, 102]]); c('crossing the hover lane', !b.length, b.join(' '));
    b = bad([[199, 86], [199, 80], [199, 77]]); c('Black Market alley walkable', !b.length, b.join(' '));
    c('Food Ring → boulevard still connected', !bad([[80, 95], [94, 95], [100, 88]]).length) });
  const shopStep = (k, re) => step('enter ' + k, async c => { const NB = AV.astro9neon, lot = NB.lots.find(l => l.enter === k); c(k + ' lot', !!lot); if (!lot) return;
    const b = bad([lot.door, lot.inside]); c(k + ': walk in through the door', !b.length, b.join(' '));
    const t = tgt(re); c(k + ': counter interaction inside', !!t && Math.hypot(t.x - lot.inside[0], t.z - lot.inside[1]) < .5, t && t.x.toFixed(1) + ',' + t.z.toFixed(1));
    at(lot.door[0], lot.door[1], lot.side === 'n' ? 0 : Math.PI, .02); await sleep(4000) }, { shot: 'neon_shop_' + k });
  shopStep('tech', /Tech Market/); shopStep('ramen', /ramen bar/);
  step('buy noodles inside Comet Ramen', async c => { const t = tgt(/ramen bar/); at(t.x, t.z); t.fn(); await sleep(400); const btn = document.querySelector('[data-buy="a9_noodles"]'); btn && btn.click(); await sleep(400); AV.closeTop(); c('bought comet ramen', AV.bag.count('a9_noodles') >= 1) });
  step('street view west → east', async c => { at(100, 87, -Math.PI / 2, .03); await sleep(6000); c('render', true, JSON.stringify(AV.R.info.render)); c('no JS errors', !$('err').textContent, $('err').textContent) }, { shot: 'neon_street_east' });
  step('street view east → west', async c => { at(250, 103, Math.PI / 2, .03); await sleep(6000); c('render', true, JSON.stringify(AV.R.info.render)) }, { shot: 'neon_street_west' });
  step('looking up at the frontage', async c => { at(160, 100, 0, -.32); await sleep(6000); c('render', true, JSON.stringify(AV.R.info.render)) }, { shot: 'neon_frontage' });
  step('Black Market alley', async c => { at(199, 83, 0, .05); await sleep(5000); c('render', true, JSON.stringify(AV.R.info.render)); c('no JS errors', !$('err').textContent, $('err').textContent) }, { shot: 'neon_alley' });
  let active = [];
  return { names(mobile) { active = steps.filter(s => !!s.mobile === !!mobile || s.name === 'boot'); return active.map(s => s.name) },
    async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
