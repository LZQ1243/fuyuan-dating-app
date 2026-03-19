@echo off
chcp 65001 >nul
echo ========================================
echo 赴缘婚恋项目 - Token 推送工具
echo ========================================
echo.

cd /d "%~dp0"

echo 提示：使用 GitHub Token 可以避免每次输入密码
echo.
echo Token 创建地址: https://github.com/settings/tokens
echo 需要勾选 "repo" 权限
echo.

set /p TOKEN="请输入您的 GitHub Token: "

if "%TOKEN%"=="" (
    echo ❌ Token 不能为空！
    pause
    exit /b 1
)

echo.
echo [1/5] 配置远程仓库（使用 Token）...
git remote set-url origin https://%TOKEN%@github.com/LZQ1243/fuyuan-dating-app.git
echo ✓ 已配置远程仓库
echo.

echo [2/5] 添加所有文件..."
git add .
echo ✓ 已添加所有更改
echo.

echo [3/5] 提交更改..."
git diff --cached --quiet
if %errorlevel% equ 0 (
    echo ℹ 没有新的更改需要提交
) else (
    git commit -m "feat: 项目更新 - 修复TypeScript错误和优化配置"
    echo ✓ 提交成功
)
echo.

echo [4/5] 推送到 GitHub..."
git push -u origin main
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

    echo [5/5] 恢复原始 URL（不包含 Token）..."
    git remote set-url origin https://github.com/LZQ1243/fuyuan-dating-app.git
    echo ✓ 已恢复安全配置
) else (
    echo.
    echo ========================================
    echo     ✗✗✗ 推送失败！✗✗✗
    echo ========================================
    echo.
    echo 请检查：
    echo 1. Token 是否正确
    echo 2. Token 是否有 "repo" 权限
    echo 3. Token 是否已过期
    echo.
)

echo.
pause
