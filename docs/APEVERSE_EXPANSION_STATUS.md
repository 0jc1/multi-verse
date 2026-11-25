# Apeverse expansion: status

Living status for the 24 Nov 2026 master program (`docs/APEVERSE_MASTER_PROMPT_2026_11_24.md`). Updated at every milestone.

Labels:
- **DONE:** built and verified by a test plus a screenshot.
- **PARTIAL:** built, but short of the brief.
- **BLOCKED:** waiting on something outside the code.
- **PLANNED:** not built.

## Where things are (M0 check, 24 Nov 2026)

- **Working branch:** `apeverse-expansion` (from `apeverse-cinematic-v1` @ `9b2cbdf`, Vienna 7f).
- **Backup tag:** `backup/cinematic-v1-20261124` → `9b2cbdf` (pushed).
- **Stable preview:** `apeverse-integrated-preview` @ `47c1f39`. Served untouched from its own worktree at http://localhost:8095/.
- **Live upgrade preview:** the working worktree at http://localhost:8096/ (LAN: http://192.168.1.64:8096/, laptop on the same Wi-Fi only).
- **Other branches:**
  - `apeverse-perf-npc-fixes` @ `2e755fc` (port 8097)
  - `codex/agent4-sevilla-20261123` @ `d42d4d3`: a quarantined partial Sevilla. Not integrated; scoring it is an M0/M7 task.
  - `apeverse-v1-jungle-slice` @ `4808986`
  - `main` @ `60a9240`
- **No other agents' work found:** no new remote branches from Madrid, Astro-9 or transport agents.
- **Pull requests:** not listable. The `gh` CLI has no credential, and the owner declined extracting one. Compare URLs are given instead.
- **Saves are protected:**
  - Every test sets `AV.save = () => {}`.
  - No code change in this program touches `apeverse_v09` save keys or the photo IndexedDB.
  - Tests run in a separate Chrome profile on their own ports.

## Smoke test of every playable world (M0, real GPU, functional)

`suite_integration` (desktop, Low) passed **109/109**: all **12 registered worlds** load, have ground under spawn, walk, have interactions, build their map, show no JS errors and make no failed asset requests. The portal pipe opens, and travel back to Ape Town works.

The phone variant (`-Mobile`) passed **7/7**: boot, touch joystick and buttons visible, minimap, no errors.

Baseline spawn screenshots (12) are in `%TEMP%\ape_m0_int\baseline_world_NN.png`. They are kept out of the repo (no media commits).

| # | World | Interactions | Draw calls / triangles at spawn (Low) | Notes |
|---|---|---|---|---|
| 1 | Ape Town | 78 | 627 / 3.0 M | **Heavy at spawn**: GPU FPS not yet measured |
| 2 | Verdalux | 17 | 108 / 0.24 M | legacy moon |
| 3 | Pai | 37 | 330 / 0.79 M | |
| 4 | Madrid | 51 | 87 / 0.18 M | |
| 5 | Astro-9 | 188 | 366 / 1.57 M | |
| 6 | Jungle Dub | 59 | 473 / 2.8 M | **Heavy at spawn** |
| 7 | Chiang Mai | 74 | 267 / 1.18 M | |
| 8 | Jerusalem | 41 | 188 / 0.40 M | flat sandstone boxes; generic purple sign panels |
| 9 | Judean Desert | 34 | 144 / 0.38 M | |
| 10 | Vienna | 69 | 103 / 0.29 M | 7a–7f done |
| 11 | Da Nang | 43 | 330 / 1.93 M | |
| 12 | Jurassic Koh Samui | 14 | 81 / 0.23 M | sparse; few interactions |

**Not covered by automated tests yet:** save/load round trip (needs a sandboxed save key so the owner's save is never touched), shop doors in every world, vehicle exit in every world, and phone input per world. These are M1 test tasks.

## Registry corrections (M0)

- **Vienna:** `data/worlds.json` and the generated `data/worlds.js` said `planned`, although Vienna is registered code and playable. Corrected to `playable`. The field is metadata only; whether a world can be entered comes from `AV.isPlayable` / registered code.
- **Nimbus Sky City (`js/world_nimbus.js`):** the file exists but is **not loaded** by `index.html` and is not in the registry. It is an orphan, left as is and recorded here.

## M1: collisions, placement, save safety, calmer NPCs (DONE)

### Root causes found and fixed

Each fix is proven by a test that fails on the pre-M1 code and passes now.

- **Madrid Pinar avenue intermittent block: FIXED.**
  - Cause: the Wandering Market (`js/npc_jobs.js`) places its stall, benches, busker mat and campfire at random spots seeded by the save's `S.seed`, and every new game gets a new seed. Some seeds put market props on the Pinar sidewalks.
  - Fix: market props now stay 6 m beyond every mapped road edge and out of a world's no-decoration zones. Patrol waypoints have no collision and are unaffected.
  - Test: `suite_madrid` "Pinar sidewalks clear for any save seed" re-enters Madrid under 6 seeds. Pre-M1 code fails 3 of 6 (props at (-3.75,9.15), (-7.14,-9.98), (-11.78,9.52)). Now 6/6 pass.
- **Pai north route intermittent: FIXED (same cause).**
  - Pre-M1, seed 90001 put the market campfire on Walking Street at (0, -61).
  - New `suite_pai` multi-seed step: 6/6 pass.
- **Pai daylight look at 19:00: FIXED.**
  - The sky was correct (night factor 1.0 at 19:00). Four Walking Street point lights at strength 1.6 with a 26 m linear falloff lit the whole street like daytime; switching them off in a probe gave a proper moonlit street.
  - The lamps are now warm local pools: strength 1.25, 15 m reach, quadratic falloff.
  - `suite_pai` checks the lamp ranges.
- **Astro-9 hover-lane crossing: still OPEN (not reproduced).**
  - A new 6-seed test passes on both pre-M1 and M1 code, so the market is ruled out as the cause.
  - The check stays in `suite_astro9_neon` and names any blocker.

### Semantic prop placement (`js/world_detail.js`)

- **Street clutter** (pots, chairs, crates, parked motorbikes) now stands against a real wall face, 0.1 m off it, only where a walkway of at least 1.2 m stays free beside it. It is never within 1.2 m of a mapped road, at an entrance, or in a no-decoration zone. Motorbikes park parallel to the wall.
- **Flowers** respect a world's `floraOK`. In Vienna there are no flower beds on the streets between blocks.
- Tested in every world: `suite_integration` "street clutter stands against walls" and `suite_vienna` "no flower beds on the city streets".

### Save safety (`js/core.js`)

- `AV.saveKey` can point at a sandbox key, so tests never touch the player's `apeverse_v09` save.
- Before the first overwrite in a session, the previous save is copied to `apeverse_v09_bak`. An unreadable or invalid main save falls back to it.
- An invalid state (non-numeric money, missing log) is never written.
- Test: `suite_integration` "save safety", 5 checks, including that the real save stays byte-for-byte untouched.

### Calmer NPC routines (base)

- **Chatting groups** talk and gesture; a wave is rare (3% per gesture, was 40% every 2.5–6.5 s).
- **Wanderers** stop and browse 55% of the time on arrival, for 10–25 s, facing a nearby shop or interaction. Random encounters interrupt browsing.
- **City crowd walkers** pause to look around more often (14%) and for longer (6–16 s).
- `AV.beings.stats` counts waves, dances and browsing. `suite_integration` "calm NPC routines in Vienna" measured 0.13 waves per person per minute (8 people near Stephansplatz, 1 minute).
  - Limitation: those 8 were standing or chatting rather than wandering, so this run did not exercise browsing.

### Test results (real GPU, functional)

| Suite | Result |
|---|---|
| `suite_integration` | 121/124 first run. All 3 misses were my new test or tuning (see below); the re-runs of those steps pass. |
| `suite_madrid` | 79/79 |
| `suite_pai` | 56/56 |
| `suite_vienna` | 76/77, then the lamp-strip fix, then 11/11 on the affected steps |
| `suite_cm` | 76/76 after fixing a timing assertion (below) |
| `suite_astro9_neon` | 38/38 |
| `suite_workers` (node runner, headless) | 50/52, then 52/52 on a re-run |

- **The 3 integration misses:**
  - the backup check needed an earlier-session save first
  - waving needed a larger sample and was tuned down further
  - the calm test moved from Ape Town (1 scripted being) to Vienna (27)
- **`suite_cm` timing:** the old check required waking at exactly 08:00. On a real GPU the clock runs about 2 game minutes before the check, so it now accepts 08:00–08:06.
- **`suite_workers` intermittents:** the pre-M1 code also fails 2 of 52 ("status lines drawn", "resumes after the chat"). These are timing intermittents in that suite, not M1 regressions.

## Open defects

| Defect | Status | Evidence / next step |
|---|---|---|
| Astro-9 hover-lane crossing (owner saw 24/25) | OPEN, not reproduced | passes under 6 seeds on old and new code; the blocker is named if it recurs |
| Madrid Pinar avenue block | **FIXED in M1** | Wandering Market placement; 6-seed test |
| Pai north route | **FIXED in M1** | same cause; 6-seed test |
| Pai daylight at 19:00 | **FIXED in M1** | over-strong street point lights |
| `suite_workers` 2 intermittent checks | OPEN (test timing) | present before M1 |
| Chiang Mai Giant Hostel entrance | verify | `suite_cm` 76/76 passes, including the hostel |

## Quality matrix (preliminary, from M0 shots and the ledger; 1 = weak, 5 = benchmark)

| World | Geometry/layout | Signage | Architecture | NPC routines | Interactivity | Performance evidence |
|---|---|---|---|---|---|---|
| Madrid (reference) | 4 | 3 | 3 | 3 | 3 | measured earlier |
| Da Nang (reference) | 4 | 4 | 4 | 3 | 3 | not measured this cycle |
| Chiang Mai | 4 | 3 | 3 | 3 | 4 | — |
| Astro-9 | 4 | 4 | 4 | 3 | 5 | GPU measured |
| Vienna | 4 | 4 | 4 | 2 | 3 | GPU measured (battery) |
| Pai | 3 | 2 | 2 | 2 | 3 | draw calls down, FPS unproven |
| Ape Town | 3 | 3 | 3 | 3 | 4 | heavy, unmeasured |
| Jungle Dub | 3 | 2 | 2 | 2 | 3 | heavy, unmeasured |
| Jerusalem | 2 | 1 | 2 | 2 | 2 | — |
| Judean Desert | 2 | 1 | 2 | 2 | 2 | — |
| Koh Samui Jurassic | 2 | 1 | 2 | 1 | 1 | — |
| Verdalux | 2 | 1 | 2 | 1 | 2 | — |

These are first-pass judgements to set priorities, not measurements.

## Milestones

| Milestone | Status |
|---|---|
| Vienna 7a–7f (architecture, city fabric, Innere Stadt, tram, streets, looks + haze) | DONE (see `CINEMATIC_V1_PROGRESS.md`) |
| M0 audit, baseline, registry, backup, asset inventory | DONE, except the PR listing (no credential) and Sevilla quarantine scoring |
| M1 collisions/placement/saves, semantic props, NPC routines base | DONE (see M1 section) |
| M2 Astro-9 districts | PARTIAL (earlier districts done; see `ASTRO9_CITY_PLAN.md`) |
| M3 Vienna remaining (NPC behaviours, Rathaus/Parliament, Heuriger, sparse districts) | PARTIAL |
| M4 Pai + Chiang Mai, Da Nang/Madrid | PLANNED |
| M5 vehicles, traffic, eat/drink/smoke economy | PLANNED |
| M6 merch pipeline, wardrobe, branded shops | **Implemented and verified** (see `docs/MERCH.md`): 43 designs, 4 brands (APEVERSE, MOONMELT SUPPLY CO., SOLTERRA, ZtonedApe), 4 enterable stores, try-on mirror, buy/wear/save, NPC prints; `suite_merch` 92/92. SWAG blocked (no artwork on disk). |
| M7 new real-world cities | PLANNED |
| M8 fantasy backlog | PLANNED |
| M9 release/QA/public deploy | PLANNED; public deploy needs owner authorisation |

## Assets

See `docs/ASSET_INVENTORY.md`.
- 5 of the 6 files the master prompt names are **missing** from disk.
- The artwork found (in the 23 Nov ZIP) is listed with hashes. **None is imported.**
