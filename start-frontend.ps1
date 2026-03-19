# 赴缘婚恋平台 - 前端启动脚本 (PowerShell)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  赴缘婚恋平台 - 启动前端服务" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 切换到前端目录
$frontendPath = "c:\Users\Administrator\Desktop\赴缘婚恋应用开发\frontend-react"
Set-Location $frontendPath

Write-Host "[当前目录] $frontendPath" -ForegroundColor Green
Write-Host ""

# 检查node_modules是否存在
if (-not (Test-Path "node_modules")) {
    Write-Host "[安装] 前端依赖..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[错误] 依赖安装失败！" -ForegroundColor Red
        Read-Host "按回车键退出"
        exit 1
    }
    Write-Host "[成功] 依赖安装完成！" -ForegroundColor Green
} else {
    Write-Host "[检查] 依赖已安装" -ForegroundColor Green
}

# 启动前端服务
Write-Host ""
Write-Host "[启动] 前端服务..." -ForegroundColor Yellow
Write-Host "访问地址: http://localhost:3002" -ForegroundColor Cyan
Write-Host ""
Write-Host "按 Ctrl+C 停止服务" -ForegroundColor Gray
Write-Host ""

npm run dev
