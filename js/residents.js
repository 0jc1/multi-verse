/* APEVERSE 2.0 - residents.js : M11. Living NPCs, first slice: ten named Madrid residents with lives.
   - Identity: id, name, age, occupation, personality, a fixed look (named people never wear random prints).
   - Places: a home door on a residential block, a workplace at a real Madrid venue (bakery, Bar La Esquina, fruit shop, the car
     dealer, Sol, Sala Malasaña, the park...), favourite spots. Resolved from the live world (W.places / interactions).
   - Daily schedule by game hour; a dinner invitation overrides it. Near you (95 m) they are real people walking Madrid's
     pedestrian network (sidewalk corners + zebra crossings, A*), working facing the street, chatting when two meet;
     far away they are simulated (already where the schedule says). At home they go in and disappear.
   - Relationship memory per resident: met, friendship 0-100 (one chat a day counts), what you talked about, what they
     noticed about you (your outfit brand, your shop + its sales, your flat, your car), favours, invitations. Saved.
   - Talk: context greeting (time of day, how well they know you, last time), current activity, a remark about something new
     they noticed; Ask (job / the barrio / a tip that pins a place on your map); Favour (deliver something to another
     resident: credits + friendship + barrio reputation); Invite (friends invite you to tapas at 21:00: be there);
     Hire (Dani, Inés: they work in YOUR shop); Recruit (Kofi joins your future band, for M10).
   - Community reputation: barrio, business, music (AV.S.rep).  People panel (Z): who you know, where they are now, locate.
   AV.people = { list, R, talk(), panel(), stats } */
'use strict';
(function (AV) {
const tr = AV.tr, TAU = Math.PI * 2, L = (e, s) => [e, s], say = a => tr(a[0], a[1]);
const PE = AV.people = { list: [], stats: { built: 0, walking: 0 } };
const W8 = 'madrid';
/* schedules: [fromHour, toHour, place, verb] - places: home, work + named venues */
const R = PE.R = {
  carmen: { n: 'Carmen', age: 58, job: L('baker', 'panadera'), pers: 'warm', look: { sp: 'human_b', height: 1.58, skin: 0xe0ac69, hair: 0x9a9a9a, style: 'bun', shirt: { col: 0xf4f0e8 }, pants: { col: 0x3a3a52 } }, work: 'bakery', home: 'pinar',
    day: [[6, 14, 'work', 'baking'], [14, 16, 'bar', 'lunch'], [16, 19, 'parque', 'stroll'], [19, 22, 'pinar', 'chat'], [22, 6, 'home', 'sleep']], favour: { to: 'javi', item: L('a bag of warm torrijas', 'una bolsa de torrijas calientes'), pay: 40 } },
  javi: { n: 'Javi', age: 34, job: L('bartender', 'camarero'), pers: 'joker', look: { sp: 'human_a', height: 1.78, skin: 0xd8a47a, hair: 0x14100c, style: 'short', beard: true, shirt: { col: 0x1d1d21 }, pants: { col: 0x2a2a2e } }, work: 'bar', home: 'pinar',
    day: [[12, 16, 'work', 'bar'], [16, 18, 'home', 'nap'], [18, 24, 'work', 'bar'], [0, 12, 'home', 'sleep']], favour: { to: 'rosa', item: L('a crate of empty bottles to return', 'una caja de botellas vacías'), pay: 35 } },
  rosa: { n: 'Rosa', age: 45, job: L('fruit seller', 'frutera'), pers: 'practical', look: { sp: 'human_b', height: 1.62, skin: 0xc68642, hair: 0x2a1a10, style: 'long', shirt: { col: 0x3a8a5a }, pants: { col: 0x3a3a52 } }, work: 'fruit', home: 'pinar',
    day: [[8, 14, 'work', 'fruit'], [14, 17, 'home', 'siesta'], [17, 20, 'work', 'fruit'], [20, 23, 'parque', 'stroll'], [23, 8, 'home', 'sleep']], favour: { to: 'marta', item: L('the ripest cherries for Marta', 'las cerezas más maduras para Marta'), pay: 30 } },
  marta: { n: 'Marta', age: 71, job: L('retired teacher', 'maestra jubilada'), pers: 'wise', look: { sp: 'human_b', height: 1.56, skin: 0xf0c8a8, hair: 0xd8d8d8, style: 'short', glasses: true, shirt: { col: 0x8a4a6a }, pants: { col: 0x2a2a3a } }, work: 'parque', home: 'pinar',
    day: [[9, 11, 'parque', 'walk'], [11, 13, 'fruit', 'shopping'], [13, 17, 'home', 'reading'], [17, 20, 'parque', 'bench'], [20, 9, 'home', 'sleep']] },
  pablo: { n: 'Pablo', age: 41, job: L('mechanic', 'mecánico'), pers: 'gruff', look: { sp: 'human_a', height: 1.74, skin: 0xd8a47a, hair: 0x2a1a10, style: 'cap', shirt: { col: 0x2a4a8a }, pants: { col: 0x2a2a3a } }, work: 'dealer', home: 'pinar',
    day: [[9, 14, 'work', 'garage'], [14, 16, 'bar', 'lunch'], [16, 20, 'work', 'garage'], [20, 23, 'bar', 'beer'], [23, 9, 'home', 'sleep']], favour: { to: 'carmen', item: L('a spare key for the bakery van', 'una llave de repuesto de la furgoneta'), pay: 45 } },
  kofi: { n: 'Kofi', age: 29, job: L('guitarist (busker)', 'guitarrista callejero'), pers: 'dreamy', musician: 'guitar', look: { sp: 'human_a', height: 1.82, skin: 0x5c3a21, hair: 0x14100c, style: 'afro', shirt: { col: 0xe8a23a }, pants: { col: 0x3a5a3a } }, work: 'sol', home: 'malasana',
    day: [[12, 16, 'home', 'practice'], [17, 21, 'sol', 'busking'], [22, 26, 'sala', 'gig'], [2, 12, 'home', 'sleep']] },
  dani: { n: 'Dani', age: 21, job: L('student + skater', 'estudiante y skater'), pers: 'restless', hireable: true, look: { sp: 'human_a', height: 1.76, skin: 0xe0ac69, hair: 0x7a5230, style: 'messy', shirt: { col: 0x2a2a2e }, pants: { col: 0x3a5a8a, kind: 'denim' } }, work: 'granvia', home: 'malasana',
    day: [[10, 14, 'granvia', 'classes'], [15, 19, 'malasana', 'skating'], [19, 23, 'sala', 'hanging out'], [23, 10, 'home', 'sleep']] },
  ines: { n: 'Inés', age: 27, job: L('graphic designer', 'diseñadora gráfica'), pers: 'curious', hireable: true, musician: 'vocals', look: { sp: 'human_b', height: 1.66, skin: 0xf0c8a8, hair: 0x8a2a1a, style: 'bun', glasses: true, shirt: { col: 0xd8663a }, pants: { col: 0x2a2a2e } }, work: 'malasana', home: 'malasana',
    day: [[10, 13, 'malasana', 'sketching'], [13, 18, 'home', 'client work'], [18, 21, 'sol', 'shopping'], [21, 24, 'sala', 'friends'], [0, 10, 'home', 'sleep']] },
  yuki: { n: 'Yuki', age: 26, job: L('travelling photographer', 'fotógrafa viajera'), pers: 'cheerful', look: { sp: 'human_b', height: 1.6, skin: 0xf0c8a8, hair: 0x14100c, style: 'long', shirt: { col: 0xe8e4da }, pants: { col: 0x8a6a4a } }, work: 'sol', home: 'sol',
    day: [[10, 13, 'sol', 'photos'], [13, 15, 'granvia', 'photos'], [15, 18, 'cine', 'film'], [18, 22, 'malasana', 'photos'], [22, 10, 'home', 'hostel']] },
  nacho: { n: 'Nacho', age: 24, job: L('delivery rider', 'repartidor'), pers: 'hurried', musician: 'drums', look: { sp: 'human_a', height: 1.72, skin: 0xc68642, hair: 0x2a1a10, style: 'cap', shirt: { col: 0xd8202a }, pants: { col: 0x2a2a2e } }, work: 'bakery', home: 'pinar',
    day: [[10, 12, 'bakery', 'pick-up'], [12, 14, 'bar', 'delivery'], [14, 16, 'fruit', 'delivery'], [16, 18, 'home', 'break'], [18, 20, 'bakery', 'pick-up'], [20, 22, 'dealer', 'delivery'], [22, 10, 'home', 'sleep']] } };
const IDS = Object.keys(R);
const ACT_LINES = { baking: L('Since six this morning: the barrio wants its bread.', 'Desde las seis: el barrio quiere su pan.'), bar: L('Caña? Tapas come free with it, this is Madrid.', '¿Una caña? La tapa va incluida, esto es Madrid.'), fruit: L('Cherries from the Jerte valley today, sweet as anything.', 'Hoy cerezas del Jerte, dulcísimas.'),
  garage: L('Brakes, oil, a scooter that will not start... the usual.', 'Frenos, aceite, una moto que no arranca... lo de siempre.'), busking: L('Sol pays in coins and smiles. Mostly smiles.', 'Sol paga en monedas y sonrisas. Sobre todo sonrisas.'), gig: L('Tonight at Sala Malasaña. You coming?', 'Esta noche en Sala Malasaña. ¿Vienes?'),
  classes: L('Classes, classes. Skating later, that is the real lesson.', 'Clases y más clases. Luego a patinar, que es lo importante.'), skating: L('Watch this kickflip. ...OK, watch the next one.', 'Mira este kickflip. ...Vale, mira el siguiente.'), sketching: L('Drawing the balconies. Every one in Malasaña is different.', 'Dibujo balcones. En Malasaña no hay dos iguales.'),
  photos: L('The light here at golden hour, unreal.', 'La luz de aquí a la hora dorada es irreal.'), lunch: L('Lunch break. Menú del día, three courses, no regrets.', 'Hora de comer. Menú del día, tres platos, sin remordimientos.'), stroll: L('Just walking. The barrio is my gym.', 'Solo paseo. El barrio es mi gimnasio.'), walk: L('Twenty laps round the park, doctor\'s orders.', 'Veinte vueltas al parque, órdenes del médico.'),
  bench: L('This bench and I go back decades.', 'Este banco y yo nos conocemos desde hace décadas.'), shopping: L('Shopping. Do not tell my family how much I spent.', 'De compras. No le digas a mi familia cuánto he gastado.'), beer: L('One beer. Maybe two. The day was long.', 'Una cerveza. Quizá dos. El día fue largo.'),
  chat: L('Catching up with the neighbours: who moved, who married, who argued.', 'Poniéndome al día: quién se mudó, quién se casó, quién discutió.'), delivery: L('Three deliveries, one scooter, zero time.', 'Tres repartos, una moto, cero tiempo.'), 'pick-up': L('Picking up the next round.', 'Recogiendo el siguiente encargo.'), 'hanging out': L('Just hanging with the crew.', 'Aquí con la peña.'), friends: L('Meeting friends later.', 'Luego he quedado.'), film: L('There is a film at Cine Gran Vía I have wanted to see for ages.', 'Hay una peli en el Cine Gran Vía que quería ver hace siglos.'),
  work_shop: L('Working at your shop! The customers like the new designs.', '¡Trabajando en tu tienda! A los clientes les gustan los diseños.'), dinner: L('Here for our tapas! Sit, sit.', '¡Aquí para nuestras tapas! Siéntate.') };
const TIPS = [['malasana', L('Malasaña at night is where the real Madrid comes out.', 'Malasaña de noche es donde sale el Madrid de verdad.')], ['sala', L('Sala Malasaña has live music most nights. Kofi plays there.', 'En Sala Malasaña hay música en directo casi todas las noches. Kofi toca allí.')], ['cine', L('Cine Gran Vía still has the old painted posters. Go see.', 'El Cine Gran Vía aún tiene los carteles pintados a mano. Ve a verlos.')], ['parque', L('Parque de Pinar is peaceful in the evening.', 'El Parque de Pinar es tranquilo por la tarde.')], ['sol', L('Kilómetro 0 at Puerta del Sol: every road in Spain starts there.', 'El Kilómetro 0 en Sol: ahí empiezan todas las carreteras de España.')]];

/* ---------- state ---------- */
const st = () => { const S = AV.S; S.npcs = S.npcs || {}; S.rep = S.rep || { barrio: 0, business: 0, music: 0 }; S.band = S.band || { members: [] }; return S };
const mem = id => { const S = st(); return S.npcs[id] = S.npcs[id] || { met: 0, f: 0, last: -1, chats: 0, topics: [], seen: {}, favour: null } };
PE.mem = mem; const tier = f => f >= 60 ? 3 : f >= 30 ? 2 : f >= 10 ? 1 : 0;
const rep = (k, n) => { const S = st(); S.rep[k] = Math.max(-50, Math.min(100, (S.rep[k] || 0) + n)) };

/* ---------- places from the live world ---------- */
function resolvePlaces(W) { const P = {}, pl = id => (W.places || []).find(p => p.id === id), tl = re => W.T.find(t => re.test(typeof t.label === 'function' ? t.label() : String(t.label)));
  const spot = (x, z) => { const s = AV.safeSpot(W, x, z); return { x: s[0], z: s[1] } };
  for (const id of ['pinar', 'esquina', 'parque', 'sol', 'granvia', 'cine', 'malasana', 'sala']) { const p = pl(id); if (p) P[id] = spot(p.x, p.z) }
  P.bar = P.esquina; const bk = tl(/Panader/i), fr = tl(/Fruter/i); if (bk) P.bakery = spot(bk.x, bk.z); if (fr) P.fruit = spot(fr.x, fr.z);
  const dl = AV.garage && AV.garage.dealers && AV.garage.dealers[W8]; if (dl && dl.ok) P.dealer = spot(dl.counter[0], dl.counter[1] + 1);
  /* homes: a building door near each barrio anchor (a facade point with free pavement in front) */
  const used = [], homeNear = (a, seed) => { if (!a) return null; let best = null, bd = 1e9; for (const c of W.cols) { if ((c[1] - c[0]) * (c[3] - c[2]) < 60) continue; const cx = (c[0] + c[1]) / 2, cz = (c[2] + c[3]) / 2, d0 = Math.hypot(cx - a.x, cz - a.z); if (d0 > 90) continue;
      for (const [fx, fz, nx, nz] of [[cx, c[3], 0, 1], [cx, c[2], 0, -1], [c[1], cz, 1, 0], [c[0], cz, -1, 0]]) { const ox = fx + nx * .8, oz = fz + nz * .8; if (W.surface(ox, oz) === null || !AV.isFree(W, ox, oz, .4) || W.T.some(t => Math.hypot(t.x - ox, t.z - oz) < 6) || used.some(u => Math.hypot(u.x - ox, u.z - oz) < 5)) continue; const d = Math.abs(Math.hypot(ox - a.x, oz - a.z) - (20 + (seed % 5) * 9)); if (d < bd) { bd = d; best = { x: ox, z: oz } } } } return best };
  IDS.forEach((id, i) => { const hm = homeNear(P[R[id].home], i * 7 + 3); if (hm) used.push(hm); P['home_' + id] = hm || P[R[id].home] }); return P }
const placeOf = (id, key) => { const P = PE.places || {}; if (key === 'stage') return AV.gigs && AV.gigs.spot(id); if (key === 'home') return P['home_' + id]; if (key === 'work') { const m = mem(id); if (m.hired && AV.biz && AV.biz.live) { const S = AV.biz.live.S; return { x: S.counter[0], z: S.counter[1] + .9, shop: true } } return P[R[id].work] } if (key === 'myshop' && AV.biz && AV.biz.live) { const S = AV.biz.live.S; return { x: S.inside[0], z: S.inside[1] } } return P[key] };

/* ---------- schedule ---------- */
const inH = (h, a, b) => a < b ? h >= a && h < b : h >= a || h < b % 24;
PE.slot = function (id, h) { const gg = AV.gigs && AV.gigs.call && AV.gigs.call(id, h); if (gg) return gg;   /* M10: band rehearsal / gig */
  const m = mem(id), inv = m.invite; if (inv && !inv.done && inv.day === AV.S.day && h >= inv.h - 1 && h < inv.h + 2) return { key: inv.place, verb: 'dinner' };
  if (m.hired && AV.biz) { const hr = AV.biz.rec(m.hired); if (!hr || !hr.staff.some(q => q.resident === id)) m.hired = 0 }   /* fired from the shop panel */
  if (m.hired && AV.biz && AV.biz.live && AV.biz.live.id === m.hired) { const r = AV.biz.rec(AV.biz.live.id); if (r && r.open && h >= 10 && h < r.close && inH(h, 10, 20)) return { key: 'work', verb: 'work_shop' } }
  for (const [a, b, key, verb] of R[id].day) if (inH(h, a, b > 24 ? b - 24 : b)) return { key, verb }; return { key: 'home', verb: 'sleep' } };

/* ---------- walking: a local grid A* (1.5 m cells, walkability checked lazily with the real collision) for the barrio
   streets the city graph does not cover, + the pedestrian network (sidewalk corners + zebra crossings) for long trips ---------- */
const CELL = 1.5;
const onRoad = (W, x, z) => (W.mapRoads || []).some(([x0, z0, x1, z1, w]) => { const dx = x1 - x0, dz = z1 - z0, L2 = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((x - x0) * dx + (z - z0) * dz) / L2)); return Math.hypot(x - x0 - dx * t, z - z0 - dz * t) < (w || 6) / 2 });
/* 0 blocked, 1 pavement, 2 carriageway (walkable but costly: people keep to the sidewalks and cross streets short) */
function cellCost(W, x, z) { const c = W.__walkC || (W.__walkC = new Map()), k = Math.round(x / CELL) + ',' + Math.round(z / CELL); let v = c.get(k); if (v === undefined) { v = W.surface(x, z) !== null && AV.isFree(W, x, z, .35) ? (onRoad(W, x, z) ? 2 : 1) : 0; c.set(k, v) } return v }
const walkable = (W, x, z) => cellCost(W, x, z) > 0;
function los(W, a, b, strict) { const d = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.ceil(d / .6); let road = 0; for (let i = 1; i < n; i++) { const t = i / n, v = cellCost(W, a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t); if (!v) return false; if (v === 2) road++ } return !strict || road * .6 < 16 }
function gridPath(W, a, b, cap) { const sx = Math.round(a[0] / CELL), sz = Math.round(a[1] / CELL), tx = Math.round(b[0] / CELL), tz = Math.round(b[1] / CELL), K = (x, z) => x + ',' + z;
  const g = new Map([[K(sx, sz), 0]]), prev = new Map(), heap = [[Math.hypot(tx - sx, tz - sz), sx, sz]], done = new Set(); let n = 0, found = false;
  const push = e => { heap.push(e); let i = heap.length - 1; while (i) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m } } return top };
  while (heap.length && n < (cap || 9000)) { const [, x, z] = pop(), k = K(x, z); if (done.has(k)) continue; done.add(k); n++; if (Math.abs(x - tx) <= 1 && Math.abs(z - tz) <= 1) { found = k; break }
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) { if (!dx && !dz) continue; const nx = x + dx, nz = z + dz, nk = K(nx, nz); if (done.has(nk) || !walkable(W, nx * CELL, nz * CELL)) continue; if (dx && dz && (!walkable(W, (x + dx) * CELL, z * CELL) || !walkable(W, x * CELL, (z + dz) * CELL))) continue;
      const nd = g.get(k) + (dx && dz ? 1.414 : 1) * (cellCost(W, nx * CELL, nz * CELL) === 2 ? 4 : 1); if (nd < (g.has(nk) ? g.get(nk) : 1e18)) { g.set(nk, nd); prev.set(nk, k); push([nd + Math.hypot(tx - nx, tz - nz) * 1.05, nx, nz]) } } }
  PE.stats.gridN = n; if (!found) return null; const out = []; for (let k = found; k; k = prev.get(k)) { const [x, z] = k.split(',').map(Number); out.unshift([x * CELL, z * CELL]) } out.push([b[0], b[1]]); return out }
function smooth(W, path) { const out = [path[0]]; let i = 0; while (i < path.length - 1) { let j = Math.min(path.length - 1, i + 14); while (j > i + 1 && !los(W, path[i], path[j], true)) j--; out.push(path[j]); i = j } return out }
function route(W, a, b) { const A = [a.x, a.z], B = [b.x, b.z], d = Math.hypot(B[0] - A[0], B[1] - A[1]), N = W.mapNav; PE.stats.routes = (PE.stats.routes || 0) + 1;
  if (d < 1.5 || los(W, A, B, true)) return [B];
  if (d < 220 || !N || !N.nodes || !N.nodes.length) { const p = gridPath(W, A, B, 12000); return p ? smooth(W, p) : (PE.stats.noPath = (PE.stats.noPath || 0) + 1, [B]) }
  const near = (x, z) => { let bi = 0, bd = 1e18; for (let i = 0; i < N.nodes.length; i++) { const n = N.nodes[i], q = (n[0] - x) ** 2 + (n[1] - z) ** 2; if (q < bd) { bd = q; bi = i } } return bi };
  const s = near(A[0], A[1]), t = near(B[0], B[1]), n = N.nodes.length, g = new Float64Array(n).fill(1e18), prev = new Int32Array(n).fill(-1), done = new Uint8Array(n), open = [[0, s]]; g[s] = 0;
  const h = i => Math.hypot(N.nodes[i][0] - N.nodes[t][0], N.nodes[i][1] - N.nodes[t][1]);
  while (open.length) { let bi = 0; for (let i = 1; i < open.length; i++) if (open[i][0] < open[bi][0]) bi = i; const u = open.splice(bi, 1)[0][1]; if (done[u]) continue; done[u] = 1; if (u === t) break;
    for (const v of N.links[u]) { const nd = g[u] + Math.hypot(N.nodes[u][0] - N.nodes[v][0], N.nodes[u][1] - N.nodes[v][1]); if (nd < g[v]) { g[v] = nd; prev[v] = u; open.push([nd + h(v), v]) } } }
  const mid = []; if (done[t]) for (let u = t; u >= 0; u = prev[u]) mid.unshift([N.nodes[u][0], N.nodes[u][1]]); if (!mid.length) return [B];
  const head = gridPath(W, A, mid[0], 6000) || [mid[0]], tail = gridPath(W, mid[mid.length - 1], B, 6000) || [B]; return smooth(W, head).concat(mid.slice(1), smooth(W, tail).slice(1)) }
PE.route = route;

/* ---------- the people ---------- */
function mk(W, id) { const r = R[id], p = { id, r, x: 0, z: 0, yaw: 0, slot: null, target: null, path: null, pi: 0, actor: null, h: null, home: false, T: null };
  p.T = { x: 0, z: 0, r: 1.8, show: () => !!p.h && p.h.visible, label: () => { const m = mem(id); return '💬 ' + (m.met ? r.n : tr('Someone', 'Alguien')) + ' · ' + say(r.job) + (m.met ? ' · ' + '♥'.repeat(tier(m.f)) : '') }, fn: () => PE.talk(id) }; W.T.push(p.T); return p }
function ensureActor(W, p) { if (p.actor) return; try { const A = AV.chars.softActor('human', 7000 + IDS.indexOf(p.id) * 13, { lod: true, shells: 0, shadow: false, look: p.r.look, name: p.r.n }); const h = new THREE.Group(); h.add(A.root); W.ctx.group.add(h); p.actor = A.actor; p.h = h; PE.stats.built++ } catch (e) { console.warn('resident', p.id, e) } }
function dropActor(p) { if (p.h) { p.h.parent && p.h.parent.remove(p.h); p.h.traverse(o => { if (o.isSkinnedMesh && o.skeleton) o.skeleton.dispose() }) } p.actor = null; p.h = null }
let tk = 0;
function tick(dt) { const W = AV.W; if (!W || W.id !== W8 || !PE.list.length) return; const P = AV.P, h = Math.floor(AV.S.time / 60) % 24; tk -= dt; const plan = tk <= 0; if (plan) tk = .5; PE.stats.walking = 0; if (PE.talking && Math.hypot(PE.talking.x - P.x, PE.talking.z - P.z) > 6) PE.talking = null;
  for (const p of PE.list) { if (plan) { const sl = PE.slot(p.id, h), key = sl.key + ':' + sl.verb; if (!p.slot || p.slot.k !== key) { p.slot = { k: key, key: sl.key, verb: sl.verb }; const tgt = placeOf(p.id, sl.key); const jit = sl.key === 'home' || tgt && tgt.stage ? 0 : 1.3; p.target = tgt ? { x: tgt.x + Math.sin(IDS.indexOf(p.id) * 2.4) * jit, z: tgt.z + Math.cos(IDS.indexOf(p.id) * 2.4) * jit, stage: tgt.stage } : null; p.path = null } }
    if (!p.target) continue; const far = Math.hypot(p.x - P.x, p.z - P.z) > 140 && Math.hypot(p.target.x - P.x, p.target.z - P.z) > 140;
    if (far || !p.placed) { p.x = p.target.x; p.z = p.target.z; p.path = null; p.placed = true }   /* simulated: already there */
    else if (PE.talking === p && (($c => $c && $c.style.display !== 'none')(document.getElementById('cmp')) || performance.now() - PE.talkT < 6000)) { p.walking = false }   /* stops to talk with you */
    else if (Math.hypot(p.target.x - p.x, p.target.z - p.z) > .4) { if (!p.path) { p.path = route(W, p, p.target); p.pi = 0 } const q = p.path[p.pi], dx = q[0] - p.x, dz = q[1] - p.z, d = Math.hypot(dx, dz);
      if (d < .3) p.pi = Math.min(p.path.length - 1, p.pi + 1); else { const s = Math.min(d, 1.3 * dt); p.x += dx / d * s; p.z += dz / d * s; p.yaw = Math.atan2(dx, dz) } p.walking = true; PE.stats.walking++ } else { p.walking = false; p.path = null }
    p.home = p.slot && p.slot.key === 'home' && !p.walking; p.vis = !p.home;
    const dP = Math.hypot(p.x - P.x, p.z - P.z), want = dP < 95 && !p.home; if (want) ensureActor(W, p); else if (p.actor && dP > 120 || p.home) dropActor(p);
    p.T.x = p.x; p.T.z = p.z; if (!p.h) continue; p.h.visible = true; p.h.position.set(p.x, W.surface(p.x, p.z) || 0, p.z);
    if (!p.walking) { const other = PE.list.find(o => o !== p && o.h && !o.walking && Math.hypot(o.x - p.x, o.z - p.z) < 3.2); const face = PE.talking === p ? [P.x, P.z] : other ? [other.x, other.z] : null;
      p.yaw = face ? Math.atan2(face[0] - p.x, face[1] - p.z) : (p.slot.key === 'work' || p.slot.verb === 'busking' ? p.yaw : p.yaw); p.chatting = !!other }
    p.onStage = !!(p.target && p.target.stage && !p.walking && Math.hypot(p.x - p.target.x, p.z - p.target.z) < .8); if (p.onStage) { const sg = p.target.stage; p.h.position.set(sg.x, sg.y, sg.z); p.yaw = sg.yaw }   /* M10: up on the platform */
    p.h.rotation.y = p.yaw; if (p.actor) { p.actor.play && p.actor.play(p.walking ? 'Walk' : p.onStage && AV.act && AV.act.cur && AV.act.cur.v && AV.act.cur.v.p && AV.act.cur.v.p.gig ? 'Dance' : 'Idle'); if (p.actor.acts && p.actor.acts.Walk) p.actor.acts.Walk.timeScale = 1; p.actor.mixer && p.actor.mixer.update(dt) } }
  /* invitations: be there */ for (const p of PE.list) { const m = mem(p.id), inv = m.invite; if (!inv || inv.done || inv.day !== AV.S.day) continue; const pl = placeOf(p.id, inv.place); if (pl && h >= inv.h && h < inv.h + 2 && Math.hypot(P.x - pl.x, P.z - pl.z) < 7 && Math.hypot(p.x - pl.x, p.z - pl.z) < 7) { inv.done = true; m.f = Math.min(100, m.f + 15); rep('barrio', 4); AV.save(); AV.toast('🍷 ' + tr('Tapas with ' + p.r.n + ' — friendship up!', 'Tapas con ' + p.r.n + ': ¡más amistad!')); PE.stats.dinners = (PE.stats.dinners || 0) + 1 } } }

/* ---------- conversation ---------- */
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
function noticed(id) { const S = AV.S, m = mem(id), out = []; const fresh = (k, v) => { if (m.seen[k] === v) return false; m.seen[k] = v; return true };
  const w = AV.merch && AV.merch.wear && AV.merch.wear(); if (w) { const d = AV.merch.design(w.design); if (d && fresh('wear', w.design)) out.push(tr('Nice ' + d.brand + ' ' + (w.garment === 'tee' ? 'tee' : 'hoodie') + '! ' + d.name[0] + ', right?', '¡Qué buena ' + (w.garment === 'tee' ? 'camiseta' : 'sudadera') + ' de ' + d.brand + '! ' + d.name[1] + ', ¿no?')) }
  if (AV.biz) for (const bid in (S.biz || {})) { const b = S.biz[bid]; if (b && AV.biz.active(bid) && fresh('shop', b.name + ':' + Math.floor(b.sold / 10))) out.push(b.sold ? tr('Everyone talks about ' + b.name + '. ' + b.sold + ' pieces sold, they say!', 'Todo el mundo habla de ' + b.name + '. ¡Dicen que lleváis ' + b.sold + ' prendas vendidas!') : tr('So you opened ' + b.name + '? Brave! Good luck.', '¿Así que has abierto ' + b.name + '? ¡Valiente! Suerte.')) }
  if (AV.home && AV.home.active && AV.home.active('md_pinar_2b') && fresh('flat', 1)) out.push(tr('Neighbour! You live in 2B now, no?', '¡Vecino! Ahora vives en el 2B, ¿no?'));
  const car = (S.veh && S.veh.list || []).find(r => r.owned && r.kind === 'car'); if (car && fresh('car', car.col)) out.push(tr('I saw your car parked earlier. Nice colour.', 'Vi tu coche aparcado antes. Bonito color.'));
  return out }
PE.lines = function (id) { const p = PE.list.find(q => q.id === id), r = R[id], m = mem(id), h = Math.floor(AV.S.time / 60) % 24, t = tier(m.f), hi = h < 13 ? tr('Buenos días', 'Buenos días') : h < 20 ? tr('Buenas tardes', 'Buenas tardes') : tr('Buenas noches', 'Buenas noches'), out = [];
  if (!m.met) out.push(hi + '! ' + tr("I'm " + r.n + ', ' + say(r.job) + ' here in the barrio.', 'Soy ' + r.n + ', ' + say(r.job) + ' aquí en el barrio.'));
  else if (m.last === AV.S.day) out.push(tr('You again! ', '¡Otra vez tú! ') + (t >= 2 ? tr('Always a pleasure.', 'Siempre un placer.') : tr('What is it?', '¿Qué pasa?')));
  else out.push(hi + ', ' + tr(['', 'friend', 'my friend', 'my dear friend'][t] || '', ['', 'amigo', 'amigo mío', 'querido amigo'][t] || '') + (t ? '! ' : '! ') + (m.last >= 0 ? tr(AV.S.day - m.last === 1 ? 'Good to see you again since yesterday.' : 'Long time — ' + (AV.S.day - m.last) + ' days!', AV.S.day - m.last === 1 ? 'Qué bien verte otra vez desde ayer.' : '¡Cuánto tiempo, ' + (AV.S.day - m.last) + ' días!') : ''));
  const v = p && p.slot ? p.slot.verb : null; if (v && ACT_LINES[v]) out.push(say(ACT_LINES[v]));
  if (m.met && m.topics.length && m.last !== AV.S.day) out.push(tr('Last time we talked about ' + m.topics[m.topics.length - 1] + '.', 'La última vez hablamos de ' + m.topics[m.topics.length - 1] + '.'));
  return out.concat(noticed(id)) };
PE.talk = function (id) { const p = PE.list.find(q => q.id === id), r = R[id], m = mem(id); if (!r) return; PE.talking = p || null; PE.talkT = performance.now(); const lines = PE.lines(id), first = m.last !== AV.S.day;
  if (!m.met) { m.met = AV.S.day; rep('barrio', 1) } if (first) { m.f = Math.min(100, m.f + 5); m.chats++ } m.last = AV.S.day; AV.save(); PE.stats.talks = (PE.stats.talks || 0) + 1;
  const pend = Object.entries(st().npcs).find(([k, v]) => v.favour && v.favour.to === id && !v.favour.done);
  if (p && p.h) { p.yaw = Math.atan2(AV.P.x - p.x, AV.P.z - p.z); p.h.rotation.y = p.yaw }   /* turn to you */
  if (p && p.actor && p.actor.play) p.actor.play('Wave');
  let h = '<b>💬 ' + esc(r.n) + '</b> · ' + esc(say(r.job)) + ' · ' + r.age + ' · ' + '♥'.repeat(tier(m.f)) + '<span style="opacity:.6">' + '♡'.repeat(3 - tier(m.f)) + '</span> <small>(' + m.f + ')</small><div class="note">' + lines.map(esc).join('<br>') + '</div><div class="row" style="flex-wrap:wrap;gap:6px">' +
    '<button data-q="job">' + tr('Ask about the job', 'Preguntar por su trabajo') + '</button><button data-q="tip">' + tr('Any tips?', '¿Algún consejo?') + '</button>' +
    (pend ? '<button data-q="deliver">📦 ' + tr('Deliver: ', 'Entregar: ') + esc(say(R[pend[0]].favour.item)) + '</button>' : '') +
    (r.favour && !m.favour ? '<button data-q="favour">' + tr('Need a hand?', '¿Te echo una mano?') + '</button>' : '') +
    (m.f >= 35 && !(m.invite && m.invite.day >= AV.S.day) ? '<button data-q="invite">' + tr('Tapas tonight?', '¿Tapas esta noche?') + '</button>' : '') +
    (r.hireable && m.f >= 30 && !m.hired && AV.biz && AV.biz.live ? '<button data-q="hire">' + tr('Work at my shop?', '¿Trabajas en mi tienda?') + '</button>' : '') +
    (r.musician && m.f >= 40 && !st().band.members.includes(id) ? '<button data-q="band">' + tr('Join my band?', '¿Te unes a mi banda?') + '</button>' : '') + '</div><div class="note" id="peA"></div><div class="row"><button data-close>' + tr('Bye', 'Adiós') + '</button></div>';
  const pn = AV.panel('cmp', h), A = x => { document.getElementById('peA').innerHTML = x };
  pn.querySelectorAll('[data-q]').forEach(b => b.onclick = () => { const q = b.dataset.q; b.disabled = true;
    if (q === 'job') { A(esc(say(ACT_LINES[(R[id].day.find(d => d[2] === 'work') || [])[3]] || ACT_LINES.stroll)) + '<br>' + tr('My day: ', 'Mi día: ') + R[id].day.map(d => (d[0] % 24) + '–' + (d[1] % 24) + ' ' + d[3]).join(' · ')); m.topics.push(tr('my work', 'mi trabajo')) }
    else if (q === 'tip') { const [k, line] = TIPS[(IDS.indexOf(id) + m.chats) % TIPS.length], pl = placeOf(id, k); A(esc(say(line)) + (pl ? ' 📍' : '')); if (pl && AV.minimap && AV.minimap.setDest) AV.minimap.setDest(pl.x, pl.z, k); m.topics.push(k); PE.stats.tips = (PE.stats.tips || 0) + 1 }
    else if (q === 'favour') { m.favour = { to: r.favour.to, item: r.favour.item, pay: r.favour.pay, day: AV.S.day }; A(tr('Could you take ', '¿Le llevas ') + esc(say(r.favour.item)) + tr(' to ' + R[r.favour.to].n + '? I will pay you ' + r.favour.pay + '.', ' a ' + R[r.favour.to].n + '? Te pago ' + r.favour.pay + '.')); AV.toast('📦 ' + tr('Favour: find ', 'Favor: busca a ') + R[r.favour.to].n) }
    else if (q === 'deliver') { const [fid, fm] = pend; fm.favour.done = true; AV.txn(fm.favour.pay, tr('Favour for ', 'Favor para ') + R[fid].n); fm.f = Math.min(100, fm.f + 10); m.f = Math.min(100, m.f + 6); rep('barrio', 3); AV.save(); A(tr('From ' + R[fid].n + '? Thank you! Tell them I said hi.', '¿De parte de ' + R[fid].n + '? ¡Gracias! Dale recuerdos.')); PE.stats.favours = (PE.stats.favours || 0) + 1 }
    else if (q === 'invite') { const ok = m.f >= 35; if (ok) { m.invite = { day: AV.S.day, h: 21, place: 'bar' }; A(tr('Tapas! Bar La Esquina at 21:00, see you there.', '¡Tapas! Bar La Esquina a las 21:00, nos vemos allí.')); AV.toast('🍷 ' + r.n + tr(': tapas at 21:00, Bar La Esquina', ': tapas a las 21:00, Bar La Esquina')) } }
    else if (q === 'hire') { const bz = AV.biz, bid = bz.live.id, rr = bz.rec(bid); if (rr && rr.staff.length < 2) { rr.staff.push({ name: r.n, wage: 40, resident: id }); m.hired = bid; rep('business', 3); bz.panel && AV.closePanel('cmp'); AV.save(); AV.toast('🧾 ' + r.n + tr(' now works at ', ' trabaja ahora en ') + rr.name); PE.stats.hired = id } else A(tr('Your shop has no room for more staff.', 'Tu tienda no tiene sitio para más personal.')) }
    else if (q === 'band') { st().band.members.push(id); rep('music', 5); AV.save(); A(tr('A band? With me on guitar? ... Yes!', '¿Una banda? ¿Conmigo a la guitarra? ... ¡Sí!')); AV.toast('🎸 ' + r.n + tr(' joined your band', ' se une a tu banda')) }
    AV.save() }) };
PE.panel = function () { const S = st(), h = Math.floor(AV.S.time / 60) % 24; let x = '<b>👥 ' + tr('People', 'Gente') + '</b> · ' + tr('Barrio ', 'Barrio ') + Math.round(S.rep.barrio) + tr(' · business ', ' · negocios ') + Math.round(S.rep.business) + tr(' · music ', ' · música ') + Math.round(S.rep.music) + '<div class="bgrid">';
  for (const id of IDS) { const m = mem(id), r = R[id], p = PE.list.find(q => q.id === id), sl = PE.slot(id, h); if (!m.met) continue; x += '<div class="bitem"><div class="bic">🧑</div><div class="bnm">' + esc(r.n) + ' · ' + esc(say(r.job)) + ' ' + '♥'.repeat(tier(m.f)) + '<small>' + tr('now: ', 'ahora: ') + esc(sl.verb) + ' @ ' + esc(sl.key === 'work' ? say(r.job) : sl.key) + (m.hired ? tr(' · works for you', ' · trabaja contigo') : '') + (st().band.members.includes(id) ? tr(' · in your band', ' · en tu banda') : '') + '</small></div><div class="bbt">' + (p && AV.W && AV.W.id === W8 && !p.home ? '<button data-loc="' + id + '">📍</button>' : '') + '</div></div>' }
  x += '</div><div class="row"><button data-band>🎸 ' + tr('Band & gigs', 'Banda y conciertos') + '</button></div><div class="note">' + (Object.values(S.npcs).some(m => m.met) ? '' : tr('You have not met anyone yet. Say hello to the people of the barrio!', 'Aún no conoces a nadie. ¡Saluda a la gente del barrio!')) + '</div><div class="row"><button data-close>' + tr('Done', 'Listo') + '</button></div>';
  const pn = AV.panel('cmp', x); const bb = pn.querySelector('[data-band]'); if (bb) bb.onclick = () => AV.gigs && AV.gigs.panel('band'); pn.querySelectorAll('[data-loc]').forEach(b => b.onclick = () => { const p = PE.list.find(q => q.id === b.dataset.loc); if (p && AV.minimap) AV.minimap.setDest(p.x, p.z, R[p.id].n); AV.closePanel('cmp') }) };
AV.keymap = AV.keymap || {}; AV.keymap.KeyZ = () => PE.panel();   /* Z: people you know (the ApePhone will host it in M17) */

/* ---------- world hooks ---------- */
const prevEnter = AV.onWorldEnter; AV.onWorldEnter = function (W) { if (prevEnter) prevEnter(W); for (const p of PE.list) dropActor(p); PE.list = []; PE.places = null; PE.talking = null; if (W.id !== W8 || !W.ctx) return;
  try { PE.places = resolvePlaces(W); PE.list = IDS.map(id => mk(W, id)); PE.stats.places = Object.keys(PE.places).filter(k => PE.places[k]).length; W.ctx.upd.push(dt => tick(Math.min(dt, .1))); (W.ctx.crowds = W.ctx.crowds || []).push({ list: PE.list, residents: true }); W.ctx.leave.push(() => { for (const p of PE.list) dropActor(p) }) } catch (e) { console.warn('residents failed', e); PE.stats.err = String(e) } };
})(window.AV);
