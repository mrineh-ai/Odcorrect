$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$cloudflaredDir = Join-Path $root ".tools"
$cloudflaredExe = Join-Path $cloudflaredDir "cloudflared.exe"
$cloudflaredUrl = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"

Set-Location $root

if (-not (Test-Path $cloudflaredExe)) {
    New-Item -ItemType Directory -Force -Path $cloudflaredDir | Out-Null
    Write-Host "Downloading Cloudflare Tunnel..."
    Invoke-WebRequest -Uri $cloudflaredUrl -OutFile $cloudflaredExe
}

$nodeVersion = (& node --version 2>$null)
if (-not $nodeVersion) {
    throw "Node.js was not found. Install Node.js 24+ or start the site from Codex's bundled runtime."
}

$major = [int]($nodeVersion.TrimStart("v").Split(".")[0])
if ($major -lt 24) {
    throw "This backend needs Node.js 24+. Current version is $nodeVersion."
}

$listener = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if (-not $listener) {
    Write-Host "Starting ODCORRECT at http://localhost:3000 ..."
    Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory $root -WindowStyle Hidden
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "Public preview is starting."
Write-Host "Copy the https://*.trycloudflare.com link printed below and share it."
Write-Host "Keep this window open while people are testing."
Write-Host ""

& $cloudflaredExe tunnel --url http://localhost:3000
