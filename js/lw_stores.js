/* APEVERSE 2.3 - lw_stores.js : walk-in convenience stores, first: the Thai "7-ELEVAPE" (a recognisable 7-Eleven-style parody).
   Owner playtest: "replace the generic Thai minimarts with recognizable 7-Eleven storefronts ... genuinely accessible and functional".
   LICENSING FLAG: 7-Eleven's name, logo and stripes are trademarks.  This build uses the parody mark "7-ELEVAPE" with the familiar
   white fascia, orange / green / red stripes and big 7.  Clear the real marks before any public or commercial release.
   Each store is a real building placed on a free lot near a named place: glass front with aluminium frames + automatic door gap,
   lit fascia, AC unit, fridges along the back wall (lit, stocked), two shelf gondolas (instanced products), a counter with a clerk,
   promo posters on the glass, scooters parked outside.  At the counter you order: the clerk rings it up (heats the toastie), hands it
   over, and it is in your hand (U eats / drinks it, sip by sip via Consumables 2.0).  Beer only 11:00-14:00 and 17:00-24:00 (Thai rule).
   LW.stores.build(W, spec) is reusable for other brands (Milestone D).  LW.stores.list = built stores this world. */
'use strict';
(function (AV) {
const tr = AV.tr, LW = AV.LW, L = LW.L, say = LW.say, esc = LW.esc;
const ST = LW.stores = { list: [], stats: { built: 0, failed: 0, sold: 0 } };
/* ---------- products ---------- */
Object.assign(AV.ITEMS, {
  lw_toastie: { n: ['Ham & cheese toastie', 'Sándwich tostado de jamón y queso'], cat: 'food', ic: '🥪', use: 'eat', model: 'card', col: 0xe8c070, say: ['Molten cheese, paper-thin ham, burnt fingers. Perfect.', 'Queso fundido, jamón finísimo, dedos quemados. Perfecto.'], price: 25 },
  lw_icecream: { n: ['Ice-cream cone', 'Cucurucho de helado'], cat: 'food', ic: '🍦', use: 'eat', model: 'fruit', col: 0xffe0f0, say: ['Cold, sweet, already melting down your hand.', 'Frío, dulce y ya derritiéndose por tu mano.'], price: 15 },
  lw_cola: { n: ['Cola can', 'Lata de cola'], cat: 'drink', ic: '🥤', use: 'drink', fx: { type: 'buzz', amt: .15 }, model: 'can', col: 0xd02a2a, say: ['Fizzy, sugary, ice cold.', 'Con gas, azucarada, helada.'], price: 12 },
  lw_energy: { n: ['M-APE energy shot', 'Chupito energético M-APE'], cat: 'drink', ic: '⚡', use: 'drink', fx: { type: 'buzz', amt: .3 }, model: 'bottle', col: 0xd8a020, say: ['Tastes like cough syrup and ambition.', 'Sabe a jarabe para la tos y a ambición.'], price: 15 },
  lw_rice: { n: ['Microwave basil rice', 'Arroz con albahaca al microondas'], cat: 'food', ic: '🍱', use: 'eat', model: 'bowl', col: 0xe85a2a, say: ['Krapow in a box. Surprisingly great.', 'Krapow en caja. Sorprendentemente bueno.'], price: 35 },
  lw_coffee711: { n: ['All Café iced latte', 'Café con leche helado All Café'], cat: 'drink', ic: '🧋', use: 'drink', fx: { type: 'buzz', amt: .2 }, model: 'coffee', col: 0xc8a070, say: ['Sweet, milky, very Thai.', 'Dulce, con leche, muy tailandés.'], price: 30 } });
const MENU711 = [['lw_toastie', 25, 1.6], ['lw_rice', 35, 2], ['lw_icecream', 15], ['lw_cola', 12], ['water', 10], ['thai_tea', 15], ['lw_coffee711', 30, 1], ['lw_energy', 15], ['crisps', 4], ['snack', 20], ['beer', 40]];
/* ---------- textures ---------- */
const TX = {};
const ctex = (k, w, h, fn) => { if (TX[k]) return TX[k]; const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; t.userData = { keep: true }; return TX[k] = t };
const fascia711 = () => ctex('f711', 1024, 160, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); const sh = h / 3; [['#f47b20', 0], ['#00905a', 1], ['#e1251b', 2]].forEach(([c, i]) => { g.fillStyle = c; g.fillRect(0, i * sh, 300, sh) });
  g.fillStyle = '#ffffff'; g.fillRect(40, 18, 220, 124); g.fillStyle = '#f47b20'; g.font = 'bold 120px Arial Black, Arial'; g.textAlign = 'center'; g.fillText('7', 150, 132); g.strokeStyle = '#e1251b'; g.lineWidth = 4; g.strokeText('7', 150, 132);
  g.fillStyle = '#00905a'; g.font = 'bold 86px Arial Black, Arial'; g.textAlign = 'left'; g.fillText('ELEVAPE', 330, 112); g.fillStyle = '#e1251b'; g.fillRect(330, 124, 560, 8); g.fillStyle = '#555'; g.font = '22px Arial'; g.fillText('OPEN 24 HOURS · ' + 'เปิด 24 ชั่วโมง', 334, 152) });
const poster = i => ctex('p711_' + i, 256, 360, (g, w, h) => { const P = [['#ffd400', '#e1251b', 'TOASTIE', '25¢', '🥪'], ['#00905a', '#ffffff', 'ALL CAFÉ', 'ICED LATTE 30¢', '🧋'], ['#e1251b', '#ffffff', 'SLURPEE-ISH', 'BRAIN FREEZE', '🥤'], ['#f47b20', '#ffffff', 'M-APE', 'POWER UP!', '⚡']][i % 4];
  g.fillStyle = P[0]; g.fillRect(0, 0, w, h); g.fillStyle = P[1]; g.font = 'bold 40px Arial Black, Arial'; g.textAlign = 'center'; g.fillText(P[2], w / 2, 70); g.font = '120px serif'; g.fillText(P[4], w / 2, 220); g.font = 'bold 34px Arial'; g.fillText(P[3], w / 2, 310) });
/* ---------- free lot search: an axis-aligned w x d rectangle on walkable, flat, empty ground near (ax, az), front facing the anchor ---------- */
const segD = (px, pz, r) => { const dx = r[2] - r[0], dz = r[3] - r[1], l2 = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((px - r[0]) * dx + (pz - r[1]) * dz) / l2)); return Math.hypot(px - r[0] - dx * t, pz - r[1] - dz * t) };
const onRoad = (W, x, z) => (W.mapRoads || []).some(r => segD(x, z, r) < (r[4] || 6) / 2 + .8);   /* never build on a carriageway (traffic drives there) */
function lot(W, ax, az, w, d, tries) { const R = (x, z) => W.surface(x, z); for (let r = 8; r <= 70; r += 4) for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2 + r * .1, cx = ax + Math.cos(a) * r, cz = az + Math.sin(a) * r;
    const ry = Math.round(Math.atan2(ax - cx, az - cz) / (Math.PI / 2)) * (Math.PI / 2), wx = Math.abs(Math.sin(ry)) > .5 ? d : w, wz = Math.abs(Math.sin(ry)) > .5 ? w : d, y0 = R(cx, cz); if (y0 === null) continue; let ok = true;
    for (let i = -1; i <= 1 && ok; i += .25) for (let j = -1; j <= 1 && ok; j += .25) { const x = cx + i * (wx / 2 + 1.2), z = cz + j * (wz / 2 + 1.2), y = R(x, z); if (y === null || Math.abs(y - y0) > .35 || !AV.isFree(W, x, z, .5) || onRoad(W, x, z)) ok = false }
    if (ok) { const fx = cx + Math.sin(ry) * (d / 2 + 2), fz = cz + Math.cos(ry) * (d / 2 + 2); if (R(fx, fz) === null || W.T.some(t => Math.hypot(t.x - cx, t.z - cz) < Math.max(wx, wz) / 2 + 1.5)) continue; return { x: cx, z: cz, y: y0, ry } } } return null }
ST.lot = lot;
/* ---------- the building ---------- */
ST.build = function (W, o) { const g = new THREE.Group(), w = o.w || 9, d = o.d || 7, h = 3.4; g.position.set(o.x, o.y || 0, o.z); g.rotation.y = o.ry; W.ctx.group.add(g);
  const box = (m, x, y, z, sx, sy, sz, col) => { const b = new THREE.Mesh(AV.G.box, m); b.position.set(x, y, z); b.scale.set(sx, sy, sz); b.castShadow = b.receiveShadow = !!o.shadow; g.add(b); if (col) { const c = Math.cos(o.ry), s = Math.sin(o.ry), pts = [[-sx / 2, -sz / 2], [sx / 2, -sz / 2], [-sx / 2, sz / 2], [sx / 2, sz / 2]].map(([u, v]) => [o.x + (x + u) * c + (z + v) * s, o.z - (x + u) * s + (z + v) * c]); W.cols.push([Math.min(...pts.map(p => p[0])), Math.max(...pts.map(p => p[0])), Math.min(...pts.map(p => p[1])), Math.max(...pts.map(p => p[1]))]) } return b };
  const wallM = AV.std(0xf4f2ee, .85), alu = AV.std(0xb8bcc4, .35, .6), glass = new THREE.MeshStandardMaterial({ color: 0xbfe8ff, transparent: true, opacity: .28, roughness: .05, metalness: .3 }), floorM = AV.std(0xe8e8e4, .4);
  box(floorM, 0, .04, 0, w, .08, d); box(wallM, 0, h / 2, -d / 2, w, h, .2, 1); box(wallM, -w / 2, h / 2, 0, .2, h, d, 1); box(wallM, w / 2, h / 2, 0, .2, h, d, 1); box(AV.std(0xdedad4, .9), 0, h + .1, 0, w + .4, .2, d + .4);
  const door = 1.9, side = (w - door) / 2; for (const sgn of [-1, 1]) { box(glass, sgn * (door / 2 + side / 2), 1.45, d / 2, side, 2.9, .06, 1); box(alu, sgn * (w / 2 - .05), 1.5, d / 2, .1, 3, .12); box(alu, sgn * door / 2, 1.5, d / 2, .08, 3, .12) }
  box(alu, 0, 2.95, d / 2, w, .1, .14); box(alu, 0, .05, d / 2, w, .1, .14);
  const fm = new THREE.MeshStandardMaterial({ map: o.fascia(), emissive: 0xffffff, emissiveMap: o.fascia(), emissiveIntensity: .55, roughness: .5 }); const fa = box(fm, 0, h - .1, d / 2 + .08, w, .7, .12);
  box(AV.std(0xe8e8e8, .6), w / 2 + .25, 2.4, -d / 4, .45, .55, .9); box(AV.std(0x9a9a9a, .5), w / 2 + .48, 2.4, -d / 4, .02, .4, .7);   /* AC unit on the side wall */
  /* fridges along the back, lit */
  const frM = new THREE.MeshStandardMaterial({ color: 0xeaf6ff, emissive: 0xcfe8ff, emissiveIntensity: .7, roughness: .2 }); for (let i = 0; i < 3; i++) { const x = -w / 2 + 1.4 + i * 2.1; box(AV.std(0x2a2a2e, .5), x, 1.1, -d / 2 + .45, 2, 2.2, .7); box(frM, x, 1.15, -d / 2 + .81, 1.85, 1.9, .03) }
  /* products: one instanced mesh for fridge bottles + shelf goods */
  const cols = [0xe1251b, 0x00905a, 0xf47b20, 0x2a6ad8, 0xffd400, 0xffffff, 0x8a3ad8, 0x3ac8c8], N = 180, im = new THREE.InstancedMesh(AV.G.box, new THREE.MeshStandardMaterial({ roughness: .6 }), N), mx = new THREE.Matrix4(), cl = new THREE.Color(); let n = 0;
  const put = (x, y, z, sx, sy, sz) => { if (n >= N) return; mx.makeScale(sx, sy, sz); mx.setPosition(x, y, z); im.setMatrixAt(n, mx); im.setColorAt(n, cl.setHex(cols[(n * 7 + Math.floor(x * 3)) % cols.length])); n++ };
  for (let i = 0; i < 3; i++) for (let r = 0; r < 4; r++) for (let k = 0; k < 7; k++) put(-w / 2 + .65 + i * 2.1 + k * .24, .45 + r * .45, -d / 2 + .7, .12, .3, .12);
  for (const gx of [-1.6, 1.4]) { box(AV.std(0xd8d8dc, .6), gx, .7, -.2, .9, 1.4, 3, 1); for (const sgn of [-1, 1]) for (let r = 0; r < 3; r++) for (let k = 0; k < 9; k++) put(gx + sgn * .5, .35 + r * .42, -1.45 + k * .32, .08, .26, .22) }
  im.count = n; im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; g.add(im);
  /* counter + register, front-right */
  const cx = w / 2 - 1.4, cz = d / 2 - 1.9; box(AV.std(0xf0ece4, .5), cx, .55, cz, 1.6, 1.1, .7, 1); box(AV.std(0x2a2a2e, .4), cx + .3, 1.25, cz, .4, .3, .3); box(AV.std(0x00905a, .6), cx, 1.12, cz, 1.62, .06, .72);
  /* posters on the glass, scooters outside */
  for (let i = 0; i < 2; i++) { const pm = new THREE.MeshBasicMaterial({ map: poster(i + (o.seed || 0)), side: THREE.DoubleSide }); pm.userData.lin = 1; const p = new THREE.Mesh(AV.G.pln, pm); p.position.set((i ? 1 : -1) * (door / 2 + side / 2), 1.3, d / 2 + .05); p.scale.set(.75, 1.05, 1); g.add(p) }
  for (let i = 0; i < (o.scooters || 2); i++) { const sx = -w / 2 + 1 + i * 1.3, sz = d / 2 + 2.2, bm = AV.std([0xe1251b, 0x2a2a2e, 0x2a6ad8][i % 3], .4, .3); box(bm, sx, .55, sz, .35, .45, 1.4); box(AV.std(0x1a1a1a, .8), sx, .3, sz + .55, .12, .55, .55); box(AV.std(0x1a1a1a, .8), sx, .3, sz - .55, .12, .55, .55); box(AV.std(0x6a6a6a, .3, .6), sx, 1, sz + .55, .6, .06, .06) }
  const lamp = new THREE.PointLight(0xf4fbff, 1.1, 14); lamp.position.set(0, h - .4, 0); g.add(lamp);
  AV.lin(g);
  /* staff + the counter interaction (world coordinates) */
  const wp = (u, v) => [o.x + u * Math.cos(o.ry) + v * Math.sin(o.ry), o.z - u * Math.sin(o.ry) + v * Math.cos(o.ry)], cw = wp(cx, cz - .9), clerk = wp(cx, cz - .75), front = wp(0, d / 2 + 1.5);
  if (AV.npc && AV.NPCS.lw_clerk) try { const n2 = AV.npc.spawn(W.ctx, 'lw_clerk', { x: clerk[0], z: clerk[1], yaw: o.ry, y: o.y || 0, H: () => o.y || 0, r: 1.6 }); n2.tgt.label = () => '🏪 ' + say(o.name) + tr(': order at the counter', ': pide en el mostrador'); n2.tgt.fn = () => ST.counter(o) } catch (e) { }
  const cw2 = wp(cx - 1.1, cz + .2); W.T.push({ x: cw2[0], z: cw2[1], r: 1.7, label: () => '🛒 ' + say(o.name) + tr(': buy snacks + drinks', ': comprar snacks y bebidas'), fn: () => ST.counter(o) });
  (W.places = W.places || []).push({ id: 'lw_store_' + ST.list.length, name: [say(o.name), say(o.name)], x: front[0], z: front[1] });
  const rec = { o, g, front, n: n }; ST.list.push(rec); ST.stats.built++; return rec };
/* ---------- buying: rung up, (heated), handed over, in your hand ---------- */
const beerOK = () => { const h = AV.S.time / 60; return (h >= 11 && h < 14) || h >= 17 };
ST.counter = function (o) { const menu = o.menu || MENU711;
  const p = AV.panel('cmp', '<h3 style="margin:0 0 4px">🏪 ' + esc(say(o.name)) + '</h3><p style="margin:0 0 6px"><small>' + tr('Sawasdee kha! Credits: ', '¡Sawasdee kha! Créditos: ') + AV.S.money + '</small></p><div class="bgrid">' +
    menu.map(([id, pr, heat]) => { const it = AV.ITEMS[id]; if (!it) return ''; const no = id === 'beer' && !beerOK(); return '<div class="lwMis">' + it.ic + ' <b>' + esc(say(it.n)) + '</b> · ' + pr + ' ¢' + (heat ? ' <small>(' + tr('heated for you', 'te lo calientan') + ')</small>' : '') + (no ? ' <small>· ' + tr('alcohol sales 11-14 + 17-24 only', 'alcohol solo 11-14 y 17-24') + '</small>' : '') + '<div class="lwBtns"><button data-buy="' + id + '"' + (no || AV.S.money < pr ? ' disabled' : '') + '>' + tr('Buy', 'Comprar') + '</button></div></div>' }).join('') + '</div><div class="lwBtns"><button data-close>' + tr('Done', 'Listo') + '</button></div>');
  p.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => { if (ST._busy) return; const row = menu.find(r => r[0] === b.dataset.buy); if (!row) return; const [id, pr, heat] = row; if (!AV.txn(-pr, say(o.name) + ': ' + say(AV.ITEMS[id].n))) return; ST._busy = true; ST.stats.sold++;
    AV.closePanel('cmp'); AV.toast('🧾 ' + tr('Beep. ', 'Bip. ') + (heat ? tr('The clerk pops it in the toaster...', 'El dependiente lo mete en la tostadora...') : tr('The clerk bags it...', 'El dependiente lo guarda...')));
    setTimeout(() => { ST._busy = false; AV.bag.add(id, 1, true); AV.bag.equip(id); AV.toast(AV.ITEMS[id].ic + ' ' + tr('Here you go! It is in your hand: U to ', '¡Aquí tienes! Lo tienes en la mano: U para ') + (AV.ITEMS[id].use === 'drink' ? tr('drink it.', 'bebértelo.') : tr('eat it.', 'comértelo.'))); AV.mis && AV.mis.emit('bought', id) }, (heat ? heat : .6) * 1000) }) };
AV.NPCS.lw_clerk = { name: 'Ploy', title: ['7-ELEVAPE clerk', 'dependienta de 7-ELEVAPE'], col: '#00905a', look: { fur: 0xc89a78, shirt: 0x00905a, hat: null, human: true }, persona: 'clerk', greet: c => [c.t('Sawasdee kha! Toastie?', '¡Sawasdee kha! ¿Un tostado?')], barks: c => [c.t('Sawasdee kha!', '¡Sawasdee kha!'), c.t('Toastie? Heat it up?', '¿Tostado? ¿Te lo caliento?')], chips: () => [], intents: [] };
/* ---------- where: several per Thai world, near real places; the old generic minimart counter is retired ---------- */
const SPOTS = { chiang_mai: ['hostel', 'gate', 'bazaar', 'chat', 'luang'], pai: ['walking', 'bus', 'jam'], koh_tao: ['lane', 'pier', 'divers'], koh_samui_jurassic: ['gate'] };
LW.STORE_SPOTS = SPOTS;
{ const pe = AV.onWorldEnter; AV.onWorldEnter = function (W) { if (pe) pe(W); ST.list = []; const S = W && SPOTS[W.id]; if (!S || !W.ctx) return;
  if (W.id === 'chiang_mai') for (const t of W.T) { let l = ''; try { l = typeof t.label === 'function' ? t.label() : t.label } catch (e) { } if (/^Mini mart: cold drink/.test(l || '')) { t.label = () => '🛒 7-ELEVAPE · Moon Muang' + tr(': buy snacks + drinks', ': comprar snacks y bebidas'); t.fn = () => ST.counter({ name: L('7-ELEVAPE · Moon Muang', '7-ELEVAPE · Moon Muang') }) } }
  if (W.id === 'chiang_mai') { const fm = new THREE.MeshStandardMaterial({ map: fascia711(), emissive: 0xffffff, emissiveMap: fascia711(), emissiveIntensity: .55, roughness: .5 }); fm.userData.lin = 1; const fa = new THREE.Mesh(AV.G.box, fm); fa.position.set(-10, 3.7, 47.55); fa.scale.set(11.4, .9, .12); fa.rotation.y = Math.PI; W.ctx.group.add(fa); ST.martFascia = fa }   /* the Moon Muang minimart building, rebranded (owner) */
  let i = 0; for (const pid of S) { const pl = (W.places || []).find(p => p.id === pid); if (!pl) continue; const L0 = lot(W, pl.x, pl.z, 9, 7); if (!L0) { ST.stats.failed++; continue }
    try { ST.build(W, Object.assign({ name: L('7-ELEVAPE · ' + say(pl.name), '7-ELEVAPE · ' + say(pl.name)), fascia: fascia711, seed: i++, w: 9, d: 7, scooters: 2 + (i % 2) }, L0)) } catch (e) { ST.stats.failed++; console.warn('store', e) } } } }
})(window.AV);
