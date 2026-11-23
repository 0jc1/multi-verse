/* APEVERSE V0.9.7 - js/beings.js : rigged, animated NPC families + quick social chats.
   Sculpted soft-body actors with a shared Idle / Walk / Dance / Wave API for ape, human, alien, robot, frog and spirit roles.
   Behaviours: wander (inside an area, avoiding colliders), dance (synced to the music beat), idle (turns to face you), float (zero-g).
   Talk with E: a quick pop-up with a context line (world, time of day, festival mode, weather, music, your state) + 3 replies.
   Performance: animation pauses beyond 45 m and bodies hide beyond 90 m; counts and sculpt detail scale with quality. */
'use strict';
(function (AV) {
const tr = AV.tr, TAU = AV.TAU, F = AV.forge, BE = AV.beings = { list: [] };
const pick = (r, a) => a[Math.floor(r() * a.length) % a.length];

const ALIEN_SKINS = ['#86d0b4', '#b07aff', '#7ab8ff', '#e88ad8', '#a8e86a', '#ffb05a'];
const SHIRTS = ['#ff4ad2', '#ffd84a', '#3ad8ff', '#7aff8a', '#ff8a3a', '#e83a30', '#ffffff', '#2a2a3a', '#8a3ab8', '#2a6ad8'];

/* ---------- build one being ----------
   Every species is a soft-body character now: humans + apes via chars_soft.js C.softActor (realistic townsfolk /
   chimp villager builds, spring-bone jiggle, IK feet), aliens via chars_real.js C.alienActor (sculpted Zib / Orbo
    builds with spring-bone belly, cranium and antennae). */
BE.make = function (kind, seed, over, opt) {
  const softOK = AV.chars && (AV.chars.softActor || AV.chars.alienActor);
  if (!softOK || ((kind === 'human' || kind === 'ape') && !AV.chars.softActor) || ((kind !== 'human' && kind !== 'ape') && !AV.chars.alienActor))
    throw new Error('Ambient NPCs require the soft-body character pipeline');
  /* humans + apes, soft body (chars_soft.js C.softActor) */
  if (softOK && (kind === 'human' || kind === 'ape') && AV.chars.softActor) {
    const m = AV.chars.softActor(kind, seed, { lod: opt.lod, shells: opt.shells, shadow: false, look: opt.look, dress: opt.dress, name: opt.name }); return { root: m.root, clips: [], actor: m.actor, name: m.name, kind, S: m.S };
  }
  /* every other species (alien, robot, frog, spirit) is a soft-body alien build too: sculpted Zib / Orbo bodies with
     spring-bone belly + antennae; the species stays readable through its colour palette and suit trim */
  if (softOK && kind !== 'human' && kind !== 'ape' && AV.chars.alienActor) {
    const rr = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(Math.max(1, (seed * 7919) | 0)), col = arr => pick(rr, arr), sc = .88 + rr() * .26;
    const A = AV.chars.alienActor({ type: rr() < .6 ? 'zib' : 'orbo', skin: col(ALIEN_SKINS), suit: col(SHIRTS), glow: col(['#7ff0ff', '#ff4ad2', '#ffd84a', '#7aff8a']), shadow: false });
    A.root.scale.setScalar(.9 + (sc - .88) * .75); const ch = A.st.K.legs.L;
    return { root: A.root, clips: [], actor: A, name: pick(rr, ['Zorp', 'Blixa', 'Quell', 'Mr. Nubs', 'Vexa', 'Trill', 'Grob', 'Yuzu-7']), kind, S: { thigh: Math.hypot(ch.hj[1] - ch.kn[1], ch.hj[2] - ch.kn[2]), shin: Math.hypot(ch.kn[1] - ch.an[1], ch.kn[2] - ch.an[2]) } };
  }
};

/* ---------- conversations: context lines + 3 quick replies (EN / ES) ---------- */
const L = (en, es) => [en, es];
const GREET = { ape: [L('Yo, ape to ape — respect.', 'Eh, de mono a mono: respeto.'), L('Bless up, bredda!', '¡Bendiciones, hermano!'), L('You smell like bananas and adventure.', 'Hueles a plátano y aventura.')],
  human: [L('Hey! Are you the ape from the posters?', '¡Hola! ¿Eres el mono de los carteles?'), L('Sawasdee! First time here?', '¡Sawasdee! ¿Primera vez por aquí?'), L('Nice fur. Very travel-friendly.', 'Buen pelo. Muy viajero.')],
  alien: [L('Greetings, carbon-based groover.', 'Saludos, bailarín de carbono.'), L('Your planet sends the best bass.', 'Tu planeta manda el mejor bajo.'), L('I have seven stomachs and all of them are hungry.', 'Tengo siete estómagos y todos tienen hambre.')],
  robot: [L('BEEP. Customer detected. Smile mode: ON.', 'BIP. Cliente detectado. Modo sonrisa: ACTIVADO.'), L('I am 87% sure you are fun.', 'Estoy 87% seguro de que eres divertido.'), L('Please do not lick the circuits.', 'Por favor, no lamas los circuitos.')],
  frog: [L('Ribbit. That means “hello” and also “nice shoes”.', 'Croac. Significa “hola” y también “bonitos zapatos”.'), L('I licked myself once. Saw the multiverse.', 'Una vez me lamí. Vi el multiverso.'), L('Pond life is chill, man.', 'La vida en el estanque es tranqui, tío.')],
  spirit: [L('You are a song the universe is humming.', 'Eres una canción que tararea el universo.'), L('We have met before. Next Tuesday.', 'Ya nos conocimos. El martes que viene.'), L('Colours have flavours here. Try purple.', 'Aquí los colores tienen sabor. Prueba el morado.')] };
const WEIRD = [L('There is a planet where the rain falls upwards and everyone carries umbrellas on their feet.', 'Hay un planeta donde la lluvia cae hacia arriba y todos llevan paraguas en los pies.'), L('The Portal Pipe was carved from a meteorite that hummed in B-flat.', 'La Pipa-Portal se talló de un meteorito que zumbaba en si bemol.'),
  L('Every vinyl in the Cave of Vinyls remembers who played it last.', 'Cada vinilo de la Cueva de los Vinilos recuerda quién lo pinchó por última vez.'), L('Club Graviton’s floor switched gravity off during the first bass drop and nobody ever switched it back.', 'El suelo del Club Graviton apagó la gravedad en el primer drop y nadie la volvió a encender.'),
  L('Geckos in Chiang Mai are secretly DJs. Listen at 3 a.m.', 'Los gecos de Chiang Mai son DJs en secreto. Escucha a las 3 de la mañana.'), L('My cousin tried to trade a moon for a mango. Bad deal. For the mango.', 'Mi primo intentó cambiar una luna por un mango. Mal trato. Para el mango.')];
function contextLine(b) {
  const W = AV.W, h = (AV.S.time / 60) % 24, fx = AV.fx, out = [];
  if (W && W.chatLines && W.chatLines.length) out.push(W.chatLines[Math.floor(Math.random() * W.chatLines.length)]);
  if (fx && fx.level('drink') > .35) out.push(L('Whoa, you’re wobbling. Water helps, trust me.', 'Uf, te tambaleas. El agua ayuda, créeme.'));
  if (fx && fx.level('smoke') > .3) out.push(L('Your eyes are doing the sunset thing. Nice.', 'Tus ojos hacen lo del atardecer. Guay.'));
  if (AV.vitals && AV.vitals.get().energy < 25) out.push(L('You look hungry. Go eat something, champ.', 'Pareces hambriento. Ve a comer algo, campeón.'));
  if (W && W.id === 'chiang_mai' && AV.S.cmMode === 'lantern') out.push(L('Make a wish and let your lantern go!', '¡Pide un deseo y suelta tu farolillo!'));
  if (W && W.id === 'chiang_mai' && AV.S.cmMode === 'songkran') out.push(L('Happy Songkran! You’re way too dry.', '¡Feliz Songkran! Estás demasiado seco.'));
  if (W && W.id === 'chiang_mai' && AV.S.cm && AV.S.cm.weather === 'rain') out.push(L('Rainy season vibes. Perfect for a Thai tea.', 'Ambiente de temporada de lluvias. Perfecto para un té tailandés.'));
  if (W && W.id === 'astro9' && AV.inZeroG) out.push(L('Zero gravity! Let your hair float!', '¡Gravedad cero! ¡Deja que tu pelo flote!'));
  const np = AV.audio && AV.audio.nowPlaying && AV.audio.nowPlaying(); if (np && np.playing) out.push(L('This tune — “' + np.title + '” — is my jam.', 'Este tema —“' + np.title + '”— me encanta.'));
  if (W && W.chatLines && W.chatLines.length) { const cl = W.chatLines; out.unshift(cl[Math.floor(Math.random() * cl.length)]) }   /* V0.9.9: world-specific memories / lore */
  out.push(h < 6 ? L('Up late? The best things happen after 3 a.m.', '¿Despierto tan tarde? Lo mejor pasa después de las 3.') : h < 11 ? L('Good morning! Breakfast is the most cosmic meal.', '¡Buenos días! El desayuno es la comida más cósmica.') : h < 18 ? L('Lovely afternoon for wandering.', 'Bonita tarde para pasear.') : L('Evening! Everything glows a bit more now.', '¡Buenas noches! Ahora todo brilla un poco más.'));
  return out[Math.floor(Math.random() * Math.min(out.length, 3))];
}
function hint() {
  const W = AV.W, pl = (W && W.places) || [], q = AV.quests && AV.quests.active ? AV.quests.active() : [];
  if (q && q.length) return L('Didn’t you promise someone something? “' + (q[0].title || q[0]) + '”…', '¿No le prometiste algo a alguien? “' + (q[0].title || q[0]) + '”…');
  if (pl.length) { const p = pl[Math.floor(Math.random() * pl.length)], n = Array.isArray(p.name) ? p.name : [p.name, p.name]; return L('Have you been to ' + n[0] + ' yet? Worth it.', '¿Ya fuiste a ' + n[1] + '? Merece la pena.') }
  return L('Follow the music. It always knows the way.', 'Sigue la música. Siempre sabe el camino.');
}
BE.chatOpen = () => AV.modals.some(m => m.id === 'cmp');
BE.chat = function (b) {
  const say = l => AV.tr(l[0], l[1]), g = b.greet || GREET[b.kind] || GREET.human, first = say(g[Math.floor(Math.random() * g.length)]) + ' ' + say(contextLine(b));
  b.play('Wave', .25); b.talkT = AV.now(); if (b.actor) b.actor.talk(2.6);
  const p = AV.panel('cmp', '<b>' + b.name + '</b><div class="note" id="bln">' + first + '</div><div class="grid">' +
    '<button data-r="w">' + (b.lines ? tr('What’s your story?', '¿Cuál es tu historia?') : tr('Tell me something weird', 'Cuéntame algo raro') )+ '</button><button data-r="t">' + tr('Any tips around here?', '¿Algún consejo por aquí?') + '</button><button data-r="j">' + tr('Dance with me!', '¡Baila conmigo!') + '</button><button data-close>' + tr('Catch you later', 'Nos vemos') + '</button></div>');
  /* lock the view onto their face while the pop-up is open (they keep facing you, see BE.spawn update) */
  BE.talkTo = b; const v = new THREE.Vector3();
  AV.focus = () => { if (BE.talkTo !== b || !BE.chatOpen()) return null; if (b.headB) b.headB.getWorldPosition(v).y += b.faceY; else v.copy(b.h.position).y += 1.6; return v };
  p.querySelectorAll('[data-r]').forEach(x => x.onclick = () => { const k = x.dataset.r, el = AV.$('bln');
    if (k === 'w') { const pool = b.lines || WEIRD; el.textContent = say(pool[Math.floor(Math.random() * pool.length)]) }
    else if (k === 't') el.textContent = say(hint());
    if (b.actor && k !== 'j') b.actor.talk(2.2);
    else { el.textContent = say(L('Yesss! Show me your moves!', '¡Síii! ¡Enséñame tus pasos!')); b.danceUntil = AV.now() + 12; b.play('Dance', .3); AV.vitals && AV.vitals.add(0, 6) }
    AV.dlg && AV.dlg.event && AV.dlg.event('chat') });
};

/* ---------- spawn + behaviours ---------- */
BE.spawn = function (ctx, specs) {
  const W = () => AV.W, out = [], shadow = false;   /* V0.9.8: no shadow pass for crowds (halves their draw calls) */
  specs.forEach((s, i) => {
    /* soft bodies everywhere, every species, every quality level */
    const made = BE.make(s.kind, (s.seed || 1) * 31 + i * 7 + ctx.id.length, s.over, { soft: true, lod: s.lod != null ? s.lod : ctx.q === 0 ? undefined : true,   /* V1.1: a spawn entry can ask for the coarser sculpt (s.lod) */ shells: ctx.q === 2 ? 6 : 0, look: s.look, dress: s.dress, name: s.name }), A = made.actor, h = new THREE.Group(); h.position.set(s.x, s.y0 != null ? s.y0 : (s.y || 0), s.z);   /* y0: start height on terrain (not a float offset) */ h.rotation.y = s.yaw || 0; ctx.group.add(h);
    if (!A) F.dress(made.root, { shadow }).forEach(m => { if (m.userData.glowBase && AV.gfx) AV.gfx.reg(ctx, m, 'glow', m.userData.glowK) }); h.add(made.root);
    const mixer = A ? A.mixer : new THREE.AnimationMixer(made.root), acts = A ? A.acts : {}; if (!A) made.clips.forEach(c => acts[c.name] = mixer.clipAction(c));
    if (A && s.mode === 'float') A.air = true;   // zero g: legs dangle instead of planting
    const b = { h, mixer, acts, cur: null, kind: s.kind, name: s.name || made.name, mode: s.mode || 'wander', area: s.area || { x: s.x, z: s.z, r: 8 }, speed: s.speed || (.8 + Math.random() * .5), stride: 4 * (made.S.thigh + made.S.shin) * Math.sin(F.WALK_SWING), fy: s.y || 0, target: null, wait: Math.random() * 3, danceUntil: 0, talkT: -99, off: Math.random() * 10,
      greet: s.greet || null, lines: s.lines || null, role: s.role || null,
      headB: made.root.getObjectByName('head') || null, faceY: A ? A.faceY * made.root.scale.y : ((made.S && made.S.head && made.S.head[1]) || .15) * .85, actor: A || null };
    b.play = (n, f) => { if (A) { A.play(n); b.cur = A.cur; return } if (b.cur === n || !acts[n]) return; const nx = acts[n], old = b.cur && acts[b.cur]; nx.reset(); nx.setEffectiveWeight(1); nx.play(); if (old) { if (f) nx.crossFadeFrom(old, f, false); else old.stop() } b.cur = n };
    b.play(b.mode === 'dance' || b.mode === 'float' ? 'Dance' : 'Idle');
    const tg = { x: s.x, z: s.z, r: 2.4, label: () => tr('Talk to ', 'Hablar con ') + b.name, fn: () => BE.chat(b), being: b, show: () => !b.ko }; ctx.T.push(tg); b.tg = tg;
    out.push(b);
  });
  const turn = (a, t, k) => a + Math.atan2(Math.sin(t - a), Math.cos(t - a)) * Math.min(1, k);
  ctx.upd.push((dt, t) => {
    const P = AV.P, on = AV.audio && AV.audio.on && (AV.audio.ok || (AV.audio.track && AV.audio.track.active)), beat = on && AV.audio.beat ? AV.audio.beat : t * 2.07, w = W();
    for (const b of out) {
      const dx = P.x - b.h.position.x, dz = P.z - b.h.position.z, d = Math.hypot(dx, dz); b.h.visible = d < 90; if (d > 45) continue;
      if (b.ko) { b.mixer.update(dt); continue }   // knocked down: punch.js owns the holder until they get up
      const locked = BE.talkTo === b && BE.chatOpen() && AV.now() >= b.danceUntil, talking = locked || (AV.now() - b.talkT < 6 && d < 6);
      if (b.actor) b.actor.root.userData.chatting = locked;   // soft body: snap its gaze onto you during the chat
      if (talking) { b.h.rotation.y = turn(b.h.rotation.y, Math.atan2(dx, dz), dt * (locked ? 9 : 5)); if (b.cur === 'Wave' && AV.now() - b.talkT > 2.2) b.play('Idle', .3) }
      else if (b.mode === 'dance' || b.mode === 'float' || AV.now() < b.danceUntil) { b.play('Dance', .3); const a = b.acts.Dance; if (a && a.getEffectiveWeight() > .99) a.time = ((((beat + b.off * .25) % 4) + 4) % 4) / 4 * a.getClip().duration; if (b.mode === 'float') b.h.position.y = b.fy + Math.sin(t * .6 + b.off) * .35; if (AV.now() >= b.danceUntil && b.mode === 'wander') b.play('Idle', .3) }
      else if (b.mode === 'idle') { b.play('Idle', .3); if (d < 4) b.h.rotation.y = turn(b.h.rotation.y, Math.atan2(dx, dz), dt * 2) }
      else {   /* wander */
        if (!b.target) { b.wait -= dt; b.play('Idle', .4); if (b.wait <= 0 && w) { for (let k = 0; k < 8; k++) { const a = Math.random() * TAU, r = Math.sqrt(Math.random()) * b.area.r, x = b.area.x + Math.cos(a) * r, z = b.area.z + Math.sin(a) * r; if (AV.isFree(w, x, z, .7)) { b.target = [x, z]; break } } b.wait = 4 + Math.random() * 8 } }
        else { const tx = b.target[0] - b.h.position.x, tz = b.target[1] - b.h.position.z, l = Math.hypot(tx, tz); if (l < .3) { b.target = null } else { b.play('Walk', .3); if (b.acts.Walk) b.acts.Walk.timeScale = b.speed / b.stride; const st = Math.min(l, b.speed * dt), nx = b.h.position.x + tx / l * st, nz = b.h.position.z + tz / l * st;
          if (w && !AV.isFree(w, nx, nz, .45)) b.target = null; else { b.h.position.x = nx; b.h.position.z = nz; const sy = w && w.surface(nx, nz); b.h.position.y = (sy || 0) + (b.fy || 0); b.h.rotation.y = turn(b.h.rotation.y, Math.atan2(tx, tz), dt * 6) } } }
      }
      if (!b.tgFixed) { b.tg.x = b.h.position.x; b.tg.z = b.h.position.z } b.mixer.update(dt);   /* V1.0: counter staff keep their target at the counter front */
    }
  });
  ctx.leave.push(() => out.forEach(b => { b.mixer.stopAllAction(); b.h.traverse(o => { if (o.isSkinnedMesh && o.skeleton) o.skeleton.dispose() }) }));
  BE.list = out; return out;
};
/* how many beings a world gets on each quality preset */
BE.n = (ctx, lo, mid, hi) => [lo, mid, hi][ctx.q];
})(window.AV);
