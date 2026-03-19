# 生产环境部署脚本
# 自动化部署到生产服务器

#!/bin/bash

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查Docker是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装,请先安装Docker"
        exit 1
    fi
    log_info "Docker已安装: $(docker --version)"
}

# 检查Docker Compose是否安装
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose未安装,请先安装Docker Compose"
        exit 1
    fi
    log_info "Docker Compose已安装: $(docker-compose --version)"
}

# 创建必要的目录
create_directories() {
    log_info "创建必要的目录..."
    mkdir -p uploads
    mkdir -p logs
    mkdir -p ssl
    mkdir -p config
    mkdir -p backups
    log_info "目录创建完成"
}

# 生成SSL证书
generate_ssl_cert() {
    if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
        log_warn "SSL证书不存在,生成自签名证书(仅用于测试)"
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/key.pem \
            -out ssl/cert.pem \
            -subj "/C=CN/ST=Beijing/L=Beijing/O=Fuyuan/OU=IT/CN=fuyuan.com"
        log_warn "生产环境请使用真实的SSL证书!"
    else
        log_info "SSL证书已存在"
    fi
}

# 检查环境变量配置
check_env_config() {
    log_info "检查环境变量配置..."

    if [ ! -f ".env.production" ]; then
        log_error ".env.production文件不存在"
        exit 1
    fi

    # 检查关键配置
    source .env.production

    if [ "$JWT_SECRET" = "change_this_to_very_long_and_secure_random_string_for_production" ]; then
        log_error "请修改JWT_SECRET为安全的随机字符串"
        exit 1
    fi

    if [ "$MONGO_ROOT_PASSWORD" = "change_this_to_secure_password" ]; then
        log_error "请修改MONGO_ROOT_PASSWORD为安全的密码"
        exit 1
    fi

    log_info "环境变量配置检查通过"
}

# 拉取最新镜像
pull_images() {
    log_info "拉取最新镜像..."
    docker-compose -f docker/docker-compose.yml pull
    log_info "镜像拉取完成"
}

# 构建应用镜像
build_images() {
    log_info "构建应用镜像..."
    docker-compose -f docker/docker-compose.yml build --no-cache
    log_info "镜像构建完成"
}

# 备份数据
backup_data() {
    log_info "备份数据..."
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"

    # 备份MongoDB
    docker exec fuyuan-mongodb mongodump --host localhost --port 27017 \
        --db fuyuan --out /data/backup
    docker cp fuyuan-mongodb:/data/backup "$BACKUP_DIR/mongodb"

    # 备份Redis
    docker exec fuyuan-redis redis-cli --rdb /data/backup.rdb
    docker cp fuyuan-redis:/data/backup.rdb "$BACKUP_DIR/redis.rdb"

    # 备份上传文件
    cp -r uploads "$BACKUP_DIR/"

    # 打包备份
    tar -czf "$BACKUP_DIR.tar.gz" "$BACKUP_DIR"
    rm -rf "$BACKUP_DIR"

    log_info "数据备份完成: $BACKUP_DIR.tar.gz"
}

# 停止服务
stop_services() {
    log_info "停止服务..."
    docker-compose -f docker/docker-compose.yml down
    log_info "服务已停止"
}

# 启动服务
start_services() {
    log_info "启动服务..."
    docker-compose -f docker/docker-compose.yml up -d
    log_info "服务已启动"
}

# 重启服务
restart_services() {
    log_info "重启服务..."
    docker-compose -f docker/docker-compose.yml restart
    log_info "服务已重启"
}

# 查看服务状态
check_services() {
    log_info "查看服务状态..."
    docker-compose -f docker/docker-compose.yml ps
}

# 查看日志
view_logs() {
    SERVICE=${1:-}
    if [ -z "$SERVICE" ]; then
        docker-compose -f docker/docker-compose.yml logs -f
    else
        docker-compose -f docker/docker-compose.yml logs -f "$SERVICE"
    fi
}

# 健康检查
health_check() {
    log_info "执行健康检查..."

    # 检查Nginx
    if curl -sf http://localhost/health > /dev/null; then
        log_info "Nginx: 健康"
    else
        log_error "Nginx: 不健康"
    fi

    # 检查后端API
    if curl -sf http://localhost/api/health > /dev/null; then
        log_info "后端API: 健康"
    else
        log_error "后端API: 不健康"
    fi

    # 检查MongoDB
    if docker exec fuyuan-mongodb mongo --eval "db.serverStatus()" > /dev/null 2>&1; then
        log_info "MongoDB: 健康"
    else
        log_error "MongoDB: 不健康"
    fi

    # 检查Redis
    if docker exec fuyuan-redis redis-cli ping > /dev/null 2>&1; then
        log_info "Redis: 健康"
    else
        log_error "Redis: 不健康"
    fi
}

# 清理资源
cleanup() {
    log_info "清理未使用的资源..."
    docker system prune -f
    log_info "清理完成"
}

# 滚动更新
rolling_update() {
    SERVICE=${1:-backend}

    log_info "开始滚动更新: $SERVICE"

    # 备份
    backup_data

    # 构建新镜像
    build_images

    # 更新服务
    docker-compose -f docker/docker-compose.yml up -d --no-deps --build "$SERVICE"

    # 健康检查
    sleep 10
    health_check

    log_info "滚动更新完成"
}

# 部署到生产
deploy_to_production() {
    log_info "开始部署到生产环境..."

    # 预检查
    check_docker
    check_docker_compose
    check_env_config

    # 创建目录
    create_directories

    # 生成SSL证书
    generate_ssl_cert

    # 备份数据
    backup_data

    # 拉取镜像
    pull_images

    # 构建镜像
    build_images

    # 停止服务
    stop_services

    # 启动服务
    start_services

    # 健康检查
    sleep 30
    health_check

    log_info "部署完成!"
}

# 显示帮助信息
show_help() {
    cat << EOF
生产环境部署脚本

用法: ./deploy.sh [命令]

命令:
    deploy          部署到生产环境
    start           启动服务
    stop            停止服务
    restart         重启服务
    status          查看服务状态
    logs [service]  查看日志
    health          健康检查
    backup          备份数据
    cleanup         清理资源
    rolling-update  滚动更新

示例:
    ./deploy.sh deploy
    ./deploy.sh logs backend
    ./deploy.sh health

EOF
}

# 主函数
main() {
    case "${1:-}" in
        deploy)
            deploy_to_production
            ;;
        start)
            start_services
            ;;
        stop)
            stop_services
            ;;
        restart)
            restart_services
            ;;
        status)
            check_services
            ;;
        logs)
            view_logs "${2:-}"
            ;;
        health)
            health_check
            ;;
        backup)
            backup_data
            ;;
        cleanup)
            cleanup
            ;;
        rolling-update)
            rolling_update "${2:-backend}"
            ;;
        *)
            show_help
            ;;
    esac
}

# 执行主函数
main "$@"
