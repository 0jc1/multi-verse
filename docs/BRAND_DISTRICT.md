# Brand Row: the Apeverse Brand District pilot (2.1, Phase 3)

**Where:** Ape Town's east strip, between the Crystal Garden and Portal Grove (x 47–73, z −48 to 8). This is ground the town never used.
- A probe of the whole world confirmed that no business, interaction or path existed there.
- On the map it's the place **Brand Row**. The free Ape Town shuttle and the taxi menu list it.

**Code:**
- `js/brand_district.js`
- `data/brand_designs.js` (SWAG prints)

**Small hooks in existing code:**
- `vehicles.js`: the `woblr` vehicle kind and `VEH.extraGeo`.
- `housing.js`: `H.ORDER` is exported.
- `merch.js`: the artwork-quality label.

**Test:** `tools/tests/suite_brand.js`, **123/123** on the real GPU.

## The six shops (walk in through real door openings; no teleport)

| Shop | Architecture + sign | Sells | What the product does |
|---|---|---|---|
| **SWAG** | Purple stucco. Painted fascia board in a timber frame, cream graffiti lettering, neon crown on the roof edge. | 6 SWAG designs × tee 70 / hoodie 120, 6 fabrics, 4 sizes | **Wearable:** worn at once through the M6 clothing system, saved with the game, and some townsfolk wear them too. |
| **Groove Dealers** Records & Audio | Red brick. Vertical enamel marquee with bulbs on an iron bracket, vinyl-disc sign. | 3 LPs at 25 each, Groove Dealers Audio boombox 90 | **LPs:** the booth plays them. **Boombox:** plays the LPs you own anywhere, then the next one, then off. |
| **Monkey Brew** Taproom | Dark timber. Round badge on a bracket, gold fascia lettering, chalkboard menu outside. | Hazy Banana Ale 12, Jungle IPA 13, Tropic Ginger Kombucha 8 (alcohol-free), banana bread 6, water 1 | **Consumables:** the ales start the drink effect (gradual, can be turned off and cleared); kombucha and bread are animated drink and eat. |
| **Woblr Motors** | Glass showroom, canopy with backlit channel letters, Zip-EV on a turntable. | Woblr **Zip-EV** at 1500, in 5 colours | **A car you own:** parked on Brand Row, drivable (electric hum, chime horn), saved in the garage (Y). |
| **ApePhone Store** | White stone, backlit lightbox, display tables with lit phones. | 4 phone skins (30), ApeCam lens kit (45) | **Skins** restyle your ApePhone the moment you use them (classic restores it). **The lens** opens photo mode. |
| **SOLTERRA Living** | Terracotta stucco, hand-painted wall lettering, striped awning, furniture on display. | Rattan lounge chair 140, sunrise rug 80, olive planter 60, Glomotel mushroom lamp 85 | **Furniture:** goes into your home's furniture stock, ready to place. With no home yet, it waits and arrives at the first flat you rent or buy. |

**On the street:**
- **ApeMart kiosk:** bananas, noodles, BANANARCHY chips, PuffPop snacks, water.
- **Two PuffPop vending machines:** Banana Puffs, Tropic Fizz, Grape Fizz.
- **Zippit e-scooter dock:** rental, 4 credits until midnight.
- **Brand Row gateway arch and a map board.**
- **Staff:** a villager behind every counter (Rico, Dee, Hops, Mika, Ada, Marisol, Bo).

## Brand rules followed

- **The concept boards are references only.** No board is stretched onto a storefront. Every sign is lettered in code, following the board's direction: palette, letter style, mounting.
- **SWAG prints are labelled honestly.** They are original in-game lettering, marked "In-game lettering (not a print master)" in the store.
- **Distinct brands stay distinct:**
  - SWAG is separate from APEVERSE, ZtonedApe and MOONMELT.
  - SOLTERRA Living sells home goods only. The SOLTERRA apparel stays in the Madrid store, so no SKU is duplicated.
  - ApePhone (the working phone UI, untouched) is separate from NanaPhone (not used yet).
  - Woblr Motors is separate from Wobble Club.
  - Groove Dealers (band and label) and Groove Dealers Audio (records and audio gear) are treated as one company family. This is logged below for the owner to confirm.
- **"Banana Republic" is a real-world trademark,** so it is not used. Its snack line is now **BANANARCHY**.
- **The other worlds are untouched.** The existing APEVERSE merch store, cafés, stage and paths are unchanged.
- **Decor cleanup:** decorative plants already standing on the footprint (bushes, mushrooms, a palm that would have grown through Groove Dealers) are hidden **inside the footprint only**, including models that stream in later.

## Performance (real GPU, Medium, in-session A/B with the district shown and hidden, 3 alternations)

| View | Draw calls (hidden → shown) | Render CPU ms | FPS |
|---|---|---|---|
| In the street | 351 → 374 (+23) | 9.0 → 11.5 | 60.4 → 57.6 |
| Ape Town arrival (125 m away) | 732 → 737 (+5) | 16.3 → 16.1 | 43.3 → 42.9 |

**How it stays cheap:**
- **Merged geometry:** all static geometry is three merged meshes (solid, unlit glow, glass).
- **One sign atlas:** all 22 sign faces are quads in one 2048 px canvas atlas, so one draw call covers every sign. The test checks that every sign fits.
- **No new lights:** night lighting is emissive only.
- **Staff culling:** staff are drawn only within 45 m. A first version drew them from anywhere and cost +67 calls at the arrival; that was fixed.

**What these numbers show:**
- **At the arrival, the frame rate is unchanged within run-to-run noise.**
- **In the street,** the extra cost is real (about 2 ms of render CPU) but stays near 60 fps.

## Rollout to other cities (Tier B)

**"ApeMart Express" kiosk + a PuffPop vending machine** near the arrival in 7 cities: Madrid, Vienna, Chiang Mai, Pai, Koh Tao, Da Nang and Jerusalem.

**Placement rules:**
- clear of walking routes (the walking graph and crowd routes) and carriageways
- not under any roof or gate (an upward ray test)
- flat ground
- at least 7 m from any other interaction

The first version broke these: it landed in a bar terrace in Chiang Mai, in the Jaffa Gate passage, and on a Madrid sidewalk. That was found in screenshots and fixed.

**Local subline on each fascia:**
- Madrid: "supermercado"
- Vienna: "Supermarkt"
- Chiang Mai, Pai, Koh Tao: Thai "ร้านสะดวกซื้อ" ("convenience store")
- Da Nang: Vietnamese "Cửa hàng tiện lợi" ("convenience store")
- Jerusalem: Hebrew "מכולת" ("grocery")

**Stock:** the brand snacks plus one local staple the world already sells (café con leche, Almdudler, Thai tea, coconut, cà phê sữa đá, mint tea).

**Tested:** buy, eat and drink in all 7 cities.

## Not done yet (honest)

- **Interiors are fitted-out shells.** They have counters, displays, products and staff, but no wall materials yet.
- **Staff stand idle.** They don't serve or move around.
- **Groove Dealers recordings:** none exist on this laptop, so the LPs press the music that does exist (Jungle Dub, Stone Ape Band, Chiang Mai road tapes). No Groove Dealers LP is invented.
- **Other working businesses:** only six run so far. KongKart, Chillbnb, Bananazon, DubDash, NanaPhone, Palm Credit and the rest are not built. See `docs/BRAND_RECONCILIATION_21.md`.
- **Woblr dealers elsewhere:** the Zip-EV is sold only on Brand Row. Once owned, it is managed in the garage like any owned vehicle.
- **Not checked:** a mobile layout check and a human playtest.
