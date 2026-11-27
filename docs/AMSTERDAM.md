# Amsterdam: three playable districts (Apeverse 2.1)

District 1 is the old centre (below). District 2 (the Museum quarter + Vondelpark) and district 3 (Leidseplein nightlife) are described in their own sections further down.

**Code:**
- `js/world_amsterdam.js`: the city.
- `js/amsterdam_life.js`: people, shops, rides and King's Day.
- `js/amsterdam_zuid.js`: district 2 (Museum quarter + Vondelpark), its buildings, signs, paintings and life.
- `js/amsterdam_leidse.js`: district 3 (Leidseplein nightlife), its square, club, bar alley, signs, tram 2 and life.

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

## District 2: the Museum quarter + Vondelpark

**How you get there:** walk south down the Vijzelstraat (a new canal-house street from the Dam) and cross the **Singelgracht** on one of 3 bridges (a wide, nearly flat tram/road bridge and two arched footbridges), or take the **tram from Dam to Museumplein**. The southbound platform is on the west side of Damrak, and the line now runs over the bridge to a terminus in front of the museum. Taxis stop at the museum and the park gate.

**Streets:**
- **Weteringschans:** a canal-house row on the north bank, with elms and lamps at the water.
- **Stadhouderskade:** an asphalt road with a red bike lane, kerbs and zebra crossings, and a row of grand houses on its south side.
- **Van Baerlestraat:** a road running south between the museum and the park.
- **Plantsoen:** a small square with trees, benches and two crossing paths, on the formerly empty block between the canal ring and the Weteringschans.

**Nationaal Apenmuseum** (fictional):
- **Building:** a red-brick museum with two towers, slate spires and a central roof spire. A **public passage runs straight through it**, as at the real thing; you can walk or cycle through it to the Museumplein.
- **In the passage:** the ticket desk ("KASSA", 15, valid for the in-game day) and the museum shop (postcard, poster).
- **The Eregalerij:** one walk-in gallery hall with **9 procedural paintings**, each with a fictional painter and a wall label you can read. They are a windmill at dusk, a still life with a banana, a gentleman ape in a ruff, skaters on a frozen canal, a ship in a storm, a canal view, a vase of tulips, a 1929 grid composition, and the centrepiece "The Evening Watch".
- **Ticket check:** without a ticket, the attendant sends you back to the desk.
- **The trail:** Ruben the guide gives you a gallery trail. Look at all nine paintings, then tell him, for **+30 and a poster**.

**Museumplein:**
- **Lawn:** mown stripes, a long pool and gravel paths, with plane trees, benches and lamps.
- **Food:** an ice cream cart (Aap & IJs) and a poffertjes stand.
- **Het Klankgebouw** (a concert hall with a portico, pediment and golden lyre) and **Museum Nu** (a white modern museum with its cantilevered "bathtub"). Both are **exteriors only**, with a readable poster or notice.

**Stadhouderskade shops** (fronts with real signs; you buy at the counter):

| Shop | Sells |
|---|---|
| **SWAG Amsterdam** | the SWAG clothing UI |
| **ApePhone Store Amsterdam** | skins, lens |
| **SOLTERRA Living Amsterdam** | furniture delivered home |
| **Chocolaterie Puur** | chocolate |
| **Pannenkoekenhuis De Zuidkant** | pancakes, poffertjes |

The rest of the row is set dressing: Hotel De Singelgracht and generic shops (jeweller, fashion, art dealer, florist, art books, grand café).

**Vondelpark:**
- **Entrances:**
  - an iron gate with stone pillars on the Stadhouderskade, with a park map board;
  - a west gate;
  - two east gates across zebra crossings.
- **Paths:** a winding main loop, a cross path and the gate paths (all on the minimap).
- **Ponds:** three, with stone edges and reeds.
- **Ducks:** they swim, and you can feed them; they paddle over.
- **Trees:** about 110 big trees on Medium (chestnut, plane, elm, with willows at the water), plus benches and lamps.
- **Landmarks:** a rose garden, a bandstand, and **Theehuis De Reiger**, a round pavilion with a terrace (coffee, tea, cake, tosti).
- **Lawn jam:** every afternoon from 13:00 to 19:00 there is a jam by the east gate. Three players and a dancing, sitting crowd gather, its music plays positionally, and **a free ukulele lets you jam on the beat** using the existing instrument activity.
- **Bike rental:** at the main gate.
- **Wildlife:** cyclists on the loop and the Stadhouderskade, and green parakeets overhead.

**People:**
- **Ruben** (museum guide) and **Sanne** (park gardener) have daily routines and 4-choice conversations that do something: the trail, directions, a waypoint to the ducks.
- **Lotte** (busker) is on the plein in the morning, at the jam in the afternoon and in the Vijzelstraat at night.
- **Staff** stand at the shop doors, the ticket desk, the museum shop and the Theehuis.
- **Background crowds:** walkers and picnickers.

**Sound:** the lawn jam uses an existing playlist (Chiang Mai). There is no new audio.

**Save:** new optional fields in `S.ams.z` only: `tk` (ticket day), `trail`, `seen` and `ducks`.

## District 3: Leidseplein nightlife

**Where it is:** on the north bank of the Singelgracht, west of the Vijzelstraat. The square was the empty block south of the Jordaan; the world grows a little west for the bar alley (the edge beyond the alley stays closed).

**How you get there:**
- **Walk:** down the Jordaan lane (it now runs straight into the square), or along the Weteringschans quay.
- **Tram 2:** from a new stop on the Stadhouderskade by the museum, west along the Stadhouderskade and over the new **Leidsebrug** to a terminus in the middle of the square. An AI tram runs the same line.
- **Fietstaxi (pedicab):** between the square and the Dam, both ways (8).
- **Leidsebrug:** also a walking route to the Vondelpark.
- **Taxi:** a stand on the square.

**Leidseplein (the square):**
- **Layout:** stone paving, plane trees, lamps, benches and bike racks, plus a map board at the quay.
- **Things to do:**
  - **giant street chess:** play a game against the regulars; your record is kept;
  - **Joris's pitch:** juggling by day and a fire show after 20:30; tip him.
- **North side:**
  - **Grand Hotel De Leidse Hof:** jugendstil, with a corner tower and a terrace. Exterior only.
  - **Club Nachtegaal.**
  - **Bioscoop Lumen:** marquee with tonight's films; popcorn at the counter.
  - **Café De Zon:** terrace.
- **East side:** the **Stadstheater**, with an arcade you can walk through, posters ("Hamlet", tonight 20:00) and a stepped gable. Exterior only.

**Club Nachtegaal** (walk-in):
- **Hours:** open 22:00-05:00. By day the door is shut and Bram turns you away.
- **Getting in:** a wristband costs 12 at the door and is valid until 05:00. Yara's guest list gets you in free. Without a wristband, Bram sends you back out.
- **Inside:**
  - a lit dance floor that flashes on the beat, a mirror ball, sweeping light beams and an LED wall;
  - a crowd that dances while the club is open;
  - a bar selling water, cola, 0.0 beer, mocktails and pils;
  - the **DJ booth**: the existing two-deck mixer, with your own tracks.
- **Music:** the club's music plays positionally (an existing playlist).

**Korte Leidsedwarsstraat (the bar alley, west of the square):**
- **The street:** projecting signs on iron brackets, string lights across it, terraces and people outside the bars at night.
- **Businesses:**
  - **Café Het Hoekje:** bruin café;
  - **Bar Vuurvlieg:** cocktails and mocktails;
  - **Pizzeria Da Gino;**
  - **Karaokebar De Zingende Aap:** sing one at night; your best score is kept;
  - **Shoarma De Nachtuil:** open till 05:00;
  - **Snackwand Kroket & Co:** kroket and frikandel from the wall;
  - **The Flying Dutchman:** pub;
  - **Hostel De Fietsbel:** full tonight.
- **Het Lichthuis:** a concert hall in an old church, with a rose window. It closes off the end of the alley. Exterior only, with a poster.

**Leidsebosje:** a grove of trees and benches between the theatre and the Vijzelstraat; it was empty paving before.

**People:**
- **Bram** (doorman): Jordaan in the morning, the Café De Zon terrace at lunch, the snack wall at 18:00, the club door from 21:30.
- **Yara** (DJ): record digging at Groove Dealers Platen in the afternoon, Het Hoekje at 19:00, the booth from 22:30.
- **Joris** (street performer): his pitch from 11:00, Vuurvlieg at 18:30, the fire show from 20:30.
- **Yara's errand:** she is starving before her set. Bring her a kroket from the wall: you get +10 and you are on her guest list that night.
- **Getting home:** Bram's 4th answer covers it: tram 2 or the fietstaxi, and no riding after a drink.
- **Crowds:**
  - night walkers;
  - terrace sitters;
  - the club queue (22:20-02:30);
  - dancers;
  - drinkers outside the bars;
  - a ring watching Joris;
  - staff at the counters.

**Sound:** the club uses an existing playlist (Jungle Dub). There is no new audio.

**Save:** new optional fields in `S.ams.lp` only: `band` (wristband expiry), `guest`, `nights`, `dances`, `yara`, `kar`, `chess`, `tips`, `tram2`, `fiets`.

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
| District 2: connected, built, shops, museum + trail, park life, jam, tram, save | AUTO-TESTED | 6 extra steps in `suite_amsterdam` (142/142 in total); routes Dam -> museum passage -> Museumplein -> Vondelpark and Jordaan -> park gate; the trail's +30 and poster; the 13:00-19:00 jam |
| District 3: Leidseplein connected, club (hours, wristband, gate, dance, bar, booth), bar alley, Yara's guest list, tram 2, fietstaxi, save | AUTO-TESTED | 6 extra steps in `suite_amsterdam` (214/214 in total); routes Jordaan/Dam/museum/Vondelpark -> Leidseplein and into the club |
| Mobile, human playtest | **NOT DONE** | |

**District 3, measured on mains power (real GPU, Medium, at 23:00):** the square 58.8 fps with 201 draw calls (the busiest view: neon, crowds, tram, terraces), the club 60.4 fps with 198, the bar alley 60 fps with 122. One sample each; the club and alley sit at the 60 fps cap, so for those two it shows only that there is headroom on this laptop, not how much.

**District 2, measured on mains power (real GPU, Medium):** museum front, Museumplein and Vondelpark all hit the 60 fps cap. Draw calls were 83, 95 and 57; the Damrak and the Jordaan stayed at the 60 fps cap with 112 and 99 draw calls. This is a capped measurement, so it shows only that there is headroom on this laptop, not how much.

**District 1, measured on the real GPU at Medium, one sample each:**
- Arrival: 51 fps, 72 draw calls.
- Damrak: 52 fps, 78 draw calls (a later battery run: 58 fps, 51 draw calls).
- Jordaan lane: 38 fps, 146 draw calls (a later battery run: 46.8 fps, 127 draw calls). Crowds plus dense houses make this the weakest spot.

## Not built yet (honest)

- **Districts:** Rembrandtplein, NDSM/Noord (ferry) and the Bloemendaal beach trip are future districts.
- **District 3 interiors:** only Club Nachtegaal is walk-in. The bars, cinema, hotel, theatre and Het Lichthuis are shopfront counters or exteriors. The dance is a menu action, not a player animation.
- **Terrace sitters:** they use the crowd's existing sitting pose, which sits low, so people at the terrace tables look as if they are kneeling.
- **District 2 interiors:** only the museum gallery is walk-in. The Klankgebouw and Museum Nu are exteriors, and the brand shops are counters at the shopfront. The plantsoen square and the area east of the museum are light on detail.
- **Gallery lighting:** the hall has no dedicated light, so its side walls read dark. The paintings are lit by their own material.
- **Interiors (district 1):** only the three walk-in shops have them. Other shopfronts are counters or set dressing.
- **Bridge clearance:** canal-boat clearance under the bridges is visual only; boats follow a fixed tour route.
- **Original music:** none for Amsterdam yet. The venues use existing playlists.
- **Not checked:** no mobile check or human playtest.
