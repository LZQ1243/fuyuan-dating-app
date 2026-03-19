# 赴缘 - React前端项目

## 项目简介
这是"赴缘"婚恋社交平台的React前端项目，采用现代化技术栈构建，为残障人士提供专业、无障碍的婚恋服务。

## 技术栈
- **框架**: React 18.2.0
- **语言**: TypeScript 5.3.0
- **构建工具**: Vite 5.0.0
- **路由**: React Router DOM 6.22.0
- **状态管理**: Zustand 4.5.0
- **UI组件**: Ant Design 5.12.0
- **实时通信**: Socket.IO Client 4.6.1
- **日期处理**: dayjs 1.11.10
- **HTTP客户端**: axios 1.6.5

## 项目结构
```
frontend-react/
├── public/              # 静态资源
├── src/
│   ├── components/      # 公共组件
│   │   └── Layout.tsx   # 主布局
│   ├── pages/           # 页面组件
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Match.tsx
│   │   ├── ChatList.tsx
│   │   ├── ChatDetail.tsx
│   │   ├── Posts.tsx
│   │   ├── PostDetail.tsx
│   │   ├── PostCreate.tsx
│   │   ├── Profile.tsx
│   │   └── Settings.tsx
│   ├── store/           # 状态管理
│   │   └── auth.ts      # 认证状态
│   ├── utils/           # 工具函数
│   │   └── request.ts   # HTTP封装
│   ├── App.tsx          # 应用根组件
│   ├── main.tsx         # 应用入口
│   └── index.css        # 全局样式
├── index.html           # HTML模板
├── vite.config.ts       # Vite配置
├── tsconfig.json        # TS配置
└── package.json         # 依赖配置
```

## 安装依赖

```bash
npm install
```

## 开发

```bash
npm run dev
```

开发服务器将在 `http://localhost:3002` 启动

## 构建

```bash
npm run build
```

## 预览生产构建

```bash
npm run preview
```

## 代码检查

```bash
npm run lint
```

## 环境变量

创建 `.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

## 功能模块

### 1. 认证模块
- 用户登录
- 用户注册
- 认证状态管理
- Token持久化

### 2. 主页模块
- 推荐用户展示
- 快捷操作入口
- 个性化推荐

### 3. 匹配模块
- 智能匹配算法
- 用户卡片展示
- 匹配分数显示
- 开始聊天

### 4. 聊天模块
- 聊天列表
- 实时消息收发
- 图片上传
- 消息历史

### 5. 社交动态
- 动态列表
- 发布动态
- 点赞/评论/分享
- 动态详情

### 6. 用户中心
- 个人资料
- 资料编辑
- 设置管理
- 账号安全

## 浏览器兼容性

支持所有现代浏览器：
- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 性能优化

- 代码分割
- 懒加载
- 组件memo
- 虚拟滚动

## 无障碍支持

- 语义化HTML
- ARIA标签
- 键盘导航
- 屏幕阅读器友好

## 开发规范

### 组件命名
- 使用PascalCase命名组件
- 文件名与组件名保持一致

### 代码风格
- 使用ESLint进行代码检查
- 使用Prettier进行代码格式化
- 遵循React最佳实践

### Git提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 重构
- test: 测试相关
- chore: 构建/工具链相关

## 联系方式

如有问题，请联系开发团队。
