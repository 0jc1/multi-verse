/* APEVERSE V0.9.7 - js/beings.js : rigged, animated NPC families + quick social chats.
   One reusable 16-bone skeleton (same bone + clip names as the forge aliens: Idle / Walk / Dance / Wave) with species templates:
   ape, human, alien, robot, frog, spirit — each randomised in height, body shape, colours, clothing and accessories.
   Behaviours: wander (inside an area, avoiding colliders), dance (synced to the music beat), idle (turns to face you), float (zero-g).
   Talk with E: a quick pop-up with a context line (world, time of day, festival mode, weather, music, your state) + 3 replies.
   Performance: low-poly parts (~2–4k triangles per being), animation paused beyond 45 m, hidden beyond 90 m; counts scale with quality. */
'use strict';
(function (AV) {
const tr = AV.tr, TAU = AV.TAU, F = AV.forge, BE = AV.beings = { list: [] };
const V = (x, y, z) => new THREE.Vector3(x, y, z), lin = h => new THREE.Color(h).convertSRGBToLinear();
const SPH = new THREE.SphereGeometry(1, 12, 9), CYL = new THREE.CylinderGeometry(1, 1, 1, 9, 1, true), BOX = new THREE.BoxGeometry(1, 1, 1);
const pick = (r, a) => a[Math.floor(r() * a.length) % a.length];

/* ---------- species templates: proportions + palettes ---------- */
const SP = {
  ape:    { thigh: .32, shin: .3, spine: .17, chest: .3, neck: .07, uarm: .4, farm: .38, sh: .27, hw: .15, body: [.3, .3, .23], head: [.19, .19, .19], furs: ['#3a2a20', '#5a3a22', '#2a2a2a', '#7a4a2a', '#c8682a'], skins: ['#8a6650', '#6a4a3a', '#b0846a'] },
  human:  { thigh: .43, shin: .41, spine: .16, chest: .28, neck: .1, uarm: .3, farm: .28, sh: .2, hw: .1, body: [.17, .21, .12], head: [.115, .135, .125], skins: ['#f0c8a8', '#d8a47a', '#c8946a', '#8a5a3a', '#5a3a2a'], hairs: ['#14100c', '#4a2c18', '#d8b860', '#a83a1a', '#e8e0d0', '#ff4ad2'] },
  alien:  { thigh: .42, shin: .4, spine: .14, chest: .26, neck: .2, uarm: .32, farm: .3, sh: .2, hw: .1, body: [.15, .19, .12], head: [.26, .34, .27], skins: ['#86d0b4', '#b07aff', '#7ab8ff', '#e88ad8', '#a8e86a', '#ffb05a'] },
  robot:  { thigh: .38, shin: .36, spine: .16, chest: .3, neck: .06, uarm: .3, farm: .3, sh: .25, hw: .12, body: [.24, .24, .17], head: [.17, .15, .15], paints: ['#e8c040', '#3a8ad8', '#d8402a', '#e8e8f0', '#2aa87a'] },
  frog:   { thigh: .2, shin: .2, spine: .12, chest: .2, neck: .04, uarm: .2, farm: .2, sh: .24, hw: .15, body: [.3, .26, .26], head: [.3, .2, .26], skins: ['#4ac84a', '#2a9a6a', '#ff8a3a', '#3ab8e8', '#c8e83a'] },
  spirit: { thigh: .26, shin: .24, spine: .14, chest: .24, neck: .1, uarm: .28, farm: .26, sh: .2, hw: .1, body: [.22, .26, .2], head: [.22, .22, .22], skins: ['#7ff0ff', '#ff6ad5', '#ffd84a', '#b07aff'] }
};
const SHIRTS = ['#ff4ad2', '#ffd84a', '#3ad8ff', '#7aff8a', '#ff8a3a', '#e83a30', '#ffffff', '#2a2a3a', '#8a3ab8', '#2a6ad8'], PANTS = ['#2a3a6a', '#2a2a2a', '#c8b088', '#5a3a2a', '#3a6a3a', '#6a2a4a'];

/* ---------- build one being (SkinnedMesh) ----------
   opt.soft: aliens become soft-body characters (chars_real.js C.alienActor: sculpted Zib / Orbo builds with spring-bone belly,
   cranium and antennae, IK feet). They return { root, clips, actor } instead of a forge mesh; spawn() drives them the same way. */
BE.make = function (kind, seed, over, opt) {
  /* humans + apes, soft body (chars_soft.js C.softActor): the realistic townsfolk / chimp villager builds, same actor API as the aliens */
  if (opt && opt.soft && (kind === 'human' || kind === 'ape') && AV.chars.softActor) {
    const m = AV.chars.softActor(kind, seed, { lod: opt.lod, shells: opt.shells, shadow: false }); return { root: m.root, clips: [], actor: m.actor, name: m.name, kind, S: m.S };
  }
  const r = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(Math.max(1, (seed * 7919) | 0)), base = SP[kind] || SP.human, sc = .88 + r() * .26;
  const S = Object.assign({}, base); ['thigh', 'shin', 'uarm', 'farm', 'spine', 'chest'].forEach(k => S[k] = base[k] * sc); S.body = base.body.map(v => v * (.85 + r() * .35)); S.head = base.head.map(v => v * (.92 + r() * .16)); Object.assign(S, over || {}); S.hip = S.thigh + S.shin + .07;
  const B = {}, list = [], bone = (n, p, x, y, z) => { const b = new THREE.Bone(); b.name = n; b.position.set(x, y, z); if (p) B[p].add(b); B[n] = b; b.userData.i = list.length; list.push(b) };
  bone('root', null, 0, 0, 0); bone('hips', 'root', 0, S.hip, 0); bone('spine', 'hips', 0, S.spine, 0); bone('chest', 'spine', 0, S.chest, 0); bone('neck', 'chest', 0, .04, 0); bone('head', 'neck', 0, S.neck, 0);
  bone('antL', 'head', -.1, S.head[1] * .8, -.03); bone('antR', 'head', .1, S.head[1] * .8, -.03);
  for (const [sd, s] of [['L', -1], ['R', 1]]) { bone('uArm' + sd, 'chest', s * S.sh, -.02, 0); bone('fArm' + sd, 'uArm' + sd, 0, -S.uarm, 0); bone('thigh' + sd, 'hips', s * S.hw, -.03, 0); bone('shin' + sd, 'thigh' + sd, 0, -S.thigh, 0) }
  B.root.updateMatrixWorld(true);
  const wp = (n, x, y, z) => B[n].getWorldPosition(V(0, 0, 0)).add(V(x || 0, y || 0, z || 0)), parts = [], mats = [], MI = {};
  const M = (name, hex, o) => { const key = name + hex; if (MI[key] == null) { const m = new THREE.MeshStandardMaterial(Object.assign({ color: lin(hex), roughness: .6, metalness: 0 }, o || {})); m.name = name; m.skinning = true; MI[key] = mats.length; mats.push(m) } return MI[key] };
  const add = (g, b, mi, m) => parts.push({ g, bone: B[b].userData.i, mat: mi, m });
  const sph = (b, mi, p, s, rot) => add(SPH, b, mi, new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromEuler(new THREE.Euler(...(rot || [0, 0, 0]))), Array.isArray(s) ? V(...s) : V(s, s, s)));
  const box = (b, mi, p, s, rot) => add(BOX, b, mi, new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromEuler(new THREE.Euler(...(rot || [0, 0, 0]))), V(...s)));
  const seg = (b, mi, a, c, r0, r1) => { const d = c.clone().sub(a), L = d.length(), q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.clone().normalize()); add(CYL, b, mi, new THREE.Matrix4().compose(a.clone().add(d.multiplyScalar(.5)), q, V(1, L, 1)).multiply(new THREE.Matrix4().makeScale(1, 1, 1)).multiply(new THREE.Matrix4().compose(V(0, 0, 0), new THREE.Quaternion(), V(r0 * .5 + r1 * .5, 1, r0 * .5 + r1 * .5)))) };
  const limb = (mUp, mLo, mHand, mFoot, ape) => { for (const [sd, s] of [['L', -1], ['R', 1]]) {
    const sh = wp('uArm' + sd), el = wp('fArm' + sd), hd = wp('fArm' + sd, 0, -S.farm, 0); sph('uArm' + sd, mUp, sh, S.body[0] * .32); seg('uArm' + sd, mUp, sh, el, .055 * (ape ? 1.5 : 1), .045 * (ape ? 1.4 : 1)); sph('fArm' + sd, mLo, el, .045 * (ape ? 1.4 : 1)); seg('fArm' + sd, mLo, el, hd, .042 * (ape ? 1.4 : 1), .034 * (ape ? 1.3 : 1)); sph('fArm' + sd, mHand, hd.clone().add(V(0, -.04, .01)), ape ? [.06, .075, .045] : [.045, .06, .03]);
    const hp = wp('thigh' + sd), kn = wp('shin' + sd), an = wp('shin' + sd, 0, -S.shin, 0); seg('thigh' + sd, mUp === mLo ? mLo : MI.__pants != null ? MI.__pants : mLo, hp, kn, .075 * (ape ? 1.3 : 1), .06 * (ape ? 1.2 : 1)); sph('shin' + sd, MI.__pants != null ? MI.__pants : mLo, kn, .06 * (ape ? 1.2 : 1)); seg('shin' + sd, MI.__pants != null ? MI.__pants : mLo, kn, an.clone().add(V(0, .03, 0)), .055, .045);
    sph('shin' + sd, mFoot, an.clone().add(V(0, .035, .05)), ape ? [.07, .05, .13] : [.06, .045, .12]) } };
  const col = (arr) => pick(r, arr);
  let name = '';
  if (kind === 'ape') {
    const fur = M('fur', col(S.furs), { roughness: .95 }), skin = M('skin', col(S.skins), { roughness: .7 }), eye = M('eye', '#1a1008', { roughness: .1 }), outfit = r();
    sph('hips', fur, wp('hips', 0, .03, 0), [S.body[0] * .85, .16, S.body[2]]); seg('spine', fur, wp('hips', 0, .05, 0), wp('chest', 0, -.1, 0), S.body[0] * .78, S.body[0] * .95);
    sph('chest', fur, wp('chest', 0, -.05, .0), S.body); sph('chest', skin, wp('chest', 0, -.12, S.body[2] * .62), [S.body[0] * .55, S.body[1] * .6, S.body[2] * .45]);
    if (outfit < .65) { const tee = M('suit', col(SHIRTS), { roughness: .8 }); sph('chest', tee, wp('chest', 0, -.07, 0), [S.body[0] * 1.04, S.body[1] * .92, S.body[2] * 1.05]); sph('spine', tee, wp('spine', 0, .02, 0), [S.body[0] * .9, S.body[1] * .55, S.body[2] * .98]) }
    sph('head', fur, wp('head', 0, S.head[1] * .7, -.02), S.head); sph('head', skin, wp('head', 0, S.head[1] * .45, S.head[2] * .72), [S.head[0] * .62, S.head[1] * .5, S.head[2] * .45]);   // muzzle
    sph('head', skin, wp('head', 0, S.head[1] * 1.0, S.head[2] * .6), [S.head[0] * .7, S.head[1] * .22, S.head[2] * .3]);   // brow
    for (const s of [-1, 1]) { sph('head', skin, wp('head', s * S.head[0] * .95, S.head[1] * .75, -.02), [.045, .06, .03]); sph('head', eye, wp('head', s * S.head[0] * .32, S.head[1] * .82, S.head[2] * .82), .026) }
    const acc = r(); if (acc < .3) { const sh = M('eye', '#0a0a12', { roughness: .05, metalness: .3 }); box('head', sh, wp('head', 0, S.head[1] * .84, S.head[2] * .9), [S.head[0] * 1.4, .05, .03]) }
    else if (acc < .55) { const h = M('acc', pick(r, ['#e8303a', '#ffd84a', '#2aa84a']), { roughness: .9 }); sph('head', h, wp('head', 0, S.head[1] * 1.25, -.03), [S.head[0] * 1.08, S.head[1] * .55, S.head[2] * 1.05]); const h2 = M('acc', '#ffd84a'); sph('head', h2, wp('head', 0, S.head[1] * 1.08, -.03), [S.head[0] * 1.1, .03, S.head[2] * 1.07]) }   // rasta beanie
    else if (acc < .75) { const dl = M('fur', '#2a1a10', { roughness: .95 }); for (let k = 0; k < 7; k++) { const a = -1.2 + k * .4; seg('head', dl, wp('head', Math.sin(a) * S.head[0] * .8, S.head[1] * 1.1, -Math.cos(a) * S.head[2] * .6), wp('head', Math.sin(a) * S.head[0] * 1.1, S.head[1] * .1, -Math.cos(a) * S.head[2] * .9), .03, .025) } }   // dreadlocks
    limb(fur, fur, skin, skin, true); name = pick(r, ['Bongo', 'Kofi', 'Mambo', 'Rasta Rumble', 'Coco', 'Big Banana', 'Dubwise', 'Selector Simba', 'Irie Ike']);
  } else if (kind === 'human') {
    const skin = M('skin', col(S.skins), { roughness: .55 }), shirt = M('suit', col(SHIRTS), { roughness: .8 }), hair = M('hair', col(S.hairs), { roughness: .9 }), eye = M('eye', '#14100c', { roughness: .1 }); MI.__pants = M('pants', col(PANTS), { roughness: .85 });
    sph('hips', MI.__pants, wp('hips', 0, .02, 0), [S.body[0] * .95, .13, S.body[2] * 1.05]); seg('spine', shirt, wp('hips', 0, .04, 0), wp('chest', 0, -.08, 0), S.body[0] * .9, S.body[0] * .98); sph('chest', shirt, wp('chest', 0, -.06, 0), S.body);
    seg('neck', skin, wp('neck', 0, -.04, 0), wp('head', 0, .04, 0), .045, .04); sph('head', skin, wp('head', 0, S.head[1] * .85, 0), S.head); sph('head', skin, wp('head', 0, S.head[1] * .7, S.head[2] * .9), [.022, .03, .025]);   // head + nose
    for (const s of [-1, 1]) sph('head', eye, wp('head', s * .04, S.head[1] * .95, S.head[2] * .86), .016);
    const hs = r(); if (hs < .35) sph('head', hair, wp('head', 0, S.head[1] * 1.15, -.015), [S.head[0] * 1.08, S.head[1] * .62, S.head[2] * 1.08]);
    else if (hs < .6) { sph('head', hair, wp('head', 0, S.head[1] * 1.1, -.02), [S.head[0] * 1.1, S.head[1] * .7, S.head[2] * 1.1]); sph('head', hair, wp('head', 0, S.head[1] * .6, -S.head[2] * .7), [S.head[0] * .95, S.head[1] * .9, S.head[2] * .5]) }   // long hair
    else if (hs < .8) { const cap = M('acc', col(SHIRTS), { roughness: .8 }); sph('head', cap, wp('head', 0, S.head[1] * 1.22, 0), [S.head[0] * 1.1, S.head[1] * .45, S.head[2] * 1.1]); box('head', cap, wp('head', 0, S.head[1] * 1.12, S.head[2] * 1.05), [S.head[0] * 1.2, .02, .12]) }   // cap
    else sph('head', hair, wp('head', 0, S.head[1] * 1.25, -S.head[2] * .5), .07);   // bun
    if (r() < .35) { const g = M('eye', '#0a0a12', { roughness: .05, metalness: .3 }); box('head', g, wp('head', 0, S.head[1] * .95, S.head[2] * .95), [S.head[0] * 1.6, .035, .02]) }
    if (r() < .45) { const bp = M('acc', pick(r, ['#3a6a3a', '#d8402a', '#2a4a8a', '#e8a030']), { roughness: .85 }); box('chest', bp, wp('chest', 0, -.12, -S.body[2] - .1), [S.body[0] * 1.5, .42, .2]) }   // backpack
    limb(shirt, skin, skin, M('acc', pick(r, ['#2a2a2a', '#e8e8e8', '#d8402a', '#8a5a3a']), { roughness: .7 }), false); name = pick(r, ['Backpacker Bea', 'Lars', 'Mai', 'Tomás', 'Aiko', 'Jules', 'Priya', 'Somchai', 'Noi', 'Ken', 'Lola', 'Finn']);
  } else if (kind === 'robot') {
    const paint = M('suit', col(S.paints), { roughness: .35, metalness: .55 }), chrome = M('chrome', '#d8dce8', { roughness: .15, metalness: 1 }), glow = M('glow', pick(r, ['#7ff0ff', '#ff4ad2', '#7aff8a', '#ffd84a']));
    box('hips', chrome, wp('hips', 0, .02, 0), [S.body[0] * 1.6, .16, S.body[2] * 1.6]); seg('spine', chrome, wp('hips', 0, .05, 0), wp('chest', 0, -.15, 0), .07, .07);
    box('chest', paint, wp('chest', 0, -.08, 0), [S.body[0] * 2, S.body[1] * 1.7, S.body[2] * 2]); box('chest', glow, wp('chest', 0, -.05, S.body[2] + .005), [S.body[0] * .9, .05, .01]); sph('chest', glow, wp('chest', 0, -.16, S.body[2] + .01), .035);
    seg('neck', chrome, wp('neck', 0, -.02, 0), wp('head', 0, .03, 0), .03, .03); box('head', paint, wp('head', 0, S.head[1] * .7, 0), [S.head[0] * 2, S.head[1] * 1.6, S.head[2] * 1.8]); box('head', glow, wp('head', 0, S.head[1] * .78, S.head[2] * .92), [S.head[0] * 1.6, .045, .01]);
    seg('antR', chrome, wp('antR', -.06, -.05, 0), wp('antR', -.06, .14, 0), .008, .008); sph('antR', glow, wp('antR', -.06, .15, 0), .025);
    limb(chrome, chrome, paint, paint, false); name = pick(r, ['Unit B-0P', 'Shopkeeper K-7', 'Rusty', 'DJ Servo', 'Vend-O', 'Polly-9', 'Gearhart']);
  } else if (kind === 'frog') {
    const skin = M('skin', col(S.skins), { roughness: .35 }), belly = M('acc', '#f0e8a8', { roughness: .5 }), eye = M('eye', '#08080a', { roughness: .05 }), ring = M('glow', pick(r, ['#ffd84a', '#ff4ad2', '#7ff0ff']));
    sph('hips', skin, wp('hips', 0, .05, -.02), [S.body[0], .2, S.body[2]]); sph('chest', skin, wp('chest', 0, -.12, 0), S.body); sph('chest', belly, wp('chest', 0, -.16, S.body[2] * .55), [S.body[0] * .7, S.body[1] * .8, S.body[2] * .5]);
    sph('head', skin, wp('head', 0, S.head[1] * .4, .02), S.head); box('head', M('eye', '#5a1a2a'), wp('head', 0, S.head[1] * .2, S.head[2] * .92), [S.head[0] * 1.3, .015, .02]);
    for (const s of [-1, 1]) { sph('head', skin, wp('head', s * S.head[0] * .55, S.head[1] * .95, S.head[2] * .35), .075); sph('head', eye, wp('head', s * S.head[0] * .55, S.head[1] * 1.0, S.head[2] * .35 + .05), .045) }
    if (r() < .5) { const hat = M('acc', pick(r, ['#e8303a', '#2a2a2a', '#ffd84a'])); box('head', hat, wp('head', 0, S.head[1] * 1.05, -.03), [.16, .1, .16]); box('head', hat, wp('head', 0, S.head[1] * .98, -.03), [.3, .015, .3]) }   // tiny top hat
    sph('chest', ring, wp('chest', 0, .02, S.body[2] * .9), .03); limb(skin, skin, skin, skin, true); name = pick(r, ['Ribbit Rick', 'Lady Croak', 'MC Tadpole', 'Frogzilla', 'Toadally Tim', 'Lilypad Lou']);
  } else if (kind === 'spirit') {
    const glow = M('glow', col(S.skins)), skin = M('skin', col(S.skins), { roughness: .2, emissive: lin('#000000') }), eye = M('eye', '#ffffff', { roughness: .1 });
    sph('hips', skin, wp('hips', 0, 0, 0), [S.body[0] * .8, .2, S.body[2] * .8]); sph('chest', skin, wp('chest', 0, -.12, 0), S.body); sph('chest', glow, wp('chest', 0, -.12, S.body[2] * .8), .06);
    sph('head', skin, wp('head', 0, S.head[1] * .9, 0), S.head); sph('head', eye, wp('head', 0, S.head[1] * 1.0, S.head[2] * .85), [.07, .1, .03]); sph('head', glow, wp('head', 0, S.head[1] * 1.0, S.head[2] * .9), .025);
    for (const a of ['antL', 'antR']) { const s = a === 'antL' ? -1 : 1, top = wp(a, s * .12, .34, 0); seg(a, skin, wp(a, 0, -.05, 0), top, .02, .012); sph(a, glow, top, .05) }
    limb(skin, skin, glow, glow, false); name = pick(r, ['Mind Jelly', 'The Entity', 'Glimmer', 'Fractal Fred', 'Aura Ann', 'Machine Elf']);
  } else if (opt && opt.soft && AV.chars.alienActor) {   /* alien, soft body: same palette draws as the forge alien below */
    const A = AV.chars.alienActor({ type: r() < .6 ? 'zib' : 'orbo', skin: col(SP.alien.skins), suit: col(SHIRTS), glow: col(['#7ff0ff', '#ff4ad2', '#ffd84a', '#7aff8a']), shadow: false });
    A.root.scale.setScalar(.9 + (sc - .88) * .75); const ch = A.st.K.legs.L;
    return { root: A.root, clips: [], actor: A, name: pick(r, ['Zorp', 'Blixa', 'Quell', 'Mr. Nubs', 'Vexa', 'Trill', 'Grob', 'Yuzu-7']), kind, S: { thigh: Math.hypot(ch.hj[1] - ch.kn[1], ch.hj[2] - ch.kn[2]), shin: Math.hypot(ch.kn[1] - ch.an[1], ch.kn[2] - ch.an[2]) } };
  } else {   /* alien: the forge alien with random palette + head shape */
    const a = F.alien(Object.assign({}, F.ALIENS[r() < .6 ? 'zib' : 'orbo'], { skin: col(SP.alien.skins), suit: col(SHIRTS), glow: col(['#7ff0ff', '#ff4ad2', '#ffd84a', '#7aff8a']), head: SP.alien.head.map(v => v * (.85 + r() * .3)) })); a.name = pick(r, ['Zorp', 'Blixa', 'Quell', 'Mr. Nubs', 'Vexa', 'Trill', 'Grob', 'Yuzu-7']); a.kind = kind; a.S = F.ALIENS.zib; return a;
  }
  const geo = F.merge(parts), mesh = new THREE.SkinnedMesh(geo, mats); mesh.add(B.root); B.root.updateMatrixWorld(true); mesh.bind(new THREE.Skeleton(list));
  const g = new THREE.Group(); g.add(mesh); return { root: g, clips: F.alienClips(S), name, kind, S };
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
  if (fx && fx.level('drink') > .35) out.push(L('Whoa, you’re wobbling. Water helps, trust me.', 'Uf, te tambaleas. El agua ayuda, créeme.'));
  if (fx && fx.level('smoke') > .3) out.push(L('Your eyes are doing the sunset thing. Nice.', 'Tus ojos hacen lo del atardecer. Guay.'));
  if (AV.vitals && AV.vitals.get().energy < 25) out.push(L('You look hungry. Go eat something, champ.', 'Pareces hambriento. Ve a comer algo, campeón.'));
  if (W && W.id === 'chiang_mai' && AV.S.cmMode === 'lantern') out.push(L('Make a wish and let your lantern go!', '¡Pide un deseo y suelta tu farolillo!'));
  if (W && W.id === 'chiang_mai' && AV.S.cmMode === 'songkran') out.push(L('Happy Songkran! You’re way too dry.', '¡Feliz Songkran! Estás demasiado seco.'));
  if (W && W.id === 'chiang_mai' && AV.S.cm && AV.S.cm.weather === 'rain') out.push(L('Rainy season vibes. Perfect for a Thai tea.', 'Ambiente de temporada de lluvias. Perfecto para un té tailandés.'));
  if (W && W.id === 'astro9' && AV.inZeroG) out.push(L('Zero gravity! Let your hair float!', '¡Gravedad cero! ¡Deja que tu pelo flote!'));
  const np = AV.audio && AV.audio.nowPlaying && AV.audio.nowPlaying(); if (np && np.playing) out.push(L('This tune — “' + np.title + '” — is my jam.', 'Este tema —“' + np.title + '”— me encanta.'));
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
  const say = l => AV.tr(l[0], l[1]), g = GREET[b.kind] || GREET.human, first = say(g[Math.floor(Math.random() * g.length)]) + ' ' + say(contextLine(b));
  b.play('Wave', .25); b.talkT = AV.now(); if (b.actor) b.actor.talk(2.6);
  const p = AV.panel('cmp', '<b>' + b.name + '</b><div class="note" id="bln">' + first + '</div><div class="grid">' +
    '<button data-r="w">' + tr('Tell me something weird', 'Cuéntame algo raro') + '</button><button data-r="t">' + tr('Any tips around here?', '¿Algún consejo por aquí?') + '</button><button data-r="j">' + tr('Dance with me!', '¡Baila conmigo!') + '</button><button data-close>' + tr('Catch you later', 'Nos vemos') + '</button></div>');
  /* lock the view onto their face while the pop-up is open (they keep facing you, see BE.spawn update) */
  BE.talkTo = b; const v = new THREE.Vector3();
  AV.focus = () => { if (BE.talkTo !== b || !BE.chatOpen()) return null; if (b.headB) b.headB.getWorldPosition(v).y += b.faceY; else v.copy(b.h.position).y += 1.6; return v };
  p.querySelectorAll('[data-r]').forEach(x => x.onclick = () => { const k = x.dataset.r, el = AV.$('bln');
    if (k === 'w') el.textContent = say(WEIRD[Math.floor(Math.random() * WEIRD.length)]);
    else if (k === 't') el.textContent = say(hint());
    if (b.actor && k !== 'j') b.actor.talk(2.2);
    else { el.textContent = say(L('Yesss! Show me your moves!', '¡Síii! ¡Enséñame tus pasos!')); b.danceUntil = AV.now() + 12; b.play('Dance', .3); AV.vitals && AV.vitals.add(0, 6) }
    AV.dlg && AV.dlg.event && AV.dlg.event('chat') });
};

/* ---------- spawn + behaviours ---------- */
BE.spawn = function (ctx, specs) {
  const W = () => AV.W, out = [], shadow = false;   /* V0.9.8: no shadow pass for crowds (halves their draw calls) */
  specs.forEach((s, i) => {
    /* soft-body aliens on Medium / High; Low keeps the light forge aliens for weak devices */
    const made = BE.make(s.kind, (s.seed || 1) * 31 + i * 7 + ctx.id.length, s.over, { soft: ctx.q > 0, lod: true, shells: ctx.q === 2 ? 6 : 0 }), A = made.actor, h = new THREE.Group(); h.position.set(s.x, s.y || 0, s.z); h.rotation.y = s.yaw || 0; ctx.group.add(h);
    if (!A) F.dress(made.root, { shadow }).forEach(m => { if (m.userData.glowBase && AV.gfx) AV.gfx.reg(ctx, m, 'glow', m.userData.glowK) }); h.add(made.root);
    const mixer = A ? A.mixer : new THREE.AnimationMixer(made.root), acts = A ? A.acts : {}; if (!A) made.clips.forEach(c => acts[c.name] = mixer.clipAction(c));
    if (A && s.mode === 'float') A.air = true;   // zero g: legs dangle instead of planting
    const b = { h, mixer, acts, cur: null, kind: s.kind, name: s.name || made.name, mode: s.mode || 'wander', area: s.area || { x: s.x, z: s.z, r: 8 }, speed: s.speed || (.8 + Math.random() * .5), stride: 4 * (made.S.thigh + made.S.shin) * Math.sin(F.WALK_SWING), fy: s.y || 0, target: null, wait: Math.random() * 3, danceUntil: 0, talkT: -99, off: Math.random() * 10,
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
        if (!b.target) { b.wait -= dt; b.play('Idle', .4); if (b.wait <= 0 && w) { for (let k = 0; k < 8; k++) { const a = Math.random() * TAU, r = Math.sqrt(Math.random()) * b.area.r, x = b.area.x + Math.cos(a) * r, z = b.area.z + Math.sin(a) * r; if (AV.isFree(w, x, z, .7)) { b.target = [x, z]; break } } b.wait = 2 + Math.random() * 5 } }
        else { const tx = b.target[0] - b.h.position.x, tz = b.target[1] - b.h.position.z, l = Math.hypot(tx, tz); if (l < .3) { b.target = null } else { b.play('Walk', .3); if (b.acts.Walk) b.acts.Walk.timeScale = b.speed / b.stride; const st = Math.min(l, b.speed * dt), nx = b.h.position.x + tx / l * st, nz = b.h.position.z + tz / l * st;
          if (w && !AV.isFree(w, nx, nz, .45)) b.target = null; else { b.h.position.x = nx; b.h.position.z = nz; const sy = w && w.surface(nx, nz); b.h.position.y = (sy || 0) + (b.fy || 0); b.h.rotation.y = turn(b.h.rotation.y, Math.atan2(tx, tz), dt * 6) } } }
      }
      b.tg.x = b.h.position.x; b.tg.z = b.h.position.z; b.mixer.update(dt);
    }
  });
  ctx.leave.push(() => out.forEach(b => { b.mixer.stopAllAction(); b.h.traverse(o => { if (o.isSkinnedMesh && o.skeleton) o.skeleton.dispose() }) }));
  BE.list = out; return out;
};
/* how many beings a world gets on each quality preset */
BE.n = (ctx, lo, mid, hi) => [lo, mid, hi][ctx.q];
})(window.AV);
