# Apeverse — The Living Playground: implementation status

**Started:** 2026-11-22.
**Base:** the merged GitHub version: branch `apeverse-v1-jungle-slice` of `github.com/0jc1/multi-verse`. This is 0jc1's `main` (multiplayer, punch, soft-body characters, realistic sky and flora, stoners, regional NPCs) plus the local V0.9.9 Vienna and V1 Jungle Dub work.
**Local folder:** `Downloads\ape multiverse 1\apeverse GITHUB (multi-verse repo)` (a git checkout).
- Local media is hard-linked in and listed in `.git/info/exclude`, so it is never committed.
- The older local copy `apeverse 0.9.3 - WORKING (...)` is kept unchanged as a fallback.

**Status labels used below:**
- **TESTED:** implemented and passing its automated test.
- **IMPL:** implemented, but not yet tested.
- **PARTIAL:** some of it works.
- **EXISTS:** was already in the game.
- **PLANNED:** not built yet.
- **BLOCKED:** needs assets or a decision.

## Milestone 1 audit — systems that already existed and get reused

| Need | Existing system | File |
|---|---|---|
| Interactables, prompt, E / Act | `W.T` targets; the nearest one gets the prompt | `js/core.js` |
| Held items, first-person hand, eat / drink / smoke animations, joint smoke | Backpack | `js/bag.js` |
| Gradual effects: intensity, duration, reduced motion, reset (X), disable visuals | Effects | `js/effects.js`, `js/v1_systems.js` |
| Shops with validated purchases; 2–4 choice dialogue | `AV.shop`, `AV.talk` | `js/v1_systems.js` |
| Free-text NPC chat with memory (offline) | Chat system | `js/chat.js`, `js/npc.js` |
| Crowd characters with quick chat | Beings | `js/beings.js` |
| Quests | `AV.quests` | `js/npc.js` |
| 8-ball pool with Nuni (Chiang Mai) | Pool | `js/pool.js`, `js/world_chiang_mai.js` |
| Real tuk-tuk rides along streets (Chiang Mai) | `AV.cm.ride` | `js/world_chiang_mai.js` |
| Traffic: tuk-tuks, scooters, bicycles (not rideable) | City life | `js/city_life.js` |
| Instruments as items: ukulele, flute, bongo (notes) | Backpack | `js/bag.js` |
| Playlists, positional music, ducking | Audio and media | `js/audio.js`, `js/media.js` |
| LAN multiplayer (positions only), punch | 0jc1's additions | `js/multiplayer.js`, `js/punch.js` |
| Renting a room / sleeping (Ape Town lodge, Chiang Mai hostel) | Rent system | `js/world_ape_town.js`, `js/world_chiang_mai.js` |

## Activity status

| # | Activity | Status | Notes |
|---|---|---|---|
| 1 | Universal activity framework `AV.act` | IMPL (tested via basketball and photo) | One activity at a time; start, play and exit (Esc / Leave). Shared HUD, input (click / F hold, phone ACTION + LEAVE buttons), real-time sub-stepped updates, stats saved in `AV.S.act`. Venues are placed from configuration (`ACT.PLACES`); punch is off while an activity runs. |
| 2 | Basketball | IMPL | Ball flight with per-court gravity; rim, backboard and floor bounces; 2/3-point baskets. Modes: casual, 60-second challenge (record + credits), first to 5 vs a court regular. NPCs practise on their own. Courts: Chiang Mai (behind Giant Hostel), Ape Town (La Finca), Astro-9 (low-G 3.2 m/s²), Vienna (Donaupark). **Not built:** HORSE mode, Neon Nexus court (that world does not exist yet), a true zero-g court (a ball would never come down; low-G was used instead). |
| 3 | Pool | EXISTS (Chiang Mai) | Spread to more bars: PLANNED. |
| 3 | Darts | PLANNED | Can reuse the aim / charge / throw code from basketball. |
| 4 | Food, drinks, smoking | EXISTS + TESTED earlier | Joint with puffs, stacking drunk effect, food energy. Spec gaps: "open the bottle" step, multiple puffs per joint. |
| 5 | Four-choice continuous conversations, relationships, encounters | TESTED (31/31 desktop, 7/7 phone, `suite_social.js`) | Every crowd character in every world talks through `js/social.js`. After each reply you get 4 fresh choices; topics already used are not offered again, and jokes and stories don't repeat. Choices come from the character's personality and job, the world's places and lore, time of day, the music playing, the item you hold, the relationship and shared memories. Characters also ask *you* questions, and your 4 choices become answers. Relationship tiers (saved per world + name): stranger, acquaintance, friend, close friend. Invitations start real activities: basketball (you go to the court and the game starts), photo mode, a round of drinks (20 credits plus a beer), a walk to a recommended place, a jam. Characters also invite you mid-conversation. Strangers come up to you every 2.5–5 minutes with one of six requests: a game, directions (with a tip), a photo, a jam, drinks, a hidden party at night. Unanswered requests expire after 45 s, and Settings can turn encounters off. This is a finite, offline system of templates and saved state; it is not an AI model. The named story NPCs (Zil, Nuni, the hostel crew…) keep their existing free-text chat. |
| 6 | DJ booths, instruments, joining the Stone Ape Band | PLANNED | Two-deck crossfader on the existing music tracks; must duck world music. |
| 7 | Bicycles, scooters; tuk-tuk payment + destination | PLANNED; tuk-tuk EXISTS | |
| 8 | Pets and companions | PLANNED | |
| 9 | Photography | IMPL | Camera in the backpack (given once), or K. Clean photo mode with no HUD, 5 filters, shutter sound and flash. Album saved in this browser (IndexedDB) with download and delete. Nothing is uploaded. |
| 9 | Graffiti and murals | PLANNED | Vienna's Memory Zone court is the natural first wall. |
| 10 | Homes and decoration | PLANNED | Room renting exists; furniture placement does not. |

## Test results

**Command:** `run_tests.ps1 -Suite tools\tests\suite_play.js -StepTimeout 900`. `-StepTimeout` is a new runner option; the default is still 180 s. Results: **41/41 desktop**, **8/8 phone (`-Mobile`)**. Graphics were on Low, because Medium overloads the headless browser.

**What the suite covers:**

- **Courts:** placed from configuration in Chiang Mai, Ape Town, Astro-9 and Vienna. Each court floor is walkable.
- **Casual mode:**
  - Pick up the ball; it is held in first person; the HUD shows the meter.
  - A free throw and a three-pointer go in.
  - An underpowered shot misses.
  - The HUD score updates.
  - Esc returns the ball to the rack, and the stats are saved.
- **First to 5 vs the court regular:** finished 5–3, and the regular took real shots.
- **60-second challenge:** stores a record.
- **Photo mode:**
  - K opens it and the HUD hides.
  - A photo is saved with its world and filter.
  - The album lists it, and download produces `apeverse_chiang_mai_<id>.jpg`.
  - The backpack camera also opens photo mode.
- **Astro-9 low-gravity court:** the floaty shot goes in.
- **Phone:**
  - The SHOOT and Leave buttons appear, and the Act and Punch buttons are hidden meanwhile.
  - Hold and release scores.
  - Leave restores the normal buttons.

**How shots are tested:** the headless renderer produced about one frame every 7 s in the merged build. Shots are therefore checked with `AV.act._ff()`, a test hook that steps the activity at a steady 60 Hz. In the game, activities also run on real time with small sub-steps, so a shot takes the same time on any frame rate.

**Not manually verified on a real screen yet:** how the aim, charge and arc feel with a mouse or on a phone.

Screenshots from the last run are in `%TEMP%\ape_play9\` (Chiang Mai court, Astro-9 low-G court, Ape Town court) and `%TEMP%\ape_play9m\play_phone.png`.

**Performance warning (needs a real-device check):** 0jc1's realistic characters and plants are much heavier than the previous build. In headless software rendering, Chiang Mai on **Low** ran at about one frame every 7 seconds; the old local build ran at about 1.5 frames per second in the same setup. Jungle Dub on High rose from about 0.8M to 5–7M triangles. Press **F3** in the game to see real FPS on the Iris Xe laptop and the phone.
