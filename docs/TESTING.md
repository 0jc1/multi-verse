# Testing — Apeverse V0.9.1

## How to run the automated tests (Windows, no Node/Python needed)
```
powershell -ExecutionPolicy Bypass -File tools\tests\run_tests.ps1            # desktop suite
powershell -ExecutionPolicy Bypass -File tools\tests\run_tests.ps1 -Mobile    # emulated phone (Pixel 7 landscape, touch)
```
Options: `-Out <folder>` (report + screenshots, default `%TEMP%\apeverse_tests`), `-Only <regex>` (run some steps), `-Headed` (watch it).
The runner starts `tools\serve.ps1` on port 8731, opens Chrome/Edge headless with a fresh profile (your saves are never touched),
injects `tools\tests\suite_cdp.js` over the DevTools protocol, and writes `results.md`, `results.json` and screenshots.
Steps find things by their on-screen interaction labels, not by coordinates, so they keep working as worlds are rebuilt.

(The original Playwright script `tools/tests/suite.js` from V0.9 is kept for reference; it needs Node + Playwright.)

Double-click (file://) check: `run_tests.ps1 -FileMode -Suite tools\tests\suite_file.js`.

## Phase 2 result (2026-11-19) — Ape Town rebuild
**Desktop 77 / 77, mobile (emulated) 6 / 6, file:// 9 / 9.** The functional suite now runs on Low graphics at 960×540 (software rendering is too slow for movement timing on High), waits for model loading, and **fails on any `console.error`** — this caught two real bugs (sky/waterfall shader preprocessor error from Phase 1, and 11 garden signs with NaN geometry), both fixed.
Before/after screenshots: `..\apeverse screenshots\phase2_ape_town\` (open `compare.html`). Tour: `run_tests.ps1 -Suite tools\tests\suite_tour.js -W 1600 -H 900`.

Performance (CPU-only SwiftShader, same machine load, 1280×720, Ape Town arrival / plaza):
| Build | Low | Medium | High |
|---|---|---|---|
| V0.9 original | 2.3 fps · 31k tris · 254 calls | 2–3.3 fps · 33k | 1.7–2 fps · 36k |
| V0.9.2 Ape Town | 0.6–1.0 fps · ~250k tris · ~400 calls | 0.4–0.7 fps · ~390k | ~0.3 fps · ~550k |
Roughly 3× the CPU-rendering cost for ≈5–6× the area and far more detail. **Real GPU / phone frame rates are not measured** — please report them.

## Phase 1 result (2026-11-18)
**Desktop: 77 / 77 passed. Mobile (emulated): 6 / 6 passed. file:// double-click: 9 / 9 passed.**

Covered: start screen (EN/ES, phone detection), movement/jump/strafe, Zil dialogue → job, café shift economy, stage tip + concert panel,
8 living paintings + 7 honest plaques, in-frame video, viewer, cinema panel, sky dome, instanced flora, NPC name tags,
**cinema screen auto-plays on the 3D screen with positional (panned) sound and stops when you walk away**, **painting proximity sound**
(closest faced painting audible), **NPC dialogue** (contextual greeting, chips, 3 different answers to the same question, learns + remembers
your name, fallback, quest from dialogue → item → completion and reward, NPC faces you, Spanish), **Portal Pipe smoking animation**
(exhaled smoke particles), psychedelic selector with places, 25 worlds listed, unfinished worlds not enterable, portal forms out of smoke,
portal travel to Astro-9, low gravity, casino uses fictional points only, Jungle Dub, Verdalux Drum Log (12 credits once per day),
GPU memory flat across 3 full world cycles (29 geometries / 15 textures each cycle), unstuck, settings, save schema,
**portal hop to a place inside the same world**, no uncaught JS errors.

## Performance (software rendering, honest numbers)
Measured in headless Chrome with SwiftShader (CPU only — no GPU), 1280×720, Medium graphics, Ape Town arrival view.
These numbers are far below any real GPU; use them only to compare builds.

| Build | Early FPS | Steady FPS | Draw calls | Triangles |
|---|---|---|---|---|
| V0.9 original | 12.3 | ~5.7 | 288 | 34k |
| V0.9.1 Phase 1 | 11.3 | ~4.8 | 313 | 66k |

Roughly 85–90 % of the original speed in CPU-only rendering, with much more on screen. Real laptop GPUs and phones have not been measured here.

## Not tested (be honest)
* Real GPUs / real phones / tablets / iOS Safari / Firefox — only emulated Chromium.
* Hearing the sound by ear: the positional audio graph is verified (panner + gain nodes, unmuted video), not auditioned with headphones.
* A live AI backend (offline dialogue only).
* file:// double-click in a real browser (the code path is the pop-up player, as in V0.9).
