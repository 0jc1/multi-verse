# APEVERSE: FULL MULTIVERSE EXPANSION AND CINEMATIC QUALITY PROGRAM
## Master instruction for Claude Code - 24 November 2026

You are the lead engineer, environment artist, technical director and integration manager for **Apeverse**, a free browser-playable, first-person 3D multiverse starring **Ztonedape**. The creator wants the existing project substantially improved, not replaced. Treat this as a persistent multi-session engineering program. Work independently through the ordered milestones, with truthful progress reports and regular commits. Do not stop after each minor feature to ask what to do next. Ask only when a decision is genuinely blocked by missing information, an irreversible action, rights, or an unavailable art source.

### 0. Working repository, sources and non-negotiable safeguards

**CURRENT IN-PROGRESS WORK:** The latest owner screenshot shows you already investigating Vienna sky/haze, distant suburbs, Wienerwald silhouettes and lighting. If that work is still underway when this prompt arrives, FINISH or safely checkpoint that exact milestone first, run its relevant test, and commit/push it before switching tasks. Do not lose in-memory work by restarting or checking out another worktree mid-edit. Then follow this broader program.

Repository: https://github.com/0jc1/multi-verse

Important known refs from the last inspection (verify afresh; they may have advanced):
- Working branch: `apeverse-cinematic-v1`.
- Review/integration base: `apeverse-integrated-preview`.
- Other development reference: `apeverse-v1-jungle-slice`.
- Working browser preview reported at `http://localhost:8096/`; untouched stable preview at `http://localhost:8095/` on the creator's laptop. These are LOCAL URLs, not public links.
- Read `docs/APEVERSE_LEDGER.md`, `docs/CINEMATIC_V1_PROGRESS.md`, `docs/ASTRO9_CITY_PLAN.md`, `docs/WORLDS_REBORN_STATUS.md`, `design/worlds_reborn/CLAUDE_MASTER_PROMPT.md` if present, and `data/worlds.json`.
- Three.js r128 and classic script architecture, Windows PowerShell runner and existing suites; do not introduce a large new build system without a measurable reason.
- Check Git status, log, branch comparison, all open worktrees and changes BEFORE editing. Never discard, rewrite or force push contributor changes. Preserve existing browser localStorage saves (`apeverse_v09`) and photo IndexedDB via migration-safe edits. Do not auto-merge into main.
- Codex work: do not assume work from Madrid/Astro-9/transport agents exists. Scan GitHub branches/PRs, local handoffs and Downloads. The Sevilla Agent 4 export was previously recovered to a quarantine branch and was NOT yet accepted into the cinematic branch. Inspect and score quality before integrating anything. Maintain authorship and report missing patches explicitly.
- First make a fresh backup branch/tag from current work. Work on a NEW dedicated branch based on the latest verified cinematic branch, or on the existing one if creator explicitly insists. Push milestones to GitHub only when tests pass. Open a PR against the appropriate integration branch; never merge automatically.
- Read every file in THIS PACK before coding. Copy this spec into the repository's docs as a persistent reference. If the original reference images are not available as actual files, create an asset request checklist and continue with tasks that do not depend on them. Do NOT claim art/images have been imported if they have not.

### 1. The creative target and definition of success

Apeverse should feel like an explorable, visually convincing, living set of real places and imaginative planets, with distinct districts and a reason to wander every side street. **Madrid is the current minimum quality reference, Da Nang and Chiang Mai are further reference benchmarks, and the strongest Astro-9 Neon Boulevard sections are a starting point for ambitious world-specific style.** The creator wants better than those references when practical.

This does not mean claiming full photorealism from low-poly primitives. Prioritize realistic proportions, PBR/roughness/normal materials where supported, distinctive architecture silhouettes, authored details at eye level, authentic signage, textured ground, believable lighting, weather, daylight transitions, and people doing sensible things. Keep everything playable on an HP Spectre x360 / Intel Iris Xe and mobile. Favor detailed player-visible blocks + efficient streamed neighborhoods over giant empty landscapes or an undriveable bloated scene.

Every improved neighborhood must have: connected traversable streets and alleys; physically logical building plots; unique storefronts; sidewalks and crossings; sensible furnishing; subtle ambient motion and audio; practical businesses; reasonable pedestrian behavior; map markers; one discovery activity; no obvious clipping, teleports, road obstructions or blank borders. Avoid long rows of identical boxes, bare billboards, textureless giant blocks, copy-pasted shop signs and glowing objects with no physical justification.

**User-specific non-negotiables:**
- NO flowers, pots, benches, scooters or trees in the active driving lane. Planting belongs in curb recesses, medians, pocket parks, courtyards or sidewalks with adequate pedestrian clearance.
- NO visually empty huge unplanned gaps; distribute blocks like an actual city. A park, field, plaza, waterfront or deliberate scenic gap must have an obvious reason and design.
- Reduce uncontrolled/random NPCs, repetitive dancing/waving and endless random wandering; make a slightly calmer but more believable world.
- No basic floating generic posters. Distinctive place-appropriate mounted signs with texture, material, mounting geometry, legible text, weathering and lighting.
- Existing film screens and cinemas should show real user video assets where files/browser playback allow, never claim playback from merely loading an element.
- Let players enter real shops, interact with counters, browse products and purchase in-game items that work.
- The world should be freely accessible on laptop AND phone, with responsive controls and multilingual interface support (at least English/Spanish).

### 2. Immediate milestone: inventory, fix blockers, establish visual baseline

1. Capture the latest current branch, uncommitted changes, remote branches and PRs. Verify which fixes are present. Compare the world ledger against actual code and tests. Correct stale statuses (for instance Vienna may say `planned` in the world registry despite completed cinematic milestones).
2. Run focused smoke tests on all registered playable worlds. Record actual boot, spawn, portals, collision, inventory, save/load, shop door, vehicle exit, map, and mobile input results. Capture representative before screenshots from in-game camera, NOT promotional concept art.
3. Create `docs/APEVERSE_EXPANSION_STATUS.md` with DONE / PARTIAL / BLOCKED / PLANNED and links to commits/evidence. Add a small quality matrix for geometry, signage, architecture, NPC routines, interactivity, performance.
4. Address confirmed failures: Astro-9 hover-lane crossing (reported intermittently), intermittent Pinar Avenue/Madrid obstruction, Pai north road collision, visual day/night mismatch at 19:00, Giant Hostel entrance if still blocked, and any startup errors. Compare baseline tests to changed build, fix root causes, not test timeouts alone.
5. Preserve an easy-to-launch stable preview and a separate live upgrade preview; don't overwrite the working instance to claim progress. Log actual running URLs, ports and LAN caveats.

### 3. World-wide systems FIRST (then reuse everywhere)

**3A - Architectural and material toolkit**
- Semantic street/block/site data, road reservations, walkable surfaces, property boundaries, curb islands, crossings, bike lanes, parking and entrance setback zones. All vegetation, street art, signs, road furniture and props must obey semantic placement tests.
- Reusable realistic facade kits, but world-specific architectural styles: window ratios, roofline variation, balconies, shutters, surface trim, weathered render, stone, wood, ceramic, brick, glass/metal and believable structural thickness. District/block-level seed variation; do NOT stamp the same facade 20 times.
- High-quality texture atlases and physically plausible material response. Use licensed/original assets or generated originals; no copyrighted brand marks or unlicensed scraped shop photos. Real-world architectural styles can be referenced; private business likenesses need permission where necessary.
- Characterful signs: real brackets, hanging boards, lightboxes, enamel, carved wood, neon tubes, paper posting layers and street numbering. Use appropriate real local languages but validate spelling. Place posters on walls or noticeboards and graffiti in credible legal/fictional locations, not randomly on pristine monuments.
- District streaming, instancing, mesh merging PER BLOCK, LOD, texture mipmaps and short draw distances for microscopic props. Preserve collision and interaction as detail chunks stream.

**3B - NPC schedules and social realism**
- Lower the population caps and stop the repetitive random actions. Give NPCs weighted roles and places: vendor at counter, cook in kitchen, busker at venue, shoppers browsing, hostel guests sitting, tram passengers waiting, delivery rider unloading, a few tourists taking photos. When venues close, NPC routines should change.
- Fictional, visually varied adults with sensible height/body/face variety, local clothing and weather-appropriate outfits; avoid ethnic caricatures, duplicated faces and wall clipping. Use fine detail for named/near NPCs, lightweight distant LOD/impostors. Named characters must keep authored personalities/dialogue. No photoreal recreation of private real people without their approval.
- Day/night/weekday/festival state drives schedules. Conversations have context and meaningful choices. Crowd density modest: busy venues and event windows, quiet residential alleys and dawn streets. Avoid performance-heavy 70k-triangle generic background NPCs.

**3C - Transport and road behavior**
- Reuse/upgrade current bicycle, scooter, e-scooter, hover scooter, tuk-tuk, shuttle and car systems (verify the actual types). Working keyboard and mobile acceleration, braking, steering, enter/exit, collisions, suspension illusion, sounds and smooth first/third-person camera.
- Add practical car/moped driving where absent and traffic that follows lane geometry. Stop signs, controlled intersections, sidewalks and curb use must be coherent. Foot traffic and vehicles cannot phase through each other or park on shop entrances. Allow rentals and travel to world gateways.
- Test tight alleys, buildings, potholes, slopes, bridges, and world transitions. Respect accessibility and player comfort (motion/reduced-motion options).

**3D - Things to do, not just scenery**
- Eating: order at a menu/counter, pay with earned IN-GAME credits, item visible, brief eating animation, optional energy feedback.
- Drinking: buy a coffee/juice/drink; raise glass/bottle; optional simulated intoxication if appropriate and togglable. No real-world drinking encouragement.
- Smoking: joint/pipe/cigarette or fictional equivalent when age/region and platform content settings permit; correctly hold, inhale/exhale, smoke particles, subtle optional short visual state, and put away item. Restore original portal-pipe behavior and avoid clipping or permanently held props. Never portray these actions as health benefits.
- Functional DJ booths (existing mixer), instruments, street art/graffiti zones, live performances, arcade games, basketball, pool, surfing/diving where the destination supports it. Interactions should actually work, not just show text.
- In-game accommodation/apartment ownership or rental, furniture placement, inventory, optional wearable clothing. Economy should work without any real payment.
- Cinemas, wall displays and billboards play the creator's films where properly configured; use local assets or approved URLs and user gesture for sound when required by browsers. Fall back to art/preview if video unavailable.

### 4. PRIORITY CITY POLISH: do this before scattering generic new worlds

**Astro-9 - highest visual ambition:** Preserve existing 12-street network, 8 loops, 68 buildings, 12 enterable businesses and Neon Boulevard. Push beyond the boulevard: Undergrid, Alien Bazaar, Residential Terraces, Biotech Quarter, Art Avenue, Food Ring, Sky District, temple, transit, Graviton club. Blocks must differ in scale, height, income/style, signage, surfaces, furniture, light and NPC behaviors. Add odd side streets, vertical connections, service alleys, rooftop access and useful dead-end secrets only where intentional. Massive sci-fi cinematic city, not equally sized bright rectangles. Textured wet roads, exposed power cabling, ducts, shop interiors, distinctive invented alien glyphs with readable translation. Music in Club Graviton must make gravity subtly feel different, with airborne objects. More shops/activities and 3D architecture detail **without regressing the measured GPU performance**. Complete the remaining Astro-9 districts and recheck hover-lane walkability.

**Vienna 2000s Memory World:** Finish all 9 neighborhood identities and street fabric. Architectural contrasts between Innere Stadt, Ringstrasse, Graben, Stephansplatz, Mariahilfer Strasse, Neubau/Spittelberg, Favoriten, Naschmarkt, Donaukanal, Prater and quieter outer residential streets. Remove white empty-horizon haze with believable sky, distant Viennese hills/suburbs, atmospherics and light that changes with day. Improve Rathaus, Staatsoper, Parliament, Hofburg/Heldenplatz, architectural signage, shop awnings, tram stops and overhead cables. Walk-in coffeehouses and Heuriger, people reading papers, ordinary street traffic, courtyards. Include a nostalgic late-2000s memory flavor (not a cartoon historical reconstruction) without mislabeling present-day landmarks. Preserve rideable Ring tram and existing checkpoints.

**Pai, Thailand:** Rebuild off Walking Street with unique local shophouses, workshops, bars, hostels, bungalows, farmland, jungle and mountain roads. Better signs (not identical purple panels), Thai/English typography where appropriate, dirt textures, outdoor seating, corrugated roofing, wiring, market stalls and night atmosphere. Realistic hierarchy: town center -> quieter residential/riverside lanes -> fields and foothills -> viewpoint/forest. Sunset Bar techno, Paradise Circus fire performances, Rainny Cafe smoothies/vegan options, Ganita Cafe and other food spots, river hostel/bungalows, Pai minivan arrival. Ensure rice paddies and fields are deliberately placed, with paths, not huge blank tracts. Fix north route issues and test scooters between areas. Distinguish rural Thailand from generic tropical cartoons.

**Chiang Mai:** Preserve Giant Hostel facing Big Blues across the ROAD; CHAT 64 m away, Pineapple Express 147 m away on another street. Do not collapse all shops into one cluster again. Add local streets and believable facades and uniquely mounted signs, street-market flow, parked scooters safely at curb, overhead wires, temple/bazaar atmosphere and sensible plant placement. Keep existing Songkran and Yi Peng festival tools while improving festival NPC/crowd plausibility. Ensure hostel door remains passable.

**Madrid:** Fix Pinar Avenue intermittent obstruction, low-poly trees/overly sparse zones, facades and signage. Diverse neighborhoods with real street proportions: Sol/Gran Via, Malasana, Lavapies, Retiro, Chamartin/Pinar; different time-of-day patterns, bars, plazas, apartments and public transit. Add better stores and places to sit, while maintaining benchmark performance. Avoid flattening the city to a giant grid of identical towers.

**Da Nang:** Maintain its strongest details, then improve overexposure/fog, unique Vietnamese shophouses and licensed/original local signs, tangible scooters, markets, riverfront/Dragon Bridge and interior variety. Use it as a quality reference for the other worlds, not as a universal visual style.

**Ape Town, Jungle Dub, Jurassic Koh Samui, Jerusalem/Judean Desert, Verdalux and every other ALREADY playable world:** quick broken-systems audit, then a full world-specific environment and activity quality pass. For alien planets, realism means physically coherent, deeply detailed alien geology/biology/materials, not imitating Earth houses. Music and ecology should fit each place. Every world gets a reason to explore, original texture and atmosphere; do not indiscriminately turn all of them into a neon city.

### 5. CLOTHING AND MERCH: new complete fashion system

Creator supplied art includes travel-souvenir designs, comic stoner designs, psychedelic/Matisse-like cut paper design collections, and Moonmelt Supply Co. illustrations. Branding MUST be exact:
- `APEVERSE` - world and travel-souvenir merch.
- `ZtonedApe` - artist/character brand; exact capitalization, Z first, capital A, no alternate spellings.
- `MOONMELT` / `MOONMELT SUPPLY CO.` - cosmic campground/stay mellow/dream route/low tide etc.
- `SOLTERRA` - warm Mediterranean/tropical cutout collection in the latest sheets.
- Some earlier supplied illustrations read `SOLVERA`, not `SOLTERRA`. **Do not rename or silently combine** them. Preserve literal source artwork, flag whether a separate brand is intended and ask once before final real-world catalog launch.

Technical requirements:
1. Import artwork AS ACTUAL IMAGE FILES. Search repository/working machine for supplied PNG/JPG/SVG assets and list source hashes. The ChatGPT image conversation is NOT automatically a readable asset library for Claude. If needed, request the creator to download original images and give exact directory path. Never pretend a collage is already individual print files.
2. A durable catalog with unique SKU/design IDs, brand, collection, city, description, source image, file status, license/approval, product classes (tee/hoodie/poster/hat/print), NPC outfit eligibility, in-game price and optional future external commerce URL.
3. Split multi-design contact sheets with visual review; crops must not cut lettering, bodies or border. Keep high-resolution originals and create optimized 512/1024/2048 texture variants as needed. Prefer transparent background only when actually clean; do not claim vector or print-ready files from JPG alone. For real-world fulfillment later, create properly upscaled/source-quality print PDFs/PNGs once the manufacturer specifications are known.
4. Create shirts, hoodies, sweaters, caps and occasional tote/bag props with correct UV mapping. Colorway options and realistic fabric roughness/folds where practical. NPC clothing decals must face the proper direction, not float, mirror backwards or show the full contact sheet.
5. Build several DISTINCT branded storefronts (Apeverse concept store, ZtonedApe streetwear, Moonmelt Supply Co., Solterra lifestyle shop, city souvenir kiosks). Place shops in fitting neighborhoods, not all in one row. Real interiors with rails, folded shirts, mannequins, changing mirror and a cashier.
6. Interactive shop flow: browse design -> choose style/size/color -> preview on avatar -> buy using earned virtual money -> wardrobe equip -> save; actual NPCs wear selected designs. Earned credits must work offline/without backend.
7. Real-world purchases: initially a clearly labeled optional external link only, disabled until creator configures a real merchant/payment/dropship integration. Never collect credit card data yourself or imply an order exists. Maintain free core access. No paid random boxes, no paid-for gambling, no financial reward promises.
8. Catalog expansion is data-driven: future illustrations can be added by placing assets into a source directory and registering each one. See `MERCH_CATALOG.csv` and `ASSET_INTAKE.md` in this pack.

### 6. NEW REAL-WORLD DESTINATIONS: add complete worlds, not menu thumbnails

The creator has shown illustrated overview maps of Tokyo, New York 1920s, Seville, Chefchaouen, Rio, Amsterdam present, Amsterdam 2077, Paris, Oaxaca region and Koh Tao, plus older maps for Barcelona, Cadiz, Canary Islands, Spain travel hub and other destinations. These are **location/creative guides, NOT accurate geospatial survey maps and NOT the in-game graphical style**. Build realistic 3D districts in geographically sensible relative positions. Preserve native architectural and cultural specificity. Read `WORLD_ROADMAP.csv` and `WORLD_CREATIVE_BRIEFS.md`.

Rollout order (prioritize originality and complete vertical slices):
- First production wave: **Koh Tao** (Mae Haad harbor, personal hostel spawn, reefs/dive school, scooters, Sairee), **Barcelona** (distinct districts, La Merce), **Seville** (recover quarantine work, rebuild to benchmark before shipping), **Amsterdam today** (canals, bicycles, King's Day), **Tokyo** (trains, Shibuya/Shinjuku/Asakusa, arcade).
- Second wave: **Paris**, **Rio de Janeiro**, **Oaxaca city + separate cloud-mountain/coast regions**, **Chefchaouen**, **Cadiz**, **New York in a historically specified Prohibition year**.
- Third wave / travel-network expansion: **Canary Island hops, northern Spain/Galicia, Ibiza late 1960s, London, Amsterdam 2077**, and further user-approved destinations.
- Keep already planned fantasy/scifi worlds in an ordered backlog: Atlantis, Alien Maze X9, Bioluminescent Jungle, Mayan Canal Kingdom, Neon Nexus, Robot World, Psychedelic Dimension, Volcanic Somatra, Space Jazz, etc. Do not silently relabel planned worlds as released.

Each new world must ship as: authored compact quality-first district with 2+ connected walking loops, 1+ truly enterable business, 1 genuinely functioning activity, distinctive NPC archetypes, destination-specific surfaces/signs/nature, a travel portal, a working map, ambient audio, day/night and one seasonal/festival toggle. Then expand to multiple neighborhoods with varied routes and scale. NEVER satisfy 'all cities' by generating 30 empty generic block grids.

Geography/history fixes before building:
- Oaxaca City, San Jose del Pacifico and the Pacific beaches are far apart. Build as separate linked zones with appropriate transport, not adjacent streets. Hierve el Agua is east of Oaxaca City, not a coast-route stop.
- The well-known Cafe Hafa is in Tangier, not Chefchaouen. Build a separate fictional blue-medina rooftop tea cafe in Chefchaouen.
- Woodstock 69 beach club is at Bloemendaal aan Zee, not an Amsterdam-Noord beach. Amsterdam Noord's creative waterfront is its own area; link a real beach excursion separately if included.
- NY 1920s: choose 1926 for jazz and Prohibition (no Empire State Building yet); the Great Depression starts 1929. Either remove the Empire State silhouette from 1926 or make a clearly distinguished 1931/Depression variant.
- Verify place names and historical dates before display. Festival dates vary by year; implement theme/state, not hardcoded false current dates.

### 7. Other fantasy and alien world quality

- **Atlantis:** swimmable and diveable layered coral city, water visibility, bioluminescent creatures, actual underwater architecture, caves and fauna.
- **Alien Maze X9 / weird flower jungle:** procedural but seeded, navigable labyrinth loops, recognizable landmarks, distinct creatures, paths and solvable exploration.
- **Volcanic Somatra:** lava, stone, geothermal steam, original ecosystems and safe hiking routes, physically correct terrain separation and bridges.
- **Jungle Dub:** enormous connected jungle sound-system area, real DJ/music interactions, footpaths and bridges, thoughtful ecology and not random neon cubes.
- **Moon/space jazz/robot/neon worlds:** more than a backdrop. Each needs businesses, travel, its own material library, interesting character culture and at least one activity.

### 8. Quality gate for EVERY delivery

Apply `QUALITY_GATE.md` to every district/world. Capture desktop and phone screenshots. Confirm real first-person play, correct map/spawn/portal, and manual walk/driving. Run existing test suites sequentially on Windows with the repo's actual runner. If headless tests are CPU/software-rendered, label them *functional only*; use real GPU frame rates for performance claims. Test on the actual HP laptop plugged in at consistent temperature and graphics settings, and at least one mobile target. Aim 30+ sustained FPS on modest laptop settings and usable 24-30+ on phone, with adjustable options; these are target budgets, NOT claims. Measure draw calls, triangles, memory and 1% low FPS, not just average FPS.

Do not game the test suite by deleting assertions or raising timeouts. If regression is already in baseline, report it separately with repro. Prevent older worlds, saves, vehicle controls, fullscreen, cinema, portal pipe and touch controls from breaking. Every new implementation milestone gets automated tests where appropriate, at least three real-user camera screenshots, a short changelog, a commit ID and a PR-ready push.

### 9. Milestone sequence, stop criteria and working independently

Follow these stages, in order, with small reviewable commits:
M0: audit and baseline; correct registry/status; backup branch; reference asset inventory.
M1: fix collisions/geometry placement/saves; rebuild semantic prop logic; crowd and daily routines base.
M2: polish the remaining Astro-9 districts and stop empty/samey streets, with 3D storefronts and performance checks.
M3: finish Vienna architecture, local signage, landmarks, haze and NPC behaviors.
M4: finish Pai and Chiang Mai (specific business distribution) and strengthen Da Nang/Madrid.
M5: land reusable cars, mopeds, scooter/traffic improvements and interaction/economy/smoking/eating/drinking pass.
M6: merch asset pipeline, wearables, branded shops and in-game purchasing; use provided source artwork as soon as available.
M7: new real-world city waves, beginning with the five specified above; 1 district at a time to the quality gate.
M8: fantasy world backlog and existing minor-world polish.
M9: release/QA, accessibility, mobile settings, documentation and PUBLIC preview deployment when the owner chooses hosting.

You may overlap nonconflicting tasks when doing so saves time, but avoid simultaneous heavy GPU tests on this laptop and do not let a documentation step replace visible improvements. Reserve actual user review checkpoints after every BIG completed world, not every small streetlamp edit.

At the end of EACH Claude session or usage limit, FIRST save all changes, update `docs/APEVERSE_EXPANSION_STATUS.md`, push tested code if permitted, and issue a concise factual handoff: current branch, latest commit, what works, what failed, which world/feature needs manual play, exact next action. Continue from the next unfinished milestone when resumed. No reset/rewrite. If unable to push, produce `git format-patch` and a ZIP handoff, with the exact error. Never say 'all upgrades complete' until the quality gate has been met across the scope. Never wait hours just to announce 'still waiting' without doing useful bounded work. Do not drain unlimited usage on repeated test loops when the same test has already passed; profile and fix root causes.

### 10. Required output from your FIRST response in the coding session

1. The exact branch/commit currently loaded and any uncommitted edits.
2. Summary of what is genuinely already implemented vs missing, citing repo paths/tests.
3. Confirmation that current saves and stable preview are protected.
4. Which artwork files are physically on disk and which are missing.
5. The first concrete milestone you are STARTING NOW, with expected touched files and a test plan.

Then DO THE WORK. The creator has already approved the overall plan and wants implementation, not another abstract proposal.
