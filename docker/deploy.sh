#!/bin/bash

# 赴缘婚恋应用 - 生产环境部署脚本
# 使用方法: bash docker/deploy.sh [command]
# 命令: start|stop|restart|logs|clean|build

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目信息
PROJECT_NAME="fuyuan"
COMPOSE_FILE="docker/docker-compose.production.yml"
ENV_FILE="docker/.env.production"

# 检查Docker是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}错误: 未安装Docker${NC}"
        echo "请先安装Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}错误: 未安装Docker Compose${NC}"
        echo "请先安装Docker Compose: https://docs.docker.com/compose/install/"
        exit 1
    fi
}

# 检查环境变量文件
check_env_file() {
    if [ ! -f "$ENV_FILE" ]; then
        echo -e "${YELLOW}警告: 环境变量文件不存在${NC}"
        echo "正在创建环境变量文件..."
        cp "${ENV_FILE}.example" "$ENV_FILE" 2>/dev/null || {
            echo -e "${RED}错误: 无法创建环境变量文件${NC}"
            exit 1
        }
        echo -e "${GREEN}✓ 已创建 $ENV_FILE${NC}"
        echo -e "${YELLOW}请编辑此文件并设置正确的生产环境配置${NC}"
        read -p "按回车键继续..."
    fi
}

# 启动服务
start_services() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}启动赴缘婚恋应用${NC}"
    echo -e "${BLUE}========================================${NC}"

    check_docker
    check_env_file

    echo -e "${GREEN}正在拉取最新镜像...${NC}"
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" pull

    echo -e "${GREEN}正在构建镜像...${NC}"
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build

    echo -e "${GREEN}正在启动服务...${NC}"
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d

    echo -e "${BLUE}========================================${NC}"
    echo -e "${GREEN}✓ 所有服务已启动${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    echo "服务访问地址:"
    echo "  - 前端: http://localhost"
    echo "  - 后端API: http://localhost/api"
    echo "  - MongoDB管理: http://localhost:27017"
    echo "  - Redis CLI: docker exec -it fuyuan-redis redis-cli -a \$REDIS_PASSWORD"
    echo "  - RabbitMQ管理: http://localhost:15672"
    echo ""
    echo "查看日志: bash $0 logs"
}

# 停止服务
stop_services() {
    echo -e "${YELLOW}停止所有服务...${NC}"
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down
    echo -e "${GREEN}✓ 所有服务已停止${NC}"
}

# 重启服务
restart_services() {
    echo -e "${YELLOW}重启所有服务...${NC}"
    stop_services
    start_services
}

# 查看日志
view_logs() {
    SERVICE=${1:-""}
    if [ -n "$SERVICE" ]; then
        echo -e "${BLUE}查看 $SERVICE 日志...${NC}"
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs -f "$SERVICE"
    else
        echo -e "${BLUE}查看所有服务日志...${NC}"
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs -f
    fi
}

# 清理
clean_all() {
    echo -e "${RED}警告: 此操作将删除所有容器、卷和数据${NC}"
    read -p "确定要继续吗? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}正在清理...${NC}"
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down -v --remove-orphans
        docker system prune -f
        echo -e "${GREEN}✓ 清理完成${NC}"
    else
        echo "已取消"
    fi
}

# 仅构建镜像
build_only() {
    echo -e "${BLUE}构建镜像...${NC}"
    check_docker
    check_env_file
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build
    echo -e "${GREEN}✓ 镜像构建完成${NC}"
}

# 显示帮助
show_help() {
    echo "用法: bash $0 [command] [service]"
    echo ""
    echo "命令:"
    echo "  start    - 启动所有服务（默认）"
    echo "  stop     - 停止所有服务"
    echo "  restart  - 重启所有服务"
    echo "  logs     - 查看日志（可选指定服务名）"
    echo "  build    - 仅构建镜像"
    echo "  clean    - 清理所有容器、卷和数据"
    echo "  help     - 显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  bash $0 start"
    echo "  bash $0 logs backend"
    echo "  bash $0 restart"
}

# 主函数
main() {
    case "${1:-start}" in
        start)
            start_services
            ;;
        stop)
            stop_services
            ;;
        restart)
            restart_services
            ;;
        logs)
            view_logs "$2"
            ;;
        clean)
            clean_all
            ;;
        build)
            build_only
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            echo -e "${RED}错误: 未知命令 '$1'${NC}"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
