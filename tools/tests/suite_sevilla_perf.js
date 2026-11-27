/* APEVERSE 2.2: Sevilla frame-cost A/B on the real GPU (agent 4).  Same view, toggling one thing at a time, interleaved.
   run_tests.ps1 -Suite tools/tests/suite_sevilla_perf.js -Gpu -W 1536 -H 864 -Port 8100 -StepTimeout 900 */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const sample = async s => { let n = 0, on = true; const f = () => { n++; if (on) requestAnimationFrame(f) }; requestAnimationFrame(f); await sleep(s * 1000); on = false; return +(n / s).toFixed(1) };
  const put = (x, z, yaw) => { const p = AV.P; p.x = x; p.z = z; p.y = 0; p.yaw = yaw; p.pitch = 0; p.vx = p.vz = 0 };
  step('boot', async c => { $('gq').value = 'Medium'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); await sleep(1500); AV.save = () => { } });
  const ab = (world, x, z, yaw) => async c => { AV.S.time = 14 * 60; AV.travel(world); await until(() => AV.W && AV.W.id === world && $('fade').style.opacity === '0', 240000); await sleep(4000); put(x, z, yaw); await sleep(2500);
    const W = AV.W, upd = W.ctx.upd.slice(), out = {}; const crowdFns = upd.filter(f => /cr\.built|frameI/.test(String(f)));
    const T0 = { base: () => { }, noCrowdUpd: () => { W.ctx.upd = upd.filter(f => !crowdFns.includes(f)) }, noUpd: () => { W.ctx.upd = [] }, noCrowdMesh: () => { (W.ctx.crowds || []).forEach(cr => cr.list.forEach(w => w.h && (w.h.visible = false))) }, noPost: () => { AV.__pp = AV.composer; if (AV.composer) AV.composer = null } };
    for (let pass = 0; pass < 2; pass++) for (const k in T0) { W.ctx.upd = upd.slice(); (W.ctx.crowds || []).forEach(cr => cr.list.forEach(w => w.h && (w.h.visible = true))); if (AV.__pp) { AV.composer = AV.__pp; AV.__pp = null } T0[k](); await sleep(600); out[k] = (out[k] || 0) + await sample(2) / 2 }
    W.ctx.upd = upd; c(world, true, JSON.stringify(out) + ' · crowd ' + (W.ctx.crowds || []).reduce((s, cr) => s + cr.list.length, 0) + ' · upd ' + upd.length + ' · T ' + W.T.length) };
  step('sevilla sierpes', ab('sevilla', 1, -200, Math.PI * 1.03));
  step('sevilla santa cruz', ab('sevilla', 128, -30, 0));
  step('amsterdam damrak (reference)', ab('amsterdam', -10, -90, Math.PI));
  let active = steps;
  return { names() { active = steps; return steps.map(s => s.name) }, async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
