# Apeverse 2.3: The Living World (development ledger)

- **Branch:** `apeverse-2.3-living-world`, cut from the consolidated 2.2 build `7d046e3`.
- **Worktree:** `Downloads\ape multiverse 1\apeverse-livingworld-wt`.
- **Dev server:** http://localhost:8102/index.html. Start it with `tools\serve.ps1 -Port 8102 -NoBrowser`.
- **Play (latest validated build):** **http://localhost:8101/index.html**. It is served from the release folder `apeverse-play-wt`; `toolselease.ps1 -Commit <sha>` promotes a commit, and `release_log.txt` records each release. Your saves live in the browser's storage for this address, so releases never touch them.
- **Development + tests:** 8102 (this worktree). Tests use sandboxed save keys in their own headless browser profile.
- **Fallback:** the 2.2 build is untouched on branch `apeverse-2-integration`, served on **http://localhost:8103/index.html**.

Nothing has been merged into `main`. One agent (this one) develops 2.3.

**Every result below comes from automated runs, not human playtests.** They ran in headless Chrome on the real GPU at 1536×864, with a sandboxed save (`apeverse_test_*` keys), through the shared `%TEMP%\apeverse_gpu.lock`.

## Failures and open items first

| Item | Status |
|---|---|
| GPS in Astro-9: the first routes after arrival take 0.5–1.6 s | **Open.** The routes are asked for in the first seconds, before Astro-9's walking graph is built (it is built a few milliseconds per frame), so they use the fine grid. Finishing the build in one go would freeze the game for longer, so it stays open. |
| GPS speed checks are noisy | Pai (161 / 408 ms) and Koh Samui (234 / 473 ms) took the same route method in two runs, but different times. The code path for those worlds did not change; this is load on the laptop. Treat single GPS timing failures there as noise. |
| Major cities have 9–11 missions each (5 of them repeatable board jobs) | More city-specific chains and random encounters come in the business, festival and minigame milestones. |
| Nimbus has no 2.3 missions | It did not load in the world probe (it is not registered or has no named places). To check. |
| Ape Town penthouse door | Not verified. The door finder found no building near the plaza, so it was moved to the Crystal Garden / Brand District. To be checked in the next probe. |
| Character creation, vehicle theft, police, health / hospital, business expansion | Not started (Milestones C–E). |

## Milestone A: foundation + first playable loop (in progress, first checkpoint)

**Done and tested:**
- **Starting money:** new games start with **10 000 credits** (`AV.LW.CFG.startMoney`). Existing saves keep their balance. Once, they are **offered** an optional 10 000-credit starter grant with an explanation; declining keeps the balance. It is never automatic.
- **Mission engine** (`js/lw_missions.js`, `AV.mis`):
  - Missions are data-driven. Stage types: branching talk, go, have item, use / consume, game event, condition, travel.
  - Missions can have prerequisites, timers, failure, abandon and retry (failure never blocks), repeatable dailies, follow-ups, rewards (money, items, reputation per world) and mission variables that branches write.
  - The whole state is saved in `S.mis`.
- **Mission UI:**
  - A gold ❗ marker floats over anyone with work for you; a pink ◆ marks the tracked objective. Both also appear on the minimap.
  - An objective banner (under the stats, top left) shows the step and the distance.
  - The **journal** opens with **G** or 📜 on the ApePhone. It has Active / Available / Done + reputation tabs, with Track, Navigate (GPS route) and Abandon buttons, and it also lists the older tasks.
  - Notice-board triggers handle missions that have no character giver.
- **Branching dialogue** (`js/lw_dialogue.js`, `AV.convo`):
  - A conversation is several exchanges with a transcript on screen. Number keys 1–9 pick a choice.
  - Characters remember you across sessions (`S.rel`: times met, affinity, flags), and greetings vary by visit, time of day and shared history.
  - Mission talks, offers ("What do I get out of it?") and "💬 Talk properly" chips sit next to the classic typed chat, which is kept unchanged.
- **Property** (`js/lw_property.js`, built on `housing.js`):
  - Five new homes:
    - Ape Town: Mushroom Studio (4 500), Gallery Loft (11 500), Lotus Penthouse (38 000).
    - Chiang Mai: Nimman condo (5 200), Old City teak house (16 000).
  - Each comes with a real street door and an interior, plus a starter bed and wardrobe.
  - Estate agents: **Remy** (Ape Town plaza) and **Khun Pim** (Chiang Mai, by Giant Hostel). Each gives advice in conversation, then opens a listings panel: type, size, district, rent / price, what is included, rent / buy, and "show the door" on the GPS.
  - `housing.js` now supports several homes per world (door per home, custom sign and description).
- **Content:**
  - **Ape Town** (6 missions):
    - Welcome to Ape Town, a six-step story. Choose your path with Pip, eat, meet Zil, rent or buy with Remy, walk in, sleep.
    - Rush hour at Zil's (daily job).
    - Dash's three parcels (timed delivery, random route).
    - A canvas for Luma (art; branching pitch, bonus for a bold idea).
    - Kiko's market day (find stock, set a fair or pushed price).
    - Lunch rush with Sol (dialogue puzzle; can fail and be retried).
  - **Chiang Mai** (5 missions):
    - Hustled by Nuni: a real pool game, with a bonus if you win.
    - Reception shift at Giant: three guest situations; pay depends on your answers.
    - Restock the counter: a timed run to Warorot Market.
    - Rooftop party: invite three of the crew.
    - Big Blues jam with Steve, unlocked by the party.
  - Authored talks for Zil, Mutt and Nuni.
  - Existing game events now feed missions: every `AV.dlg` event, pool results, Giant crew actions, and renting or buying a home.

**Inherited 2.2 bugs fixed:**
- **Amsterdam:** Yara's kroket waypoint vanished at once. A waypoint set less than 16 m away now arrives at 2.5 m instead of 12 m (`minimap.js`).
- **Consumables:** `AV.bag.busy()` was false for 350 ms between automatic bites or sips. It now stays true while the next step is scheduled, and `AV.cons.finishing(id)` was added (`consume.js`).
- **GPS speed** (`pathfind.js`):
  - The street-graph search now uses a binary heap; it used to be O(n²).
  - Worlds with a street graph use it for trips over 90 m (was 220 m).
  - Rio went from 725 ms to **17 ms**; Madrid is 53 ms; Astro-9 went from 601 to 493 ms (see open items).

**Regression on the 2.3 branch:**
- int22 161/161
- integration (22 worlds) 208/208
- amsterdam **268/268** (the Yara kroket check passes now)
- gps 139/142 (Astro-9 cold start, plus Pai and Koh Samui timing noise, see above)
- Madrid 103 ms, Sevilla 4 ms, Rio 53 ms
- The street-graph threshold for trips over 90 m is used only in the gw_kit cities and Astro-9. In Amsterdam it made one 93 m route 4% longer than the check allows, so other worlds keep 220 m.

**Tests:** `tools/tests/suite_lw23a.js` plays the loop through the real game objects: kiosk, sip-by-sip drinking, the agency's rent button, the door, the bed's menu, and the conversation choices. Result: **85/85**.

## Milestone B, first pass: missions in every world

`js/lw_content_b.js` adds a local host to 14 worlds: Noi (Pai), Ranger Ama (Koh Samui), Linh (Đà Nẵng), Franzi (Vienna), Lola (Madrid), Joost (Amsterdam), Kenji (Tokyo), Margot (Paris), Jordi (Barcelona), Carmen (Sevilla), Paco (Cádiz), Lupita (Oaxaca), Youssef (Chefchaouen), Bia (Rio). In 6 more worlds an existing character is the giver: Vela, Captain Rook, Auntie Pearl, Professor Puff, Dalia, Salem.

Each of these 20 worlds has four authored missions built on its real places:
- **Discovery walk:** three named places, then a talk.
- **Photo job:** a repeatable "take the photo" interaction at a landmark.
- **Courier run:** timed, repeatable, with a hand-over interaction at the destination.
- **Favour:** a branching talk with two outcomes, a trip and an on-the-spot action.

The engine gained place-based steps and `spot` steps (an interaction that appears at the place only while that step is active).

**Test:** `suite_lw23b`, **365/366**, then 22/22 for Astro-9 after one change. In every world it checks:
- the giver is there;
- the walk is offered, accepted, played to its three real places and paid;
- the follow-ups unlock;
- the courier hand-over appears at the destination and pays.

The Astro-9 observatory stop (on a raised platform) was swapped for the Glow Gardens.

## Milestone C: mission density + reward loops

`js/lw_content_c.js`:
- **📌 Job board** next to the arrival point of all 22 worlds, with a ❗ on the map. It offers five jobs that pick fresh real places every time:
  - 🚕 **Fares across town:** two passengers, a timed drop-off, pay by distance (up to 420).
  - 🎉 **Flyer the party:** three spots.
  - 📦 **Hot food rush:** collect, then a timed delivery; faster delivery means a bigger tip.
  - 🎸 **Street gig:** play, and stay with your crowd for 20 seconds; tips vary.
  - ⭐ **Local hero:** finish 6 missions in that world for 600 ¢ and +10 reputation, and jobs there **pay 20% more from then on**.
- **🔥 Daily hustle streak:** every 3rd mission you finish in an in-game day pays +150.
- Jobs are daily-repeatable. In total there are **201 missions**; every world has at least 9, Ape Town 11 and Chiang Mai 10.
- Engine: steps can now use positions chosen fresh for each run.

**🔥 What's Happening? (new ApePhone app, `js/lw_happening.js`):**
- One live feed from the game's own systems: your active missions, missions and jobs on offer (here and in other worlds), festivals, Stone Ape Band sets, open billiards tables, business opportunities, properties for sale, and **invitations from friends** (characters whose affinity with you is high).
- Tabs: **Now · Later today · Coming days**. Each row sets a **GPS route** (same world) or **travels you there** (other world).
- The badge counts what is happening near you.

**Fixed in passing:** `garage.js` had a second GPS arrival check with an 8 m radius, the same family of bug as the kroket waypoint. It now honours the short-waypoint radius.

**Test:** `suite_lw23c`, **164/164** with the app step. First run 151/153; both failures were test-side and fixed. It plays every job type through its real interactions in 6 worlds, including walking away from the gig, which stops progress. It also checks the hero perk (flyers pay 132 instead of 110 afterwards) and the streak.

## Roadmap update (owner's priorities, 2026-11-27)

- **D:** business expansion and consumables.
  - Bar, café and food counters hand you a drink or meal you can hold and consume.
  - Many more enterable shops.
  - Legality by location: lots of coffeeshops / dispensaries in Amsterdam and Thailand, and none sold openly elsewhere.
  - A 7-Eleven-style parody convenience store in Thailand.
- **E:** money, progression, apartments, business ownership groundwork. Includes the bank view: income, expenses, assets.
- **F:** character creation (male / female, name, look, outfit, hair), barbers, clothing.
- **G:** stealing bikes and vehicles, police with 1–5 wanted stars, chases, hospital respawn.
- **H:** Ape Town redesign as a full funky city, with many brands; NPCs wear the brands sold in the world; **Bamb**, the original smoking-alien street artist, with murals; galleries and museums.
- **I:** minigames and competitions: billiards tournaments, arcade and snake-style games, wagers.
- **J:** conversations and polish.
- **Crowds and festivals** (built into D, H and I rather than separate):
  - Dynamic NPC density by place, time, weather and event, using instanced or simplified distant crowds for the Iris Xe laptop.
  - Festivals that transform neighbourhoods: closures, stalls, stages, merchandise, competitions, jobs, dialogue. The Chiang Mai lantern festival gets packed streets.
  - An event calendar with festival travel mode.
  - Original festivals for Ape Town, Astro-9 and Jungle Dub with the owner's music, brands and Bamb.

## Coverage report (2.3 missions only; decorative or placeholder interactions are not counted)

| World | 2.3 missions | Talkable 2.3 characters | Homes for sale / rent | Notes |
|---|---|---|---|---|
| Ape Town | 6 | Pip, Zil, Luma, Kiko, Sol, Dash, Remy | 3 | Flagship; more planned in B |
| Chiang Mai | 5 | Mutt, Nuni, Steve, Dino, ZtonedApe, Nunyin, Khun Pim | 2 | |
| Madrid | 4 | Lola | 1 (from 2.0) | Also has the older 2.x businesses |
| Verdalux, Astro-9, Jungle Dub, Pai, Koh Tao, Koh Samui, Đà Nẵng, Vienna, Jerusalem, Judean Desert, Amsterdam, Tokyo, Paris, Barcelona, Sevilla, Cádiz, Oaxaca, Chefchaouen, Rio | 4 each | one host each | 0 | First pass |
| Nimbus | 0 | none | 0 | See open items |

## Roadmap

**A (finish):**
- Ape Town flagship storyline hooks (Stone Ape Band, ZtonedApe).
- Agent and listings in every world that has homes.
- A first starter-business purchase flow on top of `ventures.js`.

**B:** at least 10 missions per major city, with initial coverage in every world first (Amsterdam, Madrid, Vienna, Barcelona, Tokyo, Paris, Oaxaca, Astro-9, Sevilla, Cádiz, Rio, Chefchaouen, Pai, Koh Tao, Jungle Dub, Verdalux and the smaller worlds). Also random encounters, interconnected storylines, and festival, sport and photo missions.

**C:** enterable businesses at scale with a modular interior kit; physical shopping and serving (bartender → held drink); regional convenience stores and coffeeshops under per-world fictional rules; employment; business management UI.

**D:** character creation (name, male or female, body, fur / skin, hair, face, clothes, shoes, accessories, preview), barbers, tattoo studio, persistent wardrobe and outfits.

**E:** vehicle ownership and fictional unauthorised-use interaction, 1–5 wanted stars, police patrol and pursuit, arrest, fines, impound, health and hospital respawn.

**F:** entertainment, more mission chains, phone and UI polish, mobile controls, performance and the final regression.

## How to run

```
powershell -ExecutionPolicy Bypass -File tools\serve.ps1 -Port 8102 -NoBrowser
```

Then open http://localhost:8102/index.html.

Tests (one at a time, through the GPU lock):

```
powershell -ExecutionPolicy Bypass -File tools\tests\gpu_queue.ps1 -Owner lw23 -Run "-Suite tools/tests/suite_lw23a.js -Gpu -W 1536 -H 864 -Port 8102 -StepTimeout 900 -Out %TEMP%/lw23_a"
```

## Owner requirements added after the first human playtest (2026-11-27). Not implemented yet unless marked.

1. **No generic text signs.** Every important business gets its own signage, branding, materials and storefront, in all worlds.
2. **7-Eleven-style stores across Thailand** (Chiang Mai, Pai, Koh Tao, Koh Samui):
   - green / orange / red fascia, a lit logo, glass doors, fridges, stocked shelves, a counter, posters, AC units, staff and customers, scooters parked outside;
   - functional: buy, then consume.
   - **Licensing flag:** the real 7-Eleven marks must be cleared before any public or commercial release. The build uses a recognisable parody mark.
3. **Giant Hostel recreated from the owner's photos:**
   - the pink and white "New Srisuk / J GIANT HOSTEL" banner with red lettering;
   - glass and aluminium doors, green lit shop signs, the covered terrace, the Ganesha mural on the side wall;
   - wooden benches, stone tables, plants, mats and shoe racks;
   - reception, common room and pool.
   - The Blues Bar stays opposite, with evening live music.
4. **Street audio:**
   - Find and remove the breathing-like noise.
   - Location-specific spatial ambience: scooters, tuk-tuks, voices, footsteps, cafés, birds, rain, buskers, markets, crowds, nightlife, doors, fridges.
   - Separate volume sliders for music, ambience, vehicles, crowds and effects.
5. **At least 40% of the named businesses in each major city really interactive**, with a per-city coverage report.
6. **T = full-screen city map:**
   - zoom, pan, filters, legend, missions, shops, homes, bars, clubs, transport, hospitals, events, GPS;
   - use the illustrated city maps already in the assets (audit them first; report any that are missing);
   - travel moves to its own control; linked to What's Happening?.
7. **Two-deck DJ controller:**
   - jog wheels that really scratch, seek and nudge; waveforms; cues; BPM; pitch; sync; crossfader; 3-band EQ; gain; filters; loops; library;
   - mix ZtonedApe tracks;
   - usable in clubs, studios, homes and festivals; tied to gigs, competitions, reputation and income.
8. **Onboarding:**
   - character creation, name, starting city, two furnished starter homes in different worlds (bed, storage, wardrobe, music, TV, parking);
   - starter package: 10 000 ¢, car, bike, scooter (world-appropriate; futuristic on alien worlds), phone, food and drinks, optional basic fictional weapons;
   - home spawn choice on load; owned homes and vehicles on the phone and maps;
   - the starter package is optional, and offered once, for old saves;
   - optional tutorial missions.

## Playtest-fix release (owner feedback 2026-11-27)

- **Breathing noise, root cause found and fixed** (`js/lw_audio.js`):
  - Sound 2.0's café / bar / market "chatter" was white noise whose volume was swung by 0.37 Hz and 3.1 Hz oscillators, which sounds like breathing. The world ambience crowd, traffic and wind beds did the same.
  - Chatter is now an irregular murmur of short voice-like grains.
  - The fake crowd, traffic and hum beds are removed; natural beds (waves, rivers, fountains, cicadas, wind) keep playing without the pumping.
  - Doppler pass-bys added: scooters and tuk-tuks in Thailand and Vietnam, cars elsewhere, hover craft on Astro-9.
  - **Settings has new sliders** for ambience, crowds and vehicles.
  - *Still procedural:* the local CC0 packs contain no street, traffic or crowd recordings. Real recordings need downloading with the owner's OK.
- **T = full-screen city map** (`js/lw_map.js`):
  - category filters (missions, places, shops and services, homes, transport, portals, your vehicles), a legend, click-to-GPS, and buttons for 🌀 travel (also Shift+T) and 🔥 What's Happening?;
  - T or Esc closes it.
  - **Illustrated guide:** the owner's 16 illustrated maps were audited and copied to `assets/maps/` (local-only). 12 worlds have one, plus extra sheets: the Chiang Mai hostel map, Amsterdam neon, and the España travel map for the Spanish cities.
    - They are artwork that does not match the playable street layouts, so they are shown as a separate guide page, never under the GPS markers.
    - **No illustrated map yet:** Tokyo, Barcelona, Madrid (only the España travel map), Astro-9, Jungle Dub, Verdalux, Đà Nẵng, Jerusalem, Judean Desert, Koh Samui Jurassic, Nimbus. Unused files: "Interconnected Maze City" (no matching world), "Canary Islands" (no world).
- **G = missions journal.** Before this, `core.js` caught G for graphics quality, so the journal shortcut never fired in real play. Graphics cycling moved to F4.
- **7-ELEVAPE** (`js/lw_stores.js`, a recognisable 7-Eleven-style parody; **real marks must be cleared before any public release**):
  - walk-in stores with a lit fascia, glass front, fridges, stocked shelves, a counter, Ploy the clerk, posters, an AC unit and parked scooters;
  - placed off the roads near real places: 5 in Chiang Mai (the Moon Muang minimart building itself is rebranded; its generic neon sign is gone), 3 in Pai, 3 in Koh Tao, 1 in Koh Samui;
  - the counter menu: toastie (heated), basil rice, ice cream, cola, iced latte, energy shot, water, Thai tea, crisps, snacks, and beer only from 11:00 to 14:00 and 17:00 to 24:00;
  - your order is rung up, handed over, put in your hand, and eaten bite by bite.
- **Giant Hostel from the owner's photos:**
  - the banner as photographed: pink strip "New Srisuk" + นิวศรีสุข, red "J GIANT / HOSTEL", the Thai name, 40/3;
  - **the real Ganesha mural**, cropped from the owner's photo (`assets/tex/giant_ganesha.jpg`);
  - dark stone tables with block stools, a red mat, a shoe rack, a green neon line over the shop window.
  - **Known:** the game's frontage is a mirror image of the real one (mural on the right, shop window on the left). Flipping it means rebuilding the hostel's interior layout; that is the next hostel step.
- **Test:** `suite_lw23d0` 37/37.

## Milestone D: businesses you can use, real serving, legality, recorded ambience

**Coverage rule (`AV.LW.bizCoverage`, `js/lw_venues.js`):**
- **Businesses counted:** named places whose name says business, registered storefronts, 2.3 stores, individually placed signs that name a business, and named shop counters, merged within 6 m. Repeated filler facade textures (the same shophouse sign tiles on many buildings) are not counted.
- **Interactive** means a working service within 9 m: buy, order, rent, play, work, browse, a ticket, or a staff character.

| City | Before D | After D (businesses interactive / total) |
|---|---|---|
| Ape Town | 50% | 83% (15/18) |
| Chiang Mai | 60% | 85% (17/20) |
| Pai | 100% | 100% (14/14) |
| Koh Tao | 50% | 90% (9/10) |
| Đà Nẵng | 15% | 69% (9/13) |
| Vienna | 27% | 73% (19/26) |
| Jerusalem | 33% | 78% (7/9) |
| Madrid | 50% | 80% (16/20) |
| Amsterdam | 33% | 73–75% (37–38/51) |
| Tokyo | 27% | 76–79% (25–26/33) |
| Paris | 40% | 76% (19/25) |
| Barcelona | 19% | 75% (12/16) |
| Sevilla | 25% | 70% (14/20) |
| Cádiz | 36% | 91% (10/11) |
| Oaxaca | 50% | 80% (8/10) |
| Chefchaouen | 40% | 90% (9/10) |
| Rio | 11–33% | 89% (8/9) |
| Astro-9 | 51% | 83% (44/53) |

**The venue kit:**
- Businesses that only had a sign get a service counter with a menu for their kind: café, bar, restaurant, street food / market, bakery, dessert, pharmacy, records, shop, gallery (a ticket: vibe and reputation), hostel (a 2-hour nap), coffeeshop / dispensary.
- **Each city has its own dishes, street food, coffee and sweets**: 20 worlds × 4 items, e.g. Madrid's bocadillo de calamares and churros, Vienna's Schnitzel and Melange, Tokyo's ramen and takoyaki, Oaxaca's tlayuda and chocolate.
- An order is rung up, prepared (with a message: the shot is pulled, the kitchen fires up), **served into your hand**, then eaten or drunk bit by bit.

**Legality (fictional game rules):**
- Cannabis is sold over the counter only in Amsterdam, Chiang Mai, Pai, Koh Tao, Ape Town and Jungle Dub.
- Elsewhere, a place called a coffeeshop serves coffee and cake.

**Recorded ambience (`js/lw_soundscape.js`):** 17 public-domain recordings from Wikimedia Commons, licence checked per file through the Commons API. Credits: `assets/sfx/cc0_commons/CREDITS.md`.
- **Street:** a city street bed crossfaded from random offsets, in city worlds and outdoors only, quieter at night.
- **Places:** markets, cafés and restaurants, bars (at night), squares, beaches and parks play their recording through a positional panner at the place's real position. The nearest four play at once.
- **Vehicles:** recorded mopeds, motorbikes and a car pass by with stereo sweep and pitch glide; mostly mopeds in Thailand.
- **Not downloaded yet:** the flea-market and party recordings (Commons rate limit). Markets and bars use the crowd and conversation recordings instead.
- Also downloaded for later milestones: applause (concerts), lion-dance percussion (festivals), a police siren (police).

**Test:** `suite_lw23d` 66/67 on the first run. The one failure was a real bug (pass-bys bypassed the recording hook), now fixed; the rerun passed 20/20.

## Milestone E: onboarding, character creation, starter homes and vehicles (`js/lw_onboard.js`)

- **New game opens the character creator:**
  - live 3D preview, built with the same body pipeline as the NPCs;
  - name; body: ZtonedApe classic (ape), male or female; skin or fur; 7 hairstyles and 9 hair colours; beard, glasses, flower;
  - tops (ZtonedApe tee, Giant Hostel tee, Hawaiian, tie-dye, reggae, tank, plain in 7 colours); jeans, chinos, elephant pants, shorts; sneakers, flip-flops, boots;
  - starting city (14 worlds);
  - **two starter homes in different worlds**, chosen from 12;
  - optional tutorial missions.
- **Starter package:**
  - 10 000 credits;
  - both homes owned and **furnished**: bed, wardrobe, sofa, TV, record player, rug, lamp, plant;
  - **a car, bicycle and scooter parked at each home** (hover car, hover scooter and hoverbike on Astro-9), shown on the map;
  - snacks and drinks;
  - you **wake up in your home**.
- **Twelve starter homes:**
  - Ape Town: Mushroom Studio.
  - Chiang Mai: Nimman condo.
  - Madrid: Pinar 2B.
  - Amsterdam: Jordaan canal studio.
  - Tokyo: Udagawa micro-apartment.
  - Barcelona: Raval shared flat.
  - Paris: Buci chambre de bonne.
  - Rio: Copacabana flat.
  - Astro-9: Spiral Plaza capsule (futuristic).
  - Vienna: Naschmarkt Altbau flat.
  - Pai: bamboo hut (countryside).
  - Koh Tao: Sairee beach bungalow.
- **Every home has a real street door.** Where the city has no suitable building wall (Rio's walk-mask streets, Astro-9, Pai's huts), `housing.js` now builds a free-standing entrance facade with wall, roof and collision.
- **Continue** asks where to wake up: where you left off, or any home you own.
- **Old saves** get a one-time **optional** package (one furnished home, vehicles, snacks); money, inventory and missions are untouched.
- **Your avatar:**
  - C while walking switches to a **third-person camera** that shows your character, with collision-aware pull-in; C while riding keeps the old vehicle camera.
  - The ApePhone 🪞 **Me** app renames you and changes your look.
- **Tests:** automated runs open `index.html#autotest`, where New game starts straight away as before. `suite_lw23e` **49/49**: the creator through its UI, the package, furniture, wake-up at home, vehicles in two worlds, third person, the Me app, the old-save package, the wake-up chooser, and all 12 starter doors.
- **Not yet:**
  - basic fictional weapons (they come with the police milestone);
  - barbers and clothing shops charging for look changes (customization milestone);
  - the ape body reads fairly human from behind (same pipeline as the existing ape NPCs).

## Milestone D2: physically enterable businesses (owner: the 40% rule means walk-in interiors)

**`js/lw_interiors.js`:**
- Businesses without an interior get a real walk-in building on a free, flat lot near them, off the roads, facing their street.
- Each has the business's own painted fascia, a glass front with a door gap, collision walls and a glowing ceiling panel.
- **Themed interiors:** café / bakery / dessert (espresso counter, pastry case, tables and chairs), bar / coffeeshop (long bar, stools, bottle wall, neon), restaurant / food hall (laid tables, kitchen pass, produce crates), gallery (white cube, framed works incl. a **Bamb** smoking alien), hostel lobby, pharmacy (green cross), shop / records (wall shelves, gondola, LP crates).
- **The service counter moves inside;** the entrance counter of that business is retired.
- About 4 draw calls per building; hidden beyond 70 m.
- A second, more tolerant lot search (gentle slopes, wider radius) for hilly cities like Oaxaca.

**Coverage measure (`pctEnter`):** a business counts as enterable only if its service point is physically enclosed, with walls or blocked ground on 3 or more sides within 7 m, sampled every 0.1 m.
- The 2.3 interiors, the 7-ELEVAPE stores and the older walk-in shops (Cádiz, Sevilla, Giant Hostel…) qualify; entrance counters do not.
- **Bug found while testing:** at 0.3 m steps the rays jumped over 0.2 m walls. Fixed with 0.1 m steps.

| City | Enterable before D2 | After D2 |
|---|---|---|
| Madrid | 0–5% | 50% (10/20) |
| Amsterdam | 8–10% | 50–51% (26/51) |
| Tokyo | 15% | 55–58% |
| Vienna | 0% | 50% (13/26) |
| Oaxaca | 0% | 40% (4/10) |
| Chiang Mai | 10–42% | 65–68% |
| Rio | 0% | 56–67% |
| Barcelona | 0% | 69–75% |
| Ape Town | 22% | 61% |
| Pai | 46% | 54% |
| Koh Tao | 20% | 90% |
| Đà Nẵng | 0% | 100% |
| Jerusalem | 0% | 67% |
| Paris | 8% | 48% |
| Sevilla | 25% | 85% |
| Cádiz | 18% | 64% |
| Chefchaouen | 70% | 70% |
| Astro-9 | 17% | 58% |

**Test:** `suite_lw23d2` 55/55. In 8 cities it checks:
- at least 40% enterable;
- a walking route from the street, through the door, to the counter, with no point inside a wall;
- the counter is enclosed;
- an order placed inside is served.

**Known:** the interiors are clean but plain (flat colours, box furniture). Textures, props and staff come in the Ape Town / brands pass.

## APE·DJ PRO: two-deck controller (`js/lw_dj.js`)

A professional controller view (functional inspiration: Serato DJ Intro / DJUCED; original branding) on top of the existing Web Audio engine in `dj_mixer.js`. It opens automatically at every DJ booth; "Classic view" or Esc returns to the old panel.

**Decks:**
- **Jog wheels:**
  - dragging the platter while playing **scratches**: the playback rate follows your hand; backwards is approximated by stepping back;
  - dragging while paused **seeks**;
  - the outer ring **nudges** ±8% for beat-matching by ear.
- **Waveform:** scrolling, high resolution (50 points per second, computed per track), coloured by loudness, with hot-cue markers, loop shading and a centre playhead.
- **Readouts:** BPM (the curated playlist tempo wins over a doubled or halved auto-detection) and pitch %.
- **Time:** elapsed and remaining.
- **Buttons:** PLAY, CUE, 4 hot cues, loop 1/2/4/8, SYNC, KEY LOCK, pitch fader ±16%.

**Mixer:**
- per channel: GAIN, HIGH / MID / LOW (full kill), FILTER (low-pass ◀ ▶ high-pass), channel fader, level meter, 🎧 CUE (solo pre-listen; browsers have one output, which the UI says);
- crossfader and master volume;
- **searchable library** of the owner's tracks, loading to A or B;
- mouse and touch (pointer events).

**Test:** `suite_lw23f` **26/26**, at the real Ape Town DJ booth. Each control is checked against the audio graph:
- the pitch fader changes the playback rate;
- the LOW kill sets the shelf to -40 dB;
- the filter sweeps the low-pass;
- the crossfader mutes A;
- scratching changes the rate and returns to the fader tempo on release;
- the outer ring nudges;
- the paused platter seeks;
- hot cues set and jump; loops; SYNC matches BPM.

**Not yet:** scratching is rate-based on the browser's media playback, not a sample-accurate vinyl emulation. Gig pay and audience reactions still come from the existing DJ activity (`music_play.js`); DJ competitions come with the minigames milestone.
