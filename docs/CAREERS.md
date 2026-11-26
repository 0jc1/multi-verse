# M16: Careers and missions (`js/careers.js`)

## Careers

Every career has three ranks: **Trainee → Regular → Senior**. Pay on the shifts this module runs is multiplied by 1, 1.25 and 1.5 for those ranks. Promotions show a toast and send an ApePhone message.

| Career | Where | Rank from | Ranks at |
|---|---|---|---|
| Café helper | Ape Town, Zil's café | the existing 5-drink shift, now counted | 5 / 15 shifts |
| **Delivery rider** (new) | Madrid, Nacho's shift from the bakery | deliveries | 10 / 30 |
| **Reef survey diver** (new) | Koh Tao, Blue Turtle Divers (needs the Reef Explorer card) | species surveyed | 6 / 18 |
| Musician | Madrid, Sala Malasaña | M10 gigs (paid through M10) | 3 / 10 |
| DJ | DJ booths | M10 DJ nights | 3 / 10 |

**The HUD's job line** now shows your career and rank, e.g. "Job: Delivery rider · Trainee". It used to be a fixed "café helper / Unemployed".

### Delivery shift (Madrid, 09:00–21:00)

**Orders.** A shift is three orders. Each one is:
1. Pick up at the Panadería, Frutería or Bar La Esquina.
2. Deliver to a resident's front door (the M11 homes).

**Getting there.** The minimap GPS routes you to each stop, and a small HUD shows the order, distance and a timer of 25 s plus the distance at 2.4 m/s. You can walk, run or ride; the M12 impaired-driving rules still apply.

**Pay.**
- On time: 12 + up to 8 tip for speed, × rank. The customer's friendship goes up by 1.
- **Late: the order is cancelled and pays nothing.**
- All three on time counts as a **perfect shift**.

**Abandoning.** Leaving Madrid abandons the shift and clears the GPS.

### Reef survey (Koh Tao)

**Requirement:** the Reef Explorer card.

**The job.** The dive shop asks for three species. Find them while snorkelling within 5 minutes: get close for about a second, the same rule as the reef log.

**Pay.** 22 per species × rank, plus a 20 × rank bonus for all three.

## Missions

Six authored chains. Every step is read from what you have actually done (your save state), so earlier progress counts. Completing a mission pays a reward, shows a toast and sends a phone message.

| Mission | Steps | Reward |
|---|---|---|
| Barrio roots | meet Carmen · do a neighbour a favour · share tapas at 21:00 · barrio reputation 8 | 150 |
| From busker to headliner | recruit a bandmate · write 2 songs · play Sala Malasaña · catch a festival headliner | 200 |
| Island life | travel to Koh Tao · mask and snorkel · log all 7 species · finish a reef survey | 150 |
| Shopkeeper | open your Malasaña shop · stock 3 products · sell 20 pieces · hire a neighbour | 250 |
| On the road | own a vehicle · make 3 deliveries · a perfect delivery shift | 120 |
| Night owl | play a booked DJ night · catch a Stone Ape Band set · order 3 times at a table | 120 |

**💼 Jobs app (ApePhone).**
- Each career with its rank, progress and where to do it, plus **Start shift** when you're in the right world.
- Every mission with ✅/⬜ steps.
- **Quit shift** while you're working.

**Start points in the world:** "🛵 Nacho's delivery shift" next to the bakery, and "🤿 Reef survey shift" at the dive shop counter.

**Save.** New optional fields:
- `S.careers = { xp, main, perfect }`
- `S.missions = { done }`

## Verification

`tools/tests/suite_careers.js`, real GPU, Medium (laptop on battery): **50/50**.

- **Starting state and Jobs app:** the HUD starts "Unemployed". The Jobs app is in the phone and lists 5 careers and 6 missions, with back navigation.
- **Café:** 5 café shifts make you Regular; the HUD shows "Café helper · Regular" and the promotion text arrives.
- **Delivery, first order:**
  - the shift starts at the bakery with 3 orders
  - the GPS points to the pickup, then the customer
  - the HUD timer shows
  - delivered on time it paid 20 (12 + tip) and the customer's friendship went up by 1
- **Delivery, rest of the shift:** a late order paid nothing; the summary showed 2 of 3 on time; 3 deliveries of XP; not a perfect shift.
- **Perfect shift:** at rank Regular, all on time counts as a perfect shift and each delivery pays 15 or more.
- **Leaving:** going to Chiang Mai abandons the shift and clears the GPS.
- **Reef survey:** refused without the card. With it, the dive shop asks for 3 species; finding them all pays exactly 3 × 22 + 20, plus 3 reef XP.
- **Missions:** Barrio roots completes from save state (+150 and a phone message), and so does Island life. On the road shows partial progress: deliveries and perfect shift done, no vehicle.
- **Persistence:** careers and missions are saved; the real save is untouched.

**Regression (real GPU):** phone 43/43, integration 131/131, npc 84/84, madrid 79/79, kohtao 42/42, band 62/62.

**Test fix.** The reef-survey pay check first failed because the test gave the card without the species logged, so first-sighting rewards (+10 each) mixed into the pay. The test now logs all 7 first, as a real card holder has.

## Not done yet

- **Delivery:** Nacho doesn't ride with you; the orders and customers are text and GPS only, and no parcel is drawn. Deliveries don't use the scooter dealer's vehicles specially.
- **Café:** its pay is still the Ape Town shift's own (15 per drink + 25 tips); ranks don't raise it.
- **More jobs:** none in Vienna, Chiang Mai or Pai yet. Missions are fixed chains, not generated.
