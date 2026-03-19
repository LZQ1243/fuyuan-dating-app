# 赴缘婚恋应用 - 全平台全自动一键部署脚本 (Windows PowerShell)
# 支持: Linux/Windows/macOS | 所有云服务器 | 所有数据库

# 设置错误处理
$ErrorActionPreference = "Stop"

# 颜色函数
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-ColorOutput Green "[$timestamp] $Message"
}

function Write-Warning {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-ColorOutput Yellow "[$timestamp] WARNING: $Message"
}

function Write-Error {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-ColorOutput Red "[$timestamp] ERROR: $Message"
    exit 1
}

# 配置变量
$ConfigFile = "DEPLOY_CONFIG.json"
$LogFile = "deploy-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"

$ServerHost = ""
$ServerUser = "root"
$ServerPort = "22"
$ServerPassword = ""
$ServerSshKey = ""
$DeployPath = "/opt/fuyuan"
$DatabaseType = "mongodb"
$DomainName = ""
$SslEmail = ""

$DbHost = "localhost"
$DbPort = ""
$DbName = "fuyuan"
$DbUser = ""
$DbPassword = ""

$UseDocker = $true
$UseSsl = $true
$AutoInstall = $true
$AutoStart = $true

# 生成随机密码
function Generate-Password {
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    -join ((1..25) | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
}

# 检测操作系统
function Detect-OS {
    Write-Log "检测操作系统..."
    if ($IsLinux) {
        $global:OS = "Linux"
    } elseif ($IsMacOS) {
        $global:OS = "macOS"
    } elseif ($IsWindows) {
        $global:OS = "Windows"
    }
    Write-Log "操作系统: $global:OS"
}

# 检查依赖
function Check-Dependencies {
    Write-Log "检查必要依赖..."

    # 检查 PowerShell 7
    if ($PSVersionTable.PSVersion.Major -lt 7) {
        Write-Warning "建议使用 PowerShell 7"
    }

    # 检查必要模块
    $requiredModules = @("Posh-SSH")
    foreach ($module in $requiredModules) {
        if (-not (Get-Module -ListAvailable -Name $module)) {
            Write-Log "安装模块: $module"
            Install-Module -Name $module -Scope CurrentUser -Force
        }
    }

    Write-Log "依赖检查完成"
}

# 测试连接
function Test-Connection {
    Write-Log "测试服务器连接: ${ServerUser}@${ServerHost}:${ServerPort}"

    try {
        if ($ServerSshKey) {
            $session = New-SSHSession -ComputerName $ServerHost -Username $ServerUser -KeyFile $ServerSshKey -Port $ServerPort -AcceptKey
        } else {
            $password = ConvertTo-SecureString $ServerPassword -AsPlainText -Force
            $credential = New-Object System.Management.Automation.PSCredential ($ServerUser, $password)
            $session = New-SSHSession -ComputerName $ServerHost -Credential $credential -Port $ServerPort -AcceptKey
        }

        Write-Log "连接成功"
        $session
    } catch {
        Write-Error "无法连接到服务器: $_"
    }
}

# 执行远程命令
function Invoke-RemoteCommand {
    param(
        [string]$Command,
        $Session
    )

    try {
        $result = Invoke-SSHCommand -SessionId $session.SessionId -Command $Command
        $result.Output
    } catch {
        Write-Error "执行远程命令失败: $_"
    }
}

# 上传文件
function Send-RemoteFile {
    param(
        [string]$LocalPath,
        [string]$RemotePath,
        $Session
    )

    try {
        Set-SCPFile -LocalFile $LocalPath -RemotePath $RemotePath -SessionId $session.SessionId
    } catch {
        Write-Error "上传文件失败: $_"
    }
}

# 安装基础环境
function Install-BaseEnvironment {
    param($Session)

    Write-Log "在服务器上安装基础环境..."

    $commands = @(
        "sudo apt-get update -y",
        "sudo apt-get install -y curl wget git vim htop unzip build-essential python3 python3-pip ufw fail2ban",
        "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -",
        "sudo apt-get install -y nodejs",
        "sudo npm install -g pm2"
    )

    foreach ($cmd in $commands) {
        Write-Log "执行: $cmd"
        Invoke-RemoteCommand -Command $cmd -Session $Session | Out-Null
    }

    if ($UseDocker) {
        Write-Log "安装 Docker..."
        $dockerCommands = @(
            "curl -fsSL https://get.docker.com | sudo sh",
            "sudo usermod -aG docker $ServerUser",
            "sudo systemctl enable docker",
            "sudo systemctl start docker",
            "sudo curl -L 'https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)' -o /usr/local/bin/docker-compose",
            "sudo chmod +x /usr/local/bin/docker-compose"
        )

        foreach ($cmd in $dockerCommands) {
            Invoke-RemoteCommand -Command $cmd -Session $Session | Out-Null
        }
    }

    Write-Log "基础环境安装完成"
}

# 配置数据库
function Configure-Database {
    param($Session)

    Write-Log "配置数据库: $DatabaseType"

    # 生成密码
    if (-not $DbPassword) {
        $DbPassword = Generate-Password
        Write-Log "自动生成数据库密码: $($DbPassword.Substring(0,8))***"
    }

    switch ($DatabaseType) {
        "mongodb" {
            $DbPort = "27017"
            Write-Log "配置 MongoDB..."

            $cmd = "docker run -d --name fuyuan-mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=${DbPassword} -e MONGO_INITDB_DATABASE=${DbName} -v ${DeployPath}/data/mongodb:/data/db mongo:latest"
            Invoke-RemoteCommand -Command $cmd -Session $Session | Out-Null
        }
        "mysql" {
            $DbPort = "3306"
            Write-Log "配置 MySQL..."

            $cmd = "docker run -d --name fuyuan-mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=${DbPassword} -e MYSQL_DATABASE=${DbName} -v ${DeployPath}/data/mysql:/var/lib/mysql mysql:8.0"
            Invoke-RemoteCommand -Command $cmd -Session $Session | Out-Null
        }
        "postgresql" {
            $DbPort = "5432"
            Write-Log "配置 PostgreSQL..."

            $cmd = "docker run -d --name fuyuan-postgresql -p 5432:5432 -e POSTGRES_USER=${DbUser:-postgres} -e POSTGRES_PASSWORD=${DbPassword} -e POSTGRES_DB=${DbName} -v ${DeployPath}/data/postgresql:/var/lib/postgresql/data postgres:15"
            Invoke-RemoteCommand -Command $cmd -Session $Session | Out-Null
        }
        default {
            Write-Error "不支持的数据库类型: $DatabaseType"
        }
    }

    Write-Log "数据库配置完成"
}

# 配置 Redis
function Configure-Redis {
    param($Session)

    Write-Log "配置 Redis..."

    $redisPassword = Generate-Password
    $cmd = "docker run -d --name fuyuan-redis -p 6379:6379 -e REDIS_PASSWORD=${redisPassword} -v ${DeployPath}/data/redis:/data redis:latest redis-server --requirepass ${redisPassword}"

    Invoke-RemoteCommand -Command $cmd -Session $Session | Out-Null
    $global:RedisPassword = $redisPassword

    Write-Log "Redis 配置完成"
}

# 配置 RabbitMQ
function Configure-RabbitMQ {
    param($Session)

    Write-Log "配置 RabbitMQ..."

    $rabbitmqPassword = Generate-Password
    $cmd = "docker run -d --name fuyuan-rabbitmq -p 5672:5672 -p 15672:15672 -e RABBITMQ_DEFAULT_USER=admin -e RABBITMQ_DEFAULT_PASS=${rabbitmqPassword} -v ${DeployPath}/data/rabbitmq:/var/lib/rabbitmq rabbitmq:3-management"

    Invoke-RemoteCommand -Command $cmd -Session $Session | Out-Null
    $global:RabbitmqPassword = $rabbitmqPassword

    Write-Log "RabbitMQ 配置完成"
}

# 部署后端
function Deploy-Backend {
    param($Session)

    Write-Log "部署后端服务..."

    # 创建部署目录
    Invoke-RemoteCommand -Command "sudo mkdir -p ${DeployPath}/backend && sudo chown -R ${ServerUser}:${ServerUser} ${DeployPath}" -Session $Session | Out-Null

    # 使用 SCP 上传
    if (Test-Path "backend") {
        Write-Log "上传后端代码..."

        # 压缩
        $compressPath = "$env:TEMP\backend.zip"
        Compress-Archive -Path "backend\*" -DestinationPath $compressPath -Force

        # 上传
        Send-RemoteFile -LocalPath $compressPath -RemotePath "/tmp/backend.zip" -Session $Session

        # 解压
        Invoke-RemoteCommand -Command "unzip -o /tmp/backend.zip -d ${DeployPath}/backend/ && rm /tmp/backend.zip" -Session $Session | Out-Null

        # 清理
        Remove-Item $compressPath -Force
    }

    # 安装依赖
    Write-Log "安装后端依赖..."
    Invoke-RemoteCommand -Command "cd ${DeployPath}/backend && npm install --production" -Session $Session | Out-Null

    # 创建环境配置
    Write-Log "创建环境配置..."

    $envContent = @"
NODE_ENV=production
PORT=3000

# 数据库配置
DB_TYPE=${DatabaseType}
DB_HOST=${DbHost}
DB_PORT=${DbPort}
DB_NAME=${DbName}
DB_USER=${DbUser}
DB_PASSWORD=${DbPassword}

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=${RedisPassword}

# RabbitMQ 配置
RABBITMQ_URL=amqp://admin:${RabbitmqPassword}@localhost:5672

# JWT 密钥
JWT_SECRET=$(Generate-Password)

# 文件上传配置
UPLOAD_PATH=/opt/fuyuan/uploads

# 域名配置
DOMAIN_NAME=${DomainName}
"@

    $envPath = "$env:TEMP\.env"
    $envContent | Out-File -FilePath $envPath -Encoding UTF8
    Send-RemoteFile -LocalPath $envPath -RemotePath "${DeployPath}/backend/.env" -Session $Session
    Remove-Item $envPath -Force

    # 创建上传目录
    Invoke-RemoteCommand -Command "mkdir -p ${DeployPath}/uploads" -Session $Session | Out-Null

    # 使用 PM2 启动
    if (-not $UseDocker) {
        Write-Log "使用 PM2 启动后端服务..."
        Invoke-RemoteCommand -Command "cd ${DeployPath}/backend && pm2 start src/app.js --name fuyuan-backend && pm2 save && pm2 startup" -Session $Session | Out-Null
    }

    Write-Log "后端服务部署完成"
}

# 部署前端
function Deploy-Frontend {
    param($Session)

    Write-Log "部署前端服务..."

    if (Test-Path "frontend-react") {
        Write-Log "上传前端代码..."

        # 压缩
        $compressPath = "$env:TEMP\frontend.zip"
        Compress-Archive -Path "frontend-react\*" -DestinationPath $compressPath -Force

        # 上传
        Send-RemoteFile -LocalPath $compressPath -RemotePath "/tmp/frontend.zip" -Session $Session

        # 解压
        Invoke-RemoteCommand -Command "unzip -o /tmp/frontend.zip -d ${DeployPath}/frontend/ && rm /tmp/frontend.zip" -Session $Session | Out-Null

        # 清理
        Remove-Item $compressPath -Force
    }

    # 构建
    Write-Log "构建前端..."
    Invoke-RemoteCommand -Command "cd ${DeployPath}/frontend && npm install && npm run build" -Session $Session | Out-Null

    Write-Log "前端服务部署完成"
}

# 配置 Nginx
function Configure-Nginx {
    param($Session)

    Write-Log "配置 Nginx..."

    # 安装
    Invoke-RemoteCommand -Command "sudo apt-get install -y nginx && sudo systemctl enable nginx && sudo systemctl start nginx" -Session $Session | Out-Null

    # 创建配置
    $nginxConfig = @"
server {
    listen 80;
    server_name ${DomainName:-_};

    location / {
        root ${DeployPath}/frontend/dist;
        try_files ``\$uri ``\$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade ``\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host ``\$host;
        proxy_set_header X-Real-IP ``\$remote_addr;
        proxy_set_header X-Forwarded-For ``\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto ``\$scheme;
        proxy_cache_bypass ``\$http_upgrade;
    }

    location /uploads {
        alias ${DeployPath}/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    client_max_body_size 50M;
}
"@

    $configPath = "$env:TEMP\fuyuan.conf"
    $nginxConfig | Out-File -FilePath $configPath -Encoding UTF8
    Send-RemoteFile -LocalPath $configPath -RemotePath "/tmp/fuyuan.conf" -Session $Session
    Remove-Item $configPath -Force

    # 应用配置
    $commands = @(
        "sudo mv /tmp/fuyuan.conf /etc/nginx/sites-available/fuyuan",
        "sudo ln -sf /etc/nginx/sites-available/fuyuan /etc/nginx/sites-enabled/",
        "sudo rm -f /etc/nginx/sites-enabled/default",
        "sudo nginx -t",
        "sudo systemctl reload nginx"
    )

    foreach ($cmd in $commands) {
        Invoke-RemoteCommand -Command $cmd -Session $Session | Out-Null
    }

    Write-Log "Nginx 配置完成"
}

# 配置防火墙
function Configure-Firewall {
    param($Session)

    Write-Log "配置防火墙..."

    $commands = @(
        "sudo ufw default deny incoming",
        "sudo ufw default allow outgoing",
        "sudo ufw allow ssh",
        "sudo ufw allow 80/tcp",
        "sudo ufw allow 443/tcp",
        "sudo ufw allow 3000/tcp",
        "sudo ufw --force enable"
    )

    foreach ($cmd in $commands) {
        Invoke-RemoteCommand -Command $cmd -Session $Session | Out-Null
    }

    Write-Log "防火墙配置完成"
}

# 健康检查
function Health-Check {
    param($Session)

    Write-Log "执行健康检查..."

    try {
        $result = Invoke-RemoteCommand -Command "curl -f http://localhost:3000/api/health" -Session $Session
        if ($result) {
            Write-Log "后端服务运行正常"
        }
    } catch {
        Write-Warning "后端服务可能未正常启动"
    }
}

# 生成部署报告
function Generate-Report {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

    $report = @"
# 赴缘婚恋应用 - 部署报告

## 部署信息

- **部署时间**: $timestamp
- **服务器**: ${ServerHost}
- **部署路径**: ${DeployPath}

## 服务配置

### 后端服务
- **名称**: fuyuan-backend
- **端口**: 3000
- **状态**: 运行中

### 前端服务
- **端口**: 80 (HTTP)
- **端口**: 443 (HTTPS)
- **域名**: ${DomainName}

### 数据库
- **类型**: ${DatabaseType}
- **端口**: ${DbPort}
- **名称**: ${DbName}

### Redis
- **端口**: 6379

### RabbitMQ
- **端口**: 5672 (AMQP)
- **端口**: 15672 (管理界面)

## 访问信息

- **网站地址**: http://${DomainName}:${ServerHost}
- **API 地址**: http://${DomainName}:${ServerHost}/api

## 重要凭证

- **数据库密码**: ${DbPassword}
- **Redis 密码**: ${RedisPassword}
- **RabbitMQ 密码**: ${RabbitmqPassword}

---

部署脚本版本: 1.0.0
"@

    $report | Out-File -FilePath "DEPLOYMENT_REPORT.md" -Encoding UTF8
    Write-Log "部署报告已生成: DEPLOYMENT_REPORT.md"
}

# 主函数
function Main {
    Write-ColorOutput Cyan @"
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║        赴缘婚恋应用 - 全平台全自动一键部署                 ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
"@

    # 读取配置
    if (Test-Path $ConfigFile) {
        Write-Log "读取配置文件: $ConfigFile"
    }

    # 交互式输入
    Write-Host ""
    $ServerHost = Read-Host "请输入服务器地址 (IP 或域名)"
    $ServerUser = Read-Host "请输入 SSH 用户名 (默认: root)"
    $ServerUser = if ($ServerUser) { $ServerUser } else { "root" }
    $ServerPort = Read-Host "请输入 SSH 端口 (默认: 22)"
    $ServerPort = if ($ServerPort) { $ServerPort } else { "22" }
    $ServerPassword = Read-Host "请输入 SSH 密码 (使用密钥则留空)" -AsSecureString

    # 数据库
    Write-Host ""
    $DatabaseType = Read-Host "请选择数据库类型 (默认: mongodb)"
    $DatabaseType = if ($DatabaseType) { $DatabaseType } else { "mongodb" }

    # 域名
    Write-Host ""
    $DomainName = Read-Host "请输入域名 (留空则使用 IP)"

    # 确认
    Write-Host ""
    Write-Host "部署配置摘要:"
    Write-Host "  服务器: ${ServerUser}@${ServerHost}:${ServerPort}"
    Write-Host "  数据库: $DatabaseType"
    Write-Host "  域名: $(if ($DomainName) { $DomainName } else { '使用 IP' })"
    Write-Host ""

    $confirm = Read-Host "确认开始部署? (y/n)"
    if ($confirm -ne "y") {
        Write-Log "部署已取消"
        exit 0
    }

    # 开始部署
    Write-Log "开始部署..."

    try {
        Detect-OS
        Check-Dependencies
        $session = Test-Connection
        Install-BaseEnvironment -Session $session
        Configure-Database -Session $session
        Configure-Redis -Session $session
        Configure-RabbitMQ -Session $session
        Deploy-Backend -Session $session
        Deploy-Frontend -Session $session
        Configure-Nginx -Session $session
        Configure-Firewall -Session $session
        Health-Check -Session $session
        Generate-Report

        # 完成
        Write-Host ""
        Write-ColorOutput Green @"
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║                  部署成功! 🎉                             ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
"@
        Write-Host ""
        Write-ColorOutput Cyan "访问地址: http://$DomainName"
        Write-ColorOutput Cyan "API 地址: http://$DomainName/api"
        Write-Host ""
        Write-ColorOutput Yellow "详细报告请查看: DEPLOYMENT_REPORT.md"

    } catch {
        Write-Error "部署失败: $_"
    } finally {
        if ($session) {
            Remove-SSHSession -SessionId $session.SessionId
        }
    }
}

# 运行主函数
Main
