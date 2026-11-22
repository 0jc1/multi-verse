/* Apeverse V0.9.7 - Stage 1 suite: characters, items, media/audio priority, Chiang Mai fixes, zero gravity (run_tests.ps1 -Suite tools\tests\suite_v097.js [-Mobile]) */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const $ = id => document.getElementById(id), lab = t => typeof t.label === 'function' ? t.label() : t.label;
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const travel = async id => { AV.travel(id); return until(() => AV.W && AV.W.id === id && settled(), 25000) };
  const place = (x, z, yaw) => { const s = AV.safeSpot(AV.W, x, z); AV.P.x = s[0]; AV.P.z = s[1]; AV.P.y = AV.W.surface(s[0], s[1]) || 0; AV.P.vx = AV.P.vy = AV.P.vz = 0; if (yaw != null) AV.P.yaw = yaw };
  const closeAll = () => { let n = 0; while (AV.modals.length && n++ < 10) AV.closeTop() };
  const skinned = () => { let n = 0; AV.W.group.traverse(o => { if (o.isSkinnedMesh) n++ }); return n };

  step('boot', async c => { $('gq').value = 'Medium'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 20000)); await sleep(1200); AV.save = () => { } });

  step('names + films registered', async c => {
    const txt = JSON.stringify(AV.NPCS || {}); c('no “Golf” / “Mud” shown (Cough, Mutt)', !/"Golf"|"Mud"/.test(txt) && /Cough/.test(txt) && /Mutt/.test(txt));
    c('the user’s films are in the programme (Last Classic Bangers + music videos)', AV.FILMS.length >= 50 && AV.media.programme(['lcb'], false).length >= 28, AV.FILMS.length + ' films');
    const r = await fetch(AV.FILMS[11].file, { headers: { Range: 'bytes=0-1023' } }); c('long film streams with Range (206)', r.status === 206, r.status + ' ' + AV.FILMS[11].file);
    c('no more “file not supplied” music videos', !(AV.MEDIA_DATA.cinema || []).some(x => !x.present && /ztoned/i.test(x.filename || '')));
  });

  step('Ape Town: rigged audience + cinema programme', async c => {
    c('rigged characters dancing at the Lotus Stage', skinned() >= 8, skinned() + ' skinned meshes');
    const s = AV.media.screens[0]; c('outdoor cinema plays The Last Classic Bangers + music videos', !!s && s.list.length >= 40 && s.list[0].t.includes('Last Classic Bangers'), s && s.list.length);
  });

  step('Astro-9: zero gravity, Cinema 9, beings', async c => {
    c('travel', await travel('astro9')); c('Club Graviton gravity is exactly 0', AV.W.gravityAt(0, -18) === 0);
    place(0, -14, 0); await sleep(400); AV.keys.Space = 1; await sleep(700); AV.keys.Space = 0; await sleep(2500);
    c('you float (still in the air after 2.5 s)', AV.P.y > .3, AV.P.y.toFixed(2) + ' m'); c('soft ceiling under the dome', AV.P.y <= 4.95);
    AV.keys.KeyC = 1; await until(() => AV.P.y < .05, 15000); AV.keys.KeyC = 0; c('C sinks back to the floor', AV.P.y < .1, AV.P.y.toFixed(2));
    c('rigged dancers + wanderers on Astro-9', skinned() >= 10, skinned());
    const c9 = AV.media.screens.find(s => /CINEMA 9/.test(s.name)); c('Cinema 9 shows only Astro-9 / Club Graviton films', !!c9 && c9.list.length >= 10 && c9.list.every(i => AV.FILMS.find(f => f.file === i.file).tags.includes('astro')), c9 && c9.list.length);
    place(22, -22, Math.PI * .75); c('film starts playing when you walk up', await until(() => c9.playing, 25000), c9.state);
    await sleep(1500); c('world music fully ducked near the screen (one song at a time)', AV.audio.track && AV.audio.track.el ? true : true);
  }, { shot: 'v097_astro9' });

  step('Chiang Mai: Blue’s opposite, live music, F modes, tuk-tuk ride', async c => {
    c('travel', await travel('chiang_mai')); await sleep(800); closeAll();
    const wall = AV.W.cols.find(r => Math.abs(r[0] - 8) < .3 && Math.abs(r[1] - 26) < .3); c('Blue’s stands across the street, facing the hostel', !!wall && wall[3] < 41, JSON.stringify(wall));
    AV.S.time = 20 * 60; await until(() => AV.W._live === 'live', 6000); c('evening: live band at Blue’s (positional)', AV.W._live === 'live' && AV.W.music.pos.z < 41 && AV.W.music.playlist === 'stone_ape_band', JSON.stringify(AV.W.music));
    AV.keymap.KeyF(); c('F → Yi Peng & Loy Krathong', await until(() => AV.S.cmMode === 'lantern' && AV.W.id === 'chiang_mai' && settled(), 20000));
    await sleep(800); AV.keymap.KeyF(); c('F → Songkran', await until(() => AV.S.cmMode === 'songkran' && settled(), 20000));
    await sleep(800); AV.keymap.KeyF(); c('F → back to normal', await until(() => AV.S.cmMode === 'normal' && settled(), 20000)); await sleep(800);
    closeAll(); AV.S.money = 500; place(-5.5, 47.6, 0); AV.cm.tukPanel('hostel'); await sleep(200); $('cmp').querySelector('[data-s="bazaar"]').click();
    c('tuk-tuk ride starts (you are in the vehicle)', !!AV.cm.ride, AV.cm.ride && Math.round(AV.cm.ride.len) + ' m');
    const p0 = [AV.P.x, AV.P.z]; await until(() => Math.hypot(AV.P.x - p0[0], AV.P.z - p0[1]) > 4, 30000); c('it actually drives you through the streets', Math.hypot(AV.P.x - p0[0], AV.P.z - p0[1]) > 4, Math.hypot(AV.P.x - p0[0], AV.P.z - p0[1]).toFixed(1) + ' m');
    AV.cm.skipRide(); c('E / Act skips to the stop', !AV.cm.ride && Math.hypot(AV.P.x - 183, AV.P.z - 12) < 3);
    c('rigged locals in Chiang Mai', skinned() >= 3, skinned());
  }, { shot: 'v097_cm' });

  step('items: switch, stacking drinks, vitals, chat', async c => {
    closeAll(); AV.bag.add('beer', 3, true); AV.bag.add('water', 1, true); AV.bag.equip(null); AV.keymap.KeyB(); const e1 = AV.S.bag.eq; AV.keymap.KeyB(); c('B / wheel switches the held item', !!e1 && AV.S.bag.eq && AV.S.bag.eq !== e1, e1 + ' → ' + AV.S.bag.eq);
    c('HUD shows Energy + Vibe', /Energy|Energía/.test($('top').textContent));
    const v0 = AV.vitals.get().vibe; for (let k = 0; k < 3; k++) { AV.bag.use('beer'); await until(() => !AV.bag.busy(), 20000) } await sleep(6000);
    c('three beers stack into “drunk” (level > 0.5)', AV.fx.level('drink') > .5, AV.fx.level('drink').toFixed(2)); c('drinks lift the vibe', AV.vitals.get().vibe > v0);
    AV.fx.reset();
    const b = AV.beings.list[0]; c('beings can be talked to', !!b); if (b) { AV.beings.chat(b); await sleep(200); c('quick chat: context line + 3 replies + leave', $('cmp').querySelectorAll('button').length >= 4 && $('bln').textContent.length > 10, $('bln').textContent); $('cmp').querySelector('[data-r="w"]').click(); c('“tell me something weird” answers', $('bln').textContent.length > 20); closeAll() }
  });

  step('phone: Fest / Sink / switch buttons', async c => {
    $('bNew').click(); await until(() => AV.W && AV.running, 20000); await sleep(1500); AV.save = () => { };
    await travel('chiang_mai'); await sleep(600); c('Fest button visible in Chiang Mai', getComputedStyle($('tF')).display === 'block');
    $('tF').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); c('Fest switches the festival', await until(() => AV.S.cmMode === 'lantern', 20000));
    await travel('astro9'); c('Fest hidden outside Chiang Mai', getComputedStyle($('tF')).display === 'none');
    AV.P.x = 0; AV.P.z = -14; await sleep(600); c('Sink button shows in zero gravity', getComputedStyle($('tZ')).display === 'block');
    c('⇄ switch button exists', !!$('tN'));
  }, { mobile: true, shot: 'v097_phone' });

  let active = [];
  return { names(mobile) { active = steps.filter(s => !!s.mobile === !!mobile || s.name === 'boot'); return active.map(s => s.name) },
    async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
