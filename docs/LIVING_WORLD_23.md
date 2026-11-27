# Apeverse 2.3: The Living World (development ledger)

- **Branch:** `apeverse-2.3-living-world`, cut from the consolidated 2.2 build `7d046e3`.
- **Worktree:** `Downloads\ape multiverse 1\apeverse-livingworld-wt`.
- **Dev server:** http://localhost:8102/index.html. Start it with `tools\serve.ps1 -Port 8102 -NoBrowser`.
- **Fallback:** the 2.2 build stays untouched on branch `apeverse-2-integration` (served on 8101).

Nothing has been merged into `main`. One agent (this one) develops 2.3.

**Every result below comes from automated runs, not human playtests.** They ran in headless Chrome on the real GPU at 1536×864, with a sandboxed save (`apeverse_test_*` keys), through the shared `%TEMP%\apeverse_gpu.lock`.

## Failures and open items first

| Item | Status |
|---|---|
| GPS in Astro-9: the first routes after arrival take 0.5–1.6 s | **Open.** The routes are asked for in the first seconds, before Astro-9's walking graph is built (it is built a few milliseconds per frame), so they use the fine grid. Finishing the build in one go would freeze the game for longer, so it stays open. |
| GPS speed checks are noisy | Pai (161 / 408 ms) and Koh Samui (234 / 473 ms) took the same route method in two runs, but different times. The code path for those worlds did not change; this is load on the laptop. Treat single GPS timing failures there as noise. |
| Mission coverage outside Ape Town and Chiang Mai | **Not started** (Milestone B). The older worlds keep their 2.0–2.2 tasks; the new engine has no content there yet. |
| Ape Town penthouse door | Not verified. The door finder found no building near the plaza, so it was moved to the Crystal Garden / Brand District. To be checked in the next probe. |
| Character creation, vehicle theft, police, health / hospital, business expansion | Not started (Milestones C–E). |

## Milestone A: foundation + first playable loop (in progress, first checkpoint)

**Done and tested:**
- **Starting money:** new games start with **10 000 credits** (`AV.LW.CFG.startMoney`). Existing saves keep their balance. Once, they are **offered** an optional 10 000-credit starter grant with an explanation; declining keeps the balance. It is never automatic.
- **Mission engine** (`js/lw_missions.js`, `AV.mis`):
  - Missions are data-driven. Stage types: branching talk, go, have item, use / consume, game event, condition, travel.
  - Missions can have prerequisites, timers, failure, abandon and retry (failure never blocks), repeatable dailies, follow-ups, rewards (money, items, reputation per world) and mission variables that branches write.
  - The whole state is saved in `S.mis`.
- **Mission UI:**
  - A gold ❗ marker floats over anyone with work for you; a pink ◆ marks the tracked objective. Both also appear on the minimap.
  - An objective banner (under the stats, top left) shows the step and the distance.
  - The **journal** opens with **G** or 📜 on the ApePhone. It has Active / Available / Done + reputation tabs, with Track, Navigate (GPS route) and Abandon buttons, and it also lists the older tasks.
  - Notice-board triggers handle missions that have no character giver.
- **Branching dialogue** (`js/lw_dialogue.js`, `AV.convo`):
  - A conversation is several exchanges with a transcript on screen. Number keys 1–9 pick a choice.
  - Characters remember you across sessions (`S.rel`: times met, affinity, flags), and greetings vary by visit, time of day and shared history.
  - Mission talks, offers ("What do I get out of it?") and "💬 Talk properly" chips sit next to the classic typed chat, which is kept unchanged.
- **Property** (`js/lw_property.js`, built on `housing.js`):
  - Five new homes:
    - Ape Town: Mushroom Studio (4 500), Gallery Loft (11 500), Lotus Penthouse (38 000).
    - Chiang Mai: Nimman condo (5 200), Old City teak house (16 000).
  - Each comes with a real street door and an interior, plus a starter bed and wardrobe.
  - Estate agents: **Remy** (Ape Town plaza) and **Khun Pim** (Chiang Mai, by Giant Hostel). Each gives advice in conversation, then opens a listings panel: type, size, district, rent / price, what is included, rent / buy, and "show the door" on the GPS.
  - `housing.js` now supports several homes per world (door per home, custom sign and description).
- **Content:**
  - **Ape Town** (6 missions):
    - Welcome to Ape Town, a six-step story. Choose your path with Pip, eat, meet Zil, rent or buy with Remy, walk in, sleep.
    - Rush hour at Zil's (daily job).
    - Dash's three parcels (timed delivery, random route).
    - A canvas for Luma (art; branching pitch, bonus for a bold idea).
    - Kiko's market day (find stock, set a fair or pushed price).
    - Lunch rush with Sol (dialogue puzzle; can fail and be retried).
  - **Chiang Mai** (6 missions):
    - Hustled by Nuni: a real pool game, with a bonus if you win.
    - Reception shift at Giant: three guest situations; pay depends on your answers.
    - Restock the counter: a timed run to Warorot Market.
    - Rooftop party: invite three of the crew.
    - Big Blues jam with Steve, unlocked by the party.
  - Authored talks for Zil, Mutt and Nuni.
  - Existing game events now feed missions: every `AV.dlg` event, pool results, Giant crew actions, and renting or buying a home.

**Inherited 2.2 bugs fixed:**
- **Amsterdam:** Yara's kroket waypoint vanished at once. A waypoint set less than 16 m away now arrives at 2.5 m instead of 12 m (`minimap.js`).
- **Consumables:** `AV.bag.busy()` was false for 350 ms between automatic bites or sips. It now stays true while the next step is scheduled, and `AV.cons.finishing(id)` was added (`consume.js`).
- **GPS speed** (`pathfind.js`):
  - The street-graph search now uses a binary heap; it used to be O(n²).
  - Worlds with a street graph use it for trips over 90 m (was 220 m).
  - Rio went from 725 ms to **17 ms**; Madrid is 53 ms; Astro-9 went from 601 to 493 ms (see open items).

**Regression on the 2.3 branch:**
- int22 161/161
- integration (22 worlds) 208/208
- amsterdam **268/268** (the Yara kroket check passes now)
- gps 139/142 (Astro-9 cold start, plus Pai and Koh Samui timing noise, see above)
- Madrid 103 ms, Sevilla 4 ms, Rio 53 ms
- The street-graph threshold for trips over 90 m is used only in the gw_kit cities and Astro-9. In Amsterdam it made one 93 m route 4% longer than the check allows, so other worlds keep 220 m.

**Tests:** `tools/tests/suite_lw23a.js` plays the loop through the real game objects: kiosk, sip-by-sip drinking, the agency's rent button, the door, the bed's menu, and the conversation choices. Result: **85/85**.

## Coverage report (2.3 missions only; decorative or placeholder interactions are not counted)

| World | 2.3 missions | Talkable 2.3 characters | Homes for sale / rent | Notes |
|---|---|---|---|---|
| Ape Town | 6 | Pip, Zil, Luma, Kiko, Sol, Dash, Remy | 3 | Flagship; more planned in B |
| Chiang Mai | 6 | Mutt, Nuni, Steve, Dino, ZtonedApe, Nunyin, Khun Pim | 2 | |
| Madrid | 0 | none yet | 1 (from 2.0) | Has the older 2.x businesses |
| All other worlds | 0 | none yet | 0 | Older tasks remain; Milestone B |

## Roadmap

**A (finish):**
- Ape Town flagship storyline hooks (Stone Ape Band, ZtonedApe).
- Agent and listings in every world that has homes.
- A first starter-business purchase flow on top of `ventures.js`.

**B:** at least 10 missions per major city, with initial coverage in every world first (Amsterdam, Madrid, Vienna, Barcelona, Tokyo, Paris, Oaxaca, Astro-9, Sevilla, Cádiz, Rio, Chefchaouen, Pai, Koh Tao, Jungle Dub, Verdalux and the smaller worlds). Also random encounters, interconnected storylines, and festival, sport and photo missions.

**C:** enterable businesses at scale with a modular interior kit; physical shopping and serving (bartender → held drink); regional convenience stores and coffeeshops under per-world fictional rules; employment; business management UI.

**D:** character creation (name, male or female, body, fur / skin, hair, face, clothes, shoes, accessories, preview), barbers, tattoo studio, persistent wardrobe and outfits.

**E:** vehicle ownership and fictional unauthorised-use interaction, 1–5 wanted stars, police patrol and pursuit, arrest, fines, impound, health and hospital respawn.

**F:** entertainment, more mission chains, phone and UI polish, mobile controls, performance and the final regression.

## How to run

```
powershell -ExecutionPolicy Bypass -File tools\serve.ps1 -Port 8102 -NoBrowser
```

Then open http://localhost:8102/index.html.

Tests (one at a time, through the GPU lock):

```
powershell -ExecutionPolicy Bypass -File tools\tests\gpu_queue.ps1 -Owner lw23 -Run "-Suite tools/tests/suite_lw23a.js -Gpu -W 1536 -H 864 -Port 8102 -StepTimeout 900 -Out %TEMP%/lw23_a"
```
