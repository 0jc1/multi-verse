# Driving, ownership and GPS (Apeverse 2.0, M7 / M7B, first slice: Madrid)

Built on the existing `js/vehicles.js` (7 vehicle kinds, first-person riding, physics, procedural engine sound, parking, rental stands). New code is in `js/garage.js` plus a small collision upgrade in `vehicles.js`. Nothing working was rebuilt.

## What you can do now

**Buy a vehicle in Madrid.** "Autos y Motos Pinar" is a forecourt in your Pinar barrio, with a sales kiosk, a sign and both models on display. You pay with credits and choose a colour.

| Model | Price |
|---|---|
| **Urbano 125 scooter** | 350 |
| **Compacto hatchback** car | 1200 |

The purchase is refused if you are short of credits.

**Own it.** Owned vehicles never expire; rentals still end at midnight. They stay parked exactly where you get off, are saved with the game (`AV.S.veh.list`, `owned: true`), and survive reloads, world travel and the passing of days.

**Garage** (Y, or the dealer counter; G is the existing graphics-quality key) lists every vehicle you own in every world. For each one you can:
- **Locate** it: sets a GPS waypoint.
- **Bring it here:** valet, 15 credits.
- **Repaint** it: 40 credits, cycles through 10 colours.
- **Sell** it: half price, with a two-step confirmation.

**Drive:**
- W/S: throttle and brake, then reverse.
- A/D or the mouse: steer.
- F: horn.
- Esc: get off.
- Phone: the joystick.

**Chase camera:** C (phone: the 🎥 button) switches between first person and a camera behind the vehicle. It is pulled in so it never ends up inside a wall. Scooters and bikes show the rider in third person.

**Lights:**
- Headlights at night: one shadowless spot light on the vehicle you ride.
- Brake lights whenever you slow down or hold the brake.

**Collision now respects the vehicle's length.** The front bumper and its corners (or the rear when reversing) are probed, so a car stops with its nose outside a wall. Before this, the car's front went about 2 m into buildings, because only the driver's position was checked.

**GPS guidance:** with a waypoint (atlas J, click the map, or Locate), a bar shows the turn arrow, the distance along the route and the destination. It works walking or driving.
- The route is A* over Madrid's street graph (`W.mapNav`); the minimap draws it in pink.
- On arrival the bar clears.

## Verification

`tools/tests/suite_drive.js`, real GPU, Medium: **39/39**.

**What it covers:**
- **Dealer:** built, its interaction and map entry.
- **Buying:** refused at 100 credits; buy the scooter (350) and the car (1200).
- **Scooter:** reaches 11.8 m/s in 3.5 s and travels 23 m; the brake lights come on; it stops.
- **Chase camera:** 4.2 m behind, not in a wall, rider visible.
- **Parking and lights:** parked where you got off; valet; headlights at night.
- **Car collision:** the car stops at a wall with the bumper outside (wall 2.5 m from the driver, bumper reach 2.05 m).
- **Garage:** repaint.
- **GPS:** a 46-point route from Sol to the scooter, never more than 0.5 m into a building.
  - One stretch follows the edge of a 68 × 16 m block at Sol; the street graph line sits exactly on its façade.
  - The GPS bar shows the arrow and 1.6 km.
- **Map:** the atlas opens.
- **Persistence:** 2 owned vehicles survive save and load (sandbox key, real save untouched) and come back after 3 in-game days and a trip to Ape Town.
- **FPS:** 60 driving the car with the chase camera.

**Regression after the collision change:** `suite_vehicles` 52/52, `suite_cm` 76/76 (tuk-tuks), `suite_integration` 124/124.

`suite_play` is 51/53. Both misses also happen on the M0 and M1 commits, so they predate this work (logged as open):
- "Chiang Mai court: court floor is walkable"
- "casual three-pointer goes in"

## Not done yet (honest list)

- **NPC traffic:** done in M7C (see below).
- **Indicators:** none. There are also no enter/exit animations (getting on and off is instant).
- **Damage and repair:** not implemented.
- **Upgrades:** no part upgrades.
- **Driving surface:** the player can drive on sidewalks and plazas (anything walkable). There is no road-only rule for the player.
- **Other worlds:** dealers only in Madrid. Other worlds keep their rental stands: Vienna, Chiang Mai, Da Nang, Ape Town, Jungle Dub, Astro-9.
- **GPS outside Madrid:** a straight line in worlds without a street graph (`W.mapNav`).
- **The dealer:** a simple forecourt, not a full showroom interior.

## M7C: NPC traffic on Madrid's street grid (`js/traffic.js`)

**Network.** Every street of Madrid's 70 m grid that is wide enough for cars becomes two directed lanes. Traffic is right-hand, with the lane centre a quarter of the road width from the middle. Road ends snap into junctions.
- **Size:** 404 junctions and 1374 lanes, built in about 7 ms.

**Traffic lights:** at every junction of 3 or more roads (354 in total).
- North-south and east-west phases: green 11 s, amber 3 s, all-red 1.5 s.
- Lamps on poles at the corners, before the junction, at the drivers' right, coloured by the live phase.
- Drawn for the 60 junctions nearest to you (instanced: 2 draw calls).

**Cars** (a pool of 12 on Low, 26 on Medium, 38 on High; mostly cars, plus delivery pickups and scooters):
- They follow their lane and keep a bumper-to-bumper gap, including to cars just beyond a junction or turning out ahead.
- They stop at the stop line on red. On amber they stop if they can, or commit and clear the junction.
- They turn through junctions on a smooth curve and don't U-turn unless at a dead end.
- They **stop for you**: on foot, and with a short horn if you're standing in the lane.
- They **stop for crowd pedestrians and ambient people** in the lane ahead.
- They are **solid for your own vehicle** (`AV.dynBlock`, checked by the bumper probes).

**Streaming.** The pool lives in a bubble around you. A car more than 230 m away respawns on a lane 70–190 m away, preferably out of sight. Moving across the city brings the traffic with you.

**Older traffic.** The looping avenue traffic is hidden and silenced in Madrid.

### Verification

`tools/tests/suite_traffic.js`, real GPU, Medium (laptop on battery): **26/26**.

- **Network and poles:** built; 4 light poles at the watched junction, none in the carriageway.
- **Lanes:** 27 cars around you; **0 of 213 position samples outside the right-hand lane**, none inside a building.
- **Red lights:** **0 red-light runs** across all cars in a full light cycle; 8 cars waiting at reds.
- **Spacing:** the bumper-to-bumper gap never went below 0.3 m.
- **People:** a car stopped for you standing in its lane, and for a crowd pedestrian placed in its lane.
- **Your car:** traffic cars are solid for it.
- **Streaming:** after moving to Malasaña, 24 cars respawned around you.
- **FPS:** 51–60 at a busy junction with 27 cars.

**Bugs found on the way:**
- A freshly spawned car kept a stale position (0, 0), looked "230 m away" and respawned forever (760 respawns, 5 cars visible).
- The light poles were mirrored to the wrong side.
- An amber commit was wrongly counted as a red-light run.

### Not done yet

- **Car lights:** traffic cars have no headlights or brake lights at night (your own vehicle does).
- **Lanes and junctions:**
  - one lane per direction even on the 26 m avenues
  - no overtaking or lane changes
  - no turning-conflict rules (left turns don't yield to oncoming traffic)
  - no pedestrian crossing signals; pedestrians aren't routed to crossings
- **Other worlds:** only Madrid has network traffic. Vienna, Chiang Mai, Pai and Da Nang need a `CFG` entry and, where roads aren't axis-aligned, curved-road support.
- **Your own driving:** traffic lights don't affect it (no fines or police).
