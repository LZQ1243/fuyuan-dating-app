@echo off
echo.
echo 诊断推送问题...
cd /d "c:\Users\Administrator\Desktop\赴缘婚恋应用开发"

echo.
echo 1. 检查Git版本:
git --version
echo.

echo 2. 检查远程仓库:
git remote -v
echo.

echo 3. 检查当前分支:
git branch
echo.

echo 4. 检查Git状态:
git status
echo.

echo 5. 测试GitHub连接:
ping -n 1 github.com
echo.

echo 6. 测试HTTPS连接:
curl -I https://github.com 2>nul || echo curl不可用
echo.

echo.
echo 如果以上都正常，请尝试手动推送:
echo git push -u origin main
echo.
pause
