<#
  Apeverse asset forge: writes assets\models\astro9\*.glb from js\gfx_forge.js (no Node or Blender needed).
  Starts tools\serve.ps1 on a spare port, opens tools\forge.html in headless Chrome/Edge, runs the GLTFExporter, saves the files.
  Usage: powershell -ExecutionPolicy Bypass -File tools\forge_glb.ps1
#>
param([int]$Port = 8741)
$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$OutDir = Join-Path $Root 'assets\models\astro9'; New-Item -ItemType Directory -Force $OutDir | Out-Null
$browser = @("$env:ProgramFiles\Google\Chrome\Application\chrome.exe", "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe", "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $browser) { throw 'Chrome or Edge not found' }
$srv = Start-Process powershell -ArgumentList @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', "`"$Root\tools\serve.ps1`"", '-Port', $Port, '-NoBrowser') -PassThru -WindowStyle Hidden
$prof = Join-Path $env:TEMP ("apeverse_forge_" + [guid]::NewGuid().ToString('N')); $dbg = 9833 + (Get-Random -Maximum 300)
$br = Start-Process $browser -ArgumentList @('--headless=new', "--remote-debugging-port=$dbg", "--user-data-dir=`"$prof`"", '--no-first-run', 'about:blank') -PassThru
try {
  Start-Sleep -Milliseconds 1500
  $tgt = $null; for ($i = 0; $i -lt 30 -and -not $tgt; $i++) { try { $tgt = (Invoke-RestMethod "http://127.0.0.1:$dbg/json" -UseBasicParsing) | Where-Object { $_.type -eq 'page' } | Select-Object -First 1 } catch { Start-Sleep -Milliseconds 300 } }
  $ws = New-Object System.Net.WebSockets.ClientWebSocket; $ws.ConnectAsync([Uri]$tgt.webSocketDebuggerUrl, [Threading.CancellationToken]::None).Wait(); $script:id = 0
  function Send-Cdp([string]$method, $params) {
    $script:id++; $myId = $script:id; $json = (@{ id = $myId; method = $method; params = $(if ($params) { $params } else { @{} }) } | ConvertTo-Json -Depth 8 -Compress)
    $bytes = [Text.Encoding]::UTF8.GetBytes($json); $ws.SendAsync([ArraySegment[byte]]$bytes, 'Text', $true, [Threading.CancellationToken]::None).Wait()
    while ($true) { $ms = New-Object IO.MemoryStream; $buf = New-Object byte[] 1048576
      do { $t = $ws.ReceiveAsync([ArraySegment[byte]]::new($buf), [Threading.CancellationToken]::None); if (-not $t.Wait(120000)) { throw "timeout $method" }; $ms.Write($buf, 0, $t.Result.Count) } while (-not $t.Result.EndOfMessage)
      $txt = [Text.Encoding]::UTF8.GetString($ms.ToArray()); if ($txt -notmatch ('"id":' + $myId + '[,}]')) { continue }
      $o = $txt | ConvertFrom-Json; if ($o.error) { throw "$method failed: $($o.error.message)" }; return $o.result }
  }
  [void](Send-Cdp 'Page.enable'); [void](Send-Cdp 'Page.navigate' @{ url = "http://localhost:$Port/tools/forge.html" }); Start-Sleep -Seconds 3
  $r = Send-Cdp 'Runtime.evaluate' @{ expression = 'FORGE.run()'; awaitPromise = $true; returnByValue = $true }
  if ($r.exceptionDetails) { throw ("forge failed: " + $r.exceptionDetails.exception.description) }
  $files = $r.result.value | ConvertFrom-Json
  foreach ($p in $files.PSObject.Properties) { $f = Join-Path $OutDir $p.Name; [IO.File]::WriteAllBytes($f, [Convert]::FromBase64String($p.Value)); "{0,-20} {1,8} bytes" -f $p.Name, (Get-Item $f).Length }
} finally {
  try { $ws.Dispose() } catch { }; try { Stop-Process -Id $br.Id -Force } catch { }
  Get-CimInstance Win32_Process -Filter "Name='chrome.exe' or Name='msedge.exe'" | Where-Object { $_.CommandLine -like "*$prof*" } | ForEach-Object { try { Stop-Process -Id $_.ProcessId -Force } catch { } }
  try { Stop-Process -Id $srv.Id -Force } catch { }; Start-Sleep -Milliseconds 400; try { Remove-Item -Recurse -Force $prof } catch { }
}
