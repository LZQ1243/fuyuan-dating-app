@echo off
chcp 65001 >nul
title Git快速配置脚本

echo.
echo ========================================
echo Git快速配置脚本
echo ========================================
echo.

REM 检查Git是否已安装
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] Git未安装!
    echo.
    echo 请先安装Git:
    echo 1. 访问: https://git-scm.com/download/win
    echo 2. 下载并安装Git for Windows
    echo 3. 重新运行此脚本
    echo.
    pause
    exit /b 1
)

echo [1/3] Git已安装
git --version
echo.

REM 配置用户信息
echo [2/3] 配置Git用户信息
echo.
set /p username=请输入您的GitHub用户名:
echo.
set /p email=请输入您的GitHub邮箱:

git config --global user.name "%username%"
git config --global user.email "%email%"

echo.
echo ✅ 用户名: %username%
echo ✅ 邮箱: %email%
echo.

REM 生成SSH密钥(可选)
echo [3/3] 生成SSH密钥(推荐用于GitHub)
echo.
set /p generatessh=是否生成SSH密钥?(Y/N):
if /i "%generatessh%"=="Y" (
    echo.
    echo 正在生成SSH密钥...
    ssh-keygen -t ed25519 -C "%email%" -N "" -f %USERPROFILE%\.ssh\id_ed25519
    
    echo.
    echo ✅ SSH密钥已生成!
    echo.
    echo 公钥内容:
    type %USERPROFILE%\.ssh\id_ed25519.pub
    echo.
    echo 请将上述公钥添加到GitHub:
    echo 1. 访问: https://github.com/settings/keys
    echo 2. 点击 "New SSH key"
    echo 3. 粘贴公钥内容
    echo 4. 保存
) else (
    echo 跳过SSH密钥生成
)

echo.
echo ========================================
echo Git配置完成!
echo ========================================
echo.
echo 配置信息:
git config --global --list
echo.

echo 下一步:
echo 1. 在VSCode中使用Git(推荐)
echo 2. 或使用命令行:
echo    git add .
echo    git commit -m "提交信息"
echo    git push
echo.

pause
