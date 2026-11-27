# Apeverse 2.2 integration build: status

**Branch:** `apeverse-2-integration`. **Worktree:** `Downloads\ape multiverse 1\apeverse-integration-wt`. **Dev server:** http://localhost:8101/index.html (`tools\serve.ps1 -Port 8101 -NoBrowser`).

Not merged into `main` and not pushed. The four agents' worktrees, their uncommitted work, and the stable preview on 8095 were not touched. Local-only media (the 68 files in `.git/info/exclude`) is hard-linked from the GitHub checkout.

## What went in (committed tips only)

| Branch | Tip | Content |
|---|---|---|
| `apeverse-2-living-worlds` (base) | `e06e1a4` | Amsterdam districts 1–4, 2.1 corrections A–D (Chiang Mai venues, NPC realism, storefront kit + Madrid venues, Vienna tram / bar street / arrival — first pass) |
| `apeverse-2-new-worlds` | `c1b187f` | Tokyo (Shibuya + Harajuku, Asakusa), Paris (Seine + Saint-Germain, Montmartre), interconnected street networks, `nw_kit` |
| `apeverse-2-global-worlds` | `b91e837` | `gw_kit` street-network kit, Sevilla district 1 (incl. Feria de Abril) |
| `apeverse-2-gameplay-audio` | `443313e` | Consumables 2.0, Sound 2.0, Business Empire (café, bar, farm, courier), cultivation, garage parts, dev cheats, family demo |

**Not included (uncommitted in the agents' worktrees at integration time):** agent 1's Vienna rebuild (`vienna_shops.js`, `suite_vienna_city.js`, edits to `storefront.js` / `city_life_plus.js` / `world_vienna.js`), agent 2's Tokyo Shinjuku (`tokyo_shinjuku.js`) and edits, agent 4's in-progress `gw_kit` / Sevilla edits.

## Conflicts and fixes

- `index.html`: the only textual conflict (twice). Script tags kept from all branches in this order: Amsterdam → Tokyo / Paris (`nw_kit` first) → Sevilla (`gw_kit` first) → systems; agent 3's tags after `consume_sources.js`.
- Shared hooks (`AV.onWorldEnter`, `AV.txn`, `AV.hud`) are all chained, none overwritten.
- **Cross-branch test fix:** Consumables 2.0 makes `AV.bag.use` one bite / sip (owner-requested); `AV.bag.finish` consumes the whole item. The Tokyo, Paris, Amsterdam and Sevilla suites were written against the one-shot behaviour, so their food checks failed in the merged build. Their `use` helpers now call `bag.finish` and wait for the animation. Game code unchanged.
- `suite_integration.js` looped over 16 worlds; there are now 17, so Sevilla was silently skipped. Loop bound raised to 20.

## Test results (real GPU, headless, 1536×864, sandboxed save, against :8101)

See the commit message / final report for the numbers of the last run. New gate: `tools/tests/suite_int22.js` (every 2.1/2.2 city listed open in the portal pipe, loads, Sound 2.0 answers, a car is rented / ridden / handed back, a latte is drunk in 4 sips, Madrid bar lease + door + 💼 phone app, garage tune part, sandboxed save round trip in Sevilla, real save untouched).

## Known gaps (not integration bugs)

- Businesses exist only in Chiang Mai, Madrid, Pai and Astro-9; none in Tokyo, Paris, Sevilla or Amsterdam yet.
- `brand_district.js` convenience-store roll and `city_life_plus.js` errand tuning have no entries for Tokyo / Paris / Sevilla (defaults apply).
- `audio2.js` footstep table has no `sevilla` entry (falls back to stone, which is correct).
- No human play-test of the merged build; Sound 2.0 has no real recordings yet (manifest empty, per agent 3).
- Frame rates were not measured cleanly (other agents' GPU tests were running).
