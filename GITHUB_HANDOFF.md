# Agent 4 - Integrator handoff for Sevilla

**Status:** preserved in a standalone local Git commit; NOT pushed. No PR exists. Do not merge automatically.

**Repository:** `0jc1/multi-verse`
**PR base:** `apeverse-v1-jungle-slice` (most recent checked SHA: `6b1376e5893ae2ba48ece1b34923b283e0ce2aa3`)
**Dedicated branch to create:** `codex/agent4-sevilla-20261123`
**GitHub error when creating the branch:** `403 Resource not accessible by integration` from `POST /repos/0jc1/multi-verse/git/refs`. The GitHub connection reports push permission, but branch creation remains forbidden. Direct Git HTTP access from the local runtime also could not resolve github.com.

## Recommended integration: commit patch

Use the separate delivered `agent4_sevilla_preserved.patch`, which contains only **new Agent 4 files**, no changes to the existing `index.html`. Its independent source commit SHA is recorded in the accompanying `AGENT4_DELIVERY.md`. `git am` creates a new descendant commit on your local branch, with a different SHA.

```bash
git fetch origin
git switch apeverse-v1-jungle-slice
git pull --ff-only origin apeverse-v1-jungle-slice
git switch -c codex/agent4-sevilla-20261123
git am /path/to/agent4_sevilla_preserved.patch
node tools/apply_agent4_seville.mjs
node tools/apply_agent4_seville.mjs --check
node tools/tests/agent4_seville_installer.test.cjs
for q in 0 1 2; do APEVERSE_AGENT4_Q="$q" node tools/tests/agent4_seville_static.test.cjs; done
git add index.html
git commit -m "Agent 4: load Sevilla world and roadmap metadata"
git push -u origin codex/agent4-sevilla-20261123
gh pr create --draft --base apeverse-v1-jungle-slice --head codex/agent4-sevilla-20261123 --title "Agent 4: Sevilla first connected gameplay slice" --body "Partial implementation. Browser and visual QA pending. Preserves Madrid, Astro-9 and transportation systems. See docs/CODEX_AGENT4_NEW_CITIES_STATUS.md."
```

Do not automatically merge the draft PR. Review source, playtest the game, inspect actual screenshots, run core regression tests on desktop and mobile.

## Alternative integration: copy files

Extract the delivered ZIP into the repository root, run `node tools/apply_agent4_seville.mjs`, and commit only new Agent 4 files plus the three loader lines in `index.html` to your branch. If a file has appeared since this package was built, examine it manually before replacing it.

## Agent boundaries and what exists

- First-pass Sevilla: connected road/bridge/walking routes, navigable district blocks, landmarks, five enterable shop interiors and local merchandise, NPCs, ambient traffic, Feria de Abril, basic map/portal/transport hooks, scene quality variants.
- Other eight destinations: metadata and a detailed design/progress ledger only. **Not implemented.**
- No files for Madrid, Astro-9, or the transportation physics implementation are overwritten. The installer adds only three script tags to `index.html` and fails closed on changed/missing anchors.
- Offline mocked static tests (Low/Medium/High) and installer tests pass. No real Chrome/browser test, screenshots, visual quality benchmark, frame rate or mobile device tests have been run.
