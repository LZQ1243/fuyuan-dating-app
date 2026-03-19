# 赴缘红娘管理后台

## 项目介绍

赴缘红娘管理后台是基于 Vue 3 + Element Plus 开发的红娘管理系统,用于管理用户、匹配和消息等功能。

## 技术栈

- **前端框架**: Vue 3.4.21
- **构建工具**: Vite 5.2.0
- **UI组件库**: Element Plus 2.6.0
- **状态管理**: Pinia 2.1.7
- **路由管理**: Vue Router 4.3.0
- **HTTP客户端**: Axios 1.6.7
- **图表库**: ECharts 5.5.0
- **日期处理**: Day.js 1.11.10

## 功能特性

### 1. 登录系统
- 账号密码登录
- 微信扫码登录
- QQ登录
- 记住登录状态

### 2. 数据概览 (Dashboard)
- 用户统计卡片
- 匹配统计卡片
- 消息统计卡片
- 活跃用户统计
- 用户增长趋势图表
- 匹配成功率图表
- 最新动态列表

### 3. 用户管理
- 用户列表展示
- 用户信息搜索
- 按残疾类型筛选
- 按认证状态筛选
- 查看用户详情
- 人工推荐匹配
- 分页功能

### 4. 匹配管理
- 匹配成功统计
- 待确认统计
- 匹配成功率统计
- 匹配记录列表
- 人工匹配功能
- 匹配确认/取消
- 匹配度可视化

### 5. 消息管理
- 消息列表展示
- 消息内容搜索
- 按消息类型筛选
- 按时间范围筛选
- 查看消息详情
- 标记已读/未读
- 分页功能

## 项目结构

```
matchmaker-admin/
├── src/
│   ├── api/                 # API接口
│   │   ├── auth.js         # 认证相关API
│   │   └── request.js      # 请求封装
│   ├── router/              # 路由配置
│   │   └── index.js        # 路由定义
│   ├── store/               # 状态管理
│   │   └── user.js         # 用户状态
│   ├── styles/              # 样式文件
│   │   └── main.scss       # 全局样式
│   ├── views/               # 页面组件
│   │   ├── Login.vue       # 登录页
│   │   ├── Layout.vue      # 布局组件
│   │   ├── Dashboard.vue   # 数据概览
│   │   ├── Users.vue       # 用户管理
│   │   ├── Match.vue       # 匹配管理
│   │   └── Messages.vue    # 消息管理
│   ├── App.vue             # 根组件
│   └── main.js             # 入口文件
├── index.html              # HTML模板
├── package.json            # 依赖配置
├── vite.config.js          # Vite配置
└── README.md               # 项目说明
```

## 安装依赖

```bash
cd matchmaker-admin
npm install
```

## 开发运行

```bash
npm run dev
```

默认端口: 3002
访问地址: http://localhost:3002

## 生产构建

```bash
npm run build
```

构建产物位于 `dist` 目录

## 预览构建

```bash
npm run preview
```

## 环境配置

创建 `.env` 文件:

```
VITE_API_BASE_URL=http://localhost:3000/api
```

## 设计规范

### 颜色系统
- **主题色**: #FF6B6B (粉红色)
- **辅助色**: #FF8E8C (橙粉色)
- **渐变方向**: 135deg
- **成功色**: #67c23a
- **警告色**: #e6a23c
- **危险色**: #f56c6c
- **信息色**: #909399

### 间距系统
- **卡片间距**: 20px
- **内容间距**: 16px
- **元素间距**: 12px
- **小间距**: 8px

### 圆角系统
- **卡片**: 12px
- **按钮**: 8px
- **输入框**: 8px
- **对话框**: 8px

### 阴影系统
- **卡片阴影**: 0 2px 8px rgba(0, 0, 0, 0.05)
- **悬停阴影**: 0 4px 16px rgba(0, 0, 0, 0.1)
- **弹出层阴影**: 0 8px 24px rgba(0, 0, 0, 0.15)

## 登录方式

### 默认账号
- 账号: `matchmaker`
- 密码: `matchmaker123`

### 登录类型
- 红娘账号密码登录
- 微信扫码登录 (开发中)
- QQ登录 (开发中)

## API接口

### 认证相关
- `POST /api/matchmaker/login` - 红娘登录
- `POST /api/matchmaker/logout` - 红娘退出

### 用户管理
- `GET /api/matchmaker/users` - 获取用户列表
- `GET /api/matchmaker/users/:id` - 获取用户详情
- `POST /api/matchmaker/users/:id/match` - 推荐匹配

### 匹配管理
- `GET /api/matchmaker/matches` - 获取匹配列表
- `GET /api/matchmaker/matches/:id` - 获取匹配详情
- `POST /api/matchmaker/matches` - 创建人工匹配
- `PUT /api/matchmaker/matches/:id/confirm` - 确认匹配
- `PUT /api/matchmaker/matches/:id/cancel` - 取消匹配

### 消息管理
- `GET /api/matchmaker/messages` - 获取消息列表
- `GET /api/matchmaker/messages/:id` - 获取消息详情
- `PUT /api/matchmaker/messages/:id/read` - 标记已读

## 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 开发注意事项

1. **组件命名**: 使用 PascalCase 命名组件文件
2. **样式规范**: 使用 Scoped CSS 避免样式污染
3. **API调用**: 统一使用 `request` 封装发起请求
4. **状态管理**: 使用 Pinia 管理全局状态
5. **路由守卫**: 使用 `router.beforeEach` 进行权限控制

## 更新日志

### v1.0.0 (2026-03-19)
- ✅ 初始化项目
- ✅ 实现登录系统
- ✅ 实现数据概览
- ✅ 实现用户管理
- ✅ 实现匹配管理
- ✅ 实现消息管理
- ✅ 集成 Element Plus
- ✅ 集成 ECharts 图表

## 许可证

MIT License

## 联系方式

- 项目名称: 赴缘婚恋社交平台
- 开发团队: 赴缘技术团队
