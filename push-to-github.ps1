# 设置项目路径
$projectPath = "c:\Users\Administrator\Desktop\赴缘婚恋应用开发"
Set-Location $projectPath

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  推送项目到GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查Git仓库
Write-Host "[1/5] 检查Git仓库..." -ForegroundColor Yellow
if (-not (Test-Path ".git")) {
    Write-Host "未初始化Git仓库,正在初始化..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git仓库已初始化" -ForegroundColor Green
} else {
    Write-Host "✅ Git仓库已存在" -ForegroundColor Green
}
Write-Host ""

# 查看状态
Write-Host "[2/5] 查看Git状态..." -ForegroundColor Yellow
git status
Write-Host ""

# 添加文件
Write-Host "[3/5] 添加文件..." -ForegroundColor Yellow
git add .
Write-Host "✅ 文件已添加" -ForegroundColor Green
Write-Host ""

# 提交更改
Write-Host "[4/5] 提交更改..." -ForegroundColor Yellow
$commitMsg = Read-Host "请输入提交信息"
git commit -m $commitMsg
Write-Host "✅ 已提交" -ForegroundColor Green
Write-Host ""

# 推送
Write-Host "[5/5] 推送到GitHub..." -ForegroundColor Yellow
Write-Host ""
Write-Host "检查远程仓库..." -ForegroundColor Cyan
git remote -v
Write-Host ""

$remoteUrl = Read-Host "请输入GitHub仓库URL(或回车使用现有远程)"

if ($remoteUrl -ne "") {
    Write-Host "添加远程仓库..." -ForegroundColor Yellow
    git remote add origin $remoteUrl
    Write-Host "✅ 远程仓库已添加" -ForegroundColor Green
}

Write-Host ""
Write-Host "正在推送..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✅ 推送成功!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ❌ 推送失败!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "请检查:" -ForegroundColor Yellow
    Write-Host "1. 仓库URL是否正确" -ForegroundColor White
    Write-Host "2. 认证信息是否正确" -ForegroundColor White
    Write-Host "3. 网络连接是否正常" -ForegroundColor White
}

Write-Host ""
Read-Host "按任意键退出..."
