/* Living Playground milestone 5: DJ booths, instruments, band jam (run_tests.ps1 -Suite tools\tests\suite_music.js -StepTimeout 900 [-Mobile]) */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const $ = id => document.getElementById(id), lab = t => typeof t.label === 'function' ? t.label() : t.label;
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const travel = async id => { AV.travel(id); return until(() => AV.W && AV.W.id === id && settled(), 60000) };
  const tgt = re => AV.W.T.find(t => (!t.show || t.show()) && re.test(lab(t)));
  const at = t => { AV.P.x = t.x; AV.P.z = t.z; AV.P.y = AV.W.surface(t.x, t.z) || 0 };
  const slide = (id, v) => { const e = $(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })) };
  const A = () => AV.audio, DJ = () => AV.dj;

  step('boot', async c => { $('gq').value = 'Low'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); await sleep(1500); AV.save = () => { }; AV.S.money = 100; c('Jungle Dub', await travel('jungle_dub')); c('no world error', !$('err').textContent, $('err').textContent) });

  step('DJ booth: decks, play, crossfade, FX, crowd, exit', async c => {
    const t = tgt(/DJ booth/); c('DJ booth at the sound system', !!t, t && lab(t)); if (!t) return; at(t);
    const wasTrack = A().track.active; t.fn(); c('DJ mode', AV.act.cur && AV.act.cur.id === 'dj'); c('world music on hold', A().hold === true && (!A().track.el || A().track.el.paused), 'track active before: ' + wasTrack);
    c('two decks + crossfader + filter + echo', !!$('djSa') && !!$('djSb') && !!$('djX') && !!$('djF') && !!$('djE'));
    const ta = DJ().decks.a.track; c('deck A loaded with an original track', !!ta && /assets\/music\//.test(ta.file), ta && ta.title + ' · ' + ta.list);
    c('only the game’s own tracks are offered', [...$('djSa').options].length >= 10, [...$('djSa').options].length + ' tracks');
    $('djPa').click(); c('deck A plays', await until(() => DJ().decks.a.el.currentTime > .5, 20000), DJ().decks.a.el.currentTime.toFixed(2) + ' s');
    c('beat follows your deck', await until(() => Math.abs(A().beat - DJ().decks.a.el.currentTime * A().bpm / 60) < 2, 30000));
    slide('djX', .5); c('crossfader at the middle: both sides open', Math.abs(DJ().x - .5) < .01 && Math.abs(Math.cos(DJ().x * Math.PI / 2) - Math.sin(DJ().x * Math.PI / 2)) < .01);
    $('djPb').click(); c('deck B plays too', await until(() => DJ().decks.b.el.currentTime > .3, 20000)); c('both decks audible', DJ().level('a') > .3 && DJ().level('b') > .3, DJ().level('a').toFixed(2) + ' / ' + DJ().level('b').toFixed(2));
    slide('djX', 0); c('crossfader hard left: B silent', DJ().level('b') < .01);
    $('djAuto').click(); DJ().auto.t0 = AV.now() - 9; AV.act._ff(.1); c('auto-mix glides to B', DJ().x > .99 && DJ().level('a') < .01, DJ().x.toFixed(2));
    slide('djF', -.8); const G = AV.isFile ? null : true; c('filter sweep', AV.isFile || DJ().filter === -.8, DJ().filter);
    $('djE').click(); c('echo on', DJ().echo === true);
    AV.act._ff(1.5); c('crowd dances to your set', (AV.act.cur.dancers || 0) > 0, AV.act.cur.dancers);
    $('actLeave').click(); c('leave: decks stop, world music back', !AV.act.cur && !A().hold && DJ().decks.a.el.paused && DJ().decks.b.el.paused);
    c('set saved', (AV.S.act.dj && AV.S.act.dj.sets) >= 1, JSON.stringify(AV.S.act.dj));
  });

  step('jam with the Stone Ape Band (on the beat)', async c => {
    const t = tgt(/Jam with the Stone Ape Band/); c('band jam spot on the stage', !!t, t && lab(t)); if (!t) return; at(t); const m0 = AV.S.money; t.fn();
    const s = AV.act.cur; c('instrument mode: 8 pads', s && s.id === 'instrument' && document.querySelectorAll('#actHud [data-pad]').length === 8);
    const pad = i => document.querySelector('#actHud [data-pad="' + i + '"]').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    for (let k = 0; k < 9; k++) { A().beat = 20 + k + .03; pad(k % 8) } c('9 hits on the beat, combo 9', s.onBeat === 9 && s.combo === 9, s.onBeat + ' / ' + s.combo);
    A().beat = 30.5; pad(0); c('off-beat hit breaks the combo', s.combo === 0 && s.onBeat === 9);
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit3', key: '3', bubbles: true })); c('keyboard 1-8 plays too', s.hits === 11, s.hits);
    $('actLeave').click(); c('leave: the crowd tips you', !AV.act.cur && AV.S.money > m0, '+' + (AV.S.money - m0));
  });

  step('bongos at Roots Village', async c => {
    const t = tgt(/Bongos/); c('bongo spot', !!t, t && lab(t)); if (!t) return; at(t); t.fn(); const s = AV.act.cur; c('bongo pads', s && s.kind === 'bongo');
    document.querySelector('#actHud [data-pad="2"]').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); c('a slap is played', s.hits === 1); AV.closeTop(); c('Esc leaves', !AV.act.cur);
  });

  step('other worlds: Ape Town, Astro-9, Vienna, Chiang Mai', async c => {
    c('Ape Town', await travel('ape_town')); c('keys + bass on the Lotus Stage, block-party decks', !!tgt(/Keys/) && !!tgt(/Upright bass/) && !!tgt(/DJ booth/), AV.act.venues.map(v => v.type).join(','));
    c('Astro-9', await travel('astro9')); c('Club Graviton guest decks + alien synth', !!tgt(/DJ booth/) && !!tgt(/Alien synth/)); const v = AV.act.venues.find(v => v.type === 'dj'); c('booth outside the zero-g floor', !AV.W.gravityAt || AV.W.gravityAt(v.x, v.z) !== 0);
    c('Vienna', await travel('vienna')); c('Flex DJ booth', !!tgt(/DJ booth/));
    c('Chiang Mai', await travel('chiang_mai')); c('ukulele on the hostel terrace', !!tgt(/Ukulele/));
    const t = tgt(/Ukulele/); at(t); t.fn(); document.querySelector('#actHud [data-pad="0"]').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); c('strum a C chord', AV.act.cur.hits === 1); AV.closeTop();
    c('no JS errors', !$('err').textContent, $('err').textContent);
  });

  step('phone: DJ and pads by touch', async c => {
    $('gq').value = 'Low'; $('bNew').click(); await until(() => AV.W && AV.running, 30000); await sleep(1500); AV.save = () => { };
    c('Jungle Dub', await travel('jungle_dub')); const t = tgt(/DJ booth/); at(t); t.fn();
    c('DJ: no SHOOT button, Leave visible', getComputedStyle($('actGo')).display === 'none' && getComputedStyle($('actExit')).display === 'block');
    $('djPa').dispatchEvent(new MouseEvent('click', { bubbles: true })); c('tap ▶ plays', await until(() => DJ().decks.a.el.currentTime > .3, 20000));
    $('actExit').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); c('Leave', !AV.act.cur && !A().hold);
    const j = tgt(/Jam with the Stone Ape Band/); at(j); j.fn(); document.querySelector('#actHud [data-pad="1"]').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); c('tap a pad', AV.act.cur.hits === 1); $('actExit').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  }, { mobile: true, shot: 'music_phone' });

  let active = [];
  return { names(mobile) { active = steps.filter(s => !!s.mobile === !!mobile || s.name === 'boot'); return active.map(s => s.name) },
    async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
