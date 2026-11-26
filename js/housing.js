/* APEVERSE 2.0 - housing.js : M8. A shared property system, first used for one real apartment in Madrid.
   - "Piso 2B, Pinar": a street door on a building in your barrio. Rent it (140 credits / 7 days, renewable) or buy it (3000).
     The interior is a private room (Madrid's "home" zone far outside the city map, like the memory flat): living room with a
     kitchenette, a big window onto the city, a ceiling light. Enter / leave through the door with a fade.
   - Decorate: buy furniture (18 pieces: bed, sofa, armchair, tables, chairs, lamp, plant, rug, bookshelf, wardrobe, record
     player, speakers, TV, DJ decks, arcade cabinet, desk, posters + art prints of the clothing-store designs) into your
     home stock, then place it: it follows your gaze on the floor, Q rotates, Enter / Place sets it (only where it fits: inside
     the room, clear of other pieces, the kitchen and the door), Backspace / Cancel stops. Every placed piece can be moved,
     rotated or put back into stock. Posters / prints hang on the wall you face.
   - Walls (8 colours) and floor (parquet, terracotta tiles, carpet, concrete) are changeable.
   - The bed: sleep until 08:00 (new day) and make the flat your respawn point (a fresh session starts there).
   - Wardrobe: wear any clothes you own (M6). Record player: play any of the game's real playlists from the turntable.
   - Everything is saved in AV.S.homes[id] = { st: 'rent'|'own', until, wall, floor, items[{k,x,z,ry,d}], stock{} } (new
     optional field: old saves load unchanged). Rent ends after its last day: the furniture waits in the save until you renew.
   AV.home = { PROPS, CAT, rent(), buy(), enter(), leave(), place(), panel(), stats } */
'use strict';
(function (AV) {
const tr = AV.tr, TAU = Math.PI * 2, L = (e, s) => [e, s], say = a => tr(a[0], a[1]);
const H = AV.home = { stats: {}, live: null };
/* ---------- properties (one for now: the system is shared, more come per world) ---------- */
const PROPS = H.PROPS = {
  md_pinar_2b: { w: 'madrid', name: L('Piso 2B · Pinar de Chamartín', 'Piso 2B · Pinar de Chamartín'), anchor: ['pinar'], near: [34, 10.4], rent: 140,   /* near: the memory flat's street door - same residential block */ days: 7, price: 3000,
    room: { x: 2000, z: 30, w: 10, d: 8, h: 3 } } };
const WALLS = [[0xf2ebe0, L('Warm white', 'Blanco cálido')], [0xe8d4b0, L('Sand', 'Arena')], [0xc8d8c8, L('Sage', 'Salvia')], [0xb8cce0, L('Sky', 'Cielo')], [0xe8b8a8, L('Terracotta pink', 'Rosa terracota')], [0x3a4a5a, L('Night blue', 'Azul noche')], [0x2a2a2e, L('Charcoal', 'Carbón')], [0xe8c84a, L('Mustard', 'Mostaza')]];
const FLOORS = [L('Oak parquet', 'Parqué de roble'), L('Terracotta tiles', 'Baldosas de barro'), L('Soft carpet', 'Moqueta'), L('Polished concrete', 'Hormigón pulido')];
/* ---------- furniture: footprint w x d (metres, local x / z), price, collision, parts in local space (front = +z) ---------- */
const K = () => AV.kit, M = (...a) => AV.kit.M(...a), B = () => AV.kit.BG;
const CAT = H.CAT = {
  bed: { n: L('Double bed', 'Cama doble'), ic: '🛏', p: 180, w: 1.7, d: 2.15, parts: () => [[B().box, 0x6a4a32, M(0, .22, 0, 1.7, .3, 2.15)], [B().box, 0xf4f0e8, M(0, .45, .05, 1.6, .2, 2)], [B().box, 0x3a6a8a, M(0, .57, .35, 1.62, .06, 1.3)], [B().box, 0xffffff, M(-.4, .6, -.8, .6, .14, .38)], [B().box, 0xffffff, M(.4, .6, -.8, .6, .14, .38)], [B().box, 0x5a3a24, M(0, .8, -1.04, 1.7, 1, .08)]], act: 'sleep' },
  sofa: { n: L('Sofa', 'Sofá'), ic: '🛋', p: 220, w: 2.1, d: .92, parts: () => [[B().box, 0x4a6a8a, M(0, .25, 0, 2.1, .3, .92)], [B().box, 0x5a7a9a, M(0, .48, .08, 1.8, .16, .74)], [B().box, 0x4a6a8a, M(0, .7, -.36, 2.1, .6, .2)], [B().box, 0x4a6a8a, M(-.98, .55, 0, .16, .4, .92)], [B().box, 0x4a6a8a, M(.98, .55, 0, .16, .4, .92)], [B().box, 0xe8b84a, M(-.5, .7, -.22, .4, .34, .12)]] },
  armchair: { n: L('Armchair', 'Sillón'), ic: '💺', p: 90, w: .92, d: .9, parts: () => [[B().box, 0xb85a3a, M(0, .25, 0, .92, .3, .9)], [B().box, 0xc86a4a, M(0, .46, .06, .66, .14, .7)], [B().box, 0xb85a3a, M(0, .7, -.36, .92, .62, .18)], [B().box, 0xb85a3a, M(-.4, .52, 0, .14, .36, .9)], [B().box, 0xb85a3a, M(.4, .52, 0, .14, .36, .9)]] },
  coffee: { n: L('Coffee table', 'Mesa baja'), ic: '🟫', p: 60, w: 1.1, d: .6, parts: () => [[B().box, 0x8a6a4a, M(0, .4, 0, 1.1, .05, .6)], ...[-1, 1].flatMap(a => [-1, 1].map(b => [B().box, 0x2a2a2a, M(a * .48, .19, b * .24, .04, .38, .04)])), [B().box, 0xd84a3a, M(.25, .45, .05, .2, .06, .28)]] },
  dining: { n: L('Dining table', 'Mesa de comedor'), ic: '🍽', p: 120, w: 1.4, d: .85, parts: () => [[B().box, 0xa87a4a, M(0, .74, 0, 1.4, .05, .85)], ...[-1, 1].flatMap(a => [-1, 1].map(b => [B().box, 0x6a4a32, M(a * .62, .36, b * .34, .06, .72, .06)])), [B().cyl, 0xf4f0e8, M(0, .82, 0, .1, .12, .1)]] },
  chair: { n: L('Chair', 'Silla'), ic: '🪑', p: 25, w: .5, d: .5, parts: () => [[B().box, 0xa87a4a, M(0, .45, 0, .46, .05, .46)], [B().box, 0xa87a4a, M(0, .78, -.21, .46, .6, .04)], ...[-1, 1].flatMap(a => [-1, 1].map(b => [B().box, 0x6a4a32, M(a * .2, .22, b * .2, .04, .44, .04)]))] },
  lamp: { n: L('Floor lamp', 'Lámpara de pie'), ic: '💡', p: 45, w: .4, d: .4, parts: () => [[B().cyl, 0x2a2a2a, M(0, .03, 0, .18, .06, .18)], [B().cyl, 0x2a2a2a, M(0, .8, 0, .02, 1.6, .02)], [B().cone, 0xfff0c8, M(0, 1.65, 0, .24, .3, .24), 1]], glow: true },
  plant: { n: L('Monstera plant', 'Costilla de Adán'), ic: '🪴', p: 30, w: .5, d: .5, parts: () => [[B().cyl, 0xb8643a, M(0, .2, 0, .2, .4, .2)], [B().sph, 0x2e7a3a, M(0, .7, 0, .38, .42, .38)], [B().sph, 0x3a8a44, M(.15, .95, .05, .26, .3, .26)], [B().sph, 0x2a6a32, M(-.14, .9, -.08, .24, .28, .24)]] },
  rug: { n: L('Rug', 'Alfombra'), ic: '🟥', p: 70, w: 2.2, d: 1.5, flat: true, parts: () => [[B().box, 0xb84a3a, M(0, .012, 0, 2.2, .02, 1.5)], [B().box, 0xe8c84a, M(0, .024, 0, 1.8, .01, 1.1)], [B().box, 0x2a4a6a, M(0, .03, 0, 1.2, .01, .6)]] },
  shelf: { n: L('Bookshelf', 'Estantería'), ic: '📚', p: 80, w: 1.0, d: .35, parts: () => { const o = [[B().box, 0x8a6a4a, M(0, .9, -.15, 1, 1.8, .05)], [B().box, 0x8a6a4a, M(-.48, .9, 0, .04, 1.8, .35)], [B().box, 0x8a6a4a, M(.48, .9, 0, .04, 1.8, .35)]]; for (let i = 0; i < 5; i++) { o.push([B().box, 0x8a6a4a, M(0, .05 + i * .43, 0, 1, .03, .35)]); if (i < 4) for (let j = 0; j < 6; j++) o.push([B().box, [0xc83a2a, 0x2a6ad8, 0xe8c84a, 0x3a8a5a, 0x7a4a9a, 0xe8e4da][(i + j) % 6], M(-.38 + j * .14 + (i % 2) * .03, .2 + i * .43, .02, .09, .26 + ((i + j) % 3) * .03, .22)]) } return o } },
  wardrobe: { n: L('Wardrobe', 'Armario'), ic: '🚪', p: 150, w: 1.1, d: .6, parts: () => [[B().box, 0xe8e0d0, M(0, 1, 0, 1.1, 2, .6)], [B().box, 0xd8d0c0, M(-.27, 1, .31, .5, 1.9, .02)], [B().box, 0xd8d0c0, M(.27, 1, .31, .5, 1.9, .02)], [B().box, 0xc8a040, M(-.04, 1.05, .33, .02, .2, .02)], [B().box, 0xc8a040, M(.04, 1.05, .33, .02, .2, .02)]], act: 'wardrobe' },
  record: { n: L('Record player', 'Tocadiscos'), ic: '🎶', p: 160, w: .85, d: .45, parts: () => [[B().box, 0x6a4a32, M(0, .32, 0, .85, .64, .45)], [B().box, 0x2a2a2a, M(0, .66, 0, .5, .04, .4)], [B().cyl, 0x111111, M(-.05, .69, 0, .15, .01, .15)], [B().cyl, 0xd83a2a, M(-.05, .7, 0, .05, .01, .05)], [B().box, 0xc8c8cc, M(.17, .7, -.1, .02, .02, .2)]], act: 'music' },
  speakers: { n: L('Speakers (pair)', 'Altavoces (par)'), ic: '🔊', p: 90, w: 1.4, d: .35, parts: () => [-1, 1].flatMap(s => [[B().box, 0x1e1e22, M(s * .55, .45, 0, .3, .9, .3)], [B().cyl, 0x3a3a3e, M(s * .55, .62, .16, .1, .02, .1)], [B().cyl, 0x3a3a3e, M(s * .55, .32, .16, .07, .02, .07)]]) },
  tv: { n: L('TV on a stand', 'Tele con mueble'), ic: '📺', p: 200, w: 1.3, d: .45, parts: () => [[B().box, 0x2a2a2e, M(0, .25, 0, 1.3, .5, .45)], [B().box, 0x111111, M(0, 1.05, -.05, 1.15, .66, .05)], [B().box, 0x2a6ad8, M(0, 1.05, -.02, 1.07, .58, .01), 1]] },
  dj: { n: L('DJ decks', 'Platos de DJ'), ic: '🎛', p: 450, w: 1.4, d: .65, parts: () => [[B().box, 0x2a2a2e, M(0, .45, 0, 1.4, .9, .65)], [B().box, 0x3a3a3e, M(0, .92, 0, 1.3, .04, .55)], [B().cyl, 0x111111, M(-.42, .95, 0, .18, .01, .18)], [B().cyl, 0x111111, M(.42, .95, 0, .18, .01, .18)], [B().box, 0x4ad8ff, M(0, .95, 0, .3, .02, .3), 1]] },
  arcade: { n: L('Arcade cabinet', 'Máquina recreativa'), ic: '🕹', p: 300, w: .7, d: .75, parts: () => [[B().box, 0x7a2a9a, M(0, .9, 0, .7, 1.8, .75)], [B().box, 0x111111, M(0, 1.3, .3, .55, .45, .05)], [B().box, 0x4aff8a, M(0, 1.3, .33, .48, .38, .01), 1], [B().box, 0x2a2a2e, M(0, .95, .35, .6, .08, .2)], [B().box, 0xffd84a, M(0, 1.72, .36, .6, .12, .02), 1]] },
  desk: { n: L('Desk + computer', 'Escritorio + ordenador'), ic: '💻', p: 110, w: 1.2, d: .6, parts: () => [[B().box, 0xe8e0d0, M(0, .74, 0, 1.2, .04, .6)], [B().box, 0x8a8a8e, M(-.55, .36, 0, .04, .72, .55)], [B().box, 0x8a8a8e, M(.55, .36, 0, .04, .72, .55)], [B().box, 0x1e1e22, M(0, 1.02, -.18, .55, .34, .03)], [B().box, 0x3a8ad8, M(0, 1.02, -.16, .5, .3, .01), 1], [B().box, 0x2a2a2e, M(0, .77, .08, .4, .02, .14)]] },
  poster: { n: L('Poster (store design)', 'Póster (diseño de la tienda)'), ic: '🖼', p: 20, wall: true, size: .8 },
  print: { n: L('Framed art print', 'Lámina enmarcada'), ic: '🖼', p: 60, wall: true, size: 1.1, frame: true } };
const ORDER = H.ORDER = ['bed', 'sofa', 'armchair', 'coffee', 'dining', 'chair', 'lamp', 'plant', 'rug', 'shelf', 'wardrobe', 'record', 'speakers', 'tv', 'dj', 'arcade', 'desk', 'poster', 'print'];   /* 2.1: brand furniture (SOLTERRA Living) is appended */
const geoCache = {}; const geoOf = k => geoCache[k] || (geoCache[k] = AV.kit.merge(CAT[k].parts()));
const st = () => { const S = AV.S; S.homes = S.homes || {}; return S.homes };
const rec = pid => st()[pid] || null;
const active = r => !!r && (r.st === 'own' || r.until >= AV.S.day);
H.rec = rec; H.active = id => active(rec(id));

/* ---------- renting / buying ---------- */
H.rent = function (pid) { const P = PROPS[pid], S = st(); if (!P) return false; if (!AV.txn(-P.rent, tr('Rent: ', 'Alquiler: ') + say(P.name))) return false; const r = S[pid] = S[pid] || { st: 'rent', until: AV.S.day - 1, wall: 0, floor: 0, items: [], stock: {} };
  if (r.st !== 'own') { r.st = 'rent'; r.until = Math.max(r.until, AV.S.day - 1) + P.days } AV.save(); AV.hud && AV.hud(); H.stats.rented = (H.stats.rented || 0) + 1; return true };
H.buy = function (pid) { const P = PROPS[pid], S = st(); if (!P) return false; const r = S[pid]; if (r && r.st === 'own') return false; if (!AV.txn(-P.price, tr('Bought: ', 'Comprado: ') + say(P.name))) return false;
  S[pid] = Object.assign(r || { wall: 0, floor: 0, items: [], stock: {} }, { st: 'own', until: 1e9 }); AV.save(); AV.hud && AV.hud(); return true };
const hud0 = AV.hud; if (hud0) AV.hud = function () { const out = hud0.apply(this, arguments); try { const el = document.getElementById('top'); if (!el) return out; const mine = Object.keys(st()).filter(id => active(rec(id)) && PROPS[id]);
  if (mine.length) { const r = rec(mine[0]); el.innerHTML = el.innerHTML.replace(tr('No home yet', 'Sin casa'), '🏠 ' + say(PROPS[mine[0]].name) + (r.st === 'own' ? tr(' (yours)', ' (tuyo)') : ' · ' + (r.until - AV.S.day + 1) + tr(' days left', ' días'))) } } catch (e) { } return out };

/* ---------- the street door: on a building facade near the anchor, with a free pavement in front ---------- */
function findDoor(W, P) { const anchors = (P.near ? [{ x: P.near[0], z: P.near[1] }] : []).concat(P.anchor.map(id => (W.places || []).find(p => p.id === id)).filter(Boolean)); let best = null, bd = 1e9;
  for (const a of anchors) for (const c of W.cols) { const cx = (c[0] + c[1]) / 2, cz = (c[2] + c[3]) / 2; if (Math.hypot(cx - a.x, cz - a.z) > 70 || (c[1] - c[0]) * (c[3] - c[2]) < 40) continue;   /* a real building, not a bench */
    for (const [fx, fz, nx, nz] of [[cx, c[3], 0, 1], [cx, c[2], 0, -1], [c[1], cz, 1, 0], [c[0], cz, -1, 0]]) for (const o of [-6, -2, 2, 6]) { const x = fx + (nz ? o : 0), z = fz + (nx ? o : 0); if (x < c[0] + 1 || x > c[1] - 1) if (nz) continue; if (z < c[2] + 1 || z > c[3] - 1) if (nx) continue;
      const ox = x + nx * .7, oz = z + nz * .7; if (W.surface(ox, oz) === null || !AV.isFree(W, ox, oz, .4) || !AV.isFree(W, x + nx * 2, z + nz * 2, .5) || (W.noStrangersAt && W.noStrangersAt(ox, oz)) || W.T.some(t => Math.hypot(t.x - ox, t.z - oz) < (P.near && Math.hypot(t.x - P.near[0], t.z - P.near[1]) < .5 ? 3 : 6))) continue;   /* never on a shopfront: no shop / bar interaction within 6 m */
      const d = Math.hypot(ox - a.x, oz - a.z); if (d < bd) { bd = d; best = { x, z, nx, nz, ox, oz } } } if (best) return best }
  return best }
function buildDoor(W, pid) { const P = PROPS[pid], dr = findDoor(W, P); H.stats.door = dr ? { x: +dr.ox.toFixed(1), z: +dr.oz.toFixed(1) } : null; if (!dr) { console.warn('housing: no door for', pid); return null }
  const K2 = AV.kit, ry = Math.atan2(dr.nx, dr.nz), y = W.surface(dr.ox, dr.oz) || 0, at = (o, h, sx, sy, sz, side) => K2.M(dr.x + dr.nx * o + Math.cos(ry) * (side || 0), y + h, dr.z + dr.nz * o - Math.sin(ry) * (side || 0), sx, sy, sz, 0, ry, 0);
  const parts = [[K2.BG.box, 0x4a2e1e, at(.3, 1.15, 1.2, 2.3, .08)], [K2.BG.box, 0xd8d0c0, at(.3, 2.42, 1.6, .2, .3)], [K2.BG.box, 0xd8d0c0, at(.3, 1.2, .18, 2.4, .3, -.7)], [K2.BG.box, 0xd8d0c0, at(.3, 1.2, .18, 2.4, .3, .7)], [K2.BG.box, 0x2a2a2e, at(.75, 2.75, 1.9, .08, 1.1)], [K2.BG.box, 0xc8a040, at(.36, 1.1, .05, .05, .05, .35)], [K2.BG.box, 0x8a8a8e, at(.36, 1.3, .14, .3, .04, -.95)], [K2.BG.box, 0x9a948a, at(.55, .07, 1.7, .14, .6)]];   /* door in a stone frame, glass canopy, brass knob, intercom, step */
  const m = new THREE.Mesh(K2.merge(parts), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .6 })); m.material.userData.lin = 1; W.ctx.group.add(m);
  const c = document.createElement('canvas'); c.width = 256; c.height = 96; const g = c.getContext('2d'); g.fillStyle = '#1a3a6a'; g.fillRect(0, 0, 256, 96); g.fillStyle = '#fff'; g.font = '900 44px Arial'; g.textAlign = 'center'; g.fillText('2B', 128, 52); g.font = '700 18px Arial'; g.fillStyle = '#ffd84a'; g.fillText(tr('FOR RENT · FOR SALE', 'SE ALQUILA · SE VENDE'), 128, 82);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; const sg = new THREE.Mesh(new THREE.PlaneGeometry(.75, .28), new THREE.MeshStandardMaterial({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .3 })); sg.position.set(dr.x + dr.nx * .46 + Math.cos(ry) * 1.25, y + 1.6, dr.z + dr.nz * .46 - Math.sin(ry) * 1.25); sg.rotation.y = ry; W.ctx.group.add(sg);
  W.T.push({ x: dr.ox, z: dr.oz, r: 1.6, label: () => { const r = rec(pid); return active(r) ? '🏠 ' + tr('Your flat: go in', 'Tu piso: entrar') + (r.st === 'rent' ? ' (' + (r.until - AV.S.day + 1) + tr(' days of rent left)', ' días de alquiler)') : '') : r ? '🏠 ' + tr('Rent ended: renew (', 'Alquiler terminado: renovar (') + P.rent + ')' : '🏠 ' + say(P.name) + tr(': rent ', ': alquilar ') + P.rent + '/' + P.days + tr(' days · buy ', ' días · comprar ') + P.price }, fn: () => active(rec(pid)) ? H.enter(pid) : H.panel(pid) });
  (W.places = W.places || []).push({ id: 'home_' + pid, name: [say(P.name), say(P.name)], x: dr.ox, z: dr.oz, yaw: ry + Math.PI }); return dr }

/* ---------- the interior (built on world enter, rebuilt after changes) ---------- */
function floorTex(i) { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  if (i === 0) { for (let y = 0; y < 256; y += 32) for (let x = 0; x < 256; x += 128) { const off = (y / 32) % 2 ? 64 : 0, v = 150 + ((x + y * 7) % 40); g.fillStyle = 'rgb(' + (v + 40) + ',' + (v + 10) + ',' + (v - 30) + ')'; g.fillRect((x + off) % 256, y, 126, 30); g.fillRect(((x + off) % 256) - 256, y, 126, 30) } }
  else if (i === 1) { for (let y = 0; y < 256; y += 64) for (let x = 0; x < 256; x += 64) { const v = 170 + ((x * 3 + y) % 30); g.fillStyle = 'rgb(' + v + ',' + (v - 70) + ',' + (v - 110) + ')'; g.fillRect(x + 2, y + 2, 60, 60) } }
  else if (i === 2) { g.fillStyle = '#8a7a9a'; g.fillRect(0, 0, 256, 256); for (let k = 0; k < 3000; k++) { g.fillStyle = 'rgba(255,255,255,' + (Math.random() * .08) + ')'; g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2) } }
  else { g.fillStyle = '#9a9a96'; g.fillRect(0, 0, 256, 256); for (let k = 0; k < 400; k++) { g.fillStyle = 'rgba(40,40,40,' + (Math.random() * .1) + ')'; g.beginPath(); g.arc(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 5, 0, TAU); g.fill() } }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 2.5); t.encoding = THREE.sRGBEncoding; return t }
function bounds(pid) { const R = PROPS[pid].room; return { x0: R.x - R.w / 2, x1: R.x + R.w / 2, z0: R.z - R.d / 2, z1: R.z + R.d / 2 } }
const KITCHEN = (b) => [b.x0, b.x0 + 3.2, b.z0, b.z0 + .9];   /* fixed kitchenette along the back wall, left */
const DOORZ = (b) => [(b.x0 + b.x1) / 2 - 1.1, (b.x0 + b.x1) / 2 + 1.1, b.z1 - 1.4, b.z1];
function footprint(it) { const C = CAT[it.k], c = Math.abs(Math.cos(it.ry)), s = Math.abs(Math.sin(it.ry)), hw = (C.w * c + C.d * s) / 2, hd = (C.w * s + C.d * c) / 2; return [it.x - hw, it.x + hw, it.z - hd, it.z + hd] }
const ovl = (a, b) => a[0] < b[1] && a[1] > b[0] && a[2] < b[3] && a[3] > b[2];
H.fits = function (pid, it, skip) { const r = rec(pid), b = bounds(pid), C = CAT[it.k]; if (!C || C.wall) return true; const f = footprint(it);
  if (f[0] < b.x0 + .15 || f[1] > b.x1 - .15 || f[2] < b.z0 + .15 || f[3] > b.z1 - .15) return false; if (ovl(f, KITCHEN(b)) || ovl(f, DOORZ(b))) return false;
  if (!C.flat) for (const o of r.items) if (o !== skip && !CAT[o.k].wall && !CAT[o.k].flat && ovl(f, footprint(o))) return false; return true };
function buildRoom(W, pid) { const r = rec(pid), P = PROPS[pid], b = bounds(pid), R = P.room, ctx = W.ctx, Kt = AV.kit; if (H.live && H.live.grp) { H.live.grp.parent && H.live.grp.parent.remove(H.live.grp); for (const t of H.live.T) { const i = W.T.indexOf(t); if (i >= 0) W.T.splice(i, 1) } H.live.cols.forEach(c => { const i = W.cols.indexOf(c); if (i >= 0) W.cols.splice(i, 1) }) }
  const grp = new THREE.Group(); grp.name = 'home_' + pid; ctx.group.add(grp); const T = [], cols = [], addCol = c => { cols.push(c); W.cols.push(c) };
  const wallM = new THREE.MeshStandardMaterial({ color: WALLS[r.wall || 0][0], roughness: .9 }); wallM.color.convertSRGBToLinear(); const fm = new THREE.MeshStandardMaterial({ map: floorTex(r.floor || 0), roughness: r.floor === 3 ? .35 : .75 });
  const box = (x, y, z, sx, sy, sz, m) => { const o = new THREE.Mesh(Kt.BG.box, m); o.position.set(x, y, z); o.scale.set(sx, sy, sz); grp.add(o); return o };
  box(R.x, -.02, R.z, R.w, .04, R.d, fm); box(R.x, R.h + .05, R.z, R.w + .4, .1, R.d + .4, new THREE.MeshStandardMaterial({ color: 0xf4f0ea, roughness: .95 }));
  const t = .2, mid = (b.x0 + b.x1) / 2; box(R.x, R.h / 2, b.z0 - t / 2, R.w + .4, R.h, t, wallM); box(b.x0 - t / 2, R.h / 2, R.z, t, R.h, R.d, wallM); box(b.x1 + t / 2, R.h / 2, R.z, t, R.h, R.d, wallM);
  box((b.x0 + mid - .6) / 2, R.h / 2, b.z1 + t / 2, mid - .6 - b.x0, R.h, t, wallM); box((b.x1 + mid + .6) / 2, R.h / 2, b.z1 + t / 2, b.x1 - mid - .6, R.h, t, wallM); box(mid, R.h - .35, b.z1 + t / 2, 1.2, .7, t, wallM);
  addCol([b.x0 - .5, b.x1 + .5, b.z0 - .5, b.z0]); addCol([b.x0 - .5, b.x0, b.z0, b.z1 + .5]); addCol([b.x1, b.x1 + .5, b.z0, b.z1 + .5]); addCol([b.x0, mid - .6, b.z1, b.z1 + .5]); addCol([mid + .6, b.x1, b.z1, b.z1 + .5]); addCol([mid - .6, mid + .6, b.z1 + .45, b.z1 + .6]);
  box(mid, 1.05, b.z1 + .12, 1.15, 2.1, .06, new THREE.MeshStandardMaterial({ color: 0x4a2e1e, roughness: .6 }));   /* the flat door (inside) */
  /* window onto the city (east wall) + kitchenette */
  box(b.x1 - .02, 1.65, R.z - .3, .04, 1.5, 3.2, new THREE.MeshBasicMaterial({ color: 0x9ac0e8 })); box(b.x1 - .05, 1.65, R.z - .3, .06, 1.6, .06, new THREE.MeshStandardMaterial({ color: 0xf4f0ea }));
  const kp = [[Kt.BG.box, 0xe8e4dc, Kt.M(b.x0 + 1.6, .45, b.z0 + .42, 3.2, .9, .84)], [Kt.BG.box, 0x3a3a3e, Kt.M(b.x0 + 1.6, .92, b.z0 + .42, 3.24, .04, .88)], [Kt.BG.box, 0x9aa0a8, Kt.M(b.x0 + 2.4, .95, b.z0 + .45, .6, .02, .4)], [Kt.BG.box, 0x1e1e22, Kt.M(b.x0 + .9, .95, b.z0 + .45, .55, .02, .45)], [Kt.BG.box, 0xe8e4dc, Kt.M(b.x0 + 1.6, 2.1, b.z0 + .2, 3.2, .7, .4)], [Kt.BG.box, 0xd0d4d8, Kt.M(b.x0 + .3, 1, b.z0 + .38, .6, 2, .7)]];
  const km = new THREE.Mesh(Kt.merge(kp), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .6 })); km.material.userData.lin = 1; grp.add(km); addCol(KITCHEN(b));
  const light = new THREE.PointLight(0xffe8c8, .9, 14, 2); light.position.set(R.x, R.h - .3, R.z); grp.add(light); box(R.x, R.h - .05, R.z, .6, .04, .6, new THREE.MeshBasicMaterial({ color: 0xfff4dc }));
  /* furniture */
  const vm = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .7 }); vm.userData.lin = 1;
  for (const it of r.items) { const C = CAT[it.k]; if (!C) continue;
    if (C.wall) { const d = AV.merch && AV.merch.design(it.d) ? it.d : (AV.MERCH && AV.MERCH.designs[0] && AV.MERCH.designs[0].id); const s2 = C.size, pl = new THREE.Mesh(new THREE.PlaneGeometry(s2, s2), new THREE.MeshStandardMaterial({ map: AV.merch ? AV.merch.artTex(d) : null, roughness: .6 }));
      pl.position.set(it.x, it.y || 1.7, it.z); pl.rotation.y = it.ry; grp.add(pl); if (C.frame) { const fr = new THREE.Mesh(Kt.BG.box, new THREE.MeshStandardMaterial({ color: 0x1a1a1a })); fr.scale.set(s2 + .1, s2 + .1, .03); fr.position.copy(pl.position).add(new THREE.Vector3(-Math.sin(it.ry) * .02, 0, -Math.cos(it.ry) * .02)); fr.rotation.y = it.ry; grp.add(fr) }
      T.push({ x: it.x + Math.sin(it.ry) * .9, z: it.z + Math.cos(it.ry) * .9, r: 1, label: () => C.ic + ' ' + say(C.n) + tr(': move / store', ': mover / guardar'), fn: () => itemMenu(pid, it) }); continue }
    const o = new THREE.Mesh(geoOf(it.k), vm); o.position.set(it.x, 0, it.z); o.rotation.y = it.ry; grp.add(o);
    if (!C.flat) { const f = footprint(it); addCol([f[0] + .05, f[1] - .05, f[2] + .05, f[3] - .05]) }
    if (C.glow) { const gl = new THREE.PointLight(0xffe2b0, .7 + (AV.nightK || 0) * .6, 6, 2); gl.position.set(it.x, 1.6, it.z); grp.add(gl) }
    const front = [it.x + Math.sin(it.ry) * (C.d / 2 + .55), it.z + Math.cos(it.ry) * (C.d / 2 + .55)];
    T.push({ x: front[0], z: front[1], r: .9, label: () => C.ic + ' ' + say(C.n) + (C.act === 'sleep' ? tr(': sleep · move', ': dormir · mover') : C.act === 'wardrobe' ? tr(': change clothes · move', ': cambiarte · mover') : C.act === 'music' ? tr(': play music · move', ': poner música · mover') : tr(': move / rotate / store', ': mover / girar / guardar')), fn: () => itemMenu(pid, it) }) }
  /* exit + home menu */
  T.push({ x: mid, z: b.z1 - .7, r: 1.1, label: () => tr('🚪 Leave the flat', '🚪 Salir del piso'), fn: () => H.leave(pid) });
  T.push({ x: b.x0 + 3.9, z: b.z0 + 1.2, r: 1.1, label: () => tr('🛠 Decorate: furniture, walls, floor (H)', '🛠 Decorar: muebles, paredes, suelo (H)'), fn: () => H.panel(pid) });
  T.forEach(t => W.T.push(t)); H.live = { pid, grp, T, cols, W, b };
  /* the room has ground (it lies outside the city map) */
  if (!W.__homeSurf) { const s0 = W.surface; W.__homeSurf = true; W.surface = (x, z) => { for (const id in PROPS) { if (PROPS[id].w !== W.id) continue; const q = bounds(id); if (x > q.x0 - .5 && x < q.x1 + .5 && z > q.z0 - .5 && z < q.z1 + 1) return 0 } return s0(x, z) } } }

/* ---------- placement: the piece follows your gaze on the floor ---------- */
let pl = null; const bar = document.createElement('div'); bar.id = 'homePlace'; bar.style.cssText = 'position:fixed;left:50%;bottom:calc(86px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:7;display:none;gap:8px;background:rgba(18,10,34,.88);border:1px solid #ffd84a;border-radius:12px;padding:8px 12px;color:#fff;font:600 14px system-ui,sans-serif;align-items:center';
bar.innerHTML = '<span id="hpN"></span><button id="hpR">⟳ Q</button><button id="hpP">✔ Enter</button><button id="hpC">✖ Backspace</button>'; document.body.appendChild(bar);
H.startPlace = function (pid, k, moving) { const C = CAT[k]; if (!C || !H.live || H.live.pid !== pid) return false; H.cancelPlace(); const ghost = C.wall ? new THREE.Mesh(new THREE.PlaneGeometry(C.size, C.size), new THREE.MeshBasicMaterial({ color: 0x7aff8a, transparent: true, opacity: .55, side: THREE.DoubleSide })) : new THREE.Mesh(geoOf(k), new THREE.MeshBasicMaterial({ color: 0x7aff8a, transparent: true, opacity: .45, depthWrite: false }));
  H.live.grp.add(ghost); pl = { pid, k, ry: moving ? moving.ry : 0, ghost, moving: moving || null, it: { k, x: 0, z: 0, ry: 0 }, ok: false, d: moving ? moving.d : (H.ui && H.ui.design) }; bar.style.display = 'flex'; document.getElementById('hpN').textContent = C.ic + ' ' + say(C.n); return true };
H.cancelPlace = function () { if (!pl) return; pl.ghost.parent && pl.ghost.parent.remove(pl.ghost); if (pl.moving) { pl.moving.hidden = false } pl = null; bar.style.display = 'none' };
H.rotatePlace = () => { if (pl) pl.ry = (pl.ry + Math.PI / 2) % TAU };
H.commitPlace = function () { if (!pl || !pl.ok) { if (pl) AV.toast(tr('It does not fit there.', 'Ahí no cabe.')); return false } const r = rec(pl.pid), it = pl.it;
  if (pl.moving) Object.assign(pl.moving, { x: it.x, z: it.z, ry: it.ry, y: it.y }); else { if (!(r.stock[pl.k] > 0)) return false; r.stock[pl.k]--; r.items.push(Object.assign({}, it, pl.d && CAT[pl.k].wall ? { d: pl.d } : {})) }
  const pid = pl.pid; H.cancelPlace(); AV.save(); buildRoom(AV.W, pid); H.stats.placed = (H.stats.placed || 0) + 1; return true };
document.getElementById('hpR').onclick = H.rotatePlace; document.getElementById('hpP').onclick = H.commitPlace; document.getElementById('hpC').onclick = H.cancelPlace;
AV.keymap = AV.keymap || {}; const kQ = AV.keymap.KeyQ; AV.keymap.KeyQ = e => { if (pl) H.rotatePlace(); else if (kQ) kQ(e) };
const kEn = AV.keymap.Enter; AV.keymap.Enter = e => { if (pl) H.commitPlace(); else if (kEn) kEn(e) }; const kBs = AV.keymap.Backspace; AV.keymap.Backspace = e => { if (pl) H.cancelPlace(); else if (kBs) kBs(e) };
const kH = AV.keymap.KeyH; AV.keymap.KeyH = e => { if (kH) kH(e); if (!AV.blocking() && H.live) H.panel(H.live.pid) };
AV.frameFns.push(() => { if (!pl || !H.live) return; const P = AV.P, b = H.live.b, C = CAT[pl.k], f = [-Math.sin(P.yaw), -Math.cos(P.yaw)];
  if (C.wall) { /* hang it on the wall you face */ let best = null; for (const [x, z, ry, sx, sz] of [[null, b.z0 + .03, 0, 1, 0], [b.x0 + .03, null, Math.PI / 2, 0, 1], [b.x1 - .03, null, -Math.PI / 2, 0, 1]]) { const t = x == null ? (z - P.z) / (f[1] || 1e-6) : (x - P.x) / (f[0] || 1e-6); if (t <= .2 || t > 9) continue; const hx = x == null ? P.x + f[0] * t : x, hz = z == null ? P.z + f[1] * t : z; if (!best || t < best.t) best = { t, x: hx, z: hz, ry } }
    if (best) { const s2 = C.size / 2, x = Math.max(b.x0 + s2 + .1, Math.min(b.x1 - s2 - .1, best.x)), z = Math.max(b.z0 + s2 + .1, Math.min(b.z1 - s2 - .1, best.z)), kit = best.ry === 0 && x < b.x0 + 3.4; pl.it = { k: pl.k, x, z, ry: best.ry, y: kit ? 2.75 : 1.7 }; pl.ok = !kit } else pl.ok = false }
  else { const x = Math.round((P.x + f[0] * 2.3) * 4) / 4, z = Math.round((P.z + f[1] * 2.3) * 4) / 4; pl.it = { k: pl.k, x, z, ry: pl.ry }; pl.ok = H.fits(pl.pid, pl.it, pl.moving) }
  pl.ghost.position.set(pl.it.x, C.wall ? pl.it.y || 1.7 : .01, pl.it.z); pl.ghost.rotation.y = pl.it.ry; pl.ghost.material.color.setHex(pl.ok ? 0x7aff8a : 0xff4a4a) });

/* ---------- item menu: sleep / wardrobe / music / move / rotate / store ---------- */
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
function itemMenu(pid, it) { const C = CAT[it.k], r = rec(pid); let h = '<b>' + C.ic + ' ' + esc(say(C.n)) + '</b><div class="row" style="flex-wrap:wrap;gap:6px;margin:8px 0">';
  if (C.act === 'sleep') h += '<button data-a="sleep">😴 ' + tr('Sleep until 08:00 (home = respawn)', 'Dormir hasta las 08:00 (casa = punto de inicio)') + '</button>';
  if (C.act === 'wardrobe') h += '<button data-a="ward">👕 ' + tr('Change clothes', 'Cambiarte de ropa') + '</button>';
  if (C.act === 'music') h += '<button data-a="music">🎶 ' + tr('Choose a record', 'Elegir un disco') + '</button>';
  h += '<button data-a="move">✋ ' + tr('Move', 'Mover') + '</button>' + (C.wall ? '' : '<button data-a="rot">⟳ ' + tr('Rotate', 'Girar') + '</button>') + '<button data-a="store">📦 ' + tr('Store', 'Guardar') + '</button></div><div class="row"><button data-close>' + tr('Done', 'Listo') + '</button></div>';
  const p = AV.panel('cmp', h); p.querySelectorAll('[data-a]').forEach(b => b.onclick = () => { const a = b.dataset.a; AV.closePanel('cmp');
    if (a === 'sleep') H.sleep(pid); else if (a === 'ward') wardrobe(); else if (a === 'music') music(pid, it);
    else if (a === 'move') { it.hidden = true; H.startPlace(pid, it.k, it) } else if (a === 'rot') { const o = Object.assign({}, it, { ry: (it.ry + Math.PI / 2) % TAU }); if (H.fits(pid, o, it)) { it.ry = o.ry; AV.save(); buildRoom(AV.W, pid) } else AV.toast(tr('No room to turn it here.', 'Aquí no se puede girar.')) }
    else if (a === 'store') { r.items.splice(r.items.indexOf(it), 1); r.stock[it.k] = (r.stock[it.k] || 0) + 1; AV.save(); buildRoom(AV.W, pid) } }) }
H.sleep = function (pid) { const S = AV.S; S.day++; S.time = 8 * 60; S.homeSpawn = pid; if (AV.vitals && AV.vitals.add) try { AV.vitals.add(25, 0) } catch (e) { } AV.save(); AV.hud && AV.hud(); AV.fadeTo(1, 300); setTimeout(() => AV.fadeTo(0, 700), 700); AV.toast(tr('Slept in your own bed. Good morning! (You will wake up here.)', 'Dormiste en tu cama. ¡Buenos días! (Despertarás aquí.)')); H.stats.slept = (H.stats.slept || 0) + 1 };
function wardrobe() { const MC = AV.merch; if (!MC) return; const own = Object.keys(AV.S.items || {}).filter(k => /^wear_/.test(k) && AV.S.items[k] > 0 && AV.ITEMS[k] && AV.ITEMS[k].merch);
  let h = '<b>🚪 ' + tr('Wardrobe', 'Armario') + '</b><div class="bgrid">' + (own.length ? own.map(k => { const m = AV.ITEMS[k].merch, d = MC.design(m.design); return '<div class="bitem"><div class="bic"><img alt="" src="' + d.thumb + '" style="width:40px;border-radius:6px"></div><div class="bnm">' + esc(tr(AV.ITEMS[k].n[0], AV.ITEMS[k].n[1])) + '</div><div class="bbt"><button data-w="' + k + '">' + tr('Wear', 'Ponérmela') + '</button></div></div>' }).join('') : '<div class="note">' + tr('No clothes yet: the APEVERSE, MOONMELT, SOLTERRA and ZtonedApe stores sell them.', 'Aún no tienes ropa: la venden las tiendas APEVERSE, MOONMELT, SOLTERRA y ZtonedApe.') + '</div>') + '</div><div class="row"><button id="hwOff">' + tr('Take off', 'Quitármela') + '</button><button data-close>' + tr('Done', 'Listo') + '</button></div>';
  const p = AV.panel('cmp', h); p.querySelectorAll('[data-w]').forEach(b => b.onclick = () => { const m = AV.ITEMS[b.dataset.w].merch; MC.equip(m.design, m.garment); AV.closePanel('cmp'); AV.toast(tr('Changed clothes.', 'Te has cambiado.')) }); const o = document.getElementById('hwOff'); if (o) o.onclick = () => { MC.takeOff(); AV.closePanel('cmp') } }
let music0 = null;
/* the record player only offers records whose files exist in this build, and confirms real playback (no silent fake) */
const avail = {}; const probe = k => avail[k] != null ? Promise.resolve(avail[k]) : fetch(AV.MUSIC[k].tracks[0].file, { method: 'HEAD' }).then(r => avail[k] = r.ok).catch(() => avail[k] = false);
async function music(pid, it) { const lists = Object.keys(AV.MUSIC || {}); await Promise.all(lists.map(probe)); H.stats.records = Object.assign({}, avail);
  let h = '<b>🎶 ' + tr('Record player', 'Tocadiscos') + '</b><div class="bgrid">' + lists.map(k => '<div class="bitem"><div class="bic">💿</div><div class="bnm">' + esc(AV.MUSIC[k].name || k) + '<small>' + (avail[k] ? AV.MUSIC[k].tracks.length + tr(' tracks', ' temas') : tr('files not in this build', 'archivos no incluidos en esta versión')) + '</small></div><div class="bbt"><button data-m="' + k + '"' + (avail[k] ? '' : ' disabled') + '>' + tr('Play', 'Poner') + '</button></div></div>').join('') + '</div><div class="row"><button id="hmOff">' + tr('Stop the record', 'Parar el disco') + '</button><button data-close>' + tr('Done', 'Listo') + '</button></div>';
  const p = AV.panel('cmp', h), W = AV.W; p.querySelectorAll('[data-m]:not([disabled])').forEach(b => b.onclick = () => { const k = b.dataset.m; if (music0 === null) music0 = W.music || false; W.music = { playlist: k, pos: { x: it.x, y: 1, z: it.z }, bed: .25 }; AV.audio && AV.audio.setWorld && AV.audio.setWorld(W); H.stats.playing = k; AV.closePanel('cmp');
    setTimeout(() => { const np = AV.audio && AV.audio.nowPlaying && AV.audio.nowPlaying(); H.stats.nowPlaying = np; AV.toast(np && np.playing ? '🎶 ' + np.title + ' · ' + (AV.MUSIC[k].name || k) : tr('The record would not start (music off or blocked by the browser).', 'El disco no arranca (música apagada o bloqueada por el navegador).')) }, 2500) });
  document.getElementById('hmOff').onclick = () => { stopMusic(); AV.closePanel('cmp') } }
function stopMusic() { const W = AV.W; if (music0 === null || !W) return; W.music = music0 || undefined; music0 = null; AV.audio && AV.audio.setWorld && AV.audio.setWorld(W); H.stats.playing = null }

/* ---------- enter / leave ---------- */
H.enter = function (pid) { const P = PROPS[pid], W = AV.W; if (!W || W.id !== P.w || !active(rec(pid))) return false; if (!H.live || H.live.pid !== pid) buildRoom(W, pid); const b = H.live.b;
  AV.fadeTo(1, 250); setTimeout(() => { const p = AV.P; p.x = (b.x0 + b.x1) / 2; p.z = b.z1 - 1.2; p.y = 0; p.vx = p.vz = 0; p.yaw = 0; AV.fadeTo(0, 450) }, 270); H.inside = pid; H.stats.entered = (H.stats.entered || 0) + 1; return true };
H.leave = function (pid) { const dr = H.door, W = AV.W; H.cancelPlace(); stopMusic(); H.inside = null; if (!dr || !W) return false; AV.fadeTo(1, 250); setTimeout(() => { const p = AV.P; p.x = dr.ox + dr.nx * .6; p.z = dr.oz + dr.nz * .6; p.y = W.surface(p.x, p.z) || 0; p.yaw = Math.atan2(-dr.nx, -dr.nz) + Math.PI; AV.fadeTo(0, 450) }, 270); return true };

/* ---------- the home panel: rent / buy, furniture shop + stock, walls, floor ---------- */
H.panel = function (pid) { pid = pid || Object.keys(PROPS).find(id => PROPS[id].w === (AV.W && AV.W.id)); const P = PROPS[pid]; if (!P) return; const r = rec(pid), ui = H.ui = H.ui || { design: null };
  let h = '<b>🏠 ' + esc(say(P.name)) + '</b> · ' + tr('Credits', 'Créditos') + ': <b>' + AV.S.money + '</b>';
  if (!active(r)) { h += '<div class="note">' + tr('A bright one-bedroom flat with a kitchenette and a big window over the barrio. Furnish it your way.', 'Un piso luminoso con cocina americana y un ventanal al barrio. Amuéblalo a tu manera.') + (r ? '<br>' + tr('Your furniture is waiting inside.', 'Tus muebles te esperan dentro.') : '') + '</div><div class="row"><button id="hRent">' + tr('Rent ', 'Alquilar ') + P.days + tr(' days · ', ' días · ') + P.rent + '</button><button id="hBuy">' + tr('Buy · ', 'Comprar · ') + P.price + '</button><button data-close>' + tr('Not now', 'Ahora no') + '</button></div>' }
  else {
    h += '<div class="note">' + (r.st === 'own' ? tr('You own this flat.', 'Este piso es tuyo.') : tr('Rented: ', 'Alquilado: ') + (r.until - AV.S.day + 1) + tr(' days left · ', ' días · ') + '<a href="#" id="hRent">' + tr('extend ', 'ampliar ') + P.days + tr(' days (', ' días (') + P.rent + ')</a> · <a href="#" id="hBuy">' + tr('buy (', 'comprar (') + P.price + ')</a>') + '</div>';
    h += '<div class="pp-sec">' + tr('Furniture shop · your stock', 'Tienda de muebles · tu almacén') + '</div><div class="bgrid">' + ORDER.map(k => { const C = CAT[k], n = r.stock[k] || 0; return '<div class="bitem"><div class="bic">' + C.ic + '</div><div class="bnm">' + esc(say(C.n)) + ' <b>' + C.p + '</b><small>' + tr('in stock: ', 'en almacén: ') + n + '</small></div><div class="bbt"><button data-b="' + k + '">' + tr('Buy', 'Comprar') + '</button>' + (n > 0 && H.live && H.live.pid === pid && H.inside === pid ? '<button data-p="' + k + '">' + tr('Place', 'Colocar') + '</button>' : '') + '</div></div>' }).join('') + '</div>';
    const owned = AV.MERCH ? AV.MERCH.designs.filter(d => AV.merch && (AV.merch.owns(d.id, 'tee') || AV.merch.owns(d.id, 'hoodie'))) : [], pick = owned.length ? owned : (AV.MERCH ? AV.MERCH.designs.slice(0, 8) : []);
    if (pick.length) h += '<div class="pp-sec">' + tr('Poster / print design', 'Diseño del póster / lámina') + '</div><div class="row" style="flex-wrap:wrap;gap:4px">' + pick.slice(0, 12).map(d => '<img alt="" data-dz="' + d.id + '" src="' + d.thumb + '" style="width:44px;border-radius:6px;cursor:pointer;outline:' + ((ui.design || pick[0].id) === d.id ? '2px solid #ffd84a' : 'none') + '">').join('') + '</div>';
    h += '<div class="pp-sec">' + tr('Walls', 'Paredes') + '</div><div class="row" style="flex-wrap:wrap;gap:6px">' + WALLS.map((w, i) => '<span data-wc="' + i + '" title="' + esc(say(w[1])) + '" style="display:inline-block;width:26px;height:26px;border-radius:50%;cursor:pointer;background:#' + w[0].toString(16).padStart(6, '0') + ';outline:' + ((r.wall || 0) === i ? '2px solid #ffd84a' : '1px solid #fff4') + '"></span>').join('') + '</div>';
    h += '<div class="pp-sec">' + tr('Floor', 'Suelo') + '</div><div class="row" style="flex-wrap:wrap;gap:6px">' + FLOORS.map((f, i) => '<button data-fl="' + i + '" class="' + ((r.floor || 0) === i ? 'on' : '') + '">' + esc(say(f)) + '</button>').join('') + '</div>';
    h += '<div class="note">' + tr('Place: the piece follows your gaze · Q rotate · Enter place · Backspace cancel. Use a placed piece (E) to move, rotate or store it.', 'Colocar: el mueble sigue tu mirada · Q girar · Enter colocar · Retroceso cancelar. Usa un mueble (E) para moverlo, girarlo o guardarlo.') + '</div><div class="row"><button data-close>' + tr('Done', 'Listo') + '</button></div>' }
  const p = AV.panel('cmp', h), $ = id => document.getElementById(id);
  if ($('hRent')) $('hRent').onclick = e => { e.preventDefault(); if (H.rent(pid)) { H.panel(pid); if (!H.inside) setTimeout(() => { AV.closePanel('cmp'); H.enter(pid) }, 300) } };
  if ($('hBuy')) $('hBuy').onclick = e => { e.preventDefault(); if (H.buy(pid)) H.panel(pid) };
  p.querySelectorAll('[data-b]').forEach(b => b.onclick = () => { const k = b.dataset.b; if (AV.txn(-CAT[k].p, say(CAT[k].n))) { r.stock[k] = (r.stock[k] || 0) + 1; AV.save(); H.panel(pid) } });
  p.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { AV.closePanel('cmp'); H.startPlace(pid, b.dataset.p) });
  p.querySelectorAll('[data-dz]').forEach(b => b.onclick = () => { ui.design = b.dataset.dz; H.panel(pid) });
  p.querySelectorAll('[data-wc]').forEach(b => b.onclick = () => { r.wall = +b.dataset.wc; AV.save(); if (H.live && H.live.pid === pid) buildRoom(AV.W, pid); H.panel(pid) });
  p.querySelectorAll('[data-fl]').forEach(b => b.onclick = () => { r.floor = +b.dataset.fl; AV.save(); if (H.live && H.live.pid === pid) buildRoom(AV.W, pid); H.panel(pid) }) };

/* ---------- world hooks: door + interior on enter; a fresh session wakes up at home after sleeping there ---------- */
let booted = false;
const prevEnter = AV.onWorldEnter; AV.onWorldEnter = function (W, a, b) { if (prevEnter) prevEnter(W, a, b); H.live = null; H.inside = null; H.door = null; pl = null; bar.style.display = 'none'; music0 = null;
  for (const pid in PROPS) { if (PROPS[pid].w !== W.id || !W.ctx) continue; try { H.door = buildDoor(W, pid); if (rec(pid)) buildRoom(W, pid) } catch (e) { console.warn('housing failed', e); H.stats.err = String(e) } }
  if (!booted) { booted = true; const sp = AV.S.homeSpawn; if (sp && PROPS[sp] && PROPS[sp].w === W.id && active(rec(sp))) setTimeout(() => H.enter(sp), 600) } };
})(window.AV);
