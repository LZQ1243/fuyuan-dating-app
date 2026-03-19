# 生产环境监控配置

## 📊 监控系统架构

### 整体架构
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Application │     │   System    │     │  Database   │
│   Metrics    │────▶│   Metrics   │────▶│   Metrics   │
└─────────────┘     └─────────────┘     └─────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
                     ┌─────────────┐
                     │ Prometheus  │
                     │ (采集)     │
                     └──────┬──────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
 ┌──────────┐      ┌──────────┐      ┌──────────┐
 │  Grafana │      │  AlertM  │      │   ELK    │
 │ (可视化) │      │  (告警)  │      │  (日志)  │
 └──────────┘      └──────────┘      └──────────┘
```

---

## 一、Prometheus配置

### 1.1 安装Prometheus
```yaml
# docker-compose.yml
services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: always
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
    networks:
      - monitoring

volumes:
  prometheus_data:
```

### 1.2 Prometheus配置
```yaml
# prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'fuyuan-production'
    environment: 'production'

# 告警规则
rule_files:
  - 'alerts/*.yml'

# 抓取配置
scrape_configs:
  # 应用指标
  - job_name: 'backend'
    metrics_path: '/api/metrics'
    scrape_interval: 10s
    static_configs:
      - targets: ['backend:3000']
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
        replacement: 'backend-production'

  # Nginx指标
  - job_name: 'nginx'
    metrics_path: '/nginx_status'
    scrape_interval: 10s
    static_configs:
      - targets: ['nginx:80']
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
        replacement: 'nginx-production'

  # MongoDB指标
  - job_name: 'mongodb'
    scrape_interval: 30s
    static_configs:
      - targets: ['mongodb-exporter:9216']

  # Redis指标
  - job_name: 'redis'
    scrape_interval: 30s
    static_configs:
      - targets: ['redis-exporter:9121']

  # Node Exporter (系统指标)
  - job_name: 'node'
    scrape_interval: 15s
    static_configs:
      - targets: ['node-exporter:9100']
```

### 1.3 告警规则
```yaml
# prometheus/alerts/api.yml
groups:
  - name: api_alerts
    interval: 30s
    rules:
      # API错误率告警
      - alert: HighAPIErrorRate
        expr: |
          (
            rate(http_requests_total{status=~"5.."}[5m]) /
            rate(http_requests_total[5m])
          ) > 0.05
        for: 5m
        labels:
          severity: critical
          component: api
        annotations:
          summary: "API错误率过高"
          description: "API错误率为 {{ $value | humanizePercentage }}"

      # API响应时间告警
      - alert: SlowAPIResponse
        expr: |
          histogram_quantile(0.95, http_request_duration_seconds_bucket) > 1
        for: 5m
        labels:
          severity: warning
          component: api
        annotations:
          summary: "API响应时间过长"
          description: "API P95响应时间为 {{ $value }}s"

      # 高QPS告警
      - alert: HighQPS
        expr: rate(http_requests_total[1m]) > 1000
        for: 2m
        labels:
          severity: warning
          component: api
        annotations:
          summary: "QPS过高"
          description: "当前QPS为 {{ $value }}"

# prometheus/alerts/system.yml
groups:
  - name: system_alerts
    interval: 30s
    rules:
      # CPU使用率告警
      - alert: HighCPUUsage
        expr: |
          100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
          component: system
        annotations:
          summary: "CPU使用率过高"
          description: "CPU使用率为 {{ $value }}%"

      # 内存使用率告警
      - alert: HighMemoryUsage
        expr: |
          (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 90
        for: 5m
        labels:
          severity: critical
          component: system
        annotations:
          summary: "内存使用率过高"
          description: "内存使用率为 {{ $value }}%"

      # 磁盘使用率告警
      - alert: HighDiskUsage
        expr: |
          (node_filesystem_avail_bytes{fstype!~"tmpfs|fuse.lxcfs"} /
           node_filesystem_size_bytes{fstype!~"tmpfs|fuse.lxcfs"}) * 100 < 15
        for: 10m
        labels:
          severity: warning
          component: system
        annotations:
          summary: "磁盘空间不足"
          description: "磁盘可用空间低于15%"

# prometheus/alerts/database.yml
groups:
  - name: database_alerts
    interval: 30s
    rules:
      # MongoDB连接数告警
      - alert: TooManyMongoDBConnections
        expr: mongodb_connections{state="current"} > 500
        for: 5m
        labels:
          severity: warning
          component: database
        annotations:
          summary: "MongoDB连接数过多"
          description: "当前连接数为 {{ $value }}"

      # Redis内存使用率告警
      - alert: HighRedisMemoryUsage
        expr: |
          redis_memory_used_bytes / redis_memory_max_bytes * 100 > 80
        for: 5m
        labels:
          severity: warning
          component: cache
        annotations:
          summary: "Redis内存使用率过高"
          description: "内存使用率为 {{ $value }}%"
```

---

## 二、Grafana配置

### 2.1 安装Grafana
```yaml
# docker-compose.yml
services:
  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: always
    ports:
      - "3001:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
      GF_INSTALL_PLUGINS: grafana-piechart-panel
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
    networks:
      - monitoring

volumes:
  grafana_data:
```

### 2.2 数据源配置
```yaml
# grafana/provisioning/datasources/prometheus.yml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
```

### 2.3 仪表板配置

#### 仪表板1: 应用性能
```json
{
  "title": "应用性能监控",
  "panels": [
    {
      "title": "API请求速率",
      "type": "graph",
      "targets": [
        {
          "expr": "rate(http_requests_total[5m])"
        }
      ]
    },
    {
      "title": "API响应时间 (P95)",
      "type": "graph",
      "targets": [
        {
          "expr": "histogram_quantile(0.95, http_request_duration_seconds_bucket)"
        }
      ]
    },
    {
      "title": "API错误率",
      "type": "graph",
      "targets": [
        {
          "expr": "rate(http_requests_total{status=~'5..'}[5m]) / rate(http_requests_total[5m])"
        }
      ]
    }
  ]
}
```

#### 仪表板2: 系统资源
```json
{
  "title": "系统资源监控",
  "panels": [
    {
      "title": "CPU使用率",
      "type": "graph",
      "targets": [
        {
          "expr": "100 - (avg by(instance) (irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)"
        }
      ]
    },
    {
      "title": "内存使用率",
      "type": "graph",
      "targets": [
        {
          "expr": "(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100"
        }
      ]
    },
    {
      "title": "磁盘使用率",
      "type": "graph",
      "targets": [
        {
          "expr": "(1 - (node_filesystem_avail_bytes{fstype!~\"tmpfs|fuse.lxcfs\"} / node_filesystem_size_bytes)) * 100"
        }
      ]
    }
  ]
}
```

---

## 三、AlertManager配置

### 3.1 安装AlertManager
```yaml
# docker-compose.yml
services:
  alertmanager:
    image: prom/alertmanager:latest
    container_name: alertmanager
    restart: always
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager/alertmanager.yml:/etc/alertmanager/alertmanager.yml
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
    networks:
      - monitoring
```

### 3.2 告警路由配置
```yaml
# alertmanager/alertmanager.yml
global:
  resolve_timeout: 5m
  # SMTP配置
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@fuyuan.com'
  smtp_auth_username: 'your-email@gmail.com'
  smtp_auth_password: 'your-password'

# 路由配置
route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'default'

  # 子路由
  routes:
    - match:
        severity: critical
      receiver: 'critical-alerts'

    - match:
        severity: warning
      receiver: 'warning-alerts'

# 接收器配置
receivers:
  # 默认接收器
  - name: 'default'
    email_configs:
      - to: 'team@fuyuan.com'
        headers:
          Subject: '[Prometheus] {{ .GroupLabels.alertname }}'

  # 严重告警
  - name: 'critical-alerts'
    email_configs:
      - to: 'oncall@fuyuan.com'
        headers:
          Subject: '[CRITICAL] {{ .GroupLabels.alertname }}'
    webhook_configs:
      - url: 'https://hooks.slack.com/services/xxx'
        send_resolved: true

  # 警告告警
  - name: 'warning-alerts'
    email_configs:
      - to: 'devops@fuyuan.com'
        headers:
          Subject: '[WARNING] {{ .GroupLabels.alertname }}'
    webhook_configs:
      - url: 'https://oapi.dingtalk.com/robot/send?access_token=xxx'
        send_resolved: true

# 抑制规则
inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'instance']
```

---

## 四、ELK日志系统

### 4.1 安装ELK
```yaml
# docker-compose.yml
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.5.0
    container_name: elasticsearch
    restart: always
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    networks:
      - monitoring

  logstash:
    image: docker.elastic.co/logstash/logstash:8.5.0
    container_name: logstash
    restart: always
    ports:
      - "5044:5044"
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline
    depends_on:
      - elasticsearch
    networks:
      - monitoring

  kibana:
    image: docker.elastic.co/kibana/kibana:8.5.0
    container_name: kibana
    restart: always
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch
    networks:
      - monitoring

volumes:
  elasticsearch_data:
```

### 4.2 Logstash配置
```ruby
# logstash/pipeline/logstash.conf
input {
  beats {
    port => 5044
  }
}

filter {
  if [fields][app] == "backend" {
    grok {
      match => {
        "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{GREEDYDATA:message}"
      }
    }
    date {
      match => [ "timestamp", "ISO8601" ]
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "fuyuan-%{+YYYY.MM.dd}"
  }
}
```

---

## 五、Sentry错误追踪

### 5.1 安装Sentry
```yaml
# docker-compose.yml
services:
  sentry:
    image: sentry:latest
    container_name: sentry
    restart: always
    ports:
      - "9000:9000"
    environment:
      - SENTRY_SECRET_KEY=your-secret-key
      - SENTRY_POSTGRES_HOST=postgres
      - SENTRY_REDIS_HOST=redis
    depends_on:
      - postgres
      - redis
    networks:
      - monitoring
```

### 5.2 应用集成
```javascript
// backend/src/monitoring/sentry.js
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
    new Sentry.Integrations.Mongo()
  ],

  beforeSend(event) {
    // 过滤敏感信息
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers['authorization'];
    }
    return event;
  }
});

module.exports = Sentry;
```

---

## 六、监控仪表板清单

### 必需仪表板
- [x] 应用性能监控
- [x] 系统资源监控
- [x] 数据库性能监控
- [x] 缓存性能监控
- [x] 告警概览
- [x] 业务指标监控

### 自定义仪表板
- [ ] 用户活跃度
- [ ] 匹配成功率
- [ ] 聊天消息量
- [ ] 动态发布量
- [ ] 收入统计

---

## 七、监控最佳实践

1. **监控指标**
   - RED方法: Rate (速率)、Errors (错误)、Duration (持续时间)
   - 四黄金指标: 延迟、流量、错误、饱和度
   - USE方法: Utilization (利用率)、Saturation (饱和度)、Errors (错误)

2. **告警策略**
   - 告警级别: Critical (严重)、Warning (警告)、Info (信息)
   - 告警频率: 避免告警疲劳
   - 告警分组: 相关告警合并
   - 告警静默: 维护期间静默

3. **数据保留**
   - Prometheus: 30天
   - Elasticsearch: 90天
   - 日志归档: 1年

4. **监控维护**
   - 定期检查告警规则
   - 优化仪表板
   - 更新监控文档
   - 培训运维人员

---

**最后更新**: 2026-03-20
**维护人员**: DevOps Team
