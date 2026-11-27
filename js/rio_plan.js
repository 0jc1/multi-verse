/* APEVERSE 2.2 GLOBAL WORLDS - rio_plan.js : RIO DE JANEIRO, district 1: COPACABANA + LEME (agent 4).  Pure data + AV.gwkit.Net.
   The beach is the spine: the sand, the wave-pattern calçadão (promenade), the Avenida Atlântica; inland a grid of apartment blocks
   (Avenida Nossa Senhora de Copacabana is the shopping street, Barata Ribeiro, Tonelero) up to the foot of the green morros (hills).
   West end: the Forte de Copacabana on its point (walk into the courtyard); east end: Leme and the Pedra do Leme, with the fishermen's
   path along the foot of the rock to a lookout (a real dead end, marked).  Plazas: Praça do Lido, Serzedelo Correia, Cardeal Arcoverde
   (the metro).  Compressed (1 m ≈ 0.5 real m), x east, z south (the sea is south).  AV.rioPlan */
'use strict';
(function (root) {
const AV = root.AV = root.AV || {};
const L = (e, s) => [e, s];
const PLAN = AV.rioPlan = {};
const B = PLAN.bounds = { x0: -360, x1: 350, z0: -210, z1: 230 };
PLAN.coast = [[-330, -200], [352, -200], [352, 182], [300, 176], [200, 164], [100, 168], [0, 170], [-100, 168], [-200, 162], [-280, 154], [-300, 158], [-318, 178], [-346, 184], [-358, 150], [-336, 120], [-332, -200]];
PLAN.height = (x, z) => Math.max(0, (-118 - z) * .9);   /* the morros rise behind the grid */   /* the morros behind the grid, the Pedra do Leme */
const XS = [-300, -250, -200, -150, -100, -50, 0, 50, 100, 150, 200, 250, 300];
const XN = ['Rua Francisco Otaviano', 'Rua Joaquim Nabuco', 'Rua Souza Lima', 'Rua Xavier da Silveira', 'Rua Bolívar', 'Rua Figueiredo Magalhães', 'Rua Santa Clara', 'Rua Siqueira Campos', 'Rua Hilário de Gouveia', 'Rua Ronald de Carvalho', 'Rua Duvivier', 'Rua Gustavo Sampaio', 'Rua Anchieta'];
const S = PLAN.streets = [
  ['atlantica', 'avenue', 18, [[-300, 100], [-150, 104], [0, 106], [150, 104], [300, 98]], L('Avenida Atlântica', 'Avenida Atlântica'), { car: true }],
  ['calcadao', 'promenade', 9, [[-300, 113], [-150, 117], [0, 119], [150, 117], [298, 111]], L('Calçadão de Copacabana', 'Paseo de Copacabana'), { front: false }],
  ['copacabana', 'avenue', 12, [[-300, 20], [-150, 22], [0, 24], [150, 22], [300, 18]], L('Avenida Nossa Senhora de Copacabana', 'Avenida Nossa Senhora de Copacabana'), { car: true, shops: .9 }],
  ['barata', 'street', 10, [[-300, -40], [-150, -38], [0, -36], [150, -38], [300, -42]], L('Rua Barata Ribeiro', 'Rua Barata Ribeiro'), { car: true, shops: .7 }],
  ['tonelero', 'street', 8, [[-300, -100], [-150, -98], [0, -96], [150, -98], [300, -102]], L('Rua Tonelero', 'Rua Tonelero'), { car: true, shops: .4 }]
];
XS.forEach((x, i) => S.push(['x' + x, 'street', 8, [[x, -100], [x + 2, -40], [x, 20], [x - 2, 60], [x, 100]], L(XN[i], XN[i]), { car: true, shops: .45 }]));
S.push(
  ['forte_acesso', 'lane', 7, [[-300, 100], [-318, 128], [-334, 150]], L('Acesso ao Forte de Copacabana', 'Acceso al Fuerte de Copacabana')],
  ['caminho_pescadores', 'promenade', 5, [[300, 98], [316, 114], [320, 138], [314, 162]], L('Caminho dos Pescadores', 'Camino de los Pescadores'), { cul: 'end', front: false }],   /* a real dead end: the lookout at the tip of the rock */
  ['travessa_1', 'alley', 4, [[-225, 20], [-224, -10], [-225, -40]], L('Travessa Frederico Pamplona', 'Travessa Frederico Pamplona')],
  ['travessa_2', 'alley', 4, [[75, -36], [76, -66], [75, -96]], L('Travessa Angrense', 'Travessa Angrense')],
  ['galeria', 'alley', 4.5, [[-125, 22], [-124, 60], [-125, 102]], L('Galeria Menescal (passage)', 'Galería Menescal (pasaje)'), { shops: .9 }],
  ['ladeira', 'lane', 5, [[-50, -96], [-46, -130], [-30, -150]], L('Ladeira dos Tabajaras', 'Ladeira dos Tabajaras'), { cul: 'end' }]
);
const R = (x0, x1, z0, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
PLAN.plazas = [
  ['praca_lido', R(4, 46, 30, 92), L('Praça do Lido', 'Praça do Lido')],
  ['serzedelo', R(104, 146, -32, 14), L('Praça Serzedelo Correia', 'Praça Serzedelo Correia')],
  ['arcoverde', R(204, 246, -92, -46), L('Praça Cardeal Arcoverde (metro)', 'Praça Cardeal Arcoverde (metro)')],
  ['forte_patio', { c: [-336, 160], r: 9 }, L('Forte de Copacabana', 'Fuerte de Copacabana'), { front: false }],
  ['mirante', { c: [314, 166], r: 5 }, L('Mirante do Leme', 'Mirador de Leme'), { front: false }]
];
PLAN.opens = [['praia', [[-300, 116], [-150, 120], [0, 122], [150, 120], [298, 114], [306, 200], [-300, 200]], L('Praia de Copacabana', 'Playa de Copacabana'), { sand: true, step: 14 }]];
PLAN.solids = [['copacabana_palace', R(-44, -6, 48, 92), L('Copacabana Palace', 'Copacabana Palace')], ['pedra_leme', [[322, 40], [350, 30], [350, 178], [330, 176], [328, 120]], L('Pedra do Leme', 'Piedra de Leme')]];
PLAN.carves = [];
PLAN.bridges = [];
PLAN.arrival = { x: 0, z: 116, yaw: 0 };
PLAN.routes = [['Calçadão', [0, 123], 'Praça Cardeal Arcoverde', [225, -70]], ['Forte', [-336, 160], 'Mirante do Leme', [314, 166]], ['Praça do Lido', [25, 60], 'Serzedelo Correia', [125, -10]], ['Tonelero', [-250, -100], 'Leme', [300, 98]], ['Galeria Menescal', [-124, 60], 'Ladeira', [-30, -150]]];
PLAN.net = function () { const GW = AV.gwkit, N = GW.Net(Object.assign({ cell: .5, height: PLAN.height }, B));
  N.land('rio', PLAN.coast);
  for (const [id, kind, w, pts, name, ex] of S) N.street(id, pts, w, Object.assign({ kind, name }, ex || {}));
  for (const [id, sh, name, ex] of PLAN.plazas) { if (sh.c) N.circle(id, sh.c[0], sh.c[1], sh.r, Object.assign({ name }, ex || {})); else N.plaza(id, sh, Object.assign({ name }, ex || {})) }
  for (const [id, poly, name, ex] of PLAN.opens) N.open(id, poly, Object.assign({ name }, ex || {}));
  for (const [id, sh, name] of PLAN.solids) N.solid(id, sh, { name });
  N.build(); return N };
})(typeof window !== 'undefined' ? window : globalThis);
