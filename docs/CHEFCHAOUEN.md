# Chefchaouen: the blue medina (agent 4, world id `chefchaouen`)

## Verdict

Chefchaouen is **playable and connected**, and it is the first fully hillside world: the whole medina climbs about 35 m towards Ras El Maa. Results: 65/65 on the real GPU (queued). The offline network check passes 11/11, and the offline load check passes.

## The map

- **Getting in:** you enter at **Bab el-Ain** (south-west, bottom of the hill), off the Avenida Hassan II, the only car street.
- **The climb:** up the **souk** (the commercial lane) to **Plaza Uta el-Hammam**:
  - the Kasbah's ochre walls, corner towers and a garden you can walk into;
  - the Grand Mosque's octagonal minaret.
- **The blue lanes:** about 25 winding blue lanes, 3–4.5 m wide, with small plazas (el-Makhzen, the fountain square), up to **Ras El Maa**:
  - the spring where the river comes out of the mountain;
  - stone washing basins with women at work;
  - a café.
- **Across the river:** two timber footbridges cross to the hillside path up to the white **Spanish Mosque** and its view.
- **Dead ends:** two intentional ones, derbs ending in courtyards. Everything else connects.
- **Architecture:**
  - walls washed in many blues (cobalt, sky, powder, indigo, turquoise) and white, with blue-painted plinths;
  - small windows behind green and blue grilles; flowerpots everywhere; flat terrace roofs;
  - signs in Arabic and Latin lettering, with zellige-tiled frames;
  - houses step up the slope on foundations; blank walls get small grilled windows.
- **Terrain:**
  - walk-in shops have flat floors on the slope;
  - crowds follow the terrain, using the shared crowd's height option;
  - bridges run bank to bank on the slope.

## Things to do

| What | Details |
|---|---|
| Walk-ins | **Babouches Hassan** (slippers, jellabas); **Tissage Al Andalus** (weavers' looms, blankets); **Dar Tajine** (tajines, bissara, goat cheese, mint tea) |
| Walk-up shops | Café Ras El Maa; Épices & Pigments Bleus (the indigo pyramids, ras el hanout, fresh mint); the neighbourhood bread oven; Hammam Sidi Ali (+energy) |
| Missions | "Indigo for Fatima"; "Mint for Amina" |
| Discoveries | 8 cats on the steps; cool your hands at the spring; the view and sunset from the Spanish Mosque |
| People | Fatima, Youssef, Amina, Rachid, Hamza (oud); washerwomen; café regulars |
| **Festival Alegría** | Mediterranean music. Seasonal: week 1 of every 4-week cycle, 17:00–01:00, or switched by hand. Stages on Uta el-Hammam and at Ras El Maa (solid only while it runs); lanterns over the souk; an oud, darbuka and voice ensemble (Andalusian nuba, then Gnawa); an audience |

## Performance

Real GPU (Intel Iris Xe), Medium, 1536×864, queued run (GPU lock):

| View | fps | draw calls | triangles |
|---|---|---|---|
| Bab el-Ain (arrival) | 55.6 | 95 | 219k |
| The souk | 46.0 | 131 | 332k |
| Ras El Maa | 28.5 (one-off hitch; the HUD read 56 when the screenshot was taken, and the previous run measured 54) | 66 | 129k |
| From the Spanish Mosque | 47.5 | 139 | 379k |
| Festival Alegría on Uta el-Hammam | 40.4 | 201 | 627k |

The ground is draped over the hillside, and its triangles are split wherever the slope bends.

## Known limitations

- **Detail level:** box-built houses. The Kasbah and the mosques are interpretations, not replicas.
- **Bab el-Ain:** the gate has no arch structure yet.
- **Audio:** the call to prayer is deliberately not reproduced.
- **Phone:** not yet tested on phone emulation.
