# APERVERSE — GLOBAL CITIES & FESTIVALS EXPANSION (Claude Code Master Prompt)

**Package version:** 1.0 · 23 November 2026 · additive expansion for `0jc1/multi-verse`

You are the lead technical artist, gameplay engineer, world designer and QA lead for the existing **Apeverse** browser 3D game. The protagonist is **Ztonedape**, spelled exactly so. You are NOT starting a new game. You must incrementally implement the global-cities design package within the user's **current working Git branch**, preserving their music, films, characters, save files, and existing worlds.

## Priority and source of truth

This folder is a SPECIFICATION, not game code. Its `.png` images are hand-drawn maps for **layout inspiration and landmark checklists**, not ready-made world meshes or accurate geographic coordinates. Its JSON files contain DESIGN PROPOSALS, not registries to overwrite existing files. Actual project source code and the player's observed gameplay are authoritative about what exists and whether it works.

1. Verify current working directory, `git status`, branch, upstream, `HEAD`, server, actual deployed/playable URL, loaded script order, and latest completed milestone. If user has uncommitted work, protect it; NEVER reset/drop/rebase destructively.
2. Read actual `README.md`, `docs/WORLDS_REBORN_STATUS.md`, `docs/LIVING_PLAYGROUND_STATUS.md`, `data/worlds.json`, `js/core.js`, `js/portal.js`, `js/minimap.js`, `js/audio.js`, `js/bag.js`, `js/vehicles.js`, `js/social.js`, `js/activities.js`, relevant world constructors, `index.html`, and `tools/tests` before editing.
3. The newest publicly inspected branch on **2026-11-23 ~06:50 UTC** was `apeverse-v1-jungle-slice` at commit **`9e745409`**. It documents **playable first-slice Pai**, a **circular minimap**, **two-deck DJ mixer**, **Songkran water tools**, **vehicle system**, **basketball fix**, **Astro-9 first metropolis district plus district 2**, and 4-choice conversations. Some are only auto-tested. The user reports **Pai looks extremely primitive**, so do not count it as visually accepted. The user's local checkout may be ahead: inspect, do not revert newer work.
4. Preserve status boundaries: **illustration available ≠ registry entry ≠ loaded module ≠ walkable playable world ≠ owner-approved high-quality world**. Do not claim completion because a URL loads or a browser test passes.
5. Consult `CITY_BRIEFS/`, `NPC_PACKS/`, `DATA/`, `ENGINE/`, and `RESEARCH_SOURCES.md`. If a date or named venue is unverified, flag it instead of inventing specifics. Distinguish historical reality, user-inspired memories, and purely fictional content.

## Non-negotiable outcome

Deliver recognizably different **living, large-feeling places** with **far greater architectural detail than box worlds**. As a minimum each new city should compare favorably to the user's latest **Chiang Mai and Da Nang** street scenes on the same machine and quality preset: plausible building materials, storefront modules, signage, narrow alleys, shop interiors, trees appropriate to climate, human-scaled seating, traffic, animals, authentic regional ambience, believable NPCs, sound and real activities. The illustrated maps can be whimsical; the **3D rendering target is grounded stylized realism moving toward photorealism, NOT colorful toy cubes**.

**No promise of true photorealism:** The game is Three.js r128 in a browser on an HP Spectre x360 using integrated Intel Iris Xe and also on Android. A fully photoreal city with hundreds of fully simulated humans cannot be guaranteed. Choose close-up hero NPC facial texture/rig/detail, physically based materials and selective HDR/lighting while making crowds, distant streets, nature and draw distance adaptive. Keep Low mode genuinely usable and visual-quality settings honest.

## Destination scope

Read `DATA/city_atlas_proposals.json` for IDs, existing status and connection hints. Primary destinations:

- **Madrid** (existing registered ID `madrid`, no duplicate), including a fictionalized Pinar de Chamartín home, Sol/Gran Vía, parks, metro, and the **New Year's 12 grapes** at Puerta del Sol.
- **Koh Tao** (memory-inspired 2022): Mae Haad harbor, black-mural hostel as default spawn, Chloe (French dive instructor as a fictionalized NPC), Thai hostel crew, dives/reef, scooter, Sairee and quiet coves.
- **Oaxaca regional world** (new `oaxaca_region`): Oaxaca city and Día de Muertos, San José del Pacífico and Cumbre memory-inspired hostel, valley/pickup road, Puerto Escondido surfing, Zipolite beach. Actual long-distance connections via transport cuts, not a five-minute stroll.
- **Paris**: separate recognizably different districts including Montmartre, Louvre, Seine/Notre-Dame, Saint-Germain, Marais and Canal Saint-Martin; original street music/Fête de la Musique.
- **Amsterdam present**: canal-house architecture, bikes, legal coffeeshops, NDSM, King's Day market and boat parties. **Woodstock’69 is at Bloemendaal aan Zee outside Amsterdam**; use a separate beach excursion via Haarlem, not a club at NDSM.
- **Rio de Janeiro**: Copacabana and Ipanema, Santa Teresa, Lapa, samba, Carnival, Tijuca rainforest, Sugarloaf and Corcovado with true steep terrain.
- **Chefchaouen**: quiet layered blue medina, Kasbah, Ras El Maa, rif trails, Spanish Mosque viewpoint, tea and crafts, not generic nightclub streets.
- **Sevilla**: Giralda, Cathedral, Alcázar, Triana, Plaza de España, Parque María Luisa, Guadalquivir and a correctly placed **Feria de Abril** district.
- **Barcelona**: Eixample grid, Gaudí landmarks where appropriate, Gothic/Born, Gràcia, Poblenou, Barceloneta, **La Mercè** festival with castellers/gegants/correfoc.
- **Cádiz**: ancient seaside peninsula, La Viña, La Caleta, Gran Teatro Falla, Cádiz Carnival chirigotas/coros, not a Rio samba reskin.
- **Tokyo**: separate Shibuya, Shinjuku, Harajuku/Meiji Jingu, Akihabara, Asakusa, Ueno, Odaiba, regional station transitions, arcades, shopping, live music and matsuri.
- **New York 1926**: authentic Prohibition-era Manhattan/Harlem/Lower East Side/Greenwich Village/jazz/docks/speakeasies, period cars and subway. **No Depression until after 1929; NO Empire State Building until 1931 or Chrysler completion until 1930**. The supplied illustration contains anachronisms: correct them in the game rather than copy errors.
- **Canary Islands**: eight-island travel selector (including **La Graciosa**) with different island environment slices, distinct geology and inter-island travel.
- **Spain interactive map**: country hub with Madrid, Barcelona, Sevilla, Cádiz, Ibiza, Canaries and optional future Galicia/Valencia/Asturias/etc. Show Preview only for not-yet-playable destinations; never create a travel button that sends players to an empty scene.

**Additional established ideas:** Ibiza **1969 flower power** (existing ID `ibiza` must be reused), and a distinct speculative **Amsterdam 2077** time-world. Keep these separate from present-day destinations. Carry over all previous Worlds Reborn commitments — especially **Pai's urgent detailed environment rebuild**, Chiang Mai/Da Nang preservation and the huge ongoing Astro-9 Gaudí-style organic eco-cyberpunk city. Do not overwrite or regress them. Other older backlog worlds (Atlantis, Neon Nexus, Alien Maze X-9, Mayan canal city, Hanoi, Cat Ba, etc.) remain in the historical project roadmap, not secretly cancelled by this new expansion.

## World-building implementation standard (required for EACH city)

**A. World atlas / connected districts.** Create a layout with district boundaries, safe player spawn and return portal, road/footpath connections, transport stops, terrain and navigable routes, streamable scene sections, shops, NPC zones and minimap annotations. Preserve local scale and geography: a bustling center is dense, outskirts spacious; islands are not city blocks; same-region distant sites may be separate connected scenes. Give each world real off-axis discoveries.

**B. Distinct architecture + materials.** Build a small, reusable city-specific asset kit per world: at least 6–10 façade variants with realistic silhouettes, roof geometry, front doors/windows, regional signs with human-scale legibility, 2–3 genuinely enterable interior types with furniture and NPC service points, paving/curbs/bridges and regionally correct trees. Include PBR roughness/normal/ao when appropriate and license-approved compressed textures or modeled detail. Avoid a sea of untextured extruded cuboids. Real location names should be accurately placed; imaginary shops clearly labeled as fictional.

**C. Living streets and crowd quality.** NPCs should use the existing four-choice conversation and memory framework where possible. Start with 6–10 distinct named characters per city from `NPC_PACKS/`, schedule-driven venue routines, varied clothing and gestures, standing/sitting/walking, spontaneous conversations and invitations. Then add lightweight pooled, locally diverse crowds by region, time and festival. Do not conflate ethnicity with personality or dress everyone in costumes. Named NPCs need recognizable faces, idle animation, movement, service interaction and consistent persistence keys. Photoreal close-ups via licensed GLB heads/texture atlases/rigs only if perf accepts them; far characters use instancing/impostors/LOD.

**D. Actual activities.** At least 3 genuinely interactive and player-tested signature actions in every first vertical slice: e.g., subway ticket + ride, ferry boarding, surf board ride, dive/swim interaction, small shop purchase, live DJ/music instrument, photography, market mini-game, Carnival costume, real event navigation. A sign saying “surfing” is NOT surfing. Reuse `AV.act`, `AV.shop`, vehicles, media, inventory, effects, NPC systems and map rather than inventing incompatible parallel systems.

**E. Audio and NPC talk.** Implement regional ambient audio zones with a foreground/near/mid/far structure. A waterfront must sound different from a temple and a club. Include pedestrian talk murmurs, urban transport, animals, market calls, nature, dynamic day/night layers, spatial positional falloff and crossfades; eliminate loud overlapping music. NPC text-to-speech may use browser `speechSynthesis` with opt-in audio, language fallback and stop-on-dialogue-close; it is not lip-sync quality. Respect mobile user gesture requirements. Do NOT depend on pay-per-call AI APIs. User's original music/films can play subject to supplied assets; never claim missing assets present.

**F. Festival modes.** All cities remain open in normal mode, at least one festival/seasonal mode per city where grounded. Event mode changes streets, NPC density and routine, outfits, particles, sounds and temporary interactables while preserving navigation. Require an off switch, reduced-motion/no-flashing modes, crowd budgets and restoration after exiting. Examples: King’s Day, Oaxaca Día de Muertos, La Mercè, Cádiz Carnival, Feria de Abril, NYC 1926 New Year, Rio Carnival, Madrid New Year, Tokyo matsuri, Paris Fête de la Musique. Some fictional festival ideas are labeled fictional.

**G. Mobility, map, travel and saving.** Keep the existing circular minimap and full atlas integrated, with genuine discovered POIs, off-screen destination list, north-up toggle and transport routes. Update World Registry *additively*; preserve existing ids/world hooks. Make Spain a functional regional hub with real connections only where targets are playable. Provide first-person scooter/bike/metro/ferry/boat rides or short staged transport where large distances would be absurd. Persist world/scene position, inventory, bank balance, unlocked POIs, named relationships and festival mode without breaking schema v2 or erasing old saves.

**H. Real-player acceptance.** Tests and screenshots are evidence only for what they actually exercise. Browser launch not equal owner approval. For each city include daylight/night screenshots at street level, landmark viewpoint, two interiors, NPC interaction, actual playable activity, transport or portal in/out, minimap labels and short audio walkthrough. Manual visual inspection must reject boxy facades, floating signs, collision bugs and primitive default crowds.

## Deliver in bounded phases (do not try to build 14 cities overnight)

### Phase 0 — Audit, baseline and consent-safe project setup

- Protect original game checkout, current `main`, branch, memory saves and local media; document recovery steps.
- Read actual engine files and existing tests. Confirm working branch, public/local URLs, and commit ID shown in F3 or an info panel (implement build ID only if not already present).
- Create `docs/GLOBAL_CITIES_STATUS.md` as a permanent project ledger, with **PLANNED / REGISTERED / ART-ONLY / LAYOUT-ONLY / FIRST-SLICE PLAYABLE / AUTO-TESTED / OWNER-TESTED / VISUAL-APPROVED** independent fields.
- Verify that the package's new `DATA/*.json` are valid content design *not* a replacement for live repo data. Map illustrated art belongs in `design/global_cities/REFERENCE_MAPS/`; no runtime image download required.
- Run existing core, minimap, music, vehicles, social, Songkran, Pai and Astro-9 regression suites with timeouts. Do not block forever on headless very low FPS. Measure actual owner laptop FPS via F3 before increasing human/foliage load.

### Phase 1 — Preserve and elevate current worlds

- Continue **Pai major visual rebuild** from its existing map, replacing boxy blocks with real Pai shophouses/signs, actual surroundings, dense nearby jungle, proper river and nature audio; preserve the minivan and all existing gameplay.
- Keep Chiang Mai and Da Nang visually good and playable, all venue relationships correct. Keep Songkran festival working. Preserve ongoing Astro-9 districts, films, Club Graviton and DJ.
- Implement missing common travel/meta systems only as necessary for new cities, without redundant code.

### Phase 2 — Madrid pilot (visual quality benchmark)

- Use the supplied Madrid illustrated map. Make a first bounded pilot with **Pinar de Chamartín + a metro connection to a walkable Sol/Gran Vía slice**: functional home, named NPC, metro turnstile/ride, real shop interiors, park/bench, 12-grapes New Year event.
- Make the first city **visually credible** before extending it to 10 districts. Use real street-level screenshots. Establish a reusable facade/props/material system and measure FPS on Intel Iris Xe low and phone low.
- Deliver a 1–2 minute tester route and owner-approved visual-quality comparison against Chiang Mai/Da Nang, not just “compiled successfully.”

### Phase 3 — Expand best candidate worlds through individual vertical slices

- Priority proposed order: **Barcelona → Amsterdam present → Oaxaca → Koh Tao → Tokyo → Sevilla → Cádiz → Paris → Rio → Chefchaouen → New York 1926 → Canary Islands**. Let the user reorder once the baseline works. Do not stall on one fancy NPC while all districts remain unwalkable.
- Each release changes one city first: style kit, pilot neighborhood with at least two genuine interiors, 3 interactive activities, 6+ named NPCs, working festival sample, audio, travel in/out, quality capture, and tests. Then an independent expansion pass adds wider districts/outskirts.
- Regional super-worlds (Oaxaca, Canaries) use sub-world scene segments; not a single mega-scene with everything visible.

### Phase 4 — Spain hub, era portals and advanced visuals

- Add Spain atlas selector with clickable playable locations, disabled previews for unbuilt places and ferry/plane/rail travel scenes. Add Ibiza 1969 via existing ID after new verified illustration, and future Amsterdam 2077 as a **separate speculative world**.
- Upgrade close-range human faces, bodies, expression rigs, hair and natural walk/idle/chat animations with adaptive quality. Avoid replacing each crowd with dozens of 100k-poly skinned models. Measure real performance. Maintain accessibility.

### Phase 5 — Final integration and handoff

- Regression-test every core original world and the previous V1.1 features. Review festival toggles, travel, save/reload, mobile controls, item interactions and voice fallback.
- Update content manifests, permanent ledger, commit history and a human-readable changelog. Provide launch URL **only after verifying the deployed target**. `http://localhost:8095/` is laptop-local, not a public link for friends.

## Quality gates and evidence, before calling ANY city 'done'

- **Visual:** screenshots of recognizable regional architecture, a distinctive landmark, two interior styles, materials/signs, populated public space and environmental transition. The player must say it looks comparable to the improved Chiang Mai/Da Nang build. Reject undressed gray boxes.
- **Gameplay:** walk/ride at least 250 m of connected route without collision blockers or falling through; enter venues and buy; talk to a named character with context-sensitive choices; perform one city-specific activity; festival ON/OFF; map; travel out and back; reload save; work in portrait phone controls.
- **Audio:** zone crossfades and localized music not globally audible; NPC talk works if enabled, text fallback always; original sound assets or licensed recordings only; all visuals optional for reduced motion.
- **Performance:** **measure**, don't guess. Target on the actual laptop at a representative 720p/Low scene about **30 FPS or better** and a practical mobile Low target around 24–30 FPS, with graphical downgrades when necessary. These are design targets, not claimed current benchmarks. Record actual frame time, drawn triangles, draw calls, active NPCs, texture memory, first-load time. No “done” when movement stutters or average FPS collapses to single digits.
- **No fabricated assets:** if a GLB/texture/audio file or a film is missing, create an honest placeholder or procedural fallback; record missing item and its needed license/source. Use only rights-cleared assets, never rip games/music or claim a downloaded stock image is original.
- **No fabricated testing:** if automated only, say “auto-tested; owner still to check.” If no real device available, say precisely that.

## Response protocol at the end of EVERY milestone

Give the user:

1. `Branch / commit / local URL / public URL if deployed`.
2. `What changed` (files and concrete playable actions).
3. `What does not exist yet` (the city list and current graphic gaps).
4. `Tests passed / failed / not run`, and whether anyone played by hand.
5. `Measured real-device FPS`, or explicitly “not measured.”
6. `Next 1–3 tasks` with a checkpoint so a new session resumes without repetition.

Continue work as session limits allow, but DO NOT imply a background job will run while Claude is offline. Do not ask for the master prompt again; save progress in the repository. Never push directly to `main` or overwrite older work without permission.

## Your first instruction NOW

**Do Phase 0, update the permanent ledger and plan. Then begin the smallest safe next playable milestone, favoring the unfinished Pai visual pass and the Madrid visual pilot.** Do not simultaneously generate dozens of low-quality placeholder cities. If a new feature branch is needed, create it only after safeguarding the active work branch and checking with the owner about current uncommitted changes. Keep existing Astro-9 and Pai work. Report actual build information, human-test URL, and source-of-truth status at the next checkpoint.
