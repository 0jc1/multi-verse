/* APEVERSE 2.2 GLOBAL WORLDS - oaxaca_plan.js : OAXACA DE JUÁREZ, the historic centre (agent 4).  Pure data + AV.gwkit.Net.
   Oaxaca's centre really is a Spanish colonial grid, so this one keeps the grid, but not a perfectly repeated one: blocks are broken by
   the Zócalo and the Alameda de León, the Cathedral, the two markets (walk-through halls), Santo Domingo and its atrium + garden, El
   Llano park, and mid-block callejones that cut through; Macedonio Alcalá is the pedestrian andador from the Cathedral to Santo Domingo.
   East of the Calzada de la República, barrio Jalatlaco is organic: cobbled lanes, murals, a little plaza at San Matías.  North-west,
   the Cerro del Fortín rises (a real hill: escalinata + a winding road up to the Guelaguetza auditorium).  The Panteón General
   (San Miguel) is a walled cemetery you can walk in - the heart of Día de Muertos nights.  x east, z south.  AV.oaxacaPlan */
'use strict';
(function (root) {
const AV = root.AV = root.AV || {};
const L = (e, s) => [e, s];
const PLAN = AV.oaxacaPlan = {};
const B = PLAN.bounds = { x0: -330, x1: 320, z0: -310, z1: 230 };
const XS = [-210, -168, -126, -84, -42, 0, 42, 84, 126, 168], ZS = [-252, -210, -168, -126, -84, -42, 0, 42, 84, 126, 168];
const XN = ['Calle Díaz Ordaz', 'Calle Crespo', 'Calle Tinoco y Palacios', 'Calle Porfirio Díaz', 'Calle García Vigil', 'Andador Macedonio Alcalá', 'Calle Cinco de Mayo', 'Calle Reforma', 'Calle Pino Suárez', 'Calle Juárez'];
const ZN = ['Calle Berriozábal', 'Calle Allende', 'Calle Murguía', 'Calle Abasolo', 'Avenida Morelos', 'Avenida Independencia', 'Avenida Hidalgo', 'Calle Guerrero', 'Calle Mina', 'Calle Zaragoza', 'Calle Arista'];
/* segments of each grid line (the gaps are plazas / landmarks); a gentle per-street wobble keeps it from looking ruled */
const XSEG = { 0: [[-210, -84, 'alcala'], [80, 168]], 126: [[-252, -206], [-130, 168]] }, ZSEG = { 0: [[-246, -38], [38, 196]], '-168': [[-210, 88], [164, 196]] };
const wob = (i, t) => Math.sin(t * .021 + i * 1.7) * 1.4;
const S = PLAN.streets = [];
XS.forEach((x, i) => { for (const [z0, z1, tag] of XSEG[x] || [[-252, 168]]) { const pts = []; for (let z = z0; z <= z1 + .1; z += 21) pts.push([x + (tag ? 0 : wob(i, z)), Math.min(z, z1)]); if (pts[pts.length - 1][1] !== z1) pts.push([x, z1]);
  S.push([tag === 'alcala' ? 'alcala' : 'x' + x + '_' + z0, tag === 'alcala' ? 'promenade' : 'street', tag === 'alcala' ? 10 : 8.5, pts, L(XN[i], XN[i]), tag === 'alcala' ? { shops: .9 } : { car: true, shops: Math.abs(x) <= 84 ? .6 : .35 }]) } });
ZS.forEach((z, i) => { for (const [x0, x1] of ZSEG[z] || [[-210, 196]]) { const pts = []; for (let x = x0; x <= x1 + .1; x += 21) pts.push([Math.min(x, x1), z + wob(i + 5, x)]); if (pts[pts.length - 1][0] !== x1) pts.push([x1, z]);
  S.push(['z' + z + '_' + x0, 'street', 8.5, pts, L(ZN[i], ZN[i]), { car: true, shops: Math.abs(z) <= 84 ? .6 : .35 }]) } });
S.push(
  ['calzada', 'avenue', 14, [[196, -252], [196, -84], [198, 0], [196, 168]], L('Calzada de la República', 'Calzada de la República'), { car: true }],
  /* mid-block callejones (each joins two streets) */
  ['cj_1', 'alley', 3.6, [[-147, -126], [-144, -105], [-147, -84]], L('Callejón del Carmen', 'Callejón del Carmen')],
  ['cj_2', 'alley', 3.6, [[-105, 42], [-101, 63], [-105, 84]], L('Callejón de la Soledad', 'Callejón de la Soledad')],
  ['cj_3', 'alley', 3.4, [[63, -168], [60, -147], [63, -126]], L('Callejón de las Flores', 'Callejón de las Flores')],
  ['cj_4', 'alley', 3.6, [[105, 84], [108, 105], [105, 126]], L('Callejón del Rosario', 'Callejón del Rosario')],
  ['cj_5', 'alley', 3.4, [[-210, -63], [-189, -60], [-168, -63]], L('Callejón de la Merced', 'Callejón de la Merced')],
  ['cj_6', 'alley', 3.4, [[147, -42], [150, -21], [147, 0]], L('Callejón del Pañuelo', 'Callejón del Pañuelo')],
  ['cj_7', 'alley', 3, [[-63, -168], [-60, -152]], L('Callejón del Coyote', 'Callejón del Coyote'), { cul: 'end' }],   /* ends at a courtyard door */
  /* Jalatlaco: organic */
  ['jal_1', 'lane', 4.5, [[196, -200], [230, -196], [252, -186], [280, -190], [300, -176]], L('Calle Aldama (Jalatlaco)', 'Calle Aldama (Jalatlaco)'), { shops: .35 }],
  ['jal_2', 'alley', 4, [[196, -150], [232, -146], [251, -166]], L('Calle Hidalgo (Jalatlaco)', 'Calle Hidalgo (Jalatlaco)')],
  ['jal_3', 'lane', 5, [[196, -120], [240, -118], [270, -128], [300, -120]], L('Calle 20 de Noviembre (Jalatlaco)', 'Calle 20 de Noviembre (Jalatlaco)'), { shops: .35 }],
  ['jal_4', 'alley', 3.6, [[270, -128], [276, -160], [262, -172]], L('Callejón de los Murales', 'Callejón de los Murales')],
  ['jal_5', 'lane', 5, [[198, -84], [250, -90], [300, -80]], L('Calle Curtidurías', 'Calle Curtidurías')],
  ['jal_6', 'lane', 5, [[300, -176], [302, -120], [300, -80]], L('Calle Niños Héroes', 'Calle Niños Héroes')],
  ['jal_7', 'alley', 3.6, [[240, -118], [236, -100], [244, -88]], L('Callejón del Agua (Jalatlaco)', 'Callejón del Agua (Jalatlaco)')],
  ['panteon_in', 'street', 7, [[196, 80], [214, 80]], L('Entrada al Panteón General', 'Entrada al Panteón General'), { front: false }],
  /* the Cerro del Fortín: the escalinata straight up + the winding road */
  ['escalinata', 'promenade', 6, [[-210, -210], [-238, -232], [-262, -256], [-280, -272]], L('Escalinata del Fortín', 'Escalinata del Fortín'), { front: false }],
  ['carretera_fortin', 'road', 7, [[-210, -252], [-236, -278], [-266, -292], [-296, -288], [-300, -272]], L('Camino al Auditorio Guelaguetza', 'Camino al Auditorio Guelaguetza'), { front: false, car: true }],
  ['soledad_w', 'lane', 6, [[-246, 42], [-210, 42]], L('Calle Morelos (Soledad)', 'Calle Morelos (Soledad)')]
);
const R = (x0, x1, z0, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
PLAN.plazas = [
  ['zocalo', R(-38, 38, -38, 38), L('Zócalo (Plaza de la Constitución)', 'Zócalo (Plaza de la Constitución)')],
  ['alameda', R(-80, -46, -80, -46), L('Alameda de León', 'Alameda de León')],
  ['mercado_juarez', R(-80, -46, 46, 80), L('Mercado Benito Juárez', 'Mercado Benito Juárez'), { front: false, market: true, noTrees: true }],
  ['mercado_20nov', R(-80, -46, 88, 122), L('Mercado 20 de Noviembre', 'Mercado 20 de Noviembre'), { front: false, market: true, noTrees: true }],
  ['atrio_sd', R(-38, 38, -216, -198), L('Atrio de Santo Domingo', 'Atrio de Santo Domingo')],
  ['soledad', R(-262, -218, 4, 40), L('Plaza de la Soledad', 'Plaza de la Soledad')],
  ['san_matias', { c: [252, -172], r: 10 }, L('Plaza de San Matías Jalatlaco', 'Plaza de San Matías Jalatlaco')],
  ['panteon', R(214, 290, 40, 118), L('Panteón General (San Miguel)', 'Panteón General (San Miguel)'), { front: false, noTrees: true, noPave: true }],
  ['guelaguetza', { c: [-292, -278], r: 16 }, L('Auditorio Guelaguetza (Cerro del Fortín)', 'Auditorio Guelaguetza (Cerro del Fortín)'), { front: false }]
];
PLAN.opens = [['jardin_etno', R(46, 80, -248, -216), L('Jardín Etnobotánico', 'Jardín Etnobotánico')], ['llano', R(88, 164, -206, -130), L('El Llano (Paseo Juárez)', 'El Llano (Paseo Juárez)')]];
PLAN.solids = [
  ['catedral', R(-30, 30, -80, -46), L('Catedral de Oaxaca', 'Catedral de Oaxaca')],
  ['santo_domingo', R(-30, 30, -250, -216), L('Templo de Santo Domingo', 'Templo de Santo Domingo')],
  ['soledad_basilica', R(-262, -226, -40, -6), L('Basílica de la Soledad', 'Basílica de la Soledad')],
  ['palacio', R(-30, 30, 48, 80), L('Palacio de Gobierno', 'Palacio de Gobierno')]
];
PLAN.carves = [];
PLAN.bridges = [];
/* the Cerro del Fortín: a smooth hill north-west (0 elsewhere) */
PLAN.height = (x, z) => { const d = Math.hypot(x + 300, z + 290); return d > 110 ? 0 : 26 * (.5 + .5 * Math.cos(d / 110 * Math.PI)) };
PLAN.arrival = { x: 0, z: 30, yaw: Math.PI };
PLAN.routes = [['Zócalo', [0, 0], 'Santo Domingo', [0, -205]], ['Zócalo', [0, 0], 'Mercado 20 de Noviembre', [-63, 105]], ['Alameda', [-63, -63], 'El Llano', [126, -168]], ['Soledad', [-240, 22], 'Jalatlaco', [252, -172]],
  ['Santo Domingo', [0, -205], 'Cerro del Fortín', [-292, -278]], ['Mercado Juárez', [-63, 63], 'Panteón General', [252, 80]], ['Jalatlaco', [280, -190], 'Zócalo', [20, 20]]];
PLAN.net = function () { const GW = AV.gwkit, N = GW.Net(Object.assign({ cell: .5, height: PLAN.height }, B));
  for (const [id, kind, w, pts, name, ex] of S) N.street(id, pts, w, Object.assign({ kind, name }, ex || {}));
  for (const [id, sh, name, ex] of PLAN.plazas) { if (sh.c) N.circle(id, sh.c[0], sh.c[1], sh.r, Object.assign({ name }, ex || {})); else N.plaza(id, sh, Object.assign({ name }, ex || {})) }
  for (const [id, poly, name, ex] of PLAN.opens) N.open(id, poly, Object.assign({ name, step: 10 }, ex || {}));
  for (const [id, sh, name] of PLAN.solids) N.solid(id, sh, { name });
  N.build(); return N };
})(typeof window !== 'undefined' ? window : globalThis);
