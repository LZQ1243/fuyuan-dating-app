@echo off
chcp 65001 >nul
echo ====================================
echo   赴缘婚恋应用 - 推送到 Gitee
echo ====================================
echo.

cd /d "C:\Users\Administrator\Desktop\赴缘婚恋应用开发"

echo 当前目录: %cd%
echo.

echo ====================================
echo   开始推送...
echo ====================================
echo.

echo 远程仓库:
git remote -v
echo.

echo ====================================
echo   推送命令:
echo   git push -u origin master
echo.
echo ====================================
echo.

git push -u origin master

if %errorlevel% equ 0 (
    echo.
    echo ====================================
    echo   推送成功! 🎉
    echo ====================================
    echo.
    echo 访问仓库: https://gitee.com/LZQ1243/fuyuan-dating-app
    echo.
) else (
    echo.
    echo ====================================
    echo   推送失败!
    echo ====================================
    echo.
    echo 可能的原因:
    echo 1. 网络连接问题
    echo 2. 仓库未创建
    echo 3. 用户名或密码错误
    echo.
)

pause
