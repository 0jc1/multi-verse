/* APEVERSE - chars_soft.js : the classic humanoids rebuilt as realistic soft-body characters.
   Loaded right after chars_real.js. Same skinned rig, IK, foot planting and spring-bone jiggle (belly, chest, cheeks,
   shirt hem) as the band and the ape villagers; garments come from anatomy.js + anatomy_wear.js (shorts, flip-flops,
   messy hair, beards). What it replaces, keeping every old API so world / quest code runs unchanged:
     C.crew.mud() ... C.crew.guest(seed) -> the Giant Hostel crew (Chiang Mai). Puppets with the classic pivots
         userData.head / aL / aR / lL / lR / torso, plus the props worlds look for (u.beer, u.joint, u.uke, u.phone).
         lL / lR rotated forward (sitPose) now really sits the body down; the ukulele is fretted and strummed with IK.
     C.softActor(kind, seed, opt)        -> 'human' / 'ape' actors for beings.js crowds (same clip API as C.alienActor).
     C.softHuman(look)                   -> any custom human puppet (see look() below for the options).
   The classic builders stay available as C.classicCrew (and C.human / C.walkerKit for the instanced street crowd). */
'use strict';
(function (AV) {
const C = AV.chars, PBR = AV.pbr, AN = AV.anatomy, SO = C.soft;
if (!SO || !PBR || !AN) { console.warn('chars_soft: chars_real.js internals missing, keeping classic humanoids'); return }
const GEN = SO.GEN, V = THREE.Vector3, TAU = Math.PI * 2;
const _v = new V(), _w = new V(), _u = new V();
const clamp = (x, a, b) => x < a ? a : x > b ? b : x, hexN = c => new THREE.Color(c).getHex();

/* ======================= printed fabrics + chest prints (canvas, tileable, cached forever) ======================= */
const TX = {};
function canvasTex(key, size, draw, decal) {
  if (TX[key]) return TX[key];
  const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d'); draw(g, size);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.LinearEncoding; t.anisotropy = 4;   // charMat decodes sRGB itself
  t.wrapS = t.wrapT = decal ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping; t.userData = { keep: true, srgbData: true };
  return TX[key] = t;
}
/* stamp a motif with wrap-around copies so the tile is seamless */
const wrapStamp = (g, S, fn) => { for (const dx of [-S, 0, S]) for (const dy of [-S, 0, S]) { g.save(); g.translate(dx, dy); fn(); g.restore() } };
function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 4294967296 } }
const FAB = {
  hawaii: () => canvasTex('hawaii', 256, (g, S) => { const r = rng(8); g.fillStyle = '#2a7ac8'; g.fillRect(0, 0, S, S);
    for (let i = 0; i < 9; i++) { const x = r() * S, y = r() * S, a = r() * TAU, l = 16 + r() * 12; wrapStamp(g, S, () => { g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = '#2a9a5a'; g.beginPath(); g.ellipse(0, 0, l, l * .35, 0, 0, TAU); g.fill(); g.restore() }) }
    for (let i = 0; i < 12; i++) { const x = r() * S, y = r() * S, R = 9 + r() * 7, col = i % 2 ? '#ffffff' : '#ffd84a';
      wrapStamp(g, S, () => { g.fillStyle = col; for (let p = 0; p < 5; p++) { const a = p / 5 * TAU; g.beginPath(); g.ellipse(x + Math.cos(a) * R * .55, y + Math.sin(a) * R * .55, R * .55, R * .32, a, 0, TAU); g.fill() } g.fillStyle = '#e8603a'; g.beginPath(); g.arc(x, y, R * .22, 0, TAU); g.fill() }) } }),
  reggae: () => canvasTex('reggae', 128, (g, S) => { ['#e8303a', '#ffd23a', '#2a9a4a'].forEach((c, i) => { g.fillStyle = c; g.fillRect(0, i * S / 3, S, S / 3 + 1) }) }),
  tank: () => canvasTex('tank', 64, (g, S) => { g.fillStyle = '#c83a3a'; g.fillRect(0, 0, S, S); g.fillStyle = 'rgba(255,255,255,.16)'; for (let y = 0; y < S; y += 8) g.fillRect(0, y, S, 2) }),
  elephant: () => canvasTex('elephant', 256, (g, S) => { g.fillStyle = '#8a1a1e'; g.fillRect(0, 0, S, S); g.fillStyle = '#e8d0a8';
    for (let y = 0; y < S; y += 64) { g.fillRect(0, y, S, 3); for (let x = 6; x < S; x += 14) g.fillRect(x, y + 7, 6, 3) }
    const ele = (x, y) => { g.beginPath(); g.ellipse(x, y, 15, 10, 0, 0, TAU); g.fill(); g.beginPath(); g.arc(x + 14, y - 5, 8, 0, TAU); g.fill(); g.fillRect(x + 18, y - 3, 4, 15); for (const lx of [-10, -4, 4, 10]) g.fillRect(x + lx, y + 5, 4, 10) };
    for (let y = 34; y < S; y += 64) for (let x = 24; x < S; x += 64) ele(x + ((y / 64 | 0) % 2) * 28, y) }),
  tiedye: () => PBR.tex('tiedye'),
  floral: () => PBR.tex('floral')
};
const DECAL = {
  giant: () => canvasTex('d_giant', 256, (g, S) => { const k = S / 128; g.scale(k, k); g.strokeStyle = g.fillStyle = '#f4f0e8'; g.lineWidth = 3; g.beginPath(); g.arc(64, 60, 34, 0, TAU); g.stroke();
    g.textAlign = 'center'; g.font = 'bold 15px Georgia'; g.fillText('GIANT', 64, 57); g.fillText('HOSTEL', 64, 72); g.font = '7px Georgia'; g.fillText('CHIANG MAI', 64, 84);
    for (let i = 0; i < 10; i++) { const a = -Math.PI * .9 + i * .2; g.beginPath(); g.arc(64 + Math.cos(a) * 30, 60 + Math.sin(a) * 30, 1.2, 0, TAU); g.fill() } }, true),
  ztoned: () => canvasTex('d_ztoned', 256, (g, S) => { const k = S / 128; g.scale(k, k); g.fillStyle = '#c86a4a'; g.beginPath(); g.arc(64, 70, 20, 0, TAU); g.fill(); g.fillStyle = '#1a1010'; g.fillRect(48, 63, 32, 7);
    g.fillStyle = '#ff9ad8'; g.font = 'bold italic 17px Georgia'; g.textAlign = 'center'; g.fillText('ZtonedApe', 64, 42);
    g.fillStyle = '#e83a30'; for (const x of [44, 64, 84]) { g.beginPath(); g.arc(x, 104, 7, Math.PI, 0); g.fill() } g.fillStyle = '#fff'; for (const x of [42, 47, 62, 67, 82, 87]) { g.beginPath(); g.arc(x, 101, 1.3, 0, TAU); g.fill() }
    g.fillStyle = '#7ad84a'; g.beginPath(); g.moveTo(64, 14); g.lineTo(70, 26); g.lineTo(64, 23); g.lineTo(58, 26); g.fill() }, true),
  oneLove: () => canvasTex('d_love', 256, (g, S) => { const k = S / 128; g.scale(k, k); g.fillStyle = '#141414'; g.font = 'bold 19px Georgia'; g.textAlign = 'center'; g.fillText('ONE LOVE', 64, 70) }, true)
};

/* ======================= materials ======================= */
function shirtCfg(sh, K) {
  const s = K.s, chestY = K.bones[K.idx.chest].pos[1], o = { rough: [.86, .7, .86, .86], h: PBR.tex('jersey'), hS: 14, hMask: [1, 1, 1, 1], h2: PBR.tex('furVar'), h2S: 5, h2Mask: [.35, .35, .35, .35], bump: .0007, sheen: 0x3a3a3a, envI: .35 };
  if (sh.fab) Object.assign(o, { cols: [0xffffff, 0xffffff, 0xffffff, 0xffffff], alb: FAB[sh.fab](), albS: sh.albS || 2.6, albMask: [1, 1, 1, 1], albMode: 1 });
  else Object.assign(o, { cols: [sh.col, sh.col, sh.col, sh.col], alb: PBR.tex('furVar'), albS: 6, albMask: [.25, .25, .25, .25] });
  if (sh.decal) o.decal = { tex: DECAL[sh.decal](), rect: [0, chestY + .02 * s, .24 * s, .24 * s], side: 1 };
  return o;
}
function pantsCfg(p) {
  const o = { rough: [.85, .85, .85, .85], h: PBR.tex(p.kind === 'denim' ? 'denim' : 'twill'), hS: p.kind === 'denim' ? 8 : 11, hMask: [1, 1, 1, 1], h2: PBR.tex('furVar'), h2S: 3, h2Mask: [.4, .4, .4, .4], bump: .0006, sheen: 0x303030, envI: .3 };
  if (p.fab) Object.assign(o, { cols: [0xffffff, 0xffffff, 0xffffff, 0xffffff], alb: FAB[p.fab](), albS: p.albS || 3, albMask: [1, 1, 1, 1], albMode: 1 });
  else if (p.kind === 'denim') Object.assign(o, { cols: [p.col, p.col, p.col, p.col], alb: PBR.tex('denimAlb'), albS: 7, albMask: [1, 1, 1, 1] });
  else Object.assign(o, { cols: [p.col, p.col, p.col, p.col], alb: PBR.tex('furVar'), albS: 4, albMask: [.35, .35, .35, .35] });
  return o;
}
const hairMat = col => PBR.charMat({ skinning: false, cols: [col, col, col, col], rough: [.55, .8, .55, .55], alb: PBR.tex('furH'), albS: 9, albMask: [.6, .2, .6, .6], h: PBR.tex('furH'), hS: 14, hMask: [1, .2, 1, 1], h2: PBR.tex('twill'), h2S: 20, h2Mask: [0, 1, 0, 0], bump: .0009, sheen: new THREE.Color(col).multiplyScalar(.8).getHex(), envI: .5 });
/* the build hook: patterned / printed garments replace the plain ones before any mesh is created */
function matHook(L) {
  return (mats, K, st) => {
    if (L.shirt.fab || L.shirt.decal) { mats.shirt.dispose(); mats.shirt = PBR.charMat(shirtCfg(L.shirt, K)) }
    if (L.pants.fab) { mats.pants.dispose(); mats.pants = PBR.charMat(pantsCfg(L.pants)) }
  };
}

/* ======================= looks ======================= */
/* look o: { sp: 'human_a' | 'human_b', height (m, default 1.75 / 1.65), skin, hair, eye, redEye,
             style: 'short' | 'messy' | 'blond' | 'bun' | 'long' | 'afro' | 'cap' | 'bald', capCol, beard, glasses, flower,
             shirt: { col | fab ('hawaii'|'reggae'|'tank'|'tiedye'|'floral'), decal ('giant'|'ztoned'|'oneLove'), sleeveless, loose },
             pants: { col | fab ('elephant'), kind ('twill'|'denim'), shorts, loose }, foot: 'sneaker' | 'flip', shoe (hex), lod, shadow } */
const STYLE = { short: 'hairShort', messy: 'hairMessy', blond: 'hairMessy', bun: 'hairBun', long: 'hairLong', afro: 'hairAfro', cap: 'cap', bald: null };
function look(o) {
  const sp = o.sp || 'human_a', skin = hexN(o.skin == null ? 0xd8a47a : o.skin), hair = hexN(o.hair == null ? 0x2a1a10 : o.hair), sh = o.shirt || {}, pt = o.pants || {};
  const hs = STYLE[o.style || 'short'], shoe = hexN(o.shoe == null ? 0x2a2a2c : o.shoe), flip = o.foot === 'flip';
  const L = { kind: 'human', human: true, sp, skin, eye: hexN(o.eye || 0x4a2a10), shells: 0, shadow: o.shadow,
    dark: new THREE.Color(skin).multiplyScalar(.72).lerp(new THREE.Color(0xa04a4a), .25).getHex(), nail: new THREE.Color(skin).lerp(new THREE.Color(0xffe8e0), .45).getHex(),
    shirt: { o: { loose: sh.loose || 1.08, sleeve: sh.sleeveless ? .07 : .5 }, col: hexN(sh.col == null ? 0xe8e4da : sh.col), fab: sh.fab, decal: sh.decal },
    pants: { o: Object.assign({ loose: pt.loose || (pt.shorts ? 1.14 : 1.06) }, pt.shorts ? { shorts: true } : {}), col: hexN(pt.col == null ? 0x3a3a52 : pt.col), kind: pt.kind || 'twill', fab: pt.fab },
    shoes: { o: flip ? { flip: true } : {}, cols: flip ? [shoe, 0x2a2622, shoe, new THREE.Color(shoe).multiplyScalar(.7).getHex()] : [shoe, 0xf0ece4, 0xe8e4da, new THREE.Color(shoe).multiplyScalar(.75).getHex()] },
    hat: hs ? { style: hs, cols: hs === 'cap' ? [hexN(o.capCol || 0x2a6a3a), hexN(o.capCol || 0x2a6a3a)] : [hair, hair] } : null,
    hairCol: hair, beard: !!o.beard, glasses: o.glasses, flower: o.flower, redEye: !!o.redEye, height: o.height };
  if (o.lod) L.ov = { h: .011 };
  L.matHook = matHook(L);
  return L;
}
const D = (L, p) => Object.assign({ sp: L.sp }, L.ov ? { ov: L.ov } : {}, p);
const partDescs = L => [D(L, { part: 'shirt', o: L.shirt.o }), D(L, { part: 'pants', o: L.pants.o }), D(L, { part: 'shoes', o: L.shoes.o })].concat(L.hat ? [D(L, { part: 'hat', style: L.hat.style })] : []);
/* warm the worker cache for a look (no meshes) */
function prefetchLook(L) { const parts = partDescs(L); GEN.data(D(L, { part: 'body', cover: parts.slice(0, 3) })); parts.forEach(GEN.data); if (L.beard) GEN.data(D(L, { part: 'hat', style: 'beard' })) }

/* ======================= props (rest character space, then parented to a bone) ======================= */
const SH = SO.shared;
function handFrame(K, k) { const H = K.hands[k], s = K.s; return { H, s, along: new V(...H.along), inward: new V(...H.inward), fwd: new V(...H.fwd), wr: new V(...H.wr), kn: new V(...H.kn) } }
/* a group whose local +y runs along `axis`, sitting at `pos` (rest char space) */
function placed(pos, axis, side) { const g = new THREE.Group(); g.position.copy(pos); g.quaternion.setFromUnitVectors(new V(0, 1, 0), axis.clone().normalize()); if (side) g.rotateY(side); return g }
const mesh = (geo, mat, x, y, z, par) => { const m = new THREE.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); m.castShadow = true; if (par) par.add(m); return m };
const PROP = {
  beer(st, k) { const F = handFrame(st.K, k), s = F.s, pos = F.wr.clone().addScaledVector(F.along, st.K.P.palmL * s * .55).addScaledVector(F.inward, .028 * s);
    const g = placed(pos, F.fwd.clone().addScaledVector(F.along, -.35)), glass = PBR.propMat({ color: 0x2a7a3a, roughness: .08, clearcoat: 1, transparent: true, opacity: .82, envI: 1.3 }), lab = PBR.propMat({ color: 0xe8d8a0, roughness: .6 });
    mesh(SH('sBeerB', () => new THREE.CylinderGeometry(.03, .03, .13, 16)), glass, 0, -.01, 0, g); mesh(SH('sBeerN', () => new THREE.CylinderGeometry(.011, .028, .07, 16)), glass, 0, .09, 0, g);
    mesh(SH('sBeerL', () => new THREE.CylinderGeometry(.0305, .0305, .06, 16, 1, true)), lab, 0, -.015, 0, g); g.scale.setScalar(s); return g },
  joint(st, k) { const F = handFrame(st.K, k), s = F.s, pos = F.kn.clone().addScaledVector(F.along, .03 * s).addScaledVector(F.inward, -.004 * s);
    const g = placed(pos, F.fwd.clone().addScaledVector(F.inward, -.3)), paper = PBR.propMat({ color: 0xf4f0e4, roughness: .85 }), ember = PBR.propMat({ color: 0xff6a2a, emissive: 0xff5a1a, emissiveIntensity: 1.6, roughness: .6 });
    mesh(SH('sJoint', () => new THREE.CylinderGeometry(.0045, .0035, .075, 8)), paper, 0, .02, 0, g); mesh(SH('sEmber', () => new THREE.SphereGeometry(.005, 8, 6)), ember, 0, .058, 0, g); g.scale.setScalar(s); return g },
  phone(st, k) { const F = handFrame(st.K, k), s = F.s, pos = F.wr.clone().addScaledVector(F.along, st.K.P.palmL * s * .7).addScaledVector(F.inward, .012 * s);
    const g = placed(pos, F.along), body = PBR.propMat({ color: 0x1a1a22, roughness: .3, metalness: .3 }), scr = PBR.propMat({ color: 0x6ac8ff, emissive: 0x6ac8ff, emissiveIntensity: .9, roughness: .1 });
    const ph = mesh(SH('sPhone', () => new THREE.BoxGeometry(.07, .145, .009)), body, 0, 0, 0, g); mesh(SH('sPhoneS', () => new THREE.BoxGeometry(.062, .13, .002)), scr, 0, 0, .005, ph);
    /* screen faces away from the palm (both axes are perpendicular to the fingers, so the long side stays along them) */
    ph.quaternion.setFromUnitVectors(new V(0, 0, 1), F.inward.clone().negate().applyQuaternion(g.quaternion.clone().invert()).setY(0).normalize()); g.scale.setScalar(s); return g },
  ukulele(st) { const K = st.K, s = K.s, ch = K.bones[K.idx.chest].pos, g = new THREE.Group(); g.position.set(.04 * s, ch[1] - .16 * s, ch[2] + .16 * s); g.rotation.set(-.12, 0, .95);
    const wood = PBR.propMat({ map: PBR.tex('wood'), color: 0xffffff, roughness: .35, clearcoat: .8, envI: .9 }), dark = PBR.propMat({ color: 0x2a1408, roughness: .5 }), str = PBR.propMat({ color: 0xeeeeee, roughness: .3 });
    const body = mesh(SH('sUkeB', () => { const sh = new THREE.Shape(), P = [[0, -.17], [.1, -.15], [.13, -.06], [.09, .01], [.1, .07], [.06, .12], [0, .13]]; sh.moveTo(0, -.17); sh.splineThru(P.slice(1).map(p => new THREE.Vector2(p[0], p[1]))); sh.splineThru(P.slice(0, -1).reverse().map(p => new THREE.Vector2(-p[0], p[1]))); const e = new THREE.ExtrudeGeometry(sh, { depth: .055, bevelEnabled: true, bevelThickness: .006, bevelSize: .006, bevelSegments: 2, curveSegments: 24 }); e.translate(0, 0, -.0275); return e }), wood, 0, 0, 0, g);
    mesh(SH('sUkeH', () => new THREE.CylinderGeometry(.03, .03, .004, 20).rotateX(Math.PI / 2)), dark, 0, .02, .035, g);
    mesh(SH('sUkeN', () => new THREE.BoxGeometry(.042, .3, .02)), dark, 0, .27, .02, g); mesh(SH('sUkeP', () => new THREE.BoxGeometry(.055, .08, .018)), wood, 0, .45, .015, g);
    for (const x of [-.012, -.004, .004, .012]) mesh(SH('sUkeS', () => new THREE.CylinderGeometry(.0009, .0009, .5, 4)), str, x, .2, .036, g);
    /* play pose (front, neck to the player's right) and carry pose (slung on the back), both in rest character space */
    g.userData.fret = new V(0, .32, .03); g.userData.strum = new V(0, .03, .05); g.userData.base = g.position.clone(); g.userData.q = g.quaternion.clone();
    g.userData.backP = new V(-.02 * s, ch[1] - .06 * s, ch[2] - .2 * s); g.userData.backQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(.1, Math.PI, -.75)); g.userData.rest = new V(...ch); return g },
  flower(st, col) { const K = st.K, s = K.s * K.P.head, hp = K.bones[K.idx.head].pos, g = new THREE.Group(); g.position.set(hp[0] + .085 * s, hp[1] + .11 * s, hp[2] + .03 * s); g.rotation.set(0, .9, .3);
    const pm = PBR.propMat({ color: col, roughness: .5 }), cm = PBR.propMat({ color: 0xffd84a, roughness: .5 });
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; mesh(SH('sPetal', () => new THREE.SphereGeometry(.011, 8, 6)), pm, Math.cos(a) * .012, Math.sin(a) * .012, 0, g).scale.set(1, 1, .4) } mesh(SH('sPetalC', () => new THREE.SphereGeometry(.006, 8, 6)), cm, 0, 0, .003, g);
    g.scale.setScalar(K.s); return g },
  glasses(st, tint) { const K = st.K, s = K.s * K.P.head, E = AN.eyes(K), hp = K.bones[K.idx.head].pos, g = new THREE.Group(); g.position.set(hp[0], hp[1], hp[2]);
    const fr = PBR.propMat({ color: typeof tint === 'number' ? tint : 0x18120e, roughness: .35, metalness: .2, clearcoat: .6 }), lens = PBR.propMat({ color: 0xd8e8f0, roughness: .02, transparent: true, opacity: .18, clearcoat: 1, envI: 1.4 });
    const r = .021 * s, z = E[0][2] + .02 * s, y = E[0][1];
    for (const e of [E[0], E[1]]) { const rim = mesh(SH('sRim', () => new THREE.TorusGeometry(1, .09, 6, 28)), fr, e[0] * 1.08, y, z, g); rim.scale.set(r, r * .82, r); const l = mesh(SH('sLens', () => new THREE.CircleGeometry(1, 24)), lens, e[0] * 1.08, y, z, g); l.scale.set(r, r * .82, 1) }
    mesh(SH('sBridge', () => new THREE.CylinderGeometry(.0018, .0018, 1, 6).rotateZ(Math.PI / 2)), fr, 0, y + .004 * s, z + .002 * s, g).scale.x = Math.abs(E[0][0]) * .5;
    for (const sd of [1, -1]) { const t = mesh(SH('sTemple', () => new THREE.BoxGeometry(.0025, .004, 1)), fr, sd * .073 * s, y + .002 * s, z - .045 * s, g); t.scale.z = .09 * s; t.rotation.y = sd * .08 }
    return g }
};
function attach(st, bone, obj) { obj.traverse(o => { if (o.isMesh) o.castShadow = st.L.shadow !== false }); st.R.attach(bone, obj); return obj }

/* ======================= posing on top of the classic pivots ======================= */
const GRIP = [.85, .9, .9, .88, .55], PINCH = [.55, .45, .75, .85, .45];
function poseHook(st, P) {
  const px = st.px, R = st.R, I = st.I, s = st.s, K = st.K, x = st.x;
  /* props in the hands: fingers close around them */
  for (const k of ['L', 'R']) { const p = x.hand[k]; if (p && p.visible !== false) P.curl[k] = p === x.joint ? PINCH : GRIP }
  /* sitting: the classic sitPose swings both legs forward (lL / lR rotation.x ~ -1.45) and drops the body; seat the
     pelvis at chair height above the floor, feet planted in front, idle hands resting on the thighs */
  const sit = px.lL.rotation.x < -1 && px.lR.rotation.x < -1; st.sitting = sit;
  if (sit) {
    const g = st.g, W = AV.W; g.getWorldPosition(_w); const sf = W && W.surface ? W.surface(_w.x, _w.z) : null, fl = sf == null ? 0 : sf, sy = g.scale.y || 1;
    const floorC = (fl - _w.y) / sy, hipR = R.rest[I.hips];
    P.hip.set(P.hip.x * .25, floorC + .46 / sy - hipR.y, -.03 * s); P.hipR = [-.06, P.hipR[1] * .3, 0]; P.spine[0] += .06; P.chest[0] += .03;
    for (const k of ['L', 'R']) { const sd = k === 'L' ? 1 : -1, ch = st.chains['l' + k], fr = R.rest[I['foot' + k]];
      P.feet[k].p.set(fr.x * 1.15 + sd * .02 * s, floorC + fr.y, hipR.z + ch.l1 * .95); P.feet[k].q.set(0, 0, 0, 1);
      const arm = k === 'L' ? px.aR : px.aL;   // classic aR = this rig's left arm
      if (arm.rotation.x > -.45 && !(st.x.uke && st.x.uke.visible && st.x.playing)) { const h = P.hands[k]; if (h) { h.p.set(sd * (K.P.hipW + .02) * s, floorC + .46 / sy + .1 * s, hipR.z + ch.l1 * .55); h.pole.copy(R.P[I['uarm' + k]]).add(_u.set(sd * .7, -.2, -.6)); P.curl[k] = [.35, .4, .45, .5, .25] } }
    }
  }
  /* ukulele: the classic play pose (aL bent across the body, aR strumming) becomes fret + strum targets on the instrument */
  const uke = x.uke; x.playing = !!(uke && uke.visible && px.aL.rotation.z < -.3 && px.aL.rotation.x < -.7);
  if (uke) { const U = uke.userData; uke.position.copy(x.playing ? U.base : U.backP).sub(U.rest); uke.quaternion.copy(x.playing ? U.q : U.backQ) }   // played in front, slung on the back otherwise
  if (x.playing) {
    const ch = R.rest[I.chest], cq = R.Q[I.chest], cp = R.P[I.chest], toC = (loc, out) => out.copy(loc).applyQuaternion(uke.userData.q).add(uke.userData.base).sub(ch).applyQuaternion(cq).add(cp);
    const strum = clamp((px.aR.rotation.x + .7) * .25, -.06, .06);
    const hR = P.hands.R, hL = P.hands.L;
    if (hR) { toC(uke.userData.fret, hR.p); hR.pole.copy(R.P[I.uarmR]).add(_u.set(-.8, -.6, .1)); P.curl.R = [.6, .75, .7, .65, .4] }
    if (hL) { toC(_v.copy(uke.userData.strum).add(_u.set(0, strum, 0)), hL.p); hL.pole.copy(R.P[I.uarmL]).add(_u.set(.8, -.5, -.3)); P.curl.L = [.35, .45, .55, .6, .3] }
  }
}

/* ======================= builders ======================= */
/* a soft-body human with the classic pivot API (a puppet driven by npc.js / world code) */
function buildHuman(L, opt) {
  opt = opt || {};
  const st = SO.build(L), g = st.g; st.npc = true; st.human = true; g.userData.kind = undefined;
  const top = (L.sp === 'human_b' ? 1.71 : 1.79), h = L.height || (L.sp === 'human_b' ? 1.66 : 1.76); g.scale.setScalar(h / top);
  st.x = { hand: { L: null, R: null }, uke: null, joint: null, playing: false };
  /* beard: a second rigid hair part on the head bone */
  if (L.beard) GEN.geo(D(L, { part: 'hat', style: 'beard' })).then(G => { const m = new THREE.Mesh(G.main, hairMat(L.hairCol)); m.castShadow = L.shadow !== false; m.receiveShadow = true; st.R.attach('head', m); C.stats.tris += G.tris });
  if (L.glasses) attach(st, 'head', PROP.glasses(st, L.glasses));
  if (L.flower) attach(st, 'head', PROP.flower(st, hexN(L.flower)));
  /* red eyes: bloodshot whites, a glowing ember-red iris (the multiverse's professional cloud-watchers) */
  if (L.redEye && st.eyes.length) { const m = st.eyes[0].material.clone(); m.color.set(0xff8070).convertSRGBToLinear(); m.emissive = new THREE.Color(0xff2a10).convertSRGBToLinear(); m.emissiveMap = m.map; m.emissiveIntensity = .55; PBR.track(m); st.eyes.forEach(e => e.material = m) }
  if (opt.puppet !== false) { SO.addProxies(st); st.poseHook = poseHook; const ctrl = C.brain(g, { external: true }); ctrl.wait = 0; SO.PUPPETS.add(ctrl); st.ctrl = ctrl }
  return st;
}
/* props by classic side: +1 = classic aR (this rig's LEFT hand), -1 = classic aL (right hand) */
function giveProp(st, name, side) {
  const k = side > 0 ? 'L' : 'R', p = attach(st, 'hand' + k, PROP[name](st, k)); st.x.hand[k] = p; if (name === 'joint') st.x.joint = p; st.g.userData[name] = p; return p;
}
C.softHuman = function (o) { const st = buildHuman(look(o || {})); return st.g };
C.softLook = look;

/* soft-body stoner: red-eyed cloud-watcher for js/stoners.js, same job as the classic C.stoner().
   Deterministic per seed: wild hair, mismatched festival clothes, joint in hand, joints always half-lit. */
C.softStoner = function (seed) {
  const r = rng((seed | 0) * 131 + 17), pick = a => a[Math.floor(r() * a.length) % a.length];
  const style = pick(['messy', 'messy', 'long', 'bun', 'blond', 'cap']);
  const st = buildHuman(look({
    sp: r() < .5 ? 'human_a' : 'human_b', height: 1.62 + r() * .16,
    skin: pick([0xf0c8a8, 0xd8a47a, 0xc8946a, 0xb07a50, 0x8a5a3a, 0x6a4028]),
    hair: pick([0x14100c, 0x4a2c18, 0xd8b860, 0xb0b0b0, 0xa83a1a, 0xe8e0d0]),
    style, capCol: pick([0x2a8a4a, 0xe8303a, 0xffd84a, 0x7a4ac8]), redEye: true, beard: r() < .32,
    flower: style === 'long' && r() < .5 ? pick([0xff6ad5, 0xffd84a, 0x7ff0ff]) : null,
    shirt: r() < .5 ? { fab: pick(['reggae', 'hawaii', 'tiedye']), loose: 1.12 } : { col: pick([0xff6a3a, 0x7a4ac8, 0x2a9a6a, 0xffd84a, 0x2a2a2a]) },
    pants: { col: pick([0x3a3a52, 0x6a6a5a, 0xc8b088, 0x2a2a2a, 0x4a6a3a, 0x6a2a4a]), shorts: r() < .7 },
    foot: r() < .65 ? 'flip' : 'sneaker', shoe: pick([0x2a2a2a, 0xe8e8e8, 0xe8303a, 0x3a6ad8, 0x8a5a3a])
  }));
  giveProp(st, 'joint', r() < .5 ? 1 : -1);
  st.g.userData.kind = 'stoner';
  return st.g;
};

/* the Giant Hostel crew: same people, same props, now soft-body (classic builders kept in C.classicCrew) */
C.classicCrew = C.crew;
const crewSt = (kind, o, props) => { const st = buildHuman(look(o)); st.g.userData.kind = kind; st.g.userData.human = true; (props || []).forEach(p => p(st)); return st.g };
C.crew = {
  /* Mutt: slim Thai woman, black Giant Hostel tee with the round white logo */
  mud: () => crewSt('mud', { sp: 'human_b', height: 1.58, skin: 0xc89068, hair: 0x14100c, style: 'bun', shirt: { col: 0x16161a, decal: 'giant' }, pants: { col: 0x4a5a7a, kind: 'denim' }, foot: 'sneaker', shoe: 0xf0f0f0 }),
  /* Nuni: pool champion; long black hair, a flower, red tank top, beer */
  nuni: () => crewSt('nuni', { sp: 'human_b', height: 1.6, skin: 0xc8946a, hair: 0x100c0a, style: 'long', flower: 0xff7ab8, shirt: { fab: 'tank', sleeveless: true, loose: 1.02 }, pants: { col: 0x2a2a34, shorts: true }, foot: 'flip', shoe: 0xe8303a }, [st => giveProp(st, 'beer', -1)]),
  /* Steve: blond ukulele player in a Hawaiian shirt */
  steve: () => { const g = crewSt('steve', { sp: 'human_a', height: 1.8, skin: 0xf0c0a0, hair: 0xe8c860, style: 'blond', eye: 0x3a6ab8, shirt: { fab: 'hawaii', loose: 1.12 }, pants: { col: 0xc8b088, shorts: true }, foot: 'flip', shoe: 0x6a4a2a });
    const st = g.userData.st, u = attach(st, 'chest', PROP.ukulele(st)); st.x.uke = u; g.userData.uke = u; return g },
  /* Dino: laid-back resident stoner: cap, beard, reggae tee, red eyes, a joint */
  dino: () => crewSt('dino', { sp: 'human_a', height: 1.76, skin: 0xd8a47a, hair: 0x5a5048, style: 'cap', capCol: 0x2a8a4a, beard: true, redEye: true, shirt: { fab: 'reggae', decal: 'oneLove', loose: 1.14, albS: 1.4 }, pants: { col: 0x6a6a5a, shorts: true }, foot: 'flip', shoe: 0x2a2a2a }, [st => giveProp(st, 'joint', 1)]),
  /* ZtonedApe: messy brown hair, glasses, beard, dark printed tee, red elephant shorts, olive slides */
  zape: () => crewSt('zape', { sp: 'human_a', height: 1.8, skin: 0xdca47c, hair: 0x4a2c18, style: 'messy', beard: true, glasses: true, redEye: true, shirt: { col: 0x2a1c1c, decal: 'ztoned' }, pants: { fab: 'elephant', shorts: true }, foot: 'flip', shoe: 0x4a5a2a }, [st => giveProp(st, 'joint', 1)]),
  nunyin: () => crewSt('nunyin', { sp: 'human_b', height: 1.56, skin: 0xc89068, hair: 0x18120e, style: 'bun', shirt: { col: 0x1a1a1a, sleeveless: true, loose: 1.02 }, pants: { col: 0x3a3a4a } }),
  golf: () => crewSt('golf', { sp: 'human_a', height: 1.66, skin: 0xd09a70, hair: 0x14100c, style: 'short', glasses: true, shirt: { col: 0x22222a, loose: 1.14 }, pants: { col: 0x3a3a3a, shorts: true }, shoe: 0x202020 }, [st => giveProp(st, 'phone', 1)]),
  guest: seed => { const L = randomHuman(seed * 31 + 7, {}), st = buildHuman(L); if ((seed * 7) % 3 === 0) giveProp(st, 'beer', -1); st.g.userData.human = true; return st.g }
};


/* ======================= random townsfolk + crowd actors ======================= */
const HUM = {
  skin: [0xf0c8a8, 0xe0ac69, 0xd8a47a, 0xc68642, 0xa86a3c, 0x8d5524, 0x5c3a21],
  hair: [0x14100c, 0x2a1a10, 0x4a2c18, 0x7a5230, 0xd8b860, 0xb0b0b0, 0x8a2a1a],
  styles: ['short', 'messy', 'bun', 'long', 'cap', 'afro', 'short'],
  shirt: [0xe8e4da, 0xd84a3a, 0x3a7ad8, 0xf2c43a, 0x2aa878, 0x7a4ac8, 0xe87aa8, 0x2a2a2e, 0xf08a2a, 0xff4ad2, 0x3ad8ff],
  fabs: ['hawaii', 'tiedye', 'reggae'],
  pants: [[0x5a7aa8, 'denim'], [0x2c3a5a, 'denim'], [0xb8a27a, 'twill'], [0x2a2a2c, 'twill'], [0x5a6a3a, 'twill'], [0xc8c2b4, 'twill'], [0x6a2a4a, 'twill']],
  shoe: [0xf2f2f0, 0x2a2a2c, 0x8a5a3a, 0x3a7ad8, 0xd84a3a]
};
/* variety is mostly colour (free); shape choices are kept small so the sculpt cache stays warm (2 builds x shorts x flip-flops) */
function randomHuman(seed, o) {
  const r = rng((seed | 0) * 2654435761 + 1013904223), pick = a => a[Math.floor(r() * a.length) % a.length];
  const sp = r() < .5 ? 'human_a' : 'human_b', shorts = r() < .45, flip = shorts && r() < .5, fabbed = r() < .22;
  return look({ sp, height: (sp === 'human_a' ? 1.68 : 1.57) + r() * .16, skin: pick(HUM.skin), hair: pick(HUM.hair), style: pick(HUM.styles), capCol: pick(HUM.shirt), eye: pick([0x4a2a10, 0x2a1a0a, 0x3a6a8a, 0x4a6a3a]),
    beard: sp === 'human_a' && r() < .22, glasses: r() < .2,
    shirt: fabbed ? { fab: pick(HUM.fabs), albS: 2.2 } : { col: pick(HUM.shirt) }, pants: (p => ({ col: p[0], kind: p[1], shorts }))(pick(HUM.pants)),
    foot: flip ? 'flip' : 'sneaker', shoe: pick(HUM.shoe), lod: o.lod, shadow: o.shadow });
}
const APE = { furs: [0x3a2a20, 0x5a3a22, 0x2a2a2a, 0x7a4a2a, 0xc8682a, 0x4a3a30], skins: [0xc79a6e, 0x8a6650, 0xb0846a, 0x6a4a3a], shirt: [0xff4ad2, 0xffd84a, 0x3ad8ff, 0x7aff8a, 0xff8a3a, 0xe83a30, 0xffffff, 0x2a2a3a, 0x8a3ab8, 0x2a6ad8] };
/* chimp townsfolk: exactly the villagers' sculpts (already cached), new colours */
function randomApe(seed, o) {
  const r = rng((seed | 0) * 2246822519 + 3266489917), pick = a => a[Math.floor(r() * a.length) % a.length], skin = pick(APE.skins), hat = r() < .4 ? pick(APE.shirt) : null;
  return { kind: 'npc', sp: 'chimp', ov: o.lod ? { s: 1.0, h: .016 } : { s: 1.0 }, fur: pick(APE.furs), skin, dark: new THREE.Color(skin).multiplyScalar(.45).getHex(), nail: 0xd8b090, tip: 0xffffff, eye: 0x6a3a14, strandF: 250, shells: o.shells == null ? 12 : o.shells, shadow: o.shadow,
    shirt: { o: { loose: 1.04, sleeve: .55 }, col: pick(APE.shirt) }, pants: { o: { loose: 1.1 }, col: pick([0x3a3a52, 0x2a2a2a, 0x5a3a2a, 0x3a5a3a]), kind: 'twill' }, shoes: { o: {}, cols: [pick([0x2a2a2c, 0xe8e4da, 0xd84a3a]), 0xe8e4da, 0x2a2a2c, 0x5a5a62] },
    hat: hat != null ? { style: 'kufi', cols: [hat, hat] } : null, size: .88 + r() * .16 };
}
const NAMES = { human: ['Backpacker Bea', 'Lars', 'Mai', 'Tomás', 'Aiko', 'Jules', 'Priya', 'Somchai', 'Noi', 'Ken', 'Lola', 'Finn'], ape: ['Bongo', 'Kofi', 'Mambo', 'Rasta Rumble', 'Coco', 'Big Banana', 'Dubwise', 'Selector Simba', 'Irie Ike'] };
/* actor: the forge-alien clip API (play('Idle'|'Walk'|'Dance'|'Wave'), acts, mixer.update) on a soft body, like C.alienActor.
   opt: { lod (coarser sculpt for crowds), shells (ape fur shells), shadow, beat } */
C.softActor = function (kind, seed, opt) {
  opt = opt || {};
  let st;
  if (kind === 'ape') { const L = randomApe(seed, opt); st = SO.build(L); st.npc = true; st.g.userData.kind = undefined; st.g.scale.setScalar(L.size) }
  else st = buildHuman(randomHuman(seed, opt), { puppet: false });
  const g = st.g, ctrl = C.brain(g, { external: true, beat: opt.beat || SO.defBeat }), R = st.R, I = st.I;
  const clip = d => ({ timeScale: 1, time: 0, getEffectiveWeight: () => 1, getClip: () => ({ duration: d }), reset() { return this }, play() { return this }, stop() { return this } });
  const A = { root: g, st, ctrl, cur: null, acts: { Idle: clip(3), Walk: clip(1), Dance: clip(4 * 60 / 124), Wave: clip(2) }, faceY: AN.eyes(st.K)[0][1] + .01 * st.s, kb: -1 };
  A.play = n => { if (A.cur === n || !A.acts[n]) return; A.cur = n; ctrl.mode = n === 'Dance' ? 'dance' : n === 'Wave' ? 'wave' : null };
  A.talk = (sec, lock) => { ctrl.talkUntil = AV.now() + (sec == null ? 2.5 : sec); if (lock != null) g.userData.chatting = !!lock };
  Object.defineProperty(A, 'air', { get: () => !!ctrl.air, set: v => { ctrl.air = !!v } });
  const beat = opt.beat || SO.defBeat, red = () => AV.S && AV.S.set && AV.S.set.reduce ? .4 : 1;
  A.update = dt => {
    if (!(dt > 0)) return; ctrl.update(dt, AV.now());
    /* soft-body bounce: belly, chest and shirt hem kick on every dance beat */
    if (ctrl.mode === 'dance') { const b = Math.floor(beat()); if (b !== A.kb) { A.kb = b; const e = red() * st.s, sp = st.springs; sp[0] && sp[0].kick(0, -.35 * e, 0); sp[1] && sp[1].kick(0, -.15 * e, 0); sp[5] && sp[5].kick(0, .2 * e, .05 * e); sp[6] && sp[6].kick(0, .2 * e, -.05 * e) } }
  };
  A.mixer = { update: A.update, stopAllAction() { }, uncacheRoot() { } };
  const ch = st.K.legs.L, name = NAMES[kind === 'ape' ? 'ape' : 'human'][Math.floor(rng(seed + 5)() * 12) % NAMES[kind === 'ape' ? 'ape' : 'human'].length];
  return { actor: A, root: g, name, S: { thigh: Math.hypot(ch.hj[1] - ch.kn[1], ch.hj[2] - ch.kn[2]) * g.scale.y, shin: Math.hypot(ch.kn[1] - ch.an[1], ch.kn[2] - ch.an[2]) * g.scale.y } };
};

/* warm the sculpt cache in the background (after the band / villager prefetch): the crew and the common crowd shapes */
C.prefetchSoft = function () {
  const crew = [{ sp: 'human_b', style: 'bun', shirt: { decal: 'giant' }, pants: { kind: 'denim' } }, { sp: 'human_b', style: 'long', shirt: { sleeveless: true, loose: 1.02 }, pants: { shorts: true }, foot: 'flip' },
    { sp: 'human_a', style: 'blond', shirt: { loose: 1.12 }, pants: { shorts: true }, foot: 'flip' }, { sp: 'human_a', style: 'cap', beard: true, shirt: { loose: 1.14 }, pants: { shorts: true }, foot: 'flip' },
    { sp: 'human_a', style: 'messy', beard: true, pants: { shorts: true }, foot: 'flip' }, { sp: 'human_b', style: 'bun', shirt: { sleeveless: true, loose: 1.02 } }, { sp: 'human_a', style: 'short', shirt: { loose: 1.14 }, pants: { shorts: true } }];
  crew.forEach(o => prefetchLook(look(o)));
  /* crowd actors (beings.js): coarse sculpts on Medium / High, full sculpts on Low (beings.js passes lod: undefined there) */
  const q = AV.kit && AV.kit.q ? AV.kit.q() : 2, crowdLod = q !== 0;
  for (const hat of [false, true]) { const L = randomApe(1, { lod: crowdLod }); L.hat = hat ? { style: 'kufi', cols: [0, 0] } : null; const P = [D(L, { part: 'shirt', o: L.shirt.o }), D(L, { part: 'pants', o: L.pants.o }), D(L, { part: 'shoes', o: L.shoes.o })].concat(L.hat ? [D(L, { part: 'hat', style: 'kufi' })] : []); GEN.data(D(L, { part: 'body', cover: P })); P.forEach(GEN.data) }
  for (const lod of [crowdLod]) for (const sp of ['human_a', 'human_b']) for (const shorts of [false, true]) for (const flip of shorts ? [false, true] : [false]) prefetchLook(look({ sp, style: 'short', pants: { shorts }, foot: flip ? 'flip' : 'sneaker', lod }));
};
setTimeout(() => { try { C.ready().then(() => C.prefetchSoft()) } catch (e) { console.warn(e) } }, 400);
})(window.AV);
