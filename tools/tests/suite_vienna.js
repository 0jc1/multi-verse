/* Vienna (Cinematic V1): the city blocks as Viennese buildings (js/vienna_arch.js), Café Zuckerl, routes, venues, screenshots.
   run_tests.ps1 -Suite tools/tests/suite_vienna.js -StepTimeout 900 */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(150) } return false };
  const lab = t => typeof t.label === 'function' ? t.label() : String(t.label || ''), tgt = re => AV.W.T.find(t => (!t.show || t.show()) && re.test(lab(t)));
  const at = (x, z, yaw, pitch) => { const P = AV.P; P.x = x; P.z = z; P.y = AV.W.surface(x, z) || 0; P.vx = P.vz = P.vy = 0; if (yaw != null) P.yaw = yaw; P.pitch = pitch || 0 };
  /* every half metre walkable + free; reports what blocks */
  const walk = pts => { const out = [], W = AV.W; for (let k = 1; k < pts.length; k++) { const [x0, z0] = pts[k - 1], [x1, z1] = pts[k], n = Math.ceil(Math.hypot(x1 - x0, z1 - z0) * 2); for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, z = z0 + (z1 - z0) * i / n, y = W.surface(x, z);
    if (y === null) out.push(x.toFixed(1) + ',' + z.toFixed(1) + ' [void]'); else if (!AV.isFree(W, x, z, .35)) { const c = W.circles.find(q => Math.hypot(x - q[0], z - q[1]) < q[2] + .35), r = W.cols.find(q => x > q[0] - .35 && x < q[1] + .35 && z > q[2] - .35 && z < q[3] + .35); out.push(x.toFixed(1) + ',' + z.toFixed(1) + ' [' + (c ? 'circle ' + c.map(v => +v.toFixed(1)) : r ? 'col ' + r.map(v => +v.toFixed(1)) : 'edge') + ']') } } } return [...new Set(out)] };
  const reach = (a, b) => { const W = AV.W, st = .6, x0 = Math.min(a[0], b[0]) - 20, z0 = Math.min(a[1], b[1]) - 20, nx = Math.ceil((Math.abs(a[0] - b[0]) + 40) / st), nz = Math.ceil((Math.abs(a[1] - b[1]) + 40) / st), seen = new Uint8Array(nx * nz), ok = (i, j) => { const x = x0 + i * st, z = z0 + j * st; return W.surface(x, z) !== null && AV.isFree(W, x, z, .35) };
    const si = Math.round((a[0] - x0) / st), sj = Math.round((a[1] - z0) / st), ti = Math.round((b[0] - x0) / st), tj = Math.round((b[1] - z0) / st); const Q = [si, sj]; seen[sj * nx + si] = 1; for (let h = 0; h < Q.length; h += 2) { const i = Q[h], j = Q[h + 1]; if (Math.abs(i - ti) <= 1 && Math.abs(j - tj) <= 1) return true; for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const u = i + di, v = j + dj; if (u < 0 || v < 0 || u >= nx || v >= nz || seen[v * nx + u]) continue; seen[v * nx + u] = 1; if (ok(u, v)) Q.push(u, v) } } return false };
  step('boot', async c => { $('gq').value = 'Medium'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); await sleep(1500); AV.save = () => { };
    AV.travel('vienna'); c('Vienna', await until(() => AV.W && AV.W.id === 'vienna' && $('fade').style.opacity === '0', 150000)); await sleep(2000); c('no world error', !$('err').textContent, $('err').textContent) });
  step('Viennese buildings + Café Zuckerl', async c => { const f = AV.viennaArch && AV.viennaArch.fx; c('architecture module built', !!f && f.shops >= 12, JSON.stringify(f && { shops: f.shops, doors: f.doors }));
    c('shop names unique', f && new Set(f.used).size === f.used.length, f && f.used.join(', '));
    const C = AV.viennaCafe; c('café placed', !!C, JSON.stringify(C)); if (!C) return; const cx = C.door[0], z1 = C.door[1];
    const b = walk([[cx, z1 + 4], [cx, z1 + .5], [cx, z1 - 1.4], [C.x1 - 3.6, z1 - 1.4], [C.x1 - 3.6, C.z0 + 3.2]]); c('walk in through the café door to the cake counter', !b.length, b.slice(0, 5).join(' | '));
    c('café interactions (order + newspapers)', !!tgt(/Café Zuckerl/) && !!tgt(/newspapers/));
    const t = tgt(/Café Zuckerl/); at(t.x, t.z); t.fn(); await sleep(400); const btn = document.querySelector('[data-buy="v_melange"]'); c('can order a Melange', !!btn); if (btn) { btn.click(); await sleep(400) } AV.closeTop && AV.closeTop(); c('Melange in the bag', AV.bag.count('v_melange') >= 1);
    const ppl = (AV.beings.list || []).filter(p => /Ober Franz/.test(p.name || '')); c('the waiter is there', ppl.length === 1) });
  step('existing venues + routes still work', async c => { for (const re of [/Waxy/, /Würstel|Wurst/, /U-Bahn|Ubahn|U Bahn/i]) c('interaction ' + re, !!tgt(re));
    const pts = []; for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; let p = null; for (const rr of [62, 60, 64, 58, 66]) { const x = Math.cos(a) * rr, z = -15 + Math.sin(a) * rr; if (AV.W.surface(x, z) !== null && AV.isFree(AV.W, x, z, .5)) { p = [x, z]; break } } if (p) pts.push(p) } const miss = []; for (let k = 0; k < pts.length; k++) if (!reach(pts[k], pts[(k + 1) % pts.length])) miss.push(pts[k].map(v => v.toFixed(0)) + ' > ' + pts[(k + 1) % pts.length].map(v => v.toFixed(0))); c('walk all the way round the Ringstraße (path finding, 12 legs)', pts.length === 12 && !miss.length, pts.length + ' waypoints; ' + miss.join(' | '));
    c('no JS errors', !$('err').textContent, $('err').textContent) });
  const shot = (name, file, fn) => step(name, async c => { fn(); await sleep(6000); c('render', true, JSON.stringify(AV.R.info.render)) }, { shot: file });
  shot('street of Viennese buildings', 'v_street', () => { const C = AV.viennaCafe; at(C.door[0] - 22, C.door[1] + 3.5, -Math.PI / 2 - .15, .12) });
  shot('Café Zuckerl front', 'v_cafe_front', () => { const C = AV.viennaCafe; at(C.door[0] + 6, C.door[1] + 7, Math.PI / 4 - .1, .12) });
  shot('Café Zuckerl inside', 'v_cafe_inside', () => { const C = AV.viennaCafe; at(C.door[0] + .5, C.door[1] - 1.2, -.1, .02) });
  shot('Ringstraße', 'v_ring', () => at(66, -15, Math.PI, .08));
  shot('Stephansplatz', 'v_steph', () => at(-4, 4, 0, .1));
  let active = [];
  return { names(mobile) { active = steps.filter(s => !!s.mobile === !!mobile || s.name === 'boot'); return active.map(s => s.name) },
    async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
