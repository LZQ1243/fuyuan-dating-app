# 赴缘婚恋平台 - 后端启动脚本 (PowerShell)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  赴缘婚恋平台 - 启动后端服务" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 切换到后端目录
$backendPath = "c:\Users\Administrator\Desktop\赴缘婚恋应用开发\backend"
Set-Location $backendPath

Write-Host "[当前目录] $backendPath" -ForegroundColor Green
Write-Host ""

# 检查node_modules是否存在
if (-not (Test-Path "node_modules")) {
    Write-Host "[安装] 后端依赖..." -ForegroundColor Yellow
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

# 检查.env文件
if (-not (Test-Path ".env")) {
    Write-Host "[创建] 环境变量文件..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "[提示] 请编辑 .env 文件配置相关参数" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "等待5秒..." -ForegroundColor Gray
    Start-Sleep -Seconds 5
}

# 启动后端服务
Write-Host ""
Write-Host "[启动] 后端服务..." -ForegroundColor Yellow
Write-Host "访问地址: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "按 Ctrl+C 停止服务" -ForegroundColor Gray
Write-Host ""

npm run dev
