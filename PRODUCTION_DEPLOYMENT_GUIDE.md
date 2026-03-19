# 赴缘婚恋应用 - 生产环境部署指南

## 📋 目录
- [环境要求](#环境要求)
- [部署架构](#部署架构)
- [快速部署](#快速部署)
- [详细配置](#详细配置)
- [安全配置](#安全配置)
- [性能优化](#性能优化)
- [监控告警](#监控告警)
- [备份恢复](#备份恢复)
- [故障排查](#故障排查)

---

## 环境要求

### 服务器配置
- **操作系统**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **CPU**: 4核心以上
- **内存**: 8GB以上
- **磁盘**: 100GB以上SSD
- **带宽**: 10Mbps以上

### 软件要求
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Nginx**: 1.20+ (通过Docker)
- **Git**: 2.30+

### 域名要求
- 主域名: `fuyuan.com` (或你的域名)
- API域名: `api.fuyuan.com` (可选)
- 管理域名: `admin.fuyuan.com` (可选)

---

## 部署架构

### 架构图
```
                        ┌─────────────┐
                        │   DNS      │
                        └──────┬──────┘
                               │
                        ┌──────▼──────┐
                        │   Nginx     │
                        │   (反向代理) │
                        └──────┬──────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
       ┌──────▼──────┐  ┌───▼────┐   ┌────▼────┐
       │   Frontend   │  │ Backend │   │  Admin  │
       │   (静态文件)  │  │ (API)   │   │ (管理)  │
       └──────────────┘  └───┬────┘   └─────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
       ┌──────▼──────┐  ┌──▼──────────┐  ┌─▼─────┐
       │  MongoDB    │  │   Redis    │  │RabbitMQ│
       │  (数据库)   │  │  (缓存)    │  │(队列)  │
       └─────────────┘  └────────────┘  └────────┘
```

### 服务说明

| 服务 | 端口 | 说明 |
|------|------|------|
| Nginx | 80, 443 | 反向代理、静态文件服务 |
| Backend | 3000 | API服务 |
| Frontend | 80 | React前端应用 |
| Admin | 80 | 管理后台 |
| MongoDB | 27017 | 主数据库 |
| Redis | 6379 | 缓存、会话 |
| RabbitMQ | 5672, 15672 | 消息队列 |

---

## 快速部署

### 1. 克隆代码
```bash
git clone https://github.com/your-repo/fuyuan-dating-app.git
cd fuyuan-dating-app
```

### 2. 配置环境变量
```bash
# 复制环境变量模板
cp docker/.env.production docker/.env

# 编辑环境变量
vim docker/.env
```

**必须修改的配置**:
```bash
# 数据库密码
MONGO_ROOT_PASSWORD=your_secure_password_here

# Redis密码
REDIS_PASSWORD=your_secure_password_here

# JWT密钥 (必须是长随机字符串)
JWT_SECRET=your_very_long_and_secure_random_string_at_least_32_chars

# 应用密钥
SESSION_SECRET=your_session_secret_here

# 签名密钥
SIGNATURE_SECRET=your_signature_secret_here
```

### 3. 配置SSL证书
```bash
# 创建SSL目录
mkdir -p docker/ssl

# 方式1: 使用Let's Encrypt免费证书
sudo apt-get install certbot
sudo certbot certonly --standalone -d fuyuan.com -d www.fuyuan.com
sudo cp /etc/letsencrypt/live/fuyuan.com/fullchain.pem docker/ssl/cert.pem
sudo cp /etc/letsencrypt/live/fuyuan.com/privkey.pem docker/ssl/key.pem

# 方式2: 使用已有证书
cp your-cert.pem docker/ssl/cert.pem
cp your-key.pem docker/ssl/key.pem

# 方式3: 生成自签名证书(仅测试用)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout docker/ssl/key.pem \
  -out docker/ssl/cert.pem
```

### 4. 一键部署
```bash
# 给部署脚本添加执行权限
chmod +x scripts/deploy.sh

# 执行部署
./scripts/deploy.sh deploy
```

### 5. 验证部署
```bash
# 检查服务状态
docker-compose -f docker/docker-compose.yml ps

# 健康检查
./scripts/deploy.sh health

# 查看日志
./scripts/deploy.sh logs
```

---

## 详细配置

### Nginx配置
配置文件: `docker/nginx/nginx.conf`

**主要配置项**:
```nginx
# 限流配置
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=30r/s;
limit_conn_zone $binary_remote_addr zone=addr:10m;

# 缓存配置
proxy_cache_path /var/cache/nginx/api_cache levels=1:2
  keys_zone=api_cache:10m max_size=1g inactive=60m;

# SSL配置
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;

# 安全头
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
```

### Docker Compose配置
配置文件: `docker/docker-compose.yml`

**主要配置项**:
```yaml
services:
  # 资源限制
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G

  # 健康检查
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### 后端配置
配置文件: `backend/config/default.js`

**主要配置项**:
```javascript
module.exports = {
  // 服务器配置
  server: {
    port: process.env.PORT || 3000,
    host: '0.0.0.0'
  },

  // 数据库配置
  database: {
    uri: process.env.MONGODB_URI,
    options: {
      maxPoolSize: 100,
      minPoolSize: 10,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000
    }
  },

  // Redis配置
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => Math.min(times * 50, 2000)
  },

  // 安全配置
  security: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: '7d',
    bcryptRounds: 12,
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 100
    }
  },

  // 日志配置
  logging: {
    level: 'info',
    format: 'json',
    transports: [
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error'
      }),
      new winston.transports.File({
        filename: 'logs/combined.log'
      })
    ]
  }
};
```

---

## 安全配置

### 1. 防火墙配置
```bash
# 使用ufw配置防火墙
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
sudo ufw status
```

### 2. SSH安全配置
```bash
# 编辑SSH配置
sudo vim /etc/ssh/sshd_config

# 修改以下配置
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
Port 22222  # 改为非标准端口

# 重启SSH服务
sudo systemctl restart sshd
```

### 3. 数据库安全
```bash
# MongoDB安全
# 1. 启用认证
# 2. 使用强密码
# 3. 限制远程访问
# 4. 定期备份

# Redis安全
# 1. 设置密码
# 2. 禁用危险命令
# 3. 绑定本地网络
# 4. 定期备份
```

### 4. 应用安全
```bash
# 1. 使用HTTPS
# 2. 实施请求签名
# 3. 启用CSP
# 4. 配置CORS
# 5. 实施限流
# 6. 定期更新依赖
```

---

## 性能优化

### 1. 数据库优化
```javascript
// 创建索引
db.users.createIndex({ phone: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });
db.moments.createIndex({ userId: 1, createdAt: -1 });
db.matches.createIndex({ userId1: 1, userId2: 1, status: 1 });
```

### 2. Redis优化
```bash
# 配置Redis
vim /etc/redis/redis.conf

# 优化项
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

### 3. Nginx优化
```nginx
# 工作进程数
worker_processes auto;
worker_connections 4096;

# 启用缓存
proxy_cache api_cache;
proxy_cache_valid 200 5m;
proxy_cache_bypass $http_cache_control;

# 启用压缩
gzip on;
gzip_comp_level 6;
gzip_types text/plain text/css application/json;
```

### 4. 应用优化
```javascript
// 启用连接池
const db = await mongoose.connect(uri, {
  maxPoolSize: 100,
  minPoolSize: 10
});

// 启用查询缓存
await User.findById(id).cache(600); // 缓存10分钟

// 使用聚合管道优化查询
const results = await Model.aggregate([
  { $match: { status: 'active' } },
  { $group: { _id: '$type', count: { $sum: 1 } } }
]);
```

---

## 监控告警

### 1. 应用监控
**监控工具**: Prometheus + Grafana

**监控指标**:
- API响应时间 (P50, P90, P95, P99)
- 请求吞吐量 (RPS, QPS)
- 错误率 (4xx, 5xx)
- 系统资源 (CPU, 内存, 磁盘, 网络)

**配置**:
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'backend'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['backend:3000']
```

### 2. 日志监控
**监控工具**: ELK Stack (Elasticsearch + Logstash + Kibana)

**日志级别**:
- ERROR: 错误日志
- WARN: 警告日志
- INFO: 信息日志
- DEBUG: 调试日志

### 3. 错误追踪
**监控工具**: Sentry

**配置**:
```javascript
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: 'https://xxx@sentry.io/xxx',
  environment: 'production',
  tracesSampleRate: 0.1
});

// 自动捕获错误
app.use(Sentry.Handlers.errorHandler());
```

### 4. 告警配置
**告警渠道**: 邮件、短信、Slack、钉钉

**告警规则**:
- API错误率 > 5%
- 响应时间 > 1s
- CPU使用率 > 80%
- 内存使用率 > 90%
- 磁盘使用率 > 85%

---

## 备份恢复

### 1. 数据备份
```bash
# MongoDB备份
docker exec fuyuan-mongodb mongodump --host localhost --port 27017 \
  --db fuyuan --username admin --password xxx \
  --out /data/backup/$(date +%Y%m%d)

# Redis备份
docker exec fuyuan-redis redis-cli --rdb /data/backup-$(date +%Y%m%d).rdb

# 文件备份
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz uploads/

# 使用部署脚本备份
./scripts/deploy.sh backup
```

### 2. 自动备份
```bash
# 添加到crontab
crontab -e

# 每天凌晨2点备份
0 2 * * * cd /path/to/fuyuan && ./scripts/deploy.sh backup

# 保留最近30天的备份
0 3 * * * find /path/to/backups -name "*.tar.gz" -mtime +30 -delete
```

### 3. 数据恢复
```bash
# MongoDB恢复
docker exec fuyuan-mongodb mongorestore --host localhost --port 27017 \
  --db fuyuan /data/backup/20240320

# Redis恢复
docker cp backup-20240320.rdb fuyuan-redis:/data/dump.rdb
docker restart fuyuan-redis

# 文件恢复
tar -xzf uploads-backup-20240320.tar.gz
```

---

## 故障排查

### 1. 服务无法启动
```bash
# 查看日志
./scripts/deploy.sh logs

# 检查容器状态
docker-compose -f docker/docker-compose.yml ps

# 检查端口占用
netstat -tlnp | grep -E ':(80|443|3000|27017|6379)'

# 重启服务
docker-compose -f docker/docker-compose.yml restart
```

### 2. 数据库连接失败
```bash
# 检查MongoDB状态
docker exec fuyuan-mongodb mongo --eval "db.serverStatus()"

# 检查连接数
docker exec fuyuan-mongodb mongo --eval "db.serverStatus().connections"

# 检查日志
docker logs fuyuan-mongodb
```

### 3. 缓存问题
```bash
# 检查Redis状态
docker exec fuyuan-redis redis-cli ping

# 查看Redis信息
docker exec fuyuan-redis redis-cli info

# 清空缓存
docker exec fuyuan-redis redis-cli FLUSHALL
```

### 4. 性能问题
```bash
# 查看系统资源
top
htop
iostat
free -m

# 查看Nginx状态
curl http://localhost/nginx_status

# 查看应用指标
curl http://localhost:3000/metrics
```

### 5. 常见错误

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| ECONNREFUSED | 端口未开放 | 检查防火墙配置 |
| MongoDB连接失败 | 连接数过多 | 增加连接池大小 |
| Redis连接失败 | 密码错误 | 检查Redis密码配置 |
| 502 Bad Gateway | 后端服务未启动 | 重启后端服务 |
| 504 Gateway Timeout | 请求超时 | 增加Nginx超时时间 |

---

## 维护建议

### 日常维护
- 每天检查服务日志
- 每周查看系统资源使用情况
- 每月执行一次完整备份
- 定期更新系统和软件

### 安全维护
- 每月更新依赖包
- 定期更改密码
- 监控安全日志
- 定期安全扫描

### 性能维护
- 定期分析慢查询
- 监控缓存命中率
- 优化数据库索引
- 清理过期数据

---

## 联系支持

如有问题,请联系:
- 技术支持: support@fuyuan.com
- 紧急电话: +86-xxx-xxxx-xxxx
- 文档: https://docs.fuyuan.com

---

**最后更新**: 2026-03-20
**版本**: v1.0.0
