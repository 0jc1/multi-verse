/* Living Playground milestone 4: four-choice conversations, relationships, invitations, encounters
   (run_tests.ps1 -Suite tools\tests\suite_social.js -StepTimeout 900 [-Mobile]) */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const $ = id => document.getElementById(id);
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const travel = async id => { AV.travel(id); return until(() => AV.W && AV.W.id === id && settled(), 60000) };
  const SO = () => AV.social, opts = () => [...document.querySelectorAll('#cmp [data-s]')], labels = () => opts().map(b => b.textContent);
  const closeAll = () => { let n = 0; while (AV.modals.length && n++ < 10) AV.closeTop() };
  const beings = () => AV.W.T.filter(t => t.being && !/Challenge|Court|Ras Mo|Maker/.test(t.label())).map(t => t.being);
  const near = b => { AV.P.x = b.h.position.x + 1.4; AV.P.z = b.h.position.z; AV.P.y = AV.W.surface(AV.P.x, AV.P.z) || 0 };
  const clickWhere = test => { const i = SO().cur.opts.findIndex(test); if (i < 0) return false; document.querySelector('#cmp [data-s="' + i + '"]').click(); return true };
  const M = {};

  step('boot', async c => { $('gq').value = 'Low'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); await sleep(1500); AV.save = () => { }; AV.S.money = 300; c('to Chiang Mai', await travel('chiang_mai')); c('no world error', !$('err').textContent, $('err').textContent) });

  step('ten exchanges, four fresh choices each time', async c => {
    const L = beings(); c('strangers to talk to', L.length >= 3, L.length); const b = L[0]; M.b = b; near(b); AV.beings.chat(b); await sleep(100);
    c('conversation opens with exactly 4 choices', opts().length === 4, labels().join(' | ')); const r0 = AV.S.soc[AV.W.id + ':' + b.name].rel;
    let prev = labels().join('|'), prevLine = $('bln').textContent, fresh = 0, four = 0, lines = new Set([prevLine]), seen = [];
    for (let k = 0; k < 10; k++) { const ok = clickWhere(o => !o.inv) || clickWhere(() => true); if (!ok) break; await sleep(60); const now = labels().join('|'); if (opts().length === 4) four++; if (now !== prev) fresh++; lines.add($('bln').textContent); seen.push($('bln').textContent.slice(0, 50)); prev = now }
    c('10 exchanges, every one with 4 choices', four === 10, four); c('choices refreshed after every reply', fresh === 10, fresh); c('the character keeps saying new things', lines.size >= 9, lines.size + ' distinct lines');
    const R = AV.S.soc[AV.W.id + ':' + b.name]; c('relationship grew', R.rel > r0 && SO().tier(R.rel) >= 1, R.rel + ' (' + SO().tierName(R.rel) + ')'); M.lines = seen;
  });

  step('invitation → a working activity (basketball)', async c => {
    let n = 0; while (!SO().cur.opts.some(o => o.inv === 'hoops') && n++ < 12) { clickWhere(o => !o.inv); await sleep(60) }
    c('basketball invitation offered', SO().cur.opts.some(o => o.inv === 'hoops'), labels().join(' | ')); clickWhere(o => o.inv === 'hoops');
    c('you go to the court and the game starts', await until(() => AV.act.cur && AV.act.cur.id === 'hoops', 30000), AV.act.cur && AV.act.cur.mode);
    const v = AV.act.cur && AV.act.cur.v; c('standing at the court', !!v && Math.hypot(AV.P.x - v.rack.x, AV.P.z - v.rack.z) < 4); AV.act.end('leave');
    const R = AV.S.soc[AV.W.id + ':' + M.b.name]; c('the shared activity is remembered', R.shared.includes('hoops'), JSON.stringify(R.shared));
  });

  step('memory on the next meeting', async c => {
    const b = M.b; near(b); AV.beings.chat(b); await sleep(100); c('greets you as someone they know', /again|amigo|My friend|otra vez/i.test($('bln').textContent), $('bln').textContent);
    let n = 0; while (!SO().cur.opts.some(o => o.k === 'remember') && n++ < 12) { clickWhere(o => !o.inv); await sleep(60) }
    c('can talk about what you did together', clickWhere(o => o.k === 'remember') && /basketball|baloncesto|shot|tiro/i.test($('bln').textContent), $('bln').textContent); closeAll();
    c('Esc / Leave ends the conversation', !SO().cur);
  });

  step('they ask, you answer (4 answers)', async c => {
    const b = beings()[1]; near(b); AV.beings.chat(b); await sleep(100); let n = 0;
    while (!SO().cur.opts.some(o => o.k === 'from') && n++ < 15) { clickWhere(o => !o.inv && o.k !== 'from'); await sleep(60) }
    c('“Where are you from?” offered', clickWhere(o => o.k === 'from'), labels().join(' | ')); await sleep(60);
    c('they ask back, and your 4 choices are answers', opts().length === 4 && SO().cur.opts.every(o => o.ans), labels().join(' | '));
    clickWhere(() => true); c('they react to your answer', $('bln').textContent.length > 10, $('bln').textContent);
  });

  step('a round of drinks', async c => {
    let n = 0; while (!SO().cur.opts.some(o => o.inv === 'drinks') && n++ < 15) { clickWhere(o => !o.inv); await sleep(60) }
    const m0 = AV.S.money, b0 = AV.bag.count('beer'); c('drinks invitation', clickWhere(o => o.inv === 'drinks'));
    c('paid for the round, got a beer, conversation goes on', AV.S.money === m0 - 20 && AV.bag.count('beer') === b0 + 1 && opts().length === 4, (AV.S.money - m0) + ' credits'); closeAll();
  });

  step('a stranger comes up to you', async c => {
    const b = AV.social.trigger('directions'); c('encounter started', !!b, b && b.name); if (!b) return;
    c('their prompt says they want to talk', /wants to talk|quiere hablar/.test(b.tg.label()), b.tg.label()); near(b); const m0 = AV.S.money; b.tg.fn(); await sleep(100);
    c('they open with a request + 4 choices', opts().length === 4 && /which way|por dónde/.test($('bln').textContent), $('bln').textContent);
    c('help them: thanks + a tip', clickWhere(o => /That way|Por ahí/.test(o.label[0] + o.label[1])) && AV.S.money === m0 + 5, AV.S.money - m0); closeAll();
    c('prompt back to normal afterwards', !/wants to talk/.test(b.tg.label()));
    const b2 = AV.social.trigger('photo'); if (b2) { near(b2); b2.tg.fn(); await sleep(100); clickWhere(o => o.inv === 'photo'); c('photo request opens photo mode', await until(() => AV.act.cur && AV.act.cur.id === 'photo', 10000)); AV.act.end('leave') }
    AV.toggleSettings(); c('setting to turn encounters off', !!$('sEnc')); closeAll();
  });

  step('saved', async c => { const s = JSON.parse(AV.exportSave()); const k = Object.keys(s.soc || {}); c('relationships are in the save', k.length >= 2 && k.every(x => typeof s.soc[x].rel === 'number'), k.join(', ')); c('sample of the 10-exchange conversation', true, (M.lines || []).join(' / ')) });

  step('phone: tap through a conversation', async c => {
    $('gq').value = 'Low'; $('bNew').click(); await until(() => AV.W && AV.running, 30000); await sleep(1500); AV.save = () => { };
    c('Ape Town', await travel('ape_town')); const b = beings()[0]; c('a stranger', !!b); if (!b) return; near(b); AV.beings.chat(b); await sleep(100);
    let ok = 0; for (let k = 0; k < 4; k++) { const x = document.querySelector('#cmp [data-s="' + (k % 4) + '"]'); if (!x || SO().cur.opts[k % 4].inv) { clickWhere(o => !o.inv) } else x.dispatchEvent(new MouseEvent('click', { bubbles: true })); await sleep(60); if (opts().length === 4) ok++ }
    c('taps give new replies with 4 choices', ok === 4, ok); closeAll();
  }, { mobile: true, shot: 'social_phone' });

  let active = [];
  return { names(mobile) { active = steps.filter(s => !!s.mobile === !!mobile || s.name === 'boot'); return active.map(s => s.name) },
    async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
