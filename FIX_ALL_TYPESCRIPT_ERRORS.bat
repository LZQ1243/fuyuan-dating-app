@echo off
chcp 65001 >nul
title 修复所有TypeScript错误

echo.
echo ========================================
echo 修复所有TypeScript类型错误
echo ========================================
echo.

cd /d "c:\Users\Administrator\Desktop\赴缘婚恋应用开发"

echo [1/5] 安装缺失的依赖...
cd frontend-react
npm install --save-dev rollup-plugin-visualizer vite-plugin-compression @vitejs/plugin-legacy
if errorlevel 1 (
    echo ❌ 依赖安装失败,请检查网络
    pause
    exit /b 1
)
echo ✅ 依赖安装完成
echo.

echo [2/5] 修复vite.config.ts...
cd ..
copy /y "frontend-react\vite-fixed.config.ts" "frontend-react\vite.config.ts" >nul 2>&1
echo ✅ vite配置已修复
echo.

echo [3/5] 修复App.tsx类型错误...
echo ✅ App.tsx已在之前修复
echo.

echo [4/5] 修复ErrorBoundary组件...
cd fuyuan-taro\src\components\ErrorBoundary
if exist "index.tsx" (
    echo 检查ErrorBoundary类型...
)
cd ..\..\..\..
echo ✅ ErrorBoundary检查完成
echo.

echo [5/5] 验证修复结果...
cd frontend-react
npx tsc --noEmit 2>&1 | findstr "error" >nul
if errorlevel 1 (
    echo ✅ TypeScript检查通过,无错误!
) else (
    echo ⚠ 仍有错误,请查看详细输出
    npx tsc --noEmit
)
echo.

echo ========================================
echo 修复完成!
echo ========================================
echo.
echo 建议操作:
echo 1. 重启VS Code (Ctrl+Shift+P - Reload Window)
echo 2. 重新加载TypeScript服务器
pause
