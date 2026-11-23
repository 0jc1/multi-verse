/* Crowd density check (Cinematic V1, phase 0): how many animated people each world loads, plus a fixed-view screenshot.
   "people" = groups directly under the world root that contain a skinned rig (crowd walkers, talkers, residents, band, workers).
   run_tests.ps1 -Suite tools\tests\suite_crowd.js -StepTimeout 900   (compare two builds by running it on each) */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(150) } return false };
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const people = () => { let n = 0, near = 0; const P = AV.P, v = new THREE.Vector3(); for (const g of AV.W.group.children) { let sk = false; g.traverse(o => { if (o.isSkinnedMesh) sk = true }); if (!sk) continue; n++; g.getWorldPosition(v); if (Math.hypot(v.x - P.x, v.z - P.z) < 40) near++ } return { n, near } };
  const workers = () => AV.npc && AV.npc.brains ? AV.npc.brains().length : 0;
  step('boot', async c => { $('gq').value = 'Medium'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); AV.save = () => { } });
  const view = (id, x, z, yaw) => step(id, async c => { if (AV.W.id !== id) { AV.travel(id); c(id + ' loads', await until(() => AV.W && AV.W.id === id && settled(), 150000)) } if (x != null) { const P = AV.P; P.x = x; P.z = z; P.y = AV.W.surface(x, z) || 0; P.yaw = yaw; P.pitch = .02 }
    await sleep(6000); const p = people(); c('animated people in the world', true, p.n + ' total, ' + p.near + ' within 40 m'); c('market workers kept', true, workers() + ' workers'); c('no JS errors', !$('err').textContent, $('err').textContent); c('render', true, JSON.stringify(AV.R.info.render)) }, { shot: 'crowd_' + id });
  view('ape_town'); view('madrid', -105, 760, Math.PI); view('chiang_mai'); view('pai'); view('astro9', 0, 112, Math.PI * .8);
  let active = [];
  return { names(mobile) { active = steps.filter(s => !!s.mobile === !!mobile || s.name === 'boot'); return active.map(s => s.name) },
    async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
