# 赴缘婚恋应用 - 全自动一键部署系统

## 🎯 特性

- ✅ **全平台兼容**: Linux / macOS / Windows
- ✅ **全云服务器**: 阿里云 / 腾讯云 / 华为云 / AWS / Azure 等
- ✅ **全数据库支持**: MongoDB / MySQL / PostgreSQL / SQLite / SQL Server / Oracle / Couchbase
- ✅ **全自动部署**: 自动安装环境、自动配置、自动启动
- ✅ **零配置部署**: 只需填写服务器信息,其他全自动
- ✅ **一键 SSL**: 自动申请和配置 HTTPS 证书
- ✅ **Docker 支持**: 容器化部署,易于管理
- ✅ **健康检查**: 自动检测服务状态

---

## 🚀 快速开始

### 方式一: 使用部署脚本 (推荐)

#### Linux / macOS

```bash
# 1. 下载项目
git clone <repository-url>
cd 赴缘婚恋应用开发

# 2. 赋予执行权限
chmod +x deploy-universal.sh

# 3. 运行部署
./deploy-universal.sh
```

#### Windows

```powershell
# 1. 下载项目
git clone <repository-url>
cd 赴缘婚恋应用开发

# 2. 运行部署脚本
.\deploy-universal.ps1

# 或使用快速部署批处理
QUICK_DEPLOY.bat
```

### 方式二: 使用 Docker Compose

```bash
# 1. 复制环境配置
cp .env.example .env

# 2. 编辑配置
vim .env

# 3. 一键启动
docker-compose -f docker-compose.universal.yml up -d
```

---

## 📋 部署配置

### 必填信息

```bash
服务器地址: 1.2.3.4
SSH 用户名: root
SSH 端口: 22
SSH 密码: ********
```

### 可选信息

```bash
数据库类型: mongodb (默认)
域名: example.com (可选)
SSL 邮箱: admin@example.com (可选)
```

---

## 🔧 支持的数据库

| 数据库 | 版本 | 说明 |
|--------|------|------|
| MongoDB | 6.0+ | 默认推荐,适合社交应用 |
| MySQL | 8.0 | 关系型数据库,成熟稳定 |
| PostgreSQL | 15 | 功能强大,扩展性好 |
| SQLite | 3.x | 轻量级,无需额外安装 |
| SQL Server | 2022 | 企业级数据库 |

---

## 📦 部署内容

### 后端服务

- **框架**: Node.js + Express
- **端口**: 3000
- **功能**: 用户认证、智能匹配、聊天、动态等

### 前端服务

- **框架**: React + Vite
- **端口**: 80 (HTTP) / 443 (HTTPS)
- **功能**: 用户界面、响应式设计

### 数据库

- **默认**: MongoDB
- **配置**: 自动初始化,自动优化

### 缓存服务

- **Redis**: 缓存、会话管理
- **RabbitMQ**: 消息队列、实时通信

### 代理服务

- **Nginx**: 反向代理、静态文件服务、SSL

---

## 🎨 自定义配置

### 修改部署路径

编辑 `DEPLOY_CONFIG.json`:

```json
{
  "services": {
    "backend": {
      "name": "fuyuan-backend",
      "port": 3000,
      "deployPath": "/custom/path"
    }
  }
}
```

### 修改数据库

在部署脚本运行时选择数据库类型:

```
请选择数据库类型 (默认: mongodb): mysql
```

### 配置域名

```
请输入域名 (留空则使用 IP): your-domain.com
```

---

## 📊 部署报告

部署完成后会生成 `DEPLOYMENT_REPORT.md`,包含:

- ✅ 部署信息 (时间、服务器、路径)
- ✅ 服务配置 (端口、状态)
- ✅ 数据库信息 (类型、密码)
- ✅ 访问地址 (网站、API)
- ✅ 重要凭证 (密码、密钥)

---

## 🔐 安全说明

### 自动生成的密码

- 数据库密码: 32位随机字符串
- Redis 密码: 32位随机字符串
- RabbitMQ 密码: 32位随机字符串
- JWT 密钥: 32位随机字符串

### 安全建议

1. 🔑 修改默认密码
2. 🔒 配置防火墙规则
3. 🔐 启用 HTTPS
4. 📝 定期备份数据
5. 👀 监控服务状态

---

## 🛠️ 维护操作

### 查看服务状态

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

### 查看日志

```bash
# 后端日志
pm2 logs fuyuan-backend

# Nginx 日志
sudo tail -f /var/log/nginx/access.log

# Docker 日志
docker logs fuyuan-backend -f
```

### 重启服务

```bash
# 重启后端
pm2 restart fuyuan-backend

# 重启 Nginx
sudo systemctl restart nginx

# 重启 Docker 容器
docker restart fuyuan-backend
```

### 更新代码

```bash
# 上传新代码
scp -r backend/* root@your-server-ip:/opt/fuyuan/backend/

# 登录服务器
ssh root@your-server-ip

# 重启服务
cd /opt/fuyuan/backend
pm2 restart fuyuan-backend
```

---

## 📞 技术支持

### 常见问题

1. **SSH 连接失败**: 检查 IP、端口、密码
2. **Docker 安装失败**: 检查内存、网络
3. **端口被占用**: 使用其他端口
4. **数据库启动失败**: 检查磁盘空间

### 获取帮助

- 查看部署日志: `deploy-*.log`
- 查看部署报告: `DEPLOYMENT_REPORT.md`
- 查看配置文件: `DEPLOY_CONFIG.json`

---

## 🎉 部署完成

部署成功后,您可以:

- 🌐 访问网站: http://your-domain.com
- 📱 测试 API: http://your-domain.com/api/health
- 👨‍💼 登录后台: http://your-domain.com/admin
- 📊 查看监控: http://your-domain.com/monitor

---

## 📝 版本信息

- **版本**: 1.0.0
- **更新时间**: 2026-03-19
- **支持平台**: Linux / macOS / Windows
- **支持数据库**: MongoDB / MySQL / PostgreSQL / SQLite / SQL Server

---

**祝您使用愉快! 🎊**
