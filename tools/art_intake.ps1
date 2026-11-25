# Apeverse art intake: duplicate check for new artwork (Groove Dealers, SWAG, SOLTERRA, ...) BEFORE anything is imported.
#   powershell -File tools/art_intake.ps1 -In "<folder or file>" [-In ...] [-Brand "SWAG"]
# For every incoming image (png/jpg/jpeg/webp/bmp):
#   - SHA-256: exact duplicate of a source already used by the merch catalogue (assets/merch/SOURCES.csv)?
#   - perceptual dHash (64 bit) after the same square letterboxing the merch pipeline applies, compared with every existing
#     merch texture (assets/merch/tex) and with the rest of the batch: Hamming <= 6 near-duplicate, <= 12 similar (look)
#   - size, aspect, "under 1024 px" (too small for a print texture), brand-spelling flags in the file name (SOLVERA)
# Writes local/art_intake_report.md (gitignored) and prints a summary. Read-only: never copies or imports anything.
param([string[]]$In, [string]$Brand = '', [string]$Repo = (Split-Path $PSScriptRoot -Parent))
Add-Type -AssemblyName System.Drawing
function Get-DHash([string]$path) {
  $src = [System.Drawing.Image]::FromFile($path)
  try {
    $sq = New-Object System.Drawing.Bitmap 72, 72; $g = [System.Drawing.Graphics]::FromImage($sq); $g.InterpolationMode = 'HighQualityBicubic'
    $b0 = New-Object System.Drawing.Bitmap $src; $bg = $b0.GetPixel(6, 6); $b0.Dispose(); $g.Clear($bg)
    $k = [Math]::Min(72 / $src.Width, 72 / $src.Height); $w = [int]($src.Width * $k); $h = [int]($src.Height * $k)
    $g.DrawImage($src, [int]((72 - $w) / 2), [int]((72 - $h) / 2), $w, $h); $g.Dispose()
    $sm = New-Object System.Drawing.Bitmap 9, 8; $g2 = [System.Drawing.Graphics]::FromImage($sm); $g2.InterpolationMode = 'HighQualityBicubic'; $g2.DrawImage($sq, 0, 0, 9, 8); $g2.Dispose(); $sq.Dispose()
    [uint64]$hash = 0; for ($y = 0; $y -lt 8; $y++) { for ($x = 0; $x -lt 8; $x++) { $a = $sm.GetPixel($x, $y); $c = $sm.GetPixel($x + 1, $y)
      $la = 0.299 * $a.R + 0.587 * $a.G + 0.114 * $a.B; $lc = 0.299 * $c.R + 0.587 * $c.G + 0.114 * $c.B; $hash = $hash -shl 1; if ($la -gt $lc) { $hash = $hash -bor 1 } } }
    $sm.Dispose(); return @{ h = $hash; w = $src.Width; ht = $src.Height }
  } finally { $src.Dispose() } }
function Get-Ham([uint64]$a, [uint64]$b) { $x = $a -bxor $b; $n = 0; while ($x -ne 0) { $n += [int]($x -band 1); $x = $x -shr 1 }; return $n }
$imgRe = '\.(png|jpe?g|webp|bmp)$'
$incoming = foreach ($p in $In) { if (Test-Path $p -PathType Container) { Get-ChildItem $p -Recurse -File | Where-Object { $_.Name -match $imgRe -and $_.Name -notlike '._*' } } elseif (Test-Path $p) { Get-Item $p } }
$known = @{}; if (Test-Path "$Repo\assets\merch\SOURCES.csv") { Import-Csv "$Repo\assets\merch\SOURCES.csv" | ForEach-Object { $known[$_.source_sha256] = $_.id } }
$tex = @(Get-ChildItem "$Repo\assets\merch\tex" -File -Filter *.jpg | ForEach-Object { $d = Get-DHash $_.FullName; [pscustomobject]@{ id = $_.BaseName; h = $d.h } })
$rows = @(); $batch = @()
foreach ($f in $incoming) { $sha = (Get-FileHash $f.FullName -Algorithm SHA256).Hash.ToLower(); try { $d = Get-DHash $f.FullName } catch { $rows += [pscustomobject]@{ file = $f.Name; verdict = 'UNREADABLE'; detail = $_.Exception.Message }; continue }
  $best = $tex | ForEach-Object { [pscustomobject]@{ id = $_.id; d = (Get-Ham $d.h $_.h) } } | Sort-Object d | Select-Object -First 1
  $twin = $batch | ForEach-Object { [pscustomobject]@{ f = $_.f; d = (Get-Ham $d.h $_.h); sha = $_.sha } } | Sort-Object d | Select-Object -First 1
  $flags = @(); if ([Math]::Max($d.w, $d.ht) -lt 1024) { $flags += 'under 1024 px (too small for a print texture)' }; if ($f.Name -match 'solvera') { $flags += 'name says SOLVERA: owner confirmed SOLTERRA, hold' }
  if ($known.ContainsKey($sha)) { $v = 'EXACT DUPLICATE'; $det = 'already in the catalogue as ' + $known[$sha] }
  elseif ($twin -and $twin.sha -eq $sha) { $v = 'EXACT DUPLICATE (in this batch)'; $det = 'same file as ' + $twin.f }
  elseif ($best -and $best.d -le 6) { $v = 'NEAR DUPLICATE'; $det = 'looks like catalogue design ' + $best.id + ' (distance ' + $best.d + ')' }
  elseif ($twin -and $twin.d -le 6) { $v = 'NEAR DUPLICATE (in this batch)'; $det = 'looks like ' + $twin.f + ' (distance ' + $twin.d + ')' }
  elseif ($best -and $best.d -le 12) { $v = 'SIMILAR: check by eye'; $det = 'closest catalogue design ' + $best.id + ' (distance ' + $best.d + ')' }
  else { $v = 'NEW'; $det = 'closest catalogue design ' + $(if ($best) { $best.id + ' (distance ' + $best.d + ')' } else { 'n/a' }) }
  $rows += [pscustomobject]@{ file = $f.Name; size = "$($d.w)x$($d.ht)"; verdict = $v; detail = $det; flags = ($flags -join '; '); sha = $sha.Substring(0, 12) }
  $batch += [pscustomobject]@{ f = $f.Name; h = $d.h; sha = $sha } }
New-Item -ItemType Directory -Force "$Repo\local" | Out-Null
$md = @("# Art intake report$(if ($Brand) { ' - ' + $Brand })", '', "Generated $(Get-Date -Format s) by tools/art_intake.ps1 (read-only; nothing imported).", '', "Compared with $($tex.Count) merch textures + $($known.Count) catalogued source hashes.", '', '| file | size | verdict | detail | flags | sha256 |', '|---|---|---|---|---|---|')
$md += $rows | ForEach-Object { "| $($_.file) | $($_.size) | **$($_.verdict)** | $($_.detail) | $($_.flags) | $($_.sha) |" }
$md | Set-Content -Encoding utf8 "$Repo\local\art_intake_report.md"
$rows | Group-Object verdict | ForEach-Object { "{0}: {1}" -f $_.Name, $_.Count }; "report: local\art_intake_report.md"
