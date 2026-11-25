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
  step('boot', async c => { $('gq').value = 'Low'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); await sleep(1500); window.__realSave = window.__realSave || AV.save; AV.save = () => { }; AV.S.money = 500; c('start world: ' + (AV.W && AV.W.id), !!AV.W) });
  step('save safety: sandboxed round trip, backup, corrupt + invalid saves (M1)', async c => { const real = localStorage.getItem('apeverse_v09'), K = 'apeverse_test_sandbox', sv = window.__realSave, m0 = AV.S.money;
    AV.saveKey = K; AV._bakFor = null; localStorage.removeItem(K); localStorage.removeItem(K + '_bak');
    localStorage.setItem(K, JSON.stringify(Object.assign(AV.fresh(), { money: 555 })));   /* a save from an earlier session */
    AV.S.money = 777; AV.S.testMark = 'm1'; sv(); let L = AV.loadSave(); c('save + load round trip', !!L && L.s.money === 777 && L.s.testMark === 'm1', L && L.from);
    AV.S.money = 778; sv(); c('the earlier session save is kept as backup on the first overwrite', JSON.parse(localStorage.getItem(K + '_bak') || '{}').money === 555);
    localStorage.setItem(K, '{broken'); L = AV.loadSave(); c('corrupt save falls back to the backup', !!L && L.from === 'v09-backup' && L.s.money === 555, L && L.from);
    AV.S.money = NaN; localStorage.setItem(K, 'x'); sv(); c('an invalid state is never written', localStorage.getItem(K) === 'x');
    AV.S.money = m0; delete AV.S.testMark; localStorage.removeItem(K); localStorage.removeItem(K + '_bak'); AV.saveKey = 'apeverse_v09'; AV._bakFor = null;
    c("the player's real save is untouched", localStorage.getItem('apeverse_v09') === real) });
  step('world selector lists the playable worlds', async c => { const ids = Object.keys(AV.worldDefs); c('registered worlds', ids.length >= 10, ids.join(', '));
    const playable = (AV.WORLDS_DATA || []).filter(w => w.status === 'playable').map(w => w.id); c('every "playable" world in data/worlds has code', playable.every(id => AV.isPlayable(id)), playable.filter(id => !AV.isPlayable(id)).join(', ') || 'all');
    AV.toggleMap(); await sleep(600); const t = $('map').textContent; c('travel map opens', $('map').style.display !== 'none' && t.length > 50); AV.closeTop(); });
  const ids = () => Object.keys(AV.worldDefs);
  for (let k = 0; k < 16; k++) step('world #' + (k + 1), async c => { const id = ids()[k]; if (!id) { c('(no more worlds)', true); return } c(id + ' loads', await (async () => { AV.travel(id); return until(() => AV.W && AV.W.id === id && settled(), 180000) })(), AV.W && AV.W.id);
    await sleep(1500); c(id + ': no JS error', !$('err').textContent, $('err').textContent.slice(0, 300)); const P = AV.P; c(id + ': ground under you', AV.W.surface(P.x, P.z) !== null);
    const x0 = P.x, z0 = P.z; AV.keys.KeyW = 1; await until(() => Math.hypot(P.x - x0, P.z - z0) > .6, 30000); AV.keys.KeyW = 0; c(id + ': walking works', Math.hypot(P.x - x0, P.z - z0) > .3, Math.hypot(P.x - x0, P.z - z0).toFixed(2) + ' m');
    c(id + ': interactions', AV.W.T.length > 0, AV.W.T.length + ' targets'); const mm = AV.minimap; if (mm) { await until(() => mm.base && mm.base.W === AV.W, 60000); try { mm._buildNow() } catch (e) { } c(id + ': map built', !!(mm.base && mm.base.done)) }
    c(id + ': no failed asset requests', !bad.length, bad.slice(0, 5).join(' | ')); bad.length = 0; await until(() => AV.detail && AV.detail.placed && AV.detail.placed[id], 4000); const PL = AV.detail && AV.detail.placed && AV.detail.placed[id]; if (PL) { const off = PL.filter(([x, z]) => !AV.W.cols.some(q => Math.hypot(x - Math.max(q[0], Math.min(x, q[1])), z - Math.max(q[2], Math.min(z, q[3]))) < .75)); c(id + ': street clutter stands against walls (M1)', !off.length, PL.length + ' items' + (off.length ? ' · off-wall: ' + off.slice(0, 4).join(' | ') : '')) }
    c(id + ': render', true, JSON.stringify(AV.R.info.render)) }, { shot: 'baseline_world_' + String(k + 1).padStart(2, '0') });   /* M0 baseline: one in-game shot per world (spawn view) */
  step('portal pipe + travel back home', async c => { AV.pipe.show(); await sleep(400); c('portal world picker opens', AV.pipe.open); AV.pipe.hide(); AV.travel('ape_town'); c('back to Ape Town', await until(() => AV.W && AV.W.id === 'ape_town' && settled(), 150000)); c('no JS errors', !$('err').textContent, $('err').textContent) }, { shot: 'integration_ape_town' });
  step('calm NPC routines in Vienna (M1)', async c => { AV.travel('vienna'); await until(() => AV.W && AV.W.id === 'vienna' && settled(), 180000); await sleep(2000); const B = AV.beings, W = AV.W, P = AV.P; c('ambient people present (>= 5 beings)', !!B && B.list.length >= 5, B && B.list.length); if (!B) return;
    let best = null, bn = 0; for (const p of W.places || []) { const n = B.list.filter(b => Math.hypot(b.h.position.x - p.x, b.h.position.z - p.z) < 30).length; if (n > bn) { bn = n; best = p } } if (best) { const sp = AV.safeSpot(W, best.x, best.z); P.x = sp[0]; P.z = sp[1]; P.y = W.surface(P.x, P.z) || 0 }
    await sleep(1500); for (const k in B.stats) B.stats[k] = 0; const n = B.list.filter(b => Math.hypot(b.h.position.x - P.x, b.h.position.z - P.z) < 45).length; await sleep(60000); const S = Object.assign({}, B.stats), wpm = S.wave / Math.max(5, n);
    c('people browse / linger instead of only wandering', S.browse >= 1 || S.walk < 4, JSON.stringify(S) + ' · ' + n + ' people near ' + (best ? best.id || best.name : '?')); c('waving is rare (< 0.5 waves per person per minute)', wpm < .5, wpm.toFixed(2) + ' (' + S.wave + ' waves / ' + Math.max(5, n) + ' people / 1 min)') }, { shot: 'm1_calm_vienna' });
  step('phone: boot, joystick, buttons, minimap', async c => { $('gq').value = 'Low'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); AV.save = () => { };
    c('touch controls shown', !!$('js') && getComputedStyle($('js')).display !== 'none' && !!$('tE'), getComputedStyle($('js')).display); c('minimap on phone', await until(() => AV.minimap && AV.minimap.visible(), 60000)); c('no JS errors', !$('err').textContent, $('err').textContent) }, { mobile: true, shot: 'integration_phone' });
  let active = [];
  return { names(mobile) { active = steps.filter(s => !!s.mobile === !!mobile || s.name === 'boot'); return active.map(s => s.name) },
    async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
