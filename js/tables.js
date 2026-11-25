/* APEVERSE 2.0 - tables.js : M12 consumables, table service.  Sit down, order from a real menu, the food arrives on your table,
   eat / drink it there.  Venues: Bar La Esquina terrace (Madrid, tapas), Firefly Beach Bar (Koh Tao, Thai), Rainny Café (Pai).
   - Tables are placed on free ground near the venue, clear of walkways (city walking graph) and carriageways.
   - Sitting: you take a chair (camera at seated height, facing the table); walking away stands you up.
   - Orders are paid when ordered; a dish arrives after a few seconds (plate / bowl / glass on the table) and is eaten or drunk
     at the table: energy + vibe (AV.vitals), drinks with alcohol go through AV.fx (fictional, gradual, safe-by-default visuals).
   - Responsible service: after 3 alcoholic drinks in 2 game hours the waiter suggests water; above the limit they stop serving
     alcohol.  Water helps you sober up a little.  No smoking on menus.
   - A friend (M11 resident, friendship >= 10) sitting with you or standing next to the table shares the first dish: +2 friendship
     once a day.
   Save: optional S.tables = { orders: n, alc: [abs minutes] }.  AV.tables */
'use strict';
(function (AV) {
const tr = AV.tr, L = (e, s) => [e, s], say = a => tr(a[0], a[1]);
const TB = AV.tables = { live: [], seat: null, stats: { orders: 0, eaten: 0, refused: 0 } };
const F = (id, n, price, kind, vit, col, o) => Object.assign({ id, n, price, kind, vit, col }, o || {});
const VENUES = TB.VENUES = {
  madrid: { place: 'esquina', n: L('Bar La Esquina terrace', 'Terraza del Bar La Esquina'), waiter: L('Paco', 'Paco'), menu: [
    F('bravas', L('Patatas bravas', 'Patatas bravas'), 6, 'food', [8, 4], 0xe8a83a), F('tortilla', L('Tortilla española', 'Tortilla española'), 7, 'food', [12, 3], 0xf0d070), F('croquetas', L('Ham croquetas', 'Croquetas de jamón'), 8, 'food', [9, 5], 0xc8843a),
    F('padron', L('Pimientos de Padrón', 'Pimientos de Padrón'), 7, 'food', [5, 6], 0x3a9a3a), F('cana', L('Caña (small beer)', 'Caña'), 3, 'alc', [1, 4], 0xf0c040, { fx: .16 }), F('tinto', L('Tinto de verano', 'Tinto de verano'), 4, 'alc', [1, 5], 0x9a2a3a, { fx: .18 }),
    F('vermut', L('Vermouth on tap', 'Vermut de grifo'), 4, 'alc', [1, 5], 0x7a2a1a, { fx: .2 }), F('agua', L('Sparkling water', 'Agua con gas'), 2, 'water', [3, 1], 0xd8f0ff), F('cafe', L('Café con leche', 'Café con leche'), 2, 'drink', [10, 2], 0xa8784a, { buzz: .25 }) ] },
  koh_tao: { place: 'firefly', n: L('Firefly Beach Bar tables', 'Mesas del Firefly Beach Bar'), waiter: L('Noi', 'Noi'), menu: [
    F('padthai', L('Pad thai', 'Pad thai'), 12, 'food', [14, 4], 0xe8b860), F('green', L('Green curry + rice', 'Curry verde con arroz'), 14, 'food', [15, 4], 0x8ac84a), F('massaman', L('Massaman curry', 'Curry massaman'), 14, 'food', [15, 5], 0xc8783a),
    F('mango', L('Mango sticky rice', 'Arroz glutinoso con mango'), 10, 'food', [9, 7], 0xffc83a), F('coconut', L('Fresh coconut', 'Coco fresco'), 6, 'drink', [6, 4], 0xf0f0e0), F('shake', L('Fruit shake', 'Batido de fruta'), 8, 'drink', [6, 5], 0xff8aa8),
    F('lager', L('Thai lager', 'Cerveza tailandesa'), 7, 'alc', [1, 5], 0xf0c848, { fx: .2 }), F('punch', L('Island rum punch', 'Ponche de ron de la isla'), 9, 'alc', [1, 6], 0xff7a3a, { fx: .3 }), F('water', L('Bottle of water', 'Botella de agua'), 2, 'water', [3, 1], 0xd8f0ff) ] },
  pai: { place: 'rainny', n: L('Rainny Café tables', 'Mesas del Rainny Café'), waiter: L('Fon', 'Fon'), menu: [
    F('khaosoi', L('Khao soi', 'Khao soi'), 10, 'food', [15, 5], 0xe8a040), F('avotoast', L('Avocado toast', 'Tostada de aguacate'), 12, 'food', [11, 4], 0x8ab84a), F('roti', L('Banana roti', 'Roti de plátano'), 6, 'food', [8, 6], 0xf0d898),
    F('coffee', L('Mountain coffee', 'Café de montaña'), 5, 'drink', [10, 3], 0x6a4a2a, { buzz: .3 }), F('milktea', L('Thai milk tea', 'Té con leche tailandés'), 5, 'drink', [6, 5], 0xf0a050), F('smoothie', L('Mango smoothie', 'Batido de mango'), 7, 'drink', [7, 5], 0xffc040), F('water', L('Water', 'Agua'), 1, 'water', [3, 1], 0xd8f0ff) ] } };
const st = () => { const S = AV.S; S.tables = S.tables || { orders: 0, alc: [] }; return S.tables };
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

/* ---------- placement: free ground, clear of walkways + roads ---------- */
const segD = (px, pz, ax, az, bx, bz) => { const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / l2)); return Math.hypot(px - ax - dx * t, pz - az - dz * t) };
function clearOfPaths(W, x, z) { const N = W.mapNav; if (N && N.links) for (let i = 0; i < N.nodes.length; i++) { const a = N.nodes[i]; if (Math.abs(a[0] - x) > 40 || Math.abs(a[1] - z) > 40) continue; for (const j of N.links[i]) { if (j < i) continue; const b = N.nodes[j]; if (segD(x, z, a[0], a[1], b[0], b[1]) < 2.2) return false } }
  for (const r of W.mapRoads || []) if (segD(x, z, r[0], r[1], r[2], r[3]) < (r[4] || 6) / 2 + 1.6) return false;
  for (const cr of (W.ctx && W.ctx.crowds) || []) { const nv = cr.nav; if (!nv || !nv.links) continue; for (let i = 0; i < nv.nodes.length; i++) { const a = nv.nodes[i]; if (Math.abs(a[0] - x) > 30 || Math.abs(a[1] - z) > 30) continue; for (const j of nv.links[i]) { const b = nv.nodes[j]; if (segD(x, z, a[0], a[1], b[0], b[1]) < 1.6) return false } } }
  return true }
function findSpot(W, x, z) { for (let d = 1; d < 22; d += .75) for (let k = 0; k < 20; k++) { const a = k / 20 * Math.PI * 2, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d; const y = W.surface(px, pz); if (y == null) continue;
  if (!AV.isFree(W, px, pz, 1.7) || W.T.some(t => Math.hypot(t.x - px, t.z - pz) < (t.r || 1) + 1.2) || !clearOfPaths(W, px, pz)) continue; let flat = true; for (const [ox, oz] of [[1.2, 0], [-1.2, 0], [0, 1.2], [0, -1.2]]) { const yy = W.surface(px + ox, pz + oz); if (yy == null || Math.abs(yy - y) > .25) flat = false } if (flat) return [px, pz, y] } return null }
function build(W, V) { const P = (W.places || []).find(p => p.id === V.place); if (!P) return null; const sp = findSpot(W, P.x, P.z); if (!sp) { TB.stats.noSpot = V.place; return null } const [x, z, y] = sp, g = new THREE.Group(); g.position.set(x, y, z);
  const M = (geo, col, px, py, pz, sx, sy, sz) => { const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: col, roughness: .6 })); m.position.set(px, py, pz); m.scale.set(sx, sy, sz); m.castShadow = true; g.add(m); return m };
  const cyl = new THREE.CylinderGeometry(1, 1, 1, 18), box = new THREE.BoxGeometry(1, 1, 1);
  M(cyl, 0xf0ece0, 0, .74, 0, .55, .04, .55); M(cyl, 0x3a3a3a, 0, .37, 0, .05, .74, .05); M(cyl, 0x3a3a3a, 0, .02, 0, .3, .03, .3);
  const chairs = [[-1, 0], [1, 0]].map(([s]) => { const cx = s * .95; M(box, 0x8a5a2a, cx, .45, 0, .45, .05, .45); M(box, 0x8a5a2a, cx + s * .22, .75, 0, .05, .6, .45); for (const lx of [-.18, .18]) for (const lz of [-.18, .18]) M(box, 0x5a3a1a, cx + lx, .22, lz, .04, .44, .04); return { x: x + cx, z } });
  W.ctx.group.add(g); W.ctx.circles.push([x, z, .65]);
  const T = { x: x - 1.6, z, r: 1.9, show: () => !TB.seat && !(AV.act && AV.act.cur), label: () => '🍽️ ' + say(V.n) + tr(': sit + order', ': sentarse y pedir'), fn: () => TB.sit(t) }; W.T.push(T);
  const t = { W, V, g, x, z, y, chairs, T, dishes: [] }; return t }

/* ---------- sit, order, eat ---------- */
const hr = () => AV.S.time / 60;
function alcRecent() { const s = st(), now = AV.abs(); s.alc = s.alc.filter(a => now - a < 120); return s.alc.length }
TB.sit = function (t) { if (TB.seat) return; const P = AV.P, c = t.chairs[0]; P.x = c.x; P.z = c.z; P.vx = P.vz = 0; P.yaw = Math.atan2(c.x - t.x, c.z - t.z); P.pitch = -.22; TB.seat = { t, x: c.x, z: c.z }; TB.panel(); TB.stats.sits = (TB.stats.sits || 0) + 1 };
TB.stand = function () { if (!TB.seat) return; TB.seat = null; AV.closePanel && document.getElementById('cmp').style.display !== 'none' && AV.closePanel('cmp') };
function friendNear(t) { const PE = AV.people; if (!PE || !PE.list) return null; return PE.list.find(p => { const m = PE.mem(p.id); return m.f >= 10 && Math.hypot(p.x - t.x, p.z - t.z) < 5 }) || null }
TB.order = function (id) { const s = TB.seat; if (!s) return false; const d = s.t.V.menu.find(m => m.id === id); if (!d) return false;
  if (d.kind === 'alc' && (AV.fx && AV.fx.raw('drink') > .8)) { TB.stats.refused++; TB.msg = tr(say(s.t.V.waiter) + ': “I think that’s enough for tonight. Water is on the house.”', say(s.t.V.waiter) + ': “Creo que por hoy ya está. El agua invita la casa.”'); const w = s.t.V.menu.find(m => m.kind === 'water'); if (w) serve(s.t, w, true); TB.panel(); return false }
  if (!AV.txn(-d.price, say(s.t.V.n) + ': ' + say(d.n))) { TB.msg = tr('Not enough credits.', 'No tienes créditos suficientes.'); TB.panel(); return false }
  const so = st(); so.orders++; TB.stats.orders++; if (d.kind === 'alc') so.alc.push(AV.abs());
  TB.msg = d.kind === 'alc' && alcRecent() >= 3 ? tr(say(s.t.V.waiter) + ': “Coming up. Maybe a water with it?”', say(s.t.V.waiter) + ': “Marchando. ¿Y un agua para acompañar?”') : tr(say(s.t.V.waiter) + ': “Coming right up.”', say(s.t.V.waiter) + ': “¡Marchando!”');
  setTimeout(() => serve(s.t, d), TB.fast ? 200 : 4000); AV.save(); TB.panel(); return true };
function serve(t, d, free) { const g = new THREE.Group(), n = t.dishes.length, ang = n * 1.9; g.position.set(Math.cos(ang) * .25, .77, Math.sin(ang) * .25);
  const glass = d.kind !== 'food', m = (geo, col, y, s) => { const o = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: col, roughness: glass ? .2 : .7, transparent: glass && col === 0xd8f0ff, opacity: .8 })); o.position.y = y; o.scale.set(s[0], s[1], s[2]); g.add(o); return o };
  if (glass) { m(new THREE.CylinderGeometry(1, .85, 1, 14), 0xeaf4ff, .07, [.045, .15, .045]); m(new THREE.CylinderGeometry(1, .85, 1, 14), d.col, .06, [.04, .11, .04]) } else { m(new THREE.CylinderGeometry(1, 1, 1, 20), 0xffffff, .01, [.14, .02, .14]); m(new THREE.SphereGeometry(1, 12, 8), d.col, .04, [.1, .045, .1]) }
  t.g.add(g); t.dishes.push({ d, g, free }); TB.stats.served = (TB.stats.served || 0) + 1; if (TB.seat && TB.seat.t === t) { TB.msg = '🍽️ ' + say(d.n) + tr(' is here.', ' ya está aquí.'); TB.panel() } }
TB.consume = function (i) { const s = TB.seat; if (!s) return false; const dish = s.t.dishes[i]; if (!dish || dish.eating) return false; dish.eating = AV.now(); const d = dish.d;
  setTimeout(() => { dish.g.parent && dish.g.parent.remove(dish.g); s.t.dishes.splice(s.t.dishes.indexOf(dish), 1); AV.vitals && AV.vitals.add(d.vit[0], d.vit[1]); if (AV.fx) { if (d.fx) AV.fx.add('drink', d.fx); if (d.buzz) AV.fx.add('buzz', d.buzz); if (d.kind === 'water') AV.fx.add('sober', .3) }
    TB.stats.eaten++; const fr = friendNear(s.t), m = fr && AV.people.mem(fr.id), day = AV.S.day; let extra = ''; if (fr && d.kind === 'food' && m.sharedDay !== day) { m.sharedDay = day; m.f = Math.min(100, m.f + 2); extra = ' ' + tr(fr.r.n + ' steals a bite. +friendship', fr.r.n + ' te roba un bocado. +amistad'); TB.stats.shared = (TB.stats.shared || 0) + 1 }
    TB.msg = (d.kind === 'food' ? tr('Delicious. ', 'Delicioso. ') : tr('Refreshing. ', 'Refrescante. ')) + say(d.n) + ' ✓' + extra; AV.save(); if (TB.seat) TB.panel() }, TB.fast ? 150 : 2200); TB.panel(); return true };
TB.panel = function () { const s = TB.seat; if (!s) return; const V = s.t.V, n = alcRecent();
  let h = '<b>🍽️ ' + esc(say(V.n)) + '</b> · ' + tr('waiter: ', 'camarero: ') + esc(say(V.waiter)) + ' · ' + tr('credits ', 'créditos ') + AV.S.money + (TB.msg ? '<div class="note">' + esc(TB.msg) + '</div>' : '') + '<div style="display:grid;grid-template-columns:1fr auto auto;gap:3px 10px;align-items:center;margin:6px 0">';
  for (const d of V.menu) h += '<div>' + (d.kind === 'food' ? '🍲 ' : d.kind === 'alc' ? '🍺 ' : d.kind === 'water' ? '💧 ' : '🥤 ') + esc(say(d.n)) + ' <small style="opacity:.7">' + (d.kind === 'alc' ? tr('alcohol', 'alcohol') : d.buzz ? tr('caffeine', 'cafeína') : d.kind === 'water' ? tr('clears your head', 'despeja') : '+' + d.vit[0] + ' ' + tr('energy', 'energía')) + '</small></div><div style="text-align:right">' + d.price + ' ¢</div><div><button data-o="' + d.id + '">' + tr('Order', 'Pedir') + '</button></div>';
  h += '</div>'; if (s.t.dishes.length) h += '<div class="note"><b>' + tr('On your table', 'En tu mesa') + '</b></div><div class="row" style="flex-wrap:wrap;gap:6px">' + s.t.dishes.map((x, i) => '<button data-c="' + i + '"' + (x.eating ? ' disabled' : '') + '>' + (x.d.kind === 'food' ? tr('Eat ', 'Comer ') : tr('Drink ', 'Beber ')) + esc(say(x.d.n)) + '</button>').join('') + '</div>';
  h += (n >= 3 ? '<div class="note">' + tr('You have had ' + n + ' drinks recently. No driving tonight: walk or take a taxi.', 'Llevas ' + n + ' copas. Hoy nada de conducir: camina o coge un taxi.') + '</div>' : '') + '<div class="row"><button data-up>' + tr('Stand up', 'Levantarse') + '</button></div>';
  const p = AV.panel('cmp', h); p.querySelectorAll('[data-o]').forEach(b => b.onclick = () => TB.order(b.dataset.o)); p.querySelectorAll('[data-c]').forEach(b => b.onclick = () => TB.consume(+b.dataset.c)); const u = p.querySelector('[data-up]'); if (u) u.onclick = () => TB.stand() };
/* seated camera + standing up when you walk away */
AV.frameFns.push(() => { const s = TB.seat; if (!s) return; const P = AV.P; if (Math.hypot(P.x - s.x, P.z - s.z) > .8) { TB.seat = null; return } AV.cam.position.y -= .5 });

/* ---------- world hooks ---------- */
const prevEnter = AV.onWorldEnter; AV.onWorldEnter = function (W) { if (prevEnter) prevEnter(W); TB.live = []; TB.seat = null; TB.msg = ''; const V = W && VENUES[W.id]; if (!V || !W.ctx) return;
  try { const t = build(W, V); if (t) TB.live.push(t); TB.stats.placed = TB.live.length } catch (e) { console.warn('tables failed', e); TB.stats.err = String(e) } };
})(window.AV);
/* APEVERSE 2.0 - M12: no impaired driving.  With alcohol / smoke / psychedelic doses above a low threshold (raw dose, not the
   visual slider) you cannot start a vehicle; if it builds up while you ride, you pull over and the vehicle stays parked.
   Drinking or smoking while riding is refused.  Walking, taxis and transit always work. */
(function (AV) {
const tr = AV.tr, ACT = AV.act; if (!ACT || !AV.fx) return;
const msg = () => tr('You are in no state to drive. Walk it off, or take a taxi (taxi stands + the map).', 'No estás en condiciones de conducir. Camina un rato o coge un taxi (paradas de taxi + el mapa).');
const s0 = ACT.start; ACT.start = function (id, opt) { if (id === 'ride' && AV.fx.impaired && AV.fx.impaired()) { AV.toast('🚫 ' + msg()); AV.tables.stats.blockedRides = (AV.tables.stats.blockedRides || 0) + 1; return false } return s0.apply(this, arguments) };
AV.frameFns.push(() => { const c = ACT.cur; if (c && c.id === 'ride' && AV.fx.impaired && AV.fx.impaired()) { ACT.end('leave'); AV.toast('🚫 ' + tr('You pull over and park. ', 'Te detienes y aparcas. ') + msg()); AV.tables.stats.pulledOver = (AV.tables.stats.pulledOver || 0) + 1 } });
const u0 = AV.bag && AV.bag.use; if (u0) AV.bag.use = function (id) { const d = AV.ITEMS[id] || {}; if (ACT.cur && ACT.cur.id === 'ride' && (d.fx || d.use === 'smoke' || d.use === 'alien')) { AV.toast('🚫 ' + tr('Not while driving.', 'Mientras conduces, no.')); return } return u0.apply(this, arguments) };
})(window.AV);
