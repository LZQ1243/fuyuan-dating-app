@echo off
chcp 65001 >nul
title 推送到GitHub

echo.
echo ========================================
echo 推送项目到GitHub
echo ========================================
echo.

cd "c:\Users\Administrator\Desktop\赴缘婚恋应用开发"

echo [1/4] 检查Git仓库...
if not exist ".git" (
    echo 未初始化Git仓库,正在初始化...
    git init
    echo ✅ Git仓库已初始化
) else (
    echo ✅ Git仓库已存在
)
echo.

echo [2/4] 添加文件...
git add .
echo ✅ 文件已添加
echo.

echo [3/4] 提交更改...
set /p commit_msg=请输入提交信息:
git commit -m "%commit_msg%"
echo ✅ 已提交
echo.

echo [4/4] 推送到GitHub...
echo.
echo 检查远程仓库...
git remote -v
echo.

set /p remote_url=请输入GitHub仓库URL(或回车跳过):
if not "%remote_url%"=="" (
    git remote add origin %remote_url%
    echo ✅ 远程仓库已添加
)

echo.
echo 正在推送...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✅ 推送成功!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo ❌ 推送失败!
    echo ========================================
    echo 请检查:
    echo 1. 仓库URL是否正确
    echo 2. 认证信息是否正确
    echo 3. 网络连接是否正常
)

echo.
pause
