/* Worlds Reborn §31: full DJ mixer (run_tests.ps1 -Suite tools\tests\suite_dj.js -StepTimeout 900 [-Mobile]) */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const $ = id => document.getElementById(id), lab = t => typeof t.label === 'function' ? t.label() : t.label;
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const tgt = re => AV.W.T.find(t => (!t.show || t.show()) && re.test(lab(t)));
  const DJ = () => AV.dj, A = () => AV.audio, slide = (el, v) => { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })) };

  step('boot', async c => { $('gq').value = 'Low'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); await sleep(1500); AV.save = () => { };
    AV.travel('jungle_dub'); c('Jungle Dub', await until(() => AV.W && AV.W.id === 'jungle_dub' && settled(), 90000)) });

  step('mixer opens with waveforms, auto BPM, both decks', async c => {
    const t = tgt(/DJ booth/); AV.P.x = t.x; AV.P.z = t.z; t.fn(); c('DJ mode', AV.act.cur && AV.act.cur.id === 'dj'); c('world music on hold', A().hold === true);
    c('waveform canvases + tempo + sync + EQ + cues + loops on both decks', ['djWa', 'djWb', 'djRa', 'djSya', 'djSyb', 'djFla'].every(id => $(id)) && document.querySelectorAll('#actHud [data-eq]').length === 6 && document.querySelectorAll('#actHud [data-cue]').length === 8 && document.querySelectorAll('#actHud [data-loop]').length === 10);
    const fa = DJ().decks.a.track.file, fb = DJ().decks.b.track.file; c('decoded waveforms for both tracks', await until(() => DJ().peaks[fa] && DJ().peaks[fa].pk && DJ().peaks[fb] && DJ().peaks[fb].pk, 240000), fa.split('/').pop() + ' / ' + fb.split('/').pop());
    c('BPM detected from the audio (60-200)', DJ().bpm('a') >= 60 && DJ().bpm('a') <= 200 && DJ().bpm('b') >= 60, DJ().bpm('a') + ' / ' + DJ().bpm('b') + ' (auto ' + DJ().peaks[fa].bpm + ' / ' + DJ().peaks[fb].bpm + ')');
    $('djPa').click(); $('djPb').click(); c('both decks play', await until(() => DJ().decks.a.el.currentTime > .5 && DJ().decks.b.el.currentTime > .5, 30000));
  });

  step('tempo, sync, EQ, filter, hot cues, loops, FX', async c => {
    const a = DJ().decks.a, b = DJ().decks.b;
    slide($('djRa'), 1.04); c('tempo fader: +4 %', Math.abs(a.el.playbackRate - 1.04) < .001 && Math.abs(DJ().ebpm('a') - DJ().bpm('a') * 1.04) < .01, DJ().ebpm('a').toFixed(2));
    { const ra = DJ().bpm('a') * a.el.playbackRate, rb = DJ().bpm('b'); if (![ra, ra * 2, ra / 2].some(x => Math.abs(x / rb - 1) <= .16)) { /* 2.0: the library has more tracks; sync is only defined within ±16 % - give deck B deck A's track */ const i = DJ().tracks.findIndex(x => x.file === a.track.file); DJ().load('b', i); await until(() => DJ().peaks[a.track.file] && DJ().decks.b.track && DJ().decks.b.track.file === a.track.file, 60000); DJ().play('b', true); await until(() => b.el.currentTime > .3, 20000) } }
    $('djSyb').click(); const eb = DJ().ebpm('b'), ea = DJ().ebpm('a'); c('SYNC: deck B matches deck A’s tempo (or half / double time)', [ea, ea * 2, ea / 2].some(t => Math.abs(eb - t) < .05), DJ().ebpm('a').toFixed(2) + ' vs ' + DJ().ebpm('b').toFixed(2));
    let dp = Math.abs(DJ().phase('a') - DJ().phase('b')); dp = Math.min(dp, 1 - dp); c('SYNC snaps the beat phase', dp < .08, dp.toFixed(3));
    c('key lock on (pitch kept)', b.el.preservesPitch !== false);
    slide(document.querySelector('[data-eq="a0"]'), -1); c('low EQ kill on deck A', a.lo ? a.lo.gain.value <= -39 : AV.isFile, a.lo && a.lo.gain.value);
    slide(document.querySelector('[data-eq="b2"]'), .5); c('high EQ boost on deck B (+3 dB)', !b.hi || Math.abs(b.hi.gain.value - 3) < .01);
    slide($('djFla'), -.6); c('deck filter: low-pass sweep', !a.flp || a.flp.frequency.value < 2000, a.flp && a.flp.frequency.value.toFixed(0)); slide($('djFla'), 0);
    const t1 = a.el.currentTime; document.querySelector('[data-cue="a0"]').click(); const cue = AV.S.dj.trk[a.track.file].cues[0]; c('hot cue 1 set (on the beat grid)', cue != null && Math.abs(cue - t1) < DJ().beatLen('a'), cue && cue.toFixed(2));
    a.el.currentTime = cue + 20; await sleep(300); document.querySelector('[data-cue="a0"]').click(); await sleep(200); c('hot cue 1 jumps back', Math.abs(a.el.currentTime - cue) < .6, a.el.currentTime.toFixed(2) + ' vs ' + cue.toFixed(2));
    $('djClr').click(); document.querySelector('[data-cue="a0"]').click(); c('clear mode removes the cue', AV.S.dj.trk[a.track.file].cues[0] == null);
    document.querySelector('[data-loop="a4"]').click(); const L = a.loop; c('4-beat loop set on the grid', L && Math.abs(L.b - L.a - 4 * DJ().beatLen('a')) < .01, L && (L.b - L.a).toFixed(2) + ' s');
    let inside = true; const t0 = Date.now(); while (Date.now() - t0 < (L.b - L.a) * 1000 * 1.8) { if (a.el.currentTime < L.a - .05 || a.el.currentTime > L.b + .08) inside = false; await sleep(40) } c('the loop holds the playhead (real time, ~2 passes)', inside, a.el.currentTime.toFixed(2) + ' in [' + L.a.toFixed(2) + ',' + L.b.toFixed(2) + ']');
    document.querySelector('[data-loop="a4"]').click(); c('loop off', !a.loop);
    $('djE').click(); slide($('djEw'), .6); slide($('djRv'), .5); const M = AV.dj; c('echo on (beat-synced delay) + reverb', M.echo === true && M.echoWet === .6 && M.rev === .5);
    slide($('djX'), .5); slide($('djF'), .7); c('crossfader + master high-pass', Math.abs(M.x - .5) < .01 && M.filter === .7);
    $('djCv').click(); c('crossfader curve: sharp', M.curve === 'sharp' && M.level('a') > .85 && M.level('b') > .85); $('djCv').click();
    for (let i = 0; i < 4; i++) { DJ().tap('b'); await sleep(500) } c('tap tempo (4 taps at 0.5 s ≈ 120 BPM)', Math.abs(DJ().bpm('b') - 120) < 8, DJ().bpm('b'));
    $('djPfla').click(); c('CUE/PFL solos deck A', M.pfl === 'a' && (!b.g || b.g.gain.value === 0)); $('djPfla').click();
    c('master meter moves', await until(() => parseFloat($('djMm').style.width) > 0, 30000), $('djMm').style.width);
  });

  step('leave: everything stops, no echo tail, world music back', async c => {
    $('actLeave').click(); c('decks stop', DJ().decks.a.el.paused && DJ().decks.b.el.paused); c('echo/reverb off on exit', !DJ().echo && DJ().rev === 0); c('world music back', !A().hold);
    c('hot cues + BPM saved per track', !!AV.S.dj && Object.keys(AV.S.dj.trk).length >= 2); c('no JS errors', !$('err').textContent, $('err').textContent);
  });

  step('phone: mixer usable by touch', async c => {
    $('gq').value = 'Low'; $('bNew').click(); await until(() => AV.W && AV.running, 30000); await sleep(1500); AV.save = () => { };
    AV.travel('jungle_dub'); await until(() => AV.W && AV.W.id === 'jungle_dub' && settled(), 90000); const t = tgt(/DJ booth/); AV.P.x = t.x; AV.P.z = t.z; t.fn();
    const h = $('actHud').getBoundingClientRect(); c('mixer fits the screen width and scrolls', h.width <= innerWidth && getComputedStyle($('actHud')).overflowY === 'auto', h.width + ' / ' + innerWidth);
    $('djPa').dispatchEvent(new MouseEvent('click', { bubbles: true })); c('tap ▶', await until(() => DJ().decks.a.el.currentTime > .3, 30000)); $('actExit').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); c('Leave', !AV.act.cur && !A().hold);
  }, { mobile: true, shot: 'dj_phone' });

  let active = [];
  return { names(mobile) { active = steps.filter(s => !!s.mobile === !!mobile || s.name === 'boot'); return active.map(s => s.name) },
    async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
