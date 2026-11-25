# Asset inventory (M0, 24 Nov 2026; updated M6, 25 Nov 2026)

> **Update (M6):** 43 clothing designs are now imported as in-game textures. See `docs/MERCH.md` for what was used, what is held and what is still needed (SWAG, SOLTERRA-lettered versions, full-resolution masters).

What was physically on disk at the M0 check (24 Nov 2026). At that point nothing had been imported; M6 has since imported the clothing designs listed in `docs/MERCH.md`.

## Instruction pack for the 24 Nov master prompt

| File named in the prompt | Status |
|---|---|
| `APEVERSE_CLAUDE_MASTER_PROMPT_2026_11_24.md` | Present (Downloads). Copied to `docs/APEVERSE_MASTER_PROMPT_2026_11_24.md` |
| `QUALITY_GATE.md` | **MISSING** |
| `MERCH_CATALOG.csv` | **MISSING** |
| `ASSET_INTAKE.md` | **MISSING** |
| `WORLD_ROADMAP.csv` | **MISSING** |
| `WORLD_CREATIVE_BRIEFS.md` | **MISSING** |

**Where I searched:** Downloads, Desktop and Documents (3 folders deep), plus the 23 Nov handoff ZIP. None of these files exist in any of them.

**Closest substitutes in the 23 Nov ZIP** (read, not yet copied into the repo):
- `DOCS/QA_AND_RELEASE_GATES.md`: used as the working quality gate until `QUALITY_GATE.md` arrives.
- `DOCS/WORLD_SPATIAL_AND_ART_DIRECTION.md`
- `DOCS/NEW_DESIGNS_ASSET_GUIDE.md`
- `DATA/new_merch_catalog_proposal.json`

## Artwork on disk

**`Downloads/APEVERSE_NEXT_MASTER_HANDOFF_20261123.zip`**
- SHA-256 of the ZIP: `761D163E70186817FFE94C6CCBF813F80E69242C3E7E75C2D80CB460E9D408F6`
- Per-file SHA-256 hashes are in `FILES_SHA256.txt` inside the ZIP.

| Folder (inside the ZIP) | Count | Kind |
|---|---|---|
| `ASSETS/new_drop/originals/` | 12 | PNG, 330–560 KB each (1000019533–43, 1000019546) |
| `ASSETS/new_drop/concept_sheets/` | 4 | PNG contact sheets (1000019547–50) |
| `ASSETS/new_drop/concept_crops/` | 42 | WEBP draft crops (city/Solterra 16, nature 8, slogan 10, summer mood 8) |
| `ASSETS/new_drop/game/` | 12 | WEBP game textures (6 apeverse_*, 2 solterra_*, 4 sunshine_*) |
| `ASSETS/new_drop/thumbs/` | 12 | WEBP thumbnails of the same |
| `PREVIOUS_PACKS/APEVERSE_MERCH_DROP_001_CLAUDE_PACK.zip` | 1 nested ZIP, 21 MB | Earlier merch drop. The handoff says it holds 13 standalone designs. Not opened yet. |

**Also in Downloads:**
- `NEW_DESIGNS_OVERVIEW.jpg`: an overview collage. It is not a set of individual print files.
- `Create Stoner T Shirt Designs.html`: a saved web page. Not used as an asset source.

## Missing artwork

- **City overview maps:** Tokyo, NY 1920s, Seville, Chefchaouen, Rio, Amsterdam now and 2077, Paris, Oaxaca, Koh Tao, Barcelona, Cádiz, Canaries. Not found as files. The master prompt describes them as creative guides, so world work can proceed from the written briefs. The map files are still needed for review.
- **MOONMELT SUPPLY CO. illustrations:** not identified as separate files. The ZIP file names cover APEVERSE, SOLTERRA and "sunshine" only.
- **ZtonedApe comic stoner designs:** not identified as separate files yet. They may be inside the nested merch-drop ZIP.

## Brand spelling flag

- **SOLTERRA vs SOLVERA:** the ZIP's game textures use `solterra_*`. Earlier illustrations reportedly read SOLVERA.
- Per the master prompt, these are **not renamed or merged**. The owner is asked once before any retail catalogue launches.

## Next intake step (M6)

1. Extract the ZIP into a quarantine folder outside the repo.
2. Verify every hash against `FILES_SHA256.txt`.
3. Review the crops visually.
4. Register each design in a catalogue. Do this only after the owner confirms the SOLTERRA/SOLVERA question for retail labels; in-game use can proceed.
