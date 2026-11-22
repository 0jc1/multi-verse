/* APEVERSE - anatomy_wear.js : extra wardrobe for the soft-body characters (loaded after anatomy.js, BEFORE chars_real.js).
   Runs in the page AND inside the sculpt workers (it registers itself in AV._gensrc like sculpt.js / anatomy.js, so the
   character cache hash changes with it). Adds, without touching anatomy.js:
     pants  o.shorts   -> trousers cut just above the knee (bare shins / calves stay on the body sculpt)
     shoes  o.flip     -> flip-flops: a thin sole + a toe-post thong strap (bare feet stay visible)
     hat    'hairMessy' -> short hair with tousled tufts (also used for the "blond" surfer look)
     hat    'beard'     -> full beard + moustache, a separate rigid part on the head bone
   Pure data like anatomy.js (no THREE). */
'use strict';
(function (factory) { const root = typeof window !== 'undefined' ? window : globalThis; factory(root); if (root.AV) (root.AV._gensrc = root.AV._gensrc || []).push(factory.toString()) })(function (root) {
const isNode = typeof module !== 'undefined' && module.exports;
const AN = isNode ? require('./anatomy.js') : root.AV.anatomy, SC = isNode ? require('./sculpt.js') : root.AV.sculpt;
if (!AN || AN._wear) return; AN._wear = true;
const { add, sub, mul, nrm, lerp, mad } = AN.v;

/* ---------- shorts ---------- */
const pants0 = AN.pants;
AN.pants = function (K, o) {
  const r = pants0(K, o); if (!o || !o.shorts) return r;
  const P = K.P, s = K.s, pr = r.prims;
  /* the last prim of the trousers is the ankle cut: move it up to just above the knee */
  for (let i = pr.length - 1; i >= 0; i--) if (pr[i].type === 4 && pr[i].n[1] < -.5) { pr[i] = SC.plane([0, (P.kneeY + .07) * s, 0], [0, -1, 0]); break }
  return r;
};

/* ---------- flip-flops ---------- */
const shoes0 = AN.shoes;
AN.shoes = function (K, o) {
  if (!o || !o.flip) return shoes0(K, o);
  const s = K.s, I = K.idx, pr = [];
  for (const k of ['L', 'R']) {
    const L = K.legs[k], sd = k === 'L' ? 1 : -1, fwd = nrm(sub([L.tip[0], 0, L.tip[2]], [L.an[0], 0, L.an[2]])), rot = SC.basisY([0, 1, 0], fwd), mid = lerp([L.an[0], 0, L.an[2]], [L.tip[0], 0, L.tip[2]], .42);
    const at = (f, y, side) => add(add(mad(mid, fwd, f * s), [0, y * s, 0]), [sd * side * s, 0, 0]);
    pr.push(SC.box(at(-.005, .007, 0), mul([.05, .007, .145], s), .006 * s, { rot, bone: I['foot' + k], k: .006 * s, mat: 1 }));
    pr.push(SC.box(at(.115, .007, 0), mul([.047, .007, .055], s), .006 * s, { rot, bone: I['toe' + k], k: .006 * s, mat: 1 }));
    const post = at(.1, .022, -.008);
    for (const side of [1, -1]) pr.push(SC.cap(post, at(.01, .05, side * .043), .0055 * s, { bone: I['foot' + k], k: .006 * s, mat: 0 }));
    pr.push(SC.sph(post, .008 * s, { bone: I['toe' + k], k: .004 * s, mat: 3 }));
  }
  return { prims: pr, offset: 0 };
};

/* ---------- hair + beards ---------- */
function hairBase(K, at, s, hb, pr) {
  pr.push(SC.ell(at([0, .108, -.015]), mul([.088, .105, .104], s), { bone: hb, k: .02 * s, mat: 0 }));
}
function hairCuts(K, at, s, hb, pr) {
  pr.push(SC.plane(at([0, .1, .06]), nrm([0, -.55, 1])));                                   // hairline
  pr.push(SC.plane(at([0, .03, -.1]), nrm([0, -1, -.25])));                                 // nape
  pr.push(SC.sph(at([0, .06, .02]), .075 * s, { op: 'sub', k: .01 * s }));                  // keep the face clear
  for (const x of [-1, 1]) pr.push(SC.sph(at([x * .085, .055, -.005]), .03 * s, { op: 'sub', k: .008 * s }));
}
const hat0 = AN.hat;
AN.hat = function (K, style) {
  if (style !== 'hairMessy' && style !== 'beard') return hat0(K, style);
  const s = K.s * K.P.head, H = K.bones[K.idx.head].pos, at = v => add(H, mul(v, s)), pr = [], hb = K.idx.head;
  if (style === 'hairMessy') {
    hairBase(K, at, s, hb, pr);
    /* tufts: a fixed scatter over the crown (deterministic, so every worker sculpts the same shape) */
    let q = 7; const rnd = () => (q = (q * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 14; i++) {
      const a = rnd() * Math.PI * 2, el = .25 + rnd() * .9, d = [Math.cos(a) * Math.cos(el), Math.sin(el), Math.sin(a) * Math.cos(el)];
      const c = [d[0] * .086, .108 + d[1] * .1, -.015 + d[2] * .1];
      pr.push(SC.ell(at(c), mul([.03 + rnd() * .014, .022 + rnd() * .012, .03 + rnd() * .014], s), { rot: SC.basisEuler(rnd() - .5, a, rnd() - .5), bone: hb, k: .012 * s, mat: 0 }));
    }
    for (const x of [-1, 1]) pr.push(SC.ell(at([x * .075, .07, -.03]), mul([.022, .04, .045], s), { bone: hb, k: .015 * s, mat: 0 }));   // over the ears
    hairCuts(K, at, s, hb, pr);
  } else {   /* beard: jaw shell, nose + mouth cleared, then a moustache */
    pr.push(SC.ell(at([0, .0, .045]), mul([.075, .06, .073], s), { bone: hb, k: .02 * s, mat: 0 }));
    for (const x of [-1, 1]) pr.push(SC.ell(at([x * .068, .045, .02]), mul([.014, .035, .03], s), { bone: hb, k: .015 * s, mat: 0 }));   // sideburns
    pr.push(SC.sph(at([0, .068, .12]), .042 * s, { op: 'sub', k: .012 * s }));                            // nose / upper lip clear
    pr.push(SC.cap(at([-.024, .006, .125]), at([.024, .006, .125]), .012 * s, { op: 'sub', k: .006 * s }));   // mouth
    pr.push(SC.sph(at([0, .05, -.03]), .07 * s, { op: 'sub', k: .01 * s }));                              // nothing inside the head / behind the cheeks
    pr.push(SC.cap(at([-.03, .014, .103]), at([0, .025, .111]), .0075 * s, { bone: hb, k: .006 * s, mat: 0 }));   // moustache
    pr.push(SC.cap(at([.03, .014, .103]), at([0, .025, .111]), .0075 * s, { bone: hb, k: .006 * s, mat: 0 }));
  }
  return { prims: pr, offset: 0 };
};
const spec0 = AN.spec;
AN.spec = function (K, d) { const r = spec0(K, d); if (d.part === 'hat' && (d.style === 'hairMessy' || d.style === 'beard')) r.hMul = .8; return r };

if (isNode) module.exports = AN;
});
