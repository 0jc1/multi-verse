<#
  Registers CC0 GLB models for Apeverse.
  1. Download a CC0 pack yourself (e.g. https://kenney.nl/assets/nature-kit -> "Continue without donating", or a Quaternius pack).
  2. Copy its .glb files into assets\models\<pack-name>\   (e.g. assets\models\kenney_nature\)
  3. Run:  powershell -ExecutionPolicy Bypass -File tools\register_models.ps1
  This rewrites data\models.js with one entry per .glb (key = <pack>/<file name without .glb>), keeping any scale/tint you already set.
#>
$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$dir = Join-Path $Root 'assets\models'
if (-not (Test-Path $dir)) { New-Item -ItemType Directory $dir | Out-Null }
$old = @{}
$js = Join-Path $Root 'data\models.js'
if (Test-Path $js) { foreach ($m in [regex]::Matches((Get-Content $js -Raw), '"([^"]+)":\s*(\{[^}]*\})')) { $old[$m.Groups[1].Value] = $m.Groups[2].Value } }
$entries = @()
Get-ChildItem $dir -Recurse -Filter *.glb | Sort-Object FullName | ForEach-Object {
  $rel = $_.FullName.Substring($Root.Length + 1) -replace '\\', '/'
  $pack = Split-Path (Split-Path $_.FullName -Parent) -Leaf
  $key = "$pack/$($_.BaseName)"
  if ($old.ContainsKey($key)) { $entries += "  `"$key`": $($old[$key])" }
  else { $entries += "  `"$key`": { `"file`": `"$rel`", `"scale`": 1, `"y`": 0, `"tint`": null, `"license`": `"CC0`", `"source`": `"$pack`" }" }
}
$hdr = @'
/* APEVERSE - data/models.js : optional 3D model registry (CC0 GLB files, e.g. Kenney / Quaternius).
   Generated/updated by tools/register_models.ps1 from the files in assets/models/. Empty = every object uses its procedural look.
   Entry: key: { file, scale, y, tint (0xRRGGBB or null), tintAmt, license, source }. Models load only over http(s). */
window.AV = window.AV || {};
'@
($hdr + "`nAV.MODELS = {`n" + ($entries -join ",`n") + "`n};`n") | Out-File -Encoding utf8 $js
Write-Host "Registered $($entries.Count) model(s) in data\models.js"
