# Apeverse clothing stores (M6)

In-game clothing only. Everything is bought with in-game credits; there is no real-money checkout.

## What is in the game

**Four brands, spelled exactly:**
- **APEVERSE**
- **MOONMELT SUPPLY CO.**
- **SOLTERRA**, as confirmed by the owner on 25 Nov 2026. It is never spelled SOLVERA.
- **ZtonedApe**

**SWAG** (the fifth brand in the 2.0 brief) is **blocked: no SWAG artwork exists on this laptop.** See the list at the end.

**43 designs.** Each comes as a T-shirt (70 credits) or a hoodie (120 credits), in 6 fabric colours and sizes S–XL.

| Collection | Brand | Designs | Source quality |
|---|---|---|---|
| Cosmic Campground | MOONMELT SUPPLY CO. | 5: Stay Mellow, Cosmic Campout, Dream Route, Slow Orbit, Low Tide High Mind | owner originals (merch drop 001) |
| World Tour | APEVERSE | 8: Tokyo, Sevilla, Chefchaouen, Cádiz, Medellín, Rio de Janeiro, Oaxaca, Paris | owner originals (merch drop 001) |
| Sunshine Cut-Paper | APEVERSE | 6: Coastal Daydream, Sun & Moon, Tropical Fruits, Blue Tides, Sunny Groove, Ape Summer | owner originals (23 Nov drop) |
| City Souvenirs | APEVERSE | 8: Chiang Mai, Madrid, Da Nang, Pai, Barcelona, Ibiza, Amsterdam, Same Sky Different Places | **384 px cells cut from concept sheet 1000019548** |
| SOLTERRA Originals | SOLTERRA | 8: More Sun Less Worries, Bloom Where You Are, Good Energy Club, Nature Heals, Slow Travel, Stay Wild, Life Is Better Outside, Good People Better Days | **384 px cells cut from concept sheet 1000019548** |
| Sunshine Series (no wordmark) | SOLTERRA | 4: Waves, Cat Nap, Evening Breeze, Sunny Cat | owner originals with **no brand printed**; placed under SOLTERRA by me (see below) |
| ZtonedApe Underground | ZtonedApe | 4: Boombox Bud, Ztoned DJ, BAMB (polka letters), BAMB (white letters) | owner originals in `Documents` (2–4 k px PNGs) |

**ZtonedApe source files** (read only, never moved):
- `ztonedape tshirt design bud.png`
- `ztoned ape dj drawing png.png`
- `bamb tshirt design 1 ztoned ape.png`
- `bamb white leteers ztoned ape tshirt.png`

Two of them print the word **BAMB** rather than "ZtonedApe". Their file names call them ZtonedApe T-shirt designs, so they are sold as ZtonedApe "BAMB" designs. The artwork is unaltered.

**Held back, not sold:** `1000019536.png` (Dance Night) and `1000019540.png` (Blue Siesta). Their artwork prints the word **SOLVERA**, so I did not sell them under the SOLTERRA label.

**Files and hashes:**
- Every design keeps its source file name and SHA-256 in `data/merch_catalog.json` and `assets/merch/SOURCES.csv`.
- In-game textures are 512 px JPEGs (`assets/merch/tex`) with 256 px thumbnails (`assets/merch/thumb`), 3.5 MB in total.
- The originals stay where you keep them (Downloads ZIPs, Documents). They are not copied into the repository.

## The stores

| Store | World | Where |
|---|---|---|
| APEVERSE concept store | Ape Town | by La Finca market |
| MOONMELT SUPPLY CO. | Pai | a lot off Walking Street |
| SOLTERRA | Madrid | a frontage by Puerta del Sol, its back against an existing building, out of the plaza |
| ZtonedApe | Jungle Dub | by the sound system, on a levelled plinth |

**What every store has:**
- A shopfront with a lit brand sign, an awning and display windows.
- A tee rail and a hoodie rail of hanging shirts, each with its print.
- A table of folded stacks and framed posters of the artwork.
- A mannequin wearing a store design.
- A cashier counter with a staff member: Nia, Juno, Lucía or Kush.
- A fitting room. Its mirror shows **you (Ztonedape)** wearing whatever you choose to try on.

**Placement:** sites are chosen by a deterministic finder (`js/merch.js`). It rasterises colliders, roads, ground height and no-go zones into a 0.5 m grid once; this takes 50–630 ms per store, measured. A site must be:
- walkable, with a gentle slope (up to 0.5 m); the store is levelled on a plinth
- clear of every collider, prop and plant (including instanced flowers and rocks)
- at least 3 m from mapped roads, so stores never sit on sidewalks or carriageways
- away from interactions and the spawn point
- open at the door

In a city the back wall must lean on an existing building, so the store fills a street frontage. The village, rural and festival lots are free-standing. The store, its door apron and its interior are kept clear of scattered decoration and the Wandering Market.

## Buying, wearing, keeping

- **Buying:** use the counter, a rail, or the fitting room. Choose a design, T-shirt or hoodie, a fabric colour and a size, then "Try on (mirror)" or "Buy".
  - The purchase uses `AV.txn` and is refused when credits are short.
  - The item goes into the backpack as `wear_<design>_<garment>`.
  - You are wearing it straight away.
- **Wearing from the backpack:** "use" on a clothing item puts it on. It is not held in the hand.
- **What gets saved:** the outfit is `AV.S.wear {design, garment, color, size}` and is saved with the game.
  - It survives reloads and world changes.
  - Older saves without clothing simply have no outfit.
  - The HUD shows what you are wearing.
- **Real-world store:** shown as "not available yet". `realWorldUrl` is `null` on every design. Nothing collects payment data.

## How the clothes look

- **The print is on the actual garment.** The character shirt shader projects the design onto the chest, so it moves with the body. It is not a floating card.
  - The artwork's paper or black background is keyed out in the game, so it reads as a screen print on the fabric colour.
- **Hoodies** are a longer-sleeved, looser cut of the same body. **There is no hood geometry yet.**
- **Townsfolk:** about 9–10% of anonymous townsfolk and crowd walkers wear a store design, with 20–30 different designs per run.
  - They favour their own world's designs: MOONMELT in Pai, SOLTERRA in Madrid, ZtonedApe in Jungle Dub.
  - Named characters keep their own looks, and so do suits, robes and patterned shirts.
- **First person:** you cannot see your own body. You see your outfit in the fitting-room mirror and in the HUD.

## Verification

`tools/tests/suite_merch.js`, real GPU: **92/92**.

**What it covers:**
- **Catalogue:** four exact brands, no SOLVERA anywhere sellable, 86 textures loading, item registration.
- **Each of the 4 stores:** built, the site found in under 1.5 s, the counter, both rails and the fitting room reachable from the door, on the map.
- **Buying:** refused without credits, buy and wear, the HUD line, and the panel on screen and staying open.
- **Fitting room:** the mirror reflection wears the chosen print.
- **Backpack:** wearing from the backpack doesn't leave the shirt in the hand.
- **Saving:** save and load via a sandbox key, an old save without clothes, your real save untouched.
- **Across worlds:** the outfit persists from world to world. SOLTERRA sells only SOLTERRA, and ZtonedApe sells its 4 designs.
- **Townsfolk:** a minority wear designs, with variety.
- **FPS:** about 60 inside the stores (Medium).

**Regression:**
- `suite_integration` 124/124, `suite_madrid` 79/79, `suite_pai` 56/56, `suite_vienna` 77/77, `suite_cm` 76/76.
- **`suite_cm` fix:** it had briefly timed out the Portal Grove return while the first site finder was slow. The faster finder fixed it.
- **`suite_workers`:** 51/52. The miss is the known intermittent "resumes after the chat", which also occurs before M1.

**Pre-existing bug found and fixed:** the shared shop panel `#cmp` had no position rules and rendered *below the visible screen*. A probe measured its top edge at 764 px, exactly the viewport height. This affected every shop using it, including the café and vendor menus. Tests had missed it because they click buttons through the DOM. It is now centred, and `suite_merch` checks that it is on screen.

## Artwork I still need from you

1. **SWAG artwork:** the underground hip-hop / skate / surf streetwear designs. No SWAG files exist on this laptop (searched Downloads, Desktop, Documents and Pictures).
2. **SOLTERRA-lettered versions of `1000019536.png` (Dance Night) and `1000019540.png` (Blue Siesta).** The current files print SOLVERA, so they are held back.
3. **Full-resolution masters for the 16 sheet designs:** the 8 SOLTERRA Originals, the 7 City Souvenirs and Same Sky Different Places.
   - They come from 384 px cells of concept sheet `1000019548.png`, so they look slightly soft in the game.
   - They cannot be used for real printing.
4. **More ZtonedApe designs**, if you want a bigger collection. I used the four clearly named T-shirt designs.
   - Other ZtonedApe images on disk are photos, promos or variants: band photos, the profile picture, the sticker, and the "no contrast" DJ drawings.
   - `si-za collab tshirt design 1.jpg` is a collaboration, so I left it out until you confirm the rights.
   - I also left out `alejosfarm tshirt surf.png`, because its brand is unclear (could it be SWAG?).
5. **Your decision on the 4 unbranded "sunshine" images** (`1000019541/42/43/46`). I put them under SOLTERRA as "Sunshine Series (no wordmark)". Say if they belong to APEVERSE or another line.
6. **Confirmation on BAMB:** is it a ZtonedApe sub-line, or a separate brand?
7. **Optional:**
   - transparent-background PNGs
   - back-print artwork (only front prints exist)
   - individual files for the slogan sheet (`1000019547`) and the two mood sheets (`1000019549/50`), if you want them sold

## Adding designs later

1. Add the file to the job list in `tools/merch_assets.ps1`, then run `tools/merch_assets.ps1 -Repo <repo>`. It reads the owner ZIPs extracted to a quarantine folder plus the listed Documents files, and regenerates every 512 px texture, 256 px thumbnail and `SOURCES.csv` row with its source hash.
2. Add one line to `META` in `tools/build_merch_catalog.mjs`.
3. Run `node tools/build_merch_catalog.mjs`.

The shops, items and NPC pool pick up new designs automatically. A new brand needs one entry in `SHOPS` in `js/merch.js`: its world, anchor, colours, sign and staff.
