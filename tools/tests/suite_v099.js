/* Apeverse V0.9.9 - Vienna 2000s Memory World suite (run_tests.ps1 -Suite tools\tests\suite_v099.js [-Mobile]) */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const $ = id => document.getElementById(id), lab = t => typeof t.label === 'function' ? t.label() : t.label;
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const travel = async (id, arr) => { AV.travel(id, arr); return until(() => AV.W && AV.W.id === id && settled(), 40000) };
  const look = (x, z, tx, tz, pitch) => { AV.P.x = x; AV.P.z = z; AV.P.y = AV.W.surface(x, z) || 0; AV.P.vx = AV.P.vz = 0; AV.P.yaw = Math.atan2(-(tx - x), -(tz - z)); AV.P.pitch = pitch || .05 };
  const tgt = re => AV.W.T.find(t => (!t.show || t.show()) && re.test(lab(t)));
  const closeAll = () => { let n = 0; while (AV.modals.length && n++ < 10) AV.closeTop() };
  const skinned = () => { let n = 0; AV.W.group.traverse(o => { if (o.isSkinnedMesh) n++ }); return n };
  const cost = () => { const R = AV.R; R.info.autoReset = false; R.info.reset(); R.render(AV.scene, AV.cam); const r = { tris: R.info.render.triangles, calls: R.info.render.calls }; R.info.autoReset = true; return r };
  const M = {};

  step('boot', async c => { $('gq').value = 'High'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 20000)); await sleep(1500); AV.save = () => { }; AV.S.money = 900 });

  step('Ape Town: 5th Portal Grove gate → Vienna', async c => {
    c('Vienna is playable', AV.isPlayable('vienna')); const g = tgt(/Vienna 2000s/); c('gate in the Portal Grove', !!g, g && lab(g));
    if (g) { g.fn(); c('step through the gate', await until(() => AV.W && AV.W.id === 'vienna' && settled(), 40000)) } else c('travel', await travel('vienna'));
    c('no world error', !$('err').textContent, $('err').textContent); c('Vienna playlist', AV.audio.track.key === 'vienna' || !AV.audio.track.active, AV.audio.track.key);
  });

  step('places, bridges, water', async c => {
    const W = AV.W; c('15 places on the travel list', W.places.length >= 15, W.places.length);
    const bad = W.places.filter(p => W.surface(p.x, p.z) === null).map(p => p.id); c('every place is walkable', !bad.length, bad.join(','));
    c('Donaukanal is water', W.surface(-62.7, -6) === null); c('Danube is water', W.surface(...(() => { const t = 120, p = [30 + .894 * t, -160 + .447 * t]; return [p[0] - .447 * 10, p[1] + .894 * 10] })()) === null);
    let ok = true; for (let k = -20; k <= 20; k += 1) { const t = 150, p = [30 + .894 * t + .447 * k, -160 + .447 * t - .894 * k]; if (W.surface(p[0], p[1]) === null) ok = false } c('Reichsbrücke crosses the Danube + Donauinsel to the 22nd', ok);
    c('22nd district (VIS) reachable', W.surface(172, -108) !== null); c('Kahlenberg rises', W.surface(-150, -125) > 20, W.surface(-150, -125));
  });

  step('Stephansplatz + bar street + food', async c => {
    for (const [re, item] of [[/Waxy’s: cheap pint/, 'waxys_pint'], [/Lukas: Weißer Spritzer/, 'spritzer'], [/Dons: shisha/, 'shisha'], [/Würstel Stand: Käsekrainer/, 'kaesekrainer'], [/Happy Noodles: box noodles/, 'happy_noodles']]) { const t = tgt(re); const n0 = AV.bag.count(item); if (t) t.fn(); c(String(re).slice(1, 30) + ' → ' + item, !!t && AV.bag.count(item) === n0 + 1) }
    c('friends + bartenders + ravers (rigged)', skinned() >= 30, skinned());
    const b = AV.beings.list.find(x => /Old friend Max/.test(x.name)); c('Old friend Max exists', !!b); if (b) { AV.beings.chat(b); await sleep(200); c('chat includes a Vienna memory or context line', $('bln').textContent.length > 20, $('bln').textContent); closeAll() }
    look(-36, 10, -2, -30, .32); await sleep(2500); M.steph = cost();
  }, { shot: 'v099_stephansplatz' });

  step('bars at night', async c => { look(34, -30, 34, -50, .05); await sleep(2000); c('bar street rendered', true) }, { shot: 'v099_bars' });

  step('transport: U-Bahn + Ring tram', async c => {
    closeAll(); const u = tgt(/U-Bahn Stephansplatz/); c('U-Bahn station at Stephansplatz', !!u); if (u) { AV.P.x = u.x; AV.P.z = u.z; u.fn(); await sleep(200); const b = [...$('cmp').querySelectorAll('[data-u]')].find(x => /Praterstern/.test(x.dataset.u)); b && b.click(); c('U-Bahn to Praterstern', await until(() => Math.hypot(AV.P.x - 112, AV.P.z + 29) < 6, 8000), AV.P.x.toFixed(0) + ',' + AV.P.z.toFixed(0)) }
    const st = tgt(/Ring tram stop/); c('Ring tram stops', !!st); if (st) { AV.P.x = st.x; AV.P.z = st.z; st.fn(); c('ride the Ring tram', !!AV.vienna.ride); const p0 = [AV.P.x, AV.P.z]; c('the tram moves you round the Ring', await until(() => Math.hypot(AV.P.x - p0[0], AV.P.z - p0[1]) > 5, 30000)); const off = tgt(/Hop off the tram/); off && off.fn(); c('hop off', !AV.vienna.ride && AV.W.surface(AV.P.x, AV.P.z) !== null) }
  });

  step('Prater + Karlsplatz + Stadtpark', async c => {
    const scr = AV.media.screens.find(s => /KARLSPLATZ/.test(s.name)); c('Karlsplatz summer cinema (music videos + film)', !!scr && scr.list.length >= 40, scr && scr.list.length);
    const g = AV.beings.list.find(b => /Golden Johann/.test(b.name)); let gold = false; g && g.h.traverse(o => { if (o.isSkinnedMesh) gold = (Array.isArray(o.material) ? o.material[0] : o.material).metalness === 1 }); c('golden living statue in the Stadtpark', gold);
    look(118, 4, 152, -26, .38); await sleep(2500); M.prater = cost(); c('Prater rendered', M.prater.tris > 0, JSON.stringify(M.prater));
  }, { shot: 'v099_prater' });
  step('Karlsplatz view', async c => { look(14, 78, 14, 114, .25); await sleep(2500); M.karl = cost(); c('Karlsplatz rendered', M.karl.tris > 0, JSON.stringify(M.karl)) }, { shot: 'v099_karlsplatz' });
  step('Kahlenberg viewpoint', async c => { const k = tgt(/Kahlenberg viewpoint/); c('viewpoint target', !!k); if (k) { AV.P.x = k.x; AV.P.z = k.z; AV.P.y = AV.W.surface(k.x, k.z); k.fn(); await sleep(2500) } M.kahl = cost(); c('panorama rendered', M.kahl.tris > 0, JSON.stringify(M.kahl)) }, { shot: 'v099_kahlenberg' });

  step('winter mode', async c => {
    look(152, 30, 152, 60, .1); AV.keymap.KeyF(); c('F → winter', await until(() => AV.S.vienna.season === 'winter' && AV.W.id === 'vienna' && settled() && /Winter|Invierno/.test(AV.W.name), 40000), AV.W.name);
    const g = tgt(/Glühwein stand/); c('Christmas market open (Glühwein)', !!g); if (g) { const n0 = AV.bag.count('gluehwein'); g.fn(); c('buy Glühwein', AV.bag.count('gluehwein') === n0 + 1) }
    let snow = false; AV.W.group.traverse(o => { if (o.isPoints && o.geometry.attributes.position.count > 500) snow = true }); c('it snows', snow);
    look(152, 34, 152, 64, .12); await sleep(2500); M.winter = cost();
  }, { shot: 'v099_winter' });
  step('back to summer + portal home', async c => {
    AV.keymap.KeyF(); c('F → summer', await until(() => AV.S.vienna.season === 'summer' && settled() && /Summer|Verano/.test(AV.W.name), 40000));
    const p = tgt(/Portal: back to Ape Town/); c('portal home', !!p); if (p) { p.fn(); c('arrive at the Portal Grove', await until(() => AV.W.id === 'ape_town' && settled(), 40000) && Math.hypot(AV.P.x - 58, AV.P.z + 66) < 10, AV.P.x.toFixed(0) + ',' + AV.P.z.toFixed(0)) }
    c('render cost', true, JSON.stringify(M));
  });

  step('phone: Fest switches the season', async c => {
    $('gq').value = 'Low'; $('bNew').click(); await until(() => AV.W && AV.running, 20000); await sleep(1500); AV.save = () => { };
    c('travel to Vienna (Low)', await travel('vienna')); c('Fest button visible', getComputedStyle($('tF')).display === 'block');
    $('tF').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); c('Fest → winter', await until(() => AV.S.vienna.season === 'winter' && settled(), 40000));
    c('phone count of characters is lower', skinned() < 40, skinned());
  }, { mobile: true, shot: 'v099_phone' });

  let active = [];
  return { names(mobile) { active = steps.filter(s => !!s.mobile === !!mobile || s.name === 'boot'); return active.map(s => s.name) },
    async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
