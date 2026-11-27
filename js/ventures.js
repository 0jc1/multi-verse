/* APEVERSE 2.2 (Agent 3) - ventures.js : Business Empire. A reusable business framework next to the M9 clothing shop (business.js,
   untouched). Every business is a real place you walk into, and every category has its OWN loop in the 3D world:
     café        customers queue at your counter with an order bubble → you pick the right drink / cake (or your barista does) → they sit,
                 leave a dirty table → you clean it. Needs an espresso machine, beans, milk, pastries.
     bar         same counter, but beers are POURED (stop the tap in the green), cocktails need the station; tipsy customers can be
                 offered water or refused (responsible service keeps your licence and reputation); a sound system brings the night crowd.
     farm        (virtual cultivation, fictional) planters you plant, water, tend and harvest; plants grow through visible stages;
                 the harvest stocks your farm stand where customers buy, or fills contract missions. Alien crops on Astro-9.
     delivery    a courier depot: take a job, carry the parcel to a place on the map (GPS) before the timer runs out, get paid;
                 hire couriers and a cargo bike for more.
   The shared loop: find a listing (sign at a building front) → lease or buy → step inside → buy equipment → stock supplies → set prices
   (bounded 50–200 %) → hire staff → open → serve visible customers → earn → pay wages + utilities each day → upgrade equipment, staff and
   décor → watch sales + reputation (Manage panel, ApePhone 💼 Business) → sell the premises or expand to another city.
   Honest economy: trade happens only while the game clock runs; away from the business only staff trade, capped at 24 game hours.
   Save: optional S.vent = { <listingId>: record }. API: AV.vent = { LIST, CATS, acquire, buy, sell, equip, supply, price, hire, fire, deco,
   setOpen, panel, serve, plot, harvest, job, stats, _ff } */
'use strict';
(function (AV) {
const tr = AV.tr, L = (e, s) => [e, s], say = a => Array.isArray(a) ? tr(a[0], a[1]) : String(a);
const VT = AV.vent = { stats: { served: 0, walkins: 0, wrong: 0, left: 0, pours: 0, cleaned: 0, planted: 0, harvested: 0, delivered: 0, staffServed: 0, refused: 0 }, live: null };
const fam = () => !!(AV.family && AV.family.on());
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const snd = (n, o) => AV.snd && AV.snd.fx && AV.snd.fx(n, o);

/* ======================= categories ======================= */
const CATS = VT.CATS = {
  cafe: { n: L('Café', 'Cafetería'), ic: '☕', open: 8, close: 20,
    menu: { espresso: { n: L('Espresso', 'Café solo'), ic: '☕', p: 4, need: { beans: 1 }, eq: 'machine' }, latte: { n: L('Latte', 'Café con leche'), ic: '🥛', p: 5, need: { beans: 1, milk: 1 }, eq: 'machine' },
      cake: { n: L('Banana cake', 'Bizcocho de plátano'), ic: '🍰', p: 6, need: { pastry: 1 } }, smoothie: { n: L('Mango smoothie', 'Batido de mango'), ic: '🥭', p: 7, need: { fruit: 1 }, eq: 'juicer' } },
    supplies: { beans: [L('Coffee beans', 'Café en grano'), 10, 30], milk: [L('Milk', 'Leche'), 10, 18], pastry: [L('Pastries', 'Bollería'), 6, 24], fruit: [L('Fruit', 'Fruta'), 8, 24] },
    equip: { machine: [L('Espresso machine', 'Cafetera espresso'), 600], juicer: [L('Juice press', 'Exprimidora'), 350], tables: [L('Two more tables', 'Dos mesas más'), 250, 2], grinder: [L('Pro grinder (barista serves faster)', 'Molinillo pro (el barista sirve más rápido)'), 300] },
    staff: { barista: [L('Barista', 'Barista'), 45], cleaner: [L('Cleaner', 'Limpiador/a'), 30] }, foot: 1 },
  bar: { n: L('Bar', 'Bar'), ic: '🍺', open: 17, close: 26,
    menu: { beer: { n: L('Draught beer', 'Caña'), ic: '🍺', p: 6, need: { keg: 1 }, eq: 'taps', pour: 1, adult: 1 }, mojito: { n: L('Mojito', 'Mojito'), ic: '🍹', p: 9, need: { rum: 1, mint: 1 }, eq: 'station', adult: 1 },
      sunset: { n: L('Ape Sunset', 'Ape Sunset'), ic: '🍸', p: 10, need: { rum: 1, juice: 1 }, eq: 'station', adult: 1 }, soda: { n: L('Ape Cola', 'Ape Cola'), ic: '🥤', p: 3, need: { cola: 1 } }, water: { n: L('Water (free)', 'Agua (gratis)'), ic: '💧', p: 0, need: {} },
      mocktail: { n: L('Virgin colada', 'Colada sin alcohol'), ic: '🍍', p: 6, need: { juice: 1 }, eq: 'station' } },
    supplies: { keg: [L('Beer keg (servings)', 'Barril (raciones)'), 20, 60], rum: [L('Rum', 'Ron'), 10, 50], mint: [L('Mint + lime', 'Menta y lima'), 10, 15], juice: [L('Juices', 'Zumos'), 10, 20], cola: [L('Cola crates', 'Cajas de cola'), 12, 18] },
    equip: { taps: [L('Beer taps', 'Tiradores'), 700], station: [L('Cocktail station', 'Estación de cócteles'), 500], sound: [L('Sound system (night crowd +40 %)', 'Equipo de sonido (+40 % de noche)'), 600], tables: [L('Two more tables', 'Dos mesas más'), 250, 2] },
    staff: { bartender: [L('Bartender', 'Camarero/a'), 55], door: [L('Door host (no trouble)', 'Portero/a (sin problemas)'), 40] }, foot: 1.1 },
  farm: { n: L('Farm (virtual cultivation)', 'Granja (cultivo virtual)'), ic: '🌱', open: 9, close: 19,
    equip: { drip: [L('Drip irrigation (auto water)', 'Riego por goteo (riega solo)'), 400], lights: [L('Grow lights (faster growth)', 'Luces de cultivo (crece más rápido)'), 500], trim: [L('Trimming table (pouches → pre-rolls)', 'Mesa de manicura (bolsitas → porros)'), 300], beds: [L('Four more planters', 'Cuatro jardineras más'), 600, 4] },
    staff: { grower: [L('Grower (waters + harvests)', 'Cultivador/a (riega y cosecha)'), 40], seller: [L('Stand seller', 'Vendedor/a del puesto'), 30] }, foot: .7 },
  hostel: { n: L('Hostel', 'Hostal'), ic: '🛏️', open: 8, close: 24,
    menu: { dorm: { n: L('Dorm bed (per night)', 'Cama en dormitorio (por noche)'), ic: '🛏️', p: 18, need: {} }, private: { n: L('Private room (per night)', 'Habitación privada (por noche)'), ic: '🚪', p: 40, need: {} } },
    supplies: { linen: [L('Clean linen sets', 'Juegos de sábanas limpias'), 10, 25] },
    equip: { rooms: [L('Two more rooms', 'Dos habitaciones más'), 700, 2], lockers: [L('Guest lockers (+reputation)', 'Taquillas (+reputación)'), 250], breakfast: [L('Breakfast corner (+6 per guest night)', 'Rincón de desayuno (+6 por huésped y noche)'), 400] },
    staff: { receptionist: [L('Receptionist (checks guests in)', 'Recepcionista (registra huéspedes)'), 40], housekeeper: [L('Housekeeper (cleans rooms)', 'Limpieza (limpia habitaciones)'), 35] }, foot: .8 },
  delivery: { n: L('Courier depot', 'Mensajería'), ic: '📦', open: 8, close: 22,
    equip: { cargo: [L('Cargo bike (2 parcels per run)', 'Bici de carga (2 paquetes por viaje)'), 450], board: [L('Priority job board (better pay)', 'Tablón prioritario (mejor paga)'), 300] },
    staff: { courier: [L('Courier', 'Mensajero/a'), 35] }, foot: 0 }
};
/* crops: fictional, abstract (hours of game time, no real-world growing details) */
const CROPS = VT.CROPS = {
  mango_haze: { n: L('Mellow Mango (fictional herb)', 'Mellow Mango (hierba ficticia)'), ic: '🌿', seed: 20, hrs: 10, yield: [2, 4], item: 'herb', price: 30, col: 0x5aa83a, bud: 0xc8a84a, adult: 1 },
  lotus_dream: { n: L('Lotus Dream (fictional herb)', 'Lotus Dream (hierba ficticia)'), ic: '🌸', seed: 30, hrs: 14, yield: [3, 5], item: 'herb', price: 34, col: 0x3a9a5a, bud: 0xd88ac8, adult: 1 },
  strawberry: { n: L('Pai strawberries', 'Fresas de Pai'), ic: '🍓', seed: 8, hrs: 6, yield: [3, 6], item: 'strawberries', price: 9, col: 0x4ab84a, bud: 0xe82a3a },
  float_fruit: { n: L('Float fruit (alien)', 'Fruta flotante (alien)'), ic: '🫐', seed: 15, hrs: 8, yield: [2, 4], item: 'float_fruit', price: 22, col: 0x3a7ad8, bud: 0x7ab8ff, alien: 1 },
  zephyr_pod: { n: L('Zephyr pod vine (alien)', 'Vaina céfiro (alien)'), ic: '🌬️', seed: 15, hrs: 9, yield: [2, 4], item: 'zephyr_pod', price: 22, col: 0xa8c84a, bud: 0xf4f0a0, alien: 1 },
  moon_berry: { n: L('Moon-berry bush (alien)', 'Arbusto de bayas lunares (alien)'), ic: '🫐', seed: 10, hrs: 7, yield: [3, 5], item: 'moon_berry', price: 14, col: 0x2a8a5a, bud: 0x7aff9a, alien: 1 }
};
AV.ITEMS.strawberries = AV.ITEMS.strawberries || { n: L('Pai strawberries', 'Fresas de Pai'), cat: 'food', ic: '🍓', use: 'eat', fx: { type: 'buzz', amt: .08 }, model: 'bowl', col: 0xe82a3a, say: L('Sweet, cold, mountain-grown.', 'Dulces, frías, de montaña.'), price: 9 };
AV.ITEMS.parcel = AV.ITEMS.parcel || { n: L('Parcel (delivery job)', 'Paquete (encargo)'), cat: 'misc', ic: '📦', use: 'look', keep: true, model: 'sack', col: 0xb8864a, say: L('Fragile. Deliver it before the timer runs out.', 'Frágil. Entrégalo antes de que acabe el tiempo.'), price: 0 };
/* listings: one per city to start; the interior lives off the city map (like the Madrid flat and La Nube) at x = ix */
const LIST = VT.LIST = {
  cm_cafe: { w: 'chiang_mai', cat: 'cafe', name: L('Corner café unit · Moon Muang', 'Local de café · Moon Muang'), anchor: [/gate/i, /bazaar/i], rent: 200, days: 7, price: 4500, foot: 8, ix: 3000, title: 'Ape Beans' },
  md_bar: { w: 'madrid', cat: 'bar', name: L('Bar premises · Malasaña', 'Local de bar · Malasaña'), anchor: [/sol|puerta/i, /malasa/i], rent: 350, days: 7, price: 7000, foot: 9, ix: 3080, title: 'Bar Gorila' },
  pai_farm: { w: 'pai', cat: 'farm', name: L('Valley grow house · Pai (fictional)', 'Invernadero del valle · Pai (ficticio)'), anchor: [/tea/i, /walking/i], rent: 180, days: 7, price: 3800, foot: 6, ix: 3160, title: 'Pai Valley Greens', crops: ['strawberry', 'mango_haze', 'lotus_dream'] },
  a9_dome: { w: 'astro9', cat: 'farm', name: L('Hydro dome · Astro-9', 'Cúpula hidropónica · Astro-9'), anchor: [/plaza|market/i], rent: 220, days: 7, price: 5200, foot: 7, ix: 3240, title: 'Orbit Orchard', crops: ['float_fruit', 'zephyr_pod', 'moon_berry'] },
  pai_hostel: { w: 'pai', cat: 'hostel', name: L('Backpacker house · Pai', 'Casa de mochileros · Pai'), anchor: [/walking/i, /rainny|ganita/i], rent: 240, days: 7, price: 5600, foot: 8, ix: 3400, title: 'Sleepy Ape Hostel' },
  md_courier: { w: 'madrid', cat: 'delivery', name: L('Courier depot · Madrid', 'Depósito de mensajería · Madrid'), anchor: [/gran|pinar/i, /sol/i], rent: 160, days: 7, price: 3000, foot: 0, ix: 3320, title: 'Rayo Couriers' }
};
const SIZE = { w: 14, d: 10 };

/* ======================= records + economy ======================= */
const st = () => { const S = AV.S; S.vent = S.vent || {}; return S.vent };
const rec = id => st()[id] || null, active = r => !!r && (r.st === 'own' || r.until >= AV.S.day);
VT.rec = rec; VT.active = id => active(rec(id));
const log = (r, t, a) => { r.ledger.unshift({ d: AV.S.day, h: Math.floor(AV.S.time / 60) % 24, t, a }); r.ledger.length = Math.min(r.ledger.length, 50); if (a > 0) { r.rev += a; r.today.rev += a } else { r.cost -= a; r.today.cost -= a } };
const pay = (r, a, why) => { if (!AV.txn(-a, r.name + ': ' + why)) return false; log(r, why, -a); return true };
const fresh = (id, P) => ({ st: 'rent', until: AV.S.day - 1, cat: P.cat, name: P.title, open: false, rep: 45, ledger: [], rev: 0, cost: 0, sold: 0, equip: {}, sup: {}, prices: {}, staff: [], deco: 0, today: { rev: 0, cost: 0, served: 0, day: AV.S.day }, plots: [], stock: {}, missions: {}, jobs: 0, paidDay: AV.S.day, simAbs: AV.abs(), log2: [] });
VT.acquire = function (id) { const P = LIST[id]; if (!P) return false; const S = st(); let r = S[id]; if (!r) r = fresh(id, P);
  if (!AV.txn(-P.rent, tr('Lease: ', 'Alquiler: ') + say(P.name))) return fail(tr('A ' + P.days + '-day lease is ' + P.rent + ' credits; you have ' + AV.S.money + '.', 'El alquiler de ' + P.days + ' días cuesta ' + P.rent + ' créditos; tienes ' + AV.S.money + '.'));
  S[id] = r; if (r.st !== 'own') { r.st = 'rent'; r.until = Math.max(r.until, AV.S.day - 1) + P.days } log(r, tr('Lease ', 'Alquiler ') + P.days + tr(' days', ' días'), -P.rent); if (P.cat === 'farm' && !r.plots.length) for (let i = 0; i < 4; i++) r.plots.push(null);
  AV.save(); rebuild(id); snd('cash'); AV.toast('🔑 ' + tr('The keys are yours: ', 'Las llaves son tuyas: ') + r.name + tr('. Step inside to set it up.', '. Entra para montarlo.')); return true };
VT.buy = function (id) { const P = LIST[id], r = rec(id); if (!P || !r || r.st === 'own') return false; if (!AV.txn(-P.price, tr('Bought premises: ', 'Local comprado: ') + say(P.name))) return fail(tr('Buying costs ' + P.price + ' credits; you have ' + AV.S.money + '.', 'Comprarlo cuesta ' + P.price + ' créditos; tienes ' + AV.S.money + '.')); r.st = 'own'; r.until = 1e9; log(r, tr('Bought the premises', 'Compra del local'), -P.price); AV.save(); return true };
const eqValue = r => { const C = CATS[r.cat]; let v = 0; for (const k in r.equip) v += (C.equip[k] ? C.equip[k][1] : 0) * r.equip[k]; return v + r.deco * 250 };
VT.sellValue = id => { const P = LIST[id], r = rec(id); if (!r) return 0; return Math.round((r.st === 'own' ? P.price * .7 : 0) + eqValue(r) * .4) };
VT.sell = function (id) { const r = rec(id); if (!r) return false; const v = VT.sellValue(id); if (v > 0) AV.txn(v, tr('Sold business: ', 'Negocio vendido: ') + r.name); delete st()[id]; AV.save(); rebuild(id); AV.toast('🤝 ' + tr('Sold. ', 'Vendido. ') + (v > 0 ? '+' + v + ' ' + tr('credits', 'créditos') : tr('Lease ended.', 'Alquiler terminado.'))); return true };
function fail(msg) { AV.toast('⚠️ ' + msg); snd('error'); VT.lastErr = msg; const m = AV.$('vtMsg'); if (m) m.textContent = '⚠️ ' + msg; return false }
VT.equip = function (id, k) { const r = rec(id); if (!active(r)) return fail(tr('Lease or buy the premises first.', 'Primero alquila o compra el local.')); const E = CATS[r.cat].equip[k]; if (!E) return false;
  const max = E[2] ? 2 : 1; if ((r.equip[k] || 0) >= max) return fail(tr('You already have that.', 'Ya lo tienes.')); if (!pay(r, E[1], say(E[0]))) return fail(tr(say(E[0]) + ' costs ' + E[1] + '; you have ' + AV.S.money + '.', say(E[0]) + ' cuesta ' + E[1] + '; tienes ' + AV.S.money + '.'));
  r.equip[k] = (r.equip[k] || 0) + 1; if (k === 'beds') for (let i = 0; i < E[2]; i++) r.plots.push(null); AV.save(); rebuild(id); snd('ok'); return true };
VT.supply = function (id, k, n) { const r = rec(id); if (!active(r)) return false; const S = CATS[r.cat].supplies && CATS[r.cat].supplies[k]; if (!S) return false; n = n || 1; const c = S[2] * n;
  if (!pay(r, c, tr('Supplies: ', 'Suministros: ') + say(S[0]))) return fail(tr(say(S[0]) + ' ×' + S[1] * n + ' costs ' + c + '; you have ' + AV.S.money + '.', say(S[0]) + ' ×' + S[1] * n + ' cuesta ' + c + '; tienes ' + AV.S.money + '.')); r.sup[k] = (r.sup[k] || 0) + S[1] * n; AV.save(); crates(); snd('ok'); return true };
const base = (r, k) => (CATS[r.cat].menu || {})[k] ? CATS[r.cat].menu[k].p : CROPS[k] ? CROPS[k].price : 0;
VT.priceOf = (r, k) => r.prices[k] != null ? r.prices[k] : base(r, k);
VT.price = function (id, k, v) { const r = rec(id); if (!r) return false; const b = base(r, k); if (!b) return false; r.prices[k] = Math.max(Math.ceil(b * .5), Math.min(Math.floor(b * 2), Math.round(v))); AV.save(); return r.prices[k] };
const NAMES = ['Nok', 'Lola', 'Kofi', 'Mai', 'Dani', 'Yuki', 'Bea', 'Somchai', 'Inés', 'Rafa'];
VT.hire = function (id, role) { const r = rec(id); if (!active(r)) return false; const R = CATS[r.cat].staff[role]; if (!R) return false; if (r.staff.filter(s => s.role === role).length >= 2) return fail(tr('Two of each role is the maximum here.', 'Dos por puesto es el máximo aquí.'));
  r.staff.push({ role, name: NAMES[(r.staff.length * 3 + r.ledger.length) % NAMES.length], wage: R[1], since: AV.S.day }); log(r, tr('Hired: ', 'Contratado: ') + say(R[0]), 0); AV.save(); rebuild(id); return true };
VT.fire = (id, i) => { const r = rec(id); if (!r || !r.staff[i]) return false; r.staff.splice(i, 1); AV.save(); rebuild(id); return true };
VT.deco = function (id) { const r = rec(id); if (!active(r)) return false; if (r.deco >= 3) return fail(tr('Fully decorated.', 'Decoración completa.')); const c = 200 + r.deco * 150; if (!pay(r, c, tr('Décor level ', 'Decoración nivel ') + (r.deco + 1))) return fail(tr('Décor costs ' + c + '.', 'La decoración cuesta ' + c + '.')); r.deco++; r.rep = Math.min(100, r.rep + 4); AV.save(); rebuild(id); return true };
VT.setOpen = function (id, on) { const r = rec(id); if (!active(r)) return false; if (on && r.cat === 'cafe' && !r.equip.machine && !r.sup.pastry) return fail(tr('Nothing to sell yet: buy the espresso machine or some pastries first.', 'Aún no hay nada que vender: compra la cafetera o bollería primero.'));
  if (on && r.cat === 'bar' && !r.equip.taps && !r.sup.cola) return fail(tr('Nothing to pour yet: install the beer taps or stock cola first.', 'Aún no hay nada que servir: instala los tiradores o compra cola.'));
  r.open = !!on; r.simAbs = AV.abs(); AV.save(); AV.toast(r.open ? '🟢 ' + r.name + tr(' is OPEN.', ' está ABIERTO.') : '🔴 ' + r.name + tr(' is closed.', ' está cerrado.')); return true };
const hours = r => { const C = CATS[r.cat], h = Math.floor(AV.S.time / 60) % 24, hh = h < 6 ? h + 24 : h; return hh >= C.open && hh < C.close };
VT.isTrading = id => { const r = rec(id); return active(r) && r.open && hours(r) };

/* ======================= daily costs + away simulation ======================= */
function dayTick(r, id) {
  while (r.paidDay < AV.S.day) { r.paidDay++; const wages = r.staff.reduce((a, s) => a + s.wage, 0), util = 10 + Object.keys(r.equip).length * 6;
    if (wages + util > 0) { if (AV.S.money >= wages + util) { AV.txn(-(wages + util), r.name + tr(': wages + utilities', ': sueldos + suministros')); log(r, tr('Wages ', 'Sueldos ') + wages + tr(' + utilities ', ' + gastos ') + util, -(wages + util)) }
      else { const q = r.staff.pop(); log(r, tr('Could not pay wages: ', 'No se pudieron pagar sueldos: ') + (q ? q.name + tr(' quit', ' se fue') : ''), 0); r.rep = Math.max(0, r.rep - 6); AV.toast('⚠️ ' + r.name + tr(': not enough credits for wages — ', ': sin créditos para sueldos — ') + (q ? q.name + tr(' quit.', ' se fue.') : '')) } }
    if (r.cat === 'hostel') hostelNight(r);
    r.today = { rev: 0, cost: 0, served: 0, day: AV.S.day };
    if (r.st === 'rent' && r.until < AV.S.day) { r.open = false; AV.toast('📄 ' + r.name + tr(': the lease ended. Renew it at the door or in 💼 Business.', ': terminó el alquiler. Renuévalo en la puerta o en 💼 Negocios.')) } } }
/* staff-only trading while you are in another world (or far away): one simulated hour at a time, at most 24 */
function simAway(r, id) {
  const now = Math.floor(AV.abs() / 60), from = Math.max(r.simAbs ? Math.floor(r.simAbs / 60) : now, now - 24); r.simAbs = AV.abs(); if (r.cat === 'farm') return growFarm(r);
  if (!r.open || !active(r)) return; const C = CATS[r.cat], P = LIST[id]; let earned = 0, n = 0;
  for (let h = from; h < now; h++) { const hh = h % 24, x = hh < 6 ? hh + 24 : hh; if (x < C.open || x >= C.close) continue;
    if (r.cat === 'hostel') { const R = hostelRooms(r); if (r.staff.some(s => s.role === 'housekeeper')) for (const q of R) if (q.st === 'dirty' && (r.sup.linen || 0) > 0) { q.st = 'clean'; r.sup.linen-- }
      if (r.staff.some(s => s.role === 'receptionist') && Math.random() < P.foot * (r.rep / 50) * .12) { const q = R.find(x => x.st === 'clean'); if (q) { const nn = 1 + Math.floor(Math.random() * 2); q.st = 'occ'; q.until = Math.floor(h / 24) + nn; q.guest = NAMES[h % NAMES.length]; earned += VT.priceOf(r, q.type) * nn; n++ } } continue }
    if (r.cat === 'delivery') { const cr = r.staff.filter(s => s.role === 'courier').length; for (let k = 0; k < cr * 2; k++) { const v = 22 + (r.equip.board ? 8 : 0); earned += v; n++ } continue }
    const cap = r.staff.filter(s => s.role === 'barista' || s.role === 'bartender').length * 7; if (!cap) continue; const want = Math.round(P.foot * (r.rep / 50) * (1 + r.deco * .1) * (r.equip.sound && x >= 21 ? 1.4 : 1) * .6);
    for (let k = 0; k < Math.min(cap, want); k++) { const it = pickOrder(r); if (!it) { r.rep = Math.max(0, r.rep - .4); break } use(r, it); earned += VT.priceOf(r, it); n++ } }
  if (earned > 0) { AV.txn(earned, r.name + tr(': staff takings', ': caja del personal')); log(r, tr('Staff served ', 'El personal atendió a ') + n + tr(' while you were away', ' mientras no estabas'), earned); r.sold += n; r.today.served += n; VT.stats.staffServed += n } }
function pickOrder(r) { const M = CATS[r.cat].menu, ks = Object.keys(M).filter(k => can(r, k) && M[k].p > 0 && !(M[k].adult && fam())); return ks.length ? ks[Math.floor(Math.random() * ks.length)] : null }
/* hostel rooms: 4 to start (dorm / private alternating), +2 per upgrade; st 'clean' | 'occ' | 'dirty' */
const roomsN = r => 4 + (r.equip.rooms || 0) * 2;
function hostelRooms(r) { r.rooms = r.rooms || []; while (r.rooms.length < roomsN(r)) r.rooms.push({ type: r.rooms.length % 2 ? 'private' : 'dorm', st: 'clean' }); return r.rooms }
VT.rooms = id => hostelRooms(rec(id));
const can = (r, k) => { if (r.cat === 'hostel') return !!hostelRooms(r).find(q => q.type === k && q.st === 'clean'); const m = CATS[r.cat].menu[k]; if (!m) return false; if (m.eq && !r.equip[m.eq]) return false; for (const s in m.need) if ((r.sup[s] || 0) < m.need[s]) return false; return true };
const use = (r, k) => { const m = CATS[r.cat].menu[k]; for (const s in m.need) r.sup[s] -= m.need[s] };
VT.canMake = (id, k) => can(rec(id), k);

/* ======================= premises in the world: entrance + interior ======================= */
let G = null;   /* the live build for the current world: { id, g, T: [], inside: g2, ... } */
function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t }
const M = (c, r, m, e, ei) => { const x = new THREE.MeshStandardMaterial({ color: c, roughness: r == null ? .7 : r, metalness: m || 0 }); if (e) { x.emissive = new THREE.Color(e); x.emissiveIntensity = ei || .6 } return x };
const BOXG = new THREE.BoxGeometry(1, 1, 1);
const box = (g, m, x, y, z, sx, sy, sz) => { const b = new THREE.Mesh(BOXG, m); b.scale.set(sx, sy, sz); b.position.set(x, y, z); g.add(b); return b };
function findFront(W, P) {   /* a point on the pavement right in front of a building wall, near the listing's anchor place */
  let pl = null; for (const rx of P.anchor) { pl = (W.places || []).find(q => rx.test(q.id + ' ' + say(q.name || ''))); if (pl) break } pl = pl || (W.places || [])[0]; if (!pl) return null;
  /* never on someone else's front: keep clear of existing doors / shop counters and of other named places */
  const taken = (x, z) => W.T.some(t => (t.kind === 'door' || t.kind === 'shop') && Math.hypot(t.x - x, t.z - z) < 7) || (W.places || []).some(q => q !== pl && q.x != null && !/^vent_/.test(q.id || '') && Math.hypot(q.x - x, q.z - z) < 9) || Object.values(G ? G.sites : {}).some(s => Math.hypot(s.fr.x - x, s.fr.z - z) < 10);
  for (let d = 10; d < 80; d += 2) for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2 + d, x = pl.x + Math.cos(a) * d, z = pl.z + Math.sin(a) * d; if (W.surface(x, z) === null || !AV.isFree(W, x, z, .7) || taken(x, z) || (W.noStrangersAt && W.noStrangersAt(x, z))) continue;
    for (let j = 0; j < 8; j++) { const b = j / 8 * Math.PI * 2, dx = Math.cos(b), dz = Math.sin(b); if (!AV.isFree(W, x + dx * 1.3, z + dz * 1.3, .2) && AV.isFree(W, x - dx * 2, z - dz * 2, .6) && !AV.isFree(W, x + dx * 1.3 + dz * 1.5, z + dz * 1.3 - dx * 1.5, .2) && !AV.isFree(W, x + dx * 1.3 - dz * 1.5, z + dz * 1.3 + dx * 1.5, .2)) return { x: x + dx * .75, z: z + dz * .75, ry: Math.atan2(-dx, -dz), wall: true } } }
  return { x: pl.x + 6, z: pl.z + 6, ry: 0, wall: false } }
function rebuild(id) { const W = AV.W, P = LIST[id]; if (!W || !P || W.id !== P.w) return; teardown(id); build(W, id) }
function teardown(id) { const W = AV.W; if (!G || !G.sites[id]) return; const s = G.sites[id]; s.g.parent && s.g.parent.remove(s.g); s.ig && s.ig.parent && s.ig.parent.remove(s.ig); for (const t of s.T) { const i = W.T.indexOf(t); if (i >= 0) W.T.splice(i, 1) } for (const c of s.cols) { const i = W.cols.indexOf(c); if (i >= 0) W.cols.splice(i, 1) } custs.filter(c => c.id === id).forEach(c => c.a.h.parent && c.a.h.parent.remove(c.a.h)); for (let i = custs.length - 1; i >= 0; i--) if (custs[i].id === id) custs.splice(i, 1); delete G.sites[id] }
function build(W, id) {
  const P = LIST[id], r = rec(id), on = active(r), C = CATS[P.cat]; if (!G || G.W !== W) G = { W, sites: {} };
  const f = P.front || (P.front = {}); if (!f[W.id + 'x']) { const p = findFront(W, P); if (!p) return; f[W.id + 'x'] = p } const fr = f[W.id + 'x'];
  const s = G.sites[id] = { id, g: new THREE.Group(), T: [], cols: [], fr }; W.group.add(s.g); const T = t => { W.T.push(t); s.T.push(t); return t };
  /* entrance: door, frame and a sign in the business's colours ("SE ALQUILA / FOR RENT" until it is yours) */
  const e = new THREE.Group(); s.g.add(e); e.position.set(fr.x, W.surface(fr.x, fr.z) || 0, fr.z); e.rotation.y = fr.ry;
  box(e, M(0x2a2018, .6), 0, 1.15, 0, 1.4, 2.4, .12); box(e, M(on ? 0x2a5a8a : 0x5a4a3a, .5), 0, 1.1, .04, 1.1, 2.15, .1); box(e, M(0xc8a040, .3, .8), .38, 1.05, .1, .05, .05, .14);
  const sg = canvasTex(512, 160, (c, w, h) => { c.fillStyle = on ? '#14141a' : '#f4d84a'; c.fillRect(0, 0, w, h); c.strokeStyle = on ? '#ffd27a' : '#1a1a1a'; c.lineWidth = 8; c.strokeRect(6, 6, w - 12, h - 12); c.fillStyle = on ? '#ffd27a' : '#1a1a1a'; c.textAlign = 'center';
    c.font = 'bold 60px Georgia'; c.fillText(on ? C.ic + ' ' + r.name : tr('FOR RENT', 'SE ALQUILA'), w / 2, 78); c.font = '28px Georgia'; c.fillText(on ? (r.open ? tr('open', 'abierto') : tr('closed', 'cerrado')) : say(C.n) + ' · ' + P.rent + '¢ / ' + P.days + tr(' days', ' días'), w / 2, 128) });
  const sp = new THREE.Mesh(new THREE.PlaneGeometry(1.9, .6), new THREE.MeshStandardMaterial({ map: sg, emissive: 0xffffff, emissiveMap: sg, emissiveIntensity: .35 })); sp.position.set(0, 2.75, .1); e.add(sp); const back = sp.clone(); back.rotation.y = Math.PI; back.position.z = -.08; e.add(back);
  const dx = Math.sin(fr.ry), dz = Math.cos(fr.ry), ox = fr.x + dx * 1.1, oz = fr.z + dz * 1.1;   /* outside spot */
  T({ x: ox, z: oz, r: 2.2, kind: 'door', label: () => !active(rec(id)) ? '🔑 ' + say(P.name) + ' — ' + tr('lease ' + P.rent + ' / buy ' + P.price, 'alquilar ' + P.rent + ' / comprar ' + P.price) : '🚪 ' + rec(id).name + tr(': enter', ': entrar'),
    fn: () => active(rec(id)) ? goIn(id) : VT.panel(id) });
  W.places = W.places || []; if (!W.places.some(q => q.id === 'vent_' + id)) W.places.push({ id: 'vent_' + id, name: [C.ic + ' ' + (on ? r.name : say(P.name)), C.ic + ' ' + (on ? r.name : say(P.name))], x: ox, z: oz, icon: C.ic });
  VT.stats['door_' + id] = fr.wall ? 'wall' : 'kiosk';
  if (on) interior(W, id, s, T);
}
function goIn(id) { const s = G && G.sites[id]; if (!s || !s.in) return; snd('door'); AV.fadeTo(1, 250); setTimeout(() => { const P = AV.P; P.x = s.in.x; P.z = s.in.z; P.y = 0; P.vx = P.vz = 0; P.yaw = Math.PI; AV.visit && AV.visit('vent_' + id); AV.fadeTo(0, 380); VT.inside = id }, 280) }
function goOut(id) { const s = G && G.sites[id]; if (!s) return; snd('door'); AV.fadeTo(1, 250); setTimeout(() => { const P = AV.P, W = AV.W, fr = s.fr; P.x = fr.x + Math.sin(fr.ry) * 1.6; P.z = fr.z + Math.cos(fr.ry) * 1.6; P.y = W.surface(P.x, P.z) || 0; P.vx = P.vz = 0; P.yaw = fr.ry; AV.fadeTo(0, 380); VT.inside = null }, 280) }
VT.enter = goIn; VT.exit = goOut;
function interior(W, id, s, T) {
  const P = LIST[id], r = rec(id), C = CATS[P.cat], x = P.ix, z = 0, w = SIZE.w, d = SIZE.d, x0 = x - w / 2, x1 = x + w / 2, z0 = z - d / 2, z1 = z + d / 2, g = s.ig = new THREE.Group(); W.group.add(g);
  if (!W.__vent) { W.__vent = []; const s0 = W.surface; W.surface = (px, pz) => { for (const b of W.__vent) if (px > b[0] - .2 && px < b[1] + .2 && pz > b[2] - .2 && pz < b[3] + .2) return 0; return s0(px, pz) } }
  if (!W.__vent.some(b => b[0] === x0)) W.__vent.push([x0, x1, z0, z1]);
  AV.snd && AV.snd.zone && !AV.snd.zones.some(q => q.id === 'vent_' + id) && AV.snd.zone({ world: W.id, id: 'vent_' + id, box: [x0, x1, z0, z1], space: P.cat === 'bar' ? (r.equip.sound ? 'club' : 'bar') : P.cat === 'farm' ? 'hall' : P.cat === 'hostel' ? 'room' : 'shop' });
  const wallC = [[0xf2e6d4, 0xe8c8a0, 0xd8e8d0, 0xf4d8c8], [0x2a1e1a, 0x3a1a2a, 0x1a2a3a, 0x2a2a1a], [0xe8f0e0, 0xd8e8d8, 0xe0f0f4, 0xf0f8e8], [0xd8d8d0, 0xc8d0d8, 0xd8c8b8, 0xe0e0d8], [0xf0e0c8, 0xe0ecd8, 0xd8e4f0, 0xf4e4d8]][['cafe', 'bar', 'farm', 'delivery', 'hostel'].indexOf(P.cat)][r.deco], wm = M(wallC, .9);
  const wall = (a, b, c, e2) => { const cc = [a, b, c, e2]; W.cols.push(cc); s.cols.push(cc); box(g, wm, (a + b) / 2, 1.8, (c + e2) / 2, b - a, 3.6, e2 - c) };
  wall(x0 - .3, x1 + .3, z0 - .3, z0); wall(x0 - .3, x1 + .3, z1, z1 + .3); wall(x0 - .3, x0, z0, z1); wall(x1, x1 + .3, z0, z1);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, d), M(P.cat === 'farm' ? 0x6a5a4a : P.cat === 'bar' ? 0x3a2418 : 0x8a6a4a, .8)); floor.rotation.x = -Math.PI / 2; floor.position.set(x, .01, z); g.add(floor);
  box(g, M(0x2a2420, .9), x, 3.7, z, w + .6, .2, d + .6); for (const lx of [x - 4, x, x + 4]) { const l = new THREE.PointLight(P.cat === 'bar' ? 0xff9a6a : 0xfff0d8, P.cat === 'bar' ? .7 : 1, 11); l.position.set(lx, 3.2, z); g.add(l) }
  s.in = { x: x1 - 1.6, z: z1 - 1.4 }; box(g, M(0x3a2a1a), x1 - 1.6, 1.1, z1 - .05, 1.2, 2.2, .1);
  T({ x: x1 - 1.6, z: z1 - .9, r: 1.6, kind: 'door', label: () => '🚪 ' + tr('Back outside', 'Salir'), fn: () => goOut(id) });
  /* manage desk / board: the whole Manage panel */
  box(g, M(0x5a3a24), x0 + 1.2, .5, z1 - 1.5, 1.4, 1, .7); const bt = canvasTex(256, 128, (c, w2, h) => { c.fillStyle = '#1a2a1a'; c.fillRect(0, 0, w2, h); c.fillStyle = '#e8f0d8'; c.font = 'bold 30px Georgia'; c.textAlign = 'center'; c.fillText(tr('MANAGE', 'GESTIÓN'), w2 / 2, 55); c.font = '20px Georgia'; c.fillText(r.name, w2 / 2, 95) });
  const bp = new THREE.Mesh(new THREE.PlaneGeometry(1.4, .7), new THREE.MeshStandardMaterial({ map: bt })); bp.position.set(x0 + .06, 1.9, z1 - 1.5); bp.rotation.y = Math.PI / 2; g.add(bp);
  T({ x: x0 + 1.2, z: z1 - 2.2, r: 1.8, kind: 'shop', label: () => '📋 ' + tr('Manage ', 'Gestionar ') + rec(id).name, fn: () => VT.panel(id) });
  /* décor: plants, lights, a mural, by level */
  if (r.deco >= 1) for (const [px, pz] of [[x0 + .6, z0 + .6], [x1 - .6, z0 + .6]]) { box(g, M(0xb86a3a), px, .3, pz, .45, .6, .45); const lf = new THREE.Mesh(new THREE.IcosahedronGeometry(.45, 0), M(0x3a8a3a, .9)); lf.position.set(px, 1, pz); g.add(lf) }
  if (r.deco >= 2) for (let i = 0; i < 7; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(.08, 8, 6), M(0xffe0a0, .4, 0, 0xffd080, 1.2)); b.position.set(x0 + 1 + i * 2, 3.3, z + Math.sin(i) * 2); g.add(b) }
  if (r.deco >= 3) { const mt = canvasTex(512, 256, (c, w2, h) => { const gr = c.createLinearGradient(0, 0, w2, h); gr.addColorStop(0, '#ff6ad5'); gr.addColorStop(.5, '#ffd84a'); gr.addColorStop(1, '#4ad8ff'); c.fillStyle = gr; c.fillRect(0, 0, w2, h); c.fillStyle = 'rgba(0,0,0,.6)'; c.font = 'bold 70px Georgia'; c.textAlign = 'center'; c.fillText('🦍 ' + r.name, w2 / 2, 150) }); const mp = new THREE.Mesh(new THREE.PlaneGeometry(5, 2.5), new THREE.MeshStandardMaterial({ map: mt })); mp.position.set(x, 2, z0 + .05); g.add(mp) }
  s.supplyAt = [x0 + 2.4, z0 + .8]; s.crates = new THREE.Group(); g.add(s.crates);
  if (P.cat === 'cafe' || P.cat === 'bar') counterVenue(W, id, s, T, g, x0, x1, z0, z1);
  if (P.cat === 'farm') farmHall(W, id, s, T, g, x0, x1, z0, z1);
  if (P.cat === 'delivery') depot(W, id, s, T, g, x0, x1, z0, z1);
  if (P.cat === 'hostel') hostelHall(W, id, s, T, g, x0, x1, z0, z1);
  /* staff: visible people at work */
  r.staff.forEach((sf, i) => { const pos = sf.role === 'barista' || sf.role === 'bartender' || sf.role === 'receptionist' ? [s.counter[0] + (i % 2 ? .8 : -.8), s.counter[1] - 1] : sf.role === 'door' ? [x1 - 2.6, z1 - 1] : sf.role === 'grower' ? [x - 2 + i, z] : sf.role === 'seller' ? [x1 - 2, z0 + 2] : [x0 + 2 + i, z];
    const a = actor(300 + i * 17 + id.length); if (!a) return; a.h.position.set(pos[0], 0, pos[1]); a.h.rotation.y = sf.role === 'barista' || sf.role === 'bartender' ? 0 : Math.PI; g.add(a.h); s.staffA = s.staffA || []; s.staffA.push(Object.assign(a, { role: sf.role })) });
  AV.lin && AV.lin(g); crates();
}
function actor(seed) { try { const A = AV.chars.softActor('human', seed, { lod: true, shells: 0, shadow: false, crowd: true }), h = new THREE.Group(); h.add(A.root); return { h, A: A.actor } } catch (e) { const h = new THREE.Group(); const b = new THREE.Mesh(new THREE.CapsuleGeometry ? new THREE.CapsuleGeometry(.25, .9, 4, 8) : new THREE.CylinderGeometry(.25, .25, 1.4, 8), M(0x8a6a9a)); b.position.y = .85; h.add(b); return { h, A: null } } }
/* supplies show as crates by the back wall (how many you have left) */
function crates() { const s = G && VT.live && G.sites[VT.live]; for (const id in (G && G.sites) || {}) { const S = G.sites[id], r = rec(id); if (!S.crates || !r) continue; S.crates.clear(); const n = Math.min(12, Math.ceil(Object.values(r.sup || {}).reduce((a, b) => a + b, 0) / 6)); for (let i = 0; i < n; i++) box(S.crates, M(0x9a7a4a), S.supplyAt[0] + (i % 4) * .55, .22 + Math.floor(i / 4) * .45, S.supplyAt[1], .5, .42, .5) } }

/* ======================= café + bar: counter, queue, tables ======================= */
function counterVenue(W, id, s, T, g, x0, x1, z0, z1) {
  const r = rec(id), P = LIST[id], cx = (x0 + x1) / 2, cz = z0 + 2.2; s.counter = [cx, cz];
  box(g, M(P.cat === 'bar' ? 0x4a2a18 : 0x8a5a3a, .5), cx, .55, cz, 5, 1.1, .8); box(g, M(0x2a2a2a, .3, .2), cx, 1.12, cz, 5.2, .05, .9); const cc = [cx - 2.6, cx + 2.6, cz - .45, cz + .45]; W.cols.push(cc); s.cols.push(cc);
  /* equipment on the counter / behind it */
  if (r.equip.machine) { box(g, M(0xc8c8c8, .25, .8), cx - 1.5, 1.45, cz - .15, .6, .55, .45); box(g, M(0x1a1a1a), cx - 1.5, 1.8, cz - .15, .62, .1, .47) }
  if (r.equip.juicer) { box(g, M(0xffa830, .4), cx - .7, 1.35, cz - .1, .3, .4, .3) }
  if (r.equip.grinder) { box(g, M(0x3a3a3a, .4, .6), cx - 2.2, 1.4, cz - .15, .22, .5, .22) }
  if (r.equip.taps) for (let i = 0; i < 3; i++) { box(g, M(0xd8b048, .2, .9), cx + .4 + i * .35, 1.45, cz - .2, .07, .6, .07); box(g, M([0x1a1a1a, 0xc82a2a, 0x2a6ac8][i]), cx + .4 + i * .35, 1.8, cz - .2, .1, .14, .1) }
  if (r.equip.station) { box(g, M(0x2a3a4a, .3, .4), cx + 1.8, 1.3, cz - .15, .8, .35, .5); for (let i = 0; i < 5; i++) box(g, M([0xc8e8ff, 0xd88a3a, 0x7ad84a, 0xe8e0c8, 0x8a3ad8][i], .1), cx + 1.5 + i * .14, 1.62, cz - .25, .07, .3, .07) }
  if (r.equip.sound) { for (const sx of [x0 + .6, x1 - .6]) { box(g, M(0x1a1a1a, .6), sx, 1, z0 + 3.5, .6, 2, .6); box(g, M(0x3a3a3a, .3), sx, 1.4, z0 + 3.8, .4, .4, .02) } }
  for (let i = 0; i < 6; i++) box(g, M([0x3a7a5a, 0xc8a050, 0x8a4a3a][i % 3], .5, .3), cx - 2 + i * .8, 2.2, z0 + .3, .5, .4, .3);
  /* tables + chairs: 2 + 2 per upgrade */
  const n = 2 + (r.equip.tables || 0) * 2; s.tables = []; for (let i = 0; i < n; i++) { const tx = x0 + 2.2 + (i % 3) * 3.6, tz = z0 + 5 + Math.floor(i / 3) * 2.6; box(g, M(0x6a4a2a, .6), tx, .75, tz, 1, .06, 1); box(g, M(0x4a3a2a), tx, .38, tz, .1, .75, .1);
    for (const sx of [-.8, .8]) box(g, M(0x7a5a3a), tx + sx, .45, tz, .45, .08, .45); const cc2 = [tx - .5, tx + .5, tz - .5, tz + .5]; W.cols.push(cc2); s.cols.push(cc2);
    const mess = new THREE.Group(); box(mess, M(0xffffff, .3), -.2, .82, .1, .1, .1, .1); box(mess, M(0xd8c0a0, .8), .15, .8, -.15, .25, .02, .2); mess.position.set(tx, 0, tz); mess.visible = !!(r.dirty && r.dirty[i]); g.add(mess);
    const tb = { i, x: tx, z: tz, mess, seat: [tx + .8, tz], busy: null }; s.tables.push(tb);
    T({ x: tx, z: tz + 1, r: 1.6, kind: 'shop', show: () => !!(rec(id).dirty && rec(id).dirty[i]), label: () => '🧽 ' + tr('Clean the table', 'Limpiar la mesa'), fn: () => cleanTable(id, i) }) }
  /* the counter: serve */
  T({ x: cx, z: cz + 1.4, r: 2.2, kind: 'shop', label: () => { const q = queue(id); return (P.cat === 'bar' ? '🍺 ' : '☕ ') + (q.length ? tr('Serve (' + q.length + ' waiting)', 'Atender (' + q.length + ' esperando)') : tr('Counter — no one waiting', 'Mostrador — nadie esperando')) }, fn: () => VT.serve(id) });
}
function cleanTable(id, i) { const r = rec(id); if (!r.dirty || !r.dirty[i]) return; r.dirty[i] = 0; const s = G.sites[id]; if (s && s.tables[i]) s.tables[i].mess.visible = false; VT.stats.cleaned++; snd('clink'); r.rep = Math.min(100, r.rep + .5); AV.toast('🧽 ' + tr('Clean table. Customers notice.', 'Mesa limpia. Los clientes lo notan.')); AV.save() }
/* ---------- customers (visible NPCs) ---------- */
const custs = []; VT.custs = custs;
const queue = id => custs.filter(c => c.id === id && c.state === 'queue').sort((a, b) => a.qi - b.qi);
VT.queue = queue;
function bubble(txt) { const c = document.createElement('canvas'); c.width = 128; c.height = 128; const x = c.getContext('2d'); x.fillStyle = 'rgba(255,255,255,.92)'; x.beginPath(); x.arc(64, 58, 50, 0, Math.PI * 2); x.fill(); x.beginPath(); x.moveTo(52, 100); x.lineTo(64, 124); x.lineTo(76, 100); x.fill(); x.font = '56px serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, 64, 60);
  const t = new THREE.CanvasTexture(c), sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false })); sp.scale.set(.55, .55, .55); sp.position.y = 2.25; sp.renderOrder = 9; return sp }
function spawnCustomer(id) {
  const s = G && G.sites[id], r = rec(id); if (!s || !s.counter) return null; const k = pickOrder(r); if (!k) { if (!s.noStockT || AV.now() > s.noStockT) { s.noStockT = AV.now() + 30; fail(r.cat === 'hostel' ? r.name + tr(': no clean room free — guests are turned away. Clean rooms or add rooms.', ': no hay habitación limpia libre — los huéspedes se van. Limpia o amplía.') : r.name + tr(': nothing on the menu can be made — restock supplies.', ': no se puede preparar nada — repón suministros.')) } return null }
  const a = actor(1000 + Math.floor(Math.random() * 900)); if (!a) return null; a.h.position.set(s.in.x, 0, s.in.z); s.ig.add(a.h);
  const nights = r.cat === 'hostel' ? 1 + Math.floor(Math.random() * 3) : 0;
  const tipsy = CATS[r.cat].menu[k].adult && Math.random() < (r.staff.some(q => q.role === 'door') ? .05 : .18);
  const c = { id, a, order: k, nights, state: 'in', qi: (custs.filter(q => q.id === id).reduce((m, q) => Math.max(m, q.qi || 0), 0)) + 1, pat: 55, t0: AV.now(), tipsy, b: bubble(CATS[r.cat].menu[k].ic + (tipsy ? '🥴' : '')) };
  a.h.add(c.b); custs.push(c); VT.stats.walkins++; r.walkins = (r.walkins || 0) + 1; return c }
VT.spawnCustomer = spawnCustomer;
function walkTo(c, x, z, dt) { const h = c.a.h, dx = x - h.position.x, dz = z - h.position.z, d = Math.hypot(dx, dz); if (d < .12) { c.a.A && c.a.A.play && c.a.A.play('Idle'); return true } const sp = Math.min(d, 1.2 * dt); h.position.x += dx / d * sp; h.position.z += dz / d * sp; h.rotation.y = Math.atan2(dx, dz); c.a.A && c.a.A.play && c.a.A.play('Walk'); return false }
function leave(c, angry) { const r = rec(c.id); c.state = 'out'; if (c.b) c.b.visible = false; if (angry) { r.rep = Math.max(0, r.rep - 2.5); VT.stats.left++; AV.toast('😤 ' + tr('A customer gave up waiting and left.', 'Un cliente se cansó de esperar y se fue.')) } if (c.table) c.table.busy = null }
VT.pay = function (id, c, quality) { const r = rec(id), k = c.order, price = VT.priceOf(r, k), b = base(r, k), wait = AV.now() - c.t0, tip = price > 0 ? Math.max(0, Math.round((quality || 1) * (b * 2 - price) * .35 + (wait < 15 ? 2 : wait < 30 ? 1 : 0))) : 0;
  use(r, k); const tot = price + tip; if (tot > 0) { AV.txn(tot, r.name + ': ' + say(CATS[r.cat].menu[k].n)); log(r, say(CATS[r.cat].menu[k].n) + (tip ? tr(' + tip ', ' + propina ') + tip : ''), tot) } snd(tot ? 'cash' : 'ok');
  r.sold++; r.today.served++; VT.stats.served++; r.rep = Math.min(100, r.rep + (price <= b * 1.2 ? .8 : price <= b * 1.6 ? .2 : -1.2) + (quality > .8 ? .3 : 0)); c.state = 'served'; c.b.visible = false; c.paid = tot;
  const s = G.sites[id], free = s.tables && s.tables.find(t => !t.busy && !(r.dirty && r.dirty[t.i])); if (free) { free.busy = c; c.table = free; c.state = 'sit'; c.sitT = 8 + Math.random() * 8 } else c.state = 'out'; AV.save(); return tot };
/* the serve panel: the front customer's order, your menu, (bar) the pour */
VT.serve = function (id) { const r = rec(id), q = queue(id); if (!r.open) return fail(tr('The business is closed. Open it in Manage (📋).', 'El negocio está cerrado. Ábrelo en Gestión (📋).')); if (r.cat === 'hostel') return hostelDesk(id); if (!q.length) return AV.toast(tr('No one is waiting. Customers arrive while you are open.', 'No espera nadie. Los clientes llegan mientras esté abierto.'));
  const c = q[0], C = CATS[r.cat], m = C.menu[c.order], wait = Math.round(AV.now() - c.t0), left = Math.max(0, Math.round(c.pat - wait));
  const p = AV.panel('cmp', '<b>' + C.ic + ' ' + esc(r.name) + '</b><div class="note">' + tr('Customer wants: ', 'El cliente quiere: ') + '<b style="font-size:1.3em">' + m.ic + ' ' + say(m.n) + '</b> · ' + tr('patience ', 'paciencia ') + left + 's' + (c.tipsy ? '<br>🥴 ' + tr('They look tipsy already. Responsible service: offer water, or refuse.', 'Ya parece achispado. Servicio responsable: ofrece agua o niégate.') : '') + '</div>' +
    '<div class="grid">' + Object.keys(C.menu).filter(k => !(C.menu[k].adult && fam())).map(k => { const mm = C.menu[k], ok = can(r, k); return '<button data-k="' + k + '"' + (ok ? '' : ' disabled title="' + tr('missing equipment or supplies', 'faltan equipo o suministros') + '"') + '>' + mm.ic + ' ' + say(mm.n) + '<small>' + VT.priceOf(r, k) + '¢' + (ok ? '' : ' · ' + tr('can’t make', 'no hay')) + '</small></button>' }).join('') + '</div>' +
    (c.tipsy ? '<div class="row"><button id="vtRefuse">🚫 ' + tr('Politely refuse', 'Rechazar con educación') + '</button></div>' : '') + '<div class="note" id="vtMsg"></div><div class="row"><button data-close>' + tr('Done', 'Listo') + '</button></div>');
  p.querySelectorAll('[data-k]').forEach(b => b.onclick = () => VT.give(id, b.dataset.k));
  const rf = AV.$('vtRefuse'); if (rf) rf.onclick = () => { VT.stats.refused++; r.rep = Math.min(100, r.rep + 1.5); leave(c); AV.toast('🙏 ' + tr('“Fair enough.” They head home. Your door policy earns respect.', '“Vale.” Se va a casa. Tu política se gana respeto.')); AV.closePanel('cmp'); AV.save() };
  return true };
VT.give = function (id, k, quality) { const r = rec(id), q = queue(id), c = q[0]; if (!c) return false; const C = CATS[r.cat], m = C.menu[k];
  if (!can(r, k)) return fail(tr('You can’t make that: ', 'No puedes preparar eso: ') + (m.eq && !r.equip[m.eq] ? say(C.equip[m.eq][0]) + tr(' missing', ' falta') : tr('out of supplies', 'sin suministros')));
  if (c.tipsy && m.adult) { r.rep = Math.max(0, r.rep - 4); VT.stats.incidents = (VT.stats.incidents || 0) + 1; fail(tr('You served alcohol to a tipsy customer. A neighbour complains (reputation −4).', 'Serviste alcohol a un cliente achispado. Un vecino se queja (reputación −4).')) }
  else if (c.tipsy && k === 'water') { VT.stats.refused++; r.rep = Math.min(100, r.rep + 2); c.order = 'water' }
  if (k !== c.order && !(c.tipsy && k === 'water')) { VT.stats.wrong++; c.pat -= 15; r.rep = Math.max(0, r.rep - 1); const msg = AV.$('vtMsg'); if (msg) msg.textContent = '❌ ' + tr('That’s not what they ordered.', 'Eso no es lo que pidió.'); snd('error'); return false }
  if (m.pour && quality == null) return pourGame(id, k);
  VT.pay(id, c, quality == null ? 1 : quality); AV.closePanel('cmp'); setTimeout(() => { if (queue(id).length && Math.hypot(AV.P.x - G.sites[id].counter[0], AV.P.z - G.sites[id].counter[1]) < 4) VT.serve(id) }, 400); return true };
/* the pour: a level rises; stop it in the green band (just below the rim, with a head of foam) */
function pourGame(id, k) { const p = AV.panel('cmp', '<b>🍺 ' + tr('Pour the beer', 'Tira la caña') + '</b><div class="note">' + tr('Stop the tap when the level is in the green band.', 'Corta el grifo cuando el nivel esté en la franja verde.') + '</div><div style="position:relative;height:160px;width:70px;margin:8px auto;border:3px solid #ddd;border-top:none;border-radius:0 0 10px 10px;overflow:hidden;background:#222"><div style="position:absolute;left:0;right:0;bottom:70%;height:14%;background:rgba(80,220,120,.35)"></div><div id="vtLv" style="position:absolute;left:0;right:0;bottom:0;height:0;background:linear-gradient(#fff 0 10%,#e8a830 10%)"></div></div><div class="row"><button id="vtStop">' + tr('Stop!', '¡Corta!') + '</button></div>');
  let lv = 0; const t0 = performance.now(), iv = setInterval(() => { lv = Math.min(1, (performance.now() - t0) / 2600); const el = AV.$('vtLv'); if (el) el.style.height = (lv * 100) + '%'; else clearInterval(iv); if (lv >= 1) stop() }, 30);
  const stop = () => { clearInterval(iv); VT.stats.pours++; const q = Math.max(0, 1 - Math.abs(lv - .77) / .25); VT.lastPour = { lv, q }; AV.toast(q > .7 ? '🍺 ' + tr('Perfect pour!', '¡Caña perfecta!') : q > .3 ? '🍺 ' + tr('Decent pour.', 'Caña decente.') : '🍺 ' + tr('Mostly foam… they pay, but no tip.', 'Casi toda espuma… pagan, sin propina.')); VT.give(id, k, q) };
  AV.$('vtStop').onclick = stop; VT._pourStop = stop; return true }

/* ======================= hostel: check-in desk, rooms, housekeeping ======================= */
const ROOMN = L('Room ', 'Habitación ');
function hostelNight(r) {   /* the morning after: breakfast income for each occupied room, then check-outs leave rooms to clean */
  for (const q of hostelRooms(r)) { if (q.st !== 'occ') continue; if (r.equip.breakfast) { AV.txn(6, r.name + tr(': breakfast', ': desayuno')); log(r, tr('Breakfast for ', 'Desayuno para ') + (q.guest || tr('a guest', 'un huésped')), 6) }
    if ((q.until || 0) <= AV.S.day) { q.st = 'dirty'; log(r, tr('Check-out, room to clean: ', 'Salida, habitación por limpiar: ') + (q.guest || ''), 0) } } }
VT.checkin = function (id, i, auto) { const r = rec(id), c = queue(id)[0], R = hostelRooms(r), q = R[i]; if (!c || !q) return false;
  if (q.st !== 'clean') return fail(tr(say(ROOMN) + (i + 1) + ' is not ready.', say(ROOMN) + (i + 1) + ' no está lista.'));
  if (q.type !== c.order) { c.pat -= 12; VT.stats.wrong++; r.rep = Math.max(0, r.rep - 1); return fail(tr('They booked a ', 'Reservaron: ') + say(CATS.hostel.menu[c.order].n).toLowerCase()) }
  const per = VT.priceOf(r, q.type), b = base(r, q.type), tot = per * c.nights; AV.txn(tot, r.name + ': ' + c.nights + tr(' night(s)', ' noche(s)')); log(r, tr('Check-in, room ', 'Entrada, habitación ') + (i + 1) + ' × ' + c.nights + tr(' night(s)', ' noche(s)'), tot);
  q.st = 'occ'; q.until = AV.S.day + c.nights; q.guest = NAMES[(r.sold + i) % NAMES.length]; r.sold++; r.today.served++; VT.stats.served++; r.rep = Math.min(100, r.rep + (per <= b * 1.2 ? .8 : per <= b * 1.6 ? .2 : -1.2) + (r.equip.lockers ? .3 : 0));
  c.state = 'room'; c.room = i; c.b.visible = false; snd(auto ? 'ok' : 'cash'); roomVis(id); AV.save(); if (!auto) AV.closePanel('cmp'); return tot };
VT.cleanRoom = function (id, i, auto) { const r = rec(id), q = hostelRooms(r)[i]; if (!q || q.st !== 'dirty') return false; if ((r.sup.linen || 0) < 1) return fail(tr('No clean linen: buy linen sets in Manage, Supplies.', 'No hay sábanas limpias: cómpralas en Gestión, Suministros.'));
  r.sup.linen--; q.st = 'clean'; q.guest = null; VT.stats.cleaned++; r.rep = Math.min(100, r.rep + .5); if (!auto) { snd('ok'); AV.toast('🧺 ' + say(ROOMN) + (i + 1) + tr(' is fresh and ready.', ' está limpia y lista.')) } roomVis(id); crates(); AV.save(); return true };
function hostelDesk(id) { const r = rec(id), q = queue(id); if (!q.length) return AV.toast(tr('No guests at the desk. They arrive while you are open and there are clean rooms.', 'No hay huéspedes en recepción. Llegan si está abierto y hay habitaciones limpias.'));
  const c = q[0], R = hostelRooms(r), m = CATS.hostel.menu[c.order], left = Math.max(0, Math.round(c.pat - (AV.now() - c.t0))), ST = { clean: tr('ready', 'lista'), occ: tr('occupied', 'ocupada'), dirty: tr('needs cleaning', 'por limpiar') };
  const p = AV.panel('cmp', '<b>🛏️ ' + esc(r.name) + tr(' · reception', ' · recepción') + '</b><div class="note">' + tr('Guest wants: ', 'El huésped quiere: ') + '<b style="font-size:1.2em">' + m.ic + ' ' + say(m.n) + '</b> · ' + c.nights + tr(' night(s) · ', ' noche(s) · ') + VT.priceOf(r, c.order) * c.nights + '¢ · ' + tr('patience ', 'paciencia ') + left + 's</div><div class="grid">' +
    R.map((x, i) => '<button data-room="' + i + '"' + (x.st === 'clean' ? '' : ' disabled') + '>' + (x.type === 'dorm' ? '🛏️' : '🚪') + ' ' + say(ROOMN) + (i + 1) + '<small>' + say(CATS.hostel.menu[x.type].n).split(' (')[0] + ' · ' + ST[x.st] + '</small></button>').join('') + '</div><div class="note" id="vtMsg"></div><div class="row"><button data-close>' + tr('Done', 'Listo') + '</button></div>');
  p.querySelectorAll('[data-room]').forEach(b => b.onclick = () => VT.checkin(id, +b.dataset.room)); return true }
function hostelHall(W, id, s, T, g, x0, x1, z0, z1) {
  const r = rec(id), R = hostelRooms(r), n = R.length, cx = (x0 + x1) / 2, cz = z0 + 5.4, rw = (x1 - x0) / n; s.counter = [cx, cz];
  box(g, M(0x7a5a3a, .5), cx, .55, cz, 3, 1.1, .7); box(g, M(0x2a2a2a, .3), cx, 1.12, cz, 3.2, .05, .8); const cc = [cx - 1.6, cx + 1.6, cz - .4, cz + .4]; W.cols.push(cc); s.cols.push(cc);
  const bell = new THREE.Mesh(new THREE.SphereGeometry(.07, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), M(0xd8b048, .2, .9)); bell.position.set(cx + .9, 1.15, cz); g.add(bell);
  if (r.equip.lockers) for (let i = 0; i < 6; i++) box(g, M([0x3a7ad8, 0xe8a030][i % 2], .4, .4), x1 - .4, .5 + (i % 3) * .55, z0 + 4.6 + Math.floor(i / 3) * .6, .5, .5, .55);
  if (r.equip.breakfast) { box(g, M(0x8a5a3a), x0 + 1.4, .45, z1 - 3.2, 1.6, .9, .7); for (let i = 0; i < 3; i++) box(g, M([0xffc83a, 0xe8302a, 0xf4f0e4][i]), x0 + .9 + i * .5, 1, z1 - 3.2, .3, .2, .3) }
  s.roomVis = []; for (let i = 0; i < n; i++) { const rx = x0 + rw * (i + .5), rz = z0 + 1.5, q = R[i];
    if (i > 0) { const pc = [x0 + rw * i - .05, x0 + rw * i + .05, z0, z0 + 3]; box(g, M(0xe8dcc8, .9), x0 + rw * i, 1.3, z0 + 1.5, .1, 2.6, 3); W.cols.push(pc); s.cols.push(pc) }
    const bedW = q.type === 'private' ? Math.min(1.4, rw - .4) : Math.min(.9, rw - .5); box(g, M(0x5a3a24), rx, .25, rz, bedW, .3, 1.9); if (q.type === 'dorm') { box(g, M(0x5a3a24), rx, 1.35, rz, bedW, .12, 1.9); for (const sx of [-1, 1]) box(g, M(0x3a3a3a, .4, .5), rx + sx * bedW / 2, .8, rz + .9, .05, 1.6, .05) }
    const neat = box(g, M(0xf4f4f0, .9), rx, .44, rz, bedW * .96, .08, 1.8), messy = new THREE.Group(); for (let k = 0; k < 4; k++) box(messy, M([0xc83a3a, 0x8a6a4a, 0xf4f4f0, 0x3a5ac8][k], .9), (k - 1.5) * bedW * .2, .5 + (k % 2) * .06, (k % 3 - 1) * .4, bedW * .35, .12, .5); messy.position.set(rx, 0, rz); g.add(messy);
    const cur = box(g, M(0x6a3a8a, .9), rx, 1.25, z0 + 3, rw - .3, 2.5, .05); const cc2 = [rx - bedW / 2 - .05, rx + bedW / 2 + .05, rz - .95, rz + .95]; W.cols.push(cc2); s.cols.push(cc2);
    s.roomVis.push({ neat, messy, cur, door: [rx, z0 + 3.5] });
    T({ x: rx, z: z0 + 3.7, r: Math.max(.9, rw * .55), kind: 'shop', show: () => hostelRooms(rec(id))[i] && hostelRooms(rec(id))[i].st === 'dirty', label: () => '🧺 ' + tr('Clean room ', 'Limpiar habitación ') + (i + 1) + tr(' (1 linen set)', ' (1 juego de sábanas)'), fn: () => VT.cleanRoom(id, i) }) }
  s.supplyAt = [x0 + .8, z1 - 1.2]; T({ x: cx, z: cz + 1.4, r: 2.2, kind: 'shop', label: () => { const qq = queue(id); return '🛎️ ' + (qq.length ? tr('Reception: check in (' + qq.length + ' waiting)', 'Recepción: registrar (' + qq.length + ' esperando)') : tr('Reception, no guests waiting', 'Recepción, nadie esperando')) }, fn: () => VT.serve(id) });
  roomVis(id) }
function roomVis(id) { const s = G && G.sites[id], r = rec(id); if (!s || !s.roomVis || !r) return; hostelRooms(r).forEach((q, i) => { const v = s.roomVis[i]; if (!v) return; v.neat.visible = q.st === 'clean'; v.messy.visible = q.st === 'dirty'; v.cur.visible = q.st === 'occ' }) }
VT.roomVis = roomVis;

/* ======================= farm (virtual cultivation, fictional) ======================= */
const STAGES = [L('seedling', 'plántula'), L('young plant', 'planta joven'), L('leafy', 'frondosa'), L('flowering', 'en flor'), L('ready to harvest', 'lista para cosechar')];
VT.STAGES = STAGES;
const stageOf = p => !p ? -1 : p.g >= 1 ? 4 : Math.min(3, Math.floor(p.g * 4));
function growFarm(r) { const now = AV.abs(), from = r.growAbs || now; r.growAbs = now; let mins = Math.min(72 * 60, now - from); const lights = !!r.equip.lights, drip = !!r.equip.drip, grower = r.staff.some(s => s.role === 'grower');
  while (mins > 0) { const m = Math.min(30, mins); mins -= m; for (const p of r.plots) { if (!p) continue; const Cp = CROPS[p.c]; if (drip || grower) p.w = Math.max(p.w, 70); p.w = Math.max(0, p.w - m / 60 * 9);
      if (p.w > 15 && p.g < 1) p.g = Math.min(1, p.g + m / 60 / Cp.hrs * (lights ? 1.6 : 1) * (p.care ? 1.15 : 1) * (.5 + p.hp / 200)); if (p.w <= 0) p.hp = Math.max(0, p.hp - m / 60 * 6); else p.hp = Math.min(100, p.hp + m / 60 * 2) }
    if (grower) r.plots.forEach((p, i) => { if (p && p.g >= 1) harvestPlot(r, i, true) }) } }
VT.plant = function (id, i, crop) { const r = rec(id), P = LIST[id]; if (!active(r)) return false; const Cp = CROPS[crop]; if (!Cp || !(P.crops || []).includes(crop)) return false; if (Cp.adult && fam()) return fail(tr('Not available in Family mode.', 'No disponible en modo familia.'));
  if (r.plots[i]) return fail(tr('That planter is in use.', 'Esa jardinera está ocupada.')); if (!pay(r, Cp.seed, tr('Seeds: ', 'Semillas: ') + say(Cp.n))) return fail(tr('Seeds cost ' + Cp.seed + '.', 'Las semillas cuestan ' + Cp.seed + '.'));
  growFarm(r); r.plots[i] = { c: crop, g: 0, w: 60, hp: 100, care: 0, t: AV.abs() }; VT.stats.planted++; AV.save(); plantVis(id); snd('ok'); return true };
VT.water = (id, i) => { const r = rec(id), p = r && r.plots[i]; if (!p) return false; growFarm(r); p.w = 100; snd('splash'); AV.toast('💧 ' + tr('Watered.', 'Regada.')); AV.save(); plantVis(id); return true };
VT.tend = (id, i) => { const r = rec(id), p = r && r.plots[i]; if (!p) return false; growFarm(r); if (p.care) return AV.toast(tr('Already tended today.', 'Ya cuidada hoy.')); p.care = 1; p.hp = Math.min(100, p.hp + 15); AV.toast('✂️ ' + tr('Pruned and checked: healthier and a bit faster.', 'Podada y revisada: más sana y algo más rápida.')); AV.save(); plantVis(id); return true };
function harvestPlot(r, i, quiet) { const p = r.plots[i], Cp = CROPS[p.c]; const n = Math.max(1, Math.round((Cp.yield[0] + Math.random() * (Cp.yield[1] - Cp.yield[0])) * (p.hp / 100) * (p.care ? 1.2 : 1))); r.stock[Cp.item] = (r.stock[Cp.item] || 0) + n; r.harvested = (r.harvested || 0) + n; r.plots[i] = null; VT.stats.harvested += n;
  r.missions.harvest = 1; log(r, tr('Harvest: ', 'Cosecha: ') + n + ' × ' + say(Cp.n), 0); if (!quiet) { snd('ok'); AV.toast('🧺 ' + tr('Harvested ', 'Cosechado ') + n + ' × ' + Cp.ic + ' ' + say(Cp.n) + tr(' → farm stand stock.', ' → al puesto de la granja.')) } return n }
VT.harvest = (id, i) => { const r = rec(id), p = r && r.plots[i]; if (!p) return 0; growFarm(r); if (p.g < 1) return fail(tr('Not ready yet (' + Math.round(p.g * 100) + ' %).', 'Aún no está lista (' + Math.round(p.g * 100) + ' %).')), 0; const n = harvestPlot(r, i); AV.save(); plantVis(id); return n };
VT.trim = function (id) { const r = rec(id); if (!r.equip.trim) return fail(tr('Buy the trimming table first.', 'Compra antes la mesa de manicura.')); if ((r.stock.herb || 0) < 2) return fail(tr('Needs 2 herb pouches in stock.', 'Necesita 2 bolsitas en el almacén.')); r.stock.herb -= 2; r.stock.pre = (r.stock.pre || 0) + 3; AV.toast('🌿 ' + tr('2 pouches → 3 pre-rolls for the stand.', '2 bolsitas → 3 porros para el puesto.')); AV.save(); return true };
VT.take = function (id, item, n) { const r = rec(id); n = n || 1; if ((r.stock[item] || 0) < n) return fail(tr('Not in stock.', 'No hay en el almacén.')); r.stock[item] -= n; AV.bag.add(item, n); AV.save(); return true };
const MISSIONS = VT.MISSIONS = { harvest: { n: L('First harvest', 'Primera cosecha'), r: 100, ok: r => r.missions.harvest }, shelf: { n: L('Stock the stand with 10 items', 'Llena el puesto con 10 artículos'), r: 150, ok: r => Object.values(r.stock).reduce((a, b) => a + b, 0) >= 10 },
  nube: { n: L('Contract: 4 herb pouches for La Nube (Madrid)', 'Contrato: 4 bolsitas para La Nube (Madrid)'), r: 320, item: ['herb', 4], adult: 1, farm: 'pai_farm' }, cafe: { n: L('Contract: 6 strawberry punnets for a Chiang Mai café', 'Contrato: 6 fresas para un café de Chiang Mai'), r: 110, item: ['strawberries', 6], farm: 'pai_farm' },
  zibb: { n: L('Contract: 3 float fruit for Zibb’s cart', 'Contrato: 3 frutas flotantes para el carrito de Zibb'), r: 160, item: ['float_fruit', 3], farm: 'a9_dome' } };
VT.mission = function (id, k) { const r = rec(id), m = MISSIONS[k]; if (!r || !m || (r.missions[k + '_done'])) return false; if (m.item) { if ((r.stock[m.item[0]] || 0) < m.item[1]) return fail(tr('Need ' + m.item[1] + ' in stock.', 'Necesitas ' + m.item[1] + ' en el almacén.')); r.stock[m.item[0]] -= m.item[1] } else if (!m.ok(r)) return fail(tr('Not done yet.', 'Aún no.'));
  r.missions[k + '_done'] = AV.S.day; AV.txn(m.r, r.name + ': ' + say(m.n)); log(r, tr('Mission: ', 'Misión: ') + say(m.n), m.r); r.rep = Math.min(100, r.rep + 5); snd('cash'); AV.toast('🏆 ' + say(m.n) + ' +' + m.r); AV.save(); return true };
function farmHall(W, id, s, T, g, x0, x1, z0, z1) {
  const r = rec(id), P = LIST[id]; s.plants = []; const n = r.plots.length, alien = P.w === 'astro9';
  for (let i = 0; i < n; i++) { const px = x0 + 2 + (i % 4) * 2.6, pz = z0 + 2 + Math.floor(i / 4) * 2.3; box(g, M(alien ? 0x3a3a5a : 0x6a4a2a, .8), px, .3, pz, 1.6, .6, 1, 0); box(g, M(0x3a2a1a, 1), px, .61, pz, 1.5, .02, .9); const cc = [px - .8, px + .8, pz - .5, pz + .5]; W.cols.push(cc); s.cols.push(cc);
    const pg = new THREE.Group(); pg.position.set(px, .62, pz); g.add(pg); s.plants.push(pg);
    if (r.equip.lights) { const lamp = box(g, M(0xeeeeff, .3, .2, alien ? 0xb07aff : 0xffb0ff, .9), px, 2.6, pz, 1.2, .08, .4) }
    if (r.equip.drip) box(g, M(0x2a2a2a), px, .7, pz - .45, 1.5, .03, .03);
    T({ x: px, z: pz + .9, r: 1.3, kind: 'shop', label: () => plotLabel(id, i), fn: () => VT.plotPanel(id, i) }) }
  /* the farm stand: customers buy your harvest here */
  const sx = x1 - 2, sz = z0 + 2; box(g, M(0x8a6a3a), sx, .5, sz, 2, 1, .8); box(g, M(0xf4ead0), sx, 1.02, sz, 2.1, .05, .9); s.counter = [sx, sz]; const cc = [sx - 1, sx + 1, sz - .4, sz + .4]; W.cols.push(cc); s.cols.push(cc); s.stand = new THREE.Group(); g.add(s.stand);
  T({ x: sx, z: sz + 1.3, r: 1.8, kind: 'shop', label: () => '🧺 ' + tr('Farm stand: stock + prices', 'Puesto: almacén y precios'), fn: () => VT.panel(id, 'stock') });
  if (r.equip.trim) { box(g, M(0x5a5a5a, .4, .4), x0 + 1.4, .45, z1 - 3.4, 1.2, .9, .7); T({ x: x0 + 1.4, z: z1 - 2.6, r: 1.4, kind: 'shop', label: () => '✂️ ' + tr('Trimming table: 2 pouches → 3 pre-rolls', 'Mesa: 2 bolsitas → 3 porros'), fn: () => VT.trim(id) }) }
  plantVis(id) }
function plotLabel(id, i) { const r = rec(id); growFarm(r); const p = r.plots[i]; if (!p) return '🌱 ' + tr('Empty planter: plant seeds', 'Jardinera vacía: plantar'); const Cp = CROPS[p.c], s = stageOf(p);
  return Cp.ic + ' ' + say(Cp.n) + ' · ' + say(STAGES[s]) + ' ' + Math.round(p.g * 100) + '% · 💧' + Math.round(p.w) + (p.w < 20 ? ' ⚠️' : '') }
VT.plotPanel = function (id, i) { const r = rec(id), P = LIST[id]; growFarm(r); const p = r.plots[i];
  if (!p) { const opts = (P.crops || []).filter(c => !(CROPS[c].adult && fam())); const pp = AV.panel('cmp', '<b>🌱 ' + tr('Plant', 'Plantar') + '</b><div class="note">' + tr('Fictional crops, abstract growing: water, light and care decide speed and yield.', 'Cultivos ficticios y abstractos: agua, luz y cuidados deciden velocidad y cosecha.') + '</div><div class="grid">' + opts.map(c => '<button data-c="' + c + '">' + CROPS[c].ic + ' ' + say(CROPS[c].n) + '<small>' + tr('seeds ', 'semillas ') + CROPS[c].seed + '¢ · ~' + CROPS[c].hrs + tr(' game h', ' h de juego') + '</small></button>').join('') + '</div><div class="note" id="vtMsg"></div><button data-close>' + tr('Close', 'Cerrar') + '</button>');
    pp.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { if (VT.plant(id, i, b.dataset.c)) AV.closePanel('cmp') }); return }
  const Cp = CROPS[p.c], s = stageOf(p); const pp = AV.panel('cmp', '<b>' + Cp.ic + ' ' + say(Cp.n) + '</b><div class="note">' + say(STAGES[s]) + ' · ' + tr('growth ', 'crecimiento ') + Math.round(p.g * 100) + '% · 💧 ' + Math.round(p.w) + ' · ❤️ ' + Math.round(p.hp) + (r.equip.lights ? ' · 💡' : '') + '</div><div class="row"><button id="pW">💧 ' + tr('Water', 'Regar') + '</button><button id="pT">✂️ ' + tr('Tend', 'Cuidar') + '</button><button id="pH"' + (s < 4 ? ' disabled' : '') + '>🧺 ' + tr('Harvest', 'Cosechar') + '</button></div><div class="note" id="vtMsg"></div><button data-close>' + tr('Close', 'Cerrar') + '</button>');
  AV.$('pW').onclick = () => { VT.water(id, i); VT.plotPanel(id, i) }; AV.$('pT').onclick = () => { VT.tend(id, i); VT.plotPanel(id, i) }; AV.$('pH').onclick = () => { VT.harvest(id, i); AV.closePanel('cmp') } };
/* visible growth stages */
function plantVis(id) { const s = G && G.sites[id], r = rec(id); if (!s || !s.plants) return; r.plots.forEach((p, i) => { const pg = s.plants[i]; if (!pg) return; pg.clear(); if (!p) return; const Cp = CROPS[p.c], st2 = stageOf(p), k = .15 + p.g * .85, dry = p.w < 15 || p.hp < 40, leaf = M(dry ? 0x8a7a3a : Cp.col, .8);
  for (let j = 0; j < 3; j++) { const ox = (j - 1) * .45, h = .9 * k; const stem = new THREE.Mesh(new THREE.CylinderGeometry(.02, .03, h, 5), M(0x4a6a2a)); stem.position.set(ox, h / 2, 0); pg.add(stem);
    for (let q = 0; q < 2 + st2; q++) { const lf = new THREE.Mesh(new THREE.ConeGeometry(.12 * k + .03, .3 * k + .05, 5), leaf); lf.position.set(ox + Math.cos(q * 2.4) * .12 * k, h * (.35 + q * .14), Math.sin(q * 2.4) * .12 * k); lf.rotation.z = Math.cos(q * 2.4) * .9; lf.rotation.x = Math.sin(q * 2.4) * .9; pg.add(lf) }
    if (st2 >= 3) for (let q = 0; q < (st2 >= 4 ? 4 : 2); q++) { const bd = new THREE.Mesh(new THREE.SphereGeometry(.06 + (st2 >= 4 ? .03 : 0), 8, 6), M(Cp.bud, .5, 0, Cp.alien ? Cp.bud : null, .7)); bd.position.set(ox + (q % 2 - .5) * .1, h * (.7 + q * .08), (q > 1 ? .06 : -.06)); pg.add(bd) } }
  if (p.w > 70) { const wt = new THREE.Mesh(new THREE.CircleGeometry(.6, 12), M(0x2a1a10, .2)); wt.rotation.x = -Math.PI / 2; wt.position.y = .005; pg.add(wt) } }) }
VT.plantVis = plantVis;

/* ======================= delivery (courier depot) ======================= */
let job = null; VT.jobNow = () => job;
function depot(W, id, s, T, g, x0, x1, z0, z1) { const r = rec(id); for (let i = 0; i < 3; i++) { box(g, M(0x5a5a5a, .5, .4), x0 + 3 + i * 3, 1.2, z0 + .5, 2.4, .05, .7); for (let k = 0; k < 5; k++) box(g, M(0xb8864a, .9), x0 + 2.2 + i * 3 + k * .4, 1.42, z0 + .5, .32, .35, .4) }
  if (r.equip.cargo) { box(g, M(0x2a8ac8, .4, .3), x1 - 3, .5, z, 2, .6, .8); for (const wx of [-.8, .8]) { const wh = new THREE.Mesh(new THREE.TorusGeometry(.3, .05, 6, 16), M(0x1a1a1a)); wh.position.set(x1 - 3 + wx, .3, z + .45); g.add(wh) } }
  const bt = canvasTex(512, 256, (c, w, h) => { c.fillStyle = '#1a1a1a'; c.fillRect(0, 0, w, h); c.fillStyle = '#f4d84a'; c.font = 'bold 48px Georgia'; c.textAlign = 'center'; c.fillText('📦 ' + tr('JOBS', 'ENCARGOS'), w / 2, 80); c.font = '26px Georgia'; c.fillStyle = '#fff'; c.fillText(tr('take one · beat the clock', 'coge uno · gana al reloj'), w / 2, 140) });
  const bp = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.2), new THREE.MeshStandardMaterial({ map: bt, emissive: 0xffffff, emissiveMap: bt, emissiveIntensity: .3 })); bp.position.set((x0 + x1) / 2, 1.9, z0 + .1); g.add(bp);
  T({ x: (x0 + x1) / 2, z: z0 + 1.6, r: 2, kind: 'shop', label: () => job ? '📦 ' + tr('Job in progress: ', 'Encargo en curso: ') + job.to.name : '📦 ' + tr('Take a delivery job', 'Coger un encargo'), fn: () => VT.job(id) }) }
VT.job = function (id) { const r = rec(id), W = AV.W; if (!r.open) return fail(tr('Open the depot first (📋 Manage).', 'Abre primero el depósito (📋 Gestión).')); if (job) return AV.toast(tr('Finish the current job first: ', 'Termina antes el encargo: ') + job.to.name);
  const fr = G.sites[id].fr, pl = (W.places || []).filter(p => !p.hidden && p.x != null && !/^vent_/.test(p.id || '') && p.x < 1500 && Math.hypot(p.x - fr.x, p.z - fr.z) > 70 && Math.hypot(p.x - fr.x, p.z - fr.z) < 600);
  if (!pl.length) return fail(tr('No destinations in range.', 'No hay destinos al alcance.')); const n = r.equip.cargo ? 2 : 1, picks = []; for (let k = 0; k < n; k++) { const p = pl[Math.floor(Math.random() * pl.length)]; if (!picks.includes(p)) picks.push(p) }
  const to = picks[0], d = Math.hypot(to.x - fr.x, to.z - fr.z), secs = Math.round(d / 2.6 + 45); job = { id, drops: picks.map(p => ({ x: p.x, z: p.z, name: say(p.name) })), to: { x: to.x, z: to.z, name: say(to.name) }, t0: AV.now(), secs, d, pay: Math.round(18 + d * .12 + (r.equip.board ? 10 : 0)) };
  AV.bag.add('parcel', job.drops.length, true); AV.minimap && AV.minimap.setDest && AV.minimap.setDest(to.x, to.z, '📦 ' + job.to.name); addDrops(); AV.closePanel('cmp');
  AV.toast('📦 ' + tr('Deliver to ', 'Entrega en ') + job.to.name + ' · ' + Math.round(d) + ' m · ' + secs + 's · ' + job.pay + '¢ ' + tr('(GPS set)', '(GPS puesto)')); goOut(id); return true };
function addDrops() { const W = AV.W; if (!job) return; job.T = job.T || []; for (const dr of job.drops) { if (dr.T) continue; dr.T = { x: dr.x, z: dr.z, r: 5, kind: 'shop', label: () => '📦 ' + tr('Deliver the parcel: ', 'Entregar el paquete: ') + dr.name, fn: () => deliver(dr) }; W.T.push(dr.T) } }
function deliver(dr) { const W = AV.W, r = rec(job.id); const i = W.T.indexOf(dr.T); if (i >= 0) W.T.splice(i, 1); job.drops.splice(job.drops.indexOf(dr), 1); AV.bag.remove('parcel'); const late = AV.now() - job.t0 > job.secs, v = late ? Math.round(job.pay * .5) : job.pay + (AV.now() - job.t0 < job.secs * .6 ? 8 : 0);
  AV.txn(v, r.name + tr(': delivery', ': entrega')); log(r, tr('Delivered to ', 'Entregado en ') + dr.name + (late ? tr(' (late)', ' (tarde)') : ''), v); r.rep = Math.min(100, Math.max(0, r.rep + (late ? -2 : 2))); r.sold++; r.today.served++; VT.stats.delivered++; snd('cash');
  AV.toast('📦 ' + (late ? tr('Late, but delivered: ', 'Tarde, pero entregado: ') : tr('Delivered on time! ', '¡Entregado a tiempo! ')) + '+' + v + '¢'); if (!job.drops.length) { job = null; AV.minimap && AV.minimap.clearDest && AV.minimap.clearDest() } else { const n2 = job.drops[0]; AV.minimap.setDest(n2.x, n2.z, '📦 ' + n2.name) } AV.save() }
VT._deliverAll = () => { while (job && job.drops.length) deliver(job.drops[0]) };

/* ======================= frame: customers, staff, stand sales ======================= */
let spawnT = 0, staffT = 0, standT = 0, simT = 0;
AV.frameFns.push(dt => {
  const W = AV.W; if (!W || !AV.S || !AV.running) return; if (G && G.W !== W) { G = null; custs.length = 0 }
  for (let k = custs.length - 1; k >= 0; k--) { const c = custs[k], s = G && G.sites[c.id]; if (!s) { custs.splice(k, 1); continue } c.a.A && c.a.A.update && c.a.A.update(dt);
    if (c.state === 'in' || c.state === 'queue') { const q = queue(c.id), i = c.state === 'queue' ? q.indexOf(c) : q.length, tx = s.counter[0] - 1.2 + i * .1, tz = s.counter[1] + 1 + i * .9; if (walkTo(c, tx, tz, dt)) { if (c.state === 'in') { c.state = 'queue'; c.t0 = AV.now() } c.a.h.rotation.y = Math.PI } if (c.state === 'queue' && AV.now() - c.t0 > c.pat) leave(c, true) }
    else if (c.state === 'sit') { if (walkTo(c, c.table.seat[0], c.table.seat[1], dt)) { c.sitT -= dt; if (c.sitT <= 0) { const r = rec(c.id); r.dirty = r.dirty || []; r.dirty[c.table.i] = 1; c.table.mess.visible = true; c.table.busy = null; c.state = 'out' } } }
    else if (c.state === 'room') { const rm = s.roomVis && s.roomVis[c.room]; if (!rm || walkTo(c, rm.door[0], rm.door[1], dt)) { c.a.h.parent && c.a.h.parent.remove(c.a.h); custs.splice(k, 1) } }
    else if (c.state === 'out' || c.state === 'served') { if (walkTo(c, s.in.x, s.in.z, dt)) { c.a.h.parent && c.a.h.parent.remove(c.a.h); custs.splice(k, 1) } } }
  if (!G) { if ((simT -= dt) <= 0) { simT = 3; tickAll() } return }
  for (const id in G.sites) { const s = G.sites[id]; if (s.staffA) for (const a of s.staffA) a.A && a.A.update && a.A.update(dt) }
  if ((simT -= dt) <= 0) { simT = 3; tickAll() }
  /* customers arrive while open, at opening hours, and you (or staff) are there */
  if ((spawnT -= dt) <= 0) { spawnT = 3; for (const id in G.sites) { const r = rec(id), s = G.sites[id], P = LIST[id]; if (!s.counter || !VT.isTrading(id)) continue; const here = VT.inside === id || Math.hypot(AV.P.x - P.ix, AV.P.z) < 12, staffed = r.staff.some(q => /barista|bartender|seller/.test(q.role));
    if (!here && !staffed) continue; const night = AV.S.time > 21 * 60 || AV.S.time < 3 * 60, rate = P.foot * CATS[r.cat].foot * (r.rep / 50) * (1 + r.deco * .12) * (r.equip.sound && night ? 1.4 : 1) * (r.cat === 'farm' ? (Object.values(r.stock).some(v => v > 0) ? 1 : 0) : 1);
    if (custs.filter(c => c.id === id).length < (r.cat === 'farm' ? 2 : 5) && Math.random() < rate / 60) { if (r.cat === 'farm') standCustomer(id); else spawnCustomer(id) } } }
  /* staff serve when you are not behind the counter */
  if ((staffT -= dt) <= 0) { staffT = 1; for (const id in G.sites) { const r = rec(id), s = G.sites[id]; if (!s.counter || r.cat === 'farm') continue; const sv = r.staff.filter(q => q.role === 'barista' || q.role === 'bartender' || q.role === 'receptionist').length; if (!sv) continue; const meThere = VT.inside === id && Math.hypot(AV.P.x - s.counter[0], AV.P.z - s.counter[1]) < 3.2; if (meThere) continue;
    s.sAcc = (s.sAcc || 0) + sv * (r.equip.grinder ? 1.4 : 1); if (s.sAcc < 9) continue; s.sAcc = 0; const c = queue(id)[0]; if (!c) continue; if (c.tipsy && r.staff.some(q => q.role === 'door')) { VT.stats.refused++; leave(c); continue } if (!can(r, c.order)) { leave(c, true); continue } if (r.cat === 'hostel') { VT.checkin(id, hostelRooms(r).findIndex(q => q.type === c.order && q.st === 'clean'), true); VT.stats.staffServed++; continue } VT.pay(id, c, .7); VT.stats.staffServed++ }
    r_cleaner() }
});
function r_cleaner() { if (!G) return; for (const id in G.sites) { { const r = rec(id); if (r && r.cat === 'hostel' && r.staff.some(q => q.role === 'housekeeper') && Math.random() < .06) { const i = hostelRooms(r).findIndex(q => q.st === 'dirty'); if (i >= 0 && (r.sup.linen || 0) > 0) VT.cleanRoom(id, i, true) } } const r = rec(id), s = G.sites[id]; if (!s.tables || !r.staff.some(q => q.role === 'cleaner') || !r.dirty) continue; const i = r.dirty.findIndex(v => v); if (i >= 0 && Math.random() < .08) { r.dirty[i] = 0; s.tables[i].mess.visible = false } } }
/* farm stand customers: walk up, buy one item from your stock at your price */
function standCustomer(id) { const s = G.sites[id], r = rec(id), items = Object.keys(r.stock).filter(k => r.stock[k] > 0 && !((AV.ITEMS[k] || {}).adult && fam())); if (!items.length) return; const it = items[Math.floor(Math.random() * items.length)], a = actor(2000 + Math.floor(Math.random() * 500)); if (!a) return;
  a.h.position.set(s.in.x, 0, s.in.z); s.ig.add(a.h); const c = { id, a, order: it, state: 'stand', t0: AV.now(), qi: 0, b: bubble((AV.ITEMS[it] || {}).ic || '🧺') }; a.h.add(c.b); custs.push(c); VT.stats.walkins++ }
VT.standCustomer = id => standCustomer(id);
AV.frameFns.push(dt => { if (!G) return; for (const c of custs) { if (c.state !== 'stand') continue; const s = G.sites[c.id]; if (walkTo(c, s.counter[0], s.counter[1] + 1.1, dt)) { const r = rec(c.id), k = c.order, cropK = Object.keys(CROPS).find(q => CROPS[q].item === k), price = r.prices[k] != null ? r.prices[k] : cropK ? CROPS[cropK].price : (AV.ITEMS[k] || {}).price || 10, b = cropK ? CROPS[cropK].price : (AV.ITEMS[k] || {}).price || 10;
  const here = VT.inside === c.id || r.staff.some(q => q.role === 'seller'); if (here && (r.stock[k] || 0) > 0 && Math.random() < Math.min(.95, .7 * Math.pow(b / price, 1.6))) { r.stock[k]--; AV.txn(price, r.name + tr(': stand sale', ': venta del puesto')); log(r, tr('Stand: ', 'Puesto: ') + ((AV.ITEMS[k] || {}).n || [k])[0], price); r.sold++; r.today.served++; VT.stats.served++; snd('cash', { x: s.counter[0], z: s.counter[1] }); r.rep = Math.min(100, r.rep + .4) } else r.rep = Math.max(0, r.rep - .3);
  c.state = 'out'; c.b.visible = false; AV.save() } } });
function tickAll() { const S = st(); for (const id in S) { const r = S[id]; dayTick(r, id); if (r.cat === 'farm') { growFarm(r); if (G && G.sites[id]) plantVis(id) } else if (!(AV.W && AV.W.id === LIST[id].w && VT.inside === id)) { if (!(AV.W && AV.W.id === LIST[id].w)) simAway(r, id); else r.simAbs = AV.abs() } }
  if (job && AV.now() - job.t0 > job.secs && !job.warned) { job.warned = 1; AV.toast('⏰ ' + tr('The delivery is late — half pay now. Still worth finishing!', 'El encargo va tarde — media paga. ¡Aun así termínalo!')) } }
VT.tick = tickAll;
VT._ff = function (id, mins) { const r = rec(id); if (!r) return; if (r.cat === 'farm') { r.growAbs = (r.growAbs || AV.abs()) - mins; growFarm(r); plantVis(id) } else { r.simAbs = AV.abs() - mins; simAway(r, id) } };

/* ======================= world entry ======================= */
const prevE = AV.onWorldEnter; AV.onWorldEnter = function (W) { if (prevE) prevE(W); G = null; custs.length = 0; VT.inside = null; if (job && job.w && job.w !== W.id) job = null; for (const id in LIST) if (LIST[id].w === W.id) try { build(W, id) } catch (e) { console.warn('venture build', id, e) } if (job) { job.w = W.id; addDrops() } };

/* ======================= Manage panel ======================= */
const CSS = '<style>#cmp .vt-tabs{display:flex;gap:5px;flex-wrap:wrap;margin:6px 0}#cmp .vt-tabs button.on{outline:2px solid #ffd84a}#cmp table.vt{width:100%;font-size:12px;border-collapse:collapse}#cmp table.vt td{padding:2px 4px;border-bottom:1px solid rgba(255,255,255,.1)}#cmp .vt-kpi{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:6px 0}#cmp .vt-kpi div{background:rgba(255,255,255,.08);border-radius:8px;padding:6px;text-align:center;font-size:12px}#cmp .vt-kpi b{display:block;font-size:16px}</style>';
VT.panel = function (id, tab) { const P = LIST[id], r = rec(id), C = CATS[P.cat]; VT.live = id; tab = tab || VT.tab || 'over'; VT.tab = tab; const on = active(r);
  if (!on) { const p = AV.panel('cmp', CSS + '<b>' + C.ic + ' ' + say(P.name) + '</b><div class="note">' + say(C.n) + ' · ' + tr('footfall ', 'afluencia ') + P.foot + '/10<br>' + tr('Lease: ', 'Alquiler: ') + P.rent + '¢ / ' + P.days + tr(' days · Buy: ', ' días · Comprar: ') + P.price + '¢ (' + tr('lease first, then buy from Manage', 'primero alquila; compra desde Gestión') + ')</div>' + (r ? '<div class="note">' + tr('Your equipment and stock are still here: renew to reopen.', 'Tu equipo y almacén siguen aquí: renueva para reabrir.') + '</div>' : '') + '<div class="note" id="vtMsg"></div><div class="row"><button id="vtLease">🔑 ' + tr('Lease ' + P.days + ' days', 'Alquilar ' + P.days + ' días') + ' · ' + P.rent + '</button><button data-close>' + tr('Close', 'Cerrar') + '</button></div>');
    AV.$('vtLease').onclick = () => { if (VT.acquire(id)) VT.panel(id, 'over') }; return p }
  const tabs = [['over', tr('Overview', 'Resumen')], ['equip', tr('Equipment + décor', 'Equipo y décor')], ['staff', tr('Staff', 'Personal')], ['premises', tr('Premises', 'Local')]];
  if (C.supplies) tabs.splice(1, 0, ['sup', tr('Supplies', 'Suministros')], ['menu', tr('Menu + prices', 'Carta y precios')]); if (P.cat === 'farm') tabs.splice(1, 0, ['stock', tr('Stock + prices', 'Almacén y precios')], ['miss', tr('Contracts', 'Contratos')]);
  let h = CSS + '<b>' + C.ic + ' ' + esc(r.name) + '</b> · ' + say(C.n) + ' · ' + (r.open ? '🟢 ' + tr('open', 'abierto') : '🔴 ' + tr('closed', 'cerrado')) + '<div class="vt-tabs">' + tabs.map(t => '<button data-t="' + t[0] + '"' + (t[0] === tab ? ' class="on"' : '') + '>' + t[1] + '</button>').join('') + '</div>';
  if (tab === 'over') { const q = custs.filter(c => c.id === id).length; h += '<div class="vt-kpi"><div>' + tr('Reputation', 'Reputación') + '<b>' + Math.round(r.rep) + '</b></div><div>' + tr('Today', 'Hoy') + '<b>' + (r.today.rev - r.today.cost) + '¢</b></div><div>' + tr('Served today', 'Atendidos hoy') + '<b>' + r.today.served + '</b></div><div>' + tr('In now', 'Dentro ahora') + '<b>' + q + '</b></div></div>' +
      '<div class="note">' + tr('All time: revenue ', 'Total: ingresos ') + r.rev + ' · ' + tr('costs ', 'gastos ') + r.cost + ' · ' + tr('profit ', 'beneficio ') + (r.rev - r.cost) + ' · ' + tr('sales ', 'ventas ') + r.sold + '<br>' + tr('Hours ', 'Horario ') + C.open + ':00–' + (C.close % 24) + ':00 · ' + tr('Daily costs: wages ', 'Gastos diarios: sueldos ') + r.staff.reduce((a, s) => a + s.wage, 0) + ' + ' + tr('utilities ', 'suministros ') + (10 + Object.keys(r.equip).length * 6) + '</div>' +
      '<div class="row"><button id="vtOpen">' + (r.open ? '🔴 ' + tr('Close up', 'Cerrar') : '🟢 ' + tr('Open for business', 'Abrir al público')) + '</button></div>' + '<details open><summary>' + tr('Ledger', 'Libro de cuentas') + '</summary><table class="vt">' + r.ledger.slice(0, 12).map(l => '<tr><td>' + tr('Day ', 'Día ') + l.d + ' ' + String(l.h).padStart(2, '0') + 'h</td><td>' + esc(l.t) + '</td><td style="text-align:right">' + (l.a > 0 ? '+' : '') + l.a + '</td></tr>').join('') + '</table></details>' }
  if (tab === 'sup') h += '<table class="vt">' + Object.keys(C.supplies).map(k => { const S2 = C.supplies[k]; return '<tr><td>' + say(S2[0]) + '</td><td><b>' + (r.sup[k] || 0) + '</b></td><td><button data-sup="' + k + '">+' + S2[1] + ' · ' + S2[2] + '¢</button></td></tr>' }).join('') + '</table><div class="note">' + tr('Crates by the back wall show what is left. Running out turns customers away.', 'Las cajas junto a la pared muestran lo que queda. Si se acaba, los clientes se van.') + '</div>';
  if (tab === 'menu') h += '<table class="vt">' + Object.keys(C.menu).filter(k => !(C.menu[k].adult && fam())).map(k => { const m = C.menu[k], pr = VT.priceOf(r, k); return '<tr><td>' + m.ic + ' ' + say(m.n) + (can(r, k) ? '' : ' <small>(' + tr('can’t make', 'no disponible') + ')</small>') + '</td><td>' + (m.p ? '<button data-pm="' + k + '">−</button> <b>' + pr + '</b> <button data-pp="' + k + '">+</button>' : tr('free', 'gratis')) + '</td><td><small>' + tr('base ', 'base ') + m.p + '</small></td></tr>' }).join('') + '</table><div class="note">' + tr('Prices stay between 50 % and 200 % of the base. Cheap = happy regulars and tips; expensive = more per sale, slower reputation.', 'Los precios van del 50 % al 200 % de la base. Barato = clientes contentos y propinas; caro = más por venta, menos reputación.') + '</div>';
  if (tab === 'stock') h += '<table class="vt">' + (Object.keys(r.stock).filter(k => r.stock[k] > 0).map(k => { const pr = r.prices[k] != null ? r.prices[k] : (Object.values(CROPS).find(c => c.item === k) || AV.ITEMS[k] || {}).price || 10; return '<tr><td>' + ((AV.ITEMS[k] || {}).ic || '') + ' ' + say((AV.ITEMS[k] || { n: [k, k] }).n) + '</td><td><b>' + r.stock[k] + '</b></td><td>' + pr + '¢ <button data-sm="' + k + '">−</button><button data-sp="' + k + '">+</button></td><td><button data-take="' + k + '">' + tr('Take 1', 'Coger 1') + '</button></td></tr>' }).join('') || '<tr><td>' + tr('Nothing harvested yet.', 'Aún no hay cosecha.') + '</td></tr>') + '</table>' + (r.equip.trim ? '<div class="row"><button id="vtTrim">✂️ ' + tr('Trim 2 pouches → 3 pre-rolls', 'Manicura: 2 bolsitas → 3 porros') + '</button></div>' : '');
  if (tab === 'miss') h += '<table class="vt">' + Object.keys(MISSIONS).filter(k => { const m = MISSIONS[k]; return (!m.farm || m.farm === id) && !(m.adult && fam()) }).map(k => { const m = MISSIONS[k], done = r.missions[k + '_done']; return '<tr><td>' + say(m.n) + '</td><td>+' + m.r + '</td><td>' + (done ? '✅' : '<button data-mi="' + k + '">' + (m.item ? tr('Ship', 'Enviar') : tr('Claim', 'Cobrar')) + '</button>') + '</td></tr>' }).join('') + '</table>';
  if (tab === 'equip') h += '<table class="vt">' + Object.keys(C.equip).map(k => { const E = C.equip[k], n = r.equip[k] || 0, max = E[2] ? 2 : 1; return '<tr><td>' + say(E[0]) + '</td><td>' + (n >= max ? '✅' : '<button data-eq="' + k + '">' + tr('Buy ', 'Comprar ') + E[1] + '¢</button>') + (E[2] && n ? ' <small>×' + n + '</small>' : '') + '</td></tr>' }).join('') + '<tr><td>' + tr('Décor level ', 'Nivel de decoración ') + r.deco + '/3 ' + tr('(plants, lights, mural: +reputation)', '(plantas, luces, mural: +reputación)') + '</td><td>' + (r.deco >= 3 ? '✅' : '<button id="vtDeco">' + (200 + r.deco * 150) + '¢</button>') + '</td></tr></table>';
  if (tab === 'staff') h += '<table class="vt">' + r.staff.map((s, i) => '<tr><td>' + esc(s.name) + ' · ' + say(C.staff[s.role][0]) + '</td><td>' + s.wage + '¢/' + tr('day', 'día') + '</td><td><button data-fire="' + i + '">' + tr('Let go', 'Despedir') + '</button></td></tr>').join('') + '</table><div class="grid">' + Object.keys(C.staff).map(k => '<button data-hire="' + k + '">' + tr('Hire ', 'Contratar ') + say(C.staff[k][0]) + '<small>' + C.staff[k][1] + '¢/' + tr('day', 'día') + '</small></button>').join('') + '</div><div class="note">' + tr('Staff work while you are away (up to 24 game hours of catch-up). Wages are paid each morning; if you can’t pay, someone quits.', 'El personal trabaja si no estás (hasta 24 h de juego). Los sueldos se pagan cada mañana; si no puedes, alguien se va.') + '</div>';
  if (tab === 'premises') h += '<div class="note">' + (r.st === 'own' ? tr('You own the premises.', 'El local es tuyo.') : tr('Leased until day ', 'Alquilado hasta el día ') + r.until) + '<br>' + tr('Selling now returns ', 'Vender ahora devuelve ') + VT.sellValue(id) + '¢ (' + (r.st === 'own' ? tr('70 % of the price + ', '70 % del precio + ') : '') + tr('40 % of the equipment)', '40 % del equipo)') + '</div><div class="row">' + (r.st !== 'own' ? '<button id="vtRenew">' + tr('Renew lease · ', 'Renovar · ') + P.rent + '</button><button id="vtBuy">' + tr('Buy premises · ', 'Comprar local · ') + P.price + '</button>' : '') + '<button id="vtSell">' + tr('Sell / end the business', 'Vender / cerrar el negocio') + '</button></div>' +
    '<div class="row"><input id="vtName" maxlength="18" value="' + esc(r.name) + '"><button id="vtRen">' + tr('Rename', 'Renombrar') + '</button></div><div class="note">' + tr('Expand: other premises are listed in 💼 Business on your ApePhone.', 'Expandirte: otros locales están en 💼 Negocios en tu ApePhone.') + '</div>';
  h += '<div class="note" id="vtMsg"></div><div class="row"><button data-close>' + tr('Close', 'Cerrar') + '</button></div>';
  const p = AV.panel('cmp', h), re = t => VT.panel(id, t || tab), q = (sel, f) => p.querySelectorAll(sel).forEach(b => b.onclick = () => f(b));
  q('[data-t]', b => re(b.dataset.t)); const ob = AV.$('vtOpen'); if (ob) ob.onclick = () => { VT.setOpen(id, !r.open); re(); rebuild(id) };
  q('[data-sup]', b => { VT.supply(id, b.dataset.sup); re() }); q('[data-pm]', b => { VT.price(id, b.dataset.pm, VT.priceOf(r, b.dataset.pm) - 1); re() }); q('[data-pp]', b => { VT.price(id, b.dataset.pp, VT.priceOf(r, b.dataset.pp) + 1); re() });
  q('[data-eq]', b => { VT.equip(id, b.dataset.eq) && re() }); q('[data-hire]', b => { VT.hire(id, b.dataset.hire) && re() }); q('[data-fire]', b => { VT.fire(id, +b.dataset.fire); re() }); q('[data-mi]', b => { VT.mission(id, b.dataset.mi) && re() }); q('[data-take]', b => { VT.take(id, b.dataset.take); re() });
  const sp2 = k => r.prices[k] != null ? r.prices[k] : (Object.values(CROPS).find(c => c.item === k) || AV.ITEMS[k] || {}).price || 10; q('[data-sm]', b => { r.prices[b.dataset.sm] = Math.max(1, sp2(b.dataset.sm) - 1); AV.save(); re() }); q('[data-sp]', b => { r.prices[b.dataset.sp] = sp2(b.dataset.sp) + 1; AV.save(); re() });
  const dd = AV.$('vtDeco'); if (dd) dd.onclick = () => { VT.deco(id) && re() }; const tm = AV.$('vtTrim'); if (tm) tm.onclick = () => { VT.trim(id); re() };
  const rn = AV.$('vtRenew'); if (rn) rn.onclick = () => { VT.acquire(id) && re() }; const by = AV.$('vtBuy'); if (by) by.onclick = () => { VT.buy(id) && re() };
  const sl = AV.$('vtSell'); if (sl) sl.onclick = () => { if (sl.dataset.ok) { VT.sell(id); AV.closePanel('cmp') } else { sl.dataset.ok = 1; sl.textContent = tr('Sure? Tap again (+', '¿Seguro? Pulsa otra vez (+') + VT.sellValue(id) + ')' } };
  const nn = AV.$('vtRen'); if (nn) nn.onclick = () => { r.name = String(AV.$('vtName').value).replace(/[<>]/g, '').slice(0, 18) || r.name; AV.save(); rebuild(id); re() };
  return p };

/* ======================= ApePhone 💼 Business app ======================= */
VT.app = function () { const S = st(), own = Object.keys(S), rows = own.map(id => { const r = S[id], P = LIST[id], C = CATS[P.cat], here = AV.W && AV.W.id === P.w; return '<div class="bitem"><div class="bic">' + C.ic + '</div><div class="bnm">' + esc(r.name) + ' <small>' + say(C.n) + ' · ' + ((AV.worldMeta && AV.worldMeta(P.w) || {}).name || P.w) + '</small><small>' + (active(r) ? (r.open ? '🟢 ' + tr('open', 'abierto') : '🔴 ' + tr('closed', 'cerrado')) : '📄 ' + tr('lease ended', 'alquiler terminado')) + ' · ⭐' + Math.round(r.rep) + ' · ' + tr('today ', 'hoy ') + (r.today.rev - r.today.cost) + '¢ · ' + tr('served ', 'atendidos ') + r.today.served + ' · 👥' + r.staff.length + (r.cat === 'farm' ? ' · 🌱' + r.plots.filter(Boolean).length + '/' + r.plots.length : r.sup ? ' · 📦' + Object.values(r.sup).reduce((a, b) => a + b, 0) : '') + ' · ' + tr('profit ', 'beneficio ') + (r.rev - r.cost) + '</small></div><div class="bbt"><button data-m="' + id + '">' + tr('Manage', 'Gestionar') + '</button>' + (here ? '<button data-l="' + id + '">📍</button>' : '<button data-w="' + id + '">✈️</button>') + '</div></div>' });
  const old = AV.biz && Object.keys(AV.S.biz || {}).map(k => { const b = AV.S.biz[k]; return '<div class="bitem"><div class="bic">👕</div><div class="bnm">' + esc(b.name) + ' <small>' + tr('clothing shop · Madrid · sold ', 'tienda de ropa · Madrid · vendidos ') + (b.sold || 0) + ' · ⭐' + Math.round(b.rep || 0) + '</small></div><div class="bbt"><button data-old="' + k + '">' + tr('Manage', 'Gestionar') + '</button></div></div>' }).join('') || '';
  const avail = Object.keys(LIST).filter(id => !S[id]).map(id => { const P = LIST[id], C = CATS[P.cat]; return '<div class="bitem"><div class="bic">' + C.ic + '</div><div class="bnm">' + say(P.name) + ' <small>' + say(C.n) + ' · ' + tr('lease ', 'alquiler ') + P.rent + ' · ' + tr('buy ', 'compra ') + P.price + '</small></div><div class="bbt">' + (AV.W && AV.W.id === P.w ? '<button data-l="' + id + '">📍 ' + tr('Go', 'Ir') + '</button>' : '<button data-w="' + id + '">✈️ ' + ((AV.worldMeta && AV.worldMeta(P.w) || {}).name || P.w) + '</button>') + '</div></div>' }).join('');
  const p = AV.panel('cmp', '<b>💼 ' + tr('Business', 'Negocios') + '</b> · ' + tr('credits ', 'créditos ') + AV.S.money + '<div class="bgrid">' + (rows.join('') + old || '<div class="note">' + tr('You don’t own a business yet. Pick premises below: lease one, step inside, set it up and open.', 'Aún no tienes negocio. Elige un local abajo: alquílalo, entra, móntalo y abre.') + '</div>') + '</div><b>' + tr('Premises for rent', 'Locales disponibles') + '</b><div class="bgrid">' + (avail || '<div class="note">' + tr('You run them all!', '¡Los llevas todos!') + '</div>') + '</div><button data-close>' + tr('Close', 'Cerrar') + '</button>');
  p.querySelectorAll('[data-m]').forEach(b => b.onclick = () => VT.panel(b.dataset.m)); p.querySelectorAll('[data-old]').forEach(b => b.onclick = () => AV.biz.panel(b.dataset.old));
  p.querySelectorAll('[data-l]').forEach(b => b.onclick = () => { const s = G && G.sites[b.dataset.l]; if (s && AV.minimap) { AV.minimap.setDest(s.fr.x, s.fr.z, say(LIST[b.dataset.l].name)); AV.closePanel('cmp'); AV.toast('📍 ' + tr('GPS set.', 'GPS puesto.')) } });
  p.querySelectorAll('[data-w]').forEach(b => b.onclick = () => { AV.closePanel('cmp'); AV.travel(LIST[b.dataset.w].w) }); return p };
/* apephone.js loads after this file: register the app once it exists */
const regApp = () => { if (!AV.phone || !AV.phone.APPS || AV.phone.APPS.some(a => a.id === 'biz2')) return; AV.phone.APPS.splice(10, 0, { id: 'biz2', ic: '💼', n: L('Business', 'Negocios'), go: () => VT.app(), badge: () => Object.values(st()).filter(r => r.cat !== 'farm' && r.dirty && r.dirty.some(Boolean)).length }) };
regApp(); setTimeout(regApp, 0); { const pe = AV.onWorldEnter; AV.onWorldEnter = function (W) { regApp(); return pe.apply(this, arguments) } }
})(window.AV);
