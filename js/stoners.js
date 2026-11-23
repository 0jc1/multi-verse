/* APEVERSE V0.9.9 - stoners.js : red-eyed, joint-smoking humans who turn up in EVERY world.
   The cast is deliberately odd: festival clothes, wild hair, manic gestures, a joint in one hand and
   absolutely no urgency about anything. They are spawned after each world builds (AV.onWorldEnter), near
   the arrival point and around the world's own places, so new worlds get them for free.
   Bodies come from AV.chars.stoner() (js/chars_human.js); smoke puffs reuse AV.city.smoke(). */
'use strict';
(function (AV) {
  const tr = AV.tr, TAU = AV.TAU, C = AV.chars;

  /* ======================= the cast ======================= */
  const PROFILES = [
    {
      id: 'hazy', name: 'Hazy Dave', title: ['professional cloud-watcher', 'observador profesional de nubes'], col: '#ffb04a',
      persona: 'Hazy Dave, a gentle, easily distracted human who smokes herb and watches clouds. Kind, philosophical, loses his thread mid-sentence, thinks every world is a slightly different dream.',
      greet(c) {
        if (c.met === 1) return [c.t('Ohhh. A new face. I was just explaining the sky to a leaf. It got it.', 'Ohhh. Una cara nueva. Le estaba explicando el cielo a una hoja. Lo entendió.')];
        if (c.part === 'night') return [c.t('The stars are loud tonight, %n. Can you hear them? They sound like tiny bass strings.', 'Las estrellas están ruidosas esta noche, %n. ¿Las oyes? Suenan como cuerdas de bajo diminutas.')];
        return [c.t('Hey %n. Good clouds today. Fluffy, but with opinions.', 'Ey %n. Buenos nubes hoy. Esponjosas, pero con opiniones.'),
          c.t('Sit down, sit down. The ground is doing most of the work anyway.', 'Siéntate, siéntate. El suelo ya hace casi todo el trabajo.')];
      },
      topics: [
        { id: 'herb', kw: ['weed', 'joint', 'smoke', 'herb', 'ganja', 'high', 'stoned', 'puff', 'porro', 'hierba', 'maria', 'fumar', 'colocon', 'yerba'], say: c => [c.t('This? Local. Grown in a mushroom garden, dried on a drum machine, blessed by a passing frog. Very artisanal.', '¿Esto? De aquí. Cultivado en un jardín de setas, secado sobre una caja de ritmos, bendecido por una rana de paso. Muy artesanal.'), c.t('It doesn’t make me crazy. It makes me… diagonal. Crazy is a straight line with better marketing.', 'No me vuelve loco. Me vuelve… diagonal. Loco es una línea recta con mejor marketing.')] },
        { id: 'brain', kw: ['crazy', 'insane', 'weird', 'mind', 'third eye', 'loco', 'chalado', 'raro', 'mente', 'tercer ojo'], say: c => [c.t('My brain is a browser with forty tabs open. Three are playing music. One is a map of a place that isn’t real. I love it here.', 'Mi cerebro es un navegador con cuarenta pestañas abiertas. Tres suenan música. Una es un mapa de un lugar que no existe. Me encanta aquí.'), c.t('The trick is not to close the tabs. The trick is to water them.', 'El truco no es cerrar las pestañas. El truco es regarlas.')] },
        { id: 'world', kw: ['world', 'portal', 'universe', 'here', 'reality', 'mundo', 'universo', 'realidad', 'aqui'], say: c => [c.t('Every world has a different gravity for thoughts. Here they float. In the city they queue up politely.', 'Cada mundo tiene una gravedad distinta para los pensamientos. Aquí flotan. En la ciudad hacen cola con educación.'), c.t('I came through the Portal Pipe for a weekend. I have been having the same weekend for a while now.', 'Vine por la Pipa-Portal a pasar un finde. Llevo un rato teniendo el mismo finde.')] },
        { id: 'self', kw: ['who are you', 'about you', 'yourself', 'quien eres', 'sobre ti'], say: c => [c.t('Dave. Hazy Dave. The hazy is load-bearing.', 'Dave. Dave el Nebuloso. Lo de nebuloso es estructural.'), c.t('I used to be an accountant. Then I looked at the sky too long and my calculator became a wind chime.', 'Antes era contable. Luego miré el cielo demasiado y mi calculadora se convirtió en un móvil de viento.')] }
      ],
      answers: {},
      chips: c => [
        [c.t('What are you smoking?', '¿Qué fumas?'), c.t('What are you smoking?', '¿Qué estás fumando?')],
        [c.t('Are you okay?', '¿Estás bien?'), c.t('Are you okay?', '¿Estás bien?')],
        [c.t('Seen anything weird?', '¿Has visto algo raro?'), c.t('Seen anything weird around here?', '¿Has visto algo raro por aquí?')]
      ],
      barks: c => [c.t('Puff puff… pass? No? More for me.', 'Calada, calada… ¿pasas? ¿No? Más para mí.'), c.t('The grass is breathing, man. In a good way.', 'La hierba respira, tío. En el buen sentido.'), c.t('Red eyes? No, these are sunset mode.', '¿Ojos rojos? No, es modo atardecer.')],
      fallback: c => [c.t('Mmm. That’s a thought with legs. Let it walk around.', 'Mmm. Eso es un pensamiento con patas. Déjalo pasear.'), c.t('Ask me about the herb, the sky, or the third eye. I’m an open book with a very relaxed spine.', 'Pregúntame por la hierba, el cielo o el tercer ojo. Soy un libro abierto con la columna muy relajada.')]
    },
    {
      id: 'lizzy', name: 'Dizzy Lizzy', title: ['self-appointed cosmic detective', 'detective cósmica autoproclamada'], col: '#ff6ad5',
      persona: 'Dizzy Lizzy, a fast-talking, manic human who has connected every coincidence in the multiverse into one enormous theory. Smokes herb constantly, laughs at her own jokes, deeply convinced the moon is involved.',
      greet(c) {
        if (c.met === 1) return [c.t('You’re here! Perfect timing. I just solved the moon. It’s not a moon. It’s a lampshade for a much bigger party.', '¡Estás aquí! Momento perfecto. Acabo de resolver la luna. No es una luna. Es una pantalla para una fiesta mucho más grande.')];
        return [c.t('%n! Quick, look at that cloud. No, the other one. See? That’s exactly what the lizards warned me about.', '%n! Rápido, mira esa nube. No, la otra. ¿Ves? Exactamente de lo que me avisaron los lagartos.'), c.t('I have three theories and all of them are snacks.', 'Tengo tres teorías y todas son un aperitivo.')];
      },
      topics: [
        { id: 'theory', kw: ['theory', 'conspiracy', 'moon', 'lizard', 'secret', 'truth', 'teoria', 'conspiracion', 'luna', 'lagarto', 'secreto', 'verdad'], say: c => [c.t('Okay. The moon is a lampshade. The stars are holes in the ceiling. And the Portal Pipe is a straw. We are inside a very expensive smoothie.', 'Vale. La luna es una pantalla. Las estrellas son agujeros en el techo. Y la Pipa-Portal es una pajita. Estamos dentro de un batido muy caro.'), c.t('I have evidence. It’s a drawing. The drawing is mostly a spiral. Spirals are evidence.', 'Tengo pruebas. Es un dibujo. El dibujo es sobre todo una espiral. Las espirales son pruebas.')] },
        { id: 'herb', kw: ['weed', 'joint', 'smoke', 'herb', 'ganja', 'high', 'stoned', 'puff', 'porro', 'hierba', 'fumar', 'colocon'], say: c => [c.t('The herb sharpens my detective brain and also removes all the furniture from it. Both useful.', 'La hierba afila mi cerebro detective y también le quita todos los muebles. Las dos cosas sirven.'), c.t('I smoke so I stop interrupting the universe. The universe is very chatty.', 'Fumo para dejar de interrumpir al universo. El universo habla mucho.')] },
        { id: 'world', kw: ['world', 'portal', 'universe', 'reality', 'mundo', 'universo', 'realidad'], say: c => [c.t('Each world is a different episode. Same show, different snacks. I’m recapping them all in my head, badly.', 'Cada mundo es un episodio distinto. Mismo programa, distintos aperitivos. Los estoy recapitulando todos en mi cabeza, mal.')] },
        { id: 'self', kw: ['who are you', 'about you', 'yourself', 'quien eres'], say: c => [c.t('Dizzy Lizzy! Detective, prophet, part-time cloud. I once found a portal behind a fridge. The fridge was not involved.', '¡Dizzy Lizzy! Detective, profeta, nube a tiempo parcial. Una vez encontré un portal detrás de una nevera. La nevera no tenía nada que ver.')] }
      ],
      answers: {},
      chips: c => [
        [c.t('Tell me your theory', 'Cuéntame tu teoría'), c.t('Tell me your theory.', 'Cuéntame tu teoría.')],
        [c.t('The moon?', '¿La luna?'), c.t('What about the moon?', '¿Qué pasa con la luna?')],
        [c.t('Are you okay?', '¿Estás bien?'), c.t('Are you okay?', '¿Estás bien?')]
      ],
      barks: c => [c.t('The lizards say hi. They also say “buy more snacks”.', 'Los lagartos dicen hola. También dicen “compra más aperitivos”.'), c.t('I’m not paranoid. I’m just early.', 'No estoy paranoica. Solo voy temprano.'), c.t('Did you hear that? Exactly. Neither did I. Suspicious.', '¿Has oído eso? Exacto. Yo tampoco. Sospechoso.')],
      fallback: c => [c.t('Yes! Absolutely! …What was the question?', '¡Sí! ¡Totalmente! …¿Cuál era la pregunta?'), c.t('Ask me about the moon, the herb, or the lizard economy. It’s all connected.', 'Pregúntame por la luna, la hierba o la economía de los lagartos. Todo está conectado.')]
    },
    {
      id: 'karl', name: 'Kush Karl', title: ['amateur philosopher', 'filósofo aficionado'], col: '#7aff9a',
      persona: 'Kush Karl, a friendly, mildly paranoid human who smokes herb and offers unsolicited safety advice. Convinced the trees are listening (they are) and that everyone needs to hydrate and relax.',
      greet(c) {
        if (c.met === 1) return [c.t('Hey. Don’t look now, but I think the trees are listening. Good listeners, though. Very patient.', 'Ey. No mires ahora, pero creo que los árboles escuchan. Buenos oyentes, eso sí. Muy pacientes.')];
        return [c.t('Oh good, it’s you. I was starting to think the bench was a spy.', 'Ah, bien, eres tú. Empezaba a pensar que el banco era un espía.'), c.t('You look like you need water and a slower opinion. I have both.', 'Pareces necesitar agua y una opinión más lenta. Tengo las dos.')];
      },
      topics: [
        { id: 'paranoia', kw: ['paranoid', 'spy', 'watching', 'tree', 'safe', 'danger', 'paranoico', 'espia', 'mirando', 'arbol', 'peligro'], say: c => [c.t('I’m not saying the trees are spies. I’m saying they have excellent posture and they never blink. You do the math.', 'No digo que los árboles sean espías. Digo que tienen una postura excelente y nunca parpadean. Haz tú las cuentas.'), c.t('Also the frogs know things. But frogs are chill. Frogs are fine.', 'También las ranas saben cosas. Pero las ranas son tranquilas. Las ranas están bien.')] },
        { id: 'herb', kw: ['weed', 'joint', 'smoke', 'herb', 'ganja', 'high', 'stoned', 'puff', 'porro', 'hierba', 'fumar', 'colocon'], say: c => [c.t('I only smoke the calming kind. The other kind makes me reorganize other people’s furniture with my mind.', 'Solo fumo la variedad tranquila. La otra me hace reorganizar los muebles de los demás con la mente.'), c.t('You want a puff? It’s a sharing strain. Very socialist.', '¿Quieres una calada? Es una variedad para compartir. Muy socialista.')] },
        { id: 'world', kw: ['world', 'portal', 'universe', 'reality', 'mundo', 'universo', 'realidad'], say: c => [c.t('Every new world, same rule: hydrate, observe, don’t accept candy from a robot. Basic multiverse safety.', 'Cada mundo nuevo, misma regla: hidrátate, observa y no aceptes caramelos de un robot. Seguridad básica del multiverso.')] },
        { id: 'self', kw: ['who are you', 'about you', 'yourself', 'quien eres'], say: c => [c.t('Karl. Kush Karl if you’re buying, just Karl if you’re the authorities.', 'Karl. Kush Karl si invitas, solo Karl si eres la autoridad.')] }
      ],
      answers: {},
      chips: c => [
        [c.t('Is it safe here?', '¿Es seguro aquí?'), c.t('Is it safe here?', '¿Es seguro aquí?')],
        [c.t('Share a puff?', '¿Compartes una calada?'), c.t('Can I have a puff?', '¿Me das una calada?')],
        [c.t('Are you okay?', '¿Estás bien?'), c.t('You good?', '¿Todo bien?')]
      ],
      barks: c => [c.t('Hydrate, buddy. The multiverse is dry.', 'Hidrátate, colega. El multiverso está seco.'), c.t('If a tree asks you a question, answer honestly.', 'Si un árbol te hace una pregunta, responde con sinceridad.'), c.t('I’m not high. I’m at a high altitude. Spiritually.', 'No estoy colocado. Estoy a mucha altitud. Espiritualmente.')],
      fallback: c => [c.t('Fair point. I’ll think about that for a week.', 'Buena idea. Le daré vueltas una semana.'), c.t('Ask me about safety, the herb, or the trees. The trees are a big topic.', 'Pregúntame por la seguridad, la hierba o los árboles. Los árboles dan mucho tema.')]
    },
    {
      id: 'mary', name: 'Mary Jane', title: ['cloud poet', 'poeta de las nubes'], col: '#c8a8ff',
      persona: 'Mary Jane, a dreamy human poet who smokes herb and speaks in slow, luminous images. Believes every world is a stanza and the player is a recurring rhyme.',
      greet(c) {
        if (c.met === 1) return [c.t('You walked in like a comma in a very long sentence. Welcome.', 'Entraste como una coma en una frase muy larga. Bienvenido.')];
        return [c.t('%n. The light has been practising your name all morning.', '%n. La luz ha estado practicando tu nombre toda la mañana.'), c.t('Sit. The world is a slow song and we are both early.', 'Siéntate. El mundo es una canción lenta y los dos llegamos temprano.')];
      },
      topics: [
        { id: 'poem', kw: ['poem', 'poetry', 'write', 'words', 'poema', 'poesia', 'escribir', 'palabras'], say: c => [c.t('I’m writing a poem about the Portal Pipe. So far it’s one line and a very long pause. The pause is doing the heavy lifting.', 'Escribo un poema sobre la Pipa-Portal. De momento es una línea y una pausa muy larga. La pausa hace el trabajo duro.'), c.t('Poetry is just smoking with the dictionary open.', 'La poesía es fumar con el diccionario abierto.')] },
        { id: 'herb', kw: ['weed', 'joint', 'smoke', 'herb', 'ganja', 'high', 'stoned', 'puff', 'porro', 'hierba', 'fumar', 'colocon'], say: c => [c.t('The herb opens a small window. I look through it, then forget what windows are. Beautiful.', 'La hierba abre una ventanita. Miro por ella y luego olvido qué son las ventanas. Precioso.'), c.t('Smoke is just a thought that learned to leave the body.', 'El humo es solo un pensamiento que aprendió a salir del cuerpo.')] },
        { id: 'world', kw: ['world', 'portal', 'universe', 'reality', 'mundo', 'universo', 'realidad'], say: c => [c.t('Every world is a stanza. You are the rhyme that keeps coming back, slightly different, always on beat.', 'Cada mundo es una estrofa. Tú eres la rima que vuelve, un poco distinta, siempre a ritmo.')] },
        { id: 'self', kw: ['who are you', 'about you', 'yourself', 'quien eres'], say: c => [c.t('Mary Jane. I used to be a cloud, but the pay was terrible.', 'Mary Jane. Antes era una nube, pero pagaban fatal.')] }
      ],
      answers: {},
      chips: c => [
        [c.t('Read me a poem', 'Recítame un poema'), c.t('Read me one of your poems.', 'Recítame uno de tus poemas.')],
        [c.t('What are you smoking?', '¿Qué fumas?'), c.t('What are you smoking?', '¿Qué estás fumando?')],
        [c.t('Are you okay?', '¿Estás bien?'), c.t('Are you okay?', '¿Estás bien?')]
      ],
      barks: c => [c.t('The smoke is writing something. I’ll read it later.', 'El humo está escribiendo algo. Lo leeré luego.'), c.t('Your shadow has good posture today.', 'Tu sombra tiene buena postura hoy.'), c.t('“Puff” is a complete sentence if you mean it.', '“Calada” es una frase completa si lo dices en serio.')],
      fallback: c => [c.t('Say that again, but slower and with more colours.', 'Dilo otra vez, pero más despacio y con más colores.'), c.t('Ask me about poems, smoke, or the shape of worlds. I have opinions shaped like clouds.', 'Pregúntame por poemas, humo o la forma de los mundos. Tengo opiniones con forma de nube.')]
    },
    {
      id: 'blaze', name: 'Blaze', title: ['surfer wizard', 'mago surfista'], col: '#4ac8ff',
      persona: 'Blaze, a cheerful human who claims to be a wizard from a beach dimension. Smokes herb, gives nonsense advice with total confidence, and treats every world like a wave to be ridden.',
      greet(c) {
        if (c.met === 1) return [c.t('Duuude. You’re radiating main-character energy. And a little bit of static. Very cool.', 'Tíiiio. Irradias energía de protagonista. Y un poco de electricidad estática. Muy guay.')];
        return [c.t('%n! The universe is a wave and you’re already paddling. Respect.', '¡%n! El universo es una ola y ya estás remando. Respeto.'), c.t('I’m 90% sure this world is a beach that forgot its ocean. Love the commitment.', 'Estoy 90% seguro de que este mundo es una playa que olvidó su océano. Me encanta el compromiso.')];
      },
      topics: [
        { id: 'wizard', kw: ['wizard', 'magic', 'spell', 'surf', 'beach', 'mago', 'magia', 'hechizo', 'surfear', 'playa'], say: c => [c.t('I’m a wizard, but only for small stuff. I can find lost lighters. Occasionally I make a cloud look like a dog. That’s the whole curriculum.', 'Soy mago, pero solo para cosas pequeñas. Encuentro mecheros perdidos. A veces hago que una nube parezca un perro. Ese es todo el plan de estudios.'), c.t('Every portal is a tube. You just have to paddle in with the right attitude.', 'Cada portal es un tubo. Solo hay que entrar remando con la actitud correcta.')] },
        { id: 'herb', kw: ['weed', 'joint', 'smoke', 'herb', 'ganja', 'high', 'stoned', 'puff', 'porro', 'hierba', 'fumar', 'colocon'], say: c => [c.t('This strain is called Low Tide. It makes time move like syrup. Great for surfing, terrible for appointments.', 'Esta variedad se llama Marea Baja. Hace que el tiempo vaya como jarabe. Genial para surfear, fatal para las citas.'), c.t('A joint is just a very small lighthouse for your thoughts.', 'Un porro es solo un faro muy pequeño para tus pensamientos.')] },
        { id: 'world', kw: ['world', 'portal', 'universe', 'reality', 'mundo', 'universo', 'realidad'], say: c => [c.t('Some worlds are point breaks, some are reef breaks, and this one is a longboard. Cruise it.', 'Algunos mundos son olas de punta, otros de arrecife, y este es una tabla larga. Ve tranquilo.')] },
        { id: 'self', kw: ['who are you', 'about you', 'yourself', 'quien eres'], say: c => [c.t('Blaze. Wizard, surfer, professional vibe consultant.', 'Blaze. Mago, surfista y consultor profesional de buen rollo.')] }
      ],
      answers: {},
      chips: c => [
        [c.t('Teach me magic', 'Enséñame magia'), c.t('Can you teach me magic?', '¿Me enseñas magia?')],
        [c.t('Best world to surf?', '¿Mejor mundo para surfear?'), c.t('Which world has the best waves?', '¿Qué mundo tiene las mejores olas?')],
        [c.t('Are you okay?', '¿Estás bien?'), c.t('You good, wizard?', '¿Todo bien, mago?')]
      ],
      barks: c => [c.t('Hang loose. The multiverse is mostly water.', 'Todo tranqui. El multiverso es casi todo agua.'), c.t('If you see a wave, tell it I said hi.', 'Si ves una ola, dile que le mando saludos.'), c.t('My red eyes? Wizard mode. Very advanced.', '¿Mis ojos rojos? Modo mago. Muy avanzado.')],
      fallback: c => [c.t('Whoa. Deep. Or shallow. I can’t tell from here, and that’s the beauty.', 'Uf. Profundo. O poco profundo. Desde aquí no lo sé, y eso es lo bonito.'), c.t('Ask me about magic, waves, or the herb. I’m an open beach.', 'Pregúntame por magia, olas o la hierba. Soy una playa abierta.')]
    },
    {
      id: 'puff', name: 'Professor Puff', title: ['doctor of applied vibes', 'doctor en buen rollo aplicado'], col: '#ffd84a',
      persona: 'Professor Puff, a self-styled academic who delivers absurd research findings about clouds, snacks and the multiverse with total seriousness. Smokes herb from a joint he calls “field equipment”.',
      greet(c) {
        if (c.met === 1) return [c.t('Ah, a research assistant! Excellent. Please observe that cloud and write down its vibes.', 'Ah, ¡un ayudante de investigación! Excelente. Observa esa nube y anota su buen rollo.')];
        return [c.t('%n. Peer review is going badly. Nobody believes my paper on snack-based gravity.', '%n. La revisión por pares va mal. Nadie cree mi artículo sobre la gravedad basada en aperitivos.'), c.t('Come, come. The data is mostly smoke, but the conclusions are solid.', 'Ven, ven. Los datos son sobre todo humo, pero las conclusiones son sólidas.')];
      },
      topics: [
        { id: 'research', kw: ['research', 'study', 'science', 'data', 'paper', 'professor', 'investigacion', 'estudio', 'ciencia', 'datos', 'articulo', 'profesor'], say: c => [c.t('My current study: “Do portals taste like lime?” Sample size: me. Confidence: unreasonable. Funding: snacks.', 'Mi estudio actual: “¿Los portales saben a lima?” Muestra: yo. Confianza: irrazonable. Financiación: aperitivos.'), c.t('I have tenure in three dimensions. The fourth is still reviewing my application.', 'Tengo plaza en tres dimensiones. La cuarta aún revisa mi solicitud.')] },
        { id: 'herb', kw: ['weed', 'joint', 'smoke', 'herb', 'ganja', 'high', 'stoned', 'puff', 'porro', 'hierba', 'fumar', 'colocon'], say: c => [c.t('This is field equipment. It improves observation by making everything 12% more interesting and 40% less urgent.', 'Esto es equipo de campo. Mejora la observación haciendo todo un 12% más interesante y un 40% menos urgente.'), c.t('A peer-reviewed joint is just a joint with a tiny clipboard.', 'Un porro revisado por pares es solo un porro con una tablilla diminuta.')] },
        { id: 'world', kw: ['world', 'portal', 'universe', 'reality', 'mundo', 'universo', 'realidad'], say: c => [c.t('The multiverse is a filing cabinet. Some drawers are labelled. Most are full of glitter and unanswered emails.', 'El multiverso es un archivador. Algunos cajones están etiquetados. La mayoría están llenos de purpurina y correos sin responder.')] },
        { id: 'self', kw: ['who are you', 'about you', 'yourself', 'quien eres'], say: c => [c.t('Professor Puff. My doctorate is honorary. My curiosity is fully accredited.', 'Profesor Puff. Mi doctorado es honorífico. Mi curiosidad está totalmente acreditada.')] }
      ],
      answers: {},
      chips: c => [
        [c.t('What are you researching?', '¿Qué investigas?'), c.t('What are you researching?', '¿Qué estás investigando?')],
        [c.t('Field equipment?', '¿Equipo de campo?'), c.t('What is that field equipment?', '¿Qué es ese equipo de campo?')],
        [c.t('Are you okay?', '¿Estás bien?'), c.t('Are you okay, Professor?', '¿Está bien, profesor?')]
      ],
      barks: c => [c.t('Fascinating. I have no idea what it means.', 'Fascinante. No tengo ni idea de qué significa.'), c.t('Write that down. No, with your mind.', 'Anótalo. No, con la mente.'), c.t('The sample is smoky but statistically delightful.', 'La muestra es humosa pero estadísticamente deliciosa.')],
      fallback: c => [c.t('Hmm. A promising hypothesis. Let us smoke on it.', 'Mmm. Una hipótesis prometedora. Vamos a fumar sobre ello.'), c.t('Ask me about research, the herb, or the multiverse. Bring snacks; the budget is tight.', 'Pregúntame por investigación, la hierba o el multiverso. Trae aperitivos; el presupuesto está ajustado.')]
    }
  ];
  PROFILES.forEach(p => { AV.NPCS[p.id] = p });

  /* ======================= smoke + crazy idle ======================= */
  const _v = new THREE.Vector3();
  function makeAnim(seed, side) {
    return function (n, dt, t, d, talking, moving) {
      const u = n.g && n.g.userData; if (!u || !u.aR || !u.aL) return;
      const aR = u.aR, aL = u.aL, head = u.head, arm = side > 0 ? aR : aL;
      const tokePh = (t + seed * 1.37) % 11, toking = tokePh < 1.9;
      const crazyPh = (t + seed * 2.11) % 29;
      if (!moving && !talking && crazyPh < 2.4) {
        /* sudden manic burst: arms out, head wobbling, like the thought just arrived all at once */
        const k = Math.sin(crazyPh * 9.1);
        aR.rotation.x = -.35 + k * .35; aL.rotation.x = -.35 - k * .35;
        aR.rotation.z = 1.15 + k * .55; aL.rotation.z = -1.15 + k * .55;
        if (head) { head.rotation.z = Math.sin(crazyPh * 13) * .32; head.rotation.x = Math.sin(crazyPh * 9) * .14 }
        if (d < 8 && t > (n.crazyT || 0)) {
          n.crazyT = t + 30;
          const N = AV.NPCS[n.id]; if (N && N.barks) { const arr = N.barks({ t: (en, es) => AV.ui === 'es' ? es : en }); if (arr.length) AV.npc.bark(n, arr[Math.random() * arr.length | 0].replace(/%n/g, AV.S.name || (AV.ui === 'es' ? 'forastero' : 'stranger'))) }
        }
      } else if (!moving && !talking) {
        if (toking) {                 /* raise the joint to the mouth */
          arm.rotation.x = -2.05 + Math.sin(tokePh * 2.4) * .08;
          arm.rotation.z = side * -.28; arm.rotation.y = side * .12;
        } else if (!n.path) {         /* idle: hand drifts forward, body sways gently */
          arm.rotation.x += (-.55 - arm.rotation.x) * .08;
          arm.rotation.z += (side * -.15 - arm.rotation.z) * .08;
          if (head) head.rotation.z = Math.sin(t * .55 + seed) * .1;
        }
      }
      /* a little smoke from the mouth/joint area, more while toking */
      if (n.smokeFx && !moving && t > (n.smokeT || 0)) {
        n.smokeT = t + (toking ? .5 : 1.5);
        if (head) head.getWorldPosition(_v); else _v.copy(n.g.position).y += 1.9;
        const yaw = n.g.rotation.y;
        n.smokeFx.puff(_v.x + Math.sin(yaw) * .24, _v.y - (toking ? .03 : .18), _v.z + Math.cos(yaw) * .24);
      }
    };
  }

  /* ======================= placement in every world ======================= */
  const normPlace = p => Array.isArray(p) ? { x: +p[3], z: +p[4] } : p && { x: +p.x, z: +p.z };
  const hash = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h) };
  function findSpot(W, x, z, rng) {
    for (let i = 0; i < 44; i++) {
      const a = rng() * TAU, r = 2.2 + rng() * 3.8, px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r;
      if (AV.isFree(W, px, pz, .85)) return [px, pz];
    }
    return AV.safeSpot(W, x, z);
  }
  function anchorsFor(W, n, rng) {
    /* V1.1: a world can mark private places (a home, a metro carriage) where no wandering stranger should appear */
    const priv = (x, z) => !!(W.noStrangersAt && W.noStrangersAt(x, z)), a0 = W.arrivals && (W.arrivals[W.defaultArrival] || W.arrivals.default);
    const out = [priv(AV.P.x, AV.P.z) && a0 ? [a0.x, a0.z] : [AV.P.x, AV.P.z]];
    const places = (W.places || []).map(normPlace).filter(p => p && isFinite(p.x) && isFinite(p.z));
    for (let i = places.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const s = places[i]; places[i] = places[j]; places[j] = s }
    for (const p of places) {
      if (out.length >= n) break;
      if (!priv(p.x, p.z) && out.every(a => Math.hypot(a[0] - p.x, a[1] - p.z) > 20)) out.push([p.x, p.z]);
    }
    for (let i = 0; out.length < n && i < 24; i++) { const a = rng() * TAU, r = 22 + rng() * 45; out.push([AV.P.x + Math.cos(a) * r, AV.P.z + Math.sin(a) * r]) }
    return out.slice(0, n);
  }
  function spawnWorld(W) {
    if (!W || W.__stoners) return; W.__stoners = true;
    const ctx = W.ctx; if (!ctx || !W.surface || !AV.npc) return;
    const q = ctx.q == null ? 2 : ctx.q, n = q === 0 ? 2 : 3;
    const rng = AV.rng((AV.S.seed || 1) * 17 + hash(W.id) + (AV.S.day || 1) * 7);
    const smoke = AV.city && AV.city.smoke ? AV.city.smoke(ctx, q === 0 ? 48 : 96, { color: 0xd8ccff, opacity: .4 }) : null;
    const start = hash(W.id) % PROFILES.length;
    anchorsFor(W, n, rng).forEach((a, i) => {
      const [x, z] = findSpot(W, a[0], a[1], rng), y = W.surface(x, z) || 0;
      const prof = PROFILES[(start + i) % PROFILES.length], H = (px, pz) => { const s = W.surface(px, pz); return s == null ? 0 : s };
      const npc = AV.npc.spawn(ctx, prof.id, {
        x, z, y, H, body: C.softStoner ? C.softStoner(hash(W.id) + i * 97 + 1) : C.stoner(hash(W.id) + i * 97 + 1),
        yaw: Math.atan2(AV.P.x - x, AV.P.z - z), r: 3.2, speed: .75,
        anim: makeAnim((hash(W.id) % 23) + i * 3.7, i % 2 ? -1 : 1)
      });
      npc.smokeFx = smoke; npc.smokeSide = i % 2 ? -1 : 1;
      npc.tag.position.y = 2.32; npc.bub.position.y = 3.05;   /* human height, not ape height */
      /* the furthest one paces a tiny loop when you walk away; near you, everyone stands and tokes */
      if (i === n - 1) {
        const path = [];
        for (let k = 0; k < 4; k++) { const ang = k / 4 * TAU, px = x + Math.cos(ang) * 1.8, pz = z + Math.sin(ang) * 1.8; if (W.surface(px, pz) != null && AV.isFree(W, px, pz, .5)) path.push([px, pz, 4 + k % 2]) }
        if (path.length >= 3) npc.path = path;
      }
    });
  }

  /* run after every world build (including future worlds) */
  const prevEnter = AV.onWorldEnter;
  AV.onWorldEnter = function (W) { if (prevEnter) prevEnter(W); try { spawnWorld(W) } catch (e) { console.warn('stoners:', e) } };
  AV.stoners = { profiles: PROFILES, spawnWorld };
})(window.AV);
