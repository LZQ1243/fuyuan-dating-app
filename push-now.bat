@echo off
cd /d "C:\Users\Administrator\Desktop\赴缘婚恋应用开发"

echo ============================================================
echo       赴缘婚恋应用 - GitHub 推送脚本
echo ============================================================
echo.
echo 仓库地址: https://github.com/LZQ1243/fuyuan-dating-app
echo.
echo 正在推送代码...
echo.

git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ============================================================
    echo  成功！代码已推送到 GitHub
    echo  访问地址: https://github.com/LZQ1243/fuyuan-dating-app
    echo ============================================================
) else (
    echo.
    echo ============================================================
    echo  推送失败！
    echo.
    echo  可能的原因：
    echo  1. 需要输入用户名和密码（或 Personal Access Token）
    echo  2. Token 获取方式：
    echo     - 访问: https://github.com/settings/tokens
    echo     - 点击: Generate new token (classic)
    echo     - 勾选: repo 权限
    echo     - 复制生成的 Token 作为密码使用
    echo ============================================================
)

echo.
pause
