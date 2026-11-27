/* APEVERSE 2.0 - garage.js : M7 driving upgrade on top of vehicles.js (riding, physics, engine sound, parking stay there).
   Madrid first, as the master plan asks: one polished car and one polished scooter you can OWN.
     - Dealer "Autos y Motos Pinar" in your barrio: buy the scooter (350) or the car (1200) with credits; it is parked at the lot.
     - Owned vehicles never expire (rentals still end at midnight) and are saved with the game (AV.S.veh.list, owned: true).
     - Garage panel (Y, or the dealer counter): every vehicle you own, in every world - locate it (GPS waypoint on the
       street network), bring it to you (valet, 15), repaint it (40), sell it back (half price).
     - Chase camera: C toggles first person / third person behind the vehicle (pulled in so it never ends inside a wall);
       scooters and bikes show the rider in third person. Phone: the camera button while riding.
     - Lights: headlights at night (one shadowless spot light on the vehicle you ride), brake lights when you slow down.
     - GPS guidance: with a waypoint set (atlas J / Locate), a bar shows the next turn and the distance along the route.
   AV.garage = { DEAL, buy(), owned(), toggleCam(), panel(), stats } */
'use strict';
(function (AV) {
const VEH = AV.veh, ACT = AV.act, tr = AV.tr, CY = AV.city; if (!VEH || !ACT) return;
const G = AV.garage = { stats: {}, dealers: {} };
const L = (e, s) => [e, s], say = a => tr(a[0], a[1]);
const DEAL = G.DEAL = {
  madrid: { id: 'md_dealer', name: L('Autos y Motos Pinar', 'Autos y Motos Pinar'), anchors: ['pinar', 'parque', 'esquina'],
    stock: [{ kind: 'scooter', model: L('Urbano 125 scooter', 'Moto Urbano 125'), price: 350, cols: [0xc83a2a, 0x2a6ad8, 0xe8e4da, 0x1e1e22, 0x3a8a5a] },
      { kind: 'car', model: L('Compacto hatchback', 'Compacto'), price: 1200, cols: [0xe8e8ea, 0x8a1a1a, 0x1a3a6a, 0x2a2a2e, 0xd8b04a] }] },
  /* 2.1: owned vehicles beyond Madrid. Fictional brands from the owner's registry (Bambu Motors: mopeds and bikes; Woblr Motors;
     Astro-9 Industries hover customs). Local sublines: th "ร้านขายรถมอเตอร์ไซค์" (motorcycle shop), vi "Cửa hàng xe máy" (motorbike
     shop), de "Autohaus · Fahrräder" (car dealer · bicycles). */
  chiang_mai: { id: 'cm_bambu', name: L('Bambu Motors · Chiang Mai', 'Bambu Motors · Chiang Mai'), anchors: ['gate', 'bazaar', 'river'], label: L('buy a scooter, a bicycle or a tuk-tuk', 'comprar moto, bici o tuk-tuk'),
    sign: { bg: '#1f5a3a', fg: '#ffffff', ac: '#f2c43a', t1: 'BAMBU MOTORS', t2: 'CHIANG MAI', sub: 'ร้านขายรถมอเตอร์ไซค์' },
    stock: [{ kind: 'scooter', model: L('Bambu Click 125 scooter', 'Moto Bambu Click 125'), price: 300, cols: [0x3ab04a, 0xe8e4da, 0xc83a2a, 0x1e1e22, 0x2a6ad8] }, { kind: 'tuktuk', model: L('Bambu three-wheeler tuk-tuk', 'Tuk-tuk Bambu'), price: 900, cols: [0x2a9ad8, 0x3ab04a, 0xd8a020, 0xc83a2a] }, { kind: 'bicycle', model: L('Bambu city bicycle', 'Bici urbana Bambu'), price: 80, cols: [0xd8202a, 0x2a6ad8, 0xf2c43a, 0x1e1e22] }] },
  pai: { id: 'pai_bambu', name: L('Bambu Motors · Pai', 'Bambu Motors · Pai'), anchors: ['walking', 'jam'], label: L('buy a scooter or a bicycle', 'comprar moto o bici'),
    sign: { bg: '#2a4a2a', fg: '#ffffff', ac: '#f2c43a', t1: 'BAMBU MOTORS', t2: 'PAI', sub: 'ร้านขายรถมอเตอร์ไซค์' },
    stock: [{ kind: 'scooter', model: L('Bambu Click 125 scooter', 'Moto Bambu Click 125'), price: 300, cols: [0x3ab04a, 0xd84a8a, 0xe8e4da, 0x1e1e22] }, { kind: 'bicycle', model: L('Bambu mountain bicycle', 'Bici de montaña Bambu'), price: 90, cols: [0x2a6ad8, 0xd8202a, 0x3ab04a] }] },
  koh_tao: { id: 'kt_bambu', name: L('Bambu Motors · Koh Tao', 'Bambu Motors · Koh Tao'), anchors: ['lane', 'pier', 'sairee'], label: L('buy a scooter or a bicycle', 'comprar moto o bici'),
    sign: { bg: '#1a5a7a', fg: '#ffffff', ac: '#f2c43a', t1: 'BAMBU MOTORS', t2: 'KOH TAO', sub: 'ร้านขายรถมอเตอร์ไซค์' },
    stock: [{ kind: 'scooter', model: L('Bambu Click 125 scooter', 'Moto Bambu Click 125'), price: 320, cols: [0x2a7ac8, 0xe8e4da, 0xf2c43a, 0x1e1e22] }, { kind: 'bicycle', model: L('Bambu beach cruiser', 'Bici playera Bambu'), price: 80, cols: [0xff8aa8, 0x9ae8d0, 0xf2c43a] }] },
  da_nang: { id: 'dn_bambu', name: L('Bambu Motors · Đà Nẵng', 'Bambu Motors · Đà Nẵng'), anchors: ['han', 'cafe', 'dragon', 'beach'], label: L('buy a scooter or a bicycle', 'comprar moto o bici'),
    sign: { bg: '#8a1a1a', fg: '#ffffff', ac: '#f2c43a', t1: 'BAMBU MOTORS', t2: 'ĐÀ NẴNG', sub: 'Cửa hàng xe máy' },
    stock: [{ kind: 'scooter', model: L('Bambu Wave 110 scooter', 'Moto Bambu Wave 110'), price: 300, cols: [0x1e1e22, 0xc83a2a, 0xe8e4da, 0x2a6ad8] }, { kind: 'bicycle', model: L('Bambu riverside bicycle', 'Bici del río Bambu'), price: 80, cols: [0x2a6ad8, 0xf2c43a] }] },
  astro9: { id: 'a9_hover', name: L('Astro-9 Industries · Hover Customs', 'Astro-9 Industries · Hover Customs'), anchors: ['plaza', 'club', 'art'], label: L('buy a hover bike or a hover scooter', 'comprar moto o patinete flotante'),
    sign: { bg: '#120a2a', fg: '#4ad8ff', ac: '#ff4ad2', t1: 'HOVER CUSTOMS', t2: 'ASTRO-9 INDUSTRIES', sub: 'ANTI-GRAV · TUNING · PAINT' },
    stock: [{ kind: 'hoverbike', model: L('Astro-9 Comet hover bike', 'Moto flotante Astro-9 Comet'), price: 950, cols: [0xff4ad2, 0x4ad8ff, 0xffd84a, 0x7aff8a] }, { kind: 'hover', model: L('Astro-9 Drift hover scooter', 'Patinete flotante Astro-9 Drift'), price: 240, cols: [0x4ad8ff, 0xff4ad2, 0x7aff8a] }] },
  vienna: { id: 'vi_woblr', name: L('Woblr Motors · Wien', 'Woblr Motors · Viena'), anchors: ['arrival'], label: L('buy a Zip-EV or a bicycle', 'comprar un Zip-EV o una bici'),
    sign: { bg: '#f4f4f2', fg: '#1e2a36', ac: '#5ad8b8', t1: 'WOBLR MOTORS', t2: 'WIEN', sub: 'Autohaus · Fahrräder' },
    stock: [{ kind: 'woblr', model: L('Woblr Zip-EV', 'Woblr Zip-EV'), price: 1500, cols: [0x9ae8d0, 0xc8a8f0, 0xf2d23a, 0xf4f4f0, 0xff8aa8] }, { kind: 'bicycle', model: L('Woblr city bicycle', 'Bici urbana Woblr'), price: 120, cols: [0x1e2a36, 0x5ad8b8, 0xf4f4f0] }] } };
/* which kinds belong in which world (ship-here and dealers respect it): hover tech only on the sci-fi worlds; no cars on Koh Tao's
   lanes or in the jungle/desert/moon worlds without streets; bicycles and scooters fit most places */
const GROUND = ['bicycle', 'scooter', 'escooter'], CARS = ['car', 'woblr', 'tuktuk'], HOV = ['hover', 'hoverbike'];
G.ALLOW = { madrid: GROUND.concat(CARS), vienna: GROUND.concat(CARS), chiang_mai: GROUND.concat(CARS), pai: GROUND.concat(CARS), da_nang: GROUND.concat(CARS), jerusalem: GROUND.concat(CARS), ape_town: GROUND.concat(CARS),
  koh_tao: GROUND, koh_samui_jurassic: GROUND.concat(['car']), judean_desert: GROUND.concat(['car']), jungle_dub: ['bicycle', 'escooter'], astro9: GROUND.concat(HOV), verdalux: ['hover', 'bicycle'] };
G.allowed = (wid, kind) => (G.ALLOW[wid] || GROUND).includes(kind);
G.SHIP = 60;
const PAINT = 40, VALET = 15, SELL = .5, PALETTE = [0xe8e8ea, 0x8a1a1a, 0xc83a2a, 0x1a3a6a, 0x2a6ad8, 0x2a2a2e, 0x3a8a5a, 0xd8b04a, 0xe86a1a, 0x7a4a9a];
const st = () => { const S = AV.S; S.veh = S.veh || { list: [], n: 0 }; return S.veh };
G.owned = () => st().list.filter(r => r.owned);
const OWN_UNTIL = 1e9;   /* JSON-safe "never": vehicles.js keeps a record while until >= today */
const nameOf = r => r.model ? say(r.model) : say(VEH.KINDS[r.kind].n);

/* ---------- the dealer lot: a small forecourt with a sign, a kiosk and both models on display ---------- */
/* 2.1: lots never sit on a walking route (the forecourt displays are solid) */
const segD = (px, pz, ax, az, bx, bz) => { const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / l2)); return Math.hypot(px - ax - dx * t, pz - az - dz * t) };
function offWalk(W, x, z) { const N = W.mapNav; if (N && N.links) for (let i = 0; i < N.nodes.length; i++) { const a = N.nodes[i]; if (Math.abs(a[0] - x) > 40 || Math.abs(a[1] - z) > 40) continue; for (const j of N.links[i]) { const b = N.nodes[j]; if (segD(x, z, a[0], a[1], b[0], b[1]) < 7) return false } }
  for (const cr of (W.ctx && W.ctx.crowds) || []) { const nv = cr.nav; if (!nv || !nv.links) continue; for (let i = 0; i < nv.nodes.length; i++) { const a = nv.nodes[i]; if (Math.abs(a[0] - x) > 40 || Math.abs(a[1] - z) > 40) continue; for (const j of nv.links[i]) { const b = nv.nodes[j]; if (segD(x, z, a[0], a[1], b[0], b[1]) < 5) return false } } } return true }
function findLot(W, D) {
  const roads = W.mapRoads || [], rd = (x, z) => { let d = 1e9; for (const q of roads) { const dx = q[2] - q[0], dz = q[3] - q[1], l2 = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((x - q[0]) * dx + (z - q[1]) * dz) / l2)); d = Math.min(d, Math.hypot(x - q[0] - dx * t, z - q[1] - dz * t) - (q[4] || 6) / 2) } return d };
  const anchors = D.anchors.map(id => id === 'arrival' ? (W.arrivals && (W.arrivals.default || W.arrivals[W.defaultArrival])) : (W.places || []).find(p => p.id === id)).filter(Boolean);
  const free = (x, z, m) => W.surface(x, z) !== null && AV.isFree(W, x, z, m) && !(W.noDecor && W.noDecor(x, z));
  for (const a of anchors) for (let r = 6; r <= 60; r += 2) for (let k = 0, n = Math.max(8, r); k < n; k++) { const ang = k / n * Math.PI * 2, x = a.x + Math.cos(ang) * r, z = a.z + Math.sin(ang) * r; let ok = true;
    for (let dx = -5; dx <= 5 && ok; dx += 1) for (let dz = -3.5; dz <= 3.5 && ok; dz += 1) if (!free(x + dx, z + dz, .35) || rd(x + dx, z + dz) < 1.5) ok = false;
    if (ok && !W.T.some(t => Math.hypot(t.x - x, t.z - z) < 7) && offWalk(W, x, z)) return { x, z, ry: Math.atan2(a.x - x, a.z - z) } }
  return null }
function buildDealer(W) { const D = DEAL[W.id]; if (!D || !W.ctx) return; const lot = findLot(W, D); G.dealers[W.id] = { ok: !!lot }; if (!lot) { console.warn('garage: no lot in', W.id); return }
  const K = AV.kit, M = K.M, B = K.BG, ctx = W.ctx, y0 = W.surface(lot.x, lot.z) || 0, c = Math.cos(lot.ry), s = Math.sin(lot.ry), w2 = (lx, lz) => [lot.x + lx * c + lz * s, lot.z - lx * s + lz * c];
  const P = (lx, ly, lz, sx, sy, sz) => { const [x, z] = w2(lx, lz); return M(x, y0 + ly, z, sx, sy, sz, 0, lot.ry, 0) }, parts = [];
  parts.push([B.box, 0x8a8a86, P(0, .02, 0, 10.5, .04, 7.2)]);   /* forecourt */
  for (const lx of [-1.7, 1.7]) parts.push([B.box, 0xf4f4f0, P(lx, .045, .3, .1, .01, 5)]);   /* bay lines */
  parts.push([B.box, 0xe8e4dc, P(4.2, 1.3, -2.6, 2.2, 2.6, 2)], [B.box, D.sign ? parseInt(D.sign.bg.slice(1), 16) : 0x1a3a6a, P(4.2, 2.7, -2.6, 2.5, .2, 2.3)], [B.box, 0x9ac8e0, P(4.2, 1.5, -1.58, 1.4, 1, .04)]);   /* sales kiosk */
  parts.push([B.cyl, 0x3a3a3e, P(-4.6, 2, -3, .08, 4, .08)]);
  const mesh = new THREE.Mesh(K.merge(parts), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .8 })); mesh.material.userData.lin = 1; ctx.group.add(mesh);
  { const a = w2(4.2, -2.6); ctx.circles.push([a[0], a[1], 1.4]); const b = w2(-4.6, -3); ctx.circles.push([b[0], b[1], .2]) }
  /* sign */
  { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 192; const g = cv.getContext('2d'); const SG = D.sign || { bg: '#12305a', fg: '#ffffff', ac: '#f2c43a', t1: 'AUTOS Y MOTOS', t2: 'PINAR', sub: 'VENTA · TALLER · PINTURA' }, fit = (t, px, fam, y) => { let n = px; do { g.font = fam.replace('#', n); n -= 2 } while (g.measureText(t).width > 470 && n > 12); g.fillText(t, 256, y) };
    g.fillStyle = SG.bg; g.fillRect(0, 0, 512, 192); g.strokeStyle = SG.ac; g.lineWidth = 6; g.strokeRect(8, 8, 496, 176);
    g.fillStyle = SG.fg; g.textAlign = 'center'; fit(SG.t1, 54, '900 #px Arial, sans-serif', 82); g.fillStyle = SG.ac; fit(SG.t2, 46, '900 #px Arial, sans-serif', 140); g.fillStyle = SG.fg; g.globalAlpha = .85; fit(SG.sub, 22, '700 #px "Noto Sans Thai", Tahoma, Arial, sans-serif', 174); g.globalAlpha = 1;
    const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; const sg = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1), new THREE.MeshStandardMaterial({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .4, side: THREE.DoubleSide })); const [x, z] = w2(-4.6, -3); sg.position.set(x, y0 + 4.2, z); sg.rotation.y = lot.ry; ctx.group.add(sg) }
  /* the two models on display (not rideable: they are the showroom examples) */
  D.stock.slice(0, 3).forEach((it, i) => { const m = new THREE.Mesh(VEH.geo(it.kind, it.cols[0]), CY && CY.vehMat ? CY.vehMat(null) : new THREE.MeshStandardMaterial({ vertexColors: true })); const [x, z] = w2([-3.4, 0, 2.4][i], i === 2 ? 2.2 : .6); if (/hover/.test(it.kind)) m.position.y = .15; m.position.set(x, y0 + (m.position.y || 0), z); m.rotation.y = lot.ry + Math.PI + (i ? .35 : -.3); ctx.group.add(m); ctx.circles.push([x, z, i ? 2.2 : 1]) });
  const counter = w2(4.2, -1.1); Object.assign(G.dealers[W.id], { lot, counter, bay: w2(-1.7, 3.2), D });
  W.T.push({ x: counter[0], z: counter[1], r: 1.8, label: () => '🚗 ' + say(D.name) + ': ' + (D.label ? say(D.label) : tr('buy a scooter or a car', 'comprar moto o coche')) + tr(' · garage', ' · garaje'), fn: () => G.panel(W.id) });
  (W.places = W.places || []).push({ id: 'dealer', name: [say(D.name), say(D.name)], x: counter[0], z: counter[1] + 1, yaw: 0 }) }

/* ---------- buy / own ---------- */
G.buy = function (wid, kind, col) { const dl = G.dealers[wid], W = AV.W; if (!dl || !dl.ok || !W || W.id !== wid) return null; const it = dl.D.stock.find(x => x.kind === kind); if (!it) return null;
  if (!AV.txn(-it.price, say(it.model))) return null;
  let [x, z] = dl.bay; if (!AV.isFree(W, x, z, /car|woblr|tuktuk/.test(kind) ? 1.6 : .8)) { const sp = AV.safeSpot(W, x, z); x = sp[0]; z = sp[1] }
  const rec = VEH.rent(kind, x, z, VEH.openYaw(W, x, z, dl.lot.ry + Math.PI), { price: 0, col: col != null ? col : it.cols[0], ride: false, stand: 'owned' });
  if (!rec) { AV.txn(it.price, say(it.model) + tr(' (refund: it could not be parked)', ' (devolución: no se pudo aparcar)')); return null }   /* 2.1: never charge for a vehicle that did not appear */
  rec.owned = true; rec.until = OWN_UNTIL; rec.model = it.model; rec.bought = AV.S.day; AV.save();
  AV.toast('🔑 ' + tr('It is yours: ', 'Es tuyo: ') + say(it.model) + tr('. Parked at the lot. Y = your garage.', '. Aparcado en el concesionario. Y = tu garaje.')); G.stats.bought = (G.stats.bought || 0) + 1; return rec };
G.paint = function (rec) { if (!rec || !rec.owned) return false; const i = PALETTE.indexOf(rec.col), next = PALETTE[(i + 1) % PALETTE.length]; if (!AV.txn(-PAINT, tr('Paint job', 'Pintura'))) return false; rec.col = next; if (!(ACT.cur && ACT.cur.rec === rec)) VEH.respawn(rec); AV.save(); return true };
G.valet = function (rec) { const W = AV.W; if (!rec || !rec.owned || !W || rec.w !== W.id || (ACT.cur && ACT.cur.rec === rec)) return false; if (!AV.txn(-VALET, tr('Valet', 'Aparcacoches'))) return false; const P = AV.P, f = [-Math.sin(P.yaw), -Math.cos(P.yaw)];
  let x = P.x + f[0] * 3, z = P.z + f[1] * 3; if (!AV.isFree(W, x, z, /car|woblr|tuktuk/.test(rec.kind) ? 1.5 : .7)) { const sp = AV.safeSpot(W, x, z); x = sp[0]; z = sp[1] } rec.x = x; rec.z = z; rec.yaw = VEH.openYaw(W, x, z, P.yaw); VEH.respawn(rec); AV.save(); return true };
G.sell = function (rec) { if (!rec || !rec.owned) return false; const it = Object.values(DEAL).flatMap(d => d.stock).find(x => x.kind === rec.kind), back = Math.round((it ? it.price : 200) * SELL); VEH.giveBack(rec); AV.txn(back, tr('Sold: ', 'Vendido: ') + nameOf(rec)); AV.save(); return back };
G.ship = function (rec) { const W = AV.W; if (!rec || !rec.owned || !W || rec.w === W.id || !G.allowed(W.id, rec.kind)) return false; if (!AV.txn(-G.SHIP, tr('Portal freight: ', 'Transporte por portal: ') + nameOf(rec))) return false;
  const P = AV.P, f = [-Math.sin(P.yaw), -Math.cos(P.yaw)], big = /car|woblr|tuktuk/.test(rec.kind); let x = P.x + f[0] * 3.5, z = P.z + f[1] * 3.5; if (!AV.isFree(W, x, z, big ? 1.6 : .8) || W.surface(x, z) === null) { const sp = AV.safeSpot(W, x, z); x = sp[0]; z = sp[1] }
  rec.w = W.id; rec.x = x; rec.z = z; rec.yaw = VEH.openYaw(W, x, z, P.yaw); VEH.respawn(rec); AV.save(); G.stats.shipped = (G.stats.shipped || 0) + 1; AV.toast('📦 ' + nameOf(rec) + tr(' arrived by portal freight, right in front of you.', ' llegó por transporte de portal, justo delante de ti.')); return true };
G.locate = function (rec) { if (!rec || !AV.W || rec.w !== AV.W.id || !AV.minimap || !AV.minimap.setDest) return false; AV.minimap.setDest(rec.x, rec.z, nameOf(rec)); return true };

/* ---------- garage / dealer panel ---------- */
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const hex = c => '#' + c.toString(16).padStart(6, '0');
G.panel = function (wid) { const W = AV.W, dl = G.dealers[wid || (W && W.id)], ui = G.ui = G.ui || { col: {} };
  const render = () => { const own = G.owned(); let h = '<b>🚗 ' + (dl && dl.ok ? esc(say(dl.D.name)) + ' · ' : '') + tr('Garage', 'Garaje') + '</b> · ' + tr('Credits', 'Créditos') + ': <b id="gC">' + AV.S.money + '</b>';
    if (dl && dl.ok && W && W.id === (wid || W.id)) h += '<div class="pp-sec">' + tr('For sale', 'En venta') + '</div>' + dl.D.stock.map(it => { const sel = ui.col[it.kind] != null ? ui.col[it.kind] : it.cols[0]; return '<div class="bitem"><div class="bic">' + VEH.KINDS[it.kind].icon + '</div><div class="bnm">' + esc(say(it.model)) + ' <b>' + it.price + '</b><small>' + it.cols.map(c => '<span data-pc="' + it.kind + ':' + c + '" style="display:inline-block;width:16px;height:16px;border-radius:50%;margin:3px 3px 0 0;cursor:pointer;background:' + hex(c) + ';outline:' + (c === sel ? '2px solid #ffd84a' : '1px solid #fff4') + '"></span>').join('') + '</small></div><div class="bbt"><button data-buy="' + it.kind + '">' + tr('Buy', 'Comprar') + '</button></div></div>' }).join('');
    h += '<div class="pp-sec">' + tr('Your vehicles', 'Tus vehículos') + ' (' + own.length + ')</div>' + (own.length ? own.map(r => { const here = W && r.w === W.id, d = here ? Math.round(Math.hypot(r.x - AV.P.x, r.z - AV.P.z)) : null, meta = AV.worldMeta && AV.worldMeta(r.w);
      return '<div class="bitem"><div class="bic">' + VEH.KINDS[r.kind].icon + '</div><div class="bnm">' + esc(nameOf(r)) + ' <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:' + hex(r.col) + '"></span><small>' + (here ? d + ' m ' + tr('away', 'de aquí') : tr('parked in ', 'aparcado en ') + esc(meta ? meta.name : r.w)) + '</small></div><div class="bbt">' +
        (here ? '<button data-loc="' + r.id + '">📍 ' + tr('Locate', 'Localizar') + '</button><button data-val="' + r.id + '">' + tr('Bring here', 'Traer') + ' · ' + VALET + '</button>' : W && G.allowed(W.id, r.kind) ? '<button data-shp="' + r.id + '">📦 ' + tr('Ship here', 'Traer aquí') + ' · ' + G.SHIP + '</button>' : '<small>' + tr('not allowed in this world', 'no permitido en este mundo') + '</small>') + '<button data-pnt="' + r.id + '">🎨 ' + PAINT + '</button><button data-sel="' + r.id + '">' + tr('Sell', 'Vender') + '</button></div></div>' }).join('') : '<div class="note">' + tr('You do not own a vehicle yet.', 'Aún no tienes vehículo.') + '</div>');
    h += '<div class="note">' + tr('C while riding: first / third person camera. Owned vehicles stay where you park them and are saved.', 'C al conducir: cámara en primera / tercera persona. Tus vehículos se quedan donde aparcas y se guardan.') + '</div><div class="row"><button data-close>' + tr('Done', 'Listo') + '</button></div>';
    const p = AV.panel('cmp', h), byId = id => G.owned().find(r => String(r.id) === String(id));
    p.querySelectorAll('[data-pc]').forEach(b => b.onclick = () => { const [k, c] = b.dataset.pc.split(':'); ui.col[k] = +c; render() });
    p.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => { const k = b.dataset.buy, it = dl.D.stock.find(x => x.kind === k); if (G.buy(W.id, k, ui.col[k] != null ? ui.col[k] : it.cols[0])) render() });
    p.querySelectorAll('[data-loc]').forEach(b => b.onclick = () => { G.locate(byId(b.dataset.loc)); AV.closePanel('cmp') });
    p.querySelectorAll('[data-val]').forEach(b => b.onclick = () => { G.valet(byId(b.dataset.val)); render() });
    p.querySelectorAll('[data-shp]').forEach(b => b.onclick = () => { G.ship(byId(b.dataset.shp)); render() });
    p.querySelectorAll('[data-pnt]').forEach(b => b.onclick = () => { G.paint(byId(b.dataset.pnt)); render() });
    p.querySelectorAll('[data-sel]').forEach(b => b.onclick = () => { const r = byId(b.dataset.sel); if (!r) return; if (b.dataset.sure) { G.sell(r); render() } else { b.dataset.sure = 1; b.textContent = tr('Sure? Sell', '¿Seguro? Vender') } }) };   /* two-step, no browser dialog */
  render() };
AV.keymap = AV.keymap || {}; const kY = AV.keymap.KeyY; AV.keymap.KeyY = () => { if (kY) kY(); if (!AV.blocking()) G.panel() };   /* Y = your vehicles (core already uses G for graphics quality) */

/* ---------- chase camera, rider, lights, brake lights ---------- */
const set = () => { const S = AV.S; S.set.drive = S.set.drive || { chase: false }; return S.set.drive };
G.toggleCam = on => { const d = set(); d.chase = on == null ? !d.chase : !!on; AV.save(); applyRider(); AV.toast(d.chase ? tr('🎥 Chase camera', '🎥 Cámara de persecución') : tr('🎥 First person', '🎥 Primera persona')); return d.chase };
const kC = AV.keymap.KeyC; AV.keymap.KeyC = () => { if (ACT.cur && ACT.cur.id === 'ride') G.toggleCam(); else if (kC) kC() };
const riderGeo = {};
function applyRider() { const a = ACT.cur; if (!a || a.id !== 'ride' || !a.o) return; const k = a.rec.kind, want = set().chase && /^(scooter|bicycle)$/.test(k) && CY && CY.VB && CY.VB[k];
  if (!a.o.geo0) a.o.geo0 = a.o.mesh.geometry; a.o.mesh.geometry = want ? (riderGeo[k + a.rec.col] = riderGeo[k + a.rec.col] || CY.VB[k](a.rec.col, { rider: true })) : a.o.geo0 }
let lamp = null, tgt = null, brake = null, lastV = 0, ridingRec = null;
const BRAKE_POS = { woblr: [[-.55, .7, -1.4], [.55, .7, -1.4]], car: [[-.62, .8, -2.24], [.62, .8, -2.24]], scooter: [[0, .8, -1.03]], tuktuk: [[-.5, .7, -1.3], [.5, .7, -1.3]] };
function attachLights(a) { const k = a.rec.kind; if (!lamp) { lamp = new THREE.SpotLight(0xfff2d8, 0, 34, .5, .55, 1.4); tgt = new THREE.Object3D(); lamp.target = tgt }
  a.o.mesh.add(lamp); a.o.mesh.add(tgt); lamp.position.set(0, k === 'car' ? .75 : k === 'woblr' ? .72 : .95, k === 'car' ? 2.2 : k === 'woblr' ? 1.45 : .7); tgt.position.set(0, 0, 14);
  if (brake) { if (brake.parent) brake.parent.remove(brake) } brake = new THREE.Group(); const bm = new THREE.MeshBasicMaterial({ color: 0xff2020, transparent: true, opacity: .95 });
  for (const p of BRAKE_POS[k] || []) { const m = new THREE.Mesh(AV.kit.BG.box, bm); m.scale.set((k === 'car' || k === 'woblr') ? .4 : .18, .12, .04); m.position.set(...p); brake.add(m) } brake.visible = false; a.o.mesh.add(brake) }
function detachLights() { if (lamp && lamp.parent) { lamp.parent.remove(lamp); tgt.parent && tgt.parent.remove(tgt); lamp.intensity = 0 } if (brake && brake.parent) brake.parent.remove(brake); ridingRec = null }
const v3 = new THREE.Vector3();
AV.frameFns.push((dt) => { const a = ACT.cur, riding = a && a.id === 'ride' && a.o;
  if (!riding) { if (ridingRec) detachLights(); return }
  if (ridingRec !== a.rec) { ridingRec = a.rec; attachLights(a); applyRider(); lastV = a.v || 0 }
  const nk = AV.nightK || 0, k = a.rec.kind; if (lamp) lamp.intensity = /bicycle|escooter/.test(k) ? nk * .8 : nk * 2.2;
  const v = a.v || 0, slowing = v > .6 && v < lastV - 2.2 * dt; if (brake) brake.visible = slowing || (Math.abs(v) < .3 && (AV.keys.KeyS || 0) > 0); lastV = v; G.stats.braking = brake && brake.visible;
  if (!set().chase) return;
  /* third person: behind + above, pulled in until the line of sight is clear */
  const P = AV.P, W = AV.W, back = k === 'car' ? 6.2 : k === 'woblr' ? 5.4 : k === 'tuktuk' ? 5.4 : 4.2, f = [-Math.sin(P.yaw), -Math.cos(P.yaw)]; let d = back;
  for (let t = 1; t <= back; t += .35) { const x = P.x - f[0] * t, z = P.z - f[1] * t; if (W.surface(x, z) === null || !AV.isFree(W, x, z, .25)) { d = Math.max(1.2, t - .5); break } }
  const cam = AV.cam; cam.position.set(P.x - f[0] * d, (P.y || 0) + 1.7 + (k === 'car' || k === 'woblr' ? 1.3 : 1.0) * Math.min(1, d / back + .3), P.z - f[1] * d); cam.rotation.set(P.pitch - .16, P.yaw, 0); G.stats.camBack = +d.toFixed(2) });

/* ---------- GPS guidance bar (walking or driving) ---------- */
const bar = document.createElement('div'); bar.id = 'gpsBar'; bar.style.cssText = 'position:fixed;left:50%;top:calc(58px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:5;display:none;background:rgba(18,10,34,.86);border:1px solid #ff4ad2;border-radius:12px;padding:6px 14px;font:600 15px system-ui,sans-serif;color:#fff;pointer-events:none;white-space:nowrap'; document.body.appendChild(bar);
const ARROWS = ['⬆', '↗', '➡', '↘', '⬇', '↙', '⬅', '↖'];
let gT = 0; AV.frameFns.push(() => { const MM = AV.minimap, d = MM && MM.dest; if (!d || !d.path || !AV.W || d.w !== AV.W) { if (bar.style.display !== 'none') bar.style.display = 'none'; G.stats.gps = null; return }
  if ((gT = AV.now()) - (G._gT || 0) < .25) return; G._gT = gT; const P = AV.P, pts = [[P.x, P.z]].concat(d.path);
  let rem = 0; for (let i = 1; i < pts.length; i++) rem += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  if (Math.hypot(d.x - P.x, d.z - P.z) < Math.min(8, d.arr || 8)) { bar.style.display = 'none'; AV.toast('📍 ' + tr('Arrived: ', 'Llegaste: ') + (d.name || '')); MM.dest = null; G.stats.gps = { arrived: true }; return }
  let nxt = null; for (const p of d.path) if (Math.hypot(p[0] - P.x, p[1] - P.z) > 7) { nxt = p; break } if (!nxt) nxt = [d.x, d.z];
  const want = Math.atan2(-(nxt[0] - P.x), -(nxt[1] - P.z)), rel = Math.atan2(Math.sin(want - P.yaw), Math.cos(want - P.yaw)), ix = ((Math.round(-rel / (Math.PI / 4)) % 8) + 8) % 8;
  bar.textContent = ARROWS[ix] + '  ' + (rem > 1000 ? (rem / 1000).toFixed(1) + ' km' : Math.round(rem / 10) * 10 + ' m') + '  ·  ' + (d.name || tr('Waypoint', 'Destino')); bar.style.display = 'block'; G.stats.gps = { arrow: ARROWS[ix], m: Math.round(rem), via: d.path.length } });

/* phone: a camera button while riding */
const pb = document.createElement('button'); pb.textContent = '🎥'; pb.style.cssText = 'position:fixed;right:calc(14px + env(safe-area-inset-right,0px));bottom:190px;z-index:6;display:none;width:52px;height:52px;border-radius:50%;font-size:22px;border:1px solid #fff5;background:rgba(20,10,40,.7);color:#fff'; pb.onclick = () => G.toggleCam(); document.body.appendChild(pb);
AV.frameFns.push(() => { const show = AV.device === 'phone' && ACT.cur && ACT.cur.id === 'ride'; if ((pb.style.display !== 'none') !== show) pb.style.display = show ? 'block' : 'none' });

const prevEnter = AV.onWorldEnter; AV.onWorldEnter = function (W) { if (prevEnter) prevEnter(W); detachLights(); lamp = null; brake = null; try { buildDealer(W) } catch (e) { console.warn('dealer failed', e); G.dealers[W.id] = { ok: false, err: String(e) } } };
})(window.AV);
