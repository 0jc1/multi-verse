# M14: Festivals (`js/festivals.js`), first slice

## Calendar

Game days now have weekdays (`day % 7`, Monday to Sunday). A festival has:
- a world
- a weekday
- a window, which may run past midnight

The state is **themed, not a real-world date**: no hardcoded "current" festival dates.

**API:** `AV.fest.active(id)`, `AV.fest.next(id)`, `AV.fest.headNow(id)`, `AV.fest.force(id, true|false|null)` (preview toggle).

The gig guide (Z → 🎸 Band & gigs → Gig guide) lists each festival: when it's on, the next date, and whether it's on now.

## Groove Dealers: Live at the Hanging Bazaar

**When and where:** Ape Town, every Saturday 18:00–03:00. The headline runs 22:00–23:30.

**What's there**, all built once and shown only inside the window:
- **Lantern festoons:** over the Lotus Stage audience terrace and the bazaar lane by La Finca.
- **Fabric canopies:** over the bazaar lane.
- **The Groove Dealers poster** (the owner's artwork):
  - on a 12 m screen behind the Lotus Stage, facing the audience
  - on two standing poster boards (terrace edge, bazaar lane), placed only on free ground away from the lane centre
- **"Vinyls from the Stars" stall:** sells the *Intergalactic* vinyl (40) and the poster print (25). Using the poster from the backpack shows the full artwork.
- **Festival crowd:** 4, 8 or 12 people by quality level. They dance during the headline.

**Headline night:**
- The headline replaces the Stone Ape Band's late set that night: no double attendance reward.
- The concert overlay names Groove Dealers.
- Catch 30 minutes of the headline for **+2 music reputation**, once per festival.

**Nothing blocks paths.** Festoons, canopies and the screen are overhead and add no collision. The boards and stall stand only on free ground.

### The artwork

- **Source:** `Groove_Dealers_anthropomorphic_a…_4K_202607311731.jpeg` (5504 × 3072) from the owner's Downloads.
- **Duplicate check:** `tools/art_intake.ps1` (SHA-256 plus perceptual hash against all 43 merch textures) found it **new**.
- **In the game:** `assets/fest/groove_dealers_hanging_bazaar.jpg` (1600 px, 510 KB) and a 400 px thumbnail. The source hash is in `assets/fest/SOURCES.csv`.
- **Not used:** the Groove Dealers videos in Downloads (personal media, never committed).

## Verification

`tools/tests/suite_fest.js`, real GPU, Medium (laptop on battery): **38/38**.

- **Calendar:** Saturday 20:00 is on, Sunday 02:30 is still on, Sunday 03:30 is over, Saturday 17:00 is not yet on, Friday is off.
- **Build:** arriving on a Saturday night, the decorations, screen, two boards and stall are all there. The poster texture loads, and the boards and stall stand on free ground off the lane centre.
- **Headline:** the whole festival crowd (8) dances. 46–47 fps at the stage with the festival up (battery).
- **Attendance:** +2 music rep, once.
- **Stall:** sells the vinyl and poster; the poster item shows the real 1600 px artwork.
- **Overlay:** the concert overlay names the headline.
- **Guide:** the gig guide lists the festival as on now.
- **Off-nights:** on a Monday everything is hidden and not interactive. The preview toggle works.
- **Persistence:** attendance and the poster item are saved; the real save is untouched.

**Regression (real GPU):** band 62/62, integration 124/124, music 43/43, dj 33/33, cm 76/76, home 61/61.

**Bugs found on the way:**
- **Double reward:** the Stone Ape Band late-set attendance and the Groove Dealers headline both paid on festival nights (+3). The headline now replaces the late set.
- **Overlay:** it still said "Stone Ape Band — live" during the headline.

## Not done yet

- **Performers:** the Groove Dealers characters (giraffe vocalist, Sloth MC, lizard drummer, flamingo trumpeter) aren't modelled. The stage shows the Stone Ape Band's characters, and the band appears on the poster and screen.
- **Music:** the headline uses the existing stage playlist. No Groove Dealers audio was verified as the owner's, so none was imported.
- **Other festivals:** only this one. Chiang Mai's existing Songkran and Yi Peng tools aren't on the calendar yet. Madrid and Vienna have none.
- **SWAG and SOLTERRA:** no new artwork had arrived when this was built. `tools/art_intake.ps1` is ready to check it for duplicates.
