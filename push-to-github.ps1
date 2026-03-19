# 赴缘婚恋应用 - 推送到 GitHub

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  赴缘婚恋应用 - 推送到 GitHub" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# 检查当前分支
$branch = git branch --show-current
Write-Host "当前分支: $branch" -ForegroundColor Green
Write-Host ""

# 检查远程仓库
$remotes = git remote -v
Write-Host "远程仓库:" -ForegroundColor Green
Write-Host $remotes
Write-Host ""

# 检查待提交的文件
$status = git status --short
if ($status) {
    Write-Host "有待提交的文件:" -ForegroundColor Yellow
    Write-Host $status
    Write-Host ""
}

# 确认推送
Write-Host "准备推送到 GitHub..." -ForegroundColor Cyan
Write-Host "仓库: https://github.com/LZQ1243/fuyuan-dating-app.git" -ForegroundColor Green
Write-Host ""

$confirm = Read-Host "确认推送? (y/n)"
if ($confirm -ne "y") {
    Write-Host "已取消" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "正在推送..." -ForegroundColor Cyan
Write-Host ""

# 推送到 GitHub
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Green
    Write-Host "  推送成功! 🎉" -ForegroundColor Green
    Write-Host "==================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "访问仓库: https://github.com/LZQ1243/fuyuan-dating-app" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "推送失败!" -ForegroundColor Red
    Write-Host "请检查:" -ForegroundColor Yellow
    Write-Host "1. 网络连接" -ForegroundColor Yellow
    Write-Host "2. GitHub 凭证" -ForegroundColor Yellow
    Write-Host "3. 仓库地址" -ForegroundColor Yellow
}
