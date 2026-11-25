# Apeverse progress ledger (cinematic upgrade)

- **Branch:** `apeverse-cinematic-v1`
- **Stable preview:** port 8095. It is untouched; this branch plays on port 8096.
- **Detail per milestone:** `docs/CINEMATIC_V1_PROGRESS.md`

**Completed** means built, tested in the running game, and pushed. **Planned** means not built yet.

## Completed and verified

### Astro-9

- **District 1:**
  - Bazaar as a souk, with textured shopfronts.
  - Food Ring night market.
  - Plaza colonnade.
- **District 2:**
  - Prism Gallery, which you can enter.
  - Mural Alley shortcut.
  - Spray Lab.
  - Characters who chat with each other or look at things.
- **The 12-street connected network:** 8 walking loops, a raised court, a sunken passage, the Skylift ramps and the bridge.
- **Buildings:** 68, in 7 architecture families, with 32 unique signs.
- **Businesses:** 12 you can enter.
- **Map:** shows the street names.
- **Optimisation:**
  - static merge pass
  - character detail tiers
  - neighbourhood streaming
  - Medium measured at 58–60 FPS plugged in

### Pai

- **Walking Street:** six shophouse styles, plants, shelves and a new street surface.
- **Signs:** 21 unique signs with Thai lettering.
- **Night market:** food carts with Thai menus.
- **Overhead wiring:** utility poles and cable bundles.
- **Countryside:** rice paddies with dikes, the field hut, six rentable riverside bungalows, and bamboo and banana groves.
- **Fixed:** the long-blocked river-lane route.

### Characters and performance

- **Crowd sculpt level:** background street people use a coarser body mesh (−30% to −40% triangles); faces and named characters keep full detail.
- **Character caps:** limits on how many characters get full or body detail at once.
- **Crowd density:** visible-crowd caps, and saner numbers in Pai.
- **Vegetation:** bigger chunks on Low and Medium (fewer draw calls in every world).

### Vienna

- **Viennese buildings** on every street side of the perimeter blocks:
  - 4 façade styles
  - 24 unique shops with gold-lettered portals
  - mansard roofs and dormers
  - copper-domed corner towers
  - wrought-iron balconies
- **Street furniture:** Litfaßsäulen, and lamps hung on cables across the side streets.
- **Café Zuckerl**, an enterable Kaffeehaus:
  - order a Melange, Apfelstrudel or torte
  - read the newspapers
  - a waiter and guests
- **Verified by** `suite_vienna` (22/22) and real-GPU FPS (`suite_vienna_fps`).

- **City fabric (7b):**
  - the Ringstraße lined with monumental buildings
  - Innere Stadt lanes
  - a city-wide grid of perimeter blocks across 9 named neighbourhoods (about 57 blocks plus 12 Ring buildings, 2.5× before)
  - sidewalks with kerbs and small squares
  - neighbourhood labels on the map
  - 4 cross-neighbourhood walks verified

- **Innere Stadt (7c):**
  - Kärntner Straße (continuous street walls, shops, hanging signs)
  - Graben with the Pestsäule
  - Hofburg with Heldenplatz
  - Staatsoper
  - 16 Nasenschilder
  - granite pedestrian paving

- **Ring tram line (7d):**
  - tracks in a stone bed
  - catenary poles and contact wires
  - 4 named stops with shelters, signs and waiting passengers
  - the rideable Ring tram is unchanged and verified

- **Streets and side lanes (7e):**
  - 3 Durchgang courtyards (gateway, tree, bench, bikes; reachable on foot)
  - 3 Neubau Gassen
  - 84 street-name plaques, 9 bike racks, 11 bins
  - 76 parked cars on the radials outside the Ring
  - zebra crossings at the tram stops
  - no clutter on pedestrian streets, lanes or gateways

- **Neighbourhood looks, lighting, haze (7f):**
  - per-district palettes and roofs: Biedermeier gables, Gemeindebau flat roofs with inscriptions, Jugendstil friezes
  - lamp posts in 8 outer neighbourhoods, plus night light pools
  - a city beyond the map (suburbs, spires, Danube tower, Wienerwald) and Madrid-like fog, replacing the white empty horizon
  - suite 76/76

### Chiang Mai

- **Street layout, verified in the game:** Giant Hostel and Big Blues face each other across the road; CHAT is 64 m from the hostel, and Pineapple Express is 147 m.

### Test tools

- **FPS:** real-GPU measurement (`-Gpu`).
- **Cost attribution:** a GPU cost-attribution step that hides one category at a time.
- **Route checks:** the Pai route check reports what blocks each failing point.

### M1 fixes (expansion branch)

- **Pinar avenue and Pai north-route blocks:** root cause was the Wandering Market's seed-random props. Fixed and proven under 6 seeds.
- **Pai night:** the street lamps no longer light the street like day.
- **Street clutter:** stands against walls with walkway clearance. No flowers on Vienna's streets.
- **Save safety:** sandbox key for tests, a session backup with fallback, and no invalid writes.
- **Calmer NPCs:** rare waving, browsing, longer pauses.

### M6 clothing stores (expansion branch)

- **Catalogue:** 43 designs, 4 brands (APEVERSE, MOONMELT SUPPLY CO., SOLTERRA, ZtonedApe).
- **Stores:** 4 enterable stores (Ape Town, Pai, Madrid, Jungle Dub) with racks, mannequin, staff, and a fitting-room mirror showing Ztonedape in the try-on.
- **Wearing:** real chest prints on garments; buy, wear and save.
- **Townsfolk:** about 9.5% of them wear designs.
- **Fixed:** the shared shop panel was off-screen for every shop.
- **Open:** SWAG has no artwork; 2 SOLVERA-lettered designs are held; the sheet designs need full-resolution masters. See docs/MERCH.md.

### M7 driving (apeverse-2-living-worlds branch)

- **Madrid dealer:** buy and own a scooter (350) or a car (1200).
- **Garage (Y):** locate, valet, repaint, sell.
- **Camera and lights:** chase camera (C), headlights, brake lights.
- **Collision:** respects vehicle length (the car nose no longer enters walls).
- **GPS:** guidance bar on the street graph.
- **Persistence:** across saves, days and worlds.
- **Tests:** suite_drive 39/39; suite_vehicles 52/52.
- **Not done:** traffic lights, pedestrian-aware NPC traffic, damage. See docs/DRIVING.md.

### M8 housing (apeverse-2-living-worlds branch)

- **The flat:** Piso 2B in Pinar, rent (140 for 7 days) or buy (3000), with an enterable flat.
- **Furnishing:** a 19-piece furniture shop, gaze placement (fit rules), and move / rotate / store.
- **Customising:** 8 wall colours and 4 floors.
- **Using it:** sleep and respawn, a wardrobe (wears M6 clothes), and a record player that only offers records whose files exist and confirms real playback.
- **Persistence:** everything saved; furniture is kept when rent expires.
- **Tests:** suite_home 61/61.
- **Fixed alongside:** the garage hotkey G was shadowed by graphics quality, so the garage moved to Y.

## Measured but not proven

- **Vienna 7f FPS:** battery only, A/B/A, no regression against 7e; it needs a plugged-in confirmation.
- **Vienna 7e FPS:** measured on battery only (A/B/A). It is within noise of 7d, with about 40 more draw calls on Kärntner Straße. It still needs a plugged-in re-measure.
- **FPS gain in Pai after the optimisation:** draw calls and triangles dropped. FPS stayed within the laptop's thermal drift, which was up to 17 FPS between identical runs.

## Open issues

- **suite_play, pre-existing (also failing on the M0 and M1 commits):** "Chiang Mai court: court floor is walkable" and "casual three-pointer goes in".

- **Astro-9 megacity "hover-lane crossing" (reported 24/25):** not reproduced in 6 runs across 3 builds. The route checks now name what blocks each point.


## Planned (not built yet)

- **Pai:**
  - more distinct businesses and building variety off Walking Street
  - a mountain road with viewpoints
  - believable daily routines for the NPCs
  - Paradise Circus fire show polish
- **Astro-9:** districts beyond the 12 streets, richer interiors, and more varied alien NPC behaviour.
- **Vienna (still to do):**
  - neighbourhood identities (Naschmarkt stalls, Ringstraße palaces; Spittelberg lanes started in 7e)
  - Mariahilfer Straße and Favoriten are still sparse (few blocks); Landstraße has no regular blocks
  - landmarks: Rathaus, Parliament, a better Hofburg statue
  - more enterable shops and a Heuriger
  - NPC daily routines
- **Da Nang and Chiang Mai:** a street-detail pass.
- **NPC routines across worlds:** customers visit shops, vendors work their stalls, nightlife busier at night.
