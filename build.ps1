# build.ps1 - 碳足迹工程一键命令行构建脚本（Windows / DevEco Studio 26 / API 26）
# 用法：
#   .\build.ps1            # 构建 debug HAP
#   .\build.ps1 release    # 构建 release HAP
# 产物：entry\build\default\outputs\default\entry-default-unsigned.hap
$ErrorActionPreference = "Stop"

$DEVECO = "C:\Program Files\Huawei\DevEco Studio"
$PROJ = Split-Path -Parent $MyInvocation.MyCommand.Definition

# 关键环境：Node / JBR(Java) / SDK
$env:PATH = "$DEVECO\tools\node;$DEVECO\jbr\bin;$env:PATH"
$env:NODE_HOME = "$DEVECO\tools\node"
$env:JAVA_HOME = "$DEVECO\jbr"
$env:DEVECO_SDK_HOME = "$DEVECO\sdk"

Set-Location $PROJ

$mode = "debug"
if ($args -contains "release") { $mode = "release" }

Write-Host "==> Building CarbonFootprint ($mode) ..." -ForegroundColor Green
& "$DEVECO\tools\node\node.exe" "$DEVECO\tools\hvigor\bin\hvigorw.js" `
    --mode module -p product=default -p buildMode=$mode assembleHap --no-daemon
