# Apeverse 2.1: system status board + Phase 0-2 progress (26 Nov 2026)

Source brief: `APEVERSE_21_LIVING_MULTIVERSE_OVERHAUL_20261126` (kept outside the repo, as asked). Branch `apeverse-2-living-worlds`.

**Status words.** These are used strictly:
- **AUTO-TESTED ONLY:** an automated probe did it in the real game on the GPU (laptop, Medium). That is not a human playtest.
- **PARTIAL:** it exists but is missing part of the chain.
- **MISSING:** nobody has found it in the game.
- **VERIFIED BY HUMAN:** nothing is marked this way yet. That needs the owner's playtest.

> **Update (Phase 3):** Brand Row and the ApeMart Express / PuffPop rollout are built. See `docs/BRAND_DISTRICT.md`, `docs/BRAND_RECONCILIATION_21.md` and the living priority list in `docs/APEVERSE_21_PRIORITIES.md`.

## Failures and gaps first

### Still open after this milestone

| Gap | Where | Next action |
|---|---|---|
| No fictional effects item for sale | **Da Nang, Judean Desert** | This is deliberate under the local rules: alcohol only (Bia Larue, beer), plus a non-substance alternative (sunbed rest, Dead Sea float, sage tea). Needs the owner's OK, or a fitting fantasy item. |
| No hired transport | **Verdalux** | A 3-place walking moon with a portal gate. A ride there would be fake, so it has none on purpose. |
| No dedicated food vendor in the Koh Tao probe | **Koh Tao** | The Firefly Beach Bar has table service (sit and order: tested in `suite_consume`), and the new Sairee Leaf Shack sells coconut, shakes and water. The audit probe can't pass adults-only notices or sit at tables, so its row under-reports. |
| Taxi stand in the Pinar barrio | **Madrid** | Its street isn't connected to the main road map, so the taxi waits on the nearest main street (shown as "your ride waits on the main street, N m") rather than driving down a 1.5 m footpath. Connecting the barrio streets to the grid would fix it properly. |
| Pre-existing test failures | `suite_gfx` (4) | The four "other worlds: no post-processing" checks. Unchanged and not hidden. |
| Pre-existing test failures | `suite_pai` (1) | "Ambience stops outside Pai" has failed since M13, because Jungle Dub now has its own ambience. It fails the same way on `e67d3a4`. The test expectation is stale. |
| Pre-existing test failures | `suite_jlm` | Written for an older test-runner interface (no `names()`), so it can't run. |
| Arrival frame rate on Medium (laptop) | **Da Nang** 29.6, **Ape Town** 39.2 (687 draw calls), **Jungle Dub** 40 | One sample each, not an A/B. Ape Town's 500+ unmerged static meshes are the next performance milestone. |
| Not built yet | | Signage pass (beyond the new stalls and club), Brand District, Amsterdam. |

### Fixed in this milestone

1. **Every taxi or shuttle stand used to fade and teleport you**, in all 9 worlds that had one, and so did the map's 🚕 button. **Now the vehicle drives you there.** Details below.
2. **There was nowhere to buy a fictional effects item** in Madrid, Pai, Koh Tao, Koh Samui and Jerusalem. Each now has a source that fits the world.
3. **There was no food or drink vendor** in Koh Samui or Verdalux. Each now has one.
4. **There was no hired ride** in Koh Tao, Jerusalem or the Judean Desert. Each now has a taxi.
5. **A UI error** (`v1_systems.js:49`) fired when a talk panel's option was clicked after the panel had closed. It's now guarded.

## World-by-system board (`tools/tests/suite_audit21.js` + `tools/audit_board.mjs`)

**How the probe works.** It presses every interaction in the world once (travel and rides are stubbed) and clicks the buttons of any panel that opens. It buys everything an `AV.shop` vendor sells, then runs each kind of item through the use chain: in the backpack, the first-person animation, the effect, visuals off, then clear.

**What it cannot do:** pass adults-only or membership notices, or sit at tables. Those paths are covered by `suite_sources` and `suite_consume`.

| World | Food / drink | Alcohol | Fictional effects | Hired ride | Other transport | Festival | Arrival (Medium) |
|---|---|---|---|---|---|---|---|
| Madrid | AUTO: tapas, churros, fruit, café | caña, vermut | AUTO (suite_sources): **La Nube** members' club | AUTO: taxi drives the streets, stops at red lights | bike, e-scooter, moto, car-share; owned car and scooter (M7) | none yet | 54 fps · 133 calls |
| Ape Town | AUTO: coconut (+ bar shift) | beer | AUTO: glowing mushroom | AUTO: free shuttle | e-scooter, bike | Hanging Bazaar | 39 fps · 687 calls |
| Chiang Mai | AUTO: khao soi, sai ua, shakes, tea… | beer | AUTO: pre-roll, pipe, mushroom | AUTO: songthaew + its own tuk-tuk rides | scooter, tuk-tuk you drive, bike | modes (Songkran, Loy Krathong, Yi Peng) | 46 fps · 338 calls |
| Pai | AUTO: bowls, curry, roti, shakes | beer | AUTO (suite_sources): **Pai Herb Corner** | AUTO: pickup taxi | scooter, bike; minivan to Chiang Mai | none yet | 48 fps · 227 calls |
| Astro-9 | AUTO: nebula tea, glowfruit, dumplings… | cosmo, beer | AUTO: alien jelly, mocha, crystal, moss | AUTO: hover cab flies the route | hover scooter, hover bike, metro | none yet | 48 fps · 349 calls |
| Jungle Dub | AUTO: coconut, mango, tea | beer | AUTO: pipe, mushroom | AUTO: buggy shuttle (was "canoe ferry") | bike | none yet | 40 fps · 402 calls |
| Vienna | AUTO: strudel, torte, Käsekrainer… | Melange, spritzer | AUTO: shisha | AUTO: black taxi | bike, e-scooter | none yet | 60 fps · 145 calls |
| Da Nang | AUTO: bánh mì, cà phê, seafood… | Bia Larue | **PARTIAL:** alcohol only (local rules) | AUTO: xe ôm (you ride pillion) | bike, scooter | none yet | 30 fps · 461 calls |
| Koh Tao | table service (suite_consume); Leaf Shack drinks | at tables | AUTO (suite_sources): **Sairee Leaf Shack** | AUTO: songthaew taxi (new) | ferry (labelled travel) | Sairee Fire Night | 60 fps · 190 calls |
| Koh Samui (Jurassic) | AUTO: **Ranger Snack Hut** (new) | beer | AUTO: cave mushroom, once a day (new) | AUTO: ranger jeep | jeep hire | none yet | 60 fps · 104 calls |
| Jerusalem | AUTO: hummus, falafel, rugelach… | (Avi's beer) | AUTO: **Café Nargila** (new) | AUTO: taxi (new) | light rail, bus 486 (labelled travel) | none yet | 46 fps · 282 calls |
| Judean Desert | AUTO: dates, water, sage tea | beer | **PARTIAL:** none, by design | AUTO: desert jeep (new) | cable car, camel, bus | none yet | 49 fps · 236 calls |
| Verdalux | AUTO: **Vela's Forage Basket** (new) | - | AUTO: glow-moss, mushroom pickups | **MISSING**, on purpose | walking moon | none yet | 60 fps · 208 calls |

**Checked in every world:**
- **Use chain:** each consumable bought shows the first-person animation, and the right effect starts (`drink`, `smoke`, `psy` or `glow`).
- **Visuals off:** turning off intoxication visuals leaves the canvas filter empty while the effect timer keeps running.
- **Clear:** clear removes every effect.
- **Save:** a save followed by a `loadSave` roundtrip keeps items and credits. This used a sandbox key; the player's real `apeverse_v09` save was checked and left untouched.

**Not verified:** a full page reload, the mobile layout, and a human playtest.

## Phase 2a: hired rides that actually drive (`js/rides.js`)

**How a ride works:**
1. **Booking:** a stand (or the map's 🚕 button) charges the fare.
2. **Pick-up:** a short step-in fade, then the world's own vehicle pulls away with you in it.
3. **Route:** on the street network where the world has one, with roads split at every crossing and the right-hand lane kept (left in the Thai worlds). The car stops at Madrid's red and amber junction lights. Elsewhere it follows the walkable route finder, densified so it can't cut corners into walls.
4. **Width rule:** cars only take mapped streets at least 7 m wide. If no car-wide way exists, the taxi waits on the nearest main street and says so.
5. **Traffic and people:** it stops for traffic cars, and for pedestrians honks, waits about 3 s, then edges past at walking pace (the instanced crowds can't step aside).
6. **View:** a chase camera follows the vehicle by default; open-back pickups and songthaews use the bench seat. Mouse looks around, C switches view.
7. **Controls:** F or ARRIVE skips to arrival (labelled, never the default). Esc pulls over, you get out there, and the unused part of the fare is refunded.
8. **Arrival:** you step out on the kerb side, onto free ground; a GPS waypoint covers any remaining walk.

**Vehicle per world:**
- Madrid: white taxi with the red stripe and green roof light
- Chiang Mai: red songthaew
- Pai: pickup taxi
- Da Nang: xe ôm
- Ape Town: electric shuttle
- Koh Samui: jeep
- Astro-9: hover cab, 2.6 m up
- Jungle Dub: buggy
- Vienna: black taxi
- Koh Tao: blue songthaew
- Jerusalem: white taxi
- Judean Desert: jeep

**`suite_rides`: 192/192 checks pass, in 12 worlds.** Each ride must show:
- the fare paid
- a real vehicle in the world
- the vehicle moving
- you staying inside it (at most 1.6 m from its centre)
- no per-frame jump over 3 m
- no frame off the ground or inside walls
- arrival within 15 m of the place, or skip and cancel working, and standing on free ground afterwards

**Madrid's full drive:** 384 m along the avenues in 58 s, with 1 red-light stop. An earlier run of 461 m took 89 s with 3 red-light stops.

## Phase 2b: consumable sources (`js/consume_sources.js`)

All of these reuse existing item ids, so there are no duplicate products. They are fictional and abstract: no real-world sourcing or dosing information anywhere.

**Madrid: La Nube, a fictional members' social club on Calle Malasaña.**
- **Street front:** a bottle-green door, a frosted window with lettering, a brass members' plaque, and an enamel blade sign under the awning, lit at night.
- **Lounge:** you step in to a tiled lounge with sofas, a counter, shelves of plain tins, house rules on the wall and Rocío behind the bar.
- **Membership:** a one-off 15 credits, adults only. Smoking is allowed inside.

**The other new sources:**

| World | Source | Sells | Notes |
|---|---|---|---|
| Pai | Pai Herb Corner (Thai ร้านสมุนไพร, "herb shop") | pre-roll, herb, pipe, tea, water | adults 20+ notice first |
| Koh Tao | Sairee Leaf Shack | pre-roll, herb, pipe, coconut, shake, water | adults 20+ notice; "never before diving" |
| Jerusalem | Café Nargila (Hebrew נרגילה) | nargila (new item), mint tea, cardamom coffee, water | |
| Koh Samui | Ranger Snack Hut | coconut, mango, snacks, water, beer | plus a glowing cave mushroom, once a day |
| Verdalux | Vela's Forage Basket | coconut, snacks, water | |

**What each stall is:** an authored sign (auto-fitted, local script), an awning in its own colours, a counter, goods and crates. It is placed on free ground beside a named place, with a collision box and a clear front.

**Not yet done:** these are still stalls, not the full storefront pass the brief asks for. That is the Phase 4 signage work.

**`suite_sources`: 65/65 checks pass.** It covers the door, entering the lounge, membership, buying, the use animation, the effect, visuals off, clear and leaving, in 6 worlds.

## Regression on this commit (GPU, Medium, one suite at a time)

| Suite | Result |
|---|---|
| rides | 192/192 |
| sources | 65/65 |
| integration | 131/131 |
| consume | 47/47 |
| cm | 76/76 |
| kohtao | 42/42 |
| drive | 39/39 |
| vehicles | 52/52 |
| gps | 88/88 |
| phone | 43/43 |
| pai | 55/56 (the pre-existing failure above) |
| audit21 | 107/111 (the probe limits and by-design gaps above) |

## Brand and world reconciliation (first pass, for Phase 3 and Phase 6)

**Brand registry, 64 names.** These already exist in game code:
- APEVERSE, ZtonedApe, MOONMELT SUPPLY CO. and SOLTERRA: the M6 shops and catalogue
- Groove Dealers: festival poster and film only. There is no record shop yet.
- ApePhone: the working phone UI. Don't overwrite it.
- Club Graviton: Astro-9
- Hanging Bazaar: M14

The other ~56 names (Woblr, Zippit, KongKart/KongRide, Bambu, ApeMart, PuffPop, Monkey Brew, Chillbnb…) are concept only.

**Naming collisions to log for the owner, not to merge:**
- KongKart vs KongRide
- Bambu Motors vs Bambu Electric Mobility
- NanaPhone vs NanaNa
- Wobble Club vs Woblr Motors
- Cosmic Cables vs Cloud Cables
- "Banana Republic" (a real brand) needs a new fictional name

**Brand boards.** The 12 files are **WebP images with a .png extension**, 1536 px concept sheets. They are reference only, not production textures.

**World queue:** 13 playable and 17 planned in the registry. The 22 atlas maps are reference illustrations only; none is a playable world. Amsterdam, then Tokyo, come after the cross-world systems are stable, as the brief orders.
