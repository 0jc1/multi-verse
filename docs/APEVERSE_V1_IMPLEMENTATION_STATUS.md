# Apeverse V1.0 — Implementation status (Expansion Kit roadmap)

**Started:** 2026-11-22.
**Working copy:** `Downloads\ape multiverse 1\apeverse 0.9.3 - WORKING (music + graphics, 2026-11-22)`. This is not a git repository, so there is no branch or commit; versions are kept as dated zips in `apeverse snapshots\`.
**Kit:** `design\apeverse-v1\`. This is a copy of `Apeverse_V1_Expansion_Kit.zip`; the two downloaded zips were byte-identical. It holds the kit's docs, data, the six reference maps and the starter code. It is reference only; the game never loads it.
**Machine:** Windows 11, Intel Iris Xe laptop. Chrome is used for headless tests (SwiftShader software rendering). Node and Python are **not installed**, so the kit's own `validate_content.py` and `node --test` checks were **NOT RUN**.
**Deployment:** none. Nothing has been pushed or published.

## Milestone 0 — audit and backup

- **Backup:** `apeverse snapshots\apeverse_v0.9.9_vienna_before_v1_kit_2026-11-22 (code, no media).zip`, about 10 MB. Earlier snapshots are untouched.
- **Stack:** static HTML plus classic scripts on three.js r128. There is no build step. Run it with `tools\serve.ps1` (local http) or open `index.html` directly (file mode).
- **Tests:** `tools\tests\run_tests.ps1 -Suite <suite> [-Mobile]` drives headless Chrome over the DevTools protocol.

### Existing systems the kit asks for (confirmed by reading the code)

| Kit system | Where it already lives |
|---|---|
| World registry, portals, travel | `js/core.js` (`AV.registerWorld`, `AV.travel`, `AV.enterWorld`), `js/portal.js`. The Ape Town Portal Grove has 5 gates. |
| Interaction targeting (E / Act button) | `js/core.js:232`: the nearest `W.T` target within its radius gets the prompt. Desktop uses E, phone uses the Act button. |
| Economy | `AV.txn` in `js/core.js:53` is the only way money changes. It refuses to go negative and writes a transaction log. |
| Inventory, held props, use animations | `js/bag.js`: backpack (`S.items`), first-person ape hand plus item model, drink/eat/smoke/play animations. The item is consumed only when the animation finishes. |
| Effects (bounded, timed) | `js/effects.js`: ramp in, hold, fade out, stacking cap, intensity and duration settings, Reduced motion, clear-effects key (X). |
| Energy and vibe | `js/bag.js` (`AV.vitals`) |
| NPC dialogue | `js/chat.js` and `js/npc.js` (scripted, offline, EN/ES); `js/beings.js` for the quick-chat crowd (`BE.chat`). |
| Quests | `js/npc.js` (`AV.quests`: define / start / check / onTalk, listed in the backpack). Chiang Mai adds its own. |
| Media screens | `js/media.js` (cinema screens, programme tags, positional audio, music ducking), `data/films.js` (the user's own videos) |
| Saves | `js/core.js:26`: schema v2 in localStorage key `apeverse_v09`. Old saves are migrated and never deleted; new fields get defaults. |
| Quality presets | Low / Medium / High in `js/core.js` and `js/gfx.js` (bloom/grading layer) |
| Canon | Cough and Mutt (Chiang Mai), Blue's opposite Giant Hostel with a live evening band, Club Graviton zero-g, Vienna 2000s world, Stone Ape Band (gorilla bass, Ztonedape, orangutan sax) |

### Kit features that were missing before V1.0

- A shop panel with a price list. Before this, each shop was a single "buy X" target.
- A dialogue panel with choices for world NPCs, and NPC memory of what you bought.
- Settings for "Disable intoxication visuals" and "No flashing", plus a touch-friendly "Clear effects" button.
- An effect badge with time left, and the current task shown on the HUD.
- In Jungle Dub, these places from the kit map were missing: River Bar, Bamboo Bazaar, Dub Lab, Jungle Temple, Mushroom Grove, and the band on the main stage. The Bass Check quest was also missing.

## Milestones 1–3 — done in this pass

| Change | Files |
|---|---|
| **Shop panel** (`AV.shop`). Shows icon, name, price, credits and how many you own. A purchase checks that you are within reach of the counter and can afford it, then takes exactly one debit and gives one item. Rapid taps are ignored. Not enough credits gives a clear message. Shows a receipt and a vendor remark, and the vendor remembers your last order. | `js/v1_systems.js` |
| **Dialogue panel** (`AV.talk`). 2–4 choices plus Goodbye, a first-meeting greeting vs a returning one, EN/ES. | `js/v1_systems.js` |
| **Accessibility.** "Disable intoxication visuals" keeps the timers running but leaves the screen clean. "No flashing" calms the pulsing lights and colour cycling. "Clear all effects" button. | `js/v1_systems.js`, `js/effects.js` |
| **HUD.** Effect badge (for example "✦ tipsy 2:14") and the active task. | `js/v1_systems.js` |
| **Quest turn-in for world characters.** Quests can now name who to talk to (`turnName`), so turn-ins work for characters outside the chat roster. | `js/npc.js` |
| **New items:** rum & cola, jungle veggie burger, dub plate (quest item). | `data/items_vienna.js` |
| **Fixed targets for counter staff.** Staff keep their interaction point at the front of the counter. | `js/beings.js` |
| **Jungle Dub, following `reference_maps/jungle_dub_world.png`.** See the list below. | `js/world_jungle_dub.js` |

The Jungle Dub additions:

- **River Bar:** a thatched riverside bar with bartender Ras Mo. The menu is water 8, beer 14, rum & cola 30, coconut 12 and veggie burger 22. He also chats about tonight and jobs.
- **Bamboo Bazaar:** 5 craft stalls along the trail to Roots Village, with Maker Lua selling a garland, beads, a bamboo flute and elephant pants.
- **Dub Lab:** a studio hut with an ON AIR light and a mixing desk, and the dub plate for the quest.
- **Jungle Temple:** a stepped temple with a carved ape face, torches and a sound-healing ceremony that raises energy and vibe.
- **Mushroom Grove:** giant glowing mushrooms, spores, and a "look, don't taste" walk that gives a gentle glow effect.
- **Stone Ape Band on the Jungle Rave main stage:** the same trio as Ape Town, animated to the beat. Each member has their own dialogue.
- **Bass Check quest:** the gorilla gives it, the dub plate comes from the Dub Lab, and turning it in at the stage pays +45 once.
- **Renamed to match the map:** High Canopy Camp (Treehouse Lounge), Herbal Garden (Healing Garden), Crystal Waterfalls (Hidden Falls). Place ids are unchanged, so saves and tests still work.
- New painted trails and 6 new entries on the travel list.

## Test results

**New suite:** `tools/tests/suite_v100.js`.

| Run | Command | Result |
|---|---|---|
| Desktop, first run | `run_tests.ps1 -Suite tools\tests\suite_v100.js` | 51/53 |
| Desktop, after the test fix and visual fixes | same | **53/53 PASS** |
| Phone (emulated) | same with `-Mobile` | **7/7 PASS** |

The 2 failures in the first run were test timing, not game bugs. SwiftShader draws Jungle Dub at under 1 fps, so fixed 400 ms waits missed the next frame. The test now waits for frames.

**What the suite covers:**

- **Places:** all kit map places are on the travel list and walkable. Standing at each place offers that place's interaction.
- **River Bar dialogue:** 3 choices plus Goodbye; first-meeting greeting; "Any jobs?" points to the band.
- **River Bar purchases:**
  - The menu shows 5 items.
  - A rapid triple tap buys 1 beer for −14.
  - Water can be bought.
  - Not enough credits: no item, no debit, and a clear message.
  - Walking away from the counter refuses the purchase.
  - Ras Mo remembers your last order.
- **Drinking:** holding the beer, the drinking animation, and the beer counted only at the end of the sip.
- **Effects and accessibility:**
  - The tipsy effect runs with a timer, and the canvas filter is visible.
  - The HUD badge shows the time left (e.g. "tipsy 2:14").
  - Disable intoxication visuals gives a clean screen while the timer keeps running.
  - Reduced motion: no camera roll.
  - The effect expires and the screen returns to normal.
  - The 3 new settings exist.
- **Band:** 3 band members with distinct lines.
- **Bass Check quest:**
  - It starts, and the HUD shows the task.
  - No reward without the plate.
  - The Dub Lab gives the plate.
  - Turning it in pays +45, only once.
- **Bazaar, Temple, Grove:** buying a garland at the Bazaar; the Temple raises vibe; the Grove gives a gentle glow effect.
- **Save and return:** the save holds the quest, items, vendor memory and accessibility settings. Portal to Ape Town and back; quest and items survive.
- **Phone:** reach the bar, tap Buy, the Use button appears, tap Use to drink.

**Regression after the shared-system changes** (each suite run alone, one after another):

| Suite | Result |
|---|---|
| core (`suite_cdp.js`) | **77/77 PASS** |
| `suite_bag.js` | **38/38 PASS** |
| `suite_v097.js` | **34/34 PASS** |
| `suite_v098.js` | **45/45 PASS** |

**Not re-run in this pass:** cm, cm_phone, gfx, v099. Their files were not changed, apart from shared `beings.js`, `effects.js` and `npc.js`, which core, bag, v097 and v098 cover.

**Render cost on High (1280×720, headless):** River Bar 0.80M triangles / 401 draw calls, band 0.85M / 462, Temple 0.78M / 362, Grove 0.77M / 356. Jungle Dub was 0.8–0.9M before this pass, so there is no measurable increase. Real frame rates on the Iris Xe laptop and the phone have **not been measured** in this pass.

**Screenshots** (temp folder, from the last run): `%TEMP%\ape_v100b\v100_river_bar.png`, `v100_band.png`, `v100_temple.png`, `v100_grove.png`, and `%TEMP%\ape_v100b_phone\v100_phone.png`.

## Next steps (smallest first)

1. **Milestone 4, Lumina Festival:** a new world using `lumina_bioluminescent_gardens.png` and `lumina_neon_festival.png`. It would have two districts joined by bridges, Moonlight Bar and Glowfruit Café (reusing `AV.shop`), a lotus stage and a cinema.
2. **Milestone 5, Atlantis:** walking inside domes and swimming outside, and the venues.
3. **Milestone 6, Madrid:** a condensed city with the Metro, and a fictional Chamartín home with Boris and Lila (no real address). **Vienna is already built** (V0.9.9); compare it against `vienna_2000s.png` from the kit.
4. **Milestone 7:** performance measurements on the real laptop and phone; the open Chiang Mai regression checks (see `KNOWN_LIMITATIONS.md`).
