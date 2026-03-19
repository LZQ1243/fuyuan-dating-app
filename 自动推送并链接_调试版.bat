@echo off
chcp 65001 >nul
title 赴缘婚恋项目 - 全自动推送工具（调试版）
echo ========================================
echo 赴缘婚恋项目 - 全自动推送工具
echo ========================================
echo.

echo 当前目录: %cd%
echo.

REM 检查目录是否存在
if not exist ".git" (
    echo ❌ 错误：当前目录不是 Git 仓库
    echo.
    echo 请确认您在正确的目录下运行此脚本
    echo 正确的目录应该是：
    echo   C:\Users\Administrator\Desktop\赴缘婚恋应用开发
    echo.
    pause
    exit /b 1
)

echo [1/5] 检查 Git 配置...
git --version
if %errorlevel% neq 0 (
    echo ❌ 错误：Git 未安装或不在 PATH 中
    echo.
    echo 请先安装 Git：https://git-scm.com/downloads
    pause
    exit /b 1
)
echo ✓ Git 已安装
echo.

echo [2/5] 检查远程仓库链接...
git remote -v
echo.

echo [3/5] 添加所有文件到暂存区...
git add .
if %errorlevel% neq 0 (
    echo ❌ 错误：添加文件失败
    pause
    exit /b 1
)
echo ✓ 已添加所有更改
echo.

echo [4/5] 提交更改...
git diff --cached --quiet
if %errorlevel% equ 0 (
    echo ℹ 没有新的更改需要提交
) else (
    git commit -m "feat: 项目更新 - 修复TypeScript错误和优化配置"
    if %errorlevel% neq 0 (
        echo ❌ 错误：提交失败
        pause
        exit /b 1
    )
    echo ✓ 提交成功
)
echo.

echo [5/5] 推送到 GitHub..."
echo 正在推送到 https://github.com/LZQ1243/fuyuan-dating-app.git...
echo.

REM 检查当前分支
for /f "tokens=*" %%a in ('git rev-parse --abbrev-ref HEAD') do set current_branch=%%a
echo 当前分支: %current_branch%
echo.

REM 尝试推送
git push -u origin %current_branch%
if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo     ✓✓✓ 推送成功！✓✓✓
    echo ========================================
    echo.
    echo 🎉 您的项目已成功推送到 GitHub！
    echo.
    echo 📎 仓库地址:
    echo    https://github.com/LZQ1243/fuyuan-dating-app.git
    echo.
    echo 🌐 在浏览器中查看:
    echo    https://github.com/LZQ1243/fuyuan-dating-app
    echo.
) else (
    echo.
    echo ========================================
    echo     ✗✗✗ 推送失败！✗✗✗
    echo ========================================
    echo.
    echo 错误代码: %errorlevel%
    echo.
    echo 可能的原因：
    echo 1. 网络连接问题
    echo 2. 需要身份验证（用户名/密码或Token）
    echo 3. GitHub 仓库权限问题
    echo.
    echo 手动推送命令：
    echo    git push -u origin %current_branch%
    echo.
)

echo.
echo ========================================
echo 按任意键退出...
pause >nul
