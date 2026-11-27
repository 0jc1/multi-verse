<#
  Apeverse automated tests (no Node needed). Drives headless Chrome/Edge over the DevTools protocol.
  1. starts tools\serve.ps1 on a test port, 2. opens the game in a fresh browser profile,
  3. injects tools\tests\suite_cdp.js and runs its steps one by one, taking screenshots where a step asks for one.
  Usage: powershell -ExecutionPolicy Bypass -File tools\tests\run_tests.ps1 [-Out <folder>] [-Only <regex>] [-Mobile] [-Headed]
  Results: <Out>\results.json, <Out>\results.md, <Out>\*.png
#>
param([string]$Out = "$env:TEMP\apeverse_tests", [string]$Only = '', [switch]$Mobile, [switch]$Headed, [int]$Port = 8731, [int]$W = 1280, [int]$H = 720, [string]$Suite = '', [string]$GameRoot = '', [switch]$FileMode, [int]$StepTimeout = 180, [switch]$Gpu)
$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
New-Item -ItemType Directory -Force $Out | Out-Null
$browser = @("$env:ProgramFiles\Google\Chrome\Application\chrome.exe", "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe", "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $browser) { throw 'Chrome or Edge not found' }

$srvArgs = @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', "`"$Root\tools\serve.ps1`"", '-Port', $Port, '-NoBrowser'); if ($GameRoot) { $srvArgs += @('-Root', "`"$GameRoot`"") }
$srv = Start-Process powershell -ArgumentList $srvArgs -PassThru -WindowStyle Hidden
$prof = Join-Path $env:TEMP ("apeverse_prof_" + [guid]::NewGuid().ToString('N'))
$dbg = 0   # a DevTools port nobody is listening on (a random pick once let two agents' runs drive the same Chrome)
$busyPorts = @([Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners() | ForEach-Object { $_.Port })
for ($k = 0; $k -lt 200 -and -not $dbg; $k++) { $p = 9333 + (Get-Random -Maximum 2000); if ($busyPorts -notcontains $p) { $dbg = $p } }
if (-not $dbg) { throw 'no free DevTools port' }
$args2 = @("--remote-debugging-port=$dbg", "--user-data-dir=`"$prof`"", '--no-first-run', '--no-default-browser-check', '--autoplay-policy=no-user-gesture-required',
  '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', "--window-size=$W,$H", '--mute-audio', 'about:blank')
if ($Gpu) { $args2 = $args2 | Where-Object { $_ -ne '--use-angle=swiftshader' -and $_ -ne '--enable-unsafe-swiftshader' }; $args2 = @('--use-angle=d3d11', '--enable-gpu-rasterization') + $args2 }   # -Gpu: render on the real graphics card (FPS measurements)
if (-not $Headed) { $args2 = @('--headless=new') + $args2 }
$br = Start-Process $browser -ArgumentList $args2 -PassThru
$results = New-Object System.Collections.ArrayList
try {
  Start-Sleep -Milliseconds 1500
  $tgt = $null; for ($i = 0; $i -lt 30 -and -not $tgt; $i++) { try { $tgt = (Invoke-RestMethod "http://127.0.0.1:$dbg/json" -UseBasicParsing) | Where-Object { $_.type -eq 'page' } | Select-Object -First 1 } catch { Start-Sleep -Milliseconds 300 } }
  if (-not $tgt) { throw 'browser debug endpoint not reachable' }
  $ws = New-Object System.Net.WebSockets.ClientWebSocket; $ws.Options.KeepAliveInterval = [TimeSpan]::FromSeconds(20)
  $ws.ConnectAsync([Uri]$tgt.webSocketDebuggerUrl, [Threading.CancellationToken]::None).Wait()
  $script:id = 0
  function Send-Cdp([string]$method, $params, [int]$timeoutSec = 120) {
    $script:id++; $myId = $script:id
    $json = (@{ id = $myId; method = $method; params = $(if ($params) { $params } else { @{} }) } | ConvertTo-Json -Depth 12 -Compress)
    $bytes = [Text.Encoding]::UTF8.GetBytes($json); $ws.SendAsync([ArraySegment[byte]]$bytes, 'Text', $true, [Threading.CancellationToken]::None).Wait()
    $deadline = (Get-Date).AddSeconds($timeoutSec)
    while ((Get-Date) -lt $deadline) {
      $ms = New-Object IO.MemoryStream; $buf = New-Object byte[] 1048576
      do { $seg = [ArraySegment[byte]]::new($buf); $t = $ws.ReceiveAsync($seg, [Threading.CancellationToken]::None); if (-not $t.Wait([int](($deadline - (Get-Date)).TotalMilliseconds + 1000))) { throw "CDP timeout on $method" }; $ms.Write($buf, 0, $t.Result.Count) } while (-not $t.Result.EndOfMessage)
      $txt = [Text.Encoding]::UTF8.GetString($ms.ToArray()); if ($txt -notmatch ('"id":' + $myId + '[,}]')) { continue }
      $o = $txt | ConvertFrom-Json; if ($o.id -eq $myId) { if ($o.error) { throw "$method failed: $($o.error.message)" }; return $o.result }
    }
    throw "CDP timeout on $method"
  }
  function Eval-Js([string]$expr, [int]$timeoutSec = 120) {
    $r = Send-Cdp 'Runtime.evaluate' @{ expression = $expr; awaitPromise = $true; returnByValue = $true } $timeoutSec
    if ($r.exceptionDetails) { throw ("JS exception: " + $r.exceptionDetails.text + ' ' + $r.exceptionDetails.exception.description) }; return $r.result.value
  }
  function Save-Shot([string]$name) { $r = Send-Cdp 'Page.captureScreenshot' @{ format = 'png' }; [IO.File]::WriteAllBytes((Join-Path $Out "$name.png"), [Convert]::FromBase64String($r.data)) }
  [void](Send-Cdp 'Page.enable'); [void](Send-Cdp 'Runtime.enable')
  if ($Mobile) { [void](Send-Cdp 'Emulation.setDeviceMetricsOverride' @{ width = 915; height = 412; deviceScaleFactor = 2; mobile = $true }); [void](Send-Cdp 'Emulation.setTouchEmulationEnabled' @{ enabled = $true; maxTouchPoints = 5 })
    [void](Send-Cdp 'Emulation.setUserAgentOverride' @{ userAgent = 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36' }) }
  [void](Send-Cdp 'Page.addScriptToEvaluateOnNewDocument' @{ source = "window.__APE_ERRS=[];addEventListener('error',e=>{if(e.message)__APE_ERRS.push(e.message+' @'+(e.filename||'').split('/').pop()+':'+e.lineno)});addEventListener('unhandledrejection',e=>__APE_ERRS.push('rejection: '+(e.reason&&e.reason.message||e.reason)));const ce=console.error.bind(console);console.error=function(){try{const m=[].map.call(arguments,a=>String(a&&a.message||a)).join(' ');if(!/Failed to load resource/.test(m))__APE_ERRS.push('console.error: '+m.slice(0,300))}catch(x){}return ce.apply(null,arguments)};" })
  $url = if ($FileMode) { ([Uri](Join-Path $(if ($GameRoot) { $GameRoot } else { $Root }) 'index.html')).AbsoluteUri } else { "http://localhost:$Port/index.html" }
  [void](Send-Cdp 'Page.navigate' @{ url = $url }); Start-Sleep -Seconds 3
  $suite = [IO.File]::ReadAllText($(if ($Suite) { $Suite } else { "$Root\tools\tests\suite_cdp.js" }))
  [void](Eval-Js ($suite + "`n;true"))
  $names = Eval-Js "JSON.stringify(APE_T.names($(if ($Mobile) {'true'} else {'false'})))" | ConvertFrom-Json
  for ($i = 0; $i -lt $names.Count; $i++) {
    if ($Only -and $names[$i] -notmatch $Only -and $names[$i] -notmatch '^(boot|setup)') { continue }
    Write-Host "== $($names[$i])"
    try { $r = (Eval-Js "APE_T.exec($i).then(r=>JSON.stringify(r))" $StepTimeout) | ConvertFrom-Json } catch { $r = [pscustomobject]@{ checks = @([pscustomobject]@{ n = "$($names[$i]): step crashed"; pass = $false; d = "$_" }); shot = $null } }
    foreach ($c in $r.checks) { [void]$results.Add($c); Write-Host ("  " + $(if ($c.pass) { 'PASS' } else { 'FAIL' }) + " $($c.n) $(if ($c.d) { ':: ' + $c.d })") }
    if ($r.shot) { Save-Shot $r.shot }
  }
  $errs = Eval-Js 'JSON.stringify(window.__APE_ERRS||[])' | ConvertFrom-Json
  [void]$results.Add([pscustomobject]@{ n = 'no uncaught JS errors during the run'; pass = (@($errs).Count -eq 0); d = ($errs -join ' | ') })
} finally {
  try { $ws.Dispose() } catch { }; try { Stop-Process -Id $br.Id -Force -ErrorAction Stop } catch { }; Get-CimInstance Win32_Process -Filter "Name='chrome.exe' or Name='msedge.exe'" | Where-Object { $_.CommandLine -like "*$prof*" } | ForEach-Object { try { Stop-Process -Id $_.ProcessId -Force -ErrorAction Stop } catch { } }
  try { Stop-Process -Id $srv.Id -Force -ErrorAction Stop } catch { }
  Start-Sleep -Milliseconds 500; try { Remove-Item -Recurse -Force $prof -ErrorAction Stop } catch { }
}
$pass = @($results | Where-Object { $_.pass }).Count; $tot = $results.Count
$results | ConvertTo-Json -Depth 5 | Out-File -Encoding utf8 (Join-Path $Out 'results.json')
$md = @("# Apeverse test run $(Get-Date -Format 'yyyy-MM-dd HH:mm')", '', "**$pass / $tot passed** $(if ($Mobile) {'(emulated phone)'} else {'(desktop)'})", '', '| Check | Result | Detail |', '|---|---|---|')
foreach ($c in $results) { $md += "| $($c.n) | $(if ($c.pass) {'PASS'} else {'**FAIL**'}) | $(([string]$c.d) -replace '\|', '/' -replace "`n", ' ') |" }
$md -join "`n" | Out-File -Encoding utf8 (Join-Path $Out 'results.md')
Write-Host "`n$pass / $tot passed. Report: $Out\results.md"
