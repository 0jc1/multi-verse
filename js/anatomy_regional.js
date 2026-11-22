/* APEVERSE - anatomy_regional.js : regional wardrobe for the soft-body humans (Jerusalem + Judean Desert).
   Loaded after anatomy_wear.js and BEFORE chars_real.js. Like anatomy_wear.js it runs in the page AND inside the sculpt
   workers (registered in AV._gensrc, so the character cache hash changes with it). Pure data, no THREE.
     shirt  o.long   -> full-length sleeves down to the wrist (uniforms, suits, robes)
            o.jacket -> tailored jacket: long sleeves, hem a hand below the belt (business suits)
            o.robe   -> long garment: long sleeves, skirt down to o.robe metres below the hips (thobe, frock coat, habit)
            o.vest   -> load-bearing vest over the shirt (channel 1) with pouches (channel 2)
   Extra head parts (sculpted like 'beard': a rigid part on the head bone, attached by chars_regional.js):
     'helmet' (shell + band), 'fedora' (crown + brim + band), 'kippah', 'keffiyeh' (cloth + black agal cord),
     'hijab' (head + neck + shoulder wrap, face open), 'hood' (monk's hood) */
'use strict';
(function (factory) { const root = typeof window !== 'undefined' ? window : globalThis; factory(root); if (root.AV) (root.AV._gensrc = root.AV._gensrc || []).push(factory.toString()) })(function (root) {
const isNode = typeof module !== 'undefined' && module.exports;
const AN = isNode ? require('./anatomy.js') : root.AV.anatomy, SC = isNode ? require('./sculpt.js') : root.AV.sculpt;
if (!AN || AN._regional) return; AN._regional = true;
const { add, mul, lerp } = AN.v;

/* ---------- shirts: long sleeves, jackets, robes, vests ---------- */
const shirt0 = AN.shirt;
AN.shirt = function (K, o) {
  if (!o || !(o.long || o.jacket || o.robe || o.vest)) return shirt0(K, o);
  const longS = !!(o.long || o.jacket || o.robe), r = shirt0(K, longS ? Object.assign({}, o, { sleeve: 1 }) : o);
  const P = K.P, s = K.s, I = K.idx, pos = n => K.bones[I[n]].pos, hips = pos('hips'), chest = pos('chest'), spine = pos('spine');
  let pr = r.prims;
  if (longS) {
    /* the stock shirt cuts the sleeve with a box past the elbow and the hem with a horizontal plane at the hips (both would
       cut long sleeves: the wrists hang a little below the hips). Swap them for a hem box that only spans the torso. */
    pr = pr.filter(p => !(p.type === 3 && p.op === 'sub') && !(p.type === 4 && p.n[1] < -.5));
    for (const k of ['L', 'R']) {
      const H = K.hands[k], end = lerp(H.el, H.wr, .93);
      pr.push(SC.sph(H.el, P.uarm[1] * 1.18 * s, { bone: I['farm' + k], k: .03 * s }));
      pr.push(SC.cone(H.el, end, P.farm[0] * 1.3 * s, P.farm[1] * 1.45 * s, { bone: I['farm' + k], k: .035 * s }));
    }
    let cut = hips[1] + (o.hem || 0) * s;
    if (o.jacket) { pr.push(SC.ell(add(hips, mul([0, -.05, -.005], s)), mul([P.pelvis[0] * 1.1, .13, P.pelvis[2] * 1.28], s), { bone: I.hips, k: .05 * s })); cut = hips[1] - .14 * s }
    if (o.robe) { const L = o.robe; pr.push(SC.ell(add(hips, mul([0, -L * .45, -.01], 1)), [P.pelvis[0] * 1.2 * s, L * .62, P.pelvis[2] * 1.45 * s], { bone: I.hips, k: .06 * s })); cut = hips[1] - L }
    pr.push(SC.box([0, cut - .7, 0], [.228 * s, .7, .45 * s], .01 * s, { op: 'sub', k: .008 * s }));
  }
  if (o.vest) {
    pr.push(SC.ell(add(chest, mul([0, .02, 0], s)), mul([P.chest[0] * 1.14, P.chest[1] * 1.08, P.chest[2] * 1.3], s), { bone: I.chest, k: .03 * s, mat: 1 }));
    pr.push(SC.ell(add(spine, mul([0, -.01, .035], s)), mul([P.belly[0] * 1.2, P.belly[1] * 1.05, P.belly[2] * 1.32], s), { bone: I.spine, k: .03 * s, mat: 1 }));
    for (const x of [-.075, 0, .075]) pr.push(SC.box(add(spine, mul([x, .02, P.belly[2] * 1.3 + .02], s)), mul([.03, .042, .022], s), .008 * s, { bone: I.spine, k: .008 * s, mat: 2 }));
    for (const x of [-.06, .06]) pr.push(SC.box(add(chest, mul([x, .07, P.chest[2] * 1.3 + .012], s)), mul([.026, .032, .016], s), .006 * s, { bone: I.chest, k: .006 * s, mat: 2 }));
    pr.push(SC.box(add(chest, mul([0, -.02, -P.chest[2] * 1.3 - .03], s)), mul([.11, .13, .04], s), .02 * s, { bone: I.chest, k: .02 * s, mat: 2 }));   // hydration pack
  }
  r.prims = pr;
  return r;
};

/* ---------- head parts ---------- */
const NEW = { helmet: .9, fedora: .75, kippah: .8, keffiyeh: 1.25, hijab: 1.25, hood: 1.35 };   // style -> sculpt cell size multiplier (thin brims need finer cells)
const hat0 = AN.hat;
AN.hat = function (K, style) {
  if (!NEW[style]) return hat0(K, style);
  const s = K.s * K.P.head, H = K.bones[K.idx.head].pos, at = v => add(H, mul(v, s)), pr = [], hb = K.idx.head;
  const E = (c, r, o) => pr.push(SC.ell(at(c), mul(r, s), Object.assign({ bone: hb, k: .012 * s }, o)));
  const Fr = (a, b, ra, rb, rd, o) => pr.push(SC.frustum(at(a), at(b), ra * s, rb * s, rd * s, Object.assign({ bone: hb, k: .006 * s }, o)));
  const sub = (c, r, k) => pr.push(SC.ell(at(c), mul(r, s), { op: 'sub', k: (k || .01) * s }));
  if (style === 'helmet') {   /* combat helmet with a fabric cover: shell, rim, elastic band */
    E([0, .125, -.014], [.122, .112, .132], { k: .02 * s });
    Fr([0, .066, -.014], [0, .084, -.014], .128, .126, .008, { mat: 1 });
    Fr([0, .118, -.014], [0, .142, -.014], .121, .113, .006, { mat: 1 });
    pr.push(SC.box(at([0, -.2, 0]), mul([.4, .262, .4], s), .01 * s, { op: 'sub', k: .006 * s }));   // open underneath
  } else if (style === 'fedora') {   /* black brimmed hat */
    Fr([0, .148, -.018], [0, .29, -.022], .106, .094, .02);
    Fr([0, .146, -.018], [0, .159, -.018], .196, .19, .006);
    Fr([0, .156, -.018], [0, .19, -.019], .108, .104, .004, { mat: 1 });
    sub([0, .315, -.02], [.03, .05, .07], .02);                                                     // pinched crown
    pr.push(SC.box(at([0, -.15, 0]), mul([.4, .29, .4], s), .01 * s, { op: 'sub', k: .006 * s }));
  } else if (style === 'kippah') {
    E([0, .2, -.045], [.064, .026, .066], { rot: SC.basisEuler(-.42, 0, 0), k: .006 * s });
  } else if (style === 'keffiyeh') {   /* draped head cloth held by a black agal cord, open face */
    E([0, .118, -.018], [.112, .126, .122], { k: .02 * s });
    E([0, -.045, -.075], [.13, .155, .075], { k: .045 * s });
    for (const x of [-1, 1]) E([x * .098, -.03, -.005], [.042, .13, .085], { k: .04 * s });
    sub([0, .035, .1], [.078, .105, .085], .02);
    Fr([0, .168, -.018], [0, .188, -.018], .123, .121, .008, { mat: 1, k: .003 * s });
    Fr([0, .196, -.018], [0, .214, -.018], .113, .109, .007, { mat: 1, k: .003 * s });
  } else if (style === 'hijab') {   /* head, neck and shoulder wrap, face open */
    E([0, .11, -.016], [.104, .12, .117], { k: .02 * s });
    pr.push(SC.cone(at([0, -.01, -.005]), at([0, -.12, -.012]), .088 * s, .112 * s, { bone: hb, k: .04 * s }));
    E([0, -.055, .038], [.08, .06, .07], { k: .03 * s });
    E([0, -.135, -.01], [.175, .05, .13], { k: .05 * s });
    sub([0, .045, .1], [.066, .086, .072], .018);
  } else {   /* hood: a soft cowl resting on the shoulders */
    E([0, .12, -.03], [.125, .14, .14], { k: .02 * s });
    E([0, -.11, -.04], [.17, .07, .14], { k: .05 * s });
    sub([0, .06, .11], [.085, .12, .11], .02);
  }
  return { prims: pr, offset: 0 };
};
const spec0 = AN.spec;
AN.spec = function (K, d) { const r = spec0(K, d); if (d.part === 'hat' && NEW[d.style]) r.hMul = NEW[d.style]; return r };

if (isNode) module.exports = AN;
});
