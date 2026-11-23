/* APEVERSE - chars_regional.js : regional people for Jerusalem and the Judean Desert (loaded after chars_soft.js).
   Soft-body roles (same rig / IK / spring jiggle as every other human; garments sculpted by anatomy_regional.js):
     business / businesswoman  tailored jacket, tie or scarf, briefcase, phone
     soldier                   desert-tan uniform, plate vest with pouches, hydration pack, helmet, boots, radio
     orthodox                  long black coat, white shirt, black brimmed hat, beard
     vendor                    market seller: long sleeves, apron colours, flat cap or keffiyeh
     bedouin                   long thobe, keffiyeh with black agal cord, sandals
     hijabi                    long dress + headscarf
     pilgrim / tourist         travel clothes, camera, sun hat colours
     monk / nun                habit + hood / veil
     student, elder, guide     everyday locals
   C.regional.actor(role, seed)  -> { look, dress } for AV.beings.spawn specs
   C.regional.body(role, seed)   -> a puppet with the classic pivots for AV.npc.spawn({ body })
   Instanced street crowd: walker variants 'suit', 'orthodox', 'keff', 'hijab', 'soldier', 'robe', 'nun', 'monk' (C.walkerKit).
   Vehicles: CY.VB.bus (city bus), CY.VB.jeep (desert patrol jeep). */
'use strict';
(function (AV) {
const C = AV.chars, SK = C.softKit, PBR = AV.pbr, TAU = Math.PI * 2;
if (!SK || !PBR) { console.warn('chars_regional: soft-body kit missing'); return }
const V = THREE.Vector3, hexN = c => new THREE.Color(c).getHex();
const RG = C.regional = {};

/* ======================= fabrics ======================= */
SK.FAB.keffiyeh = () => SK.canvasTex('keffiyeh', 256, (g, S) => { g.fillStyle = '#f4f0e6'; g.fillRect(0, 0, S, S); g.strokeStyle = '#1a1a1e'; g.lineWidth = 3;
  for (let i = 0; i < S; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + S, S); g.stroke(); g.beginPath(); g.moveTo(i - S, 0); g.lineTo(i, S); g.stroke(); g.beginPath(); g.moveTo(i, 0); g.lineTo(i - S, S); g.stroke(); g.beginPath(); g.moveTo(i + S, 0); g.lineTo(i, S); g.stroke() }
  g.fillStyle = '#1a1a1e'; for (let y = 0; y < S; y += 64) g.fillRect(0, y + 28, S, 6) });
SK.FAB.keffRed = () => SK.canvasTex('keffRed', 256, (g, S) => { g.fillStyle = '#f2ece2'; g.fillRect(0, 0, S, S); g.strokeStyle = '#b8202a'; g.lineWidth = 4;
  for (let i = 0; i < S * 2; i += 18) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i - S, S); g.stroke(); g.beginPath(); g.moveTo(i - S, 0); g.lineTo(i, S); g.stroke() } });
SK.FAB.camo = () => SK.canvasTex('camo', 256, (g, S) => { const r = SK.rng(77); g.fillStyle = '#c2ad84'; g.fillRect(0, 0, S, S);
  for (const [col, n, sz] of [['#a8916a', 26, 34], ['#8a7552', 18, 26], ['#d6c39a', 20, 22]]) for (let i = 0; i < n; i++) { const x = r() * S, y = r() * S, rx = sz * (.5 + r()), ry = sz * (.3 + r() * .5), a = r() * TAU; SK.wrapStamp(g, S, () => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, a, 0, TAU); g.fill() }) } });
SK.FAB.pinstripe = () => SK.canvasTex('pinstripe', 128, (g, S) => { g.fillStyle = '#2a2e38'; g.fillRect(0, 0, S, S); g.fillStyle = 'rgba(200,200,210,.35)'; for (let x = 0; x < S; x += 16) g.fillRect(x, 0, 1, S) });
SK.FAB.embroidery = () => SK.canvasTex('embroid', 256, (g, S) => { g.fillStyle = '#1a1a22'; g.fillRect(0, 0, S, S); const cols = ['#c8202a', '#e8b030', '#2a6a4a'];
  for (let y = 8; y < S; y += 32) for (let x = 8; x < S; x += 32) { g.fillStyle = cols[((x + y) / 32 | 0) % 3]; g.save(); g.translate(x + 8, y + 8); g.rotate(Math.PI / 4); g.fillRect(-6, -6, 12, 12); g.restore() } });
SK.DECAL.tag = () => SK.canvasTex('d_tag', 128, (g, S) => { g.fillStyle = '#e8e4d8'; g.fillRect(40, 52, 48, 18); g.fillStyle = '#2a2a2a'; g.font = 'bold 11px Arial'; g.textAlign = 'center'; g.fillText('PATROL', 64, 65) }, true);

/* ======================= materials ======================= */
const clothMat = (cols, o) => PBR.charMat(Object.assign({ skinning: false, cols, rough: [.88, .7, .6, .88], alb: PBR.tex('furVar'), albS: 5, albMask: [.35, .25, .2, .35], h: PBR.tex('twill'), hS: 12, hMask: [1, .6, .3, 1], h2: PBR.tex('furVar'), h2S: 4, h2Mask: [.3, .3, .3, .3], bump: .0009, sheen: 0x3a3a3a, envI: .3 }, o || {}));
const propM = (c, o) => PBR.propMat(Object.assign({ color: c, roughness: .55 }, o || {}));

/* sculpted head part (anatomy_regional.js) on the head bone */
function headPart(st, style, mat) {
  SK.GEN.geo(SK.D(st.L, { part: 'hat', style })).then(G => { const m = new THREE.Mesh(G.main, mat); m.castShadow = st.L.shadow !== false; m.receiveShadow = true; st.R.attach('head', m); C.stats.tris += G.tris });
}
/* a frame whose local y runs along `y`, local x as close to `xHint` as possible */
function frame(pos, y, xHint) { const Y = y.clone().normalize(), Z = new V().crossVectors(xHint, Y).normalize(), X = new V().crossVectors(Y, Z), g = new THREE.Group(); g.position.copy(pos); g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z)); return g }
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d), cyl = (a, b, h, n) => new THREE.CylinderGeometry(a, b, h, n || 12);
const add = (par, geo, mat, x, y, z) => SK.mesh(geo, mat, x, y, z, par);

/* ======================= props ======================= */
const PROPS = {
  briefcase(st, k) { const F = SK.handFrame(st.K, k), s = F.s, g = frame(F.wr.clone().addScaledVector(F.along, st.K.P.palmL * s * .6), F.along, F.fwd), lea = propM(0x3a2416, { roughness: .45, clearcoat: .4 }), gold = propM(0xd8b050, { metalness: 1, roughness: .3 });
    add(g, SK.SH('rBrief', () => box(.4, .29, .09)), lea, 0, .19, 0); add(g, SK.SH('rBriefH', () => box(.12, .02, .025)), lea, 0, .03, 0); for (const x of [-.1, .1]) add(g, SK.SH('rBriefL', () => box(.025, .025, .095)), gold, x, .06, 0); g.scale.setScalar(s); return g },
  phoneEar(st, k) { const F = SK.handFrame(st.K, k), s = F.s, g = SK.placed(F.wr.clone().addScaledVector(F.along, st.K.P.palmL * s * .7).addScaledVector(F.inward, .012 * s), F.along), b = propM(0x1a1a22, { roughness: .3, metalness: .3 });
    add(g, SK.SH('sPhone', () => box(.07, .145, .009)), b, 0, 0, 0); g.scale.setScalar(s); return g },
  coffee(st, k) { const F = SK.handFrame(st.K, k), s = F.s, g = SK.placed(F.wr.clone().addScaledVector(F.along, st.K.P.palmL * s * .55).addScaledVector(F.inward, .03 * s), F.fwd.clone().addScaledVector(F.along, -.35));
    add(g, SK.SH('rCup', () => cyl(.036, .028, .11, 14)), propM(0xf4f0e8), 0, 0, 0); add(g, SK.SH('rCupL', () => cyl(.038, .038, .012, 14)), propM(0x2a2a2a), 0, .06, 0); add(g, SK.SH('rCupS', () => cyl(.0372, .0372, .03, 14, 1)), propM(0x6a4a2a), 0, 0, 0); g.scale.setScalar(s); return g },
  bag(st, k) { const F = SK.handFrame(st.K, k), s = F.s, g = frame(F.wr.clone().addScaledVector(F.along, st.K.P.palmL * s * .6), F.along, F.fwd), m = propM([0xf2f0ea, 0x3a8a4a, 0xe8c040][(st.rnd | 0) % 3], { roughness: .8 });
    add(g, SK.SH('rBag', () => box(.28, .32, .14)), m, 0, .26, 0); add(g, SK.SH('rBagH', () => new THREE.TorusGeometry(.06, .008, 6, 14, Math.PI)), m, 0, .1, 0).rotation.z = Math.PI; add(g, SK.SH('rBagF', () => box(.24, .1, .1)), propM(0xe8603a, { roughness: .7 }), 0, .1, 0); g.scale.setScalar(s); return g },
  beads(st, k) { const F = SK.handFrame(st.K, k), s = F.s, g = SK.placed(F.kn.clone(), F.along), m = propM(0x6a3a1a, { roughness: .3, clearcoat: .6 });
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; add(g, SK.SH('rBead', () => new THREE.SphereGeometry(.006, 6, 4)), m, Math.cos(a) * .025, .05 + Math.sin(a) * .035, .01) } g.scale.setScalar(s); return g },
  staff(st, k) { const F = SK.handFrame(st.K, k), s = F.s, g = SK.placed(F.wr.clone().addScaledVector(F.along, st.K.P.palmL * s * .55), new V(0, 1, 0));
    add(g, SK.SH('rStaff', () => cyl(.014, .016, 1.7, 8)), propM(0x6a4a2a, { roughness: .8 }), 0, -.15, 0); g.scale.setScalar(s); return g }
};
/* chest / hip gear (rest character space -> bone) */
const GEAR = {
  tie(st, col) { const K = st.K, s = K.s, ch = K.bones[K.idx.chest].pos, z = ch[2] + K.P.chest[2] * 1.06 * s + .022 * s, m = propM(col, { roughness: .4, sheen: 0 }), w = propM(0xf6f4ee, { roughness: .6 }), g = new THREE.Group();
    add(g, SK.SH('rCollar', () => box(.09, .07, .01)), w, 0, ch[1] + .155 * s, z - .008 * s).rotation.x = -.35;
    add(g, SK.SH('rKnot', () => box(.03, .028, .014)), m, 0, ch[1] + .13 * s, z + .002 * s);
    const t = add(g, SK.SH('rTie', () => { const sh = new THREE.Shape([new THREE.Vector2(-.016, 0), new THREE.Vector2(.016, 0), new THREE.Vector2(.03, -.25), new THREE.Vector2(0, -.29), new THREE.Vector2(-.03, -.25)]); return new THREE.ExtrudeGeometry(sh, { depth: .006, bevelEnabled: false }) }), m, 0, ch[1] + .118 * s, z - .004 * s); t.rotation.x = -.16;
    SK.attach(st, 'chest', g); return g },
  scarf(st, col) { const K = st.K, s = K.s, nk = K.bones[K.idx.neck].pos, m = propM(col, { roughness: .8 }), g = new THREE.Group();
    add(g, SK.SH('rScarf', () => new THREE.TorusGeometry(.07, .022, 8, 20)), m, 0, nk[1] - .03 * s, nk[2] + .005 * s).rotation.x = Math.PI / 2 - .25; SK.attach(st, 'chest', g); return g },
  radio(st) { const K = st.K, s = K.s, ch = K.bones[K.idx.chest].pos, z = ch[2] + K.P.chest[2] * 1.32 * s + .02 * s, m = propM(0x2a2a26, { roughness: .5 }), g = new THREE.Group();
    add(g, SK.SH('rRadio', () => box(.05, .09, .03)), m, .075 * s, ch[1] + .1 * s, z); add(g, SK.SH('rAnt', () => cyl(.003, .003, .12, 5)), m, .09 * s, ch[1] + .2 * s, z - .005 * s); SK.attach(st, 'chest', g); return g },
  camera(st) { const K = st.K, s = K.s, ch = K.bones[K.idx.chest].pos, z = ch[2] + K.P.chest[2] * 1.08 * s + .035 * s, b = propM(0x1a1a1e, { roughness: .4 }), gl = propM(0x8ab8d8, { roughness: .05, metalness: .2 }), g = new THREE.Group();
    add(g, SK.SH('rCam', () => box(.11, .07, .05)), b, 0, ch[1] - .02 * s, z); add(g, SK.SH('rLens', () => cyl(.025, .025, .045, 14).rotateX(Math.PI / 2)), b, 0, ch[1] - .02 * s, z + .045 * s); add(g, SK.SH('rGlass', () => cyl(.02, .02, .005, 14).rotateX(Math.PI / 2)), gl, 0, ch[1] - .02 * s, z + .07 * s);
    add(g, SK.SH('rStrap', () => new THREE.TorusGeometry(.12, .006, 4, 24, Math.PI)), b, 0, ch[1] + .1 * s, z - .04 * s).rotation.z = Math.PI; SK.attach(st, 'chest', g); return g },
  canteen(st) { const K = st.K, s = K.s, hp = K.bones[K.idx.hips].pos, m = propM(0x5a5a3a, { roughness: .7 }), g = new THREE.Group();
    add(g, SK.SH('rCant', () => cyl(.045, .045, .14, 12)), m, -.17 * s, hp[1] - .02 * s, -.02 * s); SK.attach(st, 'hips', g); return g },
  backpack(st, col) { const K = st.K, s = K.s, ch = K.bones[K.idx.chest].pos, m = propM(col, { roughness: .85 }), g = new THREE.Group();
    add(g, SK.SH('rPack', () => box(.3, .42, .16)), m, 0, ch[1] - .02 * s, ch[2] - K.P.chest[2] * 1.1 * s - .1 * s); add(g, SK.SH('rPackR', () => cyl(.06, .06, .3, 10).rotateZ(Math.PI / 2)), propM(0x3a4a2a), 0, ch[1] + .22 * s, ch[2] - K.P.chest[2] * 1.1 * s - .09 * s); SK.attach(st, 'chest', g); return g },
  apron(st, col) { const K = st.K, s = K.s, hp = K.bones[K.idx.hips].pos, m = propM(col, { roughness: .85, side: THREE.DoubleSide }), g = new THREE.Group();
    add(g, SK.SH('rApron', () => new THREE.PlaneGeometry(.34, .5)), m, 0, hp[1] - .16 * s, K.P.pelvis[2] * 1.2 * s + .03 * s); SK.attach(st, 'hips', g); return g }
};

/* ======================= roles ======================= */
const PAL = { skin: [0xf0c8a8, 0xe0b090, 0xd8a47a, 0xc8946a, 0xb07a50, 0x8d5524, 0x6a4028], hair: [0x14100c, 0x2a1a10, 0x4a2c18, 0x7a5230, 0xb0b0b0, 0xc8a060], suit: [0x22262e, 0x2e3440, 0x3a3a40, 0x1c1e24, 0x4a4a52, 0x2a3048, 0x5a4a3a],
  tie: [0x8a1a2a, 0x1a3a7a, 0x2a5a3a, 0x6a4a8a, 0xc8902a], cloth: [0xe8e4da, 0xd8c8a8, 0x9a8a6a, 0x6a7a8a, 0xb8a888, 0x8a3a3a, 0x3a5a6a], scarf: [0x2a3a6a, 0x6a2a4a, 0xc8b8a0, 0x1a1a1e, 0x8a6a4a, 0x3a6a5a, 0xd8d0c8, 0xb85a4a] };
/* role -> (rng) -> { look options for C.softLook, dress(st) } ; sculpt variety is kept small (2 builds per role) so the cache stays warm */
const ROLES = {
  business: r => { const suit = pick(r, PAL.suit), pin = r() < .25; return { look: { sp: 'human_a', height: 1.72 + r() * .14, skin: pick(r, PAL.skin), hair: pick(r, PAL.hair), style: r() < .7 ? 'short' : 'messy', beard: r() < .2, glasses: r() < .3,
      shirt: pin ? { fab: 'pinstripe', o: { jacket: true }, loose: 1.06, albS: 1.6 } : { col: suit, o: { jacket: true }, loose: 1.06 }, pants: { col: suit }, shoe: 0x1a1412 },
    dress: st => { GEAR.tie(st, pick(r, PAL.tie)); SK.giveProp(st, 'briefcase', -1); if (r() < .5) SK.giveProp(st, 'phone', 1) } } },
  businesswoman: r => { const suit = pick(r, [0x22262e, 0x3a3a48, 0x6a2a3a, 0xe8e0d0, 0x2a4a5a]); return { look: { sp: 'human_b', height: 1.6 + r() * .12, skin: pick(r, PAL.skin), hair: pick(r, PAL.hair), style: pick(r, ['bun', 'long', 'bun']), glasses: r() < .25,
      shirt: { col: suit, o: { jacket: true }, loose: 1.04 }, pants: { col: suit }, shoe: 0x1a1412 },
    dress: st => { GEAR.scarf(st, pick(r, PAL.scarf)); SK.giveProp(st, r() < .5 ? 'briefcase' : 'coffee', -1); if (r() < .6) SK.giveProp(st, 'phone', 1) } } },
  soldier: r => { const tan = pick(r, [0xb8a27a, 0xa8946c, 0xc2ad84]), w = r() < .25; return { look: { sp: w ? 'human_b' : 'human_a', height: (w ? 1.62 : 1.74) + r() * .1, skin: pick(r, PAL.skin), hair: pick(r, PAL.hair), style: w ? 'bun' : 'short',
      shirt: { fab: 'camo', o: { long: true, vest: true }, loose: 1.1, albS: 2.2 }, pants: { fab: 'camo', loose: 1.12, albS: 2.4 }, boots: true, shoe: 0x6a5238,
      tweak: L => { L.shirt.cols = [0xffffff, hexN(0x7a6a4a), hexN(0x5a4e38), 0xffffff] } },
    dress: st => { headPart(st, 'helmet', clothMat([tan, 0x5a4a32, tan, tan], { alb: SK.FAB.camo(), albS: 6, albMode: 1, albMask: [1, 0, 0, 0] })); GEAR.radio(st); GEAR.canteen(st); if (r() < .5) SK.giveProp(st, 'coffee', -1) } } },
  orthodox: r => ({ look: { sp: 'human_a', height: 1.68 + r() * .14, skin: pick(r, [0xf0c8a8, 0xe0b090, 0xd8a47a]), hair: pick(r, [0x14100c, 0x2a1a10, 0x4a2c18, 0x8a8a8a]), style: 'short', beard: true, glasses: r() < .35,
      shirt: { col: 0x141416, o: { robe: .48 }, loose: 1.08 }, pants: { col: 0x141416 }, shoe: 0x0e0e10 },
    dress: st => { headPart(st, 'fedora', clothMat([0x101012, 0x1a1a1e, 0x101012, 0x101012], { rough: [.6, .4, .6, .6], sheen: 0x202020 })); GEAR.tie(st, 0xf6f4ee); if (r() < .4) SK.giveProp(st, 'bag', -1) } }),
  student: r => { const w = r() < .5; return { look: { sp: w ? 'human_b' : 'human_a', height: (w ? 1.6 : 1.72) + r() * .12, skin: pick(r, PAL.skin), hair: pick(r, PAL.hair), style: pick(r, w ? ['long', 'bun', 'messy'] : ['short', 'messy', 'cap']), capCol: pick(r, PAL.scarf), glasses: r() < .3,
      shirt: { col: pick(r, PAL.cloth.concat([0x3a7ad8, 0xd84a3a, 0x2aa878])) }, pants: { col: pick(r, [0x5a7aa8, 0x2c3a5a, 0xb8a27a]), kind: 'denim' } },
    dress: st => { GEAR.backpack(st, pick(r, [0x3a6a3a, 0xd8402a, 0x2a4a8a, 0xe8a030, 0x2a2a2a])); if (r() < .5) SK.giveProp(st, 'phone', 1); if (!w && r() < .4) headPart(st, 'kippah', clothMat([0x2a3a6a, 0x2a3a6a, 0x2a3a6a, 0x2a3a6a])) } } },
  vendor: r => ({ look: { sp: 'human_a', height: 1.68 + r() * .12, skin: pick(r, [0xd8a47a, 0xc8946a, 0xb07a50, 0x8d5524]), hair: pick(r, PAL.hair), style: r() < .6 ? 'cap' : 'short', capCol: pick(r, [0x3a3a3a, 0xe8e4da, 0x5a4a3a]), beard: r() < .6,
      shirt: { col: pick(r, PAL.cloth), o: { long: true } }, pants: { col: pick(r, [0x3a3a3a, 0x5a4a3a, 0x2a2a34]) } },
    dress: st => { GEAR.apron(st, pick(r, [0xe8e0d0, 0x3a5a6a, 0x8a3a3a])); if (r() < .4) SK.giveProp(st, 'beads', 1) } }),
  bedouin: r => ({ look: { sp: 'human_a', height: 1.68 + r() * .14, skin: pick(r, [0xc8946a, 0xb07a50, 0x8d5524, 0xa86a3c]), hair: 0x14100c, style: 'bald', beard: r() < .8,
      shirt: { col: pick(r, [0xf2eee4, 0xe8e0d0, 0xc8b898, 0x6a5a4a]), o: { robe: .76 }, loose: 1.12 }, pants: { col: 0xe8e0d0 }, foot: 'flip', shoe: 0x5a3a22 },
    dress: st => { headPart(st, 'keffiyeh', clothMat([0xffffff, 0x101012, 0xffffff, 0xffffff], { alb: r() < .5 ? SK.FAB.keffRed() : SK.FAB.keffiyeh(), albS: 9, albMode: 1, albMask: [1, 0, 0, 0] })); if (r() < .5) SK.giveProp(st, 'staff', 1) } }),
  hijabi: r => ({ look: { sp: 'human_b', height: 1.58 + r() * .12, skin: pick(r, PAL.skin), hair: 0x14100c, style: 'bald', glasses: r() < .2,
      shirt: { col: pick(r, [0x2a2a34, 0x5a4a6a, 0x3a5a6a, 0x8a6a5a, 0xd8d0c0, 0x1a1a22]), o: { robe: .74 }, loose: 1.1 }, pants: { col: 0x2a2a2e } },
    dress: st => { const c = pick(r, PAL.scarf); headPart(st, 'hijab', clothMat([c, c, c, c], { rough: [.7, .7, .7, .7], sheen: 0x404040 })); if (r() < .5) SK.giveProp(st, 'bag', -1) } }),
  embroidered: r => ({ look: { sp: 'human_b', height: 1.58 + r() * .1, skin: pick(r, [0xd8a47a, 0xc8946a, 0xb07a50]), hair: 0x14100c, style: 'bald',
      shirt: { fab: 'embroidery', o: { robe: .76 }, loose: 1.1, albS: 2 }, pants: { col: 0x1a1a22 } },
    dress: st => { headPart(st, 'hijab', clothMat([0xf2eee4, 0xf2eee4, 0xf2eee4, 0xf2eee4])); SK.giveProp(st, 'bag', -1) } }),
  pilgrim: r => { const w = r() < .5; return { look: { sp: w ? 'human_b' : 'human_a', height: (w ? 1.6 : 1.72) + r() * .14, skin: pick(r, PAL.skin), hair: pick(r, PAL.hair), style: pick(r, ['cap', 'short', 'long', 'bun']), capCol: pick(r, [0xf2f0ea, 0xe8c040, 0x3a7ad8, 0xd84a3a]), glasses: r() < .4,
      shirt: { col: pick(r, [0xf2f0ea, 0x3a7ad8, 0xe8c040, 0xd84a3a, 0x2aa878, 0xe87aa8]) }, pants: { col: pick(r, [0xb8a27a, 0x5a7aa8, 0x2a2a2c]), shorts: r() < .4 }, shoe: pick(r, [0xf2f2f0, 0x8a5a3a]) },
    dress: st => { GEAR.camera(st); if (r() < .5) GEAR.backpack(st, pick(r, [0x3a6a3a, 0x2a4a8a, 0xe8a030])); if (r() < .3) SK.giveProp(st, 'beads', 1) } } },
  monk: r => ({ look: { sp: 'human_a', height: 1.7 + r() * .12, skin: pick(r, PAL.skin), hair: pick(r, PAL.hair), style: 'short', beard: r() < .7,
      shirt: { col: pick(r, [0x4a3424, 0x3a2a20, 0x1a1a1e]), o: { robe: .8 }, loose: 1.14 }, pants: { col: 0x2a2a2a }, foot: 'flip', shoe: 0x3a2a1a },
    dress: st => { headPart(st, 'hood', clothMat([0x4a3424, 0x4a3424, 0x4a3424, 0x4a3424])); SK.giveProp(st, 'beads', 1) } }),
  nun: r => ({ look: { sp: 'human_b', height: 1.6 + r() * .1, skin: pick(r, PAL.skin), hair: 0x14100c, style: 'bald', glasses: r() < .3,
      shirt: { col: pick(r, [0x1a1a1e, 0xe8e6e0, 0x6a6a72]), o: { robe: .8 }, loose: 1.12 }, pants: { col: 0x1a1a1e } },
    dress: st => { headPart(st, 'hijab', clothMat([0x16161a, 0xf6f6f2, 0x16161a, 0x16161a], { rough: [.8, .8, .8, .8] })); SK.giveProp(st, 'beads', 1) } }),
  elder: r => ({ look: { sp: 'human_a', height: 1.64 + r() * .1, skin: pick(r, PAL.skin), hair: 0xc8c8c4, style: r() < .5 ? 'cap' : 'short', capCol: pick(r, [0x3a3a3a, 0x5a4a3a, 0x2a3a5a]), beard: r() < .5, glasses: r() < .7,
      shirt: { col: pick(r, PAL.cloth), o: { long: true } }, pants: { col: pick(r, [0x3a3a3a, 0x5a4a3a, 0x6a6a5a]) } },
    dress: st => { if (r() < .6) SK.giveProp(st, 'staff', 1); else SK.giveProp(st, 'beads', 1) } }),
  guide: r => ({ look: { sp: 'human_b', height: 1.64, skin: 0xd8a47a, hair: 0x2a1a10, style: 'cap', capCol: 0xe8c040, glasses: true, shirt: { col: 0x2aa878 }, pants: { col: 0xb8a27a }, shoe: 0xf2f2f0 },
    dress: st => { GEAR.backpack(st, 0x3a4a6a); GEAR.camera(st) } })
};
const pick = (r, a) => a[Math.floor(r() * a.length) % a.length];
RG.roles = Object.keys(ROLES);
/* garment print scale (albS) is applied after look() builds the descriptor */
function prep(lk) { const t0 = lk.tweak, sa = lk.shirt && lk.shirt.albS, pa = lk.pants && lk.pants.albS; if (!sa && !pa) return lk; return Object.assign({}, lk, { tweak: L => { if (sa) L.shirt.albS = sa; if (pa) L.pants.albS = pa; if (t0) t0(L) } }) }
RG.actor = function (role, seed) { const r = SK.rng((seed | 0) * 2654435761 + role.length * 977 + 7), R = (ROLES[role] || ROLES.student)(r); return { look: prep(R.look), dress: R.dress } };
/* puppet body with the classic pivots (AV.npc.spawn) */
RG.body = function (role, seed, over) { const a = RG.actor(role, seed), st = SK.buildHuman(SK.look(Object.assign({}, a.look, over || {}))); st.g.userData.human = true; a.dress(st); return st.g };
SK.PROP.briefcase = PROPS.briefcase; SK.PROP.coffee = PROPS.coffee; SK.PROP.bag = PROPS.bag; SK.PROP.beads = PROPS.beads; SK.PROP.staff = PROPS.staff;
/* colours for the instanced walker variants */
RG.walkCols = function (v, r) {
  const P = a => a[Math.floor(r() * a.length) % a.length], skin = P(PAL.skin), hair = P(PAL.hair);
  const c = { suit: [P(PAL.suit), P(PAL.suit)], orthodox: [0x141416, 0x141416], soldier: [0xb8a27a, 0xa8946c], hijab: [P([0x2a2a34, 0x5a4a6a, 0x3a5a6a, 0x8a6a5a, 0xd8d0c0]), 0x2a2a2e], keff: [P([0xf2eee4, 0xe8e0d0, 0xc8b898, 0x8a7a6a]), 0xe8e0d0],
    nun: [P([0x1a1a1e, 0xe8e6e0, 0x5a5a62]), 0x1a1a1e], monk: [0x4a3424, 0x2a2a2a], robe: [P([0xf2eee4, 0xc8b898, 0x6a5a4a, 0x3a3a42]), 0x3a3a3a] }[v];
  if (!c) return null;
  return { skin, hair: v === 'hijab' ? P(PAL.scarf) : v === 'nun' ? 0x16161a : v === 'orthodox' ? P([0x14100c, 0x2a1a10, 0x8a8a8a]) : v === 'monk' ? c[0] : hair, shirt: c[0], pants: c[1] };
};
RG.gear = GEAR; RG.headPart = headPart; RG.clothMat = clothMat;

/* ======================= quick-chat content per role (AV.beings: greet + "What's your story?") ======================= */
const L2 = (en, es) => [en, es];
const TALK = {
  business: { names: ['Avi Cohen', 'Rami Haddad', 'Omar Nasser', 'Eitan Ben-Ami', 'Yoav Mizrahi'],
    greet: [L2('Shalom! Sorry — quick, I have a meeting in five.', '¡Shalom! Perdona, rápido: tengo una reunión en cinco minutos.'), L2('Hi! You look like someone who needs an app.', '¡Hola! Tienes cara de necesitar una app.'), L2('Coffee break. Best ten minutes of my day.', 'Pausa para el café. Los mejores diez minutos de mi día.')],
    lines: [L2('Half the startups here began in a café on Jaffa Road. The other half in the queue for it.', 'La mitad de las startups de aquí nacieron en un café de la calle Jaffa. La otra mitad, en la cola.'), L2('My office looks at the Old City walls. Very bad for productivity, very good for the soul.', 'Mi oficina da a las murallas. Fatal para la productividad, genial para el alma.'), L2('Investors ask about scale. I tell them about three thousand years of history.', 'Los inversores preguntan por la escala. Yo les hablo de tres mil años de historia.')] },
  businesswoman: { names: ['Dana Levi', 'Michal Ben-David', 'Talia Shapiro', 'Rana Khoury', 'Noa Peretz'],
    greet: [L2('Hello! Lovely day for walking between meetings.', '¡Hola! Buen día para caminar entre reuniones.'), L2('Hi there — are you lost? Mamilla is that way.', 'Hola, ¿te has perdido? Mamilla está por allí.')],
    lines: [L2('I run a design studio near City Hall. We print our posters in three languages.', 'Llevo un estudio de diseño junto al Ayuntamiento. Imprimimos los carteles en tres idiomas.'), L2('Lunch is always hummus. It is not a habit, it is a policy.', 'El almuerzo siempre es hummus. No es costumbre, es política.')] },
  soldier: { names: ['Cpl. Itai', 'Pvt. Shira', 'Sgt. Yoni', 'Cpl. Maya', 'Pvt. Daniel'],
    greet: [L2('Hey! Drink water — the sun here is no joke.', '¡Eh! Bebe agua: aquí el sol no es broma.'), L2('Shalom! Heading home for the weekend. My mother is cooking already.', '¡Shalom! Me voy a casa el fin de semana. Mi madre ya está cocinando.'), L2('Need directions? I know every bus line by heart.', '¿Necesitas indicaciones? Me sé todas las líneas de autobús.')],
    lines: [L2('Desert patrol is mostly rescuing hikers who went out at noon in flip-flops.', 'La patrulla del desierto consiste sobre todo en rescatar excursionistas que salen a mediodía en chanclas.'), L2('Night shift in the desert: a million stars and jackals singing. Best part of the job.', 'Turno de noche en el desierto: un millón de estrellas y chacales cantando. Lo mejor del trabajo.'), L2('Three liters of water a day, minimum. Sergeant’s orders.', 'Tres litros de agua al día, mínimo. Órdenes de la sargento.')] },
  orthodox: { names: ['Reb Shmuel', 'Mr. Friedman', 'Yaakov', 'Moshe'],
    greet: [L2('Shalom aleichem! Welcome to Jerusalem.', '¡Shalom aleijem! Bienvenido a Jerusalén.'), L2('Good day to you, traveller.', 'Buen día, viajero.')],
    lines: [L2('My family has lived in the Jewish Quarter for five generations.', 'Mi familia vive en el Barrio Judío desde hace cinco generaciones.'), L2('On Friday afternoon the whole city slows down and smells of baking bread.', 'El viernes por la tarde toda la ciudad se calma y huele a pan recién horneado.')] },
  vendor: { names: ['Abu Sami', 'Hassan', 'Moshe the fruit man', 'Yusuf', 'Avraham'],
    greet: [L2('Ahlan! Come, look — everything fresh today!', '¡Ahlan! Ven, mira: ¡hoy todo está fresco!'), L2('Best price for you, my friend!', '¡El mejor precio para ti, amigo!'), L2('Taste first, buy later!', '¡Primero prueba, luego compra!')],
    lines: [L2('My grandfather sold spices on this exact corner. The corner is older than him.', 'Mi abuelo vendía especias en esta misma esquina. La esquina es más vieja que él.'), L2('Bargain with a smile and you always win. Even when you lose.', 'Regatea con una sonrisa y siempre ganas. Incluso cuando pierdes.')] },
  bedouin: { names: ['Abu Musa', 'Suleiman', 'Hamad', 'Eid'],
    greet: [L2('Ahlan wa sahlan! You are welcome here.', '¡Ahlan wa sahlan! Aquí eres bienvenido.'), L2('Sit, sit. First tea, then talk.', 'Siéntate, siéntate. Primero el té, luego hablamos.')],
    lines: [L2('Our tents are woven from goat hair. In the sun they shade, in the rain they swell and keep the water out.', 'Nuestras tiendas se tejen con pelo de cabra. Con sol dan sombra; con lluvia se hinchan y no dejan pasar el agua.'), L2('A guest is a gift. Three days of hospitality, no questions asked.', 'El huésped es un regalo. Tres días de hospitalidad sin preguntas.')] },
  hijabi: { names: ['Layla', 'Amira', 'Fatima', 'Rana', 'Nour'],
    greet: [L2('Marhaba! Welcome.', '¡Marhaba! Bienvenido.'), L2('Salaam! Are you looking for the market?', '¡Salam! ¿Buscas el mercado?')],
    lines: [L2('I teach maths at a school near Damascus Gate. The students are louder than the souk.', 'Enseño matemáticas en un colegio junto a la Puerta de Damasco. Los alumnos son más ruidosos que el zoco.'), L2('The best knafeh is in the Old City. I will not tell you which shop — you must find it.', 'El mejor knafeh está en la Ciudad Vieja. No te diré qué tienda: tienes que encontrarla.')] },
  embroidered: { names: ['Umm Khalil', 'Samira', 'Hanan'],
    greet: [L2('Welcome, welcome. Grape leaves, fresh from the hills!', 'Bienvenido. ¡Hojas de parra, frescas de las colinas!')],
    lines: [L2('My mother taught me this embroidery. Every village has its own pattern.', 'Mi madre me enseñó este bordado. Cada pueblo tiene su propio dibujo.'), L2('I come in from the village every morning with herbs and vegetables.', 'Vengo del pueblo cada mañana con hierbas y verduras.')] },
  pilgrim: { names: ['Pilgrim Maria', 'Tourist Hans', 'Backpacker Lucy', 'Pilgrim José', 'Grandma Ruth', 'Tourist Kenji'],
    greet: [L2('Isn’t it incredible? I’ve dreamed of coming here for years!', '¿No es increíble? ¡Llevaba años soñando con venir!'), L2('Excuse me, could you take our photo?', 'Perdona, ¿nos haces una foto?')],
    lines: [L2('I walked the Via Dolorosa this morning. My feet hurt, my heart is full.', 'Esta mañana recorrí la Vía Dolorosa. Me duelen los pies, pero tengo el corazón lleno.'), L2('We floated in the Dead Sea yesterday. My hair is still crunchy.', 'Ayer flotamos en el Mar Muerto. Todavía tengo el pelo crujiente.')] },
  monk: { names: ['Brother Francis', 'Father Theodoros', 'Brother Matteo'],
    greet: [L2('Peace be with you.', 'La paz sea contigo.'), L2('Welcome, pilgrim of the multiverse.', 'Bienvenido, peregrino del multiverso.')],
    lines: [L2('Our order has kept a house in Jerusalem for centuries. The stones remember everyone.', 'Nuestra orden tiene casa en Jerusalén desde hace siglos. Las piedras recuerdan a todos.')] },
  nun: { names: ['Sister Agnes', 'Sister Marta', 'Sister Hripsime'],
    greet: [L2('Good day, child. Mind the steps.', 'Buen día, hijo. Cuidado con los escalones.')],
    lines: [L2('We bake bread for the hostel every morning before the bells.', 'Horneamos pan para el albergue cada mañana antes de las campanas.')] },
  student: { names: ['Noam', 'Lior', 'Sara', 'Adam', 'Rawan', 'Yuval'],
    greet: [L2('Hey! Are you on the exchange programme?', '¡Hola! ¿Estás en el programa de intercambio?'), L2('Yo — the falafel on Jaffa Road is the best, trust me.', 'Oye, el falafel de la calle Jaffa es el mejor, créeme.')],
    lines: [L2('I study archaeology. In this city that just means looking down when you walk.', 'Estudio arqueología. En esta ciudad eso solo significa mirar al suelo al caminar.'), L2('Friday night we go to Mahane Yehuda — the market turns into bars.', 'El viernes por la noche vamos a Mahane Yehuda: el mercado se convierte en bares.')] },
  elder: { names: ['Abu Khalil', 'Grandpa Yehuda', 'Mr. Petrosyan', 'Old Nikolai'],
    greet: [L2('Sit, sit. Young people walk too fast.', 'Siéntate. Los jóvenes andáis demasiado deprisa.'), L2('In my day, this street was all donkeys and bicycles.', 'En mis tiempos, esta calle era todo burros y bicicletas.')],
    lines: [L2('I have played backgammon at this café every afternoon for forty years. I am still winning.', 'Juego al backgammon en este café cada tarde desde hace cuarenta años. Sigo ganando.')] },
  guide: { names: ['Guide Ruthie', 'Guide Samir', 'Guide Anat'],
    greet: [L2('Tours! History included, sunscreen not.', '¡Tours! La historia está incluida; el protector solar, no.')],
    lines: [L2('Water, hat and comfortable shoes — the three essentials of any visit.', 'Agua, sombrero y zapatos cómodos: lo esencial de cualquier visita.')] }
};
RG.talk = function (role, seed) { const T = TALK[role] || TALK.student, i = Math.abs(seed | 0); return { name: T.names[i % T.names.length], greet: T.greet, lines: T.lines } };
/* a ready-to-spawn AV.beings spec for a role */
RG.being = function (role, x, z, seed, extra) { const a = RG.actor(role, seed), t = RG.talk(role, seed); return Object.assign({ kind: 'human', x, z, seed, role, look: a.look, dress: a.dress, name: t.name, greet: t.greet, lines: t.lines, area: { x, z, r: 8 } }, extra || {}) };

/* ======================= instanced street crowd variants ======================= */
const KK = C._kit, std = AV.std, W = std(0xffffff, .85), VAR = C.walkerVar;
if (VAR && KK) {
  const hp = (u, side) => { const arm = side > 0 ? u.aR : u.aL, p = new THREE.Group(); p.position.set(0, -.8 * u.s - .02, .05); arm.add(p); return p };
  const robe = (g, u, len, slot) => KK.part(g, u.Gx.cyl, W, 0, (1.0 - len / 2) * u.s, 0, .3 * u.s * u.big, len * u.s, .23 * u.s * u.big, slot || 'shirt');
  const hatBrim = (u, col, crownH) => { const k = u.k, m = std(col, .6); KK.part(u.head, u.Gx.cyl, m, 0, .2 * k, -.01 * k, .38 * k, .025 * k, .38 * k, 'fixed'); KK.part(u.head, u.Gx.cyl, m, 0, (.22 + crownH / 2) * k, -.01 * k, .25 * k, crownH * k, .25 * k, 'fixed') };
  Object.assign(VAR, {
    suit: { style: 'short', extra: (g, u) => { const s = u.s; KK.part(g, u.Gx.box, std(0x8a1a2a, .5), 0, 1.6 * s, .19 * s, .06 * s, .34 * s, .02 * s, 'fixed'); KK.part(g, u.Gx.box, std(0xf6f4ee, .6), 0, 1.86 * s, .16 * s, .13 * s, .08 * s, .02 * s, 'fixed');
      KK.part(hp(u, 1), u.Gx.box, std(0x3a2416, .5), 0, -.16 * s, .04 * s, .07 * s, .26 * s, .36 * s, 'fixed') } },
    orthodox: { style: 'short', beard: true, extra: (g, u) => { hatBrim(u, 0x101012, .2); robe(g, u, .55); KK.part(g, u.Gx.box, std(0xf6f4ee, .6), 0, 1.84 * u.s, .17 * u.s, .12 * u.s, .1 * u.s, .02 * u.s, 'fixed') } },
    keff: { style: 'bald', beard: true, extra: (g, u) => { const k = u.k; const kf = std(0xf2eee4, .85); KK.part(u.head, u.Gx.hem, kf, 0, .02 * k, -.02 * k, .3 * k, .34 * k, .31 * k, 'fixed'); KK.part(u.head, u.Gx.sph, kf, 0, -.18 * k, -.17 * k, .28 * k, .34 * k, .12 * k, 'fixed');
      KK.part(u.head, u.Gx.ring, std(0x101012, .5), 0, .22 * k, -.02 * k, .26 * k, .26 * k, .5, 'fixed', [Math.PI / 2, 0, 0]); robe(g, u, .86) } },
    hijab: { style: 'long', slim: true, extra: (g, u) => { const k = u.k; KK.part(u.head, u.Gx.hem, W, 0, .02 * k, -.005 * k, .3 * k, .34 * k, .31 * k, 'hair'); KK.part(u.head, u.Gx.sph, W, 0, -.28 * k, -.02 * k, .26 * k, .14 * k, .26 * k, 'hair'); robe(g, u, .84) } },
    nun: { style: 'long', slim: true, extra: (g, u) => { const k = u.k; KK.part(u.head, u.Gx.hem, std(0x16161a, .8), 0, .02 * k, -.005 * k, .3 * k, .34 * k, .31 * k, 'fixed'); KK.part(u.head, u.Gx.ring, std(0xf6f6f2, .7), 0, .1 * k, .02 * k, .26 * k, .26 * k, .5, 'fixed', [Math.PI / 2, 0, 0]); robe(g, u, .88) } },
    monk: { style: 'short', beard: true, extra: (g, u) => { const k = u.k; KK.part(u.head, u.Gx.sph, W, 0, -.05 * k, -.12 * k, .3 * k, .3 * k, .26 * k, 'shirt'); robe(g, u, .88) } },
    soldier: { style: 'short', extra: (g, u) => { const k = u.k, s = u.s, tan = std(0xa8946c, .8); KK.part(u.head, u.Gx.hem, tan, 0, .06 * k, -.01 * k, .31 * k, .3 * k, .32 * k, 'fixed'); KK.part(g, u.Gx.box, std(0x6a5a3e, .8), 0, 1.55 * s, .02 * s, .66 * s, .5 * s, .44 * s, 'fixed');
      KK.part(g, u.Gx.box, std(0x5a4e38, .8), 0, 1.55 * s, -.27 * s, .4 * s, .5 * s, .16 * s, 'fixed') } },
    robe: { style: 'cap', extra: (g, u) => robe(g, u, .86) }
  });
}

/* ======================= vehicles ======================= */
const CY = AV.city, K = AV.kit;
if (CY && CY.VB && K) {
  const M = K.M, B = K.BG, TY = 0x141414;
  const wheels = (out, zs, x, r) => { for (const z of zs) for (const s of [-1, 1]) out.push([B.cyl, TY, M(s * x, r, z, r, .3, r, 0, 0, Math.PI / 2)], [B.cyl, 0xa8acb2, M(s * (x + .02), r, z, r * .6, .31, r * .6, 0, 0, Math.PI / 2)]) };
  /* city bus (green livery, front = +z) */
  CY.VB.bus = col => { const c = col == null ? 0x2a8a4a : col, o = [[B.box, c, M(0, 1.75, 0, 2.5, 2.9, 11.6)], [B.box, 0xf2f2ee, M(0, 3.25, 0, 2.4, .12, 11.4)], [B.box, 0x26323a, M(0, 2.2, 0, 2.54, 1.0, 10.8), .15], [B.box, 0x26323a, M(0, 2.0, 5.82, 2.3, 1.6, .05), .2],
    [B.box, 0x1a1a1a, M(0, .55, 0, 2.3, .4, 11.2)], [B.box, 0xffe8a0, M(-.85, .9, 5.82, .3, .16, .05), 1], [B.box, 0xffe8a0, M(.85, .9, 5.82, .3, .16, .05), 1], [B.box, 0x9a1010, M(-.9, .9, -5.82, .25, .2, .05), .6], [B.box, 0x9a1010, M(.9, .9, -5.82, .25, .2, .05), .6],
    [B.box, 0xff9a1a, M(0, 3.0, 5.83, 1.6, .3, .04), .8]]; wheels(o, [-3.6, 3.6], 1.16, .52); return K.merge(o) };
  /* desert patrol jeep (open back, roll bar, spare wheel) */
  CY.VB.jeep = col => { const c = col == null ? 0xb8a27a : col, o = [[B.box, c, M(0, .85, .2, 1.8, .7, 4.2)], [B.box, c, M(0, 1.25, 1.35, 1.75, .2, 1.6)], [B.box, 0x26323a, M(0, 1.6, .5, 1.6, .6, .05), .15], [B.box, 0x3a3a32, M(0, 1.9, -.4, 1.7, .08, .08)],
    [B.box, 0x3a3a32, M(-.82, 1.55, -.4, .08, .7, .08)], [B.box, 0x3a3a32, M(.82, 1.55, -.4, .08, .7, .08)], [B.box, 0x2a2a26, M(0, .95, -1.95, 1.0, .5, .1)], [B.cyl, TY, M(0, 1.15, -2.1, .4, .25, .4, Math.PI / 2, 0, 0)],
    [B.box, 0xffe8a0, M(-.6, 1.0, 2.31, .22, .14, .04), 1], [B.box, 0xffe8a0, M(.6, 1.0, 2.31, .22, .14, .04), 1], [B.box, 0x1a1a1a, M(0, .7, 2.32, 1.5, .25, .05)], [B.cyl, 0x2a2a26, M(.7, 2.3, -1.2, .015, 1.8, .015)]];
    wheels(o, [-1.3, 1.45], .92, .42); return K.merge(o) };
  if (CY.VLEN) Object.assign(CY.VLEN, { bus: 12, jeep: 4.4 });
}
})(window.AV);
