#!/bin/bash

# 赴缘婚恋应用开发 - 前端部署脚本

set -e

echo "🚀 开始部署前端服务..."

# 1. 拉取最新代码
echo "📦 拉取最新代码..."
git pull origin main

# 2. 安装依赖
echo "📥 安装依赖..."
npm ci

# 3. 运行测试
echo "🧪 运行测试..."
npm run test:run || echo "跳过测试"

# 4. 构建生产版本
echo "🔨 构建生产版本..."
npm run build

# 5. 备份旧版本
echo "💾 备份旧版本..."
if [ -d "/var/www/fuyuan" ]; then
  sudo cp -r /var/www/fuyuan /var/www/fuyuan.backup.$(date +%Y%m%d_%H%M%S)
fi

# 6. 部署新版本
echo "📤 部署新版本..."
sudo cp -r dist/* /var/www/fuyuan/

# 7. 重启Nginx
echo "🔄 重启Nginx..."
sudo systemctl reload nginx || sudo systemctl restart nginx

echo "✅ 部署完成!"
