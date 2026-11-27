<#
  Apeverse release: put a validated commit on the player-facing address http://localhost:8101.
  - 8101 always serves the release worktree  Downloads\ape multiverse 1\apeverse-play-wt  (detached at the released commit).
  - The previous release stays available: the commit it replaced is recorded in release_log.txt, and the 2.2 build is served on 8103.
  - Player saves live in the browser's storage for the address http://localhost:8101, so changing the files never touches them.
  Usage:  powershell -ExecutionPolicy Bypass -File tools\release.ps1 -Commit <sha>   [-Restart]
#>
param([Parameter(Mandatory = $true)][string]$Commit, [switch]$Restart)
$ErrorActionPreference = 'Stop'
$base = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$play = Join-Path $base 'apeverse-play-wt'
if (-not (Test-Path $play)) { throw "release worktree missing: $play" }
Push-Location $play
try {
  $prev = (git rev-parse --short HEAD).Trim()
  git fetch -q origin 2>$null
  git checkout -q --detach $Commit
  $now = (git rev-parse --short HEAD).Trim()
  Add-Content -Path (Join-Path $base 'release_log.txt') -Value ("{0}  {1} -> {2}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm'), $prev, $now)
  Write-Host "Released $now (previous $prev) to http://localhost:8101/index.html"
} finally { Pop-Location }
# local-only owner art that git does not carry (illustrated city maps): hard-link it into the release folder
$devMaps = Join-Path (Split-Path $PSScriptRoot -Parent) 'assets\maps'
if (Test-Path $devMaps) { $dst = Join-Path $play 'assets\maps'; New-Item -ItemType Directory -Force $dst | Out-Null
  Get-ChildItem $devMaps -File | ForEach-Object { $t = Join-Path $dst $_.Name; if (-not (Test-Path $t)) { New-Item -ItemType HardLink -Path $t -Target $_.FullName | Out-Null } } }
$up = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object LocalPort -eq 8101
if ($Restart -or -not $up) {
  Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'serve\.ps1.*-Port 8101' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
  Start-Sleep 1
  Start-Process powershell -ArgumentList ('-NoProfile -ExecutionPolicy Bypass -File "' + (Join-Path $play 'tools\serve.ps1') + '" -Port 8101 -NoBrowser -Root "' + $play + '"') -WindowStyle Hidden
  Start-Sleep 3
}
