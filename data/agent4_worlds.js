/* Agent 4 roadmap metadata; no false 'playable' claims for unfinished cities.
   Kept separate from generated data/worlds.js to minimize merge conflicts. */
'use strict';
window.AV = window.AV || {};
(function (AV) {
  const more = [
    ['seville', 'Sevilla · historic-centre development preview', 'Sevilla and its connected historic neighbourhoods', ['Catedral', 'Giralda', 'Santa Cruz', 'Triana', 'Plaza de España', 'Guadalquivir', 'Feria de Abril'], 'partial'],
    ['koh_tao', 'Koh Tao · planned', 'Tropical diving island and Mae Haad hostel', ['Mae Haad', 'Sairee', 'Tanote Bay', 'Ao Leuk'], 'planned'],
    ['paris', 'Paris · planned', 'Connected capital along the Seine', ['Notre-Dame', 'Louvre', 'Montmartre'], 'planned'],
    ['amsterdam', 'Amsterdam · planned', 'Canals, bicycles and neighbourhoods', ['Centraal', 'Jordaan', 'NDSM', 'Vondelpark'], 'planned'],
    ['chefchaouen', 'Chefchaouen · planned', 'Rif mountain medina', ['Kasbah', 'Ras El Maa', 'Spanish Mosque'], 'planned'],
    ['oaxaca', 'Oaxaca · planned', 'City, San José del Pacífico and Pacific coast through regional travel', ['Santo Domingo', 'San José del Pacífico', 'Puerto Escondido', 'Zipolite'], 'planned'],
    ['rio_de_janeiro', 'Rio de Janeiro · planned', 'Atlantic beaches, historical districts and forest', ['Lapa', 'Ipanema', 'Corcovado'], 'planned'],
    ['tokyo', 'Tokyo · planned', 'Dense neighbourhoods and working regional rail links', ['Shibuya', 'Shinjuku', 'Asakusa'], 'planned'],
    ['new_york_1926', 'New York 1926 · planned', 'Historically accurate Jazz Age New York', ['Harlem', 'Greenwich Village', 'Lower East Side'], 'planned']
  ];
  const existing = new Set((AV.WORLDS_DATA || []).map(w => w.id));
  AV.WORLDS_DATA = AV.WORLDS_DATA || [];
  more.forEach((w, i) => {
    if (existing.has(w[0])) return;
    AV.WORLDS_DATA.push({ id: w[0], name: w[1], roadmap_no: 30 + i,
      core_identity: w[2], music_identity: 'Regional ambient / live music (planned)', status: w[4], landmarks: w[3], art_refs: [] });
  });
})(window.AV);
