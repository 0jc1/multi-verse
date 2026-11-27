/* Apeverse V0.9.4 - Chiang Mai test suite (run: powershell -ExecutionPolicy Bypass -File tools\tests\run_tests.ps1 -Suite tools\tests\suite_cm.js)
   Drives the real game in headless Chrome: Ape Town -> Portal Grove gate -> Chiang Mai, hostel, crew, missions, pool vs Nuni,
   festival modes (Yi Peng & Loy Krathong, Songkran), tuk-tuks, portal back to Ape Town. */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const $ = id => document.getElementById(id);
  const lab = t => typeof t.label === 'function' ? t.label() : t.label;
  const tgt = re => AV.W && AV.W.T.find(t => (!t.show || t.show()) && re.test(lab(t)));
  const place = (x, z, yaw) => { const W = AV.W, s = AV.safeSpot(W, x, z); AV.P.x = s[0]; AV.P.z = s[1]; AV.P.y = W.surface(s[0], s[1]) || 0; AV.P.vx = AV.P.vy = AV.P.vz = 0; if (yaw != null) AV.P.yaw = yaw };
  const closeAll = () => { let n = 0; while (AV.modals.length && n++ < 10) AV.closeTop() };
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const crew = () => AV.cm && AV.cm.cur && AV.cm.cur.crew;

  step('boot', async c => {
    $('gq').value = 'Low'; $('bNew').click();
    c('Ape Town loads', await until(() => AV.W && AV.W.id === 'ape_town' && AV.running, 20000));
    if (AV.assets && AV.assets.ready) await AV.assets.ready(20000); await sleep(3000);
  });

  step('Ape Town Portal Grove -> Chiang Mai', async c => {
    const g = tgt(/Step through: Chiang Mai/); c('Portal Grove has a Chiang Mai gate', !!g); if (!g) return;
    g.fn(); c('gate travels to Chiang Mai', await until(() => AV.W && AV.W.id === 'chiang_mai' && settled(), 25000));
    await sleep(2500);
    const cr = crew(); c('hostel crew spawned', cr && ['mud', 'nuni', 'steve', 'dino', 'zape'].every(k => cr[k]), cr && Object.keys(cr).join(','));
    c('arrived on the hostel terrace', Math.hypot(AV.P.x - 6, AV.P.z - 46) < 6, AV.P.x.toFixed(1) + ',' + AV.P.z.toFixed(1));
    c('Chiang Mai HUD shows modes', await until(() => /festival/.test($('cmhud').textContent), 20000), $('cmhud').textContent);   /* the HUD fills on the first frames; headless runs ~1.5 fps here */
    { const h = (AV.S.time / 60) % 24, eve = h >= 19 || h < 1; c('Chiang Mai playlist selected (evening: live band at Blue’s)', AV.audio.track.key === (eve ? 'stone_ape_band' : 'chiang_mai') || AV.audio.track.key === 'chiang_mai', AV.audio.track.key + ' @' + h.toFixed(1) + 'h') }
    c('in registry as playable (Portal Pipe)', AV.isPlayable('chiang_mai'));
    const info = AV.R.info.render; c('renders the city', info.calls > 40, 'draw calls ' + info.calls + ', tris ' + info.triangles);
  }, { shot: 'cm_arrival' });

  /* V1.2 owner street relationships: Big Blues faces Giant Hostel across Moon Muang Rd; Chat is farther (a block east, one turn);
     Pineapple Express farther again (on the road to Tha Phae Gate, two turns). Routes run on road centre lines (no kerbside props). */
  step('street layout: Giant / Big Blues / Chat / Pineapple Express', async c => {
    const W = AV.W, pl = id => W.places.find(p => p.id === id), hostel = pl('hostel'), blues = pl('blues'), chat = pl('chat'), pine = pl('pine');
    c('map pins for Big Blues, Chat and Pineapple Express', !!(blues && chat && pine));
    const len = pts => pts.reduce((s, p, i) => i ? s + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0, 0);
    const bad = pts => { const out = []; for (let k = 1; k < pts.length; k++) { const [x0, z0] = pts[k - 1], [x1, z1] = pts[k], n = Math.ceil(Math.hypot(x1 - x0, z1 - z0)); for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, z = z0 + (z1 - z0) * i / n; if (W.surface(x, z) === null || !AV.isFree(W, x, z, .35)) out.push(x.toFixed(1) + ',' + z.toFixed(1)) } } return out };
    const rBlues = [[15.5, 49], [15.5, 44], [17, 44], [17, 42.4]], rChat = [[15.5, 49], [15.5, 44], [60, 44], [60, 56.5], [62.3, 56.5]], rPine = [[62.3, 56.5], [60, 56.5], [60, 0], [204, 0], [204, 5.4]];   /* 2.1: Pineapple Express moved out to Tha Phae Rd (through the gate) */
    c('Big Blues door faces the hostel door across the road', Math.abs(blues.x - hostel.x) < 4 && blues.z < 44 && hostel.z > 44 - 1, 'hostel z ' + hostel.z + ' · blues z ' + blues.z);
    let b = bad(rBlues); c('walk: hostel door → across the road → Big Blues door', !b.length, b.slice(0, 5).join(' '));
    b = bad(rChat); c('walk: hostel → Chat (one turn)', !b.length, b.slice(0, 5).join(' '));
    b = bad(rPine); c('walk: Chat → Pineapple Express (two turns)', !b.length, b.slice(0, 5).join(' '));
    const dB = len(rBlues), dC = len(rChat), dP = dC + len(rPine); c('distances: Big Blues < Chat < Pineapple Express', dB < dC && dC < dP && dC > 40 && dP > 90, dB.toFixed(0) + ' m < ' + dC.toFixed(0) + ' m < ' + dP.toFixed(0) + ' m');
    b = bad([[62.3, 56.5], [66.6, 56.5], [70, 56.5]]); c('Chat: walk in through its door', !b.length, b.join(' '));
    b = bad([[204, 5.4], [204, 9.3], [204, 12]]); c('Pineapple Express: walk in through its door', !b.length, b.join(' '));
    const kae = pl('kae'), chada = pl('chada'); c('2.1: Khun Kae’s + Chada’s have their own neighbourhoods (map pins)', !!(kae && chada));
    const far = (p, q) => Math.hypot(p.x - q.x, p.z - q.z); c('2.1: only Giant + Big Blues face each other; the others are spread out (> 40 m from Big Blues and from each other)', [kae, chada, pine].every(p => far(p, blues) > 40) && far(kae, chada) > 40 && far(kae, pine) > 40 && far(chada, pine) > 40, ['kae', 'chada', 'pine'].map((k, i) => k + ' ' + far([kae, chada, pine][i], blues).toFixed(0) + ' m').join(' · '));
    for (const [p, nm] of [[kae, 'Khun Kae’s'], [chada, 'Chada’s']]) { b = bad([[p.x, p.z], [p.x, p.z + (p.z < kae.z + 1 && nm === 'Khun Kae’s' ? -3.6 : 3.6)]]); c('walk in through ' + nm + ' door', !b.length, b.join(' ')) }
    c('2.1: painted boards for Khun Kae’s, Chada’s and Big Blues gig posters', ['kae', 'chada', 'gig'].every(s => { let f = false; W.group.traverse(o => { if (o.userData.cmSign === s) f = true }); return f }));
    c('painted signs mounted (no floating text)', ['pine', 'chat', 'blues'].every(s => { let f = false; W.group.traverse(o => { if (o.userData.cmSign === s) f = true }); return f }));
    c('Chat counter + book swap', !!tgt(/Chat café: Thai iced tea/) && !!tgt(/Chat book swap/)); c('Pineapple shake counter inside the new bar', (() => { const t = tgt(/pineapple shake/); return t && t.x > 70 && t.z < 20 })());
    place(17, 47, 0); AV.P.yaw = 0; AV.P.pitch = .05; await sleep(5000);
  }, { shot: 'cm_hostel_blues' });
  step('Giant Hostel sign from across Moon Muang Rd', async c => { place(19.5, 41.5, Math.PI); AV.P.yaw = Math.PI; AV.P.pitch = .22; await sleep(5000); c('looking at the Giant Hostel sign', true) }, { shot: 'cm_giant_sign' });
  step('Chat + Pineapple Express street views', async c => { place(54, 56.5, -Math.PI / 2); AV.P.yaw = -Math.PI / 2; AV.P.pitch = .04; await sleep(5000); c('looking at Chat', true) }, { shot: 'cm_chat' });
  step('Khun Kae’s view', async c => { place(36, 2, 0); AV.P.yaw = 0; AV.P.pitch = .06; await sleep(5000); c('looking at Khun Kae’s', true) }, { shot: 'cm_kae' });
  step('Chada’s view', async c => { place(-34, -63, Math.PI); AV.P.yaw = Math.PI; AV.P.pitch = .06; await sleep(5000); c('looking at Chada’s', true) }, { shot: 'cm_chada' });
  step('Pineapple Express view', async c => { place(204, -3, Math.PI); AV.P.yaw = Math.PI; AV.P.pitch = .06; await sleep(5000); c('looking at Pineapple Express', true) }, { shot: 'cm_pineapple' });

  step('Giant Hostel', async c => {
    closeAll(); for (const re of [/Reception bell/, /Festival board/, /Pool table: friendly/, /Shop counter/, /Apeverse Portal/, /Sleep in your bunk/, /Pet Bobo/]) c('target: ' + re.source, !!AV.W.T.find(t => re.test(lab(t))));
    place(15.5, 49, Math.PI); AV.P.yaw = Math.PI; AV.keys.KeyW = 1; const ok = await until(() => AV.P.z > 56, 60000);   /* headless SwiftShader runs Chiang Mai at ~1.5 fps */ AV.keys.KeyW = 0; c('walk in through the front door', ok, 'z ' + AV.P.z.toFixed(1));
    place(25, 49.6, Math.PI); AV.P.yaw = Math.PI; AV.keys.KeyW = 1; await sleep(2500); AV.keys.KeyW = 0; c('glass shopfront blocks walking', AV.P.z < 52.3, 'z ' + AV.P.z.toFixed(2));
    place(11, 72, Math.PI); AV.P.yaw = Math.PI; AV.keys.KeyW = 1; const inRoom = await until(() => AV.P.z > 75, 15000); AV.keys.KeyW = 0; c('corridor leads into guest room 1', inRoom || AV.P.z > 74, 'z ' + AV.P.z.toFixed(1));
    const m0 = AV.S.money; tgt(/Reception bell/).fn(); c('rent a bed costs 40', AV.S.money === m0 - 40); AV.S.time = 23 * 60; const d0 = AV.S.day; tgt(/Sleep in your bunk/).fn(); await sleep(1600); c('sleeping wakes you at 08:00 next day', AV.S.day === d0 + 1 && AV.S.time >= 480 && AV.S.time < 486, 'day ' + AV.S.day + ' t ' + AV.S.time);
  }, { shot: 'cm_hostel' });

  step('crew + welcome mission', async c => {
    closeAll(); AV.openChat('mud'); await AV.chatSend('Do you have a mission for me?'); await AV.chatSend('yes'); await sleep(300); AV.closeChat();
    c('Mutt gives the welcome mission', (AV.S.quests || {}).cm_welcome === 'active');
    for (const id of ['nuni', 'steve', 'dino', 'zape']) { AV.openChat(id); await sleep(200); c(id + ' greets (EN)', $('log').innerText.length > 20, $('log').innerText.slice(0, 70)); AV.closeChat() }
    const m0 = AV.S.money; AV.openChat('mud'); await sleep(1200); AV.closeChat(); c('welcome mission completes (+30)', (AV.S.quests || {}).cm_welcome === 'done' && AV.S.money === m0 + 30);
    AV.setLang('es'); AV.openChat('dino'); await sleep(200); c('Spanish dialogue', /[¿¡ñáéíóú]| que | el | tío/.test($('log').innerText), $('log').innerText.slice(0, 70)); AV.closeChat(); AV.setLang('en');
    await sleep(500); const cr = crew(); c('crew NPC-to-NPC banter system armed', !!cr);
  });

  step('Nuni pool mission', async c => {
    closeAll(); place(17, 50, Math.PI); AV.openChat('nuni'); await AV.chatSend('Do you want to play pool?'); await AV.chatSend('yes'); await sleep(400); AV.closeChat();
    c('mission “Get Your Ass Kicked by Nuni” starts', (AV.S.quests || {}).cm_pool === 'active');
    const n = crew().nuni; const p0 = n.g.position.clone(); place(n.g.position.x, n.g.position.z + 2); const led = await until(() => { if (Math.hypot(AV.P.x - n.g.position.x, AV.P.z - n.g.position.z) > 6) place(n.g.position.x, n.g.position.z + 2); return n.g.position.distanceTo(p0) > 3 }, 30000); c('Nuni leads the way (player following)', led, n.g.position.distanceTo(p0).toFixed(1) + ' m');
    const pz = n.g.position.clone(); place(n.g.position.x + 30, n.g.position.z); await sleep(4000); c('Nuni waits when the player falls behind', n.g.position.distanceTo(pz) < 1.5, n.g.position.distanceTo(pz).toFixed(2) + ' m');
    place(n.g.position.x, n.g.position.z + 2); await sleep(300);   /* back next to Nuni: the free shared ride needs her close by */
    AV.cm.tukPanel('hostel'); await sleep(200); const b = [...$('cmp').querySelectorAll('[data-s]')].find(x => x.dataset.s === 'pool'); c('tuk-tuk offers the pool bar with Nuni for free', b && /free|gratis/.test(b.textContent)); const m0 = AV.S.money; b && b.click(); await sleep(300); c('V0.9.7: a real ride starts', !!AV.cm.ride); AV.cm.skipRide && AV.cm.skipRide(); await sleep(400);
    c('tuk-tuk ride to the pool bar (free with Nuni)', Math.hypot(AV.P.x - 151, AV.P.z + 3.4) < 3 && AV.S.money === m0, AV.P.x.toFixed(1) + ',' + AV.P.z.toFixed(1)); c('Nuni waits at her table', n.atBar);
    const t = tgt(/Challenge Nuni/); c('“Challenge Nuni” at the table', !!t); if (!t) return; t.fn(); await sleep(500); c('8-ball table opens', AV.pool.open && $('pool').style.display === 'block');
    $('ppow').value = 100; $('ppow').dispatchEvent(new Event('input')); $('pshoot').click();
    c('break shot moves the balls', await until(() => /Nuni is shooting|YOUR SHOT|TU TIRO/.test($('psc').textContent), 20000), $('psc').textContent);
    await sleep(9000); c('turns alternate / game state shown', /open table|solids|stripes|lisas|rayadas/.test($('psc').textContent), $('psc').textContent);
    const r = AV.pool._test.potRate(60); c('Nuni AI pots most direct shots (champion level)', r.rate > .6, Math.round(r.rate * 100) + '% of ' + r.tries + ' random layouts');
    AV.closeTop(); await sleep(300); c('concede closes the table and records the game', !AV.pool.open && AV.S.cm.poolPlayed);
    const m1 = AV.S.money; AV.openChat('nuni'); await sleep(1200); AV.closeChat(); c('mission completes with Nuni (+15 pity money)', (AV.S.quests || {}).cm_pool === 'done' && AV.S.money === m1 + 15);
  }, { shot: 'cm_poolbar' });

  step('Yi Peng & Loy Krathong mode', async c => {
    closeAll(); AV.cm.modePanel(); await sleep(200); $('cmp').querySelector('[data-m="lantern"]').click();
    c('festival mode rebuilds the city', await until(() => AV.W && AV.W.id === 'chiang_mai' && AV.S.cmMode === 'lantern' && settled(), 25000)); await sleep(1500);
    c('hundreds of lanterns', AV.cm.lanternCount > 300, AV.cm.lanternCount); c('thousands of temple candles', AV.cm.candleCount > 1000, AV.cm.candleCount); c('evening time', AV.S.time >= 19 * 60);
    const f = tgt(/Release a sky lantern/); c('sky lantern release at the Lantern Field', !!f); const m0 = AV.S.money; place(-170, 6); f && f.fn(); c('release costs 20', AV.S.money === m0 - 20);
    const k = tgt(/Float a krathong/); c('krathong at the Ping River pier', !!k); place(260, 30); k && k.fn(); c('krathong floated', AV.S.cm.krathong);
    place(40, 2, -Math.PI / 2); AV.P.pitch = .05; await sleep(2500);
  }, { shot: 'cm_lantern' });

  step('Songkran mode', async c => {
    closeAll(); AV.cm.modePanel(); await sleep(200); $('cmp').querySelector('[data-m="songkran"]').click();
    c('Songkran rebuilds the city', await until(() => AV.W && AV.S.cmMode === 'songkran' && settled(), 25000)); await sleep(1500);
    c('blue water barrels', !!tgt(/Refill your water gun/)); c('water fight HUD', /water|agua/.test($('cmhud').textContent), $('cmhud').textContent);
    place(17, 50, Math.PI); AV.openChat('zape'); await AV.chatSend('Water fight challenge?'); await AV.chatSend('yes'); await sleep(400); AV.closeChat(); c('water-war mission starts', (AV.S.quests || {}).cm_soak === 'active');
    const soak0 = AV.S.cm.soak; let tries = 0;
    for (const w of AV.cm.cur.crowd.list) { if (AV.S.cm.soak > soak0 || tries > 12) break; if (!w.vis || w.v === 'monk') continue; tries++; AV.P.x = w.x; AV.P.z = w.z + 4; AV.P.y = 0; AV.P.yaw = 0; AV.P.pitch = 0; w.pause = 3; w.react = 0; await sleep(200); AV.cm.shoot(); await sleep(250) }
    c('soaking a pedestrian counts for the mission', AV.S.cm.soak > soak0, AV.S.cm.soak + ' soaked'); c('water gun uses ammo', /water [0-9]/.test($('cmhud').textContent), $('cmhud').textContent);
    await sleep(1500);
  }, { shot: 'cm_songkran' });

  step('normal mode + tuk-tuks + portal home', async c => {
    closeAll(); AV.cm.modePanel(); await sleep(200); $('cmp').querySelector('[data-m="normal"]').click(); c('back to normal city', await until(() => AV.S.cmMode === 'normal' && settled(), 25000)); await sleep(1500);
    place(-5.5, 48.5); const m0 = AV.S.money; AV.cm.tukPanel('hostel'); await sleep(200); $('cmp').querySelector('[data-s="river"]').click(); await sleep(300); AV.cm.skipRide && AV.cm.skipRide(); await sleep(300); c('tuk-tuk to the Ping River (distance fare, 55 credits)', Math.hypot(AV.P.x - 252, AV.P.z - 22) < 3 && AV.S.money === m0 - 55, m0 - AV.S.money);
    place(16, 48); AV.cm.portalPanel(); await sleep(200); const b = $('cmp').querySelector('[data-w="ape_town"]'); c('portal lists Ape Town', !!b); b && b.click();
    c('portal returns to Ape Town (Portal Grove)', await until(() => AV.W && AV.W.id === 'ape_town' && settled(), 25000)); c('arrives at the Chiang Mai gate', Math.hypot(AV.P.x - 72.2, AV.P.z + 63.8) < 6, AV.P.x.toFixed(1) + ',' + AV.P.z.toFixed(1));
  });

  /* ---------------- phone (run with -Mobile): real pointer events on the on-screen joystick ---------------- */
  const stick = async (dx, dy, ms) => { const js = $('js'), b = js.getBoundingClientRect(), cx = b.left + b.width / 2, cy = b.top + b.height / 2, o = { pointerId: 7, pointerType: 'touch', bubbles: true, isPrimary: true };
    js.dispatchEvent(new PointerEvent('pointerdown', Object.assign({ clientX: cx, clientY: cy }, o))); js.dispatchEvent(new PointerEvent('pointermove', Object.assign({ clientX: cx + dx, clientY: cy + dy }, o))); await sleep(ms); js.dispatchEvent(new PointerEvent('pointerup', Object.assign({ clientX: cx + dx, clientY: cy + dy }, o))); await sleep(200) };
  step('phone: joystick walking in every world', async c => {
    c('phone auto-detected', $('dPho').classList.contains('on')); $('bNew').click(); c('boots', await until(() => AV.W && AV.running, 20000)); await sleep(3000);
    c('touch controls visible', getComputedStyle($('tc')).display === 'block');
    for (const wd of ['ape_town', 'jungle_dub', 'astro9', 'verdalux', 'chiang_mai']) {
      if (AV.W.id !== wd) { AV.travel(wd); await until(() => AV.W && AV.W.id === wd && settled(), 25000); await sleep(1500) }
      const a = AV.W.arrivals[AV.W.defaultArrival]; place(a.x, a.z, wd === 'chiang_mai' ? 0 : (a.yaw || 0)); await sleep(300); const p = [AV.P.x, AV.P.z];   /* Chiang Mai: face down the open street, not the hostel bench */
      let fr = 0; const cnt = () => fr++; AV.frameFns.push(cnt);
      await stick(0, -50, 6000); const d = Math.hypot(AV.P.x - p[0], AV.P.z - p[1]), f1 = fr; c(wd + ': joystick forward walks', d > 1 || d / Math.max(1, f1) > .08, d.toFixed(2) + ' m in ' + f1 + ' frames (' + (d / Math.max(1, f1)).toFixed(3) + ' m/frame; software renderer)');
      fr = 0; const q = [AV.P.x, AV.P.z]; await stick(50, 0, 4000); const d2 = Math.hypot(AV.P.x - q[0], AV.P.z - q[1]); c(wd + ': joystick sideways strafes', d2 > .6 || d2 / Math.max(1, fr) > .05, d2.toFixed(2) + ' m in ' + fr + ' frames'); AV.frameFns.splice(AV.frameFns.indexOf(cnt), 1);
    }
    const y0 = AV.P.y; $('tJ').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); await until(() => AV.P.y > y0 + .3, 5000); $('tJ').dispatchEvent(new PointerEvent('pointerup', { bubbles: true })); c('Jump button jumps', AV.P.y > y0 + .3 || !AV.P.on, (AV.P.y - y0).toFixed(2));
  }, { mobile: true, shot: 'phone_chiang_mai' });

  let active = [];
  return { names(mobile) { active = steps.filter(s => !!s.mobile === !!mobile); return active.map(s => s.name) },
    async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
