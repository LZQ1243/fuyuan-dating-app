# 一键启动整个项目（后端 + 前端）
Write-Host "===========================================" -ForegroundColor Green
Write-Host "启动赴缘婚恋应用 - 完整系统" -ForegroundColor Green
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

# 启动后端（在后台）
Write-Host "📦 启动后端服务..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\backend
    npm install
    npm start
}

Start-Sleep -Seconds 3

# 启动前端（在后台）
Write-Host "🎨 启动前端服务..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\frontend-react
    pnpm install
    pnpm dev
}

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "===========================================" -ForegroundColor Green
Write-Host "✅ 所有服务已启动！" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📱 后端地址: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🌐 前端地址: http://localhost:3002" -ForegroundColor Cyan
Write-Host ""
Write-Host "按 Ctrl+C 停止所有服务" -ForegroundColor Yellow
Write-Host ""

# 等待作业完成
try {
    Wait-Job $backendJob, $frontendJob | Out-Null
} finally {
    # 清理作业
    Stop-Job $backendJob, $frontendJob
    Remove-Job $backendJob, $frontendJob
}
