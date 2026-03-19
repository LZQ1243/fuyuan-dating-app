@echo off
REM 测试执行脚本 - Windows版本
REM 运行所有测试并生成测试报告

setlocal enabledelayedexpansion

set "BLUE=[34m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "RED=[31m"
set "NC=[0m"

echo =========================================
echo   赴缘婚恋应用 - 测试执行
echo =========================================
echo.

REM 创建测试报告目录
if not exist "test-reports" mkdir "test-reports"

REM 开始时间
for /f "tokens=1-4 delims=/ " %%a in ('date /t') do (
    set DATE=%%a-%%b-%%c
)
for /f "tokens=1-3 delims=:." %%a in ('time /t') do (
    set TIME=%%a:%%b:%%c
)
echo [INFO] 测试开始时间: %DATE% %TIME%
echo.

REM 测试统计
set /a TOTAL_TESTS=0
set /a PASSED_TESTS=0
set /a FAILED_TESTS=0

REM ========================================
REM 1. 后端测试
REM ========================================
echo [INFO] 开始后端测试...
echo.

cd /d "%~dp0..\backend"

REM 检查依赖
if not exist "node_modules" (
    echo [WARN] 后端依赖未安装,正在安装...
    call npm install --legacy-peer-deps
)

REM 创建Jest配置
if not exist "jest.config.js" (
    echo [WARN] 创建Jest配置...
    echo module.exports = { > jest.config.js
    echo   testEnvironment: 'node', >> jest.config.js
    echo   coverageDirectory: '../test-reports/backend-coverage', >> jest.config.js
    echo   collectCoverageFrom: [ >> jest.config.js
    echo     'src/**/*.js', >> jest.config.js
    echo     '!src/app.js', >> jest.config.js
    echo     '!**/node_modules/**', >> jest.config.js
    echo     '!**/tests/**' >> jest.config.js
    echo   ], >> jest.config.js
    echo   coverageThreshold: { >> jest.config.js
    echo     global: { >> jest.config.js
    echo       branches: 80, >> jest.config.js
    echo       functions: 80, >> jest.config.js
    echo       lines: 80, >> jest.config.js
    echo       statements: 80 >> jest.config.js
    echo     } >> jest.config.js
    echo   } >> jest.config.js
    echo } >> jest.config.js
)

REM 运行后端测试
echo [INFO] 运行后端单元测试...
call npm run test:ci > ..\test-reports\backend-test-output.txt 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] 后端测试通过
    set /a PASSED_TESTS=PASSED_TESTS+1
) else (
    echo [ERROR] 后端测试失败
    set /a FAILED_TESTS=FAILED_TESTS+1
)

cd /d "%~dp0.."
echo.

REM ========================================
REM 2. 前端测试
REM ========================================
echo [INFO] 开始前端测试...
echo.

cd /d "%~dp0..\frontend-react"

REM 检查依赖
if not exist "node_modules" (
    echo [WARN] 前端依赖未安装,正在安装...
    call npm install --legacy-peer-deps
)

REM 创建Vitest配置
if not exist "vitest.config.ts" (
    echo [WARN] 创建Vitest配置...
    (
        echo import { defineConfig } from 'vitest/config';
        echo import react from '@vitejs/plugin-react';
        echo.
        echo export default defineConfig^(^{
        echo   plugins: [react^(^)^],
        echo   test: {
        echo     environment: 'jsdom',
        echo     globals: true,
        echo     coverage: {
        echo       provider: 'v8',
        echo       reporter: ['text', 'json', 'html', 'lcov'],
        echo       exclude: [
        echo         'node_modules/',
        echo         'dist/',
        echo         '**/*.test.{ts,tsx}',
        echo         '**/*.spec.{ts,tsx}'
        echo       ]
        echo     }
        echo   }
        echo }^);
    ) > vitest.config.ts
)

REM 运行前端测试
echo [INFO] 运行前端单元测试...
call npm run test:run > ..\test-reports\frontend-test-output.txt 2>&1
if %ERRORLEVEL% EQU 0 (
    echo %GREEN%[SUCCESS]%NC% 前端测试通过
    set /a PASSED_TESTS=PASSED_TESTS+1
) else (
    echo %RED%[ERROR]%NC% 前端测试失败
    set /a FAILED_TESTS=FAILED_TESTS+1
)

cd /d "%~dp0.."
echo.

REM ========================================
REM 3. Lint检查
REM ========================================
echo [INFO] 开始代码质量检查...
echo.

REM 后端Lint
echo [INFO] 检查后端代码质量...
cd /d "%~dp0..\backend"
call npm run lint > ..\test-reports\backend-lint.txt 2>&1
if %ERRORLEVEL% EQU 0 (
    echo %GREEN%[SUCCESS]%NC% 后端代码质量检查通过
    set /a PASSED_TESTS=PASSED_TESTS+1
) else (
    echo %YELLOW%[WARN]%NC% 后端代码质量检查发现问题
    set /a FAILED_TESTS=FAILED_TESTS+1
)
cd /d "%~dp0.."

REM 前端Lint
echo [INFO] 检查前端代码质量...
cd /d "%~dp0..\frontend-react"
call npm run lint > ..\test-reports\frontend-lint.txt 2>&1
if %ERRORLEVEL% EQU 0 (
    echo %GREEN%[SUCCESS]%NC% 前端代码质量检查通过
    set /a PASSED_TESTS=PASSED_TESTS+1
) else (
    echo %YELLOW%[WARN]%NC% 前端代码质量检查发现问题
    set /a FAILED_TESTS=FAILED_TESTS+1
)
cd /d "%~dp0.."
echo.

REM ========================================
REM 4. 类型检查
REM ========================================
echo [INFO] 开始类型检查...
echo.

REM 前端类型检查
echo [INFO] 检查前端TypeScript类型...
cd /d "%~dp0..\frontend-react"
call npx tsc --noEmit > ..\test-reports\frontend-types.txt 2>&1
if %ERRORLEVEL% EQU 0 (
    echo %GREEN%[SUCCESS]%NC% 前端类型检查通过
    set /a PASSED_TESTS=PASSED_TESTS+1
) else (
    echo %YELLOW%[WARN]%NC% 前端类型检查发现问题
    set /a FAILED_TESTS=FAILED_TESTS+1
)
cd /d "%~dp0.."
echo.

REM ========================================
REM 5. 生成测试报告
REM ========================================
echo [INFO] 生成测试报告...
echo.

set /a TOTAL_TESTS=6

REM 计算通过率
set /a PASS_RATE=PASSED_TESTS*100/TOTAL_TESTS

REM 生成Markdown报告
(
    echo # 测试执行报告
    echo.
    echo **执行时间**: %DATE% %TIME%
    echo **执行环境**: Windows
    echo.
    echo ---
    echo.
    echo ## 测试结果
    echo.
    echo ^| 测试项 ^| 状态 ^| 详情 ^|
    echo ^|--------^|------^|------^|
    echo ^| 后端单元测试 ^| $([PASSED_TESTS] GEQ 1 ^&^& echo ✅ 通过 ^|^|^|^| echo ❌ 失败 ^)^| 覆盖率报告见 `backend-coverage/` ^|
    echo ^| 前端单元测试 ^| $([PASSED_TESTS] GEQ 2 ^&^& echo ✅ 通过 ^|^|^|^| echo ❌ 失败 ^)^| 覆盖率报告见 `frontend-coverage/` ^|
    echo ^| 后端代码质量 ^| $([PASSED_TESTS] GEQ 3 ^&^& echo ✅ 通过 ^|^|^|^| echo ❌ 失败 ^)^| 见 `backend-lint.txt` ^|
    echo ^| 前端代码质量 ^| $([PASSED_TESTS] GEQ 4 ^&^& echo ✅ 通过 ^|^|^|^| echo ❌ 失败 ^)^| 见 `frontend-lint.txt` ^|
    echo ^| 前端类型检查 ^| $([PASSED_TESTS] GEQ 5 ^&^& echo ✅ 通过 ^|^|^|^| echo ❌ 失败 ^)^| 见 `frontend-types.txt` ^|
    echo.
    echo ---
    echo.
    echo ## 统计
    echo.
    echo - **总测试数**: %TOTAL_TESTS%
    echo - **通过测试**: %PASSED_TESTS%
    echo - **失败测试**: %FAILED_TESTS%
    echo - **通过率**: %PASS_RATE%%%
    echo.
    echo ---
    echo.
    echo ## 详细日志
    echo.
    echo - 后端测试输出: `backend-test-output.txt`
    echo - 前端测试输出: `frontend-test-output.txt`
    echo - 后端覆盖率: `backend-coverage/index.html`
    echo - 前端覆盖率: `frontend-coverage/index.html`
    echo.
    echo ---
    echo.
    echo **生成时间**: %DATE% %TIME%
) > test-reports\test-summary.md

REM 显示报告
type test-reports\test-summary.md

echo.
echo =========================================
echo   测试执行完成
echo =========================================
echo.
echo 测试报告已生成: test-reports\test-summary.md
echo.
echo 通过率: %PASS_RATE%%%

REM 检查测试结果
if %PASSED_TESTS% EQU %TOTAL_TESTS% (
    echo.
    echo [SUCCESS] 所有测试通过!
    exit /b 0
) else (
    echo.
    echo [ERROR] 有 %FAILED_TESTS% 个测试失败
    echo 请查看 test-reports 目录中的详细日志
    exit /b 1
)
