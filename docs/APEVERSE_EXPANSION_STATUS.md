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

## Open defects (carried from the ledger)

| Defect | Status | Evidence / next step |
|---|---|---|
| Astro-9 megacity hover-lane crossing (owner saw 24/25) | OPEN, not reproduced | 6 runs, 3 builds; route checks now name the blocker |
| Madrid Pinar avenue intermittent block | OPEN | the blocked point moves, so a moving object is involved |
| Pai north route intermittent | OPEN | blocker recorded by the route check |
| Pai sky shows daylight at 19:00 in test shots | OPEN | Koh Samui shows night at 19:00 in M0 shots, so this looks Pai-specific; verify |
| Chiang Mai Giant Hostel entrance | verify | layout verified earlier; door passability to re-check |

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
| M1 collisions/placement/saves, semantic props, NPC routines base | PLANNED (next) |
| M2 Astro-9 districts | PARTIAL (earlier districts done; see `ASTRO9_CITY_PLAN.md`) |
| M3 Vienna remaining (NPC behaviours, Rathaus/Parliament, Heuriger, sparse districts) | PARTIAL |
| M4 Pai + Chiang Mai, Da Nang/Madrid | PLANNED |
| M5 vehicles, traffic, eat/drink/smoke economy | PLANNED |
| M6 merch pipeline, wardrobe, branded shops | BLOCKED on owner answers: the SOLTERRA/SOLVERA question for retail labels, and the missing pack files. In-game intake can start from the 23 Nov ZIP. |
| M7 new real-world cities | PLANNED |
| M8 fantasy backlog | PLANNED |
| M9 release/QA/public deploy | PLANNED; public deploy needs owner authorisation |

## Assets

See `docs/ASSET_INVENTORY.md`.
- 5 of the 6 files the master prompt names are **missing** from disk.
- The artwork found (in the 23 Nov ZIP) is listed with hashes. **None is imported.**
