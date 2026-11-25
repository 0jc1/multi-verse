# M15: Koh Tao (`js/world_koh_tao.js`)

A compact, authored destination at 1 m to 1 m scale: Sairee Beach, Sairee village and Mae Haad pier. North is −z, and the Gulf of Thailand lies to the west, so the sun sets over the sea.

## The place

**Sairee Beach**
- A curved bay of golden sand with coconut palms and Koh Tao's rounded granite boulders on both headlands.
- Three longtail boats bob offshore.

**Sairee walking lane**
- A narrow concrete lane behind the beach with about 20 shopfronts. The names are fictional:
  - Island Mart, Sairee Roti, Coconut Café, Thai Massage, Mango Sticky Rice
  - Reef Dive Centre, Tattoo, Scooter Rent, Book Exchange, Laundry, Smoothies
- Beachfront bungalows and three beach bars sit between the lane and the sand:
  - Firefly Beach Bar
  - Lazy Tide Bar
  - Sunset Swing
- The bars have bean bags and fairy-light strings.

**Five sois** (alleys) connect the lane to the beach, forming several **walking loops**: lane → soi → beach → soi → lane.

**Hill road** from the lane up the jungle slope to the **Sairee viewpoint**, which sits among the boulders, looks over the bay and gives a small vibe boost.

**Mae Haad pier:** a wooden pier with the ferry alongside. The **ferry office opens the travel map**. You arrive here; the Portal Pipe arrives on the lane.

## The enterable business

**Blue Turtle Divers** has a real door gap. Inside:
- a counter
- a rack of wetsuits
- tanks and coloured fins
- a briefing board ("look, never touch")

The counter panel shows the reef log and sells a mask and snorkel (30).

## The activity: snorkelling the house reef

**How to start:** buy a mask, walk in from the sand and swim west past the shallows. Swimming speed drops to 0.55×.

**Without a mask** your head stays above water, and you can only wade.

**With a mask**, once the water is deep enough:
- the camera goes under the surface, with blue underwater fog, a vignette and the surface visible from below
- the reef has coral heads and sea fans
- seven species school around their own home spots

**The seven species:**
- parrotfish
- butterflyfish
- pink anemonefish
- a yellowtail barracuda school
- blue-spotted stingray
- hawksbill turtle
- blacktip reef shark

**Logging.** Swim close to fish for about a second to log the species: +10 credits and a little vibe each.

**Reward.** Log all seven for the **Reef Explorer** card and +150.

**Reef etiquette** is in the briefing: no touching, no feeding.

## Life and atmosphere

**People.**
- Walkers on a graph covering the lane, the sois and the beach.
- People sitting at the bars and a diver at the shop.
- A longtail captain.

**Fire show.** At Firefly Beach Bar, 20:00–01:00: fire poi, a ring of dancers and tiki torches along the beach at night.

**Festival.** **Sairee Fire Night** runs every Friday, 19:00–02:00, on the shared festival calendar (`AV.fest`). It brings more dancers, lantern strings over the beach and a stronger fire. It is a themed in-game event, not a claim about a real festival date. The gig guide lists it with its place.

**Day/night.**
- Lane lamps, fairy lights and torches light up at night.
- The sky is a clear tropical tint.
- The post-processing grade is Koh Tao's own: lower bloom and slightly more contrast and saturation. With the default bloom, the bright sand and sea washed the whole frame white.

**Sound.**
- waves near the shore, muffled underwater
- reggae from the beach bars
- longtail engines
- geckos and insects at night
- chatter in the lane

**Map.** The lane, sois, hill road and pier are on the minimap. Seven places are listed:
- Sairee Beach
- the walking lane
- Blue Turtle Divers
- Firefly Beach Bar (fire show)
- the house reef (snorkel)
- the viewpoint
- Mae Haad pier (ferry)

**Registry.** Koh Tao is in `data/worlds.js` and `data/worlds.json` as `koh_tao`, status playable, so it appears in the Portal Pipe and the travel map.

**Save.** A new optional field, `S.kohtao = { log, card }`.

## Verification

`tools/tests/suite_kohtao.js`, real GPU, Medium (laptop on battery): **42/42**.

- **Load:** registered; loads in about 1.1 s; you arrive on the pier.
- **Map and walking:** 7 places and 8+ roads on the map; the walking graph has 89 nodes, including the 5 sois.
- **Open paths:** nothing blocks the lane, the sois, the beach walk or the pier. This is sampled every 1–5 m.
- **Dive shop:** the door gap is open and the walls either side are solid. The counter works, and buying a mask costs 30.
- **Snorkelling:**
  - without a mask you're in the sea but your head stays above water
  - with the mask you snorkel: the camera is under the surface, the fog is underwater, the HUD shows, and swimming is slower
- **Reef log:** all 7 species logged; the Reef Explorer card and the exact reward paid.
- **Leaving the water:** the view and fog are restored.
- **Night:** the fire show is on at 21:00. On a Friday night, Sairee Fire Night is active, with lanterns and dancers, and the gig guide lists it.
- **Viewpoint:** walkable ground about 30 m up, with an interaction.
- **Ferry:** the office opens the travel map.
- **Persistence:** the reef log and card are saved; the real save is untouched.
- **FPS:** 60 on the lane and beach, about 50 at the fire show (battery, so this is not a performance claim).

**Regression (real GPU):** integration 131/131 (now includes Koh Tao), fest 38/38, band 62/62, music 43/43.

**Bugs found on the way:**
- **Dive shop walls not solid.** `ctx.building` only makes walls solid when they start below 1.2 m, and the village floor is at 1.25 m. The shop now sits at 1.19 m.
- **Washed-out daytime.** It was the shared default bloom on bright sand and sea, not the fog. Fog off and transparent meshes hidden made no difference; the per-world `post` grade fixed it. Other worlds still use the default bloom; Pai shows a milder version of the same haze.

## Not done yet

- **Buildings:** shopfronts other than the dive shop are façades, and there are no interiors for the bars or cafés.
- **Diving:** no scuba "try dive" below snorkel depth and no dive-site boat trips (Shark Island, Twins). The reef is stylised: dodecahedron corals and cone fish, not modelled species.
- **Rest of the island:** no Chalok, no Tanote Bay, no scooter riding on the hill roads, and the ferry is scenery.
- **Shared systems:** no traffic, residents (M11) or business premises (M9) here yet.
- **Default bloom elsewhere:** the shared default bloom also washes Pai; a per-world grade review is an M13 world-upgrade task.
