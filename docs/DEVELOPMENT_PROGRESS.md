# Development progress — Apeverse

Legend: **IT** implemented + tested · **I** implemented, untested · **P** partial · **PL** planned · **M** media missing

## V0.9.1 — Phase 0 + Phase 1 (2026-11-18)
| Area | State | Notes |
|---|---|---|
| Backup of untouched V0.9 | IT | `..\apeverse 0.9 - BACKUP (original V0.9, 2026-11-18)` (byte-identical copy, 39 files) |
| Local server without Python | IT | `tools/serve.ps1` (PowerShell, HTTP Range, parallel), `start_server.bat` falls back to it |
| Automated tests without Node | IT | `tools/tests/run_tests.ps1` + `suite_cdp.js` (Chrome DevTools protocol) |
| World kit: instanced psychedelic flora (wind sway, night glow), sky dome, iridescent water, waterfalls, fireflies, hand-drawn signs, name tags, lantern strings | IT | `js/world_kit.js`; `AV.terrain` moved here |
| Cinema screens: autoplay on the 3D screen, positional sound, programme panel, several screens per world | IT | `js/media.js` |
| Living paintings: proximity sound (closest faced), nearest frames get video slots | IT | |
| Music ducking under media | I | graph verified, not auditioned |
| Portal Pipe: smoking animation, exhale smoke, portal forms from smoke, psychedelic selector, places-in-world hops | IT | `js/portal.js`, CSS |
| NPC dialogue engine + content (Zil, Luma, Grakk, Bongo, Nix; EN/ES) | IT | `data/npcs.js`, `js/chat.js`; AI hook documented in `docs/NPC_AI.md` |
| Living NPCs (name tags, barks, look-at, talk gestures, walking routes) | IT (tags, facing) / I (routes: used from Phase 2) | `js/npc.js` |
| Quests (5) + items + inventory list | IT (bissap quest end-to-end) / I (other 4) | |
| Optional CC0 GLB models with procedural fallback | I | `js/assets.js`, `data/models.js`, `tools/register_models.ps1`; no models installed yet |
| Gravity Points refill daily (message was wrong in V0.9) | I | |

## V0.9.2 — Phase 2: Ape Town rebuilt from the masterplan (2026-11-19)
| Area | State | Notes |
|---|---|---|
| Backup before rebuild | IT | `..\apeverse 0.9.1 - BACKUP (Phase 1, before Ape Town rebuild, 2026-11-19)` (51 files, byte-identical) |
| 21 CC0 GLB models (Quaternius, via poly.pizza; licence checked per model) | IT | `assets/models/quaternius/` + `LICENSE_CC0_CREDITS.md`; instanced, chunked, wind-sway; procedural stand-ins on file:// and Low |
| Architecture kit (`js/arch_kit.js`): painted textures, onion/dome/tent pavilions, arched walkable bridges, Mediterranean houses, pagoda, Stone Ape head, lotus petals, bench rows, boulder cliffs, cacti, floating islands, mountains, dancing crowd | IT | batched per district |
| Ape Town layout (≈245×238 m, ≈5–6× V0.9 area) | IT | La Finca + market lane, lotus pond stage, ring canal + 6 bridges, Circular Plaza (mosaic, fountain), 5 café pavilions + Bissap kiosk, cinema amphitheatre, Gallery Gardens path (15 frames), La Muria + eco-lodge, NW waterfalls + Stone Ape, Jungle/Temple/Asia/Desert/Crystal gardens, Stone Ape Tunes, Portal Grove |
| New interactions | IT (labels) / I (each purchase) | Rainbow Bowl, dumplings, herbal tea, kaleidoscope booth, 3 market stalls, singing crystal, Stone Ape wisdom, temple meditation, alien band |
| New NPCs Pip, Sol, Kiko (EN/ES dialogue) | I | Pip and Luma walk routes |
| Spatially chunked instancing + distance culling; characters compacted (~7 draw calls per ape) | IT | |

## V0.9.3 — Real music (2026-11-22)
| Area | State | Notes |
|---|---|---|
| Working copy | IT | `..\apeverse 0.9.3 - WORKING (music + graphics, 2026-11-22)`; `apeverse 0.9` and all backups untouched |
| MP3 playlists (`data/music.js`, `js/audio.js`) | IT | one reused `<audio>` element; Web Audio routing (positional panner + non-positional bed) over http; direct element volume on file:// |
| Jungle Dub plays the dub tracks from the sound system | IT | Dub Hype parts 1–5 in order, then the dub singles |
| Stone Ape Band plays Ztonedape boom-bap from the Lotus Stage | IT | shuffled; concert panel shows the song; **N** = next song |
| Procedural music kept as fallback | IT | worlds without a playlist (Verdalux, Astro-9), or when every file fails |
| Stage lights / dancing follow the track (estimated bpm) | I | |
| Regression suite | IT | 77 / 77 pass |

## V0.9.3 — Jungle Dub visual rebuild (2026-11-22)
| Area | State | Notes |
|---|---|---|
| Code snapshot before rebuild | IT | `..\apeverse snapshots\apeverse_v0.9.3_music_2026-11-22 (code, before Jungle Dub rebuild, no media).zip` |
| Painted jungle ground (paths, worn dance-floor dirt, river banks, flowers) + detail grain | IT | replaces flat vertex colours |
| River is now real water with carved bed + 3 walkable arched bridges; waterfall pool behind the stage with cliff + crystals | IT | the river and the pool cannot be walked on |
| Sound-system stage: deck, thatched canopy, bamboo back wall, textured speaker stacks, 3D woofers pumping to the track, DJ booth with spinning records, bulb strings, light beams at night | IT | same position, collider covers the deck |
| Glowing rasta dance floor + dancing crowd (8/14/20 by quality) | IT | |
| Bamboo village: 4 thatched round huts with doors, glowing windows, lanterns | IT | huts moved out of the river ring |
| Bamboo art wall: 4 frames on an arc facing the dance floor (V0.9 had two hidden behind the others) | IT | still "awaiting artwork" plaques |
| CC0 models: palms, ferns, bushes, flower groups, mushrooms, lily pads, moored boats, crystals (procedural stand-ins on file:// / Low) | IT | |
| Rim boulders + rising jungle bowl close the clearing | IT | |
| Performance (Intel Iris Xe, real GPU, render only) | IT | High ≈ 9.5 ms/frame (142 draw calls, 332k tris); Low ≈ 2.7 ms (128 calls, 116k tris) |
| All V0.9 interactions kept: Bongo, one-drop spot, gold arch to Ape Town, arrivals, Pipe places | IT | 77 / 77 regression pass |

## V0.9.3 — Character rebuild (2026-11-22)
| Area | State | Notes |
|---|---|---|
| Code snapshot before rebuild | IT | `..\apeverse snapshots\apeverse_v0.9.3_jungle_dub_2026-11-22 (code, before character rebuild, no media).zip` |
| Sculpted ape body (`js/chars.js`): lathe torso, pelvis, tapered limbs with elbows/knees, sleeve cuffs, hands with 4 fingers + thumb, sneakers with soles/toe caps/laces | IT | same pivots and `userData` API, so all animations, NPC gestures and instruments still work |
| Face: brow ridge, face mask, muzzle, eyes (sclera, coloured iris, pupil, highlight), nostrils, smile, two-tone ears | IT | |
| Fur texture on fur parts | IT | merged per pivot: ≈2 draw calls per moving part |
| Stone Ape Band: gorilla (beanie with rolled brim, dreads, STONE SAMPLES tee, hourglass upright bass with f-holes, bridge, strings), Ztonedape (bucket hat + band, tie-dye, cargo pockets, MPC with knobs, chain on chest), orangutan (cheek pads, shaggy crown, green shades with frames, Hawaiian shirt, curved gold sax with bell and keys) | IT | |
| NPCs (Zil, Luma, Grakk, Bongo, Nix, Pip, Sol, Kiko, alien band, Stone Ape statue) | IT | same colours/hats; breathing torso now visible (it was merged away before) |
| Dancing crowds (Ape Town, Jungle Dub) use a baked low-detail version of the same ape (3 draw calls for the whole crowd) | IT | ≈3.7k triangles per dancer; Low graphics shows half the Ape Town crowd |
| Low graphics: every character uses the lighter mesh | IT | |
| Performance (Intel Iris Xe, render only, arrival views) | IT | Ape Town High 9.2 ms (428 calls, 708k tris), Low 2.8 ms (304 calls, 294k tris); Jungle Dub High 7 ms, Low 1.7 ms |
| Regression suite | IT | 77 / 77 (one run had a timing failure in "concert panel near stage" under software rendering; passed alone twice and on a full re-run) |

## V0.9.3 — Astro-9 visual rebuild (2026-11-22)
| Area | State | Notes |
|---|---|---|
| Code snapshot before rebuild | IT | `..\apeverse snapshots\apeverse_v0.9.3_characters_2026-11-22 (code, before Astro-9 rebuild, no media).zip` |
| Station deck: painted plating, walkways, hazard ring round the club, casino carpet, glowing guide lines (emissive map) | IT | replaces the flat grid |
| Rim wall with glowing rail and pylons, hull under the deck, glass dome with glowing ribs | IT | same walkable area and colliders |
| Space: banded gas giant with a textured ring, moon, slow asteroid belt, two passing ships | IT | |
| Club Graviton: pillars, see-through glass walls (open front), domed ceiling with ribs, LED floor as ONE instanced mesh (was ~57 meshes), mirror ball, 4 light beams, speaker stacks with pumping woofers, DJ desk with spinning decks, low-gravity dancing crowd | IT | low-gravity zone and dance-floor spot unchanged |
| Casino: neon wall + canopy + bulb string, 3 slot cabinets with reel screens and levers, Gravity Points pillar | IT | same rules: fictional points only, never credits |
| Artwork bay wall with light strips; planters with alien flora; arch pylons | IT | |
| Performance (Intel Iris Xe, render only, arrival view) | IT | High 6.3 ms (67 draw calls, 118k tris); Low 1.9 ms (67 calls, 75k tris) |
| Regression suite | IT | 77 / 77 |

## V0.9.4 — Chiang Mai: the Living Festival City (2026-11-22)
| Area | State | Notes |
|---|---|---|
| Backups | IT | `..\apeverse 0.9.3 - BACKUP (Astro-9 done, before Chiang Mai, 2026-11-22)` (full copy) + code zips in `..\apeverse snapshots\` |
| City layout (`js/world_chiang_mai.js`) | IT | walled Old City + moat + 4 gates, ~330 procedural shophouses, Tha Phae Rd, Night Bazaar (17–24h), Warorot Market (6–18h), Ping River (pier, footbridge), Lantern Field, Doi Suthep on the horizon, Buak Hard Park, Wat Chedi Luang, Wat Phra Singh, teak temple, Gecko Shrine |
| Giant Hostel | IT | reference sign (New SiriSuk / GIANT HOSTEL / Chiang Mai), mural, rainbow canopy, neon leaf; enterable: reception (rent bed 40, scooter 50, festival board), shop counter, lounge, pool table, corridor + 4 guest rooms (sleep to 08:00) |
| Venues | IT | Blue's Live Music Bar (band evenings), Pineapple Express, Khun Kae's, Chada's, 24h mini mart, Rack & Roll Pool Bar — enterable, buy interactions |
| Crew (`data/npcs_cm.js`, `js/chars_human.js`) | IT | Mutt, Nuni, Steve, Dino, ZtonedApe (+ Nunyin, Cough): human bodies, props (beer, joint + smoke, ukulele, phone), schedules, banter between crew, EN/ES dialogue |
| Missions | IT | Welcome to Giant, Mango for Mutt, Get Your Ass Kicked by Nuni, Jam at Blue's (rhythm game), Dino's weird shortcut, sky lantern, krathong, Songkran water war, Light up Giant |
| 8-ball (`js/pool.js`) | IT | physics, pockets, fouls/ball-in-hand, groups, 8-ball rules; Nuni simulates shots (pots ~83% of direct shots in tests) |
| City life (`js/city_life.js`) | IT | instanced pedestrians (walk/sit/talk/dance/splash/drum/monk), traffic (left-hand), dogs (Bobo, Frenchie, strays), birds, rain, smoke, weather, random events |
| Modes (F / festival board) | IT | Yi Peng & Loy Krathong (≈3,400 lanterns, ≈1,300 candles, parade, krathongs, sky-lantern stream + hourly mass release) · Songkran (bunting, barrels, water gun Q / Splash button, NPC water fights, trucks) |
| Transport + portals | IT | 10 tuk-tuk stands (30 credits; free with Nuni on her mission), scooter ×2 speed; Apeverse Portal on the terrace; Ape Town Portal Grove 4th gate now Chiang Mai |
| Tests | IT | `tools/tests/suite_cm.js`: 62/62 desktop; phone joystick in all 5 worlds 15/15; original suite 76/77 + flaky "concert panel" passes alone |

### Movement bug (fixed, V0.9.4)
Cause: while adding the scooter speed multiplier, a `//` comment was inserted in the middle of a line in `js/core.js`, which commented out `P.vx += …; P.vz += …` — horizontal velocity never changed, so WASD/joystick did nothing in every world, while jumping (vertical velocity, separate line) still worked. Fix: the comment was moved to its own line. Verified in the browser in all 5 worlds (walk ≈4 m/s, run ≈7.5 m/s, strafe, jump 1 m, collisions), through the hostel door/corridor/rooms, portals there and back, and on an emulated phone (joystick + jump button).

## V0.9.5 — Milestone 2: universal backpack + effects (2026-11-22)
| Area | State | Notes |
|---|---|---|
| Item registry (`data/items.js`) | IT | 31 items: drinks, food, smoking (adults-only), psychedelic/alien, instruments, souvenirs; old item ids kept, so old saves and missions still work |
| Backpack (`js/bag.js`) | IT | works on every planet; I / Bag opens it; Use · Hold · Drop per item; U uses the held item; phone Use button |
| First-person viewmodel | IT | held item in the left hand; eat (bites + crunch), drink (tilt + gulps), smoke (smoke puffs), play (melody per instrument), wear, examine/alien (rotate + hum); real-time timing |
| World pickups + drops | IT | glowing pickups on all 5 worlds (respawn next game day); dropped items stay in that world (saved) |
| Effects (`js/effects.js`) | IT | drink / smoke / psychedelic / buzz / alien-glow ramp in (~12 s), hold, fade out (2–5 min × duration); screen colour, vignette, camera sway + FOV breathing (off with reduced motion), low-pass on the music; intensity + duration sliders; X or button clears instantly |
| Shops | IT | Chiang Mai food/drinks go into the backpack; hostel shop: beer, water, Thai tea, snacks, tee, ukulele, pre-roll, herb pouch, glass pipe; Mutt's "terrace only" smoking rule |
| Tests | IT | `tools/tests/suite_bag.js` 38/38 desktop, 4/4 phone; original 77/77; Chiang Mai 62/62 |

## V0.9.6 — Cinematic graphics prototype: Astro-9 Gaudí Spiral Plaza (2026-11-22)
Still three.js r128 (no engine upgrade). Everything is in new files except three small hooks in `js/core.js` (render call, settings section) and the sky-dome `LIN_OUT` switch in `js/world_kit.js`.
| Area | State | Notes |
|---|---|---|
| Post-processing (`js/gfx.js`) | IT | r128 EffectComposer: scene → UnrealBloomPass → colour grading (ACES, lift/gain, saturation, contrast, vignette, grain) → FXAA. Half-float HDR target when the GPU supports it (8-bit fallback). Only worlds that declare `post` use it (Astro-9); all other worlds render exactly as before |
| HDRI reflections | IT | Poly Haven CC0 `shanghai_bund_1k.hdr` → PMREM; applied to registered PBR materials (plaza, aliens, mirror ball, club glass). Procedural neon environment on `file://` or if the HDRI fails |
| Trencadís mosaic (`js/gfx_forge.js`) | IT | procedural Voronoi shards: colour + normal (per-shard tilt, grout bevel) + roughness maps, seamless, 512 px Low / 1024 px Medium–High |
| Spiral tower | IT | GLB `assets/models/astro9/spiral_tower.glb` (16 m, ~15 k tris) with the procedural tower as fallback; materials swapped by name so a Blender export drops in |
| Rigged aliens | IT | Zib (walks around the tower, waves when you come close) and Orbo (dances in time with the music); 16-bone SkinnedMesh GLBs with Idle/Walk/Dance/Wave clips, procedural fallback; talk with E |
| Settings | IT | Settings → Cinematic graphics: Bloom + colour grading (Auto/On/Off), bloom strength, HDRI reflections (Auto/On/Off). Auto = on for Medium + High, off for Low |
| Tests | IT | `tools/tests/suite_gfx.js` (http + `-FileMode` fallback) |

Frame time at the plaza, Intel Iris Xe, 1600×900 window (median of 60 frames, render only):
| Preset | Original look | Cinematic |
|---|---|---|
| Low | 7.7–11.7 ms (canvas 1600×900) | off by default; forced on 10.4 ms |
| Medium | 8.8 ms (≈114 fps, 1839×1035) | 11.3 ms (≈88 fps, 1600×900, FXAA, half-res bloom) |
| High | 16.9–18.6 ms (≈54–59 fps, 2400×1350) | 15.8 ms (≈63 fps, 1600×900, FXAA, full-res bloom, shadows) |
MSAA 4× on the HDR target was tried first: 26–54 ms on High, so it was replaced by FXAA, with the pixel ratio capped at 1 while the cinematic path is on.

## V0.9.7 — Living Multiverse update, Stage 1 (2026-11-22)
Backup before starting: `apeverse snapshots\apeverse_v0.9.6_gfx_prototype_before_living_update_2026-11-22.zip`.
| Area | State | Notes |
|---|---|---|
| Rigged characters (`js/beings.js`) | IT | one 16-bone skeleton, species templates: ape (beanie / dreads / shades / tee), human (hair styles, cap, backpack, shades, shirt/pants), alien, robot (chrome + glowing visor), frog (tiny top hat), spirit (glowing); random height, body, colours; clips Idle/Walk/Dance/Wave; wander (avoids colliders), dance on the beat, idle (faces you), float (zero-g) |
| Where | IT | Ape Town Lotus Stage audience (replaces the primitive crowd) + promenade strollers; Astro-9 club dancers (half float) + merchants/tourists; Jungle Dub dance floor (replaces primitive crowd), frogs at the pool, village wanderers; Chiang Mai locals/backpackers (hostel street, bazaar, gate). Counts scale Low/Medium/High |
| Quick social chat | IT | E on any new character: greeting by species + a context line (time of day, festival mode, rain, zero-g, the song playing, you being drunk / stoned / hungry) + replies: something weird · tips (places, active quests) · dance with me · leave; EN/ES |
| Items | IT | switch held item: mouse wheel / B / phone ⇄; ZtonedApe's furry first-person hand; drinks stack (tipsy → drunk → very drunk messages, stronger sway + sideways stagger while walking); smoking lasts ~5.5 min with a slow colour drift, more saturation, gentle wobble, muffled music; Energy + Vibe (HUD %): food fills energy, drinks/smoke/music lift the vibe, hunger warning |
| Films | IT | the user's own films hard-linked into `assets/media/films/` (no extra disk space): The Last Classic Bangers (28 episodes) + 5 long ORIGINALS videos + the 20 ZtonedApe music videos that were listed as "not supplied" (`data/films.js`). Screens choose programmes by tag: Ape Town (whole film + music videos + shorts), Cinema 9 on Astro-9 (Club Graviton episodes + music videos), Jungle Cinema (jungle/cave episodes) |
| Audio priority | IT | near a playing screen the world music fades to silence (full duck, was 80%) and the film's positional sound takes over; walking away brings the music back |
| Chiang Mai | IT | Blue's Live Music Bar moved directly opposite Giant Hostel (Pineapple Express moved next door); 19:00–01:00 the live band plays at Blue's (positional, heard from the hostel terrace); F / phone "Fest" cycles Normal → Yi Peng & Loy Krathong → Songkran; tuk-tuk rides are real: you sit in the back while it drives the street graph (E / Act skips) |
| Club Graviton | IT | true zero gravity: jump and you float; Space / Jump rises, C / phone "Sink" goes down; soft ceiling under the dome; half the dancers float |
| Tests | IT | `tools/tests/suite_v097.js` 34/34 desktop (after timing fixes), 7/7 phone |

## V0.9.8 — Living Multiverse update, Stage 2 (2026-11-22)
Backup before starting: `apeverse snapshots\apeverse_v0.9.7_stage1_done_before_stage2_2026-11-22.zip`.
| Area | State | Notes |
|---|---|---|
| Astro-9 districts (`js/astro9_districts.js`) | IT | the station rim now has 4 gates; curved glowing walkways lead to floating districts: **Star Bazaar** (12 stalls, 4 food stands, Orbit Lounge round bar, lantern strings, robot/alien vendors), **Gaudí Towers** (3 mosaic spires, serpentine bench, lamps, Casa Trencadís café, hidden shrine = 1 space crystal/day), **Docking Bay** (3 ships on glowing pads, crates, moving monorail car, the Weirdest Vending Machine), **Glow Gardens** (glass dome, alien flora, chill cushions, glow-tea stand, floating spirits). All on the travel list |
| Jungle Dub outer jungle | IT | world radius 52 → 108 m; the old rim is now a walkable plateau with 5 trails (checked: no water, max 0.36 m step) to **Lotus Lagoon** (4 floating bungalows on stilts with piers, lily pads, lagoon bar), **Roots Village** (6 huts, bonfire drum circle with dancing apes, Rasta flags, ital kitchen), **Treehouse Lounge** (giant tree, hammocks, open-mic stage), **Healing Garden** (herb beds, pond, tea hut), **Hidden Falls** (secret pool, waterfall, glowing mushrooms, floating spirits, chill cushions); extra forest, flowers, bird flocks, 4 ponds |
| More life | IT | ~45 rigged residents on Astro-9 and ~40 in Jungle Dub on High (fewer on Medium/Low); frogs at ponds, spirits at the falls, robots at the docks |
| Chiang Mai street crowd | tried, reverted | the medium-detail body for the instanced crowd cost 2–3× the triangles (0.7M → 1.4–2.1M) for little visible gain; the crowd keeps its light geometry, rigged locals are added at the hotspots (Stage 1) |
| Render cost (High, headless count incl. shadow pass) | measured | Astro-9 districts 0.19–0.28M tris / 100–150 calls; Jungle Dub 0.8–0.9M / 310–530 calls; crowd shadows switched off to halve their draw calls |
| Tests | IT | `tools/tests/suite_v098.js` 45/45 |
## V0.9.9 — Stage 3: Vienna 2000s Memory World (2026-11-22)
Built from `Downloads\ape multiverse 1\worlds\Apeverse Vienna 2000s Memory Map (1).png` (newer version: Badeschiff + VIS by the Alte Donau). Backup: `apeverse_v0.9.8_stage2_done_before_vienna_2026-11-22.zip`.
| Area | State | Notes |
|---|---|---|
| World (`js/world_vienna.js`) | IT | ~380 × 300 m, north = up as on the map; Gründerzeit perimeter blocks with painted facades, gable roofs and lit shopfronts; Ringstraße with tram tracks + tree alleys; 7 radial avenues |
| Landmarks | IT | Stephansplatz + cathedral (zigzag tiled roof, 78 m spire); Waxy's Irish Bar · Lukas Viennese Bar · Dons Shisha Bar (open fronts, counters, shops, summer parasols); Würstel Stand; Happy Noodles; Flex (club under the Donaukanal walls, colour-cycling light); Badeschiff (walkable deck, glowing pool, gangway, dancers); Naschmarkt (18 stalls); Karlsplatz (Karlskirche dome + columns + pool, summer cinema with the music videos + film, rave stage); Stadtpark (pond, golden living statue); Prater (rotating Riesenrad with level cabins, roller coaster, carousel, bar, lights); Christmas market; Belvedere; Schönbrunn (palace, parterre, fountain, Gloriette); Memory Zone (graffiti wall, basketball court, skate ramp); 22nd district towers + VIS school; Donauinsel beaches; Kahlenberg (hill, TV mast, viewpoint); portal to Ape Town |
| Water + bridges | IT | Danube band with the Donauinsel (walkable), Donaukanal, Alte Donau, Stadtpark pond, Schönbrunn fountain; 4 canal bridges, 2 Danube bridges (Reichsbrücke to the 22nd) |
| Transport | IT | U-Bahn fast travel between 7 stations (2 credits); rideable Ring tram (sit inside, ride round the Ring, E / Act to hop off); trams + bikes as traffic |
| Seasons | IT | F / phone "Fest": Summer (terrace parasols, beach umbrellas, sailboats) ↔ Winter (snow, white roofs + trees, Christmas market open with Glühwein / Punsch / Sachertorte, lit tree, ice rink) |
| People | IT | ~47 rigged characters on High: bartenders Sean, Lukas, Don; Old friends Max + Sophie; Frau Huber; DJs at Flex + Karlsplatz; Badeschiff + Karlsplatz dancers; tourists, Naschmarkt vendors, hiker on the Kahlenberg, VIS classmate; chats add Vienna 2000s memories (burned CDs, MSN, U6 at 4 a.m., Euro 2008…) |
| Items | IT | `data/items_vienna.js`: Käsekrainer, Happy Noodles, Sachertorte, Melange, Almdudler, Weißer Spritzer, Glühwein, Punsch, Waxy's pint, shisha + souvenirs (flip phone, MP3 player, burned CD) as pickups |
| Music | IT | "Vienna Memories" playlist (all ZtonedApe + Stone Ape Band tracks), positional at Karlsplatz; films take over near the summer cinema |
| Access | IT | 5th Portal Grove gate in Ape Town; Portal Pipe + travel map (Vienna was already on the roadmap list) |
| Tests | IT | `tools/tests/suite_v099.js` 43/43 desktop; render 0.37–0.44M tris / 110–300 calls on High (headless count) |
## Next (as of V0.9.8)
| Phase | Scope |
|---|---|
| 2 — Ape Town | Rebuild to the masterplan: La Finca gateway, lotus canal + bridges + boats, Circular Plaza ring of cafés, cinema facing the plaza, Gallery Gardens (45-frame layout), La Muria, waterfalls + stone ape head, Portal Grove, Crystal Garden, Asia/Temple/Desert gardens; more NPCs and crowds |
| 3 — Jungle Dub Village | Rave stage, Roots Village, Dub Lab, Bamboo Bazaar, River Bar, floating bungalows, Lotus Lagoon, treehouses, Jungle Cinema, crystal waterfalls |
| 4 — Astro-9 Market | Central Plaza, bazaar, Astro Café, Orbit Lounge, Docking Bay, Cinema 9, Glassopy observatory (Club Graviton kept) |
| 5 — Polish | real-device performance, docs |

## V1.0 — Jerusalem & the Judean Desert (regional worlds + characters, 2026-11-23)
| Area | State | Notes |
|---|---|---|
| Regional wardrobe (`js/anatomy_regional.js`) | IT | sculpt-worker garments: long sleeves, tailored jacket, long robe (thobe/coat/habit), plate vest + pouches; new head sculpts: helmet, fedora, kippah, keffiyeh + agal, hijab wrap, hood (all cached in IndexedDB like the rest) |
| Regional people (`js/chars_regional.js`) | IT | soft-body roles: business, businesswoman, soldier, orthodox, vendor, bedouin, hijabi, embroidered, pilgrim, monk, nun, student, elder, guide; props (briefcase, coffee, bag, beads, staff, radio, camera, backpack, apron, canteen); fabrics (keffiyeh, red keffiyeh, camo, pinstripe, embroidery); instanced crowd variants `suit/orthodox/keff/hijab/soldier/robe/monk/nun` with per-instance colours; vehicles `bus` + `jeep` |
| Jerusalem (`js/world_jerusalem.js`) | IT | ~500×360 m: Old City walls with 7 named gates + walkable ramparts, 4 quarters, Temple Mount esplanade with golden Dome of the Rock + Al-Aqsa under restoration, 4 minarets, Western Wall plaza (courses of ashlar, notes in the cracks, menorah), Holy Sepulchre (two domes + the immovable ladder), Tower of David citadel, the Cardo columns, covered souk alleys with striped canopies and stalls, ka'ak carts at Damascus Gate, Mamilla avenue, Jaffa Road + light rail (grass track, 3 stations, rideable), City Hall, Mahane Yehuda roofed market, Mount Zion dome, Mount of Olives domes + Kidron valley tombs, patrol post, portal, cypress + olive groves |
| Judean Desert (`js/world_judean_desert.js`) | IT | ~520×420 m: Dead Sea with salt shoreline + wade/float zone + salt pillars, Ein Gedi canyon (waterfall, 3 pools, stepping stones), Masada mesa (walkable Roman ramp, plateau with Herod's terraces + cisterns, cable car station with cable), Qumran cave with jars, Bedouin camp (goat-hair tents, fire with kettle, rugs, saddled camels), patrol outpost (hut, sandbags, jeep), beach kiosk + umbrellas + mud tubs, Route 90 with bus stop, portal, palms + acacias; modes Day / Sunset / Night (F) |
| Named cast (`data/npcs_worlds.js`) | IT | Dalia, Yossi, Karim, Miriam, Elias (Jerusalem); Sgt. Noa, Salem, Amir, Tomer (desert) — full EN/ES dialogue |
| Missions | IT | Dalia's Grand Tour (5 glowing checkpoints), The Lost Briefcase (Miriam → Yossi), Ka'ak for Karim, Water Run (3 bottles → Noa), The Lost Hiker (Qumran cave), Zahra's Walkabout (camel near Masada) |
| Items (`data/items_jerusalem.js`) | IT | falafel, hummus, shakshuka, ka'ak, rugelach, halva, dates, pomegranate juice, mint tea, cardamom coffee, sage tea, Armenian tile, olive-wood camel, postcard, Dead Sea mud, salt crystal + world pickups on both maps |
| Music | IT | procedural `maqam` style (maqam Hijaz, maqsum darbuka, oud plucks, drone; `sparse` variant for the desert) |
| Ape Town Portal Grove | IT | 8th + 9th gates → Jerusalem (gold) and Judean Desert (salt-blue), each with an arrival point |
| Tests | IT | `tools/tests/suite_jlm.js` via `tools/tests/run_cdp.mjs` (macOS/Linux headless-Chrome runner, no dependencies) |

## V0.9 (original, unchanged features)
Engine/world manager, save v2 + V0.8 migration, EN/ES, settings, Stone Ape Band, Zil job/shift economy, rent, kiosk, Verdalux Drum Log,
Astro-9 slice, Jungle Dub slice, 8 living paintings, cinema shorts reel — all still present and re-tested.

## V1.0 kit — Milestones 0–3: shared shop/dialogue systems + Jungle Dub vertical slice (2026-11-22)
Source: `Apeverse_V1_Expansion_Kit.zip` (copied to `design/apeverse-v1/`). Full audit and integration map: `docs/APEVERSE_V1_IMPLEMENTATION_STATUS.md`.
| Area | State | Notes |
|---|---|---|
| Backup | IT | `apeverse snapshots/apeverse_v0.9.9_vienna_before_v1_kit_2026-11-22 (code, no media).zip` |
| Shop panel `AV.shop` (price list, reach + balance checks, one debit per tap, receipt, vendor memory) | IT | `js/v1_systems.js` |
| Dialogue panel `AV.talk` (2–4 choices, first meeting vs return) | IT | `js/v1_systems.js` |
| Accessibility: Disable intoxication visuals, No flashing, Clear effects button | IT | `js/v1_systems.js`, `js/effects.js` |
| HUD effect badge (time left) + current task | IT | `js/v1_systems.js` |
| Jungle Dub: River Bar (Ras Mo, 5-item menu), Bamboo Bazaar (Maker Lua), Dub Lab, Jungle Temple, Mushroom Grove, renamed High Canopy Camp / Herbal Garden / Crystal Waterfalls | IT | `js/world_jungle_dub.js` |
| Stone Ape Band on the Jungle Rave main stage (own lines each) + Bass Check quest (+45 once) | IT | `js/world_jungle_dub.js`, `js/npc.js` (`turnName`) |
| Kit's own checks (`validate_content.py`, `node --test`) | NOT RUN | Python and Node are not installed on this machine |