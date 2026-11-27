/* APEVERSE 2.2 (Agent 3) - consume.js : Consumables 2.0. Every drink, snack, pre-roll and fictional alien item is used in STEPS
   (drags, sips, bites) instead of vanishing after one animation.
   - Pre-rolls: light up (lighter + flame, ember appears) → each U = one drag (hand to mouth, ember glows on the inhale, smoke curls from
     the tip, exhale cloud after) → the joint gets shorter → last drag → stubbed out. A lit joint between drags smoulders with a thin
     wisp and goes out by itself after ~2.5 min; putting it away puts it out. A partly smoked joint stays in the backpack ("5/8 drags").
   - Drinks: sips; the liquid level drops; the bottle / glass / can / cup is empty at the end. Food: bites; the food gets smaller.
   - Each step adds a small dose to ONE effect session (AV.fx.dose), so effects build gradually and a beer in 6 sips counts as one drink.
   - Adult items carry adult:true (hidden in Family Demo mode, js/gameplay_dev.js). Everything is game-fictional: no real-world guidance.
   API: AV.cons.spec(id) · AV.cons.open(id) (open-item state) · AV.cons.step(id) · AV.bag.finish(id) (do the remaining steps) ·
        AV.cons.busy() · AV.cons.stats.  Save: optional S.cons = { open: { id: { left, n } }, done: { id: count } }. */
'use strict';
(function (AV) {
const tr = AV.tr, L = (e, s) => [e, s];
const CONS = AV.cons = { stats: { steps: 0, finished: 0, lit: 0, wentOut: 0 } };
const st = () => { const S = AV.S; S.cons = S.cons || { open: {}, done: {} }; S.cons.open = S.cons.open || {}; S.cons.done = S.cons.done || {}; return S.cons };
const nm = id => { const d = AV.ITEMS[id]; return d ? (AV.ui === 'es' ? d.n[1] : d.n[0]) : id };
const sfx = (n, o) => { try { return AV.snd && AV.snd.fx ? AV.snd.fx(n, o) : (AV.audio && AV.audio.blip(n === 'gulp' ? 140 : 220, .1, 'sine', .05)) } catch (e) { } };

/* ======================= new fictional items (each has a real shop below) ======================= */
Object.assign(AV.ITEMS, {
  pre_mini: { n: L('Mini pre-roll (adults only)', 'Porro mini (solo adultos)'), cat: 'smoke', ic: '🌿', use: 'smoke', adult: true, fx: { type: 'smoke', amt: .3 }, model: 'joint', col: 0xf4f0e4, len: .07, say: L('A small one. Four slow drags.', 'Uno pequeño. Cuatro caladas lentas.'), price: 30 },
  pre_jd: { n: L('Jungle Dub pre-roll (adults only)', 'Porro Jungle Dub (solo adultos)'), cat: 'smoke', ic: '🌿', use: 'smoke', adult: true, fx: { type: 'smoke', amt: .7 }, model: 'joint', col: 0xe8d8b0, len: .13, say: L('Bass-heavy and slow. The one-drop gets warmer.', 'Graves y calma. El one-drop se vuelve más cálido.'), price: 75 },
  gummy: { n: L('Banana Bliss gummy (adults only, fictional)', 'Gominola Banana Bliss (solo adultos, ficticia)'), cat: 'food', ic: '🍌', use: 'eat', adult: true, fx: { type: 'smoke', amt: .45 }, model: 'gummy', col: 0xffd84a, say: L('Chewy banana. Nothing yet… give it a minute.', 'Plátano masticable. Nada todavía… dale un minuto.'), price: 35 },
  mojito: { n: L('Mojito', 'Mojito'), cat: 'drink', ic: '🍹', use: 'drink', adult: true, fx: { type: 'drink', amt: .38 }, model: 'cocktail', col: 0xc8f0a0, say: L('Mint, lime, ice. Dangerous in the heat.', 'Menta, lima, hielo. Peligroso con este calor.'), price: 55 },
  ape_sunset: { n: L('Ape Sunset cocktail', 'Cóctel Ape Sunset'), cat: 'drink', ic: '🍸', use: 'drink', adult: true, fx: { type: 'drink', amt: .42 }, model: 'cocktail', col: 0xff8a3a, say: L('Orange to red, like the sky over the lotus stage.', 'De naranja a rojo, como el cielo sobre el escenario del loto.'), price: 60 },
  espresso: { n: L('Espresso', 'Café solo'), cat: 'drink', ic: '☕', use: 'drink', fx: { type: 'buzz', amt: .35 }, model: 'coffee', col: 0x3a1e10, say: L('Short, strong, awake.', 'Corto, fuerte, despierto.'), price: 15 },
  latte: { n: L('Café latte', 'Café con leche'), cat: 'drink', ic: '☕', use: 'drink', fx: { type: 'buzz', amt: .25 }, model: 'coffee', col: 0xc89a6a, say: L('Milky, warm, unhurried.', 'Con leche, caliente, sin prisa.'), price: 18 },
  ape_cola: { n: L('Ape Cola', 'Ape Cola'), cat: 'drink', ic: '🥤', use: 'drink', fx: { type: 'buzz', amt: .18 }, model: 'can', col: 0xd8202a, say: L('Fizz, sugar, a small burp.', 'Burbujas, azúcar, un pequeño eructo.'), price: 8 },
  kaleido_tea: { n: L('Kaleido tea (fictional, adults)', 'Té Kaleido (ficticio, adultos)'), cat: 'alien', ic: '🫖', use: 'drink', adult: true, fx: { type: 'psy', amt: .5 }, model: 'coffee', col: 0x9a5aff, say: L('Petal-blue tea. The patterns arrive slowly, like a tide.', 'Té azul pétalo. Los patrones llegan despacio, como una marea.'), price: 40 },
  float_fruit: { n: L('Astro-9 float fruit', 'Fruta flotante de Astro-9'), cat: 'alien', ic: '🫐', use: 'eat', fx: { type: 'float', amt: .9 }, model: 'fruit', col: 0x7ab8ff, say: L('Fizzy and light. Your knees feel like balloons.', 'Burbujeante y ligera. Tus rodillas parecen globos.'), price: 25 },
  zephyr_pod: { n: L('Nimbus zephyr pod', 'Vaina céfiro de Nimbus'), cat: 'alien', ic: '🌬️', use: 'eat', fx: { type: 'dash', amt: .9 }, model: 'fruit', col: 0xf4f0a0, say: L('Tastes like a tailwind. Your legs want to run.', 'Sabe a viento a favor. Tus piernas quieren correr.'), price: 25 },
  moon_berry: { n: L('Verdalux moon-berries', 'Bayas lunares de Verdalux'), cat: 'alien', ic: '🫐', use: 'eat', fx: { type: 'glow', amt: .5 }, model: 'fruit', col: 0x7aff9a, say: L('Cool and sweet. Everything glows a little greener.', 'Frescas y dulces. Todo brilla un poco más verde.'), price: 15 }
});
for (const id of ['pre', 'herb', 'pipe', 'beer', 'nargila', 'magic_mushroom', 'mocha']) if (AV.ITEMS[id]) AV.ITEMS[id].adult = true;

/* ======================= how many steps each item takes ======================= */
const PER = { pre: 8, pre_mini: 4, pre_jd: 10, pipe: 3, nargila: 10, beer: 6, mojito: 5, ape_sunset: 5, water: 3, coconut: 4, espresso: 2, latte: 4, ape_cola: 4, thai_tea: 4, pineapple_shake: 4, mocha: 4, bissap: 3, kaleido_tea: 4,
  mango: 4, khao_soi: 5, smoothie: 4, sai_ua: 3, snack: 4, crisps: 4, alien_jelly: 2, gummy: 1, magic_mushroom: 2, glow_moss: 3, float_fruit: 2, zephyr_pod: 2, moon_berry: 3 };
CONS.spec = function (id) {
  const d = AV.ITEMS[id]; if (!d) return null;
  if (d.use === 'smoke') return { kind: d.model === 'joint' ? 'joint' : id === 'pipe' ? 'pipe' : 'hookah', n: PER[id] || 6, light: d.model === 'joint' || id === 'pipe', load: id === 'pipe' ? 'herb' : null };
  if (d.keep) return null;                                     /* reusable items keep the old one-shot use */
  if (d.use === 'drink') return { kind: 'drink', n: PER[id] || 4 };
  if (d.use === 'eat') return { kind: 'eat', n: PER[id] || 3, delay: id === 'gummy' ? 45 : 0 };
  if (d.use === 'alien') return { kind: 'breathe', n: PER[id] || 3 };
  return null;
};
CONS.open = id => st().open[id] || null;
const VIT_BY = { food: [18, 4], drink: [6, 3], smoke: [-3, 14], alien: [2, 12] };

/* ======================= models (registered with bag.js) ======================= */
const geoUp = (() => { const g = new THREE.CylinderGeometry(1, 1, 1, 14); g.translate(0, .5, 0); return g })();   /* liquids scale from the bottom */
const EXT = AV.bag.ext = AV.bag.ext || {};
EXT.joint = (d, id, k) => { const { mat, mesh, CYL, SPH } = k, g = new THREE.Group(), Lj = d.len || .11, body = new THREE.Group(); body.name = 'body'; g.add(body);
  const paper = mesh(CYL, mat(0xf4f0e4, { roughness: .8 }), -Lj / 2, 0, 0, .0075, Lj, .0075, 0, 0, Math.PI / 2); body.add(paper);
  body.add(mesh(CYL, mat(0xc8a070, { roughness: .9 }), -.006, 0, 0, .0078, .014, .0078, 0, 0, Math.PI / 2));              /* card filter at the mouth end */
  const twist = mesh(new THREE.ConeGeometry(1, 1, 10), mat(0xf4f0e4), -Lj - .006, 0, 0, .0076, .014, .0076, 0, 0, Math.PI / 2); twist.name = 'twist'; g.add(twist);
  const ash = mesh(CYL, mat(0x8a8a88, { roughness: 1 }), -Lj, 0, 0, .0072, .006, .0072, 0, 0, Math.PI / 2); ash.name = 'ash'; g.add(ash);
  const em = mesh(SPH, mat(0x3a2a22, { emissive: 0xff5a1a, emissiveIntensity: 0 }), -Lj - .003, 0, 0, .0082, .0082, .0082); em.name = 'ember'; g.add(em);
  g.userData.len = Lj; g.rotation.z = -.25; return g };
EXT.bottle = (d, id, k) => { const { mat, mesh, CYL } = k, g = new THREE.Group();
  g.add(mesh(CYL, mat(d.col, { roughness: .1, metalness: .1, transparent: true, opacity: .35 }), 0, 0, 0, .046, .2, .046)); g.add(mesh(CYL, mat(d.col, { roughness: .1, transparent: true, opacity: .45 }), 0, .14, 0, .018, .08, .018));
  const liq = new THREE.Mesh(geoUp, mat(id === 'water' ? 0xbfe8ff : 0xd8a030, { roughness: .05, transparent: true, opacity: .85 })); liq.position.y = -.095; liq.scale.set(.04, .17, .04); liq.name = 'liquid'; liq.userData.full = .17; g.add(liq);
  g.add(mesh(CYL, mat(0xf0e8c8), 0, -.01, 0, .047, .06, .047)); g.add(mesh(CYL, mat(0xc8c8c8, { metalness: .6 }), 0, .185, 0, .02, .01, .02)); return g };
EXT.cup = (d, id, k) => { const { mat, mesh, CYL } = k, g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(1, .8, 1, 14, 1, true), mat(0xf4f4f4, { transparent: true, opacity: .35, side: THREE.DoubleSide }), 0, 0, 0, .055, .15, .055));
  const liq = new THREE.Mesh(geoUp, mat(d.col, { roughness: .3 })); liq.position.y = -.072; liq.scale.set(.046, .13, .046); liq.name = 'liquid'; liq.userData.full = .13; g.add(liq);
  g.add(mesh(CYL, mat(0xff4ad2), .015, .11, 0, .006, .14, .006, 0, 0, .2)); return g };
EXT.cocktail = (d, id, k) => { const { mat, mesh, CYL, TOR } = k, g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(1, .7, 1, 16, 1, true), mat(0xffffff, { transparent: true, opacity: .25, roughness: .05, side: THREE.DoubleSide }), 0, 0, 0, .05, .14, .05));
  const liq = new THREE.Mesh(geoUp, mat(d.col, { roughness: .1, transparent: true, opacity: .8 })); liq.position.y = -.066; liq.scale.set(.044, .12, .044); liq.name = 'liquid'; liq.userData.full = .12; g.add(liq);
  for (let i = 0; i < 3; i++) g.add(mesh(k.BOX, mat(0xe8f8ff, { transparent: true, opacity: .55, roughness: .05 }), (i - 1) * .015, .02 + i * .02, .005 * i, .018, .018, .018, i, i * .7, 0));   /* ice */
  g.add(mesh(CYL, mat(0x9ad84a), .035, .075, 0, .022, .004, .022, Math.PI / 2, 0, .3)); g.add(mesh(CYL, mat(0x2a2a2a), -.012, .1, 0, .004, .16, .004, 0, 0, -.25)); return g };
EXT.coffee = (d, id, k) => { const { mat, mesh, CYL, TOR } = k, g = new THREE.Group(), white = mat(0xf8f4ee, { roughness: .35 });
  g.add(mesh(new THREE.CylinderGeometry(1, .78, 1, 16, 1, true), white, 0, 0, 0, .042, .07, .042)); g.add(mesh(CYL, white, 0, -.034, 0, .033, .006, .033)); g.add(mesh(TOR, white, .045, 0, 0, .018, .018, .018, 0, 0, 0));
  g.add(mesh(CYL, white, 0, -.04, 0, .07, .006, .07));   /* saucer */
  const liq = new THREE.Mesh(geoUp, mat(d.col, { roughness: .2 })); liq.position.y = -.033; liq.scale.set(.037, .06, .037); liq.name = 'liquid'; liq.userData.full = .06; g.add(liq); g.userData.steam = 1; return g };
EXT.can = (d, id, k) => { const { mat, mesh, CYL } = k, g = new THREE.Group(); g.add(mesh(CYL, mat(d.col, { metalness: .5, roughness: .3 }), 0, 0, 0, .033, .12, .033)); g.add(mesh(CYL, mat(0xd8d8d8, { metalness: .8, roughness: .2 }), 0, .063, 0, .03, .008, .03));
  g.add(mesh(CYL, mat(0xffffff), 0, .01, .0335, .02, .03, .001, Math.PI / 2)); return g };
EXT.gummy = (d, id, k) => { const g = new THREE.Group(); g.add(k.mesh(new THREE.TorusGeometry(1, .38, 8, 14, 2.2), k.mat(d.col, { transparent: true, opacity: .85, roughness: .25, emissive: d.col, emissiveIntensity: .15 }), 0, 0, 0, .03, .03, .03, 0, 0, .4)); return g };
EXT.fruit = (d, id, k) => { const g = new THREE.Group(); g.add(k.mesh(k.ICO, k.mat(d.col, { emissive: d.col, emissiveIntensity: .55, roughness: .4 }), 0, 0, 0, .045, .05, .045)); g.add(k.mesh(k.CYL, k.mat(0x3a8a3a), 0, .05, 0, .004, .025, .004, 0, 0, .3)); return g };

/* ======================= a step ======================= */
let A = null;                                   /* the running step */
let lighter = null;
const SEGS = {
  joint: (light, last) => (light ? [['light', 1.7]] : []).concat([['raise', .45], ['inhale', 1.3], ['lower', .5], ['exhale', 1.7]], last ? [['stub', 1.2]] : []),
  pipe: (light, last) => (light ? [['light', 1.2]] : []).concat([['raise', .45], ['inhale', 1.4], ['lower', .5], ['exhale', 1.7]]),
  hookah: (l, last) => [['raise', .45], ['inhale', 1.8], ['lower', .5], ['exhale', 1.8]],
  drink: (l, last) => [['raise', .45], ['sip', 1.1], ['lower', .45]].concat(last ? [['empty', .7]] : []),
  eat: (l, last) => [['raise', .4], ['bite', .6], ['lower', .4], ['chew', .6]].concat(last ? [['empty', .4]] : []),
  breathe: (l, last) => [['raise', .45], ['inhale', 1.3], ['lower', .45], ['exhale', 1.2]]
};
let autoPend = null;   /* 2.3: id whose next auto-step is scheduled; busy() stays true across the 350 ms gap */
CONS.busy = () => !!A || !!autoPend;
CONS.finishing = id => autoPend === id || !!(A && A.id === id && A.auto);
CONS.step = function (id) {
  const S = AV.S, d = AV.ITEMS[id], sp = CONS.spec(id); if (!sp || !d) return false; if (A) return true;
  if (!AV.bag.count(id)) { AV.toast(tr('You don’t have that.', 'No tienes eso.')); return true }
  const O = st().open; let rec = O[id];
  if (sp.load) {   /* the pipe: each bowl uses one herb pouch and gives a few hits */
    if (!rec || rec.left <= 0) { if (!AV.bag.count(sp.load)) { AV.toast(tr('Empty. You need a ' + nm(sp.load) + '.', 'Vacía. Necesitas: ' + nm(sp.load) + '.')); return true }
      AV.bag.remove(sp.load); rec = O[id] = { left: sp.n, n: sp.n }; AV.toast(tr('You pack the bowl (' + sp.n + ' hits).', 'Cargas la pipa (' + sp.n + ' caladas).')) } }
  if (!rec) rec = O[id] = { left: sp.n, n: sp.n };
  if (AV.bag.held().id !== id) AV.bag.equip(id); const inv = AV.$('inv'); if (inv && inv.style.display === 'block') AV.closePanel('inv');
  const lightNow = sp.light && !rec.lit, last = rec.left <= 1 && !sp.load;
  A = { id, d, sp, rec, segs: SEGS[sp.kind](lightNow, last), t0: AV.now(), i: -1, dosed: false, auto: A && A.auto };
  if (rec.left === rec.n && !rec.started) { rec.started = 1; AV.toast(d.ic + ' ' + tr(d.say[0], d.say[1])); AV.dlg && AV.dlg.event && AV.dlg.event('use_' + d.cat); crewBark(d) }
  return true;
};
function crewBark(d) { if (d.use !== 'smoke' || !AV.cm || !AV.cm.cur || !AV.W || AV.W.id !== 'chiang_mai') return; const cr = AV.cm.cur.crew; for (const k of ['dino', 'zape']) { const n = cr && cr[k]; if (n && Math.hypot(n.g.position.x - AV.P.x, n.g.position.z - AV.P.z) < 7) { AV.npc.bark(n, k === 'dino' ? tr('Puff puff pass, man.', 'Calada, calada y pasa, tío.') : tr('Respect the bench, respect the smoke.', 'Respeta el banco, respeta el humo.')); break } } }
function dose(a) {
  const { d, sp, rec, id } = a; if (a.dosed) return; a.dosed = true; rec.left = Math.max(0, rec.left - 1); CONS.stats.steps++; rec.lastT = AV.now();
  if (d.fx) { const amt = d.fx.type === 'sober' ? d.fx.amt / rec.n : d.fx.amt / rec.n; if (sp.delay) pend.push({ at: AV.now() + sp.delay, type: d.fx.type, amt: d.fx.amt, key: id + '#' + AV.S.day }); else AV.fx.dose(d.fx.type, amt, id + '#' + (rec.sid = rec.sid || Math.random().toString(36).slice(2, 7))) }
  const g = (d.fx && d.fx.type === 'drink') ? [-2, 10] : VIT_BY[d.cat] || [0, 2]; AV.vitals && AV.vitals.add(g[0] / rec.n, g[1] / rec.n);
  if (sp.light) { if (!rec.lit) CONS.stats.lit++; rec.lit = true }
  AV.save(); AV.bag.refresh && AV.bag.refresh();
}
const pend = [];
function done(a) {
  const { id, d, sp, rec } = a; A = null;
  if (rec.left <= 0 && !sp.load) { delete st().open[id]; st().done[id] = (st().done[id] || 0) + 1; CONS.stats.finished++; AV.bag.remove(id);
    AV.toast(d.ic + ' ' + (sp.kind === 'joint' ? tr('Finished. You stub it out in the ashtray.', 'Terminado. Lo apagas en el cenicero.') : sp.kind === 'drink' ? tr('Empty. ', 'Vacío. ') + tr(d.say[0], d.say[1]) : tr('All gone. ', 'Se acabó. ') + tr(d.say[0], d.say[1])));
    AV.quests && AV.quests.check() }
  else if (sp.load && rec.left <= 0) { rec.lit = false; AV.toast(tr('The bowl is finished. The pipe stays in your backpack.', 'La pipa se ha terminado. Se queda en tu mochila.')) }
  else if (!a.auto) AV.toast(d.ic + ' ' + left(id) + tr(' — U for another', ' — U para otra'));
  AV.save(); AV.bag.refresh && AV.bag.refresh();
  if (a.auto && AV.bag.count(id) && (rec.left > 0)) { autoPend = id; setTimeout(() => { autoPend = null; if (!A && AV.bag.held().id === id) { CONS.step(id); if (A) A.auto = true } }, 350) }
}
const UNIT = { joint: L('drags', 'caladas'), pipe: L('hits', 'caladas'), hookah: L('puffs', 'caladas'), drink: L('sips', 'sorbos'), eat: L('bites', 'bocados'), breathe: L('breaths', 'respiraciones') };
function left(id) { const r = st().open[id], sp = CONS.spec(id); if (!r || !sp) return ''; return r.left + '/' + r.n + ' ' + tr(UNIT[sp.kind][0], UNIT[sp.kind][1]) + tr(' left', ' restantes') }
CONS.left = left;

/* ======================= bag.js integration ======================= */
AV.bag.session = id => !!CONS.spec(id) && CONS.step(id);
AV.bag.sessBusy = CONS.busy;
AV.bag.partialLabel = id => { const r = st().open[id]; return r && r.left < r.n ? ' · <b style="color:#ffd27a">' + tr('open: ', 'empezado: ') + left(id) + (r.lit ? ' 🔥' : '') + '</b>' : '' };
AV.bag.verb = (id, v) => { const sp = CONS.spec(id), r = st().open[id]; if (!sp) return tr(v[0], v[1]);
  if (sp.light && !(r && r.lit)) return r && r.left < r.n ? tr('Relight', 'Reencender') : tr('Light up', 'Encender');
  return { joint: tr('Take a drag', 'Dar una calada'), pipe: tr('Take a hit', 'Dar una calada'), hookah: tr('Puff', 'Calada'), drink: tr('Sip', 'Sorber'), eat: tr('Take a bite', 'Dar un bocado'), breathe: tr('Breathe in', 'Inspirar') }[sp.kind] };
AV.bag.finishBtn = id => { const sp = CONS.spec(id); return sp && (sp.n > 1) ? '<button data-fin="' + id + '">' + tr('Finish it', 'Terminar') + '</button>' : '' };
AV.bag.finish = function (id) { if (!CONS.spec(id)) return AV.bag.use(id); if (A) { A.auto = true; return } AV.bag.use(id); if (A && A.id === id) A.auto = true };
/* putting a lit joint away puts it out (it stays in the backpack, partly smoked) */
const eq0 = AV.bag.equip; AV.bag.equip = function (nid) { const cur = AV.bag.held().id; if (A && cur !== nid) { if (A.dosed) done(A); A = null } putOut(cur, nid !== cur); return eq0.apply(this, arguments) };
function putOut(id, say) { const r = id && st().open[id]; if (r && r.lit) { r.lit = false; if (say) AV.toast(tr('You put it out. ', 'Lo apagas. ') + left(id) + tr(' — saved in your backpack.', ' — guardado en tu mochila.')) } }
const prevE = AV.onWorldEnter; AV.onWorldEnter = function (W) { const O = st().open; for (const k in O) O[k].lit = false; A = null; if (prevE) prevE(W); setupSources(W) };

/* ======================= animation (called from bag.js every frame) ======================= */
const lerp = (a, b, k) => a + (b - a) * k, ease = t => t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t);
AV.bag.pose = function (dt, t, x, y, z) {
  const H = AV.bag.held(), it = H.item, id = H.id, rec = id && st().open[id], sp = id && CONS.spec(id); visuals(it, id, rec, sp, t);
  if (!A || A.id !== id) { if (A && A.id !== id) A = null; return null }
  const a = A, now = AV.now(); let e = now - a.t0, i = 0; while (i < a.segs.length && e > a.segs[i][1]) { e -= a.segs[i][1]; i++ }
  if (i >= a.segs.length) { if (!a.dosed) dose(a); done(a); return null }
  const [seg, dur] = a.segs[i], p = Math.min(1, e / dur);
  if (i !== a.i) { a.i = i; enter(a, seg) }
  const kind = a.sp.kind; let up = 0, rx = 0, rz = 0;
  if (seg === 'raise') up = ease(p); else if (seg === 'lower') up = 1 - ease(p); else if (seg === 'inhale' || seg === 'sip' || seg === 'bite') up = 1; else if (seg === 'light') up = .55 * ease(p / .3);
  if (seg === 'inhale' || seg === 'sip') { if (!a.mid && p > .5) { a.mid = 1 } }
  if ((seg === 'lower' || seg === 'chew' || seg === 'empty' || seg === 'stub' || seg === 'exhale') && !a.dosed) dose(a);
  if (kind === 'drink') { rx = -up * (seg === 'sip' ? .9 + p * .35 : .9) } else rx = -up * .3; rz = up * .3;
  let X = lerp(x, -.05, up), Y = lerp(y, -.17, up), Z = lerp(z, -.4, up);
  if (seg === 'bite') Y += Math.sin(p * Math.PI) * .015;
  if (seg === 'stub') { const q = ease(p); X = lerp(x, -.1, q); Y = lerp(y, -.5, q); Z = lerp(z, -.6, q) }
  if (seg === 'empty') Y = lerp(y, -.75, ease(p));
  if (seg === 'light' && lighter) { lighter.visible = p > .15 && p < .95; const f = lighter.getObjectByName('flame'); if (f) { const on = p > .3; f.visible = on; f.scale.y = .9 + Math.sin(t * 40) * .08 } }
  else if (lighter) lighter.visible = false;
  if (seg === 'exhale' && !a.blown) { a.blown = 1; exhale(kind === 'breathe' ? .5 : kind === 'hookah' ? 1.4 : 1, kind === 'breathe' ? 0x9affc8 : 0xe8e8f0) }
  return [X, Y, Z, rx, rz];
};
function enter(a, seg) {
  const k = a.sp.kind;
  if (seg === 'light') { ensureLighter(); sfx('lighter') }
  if (seg === 'inhale') sfx(k === 'hookah' ? 'bubble' : k === 'breathe' ? 'breath' : 'inhale', { dur: a.segs.find(s => s[0] === 'inhale')[1] });
  if (seg === 'sip') { sfx(a.d.model === 'can' && a.rec.left === a.rec.n ? 'fizz' : 'gulp'); setTimeout(() => sfx('gulp'), 480) }
  if (seg === 'bite') sfx(a.d.cat === 'food' && /snack|crisps/.test(a.id) ? 'crunch' : 'bite');
  if (seg === 'exhale') sfx('exhale');
  if (seg === 'stub') { sfx('stub'); puffAt(new THREE.Vector3(-.1, -.42, -.6), .6, 0x9a9a9a) }
  if (seg === 'empty') sfx(a.sp.kind === 'drink' ? 'clink' : 'bite');
}
function ensureLighter() {
  if (lighter) return; const VM = AV.bag.held().VM, g = lighter = new THREE.Group(), m = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .4 }, o || {}));
  const b = new THREE.Mesh(new THREE.BoxGeometry(.022, .05, .012), m(0xd82a6a)); g.add(b); const cap = new THREE.Mesh(new THREE.BoxGeometry(.022, .01, .012), m(0xc8c8c8, { metalness: .8 })); cap.position.y = .03; g.add(cap);
  const fl = new THREE.Mesh(new THREE.ConeGeometry(.006, .026, 8), new THREE.MeshBasicMaterial({ color: 0xffb04a, transparent: true, opacity: .9 })); fl.position.y = .05; fl.name = 'flame'; g.add(fl);
  g.position.set(-.17, -.045, .02); g.visible = false; VM.add(g);
}
/* per-frame look of the held item: ember glow, joint length, liquid level, size of food */
function visuals(it, id, rec, sp, t) {
  if (!it || !sp) return; const k = rec ? rec.left / rec.n : 1, a = A && A.id === id ? A : null, seg = a && a.i >= 0 ? a.segs[a.i][0] : null;
  if (sp.kind === 'joint') { const body = it.getObjectByName('body'), em = it.getObjectByName('ember'), ash = it.getObjectByName('ash'), tw = it.getObjectByName('twist'), Lj = it.userData.len || .11;
    let kk = k; if (seg === 'stub') kk = Math.max(.05, k); const len = Lj * (.3 + .7 * kk); if (body) body.scale.x = len / Lj;
    const tip = -len; if (em) em.position.x = tip - .003; if (ash) { ash.position.x = tip; ash.visible = rec && rec.left < rec.n } if (tw) tw.visible = !rec || rec.left === rec.n;
    const lit = rec && rec.lit || seg === 'inhale' || (seg === 'light' && a && AV.now() - a.t0 > 1.1);
    if (em && em.material) { const tgt = !lit ? 0 : seg === 'inhale' ? 2.1 : .8 + Math.sin(t * 2.1) * .2; em.material.emissiveIntensity += (tgt - em.material.emissiveIntensity) * .2; em.material.emissive.setHex(seg === 'inhale' ? 0xff3a08 : 0xc8300a); em.material.color.setHex(lit ? 0x2a0a04 : 0x3a2a22) }
    /* a thin wisp curls up from the lit tip */
    if (lit && em && (wispT -= 1 / 60) <= 0) { wispT = seg === 'inhale' ? .07 : .32; const v = new THREE.Vector3(); em.getWorldPosition(v); AV.cam.worldToLocal(v); puffAt(v, seg === 'inhale' ? .35 : .22, 0xdcdce4, true) }
    /* a lit joint left alone goes out after ~2.5 minutes */
    if (rec && rec.lit && !a && AV.now() - (rec.lastT || 0) > 150) { rec.lit = false; CONS.stats.wentOut++; AV.toast(tr('Your ' + nm(id) + ' went out. U to relight — ', 'Tu ' + nm(id) + ' se apagó. U para reencender — ') + left(id)) } }
  else if (sp.kind === 'drink' || sp.kind === 'hookah') { const liq = it.getObjectByName('liquid'); let kk = k; if (seg === 'sip' && a && !a.dosed) kk = (rec.left - Math.min(1, (AV.now() - a.t0 - .45) / 1.1)) / rec.n; if (liq) { liq.scale.y = Math.max(.0001, liq.userData.full * Math.max(0, kk)); liq.visible = kk > .01 }
    if (it.userData.steam && kk > 0 && (wispT -= 1 / 60) <= 0) { wispT = .5; const v = new THREE.Vector3(0, .04, 0); it.localToWorld(v); AV.cam.worldToLocal(v); puffAt(v, .18, 0xffffff, true) } }
  else if (sp.kind === 'eat' || sp.kind === 'breathe') { let kk = k; if (seg === 'empty') kk = 0; it.scale.setScalar(Math.max(.05, sp.kind === 'eat' ? .35 + .65 * kk : 1)); if (seg === 'empty') it.visible = false; else it.visible = true }
}
let wispT = 0;

/* ======================= smoke particles (camera space, pooled) ======================= */
/* soft round sprites (a radial-gradient texture), not solid balls: they read as smoke, thin at the edges */
const PS = []; let STX = null; const smokeTex = () => { if (STX) return STX; const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,.55)'); r.addColorStop(.45, 'rgba(255,255,255,.22)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return STX = new THREE.CanvasTexture(c) };
const spr = (col, op) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex(), color: col || 0xe8e8f0, transparent: true, opacity: op, depthWrite: false })); m.material.rotation = Math.random() * 6; m.renderOrder = 5; return m };
function puffAt(v, size, col, wisp) {
  if (PS.length > 70) return; const m = spr(col, wisp ? .3 : .5);
  m.position.copy(v); m.scale.setScalar(.004); AV.cam.add(m); PS.push({ m, life: wisp ? 1.4 : 2.2, max: wisp ? 1.4 : 2.2, s: size, wisp, ph: Math.random() * 6, delay: 0 });
}
function exhale(k, col) { for (let i = 0; i < Math.round(7 * k); i++) { const v = new THREE.Vector3((Math.random() - .5) * .04, -.1, -.32); PS.push(Object.assign(mk(v, col), { delay: i * .07, s: .9 * k })) } }
function mk(v, col) { const m = spr(col, .5); m.position.copy(v); m.scale.setScalar(.004); m.visible = false; AV.cam.add(m); return { m, life: 2.2, max: 2.2, wisp: false, ph: Math.random() * 6 } }
AV.frameFns.push((dt) => {
  for (let i = PS.length - 1; i >= 0; i--) { const p = PS[i]; if (p.delay > 0) { p.delay -= dt; continue } p.m.visible = true; p.life -= dt; const age = p.max - p.life;
    if (p.wisp) { p.m.position.y += dt * .05; p.m.position.x += Math.sin(age * 3 + p.ph) * dt * .006; p.m.scale.setScalar(.012 + age * .05 * p.s) }
    else { p.m.position.y += dt * .06; p.m.position.z -= dt * .3; p.m.position.x += Math.sin(age * 2.5 + p.ph) * dt * .05; p.m.scale.setScalar(.05 + age * .26 * p.s) }
    p.m.material.rotation += dt * .25; p.m.material.opacity = Math.max(0, Math.pow(p.life / p.max, 1.4) * (p.wisp ? .3 : .45)); if (p.life <= 0) { AV.cam.remove(p.m); p.m.material.dispose(); PS.splice(i, 1) } }
  /* delayed effects (the gummy) */
  for (let i = pend.length - 1; i >= 0; i--) if (AV.now() >= pend[i].at) { const q = pend.splice(i, 1)[0]; AV.fx.dose(q.type, q.amt, q.key); AV.toast('🍌 ' + tr('The gummy kicks in — soft, warm and slow.', 'La gominola hace efecto: suave, cálida y lenta.')) }
});
CONS.particles = () => PS.length;

/* ======================= where to buy them (real shops) ======================= */
/* extra stock for existing counters (AV.shop ids); family demo mode hides adult items (js/gameplay_dev.js) */
CONS.EXTRA = { md_nube: [['pre_jd', 75], ['gummy', 35], ['latte', 4]], pai_herb: [['gummy', 30], ['pre_mini', 18]], kt_leaf: [['ape_sunset', 45], ['ape_cola', 6], ['gummy', 30]],
  vx_forage: [['moon_berry', 15], ['kaleido_tea', 40]], ks_ranger: [['ape_cola', 6], ['espresso', 8]], jlm_nargila: [['espresso', 6]] };
const open0 = AV.shop.open; AV.shop.open = function (v) { const ex = CONS.EXTRA[v.id]; let items = v.items.slice(); if (ex) for (const e of ex) if (!items.some(i => i[0] === e[0])) items.push(e);
  if (AV.family && AV.family.on()) items = items.filter(i => !(AV.ITEMS[i[0]] || {}).adult); return open0.call(this, Object.assign({}, v, { items })) };
/* Giant Hostel shop (Chiang Mai): keep Nunyin's panel, add a second shelf (cocktails, coffee, cola, a mini pre-roll, the gummy) */
const GH_EXTRA = [['pre_mini', 30], ['gummy', 35], ['mojito', 55], ['ape_sunset', 60], ['espresso', 15], ['ape_cola', 8]];
function giantHostel() {
  if (!AV.cm || !AV.cm.shopPanel || AV.cm.shopPanel.__c22) return; const sp0 = AV.cm.shopPanel;
  AV.cm.shopPanel = function () { sp0.apply(this, arguments); const p = AV.$('cmp'), grid = p && p.querySelector('.grid'); if (!grid) return;
    const fam = AV.family && AV.family.on(); if (fam) grid.querySelectorAll('[data-i]').forEach(b => { if ((AV.ITEMS[b.dataset.i] || {}).adult) b.remove() });
    GH_EXTRA.filter(e => !(fam && AV.ITEMS[e[0]].adult)).forEach(([id, price]) => { const b = document.createElement('button'); b.dataset.i2 = id; b.innerHTML = AV.ITEMS[id].ic + ' ' + nm(id) + '<small>' + price + ' ' + tr('credits', 'créditos') + '</small>'; grid.appendChild(b);
      b.onclick = () => { if (AV.S.money < price) return AV.toast(tr('That’s ' + price + ' credits and you have ' + AV.S.money + '.', 'Son ' + price + ' créditos y tienes ' + AV.S.money + '.')); if (AV.txn(-price, 'Giant Hostel: ' + nm(id))) { AV.bag.add(id, 1, true); AV.toast('✔ ' + AV.ITEMS[id].ic + ' ' + nm(id) + tr(' → backpack. Hold it (I) and use it with U.', ' → mochila. Sostenlo (I) y úsalo con U.')) } } }) };
  AV.cm.shopPanel.__c22 = 1;
}
/* new carts where there was nothing to buy: Astro-9 (float fruit, kaleido tea, cola), Nimbus (zephyr pods, espresso), Jungle Dub (pre-roll, coconut, cola) */
const CARTS = {
  astro9: { at: ['plaza'], id: 'a9_fruit', name: L('Orbit Fruit Cart', 'Carrito Fruta Orbital'), sign: ['ORBIT FRUIT', 'float fruit · kaleido tea'], col: ['#1a1a3a', '#7ab8ff'], greet: L('Zibb (three eyes, one smile): “Float fruit! Jump like the moon.”', 'Zibb (tres ojos, una sonrisa): “¡Fruta flotante! Salta como la luna.”'), items: [['float_fruit', 25], ['kaleido_tea', 40], ['ape_cola', 8], ['alien_jelly', 18]] },
  nimbus: { at: ['cafe', 'plaza'], id: 'nb_zephyr', name: L('Zephyr Pod Kiosk', 'Quiosco de Vainas Céfiro'), sign: ['ZEPHYR PODS', 'run with the wind'], col: ['#f4f8ff', '#3a7ad8'], greet: L('Aera: “One pod and the wind is always behind you. For a while.”', 'Aera: “Una vaina y el viento siempre a tu espalda. Un rato.”'), items: [['zephyr_pod', 25], ['espresso', 15], ['latte', 18], ['water', 10]] },
  jungle_dub: { at: ['bar', 'river', 'stage'], id: 'jd_yard', name: L('Dub Yard Stall', 'Puesto Dub Yard'), sign: ['DUB YARD', 'adults 18+ · fictional'], col: ['#1a2a12', '#f4d84a'], greet: L('Ras Benji: “Easy now. Slow drags, big bass.”', 'Ras Benji: “Tranquilo. Caladas lentas, bajos grandes.”'), items: [['pre_jd', 75], ['pre_mini', 30], ['coconut', 20], ['ape_cola', 8], ['water', 10]] },
  ape_town: { at: ['finca', 'stage'], id: 'at_snack', name: L('Finca Snack Cart', 'Carrito de la Finca'), sign: ['FINCA SNACKS', 'coffee · cola · crisps'], col: ['#3a1a4a', '#ffd84a'], greet: L('Pip: “Fresh crisps, cold cola, hot coffee. Pick one!”', 'Pip: “Chips recién hechas, cola fría, café caliente. ¡Elige!”'), items: [['espresso', 15], ['latte', 18], ['ape_cola', 8], ['crisps', 4], ['mojito', 55]] }
};
CONS.carts = {};
function setupSources(W) {
  if (!W) return; if (W.id === 'chiang_mai') setTimeout(giantHostel, 0);
  const C = CARTS[W.id]; if (!C || W.__cons22) return; W.__cons22 = 1;
  try { const p = (W.places || []).find(q => C.at.includes(q.id)) || (W.places || [])[0]; if (!p) return; let s = null;
    for (let d = 3; d < 22 && !s; d += 1.5) for (let k = 0; k < 10 && !s; k++) { const a = k / 10 * Math.PI * 2, x = p.x + Math.cos(a) * d, z = p.z + Math.sin(a) * d; if (W.surface(x, z) !== null && AV.isFree(W, x, z, 1.6) && AV.isFree(W, x, z + 1.6, .6)) s = [x, z] }
    if (!s) return; const [x, z] = s, y = W.surface(x, z) || 0, g = new THREE.Group(), M = c => new THREE.MeshStandardMaterial({ color: c, roughness: .6 }), box = (m, px, py, pz, sx, sy, sz) => { const b = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m); b.position.set(px, py, pz); g.add(b); return b };
    box(M(0x6a4a2a), 0, .5, 0, 1.8, .9, .8); box(M(0xe8dcc0), 0, .98, 0, 1.9, .06, .9); for (const sx of [-.85, .85]) box(M(0x3a3a3a), sx, 1.5, -.3, .06, 1.1, .06);
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = 192; const c = cv.getContext('2d'); c.fillStyle = C.col[0]; c.fillRect(0, 0, 512, 192); c.strokeStyle = C.col[1]; c.lineWidth = 8; c.strokeRect(8, 8, 496, 176); c.fillStyle = C.col[1]; c.textAlign = 'center'; c.font = 'bold 64px Georgia'; c.fillText(C.sign[0], 256, 98); c.font = 'italic 28px Georgia'; c.fillText(C.sign[1], 256, 150);
    const tx = new THREE.CanvasTexture(cv); tx.encoding = THREE.sRGBEncoding; const sg = new THREE.Mesh(new THREE.PlaneGeometry(1.8, .68), new THREE.MeshStandardMaterial({ map: tx, emissive: 0xffffff, emissiveMap: tx, emissiveIntensity: .35, side: THREE.DoubleSide })); sg.position.set(0, 2.1, -.3); g.add(sg);
    for (let i = 0; i < 4; i++) box(M([0x7ab8ff, 0xffd84a, 0xd8202a, 0x9a5aff][i]), -.6 + i * .4, 1.1, .1, .16, .16, .16);
    g.position.set(x, y, z); g.rotation.y = Math.atan2(AV.P.x - x, AV.P.z - z) || 0; W.group.add(g); W.cols && W.cols.push([x - .95, x + .95, z - .45, z + .45]);
    const V = { id: C.id, name: C.name, greet: C.greet, items: C.items, x, z, reach: 4.5 };
    W.T.push({ x, z, r: 2.6, label: () => '🛒 ' + tr(C.name[0], C.name[1]) + tr(': buy', ': comprar'), fn: () => AV.shop.open(V), kind: 'shop' });
    W.places && W.places.push({ id: C.id, name: C.name, x, z, icon: '🛒' }); CONS.carts[W.id] = { x, z } } catch (e) { console.warn('cons cart', W.id, e) }
}
})(window.AV);
