#!/bin/bash

# 赴缘婚恋应用开发 - 完整部署脚本

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "🚀 赴缘婚恋应用开发 - 完整部署"
echo "===================================="

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装,请先安装Docker"
    exit 1
fi

# 检查Docker Compose是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装,请先安装Docker Compose"
    exit 1
fi

# 1. 拉取最新代码
echo ""
echo "📦 步骤 1/7: 拉取最新代码"
cd "$PROJECT_ROOT"
git pull origin main || echo "⚠️  Git pull失败,继续部署..."

# 2. 构建后端Docker镜像
echo ""
echo "🐳 步骤 2/7: 构建后端Docker镜像"
cd "$PROJECT_ROOT/backend"
docker build -t fuyuan-backend:latest .

# 3. 构建前端Docker镜像
echo ""
echo "🎨 步骤 3/7: 构建前端Docker镜像"
cd "$PROJECT_ROOT/frontend-react"
docker build -t fuyuan-frontend:latest .

# 4. 停止旧容器
echo ""
echo "⏹️  步骤 4/7: 停止旧容器"
cd "$PROJECT_ROOT/docker"
docker-compose down || echo "没有旧容器需要停止"

# 5. 启动新容器
echo ""
echo "▶️  步骤 5/7: 启动新容器"
docker-compose up -d

# 6. 等待服务启动
echo ""
echo "⏳ 步骤 6/7: 等待服务启动"
sleep 10

# 7. 健康检查
echo ""
echo "🏥 步骤 7/7: 健康检查"
echo "检查后端服务..."
curl -f http://localhost:3000/api/health || echo "⚠️  后端服务可能还未就绪"

echo ""
echo "检查前端服务..."
curl -f http://localhost/ || echo "⚠️  前端服务可能还未就绪"

echo ""
echo "===================================="
echo "✅ 部署完成!"
echo ""
echo "服务地址:"
echo "  - 前端: http://localhost"
echo "  - 后端: http://localhost:3000"
echo "  - Nginx管理: http://localhost:80"
echo "  - RabbitMQ管理: http://localhost:15672 (admin/admin123)"
echo ""
echo "查看日志:"
echo "  docker-compose logs -f"
echo ""
echo "停止服务:"
echo "  docker-compose down"
echo ""
