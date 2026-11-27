<#
  Apeverse GPU test queue (agent 4).  Several agents share one laptop GPU; overlapping headless GPU runs throttle each other, can end up
  driving the same Chrome (run_tests.ps1 picks its DevTools port at random) and make every FPS number meaningless.  This wrapper:
    - takes the shared lock %TEMP%\apeverse_gpu.lock ATOMICALLY (the file is created with CreateNew: if it exists, someone holds it);
      a lock whose pid is dead is stale and is removed;
    - after taking the lock, still waits while any other Apeverse headless test browser (profiles apeverse_prof_*) is running, so it
      also yields to agents that don't use the lock;
    - holds the lock (JSON: owner, pid, started) for the whole run and releases it only if it is still its own.
    - gives up waiting after -MaxWaitMin (default 90) and runs anyway, saying so.
  Usage: powershell -ExecutionPolicy Bypass -File tools\tests\gpu_queue.ps1 -Owner agent4 -Run "<run_tests.ps1 arguments>"
  e.g.   ... gpu_queue.ps1 -Owner agent4 -Run "-Suite tools/tests/suite_sevilla.js -Gpu -W 1536 -H 864 -Port 8100 -StepTimeout 900 -Out C:/tmp/x"
#>
param([string]$Owner = 'agent', [int]$MaxWaitMin = 90, [string]$Run = '')
$lock = Join-Path $env:TEMP 'apeverse_gpu.lock'
function Get-Holder { if (-not (Test-Path $lock)) { return $null } try { $l = Get-Content $lock -Raw -ErrorAction Stop | ConvertFrom-Json } catch { return 'unreadable' } if ($l.pid -eq $PID) { return $null } if (Get-Process -Id $l.pid -ErrorAction SilentlyContinue) { return "$($l.owner) (pid $($l.pid)) since $($l.started)" } Remove-Item $lock -Force -ErrorAction SilentlyContinue; return $null }
function Try-Take { try { $fs = [IO.File]::Open($lock, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::Read); $b = [Text.Encoding]::UTF8.GetBytes((@{ owner = $Owner; pid = $PID; started = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss') } | ConvertTo-Json -Compress)); $fs.Write($b, 0, $b.Length); $fs.Close(); return $true } catch { return $false } }
function Other-Browsers { @(Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" | Where-Object { $_.CommandLine -match 'apeverse_prof_' -and $_.CommandLine -match '--headless' }).Count }
$t0 = Get-Date; $said = $false; $took = $false
while ($true) {
  $late = ((Get-Date) - $t0).TotalMinutes -gt $MaxWaitMin
  if (-not $took) { $h = Get-Holder; if (-not $h) { $took = Try-Take } }
  if ($took) { $n = Other-Browsers; if ($n -eq 0) { break } $why = "$n other Apeverse test browser(s) running" } else { $why = "lock held by $h" }
  if ($late) { Write-Host "[gpu_queue] waited $MaxWaitMin min ($why); running anyway"; if (-not $took) { $took = Try-Take } break }
  if (-not $said) { Write-Host "[gpu_queue] GPU busy: $why. Waiting..."; $said = $true }
  Start-Sleep -Seconds 15 }
Write-Host "[gpu_queue] GPU free after $([int]((Get-Date) - $t0).TotalSeconds) s; lock $(if ($took) {'taken'} else {'NOT taken'}) by $Owner"
try { $rt = Join-Path $PSScriptRoot 'run_tests.ps1'; & powershell -ExecutionPolicy Bypass -Command "& '$rt' $Run" }
finally { try { $l = Get-Content $lock -Raw | ConvertFrom-Json; if ($l.pid -eq $PID) { Remove-Item $lock -Force } } catch { }; Write-Host "[gpu_queue] lock released" }
