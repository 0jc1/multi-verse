# Tokyo: Shibuya and Harajuku (Apeverse 2 New Worlds, agent 2)

**Code:**
- `js/world_tokyo.js`: builds the city: the pencil-building kit, the sign atlas, roads, the crossing, landmarks, the viaduct, the shrine, Harajuku and the matsuri decorations.
- `js/tokyo_life.js`: runs it: signals and cars, the crowd, screens, trains, shops, venues, the shrine, the festival, conversations, and the registrations in shared systems.

**Test:** `tools/tests/suite_tokyo.js` runs the release gate on the real GPU:

```
powershell -ExecutionPolicy Bypass -File tools\tests\run_tests.ps1 -Suite tools\tests\suite_tokyo.js -Gpu -W 1536 -H 864 -Port 8732 -StepTimeout 900
```

**World id:** `tokyo`.

**Sources:** the owner's illustrated "Apeverse Tokyo: Tradition Meets Futurism" map is a mood and POI reference only. Distances are plausible, but this is not a survey of the real city. **Every business and brand is fictional.** Landmarks are public places: the crossing, the stations, Center Gai, Takeshita Street.

## What you can do

**Arrive** on the Haru plaza, east of the scramble crossing, next to the portal, the station and the taxi pool.

**The scramble crossing:** a real 74-second signal cycle:
1. the avenue goes green;
2. then the west road;
3. then all cars stop for the pedestrian phase.

The crowd waits at the four corners and floods across in every direction, diagonals included. Cars queue at the stop lines, and they stop for you if you stand in their lane. Japan drives on the left, and so do the cars here.

Three animated giant screens on the corner towers show Apeverse brand ads and the local time.

**Walk:**
- the station plaza and Haru statue → the crossing;
- Center Gai (a pedestrian lane with a gateway arch and lamp arches);
- the Udagawa alley and the back street under power lines;
- the south alley → the Inari shrine grove;
- the station south passage → Chōchin Yokochō (the lantern alley under the tracks) → the Shinsen alley back to the avenue;
- up the avenue → Harajuku: Takeshita Street and the forest shrine.

**Architecture:**
- **About 420 buildings:** narrow pencil buildings with tile, glass curtain-wall, balcony and concrete fronts. Windows are lit at night.
- **On the buildings:** AC units, water tanks and antennae, roof billboards for fictional Apeverse brands, and vertical blade signs in Japanese (tategaki).
- **Signs:** about 1,000 sign faces from one 2048×3584 atlas of 70+ authored signs:
  - fascias with a Japanese name and a Latin subline;
  - noren curtains;
  - vending machine fronts;
  - menus, posters and station signs.
- **Other details:** utility poles with wires, vending-machine clusters, guard rails, zelkova street trees and cherry trees.

**Landmarks:**
- the NW corner tower and its screens;
- the silver Moon Tower drum;
- the Maru-Ape department store;
- Shibuya Station on the Loop Line viaduct;
- the timbered Harajuku Station;
- the giant wooden torii and the forest shrine hall.

**Businesses** (walk-in means through the door to an interior):

| Business | Type | Sells / does |
|---|---|---|
| ApeMart Express (Center Gai) | walk-in konbini | onigiri, noodles, PuffPop, tea, can coffee, ramune |
| Ramen Kaminari | walk-in | ticket machine (食券機) → hand the ticket to Haruki → ramen, gyōza, beer |
| Game Center Banana Zone | walk-in | UFO catcher (every 4th try is lucky), taiko rhythm drums (shared instrument activity), purikura |
| Jazz Kissa Kuroneko | walk-in listening bar | siphon coffee, matcha, highballs; its own music when you're inside |
| Live House SPACE NEKO | walk-in, 19:00-02:00 | ticket 15 (or Yumi's guest list); the band until 23:00, then a DJ; bar; DJ booth (shared mixer); dance |
| Izakaya Chōchin (yokochō) | walk-in | beer, sake, highball, edamame, yakitori |
| Yakitori Torikichi, Oden Akari | counters under the tracks | yakitori, oden, warm sake |
| Karaoke Utage | counter | sing one; best score saved |
| Groove Dealers Records Shibuya | counter | LPs, boombox |
| Kaiten Sushi Yūgure, Momo Crêpes, Taiyaki Taiya | counters | food |
| Sentō Matsu-no-yu | counter | soak: +energy, +vibe, 40 minutes pass |
| Sakura Cycle | counter | rent a mamachari outside; buy a mamachari, an e-kickboard or a 50cc scooter |
| ApePhone Store Tokyo, SWAG Tokyo (Harajuku) | brand shops | the existing ApePhone items and the SWAG merch UI |
| Kawaii Crêpe, Rainbow Candy Floss, Ura Vintage, Purikura Sakura | Takeshita counters | food, used clothes, stickers |
| 8 vending-machine clusters | machines | cold and hot drinks |

**The shrine:**
- the chōzuya basin, the offering box, omikuji fortunes (good ones are kept; bad luck is tied to the rack), ema plaques, and omamori at the shrine office;
- vermilion torii, kitsune statues, stone lanterns, a camphor tree, cherry trees and cedars.

**Getting around:**
- **Loop Line:** the elevated train from Shibuya to Harajuku and back, 2 credits. You ride on the viaduct the whole way, with the chase camera. Two AI trains run on the viaduct and stop at both stations.
- **Taxis:** black, with automatic doors.
- **Rental bikes**, plus bikes and scooters you can buy. They are saved and shippable.

**People:**
- **Named residents:**
  - Haruki (ramen chef): the kitchen, then the izakaya at night;
  - Yumi (DJ): the record shop, then the kissa, then the booth;
  - Sora (rhythm-game champion): the arcade, then the Haru statue at 16:00;
  - Mei (miko): the shrine, then the yokochō;
  - Kenta (taxi driver): the taxi pool, then sushi, then the yokochō.
- **Daily routines:** they walk between their places when you're near.
- **Conversations:** 4 choices each, and each can do something (GPS waypoints, the UFO catcher, omikuji, the quest).
- **Crowds:** pedestrians on the street graph (office workers, tourists, backpackers), the scramble crowd, live-house dancers and the band, staff behind the counters, and yatai cooks.

**Story mission, "Yumi's test pressing":**
1. Yumi asks for her record; a GPS waypoint points to Groove Dealers Records.
2. Pick it up at the counter (it goes into your backpack).
3. Bring it back: +40, and you're on the guest list, so tonight's entry is free.

**Shibuya Bon Odori Matsuri:** every Friday, 17:00-24:00 on the Apeverse calendar (a themed weekly event, not a real date).
- **The setting:** a yagura tower with a taiko drummer in the station plaza, 12 lantern strings, lantern lines down Center Gai, and festival banners.
- **Stalls:** 7 yatai (yakisoba, takoyaki, kakigōri, goldfish scooping, ring toss).
- **The dance:** yukata dancers circle the tower from 19:00, and you can join the circle.
- **Off:** everything switches off cleanly when the festival ends.

**Sound:**
- **Positional playlists, all existing:** the band (Stone Ape Band), the DJ and the matsuri (Jungle Dub), and the kissa (Chiang Mai).
- **Ambience preset (procedural):** the crowd, traffic, crossing chirps during the pedestrian phase only, trains, shrine chimes, crickets at night, taiko on matsuri nights, and clinks in the yokochō.
- **No new audio files.**

**Save:** a new optional `S.tokyo` holding `met`, `q.press`, `train`, `ramen`, `lh` (ticket expiry), `guest`, `gigs`, `dances`, `kar`, `ufo`, `ufoTries`, `puri`, `omikuji`, `prayed`, `ema`, `purified`, `forest`, `sento` and `odori`.

## District 2: Asakusa (tokyo_asakusa.js)

**How you get there:** the Ginza Line, from the entrance on the Haru plaza (2 credits; there is no tunnel to ride). The districts are a subway ride apart, as in the real city, and every street inside Asakusa connects.

**What's there:**
- **Kaminarimon-dōri** with the **Thunder Gate** and its giant red 雷門 lantern.
- **Nakamise:** 73 stalls with red-tiled roofs and red lanterns. Six of them sell:
  - Fumi's hand-grilled senbei, ningyō-yaki, kibi-dango;
  - souvenirs (fans, maneki-neko, tenugui), melon pan, matcha ice cream.
  - They open 9:00-19:00. At night painted shutters come down (waves, a festival, Mt Fuji).
- **The inner gate and the temple precinct:**
  - the main hall with an offering box; a no-clapping hint;
  - a five-storey pagoda;
  - the incense burner, with real smoke you can waft over yourself;
  - omikuji with honest bad luck: tie it to the rack;
  - ema plaques, a small shrine (where you do clap), ginkgo trees and stone lanterns.
- **Denpōin-dōri:** Edo-style wooden shophouses, including **Kimono Rental Hana** (walk-in, 15: rent for the day).
- **Hoppy Street:** izakaya huts with tables out on the lane, with drinkers in the evening. Hoppy, motsu-nikomi, beer.
- **Tempura Sumida** on Kaminarimon-dōri (walk-in): tendon, the tempura set.
- **The Sumida river:** a promenade with cherry trees, a red arched bridge to the east bank, and the **Skytree** across the water (scenery, lit at night).
- **Rides:**
  - a **rickshaw** tour to the river and back (3), pulled by Ren;
  - the **water bus** on the Sumida (6), captained by Daichi.
- **Named residents:** Ren, Fumi and Daichi, with routines and 4-choice conversations.

**Story, "Fumi's fortune":**
1. Fumi can't climb to the hall today, so she asks you for an omikuji.
2. A bad fortune doesn't count.
3. Bring her a good one: +20 and senbei.

**Save:** `S.tokyo.as` holds `met`, `q.fumi`, `incense`, `prayed`, `omikuji`, `ema`, `shrine`, `gate`, `kimono`, `rick`, `bus` and `ginza`.

**Rendering:** tiles carry a district tag, and only the district you are in is drawn.

**Not built yet:**
- The main hall and the pagoda are exteriors.
- Nakamise stalls are counters.
- The Skytree is scenery: you can't go up.
- No Asakusa festival yet; the city's festival is still Bon Odori in Shibuya.

## District 3: Shinjuku (tokyo_shinjuku.js)

**Getting there:**
- **On foot:** north from Harajuku, through the forest shrine (paths round the hall, then the north torii), up the avenue.
- **By train:** the Loop Line runs Harajuku ↔ Shinjuku.

**Streets:** Yasukuni-dōri crossing, Kabukichō (Ichibangai gate and neon canopy, K1/K2, north street, west lane), Golden Gai (three tiny lanes of two-storey bar huts), Omoide Yokochō along the tracks, the east-exit plaza with the Studio Ape screen, the Mecha-Ape cinema tower, the Sanchōme grid, and the west skyscraper skyline.

**Things to do:**
- GIGA APE: walk-in, with a crane game and a drum game.
- Don Banana: walk-in.
- NEON-BOT robot show, 20:00–24:00.
- Tsukemen Kaze and Yakitori Kemuri.
- Golden Gai bars, 19:00–04:00.
- Capsule Hotel Hachi: sleep until 08:00.
- Batting center.

**People:** Hiro, Aoi and Takeshi. Aoi's spare-battery story unlocks a free show.

Shinjuku has its own sign atlas, and its building chunks are a separate region (`sj`), drawn only near the district.

## Release gate

Measured results (pass counts, FPS and draw calls per view) are in `docs/NEW_WORLDS_STATUS.md`.

## Not built yet (honest)

- **Interiors:** six walk-ins only. The karaoke, sushi, records, sentō, brand shops and Harajuku shops are counters at the shopfront, and the department store and station are exteriors.
- **Station:** no concourse to walk through. You board at the ticket gate on the plaza.
- **Rides:** no player-driven train. Rental bikes cannot go up onto the viaduct.
- **Districts:** Shinjuku, Akihabara, Asakusa/Ueno, Tsukiji, Odaiba, Roppongi, Shimokitazawa and Koenji from the map are future districts. Harajuku is a first slice: Takeshita Street, the station plaza and the forest shrine approach.
- **Dancing:** the Bon Odori dance and the live-house dance are menu actions, not player animations.
- **Original music:** none for Tokyo yet. The venues use existing playlists.
- **Not checked:** phone emulation passes (`suite_newworlds_mobile`), but there has been no real-phone test and no human playtest.
