# 🛠️ 错误修复指南

## 📋 已修复的问题

### 1. ✅ vite.config.ts 重复导出错误

**问题**: 文件中存在重复的 `export default` 定义

**修复**: 已移除重复的配置块

**文件**: `frontend-react/vite.config.ts`

### 2. ✅ 前端项目结构说明

**重要提示**:
- `frontend/` - 旧版 uni-app 项目（已废弃）
- `frontend-react/` - 新版 React 项目（**使用这个**）
- `admin/` - PC 管理后台

## 🚀 正确的启动步骤

### 方法1：手动启动（推荐）

#### 启动后端

打开新的 PowerShell 窗口：

```powershell
cd c:\Users\Administrator\Desktop\赴缘婚恋应用开发\backend
npm install
npm run dev
```

#### 启动前端

打开另一个新的 PowerShell 窗口：

```powershell
cd c:\Users\Administrator\Desktop\赴缘婚恋应用开发\frontend-react
npm install
npm run dev
```

### 方法2：使用PowerShell脚本

#### 启动后端
```powershell
cd c:\Users\Administrator\Desktop\赴缘婚恋应用开发
.\start-backend.ps1
```

#### 启动前端（新窗口）
```powershell
cd c:\Users\Administrator\Desktop\赴缘婚恋应用开发
.\start-frontend.ps1
```

## 🔍 TypeScript 错误解决方案

### 如果仍然遇到类型错误

#### 1. 清除缓存并重新安装

```powershell
cd c:\Users\Administrator\Desktop\赴缘婚恋应用开发\frontend-react

# 删除node_modules和锁定文件
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# 清除npm缓存
npm cache clean --force

# 重新安装
npm install
```

#### 2. 重新安装TypeScript类型

```powershell
npm install typescript@latest @types/react@latest @types/react-dom@latest --save-dev
```

#### 3. 重启TypeScript服务器

在 VSCode 中：
1. 按 `Ctrl + Shift + P`
2. 输入 "TypeScript: Restart TS Server"
3. 选择并执行

## 📊 访问地址

启动成功后访问：

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端应用 | http://localhost:3002 | React前端 |
| 后端API | http://localhost:3000 | Express后端 |

## ⚠️ 常见问题

### 问题1：端口已被占用

**错误信息**:
```
Error: listen EADDRINUSE: address already in use :::3002
```

**解决方法**:

修改 `frontend-react/vite.config.ts` 中的端口：
```typescript
server: {
  port: 3003,  // 改为其他端口
  // ...
}
```

### 问题2：MongoDB连接失败

**错误信息**:
```
MongooseError: connect ECONNREFUSED
```

**解决方法**:

1. 启动MongoDB服务
2. 或编辑 `backend/.env` 文件，确认连接字符串正确

### 问题3：依赖安装失败

**错误信息**:
```
npm ERR! code ELIFECYCLE
```

**解决方法**:

```powershell
npm install --legacy-peer-deps
```

### 问题4：PowerShell执行策略限制

**错误信息**:
```
无法加载文件，因为在此系统上禁止运行脚本
```

**解决方法**:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\start-backend.ps1
```

## 🎯 验证启动成功

### 后端启动成功标志

看到以下信息表示成功：
```
[info] 服务器运行在端口 3000
```

### 前端启动成功标志

看到以下信息表示成功：
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3002/
➜  Network: use --host to expose
```

### 测试访问

1. 打开浏览器访问 http://localhost:3002
2. 应该能看到登录页面
3. 尝试注册新用户
4. 检查是否能正常登录

## 📞 获取帮助

如果以上方法都无法解决问题：

1. **查看控制台错误**: 仔细阅读错误信息
2. **检查网络**: 确保能访问 npm registry
3. **检查Node.js版本**: `node --version` 应该 >= 16.0.0
4. **查看日志**: 检查backend/logs目录下的日志文件

## 🎉 成功启动后

恭喜！项目已成功启动。现在你可以：

- 注册新用户
- 完善个人资料
- 使用智能匹配功能
- 发送和接收消息
- 发布动态和朋友圈
- 观看短视频和直播

祝你开发愉快！🚀
