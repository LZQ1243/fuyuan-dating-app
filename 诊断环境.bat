@echo off
chcp 65001 >nul
title 环境诊断工具
echo ========================================
echo      赴缘婚恋项目 - 环境诊断工具
echo ========================================
echo.

echo [1] 检查当前目录...
echo 当前目录: %cd%
if exist ".git" (
    echo ✓ 是 Git 仓库
) else (
    echo ✗ 不是 Git 仓库
)
echo.

echo [2] 检查 Git 安装...
git --version
if %errorlevel% equ 0 (
    echo ✓ Git 已安装
) else (
    echo ✗ Git 未安装或不在 PATH 中
)
echo.

echo [3] 检查 Git 仓库状态...
git status
echo.

echo [4] 检查远程仓库配置...
git remote -v
if %errorlevel% equ 0 (
    echo ✓ 远程仓库已配置
) else (
    echo ✗ 未配置远程仓库
)
echo.

echo [5] 检查网络连接...
ping github.com -n 1
echo.

echo [6] 检查当前分支...
for /f "tokens=*" %%a in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set current_branch=%%a
if defined current_branch (
    echo 当前分支: %current_branch%
) else (
    echo ✗ 无法获取分支信息
)
echo.

echo ========================================
echo 诊断完成！
echo ========================================
echo.
echo 如果看到错误，请根据提示进行修复
echo.

pause
