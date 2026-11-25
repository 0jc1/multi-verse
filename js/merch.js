/* APEVERSE - merch.js : M6 clothing system. Three branded, enterable stores selling the owner's artwork as wearable T-shirts and
   hoodies for in-game credits (no real money, no external checkout):
     APEVERSE concept store  - Ape Town, by La Finca market      (World Tour, Sunshine Cut-Paper, City Souvenirs)
     MOONMELT SUPPLY CO.     - Pai, off Walking Street            (Cosmic Campground)
     SOLTERRA                - Madrid, by Puerta del Sol          (SOLTERRA Originals, Sunshine Series)
     ZtonedApe               - Jungle Dub, by the sound system    (ZtonedApe Underground: the owner's own sketchbook designs)
   - Designs come from data/merch_catalog.js (AV.MERCH, built by tools/build_merch_catalog.mjs from the owner's files).
   - Prints are real garment prints: the character shirt shader projects the design onto the chest (front), the artwork's paper
     background keyed out so it reads as a screen print on the fabric colour. Tee = short sleeves, hoodie = long sleeves + looser cut.
   - Every design x garment is a backpack item (AV.ITEMS 'wear_<design>_<garment>'); using it wears it. The worn outfit lives in
     AV.S.wear {design, garment, color, size} and is saved with the game (old saves simply have none).
   - Each store: shopfront + lit sign, display windows, two rails (tees / hoodies), a folded-stack table, framed posters, a mannequin
     wearing the house design, a cashier with staff, and a fitting room whose mirror shows you (Ztonedape) in what you try on.
   - A small minority of townsfolk wear store designs (AV.merch.npcPrint), favouring each world's own designs.
   AV.merch = { cat, design(id), printTex(id), artTex(id), wear(), equip(), buy(), open(shop), shops, stats } */
'use strict';
(function (AV) {
const tr = (en, es) => (AV.tr ? AV.tr(en, es) : en), TAU = Math.PI * 2, CAT = AV.MERCH || { designs: [], collections: {}, brands: [] };
const MC = AV.merch = { cat: CAT, shops: {}, stats: { npcPrinted: 0, npcTotal: 0, bought: 0 } };
const GAR = { tee: { n: ['T-shirt', 'Camiseta'], ic: '👕', o: { loose: 1.1, sleeve: .5 } }, hoodie: { n: ['Hoodie', 'Sudadera'], ic: '🧥', o: { loose: 1.17, sleeve: .96 } } };
const PRICE = Object.assign({ tee: 70, hoodie: 120 }, CAT.prices || {});
const FABRIC = { cream: [0xf2ead8, 'Cream', 'Crema'], white: [0xf6f5f0, 'White', 'Blanco'], sand: [0xd9c8a6, 'Sand', 'Arena'], sage: [0x8c9b7c, 'Sage', 'Salvia'], navy: [0x1f2b45, 'Navy', 'Marino'], black: [0x1d1d21, 'Black', 'Negro'] };
const SIZES = ['S', 'M', 'L', 'XL'];
MC.GAR = GAR; MC.PRICE = PRICE; MC.FABRIC = FABRIC; MC.SIZES = SIZES;
const byId = {}; CAT.designs.forEach(d => byId[d.id] = d);
MC.design = id => byId[id] || null;
const nm = d => tr(d.name[0], d.name[1]);
MC.itemId = (id, g) => 'wear_' + id + '_' + g;

/* ---------- textures: full art (posters, thumbnails) and keyed prints (on fabric) ---------- */
const TEX = {}, PTEX = {};
const load = (src, cb) => { const im = new Image(); im.onload = () => cb(im); im.onerror = () => console.warn('merch texture failed', src); im.src = src };
MC.artTex = id => { if (TEX[id]) return TEX[id]; const d = byId[id]; const t = TEX[id] = new THREE.Texture(); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
  if (d) load(d.tex, im => { t.image = im; t.needsUpdate = true }); return t };
/* the print: paper colour (sampled from the corners) keyed to transparent with a soft edge, so the design sits on the fabric */
MC.printTex = id => { if (PTEX[id]) return PTEX[id]; const d = byId[id], c = document.createElement('canvas'); c.width = c.height = 256; const t = PTEX[id] = new THREE.CanvasTexture(c); t.anisotropy = 4;
  if (d) load(d.tex, im => { const g = c.getContext('2d'); g.drawImage(im, 0, 0, 256, 256); const px = g.getImageData(0, 0, 256, 256), a = px.data;
    let pr = 0, pg = 0, pb = 0; for (const [x, y] of [[4, 4], [251, 4], [4, 251], [251, 251], [128, 3], [3, 128]]) { const i = (y * 256 + x) * 4; pr += a[i]; pg += a[i + 1]; pb += a[i + 2] } pr /= 6; pg /= 6; pb /= 6;
    for (let i = 0; i < a.length; i += 4) { const dd = Math.hypot(a[i] - pr, a[i + 1] - pg, a[i + 2] - pb); a[i + 3] = dd < 22 ? 0 : dd < 46 ? Math.round((dd - 22) / 24 * 255) : 255 }
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) { const e = Math.min(x, y, 255 - x, 255 - y); if (e < 6) a[(y * 256 + x) * 4 + 3] = Math.min(a[(y * 256 + x) * 4 + 3], e * 42) }   /* no hard square edge */
    g.putImageData(px, 0, 0); t.needsUpdate = true; MC.stats.printsReady = (MC.stats.printsReady || 0) + 1 });
  return t };

/* ---------- backpack items ---------- */
function register() { if (!AV.ITEMS) return; for (const d of CAT.designs) for (const g in GAR) { const id = MC.itemId(d.id, g); if (AV.ITEMS[id]) continue;
  AV.ITEMS[id] = { n: [d.brand + ' · ' + d.name[0] + ' ' + GAR[g].n[0].toLowerCase(), d.brand + ' · ' + d.name[1] + ' (' + GAR[g].n[1].toLowerCase() + ')'], cat: 'clothing', ic: GAR[g].ic, use: 'wear', keep: true, model: 'shirt', col: 0xf2ead8, price: PRICE[g],
    say: ['You put on the ' + d.name[0] + ' ' + GAR[g].n[0].toLowerCase() + '.', 'Te pones la ' + GAR[g].n[1].toLowerCase() + ' ' + d.name[1] + '.'], merch: { design: d.id, garment: g, brand: d.brand }, onUse: () => { MC.equip(d.id, g); if (AV.bag && AV.bag.equip) AV.bag.equip(null) } } } }   /* worn, not held in the hand */
register();

/* ---------- wardrobe (saved with the game) ---------- */
MC.wear = () => (AV.S && AV.S.wear && byId[AV.S.wear.design]) ? AV.S.wear : null;
MC.owns = (id, g) => !!(AV.bag ? AV.bag.count(MC.itemId(id, g)) : (AV.S.items || {})[MC.itemId(id, g)]);
MC.equip = function (id, g, color, size) { const d = byId[id]; if (!d || !MC.owns(id, g)) return false; const w0 = AV.S.wear || {};
  AV.S.wear = { design: id, garment: g, color: color || w0.color || 'cream', size: size || w0.size || 'M' }; AV.save(); AV.hud && AV.hud(); MC.refreshMirrors(); return true };
MC.takeOff = function () { AV.S.wear = null; AV.save(); AV.hud && AV.hud(); MC.refreshMirrors() };
MC.buy = function (id, g, color, size) { const d = byId[id]; if (!d || !GAR[g]) return false; const p = PRICE[g];
  if (!AV.txn(-p, d.brand + ' · ' + d.name[0] + ' ' + GAR[g].n[0].toLowerCase())) return false;   /* refuses when credits run short */
  if (AV.bag) AV.bag.add(MC.itemId(id, g), 1, true); else { AV.S.items = AV.S.items || {}; AV.S.items[MC.itemId(id, g)] = (AV.S.items[MC.itemId(id, g)] || 0) + 1 }
  MC.stats.bought++; MC.equip(id, g, color, size); return true };
/* HUD line: what you are wearing */
const hud0 = AV.hud; if (hud0) AV.hud = function () { const r = hud0.apply(this, arguments); try { const el = document.getElementById('top'), w = MC.wear(); if (el && w) { const d = byId[w.design]; let s = el.querySelector('.mzw'); if (!s) { s = document.createElement('div'); s.className = 'mzw'; el.appendChild(s) } s.textContent = GAR[w.garment].ic + ' ' + d.brand + ' · ' + nm(d) } else if (el) { const s = el.querySelector('.mzw'); if (s) s.remove() } } catch (e) { } return r };

/* ---------- townsfolk prints: ~9% of random people, mostly the world's own designs, never the same everywhere ---------- */
let building = null; const ev0 = AV.evolve; if (ev0) AV.evolve = function (id) { building = id; return ev0.apply(this, arguments) };
MC.npcPrint = function (seed) { MC.stats.npcTotal++; const r = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(Math.max(1, ((seed | 0) * 7919 + 104729) % 2147483647)); r(); r();
  if (r() > .09 || !CAT.designs.length) return null; const w = building || (AV.W && AV.W.id), local = CAT.designs.filter(d => d.affinity === w), pool = local.length && r() < .5 ? local : CAT.designs, d = pool[Math.floor(r() * pool.length) % pool.length];
  const fk = ['cream', 'white', 'sand', 'cream', 'navy', 'black', 'sage'][Math.floor(r() * 7) % 7], hood = r() < .25; MC.stats.npcPrinted++; (MC.stats.npcDesigns = MC.stats.npcDesigns || {})[d.id] = 1;
  return { id: d.id, col: FABRIC[fk][0], o: hood ? GAR.hoodie.o : null } };

/* ---------- the stores ---------- */
const SHOPS = {
  ape_town: { key: 'apeverse', brand: 'APEVERSE', cols: ['tour', 'coastal', 'cities'], anchor: [/finca|market/i, /stage/i], wall: 0xe8e0cf, trim: 0x1f5a5a, awn: 0x1f6a6a, floor: 0x8a6a48, hero: 'apeverse_same_sky', staff: ['Nia', 'APEVERSE concept store'],
    sign: { bg: '#123c3c', fg: '#f4ead2', ac: '#e8a23a', t: 'APEVERSE', sub: 'WORLD TOUR · CONCEPT STORE', font: '900 150px "Arial Black", Arial, sans-serif', sp: 18 },
    greet: ['Welcome to APEVERSE. World Tour tees, sunshine prints, city souvenirs — try anything on in the fitting room.', 'Bienvenido a APEVERSE. Camisetas World Tour, estampados de sol y recuerdos de ciudad: pruébate lo que quieras en el probador.'] },
  pai: { key: 'moonmelt', brand: 'MOONMELT SUPPLY CO.', cols: ['moonmelt'], anchor: [/walking/i, /tea/i], wall: 0x3a2a4a, trim: 0xe86a2a, awn: 0xe8862a, floor: 0x6a4a30, hero: 'moonmelt_cosmic_campout', staff: ['Juno', 'MOONMELT SUPPLY CO.'],
    sign: { bg: '#21163a', fg: '#ff8a3a', ac: '#ffd25a', t: 'MOONMELT', sub: 'SUPPLY CO. · COSMIC CAMPGROUND OUTFITTERS', font: 'italic 900 150px Georgia, "Times New Roman", serif', sp: 6 },
    greet: ['Hey, cosmic camper. Moonmelt is made for slow roads and starry nights. Stay mellow.', 'Hola, campista cósmico. Moonmelt está hecho para caminos lentos y noches estrelladas. Stay mellow.'] },
  madrid: { key: 'solterra', brand: 'SOLTERRA', city: true, cols: ['solterra', 'sunshine'], anchor: [/sol/i], wall: 0xf2e6d2, trim: 0xc8572e, awn: 0xd8663a, floor: 0xb89a72, hero: 'solterra_more_sun', staff: ['Lucía', 'SOLTERRA'],
    sign: { bg: '#f4ead8', fg: '#c8572e', ac: '#2e5fa8', t: 'SOLTERRA', sub: 'MORE SUN · LESS WORRIES', font: '900 150px "Arial Rounded MT Bold", "Arial Black", Arial, sans-serif', sp: 10 },
    greet: ['¡Hola! Welcome to SOLTERRA — warm colours, slow days, good people. Have a look around.', '¡Hola! Bienvenido a SOLTERRA: colores cálidos, días lentos, buena gente. Echa un vistazo.'] },
  jungle_dub: { key: 'ztonedape', brand: 'ZtonedApe', cols: ['ztoned'], anchor: [/sound/i, /bongo/i, /art/i], wall: 0x16161a, trim: 0x3ad86a, awn: 0x2aa858, floor: 0x3a2a1e, hero: 'ztonedape_bud', staff: ['Kush', 'ZtonedApe'],
    sign: { bg: '#0c0c10', fg: '#4ae07a', ac: '#2ad8d8', t: 'ZtonedApe', sub: 'UNDERGROUND ART · STONER COMICS · MERCH', font: 'italic 900 150px "Arial Black", Impact, sans-serif', sp: 4 },
    greet: ['Yo! ZtonedApe official merch, straight from the sketchbook. Pick a design, try it on, stay ztoned.', '¡Ey! Merch oficial de ZtonedApe, directo del cuaderno de bocetos. Elige un diseño, pruébatelo y sigue ztoned.'] } };
MC.SHOPS = SHOPS;
const designsOf = sh => CAT.designs.filter(d => sh.cols.includes(d.collection));

function signTex(sg) { const c = document.createElement('canvas'); c.width = 1024; c.height = 256; const g = c.getContext('2d'); g.fillStyle = sg.bg; g.fillRect(0, 0, 1024, 256);
  g.strokeStyle = sg.ac; g.lineWidth = 6; g.strokeRect(14, 14, 996, 228); g.fillStyle = sg.fg; g.textAlign = 'center'; g.textBaseline = 'middle';
  let f = sg.font; g.font = f; if ('letterSpacing' in g) g.letterSpacing = sg.sp + 'px'; let w = g.measureText(sg.t).width, k = Math.min(1, 900 / w); g.save(); g.translate(512, 112); g.scale(k, k); g.fillText(sg.t, 0, 0); g.restore();
  g.font = '700 34px Arial, sans-serif'; if ('letterSpacing' in g) g.letterSpacing = '6px'; g.fillStyle = sg.ac; g.fillText(sg.sub, 512, 206, 960);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t }

/* site finder: deterministic, flat, walkable, clear of everything, off roads + sidewalks, away from interactions and spawn, open apron at the door */
function findSite(W, sh, WD, DP) {
  /* rasterise everything once into a 0.5 m grid around the anchors (blocked / building / height), then test candidates with lookups:
     flat + walkable + free (colliders padded 0.25 m) + >= 3 m from mapped roads + outside no-decoration / private zones + door apron open;
     cities also need the back wall against an existing building (fills a frontage). */
  const t0 = performance.now(), ar = W.arrivals && (W.arrivals[W.defaultArrival] || W.arrivals.default || Object.values(W.arrivals)[0]), T = W.T.slice();
  const anchors = []; for (const re of sh.anchor) for (const p of W.places || []) if (re.test(p.id) || re.test(Array.isArray(p.name) ? p.name[0] : String(p.name))) anchors.push(p); if (ar) anchors.push(ar); if (!anchors.length) return null;
  const R = 100, CS = .5; let gx0 = 1e9, gz0 = 1e9, gx1 = -1e9, gz1 = -1e9; for (const a of anchors) { gx0 = Math.min(gx0, a.x - R); gx1 = Math.max(gx1, a.x + R); gz0 = Math.min(gz0, a.z - R); gz1 = Math.max(gz1, a.z + R) }
  const NX = Math.ceil((gx1 - gx0) / CS), NZ = Math.ceil((gz1 - gz0) / CS), bad = new Uint8Array(NX * NZ), bld = new Uint8Array(NX * NZ), hy = new Float32Array(NX * NZ);
  const ci = x => Math.floor((x - gx0) / CS), cj = z => Math.floor((z - gz0) / CS);
  const markRect = (x0, x1, z0, z1, arr) => { for (let j = Math.max(0, cj(z0)); j <= Math.min(NZ - 1, cj(z1)); j++) for (let i = Math.max(0, ci(x0)); i <= Math.min(NX - 1, ci(x1)); i++) arr[j * NX + i] = 1 };
  const markDisk = (x, z, r) => { for (let j = Math.max(0, cj(z - r)); j <= Math.min(NZ - 1, cj(z + r)); j++) for (let i = Math.max(0, ci(x - r)); i <= Math.min(NX - 1, ci(x + r)); i++) { const cx2 = gx0 + (i + .5) * CS, cz2 = gz0 + (j + .5) * CS; if (Math.hypot(cx2 - x, cz2 - z) <= r + CS * .71) bad[j * NX + i] = 1 } };
  for (const c of W.cols) { markRect(c[0] - .25, c[1] + .25, c[2] - .25, c[3] + .25, bad); markRect(c[0], c[1], c[2], c[3], bld) }
  for (const c of W.circles) markDisk(c[0], c[1], c[2] + .25);
  for (const q of W.mapRoads || []) { const dx = q[2] - q[0], dz = q[3] - q[1], L = Math.hypot(dx, dz), w = (q[4] || 6) / 2 + 3; for (let s = 0; s <= L; s += CS) markDisk(q[0] + dx * s / (L || 1), q[1] + dz * s / (L || 1), w) }
  for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) { const k = j * NX + i, x = gx0 + (i + .5) * CS, z = gz0 + (j + .5) * CS; if (bad[k]) continue; const y = W.surface(x, z);
    if (y == null || (W.noDecor && W.noDecor(x, z)) || (W.noStrangersAt && W.noStrangersAt(x, z))) { bad[k] = 1; continue } hy[k] = y }
  const smalls = [], bb = new THREE.Box3(), v3 = new THREE.Vector3(); W.group.updateMatrixWorld(true); const im = new THREE.Matrix4(), ib = new THREE.Box3();
  W.group.traverse(o => { if (!o.isMesh || !o.geometry || !o.visible) return; if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    if (o.isInstancedMesh) { if (o.count > 20000) return; for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, im); ib.copy(o.geometry.boundingBox).applyMatrix4(im).applyMatrix4(o.matrixWorld); if (ib.max.y > .15 && ib.max.x > gx0 && ib.min.x < gx1 && ib.max.z > gz0 && ib.min.z < gz1) smalls.push(ib.clone()) } return }   /* flowers, plants, rocks drawn as instances */
    bb.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld); bb.getSize(v3); if (v3.x < 40 && v3.z < 40 && v3.y < 40 && bb.max.y > .15 && bb.max.x > gx0 && bb.min.x < gx1 && bb.max.z > gz0 && bb.min.z < gz1) smalls.push(bb.clone()) });   /* props up to 40 m (mounds, kiosks, signs) the collision data may not know */
  const cell = (x, z) => { const i = ci(x), j = cj(z); return i < 0 || j < 0 || i >= NX || j >= NZ ? -1 : j * NX + i };
  let backed = !!sh.city;
  const ok = (cx, cz, ry) => { const c = Math.cos(ry), s = Math.sin(ry), w2 = (lx, lz) => [cx + lx * c + lz * s, cz - lx * s + lz * c], k0 = cell(cx, cz); if (k0 < 0 || bad[k0]) return false; const y0 = hy[k0];
    if (T.some(t => Math.hypot(t.x - cx, t.z - cz) < Math.max(WD, DP) / 2 + 3)) return false; if (ar && Math.hypot(ar.x - cx, ar.z - cz) < Math.max(WD, DP) / 2 + 8) return false;
    for (let lx = -1.6; lx <= 1.6; lx += .8) for (let lz = DP / 2 + .8; lz <= DP / 2 + 3.6; lz += .7) { const k = cell(...w2(lx, lz)); if (k < 0 || bad[k]) return false }   /* door apron */
    if (backed) { let n = 0, m = 0; for (let lx = -WD / 2 + 1; lx <= WD / 2 - .99; lx += 1.5) { m++; for (const lz of [-DP / 2 - .9, -DP / 2 - 1.6, -DP / 2 - 2.6]) { const k = cell(...w2(lx, lz)); if (k >= 0 && bld[k]) { n++; break } } } if (n < m * .7) return false }
    let lo = 1e9, hi = -1e9; for (let lx = -WD / 2 - .4; lx <= WD / 2 + .41; lx += .45) for (let lz = -DP / 2 - .4; lz <= DP / 2 + .41; lz += .45) { const k = cell(...w2(lx, lz)); if (k < 0 || bad[k]) return false; lo = Math.min(lo, hy[k]); hi = Math.max(hi, hy[k]); if (hi - lo > .5) return false }   /* gentle slope only; the store is levelled on a plinth */
    okY = hi;
    const ex = Math.abs(c) * (WD / 2 + .3) + Math.abs(s) * (DP / 2 + .3), ez = Math.abs(s) * (WD / 2 + .3) + Math.abs(c) * (DP / 2 + .3);
    for (const b of smalls) if (b.max.x > cx - ex && b.min.x < cx + ex && b.max.z > cz - ez && b.min.z < cz + ez && b.min.y < y0 + 4.6 && b.max.y > y0 + .12) return false;
    return true };
  let okY = 0;
  for (const pass of sh.city ? [true, false] : [false]) { backed = pass; for (const a of anchors) for (let r = 8; r <= 90; r += 2) { const n = Math.max(8, Math.round(r * 1.2)); for (let k = 0; k < n; k++) { const ang = k / n * TAU, x = a.x + Math.cos(ang) * r, z = a.z + Math.sin(ang) * r;
    const face = Math.atan2(a.x - x, a.z - z);   /* the door faces back towards the anchor (where people are) */
    for (const ry of [face, face + Math.PI / 2, face - Math.PI / 2]) { const q = Math.round(ry / (Math.PI / 2)) * Math.PI / 2; if (ok(x, z, q)) return { x, z, ry: q, y: okY, anchor: a.id || 'arrival', backed, ms: Math.round(performance.now() - t0) } } } } }
  return null }

/* a hanging shirt on a rail (fabric body + sleeves + hanger, print plane on the front) */
const PL = new THREE.PlaneGeometry(1, 1), PLF = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), CYLZ = new THREE.CylinderGeometry(1, 1, 1, 8).rotateX(Math.PI / 2);   /* pre-rotated: K.M applies X before Y, so tilts are baked into the geometry */
function shirtParts(parts, prints, x, y, z, ry, col, hood, did) { const K = AV.kit, M = K.M, B = K.BG, L = (lx, ly, lz, sx, sy, sz, rz) => { const c = Math.cos(ry), s = Math.sin(ry); return M(x + lx * c + lz * s, y + ly, z - lx * s + lz * c, sx, sy, sz, 0, ry, rz || 0) };
  parts.push([B.box, col, L(0, -.38, 0, .54, .66, .05)], [B.box, col, L(-.33, -.14, 0, .2, hood ? .58 : .2, .05, hood ? .12 : .55)], [B.box, col, L(.33, -.14, 0, .2, hood ? .58 : .2, .05, hood ? -.12 : -.55)], [B.box, 0x2a2a2e, L(0, .02, 0, .42, .02, .02)], [B.cyl, 0x8a8a92, L(0, .08, 0, .012, .1, .012)]);
  if (hood) parts.push([B.box, col, L(0, -.06, -.05, .3, .18, .08)]);
  (prints[did] = prints[did] || []).push([PL, L(0, -.36, .03, .34, .34, 1)]) }

function buildShop(W, sh) {
  const WD = 11, DP = 8.6, H = 4.2, site = findSite(W, sh, WD, DP); MC.shops[W.id] = { ok: !!site, brand: sh.brand };
  if (!site) { console.warn('merch: no site for', sh.brand, 'in', W.id); return }
  const K = AV.kit, M = K.M, B = K.BG, ctx = W.ctx, { x: cx, z: cz, ry, y: y0 } = site, c = Math.cos(ry), s = Math.sin(ry), w2 = (lx, lz) => [cx + lx * c + lz * s, cz - lx * s + lz * c];
  const L = (lx, ly, lz, sx, sy, sz, rx, ryy, rz) => { const [x, z] = w2(lx, lz); return M(x, y0 + ly, z, sx, sy, sz, rx || 0, ry + (ryy || 0), rz || 0) };
  const grp = new THREE.Group(); grp.name = 'merch_' + sh.key; const det = new THREE.Group(); grp.add(det); ctx.group.add(grp);
  const solid = [], glow = [], glass = [], prints = {}, art = {}, cols = ctx.cols, circ = ctx.circles;
  const wallBox = (lx0, lx1, lz0, lz1) => { const a = w2(lx0, lz0), b = w2(lx1, lz1); cols.push([Math.min(a[0], b[0]), Math.max(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[1], b[1])]) };
  const t = .22, hw = WD / 2, hd = DP / 2, door = 1.3;
  /* shell: floor, walls (front has a 2.6 m door and two display windows), roof, cornice, awning */
  solid.push([B.box, sh.floor, L(0, -.28, 0, WD - .1, .66, DP - .1)], [B.box, 0x6a6660, L(0, -.32, 0, WD + .12, .64, DP + .12)],   /* floor + plinth down to the lowest ground */ [B.box, sh.wall, L(0, H / 2, -hd, WD, H, t)], [B.box, sh.wall, L(-hw, H / 2, 0, t, H, DP)], [B.box, sh.wall, L(hw, H / 2, 0, t, H, DP)], [B.box, 0x5a5650, L(0, H + .18, 0, WD + .5, .36, DP + .5)], [B.box, sh.trim, L(0, H - .25, hd + .02, WD + .3, .5, .3)]);
  for (const sd of [-1, 1]) { const ex = sd * (door + (hw - door) / 2), ew = hw - door; solid.push([B.box, sh.wall, L(ex, .45, hd, ew, .9, t)], [B.box, sh.wall, L(ex, 3.25, hd, ew, 1.9, t)], [B.box, sh.trim, L(sd * (hw - .1), 1.6, hd + .02, .2, 1.4, .26)], [B.box, sh.trim, L(sd * (door + .1), 1.6, hd + .02, .2, 1.4, .26)]); glass.push(L(ex, 1.6, hd, ew - .4, 1.4, .04)) }
  solid.push([B.box, sh.wall, L(0, 3.55, hd, door * 2, 1.3, t)]); for (const sd of [-1, 1]) wallBox(sd * door, sd * hw, hd - t / 2, hd + t / 2);
  wallBox(-hw, hw, -hd - t / 2, -hd + t / 2); wallBox(-hw - t / 2, -hw + t / 2, -hd, hd); wallBox(hw - t / 2, hw + t / 2, -hd, hd);
  solid.push([B.box, sh.awn, L(0, 3.0, hd + .75, WD - .4, .08, 1.5)], [B.box, sh.trim, L(0, 2.9, hd + 1.48, WD - .4, .2, .04)]);   /* flat awning with a valance */
  /* the sign */
  { const sg = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 1.3), new THREE.MeshStandardMaterial({ map: signTex(sh.sign), emissive: 0xffffff, roughness: .5 })); sg.material.emissiveMap = sg.material.map; sg.material.emissiveIntensity = .35; sg.material.userData.lin = 1;
    const [x, z] = w2(0, hd + .2); sg.position.set(x, y0 + 3.55, z); sg.rotation.y = ry; grp.add(sg); MC.shops[W.id].sign = sg.material }
  /* inside: ceiling light strips (emissive), cashier counter front-left, rails left + right, table centre, posters on the back wall, fitting room back-right */
  for (const lx of [-3, 0, 3]) glow.push([B.box, 0xfff2d8, L(lx, H - .06, -.5, .2, .04, DP - 2.5)]);
  const ds = designsOf(sh), D = k => ds[k % ds.length].id;
  /* cashier */
  solid.push([B.box, sh.trim, L(-hw + 1.6, .55, hd - 2.1, 2.2, 1.1, .7)], [B.box, 0xf0ece4, L(-hw + 1.6, 1.12, hd - 2.1, 2.3, .05, .8)], [B.box, 0x2a2a2e, L(-hw + 1.2, 1.28, hd - 2.2, .4, .25, .3)]); wallBox(-hw + .5, -hw + 2.7, hd - 2.45, hd - 1.75);
  /* rails: tees on the left wall, hoodies on the right */
  for (const [sd, hood, z0] of [[-1, false, -3.7], [1, true, -1.1]]) { const rx = sd * (hw - .55), z1 = z0 + 3.8; solid.push([CYLZ, 0x9a9aa2, L(rx, 1.75, (z0 + z1) / 2, .02, .02, z1 - z0)], [B.cyl, 0x9a9aa2, L(rx, .88, z0, .025, 1.75, .025)], [B.cyl, 0x9a9aa2, L(rx, .88, z1, .025, 1.75, .025)]);   /* tees back-left, hoodies front-right */
    for (let k = 0; k < 7; k++) { const lz = z0 + .3 + k * .53, fk = Object.keys(FABRIC)[(k + (hood ? 3 : 0)) % 6]; const [x, z] = w2(rx, lz); shirtParts(solid, prints, x, y0 + 1.75, z, ry + sd * -Math.PI / 2, FABRIC[fk][0], hood, D(k + (hood ? 4 : 0))) }
    wallBox(rx - .35, rx + .35, z0 - .1, z1 + .1) }
  /* table with folded stacks */
  solid.push([B.box, 0x6a4a32, L(.6, .78, -.4, 2.4, .08, 1.2)]); for (const [lx, lz] of [[-.5, -.9], [1.7, -.9], [-.5, .1], [1.7, .1]]) solid.push([B.box, 0x4a3424, L(lx, .38, lz, .07, .76, .07)]); wallBox(-.65, 1.85, -1.05, .25);
  for (let k = 0; k < 6; k++) { const lx = -.2 + (k % 3) * .8, lz = -.75 + Math.floor(k / 3) * .7, fk = Object.keys(FABRIC)[k % 6]; for (let j = 0; j < 4; j++) solid.push([B.box, FABRIC[fk][0], L(lx, .86 + j * .07, lz, .5, .065, .42)]); (prints[D(k + 2)] = prints[D(k + 2)] || []).push([PLF, L(lx, 1.137, lz, .32, 1, .32)]) }
  /* posters on the back wall (full artwork in frames) */
  for (let k = 0; k < 4; k++) { const lx = -3.6 + k * 1.75; if (lx > 2.2) break; solid.push([B.box, 0x1a1a1a, L(lx, 2.3, -hd + .14, 1.2, 1.2, .05)]); (art[D(k + 1)] = art[D(k + 1)] || []).push([PL, L(lx, 2.3, -hd + .17, 1.06, 1.06, 1)]) }
  /* fitting room, back-right: partition + curtain + mirror; the "reflection" stands in a sealed alcove behind the mirror glass */
  const fx = hw - 1.8, fz = -hd + 1.5; solid.push([B.box, sh.wall, L(fx - .95, 1.3, fz, .08, 2.6, 2.6)], [B.box, sh.trim, L(fx, 2.65, fz + 1.3, 1.9, .06, .06)]);
  solid.push([B.box, sh.awn, L(fx - .55, 1.3, fz + 1.3, .8, 2.5, .03)]);   /* curtain, drawn to one side */
  wallBox(fx - 1, fx - .9, fz - 1.3, fz + 1.3); wallBox(fx - .95, fx - .2, fz + 1.27, fz + 1.33);
  const mz = fz - .55; solid.push([B.box, 0x2a2a2e, L(fx, .12, mz, 1.3, .08, .08)], [B.box, 0x2a2a2e, L(fx, 2.38, mz, 1.3, .08, .08)], [B.box, 0x2a2a2e, L(fx - .63, 1.25, mz, .08, 2.3, .08)], [B.box, 0x2a2a2e, L(fx + .63, 1.25, mz, .08, 2.3, .08)]);   /* a frame, not a panel: the reflection stands behind the glass */ glass.push(L(fx, 1.25, mz + .04, 1.15, 2.1, .02)); wallBox(fx - .9, hw, -hd, mz + .05);   /* mirror frame + glass; alcove behind is sealed */
  /* merge + materials */
  const sm = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .8 }); sm.userData.lin = 1; const sMesh = new THREE.Mesh(K.merge(solid), sm); sMesh.receiveShadow = true; grp.add(sMesh);
  const gm = new THREE.MeshBasicMaterial({ vertexColors: true }); gm.userData.lin = 1; det.add(new THREE.Mesh(K.merge(glow), gm));
  const glm = new THREE.MeshStandardMaterial({ color: 0xbcd4e0, roughness: .05, metalness: .4, transparent: true, opacity: .18, depthWrite: false }); grp.add(new THREE.Mesh(K.merge(glass.map(m => [B.box, 0xffffff, m])), glm));
  for (const id in prints) { const m = new THREE.MeshStandardMaterial({ map: MC.printTex(id), transparent: true, alphaTest: .08, roughness: .85, polygonOffset: true, polygonOffsetFactor: -2 }); det.add(new THREE.Mesh(K.merge(prints[id].map(([g, mm]) => [g, 0xffffff, mm])), m)) }
  for (const id in art) { const m = new THREE.MeshStandardMaterial({ map: MC.artTex(id), roughness: .6 }); m.userData.lin = 1; det.add(new THREE.Mesh(K.merge(art[id].map(([g, mm]) => [g, 0xffffff, mm])), m)) }
  /* interior light so it reads warm at night without a shadow-casting light */
  { const pl = new THREE.PointLight(0xffe2c0, 0, 9, 2); const [x, z] = w2(0, -.5); pl.position.set(x, y0 + 3.4, z); grp.add(pl); ctx.upd.push(() => { const nk = AV.nightK || 0; pl.intensity = .25 + nk * .9; if (MC.shops[W.id].sign) MC.shops[W.id].sign.emissiveIntensity = .35 + nk * .65 }) }
  /* people: staff behind the counter, a mannequin by the window in the house design, the fitting-room reflection */
  const people = []; const actor = (look, lx, lz, yaw, name) => { try { const A = AV.chars.softActor('human', 4242 + people.length * 17, { lod: true, shells: 0, shadow: false, look, name }); const h = new THREE.Group(); const [x, z] = w2(lx, lz); h.position.set(x, y0 + .08, z); h.rotation.y = ry + yaw; h.add(A.root); grp.add(h); const p = { h, A: A.actor, name }; people.push(p); return p } catch (e) { console.warn('merch actor', e); return null } };
  const staff = actor({ sp: sh.key === 'solterra' ? 'human_b' : sh.key === 'moonmelt' ? 'human_b' : 'human_a', height: 1.68, skin: [0xc68642, 0xe0ac69, 0xd8a47a][Object.keys(SHOPS).indexOf(W.id) % 3], hair: 0x2a1a10, style: sh.key === 'moonmelt' ? 'long' : 'bun', shirt: { col: FABRIC.cream[0], print: sh.hero }, pants: { col: 0x2a2a34, kind: 'denim' } }, -hw + 1.6, hd - 2.85, 0, sh.staff[0]);
  if (staff) circ.push([...w2(-hw + 1.6, hd - 2.85), .4]);
  const mq = actor({ sp: 'human_a', height: 1.78, skin: 0xd8d4ce, hair: 0xd8d4ce, style: 'short', shirt: { col: FABRIC.black[0], print: ds[1 % ds.length].id, o: GAR.hoodie.o }, pants: { col: 0x3a3a40, kind: 'twill' } }, 2.7, hd - .9, Math.PI * .1, 'mannequin');   /* behind the right display window, facing the street */
  if (mq) circ.push([...w2(2.7, hd - .9), .45]);
  const S = MC.shops[W.id]; Object.assign(S, { site, grp, det, people, staff, w2, y0, ry, fitting: w2(fx, fz + .3), mirrorAt: w2(fx, mz - .55), counter: w2(-hw + 1.6, hd - 1.35), door: w2(0, hd + 1.2), inside: w2(0, hd - .9), rails: [w2(-hw + 1.4, -1.8), w2(hw - 1.4, .8)], sh });
  S.makeMirror = () => { if (S.double) { const old = S.double; grp.remove(old.h); const i = people.indexOf(old); if (i >= 0) people.splice(i, 1); S.double = null } const w = S.tryOn || MC.wear() || { design: sh.hero, garment: 'tee', color: 'cream' };
    const p = actor({ sp: 'human_a', height: 1.8, skin: 0xdca47c, hair: 0x4a2c18, style: 'messy', beard: true, glasses: true, shirt: { col: FABRIC[w.color || 'cream'][0], print: w.design, o: GAR[w.garment].o }, pants: { fab: 'elephant', shorts: true }, foot: 'flip', shoe: 0x4a5a2a }, fx, mz - .62, 0, 'Ztonedape (mirror)');
    if (p) { S.double = p; S.doubleWear = Object.assign({}, w) } };
  S.makeMirror();
  /* interactions */
  const T = (x, z, r, label, fn) => W.T.push({ x, z, r, label, fn });
  T(...S.counter, 1.6, () => tr('🛍️ ' + sh.brand + ': browse + buy (' + sh.staff[0] + ')', '🛍️ ' + sh.brand + ': mirar y comprar (' + sh.staff[0] + ')'), () => MC.open(W.id));
  S.rails.forEach((r, i) => T(...r, 1.4, () => tr(i ? '🧥 Hoodie rail' : '👕 T-shirt rail', i ? '🧥 Perchero de sudaderas' : '👕 Perchero de camisetas'), () => MC.open(W.id, { garment: i ? 'hoodie' : 'tee' })));
  T(...S.fitting, 1.1, () => tr('🪞 Fitting room: try something on', '🪞 Probador: pruébate algo'), () => MC.open(W.id, { tryOn: true }));
  (W.places = W.places || []).push({ id: 'merch_' + sh.key, name: [sh.brand + ' store', 'Tienda ' + sh.brand], x: S.door[0], z: S.door[1], yaw: ry + Math.PI });
  /* animate the people; hide the interior detail far away */
  ctx.upd.push(dt => { const P = AV.P, d = Math.hypot(P.x - cx, P.z - cz); det.visible = d < 70; for (const p of people) { p.h.visible = d < 60; if (d < 40 && p.A) { if (p.A.play) p.A.play('Idle'); if (p !== mq && p.A.mixer) p.A.mixer.update(dt) } } });
  if (mq && mq.A && mq.A.mixer) { mq.A.play && mq.A.play('Idle'); mq.A.mixer.update(.01) }   /* the mannequin holds still */
  const nd = W.noDecor; W.noDecor = (x, z) => { const lx = (x - cx) * c - (z - cz) * s, lz = (x - cx) * s + (z - cz) * c; return (Math.abs(lx) < hw + 1.2 && lz > -hd - 1.2 && lz < hd + 4) || !!(nd && nd(x, z)) };   /* nothing scattered in or at the store */
  ctx.leave.push(() => { for (const p of people) if (p.A && p.A.mixer) p.A.mixer.stopAllAction(); delete MC.shops[W.id] });
  MC.stats['shop_' + W.id] = { designs: ds.length, x: +cx.toFixed(1), z: +cz.toFixed(1), anchor: site.anchor, backed: site.backed, siteMs: site.ms };
}
MC.refreshMirrors = () => { for (const k in MC.shops) { const S = MC.shops[k]; if (S && S.makeMirror) S.makeMirror() } };
const prevEnter = AV.onWorldEnter; AV.onWorldEnter = function (W) { if (prevEnter) prevEnter(W); register(); const sh = SHOPS[W && W.id]; if (sh && W.ctx && !MC.shops[W.id]) { try { buildShop(W, sh) } catch (e) { console.warn('merch shop failed', e); MC.shops[W.id] = { ok: false, err: String(e) } } } };

/* ---------- the store panel ---------- */
const panel0 = AV.panel; AV.panel = function (id, html) { const p = document.getElementById(id); if (p && id === 'cmp') p.classList.toggle('mz', String(html).indexOf('mz-h') >= 0); return panel0.apply(this, arguments) };   /* the store layout is wider than the other shop panels */
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const CSS = '<style>.mz-h{display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap}.mz-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.mz-tabs button.on,.mz-sw.on,.mz-g.on,.mz-sz.on{outline:2px solid #ffd84a}' +
  '.mz-wrap{display:flex;gap:12px;flex-wrap:wrap}.mz-grid{flex:1 1 300px;display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:8px;max-height:46vh;overflow:auto;padding:2px}.mz-card{background:#1c1a26;border:1px solid #4a4560;border-radius:8px;padding:5px;cursor:pointer;text-align:center;font-size:12px}' +
  '.mz-card.on{outline:2px solid #ffd84a}.mz-card img{width:100%;border-radius:5px;display:block;aspect-ratio:1}.mz-card .own{color:#9af0b8;font-size:11px}.mz-det{flex:1 1 260px;min-width:240px}.mz-row{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0;align-items:center}' +
  '.mz-sw{width:26px;height:26px;border-radius:50%;border:2px solid #fff3;cursor:pointer}.mz-q{font-size:11px;opacity:.75}.mz-rw{opacity:.6;font-size:12px}</style>';
/* 2D mock-up of the garment with the print, as a quick preview (the 3D one is in the fitting-room mirror) */
function mock(cv, d, g, col) { const x = cv.getContext('2d'), W2 = cv.width, H2 = cv.height; x.clearRect(0, 0, W2, H2); const c = '#' + FABRIC[col][0].toString(16).padStart(6, '0'); x.fillStyle = c; x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 2; x.beginPath();
  if (g === 'hoodie') { x.moveTo(70, 40); x.quadraticCurveTo(110, 5, 150, 40); x.lineTo(205, 70); x.lineTo(212, 230); x.lineTo(186, 232); x.lineTo(176, 110); x.lineTo(176, 250); x.lineTo(44, 250); x.lineTo(44, 110); x.lineTo(34, 232); x.lineTo(8, 230); x.lineTo(15, 70); x.closePath() }
  else { x.moveTo(78, 22); x.quadraticCurveTo(110, 42, 142, 22); x.lineTo(205, 50); x.lineTo(186, 100); x.lineTo(168, 92); x.lineTo(168, 250); x.lineTo(52, 250); x.lineTo(52, 92); x.lineTo(34, 100); x.lineTo(15, 50); x.closePath() }
  x.fill(); x.stroke(); const t = MC.printTex(d.id), im = t.image; if (im && im.width) x.drawImage(im, 66, 70, 88, 88); else { const i2 = new Image(); i2.onload = () => mock(cv, d, g, col); i2.src = d.tex } }
MC.open = function (wid, o) {
  o = o || {}; const S = MC.shops[wid]; if (!S || !S.sh) return; const sh = S.sh, ds = designsOf(sh), st = S.ui = S.ui || { col: sh.cols[0], sel: ds[0].id, g: 'tee', fab: 'cream', size: 'M' };
  if (o.garment) st.g = o.garment; const others = Object.keys(SHOPS).filter(k => k !== wid).map(k => SHOPS[k].brand + tr(' (in ', ' (en ') + (AV.worldMeta && AV.worldMeta(k) ? AV.worldMeta(k).name : k) + ')').join(' · ');
  const render = () => { const d = byId[st.sel], wear = MC.wear(), p = PRICE[st.g], own = MC.owns(st.sel, st.g);
    const tabs = sh.cols.map(k => '<button data-col="' + k + '" class="' + (st.col === k ? 'on' : '') + '">' + esc(tr(CAT.collections[k].n[0], CAT.collections[k].n[1])) + '</button>').join('');
    const cards = ds.filter(x => x.collection === st.col).map(x => '<div class="mz-card' + (x.id === st.sel ? ' on' : '') + '" data-d="' + x.id + '"><img alt="" src="' + x.thumb + '">' + esc(nm(x)) + (MC.owns(x.id, 'tee') || MC.owns(x.id, 'hoodie') ? '<div class="own">✓ ' + tr('owned', 'tuyo') + '</div>' : '') + '</div>').join('');
    const sw = Object.keys(FABRIC).map(k => '<span class="mz-sw' + (st.fab === k ? ' on' : '') + '" data-f="' + k + '" title="' + tr(FABRIC[k][1], FABRIC[k][2]) + '" style="background:#' + FABRIC[k][0].toString(16).padStart(6, '0') + '"></span>').join('');
    const h = CSS + '<div class="mz-h"><b>' + esc(sh.brand) + '</b><span>' + tr('Credits', 'Créditos') + ': <b id="mzC">' + AV.S.money + '</b></span></div><div class="note" id="mzM">' + esc(tr(sh.greet[0], sh.greet[1])) + '</div>' +
      '<div class="mz-tabs">' + tabs + '</div><div class="mz-wrap"><div class="mz-grid">' + cards + '</div><div class="mz-det"><b>' + esc(nm(d)) + '</b><div class="mz-q">' + esc(d.brand + ' · ' + tr(CAT.collections[d.collection].n[0], CAT.collections[d.collection].n[1])) + '</div>' +
      '<canvas id="mzP" width="220" height="256" style="width:170px;height:198px;display:block;margin:6px auto"></canvas>' +
      '<div class="mz-row">' + Object.keys(GAR).map(g => '<button class="mz-g' + (st.g === g ? ' on' : '') + '" data-g="' + g + '">' + GAR[g].ic + ' ' + tr(GAR[g].n[0], GAR[g].n[1]) + ' · ' + PRICE[g] + '</button>').join('') + '</div>' +
      '<div class="mz-row">' + sw + '</div><div class="mz-row">' + SIZES.map(z => '<button class="mz-sz' + (st.size === z ? ' on' : '') + '" data-s="' + z + '">' + z + '</button>').join('') + '</div>' +
      '<div class="mz-row"><button id="mzTry">🪞 ' + tr('Try on (mirror)', 'Probar (espejo)') + '</button><button id="mzBuy">' + tr('Buy', 'Comprar') + ' · ' + p + '</button>' + (own ? '<button id="mzWear">' + tr('Wear', 'Ponérmela') + '</button>' : '') + '</div>' +
      '<div class="mz-q">' + (own ? tr('In your backpack', 'En tu mochila') + ' ×' + (AV.bag ? AV.bag.count(MC.itemId(st.sel, st.g)) : 1) + ' · ' : '') + (d.quality === 'concept-crop' ? tr('Draft artwork (concept sheet)', 'Arte en borrador (hoja de conceptos)') : tr('Original artwork', 'Arte original')) + '</div></div></div>' +
      '<div class="mz-row"><span>' + (wear ? tr('Wearing: ', 'Llevas: ') + esc(byId[wear.design].brand + ' · ' + nm(byId[wear.design]) + ' ' + tr(GAR[wear.garment].n[0], GAR[wear.garment].n[1]).toLowerCase()) : tr('Not wearing store clothes.', 'No llevas ropa de la tienda.')) + '</span>' + (wear ? '<button id="mzOff">' + tr('Take off', 'Quitármela') + '</button>' : '') + '</div>' +
      '<div class="mz-rw">' + tr('Also: ', 'También: ') + esc(others) + ' · ' + tr('Real-world store: not available yet.', 'Tienda real: aún no disponible.') + '</div><div class="row"><button data-close>' + tr('Done', 'Listo') + '</button></div>';
    const pn = AV.panel('cmp', h), $ = id => document.getElementById(id); mock($('mzP'), d, st.g, st.fab);
    pn.querySelectorAll('[data-col]').forEach(b => b.onclick = () => { st.col = b.dataset.col; const f = ds.find(x => x.collection === st.col); if (f) st.sel = f.id; render() });
    pn.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { st.sel = b.dataset.d; render() });
    pn.querySelectorAll('[data-g]').forEach(b => b.onclick = () => { st.g = b.dataset.g; render() }); pn.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { st.fab = b.dataset.f; render() }); pn.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { st.size = b.dataset.s; render() });
    $('mzTry').onclick = () => { S.tryOn = { design: st.sel, garment: st.g, color: st.fab, size: st.size }; S.makeMirror(); $('mzM').textContent = tr('Step into the fitting room and look in the mirror.', 'Entra en el probador y mírate en el espejo.') };
    $('mzBuy').onclick = () => { const b = $('mzBuy'); b.disabled = true; setTimeout(() => { b.disabled = false }, 450); if (MC.buy(st.sel, st.g, st.fab, st.size)) { S.tryOn = null; AV.audio && AV.audio.blip && AV.audio.blip(880, .08, 'sine', .06); render(); document.getElementById('mzM').textContent = tr('Thank you! You are wearing it now — it is saved in your backpack.', '¡Gracias! Ya la llevas puesta; queda guardada en tu mochila.') } };
    if ($('mzWear')) $('mzWear').onclick = () => { MC.equip(st.sel, st.g, st.fab, st.size); render() }; if ($('mzOff')) $('mzOff').onclick = () => { MC.takeOff(); render() } };
  if (o.tryOn && MC.wear()) { const w = MC.wear(); st.sel = w.design; st.g = w.garment; st.fab = w.color || st.fab; const dd = byId[w.design]; if (dd && sh.cols.includes(dd.collection)) st.col = dd.collection; else st.sel = ds.find(x => x.collection === st.col).id }
  render() };
})(window.AV);
