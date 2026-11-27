# Sevilla: district 1 (agent 4, world id `sevilla`)

## Verdict

Sevilla is **playable, connected and optimised**. On a quiet GPU (taken through the shared GPU-test queue), the full suite passed **157/157** (and again 157/157 in the final regression after the kit changes for Cádiz and Oaxaca; Feria entrance 49 fps, all views 41–61 fps) (`suite_sevilla.js`, Medium, 1536×864, Intel Iris Xe), and every view now runs at **54–60 fps**. The Feria entrance at night, which was the hotspot at 17 fps, now runs at **58.3 fps**, with every decoration still there. The offline network check passes 14/14. Phone emulation is covered by `suite_sevilla_mobile.js`; see Phone below.

**Changes in the optimisation pass:**
- **Distance LOD for house detail.** Balcony railings, rejas, pots, pilasters, awnings, wall lanterns and orange fruit sit in separate 40 m tiles. They are drawn within 85 m on Medium (55 on Low, 130 on High).
- **Signs.** Drawn within 180 m on Medium, in 64 m tiles.
- **Solid tiles past the fog (470 m)** are not drawn.
- **Farolillos** use an 8-triangle shape instead of 80 (about 2,400 of them).
- **Trees** use cheaper canopies below High.
- **NPC density on Medium:** street crowd 40 → 34, Feria crowd 30 → 22, dancing pairs 12 → 8.
- **No new lights.** Lit windows and lanterns are emissive geometry, not lights.

**Other fixes:**
- **Feria de Abril is seasonal, not weekly.** It runs during "the April week", which is the 4th week of every 4-week Apeverse cycle (days 21–27, 49–55, …), 12:00–04:00. It can also be switched by hand: there is a "Feria de Abril: festival mode" panel at the fairground gate, Plaza de Cuba and Plaza Nueva, with Seasonal, On now and Off. The choice is saved in `S.sev.feriaMode`. The phone calendar and gig guide show the next April week.
- **Taxis stay out of pedestrian lanes.**
  - Only 16 streets are car streets (`PLAN.car`): Paseo Colón, the ring, the Arenal, Triana's main streets. Plaza de Cuba and Puerta de Jerez are also open to cars.
  - Pedestrian streets are no longer in the taxi network.
  - A one-line opt-in hook in the shared `js/rides.js` (`W.noCar`) stops the pickup and drop-off legs from entering Santa Cruz lanes, Sierpes, the Avenida or San Jacinto.
  - The suite plans taxi trips into Santa Cruz and checks that they stay on car streets.
- **The kit's check now also finds hidden dead ends.** These are streets that run into a landmark drawn across them. It caught the Calle Judería clipping the Alcázar, which is now rerouted.
- **Agent 3's `AV.snd` is registered.** It is guarded, so it does nothing until their branch merges: rooms for the 4 walk-ins, the tablao venue, bars, market and fountains, and footstep materials.

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
| **Feria de Abril** | Real de la Feria | **Seasonal**: the April week (every 4th Apeverse week), 12:00–04:00, or switched on by hand at the gate, Plaza de Cuba or Plaza Nueva. See below |

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

## Performance (real GPU: Intel Iris Xe, Medium, 1536×864, quiet GPU, after optimisation)

| View | fps | draw calls | triangles | before optimisation (noisy, shared GPU) |
|---|---|---|---|---|
| Arrival (first sample after load) | 54 | 172 | 372k | 15–26 fps, 676k |
| Santa Cruz | 60.4 | 135 | 322k | 52 fps, 513k |
| Mercado de Triana | 60.4 | 152 | 403k | 48 fps, 538k |
| Feria at night, down the Real | 60.4 | 173 | 509k | 43 fps |
| **Feria entrance (portada) at night** | **58.3** | 244 | 512k | **17 fps, 1.17M** |
| Santa Cruz at night | 60 | 80 | 163k | 60 fps |
| Under the Giralda | 60 | 199 | 398k | 45 fps, 742k |
| Calle Sierpes | 60 | 80 | 162k | 60 fps |
| Torre del Oro | 60.5 | 108 | 117k | 48 fps |
| Patio de las Doncellas | 60.5 | 123 | 218k | 50 fps |

- **The frame cap is 60 fps,** so these views show headroom on this laptop, not how much.
- **The before column is noisy.** Those numbers were taken while other agents' GPU tests were running. All runs now go through `tools/tests/gpu_queue.ps1`, which waits for a quiet GPU and holds the shared lock `%TEMP%apeverse_gpu.lock`.
- **Load:** 3.2 s on a quiet GPU (9.2 s before, under contention).
- **Static parts:** about 87k, of which 42k are LOD detail.

## Known limitations

- **Phone:** tested in emulation only (915×412, touch), not on a real phone. These checks passed:
  - detected as a phone, touch controls shown;
  - the joystick walks you; houses and the river stop you; the bridge carries you;
  - you can walk into Casa Fermín and buy with ▶ act;
  - the bar menu (458×363), the portal, Feria-switch and torno panels fit the screen;
  - GPS works;
  - 60 fps in Santa Cruz and at the Feria entrance.

  One check failed because of a test bug (the start point was inside a house). It was fixed and re-run; see `docs/screenshots/sevilla/`.
- **Detail level:** houses are built from boxes. The detail (surrounds, rejas, balconies, cierros, pots, awnings, signs) is dense at street level but blocky up close. The Cathedral and Alcázar are suggestive interpretations, not replicas.
- **Interiors:** only the 4 walk-ins and the Alcázar patios and gardens are enterable. Other shops are walk-up.
- **Feria crowds:** while the fair is on, the crowd uses the city graph, so some festival-goers wander outside the Real.
- **Audio:** uses the shared ambience presets, plus agent 3's `AV.snd` registrations, which are active once `apeverse-2-gameplay-audio` is merged.
- **Screenshots:** in `docs/screenshots/sevilla/` (JPEG), with the suite report alongside.
