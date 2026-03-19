@echo off
echo ====================================
echo   赴缘婚恋应用 - 终极推送方案
echo ====================================
echo.

echo 正在启动 Git Bash...
echo.

REM 查找 Git Bash
if exist "C:\Program Files\Git\bin\bash.exe" (
    "C:\Program Files\Git\bin\bash.exe" -c "cd /c/Users/Administrator/Desktop/赴缘婚恋应用开发 && git push -u origin main"
    goto :end
)

if exist "C:\Program Files\Git\git-bash.exe" (
    "C:\Program Files\Git\git-bash.exe" -c "cd /c/Users/Administrator/Desktop/赴缘婚恋应用开发 && git push -u origin main"
    goto :end
)

echo.
echo ====================================
echo   Git Bash 未找到
echo ====================================
echo.
echo 请手动操作:
echo.
echo 1. 打开 Git Bash (如果已安装 Git)
echo    - 在开始菜单搜索 "Git Bash"
echo.
echo.
echo 2. 执行以下命令:
echo.
echo    cd /c/Users/Administrator/Desktop/赴缘婚恋应用开发
echo    git push -u origin main
echo.
echo.
echo 3. 输入用户名: LZQ1243
echo 4. 输入密码或 Token
echo.
echo.
echo 或者在 VS Code 中:
echo    - 打开集成终端
echo    - 输入: git push -u origin main
echo.
echo.
pause
:end
