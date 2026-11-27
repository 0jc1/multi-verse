# Cádiz: the old town on its peninsula (agent 4, world id `cadiz`)

## Verdict

Cádiz is **playable and connected**: the whole old town, with the sea on three sides, the land walls on the fourth, and Carnaval. The release gate is `suite_cadiz.js` on the real GPU (Medium, 1536×864, Intel Iris Xe), run through the shared GPU queue: **108/108 passed**. The offline network check passes 13/13.

Built entirely on the reusable city dresser (`js/gw_city.js`) and the street-network kit (`js/gw_kit.js`).

## The map (compressed: 1 m ≈ 0.6 real m; north is −z)

- **The sea ring.** You can walk all the way round on a paved promenade and seawall:
  - Alameda Apodaca along the bay;
  - the port quay;
  - Campo del Sur along the Atlantic, with its row of brightly painted façades facing the sea;
  - La Caleta's sand cove between the two castles;
  - Parque Genovés.
- **The land side.** The neck is closed by the land walls and the Puerta de Tierra; you walk through its arches to Plaza de la Constitución and back along the port.
- **Inside:**
  - the 18th-century grid of narrow streets that end in sea light: Calle Ancha, Sacramento, Columela, San Francisco, Nueva, Rosario, Sagasta;
  - its plazas: San Antonio, Mina, las Flores, San Juan de Dios, la Catedral, Fragela;
  - the Mercado Central (a colonnade round the hall, six stalls);
  - El Pópulo (medieval arches, the Roman theatre);
  - La Viña (fishermen's lanes and taverns, Carnival's heart);
  - one intentional dead end: the Callejón del Tinte, which ends at a patio door.
- **Landmarks:**
  - the Cathedral (golden-tiled dome, two towers);
  - Torre Tavira (camera obscura);
  - the Ayuntamiento;
  - Gran Teatro Falla (neo-mudéjar brick);
  - the Roman theatre's cavea;
  - the land walls;
  - Santa Catalina's star fort (walk into its courtyard);
  - the causeway out to the Castillo de San Sebastián and its lighthouse;
  - the Balneario de la Palma on stilts at the edge of the beach.
- **Architecture:** tall merchant houses (3–4 floors) in sea-faded pastels and white, shell-stone (ostionera) trims, glazed cierros, flat azoteas crowned with **torres miradores**. La Viña is lower and whiter with blue and red plinths; El Pópulo is in old stone; Campo del Sur is in bright colours. Plaza floors are black-and-white marble.
- **Scale:**
  - about 820 houses, about 370 of them with Spanish shopfronts;
  - 10 unique businesses, 4 of them walk-ins;
  - about 780 sign quads;
  - Calle Ancha and Columela are the shopping streets.

## Connectivity

- **Walking graph:** 1 component, about 1,335 nodes.
- **Reachability:** 100% of the walkable ground is reachable from San Juan de Dios.
- **Dead ends:** no accidental dead ends, including hidden ones where a street runs into a landmark. The only one is the Callejón del Tinte, which is intentional.
- **Map edge:** no walkable ground at the map edge.
- **Landmark routes:** 8 landmark pairs, each routed by the GPS and each with an alternative route. The longest is San Juan de Dios → La Caleta, about 570 m.
- **Walked like a player:** San Juan de Dios → Arco del Pópulo → Plaza de la Catedral → Campo del Sur → La Viña → the beach → the causeway → San Sebastián.
- **Solid and walkable where they should be:** the sea is water; the walls are solid and the gate open; the causeway is walkable; La Caleta is sand.

## Things to do

| What | Details |
|---|---|
| **Freiduría La Caleta** (walk-in, Plaza de las Flores) | Carmen's paper cones of pescaíto, tortillitas de camarones |
| **Taberna La Sardina** (walk-in, La Viña) | Vino de Chiclana from the barrel, manzanilla, chicharrones |
| **Disfraces Er Tipo** (walk-in, Calle Ancha) | Chirigota costumes, masks, wigs, kazoos (pitos), confetti |
| **Peña Flamenca La Perla** (walk-in, Campo del Sur) | Cante every night from 21:00; chirigota rehearsals; a bar |
| Walk-up shops | Confitería El Pópulo (pan de Cádiz, tocino de cielo), Heladería Er Barquillo, Ostionería El Puertito (ostiones, erizos), Librería La Caleta, Almacenes La Gaditana, Café El Faro |
| Mercado Central | Six stalls: fish, shellfish and urchins, fruit, chicharrones, olives, flowers and confetti |
| Torre Tavira | The camera obscura (a ticket shows the live city on a dish) |
| La Caleta | Swim (+energy); at sunset everybody claps; the chiringuito; a boat out to San Sebastián with Rafa |
| Getting around | Public bikes at San Juan de Dios; taxis (cars keep to the ring road, the port and the land side; never La Viña or El Pópulo lanes) |
| People | Pepe (chirigota author), Carmen, Juanma (fisherman), Luz (Torre Tavira guide), Rafa (surfer), each with a daily routine and 4 conversation choices; crowds, café regulars, sunbathers, market stall-holders, cars, cyclists |
| Missions | "La letra perdida" (find Pepe's lyric sheet at Torre Tavira); in Carnival, "Disfrázate" (wear a costume and join a chirigota) |
| Discoveries | 5 hidden ones: the torres miradores, the callejón, the Roman theatre, the causeway at high tide, Genovés' giant ficus |

## Carnaval de Cádiz (seasonal, not weekly)

- **When it runs:** the Carnival week, week 2 of every 4-week Apeverse cycle (days 7–13, 35–41, …), 12:00–04:00.
- **Manual switch:** a "Carnaval de Cádiz: festival mode" panel at San Juan de Dios, Plaza de San Antonio and La Viña, with Seasonal, Start now and Off. The choice is saved in `S.cad.carnMode`.
- **What changes:**
  - bunting across La Viña, Columela, Ancha and Sagasta;
  - serpentinas and confetti;
  - a stage on Plaza de San Antonio, solid only during Carnival, with a comparsa singing;
  - three street chirigotas in matching costumes, singing original comic lines;
  - the **carrusel de coros**: a choir riding a decorated cart round the Mercado;
  - costumed crowds;
  - kazoos and bombo in the ambience.

## Performance

Real GPU (Intel Iris Xe), Medium, 1536×864, quiet GPU through the queue, final run:

| View | fps | draw calls | triangles |
|---|---|---|---|
| Arrival, San Juan de Dios | 51.2 | 149 | 351k |
| Campo del Sur (towards the Cathedral) | 51.6 | 124 | 312k |
| La Viña | 59 | 116 | 274k |
| La Caleta + the Balneario | 51.5 | 92 | 136k |
| Columela + Torre Tavira | 53 | 111 | 250k |
| **La Viña in Carnival** | 60.4 | 106 | 248k |
| The Cathedral dome at night | 52 | 110 | 215k |

- **Load:** 2.7–6 s (build about 1 s).
- **Static parts:** about 50k, of which 20k are distance-LOD detail.
- **Earlier runs:** one shared its Chrome with another runner and was discarded. That is how the atomic GPU lock came about.

## Known limitations

- **Detail level:** houses are box-built, dense at street level but blocky up close. The Cathedral and castles are interpretations, not replicas.
- **Interiors:** the Cathedral and Gran Teatro Falla have no interiors.
- **Phone:** not yet tested on phone emulation for Cádiz (Sevilla was).
- **Boat:** the boat goes out to the castle and back on the seaward side; it doesn't circle it, because the causeway connects it to the shore.
- **Audio:** agent 3's `AV.snd` registrations (rooms, the peña venue, market) are inactive until `apeverse-2-gameplay-audio` is merged.
