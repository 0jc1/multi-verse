/* APEVERSE - data/npcs_workers.js : The Wandering Market crew (English + Español). Same chat format as data/npcs.js.
   Their behaviour lives in js/npc_jobs.js (one state machine each); this file is only what they say. Greetings and answers read the
   NPC's live state: talk to Dash while he's carrying a crate and he says so; ask anyone "how's it going?" and they report their
   real numbers (plants watered, crates delivered, litter swept...). `lines` are used by the state machines for speech bubbles;
   {name} placeholders are filled from that NPC's stats. */
'use strict';
(function () {
  const L = (en, es) => [en, es];
  const brainOf = id => { const n = AV.npc && AV.npc.find && AV.npc.find(id); return n && n.brain };
  const stateOf = id => { const B = brainOf(id); return B ? B.fsm.state : null };
  const lowFirst = s => s ? s[0].toLowerCase() + s.slice(1) : s;
  const DOING_KW = ['what are you doing', 'doing', 'busy', 'working', 'up to', 'right now', 'que haces', 'que estas haciendo', 'haciendo', 'ocupad', 'trabajando', 'ahora mismo'];
  const REPORT_KW = ['how is it going', 'hows it going', 'how is work', 'progress', 'today', 'so far', 'how many', 'como va', 'que tal el trabajo', 'progreso', 'hoy', 'cuantos', 'cuantas'];
  const CREW_KW = ['crew', 'market', 'wandering', 'team', 'friends', 'together', 'mae', 'dash', 'fern', 'tam', 'bix', 'melo', 'mercado', 'equipo', 'amigos', 'errante'];

  /* shared crew lore + lines any worker can use */
  AV.WORKER_LINES = { soldOut: [L('Sold out? Again? Dash, my friend, where are you?', '¿Agotado? ¿Otra vez? Dash, amigo, ¿dónde estás?'), L('No fruit… my stomach is filing a complaint.', 'No hay fruta… mi estómago va a poner una queja.')] };
  const CREW = [L('We’re the Wandering Market. Six of us, one stall, a lot of portals. Every world gets the same deal: fruit, music, clean paths, and Bix frowning at people.', 'Somos el Mercado Errante. Seis, un puesto y muchos portales. Cada mundo recibe lo mismo: fruta, música, caminos limpios y Bix frunciendo el ceño.'),
    L('Mae runs the stall, Dash hauls the crates, Fern keeps the plants alive, Tam sweeps, Bix guards, Melo plays. Everybody needs everybody. Mostly everybody needs Mae.', 'Mae lleva el puesto, Dash carga las cajas, Fern mantiene vivas las plantas, Tam barre, Bix vigila y Melo toca. Todos necesitan a todos. Sobre todo a Mae.')];

  /* build an AV.NPCS profile from a compact worker spec */
  function worker(id, W) {
    const pick = (c, a) => a.map(l => c.t(l[0], l[1]));
    return {
      name: W.name, title: W.title, col: W.col, persona: W.persona, role: W.role, look: W.look, lines: W.lines,
      greet(c) {
        const s = stateOf(id), busy = s && W.busy[s];
        if (busy) return pick(c, busy);
        if (c.met === 1) return pick(c, [W.first]);
        if (c.part === 'night' && W.night) return pick(c, W.night);
        return pick(c, W.greet);
      },
      topics: [
        { id: 'doing', kw: DOING_KW, say(c) { const B = brainOf(id); if (!B || !B.statusLine[0]) return pick(c, W.greet); return [c.t('Right now? ' + lowFirst(B.statusLine[0]) + '. ' + W.job[0], '¿Ahora mismo? ' + lowFirst(B.statusLine[1]) + '. ' + W.job[1])] } },
        { id: 'report', kw: REPORT_KW, say(c) { const B = brainOf(id), r = W.report((B && B.stats) || {}); return [c.t(r[0], r[1])] } },
        { id: 'crew', kw: CREW_KW, say: c => pick(c, CREW) }
      ].concat(W.topics.map(t => ({ id: t.id, kw: t.kw, say: c => pick(c, t.say) }))),
      answers: {},
      chips: c => [[c.t('What are you doing?', '¿Qué haces?'), c.t('What are you doing right now?', '¿Qué estás haciendo ahora mismo?')], [c.t('How’s it going?', '¿Qué tal va?'), c.t('How is work going today?', '¿Qué tal va el trabajo hoy?')], [c.t(W.chip[0][0], W.chip[0][1]), c.t(W.chip[1][0], W.chip[1][1])], [c.t('The crew?', '¿El equipo?'), c.t('Tell me about the Wandering Market crew.', 'Háblame del equipo del Mercado Errante.')]],
      barks: c => pick(c, (W.busy[stateOf(id)] && W.barksBusy) || W.barks),
      fallback: c => pick(c, W.fallback)
    };
  }

  const WORKERS = {
    /* ======================= MAE — fruit vendor ======================= */
    mae: {
      name: 'Mae', title: ['fruit vendor · Wandering Market', 'frutera · Mercado Errante'], col: '#ff9a3a', role: 'vendor',
      persona: 'Mae, a warm, quick-witted fruit vendor who runs the Wandering Market stall in every world. Calls everyone "love", remembers what people buy, haggles for fun, sneaks the odd mango for herself. Depends on Dash for deliveries.',
      look: { shirt: 0xff8a3a, human: { sp: 'human_b', height: 1.64, skin: 0xc68642, hair: 0x14100c, style: 'bun', flower: 0xff4ad2, shirt: { col: 0xff8a3a }, pants: { col: 0x2a6a5a }, shoe: 0x8a4a20 } },
      job: L('Somebody has to keep this multiverse fed.', 'Alguien tiene que dar de comer a este multiverso.'),
      first: L('Hello, love! First time at the Wandering Market? Mangoes, two credits — or free if you make me laugh.', '¡Hola, cariño! ¿Primera vez en el Mercado Errante? Mangos a dos créditos, o gratis si me haces reír.'),
      greet: [L('Back again, %n? The good mangoes are on the left. The really good ones are under the counter.', '¿Otra vez por aquí, %n? Los mangos buenos a la izquierda. Los buenísimos, debajo del mostrador.'), L('%n! Business is fruity today.', '¡%n! El negocio va jugoso hoy.')],
      night: [L('Late shopper! I’m nearly closed, love, but there’s always one mango for night owls.', '¡Cliente nocturno! Casi he cerrado, cariño, pero siempre queda un mango para los búhos.')],
      busy: {
        restock: [L('Hands full of mangoes, love — talk while I stack? Dash just brought a crate.', 'Tengo las manos llenas de mangos, cariño. ¿Hablamos mientras coloco? Dash acaba de traer una caja.')],
        order: [L('One second — DASH! — sorry, love, I’m low on stock.', 'Un segundo… ¡DASH! Perdona, cariño, me quedo sin género.')],
        snack: [L('Mmf— you didn’t see me eat this. Quality control.', 'Mmf… tú no me has visto comerme esto. Control de calidad.')],
        sleep: [L('Mmm… stall opens at six… unless you’re very hungry…', 'Mmm… el puesto abre a las seis… salvo que tengas mucha hambre…')]
      },
      report: s => L('I’ve sold ' + (s.sold || 0) + ' pieces of fruit, ordered ' + (s.orders || 0) + ' crates and restocked ' + (s.restocks || 0) + ' times. And eaten ' + (s.snacks || 0) + '. Don’t tell anyone.', 'He vendido ' + (s.sold || 0) + ' piezas de fruta, he pedido ' + (s.orders || 0) + ' cajas y he repuesto ' + (s.restocks || 0) + ' veces. Y me he comido ' + (s.snacks || 0) + '. No se lo digas a nadie.'),
      topics: [
        { id: 'fruit', kw: ['fruit', 'mango', 'buy', 'price', 'stock', 'food', 'eat', 'hungry', 'fruta', 'comprar', 'precio', 'comida', 'comer', 'hambre'], say: [L('Two credits a mango. When I run low I shout for Dash and he brings a crate from the depot. If he’s not too busy chatting.', 'Dos créditos el mango. Cuando me quedo corta llamo a Dash y trae una caja del almacén. Si no está muy ocupado charlando.'), L('The whole crew eats here. Melo spends every tip on my mangoes. Very loyal. Very sticky.', 'Todo el equipo come aquí. Melo se gasta cada propina en mis mangos. Muy fiel. Muy pegajoso.')] },
        { id: 'self', kw: ['who are you', 'about you', 'yourself', 'quien eres', 'sobre ti'], say: [L('Mae. I’ve sold fruit in thirty worlds. The best customers are always the ones who say they’re “just looking”.', 'Mae. He vendido fruta en treinta mundos. Los mejores clientes siempre son los que dicen que “solo están mirando”.')] }
      ],
      chip: [L('Fruit?', '¿Fruta?'), L('What fruit have you got?', '¿Qué fruta tienes?')],
      barks: [L('Fresh mangoes! Sweet as a sunset!', '¡Mangos frescos! ¡Dulces como un atardecer!'), L('Two credits, love, and I’ll throw in a smile.', 'Dos créditos, cariño, y te regalo una sonrisa.')],
      fallback: [L('Ha! I like you. Ask me about fruit, or what I’m doing, or how business is going.', '¡Ja! Me caes bien. Pregúntame por la fruta, por lo que hago o por cómo va el negocio.')],
      lines: {
        hello: [L('Hello, love! Fresh fruit!', '¡Hola, cariño! ¡Fruta fresca!'), L('%n! Over here!', '¡%n! ¡Por aquí!')],
        bye: [L('Come back hungry!', '¡Vuelve con hambre!'), L('Mind how you go, love.', 'Ve con cuidado, cariño.')],
        hawk: [L('Mangoes! Juicy mangoes!', '¡Mangos! ¡Mangos jugosos!'), L('Best fruit in this dimension!', '¡La mejor fruta de esta dimensión!'), L('Two credits! Practically free!', '¡Dos créditos! ¡Casi regalado!')],
        order: [L('DASH! A crate of mangoes, please!', '¡DASH! ¡Una caja de mangos, por favor!'), L('Dash, love, I’m running low!', '¡Dash, cariño, me estoy quedando sin nada!')],
        thanks: [L('Perfect, Dash. You’re a star.', 'Perfecto, Dash. Eres un sol.'), L('Lovely! Back in business.', '¡Estupendo! Volvemos al negocio.')],
        ouch: [L('Oi! Punching a fruit lady? Bix!', '¡Oye! ¿Pegarle a la frutera? ¡Bix!')],
        morning: [L('Morning! Stall’s open!', '¡Buenos días! ¡Puesto abierto!')],
        small: [L('Sold {sold} pieces of fruit today. My feet know every one.', 'Hoy he vendido {sold} piezas de fruta. Mis pies las recuerdan todas.'), L('Did Dash bring the good crates or the bruised ones?', '¿Dash trajo las cajas buenas o las magulladas?'), L('Everyone’s eating well today. Tam says the litter proves it.', 'Hoy todos comen bien. Tam dice que la basura lo demuestra.')]
      }
    },

    /* ======================= DASH — courier ======================= */
    dash: {
      name: 'Dash', title: ['courier · Wandering Market', 'repartidor · Mercado Errante'], col: '#ffd84a', role: 'courier',
      persona: 'Dash, an upbeat, slightly breathless courier for the Wandering Market. Waits at the depot, sprints crates to Mae the moment she shouts, counts deliveries like a sports score. Hates dropping things, especially after being punched.',
      look: { shirt: 0xffd84a, hat: 0xd83a3a, human: { sp: 'human_a', height: 1.74, skin: 0xe0ac69, hair: 0x2a1a10, style: 'cap', capCol: 0xd83a3a, shirt: { col: 0xffd84a }, pants: { col: 0x2c3a5a, shorts: true }, shoe: 0xffffff } },
      job: L('If Mae shouts, I run. That’s the whole job description.', 'Si Mae grita, yo corro. Esa es toda la descripción del puesto.'),
      first: L('Hey hey! Dash, crates and deliveries. If you hear Mae yell my name, stand back — I go fast.', '¡Ey, ey! Dash, cajas y repartos. Si oyes a Mae gritar mi nombre, apártate: voy rápido.'),
      greet: [L('%n! Quick chat, I’m on call.', '¡%n! Charla rápida, estoy de guardia.'), L('Yo! Any packages? No? Just vibes? Love vibes.', '¡Ey! ¿Algún paquete? ¿No? ¿Solo buen rollo? Me encanta el buen rollo.')],
      busy: {
        deliver: [L('Can’t stop — this crate is for Mae! …Okay, I can stop a little.', '¡No puedo parar, esta caja es para Mae! …Vale, puedo parar un poco.')],
        pickup: [L('Mae’s order just came in, I’m grabbing a crate!', '¡Acaba de llegar el pedido de Mae, voy a por una caja!')],
        recover: [L('Somebody punched me and I dropped the crate. Was it you? …It was you, wasn’t it.', 'Alguien me pegó y se me cayó la caja. ¿Fuiste tú? …Fuiste tú, ¿a que sí?')],
        sleep: [L('Zzz… deliver… to… Mae… zzz', 'Zzz… entregar… a… Mae… zzz')]
      },
      report: s => L((s.deliveries || 0) + ' deliveries so far! ' + (s.recovered ? 'Had to pick up a dropped crate ' + s.recovered + ' time' + (s.recovered > 1 ? 's' : '') + '. Long story. Involves a fist.' : 'Zero dropped crates. Knock on wood. Knock on crate.'), '¡' + (s.deliveries || 0) + ' entregas hasta ahora! ' + (s.recovered ? 'He tenido que recoger una caja caída ' + s.recovered + (s.recovered > 1 ? ' veces' : ' vez') + '. Larga historia. Hay un puño de por medio.' : 'Cero cajas caídas. Toco madera. Toco caja.')),
      topics: [
        { id: 'crates', kw: ['crate', 'delivery', 'deliver', 'package', 'depot', 'carry', 'caja', 'entrega', 'reparto', 'paquete', 'almacen', 'cargar'], say: [L('Mae shouts, I grab a crate from the depot, run it over, hand it to her, she restocks. Beautiful system. Very efficient. Unless someone punches the courier.', 'Mae grita, cojo una caja del almacén, se la llevo, ella repone. Un sistema precioso. Muy eficiente. Salvo que alguien le pegue al repartidor.')] },
        { id: 'self', kw: ['who are you', 'about you', 'yourself', 'quien eres', 'sobre ti'], say: [L('Dash! Fastest legs in the Wandering Market. Slowest at remembering birthdays.', '¡Dash! Las piernas más rápidas del Mercado Errante. El más lento recordando cumpleaños.')] }
      ],
      chip: [L('Deliveries?', '¿Repartos?'), L('How do the deliveries work?', '¿Cómo funcionan los repartos?')],
      barks: [L('On call! Ready to run!', '¡De guardia! ¡Listo para correr!'), L('Crates don’t carry themselves. Believe me, I asked.', 'Las cajas no se llevan solas. Créeme, lo pregunté.')],
      barksBusy: [L('Coming through! Fruit emergency!', '¡Paso! ¡Emergencia frutal!'), L('Heavy, heavy, heavy…', 'Pesa, pesa, pesa…')],
      fallback: [L('Ha, sure! Ask me about deliveries, or what I’m doing, or the crew.', '¡Ja, claro! Pregúntame por los repartos, por lo que hago o por el equipo.')],
      lines: {
        hello: [L('Hey hey, %n!', '¡Ey, ey, %n!'), L('Yo! Dash here!', '¡Ey! ¡Aquí Dash!')],
        bye: [L('Gotta run! Literally.', '¡Me tengo que ir corriendo! Literalmente.'), L('Later, %n!', '¡Luego, %n!')],
        deliver: [L('One crate of sunshine, Mae!', '¡Una caja de sol, Mae!'), L('Delivered! New record? Probably!', '¡Entregado! ¿Nuevo récord? ¡Seguramente!')],
        ouch: [L('My crate! You made me drop it!', '¡Mi caja! ¡Me la has hecho tirar!'), L('Hey! I bruise like a banana!', '¡Oye! ¡Me salen moratones como a un plátano!')],
        morning: [L('Morning! Any orders?', '¡Buenos días! ¿Algún pedido?')],
        small: [L('{deliveries} deliveries today. My legs are writing a complaint.', '{deliveries} entregas hoy. Mis piernas están escribiendo una queja.'), L('Mae shouts my name so loud the depot echoes.', 'Mae grita mi nombre tan fuerte que el almacén hace eco.'), L('I could carry two crates. I won’t, but I could.', 'Podría llevar dos cajas. No lo haré, pero podría.')]
      }
    },

    /* ======================= FERN — gardener ======================= */
    fern: {
      name: 'Fern', title: ['gardener · Wandering Market', 'jardinera · Mercado Errante'], col: '#7aff9a', role: 'gardener',
      persona: 'Fern, a calm, gently bossy gardener who carries potted plants through every portal and keeps them alive with a green watering can. Talks to plants by name, judges people by how they treat flowers.',
      look: { shirt: 0x5a8a3a, human: { sp: 'human_b', height: 1.68, skin: 0xf0c8a8, hair: 0x7a5230, style: 'long', flower: 0xffd84a, shirt: { col: 0x5a8a3a }, pants: { col: 0x6a4a2a }, boots: true, shoe: 0x4a3a2a } },
      job: L('Thirstiest plant first, always. Then the next thirstiest. It never ends, and I love it.', 'Primero la planta más sedienta, siempre. Luego la siguiente. Nunca se acaba, y me encanta.'),
      first: L('Oh — mind the lavender. Hello! I’m Fern. These pots travel with us; every new world dries them out.', 'Oh, cuidado con la lavanda. ¡Hola! Soy Fern. Estas macetas viajan con nosotros; cada mundo nuevo las reseca.'),
      greet: [L('Hello %n. The hibiscus says hello too. Quietly.', 'Hola %n. El hibisco también te saluda. En voz baja.'), L('%n! Have you watered anything today? You should. Anything.', '¡%n! ¿Has regado algo hoy? Deberías. Lo que sea.')],
      busy: {
        water: [L('Shh — mid-pour. Plants hate being interrupted. Okay, go on.', 'Chis, estoy regando. A las plantas no les gusta que las interrumpan. Vale, dime.')],
        refill: [L('Can’s empty, refilling at the barrel. What’s up?', 'La regadera está vacía, la lleno en el barril. ¿Qué pasa?')],
        sleep: [L('Mmm… photosynthesis… tomorrow…', 'Mmm… fotosíntesis… mañana…')]
      },
      report: s => L('I’ve watered ' + (s.watered || 0) + ' plants and refilled my can ' + (s.refills || 0) + ' times. Look at them — less droopy, more flowers. That’s the scoreboard.', 'He regado ' + (s.watered || 0) + ' plantas y he llenado la regadera ' + (s.refills || 0) + ' veces. Míralas: menos mustias, más flores. Ese es el marcador.'),
      topics: [
        { id: 'plants', kw: ['plant', 'plants', 'flower', 'water', 'garden', 'wilt', 'grow', 'planta', 'flor', 'flores', 'agua', 'regar', 'jardin', 'mustia', 'crecer'], say: [L('They wilt slowly — droopy leaves, browner, flowers gone. When one gets thirsty enough I water it. When the can runs dry I refill it at the barrel. Simple. Endless.', 'Se marchitan poco a poco: hojas caídas, más marrones, sin flores. Cuando una tiene bastante sed la riego. Cuando se vacía la regadera, la lleno en el barril. Sencillo. Infinito.'), L('At night they barely drink. Plants sleep too. Unlike Bix.', 'De noche casi no beben. Las plantas también duermen. No como Bix.')] },
        { id: 'self', kw: ['who are you', 'about you', 'yourself', 'quien eres', 'sobre ti'], say: [L('Fern. Yes, like the plant. My parents had a sense of humour. I have a watering can.', 'Fern. Sí, como el helecho en inglés. Mis padres tenían sentido del humor. Yo tengo una regadera.')] }
      ],
      chip: [L('The plants?', '¿Las plantas?'), L('How do you look after the plants?', '¿Cómo cuidas las plantas?')],
      barks: [L('Hello, little marigold. Thirsty?', 'Hola, pequeña caléndula. ¿Tienes sed?'), L('Roots first, gossip later.', 'Primero las raíces, luego los chismes.')],
      fallback: [L('Hmm. Ask me about the plants, what I’m doing, or how the garden is going.', 'Mmm. Pregúntame por las plantas, por lo que hago o por cómo va el jardín.')],
      lines: {
        hello: [L('Hello, %n! Mind the pots!', '¡Hola, %n! ¡Cuidado con las macetas!')],
        bye: [L('Go gently. Like rain.', 'Ve con suavidad. Como la lluvia.')],
        refill: [L('Fresh water for thirsty roots.', 'Agua fresca para raíces sedientas.'), L('Full can, full heart.', 'Regadera llena, corazón lleno.')],
        ouch: [L('Ow! You nearly knocked over the sunflower!', '¡Ay! ¡Casi tiras el girasol!')],
        morning: [L('Morning, plants! Morning, everyone!', '¡Buenos días, plantas! ¡Buenos días a todos!')],
        small: [L('Watered {watered} plants today. Not one thank-you.', 'Hoy he regado {watered} plantas. Ni un gracias.'), L('The bluebells were gossiping about you.', 'Las campanillas hablaban de ti.'), L('Tam swept right over my seedlings. Again.', 'Tam barrió justo encima de mis plantones. Otra vez.')]
      }
    },

    /* ======================= TAM — sweeper ======================= */
    tam: {
      name: 'Tidy Tam', title: ['sweeper · Wandering Market', 'barrendero · Mercado Errante'], col: '#4ac8ff', role: 'sweeper',
      persona: 'Tidy Tam, a cheerful, philosophical sweeper who keeps the Wandering Market spotless. Leans on his broom between jobs, has opinions about wrappers, sees litter as a puzzle the universe keeps setting him.',
      look: { shirt: 0x3a8ad8, human: { sp: 'human_a', height: 1.8, skin: 0x8d5524, hair: 0x14100c, style: 'afro', shirt: { col: 0x3a8ad8 }, pants: { col: 0x2a2a2c }, shoe: 0x2a2a2c } },
      job: L('Somebody drops it, I sweep it, the bin gets it. The circle of litter.', 'Alguien lo tira, yo lo barro, el cubo se lo queda. El ciclo de la basura.'),
      first: L('Welcome! Please don’t drop anything. If you do, I’ll find it. I always find it.', '¡Bienvenido! Por favor, no tires nada. Si lo haces, lo encontraré. Siempre lo encuentro.'),
      greet: [L('%n! Clean shoes today. Respect.', '¡%n! Zapatos limpios hoy. Respeto.'), L('Ah, a fellow appreciator of tidy paths.', 'Ah, otro amante de los caminos limpios.')],
      busy: {
        sweep: [L('Mid-sweep! This wrapper’s been taunting me for a minute.', '¡Estoy barriendo! Este envoltorio lleva un minuto provocándome.')],
        empty: [L('Bin run! Bag’s full. What can I do for you?', '¡Viaje al cubo! La bolsa está llena. ¿Qué necesitas?')],
        sleep: [L('Zzz… one more… wrapper… zzz', 'Zzz… un envoltorio… más… zzz')]
      },
      report: s => L((s.swept || 0) + ' bits of litter swept, ' + (s.bags || 0) + ' bags emptied into the bin. Mostly mango wrappers. This crew eats a lot.', (s.swept || 0) + ' trozos de basura barridos y ' + (s.bags || 0) + ' bolsas vaciadas en el cubo. Casi todo envoltorios de mango. Este equipo come mucho.'),
      topics: [
        { id: 'litter', kw: ['litter', 'rubbish', 'trash', 'sweep', 'broom', 'bin', 'clean', 'basura', 'barrer', 'escoba', 'cubo', 'limpio', 'papelera'], say: [L('I find the nearest piece, sweep it, bag it. Four in the bag, then off to the bin. When there’s nothing, I lean on my broom and wait. Something always turns up.', 'Busco el trozo más cercano, lo barro y lo meto en la bolsa. Con cuatro, al cubo. Cuando no hay nada, me apoyo en la escoba y espero. Siempre aparece algo.'), L('Every time someone finishes a mango, a wrapper is born. I don’t judge. I sweep.', 'Cada vez que alguien termina un mango, nace un envoltorio. No juzgo. Barro.')] },
        { id: 'self', kw: ['who are you', 'about you', 'yourself', 'quien eres', 'sobre ti'], say: [L('Tam. “Tidy” was a nickname. Then it was a lifestyle.', 'Tam. Lo de “Tidy” (ordenado) era un apodo. Luego fue un estilo de vida.')] }
      ],
      chip: [L('Litter?', '¿Basura?'), L('How do you keep the place clean?', '¿Cómo mantienes limpio el sitio?')],
      barks: [L('A clean path is a happy path.', 'Un camino limpio es un camino feliz.'), L('I see you, little wrapper.', 'Te veo, pequeño envoltorio.')],
      fallback: [L('Interesting. Ask me about litter, what I’m doing, or the day’s count.', 'Interesante. Pregúntame por la basura, por lo que hago o por el recuento del día.')],
      lines: {
        hello: [L('Hey %n! Watch your step!', '¡Ey %n! ¡Mira dónde pisas!')],
        bye: [L('Keep it tidy!', '¡Mantenlo limpio!')],
        ouch: [L('Hey! I’m sweeping here!', '¡Oye! ¡Que estoy barriendo!')],
        morning: [L('New day, new litter.', 'Nuevo día, nueva basura.')],
        small: [L('Swept {swept} bits today. I name the big ones.', 'Hoy he barrido {swept} trozos. A los grandes les pongo nombre.'), L('Who keeps dropping wrappers by the stall? …Okay, it’s everyone.', '¿Quién tira envoltorios junto al puesto? …Vale, todo el mundo.'), L('The bin is my best friend. Don’t tell Dash.', 'El cubo es mi mejor amigo. No se lo digas a Dash.')]
      }
    },

    /* ======================= BIX — guard ======================= */
    bix: {
      name: 'Warden Bix', title: ['guard · Wandering Market', 'vigilante · Mercado Errante'], col: '#ff5a5a', role: 'guard',
      persona: 'Warden Bix, a stern but secretly soft-hearted guard for the Wandering Market. Walks patrol rounds, carries a lantern on the night shift, naps in the afternoon. Does not tolerate running in the market or punching the crew; gives warnings before anything else.',
      look: { shirt: 0x2a3a5a, hat: 0x1a2a4a, human: { sp: 'human_a', height: 1.88, skin: 0xa86a3c, hair: 0x14100c, style: 'short', beard: true, shirt: { col: 0x2a3a5a }, pants: { col: 0x1a1a22 }, boots: true, shoe: 0x1a1a1a } },
      job: L('Patrol, watch, repeat. And no running in the market.', 'Ronda, vigilancia, repetir. Y nada de correr en el mercado.'),
      first: L('Evening, citizen. Warden Bix. Walk, don’t run, keep your fists to yourself, and we’ll get along fine.', 'Buenas, ciudadano. Vigilante Bix. Camina, no corras, guárdate los puños y nos llevaremos bien.'),
      greet: [L('%n. All quiet. Let’s keep it that way.', '%n. Todo tranquilo. Que siga así.'), L('Citizen.', 'Ciudadano.')],
      busy: {
        pursue: [L('You. Stop right there.', 'Tú. Quieto ahí.')],
        scold: [L('We need to talk about your hands.', 'Tenemos que hablar de tus manos.')],
        watch: [L('I’m watching you. Politely. But watching.', 'Te estoy vigilando. Con educación. Pero vigilando.')],
        sleep: [L('Mmph. Afternoon nap. Night shift is long. What is it?', 'Mmf. Siesta. El turno de noche es largo. ¿Qué pasa?')]
      },
      report: s => L((s.rounds || 0) + ' patrol stops, ' + (s.warnings || 0) + ' warnings for running and ' + (s.scoldings || 0) + ' serious talks about punching. ' + ((s.scoldings || 0) ? 'You know who you are.' : 'Quiet shift.'), (s.rounds || 0) + ' paradas de ronda, ' + (s.warnings || 0) + ' avisos por correr y ' + (s.scoldings || 0) + ' charlas serias sobre puñetazos. ' + ((s.scoldings || 0) ? 'Tú sabes quién eres.' : 'Turno tranquilo.')),
      topics: [
        { id: 'rules', kw: ['rule', 'rules', 'run', 'running', 'punch', 'fight', 'law', 'trouble', 'regla', 'normas', 'correr', 'pegar', 'pelea', 'ley', 'problema'], say: [L('Two rules. Don’t sprint through the market — people are carrying crates. Don’t punch the crew. Break the first, I warn you. Break the second, I come and find you.', 'Dos normas. No esprintes por el mercado: la gente lleva cajas. No le pegues al equipo. Si rompes la primera, te aviso. Si rompes la segunda, voy a buscarte.')] },
        { id: 'night', kw: ['night', 'lantern', 'shift', 'nap', 'sleep', 'noche', 'farol', 'turno', 'siesta', 'dormir'], say: [L('I nap in the afternoon and walk the night round with a lantern. Somebody has to watch the campfire while the rest snore.', 'Echo la siesta por la tarde y hago la ronda nocturna con un farol. Alguien tiene que vigilar la hoguera mientras los demás roncan.')] },
        { id: 'self', kw: ['who are you', 'about you', 'yourself', 'quien eres', 'sobre ti'], say: [L('Bix. I used to guard a portal. The portal never caused trouble. People do.', 'Bix. Antes vigilaba un portal. El portal nunca dio problemas. La gente sí.')] }
      ],
      chip: [L('The rules?', '¿Las normas?'), L('What are the rules here?', '¿Cuáles son las normas aquí?')],
      barks: [L('Walk, don’t run.', 'Camina, no corras.'), L('All quiet on the market front.', 'Todo tranquilo en el frente del mercado.')],
      fallback: [L('Hm. Ask me about the rules, the night shift, or what I’m doing.', 'Hm. Pregúntame por las normas, el turno de noche o lo que hago.')],
      lines: {
        hello: [L('Citizen.', 'Ciudadano.'), L('Evening, %n.', 'Buenas, %n.')],
        bye: [L('Stay out of trouble.', 'No te metas en líos.')],
        running: [L('Oi! Walk, don’t run — people are working!', '¡Eh! Camina, no corras: ¡la gente está trabajando!'), L('Slow down! This is a market, not a racetrack!', '¡Más despacio! ¡Esto es un mercado, no un circuito!')],
        chase: [L('Hey! Stop right there!', '¡Eh! ¡Quieto ahí!'), L('I saw that!', '¡Lo he visto!')],
        scold1: [L('Hands to yourself, %n. First warning.', 'Las manos quietas, %n. Primer aviso.'), L('We don’t punch the crew here. Understood?', 'Aquí no se le pega al equipo. ¿Entendido?')],
        scold2: [L('Again?! Last warning, %n. I’m watching you.', '¿¡Otra vez!? Último aviso, %n. Te estoy vigilando.')],
        giveup: [L('Hmph. Got away. I’ll remember that face.', 'Hmf. Se ha escapado. Recordaré esa cara.')],
        ouch: [L('Assaulting an officer?! Big mistake.', '¿¡Agredir a un agente!? Gran error.')],
        morning: [L('Nap over. Back on watch.', 'Se acabó la siesta. De vuelta a la guardia.')],
        small: [L('{warnings} people ran through the market today. Running!', 'Hoy {warnings} personas han cruzado el mercado corriendo. ¡Corriendo!'), L('Night round was quiet. Too quiet. I liked it.', 'La ronda nocturna fue tranquila. Demasiado. Me gustó.'), L('Keep an eye on the newcomer. Seems nice. Suspiciously nice.', 'Vigilad al recién llegado. Parece majo. Sospechosamente majo.')]
      }
    },

    /* ======================= MELO — busker ======================= */
    melo: {
      name: 'Melo', title: ['busker · Wandering Market', 'músico callejero · Mercado Errante'], col: '#ff6ad5', role: 'busker',
      persona: 'Melo, a laid-back, romantic busker who plays guitar for tips at the Wandering Market. Plays a set, counts the coins in his hat, spends them all on Mae’s mangoes, naps, plays again. Thinks every world has its own key signature.',
      look: { shirt: 0xc83a8a, human: { sp: 'human_a', height: 1.76, skin: 0xd8a47a, hair: 0xd8b860, style: 'messy', shirt: { col: 0xc83a8a }, pants: { col: 0xc8b088 }, foot: 'flip', shoe: 0x6a3a1a } },
      job: L('Play, pass the hat, eat a mango, repeat. A perfect song structure.', 'Tocar, pasar el sombrero, comerme un mango, repetir. Una estructura de canción perfecta.'),
      first: L('Hey friend. Melo. Stay for a song — the hat’s by my feet if you feel generous. Press E on it.', 'Hola, amigo. Melo. Quédate a una canción; el sombrero está a mis pies si te sientes generoso. Pulsa E sobre él.'),
      greet: [L('%n! Request a song? I only know one. It’s very long.', '¡%n! ¿Pides una canción? Solo me sé una. Es muy larga.'), L('Good timing — I just tuned. Mostly.', 'Buen momento: acabo de afinar. Más o menos.')],
      busy: {
        busk: [L('Mid-song, but for you I’ll pause the universe. What’s up?', 'Estoy a mitad de canción, pero por ti paro el universo. ¿Qué pasa?')],
        packup: [L('Set’s done! Counting coins. Mango money.', '¡Se acabó el bolo! Contando monedas. Dinero para mangos.')],
        sleep: [L('Zzz… la la… zzz', 'Zzz… la la… zzz')]
      },
      report: s => L((s.sets || 0) + ' sets played, ' + (s.tips || 0) + ' coins from passers-by' + ((s.playerTips || 0) ? ', and ' + s.playerTips + ' from you — thank you!' : '. You haven’t tipped yet. No pressure. Some pressure.'), (s.sets || 0) + ' bolos tocados, ' + (s.tips || 0) + ' monedas de transeúntes' + ((s.playerTips || 0) ? ' y ' + s.playerTips + ' tuyas, ¡gracias!' : '. Tú aún no has dado propina. Sin presión. Un poco de presión.')),
      topics: [
        { id: 'music', kw: ['music', 'song', 'guitar', 'play', 'tip', 'hat', 'coin', 'musica', 'cancion', 'guitarra', 'tocar', 'propina', 'sombrero', 'moneda'], say: [L('I play a set — a minute or so — and people drop coins in the hat. Press E on the hat to tip me two credits. Then I pack up, spend it all at Mae’s, and play again.', 'Toco un bolo, más o menos un minuto, y la gente echa monedas en el sombrero. Pulsa E sobre el sombrero para darme dos créditos. Luego recojo, me lo gasto todo en lo de Mae y vuelvo a tocar.'), L('If you stand and listen, I play faster. Audience energy. It’s science.', 'Si te quedas a escuchar, toco más rápido. Energía del público. Es ciencia.')] },
        { id: 'self', kw: ['who are you', 'about you', 'yourself', 'quien eres', 'sobre ti'], say: [L('Melo. Short for Melody. Long for Mel.', 'Melo. Diminutivo de Melodía. Aumentativo de Mel.')] }
      ],
      chip: [L('Play a song?', '¿Tocas algo?'), L('Will you play me a song?', '¿Me tocas una canción?')],
      barks: [L('♪ La la laaa… ♪', '♪ La la laaa… ♪'), L('Every world has its own key. This one’s in G.', 'Cada mundo tiene su tonalidad. Este está en sol.')],
      fallback: [L('Mmm, nice rhythm to that. Ask me about the music, what I’m doing, or how the hat’s doing.', 'Mmm, eso tiene buen ritmo. Pregúntame por la música, por lo que hago o por cómo va el sombrero.')],
      lines: {
        hello: [L('Hey, %n! ♪', '¡Ey, %n! ♪')],
        bye: [L('Stay groovy.', 'Que no pare el ritmo.')],
        listener: [L('You’ve got good ears, %n!', '¡Tienes buen oído, %n!'), L('A real audience! I’m blushing in B flat.', '¡Público de verdad! Me sonrojo en si bemol.')],
        tipped: [L('Thank you kindly! ♪', '¡Muchísimas gracias! ♪'), L('Ooh, mango money!', '¡Uy, dinero para mangos!')],
        ouch: [L('Hey! Not the guitar hand!', '¡Oye! ¡La mano de la guitarra no!')],
        morning: [L('Morning! Time for a sunrise song.', '¡Buenos días! Hora de una canción de amanecer.')],
        small: [L('{tips} coins in the hat today. All going to Mae.', '{tips} monedas en el sombrero hoy. Todas para Mae.'), L('I wrote a song about Dash. It’s very fast.', 'Escribí una canción sobre Dash. Es muy rápida.'), L('Bix tapped his foot during my set. I saw it.', 'Bix movió el pie durante mi bolo. Lo vi.')]
      }
    }
  };
  for (const id in WORKERS) AV.NPCS[id] = worker(id, WORKERS[id]);
})();
