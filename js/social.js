/* APEVERSE - social.js : Living Playground milestone 4 — continuous four-choice conversations, friendships, spontaneous encounters.
   Every crowd character (AV.beings, every world) now talks through this: after each reply you get FOUR fresh choices, built from
   the character's personality and job, the world, its places and lore, the time of day, the music playing, what you hold, your
   relationship and what you did together before. No paid AI: this is a finite procedural system (templates + state), it does not
   pretend to be a language model. Topics already used in a conversation are not offered again; jokes and stories don't repeat.
   Relationships (saved in AV.S.soc, per world + name): stranger → acquaintance → friend → close friend. They change dialogue and
   invitations only, never access to anything. Invitations lead into REAL activities: basketball (AV.act hoops), photo mode, a round
   of drinks (credits + item), a walk to a place, a jam (notes + vibe). Strangers sometimes come up to you (cooldowns, conditions). */
'use strict';
(function (AV) {
const tr = AV.tr, $ = AV.$, BE = AV.beings; if (!BE) return;
const L = (en, es) => [en, es], say = l => typeof l === 'string' ? l : tr(l[0], l[1]);
const pick = (a, r) => a[Math.floor((r ? r() : Math.random()) * a.length)];
const SO = AV.social = { cur: null };
const st = () => { const S = AV.S; S.soc = S.soc || {}; return S.soc };
const key = b => (AV.W ? AV.W.id : '?') + ':' + b.name;
const rec = b => { const s = st(), k = key(b); return s[k] = s[k] || { rel: 0, met: 0, facts: {}, done: [], shared: [], jokes: 0, stories: 0 } };
const TIERS = [[0, L('stranger', 'desconocido')], [3, L('acquaintance', 'conocido')], [8, L('friend', 'amigo')], [16, L('close friend', 'amigo íntimo')]];
SO.tier = r => { let t = 0; TIERS.forEach((x, i) => { if (r >= x[0]) t = i }); return t };
SO.tierName = r => say(TIERS[SO.tier(r)][1]);
const hearts = r => '♥'.repeat(SO.tier(r)) + '♡'.repeat(3 - SO.tier(r));

/* ---------- who they are (stable per world + name) ---------- */
const PERS = ['chill', 'curious', 'funny', 'grumpy', 'dreamy'];
const JOBS = {
  human: [L('backpacker on a long trip', 'mochilero en un viaje largo'), L('street-food cook', 'cocinero de comida callejera'), L('mural painter', 'pintor de murales'), L('bassist between bands', 'bajista entre bandas'), L('yoga teacher who hates mornings', 'profe de yoga que odia las mañanas'), L('photographer', 'fotógrafo'), L('DJ on the weekends', 'DJ los fines de semana')],
  ape: [L('drummer', 'batería'), L('banana farmer', 'cultivador de plátanos'), L('philosopher (self-declared)', 'filósofo (autodeclarado)'), L('tree surgeon', 'cirujano de árboles'), L('bartender', 'barman')],
  alien: [L('interstellar trader', 'comerciante interestelar'), L('cargo pilot', 'piloto de carga'), L('xeno-botanist', 'xenobotánico'), L('tourist from three galaxies over', 'turista de tres galaxias más allá'), L('sound engineer', 'ingeniero de sonido')],
  robot: [L('city guide unit', 'unidad guía de la ciudad'), L('retired vacuum cleaner', 'aspiradora jubilada')],
  frog: [L('pond mystic', 'místico del estanque')], spirit: [L('drifting memory', 'recuerdo errante')]
};
const FROM = [L('a little town on Verdalux', 'un pueblito de Verdalux'), L('Ape Town, born and raised', 'Ape Town, de toda la vida'), L('a moon you can’t pronounce', 'una luna impronunciable'), L('Chiang Mai, the old city', 'Chiang Mai, la ciudad vieja'), L('Vienna, back in the 2000s', 'Viena, allá por los 2000'), L('nowhere and everywhere', 'ningún sitio y todos'), L('the Jungle Dub lagoon', 'la laguna de Jungle Dub')];
function who(b) {
  if (b._who) return b._who; let h = 0; const k = key(b); for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) >>> 0; const r = () => (h = (h * 1664525 + 1013904223) >>> 0) / 4294967296;
  const kind = JOBS[b.kind] ? b.kind : 'human'; return b._who = { pers: PERS[Math.floor(r() * PERS.length)], job: pick(JOBS[kind], r), from: pick(FROM, r), loves: pick(['music', 'food', 'sport', 'art', 'night'], r) };
}

/* ---------- context ---------- */
const hour = () => (AV.S.time / 60) % 24;
const daypart = () => { const h = hour(); return h < 6 ? 'late' : h < 11 ? 'morning' : h < 18 ? 'day' : 'evening' };
const placeName = p => Array.isArray(p.name) ? say(p.name) : p.name;
const hoopsVenue = () => AV.act && AV.act.venues && AV.act.venues.find(v => v.type === 'hoops');
const heldItem = () => AV.S.bag && AV.S.bag.eq && AV.ITEMS[AV.S.bag.eq] ? AV.S.bag.eq : null;
const itemName = id => { const d = AV.ITEMS[id]; return d ? say(d.n) : id };
const playing = () => { const np = AV.audio && AV.audio.nowPlaying && AV.audio.nowPlaying(); return np && np.playing ? np.title : null };

/* personality flavour on any reply */
const TONE = { chill: [L('', ''), L(' No rush.', ' Sin prisa.'), L(' Easy.', ' Tranqui.')], curious: [L(' Why do you ask?', ' ¿Por qué lo preguntas?'), L(' Fascinating, right?', ' Fascinante, ¿no?'), L('', '')], funny: [L(' Ha!', ' ¡Ja!'), L(' (snorts)', ' (resopla)'), L('', '')], grumpy: [L(' Hmph.', ' Hmph.'), L(' Whatever.', ' Lo que sea.'), L('', '')], dreamy: [L(' …like a song.', ' …como una canción.'), L(' Everything is connected.', ' Todo está conectado.'), L('', '')] };
const tone = w => say(pick(TONE[w.pers]));

const JOKES = [L('Why did the alien leave the party? Bad atmosphere.', '¿Por qué el alien se fue de la fiesta? Mala atmósfera.'), L('I tried to catch fog yesterday. Mist.', 'Ayer intenté atrapar la niebla. Fallé… era bruma.'), L('A gorilla walks into a bar. The bar walks out.', 'Un gorila entra en un bar. El bar se va.'), L('What do you call a sleeping DJ? A beat-nap.', '¿Cómo llamas a un DJ dormido? Un beat-siesta.'), L('My plants and I have an agreement: they grow, I talk.', 'Mis plantas y yo tenemos un trato: ellas crecen, yo hablo.'), L('I told my tuk-tuk a joke. It cracked up at the next corner.', 'Le conté un chiste a mi tuk-tuk. Se partió en la siguiente esquina.'), L('Time flies like an arrow. Fruit flies like a banana.', 'El tiempo vuela como una flecha. Las moscas de la fruta, como un plátano.')];
const STORIES = [L('Once a portal opened in my kitchen. I made soup for three confused astronauts.', 'Una vez se abrió un portal en mi cocina. Hice sopa para tres astronautas confundidos.'), L('I danced so long at a full-moon party that the sun asked me to leave.', 'Bailé tanto en una fiesta de luna llena que el sol me pidió que me fuera.'), L('My grandmother swam across a river with a cassette player on her head. Never stopped the music.', 'Mi abuela cruzó un río a nado con un radiocasete en la cabeza. Nunca paró la música.'), L('I once lost a bet and had to carry a watermelon through three worlds.', 'Una vez perdí una apuesta y tuve que llevar una sandía por tres mundos.'), L('The Stone Ape Band played my birthday once. By accident. They thought it was a soundcheck.', 'La Stone Ape Band tocó en mi cumpleaños una vez. Por accidente. Creían que era una prueba de sonido.'), L('I met my best friend arguing over the last mango sticky rice. We split it. Ten years now.', 'Conocí a mi mejor amigo discutiendo por el último mango con arroz. Lo compartimos. Diez años ya.')];

/* ======================= the engine ======================= */
/* an option: { k: topic key, label: [en,es], go(c) -> reply [en,es] (may set c.ask to an NPC question), rel: delta } */
function topicPool(c) {
  const b = c.b, w = who(b), R = c.r, W = AV.W, tier = SO.tier(R.rel), out = [], held = heldItem();
  const add = (k, label, go, o) => { if (c.used.has(k) || (o && o.when === false)) return; out.push(Object.assign({ k, label, go }, o || {})) };
  add('name', L('Who are you, anyway?', '¿Y tú quién eres?'), () => { R.facts.job = 1; return L('I’m ' + b.name + ', ' + w.job[0] + '.' + tone(w), 'Soy ' + b.name + ', ' + w.job[1] + '.' + tone(w)) }, { rel: 1, when: !R.facts.job });
  add('from', L('Where are you from?', '¿De dónde eres?'), () => { R.facts.from = 1; return L('From ' + w.from[0] + '. You?', 'De ' + w.from[1] + '. ¿Y tú?') }, { rel: 1, ask: 'from', when: !R.facts.from });
  add('job', L('How’s work going?', '¿Qué tal el trabajo?'), () => w.pers === 'grumpy' ? L('Being a ' + w.job[0] + ' is fine until people talk to me. …Not you. Mostly.', 'Ser ' + w.job[1] + ' está bien hasta que la gente me habla. …Tú no. Casi.') : L('Being a ' + w.job[0] + ' is the best job in the multiverse. Some days.', 'Ser ' + w.job[1] + ' es el mejor trabajo del multiverso. Algunos días.'), { rel: 1, when: !!R.facts.job });
  if (W && W.places && W.places.length) { const p = W.places[(c.n * 7 + R.met) % W.places.length]; add('place_' + p.id, L('What’s good around here?', '¿Qué hay de bueno por aquí?'), () => { c.tip = p; return L('Go to ' + placeName(p) + '. Trust me.' + tone(w), 'Ve a ' + placeName(p) + '. Hazme caso.' + tone(w)) }, { rel: 1 }) }
  if (W && W.chatLines && W.chatLines.length) add('lore', L('Tell me about this place.', 'Háblame de este sitio.'), () => pick(W.chatLines), { rel: 1 });
  add('music', L('What music are you into?', '¿Qué música te gusta?'), () => { const t = playing(); return t ? L('Right now? This — “' + t + '”. Listen to that bass.', '¿Ahora mismo? Esto: “' + t + '”. Escucha ese bajo.') : L('Dub, boom-bap, anything the Stone Ape Band touches.', 'Dub, boom-bap, todo lo que toca la Stone Ape Band.') }, { rel: 1, ask: 'plays' });
  add('day', L(daypart() === 'evening' ? 'Nice evening, huh?' : daypart() === 'late' ? 'Up late too?' : 'How’s your day going?', daypart() === 'evening' ? 'Buena noche, ¿eh?' : daypart() === 'late' ? '¿También despierto tan tarde?' : '¿Qué tal tu día?'), () => w.pers === 'grumpy' ? L('It was quiet. Then you came along. (half smile)', 'Estaba tranquilo. Luego llegaste tú. (media sonrisa)') : daypart() === 'late' ? L('The best ideas arrive after 3 a.m. Most are terrible.', 'Las mejores ideas llegan después de las 3. La mayoría son horribles.') : L('Better now. Good company helps.', 'Mejor ahora. La buena compañía ayuda.'), { rel: 1 });
  if (R.jokes < JOKES.length) add('joke', L('Tell me a joke.', 'Cuéntame un chiste.'), () => JOKES[(R.jokes++ + key(b).length) % JOKES.length], { rel: 1 });
  if (R.stories < STORIES.length) add('story', b.lines ? L('What’s your story?', '¿Cuál es tu historia?') : L('Got a good story?', '¿Tienes una buena historia?'), () => b.lines && R.stories < b.lines.length ? b.lines[R.stories++] : STORIES[(R.stories++ + key(b).length) % STORIES.length], { rel: 1 });
  add('style', L('I like your style.', 'Me gusta tu estilo.'), () => w.pers === 'grumpy' ? L('…Thanks. Don’t make it weird.', '…Gracias. No lo hagas raro.') : L('Aww! You’re alright, you know that?', '¡Oh! Eres buena gente, ¿lo sabías?'), { rel: 1 });
  if (held) add('share_' + held, L('Want some of my ' + itemName(held) + '?', '¿Quieres un poco de mi ' + itemName(held) + '?'), () => { const d = AV.ITEMS[held]; if (!d.keep) AV.bag.remove(held); R.shared.push('share'); return L('For me? That’s really kind. I won’t forget it.', '¿Para mí? Qué detalle. No lo olvidaré.') }, { rel: 3 });
  if (tier >= 1) add('intro', L('Know anyone interesting around here?', '¿Conoces a alguien interesante por aquí?'), () => { const o = others(b); if (!o) return L('Honestly? You’re the most interesting person here.', '¿Sinceramente? Tú eres lo más interesante de aquí.'); rec(o).rel += 1; return L('Go say hi to ' + o.name + ' — tell them I sent you. They’ll be nice.', 'Ve a saludar a ' + o.name + ': dile que vas de mi parte. Será amable.') }, { rel: 1 });
  if (tier >= 2) add('hang', L('We should hang out more.', 'Deberíamos quedar más.'), () => L('Deal. You’re one of my people now.', 'Trato hecho. Ya eres de los míos.'), { rel: 2 });
  if (R.shared.length) add('remember', L('Remember last time?', '¿Te acuerdas de la última vez?'), () => ({ hoops: L('The basketball! I still think that last shot was luck.', '¡El baloncesto! Sigo pensando que ese último tiro fue suerte.'), drinks: L('That round of drinks… legendary.', 'Aquella ronda… legendaria.'), photo: L('You took my photo! Send it to me. (You can’t. I know.)', '¡Me hiciste una foto! Mándamela. (No puedes, ya.)'), walk: L('Our little walk. I went back there the next day.', 'Nuestro paseo. Volví al día siguiente.'), jam: L('The jam! My hands still tap that rhythm.', '¡La jam! Mis manos aún marcan ese ritmo.'), share: L('You shared your snack with me. Rare.', 'Compartiste tu comida conmigo. Raro.') })[R.shared[R.shared.length - 1]], { rel: 1 });
  /* player-initiated invitations (they work: see INVITES) */
  if (hoopsVenue()) add('inv_hoops', L('Fancy shooting some hoops?', '¿Echamos unas canastas?'), null, { inv: 'hoops' });
  add('inv_drinks', L('Let me buy you a drink.', 'Te invito a algo.'), null, { inv: 'drinks' });
  add('inv_photo', L('Can I take your photo?', '¿Te puedo hacer una foto?'), null, { inv: 'photo' });
  if (c.tip) add('inv_walk', L('Show me ' + placeName(c.tip) + '?', '¿Me enseñas ' + placeName(c.tip) + '?'), null, { inv: 'walk' });
  if (w.loves === 'music' || b.kind === 'ape') add('inv_jam', L('Want to jam a little?', '¿Improvisamos un poco?'), null, { inv: 'jam' });
  return out;
}
/* NPC questions: when they ask, your four choices are answers */
const ASKS = {
  from: () => [[L('Ape Town.', 'Ape Town.'), L('Ape Town! Then you know the Lotus Stage. Respect.', '¡Ape Town! Entonces conoces el Escenario de Loto. Respeto.')], [L('Everywhere — I travel by pipe.', 'De todas partes: viajo en pipa.'), L('By pipe?! You’re one of THOSE travellers. I love it.', '¿¡En pipa!? Eres de ESOS viajeros. Me encanta.')], [L('It’s a secret.', 'Es un secreto.'), L('Mysterious. Fine, keep your secrets.', 'Misterioso. Vale, guárdate tus secretos.')], [L('Somewhere with better weather.', 'De un sitio con mejor clima.'), L('Ha! Everyone says that, wherever they are.', '¡Ja! Todos dicen eso, estén donde estén.')]],
  plays: () => [[L('I play a bit of bongo.', 'Toco un poco de bongó.'), L('Bongo! We need percussion at the next jam.', '¡Bongó! Necesitamos percusión en la próxima jam.')], [L('Only the air guitar.', 'Solo guitarra imaginaria.'), L('The most honest instrument there is.', 'El instrumento más honesto que existe.')], [L('I DJ sometimes.', 'A veces pincho.'), L('A DJ! Respect. Play something heavy next time.', '¡DJ! Respeto. La próxima pon algo fuerte.')], [L('I just listen.', 'Solo escucho.'), L('Listeners are underrated. Without you, it’s just noise.', 'A los oyentes se les infravalora. Sin vosotros, es solo ruido.')]]
};
function others(b) { const W = AV.W; if (!W) return null; const L2 = W.T.filter(t => t.being && t.being !== b && t.being.name).map(t => t.being); return L2.length ? pick(L2) : null }

/* choose four: answers to their question, or a varied mix (always at least one invitation once you get along) */
function choices(c) {
  if (c.ask && ASKS[c.ask]) { const a = ASKS[c.ask](); c.ask = null; return a.map((x, i) => ({ k: 'ans' + i, label: x[0], go: () => x[1], rel: 1, ans: true })) }
  const pool = topicPool(c), invs = pool.filter(o => o.inv), talk = pool.filter(o => !o.inv), out = [];
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] } return a };
  shuffle(talk); shuffle(invs);
  const wantInv = SO.tier(c.r.rel) >= 1 || c.n >= 3 ? 1 : 0;
  for (const o of talk) { if (out.length >= 4 - (wantInv && invs.length ? 1 : 0)) break; if (c.last && c.last.includes(o.k)) continue; out.push(o) }
  for (const o of invs) { if (out.length >= 4) break; out.push(o) }
  for (const o of talk.concat(invs)) { if (out.length >= 4) break; if (!out.includes(o)) out.push(o) }
  /* the pool never runs dry: fresh small-talk fillers */
  const FILL = [[L('So… what’s new?', 'Bueno… ¿qué hay de nuevo?'), L('New? I ate a fruit I can’t name. Delicious. Possibly illegal on two planets.', '¿Nuevo? Comí una fruta sin nombre. Deliciosa. Quizás ilegal en dos planetas.')], [L('What do you do for fun?', '¿Qué haces para divertirte?'), L('Long walks, loud music, bad decisions in moderation.', 'Paseos largos, música alta, malas decisiones con moderación.')], [L('Seen anything strange lately?', '¿Has visto algo raro últimamente?'), L('A frog wearing sunglasses. He nodded at me. We’re cool now.', 'Una rana con gafas de sol. Me saludó. Ahora somos colegas.')], [L('Best food you ever had?', '¿La mejor comida de tu vida?'), L('Street noodles at 4 a.m., sitting on a plastic stool. Unbeatable.', 'Fideos callejeros a las 4, en un taburete de plástico. Imbatible.')], [L('Do you believe in portals?', '¿Crees en los portales?'), L('Believe? I commute through one.', '¿Creer? Voy al trabajo a través de uno.')], [L('What would you change about this place?', '¿Qué cambiarías de este sitio?'), L('More benches. More music. Fewer people asking what I’d change.', 'Más bancos. Más música. Menos gente preguntando qué cambiaría.')]];
  let fi = c.n; while (out.length < 4) { const f = FILL[fi++ % FILL.length], k = 'fill' + (fi - 1) % FILL.length; if (c.used.has(k) && fi < c.n + FILL.length * 2) continue; out.push({ k, label: f[0], go: () => f[1], rel: 1 }) }
  return out.slice(0, 4);
}

/* ---------- invitations into real activities ---------- */
const INVITES = {
  hoops(c) { const v = hoopsVenue(); if (!v) return L('No court around here, sadly.', 'No hay cancha por aquí, por desgracia.');
    SO.close(); goTo(v.rack.x + 1.2, v.rack.z, Math.atan2(-(v.hoops[0].rim.x - v.rack.x), -(v.hoops[0].rim.z - v.rack.z)), () => { AV.act.start('hoops', { v, mode: 'casual' }); AV.toast(tr(c.b.name + ' watches from the side: “Show me what you’ve got!”', c.b.name + ' mira desde un lado: “¡Enséñame lo que sabes!”')) });
    return null },
  drinks(c) { const cost = 20; if (!AV.txn(-cost, 'A round with ' + c.b.name)) return L('Ah, you’re short on credits. Next time, my treat.', 'Vaya, te faltan créditos. La próxima invito yo.'); AV.bag.add('beer', 1, true); AV.fx && AV.fx.add('drink', .2); return L('Cheers! To new friends. (You got a beer for the road too.)', '¡Salud! Por los nuevos amigos. (Y te llevas una cerveza para el camino.)') },
  photo(c) { SO.close(); setTimeout(() => AV.act && AV.act.start('photo'), 80); AV.toast(tr(c.b.name + ' strikes a pose. Press click / F (or SNAP) to take the photo.', c.b.name + ' posa. Pulsa clic / F (o FOTO) para hacer la foto.')); return null },
  walk(c) { const p = c.tip; if (!p) return L('Let’s walk some other time.', 'Paseamos otro día.'); SO.close(); goTo(p.x, p.z, p.yaw || 0, () => AV.toast(tr('You walk with ' + c.b.name + ' to ' + placeName(p) + '. “See? Told you.”', 'Paseas con ' + c.b.name + ' hasta ' + placeName(p) + '. “¿Ves? Te lo dije.”'))); return null },
  jam(c) { const notes = [262, 330, 392, 440, 392, 330, 294, 262]; notes.forEach((f, i) => setTimeout(() => AV.audio && AV.audio.blip(f, .3, i % 2 ? 'triangle' : 'sine', .12), i * 220)); AV.vitals && AV.vitals.add(0, 8); c.b.danceUntil = AV.now() + 10; c.b.play && c.b.play('Dance', .3); return L('(you tap a rhythm, they hum along) …Yeah! That’s the groove!', '(marcas un ritmo y tararea contigo) …¡Sí! ¡Ese es el groove!') }
};
function goTo(x, z, yaw, then) { AV.fadeTo(1, 300); setTimeout(() => { const W = AV.W, s = AV.safeSpot(W, x, z); AV.P.x = s[0]; AV.P.z = s[1]; AV.P.y = W.surface(s[0], s[1]) || 0; AV.P.vx = AV.P.vz = 0; AV.P.yaw = yaw; AV.P.pitch = .05; AV.fadeTo(0, 300); then && then() }, 320) }

/* ---------- conversation panel ---------- */
SO.talk = function (b, opener) {
  const R = rec(b), w = who(b), first = R.met === 0; R.met++; R.last = AV.S.day;
  const c = SO.cur = { b, r: R, n: 0, used: new Set(), last: null, tip: null, ask: null, log: [] };
  b.play && b.play('Wave', .25); b.talkT = AV.now(); if (b.actor && b.actor.talk) b.actor.talk(2.6);
  BE.talkTo = b; const v = new THREE.Vector3(); AV.focus = () => { if (BE.talkTo !== b || !SO.cur) return null; if (b.headB) b.headB.getWorldPosition(v).y += b.faceY || 0; else v.copy(b.h.position).y += 1.6; return v };
  let hi;
  if (opener) hi = opener.line;
  else if (first) hi = w.pers === 'grumpy' ? L('Yeah? What?', '¿Sí? ¿Qué?') : w.pers === 'curious' ? L('Oh! A new face. Hi, I’m ' + b.name + '.', '¡Oh! Una cara nueva. Hola, soy ' + b.name + '.') : L('Hey there! I’m ' + b.name + '.', '¡Hola! Soy ' + b.name + '.');
  else { const m = R.shared.length ? R.shared[R.shared.length - 1] : null; hi = SO.tier(R.rel) >= 2 ? L('My friend! Good to see you again.' + (m === 'hoops' ? ' Rematch on the court soon?' : ''), '¡Amigo! Qué bien volver a verte.' + (m === 'hoops' ? ' ¿Revancha en la cancha pronto?' : '')) : L('Oh, it’s you again! Hi.', '¡Ah, eres tú otra vez! Hola.') }
  if (first) R.facts.name = 1;
  c.opener = opener || null; render(c, hi, opener ? opener.opts.map((o, i) => Object.assign({ k: 'open' + i }, o)) : choices(c));
  AV.dlg && AV.dlg.event && AV.dlg.event('chat');
};
function render(c, line, opts) {
  c.opts = opts; c.last = opts.map(o => o.k); c.line = say(line); c.log.push(c.line);
  const R = c.r, p = AV.panel('cmp', '<b>' + c.b.name + '</b> <small>' + hearts(R.rel) + ' ' + SO.tierName(R.rel) + '</small><div class="note" id="bln">' + c.line + '</div><div class="grid" id="socOpts">' +
    opts.map((o, i) => '<button data-s="' + i + '">' + (o.inv ? '✦ ' : '') + say(o.label) + '</button>').join('') + '</div><div class="row"><button data-close>' + tr('Leave', 'Salir') + '</button></div>', () => SO.close(true));
  p.querySelectorAll('[data-s]').forEach(x => x.onclick = () => SO.choose(+x.dataset.s));
}
SO.choose = function (i) {
  const c = SO.cur; if (!c) return; const o = c.opts[i]; if (!o) return; c.used.add(o.k); c.n++;
  let reply;
  if (o.inv) { reply = INVITES[o.inv](c); c.r.rel += 2; if (!c.r.shared.includes(o.inv)) c.r.shared.push(o.inv); else c.r.shared.push(o.inv); AV.relate && AV.relate(c.b.name, 2); if (reply === null) { AV.save(); return } }
  else { reply = o.go(c); c.r.rel += o.rel || 0; if (o.ask) c.ask = o.ask }
  if (o.after) o.after(c);
  /* sometimes THEY take the initiative: an invitation or a question */
  if (!c.ask && !o.inv && c.n >= 2 && Math.random() < .25 && SO.tier(c.r.rel) >= 1) { const inv = pick(Object.keys(INVITES).filter(k => k !== 'walk' || c.tip).filter(k => k !== 'hoops' || hoopsVenue()));
    const Q = { hoops: L('Hey — fancy some basketball?', 'Oye, ¿unas canastas?'), drinks: L('Want to grab a drink?', '¿Tomamos algo?'), photo: L('Take my photo?', '¿Me haces una foto?'), walk: L('Want me to show you around?', '¿Te enseño el sitio?'), jam: L('Shall we jam?', '¿Improvisamos?') }[inv];
    render(c, say(reply) + ' ' + say(Q), [{ k: 'acc_' + inv, label: L('Sure, let’s go!', '¡Claro, vamos!'), inv }, { k: 'later_' + inv, label: L('Maybe later.', 'Quizás luego.'), go: () => L('No worries. Offer stands.', 'Sin problema. La oferta sigue en pie.'), rel: 0 }].concat(choices(c).slice(0, 2))); AV.save(); return }
  if (c.b.actor && c.b.actor.talk) c.b.actor.talk(2.2); c.b.talkT = AV.now();
  render(c, reply, choices(c)); AV.save();
};
/* closing the panel any way (Leave, Esc) ends the conversation */
const cp0 = AV.closePanel; AV.closePanel = function (id) { const r = cp0.apply(this, arguments); if (id === 'cmp' && SO.cur && !SO._rendering) { const c = SO.cur; SO.cur = null; if (BE.talkTo === c.b) BE.talkTo = null } return r };
SO.close = function (fromPanel) { const c = SO.cur; SO.cur = null; if (BE.talkTo && c && BE.talkTo === c.b) BE.talkTo = null; if (!fromPanel && $('cmp').style.display === 'block') AV.closePanel('cmp') };
BE.chat = b => SO.talk(b);   /* every crowd character in every world now talks this way */

/* ======================= spontaneous encounters ======================= */
const ENC = {
  hoops: { when: () => !!hoopsVenue(), line: b => L('Hey! You look like you can ball. One game at the court?', '¡Eh! Tienes pinta de jugar. ¿Un partido en la cancha?'), inv: 'hoops' },
  directions: { when: () => AV.W && AV.W.places && AV.W.places.length > 2, line: b => { const p = pick(AV.W.places); SO._dir = p; return L('Excuse me — do you know which way ' + placeName(p) + ' is?', 'Perdona, ¿sabes por dónde queda ' + placeName(p) + '?') }, dir: true },
  photo: { when: () => true, line: b => L('Could you take a photo of me? It’s my first day in this world!', '¿Me haces una foto? ¡Es mi primer día en este mundo!'), inv: 'photo' },
  jam: { when: () => true, line: b => L('I’ve got a beat stuck in my head. Jam with me for a minute?', 'Tengo un ritmo metido en la cabeza. ¿Improvisas conmigo un minuto?'), inv: 'jam' },
  drinks: { when: () => true, line: b => L('You look thirsty. First round’s on you, second on me?', 'Tienes cara de sed. ¿La primera ronda la pagas tú y la segunda yo?'), inv: 'drinks' },
  party: { when: () => AV.W && AV.W.places && AV.W.places.length > 0 && hour() >= 18, line: b => { const p = pick(AV.W.places); SO._party = p; return L('Psst. There’s a hidden party tonight near ' + placeName(p) + '. Coming?', 'Psst. Esta noche hay una fiesta secreta cerca de ' + placeName(p) + '. ¿Vienes?') }, party: true }
};
function openerFor(type, b) {
  const e = ENC[type], line = e.line(b), opts = [];
  if (e.inv) opts.push({ label: L('Sure, let’s do it!', '¡Claro, vamos!'), inv: e.inv });
  if (e.dir) { const right = SO._dir, wrong = AV.W.places.filter(p => p !== right).slice(0, 2); [right].concat(wrong).sort(() => Math.random() - .5).forEach(p => opts.push(p === right ? { label: L('That way — I’ll show you.', 'Por ahí, te acompaño.'), go: () => { AV.txn(5, 'Tip for directions'); return L('Thank you!! Here, a little tip for your trouble. (+5)', '¡¡Gracias!! Toma, una propinita por la molestia. (+5)') }, rel: 3, after: c => { c.tip = right } } : { label: L('Try near ' + placeName(p) + '?', '¿Prueba cerca de ' + placeName(p) + '?'), go: () => L('Hmm, I just came from there… I’ll ask someone else. Thanks anyway!', 'Mmm, vengo de allí… Preguntaré a otro. ¡Gracias igual!'), rel: 0 })) }
  if (e.party) opts.push({ label: L('A secret party? I’m in!', '¿Fiesta secreta? ¡Me apunto!'), go: c => { c.tip = SO._party; return L('Follow the bass… see you there!', 'Sigue el bajo… ¡nos vemos allí!') }, rel: 2, after: c => { c.tip = SO._party } }, { label: L('Show me the way.', 'Enséñame el camino.'), inv: 'walk', pre: true });
  opts.push({ label: L('What’s your name first?', 'Primero, ¿cómo te llamas?'), go: () => L('I’m ' + b.name + '. Nice to meet you!', 'Soy ' + b.name + '. ¡Encantado!'), rel: 1 });
  opts.push({ label: L('Sorry, not right now.', 'Lo siento, ahora no.'), go: () => L('No problem! Maybe next time.', '¡Sin problema! Quizás la próxima.'), rel: 0 });
  while (opts.length < 4) opts.push({ label: L('Tell me more.', 'Cuéntame más.'), go: () => L('There’s not much more to tell — it’ll be fun!', 'No hay mucho más que contar: ¡será divertido!'), rel: 1 });
  return { line, opts: opts.slice(0, 4), type };
}
/* wrap openers so "Show me the way" to a party knows where */
const ch0 = SO.choose; SO.choose = function (i) { const c = SO.cur; if (c && c.opts[i] && c.opts[i].pre && SO._party) c.tip = SO._party; return ch0.call(this, i) };
let encNext = 60, encAcc = 0;
SO.trigger = function (type) {
  const W = AV.W; if (!W || AV.blocking() || (AV.act && AV.act.cur) || SO.cur) return false; const P = AV.P;
  const cand = W.T.filter(t => t.being && t.being.mode !== 'dance' && !t.being.encounter && Math.hypot(t.being.h.position.x - P.x, t.being.h.position.z - P.z) < 22).map(t => t.being);
  if (!cand.length) return false; const b = cand.sort((a, c2) => Math.hypot(a.h.position.x - P.x, a.h.position.z - P.z) - Math.hypot(c2.h.position.x - P.x, c2.h.position.z - P.z))[0];
  const types = Object.keys(ENC).filter(k => ENC[k].when()); const t = type && ENC[type] && ENC[type].when() ? type : pick(types); if (!t) return false;
  const op = openerFor(t, b); b.encounter = { until: AV.now() + 45, op };
  const tg = b.tg, l0 = tg.label, f0 = tg.fn; tg.label = () => '💬 ' + b.name + tr(' wants to talk!', ' quiere hablar contigo!'); tg.fn = () => { restore(); SO.talk(b, op) };
  const restore = () => { tg.label = l0; tg.fn = f0; b.encounter = null }; b.encounter.restore = restore;
  if (b.mode === 'wander') { b.browseUntil = 0; const dx = P.x - b.h.position.x, dz = P.z - b.h.position.z, d = Math.hypot(dx, dz) || 1; b.target = [P.x - dx / d * 1.6, P.z - dz / d * 1.6] }
  b.play && b.play('Wave', .25); b.talkT = AV.now() - 3;
  AV.toast(tr(b.name + ' waves at you: “' + say(op.line).slice(0, 60) + '…” (go over and press E)', b.name + ' te saluda: “' + say(op.line).slice(0, 60) + '…” (acércate y pulsa E)'));
  return b;
};
AV.frameFns.push(dt => {
  if (!AV.running || !AV.W) return; encAcc += dt; if (encAcc < 5) return; const step = encAcc; encAcc = 0;
  for (const t of AV.W.T) { const b = t.being; if (b && b.encounter && AV.now() > b.encounter.until) b.encounter.restore() }   // unanswered encounters expire
  if (AV.S.set.noEncounters) return; encNext -= step; if (encNext > 0) return; encNext = 150 + Math.random() * 150; SO.trigger();
});
/* settings: turn spontaneous encounters off */
const tog0 = AV.toggleSettings; AV.toggleSettings = function () { tog0(); const p = $('set'); if (!p || p.style.display !== 'block') return; const S = AV.S.set, close = p.querySelector('[data-close]'), d = document.createElement('p');
  d.innerHTML = '<label><input id="sEnc" type="checkbox" ' + (S.noEncounters ? '' : 'checked') + '> ' + tr('Strangers sometimes come up to talk', 'A veces se te acercan desconocidos a hablar') + '</label>'; p.insertBefore(d, close); $('sEnc').onchange = e => { S.noEncounters = !e.target.checked; AV.save() } };
})(window.AV);
