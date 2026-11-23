/* Worlds Reborn §28: circular minimap + atlas (run_tests.ps1 -Suite tools\tests\suite_minimap.js -StepTimeout 900 [-Mobile]) */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const $ = id => document.getElementById(id), lab = t => typeof t.label === 'function' ? t.label() : t.label;
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const travel = async id => { AV.travel(id); return until(() => AV.W && AV.W.id === id && settled(), 90000) };
  const MM = () => AV.minimap, S = () => AV.S.set.mm;
  const key = code => document.dispatchEvent(new KeyboardEvent('keydown', { code, key: code, bubbles: true }));
  const built = async () => { await until(() => MM().base && MM().base.W === AV.W, 60000); MM()._buildNow(); return MM().base.done };

  step('boot', async c => { $('gq').value = 'Low'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); await sleep(1500); AV.save = () => { }; c('Chiang Mai', await travel('chiang_mai')) });

  step('Chiang Mai: minimap drawn from the real world', async c => {
    c('minimap shown top right', await until(() => MM().visible(), 60000)); const r = $('mmWrap').getBoundingClientRect(); c('top-right corner, round', r.right > innerWidth - 30 && r.top < 30 && r.width === 190, JSON.stringify([r.left, r.top, r.width]));
    c('FPS box moved below the minimap', !$('fps').style.top || /2\d\dpx/.test($('fps').style.top), $('fps').style.top);
    c('map built from the world', await built(), MM().base && MM().base.cw + 'x' + MM().base.ch + ' @' + MM().base.res + ' m/px');
    c('ground under the player is drawn', (MM()._px(AV.P.x, AV.P.z) || [0, 0, 0, 0])[3] === 255, JSON.stringify(MM()._px(AV.P.x, AV.P.z)));
    const road = AV.W.mapRoads && AV.W.mapRoads[0], mid = road && [(road[0] + road[2]) / 2, (road[1] + road[3]) / 2], px = mid && MM()._px(mid[0], mid[1]); c('streets drawn (light grey)', px && px[0] > 150 && px[1] > 150, JSON.stringify(px));
    const col = AV.W.cols.find(k => k[1] - k[0] > 3 && k[3] - k[2] > 3), bp = col && MM()._px((col[0] + col[1]) / 2, (col[2] + col[3]) / 2); c('buildings drawn (tan)', bp && bp[0] > bp[2] + 30, JSON.stringify(bp));
    c('covers the whole city', MM()._fill() > .3, (MM()._fill() * 100).toFixed(0) + '% of the bounding box');
  });

  step('arrow + rotation + north-up + zoom', async c => {
    const P = AV.P; S().rot = true; S().zoom = 1; P.yaw = 1.1; const f = MM()._scr(P.x - Math.sin(P.yaw) * 10, P.z - Math.cos(P.yaw) * 10); c('rotating: what is ahead of you is straight up', Math.abs(f[0] - 95) < .5 && f[1] < 95 - 10, f.map(n => n.toFixed(1)).join(','));
    key('KeyL'); c('L: north-up', S().rot === false); const n = MM()._scr(P.x, P.z - 10); c('north-up: north (-z) is straight up', Math.abs(n[0] - 95) < .5 && n[1] < 85, n.map(v => v.toFixed(1)).join(','));
    key('KeyL'); const z0 = S().zoom; key('Equal'); c('= zooms in', S().zoom > z0); key('Minus'); key('Minus'); c('- zooms out', S().zoom < z0);
    S().zoom = 1;
  });

  step('places are discovered by visiting; markers, vehicles, atlas', async c => {
    AV.S.mmSeen = {}; const hostel = MM().places().find(p => p.id === 'hostel'), far = MM().places().find(p => p.id === 'bazaar');
    AV.P.x = hostel.x + 5; AV.P.z = hostel.z; MM()._mk = MM().markers(); c('Giant Hostel discovered when close', MM()._mk.some(m => m.name === 'Giant Hostel')); c('far Night Bazaar still hidden', !MM()._mk.some(m => /Night Bazaar/.test(m.name)));
    c('basketball court + bike hire on the map when near', (AV.P.x = 39, AV.P.z = 70, MM().markers().some(m => m.icon === '🏀')), MM().markers().map(m => m.icon || m.kind).join(' '));
    const t = AV.W.T.find(t => /Rent a bicycle/.test(lab(t))); AV.P.x = t.x; AV.P.z = t.z; t.fn(); AV.act.cur.v = 3; $('actLeave').click(); c('your parked bike shows on the map', MM().markers().some(m => m.kind === 'veh'));
    key('KeyJ'); c('J opens the full map', !!$('mmAtlas') && $('mmAtlas').width > 200, $('mmAtlas') && $('mmAtlas').width + 'x' + $('mmAtlas').height); c('lists found places with distance', /Giant Hostel · \d+ m/.test($('cmp').textContent));
    $('cmp').querySelector('[data-mm="rot"]').click(); c('atlas button: north-up', S().rot === false); $('cmp').querySelector('[data-mm="rot"]').click();
    key('KeyJ'); c('J closes it', !MM().atlasOpen()); key('KeyJ'); c('J opens it again', MM().atlasOpen()); key('KeyJ');
    AV.act.start('photo'); await sleep(200); c('hidden in photo mode', await until(() => !MM().visible(), 60000)); AV.act.end('leave'); c('back after photo mode', await until(() => MM().visible(), 60000));
  });

  step('every main world gets a map', async c => {
    for (const id of ['ape_town', 'vienna', 'jungle_dub', 'astro9', 'da_nang']) { c(id, await travel(id)); const ok = await built(); c(id + ': map built, covers ground', ok && MM()._fill() > .15 && (MM()._px(AV.P.x, AV.P.z) || [0, 0, 0, 0])[3] === 255, ok && (MM()._fill() * 100).toFixed(0) + '% · ' + MM().base.cw + 'x' + MM().base.ch + ' @' + MM().base.res) }
    c('no JS errors', !$('err').textContent, $('err').textContent);
  });

  step('phone: small minimap under the buttons, tap = full map', async c => {
    $('gq').value = 'Low'; $('bNew').click(); await until(() => AV.W && AV.running, 30000); await sleep(1500); AV.save = () => { };
    c('minimap shown', await until(() => MM().visible(), 60000)); const r = $('mmWrap').getBoundingClientRect(), m = $('tM').getBoundingClientRect(); c('112 px, below the Map button, not overlapping', r.width === 112 && r.top >= m.bottom - 1, JSON.stringify([r.top, m.bottom, r.width]));
    $('mmWrap').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); c('tap opens the full map', !!$('mmAtlas')); AV.closePanel('cmp');
  }, { mobile: true, shot: 'minimap_phone' });

  let active = [];
  return { names(mobile) { active = steps.filter(s => !!s.mobile === !!mobile || s.name === 'boot'); return active.map(s => s.name) },
    async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
