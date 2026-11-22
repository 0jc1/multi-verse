/* APEVERSE - data/items_jerusalem.js : food, drinks and souvenirs of Jerusalem and the Judean Desert (+ world pickups).
   Same format as data/items.js. */
window.AV = window.AV || {};
Object.assign(AV.ITEMS, {
  /* street food */
  falafel: { n: ['Falafel in pita', 'Falafel en pita'], cat: 'food', ic: '🧆', use: 'eat', model: 'skewer', col: 0x8a5a2a, say: ['Crunchy chickpea balls, tahini, pickles, salad. Hot sauce drips onto your wrist.', 'Bolitas de garbanzo crujientes, tahini, encurtidos y ensalada. La salsa picante te cae por la muñeca.'], price: 12 },
  hummus: { n: ['Hummus plate', 'Plato de hummus'], cat: 'food', ic: '🥙', use: 'eat', model: 'bowl', col: 0xe8d4a0, say: ['Warm hummus, olive oil, whole chickpeas, a pile of pita. You wipe the plate clean.', 'Hummus caliente, aceite de oliva, garbanzos y una montaña de pita. Dejas el plato limpio.'], price: 15 },
  shakshuka: { n: ['Shakshuka', 'Shakshuka'], cat: 'food', ic: '🍳', use: 'eat', model: 'bowl', col: 0xd8402a, say: ['Eggs poached in spicy tomato and pepper. Bread for dipping, obviously.', 'Huevos en salsa picante de tomate y pimiento. Pan para mojar, por supuesto.'], price: 18 },
  kaak: { n: ['Sesame ka’ak bread', 'Pan ka’ak de sésamo'], cat: 'food', ic: '🥯', use: 'eat', model: 'sack', col: 0xd8a050, say: ['A long ring of sesame bread with a twist of za’atar. Still warm from the cart.', 'Un aro largo de pan de sésamo con za’atar. Aún caliente del carrito.'], price: 6 },
  rugelach: { n: ['Chocolate rugelach', 'Rugelach de chocolate'], cat: 'food', ic: '🥐', use: 'eat', fx: { type: 'buzz', amt: .2 }, model: 'sack', col: 0x6a3a1a, say: ['Sticky, chocolatey, still warm. One is never enough.', 'Pegajoso, de chocolate y aún caliente. Uno nunca es suficiente.'], price: 10 },
  halva: { n: ['Pistachio halva', 'Halva de pistacho'], cat: 'food', ic: '🟫', use: 'eat', fx: { type: 'buzz', amt: .15 }, model: 'cube', col: 0xd8c8a0, say: ['Sesame halva that crumbles like sweet sand.', 'Halva de sésamo que se deshace como arena dulce.'], price: 8 },
  dates: { n: ['Medjool dates', 'Dátiles Medjool'], cat: 'food', ic: '🌴', use: 'eat', fx: { type: 'buzz', amt: .15 }, model: 'bowl', col: 0x6a3a1a, say: ['Soft, caramel-sweet dates from the oasis.', 'Dátiles blandos y dulces como el caramelo, del oasis.'], price: 8 },
  /* drinks */
  pomegranate: { n: ['Fresh pomegranate juice', 'Zumo de granada'], cat: 'drink', ic: '🧃', use: 'drink', fx: { type: 'buzz', amt: .2 }, model: 'cup', col: 0xa81a3a, say: ['Squeezed in front of you, deep red and tart.', 'Exprimido delante de ti, rojo intenso y ácido.'], price: 10 },
  mint_tea: { n: ['Sweet mint tea', 'Té dulce de menta'], cat: 'drink', ic: '🍵', use: 'drink', fx: { type: 'sober', amt: .2 }, model: 'cup', col: 0x7aa84a, say: ['A glass of hot tea with a fistful of fresh mint.', 'Un vaso de té caliente con un puñado de menta fresca.'], price: 5 },
  cardamom_coffee: { n: ['Cardamom coffee', 'Café con cardamomo'], cat: 'drink', ic: '☕', use: 'drink', fx: { type: 'buzz', amt: .4 }, model: 'cup', col: 0x3a2012, say: ['Thick black coffee with cardamom, in a tiny cup. Your heart says thank you. Loudly.', 'Café negro espeso con cardamomo, en una taza diminuta. Tu corazón da las gracias. En voz alta.'], price: 6 },
  sage_tea: { n: ['Bedouin sage tea', 'Té beduino de salvia'], cat: 'drink', ic: '🫖', use: 'drink', fx: { type: 'sober', amt: .3 }, model: 'cup', col: 0x9a6a2a, say: ['Brewed over the fire with desert sage. Hospitality in a glass.', 'Hecho al fuego con salvia del desierto. Hospitalidad en un vaso.'], price: 0 },
  /* souvenirs */
  armenian_tile: { n: ['Armenian ceramic tile', 'Azulejo armenio'], cat: 'souvenir', ic: '🏺', use: 'look', keep: true, model: 'card', col: 0x2a6ac8, say: ['Hand-painted cobalt, turquoise and red: a pomegranate tree.', 'Pintado a mano en cobalto, turquesa y rojo: un granado.'], price: 45 },
  olive_camel: { n: ['Olive-wood camel', 'Camello de madera de olivo'], cat: 'souvenir', ic: '🐪', use: 'look', keep: true, model: 'cube', col: 0xa87a4a, say: ['Carved from olive wood. It smells faintly of the tree.', 'Tallado en madera de olivo. Aún huele un poco al árbol.'], price: 30 },
  jlm_postcard: { n: ['Jerusalem postcard', 'Postal de Jerusalén'], cat: 'souvenir', ic: '🖼️', use: 'look', keep: true, model: 'card', col: 0xe8c040, say: ['The Old City at sunset, every stone glowing gold.', 'La Ciudad Vieja al atardecer, cada piedra brillando dorada.'], price: 3 },
  dead_sea_mud: { n: ['Dead Sea mud', 'Barro del Mar Muerto'], cat: 'souvenir', ic: '🟤', use: 'wear', model: 'sack', col: 0x3a2e24, say: ['You smear on the black mineral mud. Your skin feels brand new. You look like a statue.', 'Te untas el barro negro mineral. La piel se siente como nueva. Pareces una estatua.'], price: 25 },
  salt_crystal: { n: ['Dead Sea salt crystal', 'Cristal de sal del Mar Muerto'], cat: 'souvenir', ic: '🧂', use: 'look', keep: true, model: 'crystal', col: 0xf4f0ea, say: ['A white salt crystal grown on the shore, 430 metres below sea level.', 'Un cristal blanco de sal crecido en la orilla, a 430 metros bajo el nivel del mar.'], price: 0 },
  /* quest item */
  briefcase: { n: ['Yossi’s briefcase', 'Maletín de Yossi'], cat: 'souvenir', ic: '💼', use: 'look', keep: true, model: 'sack', col: 0x3a2416, say: ['Heavy. A sticker on it says “PITCH DAY — DO NOT LOSE”.', 'Pesa. Una pegatina dice “DÍA DEL PITCH — NO PERDER”.'], price: 0 }
});
AV.PICKUPS = AV.PICKUPS || {};
AV.PICKUPS.jerusalem = [['jlm_postcard', -92, -16], ['pomegranate', -226, -96], ['water', -150, -40], ['kaak', 8, -82]];
AV.PICKUPS.judean_desert = [['salt_crystal', 132, 30], ['salt_crystal', 128, -60], ['dates', 34, 96], ['water', 52, 84], ['water', 98, 4], ['water', -40, -58]];
