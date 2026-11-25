# Housing (Apeverse 2.0, M8, first slice: one Madrid flat)

`js/housing.js` is a shared property system: properties are data (`AV.home.PROPS`), and furniture is a catalogue (`AV.home.CAT`). The first property is **Piso 2B, Pinar de Chamartín**.

## What you can do

**Find it.** A street door with a stone frame, a glass canopy, an intercom and a "2B · FOR RENT · FOR SALE" plate sits on a residential block on the Pinar avenue, between the ground-floor shops (the memory flat's block). It is on the map.

**Rent or buy it.**

| Option | Cost |
|---|---|
| Rent | 140 credits for 7 days (renewable) |
| Buy | 3000 credits |

Purchases are refused when credits are short. When rent ends, the door asks you to renew, and **all your furniture waits in the save**.

**Live in it.** You enter through the door with a fade. The interior is a 10 × 8 m flat with:
- a kitchenette (counter, hob, sink, fridge, wall cupboards)
- a big window onto the city
- a ceiling light and an inner door
- the leave door to the street

It is a private room in Madrid's "home" zone, where strangers never spawn.

**Furnish it.** The furniture shop (the "Decorate" spot inside, or H) sells **19 pieces** into your home stock:
- bed, sofa, armchair, coffee table, dining table, chair
- floor lamp (with its own light), monstera plant, rug, bookshelf
- wardrobe, record player, speakers, TV
- DJ decks, arcade cabinet, desk + computer
- poster and framed art print, using any clothing-store design (your owned designs first)

**Place pieces by looking.** The piece follows your gaze on the floor, snapped to 25 cm.
- Q rotates it, Enter places it, Backspace cancels. The on-screen buttons do the same on phones.
- The ghost turns red where a piece doesn't fit: outside the room, through a wall, on another piece, in the kitchen, or in the doorway. A rug can go under a table.
- Posters and prints hang on the wall you face. They avoid the kitchen cupboards.

**Change it.** Use any placed piece (E) to:
- **Move** it (the same gaze placement)
- **Rotate** it 90°, if it fits
- **Store** it back in stock

The walls come in 8 colours. The floor can be oak parquet, terracotta tiles, carpet or polished concrete.

**Use it.**
- **Bed:** sleep until 08:00 on the next day. The flat becomes your respawn point: a fresh session in Madrid starts inside.
- **Wardrobe:** wear any clothes you own (M6).
- **Record player:** play any of the game's playlists from the turntable, positioned in the room.
  - It only offers records whose music files exist in this build. The rest show "files not in this build".
  - After Play it confirms a real track started, and says so honestly if not.
  - Leaving the flat restores the street music.

**Everything is saved** in `AV.S.homes['md_pinar_2b'] = { st: 'rent'|'own', until, wall, floor, items:[{k,x,z,ry,y?,d?}], stock:{} }` and `AV.S.homeSpawn`. These are new optional fields, so older saves load unchanged.

## Verification

`tools/tests/suite_home.js`, real GPU, Medium: **61/61** (re-run after the door fix).

**What it covers:**
- **Door:** on a facade, offers rent and buy, on the map.
- **Renting and entering:** rent refused at 100 credits; rent (140 for 7 days); walk in; walkable floor; walk to the far corner.
- **Shop:** the panel lists 19 pieces; buying 12 pieces adds them to stock at the right cost.
- **Placement by gaze:** bed, sofa, rug, coffee table on the rug, lamp, plant, record player, a wardrobe rotated 270°, a TV rotated 90°.
- **Fit rules:** an armchair is refused on the bed, in the kitchen, in the doorway and through the wall; it fits by the window.
- **Wall pieces:** a poster on the back wall and a print on the window wall.
- **Editing:** rotate, move and store a piece, then place it again.
- **Walls and floor:** terracotta-pink walls and tiles are saved.
- **Wardrobe:** wears a Moonmelt tee.
- **Record player:** a real track ("Time to Explore") plays from the turntable. Stone Ape Band and Jungle Dub are correctly shown as unavailable.
- **Lights:** the ceiling and lamp lights are on at night.
- **Sleep:** next day at 08:00, respawn point set.
- **Persistence:** save and load via the sandbox key (your real save untouched); leave the flat; Ape Town and back; every piece is rebuilt where you left it.
- **Rent and purchase:** after rent expiry the door offers renewal and the furniture is kept; buying makes the flat permanent.
- **FPS:** 60 inside the furnished flat (72 draw calls, 52 k triangles).

## Not done yet

- **Waking at home on a fresh session:** implemented (a fresh session opens inside after you have slept there) but not covered by an automated test, because the test runner cannot reload the page mid-run. *Implemented, not manually verified.*
- **Other properties:** only Madrid has one so far. Pai, Chiang Mai, Vienna and Astro-9 properties reuse the same `PROPS` entry format; they need a door location and a room each.
- **Gameplay gaps:**
  - inviting NPC friends (M11)
  - TV playback (the TV is decorative)
  - working DJ decks at home (they are decorative; the playable DJ mixer is at the venues)
  - an exterior that changes with ownership
  - a "for sale" listings app (M17 ApePhone)
- **Music files:** playlists missing from this build (`stone_ape_band`, `jungle_dub`). Their files are not in `assets/music`. Cataloguing your local music library is M10.
