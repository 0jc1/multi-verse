/* APEVERSE 2.1 Phase 0/1 AUDIT PROBE: world-by-system evidence for every playable world.
   For each world: travel there, then press every interaction (W.T) once with travel / rides / activities stubbed, and click the buttons of
   any panel it opens, recording what really happens: AV.shop vendors + their items, credits spent (AV.txn), items added to the backpack,
   effects applied directly (AV.fx.add), activities / rentals started, taxi rides requested.  Then the consumable chain on a bought item
   (backpack -> use animation -> AV.fx effect -> "disable visuals" -> clear), transport inventory, map + GPS route, music/festival hooks,
   draw calls at arrival, an arrival screenshot, and one sandboxed save -> loadSave roundtrip.  The game state is restored after each
   world, the player's real save is never written (AV.save stubbed, sandbox key for the roundtrip).
   Results land in window.__audit (dumped by the last step) for docs/SYSTEM_STATUS_21.md.
   run_tests.ps1 -Suite tools/tests/suite_audit21.js -Gpu */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms)), $ = id => document.getElementById(id);
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const WORLDS = ['madrid', 'ape_town', 'chiang_mai', 'pai', 'astro9', 'jungle_dub', 'vienna', 'da_nang', 'koh_tao', 'koh_samui_jurassic', 'jerusalem', 'judean_desert', 'verdalux'];
  const txt = v => { try { return typeof v === 'function' ? String(v()) : Array.isArray(v) ? v[0] : String(v || '') } catch (e) { return '?' } };
  const A = window.__audit = { worlds: {}, order: WORLDS };
  const cls = id => { const d = AV.ITEMS[id]; if (!d) return 'unknown'; const f = d.fx && d.fx.type !== 'sober' && d.fx.type; if (f === 'smoke' || f === 'psy' || f === 'glow') return 'effect:' + f; if (f === 'drink') return d.use === 'drink' ? 'alcohol' : 'effect:drink'; if (f === 'buzz') return d.use === 'drink' ? 'drink(caff)' : 'effect:buzz'; if (d.use === 'eat') return 'food'; if (d.use === 'drink') return 'drink'; if (d.use === 'smoke' || d.use === 'alien') return 'effect:' + d.use; return d.cat || 'misc' };
  step('boot', async c => { $('gq').value = 'Medium'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); await sleep(1500); window.__realSave = window.__realSave || AV.save; AV.save = () => { };
    c('playable worlds in registry', WORLDS.length >= 13, WORLDS.join(',')) });

  async function probe(id) {
    const W = AV.W, P = AV.P, S = AV.S, snap = JSON.stringify(S), home = [P.x, P.y, P.z];
    const R = { T: W.T.length, inter: [], shops: {}, bought: {}, fxDirect: {}, acts: {}, taxi: 0, rent: [], labels: [] };
    const o = { travel: AV.travel, txn: AV.txn, fxa: AV.fx.add, add: AV.bag.add, sh: AV.shop.open, st: AV.act && AV.act.start, go: AV.transit && AV.transit.go, rent: AV.veh && AV.veh.rent, fade: AV.fadeTo };
    let cur = null; S.money = 99999;
    AV.travel = function () { if (cur) cur.ev.push('travel') };
    AV.txn = function (d, l) { if (cur && d < 0) cur.ev.push('pay:' + (-d)); return o.txn.apply(this, arguments) };
    AV.fx.add = function (t, a) { if (cur) { cur.ev.push('fx:' + t); R.fxDirect[t] = (R.fxDirect[t] || 0) + 1 } };
    AV.bag.add = function (iid, n, s) { if (cur) { cur.ev.push('item:' + iid); R.bought[iid] = cls(iid) } return o.add.apply(this, arguments) };
    AV.shop.open = function (v) { if (cur) { cur.ev.push('shop:' + v.id); R.shops[v.id] = { name: txt(v.name), items: v.items.map(([i, p]) => [i, p, cls(i)]) } } if (cur) cur.v = v; return o.sh.apply(this, arguments) };
    if (AV.act) AV.act.start = function (aid) { if (cur) { cur.ev.push('act:' + aid); R.acts[aid] = (R.acts[aid] || 0) + 1 } return false };
    if (AV.transit) AV.transit.go = function () { if (cur) { cur.ev.push('taxi'); R.taxi++ } return false };
    if (AV.veh) AV.veh.rent = function (k) { if (cur) cur.ev.push('rent:' + k); R.rent.push(k); return null };
    AV.fadeTo = () => { };
    try {
      for (const T of W.T.slice()) { if (!T || typeof T.fn !== 'function') continue; let lab = ''; try { lab = txt(T.label) } catch (e) { } cur = { lab: lab.slice(0, 90), kind: T.kind || '', ev: [] };
        if (T.x != null) { P.x = T.x; P.z = T.z; P.y = (W.surface(T.x, T.z) || 0) } AV.closePanel && AV.closePanel('cmp');
        try { await T.fn() } catch (e) { cur.ev.push('err:' + String(e).slice(0, 60)) }
        if (cur.v) { for (const [i, pr] of cur.v.items) { await sleep(470); try { AV.shop.buy(Object.assign({}, cur.v, { x: null }), i, pr) } catch (e) { } } }
        const p = $('cmp'); if (p && p.style.display !== 'none' && p.innerHTML.length) { const bs = [...p.querySelectorAll('button')].filter(b => !b.hasAttribute('data-close') && !b.hasAttribute('data-buy') && !/back|◀|goodbye|adiós|done|listo|close|cerrar/i.test(b.textContent)).slice(0, 14);
          cur.panel = bs.length; for (const b of bs) { try { b.click() } catch (e) { } await sleep(60) } }
        AV.closePanel && AV.closePanel('cmp'); if (AV.act && AV.act.cur) try { AV.act.end('leave') } catch (e) { }
        R.inter.push(cur); R.labels.push(cur.lab) }
    } finally { cur = null; Object.assign(AV, { travel: o.travel, txn: o.txn, fadeTo: o.fade }); AV.fx.add = o.fxa; AV.bag.add = o.add; AV.shop.open = o.sh; if (o.st) AV.act.start = o.st; if (o.go) AV.transit.go = o.go; if (o.rent) AV.veh.rent = o.rent }
    await sleep(800);
    return { R, restore: () => { for (const k of Object.keys(S)) delete S[k]; Object.assign(S, JSON.parse(snap)); P.x = home[0]; P.y = home[1]; P.z = home[2]; AV.fx.reset && AV.fx.reset(); AV.bag.equip(null) } };
  }

  for (const id of WORLDS) step('audit ' + id, async c => {
    AV.S.time = 11 * 60; AV.travel(id); const ok = await until(() => AV.W && AV.W.id === id && settled(), 240000); c('loads', ok); if (!ok) { A.worlds[id] = { load: false }; return }
    await sleep(3500); const W = AV.W, P = AV.P, a = { load: true, spawnOnGround: W.surface(P.x, P.z) !== null };
    /* draw calls at arrival (static camera) */
    let n = 0, calls = 0, on = true; const f = () => { n++; calls += AV.R.info.render.calls; if (on) requestAnimationFrame(f) }; requestAnimationFrame(f); await sleep(2500); on = false; a.fps = +(n / 2.5).toFixed(1); a.calls = Math.round(calls / Math.max(1, n));
    /* map + GPS */
    a.places = (W.places || []).length; a.roads = (W.mapRoads || []).length; a.districts = (W.mapDistricts || []).length;
    const far = (W.places || []).filter(q => !q.hidden).sort((p, q) => Math.hypot(q.x - P.x, q.z - P.z) - Math.hypot(p.x - P.x, p.z - P.z))[0];
    if (far && AV.path && AV.path.route) { try { const r = AV.path.route(W, { x: P.x, z: P.z }, { x: far.x, z: far.z }), pts = r && (r.pts || r.path || r); a.route = pts && pts.length ? pts.length + ' pts (' + (r.how || '') + ') to ' + txt(far.name) + ' ' + Math.round(Math.hypot(far.x - P.x, far.z - P.z)) + ' m' : 'none ' + JSON.stringify(r).slice(0, 80) } catch (e) { a.route = 'err ' + e } }
    a.taxiCfg = !!(AV.transit && AV.transit.CFG[id]); a.taxiMode = a.taxiCfg ? 'fade-teleport' : 'none';
    a.fest = Object.entries(AV.fest ? AV.fest.LIST : {}).filter(([k, F]) => F.w === id).map(([k]) => k);
    a.amb = !!(AV.ambWorlds && AV.ambWorlds.presets && AV.ambWorlds.presets[id]) || !!(W.ambience);
    a.music = W.musicProfile ? String(W.musicProfile.id || W.musicProfile.name || 'profile') : '';
    /* interactions */
    const { R, restore } = await probe(id); a.T = R.T; a.shops = R.shops; a.bought = R.bought; a.fxDirect = R.fxDirect; a.acts = R.acts; a.taxiStands = R.taxi; a.rentCalls = R.rent;
    a.inter = R.inter.filter(i => i.ev.length || i.panel).map(i => i.lab + ' => ' + i.ev.slice(0, 8).join(' '));
    a.labels = R.labels; const kinds = Object.values(R.bought);
    a.food = Object.keys(R.bought).filter(k => R.bought[k] === 'food'); a.drink = Object.keys(R.bought).filter(k => /^drink/.test(R.bought[k]));
    a.alcohol = Object.keys(R.bought).filter(k => R.bought[k] === 'alcohol'); a.effectItems = Object.keys(R.bought).filter(k => /^effect/.test(R.bought[k]));
    a.vehicles = Object.keys(R.acts).filter(k => /ride|rent|drive|veh|tram|metro|boat|canoe|taxi/.test(k)).concat(R.rent);
    /* consumable chain on items actually bought here */
    const chain = async iid => { const d = AV.ITEMS[iid]; if (!AV.bag.count(iid)) return 'not in bag'; const fx0 = AV.fx.list.length; AV.bag.use(iid); await sleep(400); const vm = AV.bag.held().VM.visible; await sleep(2600);
      const fxOk = !d.fx || d.fx.type === 'sober' || AV.fx.list.length > fx0 || AV.fx.active().some(e => e.type === d.fx.type); return (vm ? 'anim' : 'NO-ANIM') + (d.fx && d.fx.type !== 'sober' ? (fxOk ? ' fx:' + d.fx.type : ' NO-FX') : ' (no fx)') };
    a.chain = {}; for (const iid of [a.food[0], a.drink[0], a.alcohol[0], a.effectItems[0]].filter(Boolean)) a.chain[iid] = await chain(iid);
    if (AV.fx.list.length) { AV.S.set.noIntox = true; AV.fx.refresh && AV.fx.refresh(); await sleep(400); a.noVisuals = (AV.R.domElement.style.filter || '') === '' ? 'canvas filter off' : 'FILTER STILL ' + AV.R.domElement.style.filter; AV.S.set.noIntox = false; AV.fx.reset(); await sleep(200); a.cleared = AV.fx.list.length === 0 }
    restore(); A.worlds[id] = a;
    c('interactions probed', R.T > 0, R.T + ' interactions, ' + Object.keys(R.shops).length + ' AV.shop vendors, ' + Object.keys(R.bought).length + ' items obtainable');
    c('food or drink obtainable', a.food.length + a.drink.length + a.alcohol.length > 0, 'food ' + a.food.join(',') + ' | drink ' + a.drink.join(',') + ' | alcohol ' + a.alcohol.join(','));
    c('effect item obtainable', a.effectItems.length > 0 || Object.keys(a.fxDirect).length > 0, 'items ' + a.effectItems.join(',') + ' | direct fx ' + JSON.stringify(a.fxDirect));
    c('consumable chain', Object.values(a.chain).every(v => /^anim/.test(v) && !/NO-FX/.test(v)) && Object.keys(a.chain).length > 0, JSON.stringify(a.chain) + ' · ' + (a.noVisuals || '') + ' · cleared ' + a.cleared);
    c('transport', a.taxiCfg || a.vehicles.length > 0, 'taxi ' + a.taxiMode + ' · stands ' + a.taxiStands + ' · vehicles ' + a.vehicles.join(','));
    c('map + GPS', a.places > 0 && /pts/.test(a.route || ''), a.places + ' places, ' + a.roads + ' road segs, route ' + a.route);
    c('frame', true, a.fps + ' fps · ' + a.calls + ' draw calls (arrival, Medium)');
    AV.S.time = 12 * 60; await sleep(1200) }, { shot: 'audit_' + id });

  step('save -> loadSave roundtrip (sandbox key)', async c => { const K = 'apeverse_test_audit21', real = localStorage.getItem('apeverse_v09'); AV.saveKey = K; AV._bakFor = null; localStorage.removeItem(K);
    AV.bag.add('water', 2, true); AV.S.money = 4321; window.__realSave(); const L = AV.loadSave(); c('items + credits persist', L && L.s.items.water >= 2 && L.s.money === 4321, L && JSON.stringify({ w: L.s.items.water, m: L.s.money, world: L.s.world }));
    localStorage.removeItem(K); localStorage.removeItem(K + '_bak'); AV.saveKey = 'apeverse_v09'; AV._bakFor = null; c("player's real save untouched", localStorage.getItem('apeverse_v09') === real) });
  step('dump', async c => c('audit json', true, JSON.stringify(A)));
  step('no JS errors', async c => c('clean', !$('err').textContent, $('err').textContent));
  let active = steps;
  return { names() { active = steps; return steps.map(s => s.name) }, async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
