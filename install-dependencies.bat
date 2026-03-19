@echo off
chcp 65001 >nul
echo ========================================
echo 自动安装缺失的依赖包
echo ========================================
echo.

cd frontend-react

echo [1/2] 检查并安装缺失的 Vite 插件...
call npm install --save-dev rollup-plugin-visualizer vite-plugin-compression @vitejs/plugin-legacy
if %errorlevel% neq 0 (
    echo ❌ 安装失败！
    pause
    exit /b 1
)

echo ✅ Vite 插件安装成功！
echo.

echo [2/2] 验证 TypeScript 编译...
call npx tsc --noEmit
if %errorlevel% neq 0 (
    echo ⚠️ TypeScript 仍有错误，但依赖已安装
    echo 请重启 VS Code 并重新加载 TypeScript 服务器
) else (
    echo ✅ TypeScript 编译通过，所有错误已解决！
)

echo.
echo ========================================
echo 完成！请按以下步骤操作：
echo 1. 重启 VS Code
echo 2. 打开命令面板 (Ctrl+Shift+P)
echo 3. 输入 "TypeScript: Restart TS Server"
echo ========================================
pause
