/* APEVERSE 2.2 GLOBAL WORLDS - cadiz_plan.js : CÁDIZ's street network (agent 4).  Pure data + AV.gwkit.Net, no THREE.
   The old town is a peninsula: the Atlantic on the west and south, the bay on the north, the port on the east, the land walls and the
   Puerta de Tierra closing the neck.  Compressed (1 m ≈ 0.6 real m), x east, z south (north is -z):
     - a sea promenade rings the whole town: Campo del Sur (Atlantic, the cathedral's back), La Caleta beach between its two castles,
       Parque Genovés, the Alameda Apodaca along the bay, the port quay - you can walk all the way round
     - inside: the 18th-century grid (long narrow streets that end at the sea light) - Calle Ancha, Sacramento, Columela, San Francisco,
       Nueva - with its plazas (San Antonio, Mina, las Flores, the Mercado Central at Plaza de la Libertad, Fragela + Gran Teatro Falla)
     - the old quarters: El Pópulo (medieval arches, the Roman theatre) and La Viña (fishermen, taverns, the heart of Carnival)
     - Plaza de San Juan de Dios (Ayuntamiento) on the port; Plaza de la Catedral; Puerta de Tierra out to Plaza de la Constitución
     - a causeway out to the Castillo de San Sebastián, Santa Catalina's star fort at the north end of the beach
   Every street ends in another street, a plaza, the beach or a castle courtyard (marked).  AV.cadizPlan */
'use strict';
(function (root) {
const AV = root.AV = root.AV || {};
const L = (e, s) => [e, s];
const PLAN = AV.cadizPlan = {};
const B = PLAN.bounds = { x0: -360, x1: 320, z0: -240, z1: 230 };
/* the coast (land polygon); the neck runs off the east edge, closed by buildings behind Plaza de la Constitución */
PLAN.coast = [[-300, -110], [-230, -170], [-120, -205], [0, -215], [100, -205], [180, -170], [235, -110], [255, -20], [262, 60], [300, 80], [330, 80], [330, 250], [300, 205], [200, 178], [100, 150], [0, 140], [-100, 135], [-180, 105], [-215, 82], [-240, 76], [-270, 70], [-300, 58], [-326, 34], [-340, 2], [-342, -40], [-330, -80]];
PLAN.beach = [[-224, 70], [-236, 46], [-262, 40], [-300, 30], [-318, 8], [-326, -12], [-346, -12], [-346, 20], [-330, 46], [-302, 66], [-270, 80], [-238, 86]];   /* the land mask trims it at the waterline */   /* sand between the promenade and the sea */
const S = PLAN.streets = [
  /* --- the sea ring --- */
  ['campo_sur', 'promenade', 12, [[212, 146], [210, 158], [160, 150], [100, 137], [0, 127], [-100, 123], [-170, 95], [-206, 70]], L('Campo del Sur', 'Campo del Sur'), { sides: [1], car: true }],
  ['paseo_caleta', 'promenade', 9, [[-206, 70], [-232, 44], [-262, 37], [-300, 27], [-318, 6], [-320, -28]], L('Paseo de La Caleta', 'Paseo de La Caleta'), { sides: [1] }],
  ['alameda', 'promenade', 14, [[-206, -150], [-120, -190], [0, -200], [100, -190], [170, -158], [228, -105]], L('Alameda Apodaca', 'Alameda Apodaca'), { sides: [1], car: true }],
  ['muelle', 'avenue', 12, [[228, -105], [244, -20], [248, 62]], L('Avenida del Puerto', 'Avenida del Puerto'), { sides: [1], car: true }],
  ['cuesta_calesas', 'road', 10, [[248, 62], [258, 88], [266, 119]], L('Cuesta de las Calesas', 'Cuesta de las Calesas'), { car: true }],
  /* --- the grid: north-south (bay to Atlantic) --- */
  ['san_jose', 'street', 5.5, [[-140, -185], [-135, -120], [-128, -40], [-120, 40], [-114, 120]], L('Calle San José', 'Calle San José')],
  ['sacramento', 'street', 5.5, [[-62, -196], [-58, -120], [-55, -40], [-50, 40], [-46, 124]], L('Calle Sacramento', 'Calle Sacramento'), { shops: .55 }],
  ['columela', 'street', 6, [[0, -200], [3, -165], [6, -130], [6, -60], [4, 0], [-4, 24], [-6, 76], [0, 127]], L('Calle Columela', 'Calle Columela'), { shops: .85 }],
  ['san_francisco', 'street', 6, [[60, -195], [62, -120], [56, -12], [56, 18], [70, 56]], L('Calle San Francisco', 'Calle San Francisco'), { shops: .8 }],
  ['nueva', 'street', 6, [[120, -190], [125, -110], [135, -60], [150, -22], [182, -12]], L('Calle Nueva', 'Calle Nueva'), { shops: .6 }],
  /* --- the grid: east-west --- */
  ['ancha', 'street', 7, [[-55, -100], [0, -95], [60, -90], [125, -86], [170, -80], [236, -72]], L('Calle Ancha', 'Calle Ancha'), { shops: .85 }],
  ['rosario_w', 'lane', 5, [[-150, -148], [-100, -150], [-60, -150], [-20, -148]], L('Calle Rosario', 'Calle Rosario')],
  ['rosario_e', 'lane', 5, [[30, -148], [62, -150], [122, -150], [172, -146]], L('Calle Rosario', 'Calle Rosario')],
  ['sagasta', 'street', 5.5, [[-160, -55], [-128, -40], [-55, -40], [6, -40], [62, -35], [135, -55]], L('Calle Sagasta', 'Calle Sagasta'), { shops: .5 }],
  ['libertad_w', 'lane', 5, [[-160, 10], [-120, 12], [-50, 18], [-6, 24]], L('Calle Hospital de Mujeres', 'Calle Hospital de Mujeres')],
  ['libertad_e', 'lane', 5, [[45, 30], [56, 18]], L('Calle Libertad', 'Calle Libertad')],
  ['meson', 'lane', 5, [[-120, 76], [-48, 80], [-6, 76], [60, 80]], L('Calle Mesón Nuevo', 'Calle Mesón Nuevo')],
  ['tavira', 'alley', 4, [[34, -88], [36, -62], [34, -37]], L('Calle Marqués del Real Tesoro', 'Calle Marqués del Real Tesoro')],
  ['plaza_west', 'lane', 5, [[-130, -100], [-100, -100]], L('Calle Veedor', 'Calle Veedor')],
  /* --- La Viña: the fishermen's quarter (Carnival's heart) --- */
  ['virgen_palma', 'street', 8, [[-206, 70], [-182, 40], [-160, 10], [-130, -12], [-128, -40]], L('Calle Virgen de la Palma', 'Calle Virgen de la Palma'), { shops: .7 }],
  ['concepcion', 'alley', 4, [[-197, 60], [-150, 68], [-118, 78]], L('Calle Concepción Arenal', 'Calle Concepción Arenal')],
  ['lazaro_dou', 'alley', 3.6, [[-176, 28], [-140, 32], [-121, 42]], L('Calle Lázaro Dou', 'Calle Lázaro Dou')],
  ['callejon_viña', 'alley', 3.2, [[-150, 68], [-152, 50], [-140, 32]], L('Callejón de los Piratas', 'Callejón de los Piratas')],
  ['callejon_negro', 'alley', 3, [[-176, 28], [-190, 16]], L('Callejón del Tinte', 'Callejón del Tinte'), { cul: 'end' }],   /* ends at a patio door */
  /* --- El Pópulo --- */
  ['populo_arco', 'alley', 4, [[192, 8], [178, 32], [160, 48], [130, 52]], L('Arco del Pópulo · Calle Pópulo', 'Arco del Pópulo · Calle Pópulo')],
  ['populo_rosa', 'alley', 3.6, [[178, 32], [182, 55], [172, 100], [166, 148]], L('Arco de la Rosa · Calle Rosa', 'Arco de la Rosa · Calle Rosa')],
  ['mesón_populo', 'alley', 3.4, [[160, 48], [150, 76], [130, 97]], L('Calle Mesón', 'Calle Mesón')],
  ['pelota', 'street', 6, [[228, 8], [242, 58], [240, 100], [224, 108], [218, 114]], L('Calle Pelota · Plocia', 'Calle Pelota · Plocia'), { car: true }],
  ['catedral_w', 'lane', 5, [[59, 90], [50, 132]], L('Calle Obispo José María Rancés', 'Calle Obispo José María Rancés')],
  ['catedral_e', 'lane', 5, [[128, 94], [132, 140]], L('Calle Arco de los Blancos', 'Calle Arco de los Blancos')],
  /* --- west: Genovés, Caleta, the castles --- */
  ['avenida_genoves', 'street', 7, [[-262, 37], [-256, -10], [-246, -60]], L('Avenida Duque de Nájera', 'Avenida Duque de Nájera'), { car: true }],
  ['genoves_fort', 'lane', 5, [[-258, -80], [-286, -72]], L('Paseo de Santa Catalina', 'Paseo de Santa Catalina')],
  ['falla', 'street', 6, [[-200, -50], [-182, -60]], L('Plaza Fragela', 'Plaza Fragela'), { front: false }]
];
const R = (x0, x1, z0, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
PLAN.plazas = [
  ['san_juan_dios', R(180, 240, -42, 10), L('Plaza de San Juan de Dios', 'Plaza de San Juan de Dios'), { car: true }],
  ['catedral', R(60, 130, 50, 94), L('Plaza de la Catedral', 'Plaza de la Catedral')],
  ['san_antonio', R(-100, -55, -120, -80), L('Plaza de San Antonio', 'Plaza de San Antonio')],
  ['mina', R(-20, 30, -165, -130), L('Plaza de Mina', 'Plaza de Mina')],
  ['flores', R(36, 70, -12, 16), L('Plaza de las Flores', 'Plaza de las Flores')],
  ['mercado', R(-6, 45, 24, 76), L('Mercado Central (Plaza de la Libertad)', 'Mercado Central (Plaza de la Libertad)'), { front: false, market: true }],
  ['fragela', R(-182, -150, -70, -40), L('Plaza Fragela (Gran Teatro Falla)', 'Plaza Fragela (Gran Teatro Falla)')],
  ['puerta_tierra_in', R(195, 225, 115, 150), L('Plaza de la Puerta de Tierra', 'Plaza de la Puerta de Tierra')],
  ['constitucion', { c: [268, 133], r: 14 }, L('Plaza de la Constitución', 'Plaza de la Constitución'), { car: true }],
  ['tavira_plaza', { c: [36, -62], r: 6 }, L('Plazuela de la Torre Tavira', 'Plazuela de la Torre Tavira')],
  ['viña_plaza', { c: [-160, 50], r: 8 }, L('Plaza de la Viña', 'Plaza de la Viña')]
];
/* quays: from each sea promenade out past the waterline (the coast trims them) - no slivers of building land between the walk and the sea */
const quay = (id, dx, dz) => { const s = S.find(x => x[0] === id), pts = s[3]; return pts.concat(pts.slice().reverse().map(p => [p[0] + dx, p[1] + dz])) };
PLAN.opens = [['quay_campo', quay('campo_sur', 0, 24), L('Campo del Sur seawall', 'Muralla del Campo del Sur'), { pave: true }], ['quay_alameda', quay('alameda', 0, -24), L('Alameda seawall', 'Muralla de la Alameda'), { pave: true }], ['quay_muelle', quay('muelle', 24, 0), L('Port quay', 'Muelle'), { pave: true }], ['genoves', R(-260, -150, -150, -60), L('Parque Genovés', 'Parque Genovés')], ['caleta', PLAN.beach, L('Playa de La Caleta', 'Playa de La Caleta'), { sand: true }]];
PLAN.solids = [
  ['catedral_nueva', R(60, 122, 94, 124), L('Catedral de Cádiz', 'Catedral de Cádiz')],
  ['ayuntamiento', R(182, 230, -62, -42), L('Ayuntamiento', 'Ayuntamiento')],
  ['teatro_romano', R(190, 225, 55, 100), L('Teatro Romano', 'Teatro Romano')],
  ['gran_teatro_falla', R(-215, -182, -70, -35), L('Gran Teatro Falla', 'Gran Teatro Falla')],
  ['murallas', R(225, 240, 112, 186), L('Puerta de Tierra (land walls)', 'Puerta de Tierra (murallas)')],
  ['santa_catalina', [[-332, -92], [-300, -100], [-284, -78], [-290, -50], [-320, -44], [-338, -64]], L('Castillo de Santa Catalina', 'Castillo de Santa Catalina')],
  ['san_sebastian', { c: [-340, 74], r: 10 }, L('Castillo de San Sebastián', 'Castillo de San Sebastián')],
  ['balneario', R(-266, -236, 64, 84), L('Balneario de la Palma', 'Balneario de la Palma')],
  ['torre_tavira', R(20, 28, -68, -60), L('Torre Tavira', 'Torre Tavira')]
];
PLAN.carves = [
  ['puerta_tierra', R(222, 256, 128, 138)], ['catalina_patio', R(-322, -296, -84, -60)], ['catalina_puerta', R(-316, -306, -62, -24)], ['catalina_puerta_e', R(-298, -282, -76, -68)],
  ['sebastian_patio', [[-346, 68], [-336, 68], [-334, 78], [-346, 80]]], ['falla_portico', R(-186, -180, -62, -48)]
];
PLAN.bridges = [['causeway', [-284, 31], [-333, 70], 5, .5, L('Paseo Fernando Quiñones (causeway)', 'Paseo Fernando Quiñones (escollera)')]];
PLAN.arrival = { x: 200, z: -16, yaw: Math.PI * .5 };
PLAN.car = null;   /* car flags are set per street above */
PLAN.routes = [['San Juan de Dios', [210, -16], 'La Caleta', [-290, 50]], ['Catedral', [95, 70], 'Plaza de Mina', [5, -148]], ['Mercado Central', [20, 50], 'La Viña', [-160, 50]],
  ['Puerta de Tierra', [268, 133], 'Gran Teatro Falla', [-166, -55]], ['Plaza de las Flores', [52, 2], 'Alameda Apodaca', [0, -200]], ['El Pópulo', [178, 32], 'Campo del Sur', [-100, 123]],
  ['San Antonio', [-78, -100], 'Castillo de San Sebastián', [-340, 74]], ['Parque Genovés', [-205, -105], 'Torre Tavira', [32, -60]]];
PLAN.net = function () { const GW = AV.gwkit, N = GW.Net(Object.assign({ cell: .5 }, B));
  N.land('peninsula', PLAN.coast);
  for (const [id, kind, w, pts, name, ex] of S) N.street(id, pts, w, Object.assign({ kind, name }, ex || {}));
  for (const [id, sh, name, ex] of PLAN.plazas) { if (sh.c) N.circle(id, sh.c[0], sh.c[1], sh.r, Object.assign({ name }, ex || {})); else N.plaza(id, sh, Object.assign({ name }, ex || {})) }
  for (const [id, poly, name, ex] of PLAN.opens) N.open(id, poly, Object.assign({ name, step: 10 }, ex || {}));
  for (const [id, sh, name] of PLAN.solids) N.solid(id, sh.c ? GW.circPoly(sh.c[0], sh.c[1], sh.r, 24) : sh, { name });
  for (const [id, a, b, w, rise, name] of PLAN.bridges) N.bridge(id, a, b, w, rise, { name });
  N.build(); for (const [, poly] of PLAN.carves) N.carve(poly); return N };
})(typeof window !== 'undefined' ? window : globalThis);
