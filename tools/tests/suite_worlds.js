/* M13 (Apeverse 2.0): world benchmark scorecard. Loads every playable world and measures it against the Madrid benchmark:
   load time, places, map roads, walking graph, interactions, people (crowds + beings + residents), ambient sound layers,
   lights, own colour grade or the default, draw calls / triangles, real-GPU FPS, plus a midday screenshot per world
   (tools/bench_images.mjs turns the shots into contrast / haze numbers).  Results: one check per world with a JSON detail.
   run_tests.ps1 -Suite tools/tests/suite_worlds.js -Gpu   (optionally -Only <world id>) */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const fps = async s => { let n = 0, on = true; const f = () => { n++; if (on) requestAnimationFrame(f) }; requestAnimationFrame(f); await sleep(s * 1000); on = false; return +(n / s).toFixed(1) };
  step('boot', async c => { $('gq').value = 'Medium'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); await sleep(1500); AV.save = () => { }; window.__bench = {} });
  const ids = Object.keys(AV.worldDefs || {});
  for (const id of ids) step('world ' + id, async c => { AV.S.time = 9 * 60; const t0 = performance.now(); AV.travel(id); const ok = await until(() => AV.W && AV.W.id === id && settled(), 240000); const load = +((performance.now() - t0) / 1000).toFixed(1); c('loads', ok, load + ' s'); if (!ok) return;
    AV.S.time = 12 * 60; await sleep(3000); const W = AV.W, ctx = W.ctx || {}, crowd = (ctx.crowds || []).reduce((a, cr) => a + ((cr.list && cr.list.length) || 0), 0);
    let lights = 0; W.group && W.group.traverse(o => { if (o.isPointLight || o.isSpotLight) lights++ });
    const navN = W.mapNav && W.mapNav.nodes ? W.mapNav.nodes.length : 0, crowdNav = (ctx.crowds || []).some(cr => cr.list && cr.list.some(w => w.nav));
    const m = { load, places: (W.places || []).length, roads: (W.mapRoads || []).length, nav: navN, crowdNav, T: (W.T || []).length, crowd, beings: (AV.beings && AV.beings.list || []).length, residents: AV.people && AV.W.id === 'madrid' ? AV.people.list.length : 0,
      amb: AV.amb && AV.amb.L ? Object.keys(AV.amb.L).length : 0, music: !!(W.music || (AV.audio && AV.audio.track && AV.audio.track.active)), lights, post: W.post ? 'own' : 'default', calls: AV.R.info.render.calls, tris: AV.R.info.render.triangles, tables: AV.tables ? AV.tables.live.length : 0 };
    m.fps = await fps(4); window.__bench[id] = m; c('metrics', true, JSON.stringify(m)) }, { shot: 'bench_' + id });
  for (const id of ['ape_town', 'madrid', 'koh_tao'].filter(i => ids.includes(i))) step('night ' + id, async c => { AV.S.time = 19 * 60; AV.travel(id); c('loads', await until(() => AV.W && AV.W.id === id && settled(), 240000)); AV.S.time = 22 * 60 + 30; await sleep(3500); c('render', true, AV.R.info.render.calls + ' calls') }, { shot: 'night_' + id });
  step('summary', async c => c('worlds measured', Object.keys(window.__bench).length === ids.length, JSON.stringify(window.__bench)));
  step('no JS errors', async c => c('clean', !$('err').textContent, $('err').textContent));
  let active = steps;
  return { names() { active = steps; return steps.map(s => s.name) }, async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
