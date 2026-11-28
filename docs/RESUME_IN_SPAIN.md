# How to resume Apeverse after the trip

Written 2026-11-28, before the owner's flight to Spain. Everything below exists on this laptop under `C:\Users\Alejo\Downloads\ape multiverse 1\`. Committed work is also on GitHub: `github.com/0jc1/multi-verse`.

## 1. What runs where

| Address | What it is | Folder (git worktree) | Branch / commit |
|---|---|---|---|
| http://localhost:8101 | **Stable game** (Three.js, 2.3 Living World). Your real save lives here. | `apeverse-play-wt` (detached, release copy) | `b627c6e` (tag `apeverse-2.3-checkpoint-b627c6e`) |
| http://localhost:8102 | 2.3 development | `apeverse-livingworld-wt` | `apeverse-2.3-living-world` |
| http://localhost:8103 | **Babylon.js 3.0 experimental** | `apeverse-babylon-wt` | `apeverse-3.0-babylon-exp` (see `git log`) |
| http://localhost:8104 | 2.2 fallback | `apeverse-integration-wt` | `apeverse-2-integration` |

`main` is never touched. Every address has its own browser storage, so saves never mix.

## 2. Starting the servers after a reboot

Each server is a small PowerShell static server (`tools\serve.ps1`). Run one command per address in PowerShell:

```powershell
$A = "C:\Users\Alejo\Downloads\ape multiverse 1"
Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$A\apeverse-play-wt\tools\serve.ps1`" -Port 8101 -NoBrowser -Root `"$A\apeverse-play-wt`"" -WindowStyle Hidden
Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$A\apeverse-livingworld-wt\tools\serve.ps1`" -Port 8102 -NoBrowser -Root `"$A\apeverse-livingworld-wt`"" -WindowStyle Hidden
Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$A\apeverse-babylon-wt\tools\serve.ps1`" -Port 8103 -NoBrowser -Root `"$A\apeverse-babylon-wt`"" -WindowStyle Hidden
```

The export receiver, needed only for GLB/world exports, is `apeverse-babylon-wt\tools\babylon\receive.ps1` and listens on port 8199.

## 3. Saves (keep them safe)

- Your real save is in Chrome's storage for `localhost:8101`. Clearing site data for localhost deletes it, so don't.
- **Settings → Save file → Export save / Import save…** (Babylon build; Inventory → Export save also exists in every build).
  - Import checks the file first.
  - It backs up the current save (`<key>_preimport`, plus a downloaded backup file) before loading the imported one.
- Export before any big change.
- Tests never touch your save: they use their own save keys (`apeverse_test_*`) and remove them afterwards.
- The Babylon build on 8103 has its own storage, separate from 8101.

## 4. Babylon 3.0: state at departure

**Modules** (`apeverse-babylon-wt\js\`):
- `babylon_mirror.js`: the renderer adapter. It mirrors the live Three.js scene into Babylon 7.31 (WebGL2 by default; WebGPU opt-in with `?engine=webgpu`).
  - Safety net: if Babylon stops drawing, goes black, or loses its GPU context, it switches back to Three.js and shows a notice.
- `babylon_native.js`: Stage 3, step 1. Static Ape Town is baked into welded, merged native meshes once the town settles. Only moving things stay mirrored. `?native=0` disables it.
- `babylon_gfx.js`: the visual upgrade, with presets Low / Medium / High / Ultra (F6 or Settings).
  - Physically based sky with sunsets/night, sky lighting (IBL) and reflections, sun shadows, neon glow, reflective animated water.
  - High adds bloom and street lights; Ultra adds ambient occlusion.
- `lw_wormhole.js`: the wormhole travel transition. Cinematic / short / instant modes in Settings; respects reduced motion; Space/click skips; always clears.

**URL switches on 8103:**
- `?engine=three`: pure Three.js.
- `?engine=webgpu`: try WebGPU.
- `?native=0`: mirror only.

**Test suites** (`tools\tests\`), always run through the shared GPU lock:
- `suite_bab1.js`: full adapter + export + benchmark.
- `suite_bab_vis.js`: your real path in a visible Chrome (`-Headed`).
- `suite_bab_gfx.js`: before/after screenshots + FPS per preset.
- `suite_worm.js`: the wormhole.

```powershell
cd "C:\Users\Alejo\Downloads\ape multiverse 1\apeverse-babylon-wt"; powershell -ExecutionPolicy Bypass -File tools\tests\gpu_queue.ps1 -Owner bab -Run "-Suite tools/tests/suite_bab_gfx.js -Gpu -W 1536 -H 864 -Port 8103 -StepTimeout 600 -Out C:/tmp/gfx"
```

**Docs:**
- `docs\BABYLON_MIGRATION_AUDIT.md`: strategy, audit, benchmarks, limitations.
- `docs\BABYLON_AUDIT_TABLE.md`: per-file classification.
- `docs\babylon_shots\`: screenshots.

## 5. What is done vs. planned (Babylon brief, 2026-11-28)

| Priority | Status |
|---|---|
| 1. Black screen | **Fixed.** There were several causes. (a) Babylon's WebGPU path stalled at 0 frames in real Chrome, so WebGL2 is now the default. (b) The Babylon camera looked *backwards*. (c) Characters were drawn at twice their distance from the world origin (skinning). (d) A shadow-generator bug hid all characters. A never-black watchdog now falls back to Three.js with a notice. Tested in a visible Chrome window: creator → home → outside → travel → back. |
| 2. Native Babylon | **Started.** Static Ape Town is baked natively (welded, merged). Dynamic objects are still mirrored. Three.js's own environment-cube renders are skipped, which removed a whole extra frame of work. Character-part merging exists but is opt-in (`?chars=1`). Next: load the baked world from GLB on arrival, district streaming. |
| 3. Graphics upgrade | **First pass done.** Physical sky, image lighting and reflections, sun shadows, neon glow, reflective water. Presets Auto / Low / Medium / High / Ultra. Measured on the Iris Xe (headless GPU, 1536×864): **Low 47–48 FPS, Medium 38–40 FPS** vs Three.js 40–50 on the same views. High ~22, Ultra ~13 (future hardware). |
| 4. Better 3D meshes | Not started (needs an asset plan + licensing manifest). |
| 5. Character creator | Not started in 3.0 (the 2.3 creator works). |
| 6. Real-estate app | Not started. |
| 7. Wormhole | **Done** (works with both engines). |
| 8. Havok / navmesh / crowds | Not started. |

## 6. Next steps, in order

1. Play http://localhost:8103 once in a normal Chrome window and press F6 to compare presets. The notice at the top says if the safety net ever switches renderers.
2. Merge character parts per skeleton (the biggest remaining draw-call cost), then re-measure Medium.
3. Load native GLB on arrival (`AV.bab.native.exportGLB()` already produces the welded world).
4. Assets: a licensed character / vehicle pack (CC0 / CC-BY, kept in a manifest), Blender LODs.
5. Creator / wardrobe / barber expansion, then the real-estate app.
