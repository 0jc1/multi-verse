# NPC state machines

Two layers, both plain scripts loaded after `js/npc.js`:

| File | What it is |
|---|---|
| `js/npc_fsm.js` | `AV.fsm`, a small generic state machine, and `AV.npc.brain()`, which puts any `AV.npc` character under one. |
| `js/npc_jobs.js` | **The Wandering Market**: six workers, one state machine each, set up in every world. |
| `data/npcs_workers.js` | What the workers say (EN/ES), including speech-bubble lines used by the states. |
| `tools/tests/suite_workers.js` | Browser test of every behaviour below (`node tools/tests/run_cdp.mjs tools/tests/suite_workers.js`). |

## The Wandering Market

A travelling crew that sets up a stall, depot, water barrel, potted plants, benches, a bin, a busking rug and a campfire on the most open, flat, reachable spot near where you arrive. Their jobs feed each other:

| NPC | Job loop | Interacts with |
|---|---|---|
| **Mae** (vendor) | Sits at the stall selling fruit (fruit visibly disappears) → shouts an order when stock ≤ 3 → restocks piece by piece when a crate arrives. Calls out to you when you're near. | Dash (orders), everyone (buys) |
| **Dash** (courier) | Waits at the depot → picks up Mae's order → carries the crate over → hands it to her → back to the depot. Restacks crates when bored. **Punch him while he carries a crate and he drops it**, then goes back for it after he gets up. | Mae |
| **Fern** (gardener) | Finds the thirstiest plant (they wilt: droop, turn brown, lose their flower) → waters it (droplets) → refills her can at the barrel when it runs dry. | Plants |
| **Tidy Tam** (sweeper) | Sweeps up the nearest litter → after 4 pieces, empties the bag into the bin (lid opens) → leans on the broom or strolls looking for more. | Litter dropped by everyone who eats |
| **Warden Bix** (guard) | Patrols 4 points, scanning at each → **warns you if you sprint past** → **chases you down and scolds you if you punch anyone** (sterner the second time), then follows you for a while. Naps in the afternoon, carries a lantern at night. | Everyone (alarm) |
| **Melo** (busker) | Plays guitar (real notes, ♪ particles, faster if you stand and listen) → passers-by drop coins → **E on the hat tips him 2 credits** and he bows → packs up, spends the coins at Mae's. | Mae, you |

Everyone except Mae also has needs that drift over time: **tired** → sits on a bench, **hungry** → buys fruit from Mae (and drops the wrapper, which Tam sweeps up), **lonely** → walks over to a crewmate and they trade a few lines about their day (using their real stats). At **bedtime** they sit and doze around the campfire. They wave when you come close, react when punched, and **pause while you talk to them**.

Talking: ask anyone *"what are you doing?"* (they read their live state) or *"how's it going?"* (they report real numbers: plants watered, crates delivered, litter swept, warnings given...). Greetings change with their current state.

The status line under every name tag shows the current state. In the console, `AV.npc.debug()` prints a table of every brain: state, seconds in state, needs, stats, and the last transitions with the reason for each.

A world opts out with `noWorkers: true` (like `noStoners`). Places marked private with `W.noStrangersAt` are avoided. If there's no open, flat area big enough, the world simply gets no market. On Low graphics the crew is four (Mae, Dash, Tam, Fern).

## `AV.fsm`: the state machine

```js
const m = AV.fsm.create({
  initial: 'idle',
  states: {
    idle:  { update(self, dt, m) { if (m.t > 3) return 'work' } },
    work:  { pri: 0, enter(self, m) { ... }, update(self, dt, m) { if (done) return ['rest', { long: true }] }, exit(self, m) { ... } },
    rest:  { pri: 2, enter(self, m) { /* m.data.long === true */ } },
    wave:  { pri: 1, transient: true, update(self, dt, m) { if (m.t > 2) return 'back' } }
  },
  on:  { hit: 'rest', delivery: (self, m, data) => ['restock', data] },        // events (a state's own `on` wins)
  any: [{ to: 'rest', pri: 2, when: self => self.tired }]                      // interrupts, checked every tick
}, self);
m.update(dt); m.send('hit'); m.go('idle', 'reason');
```

* **Transitions**: `enter`, `update` and event handlers return a state name, or `[name, data]` to pass parameters (read as `m.data`). Return nothing to stay.
* **Priorities**: an `any` interrupt fires only if its `pri` beats the current state's `pri` (which may be a function of the state's data). So "bedtime" (5) interrupts work (0) but not a chase (6).
* **Transient states** (a wave, a bow) return to whatever was interrupted with `'back'`, including its data.
* `m.state`, `m.t` (seconds in the state), `m.data`, `m.log` (latest transitions first, each with `why`), `m.is(...names)`, `m.pri()`.

## `AV.npc.brain(ctx, n, opt)`: an NPC under a machine

`opt = { role, fsm: <definition>, rates: { energy, hunger, social }, init(B) }`. The brain `B` passed to every state has:

| | |
|---|---|
| `B.walkTo(x, z, speed)` | Walk there. The route is planned around colliders, water and cliffs (`AV.npc.route`). Then `B.arrived` or `B.stuck` (timeout) becomes true. Returns false if unreachable. |
| `B.pose = 'water'` | Work pose on the classic pivots (`AV.npc.poses`: sit, sleep, carry, water, fill, sweep, lean, lift, give, arrange, hawk, wave, call, scold, play, eat, bow, talk, inspect, dump, lantern). Legs < -1 seat the soft-body rig. |
| `B.hold('crate')` | Show props carried in front of the body (`AV.npc.props` factories: crate, can, broom, guitar, lantern, fruit). `B.hold()` hides them all. |
| `B.faceTo(x, z)` / `B.free()` | Keep facing the job instead of turning to every passer-by. |
| `B.status('📦', ['Delivering', 'Repartiendo'])` | Status line under the name tag. Redrawn only when it changes. |
| `B.say(lines, force)` | Speech bubble (throttled, only when you're within 24 m). |
| `B.needs`, `B.mem`, `B.stats`, `B.dist` | Needs (0..1, drift per second × the state's `effort`; a negative effort restores energy), scratch memory, what this NPC has accomplished, distance to the player. |

Events sent by the brain: `chatted` (you closed a conversation with them; the machine is paused while you talk), `knocked` (punched, while down), `hit` (back on their feet).

## Adding a new job

1. Add a profile to `data/npcs_workers.js`: `role`, `look`, dialogue, `busy` greetings per state, and `lines` for speech bubbles.
2. Add a role to `ROLES` in `js/npc_jobs.js`: `sleep: [fromHour, toHour]`, `home(S)`, optional `init(B)`, `decide(B)` (return the next state, usually `needs(B) || 'myWork'`), and `states`. The shared states (walk, rest, eat, visit/chatWith, sleep, greet, rattled, idle) come for free.
3. A state that has to be somewhere first uses the walk-then-act pattern:
   ```js
   enter(B, m) {
     if (!m.data.at) return walk(x, z, ['myWork', { at: true }], { icon: '🔧', label: L('Off to fix it', 'Va a arreglarlo') });
     B.faceTo(x, z); B.pose = 'arrange'; B.status('🔧', L('Fixing it', 'Arreglándolo'));
   }
   ```
4. Add the id to `ORDER` in `js/npc_jobs.js`, then add a step to `tools/tests/suite_workers.js`.

Any other NPC (a quest giver in a world file) can use `AV.npc.brain()` directly with its own state definitions. It doesn't need the market.

## Testing note

The suite fast-forwards the world's update functions between checks. Headless software rendering runs at about 3 FPS and the main loop clamps `dt` to 0.05 s, so in real time a single delivery would take minutes.
