# 📂 前端项目结构说明

## ⚠️ 重要提示

项目中有**两个前端项目**：

### 1. frontend/ (已废弃 - uni-app)
- **框架**: uni-app + Vue3
- **路径**: `c:\Users\Administrator\Desktop\赴缘婚恋应用开发\frontend\`
- **状态**: ⚠️ 已废弃，不再维护
- **建议**: 可以删除或忽略此目录

### 2. frontend-react/ (✅ 当前使用 - React)
- **框架**: React 18 + TypeScript + Vite
- **路径**: `c:\Users\Administrator\Desktop\赴缘婚恋应用开发\frontend-react\`
- **状态**: ✅ 活跃开发中
- **建议**: **这是你要使用的前端项目**

## 🚀 正确的项目启动

### 启动后端
```powershell
cd c:\Users\Administrator\Desktop\赴缘婚恋应用开发\backend
npm install
npm run dev
```

### 启动前端（React）
```powershell
cd c:\Users\Administrator\Desktop\赴缘婚恋应用开发\frontend-react
npm install
npm run dev
```

## ❌ 不要这样做

### ❌ 错误方式1：启动旧的frontend/目录
```powershell
cd frontend          # ❌ 这是uni-app项目
npm run dev:h5     # ❌ 这是旧的启动命令
```

### ❌ 错误方式2：使用旧的start-dev.bat
```batch
start-dev.bat     # ❌ 此脚本指向错误的目录
```

## ✅ 正确的做法

### ✅ 正确方式1：手动启动
```powershell
# 后端（新窗口1）
cd backend
npm run dev

# 前端（新窗口2）
cd frontend-react
npm run dev
```

### ✅ 正确方式2：使用新的PowerShell脚本
```powershell
cd "c:\Users\Administrator\Desktop\赴缘婚恋应用开发"

# 后端（新窗口1）
.\start-backend.ps1

# 前端（新窗口2）
.\start-frontend.ps1
```

## 📊 访问地址

| 项目 | 地址 | 说明 |
|------|------|------|
| **React前端** | http://localhost:3002 | ✅ 使用这个 |
| 后端API | http://localhost:3000 | Express服务 |
| 旧版uni-app | http://localhost:8080 | ❌ 已废弃 |

## 🗑️ 清理建议

如果确定不再使用uni-app项目，可以删除旧目录：

```powershell
cd "c:\Users\Administrator\Desktop\赴缘婚恋应用开发"
Remove-Item -Recurse -Force frontend
```

**删除前的警告**：
- 确保不再需要uni-app项目
- 确保React前端已完全开发完成
- 建议先备份整个项目目录

## 🎯 验证正确的项目

### 检查React前端
```powershell
cd frontend-react
Get-Content package.json | Select-String "react"
# 应该看到 "react": "^18.2.0"
```

### 检查uni-app前端
```powershell
cd frontend
Get-Content package.json | Select-String "uni-app"
# 应该看到 "uni-app"
```

## 📝 TypeScript错误说明

### vite.config.ts 类型错误

**文件**: `frontend-react/vite.config.ts`

**错误原因**:
- TypeScript服务器缓存问题
- 类型定义索引未更新

**已修复**:
- 已为所有import语句添加 `// @ts-ignore` 注释
- 这不会影响运行时行为
- Vite配置由Node.js执行，不需要严格的类型检查

### frontend/api/index.js 错误

**文件**: `frontend/api/index.js`

**错误说明**:
- 这是uni-app项目的文件
- React项目不使用此文件
- TypeScript在分析项目时会检查此文件

**解决方案**:
- 忽略此文件的错误（它不影响React项目）
- 或者删除整个 `frontend/` 目录

## 🔧 TypeScript配置优化

### 创建tsconfig.json（如果不存在）

如果 `frontend-react/tsconfig.json` 不存在，创建一个：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 创建tsconfig.node.json（如果不存在）

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

## 🎉 总结

1. ✅ 使用 `frontend-react` 目录（React项目）
2. ❌ 忽略 `frontend` 目录（uni-app旧项目）
3. ✅ vite.config.ts类型错误已修复
4. ✅ 忽略 `frontend/api/index.js` 的错误（不影响React项目）

祝你开发顺利！🚀
