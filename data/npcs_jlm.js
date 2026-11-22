/* APEVERSE - data/npcs_jlm.js : named characters of Jerusalem and the Judean Desert (English + Español). Same format as data/npcs.js.
   Jerusalem: Dalia (Old City guide), Yossi (startup founder), Karim (spice merchant), Miriam (Mahane Yehuda baker), Elias (Armenian ceramicist).
   Judean Desert: Sgt. Noa (desert patrol), Salem (Bedouin host), Amir (Masada ranger), Tomer (a hiker who got lost).
   Quests are defined in js/world_jerusalem.js and js/world_judean_desert.js; actions are validated by the game (js/chat.js). */
'use strict';
(function () {
  const q = (c, id) => c.q(id), S = () => AV.S || {};
  const common = {
    oldcity: { id: 'oldcity', kw: ['old city', 'wall', 'gate', 'jaffa', 'damascus', 'lions', 'zion gate', 'dung', 'quarter', 'ciudad vieja', 'muralla', 'puerta', 'barrio'], say: c => [c.t('The Old City has four quarters — Christian, Muslim, Jewish and Armenian — inside walls Suleiman the Magnificent built in the 1500s. Seven open gates: Jaffa Gate in the west is the easiest way in.', 'La Ciudad Vieja tiene cuatro barrios —cristiano, musulmán, judío y armenio— dentro de las murallas que levantó Solimán el Magnífico en el siglo XVI. Siete puertas abiertas: la de Jaffa, al oeste, es la entrada más fácil.')] },
    holy: { id: 'holy', kw: ['western wall', 'kotel', 'temple mount', 'dome of the rock', 'al aqsa', 'aqsa', 'sepulchre', 'sepulcher', 'church', 'mosque', 'synagogue', 'holy', 'pray', 'muro', 'templo', 'cupula', 'mezquita', 'iglesia', 'sinagoga', 'sagrado', 'rezar'], say: c => [c.t('Three faiths hold this city sacred. The Western Wall, the Dome of the Rock and Al-Aqsa on the platform above it, the Church of the Holy Sepulchre a few alleys away. Dress modestly, speak softly, and no smoking near the holy places.', 'Tres religiones consideran sagrada esta ciudad. El Muro Occidental, la Cúpula de la Roca y Al-Aqsa en la explanada de encima, la Iglesia del Santo Sepulcro a pocas callejuelas. Vístete con decoro, habla bajo y nada de fumar cerca de los lugares sagrados.')] },
    food: { id: 'food', kw: ['food', 'eat', 'hungry', 'falafel', 'hummus', 'market', 'shuk', 'souk', 'comida', 'comer', 'hambre', 'mercado'], say: c => [c.t('Hummus near the Damascus Gate, falafel on Jaffa Road, rugelach at Mahane Yehuda, ka’ak from the carts. You will not leave hungry. You might not leave at all.', 'Hummus junto a la Puerta de Damasco, falafel en la calle Jaffa, rugelach en Mahane Yehuda, ka’ak de los carritos. No te irás con hambre. Quizá no te vayas nunca.')] },
    travel: { id: 'travel', kw: ['tram', 'light rail', 'bus', 'desert', 'dead sea', 'masada', 'portal', 'pipe', 'ape town', 'tranvia', 'autobus', 'desierto', 'mar muerto', 'pipa'], say: c => [c.t('The light rail runs along Jaffa Road — stops at City Hall, Jaffa Center and Mahane Yehuda. For the desert, the bus at Damascus Gate drives down to the Dead Sea. And the purple portal by the Jaffa Gate goes home to Ape Town.', 'El tranvía va por la calle Jaffa: paradas en el Ayuntamiento, Jaffa Center y Mahane Yehuda. Para el desierto, el autobús de la Puerta de Damasco baja hasta el Mar Muerto. Y el portal morado junto a la Puerta de Jaffa vuelve a Ape Town.')] }
  };
  const withC = (t, keys) => t.concat((keys || Object.keys(common)).map(k => common[k]).filter(ct => !t.some(x => x.id === ct.id)));
  const jlm = () => S().jlm || {}, jd = () => S().jd || {};

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
})();
