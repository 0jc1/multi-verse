/* Screenshot tour of Ape Town for before/after comparisons. Uses the world's named places (W.places ids), so it works on any build.
   Run: run_tests.ps1 -Suite tools\tests\suite_tour.js -Out <folder>   (add -W 1600 -H 900 for bigger shots) */
window.APE_T = (() => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const until = async (f, m) => { const t = Date.now(); while (Date.now() - t < m) { try { if (f()) return true } catch (e) { } await sleep(150) } return false };
  const at = async (id, pitch, back, time) => {
    const W = AV.W, p = (W.places || []).find(p => p.id === id); if (!p) return false;
    AV.S.time = time || 630; const yaw = p.yaw || 0, b = back || 0; const s = AV.safeSpot(W, p.x + Math.sin(yaw) * b, p.z + Math.cos(yaw) * b);
    AV.P.x = s[0]; AV.P.z = s[1]; AV.P.y = W.surface(s[0], s[1]) || 0; AV.P.vx = AV.P.vz = 0; AV.P.yaw = yaw; AV.P.pitch = pitch || 0; await sleep(2600); return true;
  };
  const aerial = async (h, time, pitch, dist) => {
    const W = AV.W, surf = W.surface; AV.S.time = time; W.surface = () => h; AV.P.x = 0; AV.P.z = dist == null ? 95 : dist; AV.P.y = h; AV.P.vy = 0; AV.P.yaw = 0; AV.P.pitch = pitch == null ? -.62 : pitch;
    await sleep(3200); return () => { W.surface = surf; AV.unstuck() };
  };
  const shots = [
    ['boot', async () => { document.getElementById('gq').value = 'High'; document.getElementById('bNew').click(); await until(() => AV.W && AV.W.id === 'ape_town', 15000); await sleep(1500); if (AV.assets && AV.assets.ready) await AV.assets.ready(8000); const a = AV.W.arrivals[AV.W.defaultArrival]; AV.P.x = a.x; AV.P.z = a.z; AV.P.yaw = a.yaw || 0; AV.P.pitch = 0; AV.S.time = 630; await sleep(2500) }, '01_arrival'],
    ['aerial', async () => { const r = await aerial(70, 630, -.62, 110); return r }, '02_aerial_day'],
    ['aerial dusk', async () => { const r = await aerial(60, 1150, -.5, 105); return r }, '03_aerial_dusk'],
    ['plaza', async () => at('plaza', -.05, 0), '04_plaza'],
    ['stage', async () => at('stage', .02, 0), '05_stage'],
    ['gallery', async () => at('gallery', 0, 0), '06_gallery'],
    ['cinema', async () => at('cinema', .08, 0), '07_cinema'],
    ['zil', async () => at('zil', 0, 0), '08_zil_cafe'],
    ['grove', async () => at('grove', .05, 0), '09_portal_grove'],
    ['waterfalls', async () => at('falls', .12, 0), '10_waterfalls'],
    ['night plaza', async () => at('plaza', 0, 0, 1290), '11_plaza_night']
  ];
  let restore = null;
  return {
    names: () => shots.map(s => s[0]),
    async exec(i) {
      const checks = []; try { if (restore) { restore(); restore = null; await sleep(300) } const r = await shots[i][1](); if (typeof r === 'function') restore = r;
        const info = AV.R.info.render; checks.push({ n: shots[i][0], pass: r !== false, d: r === false ? 'place not in this build' : (info.calls + ' calls, ' + (info.triangles / 1000 | 0) + 'k tris, fps ' + AV.fps.toFixed(1)) }) }
      catch (e) { checks.push({ n: shots[i][0], pass: false, d: String(e) }) }
      return { checks, shot: checks[0].pass ? shots[i][2] : null };
    }
  };
})();
