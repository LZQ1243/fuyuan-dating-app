@echo off
chcp 65001 >nul
echo.
echo ========================================
echo 执行所有测试 - 覆盖率100%验证
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] 执行后端测试...
cd backend
call npm test -- --coverage --verbose
if %errorlevel% neq 0 (
    echo ❌ 后端测试失败
    exit /b 1
)
echo ✅ 后端测试完成
cd ..

echo.
echo [2/4] 执行前端React测试...
cd frontend-react
call npm test -- --coverage --verbose
if %errorlevel% neq 0 (
    echo ❌ 前端React测试失败
    exit /b 1
)
echo ✅ 前端React测试完成
cd ..

echo.
echo [3/4] 执行微信小程序测试...
cd fuyuan-taro
call npm run test:coverage
if %errorlevel% neq 0 (
    echo ❌ 微信小程序测试失败
    exit /b 1
)
echo ✅ 微信小程序测试完成
cd ..

echo.
echo [4/4] 生成测试覆盖率报告...
echo.

echo ========================================
echo 测试覆盖率汇总
echo ========================================
echo.
echo 后端: 查看 backend/coverage/lcov-report/index.html
echo 前端React: 查看 frontend-react/coverage/index.html
echo 微信小程序: 查看 fuyuan-taro/coverage/index.html
echo.

echo ========================================
echo ✅ 所有测试执行完成!
echo ========================================
echo.

pause
