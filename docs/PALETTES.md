# M13: Palettes and haze

## What was washing the worlds white

The benchmark (docs/WORLD_BENCHMARK.md) found bright worlds veiled in white. I tested the causes one at a time in Da Nang, with controlled shots of the same view (`bench_images.mjs` numbers):

| Da Nang, noon | contrast | saturation |
|---|---|---|
| as it was | 0.211 | 0.077 |
| scene fog removed entirely | 0.209 | 0.079 (no change: **not fog**) |
| post-processing off | 0.294 | 0.163 |
| post on, **bloom at 0** | **0.303** | **0.183** (as good as post off: **bloom is the cause**) |

Even after the first M13 change, the default bloom still blew bright sand, paving and the noon sky into a veil. Its 2.6 HDR threshold is below what sunlit pale ground reaches. Sky tints made no measurable difference, and an earlier test hid every transparent mesh to rule those out.

## The fixes

**1. Day-scaled default bloom** (`js/gfx.js`).
- **Strength:** the default look now blooms at 20% strength by day, rising to ×1.45 at night, exactly as before.
- **Night:** neon, lamps and fire still glow at night; the Ape Town and Madrid night shots look the same.
- **Own grades:** worlds with their own grade (Astro-9) are unchanged.

**2. Per-world day exposure** (`sky.exp`, read by `js/sky.js`). A bright world can lower its daytime exposure; night stays at 1.27.

| World | Day exposure |
|---|---|
| Koh Tao, Da Nang | 0.80 |
| Koh Samui | 0.82 |
| Ape Town, Vienna | 0.85 |
| Pai | 0.90 |

**3. Sky tints** for the clear-day worlds: blue for Da Nang, Koh Samui, Koh Tao and Pai, and a lavender-blue for Ape Town that keeps its pink and purple identity. These keep distant haze blue-grey instead of white.

**4. Koh Tao** drops the special grade it got in M15. The shared default now handles bright daylight, and Koh Tao keeps only its lower exposure.

## Before → after

Midday screenshot, 3D view, same framing per world (NPCs move between runs). "Before" is the first benchmark, with the original default.

| World | contrast | saturation | near-white share |
|---|---|---|---|
| Vienna | 0.123 → **0.291** | 0.031 → 0.170 | 0.59 → 0.47 |
| Da Nang | 0.159 → **0.314** | 0.047 → 0.191 | 0.74 → 0.63 |
| Koh Samui | 0.143 → **0.348** | 0.074 → 0.275 | 0.60 → 0.57 |
| Ape Town | 0.174 → **0.266** | 0.082 → 0.214 | 0.62 → 0.52 |
| Jungle Dub | 0.184 → **0.278** | 0.135 → 0.332 | 0.43 → 0.37 |
| Pai | 0.167 → **0.270** | 0.204 → 0.595 | 0.13 → 0.12 |
| Koh Tao | 0.143 → **0.243** | 0.055 → 0.110 | 0.80 → 0.74 |
| Jerusalem | 0.143 → 0.168 | 0.155 → 0.206 | 0.14 → 0.17 |
| Judean Desert | 0.175 → 0.192 | 0.118 → 0.144 | 0.12 → 0.11 |
| Chiang Mai | 0.300 → 0.315 | 0.303 → 0.354 | 0.02 → 0.12 |
| Madrid | 0.293 → 0.306 | 0.369 → 0.449 | 0.15 → 0.21 |
| Astro-9 (own grade) | 0.251 → 0.276 | 0.719 → 0.694 | 0.01 → 0.02 |
| Verdalux | 0.208 → 0.145 | 0.630 → 0.813 | 0.04 → 0.00 |

**Reading the numbers:**
- Every washed world now has contrast in the Madrid and Chiang Mai range, 0.24–0.35.
- Verdalux's lower contrast is its dark violet palette without the daytime glow veil. Its fixed purple sky counts as night for bloom, so its mushrooms keep their full glow.
- Pai's saturation rose a lot. On screen it reads as vivid green valley rather than oversaturated.

**Regression (real GPU):** integration 131/131, kohtao 42/42, cm 76/76. gfx 40/44: the same 4 pre-existing "no post-processing in other worlds" checks that fail on the earlier commit; no new failures.

## Still pale, and why

**Noon sky.** It still renders very light (pale blue to white) in open-sky worlds such as Da Nang and Koh Tao. The sky model's noon radiance sits on the ACES highlight shoulder, and tints don't change that. A sky-specific day exposure in `sky.js`'s dome shader would be the next step. That's a shared change, so it needs its own before/after pass.

**Ground and façades.** Da Nang's sand and Vienna's paving are pale by design. Warmer albedo would push saturation further, which is an art call per world.

**Madrid nights.** These look nearly as bright as day, before and after this change. It's pre-existing and worth its own look (street and ambient light levels).
