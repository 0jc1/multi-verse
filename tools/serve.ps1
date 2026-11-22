<#
  Apeverse local web server (no Python / Node needed). Windows PowerShell 5.1+.
  Serves this game folder on http://localhost:<port>/ with HTTP Range support (needed for video).
  Requests are handled in parallel so several videos can stream at once.
  Usage:  powershell -ExecutionPolicy Bypass -File tools\serve.ps1 [-Port 8000] [-NoBrowser]
  Only listens on localhost. Close the window (or Ctrl+C) to stop.
#>
param([int]$Port = 8000, [switch]$NoBrowser, [string]$Root = '')
$ErrorActionPreference = 'Stop'
$Root = if ($Root) { (Resolve-Path $Root).Path } else { (Resolve-Path (Join-Path $PSScriptRoot '..')).Path }

$L = New-Object System.Net.HttpListener
$L.Prefixes.Add("http://localhost:$Port/")
try { $L.Start() } catch { Write-Host "Could not start on port $Port ($($_.Exception.Message)). Is another server already running? Try: -Port 8001" -ForegroundColor Red; if (-not $NoBrowser) { Read-Host 'Press Enter to close' | Out-Null }; exit 1 }
Write-Host "Apeverse is running at http://localhost:$Port/index.html" -ForegroundColor Green
Write-Host "Serving: $Root"
Write-Host "Close this window to stop the server."
if (-not $NoBrowser) { Start-Process "http://localhost:$Port/index.html" }

$handler = {
  param($ctx, $Root)
  $MIME = @{ '.html'='text/html; charset=utf-8'; '.js'='text/javascript; charset=utf-8'; '.css'='text/css; charset=utf-8'; '.json'='application/json; charset=utf-8';
    '.png'='image/png'; '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'; '.webp'='image/webp'; '.gif'='image/gif'; '.svg'='image/svg+xml'; '.ico'='image/x-icon';
    '.mp4'='video/mp4'; '.webm'='video/webm'; '.mp3'='audio/mpeg'; '.ogg'='audio/ogg'; '.wav'='audio/wav'; '.m4a'='audio/mp4';
    '.glb'='model/gltf-binary'; '.gltf'='model/gltf+json'; '.bin'='application/octet-stream'; '.vtt'='text/vtt'; '.txt'='text/plain; charset=utf-8'; '.md'='text/plain; charset=utf-8' }
  $req = $ctx.Request; $res = $ctx.Response
  try {
    $rel = [Uri]::UnescapeDataString($req.Url.AbsolutePath).TrimStart('/')
    if ($rel -eq '') { $rel = 'index.html' }
    $path = [IO.Path]::GetFullPath([IO.Path]::Combine($Root, $rel))
    if (-not $path.StartsWith($Root, [StringComparison]::OrdinalIgnoreCase) -or -not [IO.File]::Exists($path)) {
      $res.StatusCode = 404; $b = [Text.Encoding]::UTF8.GetBytes('Not found'); $res.OutputStream.Write($b, 0, $b.Length); return
    }
    $ext = [IO.Path]::GetExtension($path).ToLower()
    $res.ContentType = if ($MIME.ContainsKey($ext)) { $MIME[$ext] } else { 'application/octet-stream' }
    $res.AddHeader('Accept-Ranges', 'bytes'); $res.AddHeader('Cache-Control', 'no-cache')
    $fs = [IO.File]::Open($path, 'Open', 'Read', 'ReadWrite')
    try {
      $len = $fs.Length; $start = [int64]0; $end = $len - 1
      $range = $req.Headers['Range']
      if ($range -and $range -match 'bytes=(\d*)-(\d*)') {
        if ($Matches[1] -ne '') { $start = [int64]$Matches[1]; if ($Matches[2] -ne '') { $end = [Math]::Min([int64]$Matches[2], $len - 1) } }
        elseif ($Matches[2] -ne '') { $start = [Math]::Max([int64]0, $len - [int64]$Matches[2]) }
        if ($start -gt $end -or $start -ge $len) { $res.StatusCode = 416; $res.AddHeader('Content-Range', "bytes */$len"); return }
        $res.StatusCode = 206; $res.AddHeader('Content-Range', "bytes $start-$end/$len")
      }
      $count = $end - $start + 1; $res.ContentLength64 = $count
      if ($req.HttpMethod -ne 'HEAD') {
        [void]$fs.Seek($start, 'Begin'); $buf = New-Object byte[] 262144; $left = $count
        while ($left -gt 0) { $n = $fs.Read($buf, 0, [int][Math]::Min($buf.Length, $left)); if ($n -le 0) { break }; $res.OutputStream.Write($buf, 0, $n); $left -= $n }
      }
    } finally { $fs.Close() }
  } catch { } finally { try { $res.Close() } catch { } }   # aborted connections are normal while video seeks
}

$pool = [RunspaceFactory]::CreateRunspacePool(1, 16); $pool.Open()
$jobs = New-Object System.Collections.ArrayList
try {
  while ($L.IsListening) {
    $ctx = $L.GetContext()
    $ps = [PowerShell]::Create(); $ps.RunspacePool = $pool
    [void]$ps.AddScript($handler).AddArgument($ctx).AddArgument($Root)
    [void]$jobs.Add(@{ ps = $ps; h = $ps.BeginInvoke() })
    for ($i = $jobs.Count - 1; $i -ge 0; $i--) { $j = $jobs[$i]; if ($j.h.IsCompleted) { try { $j.ps.EndInvoke($j.h) } catch { }; $j.ps.Dispose(); $jobs.RemoveAt($i) } }
  }
} finally { $L.Stop(); $pool.Close() }
