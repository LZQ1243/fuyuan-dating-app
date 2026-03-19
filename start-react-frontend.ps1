# 启动React前端项目
Write-Host "===========================================" -ForegroundColor Green
Write-Host "启动赴缘婚恋应用 - React前端" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""

# 检查Node.js是否安装
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "❌ 错误: 未安装Node.js，请先安装Node.js" -ForegroundColor Red
    Write-Host "   下载地址: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Node.js版本: $nodeVersion" -ForegroundColor Green

# 检查pnpm是否安装
$pnpmVersion = pnpm --version 2>$null
if (-not $pnpmVersion) {
    Write-Host "❌ 错误: 未安装pnpm" -ForegroundColor Red
    Write-Host "   请运行: npm install -g pnpm" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ pnpm版本: $pnpmVersion" -ForegroundColor Green
Write-Host ""

# 进入前端目录
$frontendDir = "frontend-react"
if (-not (Test-Path $frontendDir)) {
    Write-Host "❌ 错误: 未找到前端目录 $frontendDir" -ForegroundColor Red
    exit 1
}

Set-Location $frontendDir

# 检查是否已安装依赖
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 首次运行，正在安装依赖..." -ForegroundColor Yellow
    pnpm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 依赖安装失败" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ 依赖安装完成" -ForegroundColor Green
    Write-Host ""
}

# 启动开发服务器
Write-Host "🚀 启动开发服务器..." -ForegroundColor Green
Write-Host "   前端地址: http://localhost:3002" -ForegroundColor Cyan
Write-Host "   按 Ctrl+C 停止" -ForegroundColor Yellow
Write-Host ""

pnpm dev
