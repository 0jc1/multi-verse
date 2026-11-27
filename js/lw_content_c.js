/* APEVERSE 2.3 - lw_content_c.js : Milestone C - mission density + reward loops, in every world.
   📌 A job board stands next to every world's arrival point (gold ❗ on the map).  It offers five jobs that pick fresh real places
   each time you take them, so they stay replayable:
     🚕 Fares across town (two passengers, pick-up + timed drop-off, pay by distance)   🎉 Flyer the party (three busy spots)
     📦 Hot food rush (collect + timed delivery, tips vary)   🎸 Street gig (play a set, stay with your crowd for the tips)
     ⭐ Local hero (progression: finish 6 missions in that world -> big bonus + jobs there pay 20% more from then on)
   Daily hustle streak: every 3rd mission you finish on the same in-game day pays a +150 bonus.
   Save: S.lw.perks = { world: 'hero' }, S.lw.day = { d, n }. */
'use strict';
(function (AV) {
const tr = AV.tr, LW = AV.LW, L = LW.L, M = AV.mis, say = LW.say;
const BOARDS = {};
const perk = w => ((LW.st().perks || {})[w] === 'hero' ? 1.2 : 1);
/* random real places of the current world (walkable, not homes), as safe spots */
function pickPlaces(n, minGap) { const W = AV.W; if (!W) return null; const P = AV.P, pool = (W.places || []).filter(p => p && isFinite(p.x) && !/^home_|^vent_/.test(p.id) && W.surface(p.x, p.z) !== null && (!W.routeGroup || W.routeGroup(p.x, p.z) === W.routeGroup(P.x, P.z)));
  const pts = [], used = new Set(); for (let k = 0; k < 60 && pts.length < n; k++) { const p = pool[Math.random() * pool.length | 0]; if (!p || used.has(p.id)) continue; const sp = AV.safeSpot(W, p.x + 2, p.z + 2); if (pts.length && Math.hypot(sp[0] - pts[pts.length - 1][0], sp[1] - pts[pts.length - 1][1]) < (minGap || 25)) continue; used.add(p.id); pts.push([sp[0], sp[1], p.name ? say(p.name) : p.id]) }
  while (pts.length < n) { const a = Math.random() * 6.28, sp = AV.safeSpot(W, P.x + Math.cos(a) * 40, P.z + Math.sin(a) * 40); pts.push([sp[0], sp[1], tr('a street corner', 'una esquina')]) } return pts }
const nm = (mv, i) => mv && mv.pts && mv.pts[i] ? mv.pts[i][2] : '…';
const at = i => mv => mv && mv.pts ? mv.pts[i] : null;
function jobs(w) { const G = BOARDS[w] = { x: null, z: null, name: L('Job board', 'Tablón de trabajos'), r: 2.8 };
  M.def(w + '_taxi', { w, cat: 'transport', giver: G, repeat: true, title: L('Fares across town', 'Carreras por la ciudad'), blurb: L('Two passengers need a ride. Any vehicle, or your legs if you are brave. Pay goes up with distance.', 'Dos pasajeros necesitan transporte. Cualquier vehículo, o a pie si te atreves. Se paga por distancia.'),
    stages: [
      { k: 'spot', ic: '🙋', xz: at(0), onStart: mv => { mv.pts = pickPlaces(4, 35); mv.dist = Math.hypot(mv.pts[1][0] - mv.pts[0][0], mv.pts[1][1] - mv.pts[0][1]) + Math.hypot(mv.pts[3][0] - mv.pts[2][0], mv.pts[3][1] - mv.pts[2][1]) },
        act: L('Pick up the passenger', 'Recoger al pasajero'), obj: () => tr('Pick up passenger 1 at ', 'Recoge al pasajero 1 en ') + nm(M.st().a[w + '_taxi'] && M.st().a[w + '_taxi'].mv, 0), say: L('“Hi! Quick as you can, please.”', '“¡Hola! Lo más rápido que puedas, por favor.”') },
      { k: 'spot', ic: '🏁', xz: at(1), time: 240, act: L('Drop off the passenger', 'Dejar al pasajero'), obj: () => tr('Drop them at ', 'Déjalo en ') + nm(M.st().a[w + '_taxi'] && M.st().a[w + '_taxi'].mv, 1) + tr(' (4 min)', ' (4 min)'), say: L('“Thanks! Keep the change.”', '“¡Gracias! Quédate el cambio.”') },
      { k: 'spot', ic: '🙋', xz: at(2), act: L('Pick up the passenger', 'Recoger al pasajero'), obj: () => tr('Pick up passenger 2 at ', 'Recoge al pasajero 2 en ') + nm(M.st().a[w + '_taxi'] && M.st().a[w + '_taxi'].mv, 2), say: L('“Finally, a ride!”', '“¡Por fin, un transporte!”') },
      { k: 'spot', ic: '🏁', xz: at(3), time: 240, act: L('Drop off the passenger', 'Dejar al pasajero'), obj: () => tr('Drop them at ', 'Déjalo en ') + nm(M.st().a[w + '_taxi'] && M.st().a[w + '_taxi'].mv, 3) + tr(' (4 min)', ' (4 min)'), say: L('“Five stars. Seriously.”', '“Cinco estrellas. En serio.”') } ],
    reward: { money: mv => Math.round(Math.min(420, 70 + ((mv && mv.dist) || 100) * .45) * perk(w)), rep: 2 } });
  M.def(w + '_flyers', { w, cat: 'festival', giver: G, repeat: true, title: L('Flyer the party', 'Reparte flyers de la fiesta'), blurb: L('Tonight there is a party. Hand out flyers at three busy spots before the night starts.', 'Esta noche hay fiesta. Reparte flyers en tres sitios concurridos antes de que empiece la noche.'),
    stages: [0, 1, 2].map(i => ({ k: 'spot', ic: '🎉', xz: at(i), onStart: i === 0 ? (mv => { mv.pts = pickPlaces(3, 30) }) : null, act: L('Hand out flyers', 'Repartir flyers'), obj: () => tr('Hand out flyers at ', 'Reparte flyers en ') + nm(M.st().a[w + '_flyers'] && M.st().a[w + '_flyers'].mv, i) + ' (' + (i + 1) + '/3)', say: L('A dozen people promise to come. Two actually will. Probably more.', 'Una docena de personas promete venir. Dos vendrán. Probablemente más.') })),
    reward: { money: () => Math.round(110 * perk(w)), rep: 2 }, onDone: () => { LW.st().party = AV.S.day } });
  M.def(w + '_food', { w, cat: 'delivery', giver: G, repeat: true, title: L('Hot food rush', 'Comida caliente a domicilio'), blurb: L('Collect an order and deliver it hot. Fast deliveries get big tips.', 'Recoge un pedido y entrégalo caliente. Las entregas rápidas tienen buenas propinas.'),
    stages: [ { k: 'spot', ic: '🥡', xz: at(0), onStart: mv => { mv.pts = pickPlaces(2, 50) }, act: L('Collect the order', 'Recoger el pedido'), obj: () => tr('Collect the order at ', 'Recoge el pedido en ') + nm(M.st().a[w + '_food'] && M.st().a[w + '_food'].mv, 0), say: L('Steaming bag, a little heavy, smells amazing.', 'Bolsa humeante, algo pesada, huele de maravilla.') },
      { k: 'spot', ic: '🏠', xz: at(1), time: 180, onStart: mv => { mv.t0 = AV.now() }, act: L('Deliver the food', 'Entregar la comida'), obj: () => tr('Deliver it hot to ', 'Entrégala caliente en ') + nm(M.st().a[w + '_food'] && M.st().a[w + '_food'].mv, 1) + tr(' (3 min)', ' (3 min)'), say: L('“Still hot! You are a legend.”', '“¡Aún caliente! Eres una leyenda.”') } ],
    reward: { money: mv => Math.round((90 + Math.max(0, 180 - (AV.now() - ((mv && mv.t0) || AV.now()))) * .6) * perk(w)), rep: 1 } });
  M.def(w + '_busk', { w, cat: 'music', giver: G, repeat: true, title: L('Street gig', 'Concierto callejero'), blurb: L('Play a set at a busy spot. Stay with your crowd and the hat fills up.', 'Toca en un sitio concurrido. Quédate con tu público y el sombrero se llena.'),
    stages: [ { k: 'spot', ic: '🎸', xz: at(0), onStart: mv => { mv.pts = pickPlaces(1); mv.tip = 60 + Math.round(Math.random() * 160) }, act: L('Start playing', 'Empezar a tocar'), obj: () => tr('Find your spot: ', 'Busca tu sitio: ') + nm(M.st().a[w + '_busk'] && M.st().a[w + '_busk'].mv, 0), say: L('You open the case and start the first song. Heads turn.', 'Abres el estuche y empiezas la primera canción. La gente se gira.') },
      { k: 'test', xz: at(0), onStart: mv => { mv.play = 0 }, obj: () => { const a = M.st().a[w + '_busk']; return tr('Keep playing, stay with your crowd: ', 'Sigue tocando, quédate con tu público: ') + Math.min(20, Math.round((a && a.mv.play) || 0)) + '/20 s' },
        fn: (S, mv) => { const p = mv.pts[0]; if (Math.hypot(AV.P.x - p[0], AV.P.z - p[1]) < 7) mv.play = (mv.play || 0) + .25; return mv.play >= 20 } } ],
    reward: { money: mv => Math.round(((mv && mv.tip) || 120) * perk(w)), rep: 2 }, onDone: (S, mv) => AV.toast('🎩 ' + tr('The hat is full: ', 'El sombrero está lleno: ') + Math.round((mv.tip || 120) * perk(w)) + ' ¢') });
  M.def(w + '_hero', { w, cat: 'story', giver: G, title: L('Local hero', 'Héroe local'), blurb: L('Finish 6 missions in this world. Locals will remember you, and jobs here will pay 20% more for good.', 'Completa 6 misiones en este mundo. La gente te recordará y aquí los trabajos pagarán un 20% más para siempre.'),
    stages: [ { k: 'test', obj: () => tr('Finish missions here: ', 'Completa misiones aquí: ') + Math.min(6, doneIn(w)) + '/6', fn: () => doneIn(w) >= 6 } ],
    reward: { money: 600, rep: 10 }, onDone: () => { const s = LW.st(); s.perks = s.perks || {}; s.perks[w] = 'hero'; AV.toast('⭐ ' + tr('Local hero! Jobs here now pay 20% more.', '¡Héroe local! Aquí los trabajos pagan un 20% más.')) } }) }
const doneIn = w => { const d = M.st().d; let n = 0; for (const id in d) if (M.defs[id] && M.defs[id].w === w && id !== w + '_hero') n += d[id]; return n };
LW.doneIn = doneIn;
const WORLDS = ['ape_town', 'chiang_mai'].concat(Object.keys(LW.worlds2 || {}));
for (const w of WORLDS) jobs(w);
LW.BOARDS = BOARDS;
/* the board sits by the arrival point; coordinates are set before the engine's board-trigger hook runs */
{ const pe = AV.onWorldEnter; AV.onWorldEnter = function (W) { const G = W && BOARDS[W.id]; if (G) { try { const ar = W.arrivals[W.defaultArrival] || W.arrivals.default || Object.values(W.arrivals)[0], sp = AV.safeSpot(W, ar.x + 4, ar.z + 3); G.x = sp[0]; G.z = sp[1] } catch (e) { G.x = G.z = null } }
  if (pe) pe(W);
  if (G && G.x != null && W.ctx && !W.__lwBoard) { W.__lwBoard = 1; try { const y = W.surface(G.x, G.z) || 0, g = new THREE.Group(); g.position.set(G.x, y, G.z); const wood = AV.std(0x7a4a2a, .8);
    const p1 = new THREE.Mesh(AV.G.box, wood); p1.scale.set(.12, 2.2, .12); p1.position.set(-.9, 1.1, 0); g.add(p1); const p2 = new THREE.Mesh(AV.G.box, wood); p2.scale.set(.12, 2.2, .12); p2.position.set(.9, 1.1, 0); g.add(p2);
    const c = document.createElement('canvas'); c.width = 256; c.height = 160; const x = c.getContext('2d'); x.fillStyle = '#2a1a3a'; x.fillRect(0, 0, 256, 160); x.fillStyle = '#ffd23a'; x.font = 'bold 34px Georgia'; x.textAlign = 'center'; x.fillText(tr('JOBS', 'TRABAJOS'), 128, 50); x.font = '20px Georgia'; x.fillStyle = '#fff'; ['🚕 🎉 📦 🎸 ⭐', tr('cash today', 'dinero hoy'), tr('press E', 'pulsa E')].forEach((s, i) => x.fillText(s, 128, 88 + i * 26));
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; const bd = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.2), new THREE.MeshStandardMaterial({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .35, side: THREE.DoubleSide })); bd.position.set(0, 1.6, .07); g.add(bd); W.ctx.group.add(g) } catch (e) { console.warn('board', e) } } } }
/* daily hustle streak */
let seen = null; AV.frameFns.push(() => { if (!AV.running) return; const n = M.stats.done; if (seen === null) { seen = n; return } if (n === seen) return; const k = n - seen; seen = n; const s = LW.st(); if (!s.day || s.day.d !== AV.S.day) s.day = { d: AV.S.day, n: 0 };
  for (let i = 0; i < k; i++) { s.day.n++; if (s.day.n % 3 === 0) { AV.txn(150, 'Daily hustle streak'); AV.toast('🔥 ' + tr('Hustle streak! ', '¡Racha! ') + s.day.n + tr(' missions today: +150', ' misiones hoy: +150')) } } AV.save() });
})(window.AV);
