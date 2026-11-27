# Apeverse 2.2 Global Worlds — status (agent 4, branch `apeverse-2-global-worlds`)

Branched from `apeverse-2-living-worlds` at `e06e1a4` (its latest pushed commit), in a separate worktree
`Downloads\ape multiverse 1\apeverse-globalworlds-wt`, dev server on port **8100**.
Never touched: the other agents' worktrees and branches, the stable preview (8095), other ports, anyone's saves
(tests run in a fresh browser profile and use a sandboxed save key).

## Ledger (failures and gaps first)

| World | State | Evidence |
|---|---|---|
| **Sevilla** (district 1: Centro, Cathedral + Alcázar, Santa Cruz, Arenal, Triana, Los Remedios + the Feria ground) | **playable, 1 connected district** | See `docs/SEVILLA.md` (test results, frame samples, screenshots, limitations). |
| Cádiz, Oaxaca, Rio de Janeiro, Chefchaouen, Ibiza, Medellín, northern Spain, New York 1926 | not started | — |
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

**The only shared-file change:** 5 `<script>` tags in `index.html`, right after `js/amsterdam_noord.js`, in this order:
1. `gw_kit`
2. `sevilla_plan`
3. `world_sevilla`
4. `sevilla_landmarks`
5. `sevilla_life`

**Registration happens at runtime, guarded, following the Amsterdam / Tokyo pattern:**
- `AV.registerWorld('sevilla')`;
- a `WORLDS_DATA` push (status `playable`);
- `AV.fest.LIST.feria_abril`;
- `AV.transit.CFG.sevilla`, `AV.rides.VEH.sevilla`, `AV.garage.ALLOW.sevilla`;
- `AV.ambWorlds.presets.sevilla`.

None of these files is edited.

**Agent 3's audio API:** no shared audio API had been published when this was written. Sevilla's sound goes through the existing `AV.ambWorlds` preset registry: positional by place and time of day, plus procedural flamenco guitar, palmas and hooves. Agent 3's engine is not modified. When their API lands, the preset can be re-registered there.

**Merging with agent 2's branch** (`apeverse-2-new-worlds`): the only file both branches touch is `index.html`, where both add script tags after the Amsterdam block. Keep both blocks. File names don't collide: agent 2's kit is `nw_kit.js`, this one is `gw_kit.js`.

**Save compatibility:** new state lives only in the optional `S.sev`. Items are new `sev_*` ids. Old saves load unchanged.

**Tests:**
- `node tools/tests/gw_net_check.cjs sevilla` (offline network gates);
- `run_tests.ps1 -Suite tools/tests/suite_sevilla.js -Gpu -W 1536 -H 864 -Port 8100 -StepTimeout 900` (about 20 minutes, real GPU).
