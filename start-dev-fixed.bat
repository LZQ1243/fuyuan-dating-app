@echo off
chcp 65001 >nul
echo ==========================================
echo   赴缘婚恋平台 - 开发环境启动脚本
echo ==========================================
echo.

REM 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] Node.js未安装
    echo 请先安装Node.js: https://nodejs.org/
    pause
    exit /b 1
)

echo [✓] 环境检查通过
echo.

REM 检查后端依赖
echo [检查] 后端依赖...
cd backend
if not exist "node_modules" (
    echo [安装] 后端依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo [错误] 后端依赖安装失败
        pause
        exit /b 1
    )
)

REM 检查环境变量
if not exist ".env" (
    echo [创建] 环境变量文件...
    copy .env.example .env
    echo [提示] 请编辑 backend\.env 文件，配置相关参数
    timeout /t 3 /nobreak >nul
)

REM 启动后端
echo [启动] 后端服务...
start "后端服务" cmd /k "npm run dev"

cd ..

REM 检查前端依赖
echo [检查] 前端依赖...
cd frontend-react
if not exist "node_modules" (
    echo [安装] 前端依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo [错误] 前端依赖安装失败
        pause
        exit /b 1
    )
)

REM 启动前端
echo [启动] 前端服务...
start "前端服务" cmd /k "npm run dev"

cd ..

echo.
echo ==========================================
echo [完成] 所有服务启动完成！
echo ==========================================
echo.
echo 访问地址：
echo   - 后端API:  http://localhost:3000
echo   - 前端应用: http://localhost:3002
echo.
echo 等待服务启动中...
timeout /t 5 /nobreak >nul

echo.
echo [提示] 关闭对应命令窗口即可停止服务
echo.
pause
