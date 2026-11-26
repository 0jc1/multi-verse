/* APEVERSE 2.1 - brand_district.js : BRAND ROW, the Apeverse Brand District pilot (Ape Town, east strip between the Crystal Garden and
   Portal Grove, on ground the old town never used: no existing business, path or interaction is touched).
   One street, six walk-in shops (real door openings, no teleport), each with its own architecture, its own authored sign and
   mounting, an interior with staff, stock you can see, and a working checkout:
     W  SWAG · streetwear            painted graffiti fascia board + neon crown, purple stucco     -> wearable tees / hoodies (M6 system)
     W  GROOVE DEALERS records       red brick, vertical bulb marquee + vinyl-disc sign            -> LPs, Groove Dealers Audio boombox (plays them)
     W  MONKEY BREW taproom          dark timber, round badge on an iron bracket, chalkboard       -> craft beer, kombucha, banana bread (consumables)
     E  WOBLR MOTORS showroom        glass box, backlit channel letters on the canopy              -> Zip-EV electric car you own and drive (garage system)
     E  APEPHONE store               white stone, backlit lightbox                                 -> phone skins (change your ApePhone), ApeCam lens (photo mode)
     E  SOLTERRA LIVING home goods   terracotta stucco, hand-painted wall letters, striped awning  -> furniture for your apartment (home stock), Glomotel lamp
   Street: ApeMart kiosk (groceries), two PuffPop vending machines (snacks / soda), a Zippit e-scooter dock (rental), a gateway arch.
   Brands are the owner's fictional concepts (data/BRAND_REGISTRY.csv); the concept boards are NOT used as textures: every sign is
   lettered here.  "Banana Republic" (a real trademark) is not used; its snack line is renamed BANANARCHY.
   PERFORMANCE: all static geometry is merged into 3 meshes (solid, unlit glow, glass) and every sign is a quad in ONE canvas atlas
   (1 draw call for all signage); no new light sources (emissive only).  Staff are ordinary villager NPCs (LOD'd by perf_guard).
   Save: purchases use the existing systems (S.items, S.wear, S.veh, S.homes stock); optional S.v21 = { skin, deliver{}, lp }. */
'use strict';
(function (AV) {
const tr = AV.tr, L = (e, s) => [e, s], say = a => tr(a[0], a[1]), K = AV.kit, BG = K.BG, TAU = Math.PI * 2;
const BD = AV.brandDistrict = { stats: {}, shops: {} };
const st = () => { const S = AV.S; S.v21 = S.v21 || {}; S.v21.deliver = S.v21.deliver || {}; return S.v21 };
const WID = 'ape_town', SX0 = 56, SX1 = 64, ZN = -48, ZS = 8;   /* street: x 56..64, from z -48 (north) to 8 (south) */

/* ======================= items (new SKUs only where nothing existing fits; existing ids reused) ======================= */
const I = (id, o) => { if (!AV.ITEMS[id]) AV.ITEMS[id] = o };
I('mb_hazy', { n: L('Monkey Brew Hazy Banana Ale', 'Monkey Brew Hazy Banana Ale'), cat: 'drink', ic: '🍺', use: 'drink', fx: { type: 'drink', amt: .3 }, model: 'bottle', col: 0xf2c230, price: 12, say: L('Cloudy, banana-sweet, dangerously drinkable.', 'Turbia, dulce de plátano, peligrosamente fácil de beber.') });
I('mb_ipa', { n: L('Monkey Brew Jungle IPA', 'Monkey Brew Jungle IPA'), cat: 'drink', ic: '🍺', use: 'drink', fx: { type: 'drink', amt: .35 }, model: 'bottle', col: 0x3aa85a, price: 13, say: L('Piney, bitter, very ape.', 'Resinosa, amarga, muy simia.') });
I('mb_kombucha', { n: L('Monkey Brew Tropic Ginger Kombucha (alcohol-free)', 'Kombucha Tropic Ginger Monkey Brew (sin alcohol)'), cat: 'drink', ic: '🧃', use: 'drink', fx: { type: 'sober', amt: .15 }, model: 'bottle', col: 0xff7ab0, price: 8, say: L('Fizzy, gingery, wakes you up a bit.', 'Burbujeante, con jengibre, te despierta un poco.') });
I('mb_bread', { n: L('Banana bread slice', 'Porción de pan de plátano'), cat: 'food', ic: '🍞', use: 'eat', model: 'bowl', col: 0xb8803a, price: 6, say: L('Warm, crumbly, still a little gooey.', 'Templado, esponjoso, aún algo meloso.') });
I('pp_puffs', { n: L('PuffPop Banana Puffs', 'PuffPop Banana Puffs'), cat: 'food', ic: '🍿', use: 'eat', model: 'sack', col: 0xf4d23a, price: 4, say: L('Airy, salty-sweet, gone in a minute.', 'Ligeras, saladas y dulces, desaparecen en un minuto.') });
I('pp_tropic', { n: L('PuffPop Tropic Fizz', 'PuffPop Tropic Fizz'), cat: 'drink', ic: '🥤', use: 'drink', fx: { type: 'buzz', amt: .1 }, model: 'bottle', col: 0xff8a3a, price: 4, say: L('Mango-pineapple soda. Sugar rush incoming.', 'Refresco de mango y piña. Subidón de azúcar.') });
I('pp_grape', { n: L('PuffPop Grape Fizz', 'PuffPop Grape Fizz'), cat: 'drink', ic: '🥤', use: 'drink', fx: { type: 'buzz', amt: .08 }, model: 'bottle', col: 0x8a4ad8, price: 4, say: L('Purple, bubbly, tastes like a cartoon.', 'Morado, con burbujas, sabe a dibujo animado.') });
I('am_bananas', { n: L('ApeMart banana bunch', 'Racimo de plátanos ApeMart'), cat: 'food', ic: '🍌', use: 'eat', model: 'sack', col: 0xf4d23a, price: 3, say: L('Potassium. Respect.', 'Potasio. Respeto.') });
I('am_noodles', { n: L('ApeMart cup noodles', 'Fideos instantáneos ApeMart'), cat: 'food', ic: '🍜', use: 'eat', model: 'bowl', col: 0xd8a040, price: 5, say: L('Three minutes of patience, one minute of joy.', 'Tres minutos de paciencia, un minuto de alegría.') });
I('bn_chips', { n: L('BANANARCHY banana chips', 'Chips de plátano BANANARCHY'), cat: 'food', ic: '🍌', use: 'eat', model: 'sack', col: 0x2a2a2a, price: 4, say: L('Crunchy rebellion, lightly salted.', 'Rebelión crujiente, poco salada.') });
const LPS = { gd_lp_dub: ['jungle_dub', L('Jungle Dub Sessions (LP)', 'Jungle Dub Sessions (LP)')], gd_lp_sab: ['stone_ape_band', L('Stone Ape Band · Live Cuts (LP)', 'Stone Ape Band · Live Cuts (LP)')], gd_lp_road: ['chiang_mai', L('Wanderlust Road Tapes (LP)', 'Wanderlust Road Tapes (LP)')] };
for (const [id, [pl, n]] of Object.entries(LPS)) I(id, { n: [n[0] + ' · Groove Dealers pressing', n[1] + ' · edición Groove Dealers'], cat: 'souvenir', ic: '💿', use: 'look', keep: true, model: 'card', col: 0x1a1a1a, price: 25, lp: pl, say: L('Heavy vinyl, gatefold sleeve. Play it on a record player or the Groove Dealers boombox.', 'Vinilo pesado, funda desplegable. Ponlo en un tocadiscos o en el boombox de Groove Dealers.') });
I('gd_boombox', { n: L('Groove Dealers Audio boombox', 'Boombox Groove Dealers Audio'), cat: 'misc', ic: '📻', use: 'look', keep: true, model: 'drum', col: 0x2a2a2e, price: 90, say: L('Click. The bass wakes up.', 'Clic. El bajo despierta.'), onUse: () => BD.boombox() });
const SKINS = { ap_skin_banana: ['#3a2a08', '#c89a1a', '#f2d23a', L('Banana Gold', 'Plátano Dorado')], ap_skin_neon: ['#08202a', '#1aa8a0', '#ff4ad2', L('Neon Jungle', 'Jungla Neón')], ap_skin_graphite: ['#101014', '#2a2a32', '#8a8a9a', L('Graphite', 'Grafito')], ap_skin_classic: ['#20123a', '#3a1c5a', '#1a2a4a', L('Classic Cosmic (original)', 'Cósmico clásico (original)')] };
for (const [id, s] of Object.entries(SKINS)) I(id, { n: ['ApePhone skin · ' + s[3][0], 'Funda ApePhone · ' + s[3][1]], cat: 'misc', ic: '📱', use: 'look', keep: true, model: 'card', col: parseInt(s[1].slice(1), 16), price: id === 'ap_skin_classic' ? 5 : 30, say: L('Snap. Your ApePhone has a new look (Z to open it).', 'Clac. Tu ApePhone tiene un look nuevo (Z para abrirlo).'), onUse: () => BD.skin(id) });
I('ap_lens', { n: L('ApeCam clip-on lens kit', 'Kit de lentes ApeCam'), cat: 'souvenir', ic: '📷', use: 'photo', keep: true, model: 'cube', col: 0x1a1a24, price: 45, say: L('Wide, fisheye, macro. Frame it.', 'Gran angular, ojo de pez, macro. Encuádralo.') });

/* ---------- phone skins: one style tag over apephone.js (the phone UI itself is untouched) ---------- */
const skinCss = document.createElement('style'); skinCss.id = 'apSkin'; document.head.appendChild(skinCss);
BD.applySkin = () => { const id = AV.S && AV.S.v21 && AV.S.v21.skin, s = id && SKINS[id]; skinCss.textContent = s && id !== 'ap_skin_classic' ? '#cmp .phone{background:linear-gradient(160deg,' + s[0] + ',' + s[1] + ' 60%,' + s[0] + ')!important;border-color:' + s[2] + '!important;box-shadow:0 0 0 2px ' + s[2] + '66,0 8px 30px rgba(0,0,0,.5)!important}' : '' };
BD.skin = id => { st().skin = id; BD.applySkin(); AV.save(); BD.stats.skin = id };

/* ---------- Groove Dealers boombox: plays the LPs you own, positional on you; use again = next LP, then off ---------- */
let bbMusic0 = null; BD.boombox = function () { const W = AV.W; if (!W) return; const own = Object.keys(LPS).filter(k => AV.bag.count(k) > 0); const S2 = st();
  if (!own.length) return AV.toast(tr('The boombox needs a Groove Dealers LP (buy one on Brand Row).', 'El boombox necesita un LP de Groove Dealers (cómpralo en Brand Row).'));
  const i = S2.lp == null ? 0 : own.indexOf(S2.lp) + 1; if (i >= own.length) { S2.lp = null; BD.boomOff(); AV.toast('📻 ' + tr('Boombox off.', 'Boombox apagado.')); return }
  S2.lp = own[i]; if (bbMusic0 === null) bbMusic0 = W.music || false; W.music = { playlist: LPS[S2.lp][0], bed: .8 }; AV.audio && AV.audio.setWorld && AV.audio.setWorld(W); BD.stats.boombox = S2.lp;
  AV.toast('📻 ' + tr('Now playing: ', 'Suena: ') + say(LPS[S2.lp][1]) + tr(' · use again: next / off', ' · úsalo otra vez: siguiente / apagar')) };
BD.boomOff = () => { const W = AV.W; if (bbMusic0 === null || !W) return; W.music = bbMusic0 || undefined; bbMusic0 = null; AV.audio && AV.audio.setWorld && AV.audio.setWorld(W); BD.stats.boombox = null };

/* ---------- SOLTERRA Living furniture: joins the home furniture catalogue (housing.js), delivered to your home stock ---------- */
const FURN = {
  sol_rattan: { n: L('SOLTERRA rattan lounge chair', 'Butaca de ratán SOLTERRA'), ic: '🪑', p: 140, w: .9, d: .9, parts: () => [[BG.cyl, 0xc8a066, K.M(0, .22, 0, .42, .44, .42)], [BG.hem, 0xc8a066, K.M(0, .45, -.05, .45, .5, .42, -.35, 0, 0)], [BG.cyl, 0xf2e6d2, K.M(0, .47, .02, .36, .08, .36)], [BG.box, 0xd8663a, K.M(0, .62, -.22, .4, .22, .1)]] },
  sol_rug: { n: L('SOLTERRA sunrise rug', 'Alfombra amanecer SOLTERRA'), ic: '🟧', p: 80, w: 2, d: 1.4, flat: true, parts: () => [[BG.box, 0xf2e6d2, K.M(0, .012, 0, 2, .02, 1.4)], [BG.cyl, 0xd8663a, K.M(0, .022, .2, .55, .01, .55)], [BG.box, 0xc8572e, K.M(0, .026, -.3, 1.6, .01, .08)], [BG.box, 0x2e5fa8, K.M(0, .026, -.45, 1.6, .01, .06)]] },
  sol_olive: { n: L('SOLTERRA terracotta olive planter', 'Macetero de olivo SOLTERRA'), ic: '🫒', p: 60, w: .6, d: .6, parts: () => [[BG.tcyl, 0xc8643a, K.M(0, .25, 0, .28, .5, .28)], [BG.cyl, 0x6a4a2a, K.M(0, .8, 0, .04, .7, .04)], [BG.sph, 0x7a8a4a, K.M(0, 1.2, 0, .38, .3, .38)], [BG.sph, 0x8a9a5a, K.M(.15, 1.35, .05, .25, .2, .25)]] },
  glo_lamp: { n: L('Glomotel mushroom mood lamp', 'Lámpara seta Glomotel'), ic: '🍄', p: 85, w: .5, d: .5, glow: true, parts: () => [[BG.cyl, 0xf4ead8, K.M(0, .28, 0, .09, .56, .09)], [BG.hem, 0xff6ad8, K.M(0, .55, 0, .3, .22, .3), 1], [BG.sph, 0xffffff, K.M(.1, .68, .05, .04, .04, .04), 1], [BG.sph, 0xffffff, K.M(-.08, .66, -.1, .035, .035, .035), 1], [BG.cyl, 0x2a2a2a, K.M(0, .02, 0, .2, .04, .2)]] }
};
function registerFurniture() { const H = AV.home; if (!H || !H.CAT) return; for (const k in FURN) { if (!H.CAT[k]) H.CAT[k] = FURN[k]; if (H.ORDER && H.ORDER.indexOf(k) < 0) H.ORDER.push(k) } }
registerFurniture();
/* a home you rent or own receives deliveries; with none, they wait (shown in the store) and arrive at your next home */
BD.homeId = () => { const hs = AV.S.homes || {}; return Object.keys(hs).find(k => hs[k] && (hs[k].st === 'own' || (hs[k].st === 'rent' && hs[k].until >= AV.S.day))) || null };
BD.flush = () => { const pid = BD.homeId(), d = st().deliver; if (!pid) return 0; const r = AV.S.homes[pid]; r.stock = r.stock || {}; let n = 0; for (const k in d) { if (d[k] > 0) { r.stock[k] = (r.stock[k] || 0) + d[k]; n += d[k] } delete d[k] } if (n) AV.save(); return n };
BD.buyFurniture = k => { const F = FURN[k]; if (!F) return false; if (!AV.txn(-F.p, 'SOLTERRA Living: ' + say(F.n))) return false; const pid = BD.homeId();
  if (pid) { const r = AV.S.homes[pid]; r.stock = r.stock || {}; r.stock[k] = (r.stock[k] || 0) + 1 } else st().deliver[k] = (st().deliver[k] || 0) + 1; AV.save(); BD.stats.furn = (BD.stats.furn || 0) + 1; return pid || 'pending' };
if (AV.home && AV.home.panel) { const p0 = AV.home.panel; AV.home.panel = function () { registerFurniture(); BD.flush(); return p0.apply(this, arguments) } }

/* ---------- Woblr Zip-EV: the vehicle mesh (front +z, ground y 0), registered as vehicle kind 'woblr' ---------- */
if (AV.veh) { AV.veh.extraGeo = AV.veh.extraGeo || {};
  AV.veh.extraGeo.woblr = col => K.merge([[BG.sph, col, K.M(0, .72, 0, .86, .6, 1.55)], [BG.box, col, K.M(0, .45, 0, 1.62, .42, 2.7)], [BG.sph, 0x1e2a36, K.M(0, 1.1, -.12, .72, .5, 1.02)], [BG.box, 0xf4f0e8, K.M(0, .5, 1.42, 1.3, .14, .08)],
    ...[[-.72, .95], [.72, .95], [-.72, -.95], [.72, -.95]].flatMap(([x, z]) => [[BG.cyl, 0x141414, K.M(x, .32, z, .32, .2, .32, 0, 0, Math.PI / 2)], [BG.cyl, 0xd8d8de, K.M(x * 1.04, .32, z, .18, .21, .18, 0, 0, Math.PI / 2)]]),
    [BG.sph, 0xfff4d8, K.M(-.52, .72, 1.38, .16, .13, .06), 1], [BG.sph, 0xfff4d8, K.M(.52, .72, 1.38, .16, .13, .06), 1], [BG.box, 0xd82a2a, K.M(-.55, .7, -1.36, .28, .1, .04), 1], [BG.box, 0xd82a2a, K.M(.55, .7, -1.36, .28, .1, .04), 1],
    [BG.box, 0xf2c230, K.M(0, .92, 1.42, .22, .12, .03), .6], [BG.box, 0xf4f0e8, K.M(0, .62, -1.42, .5, .14, .03)]]) }
const ZIP = { kind: 'woblr', model: L('Woblr Zip-EV', 'Woblr Zip-EV'), price: 1500, cols: [0x9ae8d0, 0xc8a8f0, 0xf2d23a, 0xf4f4f0, 0xff8aa8] };
if (AV.garage && AV.garage.DEAL && !AV.garage.DEAL.woblr) AV.garage.DEAL.woblr = { id: 'woblr_row', name: L('Woblr Motors · Brand Row', 'Woblr Motors · Brand Row'), stock: [ZIP] };   /* key is not a world id: no Madrid-style lot is built; used for resale value */

/* ======================= sign atlas: every sign in one canvas (one material, one draw call) ======================= */
const AT = { W: 2048, H: 2048, r: {} };
function atlasBuild() { const c = document.createElement('canvas'); c.width = AT.W; c.height = AT.H; const g = c.getContext('2d'); g.clearRect(0, 0, AT.W, AT.H); let x = 0, y = 0, rowH = 0;
  const shelves = []; let top = 0; for (const [k, w, h, fn] of SIGNS.slice().sort((a, b) => b[2] - a[2] || b[1] - a[1])) { let s2 = shelves.find(q => q.h >= h && q.x + w <= AT.W); if (!s2) { if (top + h > AT.H) { (AT.over = AT.over || []).push(k); console.warn('sign atlas full: ' + k); continue } s2 = { y: top, h, x: 0 }; shelves.push(s2); top += h + 4 } x = s2.x; y = s2.y; s2.x += w + 4;   /* best-fit shelves, tallest first */ g.save(); g.translate(x, y); g.beginPath(); g.rect(0, 0, w, h); g.clip(); try { fn(g, w, h) } catch (e) { console.warn('sign', k, e) } g.restore(); AT.r[k] = [x / AT.W, 1 - (y + h) / AT.H, w / AT.W, h / AT.H] }
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; AT.tex = t; AT.canvas = c; return t }
const fitText = (g, txt, w, px, fam, y, x) => { let n = px; do { g.font = fam.replace('#', n); n -= 2 } while (g.measureText(txt).width > w && n > 10); g.fillText(txt, x == null ? 0 : x, y) };
const rr = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath() };
const crownPath = (g, cx, cy, s) => { g.beginPath(); g.moveTo(cx - 60 * s, cy + 30 * s); g.lineTo(cx - 70 * s, cy - 30 * s); g.lineTo(cx - 35 * s, cy); g.lineTo(cx, cy - 45 * s); g.lineTo(cx + 35 * s, cy); g.lineTo(cx + 70 * s, cy - 30 * s); g.lineTo(cx + 60 * s, cy + 30 * s); g.closePath() };
const graffiti = (g, txt, cx, cy, size, fill, out) => { g.font = '900 ' + size + 'px Impact, "Arial Black", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; const ws = [...txt].map(ch => g.measureText(ch).width * .92), tot = ws.reduce((a, b) => a + b, 0); let x = cx - tot / 2;
  [...txt].forEach((ch, i) => { g.save(); g.translate(x + ws[i] / 2, cy + Math.sin(i * 1.7) * size * .05); g.rotate(i % 2 ? .06 : -.06); g.lineWidth = size * .18; g.strokeStyle = out; g.strokeText(ch, 0, 0); g.fillStyle = fill; g.fillText(ch, 0, 0); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillText(ch, -size * .03, -size * .04); g.restore(); x += ws[i] }) };
const SIGNS = [
  /* SWAG: hand-painted fascia board, wood frame, cream graffiti letters, crown, spray drips */
  ['swag_fascia', 1024, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#5a2a8a'); gr.addColorStop(.5, '#a83aa8'); gr.addColorStop(1, '#ff5ab0'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.strokeStyle = '#3a2416'; g.lineWidth = 18; g.strokeRect(9, 9, w - 18, h - 18);
    g.fillStyle = 'rgba(255,255,255,.08)'; for (let i = 0; i < 40; i++) { g.beginPath(); g.arc(Math.random() * w, Math.random() * h, 2 + Math.random() * 6, 0, 7); g.fill() } graffiti(g, 'SWAG', w / 2 - 40, h / 2 + 12, 170, '#f4ead0', '#1b1320');
    g.fillStyle = '#f2c230'; g.strokeStyle = '#1b1320'; g.lineWidth = 5; crownPath(g, w / 2 + 150, 64, .55); g.fill(); g.stroke(); g.font = 'bold 30px "Arial Black", sans-serif'; g.fillStyle = '#f4ead0'; g.textAlign = 'right'; g.fillText('STREETWEAR · ART · MUSIC', w - 40, h - 34) }],
  ['swag_poster', 256, 384, (g, w, h) => { g.fillStyle = '#1b1320'; g.fillRect(0, 0, w, h); g.fillStyle = '#ff5ab0'; g.fillRect(12, 12, w - 24, h - 24); graffiti(g, 'SWAG', w / 2, 150, 92, '#f4ead0', '#1b1320'); g.fillStyle = '#1b1320'; g.font = 'bold 26px "Arial Black", sans-serif'; g.textAlign = 'center'; g.fillText('NEW DROP', w / 2, 250); g.font = 'bold 20px Arial'; g.fillText('tees 70 · hoodies 120', w / 2, 290); g.fillText('wear it out today', w / 2, 320) }],
  /* GROOVE DEALERS: vertical marquee (enamel red, cream letters, bulb dots) + round vinyl disc sign */
  ['groove_blade', 256, 1024, (g, w, h) => { g.fillStyle = '#8a1a1a'; rr(g, 6, 6, w - 12, h - 12, 30); g.fill(); g.strokeStyle = '#f4e0a8'; g.lineWidth = 10; g.stroke(); g.fillStyle = '#fff4c8'; for (let y = 30; y < h - 20; y += 34) for (const x of [26, w - 26]) { g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill() }
    g.fillStyle = '#f4e0a8'; g.textAlign = 'center'; g.font = '900 92px Georgia, serif'; [...'GROOVE'].forEach((ch, i) => g.fillText(ch, w / 2, 120 + i * 98)); g.font = 'italic 700 38px Georgia'; g.fillText('dealers', w / 2, 760); g.font = 'bold 28px Georgia'; g.fillText('RECORDS', w / 2, 830); g.fillText('& AUDIO', w / 2, 866) }],
  ['groove_disc', 256, 256, (g, w, h) => { g.fillStyle = '#111'; g.beginPath(); g.arc(128, 128, 122, 0, 7); g.fill(); g.strokeStyle = '#2a2a2a'; g.lineWidth = 2; for (let r = 60; r < 118; r += 7) { g.beginPath(); g.arc(128, 128, r, 0, 7); g.stroke() } g.fillStyle = '#d82a2a'; g.beginPath(); g.arc(128, 128, 52, 0, 7); g.fill(); g.fillStyle = '#f4e0a8'; g.textAlign = 'center'; g.font = 'bold 22px Georgia'; g.fillText('GROOVE', 128, 122); g.fillText('DEALERS', 128, 146); g.fillStyle = '#111'; g.beginPath(); g.arc(128, 128, 6, 0, 7); g.fill() }],
  ['groove_sleeves', 512, 256, (g, w, h) => { const cols = ['#d82a2a', '#f2c230', '#2a8ad8', '#3aa85a', '#8a4ad8', '#ff7a2a', '#1a1a1a', '#f4ead0']; for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) { const x = i * 128, y = j * 128, c = cols[(i * 3 + j * 5) % cols.length]; g.fillStyle = c; g.fillRect(x + 4, y + 4, 120, 120); g.fillStyle = 'rgba(0,0,0,.5)'; g.beginPath(); g.arc(x + 64 + (i % 2 ? 10 : -10), y + 64, 34, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = 'bold 13px Arial'; g.textAlign = 'center'; g.fillText(['DUB', 'LIVE', 'ROAD', 'RARE', 'NEW', 'B-SIDE', 'RE-ISSUE', 'DEEP'][(i + j * 4) % 8], x + 64, y + 116) } }],
  /* MONKEY BREW: round illuminated badge, timber fascia lettering, chalkboard menus */
  ['brew_badge', 256, 256, (g, w, h) => { g.fillStyle = '#1f3a2a'; g.beginPath(); g.arc(128, 128, 124, 0, 7); g.fill(); g.strokeStyle = '#f2c230'; g.lineWidth = 8; g.stroke(); g.fillStyle = '#5a3a24'; g.beginPath(); g.arc(128, 112, 46, 0, 7); g.fill(); g.fillStyle = '#c89a6a'; g.beginPath(); g.ellipse(128, 124, 30, 24, 0, 0, 7); g.fill(); for (const s of [-1, 1]) { g.fillStyle = '#5a3a24'; g.beginPath(); g.arc(128 + s * 48, 104, 16, 0, 7); g.fill(); g.fillStyle = '#1a1a1a'; g.fillRect(128 + s * 16 - 12, 104, 24, 9) }
    g.fillStyle = '#f4ead0'; g.textAlign = 'center'; g.font = '900 34px Georgia'; g.fillText('MONKEY', 128, 196); g.fillText('BREW', 128, 228) }],
  ['brew_fascia', 896, 160, (g, w, h) => { g.fillStyle = '#2a1e14'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 64) { g.fillStyle = x % 128 ? '#33261a' : '#2e2216'; g.fillRect(x, 0, 62, h) } g.fillStyle = '#f2c230'; g.textAlign = 'center'; g.textBaseline = 'middle'; fitText(g, 'MONKEY BREW', w - 110, 96, '900 #px Georgia, serif', 70, w / 2); g.fillStyle = '#e8dcc0'; fitText(g, 'craft beer · kombucha · banana bread · taproom', w - 80, 26, 'italic #px Georgia', 136, w / 2) }],
  ['brew_chalk', 256, 320, (g, w, h) => { g.fillStyle = '#5a3a24'; g.fillRect(0, 0, w, h); g.fillStyle = '#1e2420'; g.fillRect(12, 12, w - 24, h - 24); g.fillStyle = '#f4f0e8'; g.textAlign = 'center'; g.font = 'bold 28px "Comic Sans MS", cursive'; g.fillText('ON TAP', w / 2, 50); g.font = '20px "Comic Sans MS", cursive'; g.textAlign = 'left';
    [['Hazy Banana Ale', 12], ['Jungle IPA', 13], ['Kombucha (0%)', 8], ['Banana bread', 6]].forEach(([n, p], i) => { g.fillText(n, 24, 100 + i * 46); g.textAlign = 'right'; g.fillText(p + ' ¢', w - 24, 100 + i * 46); g.textAlign = 'left' }); g.fillStyle = '#f2c230'; g.font = '16px "Comic Sans MS", cursive'; g.fillText('drink water · ride home', 24, 296) }],
  /* WOBLR MOTORS: channel letters (transparent background, alpha cut), wall graphic */
  ['woblr_letters', 1024, 160, (g, w, h) => { g.clearRect(0, 0, w, h); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#1e2a36'; fitText(g, 'WOBLR', 600, 140, '900 #px "Arial Rounded MT Bold", "Arial Black", sans-serif', 78, 420); g.fillStyle = '#5ad8b8'; fitText(g, 'MOTORS', 300, 60, '800 #px Arial, sans-serif', 84, 860);
    g.fillStyle = '#5ad8b8'; rr(g, 40, 40, 110, 70, 30); g.fill(); g.fillStyle = '#1e2a36'; for (const x of [65, 125]) { g.beginPath(); g.arc(x, 112, 16, 0, 7); g.fill() } }],
  ['woblr_wall', 512, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#9ae8d0'); gr.addColorStop(1, '#c8a8f0'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#1e2a36'; g.font = '900 54px "Arial Black", sans-serif'; g.textAlign = 'left'; g.fillText('Zip-EV', 30, 80); g.font = 'bold 26px Arial'; g.fillText('Big ape energy in a tiny ride.', 30, 124); g.font = '22px Arial'; g.fillText('100% electric · parks anywhere · 1500 ¢', 30, 164); g.fillText('Mint · Lilac · Sun · Pearl · Coral', 30, 200) }],
  /* APEPHONE: backlit lightbox */
  ['phone_box', 512, 256, (g, w, h) => { g.fillStyle = '#f8f8fa'; rr(g, 4, 4, w - 8, h - 8, 24); g.fill(); g.fillStyle = '#20123a'; rr(g, 40, 54, 92, 150, 18); g.fill(); g.fillStyle = '#7ad8ff'; rr(g, 50, 70, 72, 112, 8); g.fill(); g.fillStyle = '#20123a'; g.textAlign = 'left'; g.textBaseline = 'middle'; fitText(g, 'ApePhone', w - 180, 82, '800 #px Arial, sans-serif', 112, 156); g.fillStyle = '#6a5a8a'; fitText(g, 'skins · lenses · official store', w - 180, 28, '600 #px Arial', 178, 160) }],
  ['phone_wall', 512, 256, (g, w, h) => { g.fillStyle = '#20123a'; g.fillRect(0, 0, w, h); const cols = [['#c89a1a', '#f2d23a'], ['#1aa8a0', '#ff4ad2'], ['#2a2a32', '#8a8a9a'], ['#3a1c5a', '#1a2a4a']]; cols.forEach((c, i) => { const x = 30 + i * 120, gr = g.createLinearGradient(x, 40, x + 90, 200); gr.addColorStop(0, c[0]); gr.addColorStop(1, c[1]); g.fillStyle = gr; rr(g, x, 40, 90, 160, 16); g.fill() });
    g.fillStyle = '#fff'; g.font = 'bold 24px Arial'; g.textAlign = 'center'; g.fillText('New skins for your ApePhone', w / 2, 232) }],
  /* SOLTERRA LIVING: hand-painted wall lettering (straight on the stucco), and the store's poster */
  ['sol_wall', 896, 160, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#c8572e'; g.textAlign = 'center'; g.textBaseline = 'middle'; fitText(g, 'SOLTERRA', w - 200, 100, '900 #px "Arial Rounded MT Bold", "Arial Black", sans-serif', 64, w / 2); g.fillStyle = '#2e5fa8'; fitText(g, 'L I V I N G  ·  home goods for a slower planet', w - 60, 32, '600 #px Georgia', 134, w / 2) }],
  ['sol_poster', 256, 256, (g, w, h) => { g.fillStyle = '#f4ead8'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffb02a'; g.beginPath(); g.arc(128, 120, 64, 0, 7); g.fill(); g.fillStyle = '#d8663a'; g.fillRect(0, 150, w, 60); g.fillStyle = '#2e5fa8'; g.font = 'bold 24px Georgia'; g.textAlign = 'center'; g.fillText('more sun,', 128, 236); g.fillStyle = '#c8572e'; g.fillText('less worries', 128, 36) }],
  /* street: ApeMart fascia, PuffPop vending front, Zippit dock, gateway arch, district map board */
  ['apemart', 768, 160, (g, w, h) => { g.fillStyle = '#1f4ab8'; g.fillRect(0, 0, w, h); g.fillStyle = '#d82a2a'; g.fillRect(0, h - 30, w, 18); g.fillStyle = '#fff'; g.strokeStyle = '#fff'; g.lineWidth = 8; g.beginPath(); g.moveTo(40, 40); g.lineTo(62, 40); g.lineTo(80, 100); g.lineTo(140, 100); g.lineTo(152, 58); g.lineTo(70, 58); g.stroke(); for (const x of [90, 132]) { g.beginPath(); g.arc(x, 114, 7, 0, 7); g.fill() }
    g.font = '900 86px Arial, sans-serif'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('ApeMart', 180, 72); g.font = '600 22px Arial'; g.fillText('the everyday store for apes · open late', 184, 116) }],
  ['puffpop', 256, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#8a3ad8'); gr.addColorStop(1, '#ff5ab0'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.strokeStyle = '#5a1a8a'; g.lineWidth = 10; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '900 70px "Arial Rounded MT Bold", "Arial Black", sans-serif'; g.strokeText('Puff', w / 2, 66); g.fillText('Puff', w / 2, 66); g.strokeText('Pop', w / 2, 136); g.fillText('Pop', w / 2, 136);
    g.fillStyle = 'rgba(20,10,30,.55)'; rr(g, 24, 184, w - 48, 250, 14); g.fill(); const it = [['#f4d23a', 'PUFFS'], ['#ff8a3a', 'TROPIC'], ['#8a4ad8', 'GRAPE']]; it.forEach(([c, t], i) => { for (let k = 0; k < 3; k++) { g.fillStyle = c; rr(g, 40 + k * 60, 200 + i * 78, 46, 56, 8); g.fill() } g.fillStyle = '#fff'; g.font = 'bold 14px Arial'; g.fillText(t + ' · 4 ¢', w / 2, 266 + i * 78) }); g.fillStyle = '#1a1a1a'; g.fillRect(40, 448, w - 80, 40) }],
  ['zippit', 384, 128, (g, w, h) => { g.fillStyle = '#c8f03a'; g.fillRect(0, 0, w, h); g.fillStyle = '#1a1a1a'; g.font = 'italic 900 70px "Arial Black", sans-serif'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('⚡Zippit', 20, 56); g.font = 'bold 20px Arial'; g.fillText('e-scooters · 4 ¢ until midnight', 24, 106) }],
  ['arch', 896, 160, (g, w, h) => { g.fillStyle = '#1b1320'; g.fillRect(0, 0, w, h); const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#ff5ab0'); gr.addColorStop(.5, '#f2c230'); gr.addColorStop(1, '#5ad8b8'); g.fillStyle = gr; g.textAlign = 'center'; g.textBaseline = 'middle'; fitText(g, 'BRAND ROW', w - 200, 90, '900 #px Impact, "Arial Black", sans-serif', 68, w / 2); g.fillStyle = '#f4ead0'; fitText(g, 'APEVERSE BRAND DISTRICT · shop · eat · ride · repeat', w - 60, 26, '600 #px Arial', 136, w / 2) }],
  ['map_board', 512, 384, (g, w, h) => { g.fillStyle = '#f4ead8'; g.fillRect(0, 0, w, h); g.fillStyle = '#1b1320'; g.font = 'bold 34px Georgia'; g.textAlign = 'center'; g.fillText('BRAND ROW', w / 2, 46); g.fillStyle = '#c8c0b0'; g.fillRect(w / 2 - 30, 70, 60, 290); g.font = 'bold 18px Arial';
    const W2 = [['SWAG', '#a83aa8'], ['GROOVE DEALERS', '#8a1a1a'], ['MONKEY BREW', '#1f3a2a']], E2 = [['WOBLR MOTORS', '#2a8a7a'], ['APEPHONE', '#20123a'], ['SOLTERRA LIVING', '#c8572e']];
    W2.forEach(([t, c], i) => { g.fillStyle = c; g.fillRect(20, 80 + i * 96, 200, 80); g.fillStyle = '#fff'; g.fillText(t, 120, 126 + i * 96) }); E2.forEach(([t, c], i) => { g.fillStyle = c; g.fillRect(w - 220, 80 + i * 96, 200, 80); g.fillStyle = '#fff'; g.fillText(t, w - 120, 126 + i * 96) }); g.fillStyle = '#d82a2a'; g.beginPath(); g.arc(w / 2, 350, 10, 0, 7); g.fill(); g.fillStyle = '#1b1320'; g.font = '16px Arial'; g.fillText('you are here', w / 2, 376) }]
];

/* ======================= geometry batches ======================= */
function batches() { const solid = [], glow = [], glass = [], quads = [];
  const box = (arr, hex, x0, x1, y0, y1, z0, z1, gl) => arr.push([BG.box, hex, K.M((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0)), gl || 0]);
  const part = (arr, geo, hex, x, y, z, sx, sy, sz, rx, ry, rz, gl) => arr.push([geo, hex, K.M(x, y, z, sx, sy, sz, rx, ry, rz), gl || 0]);
  /* sign quad: centre, size, facing yaw (0 = facing +z), atlas region; double = also the back side */
  const quad = (key, cx, cy, cz, w, h, ry, dbl) => { quads.push({ key, cx, cy, cz, w, h, ry }); if (dbl) quads.push({ key, cx: cx - Math.sin(ry) * .01, cy, cz: cz - Math.cos(ry) * .01, w, h, ry: ry + Math.PI }) };
  return { solid, glow, glass, quads, box, part, quad } }
function quadGeo(quads) { const n = quads.length, pos = new Float32Array(n * 18), nor = new Float32Array(n * 18), uv = new Float32Array(n * 12); let o = 0;
  quads.forEach(q => { const r = AT.r[q.key]; if (!r) return; const c = Math.cos(q.ry), s = Math.sin(q.ry), hw = q.w / 2, hh = q.h / 2;
    const P = (a, b) => [q.cx + a * c, q.cy + b, q.cz - a * s];   /* local +x of a plane facing +z, rotated by ry about y */
    const v = [[P(-hw, -hh), [r[0], r[1]]], [P(hw, -hh), [r[0] + r[2], r[1]]], [P(hw, hh), [r[0] + r[2], r[1] + r[3]]], [P(-hw, hh), [r[0], r[1] + r[3]]]];
    for (const i of [0, 1, 2, 0, 2, 3]) { pos.set(v[i][0], o * 3); nor.set([s, 0, c], o * 3); uv.set(v[i][1], o * 2); o++ } });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.computeBoundingSphere(); return g }

/* ======================= the shops ======================= */
const DEP = 9;   /* shop depth */
const SHOPS = [
  { id: 'swag', side: 'W', z0: -47, z1: -33, h: 4.8, wall: 0x6a3a9a, trim: 0x1b1320, floor: 0x2a2030, ceil: 0xf4d8ff, door: .5 },
  { id: 'groove', side: 'W', z0: -30, z1: -17, h: 5.4, wall: 0x8a3a2a, trim: 0x2a1a12, floor: 0x5a3a24, ceil: 0xffe0b0, door: .45, brick: true },
  { id: 'brew', side: 'W', z0: -14, z1: 2, h: 4.6, wall: 0x2a3a2a, trim: 0x1a120c, floor: 0x6a4a2a, ceil: 0xffd8a0, door: .55, timber: true },
  { id: 'woblr', side: 'E', z0: -47, z1: -30, h: 5.6, wall: 0xf4f4f2, trim: 0x5ad8b8, floor: 0xd8d8dc, ceil: 0xffffff, door: .5, glassFront: true },
  { id: 'phone', side: 'E', z0: -27, z1: -17, h: 4.8, wall: 0xe8e6e0, trim: 0x20123a, floor: 0xe8e8ec, ceil: 0xffffff, door: .5 },
  { id: 'solterra', side: 'E', z0: -14, z1: 2, h: 4.4, wall: 0xd88a5a, trim: 0xc8572e, floor: 0xb8643a, ceil: 0xfff0d8, door: .4 }
];
function shell(B, sh, y0) {
  const W2 = sh.side === 'W', fx = W2 ? SX0 : SX1, bx = W2 ? SX0 - DEP : SX1 + DEP, X = u => W2 ? fx - u : fx + u, xr = (u0, u1) => [Math.min(X(u0), X(u1)), Math.max(X(u0), X(u1))];
  const { z0, z1, h } = sh, len = z1 - z0, dz = z0 + len * sh.door, t = .3, sill = sh.glassFront ? .15 : .7, head = sh.glassFront ? h - .6 : 3.1, wallC = sh.wall;
  const cols = [], C = (u0, u1, v0, v1) => { const [a, b] = xr(u0, u1); cols.push([a, b, v0, v1]) };
  const bx2 = (hex, u0, u1, ya, yb, v0, v1, gl, arr) => { const [a, b] = xr(u0, u1); B.box(arr || B.solid, hex, a, b, y0 + ya, y0 + yb, v0, v1, gl) };
  bx2(sh.floor, 0, DEP, -.05, .06, z0, z1); bx2(wallC, DEP - t, DEP, 0, h, z0, z1); bx2(wallC, 0, DEP, 0, h, z0, z0 + t); bx2(wallC, 0, DEP, 0, h, z1 - t, z1); bx2(sh.trim, -.15, DEP + .15, h, h + .25, z0 - .15, z1 + .15);
  C(DEP - t, DEP, z0, z1); C(0, DEP, z0, z0 + t); C(0, DEP, z1 - t, z1);
  /* front: corner piers, window bays either side of a 2.2 m door, sill below, header + fascia above */
  const dw = 1.1, segs = [[z0, z0 + .7, 'pier'], [z0 + .7, dz - dw - .35, 'win'], [dz - dw - .35, dz - dw, 'pier'], [dz + dw, dz + dw + .35, 'pier'], [dz + dw + .35, z1 - .7, 'win'], [z1 - .7, z1, 'pier']];
  for (const [a, b, k] of segs) { if (b - a < .05) continue; if (k === 'pier') { bx2(sh.trim, -.1, t, 0, head, a, b); C(-.1, t, a, b) } else { bx2(wallC, 0, t, 0, sill, a, b); C(0, t, a, b); bx2(sh.trim, -.12, t + .05, sill - .06, sill, a, b); const [ga, gb] = xr(.12, .18); B.box(B.glass, 0x9ac8e0, ga, gb, y0 + sill, y0 + head, a, b) } }
  bx2(wallC, 0, t, head, h, z0, z1); bx2(sh.trim, -.12, t, head - .12, head, z0, z1);   /* header above windows + door */
  if (sh.brick) for (let y = .15; y < h; y += .3) { if (y > sill && y < head) continue; bx2(0x6a2a1c, -.03, .0, y, y + .025, z0 + .7, z1 - .7) }   /* mortar lines on the brick front */
  if (sh.timber) for (let v = z0 + .4; v < z1; v += .5) bx2(0x1a120c, -.03, .0, 0, h, v, v + .05);
  /* interior: ceiling with light panels (unlit glow batch), skirting */
  bx2(sh.ceil === 0xffffff ? 0xf0f0f0 : 0x2a2420, 0, DEP, h - .05, h, z0, z1); for (let u = 2; u < DEP - 1; u += 3) bx2(sh.ceil, u, u + 1.4, h - .1, h - .06, z0 + 1, z1 - 1, 0, B.glow);
  return { X, xr, cols, dz, fx, bx, face: W2 ? Math.PI / 2 : -Math.PI / 2, sign: W2 ? -1 : 1, bx2 } }

/* interior fit-out + signage per shop (u: metres in from the front, v: z) */
const FIT = {
  swag: (B, s, sh, y0) => { const q = (k, u, y, v, w, h, inward) => B.quad(k, s.X(u), y0 + y, v, w, h, inward ? s.face + Math.PI : s.face);
    q('swag_fascia', -.18, (sh.h + 3.1) / 2 + .05, (sh.z0 + sh.z1) / 2, sh.z1 - sh.z0 - 1, (sh.h - 3.1) * .9);
    const crown = [[-1.2, 0], [-.6, .6], [0, 0], [.6, .6], [1.2, 0]], cz = sh.z0 + 2.2; for (const dzc of [-1.2, 1.2]) s.bx2(0x1b1320, .05, .15, sh.h + .25, sh.h + .65, cz + dzc - .05, cz + dzc + .05); s.bx2(0x1b1320, .05, .15, sh.h + .6, sh.h + .66, cz - 1.25, cz + 1.25); for (let i = 0; i < crown.length - 1; i++) { const [a, b] = crown[i], [c, d] = crown[i + 1]; const mz = cz + (a + c) / 2, my = sh.h + .65 + (b + d) / 2, L2 = Math.hypot(c - a, d - b); B.part(B.glow, BG.cyl, 0xffd23a, s.X(-.2), y0 + my, mz, .05, L2, .05, Math.atan2(c - a, d - b), 0, 0) }
    for (const v0 of [sh.z0 + 1.2, sh.z1 - 4.8]) { s.bx2(0x9a9aa0, 3.7, 3.76, 1.5, 1.56, v0, v0 + 3.6); for (const e of [v0, v0 + 3.6]) s.bx2(0x9a9aa0, 3.7, 3.76, 0, 1.56, e - .03, e + .03); for (let k = 0; k < 8; k++) s.bx2([0xf4ead0, 0xff5ab0, 0x1b1320, 0xa83aa8, 0x3ad8c8, 0xf2c230][(k + (v0 > sh.z0 + 2 ? 1 : 0)) % 6], 3.45, 4.0, .75, 1.45, v0 + .2 + k * .42, v0 + .5 + k * .42); s.cols.push(s.xr(3.4, 4.05).concat([v0, v0 + 3.6])) }
    s.bx2(0x1b1320, DEP - 2.1, DEP - 1.3, 0, 1.05, sh.z0 + 3, sh.z1 - 3); s.cols.push(s.xr(DEP - 2.1, DEP - 1.3).concat([sh.z0 + 3, sh.z1 - 3]));
    for (let k = 0; k < 5; k++) s.bx2([0xff5ab0, 0x3ad8c8, 0xf2c230, 0xa83aa8, 0xf4ead0][k], DEP - .35, DEP - .3, 1.6, 2.4, sh.z0 + 1.2 + k * 1.1, sh.z0 + 2 + k * 1.1);   /* skate decks on the back wall */
    q('swag_poster', DEP - .32, 2.5, sh.z1 - 2.2, 1.3, 1.95, true); s.bx2(0xc8c8d0, 5.5, 5.6, .1, 2.2, sh.z1 - 1.6, sh.z1 - .6) },
  groove: (B, s, sh, y0) => { const q = (k, u, y, v, w, h, inward) => B.quad(k, s.X(u), y0 + y, v, w, h, inward ? s.face + Math.PI : s.face);
    /* vertical marquee on a bracket, perpendicular to the facade: readable up and down the street */
    const bz = sh.z1 - .5, bxw = s.X(-.75); B.quad('groove_blade', bxw, y0 + 3.4, bz, 1.0, 4.0, 0, true); s.bx2(0x1a1a1a, -1.3, 0, 5.45, 5.5, bz - .03, bz + .03); s.bx2(0x1a1a1a, -1.3, 0, 1.35, 1.4, bz - .03, bz + .03);
    q('groove_disc', -.2, 3.9, sh.z0 + 3.2, 1.6, 1.6);
    for (let i = 0; i < 6; i++) { const u = 2.2 + (i % 3) * 1.6, v = i < 3 ? sh.z0 + .5 : sh.z1 - 1.6; s.bx2(0x5a3a24, u, u + 1.3, 0, .8, v, v + 1.1); s.cols.push(s.xr(u, u + 1.3).concat([v, v + 1.1])); for (let k = 0; k < 10; k++) s.bx2([0xd82a2a, 0xf2c230, 0x2a8ad8, 0x3aa85a, 0x8a4ad8, 0x1a1a1a, 0xf4ead0][(k * 3 + i) % 7], u + .08 + k * .12, u + .16 + k * .12, .8, 1.12, v + .1, v + 1) }
    s.bx2(0x2a1a12, 5.6, 6.4, 0, 1.02, sh.z0 + 3.8, sh.z0 + 8.2); s.bx2(0x5a3a24, 5.5, 6.5, 1.02, 1.08, sh.z0 + 3.7, sh.z0 + 8.3); s.cols.push(s.xr(5.6, 6.4).concat([sh.z0 + 3.8, sh.z0 + 8.2]));
    q('groove_sleeves', DEP - .32, 2.6, (sh.z0 + sh.z1) / 2, 4.2, 2.1, true);
    const lb = sh.z0 + 10.6; s.bx2(0x2a1a12, DEP - 1.4, DEP - .4, 0, .95, lb - 1, lb + 1); s.bx2(0x111111, DEP - 1.2, DEP - .6, .95, 1.0, lb - .3, lb + .3); B.part(B.solid, BG.cyl, 0x1a1a1a, s.X(DEP - .9), y0 + 1.02, lb, .22, .02, .22); s.cols.push(s.xr(DEP - 1.4, DEP - .4).concat([lb - 1, lb + 1]));
    for (const v of [sh.z0 + .9, sh.z1 - .9]) { s.bx2(0x1a1a1a, DEP - 1, DEP - .4, 0, 1.9, v - .35, v + .35); B.part(B.solid, BG.cyl, 0x3a3a3a, s.X(DEP - 1.02), y0 + 1.3, v, .2, .04, .2, 0, 0, Math.PI / 2) } },
  brew: (B, s, sh, y0) => { const q = (k, u, y, v, w, h, inward) => B.quad(k, s.X(u), y0 + y, v, w, h, inward ? s.face + Math.PI : s.face);
    q('brew_fascia', -.18, (sh.h + 3.1) / 2 + .1, (sh.z0 + sh.z1) / 2, sh.z1 - sh.z0 - 1.6, (sh.h - 3.1) * .85);
    const bz = sh.z0 + .6; s.bx2(0x1a1a1a, -1.2, 0, 3.75, 3.8, bz - .03, bz + .03); B.quad('brew_badge', s.X(-.85), y0 + 3.05, bz, 1.2, 1.2, 0, true);
    q('brew_chalk', -1.1, .7, sh.z1 - 1.4, .75, .95); s.bx2(0x3a2a1a, -1.15, -1.05, 0, 1.25, sh.z1 - 1.8, sh.z1 - 1.0);   /* A-frame menu on the pavement, against the wall */
    s.bx2(0x5a3a24, 4.6, 5.4, 0, 1.1, sh.z0 + 2, sh.z1 - 2); s.bx2(0x2a1a12, 4.5, 5.5, 1.1, 1.16, sh.z0 + 1.9, sh.z1 - 1.9); s.cols.push(s.xr(4.6, 5.4).concat([sh.z0 + 2, sh.z1 - 2]));
    for (let k = 0; k < 6; k++) { const v = sh.z0 + 4 + k * 1.3; B.part(B.solid, BG.cyl, 0xb8b8c0, s.X(5), y0 + 1.35, v, .03, .4, .03); B.part(B.solid, BG.cyl, [0xf2c230, 0x3aa85a, 0xff7ab0][k % 3], s.X(5), y0 + 1.62, v, .035, .16, .035) }
    for (let k = 0; k < 3; k++) { const v = sh.z0 + 3 + k * 4.6; B.part(B.solid, BG.cyl, 0xb8733a, s.X(7.6), y0 + 1.5, v, .8, 3, .8); B.part(B.solid, BG.hem, 0xc8834a, s.X(7.6), y0 + 3, v, .8, .5, .8); s.cols.push(s.xr(6.7, 8.5).concat([v - .9, v + .9])) }
    for (const v of [sh.z0 + 2.4, sh.z0 + 6, sh.z1 - 3]) { B.part(B.solid, BG.cyl, 0x2a1a12, s.X(2.2), y0 + .55, v, .05, 1.1, .05); B.part(B.solid, BG.cyl, 0x6a4a2a, s.X(2.2), y0 + 1.1, v, .4, .05, .4); B.solid.push([BG.cyl, 0x1a1a1a, K.M(s.X(2.8), y0 + .38, v, .18, .76, .18), 0]); B.solid.push([BG.cyl, 0x1a1a1a, K.M(s.X(1.6), y0 + .38, v, .18, .76, .18), 0]); s.cols.push(s.xr(2, 2.4).concat([v - .2, v + .2])) }
    for (let k = 0; k < 12; k++) B.part(B.solid, BG.cyl, [0xf2c230, 0x3aa85a, 0xff7ab0][k % 3], s.X(DEP - .4), y0 + 1.5 + Math.floor(k / 6) * .45, sh.z0 + 6.2 + (k % 6) * .3, .06, .16, .06) },
  woblr: (B, s, sh, y0) => { const q = (k, u, y, v, w, h, inward) => B.quad(k, s.X(u), y0 + y, v, w, h, inward ? s.face + Math.PI : s.face);
    s.bx2(0xf4f4f2, -2.2, 0, sh.h - .7, sh.h - .4, sh.z0 + .5, sh.z1 - .5); s.bx2(0x5ad8b8, -2.25, -2.15, sh.h - .72, sh.h - .38, sh.z0 + .5, sh.z1 - .5, 1, B.glow);   /* canopy + lit edge */
    for (const v of [sh.z0 + .7, sh.z1 - .7]) { s.bx2(0xd8d8dc, -2.1, -1.9, 0, sh.h - .7, v - .1, v + .1); s.cols.push(s.xr(-2.1, -1.9).concat([v - .1, v + .1])) }
    q('woblr_letters', -2.27, sh.h - .1, (sh.z0 + sh.z1) / 2, 8, 1.25); q('woblr_wall', DEP - .32, 2.4, (sh.z0 + sh.z1) / 2 + 3, 4, 2, true);
    B.part(B.solid, BG.cyl, 0xeaeaea, s.X(4.4), y0 + .1, (sh.z0 + sh.z1) / 2 - 2, 2.6, .2, 2.6); s.cols.push(s.xr(2.6, 6.2).concat([(sh.z0 + sh.z1) / 2 - 3.8, (sh.z0 + sh.z1) / 2 - .2]));
    s.bx2(0xf4f4f2, DEP - 2.4, DEP - 1.4, 0, .78, sh.z1 - 4, sh.z1 - 2); s.cols.push(s.xr(DEP - 2.4, DEP - 1.4).concat([sh.z1 - 4, sh.z1 - 2])) },
  phone: (B, s, sh, y0) => { const q = (k, u, y, v, w, h, inward) => B.quad(k, s.X(u), y0 + y, v, w, h, inward ? s.face + Math.PI : s.face);
    s.bx2(0xf8f8fa, -.3, 0, 3.4, 4.5, sh.z0 + 1.5, sh.z1 - 1.5); q('phone_box', -.32, 3.95, (sh.z0 + sh.z1) / 2, 2.4, 1.2);
    q('phone_wall', DEP - .32, 2.4, (sh.z0 + sh.z1) / 2, 4, 2, true);
    for (const [v0, v1] of [[sh.z0 + 1, s.dz - 1.3], [s.dz + 1.3, sh.z1 - 1]]) { const u = 3.2; s.bx2(0xf4f4f4, u, u + 2.6, 0, .92, v0, v1); s.cols.push(s.xr(u, u + 2.6).concat([v0, v1])); for (let k = 0; k < 4; k++) { const v = v0 + .3 + k * (v1 - v0 - .6) / 4, uu = u + .4 + (k % 2) * 1.4; s.bx2(0x1a1a24, uu, uu + .3, .92, .96, v, v + .16); s.bx2([0xc89a1a, 0x1aa8a0, 0x8a8a9a, 0xff4ad2][k], uu + .02, uu + .28, .965, .97, v + .02, v + .14, 1, B.glow) } } },
  solterra: (B, s, sh, y0) => { const q = (k, u, y, v, w, h, inward) => B.quad(k, s.X(u), y0 + y, v, w, h, inward ? s.face + Math.PI : s.face);
    q('sol_wall', -.02, sh.h - .48, (sh.z0 + sh.z1) / 2, sh.z1 - sh.z0 - 3, .82);
    const ac = ['#ffffff', '#c8572e']; for (let k = 0; k < 14; k++) { const v = sh.z0 + .9 + k * (sh.z1 - sh.z0 - 1.8) / 14; s.bx2(k % 2 ? 0xc8572e : 0xf4ead8, -1.4, 0, 2.95, 3.05, v, v + (sh.z1 - sh.z0 - 1.8) / 14) }   /* striped awning */
    q('sol_poster', DEP - .32, 2.3, sh.z0 + 3, 1.4, 1.4, true);
    for (const [px, pz] of [[-.6, sh.z0 + .4], [-.6, sh.z1 - .4]]) { B.part(B.solid, BG.tcyl, 0xc8643a, s.X(px), y0 + .3, pz, .3, .6, .3); B.part(B.solid, BG.sph, 0x7a8a4a, s.X(px), y0 + 1, pz, .45, .5, .45) }
    for (let k = 0; k < 3; k++) { s.bx2(0x8a6a4a, DEP - .7, DEP - .3, .8 + k * .6, .84 + k * .6, sh.z1 - 6, sh.z1 - 1); for (let i = 0; i < 6; i++) B.part(B.solid, BG.sph, [0xc8643a, 0xf4ead8, 0x2e5fa8][(i + k) % 3], s.X(DEP - .5), y0 + .95 + k * .6, sh.z1 - 5.6 + i * .75, .14, .14, .14) } }
};
/* furniture vignettes on display (the same pieces you can buy) */
function displayFurniture(B, s, sh, y0) { const H = AV.home; const put = (k, u, v, ry) => { const F = FURN[k] || (H && H.CAT[k]); if (!F || !F.parts) return; const m = new THREE.Matrix4().makeRotationY(ry || 0).premultiply(new THREE.Matrix4().makeTranslation(s.X(u), y0 + .06, v));
    for (const p of F.parts()) { const mm = (p[2] ? p[2].clone() : new THREE.Matrix4()).premultiply(m); (p[3] ? B.glow : B.solid).push([p[0], p[1], mm, p[3] || 0]) } s.cols.push(s.xr(u - .5, u + .5).concat([v - .5, v + .5])) };
  put('sol_rug', 4, sh.z0 + 4.5); put('sol_rattan', 4.2, sh.z0 + 3.8, .6); put('glo_lamp', 3.2, sh.z0 + 5.4); put('sol_olive', 6.2, sh.z0 + 3); put('sol_rattan', 5.2, sh.z0 + 5.2, -2.4) }

/* ======================= street, kiosk, vending, dock, arch ======================= */
const STREETCOLS = [];
function street(B, y0) { const P = (hex, x0, x1, z0, z1, y, gl) => B.box(B.solid, hex, x0, x1, y0 + y - .04, y0 + y, z0, z1, gl);
  P(0x8a8478, SX0, SX1, ZN, ZS, .05); for (let z = ZN + 1; z < ZS; z += 2) P(0x7a746a, SX0 + .2, SX1 - .2, z, z + .06, .056);   /* paver seams */
  for (const x of [SX0 + .1, SX1 - .1]) P(0x5a5650, x - .1, x + .1, ZN, ZS, .07);
  /* lamps (unlit glow heads), planters with palms */
  for (let z = ZN + 4; z < ZS - 2; z += 10) for (const x of [SX0 + .6, SX1 - .6]) { B.part(B.solid, BG.cyl, 0x2a2a30, x, y0 + 2, z, .06, 4, .06); B.part(B.glow, BG.sph, 0xfff0c8, x, y0 + 4.05, z, .22, .18, .22, 0, 0, 0, 1) }
  for (const [x, z] of [[SX0 + 1.4, -15.5], [SX1 - 1.4, -28.5], [SX0 + 1.4, 4.5], [SX1 - 1.4, 1.5], [SX0 + 1.4, -47.5], [SX1 - 1.4, -48]]) { B.box(B.solid, 0x8a8478, x - .45, x + .45, y0, y0 + .6, z - .45, z + .45); STREETCOLS.push([x - .45, x + .45, z - .45, z + .45]); B.part(B.solid, BG.cyl, 0x6a5a3a, x, y0 + 1.6, z, .08, 2.2, .08); for (let k = 0; k < 6; k++) B.part(B.solid, BG.sph, 0x3a8a3a, x + Math.cos(k) * .7, y0 + 2.7, z + Math.sin(k) * .7, .7, .12, .25, 0, k, .3) }
  /* gateway arch at the south end */
  for (const x of [SX0 - .2, SX1 + .2]) { B.box(B.solid, 0x1b1320, x - .3, x + .3, y0, y0 + 6.2, ZS - .3, ZS + .3); STREETCOLS.push([x - .3, x + .3, ZS - .3, ZS + .3]) } B.box(B.solid, 0x1b1320, SX0 - .5, SX1 + .5, y0 + 5.4, y0 + 6.5, ZS - .2, ZS + .2);
  B.quad('arch', (SX0 + SX1) / 2, y0 + 5.95, ZS + .23, 8.4, 1.0, 0, false); B.quad('arch', (SX0 + SX1) / 2, y0 + 5.95, ZS - .23, 8.4, 1.0, Math.PI, false);
  B.box(B.solid, 0x3a2a1a, SX1 + .6, SX1 + .75, y0, y0 + 2.2, ZS + 1.5, ZS + 2.9); B.quad('map_board', SX1 + .53, y0 + 1.5, ZS + 2.2, 1.35, 1.0, -Math.PI / 2) }
function kiosk(B, y0) { const x0 = SX1 + .5, x1 = SX1 + 4.5, z0 = 3, z1 = 8;   /* ApeMart kiosk, east corner by the arch; open front faces the street */
  B.box(B.solid, 0xf4f4f2, x0, x1, y0, y0 + .1, z0, z1); B.box(B.solid, 0xf4f4f2, x1 - .2, x1, y0, y0 + 3.2, z0, z1); B.box(B.solid, 0xf4f4f2, x0, x1, y0, y0 + 3.2, z0, z0 + .2); B.box(B.solid, 0xf4f4f2, x0, x1, y0, y0 + 3.2, z1 - .2, z1); B.box(B.solid, 0x1f4ab8, x0 - .2, x1 + .2, y0 + 3.2, y0 + 3.5, z0 - .2, z1 + .2);
  B.box(B.solid, 0xd82a2a, x0 + .3, x0 + 1.1, y0, y0 + 1.0, z0 + .4, z1 - .4); for (let k = 0; k < 3; k++) { B.box(B.solid, 0x9a9aa0, x1 - .9, x1 - .3, y0 + .5 + k * .7, y0 + .53 + k * .7, z0 + .4, z1 - .4); for (let i = 0; i < 8; i++) B.box(B.solid, [0xf4d23a, 0xff8a3a, 0x8a4ad8, 0x3aa85a, 0xd82a2a, 0xf4f4f2][(i + k) % 6], x1 - .85, x1 - .4, y0 + .53 + k * .7, y0 + .8 + k * .7, z0 + .5 + i * .52, z0 + .9 + i * .52) }
  B.quad('apemart', x0 - .22, y0 + 3.35, (z0 + z1) / 2, 4.8, 1.0, -Math.PI / 2); return { x: x0 - .2, z: (z0 + z1) / 2, cols: [[x1 - .2, x1, z0, z1], [x0, x1, z0, z0 + .2], [x0, x1, z1 - .2, z1], [x0 + .3, x0 + 1.1, z0 + .4, z1 - .4]] } }
function vending(B, y0, x, z, face) { const s = face > 0 ? 1 : -1; B.box(B.solid, 0x5a1a8a, x - .45, x + .45, y0, y0 + 2, z - .5, z + .5); B.quad('puffpop', x + s * .46, y0 + 1.05, z, .9, 1.8, s > 0 ? Math.PI / 2 : -Math.PI / 2); return [x - .45, x + .45, z - .5, z + .5] }

/* ======================= staff (villager apes behind each counter) ======================= */
const STAFF = { swag: ['Rico', 0x6a4a3a, 0xa83aa8, 0xf2c230], groove: ['Dee', 0x3a2a20, 0x8a1a1a, null], brew: ['Hops', 0x7a5a3a, 0x1f3a2a, 0x5a3a24], woblr: ['Mika', 0x5a4a3a, 0x5ad8b8, null], phone: ['Ada', 0x4a3a2a, 0x20123a, null], solterra: ['Marisol', 0x8a6a4a, 0xc8572e, 0xf4ead8], apemart: ['Bo', 0x6a5a4a, 0x1f4ab8, 0xd82a2a] };
function staffAt(W, key, x, z, yaw) { const C = AV.chars; let g = null; try { const s = STAFF[key]; g = C && C.npc ? C.npc(s[1], s[2], s[3]) : null } catch (e) { g = null } if (!g) return null; g.position.set(x, W.surface(x, z) || 0, z); g.rotation.y = yaw; g.userData.baseY = g.position.y; W.group.add(g); (BD.staff = BD.staff || []).push(g); return g }

/* decor already standing on the district's footprint (scattered flora, mushrooms, bushes, palms; some stream in later as instanced
   models) is hidden inside the footprint only: instances are scaled to zero, small loose meshes made invisible, and their old
   collision circles / boxes inside the footprint removed. Interactions and other buildings are never touched (none are here). */
const RECT = [45.5, 74.5, -50.5, 10.5], inRect = (x, z) => x > RECT[0] && x < RECT[1] && z > RECT[2] && z < RECT[3];
const _m4 = new THREE.Matrix4(), _p3 = new THREE.Vector3(), _ZERO = new THREE.Matrix4().makeScale(0, 0, 0), _box = new THREE.Box3();
BD.clearDecor = function (W, pre) { let inst = 0, loose = 0; const mine = o => { for (let q = o; q; q = q.parent) if (q === BD.group || (BD.staff && BD.staff.includes(q)) || q.userData.bdKeep) return true; return false };
  W.group.traverse(o => { if (mine(o)) return;
    if (o.isInstancedMesh) { let ch = false; o.updateMatrixWorld(); for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, _m4); if (_m4.elements[0] === 0 && _m4.elements[5] === 0) continue; _p3.setFromMatrixPosition(_m4).applyMatrix4(o.matrixWorld); if (inRect(_p3.x, _p3.z)) { o.setMatrixAt(i, _ZERO); ch = true; inst++ } } if (ch) { o.instanceMatrix.needsUpdate = true; o.frustumCulled = false } return }
    if (pre && o.isMesh && o.visible && pre.has(o)) { _box.setFromObject(o); const c = _box.getCenter(_p3), sz = Math.max(_box.max.x - _box.min.x, _box.max.z - _box.min.z); if (sz < 14 && inRect(c.x, c.z) && inRect(_box.min.x, _box.min.z) && inRect(_box.max.x, _box.max.z)) { o.visible = false; loose++ } } });
  BD.stats.cleared = (BD.stats.cleared || 0) + inst + loose; return inst + loose };
/* show / hide everything the district added (used by the performance A/B test) */
BD.setVisible = on => { if (BD.group) BD.group.visible = on; (BD.staff || []).forEach(g => g.visible = on) };
/* ======================= build ======================= */
function build(W) {
  const t0 = performance.now(), y0 = W.surface(60, -18) || 0, B = batches(), allCols = []; BD.staff = [];
  const pre = new Set(); W.group.traverse(o => { if (o.isMesh) pre.add(o) });
  for (let i = W.circles.length - 1; i >= 0; i--) if (inRect(W.circles[i][0], W.circles[i][1])) W.circles.splice(i, 1);
  for (let i = W.cols.length - 1; i >= 0; i--) { const c = W.cols[i]; if (inRect(c[0], c[2]) && inRect(c[1], c[3])) W.cols.splice(i, 1) }
  for (const sh of SHOPS) { const s = shell(B, sh, y0); FIT[sh.id](B, s, sh, y0); if (sh.id === 'solterra') displayFurniture(B, s, sh, y0); allCols.push(...s.cols); BD.shops[sh.id] = { sh, s, door: { x: s.X(-.8), z: s.dz }, counter: null } }
  STREETCOLS.length = 0; street(B, y0); allCols.push(...STREETCOLS); const ks = kiosk(B, y0); allCols.push(...ks.cols);
  const v1 = vending(B, y0, SX0 + .5, -31.5, 1), v2 = vending(B, y0, SX1 - .5, -15.5, -1); allCols.push(v1, v2);
  atlasBuild();
  const grp = new THREE.Group(); grp.name = 'brand_district'; const solidM = K.floraMat(0, { rough: .78 }); solidM.userData.lin = 1;
  const glowM = new THREE.MeshBasicMaterial({ vertexColors: true }); glowM.userData.lin = 1;
  const glassM = new THREE.MeshStandardMaterial({ color: 0xa8d0e8, roughness: .08, metalness: .2, transparent: true, opacity: .28, depthWrite: false, envMap: AV.pbr && AV.pbr.env ? AV.pbr.env() : null }); glassM.userData.lin = 1;
  const signM = new THREE.MeshStandardMaterial({ map: AT.tex, emissiveMap: AT.tex, emissive: 0xffffff, emissiveIntensity: .25, roughness: .55, alphaTest: .35, side: THREE.FrontSide }); signM.userData.lin = 1; BD.signM = signM;
  const add = (geo, m, name, shadow) => { const o = new THREE.Mesh(geo, m); o.name = name; o.castShadow = !!shadow; o.receiveShadow = true; o.userData.noMerge = 1; grp.add(o); return o };
  add(K.merge(B.solid), solidM, 'bd_solid', true); add(K.merge(B.glow), glowM, 'bd_glow'); add(K.merge(B.glass), glassM, 'bd_glass').renderOrder = 2; add(quadGeo(B.quads), signM, 'bd_signs');
  /* the display car in the showroom (same mesh as the one you buy) */
  const wb = BD.shops.woblr; const car = new THREE.Mesh(AV.veh.geo('woblr', ZIP.cols[0]), AV.city && AV.city.vehMat ? AV.city.vehMat(W.ctx) : new THREE.MeshStandardMaterial({ vertexColors: true })); car.position.set(wb.s.X(4.4), y0 + .2, (wb.sh.z0 + wb.sh.z1) / 2 - 2); car.rotation.y = .7; car.name = 'bd_display_car'; grp.add(car); BD.displayCar = car;
  W.group.add(grp); BD.group = grp; for (const c of allCols) W.cols.push(c);
  BD.stats.ms = Math.round(performance.now() - t0); BD.stats.parts = B.solid.length + B.glow.length + B.glass.length; BD.stats.signs = B.quads.length; BD.stats.atlasOver = (AT.over || []).length; BD.stats.meshes = grp.children.length;
  /* night: signs and windows come up after dusk */
  W.ctx.upd.push(() => { const h = AV.S.time / 60, n = h > 19 || h < 6.5 ? 1 : h > 18 ? h - 18 : h < 7.5 ? 7.5 - h : 0; signM.emissiveIntensity = .25 + .75 * n });
  interactions(W, y0, ks); BD.clearDecor(W, pre);
  let cd = 0, cdn = 0; W.ctx.upd.push(() => { if (cdn > 12) return; const now = AV.now(); if (now - cd < 2) return; cd = now; cdn++; BD.clearDecor(W, null) });   /* late-streaming instanced models */
  let sk = 0; W.ctx.upd.push(() => { const now = AV.now(); if (now - sk < .4) return; sk = now; if (BD.group && !BD.group.visible) return; const p = AV.P; for (const g of BD.staff) g.visible = Math.hypot(g.position.x - p.x, g.position.z - p.z) < 45 });
  W.places = W.places || []; if (!W.places.find(p => p.id === 'brand_row')) W.places.push({ id: 'brand_row', name: L('Brand Row (Brand District)', 'Brand Row (distrito de marcas)'), x: 60, z: 4, yaw: Math.PI });
  BD.stats.built = true }

/* ======================= interactions (doors are open: you walk in) ======================= */
function interactions(W, y0, ks) {
  const T = (x, z, r, label, fn, kind) => W.T.push({ x, z, r, label: () => tr(label[0], label[1]), fn, kind: kind || 'shop' });
  const at = (id, u, v) => { const s = BD.shops[id].s; return [s.X(u), v] };
  const yawTo = (s) => s.side === 'W' ? Math.PI / 2 : -Math.PI / 2;
  /* SWAG: the M6 clothing store UI with the SWAG collection */
  const MC = AV.merch; if (MC && !MC.shops.swag) MC.shops.swag = { ok: true, sh: { key: 'swag', brand: 'SWAG', cols: ['swag'], greet: L('Rico: “Welcome to SWAG. Fresh drops every moon. Pick a print, try it, rock it.”', 'Rico: “Bienvenido a SWAG. Novedades cada luna. Elige un estampado, pruébalo y lúcelo.”') }, makeMirror: () => { } };
  { const sh = BD.shops.swag.sh, [x, z] = at('swag', DEP - 2.6, (sh.z0 + sh.z1) / 2); T(x, z, 2.4, L('👕 SWAG counter (Rico): browse + buy streetwear', '👕 Mostrador SWAG (Rico): ver y comprar ropa'), () => MC && MC.open('swag')); staffAt(W, 'swag', BD.shops.swag.s.X(DEP - .9), z, yawTo(sh)) }
  /* GROOVE DEALERS: records + audio, listening booth */
  { const sh = BD.shops.groove.sh, [x, z] = at('groove', 4.9, sh.z0 + 6), V = { id: 'gd_records', name: L('Groove Dealers · Records & Audio', 'Groove Dealers · Discos y Audio'), greet: L('Dee: “Groove Dealers pressings, heavy vinyl. Spin one in the booth before you buy.”', 'Dee: “Ediciones Groove Dealers, vinilo pesado. Escucha uno en la cabina antes de comprar.”'), items: [['gd_lp_dub', 25], ['gd_lp_sab', 25], ['gd_lp_road', 25], ['gd_boombox', 90]], x, z, reach: 5 };
    T(x, z, 2.4, L('💿 Groove Dealers counter (Dee): records + boombox', '💿 Mostrador Groove Dealers (Dee): discos + boombox'), () => AV.shop.open(V)); staffAt(W, 'groove', BD.shops.groove.s.X(7), sh.z0 + 6, yawTo(sh));
    const [bx, bz] = at('groove', DEP - 1.9, sh.z0 + 10.6); let i = 0, m0 = null;
    T(bx, bz, 1.8, L('🎧 Listening booth: spin an LP (next record)', '🎧 Cabina: escuchar un LP (siguiente disco)'), () => { const ks2 = Object.keys(LPS); const k = ks2[i++ % ks2.length]; if (m0 === null) m0 = W.music || false; W.music = { playlist: LPS[k][0], pos: { x: bx, y: y0 + 1.2, z: bz }, bed: .05 }; AV.audio && AV.audio.setWorld && AV.audio.setWorld(W); BD.stats.booth = k; AV.toast('🎧 ' + say(LPS[k][1])) }, 'listen');
    W.ctx.upd.push(() => { if (m0 !== null && Math.hypot(AV.P.x - bx, AV.P.z - bz) > 22) { W.music = m0 || undefined; m0 = null; AV.audio && AV.audio.setWorld && AV.audio.setWorld(W) } }) }
  /* MONKEY BREW: taproom (responsible service: water + kombucha always on the menu) */
  { const sh = BD.shops.brew.sh, [x, z] = at('brew', 3.9, (sh.z0 + sh.z1) / 2), V = { id: 'mb_taproom', name: L('Monkey Brew Taproom', 'Monkey Brew Taproom'), greet: L('Hops: “Fresh off the tanks. Kombucha’s alcohol-free, water’s on the house-ish.”', 'Hops: “Recién salida de los tanques. La kombucha no lleva alcohol y el agua casi regalada.”'), items: [['mb_hazy', 12], ['mb_ipa', 13], ['mb_kombucha', 8], ['mb_bread', 6], ['water', 1]], x, z, reach: 5 };
    T(x, z, 2.6, L('🍺 Monkey Brew bar (Hops): taps + banana bread', '🍺 Barra Monkey Brew (Hops): grifos + pan de plátano'), () => AV.shop.open(V)); staffAt(W, 'brew', BD.shops.brew.s.X(6), (sh.z0 + sh.z1) / 2, yawTo(sh)) }
  /* WOBLR MOTORS: buy a Zip-EV (owned, saved, parked on the street outside) */
  { const sh = BD.shops.woblr.sh, s = BD.shops.woblr.s, [x, z] = at('woblr', DEP - 2.9, sh.z1 - 3), bay = [60.4, sh.z0 + 4];
    if (AV.garage) AV.garage.dealers[WID] = { ok: true, D: { id: 'woblr_row', name: L('Woblr Motors', 'Woblr Motors'), stock: [ZIP] }, bay, lot: { ry: 0 }, counter: [x, z] };
    T(x, z, 2.6, L('🚙 Woblr Motors (Mika): buy a Zip-EV electric car', '🚙 Woblr Motors (Mika): comprar un coche eléctrico Zip-EV'), () => BD.woblrPanel()); staffAt(W, 'woblr', s.X(DEP - 1.6), sh.z1 - 3, yawTo(sh));
    T(s.X(4.4), (sh.z0 + sh.z1) / 2 - 2, 3.2, L('🚙 Look at the Zip-EV on the turntable (next colour)', '🚙 Ver el Zip-EV de la plataforma (siguiente color)'), () => { BD._col = ((BD._col || 0) + 1) % ZIP.cols.length; BD.displayCar.geometry = AV.veh.geo('woblr', ZIP.cols[BD._col]) }, 'look') }
  /* APEPHONE store */
  { const sh = BD.shops.phone.sh, [x, z] = at('phone', DEP - 1.8, (sh.z0 + sh.z1) / 2), V = { id: 'apephone_store', name: L('ApePhone Store', 'Tienda ApePhone'), greet: L('Ada: “Make your ApePhone yours. Skins apply the moment you use them.”', 'Ada: “Haz tuyo tu ApePhone. Las fundas se aplican al usarlas.”'), items: [['ap_skin_banana', 30], ['ap_skin_neon', 30], ['ap_skin_graphite', 30], ['ap_skin_classic', 5], ['ap_lens', 45]], x, z, reach: 5 };
    T(x, z, 2.4, L('📱 ApePhone Store (Ada): skins + ApeCam lens', '📱 Tienda ApePhone (Ada): fundas + lente ApeCam'), () => AV.shop.open(V)); staffAt(W, 'phone', BD.shops.phone.s.X(DEP - .8), z, yawTo(sh)) }
  /* SOLTERRA LIVING: furniture for your apartment */
  { const sh = BD.shops.solterra.sh, [x, z] = at('solterra', DEP - 2.2, sh.z1 - 2.5); T(x, z, 2.4, L('🪑 SOLTERRA Living (Marisol): furniture for your home', '🪑 SOLTERRA Living (Marisol): muebles para tu casa'), () => BD.solPanel()); staffAt(W, 'solterra', BD.shops.solterra.s.X(DEP - .9), sh.z1 - 2.5, yawTo(sh)) }
  /* ApeMart kiosk, PuffPop vending, Zippit dock */
  { const V = { id: 'apemart_row', name: L('ApeMart kiosk', 'Quiosco ApeMart'), greet: L('Bo: “Bananas, noodles, cold drinks. Everyday stuff, every day.”', 'Bo: “Plátanos, fideos, bebidas frías. Lo de cada día, cada día.”'), items: [['am_bananas', 3], ['am_noodles', 5], ['bn_chips', 4], ['pp_puffs', 4], ['water', 2], ['snack', 4]], x: ks.x - 1, z: ks.z, reach: 5 };
    T(ks.x - 1, ks.z, 2.4, L('🛒 ApeMart kiosk (Bo): groceries', '🛒 Quiosco ApeMart (Bo): alimentación'), () => AV.shop.open(V)); staffAt(W, 'apemart', SX1 + 2.2, ks.z, -Math.PI / 2) }
  for (const [vx, vz, sgn] of [[SX0 + 1.4, -31.5, 1], [SX1 - 1.4, -15.5, -1]]) { const V = { id: 'puffpop_vend', name: L('PuffPop vending machine', 'Máquina PuffPop'), greet: L('The machine hums and flashes: INSERT CREDITS.', 'La máquina zumba y parpadea: INTRODUCE CRÉDITOS.'), items: [['pp_puffs', 4], ['pp_tropic', 4], ['pp_grape', 4], ['water', 2]], x: vx, z: vz, reach: 4 }; T(vx, vz, 1.8, L('🥤 PuffPop vending machine', '🥤 Máquina expendedora PuffPop'), () => AV.shop.open(V)) }
  if (AV.act && AV.act.place) try { AV.act.place(W, { type: 'rental', id: 'ape_town_zippit', kind: 'escooter', x: SX0 - 1.6, z: 5.5, ry: 0, price: 4, name: L('Zippit e-scooters', 'Patinetes Zippit'), col: 0xc8f03a, cols: [0xc8f03a, 0x1a1a1a, 0xc8f03a] }) } catch (e) { console.warn('zippit dock', e) }
}

/* ======================= panels ======================= */
BD.woblrPanel = function () { const S = AV.S, cols = ZIP.cols, names = ['Mint', 'Lilac', 'Sun', 'Pearl', 'Coral'], owned = AV.garage ? AV.garage.owned().filter(r => r.kind === 'woblr').length : 0; let ci = BD._col || 0;
  const render = () => { const p = AV.panel('cmp', '<b>Woblr Motors · Zip-EV</b> · ' + tr('Credits', 'Créditos') + ': ' + S.money + '<div class="note">' + tr('Mika: “Big ape energy in a tiny ride. 100% electric, parks anywhere. Yours to keep, saved in your garage (Y).”', 'Mika: “Mucha energía simia en un coche diminuto. 100% eléctrico, aparca en cualquier sitio. Tuyo para siempre, guardado en tu garaje (Y).”') + '</div>' +
      '<div class="row">' + cols.map((c, i) => '<button data-c="' + i + '" style="background:#' + c.toString(16).padStart(6, '0') + ';color:#1e2a36;' + (i === ci ? 'outline:3px solid #ffd84a' : '') + '">' + names[i] + '</button>').join('') + '</div>' +
      '<div class="note">' + tr('Price', 'Precio') + ': <b>' + ZIP.price + '</b> · ' + tr('You own ', 'Tienes ') + owned + ' Zip-EV · ' + tr('Top speed ≈ 49 km/h · electric hum · chime horn', 'Velocidad máx. ≈ 49 km/h · zumbido eléctrico · claxon de campanilla') + '</div><div class="note" id="wbM"></div>' +
      '<div class="row"><button id="wbBuy">' + tr('Buy · ', 'Comprar · ') + ZIP.price + '</button><button data-close>' + tr('Not today', 'Hoy no') + '</button></div>');
    p.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { ci = +b.dataset.c; BD._col = ci; if (BD.displayCar) BD.displayCar.geometry = AV.veh.geo('woblr', cols[ci]); render() });
    p.querySelector('#wbBuy').onclick = () => { const rec = AV.garage && AV.garage.buy(WID, 'woblr', cols[ci]); if (!rec) { document.getElementById('wbM').textContent = tr('Not enough credits yet.', 'Aún no tienes créditos suficientes.'); return } BD.stats.cars = (BD.stats.cars || 0) + 1; AV.closePanel('cmp'); AV.toast('🔑 ' + tr('Your Zip-EV is parked on Brand Row, right outside. Walk up and press E to drive.', 'Tu Zip-EV está aparcado en Brand Row, justo fuera. Acércate y pulsa E para conducir.')) } };
  render() };
BD.solPanel = function () { const render = msg => { const pid = BD.homeId(), d = st().deliver, wait = Object.keys(d).reduce((a, k) => a + d[k], 0);
    const rows = Object.keys(FURN).map(k => { const F = FURN[k]; return '<div class="bitem"><div class="bic">' + F.ic + '</div><div class="bnm">' + say(F.n) + ' <b>' + F.p + '</b></div><div class="bbt"><button data-f="' + k + '">' + tr('Buy', 'Comprar') + '</button></div></div>' }).join('');
    const where = pid ? tr('Delivered to your home stock (' + say(AV.home.PROPS[pid].name) + ': open the home panel to place it).', 'Se entrega en el almacén de tu casa (' + say(AV.home.PROPS[pid].name) + ': abre el panel de la casa para colocarlo).') : tr('You have no home yet: purchases wait for you and arrive at the first flat you rent or buy (Madrid: Piso 2B).', 'Aún no tienes casa: lo que compres te espera y llega al primer piso que alquiles o compres (Madrid: Piso 2B).');
    const p = AV.panel('cmp', '<b>SOLTERRA Living</b> · ' + tr('Credits', 'Créditos') + ': ' + AV.S.money + '<div class="note">' + tr('Marisol: “Warm colours, slow mornings. Everything here is made to live with.”', 'Marisol: “Colores cálidos, mañanas lentas. Todo aquí está hecho para vivir con ello.”') + '</div><div class="note">' + where + (wait ? ' · ' + tr('Waiting: ', 'Esperando: ') + wait : '') + '</div><div class="bgrid">' + rows + '</div><div class="note" id="solM">' + (msg || '') + '</div><div class="row"><button data-close>' + tr('Done', 'Listo') + '</button></div>');
    p.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { const r = BD.buyFurniture(b.dataset.f); render(r ? (r === 'pending' ? tr('Bought: it will arrive at your first home.', 'Comprado: llegará a tu primera casa.') : tr('Bought: it is in your home stock.', 'Comprado: está en el almacén de tu casa.')) : tr('Not enough credits.', 'No tienes créditos suficientes.')) }) };
  render() };

/* ======================= ROLLOUT: the brand loop in other cities (Tier B, everyday presence) =======================
   An "ApeMart Express" corner kiosk (staffed counter, shelves, a fascia with the local-language subline) and a PuffPop vending
   machine, near each city's arrival on free ground (never on a mapped carriageway or next to another interaction).  Local sublines:
   es "supermercado", de "Supermarkt", th "ร้านสะดวกซื้อ" (convenience store), vi "Cửa hàng tiện lợi" (convenience store),
   he "מכולת" (grocery).  Stock = the brand snacks + one local staple the world already sells (existing item ids). */
const ROLL = { madrid: ['supermercado', 'md_cafe'], vienna: ['Supermarkt', 'almdudler'], chiang_mai: ['ร้านสะดวกซื้อ', 'thai_tea'], pai: ['ร้านสะดวกซื้อ', 'thai_tea'], koh_tao: ['ร้านสะดวกซื้อ', 'coconut'], da_nang: ['Cửa hàng tiện lợi', 'ca_phe_sua_da'], jerusalem: ['מכולת', 'mint_tea'] };
BD.roll = {};
function canvasTex2(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t }
/* placement rules (same walkway data as tables.js, wider margins for a 3 x 2 m kiosk): clear of the walking graph (W.mapNav), crowd
   routes and carriageways, flat, not under any roof / gate / awning (an upward ray), not next to another interaction */
const segD = (px, pz, ax, az, bx, bz) => { const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / l2)); return Math.hypot(px - ax - dx * t, pz - az - dz * t) };
function clearOfPaths(W, x, z, m) { const N = W.mapNav; if (N && N.links) for (let i = 0; i < N.nodes.length; i++) { const a = N.nodes[i]; if (Math.abs(a[0] - x) > 50 || Math.abs(a[1] - z) > 50) continue; for (const j of N.links[i]) { if (j < i) continue; const b = N.nodes[j]; if (segD(x, z, a[0], a[1], b[0], b[1]) < m) return false } }
  for (const r of W.mapRoads || []) if (segD(x, z, r[0], r[1], r[2], r[3]) < (r[4] || 6) / 2 + m) return false;
  for (const cr of (W.ctx && W.ctx.crowds) || []) { const nv = cr.nav; if (!nv || !nv.links) continue; for (let i = 0; i < nv.nodes.length; i++) { const a = nv.nodes[i]; if (Math.abs(a[0] - x) > 40 || Math.abs(a[1] - z) > 40) continue; for (const j of nv.links[i]) { const b = nv.nodes[j]; if (segD(x, z, a[0], a[1], b[0], b[1]) < m - .6) return false } } }
  return true }
const _ray = new THREE.Raycaster(), _up = new THREE.Vector3(0, 1, 0), _o3 = new THREE.Vector3();
let _roofs = null, _roofW = null; const roofs = W => { if (_roofW === W) return _roofs; _roofW = W; _roofs = []; W.group.updateMatrixWorld(true); W.group.traverse(o => { if (o.isMesh && !o.isSkinnedMesh && !o.isInstancedMesh && o.visible && o.geometry && !(o.material && o.material.transparent && o.material.opacity < .5)) _roofs.push(o) }); return _roofs };
const openSky = (W, x, z, y) => { _o3.set(x, y + .6, z); _ray.set(_o3, _up); _ray.far = 40; return _ray.intersectObjects(roofs(W), false).length === 0 };   /* solid static meshes only (trees / sprites do not count as a roof) */
function rollout(W) { const R = ROLL[W.id]; if (!R) return; const a = W.arrivals && (W.arrivals.default || W.arrivals[W.defaultArrival]); if (!a) return;
  const offRoad = (x, z) => !(W.mapRoads || []).some(r => { const [x0, z0, x1, z1, w] = r, dx = x1 - x0, dz = z1 - z0, L2 = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((x - x0) * dx + (z - z0) * dz) / L2)); return Math.hypot(x - x0 - dx * t, z - z0 - dz * t) < (w || 6) / 2 + 2 });
  let s = null; for (let d = 6; d < 70 && !s; d += 1.5) for (let k = 0; k < 16 && !s; k++) { const an = k / 16 * TAU, x = a.x + Math.cos(an) * d, z = a.z + Math.sin(an) * d; if (W.surface(x, z) !== null && AV.isFree(W, x, z, 2.6) && offRoad(x, z) && !(W.noStrangersAt && W.noStrangersAt(x, z)) && !W.T.some(t => Math.hypot(t.x - x, t.z - z) < 4)) { const r0 = Math.round(Math.atan2(a.x - x, a.z - z) / (Math.PI / 2)) * (Math.PI / 2), fx = x + Math.sin(r0) * 2.6, fz = z + Math.cos(r0) * 2.6, vx = fx + Math.cos(r0) * 2.3, vz = fz - Math.sin(r0) * 2.3; const y1 = W.surface(x, z) || 0, flat = [[1.6, 1.2], [-1.6, 1.2], [1.6, -1.2], [-1.6, -1.2], [2.8, 0]].every(([ox, oz]) => { const yy = W.surface(x + ox, z + oz); return yy != null && Math.abs(yy - y1) < .25 });
      if (AV.isFree(W, fx, fz, 1) && W.surface(fx, fz) !== null && AV.isFree(W, vx, vz, .8) && flat && clearOfPaths(W, x, z, 4.2) && !W.T.some(t => Math.hypot(t.x - x, t.z - z) < 7) && openSky(W, x, z, y1) && openSky(W, x + 1.5, z + 1, y1) && openSky(W, x - 1.5, z - 1, y1)) s = [x, z] } }
  _roofW = null; if (!s) { BD.roll[W.id] = { ok: false, why: 'no clear spot within 70 m of the arrival' }; return } const [x, z] = s, y = W.surface(x, z) || 0, ry = Math.round(Math.atan2(a.x - x, a.z - z) / (Math.PI / 2)) * (Math.PI / 2);   /* open front faces the arrival (snapped to 90° so the collision boxes match the walls) */
  const parts = [], c = Math.cos(ry), sn = Math.sin(ry), L2W = (lx, lz) => [x + lx * c + lz * sn, z - lx * sn + lz * c];
  const P = (hex, lx, ly, lz, sx, sy, sz) => { const [wx, wz] = L2W(lx, lz); parts.push([BG.box, hex, K.M(wx, y + ly, wz, sx, sy, sz, 0, ry, 0), 0]) };
  P(0xf4f4f2, 0, .05, 0, 3.2, .1, 2.2); P(0xf4f4f2, 0, 1.55, -1.05, 3.2, 3.1, .1); P(0xf4f4f2, -1.55, 1.55, 0, .1, 3.1, 2.2); P(0xf4f4f2, 1.55, 1.55, 0, .1, 3.1, 2.2); P(0x1f4ab8, 0, 3.2, .05, 3.5, .3, 2.5); P(0xd82a2a, 0, .5, .6, 2.4, 1, .5);
  for (let k = 0; k < 3; k++) { P(0x9a9aa0, 0, .6 + k * .7, -.8, 3, .03, .3); for (let i = 0; i < 7; i++) P([0xf4d23a, 0xff8a3a, 0x8a4ad8, 0x3aa85a, 0xd82a2a, 0xf4f4f2][(i + k) % 6], -1.2 + i * .4, .75 + k * .7, -.8, .3, .25, .22) }
  P(0x5a1a8a, 2.3, 1, .2, .9, 2, 1);   /* PuffPop machine body, beside the kiosk */
  const grp = new THREE.Group(); grp.name = 'bd_roll'; const m = K.floraMat(0, { rough: .7 }); m.userData.lin = 1; grp.add(new THREE.Mesh(K.merge(parts), m));
  if (!AT.tex) atlasBuild();
  const fas = canvasTex2(512, 128, (g, w, h) => { g.fillStyle = '#1f4ab8'; g.fillRect(0, 0, w, h); g.fillStyle = '#d82a2a'; g.fillRect(0, h - 20, w, 12); g.fillStyle = '#fff'; g.textAlign = 'left'; g.textBaseline = 'middle'; fitText(g, 'ApeMart Express', w - 40, 58, '900 #px Arial, sans-serif', 46, 20); g.font = '600 28px "Noto Sans Thai", "Noto Sans Hebrew", Tahoma, Arial, sans-serif'; g.textAlign = W.id === 'jerusalem' ? 'right' : 'left'; g.fillText(R[0], W.id === 'jerusalem' ? w - 22 : 22, 92) });
  const sm = new THREE.MeshStandardMaterial({ map: fas, emissiveMap: fas, emissive: 0xffffff, emissiveIntensity: .3, roughness: .5 }); sm.userData.lin = 1; const fq = new THREE.Mesh(new THREE.PlaneGeometry(3.4, .85), sm); const [fx2, fz2] = L2W(0, 1.32); fq.position.set(fx2, y + 3.2, fz2); fq.rotation.y = ry; grp.add(fq);
  const ppm = new THREE.MeshStandardMaterial({ map: AT.tex, emissiveMap: AT.tex, emissive: 0xffffff, emissiveIntensity: .35, roughness: .5 }); ppm.userData.lin = 1; const pq = new THREE.Mesh(new THREE.PlaneGeometry(.88, 1.78), ppm); const r = AT.r.puffpop, uv = pq.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, r[0] + uv.getX(i) * r[2], r[1] + uv.getY(i) * r[3]); const [px2, pz2] = L2W(2.3, .71); pq.position.set(px2, y + 1.05, pz2); pq.rotation.y = ry; grp.add(pq);
  W.group.add(grp);
  for (const [lx0, lx1, lz0, lz1] of [[-1.6, 1.6, -1.1, -.95], [-1.6, -1.45, -1.1, 1.1], [1.45, 1.6, -1.1, 1.1], [-1.2, 1.2, .35, .85], [1.85, 2.75, -.3, .7]]) { const q = [L2W(lx0, lz0), L2W(lx1, lz1)]; W.cols.push([Math.min(q[0][0], q[1][0]), Math.max(q[0][0], q[1][0]), Math.min(q[0][1], q[1][1]), Math.max(q[0][1], q[1][1])]) }
  const stock = ['pp_puffs', 'pp_tropic', 'am_noodles', 'am_bananas', 'water', R[1]].filter(id => AV.ITEMS[id]); const [kx, kz] = L2W(0, 1.6), [vx, vz] = L2W(2.3, 1.4);
  const K2 = { id: 'apemart_' + W.id, name: L('ApeMart Express', 'ApeMart Express'), greet: L('“Hi! Snacks, drinks, noodles — and something local.”', '“¡Hola! Snacks, bebidas, fideos… y algo local.”'), items: stock.map(id => [id, id === R[1] ? Math.max(3, AV.ITEMS[id].price || 8) : ({ pp_puffs: 4, pp_tropic: 4, am_noodles: 5, am_bananas: 3, water: 2 })[id] || 5]), x: kx, z: kz, reach: 5 };
  W.T.push({ x: kx, z: kz, r: 2.2, label: () => tr('🛒 ApeMart Express: snacks, drinks, local staples', '🛒 ApeMart Express: snacks, bebidas, básicos locales'), fn: () => AV.shop.open(K2), kind: 'shop' });
  const V2 = { id: 'puffpop_' + W.id, name: L('PuffPop vending machine', 'Máquina PuffPop'), greet: L('INSERT CREDITS.', 'INTRODUCE CRÉDITOS.'), items: [['pp_puffs', 4], ['pp_tropic', 4], ['pp_grape', 4]], x: vx, z: vz, reach: 4 };
  W.T.push({ x: vx, z: vz, r: 1.6, label: () => tr('🥤 PuffPop vending machine', '🥤 Máquina expendedora PuffPop'), fn: () => AV.shop.open(V2), kind: 'shop' });
  const cl = L2W(0, -.35), clerk = staffAt(W, 'apemart', cl[0], cl[1], ry); BD.staff = (BD.staff || []).filter(g => g !== clerk);   /* the rollout clerk is not part of the district A/B */
  BD.roll[W.id] = { ok: true, x: +x.toFixed(1), z: +z.toFixed(1), stock: stock.length } }

const prevE = AV.onWorldEnter; AV.onWorldEnter = function (W) { if (prevE) prevE(W); BD.applySkin(); registerFurniture(); if (bbMusic0 !== null) bbMusic0 = null; if (W && W.id !== WID && AV.S && AV.S.v21) AV.S.v21.lp = null;
  if (W && W.ctx && ROLL[W.id] && !W.__bdRoll) { W.__bdRoll = true; try { rollout(W) } catch (e) { console.warn('brand rollout failed', W.id, e); BD.roll[W.id] = { ok: false, err: String(e).slice(0, 200) } } }
  if (!W || W.id !== WID || W.__bd21 || !W.ctx) return; W.__bd21 = true; try { build(W) } catch (e) { console.warn('brand district failed', e); BD.stats.err = String(e && e.stack || e).slice(0, 300) } };
})(window.AV);
