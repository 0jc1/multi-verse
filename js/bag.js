/* APEVERSE V0.9.5 - bag.js : the universal backpack (works on every planet, saved with the game).
   Pick up (world pickups + things you dropped), buy (shops call AV.bag.add), carry, equip (held in first-person view), use / eat / drink /
   smoke / play / wear / examine (with visible first-person animations and gradual effects from js/effects.js), drop (stays in that world).
   Keys: I backpack · U use the held item · X clear effects. Phone: Bag button + Use button. Storage: AV.S.items {id: count} (unchanged format). */
'use strict';
(function (AV) {
const tr = AV.tr, $ = AV.$;
const BAG = AV.bag = {};
const D = id => AV.ITEMS[id] || { n: [id, id], cat: 'misc', ic: '❔', use: 'look', keep: true, model: 'card', col: 0xaaaaaa, say: ['A curious thing.', 'Una cosa curiosa.'] };
const nm = id => { const d = D(id); return AV.ui === 'es' ? d.n[1] : d.n[0] };
const st = () => { const S = AV.S; S.items = S.items || {}; S.bag = S.bag || { eq: null }; S.drops = S.drops || {}; S.picked = S.picked || {}; return S };
BAG.count = id => (st().items[id] || 0);
BAG.add = function (id, n, silent) { const S = st(); S.items[id] = (S.items[id] || 0) + (n || 1); if (!silent) AV.toast(D(id).ic + ' ' + nm(id) + tr(' → backpack (I)', ' → mochila (I)')); AV.quests && AV.quests.check(); AV.save(); refresh() };
BAG.remove = function (id, n) { const S = st(); S.items[id] = Math.max(0, (S.items[id] || 0) - (n || 1)); if (!S.items[id]) { delete S.items[id]; if (S.bag.eq === id) BAG.equip(null) } AV.save(); refresh() };

/* ======================= first-person viewmodel ======================= */
const VM = new THREE.Group(); VM.position.set(-.36, -.34, -.72); let vmItem = null, hand = null;
const mat = (c, o) => { const m = new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .55 }, o || {})); m.color.convertSRGBToLinear(); if (m.emissive) m.emissive.convertSRGBToLinear(); return m };
const mesh = (g, m, x, y, z, sx, sy, sz, rx, ry, rz) => { const o = new THREE.Mesh(g, m); o.position.set(x || 0, y || 0, z || 0); o.scale.set(sx || 1, sy || sx || 1, sz || sx || 1); o.rotation.set(rx || 0, ry || 0, rz || 0); return o };
const SPH = new THREE.SphereGeometry(1, 14, 10), CYL = new THREE.CylinderGeometry(1, 1, 1, 14), BOX = new THREE.BoxGeometry(1, 1, 1), HEM = new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), OCT = new THREE.OctahedronGeometry(1, 0), ICO = new THREE.IcosahedronGeometry(1, 1), TOR = new THREE.TorusGeometry(1, .18, 8, 20);
function model(id) {
  const d = D(id), g = new THREE.Group(), c = d.col, add = o => { g.add(o); return o };
  switch (d.model) {
    case 'bottle': add(mesh(CYL, mat(c, { roughness: .15, metalness: .2, transparent: true, opacity: .85 }), 0, 0, 0, .045, .2, .045)); add(mesh(CYL, mat(c, { roughness: .15 }), 0, .14, 0, .018, .08, .018)); add(mesh(CYL, mat(0xf0e8c8), 0, -.01, 0, .046, .06, .046)); break;
    case 'cup': add(mesh(new THREE.CylinderGeometry(1, .8, 1, 14), mat(0xf4f4f4, { transparent: true, opacity: .6 }), 0, 0, 0, .055, .15, .055)); add(mesh(CYL, mat(c), 0, -.01, 0, .048, .12, .048)); add(mesh(CYL, mat(0xff4ad2), .015, .11, 0, .006, .14, .006, 0, 0, .2)); break;
    case 'coconut': add(mesh(SPH, mat(c, { roughness: .9 }), 0, 0, 0, .085, .08, .085)); add(mesh(CYL, mat(0x7aff8a), .02, .09, 0, .006, .12, .006, 0, 0, .3)); break;
    case 'bowl': add(mesh(HEM, mat(0xf4f0e4), 0, 0, 0, .1, -.06, .1)); add(mesh(HEM, mat(c), 0, -.005, 0, .085, .045, .085)); break;
    case 'skewer': add(mesh(CYL, mat(0xd8b080), 0, 0, 0, .004, .26, .004)); for (const y of [-.03, .03, .09]) add(mesh(SPH, mat(c, { roughness: .6 }), 0, y, 0, .025, .03, .025)); break;
    case 'sack': add(mesh(BOX, mat(c, { roughness: .7 }), 0, 0, 0, .11, .15, .04)); add(mesh(BOX, mat(0xf4f0e4), 0, .08, 0, .1, .015, .03)); break;
    case 'cube': add(mesh(BOX, mat(c, { emissive: c, emissiveIntensity: .5, transparent: true, opacity: .85 }), 0, 0, 0, .07, .07, .07)); break;
    case 'joint': add(mesh(CYL, mat(0xf4f0e4), 0, 0, 0, .007, .1, .007, 0, 0, Math.PI / 2 - .25)); add(mesh(SPH, mat(0xff6a2a, { emissive: 0xff5a1a, emissiveIntensity: 1.5 }), -.048, .012, 0, .009)); break;
    case 'pipe': add(mesh(SPH, mat(c, { transparent: true, opacity: .7, roughness: .05, metalness: .3 }), 0, 0, 0, .04, .04, .04)); add(mesh(CYL, mat(c, { transparent: true, opacity: .7, roughness: .05 }), .07, .01, 0, .012, .13, .012, 0, 0, Math.PI / 2 - .2)); add(mesh(HEM, mat(0x3a8a3a), 0, .03, 0, .02, .012, .02)); break;
    case 'mushroom': add(mesh(CYL, mat(0xf4e8d0), 0, -.03, 0, .015, .07, .015)); add(mesh(HEM, mat(c, { emissive: c, emissiveIntensity: .8 }), 0, .005, 0, .05, .035, .05)); break;
    case 'crystal': add(mesh(OCT, mat(c, { emissive: c, emissiveIntensity: .9, transparent: true, opacity: .85, roughness: .1 }), 0, 0, 0, .04, .08, .04)); break;
    case 'moss': add(mesh(ICO, mat(c, { emissive: c, emissiveIntensity: .8, roughness: 1 }), 0, 0, 0, .05, .035, .05)); break;
    case 'marble': add(mesh(SPH, mat(c, { emissive: c, emissiveIntensity: .6, roughness: .05, metalness: .4 }), 0, .03, 0, .03)); break;
    case 'ukulele': add(mesh(SPH, mat(c), 0, -.06, 0, .09, .08, .03)); add(mesh(SPH, mat(c), 0, .03, 0, .07, .06, .03)); add(mesh(BOX, mat(0x3a2414), 0, .17, 0, .025, .22, .012)); break;
    case 'flute': add(mesh(CYL, mat(c), 0, 0, 0, .014, .4, .014, 0, 0, Math.PI / 2)); for (let k = 0; k < 5; k++) add(mesh(CYL, mat(0x2a2a1a), -.1 + k * .05, .013, 0, .004, .004, .004)); break;
    case 'drum': add(mesh(CYL, mat(c), 0, 0, 0, .09, .13, .09)); add(mesh(CYL, mat(0xf0e8d0), 0, .066, 0, .088, .005, .088)); break;
    case 'shirt': add(mesh(BOX, mat(c), 0, 0, 0, .18, .2, .02)); add(mesh(BOX, mat(c), -.1, .07, 0, .06, .06, .02, 0, 0, .5)); add(mesh(BOX, mat(c), .1, .07, 0, .06, .06, .02, 0, 0, -.5)); break;
    case 'beads': add(mesh(TOR, mat(c, { emissive: c, emissiveIntensity: .7 }), 0, 0, 0, .06, .06, .06, 1.2)); break;
    case 'cassette': add(mesh(BOX, mat(0x1a1a1a), 0, 0, 0, .1, .064, .014)); add(mesh(BOX, mat(c), 0, .01, .008, .085, .03, .002)); break;
    /* V1.1 Songkran water tools (js/songkran_water.js): the water inside is a separate mesh named 'water' that shows the fill level */
    case 'bucket': { const b = add(mesh(new THREE.CylinderGeometry(1, .78, 1, 16, 1, true), mat(c, { side: THREE.DoubleSide, roughness: .4 }), 0, 0, 0, .12, .15, .12)); b.name = 'shell'; add(mesh(CYL, mat(c), 0, -.075, 0, .094, .01, .094)); add(mesh(TOR, mat(0x9a9ea4, { metalness: .6, roughness: .3 }), 0, .02, 0, .12, .12, .12, 0, 0, Math.PI / 2));
      const w = add(mesh(CYL, mat(0x7ad8ff, { transparent: true, opacity: .8, roughness: .05, emissive: 0x2a8ac8, emissiveIntensity: .3 }), 0, 0, 0, .105, .12, .105)); w.name = 'water'; w.userData.full = .12; break }
    case 'watergun': { add(mesh(BOX, mat(c, { roughness: .35 }), 0, 0, 0, .06, .07, .26)); add(mesh(CYL, mat(0xffd84a), 0, .015, -.18, .02, .12, .02, Math.PI / 2)); add(mesh(BOX, mat(c), 0, -.08, .07, .045, .12, .05, -.3));
      const w = add(mesh(CYL, mat(0x7ad8ff, { transparent: true, opacity: .75, roughness: .05 }), 0, .075, .03, .045, .09, .045)); w.name = 'water'; w.userData.full = .09; add(mesh(CYL, mat(0xffffff, { transparent: true, opacity: .25 }), 0, .075, .03, .05, .1, .05)); break }
    case 'squeeze': { add(mesh(CYL, mat(0xe8f4ff, { roughness: .15, transparent: true, opacity: .45 }), 0, 0, 0, .035, .2, .035)); add(mesh(CYL, mat(c), 0, .12, 0, .015, .05, .015));
      const w = add(mesh(CYL, mat(0x7ad8ff, { transparent: true, opacity: .8, roughness: .05 }), 0, -.01, 0, .031, .17, .031)); w.name = 'water'; w.userData.full = .17; break }
    default: add(mesh(BOX, mat(c), 0, 0, 0, .14, .1, .006));
  }
  return g;
}
/* V0.9.7: ZtonedApe's own hand in first person — furry forearm, tie-dye cuff, leathery palm, four curled fingers + thumb wrapped around the item */
function apeHand() {
  const g = new THREE.Group(), fur = mat(0x3a2a20, { roughness: .95 }), skin = mat(0x8a6650, { roughness: .7 }), cuff = mat(0xff6ad5, { roughness: .6 }), cyl = new THREE.CylinderGeometry(1, 1, 1, 10);
  const seg = (m, x0, y0, z0, x1, y1, z1, r) => { const a = new THREE.Vector3(x0, y0, z0), b = new THREE.Vector3(x1, y1, z1), d = b.clone().sub(a), o = new THREE.Mesh(cyl, m); o.scale.set(r, d.length(), r); o.position.copy(a).add(d.multiplyScalar(.5)); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); g.add(o); return o };
  seg(fur, -.02, -.34, .22, 0, -.09, .05, .048); g.add(mesh(SPH, fur, 0, -.09, .05, .05, .05, .05));            // forearm + wrist
  seg(cuff, -.016, -.3, .19, -.012, -.25, .155, .056);                                                            // tie-dye sleeve cuff
  g.add(mesh(SPH, skin, 0, -.045, .03, .046, .052, .034));                                                       // palm
  for (let k = 0; k < 4; k++) { const z = .055 - k * .022, x0 = .03; seg(skin, x0, -.01 - k * .004, z, .052, .018, z - .004, .012); seg(skin, .052, .018, z - .004, .044, .04, z - .012, .011); g.add(mesh(SPH, fur, .03, -.008 - k * .004, z, .015, .012, .012)) }   // curled fingers + furry knuckles
  seg(skin, -.03, -.05, .03, -.04, .0, .0, .013); seg(skin, -.04, .0, .0, -.02, .025, -.01, .012);              // thumb
  return g;
}
function ensureVM() { if (!VM.parent) AV.cam.add(VM); if (!hand) { hand = apeHand(); VM.add(hand) } }
function showHeld() { ensureVM(); if (vmItem) { VM.remove(vmItem); vmItem = null } const id = st().bag.eq; VM.visible = !!id; if (id) { vmItem = model(id); VM.add(vmItem) } const b = $('tU'); if (b) b.style.display = id && AV.device === 'phone' ? 'block' : 'none' }
BAG.equip = function (id) { st().bag.eq = id; showHeld(); AV.save(); refresh(); if (BAG.onEquip) BAG.onEquip(id) };
BAG.held = () => ({ VM, item: vmItem, id: st().bag.eq });   /* V1.1: lets js/songkran_water.js animate the held tool */

/* ======================= use (animated) ======================= */
let anim = null; const puffs = [];
const VERB = { eat: ['Eat', 'Comer'], drink: ['Drink', 'Beber'], smoke: ['Smoke', 'Fumar'], play: ['Play', 'Tocar'], wear: ['Wear', 'Ponerse'], alien: ['Use', 'Usar'], look: ['Examine', 'Examinar'], splash: ['Splash', 'Salpicar'] };
BAG.use = function (id) {
  const S = st(), d = D(id); if (!BAG.count(id)) return AV.toast(tr('You don’t have that.', 'No tienes eso.')); if (anim) return;
  if (d.use === 'smoke' && AV.W && AV.W.id === 'chiang_mai' && AV.P.x > 8 && AV.P.x < 32 && AV.P.z > 52 && AV.P.z < 88) return AV.toast(tr('Mutt: “Terrace only! Not inside, not in the rooms.”', 'Mutt: “¡Solo en la terraza! Ni dentro ni en las habitaciones.”'));
  if (d.needs && !BAG.count(d.needs)) return AV.toast(tr('Empty. You need a ' + nm(d.needs) + '.', 'Vacía. Necesitas: ' + nm(d.needs) + '.'));
  if (S.bag.eq !== id) BAG.equip(id); closeIfOpen();
  const dur = d.use === 'play' ? 2.6 : d.use === 'look' ? 2.2 : d.use === 'wear' ? 1.2 : 2.4; anim = { id, d, t: 0, t0: AV.now(), dur, done: false, notes: 0 };
};
function finish(a) {
  const d = a.d; if (d.fx) AV.fx.add(d.fx.type, d.fx.amt);
  if (!d.keep) BAG.remove(a.id); if (d.needs) BAG.remove(d.needs);
  AV.toast(d.ic + ' ' + tr(d.say[0], d.say[1])); AV.dlg && AV.dlg.event('use_' + d.cat);
  if (d.use === 'smoke' && AV.cm && AV.cm.cur && AV.W.id === 'chiang_mai') { const cr = AV.cm.cur.crew; for (const k of ['dino', 'zape']) { const n = cr[k]; if (n && Math.hypot(n.g.position.x - AV.P.x, n.g.position.z - AV.P.z) < 7) { AV.npc.bark(n, k === 'dino' ? tr('Puff puff pass, man.', 'Calada, calada y pasa, tío.') : tr('Respect the bench, respect the smoke.', 'Respeta el banco, respeta el humo.')); break } } }
}
const lerp = (a, b, k) => a + (b - a) * k, ease = t => t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t);
AV.frameFns.push((dt, t) => {
  if (!VM.parent) return; const P = AV.P, moving = Math.hypot(P.vx, P.vz) > .5, red = AV.S.set.reduce;
  let x = -.36, y = -.34 + (moving && !red ? Math.abs(Math.sin(t * 9)) * .012 : Math.sin(t * 1.6) * .004), z = -.72, rx = 0, rz = 0;
  if (anim) {
    const a = anim, d = a.d; a.t = AV.now() - a.t0;   /* real time: an animation takes the same seconds even if the frame rate drops */ const up = ease(a.t / .5) * (1 - ease((a.t - (a.dur - .5)) / .5));
    if (d.use === 'drink' || d.use === 'eat' || d.use === 'smoke') { x = lerp(x, -.05, up); y = lerp(y, -.17, up); z = lerp(z, -.4, up); rx = d.use === 'drink' ? -up * .9 : -up * .3; rz = up * .3;
      if (d.use === 'eat' && vmItem) { const bites = Math.min(3, Math.floor(Math.max(0, a.t - .6) / .45)); if (bites > a.notes) { a.notes = bites; vmItem.scale.setScalar(1 - bites * .22); AV.audio && AV.audio.blip(180 + Math.random() * 60, .06, 'square', .05) } }
      if (d.use === 'drink' && a.t > .7 && a.t < 1.9 && Math.floor(a.t * 3) > a.notes) { a.notes = Math.floor(a.t * 3); AV.audio && AV.audio.blip(140, .1, 'sine', .08) }
      if (d.use === 'smoke' && a.t > 1.6 && !a.puffed) { a.puffed = true; for (let k = 0; k < 6; k++) puff(k * .08) } }
    else if (d.use === 'play') { x = lerp(x, -.02, up); y = lerp(y, -.26, up); z = lerp(z, -.55, up); rz = up * (d.model === 'flute' ? 0 : .5) + Math.sin(a.t * 14) * .03 * up; const ni = Math.floor((a.t - .4) / .3); if (ni >= 0 && ni < (d.notes || []).length && ni >= a.notes) { a.notes = ni + 1; AV.audio && AV.audio.blip(d.notes[ni], d.model === 'drum' ? .2 : .35, d.model === 'flute' ? 'sine' : d.model === 'drum' ? 'sine' : 'triangle', d.model === 'drum' ? .35 : .15) } }
    else if (d.use === 'wear') { y = lerp(y, -.7, ease(a.t / 1.1)) }
    else { x = lerp(x, 0, up); y = lerp(y, -.2, up); z = lerp(z, -.45, up); if (vmItem) vmItem.rotation.y = a.t * 2; if (d.use === 'alien' && Math.floor(a.t * 4) > a.notes && a.t < 1.8) { a.notes = Math.floor(a.t * 4); AV.audio && AV.audio.blip([523, 659, 784, 988, 1175, 784, 659][a.notes % 7], .5, 'sine', .07) } }
    if (a.t >= a.dur) { anim = null; finish(a); if (vmItem) { vmItem.scale.setScalar(1); vmItem.rotation.set(0, 0, 0) } }
  }
  VM.position.set(x, y, z); VM.rotation.set(rx, .3, rz);
  for (let i = puffs.length - 1; i >= 0; i--) { const p = puffs[i]; if (p.delay > 0) { p.delay -= dt; continue } p.life -= dt; p.m.visible = true; p.m.position.y += dt * .08; p.m.position.z -= dt * .25; p.m.position.x += Math.sin(p.life * 4 + i) * dt * .03; p.m.scale.setScalar(.03 + (1.8 - p.life) * .12); p.m.material.opacity = Math.max(0, p.life / 1.8 * .45); if (p.life <= 0) { AV.cam.remove(p.m); p.m.material.dispose(); puffs.splice(i, 1) } }
});
function puff(delay) { const m = new THREE.Mesh(SPH, new THREE.MeshBasicMaterial({ color: 0xe8e8f0, transparent: true, opacity: .4, depthWrite: false })); m.position.set(-.02 + (Math.random() - .5) * .05, -.08, -.35); m.visible = false; AV.cam.add(m); puffs.push({ m, life: 1.8, delay }) }

/* ======================= drop / pickups in the world ======================= */
const worldBits = [];
function spawnLoose(W, id, x, z, onTake) {
  const g = new THREE.Group(), it = model(id); it.scale.setScalar(3.2); g.add(it); const ring = new THREE.Mesh(new THREE.TorusGeometry(.42, .03, 6, 24), new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: .8 })); ring.rotation.x = Math.PI / 2; ring.position.y = -.5; g.add(ring);
  const y = (W.surface(x, z) || 0) + .75; g.position.set(x, y, z); W.group.add(g); const ph = Math.random() * 6;
  const tg = { x, z, r: 1.6, label: () => tr('Pick up ', 'Coger ') + D(id).ic + ' ' + nm(id), fn: () => { onTake(); W.group.remove(g); const i = W.T.indexOf(tg); if (i >= 0) W.T.splice(i, 1); g.visible = false } };
  W.T.push(tg); W.upd.push((dt, t) => { if (!g.visible) return; it.rotation.y = t * 1.2 + ph; g.position.y = y + Math.sin(t * 2 + ph) * .08 });
  return g;
}
const prevEnter = AV.onWorldEnter; AV.onWorldEnter = function (W) {
  if (prevEnter) prevEnter(W); const S = st(), id = W.id;
  (AV.PICKUPS[id] || []).forEach(([item, x, z], i) => { const key = id + ':' + i; if (S.picked[key] === S.day) return; const s = AV.safeSpot(W, x, z); spawnLoose(W, item, s[0], s[1], () => { S.picked[key] = S.day; BAG.add(item) }) });
  (S.drops[id] || []).forEach(dr => spawnLoose(W, dr.id, dr.x, dr.z, () => { const L = S.drops[id], j = L.indexOf(dr); if (j >= 0) L.splice(j, 1); BAG.add(dr.id) }));
  showHeld();
};
BAG.drop = function (id) {
  if (!BAG.count(id) || !AV.W) return; const S = st(), P = AV.P, x = P.x - Math.sin(P.yaw) * 1.3, z = P.z - Math.cos(P.yaw) * 1.3, s = AV.safeSpot(AV.W, x, z), wid = AV.W.id;
  BAG.remove(id); const dr = { id, x: s[0], z: s[1], day: S.day }; (S.drops[wid] = S.drops[wid] || []).push(dr); if (S.drops[wid].length > 40) S.drops[wid].shift();
  spawnLoose(AV.W, id, dr.x, dr.z, () => { const L = S.drops[wid], j = L.indexOf(dr); if (j >= 0) L.splice(j, 1); BAG.add(id) }); AV.toast(tr('Dropped: ', 'Soltado: ') + nm(id) + tr(' (it stays here)', ' (se queda aquí)')); refresh();
};

/* ======================= backpack panel (I / Bag) ======================= */
function closeIfOpen() { if ($('inv').style.display === 'block') AV.closePanel('inv') }
function refresh() { if ($('inv') && $('inv').style.display === 'block') render() }
function render() {
  const S = st(), Sset = AV.S.set; if (Sset.fxInt == null) Sset.fxInt = .7; if (Sset.fxDur == null) Sset.fxDur = 1;
  const ids = Object.keys(S.items).filter(k => S.items[k] > 0).sort((a, b) => (D(a).cat > D(b).cat ? 1 : -1));
  const card = id => { const d = D(id), v = VERB[d.use] || VERB.look, eq = S.bag.eq === id;
    return '<div class="bitem' + (eq ? ' eq' : '') + '"><div class="bic">' + d.ic + '</div><div class="bnm">' + nm(id) + ' <b>×' + S.items[id] + '</b><small>' + tr(d.cat, { drink: 'bebida', food: 'comida', smoke: 'fumar', alien: 'alienígena', instrument: 'instrumento', souvenir: 'recuerdo', misc: 'varios' }[d.cat] || d.cat) + (d.keep ? tr(' · reusable', ' · reutilizable') : '') + '</small></div>' +
      '<div class="bbt"><button data-u="' + id + '">' + tr(v[0], v[1]) + '</button><button data-e="' + id + '">' + (eq ? tr('Put away', 'Guardar') : tr('Hold', 'Sostener')) + '</button><button data-d="' + id + '">' + tr('Drop', 'Soltar') + '</button></div></div>' };
  const fxl = AV.fx.active(), FXN = { drink: tr('tipsy', 'achispado'), smoke: tr('stoned', 'colocado'), psy: tr('psychedelic', 'psicodélico'), buzz: tr('buzzing', 'acelerado'), glow: tr('alien glow', 'brillo alienígena') };
  const html = '<b>' + tr('Backpack', 'Mochila') + '</b> · ' + tr('Credits', 'Créditos') + ': ' + S.money + (S.bag.eq ? ' · ' + tr('holding ', 'en la mano: ') + D(S.bag.eq).ic + ' ' + nm(S.bag.eq) + ' (U)' : '') +
    '<div class="bgrid">' + (ids.map(card).join('') || '<div class="note">' + tr('Empty. Buy things in shops, or pick up glowing items you find on every planet.', 'Vacía. Compra cosas en las tiendas o recoge los objetos brillantes que encuentres en cada planeta.') + '</div>') + '</div>' +
    '<details class="bfx"' + (fxl.length ? ' open' : '') + '><summary>' + tr('Effects', 'Efectos') + (fxl.length ? ': ' + fxl.map(e => FXN[e.type] + ' ' + Math.ceil(e.left / 60) + 'm').join(', ') : '') + '</summary>' +
    '<p>' + tr('Intensity', 'Intensidad') + ' <input id="fxI" type="range" min="0" max="1" step=".05" value="' + Sset.fxInt + '"> · ' + tr('Duration', 'Duración') + ' <input id="fxD" type="range" min=".25" max="3" step=".25" value="' + Sset.fxDur + '"> <span id="fxDv">' + Sset.fxDur + '×</span></p>' +
    '<p><label><input id="fxR" type="checkbox" ' + (Sset.reduce ? 'checked' : '') + '> ' + tr('Reduced motion (no sway, no colour cycling)', 'Movimiento reducido (sin vaivén ni ciclos de color)') + '</label> <button id="fxX">' + tr('Clear all effects now (X)', 'Quitar todos los efectos ya (X)') + '</button></p></details>' +
    (AV.quests ? AV.quests.listHtml().replace(/<p><b>(Items|Objetos)<\/b>.*?<\/p>/, '') : '') +
    '<details><summary>' + tr('Transactions', 'Transacciones') + '</summary>' + S.log.slice(0, 12).map(l => '<div>' + tr('Day', 'Día') + ' ' + l.d + ' · ' + l.t + ' · ' + (l.a > 0 ? '+' : '') + l.a + '</div>').join('') + '</details>' +
    '<div class="row"><button data-close>' + tr('Close', 'Cerrar') + '</button><button id="expSave">' + tr('Export save', 'Exportar partida') + '</button></div>';
  const p = $('inv'); if (p.style.display === 'block') { p.innerHTML = html; p.querySelectorAll('[data-close]').forEach(b => b.onclick = () => AV.closePanel('inv')) } else AV.panel('inv', html);
  p.querySelectorAll('[data-u]').forEach(b => b.onclick = () => BAG.use(b.dataset.u)); p.querySelectorAll('[data-e]').forEach(b => b.onclick = () => BAG.equip(st().bag.eq === b.dataset.e ? null : b.dataset.e)); p.querySelectorAll('[data-d]').forEach(b => b.onclick = () => BAG.drop(b.dataset.d));
  $('fxI').oninput = e => { Sset.fxInt = +e.target.value }; $('fxD').oninput = e => { Sset.fxDur = +e.target.value; $('fxDv').textContent = Sset.fxDur + '×' }; $('fxR').onchange = e => { Sset.reduce = e.target.checked; AV.save() }; $('fxX').onclick = () => { AV.fx.reset(); render() };
  $('expSave').onclick = () => { const b = new Blob([AV.exportSave()], { type: 'application/json' }), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'apeverse_save.json'; a.click() };
}
BAG.open = render; BAG.busy = () => !!anim;
AV.toggleInv = function () { if ($('inv').style.display === 'block') return AV.closePanel('inv'); render() };
AV.keymap.KeyU = () => { const id = st().bag.eq; if (id) BAG.use(id); else AV.toast(tr('You are not holding anything. Open the backpack (I) and choose Hold.', 'No sostienes nada. Abre la mochila (I) y elige Sostener.')) };
{ const b = $('tU'); if (b) b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); AV.keymap.KeyU() }) }

/* ======================= V0.9.7: switch held item (mouse wheel / B / ⇄ button) ======================= */
BAG.cycle = function (dir) {
  const S = st(), ids = Object.keys(S.items).filter(k => S.items[k] > 0 && AV.ITEMS[k]).sort((a, b) => (D(a).cat + a > D(b).cat + b ? 1 : -1));
  if (!ids.length) return AV.toast(tr('Your backpack is empty.', 'Tu mochila está vacía.')); if (anim) return;
  const i = ids.indexOf(S.bag.eq), n = ids[((i < 0 ? (dir > 0 ? -1 : 0) : i) + (dir || 1) + ids.length) % ids.length]; BAG.equip(n);
  AV.toast(tr('Holding: ', 'En la mano: ') + D(n).ic + ' ' + nm(n) + ' ×' + S.items[n] + tr(' — U / Use', ' — U / Usar'));
};
AV.keymap.KeyB = () => BAG.cycle(1);
let wheelT = 0; addEventListener('wheel', e => { if (!AV.running || AV.blocking() || !document.pointerLockElement) return; const now = performance.now(); if (now - wheelT < 180) return; wheelT = now; BAG.cycle(e.deltaY > 0 ? 1 : -1) }, { passive: true });
{ const b = $('tN'); if (b) b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); if (AV.running && !AV.blocking()) BAG.cycle(1) }) }

/* ======================= V0.9.7: Energy + Vibe (food fills energy, drinks/smoke/music lift the vibe) ======================= */
const VIT = AV.vitals = {};
VIT.get = () => { const S = st(); if (!S.vit) S.vit = { energy: 75, vibe: 60 }; return S.vit };
VIT.add = (e, v) => { const x = VIT.get(); x.energy = Math.max(0, Math.min(100, x.energy + (e || 0))); x.vibe = Math.max(0, Math.min(100, x.vibe + (v || 0))); AV.hud() };
const VIT_BY = { food: [18, 4], drink: [6, 3], smoke: [-3, 14], alien: [2, 12], instrument: [0, 9], souvenir: [0, 3], misc: [0, 2] };
const _finish = finish; finish = function (a) { _finish(a); const d = a.d, alc = d.fx && d.fx.type === 'drink'; const g = alc ? [-2, 10] : VIT_BY[d.cat] || [0, 2]; VIT.add(g[0], g[1]) };
let vitAcc = 0, hungryWarn = 0; AV.frameFns.push(dt => { if (!AV.running || !AV.S) return; vitAcc += dt; if (vitAcc < 5) return; vitAcc = 0; const x = VIT.get(), moving = Math.hypot(AV.P.vx, AV.P.vz) > 4.5;
  x.energy = Math.max(0, x.energy - (moving ? .5 : .22)); x.vibe += (50 - x.vibe) * .012;
  if (x.energy < 15 && AV.now() - hungryWarn > 240) { hungryWarn = AV.now(); AV.toast(tr('Your stomach growls. Energy low — eat something (food in your backpack or any café).', 'Te ruge el estómago. Energía baja: come algo (comida de la mochila o cualquier café).')) } });
const _hud = AV.hud; AV.hud = function () { _hud.apply(this, arguments); if (!AV.S) return; const x = VIT.get(), el = $('top'); if (el) el.innerHTML += '<br>' + tr('Energy', 'Energía') + ' ' + Math.round(x.energy) + '% · ' + tr('Vibe', 'Vibra') + ' ' + Math.round(x.vibe) + '%' };
/* first run with the backpack: a couple of starter items */
BAG.starter = function () { const S = st(); if (S.bagStarted) return; S.bagStarted = 1; BAG.add('water', 1, true); BAG.add('coconut', 1, true); AV.toast(tr('New: your backpack (I) works on every planet. Look for glowing items to pick up!', 'Nuevo: tu mochila (I) funciona en todos los planetas. ¡Busca objetos brillantes para recoger!')) };
const prev2 = AV.onWorldEnter; AV.onWorldEnter = W => { prev2(W); BAG.starter() };
})(window.AV);
