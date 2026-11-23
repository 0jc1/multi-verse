# APEVERSE — WORLDS REBORN
## One complete Claude Code master instruction for a map-first, living multiverse expansion
**Brief prepared:** 23 November 2026 | **Revision:** v1.1 - Human Realism + Songkran Water Festival  
**Target:** Existing browser-based Apeverse repository `0jc1/multi-verse`, not a new project  
**Owner's creative priorities:** exploration, music, bizarre creatures and NPCs, travel, distinctive cities, remembered places, optional activities, live atmosphere, mobile access, and a free-to-play public experience.

> **START HERE, CLAUDE CODE:** This file is the single authoritative project instruction. The associated `REFERENCE_MAPS/` folder contains seven actual maps supplied by the owner. Read this *entire* brief, check the actual current repository and playable build, and implement incrementally with a persisted work ledger. Do not pretend you can ship 20+ complex worlds in one response or bypass time, credit, or computing limits. Do not just write a plan and stop: after the audit and map blueprints, begin the first real, small, testable implementation milestone and continue as session limits permit.

---

# PART I — NON-NEGOTIABLE PRODUCT VISION

## 1. Core gameplay contract

Apeverse is a single connected multiverse of **separate, individually selectable worlds**. Every playable world is listed in the pipe's world guide with its genuine readiness status, can be explored freely in first person, and can optionally have physical travel connections to related worlds. There are **no mandatory quests, forced missions, paywalls, or required real-money services**. Games and social activities are optional; an explorer can walk, chat, listen to music, enter shops, relax, use vehicles, view original films, or return to the pipe at will.

Preserve the following established foundations and improve them only safely: Ape Town, Chiang Mai, Da Nang, Vienna, Jungle Dub, Astro-9, Verdalux, Stone Ape Band, Ztonedape, existing NPCs, cinema/media system, original user-owned music, day/night and Chiang Mai festivals, character graphics improvements, movement, inventory, persistent saves, responsive desktop/mobile controls, local-server support, and optional public hosting. Do not delete a beloved landmark to add another.

**Style:** The existing user-supplied hand-drawn psychedelic Apeverse art maps are *design blueprints*, not literal in-game textures. The game itself should move toward Da Nang/Chiang Mai's improved visually rich stylized 3D; Gaudí-inspired organic forms, believable local building layouts, atmospheric city streets, sophisticated materials, varied silhouettes, and abundant ambient life—not higher-density primitive cubes. The world's art direction is joyful, strange, colorful, detailed, and legible. **Human characters are a special visual priority:** believable photorealistic-quality faces, skin, hair, eyes, hands, clothing and motion at close range; keep ape and alien species fantastical and distinctive unless separately approved. Use asset LOD and quality tiers to make human realism compatible with the HP Spectre/Iris Xe, phone and free-to-play budget. See new section 34A.

**Scope:** One large *brief*, many verified *build milestones*. Maintain a durable continuation document so the owner does not need to repeat this instruction each time Claude's usage window resets. Never let an endless test consume another night.

## 2. Inspect reality before coding

The public `0jc1/multi-verse` **main** branch was inspected as a planning reference; a snapshot on 23 Nov had commit `60a92404c40cc4170bae64ab7383f7d68b3341e1` (message `da nang 2`). This snapshot **is not proof** that the owner's local working branch, live development server, or browser is at this commit. It contains modules such as `js/world_chiang_mai.js`, `js/world_da_nang.js`, `js/world_vienna.js`, `js/world_astro9.js`, `js/astro9_districts.js`, `js/world_jungle_dub.js`, `js/world_ape_town.js`; systems `js/core.js`, `js/portal.js`, `js/audio.js`, `js/bag.js`, `js/effects.js`, `js/chat.js`, `js/npc.js`, `js/city_life.js`, `js/pool.js`, `js/gfx.js`; and registry `data/worlds.json` / `data/worlds.js`. It uses Three.js r128 according to README. The README, title, development progress, and world status flags may be stale or inconsistent, and the owner's actual basketball experience contradicts earlier automated pass reports. **Verify all of this in the actual current branch.**

Before changes:

1. Print the repository path, `git remote -v`, branch, HEAD, uncommitted changes, registered worlds, script load order, and server URL. Compare with relevant remotes; do not reset, force-push, or overwrite others' commits. Coordinate merges with Justin/`0jc1` by using a separate feature branch and non-destructive conflict resolution.
2. Export and safeguard the owner's current `localStorage`/IndexedDB game saves (the README mentions `apeverse_v09`) and back up media manifests. Make a timestamped, verifiable backup of changed source files; do **not** copy or commit gigabytes of original films needlessly.
3. Confirm which earlier additions exist *and are playable by a human*: basketball, NPC four-choice conversations, DJ mode, bikes/scooters, pool, smoking/drinking viewmodels, festivals (especially full Songkran water gameplay), real human faces, vehicle traffic, any recent world modules. Mark `working`, `partially working`, `reported only`, `broken`, `planned`, or `assets missing`.
4. Identify the actual entry point (`index.html` and scripts), active local HTTP server, caching, duplicate old folders, build identification, and the true path of source assets. Do not tell the owner to open a made-up port.
5. Keep a short `docs/WORLDS_REBORN_STATUS.md` tracking current branch, current commit, last known playable URL, tests, regressions, built modules, and next 3 actions. Commit progress regularly on a dedicated branch; ask before deployment or any destructive action.

**Priority:** The owner reports **basketball does not work in live play** even though a test suite previously passed. Treat that as a confirmed product bug until a real first-person interaction test proves otherwise. Do not mark it completed based solely on DOM/headless assertions.

## 3. The map-first rule

**Before building each new world, design its own illustrated map and an actual machine-readable layout blueprint.** Every city/world receives its own separate high-resolution map—not one multi-world collage. The provided references are inside `REFERENCE_MAPS/`:

| Design map | Reference file | Existing registry ID to reuse if present |
|---|---|---|
| Madrid/Pinar | `Madrid_user_map.png` | `madrid` |
| Pai/Walking Street | `Pai_user_map.png` | `pai` |
| Alien Maze Planet X-9 | `Alien_Maze_X9_user_map.png` | `alien_maze_x9` |
| Atlantis | `Atlantis_user_map.png` | `atlantis` |
| Neon Nexus | `Neon_Nexus_user_map.png` | `neon_nexus` |
| Mayan canal metropolis | `Mayan_Canal_City_user_map.png` | `mayan` |
| Astro-9 current concept | `Astro9_user_map.png` | `astro9` |

For *each* proposed world, produce:
- An **illustrated landscape world map** with the same design language as the owner's Vienna / Pai / Madrid Apeverse artwork: dense hand-drawn black ink outlines, vivid markers/watercolor, playful typography, a cute ape emblem, miniature scenes, compass and practical legend, individually legible POI labels, roads/trails/water, interesting negative space, nighttime/music landmarks; separate maps only. Put maps in `design/maps/<world-id>.png` if an image creation workflow is actually available. If no image-generation facility exists inside Claude Code, generate a clean SVG/HTML layout plan plus an explicit image-generation brief and request the artwork via an available supported tool later; **do not claim a schematic is the requested finished hand-drawn illustration**.
- A compact `design/worlds/<world-id>.json` defining `worldId`, era, theme, bounds, POIs (stable IDs and approximate world-local positions), district polygons or approximate extents, neighborhood adjacency, walk/scooter/bus/boat links, paths, water, safe spawn, interactable interiors, audio zones, NPC communities, performances, activities, festivals, portal locations, landmarks, quality tiers, and travel connections.
- A simple written human walkthrough describing what players encounter during 10 minutes of exploration and how the map would be navigated.
- A playable **small vertical slice** only after the layout and assets are ready; do not fill the entire world with uninteractive placeholder geometry.

**Illustration != geographic survey:** Real-world maps should retain recognizable relative neighborhoods and landmark groupings, but use creative scale compression openly; never present a fantasy route as precise real-world navigation. The user owns these reference images; use them locally as design context, not as unexplained copyrighted stock assets. Keep reference images out of the runtime bundle unless explicitly needed for an in-game map.

## 4. World selection and connections

- Every world has an independent entry in the **Pipe Guide** with ID, status, visual preview, description, and default arrival point. Never hide Pai as a mere district of Chiang Mai.
- Optional *real-feeling connections*: Chiang Mai -> Pai through a minivan or condensed scenic scooter trip, Pai -> Jungle Dub/Jungle Rave via an optional jungle trail or ride; Hanoi -> Cat Ba via ferry/bus experience; island-region boat links where plausible; all still individually reachable from the Pipe Guide.
- Driving a scooter to Pai must feel like traveling through winding mountain scenery, with stops, viewpoints and safe transition points, without rendering all real-world kilometers in one chunk. The region is made of connected loadable scenes, not an enormous simultaneous scene.
- Historical and fictional time periods are clearly marked in the guide. Portals can cross centuries; ordinary local vehicles do not accidentally cross historical eras.
- Portals must have reliable safe landings, return options, persistent player orientation/state, consistent interact keys, and an emergency unstuck control.

---

# PART II — EXISTING WORLDS TO UPGRADE FIRST

## 5. ASTRO-9: rebuild as the signature alien metropolis

**Top world-building priority.** The owner loves recent high-quality Da Nang and Chiang Mai graphics. Use their stronger architecture/interiors/materials/streets as the **quality benchmark**, while building a completely different, much larger **Gaudí-inspired extraterrestrial eco-cyberpunk city**. This is not a simple circular station with attractions clustered in one plaza.

Core districts (all connected but spaced far enough for real exploration):
1. **Central Spiral Plaza** — large public interchange, living luminous mosaic, giant organic arch, transit, unusual species, market street performers, arrival/return portal. Active daytime and nightlife crowds.
2. **Intergalactic Bazaar / Hanging Market** — at least several visually distinct levels and streets with actual enterable shops, food, music stores, plant stalls, artifacts, repair shops, musicians and varied animated market NPCs. Shops have working buy/sell interactions and distinctive inventories.
3. **Club Graviton / Orbit Lounge district** — true **zero-gravity** dance-floor volume (floating player, performers, drinks and loose props, smooth restoration outside the zone); visible DJ sets, audible spatial music and dance routines. Orbit Lounge is a quieter space-jazz venue with music different from club music.
4. **Docking Bay / Hangar & Transit Rings** — landed spacecraft, ship-repair stalls, travel desks, functioning enterable passenger shuttle or hover vehicle. Do not make flying traffic all decorative.
5. **Living Gardens and Residential Spires** — botanical parks, spiral apartment towers, glass/plant facades, rooftop gardens, little courtyards, alien pets/creatures, home rental for the player, upper-level pedestrian bridges.
6. **Cinema 9 / Art Quarter** — real video screens play assigned user-supplied films when assets are available, gallery of living artworks, cinema sound isolation/music ducking, rehearsal rooms, public performances.
7. **Tech Market / Glassopy Observatory** — technologies, workshop, upgrades and robots, celestial observation dome with a sky view, nighttime attractions.
8. **Outer Canals, Lower City & Quiet Districts** — explore areas between landmarks: canals, parks, back alleys, cafés, views, alien public transit, wildlife and surprising optional encounters.

Architecture: bulbous organic facades, sinuous columns, asymmetrical Gaudí curves, mosaics, coral-like architecture, elevated suspension routes, bioluminescent flora, eco-architecture fused with futuristic machines. Use modular GLB assets, instancing, texture atlases, LOD and good materials rather than massive overlapping primitive meshes. Populate diverse aliens with silhouettes, gestures and personalities, not recolored clones.

At least one dense district must be manually verified walkable and responsive on the target Iris Xe before scaling the city. Support ground travel, interior entrances, elevated bridges, transit, ambient engine and market sounds, district maps, and all world-wide gameplay systems. Preserve existing Astro-9 music/casino fictional points, and do not replace a real functioning feature with an empty facade. The huge city should feel inhabited and connected, while distant districts are chunk-loaded.

**Acceptance scene:** Start at the plaza, walk several streets through active vendors, enter two real shops and buy something, hear crowd languages and a hover vehicle, take transport to the club, float in true zero-g and return normally, visit a cinema, and explore a quiet garden. Frames must remain playable on Low. Each district has a clear identity.

## 6. Chiang Mai: correct real-world relationships and urban atmosphere

Keep the real-feeling Thai city, gates, moat, night markets, river, festival modes, Giant Hostel and existing NPCs.

**Relative layout corrections are mandatory:** Giant Hostel faces **Blues Bar** and **Panahan** on the opposite side/frontage as directed by the owner; keep those immediately opposite. Place **Pineapple Express** noticeably farther to the north of town, not another business crowded against Giant. **Chada's / Chatas Vegetarian** should be nearby in the broader area but visually separated from the door, and **Khun Kae's / Koon Kai's Juice Bar** should be its own distinct street-facing business with proper exterior and accessible interior. Verify spellings against the owner's existing assets/notes rather than silently renaming named locations. Do not claim exact surveyed geometry when the references only give relative relationships.

Upgrade architectural realism: Thai shophouse exteriors, roofing, windows, signage, sidewalks, doors, realistic floor plans, product counters, small tables, kitchens/bars where appropriate, walkable interiors and working interactions. Realistic in this context means believable proportions/materials, not photorealistic rendering. Introduce clear spaces between businesses, longer streets, alive but readable neighborhoods.

Street traffic: **fewer cars, more motorcycles/mopeds and tuk-tuks**; follow Thai left-hand traffic, varied light scooters and parked bikes, realistic audio panning, manageable pedestrian density, horn occasional not constant. Rideable tuk-tuks, bicycles and mopeds must work, not only vehicles that move as background props. Include recognizable **7-Eleven** convenience stores in Chiang Mai and other Thailand worlds, with simple usable doors/counters/items (avoid distributing protected brand art packs). Add Buddhist temples in town and attractive outlying forest temples reachable by scooter/hike, with quiet respectful ambience and interactions—not every temple as a novelty party.

Preserve the **Yi Peng / Loy Krathong** festival mode which the owner personally enjoyed, plus Songkran and ordinary Chiang Mai. **Songkran specifically requires major crowd, splash visual and click/hold item-use improvements as defined in section 35A**. Preserve characters Mutt, Cough, Nuni, Steve, Dino, Ztonedape, the hostel pool table and music across from the hostel. They must have life schedules and talks. Do not introduce new broken festival transitions.

## 7. Ape Town: a real social plaza

Transform Circular Plaza into a thriving gathering space, not an empty paved showcase. Add distinct groups meeting, chatting, sitting, eating; a mime, a busker playing guitar, an occasional percussionist, street artists, casual children/families or mixed-species visitors, market movement, musicians warming up, people entering and leaving. Each group has a reason to be there. Important story NPCs keep distinctive positions/schedules. Variety in clothing, scale, creature types and animations is more important than sheer crowd count.

Use near-field animated agents + distant instanced crowd, ambient conversation layers and instruments, time-of-day routines, social invitations, accessible cafés and benches, casual activities, and a lively Stone Ape Band stage. Keep movement paths unclogged and portals visible; avoid 200 heavy fully simulated actors in one view.

## 8. Jungle Dub, Vienna, Da Nang and other existing worlds

Preserve working world-specific improvements. Jungle Dub's waterfalls, treehouse villages, river, stage, original dub music, small markets, wildlife and music should expand organically; tie a visible optional forest entrance to Pai without removing its separate Pipe entry. Vienna keeps its 2000s-memory identity and existing historical city references. Da Nang retains Justin's improved visuals and functional surroundings. Preserve Verdalux and all current portal IDs and media placement links. Use their successes as a reusable *building and population kit*, not as excuses to make every world visually identical.

---

# PART III — NEW WORLDS: MAKE AN INDIVIDUAL MAP BEFORE CODE

Every world below needs: unique artwork, distinctive era, a playable traversal loop, at least two enterable/social locations, named local NPCs with living schedules, local environmental sound, useful transport where appropriate, an optional activity, clear pipe status and safe return. Do not ship static landscapes with attractive labels only.

## 9. MADRID — the living city and Pinar memory world (`madrid`)

**Era:** Familiar contemporary Madrid, with optional day/night and seasonal changes. Use `REFERENCE_MAPS/Madrid_user_map.png` as the main visual reference. Respect broad geography rather than literal distances. Neighborhoods: **Pinar de Chamartín** and Chamartín, Cuatro Torres, Tetuán, Malasaña, Chueca, Gran Vía, Sol, Retiro, Atocha, La Latina, Lavapiés, Embajadores, Casa de Campo, Madrid Río, Parque de Berlín and north-south transit links. Include Madrid's characteristic tiled/stone facades, Spanish plazas, terraces, balconies, metro signage, tree-lined streets, markets, pedestrian avenues and nighttime music. Pinar de Chamartín includes a fictionalized private home/memory hub with family atmosphere and two dachshunds **Boris and Lila**, but do not reveal a real residential address or attempt to model a private building's exact layout without owner's explicit references. Add a metro ride and realistic transit transitions; bicycles and buses for the surface. Public music, cafes, street performers, hip-hop, galleries and film screenings; include a mixed-use music/art studio for Ztonedape and authentic quiet residential corners. Community, culture and working interiors are more important than an empty megacity. Acceptable first slice: Pinar/Cuatro Torres transit hub + Sol/Gran Vía + one nightlife block + a metro link. Expand district by district.

## 10. PAI — walking street, riverside life and jungle music (`pai`)

**Era:** Present-day Pai as remembered by the owner. Illustrated visual source `REFERENCE_MAPS/Pai_user_map.png`; make the built map feel like actual **Pai Walking Street**, a long, comparatively narrow, walkable Thai lane with wooden/concrete low-rise shophouses, evening lights, small craft sellers, food stalls, live music, mixed local and international visitors, and a human-scale bridge to quieter neighborhoods—not a gigantic fantasy festival arena.

**Must-visit venues (names from owner's experience; verify spelling and existence before claiming exact geography):**
- **Sunset Bar** — outdoor/chill gathering venue with techno/DJ party mode at night. Daytime may be quieter; do not depict permanent round-the-clock rave.
- **Paradise Circus / Paradise Bar** — psychedelic, laid-back, with staged **fire shows** and performers; animated fire safety zone/visual effects and spectator routines. Owner remembers it under both Paradise Bar and Paradise Circus; use the venue's displayed signage if verified.
- **Rainny Café / Rainy Café** — small plant-friendly café with smoothie bowls/vegan choices; active counter and tables.
- **Ganita Café? / Katina's?** — owner's memory of a vegetarian/vegan restaurant. Do not silently pick a definitive brand; choose the verified name where available or use an explicitly labeled fictional placeholder until resolved.
- **Tea & Drum Circle** — intimate tea house with many types of tea, psychedelic art and hand drums; the real-life name is *unconfirmed*. NPCs play live and invite the player to join. Include discussion of weed tea only as fictional world background, without simulating real drug production instructions.
- **Pai River Jam Hostel & Campground** — user remembers little riverside cabins/bungalows, quiet lodging, river views, a bar and live jam sessions. Small hand-painted pirate-themed sign whose recalled joke is approximately “Drink before noon? You're a pirate!”; do not assert this is a verified verbatim real-world quote.
- **Pai River**, Pai Walking Street, bus station, scooter rentals, bridge, scenic bungalows, **Pai Canyon**, waterfall routes, hot springs, bamboo bridge/rice fields, White Buddha / Mae Yen and mountain viewpoints. Add recognizable Buddhist temple environments, with respectful local NPC activity.

**Connections:** Three distinct Pipe entries remain `chiang_mai`, `pai`, `jungle_dub`. Playable Pai has a **bus/minivan arrival** with scenic journey from Chiang Mai, optional condensed scooter route with short stops/viewpoints, and a trail/rural ride to a clearly discoverable **Jungle Dub / Jungle Rave** transition. Also allow instant Pipe travel. Preserve the player scooter/state appropriately across scene transitions or return it to a legitimate rental location; no lost vehicles.

**Sound:** evening markets, scooters, stream, crickets, frogs, live guitar, techno where appropriate, fire-show reactions, warm social conversations. **Acceptance:** start at a riverside bungalow, walk to a convincing night Walking Street, buy a vegan meal, join the tea drums, visit both bars at their scheduled times, ride toward a viewpoint, then discover the Jungle Rave path.

## 11. IBIZA — 1969 flower-power memory island (`ibiza`)

**Change from earlier Ibiza maps: this is now specifically **late-1960s / circa 1969**, *not modern Ibiza*.** Blend authentic rustic Mediterranean island design with energetic late-60s hippie/flower-power counterculture: whitewashed fincas, dry-stone terraces, pine forests, sandy tracks, vintage scooters, colorful handmade clothes, hand-painted art, acoustic jam circles, psychedelic original music, low-key beach gatherings, family-run village cafés, sunset bonfires and a few creative music venues. Avoid giant contemporary LED superclubs, luxury nightclub brands, modern glass megahotels and current-day market layouts. Use a fictional period-appropriate craft gathering near Sant Carles, rather than falsely depicting the present Las Dalias hippie *market* in 1969 (the Las Dalias venue existed earlier, but its market opened in 1985). Any deliberate anachronism must be a clearly named Apeverse memory pocket.

**Map/regions:** Ibiza Town and historic Dalt Vila, Sant Antoni sunset side, **Cala Comte**, **Cala Tarida**, **El Palmarar** neighborhood, **Es Vedrà**, **Benirràs** drumming cove, Sant Carles/Santa Eulària and northern quiet pine hills, southeast salt-flat coast (Ses Salines), secluded underwater coves, viewpoints, village terraces and winding roads. **Special personal memory POI:** owner's grandmother's cliffside **house in Cala Tarida / El Palmarar**, with a modest pool, garden, two or three palm trees grouped on the LEFT from the remembered main viewpoint, stone wall, white finca architecture and views across the sea. This is a remembered place, not claimed historically precise 1969 architecture. Provide an optional year-independent “memory house” portal, where needed, to keep both flower-power era and personal memory honest.

**Activities:** ride a period-looking scooter on a genuinely connected scenic road network (not just teleport), swim, snorkel and see fish/reefs, hike pine forests and cliffs, attend acoustic/drum jam circles, browse craft stalls, small clubs/live music, camp, eat, drink, chat, dance, explore caves, enjoy sunset. Include user-owned original music in a period-inspired arrangement if supplied, not commercial copyrighted tracks. Optional day/night/sunset modes. **Acceptance:** hire a scooter, drive through at least two village districts to Cala Tarida, enter the pool/garden memory house, descend toward the sea, snorkel, then ride to a sunset drum party and return safely.

## 12. KOH TAO — personal 2022 memory island and scuba hub (`koh_tao`)

**Era:** Present-day memory of 2022. Build a standalone tropical island map broadly following Koh Tao geography: Mae Haad pier, Sairee sunset beach/nightlife, Ao Leuk and Tanote Bay dive coves, Shark Bay, Mango Bay, viewpoints, rainforest ridge, local food and scooter roads. Add reefs, turtles, rays, marine life and underwater passages. The harbor area is the owner's primary emotional anchor.

**DEFAULT HOME BASE / SPAWN:** Near **Mae Haad port**, recreate the user's **unnamed 2022 Thai-run hostel** from memory—not identify it as a real current hostel. It had black-painted walls, hand-painted psychedelic murals, a ground-floor cannabis shop integrated with the hostel, quiet almost-empty dorm upstairs, a balcony off the dorm with huge potted plants, a view out to the water, a small local Thai crew, and a dive school nearby. Avoid publishing a false exact business name; a fictional sign like “Harbor Mural Hostel” can be used with explicit user approval. The quiet dorm has sleep/storage; balcony views and ambient boat sounds. A nearby convenience store and local food stalls serve as functional businesses.

**Named NPCs:** **Chloe**, a friendly, laid-back, skilled young French scuba instructor, is a recurring character who provides optional dive lessons and boat trips. A distinct unnamed **long-haired Thai kratom brewer/hostel regular**, with distinctive worn teeth and kind personality, prepares tea in the social corner; he has interesting conversations and interacts with the hostel crew. Avoid inventing real names, impersonating a specific actual individual, or teaching real-world substance preparation; keep these as respectful fictionalized memory-based characters.

**Diving:** introduce reusable scuba simulation used later in Atlantis and Ibiza. Gear selection, entry into water, swimming/dive controls, depth/air *game* HUD, buoyancy, coral/wildlife, boat tour, underwater sound/muffling, optional instructor following, and a reliable surface/exit. Fictional gameplay is not real diving instruction. Dry-land scuba school and harbor boat boarding must actually work; don't fake the dive as a text cutscene. A first slice can be shallow reef + one short boat route.

## 13. ALIEN MAZE X-9 — enormous impossible maze planet (`alien_maze_x9`)

**Reference:** `REFERENCE_MAPS/Alien_Maze_X9_user_map.png`. Preserve the illustrated crazy interwoven paths and verticality. Start at Ape Base, discover mushroom caverns, Crystal Gardens, Alien Lagoon, Floating Temple, Astro-9 satellite market, Gravity Club, Bong Tower, Weed Valley, Botanical Lab, UFO docks, hidden chambers, waterfall bridges and an exit portal. Large organic labyrinth with landmarks, alternate routes, secret shortcuts, biomes and creature factions; don't make a linear puzzle that locks player out of wandering. The maze should be walkable and navigable by the minimap; vertical bridges and elevated paths get floor-layer rendering. Avoid copy/pasting the exact same winding path module for every district. Trigger strange gravity/visual surprises only with accessible options and clear reset.

## 14. ATLANTIS — surface archipelago and underwater city (`atlantis`)

**Reference:** `REFERENCE_MAPS/Atlantis_user_map.png`. Continue the illustrated vision: crystalline underwater palace, coral gardens, Central Plaza, Reef Village, Market of the Depths, Bubble Bazaar, Siren Lounge, Whale Sanctuary, Glass Marine Lab, Kelp Forest, ruins, submersible docks and abyssal portal. **Do not make Atlantis only underwater:** add tropical surface beaches, small islands, boats and transitions to dive beneath. Mix enterable dry domes with fully explorable swimming areas; provide surface air and efficient water rendering, distinct soundscape, strong signage. Use Koh Tao's shared diving framework; special alien/fantasy oxygen gear can make longer exploration accessible.

## 15. NEON NEXUS — Virtual Vegas without real-money gambling (`neon_nexus`)

**Reference:** `REFERENCE_MAPS/Neon_Nexus_user_map.png`. Separate from Astro-9's organic space-market city: **this world is a 24-hour futuristic nightlife and entertainment metropolis** with neon illuminated casinos, public plazas, holo arcades, bars, robotic shows, holographic arenas, rooftop lounge, Holo Sports Arena, Synthwave Strip, Roulette Rift, Mirage Market, Lucky Ape, Lotus Fortune and Portal Hub. Buildings should be distinctive and interiors real. Gambling-style mini-games use **fictional non-purchasable/non-redeemable in-game points**, never crypto, cash stakes, payouts or gambling services; do not replicate actual payment/gambling products. Avoid the reference image's crypto/stakes language in live gameplay. Add interactions like DJ sets, fake-credit arcade games and virtual sports, accessible nightlife and a little quiet residential/hotel strip. Sound: synth, chatter, arcade, engines, music, fun sound effects.

## 16. MAYAN CANAL CITY — fictional Classical Maya-inspired metropolis (`mayan`)

**Reference:** `REFERENCE_MAPS/Mayan_Canal_City_user_map.png`. A vivid imaginary canal metropolis inspired by Classical Maya architecture, lowland jungles and causeways: stepped pyramids, plazas, raised stone walkways, carved facades, water gardens, boat canals, bridges, marketplaces, ballgame court, temple courtyards, craft and farming communities, forests, animals and mysterious ruins. Be clear this is a *fictional composite inspired by* Mesoamerican history; not a precise archaeologically reconstructed city. Avoid mixing Khmer (Angkor), Egyptian and Maya architectural styles as if they were the same civilization. Research respectful motifs and customs rather than generic “tribal” stereotypes or invented sacred acts presented as real. Playable boat and market, curious NPCs and optional exploration.

## 17. HANOI — street music, old quarter and water puppets (`hanoi`)

**Era:** Contemporary Hanoi. Build dense street-front architecture, alley cafés, balconies, narrow streets packed with mopeds, Hoàn Kiếm Lake, Old Quarter, Đông Xuân Market, Long Biên Bridge, Trấn Quốc Pagoda/West Lake, Văn Miếu Temple of Literature, craft/music lanes, courtyards and little parks. **Water puppet performance is a signature actual playable/viewable spectacle**: lakeside/theater venue inspired by traditional Vietnamese water puppetry with staged puppet actions, drums and narration, authentic atmosphere (do not copy any proprietary show recording). Buy a ticket with fictional in-game currency and sit to watch; optional backstage exhibit. Include phở/vegetarian alternatives, egg coffee, street-food vendors, Bia Hơi-style social places, quiet lakeside walks, scooter/taxi transport. City day/night rhythm with spatial sound; no endless honking. Optional route to Cat Ba via tour pickup and ferry.

## 18. CAT BA ISLAND / LAN HA BAY — karst marine adventure (`cat_ba`)

**Era:** Contemporary island. Cat Ba Town and waterfront, fishing communities, Viet Hai village, Cat Ba National Park hills/forest trails, karst cliffs, **Lan Ha Bay** limestone sea stacks, hidden lagoons, kayak/swim areas, small floating villages, boat-taxi trips, caves and peaceful lookouts. Ha Long Bay and Cat Ba form a UNESCO World Heritage area, but keep their geography legible: Cat Ba is an island adjacent to Lan Ha and nearby Ha Long Bay, not a single invented generic bay. Add boating, kayaks, snorkeling, hiking, animal/birdlife and a tour connection to Hanoi. Friendly guide characters, busy harbor and silent dawn bay modes. Respect marine life.

## 19. KOH SAMUI — Jurassic Era fantasy island (`koh_samui_jurassic`)

**Era:** A **deliberately fantastical Jurassic-time portal** overlaying the recognizable Koh Samui island silhouette with primordial jungles, volcanic outcrops, huge ferns, lagoons and strange prehistoric wildlife. Dinosaurs inspired by Jurassic-era sauropods, stegosaurs and early theropods; do not accidentally label Tyrannosaurus rex or Velociraptor as Jurassic (they are Cretaceous). The present-day Thai resort buildings and human population should not inexplicably coexist in the era unless clearly depicted as visiting time travelers arriving through Apeverse's portal. Adventure mechanics: observe giant creatures, glide/ride only with non-disruptive fantasy mounts, explore canyons, caves, waterfalls and nesting zones, watch meteor-like auroras. Safe optional chase sequences with no required combat; memorable sound design. Separate from existing `prehistoric` registry entry unless there is a conscious migration/alias plan.

## 20. AMSTERDAM 2077 — eco-cyberpunk canal city (`amsterdam_2077`)

**Era:** Explicit fictional future Amsterdam in **2077**. A respectful futuristic reinterpretation of the historical city: concentric canals, brick houses with organic green modifications, canalside café culture, trams, bicycles, autonomous water shuttles, solar canopies, tall innovative buildings along new areas, Dam Square, Centraal, Jordaan, De Pijp, Vondelpark, Museumplein and Noord. Transport hierarchy prioritizes bikes, walking and watercraft over cars. Friendly multilingual human/robot NPCs, live music, markets, street artists, futuristic art/film spaces; wetlands/green roofs and changing weather.

**Festival mode MUST exist:** **King's Day (Koningsdag), 27 April**, a citywide orange celebration with boat parties, street DJs, flea markets, social groups and temporary stalls; also a normal Amsterdam mode. The 2077 celebration is fictional, inspired by current Dutch holiday traditions. Load festival crowds/props only in the mode to protect performance. Distinctive future sights but keep Amsterdam unmistakable. A playable bicycle and canal boat are required. No unlicensed popular music.

## 21. VENICE — Grand New Year's Eve / optional Carnival (`venice_festival`)

**Era:** Stylized Venice with a magical **New Year's Eve** festival mode plus a separate optional **Carnival** mode (do not conflate the dates). Plazas, narrow canals, stepping bridges, traditional façades, artisan glass-making, gondolas/vaporetti-like boats, Piazza San Marco, Rialto Bridge, Grand Canal, Dorsoduro and optional island trips to Murano/Burano via quick ferry. The New Year's mode: festive evening markets, live street music, masked *visitors if appropriate*, illuminated bridges and midnight fireworks reflected in canals. Carnival mode: Venetian mask parade and period dress as a separate setting. Actual small boats, walkable bridges, rain/fog/reflective night water, cozy cafés, obscure alleys, puppet and music shows. Boat handling cannot trap the player on water. Preserve a quiet peaceful day mode and a bustling event mode.

## 22. STONEHENGE: THREE TIME WINDOWS — Stone Age, early communities, later druidic fantasy (`stonehenge_eras`)

The owner wants prehistoric people, hunter-gatherers and mysterious druid rituals at Stonehenge. **Do not mistakenly describe Stonehenge as a temple built by the Druids or place historical Druids in its Neolithic construction period.** Design an educationally informed but imaginative time-switchable landscape:

1. **Neolithic Stonehenge, c. 2500 BCE:** monument construction/ceremony and nearby farmers/pastoralists, megalith hauling, wood houses, handmade tools, river walk and sunrise/solstice observance, based on plausible research; avoid confidently invented religious claims.
2. **Early prehistoric hunter-gatherer memory scene:** an earlier nearby woodland camp and foraging/fishing communities, explicitly a *different earlier time* with distinct lifestyle; no historical Stonehenge circle there yet.
3. **Later Iron Age / Celtic-inspired druidic folklore world:** separately labeled speculative/fantasy mode with groves, storytelling, musicians and rituals; not a factual re-creation of the Stonehenge builders.

Use a time-gate near the circle, distinct seasons/sunset/solstice modes, rich wild fauna, tents/roundhouses appropriate to each era, participatory crafts and collective music. Keep cultural depictions respectful and the difference between known history and invention clear in labels/dialogue.

## 23. NEW YORK 1926 — a Prohibition-era open-world crime-jazz city (`new_york_1926`)

**Era:** 1926 during U.S. Prohibition; an adventurous **GTA-like** compact district-based game with free-roam exploration, not mandatory criminal quests. Districts: Harlem jazz neighborhood, Midtown/Broadway lit theaters, Lower East Side immigrant streets, Greenwich Village arts, Wall Street/financial district, piers/docks and a bridge/ferry to Brooklyn. Fire escapes, elevated rail/subway, vintage yellow taxis, period automobiles, street food, diners, dance halls, markets and crowded sidewalks. Jazz, swing and period-evocative original music at clubs; a secret **speakeasy** behind a bookshop or barber entrance; nightlife and an alternate more peaceful city daytime. Fictional prohibition-era bootlegger characters and optional cartoonish getaway/car-chase missions, gang rivals and police patrols, but no forced violence, no real illegal-commerce tutorial, and no inaccurate modern skyscraper/retail branding. Working 1920s car or taxi rides, rich ambient dialogue, city newspapers, dance mini-game, period clothing, and neighborhoods large enough to explore naturally.

## 24. ANGKOR — ruined temple city and historical portal layer (`angkor`)

**Location:** Angkor region, Cambodia. Primary scene: atmospheric lush ruins, jungle paths, tree roots over temple stones, reflective moats, reservoir pathways, monkeys/birds, historic causeways, Angkor Wat, Bayon and Ta Prohm-inspired architecture. Add tranquil exploration, local-guided cultural interpretation, boat or bicycle rides, temple courtyards and respectful environmental sound. Optional historical **12th-/13th-century Khmer city memory layer** through a clearly labeled time portal (avoid presenting one exact century as the phase for all structures). The Khmer Empire is **not Mayan**: build distinct architectural vocabulary, clothing, water systems and languages. Do not trivialize living religious sites. Fine performance via instanced vegetation and reused stone components.

## 25. EGYPT THROUGH AGES — Nile worlds connected across time (`egypt_ages`)

The user wants the Nile, Alexandria, ancient pyramids, temples and an Egyptian golden age. These do **not** all belong to the same historical century. Create a **Nile Time-River** map (one Pipe Guide destination with optional era sub-destinations), with three coherent time slices linked by riverboat or time gates:

- **Old Kingdom, c. 2600 BCE:** Giza pyramids, workers' villages, temples, desert routes, river traffic, workshops, wildlife and construction systems. No Ptolemaic city of Alexandria.
- **New Kingdom, c. 1300 BCE:** Thebes/Luxor, monumental temples, royal river processions, artisans, crowded Nile-side town, fields, boats and craft markets. Artistic grandeur with historical respect.
- **Ptolemaic Alexandria, c. 200 BCE:** coastal harbor, lighthouse-inspired spectacle (historical reconstruction/fictionalized), library/science quarter, Greek-Egyptian mix of markets and ships. Label this a different age from pyramid building.

Shared mechanics: sail/ferry a Nile boat, explore oases and river markets, interact with artisans, animals, and knowledgeable NPCs, listen to music appropriate to world mood, visit temples and museums (avoid portraying sacred practices as comic gimmicks), and discover optional myths explicitly labeled fantasy. No full-length render of hundreds of real kilometers at once; keep regions as loadable chapters.

## 26. BANGKOK — optional after top priorities (`bangkok`)

**Decision status:** **Optional / lower priority**, requested as a possibility rather than a definite next-build commitment. If included, contemporary Bangkok should feel different from Chiang Mai: busy Chao Phraya river ferries, Wat Arun and surrounding temple districts, Grand Palace area, Chinatown / Yaowarat food streets, Khao San backpacker district, parks and canals, BTS/MRT urban transit, markets, rooftop views and busy roads with more vehicle density appropriate to the metropolis. Maintain temples' respectful atmosphere, working ferries, 7-Eleven stores, tuk-tuks and motorcycles, food/café interactions, nightlife and light traffic. Condense into readable neighborhoods rather than a single impossibly broad unoptimized city.

## 27. TWO BRAND-NEW ORIGINAL WORLDS — designed specifically for Apeverse

### A. RESONARA — the living music planet (`resonara`)
A new planet where *music changes architecture and terrain*. Massive flower-like resonator trees and giant wind chimes, stairways made of luminous sound waves, canyon amphitheaters, a drum forest, a beat-reactive floating village and a quiet echo lake. Three competing musical civilizations (percussion, melody, bass) gather around a central sonic city but the player chooses their own path. Touch objects to hear/create original notes, collaborate in non-competitive rhythm games, walk on sound-activated bridges, and attend festivals. Transitions must work even when sound is muted (visual/audio cues), no copyrighted compositions, and no need to produce music for entry. Strong unique contrast from Jungle Dub and Astro-9: clean musical ecology and interactive acoustics.

### B. NOMAD-7 — the walking clockwork city (`nomad_7`)
A roaming **mobile metropolis on the back of an enormous gentle mechanical creature** traversing an alien desert/stone sea. Districts are connected by moving scaffolds, bridges and lifts: brass market, rooftop tea gardens, engine-cathedral, creature observatory, workshop quarter, caravan decks and a twilight bazaar. During travel, the landscape below changes (storms, ruins, moving caravans, glittering mineral fields). Players can ride an elevator down into passing ruins, then catch up with the walking city on scheduled shuttle paths. Faction/routine NPCs include mechanics, performers, traders and wandering aliens, plus pet-like maintenance bots. This world is visually and mechanically distinct from Neon Nexus and existing robot worlds. Strong traversal must have safe return and never strand players when the city moves.

---

# PART IV — GAME-WIDE FIXES AND MAJOR SYSTEMS

## 28. Circular GTA-style minimap (TOP RIGHT)

Add an unobtrusive yet readable **circular minimap in the upper-right corner** on desktop, with a compact phone layout that does not overlap touch buttons. It shows the player as a directional arrow, nearby roads/paths/buildings/water/terrain, discovered POIs, important places, active transport route, friends/activities nearby, and a north indicator. Provide options to rotate with the player or keep north-up, show/hide/filter icons, zoom levels and a hotkey to open a **full illustrated world atlas**. Map data must come from world layout/road graph and actual coordinates, not a static decorative jpeg. Render efficiently with cached tiles or low-resolution canvas/SVG; show actual relative position and dynamically update smoothly. If the world has vertical floors (Astro-9, Maze), support floor/layer indicators. Avoid revealing every secret before discovery. Use consistent coordinate conversions between engine world units, atlas/map, and portal arrival spots. On mobile provide a small movable minimap/toggle so it doesn't interfere with joystick or the Pause/Bag/Pipe UI.

**Acceptance:** while walking across an intersection, the minimap player arrow tracks the direction and nearby road correctly; bike/scooter movement updates at speed; major POIs and another floor are correctly represented; pressing the full-map key opens a useful guide.

## 29. First-person hands and inventory: pipe only when requested

**Bug/design change:** The portal pipe must **not** always be present in the player's hand. Press **P** to pull out the pipe and open/select the portal interface, then stow it on closing / after use. At all other times the first-person viewmodel should show empty hands or whichever item the player deliberately equips from the backpack. Provide one consistent left/right hand pose system and avoid clipping multiple items through each other. On phone use the existing Pipe button equivalently.

Equip from inventory: spliff/joint, pipe, drink/beer/water, food, musical instrument, camera, pet item, etc. Only equip the actual owned item; picking up and dropping changes inventory. Animated use: joint to lips, multiple puffs, smoke exhale; drink raising bottle/can with gulp, food consumption, throwing or storing compatible items. Optional smoke visual effect slightly enhances color, saturation, light shimmer and relaxed camera rather than intense uncontrolled shaking. Drinking enough fictional beers can cause temporary mild sway, imperfect steering and disorientation, but provide reduced-motion control, a short fade-out, adjustable intensity/duration, and **immediate reset**. No irreversible movement bug, no always-on impairment, no blinding flashes. Keep this an adult fictional game interaction, not an instruction for substance use or an endorsement of real risky activity. Never require effects to access portals or scenes.

Persist selected item, inventory count, consumables, appropriate temporary state with save versioning; ensure normal controls return when effect ends. Preserve already built bag/effects code, refactor rather than duplicate.

## 30. Basketball: fix live play before expanding sports

Owner reports **basketball is not actually working**. Before any other sports: inspect current `activities` implementation if present, court trigger areas, player transform/camera and input capture, pick-up/equip state, aim target, ball arc/rim collider, valid scoring rules, camera direction, context hints and physics. A test report that says 41/41 desktop or 8/8 phone **does not outweigh the owner's live failure**. Reproduce in a real running browser with human-like inputs and visible evidence/screenshots. If existing test only injects private functions, add true end-to-end play tests. Identify where court is located and clear controls on first encounter. Real ball pickup, throw gesture, trajectory, hit/miss and sound feedback, normal 2/3-point scoring, reset/recovery, NPCs or practice mode, desktop/mobile UI. Do not lock camera or WASD after exiting. Once working in Chiang Mai, test an Astro-9 or Ape Town court. Include optional zero-gravity variation only after standard game works.

## 31. Real two-deck DJ mixer: upgrade the existing DJ experience

Create a **genuinely usable basic mixing software**, accessible at real DJ booths across worlds, not a cosmetic two-turntable panel. Use owner-supplied original audio only (plus properly licensed assets). Support:

- Two independently playable decks A/B with waveform overview, play/pause, seek, loading tracks from library, per-deck gain, deck state, track name and time, crossfader, master meters and smooth fades.
- BPM display and editable per-track BPM / first beat grid; **tempo/pitch fader**, jog/seek to align beats, **Sync** that matches target BPM and (where implemented) adjusts phase/beat position. Browser playbackRate changes pitch unless a true quality-controlled time-stretcher exists; document limitations honestly rather than calling it Rekordbox-quality pitch-lock. Manual BPM/tap tempo is a valid fallback when automatic beat analysis is unreliable.
- **Three-band EQ (high, mid, low)** for both decks using Web Audio filters. Musically useful low/high filter knobs, crossfader curve selection, and per-deck channel level control.
- **Hot cues** (at least 3–4 persistent points per track), trigger/clear; **beat-aligned loops** (1/2/4/8 or 16 beats where reliable), loop in/out and exit; reliable quantization only if beat grid known.
- Two or three tasteful effects (echo/delay, reverb if practical, filter sweep) with wet/dry controls. Avoid clipping, runaway feedback, loud jumps or echo tails continuing after exit.
- Headphone prelisten/CUE mode where browser output hardware permits; if independent headphone routing isn't available, provide an in-browser preview/mute workflow and state the limitation.
- Touch/keyboard-friendly panel usable at laptop and phone, sliders/knobs with clear labels and reset. Music playback must be unlocked by user gesture. Keep original world music paused/ducked during mixing, restore correctly after leaving. No global new soundtrack starting on top of decks.
- **Shared mixer module**, so DJ mode works at Jungle Dub, Club Graviton, Ape Town, Pai Sunset Bar, Amsterdam King's Day, Ibiza jam parties, Neon Nexus etc.; per-venue music identity and the user's own playlists.

Test a full minute-long DJ mix manually: load two different original tracks, BPM sync, move crossfader, cut low EQ, use hot cues/loop, apply echo, exit, restore environmental audio with no hang or second invisible player. Performance and sound quality take precedence over decorative animations.

## 32. Environmental sound and speaking NPCs

Layer spatial environment sound per world: pedestrians chatting, footsteps, scooters/tuk-tuks, horns, birds, frogs, dogs, rushing rivers, sea and beaches, markets, doors, shop bells, forest life, flying spacecraft, club crowds, indoor bar acoustics. Use Three.js PositionalAudio/Web Audio, asset pooling, LOD and maximum concurrent voices. **Distance and position must matter**: hear Blues Bar from across Giant Hostel; hear a tuk-tuk pass; DJ bass fades as one walks away; beach surf follows coastline. Save user's music/sfx/dialogue levels independently.

For active dialogue, support free browser `speechSynthesis` as a progressive enhancement: display subtitles, select suitable installed voices by character/language where possible, adjust pitch/rate, cancel reliably on exit, voiceschanged fallback and browser click/tap audio unlock. It may not spatialize natively; use positional prerecorded lines or background chatter for crowds. Important recurring NPCs can get **licensed local TTS/pre-rendered voice recordings** after proper consent and model license checks. No commercial voice cloning without permission; do not falsely identify an NPC as a real person's genuine voice. Maintain four refreshing choices after each exchange and memory across saved interactions, but do not promise paid generative AI or infinite realistic dialogue if backend absent.

## 33. Working transport across planets

A shared vehicle framework with clear entry/exit and state persistence for **bicycles, scooters/mopeds, tuk-tuks, road cars/taxis in appropriate eras, boats/kayaks, public transport and futuristic shuttles**. Reuse road/water/path graphs; implement arcade style acceleration, turning, braking, sound, collisions, speed caps and default camera that doesn't induce nausea. Thai city traffic prioritizes light scooters and tuk-tuks, NYC 1920s uses period automobiles, Amsterdam 2077 bicycles/canal vehicles, Ibiza 1969 vintage scooters, Pai mountain road is a scenic travel transition, Koh Tao small scooters on winding tracks, Astro-9 hover transit. Also allow paid-in-game rides with NPC drivers where appropriate. Accessible keyboard AND phone controls. Keep pedestrian spaces traversable; no vehicle stuck in interior doorway, no traffic running over important characters, no automatic transport physics that breaks player movement.

## 34. Interactable architecture and NPC life

Every upgraded or new district must include meaningful interiors: front door, floor plan, working tables/counters, ambient sound, occupants, at least one purchase/talk/play/use action, meaningful opening hours in world time if appropriate. Use instanced detailed exteriors with selective fully detailed interiors; do not implement thousands of empty identical buildings. NPC crowds need varied species, clothing, silhouette, ages and friendly context-aware behaviors, schedules, relationships, memory and spontaneous invitations. Busy markets and central plazas may use background crowds rather than every person running full CPU AI. Every world should have quiet areas too. Preserve both English/Spanish dialogue paths and the NPC story characters.

### 34A. HIGH-FIDELITY HUMAN CHARACTERS: photorealistic faces and believable people (NEW v1.1)

**Owner request:** Humans should stop looking like colored block people. Upgrade **human faces and human bodies** toward a genuinely photorealistic, natural-looking standard, especially for people a player speaks to up close. Keep the worlds' imaginative, colorful art direction, and preserve expressive alien and Stone Ape designs; this is not an instruction to turn all species into ordinary humans. Prioritize real visual quality rather than merely increasing polygon counts.

**Production approach, adapted to actual device performance:**

1. Audit existing `js/chars_human.js`, `js/chars_regional.js`, `js/chars_real.js`, sculpt/rig/PBR modules, currently shipped GLB assets and render tiers. Do not reimplement a working character system. Research locally usable, appropriately licensed high-quality **rigged human glTF/GLB** base meshes and facial assets, or construct optimized originals with Blender if available. Check texture, embedded third-party image, and model licenses; no scraping photogrammetry, nonconsensual face scans, or unauthorized real-person likenesses.
2. Build a **hero-human archetype** for conversation distance: plausible facial proportions and asymmetry; detailed ears, nose, lips, jaw, mouth interior and teeth, natural eye shape with realistic iris/sclera/reflection and convincing eyelids, subtle skin color/roughness/normal detail, appropriate freckles/wrinkles, eyebrows, hair cards or efficient meshes (not rigid spaghetti strands), real clothing drape/proportions, articulated hands and elbows/knees. Focus on warm, lifelike expression, not uncanny plastic dolls. Choose face/body/wardrobe variation suitable to each world and historical era.
3. Rig and animate idle breathing, head turns, blinking, eye contact, walking, greeting, gestures, drinking, dancing, playing instruments and reacting to splashes. For speaking NPCs, use simple jaw motion/visemes or morph targets if supported; don't promise precise real-time phoneme alignment with browser `speechSynthesis`. Preserve current character dialogue, animation APIs and NPC schedules.
4. Prioritize important **Chiang Mai and Da Nang humans** for the first realistic pass: Mutt, Cough, Nuni, Steve, Dino, local pedestrians, café vendors, travelers. Later extend the same system to Hanoi, Pai, Madrid, Ibiza 1969, Vienna, Amsterdam 2077, NYC 1926 and all suitable human eras. Model individual characters consistently with actual references supplied by the owner; when no reference exists, make a fictional respectful character rather than claiming a photoreal recreation of a real person.
5. Use **distance-based LOD**: a small number of expressive near-field hero humans, much lighter medium-range silhouettes and instanced/animated impostor crowds in the distance. Avoid loading full-resolution face textures or costly skeletal animation on hundreds of festival NPCs simultaneously. Use skinning/material batching, atlas textures, mipmaps, frustum/occlusion culling and capped shadow casters. Offer High/Medium/Low quality presets, where Low retains recognizable faces and human proportions rather than reverting to cubes. Separate cosmetic near-field upgrades from crowd-density tuning.
6. Verify on the real HP Spectre x360 / Intel Iris Xe, not only a headless software renderer: compare still images of the same characters before and after, close-up and at market distance, under day and night lighting. Report measured frame times, triangle counts, draw calls, texture memory, and number of concurrently animated hero humans. Gradually expand the photoreal treatment only after acceptable speed is observed. No claim of AAA photorealism when the actual runtime render does not achieve it.

**Human acceptance:** The player can approach at least **three clearly different human NPCs** in Chiang Mai, see realistically proportioned faces, expressive eyes, hair/skin/clothing and believable movement, initiate dialogue without a broken camera or animation, then turn toward a bustling crowd that remains responsive on Low. Close faces must visibly improve in actual screenshots. Avoid faceless helmets, identical clones, flat painted face textures and severe lighting artifacts.

## 35. Holidays, eras and world modes

World-specific modes should be switchable where sensible, with safe transition and performance budgets. **Chiang Mai Songkran must be a huge interactive water festival controlled through actual equipped buckets, water guns and bottles (section 35A), not a merely decorative crowd**. Preserve Chiang Mai Yi Peng/Loy Krathong and Songkran. Add Amsterdam King's Day as a distinct celebration, Venice New Year's and optional Carnival as distinct events, Ibiza 1969 day/sunset/night (not modern club mode), Pai sunset/fire show/techno nights, 1920s New York jazz nightlife, Koh Tao sunrise/reef boat schedules, and time-gated Stonehenge/Egypt phases. Do not have historical eras change randomly while a vehicle is in motion. Festival sounds, decorations, crowds and performances load on demand.

### 35A. CHIANG MAI SONGKRAN: the huge chaotic water festival, actually playable (NEW v1.1)

**Owner request and behavior contract:** Songkran should feel like a **genuinely wild, crowded Thai New Year water festival**, not a few pedestrians holding static props. The street is packed with happy festivalgoers spraying each other, repeatedly refilling buckets, splashing from roadside basins, laughing and dancing, with scooters/tuk-tuks moving slowly or diverted away from main water-party streets. Preserve the existing **F festival-mode switch** and the well-liked Yi Peng/Loy Krathong festival; only Songkran changes when activated. Avoid decorative pools that do nothing: support actual interaction, animation, hit reaction and sound.

**Street-level atmosphere:**

- Make key Chiang Mai festival zones visually **much busier**: dense but performant crowd layers, NPC groups actively chasing/spraying/splashing, festival banners, water-soaked road edges, mini kiddie/paddling pools or large roadside water tubs, blue water barrels, refill stations, shop-front splash stations, tuk-tuks festooned for the event, and periodic bursts of group water fights. Important temples, indoor shops and rest areas should provide quieter zones. Do not jam spawn points, doorways, streets or portals.
- Add different ages and appearances of festival visitors, wearing casual summer/flower-print clothing and carrying varied props. At close range, NPCs should visually raise a bucket, point a water gun, throw a splash from a bottle, dodge, laugh, wipe their face, and look damp afterward. Create **audio layers** of water splashing, sprays, bucket slosh, cheers, playful shouts, footsteps through puddles and outdoor music; duck sound during important NPC speech.
- Simulate high perceived population with **instanced background crowds**, cheap looped animation, dynamically spawned medium-distance splash events, and only a limited number of true nearby target-aware participants. Use particle pooling/instanced droplets or shader sprites; no full fluid simulation, expensive collision on every droplet or giant smoke-like cloud. Scalable presets must preserve the feeling of a huge festival even on Low.

**Exact player interaction mapping (must work):**

- When the player **equips a bucket**, the primary action **left mouse click** (or its touch-equivalent **Splash/Use** button) throws one big, visible arc/sheet of water forward using the arm and bucket animation; the bucket has a fill level, can go empty, and refills at tubs, pools, stations or available containers. The sound, visible throw, nearby NPC reaction and depleted fill must agree.
- When the player **equips a water gun**, **press/hold left click** sprays a continuous controllable stream forward (mouse-look aims), draining its reservoir; release immediately stops it. Tap fires a short burst. Support refilling at water stations.
- When the player **equips a water bottle**, clicking causes a quick **forward water flick/squeeze** with an arm thrust resembling the original punch gesture *but throws water instead of punching*. Use a small contained amount and refill/replacement interaction. Do not show a punch or damage animation on impact when the bottle is held.
- With **empty hands**, existing punch/action controls behave exactly as they did before; with **food, camera, a joint, beer, musical instrument or pipe**, preserve each item's current primary action. Songkran equip context should take precedence only for water weapons; never make the portal pipe permanently visible or steal **P** from the portal system.
- On **mobile**, integrate the current on-screen Use/Splash control with the same held-item semantics: tap for bucket/bottle, hold for water gun; no overlapping control buttons or accidental attacks when touching menu panels. Optional gamepad mapping if available. Add short first-time HUD instructions: "Equip bucket / gun / bottle from bag, aim, click to splash, refill at blue tubs".
- Show **first-person hands and held object** with appropriate grip, visibly animated bucket lift-and-throw, water-gun trigger/aim, bottle flick, occasional drips/wet material. Add plausible travel distance, splash decal/burst and hit detection that triggers distinct wet reactions in NPCs. NPCs should reciprocate and splash the player. Use a brief opt-out camera-droplet overlay plus optional gentle water splash on screen; offer reduced effects/off for accessibility.
- Normal (non-Songkran) modes should not accidentally generate endless festival spray. When Songkran is deactivated, cleanly despawn event-specific props/particles/audio, restore the ordinary traffic/crowd pattern, and keep persistent inventory unaffected. Transition back and forth repeatedly without leaks, crashes or stuck controls.

**Required playtest, not only unit tests:** Activate Songkran outside Giant Hostel. Walk through a visibly packed water-party street. Pick up a **filled bucket**, click once and observe a full throw, refill and throw again. Equip a water gun and hold/release left click to start/stop a stream. Equip a water bottle and click to see a forward water-flick rather than a punch. Watch at least five different nearby NPCs actively splash each other and respond to hits; see roadside refill tubs and wet streets. Confirm the festival audio is lively and stereo. Turn Songkran off, verify all festival actors/audio/particles stop, then re-enable it. Do the same core actions with phone touch. Measure real FPS and allocations in the crowd on Low/Medium/High, and provide before/after screenshots or a short observed test capture. If the live actions fail, do not mark Songkran complete.

## 36. Frame-rate and memory budget for the HP laptop

Target hardware includes an **HP Spectre x360 with Intel Iris Xe integrated graphics** plus phones. Treat previous Chiang Mai 2-million-triangle/Low issue and extreme headless test slowness as real optimization concerns, even if real GPU may be faster. Add reliable F3 diagnostics: FPS, frame time, draw calls, triangles, resident assets, active audio, active agents, world ID and build hash. Pick realistic quality targets and **measure actual laptop gameplay** rather than only headless SwiftShader timing. Aim for stable ~30 FPS on Low where feasible at conservative rendering resolution; gracefully degrade dense scenes instead of claiming guaranteed 60 FPS. Use districts/chunk loading, instanced/culling flora and crowds, LOD, texture atlas, bounded postprocessing, impostors, audio pooling, adaptive pixel ratio, throttled distant NPCs, streaming screens/videos, capped active voices and particles. Avoid rebuilding the entire world at every frame. Test minimum Low/Medium/High and monitor memory after repeated portal travel.

## 37. Save compatibility, authenticity and asset provenance

Use stable world IDs. Preserve current saves and V0.8 migrations. When new worlds are added, the owner must not lose their prior inventory, homes, credits or quest progress. Maintain media manifests and not overcopy large films to public hosting. Track licenses/attributions for model packs, textures, ambient sound and music; prioritize originals and public-domain/CC0. Avoid distributing actual third-party commercial songs, club mix samples, trademarked logo artwork or copied performances without the necessary rights. Mark historical memories as fiction where reconstructing private people/places. No real-money gambling and no paid API required.

---

# PART V — EXECUTION: DELIVER REAL, VERIFIABLE PROGRESS

## 38. Single master program with a realistic milestone sequence

**You have been given the full program in one prompt. Do not demand separate prompts for each feature.** However, don't open 20 world source files and implement placeholders for them all in one giant unsafe patch. Persist a queue in `docs/WORLDS_REBORN_STATUS.md` and advance through it with a playable demonstration after each bounded milestone.

### Milestone 0 — safe audit / map reference import / baseline
- Identify current active branch/server/build; protect uncommitted work and save data; compare with GitHub, resolve stale docs/status reporting without destructive overwrites; create reference-image index.
- List actual current features and regressions, especially basketball and double-deck DJ mode; mark owner-tested vs automated-only.
- Inspect provided maps, coordinate system, current 3D world registry and actual world modules; identify next reusable world-build patterns from Da Nang/Chiang Mai.
- Update stable visible build ID / commit short SHA in settings or F3 so the owner can tell what version is running, including whether newly added worlds exist.

### Milestone 1 — atlas **before construction**
- Produce a **separate map blueprint** for each requested destination, consistent naming/IDs, adjacency/routes/landmarks/eras and an accompanying image-generation brief. For the seven user-supplied images, preserve and annotate the given maps, don't generate replacements without specific reason.
- If usable image-generation tooling exists, render each missing world as a distinct illustration in the defined Apeverse hand-drawn style. Otherwise make accurate vector layout plans and mark the hand-drawn art as awaiting generation; never pass it off as complete artwork.
- Add preliminary world entries to registry as **planned/under construction**, never as playable merely because an illustration exists. Show planned world cards in Pipe Guide without sending player to empty coordinates.
- Implement the reusable world-atlas/minimap data pipeline with one working existing world as proof (Chiang Mai or Ape Town).

### Milestone 2 — repair existing gameplay (before huge map build)
- **Fix owner-reported basketball failure** with observed real-first-person test, not just a green automated suite.
- Pipe only visible when P/phone Pipe invoked; held inventory items/consumable animations work and can be stowed.
- Complete professional-enough **two-deck DJ mixer**: BPM, sync, loop, hot cues, EQ, low/high filter and a couple FX, valid track selection, original music and correct audio transitions.
- Verify basic player mobility and working scooters/tuk-tuks; patch broken interaction prompts and reload-safe saves.

### Milestone 3 — immersion and city polish
- Chiang Mai venue spacing and improved enterable architecture, scooter-heavy traffic, appropriate 7-Elevens and outlying temples.
- Ape Town Circular Plaza alive with mime, guitar, social gathering and ambient layers.
- Spatial environmental sounds and spoken NPC dialogue fallback across existing worlds.
- Working circular minimap and optional full atlas on desktop/phone.

- **NEW v1.1**: Upgrade close-range human NPCs to genuinely believable photoreal-quality faces/hair/skin/clothes with scalable LOD, starting with Chiang Mai / Da Nang. Redesign Songkran with much denser crowd layers and the exact held bucket, water-gun and bottle click/hold actions. Preserve all other festival modes. Confirm with real player actions and FPS reports before treating either as complete.

### Milestone 4 — Astro-9, first signature megacity district
- One complete believable multi-block **Central Spiral Plaza + Bazaar** vertical slice, using graphical/structural lessons from Justin's Da Nang and Chiang Mai.
- Explore districts on foot, enter shops, chat, hear a bustling city, buy an item, find transport, return via portal, check GPU performance.
- Extend in subsequent focused sub-milestones to Club Graviton true zero-g, docking bay, art/cinema, homes, gardens, observatory, rooftops and transit rings. Don't simply triple geometry without offering exploration.

### Milestone 5 — Madrid, Pai and meaningful connections
- Madrid first slice: Pinar/Chamartín home area plus a central zone and a **working metro transition**.
- Pai: real-feeling Walking Street, Rainny Café, Sunset Bar, Paradise Circus, tea-and-drum spot, Pai River Jam hostel, scooter/bus links to Chiang Mai, and optional Jungle Dub trail. Verify each world remains separately selectable.
- Both worlds have distinct local NPC/audio/traffic ecosystems, at least two functioning interiors and a visited landmark beyond the spawn area.

### Milestone 6 — Ibiza 1969 + Koh Tao 2022
- Ibiza connected island, vintage scooter road, Cala Tarida/El Palmarar family house, flower-power market, gentle nightlife, hikes, caves and swimming/snorkeling.
- Koh Tao harbor memory hostel (default spawn), Chloe's dive school and beginner reef dive, islands, scooter and food; expose the shared scuba framework for Atlantis.

### Milestone 7 — fantasy systems and planets
- Alien Maze X-9, Atlantis, Neon Nexus and Maya canal city. Each distinct; reuse mapped route/water, NPC and shops systems but customize geometry/ambience.
- Underwater engine proven in Koh Tao -> Atlantis. Neon Nexus keeps fictional/nonredeemable points. Maze has meaningful path choices. Mayan city has canals and distinct architectural research.

### Milestone 8 — world cultures and time travel
- Hanoi + water puppet show, Cat Ba + kayaks, Amsterdam 2077 + King's Day, Venice New Year's/Carnival, New York 1926, Stonehenge eras, Angkor and Egyptian time-river. Construct each in small playable slices and expand carefully.
- Koh Samui Jurassic fantasy, optional Bangkok, Resonara and Nomad-7 become later bounded milestones according to available resources.

### Milestone 9 — world-wide consistency and public-readiness audit
- All truly playable worlds reachable/returnable via Pipe, transport links, minimap and saved world state. No missing shaders, animations or screens. Performance acceptable in dense scenes with low-quality fallback; player-facing audio controls, accessibility and touch. License check and media audit; public HTTPS deployment only if owner authorizes it. Don't expose unsafe LAN multiplayer server to the public.

**Milestone gating rule:** Only mark a milestone “shipped” when its playable acceptance walkthrough has been carried out and documented. It is permitted to record a stretch target as **planned**, but never present design text as completed implementation.

## 39. Concrete implementation architecture

Use and extend existing modules when present:

| Existing subsystem / example | Intended use |
|---|---|
| `data/worlds.json`, `data/worlds.js`, `AV.registerWorld` | stable Pipe registry, new world IDs, module registration and status synchronized |
| `js/core.js`, `js/main.js` | player movement, camera, input, world lifecycle, debug build indicator |
| `js/world_kit.js`, `js/arch_kit.js`, `js/gfx.js`, sculpt/rig/character modules | reusable architecture, materials, visual character quality, performance tiers |
| `js/world_chiang_mai.js`, `js/world_da_nang.js`, `js/world_vienna.js` | proven city layout/rendering patterns and world-specific modules |
| `js/world_astro9.js`, `js/astro9_districts.js` | build on existing Astro-9 without discarding it |
| `js/world_ape_town.js`, `js/world_jungle_dub.js` | existing hubs and performance/music venues |
| `js/portal.js` | Pipe guide, travel transitions, local travel and status |
| `js/audio.js`, `data/music.js`, `js/media.js` | audio mixing, original music/video, spatial audio and proper ducking |
| `js/bag.js`, `data/items.js`, `js/effects.js` | inventory, held viewmodel, food/drink/smoking effects and save compatibility |
| `js/chat.js`, `js/npc.js`, `js/city_life.js` | spoken dialogue, NPC memory, crowds, vehicles and routines |
| `js/chars_human.js`, `js/chars_real.js`, `js/rig.js`, `js/pbr.js` | near-field photorealistic-quality human faces, body rigs, facial expressions, material and LOD system |
| `js/pool.js` | preserve current pool game and optional activity interactions |
| `tools/tests/`, `docs/DEVELOPMENT_PROGRESS.md` | bounded tests and honest progress; update alongside status ledger |

Suggested new **shared** modules if none exist: `js/songkran_water.js` or extensions to existing water-mode/`js/bag.js` code for equipped-item splash tools, refill points and pooled visual effects; a character asset/LOD loader only where existing rig/PBR modules do not already cover the need; `js/minimap.js` plus per-world cached atlas data; `js/vehicles.js` for consistent movement/boarding; `js/dj_mixer.js` with Web Audio interface and deck state; `js/voice.js` for TTS and voice channel; `js/world_transitions.js` for loading/road/ferry journeys; `js/basketball.js` *only if existing implementation has not already provided a good equivalent*. Do not create duplicate files with competing public APIs; integrate with actual boot script order (`index.html`) and avoid global name collisions.

Data consistency: generation-time map layout can live in readable JSON, but runtime should load only needed data and not double-parse two inconsistent registry copies. Build/transpile from one source of truth if necessary. For game state, version the save schema and provide reversible migration, export/import UI, backups and robust `null`/unavailable asset handling. Ensure former `file://` vs server behavior is documented honestly; prefer local HTTP for actual media. On static public sites, never embed secrets or real account keys.

## 40. Testing matrix (human-play acceptance is mandatory)

**Baseline / regression:** correct startup from active build; local HTTP works; phone landscape touch; WASD + Shift + jump; mouse-look; inventory; five major worlds load; P opens/closes pipe; return to home; save/export/import; music/film playback and audio restore; no endless loops. All tests have per-case and overall timeouts; freeze logs and report timeouts rather than repeating a hung 8-hour suite. Distinguish software-headless renderer timings from real Iris Xe GPU results.

**Concrete required journeys:**
1. **Chiang Mai**: emerge at Giant Hostel, hear Blues Bar opposite, see Panahan across, travel north toward Pineapple Express rather than finding it at the front door, enter Chada's / Khun Kae's, find a 7-Eleven, ride a tuk-tuk and a scooter, visit a temple, activate Lantern Festival and return to normal.
2. **Ape Town**: enter bustling plaza, observe mime, musician and varied crowds; greet one NPC and get four fresh follow-up dialogue options, move through the crowd without getting stuck.
3. **Basketball**: find court, pick up ball, aim/throw from normal first-person camera, see valid score/feedback, miss intentionally, repeat, exit/re-enter; test on real laptop and emulated phone.
4. **Inventory**: spawn with no pipe visually held, select a joint, smoke/exhale once, recover from visual effect, equip/drink from a bottle, see controllable mild sway, stop/reset effect instantly, stow item, press P to show the actual portal pipe and close it.
5. **DJ**: play distinct licensed tracks A/B; edit/tap BPM, activate Sync and assess beat alignment, save/recall hot cue, engage 4-beat loop, filter and EQ, FX echo, crossfade, exit and restore world sound; verify mobile controls and no duplicate tracks.
6. **Astro-9**: walk among real district streets (not only a plaza), enter shops, take transport, hear flying vehicle, reach Club Graviton and truly float in zero gravity, return and find an observatory/cinema.
7. **Pai**: from separate pipe menu walk real-feeling Walking Street, visit Rainny Café, Sunset Bar and Paradise fire show, join tea drum circle, find river hostel/cabins, take road or minivan to Chiang Mai, cross separate trail to Jungle Dub; return safely.
8. **Madrid**: explore Pinar/Chamartín, take working metro link to central Madrid, visit Malasaña or Sol and Retiro, return, find memory dogs only at appropriate place.
9. **Ibiza 1969**: ride vintage scooter between two meaningful neighborhoods, enter Cala Tarida house and garden/pool, hike to cove, swim/snorkel, visit a bohemian drum gathering, no modern LED superclub.
10. **Koh Tao**: appear at harbor hostel home base, climb to sea-view plant balcony, meet Chloe at nearby dive school, board boat, dive past wildlife, surface safely, return hostel; pause/phone doesn't trap diver underwater.
11. **Atlantis**: arrive at surface, dive into coral village, use dry dome, return to surface and exit; reused underwater systems behave identically.
12. **Hanoi**: ride through street network, find water puppet theater, sit to watch an actual puppet sequence, walk around lake, travel to Cat Ba optionally.
13. **Amsterdam 2077**: normal city cycling + canal travel, toggle King's Day, see orange festivities/boats/stalls/music, return to normal without deleting city.
14. **Venice**: cross a bridge, ride a boat, attend New Year's fireworks mode, switch to normal and separate Carnival mode with no duplication.
15. **New York 1926**: walk down a period street, enter a speakeasy, ride a period car and experience optional jazzy city activity.
16. **Historical worlds**: visible era markers for Egypt/Stonehenge; change eras via time gate, see distinct architectures, do not falsely imply Druids built Stonehenge or Alexandria existed in Old Kingdom.
17. **Maze / Nexus / Maya / Angkor / Jurassic / invented worlds**: each demonstrates unique traversal, architecture and local activity, no copy-pasted blank terrain.
18. **Performance/save**: walk in dense festival/city for 10 minutes, log FPS/triangles and memory; save, close/reopen, retain current world and possessions; repeat world travel 10 times without major memory/audio leaks.

19. **NEW v1.1 - Photoreal human faces**: approach Mutt, Nuni and a distinct Thai street vendor in Chiang Mai; verify natural facial proportions, eyes, hair, skin/clothes, blinking and gestures with screenshots; verify no slowdowns at festival crowd distance and no generic cube fallback on Low. Document model licenses and texture memory.
20. **NEW v1.1 - Songkran stress and water interaction**: enter Songkran in Chiang Mai; see dense crowd, mini-pools/tubs and dozens of NPC water fights at a distance; equip bucket and click to throw/refill; water gun click-hold/release; bottle click for water flick not punch; NPC reacts and retaliates, player gets optional droplets; phone controls work; deactivate Songkran to remove crowd/water effects; measure FPS and leaks across 5 repeated mode switches.

For every test provide: **actual action performed, expected vs observed behavior, platform, screenshot/log, pass/fail/not-run, and honest blocker**. Add screenshot/video capture only with permission; do not fabricate visual tests. Preserve a `docs/WORLDS_REBORN_TESTS.md` matrix.

## 41. How to work across long Claude Code sessions

At the start of *each* session, read `docs/WORLDS_REBORN_STATUS.md`, current branch and tests. Keep a next-action task list with at most 3 active tasks, and capture clear checkpoint commits. Timebox unit tests; when browser suite times out, preserve errors and continue targeted diagnostics rather than waiting forever. Stop cleanly at a stable boundary when usage reaches limit; write `docs/WORLDS_REBORN_NEXT_SESSION.md` containing branch/commit, work done, tests run, issues, next exact commands, and which user-provided maps are available. Do not promise overnight work without an actual running authorized automation/server.

## 42. Required initial response and FIRST REAL TASK

**Do not reply with only inspirational text.** Reply briefly with:

1. Current path, branch, commit, active local URL, and owner-reported basketball status, current human-face quality and Songkran water-use status.
2. Feature audit: existing vs broken vs new, specifically DJ/basketball/pipe, Songkran, character realism, map list, visuals.
3. Images detected from `REFERENCE_MAPS` and world ID uniqueness check.
4. Proposed milestone order and the **one first small implementation action you will do immediately**.
5. Then begin the work: create safe branch/backups and map atlas plan, starting with actual POI/route JSON for Astro-9 plus Madrid and Pai, plus accurate registries. If map illustration tools exist, produce the first missing separate map; otherwise prepare its complete illustrator brief. Do not preemptively overwrite world modules.

When Milestone 1's core map layout and a minimap proof are underway, fix basketball and other broken interactions before building giant content expansions. Provide the next runnable URL and instructions for owner to try the game and review the results.

**ONE MASTER REQUEST. MULTIPLE HONEST DELIVERABLES. PRESERVE WHAT ALREADY WORKS. NEW v1.1: REALISTIC HUMAN FACES + A TRULY PLAYABLE SONGKRAN.**

---

## Historical and map reference sources (fact-check starting points; not substitutes for the owner's vision)

- English Heritage, Stonehenge history: https://www.english-heritage.org.uk/visit/places/stonehenge/history-and-stories/ — the stone circle dates to late Neolithic c.2500 BCE, not an original Druid construction.
- English Heritage, Iron Age religious practices / Druids: https://www.english-heritage.org.uk/learn/story-of-england/prehistory/religion/ — later phase distinct from Stonehenge construction.
- Las Dalias official market history: https://web.lasdalias.com/en/markets — market began 1985, though venue existed earlier; Ibiza 1969 requires period-correct markets.
- Balearic travel information on Las Dalias: https://www.illesbalears.travel/index.php/en/ibiza/flea-market-hippy-market-de-las-dalias — venue's earlier bar/music history.
- City of Amsterdam King's Day: https://www.amsterdam.nl/en/leisure/king-day/ — current King's Day 27 April; 2077 future setting is fiction.
- UNESCO Ha Long Bay – Cat Ba Archipelago: https://whc.unesco.org/en/list/672 — actual location and karst/seascape reference.
- For Egypt, confirm Giza Old Kingdom, New Kingdom Thebes and Ptolemaic Alexandria dates with reputable Egyptology sources before adding factual NPC exposition; don't collapse them into one “Golden Age.”
- Historical/architectural sites in Madrid, Pai, Hanoi, Angkor and NYC require location checks and respectful treatment. Owner's private memory worlds may intentionally depart from verifiable public geography; label them as memory recreations.
