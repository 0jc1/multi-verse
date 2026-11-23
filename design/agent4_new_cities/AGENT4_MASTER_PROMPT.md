# APEVERSE — CODEX AGENT 4: NEW CITY & WORLD DEVELOPMENT

## YOUR ROLE AND PROJECT

You are **Agent 4**, one of four Codex agents working on the existing Apeverse first-person 3D browser game.

- Repository: `https://github.com/0jc1/multi-verse`
- Starting development branch: `apeverse-v1-jungle-slice`
- Your responsibility: **build NEW realistic, explorable city/island worlds from the supplied illustrated map references**.
- Other agents: Agent 1 owns Madrid polish, Agent 2 owns Astro-9, Agent 3 owns shared transportation. **Do not edit their systems or overwrite their work.**
- Keep the existing game, saved progress, film and music assets, and established world behavior intact. Never reset the repository, force-push, or change `main`.

The nine new destinations for this assignment are **Oaxaca (with distinct linked regions), Paris, present-day Amsterdam, Rio de Janeiro, Chefchaouen, Sevilla, New York in 1926, Tokyo, and Koh Tao**. The tenth reference image is **Madrid**, which is an EXISTING world and your **minimum quality benchmark**, not an assignment to rebuild Madrid.

The reference maps are supplied in `REFERENCE_MAPS/`; read them carefully. They are colorful illustrated **creative and landmark-layout references**, **not** a request to make cartoonish, blocky 3D versions. The finished game must feel like exploring realistic real-world streets and landscapes, with regional architectural character and rich city life.

If the map image files are missing from your Codex workspace, say so and use any existing city briefs; **request the images or instruct the owner to upload them to your branch**. Do not claim you inspected absent images. The `SUPPORT/` folder contains extensive prior detailed briefs and NPC rosters; use it, but cross-check with the actual current repository and these instructions.

## MANDATORY STARTUP AUDIT

1. Inspect the latest remote `apeverse-v1-jungle-slice` and record its commit SHA. Discover and read `README.md`, `docs/WORLDS_REBORN_STATUS.md`, `docs/KNOWN_LIMITATIONS.md`, `docs/TESTING.md`, and the existing design packs.
2. Inspect `data/worlds.json` and any parallel world registry files, `js/world_kit.js`, `js/main.js`, `js/core.js`, `js/minimap.js`, `js/portal.js`, `js/social.js`, `js/v1_systems.js`, `js/vehicles.js`, `js/audio.js`, and several mature world implementations, especially Madrid, Da Nang and Chiang Mai.
3. Identify which proposed IDs already exist and avoid duplicates. At the last observed remote snapshot the nine destinations were not playable; recheck before editing.
4. Create a **dedicated Agent 4 feature branch** based on the newest stable development commit, e.g. `codex/apeverse-new-cities`. Never share a working branch with the other live agents.
5. Create `docs/CODEX_AGENT4_NEW_CITIES_STATUS.md` with per-world quality gates and an honest implementation ledger. It must survive task/session boundaries. Record what remains planned versus implemented versus verified.
6. Do not edit the Madrid, Astro-9, or shared vehicle-engine modules. Adapt new worlds to existing APIs. For required shared integration changes, minimize and isolate the changes, document them and flag possible conflicts for integration.
7. Look for existing local-only or previous-agent assets, but do not assume Codex Cloud has access to images or media only present on the owner's laptop.

## QUALITY FLOOR: AT LEAST THE CURRENT MADRID WORLD

**Every new city must AT MINIMUM achieve Madrid's existing standard: a sizable continuous, walkable map with geographically coherent neighborhoods, shops and recognizably local street life, an integrated zoomable minimap/full map, actual activities and functioning entry/return travel.** Where Madrid still has visual weaknesses, don't repeat them; aim higher.

A completed city is **not** a world-selector card, a distant skyline, 3D cubes on a road, disconnected set pieces, generic signage, or a headless test that passes while the scene is ugly.

### Streets and level design

- Build one interconnected walkable **urban fabric per city**, preserving real-world relative locations/adjacencies. No disconnected neighborhood islands. Stream sectors behind the scenes if necessary, without visible teleport transitions between adjoining neighborhoods.
- For genuinely separate destinations (Oaxaca mountain village and Pacific coast, Woodstock beach outside Amsterdam), use geographically truthful regional travel with meaningful transitions rather than compressing journeys into a few hundred meters.
- Distinct neighborhoods must shift naturally in building proportions, street widths, paving, businesses, trees, traffic, signage, crowd routines and music.
- The player's walking, climbing, swimming, vehicle routes, shop doors and portal spawn must make sense; paths must be physically accessible, with collision checks.
- Prioritize a convincing first 400–800 m of truly excellent street-level detail, then expand continuous neighborhoods without degrading quality. Final scope must go beyond one postcard block.

### Visual realism and microdetail

- Detailed region-specific facades: masonry, plaster, tiles, rooflines, balconies, courtyards, awnings, steps, gutters, window frames, interior views, wear/dirt, credible scale.
- Many genuinely distinctive signs: shops, menus, road signs, station signs, neon, handwritten chalkboards, posters, event flyers, graffiti and stickers. Use accurate local scripts and readable typography; no generic all-caps colored rectangle repeated across a city.
- Street furniture: storm drains, manhole covers, cracks, tactile paving, kerbs, streetlights, cables, bins, graffiti walls, bikes, crates, parked vehicles, traffic signals, benches, utility boxes, lamppost notices and café terraces.
- **Nature everywhere appropriate**: roots, tree species, varied canopy shapes, bushes, potted plants, palms, bougainvillea, vines, flowers, parks, moss, beaches, reefs, rivers, hills, shade and terrain detail.
- Day/night lighting, warm shop windows, realistic sunlight, atmospheric depth, ambient audio and nighttime streets that remain visually legible.
- Use performant glTF/GLB assets and procedural geometry *where appropriate*, texture atlases, instancing, view culling, LOD, pooled objects and streaming. Decorative texture detail can substitute for expensive geometry. Don't assume 3D asset-generation services are available.
- Generate diverse, fictional NPCs inspired by the city, not replicas of private individuals; use existing NPC animation/social systems and performant crowd LOD.

### Businesses and things to do

Each substantial neighborhood should include real enterable, visually distinct interiors and working NPC/service interactions. Reuse existing shops, inventory, audio, eating, drinking, social and mini-game frameworks; don't build fake prompts or empty counters. Include region-appropriate food and vegetarian/vegan choices, cafés, shops, museums/galleries, music venues, hotels/hostels and outdoor gathering spaces.

At least one locally appropriate **festival or seasonal mode per city**, with changes in decorations, crowds, audio, NPC dialogue and activities. Every location remains explorable outside its festival. Use actual dates when well established and avoid inventing fixed dates for movable festivals.

A full-screen zoomable/pannable map must use existing `js/minimap.js` conventions, show real streets/paths, named neighborhoods and POIs, and support orientation and destination routes. Keep laptop and Android controls working, including first-person walking, existing bikes/scooters/transport integration where supported.

### Performance and evidence

- Browser-first, free public access; target the owner's Windows HP Spectre x360 Intel Iris Xe and Android phones.
- Include Low/Medium/High settings and draw-call/triangle budgets calibrated to existing good worlds, not imagined hardware.
- Test the actual first-person user journey: portal arrival -> map -> walk through streets -> enter business -> interact/purchase -> exit -> travel -> return portal, including desktop and mobile input where supported.
- Capture screenshots or automated visual previews **where tools permit**; explicitly state when visual QA or real-device FPS is not available. Headless success never proves photorealism.
- Preserve the same save keys and media wiring; never use unavailable commercial assets/licenses.

## THE NINE NEW WORLDS — ARCHITECTURAL AND GAMEPLAY BRIEFS

### 1. `seville` — SEVILLA, SPAIN (START HERE; BUILD A FULL QUALITY BENCHMARK)

Match Madrid's continuous city scale/quality, adapted to Andalucía. Connected Cathedral/Giralda, Real Alcázar/Santa Cruz maze, Plaza de España/María Luisa Park, Alameda, Las Setas, Guadalquivir waterfront, bridges and Triana ceramic/music quarter; Feria fairground is separate but accessible. Cream/yellow/white stucco, colorful tiled ceramics, iron balconies, patio courtyards, orange trees, shaded lanes, flamenco stages, tapas, vegan options and bar terraces. Walking, bicycles and river boats. Feria de Abril mode with decorated casetas, lanterns, music, dance and crowds; preserve normal city outside the fair. Spanish signage should be highly varied, correctly spelled and visually credible. Demonstrate the reusable quality kit here before scaling to nine destinations.

### 2. `koh_tao` — KOH TAO, THAILAND

One continuous, convincingly scaled tropical island with winding scooter roads, jungle hills, cliffs, rocky coves, reefs, beach towns and proper coastlines. Mae Haad Port, Sairee Beach, Mango Bay, Tanote Bay, Ao Leuk, Shark Bay, Turtle Reef, Coral Gardens and John-Suwan viewpoint; believable island route distances. Default arrival/home base is the user's **remembered black-walled, psychedelic-mural harbor hostel** near Mae Haad: downstairs shop, small upstairs dorm, large leafy balcony with sea views. 'Black Reef Hostel' is a **creative reference label**, not a verified real-world business. Include warm Thai staff, hostel guests, fictionalized dive instructor **Chloe** based on a user memory (no asserted real-world likeness), dive-school sign-up, boat tour, snorkeling, simple underwater exploration with marine life and scooter rental. Tropical trees need species differentiation, roots and shoreline detail; ambient geckos, insects, waves, long-tail engines, cafés. Island nighttime events; underwater activities require playable safe controls and performance testing.

### 3. `paris` — PARIS, FRANCE

One coherent, walkable central city with Seine, Île de la Cité/Notre-Dame, Latin Quarter, Saint-Germain, Louvre/Tuileries, Palais Royal, Marais, Centre Pompidou, Opéra, Champs-Élysées/Arc de Triomphe, Eiffel/Trocadéro and linked Montmartre/Pigalle/Canal Saint-Martin districts. Maintain Seine bank relationships and bridge crossings. Parisian Haussmann limestone facades, mansard roofs, ornate balconies, cafés, pâtisseries, booksellers, metro entrances, signage in French, street artists, small jazz venues, galleries and river boats. Fête de la Musique night with street concerts. Do not simply distribute landmarks around a square.

### 4. `amsterdam` — PRESENT-DAY AMSTERDAM, NETHERLANDS

A physically connected canals-and-bridges city: Centraal, Dam, Jordaan, De 9 Straatjes, De Wallen/old center, museum district, Vondelpark, Leidseplein, Rembrandtplein, NDSM reached by ferry, bicycle streets and canal boats. Dutch brick canal houses with unique gables, narrow facades, real varied shopfronts, bike racks, signage, trees, mooring details, boats and trams. King's Day (27 April, or the locally observed date) adds orange street markets, boats and music but leaves the city playable year-round. **Important correction:** Woodstock'69 beach club is at **Bloemendaal aan Zee**, not Pllek or central Amsterdam: place as an out-of-city coastal destination connected through longer travel, not on an Amsterdam Noord canal.

### 5. `chefchaouen` — CHEFCHAOUEN, MOROCCO

A continuous hillside medina with bluewashed textured walls, interlocking stair streets, arches, timber doors, tiled stairs, rooftop terraces, craft markets, Kasbah, Plaza Uta el-Hammam, Ras El Maa waterfall, Spanish Mosque viewpoint and Rif Mountain trails. Moroccan craft/tea/food/music, local traders, artisan activities, layered plants, domestic cats, lanterns and textiles. A medina arts/crafts/music seasonal event (if fictional, label it in-game as an Apeverse festival). **Important correction:** Café Hafa is in Tangier; the map's label is misplaced. Use a generic fictional Chefchaouen rooftop tea café instead.

### 6. `oaxaca` — OAXACA REGIONAL WORLD, MEXICO

Treat as **linked but genuinely distant regions**: walkable Oaxaca City historic center/Zócalo, Santo Domingo, Jalatlaco with real street planning and detailed colonial houses/markets/altars; travel by bus/pickup to high-altitude San José del Pacífico cloud-forest village and fictionalized Cumbre Hostel; far Pacific region with distinctly explorable Puerto Escondido surf town and Zipolite beach community. Monte Albán west/southwest of Oaxaca City; Mitla/Hierve el Agua east: geographically correct relationships, not one merged neighborhood. Day of the Dead/Día de Muertos mode with community altars, marigolds, processions, music and crafts; avoid trivializing remembrance. Include indigenous Zapotec cultural detail respectfully, varied food/markets, surfing, mountains, fog, beaches, taxis and buses. The illustrated drug-crop elements are not a requirement for mechanics or production systems.

### 7. `rio_de_janeiro` — RIO DE JANEIRO, BRAZIL

Respect real coastal and hill geography: Centro/Lapa, Santa Teresa with tram, Escadaria Selarón, Flamengo/Glória, Copacabana, Ipanema, Leblon, Arpoador, Sugarloaf/Pão de Açúcar, Corcovado/Cristo Redentor, Jardim Botânico and Tijuca rainforest. Varied beach-front mosaics and kiosks, apartments, forest foliage, beach sports, samba/music venues, buses, cable car, viewpoints and accessible trails; culture beyond Carnival stereotypes. Carnaval mode with real nighttime ambience, performers and neighborhood blocs, while city works year-round. Waves, beach umbrellas, wildlife and steep terrain must look credible.

### 8. `tokyo` — TOKYO, JAPAN

A dense, coherent metropolis with realistically connected local districts and useful train links over citywide distances: Shibuya crossing, Harajuku/Meiji/Yoyogi, Shinjuku/Kabukicho, Akihabara, Asakusa/Sensō-ji, Ueno, Koenji/Nakano, Shimokitazawa, Roppongi, Tsukiji outer market, Odaiba/Toyosu. Not every far-apart station has to fit in a tiny block; use streaming and meaningful train travel. Huge differentiated station signage and streetscape typography in appropriate Japanese, compact shops, arcades, karaoke, noodle shops, gardens, shrine areas, vending machines, utility wires, trains and street details. Seasonal sakura/hanami mode or other real local festival. Keep fictional anime signs original rather than copying commercial characters.

### 9. `new_york_1926` — NEW YORK CITY, PROHIBITION ERA, 1926

A historically grounded 1926 city, including Harlem jazz clubs, Midtown/Times Square theaters, Greenwich Village, Lower East Side, Chinatown, Little Italy, Hell's Kitchen, Wall Street/Financial District, riverfront docks and ferries, Brooklyn bridges where period-appropriate. Period-specific brownstones, tenements, stone office buildings, elevated rail, streetcars, early autos, signage, newspaper vendors, jazz venues and believable period fashion. Working speakeasy discovery, music/jazz and immersive historic NPC missions. A fictional in-game Harlem jazz festival/night is fine; label fictional events. **Do NOT use the completed Empire State Building in 1926 (finished 1931). The Great Depression starts in 1929, so do not make a 1926 map primarily Depression-era.** No modern skyscrapers, cars or 2020s signs.

## PRIORITY AND DEPENDENCIES

**Prove the quality pipeline with Sevilla first** because Madrid's existing architecture systems can provide read-only inspiration, but do not modify Madrid source. Then tackle Koh Tao, Paris, Amsterdam, Chefchaouen, Oaxaca, Rio, Tokyo and New York 1926. You may propose a changed order if repository evidence strongly justifies it; document the reason.

For each destination:

1. Draft a geospatially coherent district/region plan from the illustration and real place relations.
2. Implement the core continuous walkable environment, distinct authentic architecture and a believable main neighborhood.
3. Add street microdetail, foliage, light, signs, ambience, unique NPCs, multiple enterable venues and interactions.
4. Add festival and appropriate travel/vehicle integration using shared existing systems.
5. Wire the map, portal registry and day/night audio; protect saves and legacy routes.
6. Test pathfinding/walkability, collision, UI, shops, navigation, mobile controls, performance and visual appearance.
7. Record screenshots, commit a bounded verified milestone, mark remaining gaps explicitly and continue with the next build increment.

**Do not register a world as `playable` before minimum gates are demonstrated.** A world can stay planned/preview even if the destination icon or asset scaffolding exists. If a city cannot reach Madrid quality this session, finish and verify one cohesive district and leave an honest persistent roadmap rather than mass-producing empty worlds. Continue the multi-world roadmap in subsequent sessions, using the ledger instead of repeatedly rebuilding the same scaffold.

## MERGE / GIT / CONFLICT POLICY

- Exclusively own your new `js/world_<city>.js`, `js/city_<city>.js`, `data/agent4_*` or equivalent city-specific modules, tests, and `docs/CODEX_AGENT4_NEW_CITIES_STATUS.md`.
- Prefer additive new modules and data files. Common touchpoints such as `index.html`, `js/main.js`, `data/worlds.json`, `data/worlds.js`, `js/portal.js`, `js/minimap.js` must be changed carefully and minimally. If another agent has modified a common file, rebase with review or separate the integration into a dedicated PR instead of clobbering their edits.
- Do not edit `js/world_madrid.js`, `js/madrid_city.js`, `js/world_astro9.js`, `js/astro9_*.js`, `js/vehicles.js` or shared vehicle physics.
- Create reviewable pull requests (or branch and commits if PR creation is unavailable), **never auto-merge** into active shared development while other agents are working.
- Commit only code and **properly licensed** or user-supplied image references; do not add gigantic generated binaries or private media without checking the repo's asset policy.

## FIRST EXECUTION IN THIS TASK

1. Audit repository/branch and discover the supplied map reference assets and detailed briefs.
2. Create persistent status ledger and quality checklist for all nine new worlds.
3. Build a complete, convincing **Sevilla first district** with truly distinctive Andalucían architecture, realistic signs and streets, orange trees, enterable businesses, NPCs, working map and portal, and a scalable contiguous plan for all its neighborhoods.
4. Implement a targeted test for visiting and walking between initial districts and entering at least one business.
5. Run available headless regression checks, gather a screenshot where possible, and commit your branch. Explain any missing real-device/visual tests.
6. Report how to access this new world in a locally run game or review preview and the next development milestone.

**Do not stop after presenting a plan. Make real code changes, test them, and continue incrementally toward all nine cities.**
