/* APEVERSE - transit.js : Polish pass, transport across worlds.
   1) TAXI / SHUTTLE STANDS: a stand per world (Madrid taxis, Chiang Mai songthaews + tuk-tuks, Da Nang motorbike taxis, Pai minivans,
      Astro-9 hover-taxi pads, Koh Samui jeeps...). The stand opens a destination list (the world's places + named districts, nearest
      first, priced by distance). Pick one: a short ride (fade) and you step out there. The full map (J) also gets a 🚕 button per place
      in worlds that have taxis ("fast travel via the map"), which works from anywhere at a small surcharge.
   2) RENTAL STANDS for the rideable vehicles in js/vehicles.js (bicycle, scooter, e-scooter, tuk-tuk, small car, hover scooter, hover bike),
      placed next to named places of each world so they are always on walkable ground (AV.act rental type finds a free spot).
   Everything is configuration below; no new assets. */
'use strict';
(function (AV) {
const tr = AV.tr, L = (e, s) => [e, s], ACT = AV.act, say = a => Array.isArray(a) ? tr(a[0], a[1]) : String(a);
const TR = AV.transit = {};
/* per world: taxi stands (anchor = place id or 'arrival', dx/dz offset) and rentals */
const CFG = {
  madrid: { taxi: { icon: '🚕', n: L('Taxi', 'Taxi'), base: 4, per: .004, say: L('A white taxi with the red stripe pulls up. “¿Adónde vamos?”', 'Un taxi blanco con la franja roja para. “¿Adónde vamos?”') },
    stands: [['arrival', 8, 6], ['d_sol', 10, 0], ['d_retiro', -14, 0], ['d_malasana', 0, 10], ['d_lavapies', 0, -10], ['d_salamanca', 0, 10], ['d_moncloa', 10, 0], ['d_atocha', 0, -12], ['d_chamartin', 0, 10]],
    rent: [['parque', 0, 0, 'bicycle', 3, L('Public bikes', 'Bici pública'), 0xd8202a, [0xd8202a, 0xd8202a, 0xd8202a]], ['parque', 10, 6, 'escooter', 4, L('E-scooters', 'Patinetes eléctricos'), 0x3ad06a], ['d_sol', -10, 8, 'scooter', 12, L('Moto sharing', 'Motos compartidas'), 0x2a8ad8, [0xe8e4da, 0x2a8ad8, 0x1a1a1a]], ['d_retiro', -12, 12, 'bicycle', 3, L('Public bikes · Retiro', 'Bici pública · Retiro'), 0xd8202a, [0xd8202a, 0xd8202a, 0xd8202a]], ['d_malasana', 8, -8, 'escooter', 4, L('E-scooters', 'Patinetes eléctricos'), 0x3ad06a], ['d_chamartin', -10, 6, 'car', 25, L('Car sharing', 'Coche compartido'), 0x2a8ad8, [0xe8e4da, 0x2a8ad8, 0xc83a3a]], ['d_lavapies', 8, 8, 'bicycle', 3, L('Public bikes', 'Bici pública'), 0xd8202a, [0xd8202a, 0xd8202a, 0xd8202a]]] },
  astro9: { taxi: { icon: '🛸', n: L('Hover taxi', 'Taxi flotante'), base: 5, per: .02, say: L('A bubble cab drops from the traffic lane. The robot driver beeps: “DESTINATION, ORGANIC?”', 'Un taxi burbuja baja del carril aéreo. El robot conductor pita: “¿DESTINO, ORGÁNICO?”') },
    stands: [['plaza', 14, 14], ['mg_neon', 98, -10], ['mg_inn', 0, 6], ['mg_hangar', 8, 6], ['mg_temple', 0, -6], ['m2_ave', -5, 14]],
    rent: [['mg_neon', 115, 5.5, 'hoverbike', 18, L('Hover bike rental', 'Alquiler de motos flotantes'), 0xff4ad2, [0xff4ad2, 0x4ad8ff, 0xffd84a]], ['mg_inn', 10, 14, 'hover', 8, L('Hover scooters', 'Patinetes flotantes'), 0x4ad8ff, [0x4ad8ff, 0xff4ad2, 0x7aff8a]], ['st_hangar', 10, 34.5, 'hoverbike', 15, L('Hover Customs bike hire', 'Alquiler de motos de Hover Customs'), 0x4ad8ff, [0x4ad8ff, 0xff8a3a, 0x7aff8a]], ['st_kepler', -3, 8, 'hover', 6, L('Kepler Street scooters', 'Patinetes de la calle Kepler'), 0xffd84a, [0xffd84a, 0xff4ad2, 0x4ad8ff]]] },
  chiang_mai: { taxi: { icon: '🛺', n: L('Tuk-tuk / red songthaew', 'Tuk-tuk / songthaew rojo'), base: 8, per: .05, say: L('“Tuk-tuk? Good price, my friend!” The driver revs the engine.', '“¿Tuk-tuk? ¡Buen precio, amigo!” El conductor acelera el motor.') },
    stands: [['arrival', -6, 4], ['gate', 8, 6], ['bazaar', 0, 8], ['river', 6, 0]],
    rent: [['gate', -8, 8, 'scooter', 25, L('Scooter rental', 'Alquiler de motos'), 0xe86a1a, [0xe8e4da, 0x2a2a2a, 0xc83a3a]], ['bazaar', 10, 10, 'tuktuk', 40, L('Drive-it-yourself tuk-tuk', 'Tuk-tuk para conducir tú'), 0x2a9ad8, [0x2a9ad8, 0x3ab04a, 0xd8a020]]] },
  pai: { taxi: { icon: '🛻', n: L('Pickup taxi', 'Taxi pickup'), base: 6, per: .04, say: L('A pickup with benches in the back stops. “Hop on, sit anywhere.”', 'Para una pickup con bancos detrás. “Sube, siéntate donde quieras.”') },
    stands: [['walking', 6, 6], ['sunset', 6, 0]],
    rent: [['walking', -8, 10, 'scooter', 20, L('Pai scooter rental', 'Alquiler de motos de Pai'), 0x3ab04a, [0xe8e4da, 0x3ab04a, 0xd84a8a]], ['walking', 10, -8, 'bicycle', 8, L('Bicycle hire', 'Alquiler de bicis'), 0x2a6ad8]] },
  da_nang: { taxi: { icon: '🏍', n: L('Motorbike taxi (xe ôm)', 'Mototaxi (xe ôm)'), base: 5, per: .03, say: L('A rider in a green jacket hands you a helmet. “Đi đâu? Where you go?”', 'Un piloto con chaqueta verde te da un casco. “Đi đâu? ¿Adónde vas?”') },
    stands: [['arrival', -6, 6]], rent: [['arrival', 6, -10, 'bicycle', 10, L('Riverside bikes', 'Bicis del río'), 0x2a6ad8]] },
  ape_town: { taxi: { icon: '🚐', n: L('Ape Town shuttle (free)', 'Lanzadera de Ape Town (gratis)'), base: 0, per: 0, say: L('The little electric shuttle hums up. “All aboard the vibe bus!”', 'Llega zumbando la lanzadera eléctrica. “¡Todos al bus del buen rollo!”') },
    stands: [['arrival', 6, -6], ['falls', 6, 6], ['muria', 6, 6]], rent: [['plaza', 10, 10, 'escooter', 0, L('Free e-scooters', 'Patinetes gratis'), 0x7a4a9a, [0xffd84a, 0x7a4a9a, 0x3a9a5a]]] },
  koh_samui_jurassic: { taxi: { icon: '🚙', n: L('Ranger jeep', 'Jeep de guardas'), base: 6, per: .03, say: L('A ranger leans out: “Arms inside the jeep. The big ones bite.”', 'Un guarda se asoma: “Brazos dentro del jeep. Los grandes muerden.”') },
    stands: [['arrival', 6, 6]], rent: [['arrival', -8, 8, 'car', 20, L('Jeep hire', 'Alquiler de jeep'), 0x6a7a3a, [0x6a7a3a, 0xc8a04a, 0x3a5a3a]]] },
  vienna: { taxi: { icon: '🚕', n: L('Taxi', 'Taxi'), base: 5, per: .02, say: L('“Grüß Gott. Wohin?”', '“Grüß Gott. ¿Adónde?”') }, stands: [['arrival', -6, 6]], rent: [] },
  jungle_dub: { taxi: { icon: '🛶', n: L('River canoe ferry', 'Canoa del río'), base: 3, per: .03, say: L('A boatman taps the canoe. “Sit low, man. Easy ride.”', 'Un barquero golpea la canoa. “Siéntate abajo, man. Viaje tranquilo.”') }, stands: [['arrival', -6, 4]], rent: [] }
};
TR.CFG = CFG;
const anchor = (W, id) => { if (id === 'arrival') { const a = W.arrivals && (W.arrivals.default || W.arrivals[W.defaultArrival]); return a ? [a.x, a.z] : [AV.P.x, AV.P.z] } const p = (W.places || []).find(q => q.id === id); return p ? [p.x, p.z] : null };
const spot = (W, x, z) => { for (let d = 0; d < 16; d++) for (let k = 0; k < Math.max(1, d * 6); k++) { const a = k / Math.max(1, d * 6) * Math.PI * 2, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d; if (W.surface(px, pz) !== null && AV.isFree(W, px, pz, 1.2) && !(W.noStrangersAt && W.noStrangersAt(px, pz))) return [px, pz] } return null };
TR.has = () => !!(AV.W && CFG[AV.W.id]);
/* destinations: places + map districts, deduplicated, nearest first */
TR.dests = (W, x, z) => { const out = [], seen = new Set(); const add = (n, px, pz, ic) => { const k = Math.round(px / 8) + ',' + Math.round(pz / 8); if (seen.has(k) || W.surface(px, pz) === null && !AV.safeSpot) return; seen.add(k); out.push({ n, x: px, z: pz, ic, d: Math.hypot(px - x, pz - z) }) };
  (W.mapDistricts || []).forEach(d => add(d.name, d.x, d.z, '🏙'));
  (W.places || []).forEach(p => { if (p.hidden || /home|flat|metro_car|carriage/.test(p.id)) return; add(say(p.name), p.x, p.z, '📍') });
  return out.filter(r => r.d > 25).sort((a, b) => a.d - b.d) };
TR.price = (c, d, sur) => c.base || c.per ? Math.round(c.base + d * c.per + (sur || 0)) : 0;
TR.go = function (x, z, name, price) {
  const W = AV.W; if (!W) return false; if (price && !AV.txn(-price, 'Taxi: ' + name)) return false;
  if (ACT.cur) ACT.end('leave'); AV.closePanel && AV.closePanel('cmp');
  const c = CFG[W.id] || {}, P = AV.P, s = AV.safeSpot ? AV.safeSpot(W, x, z) : [x, z]; AV.fadeTo(1, 450);
  setTimeout(() => { P.x = s[0]; P.z = s[1]; P.y = W.surface(s[0], s[1]) || 0; P.vx = P.vz = P.vy = 0; AV.S.time = Math.min(24 * 60 - 1, AV.S.time + 6); AV.hud(); AV.fadeTo(0, 700);
    AV.toast((c.taxi ? c.taxi.icon : '🚕') + ' ' + tr('You arrive at ', 'Llegas a ') + name + (price ? ' · ' + price + tr(' credits', ' créditos') : '')) }, 500);
  TR.rides = (TR.rides || 0) + 1; return true };
TR.menu = function (from) {
  const W = AV.W, c = CFG[W.id]; if (!c) return; const P = AV.P, rows = TR.dests(W, P.x, P.z).slice(0, 40); TR._rows = rows;
  const p = AV.panel('cmp', '<b>' + c.taxi.icon + ' ' + say(c.taxi.n) + '</b> · ' + tr('Credits', 'Créditos') + ': ' + AV.S.money + '<div class="note">' + say(c.taxi.say) + '</div><div class="bgrid">' +
    rows.map((r, i) => '<div class="bitem"><div class="bic">' + r.ic + '</div><div class="bnm">' + r.n + ' <small>' + (r.d > 999 ? (r.d / 1000).toFixed(1) + ' km' : Math.round(r.d) + ' m') + '</small></div><div class="bbt"><button data-tx="' + i + '">' + (TR.price(c.taxi, r.d) ? TR.price(c.taxi, r.d) + ' ¢' : tr('Free', 'Gratis')) + '</button></div></div>').join('') + '</div><div class="row"><button data-close>' + tr('Walk instead', 'Mejor andar') + '</button></div>');
  p.querySelectorAll('[data-tx]').forEach(b => b.onclick = () => { const r = rows[+b.dataset.tx]; TR.go(r.x, r.z, r.n, TR.price(c.taxi, r.d)) }) };
/* from the full map: same ride, +3 credits for calling it to you */
TR.fromMap = (x, z, name) => { const W = AV.W, c = CFG[W.id]; if (!c) return false; const d = Math.hypot(AV.P.x - x, AV.P.z - z); if (AV.minimap && AV.minimap.closeAtlas) AV.minimap.closeAtlas(); return TR.go(x, z, name, TR.price(c.taxi, d, c.taxi.base ? 3 : 0)) };
/* sign + stand mesh: a pole with the stand's icon on a lit box, a bench */
function stand(W, x, z, c) {
  const g = new THREE.Group(), col = W.id === 'astro9' ? 0x4ad8ff : W.id === 'madrid' ? 0x2a8a3a : 0xffd84a;
  const pole = new THREE.Mesh(AV.G.box, AV.std(0x3a3a3e, .6)); pole.scale.set(.1, 3, .1); pole.position.set(0, 1.5, 0); g.add(pole);
  const box = new THREE.Mesh(AV.G.box, AV.std(col, .4, 0, col, .6)); box.scale.set(.9, .5, .12); box.position.set(0, 3.1, 0); g.add(box);
  if (W.id === 'astro9') { const pad = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, .06, 32), AV.std(0x1a1a2a, .3, .5, 0x4ad8ff, .5)); pad.position.set(2.6, .03, 0); g.add(pad) }
  else { const b = new THREE.Mesh(AV.G.box, AV.std(0x6a5a4a, .7)); b.scale.set(1.6, .08, .45); b.position.set(1.4, .45, 0); g.add(b) }
  g.position.set(x, W.surface(x, z) || 0, z); AV.lin && AV.lin(g); W.group.add(g); W.circles.push([x, z, .3]);
  W.ctx && W.ctx.sign && W.ctx.sign(c.taxi.icon + ' ' + say(c.taxi.n).toUpperCase(), x, (W.surface(x, z) || 0) + 3.8, z, 0, 3.6, '#' + col.toString(16).padStart(6, '0'), {});
  const T = { x, z, r: 2.6, label: () => c.taxi.icon + ' ' + say(c.taxi.n) + tr(': ride anywhere in the city', ': ir a cualquier sitio'), fn: () => TR.menu(), show: () => !ACT.cur || ACT.cur.id === 'ride', kind: 'taxi' };
  W.T.push(T); (W._taxis = W._taxis || []).push({ x, z }); return T }
const prevE = AV.onWorldEnter; AV.onWorldEnter = function (W) { if (prevE) prevE(W); if (!W || W.__transit) return; W.__transit = true; const c = CFG[W.id]; if (!c) return;
  for (const [id, dx, dz] of c.stands || []) { const a = anchor(W, id); if (!a) continue; const s = spot(W, a[0] + dx, a[1] + dz); if (s) try { stand(W, s[0], s[1], c) } catch (e) { console.warn('taxi stand failed', e) } }
  (c.rent || []).forEach(([id, dx, dz, kind, price, name, col, cols], i) => { const a = anchor(W, id); if (!a) return; try { ACT.place(W, { type: 'rental', id: W.id + '_tr' + i, kind, x: a[0] + dx, z: a[1] + dz, ry: 0, price, name, col, cols }) } catch (e) { console.warn('rental failed', e) } }) };
})(window.AV);
