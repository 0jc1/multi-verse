<#
  Apeverse GPU test queue (agent 4).  Several agents share one laptop GPU; overlapping headless GPU runs throttle each other and make
  every FPS number meaningless.  This wrapper waits until the GPU is quiet, holds a shared lock while its run lasts, then releases it.
    - Quiet = no live lock held by someone else AND no other Apeverse headless test browser running (profiles named apeverse_prof_*),
      so it also yields to agents that don't use the lock yet.
    - Lock file: %TEMP%\apeverse_gpu.lock (JSON: owner, pid, started).  A lock whose pid is dead is stale and ignored.
    - Gives up waiting after -MaxWaitMin (default 60) and runs anyway, saying so in the log.
  Usage: powershell -ExecutionPolicy Bypass -File tools\tests\gpu_queue.ps1 -Owner agent4 -Run "<run_tests.ps1 arguments>"
  e.g.   ... gpu_queue.ps1 -Owner agent4 -Run "-Suite tools/tests/suite_sevilla.js -Gpu -W 1536 -H 864 -Port 8100 -StepTimeout 900 -Out C:/tmp/x"
#>
param([string]$Owner = 'agent', [int]$MaxWaitMin = 60, [string]$Run = '')
$lock = Join-Path $env:TEMP 'apeverse_gpu.lock'
function Get-Busy {
  if (Test-Path $lock) { try { $l = Get-Content $lock -Raw | ConvertFrom-Json; if ($l.pid -ne $PID -and (Get-Process -Id $l.pid -ErrorAction SilentlyContinue)) { return "lock held by $($l.owner) since $($l.started)" } } catch { } }
  $b = Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" | Where-Object { $_.CommandLine -match 'apeverse_prof_' -and $_.CommandLine -match '--headless' }
  if ($b) { return "$(@($b).Count) other Apeverse test browser(s) running" }
  return $null }
$t0 = Get-Date; $waited = $false
while ($true) { $why = Get-Busy; if (-not $why) { break }
  if (((Get-Date) - $t0).TotalMinutes -gt $MaxWaitMin) { Write-Host "[gpu_queue] waited $MaxWaitMin min ($why); running anyway"; break }
  if (-not $waited) { Write-Host "[gpu_queue] GPU busy: $why. Waiting..." }; $waited = $true; Start-Sleep -Seconds 20 }
Write-Host "[gpu_queue] GPU free after $([int]((Get-Date) - $t0).TotalSeconds) s; lock taken by $Owner"
@{ owner = $Owner; pid = $PID; started = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss') } | ConvertTo-Json -Compress | Set-Content $lock -Encoding utf8
try { $rt = Join-Path $PSScriptRoot 'run_tests.ps1'; & powershell -ExecutionPolicy Bypass -Command "& '$rt' $Run" }
finally { try { $l = Get-Content $lock -Raw | ConvertFrom-Json; if ($l.pid -eq $PID) { Remove-Item $lock -Force } } catch { }; Write-Host "[gpu_queue] lock released" }
