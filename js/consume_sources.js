/* APEVERSE 2.1 - consume_sources.js : Phase 2, world-appropriate places to GET the fictional effects items (the audit found
   worlds where food was on sale but no in-game source existed).  Each source fits its world; nothing is a copy-pasted global shop.
   All items reuse existing ids (data/items.js etc.), so there are no duplicate products; prices are virtual credits via AV.shop.
   Fictional and abstract: no real-world sourcing, preparation or dosing information anywhere.
   - Madrid: "La Nube", a members-only social club (fictional) on Calle Malasaña.  A real street door with an enamel blade sign,
     a frosted window and a members plaque; inside (a short step-in, like the Memory home flat) a tiled lounge with sofas, a bar
     counter and Rocío behind it.  First visit: a one-off membership (adults only, 15 credits).  The house rules on the wall: smoke only inside, nothing leaves, take a taxi home.
   Save: optional S.v21 = { nube: day joined }. */
'use strict';
(function (AV) {
const tr = AV.tr, L = (e, s) => [e, s];
const CS = AV.consumeSources = { stats: {} };
const st = () => { const S = AV.S; S.v21 = S.v21 || {}; return S.v21 };

/* ---------- small canvas-sign helper: authored per business (not the generic board) ---------- */
function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t }
const plane = (tex, w, h, emissive) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: .45, metalness: .1, transparent: true, emissive: emissive ? 0xffffff : 0x000000, emissiveMap: emissive ? tex : null, emissiveIntensity: emissive || 0 }));

/* ======================= MADRID: La Nube social club ======================= */
const NUBE = { x: 2400, z: 0, w: 13, d: 9 };   /* interior lives off the city map, like the flat (x 2000) and the garage (x 2200) */
function madrid(W) {
  const ctx = W.ctx, g = new THREE.Group(); W.group.add(g); const MX = -60, GV = 1000 - 124;
  /* 1) street door on the east side of Calle Malasaña: first stretch where the pavement ends at a building wall */
  let door = null; const wallAt = z => !AV.isFree(W, MX + 7.2, z, .3); for (let z = GV - 76; z < GV - 62; z += .5) { const xs = MX + 5.2; if (W.surface(xs, z) !== null && AV.isFree(W, xs, z, .6) && [-6, -3, 0, 3, 6].every(k => wallAt(z + k))) { door = { x: MX + 6, z }; break } }
  CS.stats.nubeDoor = door ? 'wall' : 'facade';
  if (!door) { door = { x: MX + 6, z: GV - 76 }; const fm = AV.std(0xd8c8a8, .85); ctx.wall(MX + 6.2, MX + 6.6, door.z - 3, door.z + 3, 0, 4.2, fm) }
  const fx = door.x - .22, fz = door.z;   /* in front of the building's shop-window band */
  /* door (painted bottle green, brass handle), frosted window, transom light */
  const dm = AV.std(0x1e4a32, .5); const d = new THREE.Mesh(AV.G.box, dm); d.scale.set(.08, 2.3, 1.25); d.position.set(fx, 1.15, fz); g.add(d);
  const h = new THREE.Mesh(AV.G.box, AV.std(0xc8a040, .3, .8)); h.scale.set(.06, .06, .18); h.position.set(fx - .05, 1.05, fz - .4); g.add(h);
  const win = new THREE.Mesh(AV.G.box, new THREE.MeshStandardMaterial({ color: 0xcfe0d8, roughness: .2, metalness: .1, transparent: true, opacity: .55, emissive: 0xffc88a, emissiveIntensity: .25 })); win.scale.set(.06, 1.3, 1.6); win.position.set(fx, 1.55, fz + 1.9); g.add(win);
  const winTex = canvasTex(256, 200, (c, w, hh) => { c.clearRect(0, 0, w, hh); c.fillStyle = 'rgba(255,255,255,.0)'; c.fillRect(0, 0, w, hh); c.font = 'italic 34px Georgia'; c.fillStyle = 'rgba(250,240,220,.95)'; c.textAlign = 'center'; c.fillText('La Nube', w / 2, 80); c.font = '20px Georgia'; c.fillText('club social · socios', w / 2, 118); c.font = '16px Georgia'; c.fillText('solo mayores de 18', w / 2, 150) });
  const wv = plane(winTex, 1.5, 1.17, .4); wv.position.set(fx - .05, 1.55, fz + 1.9); wv.rotation.y = -Math.PI / 2; g.add(wv);
  /* enamel blade sign on an iron bracket, perpendicular to the wall: readable from up and down the street, lit at night */
  const bladeTex = canvasTex(512, 512, (c, w, hh) => { c.fillStyle = '#1e4a32'; c.beginPath(); c.ellipse(w / 2, hh / 2, w / 2 - 6, hh / 2 - 6, 0, 0, Math.PI * 2); c.fill(); c.lineWidth = 14; c.strokeStyle = '#e8d8a8'; c.stroke(); c.lineWidth = 4; c.beginPath(); c.ellipse(w / 2, hh / 2, w / 2 - 34, hh / 2 - 34, 0, 0, Math.PI * 2); c.stroke();
    c.fillStyle = '#f4ead0'; c.textAlign = 'center'; c.font = 'bold 92px Georgia'; c.fillText('La Nube', w / 2, 250); c.font = 'italic 40px Georgia'; c.fillText('club social', w / 2, 312); c.font = '28px Georgia'; c.fillText('· socios ·', w / 2, 360);
    c.strokeStyle = '#f4ead0'; c.lineWidth = 6; c.beginPath(); c.arc(w / 2 - 40, 150, 30, Math.PI, 0); c.arc(w / 2 + 10, 140, 38, Math.PI, 0); c.arc(w / 2 + 55, 156, 24, Math.PI, 0); c.stroke() });
  const blade = new THREE.Group(); const iron = AV.std(0x1a1a1a, .5, .6); const arm = new THREE.Mesh(AV.G.box, iron); arm.scale.set(1.6, .05, .05); arm.position.set(-.8, .86, 0); blade.add(arm); const arm2 = new THREE.Mesh(AV.G.box, iron); arm2.scale.set(.9, .04, .04); arm2.position.set(-.38, .45, 0); arm2.rotation.z = .55; blade.add(arm2);
  for (const s of [1, -1]) { const p = plane(bladeTex, 1.35, 1.35, .35); p.position.set(-.95, .05, s * .025); p.rotation.y = s > 0 ? 0 : Math.PI; blade.add(p) }
  blade.position.set(fx, 2.78, fz - 1.4); blade.scale.setScalar(.78); g.add(blade);   /* under the awning, clear of heads (bottom ~2.2 m) */
  const plTex = canvasTex(256, 128, (c, w, hh) => { c.fillStyle = '#c8a850'; c.fillRect(0, 0, w, hh); c.strokeStyle = '#6a5020'; c.lineWidth = 6; c.strokeRect(6, 6, w - 12, hh - 12); c.fillStyle = '#2a2010'; c.textAlign = 'center'; c.font = 'bold 26px Georgia'; c.fillText('LA NUBE', w / 2, 50); c.font = '18px Georgia'; c.fillText('Asociación · solo socios +18', w / 2, 84); c.fillText('(ficticio)', w / 2, 108) });
  const pl = plane(plTex, .5, .25); pl.position.set(fx - .06, 1.5, fz - .95); pl.rotation.y = -Math.PI / 2; g.add(pl);
  const lamp = new THREE.PointLight(0xffd8a0, 0, 9); lamp.position.set(fx - 1.2, 2.9, fz - 1.4); g.add(lamp);
  ctx.upd.push(() => { const hr = AV.S.time / 60, night = hr > 19.5 || hr < 7; lamp.intensity = night ? .9 : 0 });
  /* 2) the lounge */
  const { x, z, w, d: dd } = NUBE, x0 = x - w / 2, x1 = x + w / 2, z0 = z - dd / 2, z1 = z + dd / 2;
  const s0 = W.surface; W.surface = (px, pz) => (px > x0 - .2 && px < x1 + .2 && pz > z0 - .2 && pz < z1 + .2) ? 0 : s0(px, pz);
  const wallM = AV.std(0xe8dcc4, .9), wood = AV.std(0x5a3a24, .6);
  ctx.wall(x0 - .3, x1 + .3, z0 - .3, z0, 0, 3.4, wallM); ctx.wall(x0 - .3, x1 + .3, z1, z1 + .3, 0, 3.4, wallM); ctx.wall(x0 - .3, x0, z0, z1, 0, 3.4, wallM); ctx.wall(x1, x1 + .3, z0, z1, 0, 3.4, wallM);
  const tile = canvasTex(256, 256, (c, s) => { const col = ['#e8dcc0', '#2a5a4a', '#b8583a']; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { c.fillStyle = col[0]; c.fillRect(i * 64, j * 64, 64, 64); c.fillStyle = col[(i + j) % 2 ? 1 : 2]; c.beginPath(); c.moveTo(i * 64 + 32, j * 64 + 6); c.lineTo(i * 64 + 58, j * 64 + 32); c.lineTo(i * 64 + 32, j * 64 + 58); c.lineTo(i * 64 + 6, j * 64 + 32); c.fill(); c.fillStyle = col[0]; c.beginPath(); c.arc(i * 64 + 32, j * 64 + 32, 9, 0, 7); c.fill() } });
  tile.wrapS = tile.wrapT = THREE.RepeatWrapping; tile.repeat.set(w / 1.2, dd / 1.2);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(w, dd), new THREE.MeshStandardMaterial({ map: tile, roughness: .6 })); fl.rotation.x = -Math.PI / 2; fl.position.set(x, .02, z); g.add(fl);
  const ceil = new THREE.Mesh(AV.G.box, AV.std(0x3a2a24, .9)); ceil.scale.set(w + .6, .2, dd + .6); ceil.position.set(x, 3.5, z); g.add(ceil);
  const box = (m, px, py, pz, sx, sy, sz) => { const o = new THREE.Mesh(AV.G.box, m); o.scale.set(sx, sy, sz); o.position.set(px, py, pz); g.add(o); return o };
  /* bar counter along the far wall, shelves of plain labelled tins behind it (abstract) */
  box(wood, x, .55, z0 + 1.6, 5, 1.1, .7); box(AV.std(0x2a1a12, .4), x, 1.12, z0 + 1.6, 5.2, .06, .8); ctx.cols.push([x - 2.6, x + 2.6, z0 + 1.2, z0 + 2]);
  for (let k = 0; k < 3; k++) { box(wood, x, 1.3 + k * .55, z0 + .35, 4.6, .05, .4); for (let i = 0; i < 9; i++) box(AV.std([0x3a7a5a, 0xc8a050, 0x8a4a3a][(i + k) % 3], .5, .3), x - 2 + i * .5, 1.45 + k * .55, z0 + .35, .22, .26, .22) }
  const bartender = AV.chars && AV.chars.human ? (() => { try { const c = AV.chars.human({ seed: 77, fem: true, style: 'bun', hair: 0x2a1a10, skin: 0xc89070, shirt: AV.std(0x2a5a4a, .8), s: .8 }); return c && c.isObject3D ? c : c && c.g } catch (e) { return null } })() : null;
  if (bartender && bartender.isObject3D) { bartender.position.set(x - 1, 0, z0 + .95); g.add(bartender) } else { box(AV.std(0x2a5a4a, .7), x - 1, 1.2, z0 + .95, .5, .7, .3); const hd = new THREE.Mesh(new THREE.SphereGeometry(.16, 12, 10), AV.std(0xc8946a, .7)); hd.position.set(x - 1, 1.75, z0 + .95); g.add(hd) }
  /* sofas + low tables, plants, a record player, warm lamps, an extractor */
  const sofa = AV.std(0x7a2a2a, .8); for (const [sx, sz, ry] of [[x0 + 1.4, z + .5, 0], [x1 - 1.4, z + .5, Math.PI], [x, z1 - 1.2, Math.PI / 2]]) { const s = new THREE.Group(); const b1 = box(sofa, 0, .3, 0, .9, .6, 2.6); const b2 = box(sofa, -.35, .75, 0, .25, .6, 2.6); s.add(b1, b2); s.position.set(sx, 0, sz); s.rotation.y = ry; g.add(s); ctx.cols.push(ry === Math.PI / 2 ? [sx - 1.3, sx + 1.3, sz - .45, sz + .45] : [sx - .45, sx + .45, sz - 1.3, sz + 1.3]) }
  for (const [tx, tz] of [[x0 + 2.8, z + .5], [x1 - 2.8, z + .5], [x, z1 - 2.6]]) { box(wood, tx, .35, tz, .9, .06, .9); box(wood, tx, .17, tz, .1, .34, .1); ctx.circles.push([tx, tz, .5]) }
  for (const [px, pz] of [[x0 + .6, z0 + .6], [x1 - .6, z0 + .6], [x0 + .6, z1 - .6], [x1 - .6, z1 - .6]]) { box(AV.std(0xb86a3a, .8), px, .3, pz, .5, .6, .5); const lf = new THREE.Mesh(new THREE.IcosahedronGeometry(.45, 0), AV.std(0x3a8a3a, .9)); lf.position.set(px, 1, pz); g.add(lf); ctx.circles.push([px, pz, .4]) }
  box(AV.std(0x2a2a2a, .4, .5), x1 - .5, 3, z, .5, .5, 1.2);   /* extractor */
  for (const lx of [x - 3, x, x + 3]) { const l = new THREE.PointLight(0xffc890, .7, 9); l.position.set(lx, 2.9, z); g.add(l); const shade = new THREE.Mesh(new THREE.CylinderGeometry(.18, .35, .3, 12, 1, true), AV.std(0xe8c878, .6, 0, 0xffc070, .8)); shade.position.set(lx, 3.1, z); g.add(shade) }
  const wallTex = canvasTex(512, 256, (c, ww, hh) => { c.fillStyle = '#1e4a32'; c.fillRect(0, 0, ww, hh); c.fillStyle = '#f4ead0'; c.textAlign = 'center'; c.font = 'italic 64px Georgia'; c.fillText('La Nube', ww / 2, 110); c.font = '24px Georgia'; c.fillText('Normas: solo socios · +18 · se fuma solo aquí dentro', ww / 2, 170); c.fillText('nada sale a la calle · bebe agua · vuelve en taxi', ww / 2, 206) });
  const wp = plane(wallTex, 3.2, 1.6, .2); wp.position.set(x0 + .05, 1.9, z - 2); wp.rotation.y = Math.PI / 2; g.add(wp);
  AV.lin && AV.lin(g);
  /* 3) interactions: street door <-> lounge, counter */
  const inside = (px, pz) => px > x0 && px < x1 && pz > z0 && pz < z1;
  const goIn = () => { AV.fadeTo(1, 280); setTimeout(() => { const P = AV.P; P.x = x1 - 1.4; P.z = z1 - 1.4; P.y = 0; P.vx = P.vz = 0; P.yaw = Math.atan2(1, 1) + Math.PI * .25; AV.visit && AV.visit('md_nube'); AV.fadeTo(0, 420) }, 300) };
  const goOut = () => { AV.fadeTo(1, 280); setTimeout(() => { const P = AV.P; P.x = fx - 1.6; P.z = fz; P.y = W.surface(P.x, P.z) || 0; P.vx = P.vz = 0; P.yaw = Math.PI / 2; AV.fadeTo(0, 420) }, 300) };
  W.T.push({ x: fx - 1, z: fz, r: 1.8, label: () => tr('🌿 La Nube · social club (members, +18, fictional): enter', '🌿 La Nube · club social (socios, +18, ficticio): entrar'), fn: goIn, kind: 'door' });
  W.T.push({ x: x1 - .8, z: z1 - .8, r: 1.6, label: () => tr('🚪 Back out to Calle Malasaña', '🚪 Salir a la calle Malasaña'), fn: goOut, kind: 'door' });
  const MENU = { id: 'md_nube', name: L('La Nube · counter', 'La Nube · barra'), greet: L('Rocío: “Bienvenido, socio. Take it slow, and drink some water.”', 'Rocío: “Bienvenido, socio. Con calma, y bebe agua.”'), again: L('Rocío: “Hola otra vez. Another %i? No rush.”', 'Rocío: “Hola otra vez. ¿Otro %i? Sin prisa.”'),
    items: [['pre', 16], ['herb', 12], ['pipe', 30], ['md_cafe', 3], ['water', 1], ['snack', 5]], x: x - 1, z: z0 + 2.4, reach: 4 };
  W.T.push({ x: x - 1, z: z0 + 2.4, r: 2, label: () => st().nube ? tr('🌿 Counter (Rocío): menu', '🌿 Barra (Rocío): carta') : tr('🌿 Counter (Rocío): become a member (15)', '🌿 Barra (Rocío): hacerte socio (15)'), fn: () => {
    if (!st().nube) return AV.panel('cmp', '<b>La Nube · ' + tr('membership', 'socio') + '</b><div class="note">' + tr('Rocío: “This is a private members’ club, adults only. Membership is 15 credits, once. Everything stays inside: no smoking on the street, no driving after. ¿Vale?”', 'Rocío: “Esto es un club privado de socios, solo adultos. Hacerse socio cuesta 15 créditos, una vez. Todo se queda dentro: no se fuma en la calle ni se conduce después. ¿Vale?”') + '</div><div class="note"><small>' + tr('Fictional game venue. No real-world advice or sourcing.', 'Local ficticio del juego. Sin consejos ni compras reales.') + '</small></div><div class="row"><button id="nubeJoin">' + tr('I’m an adult — join (15)', 'Soy adulto — hacerme socio (15)') + '</button><button data-close>' + tr('No thanks', 'No, gracias') + '</button></div>')
      .querySelector('#nubeJoin').onclick = () => { if (!AV.txn(-15, 'La Nube membership')) return; st().nube = AV.S.day; AV.closePanel('cmp'); AV.toast(tr('🌿 Member card: La Nube. Welcome.', '🌿 Carné de socio: La Nube. Bienvenido.')); AV.save(); setTimeout(() => AV.shop.open(MENU), 250) };
    AV.shop.open(MENU) }, kind: 'shop' });
  const ns0 = W.noSmoke; if (ns0) W.noSmoke = (px, pz) => inside(px, pz) ? false : ns0(px, pz);
  W.places && W.places.push({ id: 'md_nube', name: L('La Nube (social club)', 'La Nube (club social)'), x: fx - 1.5, z: fz, hidden: false, icon: '🌿' });
  CS.stats.madrid = { door: [fx, fz], built: true };
}

/* ======================= street stalls: one authored sign each (local script checked: Thai ร้านสมุนไพร = "herb shop",
   Hebrew נרגילה = "nargila"), a counter, an awning in the stall's own colours, crates; placed on free ground beside a named place ======================= */
AV.ITEMS.nargila = AV.ITEMS.nargila || { n: L('Nargila (water pipe), apple-mint', 'Narguile (pipa de agua), manzana y menta'), cat: 'smoke', ic: '💨', use: 'smoke', fx: { type: 'smoke', amt: .12 }, model: 'cup', col: 0x2a7a8a, say: L('Slow bubbles, backgammon clicks, mint tea on the side.', 'Burbujas lentas, fichas de backgammon y té de menta al lado.'), price: 18 };
function stall(W, anchor, off, o) {
  const p = (W.places || []).find(q => q.id === anchor); if (!p) return null; const g = new THREE.Group();
  let s = null; for (let d = 0; d < 14 && !s; d++) for (let k = 0; k < Math.max(1, d * 8) && !s; k++) { const a = k / Math.max(1, d * 8) * Math.PI * 2, x = p.x + off[0] + Math.cos(a) * d, z = p.z + off[1] + Math.sin(a) * d;
    if (W.surface(x, z) !== null && AV.isFree(W, x, z, 2.2) && AV.isFree(W, x, z + 2.4, .8) && !(W.noStrangersAt && W.noStrangersAt(x, z))) s = [x, z] }
  if (!s) return null; const [x, z] = s, y = W.surface(x, z) || 0, ry = o.ry || 0;
  const wood = AV.std(o.wood || 0x7a5a3a, .8), box = (m, px, py, pz, sx, sy, sz) => { const b = new THREE.Mesh(AV.G.box, m); b.scale.set(sx, sy, sz); b.position.set(px, py, pz); g.add(b); return b };
  box(wood, 0, .5, 0, 2.6, 1, .7); box(AV.std(o.top || 0xe8dcc0, .6), 0, 1.03, 0, 2.7, .06, .8);
  for (const sx of [-1.3, 1.3]) for (const sz of [-.35, -1.4]) box(wood, sx, 1.25, sz, .08, 2.5, .08);
  const aw = canvasTex(256, 64, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? o.aw[0] : o.aw[1]; c.fillRect(i * w / 8, 0, w / 8, h) } });
  const awn = new THREE.Mesh(new THREE.PlaneGeometry(3, 1.4), new THREE.MeshStandardMaterial({ map: aw, side: THREE.DoubleSide, roughness: .8 })); awn.position.set(0, 2.45, -.2); awn.rotation.x = -Math.PI / 2 + .35; g.add(awn);
  const sg = canvasTex(512, 256, o.sign), sp = plane(sg, 2.5, 1.25, .25); sp.position.set(0, 1.8, .38); g.add(sp); const sb = sp.clone(); sb.rotation.y = Math.PI; sb.position.z = -1.45; g.add(sb);
  for (let i = 0; i < 4; i++) box(AV.std(o.goods[i % o.goods.length], .6), -.9 + i * .6, 1.17, -.05, .3, .22, .3);
  box(AV.std(0x6a4a2a, .8), 1.7, .25, .3, .5, .5, .5); box(AV.std(0x6a4a2a, .8), 1.75, .7, .25, .4, .4, .4);
  g.position.set(x, y, z); g.rotation.y = ry; AV.lin && AV.lin(g); W.group.add(g);
  const c = Math.cos(ry), sn = Math.sin(ry), rot = (a, b) => [x + a * c + b * sn, z - a * sn + b * c];
  const q0 = rot(-1.4, -.4), q1 = rot(1.4, .4); W.cols.push([Math.min(q0[0], q1[0]), Math.max(q0[0], q1[0]), Math.min(q0[1], q1[1]), Math.max(q0[1], q1[1])]);
  const front = rot(0, 1.5), V = Object.assign({ x: front[0], z: front[1], reach: 4 }, o.shop);
  W.T.push({ x: front[0], z: front[1], r: 2, label: () => tr(o.label[0], o.label[1]), fn: () => o.gate ? o.gate(V) : AV.shop.open(V), kind: 'shop' });
  (CS.stalls = CS.stalls || {})[o.shop.id] = { world: W.id, x, z }; return { x, z, front };
}
const signFn = (bg, fg, big, small, sub, font) => (c, w, h) => { c.fillStyle = bg; c.fillRect(0, 0, w, h); c.strokeStyle = fg; c.lineWidth = 8; c.strokeRect(10, 10, w - 20, h - 20); c.fillStyle = fg; c.textAlign = 'center';
  const fit = (txt, px, fam, y) => { let n = px; do { c.font = fam.replace('#', n); n -= 2 } while (c.measureText(txt).width > w - 64 && n > 14); c.fillText(txt, w / 2, y) };
  fit(big, parseInt((font || 'bold 70px').match(/d+/)[0]), (font || 'bold 70px Georgia').replace(/d+px/, '#px'), 104); fit(small, 44, '#px "Noto Sans Thai", "Noto Sans Hebrew", Tahoma, Arial, sans-serif', 168); fit(sub, 26, 'italic #px Georgia', 220) };
/* Thai lifestyle herb shops are fictional, adults 20+; no real-world sourcing */
const herbGate = (key, rule) => V => { const S = st(); if (S[key]) return AV.shop.open(V); AV.panel('cmp', '<b>' + tr(V.name[0], V.name[1]) + '</b><div class="note">' + tr(rule[0], rule[1]) + '</div><div class="note"><small>' + tr('Fictional game shop. No real-world advice or sourcing.', 'Tienda ficticia del juego. Sin consejos ni compras reales.') + '</small></div><div class="row"><button id="hgOk">' + tr('I’m 20+ — show me', 'Tengo 20+ — enséñamelo') + '</button><button data-close>' + tr('No thanks', 'No, gracias') + '</button></div>').querySelector('#hgOk').onclick = () => { S[key] = AV.S.day; AV.closePanel('cmp'); setTimeout(() => AV.shop.open(V), 200) } };
function pai(W) { CS.stats.pai = !!stall(W, 'walking', [14, -10], { aw: ['#3a8a3a', '#f4d84a'], wood: 0x8a6a3a, goods: [0x3a8a3a, 0xc8a050, 0x7ad8ff], sign: signFn('#2e5a2a', '#f4e8b0', 'Pai Herb Corner', 'ร้านสมุนไพร', 'adults 20+ · fictional'),
  label: L('🌿 Pai Herb Corner (adults 20+, fictional)', '🌿 Pai Herb Corner (adultos 20+, ficticio)'), gate: herbGate('paiHerb', L('Noi: “Twenty and up only. Smoke on the terrace, not in the street, and walk or take the pickup home.”', 'Noi: “Solo mayores de veinte. Se fuma en la terraza, no en la calle, y a casa andando o en la pickup.”')),
  shop: { id: 'pai_herb', name: L('Pai Herb Corner', 'Pai Herb Corner'), greet: L('Noi: “Sawasdee! Slow and easy, this is Pai.”', 'Noi: “¡Sawasdee! Despacio y tranquilo, esto es Pai.”'), items: [['pre', 22], ['herb', 15], ['pipe', 35], ['thai_tea', 12], ['water', 4]] } }) }
function koh_tao(W) { CS.stats.koh_tao = !!stall(W, 'lane', [-8, 10], { aw: ['#d82a2a', '#f4d84a'], wood: 0x6a4a2a, goods: [0x3a8a3a, 0xd82a2a, 0xf4d84a], sign: signFn('#1a1a1a', '#7ad84a', 'Sairee Leaf Shack', 'ร้านสมุนไพร', 'adults 20+ · beach rules · fictional'),
  label: L('🌿 Sairee Leaf Shack (adults 20+, fictional)', '🌿 Sairee Leaf Shack (adultos 20+, ficticio)'), gate: herbGate('ktHerb', L('Ton: “Twenty-plus. Never before diving or snorkelling — the reef is not a joke. Beach chill only.”', 'Ton: “Mayores de veinte. Nunca antes de bucear o hacer snorkel: el arrecife no es broma. Solo para relajarse en la playa.”')),
  shop: { id: 'kt_leaf', name: L('Sairee Leaf Shack', 'Sairee Leaf Shack'), greet: L('Ton: “Easy, my friend. Sunset is the best time.”', 'Ton: “Tranquilo, amigo. El atardecer es el mejor momento.”'), items: [['pre', 22], ['herb', 15], ['pipe', 35], ['coconut', 8], ['pineapple_shake', 10], ['water', 3]] } }) }
function jerusalem(W) { CS.stats.jerusalem = !!stall(W, 'mamilla', [10, 8], { aw: ['#2a5a8a', '#e8dcc0'], wood: 0x5a4030, top: 0xd8c8a0, goods: [0x2a7a8a, 0xc8a050, 0x8a3a2a], sign: signFn('#e8dcc0', '#2a4a6a', 'Café Nargila', 'נרגילה', 'tea · coffee · nargila · fictional', 'bold 64px Georgia'),
  label: L('💨 Café Nargila: tea, coffee, water pipe', '💨 Café Nargila: té, café, narguile'), shop: { id: 'jlm_nargila', name: L('Café Nargila', 'Café Nargila'), greet: L('Shlomo: “Sit, sit. Mint tea first, then we talk.”', 'Shlomo: “Siéntate, siéntate. Primero té de menta, luego hablamos.”'), items: [['nargila', 18], ['mint_tea', 5], ['cardamom_coffee', 6], ['water', 3]] } }) }
function koh_samui_jurassic(W) { CS.stats.samui = !!stall(W, 'gate', [10, -6], { aw: ['#6a7a3a', '#e8d8a0'], wood: 0x5a4a2a, goods: [0x8a6a3a, 0x3a8a3a, 0xe8d8a0], sign: signFn('#4a5a2a', '#f4ead0', 'Ranger Snack Hut', '— ranger station —', 'snacks · cold drinks · coconuts'),
  label: L('🥥 Ranger Snack Hut: coconuts, snacks, drinks', '🥥 Caseta de los guardas: cocos, snacks, bebidas'), shop: { id: 'ks_ranger', name: L('Ranger Snack Hut', 'Caseta de los guardas'), greet: L('Ranger Pim: “Eat here, not near the nests. They can smell mango from a kilometre.”', 'Guarda Pim: “Come aquí, no cerca de los nidos. Huelen el mango a un kilómetro.”'), items: [['coconut', 8], ['mango', 10], ['snack', 5], ['water', 3], ['beer', 12]] } });
  const cv = (W.places || []).find(q => q.id === 'crystal'); if (cv) W.T.push({ x: cv.x, z: cv.z, r: 4, label: () => st().ksShroom === AV.S.day ? tr('🍄 Glowing cave mushrooms (pick again tomorrow)', '🍄 Setas brillantes (vuelve mañana)') : tr('🍄 Pick a glowing cave mushroom (once a day)', '🍄 Recoger una seta brillante de la cueva (una al día)'),
    fn: () => { if (st().ksShroom === AV.S.day) return AV.toast(tr('Leave some for the cave. Tomorrow.', 'Deja algunas para la cueva. Mañana.')); st().ksShroom = AV.S.day; AV.bag.add('magic_mushroom', 1) }, kind: 'pickup' }) }
function verdalux(W) { CS.stats.verdalux = !!stall(W, 'drum', [-9, 6], { aw: ['#2a6a4a', '#7aff8a'], wood: 0x4a3a2a, goods: [0x7aff8a, 0xc8a050, 0x4ad8ff], sign: signFn('#1a3a2a', '#9aff9a', 'Vela’s Forage Basket', '✦ ✦ ✦', 'fruit · nuts · spring water'),
  label: L('🧺 Vela’s Forage Basket: fruit, nuts, water', '🧺 Cesta de Vela: fruta, frutos secos, agua'), shop: { id: 'vx_forage', name: L('Vela’s Forage Basket', 'Cesta de Vela'), greet: L('Vela: “The moon gives, we share. Take what you’ll eat.”', 'Vela: “La luna da, nosotros compartimos. Coge lo que vayas a comer.”'), items: [['coconut', 5], ['snack', 4], ['water', 2]] } }) }

const BUILD = { madrid, pai, koh_tao, jerusalem, koh_samui_jurassic, verdalux };
const prevE = AV.onWorldEnter; AV.onWorldEnter = function (W) { if (prevE) prevE(W); if (!W || W.__cs21) return; W.__cs21 = true; const b = BUILD[W.id]; if (b) try { b(W) } catch (e) { console.warn('consume source failed', W.id, e) } };
})(window.AV);
