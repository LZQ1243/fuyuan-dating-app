@echo off
echo ============================================================
echo       安装 MUI 依赖
echo ============================================================
cd /d "%~dp0frontend-react"
echo.
echo 正在安装 @mui/material @mui/icons-material...
npm install @mui/material @mui/icons-material
echo.
echo 安装完成！
pause
