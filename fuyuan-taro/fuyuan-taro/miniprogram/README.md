# 赴缘婚恋小程序 - 原生微信小程序版

## 项目结构

```
miniprogram/
├── app.js                 # 小程序主入口
├── app.json               # 全局配置
├── app.wxss               # 全局样式
├── sitemap.json           # 站点地图配置
├── project.config.json    # 项目配置
├── pages/                 # 页面目录
│   ├── index/             # 首页（微信登录、手机号登录入口）
│   ├── login/             # 登录页
│   │   └── phone/         # 手机号登录
│   ├── register/          # 注册页
│   ├── match/             # 智能匹配页
│   ├── chat/              # 聊天页
│   │   └── detail/        # 聊天详情
│   ├── posts/             # 动态页
│   │   └── create/        # 发布动态
│   ├── mine/              # 我的
│   │   ├── edit-profile/  # 编辑资料
│   │   ├── settings/      # 设置
│   │   └── verification/  # 实名认证
│   └── matchmaker/        # 红娘服务
│       └── detail/        # 红娘详情
├── components/            # 公共组件
├── utils/                 # 工具函数
│   ├── request.js         # 网络请求封装
│   └── util.js            # 通用工具
└── images/                # 图片资源
    ├── tabbar/            # 底部导航图标
    └── icons/             # 功能图标
```

## 功能模块

### 1. 首页 (pages/index)
- 微信一键登录
- 手机号登录入口
- 功能介绍展示

### 2. 登录注册 (pages/login, pages/register)
- 微信授权登录
- 手机号验证码登录
- 用户注册

### 3. 智能匹配 (pages/match)
- 推荐用户列表
- 匹配原因展示
- 喜欢/不喜欢/跳过操作
- 匹配偏好设置

### 4. 聊天模块 (pages/chat)
- 消息列表
- 聊天详情
- 实时通讯（WebSocket）
- 发送文本/图片/语音

### 5. 动态模块 (pages/posts)
- 动态列表
- 发布动态
- 点赞、评论

### 6. 个人中心 (pages/mine)
- 个人信息展示
- 编辑资料
- 实名认证
- 设置（隐私、通知等）

### 7. 红娘服务 (pages/matchmaker)
- 红娘列表
- 红娘详情
- 在线咨询

## 技术栈

- **框架**: 微信小程序原生开发
- **语言**: JavaScript / WXML / WXSS
- **API**: 微信小程序 API
- **状态管理**: 全局变量 + 本地存储
- **网络请求**: wx.request 封装
- **实时通讯**: wx.connectSocket

## 安装使用

### 1. 导入项目

1. 打开微信开发者工具
2. 选择"导入项目"
3. 选择 `miniprogram` 目录
4. 填写 AppID（使用测试号或自己的 AppID）

### 2. 配置 API 地址

修改 `app.js` 中的 API 地址：

```javascript
globalData: {
  baseUrl: 'https://your-api.com/api',  // 替换为你的 API 地址
  wsUrl: 'wss://your-api.com'           // 替换为你的 WebSocket 地址
}
```

### 3. 配置 TabBar 图标

在 `images/tabbar/` 目录下放置以下图标：
- home.png / home-active.png
- match.png / match-active.png
- chat.png / chat-active.png
- mine.png / mine-active.png

### 4. 配置功能图标

在 `images/icons/` 目录下放置以下图标：
- phone.png (手机图标)
- code.png (验证码图标)
- match.png (匹配图标)
- chat.png (聊天图标)
- matchmaker.png (红娘图标)
- wechat.png (微信图标)
- logo.png (Logo)

### 5. 运行项目

点击微信开发者工具的"编译"按钮即可预览项目。

## API 接口说明

### 认证相关
- `POST /auth/wechat-login` - 微信登录
- `POST /auth/phone-login` - 手机号登录
- `POST /auth/send-code` - 发送验证码
- `POST /auth/register` - 用户注册

### 用户相关
- `GET /api/user/info` - 获取用户信息
- `PUT /api/user/profile` - 更新用户资料
- `POST /api/user/avatar` - 上传头像
- `POST /api/user/verification` - 实名认证

### 匹配相关
- `GET /api/match/recommend` - 智能推荐
- `GET /api/match/list` - 匹配列表
- `POST /api/match/like` - 喜欢用户
- `POST /api/match/dislike` - 不喜欢用户

### 聊天相关
- `GET /api/chat/list` - 聊天列表
- `GET /api/chat/history` - 聊天记录
- `POST /api/chat/send/text` - 发送文本
- `POST /api/chat/send/image` - 发送图片

### 动态相关
- `GET /api/posts/list` - 动态列表
- `POST /api/posts` - 发布动态
- `POST /api/posts/{postId}/like` - 点赞
- `POST /api/posts/{postId}/comment` - 评论

## 注意事项

1. **API 地址**: 需要将 `app.js` 中的 API 地址替换为实际的后端地址
2. **AppID**: 需要配置自己的 AppID 或使用测试号
3. **图标资源**: 需要准备相应的图标资源
4. **权限配置**: 在 `app.json` 中已配置位置等权限，需要在微信公众平台开启对应权限
5. **域名白名单**: 在微信公众平台配置服务器域名白名单

## 从 Taro 转换说明

### 主要改动

1. **框架**: Taro → 微信小程序原生
2. **状态管理**: Zustand → 全局变量 + 本地存储
3. **组件**: Taro 组件 → 微信原生组件
4. **API**: Taro API → 微信 API (如 `Taro.request` → `wx.request`)
5. **样式**: SCSS → WXSS（支持部分 CSS）
6. **路由**: Taro.navigateTo → wx.navigateTo

### 保留功能

- 所有业务逻辑
- API 接口调用
- WebSocket 实时通讯
- 图片上传
- 用户认证

## 开发建议

1. **页面开发**: 按照现有页面结构继续开发其他页面
2. **组件封装**: 可以在 `components/` 目录下封装公共组件
3. **工具函数**: 可以在 `utils/` 目录下添加更多工具函数
4. **API 封装**: 可以在 `utils/request.js` 中添加更多 API 接口

## 问题反馈

如有问题，请联系开发团队。
