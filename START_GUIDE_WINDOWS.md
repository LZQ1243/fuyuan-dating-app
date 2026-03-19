# 🚀 赴缘婚恋平台 - Windows启动指南

## 📋 前置要求

✅ Node.js >= 16.0.0
✅ MongoDB（本地或使用Docker）
✅ Redis（可选，用于缓存和会话）

## 🎯 快速启动步骤

### 1. 安装后端依赖

打开 PowerShell 或 CMD，执行：

```bash
cd c:\Users\Administrator\Desktop\赴缘婚恋应用开发\backend
npm install
```

如果安装失败，尝试：

```bash
npm install --legacy-peer-deps
```

### 2. 配置后端环境变量

```bash
cd c:\Users\Administrator\Desktop\赴缘婚恋应用开发\backend
copy .env.example .env
```

然后编辑 `.env` 文件，配置数据库连接等参数。

### 3. 启动后端服务

```bash
cd c:\Users\Administrator\Desktop\赴缘婚恋应用开发\backend
npm run dev
```

后端将在 `http://localhost:3000` 启动

### 4. 安装前端依赖

**打开新的 PowerShell 或 CMD 窗口**，执行：

```bash
cd c:\Users\Administrator\Desktop\赴缘婚恋应用开发\frontend-react
npm install
```

### 5. 启动前端服务

```bash
cd c:\Users\Administrator\Desktop\赴缘婚恋应用开发\frontend-react
npm run dev
```

前端将在 `http://localhost:3002` 启动

## 🔧 常见问题解决

### 问题1：退出代码 -65536

**原因**: 依赖未安装或路径问题

**解决方法**:
1. 确保在正确的目录下
2. 删除 `node_modules` 文件夹和 `package-lock.json`
3. 重新运行 `npm install`

```bash
cd c:\Users\Administrator\Desktop\赴缘婚恋应用开发\backend
rmdir /s /q node_modules
del package-lock.json
npm install
```

### 问题2：端口已被占用

**解决方法**:

修改端口配置：

**后端** - 编辑 `backend/.env`:
```
PORT=3001
```

**前端** - 编辑 `frontend-react/vite.config.ts`:
```typescript
server: {
  port: 3003,
  // ...
}
```

### 问题3：MongoDB连接失败

**解决方法**:

确保MongoDB正在运行：

```bash
# 如果使用本地MongoDB
net start MongoDB

# 或检查MongoDB服务
sc query MongoDB
```

或者使用连接字符串：

```env
# backend/.env
MONGODB_URI=mongodb://localhost:27017/fuyuan
```

### 问题4：TypeScript错误

**解决方法**:

重新安装TypeScript和类型定义：

```bash
cd c:\Users\Administrator\Desktop\赴缘婚恋应用开发\frontend-react
npm install typescript @types/react @types/react-dom --save-dev
```

### 问题5：vite.config.ts类型错误

**解决方法**:

该问题已在最新代码中修复，确保：
1. 已更新 `vite.config.ts` 文件
2. 已重新安装依赖

## 📦 使用Docker启动数据库（推荐）

如果使用Docker，可以快速启动MongoDB和Redis：

```bash
cd c:\Users\Administrator\Desktop\赴缘婚恋应用开发\docker
docker-compose up -d
```

检查容器状态：
```bash
docker-compose ps
```

## 🌐 访问地址

启动成功后，访问：

- **前端应用**: http://localhost:3002
- **后端API**: http://localhost:3000
- **API文档**: http://localhost:3000/api-docs (如果配置了)

## 🛠️ 开发工具

### VSCode推荐扩展
- ESLint
- Prettier
- TypeScript Vue Plugin (Volar)
- Vetur (如果使用Vue)

### 浏览器开发工具
- React Developer Tools
- Redux DevTools

## 📝 开发命令汇总

```bash
# 后端
cd backend
npm install              # 安装依赖
npm run dev             # 开发模式
npm start              # 生产模式
npm test               # 运行测试
npm run lint           # 代码检查

# 前端
cd frontend-react
npm install             # 安装依赖
npm run dev            # 开发模式
npm run build          # 构建
npm run preview        # 预览构建
npm run lint          # 代码检查
```

## 🔍 调试技巧

### 查看详细错误信息

**PowerShell**:
```powershell
$ErrorActionPreference = "Continue"
npm run dev
```

**CMD**:
```cmd
npm run dev 2>&1 | more
```

### 清除缓存

```bash
# 清除npm缓存
npm cache clean --force

# 清除node_modules
rmdir /s /q node_modules

# 重新安装
npm install
```

## 📞 获取帮助

如果遇到问题：

1. 查看控制台错误信息
2. 检查 `.env` 配置是否正确
3. 确保数据库服务正在运行
4. 查看项目文档和README

## ✅ 启动检查清单

- [ ] Node.js已安装（版本 >= 16）
- [ ] MongoDB正在运行
- [ ] 后端依赖已安装
- [ ] 前端依赖已安装
- [ ] 后端.env文件已配置
- [ ] 后端服务启动成功
- [ ] 前端服务启动成功
- [ ] 可以访问前端页面
- [ ] 可以调用后端API

## 🎉 成功启动

看到以下信息表示启动成功：

**后端**:
```
[info] 服务器运行在端口 3000
```

**前端**:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3002/
➜  Network: use --host to expose
```

祝你开发顺利！🚀
