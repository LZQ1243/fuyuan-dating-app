/**
 * 智能资源加载器
 * 优化资源加载顺序和时机
 */

interface LoadConfig {
  priority?: 'high' | 'normal' | 'low';
  crossorigin?: 'anonymous' | 'use-credentials';
  integrity?: string;
  async?: boolean;
  defer?: boolean;
}

interface LoadResult {
  success: boolean;
  error?: Error;
  element?: HTMLElement;
}

class SmartLoader {
  private loadedResources: Set<string> = new Set();
  private loadingResources: Map<string, Promise<LoadResult>> = new Map();
  private resourceQueue: Array<{
    url: string;
    type: 'script' | 'style' | 'image' | 'font';
    config: LoadConfig;
    resolve: (result: LoadResult) => void;
  }> = [];
  private isProcessing: boolean = false;

  /**
   * 加载JavaScript
   */
  async loadScript(
    url: string,
    config: LoadConfig = {}
  ): Promise<LoadResult> {
    const key = `script:${url}`;

    // 已加载
    if (this.loadedResources.has(key)) {
      return { success: true };
    }

    // 正在加载
    if (this.loadingResources.has(key)) {
      return this.loadingResources.get(key)!;
    }

    // 开始加载
    const promise = new Promise<LoadResult>((resolve) => {
      const script = document.createElement('script');
      script.src = url;
      script.type = 'text/javascript';

      if (config.crossorigin) {
        script.crossOrigin = config.crossorigin;
      }

      if (config.integrity) {
        script.integrity = config.integrity;
      }

      if (config.async) {
        script.async = true;
      }

      if (config.defer) {
        script.defer = true;
      }

      script.onload = () => {
        this.loadedResources.add(key);
        resolve({ success: true, element: script });
      };

      script.onerror = () => {
        resolve({
          success: false,
          error: new Error(`Failed to load script: ${url}`)
        });
      };

      document.head.appendChild(script);
    });

    this.loadingResources.set(key, promise);
    const result = await promise;
    this.loadingResources.delete(key);

    return result;
  }

  /**
   * 加载CSS
   */
  async loadStyle(
    url: string,
    config: LoadConfig = {}
  ): Promise<LoadResult> {
    const key = `style:${url}`;

    if (this.loadedResources.has(key)) {
      return { success: true };
    }

    if (this.loadingResources.has(key)) {
      return this.loadingResources.get(key)!;
    }

    const promise = new Promise<LoadResult>((resolve) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.type = 'text/css';

      if (config.crossorigin) {
        link.crossOrigin = config.crossorigin;
      }

      link.onload = () => {
        this.loadedResources.add(key);
        resolve({ success: true, element: link });
      };

      link.onerror = () => {
        resolve({
          success: false,
          error: new Error(`Failed to load style: ${url}`)
        });
      };

      document.head.appendChild(link);
    });

    this.loadingResources.set(key, promise);
    const result = await promise;
    this.loadingResources.delete(key);

    return result;
  }

  /**
   * 预加载图片
   */
  async preloadImage(url: string): Promise<LoadResult> {
    const key = `image:${url}`;

    if (this.loadedResources.has(key)) {
      return { success: true };
    }

    if (this.loadingResources.has(key)) {
      return this.loadingResources.get(key)!;
    }

    const promise = new Promise<LoadResult>((resolve) => {
      const img = new Image();

      img.onload = () => {
        this.loadedResources.add(key);
        resolve({ success: true });
      };

      img.onerror = () => {
        resolve({
          success: false,
          error: new Error(`Failed to load image: ${url}`)
        });
      };

      img.src = url;
    });

    this.loadingResources.set(key, promise);
    const result = await promise;
    this.loadingResources.delete(key);

    return result;
  }

  /**
   * 预加载字体
   */
  async preloadFont(
    url: string,
    format: string = 'woff2'
  ): Promise<LoadResult> {
    const key = `font:${url}`;

    if (this.loadedResources.has(key)) {
      return { success: true };
    }

    if (this.loadingResources.has(key)) {
      return this.loadingResources.get(key)!;
    }

    const promise = new Promise<LoadResult>((resolve) => {
      const font = new FontFace(
        'CustomFont',
        `url('${url}') format('${format}')`
      );

      font.load()
        .then((loadedFont) => {
          document.fonts.add(loadedFont);
          this.loadedResources.add(key);
          resolve({ success: true });
        })
        .catch((error) => {
          resolve({
            success: false,
            error: new Error(`Failed to load font: ${url}`)
          });
        });
    });

    this.loadingResources.set(key, promise);
    const result = await promise;
    this.loadingResources.delete(key);

    return result;
  }

  /**
   * 批量加载资源
   */
  async loadBatch(
    resources: Array<{
      url: string;
      type: 'script' | 'style' | 'image' | 'font';
      config?: LoadConfig;
    }>
  ): Promise<LoadResult[]> {
    // 按优先级排序
    const sorted = resources.sort((a, b) => {
      const priorityA = (a.config?.priority || 'normal');
      const priorityB = (b.config?.priority || 'normal');
      const priorities = ['high', 'normal', 'low'];
      return priorities.indexOf(priorityA) - priorities.indexOf(priorityB);
    });

    // 并发加载
    const results = await Promise.all(
      sorted.map(resource => {
        switch (resource.type) {
          case 'script':
            return this.loadScript(resource.url, resource.config);
          case 'style':
            return this.loadStyle(resource.url, resource.config);
          case 'image':
            return this.preloadImage(resource.url);
          case 'font':
            return this.preloadFont(resource.url);
          default:
            return Promise.resolve({
              success: false,
              error: new Error(`Unknown resource type: ${resource.type}`)
            });
        }
      })
    );

    return results;
  }

  /**
   * 预连接域名
   */
  preconnect(domain: string): void {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    document.head.appendChild(link);
  }

  /**
   * DNS预解析
   */
  dnsPrefetch(domain: string): void {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
  }

  /**
   * 预加载资源
   */
  preload(
    url: string,
    as: string,
    type?: string,
    crossorigin?: string
  ): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = as;

    if (type) {
      link.type = type;
    }

    if (crossorigin) {
      link.crossOrigin = crossorigin;
    }

    document.head.appendChild(link);
  }

  /**
   * 智能预加载 - 基于用户行为预测
   */
  async intelligentPreload(urls: string[]): Promise<void> {
    // 空闲时预加载
    if ('requestIdleCallback' in window) {
      (requestIdleCallback as any)(() => {
        this.loadBatch(
          urls.map(url => ({ url, type: 'image' as const }))
        );
      });
    } else {
      // 降级方案
      setTimeout(() => {
        this.loadBatch(
          urls.map(url => ({ url, type: 'image' as const }))
        );
      }, 1000);
    }
  }

  /**
   * 检查资源是否已加载
   */
  isLoaded(url: string, type: 'script' | 'style' | 'image' | 'font'): boolean {
    const key = `${type}:${url}`;
    return this.loadedResources.has(key);
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.loadedResources.clear();
    this.loadingResources.clear();
  }

  /**
   * 获取加载状态
   */
  getLoadingStatus(): {
    loaded: number;
    loading: number;
    total: number;
  } {
    return {
      loaded: this.loadedResources.size,
      loading: this.loadingResources.size,
      total: this.loadedResources.size + this.loadingResources.size
    };
  }
}

// 创建全局实例
const smartLoader = new SmartLoader();

// 导出到window
if (typeof window !== 'undefined') {
  (window as any).smartLoader = smartLoader;
}

/**
 * 预加载关键资源
 */
export async function preloadCriticalResources() {
  // 预连接
  smartLoader.preconnect('https://api.fuyuan.com');
  smartLoader.preconnect('https://cdn.fuyuan.com');

  // DNS预解析
  smartLoader.dnsPrefetch('https://fonts.googleapis.com');
  smartLoader.dnsPrefetch('https://fonts.gstatic.com');

  // 预加载字体
  await smartLoader.preloadFont('/fonts/main.woff2');

  // 预加载关键JS
  await smartLoader.loadScript('/js/vendor.js', { priority: 'high' });
}

/**
 * 预加载路由资源
 */
export async function preloadRouteResources(route: string) {
  const resources: Record<string, string[]> = {
    '/': ['/images/home-hero.jpg', '/images/home-features.jpg'],
    '/match': ['/images/match-placeholder.jpg'],
    '/chat': [],
    '/profile': ['/images/avatar-default.jpg']
  };

  const urls = resources[route] || [];
  await smartLoader.intelligentPreload(urls);
}

// 导出
export default smartLoader;
export { SmartLoader };
