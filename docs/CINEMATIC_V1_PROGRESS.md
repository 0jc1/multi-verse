# Apeverse V1 Cinematic World Upgrade: progress

- **Branch:** `apeverse-cinematic-v1`, cut from `apeverse-integrated-preview` at `47c1f39`.
- **Review target:** `apeverse-integrated-preview`. Nothing merges into `main`.
- **Brief:** `APEVERSE_CINEMATIC_V1_MASTER_PROMPT.md`, from the owner's Downloads.
- **Missing pack:** the `APEVERSE_CINEMATIC_V1_UPGRADE_PACK.zip` mentioned in the request was not on this computer. `START_HERE.md`, `CODEX_RECOVERY.md`, `PLANS/` and `REFERENCE_MAPS/` therefore have not been read. The NPC script arrived on its own as `APEVERSE_NPC_FIRST_FIX.ps1`.

Status words used below:
- **DONE:** coded and test-verified.
- **PARTIAL:** some of it is coded; the gaps are listed.
- **NOT STARTED:** no code yet.

## Phase status

| Phase | Status | What exists |
|---|---|---|
| 0 Crowd fix | **DONE (first pass)** | `APEVERSE_NPC_FIRST_FIX.ps1` applied after a dry run. Changes: generic pedestrians 25–40% fewer per world, longer pauses, no endless "wave" idling, fewer wanderers. Named characters, the Stone Ape Band, the 6 market workers (`suite_workers`), terrace sitters and venue staff are kept. Not yet done: per-archetype homes, routes and day plans; venue-gated dancing; cars and architecture avoidance. |
| 1 Road + prop audit | NOT STARTED | Earlier walkability fixes cover Madrid sidewalks only (`suite_madrid`, `suite_polish`). There are no semantic placement zones yet. |
| 2 Driving QA | NOT STARTED | `js/vehicles.js` (7 kinds) and `js/transit.js` (taxis, rentals) exist from the earlier polish pass. |
| 3 Cinematic signage + facades | NOT STARTED | Madrid has 2 shopfront atlases (48 cells) and projecting signs from the earlier polish pass. That's short of the 12 templates per district / 40 per city target. |
| 4 Astro-9 hero corridor | NOT STARTED | The megacity plus `astro9_more.js` districts exist; the facade rebuild is not done. |
| 5 Existing worlds polish | NOT STARTED | Separate performance branch `apeverse-perf-npc-fixes`, under test: plant and character LOD, shadow budget, resolution guard. |
| 6 New cities | **PARTIAL: Sevilla recovered into quarantine** | See below. The other 8 cities have roadmap entries only (status "planned"). |

## Codex agent contributions

| Agent | Status | Evidence |
|---|---|---|
| 1 Madrid | **Not available** | No branch, PR, patch or bundle on GitHub or in Downloads. The Madrid work in the preview came from Claude Code sessions, not Codex. |
| 2 Astro-9 | **Not available** | Same as Agent 1. |
| 3 Vehicles | **Not available** | Same as Agent 1. The vehicle and transit code in the preview is Claude Code work. |
| 4 New cities | **Recovered into quarantine** | `agent4_sevilla_handoff.zip`, 13:59. Its patch is applied with `git am` on `codex/agent4-sevilla-20261123`, keeping the original author "Apeverse Agent 4 (local export)", commit `de7bf63`. The index hookup is `d42d4d3`. It adds `js/world_seville.js` (577 lines), `js/agent4_seville_plan.js`, `data/agent4_worlds.js` (Sevilla "partial" plus 8 "planned" cities) and its own tests. It does not overwrite any existing file. It is not merged into this branch yet. |

To publish the missing work, Agents 1–3 each need a pushed branch or PR against `apeverse-v1-jungle-slice`, or a `git format-patch` file, plus a list of changed files.

## Tests

Filled in at the end of each milestone. See `## Milestone log`.

## Milestone log

### Milestone 1: crowd fix (phase 0) + Codex audit

- **Code:** `APEVERSE_NPC_FIRST_FIX.ps1`, dry run then applied: 18 edits in `city_life.js`, `beings.js`, `stoners.js`, `madrid_city.js`, `astro9_mega.js`, `world_pai.js`, `world_chiang_mai.js` and `world_ape_town.js`.
- **Effect:** generic pedestrian counts are 25–40% lower in the configuration. Pauses are longer, and nobody stands waving at nothing.
- **Animated people per world (`suite_crowd.js`, before → after):**

| World | Before | After |
|---|---|---|
| Ape Town | 54 | 46 |
| Madrid | 483 | 395 |
| Chiang Mai | 125 | 113 |
| Pai | 153 | 130 |
| Astro-9 (skinned characters) | 71 | 70 |

  Astro-9's instanced street crowd is about 32% smaller in the configuration. The 6 market workers are kept everywhere.
- **Tests:**

| Suite | Result |
|---|---|
| integration (desktop) | 109/109 |
| integration (phone) | 7/7 |
| polish | 92/92 |
| madrid | 78/78 |
| astro9_mega | 25/25 |
| minimap | 41/41 |
| vehicles | 52/52 |
| pai | 44/46 (same 2 failures on the unchanged build) |
| workers | 51/52 |

  `workers` missed a different single check in each of two runs ("status lines drawn", then "resumes after the chat"), which looks like timing. Workers code is untouched by this fix, and the perf branch, which has the same test fix, passed 52/52 twice.

### Milestone 2: Chiang Mai street relationships

- **Big Blues:** stays opposite Giant Hostel across Moon Muang Rd (z 44). Door to door is 8 m across the road. It now has its own neon-style board, "BIG BLUES · live music bar".
- **Chat (new):** cafe + guesthouse at x 64.5–76.5, z 50.5–62.5, with its door on the x = 60 lane. It is 64 m from the hostel by street, with one turn. It has a counter (Thai iced tea), a book-swap shelf with a guestbook, a sofa, tables and potted plants beside the door.
- **Pineapple Express (moved):** the whole building, interior, counter and exits moved from next to the hostel to x 70–86, z 7.5–20, on the main E-W road towards Tha Phae Gate. It is 147 m by street, with two turns. It has a hand-painted plank board with lamps, an awning, potted palms and a chalkboard.
- **The freed plot:** the old plot next to the hostel is ordinary Thai shophouses again.
- **Signs:** three canvas-painted signs in different design languages (painted teak boards, an enamel lightbox and neon tubes) on framed backings with brackets. Each has Thai + English text and night lighting. No floating text planes.
- **Detail layer:** it no longer drops clutter within 3 m of a named entrance. Lantern strings hang 9 m along the street, away from signs.
- **Tests:** `suite_cm` 73/76, up from 58/63 on the unchanged build. The new 12-check street-layout step passes: walk routes on both sides, door entry, distance order and mounted signs. The 3 remaining failures also fail on the unchanged build:
  - Hostel front-door walk: the static door is clear by probe, so the blocker is probably a crew NPC inside.
  - Nuni's follow mission.
  - The Songkran HUD text.

### Milestone 3: Astro-9 Neon Boulevard hero street (`js/astro9_neon.js`)

**What is built:** a continuous 170 m street (x 92–262), rebuilt from the ground up.

- **Street cross-section:** hex-paver sidewalks (6 m each side) with lit kerbs. Between them, a 10 m wet-asphalt hover lane with median studs, planter islands and three light-strip crossings.
- **Buildings:** 19 street buildings in five architectural families, each with its own canvas facade + emissive window texture, world-scaled UVs, setbacks and roof gear:
  - industrial: panels, vents, pipes, amber light lines
  - organic: round bio-concrete towers, mosaic bands, arched windows, domed caps
  - crystal: curtain glass, cyan mullions, fins
  - dense: stacked balconies, AC units
  - ceramic: tile, copper fins
- **Ground floors:** every building has a recessed glass shopfront showing a lit interior, a canopy with a light strip, and a framed shop sign.
- **Signs:** 16 unique signs in a 2048 px atlas, each in its own design language (holo frame, gold serif, neon script tube, hazard stencil, ceramic tile, clinic, pixel, chrome, ripple, bio blob, transit). Each pairs a procedural alien glyph script with an English translation. Examples: TECH MARKET, SYNTH & STRINGS, COMET RAMEN, ROBOT REPAIR, ORBITAL OPTICS, XENO GENETICS, VOID ARCADE, GRAV-BOOTS, HOLO INK, DATA BATHS, MOON PAWN, SPORE CAFÉ, HAB UNITS, SKY TAXI, NEBULA NAILS, CARGO 9.
- **Enterable shops:** Tech Market, Synth & Strings, Comet Ramen and Robot Repair. Each has a real room behind a door: walls, counter with collision, glowing shelves, an interior light, and a clerk (robot or alien species). The existing buy interactions were moved inside.
- **Black Market:** a real 6 m side alley with a stall under a tarp, lanterns and vertical signs.
- **Street life:**
  - hover cars flying both directions of the lane at 3.4 m
  - four animated holo-adverts on facades
  - cables with lanterns strung across the street
  - organic lamps; benches at the kerb, facing the shops; vending machines; alien planters (never in doorways)
  - pedestrians moved from the lane to the sidewalks
  - a soft night fill light so materials read
- **Old boulevard pieces:** the stalls, floating signs, frontage towers and edge strips are switched off when this module is present. The hover-taxi stand moved off the Comet Ramen doorway to the north kerb.

**Tests:** `suite_astro9_neon` 25/25.
- Both sidewalks are walkable end to end.
- The lane crossing, the alley and the Food Ring connection all walk.
- The doors of Tech Market and Comet Ramen walk in; their counter interactions are inside.
- Buying ramen works.

**Render cost (headless, Medium):**

| View | Triangles | Draw calls |
|---|---|---|
| Street level, looking east | 0.48 M | 129 |
| Looking west, with the whole skyline | 2.3 M | 788 |

**Known gaps:**
- (Fixed in the follow-up polish: each shop now has its own interior.)
- (Fixed: all four shops now have walk-in tests.)
- Clerks are simple static species meshes, not the rigged characters.
- No daytime look: Astro-9 is permanently night.
- Real-GPU FPS has not been measured.

### Milestone 3b: Astro-9 polish

- **Shop-specific interiors:**
  - Comet Ramen: stools along the counter, bowls with glowing broth, steaming pots, red paper lanterns, a menu board and two seated diners.
  - Synth & Strings: a lit guitar wall, two keyboards on X-stands, a drum kit and a speaker stack.
  - Robot Repair: a workbench with a robot arm, parts bins, a half-repaired robot on a lit lift and welding sparks.
  - Tech Market: display tables with floating holo-gadgets and a browsing customer.
- **Vertical blade signs:** 15 of them, double-sided and jutting over the sidewalk, from an 8-design atlas (stacked alien glyphs + English word).
- **Steam:** rising from the ramen pots and four street grates.
- **Tests:** `suite_astro9_neon` 37/37, with walk-in checks for all four shops and interior screenshots.

### Milestone 3c: Neon Boulevard storefront identities

- **Comet Ramen:** timber slats on the fascia, red noren curtains with glyphs over the door, a lantern row under the canopy, and a giant 3D ramen bowl sign (glowing broth, chopsticks, noodles) on the canopy with steam rising from it.
- **Tech Market:** a cyan holographic portal frame around the door with scan lines, and a floating holo-gadget on a mast.
- **Synth & Strings:** a giant neon guitar outline climbing the facade, and speaker-grill panels flanking the door.
- **Robot Repair:** a half-raised garage shutter with hazard stripes, and a 3D glowing gear.
- **Every building:** floor ledges every 4.5 m, neon rooflines on each mass, and an uplight strip above the shopfront. The industrial and crystal facade bases are brighter so their detail reads at night.
- **Street:** lane chevrons showing the direction of travel, amber tactile paving along both kerbs, and alien trees in kerbside pits (only in free kerb slots, clear of benches, lamps and crossings).
- **Bug caught by the suite before commit:** the ramen bowl's steam emitter was used before its list existed, which crashed the Astro-9 load. It's fixed.
- **Tests:** `suite_astro9_neon` 37/37.

### Remaining work (Astro-9)

- Other Astro-9 districts still use the older look: plaza, bazaar, Food Ring, Art Avenue, Biotech Garden, homes and hangar.
- Clerks and customers are static species meshes, not rigged characters.
- No daytime lighting; real-GPU FPS not yet measured on the owner's laptop.
- Next in order after Astro-9: Pai, Vienna, clothing stores.

### Milestone 4a: performance before more geometry

- **Measured first (headless, High, Astro-9 plaza view):** 488 draw calls, 2.77 M triangles, 19 point lights. Most of it was 81 detailed character groups at every distance (about 2.2 M triangles) plus all 19 lights shading every pixel.
- **Merged `apeverse-perf-npc-fixes` (2e755fc) into this branch:** character LOD, plant LOD and the shadow budget.
- **New light budget (`js/perf_guard.js`):**
  - Only the K nearest point/spot lights stay on: K = 2 / 4 / 6 on Low / Medium / High.
  - K stays constant while you move, so shaders never recompile.
  - Lights the game switched off itself are left alone.
- **After (same view):** 389 draw calls, 0.96 M triangles (−65%), 6 lights on.
- **Real-GPU FPS:** not measured. The built-in browser pane was hidden, and a hidden pane throttles frames; F3 readings from the owner's laptop are still needed.
- **Tests:** `suite_astro9_neon` 37/37, `astro9_mega` 25/25, `astro9_d2` 23/23.

### Milestone 4b: Astro-9 district 1, the arrival district (`js/astro9_market.js`)

- **Intergalactic Bazaar is now a souk.**
  - Fabric canopies across the street every 5 m, sagging in the middle, in six cloth colours.
  - Brass lamps hang down the centre.
  - Rugs (4 woven patterns) lie in front of the south stalls.
  - Spice sacks, crates and pots sit between the shop doors. No pole or prop is in a doorway.
  - Carved horseshoe gateways stand at both ends, with a gold-on-teal INTERGALACTIC BAZAAR sign.
  - **Textured façades:** each of the 4 shops has its own lime-plaster skin with a zellige tile base, a carved frieze, a tiled horseshoe arch around the door (door cut out), lit arched windows, lattice screens and a striped awning.
- **Food Ring is now a night market.**
  - Zig-zag string lights hang overhead.
  - Umbrellas, grills with animated smoke, and 6 hand-lettered menu boards (STAR DUMPLINGS, GLOWFRUIT, NEBULA TEA, COMET SKEWERS, VOID NOODLES, MOON TACOS).
  - 2 new stalls.
  - 3 table clusters with stools and seated diners; you can sit at a table.
- **Spiral Plaza:** a mosaic colonnade of 30 columns, with arches and open mouths at the 4 streets, plus curved mosaic benches.
- **Performance:** about 10 extra draw calls. Static geometry is merged per material; there are no new lights.
- **Tests:**
  - New `suite_astro9_market` 25/25. It checks:
    - the souk centre and the shop-front lane
    - all 4 bazaar doors and the Astro Café door
    - both Food Ring lanes
    - all 4 plaza mouths and a full loop around the plaza
  - Regressions: `suite_astro9_neon` 37/37, `astro9_mega` 25/25, `astro9_metro` 30/30.
