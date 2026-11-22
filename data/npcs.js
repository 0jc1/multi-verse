/* APEVERSE - data/npcs.js : offline conversation content for every NPC (English + Español).
   Each NPC: name, title [en, es], persona (also sent to an optional AI backend), look (body colours),
   greet(c) -> lines, topics [{id, kw:[...], say(c) -> line | [variants], ask?}], answers {pendingId: {yes, no, other}},
   chips(c) -> [[label, message]], barks(c) -> [lines], fallback(c) -> [lines].
   c = conversation context (see js/chat.js): c.t(en, es) picks the language; c.n = player name; c.part = morning/afternoon/evening/night;
   c.did(event) counts what the player did this session; c.met = times met; c.topic(id) = times discussed; c.q(quest) = quest state;
   c.has(item); c.money; c.job; c.rent; c.world; c.aff = affinity (-5..5). Lines may contain %n (player name). */
'use strict';
window.AV = window.AV || {};
AV.NPCS = (function () {
  const pick = a => a[Math.random() * a.length | 0];
  const presentTitles = () => ((AV.MEDIA_DATA && AV.MEDIA_DATA.placements) || []).filter(p => p.status === 'present' && p.world === 'ape_town');

  /* ======================= ZIL — bartender, Ape Town ======================= */
  const zil = {
    name: 'Zil', title: ['Zil’s Café bartender', 'camarero del Café de Zil'], col: '#ffb04a',
    persona: 'Zil, a sarcastic but warm-hearted alien bartender who runs Zil’s Café in Ape Town. Dry humour, short sentences, secretly cares about regulars. Offers the player a café job (15 credits per drink, 5 drinks per shift).',
    look: { fur: 0x4aa090, shirt: 0xe0a040, hat: 0x2a2a3a },
    greet(c) {
      if (c.met === 1) return [c.t('Yo. Zil. I pour, I judge, I occasionally smile. New face — what’s good?', 'Ey. Soy Zil. Sirvo, juzgo y a veces sonrío. Cara nueva, ¿qué tal?')];
      const r = c.recent(['tip_band', 'shift_done', 'travel', 'bissap', 'cinema']);
      if (r === 'tip_band') return [c.t('Saw you tip the band. The gorilla’s been grinning into his bass ever since.', 'Vi que diste propina a la banda. El gorila lleva sonriendo a su contrabajo desde entonces.')];
      if (r === 'shift_done') return [c.t('Good shift earlier. The regulars only complained twice. That’s a record.', 'Buen turno antes. Los clientes solo se quejaron dos veces. Récord.')];
      if (r === 'travel') return [c.t('Back from another universe? You smell like portal smoke and questionable decisions.', '¿De vuelta de otro universo? Hueles a humo de portal y a malas decisiones.')];
      if (r === 'bissap') return [c.t('Is that a bissap from the kiosk? Traitor. …Fine, it’s good.', '¿Eso es un bissap del quiosco? Traidor. …Vale, está bueno.')];
      if (r === 'cinema') return [c.t('Caught a film? I can hear the cinema from here. Every night. Every frame.', '¿Viste una peli? Oigo el cine desde aquí. Cada noche. Cada fotograma.')];
      if (c.money < 25 && !c.job) return [c.t('Your wallet looks like it’s on a diet, %n. I might have work, you know.', 'Tu cartera parece estar a dieta, %n. Igual tengo trabajo, ¿sabes?')];
      if (c.part === 'morning') return [c.t('Morning, %n. Coffee’s mushroom, the mood is optional.', 'Buenos días, %n. El café es de seta; el humor, opcional.')];
      if (c.part === 'night') return [c.t('Late crowd tonight. Keep it down, the Rhodes is sleeping.', 'Gente trasnochadora. Baja la voz, que el Rhodes duerme.')];
      return [c.t('Back again, %n? The stools missed you. Barely.', '¿Otra vez, %n? Los taburetes te extrañaban. Poquito.'), c.t('Zil’s open. Sit, order, or confess. In that order.', 'Zil está abierto. Siéntate, pide o confiesa. En ese orden.')];
    },
    topics: [
      { id: 'job', kw: ['work', 'job', 'hiring', 'hire', 'employ', 'gig', 'shift', 'trabajo', 'empleo', 'chamba', 'curro', 'turno'], say(c) {
        if (c.job) return [c.t('You already work here, rookie. Walk behind the bar and press E to start a shift.', 'Ya trabajas aquí, novato. Ponte detrás de la barra y pulsa E para empezar un turno.'), c.t('Shifts are five drinks. Match the order, keys 1, 2, 3. Don’t pour Cola into a Mocha. Again.', 'Los turnos son de cinco bebidas. Teclas 1, 2, 3. No eches Cola en un Moca. Otra vez.')];
        c.ask('job'); return [c.t('Honestly? My last helper quit to become a cloud. I need hands: 15 credits per drink, five drinks a shift, plus tips. Want in?', 'Sinceramente, mi último ayudante se fue a ser nube. Necesito manos: 15 créditos por bebida, cinco por turno, más propinas. ¿Te apuntas?')];
      } },
      { id: 'pay', kw: ['pay', 'money', 'credits', 'salary', 'wage', 'rich', 'broke', 'paga', 'dinero', 'creditos', 'sueldo', 'pobre'], say: c => [c.t('Fifteen credits a drink, twenty-five in tips for a full shift. Nobody gets rich. Everybody gets fed. You have ' + c.money + ' credits, by the way. I count everything.', 'Quince créditos por bebida y veinticinco de propina por turno. Nadie se hace rico, todos comen. Tienes ' + c.money + ' créditos, por cierto. Lo cuento todo.')] },
      { id: 'menu', kw: ['drink', 'menu', 'order', 'coffee', 'fizz', 'cola', 'mocha', 'thirsty', 'bebida', 'carta', 'cafe', 'sed', 'pedir'], say: c => [c.t('Tonight’s menu: Nebula Fizz, Cosmic Cola, Mushroom Mocha. For hibiscus, the Bissap kiosk on the south-east side of the plaza. I don’t do flowers.', 'Hoy hay: Nebula Fizz, Cosmic Cola y Moca de Seta. Para hibisco, el quiosco de Bissap al sureste de la plaza. Yo no hago flores.'), c.t('The Mushroom Mocha is my masterpiece. Tastes like a forest that believes in you.', 'El Moca de Seta es mi obra maestra. Sabe a un bosque que cree en ti.')] },
      { id: 'music', kw: ['music', 'song', 'band', 'tuba', 'rhodes', 'jazz', 'concert', 'stage', 'gorilla', 'orangutan', 'ztonedape', 'musica', 'cancion', 'banda', 'concierto', 'escenario'], say: c => [c.t('Tuba bass and Rhodes keep these walls honest. And the Stone Ape Band on the lotus stage? Best free show in any universe.', 'La tuba y el Rhodes mantienen estas paredes honestas. ¿Y la Stone Ape Band en el escenario de loto? El mejor show gratis del universo.'), c.t('Ztonedape writes beats on that pad like it owes him money. The orangutan just closes his eyes and the sax does the rest.', 'Ztonedape toca ese pad como si le debiera dinero. El orangután cierra los ojos y el saxo hace el resto.'), c.t('Tip the band if you like them. Five credits. The gorilla notices. The gorilla always notices.', 'Dale propina a la banda si te gusta. Cinco créditos. El gorila se da cuenta. Siempre.')] },
      { id: 'art', kw: ['painting', 'gallery', 'art', 'frame', 'cinema', 'movie', 'film', 'video', 'pintura', 'galeria', 'arte', 'cine', 'pelicula'], say: c => [c.t('The Living Paintings? Walk the Gallery Gardens. They move when you get close. Some frames are still waiting for their artist to send the file. Luma will tell you all about it. At length.', '¿Las Pinturas Vivas? Camina por los Jardines de la Galería. Se mueven cuando te acercas. Algunos marcos esperan el archivo del artista. Luma te lo contará todo. Largo y tendido.'), c.t('The open-air cinema runs the painting shorts on loop. Stand near the screen and you’ll hear it. Bring your own popcorn; I’m not a miracle worker.', 'El cine al aire libre pasa los cortos en bucle. Acércate a la pantalla y lo oirás. Trae tus palomitas, no hago milagros.')] },
      { id: 'rent', kw: ['rent', 'apartment', 'home', 'house', 'lodge', 'sleep', 'bed', 'tired', 'alquil', 'casa', 'piso', 'cabana', 'dormir', 'cama', 'cansado'], say: c => c.rent > 0 ? [c.t('You’ve got the eco-lodge for ' + c.rent + ' more day(s). The bed is solid. The frogs outside are not optional.', 'Tienes la eco-cabaña ' + c.rent + ' día(s) más. La cama es firme. Las ranas de fuera no son opcionales.')] : [c.t('The eco-lodge up in La Muria village, on the north hill, is 90 credits for three days. The landlord’s a rock, but fair. Literally a rock.', 'La eco-cabaña de la aldea de La Muria, en la colina norte, cuesta 90 créditos por tres días. El casero es una roca, pero justo. Literalmente una roca.')] },
      { id: 'travel', kw: ['portal', 'pipe', 'gate', 'travel', 'world', 'universe', 'planet', 'space', 'astro', 'jungle', 'verdalux', 'dub', 'club', 'pipa', 'viajar', 'mundo', 'universo', 'planeta'], say: c => [c.t('Press P and puff the Portal Pipe. Pick a world, walk through the swirl. Some worlds are still being built — the pipe is honest about which.', 'Pulsa P y dale una calada a la Pipa-Portal. Elige un mundo y cruza el remolino. Algunos aún se construyen; la pipa te dice cuáles.'), c.t('Astro-9 has a low-gravity dance floor. Jungle Dub has bass you can feel in your teeth. Verdalux has Grakk, who has opinions about moss.', 'Astro-9 tiene una pista con poca gravedad. Jungle Dub, un bajo que sientes en los dientes. Verdalux tiene a Grakk, que opina sobre el musgo.')] },
      { id: 'town', kw: ['town', 'place', 'finca', 'plaza', 'here', 'village', 'muria', 'pueblo', 'ciudad', 'aqui', 'lugar'], say: c => [c.t('Small town, big sky. A gallery that breathes, a cinema under the stars, a band on a floating lotus. I stopped complaining. Mostly.', 'Pueblo pequeño, cielo enorme. Una galería que respira, un cine bajo las estrellas, una banda en un loto flotante. Dejé de quejarme. Casi.'), c.t('La Finca’s the gateway. Everyone arrives there confused. Some of us never left.', 'La Finca es la entrada. Todos llegan confundidos. Algunos nunca nos fuimos.')] },
      { id: 'self', kw: ['who are you', 'about you', 'yourself', 'alien', 'zil', 'where are you from', 'quien eres', 'de donde', 'extraterrestre'], say: c => [c.t('Zil. Bartender, philosopher, reluctant landlord’s cousin. I came through a portal for a weekend. That was eleven years ago.', 'Zil. Camarero, filósofo, primo reacio del casero. Vine por un portal a pasar un finde. Hace once años.'), c.t('Three hearts, one opinion. Usually a strong one.', 'Tres corazones, una opinión. Normalmente fuerte.')] },
      { id: 'quest', kw: ['favor', 'favour', 'errand', 'quest', 'task', 'help you', 'mission', 'recado', 'mision', 'tarea', 'ayudarte'], say(c) {
        if (c.q('bissap_luma') === 'done') return [c.t('You already saved Luma from dehydration. Hero of the hibiscus.', 'Ya salvaste a Luma de la deshidratación. Héroe del hibisco.')];
        if (c.q('bissap_luma') === 'active') return [c.t(c.has('bissap') ? 'You’ve got the bissap. Go, Luma’s in the Gallery Gardens.' : 'Bissap kiosk is by the gallery path. Buy one, bring it to Luma.', c.has('bissap') ? 'Ya tienes el bissap. Ve, Luma está en los Jardines de la Galería.' : 'El quiosco de Bissap está junto a la galería. Compra uno y llévaselo a Luma.')];
        c.ask('quest'); return [c.t('Actually, yes. Luma’s been staring at paintings since sunrise and hasn’t drunk a thing. Grab a bissap from the kiosk and bring it to her? She tips. In credits and in gratitude.', 'Pues sí. Luma lleva mirando cuadros desde el amanecer sin beber nada. ¿Le compras un bissap en el quiosco y se lo llevas? Da propina. En créditos y en gratitud.')];
      } },
      { id: 'npcs', kw: ['luma', 'grakk', 'bongo', 'nix', 'friends', 'people', 'locals', 'amigos', 'gente'], say: c => [c.t('Luma talks to paintings and the paintings, I suspect, talk back. Grakk on Verdalux is slow but deep. Bongo in Jungle Dub could make a fridge feel the one-drop. Nix keeps sending me flyers from Astro-9.', 'Luma habla con los cuadros y creo que los cuadros le contestan. Grakk en Verdalux es lento pero profundo. Bongo en Jungle Dub haría bailar el one-drop a una nevera. Nix me manda flyers desde Astro-9.')] },
      { id: 'news', kw: ['news', 'new', 'gossip', 'happening', 'whats up', 'novedad', 'noticias', 'chisme', 'que pasa', 'que hay'], say: c => { const n = (AV.S.news || [])[0]; return [n ? c.t('Word around the bar: ' + n, 'Se comenta en la barra: ' + n) : c.t('Nothing new. Someone hung lanterns in the gallery and called it a personality.', 'Nada nuevo. Alguien colgó farolillos en la galería y lo llamó personalidad.'), c.t('Rumour says the gallery will get more living paintings once the artist sends the files. I’ll believe it when the frames start dancing.', 'Dicen que la galería tendrá más pinturas vivas cuando el artista mande los archivos. Me lo creeré cuando bailen los marcos.')] } },
      { id: 'joke', kw: ['joke', 'funny', 'laugh', 'chiste', 'gracioso', 'reir'], say: c => [c.t('A gorilla walks into a bar. I say, “Why the long face?” He says, “I play upright bass, Zil.” …That’s it. That’s the joke.', 'Un gorila entra en un bar. Le digo: “¿Por qué esa cara?” Me dice: “Toco contrabajo, Zil.” …Ya. Ese es el chiste.'), c.t('How many aliens does it take to change a light bulb? None. We just move to a brighter galaxy.', '¿Cuántos extraterrestres hacen falta para cambiar una bombilla? Ninguno. Nos mudamos a una galaxia más luminosa.')] }
    ],
    answers: {
      job: { yes: c => ({ say: c.t('Then you’re hired. Walk behind the bar and press E to start a shift. Don’t make me regret this. Quickly.', 'Pues contratado. Ponte detrás de la barra y pulsa E para empezar el turno. No me hagas arrepentirme. Rápido.'), action: { type: 'offer_job', accepted: true } }), no: c => ({ say: c.t('Your loss. The offer stands whenever you stop being picky.', 'Tú te lo pierdes. La oferta sigue en pie cuando dejes de ser exigente.') }) },
      quest: { yes: c => ({ say: c.t('Great. Kiosk by the gallery path, six credits. Then find Luma near the frames.', 'Genial. Quiosco junto a la galería, seis créditos. Luego busca a Luma cerca de los marcos.'), action: { type: 'start_quest', id: 'bissap_luma' } }), no: c => ({ say: c.t('Fine. Luma will just slowly turn into a raisin. No pressure.', 'Vale. Luma se convertirá lentamente en una pasa. Sin presión.') }) }
    },
    chips: c => [!c.job ? [c.t('Any work?', '¿Hay trabajo?'), c.t('Do you have a job for me?', '¿Tienes trabajo para mí?')] : [c.t('Shift tips?', '¿Consejos del turno?'), c.t('How do shifts work?', '¿Cómo van los turnos?')],
      c.q('bissap_luma') ? [c.t('Menu?', '¿Carta?'), c.t('What drinks do you have?', '¿Qué bebidas tienes?')] : [c.t('Need a favor?', '¿Un favor?'), c.t('Can I do you a favor?', '¿Puedo hacerte un favor?')],
      [c.t('What’s new?', '¿Qué hay de nuevo?'), c.t('Any news around town?', '¿Alguna novedad en el pueblo?')], [c.t('The band?', '¿La banda?'), c.t('Tell me about the band', 'Háblame de la banda')], [c.t('Travel?', '¿Viajar?'), c.t('Where can I travel?', '¿A dónde puedo viajar?')]],
    barks: c => [c.t('Fresh Nebula Fizz! Tell your friends. Or don’t.', '¡Nebula Fizz recién hecha! Díselo a tus amigos. O no.'), c.t('Hey %n. The bar’s that way. Where it always is.', 'Ey %n. La barra está ahí. Donde siempre.'), c.t('Mushroom Mocha, now with 12% more forest.', 'Moca de Seta, ahora con un 12% más de bosque.')],
    fallback: c => [c.t('Hm. Interesting. Say more, or order something.', 'Mmm. Interesante. Cuéntame más o pide algo.'), c.t('I’ve heard weirder. Not this week though.', 'He oído cosas más raras. Esta semana no.'), c.t('Bold take. I’ll file it under “things said at bars”.', 'Atrevido. Lo archivo en “cosas dichas en un bar”.'), c.t('Try me on work, rent, the band, or the portals. I’m a bartender, not a search engine.', 'Pregúntame por trabajo, alquiler, la banda o los portales. Soy camarero, no un buscador.')]
  };

  /* ======================= LUMA — gallery guide, Ape Town ======================= */
  const luma = {
    name: 'Luma', title: ['gallery guide', 'guía de la galería'], col: '#c8a8ff',
    persona: 'Luma, a gentle, poetic gallery guide in Ape Town’s Gallery Gardens. Loves the Living Paintings by Ztonedape, speaks softly, notices small details, honest that some frames are still awaiting their artwork files.',
    look: { fur: 0xd8c8e8, shirt: 0x7a4ac8, hat: 0x3a2a5a },
    greet(c) {
      if (c.q('bissap_luma') === 'active' && c.has('bissap')) return [c.t('Is that… a bissap? For me? Oh, %n. Hand it over before I cry into the hibiscus.', '¿Eso es… un bissap? ¿Para mí? Ay, %n. Dámelo antes de que llore en el hibisco.')];
      if (c.q('gallery_walk') === 'active' && c.seen() >= 3) return [c.t('You’ve looked closely at three paintings. I can see it in your eyes — slightly more colourful.', 'Has mirado de cerca tres pinturas. Se te nota en los ojos: un poco más de color.')];
      if (c.met === 1) return [c.t('Welcome to the Gallery Gardens. The paintings here are alive — walk close and they move. I’m Luma. I keep them company.', 'Bienvenido a los Jardines de la Galería. Aquí las pinturas están vivas: acércate y se mueven. Soy Luma. Les hago compañía.')];
      if (c.did('painting')) return [c.t('I saw you standing with a painting earlier. That’s the whole secret, you know. Standing with them.', 'Te vi antes quieto frente a una pintura. Ese es todo el secreto: quedarse con ellas.')];
      return [c.t('Hello again, %n. The light is different today. So are the paintings.', 'Hola de nuevo, %n. La luz es distinta hoy. Las pinturas también.'), c.t('Shh — Banana Melt is at the dramatic part. Just kidding. It’s always the dramatic part.', 'Shh, Banana Melt está en la parte dramática. Es broma. Siempre es la parte dramática.')];
    },
    topics: [
      { id: 'paint', kw: ['painting', 'art', 'frame', 'gallery', 'living', 'video', 'pintura', 'arte', 'marco', 'galeria', 'cuadro'], say: c => { const ps = presentTitles(), p = ps.length ? pick(ps) : null; return [c.t('Walk close to a frame and it wakes up. Press E and it opens big, with sound. ' + (p ? 'Start with “' + p.title + '” — ' + (p.caption || 'it is a favourite.') : ''), 'Acércate a un marco y despierta. Pulsa E y se abre en grande, con sonido. ' + (p ? 'Empieza por “' + p.title + '”.' : '')), c.t('Eight frames move today. Seven wait, quietly, for their artwork file. A waiting frame is still a promise.', 'Hoy se mueven ocho marcos. Siete esperan en silencio el archivo de su obra. Un marco que espera sigue siendo una promesa.')] } },
      { id: 'artist', kw: ['artist', 'ztonedape', 'who made', 'painter', 'creator', 'artista', 'pintor', 'quien hizo'], say: c => [c.t('Ztonedape paints with rhythm. You can see the beat in the brushwork — the ice cream drips on the snare.', 'Ztonedape pinta con ritmo. Se ve el compás en la pincelada: el helado gotea sobre la caja.'), c.t('The artist is also the one with the bucket hat on the lotus stage. Making beats and paintings out of the same mushrooms, I think.', 'El artista es también el del gorro de pescador en el escenario de loto. Hace ritmos y cuadros con las mismas setas, creo.')] },
      { id: 'missing', kw: ['missing', 'empty', 'waiting', 'awaiting', 'plaque', 'grey', 'blank', 'falta', 'vacio', 'esperando', 'placa'], say: c => [c.t('Those plaques mark paintings that exist but haven’t arrived yet: Chill Rhythms, Harp Hop, Hazy Wonderland… When the files come, the frames will simply wake up.', 'Esas placas marcan pinturas que existen pero aún no han llegado: Chill Rhythms, Harp Hop, Hazy Wonderland… Cuando lleguen los archivos, los marcos despertarán.')] },
      { id: 'fav', kw: ['favorite', 'favourite', 'best', 'recommend', 'like most', 'favorita', 'mejor', 'recomiendas'], say(c) { c.ask('fav'); return [c.t('Mine changes with the weather. Today it’s Interdimensional Ice Cream. Which one stayed with you?', 'La mía cambia con el clima. Hoy es Interdimensional Ice Cream. ¿Cuál se quedó contigo?')] } },
      { id: 'quest', kw: ['help', 'favor', 'favour', 'task', 'quest', 'tour', 'walk', 'ayuda', 'tarea', 'mision', 'recorrido', 'paseo'], say(c) {
        if (c.q('gallery_walk') === 'done') return [c.t('You already did the gallery walk. You see more now; I can tell.', 'Ya hiciste el paseo por la galería. Ahora ves más; se nota.')];
        if (c.q('gallery_walk') === 'active') return [c.t('You’ve truly looked at ' + c.seen() + ' of 3 paintings. Open them with E, or stand close while they play.', 'Has mirado de verdad ' + c.seen() + ' de 3 pinturas. Ábrelas con E o quédate cerca mientras se mueven.')];
        c.ask('walk'); return [c.t('Would you do a slow gallery walk for me? Really look at three different living paintings — open them, or stand with them while they play. Then come tell me.', '¿Harías un paseo lento por la galería? Mira de verdad tres pinturas vivas distintas: ábrelas o quédate con ellas mientras se mueven. Luego vuelve y cuéntame.')];
      } },
      { id: 'music', kw: ['band', 'music', 'stage', 'concert', 'banda', 'musica', 'escenario'], say: c => [c.t('The Stone Ape Band plays on the floating lotus stage. Walk to the canal and turn your head — the sound is positional, it lives in a place.', 'La Stone Ape Band toca en el escenario de loto flotante. Camina al canal y gira la cabeza: el sonido vive en un lugar.')] },
      { id: 'cinema', kw: ['cinema', 'movie', 'film', 'screen', 'cine', 'pelicula', 'pantalla'], say: c => [c.t('The open-air cinema plays the painting shorts on its big screen. The full films are on their way; their titles wait in the programme.', 'El cine al aire libre proyecta los cortos en la pantalla grande. Las películas completas están de camino; sus títulos esperan en el programa.')] },
      { id: 'self', kw: ['who are you', 'about you', 'yourself', 'quien eres', 'sobre ti'], say: c => [c.t('Just Luma. I came for one exhibition and the paintings asked me to stay.', 'Solo Luma. Vine por una exposición y las pinturas me pidieron que me quedara.')] }
    ],
    answers: {
      fav: { other(c, msg) { const ps = presentTitles(), m = msg.toLowerCase(), hit = ps.find(p => p.title.toLowerCase().split(/[^a-z]+/).filter(w => w.length > 3).some(w => m.includes(w))); if (hit) { c.fact('favorite', hit.title); return { say: c.t('“' + hit.title + '”… yes. ' + (hit.caption || '') + ' I’ll remember that you chose it.', '“' + hit.title + '”… sí. Recordaré que elegiste esa.') } } return { say: c.t('I don’t know that one by name — but if it stayed with you, it counts.', 'No la conozco por ese nombre, pero si se quedó contigo, cuenta.') } } },
      walk: { yes: c => ({ say: c.t('Lovely. Three different paintings. Take your time; they’re not going anywhere. Well — they move, but they stay.', 'Precioso. Tres pinturas distintas. Tómate tu tiempo; no se van a ir. Bueno, se mueven, pero se quedan.'), action: { type: 'start_quest', id: 'gallery_walk' } }), no: c => ({ say: c.t('Another time, then. The paintings are patient.', 'Otro día, entonces. Las pinturas son pacientes.') }) }
    },
    chips: c => [[c.t('Paintings?', '¿Pinturas?'), c.t('Tell me about the paintings', 'Háblame de las pinturas')], [c.t('Your favorite?', '¿Tu favorita?'), c.t('Which painting is your favorite?', '¿Cuál es tu pintura favorita?')],
      c.q('gallery_walk') ? [c.t('Empty frames?', '¿Marcos vacíos?'), c.t('Why are some frames waiting?', '¿Por qué esperan algunos marcos?')] : [c.t('Can I help?', '¿Te ayudo?'), c.t('Can I help you with something?', '¿Te ayudo con algo?')], [c.t('The artist?', '¿El artista?'), c.t('Who is the artist?', '¿Quién es el artista?')]],
    barks: c => [c.t('Walk slowly. The paintings notice hurry.', 'Camina despacio. Las pinturas notan las prisas.'), c.t('That frame just blinked. I swear.', 'Ese marco acaba de parpadear. Lo juro.'), c.t('Come closer — they wake up for you.', 'Acércate, despiertan para ti.')],
    fallback: c => [c.t('Art is patient. Ask me about the paintings, the artist, or the band.', 'El arte es paciente. Pregúntame por las pinturas, el artista o la banda.'), c.t('Mm. Let’s look at something together instead. Any frame will do.', 'Mm. Mejor miremos algo juntos. Cualquier marco sirve.')]
  };

  /* ======================= GRAKK — keeper of the Drum Log, Verdalux (V0.8 voice kept) ======================= */
  const grk = {
    name: 'Grakk', title: ['keeper of the Drum Log', 'guardián del Tronco-Tambor'], col: '#7aff9a',
    persona: 'Grakk, an ancient mossy ape on the jungle moon Verdalux. Speaks slowly in calm riddles about moss, rhythm and roots. Keeper of the Drum Log, which pays 12 credits once per day.',
    look: { fur: 0x4a6a3a, shirt: 0x2a5a3a, hat: null },
    greet(c) {
      const d = (AV.S.mem.grk || {}).drums || 0;
      if (c.met <= 1) return [c.t('Mmm. A two-legged visitor. I am Grakk, keeper of the Drum Log. Speak slowly; my thoughts grow like moss.', 'Mmm. Un visitante de dos patas. Soy Grakk, guardián del Tronco-Tambor. Habla despacio; mis pensamientos crecen como el musgo.')];
      if (d) return [c.t('Back, drummer. The log remembers your ' + d + ' rhythms.', 'Volviste, tamborilero. El tronco recuerda tus ' + d + ' ritmos.')];
      return [c.t('The moss remembers you. Have you touched the Drum Log yet?', 'El musgo te recuerda. ¿Ya tocaste el Tronco-Tambor?')];
    },
    topics: [
      { id: 'drums', kw: ['drum', 'music', 'rhythm', 'beat', 'song', 'band', 'play', 'log', 'tambor', 'musica', 'ritmo', 'tocar', 'tronco'], say: c => { const d = (AV.S.mem.grk || {}).drums || 0; return [d ? c.t('You have played ' + d + ' times. The moss hums your tempo. Zil would call it “tuba-adjacent”.', 'Has tocado ' + d + ' veces. El musgo tararea tu tempo. Zil lo llamaría “casi tuba”.') : c.t('Press the log and the whole jungle answers. We have no word for “wrong note”, only “not yet”.', 'Golpea el tronco y toda la selva responde. No tenemos palabra para “nota equivocada”, solo “todavía no”.')] } },
      { id: 'job', kw: ['job', 'work', 'money', 'pay', 'credits', 'earn', 'trabajo', 'dinero', 'creditos', 'ganar'], say: c => [c.t('Play the Drum Log. The moss pays once per sun: twelve credits. Greedy drummers get only echoes.', 'Toca el Tronco-Tambor. El musgo paga una vez por sol: doce créditos. Los tamborileros codiciosos solo reciben ecos.')] },
      { id: 'travel', kw: ['portal', 'gate', 'town', 'home', 'zil', 'bar', 'back', 'return', 'travel', 'pipe', 'puerta', 'pueblo', 'casa', 'volver', 'pipa'], say: c => [c.t('The gate hums at the end of the old path. The Portal Pipe answers too. The bartender on the other side sends bad jokes through. We keep them.', 'La puerta zumba al final del viejo sendero. La Pipa-Portal también responde. El camarero del otro lado nos manda chistes malos. Los guardamos.')] },
      { id: 'moon', kw: ['planet', 'moon', 'verdalux', 'jungle', 'where', 'place', 'tree', 'glow', 'planeta', 'luna', 'selva', 'donde', 'arbol'], say: c => [c.t('Verdalux, a moon that listens. Glow-trees grow when travellers go away and come back. The jungle likes to be missed.', 'Verdalux, una luna que escucha. Los árboles luminosos crecen cuando los viajeros se van y vuelven. A la selva le gusta que la extrañen.')] },
      { id: 'beings', kw: ['human', 'ape', 'monkey', 'species', 'alien', 'humano', 'mono', 'especie'], say: c => [c.t('Two-legs talk before they listen. Ape-kin drum better. All are guests.', 'Los de dos patas hablan antes de escuchar. Los simios tocan mejor. Todos somos invitados.')] },
      { id: 'quest', kw: ['help', 'task', 'quest', 'teach', 'lesson', 'secret', 'ayuda', 'tarea', 'enseñ', 'leccion', 'secreto'], say(c) {
        const d = (AV.S.mem.grk || {}).drums || 0;
        if (c.q('moss_rhythm') === 'done') return [c.t('You learned the moss rhythm already. Now the forest learns yours.', 'Ya aprendiste el ritmo del musgo. Ahora la selva aprende el tuyo.')];
        if (c.q('moss_rhythm') === 'active') return [c.t(d >= 3 ? 'Three rhythms. Good. Speak to me again and I will tell you the secret of the roots.' : 'Three rhythms on the log. You have given ' + d + '. The moss is counting.', d >= 3 ? 'Tres ritmos. Bien. Háblame otra vez y te diré el secreto de las raíces.' : 'Tres ritmos en el tronco. Llevas ' + d + '. El musgo cuenta.')];
        c.ask('lesson'); return [c.t('A lesson? Play the log three times — any suns — and return. Will you?', '¿Una lección? Toca el tronco tres veces, en cualquier sol, y vuelve. ¿Lo harás?')];
      } },
      { id: 'rude', kw: ['stupid', 'terrible', 'bad', 'hate', 'boring', 'dumb', 'ugly', 'estupido', 'odio', 'aburrido', 'feo'], say: c => [c.t('Mmm. The moss disagrees. So do I. Play first, complain after.', 'Mmm. El musgo no está de acuerdo. Yo tampoco. Primero toca, luego quéjate.')] }
    ],
    answers: { lesson: { yes: c => ({ say: c.t('Good. The log is near. The moss is listening.', 'Bien. El tronco está cerca. El musgo escucha.'), action: { type: 'start_quest', id: 'moss_rhythm' } }), no: c => ({ say: c.t('Then sit. Sitting is also a rhythm. A slow one.', 'Entonces siéntate. Sentarse también es un ritmo. Uno lento.') }) } },
    chips: c => [[c.t('The drums?', '¿Los tambores?'), c.t('Tell me about the drums', 'Háblame de los tambores')], [c.t('Teach me', 'Enséñame'), c.t('Can you teach me something?', '¿Me enseñas algo?')], [c.t('Verdalux?', '¿Verdalux?'), c.t('What is this moon?', '¿Qué es esta luna?')], [c.t('Go home?', '¿Volver?'), c.t('How do I go back to town?', '¿Cómo vuelvo al pueblo?')]],
    barks: c => [c.t('Mmm… the moss hums.', 'Mmm… el musgo tararea.'), c.t('Slow feet, two-legs.', 'Pies lentos, dos patas.')],
    fallback: c => [c.t('Mmm. The moss is thinking. Ask me about the drums, the gate, or the trees.', 'Mmm. El musgo piensa. Pregúntame por los tambores, la puerta o los árboles.'), c.t('Slow words, two-legs. My thoughts grow like moss.', 'Palabras lentas, dos patas. Mis pensamientos crecen como el musgo.'), c.t('That question has no roots. Try another.', 'Esa pregunta no tiene raíces. Prueba otra.')]
  };

  /* ======================= BONGO — dub elder, Jungle Dub ======================= */
  const bongo = {
    name: 'Bongo', title: ['dub elder', 'anciano del dub'], col: '#e8c030',
    persona: 'Bongo, a laid-back, wise dub elder who runs the sound system in the Jungle Dub Party Planet. Talks about bass, roots, space and patience. Warm, unhurried, a little poetic.',
    look: { fur: 0x7a5a2a, shirt: 0x30c060, hat: 0xe8c030 },
    greet(c) {
      if (c.q('one_drop') === 'active' && c.did('one_drop') >= 3) return [c.t('Mi feel it from here — you found the one-drop three times. Come, come.', 'Lo siento desde aquí: encontraste el one-drop tres veces. Ven, ven.')];
      if (c.met === 1) return [c.t('Irie, traveller. This is Jungle Dub, where the bass has roots and the river keeps time. Me name Bongo.', 'Irie, viajero. Esto es Jungle Dub, donde el bajo tiene raíces y el río marca el tiempo. Me llamo Bongo.')];
      if (c.part === 'night') return [c.t('Night time is dub time, %n. The fireflies dem hold the hi-hat.', 'La noche es hora de dub, %n. Las luciérnagas llevan el charles.')];
      return [c.t('Welcome back, %n. Sound system still warm.', 'Bienvenido de vuelta, %n. El sistema de sonido sigue caliente.'), c.t('Ah, %n. Slow down, the bass takes its time.', 'Ah, %n. Despacio, el bajo se toma su tiempo.')];
    },
    topics: [
      { id: 'dub', kw: ['music', 'dub', 'bass', 'reggae', 'sound', 'system', 'speaker', 'echo', 'delay', 'musica', 'bajo', 'sonido', 'altavoz', 'eco'], say: c => [c.t('Stand near the sound system and feel the one-drop. The kick falls on the third beat — the first beat is silence, and silence is the heaviest sound.', 'Ponte cerca del sistema de sonido y siente el one-drop. El bombo cae en el tercer tiempo; el primero es silencio, y el silencio es el sonido más pesado.'), c.t('Dub is space. Take the song, remove what you don’t need, let the echo carry the rest. Delay is the only honest echo.', 'El dub es espacio. Toma la canción, quita lo que sobra y deja que el eco lleve el resto. El delay es el único eco honesto.')] },
      { id: 'village', kw: ['village', 'river', 'hut', 'bamboo', 'jungle', 'food', 'place', 'lagoon', 'aldea', 'rio', 'choza', 'bambu', 'selva', 'comida', 'laguna'], say: c => [c.t('Roots Village grows around the river. Bamboo huts, the river bar, the lagoon. More builders coming — the planet still a-grow.', 'La Aldea Raíces crece alrededor del río. Chozas de bambú, el bar del río, la laguna. Vienen más constructores: el planeta aún crece.')] },
      { id: 'travel', kw: ['portal', 'pipe', 'home', 'back', 'town', 'pipa', 'casa', 'volver', 'pueblo'], say: c => [c.t('The Portal Pipe take you home. Press P, breathe easy, choose Ape Town. Or walk through the gold arch.', 'La Pipa-Portal te lleva a casa. Pulsa P, respira tranquilo y elige Ape Town. O cruza el arco dorado.')] },
      { id: 'quest', kw: ['help', 'task', 'quest', 'teach', 'lesson', 'learn', 'ayuda', 'tarea', 'enseñ', 'aprender'], say(c) {
        if (c.q('one_drop') === 'done') return [c.t('You have the one-drop in you now. Can’t un-feel it.', 'Ya llevas el one-drop dentro. No se puede dejar de sentir.')];
        if (c.q('one_drop') === 'active') return [c.t('Go to the sound system and feel the drop: ' + c.did('one_drop') + ' of 3.', 'Ve al sistema de sonido y siente la caída: ' + c.did('one_drop') + ' de 3.')];
        c.ask('drop'); return [c.t('Want to learn the one-drop? Stand at the sound system and feel it three times. Then come back to Bongo.', '¿Quieres aprender el one-drop? Ponte en el sistema de sonido y siéntelo tres veces. Luego vuelve con Bongo.')];
      } },
      { id: 'self', kw: ['who are you', 'about you', 'yourself', 'elder', 'quien eres', 'anciano'], say: c => [c.t('Me just a man who listen to speakers for forty years. The speakers listen back now.', 'Solo soy alguien que lleva cuarenta años escuchando altavoces. Ahora ellos me escuchan a mí.')] }
    ],
    answers: { drop: { yes: c => ({ say: c.t('Bless. Sound system right there. Let it move you three times.', 'Bendiciones. El sistema está ahí. Deja que te mueva tres veces.'), action: { type: 'start_quest', id: 'one_drop' } }), no: c => ({ say: c.t('No rush. Bass waits for no one, but Bongo will.', 'Sin prisa. El bajo no espera a nadie, pero Bongo sí.') }) } },
    chips: c => [[c.t('Dub?', '¿Dub?'), c.t('Tell me about the music here', 'Háblame de la música de aquí')], [c.t('Teach me', 'Enséñame'), c.t('Can you teach me the one-drop?', '¿Me enseñas el one-drop?')], [c.t('The village?', '¿La aldea?'), c.t('What is this village?', '¿Qué es esta aldea?')], [c.t('Go home?', '¿Volver?'), c.t('How do I get back home?', '¿Cómo vuelvo a casa?')]],
    barks: c => [c.t('Bass inna di jungle!', '¡Bajo en la jungla!'), c.t('Feel it in your chest, not your ears.', 'Siéntelo en el pecho, no en los oídos.'), c.t('One… (silence)… DROP.', 'Uno… (silencio)… ¡CAE!')],
    fallback: c => [c.t('Mmm, slow down, the bass takes its time.', 'Mmm, despacio, el bajo se toma su tiempo.'), c.t('Ask me about dub, the village, or the one-drop.', 'Pregúntame por el dub, la aldea o el one-drop.')]
  };

  /* ======================= NIX — DJ, Astro-9 / Club Graviton ======================= */
  const nix = {
    name: 'Nix', title: ['Club Graviton DJ', 'DJ del Club Graviton'], col: '#7ff0ff',
    persona: 'Nix, an upbeat space DJ at Club Graviton on Astro-9. Talks fast, loves low gravity, synth arps and cosmic funk. The casino uses fictional Gravity Points only, never real money.',
    look: { fur: 0x7a4ad8, shirt: 0x2ad8c8, hat: 0x222244 },
    greet(c) {
      if (c.q('orbit_hop') === 'active' && c.did('big_jump')) return [c.t('WOW, I saw that hop from the booth! Come here, orbit champion.', '¡GUAU, vi ese salto desde la cabina! Ven aquí, campeón orbital.')];
      if (c.met === 1) return [c.t('Welcome aboard Astro-9! Gravity’s at 40% on the floor — don’t forget to bounce. I’m Nix, your captain of beats.', '¡Bienvenido a Astro-9! La gravedad está al 40% en la pista: no olvides rebotar. Soy Nix, capitán de los ritmos.')];
      if (c.did('slot')) return [c.t('Saw you at the slots. Remember: Gravity Points are pretend. Bouncing is real.', 'Te vi en las tragaperras. Recuerda: los Puntos de Gravedad son de mentira. Los rebotes son reales.')];
      return [c.t('%n! My favourite orbiter is back.', '¡%n! Mi orbitador favorito ha vuelto.'), c.t('Hey hey, %n. The arps are spinning, the floor is floating.', 'Ey ey, %n. Los arpegios giran, la pista flota.')];
    },
    topics: [
      { id: 'gravity', kw: ['gravity', 'float', 'jump', 'bounce', 'floor', 'dance', 'gravedad', 'flotar', 'saltar', 'rebotar', 'pista', 'bailar'], say: c => [c.t('The dance floor runs at 40% gravity. Jump and enjoy the hang time — your sneakers will thank you.', 'La pista funciona al 40% de gravedad. Salta y disfruta del tiempo en el aire: tus zapatillas te lo agradecerán.')] },
      { id: 'casino', kw: ['casino', 'points', 'slot', 'game', 'gamble', 'bet', 'puntos', 'tragaperras', 'juego', 'apuesta'], say: c => [c.t('The casino uses Gravity Points — fictional, free, they refill every new day. No credits, no real money, ever. You have ' + (AV.S.gp == null ? 100 : AV.S.gp) + ' GP.', 'El casino usa Puntos de Gravedad: ficticios, gratis, se recargan cada día. Nada de créditos ni dinero real. Tienes ' + (AV.S.gp == null ? 100 : AV.S.gp) + ' PG.')] },
      { id: 'music', kw: ['music', 'dj', 'techno', 'track', 'song', 'set', 'funk', 'musica', 'cancion', 'tema'], say: c => [c.t('Four on the floor, arps in orbit, a bassline that left the solar system. Cosmic funk, baby.', 'Cuatro por cuatro, arpegios en órbita, un bajo que salió del sistema solar. Funk cósmico.'), c.t('I sample pulsars. Don’t tell the pulsars.', 'Sampleo púlsares. No se lo digas a los púlsares.')] },
      { id: 'market', kw: ['market', 'bazaar', 'shop', 'buy', 'station', 'astro', 'mercado', 'bazar', 'tienda', 'comprar', 'estacion'], say: c => [c.t('Astro-9 is a market world — the bazaar decks, the observatory, Cinema 9. Builders are still bolting most of it together. The club opened first. Priorities!', 'Astro-9 es un mundo mercado: el bazar, el observatorio, el Cine 9. Los constructores aún lo están montando. El club abrió primero. ¡Prioridades!')] },
      { id: 'quest', kw: ['challenge', 'task', 'quest', 'help', 'game', 'reto', 'tarea', 'mision', 'ayuda'], say(c) {
        if (c.q('orbit_hop') === 'done') return [c.t('You’re already an orbit champion. Frame it.', 'Ya eres campeón orbital. Enmárcalo.')];
        if (c.q('orbit_hop') === 'active') return [c.t('Jump on the low-gravity floor and get at least 2.5 metres of air!', '¡Salta en la pista de poca gravedad y súbete al menos 2,5 metros!')];
        c.ask('hop'); return [c.t('Challenge: get 2.5 metres of air on the dance floor. Win 30 Gravity Points. You in?', 'Reto: súbete 2,5 metros en la pista. Ganas 30 Puntos de Gravedad. ¿Te apuntas?')];
      } },
      { id: 'self', kw: ['who are you', 'about you', 'yourself', 'quien eres'], say: c => [c.t('Nix! Born on a comet, raised on vinyl.', '¡Nix! Nacido en un cometa, criado con vinilos.')] }
    ],
    answers: { hop: { yes: c => ({ say: c.t('Yes! Floor’s right there. Space bar, my friend. Space. Bar.', '¡Sí! La pista está ahí. Barra espaciadora, amigo. Espacial.'), action: { type: 'start_quest', id: 'orbit_hop' } }), no: c => ({ say: c.t('Your loss, gravity-bound one.', 'Tú te lo pierdes, ser atado a la gravedad.') }) } },
    chips: c => [[c.t('Gravity?', '¿Gravedad?'), c.t('How does the gravity work?', '¿Cómo funciona la gravedad?')], [c.t('Challenge?', '¿Reto?'), c.t('Any challenge for me?', '¿Algún reto para mí?')], [c.t('Casino?', '¿Casino?'), c.t('How does the casino work?', '¿Cómo funciona el casino?')], [c.t('Astro-9?', '¿Astro-9?'), c.t('What is there to see on Astro-9?', '¿Qué hay que ver en Astro-9?')]],
    barks: c => [c.t('Bounce, bounce, orbit!', '¡Rebota, rebota, órbita!'), c.t('Gravity is just a suggestion here.', 'Aquí la gravedad es solo una sugerencia.'), c.t('This next one goes out to the asteroids.', 'La siguiente va para los asteroides.')],
    fallback: c => [c.t('The galaxy is loud tonight. Ask me about gravity, the casino, or a challenge!', 'La galaxia está ruidosa esta noche. ¡Pregúntame por la gravedad, el casino o un reto!')]
  };

  /* ======================= PIP — La Finca greeter & guide, Ape Town ======================= */
  const pip = {
    name: 'Pip', title: ['La Finca greeter', 'anfitriona de La Finca'], col: '#7ff0c8',
    persona: 'Pip, the cheerful young greeter at La Finca, the gateway of Ape Town. Knows every corner of town, gives directions, loves the waterfalls and the Stone Ape head. Bubbly, helpful, a little dramatic.',
    look: { fur: 0xb07a4a, shirt: 0x2ad8a8, hat: 0xff6ad5 },
    greet(c) {
      if (c.met === 1) return [c.t('Welcome to Ape Town! I’m Pip. Gateway, guide, glitter-in-chief. First time? Ask me where anything is!', '¡Bienvenido a Ape Town! Soy Pip. Puerta, guía y jefa del brillo. ¿Primera vez? ¡Pregúntame dónde está cualquier cosa!')];
      const r = c.recent(['travel']); if (r) return [c.t('Back through the portals! Did the multiverse treat you nicely?', '¡De vuelta por los portales! ¿Te trató bien el multiverso?')];
      return [c.t('Hey %n! Need directions? I know a shortcut to everything.', '¡Hola %n! ¿Necesitas indicaciones? Conozco un atajo a todo.'), c.t('%n! The waterfalls are extra sparkly today. Just saying.', '¡%n! Las cascadas brillan más hoy. Solo digo.')];
    },
    topics: [
      { id: 'where', kw: ['where', 'map', 'directions', 'lost', 'find', 'how do i get', 'donde', 'mapa', 'perdido', 'encontrar', 'como llego'], say: c => [c.t('From here: the lotus stage is straight ahead across the pond, the Circular Plaza beyond it, the cinema and Gallery Gardens up north, waterfalls and the Stone Ape to the north-west, Portal Grove and the crystals north-east. Or puff the Portal Pipe (P) — it has a “Places” list!', 'Desde aquí: el escenario de loto está al frente cruzando el estanque, la Plaza Circular detrás, el cine y los Jardines de la Galería al norte, las cascadas y el Simio de Piedra al noroeste, la Arboleda de Portales y los cristales al noreste. O dale a la Pipa-Portal (P): ¡tiene una lista de “Lugares”!')] },
      { id: 'falls', kw: ['waterfall', 'falls', 'stone ape', 'head', 'statue', 'cascada', 'simio de piedra', 'cabeza', 'estatua'], say: c => [c.t('The Stone Ape watches over the north-west waterfalls. Stand in front of him and listen — he only talks to people who are quiet first.', 'El Simio de Piedra vigila las cascadas del noroeste. Ponte delante y escucha: solo habla con quien primero guarda silencio.')] },
      { id: 'eat', kw: ['food', 'eat', 'hungry', 'cafe', 'restaurant', 'drink', 'comida', 'comer', 'hambre', 'restaurante', 'beber'], say: c => [c.t('Hungry? Sol’s Vegan Café is north-west of the plaza, the Food Café north-east, Zil pours drinks on the east side, and the Bissap kiosk is by the south-east canal.', '¿Hambre? El Café Vegano de Sol está al noroeste de la plaza, el Café de Comidas al noreste, Zil sirve bebidas en el lado este y el quiosco de Bissap junto al canal sureste.')] },
      { id: 'sleep', kw: ['sleep', 'rent', 'lodge', 'stay', 'hotel', 'house', 'dormir', 'alquiler', 'alojamiento', 'casa'], say: c => [c.t('La Muria village, up the hill in the north, has the eco-lodge. Ninety credits for three nights, view included.', 'La aldea de La Muria, en la colina del norte, tiene la eco-cabaña. Noventa créditos por tres noches, vistas incluidas.')] },
      { id: 'portal', kw: ['portal', 'pipe', 'travel', 'world', 'universe', 'pipa', 'viajar', 'mundo'], say: c => [c.t('Portal Grove is north-east: stone arches humming with other worlds. But honestly the Portal Pipe is faster. Press P!', 'La Arboleda de Portales está al noreste: arcos de piedra que zumban con otros mundos. Aunque la Pipa-Portal es más rápida. ¡Pulsa P!')] },
      { id: 'self', kw: ['who are you', 'about you', 'yourself', 'quien eres'], say: c => [c.t('I was the first ape to walk through La Finca. Nobody told me to stop greeting people, so I didn’t.', 'Fui la primera simia en cruzar La Finca. Nadie me dijo que dejara de saludar, así que no lo hice.')] }
    ],
    answers: {},
    chips: c => [[c.t('Directions?', '¿Indicaciones?'), c.t('Where is everything?', '¿Dónde está todo?')], [c.t('Food?', '¿Comida?'), c.t('Where can I eat?', '¿Dónde puedo comer?')], [c.t('Waterfalls?', '¿Cascadas?'), c.t('Tell me about the waterfalls', 'Háblame de las cascadas')], [c.t('Sleep?', '¿Dormir?'), c.t('Where can I stay?', '¿Dónde me puedo quedar?')]],
    barks: c => [c.t('Welcome to Ape Town! Map’s in your pipe!', '¡Bienvenido a Ape Town! ¡El mapa está en tu pipa!'), c.t('Lotus stage straight ahead — the band’s on!', '¡Escenario de loto al frente: la banda está tocando!'), c.t('Need directions? I’m basically a talking signpost.', '¿Indicaciones? Soy básicamente un cartel que habla.')],
    fallback: c => [c.t('Ooh, good question. Ask me where things are — that’s my superpower.', 'Uy, buena pregunta. Pregúntame dónde están las cosas: es mi superpoder.')]
  };

  /* ======================= SOL — Vegan Café cook, Ape Town ======================= */
  const sol = {
    name: 'Sol', title: ['Vegan Café cook', 'cocinera del Café Vegano'], col: '#ffe066',
    persona: 'Sol, the sunny cook of the Vegan Café in Ape Town. Talks about plants, colours and recipes, calm and generous, a bit of a garden mystic.',
    look: { fur: 0x9a6a3a, shirt: 0xffd84a, hat: 0x3aa04a },
    greet(c) {
      if (c.met === 1) return [c.t('Welcome, sunshine. I’m Sol. Everything here grew in the Botanical Garden this morning.', 'Bienvenido, solecito. Soy Sol. Todo lo de aquí creció esta mañana en el Jardín Botánico.')];
      if (c.recent(['food'])) return [c.t('How was the bowl? Your aura looks 12% more green.', '¿Qué tal el bol? Tu aura se ve un 12% más verde.')];
      return [c.t('Back for more colour, %n?', '¿Vuelves por más color, %n?'), c.t('Mm, %n. The mangoes were singing today.', 'Mm, %n. Hoy los mangos cantaban.')];
    },
    topics: [
      { id: 'menu', kw: ['menu', 'food', 'eat', 'bowl', 'hungry', 'vegan', 'dish', 'comida', 'comer', 'bol', 'hambre', 'vegano', 'plato'], say: c => [c.t('Today: Rainbow Bowl — seven colours, seven moods — eight credits at the counter. The mango-chili dressing is a little dramatic.', 'Hoy: Bol Arcoíris, siete colores, siete estados de ánimo, ocho créditos en el mostrador. El aliño de mango y chile es algo dramático.')] },
      { id: 'garden', kw: ['garden', 'plant', 'grow', 'botanical', 'flower', 'jardin', 'planta', 'crecer', 'botanico', 'flor'], say: c => [c.t('The gardens around town each grow a different world: jungle, desert, crystal, Asian bamboo. Walk them slowly and they talk back.', 'Cada jardín del pueblo cultiva un mundo distinto: selva, desierto, cristal, bambú asiático. Recórrelos despacio y te responden.')] },
      { id: 'recipe', kw: ['recipe', 'cook', 'secret', 'how do you', 'receta', 'cocinar', 'secreto'], say: c => [c.t('Secret? I cook to the bass from the lotus stage. Slow songs for soups, fast songs for salads.', '¿El secreto? Cocino al ritmo del bajo del escenario de loto. Canciones lentas para sopas, rápidas para ensaladas.')] },
      { id: 'self', kw: ['who are you', 'about you', 'yourself', 'quien eres'], say: c => [c.t('Sol. I used to be a sunflower. Long story. Very photosynthetic.', 'Sol. Antes era un girasol. Larga historia. Muy fotosintética.')] }
    ],
    answers: {},
    chips: c => [[c.t('Menu?', '¿Menú?'), c.t('What is on the menu?', '¿Qué hay en el menú?')], [c.t('Gardens?', '¿Jardines?'), c.t('Tell me about the gardens', 'Háblame de los jardines')], [c.t('Secret?', '¿Secreto?'), c.t('What is your secret recipe?', '¿Cuál es tu receta secreta?')]],
    barks: c => [c.t('Rainbow bowls, fresh from the garden!', '¡Boles arcoíris, recién salidos del jardín!'), c.t('Eat a colour you’ve never tried.', 'Come un color que nunca hayas probado.')],
    fallback: c => [c.t('Mm. Ask me about the menu, the gardens or my secret recipe.', 'Mm. Pregúntame por el menú, los jardines o mi receta secreta.')]
  };

  /* ======================= KIKO — market trader, Ape Town ======================= */
  const kiko = {
    name: 'Kiko', title: ['market trader', 'comerciante del mercado'], col: '#ff8a3a',
    persona: 'Kiko, a fast-talking, friendly market trader on Ape Town’s market lane by La Finca. Sells snacks, postcards and glow beads. Loves bargaining jokes but prices are fixed and fair.',
    look: { fur: 0x6a4a2a, shirt: 0xff8a3a, hat: 0x7a4ac8 },
    greet(c) {
      if (c.met === 1) return [c.t('Hey hey! Kiko’s stalls: snacks, postcards, glow beads. Fixed prices, unfixed smiles.', '¡Ey ey! Puestos de Kiko: snacks, postales, cuentas brillantes. Precios fijos, sonrisas libres.')];
      return [c.t('My favourite customer! Or second favourite. The parrot buys a lot.', '¡Mi cliente favorito! O el segundo. El loro compra mucho.'), c.t('%n! Back for beads?', '¡%n! ¿Vuelves por cuentas?')];
    },
    topics: [
      { id: 'sell', kw: ['sell', 'buy', 'shop', 'price', 'beads', 'postcard', 'snack', 'vender', 'comprar', 'tienda', 'precio', 'cuentas', 'postal'], say: c => [c.t('Mushroom crisps 4, Ape Town postcards 3, glow beads 5. Walk up to a stall and press E. No haggling — I tried once, lost my hat.', 'Chips de seta 4, postales de Ape Town 3, cuentas brillantes 5. Acércate a un puesto y pulsa E. Sin regateo: lo intenté una vez y perdí el sombrero.')] },
      { id: 'bargain', kw: ['discount', 'cheaper', 'deal', 'bargain', 'free', 'descuento', 'barato', 'rebaja', 'gratis'], say: c => [c.t('Discount? For you, special price: exactly the same price. With a wink.', '¿Descuento? Para ti, precio especial: exactamente el mismo. Con un guiño.')] },
      { id: 'gossip', kw: ['news', 'gossip', 'heard', 'rumour', 'rumor', 'chisme', 'noticias', 'oido'], say: c => [c.t('Word on the lane: Luma talks to the paintings, Zil secretly loves bissap, and the Stone Ape blinked last Tuesday.', 'Se dice en el mercado: Luma habla con los cuadros, Zil adora el bissap en secreto y el Simio de Piedra parpadeó el martes pasado.')] },
      { id: 'self', kw: ['who are you', 'about you', 'yourself', 'quien eres'], say: c => [c.t('Kiko! Born in a market, raised by a cart.', '¡Kiko! Nacido en un mercado, criado por un carrito.')] }
    ],
    answers: {},
    chips: c => [[c.t('What do you sell?', '¿Qué vendes?'), c.t('What do you sell?', '¿Qué vendes?')], [c.t('Discount?', '¿Descuento?'), c.t('Can I get a discount?', '¿Me haces descuento?')], [c.t('Gossip?', '¿Chismes?'), c.t('Any gossip?', '¿Algún chisme?')]],
    barks: c => [c.t('Glow beads! They glow! That’s the whole pitch!', '¡Cuentas brillantes! ¡Brillan! ¡Ese es todo el discurso!'), c.t('Postcards from Ape Town — send one to another universe!', '¡Postales de Ape Town: manda una a otro universo!')],
    fallback: c => [c.t('Ha! Ask me what I sell, or for gossip. I have plenty of both.', '¡Ja! Pregúntame qué vendo o por chismes. Tengo de los dos.')]
  };

  return { zil, luma, grk, bongo, nix, pip, sol, kiko };
})();

/* shared small talk, used by every NPC unless they define the same topic */
AV.NPC_COMMON = [
  { id: 'hello', kw: ['hi', 'hello', 'hey', 'yo', 'sup', 'hola', 'buenas', 'buenos dias', 'que tal', 'greetings'], greet: true },
  { id: 'howareyou', kw: ['how are you', 'how you doing', 'hows it going', 'como estas', 'que tal estas', 'como va'], say: c => [c.t('Can’t complain. Well, I can, but I won’t. You?', 'No me quejo. Bueno, podría, pero no. ¿Y tú?'), c.t('Good, good. Better now that someone asked.', 'Bien, bien. Mejor ahora que alguien pregunta.')] },
  { id: 'thanks', kw: ['thanks', 'thank you', 'cheers', 'gracias', 'te lo agradezco'], aff: 1, say: c => [c.t('Anytime, %n.', 'Cuando quieras, %n.'), c.t('Don’t mention it. Really, don’t. People will think I’m nice.', 'No hay de qué. En serio, no lo digas. Pensarán que soy amable.')] },
  { id: 'compliment', kw: ['cool', 'awesome', 'love you', 'great', 'amazing', 'nice', 'beautiful', 'genial', 'increible', 'bonito', 'precioso', 'te quiero', 'guay', 'mola'], aff: 1, say: c => [c.t('You’re making me blush. Under the fur.', 'Me haces sonrojar. Bajo el pelo.'), c.t('Flattery works on me. Noted, %n.', 'Los halagos funcionan conmigo. Anotado, %n.')] },
  { id: 'insult', kw: ['idiot', 'stupid', 'shut up', 'hate you', 'ugly', 'dumb', 'loser', 'idiota', 'estupido', 'callate', 'feo', 'tonto'], aff: -1, say: c => [c.t('Wow. Okay. I’ll pretend the portal smoke said that.', 'Vaya. Vale. Haré como que lo dijo el humo del portal.'), c.t('Rude. But I’ve heard worse from a parrot.', 'Grosero. Pero he oído cosas peores de un loro.')] },
  { id: 'bye', kw: ['bye', 'goodbye', 'see you', 'later', 'adios', 'hasta luego', 'nos vemos', 'chao'], say: c => [c.t('See you around, %n.', 'Nos vemos, %n.'), c.t('Go on, the universe won’t explore itself.', 'Venga, el universo no se va a explorar solo.')] },
  { id: 'whattodo', kw: ['what should i do', 'what to do', 'bored', 'help me', 'any tips', 'tips', 'what now', 'que hago', 'aburrido', 'consejo', 'ayudame', 'que puedo hacer'], say: c => { const s = []; if (!c.job) s.push(c.t('Zil’s Café is hiring', 'el Café de Zil busca gente')); if (!c.rent) s.push(c.t('rent the eco-lodge', 'alquila la eco-cabaña')); s.push(c.t('watch the open-air cinema', 'mira el cine al aire libre'), c.t('puff the Portal Pipe (P) and visit another world', 'dale a la Pipa-Portal (P) y visita otro mundo'), c.t('ask people for favours — some pay', 'pide favores a la gente: algunos pagan')); return [c.t('Ideas: ', 'Ideas: ') + s.join(', ') + '.'] } },
  { id: 'time', kw: ['what time', 'time is it', 'what day', 'que hora', 'que dia'], say: c => [c.t('Day ' + AV.S.day + ', around ' + String(Math.floor(AV.S.time / 60) % 24).padStart(2, '0') + ':' + String(Math.floor(AV.S.time % 60)).padStart(2, '0') + '. Time moves differently near portals.', 'Día ' + AV.S.day + ', sobre las ' + String(Math.floor(AV.S.time / 60) % 24).padStart(2, '0') + ':' + String(Math.floor(AV.S.time % 60)).padStart(2, '0') + '. El tiempo va distinto cerca de los portales.')] },
  { id: 'remember', kw: ['remember me', 'my name', 'who am i', 'te acuerdas', 'mi nombre', 'quien soy'], say: c => [c.n && c.hasName ? c.t('Of course. You’re %n. ' + (c.fact('favorite') ? 'You liked “' + c.fact('favorite') + '”, too.' : ''), 'Claro. Eres %n. ' + (c.fact('favorite') ? 'Y te gustó “' + c.fact('favorite') + '”.' : '')) : c.t('You haven’t told me your name yet. Try “my name is…”.', 'Aún no me has dicho tu nombre. Prueba con “me llamo…”.')] }
];
