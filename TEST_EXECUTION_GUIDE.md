# 赴缘婚恋应用 - 测试执行指南

## 📋 目录
- [测试环境准备](#测试环境准备)
- [快速执行测试](#快速执行测试)
- [测试执行详解](#测试执行详解)
- [测试覆盖率说明](#测试覆盖率说明)
- [测试报告解读](#测试报告解读)
- [常见问题](#常见问题)

---

## 测试环境准备

### 1. 安装依赖

#### 后端依赖
```bash
cd backend
npm install --legacy-peer-deps
```

#### 前端依赖
```bash
cd frontend-react
npm install --legacy-peer-deps
```

#### 小程序依赖
```bash
cd fuyuan-taro
npm install --legacy-peer-deps
```

### 2. 环境配置

#### 复制环境变量模板
```bash
# 后端
cd backend
cp .env.example .env

# 前端
cd ../frontend-react
cp .env.example .env
```

#### 修改配置
```bash
# 后端环境变量
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/fuyuan_test
REDIS_HOST=localhost
REDIS_PORT=6379

# 前端环境变量
VITE_API_URL=http://localhost:3000
```

### 3. 启动测试数据库

#### MongoDB测试数据库
```bash
# 使用Docker启动MongoDB
docker run -d -p 27017:27017 --name test-mongodb mongo:6.0

# 或使用本地MongoDB
mongod --dbpath /data/db --port 27017
```

#### Redis测试数据库
```bash
# 使用Docker启动Redis
docker run -d -p 6379:6379 --name test-redis redis:7-alpine

# 或使用本地Redis
redis-server --port 6379
```

---

## 快速执行测试

### Windows用户
```batch
# 执行测试脚本
cd scripts
run-tests.bat

# 查看测试报告
cd ..\test-reports
type test-summary.md
```

### Linux/Mac用户
```bash
# 添加执行权限
chmod +x scripts/run-tests.sh

# 执行测试脚本
./scripts/run-tests.sh

# 查看测试报告
cat test-reports/test-summary.md
```

### 单独运行测试

#### 运行后端测试
```bash
cd backend
npm test
npm run test:coverage  # 带覆盖率
npm run test:watch      # 监听模式
npm run test:ci        # CI模式
```

#### 运行前端测试
```bash
cd frontend-react
npm test
npm run test:coverage  # 带覆盖率
npm run test:ui        # UI模式
npm run test:run       # 运行一次
```

---

## 测试执行详解

### 测试流程

```
开始
  ↓
后端依赖检查
  ↓
后端单元测试
  ↓
后端覆盖率统计
  ↓
前端依赖检查
  ↓
前端单元测试
  ↓
前端覆盖率统计
  ↓
后端Lint检查
  ↓
前端Lint检查
  ↓
前端类型检查
  ↓
生成测试报告
  ↓
结束
```

### 测试项目

#### 1. 后端单元测试
- **测试文件**: 31个
- **测试用例**: 200+个
- **覆盖率目标**: 80%+
- **执行时间**: 约2-3分钟

**测试覆盖**:
- 用户认证与授权
- 用户管理
- 匹配算法
- 聊天功能
- 动态发布
- 文件上传
- 配置管理
- 敏感词过滤
- 管理功能

#### 2. 前端单元测试
- **测试文件**: 9个
- **测试用例**: 180+个
- **覆盖率目标**: 80%+
- **执行时间**: 约1-2分钟

**测试覆盖**:
- 组件渲染
- 用户交互
- 状态管理
- 路由导航
- API调用
- 错误处理
- 表单验证

#### 3. 代码质量检查
- **工具**: ESLint
- **检查内容**:
  - 代码规范
  - 潜在错误
  - 最佳实践
  - 代码复杂度

#### 4. 类型检查
- **工具**: TypeScript编译器
- **检查内容**:
  - 类型错误
  - 类型推断
  - 类型兼容性

---

## 测试覆盖率说明

### 后端覆盖率目标

| 指标 | 目标 | 说明 |
|------|------|------|
| Statements | 80% | 语句覆盖率 |
| Branches | 80% | 分支覆盖率 |
| Functions | 80% | 函数覆盖率 |
| Lines | 80% | 行覆盖率 |

### 前端覆盖率目标

| 指标 | 目标 | 说明 |
|------|------|------|
| Statements | 80% | 语句覆盖率 |
| Branches | 80% | 分支覆盖率 |
| Functions | 80% | 函数覆盖率 |
| Lines | 80% | 行覆盖率 |

### 查看覆盖率报告

#### 后端覆盖率报告
```bash
# HTML报告
open test-reports/backend-coverage/index.html

# 命令行报告
cat test-reports/backend-coverage/coverage-summary.txt

# JSON报告
cat test-reports/backend-coverage/coverage-summary.json
```

#### 前端覆盖率报告
```bash
# HTML报告
open test-reports/frontend-coverage/index.html

# 命令行报告
cat test-reports/frontend-coverage/coverage-summary.txt

# JSON报告
cat test-reports/frontend-coverage/coverage-summary.json
```

---

## 测试报告解读

### 测试报告结构

```
test-reports/
├── test-summary.md              # 测试总览
├── backend-test-output.txt       # 后端测试输出
├── backend-lint.txt            # 后端Lint结果
├── backend-coverage/           # 后端覆盖率
│   ├── index.html            # HTML报告
│   ├── coverage-summary.json  # JSON报告
│   ├── lcov.info            # LCOV格式
│   └── ...
├── frontend-test-output.txt     # 前端测试输出
├── frontend-lint.txt          # 前端Lint结果
├── frontend-types.txt         # 前端类型检查结果
└── frontend-coverage/          # 前端覆盖率
    ├── index.html            # HTML报告
    ├── coverage-summary.json  # JSON报告
    └── ...
```

### 报告指标说明

#### 测试状态
- ✅ **通过**: 测试成功执行
- ❌ **失败**: 测试执行失败
- ⚠️ **警告**: 测试通过但有警告

#### 覆盖率指标
- **Statements**: 语句覆盖率
- **Branches**: 分支覆盖率
- **Functions**: 函数覆盖率
- **Lines**: 行覆盖率

#### 质量指标
- **Errors**: 错误数量
- **Warnings**: 警告数量
- **Complexity**: 代码复杂度

---

## 常见问题

### Q1: 测试依赖安装失败

**问题**:
```
npm ERR! peer dep missing
```

**解决方案**:
```bash
# 使用--legacy-peer-deps标志
npm install --legacy-peer-deps
```

### Q2: MongoDB连接失败

**问题**:
```
MongoNetworkError: connect ECONNREFUSED
```

**解决方案**:
```bash
# 检查MongoDB是否运行
docker ps | grep mongo

# 或启动MongoDB
docker start test-mongodb
```

### Q3: Redis连接失败

**问题**:
```
Error: Redis connection to localhost:6379 failed
```

**解决方案**:
```bash
# 检查Redis是否运行
docker ps | grep redis

# 或启动Redis
docker start test-redis
```

### Q4: 测试超时

**问题**:
```
Test timeout exceeded
```

**解决方案**:
```javascript
// 在测试文件中增加超时时间
it('should do something', async () => {
  // 测试代码
}, 30000); // 30秒超时
```

### Q5: 覆盖率低

**问题**:
```
Coverage threshold not met
```

**解决方案**:
```javascript
// 1. 添加更多测试用例
// 2. 测试边界情况
// 3. 测试错误路径
// 4. 调整覆盖率阈值
```

### Q6: Lint错误

**问题**:
```
ESLint errors
```

**解决方案**:
```bash
# 自动修复可修复的问题
npm run lint:fix

# 或手动修复报告中的问题
```

---

## 测试最佳实践

### 1. 编写好的测试

```javascript
// 好的测试示例
describe('UserService', () => {
  it('should create a user successfully', async () => {
    // Arrange: 准备测试数据
    const userData = {
      phone: '13800138000',
      password: 'password123'
    };

    // Act: 执行被测试的操作
    const user = await UserService.createUser(userData);

    // Assert: 验证结果
    expect(user).toBeDefined();
    expect(user.phone).toBe(userData.phone);
  });
});
```

### 2. 测试边界情况

```javascript
// 测试空输入
it('should handle empty input', async () => {
  const result = await UserService.processData('');
  expect(result).toBeNull();
});

// 测试超长输入
it('should handle long input', async () => {
  const longString = 'a'.repeat(10000);
  const result = await UserService.processData(longString);
  expect(result).toBeDefined();
});

// 测试特殊字符
it('should handle special characters', async () => {
  const specialChars = '!@#$%^&*()';
  const result = await UserService.processData(specialChars);
  expect(result).toBeDefined();
});
```

### 3. 使用Mock

```javascript
// Mock外部依赖
jest.mock('../services/redis', () => ({
  get: jest.fn(),
  set: jest.fn()
}));

// 在测试中使用
it('should use cache', async () => {
  const mockData = { key: 'value' };
  redis.get.mockResolvedValue(mockData);

  const result = await UserService.getData('key');
  expect(result).toEqual(mockData);
});
```

### 4. 异步测试

```javascript
// 正确处理异步测试
it('should handle async operations', async () => {
  // 使用async/await
  const result = await asyncOperation();
  expect(result).toBeDefined();

  // 或返回Promise
  return Promise.resolve().then(() => {
    expect(something).toBe(true);
  });
});
```

---

## 持续集成(CI)

### GitHub Actions配置

`.github/workflows/test.yml`:
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [16.x, 18.x]

    steps:
    - uses: actions/checkout@v3

    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}

    - name: Install backend dependencies
      run: |
        cd backend
        npm ci --legacy-peer-deps

    - name: Install frontend dependencies
      run: |
        cd frontend-react
        npm ci --legacy-peer-deps

    - name: Run backend tests
      run: |
        cd backend
        npm run test:ci

    - name: Run frontend tests
      run: |
        cd frontend-react
        npm run test:run

    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        files: ./test-reports/backend-coverage/lcov.info,./test-reports/frontend-coverage/lcov.info
```

---

## 测试执行清单

- [ ] 依赖已安装
- [ ] 环境变量已配置
- [ ] 测试数据库已启动
- [ ] 后端测试通过
- [ ] 前端测试通过
- [ ] 代码质量检查通过
- [ ] 类型检查通过
- [ ] 覆盖率达到目标
- [ ] 测试报告已生成

---

**文档版本**: v1.0.0
**创建日期**: 2026-03-20
**最后更新**: 2026-03-20
