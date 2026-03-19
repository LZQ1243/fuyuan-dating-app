# 赴缘婚恋应用 - 生产环境部署脚本 (Windows)
# 使用方法: .\docker\deploy.ps1 [command]
# 命令: start|stop|restart|logs|clean|build

param(
    [Parameter(Position=0)]
    [ValidateSet("start", "stop", "restart", "logs", "clean", "build", "help")]
    [string]$Command = "start",

    [Parameter(Position=1)]
    [string]$Service = ""
)

# 颜色函数
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success { Write-ColorOutput Green @args }
function Write-Error { Write-ColorOutput Red @args }
function Write-Warning { Write-ColorOutput Yellow @args }
function Write-Info { Write-ColorOutput Cyan @args }

# 项目信息
$ProjectName = "fuyuan"
$ComposeFile = "docker/docker-compose.production.yml"
$EnvFile = "docker/.env.production"

# 检查Docker是否安装
function Test-Docker {
    try {
        $null = docker --version
        $null = docker-compose --version
        return $true
    } catch {
        return $false
    }
}

# 检查环境变量文件
function Test-EnvFile {
    if (-not (Test-Path $EnvFile)) {
        Write-Warning "环境变量文件不存在"
        Write-Host "正在创建环境变量文件..."
        try {
            Copy-Item "$EnvFile.example" $EnvFile -ErrorAction Stop
            Write-Success "已创建 $EnvFile"
            Write-Warning "请编辑此文件并设置正确的生产环境配置"
            Read-Host "按回车键继续..."
        } catch {
            Write-Error "无法创建环境变量文件"
            exit 1
        }
    }
}

# 启动服务
function Start-Services {
    Write-Info "========================================"
    Write-Info "启动赴缘婚恋应用"
    Write-Info "========================================"

    if (-not (Test-Docker)) {
        Write-Error "未安装Docker或Docker Compose"
        Write-Host "请先安装Docker Desktop: https://www.docker.com/products/docker-desktop"
        exit 1
    }

    Test-EnvFile

    Write-Success "正在拉取最新镜像..."
    docker-compose -f $ComposeFile --env-file $EnvFile pull

    Write-Success "正在构建镜像..."
    docker-compose -f $ComposeFile --env-file $EnvFile build

    Write-Success "正在启动服务..."
    docker-compose -f $ComposeFile --env-file $EnvFile up -d

    Write-Info "========================================"
    Write-Success "✓ 所有服务已启动"
    Write-Info "========================================"
    Write-Host ""
    Write-Host "服务访问地址:"
    Write-Host "  - 前端: http://localhost"
    Write-Host "  - 后端API: http://localhost/api"
    Write-Host "  - MongoDB管理: mongodb://localhost:27017"
    Write-Host "  - Redis CLI: docker exec -it fuyuan-redis redis-cli"
    Write-Host "  - RabbitMQ管理: http://localhost:15672"
    Write-Host ""
    Write-Host "查看日志: .\docker\deploy.ps1 logs"
}

# 停止服务
function Stop-Services {
    Write-Warning "停止所有服务..."
    docker-compose -f $ComposeFile --env-file $EnvFile down
    Write-Success "✓ 所有服务已停止"
}

# 重启服务
function Restart-Services {
    Write-Warning "重启所有服务..."
    Stop-Services
    Start-Services
}

# 查看日志
function View-Logs {
    if ($Service) {
        Write-Info "查看 $Service 日志..."
        docker-compose -f $ComposeFile --env-file $EnvFile logs -f $Service
    } else {
        Write-Info "查看所有服务日志..."
        docker-compose -f $ComposeFile --env-file $EnvFile logs -f
    }
}

# 清理
function Clean-All {
    Write-Error "警告: 此操作将删除所有容器、卷和数据"
    $confirm = Read-Host "确定要继续吗? (y/N)"
    if ($confirm -eq "y" -or $confirm -eq "Y") {
        Write-Warning "正在清理..."
        docker-compose -f $ComposeFile --env-file $EnvFile down -v --remove-orphans
        docker system prune -f
        Write-Success "✓ 清理完成"
    } else {
        Write-Host "已取消"
    }
}

# 仅构建镜像
function Build-Only {
    Write-Info "构建镜像..."
    if (-not (Test-Docker)) {
        Write-Error "未安装Docker或Docker Compose"
        exit 1
    }
    Test-EnvFile
    docker-compose -f $ComposeFile --env-file $EnvFile build
    Write-Success "✓ 镜像构建完成"
}

# 显示帮助
function Show-Help {
    Write-Host "用法: .\docker\deploy.ps1 [command] [service]"
    Write-Host ""
    Write-Host "命令:"
    Write-Host "  start    - 启动所有服务（默认）"
    Write-Host "  stop     - 停止所有服务"
    Write-Host "  restart  - 重启所有服务"
    Write-Host "  logs     - 查看日志（可选指定服务名）"
    Write-Host "  build    - 仅构建镜像"
    Write-Host "  clean    - 清理所有容器、卷和数据"
    Write-Host "  help     - 显示此帮助信息"
    Write-Host ""
    Write-Host "示例:"
    Write-Host "  .\docker\deploy.ps1 start"
    Write-Host "  .\docker\deploy.ps1 logs backend"
    Write-Host "  .\docker\deploy.ps1 restart"
}

# 主函数
switch ($Command) {
    "start" {
        Start-Services
    }
    "stop" {
        Stop-Services
    }
    "restart" {
        Restart-Services
    }
    "logs" {
        View-Logs
    }
    "clean" {
        Clean-All
    }
    "build" {
        Build-Only
    }
    "help" {
        Show-Help
    }
    default {
        Write-Error "错误: 未知命令 '$Command'"
        Show-Help
        exit 1
    }
}
