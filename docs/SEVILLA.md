# Sevilla: district 1 (agent 4, world id `sevilla`)

## Verdict

Sevilla is **playable and connected**. The full real-GPU suite passed **137/137** (`suite_sevilla.js`, Medium, 1536×864, Intel Iris Xe). After that run, the portada screenshot viewpoint was fixed and those steps re-run: 23/23. The offline network check passes 13/13.

**Not done in this milestone:**
- Plaza de España and Parque de María Luisa;
- Macarena and the Alameda;
- Las Setas;
- climbing the Giralda;
- interiors for the cathedral and most monuments;
- real phone testing.

## The map (compressed: 1 m in the game ≈ 0.6 m in reality; north is −z)

| Area | What is there |
|---|---|
| **Centro** | Plaza Nueva (arrival, San Fernando statue, portal, SeviBici, Metrocentro), the Ayuntamiento with the arquillo you can walk through, Plaza de San Francisco, Sierpes and Tetuán under their toldos, Rioja, Jovellanos, Cuna, Plaza del Salvador and its church, Alcaicería |
| **Cathedral quarter** | The Cathedral (buttresses, pointed windows, rose window, flying buttresses, pinnacles) and La Giralda (sebka panels, belfry lit at night, Giraldillo); Plaza Virgen de los Reyes (lamp fountain, horse carriages); Calle Alemanes; Plaza del Triunfo; the Archivo de Indias; the Avenida de la Constitución with the Metrocentro tram |
| **Real Alcázar** | Puerta del León with its lion azulejo → Patio del León → Patio de las Doncellas (arcade, long pool, sunken orange beds) → the gardens (parterres, a pavilion, the Mercury pond) → a small gate out into the Callejón del Agua |
| **Santa Cruz** | A real maze of 3–4 m lanes: Ximénez de Enciso, Susona, Pimienta, Gloria, Jamerdana, Santa Teresa, Mezquita, Lope de Rueda, Reinoso (the narrowest), plus the Callejón del Dormitorio, an intentional dead end at a door. Plazas: Doña Elvira, Venerables, Santa Cruz (the iron cross), Alfaro. Also the Jardines de Murillo and Mateos Gago |
| **Arenal** | Paseo de Cristóbal Colón on the river (palms, green bike lane, traffic), the Maestranza bullring, Hospital de la Caridad (azulejo panels), Torre del Oro, Reyes Católicos, Adriano, García de Vinuesa, Puerta de Jerez (the fountain) |
| **Triana** | The Puente de Isabel II with its iron rings, Plaza del Altozano (statue, churros kiosk), the Mercado de Triana (a walk-through hall with 6 stalls), San Jacinto, Pureza, Betis on the river (bars, palms), the potters' Calle Alfarería, Castilla, a corral de vecinos, the Ronda |
| **Los Remedios** | Puente de San Telmo, Plaza de Cuba, Asunción and Virgen de Luján, leading to the **Real de la Feria** |

**Scale:**
- 65 streets;
- 17 plazas;
- 2 bridges;
- 1,467 houses, 599 of them with a shopfront;
- 1,268 sign quads, each authored in Spanish: azulejo tile panels, painted lettering, gilded boards, a little neon, window displays;
- 65 azulejo street-name plaques;
- 164 orange trees and 54 palms;
- 324 fernandina wall lanterns.

## Connectivity (asserted in-game after every prop is placed)

- **Walking graph:** 1 component, 2,421 nodes.
- **Reachability:** 100% of the walkable ground (about 102,500 m²) is reachable from the arrival.
- **Dead ends:** 0 accidental ones. The only one is the Callejón del Dormitorio, and it is intentional.
- **Map edge:** 0 walkable cells touch it, so there are no invisible walls.
- **Landmark routes:** each of these pairs is routed by the GPS, and an **alternative route** exists for each:

| From → to | Route length |
|---|---|
| Plaza Nueva → Plaza de Santa Cruz | 391 m |
| Plaza Nueva → Mercado de Triana | 269 m |
| Giralda → Torre del Oro | 466 m |
| Altozano → Plaza de Cuba | 304 m |
| Plaza de Cuba → Feria | 185 m |
| Salvador → Doña Elvira | 219 m |
| Alcázar gardens → Murillo | 141 m |
| Puerta de Jerez → Virgen de los Reyes | 377 m |
| Alfarería → Sierpes | 568 m |

- **Walked like a player** (the engine's collision, 0.25 m steps, player radius 0.4):
  - Plaza Nueva → Santa Cruz → Callejón del Agua → into the Alcázar gardens through the water gate → out to Puerta de Jerez;
  - Arenal → over the Triana bridge → Mercado → Alfarería → Betis → over San Telmo → Torre del Oro.
- **Solid where it should be:** houses (sampled), the river, the Cathedral, the bullring, the Torre del Oro and the walk-in side walls are solid. The bridges arch to 1.6 m. The Alcázar patios and gardens are walkable.

## Things to do

| What | Where | How it works |
|---|---|---|
| Walk-in **Bodega Casa Fermín** | Mateos Gago | Bar, casks, hams, barrel tables, azulejo dado. Tapas: espinacas, salmorejo, tortilla, montadito de pringá, jamón; manzanilla, caña, tinto |
| Walk-in **Tablao La Soleá** | Ximénez de Enciso | Stage and red backdrop; the show runs **21:00–24:00**, ticket 15, +1 music rep. A dancer and a guitarist are on stage; procedural flamenco guitar plays from the room |
| Walk-in **Cerámica La Cava** | Alfarería | Shelves of plates, a wheel, a glowing kiln; azulejos and plates |
| Walk-in **Volantes de Triana** | Sierpes | Flamenca dresses, mantones, flowers, fans (wearable) |
| Walk-up shops | Various | Guitarrería Hermanos Vidal (guitar, strings), Freiduría Er Guadalquiví and Bar La Orilla (Betis), Abanicos y Mantones Lola, Abacería El Postigo, Heladería La Abuela, Sombrerería Maera, Taberna Er Salvador |
| The **convent torno** | — | You ring, give the answer, and yemas arrive on the turning drum. You never see the sisters |
| **Mercado de Triana** | Triana | 6 stalls: fruit, fish, jamón, olives, flowers, tapas bar. Plus the **churros kiosk** on the Altozano |
| **Rides** | — | Metrocentro tram (3 stops); a horse carriage from the Giralda to the Torre del Oro (Curro and his horse Lucero); a river cruise; SeviBici rental at Plaza Nueva and Plaza de Cuba; taxi stands |
| **Missions** | — | "Una cuerda para Rocío" (strings from Triana before the show); "Un azulejo para Manolo" (a tile from Cerámica La Cava); at the Feria, sevillanas with Rocío |
| **6 hidden discoveries** | — | Calle Reinoso, the Callejón del Dormitorio, the Mercury pond, the corral, the Alcázar water gate, the Giralda's ramps |
| **People** | — | Rocío, Manolo, Lucía, Curro and Inma, each with a daily routine (they walk real GPS routes when you are near) and 4 conversation choices. Pedestrians and pairs, regulars at terrace tables, a busker, shop and market staff, cyclists in the bike lanes, taxis and cars on the river avenue, the tram |
| **Feria de Abril** | Real de la Feria | Every **Thursday, 12:00–04:00** (`AV.fest.force('feria_abril', true)` to preview). See below |

**At the Feria:**
- 70 walk-in casetas with striped canvas, a pelmet, a railing gate and a bar;
- their walls enter the walk mask only while the fair runs;
- caseta signs ("Los Ápicos", "Er Mono Feliz", …);
- about 1,600 farolillos over the calles;
- the lit portada with walk-through arches;
- a Ferris wheel and a carousel;
- flamenca crowds and dancing pairs;
- palmas in the ambience;
- rebujito and pescaíto at the caseta bars.

The rest of the week the Real is open albero ground.

**Ambience:** registered through the shared `AV.ambWorlds` preset, positional by place and day or night:
- crowd and fountains;
- the river;
- traffic;
- the Giralda's bells;
- swifts;
- garden birds;
- flamenco guitar (the tablao at night, a busker in Plaza de Santa Cruz by day);
- palmas;
- carriage hooves;
- bar clinks;
- crickets;
- footsteps.

**Save:** state lives in the optional `S.sev`: missions, rides, discoveries, shows. A sandboxed save/load round trip passed, and the player's real save was left untouched.

## Performance (real GPU: Intel Iris Xe, Medium, 1536×864, final run)

Another agent may have been running GPU tests at the same time, so treat single samples as noisy.

| View | fps | draw calls | triangles |
|---|---|---|---|
| Arrival (first sample after load) | **15.2** | 199 | 676k |
| Santa Cruz | 52 | 124 | 513k |
| Mercado de Triana | 48.4 | 150 | 538k |
| Feria at night, looking down the Real | 42.8 | 155 | 526k |
| Feria, looking at the portada (in the screenshot run) | **17** | 284 | 1.17M |
| Santa Cruz at night | 60.4 | 60 | 162k |
| Under the Giralda | 45.5 | 219 | 742k |
| Calle Sierpes | 60.5 | 74 | 239k |
| Torre del Oro | 48 | 98 | 169k |
| Patio de las Doncellas | 49.5 | 114 | 291k |

- **The arrival sample swings between runs:** 15.2, then 17.2, then 25.6. It is taken right after the 9 s load, and on Sierpes the same first-sample effect read 14.5 and then 51–60 later.
- **An in-run A/B:** Santa Cruz did 41.5 fps while the shipped Amsterdam reference did 30.8 fps in the same run.
- **The real hotspot** is the view across the whole Feria with the portada at night, at 1.2M triangles.
- **Next optimisation** (not done):
  - distance LOD for house detail (balconies and pots beyond about 60 m);
  - instanced farolillos;
  - fewer filler roofs.
- **Load:** 9.2 s, of which 5.1 s is the build.
- **Static parts:** about 87k, merged in 64 m tiles.

## Known limitations

- **Phone:** not tested on a phone, real or emulated (the `-Mobile` suite was not run).
- **Detail level:** houses are built from boxes. The detail (surrounds, rejas, balconies, cierros, pots, awnings, signs) is dense at street level but blocky up close. The Cathedral and Alcázar are suggestive interpretations, not replicas.
- **Interiors:** only the 4 walk-ins and the Alcázar patios and gardens are enterable. Other shops are walk-up.
- **Feria crowds:** while the fair is on, the crowd uses the city graph, so some festival-goers wander outside the Real.
- **Taxis:** taxi rides follow the city's map roads, which include Santa Cruz lanes; that is narrow for a car.
- **Audio:** uses the shared ambience presets, because agent 3's audio API was not published yet.
- **Screenshots:** in `docs/screenshots/sevilla/` (JPEG), with the suite report alongside.
