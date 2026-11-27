# Astro-9: interconnected-city pass (2.1)

## What changed
- **Two new streets** that close loops through the deck (`js/astro9_streets.js`, table `ST`). The existing
  street-side fill in `astro9_blocks.js` lines them with buildings automatically.
  - **Nebula Market Street** (lane, 8 m): runs west from the end of Hangar Road along the West boulevard. It keeps clear
    of the Astro Inn stall and places no lamp posts on the boulevard, which has its own lights and walking line.
  - **Dockside Loop** (lane, 8 m): runs from the south end of Hangar Road east, then north onto the Hangar path at (−30, 203). It stays north of
    Club Subterra's footprint (x −80..−28, z 236..274). That club sits 30 m underground, but its walls are colliders
    at every height.
- **Streets on the minimap.** Every street segment, except the tiled passages, now goes into `W.mapRoads` (50
  segments). Before, Astro-9 drew only street names.
- **Kepler Arcology pin.** It sat inside the façade collider and could not be reached. It now stands at the
  entrance (128, 171.5).
- **Walking graph (`js/walk_graph.js`, new).** This applies to worlds without a planned street graph, and only
  Astro-9 is enabled. It starts 2.5 s after arrival and builds a 4 m lattice on the real walkable ground:
  - colliders are respected;
  - links run between 8 neighbours, with ramp limits;
  - a fine 0.5 m bridging pass joins narrow doors and stairs the coarse lattice steps over;
  - islands under 12 nodes are dropped;
  - the result becomes `W.mapNav`, so GPS and the pathfinder use it for trips over 220 m.

  The build runs in 3 ms slices per frame and finishes in about 12 s with no stall.

- **Orbit Loop dropped.** A third street, round the Arcology, crossed the Cosmic Temple plaza. Kepler Street already
  reaches the Greenway through that plaza, so the street was removed.

## Measured (suite_astro9_city 23/23, serialised GPU run)
| Measure | Result |
|---|---|
| 1.5 m flood fill: main walkable area | 95 % of walkable ground |
| Named street-level places reachable on foot | 64 of 64 (the sky bridge and Club Subterra are their own levels) |
| Walking graph | 3,172 nodes; 4 components: street level, sky bridge, the club, the undergrid stub |
| Street-level nodes in one network | 98 % |
| Fine bridges | 18 |
| Long routes between districts on real ground | 5 of 5 |
| GPS to the Arcology | works |

## Honest limits
- **Open deck (more than 12 m from any structure):** 33.7 % of the main area, against 34 % before. Outside the
  designed plazas it is 28.9 %. The designed plazas are the Hangar docking pad (r 42), the Cosmic Temple, Alien
  Homes, the Biotech Garden and the Observatory. They stay open on purpose: this pass connects streets rather than
  filling plazas with random blocks.
- **Short GPS trips are slow.** Trips under 220 m still use the grid pathfinder, which shared `pathfind.js`
  decides. The 203 m Bazaar → Arcology trip took about 1.2 s to plan. That behaviour is shared with other worlds
  and was left unchanged.

## Regressions (serialised through the shared GPU lock)
| Suite | Result |
|---|---|
| astro9_city (new) | 23/23 |
| astro9_streets | 99/99 (street count updated to 19) |
| astro9_mega | 25/25 |
| astro9_neon | 38/38 |
| astro9_market | 25/25 |
| astro9_metro | 30/30 |
| astro9_d2 | 23/23 |
| astro9_art | 27/27 |
| minimap | 41/41 |
| lifeplus | 39/39 |
| integration | 138/138 |
| rides | 192/192 |
| gps | 93/94 |

The one gps miss is Astro-9's speed check: 1.3–2.4 s against a 400 ms limit. That check was already failing before
this pass (see the shared pathfinder note above). The neon through rides runs were made before the final street
fixes, which touched only Nebula's paving and lamps and dropped Orbit Loop.
