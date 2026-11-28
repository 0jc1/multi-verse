# Apeverse 3.0: Babylon.js engine migration (experimental)

- **Branch:** `apeverse-3.0-babylon-exp`, cut from the stable 2.3 checkpoint `b627c6e` (tag `apeverse-2.3-checkpoint-b627c6e`).
- **Server:** http://localhost:8103. The stable game stays on http://localhost:8101 and is untouched.
- **Saves:** shared with nothing. Tests use their own save key, and the 8103 address has its own browser storage, so 8101 saves are never touched.
- **Scope:** Ape Town only. No other world is migrated until the owner approves.

## 1. Strategy: renderer adapter first, then content rewrite

Apeverse is 174 classic scripts (6 MB) on Three.js r128, with gameplay and rendering interleaved. A big-bang rewrite would freeze gameplay development for months. So the migration runs in three stages:

1. **Adapter (done, this branch).** `js/babylon_mirror.js` treats the live Three.js scene graph as the *world model*:
   - It mirrors the scene graph into a Babylon.js scene every frame, and Babylon draws the frame.
   - Every gameplay system runs unchanged: missions, dialogue, shops, money, inventory, vehicles, police, homes, the DJ, minigames and all the UI.
   - It keeps the same coordinates and the same ids, with a right-handed Babylon scene.
   - `?engine=three` turns it off, and so does `AV.bab.setOn(false)` at runtime, for A/B benchmarks.
2. **Export pipeline (done).**
   - `AV.bab.exportGLB()` writes the mirrored world as GLB with real node transforms, shared geometry, PBR materials, textures, and thin instances as `EXT_mesh_gpu_instancing`.
   - `AV.bab.exportWorld()` writes the portable world data `apeverse-world/1`: places, arrivals, colliders, circles, map roads / nav graph, interactables, NPCs, missions with stages and rewards, businesses, homes and dialogue character ids.
   - `tools/babylon/receive.ps1` (port 8199) saves both into `exports/`.
3. **Native Babylon worlds (next, per world, after approval).** Each world loads `world.glb` + `world.json` directly:
   - no Three.js geometry building at runtime;
   - Blender becomes the art tool for these files;
   - gameplay talks to an engine-neutral `AV.W` (cols, T, places, surface) that the JSON already describes.
   - Three.js is then removed world by world.

## 2. System audit (reuse / adapter / rewrite)

`tools/babylon/audit.cjs` produces the full per-file table in `docs/BABYLON_AUDIT_TABLE.md`.

| Class | Files | Size | Meaning |
|---|---|---|---|
| reuse | 55 | 1.8 MB | No Three.js calls: gameplay, economy, missions, dialogue, UI, audio, save. Runs on any engine. |
| adapter | 100 | 3.3 MB | Builds Three.js meshes / materials but uses no renderer internals. Rendered through the mirror today; converted to GLB by the exporter. |
| rewrite | 19 | 1.0 MB | Custom shaders, renderer internals or post-processing. |

The 19 rewrite files are:
- world_* shader terrain / water: Chiang Mai, Da Nang, Jungle Dub, Ape Town, Jerusalem, Nimbus, Judean Desert;
- flora_real (wind shader); chars_human (skinning helpers); city_life (instanced crowd shader);
- core (render loop); world_kit; sky (sky dome shader); pbr; lw_onboard (preview renderer); portal; perf_guard; gfx (EffectComposer); static_merge.

These get Babylon equivalents as each world is migrated:
- NodeMaterial or ShaderMaterial for water and wind;
- SkyMaterial;
- DefaultRenderingPipeline;
- Babylon's own mesh merging.

### Coverage of the adapter today

| Area | Status |
|---|---|
| Geometry | Every BufferGeometry → shared `BABYLON.Geometry`, matching the 1:1 counts in the run. NaN data is sanitised. |
| Instancing | `InstancedMesh` → thin instances (matrix + colour). Crowds, flora and props all work. |
| Materials | Standard / Physical → PBR; Basic / Sprite → unlit; vertex colours, alpha, alpha-test, double-sided. |
| Custom ShaderMaterials | 21 of them (water, sway, sky) → flat PBR approximation (listed limitation). |
| Textures | Canvas → DynamicTexture, re-copied on Three version bump (signs, the phone-screen world, the DJ). Images and video too. |
| Lighting | Sun + hemisphere follow the time of day, plus fog and clear colour. Cascaded shadows exist but are opt-in (`__BAB_SHADOWS`). |
| Camera | Copied every frame. FOV, near and far match. |
| Picking / gameplay rays | Unchanged: they stay on the Three.js side (the world model). |
| Post-processing | ACES tone mapping in the material shaders (no extra pass); MSAA. Bloom / FXAA pipeline is opt-in (`__BAB_POST`). |

## 3. Capability investigation

| Capability | Finding / plan |
|---|---|
| **WebGPU** | `BABYLON.WebGPUEngine` starts on this Chrome and Iris Xe; the first run mirrored and exported fine on WebGPU. Headless tests force WebGL2 (`__BAB_API='webgl'`) because the WebGPU canvas does not read back in headless capture. **Snapshot rendering** (WebGPU only) is the big CPU win to try next: it records the static scene's draw commands once. |
| **WebGL2 fallback** | Automatic when WebGPU is missing or fails, and Three.js remains the final fallback: if Babylon fails to load or throws, the game keeps rendering with Three.js. |
| **Havok physics** | `@babylonjs/havok` (WASM, ~2 MB). The plan is rigid bodies for vehicles, physics props and ragdolls on knockdown. Gameplay collision stays on the existing 2D colliders (exported in `world.json`) until the vehicles are rewritten, so behaviour cannot regress. |
| **Navmesh / crowds** | `RecastJSPlugin` (recast-detour WASM) builds a navmesh from the exported GLB plus colliders. Its crowd agents would replace the hand-rolled street router (police, walkers). Prototype after the Ape Town native load. |
| **Skeletal animation** | Characters are procedural Three.js rigs today (chars_human / chars_real, rewrite list). The path is skinned glTF characters (Blender, Mixamo-style CC0 rigs) with `AnimationGroup` blending; the mirror already renders the procedural rigs meanwhile. |
| **PBR** | Already in use through PBRMaterial. Adding an environment texture (`.env` IBL, ~200 KB) is the biggest visual upgrade for little cost. |
| **Crowds** | Thin instances, as used now. Vertex-animation textures (VAT) are the next step for thousands of animated walkers. |
| **Spatial audio** | Babylon `Sound` with `spatialSound` exists, but the current WebAudio graph (lw_audio, lw_soundscape) is engine-neutral and stays (reuse). |
| **LOD / streaming** | `mesh.addLODLevel`, `scene.freezeActiveMeshes`, `AssetContainer` per district, plus incremental loading of district GLBs → progressive download for public hosting. |
| **Compression** | Draco or meshopt geometry plus KTX2/Basis textures through `gltf-transform` in the build step. Expect the 53 MB Ape Town GLB to drop to roughly 5–10 MB. |
| **Mobile** | Hardware scaling level follows the game's quality setting (already wired). Touch controls are already in the game UI. Target: WebGL2 with Medium quality, no shadows, batching on. |
| **Blender workflow** | Export `world.glb` → edit in Blender → re-import. Ids survive because node names are kept, and gameplay anchors live in `world.json` (same coordinates), not in the mesh. |

## 4. Performance work in the adapter

The integrated GPU was not the limit. Babylon's CPU cost per draw was. The adapter now does the following:

- **Static batching:** a mesh that has not moved for ~2 s, and that shares geometry + material with others, is drawn as one thin-instanced mesh. It drops out again the moment it moves, hides or changes material.
- **Frozen materials:** materials freeze once their textures are ready and unfreeze when the Three material changes.
- **Lighter shading:** two lights per material and no post-process passes by default.
- **Matched resolution:** the Three renderer's pixel ratio is used.
- **Cheaper mirroring:** world matrices are frozen and only re-pushed on change; settled objects are re-checked twice a second; there are no per-frame allocations.

### Fixes found while making it render correctly

- **Matrix change detection.** Matrices were compared through a Float32 copy, so every mesh looked "moved" every frame. That meant 1,100+ world-matrix pushes per frame and no batching. Fixing it cut sync from 4.7 ms to 0.4 ms.
- **Face winding.** Three's CCW front faces were culled as back faces, so the ground was invisible and sign text read mirrored.
- **Characters.** chars_real colours them in an `onBeforeCompile` shader (palette `uC0..uC3` × `aMat`). The adapter bakes the palette into vertex colours. Skinned rigs (65 bones) are bridged by sharing Three's bone matrices through one bone texture per skeleton. Fur shells are skipped.
- **Lighting and fog.** The sun and hemisphere lights now use Three's intensities with no tone mapping, like r128 here. Three's fog colour is HDR (>1), so distant hills fade to the sky tint instead of burning white.
- **Export.**
  - The glTF writer reads local TRS while the mirror uses frozen world matrices, so world matrices are now decomposed for export (before this, every node sat at the origin).
  - Zero-scale pooled instances were dropped, because they produced NaN rotations.
  - Textures that can never be ready (a video in a headless browser, a canvas that failed to copy) are detached during export.

### Benchmark (Iris Xe laptop, headless Chrome with GPU, WebGL2, 1536×864, Medium)

The test uses the same session and build, toggling Babylon ↔ Three.js at 4 fixed viewpoints × 2 rounds, and records the median FPS per viewpoint. Ape Town has about 1.6 M triangles, 1,350 mirrored meshes, ~350 shared materials and ~65 merged static batches.

| Run | Babylon avg FPS (runs) | Three.js avg FPS (runs) | Babylon per-frame cost |
|---|---|---|---|
| Adapter v1 (no batching, Float32 bug) | 27 (21–30) | 48 (29–59) | n/a |
| Adapter v2 (all fixes) | 26–32 (23–37) | 48–50 (31–60) | scan 2.3–3 ms, sync ~1 ms, `scene.render` 8.5–14 ms CPU, 600–930 active meshes |

**Verdict: the adapter is correct but slower than Three.js on this laptop (about 55–65 % of its frame rate).** The adapter does every bit of Three's scene-graph work *and* Babylon's, and Babylon's per-mesh CPU cost on WebGL2 is higher than Three's for ~800 draws. No adapter trick can make "Three.js + a copy" faster than Three.js alone.

The speed has to come from stage 3: native Babylon worlds loaded from GLB/JSON. Three.js scene building and the mirror disappear, and the following become available:
- static content frozen at load (`freezeActiveMeshes`, `freezeWorldMatrix`, `material.freeze`);
- merged / instanced meshes from the build step;
- WebGPU snapshot rendering (static draw commands recorded once);
- Draco/meshopt-compressed geometry and KTX2 textures.

That is the recommended next step, for Ape Town only and after the owner approves.

## 5. Public hosting architecture (prepared, not built)

- **Static hosting:** index + scripts + GLB/JSON per world on a CDN, with progressive download. Show the menu first, stream the current world's GLB, then prefetch neighbouring worlds.
- **Accounts / cloud saves:** the save is already one JSON blob (`AV.S`). An auth provider (OAuth) plus a small save API (last-writer-wins with a version) keeps local saves as an offline fallback.
- **Multiplayer:** the existing `api/mp/` hooks become a WebSocket room server per world instance that syncs players' positions, chat and events. NPCs and missions stay client-side.
- **Social links:** share-a-place deep links (`#w=ape_town&x=..&z=..`) and screenshot share.
- **Ethical monetisation:** cosmetic-only items (outfits, homes' decor, vehicle paint) and an optional supporter pass. No loot boxes, no pay-to-win, no real-money gambling (the in-game wagers stay in-game currency only).
- **Licensing before public release:**
  - The 7-ELEVAPE parody stores need a legal check.
  - CC0 audio is fine.
  - No real-brand logos.

## 6. Known limitations (prototype)

- The 21 custom shader materials (water, flora sway, special effects) render as flat approximations.
- The sky dome is replaced by fog + clear colour.
- Shadows are off by default (opt-in `__BAB_SHADOWS`).
- Point lights (lamps, neon) are not mirrored yet; their emissive materials still glow.
- Babylon renders, but Three.js still builds the world and runs the frame loop. The adapter costs CPU on top of the game's own systems, so native GLB loading (stage 3) is where the real performance gain comes from.
- Headless WebGPU capture shows black, so automated screenshots use WebGL2. In a normal Chrome window WebGPU is used.
- **The raw GLB is large.**
  - Whole town ~170 MB; central district ~150 MB.
  - Cause: Three's geometry is mostly non-indexed (3 vertices per triangle), and the Babylon 7 glTF writer does not dedupe shared geometry.
  - Planned fix: a build step with `gltf-transform weld + dedup + meshopt` (expected to bring it to a few MB).
  - The automated test exports a 40 m plaza. The whole-town export is manual: `AV.bab.exportGLB('ape_town')` in the console with the receiver running.
- Batched (merged) static meshes export as merged nodes, so their individual Three ids are lost in the GLB. Unbatched nodes keep `name#threeId` names.
- Fur shells are skipped. Character palettes are baked at first sight, so later outfit colour changes are not reflected until the next visit.
- Some sign text may still read mirrored where Three uses negative-scale planes (to be checked).
- Skeletons of characters that leave the scene are not disposed (small leak per world visit).
- Only Ape Town has been validated.
