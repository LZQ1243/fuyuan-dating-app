# 通用数据库支持指南

本系统支持所有厂商、所有类型的数据库，包括但不限于：

## 📦 支持的数据库类型

### 1. 文档型数据库
- ✅ MongoDB
- ✅ Couchbase

### 2. 关系型数据库
- ✅ MySQL
- ✅ MariaDB
- ✅ PostgreSQL
- ✅ SQLite
- ✅ SQL Server
- ✅ Oracle

### 3. 键值数据库
- ✅ Redis

### 4. 搜索引擎
- ✅ Elasticsearch（计划中）

## 🌐 支持的云厂商

### 国内云服务商

#### 阿里云
- **RDS MySQL**: `mysql://user:pass@rm-*.mysql.rds.aliyuncs.com:3306/db`
- **RDS PostgreSQL**: `postgresql://user:pass@pgm-*.pg.rds.aliyuncs.com:1921/db`
- **RDS MariaDB**: `mariadb://user:pass@rm-*.mariadb.rds.aliyuncs.com:3306/db`
- **MongoDB副本集**: `mongodb://user:pass@dds-*.mongo.rds.aliyuncs.com:3717/db`
- **Redis**: `redis://:password@r-*.redis.rds.aliyuncs.com:6379`

#### 腾讯云
- **CDB MySQL**: `mysql://user:pass@cdb-*.gz.tencentcdb.com:3306/db`
- **PostgreSQL**: `postgresql://user:pass@pg-*.pg.tencentcloudapi.com:5432/db`
- **MongoDB**: `mongodb://user:pass@mongo-*.gz.mongodb.tencentcloudapi.com:27017/db`
- **Redis**: `redis://:password@redis-*.redis.tencentcloudapi.com:6379`

#### 华为云
- **RDS MySQL**: `mysql://user:pass@rds-*.mysql.rds.myhuaweicloud.com:3306/db`
- **DDS MongoDB**: `mongodb://user:pass@dds-*.mongo.huaweicloud.com:8635/db`
- **DCS Redis**: `redis://:password@redis-*.dcs.myhuaweicloud.com:6379`

### 国际云服务商

#### AWS (Amazon Web Services)
- **RDS MySQL**: `mysql://user:pass@db-*.us-east-1.rds.amazonaws.com:3306/db`
- **RDS PostgreSQL**: `postgresql://user:pass@db-*.us-east-1.rds.amazonaws.com:5432/db`
- **DocumentDB**: `mongodb://user:pass@docdb-*.cluster-*.us-east-1.docdb.amazonaws.com:27017/db?ssl=true`
- **ElastiCache**: `redis://:password@*.cluster-*.use1.cache.amazonaws.com:6379`

#### Google Cloud Platform
- **Cloud SQL MySQL**: `mysql://user:pass@10.0.0.1:3306/db`
- **Cloud SQL PostgreSQL**: `postgresql://user:pass@10.0.0.2:5432/db`
- **Cloud Memorystore**: `redis://:password@10.0.0.3:6379`

#### Microsoft Azure
- **SQL Database**: `sqlserver://user:pass@server.database.windows.net:1433/db`
- **Database for PostgreSQL**: `postgresql://user:pass@server.postgres.database.azure.com:5432/db`
- **Cosmos DB**: `mongodb://user:pass@account.mongo.cosmos.azure.com:10255/db`

#### 其他
- **MongoDB Atlas**: `mongodb+srv://user:pass@cluster0.abcde.mongodb.net/db`
- **DigitalOcean Managed Database**: `postgresql://user:pass@db-managed-*.do-user-1.ondigitalocean.com:25060/db`
- **Heroku Postgres**: `postgresql://user:pass@host.compute-1.amazonaws.com:5432/db`

## 🚀 快速开始

### 1. 安装数据库驱动（可选）

系统已内置MongoDB和MySQL驱动，其他数据库需要额外安装：

```bash
# PostgreSQL
npm install pg

# SQLite
npm install sqlite3

# SQL Server
npm install tedious

# Oracle
npm install oracledb

# Couchbase
npm install couchbase

# 一次性安装所有可选驱动
npm run install:all-dbs
```

### 2. 配置环境变量

#### 方式1: 使用环境变量文件

创建 `.env` 文件：

```bash
# 主数据库
DATABASE_URI=mongodb://admin:password@localhost:27017/fuyuan?authSource=admin

# 或使用MySQL
# DATABASE_URI=mysql://root:password@localhost:3306/fuyuan

# 或使用PostgreSQL
# DATABASE_URI=postgresql://postgres:password@localhost:5432/fuyuan
```

#### 方式2: 使用云数据库

```bash
# 阿里云RDS MySQL
DATABASE_URI=mysql://username:password@rm-bp123456.mysql.rds.aliyuncs.com:3306/fuyuan

# 腾讯云CDB MySQL
DATABASE_URI=mysql://username:password@cdb-123456.gz.tencentcdb.com:3306/fuyuan

# AWS RDS PostgreSQL
DATABASE_URI=postgresql://username:password@db-instance.123456.us-east-1.rds.amazonaws.com:5432/fuyuan

# MongoDB Atlas
DATABASE_URI=mongodb+srv://username:password@cluster0.abcde.mongodb.net/fuyuan?retryWrites=true&w=majority
```

### 3. 使用辅助数据库

如果需要同时使用多个数据库：

```bash
# 主数据库（MongoDB）
DATABASE_URI=mongodb://admin:password@localhost:27017/fuyuan

# 辅助数据库1（MySQL - 用于用户数据）
DATABASE_AUX1_URI=mysql://root:password@localhost:3306/fuyuan_users

# 辅助数据库2（PostgreSQL - 用于日志）
DATABASE_AUX2_URI=postgresql://postgres:password@localhost:5432/fuyuan_logs
```

### 4. 使用Docker Compose启动

提供了包含所有数据库类型的Docker Compose配置：

```bash
# 使用通用配置（包含所有数据库）
cd docker
cp .env.universal.example .env
docker-compose -f docker-compose.universal.yml up -d

# 或仅使用需要的数据库
# 编辑 .env 文件，取消注释需要的数据库
```

## 📋 配置选项

### 连接池配置

```bash
DB_POOL_SIZE=20              # 最大连接数
DB_MIN_POOL_SIZE=5           # 最小连接数
DB_TIMEOUT=5000              # 连接超时（毫秒）
DB_SOCKET_TIMEOUT=60000      # Socket超时（毫秒）
DB_IDLE_TIMEOUT=30000        # 空闲超时（毫秒）
```

### 数据库类型配置

系统会自动检测数据库类型，也可以手动指定：

```bash
DB_TYPE=mongodb              # 数据库类型（可选）
```

支持的类型：
- `mongodb` - MongoDB
- `mysql` - MySQL
- `mariadb` - MariaDB
- `postgresql` - PostgreSQL
- `sqlite` - SQLite
- `sqlserver` - SQL Server
- `oracle` - Oracle
- `couchbase` - Couchbase

## 🔧 代码示例

### 基本使用

```javascript
const { connectDB, getConnection } = require('./config/database');

// 连接数据库（自动识别类型）
const connection = await connectDB();

// 获取连接
const db = getConnection();

// 使用连接（根据数据库类型不同）
// MongoDB: 使用Mongoose模型
// MySQL: 使用connection.query()
// PostgreSQL: 使用pool.query()
// 等
```

### 辅助数据库使用

```javascript
const { connectAuxDB } = require('./config/database');

// 连接辅助数据库
const auxConnection1 = await connectAuxDB('users');
const auxConnection2 = await connectAuxDB('logs');

// 使用辅助数据库
// ...
```

### 健康检查

```javascript
const { healthCheck } = require('./config/database');

const isHealthy = await healthCheck();
if (isHealthy) {
  console.log('数据库健康');
} else {
  console.log('数据库异常');
}
```

### 关闭所有连接

```javascript
const { closeAllDB } = require('./config/database');

await closeAllDB();
```

## 📊 不同数据库的URI格式

### MongoDB

```
mongodb://[username:password@]host[:port][/database][?options]
```

示例：
- `mongodb://localhost:27017/fuyuan`
- `mongodb://admin:pass@localhost:27017/fuyuan?authSource=admin`
- `mongodb+srv://user:pass@cluster.mongodb.net/fuyuan?retryWrites=true`

### MySQL

```
mysql://[username:password@]host[:port][/database][?options]
```

示例：
- `mysql://root:pass@localhost:3306/fuyuan`
- `mysql://user:pass@127.0.0.1:3306/fuyuan`

### PostgreSQL

```
postgresql://[username:password@]host[:port][/database][?options]
```

示例：
- `postgresql://postgres:pass@localhost:5432/fuyuan`
- `postgres://user:pass@127.0.0.1:5432/fuyuan`

### SQLite

```
sqlite:[path/to/database]
```

示例：
- `sqlite:./database.sqlite`
- `sqlite:/data/fuyuan.db`

### SQL Server

```
sqlserver://[username:password@]host[:port][/database][?options]
```

示例：
- `sqlserver://sa:pass@localhost:1433/fuyuan`

### Oracle

```
oracle://[username:password@]host[:port][/database][?options]
```

示例：
- `oracle://user:pass@localhost:1521/orcl`

## 🔐 安全建议

1. **使用环境变量** - 不要在代码中硬编码数据库凭证
2. **限制访问** - 使用防火墙限制数据库访问IP
3. **使用SSL/TLS** - 云数据库默认启用，确保URI中包含 `ssl=true`
4. **定期轮换密码** - 定期更改数据库密码
5. **最小权限原则** - 数据库用户只授予必要的权限

## 🐛 故障排除

### 问题1: 数据库连接失败

**原因**: URI格式错误或数据库不可访问

**解决**:
1. 检查URI格式是否正确
2. 确认数据库服务是否运行
3. 检查网络连接和防火墙设置
4. 验证用户名和密码

### 问题2: 驱动未安装

**原因**: 尝试连接不支持的数据库类型

**解决**:
```bash
# 安装对应的驱动
npm install pg              # PostgreSQL
npm install sqlite3         # SQLite
npm install tedious         # SQL Server
npm install oracledb        # Oracle
npm install couchbase       # Couchbase
```

### 问题3: 连接池耗尽

**原因**: 并发连接数超过配置的最大值

**解决**:
```bash
# 增加连接池大小
DB_POOL_SIZE=50
DB_MIN_POOL_SIZE=10
```

### 问题4: 超时错误

**原因**: 数据库响应慢或网络延迟

**解决**:
```bash
# 增加超时时间
DB_TIMEOUT=10000
DB_SOCKET_TIMEOUT=90000
```

## 📚 更多资源

- [MongoDB连接字符串](https://www.mongodb.com/docs/manual/reference/connection-string/)
- [MySQL连接选项](https://dev.mysql.com/doc/connector-nodejs/en/connector-nodejs-connection-options.html)
- [PostgreSQL连接](https://node-postgres.com/features/connecting)
- [SQL Server连接](https://tediousjs.github.io/tedious/api-connection.html)
- [Oracle连接](https://node-oracledb.readthedocs.io/en/latest/user_guide/connection_handling.html)

## 💡 最佳实践

1. **使用连接池** - 提高性能，避免频繁创建连接
2. **合理配置超时** - 根据网络状况调整超时时间
3. **监控连接状态** - 定期检查数据库健康状态
4. **优雅关闭** - 应用退出时正确关闭所有连接
5. **使用索引** - 优化查询性能

---

**最后更新**: 2026-03-18
**维护**: Fuyuan Team
