# Apeverse Worlds Reborn: status ledger

This is the running work ledger for the Worlds Reborn v1.1 pack (`design/worlds_reborn/CLAUDE_MASTER_PROMPT.md`). Read it first in every session.

## Where things are (2026-11-23)

| What | Value |
|---|---|
| Repo folder | `Downloads\ape multiverse 1\apeverse GITHUB (multi-verse repo)` |
| Remote | `github.com/0jc1/multi-verse` |
| Work branch | `apeverse-v1-jungle-slice` (merged with `main` up to `60a9240` "da nang 2", the snapshot the pack describes). `main` is not touched. |
| Local URL | http://localhost:8095/ (`tools\serve.ps1 -Port 8095`). The older copy on port 8093 is a frozen fallback. |
| Engine | three.js r128, classic `<script>` files, no build step. No Node or Python installed. Tests run in headless Chrome: `tools\tests\run_tests.ps1 -Suite <file> -StepTimeout 900 [-Mobile] [-Only regex]`. |
| Saves | `localStorage` `apeverse_v09`; photos in IndexedDB `apeverse_photos`. Tests never write saves. |
| Pack files in repo | `design/worlds_reborn/`: master prompt, START_HERE, 7 reference maps, map briefs, proposed atlas JSON. Not in the repo: the two PDFs and the two older concept PNGs (still in `Downloads`). |

**Labels:**
- **working-human:** checked by the owner in real play.
- **working-auto:** passes headless tests with real input paths, but no human has played it yet.
- **partial:** some of it works.
- **broken:** confirmed not working.
- **planned:** not built yet.

## Feature audit

| Feature | Status | Notes |
|---|---|---|
| Basketball | **was broken** → fixed, working-auto (needs the owner to retry) | **Cause found:** a ball only drops in within about ±1% of the ideal speed, but the green meter zone looked like ±5%. Releasing anywhere in the green almost always missed, and the old tests used the exact ideal power. Also, the first click after the menu only captured the mouse. **Fix:** green zone (±6%) gives the ideal shot; yellow zone (±12%) rattles on the rim; the meter is slower (1.5 s); aim assist widened to 20°; the first click on the game view now charges straight away. Tests: `suite_play.js` "human timing" step (real mousedown on the view, releases spread across the zone), 32/32. |
| Portal pipe always in hand | **was broken** → fixed | The pipe now shows only while the P / Pipe menu is open or the puff animation plays. |
| DJ two decks | partial (working-auto) | Two decks, crossfader, filter, echo, auto-mix (`js/music_play.js`). **Missing (§31):** BPM, sync, pitch, 3-band EQ, hot cues, loops, waveform, cue. |
| Bikes, scooters, e-scooters, hover scooter, tuk-tuk fares | working-auto | `js/vehicles.js`, `suite_vehicles.js` 52/52 + 10/10 phone. Not yet tried by a human. |
| Four-choice conversations | working-auto | `js/social.js`. |
| Pool (Chiang Mai), smoking and drinking viewmodels | exists | Not re-audited this session. |
| Songkran | partial | A festival mode with a water gun (Q) and soak quest exists. **Missing (§35A):** bucket, bottle, hold-to-spray, dense crowds, refill tubs, NPC splash reactions. |
| Photoreal human faces (§34A) | planned | Soft-body realistic characters exist (`chars_soft` / `chars_real`, from 0jc1). They are heavy: Chiang Mai on Low ran at about 1 frame per 7 s in the headless renderer. Real Iris Xe FPS has not been measured. |
| Minimap (§28) | planned | |
| Build ID in F3 | planned | |

## World IDs

- **Already registered:** `ape_town, jungle_dub, cyberpunk, astro9, bio_jungle, mayan, robot, weird_alien, madrid, london, chiang_mai, pai, acid_dmt, ibiza, burning_pyramid, atlantis, vienna, space_jazz, prehistoric, volcanic_funk, da_nang, somatra, neon_nexus, quantum_ziggurat, alien_maze_x9, verdalux`.
- **The pack proposes 24 IDs.** 11 reuse registered IDs (`astro9, chiang_mai, ape_town, jungle_dub, madrid, pai, ibiza, alien_maze_x9, atlantis, neon_nexus, mayan`). 13 are new and don't clash: `koh_tao, hanoi, cat_ba, amsterdam_2077, venice_festival, new_york_1926, stonehenge_eras, angkor, egypt_ages, koh_samui_jurassic, bangkok, resonara, nomad_7`. `koh_samui_jurassic` stays separate from the existing `prehistoric`.

## Reference maps

The 7 maps are in `design/worlds_reborn/REFERENCE_MAPS/`: Astro-9, Madrid, Pai, Alien Maze X-9, Atlantis, Neon Nexus, Mayan Canal City. They are design references only and are not loaded by the game.

**Map illustrations:** Claude Code has no image generator in this setup. The hand-drawn maps for the 15 other worlds are not made. Their briefs are in `EXTRAS/ILLUSTRATION_MAP_BRIEFS.md`, to generate elsewhere.

## Milestone queue (pack §38), at most 3 active

1. **M2 repairs (doing):**
   - Basketball: fixed. Needs the owner to retry it.
   - Pipe only when used: fixed.
   - Next: the full DJ mixer (BPM, sync, EQ, cues, loops).
2. **M1 atlas:**
   - Layout JSON for Astro-9, Madrid and Pai in `design/worlds/<id>.json`.
   - Minimap proof in Chiang Mai.
   - Build ID in F3.
3. **M3:**
   - Songkran water tools (bucket, gun, bottle).
   - Chiang Mai venue spacing and 7-Eleven.
   - Ape Town plaza life.
   - Then human faces: only after a real Iris Xe FPS reading.

## Log

- **2026-11-23:**
  - Imported the pack.
  - Fixed the basketball live-play failure and the always-visible pipe.
  - Vehicles milestone already done earlier today (commit `f84ba1b`).
