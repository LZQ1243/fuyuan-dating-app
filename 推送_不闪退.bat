@echo off
title 推送工具 - 按任意键退出
chcp 65001 >nul

cls
echo ========================================
echo        赴缘婚恋项目 - 推送工具
echo ========================================
echo.

cd /d "C:\Users\Administrator\Desktop\赴缘婚恋应用开发"

echo 正在执行 Git 操作...
echo.

git add .
echo.

git commit -m "update: 项目更新"
echo.

echo 正在推送到 GitHub...
git push -u origin main

echo.
echo ========================================
echo 操作完成！
echo ========================================

echo.
echo 按任意键关闭窗口...
pause >nul
