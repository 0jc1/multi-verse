/* APEVERSE 2.3 - playtest fixes (owner feedback 2026-11-27): breathing noise gone + passing vehicles + mix sliders, T = full-screen
   city map (filters, legend, travel button, illustrated guide), G = missions journal (graphics on F4), 7-ELEVAPE walk-in stores across
   Thailand with real buy -> serve -> consume, Giant Hostel frontage from the owner's photos.   run_tests.ps1 -Suite tools/tests/suite_lw23d0.js -Gpu -Port 8102 -StepTimeout 900 */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const go = async id => { if (AV.W && AV.W.id === id) return true; AV.travel(id); return until(() => AV.W && AV.W.id === id && settled(), 240000) };
  const lbl = t => { try { return typeof t.label === 'function' ? t.label() : String(t.label) } catch (e) { return '' } };
  const put = (x, z) => { const P = AV.P; P.x = x; P.z = z; P.y = AV.W.surface(x, z) || 0; P.vx = P.vz = 0 };
  const look = (x, z, tx, tz, pitch) => { put(x, z); AV.P.yaw = Math.atan2(-(tx - x), -(tz - z)); AV.P.pitch = pitch || 0 };
  const key = (code, o) => { const e = new KeyboardEvent('keydown', Object.assign({ code, bubbles: true }, o || {})); document.dispatchEvent(e); window.dispatchEvent(new KeyboardEvent('keyup', { code })) };
  const errs = () => (window.__APE_ERRS || []).filter(e => !/api\/mp\//.test(e));
  step('boot (sandboxed save)', async c => { c('page scripts loaded', await until(() => window.AV && AV.boot && $('bNew') && $('bNew').onclick, 120000)); window.__real = localStorage.getItem('apeverse_v09');
    AV.saveKey = 'apeverse_test_lw23d0'; $('gq').value = 'Medium'; $('mus').checked = true; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 60000)); await sleep(2000); AV.S.time = 15 * 60;
    c('modules', !!(AV.LW.stores && AV.LW.showArt && AV.LW.passBy)) });
  step('audio: no breathing beds, murmur + passing vehicles, mix sliders', async c => { c('travel to Chiang Mai', await go('chiang_mai')); await sleep(2500);
    c('Sound 2.0 chatter replaced by murmur grains (no LFO-pumped noise)', /grain/.test(String(AV.snd.GEN.chatter)) && !/lg2/.test(String(AV.snd.GEN.chatter)));
    const L = (AV.amb && AV.amb.L) || {}; const pumped = Object.keys(L).filter(k => L[k].def.loop && L[k].def.loop.lfo && L[k].def.loop.lfo[1] > .12); c('no ambience bed pumps (LFO depth capped)', !pumped.length, pumped.join(','));
    c('fake crowd / traffic noise beds removed', !Object.keys(L).some(k => /crowd|traffic|hum/i.test(k) && L[k].def.loop), Object.keys(L).join(',') + ' · dropped ' + AV.LW.audioStats.bedsDropped);
    put(18, 41); const p0 = AV.LW.audioStats.passBys; c('scooters / tuk-tuks pass by in the street', await until(() => AV.LW.audioStats.passBys > p0, 30000), AV.LW.audioStats.passBys);
    AV.toggleSettings(); await sleep(300); c('settings: separate sliders for ambience, crowds, vehicles', ['va', 'vc', 'vv'].every(k => document.querySelector('[data-mix="' + k + '"]'))); AV.toggleSettings(); AV.closeTop && AV.closeTop() });
  step('T = full-screen city map, G = missions', async c => { const q0 = AV.S.set.gq; key('KeyT'); await sleep(500); c('T opens the full-screen city map', AV.minimap.atlasOpen()); c('category filters + travel + What’s Happening buttons', !!document.querySelector('#lwMapBar [data-f="shop"]') && !!document.querySelector('#lwMapBar [data-x="travel"]') && !!document.querySelector('#lwMapBar [data-x="hap"]'));
    c('legend', /Legend/.test(($('lwLegend') || {}).textContent || '')); const n0 = AV.minimap.fullMarks().length; document.querySelector('#lwMapBar [data-f="place"]').click(); await sleep(200); c('a filter hides its markers', AV.minimap.fullMarks().length < n0, n0 + ' -> ' + AV.minimap.fullMarks().length); document.querySelector('#lwMapBar [data-f="place"]').click();
    const ab = document.querySelector('#lwMapBar [data-x="art"]'); c('illustrated guide for Chiang Mai', !!ab); ab && ab.click(); const img = document.querySelector('#lwArt img'); c('illustrated map image loads', await until(() => img.complete && img.naturalWidth > 500, 8000), img.src.split('/').pop() + ' ' + img.naturalWidth); document.querySelector('#lwArt [data-a="x"]').click();
    key('KeyT'); await sleep(300); c('T again closes it', !AV.minimap.atlasOpen()); key('KeyG'); await sleep(400); c('G opens the missions journal', /Missions/.test($('cmp').textContent) && $('cmp').style.display === 'block'); c('G no longer changes graphics quality', AV.S.set.gq === q0, q0 + ' -> ' + AV.S.set.gq); AV.closePanel('cmp') }, { shot: 'lw_d0_map' });
  step('7-ELEVAPE across Thailand: buy -> served -> consume', async c => { const S = AV.LW.stores; c('several stores in Chiang Mai', S.list.length >= 3, S.list.length + ' built, ' + S.stats.failed + ' no lot');
    c('generic minimart counter retired', !AV.W.T.some(t => /^Mini mart: cold drink/.test(lbl(t)) && (!t.show || t.show())));
    const st = S.list[0], T = AV.W.T.find(t => /7-ELEVAPE.*buy snacks/.test(lbl(t))); c('counter interaction', !!T); put(T.x, T.z); await sleep(300); c('the store is walkable inside (counter spot on free ground)', AV.isFree(AV.W, T.x, T.z, .3));
    AV.S.time = 15 * 60; T.fn(); await sleep(300); c('menu: toastie, rice, ice cream, drinks', ['toastie', 'basil rice', 'Ice-cream', 'Cola'].every(s => $('cmp').textContent.includes(s)));
    c('beer locked at 15:00 (Thai sales hours)', !!document.querySelector('[data-buy="beer"][disabled]')); const m0 = AV.S.money; document.querySelector('[data-buy="lw_toastie"]').click(); await sleep(300); c('paid 25, being heated', AV.S.money === m0 - 25 && AV.bag.count('lw_toastie') === 0);
    c('handed over: in the bag + in your hand', await until(() => AV.bag.count('lw_toastie') === 1 && AV.bag.held().id === 'lw_toastie', 4000)); let bites = 0; for (let k = 0; k < 250 && AV.bag.count('lw_toastie') > 0; k++) { if (!AV.bag.busy()) { AV.bag.use('lw_toastie'); bites++ } await sleep(150) } c('eaten bite by bite', AV.bag.count('lw_toastie') === 0 && bites >= 2, 'bites ' + bites);
    AV.S.time = 18 * 60; T.fn(); await sleep(300); c('beer on sale at 18:00', !document.querySelector('[data-buy="beer"][disabled]')); AV.closePanel('cmp');
    const f = st.front; look(f[0] + Math.sin(st.o.ry) * 7, f[1] + Math.cos(st.o.ry) * 7, f[0], f[1], .05); await sleep(1500) }, { shot: 'lw_d0_711' });
  step('7-ELEVAPE in Pai and Koh Tao', async c => { for (const w of ['pai', 'koh_tao']) { c(w + ' loads', await go(w)); await sleep(2000); c(w + ': stores built', AV.LW.stores.list.length >= 2, AV.LW.stores.list.length + ' / failed ' + AV.LW.stores.stats.failed) } });
  step('Giant Hostel frontage (owner photos)', async c => { c('back to Chiang Mai', await go('chiang_mai')); await sleep(2000); let gan = null; AV.W.group.traverse(o => { const m = o.material; if (m && m.map && m.map.image && /giant_ganesha/.test(m.map.image.src || '')) gan = m.map });
    c('Ganesha mural texture from the photo', !!gan && await until(() => gan.image.complete && gan.image.naturalWidth > 300, 6000)); AV.S.time = 11 * 60; look(19.5, 38.5, 19.5, 48, .12); await sleep(2500); c('no JS errors', !errs().length, errs().slice(-3).join(' | '));
    c("player's real save untouched", localStorage.getItem('apeverse_v09') === window.__real); try { localStorage.removeItem('apeverse_test_lw23d0'); localStorage.removeItem('apeverse_test_lw23d0_bak') } catch (e) { } }, { shot: 'lw_d0_giant' });
  return { names() { return steps.map(s => s.name) }, async exec(i) { const s = steps[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
