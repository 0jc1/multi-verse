/* APEVERSE 2.3 - lw_property.js : homes you can rent or buy across the multiverse + real-estate agents.
   Builds on housing.js (AV.home): every property is an AV.home.PROPS entry with a real street door and a private interior where
   you sleep (advances time, respawn point), save, change clothes (wardrobe), store things, play records and decorate.
   New categories (cat): budget, studio, shared, standard, loft, penthouse, beach, country, futuristic, hostel.
   Agents: Remy (Ape Town plaza) and Khun Pim (Chiang Mai, by Giant Hostel) open AV.LW.agency(): every listing with its type, size,
   district, rent and price, what is included, and buttons to rent, buy, see the door on the map or go in.  The agency also shows
   listings in other worlds (bought from any agent).   AV.LW.props(world?) -> [{ id, P, rec }]  */
'use strict';
(function (AV) {
const tr = AV.tr, LW = AV.LW, L = LW.L, say = LW.say, esc = LW.esc, H = AV.home;
if (!H) return;
const CATS = { budget: L('Budget room', 'Habitación económica'), studio: L('Studio', 'Estudio'), shared: L('Shared flat', 'Piso compartido'), standard: L('Apartment', 'Piso'), loft: L('Artist loft', 'Loft de artista'),
  penthouse: L('Luxury penthouse', 'Ático de lujo'), beach: L('Beach house', 'Casa de playa'), country: L('Countryside house', 'Casa de campo'), futuristic: L('Futuristic apartment', 'Piso futurista'), hostel: L('Hostel room', 'Habitación de hostal') };
LW.PROP_CATS = CATS;
const P = H.PROPS;
Object.assign(P.md_pinar_2b, { cat: 'standard', area: 80, dist: L('Pinar de Chamartín', 'Pinar de Chamartín') });
const add = (id, o) => { P[id] = Object.assign({ days: 7 }, o) };
/* Ape Town: three steps up the ladder */
add('at_mushroom_studio', { w: 'ape_town', cat: 'studio', sign: 'M1', name: L('Mushroom Studio · La Finca', 'Estudio Champiñón · La Finca'), anchor: ['finca'], near: [-14, 88], rent: 120, price: 4500, area: 42,
  dist: L('La Finca market', 'Mercado de La Finca'), desc: L('A snug studio above the market: bed nook, kitchenette, round window full of jungle. Cheap, cheerful, yours to decorate.', 'Un estudio acogedor sobre el mercado: rincón de cama, cocina americana y una ventana redonda llena de selva. Barato, alegre y tuyo para decorar.'),
  room: { x: 2000, z: 30, w: 8, d: 7, h: 3 } });
add('at_gallery_loft', { w: 'ape_town', cat: 'loft', sign: 'L2', name: L('Gallery Loft · Gallery Gardens', 'Loft de la Galería · Jardines'), anchor: ['gallery'], near: [-30, -44], rent: 320, price: 11500, area: 95,
  dist: L('Gallery Gardens', 'Jardines de la Galería'), desc: L('High ceilings, north light and room for an easel or a full DJ setup. Artists queue for this one.', 'Techos altos, luz del norte y sitio para un caballete o un equipo de DJ completo. Los artistas hacen cola por este.'),
  room: { x: 2000, z: 70, w: 12, d: 9, h: 3.6 } });
add('at_lotus_penthouse', { w: 'ape_town', cat: 'penthouse', sign: 'PH', name: L('Lotus Penthouse · Circular Plaza', 'Ático Loto · Plaza Circular'), anchor: ['crystal', 'plaza'], near: [62, 8], rent: 900, price: 38000, area: 160,
  dist: L('Circular Plaza', 'Plaza Circular'), desc: L('The top of the plaza: a huge living room for parties, a view over the Lotus stage. Status, not subtle.', 'Lo más alto de la plaza: un salón enorme para fiestas y vistas al escenario del Loto. Estatus, nada discreto.'),
  room: { x: 2040, z: 30, w: 15, d: 11, h: 3.6 } });
/* Chiang Mai */
add('cm_nimman_condo', { w: 'chiang_mai', cat: 'studio', sign: '7C', name: L('Nimman studio condo', 'Estudio en Nimman'), anchor: ['chat', 'hostel'], near: [70, 60], rent: 150, price: 5200, area: 38,
  dist: L('near Chat Cafe', 'junto al Chat Cafe'), desc: L('A clean little condo with a balcony, air-con and a rooftop pool rumour. Five minutes from Giant Hostel.', 'Un pequeño estudio limpio con balcón, aire acondicionado y rumores de piscina en la azotea. A cinco minutos del Giant Hostel.'),
  room: { x: 2000, z: 30, w: 8, d: 7, h: 3 } });
add('cm_teak_house', { w: 'chiang_mai', cat: 'standard', sign: 'TK', name: L('Old City teak house', 'Casa de teca en la Ciudad Vieja'), anchor: ['luang'], near: [-20, 18], rent: 420, price: 16000, area: 120,
  dist: L('by Wat Chedi Luang', 'junto a Wat Chedi Luang'), desc: L('Dark teak floors, a temple bell in the morning, a garden for a mango tree. Quiet, roomy, very Chiang Mai.', 'Suelos de teca oscura, la campana del templo por la mañana, un jardín para un mango. Tranquila, amplia, muy Chiang Mai.'),
  room: { x: 2000, z: 70, w: 12, d: 10, h: 3.4 } });
LW.props = w => Object.keys(P).filter(id => !w || P[id].w === w).map(id => ({ id, P: P[id], rec: (AV.S.homes || {})[id] }));
const active = r => !!r && (r.st === 'own' || r.until >= AV.S.day);
const INCL = L('Sleep (skip to morning, wake up here) · save · wardrobe · storage · record player · decorate', 'Dormir (hasta la mañana, despiertas aquí) · guardar · armario · almacén · tocadiscos · decorar');

/* ---------- agency panel ---------- */
LW.agency = function (agent) { const W = AV.W, wid = W && W.id, here = LW.props(wid), far = LW.props().filter(x => x.P.w !== wid);
  const row = x => { const p = x.P, r = x.rec, a = active(r), owned = r && r.st === 'own';
    return '<div class="lwMis"><b>' + esc(say(p.name)) + '</b> · <small>' + esc(say(CATS[p.cat] || CATS.standard)) + (p.area ? ' · ' + p.area + ' m²' : '') + (p.dist ? ' · ' + esc(say(p.dist)) : '') + '</small><br><small>' + esc(p.desc ? say(p.desc) : '') + '</small><br>' +
      '<small>💰 ' + tr('Rent ', 'Alquiler ') + p.rent + ' / ' + p.days + tr(' days · Buy ', ' días · Compra ') + p.price + ' · ' + esc(say(INCL)) + '</small><div class="lwBtns">' +
      (owned ? '<b>✔ ' + tr('Yours', 'Tuyo') + '</b> ' : a ? '<b>🔑 ' + tr('Rented: ', 'Alquilado: ') + (r.until - AV.S.day + 1) + tr(' days left', ' días') + '</b> ' : '') +
      (!owned ? '<button data-rent="' + x.id + '"' + (AV.S.money < p.rent ? ' disabled' : '') + '>' + (a ? tr('Extend ', 'Ampliar ') : tr('Rent ', 'Alquilar ')) + p.rent + '</button><button data-buy="' + x.id + '"' + (AV.S.money < p.price ? ' disabled' : '') + '>' + tr('Buy ', 'Comprar ') + p.price + '</button>' : '') +
      (p.w === wid ? '<button data-door="' + x.id + '">🧭 ' + tr('Show the door', 'Ver la puerta') + '</button>' : '<small style="opacity:.7"> · ' + esc((AV.worldMeta && AV.worldMeta(p.w) || {}).name || p.w) + '</small>') + '</div></div>' };
  const p = AV.panel('cmp', '<h3 style="margin:0 0 4px">🏠 ' + tr('Real estate', 'Inmobiliaria') + (agent ? ' · ' + esc(agent) : '') + '</h3><p style="margin:0 0 6px"><small>' + tr('Credits: ', 'Créditos: ') + '<b>' + AV.S.money + '</b> · ' + tr('Renting is cheap and flexible; buying is forever (no rent, ever).', 'Alquilar es barato y flexible; comprar es para siempre (nunca más alquiler).') + '</small></p><div style="max-height:60vh;overflow:auto">' +
    (here.map(row).join('') || '<p>' + tr('No listings in this world yet.', 'Aún no hay pisos en este mundo.') + '</p>') + (far.length ? '<p><b>' + tr('In other worlds', 'En otros mundos') + '</b></p>' + far.map(row).join('') : '') + '</div><div class="lwBtns"><button data-close>' + tr('Close', 'Cerrar') + '</button></div>');
  const done = () => LW.agency(agent);
  p.querySelectorAll('[data-rent]').forEach(b => b.onclick = () => { if (H.rent(b.dataset.rent)) { AV.toast('🔑 ' + tr('Keys are yours: ', 'Las llaves son tuyas: ') + say(P[b.dataset.rent].name)); done(b.dataset.rent) } });
  p.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => { const id = b.dataset.buy, pr = P[id]; if (!confirmBuy(pr)) return; if (H.buy(id)) { AV.toast('🏠 ' + tr('Congratulations, you own ', 'Enhorabuena, ya es tuyo: ') + say(pr.name)); done(id) } });
  p.querySelectorAll('[data-door]').forEach(b => b.onclick = () => LW.showDoor(b.dataset.door)); return p };
function confirmBuy(pr) { if (LW._autoYes) return true; try { return confirm(tr('Buy ', 'Comprar ') + say(pr.name) + tr(' for ', ' por ') + pr.price + tr(' credits?', ' créditos?')) } catch (e) { return true } }
LW.showDoor = function (id) { const pl = (AV.W.places || []).find(p => p.id === 'home_' + id); if (!pl) { AV.toast(tr('That door is not in this world.', 'Esa puerta no está en este mundo.')); return false } AV.closePanel('cmp'); AV.minimap && AV.minimap.setDest(pl.x, pl.z, say(P[id].name)); return true };

/* ---------- the agents ---------- */
const agentNPC = (name, title, col, look) => ({ name, title, col, look, persona: name + ', a cheerful real-estate agent.', greet: c => [c.t('Looking for a place? Ask me about homes.', '¿Buscas casa? Pregúntame.')], barks: c => [c.t('Homes! Studios, lofts, penthouses!', '¡Casas! ¡Estudios, lofts, áticos!'), c.t('Rent today, sleep tonight.', 'Alquila hoy, duerme esta noche.')], chips: () => [] , intents: [] });
AV.NPCS.remy = agentNPC('Remy', ['Ape Town Homes · estate agent', 'Ape Town Homes · agente inmobiliario'], '#7ad8ff', { fur: 0x8a5a3a, shirt: 0x2a6aa8, hat: null });
AV.NPCS.pim = agentNPC('Khun Pim', ['Lanna Homes · estate agent', 'Lanna Homes · agente inmobiliaria'], '#ffb0d8', { fur: 0xc8a080, shirt: 0xd04a8a, hat: null });
const AGENTS = { ape_town: { id: 'remy', at: [9, 26] }, chiang_mai: { id: 'pim', at: [26, 41] } };
LW.AGENTS = AGENTS;
const tree = who => ({ name: AV.NPCS[who].name, title: AV.NPCS[who].title, nodes: {
  start: { say: c => AV.convo.greet(c, { first: L("Hi! I'm " + AV.NPCS[who].name + '. New in town? Everybody needs a door with their name on it.', '¡Hola! Soy ' + AV.NPCS[who].name + '. ¿Recién llegado? Todo el mundo necesita una puerta con su nombre.'),
      again: [L('Back for a bigger place?', '¿Vuelves por algo más grande?'), L("How's the new place treating you?", '¿Qué tal la casa nueva?'), L('I have fresh listings.', 'Tengo pisos nuevos.')], flags: { bought: L('My favourite client! Already thinking about a second home?', '¡Mi cliente favorito! ¿Ya piensas en una segunda casa?') } }),
    opts: [ { t: L('Show me the listings.', 'Enséñame los pisos.'), do: () => { AV.convo.close(); setTimeout(() => LW.agency(AV.NPCS[who].name), 50); return null }, end: true },
      { t: L('Rent or buy, what do you recommend?', '¿Alquilar o comprar? ¿Qué me recomiendas?'), go: 'advice' },
      { t: L('What can I do in a home?', '¿Qué puedo hacer en una casa?'), go: 'perks' }, { t: L('Just looking. Bye!', 'Solo miraba. ¡Adiós!'), end: true } ] },
  advice: { say: c => c.S.money >= 9000 ? L('You have the money: buy the studio and never pay rent again, then spend the rest on a business. Rent if you like to move around.', 'Tienes dinero: compra el estudio y olvídate del alquiler, y luego invierte el resto en un negocio. Alquila si te gusta moverte.') : L('Rent first: a week costs less than a night out. Buy when the missions and the business pay off.', 'Alquila primero: una semana cuesta menos que una noche de fiesta. Compra cuando las misiones y el negocio den dinero.'),
    opts: [ { t: L('Makes sense. Listings, please.', 'Tiene sentido. Los pisos, por favor.'), do: () => { AV.convo.close(); setTimeout(() => LW.agency(AV.NPCS[who].name), 50); return null }, end: true }, { t: L('Thanks.', 'Gracias.'), end: true, aff: 1 } ] },
  perks: { say: L('Sleep to skip to the morning and wake up there, save your game, change clothes, store stuff, spin records, decorate with furniture and art. And invite friends over, once they like you.', 'Dormir hasta la mañana y despertar allí, guardar la partida, cambiarte de ropa, guardar cosas, poner discos, decorar con muebles y arte. E invitar amigos, cuando te aprecien.'),
    opts: [ { t: L('Show me the listings.', 'Enséñame los pisos.'), do: () => { AV.convo.close(); setTimeout(() => LW.agency(AV.NPCS[who].name), 50); return null }, end: true }, { t: L('Cool, later.', 'Genial, luego.'), end: true } ] } } });
AV.convo.trees.remy = () => tree('remy'); AV.convo.trees.pim = () => tree('pim');
LW.spawnAgent = function (W) { const A = AGENTS[W.id]; if (!A || !W.ctx || !AV.npc) return null; const sp = AV.safeSpot(W, A.at[0], A.at[1]);
  const n = AV.npc.spawn(W.ctx, A.id, { x: sp[0], z: sp[1], yaw: Math.atan2(-sp[0], -sp[1]), H: (x, z) => W.surface(x, z) || 0, r: 3 }); n.tgt.fn = () => AV.convo.open(A.id); n.tgt.label = () => '🏠 ' + tr('Talk to ', 'Hablar con ') + AV.NPCS[A.id].name + tr(' (homes)', ' (pisos)'); return n };
{ const pe = AV.onWorldEnter; AV.onWorldEnter = function (W) { if (pe) pe(W); try { LW.spawnAgent(W) } catch (e) { console.warn('agent', e) } } }
/* remember purchases for greetings */
/* a new 2.3 home is not an empty box: it comes with a bed (sleep + respawn) and a wardrobe, placed once, movable like any piece */
function starter(pid) { const p = P[pid], r = (AV.S.homes || {})[pid]; if (!p || !p.room || !r || r.lwStarter || (r.items && r.items.length) || pid === 'md_pinar_2b') return; r.items = r.items || []; r.lwStarter = 1;
  const R = p.room, x0 = R.x - R.w / 2, z0 = R.z - R.d / 2, x1 = R.x + R.w / 2, z1 = R.z + R.d / 2;   /* the kitchenette fills the back-left corner, the door is front-centre */
  const C = { bed: [[x1 - 1.2, z0 + 1.4, 0], [R.x + .6, z0 + 1.4, 0], [x1 - 1.4, R.z, Math.PI / 2], [x0 + 1.4, z1 - 2, Math.PI / 2]], wardrobe: [[x1 - .45, z1 - 1.6, -Math.PI / 2], [x0 + .45, R.z + .6, Math.PI / 2], [R.x - 1.4, z0 + .45, 0]] };
  for (const k in C) { if (!H.CAT[k]) continue; for (const [x, z, ry] of C[k]) { const it = { k, x, z, ry }; if (!H.fits || H.fits(pid, it)) { r.items.push(it); break } } } LW.stats.starter = r.items.map(i => i.k).join(','); AV.save() }
LW.starterFurniture = starter;
{ const b0 = H.buy; H.buy = function (pid) { const ok = b0.apply(this, arguments); if (ok) { starter(pid); for (const k in AGENTS) LW.rel(AGENTS[k].id).f.bought = 1; AV.mis && AV.mis.emit('home_get', pid) } return ok } }
{ const r0 = H.rent; H.rent = function (pid) { const ok = r0.apply(this, arguments); if (ok) starter(pid); if (ok && AV.mis) AV.mis.emit('home_get', pid); return ok } }
})(window.AV);
