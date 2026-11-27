/* APEVERSE 2.2 - connectivity audit + gate for the new-world cities (Tokyo, Paris; later Barcelona).  Real collision + real pathfinder:
   1. reach: every pair of important destinations inside a walk-connected area routes on walkable ground with a sane detour;
   2. alternatives: for chosen pairs, a 44 m roadblock is dropped across the found route at its midpoint and the route must still exist
      (a different street) without a silly detour — "multiple distinct routes";
   3. dead ends: the street graph (crowd/GPS nav) has no degree-1 street ends except the declared termini (shrine halls, stations...);
   4. pockets: random free ground points inside the city must route to the area's hub (no isolated, inaccessible passages);
   5. walk: long routes are actually walked with player collision (AV.resolve), corner by corner, without getting stuck.
   run_tests.ps1 -Suite tools/tests/suite_connect.js -Gpu -Port 8098   (results also in window.__connect) */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const OUT = window.__connect = {};
  const W = () => AV.W, P = () => AV.P;
  const route = (a, b) => { const w = W(), r = AV.path.route(w, { x: a[0], z: a[1] }, { x: b[0], z: b[1] }) || []; let L = 0, prev = a; for (const p of r) { L += Math.hypot(p[0] - prev[0], p[1] - prev[1]); prev = p } const end = r.length ? r[r.length - 1] : a; return { r, L, bad: r.filter(p => w.surface(p[0], p[1]) === null).length, miss: Math.hypot(end[0] - b[0], end[1] - b[1]) } };
  const ok = (a, b, R2, k) => R2.r.length >= 1 && R2.bad === 0 && R2.miss < 3 && R2.L < Math.hypot(b[0] - a[0], b[1] - a[1]) * (k || 2.2) + 40;
  /* a roadblock across the route at its midpoint: 2 m squares on a 44 m line perpendicular to the route there */
  const block = (r) => { let tot = 0; const seg = []; for (let i = 1; i < r.length; i++) { const l = Math.hypot(r[i][0] - r[i - 1][0], r[i][1] - r[i - 1][1]); seg.push(l); tot += l } let h = tot / 2, i = 1; while (i < r.length && h > seg[i - 1]) { h -= seg[i - 1]; i++ } if (i >= r.length) return null; const a = r[i - 1], b = r[i], t = h / seg[i - 1], m = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], d = [(b[0] - a[0]) / seg[i - 1], (b[1] - a[1]) / seg[i - 1]], n = [-d[1], d[0]];
    const sq = []; for (let k = -11; k <= 11; k++) { const x = m[0] + n[0] * k * 2, z = m[1] + n[1] * k * 2; sq.push([x - 1.2, x + 1.2, z - 1.2, z + 1.2]) } return { sq, m } };
  const altRoute = (a, b) => { const R1 = route(a, b); if (!ok(a, b, R1, 3)) return { R1, R2: null, why: 'no first route' }; const B = block(R1.r); if (!B) return { R1, R2: null, why: 'route too short' }; const w = W(), n0 = w.cols.length; for (const s of B.sq) w.cols.push(s);
    let R2; try { R2 = route(a, b) } finally { w.cols.splice(n0, B.sq.length) } return { R1, R2, m: B.m } };
  const deadEnds = (nav, allow) => { if (!nav || !nav.links) return { n: -1, list: [] }; const list = []; nav.nodes.forEach((p, i) => { if (nav.links[i].length === 1 && !allow.some(q => Math.hypot(q[0] - p[0], q[1] - p[1]) < (q[2] || 12))) list.push(p.map(v => Math.round(v))) }); return { n: list.length, list } };
  /* street lines that cross without a shared node (the GPS walks around instead of turning there) */
  const unjoined = (nav) => { if (!nav || !nav.links) return { n: -1, list: [] }; const N = nav.nodes, E = []; nav.links.forEach((l, i) => l.forEach(j => { if (j > i) E.push([i, j]) }));
    const X = (a, b, c, d) => { const r = [b[0] - a[0], b[1] - a[1]], s = [d[0] - c[0], d[1] - c[1]], den = r[0] * s[1] - r[1] * s[0]; if (Math.abs(den) < 1e-9) return false; const t = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / den, u = ((c[0] - a[0]) * r[1] - (c[1] - a[1]) * r[0]) / den; return t > .02 && t < .98 && u > .02 && u < .98 };
    const near = (i, j) => i === j || nav.links[i].includes(j); const list = [];
    for (let a = 0; a < E.length; a++) { const [i, j] = E[a], A = N[i], B = N[j]; for (let b = a + 1; b < E.length; b++) { const [k, l] = E[b]; if (near(i, k) || near(i, l) || near(j, k) || near(j, l)) continue; const C2 = N[k], D = N[l];
      if (Math.max(A[0], B[0]) < Math.min(C2[0], D[0]) || Math.max(C2[0], D[0]) < Math.min(A[0], B[0]) || Math.max(A[1], B[1]) < Math.min(C2[1], D[1]) || Math.max(C2[1], D[1]) < Math.min(A[1], B[1])) continue;
      if (X(A, B, C2, D)) list.push([Math.round((A[0] + B[0]) / 2), Math.round((A[1] + B[1]) / 2)]) } } return { n: list.length, list } };
  const pockets = (hub, box, n, rng) => { const w = W(), bad = []; let tried = 0, k = 0; while (k < n && tried < n * 40) { tried++; const x = box[0] + rng() * (box[1] - box[0]), z = box[2] + rng() * (box[3] - box[2]); if (w.surface(x, z) === null || !AV.isFree(w, x, z, .5)) continue; k++; const R2 = route([x, z], hub); if (!(R2.r.length && R2.bad === 0 && R2.miss < 3)) bad.push([Math.round(x), Math.round(z)]) } return { sampled: k, bad } };
  const walkRoute = async (a, b) => { const R2 = route(a, b); if (!R2.r.length) return { ok: false, why: 'no route' }; const p = P(), w = W(); p.x = a[0]; p.z = a[1]; for (const q of R2.r) { let n = 0; while (Math.hypot(q[0] - p.x, q[1] - p.z) > .6 && n++ < 2000) { const d = Math.hypot(q[0] - p.x, q[1] - p.z), r = AV.resolve(w, p.x + (q[0] - p.x) / d * .3, p.z + (q[1] - p.z) / d * .3, .4); if (Math.hypot(r[0] - p.x, r[1] - p.z) < .01) return { ok: false, why: 'stuck at ' + p.x.toFixed(1) + ',' + p.z.toFixed(1), L: R2.L }; p.x = r[0]; p.z = r[1] } } return { ok: Math.hypot(b[0] - p.x, b[1] - p.z) < 3, L: R2.L } };
  let seed = 7; const rng = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  /* ---------------- the cities ---------------- */
  const CITIES = {
    tokyo: { areas: [
      { name: 'Shinjuku', hub: [0, -706], box: [-205, 115, -948, -606], dest: { crossing: [0, -706], station: [46, -800], plaza: [34, -820], kabuki: [-80, -760], goldengai: [-168, -745], omoide: [87, -745], batting: [-45, -905], sanchome: [-60, -656], torii: [0, -600], west_lane: [-196, -680], k2: [-120, -846], north_st: [-120, -904], forest: [0, -520], takeshita: [-80, -432] },
        alt: [['crossing', 'kabuki'], ['kabuki', 'goldengai'], ['crossing', 'plaza'], ['sanchome', 'kabuki'], ['torii', 'crossing'], ['goldengai', 'north_st'], ['k2', 'crossing'], ['west_lane', 'goldengai']],
        walk: [['forest', 'kabuki'], ['goldengai', 'batting'], ['omoide', 'plaza']] },
      { name: 'Shibuya+Harajuku', hub: [0, 20], box: [-200, 100, -560, 186], dest: { station: [46, -10], haru: [28, 26], scramble: [0, 0], centergai_w: [-180, -36], udagawa: [-93, -80], backstreet: [-150, -124], shrine: [-100, 150], south_alley: [-77, 60], yokocho: [91.5, 120], shinsen: [50, 123], takeshita: [-150, -432], harajuku: [30, -455], forest: [0, -530], plaza: [30, -40], catstreet: [-66, -280], westlane: [-192, -180], arches: [88, -280], nonbei: [50, 157], cross_w1: [-110, -236] },
        alt: [['scramble', 'centergai_w'], ['station', 'yokocho'], ['haru', 'shrine'], ['scramble', 'takeshita'], ['backstreet', 'south_alley'], ['udagawa', 'scramble'], ['centergai_w', 'shrine'], ['station', 'takeshita'], ['takeshita', 'centergai_w'], ['harajuku', 'station'], ['catstreet', 'arches'], ['nonbei', 'haru'], ['westlane', 'udagawa']],
        walk: [['station', 'shrine'], ['yokocho', 'backstreet'], ['scramble', 'harajuku'], ['takeshita', 'centergai_w'], ['harajuku', 'arches']] },
      { name: 'Asakusa', hub: [500, 50], box: [380, 740, -290, 124], dest: { gate: [500, 50], hall: [500, -218], hoppy: [440, -56], denpoin: [560, -7], promenade_n: [610, -250], promenade_s: [610, 100], east_bank: [720, -100], pagoda: [456, -195], subway: [524, 64], west_street: [405, -100], north_lane: [520, -281], south_lane: [500, 104] },
        alt: [['gate', 'hall'], ['hoppy', 'promenade_n'], ['gate', 'east_bank'], ['denpoin', 'hall'], ['hall', 'promenade_n'], ['west_street', 'promenade_s'], ['east_bank', 'pagoda']],
        walk: [['subway', 'hall'], ['hoppy', 'east_bank'], ['hall', 'east_bank']] }],
      allow: [[556, -232, 8]] },
    paris: { areas: [
      { name: 'Saint-Germain + Seine', hub: [0, 49], box: [-300, 340, -120, 230], dest: { quai: [-40, 34], pontneuf: [-60, 0], north_bank: [-100, -49], isle: [178, 0], place: [126, 86], church: [110, 131], buci: [0, 200], garden: [245, 180], boulevard_w: [-250, 111], boulevard_e: [300, 111], dauphine: [-60, 80], cave: [0, 80], rivoli: [0, -94], jacob: [-180, 80], vaugirard: [-120, 204], west_edge: [-291, 150], east_edge: [331, 100], isle_back: [310, 0] },
        alt: [['quai', 'place'], ['place', 'buci'], ['boulevard_w', 'garden'], ['dauphine', 'cave'], ['quai', 'garden'], ['north_bank', 'isle'], ['isle_back', 'place'], ['north_bank', 'rivoli'], ['jacob', 'garden'], ['boulevard_w', 'vaugirard'], ['quai', 'buci']],
        walk: [['quai', 'garden'], ['north_bank', 'buci'], ['rivoli', 'isle_back'], ['jacob', 'vaugirard']] },
      { name: 'Montmartre', hub: [0, -452], box: [-220, 220, -790, -408], dest: { clichy_w: [-200, -440], moulin: [-120, -452], steinkerque: [0, -480], stairs_top: [0, -650], tertre: [-64, -672], lepic: [-170, -520], vineyard: [80, -754], clichy_e: [200, -440], west_street: [-212, -510], east_street: [204, -600] },
        alt: [['clichy_w', 'tertre'], ['steinkerque', 'tertre'], ['moulin', 'stairs_top'], ['tertre', 'vineyard'], ['clichy_e', 'vineyard'], ['clichy_w', 'lepic']],
        walk: [['moulin', 'tertre'], ['tertre', 'vineyard']] }],
      allow: [[190, 0, 6]] },
    barcelona: { areas: [
      { name: 'Barcelona (Eixample + Ciutat Vella + port)', hub: [-20, 2], box: [-195, 195, -320, 370], dest: { placa: [-20, 2], pdg_n: [11, -280], rcat: [-92, -170], garden: [-50, -173], granvia_e: [150, -47], rambla_top: [-72, 40], mercat: [-110, 165], liceu: [-68, 178], catedral: [62, 121], pi: [-3, 181], santjaume: [44, 251], reial: [-3, 280], escudellers: [30, 329], born: [145, 240], raval: [-150, 224], colom: [-62, 350], pier: [40, 388], edge_w: [-180, 0], edge_e: [180, 200], ronda: [60, 27] },
        alt: [['placa', 'pdg_n'], ['placa', 'liceu'], ['rambla_top', 'catedral'], ['catedral', 'santjaume'], ['santjaume', 'reial'], ['liceu', 'reial'], ['mercat', 'raval'], ['born', 'santjaume'], ['rcat', 'garden'], ['colom', 'born'], ['pi', 'catedral']],
        walk: [['rambla_top', 'reial'], ['pdg_n', 'garden'], ['catedral', 'mercat'], ['born', 'colom']] }],
      allow: [[40, 390, 4]] }
  };
  step('boot', async c => { await until(() => window.AV && AV.worldDefs && $('bNew'), 30000); $('gq').value = 'Low'; $('bNew').click(); if (!await until(() => AV.W && AV.running, 30000)) $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); AV.save = () => { } });
  for (const wid of Object.keys(CITIES)) step(wid + ': connectivity', async c => { AV.travel(wid); c('loads', await until(() => W() && W().id === wid && $('fade').style.opacity === '0', 240000)); await sleep(2500); const C = CITIES[wid], O = OUT[wid] = { areas: {} };
    for (const A2 of C.areas) { const D = A2.dest, keys = Object.keys(D), res = O.areas[A2.name] = {};
      /* 1. reach: all pairs */ let pairs = 0, good = 0; const fails = []; for (let i = 0; i < keys.length; i++) for (let j = i + 1; j < keys.length; j++) { pairs++; const R2 = route(D[keys[i]], D[keys[j]]); if (ok(D[keys[i]], D[keys[j]], R2)) good++; else fails.push(keys[i] + '->' + keys[j] + ' (' + (R2.r.length ? Math.round(R2.L) + ' m, miss ' + R2.miss.toFixed(0) : 'none') + ')') }
      res.reach = { pairs, good, fails }; c(A2.name + ': every destination pair routes on walkable ground (detour <= 2.2x)', good === pairs, good + '/' + pairs + (fails.length ? ' · ' + fails.slice(0, 6).join(' | ') : ''));
      /* 2. alternative routes */ let alts = 0; const altFail = []; for (const [a, b] of A2.alt) { const R3 = altRoute(D[a], D[b]); const has = R3.R2 && ok(D[a], D[b], R3.R2, 3.2); if (has) alts++; else altFail.push(a + '->' + b + (R3.why ? ' (' + R3.why + ')' : ' blocked at ' + R3.m.map(Math.round).join(','))) }
      res.alt = { tested: A2.alt.length, alts, altFail }; c(A2.name + ': a second, distinct route exists when the first is blocked', alts === A2.alt.length, alts + '/' + A2.alt.length + (altFail.length ? ' · ' + altFail.join(' | ') : ''));
      /* 4. pockets */ seed = 7; const pk = pockets(A2.hub, A2.box, 60, rng); res.pockets = pk; c(A2.name + ': no isolated pockets (random free ground routes to the hub)', pk.bad.length === 0, pk.sampled + ' sampled · ' + pk.bad.length + ' isolated' + (pk.bad.length ? ': ' + JSON.stringify(pk.bad.slice(0, 6)) : ''));
      /* 5. walk */ for (const [a, b] of A2.walk) { const wr = await walkRoute(D[a], D[b]); c(A2.name + ': walk ' + a + ' -> ' + b + ' with collision', wr.ok, (wr.L ? Math.round(wr.L) + ' m' : '') + (wr.why ? ' · ' + wr.why : '')) } }
    /* 3. dead ends in the street graph */ const nav = AV[wid] && AV[wid].nav, de = deadEnds(nav, C.allow); O.deadEnds = de; c('street graph: no unplanned dead ends', de.n === 0, de.n + (de.n ? ': ' + JSON.stringify(de.list.slice(0, 14)) : ''));
    /* 4. crossings: every pair of street lines that cross shares a junction */ const ux = unjoined(nav); O.unjoined = ux; c('street graph: every crossing is a junction', ux.n === 0, ux.n + (ux.n ? ': ' + JSON.stringify(ux.list.slice(0, 14)) : '')) });
  step('summary', async c => c('connect', true, JSON.stringify(Object.fromEntries(Object.entries(OUT).map(([k, v]) => [k, Object.fromEntries(Object.entries(v.areas).map(([a, r]) => [a, { reach: r.reach.good + '/' + r.reach.pairs, alt: r.alt.alts + '/' + r.alt.tested, pockets: r.pockets.bad.length }])) ]))) + ' dead ends: ' + JSON.stringify(Object.fromEntries(Object.entries(OUT).map(([k, v]) => [k, v.deadEnds.n])))));
  return { names() { return steps.map(s => s.name) }, async exec(i) { const s = steps[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
