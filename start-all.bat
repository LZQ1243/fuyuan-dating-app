@echo off
chcp 65001 >nul
title 赴缘婚恋应用 - 一键启动

echo.
echo ========================================
echo 赴缘婚恋应用 - 系统启动
echo ========================================
echo.

echo [1/3] 启动后端服务...
cd backend
start "后端服务" cmd /k "npm start"
timeout /t 3 >nul
cd ..

echo.
echo [2/3] 启动前端React应用...
cd frontend-react
start "前端React" cmd /k "npm run dev"
timeout /t 3 >nul
cd ..

echo.
echo [3/3] 系统启动完成!
echo.
echo ========================================
echo 访问地址:
echo ========================================
echo.
echo 前端React: http://localhost:3002
echo 后端API: http://localhost:3000/api
echo.
echo 按任意键关闭此窗口...
echo.
pause >nul
