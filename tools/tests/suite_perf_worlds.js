/* M13 frame rate: where the triangles and draw calls go in the slow worlds.  For every visible mesh inside the camera frustum at the
   arrival point (noon): kind (skinned character / instanced / static), triangles (x instances), heaviest objects by name; real-GPU FPS
   over 5 s; perf_guard's character LOD state.  run_tests.ps1 -Suite tools/tests/suite_perf_worlds.js -Gpu [-Only <world>] */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const fps = async s => { let n = 0, on = true; const f = () => { n++; if (on) requestAnimationFrame(f) }; requestAnimationFrame(f); await sleep(s * 1000); on = false; return +(n / s).toFixed(1) };
  const label = o => { let p = o, n = ''; for (let i = 0; i < 5 && p; i++, p = p.parent) if (p.name) { n = p.name; break } return (n || o.type) + (o.material && o.material.type ? ' [' + o.material.type.replace('Material', '') + ']' : '') };
  function profile() { const cam = AV.cam, fr = new THREE.Frustum(); fr.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse)); const kinds = {}, objs = []; let calls = 0, tris = 0;
    AV.scene.traverseVisible(o => { if (!o.isMesh || !o.geometry) return; const g = o.geometry; if (o.frustumCulled && !o.isInstancedMesh) { if (!g.boundingSphere) g.computeBoundingSphere(); if (!fr.intersectsSphere(g.boundingSphere.clone().applyMatrix4(o.matrixWorld))) return }
      const per = (g.index ? g.index.count : (g.attributes.position ? g.attributes.position.count : 0)) / 3, inst = o.isInstancedMesh ? o.count : 1, t = per * inst, k = o.isSkinnedMesh ? 'skinned' : o.isInstancedMesh ? 'instanced' : 'static';
      kinds[k] = kinds[k] || { calls: 0, tris: 0 }; kinds[k].calls++; kinds[k].tris += t; calls++; tris += t; objs.push([label(o), t]) });
    const byName = {}; for (const [n, t] of objs) { byName[n] = byName[n] || [0, 0]; byName[n][0] += t; byName[n][1]++ }
    return { calls, ktris: Math.round(tris / 1000), kinds: Object.fromEntries(Object.entries(kinds).map(([k, v]) => [k, { calls: v.calls, ktris: Math.round(v.tris / 1000) }])), top: Object.entries(byName).sort((a, b) => b[1][0] - a[1][0]).slice(0, 8).map(([n, v]) => n + ': ' + Math.round(v[0] / 1000) + 'k/' + v[1]) } }
  step('boot', async c => { $('gq').value = 'Medium'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); await sleep(1500); AV.save = () => { }; window.__perf = {} });
  for (const id of ['da_nang', 'pai', 'astro9', 'chiang_mai', 'jungle_dub', 'ape_town', 'madrid']) step('perf ' + id, async c => { AV.S.time = 9 * 60; AV.travel(id); c('loads', await until(() => AV.W && AV.W.id === id && settled(), 240000)); AV.S.time = 12 * 60; await sleep(4000);
    const f = await fps(5), r = AV.R.info.render, pg = AV.perf && typeof AV.perf.stats === 'function' ? AV.perf.stats() : null; const res = { fps: f, calls: r.calls, ktris: Math.round(r.triangles / 1000), guard: pg, visible: profile() }; window.__perf[id] = res; c('profile', true, JSON.stringify(res)) });
  step('no JS errors', async c => c('clean', !$('err').textContent, $('err').textContent));
  let active = steps;
  return { names() { active = steps; return steps.map(s => s.name) }, async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
