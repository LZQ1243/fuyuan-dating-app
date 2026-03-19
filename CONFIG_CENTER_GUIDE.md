# 统一配置管理中心指南

## 📋 概述

统一配置管理中心是整个应用的核心配置入口，负责所有服务对接和配置的统一管理。

## ✨ 核心特性

### 1. 统一入口
- ✅ 所有配置通过单一入口管理
- ✅ 避免配置分散和重复
- ✅ 确保配置的一致性

### 2. 实时生效
- ✅ 配置更新立即生效
- ✅ 支持配置热重载
- ✅ 无需重启应用

### 3. 智能验证
- ✅ 自动验证配置合法性
- ✅ 及早发现配置错误
- ✅ 防止无效配置

### 4. 健康检查
- ✅ 实时监控配置状态
- ✅ 自动检测配置问题
- ✅ 提供详细的诊断信息

### 5. 配置导入导出
- ✅ 支持配置导出
- ✅ 支持配置导入
- ✅ 方便配置迁移和备份

### 6. 无延迟互通
- ✅ 配置零延迟同步
- ✅ 所有服务即时获取最新配置
- ✅ 确保配置的一致性和实时性

## 🚀 快速开始

### 1. 初始化配置中心

在应用启动时，配置中心会自动初始化：

```javascript
const config = require('./config');

// 初始化（自动执行）
await config.initConfig();
```

### 2. 使用配置

```javascript
// 获取数据库配置
const dbConfig = config.getDatabaseConfig();
console.log('数据库URI:', dbConfig.uri);

// 获取Redis配置
const redisConfig = config.getRedisConfig();
console.log('Redis URI:', redisConfig.uri);

// 获取认证配置
const authConfig = config.getAuthConfig();
console.log('JWT密钥:', authConfig.jwt.secret);
```

### 3. 更新配置

```javascript
// 更新数据库配置
await config.updateConfig('database', {
  uri: 'mongodb://new-uri',
  type: 'mongodb'
});
```

### 4. 监听配置变化

```javascript
// 监听数据库配置变化
config.onConfigChange('database', (source, newConfig) => {
  console.log('数据库配置已更新:', newConfig);

  // 重新连接数据库
  reconnectDatabase(newConfig);
});
```

## 📊 配置模块

### 1. 环境配置

```javascript
const envConfig = config.getEnvironmentConfig();
```

包含：
- NODE_ENV - 运行环境
- PORT - 端口号
- HOST - 主机地址

### 2. 数据库配置

```javascript
const dbConfig = config.getDatabaseConfig();
```

包含：
- uri - 数据库连接URI
- type - 数据库类型
- pool - 连接池配置
- aux - 辅助数据库配置

### 3. Redis配置

```javascript
const redisConfig = config.getRedisConfig();
```

包含：
- uri - Redis连接URI
- options - 连接选项

### 4. 认证配置

```javascript
const authConfig = config.getAuthConfig();
```

包含：
- jwt - JWT配置
- admin - 管理员配置

### 5. 安全配置

```javascript
const securityConfig = config.getSecurityConfig();
```

包含：
- cors - CORS配置
- rateLimit - 限流配置
- helmet - 安全头配置

### 6. 上传配置

```javascript
const uploadConfig = config.getUploadConfig();
```

包含：
- maxSize - 最大文件大小
- allowedTypes - 允许的文件类型
- maxFiles - 最大文件数量

### 7. 存储配置

```javascript
const storageConfig = config.getStorageConfig();
```

包含：
- local - 本地存储配置
- cloud - 云存储配置

### 8. AI配置

```javascript
const aiConfig = config.getAIConfig();
```

包含：
- aliyunASR - 阿里云语音识别
- tencentFace - 腾讯人脸识别

### 9. 匹配配置

```javascript
const matchConfig = config.getMatchConfig();
```

包含：
- recommendLimit - 推荐数量限制
- weights - 匹配权重配置

### 10. 无障碍配置

```javascript
const accessibilityConfig = config.getAccessibilityConfig();
```

包含：
- fontSize - 字体大小
- highContrast - 高对比度模式

### 11. 第三方服务配置

```javascript
const thirdPartyConfig = config.getThirdPartyConfig();
```

包含：
- sms - 短信服务
- email - 邮件服务
- payment - 支付服务

## 🔌 API接口

### 获取配置摘要

```http
GET /api/config/summary
```

响应：
```json
{
  "code": 200,
  "message": "获取配置摘要成功",
  "data": {
    "initialized": true,
    "configCount": 11,
    "configNames": ["environment", "database", "redis", ...],
    "lastUpdate": 1710748800000
  }
}
```

### 健康检查

```http
GET /api/config/health
```

响应：
```json
{
  "code": 200,
  "message": "配置健康",
  "data": {
    "status": "healthy",
    "checks": [
      { "name": "database", "status": "ok", "type": "mongodb" },
      { "name": "redis", "status": "ok" },
      { "name": "auth", "status": "ok" }
    ],
    "timestamp": "2026-03-18T10:00:00.000Z"
  }
}
```

### 获取所有配置

```http
GET /api/config
```

响应：
```json
{
  "code": 200,
  "message": "获取配置成功",
  "data": {
    "environment": { ... },
    "database": { ... },
    "redis": { ... }
  }
}
```

### 获取特定配置

```http
GET /api/config/database
```

响应：
```json
{
  "code": 200,
  "message": "获取配置成功",
  "data": {
    "uri": "mongodb://localhost:27017/fuyuan",
    "type": "mongodb",
    "pool": { ... }
  }
}
```

### 更新配置

```http
PUT /api/config/database
Content-Type: application/json

{
  "uri": "mongodb://new-uri",
  "type": "mongodb",
  "pool": {
    "max": 30
  }
}
```

响应：
```json
{
  "code": 200,
  "message": "配置更新成功",
  "data": { ... }
}
```

### 重新加载配置

```http
POST /api/config/database/reload
```

响应：
```json
{
  "code": 200,
  "message": "配置重新加载成功",
  "data": { ... }
}
```

### 重新加载所有配置

```http
POST /api/config/reload/all
```

响应：
```json
{
  "code": 200,
  "message": "所有配置重新加载成功"
}
```

### 导出配置

```http
GET /api/config/export/all
```

响应：
```json
{
  "version": "1.0.0",
  "exportedAt": "2026-03-18T10:00:00.000Z",
  "configs": { ... }
}
```

### 导入配置

```http
POST /api/config/import/all
Content-Type: application/json

{
  "version": "1.0.0",
  "exportedAt": "2026-03-18T10:00:00.000Z",
  "configs": { ... }
}
```

响应：
```json
{
  "code": 200,
  "message": "配置导入成功"
}
```

## 📝 环境变量配置

完整的配置示例请参考：`backend/.env.config-center.example`

### 核心配置项

```bash
# 环境配置
NODE_ENV=production
PORT=3000

# 数据库配置
DATABASE_URI=mongodb://localhost:27017/fuyuan
DB_POOL_SIZE=20
DB_MIN_POOL_SIZE=5

# Redis配置
REDIS_URI=redis://localhost:6379

# JWT配置
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=7d

# 文件上传配置
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png

# 安全配置
ALLOWED_ORIGINS=*
RATE_LIMIT_MAX_REQUESTS=100

# 匹配配置
MATCH_RECOMMEND_LIMIT=20
MATCH_LEVEL_WEIGHT=40

# 无障碍配置
ACCESSIBILITY_FONT_SIZE=16
```

## 🛡️ 配置验证

配置中心会自动验证所有配置：

### 数据库验证
- ✅ URI不能为空
- ✅ 数据库类型必须识别
- ✅ 连接池配置必须合理

### 认证验证
- ✅ JWT密钥长度至少32字符
- ✅ 管理员密码不能是默认值

### 安全验证
- ✅ 限流配置必须有效
- ✅ CORS配置必须正确

## 🔄 配置热重载

### 自动重载

在开发环境中，配置中心会定期检查环境变量变化（每30秒）。

### 手动重载

```javascript
// 重新加载特定配置
await config.reloadConfig('database');

// 重新加载所有配置
await config.reloadAllConfigs();
```

### 通过API重载

```bash
# 重新加载数据库配置
curl -X POST http://localhost:3000/api/config/database/reload

# 重新加载所有配置
curl -X POST http://localhost:3000/api/config/reload/all
```

## 📊 配置监控

### 健康检查

```bash
curl http://localhost:3000/api/config/health
```

### 配置摘要

```bash
curl http://localhost:3000/api/config/summary
```

## 🔐 安全考虑

### 敏感信息隐藏

所有API响应都会自动隐藏敏感信息：
- 密码
- 密钥
- Token
- 访问密钥

### 配置权限

建议对配置管理API进行权限控制：
- 仅管理员可更新配置
- 普通用户仅可查看非敏感配置

## 🐛 故障排除

### 问题1: 配置初始化失败

**原因**: 环境变量未配置或配置无效

**解决**:
1. 检查 `.env` 文件是否存在
2. 检查环境变量是否正确配置
3. 查看错误日志获取详细信息

### 问题2: 配置更新不生效

**原因**: 配置未正确重载

**解决**:
```javascript
// 强制重新加载配置
await config.reloadConfig('source');
```

### 问题3: 配置验证失败

**原因**: 配置不符合要求

**解决**:
1. 检查配置格式是否正确
2. 确保必填字段已配置
3. 查看验证错误信息

### 问题4: 配置获取延迟

**原因**: 配置缓存未更新

**解决**:
```javascript
// 清除缓存，重新加载
await config.reloadConfig('source');
```

## 💡 最佳实践

1. **集中管理** - 所有配置统一在配置中心管理
2. **环境隔离** - 开发、测试、生产环境使用不同配置
3. **敏感保护** - 密码、密钥等敏感信息使用环境变量
4. **定期备份** - 定期导出配置备份
5. **版本控制** - 配置文件纳入版本控制（不包含敏感信息）
6. **监控告警** - 配置异常及时告警
7. **文档记录** - 重要配置变更记录文档

## 📚 更多文档

- [数据库通用支持指南](DATABASE_UNIVERSAL_GUIDE.md)
- [部署指南](DEPLOYMENT_GUIDE.md)
- [API文档](README.md)

---

**最后更新**: 2026-03-18
**维护**: Fuyuan Team
