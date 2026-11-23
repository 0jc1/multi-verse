# APEVERSE — CODEX AGENT 4: NEW CITIES STATUS

Last updated: 2026-11-23. Agent 4 owns ONLY new cities; Madrid, Astro-9 and vehicle physics remain exclusive to Agents 1–3.

## Source and collaboration status

- Source repository: `0jc1/multi-verse`.
- Audited development branch: `apeverse-v1-jungle-slice` at **`6cd5576657a9ebdaa52cf0d3fb098864abc9b9e7`**. This is the observed base; recheck the branch SHA before integrating changes.
- Repository files inspected through read-only GitHub connector: `README.md`, `docs/WORLDS_REBORN_STATUS.md`, `docs/KNOWN_LIMITATIONS.md`, `docs/TESTING.md`, `data/worlds.json`, `index.html`, core world/kit/social/shop/minimap/vehicle/city-life modules, and Madrid/Da Nang/Chiang Mai mature worlds.
- Original new-city art package **NOT AVAILABLE**: the owner mentioned `APEVERSE_CODEX_AGENT4_NEW_CITIES_PACK.zip` and its `REFERENCE_MAPS/`, city briefs, NPC packs and engine support, but neither the ZIP nor those assets was provided or present in the development branch. **Do not claim these maps or briefs were reviewed**. The owner-uploaded Agent 4 master prompt is included at `design/agent4_new_cities/AGENT4_MASTER_PROMPT.md`.
- Remote write **BLOCKED**: GitHub connector's `create_branch` action returned **HTTP 403 Resource not accessible by integration**. No Agent 4 remote branch, commit or pull request was created, and no shared branch was modified. Code is staged as an **offline patch package**, not yet integrated into the remote repository.
- Never merge or force-push another agent's work. When GitHub write permission is restored, create a fresh isolated branch from the current `apeverse-v1-jungle-slice` tip, integrate the package and open a draft PR.

## Per-destination implementation ledger

| World ID | Progress | Verified work | Unfinished quality gates |
|---|---|---|---|
| `seville` | **FIRST PLAYABLE-DISTRICT CODE MILESTONE — NOT COMPLETE** | Standalone world module + coherent layout; two physical bridges; ~7 cross-district test routes; distinctive architectural massing and local canvas texture materials; five real-walled, walk-through shops with purchase/NPC targets; 14 POIs; orange trees; walk-in Feria casetas, safe collision aisles, refreshments, dance interaction + toggle; maps/portal/shared rentals; static scene tests pass for all three quality presets | Full Madrid-quality city, accurate maps from ZIP, full Alcázar/Plaza de España/Alameda/Setas, extra enterable venues, richer NPC schedules, real soundscape, world streaming, photoreal asset calibration, browser screenshots and Windows/Android FPS testing |
| `koh_tao` | **PLANNED; NOT PLAYABLE** | Roadmap metadata only | Mae Haad home-base hostel, island topology/roads, Sairee, dive activities, Chloe fictional NPC, coastlines/reefs and boating |
| `paris` | **PLANNED; NOT PLAYABLE** | Roadmap metadata only | Physically connected Seine districts, bridges, Haussmann facades, venues, metro, Fête de la Musique |
| `amsterdam` | **PLANNED; NOT PLAYABLE** | Roadmap metadata only | Canals/bridges, bike priority, ferry to NDSM, King's Day; regional connection to Woodstock'69 **at Bloemendaal aan Zee** |
| `chefchaouen` | **PLANNED; NOT PLAYABLE** | Roadmap metadata only | Hillside medina, Ras El Maa, Kasbah, Rif trails and local arts event; **Café Hafa belongs in Tangier** |
| `oaxaca` | **PLANNED; NOT PLAYABLE** | Roadmap metadata only | Oaxaca City and linked **separate** San José del Pacífico, Puerto Escondido, Zipolite regions; Día de Muertos with respectful design |
| `rio_de_janeiro` | **PLANNED; NOT PLAYABLE** | Roadmap metadata only | Coast/hill/forest terrain, Lapa, Santa Teresa, beaches, cable car, Carnaval |
| `tokyo` | **PLANNED; NOT PLAYABLE** | Roadmap metadata only | Dense distinct neighborhoods, original Japanese signs, actual train travel, hanami |
| `new_york_1926` | **PLANNED; NOT PLAYABLE** | Roadmap metadata only | Period-accurate Harlem / Downtown Jazz Age, period transport and signs; **no completed Empire State Building and no 1929 Depression-era scenery** |

`data/agent4_worlds.js` deliberately marks unfinished worlds as **planned**, and Sevilla as **partial**. The common portal's actual reachability depends on `AV.worldDefs`, so only Sevilla has a new world definition. A preview is not a quality-completed destination.

## Sevilla implemented code — current milestone

- `js/agent4_seville_plan.js`: physically coherent, openly compressed city map. `x` increases east, `z` increases south; river blocks on-foot traversal except Isabel II and San Telmo bridges. This approximation must be refined against city maps and owner illustrations after their delivery.
- `js/world_seville.js`: registered `seville` world, independent of `js/world_madrid.js`, `js/world_astro9.js` and `js/vehicles.js`; textured local building geometry and prominent landmarks, 5 physical door-gap interiors, existing shop/stock/economy + staff conversation, original items with `sev_*` prefixes, orange trees, lamps, decorative festival, ambient layers, existing shared car/bike/scooter movement and rental hooks. Does **not** rewrite Agent 3's engine.
- `data/agent4_worlds.js`: additive metadata with separate IDs and descriptions. The 8 unfinished worlds are not registered as playable.
- `tools/apply_agent4_seville.mjs`: idempotently adds 3 script tags to `index.html`; intended integration edit for review; does not change other shared files.
- `tools/tests/agent4_seville_static.test.cjs`: offline mocked-scene build, route/collider/inventory target/festival/atlas checks, for Low/Medium/High presets.
- `tools/tests/agent4_seville_installer.test.cjs`: synthetic fixture confirms index-script changes are additive and idempotent.
- `tools/tests/suite_agent4_seville.js`: actual Apeverse browser runner checks including interact-to-buy, travel, physical routes and three screenshot viewpoints. **Written and syntax-checked, NOT browser-executed** without a complete runtime checkout.

## Evidence and quality gates

| Gate | Result | Basis |
|---|---|---|
| Code parses | PASS | `node --check` for new JavaScript files |
| World + eight planned IDs are unique | PASS offline | Metadata and registry static checks |
| Walkable crossings, no walking through the river | PASS offline | Seven documented route polylines tested at <=1 m intervals against generated wall/tree colliders |
| Initial five shop interiors have reachable doors and purchase targets | PASS offline | Target positions, walls and merchandise pointers tested against scene geometry |
| NPC / background crowd / vehicle reuse | PASS offline | Existing API calls verified under stubs; real animation/render not tested |
| Feria mode toggles, normal city remains | PASS offline | World state and registered targets tested |
| City route graph connected | PASS offline | BFS across all generated `mapNav` nodes |
| Browser scene loads and shops transact | NOT VERIFIED | Requires full repository and Chromium; authored dedicated test suite |
| Rendered screenshots show realistic architecture | NOT VERIFIED | No original new-city artwork, no full runtime/assets in local container |
| Windows HP Spectre x360 / Android input and FPS | NOT VERIFIED | Real-device QA and profiling required |
| Sector streaming and complete geography | NOT IMPLEMENTED | Next major engine/content milestone; avoid overpromising |
| Madrid-or-better overall quality | NOT ESTABLISHED | User's bar requires actual rendered review and more mature content |
| Remote Agent 4 commit and draft PR | BLOCKED | GitHub connector 403 on branch creation |

### Static-test geometry proxy counts (NOT GPU draw calls or measured FPS)

| Preset | Architectural/environment mesh pieces before per-material batching | Simulated named NPCs | Simulated ambient traffic |
|---|---:|---:|---:|
| Low | ~5,500 | 5 | 4 |
| Medium | ~14,700 | 8 | 8 |
| High | ~28,200 | 10 | 12 |

These are **mocked geometry submission counts** and do not establish rendering speed, geometry quality or memory use. On Low, individual facade embellishments are reduced and no per-venue lights are duplicated.

## Next development milestones (ordered)

1. **Recover/ingest reference pack.** Bring the 9 illustrated maps and city/engine briefs into `design/agent4_new_cities/` and reconcile POIs and regional geography; do not assume temporary map art is present.
2. **Obtain remote branch write access.** Rebase/review against the current development branch, copy unique Agent 4 files, apply the three script insertions, validate CI, open a **draft** PR. No automatic merges.
3. **Run the existing actual browser suite** (`tools/tests/suite_agent4_seville.js` via supported Windows PowerShell runner) plus regression smoke tests, capture and review images from Cathedral/Santa Cruz, Triana/river, and Plaza de España. Correct any actual render/runtime issues.
4. **Finish the first Sevilla quality benchmark:** refine historical street alignment and recognizable landmark models from actual references, add accurate entrance patterns/courtyard life and complete hero corridors (400–800 m); NPC schedules and venue uniqueness; more varied shop lettering, textures, grime, roof geometry; deeper festival dance/crowd schedules beyond initial vendor/dance interaction.
5. **Profile Windows and Android**, tune shader/texture/draw-call budgets, add spatial sectors/LOD/world streaming where existing architecture permits, document real frame metrics. Never infer FPS from the static test.
6. **Proceed in order** Koh Tao → Paris → Amsterdam → Chefchaouen → Oaxaca → Rio → Tokyo → New York 1926; maintain per-world ledger and do not mark a world complete until its full first-person portal-to-venue-to-return journey, visual review, NPC life, maps, seasonal mode and performance pass.

## Test and integration commands

From a full Apeverse clone after copying this package into the repo root:

```bash
node tools/apply_agent4_seville.mjs
node tools/apply_agent4_seville.mjs --check
for q in 0 1 2; do APEVERSE_AGENT4_Q=$q node tools/tests/agent4_seville_static.test.cjs; done
node tools/tests/agent4_seville_installer.test.cjs
node --check js/world_seville.js
```

On Windows PowerShell, the existing runner can execute `tools/tests/suite_agent4_seville.js`; see `README_AGENT4_PATCH.md`. Test the normal world's existing regression suites afterward. This milestone is intentionally isolated: **no changes to Madrid/Astro-9/vehicles/core/portal/minimap source files**.
