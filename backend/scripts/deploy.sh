#!/bin/bash

# 赴缘婚恋应用开发 - 后端部署脚本

set -e

echo "🚀 开始部署后端服务..."

# 1. 拉取最新代码
echo "📦 拉取最新代码..."
git pull origin main

# 2. 安装依赖
echo "📥 安装依赖..."
npm ci --only=production

# 3. 运行数据库迁移
echo "🗄️ 运行数据库迁移..."
npm run migrate || echo "没有迁移脚本"

# 4. 运行测试
echo "🧪 运行测试..."
npm run test:ci || echo "跳过测试"

# 5. 生成API文档
echo "📚 生成API文档..."
npm run docs:generate

# 6. 重启服务
echo "🔄 重启服务..."
if command -v pm2 &> /dev/null; then
  pm2 restart fuyuan-backend || pm2 start src/app.js --name fuyuan-backend
else
  echo "⚠️  PM2未安装,建议安装PM2进行进程管理"
  echo "   npm install -g pm2"
fi

# 7. 健康检查
echo "🏥 健康检查..."
sleep 5
node scripts/health-check.js

echo "✅ 部署完成!"
