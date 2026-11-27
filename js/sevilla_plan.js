/* APEVERSE 2.2 GLOBAL WORLDS - sevilla_plan.js : SEVILLA's street network (agent 4).  Pure data + AV.gwkit.Net, no THREE, so the
   network can be checked offline (tools/tests/gw_sevilla_net.cjs) before a single building exists.
   A compressed but geographically faithful centre (1 m = ~0.6 real m), x east, z south (north is -z):
     - the Guadalquivir runs north-south; Triana on the west bank, the Arenal + Centro + Santa Cruz on the east bank
     - Puente de Isabel II (the Triana bridge) and Puente de San Telmo cross it, so the city is one loop you can walk round
     - Centro: Plaza Nueva + the Ayuntamiento + Plaza de San Francisco, Calle Sierpes / Tetuán (shopping), Plaza del Salvador
     - the Cathedral + Giralda on the Avenida de la Constitución (Metrocentro tram), Plaza Virgen de los Reyes, Plaza del Triunfo
     - the Real Alcázar: Puerta del León, Patio del León, Patio de las Doncellas, the gardens; a back gate onto the Callejón del Agua
     - Santa Cruz: the old Jewish quarter, a real maze of lanes and little plazas (Doña Elvira, Venerables, Santa Cruz, Alfaro)
     - the Arenal: the Maestranza bullring, Hospital de la Caridad, Torre del Oro on the river promenade (Paseo de Cristóbal Colón)
     - Triana: Altozano, Mercado de Triana, San Jacinto, Pureza, Betis on the river, the potters' Calle Alfarería, a corral
     - Los Remedios: Plaza de Cuba, Calle Asunción to the Real de la Feria (the April Fair ground, open albero the rest of the year)
   Every street ends in another street, a plaza or open ground, except the marked callejones (intentional).  AV.sevillaPlan */
'use strict';
(function (root) {
const AV = root.AV = root.AV || {};
const L = (e, s) => [e, s];
const PLAN = AV.sevillaPlan = {};
const B = PLAN.bounds = { x0: -460, x1: 250, z0: -330, z1: 380 };
PLAN.river = { x0: -235, x1: -185 };
/* [id, kind, width, points, name, extra] */
const S = PLAN.streets = [
  /* --- east bank: the river promenade, the ring of main streets --- */
  ['paseo_colon', 'avenue', 14, [[-178, -300], [-178, -60], [-178, 120], [-178, 202]], L('Paseo de Cristóbal Colón', 'Paseo de Cristóbal Colón'), { sides: [-1] }],
  ['campana', 'road', 11, [[-178, -300], [-100, -302], [-8, -302], [80, -300], [230, -298]], L('Calle Alfonso XII · La Campana', 'Calle Alfonso XII · La Campana')],
  ['santa_maria_blanca', 'road', 9, [[230, -298], [232, -140], [230, 40], [236, 192]], L('Calle Santa María la Blanca', 'Calle Santa María la Blanca')],
  ['menendez_pelayo', 'road', 12, [[-16, 188], [100, 192], [236, 196]], L('Avenida de Menéndez Pelayo', 'Avenida de Menéndez Pelayo')],
  ['almirante_lobo', 'road', 12, [[-44, 182], [-120, 190], [-178, 198]], L('Calle Almirante Lobo', 'Calle Almirante Lobo')],
  ['ayuntamiento_sur', 'street', 6, [[-60, -134], [0, -134]], L('Plaza Nueva · Avenida', 'Plaza Nueva · Avenida'), { front: false }],
  ['avenida', 'avenue', 16, [[-30, -134], [-30, 175]], L('Avenida de la Constitución', 'Avenida de la Constitución')],
  /* --- Arenal --- */
  ['reyes_catolicos', 'road', 12, [[-178, -60], [-120, -70], [-82, -100], [-70, -132]], L('Calle Reyes Católicos', 'Calle Reyes Católicos')],
  ['adriano', 'street', 6, [[-95, -85], [-92, -20], [-90, 40], [-88, 108]], L('Calle Adriano', 'Calle Adriano')],
  ['iris', 'lane', 5, [[-178, -45], [-150, -46], [-110, -44], [-92, -44]], L('Calle Iris', 'Calle Iris')],
  ['antonia_diaz', 'lane', 5, [[-178, 46], [-130, 44], [-90, 42]], L('Calle Antonia Díaz', 'Calle Antonia Díaz')],
  ['temprado', 'street', 7, [[-178, 110], [-120, 108], [-38, 112]], L('Calle Temprado', 'Calle Temprado')],
  ['santo_tomas', 'street', 8, [[-162, 140], [-110, 138], [-38, 144]], L('Calle Santo Tomás', 'Calle Santo Tomás')],
  ['castelar', 'street', 6, [[-62, -130], [-60, -60], [-58, 0], [-60, 60], [-58, 110]], L('Calle Castelar', 'Calle Castelar')],
  ['garcia_vinuesa', 'street', 6, [[-38, -22], [-60, -22], [-92, -20]], L('Calle García de Vinuesa', 'Calle García de Vinuesa')],
  ['gamazo', 'lane', 5, [[-82, -100], [-60, -96], [-38, -96]], L('Calle Gamazo', 'Calle Gamazo')],
  ['zaragoza', 'street', 6, [[-95, -160], [-130, -158], [-178, -150]], L('Calle Zaragoza', 'Calle Zaragoza')],
  ['carlos_canal', 'lane', 5, [[-178, -240], [-120, -236], [-69, -238]], L('Calle Carlos Cañal', 'Calle Carlos Cañal')],
  /* --- Centro: shopping streets, Salvador --- */
  ['tetuan', 'street', 7, [[-66, -185], [-64, -240], [-66, -302]], L('Calle Tetuán', 'Calle Tetuán'), { shops: .85, toldo: true }],
  ['sierpes', 'street', 6.5, [[4, -185], [0, -220], [-6, -260], [-8, -302]], L('Calle Sierpes', 'Calle Sierpes'), { shops: .9, toldo: true }],
  ['rioja', 'lane', 5, [[-64, -250], [-35, -252], [-5, -255]], L('Calle Rioja', 'Calle Rioja'), { shops: .6 }],
  ['jovellanos', 'lane', 4.5, [[-64, -212], [-30, -214], [1, -214]], L('Calle Jovellanos', 'Calle Jovellanos'), { shops: .5 }],
  ['cuna', 'street', 6, [[20, -185], [38, -220], [42, -260], [40, -302]], L('Calle Cuna', 'Calle Cuna'), { shops: .7 }],
  ['alvarez_quintero', 'lane', 5, [[62, -206], [62, -160], [64, -112]], L('Calle Álvarez Quintero', 'Calle Álvarez Quintero'), { shops: .6 }],
  ['francos', 'lane', 5, [[20, -160], [62, -160], [100, -152], [128, -116]], L('Calle Francos', 'Calle Francos'), { shops: .7 }],
  ['aguilas', 'lane', 5, [[96, -214], [140, -200], [180, -176], [226, -170]], L('Calle Águilas', 'Calle Águilas')],
  ['boteros', 'lane', 4.5, [[150, -298], [148, -240], [142, -204], [150, -160], [168, -128]], L('Calle Boteros', 'Calle Boteros')],
  ['alcaiceria', 'alley', 4, [[42, -280], [90, -282], [130, -276], [180, -280], [226, -276]], L('Calle Alcaicería', 'Calle Alcaicería'), { shops: .5 }],
  ['placentines', 'lane', 5, [[-22, -112], [20, -114], [44, -108]], L('Calle Placentines', 'Calle Placentines'), { shops: .5 }],
  ['conteros', 'alley', 4, [[0, -134], [4, -114], [2, -72]], L('Calle Conteros', 'Calle Conteros')],
  ['alemanes', 'street', 10, [[-22, -69], [30, -69], [38, -86], [44, -92]], L('Calle Alemanes', 'Calle Alemanes'), { shops: .7 }],
  ['mateos_gago', 'street', 7, [[96, -100], [130, -112], [170, -130], [228, -140]], L('Calle Mateos Gago', 'Calle Mateos Gago'), { shops: .7 }],
  /* --- Santa Cruz: the maze --- */
  ['callejon_agua', 'alley', 4.4, [[96, -60], [101, -20], [102.5, 30], [103, 90], [102.5, 140], [104, 186]], L('Callejón del Agua', 'Callejón del Agua'), { sides: [-1] }],
  ['ximenez', 'alley', 4.2, [[92, -66], [118, -58], [124, -32], [140, -6], [160, 20], [180, 34]], L('Calle Ximénez de Enciso', 'Calle Ximénez de Enciso'), { shops: .4 }],
  ['gloria', 'alley', 3.8, [[136, -42], [150, -50]], L('Calle Gloria', 'Calle Gloria')],
  ['jamerdana', 'alley', 3.6, [[160, -63], [166, -92], [170, -128]], L('Calle Jamerdana', 'Calle Jamerdana')],
  ['susona', 'alley', 3.6, [[122, -28], [116, 0], [112, 24], [104, 40]], L('Calle Susona', 'Calle Susona')],
  ['pimienta', 'alley', 3.4, [[112, 24], [130, 30], [150, 24], [160, 20]], L('Calle Pimienta', 'Calle Pimienta')],
  ['santa_teresa', 'alley', 4, [[164, -48], [176, -10], [186, 28]], L('Calle Santa Teresa', 'Calle Santa Teresa')],
  ['tres_cruces', 'alley', 4.2, [[176, -10], [204, -20], [226, -24]], L('Calle Mármoles · Tres Cruces', 'Calle Mármoles · Tres Cruces')],
  ['san_jose', 'lane', 5, [[200, 42], [226, 44]], L('Calle San José', 'Calle San José')],
  ['mezquita', 'alley', 3.6, [[186, 53], [176, 80], [160, 96]], L('Calle Mezquita', 'Calle Mezquita')],
  ['lope_rueda', 'alley', 3.6, [[148, 108], [126, 118], [105, 124]], L('Calle Lope de Rueda', 'Calle Lope de Rueda')],
  ['alfaro_murillo', 'alley', 4, [[156, 109], [162, 152]], L('Calle Agua · Murillo', 'Calle Agua · Murillo')],
  ['reinoso', 'alley', 2.6, [[102, -12], [120, -15]], L('Calle Reinoso', 'Calle Reinoso'), { front: false }],
  ['juderia', 'alley', 3.4, [[88, 40], [98, 45], [102, 52]], L('Calle Judería', 'Calle Judería'), { front: false }],
  ['callejon_dormitorio', 'alley', 3, [[182, 48], [166, 64]], L('Callejón del Dormitorio', 'Callejón del Dormitorio'), { cul: 'end' }],   /* a real callejón: ends at a house door */
  /* --- Triana --- */
  ['paseo_o', 'promenade', 10, [[-240, -280], [-240, -66]], L('Paseo de Nuestra Señora de la O', 'Paseo de Nuestra Señora de la O'), { sides: [1] }],
  ['betis', 'promenade', 10, [[-240, -54], [-240, 205], [-250, 212]], L('Calle Betis', 'Calle Betis'), { sides: [1], shops: .5 }],
  ['callao', 'lane', 7, [[-350, -280], [-240, -280]], L('Calle Callao', 'Calle Callao')],
  ['castilla', 'street', 6, [[-268, -72], [-284, -120], [-286, -210], [-290, -280]], L('Calle Castilla', 'Calle Castilla')],
  ['san_jacinto', 'street', 10, [[-272, -62], [-350, -66]], L('Calle San Jacinto', 'Calle San Jacinto'), { shops: .8 }],
  ['alfareria', 'street', 6, [[-318, -280], [-316, -150], [-318, -64], [-322, 60], [-318, 224]], L('Calle Alfarería', 'Calle Alfarería'), { shops: .55 }],
  ['troya', 'lane', 5, [[-245, -150], [-284, -152], [-316, -150], [-350, -146]], L('Calle Troya', 'Calle Troya')],
  ['rodrigo', 'lane', 4.5, [[-245, -128], [-284, -128], [-316, -124]], L('Calle Rodrigo de Triana', 'Calle Rodrigo de Triana')],
  ['pages_corro', 'street', 6, [[-245, -2], [-270, 0], [-318, 4], [-350, 6]], L('Calle Pagés del Corro', 'Calle Pagés del Corro')],
  ['pureza', 'lane', 5.5, [[-264, -48], [-269, 40], [-272, 130], [-266, 210]], L('Calle Pureza', 'Calle Pureza'), { shops: .45 }],
  ['betis_x1', 'alley', 4, [[-245, 40], [-269, 40]], L('Calle Fabié', 'Calle Fabié')],
  ['betis_x2', 'alley', 4, [[-245, 130], [-272, 130]], L('Calle Gonzalo Segovia', 'Calle Gonzalo Segovia')],
  ['duarte', 'lane', 5, [[-245, 90], [-271, 88], [-320, 92], [-350, 90]], L('Calle Duarte', 'Calle Duarte')],
  ['vela', 'alley', 3.2, [[-269, 40], [-285, 46], [-292, 60], [-305, 62], [-321, 58]], L('Calle Vela', 'Calle Vela')],
  ['corral_paso', 'alley', 3.2, [[-317, -100], [-305, -100]], L('Corral del Conde', 'Corral del Conde'), { front: false }],
  ['ronda_triana', 'road', 8, [[-350, -280], [-350, 228]], L('Ronda de Triana', 'Ronda de Triana')],
  /* --- Los Remedios -> the Feria --- */
  ['asuncion', 'road', 9, [[-262, 218], [-330, 226], [-380, 236], [-380, 248]], L('Calle Asunción', 'Calle Asunción')],
  ['lujan', 'road', 8, [[-262, 218], [-292, 250], [-296, 300], [-296, 358]], L('Calle Virgen de Luján', 'Calle Virgen de Luján'), { sides: [-1] }]
];
/* plazas: [id, poly | {c, r}, name, extra] */
const R = (x0, x1, z0, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
const PZ = PLAN.plazas = [
  ['plaza_nueva', R(-95, -38, -185, -132), L('Plaza Nueva', 'Plaza Nueva')],
  ['san_francisco', R(-22, 20, -185, -132), L('Plaza de San Francisco', 'Plaza de San Francisco')],
  ['salvador', R(40, 96, -236, -206), L('Plaza del Salvador', 'Plaza del Salvador')],
  ['virgen_reyes', [[42, -112], [96, -112], [96, -50], [58, -50], [58, -80], [42, -80]], L('Plaza Virgen de los Reyes', 'Plaza Virgen de los Reyes')],
  ['triunfo', [[-24, 4], [70, 4], [70, 48], [14, 48], [14, 14], [-24, 14]], L('Plaza del Triunfo', 'Plaza del Triunfo')],
  ['banderas', R(68, 92, 18, 46), L('Patio de Banderas', 'Patio de Banderas')],
  ['dona_elvira', { c: [128, -38], r: 10 }, L('Plaza de Doña Elvira', 'Plaza de Doña Elvira')],
  ['venerables', { c: [158, -54], r: 9 }, L('Plaza de los Venerables', 'Plaza de los Venerables')],
  ['santa_cruz', { c: [190, 40], r: 13 }, L('Plaza de Santa Cruz', 'Plaza de Santa Cruz')],
  ['alfaro', { c: [154, 102], r: 7 }, L('Plaza de Alfaro', 'Plaza de Alfaro')],
  ['puerta_jerez', { c: [-30, 178], r: 16 }, L('Puerta de Jerez', 'Puerta de Jerez')],
  ['torre_oro', R(-185, -160, 120, 165), L('Torre del Oro', 'Torre del Oro')],
  ['altozano', { c: [-258, -60], r: 14 }, L('Plaza del Altozano', 'Plaza del Altozano')],
  ['mercado_triana', R(-279, -245, -112, -73), L('Mercado de Triana', 'Mercado de Triana'), { front: false }],
  ['corral_conde', { c: [-300, -100], r: 6 }, L('Corral del Conde (patio)', 'Corral del Conde (patio)'), { front: false }],
  ['plaza_cuba', { c: [-262, 218], r: 15 }, L('Plaza de Cuba', 'Plaza de Cuba')],
  ['feria', R(-446, -300, 244, 362), L('Real de la Feria', 'Real de la Feria'), { feria: true }]
];
PLAN.opens = [['murillo', R(106, 200, 150, 184), L('Jardines de Murillo', 'Jardines de Murillo')]];
/* landmark footprints (solid): [id, poly, name] */
PLAN.solids = [
  ['catedral', [[-22, -64], [42, -64], [42, -80], [58, -80], [58, 4], [-22, 4]], L('Catedral de Sevilla + La Giralda', 'Catedral de Sevilla + La Giralda')],
  ['archivo', R(-22, 14, 14, 48), L('Archivo de Indias', 'Archivo de Indias')],
  ['alcazar', R(-22, 100.3, 48, 170), L('Real Alcázar', 'Real Alcázar')],
  ['ayuntamiento', R(-38, -22, -182, -140), L('Ayuntamiento', 'Ayuntamiento')],
  ['salvador_iglesia', R(56, 92, -262, -236), L('Iglesia del Salvador', 'Iglesia del Salvador')],
  ['maestranza', { c: [-130, 0], r: 32 }, L('Plaza de toros de la Maestranza', 'Plaza de toros de la Maestranza')],
  ['caridad', R(-160, -128, 62, 96), L('Hospital de la Caridad', 'Hospital de la Caridad')],
  ['torre_del_oro', { c: [-176, 142], r: 6 }, L('Torre del Oro', 'Torre del Oro')]
];
/* walkable carve-outs inside landmarks (after the solids): the Alcázar visit + the Ayuntamiento arch */
PLAN.carves = [
  ['alcazar_puerta', R(37, 43, 44, 60)], ['patio_leon', R(18, 62, 58, 80)], ['alcazar_paso1', R(40, 44, 78, 88)], ['doncellas', R(28, 58, 86, 108)], ['alcazar_paso2', R(44, 48, 106, 116)],
  ['alcazar_jardines', R(-12, 92, 114, 164)], ['alcazar_puerta_agua', R(90, 102, 139, 145)],
  ['arquillo', R(-40, -20, -166, -160)]
];
PLAN.bridges = [['isabel_ii', [-174, -60], [-250, -60], 12, 1.6, L('Puente de Isabel II (Puente de Triana)', 'Puente de Isabel II (Puente de Triana)')], ['san_telmo', [-174, 200], [-250, 208], 14, 1.0, L('Puente de San Telmo', 'Puente de San Telmo')]];
PLAN.arrival = { x: -64, z: -150, yaw: Math.PI * .1 };
/* landmark pairs every build must connect, each with an alternative route (tests) */
PLAN.routes = [['Plaza Nueva', [-66, -158], 'Plaza de Santa Cruz', [190, 40]], ['Plaza Nueva', [-66, -158], 'Mercado de Triana', [-262, -92]], ['Giralda', [76, -90], 'Torre del Oro', [-170, 128]],
  ['Altozano', [-258, -60], 'Plaza de Cuba', [-262, 218]], ['Plaza de Cuba', [-262, 218], 'Real de la Feria', [-380, 300]], ['El Salvador', [68, -220], 'Doña Elvira', [128, -38]],
  ['Alcázar gardens', [40, 140], 'Jardines de Murillo', [150, 166]], ['Puerta de Jerez', [-30, 178], 'Virgen de los Reyes', [76, -90]], ['Calle Alfarería', [-318, -200], 'Calle Sierpes', [-4, -240]]];
/* build the network (no THREE needed) */
PLAN.net = function () { const GW = AV.gwkit, N = GW.Net(Object.assign({ cell: .5 }, B));
  for (const [id, kind, w, pts, name, ex] of S) N.street(id, pts, w, Object.assign({ kind, name }, ex || {}));
  for (const [id, sh, name, ex] of PZ) { if (sh.c) N.circle(id, sh.c[0], sh.c[1], sh.r, Object.assign({ name }, ex || {})); else N.plaza(id, sh, Object.assign({ name }, ex || {})) }
  for (const [id, poly, name] of PLAN.opens) N.open(id, poly, { name, step: 10 });
  for (const [id, sh, name] of PLAN.solids) N.solid(id, sh.c ? GW.circPoly(sh.c[0], sh.c[1], sh.r, 28) : sh, { name });
  N.water('guadalquivir', R(PLAN.river.x0, PLAN.river.x1, B.z0 - 20, B.z1 + 20));
  for (const [id, a, b, w, rise, name] of PLAN.bridges) N.bridge(id, a, b, w, rise, { name });
  N.build(); for (const [, poly] of PLAN.carves) N.carve(poly); return N };
})(typeof window !== 'undefined' ? window : globalThis);
