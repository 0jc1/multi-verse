/* APEVERSE 2.3 - lw_venues.js : Milestone D - every city's named businesses become usable (owner: >= 40% per major city, aim higher).
   1. AV.LW.bizCoverage(): the honest per-city measure.  Businesses = named places whose name says business + registered storefronts
      (AV.storefront.list) + 2.3 stores, merged within 6 m.  A business is interactive only if a working service interaction sits within
      9 m of it (a trigger offering to buy / order / rent / play / work / browse / a menu / a ticket, or a staff character).
   2. The venue kit: for businesses that only had a sign, a real service counter at the business: a local menu by category, the order is
      rung up, prepared (coffee pulled, dish cooked), handed over and in your hand, then consumed bite by bite / sip by sip.
      Categories: café, bar, restaurant, street food / market, bakery, dessert, shop (souvenirs, records, clothes), gallery / museum
      (ticket = a visit: vibe + reputation), hostel / hotel (a nap: energy), pharmacy, coffeeshop / dispensary.
   3. Legality (fictional game rules, not statements about real law): cannabis is sold over the counter only where LW.RULES[w].cannabis
      is 'legal' (Amsterdam coffeeshops, Thai dispensaries); elsewhere a "coffeeshop"-named place serves coffee.
   City-specific menus: every world has its own dish, street food, coffee and sweet (LW.LOCAL).  Coverage target: LW.CFG.bizTarget (.55). */
'use strict';
(function (AV) {
const tr = AV.tr, LW = AV.LW, L = LW.L, say = LW.say;
LW.CFG.bizTarget = .55;
LW.RULES = { amsterdam: { cannabis: 'legal' }, chiang_mai: { cannabis: 'legal' }, pai: { cannabis: 'legal' }, koh_tao: { cannabis: 'legal' }, ape_town: { cannabis: 'legal' }, jungle_dub: { cannabis: 'legal' } };
LW.cannabisLegal = w => ((LW.RULES[w] || {}).cannabis === 'legal');
/* ---------- local menus ---------- */
const LOCAL = LW.LOCAL = { madrid: ['Bocadillo de calamares', 'Churros con chocolate', 'Café con leche', 'Torrija'], vienna: ['Wiener Schnitzel', 'Käsekrainer', 'Wiener Melange', 'Sachertorte'], amsterdam: ['Stamppot', 'Kroket', 'Koffie verkeerd', 'Stroopwafel'],
  tokyo: ['Shoyu ramen', 'Takoyaki', 'Matcha latte', 'Dorayaki'], paris: ['Croque-monsieur', 'Crêpe au sucre', 'Café crème', 'Éclair'], barcelona: ['Paella', 'Bomba de la Barceloneta', 'Cortado', 'Crema catalana'],
  sevilla: ['Espinacas con garbanzos', 'Montadito de pringá', 'Café con leche', 'Torta de aceite'], cadiz: ['Pescaíto frito', 'Tortillitas de camarones', 'Café solo', 'Pan de Cádiz'], oaxaca: ['Tlayuda', 'Tamal oaxaqueño', 'Chocolate de agua', 'Nieve de tuna'],
  chefchaouen: ['Chicken tajine', 'Msemen', 'Mint tea', 'Chebakia'], rio: ['Feijoada', 'Pão de queijo', 'Cafezinho', 'Brigadeiro'], chiang_mai: ['Khao soi', 'Pad thai', 'Thai iced coffee', 'Mango sticky rice'], pai: ['Khao soi', 'Pad thai', 'Thai iced coffee', 'Banana roti'],
  koh_tao: ['Massaman curry', 'Pad thai', 'Thai iced coffee', 'Banana pancake'], da_nang: ['Mì Quảng', 'Bánh mì', 'Cà phê sữa đá', 'Chè'], jerusalem: ['Hummus plate', 'Falafel', 'Turkish coffee', 'Rugelach'], ape_town: ['Rainbow bowl', 'Cosmic dumplings', 'Banana brew', 'Mango tango sorbet'],
  astro9: ['Nebula noodles', 'Star dumplings', 'Gravity latte', 'Moon mochi'], jungle_dub: ['Ital stew', 'Bammy', 'Bush tea', 'Coconut drops'], verdalux: ['Moss stew', 'Glow-berries', 'Root tea', 'Honey drops'] };
const IC = ['🍲', '🥙', '☕', '🍰'], MODEL = ['bowl', 'skewer', 'coffee', 'fruit'], USE = ['eat', 'eat', 'drink', 'eat'], PRICE = [32, 14, 9, 11];
for (const w in LOCAL) LOCAL[w].forEach((n, i) => { AV.ITEMS['lw_' + ['meal', 'street', 'coffee', 'sweet'][i] + '_' + w] = { n: [n, n], cat: i === 2 ? 'drink' : 'food', ic: IC[i], use: USE[i], fx: i === 2 ? { type: 'buzz', amt: .2 } : undefined, model: MODEL[i], col: [0xe8a050, 0xd8b060, 0x8a5a3a, 0xf0c0d0][i], say: [n + '. Exactly what you needed.', n + '. Justo lo que necesitabas.'], price: PRICE[i] } });
Object.assign(AV.ITEMS, {
  lw_wine: { n: ['Glass of red wine', 'Copa de vino tinto'], cat: 'drink', ic: '🍷', use: 'drink', fx: { type: 'drink', amt: .3 }, model: 'cocktail', col: 0x7a1a2a, say: ['Warm, round, a little dangerous.', 'Cálido, redondo, un poco peligroso.'], price: 14 },
  lw_cocktail: { n: ['House cocktail', 'Cóctel de la casa'], cat: 'drink', ic: '🍹', use: 'drink', fx: { type: 'drink', amt: .4 }, model: 'cocktail', col: 0xff8a3a, say: ['Sweet, strong, with a tiny umbrella.', 'Dulce, fuerte, con sombrillita.'], price: 18 },
  lw_juice: { n: ['Fresh juice', 'Zumo natural'], cat: 'drink', ic: '🧃', use: 'drink', model: 'cup', col: 0xffa020, say: ['Squeezed in front of you.', 'Exprimido delante de ti.'], price: 8 },
  lw_pastry: { n: ['Pastry', 'Bollo'], cat: 'food', ic: '🥐', use: 'eat', model: 'fruit', col: 0xe8b060, say: ['Flaky, buttery, crumbs everywhere.', 'Hojaldre, mantequilla, migas por todas partes.'], price: 6 },
  lw_souvenir: { n: ['Local souvenir', 'Recuerdo local'], cat: 'gift', ic: '🎁', use: 'look', keep: true, model: 'card', col: 0xffd84a, say: ['A little piece of this city.', 'Un trocito de esta ciudad.'], price: 15 },
  lw_vinyl: { n: ['Second-hand LP', 'LP de segunda mano'], cat: 'gift', ic: '💿', use: 'look', keep: true, model: 'card', col: 0x1a1a1a, say: ['Crackles in all the right places.', 'Cruje en todos los sitios correctos.'], price: 22 } });
/* ---------- categories ---------- */
const BIZ = /shop|store|tienda|caf[eé]|coffee|\bbar\b|pub|club|market|bazaar|mercado|mercat|restaurant|food|bakery|bakkerij|panader|hostel|hotel|\binn\b|gallery|museum|records|platen|boutique|vintage|sneaker|pharmac|apotheke|farmacia|kiosk|stall|deli|kaas|fietsen|cinema|theat|arcade|tattoo|barber|salon|massage|motors|taberna|tasca|bodega|confiter|churrer|helader|chocolat|tajine|hammam|tissage|weaver|textil|ceramic|cerámica|guitarr|instrument|souvenir|shuk|souk|konditorei|beisl|proeflokaal|kraantje|coffeeshop|dispensar|juice|sucos|padaria|churrascaria|chinelos|izakaya|ramen|sushi|yokocho|nonbei|bookshop|librer|librairie|brasser|bistro|cr[eê]per|boulanger|fromager|p[aâ]tisser|glacier|lounge|mezcal|cantina|bäckerei|freidur|ostioner|peña|babouche|[eé]pices|four du|alebrij|swag|groove|apephone|monkey brew|frutería|fruit|pizz|burger|noodle|grill|kebab|wok|dumpling/i;
const NOT = /portal|station|gate|square|plaza|plaça|platz|church|cathedral|temple|wat |mosque|bridge|park|garden|beach|viewpoint|mirador|pier|stop|home_|vent_|lw_store/i;
const SERVICE = /buy|order|menu|shop|browse|rent|play|drink|eat|serve|taste|ticket|lease|work|shift|bed|counter|try on|sip|coffee|beer|tapas|pour|sell|haggle|swap|ride|jam|dance|sing|karaoke|pool|billiard|exhibit|tour|massage|haircut|tattoo|comprar|pedir|nap|visit the|spin|listen|book|stay|check in|enter|go in|walk in|talk to/i;
LW.bizKind = n => { n = n.toLowerCase(); if (/coffeeshop|dispensar|cannabis|weed|420|kush|lantaarn/.test(n)) return 'canna'; if (/gallery|museum|exhibit|art|alebrij/.test(n)) return 'gallery'; if (/hostel|hotel|\binn\b|guesthouse/.test(n)) return 'hostel';
  if (/pharmac|apotheke|farmacia/.test(n)) return 'pharmacy'; if (/bakery|bakkerij|panader|boulanger|bäckerei|padaria|four du|konditorei|confiter|p[aâ]tisser/.test(n)) return 'bakery'; if (/helader|glacier|gelat|ice cream|chocolat|churrer|sweet/.test(n)) return 'dessert';
  if (/\bbar\b|pub|club|lounge|taberna|bodega|beisl|proeflokaal|kraantje|mezcal|cantina|nonbei|izakaya|brew|peña|tasca/.test(n)) return 'bar'; if (/caf[eé]|coffee|juice|sucos|tea/.test(n)) return 'cafe';
  if (/market|bazaar|mercado|mercat|stall|kiosk|food|freidur|ostioner|fruit|frutería|souk|shuk|noodle|grill|kebab|dumpling|pizz|burger|ramen|sushi|wok/.test(n)) return 'food'; if (/restaurant|bistro|brasser|tajine|churrascaria|cr[eê]per|yokocho|grill/.test(n)) return 'restaurant';
  if (/records|platen|groove|vinyl|music|guitarr|instrument/.test(n)) return 'records'; return 'shop' };
function menuFor(kind, w) { const m = k => 'lw_' + k + '_' + (LOCAL[w] ? w : 'ape_town'); switch (kind) {
  case 'cafe': return [[m('coffee'), 9, .9], [m('sweet'), 11], ['lw_pastry', 6], ['lw_juice', 8, .6], ['water', 6]];
  case 'bar': return [['beer', 12, .4], ['lw_wine', 14, .3], ['lw_cocktail', 18, 1.1], ['lw_cola', 6], [m('street'), 14, .8]];
  case 'restaurant': return [[m('meal'), 32, 2.2], [m('street'), 14, 1.2], [m('sweet'), 11], ['lw_wine', 14, .3], ['water', 6]];
  case 'food': return [[m('street'), 14, 1.2], [m('meal'), 28, 1.8], ['lw_juice', 8, .6], ['lw_cola', 6]];
  case 'bakery': return [['lw_pastry', 6], [m('sweet'), 11], [m('coffee'), 9, .9]];
  case 'dessert': return [[m('sweet'), 11], ['lw_icecream', 8], [m('coffee'), 9, .9]];
  case 'pharmacy': return [['water', 6], ['lw_energy', 12]];
  case 'records': return [['lw_vinyl', 22], ['lw_souvenir', 15]];
  case 'canna': return LW.cannabisLegal(w) ? [['pre', 30, .5], ['herb', 25], [m('coffee'), 9, .9], ['lw_cola', 6]] : [[m('coffee'), 9, .9], [m('sweet'), 11], ['lw_juice', 8]];
  default: return [['lw_souvenir', 15], ['postcard', 3], ['lw_cola', 6], ['water', 6]] } }
LW.menuFor = menuFor;
/* ---------- coverage ---------- */
/* every individually placed sign (world_kit.js K.sign) is recorded, so signs that name a business count in the denominator */
addEventListener('load', () => { const K = AV.kit; if (!K || !K.sign || K.sign.__lw) return; const s0 = K.sign; K.sign = function (ctx, txt, x, y, z) { try { (ctx.lwSigns = ctx.lwSigns || []).push({ txt: String(txt || '').split(String.fromCharCode(10)).join(' '), x, z }) } catch (e) { } return s0.apply(this, arguments) }; K.sign.__lw = 1 });
const lbl = t => { try { return typeof t.label === 'function' ? t.label() : String(t.label || '') } catch (e) { return '' } };
LW.bizCoverage = function () { const W = AV.W; if (!W) return null; const list = [], add = (name, x, z, src) => { if (!name || !isFinite(x) || !isFinite(z)) return; if (list.some(b => Math.hypot(b.x - x, b.z - z) < 6)) return; list.push({ name, x, z, src, kind: LW.bizKind(name) }) };
  for (const p of W.places || []) { const n = (p.name && (p.name[0] || p.name)) || ''; if (BIZ.test(n) && !NOT.test(n + ' ' + p.id)) add(n, p.x, p.z, 'place') }
  for (const r of (AV.storefront && AV.storefront.list) || []) { const d = r.door || [r.x, r.z]; add(r.id || r.style, d[0], d[1], 'storefront') }
  for (const r of (LW.stores && LW.stores.list) || []) add(say(r.o.name), r.front[0], r.front[1], 'store');
  for (const s of (W.ctx && W.ctx.lwSigns) || []) if (BIZ.test(s.txt) && !NOT.test(s.txt)) add(s.txt, s.x, s.z, 'sign');
  for (const t of W.T) { if (t.npc || t.lwVenue) continue; const l = lbl(t).replace(/^[^A-Za-z0-9À-ÿ]+/, ''); const m = l.match(/^([^:(·]{3,40}?)\s*[:(·]/); if (m && BIZ.test(m[1]) && !NOT.test(m[1])) add(m[1].trim(), t.x, t.z, 'counter') }   /* named shop counters are businesses too */
  const T = W.T.filter(t => !t.npc && (!t.show || t.show()) && !/portal|step through/i.test(lbl(t))), N = W.T.filter(t => t.npc);
  for (const b of list) b.ok = T.some(t => Math.hypot(t.x - b.x, t.z - b.z) < 9 && SERVICE.test(lbl(t))) || N.some(t => Math.hypot(t.npc.g.position.x - b.x, t.npc.g.position.z - b.z) < 6);
  const n = list.filter(b => b.ok).length; return { world: W.id, total: list.length, interactive: n, pct: list.length ? Math.round(n / list.length * 100) : 100, list, missing: list.filter(b => !b.ok) } };
/* ---------- the venue counter ---------- */
const PREP = { cafe: L('The barista pulls a shot and steams the milk...', 'La barista saca el café y monta la leche...'), bar: L('The bartender pours...', 'El camarero sirve...'), restaurant: L('The kitchen fires it up...', 'La cocina se pone en marcha...'), food: L('Sizzle. It is cooked in front of you...', 'Chisporrotea. Te lo cocinan delante...'), default: L('They get it ready...', 'Te lo preparan...') };
LW.venueCounter = function (v) { const w = AV.W.id, menu = menuFor(v.kind, w);
  if (v.kind === 'gallery') return LW.gallery(v); if (v.kind === 'hostel') return LW.hostelNap(v);
  const p = AV.panel('cmp', '<h3 style="margin:0 0 4px">' + ({ cafe: '☕', bar: '🍺', restaurant: '🍽️', food: '🥢', bakery: '🥐', dessert: '🍨', pharmacy: '💊', records: '💿', canna: '🌿', shop: '🛍️' }[v.kind] || '🛍️') + ' ' + LW.esc(v.name) + '</h3>' +
    (v.kind === 'canna' ? '<p><small>' + (LW.cannabisLegal(w) ? tr('Adults only. Licensed under this world’s (fictional) rules. Consume responsibly.', 'Solo adultos. Con licencia según las normas (ficticias) de este mundo. Consume con responsabilidad.') : tr('Cannabis is not sold here under this world’s rules: coffee and cake only.', 'Aquí no se vende cannabis según las normas de este mundo: solo café y pasteles.')) + '</small></p>' : '') +
    '<p style="margin:0 0 6px"><small>' + tr('Credits: ', 'Créditos: ') + AV.S.money + '</small></p>' + menu.map(([id, pr, prep]) => { const it = AV.ITEMS[id]; if (!it) return ''; return '<div class="lwMis">' + it.ic + ' <b>' + LW.esc(say(it.n)) + '</b> · ' + pr + ' ¢<div class="lwBtns"><button data-vb="' + id + '"' + (AV.S.money < pr ? ' disabled' : '') + '>' + (it.keep ? tr('Buy', 'Comprar') : tr('Order', 'Pedir')) + '</button></div></div>' }).join('') + '<div class="lwBtns"><button data-close>' + tr('Done', 'Listo') + '</button></div>');
  p.querySelectorAll('[data-vb]').forEach(b => b.onclick = () => { if (LW._serving) return; const row = menu.find(r => r[0] === b.dataset.vb); if (!row) return; const [id, pr, prep] = row, it = AV.ITEMS[id]; if (!AV.txn(-pr, v.name + ': ' + say(it.n))) return; LW._serving = true; LW.stats.served = (LW.stats.served || 0) + 1; AV.closePanel('cmp');
    if (prep) AV.toast('⏳ ' + say(PREP[v.kind] || PREP.default)); setTimeout(() => { LW._serving = false; AV.bag.add(id, 1, true); if (!it.keep) AV.bag.equip(id); AV.toast(it.ic + ' ' + (it.keep ? tr('Wrapped and in your backpack.', 'Envuelto y en tu mochila.') : tr('Served! It is in your hand: U to ', '¡Servido! Lo tienes en la mano: U para ') + (it.use === 'drink' ? tr('drink.', 'beber.') : it.use === 'smoke' ? tr('light up.', 'encender.') : tr('eat.', 'comer.')))); AV.mis && AV.mis.emit('bought', id); AV.mis && AV.mis.emit('served', v.kind) }, (prep || .5) * 1000) }) };
LW.gallery = v => { const p = AV.panel('cmp', '<h3>🖼️ ' + LW.esc(v.name) + '</h3><p>' + tr('Today: a small exhibition of local artists, plus one Bamb piece on loan (a smoking alien, of course).', 'Hoy: una pequeña exposición de artistas locales y una obra de Bamb cedida (un alien fumando, claro).') + '</p><div class="lwBtns"><button id="lwGal">' + tr('Ticket 8 ¢ and look around', 'Entrada 8 ¢ y mirar') + '</button><button data-close>' + tr('Leave', 'Salir') + '</button></div>');
  p.querySelector('#lwGal').onclick = () => { if (!AV.txn(-8, v.name + ': ticket')) return; AV.closePanel('cmp'); AV.vitals && AV.vitals.add && AV.vitals.add(0, 8); LW.rep(AV.W.id, .5); AV.mis && AV.mis.emit('gallery', v.name); AV.dlg && AV.dlg.event && AV.dlg.event('painting'); AV.toast('🖼️ ' + tr('You take your time with every piece. Your vibe lifts.', 'Te tomas tu tiempo con cada obra. Te sube el ánimo.')) } };
LW.hostelNap = v => { const p = AV.panel('cmp', '<h3>🛏️ ' + LW.esc(v.name) + '</h3><p>' + tr('Reception: a bunk for a couple of hours, lockers, Wi-Fi password on the board.', 'Recepción: una litera para un par de horas, taquillas, la contraseña del Wi-Fi en el tablón.') + '</p><div class="lwBtns"><button id="lwNap">' + tr('Nap 2 h for 15 ¢', 'Siesta de 2 h por 15 ¢') + '</button><button data-close>' + tr('Leave', 'Salir') + '</button></div>');
  p.querySelector('#lwNap').onclick = () => { if (!AV.txn(-15, v.name + ': nap')) return; AV.closePanel('cmp'); AV.S.time += 120; while (AV.S.time >= 1440) { AV.S.time -= 1440; AV.S.day++ } AV.vitals && AV.vitals.add && AV.vitals.add(30, 0); AV.hud(); AV.toast('😴 ' + tr('Two hours later: rested.', 'Dos horas después: descansado.')) } };
/* ---------- fill each city up to the target, variety first ---------- */
LW.venueStats = {};
{ const pe = AV.onWorldEnter; AV.onWorldEnter = function (W) { if (pe) pe(W); if (!W || !W.T) return; setTimeout(() => { if (AV.W !== W) return; try { fill(W) } catch (e) { console.warn('venues', e) } }, 1200) } }
function fill(W) { const r = LW.bizCoverage(); if (!r || !r.total) return; const need = Math.ceil(r.total * LW.CFG.bizTarget) - r.interactive; let added = 0; const byKind = {};
  const order = r.missing.slice().sort((a, b) => (byKind[a.kind] || 0) - (byKind[b.kind] || 0));
  for (const b of r.missing) { if (added >= Math.max(need, Math.ceil(r.missing.length * .6))) break; const sp = AV.safeSpot(W, b.x, b.z); if (Math.hypot(sp[0] - b.x, sp[1] - b.z) > 7) continue;
    const v = { name: b.name, kind: b.kind }; W.T.push({ x: sp[0], z: sp[1], r: 2.4, label: () => ({ cafe: '☕', bar: '🍺', restaurant: '🍽️', food: '🥢', bakery: '🥐', dessert: '🍨', pharmacy: '💊', records: '💿', canna: '🌿', gallery: '🖼️', hostel: '🛏️' }[v.kind] || '🛍️') + ' ' + v.name + ': ' + ({ gallery: tr('ticket + exhibition', 'entrada + exposición'), hostel: tr('reception (nap)', 'recepción (siesta)'), shop: tr('browse + buy', 'mirar + comprar'), records: tr('browse + buy', 'mirar + comprar') }[v.kind] || tr('order at the counter', 'pedir en la barra')), fn: () => LW.venueCounter(v), lwVenue: v });
    byKind[b.kind] = (byKind[b.kind] || 0) + 1; added++ }
  const r2 = LW.bizCoverage(); LW.venueStats[W.id] = { before: r.pct, after: r2.pct, total: r2.total, added } }
})(window.AV);
