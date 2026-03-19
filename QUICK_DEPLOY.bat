@echo off
REM 赴缘婚恋应用 - Windows 快速部署脚本

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║        赴缘婚恋应用 - 一键部署工具                         ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM 检查 PowerShell
powershell -Command "exit" >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到 PowerShell,请先安装 PowerShell 7+
    pause
    exit /b 1
)

echo 正在启动部署脚本...
echo.

REM 运行 PowerShell 脚本
powershell -ExecutionPolicy Bypass -File "deploy-universal.ps1"

if %errorlevel% neq 0 (
    echo.
    echo 部署失败,请检查错误信息
    pause
    exit /b 1
)

echo.
echo 部署完成!请查看 DEPLOYMENT_REPORT.md 了解详细信息
pause
