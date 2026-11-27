# M12: Consumables and effects

M12 builds on the existing effects system (`js/effects.js`). That system already had:
- gradual, stacking, fictional effects: drink, smoke, psychedelic, buzz, alien glow
- intensity and duration sliders
- "reduced motion", "no flashing" and "no intoxication visuals" settings
- X to clear all effects

It also builds on the backpack's first-person eating, drinking and smoking animations, which already include exhale puffs after a drag.

## What M12 adds

### 1. Photosensitivity guard (`effects.js`)

Whatever the dose or settings, the screen filter can only drift:
- brightness changes by at most **0.05 per second**
- hue by at most **24° per second**
- saturation and contrast are rate-limited too

Even a forced refresh drifts rather than jumps. There is no flicker and no flash, by default, without the user having to find a setting.

### 2. Raw dose vs. visuals

`AV.fx.raw(type)` reads the dose itself, independent of the intensity slider and of "no intoxication visuals". `AV.fx.impaired()` uses that raw dose:
- drink above 0.3
- smoke above 0.3
- psychedelic above 0.15
- glow above 0.5

Turning the visuals off doesn't make you sober.

### 3. No impaired driving (`tables.js`)

- **Starting a vehicle:** you can't start a scooter, bike or car while impaired. The game says so and points to walking or taxis.
- **During a ride:** if impairment builds up while you ride, you **pull over and park**.
- **At the wheel:** drinking, smoking or using alien items while riding is refused.
- **Alternatives:** walking, taxi stands and the map always work.

### 4. Table service (`js/tables.js`)

| Venue | Menu |
|---|---|
| Bar La Esquina terrace, Madrid (waiter Paco) | patatas bravas, tortilla española, ham croquetas, pimientos de Padrón, caña, tinto de verano, vermouth on tap, sparkling water, café con leche |
| Firefly Beach Bar, Koh Tao (Noi) | pad thai, green curry, massaman curry, mango sticky rice, fresh coconut, fruit shake, Thai lager, island rum punch, water |
| Rainny Café, Pai (Fon) | khao soi, avocado toast, banana roti, mountain coffee, Thai milk tea, mango smoothie, water |

**Placement.** The table and two chairs go on free, flat ground near the venue. They stay **at least 2.2 m from the city walking graph**, off carriageways and off the crowds' walking routes.

**Sitting.** Sit to see the menu. The camera drops to seated height and faces the table.

**Ordering.** Pay when you order. The dish arrives on the table after a few seconds as a plate, or as a glass for drinks.

**Eating and drinking.** You eat or drink it at the table for energy and vibe:
- Alcohol goes through the effects system, ramping in over about 12 s.
- Coffee gives a small buzz.
- Water helps you sober up a little.

**Leaving.** Walk away or press Stand up.

**Responsible service.**
- After 3 alcoholic drinks in 2 game hours, the waiter suggests water.
- Above the limit, they stop serving alcohol and bring water free.
- The table panel reminds you: no driving tonight.

**Friends.** If a resident friend (M11, friendship 10 or more) is at or next to the table, they share your first dish: +2 friendship, once a day.

**Abstract by design.** There's no smoking on menus. Cannabis and other substances remain the existing fictional items, with no real-world instructions.

**Save.** A new optional field, `S.tables = { orders, alc }`.

## Verification

`tools/tests/suite_consume.js`, real GPU, Medium (laptop on battery): **47/47**.

- **Photosensitivity guard:** under a strong psychedelic plus glow dose the colour visibly shifts. Even so, brightness changed by 0.0056 per second and hue by 23.7° per second. The largest brightness swing inside any 1/3-second window was 0.0017, so there is no flash.
- **Raw dose:** with "no intoxication visuals" on, the screen stays clean, but you're still impaired by the raw dose.
- **Driving:** a ride is refused while impaired, starts once sober, refuses a beer at the wheel, and pulls over when impairment builds up mid-ride.
- **Madrid table:** placed 2.2 m or more from the walking graph, near the bar.
- **Ordering and eating:** you sit and get the real tapas menu; bravas cost 6 and arrive on the table; eating raises energy and vibe.
- **Alcohol:** the effect is gradual; there's a water nudge after 3; above the limit you're refused and get free water; water lowers the dose.
- **Friend:** Carmen shares one dish for +2 friendship, once a day.
- **Standing up:** walking away stands you up.
- **Koh Tao table:** on the sand by Firefly, with the Thai menu. Two dishes arrive, and the lane and beach walks stay open.
- **Pai table:** the Pai menu.
- **Persistence:** orders are saved; the real save is untouched.

**Regression (real GPU):** bag 38/38, vehicles 52/52, drive 39/39, kohtao 42/42, npc 84/84, madrid 79/79, integration 131/131. The first NPC and Madrid run hung when the laptop slept on battery, so those were re-run.

**Bugs found on the way:**
- **Limiter snap:** a forced refresh snapped the limiter straight to the target value, which is exactly the jump the guard exists to prevent.
- **Test metric:** the first flicker metric measured frame-to-frame timing jitter. It now uses rates over windows of 250 ms or more.

## Not done yet

- **Waiters:** they aren't characters. Paco, Noi and Fon are named in the panel only, and dishes simply appear.
- **Tables:** one table per venue. There are no tables at other venues or in other worlds, such as Vienna's cafés or Chiang Mai.
- **Animation:** eating at a table plays no hand animation; the dish fades after about 2 s. The backpack's eating animations are unchanged.
- **Tabs and tips:** no bill splitting or tipping.
- **NPC diners:** no NPC orders or diners at the tables. The M11 tapas invitation doesn't seat you together automatically.

# 2.2 (Agent 3): Consumables 2.0, step by step (`js/consume.js`)

## The bug the owner reported

At the Giant Hostel, a bought pre-roll vanished after one drag.

**Cause:** `bag.js` played one 2.4 s animation, then removed the whole item.

**Fix:** every non-reusable drink, food, smoke and alien item is now used in **steps**. Each press of U (or the backpack button) is one step.

| Kind | Steps | What you see and hear |
|---|---|---|
| Pre-roll (8 drags; mini 4, Jungle Dub 10) | light up, then drag after drag | A lighter with a flame (first time, or after it goes out); the ember appears. On each inhale the ember glows brighter and smoke curls from the tip (crackle sound). Then you lower your hand and exhale a soft cloud. The joint gets shorter and grows ash. Between drags it smoulders with a thin wisp. On the last drag it is stubbed out. |
| Pipe | 3 hits per bowl; packing the bowl uses one herb pouch | Same, with a short lighter flick |
| Nargila | 10 puffs | Bubbling |
| Drinks (beer 6, cocktails 5, coffee 2–4, cola 4, water 3) | sips | Glass tilts, gulp sounds; the liquid level drops; the can fizzes on the first sip; a clink when it's empty. Coffee steams. |
| Food (2–5 bites) | bites | Crunch or bite sounds; the food gets smaller |
| Alien | breaths or bites | Coloured breath |

**Partly used items persist.** A half-smoked joint stays in the backpack. Its card shows "open: 4/8 drags left", and it is saved in `S.cons.open`.

**Putting a lit joint away puts it out.** Left alone, it goes out after about 2.5 minutes. "Relight" brings it back.

**Finish it** (backpack button, or `AV.bag.finish(id)`) plays the remaining steps one after another.

**Effects build gradually.** Each step adds 1/n of the item's dose to one effect session (`AV.fx.dose`), so a beer in 6 sips counts as one drink for the stacking rule. The Banana Bliss gummy (fictional) kicks in about 45 s after you eat it.

## Effects: each one feels different (`effects.js`)

**Cannabis:**
- warmer, gently sepia-toned colours with only a slight hue drift
- softer sound (the existing low-pass)
- a slower, relaxed walk (up to −12 %)

**Alcohol:**
- the existing sway, stagger and blur
- slightly slower walking

**Fictional psychedelics:**
- the hue drift
- a new soft geometric overlay: a slowly turning mandala at ≤30 % opacity, soft-light blend, opacity rate-limited to 0.06/s
- with reduced motion it is frozen and weaker; it is off with "no intoxication visuals"

**Alien items:**
- **float** (Astro-9 float fruit): gravity ×0.4 and jumps ×1.5, so you jump about 4 m
- **dash** (Nimbus zephyr pod): up to +45 % speed
- **glow** (moon-berries)

These are gameplay, so they work with the visuals turned off. None of them apply while driving.

**Rules that still hold:**
- the photosensitivity guard
- raw-dose impairment and no impaired driving
- reduced motion
- no flashing
- X / Clear effects

## New items and where to buy them

| Item | Price | Where |
|---|---|---|
| Mini pre-roll | 30 | Giant Hostel shelf 2; Pai Herb Corner (18); Dub Yard stall |
| Jungle Dub pre-roll | 75 | La Nube; Dub Yard stall (Jungle Dub) |
| Banana Bliss gummy (fictional) | 30–35 | Giant Hostel, La Nube, Pai, Sairee |
| Mojito / Ape Sunset | 55 / 60 | Giant Hostel shelf 2; Ape Sunset also at Sairee (45); mojito at the Finca cart |
| Espresso / latte | 15 / 18 | Giant Hostel, Finca cart, Nimbus kiosk, ranger hut, Café Nargila |
| Ape Cola | 8 | Most carts and the hostel |
| Kaleido tea (fictional psychedelic) | 40 | Orbit Fruit Cart (Astro-9); Vela's basket (Verdalux) |
| Float fruit | 25 | Orbit Fruit Cart, Astro-9 |
| Zephyr pod | 25 | Zephyr Pod Kiosk, Nimbus |
| Moon-berries | 15 | Vela's basket, Verdalux |
| Strawberries | — | Grown on the Pai farm |

All of these are fictional game items with no real-world guidance. Adult items carry `adult: true`, and Family Demo mode hides them.
