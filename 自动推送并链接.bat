@echo off
chcp 65001 >nul
echo ========================================
echo 赴缘婚恋项目 - 全自动推送工具
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] 检查 Git 配置...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git 未安装！请先安装 Git
    pause
    exit /b 1
)
echo ✓ Git 已安装
echo.

echo [2/5] 检查远程仓库链接...
git remote -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠ 未配置远程仓库，正在配置...
    git remote add origin https://github.com/LZQ1243/fuyuan-dating-app.git
    echo ✓ 已添加远程仓库
) else (
    echo ✓ 远程仓库已配置
    git remote -v
)
echo.

echo [3/5] 添加所有文件到暂存区...
git add .
echo ✓ 已添加所有更改
echo.

echo [4/5] 提交更改...
git diff --cached --quiet
if %errorlevel% equ 0 (
    echo ℹ 没有新的更改需要提交
) else (
    git commit -m "feat: 项目更新 - 修复TypeScript错误和优化配置

- 修复 App.tsx 中的类型错误
- 修复 vite.config.ts 的 manualChunks 配置
- 恢复 vite-env.d.ts 类型声明文件
- 恢复 fuyuan-taro 的 react.d.ts 类型声明文件
- 优化项目配置"
    echo ✓ 提交成功
)
echo.

echo [5/5] 推送到 GitHub...
echo 正在推送到 https://github.com/LZQ1243/fuyuan-dating-app.git...
echo.

REM 检查当前分支
for /f "tokens=*" %%a in ('git rev-parse --abbrev-ref HEAD') do set current_branch=%%a
echo 当前分支: %current_branch%

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
    echo 可能的原因和解决方案：
    echo.
    echo 1️⃣  需要身份验证
    echo    请使用 GitHub Personal Access Token 代替密码
    echo    创建地址: https://github.com/settings/tokens
    echo.
    echo 2️⃣  网络问题
    echo    请检查网络连接或尝试使用代理
    echo.
    echo 3️⃣  权限问题
    echo    请确认您有该仓库的写入权限
    echo.
    echo 4️⃣  手动推送命令：
    echo    git push -u origin %current_branch%
    echo.
)

echo.
echo 按任意键退出...
pause >nul
