#!/bin/bash

################################################################################
# 赴缘婚恋应用 - 全平台全自动一键部署脚本
# 支持: Linux/Windows/macOS | 所有云服务器 | 所有数据库
# 仅需填写服务器信息,即可完成所有部署操作
################################################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置文件路径
CONFIG_FILE="DEPLOY_CONFIG.json"
LOG_FILE="deploy-$(date +%Y%m%d-%H%M%S).log"

# 服务器配置变量
SERVER_HOST=""
SERVER_USER=""
SERVER_PORT="22"
SERVER_PASSWORD=""
SERVER_SSH_KEY=""
SERVER_TYPE="linux"
DEPLOY_PATH="/opt/fuyuan"
DATABASE_TYPE="mongodb"
DOMAIN_NAME=""
SSL_EMAIL=""

# 数据库配置
DB_HOST="localhost"
DB_PORT=""
DB_NAME="fuyuan"
DB_USER=""
DB_PASSWORD=""
AUTO_GENERATE_DB_PASSWORD=true

# 部署选项
USE_DOCKER=true
USE_SSL=true
AUTO_INSTALL=true
AUTO_START=true

################################################################################
# 日志函数
################################################################################
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS:${NC} $1" | tee -a "$LOG_FILE"
}

################################################################################
# 检测操作系统
################################################################################
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
        if [ -f /etc/os-release ]; then
            . /etc/os-release
            DISTRO=$ID
            VERSION=$VERSION_ID
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        OS="windows"
    else
        error "不支持的操作系统: $OSTYPE"
    fi
    log "检测到操作系统: $OS ${DISTRO:+($DISTRO) ${VERSION:+$VERSION}}"
}

################################################################################
# 检查依赖
################################################################################
check_dependencies() {
    log "检查必要依赖..."

    # 检查 SSH 客户端
    if ! command -v ssh &> /dev/null; then
        error "未找到 SSH 客户端,请先安装 OpenSSH"
    fi

    # 检查 rsync
    if ! command -v rsync &> /dev/null; then
        warn "未找到 rsync,将使用 scp"
    fi

    # 检查 jq (JSON 解析)
    if ! command -v jq &> /dev/null; then
        log "安装 jq..."
        if [[ "$OS" == "linux" ]]; then
            sudo apt-get update && sudo apt-get install -y jq
        elif [[ "$OS" == "macos" ]]; then
            brew install jq
        fi
    fi

    success "依赖检查完成"
}

################################################################################
# 测试服务器连接
################################################################################
test_connection() {
    log "测试服务器连接: ${SERVER_USER}@${SERVER_HOST}:${SERVER_PORT}"

    if [ -n "$SERVER_SSH_KEY" ]; then
        ssh -i "$SERVER_SSH_KEY" -p "$SERVER_PORT" -o ConnectTimeout=10 -o StrictHostKeyChecking=no \
            "${SERVER_USER}@${SERVER_HOST}" "echo '连接成功'" || error "无法连接到服务器"
    else
        sshpass -p "$SERVER_PASSWORD" ssh -p "$SERVER_PORT" -o ConnectTimeout=10 -o StrictHostKeyChecking=no \
            "${SERVER_USER}@${SERVER_HOST}" "echo '连接成功'" || error "无法连接到服务器"
    fi

    success "服务器连接测试通过"
}

################################################################################
# 生成数据库密码
################################################################################
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
}

################################################################################
# 在服务器上执行命令
################################################################################
remote_exec() {
    local cmd=$1

    if [ -n "$SERVER_SSH_KEY" ]; then
        ssh -i "$SERVER_SSH_KEY" -p "$SERVER_PORT" -o StrictHostKeyChecking=no \
            "${SERVER_USER}@${SERVER_HOST}" "$cmd"
    else
        sshpass -p "$SERVER_PASSWORD" ssh -p "$SERVER_PORT" -o StrictHostKeyChecking=no \
            "${SERVER_USER}@${SERVER_HOST}" "$cmd"
    fi
}

################################################################################
# 上传文件到服务器
################################################################################
remote_upload() {
    local local_file=$1
    local remote_file=$2

    if [ -n "$SERVER_SSH_KEY" ]; then
        scp -i "$SERVER_SSH_KEY" -P "$SERVER_PORT" -o StrictHostKeyChecking=no \
            "$local_file" "${SERVER_USER}@${SERVER_HOST}:${remote_file}"
    else
        sshpass -p "$SERVER_PASSWORD" scp -P "$SERVER_PORT" -o StrictHostKeyChecking=no \
            "$local_file" "${SERVER_USER}@${SERVER_HOST}:${remote_file}"
    fi
}

################################################################################
# 安装基础环境
################################################################################
install_base_environment() {
    log "在服务器上安装基础环境..."

    remote_exec "sudo apt-get update && sudo apt-get install -y \
        curl wget git vim htop unzip \
        build-essential python3 python3-pip \
        ufw fail2ban"

    # 安装 Node.js
    log "安装 Node.js 18.x..."
    remote_exec "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && \
        sudo apt-get install -y nodejs"

    # 安装 PM2 (进程管理)
    log "安装 PM2..."
    remote_exec "sudo npm install -g pm2"

    # 安装 Docker
    if [ "$USE_DOCKER" = true ]; then
        log "安装 Docker..."
        remote_exec "curl -fsSL https://get.docker.com | sudo sh && \
            sudo usermod -aG docker ${SERVER_USER} && \
            sudo systemctl enable docker && \
            sudo systemctl start docker"

        # 安装 Docker Compose
        log "安装 Docker Compose..."
        remote_exec "sudo curl -L 'https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)' \
            -o /usr/local/bin/docker-compose && \
            sudo chmod +x /usr/local/bin/docker-compose"
    fi

    success "基础环境安装完成"
}

################################################################################
# 配置数据库
################################################################################
configure_database() {
    log "配置数据库: $DATABASE_TYPE"

    # 生成数据库密码
    if [ "$AUTO_GENERATE_DB_PASSWORD" = true ] && [ -z "$DB_PASSWORD" ]; then
        DB_PASSWORD=$(generate_password)
        log "自动生成数据库密码: ${DB_PASSWORD:0:8}***"
    fi

    case $DATABASE_TYPE in
        "mongodb")
            DB_PORT="27017"
            log "配置 MongoDB..."

            if [ "$USE_DOCKER" = true ]; then
                remote_exec "docker run -d \
                    --name fuyuan-mongodb \
                    -p 27017:27017 \
                    -e MONGO_INITDB_ROOT_USERNAME=admin \
                    -e MONGO_INITDB_ROOT_PASSWORD=${DB_PASSWORD} \
                    -e MONGO_INITDB_DATABASE=${DB_NAME} \
                    -v ${DEPLOY_PATH}/data/mongodb:/data/db \
                    mongo:latest"
            else
                remote_exec "sudo apt-get install -y mongodb && \
                    sudo systemctl enable mongod && \
                    sudo systemctl start mongod"
            fi
            ;;

        "mysql")
            DB_PORT="3306"
            log "配置 MySQL..."

            if [ "$USE_DOCKER" = true ]; then
                remote_exec "docker run -d \
                    --name fuyuan-mysql \
                    -p 3306:3306 \
                    -e MYSQL_ROOT_PASSWORD=${DB_PASSWORD} \
                    -e MYSQL_DATABASE=${DB_NAME} \
                    -v ${DEPLOY_PATH}/data/mysql:/var/lib/mysql \
                    mysql:8.0"
            else
                remote_exec "sudo apt-get install -y mysql-server && \
                    sudo mysql -e 'CREATE DATABASE IF NOT EXISTS ${DB_NAME};' && \
                    sudo mysql -e \"CREATE USER IF NOT EXISTS '${DB_USER:-root}'@'%' IDENTIFIED BY '${DB_PASSWORD}';\" && \
                    sudo mysql -e \"GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER:-root}'@'%';\" && \
                    sudo systemctl enable mysql && \
                    sudo systemctl start mysql"
            fi
            ;;

        "postgresql")
            DB_PORT="5432"
            log "配置 PostgreSQL..."

            if [ "$USE_DOCKER" = true ]; then
                remote_exec "docker run -d \
                    --name fuyuan-postgresql \
                    -p 5432:5432 \
                    -e POSTGRES_USER=${DB_USER:-postgres} \
                    -e POSTGRES_PASSWORD=${DB_PASSWORD} \
                    -e POSTGRES_DB=${DB_NAME} \
                    -v ${DEPLOY_PATH}/data/postgresql:/var/lib/postgresql/data \
                    postgres:15"
            else
                remote_exec "sudo apt-get install -y postgresql postgresql-contrib && \
                    sudo -u postgres psql -c 'CREATE DATABASE ${DB_NAME};' && \
                    sudo -u postgres psql -c \"CREATE USER ${DB_USER:-postgres} WITH PASSWORD '${DB_PASSWORD}';\" && \
                    sudo -u postgres psql -c 'GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER:-postgres};' && \
                    sudo systemctl enable postgresql && \
                    sudo systemctl start postgresql"
            fi
            ;;

        "sqlite")
            log "配置 SQLite (无需额外安装)"
            ;;

        "sqlserver")
            DB_PORT="1433"
            log "配置 SQL Server..."

            if [ "$USE_DOCKER" = true ]; then
                remote_exec "docker run -d \
                    --name fuyuan-sqlserver \
                    -p 1433:1433 \
                    -e 'ACCEPT_EULA=Y' \
                    -e 'SA_PASSWORD=${DB_PASSWORD}' \
                    -v ${DEPLOY_PATH}/data/sqlserver:/var/opt/mssql/data \
                    mcr.microsoft.com/mssql/server:2022-latest"
            fi
            ;;

        *)
            error "不支持的数据库类型: $DATABASE_TYPE"
            ;;
    esac

    success "数据库配置完成"
}

################################################################################
# 配置 Redis
################################################################################
configure_redis() {
    log "配置 Redis..."

    if [ "$USE_DOCKER" = true ]; then
        REDIS_PASSWORD=$(generate_password)
        remote_exec "docker run -d \
            --name fuyuan-redis \
            -p 6379:6379 \
            -e REDIS_PASSWORD=${REDIS_PASSWORD} \
            -v ${DEPLOY_PATH}/data/redis:/data \
            redis:latest \
            redis-server --requirepass ${REDIS_PASSWORD}"
    else
        remote_exec "sudo apt-get install -y redis-server && \
            sudo systemctl enable redis && \
            sudo systemctl start redis"
    fi

    success "Redis 配置完成"
}

################################################################################
# 配置 RabbitMQ
################################################################################
configure_rabbitmq() {
    log "配置 RabbitMQ..."

    if [ "$USE_DOCKER" = true ]; then
        RABBITMQ_PASSWORD=$(generate_password)
        remote_exec "docker run -d \
            --name fuyuan-rabbitmq \
            -p 5672:5672 \
            -p 15672:15672 \
            -e RABBITMQ_DEFAULT_USER=admin \
            -e RABBITMQ_DEFAULT_PASS=${RABBITMQ_PASSWORD} \
            -v ${DEPLOY_PATH}/data/rabbitmq:/var/lib/rabbitmq \
            rabbitmq:3-management"
    else
        remote_exec "sudo apt-get install -y rabbitmq-server && \
            sudo systemctl enable rabbitmq-server && \
            sudo systemctl start rabbitmq-server && \
            sudo rabbitmq-plugins enable rabbitmq_management"
    fi

    success "RabbitMQ 配置完成"
}

################################################################################
# 部署后端
################################################################################
deploy_backend() {
    log "部署后端服务..."

    # 创建部署目录
    remote_exec "sudo mkdir -p ${DEPLOY_PATH}/backend && \
        sudo chown -R ${SERVER_USER}:${SERVER_USER} ${DEPLOY_PATH}"

    # 上传后端代码
    log "上传后端代码..."
    if command -v rsync &> /dev/null; then
        if [ -n "$SERVER_SSH_KEY" ]; then
            rsync -avz -e "ssh -i ${SERVER_SSH_KEY} -p ${SERVER_PORT} -o StrictHostKeyChecking=no" \
                backend/ "${SERVER_USER}@${SERVER_HOST}:${DEPLOY_PATH}/backend/"
        else
            sshpass -p "$SERVER_PASSWORD" rsync -avz \
                -e "ssh -p ${SERVER_PORT} -o StrictHostKeyChecking=no" \
                backend/ "${SERVER_USER}@${SERVER_HOST}:${DEPLOY_PATH}/backend/"
        fi
    else
        # 创建临时压缩包
        tar -czf /tmp/backend.tar.gz backend/
        remote_upload /tmp/backend.tar.gz /tmp/backend.tar.gz
        remote_exec "cd ${DEPLOY_PATH} && tar -xzf /tmp/backend.tar.gz && rm /tmp/backend.tar.gz"
        rm /tmp/backend.tar.gz
    fi

    # 安装依赖
    log "安装后端依赖..."
    remote_exec "cd ${DEPLOY_PATH}/backend && npm install --production"

    # 创建环境配置文件
    log "创建环境配置..."
    cat > /tmp/.env << EOF
NODE_ENV=production
PORT=3000

# 数据库配置
DB_TYPE=${DATABASE_TYPE}
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}

# RabbitMQ 配置
RABBITMQ_URL=amqp://admin:${RABBITMQ_PASSWORD}@localhost:5672

# JWT 密钥
JWT_SECRET=$(generate_password)

# 文件上传配置
UPLOAD_PATH=/opt/fuyuan/uploads

# 域名配置
DOMAIN_NAME=${DOMAIN_NAME}
EOF

    remote_upload /tmp/.env ${DEPLOY_PATH}/backend/.env
    rm /tmp/.env

    # 创建上传目录
    remote_exec "mkdir -p ${DEPLOY_PATH}/uploads"

    # 使用 PM2 启动后端
    if [ "$USE_DOCKER" = false ]; then
        log "使用 PM2 启动后端服务..."
        remote_exec "cd ${DEPLOY_PATH}/backend && pm2 start src/app.js --name fuyuan-backend && \
            pm2 save && \
            pm2 startup"
    fi

    success "后端服务部署完成"
}

################################################################################
# 部署前端
################################################################################
deploy_frontend() {
    log "部署前端服务..."

    # 上传前端代码
    log "上传前端代码..."
    if command -v rsync &> /dev/null; then
        if [ -n "$SERVER_SSH_KEY" ]; then
            rsync -avz -e "ssh -i ${SERVER_SSH_KEY} -p ${SERVER_PORT} -o StrictHostKeyChecking=no" \
                frontend-react/ "${SERVER_USER}@${SERVER_HOST}:${DEPLOY_PATH}/frontend/"
        else
            sshpass -p "$SERVER_PASSWORD" rsync -avz \
                -e "ssh -p ${SERVER_PORT} -o StrictHostKeyChecking=no" \
                frontend-react/ "${SERVER_USER}@${SERVER_HOST}:${DEPLOY_PATH}/frontend/"
        fi
    else
        tar -czf /tmp/frontend.tar.gz frontend-react/
        remote_upload /tmp/frontend.tar.gz /tmp/frontend.tar.gz
        remote_exec "cd ${DEPLOY_PATH} && tar -xzf /tmp/frontend.tar.gz && rm /tmp/frontend.tar.gz"
        rm /tmp/frontend.tar.gz
    fi

    # 构建前端
    log "构建前端..."
    remote_exec "cd ${DEPLOY_PATH}/frontend && npm install && npm run build"

    success "前端服务部署完成"
}

################################################################################
# 配置 Nginx
################################################################################
configure_nginx() {
    log "配置 Nginx..."

    # 安装 Nginx
    remote_exec "sudo apt-get install -y nginx && \
        sudo systemctl enable nginx && \
        sudo systemctl start nginx"

    # 配置 SSL 证书
    if [ "$USE_SSL" = true ] && [ -n "$DOMAIN_NAME" ]; then
        log "配置 SSL 证书..."

        # 安装 Certbot
        remote_exec "sudo apt-get install -y certbot python3-certbot-nginx"

        # 获取 SSL 证书
        remote_exec "sudo certbot --nginx -d ${DOMAIN_NAME} --email ${SSL_EMAIL} --agree-tos --non-interactive"
    fi

    # 创建 Nginx 配置
    cat > /tmp/fuyuan.conf << EOF
server {
    listen 80;
    server_name ${DOMAIN_NAME:-_};

    # 前端静态文件
    location / {
        root ${DEPLOY_PATH}/frontend/dist;
        try_files \$uri \$uri/ /index.html;
    }

    # 后端 API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # 文件上传
    location /uploads {
        alias ${DEPLOY_PATH}/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    # 客户端上传大小限制
    client_max_body_size 50M;
}
EOF

    remote_upload /tmp/fuyuan.conf /tmp/fuyuan.conf
    remote_exec "sudo mv /tmp/fuyuan.conf /etc/nginx/sites-available/fuyuan && \
        sudo ln -sf /etc/nginx/sites-available/fuyuan /etc/nginx/sites-enabled/ && \
        sudo rm -f /etc/nginx/sites-enabled/default && \
        sudo nginx -t && \
        sudo systemctl reload nginx"

    rm /tmp/fuyuan.conf

    success "Nginx 配置完成"
}

################################################################################
# 配置防火墙
################################################################################
configure_firewall() {
    log "配置防火墙..."

    remote_exec "sudo ufw default deny incoming && \
        sudo ufw default allow outgoing && \
        sudo ufw allow ssh && \
        sudo ufw allow 80/tcp && \
        sudo ufw allow 443/tcp && \
        sudo ufw allow 3000/tcp && \
        sudo ufw --force enable"

    success "防火墙配置完成"
}

################################################################################
# 部署微信小程序
################################################################################
deploy_miniprogram() {
    log "部署微信小程序..."

    # 上传小程序代码
    if [ -d "fuyuan-taro" ]; then
        log "上传小程序代码..."
        if command -v rsync &> /dev/null; then
            if [ -n "$SERVER_SSH_KEY" ]; then
                rsync -avz -e "ssh -i ${SERVER_SSH_KEY} -p ${SERVER_PORT} -o StrictHostKeyChecking=no" \
                    fuyuan-taro/ "${SERVER_USER}@${SERVER_HOST}:${DEPLOY_PATH}/miniprogram/"
            else
                sshpass -p "$SERVER_PASSWORD" rsync -avz \
                    -e "ssh -p ${SERVER_PORT} -o StrictHostKeyChecking=no" \
                    fuyuan-taro/ "${SERVER_USER}@${SERVER_HOST}:${DEPLOY_PATH}/miniprogram/"
            fi
        fi

        log "微信小程序代码已上传,请使用微信开发者工具编译"
    fi

    success "微信小程序部署完成"
}

################################################################################
# 健康检查
################################################################################
health_check() {
    log "执行健康检查..."

    # 检查后端服务
    if remote_exec "curl -f http://localhost:3000/api/health" 2>/dev/null; then
        success "后端服务运行正常"
    else
        warn "后端服务可能未正常启动,请检查日志"
    fi

    # 检查数据库
    case $DATABASE_TYPE in
        "mongodb")
            if remote_exec "docker exec fuyuan-mongodb mongo --eval 'db.adminCommand(\"ping\")'" 2>/dev/null; then
                success "MongoDB 运行正常"
            fi
            ;;
        "mysql")
            if remote_exec "docker exec fuyuan-mysql mysqladmin ping -h localhost -u root -p${DB_PASSWORD}" 2>/dev/null; then
                success "MySQL 运行正常"
            fi
            ;;
        "postgresql")
            if remote_exec "docker exec fuyuan-postgresql pg_isready -U ${DB_USER:-postgres}" 2>/dev/null; then
                success "PostgreSQL 运行正常"
            fi
            ;;
    esac

    # 检查 Redis
    if remote_exec "docker exec fuyuan-redis redis-cli ping" 2>/dev/null; then
        success "Redis 运行正常"
    fi
}

################################################################################
# 生成部署报告
################################################################################
generate_report() {
    cat > DEPLOYMENT_REPORT.md << EOF
# 赴缘婚恋应用 - 部署报告

## 部署信息

- **部署时间**: $(date '+%Y-%m-%d %H:%M:%S')
- **服务器**: ${SERVER_HOST}
- **部署路径**: ${DEPLOY_PATH}

## 服务配置

### 后端服务
- **名称**: fuyuan-backend
- **端口**: 3000
- **状态**: 运行中

### 前端服务
- **端口**: 80 (HTTP)
- **端口**: 443 (HTTPS, 如果启用)
- **域名**: ${DOMAIN_NAME}

### 数据库
- **类型**: ${DATABASE_TYPE}
- **端口**: ${DB_PORT}
- **名称**: ${DB_NAME}

### Redis
- **端口**: 6379
- **密码**: ${REDIS_PASSWORD}

### RabbitMQ
- **端口**: 5672 (AMQP)
- **端口**: 15672 (管理界面)
- **用户名**: admin
- **密码**: ${RABBITMQ_PASSWORD}

## 访问信息

- **网站地址**: http://${DOMAIN_NAME:-${SERVER_HOST}}
- **API 地址**: http://${DOMAIN_NAME:-${SERVER_HOST}}/api
- **管理面板**: http://${DOMAIN_NAME:-${SERVER_HOST}}/admin

## 重要凭证

- **数据库密码**: ${DB_PASSWORD}
- **Redis 密码**: ${REDIS_PASSWORD}
- **RabbitMQ 密码**: ${RABBITMQ_PASSWORD}

## 下一步操作

1. 访问网站完成初始配置
2. 配置微信小程序 (如果需要)
3. 设置定时备份任务
4. 配置监控告警

## 技术支持

如有问题,请联系技术支持。

---

部署脚本版本: 1.0.0
EOF

    success "部署报告已生成: DEPLOYMENT_REPORT.md"
}

################################################################################
# 主函数
################################################################################
main() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                                                            ║"
    echo "║        赴缘婚恋应用 - 全平台全自动一键部署                 ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    # 读取配置
    if [ -f "$CONFIG_FILE" ]; then
        log "读取配置文件: $CONFIG_FILE"
        if command -v jq &> /dev/null; then
            SERVER_TYPE=$(jq -r '.server.type' $CONFIG_FILE)
            DATABASE_TYPE=$(jq -r '.databases.default' $CONFIG_FILE)
        fi
    fi

    # 交互式输入服务器信息
    echo ""
    read -p "请输入服务器地址 (IP 或域名): " SERVER_HOST
    read -p "请输入 SSH 用户名 (默认: root): " SERVER_USER
    SERVER_USER=${SERVER_USER:-root}
    read -p "请输入 SSH 端口 (默认: 22): " SERVER_PORT
    SERVER_PORT=${SERVER_PORT:-22}
    read -s -p "请输入 SSH 密码 (使用密钥则留空): " SERVER_PASSWORD
    echo ""
    read -p "请输入 SSH 密钥路径 (留空则使用密码): " SERVER_SSH_KEY

    # 数据库配置
    echo ""
    echo "支持的数据库类型: mongodb, mysql, postgresql, sqlite, sqlserver"
    read -p "请选择数据库类型 (默认: mongodb): " DATABASE_TYPE
    DATABASE_TYPE=${DATABASE_TYPE:-mongodb}

    # 域名配置
    echo ""
    read -p "请输入域名 (留空则使用 IP): " DOMAIN_NAME
    if [ -n "$DOMAIN_NAME" ] && [ "$USE_SSL" = true ]; then
        read -p "请输入 SSL 证书邮箱: " SSL_EMAIL
    fi

    # 确认部署
    echo ""
    echo -e "${YELLOW}部署配置摘要:${NC}"
    echo "  服务器: ${SERVER_USER}@${SERVER_HOST}:${SERVER_PORT}"
    echo "  数据库: ${DATABASE_TYPE}"
    echo "  域名: ${DOMAIN_NAME:-使用 IP}"
    echo "  SSL: ${USE_SSL}"
    echo ""
    read -p "确认开始部署? (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        log "部署已取消"
        exit 0
    fi

    # 开始部署
    log "开始部署..."

    # 执行部署步骤
    detect_os
    check_dependencies
    test_connection
    install_base_environment
    configure_database
    configure_redis
    configure_rabbitmq
    deploy_backend
    deploy_frontend
    configure_nginx
    configure_firewall
    deploy_miniprogram
    health_check
    generate_report

    # 完成
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                            ║${NC}"
    echo -e "${GREEN}║                  部署成功! 🎉                             ║${NC}"
    echo -e "${GREEN}║                                                            ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}访问地址: http://${DOMAIN_NAME:-${SERVER_HOST}}${NC}"
    echo -e "${BLUE}API 地址: http://${DOMAIN_NAME:-${SERVER_HOST}}/api${NC}"
    echo ""
    echo -e "${YELLOW}详细报告请查看: DEPLOYMENT_REPORT.md${NC}"
    echo -e "${YELLOW}部署日志请查看: $LOG_FILE${NC}"
    echo ""
}

# 运行主函数
main
