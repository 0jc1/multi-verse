# Amsterdam: first playable district (Apeverse 2.1)

**Code:**
- `js/world_amsterdam.js`: the city.
- `js/amsterdam_life.js`: people, shops, rides and King's Day.

**Test:** `tools/tests/suite_amsterdam.js` runs the release gate on the real GPU.

**World id:** `amsterdam`. The 2.1 brief proposed `amsterdam_present`; the shorter id is used, and Amsterdam 2077 stays a separate future world.

**Sources:** the owner's illustrated Amsterdam map and the 2.1 city brief are mood and POI references only. Distances are to scale, but this is not a survey of the real city. **Every business is fictional.** Real coffeeshop names on the illustrated map (Grey Area, Green House…) are not used. Landmarks are public places: Centraal, Dam, the canals and the palace.

## What you can do

**Arrive at Centraal Station,** on the station square, next to the portal, the tram stop, a taxi stand and the bike racks.

**Walk** Damrak → Dam Square → the Singel → the Herengracht → the Jordaan lane.
- **Bridges:** 7 walkable arched brick bridges.
- **Canals:** real water, so you can't walk into them.
- **Streets:** quays with Amsterdammertje bollards, elms, parked bikes and houseboats.

**Architecture:** canal houses with stepped, neck, bell, spout and cornice gables, brick, black-painted and stucco fronts, a slight forward lean and hoist beams. Windows are lit at night. Landmarks: a station with two towers and a clock, a palace with a pediment and cupola, the Dam monument, and a church tower over the Jordaan.

**Dutch shop signs**, one atlas with 30 authored signs and window displays:
- **Fascias:** gold leaf on black, enamel, neon. That includes the businesses below, plus ground-floor shops: Drogisterij, Boekhandel De Kade, Kapper, Antiek & Curiosa, Wijnhandel Kuiper, Tabak · Kranten, Koffiebranderij, Kaarsen & Zeep, Fietsenmaker, Vishandel, galerie noord, Snoepwinkel.
- **Window displays:** bread, books and goods.

**Businesses:**

| Business | Type | Sells |
|---|---|---|
| Café 't Gouden Kraantje | walk-in brown café | pils, jenever, koffie, bitterballen, appeltaart |
| Coffeeshop De Blauwe Lantaarn | walk-in | 18+ notice first, house rules on the wall (no alcohol, no hard drugs, take it slow, no driving after); pre-roll, herb, pipe, space cake, fresh mint tea |
| Groove Dealers Platen | walk-in record shop | LPs, boombox |
| Bakkerij Van der Molen | counter | stroopwafels, appeltaart |
| Vlaamse Frites | stand | frites |
| Kaashandel Jansen | counter | cheese |
| Monkey Brew Proeflokaal | counter | beer, kombucha |
| Flower stall on Dam | stall | tulips |
| ApeMart Express | kiosk ("supermarkt") | groceries |
| PuffPop | vending machine | snacks, soda |
| De Waterkant | live music | sets every evening from 20:00 |

**Getting around:**
- **Tram Centraal ↔ Dam:** a visible ride on the Damrak rails, 2 credits.
- **Canal boat tour on the Herengracht:** it passes under the bridges, 12 credits. On King's Day it becomes a boat party.
- **Taxi:** electric.
- **Jasper's Fietsen:** rent a bike (8) or buy an omafiets (110) or an e-step (160). Owned bikes are saved and can be shipped between worlds.
- **Cyclists:** they ride in the red bike lanes and along the Singel; trams run on Damrak.

**People:**
- **Named residents:** Noor (canal boat captain), Jasper (bike shop), Fenna (café musician), Daan (coffeeshop host) and Imani (market seller).
- **Daily routines:** they walk between their places when you're near; otherwise they're simply there.
- **Conversations:** 4 choices each, and each conversation can do something: a boat tour, the bike shop, the coffeeshop menu, tulips, or a quest.

**Story mission, "Fenna's setlist":**
1. Fenna asks you to fetch her setlist; a GPS waypoint appears.
2. Collect it at Groove Dealers Platen.
3. Bring it back for 40 credits.

**King's Day (Koningsdag):** on the Apeverse calendar it comes round every Sunday, a themed weekly event, not the real 27 April.
- **During it:** orange bunting over Damrak and the bridges, vrijmarkt blankets on the Dam (orange crowns and bargains), orange crowds, and a DJ boat on the Singel playing from 12:00.
- **Off:** normal life returns cleanly, and Amsterdam stays open all week.

**Sound:** an ambience preset with trams, church bells, crowds, gulls and canal lapping. Venue music and the DJ boat use playlists that already exist in the game (Stone Ape Band, Jungle Dub); no new audio was added.

## Release gate (2.1 launch queue)

| Gate item | Status | Evidence |
|---|---|---|
| Spawn and portal back, no save loss | AUTO-TESTED | arrival on the station square; portal; Ape Town ↔ Amsterdam round trip |
| 3 connected areas, walk and waypoint routes | AUTO-TESTED | Centraal → Dam → Singel → Jordaan routes cross the bridges |
| City-specific architecture, local-language signs, real storefronts | AUTO-TESTED + screenshots | 8 businesses, about 70 sign faces, Dutch text |
| 2 walk-in businesses, food and drink, a meaningful quest, a consumable with an effect | AUTO-TESTED | 3 walk-ins reached through their doors; café, bakery, frites; Fenna's setlist; coffeeshop chain with visuals-off and clear |
| A local ride or transit, plus a map | AUTO-TESTED | tram, boat, taxi, bike rental and purchase; GPS to the Jordaan |
| A scheduled performance | AUTO-TESTED | De Waterkant from 20:00 (existing playlists) |
| A festival that switches off cleanly | AUTO-TESTED | King's Day on and off |
| Named NPCs with routines | AUTO-TESTED | 5 residents, schedules (Fenna to the venue at 21:00) |
| Save/load, tests, screenshots, measured FPS | AUTO-TESTED | sandboxed `loadSave` roundtrip (not a page reload) |
| Mobile, human playtest | **NOT DONE** | |

**Measured, real GPU at Medium, one sample each:**
- Arrival: 51 fps, 72 draw calls.
- Damrak: 52 fps, 78 draw calls (a later battery run: 58 fps, 51 draw calls).
- Jordaan lane: 38 fps, 146 draw calls (a later battery run: 46.8 fps, 127 draw calls). Crowds plus dense houses make this the weakest spot.

## Not built yet (honest)

- **Districts:** Leidseplein/Rembrandtplein, Museumplein/Vondelpark, NDSM/Noord (ferry) and the Bloemendaal beach trip are future districts.
- **Interiors:** only the three walk-in shops have them. Other shopfronts are counters or set dressing.
- **Bridge clearance:** canal-boat clearance under the bridges is visual only; boats follow a fixed tour route.
- **Original music:** none for Amsterdam yet. The venues use existing playlists.
- **Not checked:** no mobile check or human playtest.
