/**
 * 性能监控
 * 监控应用性能指标、系统资源使用情况
 */

const os = require('os');
const v8 = require('v8');

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      // 应用性能
      responseTimes: [],
      requestCount: 0,
      errorCount: 0,

      // 系统资源
      cpuUsage: [],
      memoryUsage: [],
      heapUsage: [],

      // 数据库性能
      dbQueryTimes: [],
      dbConnectionCount: 0,

      // 缓存性能
      cacheHits: 0,
      cacheMisses: 0
    };

    this.maxMetrics = 1000; // 保留最近1000条记录
  }

  /**
   * 记录API响应时间
   */
  recordResponseTime(duration) {
    this.metrics.responseTimes.push({
      timestamp: Date.now(),
      duration
    });

    if (this.metrics.responseTimes.length > this.maxMetrics) {
      this.metrics.responseTimes.shift();
    }

    this.metrics.requestCount++;
  }

  /**
   * 记录错误
   */
  recordError() {
    this.metrics.errorCount++;
  }

  /**
   * 记录CPU使用率
   */
  recordCPUUsage() {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = 100 - (100 * idle) / total;

    this.metrics.cpuUsage.push({
      timestamp: Date.now(),
      usage
    });

    if (this.metrics.cpuUsage.length > this.maxMetrics) {
      this.metrics.cpuUsage.shift();
    }
  }

  /**
   * 记录内存使用
   */
  recordMemoryUsage() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const usage = (usedMemory / totalMemory) * 100;

    this.metrics.memoryUsage.push({
      timestamp: Date.now(),
      total: totalMemory,
      used: usedMemory,
      usage
    });

    if (this.metrics.memoryUsage.length > this.maxMetrics) {
      this.metrics.memoryUsage.shift();
    }
  }

  /**
   * 记录堆内存使用
   */
  recordHeapUsage() {
    const heapStats = v8.getHeapStatistics();

    this.metrics.heapUsage.push({
      timestamp: Date.now(),
      used: heapStats.used_heap_size,
      total: heapStats.total_heap_size,
      limit: heapStats.heap_size_limit,
      usage: (heapStats.used_heap_size / heapStats.heap_size_limit) * 100
    });

    if (this.metrics.heapUsage.length > this.maxMetrics) {
      this.metrics.heapUsage.shift();
    }
  }

  /**
   * 记录数据库查询时间
   */
  recordDBQueryTime(duration) {
    this.metrics.dbQueryTimes.push({
      timestamp: Date.now(),
      duration
    });

    if (this.metrics.dbQueryTimes.length > this.maxMetrics) {
      this.metrics.dbQueryTimes.shift();
    }
  }

  /**
   * 记录数据库连接
   */
  recordDBConnection() {
    this.metrics.dbConnectionCount++;
  }

  /**
   * 记录缓存命中
   */
  recordCacheHit() {
    this.metrics.cacheHits++;
  }

  /**
   * 记录缓存未命中
   */
  recordCacheMiss() {
    this.metrics.cacheMisses++;
  }

  /**
   * 计算百分位数
   */
  calculatePercentile(data, percentile) {
    if (data.length === 0) return 0;

    const sorted = [...data].sort((a, b) => a.duration - b.duration);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index]?.duration || 0;
  }

  /**
   * 计算平均值
   */
  calculateAverage(data) {
    if (data.length === 0) return 0;

    const sum = data.reduce((acc, item) => acc + item.duration, 0);
    return sum / data.length;
  }

  /**
   * 获取响应时间统计
   */
  getResponseTimeStats() {
    const durations = this.metrics.responseTimes.map(r => r.duration);

    return {
      p50: this.calculatePercentile(durations, 50),
      p90: this.calculatePercentile(durations, 90),
      p95: this.calculatePercentile(durations, 95),
      p99: this.calculatePercentile(durations, 99),
      avg: this.calculateAverage(durations),
      min: Math.min(...durations),
      max: Math.max(...durations),
      count: durations.length
    };
  }

  /**
   * 获取系统资源统计
   */
  getSystemStats() {
    const latestCPU = this.metrics.cpuUsage[this.metrics.cpuUsage.length - 1];
    const latestMemory = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
    const latestHeap = this.metrics.heapUsage[this.metrics.heapUsage.length - 1];

    return {
      cpu: {
        usage: latestCPU?.usage || 0,
        cores: os.cpus().length
      },
      memory: {
        total: latestMemory?.total || 0,
        used: latestMemory?.used || 0,
        usage: latestMemory?.usage || 0
      },
      heap: {
        used: latestHeap?.used || 0,
        total: latestHeap?.total || 0,
        limit: latestHeap?.limit || 0,
        usage: latestHeap?.usage || 0
      },
      loadavg: os.loadavg(),
      uptime: os.uptime()
    };
  }

  /**
   * 获取数据库性能统计
   */
  getDBStats() {
    const queryTimes = this.metrics.dbQueryTimes.map(q => q.duration);

    return {
      queryTime: {
        p50: this.calculatePercentile(queryTimes, 50),
        p90: this.calculatePercentile(queryTimes, 90),
        p95: this.calculatePercentile(queryTimes, 95),
        p99: this.calculatePercentile(queryTimes, 99),
        avg: this.calculateAverage(queryTimes),
        count: queryTimes.length
      },
      connections: this.metrics.dbConnectionCount
    };
  }

  /**
   * 获取缓存统计
   */
  getCacheStats() {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    const hitRate = total > 0 ? (this.metrics.cacheHits / total) * 100 : 0;

    return {
      hits: this.metrics.cacheHits,
      misses: this.metrics.cacheMisses,
      total,
      hitRate: hitRate.toFixed(2)
    };
  }

  /**
   * 获取错误率
   */
  getErrorRate() {
    const total = this.metrics.requestCount;
    const errors = this.metrics.errorCount;
    const errorRate = total > 0 ? (errors / total) * 100 : 0;

    return {
      errors,
      total,
      errorRate: errorRate.toFixed(2)
    };
  }

  /**
   * 获取性能摘要
   */
  getSummary() {
    return {
      timestamp: new Date(),
      responseTime: this.getResponseTimeStats(),
      system: this.getSystemStats(),
      database: this.getDBStats(),
      cache: this.getCacheStats(),
      errors: this.getErrorRate()
    };
  }

  /**
   * 清除旧数据
   */
  clearOldMetrics(olderThan = 3600000) { // 默认保留1小时内的数据
    const now = Date.now();
    const cutoff = now - olderThan;

    this.metrics.responseTimes = this.metrics.responseTimes.filter(
      m => m.timestamp > cutoff
    );
    this.metrics.cpuUsage = this.metrics.cpuUsage.filter(m => m.timestamp > cutoff);
    this.metrics.memoryUsage = this.metrics.memoryUsage.filter(
      m => m.timestamp > cutoff
    );
    this.metrics.heapUsage = this.metrics.heapUsage.filter(m => m.timestamp > cutoff);
    this.metrics.dbQueryTimes = this.metrics.dbQueryTimes.filter(
      m => m.timestamp > cutoff
    );
  }

  /**
   * 启动定时监控
   */
  startMonitoring(interval = 60000) { // 默认每分钟记录一次
    this.monitoringInterval = setInterval(() => {
      this.recordCPUUsage();
      this.recordMemoryUsage();
      this.recordHeapUsage();
      this.clearOldMetrics();
    }, interval);

    console.log(`✅ 性能监控已启动, 间隔: ${interval}ms`);
  }

  /**
   * 停止监控
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      console.log('⏸️  性能监控已停止');
    }
  }
}

module.exports = new PerformanceMonitor();
