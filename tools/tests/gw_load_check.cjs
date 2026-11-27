/* APEVERSE 2.2 GLOBAL WORLDS: offline load check (agent 4).  node tools/tests/gw_load_check.cjs
   Runs the top level of every global-worlds script in index.html order inside Node with light stubs (no THREE, no DOM), so a load-time
   crash (a missing comma that turns an array into an index expression, an undefined helper, a bad registry push) fails here in a
   second instead of breaking every GPU suite.  Then builds every plan's network.  Exit code 1 on any failure. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..', '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const files = [...html.matchAll(/<script src="(js\/(?:gw_|sevilla|cadiz|oaxaca|chefchaouen|rio|world_sevilla|world_cadiz|world_oaxaca|world_chefchaouen|world_rio)[^"]*)"/g)].map(m => m[1]);
const any = () => new Proxy(function () { }, { get: (t, k) => k === Symbol.toPrimitive ? () => 0 : any(), apply: () => any(), construct: () => any() });
const worlds = {}, AV = { ITEMS: {}, WORLDS_DATA: [], registerWorld: d => { worlds[d.id] = d }, tr: (a) => a, kit: any(), city: any(), fest: { LIST: {}, forced: {}, activeAt: () => false, next: () => null, guideHtml: () => '' }, ambWorlds: { presets: {}, G: any() } };
const ctx = { console, Math, Map, Set, Uint8Array, Int32Array, Float32Array, Float64Array, JSON, Object, Array, String, Number, Symbol, Proxy, THREE: any(), document: any(), performance: { now: () => 0 }, addEventListener: () => { }, setTimeout: () => { } };
ctx.window = ctx; ctx.globalThis = ctx; ctx.window.AV = AV; vm.createContext(ctx);
let fail = 0;
for (const f of files) { try { vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f }); console.log('PASS load ' + f) } catch (e) { fail++; console.log('FAIL load ' + f + ' :: ' + (e && e.stack || e).split('\n').slice(0, 2).join(' | ')) } }
for (const k of Object.keys(AV).filter(k => /Plan$/.test(k))) { try { const N = AV[k].net(); console.log('PASS net ' + k + ' (' + N.streets.length + ' streets)') } catch (e) { fail++; console.log('FAIL net ' + k + ' :: ' + e) } }
for (const w of ['sevilla', 'cadiz', 'oaxaca', 'chefchaouen', 'rio']) { const ok = !!worlds[w] && AV.WORLDS_DATA.some(x => x.id === w); if (!ok) fail++; console.log((ok ? 'PASS' : 'FAIL') + ' registered ' + w) }
for (const w of ['sevilla', 'cadiz', 'oaxaca', 'chefchaouen', 'rio']) { const S = AV[w] && AV[w].SIGNS, bad = (S || []).filter(s => !Array.isArray(s) || typeof s[0] !== 'string' || typeof s[3] !== 'function'); if (S && bad.length) { fail++; console.log('FAIL signs ' + w + ' :: ' + bad.length + ' malformed entries') } else if (S) console.log('PASS signs ' + w + ' (' + S.length + ')') }
console.log(fail ? fail + ' FAILED' : 'all good'); process.exitCode = fail ? 1 : 0;
