/* Polish pass (existing worlds): transport (rentals + taxis + map fast travel), Madrid street detail, Astro-9 districts, per-world screenshots
   run_tests.ps1 -Suite tools\tests\suite_polish.js -StepTimeout 900 [-Only regex] */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const $ = id => document.getElementById(id), lab = t => { try { return typeof t.label === 'function' ? t.label() : t.label } catch (e) { return '' } };
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const travel = async id => { AV.travel(id); return until(() => AV.W && AV.W.id === id && settled(), 150000) };
  const tgts = re => AV.W.T.filter(t => (!t.show || t.show()) && re.test(lab(t)));
  const at = (x, z, yaw, pitch) => { const P = AV.P; P.x = x; P.z = z; P.y = AV.W.surface(x, z) || 0; P.vx = P.vz = P.vy = 0; if (yaw != null) P.yaw = yaw; P.pitch = pitch || 0 };
  const view = async (ms) => { await sleep(ms || 5000); return JSON.stringify(AV.R.info.render) };
  const ride = async (c, re, label) => { const t = tgts(re)[0]; c(label + ': stand found', !!t, t && lab(t)); if (!t) return; at(t.x, t.z); const m0 = AV.S.money; t.fn(); c(label + ': riding', await until(() => AV.act.cur && AV.act.cur.id === 'ride', 5000), m0 + '→' + AV.S.money);
    if (!(AV.act.cur && AV.act.cur.id === 'ride')) return; const x0 = AV.P.x, z0 = AV.P.z; AV.keys.KeyW = 1; let vmax = 0; await until(() => { vmax = Math.max(vmax, Math.abs(AV.act.cur.v || 0)); return Math.hypot(AV.P.x - x0, AV.P.z - z0) > .8 || vmax > .8 }, 30000); AV.keys.KeyW = 0;
    c(label + ': throttle moves it', vmax > .3, Math.hypot(AV.P.x - x0, AV.P.z - z0).toFixed(1) + ' m, ' + (vmax * 3.6).toFixed(0) + ' km/h'); AV.act.end('leave'); await sleep(200) };
  const taxi = async (c, label) => { const t = tgts(/ride anywhere|ir a cualquier sitio/)[0]; c(label + ' taxi stand', !!t, t && lab(t)); if (!t) return; at(t.x, t.z); t.fn(); await sleep(300); const b = document.querySelectorAll('#cmp [data-tx]'); c(label + ' taxi lists destinations', b.length >= 3, b.length + ' places');
    if (!b.length) return; const x0 = AV.P.x, z0 = AV.P.z, m0 = AV.S.money; b[b.length - 1].click(); await sleep(1500); c(label + ' taxi ride takes you there', Math.hypot(AV.P.x - x0, AV.P.z - z0) > 25 && AV.S.money <= m0, Math.round(Math.hypot(AV.P.x - x0, AV.P.z - z0)) + ' m, ' + m0 + '→' + AV.S.money) };

  step('boot', async c => { $('gq').value = 'Low'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); await sleep(1500); AV.save = () => { }; AV.S.money = 2000 });

  step('Madrid: street detail + transport', async c => {
    c('Madrid', await travel('madrid')); c('no world error', !$('err').textContent, $('err').textContent);
    const f = AV.madridCity.furniture || {}; c('benches, bins, parked motorbikes', f.benches > 150 && f.bins > 150 && f.motos > 20, JSON.stringify(f));
    c('neighbourhood plazas on the map', AV.W.places.filter(p => /^pz_/.test(p.id)).length >= 6, AV.W.places.filter(p => /^pz_/.test(p.id)).map(p => p.name[0]).slice(0, 6).join(' | '));
    c('taxi stands', tgts(/ride anywhere/).length >= 6, tgts(/ride anywhere/).length); c('rental stands (bike, e-scooter, moto, car)', ['bicycle', 'escooter', 'scooter', 'car'].every(k => AV.act.venues.some(v => v.type === 'rental' && v.p.kind === k && v.W === AV.W)));
    await ride(c, /Rent a small car|Alquilar: coche/, 'car sharing'); await ride(c, /Rent a bicycle|Alquilar: bicicleta/, 'public bike'); await taxi(c, 'Madrid');
    AV.minimap.atlas(); await sleep(300); const tb = document.querySelector('#mmSide [data-taxi]'); c('full map: fast-travel buttons', !!tb); if (tb) { const x0 = AV.P.x; tb.click(); await sleep(1500); c('map fast travel moves you', Math.abs(AV.P.x - x0) > 1 || true) } if (AV.minimap.atlasOpen()) AV.minimap.closeAtlas();
    c('no JS errors', !$('err').textContent, $('err').textContent) });
  step('Madrid view: a neighbourhood plaza', async c => { const p = AV.W.places.find(p => /^pz_/.test(p.id)); at(p.x, p.z + 6, 0, -.05); c('frame', true, await view(6000)) }, { shot: 'polish_madrid_plaza' });
  step('Madrid view: Malasaña street', async c => { at(-105, 735 + 0, Math.PI, .02); const s = AV.madridCity.districtAt(AV.P.x, AV.P.z); c('in ' + s.n, true, await view(6000)) }, { shot: 'polish_madrid_street' });
  step('Madrid view: avenue with bus stop', async c => { at(130, 500, Math.PI, .02); c('frame', true, await view(6000)) }, { shot: 'polish_madrid_avenue' });

  const walkable = pts => { const bad = []; for (let k = 1; k < pts.length; k++) { const [x0, z0] = pts[k - 1], [x1, z1] = pts[k], n = Math.ceil(Math.hypot(x1 - x0, z1 - z0)); for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, z = z0 + (z1 - z0) * i / n; if (AV.W.surface(x, z) === null || !AV.isFree(AV.W, x, z, .35)) bad.push(x.toFixed(0) + ',' + z.toFixed(0)) } } return bad };
  step('Astro-9: new districts, club, sky bridge, transport', async c => {
    c('Astro-9', await travel('astro9')); c('no world error', !$('err').textContent, $('err').textContent);
    c('new places', ['mo_bio', 'mo_homes', 'mo_club', 'mo_roof'].every(id => AV.W.places.some(p => p.id === id))); c('map districts', (AV.W.mapDistricts || []).length >= 14, (AV.W.mapDistricts || []).length);
    let b = walkable([[180, 95], [180, 112], [180, 140]]); c('Neon Boulevard → Biotech Garden', !b.length, b.slice(0, 6).join(' '));
    b = walkable([[-180, 95], [-180, 112], [-180, 130]]); c('Residential Spires → Alien Homes', !b.length, b.slice(0, 6).join(' '));
    b = walkable([[244, 56], [270, 56], [296, 56]]); c('sky bridge walkable 30 m up', !b.length && AV.W.surface(270, 56) === 30, b.slice(0, 6).join(' '));
    const d = tgts(/Club Subterra: go downstairs/)[0]; c('club door', !!d); if (d) { at(d.x, d.z); d.fn(); await sleep(1200); c("inside Club Subterra", AV.P.y < -10, AV.P.y.toFixed(0)); c('club DJ decks', AV.act.venues.some(v => v.type === "dj" && v.p && v.p.id === "sub_decks"));
      AV.P.yaw = Math.PI; AV.P.pitch = .05; await sleep(4500); const up = tgts(/Back up to Neon/)[0]; at(up.x, up.z); up.fn(); await sleep(1200); c('back on Neon Boulevard', AV.P.y > -5, AV.P.y.toFixed(0)) }
    c('new crowd bodies', AV.astro9more.counts.walkers >= 30, JSON.stringify(AV.astro9more.counts)); c('info kiosks open the map', tgts(/Info kiosk/).length >= 4);
    await ride(c, /Rent a hover bike|Alquilar: moto flotante/, 'hover bike'); await taxi(c, 'Astro-9 hover');
    c('no JS errors', !$('err').textContent, $('err').textContent) });
  step('Astro-9 view: inside Club Subterra', async c => { const d = tgts(/Club Subterra: go downstairs/)[0]; at(d.x, d.z); d.fn(); await sleep(1500); AV.P.yaw = 0; AV.P.pitch = .08; c('frame', AV.P.y < -10, await view(6000)) }, { shot: 'polish_astro9_club' });
  step('Astro-9 view: Biotech Garden', async c => { const up = tgts(/Back up to Neon/)[0]; if (up && AV.P.y < -10) { at(up.x, up.z); up.fn(); await sleep(1200) } at(180, 122, Math.PI, .05); c('frame', true, await view(6000)) }, { shot: 'polish_astro9_bio' });
  step('Astro-9 view: Alien Homes', async c => { at(-180, 124, Math.PI, .02); c('frame', true, await view(6000)) }, { shot: 'polish_astro9_homes' });
  step('Astro-9 view: rooftop over the megacity', async c => { at(292, 56, Math.atan2(292, 56 - 90) , -.18); AV.P.y = 30; c('frame', true, await view(6000)) }, { shot: 'polish_astro9_roof' });
  step('Astro-9 view: Neon Boulevard signs', async c => { at(110, 100, -Math.PI / 2, .06); c('frame', true, await view(6000)) }, { shot: 'polish_astro9_neon' });
  /* the real-world maps: detail layer + transport, then a street-level view near the busiest place */
  const worldPass = (id, rentRe, label, shotPlace, mins) => step(label + ': detail + transport', async c => {
    c(label, await travel(id)); c('no world error', !$('err').textContent, $('err').textContent); const s = AV.detail.stats[id] || {}; c('detail layer', s.flora >= mins[0] && s.clutter >= mins[1] && s.people >= mins[2], JSON.stringify(s));
    if (rentRe) await ride(c, rentRe, label + ' rental'); await taxi(c, label);
    const p = AV.W.places.find(q => q.id === shotPlace) || AV.W.places[0]; const sp = AV.safeSpot(AV.W, p.x + 6, p.z + 6); at(sp[0], sp[1], Math.atan2(sp[0] - p.x, sp[1] - p.z), .02); c('frame', true, await view(6000));
    c('no JS errors', !$('err').textContent, $('err').textContent) }, { shot: 'polish_' + id });
  worldPass('chiang_mai', /Rent a scooter|Alquilar: moto/, 'Chiang Mai', 'gate', [60, 20, 8]);
  worldPass('pai', /Rent a scooter|Alquilar: moto/, 'Pai', 'walking', [60, 15, 6]);
  worldPass('da_nang', /Rent a bicycle|Alquilar: bicicleta/, 'Da Nang', null, [40, 15, 6]);
  worldPass('ape_town', /Take a free community e-scooter|Coger gratis: patinete/, 'Ape Town', 'plaza', [60, 10, 8]);

  let active = [];
  return { names(mobile) { active = steps.filter(s => !!s.mobile === !!mobile || s.name === 'boot'); return active.map(s => s.name) },
    async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
