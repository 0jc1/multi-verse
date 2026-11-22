# Apeverse V0.9 — The Living Multiverse

A free, browser-based, first-person psychedelic multiverse. V0.9 is a **separate project** built on top of your V0.8 "Living Universe" game: all V0.8 gameplay (Zil's café job, rent, drum log, travel, evolving worlds, EN/ES, touch controls, credit economy) is kept; the original is preserved untouched in `original_v08/`.

## V0.9.1 (Phase 0 + 1) — what's new
Psychedelic sky dome, instanced swaying/glowing flora, iridescent water, fireflies, hand-drawn signs · cinema films play **on the 3D screen** automatically with positional sound · living paintings have proximity sound · Portal Pipe smoking animation, exhaled smoke, portals forming out of smoke, psychedelic world selector with in-world "places" hops · new offline NPC dialogue engine (context, memory, variety, EN/ES) with name tags, speech bubbles and 5 small quests · AI backend hook (`docs/NPC_AI.md`) · optional CC0 3D models (`tools/register_models.ps1`) · Windows server and tests without Python/Node. A byte-identical backup of V0.9 is in the sibling folder `apeverse 0.9 - BACKUP (original V0.9, 2026-11-18)`.

## V0.9.2 (Phase 2) — Ape Town rebuilt
Ape Town now follows the illustrated masterplan: La Finca gateway and market lane, the lotus-pond concert stage, a ring canal with six arched bridges around the Circular Plaza and its domed cafés (Zil's, Vegan, Food, Chill, Psychedelic VR bar, Bissap kiosk), the outdoor cinema amphitheatre, the Gallery Gardens path, La Muria village with the eco-lodge, the north-west waterfalls with the giant Stone Ape, and the Jungle, Temple, Asia, Desert and Crystal gardens, Stone Ape Tunes and Portal Grove. 21 CC0 Quaternius models (see `assets/models/quaternius/LICENSE_CC0_CREDITS.md`). Before/after screenshots: `..\apeverse screenshots\phase2_ape_town\`.

## Realistic characters (ported from the apeverse 9 build)
* The Stone Ape Band and every ape villager made with `AV.chars.npc` (Zil, Sol, Kiko, Pip, Luma, Nix, Bongo, Grakk, the Stone Ape Tunes aliens) are high-poly, skinned PBR characters. They have fur shells, IK on the instruments, spring-bone jiggle and planted-foot walking. The files are `js/sculpt.js`, `js/anatomy.js`, `js/pbr.js`, `js/rig.js` and `js/chars_real.js`.
* Meshes are sculpted in Web Workers on first load (a few seconds, in the background) and cached in IndexedDB.
* `js/chars_real.js` loads after `chars.js` and keeps the classic builders in `AV.chars.classic`. Humans (`chars_human.js`), crowds, city-life animals and the stone statue still use them.
* Villagers expose the classic pivots (`userData.head/aL/aR/lL/lR/torso`) as invisible proxies, so `npc.js` paths, talking gestures and world dance code drive the new bodies unchanged.
* `node tools/bench_sculpt.js` times the sculpts.

## Run it
* **Recommended (Windows):** double-click `start_server.bat`. It uses Python if installed, otherwise the built-in PowerShell server (`tools/serve.ps1`), and opens `http://localhost:8000/index.html`. Close the black window to stop. Cinema screens and paintings play in-world only this way (http).
* **Easiest:** double-click `index.html` (works from `file://`). Paintings and the cinema play in a pop-up video viewer instead of on the 3D screens.
* Mac/Linux: `./start_server.sh`.
* **Multiplayer (LAN prototype):** start the game with `start_server.sh` / `start_server.bat` (Python needed; they run `tools/mp_server.py`). The console prints a `http://<your-ip>:8000/index.html` address that other people on the same network can open. Everyone in the same world sees each other as an ape with a name tag (your name from NPC chat, otherwise `Guest ####`). The bottom-right badge shows `Online · N here`. Only positions are shared; NPCs, quests, credits and inventory stay per player. Movement is trusted from clients, so don't expose this server to the public internet. Without the relay (double-clicked `index.html`, the PowerShell server, static hosting) the game is single-player as before.
* Tests: `powershell -ExecutionPolicy Bypass -File tools\tests\run_tests.ps1` (see `docs/TESTING.md`).
* **Deploy:** upload the whole folder to any static host (GitHub Pages, Netlify, itch.io HTML5, an S3 bucket). No build step, no dependencies besides the bundled `lib/three.min.js` (three.js r128).

## Controls
Desktop: WASD move · Shift run · Space jump · E interact · **P Portal Pipe** · T travel map · I inventory · O settings · M mute · R unstuck · Esc closes panels / releases mouse.
Phone/tablet: left stick = move, drag right side = look, round buttons = Act / Jump / Run / **Pipe** / Map / Bag / Set. Landscape recommended.

## The Portal Pipe
Press **P** (or the Pipe button). A holographic list of all 25 registry worlds appears. Worlds that exist in this build are **Open**; the rest are honestly labelled **Under construction** and cannot be entered. Choose a world and a portal opens on free ground in front of you; walk into it (or press E near it). The panel also has **Return to Ape Town** and **Unstuck**.

## What is in this build (see docs/ for detail)
| World | Status |
|---|---|
| Ape Town (hub) | Playable: plaza, lotus stage + Stone Ape Band, Gallery Gardens, outdoor cinema, Zil's Café, Bissap kiosk, eco-lodge, Portal Grove |
| Verdalux | Playable (legacy V0.8 jungle moon: Grakk, Drum Log, growing glow-trees) |
| Astro-9 · Club Graviton | Playable first slice (low-gravity dance floor, DJ Nix, fictional-points casino) |
| Jungle Dub Party Planet | Playable first slice (positional dub sound system, Bongo, bamboo village, river) |
| 21 other roadmap worlds | In `data/worlds.json`, shown in the Pipe as Under construction |

## Data-driven content
* `data/worlds.json` / `data/worlds.js` — world registry (id, name, identity, music, landmarks, status). Add a world: add an entry, then register a world module with `AV.registerWorld({id, build(ctx){…}})`.
* `data/media_placements.json` / `data/media.js` — which media file belongs in which room, with status `present` / `missing`. Dropping a missing file into `assets/media/…` and re-running `tools/audit.py` (see docs) flips it to present.
* `assets/asset_manifest.json`, `docs/ASSET_AUDIT.md` — what was supplied vs. missing.

## NPC conversations (offline) + optional AI backend
NPCs use an offline dialogue engine (`data/npcs.js`, `js/chat.js`) labelled "Offline dialogue — scripted, not a real AI". To use a model later, host your own endpoint (contract in `docs/NPC_AI.md`) and run `AV.setLLMUrl('https://your-endpoint')` in the browser console. **No API key ever goes in the client.** Only whitelisted, game-validated actions are accepted (`offer_job`, `start_quest`, `suggest_world`); model text can never change credits. (The `apeverse-llm-proxy.js` mentioned in V0.9 was not included in the supplied files.)

## Save data
Stored in `localStorage` key `apeverse_v09` (schema v2). A V0.8 save (`apeverse_v08`) is imported automatically on first Continue and **never deleted or modified**. Settings → Inventory has *Export save*.

## Docs
`docs/ASSET_AUDIT.md` · `docs/DEVELOPMENT_PROGRESS.md` · `docs/TESTING.md` · `docs/KNOWN_LIMITATIONS.md`
