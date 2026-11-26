# M13: Ambient sound in every world (`js/ambience_worlds.js`)

## The gap

The world benchmark found **9 worlds with no ambient sound bed**: Ape Town, Verdalux, Jungle Dub, Chiang Mai, Jerusalem, Judean Desert, Vienna, Da Nang and Koh Samui. Some had music, all had a few one-off blips, but walking around was silent.

Madrid, Pai, Koh Tao and Astro-9 already had layered ambience, and they keep their own.

## How it works

The sound is procedural Web Audio through the existing `AV.amb` engine (`ambience.js`), with **no sound files**.

**Generators.** A library of reusable sound generators, each either a filtered-noise bed or a scheduled note pattern: wind, waves, river, fountain, cicadas, crowd, traffic, hum, crickets, birds, doves, gulls, frogs, car horns, passing scooters, tram bell, church bells on the game hour, temple gong, crystal chimes, hand drums, campfire crackle, your own footsteps on stone, distant dinosaurs, and clinks.

**Location.** Each world's preset sets every layer's level from **where you are**. Distance is measured to that world's own places, matched by id or name: its market, river, beach, temple, stage, falls.

**Time.** Levels also follow **day or night**: birds and cicadas by day; crickets, frogs and campfires at night.

| World | What you hear |
|---|---|
| Ape Town | birds by day, crickets at night, crowd near the plaza and stage, waterfall at the falls, fountain on the plaza, chimes in the crystal grove, temple gong, light wind |
| Verdalux | low alien hum, crystal chimes, frogs, wind, the drum log nearby |
| Jungle Dub | cicadas, tropical birds, night crickets and frogs, the river near the river bar, bazaar crowd |
| Chiang Mai | scooters passing (louder by the gate and bazaar), traffic, horns, evening crowd by the hostel and bars, temple gong near the wat, birds and crickets, the river |
| Jerusalem | market crowd and clinks in the shuk and souk, doves near the walls, your footsteps on stone, wind, night crickets. Deliberately neutral: no religious calls. |
| Judean Desert | strong wind, Dead Sea waves at the beach, campfire crackle at the camp (louder at night), crickets, birds at the oasis |
| Vienna | city traffic, tram bells, church bells on the hour, crowd near squares, markets and cafés, birds, fountains, footsteps |
| Da Nang | surf (louder on the beach), gulls, scooters and horns, crowd at the market and night spots, cathedral bells |
| Koh Samui (Jurassic) | distant sauropod calls and pterosaur cries, lagoon waves, the canyon river, cicadas, birds, night frogs, crystal chimes in the cave, wind on the ridges |

**Starting and stopping.** The preset starts only if the world hasn't started its own ambience, and it stops when you leave. During DJ sets the existing `hold` mutes it as before.

## Verification

`tools/tests/suite_ambience.js`, real GPU, Medium (laptop on battery): **66/66**.

For each of the 9 worlds:
- the preset starts with 5–8 layers, and 2 or more are playing at the arrival point
- **a real signal is measured**: an AnalyserNode on the ambience bus gives RMS 0.014–0.070
- a location layer rises when you walk from the farthest place to its own place

| World | layers | playing | signal (RMS) | location layer: far → at the place |
|---|---|---|---|---|
| Ape Town | 8 | 4 | 0.037 | falls 0 → 1 |
| Verdalux | 5 | 5 | 0.014 | drums 0.45 → 1 |
| Jungle Dub | 7 | 6 | 0.070 | river 0 → 1 |
| Chiang Mai | 8 | 6 | 0.037 | gong 0 → 1 |
| Jerusalem | 6 | 4 | 0.052 | market clinks 0 → 1 |
| Judean Desert | 5 | 2 | 0.050 | waves 0 → 1 |
| Vienna | 7 | 6 | 0.019 | crowd 0.2 → 0.9 |
| Da Nang | 7 | 4 | 0.062 | waves 0.25 → 1 |
| Koh Samui | 8 | 5 | 0.052 | chimes 0 → 1 |

**Other checks:**
- **Day and night:** in Jungle Dub, birds play by day and are quiet at night; crickets play only at night.
- **Own ambience kept:** Madrid keeps its own ambience; ours doesn't start there.

**Regression (real GPU):** music 43/43, dj 33/33, band 62/62, fest 38/38, cm 76/76, integration 131/131.

**Test fix.** Jerusalem has two market places (the shuk and the souk), so the "far" point now has to be far from every matching place.

**Limit.** These checks prove the sound exists, responds to place and time, and carries a signal. They don't prove it *sounds good*. That needs a listen, ideally with headphones on the real build.

## Not done yet

- **Mixing:** no mixing pass against each world's music. Levels were set by ear in code, not measured against the playlists.
- **3D position:** the layers are mono beds whose loudness follows distance. Waves aren't heard from the sea's side; only Madrid's and Pai's own systems have positional sources.
- **Weather and festivals:** no rain sounds tied to Chiang Mai and Da Nang weather, and no festival-specific crowd surge.
