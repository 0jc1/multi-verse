/* APEVERSE 2.2 GLOBAL WORLDS - chefchaouen_plan.js : CHEFCHAOUEN, the blue medina on its hillside (agent 4).  Pure data + AV.gwkit.Net.
   The town climbs north-east towards the Rif: in at Bab el-Ain at the bottom (south-west), up through the souk to Plaza Uta el-Hammam
   (the Kasbah's ochre walls + garden, the Grand Mosque), on up the winding blue lanes to Ras El Maa, the spring where the river comes
   out of the mountain and women wash at the stone basins; footbridges cross to the hillside path up to the Spanish Mosque.  Lanes are
   narrow (3-4.5 m), stepped, crooked, with little plazas; two of them are real dead ends into courtyards (marked), everything else
   connects.  The road (Avenida Hassan II) runs outside the medina along the bottom.  x east, z south (north is -z).  AV.chefchaouenPlan */
'use strict';
(function (root) {
const AV = root.AV = root.AV || {};
const L = (e, s) => [e, s];
const PLAN = AV.chefchaouenPlan = {};
const B = PLAN.bounds = { x0: -260, x1: 232, z0: -240, z1: 214 };
PLAN.river = { x0: 178, x1: 194 };
/* the hillside: rising ~4-5 % towards the north-east, steeper on the far bank */
PLAN.height = (x, z) => Math.max(0, .04 * (x + 220) + .05 * (160 - z)) + Math.max(0, x - 194) * .4;
const S = PLAN.streets = [
  ['avenida_hassan', 'road', 10, [[-176, 62], [-200, 140], [-120, 190], [40, 190], [120, 150]], L('Avenida Hassan II', 'Avenida Hassan II'), { car: true, sides: [1] }],
  ['bab_ain', 'lane', 5, [[-200, 150], [-160, 120], [-130, 100], [-100, 70], [-60, 40], [-40, 34], [-26, 26]], L('Bab el-Ain · Calle Bab el-Ain', 'Bab el-Ain · Calle Bab el-Ain'), { shops: .7 }],
  ['souk', 'lane', 4.5, [[-120, 190], [-110, 150], [-90, 120], [-70, 90], [-40, 60], [-10, 26]], L('Souk (Calle Sidi Abdelhamid)', 'Zoco (Calle Sidi Abdelhamid)'), { shops: .85 }],
  ['targui', 'lane', 4, [[40, 190], [36, 150], [40, 110], [50, 70], [24, 22]], L('Calle Targui', 'Calle Targui'), { shops: .4 }],
  ['sebbanin', 'lane', 4, [[60, 60], [90, 40], [120, 10], [150, -20], [172, -40]], L('Calle Sebbanin (the washers)', 'Calle Sebbanin (los lavaderos)'), { shops: .3 }],
  ['paseo_ras', 'promenade', 5, [[172, -205], [170, -120], [172, -40], [168, 40], [150, 110], [120, 150]], L('Paseo de Ras El Maa', 'Paseo de Ras El Maa'), { sides: [1] }],
  ['calle_ras', 'lane', 4.5, [[30, -24], [55, -55], [90, -95], [120, -140], [145, -175]], L('Calle Ras El Maa', 'Calle Ras El Maa'), { shops: .55 }],
  ['calle_norte', 'alley', 4, [[-150, -120], [-100, -150], [-40, -170], [30, -180], [100, -190], [134, -190]], L('Calle Sidi Bouhachem', 'Calle Sidi Bouhachem')],
  ['calle_oeste', 'alley', 4, [[-160, 120], [-175, 60], [-180, 0], [-170, -60], [-150, -120]], L('Calle Bab Souk', 'Calle Bab Souk')],
  ['l1', 'alley', 3.6, [[-100, 70], [-120, 30], [-130, -20], [-120, -70], [-100, -110], [-100, -150]], L('Calle Onsar', 'Calle Onsar')],
  ['l2', 'alley', 3.6, [[-60, 40], [-76, 30], [-80, 10], [-84, -30], [-80, -40], [-60, -80], [-40, -120], [-40, -170]], L('Calle Andalous', 'Calle Andalous'), { shops: .3 }],
  ['l3', 'alley', 3.6, [[-28, -20], [-20, -60], [0, -100], [10, -140], [30, -180]], L('Calle Granada', 'Calle Granada'), { shops: .3 }],
  ['l4', 'alley', 3.4, [[-180, 0], [-130, -20], [-80, -40], [-20, -60], [55, -55]], L('Calle Zaouia', 'Calle Zaouia')],
  ['l5', 'alley', 3.4, [[-170, -60], [-120, -70], [-60, -80], [0, -100], [90, -95]], L('Calle Mouley Ali', 'Calle Mouley Ali')],
  ['l6', 'alley', 3.4, [[-100, -110], [-40, -120], [10, -140], [120, -140]], L('Calle Lalla Rkia', 'Calle Lalla Rkia')],
  ['l7', 'alley', 3.4, [[-175, 60], [-130, 50], [-100, 70]], L('Calle Hamman', 'Calle Hamman')],
  ['l8', 'alley', 3.6, [[-90, 120], [-60, 110], [-30, 90], [0, 80], [40, 110]], L('Calle Tarik', 'Calle Tarik'), { shops: .4 }],
  ['l9', 'alley', 3.4, [[0, 80], [-6, 50], [-8, 28]], L('Calle Kharrazin', 'Calle Kharrazin'), { shops: .4 }],
  ['l10', 'alley', 3.6, [[50, 70], [90, 80], [130, 100], [152, 108]], L('Calle Nasr', 'Calle Nasr')],
  ['l11', 'alley', 3.4, [[90, 40], [80, 0], [55, -55]], L('Calle Sabbaghin', 'Calle Sabbaghin')],
  ['l12', 'alley', 3.4, [[120, 10], [120, -60], [90, -95]], L('Calle Ain Hamra', 'Calle Ain Hamra')],
  ['l13', 'alley', 3.4, [[150, -20], [150, -80], [120, -140]], L('Calle Mohammed Ben Rachid', 'Calle Mohammed Ben Rachid')],
  ['l14', 'alley', 3.4, [[36, 150], [80, 140], [120, 150]], L('Calle Hadi Ali', 'Calle Hadi Ali')],
  ['c1', 'alley', 3, [[-130, -20], [-152, -32]], L('Derb el-Ouad', 'Derb el-Ouad'), { cul: 'end' }],   /* a derb that ends in a courtyard */
  ['c2', 'alley', 3, [[80, 0], [102, -14]], L('Derb Sidi Ahmed', 'Derb Sidi Ahmed'), { cul: 'end' }]
];
const R = (x0, x1, z0, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
PLAN.plazas = [
  ['uta_hammam', R(-30, 30, -24, 24), L('Plaza Uta el-Hammam', 'Plaza Uta el-Hammam')],
  ['el_makhzen', { c: [60, 60], r: 9 }, L('Plaza el-Makhzen', 'Plaza el-Makhzen')],
  ['ras_el_maa', R(130, 174, -212, -168), L('Ras El Maa (the spring)', 'Ras El Maa (el manantial)')],
  ['fuente', { c: [-80, -40], r: 6 }, L('Fountain square', 'Plazuela de la fuente')],
  ['plaza_ain', { c: [-160, 120], r: 7 }, L('Plaza Bab el-Ain', 'Plaza Bab el-Ain')]
];
PLAN.opens = [['ladera', R(196, 226, -216, -40), L('Hillside path to the Spanish Mosque', 'Camino a la Mezquita Española'), { step: 8 }]];
PLAN.solids = [['kasbah', R(-70, -30, -30, 24), L('The Kasbah', 'La Alcazaba')], ['mezquita', R(30, 52, 0, 24), L('Grand Mosque', 'Gran Mezquita')], ['mezquita_espanola', R(204, 218, -150, -136), L('Spanish Mosque', 'Mezquita Española')]];
PLAN.carves = [['kasbah_jardin', R(-64, -34, -24, 18)], ['kasbah_puerta', R(-38, -28, -6, 2)]];
PLAN.bridges = [['pont_ras', [168, -190], [202, -190], 4, .6, L('Footbridge at Ras El Maa', 'Puente de Ras El Maa')], ['pont_sur', [168, -60], [202, -60], 4, .6, L('Lower footbridge', 'Puente de abajo')]];
PLAN.arrival = { x: 0, z: 10, yaw: Math.PI * .8 };
PLAN.routes = [['Bab el-Ain', [-160, 120], 'Uta el-Hammam', [0, 0]], ['Uta el-Hammam', [0, 0], 'Ras El Maa', [150, -190]], ['Souk', [-90, 120], 'Calle Norte', [30, -180]], ['Ras El Maa', [150, -190], 'Spanish Mosque path', [210, -120]],
  ['Kasbah garden', [-50, 0], 'Plaza el-Makhzen', [60, 60]], ['Fountain square', [-80, -40], 'Avenida Hassan II', [40, 190]]];
PLAN.net = function () { const GW = AV.gwkit, N = GW.Net(Object.assign({ cell: .5, height: PLAN.height }, B));
  for (const [id, kind, w, pts, name, ex] of S) N.street(id, pts, w, Object.assign({ kind, name }, ex || {}));
  for (const [id, sh, name, ex] of PLAN.plazas) { if (sh.c) N.circle(id, sh.c[0], sh.c[1], sh.r, Object.assign({ name }, ex || {})); else N.plaza(id, sh, Object.assign({ name }, ex || {})) }
  for (const [id, poly, name, ex] of PLAN.opens) N.open(id, poly, Object.assign({ name }, ex || {}));
  for (const [id, sh, name] of PLAN.solids) N.solid(id, sh, { name });
  N.water('ras_river', R(PLAN.river.x0, PLAN.river.x1, B.z0 - 20, B.z1 + 20));
  for (const [id, a, b, w, rise, name] of PLAN.bridges) N.bridge(id, a, b, w, rise, { name });
  N.build(); for (const [, poly] of PLAN.carves) N.carve(poly); return N };
})(typeof window !== 'undefined' ? window : globalThis);
