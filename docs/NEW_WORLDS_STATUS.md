# Apeverse 2 New Worlds: status (agent 2, branch `apeverse-2-new-worlds`)

Branched from `apeverse-2-living-worlds` at `6b369c7`, the last pushed commit, in a separate worktree (`apeverse-newworlds-wt`).
- **Dev server:** port 8098.
- **Never touched:** the main agent's worktree, its 8096 server and the 8095 preview.

**Merging:** nothing is merged automatically. The integration steps are at the bottom.

## 2.2 Interconnected cities (street network pass)

**Standard:** the owner's "Apeverse Interconnected Maze City Map": dense blocks, main roads plus side streets plus alleys, loops instead of dead ends, several routes between areas, bridges and crossings, and connections at the edges.

**The gate:** `tools/tests/suite_connect.js` runs on the real collision and the real pathfinder. It checks five things:
- **Reach:** every destination pair, with detour ≤ 2.2× + 40 m.
- **Second routes:** a 44 m roadblock is dropped across the found route, and a second route must exist (≤ 3.2×).
- **Street graph:** no unplanned dead ends in the GPS / pedestrian graph.
- **Pockets:** 60 random free points per area must reach the hub.
- **Walks:** long walks with player collision must not get stuck.

| Area | Before (baseline audit) | After |
|---|---|---|
| Shibuya + Harajuku | reach 91/91, 2nd routes 8/8 | **reach 171/171, 2nd routes 13/13** (more destinations), 5 long collision walks OK |
| Asakusa | **reach 31/36** (temple to north promenade 547 m) | **reach 66/66, 2nd routes 7/7** |
| Tokyo street graph | **46 dead ends** | **0** (1 planned terminus: the forest shrine; Shinjuku will continue it) |
| Saint-Germain + Seine | **reach 63/66** | **reach 153/153, 2nd routes 11/11** |
| Montmartre | **reach 27/28** | **reach 45/45, 2nd routes 6/6** |
| Paris street graph | **35 dead ends** | **0** (1 planned terminus: the cathedral door) |

No isolated pockets anywhere, before or after.

**What was built:**
- **Tokyo:**
  - the **West Lane** (Takeshita → back street → Center Gai → west road → shrine grove);
  - **Cat Street** (Center Gai → Takeshita, the real Shibuya–Harajuku back route), with two cross streets to the avenue and the West Lane;
  - the **arches lane** along the railway from the station to Harajuku, with standing bars under the arches, two cross streets and a link into the Harajuku plaza (the department store narrowed to make room);
  - **Nonbei alley**: tiny bars from the avenue into the yokochō, which no longer ends in a wall;
  - **GPS crossings** at the scramble and mid-block (the crowd still waits at the corners).
- **Asakusa:** a west street the full height of the district, a lane behind the temple, a south lane plus an alley to it, west and east gates into the precinct, and a second footbridge over the Sumida.
- **Paris:**
  - edge streets at both ends of the quais and boulevards (north and south banks);
  - **Rue de Rivoli** with arcades and three cross streets to the north quai;
  - **Rue Jacob** from the west edge into the Place;
  - a covered **passage** from the quai into the Place;
  - **Rue Dauphine** south to **Rue de Vaugirard**, which leads into the Luxembourg garden (now three entrances);
  - the **Pont de l'Archevêché** to the back of the Île. The Île is widened to ±24 m so the cathedral can be walked round; before, its towers sealed off the back of the island.
- **Montmartre:** edge streets up both sides of the hill, Rue du Chevalier round the basilica to the vineyard, a lane from the garden's east wall, and Rue Lepic widened to 10 m.

**Method:** new streets are cut with row "gaps". Lots inside a new street are skipped, but they still consume the same random numbers, so every other building, shop, sign and test stays identical. (Montmartre's skipped lots don't, so a few of its random façades changed.) The two cities went from about 730 to about 1,140 buildings.

**Regression:**
- `suite_tokyo`: 230/230.
- `suite_paris`: 181/181.

**Performance:** the frame samples fell (Tokyo 20–40 fps, Paris 23–32), but two other agents' headless GPU tests were running at the same time. Draw calls and triangles in the same views barely moved:
- **Tokyo draw calls:** scramble 388 → 403, Center Gai 125 → 128, Takeshita 62 → 76.
- **Paris triangles:** boulevard 184k → 295k; arrival 666k → 436k.

This needs a clean re-measure when the GPU is free.

## Ledger (failures first)

| World | State | Evidence |
|---|---|---|
| **Tokyo** (Shibuya + Harajuku + **Asakusa**) | **playable, 2 districts** | `suite_tokyo` on the real GPU (Medium), latest full run with Asakusa: **230/230**. Phone emulation (earlier, before Asakusa): 25/25. Another agent's GPU test ran at the same time, so the frame samples are noisy: arrival 24, scramble 55.2, Center Gai 36.8, Takeshita 59.2, yokochō 48.4, Nakamise 52, precinct 48.4, Sumida 58.8 fps. |
| **Paris** (Seine + Saint-Germain + **Montmartre**) | **playable, 2 districts** | `suite_paris` on the real GPU (Medium), latest full run with Montmartre: **181/181**. Frame samples: arrival 59.2, boulevard 60, quai 58.8, Buci 60.4, Boulevard de Clichy 55.6, terrace 57.6, Tertre 39.2 fps. Phone emulation (earlier, before Montmartre): 25/25. |
| Barcelona, Sevilla, Cádiz, Oaxaca, Rio, Chefchaouen, Medellín, NYC 1926, Ibiza, Galicia | not started | — |
| Atlantis, LSD-DMT, Somatra, Neon Nexus, Weird Alien, Bio Jungle, Robot World, Volcanic Funk, Quantum Ziggurat, Space Jazz, Mayan Canal Kingdom | not started (registry entries are still `planned`) | — |

**Sevilla note:** there is a separate Sevilla slice on `codex/agent4-sevilla-20261123`, quarantined (agent 4). It was not reused or touched; check it before building Sevilla.

### Performance (polish pass, 2026-11-27)

**What changed:** the static city geometry was one merged mesh per layer, so the whole city was drawn every frame. `AV.nwkit.chunked` now merges it per tile: 64 m tiles for solids, 128 m for glass, glow and signs. Frustum culling then skips what you can't see. Tokyo's giant screens also redraw at 5 fps instead of 10.

**A/B in one run:** the main agent's GPU tests were running at the same time, so separate runs weren't comparable. The profiler (`AV.nwkit.noChunks` debug switch) alternated old and new, two passes each, Medium, 1536×864:

| Tokyo view | One mesh per layer | Chunked |
|---|---|---|
| Scramble crossing | 34.9 fps | **56.0** |
| Center Gai | 37.7 | **59.6** |
| Yokochō | 44.7 | **59.8** |
| Takeshita | 48.4 | **60.3** |

Paris was already near the 60 fps cap in that run, both ways: 54–59 fps old, 54–60 new.

**Final full-suite samples** (one 2.5 s sample each, after the polish):
- **Tokyo:** arrival 50 fps (144 calls), scramble 60.4 (358), Center Gai 60.4 (145), Takeshita 60.4 (44), yokochō 49.2 (79).
- **Paris:** arrival 50.4 fps (172 calls, 415k tris), boulevard 60.4 (71, 185k), quai 60.4 (125, 335k), Buci 60 (66, 178k).

60 fps is the frame cap, so those views show headroom on this laptop, not how much.

**Phone emulation** (`run_tests.ps1 -Mobile`, 915×412, touch):
- detected as a phone, touch controls shown;
- the joystick walks you; ▶ Act opens shops;
- the shop and portal panels fit the screen; GPS works;
- 60 fps on this GPU. This is emulation on a laptop GPU, not a real phone.

**Build sizes:**
- **Tokyo:** about 418 buildings, about 12,700 parts, 986 signs.
- **Paris:** about 314 buildings, about 33,200 parts, 595 signs.

### Tokyo release-gate checklist

| Gate item | Status |
|---|---|
| Loads; spawn; portal; portal round trip to Ape Town and back | AUTO-TESTED |
| Connected routes: station, crossing, Center Gai, Udagawa, back street, south alley, shrine, yokochō, Shinsen alley, Harajuku, Takeshita, the forest shrine | AUTO-TESTED (12 legs) |
| Collisions: solid buildings, closed blocks, viaduct off-limits, shopfronts not walk-through | AUTO-TESTED |
| Six walk-ins reached through their doors | AUTO-TESTED |
| Shops: food and drink with effects, the ramen ticket flow, 9 sellers, vending, karaoke, sentō | AUTO-TESTED |
| Scramble: avenue green moves; red stops at the line; no red-light running; cars wait for you; the crowd crosses | AUTO-TESTED |
| Loop Line both ways (visible on the viaduct); taxi stand; bike rental; buying a bike and riding it | AUTO-TESTED |
| Live house: hours, ticket, gate, band → DJ music, bar, DJ booth, dance | AUTO-TESTED |
| Shrine, game center, 5 residents and their routines, Yumi's quest | AUTO-TESTED |
| Bon Odori on and off; GPS; save/load sandbox | AUTO-TESTED |
| Screenshots | recorded (scramble, ramen, yokochō, Loop Line, Harajuku, live house, shrine, matsuri, Takeshita, Center Gai) |
| Phone (emulated) | AUTO-TESTED (`suite_newworlds_mobile`) |
| Real phone, human playtest | **NOT DONE** |

## Integration steps (for the main agent; nothing here edits shared systems)

1. **`index.html`:** the only shared file edited. It adds, after `js/amsterdam_leidse.js`:
   ```html
   <script src="js/world_tokyo.js"></script>
   <script src="js/tokyo_life.js"></script>
   ```
   Paris adds `js/nw_kit.js`, `js/world_paris.js` and `js/paris_life.js` right after them (already in this branch).
2. **World registry:** `tokyo_life.js` pushes its own entry into `AV.WORLDS_DATA` at load (status `playable`), so `data/worlds.json` and `data/worlds.js` are untouched. To make it permanent, copy that object into `data/worlds.json`, regenerate `data/worlds.js`, and the runtime push becomes a no-op (it checks the id first).
3. **Shared registries** (Tokyo, and the same set for Paris: `paris`, `fete_musique`) are filled at runtime and guarded with `if (!...)`, the same pattern Amsterdam uses:
   - `AV.transit.CFG.tokyo`
   - `AV.rides.VEH.tokyo`
   - `AV.garage.ALLOW.tokyo`
   - `AV.garage.dealers.tokyo`
   - `AV.fest.LIST.bon_odori`
   - `AV.ambWorlds.presets.tokyo`
   - `AV.merch.shops.swag` (only if missing)
4. **ApeMart rollout:** `brand_district.js` ROLL is a closed constant, so Tokyo has its own walk-in ApeMart Express konbini selling the same brand items. To add Tokyo to the rollout instead, add `tokyo: ['コンビニ', 'jp_onigiri']` to ROLL.
5. **Save:** only a new optional `S.tokyo`. No existing save fields change.
6. **Districts:** `js/tokyo_asakusa.js` plugs into Tokyo through `TKY.asSurf`, `TKY.asakusa` and `TKY.asakusaLife` (load it after `tokyo_life.js`).
7. **Paris districts:** `js/paris_montmartre.js` plugs in through `PAR.mmSurf`, `PAR.montmartre`, `PAR.montmartreLife` and `PAR.mmWant` (load it after `paris_life.js`).
8. **Media:** no new media. Playlists used: `stone_ape_band`, `jungle_dub`, `chiang_mai`.
