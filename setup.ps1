# setup.ps1 - 首次使用：安装 ohpm 依赖（Windows / DevEco Studio 26）
$ErrorActionPreference = "Stop"
$DEVECO = "C:\Program Files\Huawei\DevEco Studio"
$PROJ = Split-Path -Parent $MyInvocation.MyCommand.Definition

$env:PATH = "$DEVECO\tools\node;$env:PATH"
$env:NODE_HOME = "$DEVECO\tools\node"
Set-Location $PROJ

Write-Host "==> ohpm install ..." -ForegroundColor Green
& "$DEVECO\tools\ohpm\bin\ohpm.bat" install
Write-Host "==> Done. Now run .\build.ps1" -ForegroundColor Green
