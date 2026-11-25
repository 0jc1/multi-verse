# M11: Living NPCs (`js/residents.js`)

First slice: **ten named, persistent Madrid residents** with their own lives. They live alongside the anonymous crowds, the walkers and the M7C traffic. Older named characters (bar staff, shop clerks, the band NPCs) are unchanged.

## Who lives in Madrid

| Resident | Age | Job | Personality | Works at | Lives near |
|---|---|---|---|---|---|
| Carmen | 58 | baker | warm | the Panadería (Pinar) | Pinar |
| Javi | 34 | bartender | joker | Bar La Esquina | Pinar |
| Rosa | 45 | fruit seller | practical | the Frutería | Pinar |
| Marta | 71 | retired teacher | wise | Parque de Pinar (walks, bench) | Pinar |
| Pablo | 41 | mechanic | gruff | Autos y Motos Pinar (the M7 dealer) | Pinar |
| Kofi | 29 | busking guitarist | dreamy | Puerta del Sol; gigs at Sala Malasaña | Malasaña |
| Dani | 21 | student and skater | restless | Gran Vía (classes), Malasaña | Malasaña |
| Inés | 27 | graphic designer | curious | Malasaña | Malasaña |
| Yuki | 26 | travelling photographer | cheerful | Sol, Gran Vía, Cine Gran Vía | Sol (hostel) |
| Nacho | 24 | delivery rider | hurried | rounds between bakery, bar, fruit shop and dealer | Pinar |

**Looks.** Each resident has a fixed look: skin, height, hair style, beard, glasses, shirt and trousers. Named people never get random crowd prints.

**Places.** Workplaces are found in the live world:
- the `W.places` anchors
- the Panadería and Frutería interactions
- the dealer counter

Homes are building doors on residential blocks near each barrio anchor. A home is never a shop door, and two residents never share a door.

## Daily life

**Schedules.** Each resident has an hour-by-hour plan, for example:
- **Carmen:** bakes 6–14, lunch at the bar, a stroll in the park, chats in Pinar, home at 22.
- **Kofi:** busks at Sol 17–21, then plays Sala Malasaña until 2 am.

**Walking.** Within about 140 m of you, residents really walk:
- **Short trips:** A* over a 1.5 m walkability grid, checked against the real collision lazily. Carriageway cells cost 4×, so people keep to the sidewalks and cross streets short.
- **Long trips:** the city's pedestrian graph (sidewalk corners and zebra crossings), with grid paths at both ends.
- **Smoothing:** paths are smoothed by line of sight.
- **Speed:** walking pace is about 1.3 m/s.

**Away from you.** Residents are simulated: they are already wherever their schedule says.

**Visible behaviour.**
- They work facing the street.
- Two residents who meet stop and face each other.
- They turn to you when you talk.
- At home they go inside and are not drawn.

**Traffic.** Residents are listed with the pedestrians, so M7C cars stop for them.

**Cost.** Actors are built only within 95 m and disposed beyond 120 m.

## You and them

**Talk.** Walk up and press E. Each resident keeps a memory: met, friendship 0–100, last talk, topics, what they noticed, favours, invitations, hired.

What they say depends on context:
- **Greeting:** depends on the time of day and how well they know you. They introduce themselves when you first meet. They know "since yesterday" or "N days", and notice when you're back the same day.
- **Activity:** they talk about what they're doing right now.
- **Memory:** "Last time we talked about…".
- **Things they notice, once each:**
  - the brand you wear (any M6 design)
  - your shop by name, and its sales
  - your flat in 2B
  - your car

**Friendship.** It grows once per day of chatting (no grinding). Hearts show the tier at 10, 30 and 60.

**Actions.**
- **Ask about the job:** their day plan.
- **Any tips?** A local tip that puts a pink route on your minimap.
- **Favours:**
  - Carmen sends torrijas to Javi.
  - Javi sends bottles to Rosa.
  - Rosa sends cherries to Marta.
  - Pablo sends a spare key to Carmen.
  - Delivering pays credits and raises friendship on both sides plus the barrio reputation.
- **Invitations** (friendship 35 or more): tapas at Bar La Esquina at 21:00. They set off an hour early. Be there and friendship goes up by 15.
- **Hire** (Dani or Inés, friendship 30 or more): they join your M9 shop's staff. During opening hours they walk to work and stand at your counter as themselves, with no generic assistant. If you fire them from the shop panel, they go back to their own life.
- **Recruit** (Kofi, friendship 40 or more): joins your band. This is a stored flag; band play comes in M10.

**Community reputation.** `AV.S.rep = {barrio, business, music}`. It rises with meeting people, favours, dinners, hiring and recruiting.

**People panel (Z).** Lists everyone you've met with:
- their job and hearts
- what they're doing right now and where
- "works for you" and "in your band"
- a 📍 locate button

Someone you haven't met isn't listed.

**Save.** New optional fields: `S.npcs`, `S.rep`, `S.band`. No migration is needed, and old saves simply start empty.

## Verification

`tools/tests/suite_npc.js`, real GPU, Medium (laptop on battery): **84/84**.

- **Places:** ten residents; all places found; homes on free pavement, distinct, never shop doors.
- **Schedules:** Carmen bakes at 9, lunches at 15, sleeps at 3. Kofi busks at 19 and plays past midnight.
- **Simulation:** far-away residents are simulated at their workplace; actors exist only near you.
- **Walking:** Carmen walks from the bakery to the bar at 1.35 m/s, **0 samples inside a building**, getting closer.
- **First meeting:** introduction, friendship 5, +1 barrio reputation; no second gain the same day. She stops walking and faces you while you talk.
- **Next day:** "since yesterday", remembers the topic, friendship 10.
- **Noticing:** your SOLTERRA tee is noticed once.
- **Tips:** a tip sets a minimap waypoint.
- **Favours:** the favour pays exactly 40 and raises both friendships and the barrio reputation.
- **Invitation:** Carmen sets off an hour early, reaches the bar, and the dinner adds 15.
- **Chatting:** two residents chat outside the bar in the evening.
- **Hiring:** Dani is on the staff list, walks to your counter at 11:00, and no duplicate body appears. Firing him returns him to his schedule.
- **Recruiting:** Kofi joins the band and the music reputation rises. Non-musicians aren't asked.
- **People panel:** lists the people you've met, hides strangers, and shows the statuses; locate works.
- **Night:** at 03:00, residents are home and not drawn.
- **Persistence:** the save round-trip keeps npcs, rep and band. After Chiang Mai and back, the residents return with their memory.
- **FPS:** 33–54 at Sol in the evening across runs (battery; noisy, so this is not a performance claim).
- **Regression (real GPU):** biz 46/46, traffic 26/26, madrid 79/79, integration 124/124, home 61/61, drive 39/39, vehicles 52/52, merch 92/92, cm 76/76.

**Bugs found on the way:**
- **No walking graph in the Pinar barrio.** Madrid's pedestrian graph covers only the big street grid, so the first routes cut straight through buildings (15 of 16 samples). This led to the local grid A*.
- **Slow headless runs.** At 0.8 fps nobody moves inside the test windows, so this suite is real-GPU only.
- **Late arrivals.** Invitations used to start at 21:00, so the resident arrived late.
- **Not stopping to talk.** A resident walking somewhere kept walking while you talked; now they stop and face you.
- **Doubled staff.** A hired resident plus the shop's generic assistant gave two bodies at the counter. Now `noStaff` applies when only residents are on the staff list.

## Not done yet

- **Other worlds:** only Madrid has residents. Vienna, Chiang Mai, Pai and Da Nang need casts and place anchors.
- **Indoors:** residents stand outside venues. They don't go inside the bakery or bar interiors, sit at tables, or use objects.
- **Dialogue:**
  - Lines are authored templates with context slots, not open conversation.
  - Personality only flavours who has favours, hiring or music.
  - Residents don't gossip about each other's relationship with you.
- **Reputation:** it is tracked but not yet used for discounts, prices or access.
- **Festivals:** no M13 event invitations yet.
- **ApePhone:** contacts will move into the ApePhone in M17. For now they are in the Z panel.
