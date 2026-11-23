# Apeverse Agent 4 — Sevilla local milestone package

**Status: locally committed, unpushed Sevilla preview.** Originally developed from `0jc1/multi-verse` branch `apeverse-v1-jungle-slice` at `6cd5576657a9ebdaa52cf0d3fb098864abc9b9e7`. The branch and loader anchors were rechecked at `6b1376e5893ae2ba48ece1b34923b283e0ce2aa3` on 2026-11-23. The GitHub integration returned HTTP 403 when asked to create `codex/agent4-sevilla-20261123`; there is **no remote commit or PR**. The portable `.patch` and `.bundle` preserve the offline commit. The local commit is an independent snapshot, not a descendant of the target branch; apply it on a fresh dedicated branch using `git am`, NOT `git merge`.

## What is in this package

This package includes actual game-world JavaScript and tests, NOT a self-contained copy of the full game:

- `js/world_seville.js` — 3D city registration: historic centre, Cathedral/Giralda, bridges/Triana, Santa Cruz, Plaza de España/María Luisa, early Alcázar/Setas/Alameda/Feria, five enterable shops, interactive staff, NPCs, ambient traffic and music, portal travel, rentals, plus walk-in Feria casetas, refreshment stall and a dance interaction.
- `js/agent4_seville_plan.js` — city layout, road/nav/POI graph and collision-aware walking test routes.
- `data/agent4_worlds.js` — nine destination descriptions, only Sevilla developed; eight are explicitly marked planned.
- `tools/apply_agent4_seville.mjs` — safe integration tool inserting three script tags in `index.html` after existing tagged scripts; supports `--check` and is idempotent.
- `tools/tests/agent4_seville_static.test.cjs` — offline tests using a mocked 3D graph; passed in Low, Medium and High modes.
- `tools/tests/agent4_seville_installer.test.cjs` — checked idempotent, additive script-tag installation using a synthetic `index.html`.
- `tools/tests/suite_agent4_seville.js` — **unexecuted**, actual-browser integration/screenshot suite for the game's test runner.
- `docs/CODEX_AGENT4_NEW_CITIES_STATUS.md` — persistent ledger and explicit gaps for all nine cities.
- `design/agent4_new_cities/AGENT4_MASTER_PROMPT.md` — owner's supplied prompt. **The illustrated maps ZIP and extra reference packs were not available**; do not claim visual accuracy to them.

## Apply in your Apeverse clone

### With a terminal (Mac/Linux/Git Bash)

```bash
cd /path/to/multi-verse
git switch apeverse-v1-jungle-slice
git pull --ff-only origin apeverse-v1-jungle-slice
git switch -c codex/agent4-sevilla-20261123
# Extract agent4_seville_milestone.zip INTO this repository root, preserving paths.
node tools/apply_agent4_seville.mjs
node tools/apply_agent4_seville.mjs --check
for q in 0 1 2; do APEVERSE_AGENT4_Q="$q" node tools/tests/agent4_seville_static.test.cjs; done
node tools/tests/agent4_seville_installer.test.cjs
```

### Windows PowerShell

```powershell
cd C:\path\to\multi-verse
git switch apeverse-v1-jungle-slice
git pull --ff-only origin apeverse-v1-jungle-slice
git switch -c codex/agent4-sevilla-20261123
Expand-Archive -Path C:\path\to\agent4_seville_milestone.zip -DestinationPath . -Force
node tools/apply_agent4_seville.mjs
node tools/apply_agent4_seville.mjs --check
node tools/tests/agent4_seville_static.test.cjs
node tools/tests/agent4_seville_installer.test.cjs
$env:APEVERSE_AGENT4_Q='1'; node tools/tests/agent4_seville_static.test.cjs
node tools/tests/agent4_seville_installer.test.cjs
$env:APEVERSE_AGENT4_Q='2'; node tools/tests/agent4_seville_static.test.cjs
```

**Integration change:** the installer modifies only `index.html` and only adds the following three references:

```html
<script src="data/agent4_worlds.js"></script>      <!-- after data/worlds.js -->
<script src="js/agent4_seville_plan.js"></script> <!-- after js/world_koh_samui_jurassic.js -->
<script src="js/world_seville.js"></script>       <!-- after js/agent4_seville_plan.js -->
```

Do not change `js/world_madrid.js`, `js/world_astro9.js`, `js/vehicles.js` or another agent's modules. Inspect `git diff` before committing; another agent may have updated `index.html` while this package was prepared.

## Test and play

The normal Apeverse game works by opening the repository's `index.html` in a browser (or using its preferred local server). After the installer runs, launch the game, open the Portal Pipe with **P** or the travel-map shortcut **T**, and select **Sevilla · historic-centre development preview**. Walk from **Plaza Nueva** towards Santa Cruz. The **E** key interacts with shops, staff, portals and the Feria guide. Use the existing laptop or touchscreen controls. The minimap and full atlas use the shared minimap engine; the two river bridges are walkable and crossing the river away from them is blocked. Visit the fairground in Los Remedios via **Puente de San Telmo**, and use the in-world toggle to start/stop Feria mode.

Browser runner already in repository:

```powershell
# Check exact runner syntax in tools/tests/run_tests.ps1
powershell -ExecutionPolicy Bypass -File tools/tests/run_tests.ps1 -Suite tools/tests/suite_agent4_seville.js
```

The suite tests game boot, portal arrival, seven walkable routes, 5 purchase points, Feria, return travel, plus screenshot viewpoints; it **requires the complete repo and a working browser**. It has only been syntax-checked in this sandbox. Also run the preexisting Madrid/vehicle/portal/minimap regression suites before submitting a PR.

## Create draft PR once the GitHub connection has write access

```bash
git status --short
git diff --check
git add index.html data/agent4_worlds.js js/agent4_seville_plan.js js/world_seville.js \
  tools/apply_agent4_seville.mjs tools/tests/agent4_seville_static.test.cjs \
  tools/tests/suite_agent4_seville.js docs/CODEX_AGENT4_NEW_CITIES_STATUS.md \
  design/agent4_new_cities/AGENT4_MASTER_PROMPT.md README_AGENT4_PATCH.md \
  AGENT4_MANIFEST.json GITHUB_HANDOFF.md
git commit -m "Agent 4: first connected Sevilla gameplay slice and progress ledger"
git push -u origin codex/agent4-sevilla-20261123
gh pr create --draft --base apeverse-v1-jungle-slice --head codex/agent4-sevilla-20261123 \
  --title "Agent 4: Sevilla first playable-district preview" \
  --body "First partial Sevilla development slice; visual/browser/device verification pending. Does not modify Madrid, Astro-9 or vehicle physics. See docs/CODEX_AGENT4_NEW_CITIES_STATUS.md."
```

**Do not merge the draft PR** until full browser and rendering QA passes and the other three agents' shared changes have been reviewed.

## Important limitations

This is a first code milestone, not the nine finished worlds the owner ultimately asked for. New-city reference illustrations/briefs are absent; detailed assets are not fully realistic; streaming isn't implemented; actual browser/device performance and screenshots have not been tested. There is no online demo or new GitHub PR. The persistent ledger tracks these gaps without marking the cities complete.
