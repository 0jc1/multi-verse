/* APEVERSE 3.0 - lw_style.js : the expanded CHARACTER CREATOR + WARDROBE, barbers, boutiques and the home closet.
   One editor, four modes (same 3D preview, same catalogue, everything saved in S.me + S.lw.wardrobe):
     new      - New game: everything free, the chosen outfit becomes yours; + start city, two starter homes, package (as before)
     barber   - Barber / hairdresser (in every world): hair style + colour, facial hair + colour, eye colour. Paid per visit.
     boutique - Clothing boutique (in every world): every garment, shoes, headwear, accessories and the owner's brand prints
                (APEVERSE, MOONMELT, SOLTERRA, ZtonedApe, SWAG as tees + hoodies). Items you do not own show a price; Buy & wear.
     closet   - Home wardrobe + ApePhone 🪞 Me: rename and wear anything you own (free).
   Catalogue: 3 bodies (ZtonedApe chimp, male, female), 4 builds, height, 12 skin tones, 12 fur colours, 8 eye colours, 29 hairstyles
   (25 sculpted in anatomy_hair.js + the classics), 14 hair colours, 17 facial hair styles (+ colour), 50+ tops incl. every brand print,
   12 bottoms, 9 shoes, 4 headwear, 5 eyewear, chains, earrings, backpacks, flowers, 8 outfit presets.
   Preview: ONE persistent WebGL renderer (the 2.3 white-screen lesson), drag to rotate, wheel / buttons to zoom, Face / Full framing.
   Merch bought in the brand stores (S.items wear_<design>_<garment>) counts as owned; wearing a print keeps S.wear in sync. */
'use strict';
(function (AV) {
const LW = AV.LW; if (!LW || !LW.lookFor) return;
const tr = AV.tr, L = LW.L, say = LW.say, esc = LW.esc, H = AV.home, AN = AV.anatomy || {};
const ST = LW.style = { stats: { opened: 0, bought: 0, barber: 0, previews: 0 } };

/* ---------------- catalogue ---------------- */
const SKINS = [0xf6dcc8, 0xf2d0b4, 0xe8c09a, 0xe0ac69, 0xd8a47a, 0xc68642, 0xb07848, 0xa86a3c, 0x8d5524, 0x704020, 0x5a3820, 0x3e2614];
const FURS = [0x6a4a32, 0x3a2a1e, 0x8a6a4a, 0x2a2a2e, 0xc8a070, 0x7a3a2a, 0x4a6a8a, 0x1a1412, 0xa8a8a8, 0xd8c8a8, 0x6a3a6a, 0x3a5a3a];
const HAIRC = [0x0e0a08, 0x2a1a10, 0x4a2c18, 0x7a5230, 0xa87040, 0xd8b860, 0xf0e0b0, 0xb0b0b0, 0xe8e8e8, 0xa02a1a, 0xd84a8a, 0x3a8ad8, 0x4ad87a, 0x8a4ad8];
const EYES = [0x4a2a10, 0x6a3a14, 0x2a5a8a, 0x3a7a5a, 0x7a8a9a, 0x1a1a1a, 0x8a6a2a, 0xa04ad8];
const COLS = [0xf0ece4, 0x1a1a1e, 0x2a6ad8, 0xd83a3a, 0x3ad87a, 0xffd23a, 0xff4ad2, 0x8a4ad8, 0xff8a2a, 0x4a3a2a, 0x7a8a9a, 0x2a4a3a];
const HAIR = [['short', L('Short', 'Corto')], ['messy', L('Messy', 'Despeinado')], ['blond', L('Surfer', 'Surfero')], ['bun', L('Bun', 'Moño')], ['long', L('Long', 'Largo')], ['afro', L('Afro', 'Afro')], ['bald', L('Bald', 'Calvo')], ['cap', L('Cap + short', 'Gorra + corto')],
  ['h_buzz', L('Buzz cut', 'Rapado')], ['h_crew', L('Crew cut', 'Corte militar')], ['h_fade', L('Fade', 'Degradado')], ['h_undercut', L('Undercut', 'Undercut')], ['h_quiff', L('Quiff', 'Tupé')], ['h_pompadour', L('Pompadour', 'Pompadour')],
  ['h_mohawk', L('Mohawk', 'Cresta')], ['h_spiky', L('Spiky', 'Pincho')], ['h_curly', L('Curls', 'Rizos')], ['h_curlyTop', L('Curly top', 'Rizos arriba')], ['h_afroPuffs', L('Afro puffs', 'Moños afro')], ['h_topKnot', L('Top knot', 'Moño alto')],
  ['h_ponytail', L('Ponytail', 'Coleta')], ['h_highPony', L('High ponytail', 'Coleta alta')], ['h_pigtails', L('Pigtails', 'Dos coletas')], ['h_boxBraids', L('Box braids', 'Trenzas')], ['h_cornrows', L('Cornrows', 'Trenzas pegadas')],
  ['h_dreads', L('Dreadlocks', 'Rastas')], ['h_locsUp', L('Locs up', 'Rastas recogidas')], ['h_bob', L('Bob', 'Bob')], ['h_longWavy', L('Long wavy', 'Largo ondulado')], ['h_sidePart', L('Side part', 'Raya al lado')], ['h_mullet', L('Mullet', 'Mullet')],
  ['h_bangs', L('Bangs', 'Flequillo')], ['h_shag', L('Shag', 'Shag')]].filter(([id]) => !id.startsWith('h_') || !AN.HAIR || AN.HAIR.includes(id.slice(2)));
const BEARD = [['', L('Clean shaven', 'Afeitado')], ['stubble', L('Stubble', 'Barba de días')], ['short', L('Short beard', 'Barba corta')], ['full', L('Full beard', 'Barba completa')], ['long', L('Long beard', 'Barba larga')], ['boxed', L('Boxed beard', 'Barba recortada')],
  ['goatee', L('Goatee', 'Perilla')], ['vanDyke', L('Van Dyke', 'Van Dyke')], ['circle', L('Circle beard', 'Candado')], ['anchor', L('Anchor', 'Ancla')], ['mustache', L('Mustache', 'Bigote')], ['handlebar', L('Handlebar', 'Manillar')], ['chevron', L('Chevron', 'Chevron')],
  ['horseshoe', L('Horseshoe', 'Herradura')], ['chinstrap', L('Chinstrap', 'Barba de collar')], ['soulPatch', L('Soul patch', 'Mosca')], ['muttonChops', L('Mutton chops', 'Patillas')], ['viking', L('Viking braids', 'Trenzas vikingas')]];
/* tops: [id, name, shirt spec, price, tag] */
const TOPS = [['ztoned', L('ZtonedApe tee', 'Camiseta ZtonedApe'), { decal: 'ztoned', col: 0xf0ece4 }, 35, 'tee'], ['giant', L('Giant Hostel tee', 'Camiseta Giant Hostel'), { decal: 'giant', col: 0xf0ece4 }, 30, 'tee'],
  ['oneLove', L('One Love tee', 'Camiseta One Love'), { decal: 'oneLove', fab: 'reggae' }, 30, 'tee'], ['plain', L('Plain tee', 'Camiseta lisa'), { col: 'C' }, 15, 'tee'], ['hawaii', L('Hawaiian shirt', 'Camisa hawaiana'), { fab: 'hawaii' }, 40, 'shirt'],
  ['floral', L('Floral shirt', 'Camisa de flores'), { fab: 'floral' }, 40, 'shirt'], ['tiedye', L('Tie-dye', 'Tie-dye'), { fab: 'tiedye' }, 35, 'tee'], ['reggae', L('Reggae stripes', 'Rayas reggae'), { fab: 'reggae' }, 30, 'tee'],
  ['tank', L('Tank top', 'Camiseta de tirantes'), { fab: 'tank', sleeveless: true }, 20, 'tee'], ['tankPlain', L('Plain tank', 'Tirantes lisa'), { col: 'C', sleeveless: true, loose: 1.02 }, 15, 'tee'],
  ['jersey', L('Basketball jersey', 'Camiseta de baloncesto'), { col: 'C', sleeveless: true, loose: 1.16 }, 45, 'sport'], ['hoodie', L('Hoodie', 'Sudadera'), { col: 'C', o: { long: true, loose: 1.16 } }, 55, 'street'],
  ['trackTop', L('Track jacket', 'Chaqueta de chándal'), { col: 'C', o: { long: true, loose: 1.1 } }, 50, 'sport'], ['longsleeve', L('Long-sleeve tee', 'Camiseta manga larga'), { col: 'C', o: { long: true, loose: 1.06 } }, 25, 'tee'],
  ['oversize', L('Oversized tee', 'Camiseta oversize'), { col: 'C', loose: 1.2 }, 30, 'street'], ['dressShirt', L('Dress shirt', 'Camisa de vestir'), { col: 0xf4f4f0, o: { long: true, loose: 1.03 } }, 45, 'formal'],
  ['suit', L('Suit jacket', 'Americana'), { col: 'C', o: { jacket: true } }, 120, 'formal'], ['denimJacket', L('Denim jacket', 'Chaqueta vaquera'), { col: 0x3a5a8a, o: { jacket: true, loose: 1.12 } }, 85, 'street'],
  ['leather', L('Leather jacket', 'Chaqueta de cuero'), { col: 0x1a1412, o: { jacket: true, loose: 1.1 } }, 140, 'street'], ['summerDress', L('Summer dress', 'Vestido de verano'), { fab: 'floral', o: { robe: .55 } }, 70, 'dress'],
  ['dress', L('Dress', 'Vestido'), { col: 'C', o: { robe: .6 } }, 70, 'dress'], ['kaftan', L('Tie-dye kaftan', 'Caftán tie-dye'), { fab: 'tiedye', o: { robe: .9 } }, 60, 'dress'], ['eveningDress', L('Evening dress', 'Vestido de noche'), { col: 'C', o: { robe: 1 } }, 150, 'formal']];
/* the owner's brand prints (data/merch_catalog.js + brand_designs.js) as tees + hoodies */
function merchTops() { const M = AV.MERCH; if (!M || !M.designs) return []; const out = [];
  for (const d of M.designs) for (const g of (d.garments || ['tee'])) out.push(['m_' + d.id + '_' + g, d.name, g === 'hoodie' ? { print: d.id, col: 0xf0ece4, o: { long: true, loose: 1.16 } } : { print: d.id, col: 0xf0ece4 }, g === 'hoodie' ? 85 : 45, 'brand', d]);
  return out }
const BOTS = [['denim', L('Jeans', 'Vaqueros'), { kind: 'denim', col: 0x2c3a5a }, 50], ['blackJeans', L('Black jeans', 'Vaqueros negros'), { kind: 'denim', col: 0x1a1a22 }, 50], ['twill', L('Chinos', 'Chinos'), { col: 0xc8b088 }, 45],
  ['cargo', L('Cargo trousers', 'Pantalón cargo'), { col: 0x5a5a3a, loose: 1.12 }, 55], ['sweat', L('Sweatpants', 'Pantalón de chándal'), { col: 0x7a7a82, loose: 1.16 }, 35], ['track', L('Track pants', 'Pantalón deportivo'), { col: 0x1a1a1e, loose: 1.1 }, 35],
  ['linen', L('Linen trousers', 'Pantalón de lino'), { col: 0xe8e0d0, loose: 1.12 }, 45], ['suitTrousers', L('Suit trousers', 'Pantalón de traje'), { col: 0x22222a, loose: 1.02 }, 70], ['elephant', L('Elephant pants', 'Pantalón de elefantes'), { fab: 'elephant' }, 40],
  ['shorts', L('Shorts', 'Pantalón corto'), { col: 0x3a3a52, shorts: true }, 25], ['cargoShorts', L('Cargo shorts', 'Bermudas cargo'), { col: 0x5a5a3a, shorts: true, loose: 1.18 }, 30], ['denimShorts', L('Denim shorts', 'Shorts vaqueros'), { kind: 'denim', col: 0x4a6a9a, shorts: true }, 30]];
const FEET = [['sneaker', L('White sneakers', 'Zapatillas blancas'), { foot: 'sneaker', shoe: 0xf0f0f0 }, 60], ['sneakerBlack', L('Black sneakers', 'Zapatillas negras'), { foot: 'sneaker', shoe: 0x1a1a1e }, 60], ['sneakerRed', L('Red sneakers', 'Zapatillas rojas'), { foot: 'sneaker', shoe: 0xd83a3a }, 70],
  ['hiTops', L('High-tops', 'Botas altas deportivas'), { foot: 'sneaker', boots: true, shoe: 0xf0ece4 }, 85], ['boots', L('Boots', 'Botas'), { foot: 'sneaker', boots: true, shoe: 0x5a3a22 }, 90], ['workBoots', L('Work boots', 'Botas de trabajo'), { foot: 'sneaker', boots: true, shoe: 0x8a6a3a }, 80],
  ['flip', L('Flip-flops', 'Chanclas'), { foot: 'flip', shoe: 0x2a2622 }, 10], ['sandals', L('Sandals', 'Sandalias'), { foot: 'flip', shoe: 0x7a5232 }, 30], ['slides', L('Slides', 'Chanclas de pala'), { foot: 'flip', shoe: 0x4a5a3a }, 25]];
const HATS = [['', L('No hat', 'Sin sombrero'), 0], ['cap', L('Cap', 'Gorra'), 25], ['beanie', L('Beanie', 'Gorro'), 20], ['bucket', L('Bucket hat', 'Gorro de pescador'), 30], ['kufi', L('Kufi', 'Kufi'), 20]];
const EYEW = [['', L('None', 'Nada'), 0], ['clear', L('Glasses', 'Gafas'), 40], ['gold', L('Gold frames', 'Montura dorada'), 60], ['sun', L('Sunglasses', 'Gafas de sol'), 45], ['aviator', L('Gold sunglasses', 'Gafas de sol doradas'), 70]];
const NECK = [['', L('None', 'Nada'), 0], ['gold', L('Gold chain', 'Cadena de oro'), 150], ['silver', L('Silver chain', 'Cadena de plata'), 90]];
const EARS = [['', L('None', 'Nada'), 0], ['gold', L('Gold hoops', 'Aros dorados'), 60], ['silver', L('Silver hoops', 'Aros plateados'), 40]];
const BACK = [['', L('None', 'Nada'), 0], ['blue', L('Backpack (blue)', 'Mochila (azul)'), 55], ['black', L('Backpack (black)', 'Mochila (negra)'), 55], ['red', L('Backpack (red)', 'Mochila (roja)'), 55]];
const FLOWERS = [0, 0xff6ad5, 0xffd84a, 0x7ff0ff, 0xffffff];
const BUILDS = [['slim', L('Slim', 'Delgado'), .93], ['average', L('Average', 'Normal'), 1], ['athletic', L('Athletic', 'Atlético'), 1.05], ['heavy', L('Heavy', 'Corpulento'), 1.13]];
const PRESETS = [['street', L('Streetwear', 'Streetwear'), { top: 'hoodie', topCol: 0x1a1a1e, bot: 'cargo', foot: 'sneakerBlack', hat: 'cap', hatCol: 0x1a1a1e, neck: '' }],
  ['hiphop', L('Hip-hop', 'Hip-hop'), { top: 'oversize', topCol: 0xf0ece4, bot: 'blackJeans', foot: 'hiTops', hat: 'cap', hatCol: 0xd83a3a, neck: 'gold', eyew: 'sun' }],
  ['sport', L('Sporty', 'Deportivo'), { top: 'jersey', topCol: 0xffd23a, bot: 'track', foot: 'sneakerRed', hat: '', neck: '' }],
  ['beach', L('Beach day', 'Día de playa'), { top: 'hawaii', bot: 'shorts', foot: 'flip', hat: 'bucket', hatCol: 0xf0e0b0, eyew: 'sun' }],
  ['hippie', L('Hippie', 'Hippie'), { top: 'tiedye', bot: 'elephant', foot: 'sandals', hat: '', flower: 0xff6ad5, eyew: 'gold' }],
  ['formal', L('Formal', 'Formal'), { top: 'suit', topCol: 0x22222a, bot: 'suitTrousers', foot: 'boots', hat: '', eyew: '', neck: '' }],
  ['festival', L('Festival', 'Festival'), { top: 'kaftan', bot: 'denimShorts', foot: 'sandals', hat: 'bucket', hatCol: 0xff4ad2, eyew: 'aviator', back: 'black' }],
  ['ztoned', L('ZtonedApe', 'ZtonedApe'), { top: 'ztoned', bot: 'elephant', foot: 'flip', hat: '', eyew: 'clear' }]];
const allTops = () => TOPS.concat(merchTops()), findTop = id => allTops().find(t => t[0] === id) || TOPS[0], findBot = id => BOTS.find(b => b[0] === id) || BOTS[0], findFoot = id => FEET.find(f => f[0] === id) || FEET[0];
ST.catalogue = () => ({ hair: HAIR.length, beard: BEARD.length - 1, tops: allTops().length, bottoms: BOTS.length, shoes: FEET.length, hats: HATS.length - 1, eyewear: EYEW.length - 1, skins: SKINS.length, furs: FURS.length, hairColours: HAIRC.length, eyes: EYES.length, presets: PRESETS.length });

/* ---------------- look -> body (replaces LW.lookFor; old saves keep working) ---------------- */
const def0 = LW.defaultMe;
LW.defaultMe = () => Object.assign(def0(), { build: 'average', height: 0, eye: EYES[0], beard: '', beardCol: null, hat: '', hatCol: 0x1a1a1e, eyew: '', neck: '', ears: '', back: '', flower: 0, botCol: null });
function norm(me) { me = Object.assign(LW.defaultMe(), me || {}); if (me.beard === true) me.beard = 'full'; if (me.beard === false) me.beard = ''; if (me.glasses === true && !me.eyew) me.eyew = 'clear'; if (me.flower === true) me.flower = 0xff6ad5; if (me.flower === false) me.flower = 0;
  if (me.foot === 'boots' && !FEET.find(f => f[0] === 'boots')) me.foot = 'boots'; return me }
const tcol = (spec, me) => spec.col === 'C' ? (me.topCol != null ? me.topCol : 0x2a6ad8) : spec.col;
LW.lookFor = function (m) { const me = norm(m), T = findTop(me.top), Ts = T[2], B = findBot(me.bot)[2], F = findFoot(me.foot)[2], shirt = Object.assign({}, Ts, { col: tcol(Ts, me) });
  if (me.body === 'ape') { const hat = me.hat ? { style: me.hat, cols: [me.hatCol, me.hatCol] } : undefined;
    return { sp: 'chimp', fur: me.fur, skin: 0xc79a6e, dark: new THREE.Color(me.fur).multiplyScalar(.45).getHex(), nail: 0xd8b090, tip: 0xffffff, eye: me.eye || 0x6a3a14, strandF: 250, shells: 12, size: 1, shadow: true, hat,
      shirt: { o: Object.assign({ loose: (shirt.loose || 1.04), sleeve: shirt.sleeveless ? .07 : .55 }, shirt.o || {}), col: shirt.col == null ? 0xf0ece4 : shirt.col, fab: shirt.fab, decal: shirt.decal, print: shirt.print },
      pants: { o: { loose: (B.loose || 1.1), shorts: !!B.shorts }, col: B.col || 0x3a3a52, kind: B.kind || 'twill', fab: B.fab }, shoes: { o: {}, cols: [0x2a2a2c, 0xe8e4da, 0x2a2a2c, 0x5a5a62] } } }
  const bl = (BUILDS.find(b => b[0] === me.build) || BUILDS[1])[2], x = {}; if (me.eyew === 'sun' || me.eyew === 'aviator') x.sun = me.eyew === 'aviator' ? 0xc8a040 : 0x111111; if (me.neck) x.chain = me.neck === 'gold' ? 0xe8c040 : 0xd0d4d8;
  if (me.ears) x.earrings = me.ears === 'gold' ? 0xe8c040 : 0xd0d4d8; if (me.back) x.backpack = { blue: 0x2a4a6a, black: 0x1a1a1e, red: 0xa82a2a }[me.back];
  shirt.loose = (shirt.loose || 1.08) * (bl > 1.08 ? 1.06 : 1); const pants = Object.assign({}, B, me.botCol != null && !B.fab ? { col: me.botCol } : {});
  return { sp: me.body === 'female' ? 'human_b' : 'human_a', height: me.height ? me.height / 100 : undefined, skin: me.skin, hair: me.hair, eye: me.eye, redEye: !!me.redEye, style: me.style, beard: me.beard === 'stubble' ? 'short' : (me.beard || false), beardCol: me.beard === 'stubble' ? new THREE.Color(me.beardCol == null ? me.hair : me.beardCol).lerp(new THREE.Color(me.skin), .55).getHex() : (me.beardCol == null ? me.hair : me.beardCol),   /* stubble = a short shape tinted toward the skin: a shadow of a beard */
    glasses: me.eyew === 'clear' ? true : me.eyew === 'gold' ? 0xc8a040 : undefined, flower: me.flower || undefined, headwear: me.hat || undefined, headwearCol: me.hatCol, extras: Object.keys(x).length ? x : null, shadow: true,
    shirt, pants, foot: F.foot, boots: !!F.boots, shoe: F.shoe, _build: bl } };
const build0 = LW.buildAvatar;
LW.buildAvatar = me => { const Lk = LW.lookFor(me), g = me && me.body !== 'ape' ? AV.chars.softHuman(Lk) : build0(me); if (Lk._build && Lk._build !== 1) { g.scale.x *= Lk._build; g.scale.z *= Lk._build } AV.lin(g); g.userData.me = JSON.stringify(me); return g };

/* ---------------- ownership + prices ---------------- */
const wardrobe = () => { const S = AV.S; S.lw = S.lw || {}; S.lw.wardrobe = S.lw.wardrobe || { own: {} }; return S.lw.wardrobe };
const SLOT = { top: () => allTops(), bot: () => BOTS, foot: () => FEET, hat: () => HATS, eyew: () => EYEW, neck: () => NECK, ears: () => EARS, back: () => BACK };
function owns(slot, id) { if (!id) return true; const w = wardrobe(); if (w.own[slot + ':' + id]) return true; if (slot === 'top' && id.startsWith('m_')) { const k = 'wear' + id.slice(1); return !!(AV.S.items && AV.S.items[k] > 0) }
  const me = norm(AV.S.me); return me[slot] === id }   /* what you wear when 2.3 saves load counts as owned */
const price = (slot, id) => { const it = SLOT[slot]().find(x => x[0] === id); return it ? (slot === 'top' || slot === 'bot' || slot === 'foot' ? it[3] : it[2]) || 0 : 0 };
const BARBER = { style: 45, hair: 30, beard: 25, beardCol: 15, eye: 20 };

/* ---------------- editor UI ---------------- */
const css = document.createElement('style'); css.textContent = '#lwSty{position:fixed;inset:0;z-index:80;background:radial-gradient(circle at 25% 15%,#40206a,#120a1e 72%);color:#fff;font:14px Georgia,serif;display:none}' +
  '#lwSty .wrap{display:flex;gap:18px;height:100%;box-sizing:border-box;padding:14px 18px}#lwSty .pv{flex:0 0 380px;display:flex;flex-direction:column;align-items:center}#lwSty canvas{width:360px;height:520px;border-radius:18px;background:linear-gradient(#2a1a4a,#140c24);box-shadow:0 10px 40px #000a;cursor:grab;touch-action:none}' +
  '#lwSty .pvb{margin-top:8px}#lwSty .side{flex:1;display:flex;flex-direction:column;min-width:0}#lwSty h2{margin:2px 0 8px;color:#ffd23a;font-size:24px}#lwSty .tabs{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px}#lwSty .tabs button{border-radius:20px;padding:7px 14px}' +
  '#lwSty .tabs button.on{background:#ffd23a;color:#2a1408;border-color:#ffd23a}#lwSty .pane{flex:1;overflow:auto;padding-right:6px;display:none}#lwSty .pane.on{display:block}#lwSty h4{margin:10px 0 5px;color:#ff8ad8;font-size:14px;text-transform:uppercase;letter-spacing:.08em}' +
  '#lwSty button{font:13px Georgia,serif;margin:2px;padding:6px 10px;border-radius:9px;border:1px solid #6a5a8a;background:#2a1a40;color:#fff;cursor:pointer;position:relative}#lwSty button:hover{border-color:#ffd23a}#lwSty button.on{background:#ff4ad2;border-color:#fff}' +
  '#lwSty button.lock{opacity:.45}#lwSty .sw{width:28px;height:28px;border-radius:50%;padding:0;vertical-align:middle}#lwSty .pr{font-size:10px;background:#ffd23a;color:#2a1408;border-radius:8px;padding:0 4px;margin-left:4px}#lwSty .own{font-size:10px;color:#8affc0;margin-left:4px}' +
  '#lwSty .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:6px}#lwSty .card{border:1px solid #4a3a6a;border-radius:10px;background:#1e1232;padding:4px;cursor:pointer;text-align:center;font-size:12px}#lwSty .card.on{border-color:#ffd23a;background:#3a2a10}#lwSty .card img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;background:#f0ece4}' +
  '#lwSty .foot{border-top:1px solid #4a3a6a;padding-top:8px;margin-top:6px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}#lwSty .go{font-size:17px;padding:10px 18px;background:#ffd23a;color:#2a1408;border:none}#lwSty input[type=text]{font:16px Georgia,serif;padding:6px 10px;border-radius:8px;border:1px solid #6a5a8a;background:#1a1030;color:#fff;width:240px}' +
  '#lwSty input[type=range]{width:220px;vertical-align:middle}#lwSty .homes{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:6px}#lwSty .home{border:1px solid #4a3a6a;border-radius:10px;padding:6px 8px;cursor:pointer;background:#1e1232}#lwSty .home.on{border-color:#ffd23a;background:#3a2a10}#lwSty .home small{opacity:.8}' +
  '@media (max-width:1150px){#lwSty .pv{flex:0 0 290px}#lwSty canvas{width:280px;height:405px}#lwSty .wrap{gap:12px;padding:10px}}@media (max-width:900px){#lwSty .wrap{flex-direction:column;overflow:auto}#lwSty .pv{flex:none}#lwSty canvas{width:260px;height:360px}}';
document.head.appendChild(css);
const ov = document.createElement('div'); ov.id = 'lwSty'; document.body.appendChild(ov);
let me = null, orig = null, opt = null, mode = 'new', tab = 'body', pvCanvas = null, pv = null, spin = 0, zoom = 1, frameFace = false, drag = null, done = null;
const CITIES = ['ape_town', 'chiang_mai', 'pai', 'koh_tao', 'amsterdam', 'madrid', 'barcelona', 'sevilla', 'paris', 'vienna', 'tokyo', 'rio', 'oaxaca', 'astro9'];
const wn = w => (AV.worldMeta && (AV.worldMeta(w) || {}).name) || w;
const hex = c => '#' + (c >>> 0).toString(16).padStart(6, '0');

/* ONE preview renderer for the editor's lifetime; drag = rotate, wheel = zoom */
function preview() { if (!pvCanvas) return; if (!pv) { const R = new THREE.WebGLRenderer({ canvas: pvCanvas, antialias: true, alpha: true }); R.outputEncoding = THREE.sRGBEncoding; R.setPixelRatio(Math.min(2, devicePixelRatio || 1)); R.setSize(360, 520, false);
    const sc = new THREE.Scene(); sc.add(new THREE.HemisphereLight(0xffffff, 0x4a3a5a, .95)); const d = new THREE.DirectionalLight(0xffe8d0, 1.15); d.position.set(2, 4, 3); sc.add(d); const rim = new THREE.DirectionalLight(0xc8a0ff, .5); rim.position.set(-3, 2, -3); sc.add(rim);
    const cam = new THREE.PerspectiveCamera(30, 360 / 520, .05, 50); pv = { R, sc, cam, g: null, on: true };
    const loop = () => { if (!pv || !pv.on) return; if (!drag) spin += .004; if (pv.g) pv.g.rotation.y = spin; const f = frameFace ? 1 : 0, ty = .92 + f * .66, dist = (4.6 - f * 2.75) / zoom; pv.cam.position.set(0, ty + .1, dist); pv.cam.lookAt(0, ty, 0); pv.R.render(pv.sc, pv.cam); requestAnimationFrame(loop) }; loop();
    pvCanvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, s: spin }; pvCanvas.setPointerCapture(e.pointerId); pvCanvas.style.cursor = 'grabbing' });
    pvCanvas.addEventListener('pointermove', e => { if (drag) spin = drag.s + (e.clientX - drag.x) * .012 }); pvCanvas.addEventListener('pointerup', () => { drag = null; pvCanvas.style.cursor = 'grab' });
    pvCanvas.addEventListener('wheel', e => { e.preventDefault(); zoom = Math.max(.7, Math.min(2.4, zoom * (e.deltaY > 0 ? .92 : 1.08))) }, { passive: false }) }
  if (pv.g) { pv.sc.remove(pv.g); AV.dispose(pv.g) } try { pv.g = LW.buildAvatar(me); pv.sc.add(pv.g); ST.stats.previews++; LW.stats.preview = (LW.stats.preview || 0) + 1 } catch (e) { console.warn('style preview', e) } }
LW.previewContexts = () => (pv ? 1 : 0);

/* which categories each mode shows */
const TABS = { new: ['body', 'face', 'hair', 'beard', 'outfits', 'tops', 'bottoms', 'shoes', 'acc', 'home'], barber: ['hair', 'beard', 'face'], boutique: ['outfits', 'tops', 'bottoms', 'shoes', 'acc'], closet: ['tops', 'bottoms', 'shoes', 'acc', 'name'] };
const TABN = { body: L('Body', 'Cuerpo'), face: L('Face & eyes', 'Cara y ojos'), hair: L('Hair', 'Pelo'), beard: L('Facial hair', 'Vello facial'), outfits: L('Outfits', 'Conjuntos'), tops: L('Tops', 'Arriba'), bottoms: L('Bottoms', 'Abajo'), shoes: L('Shoes', 'Calzado'), acc: L('Accessories', 'Accesorios'), home: L('Home & start', 'Casa e inicio'), name: L('Name', 'Nombre') };
const free = () => mode === 'new';
function canPick(slot, id) { return free() || mode === 'boutique' || owns(slot, id) }
const tag = (slot, id) => free() || !id ? '' : owns(slot, id) ? '<span class="own">✓</span>' : mode === 'boutique' ? '<span class="pr">' + price(slot, id) + '¢</span>' : '';
const btn = (k, v, name, slot) => { const ok = slot ? canPick(slot, v) : true; return '<button class="' + (me[k] === v ? 'on ' : '') + (ok ? '' : 'lock') + '" data-o="' + k + '" data-v="' + v + '"' + (ok ? '' : ' data-lock="1"') + '>' + esc(say(name)) + (slot ? tag(slot, v) : '') + '</button>' };
const sw = (k, list) => list.map(c => '<button class="sw ' + (me[k] === c ? 'on' : '') + '" data-sw="' + k + '" data-v="' + c + '" style="background:' + hex(c) + '" title="' + hex(c) + '"></button>').join('');
function pane(t) { const human = me.body !== 'ape';
  if (t === 'body') return '<h4>' + tr('Name', 'Nombre') + '</h4><input type="text" id="lwName" maxlength="20" placeholder="' + tr('Your name', 'Tu nombre') + '" value="' + esc(me.name) + '">' +
    '<h4>' + tr('Body', 'Cuerpo') + '</h4>' + [['ape', L('ZtonedApe classic (ape)', 'ZtonedApe clásico (simio)')], ['male', L('Male', 'Hombre')], ['female', L('Female', 'Mujer')]].map(([v, n]) => btn('body', v, n)).join('') +
    (human ? '<h4>' + tr('Build', 'Complexión') + '</h4>' + BUILDS.map(([v, n]) => btn('build', v, n)).join('') + '<h4>' + tr('Height', 'Altura') + ' <span id="lwHv">' + (me.height || (me.body === 'female' ? 166 : 176)) + ' cm</span></h4><input type="range" id="lwH" min="150" max="200" value="' + (me.height || (me.body === 'female' ? 166 : 176)) + '">' +
      '<h4>' + tr('Skin tone', 'Tono de piel') + '</h4>' + sw('skin', SKINS) : '<h4>' + tr('Fur', 'Pelaje') + '</h4>' + sw('fur', FURS));
  if (t === 'face') return '<h4>' + tr('Eye colour', 'Color de ojos') + '</h4>' + sw('eye', EYES) + (human ? '<h4>' + tr('Eyes', 'Ojos') + '</h4><button data-t="redEye" class="' + (me.redEye ? 'on' : '') + '">' + tr('Cloud-watcher red eyes', 'Ojos rojos de mirar nubes') + '</button>' : '') +
    (mode === 'barber' ? '<p><small>' + tr('Eye colour change', 'Cambio de color de ojos') + ': ' + BARBER.eye + '¢</small></p>' : '');
  if (t === 'hair') return human ? '<h4>' + tr('Hairstyle', 'Peinado') + ' · ' + HAIR.length + '</h4>' + HAIR.map(([v, n]) => btn('style', v, n)).join('') + '<h4>' + tr('Hair colour', 'Color de pelo') + '</h4>' + sw('hair', HAIRC) +
      (mode === 'barber' ? '<p><small>' + tr('Haircut', 'Corte') + ' ' + BARBER.style + '¢ · ' + tr('colour', 'color') + ' ' + BARBER.hair + '¢</small></p>' : '') : '<p>' + tr('ZtonedApe keeps its fur: pick a fur colour in Body, a hat in Accessories.', 'ZtonedApe mantiene su pelaje: elige color en Cuerpo y un sombrero en Accesorios.') + '</p>';
  if (t === 'beard') return human ? '<h4>' + tr('Facial hair', 'Vello facial') + ' · ' + (BEARD.length - 1) + '</h4>' + BEARD.map(([v, n]) => btn('beard', v, n)).join('') + '<h4>' + tr('Facial hair colour', 'Color del vello') + '</h4><button data-same="1" class="' + (me.beardCol == null ? 'on' : '') + '">' + tr('Same as hair', 'Igual que el pelo') + '</button>' + sw('beardCol', HAIRC) +
      (mode === 'barber' ? '<p><small>' + tr('Beard trim', 'Arreglo de barba') + ' ' + BARBER.beard + '¢</small></p>' : '') : '<p>' + tr('Apes come with their own beard.', 'Los simios ya traen su barba.') + '</p>';
  if (t === 'outfits') return '<h4>' + tr('Complete looks', 'Looks completos') + '</h4><div class="grid">' + PRESETS.map(([id, n, p]) => { const T = findTop(p.top); return '<div class="card" data-preset="' + id + '"><div style="height:46px;border-radius:8px;background:linear-gradient(135deg,' + hex(p.topCol != null ? p.topCol : (T[2].col !== 'C' && T[2].col) || 0xff4ad2) + ',' + hex(p.hatCol || 0x2a1a40) + ')"></div><b>' + esc(say(n)) + '</b></div>' }).join('') + '</div>';
  if (t === 'tops') { const base = TOPS.map(t2 => btn('top', t2[0], t2[1], 'top')).join(''), M = merchTops().filter(t2 => mode !== 'closet' || owns('top', t2[0]));
    return '<h4>' + tr('Clothing', 'Ropa') + '</h4>' + base + '<h4>' + tr('Colour (plain items)', 'Color (prendas lisas)') + '</h4>' + sw('topCol', COLS) + '<h4>' + tr('Brand prints', 'Estampados de marca') + ' · ' + M.length + '</h4><div class="grid">' +
      M.map(([id, n, , , , d]) => { const ok = canPick('top', id); return '<div class="card ' + (me.top === id ? 'on' : '') + '" data-o="top" data-v="' + id + '"' + (ok ? '' : ' data-lock="1"') + '><img alt="" loading="lazy" src="' + esc(d.thumb || d.tex || '') + '"><div>' + esc(say(n)) + (id.endsWith('_hoodie') ? ' · ' + tr('hoodie', 'sudadera') : ' · ' + tr('tee', 'camiseta')) + '</div><small>' + esc(d.brand || '') + '</small>' + tag('top', id) + '</div>' }).join('') + '</div>' }
  if (t === 'bottoms') return '<h4>' + tr('Bottoms', 'Abajo') + '</h4>' + BOTS.map(b => btn('bot', b[0], b[1], 'bot')).join('') + '<h4>' + tr('Colour (plain items)', 'Color (prendas lisas)') + '</h4><button data-same="bot" class="' + (me.botCol == null ? 'on' : '') + '">' + tr('Original', 'Original') + '</button>' + sw('botCol', COLS);
  if (t === 'shoes') return '<h4>' + tr('Shoes', 'Calzado') + '</h4>' + FEET.map(f => btn('foot', f[0], f[1], 'foot')).join('');
  if (t === 'acc') return '<h4>' + tr('Headwear', 'Sombreros') + '</h4>' + HATS.map(h => btn('hat', h[0], h[1], 'hat')).join('') + '<br>' + sw('hatCol', COLS) +
    (human ? '<h4>' + tr('Eyewear', 'Gafas') + '</h4>' + EYEW.map(h => btn('eyew', h[0], h[1], 'eyew')).join('') + '<h4>' + tr('Chains', 'Cadenas') + '</h4>' + NECK.map(h => btn('neck', h[0], h[1], 'neck')).join('') +
      '<h4>' + tr('Earrings', 'Pendientes') + '</h4>' + EARS.map(h => btn('ears', h[0], h[1], 'ears')).join('') + '<h4>' + tr('Backpack', 'Mochila') + '</h4>' + BACK.map(h => btn('back', h[0], h[1], 'back')).join('') +
      '<h4>' + tr('Flower in the hair', 'Flor en el pelo') + '</h4>' + FLOWERS.map(c => '<button class="sw ' + ((me.flower || 0) === c ? 'on' : '') + '" data-sw="flower" data-v="' + c + '" style="background:' + (c ? hex(c) : 'repeating-linear-gradient(45deg,#333,#333 4px,#555 4px,#555 8px)') + '"></button>').join('') : '');
  if (t === 'name') return '<h4>' + tr('Name', 'Nombre') + '</h4><input type="text" id="lwName" maxlength="20" value="' + esc(me.name) + '"><p><small>' + tr('Hair and beard: visit a barber. New clothes: visit a boutique or a brand store.', 'Pelo y barba: visita una barbería. Ropa nueva: visita una boutique o una tienda de marca.') + '</small></p>';
  if (t === 'home') { const homes = LW.STARTER_HOMES.filter(id => H.PROPS[id]), P = H.PROPS;
    return '<h4>' + tr('Start in', 'Empezar en') + '</h4>' + CITIES.filter(w => AV.worldDefs[w]).map(w => '<button data-city="' + w + '" class="' + (opt.city === w ? 'on' : '') + '">' + esc(wn(w)) + '</button>').join('') +
      '<h4>' + tr('Choose two starter homes in different worlds (furnished, yours to keep)', 'Elige dos casas iniciales en mundos distintos (amuebladas, tuyas)') + ' · ' + opt.homes.length + '/2</h4><div class="homes">' + homes.map(id => '<div class="home ' + (opt.homes.includes(id) ? 'on' : '') + '" data-h="' + id + '"><b>' + esc(say(P[id].name)) + '</b><br><small>' + esc(wn(P[id].w)) + ' · ' + esc(say(LW.PROP_CATS[P[id].cat] || LW.PROP_CATS.studio)) + '</small><br><small>' + esc(P[id].desc ? say(P[id].desc) : '') + '</small></div>').join('') + '</div>' +
      '<h4>' + tr('Starter package', 'Paquete inicial') + '</h4><small>' + tr('10 000 credits · a car, a bicycle and a scooter parked at each home (hover vehicles on alien worlds) · phone · snacks and drinks · the outfit you chose', '10 000 créditos · un coche, una bici y una moto en cada casa (vehículos flotantes en mundos alienígenas) · teléfono · snacks y bebidas · la ropa que elegiste') + '</small><br><label><input type="checkbox" id="lwTut" ' + (opt.tut ? 'checked' : '') + '> ' + tr('Show optional tutorial missions (Pip in Ape Town)', 'Mostrar misiones de tutorial opcionales (Pip en Ape Town)') + '</label>' }
  return '' }
function cost() { if (free() || mode === 'closet') return { total: 0, items: [] }; const items = [];
  if (mode === 'barber') { for (const k of ['style', 'hair', 'beard', 'beardCol', 'eye']) if (JSON.stringify(me[k]) !== JSON.stringify(orig[k])) items.push([k, BARBER[k]]) }
  else for (const s of Object.keys(SLOT)) { const id = me[s]; if (id && !owns(s, id)) items.push([s + ':' + id, price(s, id)]) }
  return { total: items.reduce((a, i) => a + i[1], 0), items } }
const TITLE = { new: L('Who are you?', '¿Quién eres?'), barber: L('💈 Barber & hairdresser', '💈 Barbería y peluquería'), boutique: L('👗 Boutique', '👗 Boutique'), closet: L('🚪 Your wardrobe', '🚪 Tu armario') };
function render() { const tabs = TABS[mode]; if (!tabs.includes(tab)) tab = tabs[0]; const c = cost(), money = AV.S && AV.S.money;
  ov.innerHTML = '<div class="wrap"><div class="pv"><h2>' + esc(say(TITLE[mode])) + '</h2><canvas width="360" height="520"></canvas><div class="pvb"><button data-zoom="out">－</button><button data-zoom="in">＋</button><button data-frame="full" class="' + (frameFace ? '' : 'on') + '">' + tr('Full body', 'Cuerpo entero') + '</button><button data-frame="face" class="' + (frameFace ? 'on' : '') + '">' + tr('Face', 'Cara') + '</button></div><p style="margin:4px 0"><b>' + esc(me.name || tr('(no name yet)', '(sin nombre)')) + '</b> <small style="opacity:.7">· ' + tr('drag to rotate', 'arrastra para girar') + '</small></p></div>' +
    '<div class="side"><div class="tabs">' + tabs.map(t => '<button data-tab="' + t + '" class="' + (t === tab ? 'on' : '') + '">' + esc(say(TABN[t])) + '</button>').join('') + '</div>' + tabs.map(t => '<div class="pane ' + (t === tab ? 'on' : '') + '" data-pane="' + t + '">' + pane(t) + '</div>').join('') +
    '<div class="foot">' + (c.total ? '<span>' + tr('Total', 'Total') + ': <b>' + c.total + '¢</b> · ' + tr('you have', 'tienes') + ' ' + Math.floor(money) + '¢</span>' : '') + '<button class="go" id="lwGo">' + (mode === 'new' ? tr('Start my life in the Apeverse', 'Empezar mi vida en el Apeverse') : c.total ? tr('Pay & wear', 'Pagar y llevar') : tr('Wear this', 'Ponérmelo')) + '</button> <button id="lwCancel">' + tr('Back', 'Volver') + '</button> <small id="lwErr" style="color:#ff8a8a"></small></div></div></div>';
  const q = s => ov.querySelectorAll(s); const nm = ov.querySelector('#lwName'); if (nm) nm.oninput = e => { me.name = e.target.value.slice(0, 20); const b = ov.querySelector('.pv p b'); if (b) b.textContent = me.name || tr('(no name yet)', '(sin nombre)') };
  q('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; render() });
  q('[data-o]').forEach(b => b.onclick = () => { if (b.dataset.lock) { const e = ov.querySelector('#lwErr'); if (e) e.textContent = tr('You do not own that yet: visit a boutique or brand store.', 'Aún no lo tienes: visita una boutique o una tienda de marca.'); return } me[b.dataset.o] = b.dataset.v; if (b.dataset.o === 'body' && b.dataset.v === 'ape') tab = TABS[mode].includes(tab) ? tab : 'body'; render(); preview() });
  q('[data-sw]').forEach(b => b.onclick = () => { me[b.dataset.sw] = +b.dataset.v; render(); preview() }); q('[data-t]').forEach(b => b.onclick = () => { me[b.dataset.t] = !me[b.dataset.t]; render(); preview() });
  q('[data-same]').forEach(b => b.onclick = () => { if (b.dataset.same === 'bot') me.botCol = null; else me.beardCol = null; render(); preview() });
  q('[data-preset]').forEach(b => b.onclick = () => { const p = PRESETS.find(x => x[0] === b.dataset.preset)[2]; Object.assign(me, { hat: '', eyew: '', neck: '', ears: '', back: '', flower: 0 }, p); render(); preview() });
  q('[data-zoom]').forEach(b => b.onclick = () => { zoom = Math.max(.7, Math.min(2.4, zoom * (b.dataset.zoom === 'in' ? 1.2 : 1 / 1.2))) }); q('[data-frame]').forEach(b => b.onclick = () => { frameFace = b.dataset.frame === 'face'; render() });
  const hR = ov.querySelector('#lwH'); if (hR) { hR.oninput = e => { ov.querySelector('#lwHv').textContent = e.target.value + ' cm' }; hR.onchange = e => { me.height = +e.target.value; preview() } }
  q('[data-city]').forEach(b => b.onclick = () => { opt.city = b.dataset.city; render() });
  q('[data-h]').forEach(b => b.onclick = () => { const id = b.dataset.h, w = H.PROPS[id].w; if (opt.homes.includes(id)) opt.homes = opt.homes.filter(x => x !== id); else { opt.homes = opt.homes.filter(x => H.PROPS[x].w !== w); opt.homes.push(id); if (opt.homes.length > 2) opt.homes.shift() } render() });
  const tu = ov.querySelector('#lwTut'); if (tu) tu.onchange = e => { opt.tut = e.target.checked };
  ov.querySelector('#lwCancel').onclick = () => close(); ov.querySelector('#lwGo').onclick = () => finish();
  if (!pvCanvas) { pvCanvas = document.createElement('canvas'); pvCanvas.width = 360; pvCanvas.height = 520 } const ph = ov.querySelector('canvas'); if (ph && ph !== pvCanvas) ph.replaceWith(pvCanvas); if (!pv) preview() }
function close() { ov.style.display = 'none'; if (pv) { pv.on = false; try { pv.R.forceContextLoss(); pv.R.dispose() } catch (e) { } pv = null } pvCanvas = null; if (AV.running && document.pointerLockElement == null && AV.lockMouse) { } }
function open(m, md) { mode = md; me = norm(m); orig = JSON.parse(JSON.stringify(me)); tab = TABS[mode][0]; zoom = 1; frameFace = mode === 'barber'; ST.stats.opened++; ov.style.display = 'block'; try { document.exitPointerLock && document.exitPointerLock() } catch (e) { } render(); return ov }
/* the old 2.3 creator overlay stays for the wake-up chooser; the creator itself is this editor */
LW.creator = function (m, edit) { opt = { city: 'ape_town', homes: ['at_mushroom_studio', 'cm_nimman_condo'], tut: true }; return open(m || LW.defaultMe(), edit ? 'closet' : 'new') };
LW.creatorState = () => ({ me, opt, mode });
ST.open = (md, extra) => { if (!AV.S) return null; const m = Object.assign({}, AV.S.me || LW.defaultMe(), { name: AV.S.name || (AV.S.me || {}).name || '' }); return open(m, md || 'closet') };
function grantOwned(m) { const w = wardrobe(); for (const s of Object.keys(SLOT)) if (m[s]) w.own[s + ':' + m[s]] = 1 }
function syncMerch(m) { const MC = AV.merch; if (!MC) return; if (m.top && m.top.startsWith('m_')) { const g = m.top.endsWith('_hoodie') ? 'hoodie' : 'tee', d = m.top.slice(2, -(g.length + 1)); AV.S.wear = { design: d, garment: g, color: 'cream', size: (AV.S.wear || {}).size || 'M' } } else AV.S.wear = null; try { MC.refreshMirrors && MC.refreshMirrors() } catch (e) { } }
function finish() { const err = ov.querySelector('#lwErr');
  if (mode === 'new') { if (!me.name.trim()) { err.textContent = tr('Choose a name first (Body tab).', 'Elige un nombre primero (pestaña Cuerpo).'); tab = 'body'; return } if (opt.homes.length !== 2) { err.textContent = tr('Choose two starter homes (Home & start tab).', 'Elige dos casas iniciales (pestaña Casa e inicio).'); return }
    const m = Object.assign({}, me); close(); const keepS = LW.startNew; ST._pendingOwn = m; return LW.startNew(m, opt) }
  const c = cost(); if (c.total > (AV.S.money || 0)) { err.textContent = tr('Not enough credits.', 'No tienes suficientes créditos.'); return }
  if (c.total) { AV.S.money -= c.total; (AV.S.log = AV.S.log || []).unshift({ d: AV.S.day, t: mode === 'barber' ? 'Barber' : 'Boutique', a: -c.total }); if (mode === 'barber') ST.stats.barber++; else ST.stats.bought += c.items.length }
  if (mode === 'boutique' || mode === 'closet') grantOwned(me);
  AV.S.me = Object.assign({}, me); if (me.name && me.name.trim()) AV.S.name = me.name.trim(); syncMerch(me); AV.save(); AV.hud && AV.hud(); close();
  AV.toast((mode === 'barber' ? '💈 ' : '👕 ') + (c.total ? tr('Paid ', 'Pagado ') + c.total + '¢ · ' : '') + tr('Looking good!', '¡Te ves genial!')) }
/* the starter outfit becomes yours */
const sn0 = LW.startNew; LW.startNew = function (m, o) { const b0 = AV.boot.begin, own = {}; for (const s of Object.keys(SLOT)) if (m[s]) own[s + ':' + m[s]] = 1;
  AV.boot.begin = function (f) { AV.boot.begin = b0; f.lw = f.lw || {}; f.lw.wardrobe = { own }; return b0.apply(this, arguments) }; try { return sn0.apply(this, arguments) } finally { AV.boot.begin = b0 } };

/* ---------------- merch stores keep the avatar in sync ---------------- */
addEventListener('load', () => { const MC = AV.merch; if (MC && MC.equip) { const eq0 = MC.equip; MC.equip = function (id, g) { const r = eq0.apply(this, arguments); if (r && AV.S) { AV.S.me = Object.assign({}, AV.S.me || LW.defaultMe(), { top: 'm_' + id + '_' + g }); AV.save() } return r } }
  /* ApePhone 🪞 Me -> your wardrobe (rename + wear what you own) */
  const PH = AV.phone; if (PH && PH.APPS) { const a = PH.APPS.find(x => x.id === 'me'); if (a) a.go = () => { AV.closePanel('cmp'); ST.open('closet') } } });

/* ---------------- barbers + boutiques in every world ---------------- */
const tex = (txt, bg, fg) => AV.mkc ? AV.mkc(256, c => { c.fillStyle = bg; c.fillRect(0, 0, 256, 256); c.fillStyle = fg; c.font = 'bold 44px Georgia'; c.textAlign = 'center'; c.textBaseline = 'middle'; const w = txt.split('\n'); w.forEach((t, i) => c.fillText(t, 128, 128 + (i - (w.length - 1) / 2) * 52)) }) : null;
function kiosk(W, kind, x, z) { const g = new THREE.Group(); g.position.set(x, W.surface(x, z) || 0, z); const std = (c, r) => new THREE.MeshStandardMaterial({ color: c, roughness: r == null ? .6 : r });
  const box = (w, h, d, m, px, py, pz) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(px, py, pz); o.castShadow = true; g.add(o); return o };
  if (kind === 'barber') { const pole = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, 1.6, 16), new THREE.MeshStandardMaterial({ map: AV.mkc ? AV.mkc(64, c => { for (let i = 0; i < 8; i++) { c.fillStyle = ['#d83a3a', '#f4f4f4', '#2a5ad8', '#f4f4f4'][i % 4]; c.save(); c.translate(0, i * 16 - 32); c.transform(1, .5, 0, 1, 0, 0); c.fillRect(-20, 0, 120, 16); c.restore() } }) : null, roughness: .3 })); pole.position.set(-1.1, 1.2, 0); g.add(pole);
    box(.7, .5, .7, std(0x2a1a1a), 0, .45, 0); box(.7, .8, .12, std(0x2a1a1a), 0, .95, -.3); box(.12, 1.2, .6, std(0xc8c8d0, .2), 0, .6, .8).material.metalness = .6; box(1.6, 1.8, .06, std(0xe8f0ff, .05), 0, 1.3, -1.2) }
  else { box(1.8, .06, .06, std(0xb0b0b8, .3), 0, 1.6, 0); for (const sx of [-.85, .85]) box(.05, 1.6, .05, std(0xb0b0b8, .3), sx, .8, 0); const cs = [0xff4ad2, 0x2a6ad8, 0xffd23a, 0x1a1a1e, 0x3ad87a, 0xd83a3a, 0xf0ece4];
    cs.forEach((c, i) => box(.2, .7, .32, std(c, .9), -.7 + i * .23, 1.2, 0)); box(.7, 1.7, .05, std(0xd8e8ff, .05), 1.5, .95, -.3) }
  const sm = tex(kind === 'barber' ? 'BARBER\n💈' : 'BOUTIQUE\n👗', kind === 'barber' ? '#1a2a5a' : '#5a1a4a', '#ffd23a'); if (sm) { const s = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), new THREE.MeshBasicMaterial({ map: sm })); s.position.set(0, 2.5, .05); g.add(s); const s2 = s.clone(); s2.rotation.y = Math.PI; s2.position.z = -.05; g.add(s2) }
  W.group.add(g); AV.lin && AV.lin(g);
  W.T.push({ x, z, r: 2.2, lwStyle: kind, label: () => kind === 'barber' ? '💈 ' + tr('Barber & hairdresser: new cut, colour, beard', 'Barbería y peluquería: corte, color, barba') : '👗 ' + tr('Boutique: clothes, shoes, accessories, brand prints', 'Boutique: ropa, calzado, accesorios, estampados de marca'), fn: () => ST.open(kind) }) }
ST.kiosks = {};
const owe0 = AV.onWorldEnter; AV.onWorldEnter = function (W) { if (owe0) owe0(W); try { if (!W || !W.arrivals || !W.group) return; const ar = W.arrivals[W.defaultArrival] || W.arrivals.default || Object.values(W.arrivals)[0]; if (!ar) return;
    const yaw = ar.yaw || 0, fx = -Math.sin(yaw), fz = -Math.cos(yaw), rx = Math.cos(yaw), rz = -Math.sin(yaw), spots = [];
    for (const [k, side] of [['barber', -1], ['boutique', 1]]) { const p = AV.safeSpot(W, ar.x + fx * 7 + rx * side * 6, ar.z + fz * 7 + rz * side * 6); kiosk(W, k, p[0], p[1]); spots.push([k, p[0], p[1]]) } ST.kiosks[W.id] = spots } catch (e) { console.warn('style kiosks', e) } };
/* the home wardrobe opens the closet */
addEventListener('load', () => { const PN = AV.panel; if (!PN) return; AV.panel = function (id, html) { const p = PN.apply(this, arguments); try { if (id === 'cmp' && /data-w="/.test(html) && /🚪/.test(html) && p && !p.querySelector('#lwCloset')) { const b = document.createElement('button'); b.id = 'lwCloset'; b.textContent = '👕 ' + tr('Open my full wardrobe', 'Abrir todo mi armario'); b.onclick = () => { AV.closePanel('cmp'); ST.open('closet') }; p.insertBefore(b, p.firstChild.nextSibling) } } catch (e) { } return p } });
})(window.AV);
