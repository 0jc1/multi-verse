/* APEVERSE - data/items_nimbus.js : Nimbus Sky City café menu, a souvenir, and the world pickups. */
window.AV = window.AV || {};
Object.assign(AV.ITEMS, {
  cloud_latte: { n: ['Cloud latte', 'Café nube'], cat: 'drink', ic: '☁️', use: 'drink', fx: { type: 'buzz', amt: .3 }, model: 'cup', col: 0xf4efe8, say: ['Oat milk foam whipped so light it floats off the cup.', 'Espuma de avena tan ligera que se escapa flotando de la taza.'], price: 4 },
  stratus_sorbet: { n: ['Stratus sorbet', 'Sorbete estrato'], cat: 'food', ic: '🍧', use: 'eat', fx: { type: 'buzz', amt: .12 }, model: 'bowl', col: 0xbfe4ff, say: ['Blueberry and yuzu, served at exactly cloud temperature.', 'Arándano y yuzu, servido a la temperatura exacta de una nube.'], price: 3 },
  thunder_tonic: { n: ['Thunder tonic', 'Tónica trueno'], cat: 'drink', ic: '⚡', use: 'drink', fx: { type: 'buzz', amt: .5 }, model: 'bottle', col: 0x7a8aff, say: ['Fizzy ginger and lightning. Your hair stands up a little.', 'Jengibre con gas y relámpago. Se te eriza un poco el pelo.'], price: 5 },
  cloud_jar: { n: ['Cloud in a jar', 'Nube en un frasco'], cat: 'souvenir', ic: '🫙', use: 'look', keep: true, model: 'bottle', col: 0xeaf6ff, say: ['A tiny cumulus swirls inside. The label says: “Do not open indoors.”', 'Un cúmulo diminuto gira dentro. La etiqueta dice: “No abrir en interiores.”'], price: 0 }
});
AV.PICKUPS = AV.PICKUPS || {};
AV.PICKUPS.nimbus = [['cloud_jar', 17, -51], ['stratus_sorbet', -22, 42]];
