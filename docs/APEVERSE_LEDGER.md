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

### Chiang Mai

- **Street layout, verified in the game:** Giant Hostel and Big Blues face each other across the road; CHAT is 64 m from the hostel, and Pineapple Express is 147 m.

### Test tools

- **FPS:** real-GPU measurement (`-Gpu`).
- **Cost attribution:** a GPU cost-attribution step that hides one category at a time.
- **Route checks:** the Pai route check reports what blocks each failing point.

## Measured but not proven

- **FPS gain in Pai after the optimisation:** draw calls and triangles dropped. FPS stayed within the laptop's thermal drift, which was up to 17 FPS between identical runs.

## Open issues

- **Pinar avenue in Madrid:** an intermittent block on the "both sidewalks" check. The blocked point moves between runs, so something moving causes it.
- **Pai north end:** an intermittent route miss. The cause isn't proven; the route check now records the exact blocker.
- **Night shots:** in Pai's test screenshots, the sky shows daylight at 19:00.

## Planned (not built yet)

- **Pai:**
  - more distinct businesses and building variety off Walking Street
  - a mountain road with viewpoints
  - believable daily routines for the NPCs
  - Paradise Circus fire show polish
- **Astro-9:** districts beyond the 12 streets, richer interiors, and more varied alien NPC behaviour.
- **Vienna (still to do):**
  - neighbourhood identities (Naschmarkt stalls, Spittelberg lanes, Ringstraße palaces)
  - tram stops with shelters
  - more enterable shops and a Heuriger
  - NPC daily routines
  - fixing the white haze (fog and sky)
- **Da Nang and Chiang Mai:** a street-detail pass.
- **NPC routines across worlds:** customers visit shops, vendors work their stalls, nightlife busier at night.
