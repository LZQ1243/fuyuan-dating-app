@echo off
chcp 65001 >nul
echo ========================================
echo 赴缘婚恋项目 - 快速推送
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] 检查 Git 状态...
git status --short
echo.

echo [2/4] 添加所有文件...
git add .
echo ✓ 已添加所有文件
echo.

echo [3/4] 提交更改...
REM 检查是否有更改
git diff --cached --quiet
if %errorlevel% equ 0 (
    echo 没有新的更改需要提交
) else (
    git commit -m "feat: 项目更新 - %date% %time%"
    echo ✓ 提交成功
)
echo.

echo [4/4] 推送到 GitHub...
git push origin main
if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✓✓✓ 推送成功！ ✓✓✓
    echo ========================================
    echo 仓库地址: https://github.com/LZQ1243/fuyuan-dating-app.git
) else (
    echo.
    echo ========================================
    echo ✗✗✗ 推送失败！ ✗✗✗
    echo ========================================
    echo.
    echo 解决方案：
    echo 1. 如果提示"设置上游分支"，运行：
    echo    git push -u origin main
    echo.
    echo 2. 如果需要身份验证，请输入 GitHub 用户名和密码/Token
    echo.
    echo 3. 如果有冲突，先运行：
    echo    git pull origin main
    echo    然后再推送
)

echo.
pause
