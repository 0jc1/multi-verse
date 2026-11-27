# Paris: the Seine and Saint-Germain (Apeverse 2 New Worlds, agent 2)

**Code:**
- `js/world_paris.js`: builds the city: the Haussmann kit, the French sign atlas, the river, quays, bridges, streets, landmarks and the Fête decorations.
- `js/paris_life.js`: runs it: people, traffic, shops, the cave, rides, the garden, the festival, conversations and the registrations.
- `js/nw_kit.js`: shared helpers for the new worlds: the sign atlas, quads, the row walker and walk-in interiors.

**Test:** `tools/tests/suite_paris.js` runs the release gate on the real GPU:

```
powershell -ExecutionPolicy Bypass -File tools\tests\run_tests.ps1 -Suite tools\tests\suite_paris.js -Gpu -W 1536 -H 864 -Port 8098 -StepTimeout 900
```

**World id:** `paris`.

**Sources:** the owner's illustrated "Apeverse Paris: Psychedelic Landmark Map" is a mood and POI reference only. **Every business is fictional.** Landmarks are public places: the Seine, the Pont Neuf, the cathedral, the church, the Luxembourg garden, the Eiffel Tower and the street names.

## What you can do

**Arrive** on the south quai, by the bouquinistes and the portal, looking downstream at the Île and the cathedral.

**Walk:**
- **The Seine:** real water between 4.5 m stone quay walls, with parapets. You cannot fall in.
- **Bridges:**
  - the **Pont Neuf**: stone arches, round bastions, lanterns;
  - an iron **footbridge** with a timber deck;
  - two bridges onto the **Île**: the cathedral parvis, an ice-cream kiosk, plane trees and benches.
- **The south bank:** the quai → three cobbled streets (Rue Dauphine, Rue de Seine, Rue Bonaparte) → the **Boulevard Saint-Germain**. From there:
  - the **Place** with café terraces;
  - the **church** with its Romanesque bell tower;
  - **Rue de Buci**, the market street;
  - the north corner of the **Luxembourg garden**: lawns, the pond with toy sailboats, green chairs, the palace front.
- **The north bank:** a quai row you reach over the bridges or by métro.
- **Eiffel Tower:** a lattice tower on the western skyline. It is scenery only: it sparkles at night, and you can't walk to it.

**Architecture:**
- **About 315 Haussmann buildings:**
  - rusticated ground floors with painted shopfronts, gold lettering and striped awnings;
  - cream limestone, tall French windows, lit at night;
  - continuous iron balconies on the 2nd and 5th floors, cornices;
  - zinc mansard roofs with dormers and chimney pots.
- **Signs:** about 600 sign faces from one 2048² atlas.
- **Street furniture:** Guimard métro entrances, Morris columns with posters, a Wallace fountain, plane trees, lanterns, benches, and blue street plaques.

**Businesses** (all fictional; walk-in means through the door to an interior):

| Business | Type | Sells / does |
|---|---|---|
| Café des Singes (the Place) | walk-in, plus terrace service | petit noir, chocolat chaud, croissant, croque, wine, kir |
| Le Caveau des Singes (Rue de Seine) | walk-in jazz cellar, 21:00-03:00 | entry 10 (or the guest list); band; swing dance; bar; a **piano you can play** (shared instrument activity) |
| Au Pain Doré (Rue de Buci) | walk-in boulangerie | baguette, croissant, pain au chocolat, macarons |
| Librairie La Page Volante (quai) | walk-in bookshop | novels, postcards, posters |
| Brasserie Le Zinc, Macarons Rose-Thé, Fromagerie Mère Lune, Crêperie Ty Ape, Les Fleurs de Buci, Tabac · Presse | counters | steak frites, macarons, Comté, galettes, cider, peonies, berets |
| Groove Dealers Disques, SWAG Paris | brand shops | records; the SWAG merch UI |
| Glacier de l'Île | kiosk | ice cream |
| Bouquinistes | 4 stalls you can buy from (the rest are dressing) | old books, vintage posters, postcards |
| Vél'Ape | counter | rent a bike outside; buy a city bike, an e-scooter or a Vespa-style scooter |

**Getting around:**
- **Bateaux-Singes river cruise:** round the Île and under the bridges, 12 credits. It is visible on the water, with the chase camera.
- **Métro:** between the two Guimard entrances (Saint-Germain and the north bank), 2 credits. It is a fade, with no tunnel to ride.
- **Taxis.**
- **Traffic:** cars, scooters and bikes on the quais and the boulevard (the shared city traffic).

**Other things to do:** Léa paints your portrait (10), you can rent a toy sailboat on the pond (2), and you can look at the cathedral and listen to the church bells.

**People:**
- **Named residents:**
  - Margaux (café owner);
  - Bastien (jazz pianist): the record shop, then the Place, then the cave;
  - Inès (bouquiniste);
  - Hugo (boat captain);
  - Léa (painter).
- **Daily routines:** they walk between their places when you're near.
- **Conversations:** 4 choices each, and each can do something.
- **Crowds:** pedestrians, terrace sitters, a waiter doing his rounds, staff, the cave audience and band.

**Story mission, "Inès's poster":**
1. Inès hands you a rolled poster (it goes into your backpack, and a waypoint appears).
2. Deliver it to Margaux at the Café des Singes.
3. You get +30, a box of macarons, and the guest list: free cave entry that night.

**Fête de la Musique:** every Saturday, 16:00-02:00 on the Apeverse calendar.
- **On the Place:** a stage with a band. The headline runs 20:00-23:00, with a dancing crowd.
- **Around the quarter:** buskers on Rue de Buci, the quai, Rue Dauphine and the boulevard, and bulb garlands.
- **Joining in:** play along at the stage for tips, or use the ukulele (shared instrument activity).

**Sound:**
- **Positional playlists, all existing:** the cave and the stage (Stone Ape Band), the Buci busker (Chiang Mai).
- **Ambience preset (procedural):** the river, traffic, crowd, church bells, doves, garden birds and fountain, café clinks, crickets at night.

**Save:** a new optional `S.paris` holding `met`, `q.poster`, `boat`, `metro`, `cave`, `guest`, `gigs`, `dances`, `portrait`, `sail`, `fete` and `nd`.

## District 2: Montmartre (paris_montmartre.js)

**How you get there:** métro line 12, from the Saint-Germain entrance to Abbesses on the Boulevard de Clichy (2 credits; there is no tunnel to ride).

**A real hill:** the ground is a terrain mesh rising 44 m to the summit.
- **Buildings:** they sit on stone plinths into the slope.
- **Pedestrians:** they follow the ground (tested: 28 walkers, none off the surface).
- **Walking:** you climb it on foot.

**What's there:**
- **Boulevard de Clichy:** flat, with a tree-lined median, Haussmann rows, Pigalle neon, Brasserie Le Clichy and Guitares Pigalle.
- **Le Moulin Violet:** a cabaret front with marquee bulbs and a windmill whose sails turn.
  - **The revue:** 21:00-01:00, 20 credits (or Théo's guest list). 50 minutes pass, and you get a programme.
  - **Music:** cabaret music near the door at night.
- **Rue de Steinkerque:** Souvenirs de Montmartre (berets, postcards, snow globes) and Beaux-Arts Pinceau (paints, sketchbooks).
- **The garden on the slope:** lawns, trees, and the long staircase with handrails. The **funicular** beside it runs both ways (2) and climbs visibly.
- **The summit:**
  - the **terrace** with the view over Paris;
  - the **white basilica**: domes, campanile, portico, two bronze riders. Light a candle (1).
- **Place du Tertre:** village houses with coloured shutters, painters at easels, café tables under red umbrellas.
  - **La Bohème des Singes:** crêpes, vin chaud, chocolat.
  - **Margot:** paints your portrait (12).
- **Rue Lepic:** winds back down to the boulevard.
- **The vineyard** and **Au Lapin Sage** (a pink cabaret cottage): chansons 21:00-02:00, with music near it.
- **Named residents:** Margot (painter), Théo (Moulin doorman) and Rosalie (chanson singer), with routines and 4-choice conversations. Théo puts you on the guest list once you know Margot and Rosalie.

**Story, "Margot's violet":**
1. Margot is out of cobalt violet.
2. Buy a tube at Beaux-Arts Pinceau.
3. Bring it to her: +20, and a free portrait.

**Save:** `S.paris.mm` holds `met`, `q.violet`, `funi`, `candle`, `view`, `portrait`, `freePortrait`, `revue` and `guest`.

**Rendering:** tiles carry a district tag. Only the district you are in is drawn; the Eiffel Tower shows in Saint-Germain only.

**Not built yet:**
- The revue and the chansons are a fade plus a toast, not a staged show.
- The basilica and the cabarets have no walk-in interiors.
- Montmartre's side streets are closed by village blocks.

## Not built yet (honest)

- **Interiors:** four walk-ins only. The other businesses are counters at the shopfront, and the church and cathedral are exteriors.
- **North bank:** one row of façades along the quai. No streets behind it yet.
- **Métro:** a fade between two entrances. There is no platform or train.
- **Districts:** Montmartre, the Marais, the Louvre, the Canal Saint-Martin, the Trocadéro and the Eiffel Tower itself (walkable) are future districts.
- **Dancing:** swing and the Fête dancing are menu actions.
- **Not checked:** phone emulation passes (`suite_newworlds_mobile`), but there has been no real-phone test and no human playtest.
