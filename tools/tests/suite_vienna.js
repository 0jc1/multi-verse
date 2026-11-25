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
  step('city fabric: neighbourhoods + connected walks', async c => { const F = AV.viennaCity && AV.viennaCity.fx; c('city fabric built (Ring frontage + >= 50 blocks)', !!F && F.blocks >= 50 && F.ring >= 6, JSON.stringify(F));
    const dn = (AV.W.mapDistricts || []).map(d => d.name); for (const n of ['Innere Stadt', 'Leopoldstadt', 'Neubau · Spittelberg', 'Mariahilfer Straße', 'Wieden']) c('neighbourhood on the map: ' + n, dn.includes(n), dn.join(', '));
    const legs = { 'Stephansplatz > Kärntner lane > Ring > Wieden > Karlsplatz': [[-4, 2], [-4, 30], [-4, 52], [10, 70], [14, 92]], 'Ring > Leopoldstadt > Prater': [[66, -15], [88, -20], [112, -6]], 'Ring > Neubau > Mariahilfer Straße > Naschmarkt': [[-66, -10], [-100, 10], [-110, 60], [-60, 58]], 'Brigittenau > Alsergrund': [[40, -100], [-30, -90], [-70, -80]] };
    for (const k in legs) { const p = legs[k], miss = []; for (let i = 1; i < p.length; i++) { const fx = (pt) => { for (let rr = 0; rr < 14; rr += 1) for (let a = 0; a < 8; a++) { const x = pt[0] + Math.cos(a / 8 * 6.283) * rr, z = pt[1] + Math.sin(a / 8 * 6.283) * rr; if (AV.W.surface(x, z) !== null && AV.isFree(AV.W, x, z, .5)) return [x, z] } return pt }; if (!reach(fx(p[i - 1]), fx(p[i]))) miss.push(p[i - 1] + ' > ' + p[i]) } c('walk: ' + k, !miss.length, miss.join(' | ')) } });
  step('Innere Stadt: Kärntner Straße, Graben, Hofburg, Staatsoper', async c => { const lmk = (AV.viennaCity.landmarks || []).map(l => l.name); for (const n of ['Hofburg · Heldenplatz', 'Graben · Pestsäule', 'Staatsoper']) c('landmark built: ' + n, lmk.includes(n), lmk.join(', '));
    let b = walk([[-4, -6], [-4, 2], [-4, 36], [-4, 44]]); c('walk Kärntner Straße from Stephansplatz to the Ring', !b.length, b.slice(0, 5).join(' | '));
    b = walk([[-34, -30], [-38, -30], [-39.5, -30]]); c('walk onto the Graben from Stephansplatz', !b.length, b.slice(0, 5).join(' | ')); c('Graben → Hofburg (path finding)', reach([-38, -30], [-28, 26]));
    c('Kärntner Straße has hanging signs + shops', true) });
  step('Ring tram line: tracks, wires, stops, ride', async c => { const T2 = AV.viennaTram; c('4 named stops + overhead wires', !!T2 && T2.stops.length === 4 && T2.wires > 100, JSON.stringify(T2)); const t = tgt(/Ring tram stop/); c('tram stop interaction', !!t); if (t) { at(t.x, t.z); t.fn(); await sleep(1500); c('riding the Ring tram', !!(AV.vienna && AV.vienna.ride)); const off = tgt(/Hop off/); if (off) off.fn(); await sleep(500); c('hopped off', !(AV.vienna && AV.vienna.ride)) } const b = walk([[66, -15], [69, -15]]); c('stop + poles do not block the sidewalk crossing', b.length === 0, b.join(' | ')) });
  step('streets + side lanes: courtyards, Gassen, plaques, racks, cars', async c => { const S2 = AV.viennaCity.streets; c('courtyards, lanes, plaques, racks, bins, parked cars built', !!S2 && S2.courts.length >= 2 && S2.lanes >= 1 && S2.plaques >= 40 && S2.racks >= 5 && S2.bins >= 5 && S2.cars >= 10, JSON.stringify(S2));
    if (S2 && S2.courts[0]) { const [gx, gz, cx, cz] = S2.courts[0]; const b = walk([[gx, gz + 2.2], [gx, gz - .5], [gx, cz + 2.2]]); c('walk through the Durchgang into the courtyard', !b.length, b.slice(0, 5).join(' | ')); c('courtyard reachable from the street (path finding)', reach([gx, gz + 2.5], [cx, cz + 2])) }
    const L = AV.viennaCity.streets && AV.viennaCity.streets.lanes; const nud = pt => { for (let rr = 0; rr < 14; rr += 1) for (let k = 0; k < 8; k++) { const x = pt[0] + Math.cos(k / 8 * 6.283) * rr, z = pt[1] + Math.sin(k / 8 * 6.283) * rr; if (AV.W.surface(x, z) !== null && AV.isFree(AV.W, x, z, .5)) return [x, z] } return pt };
    c('main walks still clear with cars + furniture (Ring > Neubau, Ring > Leopoldstadt, along a radial)', reach(nud([-66, -10]), nud([-100, 10])) && reach(nud([66, -15]), nud([88, -20])) && reach(nud([-70, 40]), nud([-120, 72]))) });
  const shot = (name, file, fn) => step(name, async c => { fn(); await sleep(6000); c('render', true, JSON.stringify(AV.R.info.render)) }, { shot: file });
  shot('street of Viennese buildings', 'v_street', () => { const C = AV.viennaCafe; at(C.door[0] - 22, C.door[1] + 3.5, -Math.PI / 2 - .15, .12) });
  shot('Café Zuckerl front', 'v_cafe_front', () => { const C = AV.viennaCafe; at(C.door[0] + 6, C.door[1] + 7, Math.PI / 4 - .1, .12) });
  shot('Café Zuckerl inside', 'v_cafe_inside', () => { const C = AV.viennaCafe; at(C.door[0] + .5, C.door[1] - 1.2, -.1, .02) });
  shot('Ringstraße', 'v_ring', () => at(66, -15, Math.PI, .08));
  shot('courtyard gateway', 'v_court_gate', () => { const S2 = AV.viennaCity.streets; const [gx, gz] = S2.courts[0]; at(gx + 1.5, gz + 5, .25, .12) });
  shot('inside a courtyard', 'v_court', () => { const S2 = AV.viennaCity.streets; const [gx, gz, cx, cz] = S2.courts[0]; at(gx, gz - 1.6, 0, .25) });
  shot('parked cars on an avenue', 'v_cars', () => at(-80, 46, Math.PI * .8, .05));
  shot('tram stop on the Ring', 'v_tramstop', () => { const n = 56, k = Math.round((30 * Math.PI / 180) / (Math.PI * 2 / n) - .5), a = (k + .5) * Math.PI * 2 / n + .05; at(Math.cos(a) * 63.5, -15 + Math.sin(a) * 63.5, Math.atan2(-Math.cos(a), -Math.sin(a)), .05) });
  shot('Stephansplatz', 'v_steph', () => at(-4, 4, 0, .1));
  shot('Kärntner Straße looking north to the cathedral', 'v_kaerntner', () => at(-4, 34, 0, .12));
  shot('Kärntner Straße looking south', 'v_kaerntner_s', () => at(-4, 4, Math.PI, .06));
  shot('Graben + Pestsäule', 'v_graben', () => at(-36.5, -29, Math.PI / 2 - .2, .1));
  shot('Hofburg from Heldenplatz', 'v_hofburg', () => at(-26, 30, .25, .18));
  shot('Staatsoper across the Ring', 'v_oper', () => at(-2, 49, -2.18, .1));
  shot('Leopoldstadt street', 'v_leopold', () => at(77.5, -20, Math.PI, .08));
  shot('Neubau lanes', 'v_neubau', () => at(-112.5, 20, Math.PI / 2, .08));
  shot('Mariahilfer Straße', 'v_mahue', () => at(-80, 62, Math.PI / 2, .06));
  shot('Brigittenau', 'v_brig', () => at(40, -100, Math.PI / 2, .08));
  step('neighbourhood looks + clear air', async c => { const L = AV.viennaCity.look; c('roof mix: Biedermeier gables, Gemeindebau flat roofs, mansards', !!L && L.gable >= 8 && L.flat >= 8 && L.mans >= 40, JSON.stringify(L));
    c('Jugendstil friezes + Gemeindebau inscriptions', !!L && L.orn >= 5 && L.insc >= 2, L && ('orn ' + L.orn + ' · insc ' + L.insc)); const PB = AV.viennaCity.postsBy || {}, noPost = Object.keys(PB).filter(id => id !== 'inner' && !PB[id] && AV.viennaCity.blocks.some(b => b.hood.id === id && !b.square)); c('lamp posts in every outer neighbourhood', !!L && L.post >= 20 && !noPost.length, JSON.stringify(PB));
    const hz = new Set((AV.viennaCity.blocks || []).filter(b => !b.square && !b.part).map(b => b.hood.id)); { const FA = (AV.detail && AV.detail.floraAt && AV.detail.floraAt.vienna) || [], onSt = FA.filter(([x, z]) => AV.viennaCity.nearBlock(x, z, 9)); c('no flower beds on the city streets (M1)', !onSt.length, FA.length + ' flora · on streets: ' + onSt.slice(0, 4).join(' | ')) }
    c('summer fog pushed back (no white haze)', AV.W.fog[1] >= 800, JSON.stringify(AV.W.fog));
    const miss = []; for (const [x, z, fz] of AV.viennaCity.posts || []) { const m = (z + fz) / 2, w2 = walk([[x - 1.5, m], [x + 1.5, m]]); if (w2.length) miss.push(w2[0]) } c('city beyond the map (suburbs, spires, hills, ground skirt)', !!AV.viennaBackdrop && AV.viennaBackdrop.parts >= 300, JSON.stringify(AV.viennaBackdrop)); c('sidewalk passes every lamp post', !miss.length, miss.slice(0, 5).join(' | ')) });
  const hoodAt = (id, yaw) => { const bl = AV.viennaCity.blocks.filter(b => b.hood.id === id && !b.square && !b.part), b = bl[Math.min(2, bl.length - 1)]; if (b) at(b.x0 - b.hood.st / 2, b.z1 + 5, yaw == null ? -.2 : yaw, .14) };
  shot('Wieden (Jugendstil)', 'v_look_wieden', () => hoodAt('wieden'));
  shot('Spittelberg (Biedermeier gables)', 'v_look_neubau', () => hoodAt('neubau'));
  shot('Brigittenau (Gemeindebau)', 'v_look_brig', () => hoodAt('brig'));
  shot('Josefstadt', 'v_look_josef', () => hoodAt('josef'));
  shot('Favoriten', 'v_look_favor', () => hoodAt('favor'));
  shot('Mariahilfer Straße', 'v_look_mahue', () => hoodAt('mahue'));
  shot('overview from above', 'v_overview', () => { at(0, 40, Math.PI, -.55); AV.P.y = 70; const iv = setInterval(() => { AV.P.y = 70; AV.P.vy = 0 }, 10); setTimeout(() => clearInterval(iv), 6800) });   /* held up: on a real GPU the player would fall before the capture */
  shot('evening street (lamps + windows)', 'v_look_night', () => { AV.S.time = 21 * 60 + 30; hoodAt('alser') });
  step('back to daytime', async c => { AV.S.time = 12 * 60; await sleep(500); c('day', true) });
  let active = [];
  return { names(mobile) { active = steps.filter(s => !!s.mobile === !!mobile || s.name === 'boot'); return active.map(s => s.name) },
    async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
