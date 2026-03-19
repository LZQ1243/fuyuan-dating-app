@echo off
chcp 65001 >nul
echo ==================================
echo   赴缘婚恋应用 - 推送到 GitHub
echo ==================================
echo.

echo 当前分支:
git branch --show-current
echo.

echo 远程仓库:
git remote -v
echo.

echo 准备推送...
echo 仓库: https://github.com/LZQ1243/fuyuan-dating-app.git
echo.

echo 正在推送...
echo.

git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ==================================
    echo   推送成功! 🎉
    echo ==================================
    echo.
    echo 访问仓库: https://github.com/LZQ1243/fuyuan-dating-app
    echo.
) else (
    echo.
    echo ==================================
    echo   推送失败!
    echo ==================================
    echo.
    echo 请检查:
    echo 1. 网络连接
    echo 2. GitHub 凭证
    echo 3. 仓库地址
    echo.
)

pause
