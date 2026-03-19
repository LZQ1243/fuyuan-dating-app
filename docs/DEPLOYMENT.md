# 赴缘婚恋社交平台 - 部署手册

## 目录

- [环境要求](#环境要求)
- [Docker部署](#docker部署)
- [手动部署](#手动部署)
- [配置说明](#配置说明)
- [常见问题](#常见问题)

## 环境要求

### 最低配置

- **操作系统**: Linux (Ubuntu 20.04+ 推荐)
- **CPU**: 2核
- **内存**: 4GB
- **磁盘**: 50GB SSD
- **网络**: 公网IP

### 推荐配置

- **CPU**: 4核
- **内存**: 8GB
- **磁盘**: 100GB SSD

### 软件依赖

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+ (手动部署)
- MongoDB 4.4+
- Redis 6.0+
- Nginx 1.20+

## Docker部署 (推荐)

### 1. 克隆项目

```bash
git clone <repository-url>
cd 赴缘婚恋应用开发
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cd backend
cp .env.example .env

# 编辑.env文件，修改以下关键配置
vim .env
```

必须修改的配置：

```env
# 服务器配置
PORT=3000
NODE_ENV=production

# JWT密钥（必须修改为随机字符串）
JWT_SECRET=your-very-secret-random-key-change-in-production

# 数据库连接（Docker环境）
MONGODB_URI=mongodb://mongodb:27017/fuyuan
REDIS_HOST=redis
REDIS_PORT=6379

# RabbitMQ连接
RABBITMQ_URL=amqp://admin:admin123@rabbitmq:5672

# 敏感词库路径
SENSITIVE_WORDS_PATH=./config/sensitive-words.txt
```

### 3. 构建并启动服务

```bash
# 返回项目根目录
cd ../docker

# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f backend
```

### 4. 初始化敏感词库

```bash
# 敏感词文件已存在于 backend/config/sensitive-words.txt
# 后端启动时会自动加载
```

### 5. 验证部署

```bash
# 检查后端API
curl http://localhost:3000/api

# 检查MongoDB连接
docker exec -it fuyuan-mongodb mongosh -u admin -p admin123

# 检查Redis连接
docker exec -it fuyuan-redis redis-cli
> PING
```

## 手动部署

### 1. 安装依赖

```bash
# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# 安装Redis
sudo apt-get install -y redis-server

# 安装RabbitMQ
sudo apt-get install -y erlang
sudo apt-get install -y rabbitmq-server
```

### 2. 配置MongoDB

```bash
# 启动MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# 创建数据库用户
mongosh
> use fuyuan
> db.createUser({
    user: "fuyuan",
    pwd: "your-password",
    roles: ["readWrite"]
})
```

### 3. 配置Redis

```bash
# 启动Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# 设置密码（可选）
sudo vim /etc/redis/redis.conf
# 取消注释并修改: requirepass your-password
sudo systemctl restart redis-server
```

### 4. 配置RabbitMQ

```bash
# 启动RabbitMQ
sudo systemctl start rabbitmq-server
sudo systemctl enable rabbitmq-server

# 启用管理插件
sudo rabbitmq-plugins enable rabbitmq_management

# 创建用户
sudo rabbitmqctl add_user admin admin123
sudo rabbitmqctl set_user_tags admin administrator
sudo rabbitmqctl set_permissions -p / admin ".*" ".*" ".*"
```

### 5. 部署后端

```bash
cd backend

# 安装依赖
npm install --production

# 创建必要目录
mkdir -p uploads logs config

# 配置环境变量
cp .env.example .env
vim .env

# 修改以下配置
MONGODB_URI=mongodb://fuyuan:your-password@localhost:27017/fuyuan
REDIS_HOST=localhost
REDIS_PASSWORD=your-password
RABBITMQ_URL=amqp://admin:admin123@localhost:5672

# 使用PM2启动（推荐）
npm install -g pm2
pm2 start src/app.js --name fuyuan-backend

# 或直接启动
npm start
```

### 6. 配置Nginx

```bash
# 安装Nginx
sudo apt-get install -y nginx

# 复制配置文件
sudo cp docker/nginx/nginx.conf /etc/nginx/nginx.conf
sudo cp docker/nginx/conf.d/default.conf /etc/nginx/conf.d/

# 根据实际情况修改配置
sudo vim /etc/nginx/conf.d/default.conf

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 7. 部署前端（H5）

```bash
cd frontend

# 安装依赖
npm install

# 构建生产版本
npm run build:h5

# 将dist目录内容复制到Nginx目录
sudo cp -r dist/build/h5/* /var/www/html/

# 重启Nginx
sudo systemctl restart nginx
```

### 8. 部署管理后台

```bash
cd admin

# 安装依赖
npm install

# 构建生产版本
npm run build

# 配置Nginx
sudo vim /etc/nginx/conf.d/admin.conf
```

添加以下配置：

```nginx
server {
    listen 80;
    server_name admin.fuyuan.com;

    root /var/www/admin;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# 复制构建文件
sudo cp -r dist/* /var/www/admin/

# 重启Nginx
sudo systemctl restart nginx
```

## 配置说明

### 后端环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| PORT | 服务端口 | 3000 |
| NODE_ENV | 运行环境 | development |
| MONGODB_URI | MongoDB连接串 | mongodb://localhost:27017/fuyuan |
| REDIS_HOST | Redis主机 | localhost |
| REDIS_PORT | Redis端口 | 6379 |
| REDIS_PASSWORD | Redis密码 | - |
| RABBITMQ_URL | RabbitMQ连接串 | amqp://localhost:5672 |
| JWT_SECRET | JWT密钥 | - |
| JWT_EXPIRES_IN | Token过期时间 | 7d |

### 前端配置

修改 `frontend/manifest.json`:

```json
{
  "mp-weixin": {
    "appid": "你的微信小程序AppID"
  }
}
```

修改API地址（如需要）:

```javascript
// frontend/api/index.js
const BASE_URL = 'http://your-domain.com/api'
```

## 常见问题

### 1. MongoDB连接失败

```bash
# 检查MongoDB状态
sudo systemctl status mongod

# 查看日志
sudo tail -f /var/log/mongodb/mongod.log

# 检查端口占用
sudo netstat -tlnp | grep 27017
```

### 2. Redis连接失败

```bash
# 测试连接
redis-cli ping

# 检查状态
sudo systemctl status redis-server
```

### 3. 端口被占用

```bash
# 查看端口占用
sudo netstat -tlnp | grep 3000

# 停止占用端口的进程
sudo kill -9 <PID>
```

### 4. 权限问题

```bash
# 调整文件权限
sudo chown -R $USER:$USER /path/to/project
sudo chmod -R 755 /path/to/project
```

### 5. 内存不足

```bash
# 检查内存使用
free -h

# 清理缓存
sudo sync
sudo echo 3 > /proc/sys/vm/drop_caches
```

### 6. SSL证书配置

```bash
# 使用Let's Encrypt
sudo apt-get install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d fuyuan.com -d www.fuyuan.com

# 自动续期
sudo certbot renew --dry-run
```

## 监控和维护

### 日志查看

```bash
# Docker环境
docker-compose logs -f backend

# PM2环境
pm2 logs fuyuan-backend

# 查看Nginx日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 数据备份

```bash
# MongoDB备份
docker exec fuyuan-mongodb mongodump --out /backup/mongodb

# 定时备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec fuyuan-mongodb mongodump --out /backup/mongodb_$DATE
tar -czf /backup/mongodb_$DATE.tar.gz /backup/mongodb_$DATE
find /backup -name "mongodb_*" -mtime +7 -delete
```

### 性能监控

推荐使用以下工具：
- Prometheus + Grafana
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Datadog

## 安全建议

1. **修改默认密码**: 所有服务的默认密码必须修改
2. **配置防火墙**: 只开放必要的端口
3. **启用HTTPS**: 使用SSL证书加密传输
4. **定期更新**: 及时更新系统和依赖包
5. **备份策略**: 建立完善的备份和恢复机制
6. **监控告警**: 配置异常监控和告警通知

## 技术支持

如遇问题，请联系：
- Email: support@fuyuan.com
- GitHub Issues: https://github.com/your-repo/issues
