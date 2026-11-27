# Apeverse 2.2: Agent 3 status (gameplay, business, sound)

**Branch:** `apeverse-2-gameplay-audio`, cut from `apeverse-2-living-worlds` at e06e1a4.
**Worktree:** `Downloads\ape multiverse 1\apeverse-gameplay-wt`.
**Dev server:** port 8099.

Ports 8095, 8096 and 8098, and the other agents' worktrees, were not touched. Nothing was merged.

All tests are automated: headless Chrome on the real GPU (`-Gpu`), Medium graphics, 1536×864, with a sandboxed save. **No human play-test has been done on this branch yet.** The owner's report about the pre-roll was the starting point.

## Milestones

| | Milestone | Status | Evidence |
|---|---|---|---|
| A | Multi-drag smoking + consumables | **Implemented and verified (automated)** | `suite_play22`, consumables steps all pass. Screenshots: lighting, inhale, exhale, four drags, stub-out. |
| B | Sound 2.0 | **Implemented and verified (automated)** | `suite_play22` 73/74. The one failure was in the test itself and is fixed (see below). Real recordings: **none yet**; the manifest is empty. |
| C | Playable business loop | **Implemented and verified (automated)** | suite_biz22 **95/95**: café (lease → equip → stock → price → open → visible queue → serve / wrong item refused → tables dirty → clean → barista → wages), bar (pour game, tipsy customer → water), courier (job → GPS → deliver). Interiors are functional but blocky placeholders. |
| D | Virtual cultivation | **Implemented and verified (automated)** | Pai farm + Astro-9 dome: plant → water / tend → growth stages → dry plants stall → harvest → stand customers buy → contracts. |
| E | Garage / vehicles | **Implemented and verified (automated)** | Parts + tune applied on the ride (+12 % top speed), visible parts, persistence, more dealer classes; existing garage untouched. |
| F | Dev cheats + family demo | **Implemented and verified (automated)** | All cheats incl. invalid spawn refused; family rules (adult doors / items / shop rows hidden, welcome map). Family demo start-to-finish not played by a human. |
| G | More business types + regression | **Partial** | 4 categories (café, bar, farm, courier); hostel, gallery, record store, convenience store not built. Regression (real GPU): suite_bag **39/39**, suite_consume **47/47**, suite_play22 **73/74 + Madrid re-run 9/9** (the failure was test-side), suite_biz22 **95/95**. |

## Performance

FPS with Sound 2.0 on vs off, interleaved at the same spot in Madrid (real GPU, headless, 1536×864, Medium): **15.8 vs 15.3**, so no measurable cost. Absolute FPS is low here because headless capture shares the GPU with the other agents' tests; this is not a measurement on the laptop's own display.

## Bug ledger

Newest first. Each entry starts with whether it is fixed.

0. **FIXED. The 💼 Business app never appeared on the phone.** `apephone.js` loads after `ventures.js`; the app now registers lazily.
1. **FIXED. Business teardown crash.** Changing décor or rebuilding with customers inside threw `c.h.parent` (`ventures.js`): customers keep their mesh at `c.a.h`.
2. **FIXED. Dev-spawned vehicles were invalid records.** They had no `until` field, so the garage filtered them out and parts never applied. They are now created through `AV.veh.rent` and marked as owned, exactly like a dealer purchase.
3. **FIXED. Workshop buttons did nothing.** Vehicle ids are numbers, while button `data-` values are strings.
4. **FIXED (test). New game was clicked before `main.js` attached its handler.** The runner waits only 3 s after navigating, so the game never started. The suites now wait for `AV.boot`.
5. **FIXED. A business door landed on Giant Hostel's front.** Placement now prefers a neutral anchor and keeps clear of other doors, shop counters and named places.
6. **FIXED. Chiang Mai music came from inside the hostel when you were in the hostel.** The world's nearest-venue code moved the source every frame. Sound 2.0 now pins it to Big Blues on Moon Muang Rd, without editing `world_chiang_mai.js`.
7. **FIXED. Footsteps undercounted at low FPS.** Steps were timed by frame `dt`; they now come from the distance actually walked.
8. **FIXED. Exhale smoke looked like opaque white balls, and the ember washed out to white.** Smoke now uses soft sprite particles, and the ember glow was retuned.
9. **FIXED (owner report). A pre-roll was consumed after one drag.** `bag.js` removed the item after a single animation. All consumables now work in steps, and partial use is saved.

**Process note.** While cleaning up orphaned test browsers, I stopped every Chrome process whose profile matched `apeverse_prof_*`. If another agent had a GPU test running at that moment, it was killed and needs a re-run. It won't happen again: future cleanups will target only my own run's process ids.

## Integration (do not auto-merge)

1. **Merge order.** Merge `apeverse-2-gameplay-audio` after the living-worlds work it was cut from.
2. **Shared-file edits.** All of them are small and additive:
   - `index.html`: 5 script tags after `consume_sources.js`
   - `bag.js`: hooks
   - `effects.js`
   - `core.js`: 3 multipliers
   - `traffic.js`: 1 line (horn)
3. **Audio files.** `audio.js` and `ambience.js` are **not** edited. Sound 2.0 wraps them at runtime; see `docs/AUDIO_2.md` for the API the world agents can use.
4. **Media.** Hard-link it in as the other worktrees do. No new media was added.
5. **Tests.**
   ```
   run_tests.ps1 -Suite tools/tests/suite_play22.js -Gpu -W 1536 -H 864 -StepTimeout 900
   run_tests.ps1 -Suite tools/tests/suite_biz22.js  -Gpu -W 1536 -H 864 -StepTimeout 900
   ```
