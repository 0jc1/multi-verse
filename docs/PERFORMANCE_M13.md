# M13: Frame rate, diagnosis + baked mid-distance characters

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

## Shipped: baked mid-distance characters (`js/perf_guard.js`)

**What the bake does.** In the mid tier (24–48 m on Medium; 40–80 m on High), a character used to keep all its parts.

- **Merge:** its opaque skinned parts sharing one skeleton (body, shirt, pants, shoes) are now merged **once** into a single skinned mesh.
- **Colours:** the material's 4-slot colour blend, ambient occlusion and the **shirt print (decal)** are baked into vertex colours, with the same formulas as `pbr.js`. NPC designs from M6 stay visible.
- **Small parts:** eyes and eyelids are hidden in this tier.
- **How parts are hidden:** through render layers, not `.visible`, because the game re-shows eyes and lids every frame for blinking.
- **Lifecycle:** built lazily, and rebuilt if a character's parts or materials change. Near characters are untouched, and walking up restores full detail.
- **Off switch:** `AV.perf.bakeMid = false`.

**In-session A/B** (`tools/tests/suite_bake.js`). The bake is toggled on and off 3 times, seconds apart, with a static camera, so thermal drift can't swamp it.

| World | draw calls off → on | render-call CPU ms | FPS |
|---|---|---|---|
| Jungle Dub | 629 → **477** (−24%) | 14.8 → 14.1 | 46.8 → 49.3 |
| Da Nang | 535 → **454** (−15%) | 13.7 → 13.3 | 43.8 → 44.1 |
| Pai | 556 → **492** (−12%) | 12.8 → 12.2 | 51.1 → 51.4 |
| Astro-9 | 452 → **415** (−8%) | 17.8 → 16.6 | 51.7 → 51.2 |
| Ape Town | 842 → **813** (−3.5%) | 16.8 → 15.5 | 41.9 → 44.4 |

**Reading the results:**
- **Draw calls** fall consistently in every world.
- **Render time** is 4–8% lower on average in all five.
- **FPS** gains are small (0–6%), and individual runs overlap, so **no large speed-up is claimed**.
- **Ape Town** gains least: its cost is its 500+ static meshes, not its characters.

**Visual check.** In the same Jungle Dub view with the bake off and on, the dancing crowd 25–35 m away looks the same (clothes, colours, shapes).

**Regression (real GPU):** integration 131/131, npc 84/84, merch 92/92 (NPC prints), band 62/62, fest 38/38, kohtao 42/42, consume 47/47, cm 76/76. gfx 40/44: the same 4 pre-existing failures.

**Bugs found on the way:**
- **r128 attributes:** they lack `getComponent`. The error escaped into the frame loop, so the bake is now wrapped and never breaks a frame.
- **Blinking eyes:** `.visible` hiding was undone by blinking.
- **Re-saved masks:** re-applying the bake re-saved already-hidden masks, which would have hidden parts permanently.

## What should actually help (next)

1. **Done for the mid tier** (above). Near characters keep their full multi-material detail. Each still drags along ~40 small accessory meshes (beads, jewellery), which could be merged per character too.
2. **Static batching in Ape Town.** Merge its 500+ unchanging meshes by material. This needs a careful list of which meshes the world animates or toggles (signs, doors, festival groups) so none get frozen.
3. **Measure with a stable rig.** Run A/B on a cooled machine, alternating at least three times, and use the render-call time from `suite_perf_cpu.js` rather than FPS alone.

## Existing budget suite

`tools/tests/suite_perf.js` (High quality) currently fails its budgets in Ape Town (8.62M triangles, 1426 draw calls) and Pai (7.59M triangles, 129 characters). That reflects the same character load, and it's logged as an open item.
