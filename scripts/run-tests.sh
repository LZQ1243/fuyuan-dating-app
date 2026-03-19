#!/bin/bash

# 测试执行脚本
# 运行所有测试并生成测试报告

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 开始时间
START_TIME=$(date +%s)

echo "========================================="
echo "  赴缘婚恋应用 - 测试执行"
echo "========================================="
echo ""

# 创建测试报告目录
mkdir -p test-reports

# 测试结果汇总
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
FAILED_TESTS_FILE="test-reports/failed-tests.txt"
> "$FAILED_TESTS_FILE"

# ========================================
# 1. 后端测试
# ========================================
log_info "开始后端测试..."
echo ""

cd backend

# 检查是否安装了测试依赖
if [ ! -d "node_modules" ]; then
    log_warn "后端依赖未安装,正在安装..."
    npm install --legacy-peer-deps
fi

# 检查Jest配置
if [ ! -f "jest.config.js" ]; then
    log_warn "Jest配置文件不存在,创建配置..."
    cat > jest.config.js << EOF
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: '../test-reports/backend-coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/app.js',
    '!**/node_modules/**',
    '!**/tests/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
EOF
fi

# 运行后端测试
log_info "运行后端单元测试..."
if npm run test:ci > ../test-reports/backend-test-output.txt 2>&1; then
    log_success "后端测试通过"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    log_error "后端测试失败"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    echo "backend" >> "$FAILED_TESTS_FILE"
fi

# 检查测试覆盖率
if [ -f "../test-reports/backend-coverage/coverage-summary.json" ]; then
    log_info "后端测试覆盖率:"
    cat ../test-reports/backend-coverage/coverage-summary.json | grep -o '"total":[^{,}]*' | head -1
fi

cd ..

echo ""

# ========================================
# 2. 前端测试
# ========================================
log_info "开始前端测试..."
echo ""

cd frontend-react

# 检查是否安装了测试依赖
if [ ! -d "node_modules" ]; then
    log_warn "前端依赖未安装,正在安装..."
    npm install --legacy-peer-deps
fi

# 检查Vitest配置
if [ ! -f "vitest.config.ts" ]; then
    log_warn "Vitest配置文件不存在,创建配置..."
    cat > vitest.config.ts << EOF
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}'
      ]
    }
  }
});
EOF
fi

# 运行前端测试
log_info "运行前端单元测试..."
if npm run test:run > ../test-reports/frontend-test-output.txt 2>&1; then
    log_success "前端测试通过"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    log_error "前端测试失败"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    echo "frontend" >> "$FAILED_TESTS_FILE"
fi

# 检查测试覆盖率
if [ -f "../test-reports/frontend-coverage/coverage-summary.json" ]; then
    log_info "前端测试覆盖率:"
    cat ../test-reports/frontend-coverage/coverage-summary.json | grep -o '"total":[^{,}]*' | head -1
fi

cd ..

echo ""

# ========================================
# 3. Lint检查
# ========================================
log_info "开始代码质量检查..."
echo ""

# 后端Lint
log_info "检查后端代码质量..."
cd backend
if npm run lint > ../test-reports/backend-lint.txt 2>&1; then
    log_success "后端代码质量检查通过"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    log_warn "后端代码质量检查发现问题"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
cd ..

# 前端Lint
log_info "检查前端代码质量..."
cd frontend-react
if npm run lint > ../test-reports/frontend-lint.txt 2>&1; then
    log_success "前端代码质量检查通过"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    log_warn "前端代码质量检查发现问题"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
cd ..

echo ""

# ========================================
# 4. 类型检查
# ========================================
log_info "开始类型检查..."
echo ""

# 前端类型检查
log_info "检查前端TypeScript类型..."
cd frontend-react
if npx tsc --noEmit > ../test-reports/frontend-types.txt 2>&1; then
    log_success "前端类型检查通过"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    log_warn "前端类型检查发现问题"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
cd ..

echo ""

# ========================================
# 5. 生成测试报告
# ========================================
log_info "生成测试报告..."
echo ""

# 计算总测试数
TOTAL_TESTS=$((TOTAL_TESTS + 6))

# 结束时间
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# 生成测试报告
cat > test-reports/test-summary.md << EOF
# 测试执行报告

**执行时间**: $(date '+%Y-%m-%d %H:%M:%S')
**执行耗时**: $((DURATION / 60))分钟 $((DURATION % 60))秒

---

## 测试结果

| 测试项 | 状态 | 详情 |
|--------|------|------|
| 后端单元测试 | $([ $PASSED_TESTS -ge 1 ] && echo '✅ 通过' || echo '❌ 失败') | 覆盖率报告见 \`backend-coverage/\` |
| 前端单元测试 | $([ $PASSED_TESTS -ge 2 ] && echo '✅ 通过' || echo '❌ 失败') | 覆盖率报告见 \`frontend-coverage/\` |
| 后端代码质量 | $([ $PASSED_TESTS -ge 3 ] && echo '✅ 通过' || echo '❌ 失败') | 见 \`backend-lint.txt\` |
| 前端代码质量 | $([ $PASSED_TESTS -ge 4 ] && echo '✅ 通过' || echo '❌ 失败') | 见 \`frontend-lint.txt\` |
| 前端类型检查 | $([ $PASSED_TESTS -ge 5 ] && echo '✅ 通过' || echo '❌ 失败') | 见 \`frontend-types.txt\` |

---

## 统计

- **总测试数**: $TOTAL_TESTS
- **通过测试**: $PASSED_TESTS
- **失败测试**: $FAILED_TESTS
- **通过率**: $(( PASSED_TESTS * 100 / TOTAL_TESTS ))%

---

## 详细日志

- 后端测试输出: \`backend-test-output.txt\`
- 前端测试输出: \`frontend-test-output.txt\`
- 后端覆盖率: \`backend-coverage/index.html\`
- 前端覆盖率: \`frontend-coverage/index.html\`

---

**生成时间**: $(date '+%Y-%m-%d %H:%M:%S')
EOF

# 显示测试报告
cat test-reports/test-summary.md

echo ""
echo "========================================="
echo "  测试执行完成"
echo "========================================="
echo ""
echo "测试报告已生成: test-reports/test-summary.md"
echo ""
echo "通过率: $(( PASSED_TESTS * 100 / TOTAL_TESTS ))%"

# 检查是否所有测试都通过
if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    log_success "所有测试通过! 🎉"
    exit 0
else
    log_error "有 $FAILED_TESTS 个测试失败"
    log_error "失败的测试项目:"
    cat "$FAILED_TESTS_FILE"
    exit 1
fi
