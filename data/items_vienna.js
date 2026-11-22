/* APEVERSE V0.9.9 - data/items_vienna.js : Vienna 2000s food, drinks and nostalgic souvenirs (+ world pickups) and the Vienna playlist. */
window.AV = window.AV || {};
Object.assign(AV.ITEMS, {
  kaesekrainer: { n: ['Käsekrainer', 'Käsekrainer'], cat: 'food', ic: '🌭', use: 'eat', model: 'skewer', col: 0xc8743a, say: ['Cheese-filled sausage from the Würstel stand. 3 a.m. perfection.', 'Salchicha rellena de queso del Würstelstand. Perfección a las 3 de la mañana.'], price: 5 },
  happy_noodles: { n: ['Happy Noodles', 'Happy Noodles'], cat: 'food', ic: '🍜', use: 'eat', model: 'bowl', col: 0xe8a040, say: ['Spicy box noodles, eaten standing up. Classic.', 'Fideos picantes en caja, comidos de pie. Un clásico.'], price: 7 },
  sachertorte: { n: ['Sachertorte', 'Tarta Sacher'], cat: 'food', ic: '🍰', use: 'eat', model: 'bowl', col: 0x3a1a10, say: ['Chocolate, apricot, whipped cream. Very Viennese.', 'Chocolate, albaricoque y nata. Muy vienés.'], price: 6 },
  melange: { n: ['Wiener Melange', 'Melange vienés'], cat: 'drink', ic: '☕', use: 'drink', fx: { type: 'buzz', amt: .2 }, model: 'cup', col: 0xb08060, say: ['Coffee with milk foam, served with a glass of water and attitude.', 'Café con espuma de leche, con un vaso de agua y actitud.'], price: 4 },
  almdudler: { n: ['Almdudler', 'Almdudler'], cat: 'drink', ic: '🥤', use: 'drink', model: 'bottle', col: 0xe8c040, say: ['Herbal lemonade. Tastes like an Alpine meadow.', 'Limonada de hierbas. Sabe a prado alpino.'], price: 3 },
  spritzer: { n: ['Weißer Spritzer', 'Spritzer blanco'], cat: 'drink', ic: '🥂', use: 'drink', fx: { type: 'drink', amt: .22 }, model: 'bottle', col: 0xe8e0a0, say: ['Wine and soda on a terrace. Summer in a glass.', 'Vino con soda en una terraza. Verano en un vaso.'], price: 5 },
  gluehwein: { n: ['Glühwein', 'Glühwein (vino caliente)'], cat: 'drink', ic: '🍷', use: 'drink', fx: { type: 'drink', amt: .3 }, model: 'cup', col: 0x8a1a2a, say: ['Hot spiced wine. Your fingers thaw, your cheeks glow.', 'Vino caliente con especias. Se te descongelan los dedos.'], price: 5 },
  punsch: { n: ['Punsch', 'Ponche'], cat: 'drink', ic: '🍹', use: 'drink', fx: { type: 'drink', amt: .35 }, model: 'cup', col: 0xe8603a, say: ['Orange punch with a rum kick. The Christmas market spins a bit.', 'Ponche de naranja con ron. El mercadillo navideño gira un poco.'], price: 5 },
  waxys_pint: { n: ['Pint at Waxy’s', 'Pinta en Waxy’s'], cat: 'drink', ic: '🍺', use: 'drink', fx: { type: 'drink', amt: .35 }, model: 'bottle', col: 0x2a1a10, say: ['Cheap drinks, good vibes, someone singing Wonderwall.', 'Bebidas baratas, buen rollo y alguien cantando Wonderwall.'], price: 4 },
  shisha: { n: ['Shisha session (Dons)', 'Sesión de shisha (Dons)'], cat: 'smoke', ic: '💨', use: 'smoke', fx: { type: 'smoke', amt: .12 }, model: 'cup', col: 0x7a3ab8, say: ['Double apple, low cushions, long stories.', 'Doble manzana, cojines bajos e historias largas.'], price: 12 },
  flip_phone: { n: ['Flip phone (2004)', 'Móvil de tapa (2004)'], cat: 'souvenir', ic: '📱', use: 'look', keep: true, model: 'cube', col: 0xb8c0c8, say: ['3 missed calls, 1 SMS: “where r u?? flex 2nite”', '3 llamadas perdidas, 1 SMS: “¿dónde stás? flex sta noche”'], price: 0 },
  mp3_player: { n: ['MP3 player (128 MB)', 'Reproductor MP3 (128 MB)'], cat: 'souvenir', ic: '🎧', use: 'look', keep: true, model: 'cube', col: 0xe8e8f0, say: ['Exactly 31 songs. You know every one by heart.', 'Exactamente 31 canciones. Te sabes todas de memoria.'], price: 0 },
  burned_cd: { n: ['Burned mix CD', 'CD grabado'], cat: 'souvenir', ic: '💿', use: 'look', keep: true, model: 'cube', col: 0xd8d8e8, say: ['Marker on the label: “PARTY MIX 2006 — DO NOT LOSE”.', 'Rotulador en la etiqueta: “PARTY MIX 2006 — NO PERDER”.'], price: 0 }
});
/* V1.0 kit: River Bar menu additions (Jungle Dub) */
Object.assign(AV.ITEMS, {
  rum_cola: { n: ['Rum & cola', 'Ron con cola'], cat: 'drink', ic: '🥃', use: 'drink', fx: { type: 'drink', amt: .4 }, model: 'cup', col: 0x5a2a14, say: ['Dark rum, cola, lime, river breeze.', 'Ron oscuro, cola, lima y brisa del río.'], price: 30 },
  veggie_burger: { n: ['Jungle veggie burger', 'Hamburguesa vegetal de la jungla'], cat: 'food', ic: '🍔', use: 'eat', model: 'bowl', col: 0x8a5a2a, say: ['Black-bean patty, grilled plantain, hot sauce. Energy up.', 'Hamburguesa de frijol negro, plátano a la plancha y salsa picante. Energía arriba.'], price: 22 },
  dub_plate: { n: ['Dub plate (Bass Check)', 'Dub plate (Prueba de bajo)'], cat: 'souvenir', ic: '💿', use: 'look', keep: true, model: 'cube', col: 0x1a1a1a, say: ['A fresh one-off acetate from the Dub Lab. The gorilla bassist is waiting for it.', 'Un acetato único recién salido del Dub Lab. El gorila bajista lo está esperando.'], price: 0 }
});
AV.PICKUPS = AV.PICKUPS || {};
AV.PICKUPS.vienna = [['flip_phone', 4, 122], ['mp3_player', 160, -134], ['burned_cd', -60, -6], ['almdudler', 84, 40], ['melange', 2, -6]];
/* Vienna playlist: every ZtonedApe + Stone Ape Band track (memories of nights out) */
if (AV.MUSIC && AV.MUSIC.chiang_mai && AV.MUSIC.stone_ape_band) AV.MUSIC.vienna = { name: 'Vienna Memories', bpm: 92, shuffle: true, tracks: AV.MUSIC.chiang_mai.tracks.concat(AV.MUSIC.stone_ape_band.tracks) };
