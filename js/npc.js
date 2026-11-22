/* APEVERSE V0.9.1 - npc.js : living NPCs + small quests.
   AV.npc.spawn(ctx, id, opts) -> body (chars.npc or custom), floating name tag, speech-bubble "barks" when you pass by,
   looks at you, gestures while talking, optional walking route. Talk target label stays "Talk to <Name>".
   AV.quests: tiny offline quest system. Rewards are paid ONLY here through AV.txn (never by dialogue text or AI output). */
'use strict';
(function (AV) {
const tr = AV.tr, K = AV.kit, TAU = AV.TAU;
const NP = AV.npc = {};

function bubbleTex(text) {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 192; const c = cv.getContext('2d');
  c.font = 'bold 30px "Segoe Print","Comic Sans MS",cursive'; const words = text.split(' '), lines = []; let l = '';
  for (const w of words) { const t = l ? l + ' ' + w : w; if (c.measureText(t).width > 440 && l) { lines.push(l); l = w } else l = t } lines.push(l); lines.length = Math.min(lines.length, 3);
  const h = 34 + lines.length * 38; c.fillStyle = 'rgba(255,250,240,.96)'; c.strokeStyle = '#3a1d4e'; c.lineWidth = 5;
  c.beginPath(); c.moveTo(40, 8); c.arcTo(504, 8, 504, h, 26); c.arcTo(504, h, 8, h, 26); c.lineTo(250, h); c.lineTo(226, h + 30); c.lineTo(214, h); c.arcTo(8, h, 8, 8, 26); c.arcTo(8, 8, 504, 8, 26); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#2a1238'; c.textAlign = 'center'; c.textBaseline = 'middle'; lines.forEach((s, i) => c.fillText(s, 256, 32 + i * 38));
  const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; return t;
}
function setBubble(n, text) { const m = n.bub.material; if (m.map) m.map.dispose(); m.map = bubbleTex(text); m.needsUpdate = true; n.bub.visible = true }

NP.spawn = function (ctx, id, o) {
  const N = AV.NPCS[id]; o = o || {}; const L = Object.assign({}, N.look, o.look || {}), H = o.H || (() => 0);
  const g = o.body || NP.softBody(id, L); g.position.set(o.x, o.y != null ? o.y : H(o.x, o.z), o.z); g.rotation.y = o.yaw || 0; if (o.scale) g.scale.setScalar(o.scale); ctx.group.add(g);
  const sc = o.scale || 1, human = !o.body && !!L.human, tag = K.tag(N.name, AV.ui === 'es' ? N.title[1] : N.title[0], N.col); tag.position.set(0, human ? 2.32 : 2.95, 0); tag.scale.multiplyScalar(1 / sc); g.add(tag);
  const bub = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false, fog: false })); bub.scale.set(3.0 / sc, 1.12 / sc, 1); bub.position.set(0, human ? 3.05 : 3.75, 0); bub.visible = false; bub.material.userData.lin = 1; g.add(bub);
  const n = { id, g, yaw: o.yaw || 0, tag, bub, path: o.path || null, pi: 0, walk: 0, pause: 0, barkT: 3 + Math.random() * 6, bubT: 0, near: false, H, arms: o.arms !== false, wantYaw: o.yaw || 0,
    speed: o.speed || 1.15, loop: o.loop !== false, lead: !!o.lead, anim: o.anim || null, onArrive: null, sitY: 0 };
  /* V0.9.4: walk a new route (loop or one-way, optional leading = waits for the player), callback on arrival */
  n.go = function (path, opt) { opt = opt || {}; n.path = path; n.pi = 0; n.pause = 0; n.loop = !!opt.loop; n.lead = !!opt.lead; n.speed = opt.speed || n.speed; n.onArrive = opt.onArrive || null; if (opt.yaw != null) n.yaw = opt.yaw };
  const tgt = { x: o.tx != null ? o.tx : o.x, z: o.tz != null ? o.tz : o.z, r: o.r || 3.2, label: () => tr('Talk to ', 'Hablar con ') + N.name, fn: () => AV.openChat(id), npc: n, show: () => !n.ko }; n.tgt = tgt; n.follow = o.tx == null;
  ctx.T.push(tgt);
  if (!ctx.npcList) { ctx.npcList = []; ctx.upd.push((dt, t) => update(ctx.npcList, dt, t)) }
  ctx.npcList.push(n); return n;
};
NP.bark = function (n, text) { setBubble(n, text); n.bubT = AV.now() + 4.5 };

/* soft-body body for every quest/story NPC (chars_soft.js / chars_real.js realistic rigs).
   Deterministic look per NPC id, seeded from data/npcs.js colours, so the cast stays recognisable
   while every body is the new soft-body build (spring jiggle, IK feet, cloth garments).
   Falls back to the classic C.npc() ape only if the realistic pipeline is not loaded at all. */
NP.softBody = function (id, L) {
  const C = AV.chars || {}, soft = C.softHuman && C.softLook;
  if (!soft) return C.npc(L.fur || 0x8a6a4a, L.shirt, L.hat);           // realistic pipeline missing: classic build
  if (L.human) { const g = C.softHuman(L.human); g.userData.npcLook = L; g.userData.human = true; return g }   // data-defined human look (data/npcs_worlds.js)
  let seed = 0; for (let i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) >>> 0;
  const pick = a => a[(seed = (seed * 2654435761 + 1013904223) >>> 0) % a.length];
  const isApe = !!L.fur;                                                // ape NPCs carry a fur colour, humans/apes from npcs_cm don't
  const o = {
    skin: isApe ? L.fur : pick([0xf0c8a8, 0xe0ac69, 0xd8a47a, 0xc68642, 0xa86a3c, 0x8d5524]),
    hair: pick([0x14100c, 0x2a1a10, 0x4a2c18, 0x7a5230, 0xd8b860, 0xb0b0b0]),
    style: pick(['short', 'messy', 'bun', 'long', 'cap', 'afro']),
    capCol: L.hat || 0x2a2a3a, eye: 0x4a2a10,
    shirt: { col: L.shirt == null ? 0xe8e4da : L.shirt },
    pants: { col: pick([0x3a3a52, 0x2c3a5a, 0x2a2a2c, 0x5a6a3a, 0xc8b088]) }
  };
  if (isApe) {                                                          // ape NPCs: chimp soft build, fur recoloured (same shape as chars_soft randomApe)
    o.sp = 'chimp'; o.fur = L.fur; o.skin = 0xc79a6e; o.style = undefined; o.hair = undefined; o.capCol = undefined;
    o.dark = new THREE.Color(L.fur).multiplyScalar(.45).getHex(); o.nail = 0xd8b090; o.tip = 0xffffff; o.eye = 0x6a3a14;
    o.strandF = 250; o.shells = 12; o.size = 1.0; o.shadow = true;
    o.shirt = { o: { loose: 1.04, sleeve: .55 }, col: L.shirt == null ? 0xe8e4da : L.shirt };
    o.pants = { o: { loose: 1.1 }, col: 0x3a3a52, kind: 'twill' };
    o.shoes = { o: {}, cols: [0x2a2a2c, 0xe8e4da, 0x2a2a2c, 0x5a5a62] };
    if (L.hat != null) o.hat = { style: 'kufi', cols: [L.hat, L.hat] };
  } else if (L.hat) o.capCol = L.hat;
  const g = C.softHuman(o);
  g.userData.npcLook = L;
  return g;
};

const lerp = (a, b, k) => a + (b - a) * k, wrap = a => Math.atan2(Math.sin(a), Math.cos(a)), clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const _m3 = new THREE.Matrix3(), _o = new THREE.Vector3(), _f = new THREE.Vector3();
/* world position between the NPC's eyes. Realistic rig: head bone + eye offset carried by the body (so talking nods don't shake the camera).
   Classic pivot bodies: the head pivot sits at eye level. */
NP.face = function (n, out) {
  const g = n.g, u = g.userData, st = u.st;
  if (st && st.R) {
    if (!n.eyeOff) { n.eyeOff = new THREE.Vector3(); if (st.eyes.length) { for (const e of st.eyes) n.eyeOff.add(e.position); n.eyeOff.multiplyScalar(1 / st.eyes.length) } }
    st.R.bones[st.I.head].getWorldPosition(out);
    return out.add(_o.copy(n.eyeOff).applyMatrix3(_m3.setFromMatrix4(g.matrixWorld)));
  }
  return (u.head || g).getWorldPosition(out);
};
/* the spawned NPC behind a chat id in the current world */
NP.find = function (who) { const W = AV.W; if (!W) return null; for (const t of W.T) if (t.npc && t.npc.id === who) return t.npc; return null };
function update(list, dt, t) {
  const P = AV.P, ch = AV.chat, red = AV.S.set.reduce;
  for (const n of list) {
    if (n.ko) continue;                                                            // knocked down: punch.js owns the body until they get up
    const g = n.g, u = g.userData, dx = P.x - g.position.x, dz = P.z - g.position.z, d = Math.hypot(dx, dz), talking = ch.open && ch.who === n.id;
    let moving = false;
    if (n.path && !talking && (d > 3.2 || n.lead) && !(n.lead && d > 14)) {     // a leading NPC waits when the player falls behind
      const tg = n.path[n.pi], ex = tg[0] - g.position.x, ez = tg[1] - g.position.z, el = Math.hypot(ex, ez);
      if (el < .35) { n.pause += dt; if (n.pause > (tg[2] == null ? (n.loop ? 2.5 : 0) : tg[2])) { n.pause = 0; if (n.pi + 1 >= n.path.length && !n.loop) { const cb = n.onArrive; n.path = null; n.onArrive = null; n.lead = false; if (tg[3] != null) n.yaw = tg[3]; if (cb) cb(n) } else n.pi = (n.pi + 1) % n.path.length } }
      else { const sp = Math.min(n.speed * dt, el); g.position.x += ex / el * sp; g.position.z += ez / el * sp; g.position.y = n.H(g.position.x, g.position.z); moving = true; n.wantYaw = Math.atan2(ex, ez) }
    }
    n.moving = moving;
    if (n.follow) { n.tgt.x = g.position.x; n.tgt.z = g.position.z }
    u.chatting = talking;                                                          // read by the realistic rig (chars_real brain) to lock its gaze on you
    const want = (d < 7 || talking) ? Math.atan2(dx, dz) : moving ? n.wantYaw : n.yaw; let dy = want - g.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); g.rotation.y += dy * Math.min(1, (talking ? 9 : moving ? 6 : 4) * dt);
    /* body animation */
    n.walk = moving ? n.walk + dt * 7.5 : n.walk; const sw = moving ? Math.sin(n.walk) : 0;
    u.lL.rotation.x = lerp(u.lL.rotation.x, sw * .55, .3); u.lR.rotation.x = lerp(u.lR.rotation.x, -sw * .55, .3);
    if (u.torso) u.torso.scale.y = (u.torso.userData.sy0 || (u.torso.userData.sy0 = u.torso.scale.y)) * (1 + Math.sin(t * 2.1 + g.id) * .012);
    const speaking = talking && AV.now() < ch.speakUntil;
    if (n.arms) {
      if (speaking && !red) { u.aR.rotation.x = lerp(u.aR.rotation.x, -.7 + Math.sin(t * 4.2) * .35, .2); u.aL.rotation.x = lerp(u.aL.rotation.x, -.25 + Math.sin(t * 3.1 + 1) * .15, .2) }
      else { u.aR.rotation.x = lerp(u.aR.rotation.x, -sw * .45 + Math.sin(t * 1.7 + g.position.z) * .05, .2); u.aL.rotation.x = lerp(u.aL.rotation.x, sw * .45, .2) }
    }
    n.nod = speaking && !red ? Math.sin(t * 8.5) * .07 : lerp(n.nod || 0, 0, .1);
    /* classic pivot bodies: the head itself tracks your eyes during a chat (the realistic rig does this in its own look-at solver) */
    let lookP = 0;
    if (!u.st && u.head) {
      const lk = n.lk || (n.lk = { y: 0, p: 0 }); let ty = 0, tp = 0;
      if (talking) { const cp = AV.cam.position; NP.face(n, _f); const hx = cp.x - _f.x, hz = cp.z - _f.z; ty = clamp(wrap(Math.atan2(hx, hz) - g.rotation.y), -1, 1); tp = clamp(Math.atan2(_f.y - cp.y, Math.hypot(hx, hz)), -.5, .5) }
      const k = 1 - Math.exp(-(talking ? 9 : 4) * dt); lk.y += (ty - lk.y) * k; lk.p += (tp - lk.p) * k;
      if (talking || Math.abs(lk.y) > .002) u.head.rotation.y = lk.y; lookP = lk.p;
    }
    u.head.rotation.x = n.nod + lookP; u.head.rotation.z = Math.sin(t * 1.4 + g.position.x) * .04;
    if (moving) g.position.y = n.H(g.position.x, g.position.z) + Math.abs(Math.sin(n.walk)) * .04;
    if (n.anim) n.anim(n, dt, t, d, talking, moving);                          // V0.9.4: character-specific actions (smoking, ukulele, pool...)
    /* tags + barks */
    n.tag.visible = d < 18 && !talking;
    if (d < 6.5 && !n.near && t > n.barkT && !AV.blocking()) { const N = AV.NPCS[n.id], c = { t: (en, es) => (AV.ui === 'es' ? es : en) }; const arr = N.barks ? N.barks(c) : []; if (arr.length) { NP.bark(n, arr[Math.random() * arr.length | 0].replace(/%n/g, AV.S.name || (AV.ui === 'es' ? 'forastero' : 'stranger'))); n.barkT = t + 35 + Math.random() * 25 } }
    n.near = d < 6.5; if (n.bub.visible && (AV.now() > n.bubT || talking)) n.bub.visible = false;
  }
}

/* ======================= quests ======================= */
const Q = AV.quests = {};
const QD = {
  bissap_luma: { giver: 'zil', turnIn: 'luma', title: ['Bissap for Luma', 'Bissap para Luma'], hint: ['Buy a bissap at the kiosk and bring it to Luma in the Gallery Gardens.', 'Compra un bissap en el quiosco y llévaselo a Luma en los Jardines de la Galería.'],
    ready: S => ((S.items || {}).bissap || 0) > 0, reward(S) { S.items.bissap--; AV.txn(12, 'Quest: bissap for Luma'); return tr('Luma sips, sighs, and tips you 12 credits.', 'Luma bebe, suspira y te da 12 créditos de propina.') } },
  gallery_walk: { giver: 'luma', turnIn: 'luma', title: ['A slow gallery walk', 'Un paseo lento por la galería'], hint: ['Really look at 3 different living paintings (open them, or stand close while they play), then talk to Luma.', 'Mira de verdad 3 pinturas vivas distintas (ábrelas o quédate cerca mientras se mueven) y habla con Luma.'],
    ready: () => Q.seenCount() >= 3, reward() { AV.txn(15, 'Quest: gallery walk'); return tr('Luma pays you 15 credits “for seeing properly”.', 'Luma te da 15 créditos “por mirar de verdad”.') } },
  moss_rhythm: { giver: 'grk', turnIn: 'grk', title: ['The moss rhythm', 'El ritmo del musgo'], hint: ['Play the Drum Log 3 times (any days), then talk to Grakk.', 'Toca el Tronco-Tambor 3 veces (cualquier día) y habla con Grakk.'],
    ready: S => ((S.mem.grk || {}).drums || 0) >= 3, reward() { AV.txn(10, 'Quest: moss rhythm'); return tr('Grakk: “Roots hear before leaves see.” He gives you 10 credits of moss-money.', 'Grakk: “Las raíces oyen antes de que las hojas vean.” Te da 10 créditos de musgo.') } },
  one_drop: { giver: 'bongo', turnIn: 'bongo', title: ['Feel the one-drop', 'Siente el one-drop'], hint: ['Feel the one-drop at the sound system 3 times, then talk to Bongo.', 'Siente el one-drop en el sistema de sonido 3 veces y habla con Bongo.'],
    ready: () => AV.dlg.did('one_drop') >= 3, reward() { AV.txn(10, 'Quest: one-drop'); return tr('Bongo laughs: “Now yuh have it.” +10 credits.', 'Bongo ríe: “Ahora sí lo tienes.” +10 créditos.') } },
  orbit_hop: { giver: 'nix', turnIn: 'nix', title: ['Orbit hop', 'Salto orbital'], hint: ['Jump at least 2.5 m high on the low-gravity dance floor, then talk to Nix.', 'Salta al menos 2,5 m en la pista de poca gravedad y habla con Nix.'],
    ready: () => AV.dlg.did('big_jump') >= 1, reward(S) { S.gp = (S.gp == null ? 100 : S.gp) + 30; return tr('Nix gives you 30 Gravity Points (fictional casino points).', 'Nix te da 30 Puntos de Gravedad (puntos ficticios del casino).') } },
  /* worlds beyond Ape Town (data/npcs_worlds.js). Progress is recorded with Q.mark(id, key) by the worlds, so it survives reloads. */
  glow_listen: { giver: 'vela', turnIn: 'vela', need: 3, prog: ['Glow-trees', 'Árboles luminosos'], title: ['Listen to the glow-trees', 'Escucha a los árboles luminosos'], hint: ['Press E under 3 different glow-trees on Verdalux, then talk to Vela.', 'Pulsa E bajo 3 árboles luminosos distintos de Verdalux y habla con Vela.'],
    ready: () => Q.progress('glow_listen') >= 3, reward() { AV.txn(10, 'Quest: glow-trees'); return tr('Vela beams: “They said you listen well.” +10 credits.', 'Vela sonríe: “Dicen que escuchas bien.” +10 créditos.') } },
  traveller_log: { giver: 'tuk', turnIn: 'tuk', need: 2, prog: ['Worlds logged', 'Mundos registrados'], title: ['The traveller’s logbook', 'El cuaderno del viajero'], hint: ['Visit 2 other worlds, then come back to Verdalux and talk to Old Tuk.', 'Visita otros 2 mundos y vuelve a Verdalux para hablar con el viejo Tuk.'],
    ready: () => Q.progress('traveller_log') >= 2, reward() { AV.txn(15, 'Quest: traveller’s logbook'); return tr('Old Tuk writes you into the logbook in ink. +15 credits.', 'El viejo Tuk te apunta en el cuaderno con tinta. +15 créditos.') } },
  station_tour: { giver: 'rook', turnIn: 'rook', need: 3, prog: ['Districts logged', 'Distritos registrados'], title: ['Station tour', 'Visita a la estación'], hint: ['Walk out to 3 of the 4 Astro-9 districts, then report to Captain Rook.', 'Camina hasta 3 de los 4 distritos de Astro-9 e informa a la capitana Rook.'],
    ready: () => Q.progress('station_tour') >= 3, reward() { AV.txn(15, 'Quest: station tour'); return tr('Captain Rook signs your clipboard. +15 credits.', 'La capitana Rook firma tu hoja. +15 créditos.') } },
  coconut_pearl: { giver: 'pearl', turnIn: 'pearl', title: ['Coconut for the stew', 'Coco para el guiso'], hint: ['Bring a fresh coconut to Auntie Pearl in Roots Village (the Lotus Lagoon bar sells them).', 'Lleva un coco fresco a la tía Pearl en la Aldea Roots (el bar de la Laguna del Loto los vende).'],
    ready: S => ((S.items || {}).coconut || 0) > 0, reward(S) { S.items.coconut--; AV.txn(14, 'Quest: coconut for the stew'); return tr('Auntie Pearl cracks the coconut into the pot and hugs you. +14 credits.', 'La tía Pearl echa el coco a la olla y te abraza. +14 créditos.') } },
  hidden_falls: { giver: 'tosh', turnIn: 'tosh', need: 1, title: ['Hidden Falls', 'La cascada escondida'], hint: ['Find Hidden Falls (south-west, behind the rocks), rest on the cushions, then talk to Riverman Tosh.', 'Encuentra la cascada escondida (al suroeste, tras las rocas), descansa en los cojines y habla con Tosh el barquero.'],
    ready: () => Q.progress('hidden_falls') >= 1, reward() { AV.txn(12, 'Quest: Hidden Falls'); return tr('Tosh nods slowly: “Still hums, eh?” +12 credits.', 'Tosh asiente despacio: “Sigue zumbando, ¿eh?” +12 créditos.') } }
};
Q.defs = QD;
Q.define = (id, def) => { QD[id] = def };                                       // V0.9.4: worlds add their own tasks (Chiang Mai)
const st = () => { const S = AV.S; S.quests = S.quests || {}; S.qd = S.qd || {}; S.items = S.items || {}; return S };
Q.canStart = (id, who) => !!QD[id] && QD[id].giver === who && !st().quests[id];
Q.start = function (id) { const S = st(); if (!QD[id] || S.quests[id]) return; S.quests[id] = 'active'; S.qd[id] = { seen: [], told: 0 }; AV.toast(tr('New task: ', 'Nueva tarea: ') + tr(QD[id].title[0], QD[id].title[1]) + ' — ' + tr(QD[id].hint[0], QD[id].hint[1])); AV.audio && AV.audio.blip(740, .2, 'triangle', .15); AV.save() };
Q.check = function () { const S = st(); for (const id in S.quests) { if (S.quests[id] !== 'active' || !QD[id].ready(S) || S.qd[id].told) continue; S.qd[id].told = 1; AV.toast(tr('Task ready: talk to ', 'Tarea lista: habla con ') + AV.NPCS[QD[id].turnIn].name + '.') } };
Q.onTalk = function (who) { const S = st(); for (const id in S.quests) { const d = QD[id]; if (S.quests[id] === 'active' && d.turnIn === who && d.ready(S)) { S.quests[id] = 'done'; const msg = d.reward(S); AV.toast(tr('Task complete: ', 'Tarea completada: ') + tr(d.title[0], d.title[1]) + '. ' + msg); AV.audio && AV.audio.blip(988, .3, 'triangle', .2); AV.save(); AV.hud() } } };
Q.notePainting = function (file) { const S = st(); if (S.quests.gallery_walk !== 'active') return; const s = S.qd.gallery_walk.seen; if (s.indexOf(file) < 0) { s.push(file); if (s.length <= 3) AV.toast(tr('Gallery walk: ', 'Paseo por la galería: ') + Math.min(3, s.length) + ' / 3'); Q.check() } };
Q.seenCount = () => { const S = st(); return (S.qd.gallery_walk && S.qd.gallery_walk.seen.length) || 0 };
/* generic progress for an active task: record a distinct key (a tree, a world, a district...) once */
Q.progress = id => { const d = st().qd[id]; return (d && d.seen && d.seen.length) || 0 };
Q.mark = function (id, key, lead) {             // lead = the world's own flavour text, shown in the same toast
  const S = st(), def = QD[id], on = def && S.quests[id] === 'active', d = on ? S.qd[id] || (S.qd[id] = { seen: [], told: 0 }) : null; if (d) d.seen = d.seen || [];
  if (!on || d.seen.indexOf(key) >= 0) { if (lead) AV.toast(lead); return }
  d.seen.push(key); const msg = lead ? [lead] : [];
  if (def.prog && def.need > 1 && d.seen.length <= def.need) msg.push(tr(def.prog[0], def.prog[1]) + ': ' + d.seen.length + ' / ' + def.need + '.');
  if (def.ready(S) && !d.told) { d.told = 1; msg.push(tr('Task ready: talk to ', 'Tarea lista: habla con ') + AV.NPCS[def.turnIn].name + '.') }
  if (msg.length) AV.toast(msg.join(' ')); AV.save(); Q.check();
};
Q.listHtml = function () {
  const S = st(), rows = Object.keys(S.quests).map(id => '<div>' + (S.quests[id] === 'done' ? '✔ ' : '◆ ') + tr(QD[id].title[0], QD[id].title[1]) + (S.quests[id] === 'done' ? '' : '<br><small style="opacity:.8">' + tr(QD[id].hint[0], QD[id].hint[1]) + '</small>') + '</div>');
  const items = Object.keys(S.items).filter(k => S.items[k] > 0).map(k => k + ' ×' + S.items[k]);
  return '<p><b>' + tr('Tasks', 'Tareas') + '</b></p>' + (rows.join('') || '<div style="opacity:.7">' + tr('None yet — ask people if they need a favour.', 'Ninguna todavía: pregunta a la gente si necesita un favor.') + '</div>') + '<p><b>' + tr('Items', 'Objetos') + '</b>: ' + (items.join(', ') || tr('none', 'ninguno')) + '</p>';
};
/* hook: lock the player's view onto the NPC's face for the conversation, and complete quests right after the NPC greets you */
const openChat0 = AV.openChat; AV.openChat = function (who) {
  openChat0(who); if (!(AV.chat.open && AV.chat.who === who)) return;
  const n = NP.find(who); if (n) { const v = new THREE.Vector3(); AV.focus = () => AV.chat.open && AV.chat.who === who ? NP.face(n, v) : null }
  setTimeout(() => Q.onTalk(who), 600);
};

/* Old Tuk's logbook: every other world you enter while the task is active */
const prevEnter = AV.onWorldEnter; AV.onWorldEnter = W => { if (prevEnter) prevEnter(W); if (W && W.id !== 'verdalux') Q.mark('traveller_log', W.id) };

/* high jump detector (orbit hop) */
let air = false;
AV.frameFns.push(() => { const W = AV.W; if (!W) return; const h = AV.P.y - (W.surface(AV.P.x, AV.P.z) || 0); if (h > 2.5 && !air) { air = true; AV.dlg.event('big_jump') } else if (AV.P.on) air = false });
})(window.AV);
