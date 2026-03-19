/**
 * 性能监控工具
 * 监控页面性能指标
 */

interface PerformanceMetrics {
  // 导航相关
  domContentLoaded: number;
  loadComplete: number;
  // 渲染相关
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  // 资源相关
  totalResources: number;
  totalSize: number;
  // 内存相关
  memoryUsed: number;
  memoryLimit: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    domContentLoaded: 0,
    loadComplete: 0,
    firstPaint: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    firstInputDelay: 0,
    cumulativeLayoutShift: 0,
    totalResources: 0,
    totalSize: 0,
    memoryUsed: 0,
    memoryLimit: 0
  };

  private startTime: number = Date.now();
  private layoutShiftEntries: any[] = [];

  constructor() {
    this.init();
  }

  private init() {
    // 监听页面加载
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.metrics.domContentLoaded = performance.now();
      });

      window.addEventListener('load', () => {
        this.metrics.loadComplete = performance.now();
        this.collectResourceMetrics();
        this.collectMemoryMetrics();
        this.reportMetrics();
      });
    }

    // 监听首次绘制
    this.observePaint();

    // 监听LCP
    this.observeLCP();

    // 监听FID
    this.observeFID();

    // 监听CLS
    this.observeCLS();

    // 监听长任务
    this.observeLongTasks();
  }

  // 观察首次绘制
  private observePaint() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-paint') {
            this.metrics.firstPaint = entry.startTime;
            console.log(`✅ FP: ${entry.startTime.toFixed(2)}ms`);
          }
          if (entry.name === 'first-contentful-paint') {
            this.metrics.firstContentfulPaint = entry.startTime;
            console.log(`✅ FCP: ${entry.startTime.toFixed(2)}ms`);
          }
        }
      });

      observer.observe({ entryTypes: ['paint'] });
    }
  }

  // 观察LCP
  private observeLCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        this.metrics.largestContentfulPaint = lastEntry.startTime;
        console.log(`✅ LCP: ${lastEntry.startTime.toFixed(2)}ms`);
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }

  // 观察FID
  private observeFID() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as any;
          this.metrics.firstInputDelay = fidEntry.processingStart - fidEntry.startTime;
          console.log(`✅ FID: ${this.metrics.firstInputDelay.toFixed(2)}ms`);
        }
      });

      observer.observe({ entryTypes: ['first-input'] });
    }
  }

  // 观察CLS
  private observeCLS() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            this.layoutShiftEntries.push(entry);
          }
        }

        // 计算CLS
        let clsValue = 0;
        this.layoutShiftEntries.forEach((entry: any) => {
          clsValue += entry.value;
        });
        this.metrics.cumulativeLayoutShift = clsValue;
        console.log(`✅ CLS: ${clsValue.toFixed(4)}`);
      });

      observer.observe({ entryTypes: ['layout-shift'] });
    }
  }

  // 观察长任务
  private observeLongTasks() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.warn(`⚠️ Long task detected: ${(entry as any).duration.toFixed(2)}ms`);
        }
      });

      observer.observe({ entryTypes: ['longtask'] });
    }
  }

  // 收集资源指标
  private collectResourceMetrics() {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    this.metrics.totalResources = resources.length;

    let totalSize = 0;
    resources.forEach((resource) => {
      if (resource.transferSize > 0) {
        totalSize += resource.transferSize;
      }
    });

    this.metrics.totalSize = totalSize;
    console.log(`✅ Resources: ${resources.length}, Total size: ${(totalSize / 1024).toFixed(2)}KB`);
  }

  // 收集内存指标
  private collectMemoryMetrics() {
    const memory = (performance as any).memory;
    if (memory) {
      this.metrics.memoryUsed = memory.usedJSHeapSize;
      this.metrics.memoryLimit = memory.jsHeapSizeLimit;
      const usage = ((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(2);
      console.log(`✅ Memory: ${usage}% used`);
    }
  }

  // 上报性能指标
  private reportMetrics() {
    const report = {
      url: location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      metrics: this.metrics,
      device: {
        width: window.innerWidth,
        height: window.innerHeight,
        pixelRatio: window.devicePixelRatio
      }
    };

    console.log('📊 Performance Report:', report);

    // 发送到服务器
    this.sendToServer(report);
  }

  // 发送到服务器
  private async sendToServer(report: any) {
    try {
      await fetch('/api/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(report)
      });
    } catch (error) {
      console.error('Failed to report performance:', error);
    }
  }

  // 获取当前指标
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // 获取Web Vitals评分
  public getWebVitalsScore() {
    const scores = {
      fcp: this.getScore(this.metrics.firstContentfulPaint, [1800, 3000]),
      lcp: this.getScore(this.metrics.largestContentfulPaint, [2500, 4000]),
      fid: this.getScore(this.metrics.firstInputDelay, [100, 300]),
      cls: this.getScore(this.metrics.cumulativeLayoutShift, [0.1, 0.25], true)
    };

    return scores;
  }

  // 计算评分
  private getScore(value: number, thresholds: number[], reverse = false): 'good' | 'needs-improvement' | 'poor' {
    if (reverse) {
      return value <= thresholds[0] ? 'good' : value <= thresholds[1] ? 'needs-improvement' : 'poor';
    }
    return value <= thresholds[0] ? 'good' : value <= thresholds[1] ? 'needs-improvement' : 'poor';
  }

  // 标记用户操作
  public mark(name: string) {
    performance.mark(name);
  }

  // 测量时间
  public measure(name: string, startMark: string, endMark?: string) {
    performance.measure(name, startMark, endMark);
    const measure = performance.getEntriesByName(name, 'measure')[0];
    console.log(`⏱️ ${name}: ${measure.duration.toFixed(2)}ms`);
  }
}

// 创建全局实例
export const performanceMonitor = new PerformanceMonitor();

// 导出到window用于调试
if (typeof window !== 'undefined') {
  (window as any).performanceMonitor = performanceMonitor;
}
