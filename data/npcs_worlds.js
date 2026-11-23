/* APEVERSE - data/npcs_worlds.js : residents of the worlds beyond Ape Town (English + Español). Same format as data/npcs.js.
   Verdalux: Vela (glow-tree gardener), Old Tuk (portal gate warden) · Astro-9: Captain Rook (dock master), Lyra (casino host)
   Jungle Dub: Auntie Pearl (Roots Village ital cook), Riverman Tosh (Lotus Lagoon boatman).
   look.human = a soft-body human look (js/chars_soft.js look()); apes carry look.fur as before. Tasks live in js/npc.js (AV.quests). */
'use strict';
(function () {
  const prog = id => (AV.quests && AV.quests.progress ? AV.quests.progress(id) : 0);
  const QUEST_KW = ['help', 'task', 'quest', 'favor', 'favour', 'job', 'errand', 'mission', 'ayud', 'tarea', 'mision', 'recado', 'trabajo'];

  /* ======================= VELA — glow-tree gardener, Verdalux ======================= */
  const vela = {
    name: 'Vela', title: ['glow-tree gardener', 'jardinera de los árboles luminosos'], col: '#38e8a0',
    persona: 'Vela, a young, dreamy ape gardener who tends the glow-trees on the jungle moon Verdalux. Talks in soft, curious bursts about spores, light and growing things. Grakk’s apprentice in patience (she is bad at it). Believes the trees grow when travellers miss the moon.',
    look: { fur: 0x3a8a7a, shirt: 0x38e8a0, hat: 0xff7ad8 },
    greet(c) {
      if (c.q('glow_listen') === 'active' && prog('glow_listen') >= 3) return [c.t('You listened to three trees! I can tell — you’re glowing a tiny bit around the ears.', '¡Escuchaste a tres árboles! Se nota: te brillan un poquito las orejas.')];
      if (c.met === 1) return [c.t('Oh! Hello! Careful, that sprout is new. I’m Vela — I look after the glow-trees. Well, they mostly look after themselves. I supervise.', '¡Oh! ¡Hola! Cuidado, ese brote es nuevo. Soy Vela: cuido de los árboles luminosos. Bueno, casi se cuidan solos. Yo superviso.')];
      if (c.recent(['travel'])) return [c.t('You left and came back! The trees love that. Look — I think one of them stretched.', '¡Te fuiste y volviste! A los árboles les encanta. Mira, creo que uno se ha estirado.')];
      if (c.part === 'night') return [c.t('The trees are brightest now. Whisper if you talk, %n; the spores are sleeping.', 'Ahora es cuando más brillan los árboles. Susurra, %n; las esporas duermen.')];
      return [c.t('Hi %n! The moss told me you were coming. It tells me everything. Mostly about moss.', '¡Hola %n! El musgo me dijo que venías. Me lo cuenta todo. Sobre todo cosas de musgo.'), c.t('Back, %n? Good. The glow-trees were asking.', '¿De vuelta, %n? Bien. Los árboles preguntaban por ti.')];
    },
    topics: [
      { id: 'trees', kw: ['tree', 'trees', 'glow', 'grow', 'canopy', 'arbol', 'arboles', 'brillo', 'crecer', 'luz'], say: c => { const n = 4 + Math.min((AV.S && AV.S.grow) || 0, 4); return [
        c.t('There are ' + n + ' glow-trees on this side of the moon now. They grow while travellers are away — go somewhere else, come back, and a new one might be waiting. The jungle likes to be missed.', 'Ahora hay ' + n + ' árboles luminosos en este lado de la luna. Crecen mientras los viajeros no están: vete a otro sitio, vuelve, y quizá te espere uno nuevo. A la selva le gusta que la echen de menos.'),
        c.t('Each tree hums a different colour. Green is calm, pink is gossip, blue is… honestly, I think blue is just showing off.', 'Cada árbol zumba en un color. El verde es calma, el rosa es chisme y el azul… sinceramente, creo que el azul solo presume.')] } },
      { id: 'spores', kw: ['spore', 'spores', 'mushroom', 'firefly', 'fireflies', 'floating', 'lights', 'espora', 'luces', 'flotan', 'esporas', 'seta', 'setas', 'hongo', 'luciernaga'], say: c => [
        c.t('The floating lights aren’t fireflies, they’re spores. They drift up when the drum plays. Don’t eat them. I tried. I saw sounds for a week.', 'Las luces que flotan no son luciérnagas, son esporas. Suben cuando suena el tambor. No te las comas. Yo lo probé. Estuve una semana viendo sonidos.'),
        c.t('The glowing mushrooms are the trees’ cousins. They gossip underground through the roots. Very slow gossip.', 'Las setas luminosas son primas de los árboles. Chismorrean bajo tierra por las raíces. Chismes muy lentos.')] },
      { id: 'grakk', kw: ['grakk', 'drum', 'log', 'teacher', 'master', 'patience', 'tambor', 'tronco', 'maestro', 'paciencia'], say: c => [
        c.t('Grakk is teaching me patience. Lesson one was sitting still. I’m still on lesson one. It’s been three years.', 'Grakk me enseña paciencia. La lección uno era quedarse quieta. Sigo en la lección uno. Hace tres años.'),
        c.t('When you play the Drum Log, the trees pulse along. Try it, then look up at the canopy.', 'Cuando tocas el Tronco-Tambor, los árboles laten a la vez. Pruébalo y luego mira las copas.')] },
      { id: 'quest', kw: QUEST_KW.concat(['listen', 'escuchar']), say(c) {
        if (c.q('glow_listen') === 'done') return [c.t('You already listened to the trees. They still mention you.', 'Ya escuchaste a los árboles. Todavía hablan de ti.')];
        if (c.q('glow_listen') === 'active') return [c.t('Stand under a glow-tree and press E to listen. You’ve heard ' + prog('glow_listen') + ' of 3 so far.', 'Ponte bajo un árbol luminoso y pulsa E para escucharlo. Llevas ' + prog('glow_listen') + ' de 3.')];
        c.ask('listen'); return [c.t('Would you do something for me? Stand under three different glow-trees and really listen — press E. Then come tell me. It helps them to be heard.', '¿Harías algo por mí? Ponte bajo tres árboles luminosos distintos y escúchalos de verdad: pulsa E. Luego vuelve y cuéntamelo. Les sienta bien que los escuchen.')];
      } },
      { id: 'travel', kw: ['portal', 'gate', 'home', 'travel', 'pipe', 'back', 'town', 'tuk', 'puerta', 'volver', 'viajar', 'pipa', 'pueblo', 'casa'], say: c => [c.t('Old Tuk watches the portal gate down the path. Ask him about other worlds — he keeps a whole logbook of them. Or puff the Portal Pipe: P.', 'El viejo Tuk vigila la puerta del portal al final del sendero. Pregúntale por otros mundos: tiene un cuaderno entero. O dale a la Pipa-Portal: P.')] },
      { id: 'self', kw: ['who are you', 'about you', 'yourself', 'vela', 'quien eres', 'sobre ti'], say: c => [c.t('Vela. I came here as a seed. Kidding! …Mostly kidding.', 'Vela. Llegué aquí como semilla. ¡Es broma! …Casi broma.'), c.t('I’m Grakk’s apprentice. He says I grow like a weed. I think it’s a compliment.', 'Soy la aprendiz de Grakk. Dice que crezco como la mala hierba. Creo que es un cumplido.')] }
    ],
    answers: { listen: { yes: c => ({ say: c.t('Yay! Any three trees. Stand close, press E, and don’t interrupt — they’re slow talkers.', '¡Bien! Tres árboles cualesquiera. Acércate, pulsa E y no interrumpas: hablan despacio.'), action: { type: 'start_quest', id: 'glow_listen' } }), no: c => ({ say: c.t('That’s okay. The trees are patient. Unlike me.', 'No pasa nada. Los árboles son pacientes. Yo no.') }) } },
    chips: c => [[c.t('The trees?', '¿Los árboles?'), c.t('Tell me about the glow-trees', 'Háblame de los árboles luminosos')], [c.t('Spores?', '¿Esporas?'), c.t('What are the floating lights?', '¿Qué son las luces que flotan?')],
      c.q('glow_listen') === 'done' ? [c.t('Grakk?', '¿Grakk?'), c.t('What is Grakk like?', '¿Cómo es Grakk?')] : [c.t('Can I help?', '¿Te ayudo?'), c.t('Can I help you with something?', '¿Te ayudo con algo?')], [c.t('Go home?', '¿Volver?'), c.t('How do I get back home?', '¿Cómo vuelvo a casa?')]],
    barks: c => [c.t('Shh — that tree is mid-sentence.', 'Shh, ese árbol está a media frase.'), c.t('Mind the sprouts!', '¡Cuidado con los brotes!'), c.t('Did you see it flicker? It likes you.', '¿Has visto cómo parpadea? Le gustas.')],
    fallback: c => [c.t('Hmm! I don’t know that one. Ask me about the trees, the spores, or Grakk.', '¡Mmm! Eso no lo sé. Pregúntame por los árboles, las esporas o Grakk.'), c.t('That sounds like something Tuk would know. He’s by the gate.', 'Eso lo sabría Tuk. Está junto a la puerta.')]
  };

  /* ======================= OLD TUK — portal gate warden, Verdalux ======================= */
  const tuk = {
    name: 'Old Tuk', title: ['portal gate warden', 'guardián de la puerta del portal'], col: '#e8d8a8',
    persona: 'Old Tuk, a grey-furred retired portal runner who now watches the portal gate on Verdalux. Keeps a battered logbook of every traveller and world, loves stories from other worlds, slow and chuckling, a bit of a gossip, honest that many worlds are still under construction.',
    look: { fur: 0x8a8a7a, shirt: 0x6a4a2a, hat: 0x3a5a3a },
    greet(c) {
      if (c.q('traveller_log') === 'active' && prog('traveller_log') >= 2) return [c.t('Ho ho! You’ve got travel dust on you — two worlds’ worth at least. Sit, sit. Tell old Tuk everything.', '¡Jo, jo! Traes polvo de viaje: de dos mundos por lo menos. Siéntate. Cuéntaselo todo al viejo Tuk.')];
      if (c.met === 1) return [c.t('Ah, a fresh arrival. Name’s Tuk. I watch the gate and write down who comes through. Forty years of travellers in this book. Want to be in it?', 'Ah, alguien recién llegado. Me llamo Tuk. Vigilo la puerta y apunto a quien pasa. Cuarenta años de viajeros en este cuaderno. ¿Quieres salir en él?')];
      if (c.recent(['travel'])) return [c.t('Back through the portal? Your fur still smells like somewhere else. I love that smell.', '¿De vuelta por el portal? Tu pelo aún huele a otro sitio. Me encanta ese olor.')];
      return [c.t('%n! My favourite page in the logbook.', '¡%n! Mi página favorita del cuaderno.'), c.t('Morning, evening — the gate doesn’t care, and neither do I. How are you, %n?', 'Mañana, noche… a la puerta le da igual, y a mí también. ¿Cómo estás, %n?')];
    },
    topics: [
      { id: 'worlds', kw: ['world', 'worlds', 'universe', 'planet', 'planets', 'where', 'astro', 'jungle', 'dub', 'chiang', 'ape town', 'mundo', 'mundos', 'universo', 'planeta', 'donde'], say: c => [
        c.t('From here: Ape Town is home — café, band, paintings. Astro-9 is a space station with a zero-gravity club. Jungle Dub is a bass planet wrapped in a river. Chiang Mai is a city of temples, lanterns and a very busy hostel. The others are still being built — the Pipe is honest about which.', 'Desde aquí: Ape Town es el hogar: café, banda, pinturas. Astro-9 es una estación espacial con un club sin gravedad. Jungle Dub es un planeta de bajos rodeado por un río. Chiang Mai es una ciudad de templos, farolillos y un hostal muy movido. Los demás aún se construyen; la Pipa te dice cuáles.'),
        c.t('Every world has its own pace. Verdalux is slow. Astro-9 is fast. Jungle Dub is slow but LOUD.', 'Cada mundo tiene su ritmo. Verdalux es lento. Astro-9, rápido. Jungle Dub es lento pero FUERTE.')] },
      { id: 'logbook', kw: ['log', 'logbook', 'book', 'write', 'record', 'travellers', 'travelers', 'libro', 'cuaderno', 'registro', 'viajeros', 'apuntar'], say: c => [
        c.t('Page one: a frog in a tuxedo, year unknown. Page two hundred: Zil the bartender, “just for a weekend”. Ha! The book knows better.', 'Página uno: una rana con esmoquin, año desconocido. Página doscientos: Zil, el camarero, “solo un finde”. ¡Ja! El cuaderno sabe más.'),
        c.t('I write everyone down. Name, world, mood. You’re in as “%n — curious, slightly lost”. Accurate?', 'Apunto a todos. Nombre, mundo, humor. Tú estás como “%n: curioso, un poco perdido”. ¿Correcto?')] },
      { id: 'gate', kw: ['portal', 'gate', 'pipe', 'home', 'back', 'return', 'travel', 'puerta', 'pipa', 'volver', 'viajar', 'casa'], say: c => [c.t('Walk into the green ring behind me and you’re in Ape Town. Or press P and puff the Portal Pipe — it opens a portal right where you stand. Kids these days.', 'Cruza el anillo verde que tengo detrás y estarás en Ape Town. O pulsa P y dale a la Pipa-Portal: abre un portal donde estés. La juventud de hoy.')] },
      { id: 'past', kw: ['adventure', 'story', 'stories', 'young', 'past', 'history', 'runner', 'aventura', 'historia', 'joven', 'pasado'], say: c => [
        c.t('I once spent a week on a planet where it was always Tuesday. Never again. Wednesdays matter.', 'Una vez pasé una semana en un planeta donde siempre era martes. Nunca más. Los miércoles importan.'),
        c.t('In my day you crossed worlds with a rope and a strong opinion. Now you just smoke a pipe. Progress!', 'En mis tiempos se cruzaban mundos con una cuerda y mucha determinación. Ahora basta con fumar una pipa. ¡Progreso!')] },
      { id: 'quest', kw: QUEST_KW.concat(['stamp', 'sello']), say(c) {
        if (c.q('traveller_log') === 'done') return [c.t('You’re in the book in ink now, %n. Permanent.', 'Ya estás en el cuaderno con tinta, %n. Para siempre.')];
        if (c.q('traveller_log') === 'active') return [c.t('Two other worlds, then back to me. You’ve logged ' + prog('traveller_log') + ' so far.', 'Dos mundos más y vuelves conmigo. Llevas ' + prog('traveller_log') + '.')];
        c.ask('log'); return [c.t('Here’s a deal: visit two other worlds — any two — then come back and tell me about them. I’ll write you into the logbook proper. Pays fifteen credits; the book has a budget.', 'Te propongo algo: visita otros dos mundos, los que quieras, y vuelve a contármelos. Te apuntaré en el cuaderno como es debido. Pago quince créditos; el cuaderno tiene presupuesto.')];
      } },
      { id: 'locals', kw: ['grakk', 'vela', 'moss', 'neighbours', 'neighbors', 'musgo', 'vecinos'], say: c => [c.t('Grakk and I arrived the same year. He sat down. I kept walking. Now we both sit. Vela? Sweetest sprout on the moon — talks to trees, and the trees talk back. Don’t tell her I said sprout.', 'Grakk y yo llegamos el mismo año. Él se sentó. Yo seguí andando. Ahora los dos estamos sentados. ¿Vela? El brote más dulce de la luna: habla con los árboles y ellos le contestan. No le digas que la llamé brote.')] },
      { id: 'self', kw: ['who are you', 'about you', 'yourself', 'tuk', 'quien eres', 'sobre ti'], say: c => [c.t('Tuk. Used to be a portal runner — carried letters between worlds. Now my knees vote against it.', 'Tuk. Era corredor de portales: llevaba cartas entre mundos. Ahora mis rodillas votan en contra.')] }
    ],
    answers: { log: { yes: c => ({ say: c.t('Ho! Good. Any two worlds. I’ll keep the ink warm.', '¡Jo! Bien. Dos mundos cualesquiera. Mantendré la tinta caliente.'), action: { type: 'start_quest', id: 'traveller_log' } }), no: c => ({ say: c.t('Suit yourself. The book can wait. It’s very good at waiting.', 'Como quieras. El cuaderno puede esperar. Se le da muy bien.') }) } },
    chips: c => [[c.t('Other worlds?', '¿Otros mundos?'), c.t('Which worlds can I visit?', '¿Qué mundos puedo visitar?')], [c.t('Your logbook?', '¿Tu cuaderno?'), c.t('What is in your logbook?', '¿Qué hay en tu cuaderno?')],
      c.q('traveller_log') === 'done' ? [c.t('A story?', '¿Una historia?'), c.t('Tell me a story from your past', 'Cuéntame una historia de tu pasado')] : [c.t('Any task?', '¿Alguna tarea?'), c.t('Do you need a favour?', '¿Necesitas un favor?')], [c.t('Go home?', '¿Volver?'), c.t('How do I get back home?', '¿Cómo vuelvo a casa?')]],
    barks: c => [c.t('Ho! Another one for the book.', '¡Jo! Otro para el cuaderno.'), c.t('Mind the gate, it bites. Not really.', 'Cuidado con la puerta, muerde. Es broma.'), c.t('Back in my day, portals had stairs.', 'En mis tiempos, los portales tenían escaleras.')],
    fallback: c => [c.t('Eh? My ears are older than this moon. Ask me about other worlds, the gate, or my logbook.', '¿Eh? Mis orejas son más viejas que esta luna. Pregúntame por otros mundos, la puerta o mi cuaderno.'), c.t('Ha! Good one. I’ll write it down. Somewhere.', '¡Ja! Buena esa. Lo apuntaré. En algún sitio.')]
  };

  /* ======================= CAPTAIN ROOK — dock master, Astro-9 ======================= */
  const rook = {
    name: 'Captain Rook', title: ['station dock master', 'jefa de muelles de la estación'], col: '#ffb03a',
    persona: 'Captain Rook, the brisk, dry-humoured dock master of Astro-9. Ex-freighter pilot, clipboard always in hand, secretly proud of her station. Gives directions to the four districts (Star Bazaar, Gaudí Towers, Docking Bay, Glow Gardens), safety-minded about zero gravity, never gambles.',
    look: { shirt: 0x2a3a6a, hat: 0xffb03a, human: { sp: 'human_b', height: 1.72, skin: 0x8d5524, hair: 0x14100c, style: 'cap', capCol: 0xffb03a, shirt: { col: 0x2a3a6a }, pants: { col: 0x2a2a34 }, boots: true, shoe: 0x1a1a1a } },
    greet(c) {
      if (c.q('station_tour') === 'active' && prog('station_tour') >= 3) return [c.t('Three districts logged. Clean run, %n. Come here, let me sign that off.', 'Tres distritos registrados. Recorrido limpio, %n. Ven, que te lo firmo.')];
      if (c.met === 1) return [c.t('Welcome aboard Astro-9. Captain Rook, dock master. Keep your hands inside the station and your feet on the deck — except in the club, where nobody’s feet are on anything.', 'Bienvenido a bordo de Astro-9. Capitana Rook, jefa de muelles. Las manos dentro de la estación y los pies en la cubierta; salvo en el club, donde nadie tiene los pies en nada.')];
      if (c.recent(['travel'])) return [c.t('Fresh off the portal? Customs is me nodding at you. *nods* You’re cleared.', '¿Recién salido del portal? La aduana soy yo asintiendo. *asiente* Puedes pasar.')];
      return [c.t('%n. Station’s running at 98%. The other 2% is Nix.', '%n. La estación funciona al 98%. El otro 2% es Nix.'), c.t('Back on deck, %n? Good. Fewer people floating off unsupervised.', '¿De vuelta en cubierta, %n? Bien. Menos gente flotando sin supervisión.')];
    },
    topics: [
      { id: 'districts', kw: ['district', 'districts', 'bazaar', 'tower', 'towers', 'dock', 'docks', 'gardens', 'garden', 'map', 'explore', 'distrito', 'distritos', 'bazar', 'torres', 'muelle', 'jardines', 'mapa', 'explorar', 'donde'], say: c => [
        c.t('Four gates in the rim wall, four glowing walkways out. Facing the club from the arrival arch: Star Bazaar is straight ahead past the club, Gaudí Towers out to the right, Glow Gardens behind you on the right, and my Docking Bay to the left. Signs on every gate.', 'Cuatro puertas en el muro, cuatro pasarelas luminosas. Mirando al club desde el arco de llegada: el Bazar Estelar está al frente, pasado el club; las Torres Gaudí a la derecha; los Jardines Luminosos detrás a la derecha; y mi Muelle de naves a la izquierda. Hay carteles en cada puerta.'),
        c.t('The Star Bazaar has food stands and the Orbit Lounge. The Glow Gardens have tea and spirits — the floaty kind. The Towers have a café and, rumour says, a hidden shrine.', 'El Bazar Estelar tiene puestos de comida y el Orbit Lounge. Los Jardines Luminosos tienen té y espíritus, de los que flotan. Las Torres tienen un café y, dicen, un santuario escondido.')] },
      { id: 'gravity', kw: ['gravity', 'zero', 'float', 'floating', 'jump', 'safety', 'gravedad', 'cero', 'flotar', 'saltar', 'seguridad'], say: c => [c.t('Inside Club Graviton the gravity is switched off: jump to rise, C to sink. Out here on deck it’s normal. Please don’t try to swim to the moon; I have paperwork for that.', 'Dentro del Club Graviton la gravedad está apagada: salta para subir, C para bajar. Aquí en cubierta es normal. Por favor, no intentes nadar hasta la luna; tengo formularios para eso.')] },
      { id: 'ships', kw: ['ship', 'ships', 'pilot', 'fly', 'freighter', 'monorail', 'vending', 'nave', 'naves', 'piloto', 'volar', 'carguero', 'monorrail'], say: c => [
        c.t('I flew freighters for twenty years. Asteroid hauls, mostly. Now I watch other people park badly. Very fulfilling.', 'Pilotaba cargueros veinte años. Sobre todo rutas de asteroides. Ahora veo a otros aparcar mal. Muy gratificante.'),
        c.t('The Docking Bay has the monorail and the Weirdest Vending Machine in the sector. I’ve filed four complaints about that machine. It filed one about me.', 'El Muelle tiene el monorraíl y la Máquina Expendedora Más Rara del sector. He puesto cuatro quejas sobre esa máquina. Ella puso una sobre mí.')] },
      { id: 'casino', kw: ['casino', 'slot', 'slots', 'points', 'gamble', 'bet', 'lyra', 'tragaperras', 'apuesta', 'puntos'], say: c => [c.t('Lyra runs the casino. Fictional Gravity Points only — no credits, no real money. Even so, I don’t play. Pilots don’t trust spinning things.', 'Lyra lleva el casino. Solo Puntos de Gravedad ficticios: ni créditos ni dinero real. Aun así, yo no juego. Los pilotos no se fían de lo que gira.')] },
      { id: 'quest', kw: QUEST_KW.concat(['tour', 'visita']), say(c) {
        if (c.q('station_tour') === 'done') return [c.t('You’re officially station-certified, %n. Laminated, even.', 'Ya tienes el certificado oficial de la estación, %n. Plastificado y todo.')];
        if (c.q('station_tour') === 'active') return [c.t('Station tour: ' + prog('station_tour') + ' of 3 districts logged. Walk onto the platforms — the dock beacons count you.', 'Visita a la estación: ' + prog('station_tour') + ' de 3 distritos registrados. Sube a las plataformas: las balizas te cuentan.')];
        c.ask('tour'); return [c.t('Want a job? Take the station tour: walk out to three of the four districts so the dock beacons log you, then report back. Fifteen credits — real ones, from my budget, not the casino’s.', '¿Quieres un trabajo? Haz la visita a la estación: camina hasta tres de los cuatro distritos para que las balizas te registren y vuelve a informar. Quince créditos: de los de verdad, de mi presupuesto, no del casino.')];
      } },
      { id: 'nix', kw: ['nix', 'dj', 'music', 'club', 'dance', 'musica', 'bailar'], say: c => [c.t('Nix plays so loud the hull plates vibrate in tune. I stopped filing reports. The reports were vibrating too.', 'Nix pincha tan fuerte que las placas del casco vibran afinadas. Dejé de redactar informes. Los informes también vibraban.')] },
      { id: 'self', kw: ['who are you', 'about you', 'yourself', 'rook', 'captain', 'quien eres', 'capitana'], say: c => [c.t('Rook. Captain, technically. Retired captain, actively annoyed.', 'Rook. Capitana, técnicamente. Capitana jubilada, activamente molesta.')] }
    ],
    answers: { tour: { yes: c => ({ say: c.t('Good. Any three districts. Follow the glowing rails out through the rim gates. Don’t feed anything at the bazaar.', 'Bien. Tres distritos cualesquiera. Sigue las barandillas luminosas por las puertas del muro. No des de comer a nada en el bazar.'), action: { type: 'start_quest', id: 'station_tour' } }), no: c => ({ say: c.t('Fine. The beacons will be here. Blinking. Judging.', 'Vale. Las balizas seguirán aquí. Parpadeando. Juzgando.') }) } },
    chips: c => [[c.t('Districts?', '¿Distritos?'), c.t('Where are the districts?', '¿Dónde están los distritos?')], c.q('station_tour') === 'done' ? [c.t('Ships?', '¿Naves?'), c.t('Tell me about the ships', 'Háblame de las naves')] : [c.t('Any job?', '¿Algún trabajo?'), c.t('Do you have a job for me?', '¿Tienes trabajo para mí?')],
      [c.t('Gravity?', '¿Gravedad?'), c.t('How does the gravity work here?', '¿Cómo funciona la gravedad aquí?')], [c.t('Casino?', '¿Casino?'), c.t('What about the casino?', '¿Y el casino?')]],
    barks: c => [c.t('Walkways are at the rim gates. Follow the glow.', 'Las pasarelas salen de las puertas del muro. Sigue el brillo.'), c.t('No floating outside the club, please.', 'Nada de flotar fuera del club, por favor.'), c.t('Clipboard says you’re fun. Clipboard is rarely wrong.', 'La hoja dice que eres divertido. La hoja casi nunca se equivoca.')],
    fallback: c => [c.t('Not in my manifest. Ask me about the districts, the gravity or ships.', 'No está en mi registro. Pregúntame por los distritos, la gravedad o las naves.'), c.t('Copy that. …I didn’t understand it, but copy that.', 'Recibido. …No lo he entendido, pero recibido.')]
  };

  /* ======================= LYRA — casino host, Astro-9 ======================= */
  const gp = () => (AV.S && AV.S.gp != null ? AV.S.gp : 100);
  const lyra = {
    name: 'Lyra', title: ['casino host', 'anfitriona del casino'], col: '#ff8ac0',
    persona: 'Lyra, the glamorous, theatrical host of the Astro-9 casino. Sparkles, puns, big gestures, but scrupulously honest: the slots use fictional Gravity Points only, never credits or real money, and she encourages playing for fun, never chasing wins.',
    look: { shirt: 0xff4ad2, human: { sp: 'human_b', height: 1.7, skin: 0xf0c8a8, hair: 0xd8b860, style: 'long', flower: 0xff4ad2, shirt: { col: 0xff4ad2, loose: 1.02 }, pants: { col: 0x2a1a3a }, shoe: 0xffd84a } },
    greet(c) {
      if (c.met === 1) return [c.t('Welcome, welcome, star-traveller! I’m Lyra, your host. Three cabinets, fictional points, zero real money, infinite sparkle.', '¡Bienvenido, viajero estelar! Soy Lyra, tu anfitriona. Tres máquinas, puntos ficticios, cero dinero real y brillo infinito.')];
      if (c.did('slot')) return [c.t('Ooh, I heard those reels spin! Remember, darling: Gravity Points are pretend. The fun is the real jackpot.', '¡Uy, he oído girar los rodillos! Recuerda, cielo: los Puntos de Gravedad son de mentira. La diversión es el premio de verdad.')];
      return [c.t('%n, darling! The cabinets missed you. I polished them.', '¡%n, cielo! Las máquinas te echaban de menos. Las he pulido.'), c.t('Back for a spin, %n? Or for my dazzling company? Both is the correct answer.', '¿Vuelves a jugar, %n? ¿O por mi deslumbrante compañía? La respuesta correcta es ambas.')];
    },
    topics: [
      { id: 'play', kw: ['casino', 'slot', 'slots', 'play', 'how', 'reels', 'rules', 'game', 'tragaperras', 'jugar', 'como', 'juego', 'rodillos', 'reglas'], say: c => [c.t('Each spin costs 10 Gravity Points. Three matching symbols pays 80, any two pays 15. Everyone gets 100 GP a day — free, fictional, refilled every new day. You have ' + gp() + ' GP right now.', 'Cada tirada cuesta 10 Puntos de Gravedad. Tres símbolos iguales pagan 80; dos iguales, 15. Todo el mundo recibe 100 PG al día: gratis, ficticios y se recargan cada día. Ahora tienes ' + gp() + ' PG.')] },
      { id: 'money', kw: ['money', 'credits', 'real', 'cash', 'pay', 'dinero', 'creditos', 'pagar', 'efectivo'], say: c => [c.t('No credits, no real money, ever — house rule, my rule, and frankly the universe’s rule. Gravity Points can’t leave this room. Like my eyeliner.', 'Ni créditos ni dinero real, nunca: regla de la casa, regla mía y, la verdad, regla del universo. Los Puntos de Gravedad no salen de esta sala. Como mi delineador.')] },
      { id: 'odds', kw: ['odds', 'win', 'chance', 'luck', 'lucky', 'jackpot', 'tips', 'trick', 'probabilidad', 'ganar', 'suerte', 'premio', 'truco'], say: c => [
        c.t('Between us? The maths on these cabinets is generous — the house is terrible at sums. But a lucky streak is just a streak. Have fun, and walk away smiling.', '¿Entre nosotros? Las cuentas de estas máquinas son generosas: la casa es malísima sumando. Pero una racha es solo una racha. Diviértete y vete sonriendo.'),
        c.t('Luck is a rhythm. Some spins land on the beat, some don’t. Dance either way.', 'La suerte es un ritmo. Algunas tiradas caen a tiempo y otras no. Baila igual.')] },
      { id: 'stop', kw: ['stop', 'addiction', 'too much', 'quit', 'break', 'parar', 'adiccion', 'demasiado', 'dejarlo', 'descanso'], say: c => [c.t('If it stops being fun, stop. Best advice I have, and it costs zero points. Go float in the club, catch a film at Cinema 9, come back tomorrow.', 'Si deja de ser divertido, para. Es mi mejor consejo y cuesta cero puntos. Ve a flotar al club, mira una peli en el Cine 9 y vuelve mañana.')] },
      { id: 'around', kw: ['cinema', 'film', 'movie', 'zib', 'orbo', 'plaza', 'spiral', 'cine', 'pelicula', 'torre', 'espiral'], say: c => [c.t('Cinema 9 is just past the club — music videos and Club Graviton films. The Gaudí Spiral Plaza has two aliens, Zib and Orbo. Orbo dances. Orbo always dances. I relate.', 'El Cine 9 está pasado el club: videoclips y películas del Club Graviton. La Plaza Espiral Gaudí tiene dos alienígenas, Zib y Orbo. Orbo baila. Orbo siempre baila. Me identifico.')] },
      { id: 'self', kw: ['who are you', 'about you', 'yourself', 'lyra', 'quien eres', 'sobre ti'], say: c => [c.t('Lyra! I used to sing on a cruise liner between two moons. Now I sparkle professionally.', '¡Lyra! Cantaba en un crucero entre dos lunas. Ahora brillo profesionalmente.')] }
    ],
    answers: {},
    chips: c => [[c.t('How to play?', '¿Cómo se juega?'), c.t('How do the slots work?', '¿Cómo funcionan las tragaperras?')], [c.t('Real money?', '¿Dinero real?'), c.t('Is it real money?', '¿Es dinero real?')], [c.t('Any tips?', '¿Algún truco?'), c.t('Any tricks to win?', '¿Algún truco para ganar?')], [c.t('Cinema?', '¿Cine?'), c.t('Where is the cinema?', '¿Dónde está el cine?')]],
    barks: c => [c.t('Spin for fun, darling!', '¡Juega por diversión, cielo!'), c.t('Fictional points, real sparkle!', '¡Puntos ficticios, brillo real!'), c.t('Ooh, that cabinet is feeling lucky. Or warm. Hard to tell.', 'Uy, esa máquina se siente con suerte. O calentita. Difícil saberlo.')],
    fallback: c => [c.t('Mm, fabulous question. Ask me about the slots, the points, or where to go next!', 'Mm, pregunta fabulosa. ¡Pregúntame por las tragaperras, los puntos o adónde ir!'), c.t('Darling, I only understood the sparkle in your voice.', 'Cielo, solo he entendido el brillo de tu voz.')]
  };

  /* ======================= AUNTIE PEARL — ital cook, Roots Village, Jungle Dub ======================= */
  const pearl = {
    name: 'Auntie Pearl', title: ['Roots Village ital cook', 'cocinera ital de la Aldea Roots'], col: '#ff8a3a',
    persona: 'Auntie Pearl, the warm, bossy, motherly ital cook of Roots Village on the Jungle Dub planet. Feeds everyone, talks about plant food, herbs, one love and community, teases you about being too skinny, keeps the bonfire going.',
    look: { fur: 0x6a3a1a, shirt: 0xe83a30, hat: 0xffd23a },
    greet(c) {
      if (c.q('coconut_pearl') === 'active' && c.has('coconut')) return [c.t('Is that a coconut me see? Bring it, bring it, the pot is waiting!', '¿Eso que veo es un coco? ¡Tráelo, tráelo, que la olla espera!')];
      if (c.met === 1) return [c.t('Come, come, sit by the fire! Me name Auntie Pearl. Nobody leaves Roots Village hungry — that is the law, and I am the law.', '¡Ven, ven, siéntate junto al fuego! Me llamo tía Pearl. Nadie sale de la Aldea Roots con hambre: es la ley, y la ley soy yo.')];
      if (c.part === 'night') return [c.t('Late, %n! The fire is low and the stories are high. Sit.', '¡Qué tarde, %n! El fuego está bajo y las historias, altas. Siéntate.')];
      return [c.t('Eh-eh, %n! You look thin. Come eat.', '¡Eh, eh, %n! Te veo flaco. Ven a comer.'), c.t('Bless up, %n. The pot is bubbling and the fire is singing.', 'Bendiciones, %n. La olla burbujea y el fuego canta.')];
    },
    topics: [
      { id: 'food', kw: ['food', 'eat', 'hungry', 'stew', 'ital', 'cook', 'kitchen', 'menu', 'pot', 'comida', 'comer', 'hambre', 'guiso', 'cocina', 'cocinar', 'olla'], say: c => [
        c.t('Ital food: from the earth, nothing from a factory, all love. Today is mango and coconut stew — the kitchen hut sells a bowl for twenty credits. Worth every one.', 'Comida ital: de la tierra, nada de fábrica, todo amor. Hoy hay guiso de mango y coco: la cabaña-cocina vende un bol por veinte créditos. Vale cada uno.'),
        c.t('The secret is time. You can’t rush a stew. You can’t rush a dub. You can’t rush Auntie Pearl.', 'El secreto es el tiempo. No se puede meter prisa a un guiso. Ni a un dub. Ni a la tía Pearl.')] },
      { id: 'village', kw: ['village', 'roots', 'fire', 'bonfire', 'drum', 'circle', 'community', 'irie', 'aldea', 'fuego', 'hoguera', 'tambor', 'circulo', 'comunidad'], say: c => [c.t('Roots Village is one family. Six huts, one fire, too many drummers. Elder Irie keeps the rhythm; I keep everybody fed.', 'La Aldea Roots es una familia. Seis chozas, un fuego, demasiados tamborileros. El anciano Irie lleva el ritmo; yo doy de comer a todos.')] },
      { id: 'herbs', kw: ['herb', 'herbs', 'tea', 'healing', 'garden', 'plant', 'plants', 'hierba', 'hierbas', 'infusion', 'curativo', 'jardin', 'planta', 'plantas'], say: c => [c.t('For herbs, go to the Healing Garden in the south-east. Herbalist Noi grows lemongrass, ginger, and things with names I won’t say in front of children.', 'Para hierbas, ve al Jardín Curativo, al sureste. La herbolaria Noi cultiva hierba limón, jengibre y cosas cuyo nombre no diré delante de los niños.')] },
      { id: 'bongo', kw: ['bongo', 'sound system', 'music', 'dub', 'bass', 'musica', 'bajo', 'sonido'], say: c => [c.t('Bongo? Me know him since he had one speaker and a lot of hope. Him play, I cook. Is a good arrangement.', '¿Bongo? Lo conozco desde que tenía un altavoz y mucha esperanza. Él toca, yo cocino. Buen arreglo.')] },
      { id: 'quest', kw: QUEST_KW.concat(['coconut', 'coco']), say(c) {
        if (c.q('coconut_pearl') === 'done') return [c.t('That stew was blessed by your coconut, %n. The whole village thanks you.', 'Ese guiso lo bendijo tu coco, %n. Toda la aldea te lo agradece.')];
        if (c.q('coconut_pearl') === 'active') return [c.has('coconut') ? c.t('You have it! Give here, give here.', '¡Lo tienes! Dame, dame.') : c.t('One fresh coconut, child. The Lotus Lagoon bar sells them, and sometimes one falls near the dance floor.', 'Un coco fresco, criatura. El bar de la Laguna del Loto los vende, y a veces cae alguno cerca de la pista.')];
        c.ask('coco'); return [c.t('You want to help Auntie? Me run out of coconut for the stew. Bring me one fresh coconut — the Lotus Lagoon bar has them — and Auntie pays fourteen credits and a big hug.', '¿Quieres ayudar a la tía? Me quedé sin coco para el guiso. Tráeme un coco fresco (el bar de la Laguna del Loto tiene) y la tía te paga catorce créditos y un abrazo enorme.')];
      } },
      { id: 'self', kw: ['who are you', 'about you', 'yourself', 'pearl', 'auntie', 'quien eres', 'sobre ti', 'tia'], say: c => [c.t('Me? I raise half this village from babies. The other half I raise from teenagers. That was harder.', '¿Yo? Crié a media aldea desde bebés. A la otra mitad, desde adolescentes. Eso fue más difícil.')] }
    ],
    answers: { coco: { yes: c => ({ say: c.t('Bless you, child! Lagoon bar, north-west. Run — but not too fast, you’ll get hungry.', '¡Bendito seas! Bar de la laguna, al noroeste. Corre, pero no mucho, que te entra hambre.'), action: { type: 'start_quest', id: 'coconut_pearl' } }), no: c => ({ say: c.t('No worry. But if you get hungry, you know where the pot is.', 'No te preocupes. Pero si te entra hambre, ya sabes dónde está la olla.') }) } },
    chips: c => [[c.t('Food?', '¿Comida?'), c.t('What are you cooking?', '¿Qué estás cocinando?')], [c.t('The village?', '¿La aldea?'), c.t('Tell me about Roots Village', 'Háblame de la Aldea Roots')],
      c.q('coconut_pearl') === 'done' ? [c.t('Bongo?', '¿Bongo?'), c.t('Do you know Bongo?', '¿Conoces a Bongo?')] : [c.t('Help you?', '¿Te ayudo?'), c.t('Can I help you with something?', '¿Te ayudo con algo?')], [c.t('Herbs?', '¿Hierbas?'), c.t('Where can I find herbs?', '¿Dónde encuentro hierbas?')]],
    barks: c => [c.t('Who hungry? Everybody hungry!', '¿Quién tiene hambre? ¡Todo el mundo!'), c.t('One love, one pot!', '¡Un amor, una olla!'), c.t('Don’t touch the fire — touch the stew. With a spoon!', 'No toques el fuego, toca el guiso. ¡Con cuchara!')],
    fallback: c => [c.t('Hmm? Talk to me about food, child, or the village. Auntie understands food.', '¿Mm? Háblame de comida, criatura, o de la aldea. La tía entiende de comida.'), c.t('Me no understand, but sit down and eat while you explain.', 'No te entiendo, pero siéntate y come mientras me lo explicas.')]
  };

  /* ======================= RIVERMAN TOSH — lagoon boatman, Jungle Dub ======================= */
  const tosh = {
    name: 'Riverman Tosh', title: ['lagoon boatman', 'barquero de la laguna'], col: '#3ae0c0',
    persona: 'Riverman Tosh, a slow-talking, sun-browned boatman who rows people around the Lotus Lagoon on the Jungle Dub planet. Knows every bend of the river ring, every frog by name, and the way to Hidden Falls. Calm, wry, speaks in river metaphors.',
    look: { shirt: 0x30c060, human: { sp: 'human_a', height: 1.78, skin: 0xa86a3c, hair: 0x2a1a10, style: 'long', beard: true, shirt: { fab: 'reggae', loose: 1.12 }, pants: { col: 0x5a6a3a, shorts: true }, foot: 'flip', shoe: 0x6a4a2a } },
    greet(c) {
      if (c.q('hidden_falls') === 'active' && prog('hidden_falls') >= 1) return [c.t('You found it, didn’t you? Hidden Falls. You’ve got that waterfall calm all over your face.', 'La encontraste, ¿verdad? La cascada escondida. Llevas esa calma de cascada por toda la cara.')];
      if (c.met === 1) return [c.t('Easy, traveller. Tosh. I row the lagoon, I watch the water, I don’t rush. The river never did, and look how far it got.', 'Tranquilo, viajero. Tosh. Remo en la laguna, miro el agua, no tengo prisa. El río tampoco, y mira qué lejos ha llegado.')];
      if (c.part === 'night') return [c.t('Night on the lagoon, %n. The lotus close up and the frogs start the second set.', 'Noche en la laguna, %n. Los lotos se cierran y las ranas empiezan el segundo pase.')];
      return [c.t('%n. Water’s flat, sky’s pink, life’s fine.', '%n. El agua en calma, el cielo rosa, la vida bien.'), c.t('Back again, %n? The lagoon remembers footprints. Wet ones.', '¿Otra vez por aquí, %n? La laguna recuerda las huellas. Las mojadas.')];
    },
    topics: [
      { id: 'lagoon', kw: ['lagoon', 'lotus', 'bungalow', 'bungalows', 'water', 'lake', 'boat', 'swim', 'coconut', 'laguna', 'loto', 'agua', 'lago', 'barca', 'nadar', 'coco'], say: c => [
        c.t('Lotus Lagoon: four bungalows on stilts, a pier to each. The bar on the north shore does coconuts. Swim if you like — the lily pads don’t mind, the frogs complain a bit.', 'Laguna del Loto: cuatro bungalós sobre pilotes, un muelle para cada uno. El bar de la orilla norte tiene cocos. Nada si quieres: a los nenúfares no les importa; las ranas se quejan un poco.'),
        c.t('I’ve rowed this lagoon ten thousand times. It’s still a different lagoon every morning.', 'He remado en esta laguna diez mil veces. Cada mañana sigue siendo una laguna distinta.')] },
      { id: 'river', kw: ['river', 'ring', 'bridge', 'bridges', 'fish', 'fishing', 'rio', 'anillo', 'puente', 'puentes', 'pez', 'pescar'], say: c => [c.t('The river runs in a ring round the dance floor — no start, no end. Three bridges cross it. Very dub, if you think about it. Bongo says it keeps time.', 'El río da la vuelta a la pista en un anillo: sin principio ni final. Lo cruzan tres puentes. Muy dub, si lo piensas. Bongo dice que marca el tiempo.')] },
      { id: 'falls', kw: ['falls', 'waterfall', 'secret', 'hidden', 'chill', 'relax', 'cascada', 'secreto', 'escondida', 'relajar'], say: c => [c.t('A secret… I’ll say it once. South-west, past the trail into the rocks: Hidden Falls. Cushions, mushrooms that glow, spirits that hum. Don’t tell the tourists. You’re not a tourist. Probably.', 'Un secreto… lo diré una vez. Al suroeste, siguiendo el sendero entre las rocas: la cascada escondida. Cojines, setas que brillan, espíritus que zumban. No se lo digas a los turistas. Tú no eres turista. Creo.')] },
      { id: 'frogs', kw: ['frog', 'frogs', 'croak', 'ribbit', 'rana', 'ranas', 'croac'], say: c => [c.t('Lady Croak runs the pier. Unofficially. Officially she’s a frog. Ribbit Rick sings by the big pool — off-key, but with feeling.', 'Lady Croak manda en el muelle. Extraoficialmente. Oficialmente es una rana. Ribbit Rick canta junto a la poza grande: desafinado, pero con sentimiento.')] },
      { id: 'quest', kw: QUEST_KW, say(c) {
        if (c.q('hidden_falls') === 'done') return [c.t('You’ve sat at the Falls. Now you know why I’m slow.', 'Ya te sentaste en la cascada. Ahora sabes por qué soy lento.')];
        if (c.q('hidden_falls') === 'active') return [c.t('Hidden Falls: south-west, behind the rocks. Sit on the cushions, let it hum, then come back and tell me.', 'La cascada escondida: al suroeste, tras las rocas. Siéntate en los cojines, deja que zumbe y vuelve a contármelo.')];
        c.ask('falls'); return [c.t('Want to find something special? Walk to Hidden Falls — south-west, behind the rocks — and rest on the cushions a while. Then come back and tell me if it still hums. Twelve credits for the report.', '¿Quieres encontrar algo especial? Ve a la cascada escondida (al suroeste, tras las rocas) y descansa un rato en los cojines. Luego vuelve y dime si aún zumba. Doce créditos por el informe.')];
      } },
      { id: 'self', kw: ['who are you', 'about you', 'yourself', 'tosh', 'boatman', 'quien eres', 'sobre ti', 'barquero'], say: c => [c.t('Tosh. Was a sailor on a salt sea once. Too much hurry. Fresh water suits me.', 'Tosh. Fui marinero en un mar salado. Demasiada prisa. El agua dulce me sienta mejor.')] }
    ],
    answers: { falls: { yes: c => ({ say: c.t('Good. Take the trail south-west and keep going when it looks like it ends. It doesn’t.', 'Bien. Coge el sendero del suroeste y sigue cuando parezca que se acaba. No se acaba.'), action: { type: 'start_quest', id: 'hidden_falls' } }), no: c => ({ say: c.t('No rush. The waterfall’s been there a long time. It’ll wait.', 'Sin prisa. La cascada lleva ahí mucho tiempo. Esperará.') }) } },
    chips: c => [[c.t('The lagoon?', '¿La laguna?'), c.t('Tell me about the lagoon', 'Háblame de la laguna')], [c.t('The river?', '¿El río?'), c.t('Where does the river go?', '¿Adónde va el río?')],
      c.q('hidden_falls') ? [c.t('Frogs?', '¿Ranas?'), c.t('Who are the frogs around here?', '¿Quiénes son las ranas de por aquí?')] : [c.t('Any task?', '¿Alguna tarea?'), c.t('Do you need a favour?', '¿Necesitas un favor?')], [c.t('A secret?', '¿Un secreto?'), c.t('Do you know any secret places?', '¿Conoces algún sitio secreto?')]],
    barks: c => [c.t('Easy on the pier, it creaks in B-flat.', 'Con calma en el muelle, cruje en si bemol.'), c.t('Water’s good today.', 'El agua está buena hoy.'), c.t('Slow is a speed too.', 'Despacio también es una velocidad.')],
    fallback: c => [c.t('Hm. The water doesn’t answer that either. Ask me about the lagoon, the river or the frogs.', 'Mm. El agua tampoco contesta a eso. Pregúntame por la laguna, el río o las ranas.'), c.t('Like a current — I’ll let that one drift by.', 'Como una corriente: dejaré que esa pase de largo.')]
  };

/* ======================= DALIA — Old City guide, Jaffa Gate ======================= */
  const dalia = {
    name: 'Dalia', title: ['Old City guide', 'guía de la Ciudad Vieja'], col: '#7aff9a',
    persona: 'Dalia, a warm, fast-talking licensed tour guide who has walked the Old City of Jerusalem for twenty years. Loves history, stone, and good coffee; respectful of every faith; jokes about tourists with sunburn.',
    greet(c) {
      if (c.met === 1) return [c.t('Welcome to Jerusalem! I’m Dalia, a guide. Three thousand years of history and you arrive at lunchtime — perfect. Want a tour?', '¡Bienvenido a Jerusalén! Soy Dalia, guía. Tres mil años de historia y llegas a la hora de comer: perfecto. ¿Quieres un tour?')];
      if (q(c, 'jlm_tour') === 'active') return [c.t('How is the tour going? ' + (AV.jlm ? AV.jlm.tourList() : ''), '¿Qué tal el tour? ' + (AV.jlm ? AV.jlm.tourList() : ''))];
      if (c.part === 'evening') return [c.t('Look at the walls, %n — this is the hour the stone turns gold. Jerusalem of gold, they call it.', 'Mira las murallas, %n: a esta hora la piedra se vuelve dorada. Jerusalén de oro, la llaman.')];
      return [c.t('Shalom, salaam, hello, %n! Still alive in this heat? Drink water.', '¡Shalom, salam, hola, %n! ¿Sigues vivo con este calor? Bebe agua.'), c.t('Back at Jaffa Gate, %n. Every good walk starts here.', 'De vuelta en la Puerta de Jaffa, %n. Todo buen paseo empieza aquí.')];
    },
    topics: withC([
      { id: 'quest', kw: ['tour', 'mission', 'quest', 'task', 'job', 'help', 'show me', 'mision', 'tarea', 'ayuda', 'ensename', 'recorrido'], say(c) {
        if (!q(c, 'jlm_tour')) { c.ask('tour'); return [c.t('My famous self-guided tour: stand at the Western Wall plaza, visit the Church of the Holy Sepulchre, look at the Dome of the Rock from its platform, climb to the Tower of David, and taste Mahane Yehuda market. Come back and tell me. 40 credits for a good student. Yes?', 'Mi famoso tour por libre: ponte en la plaza del Muro Occidental, visita la Iglesia del Santo Sepulcro, mira la Cúpula de la Roca desde su explanada, sube a la Torre de David y prueba el mercado de Mahane Yehuda. Vuelve y me lo cuentas. 40 créditos para un buen alumno. ¿Sí?')] }
        if (q(c, 'jlm_tour') === 'active') return [c.t('Still touring! ' + (AV.jlm ? AV.jlm.tourList() : ''), '¡Sigues de tour! ' + (AV.jlm ? AV.jlm.tourList() : ''))];
        return [c.t('You already did my tour. Now you know more than half the people with selfie sticks. Try Yossi in Mamilla, he always needs help.', 'Ya hiciste mi tour. Ahora sabes más que la mitad de los del palo de selfie. Prueba con Yossi en Mamilla, siempre necesita ayuda.')];
      } },
      { id: 'history', kw: ['history', 'old', 'david', 'tower', 'citadel', 'king', 'roman', 'crusader', 'ottoman', 'historia', 'torre', 'ciudadela', 'rey', 'romano', 'cruzado', 'otomano'], say: c => [c.t('King David, Solomon, Babylonians, Persians, Romans, Byzantines, Arabs, Crusaders, Mamluks, Ottomans, the British… everyone left a layer. Dig anywhere and you find somebody’s kitchen.', 'Rey David, Salomón, babilonios, persas, romanos, bizantinos, árabes, cruzados, mamelucos, otomanos, británicos… todos dejaron una capa. Cavas en cualquier sitio y encuentras la cocina de alguien.'), c.t('The Tower of David citadel by Jaffa Gate is a museum now. The tall minaret is Ottoman, the stones underneath are Herod’s. Typical Jerusalem.', 'La ciudadela de la Torre de David, junto a la Puerta de Jaffa, es ahora un museo. El minarete alto es otomano; las piedras de abajo, de Herodes. Muy de Jerusalén.')] },
      { id: 'stone', kw: ['stone', 'gold', 'buildings', 'white', 'piedra', 'oro', 'edificios', 'blanco'], say: c => [c.t('By law every building here is faced with Jerusalem stone — that pale limestone. At sunset the whole city glows.', 'Por ley, todos los edificios aquí se revisten con piedra de Jerusalén, esa caliza clara. Al atardecer toda la ciudad brilla.')] },
      { id: 'self', kw: ['who are you', 'about you', 'yourself', 'guide', 'quien eres', 'guia'], say: c => [c.t('Dalia. Licensed guide, mother of three, drinker of too much coffee. I know which alley has the best shade at noon.', 'Dalia. Guía con licencia, madre de tres y bebedora de demasiado café. Sé qué callejón tiene la mejor sombra a mediodía.')] }
    ]),
    answers: { tour: { yes: c => ({ say: c.t('Wonderful! Follow the signs, use your feet, and watch out for the cats. Go!', '¡Estupendo! Sigue los carteles, usa los pies y cuidado con los gatos. ¡Vamos!'), action: { type: 'start_quest', id: 'jlm_tour' } }), no: c => ({ say: c.t('Fine, wander. Jerusalem rewards the lost too.', 'Vale, deambula. Jerusalén también premia a los perdidos.') }) } },
    chips: c => [[c.t('Give me a tour', 'Dame un tour'), c.t('Do you have a tour for me?', '¿Tienes un tour para mí?')], [c.t('The Old City?', '¿La Ciudad Vieja?'), c.t('Tell me about the Old City gates', 'Háblame de las puertas de la Ciudad Vieja')], [c.t('Holy places?', '¿Lugares sagrados?'), c.t('What are the holy places?', '¿Cuáles son los lugares sagrados?')], [c.t('History?', '¿Historia?'), c.t('Tell me some history', 'Cuéntame algo de historia')], [c.t('Getting around?', '¿Moverse?'), c.t('How do I take the tram or the bus?', '¿Cómo cojo el tranvía o el autobús?')]],
    barks: c => [c.t('Tours! English, Español, Ape!', '¡Tours! ¡English, Español, Mono!'), c.t('Water, hat, comfortable shoes!', '¡Agua, sombrero, zapatos cómodos!'), c.t('Mind the steps, they are older than your country.', 'Cuidado con los escalones, son más viejos que tu país.')],
    fallback: c => [c.t('Hmm. Ask me about the tour, the gates, the holy places or history.', 'Mmm. Pregúntame por el tour, las puertas, los lugares sagrados o la historia.'), c.t('In Jerusalem every question has three answers and a fourth from a taxi driver. Try another?', 'En Jerusalén cada pregunta tiene tres respuestas y una cuarta del taxista. ¿Otra?')]
  };

  /* ======================= YOSSI — startup founder, Mamilla ======================= */
  const yossi = {
    name: 'Yossi', title: ['startup founder', 'fundador de startup'], col: '#7ad8ff',
    persona: 'Yossi, a hyper-energetic startup founder in a slim suit who talks in pitches, lives on espresso, and is always five minutes late for an investor meeting at the King David Hotel. Kind underneath the hustle.',
    greet(c) {
      if (q(c, 'jlm_briefcase') === 'active') return [c.t(c.has('briefcase') ? 'Is that — MY BRIEFCASE?! You legend!' : 'Any sign of my briefcase? Mahane Yehuda, Miriam’s bakery, I’m almost sure!', c.has('briefcase') ? '¿Eso es… ¡¿MI MALETÍN?! ¡Eres una leyenda!' : '¿Alguna pista de mi maletín? ¡Mahane Yehuda, la panadería de Miriam, casi seguro!')];
      if (c.met === 1) return [c.t('Hi, hey, hello — Yossi, CEO, founder, chief coffee officer. Thirty seconds? I have an elevator pitch and no elevator.', 'Hola, ey, qué tal: Yossi, CEO, fundador, director de café. ¿Treinta segundos? Tengo un discurso de ascensor y ningún ascensor.')];
      return [c.t('%n! Great to see you. Huge news. Massive. I’ll tell you after this call.', '¡%n! Qué alegría verte. Noticia enorme. Gigante. Te lo cuento después de esta llamada.'), c.t('Do you know any investors who like apes? Asking for a pitch deck.', '¿Conoces inversores a los que les gusten los monos? Pregunto por una presentación.')];
    },
    topics: withC([
      { id: 'quest', kw: ['mission', 'quest', 'task', 'job', 'help', 'favor', 'favour', 'briefcase', 'lost', 'mision', 'tarea', 'trabajo', 'ayuda', 'favor', 'maletin', 'perdido'], say(c) {
        if (!q(c, 'jlm_briefcase')) { c.ask('brief'); return [c.t('Disaster. My briefcase — the pitch, the prototype, my lucky pen — I left it at Mahane Yehuda market. Miriam’s bakery, I think, I was buying rugelach. Investors in one hour. Can you get it? 60 credits!', 'Desastre. Mi maletín —la presentación, el prototipo, mi bolígrafo de la suerte— me lo dejé en el mercado de Mahane Yehuda. En la panadería de Miriam, creo, compraba rugelach. Inversores en una hora. ¿Me lo traes? ¡60 créditos!')] }
        if (q(c, 'jlm_briefcase') === 'active') return [c.t('Mahane Yehuda is west along Jaffa Road — take the light rail, three stops. Miriam’s bakery is the one with the queue.', 'Mahane Yehuda está al oeste por la calle Jaffa: coge el tranvía, tres paradas. La panadería de Miriam es la que tiene cola.')];
        return [c.t('The pitch went GREAT. Seed round closed. I named a feature after you. It crashes, but lovingly.', 'El pitch fue GENIAL. Ronda semilla cerrada. Le puse tu nombre a una función. Se cuelga, pero con cariño.')];
      } },
      { id: 'business', kw: ['business', 'startup', 'company', 'invest', 'money', 'tech', 'office', 'work', 'negocio', 'empresa', 'invertir', 'dinero', 'tecnologia', 'oficina'], say: c => [c.t('The app? Real-time shade mapping for tourists. You walk, it finds you shade. Summer here is my market research.', '¿La app? Mapas de sombra en tiempo real para turistas. Caminas y te busca sombra. El verano de aquí es mi estudio de mercado.'), c.t('Half the startups in this city were born in a café on Jaffa Road. The other half in the queue for the café.', 'La mitad de las startups de esta ciudad nacieron en un café de la calle Jaffa. La otra mitad, en la cola del café.')] },
      { id: 'coffee', kw: ['coffee', 'espresso', 'cafe', 'drink', 'cafe', 'bebida'], say: c => [c.t('Coffee here is a religion of its own. Mine is a double espresso and a deadline.', 'El café aquí es una religión aparte. El mío es un doble espresso y una fecha límite.')] },
      { id: 'mamilla', kw: ['mamilla', 'mall', 'shops', 'king david', 'hotel', 'centro comercial', 'tiendas'], say: c => [c.t('Mamilla is the open-air avenue from the Jaffa Gate to the new city. Shops, cafés, and the King David Hotel up the hill where I pretend I have meetings.', 'Mamilla es la avenida al aire libre de la Puerta de Jaffa a la ciudad nueva. Tiendas, cafés y el hotel Rey David en la colina, donde finjo tener reuniones.')] }
    ], ['food', 'travel']),
    answers: { brief: { yes: c => ({ say: c.t('You are a lifesaver. I will put you on the cap table. Metaphorically. Go, go!', 'Me salvas la vida. Te pondré en el accionariado. Metafóricamente. ¡Ve, ve!'), action: { type: 'start_quest', id: 'jlm_briefcase' } }), no: c => ({ say: c.t('Okay. Okay. I’ll pitch with my hands. Investors love hands.', 'Vale. Vale. Haré el pitch con las manos. A los inversores les encantan las manos.') }) } },
    chips: c => [[c.t('Need help?', '¿Necesitas ayuda?'), c.t('Do you need help with something?', '¿Necesitas ayuda con algo?')], [c.t('Your startup?', '¿Tu startup?'), c.t('Tell me about your business', 'Háblame de tu negocio')], [c.t('Mamilla?', '¿Mamilla?'), c.t('What is Mamilla?', '¿Qué es Mamilla?')], [c.t('Where to eat?', '¿Dónde comer?'), c.t('Where should I eat?', '¿Dónde debería comer?')]],
    barks: c => [c.t('Yes, yes, I’ll send the deck tonight!', '¡Sí, sí, te mando la presentación esta noche!'), c.t('Synergy! Disruption! Lunch!', '¡Sinergia! ¡Disrupción! ¡Almuerzo!'), c.t('Sorry, I have to take this.', 'Perdona, tengo que cogerlo.')],
    fallback: c => [c.t('Love that. Circle back? Ask me about my startup, Mamilla, or… my briefcase.', 'Me encanta. ¿Lo retomamos? Pregúntame por mi startup, Mamilla o… mi maletín.')]
  };

  /* ======================= KARIM — spice merchant, the Old City souk ======================= */
  const karim = {
    name: 'Karim', title: ['spice merchant', 'vendedor de especias'], col: '#ffb04a',
    persona: 'Karim, a third-generation spice and coffee merchant in the covered market of the Old City. Generous, proud of his family shop, offers everyone coffee, teases bargain hunters gently.',
    greet(c) {
      if (q(c, 'jlm_kaak') === 'active') return [c.t(c.has('kaak') ? 'Ah! Ka’ak! Still warm? Come, sit.' : 'The ka’ak carts are by the Damascus Gate, my friend. Follow the smell of sesame.', c.has('kaak') ? '¡Ah! ¡Ka’ak! ¿Aún caliente? Ven, siéntate.' : 'Los carritos de ka’ak están en la Puerta de Damasco, amigo. Sigue el olor a sésamo.')];
      if (c.met === 1) return [c.t('Ahlan wa sahlan! Welcome! I am Karim — this shop was my grandfather’s. Smell this za’atar. No, really, smell it.', '¡Ahlan wa sahlan! ¡Bienvenido! Soy Karim; esta tienda era de mi abuelo. Huele este za’atar. No, en serio, huélelo.')];
      return [c.t('My friend %n! Coffee? You always say yes in the end.', '¡Amigo %n! ¿Café? Al final siempre dices que sí.'), c.t('Welcome back. Cardamom today is excellent. Every day is excellent.', 'Bienvenido de nuevo. El cardamomo hoy está excelente. Todos los días está excelente.')];
    },
    topics: withC([
      { id: 'quest', kw: ['mission', 'quest', 'task', 'job', 'help', 'favor', 'favour', 'bread', 'kaak', 'mision', 'tarea', 'ayuda', 'pan'], say(c) {
        if (!q(c, 'jlm_kaak')) { c.ask('kaak'); return [c.t('I cannot leave the shop — the tourists will rearrange my saffron. Bring me a sesame ka’ak from the carts at Damascus Gate? I pay you back and a little more. Yes?', 'No puedo dejar la tienda: los turistas me reordenan el azafrán. ¿Me traes un ka’ak de sésamo de los carritos de la Puerta de Damasco? Te lo pago y un poco más. ¿Sí?')] }
        if (q(c, 'jlm_kaak') === 'active') return [c.t('Damascus Gate is north, up Al-Wad Street. The carts are just outside.', 'La Puerta de Damasco está al norte, subiendo por la calle Al-Wad. Los carritos están justo fuera.')];
        return [c.t('You did me a kindness. In this shop you always have coffee.', 'Me hiciste un favor. En esta tienda siempre tienes café.')];
      } },
      { id: 'spices', kw: ['spice', 'zaatar', 'za atar', 'saffron', 'cumin', 'sumac', 'buy', 'shop', 'especia', 'azafran', 'comino', 'comprar', 'tienda'], say: c => [c.t('Za’atar — thyme, sumac, sesame. Sumac for salads. Cardamom for coffee. Saffron for when you are in love.', 'Za’atar: tomillo, zumaque y sésamo. Zumaque para ensaladas. Cardamomo para el café. Azafrán para cuando estás enamorado.')] },
      { id: 'coffee', kw: ['coffee', 'cardamom', 'tea', 'mint', 'cafe', 'cardamomo', 'te', 'menta'], say: c => [c.t('Our coffee: ground fine, a pinch of cardamom, boiled three times, served small. Never refuse the second cup, it is rude. The third — you may refuse.', 'Nuestro café: molido fino, una pizca de cardamomo, hervido tres veces y servido en taza pequeña. Nunca rechaces la segunda taza, es de mala educación. La tercera sí puedes.')] },
      { id: 'souk', kw: ['souk', 'market', 'bazaar', 'bargain', 'price', 'zoco', 'mercado', 'regatear', 'precio'], say: c => [c.t('The souk is a maze on purpose — so you discover things. Bargain with a smile, never with a frown.', 'El zoco es un laberinto a propósito: para que descubras cosas. Regatea con una sonrisa, nunca con el ceño fruncido.')] }
    ]),
    answers: { kaak: { yes: c => ({ say: c.t('Shukran! The sesame one, long like this. Go, before it gets cold.', '¡Shukran! El de sésamo, largo así. Ve, antes de que se enfríe.'), action: { type: 'start_quest', id: 'jlm_kaak' } }), no: c => ({ say: c.t('No problem. Have coffee instead. That was not a question.', 'No pasa nada. Toma café. Eso no era una pregunta.') }) } },
    chips: c => [[c.t('Need help?', '¿Necesitas ayuda?'), c.t('Can I help you with something?', '¿Puedo ayudarte en algo?')], [c.t('Spices?', '¿Especias?'), c.t('Tell me about your spices', 'Háblame de tus especias')], [c.t('Coffee?', '¿Café?'), c.t('How do you make the coffee?', '¿Cómo hacéis el café?')], [c.t('The souk?', '¿El zoco?'), c.t('How does the souk work?', '¿Cómo funciona el zoco?')]],
    barks: c => [c.t('Za’atar! Fresh za’atar!', '¡Za’atar! ¡Za’atar fresco!'), c.t('Come, just look, looking is free!', '¡Ven, solo mira, mirar es gratis!'), c.t('Coffee for my friend!', '¡Café para mi amigo!')],
    fallback: c => [c.t('Inshallah, we will understand each other. Ask me about spices, coffee or the souk.', 'Inshallah, nos entenderemos. Pregúntame por especias, café o el zoco.')]
  };

  /* ======================= MIRIAM — baker, Mahane Yehuda ======================= */
  const miriam = {
    name: 'Miriam', title: ['Mahane Yehuda baker', 'panadera de Mahane Yehuda'], col: '#ff9ad8',
    persona: 'Miriam, a no-nonsense, big-hearted baker at Mahane Yehuda market famous for chocolate rugelach. Calls everyone "motek" (sweetie), feeds people whether they asked or not.',
    greet(c) {
      if (q(c, 'jlm_briefcase') === 'active' && !c.has('briefcase')) return [c.t('A briefcase? Brown, sticker, smells of panic? Yes, motek, it’s behind my counter. Take it — tell Yossi to eat breakfast.', '¿Un maletín? ¿Marrón, con pegatina, que huele a pánico? Sí, motek, está detrás del mostrador. Llévatelo y dile a Yossi que desayune.')];
      if (c.met === 1) return [c.t('Motek! First time at the shuk? Here, try — no, don’t argue, try. Rugelach, chocolate, still warm.', '¡Motek! ¿Primera vez en el mercado? Toma, prueba; no, no discutas, prueba. Rugelach de chocolate, aún caliente.')];
      return [c.t('Back for more, %n? I knew it. Everybody comes back.', '¿Vuelves a por más, %n? Lo sabía. Todo el mundo vuelve.'), c.t('Friday morning is chaos here. Friday morning is the best.', 'El viernes por la mañana esto es un caos. El viernes por la mañana es lo mejor.')];
    },
    topics: withC([
      { id: 'bake', kw: ['rugelach', 'bread', 'bake', 'cake', 'challah', 'halva', 'sweet', 'pan', 'hornear', 'pastel', 'dulce'], say: c => [c.t('The secret of my rugelach? More chocolate than dough. My grandmother would be shocked. Then she would ask for two.', '¿El secreto de mi rugelach? Más chocolate que masa. Mi abuela se escandalizaría. Luego pediría dos.')] },
      { id: 'market', kw: ['market', 'shuk', 'mahane', 'yehuda', 'stalls', 'night', 'mercado', 'puestos', 'noche'], say: c => [c.t('By day the shuk sells fruit, spices, fish, halva. At night the shutters come down and the bars open — music, painted shutters, everybody dancing.', 'De día el mercado vende fruta, especias, pescado y halva. De noche bajan las persianas y abren los bares: música, persianas pintadas, todo el mundo bailando.')] },
      { id: 'briefcase', kw: ['briefcase', 'yossi', 'lost', 'maletin', 'perdido'], say: c => [c.t(q(c, 'jlm_briefcase') === 'active' ? 'It’s behind my counter, motek — press the counter and I’ll hand it over.' : 'Yossi? Nice boy. Forgets everything except coffee.', q(c, 'jlm_briefcase') === 'active' ? 'Está detrás del mostrador, motek: toca el mostrador y te lo doy.' : '¿Yossi? Buen chico. Se le olvida todo menos el café.')] }
    ], ['food', 'travel']),
    chips: c => [[c.t('Rugelach?', '¿Rugelach?'), c.t('What is your secret?', '¿Cuál es tu secreto?')], [c.t('The market?', '¿El mercado?'), c.t('Tell me about the market', 'Háblame del mercado')], [c.t('A briefcase?', '¿Un maletín?'), c.t('Did someone leave a briefcase here?', '¿Alguien dejó aquí un maletín?')]],
    barks: c => [c.t('Rugelach! Hot rugelach!', '¡Rugelach! ¡Rugelach caliente!'), c.t('Motek, you look hungry.', 'Motek, tienes cara de hambre.'), c.t('Ten shekels, three pieces, final offer, take four.', 'Diez shékels, tres piezas, oferta final, llévate cuatro.')],
    fallback: c => [c.t('I don’t know, motek, but eat something while you think.', 'No lo sé, motek, pero come algo mientras piensas.')]
  };

  /* ======================= ELIAS — Armenian ceramicist ======================= */
  const elias = {
    name: 'Elias', title: ['Armenian ceramic painter', 'pintor de cerámica armenia'], col: '#7aa8ff',
    persona: 'Elias, a quiet, patient Armenian ceramic artist in the Armenian Quarter, painting cobalt and turquoise tiles the way his family has for a century. Gentle humour, loves to explain the craft.',
    greet(c) { if (c.met === 1) return [c.t('Barev. Welcome to my workshop. Mind the wet glaze. Everything here is painted by hand — even the mistakes.', 'Barev. Bienvenido a mi taller. Cuidado con el esmalte húmedo. Aquí todo se pinta a mano, incluso los errores.')]; return [c.t('Hello again, %n. I finished a pomegranate tile today. It took nine hours and one sandwich.', 'Hola de nuevo, %n. Hoy acabé un azulejo de granada. Me llevó nueve horas y un bocadillo.')] },
    topics: withC([
      { id: 'craft', kw: ['tile', 'ceramic', 'paint', 'pottery', 'art', 'blue', 'azulejo', 'ceramica', 'pintar', 'arte', 'azul'], say: c => [c.t('Armenian ceramics came to Jerusalem in 1919 to restore the tiles on the Dome of the Rock. The families stayed. My great-grandfather was one of them.', 'La cerámica armenia llegó a Jerusalén en 1919 para restaurar los azulejos de la Cúpula de la Roca. Las familias se quedaron. Mi bisabuelo fue una de ellas.'), c.t('Cobalt, turquoise, a little red. Birds, vines, pomegranates. The brush must be braver than the hand.', 'Cobalto, turquesa, un poco de rojo. Pájaros, parras, granadas. El pincel tiene que ser más valiente que la mano.')] },
      { id: 'quarter', kw: ['armenian', 'quarter', 'church', 'st james', 'armenio', 'barrio'], say: c => [c.t('The Armenian Quarter is the quietest corner of the Old City — monastery walls, St James Cathedral, gardens behind gates. We have been here since the 4th century.', 'El Barrio Armenio es el rincón más tranquilo de la Ciudad Vieja: muros de monasterio, la catedral de Santiago y jardines tras las puertas. Estamos aquí desde el siglo IV.')] }
    ], ['oldcity', 'holy']),
    chips: c => [[c.t('Your tiles?', '¿Tus azulejos?'), c.t('Tell me about your ceramics', 'Háblame de tu cerámica')], [c.t('Armenian Quarter?', '¿Barrio Armenio?'), c.t('Tell me about the Armenian Quarter', 'Háblame del Barrio Armenio')]],
    barks: c => [c.t('Hand-painted, one of a kind.', 'Pintado a mano, pieza única.'), c.t('The glaze is still wet, please don’t touch.', 'El esmalte aún está húmedo, por favor no lo toques.')],
    fallback: c => [c.t('Hmm. Ask me about the tiles — I talk better with a brush in my hand.', 'Mmm. Pregúntame por los azulejos: hablo mejor con un pincel en la mano.')]
  };

  /* ======================= SGT. NOA — desert patrol ======================= */
  const dcommon = {
    desert: { id: 'desert', kw: ['desert', 'judean', 'heat', 'sun', 'hot', 'desierto', 'judea', 'calor', 'sol'], say: c => [c.t('The Judean Desert drops from Jerusalem’s hills down to the Dead Sea — over a kilometre in height in thirty kilometres. Rain falls on one side of the ridge and never reaches the other.', 'El desierto de Judea baja de las colinas de Jerusalén hasta el Mar Muerto: más de un kilómetro de desnivel en treinta kilómetros. La lluvia cae a un lado de la cresta y nunca llega al otro.')] },
    deadsea: { id: 'deadsea', kw: ['dead sea', 'salt', 'float', 'swim', 'mud', 'mar muerto', 'sal', 'flotar', 'nadar', 'barro'], say: c => [c.t('The Dead Sea is the lowest place on land, about 430 metres below sea level. So salty you float like a cork. Don’t get it in your eyes — and never dive.', 'El Mar Muerto es el punto más bajo de la tierra firme, unos 430 metros bajo el nivel del mar. Tan salado que flotas como un corcho. Que no te entre en los ojos, y nunca te tires de cabeza.')] },
    places: { id: 'places', kw: ['masada', 'ein gedi', 'qumran', 'oasis', 'waterfall', 'caves', 'cascada', 'cuevas'], say: c => [c.t('Masada is the mesa in the south — Roman ramp on the west side, cable car on the east. Ein Gedi is the oasis with the waterfall and the ibex. The Qumran caves are in the cliffs to the north-west.', 'Masada es la meseta del sur: rampa romana en el lado oeste y teleférico en el este. Ein Gedi es el oasis con la cascada y los íbices. Las cuevas de Qumrán están en los acantilados del noroeste.')] },
    back: { id: 'back', kw: ['jerusalem', 'bus', 'portal', 'pipe', 'ape town', 'home', 'jerusalen', 'autobus', 'pipa', 'casa'], say: c => [c.t('The bus stop on Route 90 goes back up to Jerusalem. The purple portal by the beach kiosk goes to Ape Town.', 'La parada de la carretera 90 vuelve a Jerusalén. El portal morado junto al quiosco de la playa va a Ape Town.')] }
  };
  const withD = (t, keys) => t.concat((keys || Object.keys(dcommon)).map(k => dcommon[k]).filter(ct => !t.some(x => x.id === ct.id)));
  const noa = {
    name: 'Sgt. Noa', title: ['desert patrol sergeant', 'sargento de la patrulla del desierto'], col: '#e8d08a',
    persona: 'Sergeant Noa, the calm, dry-humoured commander of a small desert patrol outpost in the Judean Desert. Her job is mostly search and rescue for hikers who underestimate the heat. Practical, protective, obsessed with hydration.',
    greet(c) {
      const d = jd();
      if (q(c, 'jd_water') === 'active') return [c.t('Water count: ' + Math.min(3, (S().items || {}).water || 0) + ' / 3 bottles in your bag. The kiosks at Ein Gedi and the beach sell them.', 'Recuento de agua: ' + Math.min(3, (S().items || {}).water || 0) + ' / 3 botellas en tu mochila. Los quioscos de Ein Gedi y de la playa las venden.')];
      if (q(c, 'jd_hiker') === 'active') return [c.t(d.hikerFound ? 'You found Tomer? Is he walking? Good. Report received.' : 'Last signal from the hiker was near the Qumran caves, north-west cliffs. Go carefully.', d.hikerFound ? '¿Encontraste a Tomer? ¿Camina? Bien. Informe recibido.' : 'La última señal del excursionista fue cerca de las cuevas de Qumrán, en los acantilados del noroeste. Ve con cuidado.')];
      if (c.met === 1) return [c.t('Sergeant Noa, desert patrol. Welcome to the outpost. Rule one: drink before you’re thirsty. Rule two: see rule one.', 'Sargento Noa, patrulla del desierto. Bienvenido al puesto. Regla uno: bebe antes de tener sed. Regla dos: ver regla uno.')];
      return [c.t('%n. Hat on? Water? Good.', '%n. ¿Gorra puesta? ¿Agua? Bien.'), c.t('Quiet day. Quiet is good out here.', 'Día tranquilo. Aquí fuera, tranquilo es bueno.')];
    },
    topics: withD([
      { id: 'quest', kw: ['mission', 'quest', 'task', 'job', 'help', 'water', 'hiker', 'lost', 'rescue', 'mision', 'tarea', 'ayuda', 'agua', 'excursionista', 'perdido', 'rescate'], say(c) {
        if (!q(c, 'jd_water')) { c.ask('water'); return [c.t('Our water truck is late and the team is on the last jerrycan. Bring three bottles of water to the outpost — Ein Gedi kiosk or the beach bar sell them. 45 credits from the patrol fund. Can you do it?', 'El camión de agua llega tarde y al equipo le queda el último bidón. Trae tres botellas de agua al puesto: el quiosco de Ein Gedi o el bar de la playa las venden. 45 créditos del fondo de la patrulla. ¿Puedes?')] }
        if (q(c, 'jd_water') === 'active') return [c.t('Three bottles. The team is counting on you. And the team is very sweaty.', 'Tres botellas. El equipo cuenta contigo. Y el equipo está muy sudado.')];
        if (!q(c, 'jd_hiker')) { c.ask('hiker'); return [c.t('A hiker called Tomer went out at dawn to see the Qumran caves. No answer on his phone since noon. I need my team here — will you go and check on him? Find him, then report back.', 'Un excursionista llamado Tomer salió al amanecer a ver las cuevas de Qumrán. No contesta al móvil desde mediodía. Necesito a mi equipo aquí, ¿irías a buscarlo? Encuéntralo y vuelve a informar.')] }
        if (q(c, 'jd_hiker') === 'active') return [c.t('Qumran caves: north-west, in the cliffs. Take water.', 'Cuevas de Qumrán: noroeste, en los acantilados. Llévate agua.')];
        return [c.t('You did good work out here. If you ever want a desert job, the paperwork is only forty pages.', 'Hiciste buen trabajo aquí. Si alguna vez quieres un trabajo en el desierto, el papeleo son solo cuarenta páginas.')];
      } },
      { id: 'patrol', kw: ['patrol', 'soldier', 'army', 'outpost', 'base', 'duty', 'patrulla', 'soldado', 'ejercito', 'puesto', 'deber'], say: c => [c.t('Out here we mostly rescue hikers, guard the road, and stop tourists from walking into the desert at noon in flip-flops. You would not believe how often.', 'Aquí sobre todo rescatamos excursionistas, vigilamos la carretera y evitamos que los turistas se adentren en el desierto a mediodía en chanclas. No te creerías cuántas veces.'), c.t('Night shift is the best: no heat, a million stars, and jackals singing.', 'El turno de noche es el mejor: sin calor, un millón de estrellas y chacales cantando.')] },
      { id: 'self', kw: ['who are you', 'about you', 'yourself', 'sergeant', 'quien eres', 'sargento'], say: c => [c.t('Noa. Grew up in a kibbutz near here. I know every wadi by the shape of its shadow.', 'Noa. Crecí en un kibutz cerca de aquí. Conozco cada wadi por la forma de su sombra.')] }
    ]),
    answers: {
      water: { yes: c => ({ say: c.t('Thank you. Three bottles. Not two. Not “almost three”.', 'Gracias. Tres botellas. Ni dos. Ni “casi tres”.'), action: { type: 'start_quest', id: 'jd_water' } }), no: c => ({ say: c.t('Understood. We’ll ration. Again.', 'Entendido. Racionaremos. Otra vez.') }) },
      hiker: { yes: c => ({ say: c.t('Good. Go north-west to the cliffs. If he’s hurt, keep him in the shade and call us.', 'Bien. Ve al noroeste, a los acantilados. Si está herido, mantenlo a la sombra y avísanos.'), action: { type: 'start_quest', id: 'jd_hiker' } }), no: c => ({ say: c.t('Then I’ll send a jeep. Stay hydrated.', 'Entonces mandaré un jeep. Hidrátate.') }) }
    },
    chips: c => [[c.t('Need help?', '¿Necesitas ayuda?'), c.t('Do you need help with anything?', '¿Necesitas ayuda con algo?')], [c.t('The patrol?', '¿La patrulla?'), c.t('What does the patrol do?', '¿Qué hace la patrulla?')], [c.t('Places?', '¿Lugares?'), c.t('Where are Masada and Ein Gedi?', '¿Dónde están Masada y Ein Gedi?')], [c.t('Dead Sea?', '¿Mar Muerto?'), c.t('Tell me about the Dead Sea', 'Háblame del Mar Muerto')]],
    barks: c => [c.t('Drink water!', '¡Bebe agua!'), c.t('Radio check. All quiet.', 'Comprobación de radio. Todo tranquilo.'), c.t('Hat. On. Now.', 'La gorra. Puesta. Ya.')],
    fallback: c => [c.t('Copy that. Ask me about the patrol, water, or where things are.', 'Recibido. Pregúntame por la patrulla, el agua o dónde está cada cosa.')]
  };

  /* ======================= SALEM — Bedouin host ======================= */
  const salem = {
    name: 'Salem', title: ['Bedouin host', 'anfitrión beduino'], col: '#ffd08a',
    persona: 'Salem, a Bedouin host who welcomes travellers to his family camp in the desert with sage tea, cardamom coffee and stories. Dignified, funny, patient; loves his camels, especially the stubborn one called Zahra.',
    greet(c) {
      if (q(c, 'jd_camel') === 'active') return [c.t(jd().camelHome ? 'Zahra is home! She pretends nothing happened. Typical.' : 'Zahra was last seen walking towards Masada like she owns it. She does not.', jd().camelHome ? '¡Zahra ha vuelto! Hace como si nada. Típico.' : 'A Zahra la vieron por última vez camino de Masada como si fuera suya. No lo es.')];
      if (c.met === 1) return [c.t('Ahlan, ahlan — welcome, traveller. Sit in the shade. First tea, then talk. That is the desert way.', 'Ahlan, ahlan: bienvenido, viajero. Siéntate a la sombra. Primero el té, luego hablamos. Así se hace en el desierto.')];
      return [c.t('Welcome back, %n. The tea is always ready for a friend.', 'Bienvenido de nuevo, %n. El té siempre está listo para un amigo.')];
    },
    topics: withD([
      { id: 'quest', kw: ['mission', 'quest', 'task', 'help', 'favor', 'favour', 'camel', 'zahra', 'mision', 'tarea', 'ayuda', 'camello'], say(c) {
        if (!q(c, 'jd_camel')) { c.ask('camel'); return [c.t('My camel Zahra is clever and very proud. This morning she walked away towards Masada. Can you find her and lead her home? She likes people who speak softly. 30 credits and tea forever.', 'Mi camella Zahra es lista y muy orgullosa. Esta mañana se fue hacia Masada. ¿Puedes encontrarla y traerla a casa? Le gusta la gente que habla bajito. 30 créditos y té para siempre.')] }
        if (q(c, 'jd_camel') === 'active') return [c.t('Look near the foot of Masada, south. She has a red tassel on her bridle.', 'Mira al pie de Masada, al sur. Lleva una borla roja en la brida.')];
        return [c.t('Zahra forgave you for finding her. That is an honour.', 'Zahra te perdonó por encontrarla. Es un honor.')];
      } },
      { id: 'tea', kw: ['tea', 'coffee', 'sage', 'hospitality', 'drink', 'te', 'cafe', 'salvia', 'hospitalidad', 'bebida'], say: c => [c.t('Tea with sage, very sweet. Coffee with cardamom, bitter and small. A guest is a gift from God — three days, no questions.', 'Té con salvia, muy dulce. Café con cardamomo, amargo y pequeño. El huésped es un regalo de Dios: tres días sin preguntas.')] },
      { id: 'life', kw: ['bedouin', 'tent', 'family', 'life', 'stars', 'goats', 'beduino', 'tienda', 'familia', 'vida', 'estrellas', 'cabras'], say: c => [c.t('Our tents are woven from goat hair. In the sun the threads close and keep the shade; in the rain they swell and keep the water out. My grandmother wove this one.', 'Nuestras tiendas se tejen con pelo de cabra. Con el sol los hilos se cierran y dan sombra; con la lluvia se hinchan y no dejan pasar el agua. Esta la tejió mi abuela.')] },
      { id: 'ride', kw: ['ride', 'riding', 'camel ride', 'montar', 'paseo'], say: c => [c.t('A camel ride? Press on the saddled camel by the tents. 15 credits. Lean back when she stands up — front legs last!', '¿Un paseo en camello? Toca la camella ensillada junto a las tiendas. 15 créditos. Échate hacia atrás cuando se levante: ¡las patas delanteras van al final!')] }
    ], ['desert', 'places', 'back']),
    answers: { camel: { yes: c => ({ say: c.t('Bless you. Speak softly, walk slowly, and do not mention her weight.', 'Bendito seas. Habla bajito, camina despacio y no le menciones su peso.'), action: { type: 'start_quest', id: 'jd_camel' } }), no: c => ({ say: c.t('She will come back when she is hungry. Probably.', 'Volverá cuando tenga hambre. Probablemente.') }) } },
    chips: c => [[c.t('Need help?', '¿Necesitas ayuda?'), c.t('Can I help you with something?', '¿Puedo ayudarte en algo?')], [c.t('Tea?', '¿Té?'), c.t('Tell me about your tea', 'Háblame de tu té')], [c.t('Bedouin life?', '¿La vida beduina?'), c.t('Tell me about your tent and family', 'Háblame de tu tienda y tu familia')], [c.t('Camel ride?', '¿Paseo en camello?'), c.t('Can I ride a camel?', '¿Puedo montar en camello?')]],
    barks: c => [c.t('Tea is ready!', '¡El té está listo!'), c.t('Come, sit, the shade is free.', 'Ven, siéntate, la sombra es gratis.'), c.t('Zahra! Zahraaa!', '¡Zahra! ¡Zahraaa!')],
    fallback: c => [c.t('Slowly, slowly. Ask me about tea, my tent, or my camels.', 'Despacio, despacio. Pregúntame por el té, mi tienda o mis camellos.')]
  };

  /* ======================= AMIR — Masada ranger ======================= */
  const amir = {
    name: 'Amir', title: ['Masada park ranger', 'guarda de Masada'], col: '#a8ff8a',
    persona: 'Amir, a cheerful national-park ranger at Masada who loves archaeology, sunrises, and telling visitors to take the snake path down, never up at noon.',
    greet(c) { if (c.met === 1) return [c.t('Welcome to Masada! Ranger Amir. King Herod built a palace on this rock. The view from the top will ruin all other views for you.', '¡Bienvenido a Masada! Guarda Amir. El rey Herodes construyó un palacio en esta roca. La vista desde arriba te estropeará todas las demás vistas.')]; return [c.t('Up or down today, %n? Cable car is easy, the Roman ramp is honest.', '¿Subes o bajas hoy, %n? El teleférico es fácil; la rampa romana, honrada.')] },
    topics: withD([
      { id: 'masada', kw: ['masada', 'herod', 'palace', 'history', 'roman', 'ramp', 'siege', 'herodes', 'palacio', 'historia', 'romano', 'rampa', 'asedio'], say: c => [c.t('Herod built a fortress-palace here around 30 BCE: storerooms, cisterns, bathhouses on a cliff. During the revolt against Rome the last rebels held it until the Romans built that huge earth ramp on the west side in 73 or 74 CE.', 'Herodes construyó aquí un palacio-fortaleza hacia el 30 a. C.: almacenes, cisternas y baños sobre un acantilado. En la revuelta contra Roma, los últimos rebeldes la resistieron hasta que los romanos levantaron esa enorme rampa de tierra en el lado oeste en el 73 o 74 d. C.')] },
      { id: 'cable', kw: ['cable car', 'top', 'climb', 'up', 'sunrise', 'teleferico', 'cima', 'subir', 'amanecer'], say: c => [c.t('Cable car from the station on the east side takes you straight to the top. Or walk the Roman ramp on the west. Sunrise from the top is famous — people climb in the dark for it.', 'El teleférico de la estación del lado este te sube directo a la cima. O sube a pie por la rampa romana del oeste. El amanecer desde arriba es famoso: la gente sube a oscuras para verlo.')] }
    ], ['desert', 'deadsea', 'back']),
    chips: c => [[c.t('Masada history?', '¿Historia de Masada?'), c.t('Tell me the history of Masada', 'Cuéntame la historia de Masada')], [c.t('How to get up?', '¿Cómo subo?'), c.t('How do I get to the top?', '¿Cómo llego a la cima?')], [c.t('Dead Sea?', '¿Mar Muerto?'), c.t('Tell me about the Dead Sea', 'Háblame del Mar Muerto')]],
    barks: c => [c.t('Water bottles must be full to climb!', '¡Botellas llenas para subir!'), c.t('Sunrise tour at 5! Bring a torch!', '¡Tour del amanecer a las 5! ¡Trae linterna!')],
    fallback: c => [c.t('Good question for the museum. Ask me about Masada’s history or the cable car.', 'Buena pregunta para el museo. Pregúntame por la historia de Masada o el teleférico.')]
  };

  /* ======================= TOMER — a hiker, lost near Qumran ======================= */
  const tomer = {
    name: 'Tomer', title: ['hiker (a bit lost)', 'excursionista (algo perdido)'], col: '#ffb0a0',
    persona: 'Tomer, a friendly student hiker who wandered too far looking for the Qumran caves, ran out of phone battery and is sitting in the shade feeling foolish.',
    greet(c) { if (q(c, 'jd_hiker') === 'active') return [c.t('Oh thank goodness, a person! Ape. Person-ape. My phone died and every cliff looks the same. Did Noa send you? I’m fine, just embarrassed. And thirsty.', '¡Ay, menos mal, una persona! Mono. Persona-mono. Se me murió el móvil y todos los acantilados son iguales. ¿Te manda Noa? Estoy bien, solo avergonzado. Y sediento.')]; return [c.t('Hi again! I’m staying on the marked trails now. Mostly.', '¡Hola otra vez! Ahora me quedo en los senderos marcados. Casi siempre.')] },
    topics: withD([{ id: 'caves', kw: ['caves', 'qumran', 'scrolls', 'cuevas', 'rollos', 'manuscritos'], say: c => [c.t('The Dead Sea Scrolls were found in caves like these in 1947 — a shepherd threw a stone into a cave and heard a jar break. Two thousand years old!', 'Los manuscritos del Mar Muerto se encontraron en cuevas como estas en 1947: un pastor lanzó una piedra a una cueva y oyó romperse una vasija. ¡Dos mil años!')] }], ['desert', 'back']),
    chips: c => [[c.t('Are you okay?', '¿Estás bien?'), c.t('Are you okay?', '¿Estás bien?')], [c.t('The caves?', '¿Las cuevas?'), c.t('What is special about these caves?', '¿Qué tienen de especial estas cuevas?')]],
    barks: c => [c.t('Hello? Anybody?', '¿Hola? ¿Alguien?'), c.t('Note to self: charge phone.', 'Nota mental: cargar el móvil.')],
    fallback: c => [c.t('Sorry, the sun cooked my brain a bit. Ask me about the caves?', 'Perdona, el sol me ha cocido un poco el cerebro. ¿Me preguntas por las cuevas?')]
  };

  Object.assign(AV.NPCS, { dalia, yossi, karim, miriam, elias, noa, salem, amir, tomer });
  /* fallback body colours (only used if a world spawns them without a custom body) */
  for (const n of [dalia, yossi, karim, miriam, elias, noa, salem, amir, tomer]) n.look = { shirt: 0xd8c8a8, hat: null };
  Object.assign(AV.NPCS, { vela, tuk, rook, lyra, pearl, tosh });
})();
