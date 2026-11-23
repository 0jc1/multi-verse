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
