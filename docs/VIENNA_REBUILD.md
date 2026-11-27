# Vienna: the full rebuild (Apeverse 2.1 corrective pass)

The owner asked for the city outside the Ringstraße to become a dense, connected miniature Vienna, built street network first, with Madrid as the quality reference.

**Kept as they were:**
- every landmark and its plot (Stephansplatz and the cathedral, Kärntner Straße, the Graben, the Hofburg, the Staatsoper, Karlsplatz, Naschmarkt, Stadtpark, Belvedere, Schönbrunn, the Prater, the Christmas market, the Memory Zone, Kahlenberg, the 22nd district);
- the bars (Waxy's, Lukas, Don's) and their storefronts;
- the Würstel Stand, Flex, Café Zuckerl, the NPCs and residents;
- the Ring tram (its track touches no building);
- the U-Bahn, and the arrival at the south end of Kärntner Straße.

**Code:**
- `js/vienna_city.js`: the street plan and the blocks.
- `js/vienna_shops.js`: the neighbourhood businesses.
- `js/storefront.js`: new styles.
- `js/world_vienna.js`: the bounds, wiring, and the map and GPS data.

**Test:** `tools/tests/suite_vienna_city.js`.

## How it is built

**1. The map grows.** It goes from 380 × 300 m to 520 × 430 m.
- Every landmark keeps its coordinates.
- The old 7a grid still draws its random numbers over the old bounds, so everything placed after it stays where it was.
- The skyline backdrop moves out, and the Danube water plane is longer.
- Two new districts:
  - **Ottakring** (west): workers' Gemeindebau, the brewery.
  - **Währing** (north): lower villa streets with Jugendstil trim.

**2. The street network is planned first.** One orthogonal grid, as in Vienna's Gründerzeit districts:
- **Grid:** lines every 34 m (x) and 28 m (z), aligned so the main streets (every third line, 10 m wide) run on the south and west radial avenues. Side streets are 7 m.
- **Clipping:** each line is kept only where it runs on real city ground. That means no water, no landmark plot, no hill, and outside the Ring zone.
- **The Lastenstraße:** the district streets stop at a second ring road 25 m outside the Ring, behind the Ringstraße palaces. Vienna has this road too (the "2er-Linie"). The palaces keep their band, and the gaps between them join the Ring's sidewalk to the Lastenstraße (41 links).
- **The walking network** joins all of these:
  - the streets and their crossings;
  - both Ring sidewalks, with zebras at the tram stops;
  - the radial avenues;
  - perimeter streets round every landmark plot;
  - quays along the Donaukanal and the Danube;
  - the bridges, including a path through the 22nd-district campus from the Danube bridges;
  - the Gassen through blocks.
- **Welding:** nodes that touch become one crossing. Dead ends are joined to the nearest node within reach along a clear line.
- **Result (measured):**
  - 89 street runs, 8.1 km of street;
  - 2,849 walking nodes, **one connected component (100%)**;
  - **2 dead ends**, both deliberate: the avenue ending at the Kahlenberg viewpoint, and a short landing stub inside the 22nd-district campus.
- **Where it is used:** the network is the world's `mapNav`, so the GPS and pathfinder use it for long trips, and its streets are on the minimap.

**3. Blocks fill the cells between the streets.** Every street is continuous, and every block faces its streets.
- **Full cells** become perimeter blocks with courtyards, using the existing block builder: facades by neighbourhood look, sidewalks, kerbs, street-name plates, lamps, bike racks.
- **Gassen:** every third block is split by a Gasse, a pedestrian passage through the block with cobbles and wall lanterns (16 in all).
- **Squares:** every seventh is a small square with a fountain, trees and benches.
- **Cut cells:** a cell cut by a radial avenue or a park edge gets fitted lots. They are found on a 1.5 m grid, up to four per cell, so buildings step along the avenue.
- **Result:** 119 blocks (57 before), 11 districts.

**4. Neighbourhood businesses.** There are 15, each on a block face along a main street, with a storefront in its own style and a working counter. All are fictional.

| Business | District | Style | Sells |
|---|---|---|---|
| Konditorei Haas | Leopoldstadt | café | Melange, Apfelstrudel, chocolate torte |
| Blumen Rosa | Leopoldstadt | florist | peonies |
| Café Lange | Josefstadt | Kaffeehaus | Melange, torte, newspaper |
| Groove Dealers Wien | Neubau | neon (brand) | LP, boombox |
| SWAG Wien | Mariahilf | brand | opens the SWAG shop |
| ApePhone Store Wien | Mariahilf | brand | skins, lens |
| Apotheke zum Hirschen | Alsergrund | pharmacy, red "A" | herbal tea |
| Bäckerei Kornfeld | Brigittenau | bakery | Kaisersemmel, Vanillekipferl, Melange |
| Beisl Zum Grünen Anker | Landstraße | Beisl | goulash, Märzen, Kracherl |
| Monkey Brew Bierhaus | Landstraße | pub (brand) | Jungle IPA, Banana Ale, kombucha |
| Brauerei Ottawerk | Ottakring | brewery | Märzen |
| Heuriger Zum Weinberg | Währing | Heuriger | Brettljause, Gespritzter |
| Eissalon Venezia | Favoriten | ice cream | two scoops |
| Tabak Trafik 7 | Favoriten | Trafik | newspaper, Kracherl |
| Buchhandlung Seitenwind | Wieden | bookshop | Vienna novel |

Wieden is almost all landmark plots, so its bookshop sits in the nearest free block.

## Measured (`suite_vienna_city`, 47/47 checks)

- **Network:** one component; 2 dead ends; 119 blocks; 16 Gassen; 4 squares; 5 Ringstraße palaces; 41 Ring-to-Lastenstraße links.
- **Walking:** 16 of 16 sampled street segments walked end to end with collisions, without getting stuck.
- **Free ground:** 98% or more of the walking nodes are on it.
- **Routes:** 14 of 15 cross-district routes between businesses were found on real ground, within 2.4 times the straight-line distance plus 30 m.
- **GPS:** the waypoint to the Heuriger follows the streets.
- **Businesses:** 6 counters bought from (strudel, Semmel, Gespritzter, Jungle IPA, ice cream, tea); SWAG Wien opens the SWAG shop.
- **Empty city ground:** 27.6% of samples are more than 14 m from any building, counted outside parks, water, the hill and the Ring.
- **Load time:** about 5 s on this laptop (a 2.4 s world build).
  - **City-life routes:** the errand walkers route on the street graph now (the pathfinder peaked at 15.5 ms), so arrival no longer stalls on 200 ms route searches.
  - **Signs:** the 15 neighbourhood storefronts paint their signs at half resolution.

**Frame rate: not judged.** The last runs came after several hours of back-to-back GPU tests. As a control, Amsterdam's Damrak measured 23 fps with only 84 draw calls, against 60 fps earlier the same day, so the laptop was throttled. In Vienna the frame rate stayed at 25–28 fps whether the new storefronts, the crowd, the district blocks or the whole city were shown or hidden. The new content isn't the cost, but a clean frame-rate measurement still has to be done.

## Not done yet

- **No mobile check or human playtest.**
- **Traffic:** car traffic still runs only on the Ring (the trams and bicycles); the new streets have parked cars on the radials only.
- **Shop interiors:** the 15 businesses are storefronts with counters; none can be walked into.
- **Empty ground:** about 28% of city ground is still more than 14 m from a building. Most of it is the wide carriageways and the edges against the landmark plots and the water.
