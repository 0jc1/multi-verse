# M13: Street graphs and GPS in every world (`js/pathfind.js`)

## The gap

The world benchmark found that only Madrid had a street graph for GPS. Every other world drew the pink route as a **straight line**, and in testing **37 of those 60 lines between real places ran through buildings**. Madrid's graph also missed the Pinar barrio and its newer props, such as kiosks and the terrace table.

## How it works now

One shared router serves the minimap GPS in every world: `AV.path.route(W, from, to)`.

**1. Clear line of sight:** a straight line.

**2. A grid search otherwise.** A* runs over a walkability grid checked against the world's real collision: buildings, walls, props, map edges and deep water.
- **Pavement first:** carriageways cost 3× more, so routes keep to pavements and cross streets short.
- **Cell size:** 1.5 m for trips under 160 m. Longer trips use 2.5 m, then 4 m cells, falling back to finer grids if a coarse one can't fit through a gap.
- **Thin walls:** each grid step checks the line between cells every 0.25 m, because a thin wall can sit between two free cells.
- **Start and end:** always on a free cell centre reachable from the point.

**3. Long trips in a world with a street graph (Madrid):** the graph in the middle, with grid paths at both ends. Graph sections are checked against today's collision:
- blocked nodes snap to free ground
- blocked edges are re-routed on the grid

**4. Smoothing:** by line of sight, sampled every 0.25 m so a diagonal can't clip a wall corner.

**5. The last stretch.** The exact destination is added only if the line to it is clear. Otherwise the route ends at the nearest free point, inside the GPS's 12 m arrival radius.

**Speed.** Collision is indexed per world in 16 m buckets, rebuilt only when the collision lists change. Each cell check therefore looks only at nearby boxes, not every box in the world.

**Re-routing.** The GPS now re-routes when you're more than 15 m from the route line, checked every 2 s. Before, it re-routed only when the next waypoint was 45 m away.

Everything that sets a waypoint uses the new router:
- the ApePhone Maps app
- resident tips
- delivery shifts
- the garage "locate"
- the GPS bar

## Verification

`tools/tests/suite_gps.js`, real GPU, Medium (laptop on battery): **88/88**.

**What the test does.** For every playable world it routes between pairs of that world's real places, up to five. It then checks each route **independently of the router**: sampled every 0.5 m, no point may be inside a building box or off the world.

| World | routes | old straight line crossed buildings | points inside buildings now | longest route ÷ straight | slowest route |
|---|---|---|---|---|---|
| Ape Town | 5 | 0 | 0 | 1.02 | 41 ms |
| Pai | 5 | 3 | 0 | 1.65 | 137 ms |
| Madrid | 5 | 5 | 0 | 3.12 (city blocks) | 292 ms |
| Astro-9 | 5 | 5 | 0 | 1.74 | 277 ms |
| Jungle Dub | 5 | 0 | 0 | 1.07 | 17 ms |
| Chiang Mai | 5 | 5 | 0 | 1.30 | 229 ms |
| Jerusalem | 5 | 5 | 0 | 1.15 | 32 ms |
| Judean Desert | 5 | 2 | 0 | 1.02 | 27 ms |
| Vienna | 5 | 4 | 0 | 1.09 | 65 ms |
| Da Nang | 5 | 4 | 0 | 1.26 | 14 ms |
| Koh Samui | 5 | 0 | 0 | 1.00 (all line of sight) | 25 ms |
| Koh Tao | 5 | 4 | 0 | 1.21 | 56 ms |
| Verdalux | n/a: its 3 places are within 25 m of each other | | | | |

**Overall:** 60 routes. 37 of the old straight lines crossed buildings; now **0 route points are inside buildings and every route was found**.

**Other checks:**
- **Re-routing:** in Vienna, stepping 20 m or more off the route re-routes within 3 s, and the new route starts with a clear line from you.
- **Madrid's Pinar barrio:** bakery → Bar La Esquina. The old graph route crossed buildings; the new one is clean.

**Bugs found on the way:**
- **Thin walls between cells:** two free cells 1.5 m apart can straddle a thin wall. Each grid step is now checked.
- **Smoothing clipped corners:** line-of-sight samples every 0.6 m let diagonals cut wall corners; now 0.25 m.
- **Stale street graph:** Madrid's graph ran through props placed after it was built. Graph sections are now repaired against current collision.
- **Final leg:** snapping the destination could land behind a thin wall, and the final straight leg crossed it.
- **Blocked start cell:** a start point near props snapped to free ground, but the grid began at its blocked cell centre (Koh Tao's Firefly).

## Also fixed in this pass

Regression turned up an intermittent ApePhone failure, unrelated to routing. The "yesterday's shop sales" message sometimes arrived late.

- **Cause:** the message generator, and the careers mission tracker, throttled themselves by summing frame time. The game caps frame time at 0.05 s, so a slow-frame moment (the shop's first build) stretched "once a second" to several seconds.
- **Fix:** both now use real elapsed time, and each message source runs in its own try/catch.
- **Result:** phone 43/43 three times in a row, careers 50/50.

**Regression (real GPU):** drive 39/39, careers 50/50, phone 43/43, npc 84/84, madrid 79/79, kohtao 42/42, integration 131/131.

## Not done yet

- **Visible streets:** the minimap still draws roads only where a world declares them. Worlds without `mapRoads` show buildings and the route, but no street lines.
- **Long routes:** they take up to about 0.3 s (Madrid, Astro-9). Long routes could be cached or computed over a few frames.
- **Vehicles:** cars follow the walking route (pavement-preferring), not lanes. Driving routes using the M7C traffic lanes would be better for cars.
- **Crowds and residents:** M11 residents still use their own copy of this router, and crowd walkers keep their world-authored graphs.

## 2.1: GPS stays warm (`js/pathfind.js`)

**Found:** the first route through an area paid a cold-cache cost. That ranged from 15 to 520 ms; repeating the route took 2–57 ms. The collision index and its whole cost cache were also **thrown away whenever anything was added to the world**: a parked vehicle, a stall, a dealer lot. So GPS kept going cold during play. Adding the 2.1 places changed which route pairs `suite_gps` samples, and that exposed a 440 ms route in Astro-9 and a 920 ms route in Madrid.

**Fixed:**
- **Appending obstacles:** added obstacles go into the existing index. Only the cached cells of the 16 m bins they touch are dropped. Removals and road changes still rebuild everything.
- **Cache layout:** the cache is split per bin and uses numeric keys instead of strings.

**Measured (same route, real GPU, first request → repeat):**

| Route | Before | After |
|---|---|---|
| Madrid teatro → Gran Vía | 406 → 57 ms | 243 → 22 ms |
| Astro-9 plaza → terrace | 520 → 30 ms | 321 → 7 ms |

Every sampled route is now under the 400 ms budget.

**Rides (`js/rides.js`):** walking-route legs are now string-pulled. Every corner whose shortcut is clear for a vehicle is dropped, so taxis take smooth lines instead of grid zigzags. The Koh Tao songthaew covers 20 m in its first 6 s again; it had dropped to 4–6 m with the twistier route.


## 2.1: roads for vehicles, warm GPS everywhere

**Madrid's Pinar barrio is joined to the grid** (`js/road_links.js`).
- **What was wrong:** the barrio street (z 0, x −92…92) stopped 48 m short of the grid avenues at x = ±140, across paved plazas.
- **Fix:** two real connector streets are built across the plaza edges: 8 m of asphalt, kerbs, a dashed centre line and zebra crossings.
- **Gran Vía east:** gets a 22 m link to the x = 140 avenue.
- **What uses them:** they join `W.mapRoads` before `traffic.js` reads it, so AI cars drive them and the new junctions get traffic lights.
- **Clearance check:** every connector is checked against the world's collision first, and one that isn't clear is skipped and reported.
- **Not connected, on purpose:** Calle Montera and Malasaña are stone-paved pedestrian streets, so cars never route through them.
- **Result:** Madrid's street map goes from 7 separate pieces to 4. A barrio taxi now picks you up at the kerb and drives 100% on streets.

**When you drive, the GPS follows streets.** Riding your own car, Zip-EV, tuk-tuk or scooter in a world with a street map, the minimap route and turn bar come from the road planner the taxis use. Walking and cycling keep the walkable route. Madrid test: 100% of 199 route points on streets.

**Background warm-up** (`pathfind.js`).
- **How it works:** after entering a world, idle frames fill the GPS cost cache bin by bin (nearest to you first, then around every place), within 2.5 ms per frame.
- **Memory:** the cache is a 4 KB byte array per 16 m bin, about 1 MB for a whole world.
- **Astro-9:** 517 bins in about 84 s, worst frame 25 ms. After that every sampled route takes ≤ 8 ms (it was 300–520 ms cold).
- **`suite_gps`:** back to 88/88.
