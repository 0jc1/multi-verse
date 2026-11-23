# Apeverse integrated preview (`apeverse-integrated-preview`)

One branch that combines every piece of finished work that has reached GitHub. Review it before anything goes to `main`; nothing here is merged into `main`.

## How to play it

Each of these needs the branch checked out in the repo folder.

- **Windows, double-click:** `start_server.bat`. It opens http://localhost:8000/index.html, using Python if it's installed and the built-in PowerShell server otherwise.
- **Windows, laptop + phone on the same Wi-Fi (needs Node.js):** double-click `start_lan.bat` (or `node tools/serve_lan.mjs 8095`). It prints http://localhost:8095/ and http://<LAN IP>:8095/ for the phone; allow Node.js on PRIVATE networks if Windows asks.
- **Windows, PowerShell:** `powershell -ExecutionPolicy Bypass -File tools\serve.ps1 -Port 8095`, then open http://localhost:8095/index.html
- **Any OS with Node:** `node tools/tests/run_cdp.mjs` is only for tests. To play, run any static server in the folder, for example `python -m http.server 8000`.
- **Localhost only:** a localhost address works only on the computer that runs the server.
- **Multiplayer:** "Offline" in the corner is normal. Multiplayer needs `python tools\mp_server.py`.

## What's in it, by source

| Source | Work | How it arrived |
|---|---|---|
| Local Claude Code sessions (author "Apeverse local build") | Madrid continuous city, full map with zoom / pan / routes, Astro-9 megacity + polish (Biotech Garden, Alien Homes, Club Subterra, sky bridge, signs, aliens), transport (rentals, taxis, map fast travel, tuk-tuk / car / hover bike), detail layer for the Thai / Vietnamese / hub worlds, Pai rebuild, Songkran, DJ mixer, earlier milestones | Commits on `apeverse-v1-jungle-slice` |
| 0jc1 | Jerusalem, Judean Desert, Koh Samui Jurassic, Da Nang changes, Wandering Market NPC state machines + jobs (`js/npc_fsm.js`, `js/npc_jobs.js`, `data/npcs_workers.js`), Giant Hostel textures, character updates | Commits on `apeverse-v1-jungle-slice` (up to `4808986`) |
| alejo-ai93 (web upload) | Reference uploads (`APEVERSE_GLOBAL_CITIES_*` prompt + PDF) | Commit `c232c8d` |

## Not found anywhere on GitHub

The repository has only two branches, `main` and `apeverse-v1-jungle-slice`, and no open or closed pull requests. No Codex branch, pull request or patch exists for:

- **Sevilla / any new city:** there's no `world_sevilla.js` or anything similar. Only a map image sits in the owner's Downloads folder.
- **Any separate Codex Madrid, Astro-9 or transport work.** The Madrid, Astro-9 and transport work in this build came from the local sessions listed above, not from Codex.

For each Codex task that should be included, publish it from Codex ("Create PR" / "Push branch") against `apeverse-v1-jungle-slice`, with the branch named for its scope:

- `codex/madrid-…`
- `codex/astro9-…`
- `codex/transport-…`
- `codex/sevilla-…`

A `git format-patch` file committed under `patches/` also works. Each needs to state which files it changes, and new worlds need their `AV.registerWorld` id, their `index.html` script tag and their `data/worlds.js` entry. These overlap with the files changed here (`js/madrid_city.js`, `js/world_madrid.js`, `js/astro9_*.js`, `js/vehicles.js`, `js/transit.js`, `js/minimap.js`, `index.html`), so they'll be merged one at a time with tests after each.

**Why the Codex preview links don't open:** a Codex cloud task runs in a temporary sandbox. Its "preview" is a server inside that sandbox, which stops when the task ends and is never published to the internet. A localhost link from any agent only works on the machine running that server. A GitHub link shows source code, not a playable game.

## Test status

On commit `d09ca52` + this commit: `suite_integration` desktop 109/109 (all 12 worlds load, walk, interact, map, no failed assets), phone 7/7, `suite_workers` 51/52 (one bedtime timing check: a sweeper was 1.1 m from his seat when sampled; passed 52/52 an hour earlier), `suite_polish` 92/92, `suite_madrid` 78/78, `suite_astro9_mega` 25/25, `suite_astro9_d2` 23/23, `suite_astro9_metro` 30/30, `suite_minimap` 41/41, `suite_vehicles` 52/52, smoke 16/16. Multiplayer shows "Offline": `/api/mp/state` needs `tools/mp_server.py` (Python), which is not installed on the build laptop.

- **Suites:** `suite_integration` on desktop and phone, `suite_polish`, `suite_madrid`, `suite_minimap`, the Astro-9 suites, `suite_vehicles` and `suite_workers`.
- **Headless only:** the headless software renderer draws a frame every few seconds. It checks loading, walking, interaction and errors, not real FPS.
