/* M13 (Apeverse 2.0): ambient sound in the 9 worlds that had none. For each: the preset starts, its layers are live, a REAL signal
   comes out (an AnalyserNode on the ambience bus measures RMS), a location layer rises when you walk to its place; day/night
   layers swap; worlds with their own ambience (Madrid...) keep it; leaving stops it.   run_tests.ps1 -Suite tools/tests/suite_ambience.js -Gpu */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const go = async id => { AV.travel(id); return until(() => AV.W && AV.W.id === id && settled(), 240000) };
  const at = (x, z) => { const P = AV.P; P.x = x; P.z = z; P.y = AV.W.surface(x, z) || 0; P.vx = P.vz = 0 };
  const rms = async () => { const A = AV.amb, c = AV.audio.ctx; if (!A.master) return 0; const an = c.createAnalyser(); an.fftSize = 2048; A.master.connect(an); const d = new Float32Array(2048); let best = 0; for (let k = 0; k < 8; k++) { await sleep(150); an.getFloatTimeDomainData(d); let s = 0; for (const v of d) s += v * v; best = Math.max(best, Math.sqrt(s / d.length)) } try { A.master.disconnect(an) } catch (e) { } return best };
  /* world: [layer that follows a place, place regex] */
  const ZONES = { ape_town: ['falls', /falls/i], verdalux: ['drums', /drum/i], jungle_dub: ['river', /river/i], chiang_mai: ['gong', /luang/i], jerusalem: ['clinks', /shuk|souk/i], judean_desert: ['waves', /beach/i], vienna: ['crowd', /zuckerl|market|platz|cafe|café/i], da_nang: ['waves', /beach/i], koh_samui_jurassic: ['chimes', /crystal/i] };
  step('boot', async c => { $('gq').value = 'Medium'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); await sleep(1500); AV.save = () => { }; c('module', !!AV.ambWorlds); c('audio running', await until(() => AV.audio.ok && AV.audio.ctx.state === 'running', 8000), AV.audio.ctx && AV.audio.ctx.state); window.__amb = {} });
  for (const id of Object.keys(ZONES)) step('ambience in ' + id, async c => { AV.S.time = 9 * 60; c('loads', await go(id)); AV.S.time = 12 * 60; c('preset started', await until(() => AV.ambWorlds.active() && AV.amb.on, 8000)); const L = Object.keys(AV.amb.L); c('5+ layers', L.length >= 5, L.join(','));
    await sleep(2500); const live = Object.entries(AV.amb.lv).filter(([, v]) => v > .05).map(([k]) => k); c('layers playing here', live.length >= 2, live.join(',')); const r = await rms(); c('a real signal on the ambience bus', r > 1e-4, r.toExponential(2));
    const [layer, re] = ZONES[id], W = AV.W, pl = (W.places || []).find(p => re.test(p.id + ' ' + (Array.isArray(p.name) ? p.name.join(' ') : p.name || '')));
    if (!pl) { c('zone place exists', false, 'no place matches ' + re); return } const ms = (W.places || []).filter(p => re.test(p.id + ' ' + (Array.isArray(p.name) ? p.name.join(' ') : p.name || ''))), dmin = p => Math.min(...ms.map(q => Math.hypot(p.x - q.x, p.z - q.z))), far = (W.places || []).reduce((m, p) => dmin(p) > dmin(m) ? p : m, pl);   /* far from EVERY matching place */
    at(far.x, far.z); await sleep(700); const lo = AV.amb.lv[layer] || 0; at(pl.x, pl.z); await sleep(700); const hi = AV.amb.lv[layer] || 0; c('“' + layer + '” rises at ' + pl.id, hi > lo + .2, lo.toFixed(2) + ' → ' + hi.toFixed(2)); window.__amb[id] = { layers: L.length, live: live.length, rms: +r.toExponential(2), zone: [layer, +lo.toFixed(2), +hi.toFixed(2)] } });
  step('day / night layers swap (Jungle Dub)', async c => { c('loads', await go('jungle_dub')); await until(() => AV.ambWorlds.active(), 8000); AV.S.time = 12 * 60; await sleep(800); const d = { birds: AV.amb.lv.birds, crickets: AV.amb.lv.crickets }; AV.S.time = 23 * 60; await sleep(800); const n = { birds: AV.amb.lv.birds, crickets: AV.amb.lv.crickets };
    c('birds by day, quiet at night', d.birds > .5 && n.birds < .2, JSON.stringify(d) + ' / ' + JSON.stringify(n)); c('crickets at night only', !d.crickets && n.crickets > .5) });
  step('worlds with their own ambience keep it; leaving stops ours', async c => { c('Madrid', await go('madrid')); await sleep(2500); c('ours not running', !AV.ambWorlds.active()); c("Madrid's own ambience on", AV.amb.on && !('dino' in AV.amb.L) && !('tram' in AV.amb.L), Object.keys(AV.amb.L).join(',')) });
  step('summary', async c => c('9 worlds', Object.keys(window.__amb).length === 9, JSON.stringify(window.__amb)));
  step('no JS errors', async c => c('clean', !$('err').textContent, $('err').textContent));
  let active = steps;
  return { names() { active = steps; return steps.map(s => s.name) }, async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
