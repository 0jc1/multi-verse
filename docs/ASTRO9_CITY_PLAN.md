# Astro-9: Living Megacity plan

## Goal

You start on Neon Boulevard, turn into a narrow side street, find an odd shop, cross another block, reach a different neighbourhood, and walk back. No teleport is needed at any point. This plan is the work order for doing that one neighbourhood at a time on `apeverse-cinematic-v1`.

## 1. What exists today

Coordinates: +x is east, +z is south, and 1 unit is 1 m.

```
                      STATION / Club Graviton  (-60..60, -60..50)
                                 |
                        boulevard x -5..5, z 24..72
                                 |
 HOMES  (-180,150) ...WEST street... BAZAAR ==== (PLAZA 0,94) ==== FOOD RING ==== NEON BOULEVARD (92..262, 84..106) ---- Sky Market (230,56, y 30)
     |  x -262..-98            x -98..-20      |                x 20..92  \           |  Black Market alley (196..202, z 72..84)
 path x -180                                   |                Mural Alley           |  Biotech path x 180
                                     ART AVENUE x -7..7, z 112..200                   BIOTECH (180,150)
                                   Prism Gallery / Cinema 9 / Orbit Lounge
 HANGAR (-158,212) ==== HPATH z 196..206 ==== GLASSOPY (0,214) ==== TPATH z 196..206 ==== TEMPLE (152,212)
                         Club Subterra underground (-80..-28, 236..274)
```

The problem is that the network is a tree: one spine, with every district a dead-end spur off it. The only loops are the plaza itself and the new Mural Alley. Most of the area between the spurs is not walkable; it holds skyline towers you can never reach.

## 2. Target street network

The network adds new routes in three widths:
- **Roads:** 10–14 m.
- **Lanes:** 5–8 m.
- **Alleys and passages:** 3–4 m.

Together they close loops, so every neighbourhood has at least two ways in.

| # | Street | Type / width | From → to | Neighbourhood |
|---|---|---|---|---|
| S1 | **Kepler Street** (gently curved) | road 12 m | Neon Blvd at the x 125 crossing → south to TPATH (125, 196) | east loop spine |
| S2 | **Ring Lane** | lane 8 m | Art Avenue (x 7, z 172) → Kepler St → Biotech garden edge (x 150) | crosses the south-east blocks |
| S3 | **Coil Street** (S-curve) | lane 7 m | Neon Blvd (x 160) → Ring Lane | Residential Terraces |
| S4 | **Terrace Steps** | passage 4 m, with stairs to a raised court (y 3) | Coil St ↔ Kepler St | Residential Terraces |
| S5 | **Undergrid Row** | alley 4–5 m | Ring Lane → TPATH (x 60–110), with a sunken section (y −3) and a covered passage | The Undergrid |
| S6 | **Gutter Lane** and **Fuse Court** | alley 3.5 m + courtyard | Undergrid Row ↔ Kepler St | The Undergrid |
| S7 | **Greenway** (curved) | lane 6 m | Biotech garden → Temple (152, 212) | Biotech Quarter |
| S8 | **Sporeline Passage** | alley 4 m, under a living arch | Neon Blvd (x 210) → Biotech garden | Biotech Quarter |
| S9 | **Souk Lanes** (two crooked lanes) | alleys 3–4 m | Bazaar north shops ↔ the boulevard (x −5) and the WEST street | Alien Bazaar |
| S10 | **Terrace Street** (west) | lane 8 m | Alien Homes → Cinema 9 back (x −34) → Art Avenue via a covered passage | Residential Terraces (west) |
| S11 | **Hangar Road** | road 10 m | WEST street (x −120) → south to HPATH | industrial edge |
| S12 | **Sky Walk** | elevated walkway at y 12, with stairs and a lift at each end | Residential Terraces roof → Neon Blvd → Sky Market (y 30) via ramps | Sky District |

Junctions get zebra crossings, kerbs, drains and manholes, and corner buildings. Tactile paving goes at the crossings. Narrow streets are dark on purpose, with few lights and no glowing façades. Roads keep a clear hover lane for taxis, scooters and hover bikes. Alleys are walking only, and props stay against the walls.

## 3. Neighbourhood identities

| Neighbourhood | Where | Architecture | Life |
|---|---|---|---|
| **Neon Boulevard** (done) | x 92–262 | tall towers, spectacular signs | ramen, synth, tech, robot shops |
| **The Undergrid** | x 40–120, z 170–200 | 2–3 storey weathered blocks, pipes, roll-up shutters, dark | robot repair, dumpling counter, odd-relic shop, underground club door, graffiti |
| **Alien Bazaar** | Bazaar + Souk Lanes | dense stalls, canopies, floating lanterns | tech junk, food, collectors |
| **Biotech Quarter** | around (180, 150) → Temple | organic shells, living façades, giant plants | botanical lab, seed shop, tea house |
| **Residential Terraces** | x 120–200, z 106–170, and west Terrace St | medium apartments with balconies, roof gardens, external stairs | corner café, laundromat, rentable room, neighbours |
| **Sky District** | Sky Market + Sky Walk | bridges, suspended pods, observation decks | sky market, viewpoint |
| **Arts quarter** (done) | Art Avenue | gallery, murals | Prism Gallery, Spray Lab, Cinema 9, Orbit Lounge |

## 4. Technical approach (performance first)

- **One street module, `js/astro9_streets.js`.** It holds the network as data: segments with polylines (straight or curved), widths and types. It provides:
  - `surface()` and `reserve()`, so other modules stop scattering towers and trees onto roads
  - road, sidewalk and kerb meshes (one merged mesh per material, world-UV textures)
  - automatic crossings at junctions
  - street-name signs
  - the street list for the map
- **Block kit, `js/astro9_blocks.js`.** It builds parametric buildings with 6–8 architecture families:
  - weathered low-rise, apartment slab, curved organic, modular stack, megastructure, kiosk
  - per-building variation: storeys, setbacks, balcony rhythm, roof machinery, exterior stairs
  - several façade texture atlases, with window cells that show room interiors
  - merging per block (not per city), so frustum culling still works
- **District streaming.** Each neighbourhood is its own group. Its detail layer is hidden beyond about 160 m (Medium) and replaced by its silhouette. Lights stay under the existing light budget.
- **Crowds stay moderate.** Characters sit, talk, look at things, or work (the 'chat' and 'look' modes added for Art Avenue), rather than wandering at random.

## 5. Map

The full map (`AV.minimap` atlas) gains:
- zoom
- named streets, drawn from the street data
- district labels and businesses
- the player's location

## 6. Order of work

Each step is tested for walking routes, doors, interactions and draw calls, screenshotted, committed and pushed.

1. **N1, the network.** S1, S2, S3, S5 and S7 as real streets, plus `reserve()` and map names. This closes the first loops.
2. **N2, The Undergrid** (S5, S6). Buildings, shops, one enterable workshop, the underground club entrance, a hidden discovery.
3. **N3, Residential Terraces** (S3, S4, S10). Apartments with balconies, a rentable room, a corner café, a laundromat.
4. **N4, Biotech Quarter** (S7, S8). Organic buildings, a lab interior, giant plants.
5. **N5, Alien Bazaar lanes** (S9) and **Hangar Road** (S11).
6. **N6, Sky District** (S12). Elevated walkways, stairs and lifts.
7. **N7, a map pass and a full walking tour test.** Boulevard → side street → shop → another block → another neighbourhood → back.
