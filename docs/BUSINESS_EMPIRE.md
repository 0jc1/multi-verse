# Business Empire (Apeverse 2.2, Agent 3): `js/ventures.js`

A reusable business framework that sits next to the M9 clothing shop. It doesn't touch `business.js`; the M9 shop still works and shows up in the new 💼 Business phone app.

## How a business works

Every business is a real place you walk into. The steps are the same everywhere:

1. **Find it.** Look for the listing door with its "FOR RENT / SE ALQUILA" sign on a building front. It's also on the map and in 💼 Business on the phone.
2. **Lease or buy.** Leases run 7 days and can be renewed. You can buy the premises from the Manage panel.
3. **Step inside.** Interiors are built off the city map, like the Madrid flat and La Nube, so no city architecture is rebuilt.
4. **Run it from the 📋 Manage desk.** The panel has these tabs:
   - Overview: open or close, KPIs and the ledger
   - Supplies
   - Menu and prices (bounded to 50–200 % of the base price)
   - Equipment and décor (three levels: plants, lights, mural)
   - Staff
   - Premises: renew, buy, sell or end, and rename
5. **Open, serve and earn.** Customers are visible NPCs and walk in only while you're open, during opening hours, with you or staff present.
6. **Pay your costs.** Each morning you pay wages plus utilities, which go up with the equipment you own. If you can't pay, someone quits and reputation drops.
7. **Grow.** Upgrades are visible in the room. Sell for 70 % of the price plus 40 % of the equipment, or expand by leasing another listing.

**Away from the business, only staff trade.** Catch-up is capped at 24 game hours, and nothing earns in real time while the game is closed.

## Categories, each with its own loop

| Category | Listing | Loop |
|---|---|---|
| **Café** | Chiang Mai, near Tha Phae Gate ("Ape Beans") | Customers queue at the counter with an order bubble (☕ 🥛 🍰 🥭). You pick the right item, and a wrong one costs patience and reputation. Paying uses up supplies (beans, milk, pastries, fruit) and gives tips for fast, fairly priced service. The customer sits and leaves a dirty table, which you clean. Equipment: espresso machine, juice press, extra tables, pro grinder (the barista works faster). Staff: barista (serves when you step away), cleaner. |
| **Bar** | Madrid, near Sol ("Bar Gorila") | Beers are **poured**: stop the rising level in the green band. Pour quality sets the tip. Cocktails need the station. **Responsible service:** tipsy customers (🥴) are flagged; offering water or refusing earns reputation, and serving alcohol costs it. A door host keeps them out. A sound system brings +40 % at night and switches the room to club acoustics. |
| **Farm** (virtual cultivation, fictional) | Pai grow house ("Pai Valley Greens"), Astro-9 hydro dome ("Orbit Orchard") | Plant seeds in planters, then water, tend and harvest. Plants grow through **visible stages** (seedling, young, leafy, flowering, ready). Growth is driven by abstract water, health, light and care values; dry plants stop growing and lose health. The harvest stocks your **farm stand**, where NPC customers buy at your price, or you take some for yourself. Contracts: first harvest, a full stand, La Nube (adult), a Chiang Mai café, and Zibb's cart (alien). Equipment: drip irrigation, grow lights, trimming table (2 pouches → 3 pre-rolls), +4 planters. Staff: grower (waters and harvests), stand seller. Crops: Pai strawberries and two fictional herbs; on Astro-9, float fruit, zephyr pods and moon-berries, which feed the consumables. No real-world growing information anywhere. |
| **Courier depot** | Madrid ("Rayo Couriers") | Take a job at the board. A parcel goes into your backpack and the GPS is set to a real place 70–600 m away. Deliver before the timer runs out for full pay plus a speed bonus; late deliveries pay half. The cargo bike lets you carry two drops per run, and the priority board raises the pay. Couriers make runs while you're away. |

Hostels, galleries, record stores, convenience stores and the remaining categories from the brief are **planned, not built**. They plug into the same `CATS` and `LIST` tables (see below).

## Phone

💼 **Business** shows every business you run:
- status, reputation, today's profit, customers served, staff, supplies or planters, and all-time profit
- Manage, 📍 GPS, or ✈️ travel to it
- the M9 clothing shop
- premises still for rent in every city

## Adding a business (for other agents)

```js
AV.vent.LIST.vn_cafe = { w: 'vienna', cat: 'cafe', name: ['Café unit · Graben', 'Local · Graben'], anchor: [/graben/i], rent: 260, days: 7, price: 5000, foot: 8, ix: 3400, title: 'Café Affe' };
```

`ix` is a free x coordinate off the map, 80 m apart for each listing. The door finds a building front near the anchor place, away from other doors, shops and named places.

A new category needs a `CATS` entry:
- `menu` (with supply needs and equipment)
- `supplies`
- `equip`
- `staff`
- `open` and `close` hours

## Save

`S.vent[listingId]` holds:
- status, lease, rep, ledger, rev, cost, sold
- equipment, supplies, prices, staff, décor, dirty tables
- plots, stock, missions

These are new optional fields, so old saves load unchanged.
