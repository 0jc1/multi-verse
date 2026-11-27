# Oaxaca: the historic centre (agent 4, world id `oaxaca`)

## Verdict

Oaxaca de Juárez is **playable and connected**, with Día de Muertos. The release gate is `suite_oaxaca.js` on the real GPU (Medium, 1536×864), run through the shared GPU queue: **81/83**. The two open items are below. The offline network check passes 12/12.

## The map

- **The grid, kept honest but not repetitive.** Oaxaca's centre really is a colonial grid, so the grid stays. It is broken by:
  - the Zócalo (laurels, the bandstand) and the Alameda de León;
  - the Cathedral and the Palacio de Gobierno's arcade;
  - two walk-through markets (Benito Juárez; 20 de Noviembre with its grill-smoke aisle);
  - Santo Domingo with its atrium of agaves and the garden of organ cacti;
  - El Llano park;
  - seven mid-block callejones, one of them an intentional dead end at a courtyard of bougainvillea;
  - a gentle wobble on every street.
- **Andador Macedonio Alcalá:** the pedestrian street from the Cathedral to Santo Domingo, with galleries, the mezcalería and the textiles shop. It gets its frontage before the cross streets.
- **Barrio Jalatlaco**, east of the Calzada de la República: organic cobbled lanes, about 20 murals of calaveras, jaguars and alebrijes on its walls, Plaza de San Matías.
- **The Cerro del Fortín:** a real hill, 26 m, climbed by the escalinata or a winding road to the Guelaguetza auditorium's white canopy, with a view over the valley.
- **The Panteón General:** a walled cemetery of arched niches, tomb rows and a chapel.
- **Architecture:** low colonial houses (1–2 storeys) with thick walls in strong colours (terracotta, cobalt, mustard, pink, turquoise, lime), green cantera surrounds, iron rejas, flat roofs with parapets. Churches are in green cantera with mustard-tiled domes.

## Things to do

| What | Details |
|---|---|
| **Mezcalería El Gusano Feliz** (walk-in, Alcalá) | Mezcal (a besitos), tejate, chapulines; **live son istmeño and marimba from 20:00** |
| **Chocolatería La Molienda** (walk-in) | Chocolate ground on the metate, mole negro, pan de muerto |
| **Textiles de Teotitlán** (walk-in, Alcalá) | Wool rugs dyed with cochineal and indigo, huipiles |
| Walk-up shops | Taller de Alebrijes Don Pancho (Jalatlaco), Galería Monte Albán, Café Pluma, Panadería La Soledad |
| Markets | 12 stalls: chapulines, mole, chocolate, mezcal, textiles, flowers and candles, tasajo on the grill, tlayudas, pan, nieves, fruit |
| Night stalls | Tlayudas Doña Chela after 18:00; Nieves de la Soledad |
| The bandstand | A banda plays every evening 18:00–21:00 (+music rep) |
| Cerro del Fortín | The viewpoint at the top |
| People | Doña Rosa (builds the family altar), Mateo (mezcalero), Itzel (weaver), Don Pancho (alebrije carver), Lupita (trumpet in the banda); crowds, market vendors, café regulars, cars and bikes on the Calzada |
| Mission | "La ofrenda de Doña Rosa": cempasúchil, pan de muerto, chocolate |
| Discoveries | 5 hidden ones |

## Día de Muertos (seasonal, not weekly)

- **When it runs:** week 3 of every 4-week Apeverse cycle, 16:00–05:00.
- **Manual switch:** a "Día de Muertos: festival mode" panel at the Zócalo, Santo Domingo and San Matías.
- **What changes:**
  - papel picado over Alcalá, Independencia, García Vigil, Cinco de Mayo and Jalatlaco;
  - five marigold ofrendas (leave a candle);
  - sand carpets in the Zócalo and the atrium;
  - candles on the graves and families keeping vigil in the Panteón at night;
  - **the comparsa (muerteada)** parading round the Zócalo and up Alcalá behind its brass, which you can join;
  - catrina face paint;
  - brass in the ambience.

## Performance

Real GPU (Intel Iris Xe), Medium, 1536×864, quiet GPU, final run:

| View | fps | draw calls | triangles |
|---|---|---|---|
| Zócalo (arrival) | 57.2 | 149 | 175k |
| Andador Alcalá | 45.6 | 107 | 120k |
| From the Cerro del Fortín | 57.5 | 167 | 191k |
| Jalatlaco murals | 53 | 89 | 183k |
| Alcalá in Día de Muertos | 60.4 | 136 | 255k |
| The Panteón at night | 60.4 | 125 | 335k |

- **Load:** 3.9 s.
- **Static parts:** about 32k.

**Open items (the 2 failing checks):**
- **The Chocolatería La Molienda doorway** stops the test walker partway in. You can still shop at its counter, and the mission that needs its chocolate passed. A probe is tracing which prop blocks the doorway.
- **A second, small walking-graph component.** The raster reach is still 100%: every bit of ground is physically reachable. Most likely it is the same chocolatería interior.

## Known limitations

- **Crowds on the hill:** crowd NPCs keep to the flat town, because crowd actors don't follow terrain height. Only the player and named residents climb the Fortín.
- **Monte Albán:** not included. It would be a separate region.
- **Future links:** the brief's links to San José del Pacífico and the Pacific coast are not started.
- **Phone:** not yet tested on phone emulation for Oaxaca.
- **Audio:** agent 3's `AV.snd` registrations are inactive until `apeverse-2-gameplay-audio` is merged.
