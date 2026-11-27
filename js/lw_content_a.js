/* APEVERSE 2.3 - lw_content_a.js : Milestone A content.  The first playable loop in Ape Town and Chiang Mai:
   meet people, choose who you are, eat, earn, rent / buy a home, sleep there - then jobs, deliveries, art, music, pool, parties.
   Also wires existing game events into the mission engine (AV.mis.emit):  dlg:<event> (every AV.dlg.event), pool_end / pool_win,
   cm:<who>:<what> (Giant Hostel crew actions), home_get (a home rented or bought). */
'use strict';
(function (AV) {
const tr = AV.tr, LW = AV.LW, L = LW.L, M = AV.mis, CV = AV.convo, say = LW.say;
const consSum = () => { const d = (AV.S.cons && AV.S.cons.done) || {}; let n = 0; for (const k in d) n += d[k]; return n };
const ev = k => (AV.dlg && AV.dlg.events && AV.dlg.events[k]) || 0;
const anyHome = () => LW.props().some(x => x.rec && (x.rec.st === 'own' || x.rec.until >= AV.S.day));
const myDoor = () => { const x = LW.props(AV.W && AV.W.id).find(p => p.rec && (p.rec.st === 'own' || p.rec.until >= AV.S.day)); const pl = x && (AV.W.places || []).find(p => p.id === 'home_' + x.id); return pl ? [pl.x, pl.z] : null };
const pathName = () => ({ music: L('musician', 'músico'), biz: L('entrepreneur', 'emprendedor'), art: L('artist', 'artista'), travel: L('traveller', 'viajero') })[LW.st().path] || L('newcomer', 'recién llegado');

/* ---------- event wiring ---------- */
addEventListener('load', () => {
  if (AV.dlg && AV.dlg.event) { const e0 = AV.dlg.event; AV.dlg.event = function (k) { const r = e0.apply(this, arguments); try { M.emit('dlg:' + k) } catch (e) { } return r } }
  if (AV.pool && AV.pool.openGame) { const o0 = AV.pool.openGame; AV.pool.openGame = function (o) { o = o || {}; const end0 = o.onEnd; o.onEnd = function (win) { LW._poolWin = !!win; try { M.emit('pool_end'); if (win) M.emit('pool_win') } catch (e) { } return end0 && end0.apply(this, arguments) }; return o0.call(this, o) } } });
{ const pe = AV.onWorldEnter; AV.onWorldEnter = function (W) { if (pe) pe(W); if (W && W.id === 'chiang_mai' && AV.cm && AV.cm.act && !AV.cm.act.__lw) { const a0 = AV.cm.act; AV.cm.act = function (who, what) { const r = a0.apply(this, arguments); try { M.emit('cm:' + who + ':' + what) } catch (e) { } return r }; AV.cm.act.__lw = 1 } } }

/* =============================== APE TOWN =============================== */
M.def('at_welcome', { w: 'ape_town', cat: 'story', giver: 'pip', title: L('Welcome to Ape Town', 'Bienvenido a Ape Town'),
  blurb: L('Pip shows you the ropes: food, friends, a first job and a door with your name on it.', 'Pip te enseña lo básico: comida, amigos, un primer trabajo y una puerta con tu nombre.'),
  offer: { say: L("Hey, you! Fresh out of the portal? You look lost and hungry. Let me show you how Ape Town works, it takes ten minutes and you'll end up with a home.", '¡Eh, tú! ¿Recién salido del portal? Pareces perdido y hambriento. Te enseño cómo funciona Ape Town: diez minutos y acabarás con casa.') },
  stages: [
    { k: 'talk', npc: 'pip', obj: L('Tell Pip about yourself', 'Cuéntale a Pip quién eres'), nodes: {
      start: { say: L('First question, the only one that matters: what brought you through the portal?', 'Primera pregunta, la única que importa: ¿qué te trajo por el portal?'), opts: [
        { t: L('Music. I want to play to a crowd.', 'La música. Quiero tocar para el público.'), do: c => { LW.st().path = 'music'; c.set('path', 'music') }, go: 'p2' },
        { t: L('Business. I want to build something of my own.', 'Los negocios. Quiero montar algo mío.'), do: c => { LW.st().path = 'biz'; c.set('path', 'biz') }, go: 'p2' },
        { t: L('Art. Paint, film, make things.', 'El arte. Pintar, filmar, crear.'), do: c => { LW.st().path = 'art'; c.set('path', 'art') }, go: 'p2' },
        { t: L('Honestly? Just exploring.', '¿Sinceramente? Solo explorar.'), do: c => { LW.st().path = 'travel'; c.set('path', 'travel') }, go: 'p2' } ] },
      p2: { say: c => ({ music: L('A musician! The Stone Ape Band plays the Lotus stage every night. Zil at the café knows everyone in the scene.', '¡Un músico! La Stone Ape Band toca en el escenario del Loto cada noche. Zil, el del café, conoce a toda la escena.'),
          biz: L('An entrepreneur! Good. Half this town is shops nobody runs. Zil at the café started with one blender.', '¡Un emprendedor! Bien. Medio pueblo son tiendas que nadie lleva. Zil empezó con una sola batidora.'),
          art: L('An artist! Luma at the Gallery Gardens will adore you. Or criticise you. Usually both.', '¡Un artista! Luma, en los Jardines de la Galería, te adorará. O te criticará. Normalmente ambas.'),
          travel: L('An explorer! There are twenty-odd worlds through that pipe. Start small: here.', '¡Un explorador! Hay una veintena de mundos tras esa tubería. Empieza por lo pequeño: aquí.') })[c.flag('path')] || L('Cool.', 'Genial.'),
        opts: [ { t: L('So what first?', '¿Y qué hago primero?'), go: 'p3' } ] },
      p3: { say: L('Food first, always. Grab something at the snack cart behind me, eat it (backpack: B, then U), then go and see Zil at the café on the plaza.', 'Primero comer, siempre. Pilla algo en el carrito de detrás, cómetelo (mochila: B, luego U) y después ve a ver a Zil al café de la plaza.'),
        opts: [ { t: L('On it.', 'Voy.'), adv: true, end: true, aff: 1 } ] } } },
    { k: 'test', obj: L('Buy something to eat or drink and finish it (B opens the backpack, U uses)', 'Compra algo de comer o beber y termínatelo (B abre la mochila, U lo usa)'), at: [3, 97],
      onStart: mv => { mv.c0 = consSum(); mv.f0 = ev('food') }, fn: (S, mv) => consSum() > mv.c0 || ev('food') > mv.f0 },
    { k: 'talk', npc: 'zil', obj: L('Meet Zil at the café on the plaza', 'Conoce a Zil en el café de la plaza'), nodes: {
      start: { say: c => L('Pip sent you? Of course. A ' + say(pathName()) + ', huh. Everyone here is something. Rent is the thing that keeps you something.', '¿Te manda Pip? Claro. Así que ' + say(pathName()) + '. Aquí todo el mundo es algo. El alquiler es lo que te deja seguir siéndolo.'), opts: [
        { t: L('I have some money. Where do I live?', 'Tengo algo de dinero. ¿Dónde vivo?'), go: 'home' }, { t: L('Any work going?', '¿Hay trabajo?'), go: 'work' } ] },
      work: { say: L('Always. Shifts at my counter, five drinks, tips included. But first get a roof. Nobody tips a sleepy ape.', 'Siempre. Turnos en mi barra, cinco bebidas, propinas incluidas. Pero primero consigue un techo. Nadie da propina a un mono con sueño.'), opts: [ { t: L('Fine. Where do I live?', 'Vale. ¿Dónde vivo?'), go: 'home' } ] },
      home: { say: L('Remy, the estate agent, hangs around the plaza in a blue shirt. Studios, lofts, the lot. Rent if you are careful, buy if you are brave.', 'Remy, el agente inmobiliario, ronda la plaza con camisa azul. Estudios, lofts, de todo. Alquila si eres prudente, compra si eres valiente.'),
        opts: [ { t: L('Thanks, Zil.', 'Gracias, Zil.'), adv: true, end: true, aff: 1 } ] } } },
    { k: 'test', obj: L('Rent or buy a home: talk to Remy, the estate agent on the plaza', 'Alquila o compra una casa: habla con Remy, el agente de la plaza'), at: 'remy', fn: () => anyHome() },
    { k: 'test', obj: L('Go inside your new home (the door is on your map)', 'Entra en tu casa nueva (la puerta está en el mapa)'), at: () => myDoor(), fn: () => !!(AV.home && AV.home.inside) },
    { k: 'test', obj: L('Sleep in your bed: it saves the game and makes this your home', 'Duerme en tu cama: guarda la partida y la convierte en tu hogar'), onStart: mv => { mv.d0 = AV.S.day }, fn: (S, mv) => !!S.homeSpawn && S.day > mv.d0 } ],
  reward: { money: 400, rep: 5 }, next: ['at_zil_rush', 'at_dash_parcels', 'at_luma_canvas', 'at_kiko_market', 'at_sol_lunch'] });

M.def('at_zil_rush', { w: 'ape_town', cat: 'job', giver: 'zil', after: ['at_welcome'], repeat: true, title: L("Rush hour at Zil's", "Hora punta en lo de Zil"),
  blurb: L('Serve a five-drink shift behind the café counter. Daily.', 'Sirve un turno de cinco bebidas tras la barra del café. Diario.'),
  offer: { say: L("Counter's a zoo. Five drinks, the right ones, and you keep the tips plus a bonus from me.", 'La barra es un zoo. Cinco bebidas, las correctas, y te quedas las propinas más un extra mío.') },
  stages: [ { k: 'ev', ev: 'dlg:shift_done', at: [29, -12], obj: L("Work a 5-drink shift (use 'Start a shift' at the counter)", "Haz un turno de 5 bebidas ('Empezar turno' en la barra)") } ],
  reward: { money: 60, rep: 2 } });

const PARCELS = [[0, 17, L('Circular Plaza', 'Plaza Circular')], [0, -46.5, L('Outdoor cinema', 'Cine al aire libre')], [-52, 34, L('Temple Garden', 'Jardín del Templo')], [74, -10, L('Crystal Garden', 'Jardín de Cristal')], [46, 66, L('Asia & Desert gardens', 'Jardines de Asia y Desierto')], [-22, -50, L('Gallery Gardens', 'Jardines de la Galería')]];
M.def('at_dash_parcels', { w: 'ape_town', cat: 'delivery', giver: 'dash', after: ['at_welcome'], repeat: true, title: L('Dash’s three parcels', 'Los tres paquetes de Dash'),
  blurb: L('Courier run: three drop-offs across town against the clock. Free scooters and bikes are allowed. Encouraged, even.', 'Reparto: tres entregas por el pueblo contra reloj. Se permiten patinetes y bicis gratis. Se recomiendan, incluso.'),
  offer: { say: L("My legs are done. Three parcels, three addresses, four minutes each. Grab a free e-scooter if you're smart.", 'Mis piernas no dan más. Tres paquetes, tres direcciones, cuatro minutos cada uno. Pilla un patinete gratis si eres listo.') },
  stages: [0, 1, 2].map(i => ({ k: 'test', time: 240, obj: () => { const a = M.st().a.at_dash_parcels, p = a && a.mv.route ? PARCELS[a.mv.route[i]] : PARCELS[i]; return L('Deliver parcel ' + (i + 1) + '/3 to ' + say(p[2]) + ' (4 min)', 'Entrega el paquete ' + (i + 1) + '/3 en ' + say(p[2]) + ' (4 min)') },
    onStart: mv => { if (!mv.route) { const r = [0, 1, 2, 3, 4, 5].sort(() => Math.random() - .5); mv.route = r.slice(0, 3) } }, at: mv => { const p = PARCELS[(mv && mv.route ? mv.route[i] : i)]; return [p[0], p[1]] },
    fn: (S, mv) => { const p = PARCELS[mv.route[i]]; return Math.hypot(AV.P.x - p[0], AV.P.z - p[1]) < 6 } })),
  reward: { money: 150, rep: 3 } });
M.defs.at_dash_parcels.stages.forEach(s => { s.obj = (f => () => say(f()))(s.obj) });

M.def('at_luma_canvas', { w: 'ape_town', cat: 'art', giver: 'luma', after: ['at_welcome'], title: L('A canvas for Luma', 'Un lienzo para Luma'),
  blurb: L('Luma wants a new piece for the Gallery Gardens. Study the living paintings, find inspiration, pitch your idea.', 'Luma quiere una obra nueva para los Jardines. Estudia las pinturas vivas, busca inspiración y presenta tu idea.'),
  stages: [
    { k: 'talk', npc: 'luma', obj: L('Talk to Luma about the commission', 'Habla con Luma sobre el encargo'), nodes: {
      start: { say: L('I have an empty frame and a deadline. Before you touch a brush: what should art in Ape Town be about?', 'Tengo un marco vacío y una fecha límite. Antes de tocar un pincel: ¿de qué debería ir el arte en Ape Town?'), opts: [
        { t: L('Joy. Colour so loud you can hear it.', 'Alegría. Color tan fuerte que se oiga.'), do: c => { c.mv.theme = 'joy' }, go: 'ok', aff: 1 }, { t: L('The jungle taking the town back.', 'La selva recuperando el pueblo.'), do: c => { c.mv.theme = 'jungle' }, go: 'ok', aff: 1 },
        { t: L('Money. Satire about the brands.', 'El dinero. Sátira de las marcas.'), do: c => { c.mv.theme = 'satire' }, go: 'ok' } ] },
      ok: { say: L('Interesting. Go and really look at three of the living paintings first, then sit in the Crystal Garden until something clicks.', 'Interesante. Ve a mirar de verdad tres de las pinturas vivas y luego siéntate en el Jardín de Cristal hasta que algo encaje.'), opts: [ { t: L('Deal.', 'Hecho.'), adv: true, end: true } ] } } },
    { k: 'ev', ev: 'dlg:painting', n: 3, at: [-30, -70], obj: L('Study 3 living paintings in the Gallery Gardens (open them with E)', 'Estudia 3 pinturas vivas en los Jardines de la Galería (ábrelas con E)') },
    { k: 'go', x: 74, z: -10, r: 7, obj: L('Find inspiration in the Crystal Garden', 'Busca inspiración en el Jardín de Cristal') },
    { k: 'talk', npc: 'luma', obj: L('Pitch your piece to Luma', 'Presenta tu obra a Luma'), nodes: {
      start: { say: c => ({ joy: L('So? What did the crystals sing?', '¿Y bien? ¿Qué cantaron los cristales?'), jungle: L('So? Did the jungle talk to you?', '¿Y bien? ¿Te habló la selva?'), satire: L('So? Who are we mocking?', '¿Y bien? ¿De quién nos burlamos?') })[c.mv.theme] || L('So?', '¿Y bien?'), opts: [
        { t: L('A giant mango melting into a sunrise. Over the top. On purpose.', 'Un mango gigante derritiéndose en un amanecer. Exagerado. A propósito.'), go: 'end', aff: 2, do: c => { c.mv.q = 2 } },
        { t: L('Honestly, I copied the vibe of the paintings I saw.', 'Sinceramente, copié el rollo de las pinturas que vi.'), go: 'end', do: c => { c.mv.q = 1 } } ] },
      end: { say: c => c.mv.q === 2 ? L('YES. Paint it big. I will hang it by the gate. Here, a proper commission fee.', 'SÍ. Píntalo grande. Lo colgaré junto a la entrada. Toma, unos honorarios como es debido.') : L('Honest at least. Copying is how everybody starts. Here is something for your time.', 'Al menos eres sincero. Copiar es como empieza todo el mundo. Toma algo por tu tiempo.'),
        opts: [ { t: L('Thank you, Luma.', 'Gracias, Luma.'), adv: true, end: true } ] } } } ],
  reward: { money: mv => (mv && mv.q === 2) ? 320 : 180, rep: 4 }, onDone: (S, mv) => { LW.rel('luma').f.commission = mv.q || 1 } });
M.defs.at_luma_canvas.reward.money = 250;   /* journal shows a fixed figure; the bonus is paid in the talk below */
M.defs.at_luma_canvas.stages[3].nodes.end.opts[0].do = c => { if (c.mv.q === 2) AV.txn(120, 'Luma: commission bonus') };

M.def('at_kiko_market', { w: 'ape_town', cat: 'business', giver: 'kiko', after: ['at_welcome'], title: L('Kiko’s market day', 'El día de mercado de Kiko'),
  blurb: L('Kiko needs stock: a fresh coconut and a bamboo flute from around town. Then you set the price.', 'Kiko necesita género: un coco fresco y una flauta de bambú de por el pueblo. Luego tú pones el precio.'),
  stages: [
    { k: 'have', item: 'coconut', at: [30, 88], obj: L('Find a fresh coconut (palms near the market)', 'Encuentra un coco fresco (palmeras junto al mercado)') },
    { k: 'have', item: 'bamboo_flute', at: [-58, 36], obj: L('Find a bamboo flute (Temple Garden, west)', 'Encuentra una flauta de bambú (Jardín del Templo, al oeste)') },
    { k: 'talk', npc: 'kiko', obj: L('Bring them to Kiko and agree a price', 'Llévaselos a Kiko y acordad un precio'), nodes: {
      start: { say: L('Ooh, perfect specimens. So, partner, how do we sell them?', 'Uh, ejemplares perfectos. Bueno, socio, ¿cómo los vendemos?'), opts: [
        { t: L('Fair price, happy customers. 60 each.', 'Precio justo, clientes contentos. 60 cada uno.'), aff: 2, go: 'fair' },
        { t: L('Tourists will pay double. Push it.', 'Los turistas pagarán el doble. Apriétales.'), go: 'push' } ] },
      fair: { say: L('Sold in five minutes, and the lady came back for more. Your cut, plus I owe you one.', 'Vendido en cinco minutos y la señora volvió a por más. Tu parte, y te debo una.'),
        opts: [ { t: L('Pleasure doing business.', 'Un placer hacer negocios.'), adv: true, end: true, do: c => { AV.bag.remove('coconut', 1); AV.bag.remove('bamboo_flute', 1); AV.txn(130, 'Kiko: market sale (fair)'); c.set('fair_trader') } } ] },
      push: { say: () => Math.random() < .5 ? L('A tourist paid it! Without blinking! Here is your cut, you shark.', '¡Un turista lo pagó! ¡Sin pestañear! Toma tu parte, tiburón.') : L('Nobody bit. I sold them cheap at closing. Here is what is left.', 'Nadie picó. Los vendí baratos al cierre. Esto es lo que queda.'),
        opts: [ { t: L('Business is business.', 'Negocios son negocios.'), adv: true, end: true, do: c => { AV.bag.remove('coconut', 1); AV.bag.remove('bamboo_flute', 1); const ok = /shark|tiburón/.test(AV.convo.lastLine()); AV.txn(ok ? 210 : 70, 'Kiko: market sale (pushed)'); c.aff(ok ? 0 : -1) } } ] } } } ],
  reward: { rep: 3 } });

M.def('at_sol_lunch', { w: 'ape_town', cat: 'job', giver: 'sol', after: ['at_welcome'], repeat: true, title: L('Lunch rush with Sol', 'Hora de comer con Sol'),
  blurb: L('Help Sol at the Vegan Café: take three orders and match each customer to the right dish.', 'Ayuda a Sol en el Café Vegano: toma tres pedidos y dale a cada cliente su plato.'),
  stages: [ { k: 'talk', npc: 'sol', obj: L('Take the orders with Sol', 'Toma los pedidos con Sol'), nodes: {
    start: { say: L("Apron on! Table one: a sleepy gorilla who wants 'something with energy, but kind to the planet'.", "¡Delantal! Mesa uno: un gorila dormido que quiere 'algo con energía, pero amable con el planeta'."), opts: [
      { t: L('A Rainbow Bowl and a cold-brew.', 'Un Bowl Arcoíris y un cold-brew.'), go: 't2', do: c => { c.mv.ok = (c.mv.ok || 0) + 1 } }, { t: L('A double bacon burger.', 'Una hamburguesa doble de bacon.'), go: 't2', do: c => { c.mv.bad = (c.mv.bad || 0) + 1 } } ] },
    t2: { say: L('Table two: twins, allergic to nuts, both want dessert.', 'Mesa dos: gemelos, alérgicos a los frutos secos, quieren postre.'), opts: [
      { t: L('Mango sorbet, no toppings.', 'Sorbete de mango, sin toppings.'), go: 't3', do: c => { c.mv.ok = (c.mv.ok || 0) + 1 } }, { t: L('Peanut brownies!', '¡Brownies de cacahuete!'), go: 't3', do: c => { c.mv.bad = (c.mv.bad || 0) + 1 } } ] },
    t3: { say: L('Table three: a monk who says he only eats what the earth gives freely.', 'Mesa tres: un monje que dice que solo come lo que la tierra da libremente.'), opts: [
      { t: L('Cosmic dumplings… with mushroom filling.', 'Dumplings cósmicos… rellenos de setas.'), go: 'end', do: c => { c.mv.ok = (c.mv.ok || 0) + 1 } }, { t: L('Fruit salad from the market.', 'Macedonia del mercado.'), go: 'end', do: c => { c.mv.ok = (c.mv.ok || 0) + 1 } }, { t: L('Nothing. He can wait.', 'Nada. Que espere.'), go: 'end', do: c => { c.mv.bad = (c.mv.bad || 0) + 1 } } ] },
    end: { say: c => (c.mv.bad || 0) >= 2 ? L('Two angry tables. Go home, champ, try again tomorrow.', 'Dos mesas enfadadas. Vete a casa, campeón, inténtalo mañana.') : L('Smooth service! Tips are in the jar, take your share.', '¡Servicio perfecto! Las propinas están en el bote, coge tu parte.'),
      opts: c => (c.mv.bad || 0) >= 2 ? [ { t: L('Sorry, Sol.', 'Perdona, Sol.'), fail: L('Too many wrong orders.', 'Demasiados pedidos equivocados.') } ] : [ { t: L('Same time tomorrow?', '¿Mañana a la misma hora?'), adv: true, end: true, aff: 1 } ] } } } ],
  reward: { money: 110, rep: 2 } });

/* =============================== CHIANG MAI =============================== */
M.def('cm_nuni_pool', { w: 'chiang_mai', cat: 'sport', giver: 'nuni', repeat: true, title: L('Hustled by Nuni', 'Timado por Nuni'),
  blurb: L('Nuni challenges you at the hostel pool table. Win and she pays; lose and you still learn.', 'Nuni te reta en el billar del hostal. Si ganas, paga ella; si pierdes, al menos aprendes.'),
  offer: { say: L("You. Pool. Now. Loser buys the next round, winner gets bragging rights and my lunch money.", 'Tú. Billar. Ya. El que pierda paga la siguiente ronda, el que gane presume y se lleva mi dinero del almuerzo.') },
  stages: [ { k: 'talk', npc: 'nuni', obj: L('Talk trash with Nuni', 'Pícate con Nuni'), nodes: { start: { say: L('Warning: I have never lost on this table. Twice.', 'Aviso: nunca he perdido en esta mesa. Dos veces.'), opts: [
      { t: L('First time for everything.', 'Siempre hay una primera vez.'), adv: true, end: true, aff: 1 }, { t: L('Go easy on me?', '¿Me lo pones fácil?'), adv: true, end: true } ] } } },
    { k: 'ev', ev: 'pool_end', at: [26, 62], obj: L('Play a game of pool against Nuni (pool table, from 17:00 she is at the table)', 'Juega una partida de billar contra Nuni (mesa de billar; desde las 17:00 está allí)') } ],
  reward: { money: 40, rep: 2 }, onDone: () => { if (LW._poolWin) { AV.txn(160, 'Beat Nuni at pool'); LW.rel('nuni').f.beaten = (LW.rel('nuni').f.beaten || 0) + 1 } } });

M.def('cm_reception', { w: 'chiang_mai', cat: 'job', giver: 'mud', repeat: true, title: L('Reception shift at Giant', 'Turno de recepción en el Giant'),
  blurb: L('Cover the front desk for Mutt: check guests in, keep the rules, keep the peace.', 'Cubre la recepción de Mutt: registra huéspedes, haz cumplir las normas, mantén la paz.'),
  offer: { say: L('I need a nap and the bell needs a human. Cover the desk? Do not give away free beds.', 'Necesito una siesta y el timbre necesita un humano. ¿Me cubres? No regales camas.') },
  stages: [ { k: 'talk', npc: 'mud', obj: L('Run the reception desk', 'Lleva la recepción'), nodes: {
    start: { say: L('First guest: a Danish backpacker, soaked, asks how much a bed is.', 'Primer huésped: un mochilero danés, empapado, pregunta cuánto cuesta una cama.'), opts: [
      { t: L('40 credits a night, Room 1, towels extra.', '40 créditos la noche, Habitación 1, toallas aparte.'), go: 'g2', do: c => { c.mv.s = (c.mv.s || 0) + 1 } }, { t: L('For you? Free. You look sad.', '¿Para ti? Gratis. Pareces triste.'), go: 'g2' } ] },
    g2: { say: L('Second guest: it is 01:30 and someone is playing the ukulele in the corridor.', 'Segundo huésped: son las 01:30 y alguien toca el ukelele en el pasillo.'), opts: [
      { t: L('Steve. Rooftop, now, with your ukulele.', 'Steve. A la azotea, ya, con tu ukelele.'), go: 'g3', do: c => { c.mv.s = (c.mv.s || 0) + 1 } }, { t: L('Join in, obviously.', 'Me uno, obviamente.'), go: 'g3' } ] },
    g3: { say: L('Third: a couple wants a scooter for tomorrow and a map to Doi Suthep.', 'Tercero: una pareja quiere una moto para mañana y un mapa a Doi Suthep.'), opts: [
      { t: L('Scooter at the desk, 50 a day, helmets on. Map is free.', 'Moto en recepción, 50 al día, casco puesto. El mapa es gratis.'), go: 'end', do: c => { c.mv.s = (c.mv.s || 0) + 1 } }, { t: L('Just walk, it is only 15 km uphill.', 'Id andando, solo son 15 km cuesta arriba.'), go: 'end' } ] },
    end: { say: c => (c.mv.s || 0) >= 3 ? L('Mutt wakes up, checks the book, and actually smiles. Full pay.', 'Mutt se despierta, revisa el libro y sonríe de verdad. Paga completa.') : (c.mv.s || 0) >= 2 ? L('Mutt: “Mostly fine. Mostly.” Normal pay.', 'Mutt: “Casi bien. Casi.” Paga normal.') : L('Mutt stares at the book for a very long time. Half pay.', 'Mutt mira el libro durante mucho rato. Media paga.'),
      opts: [ { t: L('Same time tomorrow, boss.', 'Mañana a la misma hora, jefa.'), adv: true, end: true, do: c => { const s = c.mv.s || 0; AV.txn(s >= 3 ? 120 : s >= 2 ? 80 : 40, 'Giant Hostel: reception shift'); if (s >= 3) c.aff(1) } } ] } } } ],
  reward: { rep: 2 } });

M.def('cm_supplies', { w: 'chiang_mai', cat: 'delivery', giver: 'nunyin', repeat: true, title: L('Restock the hostel counter', 'Reponer el mostrador del hostal'),
  blurb: L('Nunyin’s counter is empty. Fetch supplies from Warorot Market and get back before the evening rush.', 'El mostrador de Nunyin está vacío. Trae género del mercado Warorot y vuelve antes de la hora punta.'),
  offer: { say: L('Snacks gone, water gone, patience gone. Warorot Market has my order waiting. Tuk-tuk, scooter, run, whatever, just be quick.', 'Sin snacks, sin agua, sin paciencia. En el mercado Warorot tienen mi pedido. Tuk-tuk, moto, corriendo, lo que sea, pero rápido.') },
  stages: [ { k: 'go', x: 186, z: -66, r: 8, time: 420, obj: L('Collect the order at Warorot Market (7 min)', 'Recoge el pedido en el mercado Warorot (7 min)') },
    { k: 'talk', npc: 'nunyin', time: 420, obj: L('Bring the supplies back to Nunyin (7 min)', 'Llévale el género a Nunyin (7 min)'), nodes: { start: { say: L('My hero! Everything is here. Even the weird crisps.', '¡Mi héroe! Está todo. Hasta las patatas raras.'), opts: [ { t: L('Anything for the counter.', 'Lo que sea por el mostrador.'), adv: true, end: true, aff: 1 } ] } } } ],
  reward: { money: 140, rep: 3 } });

M.def('cm_rooftop', { w: 'chiang_mai', cat: 'festival', giver: 'dino', title: L('Rooftop party at Giant', 'Fiesta en la azotea del Giant'),
  blurb: L('Dino wants a party. You do the inviting: Steve for music, Nuni for chaos, ZtonedApe for the vibe.', 'Dino quiere fiesta. Tú invitas: Steve para la música, Nuni para el caos y ZtonedApe para el rollo.'),
  stages: [
    { k: 'talk', npc: 'steve', obj: L('Invite Steve (music)', 'Invita a Steve (música)'), nodes: { start: { say: L('A rooftop gig? I have exactly four songs and they are all about geckos. I am in.', '¿Un bolo en la azotea? Tengo exactamente cuatro canciones y todas van de gecos. Me apunto.'), opts: [ { t: L('Perfect setlist.', 'Setlist perfecta.'), adv: true, end: true, aff: 1 } ] } } },
    { k: 'talk', npc: 'nuni', obj: L('Invite Nuni (chaos)', 'Invita a Nuni (caos)'), nodes: { start: { say: L('Is there a pool table on the roof? No? I will bring one. Kidding. Maybe.', '¿Hay billar en la azotea? ¿No? Traeré uno. Es broma. Quizá.'), opts: [ { t: L('Just bring yourself.', 'Tráete a ti misma.'), adv: true, end: true } ] } } },
    { k: 'talk', npc: 'zape', obj: L('Invite ZtonedApe (vibe)', 'Invita a ZtonedApe (rollo)'), nodes: { start: { say: L('ZtonedApe nods slowly. “I’ll bring the speaker. And the good playlist. The one with the dub.”', 'ZtonedApe asiente despacio. “Traigo el altavoz. Y la playlist buena. La del dub.”'), opts: [ { t: L('Legend.', 'Leyenda.'), adv: true, end: true, aff: 2 } ] } } },
    { k: 'talk', npc: 'dino', obj: L('Tell Dino the party is on', 'Dile a Dino que hay fiesta'), nodes: { start: { say: L('You did it?! Everyone?! Tonight we ascend. Not like that. Mostly like that.', '¡¿Lo has conseguido?! ¡¿A todos?! Esta noche ascendemos. No en ese sentido. Bueno, un poco.'), opts: [ { t: L('See you on the roof.', 'Nos vemos en la azotea.'), adv: true, end: true, aff: 1 } ] } } } ],
  reward: { money: 100, rep: 6 }, onDone: () => { for (const k of ['steve', 'nuni', 'zape', 'dino', 'mud', 'nunyin']) LW.rel(k).f.party = 1   /* the whole hostel heard it */ } });

M.def('cm_steve_jam', { w: 'chiang_mai', cat: 'music', giver: 'steve', after: ['cm_rooftop'], title: L('Big Blues jam', 'Jam en el Big Blues'),
  blurb: L('Steve gets you a slot at the Big Blues bar. Jam with him in front of a real crowd.', 'Steve te consigue un hueco en el Big Blues. Toca con él delante de público de verdad.'),
  stages: [ { k: 'ev', ev: 'cm:steve:jam', at: 'steve', obj: L('Jam with Steve (talk to him, ask to jam)', 'Toca con Steve (háblale y pídele tocar)') },
    { k: 'talk', npc: 'steve', obj: L('Hear what Steve thought', 'Escucha qué le pareció a Steve'), nodes: { start: { say: L('The gecko song never sounded better. The bar owner wants us back on Friday.', 'La canción del geco nunca sonó mejor. El dueño del bar nos quiere de vuelta el viernes.'), opts: [ { t: L('Band name: The Geckos.', 'Nombre de grupo: Los Gecos.'), adv: true, end: true, aff: 2 } ] } } } ],
  reward: { money: 180, rep: 4 } });

/* ---------- characters you can actually talk to (💬 Talk properly) ---------- */
CV.trees.zil = c => ({ name: 'Zil', title: AV.NPCS.zil.title, nodes: {
  start: { say: CV.greet(c, { first: L('New face. I pour, I judge, I occasionally smile.', 'Cara nueva. Sirvo, juzgo y a veces sonrío.'), again: [L('Back again. The usual?', 'Otra vez por aquí. ¿Lo de siempre?'), L('You look like a person with news.', 'Tienes cara de traer noticias.'), L('Counter’s quiet. Talk to me.', 'La barra está tranquila. Habla conmigo.')],
      morning: L('Too early for opinions. Coffee first.', 'Muy temprano para opiniones. Primero café.'), night: L('Night shift. Everyone here is either in love or in debt.', 'Turno de noche. Aquí todos están enamorados o endeudados.') }), opts: [
    { t: L('How is business?', '¿Qué tal el negocio?'), go: 'biz' }, { t: L('Tell me about the band.', 'Háblame de la banda.'), go: 'band' }, { t: L('What do people say about me?', '¿Qué dice la gente de mí?'), go: 'rep' }, { t: L('See you.', 'Nos vemos.'), end: true } ] },
  biz: { say: L('Good when the band plays, bad when it rains. If you ever open a place, open it next to music. That is my whole MBA.', 'Bien cuando toca la banda, mal cuando llueve. Si algún día abres un local, ábrelo al lado de la música. Ese es todo mi MBA.'), opts: [ { t: L('Noted.', 'Apuntado.'), go: 'start', aff: 1 } ] },
  band: { say: L('Stone Ape Band. They play ZtonedApe’s songs like their lives depend on it, and the bassist owes me twelve smoothies.', 'La Stone Ape Band. Tocan las canciones de ZtonedApe como si les fuera la vida, y el bajista me debe doce batidos.'), opts: [ { t: L('Can I play with them?', '¿Puedo tocar con ellos?'), go: 'jam' }, { t: L('Back.', 'Volver.'), go: 'start' } ] },
  jam: { say: L('There are instruments on the Lotus stage. Walk up, press E, do not embarrass me.', 'Hay instrumentos en el escenario del Loto. Sube, pulsa E y no me avergüences.'), opts: [ { t: L('No promises.', 'No prometo nada.'), go: 'start' } ] },
  rep: { say: () => { const r = LW.rep('ape_town'); return r >= 12 ? L('That you are reliable. Rare here. Do not let it go to your head.', 'Que eres de fiar. Raro aquí. Que no se te suba.') : r >= 3 ? L('That you are new but useful.', 'Que eres nuevo pero útil.') : L('Nothing yet. Do things and they will.', 'Nada todavía. Haz cosas y ya hablarán.') }, opts: [ { t: L('Back.', 'Volver.'), go: 'start' } ] } } });
CV.trees.mud = c => ({ name: 'Mutt', title: AV.NPCS.mud && AV.NPCS.mud.title, nodes: {
  start: { say: CV.greet(c, { first: L('Welcome to Giant. Rules: pay, no ukulele after midnight, be nice to Bobo.', 'Bienvenido al Giant. Normas: pagar, nada de ukelele después de medianoche, sé amable con Bobo.'), again: [L('You again. Good. You pay on time.', 'Tú otra vez. Bien. Pagas a tiempo.'), L('Need a bed, a scooter, or a lecture?', '¿Necesitas cama, moto o sermón?')], flags: { party: L('That party. My ears still ring. Thank you, I think.', 'Esa fiesta. Aún me pitan los oídos. Gracias, creo.') } }), opts: [
    { t: L('How did you end up running a hostel?', '¿Cómo acabaste llevando un hostal?'), go: 'story' }, { t: L('Any work?', '¿Hay trabajo?'), go: 'work' }, { t: L('Bye, boss.', 'Adiós, jefa.'), end: true } ] },
  story: { say: L('Came for two weeks, ten years ago. Bought the place with Steve’s worst idea and my best spreadsheet.', 'Vine dos semanas, hace diez años. Compré el local con la peor idea de Steve y mi mejor hoja de cálculo.'), opts: [ { t: L('That is the dream.', 'Es el sueño.'), go: 'start', aff: 1 } ] },
  work: { say: () => M.available('cm_reception') ? L('The desk needs covering. Ask me properly (📜) and it is yours.', 'Hay que cubrir la recepción. Pídemelo bien (📜) y es tuya.') : L('Not today. Ask Nunyin, she always needs a runner.', 'Hoy no. Pregunta a Nunyin, siempre necesita un recadero.'), opts: [ { t: L('Back.', 'Volver.'), go: 'start' } ] } } });
CV.trees.nuni = c => ({ name: 'Nuni', title: AV.NPCS.nuni && AV.NPCS.nuni.title, nodes: {
  start: { say: CV.greet(c, { first: L('You play pool? No? You will.', '¿Juegas al billar? ¿No? Lo harás.'), again: [L('Rematch?', '¿Revancha?'), L('My cue missed you.', 'Mi taco te echaba de menos.')], flags: { beaten: L('YOU. The one who beat me. I have been training. Mentally.', 'TÚ. El que me ganó. He estado entrenando. Mentalmente.') } }), opts: [
    { t: L('Teach me a trick shot.', 'Enséñame un tiro de fantasía.'), go: 'trick' }, { t: L('Why pool?', '¿Por qué el billar?'), go: 'why' }, { t: L('Later.', 'Luego.'), end: true } ] },
  trick: { say: L('Aim for the ball you are not aiming for. That is the trick. Also chalk.', 'Apunta a la bola a la que no apuntas. Ese es el truco. Y tiza.'), opts: [ { t: L('Deep.', 'Profundo.'), go: 'start', aff: 1 } ] },
  why: { say: L('Because it is geometry that pays for beer.', 'Porque es geometría que paga cervezas.'), opts: [ { t: L('Fair.', 'Justo.'), go: 'start' } ] } } });
})(window.AV);
