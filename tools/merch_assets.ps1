# Builds the in-game merch textures (512 px) + UI thumbnails (256 px) from the owner's original artwork.
# Sources stay untouched in the quarantine folder; outputs go to assets/merch/{tex,thumb}; a manifest records every source hash.
param([string]$Q = "$env:TEMP\ape_merch_quarantine", [string]$Repo, [string]$Docs = "$env:USERPROFILE\Documents")
Add-Type -AssemblyName System.Drawing
$nd = Join-Path $Q 'APEVERSE_NEXT_MASTER_HANDOFF_20261123\ASSETS\new_drop'
$d1 = Join-Path $Q 'drop001\APEVERSE_MERCH_DROP_001\ADDON\assets\merch\originals'
$out = Join-Path $Repo 'assets\merch'; New-Item -ItemType Directory -Force "$out\tex","$out\thumb" | Out-Null
$jpg = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$ep = New-Object System.Drawing.Imaging.EncoderParameters 1; $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]88)
function Save-Square($src, [System.Drawing.Rectangle]$r, $size, $path) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size; $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = 'HighQualityBicubic'; $g.SmoothingMode = 'HighQuality'; $g.PixelOffsetMode = 'HighQuality'
  $bg = $src.GetPixel([Math]::Min($src.Width - 1, $r.X + 6), [Math]::Min($src.Height - 1, $r.Y + 6)); $g.Clear($bg)   # pad with the artwork's own paper colour
  $k = [Math]::Min($size / $r.Width, $size / $r.Height); $w = [int]($r.Width * $k); $h = [int]($r.Height * $k)
  $g.DrawImage($src, (New-Object System.Drawing.Rectangle ([int](($size - $w) / 2)), ([int](($size - $h) / 2)), $w, $h), $r, [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose(); $bmp.Save($path, $jpg, $ep); $bmp.Dispose() }
# id | file | crop (x,y,w,h or 'full')
$jobs = @()
foreach ($m in 'moonmelt_stay_mellow','moonmelt_cosmic_campout','moonmelt_dream_route','moonmelt_slow_orbit','moonmelt_low_tide_high_mind','world_tokyo','world_sevilla','world_chefchaouen','world_cadiz','world_medellin','world_rio','world_oaxaca','world_paris') { $jobs += ,@($m, (Join-Path $d1 "$m.png"), 'full') }
$nw = @{ '1000019533'='apeverse_coastal_daydream'; '1000019534'='apeverse_sun_moon'; '1000019535'='apeverse_tropical_fruits'; '1000019537'='apeverse_blue_tides'; '1000019538'='apeverse_sunny_groove'; '1000019539'='apeverse_ape_summer'; '1000019541'='solterra_sunshine_waves'; '1000019542'='solterra_sunshine_cat_nap'; '1000019543'='solterra_sunshine_evening_breeze'; '1000019546'='solterra_sunshine_sunny_cat' }
foreach ($k in $nw.Keys) { $jobs += ,@($nw[$k], (Join-Path $nd "originals\$k.png"), 'full') }
# ZtonedApe designs: the owner's own files in Documents (read only)
$zt = @{ 'ztonedape_bud' = 'ztonedape tshirt design bud.png'; 'ztonedape_dj' = 'ztoned ape dj drawing png.png'; 'ztonedape_bamb_polka' = 'bamb tshirt design 1 ztoned ape.png'; 'ztonedape_bamb_white' = 'bamb white leteers ztoned ape tshirt.png' }
foreach ($k in $zt.Keys) { $jobs += ,@($k, (Join-Path $Docs $zt[$k]), 'full') }
$sheet = Join-Path $nd 'concept_sheets\1000019548.png'
$cells = 'city_chiang_mai','city_madrid','city_da_nang','city_pai','city_barcelona','city_ibiza','city_amsterdam','apeverse_same_sky','solterra_more_sun','solterra_bloom','solterra_good_energy_club','solterra_nature_heals','solterra_slow_travel','solterra_stay_wild','solterra_life_outside','solterra_good_people'
for ($i = 0; $i -lt 16; $i++) { $jobs += ,@($cells[$i], $sheet, "cell$i") }
$rows = @('id,source,source_sha256,crop,src_w,src_h,tex,thumb')
foreach ($j in $jobs) { $id, $f, $crop = $j; $src = New-Object System.Drawing.Bitmap $f
  if ($crop -eq 'full') { $r = New-Object System.Drawing.Rectangle 0, 0, $src.Width, $src.Height } else { $i = [int]$crop.Substring(4); $cw = $src.Width / 4; $ch = $src.Height / 4; $r = New-Object System.Drawing.Rectangle ([int](($i % 4) * $cw + 4)), ([int]([Math]::Floor($i / 4) * $ch + 4)), ([int]($cw - 8)), ([int]($ch - 8)) }
  Save-Square $src $r 512 "$out\tex\$id.jpg"; Save-Square $src $r 256 "$out\thumb\$id.jpg"
  $rows += "$id,$(Split-Path $f -Leaf),$((Get-FileHash $f -Algorithm SHA256).Hash.ToLower()),$crop,$($r.Width),$($r.Height),assets/merch/tex/$id.jpg,assets/merch/thumb/$id.jpg"; $src.Dispose() }
$rows | Set-Content -Encoding utf8 "$out\SOURCES.csv"; "built $($jobs.Count) designs"; (Get-ChildItem "$out\tex" | Measure-Object Length -Sum).Sum / 1KB
