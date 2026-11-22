/* APEVERSE V0.9.4 - chars_human.js : human characters for Chiang Mai (same body kit and API as the apes in chars.js).
   C.human(o)        -> animated character (userData head/aL/aR/lL/lR/torso + props), used by AV.npc.spawn({body})
   C.crew.mud() ...  -> the Giant Hostel crew, built from the user's reference art where it exists
   C.walkerKit(v,lo) -> baked per-pivot geometry for instanced pedestrians (js/city_life.js); colour slots in the aGlow channel:
                        0 fixed, 1 skin, 2 shirt, 3 pants, 4 hair. */
'use strict';
(function (AV) {
const C = AV.chars, std = AV.std, TAU = AV.TAU, KK = C._kit, { part, arm, leg, GH, GL, hiresTex, shade, mix } = KK;
/* ultra-light geometry for instanced pedestrians (dozens on screen at once) */
const GU = (() => { const P = [[0, 0], [.78, 0], [.88, .25], [.95, .6], [1, .8], [.8, .96], [.3, 1.02], [0, 1.03]].map(p => new THREE.Vector2(p[0], p[1]));
  const s = { sph: new THREE.SphereGeometry(1, 8, 5), sphH: new THREE.SphereGeometry(1, 10, 7), dot: new THREE.SphereGeometry(1, 5, 3), torso: new THREE.LatheGeometry(P, 9), taper: new THREE.CylinderGeometry(1, .82, 1, 6), cyl: new THREE.CylinderGeometry(1, 1, 1, 6),
    fing: new THREE.CylinderGeometry(1, .85, 1, 3), smile: new THREE.TorusGeometry(1, .18, 3, 6, Math.PI), box: new THREE.BoxGeometry(1, 1, 1), frust: new THREE.CylinderGeometry(.62, 1, 1, 8), hem: new THREE.SphereGeometry(1, 8, 4, 0, TAU, 0, Math.PI / 2), ring: new THREE.TorusGeometry(1, .22, 3, 8) };
  for (const k in s) s[k].userData.shared = true; return s })();

/* ---------------- printed fabrics (canvas, cached) ---------------- */
const TX = {};
const fab = (k, draw) => TX[k] || (TX[k] = hiresTex(256, draw));
const T = {
  giantTee: () => fab('giant', c => { c.fillStyle = '#16161a'; c.fillRect(0, 0, 128, 128); c.strokeStyle = '#f4f0e8'; c.lineWidth = 3; c.beginPath(); c.arc(64, 60, 34, 0, TAU); c.stroke(); c.fillStyle = '#f4f0e8'; c.textAlign = 'center'; c.font = 'bold 15px Georgia'; c.fillText('GIANT', 64, 57); c.fillText('HOSTEL', 64, 72); c.font = '7px Georgia'; c.fillText('CHIANG MAI', 64, 84); for (let i = 0; i < 10; i++) { const a = -Math.PI * .9 + i * .2; c.beginPath(); c.arc(64 + Math.cos(a) * 30, 60 + Math.sin(a) * 30, 1.2, 0, TAU); c.fill() } }),
  ztonedTee: () => fab('ztee', c => { c.fillStyle = '#2a1c1c'; c.fillRect(0, 0, 128, 128); c.fillStyle = '#c86a4a'; c.beginPath(); c.arc(64, 70, 20, 0, TAU); c.fill(); c.fillStyle = '#1a1010'; c.fillRect(48, 63, 32, 7); c.fillStyle = '#ff9ad8'; c.font = 'bold italic 17px Georgia'; c.textAlign = 'center'; c.fillText('ZtonedApe', 64, 42); c.fillStyle = '#e83a30'; for (const x of [44, 64, 84]) { c.beginPath(); c.arc(x, 104, 7, Math.PI, 0); c.fill() } c.fillStyle = '#fff'; for (const x of [42, 47, 62, 67, 82, 87]) { c.beginPath(); c.arc(x, 101, 1.3, 0, TAU); c.fill() } c.fillStyle = '#7ad84a'; c.beginPath(); c.moveTo(64, 14); c.lineTo(70, 26); c.lineTo(64, 23); c.lineTo(58, 26); c.fill() }),
  heartTee: () => fab('heart', c => { c.fillStyle = '#202024'; c.fillRect(0, 0, 128, 128); c.fillStyle = '#f4f0e8'; c.font = 'bold 18px Georgia'; c.textAlign = 'center'; c.fillText('I', 40, 60); c.fillStyle = '#e8303a'; c.beginPath(); c.moveTo(64, 66); c.bezierCurveTo(44, 50, 52, 36, 64, 46); c.bezierCurveTo(76, 36, 84, 50, 64, 66); c.fill(); c.fillStyle = '#f4f0e8'; c.font = 'bold 13px Georgia'; c.fillText('Chiang Mai', 64, 84) }),
  elephant: () => fab('ele', c => { c.fillStyle = '#8a1a1e'; c.fillRect(0, 0, 128, 128); c.fillStyle = '#e8d0a8'; for (let y = 0; y < 128; y += 32) { c.fillRect(0, y, 128, 2); for (let x = 4; x < 128; x += 8) c.fillRect(x, y + 4, 4, 2) }
    const ele = (x, y) => { c.beginPath(); c.ellipse(x, y, 9, 6, 0, 0, TAU); c.fill(); c.beginPath(); c.arc(x + 8, y - 3, 4.5, 0, TAU); c.fill(); c.fillRect(x + 10, y - 2, 2.5, 9); for (const lx of [-6, -2, 3, 6]) c.fillRect(x + lx, y + 3, 2.4, 6) };
    for (let y = 16; y < 128; y += 32) for (let x = 12; x < 128; x += 34) ele(x + (y / 32 % 2) * 14, y) }),
  hawaii: () => fab('haw', c => { c.fillStyle = '#2a7ac8'; c.fillRect(0, 0, 128, 128); const r = AV.rng(8); for (let i = 0; i < 16; i++) { const x = r() * 128, y = r() * 128; c.fillStyle = i % 2 ? '#ffffff' : '#ffd84a'; for (let p = 0; p < 5; p++) { const a = p / 5 * TAU; c.beginPath(); c.ellipse(x + Math.cos(a) * 5, y + Math.sin(a) * 5, 5, 3, a, 0, TAU); c.fill() } c.fillStyle = '#e8603a'; c.beginPath(); c.arc(x, y, 2, 0, TAU); c.fill() } c.strokeStyle = '#2a9a5a'; c.lineWidth = 3; for (let i = 0; i < 8; i++) { const x = r() * 128, y = r() * 128; c.beginPath(); c.ellipse(x, y, 10, 3, r() * 3, 0, TAU); c.stroke() } }),
  tank: () => fab('tank', c => { c.fillStyle = '#c83a3a'; c.fillRect(0, 0, 128, 128); c.fillStyle = 'rgba(255,255,255,.15)'; for (let y = 0; y < 128; y += 8) c.fillRect(0, y, 128, 2) }),
  reggae: () => fab('reg', c => { ['#2a9a4a', '#ffd23a', '#e8303a'].forEach((col, i) => { c.fillStyle = col; c.fillRect(0, i * 43, 128, 43) }); c.fillStyle = '#1a1a1a'; c.font = 'bold 14px Georgia'; c.textAlign = 'center'; c.fillText('ONE LOVE', 64, 70) }),
  tieDye: () => fab('tie', c => {
    c.fillStyle = '#f0e8d0'; c.fillRect(0, 0, 128, 128); const r = AV.rng(12), cols = ['#ff4ad2', '#ffd84a', '#4ac8ff', '#7aff8a', '#ff8a3a', '#9a5cff'];
    for (let i = 0; i < 5; i++) { const cx = 12 + r() * 104, cy = 12 + r() * 104; for (let k = 0; k < 7; k++) { c.strokeStyle = cols[(i + k) % cols.length]; c.lineWidth = 5.4 - k * .5; c.beginPath(); c.arc(cx, cy, 4 + k * 7, 0, TAU); c.stroke() } }
    for (let i = 0; i < 70; i++) { c.fillStyle = cols[i % cols.length]; c.globalAlpha = .35; c.beginPath(); c.arc(r() * 128, r() * 128, 1.5 + r() * 2.5, 0, TAU); c.fill() } c.globalAlpha = 1;
  })
};
const mat = (k, rough) => { const m = new THREE.MeshStandardMaterial({ map: T[k](), roughness: rough || .85 }); return m };

/* ---------------- the human body ---------------- */
/* o: {skin, hair, style:'messy'|'bun'|'long'|'blond'|'cap'|'short'|'bald', beard, glasses, eye, shirt(mat), sleeve(mat|'skin'), pants(mat), shorts(bool),
       foot:'flip'|'sneaker', shoe(hex), s, slim, lite, lod, capCol, flower} */
C.human = function (o) {
  const lowQ = AV.kit && AV.kit.q && AV.kit.q() === 0, Gx = o.ultra ? GU : o.lod || lowQ ? GL : GH; KK.setLite(!!o.lite);
  const g = new THREE.Group(), s = o.s || .8, big = o.slim ? .8 : (o.big || .92), k = s * 1.12;
  const skin = std(o.skin || 0xd8a47a, .7), skinD = std(shade(o.skin || 0xd8a47a, .85), .7), hair = std(o.hair == null ? 0x3a2416 : o.hair, .9), lip = std(mix(o.skin || 0xd8a47a, 0x8a3a3a, .45), .6);
  /* redEye: bloodshot sclera + glowing red iris (the multiverse's professional cloud-watchers) */
  const redEye = !!o.redEye, eyeK = redEye ? 1.18 : 1;
  const white = redEye ? std(0xff5a48, .25, 0, 0xff2a1a, .7) : std(0xf6f2ea, .3),
    iris = redEye ? std(0xff1408, .15, 0, 0xff2a10, 1.8) : std(o.eye || 0x4a2e18, .35),
    glint = redEye ? std(0xffd8c8, .2, 0, 0xff8a6a, 1) : std(0xffffff, .2, 0, 0xffffff, 1);
  const dark = std(0x16100c, .45), sole = std(0xf0ece4, .7);
  const shirt = o.shirt || std(0x4a8ad8, .85), pants = o.pants || std(0x3a3a52, .9);
  const sleeveM = o.sleeve === 'skin' ? skin : (o.sleeve || shirt), sleeveRole = o.sleeve === 'skin' ? 'skin' : 'shirt';
  part(g, Gx.sph, pants, 0, 1.0 * s, 0, .3 * s * big, .19 * s, .2 * s * big, 'pants');
  const torso = part(g, Gx.torso, shirt, 0, 1.06 * s, 0, .34 * s * big, .86 * s, .21 * s * big, 'shirt'); torso.userData.torso = true;
  part(g, Gx.cyl, skin, 0, 1.96 * s, .01, .09 * s, .2 * s, .09 * s, 'skin');
  const shX = (.31 * big + .06) * s;
  for (const sx of [-1, 1]) part(g, Gx.sph, sleeveM, sx * shX, 1.83 * s, 0, .13 * s, .12 * s, .13 * s, sleeveRole);
  /* head */
  const head = new THREE.Group(); head.position.set(0, 2.12 * s, .01); g.add(head);
  part(head, Gx.sphH, skin, 0, 0, 0, .25 * k, .29 * k, .26 * k, 'skin');
  part(head, Gx.sph, skin, 0, -.14 * k, .06 * k, .18 * k, .14 * k, .17 * k, 'skin');                       // jaw
  part(head, Gx.sph, skinD, 0, -.03 * k, .255 * k, .04 * k, .065 * k, .055 * k, 'skin');                     // nose
  for (const sx of [-1, 1]) {
    part(head, Gx.sph, white, sx * .085 * k, .04 * k, .205 * k, .04 * k * eyeK, .036 * k * eyeK, .03 * k * eyeK, 'fixed');
    part(head, Gx.dot, iris, sx * .085 * k, .04 * k, .228 * k, .024 * k * eyeK, .024 * k * eyeK, .012 * k * eyeK, 'fixed');
    part(head, Gx.dot, dark, sx * .085 * k, .04 * k, .236 * k, .013 * k * eyeK, .013 * k * eyeK, .008 * k * eyeK, 'fixed');
    part(head, Gx.dot, glint, sx * .085 * k + .01 * k, .05 * k, .241 * k, .006 * k, .006 * k, .004 * k, 'fixed');
    part(head, Gx.box, hair, sx * .085 * k, .1 * k, .235 * k, .075 * k, .016 * k, .02 * k, 'hair', [0, 0, -sx * .12]);   // brows
    part(head, Gx.sph, skin, sx * .255 * k, .01 * k, 0, .045 * k, .075 * k, .04 * k, 'skin');                  // ears
  }
  part(head, Gx.smile, lip, 0, -.115 * k, .235 * k, .055 * k, .03 * k, .03 * k, 'fixed', [0, 0, Math.PI]);
  const st = o.style || 'short';
  if (st !== 'bald') part(head, Gx.hem, hair, 0, .02 * k, -.015 * k, .27 * k, .3 * k, .285 * k, 'hair');
  if (st === 'messy' || st === 'blond') { const r = AV.rng(st === 'messy' ? 3 : 7), n = o.lite ? 6 : 14; for (let i = 0; i < n; i++) { const a = r() * TAU, el = .1 + r() * .22; part(head, Gx.sph, hair, Math.cos(a) * .2 * k, el * k + .05 * k, Math.sin(a) * .2 * k - .03 * k, (.08 + r() * .05) * k, (.07 + r() * .04) * k, (.08 + r() * .05) * k, 'hair') } for (const sx of [-1, 1]) part(head, Gx.sph, hair, sx * .22 * k, -.04 * k, -.06 * k, .07 * k, .14 * k, .12 * k, 'hair') }
  if (st === 'bun') { part(head, Gx.sph, hair, 0, .2 * k, -.2 * k, .1 * k, .1 * k, .1 * k, 'hair'); part(head, Gx.ring, std(0xe8303a, .6), 0, .17 * k, -.16 * k, .05 * k, .05 * k, .05 * k, 'fixed', [.7, 0, 0]) }
  if (st === 'long') { part(head, Gx.sph, hair, 0, -.2 * k, -.16 * k, .27 * k, .42 * k, .12 * k, 'hair'); for (const sx of [-1, 1]) part(head, Gx.sph, hair, sx * .235 * k, -.17 * k, .0, .06 * k, .3 * k, .09 * k, 'hair'); if (o.flower) for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; part(head, Gx.dot, std(o.flower, .5), .2 * k + Math.cos(a) * .03 * k, .13 * k + Math.sin(a) * .03 * k, .12 * k, .025 * k, .025 * k, .015 * k, 'fixed') } }
  if (st === 'cap') { const cm = std(o.capCol || 0x2a6a3a, .8); part(head, Gx.hem, cm, 0, .06 * k, 0, .28 * k, .25 * k, .29 * k); part(head, Gx.box, cm, 0, .07 * k, .26 * k, .24 * k, .02 * k, .18 * k, 'fixed', [-.12, 0, 0]) }
  if (o.beard) { part(head, Gx.sphH, hair, 0, -.14 * k, .08 * k, .2 * k, .15 * k, .19 * k, 'hair'); part(head, Gx.sph, hair, 0, -.075 * k, .245 * k, .07 * k, .022 * k, .03 * k, 'hair') }
  if (o.glasses) { const fr = std(o.glasses === true ? 0x18120e : o.glasses, .4); for (const sx of [-1, 1]) { part(head, Gx.ring, fr, sx * .085 * k, .04 * k, .262 * k, .052 * k, .046 * k, .05 * k, 'fixed'); part(head, Gx.cyl, fr, sx * .2 * k, .045 * k, .13 * k, .008 * k, .26 * k, .008 * k, 'fixed', [Math.PI / 2, 0, 0]) } part(head, Gx.box, fr, 0, .048 * k, .262 * k, .05 * k, .01 * k, .01 * k, 'fixed') }
  /* limbs */
  const lower = { m: skin, userData: { role: 'skin' } };
  const A = side => arm(g, Gx, side * shX, 1.86 * s, 0, .8 * s, .095 * s * Math.sqrt(big), { m: sleeveM, userData: { role: sleeveRole } }, lower, skin, side);
  const aL = A(-1), aR = A(1);
  const shoe = std(o.shoe || (o.foot === 'flip' ? 0x3a4a2a : 0x2a2a2a), .8), shin = o.shorts ? { m: skin, role: 'skin' } : null;
  const L = side => leg(g, Gx, side * .14 * s * big, .96 * s, 0, .95 * s, .12 * s * Math.sqrt(big), pants, shoe, sole, s, shin, o.foot);
  const lL = L(-1), lR = L(1);
  KK.setLite(false);
  g.userData = { head, aL, aR, lL, lR, torso, s, k, Gx, big, human: true, extra: [] };
  return g;
};
/* a prop group attached to a hand (pivot at the hand), compacted with the character */
function handProp(u, side) { const arm = side > 0 ? u.aR : u.aL, len = .8 * u.s, p = new THREE.Group(); p.position.set(0, -len - .02, .05); arm.add(p); u.extra.push(p); return p }
C.props = {
  joint(u, side) { const p = handProp(u, side || 1), s = u.s; part(p, u.Gx.cyl, std(0xf4f0e4, .8), 0, -.02 * s, .1 * s, .012 * s, .11 * s, .012 * s, 'fixed', [Math.PI / 2 - .3, 0, 0]); part(p, u.Gx.dot, std(0xff6a2a, .4, 0, 0xff5a1a, 1.4), 0, .0, .155 * s, .016 * s, .016 * s, .016 * s, 'fixed'); u.joint = p; return p },
  beer(u, side) { const p = handProp(u, side || -1), s = u.s, gl = std(0x2a7a3a, .15, .2); part(p, u.Gx.cyl, gl, 0, -.02 * s, .05 * s, .045 * s, .2 * s, .045 * s); part(p, u.Gx.taper, gl, 0, .12 * s, .05 * s, .02 * s, .07 * s, .02 * s, 'fixed', [Math.PI, 0, 0]); part(p, u.Gx.cyl, std(0xe8d8a0, .6), 0, -.03 * s, .096 * s, .046 * s, .07 * s, .002 * s); u.beer = p; return p },
  ukulele(u) { const p = new THREE.Group(), s = u.s; p.position.set(.05 * s, 1.42 * s, .27 * s); p.rotation.set(0, 0, -.9); u.extra.push(p);
    const body = new THREE.Group(); p.add(body); const wood = std(0xc8803a, .5);
    part(p, u.Gx.sph, wood, 0, -.12 * s, 0, .17 * s, .15 * s, .05 * s); part(p, u.Gx.sph, wood, 0, .06 * s, 0, .13 * s, .11 * s, .05 * s); part(p, u.Gx.dot, std(0x2a1408, .5), 0, -.02 * s, .05 * s, .045 * s, .045 * s, .01 * s);
    part(p, u.Gx.box, std(0x3a2414, .5), 0, .35 * s, .02 * s, .045 * s, .42 * s, .02 * s); part(p, u.Gx.box, std(0x6a4020, .5), 0, .58 * s, .02 * s, .06 * s, .08 * s, .025 * s);
    for (const x of [-.012, -.004, .004, .012]) part(p, u.Gx.cyl, std(0xeeeeee, .3), x * s, .2 * s, .045 * s, .002 * s, .7 * s, .002 * s);
    u.uke = p; return p },
  cue(u) { const p = handProp(u, 1), s = u.s; part(p, u.Gx.taper, std(0xd8b080, .5), 0, .55 * s, .05 * s, .018 * s, 1.5 * s, .018 * s, 'fixed', [0, 0, 0]); part(p, u.Gx.cyl, std(0x1a1a1a, .5), 0, -.1 * s, .05 * s, .021 * s, .2 * s, .021 * s); u.cue = p; return p },
  phone(u) { const p = handProp(u, 1), s = u.s; part(p, u.Gx.box, std(0x1a1a22, .3, .3), 0, .0, .06 * s, .07 * s, .13 * s, .012 * s, 'fixed', [-1, 0, 0]); part(p, u.Gx.box, std(0x6ac8ff, .3, 0, 0x6ac8ff, 1), 0, .0, .066 * s, .06 * s, .11 * s, .004 * s, 'fixed', [-1, 0, 0]); return p },
  gun(u, col) { const p = handProp(u, 1), s = u.s, c = std(col || 0x2ab8e8, .4); part(p, u.Gx.box, c, 0, -.02 * s, .15 * s, .07 * s, .07 * s, .34 * s); part(p, u.Gx.cyl, std(0xffd84a, .4), 0, .08 * s, .1 * s, .06 * s, .14 * s, .06 * s); part(p, u.Gx.cyl, c, 0, -.02 * s, .34 * s, .015 * s, .08 * s, .015 * s, 'fixed', [Math.PI / 2, 0, 0]); u.gun = p; return p }
};
/* a decal print on the chest (textured plane, kept separate from compact) */
function chestPrint(g, key, w) { const u = g.userData, s = u.s, m = new THREE.Mesh(AV.G.pln, mat(key)); m.position.set(0, 1.55 * s, .21 * u.big * s * .95 + .008); m.scale.set(w * s, w * s, 1); g.add(m); return m }

/* ---------------- the Giant Hostel crew ---------------- */
C.crew = {
  /* Mutt: slim Thai woman, black Giant Hostel tee with the round white logo (reference: hostel map art) */
  mud() { const g = C.human({ skin: 0xc89068, hair: 0x14100c, style: 'bun', slim: true, s: .76, shirt: std(0x16161a, .85), pants: std(0x4a5a7a, .9), foot: 'sneaker', shoe: 0xf0f0f0 }); chestPrint(g, 'giantTee', .34); g.userData.kind = 'mud'; return C.compact(g) },
  /* Nuni: the owner's sister, pool champion; long black hair, flower, red tank top, beer */
  nuni() { const g = C.human({ skin: 0xc8946a, hair: 0x100c0a, style: 'long', flower: 0xff7ab8, slim: true, s: .74, shirt: mat('tank'), sleeve: 'skin', pants: std(0x2a2a34, .9), shorts: true, foot: 'flip', shoe: 0xe8303a }); C.props.beer(g.userData, -1); g.userData.kind = 'nuni'; return C.compact(g) },
  /* Steve: blond ukulele player (no reference supplied: generic look) */
  steve() { const g = C.human({ skin: 0xf0c0a0, hair: 0xe8c860, style: 'blond', s: .82, shirt: mat('hawaii'), pants: std(0xc8b088, .9), shorts: true, foot: 'flip', shoe: 0x6a4a2a, eye: 0x3a6ab8 }); C.props.ukulele(g.userData); g.userData.kind = 'steve'; return C.compact(g) },
  /* Dino: laid-back resident stoner (no reference supplied: generic look) */
  dino() { const g = C.human({ skin: 0xd8a47a, hair: 0x5a5048, style: 'cap', capCol: 0x2a8a4a, beard: true, redEye: true, s: .8, big: 1.02, shirt: mat('reggae'), pants: std(0x6a6a5a, .9), shorts: true, foot: 'flip', shoe: 0x2a2a2a }); C.props.joint(g.userData, 1); g.userData.kind = 'dino'; return C.compact(g) },
  /* ZtonedApe: messy brown hair, glasses, beard, dark printed tee, red elephant shorts, olive slides (reference: "Glasses at the Giant Hostel") */
  zape() { const g = C.human({ skin: 0xdca47c, hair: 0x4a2c18, style: 'messy', beard: true, glasses: true, redEye: true, s: .82, shirt: std(0x2a1c1c, .85), pants: mat('elephant'), shorts: true, foot: 'flip', shoe: 0x4a5a2a }); chestPrint(g, 'ztonedTee', .34); C.props.joint(g.userData, 1); g.userData.kind = 'zape'; return C.compact(g) },
  nunyin() { const g = C.human({ skin: 0xc89068, hair: 0x18120e, style: 'bun', slim: true, s: .74, shirt: std(0x1a1a1a, .85), sleeve: 'skin', pants: std(0x3a3a4a, .9) }); g.userData.kind = 'nunyin'; return C.compact(g) },
  golf() { const g = C.human({ skin: 0xd09a70, hair: 0x14100c, style: 'short', glasses: true, s: .72, big: 1.1, shirt: std(0x22222a, .85), pants: std(0x3a3a3a, .9), shorts: true, shoe: 0x202020 }); C.props.phone(g.userData); g.userData.kind = 'golf'; return C.compact(g) },
  guest(seed) { const r = AV.rng(seed * 31 + 7), pick = a => a[Math.floor(r() * a.length)]; const g = C.human({ skin: pick([0xf0c8a8, 0xd8a47a, 0xb07a50, 0x8a5a3a, 0xe8b890]), hair: pick([0x2a1a10, 0xd8b860, 0x8a4a20, 0x14100c, 0xb0b0b0]), style: pick(['short', 'long', 'messy', 'cap', 'bun']), beard: r() < .3, glasses: r() < .25, s: .74 + r() * .1, slim: r() < .4, shirt: std(pick([0xe8603a, 0x3a8ad8, 0xf2e8d8, 0x2a9a6a, 0xd84a8a, 0x2a2a2a, 0xffd84a]), .85), pants: std(pick([0x3a3a52, 0xc8b088, 0x2a2a2a, 0x6a8ab8]), .9), shorts: r() < .6, foot: r() < .5 ? 'flip' : 'sneaker', shoe: pick([0x2a2a2a, 0xe8e8e8, 0x8a5a3a]) }); if (r() < .35) C.props.beer(g.userData, -1); return C.compact(g) }
};
/* ---------------- multiverse cloud-watchers (js/stoners.js spawns them in every world) ----------------
   A red-eyed, joint-smoking human in mismatched festival clothes. Wild hair, no two alike, always mid-thought. */
C.stoner = function (seed) {
  const r = AV.rng((seed || 1) * 131 + 17), pick = a => a[Math.floor(r() * a.length) % a.length];
  const style = pick(['messy', 'messy', 'long', 'bun', 'blond', 'cap']);
  const o = {
    skin: pick([0xf0c8a8, 0xd8a47a, 0xc8946a, 0xb07a50, 0x8a5a3a, 0x6a4028]),
    hair: pick([0x14100c, 0x4a2c18, 0xd8b860, 0xb0b0b0, 0xa83a1a, 0xe8e0d0]),
    style, redEye: true, beard: r() < .32,
    flower: style === 'long' && r() < .5 ? pick([0xff6ad5, 0xffd84a, 0x7ff0ff]) : null,
    capCol: pick([0x2a8a4a, 0xe8303a, 0xffd84a, 0x7a4ac8]),
    s: .76 + r() * .12, big: .92 + r() * .16,
    shirt: pick([() => mat('reggae'), () => mat('hawaii'), () => mat('tieDye'), () => std(0xff6a3a, .85), () => std(0x7a4ac8, .85), () => std(0x2a9a6a, .85)])(),
    pants: std(pick([0x3a3a52, 0x6a6a5a, 0xc8b088, 0x2a2a2a, 0x4a6a3a, 0x6a2a4a]), .9),
    shorts: r() < .7, foot: r() < .65 ? 'flip' : 'sneaker',
    shoe: pick([0x2a2a2a, 0xe8e8e8, 0xe8303a, 0x3a6ad8, 0x8a5a3a])
  };
  if (r() < .45) o.sleeve = 'skin';
  const g = C.human(o);
  C.props.joint(g.userData, r() < .5 ? 1 : -1);
  g.userData.kind = 'stoner';
  return C.compact(g);
};

/* ---------------- instanced pedestrians: baked per-pivot geometry ---------------- */
const SLOT = { skin: 1, shirt: 2, pants: 3, hair: 4 };
const VAR = {
  man: { style: 'short', shorts: false }, woman: { style: 'long', slim: true, shorts: true, foot: 'flip' }, tourist: { style: 'cap', shorts: true, foot: 'flip' },
  monk: { style: 'bald', shorts: false, foot: 'flip' }, dancer: { style: 'bun', slim: true, shorts: false, crown: true }, drummer: { style: 'short', drum: true },
  splasher: { style: 'messy', shorts: true, foot: 'flip', gun: true }
};
const walkCache = {};
C.walkerKit = function (v, lo) {
  /* V0.9.8: tried the medium-detail body for the street crowd: 2–3× the triangles (Chiang Mai 0.7M → 1.4–2.1M) for little visible gain, so the
     instanced crowd keeps the light geometry (same parts: faces, hair, clothes); detailed rigged residents are added at the busy spots instead */
  const key = v + (lo ? 'L' : 'H'); if (walkCache[key]) return walkCache[key];
  const o = Object.assign({ lite: true, ultra: true, lod: lo, skin: 0xffffff, hair: 0xffffff, shirt: std(0xffffff, .8), pants: std(0xfffffe, .9), s: .78 }, VAR[v]);
  const g = C.human(o), u = g.userData, s = u.s;
  if (o.crown) part(u.head, u.Gx.cyl, std(0xe8b830, .3, .7), 0, .28 * u.k, 0, .09 * u.k, .3 * u.k, .09 * u.k, 'fixed');
  if (o.drum) { part(g, u.Gx.cyl, std(0xc83a2a, .6), 0, 1.2 * s, .3 * s, .2 * s, .28 * s, .2 * s, 'fixed', [Math.PI / 2, 0, 0]); part(g, u.Gx.cyl, std(0xf0e8d0, .6), 0, 1.2 * s, .45 * s, .19 * s, .02 * s, .19 * s, 'fixed', [Math.PI / 2, 0, 0]) }
  if (o.gun) C.props.gun(u, 0x2ab8e8);
  g.updateMatrixWorld(true);
  const pivots = { root: g, head: u.head, aL: u.aL, aR: u.aR, lL: u.lL, lR: u.lR }, out = {};
  const hexOf = m => { const c = m.color.clone(); if (m.userData.lin) c.convertLinearToSRGB(); return c.getHex() };
  for (const name in pivots) {
    const pv = pivots[name], inv = new THREE.Matrix4().copy(pv.matrixWorld).invert(), parts = [];
    pv.traverse(ch => { if (!ch.isMesh) return; let p = ch.parent; while (p && p !== pv && !Object.values(pivots).includes(p)) p = p.parent; if (p !== pv) return;
      const slot = SLOT[ch.userData.role] || 0, mm = new THREE.Matrix4().multiplyMatrices(inv, ch.matrixWorld); parts.push([ch.geometry, slot ? 0xffffff : hexOf(ch.material), mm, slot]) });
    if (parts.length) out[name] = { geo: AV.kit.merge(parts), pos: pv === g ? new THREE.Vector3() : pv.position.clone() };
  }
  return walkCache[key] = out;
};
/* material: vertex colour × per-instance colour picked by the slot stored in aGlow */
C.walkerMat = function () {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .8 });
  m.onBeforeCompile = sh => {
    sh.vertexShader = 'attribute float aGlow; attribute vec3 iSkin; attribute vec3 iShirt; attribute vec3 iPants; attribute vec3 iHair;\n' + sh.vertexShader.replace('#include <color_vertex>', `#include <color_vertex>
      vec3 tint = vec3(1.0);
      if (aGlow > .5 && aGlow < 1.5) tint = iSkin; else if (aGlow > 1.5 && aGlow < 2.5) tint = iShirt; else if (aGlow > 2.5 && aGlow < 3.5) tint = iPants; else if (aGlow > 3.5) tint = iHair;
      vColor.xyz *= tint;`);
  };
  m.customProgramCacheKey = () => 'walker'; m.userData.lin = 1; return m;
};
})(window.AV);
