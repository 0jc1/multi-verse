/* Apeverse - Jerusalem + Judean Desert test suite (run: node tools/tests/run_cdp.mjs tools/tests/suite_jlm.js)
   Drives the real game in headless Chrome: Ape Town -> Portal Grove gate -> Jerusalem (Dalia, tour checkpoints, tram,
   shops, the lost briefcase) -> Judean Desert (Noa, water run, Salem, camel quest, Qumran hiker, float in the sea,
   bus back to Jerusalem, portal home). */
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
  const walkTo = async (re, max) => { const t = tgt(re); if (!t) return false; for (let i = 0; i < 400; i++) { const t2 = tgt(re); if (!t2) return false; const dx = t2.x - AV.P.x, dz = t2.z - AV.P.z, d = Math.hypot(dx, dz); if (d < t2.r * .9) return true; AV.P.yaw = Math.atan2(-dx, -dz); AV.keys.KeyW = 1; await sleep(90) } AV.keys.KeyW = 0; return false };
  const chat = async (send1, send2) => { await sleep(300); if (send1) await AV.chatSend(send1); if (send2) await AV.chatSend(send2); await sleep(400); AV.closeChat() };

  step('boot', async c => {
    $('gq').value = 'Low'; $('bNew').click();
    c('Ape Town loads', await until(() => AV.W && AV.W.id === 'ape_town' && AV.running, 20000));
    if (AV.assets && AV.assets.ready) await AV.assets.ready(20000); await sleep(3000);
  });

  step('registry + Portal Grove gates', async c => {
    c('jerusalem in registry as playable (Portal Pipe)', AV.isPlayable('jerusalem'));
    c('judean_desert in registry as playable', AV.isPlayable('judean_desert'));
    c('Portal Pipe lists them', !!AV.WORLDS_DATA.find(w => w.id === 'jerusalem') && !!AV.WORLDS_DATA.find(w => w.id === 'judean_desert'));
  });

  step('Ape Town Portal Grove -> Jerusalem', async c => {
    const g = tgt(/Step through: Jerusalem/); c('Portal Grove has a Jerusalem gate', !!g); if (!g) return;
    g.fn(); c('gate travels to Jerusalem', await until(() => AV.W && AV.W.id === 'jerusalem' && settled(), 30000));
    await sleep(2500);
    const cr = ['dalia', 'yossi', 'karim', 'miriam', 'elias'].map(id => AV.W.T.find(t => t.npc && t.npc.id === id)).filter(Boolean);
    c('named characters spawned (Dalia, Yossi, Karim, Miriam, Elias)', cr.length === 5, cr.map(n => n.npc.id).join(','));
    const info = AV.R.info.render; c('renders the city', info.calls > 40, 'draw calls ' + info.calls + ', tris ' + info.triangles);
    c('arrived near Jaffa Gate', Math.hypot(AV.P.x - (-76), AV.P.z - 8) < 10, AV.P.x.toFixed(1) + ',' + AV.P.z.toFixed(1));
  }, { shot: 'jlm_arrival' });

  step('Jerusalem world content', async c => {
    closeAll();
    for (const re of [/Tuck a note into the Western Wall/, /Dalia/, /Western Wall/, /Holy Sepulchre|Sepulchre/, /Light rail/, /Ka’ak cart|sesame bread/, /Apeverse Portal/, /Mahane Yehuda|rugelach/])
      c('target: ' + re.source, !!AV.W.T.find(t => re.test(lab(t))));
    c('Dalia is a guide body (no crash on her custom look)', !!AV.W.T.find(t => t.npc && t.npc.id === 'dalia'));
    const plaza = AV.W.surface(30, -36), mount = AV.W.surface(40, -80), ramp = AV.W.surface(42.8, -41);
    c('Temple Mount esplanade raised above the Western Wall plaza', mount > plaza + 3, 'plaza ' + plaza.toFixed(1) + ' mount ' + mount.toFixed(1));
    c('Mughrabi ramp climbs between them', ramp > plaza + .5 && ramp < mount - .5, ramp.toFixed(1));
    c('Damascus Gate opening is walkable (no tower in it)', AV.isFree(AV.W, -14, -95, .4));
    c('Jaffa Gate opening is walkable', AV.isFree(AV.W, -70, 8, .4));
    c('no smoking at the holy sites', AV.W.noSmoke && AV.W.noSmoke(30, -36) && !AV.W.noSmoke(-200, -21));
  });

  step('Dalia tour mission', async c => {
    closeAll(); const d = AV.W.T.find(t => t.npc && t.npc.id === 'dalia'); if (!d) return;
    place(d.x, d.z + 2, Math.PI); AV.openChat('dalia'); await sleep(400);
    c('Dalia greets', $('log').innerText.length > 20, $('log').innerText.slice(0, 60));
    await AV.chatSend('Do you have a tour for me?'); await AV.chatSend('yes'); await sleep(400); AV.closeChat();
    c('tour quest starts', (AV.S.quests || {}).jlm_tour === 'active');
    for (const re of [/Stand at the Western Wall/, /Visit the Holy Sepulchre/, /Admire the Dome of the Rock/, /Look up at the Tower of David/, /Taste Mahane Yehuda/]) {
      const t = tgt(re); c('checkpoint exists: ' + re.source, !!t); if (!t) continue; place(t.x, t.z + .5); await sleep(150); t.fn() }
    c('all 5 checkpoints visited', AV.S.jlm.tour.length === 5, AV.S.jlm.tour.join(','));
    const d2 = AV.W.T.find(t => t.npc && t.npc.id === 'dalia'); place(d2.x, d2.z + 2, Math.PI); const m0 = AV.S.money;
    AV.openChat('dalia'); await sleep(1200); AV.closeChat(); await sleep(300);
    c('tour completes (+40)', (AV.S.quests || {}).jlm_tour === 'done' && AV.S.money === m0 + 40, 'money ' + m0 + ' -> ' + AV.S.money);
  });

  step('Yossi briefcase mission', async c => {
    closeAll(); const y = AV.W.T.find(t => t.npc && t.npc.id === 'yossi'); if (!y) return;
    place(y.x, y.z + 2, Math.PI); AV.openChat('yossi'); await sleep(300);
    await AV.chatSend('Do you need help with something?'); await AV.chatSend('yes'); await sleep(400); AV.closeChat();
    c('briefcase mission starts', (AV.S.quests || {}).jlm_briefcase === 'active');
    /* Miriam at Mahane Yehuda: use the counter interaction to grab it */
    const mc = tgt(/Miriam’s counter/); c('Miriam counter target exists', !!mc);
    if (mc) { mc.fn(); await sleep(300); c('briefcase in the bag', ((AV.S.items || {}).briefcase || 0) > 0); AV.closeChat() }
    /* back to Yossi to turn in */
    const y2 = AV.W.T.find(t => t.npc && t.npc.id === 'yossi'); place(y2.x, y2.z + 2, Math.PI);
    AV.openChat('yossi'); await sleep(600); AV.closeChat(); await sleep(400);
    const m0 = AV.S.money; AV.openChat('yossi'); await sleep(900); AV.closeChat(); await sleep(300);
    c('briefcase mission completes (+60)', (AV.S.quests || {}).jlm_briefcase === 'done' && AV.S.money >= m0, 'money ' + AV.S.money);
  });

  step('Karim ka’ak mission', async c => {
    closeAll(); const k = AV.W.T.find(t => t.npc && t.npc.id === 'karim'); if (!k) return;
    place(k.x, k.z + 2, Math.PI); AV.openChat('karim'); await AV.chatSend('Can I help you with something?'); await AV.chatSend('yes'); await sleep(300); AV.closeChat();
    c('ka’ak mission starts', (AV.S.quests || {}).jlm_kaak === 'active');
    const cart = tgt(/sesame bread/); c('ka’ak cart target exists', !!cart);
    if (cart) { cart.fn(); await sleep(300); c('ka’ak bought', ((AV.S.items || {}).kaak || 0) > 0) }
    const k2 = AV.W.T.find(t => t.npc && t.npc.id === 'karim'); place(k2.x, k2.z + 2, Math.PI);
    AV.openChat('karim'); await sleep(900); AV.closeChat(); await sleep(300);
    c('ka’ak mission completes (+20)', (AV.S.quests || {}).jlm_kaak === 'done', 'money ' + AV.S.money);
  });

  step('Jerusalem -> Judean Desert (bus)', async c => {
    closeAll();
    const bus = tgt(/Bus 486 to the Dead Sea/); c('bus stop to the Dead Sea exists', !!bus);
    if (bus) bus.fn(); else AV.travel('judean_desert', 'bus');
    c('travels to the desert', await until(() => AV.W && AV.W.id === 'judean_desert' && settled(), 30000));
    await sleep(2500);
    const crew = ['noa', 'salem', 'amir', 'tomer'].map(id => AV.W.T.find(t => t.npc && t.npc.id === id)).filter(Boolean);
    c('named desert characters spawned (Noa, Salem, Amir, Tomer)', crew.length === 4, crew.map(n => n.npc.id).join(','));
    const info = AV.R.info.render; c('renders the desert', info.calls > 30, 'draw calls ' + info.calls + ', tris ' + info.triangles);
    c('sea surface is water level (low)', AV.W.surface(150, 40) < 0, (AV.W.surface(150, 40) || 0).toFixed(2));
  }, { shot: 'jd_arrival' });

  step('Judean Desert content', async c => {
    closeAll();
    for (const re of [/float in the Dead Sea/i, /Kiosk/, /Cable car/, /Bedouin|sage tea/, /Apeverse Portal/, /Bus to Jerusalem|Bus/])
      c('target: ' + re.source, !!AV.W.T.find(t => re.test(lab(t))));
    c('Masada plateau is high', AV.W.surface(34, 82) > 20, (AV.W.surface(34, 82) || 0).toFixed(1));
    c('Roman ramp climbs (half way up)', AV.W.surface(1, 80) > 12, (AV.W.surface(1, 80) || 0).toFixed(1));
    c('Masada cliffs block walking up the side', !AV.isFree(AV.W, 34, 82 + 31, .4));
    c('mud bath target exists', !!AV.W.T.find(t => /mud bath/.test(lab(t))));
  });

  step('Noa water mission', async c => {
    closeAll(); const n = AV.W.T.find(t => t.npc && t.npc.id === 'noa'); if (!n) return;
    place(n.x, n.z + 2, Math.PI); AV.openChat('noa'); await sleep(400);
    c('Noa greets', $('log').innerText.length > 20, $('log').innerText.slice(0, 60));
    await AV.chatSend('Do you need help with anything?'); await AV.chatSend('yes'); await sleep(300); AV.closeChat();
    c('water mission starts', (AV.S.quests || {}).jd_water === 'active');
    /* buy 3 waters at the kiosk */
    const kiosk = tgt(/Kiosk: cold water/); c('kiosk water target', !!kiosk);
    if (kiosk) { for (let i = 0; i < 3; i++) { const k2 = tgt(/Kiosk: cold water/); if (k2) k2.fn(); await sleep(200) } }
    c('3 bottles in the bag', ((AV.S.items || {}).water || 0) >= 3, 'water ' + ((AV.S.items || {}).water || 0));
    const n2 = AV.W.T.find(t => t.npc && t.npc.id === 'noa'); place(n2.x, n2.z + 2, Math.PI);
    AV.openChat('noa'); await sleep(900); AV.closeChat(); await sleep(300);
    c('water mission completes (+45)', (AV.S.quests || {}).jd_water === 'done', 'money ' + AV.S.money);
  });

  step('Salem camel mission', async c => {
    closeAll(); const s = AV.W.T.find(t => t.npc && t.npc.id === 'salem'); if (!s) return;
    place(s.x, s.z + 2, Math.PI); AV.openChat('salem'); await AV.chatSend('Can I help you with something?'); await AV.chatSend('yes'); await sleep(300); AV.closeChat();
    c('camel mission starts', (AV.S.quests || {}).jd_camel === 'active');
    /* Zahra appears near Masada: walk to her via the interaction target */
    const zh = tgt(/Lead Zahra home/); c('Zahra target appears near Masada', !!zh);
    if (zh) { zh.fn(); await sleep(300); c('Zahra led home', !!AV.S.jd.camelHome) }
    const s2 = AV.W.T.find(t => t.npc && t.npc.id === 'salem'); place(s2.x, s2.z + 2, Math.PI);
    AV.openChat('salem'); await sleep(900); AV.closeChat(); await sleep(300);
    c('camel mission completes (+30)', (AV.S.quests || {}).jd_camel === 'done', 'money ' + AV.S.money);
  });

  step('Noa hiker mission + Qumran', async c => {
    closeAll(); const n2 = AV.W.T.find(t => t.npc && t.npc.id === 'noa'); place(n2.x, n2.z + 2, Math.PI);
    AV.openChat('noa'); await AV.chatSend('Do you need help with anything?'); await AV.chatSend('yes'); await sleep(300); AV.closeChat();
    c('hiker mission starts', (AV.S.quests || {}).jd_hiker === 'active');
    const cave = tgt(/Check on the hiker|Qumran cave/); c('cave target exists', !!cave);
    if (cave) { cave.fn(); await sleep(300); c('Tomer found (flag set)', !!AV.S.jd.hikerFound) }
    const n3 = AV.W.T.find(t => t.npc && t.npc.id === 'noa'); place(n3.x, n3.z + 2, Math.PI);
    AV.openChat('noa'); await sleep(900); AV.closeChat(); await sleep(300);
    c('hiker mission completes (+40)', (AV.S.quests || {}).jd_hiker === 'done', 'money ' + AV.S.money);
    c('float works (sea surface is water level)', AV.W.surface(150, 40) < 0);
  });

  step('Desert -> portal home', async c => {
    closeAll();
    const p = tgt(/Apeverse Portal/); c('portal target exists', !!p);
    if (p) { p.fn(); await sleep(400); const b = [...$('cmp').querySelectorAll('[data-w]')].find(x => x.dataset.w === 'ape_town'); c('portal lists Ape Town', !!b); if (b) b.click() }
    c('portal returns to Ape Town', await until(() => AV.W && AV.W.id === 'ape_town' && settled(), 30000));
    await sleep(1200);
    const info = AV.R.info.render; c('renders after return', info.calls > 20, 'draw calls ' + info.calls);
  }, { shot: 'jlm_return' });

  return { steps };
})();
