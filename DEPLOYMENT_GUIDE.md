# 赴缘婚恋应用 - 通用部署指南

本指南适用于将应用部署到任何支持Docker的服务器（云服务器、VPS、裸机等）。

---

## 📋 部署前准备

### 1. 系统要求

- **操作系统**: Linux (Ubuntu 20.04+ / CentOS 8+ / Debian 10+) 或 Windows
- **内存**: 最小 4GB，推荐 8GB+
- **磁盘**: 最小 20GB，推荐 50GB+
- **CPU**: 最小 2核，推荐 4核+

### 2. 软件要求

- **Docker**: 20.10+
- **Docker Compose**: 2.0+

### 3. 网络端口

确保以下端口可用：

| 端口 | 服务 | 说明 |
|------|------|------|
| 80 | HTTP | Nginx前端服务 |
| 443 | HTTPS | Nginx安全连接（可选） |
| 3000 | Backend | 后端API（可选，通过Nginx代理） |
| 27017 | MongoDB | 数据库（可选，建议不暴露） |
| 6379 | Redis | 缓存（可选，建议不暴露） |
| 3306 | MySQL | 数据库（可选，建议不暴露） |
| 5672 | RabbitMQ | 消息队列（可选，建议不暴露） |
| 15672 | RabbitMQ管理 | 管理界面（可选，建议不暴露） |

---

## 🚀 快速部署

### Linux/Mac 系统

```bash
# 1. 克隆或上传项目到服务器
cd /opt
git clone <your-repo> fuyuan
cd fuyuan

# 2. 配置环境变量
cd docker
cp .env.production.example .env.production
nano .env.production  # 编辑配置文件

# 3. 启动服务
chmod +x deploy.sh
./deploy.sh start

# 4. 查看日志
./deploy.sh logs
```

### Windows 系统

```powershell
# 1. 上传项目到服务器

# 2. 配置环境变量
cd docker
cp .env.production.example .env.production
notepad .env.production  # 编辑配置文件

# 3. 启动服务
.\deploy.ps1 start

# 4. 查看日志
.\deploy.ps1 logs
```

---

## ⚙️ 环境变量配置

### 必须修改的配置

编辑 `docker/.env.production` 文件，修改以下关键配置：

#### 1. 数据库密码

```bash
# MongoDB
MONGO_ROOT_PASSWORD=your-strong-mongodb-password-here

# MySQL
MYSQL_ROOT_PASSWORD=your-strong-mysql-password-here
MYSQL_PASSWORD=your-strong-mysql-user-password-here

# Redis
REDIS_PASSWORD=your-strong-redis-password-here

# RabbitMQ
RABBITMQ_PASSWORD=your-strong-rabbitmq-password-here
```

#### 2. JWT密钥

```bash
# 使用以下命令生成随机密钥:
# openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long

# JWT过期时间
JWT_EXPIRES_IN=7d
```

#### 3. 管理员密码

```bash
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-strong-admin-password-here
```

### 可选配置

#### 1. 端口配置

如果需要修改默认端口：

```bash
BACKEND_PORT=3000
FRONTEND_PORT=80
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443
```

#### 2. 域名配置

如果使用自定义域名，修改 `backend/.env.production`:

```bash
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

#### 3. 云存储配置（如使用）

```bash
OSS_ACCESS_KEY=your_access_key
OSS_SECRET_KEY=your_secret_key
OSS_BUCKET=your_bucket_name
OSS_REGION=ap-guangzhou
```

#### 4. AI服务配置（如使用）

```bash
ALIYUN_ASR_APPKEY=your_appkey
ALIYUN_ASR_TOKEN=your_token
TENCENT_FACE_API_KEY=your_api_key
```

---

## 🔐 安全配置

### 1. 配置防火墙

#### Ubuntu/Debian (UFW)

```bash
# 允许SSH
ufw allow 22/tcp

# 允许HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# 启用防火墙
ufw enable

# 查看状态
ufw status
```

#### CentOS (firewalld)

```bash
# 允许SSH
firewall-cmd --permanent --add-service=ssh

# 允许HTTP/HTTPS
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https

# 重载配置
firewall-cmd --reload

# 查看状态
firewall-cmd --list-all
```

### 2. 配置SSL/HTTPS

#### 使用Let's Encrypt免费证书

```bash
# 安装Certbot
apt-get install certbot python3-certbot-nginx

# 获取证书（替换为你的域名）
certbot --nginx -d your-domain.com -d www.your-domain.com

# 自动续期
certbot renew --dry-run
```

#### 使用自签名证书（测试用）

```bash
# 创建SSL目录
mkdir -p docker/ssl
cd docker/ssl

# 生成自签名证书
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout privkey.pem -out fullchain.pem

# 编辑nginx配置启用HTTPS
nano nginx/nginx.conf
```

### 3. 数据库安全

#### MongoDB

生产环境建议：
- 使用强密码
- 不暴露27017端口
- 限制访问IP

```bash
# 修改docker-compose.yml，移除端口映射或限制访问
ports:
  - "127.0.0.1:27017:27017"  # 仅本地访问
```

#### MySQL

生产环境建议：
- 使用强密码
- 不暴露3306端口
- 限制访问IP

```bash
# 修改docker-compose.yml
ports:
  - "127.0.0.1:3306:3306"  # 仅本地访问
```

---

## 📊 监控和维护

### 1. 查看服务状态

```bash
# 查看所有容器状态
docker-compose -f docker/docker-compose.production.yml ps

# 查看特定服务
docker ps | grep fuyuan
```

### 2. 查看日志

```bash
# 查看所有服务日志
./deploy.sh logs

# 查看特定服务日志
./deploy.sh logs backend
./deploy.sh logs frontend
./deploy.sh logs nginx
```

### 3. 资源监控

```bash
# 查看容器资源使用
docker stats

# 查看磁盘使用
docker system df

# 查看镜像大小
docker images
```

### 4. 数据备份

#### MongoDB备份

```bash
# 备份
docker exec fuyuan-mongodb mongodump --authenticationDatabase admin \
  -u admin -p YOUR_PASSWORD --out /backup/$(date +%Y%m%d)

# 恢复
docker exec -i fuyuan-mongodb mongorestore --authenticationDatabase admin \
  -u admin -p YOUR_PASSWORD --drop /backup/20250318
```

#### MySQL备份

```bash
# 备份
docker exec fuyuan-mysql mysqldump -u root -pYOUR_PASSWORD fuyuan > backup.sql

# 恢复
docker exec -i fuyuan-mysql mysql -u root -pYOUR_PASSWORD fuyuan < backup.sql
```

#### Redis备份

```bash
# 备份
docker exec fuyuan-mongodb redis-cli -a YOUR_PASSWORD SAVE
docker cp fuyuan-redis:/data/dump.rdb backup/

# 恢复
docker cp backup/dump.rdb fuyuan-redis:/data/dump.rdb
docker restart fuyuan-redis
```

---

## 🔄 更新和升级

### 1. 更新代码

```bash
# 拉取最新代码
git pull

# 重新构建并启动
./deploy.sh restart
```

### 2. 仅更新镜像

```bash
# 拉取最新镜像
./deploy.sh build

# 重启服务
./deploy.sh restart
```

### 3. 数据库迁移

如果有数据库结构变更：

```bash
# 连接到MongoDB
docker exec -it fuyuan-mongodb mongosh \
  -u admin -p YOUR_PASSWORD --authenticationDatabase admin

# 执行迁移脚本
# ...

# 连接到MySQL
docker exec -it fuyuan-mysql mysql -u root -p YOUR_PASSWORD

# 执行迁移脚本
# ...
```

---

## 🐛 故障排除

### 1. 服务无法启动

```bash
# 查看详细日志
./deploy.sh logs [service-name]

# 检查容器状态
docker-compose -f docker/docker-compose.production.yml ps

# 重启特定服务
docker-compose -f docker/docker-compose.production.yml restart [service-name]
```

### 2. 数据库连接失败

检查环境变量配置：
```bash
# 查看环境变量
docker-compose -f docker/docker-compose.production.yml config

# 测试数据库连接
docker exec -it fuyuan-backend node -e "
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected!');
"
```

### 3. 端口被占用

```bash
# 查看端口占用
netstat -tulpn | grep :80
netstat -tulpn | grep :3000

# 停止占用端口的进程
kill -9 <PID>
```

### 4. 磁盘空间不足

```bash
# 清理Docker未使用的资源
docker system prune -a

# 清理所有镜像（慎用）
docker system prune -a --volumes
```

### 5. 内存不足

```bash
# 限制容器内存使用
# 编辑docker-compose.yml，添加限制
services:
  backend:
    mem_limit: 1g
    memswap_limit: 1g
```

---

## 📱 访问应用

部署成功后，可以通过以下地址访问：

- **前端应用**: http://your-server-ip 或 http://your-domain.com
- **后端API**: http://your-server-ip/api
- **RabbitMQ管理**: http://your-server-ip:15672 (admin / RABBITMQ_PASSWORD)

---

## 🔧 常用操作

### 重启所有服务

```bash
./deploy.sh restart
```

### 重启特定服务

```bash
docker-compose -f docker/docker-compose.production.yml restart backend
```

### 停止所有服务

```bash
./deploy.sh stop
```

### 完全清理（删除所有数据）

```bash
./deploy.sh clean
```

### 进入容器

```bash
# 进入后端容器
docker exec -it fuyuan-backend sh

# 进入MongoDB
docker exec -it fuyuan-mongodb mongosh \
  -u admin -p YOUR_PASSWORD --authenticationDatabase admin

# 进入Redis
docker exec -it fuyuan-redis redis-cli -a YOUR_PASSWORD
```

---

## 🌐 不同部署场景

### 1. 云服务器部署（阿里云/腾讯云/华为云）

1. 购买云服务器（2核4GB以上）
2. 安装Docker和Docker Compose
3. 按照上述步骤部署
4. 配置安全组开放80/443端口
5. 配置域名解析

### 2. VPS部署

1. 购买VPS（如DigitalOcean、Linode）
2. SSH连接到服务器
3. 安装Docker
4. 部署应用

### 3. 本地服务器部署

适用于内网环境，步骤与云服务器相同。

### 4. Kubernetes部署（高级）

如需部署到Kubernetes集群，可以使用提供的Dockerfile和配置文件创建K8s资源文件。

---

## 📞 获取帮助

如遇到问题：

1. 查看日志: `./deploy.sh logs`
2. 检查文档: 查看 `DEPLOYMENT_GUIDE.md`
3. 查看GitHub Issues

---

## 📝 附录

### Docker Compose命令速查

```bash
# 启动
docker-compose -f docker/docker-compose.production.yml up -d

# 停止
docker-compose -f docker/docker-compose.production.yml down

# 重启
docker-compose -f docker/docker-compose.production.yml restart

# 查看日志
docker-compose -f docker/docker-compose.production.yml logs -f

# 查看状态
docker-compose -f docker/docker-compose.production.yml ps

# 构建镜像
docker-compose -f docker/docker-compose.production.yml build
```

### 环境变量参考

完整的环境变量列表请参考：
- `docker/.env.production.example`
- `backend/.env.production`

---

**最后更新**: 2026-03-18
**维护**: Fuyuan Team
