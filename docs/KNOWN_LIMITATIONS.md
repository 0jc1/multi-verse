# Known limitations — Apeverse V0.9

Honest list. Nothing here is hidden behind a "coming soon" that looks like a feature.

## Content that does not exist (not faked)
* **Cinema films:** 0 of the 20 listed feature films were supplied. Their titles are shown greyed-out ("file not supplied"). The cinema plays only real files: the 8 supplied animated-painting shorts are offered as a "shorts reel".
* **Paintings:** 8 of 15 Ape Town frames have a real video. The other 7 (Chill Rhythms, Harp Hop, Harp Hop 2, Hazy Wonderland Vibes, Grinding Forever, In The Music, Wonderland Jamms) show an "Awaiting artwork" plaque. The 3 Astro-9 and 4 Jungle Dub placements are also plaques; their files were not supplied.
* **Music files (V0.9.3):** 16 original Ztonedape MP3s are in `assets/music/` and listed in `data/music.js`: 9 dub tracks for the Jungle Dub sound system, 7 boom-bap tracks for the Stone Ape Band in Ape Town. Tracks were picked by filename (the MP3s have no genre/album tags), so edit `data/music.js` to change the lists. Verdalux and Astro-9 have no playlist yet and still use the procedural music, which is also the fallback whenever a playlist cannot load. Over http the music is positional (it comes from the stage). From file:// it plays directly, and the volume follows your distance from the stage.
* **21 roadmap worlds** (Cyberpunk Metropolis, Atlantis, Somatra, Neon Nexus, Quantum Ziggurat, …) are only registry entries. The Portal Pipe lists them as Under construction.
* **Chiang Mai, Somatra, Atlantis** were optional in the brief and are **not built**.
* **Subtitles:** no subtitle files were supplied; the setting is shown as not applicable.
* **Languages:** English and Español only. Since V0.9.1 Grakk also speaks Spanish.

## V0.9.1 notes
* **3D models:** the CC0 model pipeline is ready but no models are installed: kenney.nl blocks automated downloads (HTTP 403), so the packs must be downloaded by hand (see `tools/register_models.ps1`). Everything currently uses procedural geometry. Models load only over http(s).
* **Media sound** uses Web Audio panners and needs http(s); from `file://` the pop-up players keep their normal sound. If the browser blocks unmuted autoplay, videos start muted and get sound at your next click/key press.
* **Phones:** 1 living painting + cinema video at a time (3 paintings on desktop).
* **NPC dialogue** is keyword-based offline; it can misunderstand unusual phrasing (it then nudges you toward topics it knows).
* **Ape Town / Jungle Dub / Astro-9 layouts** are still the V0.9 slices with new flora, water, signs and NPCs; full rebuilds are Phases 2–4.
* **Performance:** CPU-only (SwiftShader) rendering is ~85–90 % of V0.9 speed (see `docs/TESTING.md`); not measured on real GPUs/phones.

## V0.9.4 (Chiang Mai) notes
* **Phones cannot reach the PC game yet:** Python is not installed, so `start_server.bat` uses `tools/serve.ps1`, which listens on `localhost` only. A phone on the same Wi-Fi cannot connect, and phones cannot open `index.html` as a file. Options: install Python (its server listens on the network) and allow it in Windows Firewall, or host the folder on an HTTPS static host — **not done: needs your authorization and account**.
* Chiang Mai is the heaviest world: real Iris Xe GPU ≈4.7 ms/frame on Low and ≈11 ms on High at the hostel (normal mode); festival modes are heavier. Not tested on a real phone.
* Blue's is next door to the hostel (not yet directly opposite); character reference images were not available for Steve and Dino (generic looks).
* Hostel crew are procedural characters, not rigged models; pool is a top-down table in a panel, not a 3D first-person game.

## V0.9.3 (Jungle Dub rebuild) notes
* **Characters** were rebuilt (sculpted bodies, faces, hands, sneakers), but they are still procedural, stylised toys, not rigged/skinned models: limbs swing from shoulder and hip only (no bending elbows or knees) and faces have no expressions or lip-sync.
* The quality setting for characters (Low = lighter meshes) applies when you next enter a world, like vegetation.
* Jungle Dub's roadmap landmarks (Roots Village, Dub Lab, Bamboo Bazaar, River Bar, floating bungalows, treehouses, Jungle Cinema) are **not built**; this pass upgraded the existing slice only.
* The dancers have no collision (you can walk through them), like the Ape Town crowd.

* **Astro-9** was upgraded visually only: its roadmap landmarks (Intergalactic Bazaar, Astro Café, Orbit Lounge, Docking Bay, Cinema 9, Glassopy observatory) are **not built**, and it has no real-music playlist yet (procedural club music).

## V0.9.2 (Ape Town rebuild) notes
* **Performance is the main open question.** The new Ape Town has ~250k triangles on Low, ~400k on Medium and ~550k on High (incl. shadows), and 300–500 draw calls. In CPU-only test rendering it runs ~3× slower than the tiny V0.9 town. Not yet measured on a real laptop GPU or phone — please report FPS (desktop: Settings → Graphics; phone: Low).
* **First seconds after entering Ape Town** may hitch while models parse and shaders compile (once per visit).
* **CC0 models** load only over http(s) (start_server.bat). From file:// and on Low graphics the heaviest ones are replaced by procedural stand-ins.
* **Gallery Gardens** has 15 frames (8 living + 7 awaiting files). The masterplan mentions 45; the remaining frames are not added until their artwork exists.
* The **"Weed Café"** on the masterplan is built as a neutral "Chill Café · herbal tea".
* **Collision** for decorative boulders, rim forest and some flowers is approximate (circles) or absent.

## Technical limits
* **file:// double-click:** browsers taint WebGL textures from local files, so paintings cannot play *inside* their frames; they open in the pop-up viewer instead. Use `start_server` or any web host for in-frame playback (tested on http).
* **Performance:** tested only in software-rendered Chromium (SwiftShader), which cannot predict real GPU or phone frame rates. Draw-call counts were measured (Ape Town ≈ 220, Verdalux ≈ 200, Jungle Dub ≈ 225, Astro-9 ≈ 145 on Medium). Vegetation is individual meshes, not instanced, so Low quality reduces counts but very old phones may still struggle.
* **Mobile:** tested only with emulated touch (Playwright Pixel 7). No real phone, tablet or Safari/iOS testing was possible.
* **Browsers:** tested Chromium only. Firefox/Safari not tested.
* **Audio:** Web Audio needs a first click (the Start button). Positional stage audio uses HRTF panning; not tested with headphones.
* **LLM NPCs:** the optional backend path is implemented and validated but could not be tested against a live model here. Offline scripted mode is what was tested.
* **Collision:** axis-separated box/circle collision, no slopes beyond a 0.9 m step; thin geometry at high speed could in theory tunnel (not observed).
* **Casino:** fictional Gravity Points only; since V0.9.1 they refill to 100 at the start of each new game day.
* **Day/night:** Astro-9 and Verdalux use fixed skies by design; Ape Town and Jungle Dub follow the clock.
* **Save sharing:** saves are per-browser. Export is a JSON download; there is no import UI yet.

## V0.9.6 cinematic graphics prototype
- Only Astro-9 uses the post-processing / HDRI path; the other worlds are unchanged. Rolling it out needs per-world tuning (bloom threshold, grading, and converting any custom sky/water shaders to linear output like the sky dome).
- The tower and aliens are generated by the project's own forge code and exported to GLB. They are not Blender-sculpted or third-party CC0 characters. The pipeline is ready for real Blender/Quaternius GLBs (same material, bone and clip names).
- Alien skinning is rigid (each body part follows one bone, joints hidden by spheres). Real rigs with weight painting will deform more smoothly.
- The HDRI and GLBs load only over http(s) (local server); on file:// the procedural fallbacks are used.
- Frame times were measured with forced synchronous renders in a browser tab (render cost only, not the whole game loop) on Intel Iris Xe. They have not been measured on a real phone (phones use Low, where the cinematic path is off by default).
- Bloom inside the r128 UnrealBloomPass uses 8-bit blur targets, so very bright neon caps its glow.

## V0.9.7 Stage 1
- The Chiang Mai street crowd (instanced pedestrians, monks, parade) and the named crew still use the older character builders; the new rigged characters are added on top. Replacing the instanced street crowd needs an instanced/GPU-skinned approach (Stage 2).
- Rigged characters use rigid skinning (each body part follows one bone); no facial animation or lip-sync.
- Films are hard links to the files on the Desktop. If those originals are deleted, the links still keep the data; if the project is copied to another drive the copies are full files (about 3.3 GB).
- "The Life I Want" was not found on this computer under that name; drop the file into assets/media/films and add a line to data/films.js.
- Films only play on the 3D screens over the local server (http); on file:// they open in the pop-up player.
- Tuk-tuk rides follow the sidewalk-corner street graph, so corners are a little tight; there is no traffic avoidance for the ride.

## V0.9.8 Stage 2
- Astro-9 districts float outside the dome without their own lighting (no extra point lights, to keep the shader cost down); they rely on the station sky light, emissive neon and the HDRI reflections on Medium/High.
- The first Astro-9 visit generates the mosaic textures in JavaScript (about 1 s on Medium at 512 px, more on High at 1024 px); later visits reuse them.
- Jungle Dub is about twice as wide; on High the centre view is ~0.9M triangles (incl. the shadow pass) — fine on the Iris Xe in earlier measurements at that size, but not re-measured on the real GPU this stage.
- The instanced Chiang Mai street crowd keeps its light geometry (a heavier version was tried and reverted, see DEVELOPMENT_PROGRESS).
- Headless test timings were relaxed (travel 30 s, hostel walk 60 s) because SwiftShader renders the bigger worlds at ~1.5 fps; this is a test-harness limit, not in-game behaviour.
