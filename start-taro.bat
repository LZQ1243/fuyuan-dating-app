@echo off
chcp 65001 >nul
echo ========================================
echo 赴缘婚恋 - Taro版本
echo 微信小程序 + APP 开发完成
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] 检查项目结构...
if exist "fuyuan-taro\src" (
    echo ✓ 项目目录存在
) else (
    echo ✗ 项目目录不存在
    pause
    exit /b 1
)

echo.
echo [2/5] 安装依赖...
cd fuyuan-taro
if not exist "node_modules" (
    echo 正在安装依赖...
    call npm install
    if errorlevel 1 (
        echo ✗ 依赖安装失败
        pause
        exit /b 1
    )
    echo ✓ 依赖安装完成
) else (
    echo ✓ 依赖已存在
)

echo.
echo [3/5] 编译项目...
echo.
echo 选择编译平台:
echo [1] 微信小程序
echo [2] APP (iOS/Android)
echo [3] H5
echo.
set /p platform=
set /p choice=
set /p choices=123

choice /c %choices% /m "请选择编译平台" /n

if errorlevel 1 (
    set platform=weapp
) else if errorlevel 2 (
    set platform=rn
) else if errorlevel 3 (
    set platform=h5
) else (
    echo 无效选择,退出
    pause
    exit /b 1
)

echo.
if "%platform%"=="weapp" (
    echo 正在编译微信小程序...
    call npm run build:weapp
) else if "%platform%"=="rn" (
    echo 正在编译APP...
    call npm run build:rn
) else if "%platform%"=="h5" (
    echo 正在编译H5...
    call npm run build:h5
)

if errorlevel 1 (
    echo.
    echo ✗ 编译失败
    pause
    exit /b 1
) else (
    echo.
    echo ✓ 编译成功!
)

echo.
echo [4/5] 编译结果...
if exist "dist" (
    echo ✓ dist目录已生成
) else (
    echo ✗ dist目录不存在
)

echo.
echo [5/5] 项目说明...
echo.
echo ========================================
echo 项目信息:
echo   - 项目名称: 赴缘婚恋
echo   - 技术框架: Taro 3.6 + React
echo   - 编译平台: %platform%
echo   - 页面数量: 11个
echo   - API接口: 28个
echo   - 总文件数: 约50个
echo   - 总代码行: 约8000+行
echo ========================================
echo.
echo 编译完成后:
echo.
if "%platform%"=="weapp" (
    echo 1. 打开微信开发者工具
    echo 2. 导入项目目录: %cd%/fuyuan-taro/dist
    echo 3. 点击编译查看预览
    echo 4. 点击预览查看真机效果
) else if "%platform%"=="rn" (
    echo 1. 使用React Native调试
    echo 2. 运行 npm run dev:rn
) else if "%platform%"=="h5" (
    echo 1. 直接在浏览器中打开
    echo 2. dist目录即为静态文件
)

echo.
echo ========================================
echo.
echo 开发命令:
echo   - 开发微信小程序: npm run dev:weapp
echo   - 开发APP: npm run dev:rn
echo   - 开发H5: npm run dev:h5
echo.
echo 编译命令:
echo   - 编译微信小程序: npm run build:weapp
echo   - 编译APP: npm run build:rn
echo   - 编译H5: npm run build:h5
echo ========================================
echo.
pause
