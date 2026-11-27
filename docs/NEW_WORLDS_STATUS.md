# Apeverse 2 New Worlds: status (agent 2, branch `apeverse-2-new-worlds`)

Branched from `apeverse-2-living-worlds` at `6b369c7`, the last pushed commit, in a separate worktree (`apeverse-newworlds-wt`).
- **Dev server:** port 8098.
- **Never touched:** the main agent's worktree, its 8096 server and the 8095 preview.

**Merging:** nothing is merged automatically. The integration steps are at the bottom.

## Ledger (failures first)

| World | State | Evidence |
|---|---|---|
| **Tokyo** (Shibuya + Harajuku) | **playable, district 1 done** | `suite_tokyo` on the real GPU (Medium). Full run: 162/166. All four failures were test-side: a walk path into the wall, a too-short wait for a car, the GPS wait, and stop-line timing. After fixing them, every affected step passed in targeted GPU reruns (19/19 and 46/49). The remaining 3 in the 46/49 run were a step-filter artefact: "Loop Line: arrive at Harajuku" ran without the ride before it. **There is no single clean full run yet.** |
| **Paris** (Seine + Saint-Germain) | in progress | code written (`world_paris.js`, `paris_life.js`). **Not loaded in `index.html` yet, and not tested.** |
| Barcelona, Sevilla, Cádiz, Oaxaca, Rio, Chefchaouen, Medellín, NYC 1926, Ibiza, Galicia | not started | — |
| Atlantis, LSD-DMT, Somatra, Neon Nexus, Weird Alien, Bio Jungle, Robot World, Volcanic Funk, Quantum Ziggurat, Space Jazz, Mayan Canal Kingdom | not started (registry entries are still `planned`) | — |

**Sevilla note:** there is a separate Sevilla slice on `codex/agent4-sevilla-20261123`, quarantined (agent 4). It was not reused or touched; check it before building Sevilla.

### Tokyo measurements
Real GPU (`run_tests.ps1 -Gpu`, 1536×864, Medium), one 2.5 s sample each.

| View | FPS | Draw calls |
|---|---|---|
| Arrival (Haru plaza, 11:00) | 44.8 | 136 |
| Scramble crossing (screens, crowd, cars) | 32.4 | 305 |
| Center Gai (21:00) | 45.6 | 90 |
| Takeshita Street (21:00) | 36.4 | 33 |
| Chōchin Yokochō (21:00) | 34.0 | 59 |

- **Build:** 411 buildings, about 12,600 merged parts, 985 sign faces, 0 atlas overflow, 21 businesses placed.
- **Weakest view:** the scramble, from the crowd (softActor bodies), the instanced cars and the three canvas screens. If it needs to go faster, these are the levers:
  - fewer crossers on Medium;
  - screen updates at 5 fps;
  - merging the signal lamps.

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
| Mobile, human playtest | **NOT DONE** |

## Integration steps (for the main agent; nothing here edits shared systems)

1. **`index.html`:** the only shared file edited. It adds, after `js/amsterdam_leidse.js`:
   ```html
   <script src="js/world_tokyo.js"></script>
   <script src="js/tokyo_life.js"></script>
   ```
   When Paris is ready, add `js/nw_kit.js`, `js/world_paris.js` and `js/paris_life.js` in the same place.
2. **World registry:** `tokyo_life.js` pushes its own entry into `AV.WORLDS_DATA` at load (status `playable`), so `data/worlds.json` and `data/worlds.js` are untouched. To make it permanent, copy that object into `data/worlds.json`, regenerate `data/worlds.js`, and the runtime push becomes a no-op (it checks the id first).
3. **Shared registries** are filled at runtime and guarded with `if (!...)`, the same pattern Amsterdam uses:
   - `AV.transit.CFG.tokyo`
   - `AV.rides.VEH.tokyo`
   - `AV.garage.ALLOW.tokyo`
   - `AV.garage.dealers.tokyo`
   - `AV.fest.LIST.bon_odori`
   - `AV.ambWorlds.presets.tokyo`
   - `AV.merch.shops.swag` (only if missing)
4. **ApeMart rollout:** `brand_district.js` ROLL is a closed constant, so Tokyo has its own walk-in ApeMart Express konbini selling the same brand items. To add Tokyo to the rollout instead, add `tokyo: ['コンビニ', 'jp_onigiri']` to ROLL.
5. **Save:** only a new optional `S.tokyo`. No existing save fields change.
6. **Media:** no new media. Playlists used: `stone_ape_band`, `jungle_dub`, `chiang_mai`.
