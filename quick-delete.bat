@echo off
chcp 65001 >nul
echo ==========================================
echo   快速删除 frontend/ 目录
echo ==========================================
echo.

echo [路径] c:\Users\Administrator\Desktop\赴缘婚恋应用开发\frontend
echo.

echo [删除] frontend/ 目录...
rmdir /s /q "c:\Users\Administrator\Desktop\赴缘婚恋应用开发\frontend"

if %errorlevel% equ 0 (
    echo.
    echo ==========================================
    echo [成功] frontend/ 目录已删除
    echo ==========================================
    echo.
    echo ✅ 保留的项目：
    echo    - backend/
    echo    - frontend-react/
    echo    - admin/
    echo.
    echo [提示] 请在VSCode中重启TypeScript服务器
    echo        按 Ctrl+Shift+P，输入"TypeScript: Restart TS Server"
) else (
    echo.
    echo ==========================================
    echo [错误] 删除失败
    echo ==========================================
    echo.
    echo [原因] 目录可能被占用或权限不足
    echo [建议] 请手动在文件资源管理器中删除
    echo.
    echo [路径] c:\Users\Administrator\Desktop\赴缘婚恋应用开发\frontend
)

echo.
pause
