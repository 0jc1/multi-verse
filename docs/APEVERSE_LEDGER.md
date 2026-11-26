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
