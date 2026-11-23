/* Integration check for a playable build: every registered world loads, you can walk + interact, the map builds, the world selector
   lists them, no JS errors, no failed asset requests; phone boot + controls.  run_tests.ps1 -Suite tools\tests\suite_integration.js -StepTimeout 900 [-Mobile] */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(150) } return false };
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const bad0 = window.__badAssets = window.__badAssets || [], MP = /api\/mp\//;   /* the multiplayer endpoint only exists under tools/mp_server.py: offline 404s are expected */
  const bad = { push: s => { if (!MP.test(s)) bad0.push(s) }, get length() { return bad0.length }, set length(v) { bad0.length = v }, slice: (a, b) => bad0.slice(a, b) };
  if (!window.__assetHook) { window.__assetHook = 1; const of = window.fetch; window.fetch = async (...a) => { try { const r = await of(...a); if (!r.ok) bad.push(r.status + ' ' + String(a[0]).slice(-80)); return r } catch (e) { bad.push('ERR ' + String(a[0]).slice(-80)); throw e } };
    const oo = XMLHttpRequest.prototype.open; XMLHttpRequest.prototype.open = function (m, u) { this.addEventListener('loadend', () => { if (this.status >= 400 || this.status === 0) bad.push(this.status + ' ' + String(u).slice(-80)) }); return oo.apply(this, arguments) };
    window.addEventListener('error', e => { const t = e.target; if (t && t !== window && (t.src || t.href)) bad.push('load ' + String(t.src || t.href).slice(-80)) }, true) }
  step('boot', async c => { $('gq').value = 'Low'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); await sleep(1500); AV.save = () => { }; AV.S.money = 500; c('start world: ' + (AV.W && AV.W.id), !!AV.W) });
  step('world selector lists the playable worlds', async c => { const ids = Object.keys(AV.worldDefs); c('registered worlds', ids.length >= 10, ids.join(', '));
    const playable = (AV.WORLDS_DATA || []).filter(w => w.status === 'playable').map(w => w.id); c('every "playable" world in data/worlds has code', playable.every(id => AV.isPlayable(id)), playable.filter(id => !AV.isPlayable(id)).join(', ') || 'all');
    AV.toggleMap(); await sleep(600); const t = $('map').textContent; c('travel map opens', $('map').style.display !== 'none' && t.length > 50); AV.closeTop(); });
  const ids = () => Object.keys(AV.worldDefs);
  for (let k = 0; k < 16; k++) step('world #' + (k + 1), async c => { const id = ids()[k]; if (!id) { c('(no more worlds)', true); return } c(id + ' loads', await (async () => { AV.travel(id); return until(() => AV.W && AV.W.id === id && settled(), 180000) })(), AV.W && AV.W.id);
    await sleep(1500); c(id + ': no JS error', !$('err').textContent, $('err').textContent.slice(0, 300)); const P = AV.P; c(id + ': ground under you', AV.W.surface(P.x, P.z) !== null);
    const x0 = P.x, z0 = P.z; AV.keys.KeyW = 1; await until(() => Math.hypot(P.x - x0, P.z - z0) > .6, 30000); AV.keys.KeyW = 0; c(id + ': walking works', Math.hypot(P.x - x0, P.z - z0) > .3, Math.hypot(P.x - x0, P.z - z0).toFixed(2) + ' m');
    c(id + ': interactions', AV.W.T.length > 0, AV.W.T.length + ' targets'); const mm = AV.minimap; if (mm) { await until(() => mm.base && mm.base.W === AV.W, 60000); try { mm._buildNow() } catch (e) { } c(id + ': map built', !!(mm.base && mm.base.done)) }
    c(id + ': no failed asset requests', !bad.length, bad.slice(0, 5).join(' | ')); bad.length = 0; c(id + ': render', true, JSON.stringify(AV.R.info.render)) });
  step('portal pipe + travel back home', async c => { AV.pipe.show(); await sleep(400); c('portal world picker opens', AV.pipe.open); AV.pipe.hide(); AV.travel('ape_town'); c('back to Ape Town', await until(() => AV.W && AV.W.id === 'ape_town' && settled(), 150000)); c('no JS errors', !$('err').textContent, $('err').textContent) }, { shot: 'integration_ape_town' });
  step('phone: boot, joystick, buttons, minimap', async c => { $('gq').value = 'Low'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); AV.save = () => { };
    c('touch controls shown', !!$('js') && getComputedStyle($('js')).display !== 'none' && !!$('tE'), getComputedStyle($('js')).display); c('minimap on phone', await until(() => AV.minimap && AV.minimap.visible(), 60000)); c('no JS errors', !$('err').textContent, $('err').textContent) }, { mobile: true, shot: 'integration_phone' });
  let active = [];
  return { names(mobile) { active = steps.filter(s => !!s.mobile === !!mobile || s.name === 'boot'); return active.map(s => s.name) },
    async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
