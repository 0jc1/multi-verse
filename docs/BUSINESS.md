# Player business (Apeverse 2.0, M9, first slice: your clothing shop in Malasaña)

`js/business.js` builds on the M6 clothing-store builder (`AV.merch.buildShop`, now reusable with a key, a fixed site, your own designs, a staff-less mode and a clean dispose for rebuilds). Listings are data (`AV.biz.LIST`). The first is a commercial unit in Malasaña, Madrid.

## The loop

1. **Find the listing.** A yellow "SE ALQUILA" board stands at an empty commercial unit. The site backs onto an existing building (a street frontage, not the middle of a plaza). It is on the map.
2. **Lease or buy.** Rent costs **300 credits for 7 days** (renewable); buying the premises costs **6000**. Purchases are refused when credits are short. When the lease ends, the shop closes, the listing returns, and **your products stay in the save**.
3. **Category:** clothing shop. The data model is built for more categories, which are not implemented yet.
4. **Name and brand it** (Name + look): the shop name goes on the sign, with 5 sign colour schemes and 6 wall colours. The shop is rebuilt in place, with no leaked colliders or interactions (tested).
5. **Interior:** two rails, a folded-stock table, framed posters, a mannequin, a counter and a fitting room, all showing **your products' designs**.
6. **Products** (up to 6, or 12 with the second rail): any catalogue design (the 43 from M6) or **your own studio designs**, as a T-shirt or hoodie.
   - Stock is bought wholesale (25 per tee, 45 per hoodie) in batches of 5.
   - You set the price. The panel shows the margin and the purchase chance at that price.
   - You can **take one for yourself** and wear it.
7. **Staff:** hire up to 2 shop assistants at 40 per open day, paid at closing. If you can't pay, they leave. **Without staff the shop only sells while you are inside.**
8. **Open or close**, with closing time at 20:00, 22:00 or midnight. Opening is at 10:00.
9. **Customers** follow an hourly demand model:
   - Customers = footfall × hour-of-day curve × reputation × window display (+15%) × ads (+25% for 3 days).
   - Each customer picks a product in stock (your own designs are 30% more popular) and buys with a price-sensitive chance: 60% at the base price, falling steeply above it.
   - Stock-outs and over-pricing cost reputation; sales build it.
   - Near the open shop you **see customers walk in, browse a rail and pay at the counter**. Their purchases are real sales, and they are counted against the hour's demand, so customers you saw are not double-counted.
10. **Ledger:** every sales hour (stamped with the hour it covers), restock, wage, upgrade and rent, plus revenue, costs, profit and items sold.
11. **Upgrades:**

    | Upgrade | Cost |
    |---|---|
    | Window display | 400 |
    | Second rail (12 products) | 300 |
    | Gran Vía posters (3 days) | 150 |

12. **Design studio:** two lines of text, 3 fonts, 7 ink colours and 11 graphics. Saving makes a **real 256 px PNG texture**, up to 8 designs. Each design is registered as a wearable item, appears on your racks and posters, sells, and NPC customers buy it.

**Honest economy:**
- The shop trades **only while the in-game clock runs**. There is no real-time offline income.
- A sleep or time skip is simulated, but **never more than 24 game hours at once**.
- Credits are fictional. Nothing connects to real money.

**Saved data:** `AV.S.biz[id]` and `AV.S.designs`. These are new optional fields, so old saves load unchanged.

## Verification

`tools/tests/suite_biz.js`, real GPU, Medium (laptop **on battery**): **46/46**.

**What it covers:**
- **Listing:** the board, the backed site, the map entry; lease refused at 100 credits, then rented.
- **Rebranding:** rename and recolour with no leaked colliders or interactions.
- **Studio:** a design is saved as a PNG texture and becomes a wearable item.
- **Products:** 3 products (your design + Tokyo tee + an over-priced Moonmelt hoodie), restocked at the right wholesale cost. The over-priced item's purchase chance is below 20% versus above 50% for a fairly priced one.
- **Staff:** a shop assistant is hired.
- **Trading day** (10:00 → 23:00 with the shop open): **15 items sold**, stock went down, takings arrived, and the sales hours and wage are in the ledger. Reputation moved.
- **No staff:** no sales while away, sales again while inside.
- **Visible customer:** walked in, browsed and paid at the counter, **buying your own design**.
- **Wearing:** your design, worn.
- **Time skip:** a 3-day skip is capped at 24 hours (22 sold).
- **Persistence:** save and load (real save untouched); shop and designs are rebuilt after leaving Madrid.
- **Lease end:** the listing returns and products are kept; renew; buy the premises.
- **FPS:** 43 in the shop with a customer, **on battery** (it needs a plugged-in re-measure).

## Not done yet

- **Other business categories:** art gallery, record store, café, bar, club, hostel, garage, stalls, social club and the others in the brief. The listing and demand model are generic, but only the clothing shop is built.
- **Customers:** they don't follow daily schedules or personal preferences (M11 living NPCs). Demand is statistical, with visible walk-ins.
- **Staff:** employees are hired generically, without personalities or skills.
- **Expansion:** no premises expansion beyond the two upgrades.
- **Player products:** only T-shirts and hoodies so far. Hats, posters, skateboards, paintings and furniture finishes are planned.
- **Story content:** no rival businesses or underground storylines yet.
- **Listings:** one so far (Malasaña).
