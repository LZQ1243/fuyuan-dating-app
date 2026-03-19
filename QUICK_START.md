# 快速开始指南

## 🚀 5分钟快速部署

### 前提条件

1. 安装 Docker Desktop
   - Windows: https://www.docker.com/products/docker-desktop
   - Mac: https://docs.docker.com/desktop/install/mac-install/
   - Linux: https://docs.docker.com/engine/install/

### 快速部署步骤

#### Windows 用户

```powershell
# 1. 打开 PowerShell，进入项目目录
cd C:\Users\Administrator\Desktop\赴缘婚恋应用开发

# 2. 配置环境变量
cd docker
copy .env.production.example .env
notepad .env  # 修改密码等配置

# 3. 一键部署
.\deploy.ps1 start
```

#### Linux/Mac 用户

```bash
# 1. 进入项目目录
cd fuyuan

# 2. 配置环境变量
cd docker
cp .env.production.example .env
nano .env  # 修改密码等配置

# 3. 一键部署
chmod +x deploy.sh
./deploy.sh start
```

### 访问应用

部署成功后，访问：
- 前端: http://localhost
- 后端API: http://localhost/api
- RabbitMQ管理: http://localhost:15672 (admin / 你设置的密码)

### 常用命令

```powershell
# 查看日志
.\deploy.ps1 logs

# 停止服务
.\deploy.ps1 stop

# 重启服务
.\deploy.ps1 restart

# 查看特定服务日志
.\deploy.ps1 logs backend
```

---

## 📖 详细文档

- [完整部署指南](DEPLOYMENT_GUIDE.md) - 生产环境部署详解
- [启动检查清单](STARTUP_CHECKLIST.md) - 系统完整性检查
- [项目README](README.md) - 项目说明和API文档

---

## ❓ 常见问题

### Q: Docker 启动失败？
A: 确保Docker Desktop正在运行，端口80/3000/27017/6379未被占用

### Q: 如何修改端口？
A: 编辑 `docker/.env.production`，修改 `BACKEND_PORT` 和 `FRONTEND_PORT`

### Q: 数据在哪里？
A: 数据存储在Docker volume中，使用 `docker volume ls` 查看

### Q: 如何备份数据？
A: 查看 [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) 中的备份章节

---

## 🎯 下一步

1. 修改 `docker/.env.production` 中的默认密码
2. 配置域名和SSL证书（生产环境）
3. 设置定期备份
4. 配置监控告警

---

**需要帮助？** 查看 [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) 获取详细说明
