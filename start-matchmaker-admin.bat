@echo off
chcp 65001 > nul
echo ========================================
echo   赴缘红娘管理后台启动脚本
echo ========================================
echo.

cd matchmaker-admin

if not exist "node_modules" (
    echo [信息] 首次启动，正在安装依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo [错误] 依赖安装失败，请检查网络连接或手动运行 npm install
        pause
        exit /b 1
    )
    echo [成功] 依赖安装完成
    echo.
)

echo [信息] 正在启动红娘管理后台开发服务器...
echo [提示] 服务器启动后，请访问: http://localhost:3002
echo [提示] 按 Ctrl+C 可停止服务器
echo.

call npm run dev

if %errorlevel% neq 0 (
    echo.
    echo [错误] 启动失败，请检查错误信息
    pause
    exit /b 1
)
