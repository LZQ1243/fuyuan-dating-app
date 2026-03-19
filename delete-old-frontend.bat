@echo off
chcp 65001 >nul
echo ==========================================
echo   删除旧版前端项目 (uni-app)
echo ==========================================
echo.

echo [警告] 即将删除 frontend/ 目录
echo          此操作不可逆！
echo.

timeout /t 3 /nobreak >nul

echo [删除] frontend/ 目录...
rmdir /s /q "c:\Users\Administrator\Desktop\赴缘婚恋应用开发\frontend"

if %errorlevel% equ 0 (
    echo [成功] frontend/ 目录已删除
) else (
    echo [错误] 删除失败，请手动删除
    echo.
    echo 手动删除命令：
    echo rmdir /s /q frontend
)

echo.
echo ==========================================
echo [完成] 清理操作结束
echo ==========================================
echo.
echo ✅ 现在只保留：
echo    - backend/          (后端服务)
echo    - frontend-react/   (React前端)
echo    - admin/            (管理后台)
echo.

pause
