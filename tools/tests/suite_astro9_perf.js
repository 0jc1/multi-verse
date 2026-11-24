/* Astro-9 performance probe: same viewpoints before/after a change. Records draw calls, triangles, lights on, and average frame ms
   over 4 s (headless software GL, so ms is only comparable run-to-run on this machine, not real-GPU FPS).
   run_tests.ps1 -Suite tools/tests/suite_astro9_perf.js -StepTimeout 900  (quality from ?q= : default Medium) */
window.APE_T = (() => {
  const sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(150) } return false };
  const VIEWS = [['Neon Boulevard', 175, 95, -Math.PI / 2], ['Spiral Plaza', 0, 112, Math.PI], ['Art Avenue', 0, 120, Math.PI], ['Kepler St site', 125, 112, Math.PI], ['Undergrid site', 80, 185, Math.PI / 2], ['Terraces site', 160, 112, Math.PI], ['Biotech', 180, 128, Math.PI], ['West Homes', -180, 128, Math.PI]];
  const steps = [{ name: 'boot', fn: async c => { $('gq').value = (location.search.match(/q=(\w+)/) || [])[1] || 'Medium'; $('bNew').click(); c('start', await until(() => AV.W && AV.running, 30000)); AV.save = () => { }; AV.travel('astro9'); c('a9', await until(() => AV.W && AV.W.id === 'astro9' && $('fade').style.opacity === '0', 150000)); await sleep(4000) } }];
  VIEWS.forEach(([n, x, z, yaw]) => steps.push({ name: n, fn: async c => { const P = AV.P; P.x = x; P.z = z; P.y = AV.W.surface(x, z) || 0; P.yaw = yaw; P.pitch = .05; P.vx = P.vz = 0; await sleep(4000);
    let fr = 0; const t0 = performance.now(); await new Promise(res => { const f = () => { fr++; if (performance.now() - t0 < 4000) requestAnimationFrame(f); else res() }; requestAnimationFrame(f) });
    const r = AV.R.info.render, st = AV.perf && AV.perf.stats ? AV.perf.stats() : {}; c('perf', true, 'calls ' + r.calls + ' · tris ' + (r.triangles / 1e3).toFixed(0) + 'k · lights ' + JSON.stringify(st.lights || '') + ' · ' + ((performance.now() - t0) / fr).toFixed(0) + ' ms/frame · geoms ' + AV.R.info.memory.geometries + ' · tex ' + AV.R.info.memory.textures) } }));
  let active = [];
  return { names() { active = steps; return steps.map(s => s.name) }, async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: null } } };
})();
