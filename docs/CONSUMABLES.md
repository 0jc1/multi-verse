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
