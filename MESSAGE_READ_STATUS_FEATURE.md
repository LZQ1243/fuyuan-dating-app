# 消息已读/未读功能文档

## 功能概述

实现了完整的消息已读/未读状态追踪功能,支持多端(APP、小程序、微信小程序、H5)的消息状态同步。

## 核心特性

### 1. 双向阅读状态追踪
- **发送方已读**: 发送方查看自己发送的消息后,记录`sender_read_at`
- **接收方已读**: 接收方查看收到的消息后,记录`receiver_read_at`
- **整体已读**: 任意一方查看后,`is_read`标记为true

### 2. 多平台支持
支持以下平台的消息阅读记录:
- `app` - 原生APP
- `wechat` - 微信小程序
- `alipay` - 支付宝小程序
- `toutiao` - 抖音小程序
- `h5` - H5网页
- `miniprogram` - 其他小程序

### 3. 阅读记录追踪
每次查看消息都会记录:
- 查看用户ID
- 查看平台
- 设备ID
- 查看时间

## 数据库设计

### Message模型字段

```javascript
{
  message_id: String,           // 消息唯一ID
  sender_id: String,          // 发送方ID
  receiver_id: String,         // 接收方ID
  content: String,            // 消息内容
  type: String,               // 消息类型(text/image)
  is_read: Boolean,           // 是否已读
  sender_read_at: Date,        // 发送方查看时间
  receiver_read_at: Date,       // 接收方查看时间
  read_records: [{            // 阅读记录
    user_id: String,          // 查看用户ID
    platform: String,          // 查看平台
    device_id: String,         // 设备ID
    read_at: Date             // 查看时间
  }],
  timestamp: Date,            // 发送时间
  is_revoked: Boolean         // 是否已撤回
}
```

### 虚拟字段

- `is_read_by_any` - 任意一方是否已读
- `last_read_info` - 最后一次阅读信息

### 实例方法

- `markAsReadByUser(userId, platform, deviceId)` - 标记用户已查看消息

## API接口

### 1. 获取聊天记录
**接口**: `GET /api/chat/history/:target_user_id`

**请求头**:
```
X-Platform: wechat/app/h5
X-Device-ID: device_xxx
```

**响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "messages": [
      {
        "message_id": "xxx",
        "sender_id": "user1",
        "receiver_id": "user2",
        "content": "你好",
        "type": "text",
        "timestamp": "2024-01-01T10:00:00.000Z",
        "is_read": true,
        "is_read_by_sender": true,
        "is_read_by_receiver": true,
        "read_by_me": true
      }
    ],
    "pagination": {...}
  }
}
```

**说明**:
- 获取聊天记录时自动标记接收方未读消息为已读
- `read_by_me` 表示当前用户是否已读

### 2. 发送消息
**接口**: `POST /api/chat/send`

**请求头**:
```
X-Platform: wechat/app/h5
X-Device-ID: device_xxx
```

**响应**:
```json
{
  "code": 200,
  "message": "发送成功",
  "data": {
    "message_id": "xxx",
    "sender_id": "user1",
    "receiver_id": "user2",
    "content": "你好",
    "type": "text",
    "timestamp": "2024-01-01T10:00:00.000Z",
    "is_read": false,
    "is_read_by_sender": true,
    "is_read_by_receiver": false,
    "read_by_me": true
  }
}
```

**说明**:
- 发送消息时自动记录发送方已读
- 发送方`read_by_me`为true

### 3. 标记消息已读
**接口**: `PUT /api/chat/read/:target_user_id`
**接口**: `PUT /api/chat/read/:target_user_id/:message_id`

**请求头**:
```
X-Platform: wechat/app/h5
X-Device-ID: device_xxx
```

**说明**:
- 不带message_id: 标记与该用户的所有消息为已读
- 带message_id: 标记单条消息为已读

### 4. 获取消息阅读状态
**接口**: `GET /api/chat/read-status/:message_id`

**响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "message_id": "xxx",
    "is_read": true,
    "is_read_by_sender": true,
    "is_read_by_receiver": true,
    "read_by_me": true,
    "sender_read_at": "2024-01-01T10:00:00.000Z",
    "receiver_read_at": "2024-01-01T10:05:00.000Z",
    "read_records": [
      {
        "user_id": "user1",
        "platform": "wechat",
        "read_at": "2024-01-01T10:00:00.000Z",
        "is_me": true
      },
      {
        "user_id": "user2",
        "platform": "app",
        "read_at": "2024-01-01T10:05:00.000Z",
        "is_me": false
      }
    ]
  }
}
```

### 5. 批量获取消息阅读状态
**接口**: `POST /api/chat/read-status/batch`

**请求体**:
```json
{
  "message_ids": ["id1", "id2", "id3"]
}
```

**响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "message_status": [
      {
        "message_id": "id1",
        "is_read": true,
        "is_read_by_sender": true,
        "is_read_by_receiver": true,
        "read_by_me": true,
        "read_by_any": true
      }
    ]
  }
}
```

## 前端实现

### 1. 平台信息自动识别

```typescript
// services/request.ts
const getPlatformInfo = () => {
  // #ifdef MP-WEIXIN
  return 'wechat'
  // #endif

  // #ifdef H5
  return 'h5'
  // #endif

  // #ifdef APP-PLUS
  return 'app'
  // #endif

  return 'unknown'
}
```

### 2. 设备ID管理

```typescript
// 自动生成并存储设备ID
const getDeviceId = () => {
  try {
    let deviceId = Taro.getStorageSync('device_id')
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      Taro.setStorageSync('device_id', deviceId)
    }
    return deviceId
  } catch (error) {
    return ''
  }
}
```

### 3. 请求头自动添加

```typescript
// 所有请求自动添加平台和设备信息
header: {
  'Content-Type': 'application/json',
  'Authorization': token ? `Bearer ${token}` : '',
  'X-Platform': platform,
  'X-Device-ID': deviceId
}
```

### 4. 自动标记已读

```typescript
// 加载聊天记录时自动标记未读消息
useEffect(() => {
  const params = Taro.getCurrentInstance().router?.params
  if (params?.userId) {
    loadMessages(params.userId)
    markAsRead(params.userId)  // 自动标记所有消息为已读
  }
}, [])
```

## 已读状态显示逻辑

### 1. 消息列表显示

```
┌─────────────────────────────────────┐
│ 发送方视角                     │
│                                │
│ 我: 你好              [已读]      │  ← 发送方已读,接收方未读
│                                │
┌─────────────────────────────────────┐
│ 接收方视角                     │
│                                │
│ 对方: 你好                        │  ← 发送方已读,接收方未读
│                    [未读]         │
└─────────────────────────────────────┘
```

### 2. 阅读状态图标

```typescript
// 根据read_by_me判断显示
const getReadStatusIcon = (message) => {
  if (message.read_by_me) {
    return '✓'  // 已读
  } else {
    return '○'  // 未读
  }
}
```

### 3. 阅读时间显示

```typescript
// 显示谁在什么时间什么设备查看了消息
const getReadInfo = (message) => {
  if (message.read_records && message.read_records.length > 0) {
    const lastRead = message.read_records[message.read_records.length - 1]
    const platformName = {
      'wechat': '微信',
      'app': 'APP',
      'h5': '网页'
    }[lastRead.platform] || '未知'

    return `${lastRead.user_id}于${formatTime(lastRead.read_at)}在${platformName}查看`
  }
  return '未读'
}
```

## 多端同步场景

### 场景1: APP发送,微信小程序查看

```
APP用户A            微信小程序用户B
    │                      │
    ├── 发送消息 ────→     │
    │   sender_read_at: now  │
    │   read_by_me: true    │
    │                      │
    │             ←─ 查看消息
    │             receiver_read_at: now
    │             read_by_me: true
    │                      │
    ↓ 同步状态               ↓
APP用户A看到           微信小程序用户B看到
[对方已读]               [已读]
```

### 场景2: H5发送,APP查看

```
H5用户A             APP用户B
  │                  │
  ├── 发送消息 ─────→   │
  │  sender_read_at   │
  │  read_by_me: true │
  │                  │
  │        ←── 查看消息
  │        receiver_read_at: now
  │        read_by_me: true
  │                  │
  ↓ 同步状态          ↓
H5用户A看到        APP用户B看到
[对方已读]          [已读]
```

### 场景3: 微信小程序发送,微信小程序查看

```
微信小程序用户A        微信小程序用户B
     │                   │
     ├── 发送消息 ─────→    │
     │  sender_read_at     │
     │  read_by_me: true   │
     │                   │
     │        ←── 查看消息
     │        receiver_read_at: now
     │        read_by_me: true
     │                   │
     ↓ 同步状态           ↓
微信小程序用户A看到    微信小程序用户B看到
[对方已读]            [已读]
```

## 聊天列表未读数统计

### 更新逻辑

```javascript
// 获取聊天列表时计算未读数
unread_count: {
  $sum: {
    $cond: [
      {
        $and: [
          { $eq: ['$receiver_id', user.user_id] },
          { $eq: ['$is_read', false] }
        ]
      },
      1,
      0
    ]
  }
}
```

### 显示效果

```
┌─────────────────────────────┐
│ 聊天列表                  │
├─────────────────────────────┤
│ [头像] 张三               │
│       最后一条消息           │
│       2小时前      [3未读] │
├─────────────────────────────┤
│ [头像] 李四               │
│       最后一条消息           │
│       昨天                  │
└─────────────────────────────┘
```

## 实时更新

### WebSocket推送

当一方查看消息时,通过WebSocket推送给对方:

```javascript
socket.emit('message:read', {
  message_id: 'xxx',
  reader_id: 'user2',
  read_at: new Date(),
  platform: 'wechat'
})
```

对方收到推送后更新UI:

```typescript
socket.on('message:read', (data) => {
  setMessages(prev => prev.map(msg =>
    msg.message_id === data.message_id
      ? { ...msg, is_read: true, receiver_read_at: data.read_at }
      : msg
  ))
  // 显示"对方已读"提示
  showToast({ title: '对方已读', icon: 'success' })
})
```

## 数据库优化

### 索引设计

```javascript
// 复合索引 - 优化查询性能
messageSchema.index({ sender_id: 1, receiver_id: 1, timestamp: -1 });
messageSchema.index({ receiver_id: 1, is_read: 1 });
messageSchema.index({ sender_id: 1, receiver_id: 1, is_read: 1 });
```

### 批量更新优化

```javascript
// 批量标记已读,减少数据库查询
await Message.updateMany(
  {
    message_id: { $in: messageIds },
    receiver_id: user.user_id,
    receiver_read_at: { $exists: false }
  },
  {
    $set: {
      receiver_read_at: new Date(),
      is_read: true
    },
    $push: {
      read_records: {
        $each: messageIds.map(id => ({
          user_id: user.user_id,
          platform,
          device_id: deviceId,
          read_at: new Date()
        })),
        $slice: 10 // 只保留最近10条记录
      }
    }
  }
)
```

## 安全与隐私

### 权限控制

- 只有消息的发送方或接收方可以查看阅读状态
- 只有接收方可以标记消息为已读
- 只有发送方可以撤回消息(2分钟内)

### 数据保护

- 阅读记录最多保留10条
- 敏感操作记录日志
- 支持用户查询自己的阅读记录

## 测试用例

### 1. 基础已读测试
- 发送消息
- 接收方查看消息
- 验证is_read为true
- 验证receiver_read_at有值
- 验证read_records有记录

### 2. 多端同步测试
- APP发送消息
- 微信小程序查看
- H5查看阅读状态
- 验证所有端显示正确

### 3. 批量标记测试
- 发送多条未读消息
- 调用批量标记接口
- 验证所有消息状态更新

### 4. 阅读记录测试
- 同一消息多次查看
- 验证read_records正确记录
- 验证只保留最近10条

## 部署说明

### 1. 数据库迁移

```bash
# 更新Message模型
# 添加新字段:
# - sender_read_at
# - receiver_read_at
# - read_records
```

### 2. API更新

重启后端服务,新的API接口自动生效。

### 3. 前端更新

更新Taro小程序代码:
1. 更新request.ts,添加平台和设备信息
2. 更新chat.ts,使用新的接口
3. 更新UI,显示已读状态

### 4. 测试

- 测试各端消息发送
- 测试消息阅读状态
- 测试多端同步
- 测试实时推送

## 总结

✅ **已实现功能**:
- 双向阅读状态追踪
- 多平台支持(APP/小程序/微信/H5)
- 阅读记录完整追踪
- 自动标记已读
- 实时状态同步
- 批量查询支持
- 聊天列表未读统计

✅ **核心优势**:
- 完整的消息状态追踪
- 多端无缝同步
- 高性能批量操作
- 完善的权限控制
- 可扩展的架构设计

该功能已完整实现,支持APP、小程序、微信小程序、H5等多端的消息已读/未读状态同步! 🎉
