/* APEVERSE V0.9.5 - data/items.js : backpack item registry + world pickups.
   Item: { n:[en,es], cat, ic, use:'eat'|'drink'|'smoke'|'play'|'wear'|'alien'|'look', fx:{type,amt}?, keep:true (not consumed),
           needs:'herb' (consumes another item), model, col, say:[en,es] (flavour when used), price }
   fx types: drink (alcohol), smoke (cannabis), psy (psychedelic), buzz (caffeine / sugar), glow (gentle alien calm).
   Storage stays in the save as AV.S.items {id: count} (same as before), so old saves and missions keep working. */
'use strict';
window.AV = window.AV || {};
AV.ITEMS = {
  /* drinks */
  water: { n: ['Bottle of water', 'Botella de agua'], cat: 'drink', ic: '💧', use: 'drink', fx: { type: 'sober', amt: .35 }, model: 'bottle', col: 0x9ad8ff, say: ['Cold water. Your head clears a little.', 'Agua fría. Se te despeja un poco la cabeza.'], price: 10 },
  beer: { n: ['Cold beer', 'Cerveza fría'], cat: 'drink', ic: '🍺', use: 'drink', fx: { type: 'drink', amt: .35 }, model: 'bottle', col: 0x2a7a3a, say: ['Crisp, cold, dangerously easy. Chok dee!', 'Fresca, fría y peligrosamente fácil. ¡Chok dee!'], price: 40 },
  bissap: { n: ['Bissap (hibiscus drink)', 'Bissap (bebida de hibisco)'], cat: 'drink', ic: '🌺', use: 'drink', fx: { type: 'buzz', amt: .25 }, model: 'bottle', col: 0xa0305a, say: ['Hibiscus, ginger and a little mischief.', 'Hibisco, jengibre y un poco de picardía.'], price: 6 },
  thai_tea: { n: ['Thai iced tea', 'Té tailandés helado'], cat: 'drink', ic: '🧋', use: 'drink', fx: { type: 'buzz', amt: .45 }, model: 'cup', col: 0xe8903a, say: ['Sweet, orange, and very awake.', 'Dulce, naranja y muy despierto.'], price: 15 },
  pineapple_shake: { n: ['Pineapple shake', 'Batido de piña'], cat: 'drink', ic: '🍍', use: 'drink', fx: { type: 'buzz', amt: .2 }, model: 'cup', col: 0xffd23a, say: ['Served in a pineapple. Of course it is.', 'Servido en una piña. Cómo no.'], price: 15 },
  coconut: { n: ['Fresh coconut', 'Coco fresco'], cat: 'drink', ic: '🥥', use: 'drink', fx: { type: 'sober', amt: .2 }, model: 'coconut', col: 0x6a4a2a, say: ['Sweet coconut water. Tropical reset.', 'Agua de coco dulce. Reinicio tropical.'], price: 20 },
  mocha: { n: ['Mushroom Mocha', 'Moca de Seta'], cat: 'drink', ic: '☕', use: 'drink', fx: { type: 'psy', amt: .2 }, model: 'cup', col: 0x6a3a1a, say: ['Tastes like a forest that believes in you.', 'Sabe a un bosque que cree en ti.'], price: 12 },
  /* food */
  mango: { n: ['Mango sticky rice', 'Mango con arroz glutinoso'], cat: 'food', ic: '🥭', use: 'eat', fx: { type: 'buzz', amt: .15 }, model: 'bowl', col: 0xffc83a, say: ['Sweet mango, warm coconut rice. Bliss.', 'Mango dulce, arroz caliente con coco. Gloria.'], price: 25 },
  khao_soi: { n: ['Khao soi', 'Khao soi'], cat: 'food', ic: '🍜', use: 'eat', model: 'bowl', col: 0xe8a030, say: ['Golden curry, crunchy noodles, lime. Chiang Mai in a bowl.', 'Curry dorado, fideos crujientes, lima. Chiang Mai en un bol.'], price: 30 },
  smoothie: { n: ['Smoothie bowl', 'Bol de smoothie'], cat: 'food', ic: '🫐', use: 'eat', fx: { type: 'buzz', amt: .15 }, model: 'bowl', col: 0x8a3ab8, say: ['Açaí, mango, dragon fruit. You feel 4% healthier.', 'Açaí, mango, pitahaya. Te sientes un 4% más sano.'], price: 35 },
  sai_ua: { n: ['Sai ua sausage', 'Salchicha sai ua'], cat: 'food', ic: '🌭', use: 'eat', model: 'skewer', col: 0xa0402a, say: ['Herby, spicy, northern. Delicious.', 'Herbal, picante, del norte. Deliciosa.'], price: 20 },
  snack: { n: ['Snacks', 'Snacks'], cat: 'food', ic: '🍪', use: 'eat', model: 'sack', col: 0xe8303a, say: ['Crunchy and cold. Perfect.', 'Crujiente y frío. Perfecto.'], price: 20 },
  crisps: { n: ['Mushroom crisps', 'Chips de seta'], cat: 'food', ic: '🍄', use: 'eat', model: 'sack', col: 0xc87a3a, say: ['Crunchy, earthy, suspiciously moreish.', 'Crujientes, terrosas y sospechosamente adictivas.'], price: 4 },
  alien_jelly: { n: ['Alien jelly cube', 'Cubo de gelatina alienígena'], cat: 'food', ic: '🟪', use: 'eat', fx: { type: 'glow', amt: .5 }, model: 'cube', col: 0xb07aff, say: ['It wobbles in your mouth. Then it hums.', 'Tiembla en tu boca. Luego zumba.'], price: 18 },
  /* smoking */
  pre: { n: ['Pre-rolled joint (adults only)', 'Porro liado (solo adultos)'], cat: 'smoke', ic: '🌿', use: 'smoke', fx: { type: 'smoke', amt: .55 }, model: 'joint', col: 0xf4f0e4, say: ['A slow drag. The colours get softer and the music gets closer.', 'Una calada lenta. Los colores se suavizan y la música se acerca.'], price: 60 },
  herb: { n: ['Herb pouch (adults only)', 'Bolsita de hierba (solo adultos)'], cat: 'smoke', ic: '🍃', use: 'look', model: 'sack', col: 0x3a8a3a, say: ['For your pipe. Load the pipe to use it.', 'Para tu pipa. Carga la pipa para usarla.'], price: 30 },
  pipe: { n: ['Glass pipe', 'Pipa de cristal'], cat: 'smoke', ic: '🪈', use: 'smoke', keep: true, needs: 'herb', fx: { type: 'smoke', amt: .45 }, model: 'pipe', col: 0x7ad8ff, say: ['Bubbling glass, a cloud, a grin.', 'Cristal burbujeante, una nube, una sonrisa.'], price: 50 },
  /* psychedelic / alien */
  magic_mushroom: { n: ['Glowing mushroom', 'Seta brillante'], cat: 'alien', ic: '🍄', use: 'eat', fx: { type: 'psy', amt: .8 }, model: 'mushroom', col: 0xff4ad2, say: ['The edges of the world start to breathe…', 'Los bordes del mundo empiezan a respirar…'], price: 0 },
  space_crystal: { n: ['Singing space crystal', 'Cristal espacial cantor'], cat: 'alien', ic: '💎', use: 'alien', keep: true, fx: { type: 'psy', amt: .35 }, model: 'crystal', col: 0x7ff0ff, say: ['You hold it to your ear. It sings a chord in colours.', 'Te lo acercas al oído. Canta un acorde en colores.'], price: 0 },
  glow_moss: { n: ['Verdalux glow-moss', 'Musgo brillante de Verdalux'], cat: 'alien', ic: '🟢', use: 'alien', fx: { type: 'glow', amt: .6 }, model: 'moss', col: 0x7aff9a, say: ['You breathe in moss-light. Calm, green, slow.', 'Respiras luz de musgo. Calma, verde, lenta.'], price: 0 },
  zero_g_marble: { n: ['Zero-G marble', 'Canica de gravedad cero'], cat: 'alien', ic: '🔮', use: 'look', keep: true, model: 'marble', col: 0xff4ad2, say: ['It floats a centimetre above your palm. Forever.', 'Flota un centímetro sobre tu palma. Para siempre.'], price: 0 },
  /* instruments */
  ukulele: { n: ['Ukulele', 'Ukelele'], cat: 'instrument', ic: '🎸', use: 'play', keep: true, model: 'ukulele', col: 0xc8803a, notes: [392, 523, 659, 784, 659, 523], say: ['Four strings, zero problems.', 'Cuatro cuerdas, cero problemas.'], price: 150 },
  bamboo_flute: { n: ['Bamboo flute', 'Flauta de bambú'], cat: 'instrument', ic: '🎋', use: 'play', keep: true, model: 'flute', col: 0x9ab84a, notes: [587, 659, 784, 880, 784, 659, 587], say: ['A breathy little melody drifts into the trees.', 'Una melodía suave se pierde entre los árboles.'], price: 40 },
  bongo: { n: ['Bongo drum', 'Bongó'], cat: 'instrument', ic: '🥁', use: 'play', keep: true, model: 'drum', col: 0xc83a2a, notes: [110, 160, 110, 110, 160, 220], say: ['Boom, ka-boom. The one-drop lives in your hands.', 'Bum, ka-bum. El one-drop vive en tus manos.'], price: 80 },
  /* souvenirs */
  tee: { n: ['Giant Hostel tee', 'Camiseta del Giant Hostel'], cat: 'souvenir', ic: '👕', use: 'wear', keep: true, model: 'shirt', col: 0x16161a, say: ['You are now 30% more Giant.', 'Ahora eres un 30% más Giant.'], price: 120 },
  elephant_pants: { n: ['Elephant pants', 'Pantalones de elefantes'], cat: 'souvenir', ic: '🐘', use: 'wear', keep: true, model: 'shirt', col: 0x8a1a1e, say: ['Comfy, breezy, iconic. ZtonedApe approves.', 'Cómodos, frescos, icónicos. ZtonedApe aprueba.'], price: 60 },
  postcard: { n: ['Ape Town postcard', 'Postal de Ape Town'], cat: 'souvenir', ic: '🖼️', use: 'look', keep: true, model: 'card', col: 0xff8ad8, say: ['The lotus stage at sunset. “Wish you were here.”', 'El escenario de loto al atardecer. “Ojalá estuvieras aquí.”'], price: 3 },
  beads: { n: ['Glow beads', 'Cuentas brillantes'], cat: 'souvenir', ic: '📿', use: 'wear', keep: true, model: 'beads', col: 0x7ff0ff, say: ['They glow. That’s the whole point.', 'Brillan. Esa es la idea.'], price: 5 },
  dub_cassette: { n: ['Dub cassette', 'Casete de dub'], cat: 'souvenir', ic: '📼', use: 'look', keep: true, model: 'cassette', col: 0xe8c030, say: ['Handwritten label: “Dub Hype — Ztonedape”. Bongo signed it.', 'Etiqueta a mano: “Dub Hype — Ztonedape”. Bongo la firmó.'], price: 0 },
  flower_garland: { n: ['Jasmine garland', 'Guirnalda de jazmín'], cat: 'souvenir', ic: '💮', use: 'wear', keep: true, model: 'beads', col: 0xfff6e0, say: ['It smells like a temple morning.', 'Huele a mañana de templo.'], price: 0 }
};
/* world pickups: [itemId, x, z] — snapped to free ground when the world loads; each one respawns the next game day */
AV.PICKUPS = {
  ape_town: [['magic_mushroom', -76, -18], ['magic_mushroom', -86, 12], ['coconut', 30, 88], ['postcard', -6, 98], ['bamboo_flute', -58, 36]],
  jungle_dub: [['coconut', 9, 13], ['bamboo_flute', -15, 7], ['pipe', 17, -1], ['dub_cassette', 6, -1], ['magic_mushroom', -33, 34], ['bongo', -10, 1]],
  astro9: [['space_crystal', -30, 8], ['zero_g_marble', 6, -6], ['alien_jelly', 22, 16], ['alien_jelly', -14, 26]],
  verdalux: [['glow_moss', 6, 9], ['glow_moss', -8, 14], ['magic_mushroom', -12, -14]],
  chiang_mai: [['flower_garland', -74, 60], ['coconut', 251, -6], ['water', 2, 46], ['thai_tea', 126, -16], ['magic_mushroom', -84, -84]]
};
