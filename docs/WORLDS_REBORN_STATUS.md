# Apeverse Worlds Reborn: status ledger

This is the running work ledger for the Worlds Reborn v1.1 pack (`design/worlds_reborn/CLAUDE_MASTER_PROMPT.md`). Read it first in every session.

## Where things are (2026-11-23)

| What | Value |
|---|---|
| Repo folder | `Downloads\ape multiverse 1\apeverse GITHUB (multi-verse repo)` |
| Remote | `github.com/0jc1/multi-verse` |
| Work branch | `apeverse-v1-jungle-slice`, merged with `main` up to `60a9240`. `main` is never pushed to. |
| Local URL | http://localhost:8095/ (`tools\serve.ps1 -Port 8095`). The older copy on port 8093 is a frozen fallback. |
| Engine | three.js r128, classic `<script>` files, no build step. No Node or Python installed. |
| Tests | Headless Chrome via `tools\tests\run_tests.ps1 -Suite <file> -StepTimeout 900 [-Mobile] [-Only regex]`. The headless software renderer draws a frame every 2–14 s, so it says nothing about real FPS. |
| Saves | `localStorage` `apeverse_v09`; photos in IndexedDB `apeverse_photos`. Tests never write saves. |

## The four categories

- **TESTED MANUALLY:** played by the owner (or by me with real mouse, keyboard or touch in a real browser).
- **BUILT (auto-tested):** works end to end in headless tests that use the real input and game paths, but no human has played it yet.
- **PARTIALLY BUILT:** playable, with listed gaps.
- **PLANNED ONLY:** no code yet.

### TESTED MANUALLY

**Nothing yet.** Every item below still needs the owner to try it on the HP Spectre / phone. Real FPS (F3) has never been measured on the Iris Xe.

### BUILT (auto-tested, not yet played by a human)

| Feature | Files | Tests |
|---|---|---|
| **Basketball fix** (owner-reported live failure) | `js/activities.js` | `suite_play.js` 32/32 |
| **Portal pipe only in hand when used** (P / Pipe) | `js/portal.js` | `suite_play.js` 5/5 |
| **Songkran water fight (§35A)** | `js/songkran_water.js` | `suite_songkran.js` 40/40 desktop, 11/11 phone |
| **Circular minimap + full atlas (§28)** | `js/minimap.js` | `suite_minimap.js` 38/38 |
| **Full DJ mixer (§31)** | `js/dj_mixer.js` | `suite_dj.js` 33/33; the old DJ/instrument suite `suite_music.js` still passes 43/43 |
| **Bikes, scooters, e-scooters, hover scooter, tuk-tuk fares** | `js/vehicles.js` | `suite_vehicles.js` 52/52 + 10/10 phone |
| **Four-choice conversations** | `js/social.js` | `suite_social.js` 31/31 |

**Basketball fix:**
- **Cause:** a shot only scores within about ±1% of the ideal power, while the green zone looked like ±5%. Also, the first click after the menu only captured the mouse.
- **Fix:**
  - Green zone (±6%) gives a perfect shot; yellow zone (±12%) rattles on the rim.
  - The meter is slower (1.5 s), aim assist reaches 20°, and the first click charges straight away.

**Songkran water fight (§35A):**
- **Tools:** bucket (one big throw), water gun (hold to spray, release stops), squeeze bottle (5 flicks per fill), each with a fill level shown in the hand and on a HUD.
- **Refills:** 12 refill tubs (free bucket); a festival stall at Giant Hostel sells all three.
- **Crowd:** NPCs flinch when hit and splashers fire back. Twice as many splashers, half of them near the hostel. Phone SPLASH button (tap or hold).
- **Unchanged:** empty hands still punch, and the old Q gun and soak quest still work.
- **Mode switch:** turning the festival off removes the tubs, stall, HUD and spray; the tools stay in the backpack.

**Circular minimap + full atlas (§28):**
- **Drawn from each world's own data:** walkable ground, water, buildings (`W.cols`), posts and trees, and streets (Chiang Mai roads, Vienna Ringstraße, Pai).
- **Discovery:** places appear only after you've been within 30 m.
- **Markers:** activity icons, portals, your parked vehicles, and the tuk-tuk route while you ride.
- **Controls:** rotates with you or north-up (L), zoom (- / =), J or a click/tap opens the full map, whose buttons offer every option.
- **Phone:** a small 112 px map under the Map/Bag/Set buttons; the F3 box moves below the map.
- **Hidden** in photo mode and during chat.
- **Checked** in Chiang Mai, Ape Town, Vienna, Jungle Dub, Astro-9 and Da Nang.

**Full DJ mixer (§31):**
- **Per deck:**
  - Waveform (click to seek), BPM auto-detected from the audio, plus tap tempo, typing it in, and "beat 1 here".
  - Tempo ±16% with key lock (the browser's own pitch-preserving playback).
  - SYNC: matches the other deck's tempo, or its half or double time, and snaps the beat phase.
  - 3-band EQ with full kill, a filter knob, trim, channel fader, level meter.
  - 4 hot cues saved per track (set, jump, clear mode); loops of 1/2/4/8/16 beats on the grid, held by a 5 ms timer.
- **Master:** crossfader with smooth or sharp curve, auto-mix, beat-synced echo with wet knob, reverb, master filter, master meter.
- **CUE:** solos a deck. Browsers have one audio output, so the room hears it too; the UI says so.
- **On exit:** the echo tail and reverb are cut and the world music comes back.
- **Over file://:** no EQ, filter, effects or waveform.

**Bikes and scooters:** these ride through the real movement code via `AV.drive`.

### PARTIALLY BUILT

| Feature | What works | What's missing |
|---|---|---|
| **Astro-9 metropolis, first district (§5)** | `js/astro9_metro.js`, `suite_astro9_metro.js` 30/30. See the list below. | Cinema 9, Orbit Lounge, Docking Bay rebuild, residential spires, Glassopy Observatory, transit rings, rooftops, upper-level bridges, chunk loading. The architecture is stylised (lathe towers + mosaic), not yet the Da Nang / Chiang Mai detail level. Shop interiors are simple rooms with a counter. |
| **Pai (§10), rebuilt from the illustrated map** | `js/world_pai.js` + `js/ambience.js`, `suite_pai.js` 46/46. See the list below. | See the list below. |
| **Astro-9 district 2 (§5)** | `js/astro9_district2.js`, `suite_astro9_d2.js` 23/23. The Art Avenue runs south from the plaza, with 6 living paintings that slowly change. **Cinema 9 hall:** an indoor hall with walls and one door, 5 rows of seats, "take a seat" puts you facing the screen, which plays your films (tags astro + mv); a popcorn counter. **Orbit Lounge:** a space-jazz club with its own procedural jazz (walking bass, swung ride, electric-piano comping; no files). The jazz is heard only near the lounge, and the world music ducks inside. A trio on stage, a cocktail bar, keys to jam. **Glassopy Observatory:** a glass dome; the telescope shows a live sky view that changes daily. Facades with mosaic bands, pillars and glowing arched windows. | **Film playback:** only *loading* was confirmed in the headless test; real playback depends on your video files. The halls are still simple boxes inside. Not built yet: Docking Bay rebuild, residential spires, transit rings. |
| **Madrid first slice (§9)** | `js/world_madrid.js`, `suite_madrid.js` 45/45. See the list below. | See the list below. |
| Songkran visuals | | NPCs don't look wet; crowd uses the existing throw pose; no crowd-cheer audio layer; FPS in the crowd not measured. |
| Photoreal human faces (§34A) | Soft-body characters exist (0jc1) | Heavy; no hero-human pass yet. Needs a real Iris Xe FPS reading first. |

**Astro-9 first district, what works:**
- A new south gate in the station hull leads down the Spiral Boulevard (with a giant organic arch) to the Central Spiral Plaza: a glowing mosaic spiral floor, the "9" monument with a floating ring, Gaudí-style towers, a market ring and an alien synth busker.
- **Intergalactic Bazaar:** 4 shops you walk into, each with a counter and real purchases (crystals, alien mixtape, moonplant, micro-bot).
- **Food Ring:** 3 food stalls and the Astro Café, a walk-in café with menu and tables.
- **Hover shuttle:** 5 stops (plaza, south gate, bazaar, food ring, Club Graviton).
- **City life:** hover cars cross the sky with a whoosh when one passes close; an alien, ape and human crowd fills the plaza and streets.
- Club Graviton's zero gravity is unchanged.

**Pai (rebuilt), what works:**
- **Layout:** follows your map: Walking Street runs north-south through a jungle valley with terrain, hills and distant mountains.
- **Walking Street:** 23 open-front shophouses (timber posts, plaster, gable roofs, upper floors with lit windows, balconies, awnings, hanging boards readable down the street, chalkboards, shelves, plants, café tables), 2 fairy-light strings, night market from 17:00, parked scooters, warm street lamps at night, a 40-person walking crowd plus seated café guests.
- **Cafés and shops:** Rainny Café, Ganita Café, roti stand, Live Blues Bar.
- **Tea & Drum Circle:** a pavilion with cushions, drums, drummers and a psychedelic mural.
- **Sunset Bar:** on the north-west ridge: a deck with railings, bar, DJ booth, cushions, canopy, string lights, dancing crowd in the evening, valley view.
- **Paradise Circus:** tents, string lights, sand ring, an animated fire-poi show with flame trails and flicker light from 20:00, a ring of spectators, a bar.
- **Pai River Jam:** 6 stilt cabins, a bar pavilion, campfire, the pirate sign, people hanging out, river tubers, reeds, and a bamboo bridge you walk on.
- **Nature:** waterfall (two falls, pool, mist), hot springs (3 steaming pools, rocks), bamboo bridge over a creek, Pai Canyon (red ridges, walking path, viewpoint), Yun Lai viewpoint, rice fields, jungle trail to Jungle Rave, temple.
- **Getting around:** bus/minivan station with the road to Chiang Mai, scooter rental.
- **Sound zones:** insects, birds, river, frogs at night, distant dogs, market chatter, café music, tea-circle drums, hostel jam, Sunset techno, Paradise drums and crowd. World music ducks near venues that play their own.

**Pai, what still looks weak:**
- Low-poly trees and ico-sphere canopies on Low (Medium/High swap in the detailed plants).
- Buildings are textured now (wood grain, cracked plaster with grime, corrugated tin) but still simple shapes, with no props on upper floors.
- Characters are the standard crowd figures.
- Ground and lane have detail textures; no path wear or puddles.
- **Performance (street, Low, headless probe):** was 796k triangles / 320 draw calls; now 472k / 265.
  - Half the old cost was the realistic soft-body talkers (about 200k triangles each, even with the coarser sculpt). Pai now keeps 1 on Low, 2 on Medium, 4 on High.
  - The shared character code gives Low the *finest* sculpt (`lod` is set only on Medium/High). That looks inverted, but it's 0jc1's code, so it's left unchanged. A spawn entry can now ask for `lod`.
- No scenic road transition to Chiang Mai (the minivan is a fade).
- No swimming in the river or springs.

**Polish pass 2 (done):**
- Procedural textures with world-space UVs.
- 12–26 extra walkers at night.
- Café menu boards and hanging lamps.
- River boulders.
- Facade signs only on the venues (fewer draw calls).
- Talkers capped by quality.

**Next:**
- Real FPS on the laptop (F3).
- Upper-floor props and laundry lines.
- Food-stall smoke at night.
- A scenic road transition.
- Swimming.

**Madrid first slice, what works:** two districts from your map, linked by a working Metro ride.
- **Pinar de Chamartín (mi barrio):**
  - A brick-block avenue with balconies, plane trees and traffic.
  - Bar La Esquina (Paco's bar, fictional) with terrace, a panadería (churros), a frutería.
  - Parque de Pinar: fountain, benches, playground, trees.
  - The Cuatro Torres skyline and the snowy Sierra de Guadarrama.
  - A bike-share stand.
  - The memory home: a fictional flat, no real address. Boris & Lila the dachshunds live there with name tags; you can take them for a walk and they follow you around Pinar. A screen plays Ztonedape videos.
- **Sol / Gran Vía / Malasaña:**
  - Puerta del Sol: the clock-tower building, Km 0, the bear-and-strawberry-tree statue, two fountains, lamps, benches, a guitar busker.
  - Calle de Montera up to Gran Vía: grand facades with wrought-iron balconies, theatre signs, a domed corner building, Cine Gran Vía with a big street screen playing your films, traffic.
  - Malasaña: Sala Malasaña (walk-in live-music hall with a bar, DJ booth and drum kit), a walk-in taberna with tapas (vegan bravas and pimientos marked), a mural.
- **Metro:** stations Pinar de Chamartín, Sol and Gran Vía. A 2-credit ride in a carriage with tunnel lights rushing past (E skips).
- **Sound zones:** traffic, crowds, pigeons at Sol, a Spanish-guitar busker, bar music in Malasaña at night, birds in the park, metro rumble, the dogs.
- **Private places:** wandering strangers (0jc1's stoners.js) no longer appear in the private flat or the carriage. `noStrangersAt` is a per-world opt-in.

**Madrid polish pass (done, `suite_madrid.js` 45/45):**
- **Stonework on the central buildings:** rusticated ground floors, string courses, pilasters, window pediments with keystones (Medium/High only), dormers.
- **Gran Vía:** a stepped tower in the spirit of the Telefónica building, cupolas with gold rings and finials, vertical neon theatre signs.
- **Sol:** a Carlos III equestrian statue, a newspaper kiosk, a café terrace with umbrellas, people sitting and talking around the fountains.
- **The memory flat, furnished:** sofa with cushions, rug, coffee table, bookshelf full of books, plants, floor and ceiling lamps, dining table with 4 chairs, kitchen with cabinets and fridge, family photos, the dogs' beds with blankets and bowls, a Cuatro Torres sunset in the window.
- **Performance:** Madrid's merged geometry is now split per district (Pinar, Sol, Gran Vía, flat, Metro), and districts you're not in are hidden. Headless Low probe:
  - Gran Vía: 640k → 399k triangles.
  - Inside the flat: 798k → 464k (the rest is crowd, traffic and the realistic talker).

**Madrid, what still looks weak:**
- Facades are still one builder with variations; no unique landmark interiors.
- Shop interiors outside the venues are lit glass.
- The noon sky still looks pale; a bluer tint barely changed it.
- Characters and traffic keep drawing when you're inside the flat.
- Not built yet: Retiro, Malasaña plazas, La Latina, Atocha, Madrid Río, Lavapiés, the other metro lines.

**Old first slice (replaced), what worked:**
- **Walking Street:** a 190 m lane of wooden shophouses, with lanterns and night-market stalls from 17:00.
- **Places to eat and drink:**
  - Rainny Café (walk in, smoothie bowls).
  - A vegan kitchen (real name unconfirmed).
  - Tea & Drum Circle (tea + bongo jam).
  - Sunset Bar (chill by day, DJ booth from 17:00).
  - Paradise Circus (fire show 20:00–01:00).
- **Across the bamboo bridge:** Pai River Jam bungalows (sleep until morning), a bar, a ukulele jam and the remembered pirate sign.
- **Also:** a quiet temple and a scooter rental.
- **Getting there and away:**
  - A minivan to Chiang Mai, and back from a stop next to Giant Hostel.
  - A jungle trail to Jungle Dub.
  - Its own Pipe entry (registry status `playable`).

### PLANNED ONLY (no code)

- **Map illustrations:** the hand-drawn maps for the 15 worlds without one. Image generation isn't available here; the briefs are in `EXTRAS/ILLUSTRATION_MAP_BRIEFS.md`.
- **New worlds:** Madrid first slice (Pinar + metro), Ibiza 1969, Koh Tao (+ shared scuba system), Alien Maze X-9, Atlantis, Neon Nexus, Mayan, Hanoi, Cat Ba, Amsterdam 2077, Venice, New York 1926, Stonehenge eras, Angkor, Egypt, Koh Samui Jurassic, Bangkok, Resonara, Nomad-7.
- **Chiang Mai:** venue spacing, 7-Eleven, outlying temples.
- **Other systems:**
  - Ape Town plaza life (mime, busker, groups).
  - Spatial environment sound layers.
  - `speechSynthesis` NPC voices.
  - Build ID on the F3 overlay.

## World IDs

- **Registered:** the 26 IDs in `data/worlds.json`. Pai is now `playable`.
- **New in the pack, not registered yet (13):** `koh_tao, hanoi, cat_ba, amsterdam_2077, venice_festival, new_york_1926, stonehenge_eras, angkor, egypt_ages, koh_samui_jurassic, bangkok, resonara, nomad_7`. None clash with existing IDs.

## Next 3 actions

1. **Owner:** play-test basketball, Songkran, the minimap, the DJ mixer, the Astro-9 plaza and Pai on the real laptop and phone. Report the F3 FPS readings.
2. **Pai:** owner play-test; then texture and interior polish, and a scenic road transition.
3. **Next:** Madrid district 2 (Retiro + La Latina / Lavapiés) or Ibiza 1969 / Koh Tao; Astro-9 Docking Bay + residential spires.

## Log (2026-11-23)

- Imported the pack.
- Fixed the basketball live failure and the always-visible pipe.
- Songkran water fight.
- Minimap + full atlas.
- Astro-9 metropolis, first district.
- Pai first slice.
- Full DJ mixer.
- Astro-9 district 2 (Art Avenue, Cinema 9 hall, Orbit Lounge, Glassopy Observatory).
- Pai rebuilt from the illustrated map, with layered ambience (`js/ambience.js`).
- Madrid first slice (Pinar de Chamartín + Sol / Gran Vía / Malasaña + Metro).
- Vehicles milestone (earlier, commit `f84ba1b`).
