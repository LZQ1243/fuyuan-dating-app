@echo off
chcp 65001 >nul
echo ========================================
echo 赴缘婚恋项目 - 一键推送工具
echo ========================================
echo.

REM 检查 Git Bash 是否安装
if exist "C:\Program Files\Git\bin\bash.exe" (
    set GIT_BASH="C:\Program Files\Git\bin\bash.exe"
) else if exist "C:\Program Files\Git\git-bash.exe" (
    set GIT_BASH="C:\Program Files\Git\git-bash.exe"
) else (
    echo ❌ 未找到 Git Bash！
    echo 请确认 Git 已正确安装
    pause
    exit /b 1
)

echo ✓ 找到 Git Bash
echo.
echo 正在打开 Git Bash 执行推送...
echo.

REM 使用 Git Bash 执行推送脚本
%GIT_BASH% -c "cd $(cygpath -u '%~dp0') && bash push-with-gitbash.sh"

echo.
echo ========================================
pause
