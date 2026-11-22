/* Apeverse in-page test suite, driven by tools/tests/run_tests.ps1 (Chrome DevTools protocol, no Node needed).
   Steps look things up by their interaction LABELS (not coordinates) so they survive world redesigns. */
window.APE_T = (() => {
  const steps = [];
  const step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const $ = id => document.getElementById(id);
  const lab = t => typeof t.label === 'function' ? t.label() : t.label;
  const tgt = re => AV.W && AV.W.T.find(t => (!t.show || t.show()) && re.test(lab(t)));
  const tgts = re => AV.W ? AV.W.T.filter(t => re.test(lab(t))) : [];
  const place = (x, z, yaw) => { const W = AV.W, s = AV.safeSpot(W, x, z); AV.P.x = s[0]; AV.P.z = s[1]; AV.P.y = W.surface(s[0], s[1]) || 0; AV.P.vx = AV.P.vy = AV.P.vz = 0; if (yaw != null) AV.P.yaw = yaw };
  const goTo = async t => { place(t.x, t.z); await until(() => AV.nearTarget() === t, 6000); return AV.nearTarget() };
  const look = (x, z, pitch) => { AV.P.yaw = Math.atan2(-(x - AV.P.x), -(z - AV.P.z)); AV.P.pitch = pitch || 0 };
  const hold = async (k, ms) => { AV.keys[k] = 1; await sleep(ms); AV.keys[k] = 0 };
  const travel = async (id, arr) => { AV.travel(id, arr); return until(() => AV.W && AV.W.id === id && document.getElementById('fade').style.opacity === '0', 30000) };   /* V0.9.8: bigger worlds compile more shaders in headless SwiftShader */
  const closeAll = () => { let n = 0; while (AV.modals.length && n++ < 10) AV.closeTop() };

  /* ---------------- boot ---------------- */
  step('boot', async c => {
    c('start screen visible', getComputedStyle($('start')).display !== 'none');
    c('Continue disabled without a save', $('bCont').disabled);
    $('lEs').click(); c('Spanish start labels', $('bNew').textContent === 'Nueva partida'); $('lEn').click();
    $('gq').value = 'Low'; $('bNew').click();   /* functional tests run on Low: software rendering in CI is slow; quality does not change behaviour */
    c('Ape Town loads', await until(() => AV.W && AV.W.id === 'ape_town' && AV.running, 15000));
    if (AV.assets && AV.assets.ready) await AV.assets.ready(20000); await sleep(5000);   /* warm-up: models parse + shaders compile once */
    const info = AV.R.info.render; c('renders frames', info.calls > 20, 'draw calls ' + info.calls + ', tris ' + info.triangles);
  }, { shot: 'ape_town_arrival' });

  step('controls', async c => {
    const W = AV.W, a = W.arrivals[W.defaultArrival]; place(a.x, a.z, a.yaw || 0); await sleep(200);
    const x0 = AV.P.x, z0 = AV.P.z; AV.keys.KeyW = 1; await until(() => Math.hypot(AV.P.x - x0, AV.P.z - z0) > 1.5, 25000); AV.keys.KeyW = 0; c('W moves forward', Math.hypot(AV.P.x - x0, AV.P.z - z0) > 1.5, Math.hypot(AV.P.x - x0, AV.P.z - z0).toFixed(2));
    await sleep(600); const y0 = AV.P.y; let top = y0; AV.keys.Space = 1; const t0 = Date.now(); while (Date.now() - t0 < 4000 && top < y0 + .15) { await sleep(40); top = Math.max(top, AV.P.y) } AV.keys.Space = 0; c('Space jumps', top > y0 + .15, (top - y0).toFixed(2)); await sleep(1500);
    const p0 = [AV.P.x, AV.P.z]; AV.keys.KeyD = 1; await until(() => Math.hypot(AV.P.x - p0[0], AV.P.z - p0[1]) > .8, 25000); AV.keys.KeyD = 0; c('D strafes', Math.hypot(AV.P.x - p0[0], AV.P.z - p0[1]) > .8);
  });

  step('ape_town: Zil chat + job', async c => {
    const t = tgt(/Talk to Zil/); c('Zil target exists', !!t); if (!t) return;
    const n = await goTo(t); c('prompt appears near Zil', n && /Zil/.test(lab(n)) && $('prompt').style.display === 'block');
    AV.interact(); c('chat opens as modal', $('chat').style.display === 'block' && AV.blocking());
    await AV.chatSend('Do you have a job for me?'); await AV.chatSend('yes');
    c('job accepted through dialogue', AV.S.job === true);
    c('chat log has replies', $('log').children.length >= 4, $('log').children.length);
    AV.closeChat(); c('Esc/close unblocks input', !AV.blocking());
  }, { shot: 'zil_cafe' });

  step('ape_town: café shift economy', async c => {
    const t = tgt(/Start a shift/); c('shift target exists', !!t); if (!t) return;
    const m0 = AV.S.money; t.fn();
    for (let i = 0; i < 5; i++) { await sleep(60); const txt = $('toast').textContent, d = ['Nebula Fizz', 'Cosmic Cola', 'Mushroom Mocha'].findIndex(n => txt.indexOf(n) >= 0); AV.pour(d) }
    c('5 drinks served, credits increased by 100', AV.S.money === m0 + 100, (AV.S.money - m0));
  });

  step('ape_town: band + stage', async c => {
    const t = tgt(/Tip the band/); c('stage tip target exists', !!t); if (!t) return;
    await goTo(t);
    c('concert panel near stage', await until(() => $('concert').style.display === 'block', 5000));
    const m0 = AV.S.money; t.fn(); c('tip costs 5', AV.S.money === m0 - 5);
    if (AV.W.stage) look(AV.W.stage.pos.x, AV.W.stage.pos.z, .05);
    await sleep(600);
  }, { shot: 'stage' });

  step('ape_town: living paintings', async c => {
    const M = AV.media, present = M.frames.filter(f => f.state !== 'missing'), missing = M.frames.filter(f => f.state === 'missing');
    c('8 present frames + missing plaques', present.length === 8 && missing.length >= 7, present.length + ' present / ' + missing.length + ' missing');
    const f = present[0]; place(f.x, f.z); look(f.g.position.x, f.g.position.z, .1);
    c('in-frame video goes live near a painting (http)', await until(() => M.liveCount() >= 1, 25000), M.liveCount());
    await sleep(800);
  }, { shot: 'gallery' });

  step('ape_town: viewer + cinema', async c => {
    const M = AV.media, p = AV.MEDIA_DATA.placements.find(p => p.status === 'present');
    M.openViewer(p); c('viewer opens as modal', $('viewer').style.display === 'block' && AV.blocking());
    c('viewer video decodes', await until(() => $('vv') && $('vv').readyState >= 2, 9000));
    M.closeViewer(); c('viewer closes', $('viewer').style.display === 'none' && !AV.blocking());
    const t = tgt(/cinema/i); c('cinema target exists', !!t); if (!t) return;
    await goTo(t); t.fn(); c('cinema panel/playback opens', await until(() => $('cinema').style.display === 'block' || (M.screens && M.screens.some(s => s.playing)), 4000));
    closeAll(); c('cinema closes', !AV.blocking());
  });

  /* ---------------- V0.9.1 additions ---------------- */
  step('v0.9.1 visuals: sky dome, instanced flora, signs, NPC tags', async c => {
    c('sky dome in scene', AV.kit && AV.kit.dome && AV.kit.dome.parent === AV.scene);
    let inst = 0, sprites = 0; AV.W.group.traverse(o => { if (o.isInstancedMesh) inst++; if (o.isSprite) sprites++ });
    c('instanced flora present', inst >= 5, inst + ' instanced meshes');
    c('NPCs have floating name tags', (AV.W.ctx.npcList || []).length >= 2 && (AV.W.ctx.npcList || []).every(n => n.tag), (AV.W.ctx.npcList || []).length + ' npcs');
    const W = AV.W, a = W.arrivals[W.defaultArrival]; place(a.x, a.z, a.yaw || 0); AV.P.pitch = .12; await sleep(900);
  }, { shot: 'v091_arrival' });

  step('v0.9.1 cinema screen autoplay + positional sound', async c => {
    const M = AV.media, s = M.screens[0]; c('cinema screen registered', !!s); if (!s) return;
    place(s.x + s.nx * 14, s.z + s.nz * 14); look(s.x, s.z, .12);
    c('big screen plays automatically when you approach', await until(() => s.playing, 12000), s.state + ' ' + (s.list[s.idx] || {}).t);
    c('screen sound routed through a positional panner (unmuted)', !!s.au && s.video && !s.video.muted);
    c('screen shows the video texture', s.mat.map === s.vtex);
    await sleep(1500);
  }, { shot: 'cinema_screen' });
  step('v0.9.1 cinema screen sleeps far away', async c => {
    const s = AV.media.screens[0]; place(s.x + s.nx * 70, s.z + s.nz * 70); c('screen stops when you walk away', await until(() => !s.video, 15000));
  });

  step('v0.9.1 painting proximity sound', async c => {
    const M = AV.media, f = M.frames.find(f => f.state !== 'missing'); place(f.fx + f.nx * 2.5, f.fz + f.nz * 2.5); look(f.fx, f.fz, .05);
    c('painting goes live with its own audio node', await until(() => f.live && !!f.au, 25000));
    c('nearest faced painting is the audible one', await until(() => f.au && f.au.g.gain.value > .05, 10000), f.au && f.au.g.gain.value.toFixed(2));
  }, { shot: 'painting_close' });

  step('v0.9.1 NPC dialogue: variety, memory, context', async c => {
    closeAll(); tgt(/Tip the band/).fn(); const t = tgt(/Talk to Zil/); await goTo(t); t.fn(); await until(() => AV.chat.open, 2000);
    c('contextual greeting mentions the band tip', /band|banda|gorilla|gorila/i.test($('log').textContent), $('log').textContent.slice(0, 120));
    c('dynamic quick-reply chips', $('chips').children.length >= 3, $('chips').children.length);
    const replies = []; for (let i = 0; i < 3; i++) { await AV.chatSend('tell me about the band'); replies.push($('log').lastChild.textContent) }
    c('same question -> different answers', new Set(replies).size === 3, replies.map(r => r.slice(6, 40)).join(' | '));
    await AV.chatSend('my name is Alex'); c('learns the player name', AV.S.name === 'Alex');
    await AV.chatSend('do you remember me?'); c('remembers the name in conversation', /Alex/.test($('log').lastChild.textContent));
    await AV.chatSend('purple elephants dance on Tuesdays'); c('graceful fallback for unknown input', $('log').lastChild.textContent.length > 10);
    await AV.chatSend('can I do you a favor?'); await AV.chatSend('sure'); c('quest started from dialogue', AV.S.quests && AV.S.quests.bissap_luma === 'active');
    AV.closeChat();
    const k = tgt(/bissap/i); const m0 = AV.S.money; k.fn(); c('kiosk gives a bissap item', AV.S.items.bissap === 1 && AV.S.money === m0 - 6);
    const lu0 = AV.W.ctx.npcList.find(n => n.id === 'luma').g, l = tgt(/Talk to Luma/); place(lu0.position.x - 2.6, lu0.position.z + .4); look(lu0.position.x, lu0.position.z); await sleep(300); l.fn(); await sleep(1200);
    c('quest completes when talking to Luma', AV.S.quests.bissap_luma === 'done' && AV.S.money === m0 - 6 + 12, AV.S.money - m0);
    c('Luma greets with the bissap line', /bissap/i.test($('log').textContent));
    AV.closeChat(); await sleep(1500);
    const lu = AV.W.ctx.npcList.find(n => n.id === 'luma'); c('Luma turns to face the player', Math.abs(Math.atan2(Math.sin(lu.g.rotation.y - Math.atan2(AV.P.x - lu.g.position.x, AV.P.z - lu.g.position.z)), Math.cos(lu.g.rotation.y - Math.atan2(AV.P.x - lu.g.position.x, AV.P.z - lu.g.position.z)))) < .5);
    AV.setLang('es'); AV.openChat('zil'); await AV.chatSend('¿qué hay de nuevo?'); c('Spanish dialogue', /[áéíóúñ¿¡]|Se comenta|Nada nuevo|Dicen/.test($('log').lastChild.textContent), $('log').lastChild.textContent.slice(0, 60)); AV.closeChat(); AV.setLang('en');
  }, { shot: 'npc_luma' });

  step('portal pipe', async c => {
    closeAll(); const W = AV.W, a = W.arrivals[W.defaultArrival]; place(a.x, a.z, a.yaw || 0); await sleep(200);
    AV.keymap.KeyP(); await sleep(400);
    c('Pipe UI opens', $('pipe').style.display === 'block' && AV.blocking());
    await until(() => AV.pipe.puff < 0, 30000); c('smoking animation: exhaled smoke particles', AV.pipe.smokeAlive() > 20, AV.pipe.smokeAlive());
    c('psychedelic selector: places-in-world buttons', $('pipe').querySelectorAll('.pp-place').length >= 4);
    const cards = [...$('pipe').querySelectorAll('[data-w]')], ok = cards.filter(b => !b.getAttribute('aria-disabled'));
    c('lists all registry worlds', cards.length >= 25, cards.length + ' cards, ' + ok.length + ' enterable');
    await sleep(500);
  }, { shot: 'pipe_ui' });

  step('portal pipe: travel to Astro-9', async c => {
    const cards = [...$('pipe').querySelectorAll('[data-w]')];
    const wip = cards.find(b => b.getAttribute('aria-disabled') && b.dataset.w !== AV.W.id); if (wip) { wip.click(); c('unfinished world is not enterable', AV.W.id === 'ape_town' && !AV.pipe.portal) }
    cards.find(b => b.dataset.w === 'astro9').click(); await sleep(300);
    c('Pipe closes after choosing', $('pipe').style.display === 'none');
    const p = AV.pipe.portal; c('portal spawned on free ground', !!p && AV.isFree(AV.W, p.x, p.z, 1), p && (p.x.toFixed(1) + ',' + p.z.toFixed(1)));
    await sleep(900);
  }, { shot: 'portal_open' });

  step('portal forms', async c => {
    const p = AV.pipe.portal; c('portal exists', !!p); await sleep(1400);
    c('portal finished forming out of the smoke', p && p.mat.uniforms.form.value > .95);
  }, { shot: 'portal_formed' });

  step('astro9', async c => {
    const p = AV.pipe.portal; if (p) { AV.P.x = p.x; AV.P.z = p.z }
    c('walking into the portal travels to Astro-9', await until(() => AV.W && AV.W.id === 'astro9', 15000));
    await until(() => $('fade').style.opacity === '0', 3000); await sleep(800);
    c('Astro-9: low gravity zone exists', AV.W.gravityAt && [...Array(40)].some((_, i) => AV.W.gravityAt(Math.cos(i) * i, Math.sin(i) * i) < 1));
    const slot = tgt(/Slot/); if (slot) { const cr = AV.S.money, gp = AV.S.gp; slot.fn(); c('casino uses Gravity Points only', AV.S.money === cr && AV.S.gp !== gp - 0, 'GP ' + AV.S.gp) }
  }, { shot: 'astro9' });

  step('jungle_dub', async c => {
    c('travel to Jungle Dub', await travel('jungle_dub'));
    await sleep(900); c('Bongo can be talked to', !!tgt(/Bongo/));
  }, { shot: 'jungle_dub' });

  step('verdalux (legacy)', async c => {
    c('travel to Verdalux', await travel('verdalux'));
    const d = tgt(/Drum Log/); c('Drum Log exists', !!d); if (!d) return;
    const m0 = AV.S.money; AV.S.drumDay = 0; d.fn(); c('Drum Log pays 12 once per day', AV.S.money === m0 + 12); d.fn(); c('second play same day pays nothing', AV.S.money === m0 + 12);
    await sleep(600);
  }, { shot: 'verdalux' });

  step('return + memory', async c => {
    c('back to Ape Town', await travel('ape_town'));
    /* measure from the same pose after each full cycle (three.js uploads geometry lazily when first seen) */
    const pose = async () => { const a = AV.W.arrivals[AV.W.defaultArrival]; place(a.x, a.z, a.yaw || 0); AV.P.pitch = 0; let last = -1, same = 0; for (let i = 0; i < 80 && same < 8; i++) { await sleep(250); const g = AV.R.info.memory.geometries; same = g === last ? same + 1 : 0; last = g } return [AV.R.info.memory.geometries, AV.R.info.memory.textures] };
    const cyc = async () => { for (const w of ['astro9', 'jungle_dub', 'verdalux', 'ape_town']) await travel(w); return pose() };
    const m0 = await cyc(), m1 = await cyc(), m2 = await cyc();
    c('GPU memory stable across repeated world switches (no growth per cycle)', m2[0] <= m1[0] + 2 && m2[1] <= m1[1] + 2 /* cycle 0 is warm-up: geometry uploads lazily when first drawn */, 'geometries/textures ' + m0 + ' -> ' + m1 + ' -> ' + m2);
    AV.unstuck(); c('unstuck works', AV.isFree(AV.W, AV.P.x, AV.P.z, .3));
  });

  step('settings + save', async c => {
    AV.toggleSettings(); c('settings opens', $('set').style.display === 'block'); $('sEs').click(); c('Spanish HUD', /Créditos/.test($('top').textContent)); AV.toggleSettings(); $('sEn').click(); closeAll();
    AV.save(); let s = null; try { s = JSON.parse(localStorage.getItem('apeverse_v09')) } catch (e) { } c('v0.9 save written (schema v2)', s && s.v === 2);
  });

  step('portal hop to a place in the same world', async c => {
    closeAll(); const W = AV.W, a = W.arrivals[W.defaultArrival]; place(a.x, a.z, a.yaw || 0); await sleep(200);
    AV.keymap.KeyP(); await sleep(500); const b = [...$('pipe').querySelectorAll('.pp-place')].find(b => /cinema|cine/i.test(b.textContent)); c('cinema place listed', !!b); if (!b) return;
    b.click(); await sleep(300); const p = AV.pipe.portal; c('local portal formed', !!p && !!p.place); if (!p) return;
    await sleep(900); AV.P.x = p.x; AV.P.z = p.z; const pl = p.place;
    c('walking in hops to the place (same world, no reload)', await until(() => Math.hypot(AV.P.x - pl.x, AV.P.z - pl.z) < 3 && AV.W === W, 4000));
  });

  /* ---------------- mobile (run with -Mobile) ---------------- */
  step('mobile boot', async c => {
    c('phone auto-detected', $('dPho').classList.contains('on'));
    $('bNew').click(); c('boots', await until(() => AV.W && AV.running, 15000)); if (AV.assets && AV.assets.ready) await AV.assets.ready(20000); await sleep(5000);
    c('touch controls visible', getComputedStyle($('tc')).display === 'block');
    const z0 = AV.P.z; AV.T.y = -1; await until(() => Math.abs(AV.P.z - z0) > 1, 30000); AV.T.y = 0; c('virtual joystick moves player', Math.abs(AV.P.z - z0) > 1, (AV.P.z - z0).toFixed(2));
    $('tP').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); await sleep(400); c('Pipe button opens Portal Pipe', $('pipe').style.display === 'block');
  }, { mobile: true, shot: 'mobile_pipe' });

  let active = [];
  return {
    names(mobile) { active = steps.filter(s => !!s.mobile === !!mobile); return active.map(s => s.name) },
    async exec(i) {
      const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) });
      try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) }
      return { checks, shot: s.shot || null };
    },
    util: { sleep, until, tgt, tgts, place, goTo, look, travel }
  };
})();
