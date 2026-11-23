/* APEVERSE - Agent 4 Sevilla: independent, testable layout and travel graph.
   z increases southwards; x increases eastwards. The coordinates are a compact
   approximation of real geographic adjacencies, not surveyed map coordinates. */
'use strict';
(function (root) {
  const P = {};
  P.extent = { x0: -535, x1: 340, z0: -595, z1: 670 };
  P.river = { x0: -268, x1: -226, bridges: [
    { id: 'isabel', name: 'Puente de Isabel II', z: -110, w: 17 },
    { id: 'telmo', name: 'Puente de San Telmo', z: 250, w: 17 }
  ] };
  P.districts = [
    { id: 'triana', name: 'Triana', x: -411, z: -30, x0: -525, x1: -280, z0: -365, z1: 365 },
    { id: 'centro', name: 'Casco Antiguo', x: -76, z: -80, x0: -221, x1: 78, z0: -570, z1: 285 },
    { id: 'santacruz', name: 'Santa Cruz', x: 154, z: 90, x0: 78, x1: 285, z0: -120, z1: 285 },
    { id: 'sur', name: 'María Luisa', x: 200, z: 483, x0: -30, x1: 340, z0: 286, z1: 650 },
    { id: 'remedios', name: 'Los Remedios', x: -408, z: 475, x0: -525, x1: -280, z0: 365, z1: 645 }
  ];
  // 5th value is total drivable/path width, not a building line.
  P.roads = [
    [-500, -110, 185, -110, 13], [-495, 250, 190, 250, 13],
    [73, -550, 73, 425, 13], [73, 425, 73, 595, 14],
    [-176, -530, -176, 395, 11], [-356, -500, -356, 575, 11],
    [208, -100, 208, 300, 7], [142, -65, 142, 275, 6],
    [-180, -55, 216, -55, 10], [-185, 102, 218, 102, 10],
    [-185, -275, 85, -275, 9], [-185, -455, 85, -455, 10],
    [-175, 350, 235, 350, 11], [-356, 430, -385, 430, 9],
    [-405, 250, -405, 585, 10],
    // pedestrian lanes in Santa Cruz connect directly, no world-hopping.
    [114, -55, 114, 102, 5], [173, -55, 173, 105, 5],
    [72, 35, 208, 35, 5], [72, 170, 208, 170, 6],
    [73, 284, 208, 284, 10], [-176, 15, 72, 15, 7],
    [-356, 10, -268, 10, 9], [-356, -325, -282, -325, 7]
  ];
  P.places = [
    { id: 'seville_portal', name: ['Apeverse Arrival / Plaza Nueva', 'Llegada Apeverse / Plaza Nueva'], x: -116, z: -55 },
    { id: 'cathedral', name: ['Catedral de Sevilla', 'Catedral de Sevilla'], x: 13, z: -16 },
    { id: 'giralda', name: ['La Giralda', 'La Giralda'], x: 34, z: -9 },
    { id: 'santacruz', name: ['Barrio de Santa Cruz', 'Barrio de Santa Cruz'], x: 143, z: 35 },
    { id: 'alcazar', name: ['Real Alcázar', 'Real Alcázar'], x: 145, z: 147 },
    { id: 'river', name: ['Paseo del Guadalquivir', 'Paseo del Guadalquivir'], x: -211, z: 15 },
    { id: 'triana', name: ['Mercado de Triana', 'Mercado de Triana'], x: -338, z: -87 },
    { id: 'isabel', name: ['Puente de Isabel II', 'Puente de Isabel II'], x: -249, z: -110 },
    { id: 'setas', name: ['Las Setas', 'Las Setas'], x: 24, z: -274 },
    { id: 'alameda', name: ['Alameda de Hércules', 'Alameda de Hércules'], x: 27, z: -459 },
    { id: 'plazadeespana', name: ['Plaza de España', 'Plaza de España'], x: 77, z: 475 },
    { id: 'marialuisa', name: ['Parque de María Luisa', 'Parque de María Luisa'], x: 212, z: 491 },
    { id: 'feria', name: ['Recinto de la Feria de Abril', 'Recinto de la Feria de Abril'], x: -408, z: 438 },
    { id: 'telmo', name: ['Puente de San Telmo', 'Puente de San Telmo'], x: -247, z: 250 }
  ];
  P.venues = [
    { id: 'sev_taberna', name: ['Taberna del Azahar', 'Taberna del Azahar'], kind: 'tapas',
      r: [94, 123, -71, -46], face: 'west', door: -57, items: [['sev_gazpacho', 8], ['sev_espinacas', 10], ['sev_tinto', 7]],
      sign: 'TABERNA DEL AZAHAR', accent: '#a2472c', staff: 'Carmen' },
    { id: 'sev_cafe', name: ['Café Patio de Luz', 'Café Patio de Luz'], kind: 'cafe',
      r: [94, 123, 18, 47], face: 'west', door: 33, items: [['sev_tostada', 6], ['sev_zumo', 5], ['water', 3]],
      sign: 'CAFÉ PATIO DE LUZ', accent: '#5a7753', staff: 'Luis' },
    { id: 'sev_hostal', name: ['Hostal Callejón del Jazmín', 'Hostal Callejón del Jazmín'], kind: 'hostel',
      r: [184, 210, 48, 76], face: 'west', door: 62, items: [['sev_postal', 4], ['water', 3]],
      sign: 'HOSTAL CALLEJÓN DEL JAZMÍN', accent: '#8a5b91', staff: 'Inés' },
    { id: 'sev_ceramica', name: ['Taller de Azulejos Triana', 'Taller de Azulejos Triana'], kind: 'craft',
      r: [-341, -315, -88, -62], face: 'west', door: -75, items: [['sev_azulejo', 12], ['sev_postal', 4]],
      sign: 'CERÁMICA · TRIANA', accent: '#256e9a', staff: 'Rafa' },
    { id: 'sev_flamenco', name: ['Tablao del Olivo', 'Tablao del Olivo'], kind: 'music',
      r: [184, 213, -30, -6], face: 'west', door: -18, items: [['sev_zumo', 5], ['sev_espinacas', 10]],
      sign: 'TABLAO DEL OLIVO', accent: '#8d332c', staff: 'Amparo' }
  ];
  // Collision-free walking routes used by the game's headless suite and by the world map.
  // All routes are continuous 3D-space travel, not teleport hops.
  P.walkRoutes = {
    'arrival to cathedral and Santa Cruz': [[-116, -55], [73, -55], [73, 33], [73, 102], [142, 102]],
    'cathedral to Maria Luisa gardens': [[73, -55], [73, 102], [73, 250], [73, 284], [73, 350], [73, 408]],
    'Alameda to cathedral': [[73, -455], [73, -275], [73, -110], [73, -55]],
    'Triana across Isabel II bridge': [[-356, -110], [-268, -110], [-246, -110], [-226, -110], [-176, -110], [73, -110]],
    'Triana ceramic to waterfront': [[-356, -325], [-356, -110], [-356, 250]],
    'Santa Cruz café courtyard': [[73, 33], [91, 33], [97.65, 33]],
    'city to Los Remedios via San Telmo': [[73, 250], [-176, 250], [-226, 250], [-246, 250], [-268, 250], [-356, 250], [-405, 250], [-405, 380], [-402.5, 380], [-402.5, 430]]
  };
  P.districtAt = (x, z) => { const d = P.districts.find(d => x >= d.x0 && x <= d.x1 && z >= d.z0 && z <= d.z1); return d ? d.id : 'outskirts' };
  P.surface = function (x, z) {
    const b = P.extent, rv = P.river;
    if (x < b.x0 || x > b.x1 || z < b.z0 || z > b.z1) return null;
    if (x > rv.x0 && x < rv.x1 && !rv.bridges.some(v => Math.abs(z - v.z) < v.w / 2 - .4)) return null;
    return 0;
  };
  P.distanceToRoad = (x, z) => {
    let best = Infinity;
    for (const [x0, z0, x1, z1, w] of P.roads) {
      const dx = x1 - x0, dz = z1 - z0, ll = dx * dx + dz * dz;
      const t = ll ? Math.max(0, Math.min(1, ((x - x0) * dx + (z - z0) * dz) / ll)) : 0;
      best = Math.min(best, Math.hypot(x - x0 - t * dx, z - z0 - t * dz) - w / 2);
    }
    return best;
  };
  root.AV = root.AV || {};
  root.AV.agent4Seville = P;
})(typeof window !== 'undefined' ? window : globalThis);
