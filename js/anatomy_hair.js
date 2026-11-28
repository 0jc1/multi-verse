/* APEVERSE 3.0 - anatomy_hair.js : the expanded barber book for the soft-body characters (loaded after anatomy_regional.js,
   BEFORE chars_real.js).  Runs in the page AND inside the sculpt workers (registers itself in AV._gensrc like anatomy_wear.js).
   Adds sculpted, head-bone rigid parts (same signed-distance sculpt as the existing hair / beard, so they fit every skull, cast
   shadows and keep the face clear):
     HAIR  (hat style 'h_<id>'): buzz, crew, fade, undercut, quiff, pompadour, mohawk, spiky, curly, curlyTop, afroPuffs, topKnot,
           ponytail, highPony, pigtails, boxBraids, cornrows, dreads, locsUp, bob, longWavy, sidePart, mullet, bangs, shag
     FACIAL HAIR (hat style 'b_<id>'): stubble, short, long, goatee, vanDyke, mustache, handlebar, chevron, chinstrap, soulPatch,
           muttonChops, horseshoe, circle, anchor, viking, boxed   (the classic full beard stays 'beard')
   AN.HAIR / AN.BEARD list the ids (used by the creator).  Pure data (no THREE). */
'use strict';
(function (factory) { const root = typeof window !== 'undefined' ? window : globalThis; factory(root); if (root.AV) (root.AV._gensrc = root.AV._gensrc || []).push(factory.toString()) })(function (root) {
const isNode = typeof module !== 'undefined' && module.exports;
const AN = isNode ? require('./anatomy.js') : root.AV.anatomy, SC = isNode ? require('./sculpt.js') : root.AV.sculpt;
if (!AN || AN._hair) return; AN._hair = true;
const { add, mul, nrm } = AN.v;
const HAIR = AN.HAIR = ['buzz', 'crew', 'fade', 'undercut', 'quiff', 'pompadour', 'mohawk', 'spiky', 'curly', 'curlyTop', 'afroPuffs', 'topKnot', 'ponytail', 'highPony', 'pigtails', 'boxBraids', 'cornrows', 'dreads', 'locsUp', 'bob', 'longWavy', 'sidePart', 'mullet', 'bangs', 'shag'];
AN.HAIR_V = 3;   /* bump when a hair / beard shape changes: it is part of those parts' cache keys (chars_soft.js) */
const BEARD = AN.BEARD = ['stubble', 'short', 'long', 'goatee', 'vanDyke', 'mustache', 'handlebar', 'chevron', 'chinstrap', 'soulPatch', 'muttonChops', 'horseshoe', 'circle', 'anchor', 'viking', 'boxed'];

/* deterministic scatter (every worker must sculpt exactly the same shape) */
const rng = seed => { let q = seed; return () => (q = (q * 16807) % 2147483647) / 2147483647 };

function hairStyle(id, at, s, hb, pr) {
  const E = (c, r, k, o) => pr.push(SC.ell(at(c), mul(r, s), Object.assign({ bone: hb, k: (k || .02) * s, mat: 0 }, o || {}))),
    S = (c, r, k) => pr.push(SC.sph(at(c), r * s, { bone: hb, k: (k || .015) * s, mat: 0 })),
    Cp = (a, b, r, k) => pr.push(SC.cap(at(a), at(b), r * s, { bone: hb, k: (k || .01) * s, mat: 0 })),
    Co = (a, b, ra, rb, k) => pr.push(SC.cone(at(a), at(b), ra * s, rb * s, { bone: hb, k: (k || .008) * s, mat: 0 })),
    base = (t) => E([0, .108, -.015], [.084 + t, .101 + t, .1 + t]),
    hairline = (y, z) => pr.push(SC.plane(at([0, y == null ? .1 : y, z == null ? .06 : z]), nrm([0, -.55, 1]))),
    nape = (y) => pr.push(SC.plane(at([0, y == null ? .03 : y, -.1]), nrm([0, -1, -.25]))),
    face = () => { pr.push(SC.sph(at([0, .06, .02]), .075 * s, { op: 'sub', k: .01 * s })); for (const x of [-1, 1]) pr.push(SC.sph(at([x * .085, .055, -.005]), .03 * s, { op: 'sub', k: .008 * s })) },
    sides = (w) => { for (const x of [-1, 1]) pr.push(SC.plane(at([x * w, .1, 0]), nrm([x, -.15, 0]))) };   /* fades: trims everything outside |x| > w */
  const r = rng(11 + id.length * 7 + id.charCodeAt(0));
  switch (id) {
    case 'buzz': base(-.0065); hairline(.11); nape(.04); face(); break;
    case 'crew': base(0); E([0, .16, .01], [.072, .04, .085], .03); hairline(.105); nape(); face(); break;
    case 'fade': base(-.003); E([0, .165, .0], [.07, .05, .09], .025); hairline(.11); nape(.06); face(); break;
    case 'undercut': base(-.004); E([0, .175, .015], [.072, .05, .1], .03); E([.02, .17, .07], [.06, .04, .05], .03); hairline(.12, .09); nape(.08); face(); break;
    case 'quiff': base(-.002); E([0, .165, 0], [.07, .045, .085], .03); E([0, .19, .065], [.06, .06, .055], .03); hairline(.12, .1); nape(); face(); break;
    case 'pompadour': base(0); E([0, .175, -.01], [.078, .055, .095], .035); E([0, .205, .06], [.07, .075, .07], .04); hairline(.12, .11); nape(); face(); break;
    case 'mohawk': base(-.004); for (let i = 0; i < 7; i++) { const t = i / 6, a = -.6 + t * 2.4, c = [0, .108 + Math.cos(a) * .12, -.015 + Math.sin(a) * .12]; E(c, [.018, .05, .03], .02) } hairline(.11); nape(.02); face(); break;
    case 'spiky': base(0); for (let i = 0; i < 14; i++) { const a = r() * Math.PI * 2, el = .35 + r() * .9, d = [Math.cos(a) * Math.cos(el), Math.sin(el), Math.sin(a) * Math.cos(el)], b = [d[0] * .08, .108 + d[1] * .095, -.015 + d[2] * .095], tip = [d[0] * .135, .108 + d[1] * .15, -.015 + d[2] * .135]; Co(b, tip, .022, .003) } hairline(); nape(); face(); break;
    case 'curly': base(.006); for (let i = 0; i < 26; i++) { const a = r() * Math.PI * 2, el = .1 + r() * 1.35, d = [Math.cos(a) * Math.cos(el), Math.sin(el), Math.sin(a) * Math.cos(el)]; S([d[0] * .1, .11 + d[1] * .112, -.015 + d[2] * .112], .026 + r() * .01, .01) } hairline(.095); nape(.0); face(); break;
    case 'curlyTop': base(-.003); for (let i = 0; i < 16; i++) { const a = r() * Math.PI * 2, el = .75 + r() * .8, d = [Math.cos(a) * Math.cos(el), Math.sin(el), Math.sin(a) * Math.cos(el)]; S([d[0] * .085, .125 + d[1] * .1, -.0 + d[2] * .09], .028 + r() * .008, .01) } hairline(.11); nape(.06); face(); break;
    case 'afroPuffs': base(-.002); for (const x of [-1, 1]) S([x * .09, .19, -.03], .065, .03); hairline(.11); nape(); face(); break;
    case 'topKnot': base(-.002); S([0, .23, -.02], .045, .025); E([0, .2, -.02], [.035, .03, .035], .02); hairline(); nape(); face(); break;
    case 'ponytail': base(0); S([0, .15, -.115], .032, .02); Cp([0, .14, -.13], [0, -.02, -.165], .03, .02); Cp([0, -.02, -.165], [0, -.12, -.15], .022, .02); hairline(); face(); break;
    case 'highPony': base(0); S([0, .21, -.09], .034, .02); Cp([0, .21, -.1], [0, .08, -.17], .032, .02); Cp([0, .08, -.17], [0, -.06, -.16], .022, .02); hairline(); face(); break;
    case 'pigtails': base(0); for (const x of [-1, 1]) { S([x * .095, .1, -.06], .03, .015); Cp([x * .105, .09, -.07], [x * .12, -.07, -.04], .028, .02) } hairline(); face(); break;
    case 'boxBraids': base(.002); for (let i = 0; i < 18; i++) { const a = -Math.PI * .05 + i / 17 * Math.PI * 1.1, sx = Math.cos(a), sz = -Math.sin(a), top = [sx * .09, .1, -.02 + sz * .07], bot = [sx * .125, -.17 - r() * .05, -.035 + sz * .1]; Cp(top, bot, .0125, .003) } hairline(); face(); break;
    case 'cornrows': base(-.007); for (let i = 0; i < 7; i++) { const x = (i - 3) * .021, dx = Math.abs(i - 3); Cp([x * 1.05, .178 - dx * .012, .05], [x * 1.12, .206 - dx * .01, -.03], .0125, .003); Cp([x * 1.12, .206 - dx * .01, -.03], [x * .95, .085, -.114], .0125, .003) } hairline(.125, .085); nape(.0); face(); break;
    case 'dreads': base(.004); for (let i = 0; i < 18; i++) { const a = Math.PI * (i / 17) * 1.3 - Math.PI * .15 + Math.PI / 2, top = [Math.cos(a) * .09, .12, -.02 - Math.sin(a) * .07], bot = [Math.cos(a) * .13, -.12 - r() * .08, -.04 - Math.sin(a) * .1]; Cp(top, bot, .014 - r() * .003, .006) } hairline(); face(); break;
    case 'locsUp': base(.002); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; Cp([Math.cos(a) * .07, .15, -.02 + Math.sin(a) * .07], [Math.cos(a) * .035, .215, -.03 + Math.sin(a) * .035], .015, .004) } E([0, .225, -.03], [.06, .04, .06], .02); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; Cp([Math.cos(a) * .04, .24, -.03 + Math.sin(a) * .04], [Math.cos(a) * .085, .2, -.03 + Math.sin(a) * .085], .012, .004) } hairline(); nape(); face(); break;
    case 'bob': E([0, .09, -.02], [.1, .12, .112], .03); E([0, .17, .055], [.07, .035, .04], .02); pr.push(SC.plane(at([0, -.01, 0]), nrm([0, -1, 0]))); hairline(.13, .1); face(); break;
    case 'longWavy': base(.004); for (let i = 0; i < 9; i++) { const y = .1 - i * .035, w = .085 + Math.sin(i * 1.3) * .012; E([0, y, -.07 - i * .004], [w, .03, .05], .03) } for (const x of [-1, 1]) Cp([x * .085, .09, -.01], [x * .1, -.17, -.05], .03, .03); hairline(); face(); break;
    case 'sidePart': base(.001); E([-.025, .165, .02], [.08, .045, .09], .03); E([.05, .145, .07], [.05, .035, .045], .025); hairline(.11, .09); nape(); face(); break;
    case 'mullet': base(0); E([0, .15, .02], [.07, .04, .08], .03); E([0, .03, -.085], [.075, .1, .045], .035); hairline(); face(); break;
    case 'bangs': base(.002); E([0, .155, .085], [.08, .035, .035], .02); pr.push(SC.plane(at([0, .115, .12]), nrm([0, -1, .1]))); nape(); face(); break;
    case 'shag': base(.006); for (let i = 0; i < 18; i++) { const a = r() * Math.PI * 2, el = -.3 + r() * 1.5, d = [Math.cos(a) * Math.cos(el), Math.sin(el), Math.sin(a) * Math.cos(el)]; E([d[0] * .095, .1 + d[1] * .1, -.02 + d[2] * .1], [.035, .025, .035], .015, { rot: SC.basisEuler(r() - .5, a, r() - .5) }) } hairline(.1); face(); break;
    default: base(0); hairline(); nape(); face();
  }
}

function beardStyle(id, at, s, hb, pr) {
  const E = (c, r, k) => pr.push(SC.ell(at(c), mul(r, s), { bone: hb, k: (k || .02) * s, mat: 0 })), S = (c, r, k) => pr.push(SC.sph(at(c), r * s, { bone: hb, k: (k || .012) * s, mat: 0 })),
    Cp = (a, b, r, k) => pr.push(SC.cap(at(a), at(b), r * s, { bone: hb, k: (k || .006) * s, mat: 0 })),
    jaw = (t) => E([0, .0, .045], [.075 + t, .06 + t, .073 + t]), burns = (len) => { for (const x of [-1, 1]) E([x * .068, .045, .02], [.014, .035 * (len || 1), .03], .015) },
    clear = () => { pr.push(SC.sph(at([0, .068, .12]), .042 * s, { op: 'sub', k: .012 * s })); pr.push(SC.cap(at([-.024, .006, .125]), at([.024, .006, .125]), .012 * s, { op: 'sub', k: .006 * s })); pr.push(SC.sph(at([0, .05, -.03]), .07 * s, { op: 'sub', k: .01 * s })) },
    stache = (r0, droop) => { Cp([-.03, .014 - (droop || 0), .103], [0, .025, .111], r0 || .0075); Cp([.03, .014 - (droop || 0), .103], [0, .025, .111], r0 || .0075) },
    chin = (w, h, dz) => E([0, -.026, .086 + (dz || 0)], [w, h, .03], .022);
  switch (id) {
    case 'stubble': jaw(-.0105); burns(.7); clear(); stache(.0035); break;   /* just breaks the skin surface: a shadow of a beard */
    case 'short': jaw(-.002); burns(); clear(); stache(); break;
    case 'long': jaw(.002); burns(); E([0, -.07, .075], [.055, .075, .045], .03); clear(); stache(); break;
    case 'boxed': jaw(0); burns(); clear(); stache(); pr.push(SC.plane(at([0, -.05, 0]), nrm([0, -1, 0]))); break;
    case 'goatee': chin(.026, .03); Cp([-.018, -.005, .118], [.018, -.005, .118], .007); break;
    case 'vanDyke': chin(.022, .033, .002); E([0, -.052, .094], [.013, .018, .016], .014); stache(.008); break;
    case 'mustache': stache(.0095); break;
    case 'handlebar': stache(.0085); for (const x of [-1, 1]) { Cp([x * .03, .016, .104], [x * .055, .03, .09], .005); S([x * .057, .036, .088], .006, .004) } break;
    case 'chevron': E([0, .022, .112], [.036, .013, .012], .008); break;
    case 'chinstrap': for (const x of [-1, 1]) { Cp([x * .072, .06, .01], [x * .07, -.01, .045], .009); Cp([x * .07, -.01, .045], [x * .03, -.05, .095], .009) } Cp([-.03, -.05, .095], [.03, -.05, .095], .009); break;
    case 'soulPatch': S([0, -.014, .121], .009, .004); break;
    case 'muttonChops': for (const x of [-1, 1]) E([x * .066, .025, .05], [.02, .055, .045], .018); clear(); stache(.007); break;
    case 'horseshoe': stache(.009); for (const x of [-1, 1]) Cp([x * .032, .012, .106], [x * .03, -.045, .1], .008); break;
    case 'circle': stache(.008); chin(.024, .028, .002); for (const x of [-1, 1]) Cp([x * .03, .012, .106], [x * .022, -.03, .108], .006); break;
    case 'anchor': chin(.022, .03); Cp([-.035, -.02, .1], [.035, -.02, .1], .006); stache(.007); break;
    case 'viking': jaw(.003); burns(); E([0, -.075, .07], [.058, .085, .048], .03); for (const x of [-1, 1]) Cp([x * .02, -.12, .08], [x * .016, -.21, .07], .011); clear(); stache(.009, .01); break;
    default: jaw(0); burns(); clear(); stache();
  }
}

const hat1 = AN.hat;
AN.hat = function (K, style) {
  const isH = typeof style === 'string' && style.startsWith('h_'), isB = typeof style === 'string' && style.startsWith('b_');
  if (!isH && !isB) return hat1(K, style);
  const s = K.s * K.P.head, H = K.bones[K.idx.head].pos, at = v => add(H, mul(v, s)), pr = [], hb = K.idx.head;
  if (isH) hairStyle(style.slice(2), at, s, hb, pr); else beardStyle(style.slice(2), at, s, hb, pr);
  return { prims: pr, offset: 0 };
};
const spec1 = AN.spec;
AN.spec = function (K, d) { const r = spec1(K, d); if (d.part === 'hat' && typeof d.style === 'string' && (d.style.startsWith('h_') || d.style.startsWith('b_'))) r.hMul = .8; return r };

if (isNode) module.exports = AN;
});
