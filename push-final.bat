@echo off
echo ============================================================
echo       赴缘婚恋应用 - GitHub 推送脚本
echo ============================================================
echo.
echo 正在推送到：https://github.com/LZQ1243/fuyuan-dating-app
echo.
echo 请按以下步骤操作：
echo.
echo 1. 系统会要求输入 GitHub 用户名和密码（或 Personal Access Token）
echo 2. 密码输入时不会显示任何字符，这是正常的
echo 3. 如果使用密码登录失败，请使用 Personal Access Token
echo 4. Token 获取方式：Settings -> Developer settings -> Personal access tokens
echo.
echo ============================================================
echo.

cd /d "C:\Users\Administrator\Desktop\赴缘婚恋应用开发"

git push -u origin main

echo.
echo ============================================================
echo 推送完成！
echo 请访问：https://github.com/LZQ1243/fuyuan-dating-app
echo ============================================================
pause
