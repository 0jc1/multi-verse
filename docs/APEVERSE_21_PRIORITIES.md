# Apeverse 2.1: remaining upgrades, in priority order (kept current at every milestone)

Last updated 26 Nov 2026, after the Brand District pilot. **DONE** means built, tested on the real GPU and pushed; anything else is not done.

## 1. Consumables and effects in every suitable world

- **DONE:**
  - Purchase sources in every playable world except Da Nang and Judean Desert (by design: alcohol only).
  - La Nube (Madrid); herb shops in Pai and Koh Tao; Café Nargila (Jerusalem).
  - Monkey Brew; ApeMart and PuffPop in 7 cities.
- **NEXT:**
  - Visible smoke and drink props held by NPCs at tables.
  - A sit-down Monkey Brew table service, using the M12 tables system.
  - Astro-9 alien botanicals as a full stall chain (they're sold today, but there's no dedicated alien botanicals stall).
  - A decision from the owner on Da Nang and the Judean Desert.

## 2. Vehicles, taxis and tuk-tuks across worlds

- **DONE:**
  - Hired rides really drive, in 12 worlds; Madrid taxis stop at red lights.
  - The Woblr Zip-EV is ownable and drivable.
  - **Dealers in 6 more worlds** (Bambu Motors in Chiang Mai, Pai, Koh Tao and Da Nang; Astro-9 Hover Customs; Woblr Wien), with buy, drive, park and save.
  - Portal freight for owned vehicles between worlds, with per-world vehicle rules.
  - Zippit e-scooter rental on Brand Row.
  - Madrid's Pinar streets connected to the grid; the driving GPS follows streets; GPS is warmed in idle frames (Astro-9 routes ≤ 8 ms).
- **NEXT:**
  - KongKart taxi branding, once the owner picks the name.
  - AI road traffic outside Madrid (Vienna, Da Nang, Chiang Mai), which needs curved-road support.

## 3. Graphics and culturally authentic local signage

- **DONE:**
  - Brand Row: six authored storefronts in one sign atlas.
  - La Nube enamel blade sign; Thai, Hebrew and Vietnamese kiosk sublines.
- **NEXT:**
  - Replace the generic board signs in Vienna (German enamel and café fascias), Madrid (tiled and metal), Chiang Mai and Pai (hand-painted Thai menus), Da Nang (Vietnamese) and Astro-9 (layered holo).
  - Ape Town static batching (500+ unmerged meshes). `static_merge.js` exists, but Ape Town is not opted in yet. That needs an A/B test and a festival-decor check.
  - Interior wall materials for Brand Row.

## 4. New destinations

Only after the cross-world systems above, as the brief orders.

- **NEXT:** Amsterdam (present day) slice, built to the release gate in `docs/WORLD_LAUNCH_QUEUE` (2.1 pack).
- **THEN:** Tokyo, then Paris.
- **Rule:** none is marked playable before it passes the gate.

## 5. NPC activities, music venues, festivals, property

- **DONE (earlier milestones):**
  - M11 residents (Madrid); M10 bands and DJ; M14 Hanging Bazaar; M8 one Madrid flat.
  - SOLTERRA furniture now delivers into it.
- **NEXT:**
  - A second property: an Ape Town eco-lodge or a Koh Tao hostel room, with the same housing system.
  - Brand Row staff routines (open and close, serving).
  - A Groove Dealers in-store DJ night.
  - A festival outside Ape Town that uses the brand stalls.

## Known failures carried forward (not hidden)


- `suite_gfx`: 4 pre-existing failures.
- `suite_pai`: one outdated ambience check.
- `suite_jlm`: written for the old test-runner interface.
- No human playtest or mobile layout check has been done for 2.1 yet.
