# Apeverse progress ledger (cinematic upgrade)

- **Branch:** `apeverse-cinematic-v1`
- **Stable preview:** port 8095. It is untouched; this branch plays on port 8096.
- **Detail per milestone:** `docs/CINEMATIC_V1_PROGRESS.md`

**Completed** means built, tested in the running game, and pushed. **Planned** means not built yet.

## 2.1 open failures and gaps (read first)

Full board: `docs/APEVERSE_21_STATUS.md`.

- **Da Nang and Judean Desert:** no fictional effects item, by design under the local rules (alcohol only). Needs the owner's OK.
- **Verdalux:** no hired ride, on purpose (a 3-place walking moon).
- **Madrid's Pinar barrio streets** aren't connected to the main road map, so the taxi waits on the main street.
- **Pre-existing test failures:**
  - `suite_gfx`: 4 failures.
  - `suite_pai`: "ambience stops outside Pai" (stale since M13).
  - `suite_jlm`: written for an older runner interface, so it can't run.
- **Performance:** at arrival on Medium, Ape Town draws 687 calls at 39 fps and Da Nang runs at 30 fps.
- **Brand District:** built (pilot). Not built yet: the local signage pass in existing worlds, and Amsterdam. Priorities are in `docs/APEVERSE_21_PRIORITIES.md`.

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

### M9 player business (apeverse-2-living-worlds branch)

- **Premises:** lease or buy a commercial unit in Malasaña and turn it into your own clothing shop.
- **Running it:** name and sign; products from the catalogue or your design studio, bought wholesale and priced by you; staff; opening hours.
- **Customers:** hourly price-sensitive demand, plus visible customers who buy at the counter.
- **Books and extras:** a ledger, upgrades, and a bounded 24 h catch-up.
- **Tests:** suite_biz 46/46.
- **Measured but not proven:** FPS 43 in the shop on battery.

### M7C traffic (apeverse-2-living-worlds branch)

- **Network:** Madrid street-grid traffic with right-hand lanes and traffic lights at 354 junctions, drawn near you.
- **Behaviour:** cars follow, queue, stop at red, turn, and stop for you and for pedestrians.
- **Interaction:** traffic is solid for your car and streams around you.
- **Old traffic:** the looping avenue traffic is retired in Madrid.
- **Tests:** suite_traffic 26/26.

### M11 living NPCs (apeverse-2-living-worlds branch)

- **Residents:** ten named Madrid residents (`js/residents.js`) with homes, workplaces and daily schedules. They walk the barrio on a grid A* plus the city pedestrian graph, and are simulated when far away.
- **Relationships:** memory and friendship, context dialogue that notices your outfit, shop, flat and car, tips, favours and tapas invitations.
- **Hooks:** hire Dani or Inés into your shop; recruit Kofi for your band.
- **Reputation and panel:** reputation `{barrio, business, music}`; People panel on Z.
- **Save:** new optional fields `npcs`, `rep`, `band`.
- **Tests:** suite_npc 84/84 (real GPU only: headless is too slow for walking). Full regression green.

### M10 music + bands (apeverse-2-living-worlds branch)

- **Catalogue:** `tools/music_catalog.mjs` catalogues the owner's local library into gitignored `local/` and restores the 16 missing playlist originals by exact name. Copied audio is gitignored and never committed.
- **Stone Ape Band:** sets, setlist board and attendance reputation.
- **Your band:** rehearsals, songs, booked gigs at Sala Malasaña with members on stage and a dancing crowd.
- **DJ nights:** booked nights at four booths with pay.
- **Panel:** gig guide and band panel.
- **Save:** `S.band`, `S.djNights`, `S.sab`.
- **Bug fixed:** a save-key collision with the DJ mixer (`S.dj`).

### M14 festivals, first slice (apeverse-2-living-worlds branch)

- **Calendar:** weekday festival calendar (`js/festivals.js`).
- **Hanging Bazaar:** Groove Dealers "Live at the Hanging Bazaar" in Ape Town on Saturdays. It has lantern festoons, canopies, the poster on a stage screen and two boards, a "Vinyls from the Stars" stall, a festival crowd and a headline that replaces the late set.
- **Artwork:** the owner's Groove Dealers poster, duplicate-checked as new.
- **Tests:** suite_fest 38/38.

### M15 Koh Tao (apeverse-2-living-worlds branch)

- **World:** `js/world_koh_tao.js`: Sairee Beach, the walking lane and 5 sois, the hill-road viewpoint and Mae Haad pier with the ferry (travel map).
- **Enterable business:** Blue Turtle Divers.
- **Activity:** snorkelling (mask, underwater view, a 7-species reef log, Reef Explorer).
- **Night:** fire show, plus Sairee Fire Night on the festival calendar.
- **Look:** a per-world post grade, because the default bloom washed the bright beach white.
- **Tests:** suite_kohtao 42/42.

### M12 consumables and effects (apeverse-2-living-worlds branch)

- **Photosensitivity guard** in `effects.js`.
- **Raw dose:** `AV.fx.raw` and `AV.fx.impaired` read the dose itself.
- **No impaired driving.**
- **Table service:** `js/tables.js` adds a table with a real local menu at Madrid (La Esquina), Koh Tao (Firefly) and Pai (Rainny), with responsible service.
- **Tests:** suite_consume 47/47.

### M17 ApePhone (apeverse-2-living-worlds branch)

- **Phone:** `js/apephone.js` with 14 apps on Z or the 📱 touch button. The panels it reuses get back navigation.
- **Messages:** generated by the world (friends, bookings, festivals, shop sales, rent, invitations), with replies.
- **Built-in apps:** calendar, bank, maps/GPS, journal and milestones.
- **Z key:** it now opens the phone; Contacts is the old People panel.
- **Tests:** suite_phone 43/43, plus 43/43 in phone mode.

### M16 careers and missions (apeverse-2-living-worlds branch)

- **Careers:** `js/careers.js` with ranks.
- **New shifts:** a Madrid delivery shift (pick up, deliver against a timer, GPS) and a Koh Tao reef survey.
- **Existing shifts counted:** the café shift, plus M10 gigs and DJ nights.
- **Missions:** six, read from save state.
- **Jobs app** in the phone, and a HUD job line.
- **Tests:** suite_careers 50/50.

### M13 world benchmark, first slice (apeverse-2-living-worlds branch)

- **Benchmark:** `tools/tests/suite_worlds.js` and `tools/bench_images.mjs` score all 13 worlds.
- **Shared grade fix:** the default post grade in `js/gfx.js` no longer washes bright worlds white. Contrast is measured up in Vienna, Koh Samui, Da Nang, Jungle Dub and Pai, and night glow is unchanged.
- **Gap list:** prioritised in docs/WORLD_BENCHMARK.md.
- **Open:** suite_gfx has 4 pre-existing failures (they expect pre-V0.10 "no post" in other worlds).

### M13 GPS in every world (apeverse-2-living-worlds branch)

- **Router:** `js/pathfind.js` is a shared GPS router: a walkability-grid A* that prefers pavement, uses the street graph with repair where one exists, and smooths by line of sight. It runs on a spatial collision index.
- **Re-routing:** at 15 m off the route.
- **Tests:** suite_gps 88/88; 60 routes, 0 points inside buildings.

### M13 palettes and haze (apeverse-2-living-worlds branch)

- **Cause, measured:** the default bloom washed bright worlds white; fog and sky tint were ruled out with controlled shots.
- **Fix:** default bloom at 20% by day (×1.45 at night as before), per-world `sky.exp` day exposure, and sky tints.
- **Result:** contrast in washed worlds is now 0.24–0.35, against 0.12–0.18 before.

### M13 ambient sound (apeverse-2-living-worlds branch)

- **Presets:** `js/ambience_worlds.js` gives 9 worlds procedural ambience whose layers follow their own places and day or night.
- **Tests:** suite_ambience 66/66, with a real signal measured in every world.

### M13 frame rate, diagnosis only (apeverse-2-living-worlds branch)

- **Probe suites:** `tools/tests/suite_perf_worlds.js`, `suite_perf_bottleneck.js` and `suite_perf_cpu.js`.
- **Finding:** CPU time inside the render call (draw calls) limits the slow worlds; triangles, materials and animation don't.
- **Reverted:** a lower character-cap change. It cut work per frame, but the FPS gain was within thermal noise.

### M13 baked mid-distance characters (apeverse-2-living-worlds branch)

- **Bake:** `perf_guard` merges a mid-tier character's skinned parts into one mesh, with colours, ambient occlusion and the shirt print baked into vertex colours, and hides eyes and lids.
- **Draw calls:** down 3.5–24% in 5 worlds.
- **Render time:** down 4–8% on average.
- **FPS:** gains are small and within run variance.
- **Tests:** suite_bake 30/30.

### 2.1 Amsterdam district 2: the Museum quarter + Vondelpark (apeverse-2-living-worlds branch)

Details in `docs/AMSTERDAM.md`. Code: `js/amsterdam_zuid.js`, plus hooks in `world_amsterdam.js` and `amsterdam_life.js`.

- **Getting there:**
  - The Vijzelstraat, then the Singelgracht (3 bridges, the tram/road bridge nearly flat), then the Stadhouderskade.
  - The tram runs from Dam to a terminus at the museum.
  - Taxi stands at the museum and the park.
- **The museum** (Nationaal Apenmuseum, fictional): a public passage through it, a ticket desk, a gate, a gallery with 9 procedural paintings, Ruben's trail (+30 and a poster), and a museum shop.
- **Museumplein:** a lawn, a pool, an ice cream cart, a poffertjes stand, and the Klankgebouw and Museum Nu exteriors.
- **Stadhouderskade shops:** SWAG, ApePhone, SOLTERRA Living, Chocolaterie Puur and Pannenkoekenhuis De Zuidkant.
- **Vondelpark:** gates, a path loop, 3 ponds with ducks you can feed, about 110 trees, the bandstand, the rose garden, Theehuis De Reiger, bike rental, cyclists, parakeets, and a lawn jam from 13:00 to 19:00 with a free ukulele. Its music uses an existing playlist.
- **New residents:** Ruben, Sanne and Lotte.
- **Shared-code changes:**
  - **World edge:** the world grows south; the old north edge is kept, so no empty strips open beside the Jordaan.
  - **`house()`:** can put windows on its back face (rows whose backs face a park).
  - **`music_play`:** jam spots can name their band.
- **Tests:** `suite_amsterdam` 142/142 on mains power. The district's three FPS samples all hit the 60 fps cap.

### 2.1 Amsterdam: first playable district (apeverse-2-living-worlds branch)

Details in `docs/AMSTERDAM.md`.

- **The city:**
  - **Route:** Centraal Station → Damrak and its basin → Dam Square → the Singel and Herengracht canals (7 walkable arched bridges; the water is real) → the Jordaan lane.
  - **Architecture:** a canal-house kit with 5 gable types and a forward lean.
  - **Signage:** one sign atlas of authored Dutch shop signs with window displays.
- **Businesses:** 3 walk-in (brown café, 18+ coffeeshop with house rules, Groove Dealers Platen) and 5 counters (bakery, frites, cheese, Monkey Brew Proeflokaal, flowers), plus ApeMart Express ("supermarkt"), PuffPop and the De Waterkant live venue.
- **Getting around:** a visible tram Centraal ↔ Dam on the rails, a canal boat tour under the bridges, electric taxis, and Jasper's Fietsen (rent, or buy an omafiets or e-step).
- **People:** 5 named residents with daily routines and 4-choice conversations that act; the story mission "Fenna's setlist"; King's Day every Sunday on the Apeverse calendar (orange decorations, vrijmarkt, orange crowds, a DJ boat), with normal life otherwise.
- **Tests:** `suite_amsterdam` 85/85, the release gate (mobile and human playtest still open). Integration now covers 14 worlds: 138/138.
- **Frame rate (Medium, laptop on battery):** arrival 53.6 fps (72 draw calls), Damrak 58, Jordaan 46.8.
- **Shared code it needed:** `rides.js` takes fixed-route rides with their own vehicle (tram on rails, boat on water, chase options). Shop windows are real glass in the walk-in shops.
- **Battery-run timing misses:** in this session's regression on battery, `suite_gps` was 91/94 (Madrid 526 ms, Astro-9 913 ms, Koh Samui 469 ms against the 400 ms budget). All route correctness checks passed. The same pathfinder code passed 88/88 on AC power in the routing milestone. In the same run, `suite_roads`' Astro-9 warm-up reached 401/518 bins in 150 s (517/518 on AC). Re-check both on AC power.

### 2.1 Routing: roads for vehicles, Pinar connected, warm GPS (apeverse-2-living-worlds branch)

- **Madrid Pinar:** connector streets to the grid (with traffic lights), plus a Gran Vía east link. Pedestrian streets are kept car-free.
- **Driving GPS:** follows streets.
- **GPS warm-up in idle frames:** Astro-9 routes now take ≤ 8 ms.
- **Retrieval:** owned vehicles in all six new worlds come back after a save and load, can be ridden, brought to you (valet) and located. That's tested with the game's loader and a state swap; it isn't a full page reload.
- **Tests:** `suite_roads` 18/18 (new), `suite_dealers` 82/82 (retrieval added).
- **Regression:** madrid 79/79, traffic 26/26, drive 39/39, rides 192/192, gps 88/88, minimap 41/41, home 61/61, npc 84/84, integration 131/131, sources 65/65, brand 123/123, vehicles 52/52.

### 2.1 Vehicles in more worlds (apeverse-2-living-worlds branch)

- **Dealers in 6 more worlds:** Bambu Motors in Chiang Mai (scooter, tuk-tuk, bicycle), Pai, Koh Tao and Da Nang; Astro-9 Hover Customs (hover bike, hover scooter); Woblr Motors Wien (Zip-EV, bicycle). Each has a local-language sign.
- **Portal freight:** move an owned vehicle between worlds for 60, with per-world rules on which kinds belong. The garage explains a refusal.
- **Zip-EV:** gets car lights and the car chase camera.
- **Test:** `suite_dealers`, 55/55. Details in `docs/DRIVING.md`.
- **GPS stays warm** (`pathfind.js`): adding an obstacle no longer throws away the collision index and cost cache; the cache is per bin with numeric keys. Cold routes are 40–50% faster, warm ones 3–5× faster (`docs/GPS.md`).
- **Ride smoothing:** walking-route legs are string-pulled, and drivers edge through crowds after 3 s of total waiting. Jerusalem: 10 m → 49 m in the first 10 s.
- **Regression:** dealers 55/55, rides 192/192, drive 39/39, vehicles 52/52, kohtao 42/42 (place count updated for the dealer), integration 131/131, consume 47/47, sources 65/65, brand 123/123, fest 38/38, minimap 41/41.
- **Open:** `suite_gps` is 87/88. Adding the dealer place changed which route pairs it samples, and one cold Astro-9 route now takes 417 ms against the 400 ms budget (down from 440 before the cache fix). Logged, not hidden.

### 2.1 Phase 3: Brand Row, the Brand District pilot (apeverse-2-living-worlds branch)

- **What it is:** six walk-in branded shops in Ape Town's unused east strip, each with its own architecture, an authored sign, staff and a working checkout. Full details in `docs/BRAND_DISTRICT.md`.
- **What you can buy and use:**
  - **SWAG:** wearable tees and hoodies.
  - **Groove Dealers:** LPs and a boombox that plays them.
  - **Monkey Brew:** ales (drink effect) and kombucha.
  - **Woblr Motors:** the Zip-EV car, which you own and drive.
  - **ApePhone Store:** skins that restyle the phone, and a lens that opens photo mode.
  - **SOLTERRA Living:** furniture, delivered to your home stock.
- **On the street:** an ApeMart kiosk, PuffPop vending and a Zippit dock.
- **Performance:** one sign atlas covers all signage, and the geometry is merged.
  - In the street: +23 draw calls, still near 60 fps.
  - At the Ape Town arrival: +5 calls, FPS unchanged within noise.
- **Rollout to 7 cities:** an ApeMart Express kiosk plus PuffPop vending, with a local-language subline, placed clear of walkways and roofs.
- **Brand registry:** reconciled in `docs/BRAND_RECONCILIATION_21.md`. "Banana Republic" is renamed BANANARCHY; collisions are logged for the owner.
- **Test:** `suite_brand`, 123/123.
- **Regression:** merch 93/93 (test updated for SWAG; SWAG designs now carry `realWorldUrl: null`), home 61/61, drive, vehicles, phone, integration, consume, sources, rides, fest, npc and biz all pass in full.
- **Garage:** a purchase now refunds if the vehicle can't be parked.

### 2.1 Phase 0-2: audit, rides that drive, consumable sources (apeverse-2-living-worlds branch)

- **Audit:** `suite_audit21` builds a world-by-system board for all 13 playable worlds.
- **Rides:** `js/rides.js`. Every taxi or shuttle stand, and the map's 🚕 button, now drives you along streets or walkable routes in a real vehicle. Madrid taxis stop at red lights. You can pull over (with a refund) or skip.
  - **New stands:** Koh Tao, Jerusalem and Judean Desert.
  - **Test:** `suite_rides`, 192/192.
- **Consumable sources:** `js/consume_sources.js`.
  - **Madrid:** La Nube, a members' club with a street door and a lounge.
  - **Stalls:** Pai and Koh Tao herb shops (adults 20+), Café Nargila in Jerusalem, the Ranger Snack Hut and cave mushroom in Koh Samui, and Vela's Forage Basket in Verdalux.
  - **Test:** `suite_sources`, 65/65.
- **Regression:** integration 131/131, consume 47/47, cm 76/76, kohtao 42/42, drive 39/39, vehicles 52/52, gps 88/88, phone 43/43.

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
