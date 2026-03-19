# 安装前端依赖脚本
Write-Host "正在进入前端目录..." -ForegroundColor Green
Set-Location "frontend-react"

Write-Host "正在安装依赖..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "依赖安装完成!" -ForegroundColor Green
} else {
    Write-Host "依赖安装失败!" -ForegroundColor Red
    exit 1
}

Write-Host "按任意键退出..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
