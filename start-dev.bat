@echo off
chcp 65001 >nul
echo ==========================================
echo   赴缘婚恋平台 - 开发环境启动脚本
echo ==========================================
echo.

REM 检查Docker是否安装
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] Docker未安装
    echo 请先安装Docker: https://docs.docker.com/get-docker/
    pause
    exit /b 1
)

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

REM 启动数据库服务
echo [启动] 数据库服务...
cd docker
docker-compose up -d mongodb redis rabbitmq

REM 等待数据库启动
echo [等待] 数据库启动...
timeout /t 5 /nobreak >nul

cd ..

REM 检查后端依赖
echo [检查] 后端依赖...
cd backend
if not exist "node_modules" (
    echo [安装] 后端依赖...
    call npm install
)

REM 检查环境变量
if not exist ".env" (
    echo [创建] 环境变量文件...
    copy .env.example .env
    echo [提示] 请编辑 backend\.env 文件，配置相关参数
)

REM 启动后端
echo [启动] 后端服务...
start "后端服务" cmd /k "npm run dev"

cd ..

REM 检查前端依赖
echo [检查] 前端依赖...
cd frontend
if not exist "node_modules" (
    echo [安装] 前端依赖...
    call npm install
)

REM 启动前端H5
echo [启动] 前端H5...
start "前端H5" cmd /k "npm run dev:h5"

cd ..

REM 检查管理后台依赖
echo [检查] 管理后台依赖...
cd admin
if not exist "node_modules" (
    echo [安装] 管理后台依赖...
    call npm install
)

REM 启动管理后台
echo [启动] 管理后台...
start "管理后台" cmd /k "npm run dev"

cd ..

echo.
echo ==========================================
echo [完成] 所有服务启动完成！
echo ==========================================
echo.
echo 访问地址：
echo   - 后端API:  http://localhost:3000
echo   - 前端H5:   http://localhost:8080
echo   - 管理后台: http://localhost:3001
echo   - RabbitMQ: http://localhost:15672 (admin/admin123)
echo.
echo 关闭命令窗口即可停止对应服务
pause
