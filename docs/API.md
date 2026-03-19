# 赴缘婚恋社交平台 - API接口文档

## 基础信息

- **Base URL**: `http://localhost:3000/api`
- **认证方式**: Bearer Token
- **数据格式**: JSON

## 通用响应格式

```json
{
  "code": 200,
  "message": "成功",
  "data": {}
}
```

## 认证接口

### 1. 用户注册

**接口**: `POST /auth/register`

**请求参数**:
```json
{
  "phone": "13800138000",
  "password": "123456",
  "gender": 1,
  "birthday": "1990-01-01"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": "xxx",
      "phone": "13800138000",
      "nickname": "",
      "gender": 1,
      "avatar": ""
    }
  }
}
```

### 2. 用户登录

**接口**: `POST /auth/login`

**请求参数**:
```json
{
  "phone": "13800138000",
  "password": "123456"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": "xxx",
      "phone": "13800138000",
      "nickname": "",
      "gender": 1,
      "avatar": "",
      "certification_status": 0
    }
  }
}
```

### 3. 获取当前用户信息

**接口**: `GET /auth/me`

**请求头**:
```
Authorization: Bearer {token}
```

**响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "user_id": "xxx",
    "phone": "13800138000",
    "nickname": "昵称",
    "gender": 1,
    "birthday": "1990-01-01T00:00:00.000Z",
    "age": 34,
    "avatar": "",
    "disability_type": "肢体",
    "disability_level": 2,
    "certification_status": 2
  }
}
```

### 4. 更新用户信息

**接口**: `PUT /auth/profile`

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "nickname": "新昵称",
  "disability_type": "视力",
  "disability_level": 1,
  "marital_status": "未婚"
}
```

### 5. 提交认证

**接口**: `POST /auth/certification`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**请求参数**:
```
certification_image: (file)
```

## 用户接口

### 1. 获取用户信息

**接口**: `GET /user/:user_id`

**响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "user_id": "xxx",
    "nickname": "昵称",
    "gender": 1,
    "age": 34,
    "disability_type": "肢体",
    "disability_level": 2,
    "online_status": true,
    "certification_status": 2
  }
}
```

## 匹配接口

### 1. 获取推荐用户

**接口**: `GET /match/recommend`

**请求头**:
```
Authorization: Bearer {token}
```

**查询参数**:
- `page`: 页码（默认1）
- `limit`: 每页数量（默认20）

**响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "users": [
      {
        "user_id": "xxx",
        "nickname": "昵称",
        "gender": 2,
        "age": 28,
        "avatar": "",
        "disability_type": "视力",
        "disability_level": 1,
        "location": {
          "city": "北京",
          "district": "朝阳区"
        },
        "online_status": true,
        "certification_status": 2,
        "match_score": 85.5,
        "match_reason": "残疾等级相同、同城"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "total_pages": 5
    }
  }
}
```

## 聊天接口

### 1. 获取聊天列表

**接口**: `GET /chat/list`

**请求头**:
```
Authorization: Bearer {token}
```

**响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "chat_list": [
      {
        "user_id": "xxx",
        "nickname": "昵称",
        "avatar": "",
        "online_status": true,
        "last_message": "你好",
        "last_time": "2024-01-01T00:00:00.000Z",
        "unread_count": 2
      }
    ]
  }
}
```

### 2. 获取聊天记录

**接口**: `GET /chat/history/:target_user_id`

**请求头**:
```
Authorization: Bearer {token}
```

**查询参数**:
- `page`: 页码（默认1）
- `limit`: 每页数量（默认20）

**响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "messages": [
      {
        "message_id": "xxx",
        "sender_id": "xxx",
        "receiver_id": "xxx",
        "content": "你好",
        "type": "text",
        "timestamp": "2024-01-01T00:00:00.000Z",
        "is_read": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "total_pages": 5
    }
  }
}
```

### 3. 发送消息

**接口**: `POST /chat/send`

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "receiver_id": "xxx",
  "content": "你好",
  "type": "text"
}
```

### 4. 标记消息已读

**接口**: `PUT /chat/read/:target_user_id`

**请求头**:
```
Authorization: Bearer {token}
```

### 5. 撤回消息

**接口**: `PUT /chat/revoke/:message_id`

**请求头**:
```
Authorization: Bearer {token}
```

## 动态接口

### 1. 获取动态列表

**接口**: `GET /posts`

**查询参数**:
- `page`: 页码（默认1）
- `limit`: 每页数量（默认10）
- `user_id`: 用户ID（可选）

**响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "posts": [
      {
        "post_id": "xxx",
        "user": {
          "user_id": "xxx",
          "nickname": "昵称",
          "avatar": ""
        },
        "content": "动态内容",
        "media_urls": [],
        "type": "text",
        "likes_count": 10,
        "is_liked": false,
        "comments": [],
        "comments_count": 5,
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "total_pages": 5
    }
  }
}
```

### 2. 发布动态

**接口**: `POST /posts`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**请求参数**:
```
content: "动态内容"
media: (file[]) - 最多9张图片
is_private: false
```

### 3. 点赞动态

**接口**: `POST /posts/:post_id/like`

**请求头**:
```
Authorization: Bearer {token}
```

### 4. 评论动态

**接口**: `POST /posts/:post_id/comment`

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "content": "评论内容"
}
```

### 5. 删除动态

**接口**: `DELETE /posts/:post_id`

**请求头**:
```
Authorization: Bearer {token}
```

## 管理员接口

### 1. 获取统计数据

**接口**: `GET /admin/statistics`

**响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "users": {
      "total": 1000,
      "active": 100,
      "banned": 10,
      "certified": 500,
      "today": 20
    },
    "certifications": {
      "pending": 5
    },
    "content": {
      "posts": 100,
      "messages": 1000
    },
    "disability": [
      { "_id": "肢体", "count": 400 },
      { "_id": "视力", "count": 200 }
    ]
  }
}
```

### 2. 获取用户列表

**接口**: `GET /admin/users`

**查询参数**:
- `page`: 页码
- `limit`: 每页数量
- `keyword`: 搜索关键词
- `certification_status`: 认证状态
- `is_banned`: 是否封禁

### 3. 封禁用户

**接口**: `PUT /admin/users/:user_id/ban`

**请求参数**:
```json
{
  "reason": "封禁原因"
}
```

### 4. 获取待审核认证

**接口**: `GET /admin/certifications/pending`

### 5. 通过认证

**接口**: `PUT /admin/certifications/:user_id/approve`

### 6. 拒绝认证

**接口**: `PUT /admin/certifications/:user_id/reject`

**请求参数**:
```json
{
  "reason": "拒绝原因"
}
```

### 7. 获取敏感词列表

**接口**: `GET /admin/sensitive-words`

### 8. 添加敏感词

**接口**: `POST /admin/sensitive-words`

**请求参数**:
```json
{
  "word": "敏感词"
}
```

### 9. 删除敏感词

**接口**: `DELETE /admin/sensitive-words/:word`

## WebSocket

### 连接地址

```
ws://localhost:3000/socket.io/
```

### 事件

#### 客户端发送事件

1. **user:online** - 用户上线
```json
{
  "userId": "xxx"
}
```

2. **message:send** - 发送消息
```json
{
  "senderId": "xxx",
  "receiverId": "xxx",
  "content": "消息内容",
  "type": "text"
}
```

3. **message:read** - 标记消息已读
```json
{
  "messageId": "xxx"
}
```

#### 服务器发送事件

1. **message:receive** - 接收新消息
```json
{
  "message_id": "xxx",
  "sender_id": "xxx",
  "receiver_id": "xxx",
  "content": "消息内容",
  "type": "text",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "is_read": false
}
```

2. **message:sent** - 消息发送确认
```json
{
  "message_id": "xxx"
}
```

## 错误码

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权/Token无效 |
| 403 | 禁止访问/权限不足 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |
