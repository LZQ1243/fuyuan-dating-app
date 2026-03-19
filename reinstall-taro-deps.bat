@echo off
echo ============================================================
echo       重新安装 Taro 项目依赖
echo ============================================================
echo.
echo 当前目录: %~dp0
cd /d "%~dp0fuyuan-taro"
echo.
echo 正在删除 node_modules...
if exist node_modules (
    rmdir /s /q node_modules
    echo 已删除 node_modules
) else (
    echo node_modules 不存在，跳过删除
)
echo.
if exist package-lock.json (
    del package-lock.json
    echo 已删除 package-lock.json
) else (
    echo package-lock.json 不存在，跳过删除
)
echo.
echo ============================================================
echo 正在安装依赖...
echo ============================================================
echo.
call npm install --legacy-peer-deps
echo.
echo ============================================================
echo 安装完成！
echo ============================================================
echo.
echo 请按任意键退出...
pause > nul
