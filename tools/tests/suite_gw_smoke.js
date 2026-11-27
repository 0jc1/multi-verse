/* APEVERSE 2.2 GLOBAL WORLDS: smoke test (agent 4).  Loads Sevilla, Cádiz and Oaxaca once each: builds without errors, network gates,
   build stats, one screenshot + frame sample each.  Fast (~5 min); the full release gates are suite_sevilla / suite_cadiz / suite_oaxaca.
   gpu_queue.ps1 -Owner agent4 -Run "-Suite tools/tests/suite_gw_smoke.js -Gpu -W 1536 -H 864 -Port 8100 -StepTimeout 900" */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const sample = async s => { let n = 0, calls = 0, tris = 0, on = true; const f = () => { n++; calls += AV.R.info.render.calls; tris += AV.R.info.render.triangles; if (on) requestAnimationFrame(f) }; requestAnimationFrame(f); await sleep(s * 1000); on = false; return { fps: +(n / s).toFixed(1), calls: Math.round(calls / Math.max(1, n)), ktris: Math.round(tris / Math.max(1, n) / 1000) } };
  const look = (x, z, pitch) => { const p = AV.P; p.yaw = Math.atan2(-(x - p.x), -(z - p.z)); p.pitch = pitch || 0 };
  step('boot', async c => { $('gq').value = 'Medium'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); await sleep(1500); AV.save = () => { } });
  for (const [id, key, view] of [['sevilla', 'sevilla', [-30, -110]], ['cadiz', 'cadiz', [91, 60]], ['oaxaca', 'oaxaca', [0, -40]]]) step(id, async c => { AV.S.time = 12 * 60; const t0 = Date.now(); AV.travel(id); c('loads', await until(() => AV.W && AV.W.id === id && $('fade').style.opacity === '0', 240000), (Date.now() - t0) + ' ms'); await sleep(3500);
    const W = AV[key], s = W.stats, r = W.rep || {}; c('no build error', !s.lifeErr && !s.lmErr && !$('err').textContent, ($('err').textContent || '') + ' ' + (s.lifeErr || s.lmErr || ''));
    c('network: 1 component, no dead ends (visible or hidden), no invisible walls', r.components === 1 && r.deadEnds.length === 0 && (r.splits || []).length === 0 && r.edgeCells === 0, JSON.stringify({ c: r.components, d: r.deadEnds, s: r.splits, e: r.edgeCells, reach: r.reachFrac }));
    c('atlas fits', s.atlasOver === 0 && s.atlasBad === 0, s.atlasOver + '/' + s.atlasBad); c('stats', true, JSON.stringify(s)); look(view[0], view[1], .08); await sleep(1500); c('frame', true, JSON.stringify(await sample(2))) }, { shot: 'smoke_' + id });
  step('no JS errors', async c => c('clean', !$('err').textContent, $('err').textContent));
  return { names() { return steps.map(s => s.name) }, async exec(i) { const s = steps[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
