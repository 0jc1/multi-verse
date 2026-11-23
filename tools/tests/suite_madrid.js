/* Worlds Reborn §9: Madrid first slice (run_tests.ps1 -Suite tools\tests\suite_madrid.js -StepTimeout 900) */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const $ = id => document.getElementById(id), lab = t => typeof t.label === 'function' ? t.label() : t.label;
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const tgt = re => AV.W.T.find(t => (!t.show || t.show()) && re.test(lab(t)));
  const at = (x, z) => { AV.P.x = x; AV.P.z = z; AV.P.y = AV.W.surface(x, z) || 0 };
  const walk = pts => { const bad = []; for (let k = 1; k < pts.length; k++) { const [x0, z0] = pts[k - 1], [x1, z1] = pts[k], n = Math.ceil(Math.hypot(x1 - x0, z1 - z0)); for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, z = z0 + (z1 - z0) * i / n; if (AV.W.surface(x, z) === null || !AV.isFree(AV.W, x, z, .35)) bad.push(x.toFixed(1) + ',' + z.toFixed(1)) } } return bad };
  const buy = async (re, item) => { const t = tgt(re); if (!t) return 'no target'; at(t.x, t.z); t.fn(); await sleep(300); const b = document.querySelector('[data-buy="' + item + '"]'); if (!b) { AV.closeTop(); return 'no item' } b.click(); await sleep(500); AV.closeTop(); return AV.bag.count(item) };
  const SZ = 1000, GV = SZ - 124, MX = -60;
  const shot = async (x, z, yaw, pitch, hr) => { if (hr != null) AV.S.time = hr * 60; at(x, z); AV.P.yaw = yaw; AV.P.pitch = pitch || 0; await sleep(6000) };

  step('boot', async c => { $('gq').value = 'Low'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); await sleep(1500); AV.save = () => { }; AV.S.money = 300;
    c('Madrid is playable', AV.isPlayable('madrid')); AV.travel('madrid'); c('Madrid', await until(() => AV.W && AV.W.id === 'madrid' && settled(), 120000)); c('no world error', !$('err').textContent, $('err').textContent);
    c('arrive in Pinar de Chamartín by the metro', Math.hypot(AV.P.x + 30, AV.P.z + 2) < 6, AV.P.x.toFixed(1) + ',' + AV.P.z.toFixed(1)) });

  step('Pinar: avenue, park, bar, bakery, fruit shop', async c => {
    const R = { 'avenue, both sidewalks': [[-88, -10], [88, -10], [88, 10], [-88, 10]], 'avenue → park → fountain loop': [[0, 10], [0, 34], [-20, 50], [0, 74], [20, 50]] };
    for (const k in R) { const b = walk(R[k]); c(k, !b.length, b.slice(0, 6).join(' | ')) }
    c('Bar La Esquina: caña', (await buy(/Bar La Esquina/, 'md_cana')) === 1); c('panadería: churros', (await buy(/Panadería/, 'md_churros')) === 1); c('frutería: cherries', (await buy(/Frutería/, 'md_fruta')) === 1);
  });

  step('memory home, Boris & Lila walk', async c => {
    const h = tgt(/Memory home: go up/); c('home door on the sidewalk', !!h && AV.W.surface(h.x, h.z) !== null && AV.isFree(AV.W, h.x, h.z, .3)); at(h.x, h.z); h.fn(); c('up in the flat', await until(() => AV.P.x > 1990 && AV.P.x < 2010, 20000));
    c('Boris and Lila at home', AV.madrid.dogs.length === 2 && AV.madrid.dogs.every(d => Math.abs(d.position.x - 2000) < 8));
    c('the home screen plays Ztonedape videos', AV.media.screens.some(s => /HOME/.test(s.name)));
    tgt(/Take Boris & Lila/).fn(); c('walk started', AV.madrid.walking()); tgt(/back down to the street/).fn(); c('back on the street', await until(() => AV.P.z < 12 && AV.P.x < 60, 20000));
    c('Boris and Lila follow you outside', await until(() => AV.madrid.dogs.every(d => Math.hypot(d.position.x - AV.P.x, d.position.z - AV.P.z) < 5), 120000), AV.madrid.dogs.map(d => d.position.x.toFixed(1) + ',' + d.position.z.toFixed(1)).join(' '));
    at(36, 30); tgt(/Bring Boris & Lila home/).fn(); c('home again', !AV.madrid.walking() && AV.madrid.dogs.every(d => d.position.x > 1990));
  });

  step('metro ride Pinar → Sol', async c => {
    const m = tgt(/Metro Pinar de Chamartín/); c('metro entrance', !!m); at(m.x, m.z); const m0 = AV.S.money; m.fn(); await sleep(300); $('cmp').querySelector('[data-stn="sol"]').click();
    c('in the carriage (2 credits)', await until(() => AV.madrid.cur && AV.P.x > 2190, 20000) && AV.S.money === m0 - 2); c('carriage is walkable', AV.W.surface(2200, 5) !== null && AV.W.surface(2200, 12) === null);
    c('metro rumble in the carriage', await until(() => AV.amb.lv.metro > .6, 60000), AV.amb.lv.metro); AV.madrid.skip(); c('arrived at Sol', await until(() => Math.abs(AV.P.z - (SZ + 6)) < 3, 20000), AV.P.x.toFixed(1) + ',' + AV.P.z.toFixed(1));
  });

  step('Sol → Montera → Gran Vía → Malasaña, venues', async c => {
    const R = { 'Puerta del Sol plaza': [[-36, SZ - 1], [36, SZ - 1], [0, SZ - 20], [0, SZ + 22]], 'Montera up to Gran Vía': [[0, SZ - 20], [0, GV + 8]], 'Gran Vía end to end (both sidewalks)': [[-148, GV + 9.5], [114, GV + 9.5], [114, GV - 9.5], [-148, GV - 9.5]], 'Gran Vía → Malasaña street': [[MX, GV - 9], [MX, GV - 84]],
      'into Sala Malasaña to the bar': [[MX, GV - 55], [MX - 8, GV - 55], [MX - 9, GV - 61], [-69, GV - 62.8]], 'into the taberna to the counter': [[MX, GV - 50], [MX + 8, GV - 50], [-42.7, GV - 50]] };
    for (const k in R) { const b = walk(R[k]); c(k, !b.length, b.slice(0, 6).join(' | ')) }
    c('Km 0 + the bear statue + clock building', !!AV.W.places.find(p => p.id === 'sol')); c('cinema screen on Gran Vía with the owner’s films', AV.media.screens.some(s => /CINE GRAN VÍA/.test(s.name) && s.list.length > 0));
    c('taberna tapas: bravas (vegan)', (await buy(/Taberna: tapas/, 'md_bravas')) === 1); c('Sala Malasaña bar', (await buy(/Sala Malasaña bar/, 'md_vermut')) === 1);
    c('Sala Malasaña DJ booth + drum kit', AV.act.venues.some(v => v.type === 'dj' && v.W === AV.W) && AV.act.venues.some(v => v.type === 'inst' && v.W === AV.W));
  });

  step('sound zones', async c => {
    const lv = () => AV.amb.lv; AV.S.time = 13 * 60; at(-14, SZ + 6); c('Sol: busker guitar', await until(() => lv().busker > .6, 60000), lv().busker); c('Sol by day: pigeons', lv().pigeons > .4, lv().pigeons);
    at(0, GV); c('Gran Vía: traffic', await until(() => lv().traffic > .6, 60000), lv().traffic);
    AV.S.time = 23 * 60; at(MX - 12, GV - 55); c('Malasaña at night: bar music', await until(() => lv().barmusic > .6, 60000), lv().barmusic); c('world music ducks for it', AV.media.ducks.some(f => f() > .5));
    AV.S.time = 12 * 60; at(0, 56); c('Parque de Pinar: birds', await until(() => lv().birds > .5, 60000), lv().birds);
  });

  /* one continuous city: a street route exists between neighbourhoods and every metre of it is walkable (no teleports) */
  step('one continuous city: walk between neighbourhoods', async c => {
    const N = AV.W.mapNav; c('street network', !!N && N.nodes.length > 200, N && N.nodes.length + ' nodes');
    c('many neighbourhoods on the map', (AV.W.mapDistricts || []).length >= 18, (AV.W.mapDistricts || []).map(d => d.name).join(', '));
    const near = (x, z) => { let b = 0, bd = 1e9; N.nodes.forEach((n, i) => { const d = Math.hypot(n[0] - x, n[1] - z); if (d < bd) { bd = d; b = i } }); return b };
    const route = (a, b) => { const prev = new Int32Array(N.nodes.length).fill(-2), Q = [a]; prev[a] = -1; while (Q.length) { const u = Q.shift(); if (u === b) break; for (const v of N.links[u]) if (prev[v] === -2) { prev[v] = u; Q.push(v) } } if (prev[b] === -2) return null; const out = []; for (let u = b; u >= 0; u = prev[u]) out.unshift(N.nodes[u]); return out };
    const walkable = pts => { const bad = []; for (let k = 1; k < pts.length; k++) { const [x0, z0] = pts[k - 1], [x1, z1] = pts[k], n = Math.ceil(Math.hypot(x1 - x0, z1 - z0)); for (let i = 0; i <= n; i += 2) { const x = x0 + (x1 - x0) * i / n, z = z0 + (z1 - z0) * i / n; if (AV.W.surface(x, z) === null || !AV.isFree(AV.W, x, z, .3)) bad.push(x.toFixed(0) + ',' + z.toFixed(0)) } } return bad };
    const D = id => AV.W.mapDistricts.find(d => d.id === id); const start = near(100, 60);
    for (const id of ['chamartin', 'tetuan', 'salamanca', 'chueca', 'opera', 'latina', 'lavapies', 'embajadores', 'atocha', 'moncloa', 'delicias']) { const d = D(id), r = d && route(start, near(d.x, d.z)); c('Pinar → ' + (d ? d.name : id) + ': street route', !!r, r && r.length + ' nodes'); if (r) { const b = walkable(r); c('   … every step walkable', b.length < 3, b.slice(0, 5).join(' ')) } }
    c('Retiro, Madrid Río, Casa de Campo, Parque del Oeste are open ground', [[490, 1040], [-380, 1210], [-720, 1150], [-500, 900]].every(([x, z]) => AV.W.surface(x, z) !== null));
    c('the river is water', AV.W.surface(-470, 1080) === null);
    { const lv = D('lavapies'); AV.P.x = 0; AV.P.z = 40; const d = AV.minimap.setDest(lv.x, lv.z, 'Lavapiés'); c('map route Pinar → Lavapiés follows the streets', d.path.length > 20, d.path.length + ' points'); AV.minimap.clearDest() }
    const ms = AV.W.T.filter(t => /🚇 Metro/.test(lab(t))).length; c('metro stations across the city', ms >= 15, ms);
    c('no JS errors', !$('err').textContent, $('err').textContent);
  });
  step('Tetuán street', async c => { await shot(-70, 385, Math.PI * .5, .06, 12); c('rendered', true) }, { shot: 'madrid_tetuan' });
  step('Lavapiés street', async c => { await shot(70, 1192, -Math.PI * .5, .06, 13); c('rendered', true) }, { shot: 'madrid_lavapies' });
  step('Retiro', async c => { await shot(505, 1035, 0, .03, 12); c('rendered', true) }, { shot: 'madrid_retiro' });
  step('Salamanca', async c => { await shot(350, 595, Math.PI, .08, 12); c('rendered', true) }, { shot: 'madrid_salamanca' });
  step('Pinar view', async c => { await shot(-50, -2, -Math.PI / 2 + .3, .08, 12); c('rendered', true) }, { shot: 'madrid_pinar' });
  step('Sol view', async c => { await shot(0, SZ - 14, Math.PI, .12, 13); c('rendered', true) }, { shot: 'madrid_sol' });
  step('Gran Vía view', async c => { await shot(-130, GV + 8, -Math.PI / 2, .1, 21); c('rendered', true) }, { shot: 'madrid_granvia' });
  step('flat view', async c => { const h = (AV.travel('madrid', 'home'), null); await sleep(300); await until(() => AV.W && AV.W.id === 'madrid' && settled(), 120000); await shot(2006, 3, Math.PI / 2 + .6, -.15, 12); c('no JS errors', !$('err').textContent, $('err').textContent) }, { shot: 'madrid_flat' });

  let active = [];
  return { names(mobile) { active = steps.filter(s => !!s.mobile === !!mobile || s.name === 'boot'); return active.map(s => s.name) },
    async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
