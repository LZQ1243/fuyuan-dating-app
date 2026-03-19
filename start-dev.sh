#!/bin/bash

echo "=========================================="
echo "  赴缘婚恋平台 - 开发环境启动脚本"
echo "=========================================="

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误: Docker未安装${NC}"
    echo "请先安装Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# 检查Docker Compose是否安装
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}错误: Docker Compose未安装${NC}"
    echo "请先安装Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: Node.js未安装${NC}"
    echo "请先安装Node.js: https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓ 环境检查通过${NC}"
echo ""

# 启动数据库服务
echo -e "${YELLOW}启动数据库服务...${NC}"
cd docker
docker-compose up -d mongodb redis rabbitmq

# 等待数据库启动
echo "等待数据库启动..."
sleep 5

cd ..

# 检查后端依赖
echo -e "${YELLOW}检查后端依赖...${NC}"
cd backend
if [ ! -d "node_modules" ]; then
    echo "安装后端依赖..."
    npm install
fi

# 检查环境变量
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}创建环境变量文件...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}请编辑 backend/.env 文件，配置相关参数${NC}"
fi

# 启动后端
echo -e "${GREEN}启动后端服务...${NC}"
npm run dev &
BACKEND_PID=$!

cd ..

# 检查前端依赖
echo -e "${YELLOW}检查前端依赖...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    echo "安装前端依赖..."
    npm install
fi

# 启动前端H5
echo -e "${GREEN}启动前端H5...${NC}"
npm run dev:h5 &
FRONTEND_PID=$!

cd ..

# 检查管理后台依赖
echo -e "${YELLOW}检查管理后台依赖...${NC}"
cd admin
if [ ! -d "node_modules" ]; then
    echo "安装管理后台依赖..."
    npm install
fi

# 启动管理后台
echo -e "${GREEN}启动管理后台...${NC}"
npm run dev &
ADMIN_PID=$!

cd ..

echo ""
echo "=========================================="
echo -e "${GREEN}所有服务启动完成！${NC}"
echo "=========================================="
echo ""
echo "访问地址："
echo "  - 后端API:  http://localhost:3000"
echo "  - 前端H5:   http://localhost:8080"
echo "  - 管理后台: http://localhost:3001"
echo "  - RabbitMQ: http://localhost:15672 (admin/admin123)"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

# 等待用户中断
trap "kill $BACKEND_PID $FRONTEND_PID $ADMIN_PID; docker-compose -f docker/docker-compose.yml down; exit" INT TERM

wait
