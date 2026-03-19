@echo off
echo.
echo 检查远程仓库配置...
cd /d "c:\Users\Administrator\Desktop\赴缘婚恋应用开发"
git remote -v 2>nul

if errorlevel 1 (
    echo 未配置远程仓库，请输入GitHub仓库URL:
    set /p repoUrl=
    git remote add origin %repoUrl%
)

echo.
echo 开始提交和推送...
git add .
git commit -m "Initial commit"
git push -u origin main
pause
