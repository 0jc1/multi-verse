/* The Wandering Market: NPC state machines (node tools/tests/run_cdp.mjs tools/tests/suite_workers.js [--only regex]) */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  /* fast-forward: step the world's update functions (NPCs, brains, site) without rendering; software GL runs at ~3 FPS and the
     main loop clamps dt to 0.05 s, so real time alone would take minutes per delivery */
  const sim = n => { const W = AV.W, t = AV.now(); if (W) for (let i = 0; i < n; i++) for (const f of W.upd) f(.05, t) };
  const until = async (cond, max, fast) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } if (fast !== 0) sim(fast || 20); await sleep(60) } return false };
  const $ = id => document.getElementById(id);
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const travel = async id => { AV.travel(id); return until(() => AV.W && AV.W.id === id && settled(), 120000) };
  const site = () => AV.workers.site(), B = id => AV.npc.brains().find(b => b.id === id);
  const pos = b => b.n.g.position;
  /* stand somewhere and look at a point (yaw: forward is (-sin, -cos)) */
  const standAt = (x, z, lx, lz) => { const P = AV.P; P.x = x; P.z = z; P.y = AV.W.surface(x, z) || 0; P.vx = P.vz = P.vy = 0; P.yaw = Math.atan2(-(lx - x), -(lz - z)); P.pitch = -.12 };
  const away = () => { const c = site().c; standAt(c.x + 10, c.z + 10, c.x, c.z) };   // close enough to watch, far enough not to block anyone
  const states = () => AV.npc.brains().map(b => b.id + ':' + b.fsm.state).join(' ');
  const day = () => { AV.S.time = 10 * 60 };

  step('boot + market built in Ape Town', async c => {
    $('gq').value = 'Medium'; $('bNew').click();
    c('game starts', await until(() => AV.W && AV.running, 60000)); await until(settled, 30000); await sleep(1500);
    AV.save = () => { }; day();
    const S = site(); c('market site built', !!S, S ? 'centre ' + S.c.x.toFixed(1) + ',' + S.c.z.toFixed(1) + ' in ' + AV.W.id : 'none');
    c('six workers with brains', AV.npc.brains().length === 6, AV.npc.brains().map(b => b.id + '/' + b.role).join(' '));
    c('workers can be talked to', ['mae', 'dash', 'fern', 'tam', 'bix', 'melo'].every(id => AV.W.T.some(t => t.npc && t.npc.id === id)));
    await sleep(2500);
    c('every machine is running', AV.npc.brains().every(b => b.fsm.state && b.fsm.state !== 'decide'), states());
    c('status lines drawn', AV.npc.brains().every(b => b.statusKey), AV.npc.brains().map(b => b.statusIcon + b.statusLine[0]).join(' | '));
    away();
  });

  step('market overview', async c => { const S = site(); standAt(S.c.x + 9, S.c.z + 9, S.c.x, S.c.z); AV.P.pitch = -.3; await sleep(4000); c('rendered', true, states()) }, { shot: 'workers_overview' });

  step('vendor orders -> courier fetches + delivers -> vendor restocks', async c => {
    away(); const S = site(), mae = B('mae'), dash = B('dash');
    await until(() => dash.fsm.is('wait', 'restack') && mae.fsm.is('tend'), 60000);
    S.stall.stock = 2;
    c('Mae posts an order', await until(() => !!S.order, 20000), mae.fsm.log.slice(0, 3).map(l => l.from + '→' + l.to).join(' '));
    c('Dash takes it', await until(() => S.order && S.order.taken === dash, 20000), dash.fsm.state);
    c('Dash carries a crate', await until(() => dash.mem.crate && dash.props.crate && dash.props.crate.visible, 90000), dash.fsm.state + ' ' + JSON.stringify(dash.fsm.data.label || ''));
    const d0 = dash.stats.deliveries || 0;
    c('crate delivered', await until(() => (dash.stats.deliveries || 0) > d0, 120000), dash.fsm.state);
    c('Mae restocks', await until(() => S.stall.stock >= 9 && !S.order, 30000), 'stock ' + S.stall.stock + ' · ' + mae.fsm.state);
  });

  step('gardener waters the thirstiest plant, refills when empty', async c => {
    away(); const S = site(), fern = B('fern'), dry = S.plants[0];
    S.plants.forEach(p => p.water = .95); dry.water = .15; fern.mem.can = .1;
    const w0 = fern.stats.watered || 0, r0 = fern.stats.refills || 0;
    c('refills the can first', await until(() => (fern.stats.refills || 0) > r0, 90000), fern.fsm.state);
    c('waters the dry plant', await until(() => (fern.stats.watered || 0) > w0 && dry.water > .9, 90000), fern.fsm.state + ' water ' + dry.water.toFixed(2));
  });

  step('sweeper sweeps up litter and empties the bag', async c => {
    away(); const S = site(), tam = B('tam');
    S.litter.forEach(l => S.clearLitter(l)); tam.mem.bag = 3;
    const p = S.randomSpot(); S.drop(p.x, p.z); const l = S.litter.find(k => k.on);
    c('litter placed', !!l);
    const s0 = tam.stats.swept || 0, b0 = tam.stats.bags || 0;
    c('swept it', await until(() => (tam.stats.swept || 0) > s0 && !l.on, 90000), tam.fsm.state);
    c('full bag emptied in the bin', await until(() => (tam.stats.bags || 0) > b0 && tam.mem.bag === 0, 60000), tam.fsm.state);
  });

  step('busker plays; tipping makes him bow', async c => {
    const S = site(), melo = B('melo');
    c('Melo is busking at his spot', await until(() => melo.fsm.state === 'busk' && melo.fsm.data.at, 120000), melo.fsm.state);
    const h = S.busk.hatW; standAt(h.x + Math.sin(S.busk.yaw) * 1, h.z + Math.cos(S.busk.yaw) * 1, h.x, h.z);
    const T = AV.W.T.find(t => t.label && typeof t.label === 'function' && /Tip Melo/.test(t.label()));
    c('tip target shown', T && T.show(), T ? T.label() : 'missing');
    AV.S.money = Math.max(AV.S.money, 10); const m0 = AV.S.money, k0 = S.busk.coins;
    T.fn(); c('2 credits paid, coin in the hat', AV.S.money === m0 - 2 && S.busk.coins === k0 + 1, AV.S.money + ' / ' + S.busk.coins);
    c('Melo bows', await until(() => melo.fsm.state === 'bow', 3000), melo.fsm.state);
    c('back to busking', await until(() => melo.fsm.state === 'busk', 5000), melo.fsm.state);
    await sleep(800);
  }, { shot: 'workers_busker' });

  step('chatting pauses the machine; answers come from live state', async c => {
    const tam = B('tam'); standAt(pos(tam).x + 2, pos(tam).z + 2, pos(tam).x, pos(tam).z);
    AV.openChat('tam'); c('chat opened', AV.chat.open && AV.chat.who === 'tam');
    const s0 = tam.fsm.state, t0 = tam.fsm.t; await sleep(2500);
    c('machine paused while talking', tam.fsm.state === s0 && tam.fsm.t === t0, s0);
    const r = AV.dlg.offline('tam', 'how is it going?').reply; c('report uses real numbers', /\d+ bits of litter swept/.test(r), r);
    const d = AV.dlg.offline('tam', 'what are you doing?').reply; c('"what are you doing" reads the state', /^Right now\?/.test(d), d);
    AV.closeChat(); await sleep(600);
    c('resumes after the chat', tam.fsm.t > t0 || tam.fsm.state !== s0);
  });

  step('punch the courier mid-delivery: drops crate, guard chases you, courier recovers it', async c => {
    away(); const S = site(), dash = B('dash'), bix = B('bix');
    await until(() => dash.fsm.is('wait', 'restack'), 60000);
    S.stall.stock = 2;
    c('Dash is carrying', await until(() => dash.mem.crate && dash.fsm.state === 'walk', 120000), dash.fsm.state);
    const g = pos(dash), a = dash.n.g.rotation.y; standAt(g.x + Math.sin(a) * 1.1, g.z + Math.cos(a) * 1.1, g.x, g.z);
    await sleep(400); AV.punch.punch();
    c('knocked down', await until(() => dash.n.ko, 3000));
    c('crate dropped on the ground', await until(() => !!dash.mem.dropped, 3000));
    c('Dash gets up rattled', await until(() => dash.fsm.state === 'rattled', 15000), dash.fsm.state);
    c('Bix gives chase', await until(() => bix.fsm.is('pursue', 'scold'), 8000), bix.fsm.state);
    c('Bix catches up and scolds you', await until(() => bix.fsm.state === 'scold', 90000), bix.fsm.state + ' dist ' + bix.dist.toFixed(1));
    c('then keeps an eye on you', await until(() => bix.fsm.state === 'watch', 10000), bix.fsm.state);
    away();
    c('Dash goes back for the crate', await until(() => (dash.stats.recovered || 0) > 0, 90000), dash.fsm.state);
    const d0 = dash.stats.deliveries || 0;
    c('and still delivers it', await until(() => (dash.stats.deliveries || 0) > d0, 120000), dash.fsm.state);
  });

  step('sprinting past the guard gets a warning', async c => {
    const bix = B('bix'); await until(() => bix.fsm.is('patrol', 'lookout', 'walk'), 60000);
    bix.mem.warnAt = 0; const g = pos(bix), w0 = bix.stats.warnings || 0;
    standAt(g.x + 7, g.z, g.x, g.z); AV.P.yaw = Math.PI / 2;   // facing -x? sprint across in front of him
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'ShiftLeft', key: 'Shift', bubbles: true }));
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW', key: 'w', bubbles: true }));
    const ok = await until(() => (bix.stats.warnings || 0) > w0, 15000, 0);
    document.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW', key: 'w', bubbles: true }));
    document.dispatchEvent(new KeyboardEvent('keyup', { code: 'ShiftLeft', key: 'Shift', bubbles: true }));
    c('Bix warns you', ok, bix.fsm.state + ' speed ' + (AV.npc.playerSpeed || 0).toFixed(1));
  });

  step('bedtime: the crew sleeps by the campfire (Bix takes the night shift)', async c => {
    AV.S.time = 30; const S = site(), crew = AV.npc.brains().filter(b => b.id !== 'bix');   // 00:30: everyone's bedtime has started (Melo's is 23:30)
    c('everyone but Bix goes to sleep', await until(() => crew.every(b => b.fsm.state === 'sleep' || (b.fsm.state === 'walk' && b.fsm.data.pri === 5)), 20000), states());
    const why = () => crew.filter(b => !(b.fsm.state === 'sleep' && b.fsm.data.at)).map(b => b.id + ':' + b.fsm.state + (b.mem.seat ? ' seat ' + Math.hypot(b.mem.seat.x - pos(b).x, b.mem.seat.z - pos(b).z).toFixed(1) + 'm' : ' no seat') + ' ' + b.fsm.log.slice(0, 4).map(l => l.to + '(' + l.why + ')').join('<')).join(' | ');
    c('they reach their seats', await until(() => crew.every(b => b.fsm.state === 'sleep' && b.fsm.data.at), 60000), why());
    c('Bix is still up', B('bix').fsm.state !== 'sleep', B('bix').fsm.state);
    standAt(S.camp.x + 6, S.camp.z + 6, S.camp.x, S.camp.z); AV.P.pitch = -.25; await sleep(3000);
  }, { shot: 'workers_night' });

  step('morning: everyone wakes up and goes back to work', async c => {
    AV.S.time = 7.6 * 60; away();
    c('nobody asleep', await until(() => AV.npc.brains().every(b => b.fsm.state !== 'sleep'), 20000), states());
    c('back at work', await until(() => B('mae').fsm.is('tend', 'hawk', 'serve', 'order', 'restock', 'snack', 'walk'), 30000), states());
  });

  step('needs: tired -> rest, hungry -> buys fruit, lonely -> chats with a crewmate', async c => {
    day(); away(); const S = site(), tam = B('tam'), fern = B('fern'), dash = B('dash');
    tam.needs.energy = .1; c('tired Tam sits down', await until(() => tam.fsm.state === 'rest' && tam.fsm.data.at, 90000), tam.fsm.state);
    const sold = B('mae').stats.sold || 0; S.stall.stock = 12; fern.needs.hunger = .95;
    c('hungry Fern buys a mango', await until(() => fern.fsm.state === 'eat' && fern.fsm.data.at && (B('mae').stats.sold || 0) > sold, 90000), fern.fsm.state);
    dash.needs.social = .95; AV.npc.brains().forEach(b => { if (b !== dash) b.needs.social = .5 });
    c('lonely Dash starts a chat', await until(() => dash.fsm.state === 'chatWith' || (dash.stats.chats || 0) > 0, 90000), dash.fsm.state + ' → ' + (dash.mem.talkTo ? dash.mem.talkTo.id : '-'));
    c('the chat finishes', await until(() => (dash.stats.chats || 0) > 0, 60000), states());
  });

  step('other worlds: market (or graceful skip) + clean world switches', async c => {
    for (const id of ['verdalux', 'jungle_dub', 'ape_town']) {
      c(id + ' entered', await travel(id)); await sleep(3000);
      const S = site(); c(id + ': market ' + (S ? 'built' : 'skipped (no room)'), !S || AV.npc.brains().length >= 4, S ? AV.npc.brains().length + ' workers · ' + states() : '');
    }
    console.log(JSON.stringify(AV.npc.debug().map(r => [r.npc, r.state, r.stats])));
  });

  return { steps };
})();
