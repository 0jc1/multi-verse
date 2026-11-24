/* Pai real-GPU frame-rate test. Run with the GPU switch so Chrome renders on the laptop's graphics card:
     run_tests.ps1 -Suite tools/tests/suite_pai_fps.js -Gpu -W 1536 -H 864 -StepTimeout 900          (quality: ?q=Low|Medium|High, default Medium)
   For each of the heaviest viewpoints: average FPS and the worst frame over 6 s while slowly turning the camera (like playing),
   draw calls, triangles, and what is in view grouped by owner (to see where the draw calls come from). Reports the GPU renderer string
   so a run on the software rasteriser can't be mistaken for a real measurement. */
window.APE_T = (() => {
  const sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(150) } return false };
  const Q = (location.search.match(/q=(\w+)/) || [])[1] || 'Medium';
  const VIEWS = [['Walking Street north', 0, -60, Math.PI], ['Walking Street middle (night market)', 0, 0, Math.PI], ['Walking Street south', 0, 60, 0], ['River hostel', 48, 2, -Math.PI / 2], ['Sunset Bar', -39, -86, 0], ['Paradise Circus', 44, -86, 0]];
  const owner = o => { let p = o; while (p.parent && p.parent !== AV.W.group) p = p.parent; return p.name || (p.isLight ? 'light' : p.type + (p.children && p.children.length ? '(' + p.children.length + ')' : '')) };
  const inView = () => { const cam = AV.cam || AV.camera, fr = new THREE.Frustum(), m = new THREE.Matrix4(); if (!cam) return 'no camera'; m.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse); fr.setFromProjectionMatrix(m); const rows = new Map();
    AV.W.group.traverseVisible(o => { if (!(o.isMesh || o.isLine || o.isPoints || o.isSprite)) return; if (o.frustumCulled !== false && o.geometry && !o.isSprite) { if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); const s = o.geometry.boundingSphere.clone().applyMatrix4(o.matrixWorld); if (!fr.intersectsSphere(s)) return } const k = owner(o); rows.set(k, (rows.get(k) || 0) + (Array.isArray(o.material) ? o.material.length : 1)) });
    return [...rows.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, n]) => k + ' ' + n).join(' · ') };
  const steps = [{ name: 'boot', fn: async c => { $('gq').value = Q; $('bNew').click(); c('start', await until(() => AV.W && AV.running, 30000)); AV.save = () => { }; AV.travel('pai'); c('a9', await until(() => AV.W && AV.W.id === 'pai' && $('fade').style.opacity === '0', 150000)); await sleep(5000);
    const gl = AV.R.getContext(), ext = gl.getExtension('WEBGL_debug_renderer_info'); c('GPU renderer', true, (ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)) + ' · quality ' + Q + ' · ' + innerWidth + 'x' + innerHeight + ' · pixel ratio ' + AV.R.getPixelRatio().toFixed(2)); c('static merge', true, JSON.stringify(AV.staticMerge && AV.staticMerge.last)) } }];
  VIEWS.forEach(([n, x, z, yaw]) => steps.push({ name: n, fn: async c => { const P = AV.P; P.x = x; P.z = z; P.y = AV.W.surface(x, z) || 0; P.yaw = yaw; P.pitch = .05; P.vx = P.vz = 0; await sleep(5000);
    const ft = []; let last = performance.now(); const t0 = last; await new Promise(res => { const f = now => { ft.push(now - last); last = now; P.yaw = yaw + Math.sin((now - t0) / 1000 * .5) * .6; if (now - t0 < 6000) requestAnimationFrame(f); else res() }; requestAnimationFrame(f) }); P.yaw = yaw;
    ft.shift(); const avg = ft.reduce((a, b) => a + b, 0) / ft.length, sorted = ft.slice().sort((a, b) => b - a), p1 = sorted[Math.max(0, Math.floor(ft.length * .01))], r = AV.R.info.render;
    c('fps', true, (1000 / avg).toFixed(1) + ' fps avg · 1% worst frame ' + p1.toFixed(0) + ' ms · calls ' + r.calls + ' · tris ' + (r.triangles / 1e3).toFixed(0) + 'k · res scale ' + (AV.R.getPixelRatio()).toFixed(2));
    c('in view', true, inView()) } }));
  let active = [];
  return { names() { active = steps; return steps.map(s => s.name) }, async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: null } } };
})();
