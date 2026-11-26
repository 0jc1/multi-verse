# APEVERSE 2.0: Living Worlds. Technical roadmap

**Source:** the owner's "APEVERSE 2.0 — LIVING WORLDS" master prompt (25 Nov 2026).

**Status labels:**
- **Implemented and verified:** test plus screenshot.
- **Implemented, not manually verified**
- **Partial**
- **Planned**
- **Blocked**

**Branch:** `apeverse-2-living-worlds` (from `apeverse-expansion` after M6). The stable preview stays on port 8095, and development runs on 8096.

## Phase 0: what already exists (audited 25 Nov 2026, not rebuilt)

| System | Where | State |
|---|---|---|
| Wallet + transactions | `AV.txn`, `AV.S.money`, `AV.S.log` (core.js) | **Verified.** The currency is "credits". |
| Inventory | `AV.bag`, `AV.ITEMS`, `AV.S.items` (bag.js, data/items.js) | **Verified.** Use, equip, drop and the backpack UI. |
| Clothing + stores | `js/merch.js`, `data/merch_catalog.js` (M6) | **Verified:** 3 stores (4 with ZtonedApe), wardrobe, NPC prints. |
| Vehicles | `js/vehicles.js` | **Partial.** 7 kinds (bicycle, scooter, e-scooter, hover scooter, tuk-tuk, small car, hover bike). Rental stands, first-person riding, procedural engine sound, parking, rentals expire at midnight. No ownership, no chase camera, no lights, no traffic. |
| Transit | `js/transit.js` | Taxi/metro-style hops per world. |
| Minimap + atlas + GPS | `js/minimap.js` | **Partial.** Minimap with zoom and rotate, a full atlas (J) with zoom, pan, places, districts and click-to-set waypoint, and A* routing over `W.mapNav` (Madrid provides `city.nav`). Other worlds fall back to a straight line. No turn guidance. |
| NPC state machines + jobs | `npc_fsm.js`, `npc_jobs.js` | Wandering Market crew with real routines. |
| Ambient people | `beings.js`, `city_life.js` | Calmer since M1. No identities or homes yet. |
| Activities | `activities.js`, `music_play.js`, `dj_mixer.js`, `songkran_water.js` | Basketball, DJ mixer, instruments, Songkran. |
| Consumables | `bag.js` (eat/drink/smoke animations, puffs), `effects.js` | **Partial.** |
| Portal pipe | `portal.js` | **Verified.** |
| Saves | `core.js` | Key `apeverse_v09`, schema v2. Since M1: sandboxed test key, session backup + fallback, no invalid writes. |
| Multiplayer | `multiplayer.js` | Optional LAN server only. **Not a public online backend.** |

## Save safety plan (versioned, with rollback)

1. **Schema version:** `AV.S.v` is the schema version (currently 2).
   - Every 2.0 milestone that adds persistent data adds **only new optional fields**, for example `S.wear` (M6) and `S.garage` (M7).
   - Loading old saves then needs no migration: `Object.assign(AV.fresh(), old)`.
2. **When a real migration is unavoidable:**
   - It is registered in `AV.migrations` (pure function `vN → vN+1`).
   - Before it runs, the untouched save is copied to `apeverse_v09_pre_vN` (rollback copy, never overwritten).
   - The migrated save is validated (`valid()`) before the first write.
   - A failed migration keeps the old save and loads it.
3. **Backup:** the session backup `apeverse_v09_bak` (M1) protects against a crash mid-session.
4. **Tests:** they never touch the player's key. `AV.saveKey` sandbox and `suite_integration` "save safety" check that the real save is unchanged.
5. **Photos:** the IndexedDB store is never touched by schema work.

## Milestones in order

| # | Milestone | First deliverable | Status |
|---|---|---|---|
| M6 | Merchandise + clothing | 4 brand stores, wardrobe, persistence, NPC prints | **Verified** (SWAG blocked on artwork) |
| M7 | Driving | **Madrid:** an ownable car + scooter (buy at a dealer, keep, park, garage, paint), chase camera toggle, headlights/brake lights, persistence | **Implemented and verified (Madrid slice)**: suite_drive 39/39, vehicle-length collision; see docs/DRIVING.md. Indicators, damage/repair, upgrades and other worlds' dealers are planned |
| M7B | Map + GPS | Turn-by-turn guidance while walking/driving on Madrid's street graph; owned vehicles + destination on the minimap; tap-to-expand atlas on phones | **Implemented and verified (Madrid)**: GPS bar with arrow + route distance; other worlds fall back to a straight line until they get a street graph |
| M7C | Traffic | NPC cars on Madrid's road graph with lane offsets, stopping for the player and pedestrians, despawn outside view | **Implemented and verified (Madrid)**: suite_traffic 26/26; 1374 lanes, 354 traffic lights, 0 red-light runs, stops for you and pedestrians, solid for your car, streams around you. No traffic-car lights at night yet; other worlds planned |
| M8 | Housing | One Madrid apartment: rent/buy, enterable interior, furniture catalogue, place/move/rotate/remove, persistent layout, sleep/respawn | **Implemented and verified (Madrid flat)**: suite_home 61/61; 19 furniture pieces, gaze placement with fit rules, walls/floor, wardrobe, honest record player; see docs/HOUSING.md. Fresh-session wake-up at home implemented but not test-verified |
| M9 | Player business | Own the clothing shop: stock, prices, opening hours, NPC customers, bounded offline earnings, player-designed listings | **Implemented and verified (Malasaña clothing shop)**: suite_biz 46/46; lease/buy, branding, products + wholesale + prices, staff, hourly demand model, visible customers, ledger, upgrades, design studio, 24 h catch-up cap; see docs/BUSINESS.md. Other categories planned |
| M10 | Music + bands | Validated catalogue of the owner's audio files (local only, never committed); Stone Ape Band setlists + schedules; DJ gigs with rewards | **Implemented and verified**: suite_band 62/62 (real GPU); local catalogue of 5,234 files (326 unique owner originals), 16 missing playlist originals restored locally, real playback proven; Stone Ape Band sets + setlist board; your band (rehearsals, songs, booked gigs with bandmates on stage + crowd, pay); booked DJ nights with pay; gig guide; see docs/MUSIC.md. No instrument models / per-instrument animation, one gig venue |
| M11 | Living NPCs | Identities, homes, workplaces, schedules, relationships, memory | **Implemented and verified (Madrid, first slice)**: suite_npc 84/84; 10 named residents with homes, workplaces, hourly schedules, sidewalk-preferring pathfinding, memory + friendship, context dialogue, tips, favours, dinner invitations, hiring into your shop, band recruiting, community reputation, People panel (Z); see docs/LIVING_NPCS.md. Other worlds, indoor use of venues, gossip planned |
| M12 | Consumables + effects | Menus/tables, smoke in/exhale, fictional effects with reduced-motion + photosensitivity-safe defaults; no impaired driving | **Implemented and verified**: suite_consume 47/47; photosensitivity guard (rate-limited filter, measured), raw dose drives rules, no impaired driving (refuse / pull over / no drinking at the wheel), table service with real menus at 3 venues, water nudge + cut-off, sharing with friends; see docs/CONSUMABLES.md |
| M13 | World upgrades | Bring every world to the Madrid benchmark | **Ongoing; first slice implemented and measured**: world benchmark (suite_worlds + tools/bench_images.mjs) scoring all 13 worlds; the shared default grade no longer blooms bright worlds white (contrast Vienna .123→.210, Koh Samui .143→.195, Da Nang .159→.190); prioritised gap list in docs/WORLD_BENCHMARK.md. **GPS in every world: implemented and verified**: shared router (js/pathfind.js), suite_gps 88/88, 60 routes in 12 worlds with 0 points inside buildings (37 old straight lines crossed buildings); see docs/GPS.md. Next: palettes, ambience, FPS, 2.0 systems beyond Madrid |
| M14/M15 | Festivals, new destinations | Koh Tao first | **M14 festivals: first slice implemented and verified**: suite_fest 38/38; weekly calendar + Groove Dealers "Live at the Hanging Bazaar" (Ape Town, Saturdays) with the owner's poster art, lanterns, stall, festival crowd, headline + attendance; see docs/FESTIVALS.md. More festivals planned. **M15 Koh Tao: implemented and verified**: suite_kohtao 42/42; Sairee Beach + walking lane + 5 sois (walking loops), hill-road viewpoint, Mae Haad pier + ferry (travel map), enterable Blue Turtle Divers, snorkelling with a 7-species reef log, fire show, Sairee Fire Night (Fridays), ambient sound, minimap; see docs/KOH_TAO.md |
| M16/M17 | Careers, missions, ApePhone | Journal + phone reusing existing menus | **M17 ApePhone: implemented and verified**: suite_phone 43/43 desktop + 43/43 phone mode; Z / 📱 home screen with 14 apps reusing the game's menus (+ back navigation), world-generated messages + replies, calendar, bank, maps/GPS, journal + milestones, music, reef log; see docs/APEPHONE.md. **M16 careers + missions: implemented and verified**: suite_careers 50/50; 5 careers with ranks (café, Madrid delivery rider, Koh Tao reef survey diver, musician, DJ), delivery + survey shifts with GPS/timers/pay x rank, 6 missions read from save state, Jobs app; see docs/CAREERS.md |

## Constraints that apply to every milestone

- **Performance:** at least 30 FPS at Medium on the Iris Xe laptop, measured on the real GPU (headless numbers are functional only). Android must stay playable.
- **Cost:** no paid services, no external accounts, no new build system.
- **Repository:**
  - Media never goes into the repo: not the owner's videos, music or originals.
  - Clothing textures are small derived JPEGs.
- **Spelling:** the brands are spelled ZtonedApe, APEVERSE, MOONMELT SUPPLY CO., SOLTERRA and SWAG.
- **Fictional systems:** underground storylines, cultivation and social clubs are abstract fictional mechanics, never real-world instructions.
