/* M13 frame rate: baked mid-distance characters (perf_guard.js).  In busy worlds: characters bake in the mid tier (one skinned mesh,
   parts + eyes hidden), walking up restores full detail, and an in-session A/B (bake on / off alternated 3 times, seconds apart,
   static camera) compares draw calls, CPU time in the render call and FPS.  Screenshots of the same view on and off.
   run_tests.ps1 -Suite tools/tests/suite_bake.js -Gpu */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const PF = () => AV.perf;
  /* fps + render-call CPU ms + draw calls over s seconds */
  const sample = async s => { const R = AV.R, g = AV.gfx, rr = R.render, gr = g.render; let rt = 0, n = 0, calls = 0, on = true; R.render = function () { const t = performance.now(); try { return rr.apply(this, arguments) } finally { rt += performance.now() - t } }; g.render = function () { const t = performance.now(); try { return gr.apply(this, arguments) } finally { rt += performance.now() - t } };
    const f = () => { n++; calls += AV.R.info.render.calls; if (on) requestAnimationFrame(f) }; requestAnimationFrame(f); await sleep(s * 1000); on = false; R.render = rr; g.render = gr; return { fps: +(n / s).toFixed(1), ms: +(rt / n).toFixed(2), calls: Math.round(calls / n) } };
  step('boot', async c => { $('gq').value = 'Medium'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); await sleep(1500); AV.save = () => { }; c('bake API', typeof AV.perf.setBake === 'function'); window.__bake = {} });
  for (const id of ['ape_town', 'jungle_dub', 'pai', 'da_nang', 'astro9']) step('bake in ' + id, async c => { AV.S.time = 9 * 60; AV.travel(id); c('loads', await until(() => AV.W && AV.W.id === id && settled(), 240000)); AV.S.time = 12 * 60; await sleep(5000);
    const n = PF().bakedNow(); c('mid-tier characters baked', n > 0, n + ' baked · tiers ' + JSON.stringify(PF().tiers));
    const on = [], off = []; for (let k = 0; k < 3; k++) { PF().setBake(true); await sleep(700); on.push(await sample(3)); PF().setBake(false); await sleep(700); off.push(await sample(3)) } PF().setBake(true);
    const avg = (a, k) => +(a.reduce((x, y) => x + y[k], 0) / a.length).toFixed(2); const r = { calls: [avg(off, 'calls'), avg(on, 'calls')], renderMs: [avg(off, 'ms'), avg(on, 'ms')], fps: [avg(off, 'fps'), avg(on, 'fps')], onRuns: on, offRuns: off };
    window.__bake[id] = r; c('fewer draw calls with the bake', r.calls[1] < r.calls[0], 'off ' + r.calls[0] + ' → on ' + r.calls[1]); c('A/B (off → on)', true, JSON.stringify(r)) });
  step('walking up restores full detail (Ape Town)', async c => { AV.travel('ape_town'); await until(() => AV.W && AV.W.id === 'ape_town' && settled(), 240000); await sleep(5000); PF().setBake(true);
    const W = AV.W; let target = null; W.group.traverse(o => { if (!target && o.userData.pfBake && o.visible) target = o }); c('a baked character', !!target); if (!target) return; const p = new THREE.Vector3(); target.getWorldPosition(p);
    const P = AV.P; P.x = p.x + 3; P.z = p.z + 3; await sleep(3500); c('bake hidden when near', !target.visible); let partsVis = false; target.parent.children.forEach(o => { if (o.isSkinnedMesh && !o.userData.pfBake && o.visible && o.layers.mask) partsVis = true }); c('detailed parts back', partsVis) });
  step('same view: bake off', async c => { AV.travel('jungle_dub'); await until(() => AV.W && AV.W.id === 'jungle_dub' && settled(), 240000); AV.S.time = 12 * 60; await sleep(5000); PF().setBake(false); await sleep(1200); c('off', true) }, { shot: 'bake_off_jungle' });
  step('same view: bake on', async c => { PF().setBake(true); await sleep(1200); c('on', true, PF().bakedNow() + ' baked') }, { shot: 'bake_on_jungle' });
  step('summary', async c => c('worlds', Object.keys(window.__bake).length === 5, JSON.stringify(Object.fromEntries(Object.entries(window.__bake).map(([k, v]) => [k, { calls: v.calls, renderMs: v.renderMs, fps: v.fps }])))));
  step('no JS errors', async c => c('clean', !$('err').textContent, $('err').textContent));
  let active = steps;
  return { names() { active = steps; return steps.map(s => s.name) }, async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
