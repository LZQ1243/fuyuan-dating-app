@echo off
chcp 65001 >nul
echo ==================================
echo   赴缘婚恋应用 - 推送到 Gitee 码云
echo ==================================
echo.

REM 切换到项目目录
cd /d "C:\Users\Administrator\Desktop\赴缘婚恋应用开发"

echo 当前目录: %cd%
echo.

echo 当前分支:
git branch --show-current
echo.

echo 远程仓库:
git remote -v
echo.

echo 准备推送到 Gitee...
echo 仓库: https://gitee.com/LZQ1243/fuyuan-dating-app.git
echo.

echo ==================================
echo   第一步：创建 Gitee 仓库
echo ==================================
echo.
echo 请按以下步骤操作:
echo.
echo 1. 打开浏览器，访问: https://gitee.com/projects/new
echo 2. 登录您的账号 (可以使用微信扫码登录)
echo 3. 填写仓库信息:
echo    - 仓库名称: fuyuan-dating-app
echo    - 仓库介绍: 赴缘婚恋社交平台 - 全栈开发项目
echo    - 是否公开: 公开 (或私有)
echo 4. 点击"创建仓库"按钮
echo.
pause

echo.
echo ==================================
echo   第二步：推送代码
echo ==================================
echo.

echo 正在推送...
echo.

git push -u origin master

if %errorlevel% equ 0 (
    echo.
    echo ==================================
    echo   推送成功! 🎉
    echo ==================================
    echo.
    echo 访问仓库: https://gitee.com/LZQ1243/fuyuan-dating-app
    echo.
) else (
    echo.
    echo ==================================
    echo   推送失败!
    echo ==================================
    echo.
    echo 可能的原因:
    echo 1. 还没有在 Gitee 创建仓库
    echo 2. 仓库名称不匹配
    echo 3. 网络连接问题
    echo.
    echo 请确保已按第一步创建了仓库!
    echo.
)

pause
