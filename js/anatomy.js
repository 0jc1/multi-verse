/* APEVERSE V0.9 - anatomy.js : ape anatomy as data (pure math, no THREE; runs in Node for benchmarking).
   One parametric great-ape body (skeleton + sculpt primitives) with three species presets that follow the band reference art:
   gorilla (broad, crested skull, heavy brow, flat nose), chimp (big ears, protruding muzzle) and orangutan (cheek flanges,
   throat sac, long arms, pot belly). Clothing, sneakers and hats are separate sculpts that share the same skeleton.
   Two humans and two aliens (alien_zib, alien_orbo: big crania, almond / cyclops eye sockets, spring-tipped antennae, a
   wobbling crown, skin-tight suit with glowing trims painted on the single body sculpt) use the same body builder.
   Character space: metres, y up, facing +z, the character's LEFT is +x. Bones have identity rest rotations. */
'use strict';
(function (factory) { const root = typeof window !== 'undefined' ? window : globalThis; factory(root); if (root.AV) (root.AV._gensrc = root.AV._gensrc || []).push(factory.toString()) })(function (root) {
const SC = typeof module !== 'undefined' && module.exports ? require('./sculpt.js') : root.AV.sculpt;
const AN = {};
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const len = a => Math.hypot(a[0], a[1], a[2]), nrm = a => mul(a, 1 / (len(a) || 1)), dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], lerp = (a, b, t) => add(a, mul(sub(b, a), t));
const mad = (a, d, t) => add(a, mul(d, t));
AN.v = { add, sub, mul, len, nrm, dot, cross, lerp, mad };

/* ---------- species presets (base units, multiplied by s) ---------- */
AN.SPECIES = {
  gorilla: { s: 1.16, face: 'gorilla', hipY: .94, chestY: 1.36, shY: 1.58, shW: .35, neckY: 1.62, neckZ: -.01, headY: 1.71, headZ: .06, armA: .40, arm1: .44, arm2: .42, palmL: .12, handW: 1.18, hipW: .12, kneeY: .52, ankleY: .11, footL: .25,
    chest: [.31, .25, .2], belly: [.25, .22, .21], pelvis: [.22, .14, .16], trap: 1.55, delt: .12, uarm: [.105, .085], farm: [.095, .068], thigh: [.125, .09], shin: [.088, .066], neckR: .13, head: 1.08,
    fur: { body: .016, head: .013, arm: .02, hand: .006 } },
  chimp: { s: 1.06, face: 'chimp', hipY: .98, chestY: 1.40, shY: 1.62, shW: .29, neckY: 1.70, neckZ: -.03, headY: 1.83, headZ: .02, armA: .48, arm1: .42, arm2: .40, palmL: .11, handW: 1.0, hipW: .11, kneeY: .53, ankleY: .11, footL: .23,
    chest: [.25, .21, .165], belly: [.2, .19, .17], pelvis: [.19, .13, .14], trap: 1.0, delt: .092, uarm: [.08, .062], farm: [.07, .05], thigh: [.1, .076], shin: [.072, .056], neckR: .085, head: 1.04,
    fur: { body: .016, head: .014, arm: .018, hand: .005 } },
  orangutan: { s: 1.1, face: 'orang', hipY: .94, chestY: 1.36, shY: 1.58, shW: .31, neckY: 1.64, neckZ: -.02, headY: 1.75, headZ: .04, armA: .44, arm1: .48, arm2: .46, palmL: .125, handW: 1.08, hipW: .12, kneeY: .51, ankleY: .11, footL: .24,
    chest: [.27, .22, .18], belly: [.27, .25, .25], pelvis: [.22, .15, .17], trap: 1.2, delt: .1, uarm: [.088, .068], farm: [.078, .056], thigh: [.11, .082], shin: [.078, .06], neckR: .12, head: 1.05,
    fur: { body: .04, head: .05, arm: .065, hand: .008 } },
  /* humans: bare skin, upright proportions, smaller hands (bulk scales the fixed-size muscle/foot blobs) */
  human_a: { s: 1, face: 'human', bare: true, bulk: .62, h: .0075, hipY: .96, chestY: 1.3, shY: 1.46, shW: .2, neckY: 1.5, neckZ: -.01, headY: 1.585, headZ: .0, armA: .2, arm1: .3, arm2: .27, palmL: .09, handW: .74, hipW: .09, kneeY: .52, ankleY: .085, footL: .25,
    chest: [.165, .15, .105], belly: [.135, .13, .085], pelvis: [.155, .11, .1], trap: .55, delt: .062, uarm: [.052, .042], farm: [.044, .032], thigh: [.085, .058], shin: [.058, .04], neckR: .055, head: 1,
    fur: { body: 0, head: 0, arm: 0, hand: 0 } },
  human_b: { s: .96, face: 'human', bare: true, bulk: .58, h: .0075, hipY: .96, chestY: 1.3, shY: 1.45, shW: .18, neckY: 1.5, neckZ: -.01, headY: 1.585, headZ: .0, armA: .22, arm1: .29, arm2: .26, palmL: .085, handW: .7, hipW: .1, kneeY: .52, ankleY: .085, footL: .24,
    chest: [.15, .14, .1], belly: [.125, .125, .08], pelvis: [.165, .12, .105], trap: .45, delt: .055, uarm: [.046, .038], farm: [.04, .03], thigh: [.09, .058], shin: [.056, .038], neckR: .05, head: .97,
    fur: { body: 0, head: 0, arm: 0, hand: 0 } },
  /* aliens (soft-body versions of the forge aliens Zib + Orbo): no fur; material channels are 0 suit, 1 skin, 2 dark, 3 glow.
     eye = [x, y, z, r] head-relative (x mirrored), eyeN eyes, eyeShape = almond scale, ant = antenna [base x, y, z, tip dx, dy, dz] */
  alien_zib: { s: 1, face: 'alien', alien: 'zib', bulk: .5, h: .012, hipY: .98, chestY: 1.3, shY: 1.46, shW: .18, neckY: 1.5, neckZ: -.01, headY: 1.62, headZ: .01, armA: .17, arm1: .32, arm2: .31, palmL: .085, handW: .78, fingL: 1.3, hipW: .085, kneeY: .52, ankleY: .085, footL: .23,
    chest: [.14, .14, .095], belly: [.11, .12, .08], pelvis: [.13, .1, .09], trap: .35, delt: .05, uarm: [.042, .034], farm: [.036, .026], thigh: [.07, .048], shin: [.048, .034], neckR: .038, head: 1,
    eye: [.056, .1, .112, .036], eyeN: 2, eyeShape: [1.4, .8, .75], eyeTilt: .38, ant: [.055, .29, -.05, .05, .15, .01], fur: { body: 0, head: 0, arm: 0, hand: 0 } },
  alien_orbo: { s: 1, face: 'alien', alien: 'orbo', bulk: .9, h: .0135, hipY: .56, chestY: .84, shY: .98, shW: .25, neckY: 1.0, neckZ: 0, headY: 1.06, headZ: .03, armA: .55, arm1: .25, arm2: .23, palmL: .075, handW: .85, fingL: 1, hipW: .11, kneeY: .3, ankleY: .07, footL: .2,
    chest: [.27, .24, .24], belly: [.31, .27, .29], pelvis: [.24, .15, .21], trap: .9, delt: .085, uarm: [.068, .054], farm: [.056, .044], thigh: [.1, .075], shin: [.072, .054], neckR: .13, head: 1.05,
    eye: [0, .13, .118, .066], eyeN: 1, eyeShape: [1, 1, .8], eyeTilt: 0, ant: [.06, .24, -.03, .06, .14, .02], fur: { body: 0, head: 0, arm: 0, hand: 0 } }
};

/* ---------- skeleton ---------- */
AN.skeleton = function (P) {
  const s = P.s, bones = [], idx = {};
  const B = (name, parent, pos, extra) => { idx[name] = bones.length; bones.push(Object.assign({ name, parent: parent == null ? -1 : idx[parent], pos }, extra || {})) };
  const S = v => mul(v, s);
  B('root', null, [0, 0, 0]);
  B('hips', 'root', S([0, P.hipY, 0]));
  B('spine', 'hips', S([0, P.hipY + (P.chestY - P.hipY) * .42, -.01]));
  B('chest', 'spine', S([0, P.chestY, -.02]));
  B('neck', 'chest', S([0, P.neckY, P.neckZ]));
  B('head', 'neck', S([0, P.headY, P.headZ]));
  B('jaw', 'head', S([0, P.headY + .03 * P.head, P.headZ + .06 * P.head]));
  const hands = {};
  for (const side of [1, -1]) {
    const k = side > 0 ? 'L' : 'R', th = P.armA;
    const clav = S([side * .05, P.shY + .02, -.01]), sh = S([side * P.shW, P.shY, -.03]);
    const d1 = nrm([side * Math.sin(th), -Math.cos(th), -.07]), el = mad(sh, d1, P.arm1 * s);
    const d2 = nrm([side * Math.sin(th) * .92, -Math.cos(th), .17]), wr = mad(el, d2, P.arm2 * s);
    B('clav' + k, 'chest', clav); B('uarm' + k, 'clav' + k, sh); B('farm' + k, 'uarm' + k, el); B('hand' + k, 'farm' + k, wr);
    /* hand frame: along (fingers), fwd (thumb side, across the knuckles), inward (palm normal) */
    const along = d2, fwd = nrm(sub([0, 0, 1], mul(along, along[2]))); let inward = nrm(cross(along, fwd)); if (inward[0] * side > 0) inward = mul(inward, -1);
    const hw = P.handW, kn = mad(wr, along, P.palmL * s), fingers = [];
    const offs = [.034, .012, -.01, -.03], lens = [.1, .112, .105, .086];
    for (let f = 0; f < 4; f++) {
      const base = add(mad(kn, fwd, offs[f] * s * hw), mul(along, (f === 0 || f === 3 ? -.008 : 0) * s)), L = lens[f] * s * hw * (P.fingL || 1), segs = [.45, .31, .24];
      const dirF = nrm(add(along, mul(fwd, (f - 1.5) * -.04))); let p = base; const j = [];
      for (let q = 0; q < 3; q++) { B('f' + f + q + k, q ? 'f' + f + (q - 1) + k : 'hand' + k, p); j.push(p); p = mad(p, dirF, L * segs[q]) } j.push(p); fingers.push(j);
    }
    const tb = add(add(mad(wr, along, .035 * s), mul(fwd, .032 * s * hw)), mul(inward, .014 * s)), td = nrm(add(add(mul(along, .55), mul(fwd, .7)), mul(inward, .32)));
    let p = tb; const tj = [], tl = [.046, .038, .032];
    for (let q = 0; q < 3; q++) { B('t' + q + k, q ? 't' + (q - 1) + k : 'hand' + k, p); tj.push(p); p = mad(p, td, tl[q] * s * hw) } tj.push(p);
    hands[k] = { along, fwd, inward, wr, kn, fingers, thumb: tj, d1, d2, sh, el };
  }
  const legs = {};
  for (const side of [1, -1]) {
    const k = side > 0 ? 'L' : 'R', x = side * P.hipW;
    const hj = S([x, P.hipY - .05, 0]), kn = S([x + side * .01, P.kneeY, .035]), an = S([x + side * .012, P.ankleY, -.01]), ball = S([x + side * .016, .03, P.footL * .68]), tip = S([x + side * .018, .025, P.footL]);
    B('thigh' + k, 'hips', hj); B('shin' + k, 'thigh' + k, kn); B('foot' + k, 'shin' + k, an); B('toe' + k, 'foot' + k, ball);
    legs[k] = { hj, kn, an, ball, tip };
  }
  /* soft-body (spring) bones */
  B('belly', 'spine', S([0, P.hipY + .17, .1 + P.belly[2] * .4]), { jiggle: 1 });
  B('chestJ', 'chest', S([0, P.chestY + .06, .12]), { jiggle: 1 });
  B('cheekL', 'head', S([.08 * P.head, P.headY + .07, P.headZ + .1]), { jiggle: 1 });
  B('cheekR', 'head', S([-.08 * P.head, P.headY + .07, P.headZ + .1]), { jiggle: 1 });
  B('throat', 'head', S([0, P.headY - .07, P.headZ + .08]), { jiggle: 1 });
  B('hemF', 'hips', S([0, P.hipY + .04, .16]), { jiggle: 1 });
  B('hemB', 'hips', S([0, P.hipY + .04, -.15]), { jiggle: 1 });
  const head = bones[idx.head].pos, hs = s * P.head;
  /* aliens: a wobbling cranium and two antennae (rigid base bone + spring tip bone, so the stalk bends) */
  let ant = null;
  if (P.face === 'alien') {
    B('crown', 'head', add(head, mul([0, .26, -.05], hs)), { jiggle: 1 });
    if (P.ant) { ant = {}; const A = P.ant; for (const side of [1, -1]) { const k = side > 0 ? 'L' : 'R', base = add(head, mul([side * A[0], A[1], A[2]], hs)), tip = add(base, mul([side * A[3], A[4], A[5]], hs)); B('ant' + k, 'head', base); B('antT' + k, 'ant' + k, tip, { jiggle: 1 }); ant[k] = { base, tip } } }
  }
  return { bones, idx, hands, legs, P, s, head, ant, top: add(head, mul([0, .33, 0], s * P.head)) };
};

/* ---------- body sculpt ---------- */
const M = { FUR: 0, SKIN: 1, DARK: 2, NAIL: 3 };
AN.M = M;
AN.body = function (K) {
  const P = K.P, s = K.s, I = K.idx, pos = n => K.bones[I[n]].pos, F = P.fur, pr = [];
  const E = (c, r, o) => pr.push(SC.ell(c, mul(r, s), o)), Cn = (a, b, ra, rb, o) => pr.push(SC.cone(a, b, ra * s, rb * s, o)), Sp = (c, r, o) => pr.push(SC.sph(c, r * s, o));
  const hips = pos('hips'), spine = pos('spine'), chest = pos('chest'), neck = pos('neck'), head = pos('head');
  /* torso */
  E(add(hips, mul([0, .02, -.01], s)), P.pelvis, { bone: I.hips, k: .06 * s, fur: F.body });
  E(add(spine, mul([0, -.03, .04], s)), P.belly, { bone: I.spine, k: .08 * s, fur: F.body * .7 });
  E(add(chest, mul([0, .06, 0], s)), P.chest, { bone: I.chest, k: .08 * s, fur: F.body });
  E(add(chest, mul([0, .1, -.05], s)), [P.chest[0] * 1.02, P.chest[1] * .78, P.chest[2] * .85], { bone: I.chest, k: .06 * s, fur: F.body });
  const kb = P.bulk || 1; for (const sd of [1, -1]) E(add(chest, mul([sd * .1 * kb, .08 * kb, .1 * kb], s)), [.11 * kb, .075 * kb, .06 * kb], { bone: I.chest, k: .05 * s * kb, fur: F.body * .5 });
  Cn(add(spine, mul([0, -.05, -.02], s)), add(chest, mul([0, .02, -.02], s)), P.belly[0] * .9, P.chest[0] * .85, { bone: I.spine, bone2: I.chest, t0: .3, t1: .8, k: .08 * s, fur: F.body });
  /* neck + traps */
  Cn(add(neck, mul([0, -.08, -.01], s)), add(head, mul([0, .02, -.02], s)), P.neckR, P.neckR * .85, { bone: I.neck, bone2: I.head, t0: .4, t1: .9, k: .05 * s, fur: F.body });
  for (const k of ['L', 'R']) { const sh = pos('uarm' + k), sd = k === 'L' ? 1 : -1; Cn(add(neck, mul([0, -.02, -.05], s)), add(sh, mul([-sd * .07, .035, -.02], s)), .065 * P.trap, .06 * Math.sqrt(P.trap), { bone: I.chest, k: .07 * s, fur: F.body }) }
  /* arms + hands */
  for (const k of ['L', 'R']) {
    const H = K.hands[k], sh = H.sh, el = H.el, wr = H.wr, sd = k === 'L' ? 1 : -1;
    Sp(add(sh, mul([sd * .015, -.01, 0], s)), P.delt, { bone: I['uarm' + k], k: .05 * s, fur: F.arm });
    Cn(sh, el, P.uarm[0], P.uarm[1], { bone: I['uarm' + k], k: .04 * s, fur: F.arm });
    pr.push(SC.ell(mad(lerp(sh, el, .5), H.fwd, .02 * s), mul([P.uarm[0] * .8, P.arm1 * .3, P.uarm[0] * .72], s), { rot: SC.basisY(H.d1, H.fwd), bone: I['uarm' + k], k: .04 * s, fur: F.arm }));
    Cn(el, wr, P.farm[0], P.farm[1], { bone: I['farm' + k], k: .035 * s, fur: F.arm });
    pr.push(SC.ell(lerp(el, wr, .28), mul([P.farm[0] * 1.08, P.arm2 * .3, P.farm[0] * .98], s), { rot: SC.basisY(H.d2, H.fwd), bone: I['farm' + k], k: .04 * s, fur: F.arm }));
    const hw = P.handW, rot = [H.fwd, H.along, H.inward];
    pr.push(SC.box(mad(wr, H.along, P.palmL * s * .5), mul([.048 * hw, P.palmL * .5, .022 * hw], s), .018 * s * hw, { rot, bone: I['hand' + k], k: .02 * s, fur: F.hand }));
    pr.push(SC.ell(add(mad(wr, H.along, P.palmL * s * .55), mul(H.inward, .014 * s * hw)), mul([.042 * hw, P.palmL * .48, .016 * hw], s), { rot, bone: I['hand' + k], k: .015 * s, mat: M.SKIN }));
    pr.push(SC.ell(add(mad(wr, H.along, .045 * s), mul(H.inward, .01 * s)), mul([.03 * hw, .03, .02 * hw], s), { rot, bone: I['hand' + k], k: .02 * s, mat: M.SKIN }));   // thenar pad
    H.fingers.forEach((j, f) => { const r0 = (f === 3 ? .016 : .019) * hw; for (let q = 0; q < 3; q++) Cn(j[q], j[q + 1], r0 * (1 - q * .1), r0 * (.92 - q * .12), { bone: I['f' + f + q + k], k: .008 * s, mat: M.SKIN });
      const tip = j[3], nd = nrm(sub(j[3], j[2])); pr.push(SC.ell(add(mad(tip, nd, -.012 * s), mul(H.inward, -.01 * s * hw)), mul([.011 * hw, .012, .004], s), { rot: [H.fwd, nd, H.inward], bone: I['f' + f + 2 + k], k: .004 * s, mat: M.NAIL })) });
    const T = H.thumb; for (let q = 0; q < 3; q++) Cn(T[q], T[q + 1], .021 * hw * (1 - q * .12), .018 * hw * (1 - q * .15), { bone: I['t' + q + k], k: .01 * s, mat: M.SKIN });
  }
  /* legs + feet (mostly hidden by clothes, kept anatomical so rips show fur) */
  for (const k of ['L', 'R']) {
    const L = K.legs[k], sd = k === 'L' ? 1 : -1;
    E(add(hips, mul([sd * .09 * kb, -.05, -.08 * kb], s)), [.11 * kb, .11 * kb, .09 * kb], { bone: I.hips, bone2: -1, k: .06 * s, fur: F.body });
    Cn(L.hj, L.kn, P.thigh[0], P.thigh[1], { bone: I['thigh' + k], k: .05 * s, fur: F.body });
    Cn(L.kn, L.an, P.shin[0], P.shin[1], { bone: I['shin' + k], k: .04 * s, fur: F.body });
    pr.push(SC.box(lerp(L.an, L.ball, .5), mul([.05 * kb, .035 * kb, .1], s), .03 * s * kb, { rot: SC.basisY([0, 1, 0], nrm(sub(L.ball, L.an))), bone: I['foot' + k], k: .03 * s, mat: M.SKIN }));
    Cn(L.ball, L.tip, .035 * kb, .03 * kb, { bone: I['toe' + k], k: .02 * s, mat: M.SKIN });
  }
  if (P.face === 'alien') {   /* skin-tight suit (channel 0) on torso, upper arms, legs and boots; neck, forearms and hands are bare skin */
    const skinB = new Set([I.neck, I.head, I.jaw]), feet = new Set([I.footL, I.footR, I.toeL, I.toeR]);
    for (const k of ['L', 'R']) { skinB.add(I['farm' + k]); skinB.add(I['hand' + k]); for (let q = 0; q < 3; q++) { skinB.add(I['t' + q + k]); for (let f = 0; f < 4; f++) skinB.add(I['f' + f + q + k]) } }
    for (const p of pr) { p.fur = 0; if (feet.has(p.bone)) p.mat = M.FUR; else if (p.mat === M.FUR && (skinB.has(p.bone) || skinB.has(p.bone2))) p.mat = M.SKIN }
    for (const k of ['L', 'R']) { const H = K.hands[k]; H.fingers.forEach((j, f) => pr.push(SC.sph(j[3], (f === 3 ? .012 : .014) * P.handW * s, { bone: I['f' + f + 2 + k], k: .006 * s, mat: M.SKIN }))) }   // round fingertip pads
  }
  AN.headPrims(K, pr);
  if (P.bare) for (const p of pr) { if (p.mat === M.FUR) p.mat = M.SKIN; p.fur = 0 }
  return pr;
};

/* ---------- heads ---------- */
AN.headPrims = function (K, pr) {
  const P = K.P, s = K.s * P.head, I = K.idx, H = K.bones[I.head].pos, F = P.fur, hb = I.head, jb = I.jaw;
  const at = v => add(H, mul(v, s));
  const E = (c, r, o) => pr.push(SC.ell(at(c), mul(r, s), Object.assign({ bone: hb }, o))), Cp = (a, b, r, o) => pr.push(SC.cap(at(a), at(b), r * s, Object.assign({ bone: hb }, o))), Sp = (c, r, o) => pr.push(SC.sph(at(c), r * s, Object.assign({ bone: hb }, o)));
  const SKIN = M.SKIN, DARK = M.DARK;
  if (P.face === 'gorilla') {
    E([0, .14, -.02], [.165, .15, .165], { k: .05 * s, fur: F.head });
    E([0, .245, -.06], [.06, .11, .13], { k: .07 * s, fur: F.head });                           // sagittal crest
    E([0, .1, -.1], [.15, .12, .1], { k: .05 * s, fur: F.head });
    Cp([-.085, .17, .125], [.085, .17, .125], .037, { k: .04 * s, mat: SKIN });                   // heavy brow ridge
    E([0, .11, .085], [.125, .1, .08], { k: .04 * s, mat: SKIN });
    E([0, .04, .13], [.105, .075, .078], { k: .05 * s, mat: SKIN });
    E([0, .098, .175], [.052, .036, .026], { k: .025 * s, mat: DARK });                            // flat wide nose
    for (const x of [-.022, .022]) Sp([x, .085, .196], .011, { op: 'sub', k: .006 * s });
    E([0, .035, .178], [.088, .034, .036], { k: .03 * s, mat: SKIN });
    E([0, -.008, .15], [.085, .042, .05], { bone: jb, k: .03 * s, mat: SKIN });
    E([0, .012, .186], [.07, .016, .022], { bone: jb, k: .02 * s, mat: DARK });
    Cp([-.065, .022, .2], [.065, .022, .2], .006, { op: 'sub', k: .008 * s });
    for (const x of [-.05, .05]) Sp([x, .13, .158], .03, { op: 'sub', k: .01 * s });
    for (const x of [-1, 1]) { E([x * .158, .11, -.02], [.016, .036, .03], { k: .015 * s, mat: SKIN }); E([x * .08, .068, .1], [.052, .046, .046], { k: .04 * s, mat: SKIN }) }
  } else if (P.face === 'orang') {
    E([0, .17, -.02], [.152, .165, .152], { k: .05 * s, fur: F.head * .5 });
    E([0, .2, .065], [.11, .09, .075], { k: .05 * s, mat: SKIN });                               // high bare forehead
    E([0, .1, .08], [.12, .12, .08], { k: .05 * s, mat: SKIN });
    E([0, .03, .12], [.088, .075, .08], { k: .05 * s, mat: SKIN });
    E([0, .1, .162], [.026, .014, .013], { k: .015 * s, mat: DARK });
    for (const x of [-.009, .009]) Sp([x, .094, .172], .0055, { op: 'sub', k: .004 * s });
    E([0, .028, .172], [.072, .042, .04], { k: .03 * s, mat: SKIN });
    E([0, -.032, .14], [.072, .048, .052], { bone: jb, k: .03 * s, mat: SKIN });
    E([0, -.005, .182], [.06, .016, .02], { bone: jb, k: .02 * s, mat: DARK });
    Cp([-.056, .008, .195], [.056, .008, .195], .006, { op: 'sub', k: .008 * s });
    for (const x of [-.043, .043]) Sp([x, .13, .15], .027, { op: 'sub', k: .01 * s });
    for (const x of [-1, 1]) pr.push(SC.ell(at([x * .17, .09, .035]), mul([.1, .145, .032], s), { rot: SC.basisEuler(0, x * .45, 0), bone: hb, k: .05 * s, mat: SKIN }));   // cheek flanges
    E([0, -.085, .06], [.15, .11, .115], { k: .07 * s, mat: SKIN });                              // throat sac
  } else if (P.face === 'human') {
    E([0, .1, -.012], [.079, .098, .096], { k: .03 * s, mat: SKIN });                      // cranium
    E([0, .035, .035], [.063, .07, .068], { k: .03 * s, mat: SKIN });                       // face / jaw
    E([0, -.03, .066], [.032, .024, .028], { bone: jb, k: .025 * s, mat: SKIN });            // chin
    for (const x of [-1, 1]) E([x * .044, .055, .058], [.03, .022, .03], { k: .025 * s, mat: SKIN });
    Cp([-.038, .087, .082], [.038, .087, .082], .011, { k: .02 * s, mat: SKIN });          // brow
    pr.push(SC.cone(at([0, .078, .09]), at([0, .036, .112]), .007 * s, .012 * s, { bone: hb, k: .012 * s, mat: SKIN }));   // nose bridge -> tip
    for (const x of [-1, 1]) { E([x * .012, .034, .1], [.01, .008, .009], { k: .008 * s, mat: SKIN }); Sp([x * .007, .028, .106], .0032, { op: 'sub', k: .003 * s }) }
    E([0, .013, .094], [.026, .0075, .01], { k: .008 * s, mat: DARK });                    // upper lip
    E([0, .0, .09], [.024, .0085, .011], { bone: jb, k: .008 * s, mat: DARK });             // lower lip
    Cp([-.025, .0065, .1], [.025, .0065, .1], .0018, { op: 'sub', k: .003 * s });
    for (const x of [-.032, .032]) Sp([x, .066, .089], .017, { op: 'sub', k: .008 * s });
    for (const x of [-1, 1]) { pr.push(SC.ell(at([x * .08, .058, -.005]), mul([.011, .03, .02], s), { rot: SC.basisEuler(0, x * .35, 0), bone: hb, k: .008 * s, mat: SKIN })); Sp([x * .086, .058, .0], .011, { op: 'sub', k: .006 * s }) }
  } else if (P.face === 'alien') {
    const o = (x) => Object.assign({ mat: SKIN }, x), Ey = P.eye, one = P.eyeN === 1, orbo = P.alien === 'orbo';
    if (orbo) {   /* Orbo: a wide round head that melts into the body, one huge eye, a wide grin */
      E([0, .13, -.01], [.165, .15, .155], o({ k: .06 * s }));
      E([0, .06, .06], [.13, .085, .1], o({ k: .06 * s }));
      E([0, .015, .07], [.09, .04, .07], o({ bone: jb, k: .04 * s }));                                      // lower jaw
      Cp([-.06, .045, .148], [.06, .045, .148], .007, { op: 'sub', k: .01 * s });                             // grin
      for (const x of [-1, 1]) Cp([x * .06, .045, .148], [x * .085, .06, .128], .006, { op: 'sub', k: .008 * s });
      E([0, .043, .14], [.07, .01, .02], o({ bone: jb, k: .01 * s, mat: DARK }));
      E([0, .205, .09], [.1, .035, .05], o({ k: .05 * s }));                                               // brow over the eye
    } else {      /* Zib: big swept-back cranium, narrow face, tiny chin */
      E([0, .17, -.035], [.155, .165, .16], o({ k: .06 * s }));
      E([0, .215, -.085], [.125, .125, .125], o({ k: .07 * s }));
      E([0, .08, .045], [.1, .095, .085], o({ k: .06 * s }));
      E([0, .02, .07], [.052, .045, .048], o({ bone: jb, k: .045 * s }));                                   // chin
      for (const x of [-1, 1]) E([x * .07, .07, .07], [.04, .03, .04], o({ k: .035 * s }));                   // cheekbones
      for (const x of [-1, 1]) Sp([x * .011, .052, .132], .0055, { op: 'sub', k: .004 * s });                // nostril slits
      Cp([-.028, .026, .118], [.028, .026, .118], .0045, { op: 'sub', k: .006 * s });                         // mouth
      E([0, .025, .113], [.032, .007, .012], o({ bone: jb, k: .008 * s, mat: DARK }));
    }
    /* eye sockets: the eyeballs (separate meshes, see chars_real) sit in these */
    const sh = P.eyeShape || [1, 1, 1], R = Ey[3] * 1.12;
    for (const x of one ? [0] : [-1, 1]) pr.push(SC.ell(at([x * Ey[0], Ey[1], Ey[2] - Ey[3] * .15]), mul([R * sh[0], R * sh[1], R * sh[2] * 1.3], s), { rot: SC.basisEuler(0, x * .3, x * (P.eyeTilt || 0)), op: 'sub', k: .014 * s }));
    if (one) pr.push(SC.ell(at([0, Ey[1], Ey[2] + .004]), mul([R * 1.18, R * 1.18, .02], s), { bone: hb, k: .02 * s, mat: DARK }));   // dark rim around the cyclops eye
    /* antennae: bendy stalk (base bone -> spring tip bone) with a glowing bulb */
    if (K.ant) for (const k of ['L', 'R']) { const A = K.ant[k];
      const sr = Math.max(.007, (P.h || .012) * .8);   // the stalk must stay thicker than the sculpt cell or it does not mesh
      pr.push(SC.cone(A.base, A.tip, sr * 1.7 * s, sr * s, { bone: I['ant' + k], bone2: I['antT' + k], t0: .15, t1: 1, k: .014 * s, mat: SKIN }));
      pr.push(SC.sph(A.tip, .024 * s, { bone: I['antT' + k], k: .008 * s, mat: M.NAIL })) }
  } else {   /* chimp */
    E([0, .15, -.03], [.152, .145, .16], { k: .05 * s, fur: F.head });
    E([0, .1, -.1], [.13, .12, .1], { k: .05 * s, fur: F.head });
    Cp([-.07, .165, .115], [.07, .165, .115], .026, { k: .04 * s, mat: SKIN });
    E([0, .12, .08], [.115, .1, .085], { k: .04 * s, mat: SKIN });
    E([0, .05, .125], [.09, .07, .08], { k: .05 * s, mat: SKIN });
    E([0, .105, .175], [.028, .018, .018], { k: .015 * s, mat: DARK });
    for (const x of [-.011, .011]) Sp([x, .098, .19], .0065, { op: 'sub', k: .004 * s });
    E([0, .045, .18], [.075, .036, .04], { k: .03 * s, mat: SKIN });
    E([0, -.002, .15], [.066, .036, .05], { bone: jb, k: .03 * s, mat: SKIN });
    E([0, .016, .184], [.06, .017, .024], { bone: jb, k: .02 * s, mat: DARK });
    /* a wide grin: the slit curls up at the corners */
    Cp([-.03, .026, .205], [.03, .026, .205], .006, { op: 'sub', k: .008 * s }); Cp([.03, .026, .205], [.062, .042, .19], .006, { op: 'sub', k: .008 * s }); Cp([-.03, .026, .205], [-.062, .042, .19], .006, { op: 'sub', k: .008 * s });
    for (const x of [-.046, .046]) Sp([x, .128, .158], .03, { op: 'sub', k: .01 * s });
    for (const x of [-1, 1]) { pr.push(SC.ell(at([x * .155, .12, -.01]), mul([.02, .062, .05], s), { rot: SC.basisEuler(0, x * .3, 0), bone: hb, k: .015 * s, mat: SKIN })); Sp([x * .17, .12, .005], .03, { op: 'sub', k: .015 * s }); E([x * .068, .075, .11], [.045, .04, .04], { k: .04 * s, mat: SKIN }) }
  }
};
/* eye placement (head-relative, for eyeball meshes) */
AN.eyes = function (K) {
  const P = K.P, s = K.s * P.head, f = P.face;
  if (f === 'alien') { const E = P.eye, e = [[E[0] * s, E[1] * s, E[2] * s], [-E[0] * s, E[1] * s, E[2] * s], E[3] * s]; e.n = P.eyeN || 2; e.shape = P.eyeShape || [1, 1, 1]; e.tilt = P.eyeTilt || 0; return e }
  if (f === 'human') return [[.032 * s, .066 * s, .08 * s], [-.032 * s, .066 * s, .08 * s], .0125 * s];
  const x = f === 'gorilla' ? .05 : f === 'orang' ? .043 : .046, y = f === 'chimp' ? .128 : .13, z = f === 'orang' ? .139 : .146, r = f === 'orang' ? .02 : .021;
  return [[x * s, y * s, z * s], [-x * s, y * s, z * s], r * s];
};

/* ---------- soft-body weight regions ---------- */
AN.jiggle = function (K, kind) {
  const I = K.idx, b = n => K.bones[I[n]].pos, s = K.s, P = K.P, J = [];
  J.push({ bone: I.belly, c: b('belly'), r: mul([P.belly[0] * 1.2, P.belly[1] * 1.1, P.belly[2] * 1.3], s), s: .85 });
  J.push({ bone: I.chestJ, c: b('chestJ'), r: mul([.22, .14, .14], s), s: .5 });
  J.push({ bone: I.cheekL, c: b('cheekL'), r: mul(P.face === 'orang' ? [.16, .2, .12] : [.07, .07, .07], s * P.head), s: .8 });
  J.push({ bone: I.cheekR, c: b('cheekR'), r: mul(P.face === 'orang' ? [.16, .2, .12] : [.07, .07, .07], s * P.head), s: .8 });
  if (P.face === 'orang') { J[2].c = add(b('head'), mul([.17, .09, .035], s * P.head)); J[3].c = add(b('head'), mul([-.17, .09, .035], s * P.head)) }
  J.push({ bone: I.throat, c: b('throat'), r: mul([.14, .1, .12], s * P.head), s: P.face === 'orang' ? .9 : .4 });
  if (P.face === 'alien') {   /* belly only on the torso (Orbo's arms hang right beside it); a soft, wobbling cranium */
    J[0].only = [I.hips, I.spine, I.chest]; J[0].s = P.alien === 'orbo' ? 1 : .6;
    J.push({ bone: I.crown, c: b('crown'), r: mul([.17, .15, .17], s * P.head), s: .5, only: [I.head] });
  }
  return J;
};
AN.hemJiggle = function (K) { const I = K.idx, b = n => K.bones[I[n]].pos, s = K.s; return [{ bone: I.hemF, c: b('hemF'), r: mul([.4, .14, .22], s), s: .7 }, { bone: I.hemB, c: b('hemB'), r: mul([.4, .14, .22], s), s: .7 }] };

/* ---------- clothing ---------- */
/* tee / shirt: o = { loose, sleeve (0..1 of upper arm), open (Hawaiian open collar), hem (m above hips) } */
AN.shirt = function (K, o) {
  o = o || {}; const P = K.P, s = K.s, I = K.idx, pos = n => K.bones[I[n]].pos, pr = [], lo = o.loose || 1;
  const hips = pos('hips'), spine = pos('spine'), chest = pos('chest'), neck = pos('neck');
  const E = (c, r, op) => pr.push(SC.ell(c, mul(r, s), op)), Cn = (a, b, ra, rb, op) => pr.push(SC.cone(a, b, ra * s, rb * s, op));
  E(add(hips, mul([0, .05, -.01], s)), [P.pelvis[0] * lo, P.pelvis[1], P.pelvis[2] * lo], { bone: I.hips, k: .07 * s });
  E(add(spine, mul([0, -.03, .045], s)), mul(P.belly, lo), { bone: I.spine, k: .09 * s });
  E(add(chest, mul([0, .06, 0], s)), [P.chest[0] * lo, P.chest[1], P.chest[2] * lo], { bone: I.chest, k: .09 * s });
  E(add(chest, mul([0, .1, -.05], s)), [P.chest[0] * 1.02, P.chest[1] * .78, P.chest[2] * .85], { bone: I.chest, k: .07 * s });
  const kb = P.bulk || 1; for (const sd of [1, -1]) E(add(chest, mul([sd * .1 * kb, .08 * kb, .1 * kb], s)), [.11 * kb, .075 * kb, .06 * kb], { bone: I.chest, k: .05 * s * kb });
  Cn(add(spine, mul([0, -.05, -.02], s)), add(chest, mul([0, .02, -.02], s)), P.belly[0] * .9 * lo, P.chest[0] * .85, { bone: I.spine, bone2: I.chest, t0: .3, t1: .8, k: .08 * s });
  for (const k of ['L', 'R']) {
    const H = K.hands[k], sd = k === 'L' ? 1 : -1, sl = o.sleeve || .55, end = lerp(H.sh, H.el, sl);
    Cn(add(neck, mul([0, -.02, -.05], s)), add(H.sh, mul([-sd * .07, .035, -.02], s)), .065 * P.trap, .06 * Math.sqrt(P.trap), { bone: I.chest, k: .07 * s });
    pr.push(SC.sph(add(H.sh, mul([sd * .015, -.01, 0], s)), P.delt * s, { bone: I['uarm' + k], k: .05 * s }));
    Cn(H.sh, mad(end, H.d1, .02 * s), P.uarm[0] * (lo > 1 ? 1.25 : 1.12), P.uarm[0] * (lo > 1 ? 1.25 : 1.05), { bone: I['uarm' + k], k: .05 * s });
    const cw = P.uarm[0] * 1.9 * s; pr.push(SC.box(mad(end, H.d1, .3 * s), [cw, .3 * s, cw], .01 * s, { rot: SC.basisY(H.d1), op: 'sub', k: .006 * s }));   // sleeve cut (only around the arm)
  }
  pr.push(SC.plane(add(hips, mul([0, o.hem == null ? .0 : o.hem, 0], s)), [0, -1, 0]));
  pr.push(SC.cone(add(neck, mul([0, -.05, P.neckZ < 0 ? .01 : .02], s)), add(neck, mul([0, .3, .04], s)), (P.neckR + .02) * s, (P.neckR + .03) * s, { op: 'sub', k: .015 * s }));
  if (o.open) pr.push(SC.box(add(neck, mul([0, -.1, .2], s)), mul([.06, .14, .12], s), .01 * s, { rot: SC.basisEuler(0, 0, 0), op: 'sub', k: .02 * s }));
  const folds = (x, y, z) => .0035 * s * SC.vnoise(x * 9 / s, y * 34 / s, z * 9 / s) + .002 * s * SC.vnoise(x * 30 / s, y * 30 / s, z * 30 / s);
  return { prims: pr, offset: .017 * s, disp: folds, dispAmp: .006 * s };
};
/* trousers: o = { loose, pockets, rips } */
AN.pants = function (K, o) {
  o = o || {}; const P = K.P, s = K.s, I = K.idx, pos = n => K.bones[I[n]].pos, pr = [], lo = o.loose || 1, hips = pos('hips');
  pr.push(SC.ell(add(hips, mul([0, .02, -.01], s)), mul([P.pelvis[0] * 1.02, P.pelvis[1] * 1.1, P.pelvis[2] * 1.04], s), { bone: I.hips, k: .06 * s }));
  for (const k of ['L', 'R']) {
    const L = K.legs[k], sd = k === 'L' ? 1 : -1;
    const kb = P.bulk || 1; pr.push(SC.ell(add(hips, mul([sd * .09 * kb, -.05, -.08 * kb], s)), mul([.11 * kb, .11 * kb, .09 * kb], s), { bone: I.hips, k: .06 * s }));
    pr.push(SC.cone(L.hj, L.kn, (P.thigh[0] + .012) * s * lo, (P.thigh[1] + .02) * s * lo, { bone: I['thigh' + k], k: .05 * s }));
    pr.push(SC.cone(L.kn, add(L.an, mul([0, -.01, .01], s)), (P.thigh[1] + .018) * s * lo, (P.shin[1] + .035) * s * lo, { bone: I['shin' + k], k: .04 * s }));
    if (o.pockets) pr.push(SC.ell(add(lerp(L.hj, L.kn, .55), mul([sd * (P.thigh[0] + .02), 0, .0], s)), mul([.03, .075, .06], s), { bone: I['thigh' + k], k: .025 * s }));
    if (o.rips) { const kp = add(lerp(L.hj, L.kn, .92), mul([0, 0, P.thigh[1] + .03], s)); pr.push(SC.ell(kp, mul([.05, .03, .04], s), { op: 'sub', k: .006 * s })); pr.push(SC.ell(add(lerp(L.hj, L.kn, .45), mul([sd * .02, 0, P.thigh[0] + .02], s)), mul([.035, .014, .03], s), { op: 'sub', k: .005 * s })) }
  }
  pr.push(SC.plane(add(hips, mul([0, .1, 0], s)), [0, 1, 0]));
  pr.push(SC.plane([0, (P.ankleY + .045) * s, 0], [0, -1, 0]));
  const folds = (x, y, z) => { const stack = Math.max(0, 1 - y / (.45 * s)); return (.003 + .004 * stack) * s * SC.vnoise(x * 10 / s, y * 38 / s, z * 10 / s) + .0015 * s * SC.vnoise(x * 34 / s, y * 34 / s, z * 34 / s) };
  return { prims: pr, offset: .016 * s, disp: folds, dispAmp: .008 * s };
};
/* sneakers (mat 0 upper, 1 sole, 2 laces/tongue, 3 accent panel) */
AN.shoes = function (K, o) {
  o = o || {}; const s = K.s, I = K.idx, pr = [], P = K.P;
  for (const k of ['L', 'R']) {
    const L = K.legs[k], sd = k === 'L' ? 1 : -1, fwd = nrm(sub([L.tip[0], 0, L.tip[2]], [L.an[0], 0, L.an[2]])), rot = SC.basisY([0, 1, 0], fwd), mid = lerp([L.an[0], 0, L.an[2]], [L.tip[0], 0, L.tip[2]], .42), x = L.an[0];
    const at = (f, y, side) => add(add(mad(mid, fwd, f * s), [0, y * s, 0]), mul([sd * side * s, 0, 0], 1));
    pr.push(SC.box(at(0, .022, 0), mul([.068, .022, .165], s), .02 * s, { rot, bone: I['foot' + k], k: .01 * s, mat: 1 }));
    pr.push(SC.box(at(.12, .022, 0), mul([.062, .021, .06], s), .02 * s, { rot, bone: I['toe' + k], k: .01 * s, mat: 1 }));
    pr.push(SC.ell(at(-.02, .07, 0), mul([.068, .06, .15], s), { rot, bone: I['foot' + k], k: .03 * s, mat: 0 }));
    pr.push(SC.ell(at(.1, .055, 0), mul([.062, .045, .075], s), { rot, bone: I['toe' + k], k: .03 * s, mat: 3 }));
    pr.push(SC.cone([x, (P.ankleY - .05) * s, L.an[2] - .015 * s], [x, (P.ankleY + (o.high ? .1 : .04)) * s, L.an[2] - .02 * s], .07 * s, .066 * s, { bone: I['shin' + k], k: .035 * s, mat: 0 }));
    pr.push(SC.ell(at(.04, .108, 0), mul([.034, .018, .085], s), { rot: SC.basisEuler(-.35, Math.atan2(fwd[0], fwd[2]), 0), bone: I['foot' + k], k: .012 * s, mat: 2 }));
    for (const sdd of [1, -1]) pr.push(SC.ell(at(-.01, .065, sdd * .064), mul([.006, .024, .085], s), { rot: SC.basisEuler(.25, Math.atan2(fwd[0], fwd[2]), 0), bone: I['foot' + k], k: .008 * s, mat: 3 }));
  }
  return { prims: pr, offset: 0 };
};
/* hats (rigid, head bone) */
AN.hat = function (K, style) {
  const s = K.s * K.P.head, H = K.bones[K.idx.head].pos, at = v => add(H, mul(v, s)), pr = [], hb = K.idx.head;
  if (style === 'beanie') {
    pr.push(SC.ell(at([0, .26, -.06]), mul([.182, .16, .185], s), { bone: hb, k: .03 * s, mat: 0 }));
    pr.push(SC.frustum(at([0, .175, -.01]), at([0, .245, -.04]), .181 * s, .184 * s, .012 * s, { bone: hb, k: .015 * s, mat: 1 }));
    pr.push(SC.plane(at([0, .18, 0]), nrm([0, -1, .3])));
  } else if (style === 'bucket') {
    pr.push(SC.frustum(at([0, .185, -.03]), at([0, .34, -.045]), .17 * s, .148 * s, .04 * s, { bone: hb, k: .03 * s, mat: 0 }));
    pr.push(SC.frustum(at([0, .2, -.03]), at([0, .175, -.03]), .172 * s, .262 * s, .008 * s, { bone: hb, k: .03 * s, mat: 1 }));
    pr.push(SC.frustum(at([0, .05, -.03]), at([0, .18, -.03]), .16 * s, .156 * s, .01 * s, { op: 'sub', k: .01 * s }));
  } else if (style === 'hairShort' || style === 'hairBun' || style === 'hairAfro' || style === 'hairLong' || style === 'cap') {
    if (style === 'hairAfro') pr.push(SC.ell(at([0, .13, -.02]), mul([.125, .12, .125], s), { bone: hb, k: .02 * s, mat: 0 }));
    else pr.push(SC.ell(at([0, .108, -.015]), mul([.088, .105, .104], s), { bone: hb, k: .02 * s, mat: 0 }));
    if (style === 'hairBun') pr.push(SC.sph(at([0, .17, -.085]), .042 * s, { bone: hb, k: .02 * s, mat: 0 }));
    if (style === 'hairLong') pr.push(SC.ell(at([0, .02, -.07]), mul([.085, .14, .05], s), { bone: hb, k: .04 * s, mat: 0 }));
    if (style === 'cap') { pr.push(SC.frustum(at([0, .135, .08]), at([0, .128, .17]), .075 * s, .07 * s, .004 * s, { bone: hb, k: .01 * s, mat: 1 })) }
    pr.push(SC.plane(at([0, style === 'cap' ? .13 : .1, .06]), nrm([0, -.55, 1])));                                     // hairline
    if (style !== 'hairLong') pr.push(SC.plane(at([0, .03, -.1]), nrm([0, -1, -.25])));
    pr.push(SC.sph(at([0, .06, .02]), .075 * s, { op: 'sub', k: .01 * s }));                                           // keep the face clear
    for (const x of [-1, 1]) pr.push(SC.sph(at([x * .085, .055, -.005]), .03 * s, { op: 'sub', k: .008 * s }));       // ears out
  } else {     // kufi / round cap
    pr.push(SC.ell(at([0, .24, -.05]), mul([.168, .13, .172], s), { bone: hb, k: .03 * s, mat: 0 }));
    pr.push(SC.plane(at([0, .2, 0]), nrm([0, -1, .2])));
  }
  return { prims: pr, offset: 0 };
};

/* ---------- alien suit trims, painted onto the meshed body by position: glow (channel 3) belt, chest emblem, cuffs and
   toe lights, dark (channel 2) soles. Only suit vertices are touched. ---------- */
AN.alienPaint = function (K, m) {
  const P = K.P, s = K.s, pos = m.pos, nor = m.nor, mat = m.mat, chest = K.bones[K.idx.chest].pos, orbo = P.alien === 'orbo';
  const beltY = (P.hipY + (P.chestY - P.hipY) * .2) * s, bw = .011 * s, emY = chest[1] + (orbo ? .02 : .05) * s, em = (orbo ? .04 : .026) * s;
  const sm = (a, c, x) => { const t = Math.min(1, Math.max(0, (x - a) / (c - a))); return t * t * (3 - 2 * t) };
  const set = (v, ch, w) => { if (w <= 0) return; for (let q = 0; q < 4; q++) mat[v * 4 + q] = mat[v * 4 + q] * (1 - w) + (q === ch ? w : 0) };
  const toes = ['L', 'R'].map(k => { const t = K.legs[k].tip; return [t[0], .05 * s, t[2] - .025 * s] });
  for (let v = 0; v < m.nv; v++) {
    if (mat[v * 4] < .5) continue;
    const x = pos[v * 3], y = pos[v * 3 + 1], z = pos[v * 3 + 2];
    let g = Math.abs(x) < P.pelvis[0] * 1.8 * s ? 1 - sm(bw * .55, bw, Math.abs(y - beltY)) : 0;
    if (nor[v * 3 + 2] > .35 && z > 0) g = Math.max(g, 1 - sm(em * .8, em, Math.abs(x) + Math.abs(y - emY)));
    for (const k of ['L', 'R']) { const H = K.hands[k], dx = x - H.sh[0], dy = y - H.sh[1], dz = z - H.sh[2], L = dx * H.d1[0] + dy * H.d1[1] + dz * H.d1[2], px = dx - H.d1[0] * L, py = dy - H.d1[1] * L, pz = dz - H.d1[2] * L;
      if (Math.hypot(px, py, pz) < P.uarm[0] * 2.2 * s) g = Math.max(g, 1 - sm(bw * .45, bw * .9, Math.abs(L - P.arm1 * s * .86))) }
    for (const t of toes) g = Math.max(g, 1 - sm(.012 * s, .017 * s, Math.hypot(x - t[0], y - t[1], z - t[2])));
    set(v, 3, g);
    if (y < .02 * s) set(v, 2, 1 - sm(.011 * s, .017 * s, y));
  }
};

/* ---------- one buildable part (runs inside the Web Worker) ----------
   d = { sp, ov, part: body|shirt|pants|shoes|hat, o, style, cover: [part descs] }
   For the body, every garment in d.cover is evaluated as a distance field: skin hidden deep under cloth is dropped
   (fewer triangles, no z-fighting) and fur is zeroed under clothes so the fur shells never poke through a shirt. */
AN.spec = function (K, d) {
  if (d.part === 'body') return { prims: AN.body(K), jig: AN.jiggle(K) };
  if (d.part === 'shirt') return Object.assign(AN.shirt(K, d.o), { jig: AN.jiggle(K).concat(AN.hemJiggle(K)) });
  if (d.part === 'pants') return AN.pants(K, d.o);
  if (d.part === 'shoes') return AN.shoes(K, d.o);
  if (d.part === 'hat') return Object.assign(AN.hat(K, d.style), { hMul: /^(hair|cap)/.test(d.style) ? .8 : 1.5 });
  throw new Error('unknown part ' + d.part);
};
AN.part = function (d) {
  const K = AN.skeleton(Object.assign({}, AN.SPECIES[d.sp], d.ov || {})), s = K.s, sp = AN.spec(K, d);
  const base = { h: (d.h || K.P.h || .012) * s * (sp.hMul || 1), bones: K.bones.length, tauB: .012 * s, aoScale: s, name: d.part };
  let m = SC.build(Object.assign(base, sp));
  if (d.part === 'body') {
    const fields = (d.cover || []).map(c => SC.field(AN.spec(K, c))), cov = new Float32Array(m.nv).fill(1e9);
    for (const F of fields) for (let v = 0; v < m.nv; v++) cov[v] = Math.min(cov[v], F(m.pos[v * 3], m.pos[v * 3 + 1], m.pos[v * 3 + 2]));
    for (let v = 0; v < m.nv; v++) { if (cov[v] < .003 * s) m.fur[v] = 0; else if (cov[v] < .02 * s) m.fur[v] *= .35 + .65 * (cov[v] - .003 * s) / (.017 * s) }
    if (fields.length) { const keep = v => cov[v] > -.0085 * s; const st = m.stages, ms = m.ms; m = SC.subset(m, keep); m.stages = st; m.ms = ms }
    for (let v = 0; v < m.nv; v++) { const f = Math.min(1, Math.max(0, (m.mat[v * 4] - .45) / .35)); m.fur[v] *= f * f * (3 - 2 * f) }   // no fur on bare skin
    if (K.P.face === 'alien') AN.alienPaint(K, m);
    m.shell = SC.subset(m, v => m.fur[v] > .0015);
  }
  return m;
};

if (typeof module !== 'undefined' && module.exports) module.exports = AN; else root.AV.anatomy = AN;
});
