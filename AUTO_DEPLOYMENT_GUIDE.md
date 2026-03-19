# 赴缘婚恋应用 - 全自动一键部署指南

## 📋 部署前准备

### 1. 服务器要求

- **操作系统**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **CPU**: 2核及以上
- **内存**: 4GB 及以上
- **磁盘**: 40GB 及以上
- **网络**: 公网 IP,开放 80/443/3000 端口

### 2. 本地环境要求

- **Linux/Mac**: Bash shell
- **Windows**: PowerShell 7+
- **SSH 客户端**: OpenSSH
- **网络**: 能访问服务器

---

## 🚀 一键部署

### Linux / macOS

```bash
# 1. 赋予执行权限
chmod +x deploy-universal.sh

# 2. 运行部署脚本
./deploy-universal.sh

# 3. 按提示输入服务器信息
```

### Windows (PowerShell)

```powershell
# 1. 以管理员身份运行 PowerShell
# 2. 运行部署脚本
.\deploy-universal.ps1

# 3. 按提示输入服务器信息
```

---

## 📝 配置说明

### 服务器信息

- **服务器地址**: 服务器的公网 IP 或域名
- **SSH 用户名**: 通常是 root
- **SSH 端口**: 默认 22
- **SSH 密码**: 服务器登录密码
- **SSH 密钥** (可选): 使用密钥登录则填写密钥路径

### 数据库选择

支持以下数据库类型:

- **mongodb**: MongoDB (默认)
- **mysql**: MySQL 8.0
- **postgresql**: PostgreSQL 15
- **sqlite**: SQLite (轻量级)
- **sqlserver**: SQL Server 2022

### 域名配置

- **域名**: 如 example.com (可选)
- **SSL 邮箱**: 申请 SSL 证书的邮箱地址

---

## 🔧 部署流程

脚本将自动执行以下操作:

1. ✅ 检测操作系统和依赖
2. ✅ 测试服务器连接
3. ✅ 安装基础环境 (Node.js, PM2, Docker)
4. ✅ 配置数据库 (自动生成密码)
5. ✅ 配置 Redis 和 RabbitMQ
6. ✅ 部署后端服务
7. ✅ 部署前端服务
8. ✅ 配置 Nginx 和 SSL
9. ✅ 配置防火墙
10. ✅ 健康检查
11. ✅ 生成部署报告

---

## 📊 部署后验证

### 1. 访问网站

```
http://your-domain.com
或
http://your-server-ip
```

### 2. 访问 API

```
http://your-domain.com/api/health
```

### 3. 查看服务状态

```bash
# SSH 登录服务器
ssh root@your-server-ip

# 查看 Docker 容器
docker ps

# 查看 PM2 进程
pm2 list

# 查看 Nginx 状态
sudo systemctl status nginx
```

### 4. 查看日志

```bash
# 后端日志
pm2 logs fuyuan-backend

# Nginx 日志
sudo tail -f /var/log/nginx/access.log

# Docker 日志
docker logs fuyuan-backend
```

---

## 🔐 重要凭证

部署完成后,所有重要凭证会保存在 `DEPLOYMENT_REPORT.md` 文件中,包括:

- 数据库密码
- Redis 密码
- RabbitMQ 密码
- JWT 密钥

**请妥善保管这些信息!**

---

## 🛠️ 常见问题

### 1. SSH 连接失败

- 检查服务器 IP 和端口是否正确
- 检查 SSH 密码是否正确
- 检查防火墙是否开放 22 端口

### 2. Docker 安装失败

- 确保服务器有足够的内存
- 检查网络连接
- 手动安装 Docker: `curl -fsSL https://get.docker.com | sh`

### 3. 数据库启动失败

- 检查磁盘空间是否足够
- 查看数据库日志: `docker logs fuyuan-mongodb`
- 尝试重启容器: `docker restart fuyuan-mongodb`

### 4. 端口被占用

```bash
# 查看端口占用
sudo netstat -tunlp | grep 3000

# 停止占用端口的进程
sudo kill -9 <PID>
```

---

## 🔄 更新部署

### 更新后端

```bash
# 1. 上传新代码到服务器
scp -r backend/* root@your-server-ip:/opt/fuyuan/backend/

# 2. SSH 登录服务器
ssh root@your-server-ip

# 3. 重启后端
cd /opt/fuyuan/backend
pm2 restart fuyuan-backend
```

### 更新前端

```bash
# 1. 上传新代码到服务器
scp -r frontend-react/* root@your-server-ip:/opt/fuyuan/frontend/

# 2. SSH 登录服务器
ssh root@your-server-ip

# 3. 重新构建
cd /opt/fuyuan/frontend
npm install
npm run build

# 4. 重启 Nginx
sudo systemctl reload nginx
```

---

## 📈 性能优化

### 1. 启用 Nginx 缓存

编辑 `/etc/nginx/nginx.conf`:

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g;

server {
    location /api {
        proxy_cache my_cache;
        proxy_cache_valid 200 60m;
        proxy_pass http://localhost:3000;
    }
}
```

### 2. 优化数据库

```bash
# MongoDB 索引优化
docker exec -it fuyuan-mongodb mongo
> use fuyuan
> db.users.createIndex({ phone: 1 }, { unique: true })
> db.users.createIndex({ nickname: 1 })
```

### 3. 启用 CDN

将静态资源部署到 CDN,减轻服务器压力。

---

## 🔒 安全加固

### 1. 修改默认密码

```bash
# 修改数据库密码
docker exec -it fuyuan-mongodb mongo admin
> db.changeUserPassword("admin", "new-password")

# 修改 Redis 密码
# 编辑 docker-compose.yml,更新 REDIS_PASSWORD
# 然后重启容器
```

### 2. 配置防火墙

```bash
# 只开放必要端口
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 3. 启用 HTTPS

使用 Let's Encrypt 免费证书:

```bash
sudo certbot --nginx -d your-domain.com --email your-email@example.com
```

---

## 📞 技术支持

如遇到问题:

1. 查看部署日志: `deploy-*.log`
2. 查看部署报告: `DEPLOYMENT_REPORT.md`
3. 查看服务日志: `pm2 logs`, `docker logs`
4. 联系技术支持

---

## 🎉 部署完成

恭喜!您已经成功部署了赴缘婚恋应用。

- **网站地址**: http://your-domain.com
- **管理后台**: http://your-domain.com/admin
- **API 文档**: http://your-domain.com/api/docs

祝您使用愉快! 🎊
