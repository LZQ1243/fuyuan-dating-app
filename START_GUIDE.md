# 🚀 赴缘婚恋应用开发 - 启动指南

## 项目总览
- **项目名称**: 赴缘婚恋社交平台
- **技术栈**: Node.js + Express + MongoDB + MySQL + Vue3/React
- **部署方式**: Docker + Nginx
- **启动时间**: 约5分钟

---

## 📁 项目结构

```
赴缘婚恋应用开发/
├── backend/                 # 后端服务
├── frontend/                # uni-app前端
├── frontend-react/          # React前端
├── admin/                   # 管理后台
├── docker/                  # Docker配置
└── docs/                   # 文档
```

---

## 🚀 快速启动

### 方法一：使用启动脚本（推荐）

#### Windows系统
```batch
# 双击运行或命令行执行
start-dev.bat
```

#### Linux/Mac系统
```bash
# 添加执行权限
chmod +x start-dev.sh

# 运行启动脚本
./start-dev.sh
```

### 方法二：手动启动

#### 步骤1：启动Docker服务
```bash
cd docker

# 启动所有服务
docker-compose up -d

# 或只启动数据库服务
docker-compose up -d mongodb redis mysql rabbitmq

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

#### 步骤2：初始化MySQL数据库
```bash
cd ../backend

# 初始化MySQL表
npm run mysql:init
```

#### 步骤3：启动后端服务
```bash
# 安装依赖（首次）
npm install

# 启动开发服务器
npm run dev

# 或启动生产服务器
npm start
```

后端服务将在 `http://localhost:3000` 启动

#### 步骤4：启动uni-app前端（新终端）
```bash
cd ../frontend

# 安装依赖（首次）
npm install

# 启动H5开发服务器
npm run dev:h5

# 或启动小程序开发工具（使用HBuilderX）
```

前端H5将在 `http://localhost:8080` 启动

#### 步骤5：启动React前端（新终端）
```bash
cd ../frontend-react

# 安装依赖（首次）
npm install

# 启动开发服务器
npm run dev
```

React前端将在 `http://localhost:3002` 启动

#### 步骤6：启动管理后台（新终端）
```bash
cd ../admin

# 安装依赖（首次）
npm install

# 启动开发服务器
npm run dev
```

管理后台将在 `http://localhost:3001` 启动

---

## 🌐 访问地址

启动完成后，可通过以下地址访问：

| 服务 | 地址 | 说明 |
|------|------|------|
| 后端API | http://localhost:3000 | RESTful API + WebSocket |
| uni-app前端(H5) | http://localhost:8080 | 移动端H5 |
| React前端 | http://localhost:3002 | Web端 |
| 管理后台 | http://localhost:3001 | 管理员后台 |
| MongoDB | localhost:27017 | 数据库 |
| MySQL | localhost:3306 | 数据库 |
| Redis | localhost:6379 | 缓存 |
| RabbitMQ | http://localhost:15672 | 消息队列管理界面 |

---

## ⚙️ 环境变量配置

### 后端配置
创建 `backend/.env` 文件：
```env
# API配置
API_BASE_URL=http://localhost:3000
PORT=3000

# 前端配置
UNIAPP_URL=http://localhost:8080
REACT_URL=http://localhost:3002
ADMIN_URL=http://localhost:3001

# MongoDB配置
MONGODB_URI=mongodb://localhost:27017/fuyuan

# MySQL配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=fuyuan

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# 阿里云配置
ALIYUN_ASR_APPKEY=your_appkey
ALIYUN_ASR_TOKEN=your_token
ALIYUN_ASR_ENDPOINT=https://nls-meta.cn-shanghai.aliyuncs.com
ALIYUN_TTS_APPKEY=your_appkey
ALIYUN_TTS_TOKEN=your_token
ALIYUN_TTS_ENDPOINT=https://nls-meta.cn-shanghai.aliyuncs.com
OSS_ACCESS_KEY=your_access_key
OSS_SECRET_KEY=your_secret_key
OSS_BUCKET=fuyuan-bucket
OSS_REGION=oss-cn-shanghai
OSS_ENDPOINT=https://oss-cn-shanghai.aliyuncs.com

# 腾讯云配置
TENCENT_FACE_SECRET_ID=your_secret_id
TENCENT_FACE_SECRET_KEY=your_secret_key
TENCENT_FACE_REGION=ap-guangzhou
TENCENT_FACE_ENDPOINT=faceid.tencentcloudapi.com

# WebSocket配置
WS_PORT=3000
WS_CORS_ORIGIN=*

# 安全配置
JWT_SECRET=fuyuan-secret-key-change-in-production
JWT_EXPIRE=7d
BCRYPT_SALT=10

# 文件上传配置
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime

# 短信配置
SMS_PROVIDER=aliyun
SMS_ACCESS_KEY=your_access_key
SMS_SECRET_KEY=your_secret_key
SMS_SIGN_NAME=赴缘
SMS_TEMPLATE_CODE=SMS_123456789

# 邮件配置
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=noreply@fuyuan.com
EMAIL_PASSWORD=your_password
EMAIL_FROM=noreply@fuyuan.com

# 功能开关
SENSITIVE_FILTER_ENABLED=true
SENSITIVE_AUTO_REJECT=false
REGISTRATION_REQUIRED=true
```

### React前端配置
创建 `frontend-react/.env` 文件：
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

---

## 🔧 配置中心使用

### 1. 访问配置中心
1. 启动后端和管理后台
2. 访问管理后台: http://localhost:3001
3. 登录管理员账号
4. 导航到 "系统配置"

### 2. 配置第三方服务
在配置中心的对应标签页中填写：
- **阿里云服务**: ASR、TTS、OSS的AccessKey和Secret
- **腾讯云服务**: 人脸识别的Secret ID和Secret Key
- **短信服务**: 选择服务商，填写AccessKey和Secret
- **邮件服务**: SMTP配置

### 3. 功能开关
在配置中心的"功能开关"标签页中：
- 开启/关闭各个功能模块
- 调整功能参数
- 修改业务规则

### 4. 动态配置更新
修改配置后：
1. 点击"保存"按钮
2. 前端会自动从配置中心获取最新配置
3. 无需重启前端服务

---

## 📱 开发工具推荐

### uni-app开发
- **HBuilderX**: https://www.dcloud.io/hbuilderx.html
- **VS Code插件**: uni-app语法高亮

### React开发
- **VS Code**: 推荐的IDE
- **Chrome DevTools**: 调试工具

### 管理后台
- **VS Code**: 推荐
- **Chrome**: 浏览器调试

---

## 🐛 常见问题

### 1. 端口被占用
```bash
# 查看端口占用
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000

# 杀死进程
# Windows
taskkill /PID <PID> /F

# Linux/Mac
kill -9 <PID>
```

### 2. MongoDB连接失败
```bash
# 检查MongoDB容器状态
docker ps | grep mongodb

# 查看MongoDB日志
docker logs mongodb

# 重启MongoDB
docker restart mongodb
```

### 3. MySQL连接失败
```bash
# 检查MySQL容器状态
docker ps | grep mysql

# 查看MySQL日志
docker logs mysql

# 进入MySQL容器
docker exec -it mysql bash

# 在容器内连接MySQL
mysql -u root -p
```

### 4. 前端无法连接后端
1. 检查后端是否启动: http://localhost:3000
2. 检查CORS配置
3. 检查防火墙设置
4. 检查网络代理

### 5. Docker服务启动失败
```bash
# 清理所有容器
docker-compose down

# 清理所有卷
docker-compose down -v

# 重新构建
docker-compose build

# 启动服务
docker-compose up -d
```

---

## 📊 服务检查清单

启动后请检查：

- [ ] 后端服务正常 (http://localhost:3000)
- [ ] uni-app前端正常 (http://localhost:8080)
- [ ] React前端正常 (http://localhost:3002)
- [ ] 管理后台正常 (http://localhost:3001)
- [ ] MongoDB正常 (localhost:27017)
- [ ] MySQL正常 (localhost:3306)
- [ ] Redis正常 (localhost:6379)
- [ ] RabbitMQ正常 (http://localhost:15672)

---

## 🔐 默认账号

### 管理员账号
- 用户名: admin
- 密码: admin123

### 测试账号
- 手机号: 13800138000
- 密码: 123456

---

## 📚 相关文档

- [API接口文档](./docs/API.md)
- [部署文档](./docs/DEPLOYMENT.md)
- [项目状态报告](./PROJECT_STATUS.md)
- [配置中心报告](./PROJECT_FIX_REPORT.md)

---

## 🎯 下一步

1. 在配置中心填写第三方服务密钥
2. 测试各个功能模块
3. 根据需要调整配置参数
4. 部署到生产环境

---

**祝使用愉快！** 🎉

如有问题，请查看日志或联系开发团队。
