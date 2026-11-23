# Apeverse Worlds Reborn — START HERE

**NEW v1.1 ADDITIONS - 23 November 2026:** Close-range photorealistic human faces/bodies with efficient LOD and believable animations; upgraded Chiang Mai Songkran with bustling water fights, roadside basins, fillable buckets, hold-to-spray water guns and click-to-flick water bottles, working NPC water reactions, mobile controls and real-device performance tests. Sections 34A and 35A in the master prompt are authoritative.

This is the complete **single-prompt Claude Code development pack** for the next major Apeverse expansion.

## Package contents

- `CLAUDE_MASTER_PROMPT.md` — **the full, self-contained 10,000-word master instruction**, including every requested world, existing-world upgrades, gameplay fixes, roadmap, testing and the first Claude task. This is the document Claude should read first.
- `PREVIOUS_GENERATED_MAPS/` — two previously generated illustrations recovered from this conversation: **Koh Tao 2022** (including a fictional hostel name) and an **older modern Ibiza** map which is **not the final 1969 flower-power design**; use the latter only for the Cala Tarida/El Palmarar coastline and memory-house idea, then redraw for the correct era.
- `REFERENCE_MAPS/` — **7 user-provided illustrated world maps**: Madrid, Pai, Astro-9, Alien Maze X-9, Atlantis, Neon Nexus and Mayan Canal City. Original user-supplied artwork, preserved unmodified but renamed for clarity.
- `EXTRAS/ILLUSTRATION_MAP_BRIEFS.md` — separate hand-drawn map-generation briefs for Astro-9's rebuild and **15** missing or revised locations; use one brief per illustration.
- `EXTRAS/PROPOSED_WORLD_ATLAS.json` — structured proposed IDs, themes, priorities, eras, and connections. **Design only. Do not replace `data/worlds.json` wholesale.**
- `APEVERSE_WORLDS_REBORN.pdf` — readable PDF version of the master prompt, including a reference-image gallery, for review or uploading when `.md` is inconvenient.

## Recommended workflow (Windows + Claude Code)

1. Find the **latest working Apeverse repository** that produced the version you liked with Justin's Da Nang changes. Do **not** open an older `v0.9.4` release by accident, and do not trust an old bookmark; compare Git branch/commit and actual server URL.
2. Download/unzip this pack, then move the extracted **`Apeverse_Worlds_Reborn_Pack` folder** into a NEW `design/` folder **inside the latest Apeverse project**. The master file path should be `design/Apeverse_Worlds_Reborn_Pack/CLAUDE_MASTER_PROMPT.md`. **Do not overwrite `js/`, `data/`, `assets/media`, or `index.html`.** The pack is planning/reference material, not a replacement game.
3. In Claude Code, select that **same latest repository** as the working folder, not only the extracted pack folder.
4. Paste this ONE instruction into Claude Code:

> **Read `design/Apeverse_Worlds_Reborn_Pack/CLAUDE_MASTER_PROMPT.md` in full, and inspect its `REFERENCE_MAPS/` and `EXTRAS/` files. Treat it as the complete authoritative Apeverse Worlds Reborn development specification. First audit the actual latest working branch and server, preserve saves and Justin's commits, identify existing versus broken features (especially basketball), create a safe feature branch and task ledger, produce map-first blueprints, and then begin the first bounded playable milestone. Continue through the documented phases without destructive resets, fake completion claims or unbounded tests. Show me the verified build URL and current next step after each milestone.**

If Claude cannot see a planning folder, attach the standalone `CLAUDE_MASTER_PROMPT.md` and the seven images to the chat, or paste the prompt; do not assume Claude can read a file solely because it's in this ChatGPT conversation.

## Read carefully

This is an **ambitious multi-session program, not a promise that dozens of detailed worlds can be created in one credit window**. The same single master instruction instructs Claude to keep a saved progress log and resume without asking for repeated directions.

The public GitHub repository examined for grounding was `https://github.com/0jc1/multi-verse` main branch, snapshot `60a9240` as observed in this conversation. Your newest **local** development branch may differ. Inspect it rather than unconditionally resetting or pulling.

The canonical user map refs are the seven images attached for this request, plus two older generated concept illustrations in a separate folder. This package **does not claim to contain finished illustration maps for Hanoi, Amsterdam, Ibiza 1969, Koh Tao, etc.** Their creation briefs are included in `EXTRAS` and the master prompt requires mapping **before** 3D building. You can ask ChatGPT to generate additional actual illustrations one by one as desired.

**Don't delete save data, assets, original music, film files, or prior working worlds.**
