/* APEVERSE - chars_locals.js : Polish pass, more kinds of instanced street walkers (city_life crowds).
   Each one is a silhouette change, not just a colour change, so a crowd reads as different people:
     student (backpack), elder (grey hair, cane, slightly smaller, slow), skater (cap + board under the arm), artist (beret + sketch board),
     apron (market vendor / café worker), backpacker (big trekking pack + bedroll), shopper (two shopping bags), busker (guitar on the back).
   Same pipeline as js/chars_regional.js: the 'fixed' slot keeps its own colour; other parts take the per-instance tint. */
'use strict';
(function (AV) {
const C = AV.chars; if (!C || !C.walkerVar || !C._kit) return;
const KK = C._kit, std = AV.std, VAR = C.walkerVar;
const hand = (u, side) => { const arm = side > 0 ? u.aR : u.aL, p = new THREE.Group(); p.position.set(0, -.8 * u.s - .02, .05); arm.add(p); return p };
const P = (par, g, col, x, y, z, sx, sy, sz, rot) => KK.part(par, g, typeof col === 'number' ? std(col, .75) : col, x, y, z, sx, sy, sz, 'fixed', rot);
Object.assign(VAR, {
  student: { style: 'messy', extra: (g, u) => { const s = u.s; P(g, u.Gx.box, 0x1a3a6a, 0, 1.45 * s, -.24 * s, .34 * s, .42 * s, .16 * s); P(g, u.Gx.box, 0x2a2a2a, 0, 1.68 * s, -.24 * s, .3 * s, .05 * s, .14 * s) } },
  elder: { style: 'bald', s: .74, extra: (g, u) => { const k = u.k, s = u.s; P(u.head, u.Gx.hem, 0xd8d8d4, 0, .04 * k, -.04 * k, .3 * k, .22 * k, .3 * k); P(hand(u, 1), u.Gx.cyl, 0x5a3a20, 0, -.42 * s, .06 * s, .025 * s, .9 * s, .025 * s); P(g, u.Gx.box, 0x8a7a6a, 0, 1.35 * s, .0, .38 * s, .5 * s, .26 * s) } },
  skater: { style: 'cap', shorts: true, extra: (g, u) => { const s = u.s; P(hand(u, -1), u.Gx.box, 0x2a2a2a, 0, -.05 * s, .02 * s, .06 * s, .8 * s, .22 * s); for (const z of [-.3, .3]) P(hand(u, -1), u.Gx.cyl, 0xe8e0c8, .05 * s, (z - .05) * s, .02 * s, .05 * s, .05 * s, .05 * s, [0, 0, Math.PI / 2]) } },
  artist: { style: 'long', extra: (g, u) => { const k = u.k, s = u.s; P(u.head, u.Gx.cyl, 0x1a1a1a, 0, .26 * k, -.02 * k, .3 * k, .07 * k, .3 * k); P(hand(u, 1), u.Gx.box, 0xe8dcc0, 0, -.1 * s, .05 * s, .04 * s, .5 * s, .4 * s); P(hand(u, 1), u.Gx.box, 0x3a7ac8, -.022 * s, -.1 * s, .05 * s, .01 * s, .3 * s, .25 * s) } },
  apron: { style: 'bun', extra: (g, u) => { const s = u.s; P(g, u.Gx.box, 0xf4f2ec, 0, 1.12 * s, .18 * s, .36 * s, .62 * s, .03 * s); P(g, u.Gx.box, 0xf4f2ec, 0, 1.45 * s, .17 * s, .22 * s, .16 * s, .03 * s) } },
  backpacker: { style: 'messy', shorts: true, foot: 'flip', extra: (g, u) => { const s = u.s; P(g, u.Gx.box, 0xd86a1a, 0, 1.4 * s, -.3 * s, .4 * s, .7 * s, .26 * s); P(g, u.Gx.cyl, 0x3a6a3a, 0, 1.82 * s, -.3 * s, .12 * s, .42 * s, .12 * s, [0, 0, Math.PI / 2]); P(g, u.Gx.box, 0x2a2a2a, 0, 1.02 * s, .2 * s, .3 * s, .1 * s, .06 * s) } },
  shopper: { style: 'long', slim: true, extra: (g, u) => { const s = u.s; for (const sd of [-1, 1]) { P(hand(u, sd), u.Gx.box, sd > 0 ? 0xe8d8b8 : 0xc83a3a, 0, -.2 * s, .04 * s, .26 * s, .3 * s, .1 * s); P(hand(u, sd), u.Gx.box, 0x3a3a3a, 0, -.02 * s, .04 * s, .2 * s, .02 * s, .02 * s) } } },
  busker: { style: 'short', beard: true, extra: (g, u) => { const s = u.s; P(g, u.Gx.sph, 0x8a5a2a, .05 * s, 1.15 * s, -.26 * s, .22 * s, .3 * s, .08 * s, [0, 0, .5]); P(g, u.Gx.box, 0x3a2410, -.12 * s, 1.6 * s, -.26 * s, .05 * s, .55 * s, .03 * s, [0, 0, .5]) } }
});
})(window.AV);
