# M13: Frame rate, the diagnosis (no speed-up shipped yet)

The benchmark flagged five worlds under 30 fps on battery: Da Nang, Pai, Astro-9, Chiang Mai and Jungle Dub. Ape Town makes the most draw calls. This pass was run on mains power, on the real GPU at Medium, to find out *what* limits the frame before changing anything.

## Measurements

**1. Where the work goes** (`tools/tests/suite_perf_worlds.js`). This counts visible meshes in the camera's view at each arrival point.
- **Characters dominate everywhere:** 50–90 animated (skinned) meshes cost 0.5–2.0M triangles, more than all scenery combined.
- **Character LOD is at its caps:** on Medium, 10 near and 18 mid characters are drawn in full detail; the rest are ~150-triangle stand-ins or hidden.
- **Ape Town:** 800+ draw calls, of which 500+ are unmerged static meshes.
- **Da Nang's parked scooters** (487k triangles) are fine: about 1k triangles each, instanced and culled per street. There are just hundreds of them.

**2. What limits the frame** (`tools/tests/suite_perf_bottleneck.js`). FPS with one thing removed at a time:

| | Ape Town | Jungle Dub |
|---|---|---|
| as is | 43–46 | 49–56 |
| **characters hidden** | **58** | **60** |
| animation frozen (mixers + skeletons) | 45 (no gain) | 52 |
| post-processing off | 47 | 53 |
| half render resolution | 49 | 60 |

A second test swapped every character material from `MeshPhysicalMaterial` to `MeshStandardMaterial`. It made no difference beyond noise: 48 → 50, then 45 → 46.

**3. CPU or GPU** (`tools/tests/suite_perf_cpu.js`). Time per frame:

| | fps | world JS | render call (CPU side) |
|---|---|---|---|
| Ape Town | 41.6 | 3.7 ms | **17.5 ms** |
| Jungle Dub | 55.8 | 3.6 ms | 13.6 ms |
| Da Nang | 47.4 | 3.5 ms | 12.0 ms |

**Conclusion.** The frame is limited by **CPU time inside the render call**: three.js walking the scene and issuing draw calls, including per-frame bone-texture uploads for every animated mesh.
- **Not the cause:** triangle count, character materials, animation maths and game logic. Game logic is only about 3.5 ms.
- **The lever is draw calls,** especially characters. Each is about 4 separate skinned meshes (body, clothes, head and so on); Ape Town has 22 characters as 83 animated meshes.

## Tried and reverted

**The change.** Lower character caps on Medium: 10 → 7 near and 18 → 12 mid.

**Work per frame went down:**
- Da Nang: 3.05M → 2.0M triangles, 551 → 312 draw calls
- Jungle Dub: 3.46M → 1.92M triangles, 642 → 495 draw calls

**But the frame rate gain couldn't be shown.** In alternating runs against the previous commit, the laptop's thermal drift was larger than the effect:
- Ape Town's render call took 15.6 ms on the first baseline run and 25.8 ms on the second.
- The same baseline, run twice, differed by up to 13 fps.

**Why reverted.** The change would also turn more characters 24–48 m away into crude stand-ins, a visible cost for a gain I can't prove. Per the project rule, no performance gain is claimed without evidence. The probe suites stay in the repo so the next attempt can be measured the same way.

## What should actually help (next)

1. **One draw call per character.** Merge each character's skinned parts (sharing one skeleton) into a single skinned mesh with per-vertex colours, in `chars_soft`. That cuts ~4 draw calls and 4 bone uploads to 1, with no visual change.
2. **Static batching in Ape Town.** Merge its 500+ unchanging meshes by material. This needs a careful list of which meshes the world animates or toggles (signs, doors, festival groups) so none get frozen.
3. **Measure with a stable rig.** Run A/B on a cooled machine, alternating at least three times, and use the render-call time from `suite_perf_cpu.js` rather than FPS alone.

## Existing budget suite

`tools/tests/suite_perf.js` (High quality) currently fails its budgets in Ape Town (8.62M triangles, 1426 draw calls) and Pai (7.59M triangles, 129 characters). That reflects the same character load, and it's logged as an open item.
