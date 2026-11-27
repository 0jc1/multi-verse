/* APEVERSE 2.2 GLOBAL WORLDS: SEVILLA on an emulated phone (agent 4).  run_tests.ps1 -Mobile: 915x412 landscape, touch, Android UA.
   Phone detected + touch controls; the joystick walks you down a street; it can't push you through a house or into the river;
   you walk into a walk-in (Casa Fermín) with the joystick and buy with the ▶ act button; shop / portal / Feria panels fit the screen;
   GPS; the Feria on a phone (frame sample); screenshots.
   gpu_queue.ps1 -Owner agent4 -Suite tools/tests/suite_sevilla_mobile.js -Gpu -Mobile -Port 8100 -StepTimeout 900 */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const lbl = t => { try { return typeof t.label === 'function' ? t.label() : t.label } catch (e) { return '' } };
  const findT = re => AV.W.T.find(t => re.test(lbl(t)) && (!t.show || t.show()));
  const put = (x, z, yaw) => { const p = AV.P; p.x = x; p.z = z; p.y = AV.W.surface(x, z) || 0; if (yaw != null) p.yaw = yaw; p.pitch = 0; p.vx = p.vz = 0 };
  const face = (x, z) => { const p = AV.P; p.yaw = Math.atan2(-(x - p.x), -(z - p.z)); p.pitch = 0 };
  const fits = el => { if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 50 && r.left >= -1 && r.right <= innerWidth + 1 && r.height <= innerHeight + 2 };
  const shown = id => { const e = $(id); return !!e && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().width > 0 };
  const stick = async (ms) => { AV.T.y = -1; await sleep(ms); AV.T.y = 0; await sleep(250) };   /* push the joystick forward (the way you face) */
  const sample = async s => { let n = 0, on = true; const f = () => { n++; if (on) requestAnimationFrame(f) }; requestAnimationFrame(f); await sleep(s * 1000); on = false; return +(n / s).toFixed(1) };
  step('boot (phone)', async c => { await until(() => window.AV && AV.worldDefs && $('bNew'), 30000); $('gq').value = 'Medium'; $('bNew').click(); if (!await until(() => AV.W && AV.running, 30000)) $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); await sleep(1500); AV.save = () => { }; AV.S.money = 3000;
    c('detected as a phone', AV.device === 'phone', AV.device); c('touch controls shown', shown('tc') && shown('tE'), innerWidth + 'x' + innerHeight) });
  step('Sevilla on a phone: walk, collisions', async c => { AV.S.time = 12 * 60; if (AV.fest) AV.fest.force('feria_abril', false); AV.travel('sevilla'); c('loads', await until(() => AV.W && AV.W.id === 'sevilla' && settled(), 240000)); await sleep(3500); c('no error', !$('err').textContent && !AV.sevilla.stats.lifeErr);
    c('touch controls still shown', shown('tc') && shown('tE'));
    { const sp = AV.sevilla.N.snap(1.5, -205, 3); put(sp[0], sp[1]) } face(-6, -260); c('standing on Sierpes', AV.W.surface(AV.P.x, AV.P.z) !== null); const p = AV.P, x0 = p.x, z0 = p.z; await stick(2500); c('joystick walks you up Calle Sierpes', Math.hypot(p.x - x0, p.z - z0) > 3, Math.hypot(p.x - x0, p.z - z0).toFixed(1) + ' m');
    /* push into a house front: you stop at the facade, never inside */
    const l = AV.sevilla.lots.find(q => q.src === 'sierpes' && !q.hollow); const f0 = AV.gwkit.localPt(l.H.base, 0, 2), f1 = AV.gwkit.localPt(l.H.base, 0, -3); put(f0[0], f0[1]); face(f1[0], f1[1]); await stick(2500); c('a house stops you (no walking through walls)', AV.W.surface(p.x, p.z) !== null && Math.hypot(p.x - f1[0], p.z - f1[1]) > 1.5, p.x.toFixed(1) + ',' + p.z.toFixed(1));
    put(-188, -60); face(-230, -60); await stick(1500); c('the bridge carries you over the river', AV.W.surface(p.x, p.z) > .3, 'y ' + (AV.W.surface(p.x, p.z) || 0).toFixed(2));
    put(-182, 40); face(-215, 40); await stick(2500); c('the river edge stops you (no walking on water)', AV.W.surface(p.x, p.z) !== null && p.x > -186, p.x.toFixed(1)) }, { shot: 'sev_phone_street' });
  step('walk into Casa Fermín with the joystick and buy with ▶ act', async c => { const it = AV.sevilla.interiors.casafermin; c('walk-in', !!it); if (!it) return; const p = AV.P; put(it.door[0], it.door[1]); face(it.doorIn[0], it.doorIn[1]); await stick(1800);
    const inside = AV.sevilla.N.code(p.x, p.z) === 8; c('inside through the door', inside, p.x.toFixed(1) + ',' + p.z.toFixed(1));
    const T2 = findT(/Bar \(Manolo\)/); if (T2) { put(T2.x, T2.z); await sleep(600); AV.interact(); await sleep(600); const cm = $('cmp'); c('▶ act opens the bar menu', !!cm && /data-buy/.test(cm.innerHTML)); c('menu fits the phone screen', fits(cm && (cm.firstElementChild || cm)), cm ? Math.round(cm.getBoundingClientRect().width) + 'x' + Math.round(cm.getBoundingClientRect().height) + ' / ' + innerWidth + 'x' + innerHeight : '');
      const b = document.querySelector('#cmp [data-buy="sev_espinacas"]'), n0 = AV.bag.count('sev_espinacas'); if (b) { await sleep(450); b.click(); await sleep(400) } c('bought on a phone', AV.bag.count('sev_espinacas') === n0 + 1); AV.closePanel('cmp') }
    face(it.mid[0], it.mid[1]); await sleep(1200) }, { shot: 'sev_phone_bar' });
  step('panels fit: portal, Feria switch, convent torno; GPS', async c => { for (const re of [/Apeverse Portal/, /Feria de Abril: festival mode/, /Convent torno/]) { const T2 = findT(re); c(re.source + ' target', !!T2); if (!T2) continue; put(T2.x, T2.z); T2.fn(); await sleep(400); c(re.source + ' panel fits', fits($('cmp'))); AV.closePanel('cmp'); await sleep(200) }
    AV.minimap.setDest(190, 40, 'test'); c('GPS route to Plaza de Santa Cruz', await until(() => AV.minimap.dest && AV.minimap.dest.path && AV.minimap.dest.path.length >= 1, 4000)) });
  step('Santa Cruz on a phone', async c => { put(128, -30); face(128, -44); await sleep(2000); const f = await sample(2.5); c('frame in Santa Cruz (phone emulation on this GPU)', true, f + ' fps') }, { shot: 'sev_phone_santacruz' });
  step('the Feria on a phone', async c => { AV.S.time = 22 * 60; AV.fest.force('feria_abril', true); await sleep(1500); const sp = AV.sevilla.N.snap(-373, 272, 4); put(sp[0], sp[1]); face(-373, 246); await sleep(2500); const f = await sample(2.5); c('frame at the Feria entrance (phone emulation)', true, f + ' fps');
    const k = AV.sevilla.LM.casetas[17]; put(k.front[0], k.front[1] - k.f * 3); face(k.bar[0], k.bar[1]); await stick(2500); c('joystick into a caseta', Math.hypot(AV.P.x - k.bar[0], AV.P.z - k.bar[1]) < 5.5, Math.hypot(AV.P.x - k.bar[0], AV.P.z - k.bar[1]).toFixed(1) + ' m from the bar');
    sp && put(sp[0], sp[1]); face(-373, 246); await sleep(1200); AV.fest.force('feria_abril', null) }, { shot: 'sev_phone_feria' });
  step('no JS errors', async c => c('clean', !$('err').textContent, $('err').textContent));
  return { names() { return steps.map(s => s.name) }, async exec(i) { const s = steps[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
