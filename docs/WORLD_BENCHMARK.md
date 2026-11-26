# M13: World benchmark (first slice)

M13 brings every world up to the Madrid benchmark. Before upgrading worlds one by one, I measured all 13 so the work goes where the gaps are.

**Tools:**
- `tools/tests/suite_worlds.js` loads every playable world and records its numbers. It also takes a midday screenshot of each world, plus night shots of Ape Town, Madrid and Koh Tao.
- `tools/bench_images.mjs` turns the screenshots into image numbers: contrast, saturation, and the share of near-white pixels in the 3D view (HUD strips excluded). It has no dependencies.

```
run_tests.ps1 -Suite tools/tests/suite_worlds.js -Gpu
node tools/bench_images.mjs <before dir> [<after dir>]
```

## Scorecard

Real GPU, Medium, laptop on battery. FPS is a 4 s sample at the arrival point, noon (not a performance claim).

**What the columns mean:**
- **roads / nav:** the minimap road graph, and the city walking graph used for GPS.
- **crowd nav:** whether the crowds walk a graph.
- **amb:** ambient sound layers.
- **grade:** whether the world has its own post-processing grade or uses the default.

| World | places | roads / nav | crowd nav | interactions | crowd | amb | grade | draw calls | FPS |
|---|---|---|---|---|---|---|---|---|---|
| **Madrid (benchmark)** | 81 | 688 / 1584 | ✓ | 70 | 395 + 10 residents | 8 | default | 151 | 46 |
| Ape Town | 14 | – / – | – | 93 | 20 | 0 (music) | default | 857 | 35 |
| Verdalux | 3 | – / – | – | 21 | 0 | 0 | default | 224 | 53 |
| Pai | 15 | 15 / – | ✓ | 47 | 94 | 11 | default | 471 | 24 |
| Astro-9 | 63 | – / – | – | 218 | 61 beings | 8 | own | 434 | 25 |
| Jungle Dub | 16 | – / – | – | 81 | 12 | 0 (music) | default | 479 | 28 |
| Chiang Mai | 10 | 19 / – | ✓ | 74 | 89 | 0 (music) | default | 390 | 26 |
| Jerusalem | 10 | – / – | ✓ | 47 | 40 | 0 | default | 313 | 40 |
| Judean Desert | 6 | – / – | ✓ | 40 | 23 | 0 | default | 349 | 39 |
| Vienna | 15 | 48 / – | – | 87 | 27 + 41 beings | 0 (music) | default | 320 | 41 |
| Da Nang | 9 | – / – | ✓ | 50 | 135 | 0 (music) | default | 346 | 22 |
| Koh Samui (Jurassic) | 8 | – / – | – | 18 | 10 | 0 | default | 94 | 60 |
| Koh Tao | 7 | 9 / – | ✓ | 7 + tables | 38 | 7 | own | 147 | 48 |

## The shared fix in this slice: the default grade washed bright worlds white

Every world without its own grade uses the default post-processing (`js/gfx.js`, since V0.10).
- **Old default:** bloom strength 0.5, radius 0.55, threshold 1.55 (HDR).
- **Effect:** bright daytime sky and pale ground bloomed into a white veil over everything. Koh Tao showed it first (M15); the benchmark found it in Vienna, Da Nang, Koh Samui and Ape Town too.
- **New default:** bloom 0.32 / 0.42 / threshold 2.6 (HDR; 0.96 LDR), contrast 1.06, saturation 1.12.
- **Night:** the existing night boost (×1.45 strength, threshold ×0.52) keeps night glow.

**Before → after**, midday screenshot, 3D view only. The frames are the same; NPCs move a little between runs.

| World | contrast | saturation | near-white share |
|---|---|---|---|
| Vienna | 0.123 → **0.210** | 0.031 → 0.073 | 0.59 → 0.51 |
| Koh Samui | 0.143 → **0.195** | 0.074 → 0.106 | 0.60 → 0.58 |
| Da Nang | 0.159 → **0.190** | 0.047 → 0.071 | 0.74 → 0.74 |
| Jungle Dub | 0.184 → **0.220** | 0.135 → 0.202 | 0.43 → 0.41 |
| Pai | 0.167 → **0.199** | 0.204 → 0.229 | 0.13 → 0.27 |
| Chiang Mai | 0.300 → 0.313 | 0.303 → 0.354 | 0.02 → 0.12 |
| Madrid | 0.293 → 0.309 | 0.369 → 0.409 | 0.15 → 0.23 |
| Ape Town | 0.174 → 0.177 | 0.082 → 0.091 | 0.62 → 0.60 |
| Jerusalem | 0.143 → 0.138 | 0.155 → 0.170 | 0.14 → 0.19 |
| Judean Desert | 0.175 → 0.177 | 0.118 → 0.124 | 0.12 → 0.13 |
| Astro-9 (own grade) | 0.251 → 0.232 | 0.719 → 0.732 | 0.01 → 0.01 |
| Verdalux | 0.208 → 0.204 | 0.630 → 0.778 | 0.04 → 0.04 |
| Koh Tao (own grade) | 0.143 → 0.172 | 0.055 → 0.058 | 0.80 → 0.77 |

**What improved:** objects near you are now crisp instead of veiled, as in the Vienna shots. Night still glows: the Ape Town night shot looks the same before and after.

**What didn't:** the near-white share stays high in Vienna, Da Nang, Ape Town and Koh Samui. The remaining paleness is their **palette and distant atmosphere**: white paving, cream plaster, pale sand, and distant buildings still hazy. That's per-world work, below.

**Pre-existing test failures, not caused by this change.** `suite_gfx` has four "other worlds have no post-processing" checks that also fail on the previous commit, run as a baseline worktree. They still expect V0.9.6 behaviour, from before every world got the default bloom (V0.10). They're logged, not rewritten.

## Gaps against the Madrid benchmark, in priority order

1. **No street graph for GPS. Done:** `js/pathfind.js` routes every world over a collision grid (see docs/GPS.md). What remains is drawing streets on the minimap for worlds without `mapRoads`. These worlds have no minimap roads or walking graph, so the GPS line is straight:
   - Ape Town, Verdalux, Astro-9, Jungle Dub, Jerusalem, Judean Desert, Da Nang, Koh Samui.
   - Vienna, Chiang Mai and Pai have roads but no walking graph.
2. **Palette and haze. Mostly done:** see docs/PALETTES.md. The cause was the default bloom; it is now day-scaled, with per-world day exposure and sky tints. The noon sky stays pale, as noted there. Vienna, Da Nang, Ape Town and Koh Samui are still pale: more saturated ground and façades, and a per-world grade or fog tint where needed.
3. **No ambient sound layers. Done:** `js/ambience_worlds.js` (see docs/AMBIENCE.md). Ape Town, Verdalux, Jungle Dub, Chiang Mai, Jerusalem, Judean Desert, Vienna, Da Nang and Koh Samui have none, though most have music. Madrid, Pai, Astro-9 and Koh Tao do.
4. **Low FPS** (under 30 on battery):
   - Da Nang 22, Pai 24, Astro-9 25, Chiang Mai 26, Jungle Dub 28.
   - Ape Town draws 857 calls; its draw calls need batching.
5. **The 2.0 systems are mostly Madrid-only:**
   - residents (M11), traffic (M7C), table service (M12, also Koh Tao and Pai)
   - player businesses (M9), housing (M8), delivery shifts (M16)
6. **Thin worlds:** Verdalux (3 places, no crowd) and Koh Samui (8 places, 18 interactions).
