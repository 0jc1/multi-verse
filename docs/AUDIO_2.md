# Sound 2.0 (Apeverse 2.2, Agent 3): `js/audio2.js`

## Ownership and how it was built

Sound 2.0 is an **integration-ready module**. It sits on top of `audio.js` (real MP3 playlists, the DJ, the positional stage) and `ambience.js` (procedural world beds). It does not edit either file.

No handover of the shared audio files from Agent 1 was found in the repository, so the only touch points are runtime wrappers:
- `AV.audio.setWorld`
- `AV.audio.setDuck`
- `AV.amb.start`
- `AV.audio.track.pos` (turned into a property)
- `AV.toggleSettings`

The other small edit is one line in `traffic.js` (the horn).

Switch it all off with `AV.snd.off()`.

## What you hear now

| Area | What it does |
|---|---|
| **Mixer** | Four categories. Music (`S.set.vm`, existing) and Effects (`S.set.vs`, existing) keep their sliders. Ambience (`S.set.va`) and Voices (`S.set.vv`) are new sliders under Settings (O) → *Sound mix*. Mute (M) mutes everything. |
| **Acoustic spaces** | Indoor zones get a convolution reverb built from a procedural impulse response: bar, club, room, hall, cave and shop each have their own size and decay. Walking in or out fades the old room out and the new one in, so there are no pops. Indoors, the outdoor ambience bus is low-passed (muffled). |
| **Occlusion** | Every spatial source is checked against the walls (`W.cols`) on the line between you and it, 5–10 times a second. Each wall lowers the cut-off (18 kHz → 2.2 k → 900 → 500 Hz) and the level. A source in a different zone from you counts as one more wall. |
| **Venue music** | The world's positional MP3 goes through the same occlusion chain, so live music is heard down the street, gets clearer as you approach, and only the bass carries through walls. **Chiang Mai:** anywhere on Moon Muang Rd (Giant Hostel, Big Blues and the street between them), the set plays *from Big Blues*. From inside the hostel it is muffled across the street. Elsewhere, Chiang Mai's own nearest-venue logic still decides. Only one track ever plays, and media still ducks it. |
| **Footsteps** | One step per ~0.75 m actually walked, so it doesn't depend on frame rate. Surfaces: stone, wood (indoors), dirt, grass, sand, water, metal (Astro-9) and cloud (Nimbus). A world can override this with `W.stepMat(x, z)`. The older ambience "steps" layer is silenced so steps aren't doubled. |
| **Traffic** | The 4 nearest moving NPC cars (2 on phones) get an engine voice per type: car, scooter (buzzy, with tremolo), tuk-tuk, van and bus. Pitch follows speed. Horns are now spatial two-tone horns instead of a square beep. An occasional brake squeal plays when a fast car stops hard near you. |
| **Places** | Cafés, bars, markets, shops, fountains, rivers and workshops near you (matched from `W.places`, or registered) get a positional chatter, water or hum voice. Clinks and the till ring now and then. The pool is 5 voices (3 on phones), reassigned to the nearest places. |
| **Effects library** | `AV.snd.fx(name, {x, z})`: lighter, inhale, breath, exhale, bubble, gulp, fizz, crunch, bite, clink, stub, door, cash, coin, error, ok, horn, brake, bell, bikebell, splash, machine. Used by consumables, businesses and the garage. |

## Recordings and licences

`assets/sfx/manifest.json` lists recordings by effect id. A listed file replaces the synth for that id, and anything missing falls back to the synth.

**The manifest is empty.** No recordings were downloaded: fetching third-party audio needs the owner's go-ahead, and each file's licence has to be checked. To add one:
1. Put a CC0, CC-BY or owner-provided file under `assets/sfx/`.
2. Add `{ "id": "door", "file": "assets/sfx/door_wood.ogg", "license": "CC0", "source": "<url>", "author": "<name>" }`.

## API for world builders (Agents 1, 2 and 4)

```js
AV.snd.zone({ world: 'paris', id: 'cafe_flore', box: [x0, x1, z0, z1], space: 'bar' });   // 'bar'|'club'|'room'|'hall'|'cave'|'shop'
AV.snd.place({ world: 'tokyo', x, z, kind: 'market' });   // 'cafe'|'bar'|'market'|'fountain'|'water'|'machine'|'shop'
AV.snd.venue('vienna', { pos: { x, y, z }, bed: .15, area: [x0, x1, z0, z1] });   // pin the world track to a venue in an area
AV.snd.venue('x', { playlist: 'stone_ape_band', pos, bed });                       // or give a world a venue playlist
const e = AV.snd.emitter({ x, y, z, gen: AV.snd.GEN.water, gain: .4, max: 40 });   // custom spatial loop (occluded); AV.snd.remove(e)
W.stepMat = (x, z) => x > 40 ? 'wood' : 'stone';                                    // per-area footstep surface
AV.snd.fx('bell', { x, z });                                                        // one-shot, positional when x/z are given
AV.snd.state(); AV.snd.meter();                                                     // for tests: space, zone, voices, RMS level
```

Zones are matched smallest first, so a bar inside a district zone wins.

## Performance

- **Voice limits:** 4 traffic voices and 5 place voices on desktop; 2 and 3 on phones. Phones use equal-power panning; desktop uses HRTF.
- **Occlusion:** runs at 10 Hz in total, and only for sources within range. It is an axis-aligned box test over `W.cols`, skipped early by bounding box.
- **Reverb:** one convolver. A room change rebuilds a 0.6–3.2 s impulse response once.
- **Measurement:** see `docs/AGENT3_STATUS.md` for the frames per second with Sound 2.0 on and off, measured interleaved at the same spot.
