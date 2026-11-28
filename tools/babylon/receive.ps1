<#
  Apeverse 3.0 export receiver: a tiny localhost endpoint that stores files POSTed by the in-browser exporters
  (GLB from the Babylon mirror, world JSON).  Usage: powershell -File tools\babylon\receive.ps1 -Port 8199 -Out exports
  POST http://localhost:8199/save?name=<file>   body = file bytes.   Only listens on localhost; file names are sanitised.
#>
param([int]$Port = 8199, [string]$Out = 'exports')
$ErrorActionPreference = 'Stop'; New-Item -ItemType Directory -Force $Out | Out-Null; $Out = (Resolve-Path $Out).Path
$L = New-Object System.Net.HttpListener; $L.Prefixes.Add("http://localhost:$Port/"); $L.Start(); Write-Host "receiver on $Port -> $Out"
while ($L.IsListening) { $c = $L.GetContext(); $r = $c.Request; $s = $c.Response
  $s.AddHeader('Access-Control-Allow-Origin', '*'); $s.AddHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); $s.AddHeader('Access-Control-Allow-Headers', '*')
  if ($r.HttpMethod -eq 'POST') { $name = ($r.QueryString['name'] -replace '[^A-Za-z0-9._-]', '_'); if (-not $name) { $name = 'export.bin' }
    $fs = [IO.File]::Create((Join-Path $Out $name)); $r.InputStream.CopyTo($fs); $fs.Close(); $b = [Text.Encoding]::UTF8.GetBytes('ok ' + $name); $s.OutputStream.Write($b, 0, $b.Length) }
  $s.Close() }
