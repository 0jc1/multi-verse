# Apeverse 2.2 Global Worlds — status (agent 4, branch `apeverse-2-global-worlds`)

Branched from `apeverse-2-living-worlds` at `e06e1a4` (its latest pushed commit), in a separate worktree
`Downloads\ape multiverse 1\apeverse-globalworlds-wt`, dev server on port **8100**.
Never touched: the other agents' worktrees and branches, the stable preview (8095), other ports, anyone's saves
(tests run in a fresh browser profile and use a sandboxed save key).

## Ledger (failures and gaps first)

| World | State | Evidence |
|---|---|---|
| **Sevilla** (district 1: Centro, Cathedral + Alcázar, Santa Cruz, Arenal, Triana, Los Remedios + the Feria ground) | **playable, optimised** | 157/157 desktop and 28/28 phone emulation on a quiet GPU; 54–60 fps on Medium, Feria entrance at night 58 fps; offline 14/14. See `docs/SEVILLA.md`. |
| **Cádiz** (the whole old town on its peninsula + Carnaval) | **playable** | 108/108 on a quiet GPU; 51–60 fps on Medium; offline 13/13. See `docs/CADIZ.md`. |
| **Oaxaca** (centro histórico, Jalatlaco, Cerro del Fortín, Panteón + Día de Muertos) | **playable** | 84/84 on a quiet GPU; 46–60 fps; offline 12/12. The doorway and graph-island checks are fixed. See `docs/OAXACA.md`. |
| **Chefchaouen** (the blue medina on its hillside + Festival Alegría) | **playable** | 65/65 (queued); 40–56 fps, and the festival is the heaviest at 40; offline 11/11. See `docs/CHEFCHAOUEN.md`. |
| **Rio de Janeiro** (district 1: Copacabana + Leme + Carnaval de rua) | **playable** | 70/70 (queued); 47–54 fps. See `docs/RIO.md`. Lapa and Santa Teresa are not built. |
| Ibiza, Medellín, northern Spain, New York 1926 | not started | — |
| **All five built worlds together** | smoke test | `suite_gw_smoke.js` 33/33; `node tools/tests/gw_load_check.cjs` (offline load of every agent-4 script) all good. |
| Atlantis, Somatra, Neon Nexus, Dream dimension, Bioluminescent Jungle, Robot World, Volcanic Funk, Space Jazz, Mayan Canal Kingdom, Quantum Ziggurat, Alien Maze X-9 | not started (registry entries untouched, still `planned`) | — |

**Earlier Sevilla work.** The quarantined slice on `codex/agent4-sevilla-20261123` (world id `seville`) was audited, not merged:
- it was never run in a browser;
- it laid out a sparse grid of 1.2 km roads, which is the opposite of the "maze city" brief.

What was reused:
- the geography (river, two bridges, district list);
- the POI list;
- the Feria design (walk-in casetas that exist only during the fair);
- the item ideas.

The new world id is `sevilla`. Do not merge the old branch alongside it.

## The street-network-first kit (`js/gw_kit.js`, reusable for every next city and planet)

1. **Author the network as data.** A `<city>_plan.js` file lists:
   - streets, lanes and alleys (polylines with widths);
   - plazas, open ground and water;
   - bridges (arched, walkable);
   - landmark footprints, plus walkable carve-outs inside landmarks;
   - the arrival point;
   - landmark pairs that must route.
2. **Rasterise it.** The network becomes 0.5 m cells, then a walk mask eroded by 0.5 m. The world's `surface()` answers from that mask, so buildings are solid exactly where the plan says. No collider lists are involved: the engine already treats `surface() === null` as a wall and slides along it.
3. **Check it offline before building anything.** `node tools/tests/gw_net_check.cjs <city>` (no browser) checks:
   - one connected walking graph;
   - a raster flood fill from the arrival;
   - accidental dead ends, as opposed to streets marked `cul` (intentional callejones);
   - walkable ground touching the map edge (invisible walls);
   - every landmark pair routed **plus an alternative route**.

   It also writes a PNG map.
4. **Then build.**
   - Frontage lots line every street and plaza edge, each as deep as its block allows.
   - Filler covers leftover block land: blank convent walls where visible, roofs where not.
   - `medHouse()` builds Mediterranean houses: plinths, painted surrounds, iron rejas and balconies, cierros, pots, azoteas or tile roofs, miradores.
   - Walk-ins are carved out of their lot with a real 2 m door.
   - Chunked merging lets frustum culling skip tiles you can't see.
   - Sign atlases include azulejo tile-panel lettering.
5. **Toggles at runtime.** `N.setCode(poly, code)` repaints the mask and re-erodes it locally. The Feria uses this to make its caseta walls solid only while the fair is on.

The checks run again in-game after every prop (trees, lamps, kiosks) has been placed. The result is exposed as `AV.sevilla.rep`, and the test suite asserts it.

## Kit additions since Sevilla

- **`js/gw_city.js` (the city dresser):**
  - `GW.dress`: houses, shopfronts, signs, window displays, awnings, lanterns, plaques, special businesses, walk-ins with a door and a tiled, beamed interior, filler walls, ground, the sea and quay walls, trees, palms, lamps, hills.
  - `GW.finish`: chunked merging, distance LOD for house detail and signs, nothing drawn beyond the fog, night lighting.
  - `GW.seasonal`: seasonal festivals, with a manual switch.
  - `GW.paint`: sign painters.
  - Cádiz and Oaxaca are built entirely on it; Sevilla predates it.
- **`js/gw_kit.js`:**
  - land masks (coastlines);
  - car masks (`W.noCar`);
  - hidden-dead-end detection (a street drawn across a landmark);
  - slope-aware houses with foundations;
  - flat ground quads;
  - `N.setCode` for festival structures that become solid only while the festival runs.
- **Festivals are seasonal, not weekly:**
  - Sevilla's Feria in the 4th week of every 4-week Apeverse cycle;
  - Cádiz's Carnaval in the 2nd;
  - Oaxaca's Día de Muertos in the 3rd;
  - Chefchaouen's Festival Alegría in the 1st;
  - Rio's Carnaval de rua in the 2nd, alongside Cádiz.

  Each has an in-world "festival mode" panel (Seasonal / On now / Off), saved per world.
- **`tools/tests/gpu_queue.ps1`:** the shared GPU-test lock (`%TEMP%apeverse_gpu.lock`). It is taken atomically. After taking it, the wrapper still waits for other agents' headless test browsers to finish. Every GPU number in these docs since the Sevilla optimisation comes from a queued run.

## Integration (nothing is merged automatically)

Branch `apeverse-2-global-worlds`. Files added (all new, owned by agent 4):

- `js/gw_kit.js`
- `js/sevilla_plan.js`
- `js/world_sevilla.js`
- `js/sevilla_landmarks.js`
- `js/sevilla_life.js`
- `tools/tests/gw_net_check.cjs`
- `tools/tests/suite_sevilla.js`
- `tools/tests/suite_sevilla_perf.js`
- `docs/GLOBAL_WORLDS_STATUS.md`
- `docs/SEVILLA.md`

**Shared-file changes:**
- **`index.html`:** script tags right after `js/amsterdam_noord.js`, in this order: `gw_kit`, `gw_city`, `sevilla_plan`, `world_sevilla`, `sevilla_landmarks`, `sevilla_life`, `cadiz_plan`, `world_cadiz`, `cadiz_life`, `oaxaca_plan`, `world_oaxaca`, `oaxaca_life`, `chefchaouen_plan`, `world_chefchaouen`, `chefchaouen_life`, `rio_plan`, `world_rio`, `rio_life`.
- **`js/rides.js`:** one line. Taxi pickup and drop-off legs also require `!(W.noCar && W.noCar(x, z))`, so cars stay out of pedestrian lanes. Worlds without `noCar` behave as before.

**Registration happens at runtime, guarded, following the Amsterdam / Tokyo pattern:**
- `AV.registerWorld('sevilla')`;
- a `WORLDS_DATA` push (status `playable`);
- `AV.fest.LIST.feria_abril`;
- `AV.transit.CFG.sevilla`, `AV.rides.VEH.sevilla`, `AV.garage.ALLOW.sevilla`;
- `AV.ambWorlds.presets.sevilla`.

None of these files is edited.

**Agent 3's audio API:** `AV.snd` (branch `apeverse-2-gameplay-audio`) is now used where present: zone, place, venue, step material. Every call is guarded with `if (AV.snd)`. Originally, no shared audio API had been published. Sevilla's sound goes through the existing `AV.ambWorlds` preset registry: positional by place and time of day, plus procedural flamenco guitar, palmas and hooves. Agent 3's engine is not modified. When their API lands, the preset can be re-registered there.

**Merging with agent 2's branch** (`apeverse-2-new-worlds`): the only file both branches touch is `index.html`, where both add script tags after the Amsterdam block. Keep both blocks. File names don't collide: agent 2's kit is `nw_kit.js`, this one is `gw_kit.js`.

**Save compatibility:** new state lives only in the optional `S.sev`. Items are new `sev_*` ids. Old saves load unchanged.

**Tests:**
- `node tools/tests/gw_net_check.cjs sevilla` (offline network gates);
- `run_tests.ps1 -Suite tools/tests/suite_sevilla.js -Gpu -W 1536 -H 864 -Port 8100 -StepTimeout 900` (about 20 minutes, real GPU).
