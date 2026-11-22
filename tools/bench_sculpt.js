/* node tools/bench_sculpt.js : times the procedural character parts exactly as the game's worker builds them */
const AN = require('../js/anatomy.js');
const LOOK = {
  gorilla: { sp: 'gorilla', shirt: { loose: 1.05, sleeve: .55 }, pants: { loose: 1.12, rips: true }, shoes: { high: true }, hat: 'beanie' },
  ztone: { sp: 'chimp', shirt: { loose: 1.06, sleeve: .6 }, pants: { loose: 1.18, pockets: true }, shoes: {}, hat: 'bucket' },
  orangutan: { sp: 'orangutan', shirt: { loose: 1.14, sleeve: .62, open: true }, pants: { loose: 1.12 }, shoes: {}, hat: null },
  /* aliens are a single body sculpt (the suit is painted on), see AN.alienPaint */
  zib: { sp: 'alien_zib', bodyOnly: true },
  orbo: { sp: 'alien_orbo', bodyOnly: true } };
let all = 0;
for (const k in LOOK) { const L = LOOK[k], parts = L.bodyOnly ? [] : [{ part: 'shirt', o: L.shirt }, { part: 'pants', o: L.pants }, { part: 'shoes', o: L.shoes }].concat(L.hat ? [{ part: 'hat', style: L.hat }] : []).map(p => Object.assign({ sp: L.sp }, p));
  let tot = 0, tris = 0; const t0 = Date.now();
  for (const d of [Object.assign({ sp: L.sp, part: 'body' }, parts.length ? { cover: parts } : {}), ...parts]) { const t = Date.now(), m = AN.part(d); tris += m.nt; console.log(k.padEnd(10), d.part.padEnd(6), (Date.now() - t) + 'ms', m.nt + ' tris' + (m.shell && m.shell.nt ? ', fur shells base ' + m.shell.nt + ' tris' : '')) }
  tot = Date.now() - t0; all += tot; console.log(k, 'TOTAL', tot, 'ms', tris, 'tris') }
console.log('ALL', all, 'ms');
