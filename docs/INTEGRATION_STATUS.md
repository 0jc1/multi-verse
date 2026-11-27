# Apeverse 2.2 integration build: status (2026-11-27)

- **Branch:** `apeverse-2-integration`
- **Worktree:** `Downloads\ape multiverse 1\apeverse-integration-wt`
- **Play:** http://localhost:8101/index.html (start it with `tools\serve.ps1 -Port 8101 -NoBrowser`)

Nothing was merged into `main`. The four agents' worktrees, their uncommitted work, and the stable preview on 8095 were not touched. Local-only media (the 68 files in `.git/info/exclude`) is hard-linked in from the GitHub checkout.

**No human playtest of this build yet.** Everything below comes from automated runs: headless Chrome on the real GPU, 1536×864, with a sandboxed save. GPU runs were serialised through the shared `%TEMP%\apeverse_gpu.lock`.

## Failures and open items first

| Item | Where | Status |
|---|---|---|
| GPS in Rio: 725 ms (limit 400) | agent 4, `world_rio.js` / `pathfind.js` | New with Rio (round 7). The route is found, it's just slow. |
| GPS in Astro-9 takes 1.1–1.3 s for trips under 220 m | agent 1, `pathfind.js` | Already failing before integration (agent 1 reported it). Fix needs a shared `pathfind.js` change. |
| GPS in Astro-9: 601 ms in round 7 | agent 1 | Same issue as the row above. Koh Samui now passes (the earlier 506 ms was CPU load from other agents). |
| Amsterdam: Yara's "get me a kroket" waypoint vanishes immediately | agent 1, `amsterdam_leidse.js` / `minimap.js` | Real minor bug, not caused by the merge. The snack wall is 8.8 m from Yara, and the minimap clears any waypoint under 12 m away as "arrived". Reported to agent 1. |
| Consumables: `AV.bag.busy()` is false for 350 ms between auto-bites | agent 3, `consume.js` | Not visible in play. Agent 3 has a fix planned after the playtest. The city suites work around it test-side. |
| GPS across subway-only districts (Shibuya→Asakusa, Saint-Germain→Montmartre) | agent 2 | Route groups were added in `295a755` and are merged; the GPS no longer tries to walk between them. Optional follow-up (agent 1 + 2): `W.routeVia` so the GPS points you to the subway entrance. |
| Not in this build | — | No businesses in the new cities yet (businesses exist in Chiang Mai, Madrid, Pai, Astro-9). Sound 2.0 has 35 CC0 recordings; the rest is procedural. |

## What went in (all four branches at their pushed tips)

| Branch | Tip | Content |
|---|---|---|
| `apeverse-2-living-worlds` (base) | `d923a22` | Amsterdam (4 districts), Chiang Mai / NPC / storefront / Madrid corrections, **Vienna full rebuild**, **Astro-9 interconnected city** + `walk_graph.js` |
| `apeverse-2-new-worlds` | `295a755` | **Tokyo** (Shibuya + Harajuku, Asakusa, Shinjuku), **Paris** (Seine + Saint-Germain, Montmartre), **Barcelona** (Eixample, Rambla, Gòtic, Raval, Born, port, Gràcia, Barceloneta), businesses on the new streets, GPS route groups |
| `apeverse-2-global-worlds` | `09fe3e2` | `gw_kit` + `gw_city` (slope-aware ground drape), **Sevilla** (optimised, Feria de Abril), **Cádiz** (Carnaval), **Oaxaca** (Día de Muertos, island + door fixed), **Chefchaouen**, **Rio** (Copacabana + Leme) |
| `apeverse-2-gameplay-audio` | `8828716` | Consumables 2.0, Sound 2.0 (+35 CC0 recordings), Business Empire (café, bar, farm, courier, **hostel**), cultivation, garage parts, dev cheats, family demo, atomic GPU-lock script |

There are 22 registered worlds, all listed as open in the portal pipe.

## Conflicts and integration fixes

- **`index.html`:** the only textual conflict, in five merges. Script tags from all branches were kept, in this order: Amsterdam → Tokyo / Paris / Barcelona (`nw_kit` first) → Sevilla / Cádiz / Oaxaca (`gw_kit`, `gw_city` first) → systems. Agent 1's `walk_graph.js` comes after `vienna_shops.js`. Agent 3's five tags come after `consume_sources.js`. No duplicate or missing script files.
- **Shared hooks** (`AV.onWorldEnter`, `AV.txn`, `AV.hud`) all chain to the previous handler; none are overwritten. `walk_graph.js` only switches on for Astro-9.
- **Consumables 2.0 vs the city suites:** `bag.use` is now one bite or sip, as the owner asked. The Tokyo, Paris, Barcelona, Amsterdam, Sevilla and Cádiz suites assumed one-shot eating, so their `use` helpers now bite until the item count drops. This was a test-side change only.
- **`run_tests.ps1`:** now picks a DevTools port nobody is listening on. A random pick once let two agents' runs drive the same Chrome.
- **`suite_integration.js`:** now loops over up to 30 worlds; it used to stop at 16, which silently skipped the newer worlds.
- **New gate, `tools/tests/suite_int22.js`.** For each of Amsterdam, Vienna, Madrid, Tokyo, Paris, Barcelona, Sevilla, Cádiz and Oaxaca it checks:
  - the world shows as an open portal and loads;
  - you spawn on walkable ground;
  - there is an ambience preset (Madrid has its own by design);
  - Sound 2.0 footsteps answer;
  - a car is rented, ridden and handed back;
  - a latte is drunk in 4 sips;
  - there are no JS errors.

  Then it checks:
  - the Madrid bar lease, its door, and the 💼 phone app;
  - a garage tune part;
  - a sandboxed save round trip in Sevilla;
  - that the player's real save is untouched.

## Rounds 6–7 (2026-11-27/28): current build `aa6ea96`

`aa6ea96` has the same files as `f84b2ae`: the round-7 merge of `09fe3e2` resolved to the integration side. All of these ran on that tree:

| Suite | Result |
|---|---|
| int22 (now with Chefchaouen + Rio) | **161/161** |
| integration (22 worlds) | **208/208** |
| sevilla (full rerun after a 28.3 fps Feria miss) | **157/157** |
| cadiz | **109/109** |
| oaxaca | **84/84** (island + door fixed) |
| chefchaouen | **65/65** |
| rio | **70/70** |
| gw_smoke | **33/33** |
| gps | 140/142 (Astro-9 601 ms, Rio 725 ms) |

Since round 5, only global-worlds files changed (`gw_city.js` plus the new cities), so the round-5 results for Tokyo, Paris, Barcelona and connect still stand.

## Earlier test results (each suite's last run, and the commit it ran on)

| Suite | Result | Commit |
|---|---|---|
| int22 (cross-branch gate) | **137/137** | `fb112cf` (final) |
| integration (all 20 worlds, portal, save safety, phone) | **194/194** | `fb112cf` |
| gps | 128/130 (Astro-9 + Koh Samui speed, see above) | `fb112cf` |
| tokyo | **297/297** | `fb112cf` |
| paris | **203/203** | `fb112cf` |
| barcelona | **170/170** | `fb112cf` |
| connect (street-network gate) | **53/53** | `fb112cf` |
| sevilla | **157/157** | `c754e9b` |
| sevilla_mobile (phone emulation) | **28/28** | `c754e9b` |
| cadiz | **108/108** | `c754e9b` |
| oaxaca | 81/83 (open on agent 4's branch) | `c754e9b` |
| gw_smoke | 20/21 (same Oaxaca island) | `c754e9b` |
| rides | **192/192** | `c754e9b` |
| astro9_city | **23/23** | `678d4b6` |
| astro9_streets | **99/99** | `678d4b6` |
| biz22 (businesses, farm, garage, cheats, family) | **109/109** | `678d4b6` |
| play22 (consumables + Sound 2.0) | **79/79** | `678d4b6` |
| amsterdam | 267/268 (Yara waypoint, see above) | `52578c4` |
| vienna_city | **47/47** | `52578c4` |

**What changed after each suite's last run.**
- After `c754e9b`: only agent 2's three one-line route-group edits (Tokyo, Paris, Barcelona world files).
- After `678d4b6`: agent 4's Sevilla, Cádiz and Oaxaca files, the one-line `rides.js` taxi guard (192/192 afterwards), and the route-group edits.
- After `52578c4`: Astro-9 / `walk_graph.js` (Astro-9 only) plus the changes above.

The final int22 and integration runs on `fb112cf` load every world, including Amsterdam and Vienna.

**Not tested here:**
- frame rates (the GPU was shared all day);
- a full phone-emulation pass outside Sevilla;
- suites the four agents did not hand over: the older v097–v100, gfx and jlm suites, which have known pre-existing failures.
