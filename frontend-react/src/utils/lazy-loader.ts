/**
 * 懒加载工具
 * 提供组件、页面、资源的懒加载功能
 */

import { lazy, Suspense } from 'react';
import { Spin } from 'antd';

/**
 * 懒加载组件包装器
 * 自动添加加载状态
 */
export const withLazyLoad = (importFunc, fallback = <Spin size="large" />) => {
  const LazyComponent = lazy(importFunc);

  return (props: any) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

/**
 * 创建骨架屏加载器
 */
export const createSkeletonLoader = (SkeletonComponent: any) => {
  return <SkeletonComponent />;
};

/**
 * 图片懒加载观察器
 */
class ImageLazyLoader {
  private observer: IntersectionObserver | null = null;
  private imageMap: Map<Element, string> = new Map();

  constructor() {
    if (typeof IntersectionObserver !== 'undefined') {
      this.observer = new IntersectionObserver(
        this.handleIntersect.bind(this),
        {
          rootMargin: '50px 0px',
          threshold: 0.01
        }
      );
    }
  }

  /**
   * 处理图片进入视口
   */
  private handleIntersect(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = this.imageMap.get(img);

        if (src) {
          img.src = src;
          img.classList.add('loaded');
          this.observer?.unobserve(img);
          this.imageMap.delete(img);
        }
      }
    });
  }

  /**
   * 观察图片
   */
  observe(img: HTMLImageElement, src: string) {
    if (this.observer) {
      this.imageMap.set(img, src);
      this.observer.observe(img);
    } else {
      // 不支持IntersectionObserver则直接加载
      img.src = src;
    }
  }

  /**
   * 停止观察
   */
  disconnect() {
    this.observer?.disconnect();
  }
}

/**
 * 全局图片懒加载实例
 */
export const imageLazyLoader = new ImageLazyLoader();

/**
 * 预加载资源
 */
export const preloadResource = (url: string, type: 'image' | 'script' | 'style' | 'font') => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;

    switch (type) {
      case 'image':
        link.as = 'image';
        break;
      case 'script':
        link.as = 'script';
        break;
      case 'style':
        link.as = 'style';
        break;
      case 'font':
        link.as = 'font';
        link.crossOrigin = 'anonymous';
        break;
    }

    link.onload = () => resolve(url);
    link.onerror = () => reject(new Error(`Failed to preload: ${url}`));

    document.head.appendChild(link);
  });

  // 预加载完成后移除
  setTimeout(() => {
    document.head.removeChild(link);
  }, 60000);
};

/**
 * 预获取资源
 */
export const prefetchResource = (url: string) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);

  // 预获取完成后移除
  setTimeout(() => {
    document.head.removeChild(link);
  }, 60000);
};

/**
 * 预加载图片
 */
export const preloadImages = (urls: string[]) => {
  return Promise.all(urls.map(url => preloadResource(url, 'image')));
};

/**
 * 预获取路由
 */
export const prefetchRoutes = (routes: string[]) => {
  routes.forEach(route => prefetchResource(route));
};

/**
 * 组件懒加载配置
 */
export const LazyComponents = {
  // 重型组件
  Charts: withLazyLoad(() => import('../components/Charts')),
  VideoPlayer: withLazyLoad(() => import('../components/VideoPlayer')),
  AudioPlayer: withLazyLoad(() => import('../components/AudioPlayer')),
  Map: withLazyLoad(() => import('../components/Map')),

  // 功能组件
  CommentList: withLazyLoad(() => import('../components/CommentList')),
  SharePanel: withLazyLoad(() => import('../components/SharePanel')),
  ReportPanel: withLazyLoad(() => import('../components/ReportPanel')),
};

/**
 * 页面懒加载配置
 */
export const LazyPages = {
  // 首页和常用页面 (不懒加载)
  Home: withLazyLoad(() => import('../pages/Home'), createSkeletonLoader(require('../components/Skeleton/HomeSkeleton').default)),

  // 用户相关
  Profile: withLazyLoad(() => import('../pages/Profile')),
  Settings: withLazyLoad(() => import('../pages/Settings')),

  // 社交相关
  Moments: withLazyLoad(() => import('../pages/Moments')),
  Posts: withLazyLoad(() => import('../pages/Posts')),
  Comments: withLazyLoad(() => import('../pages/Comments')),

  // 匹配相关
  Match: withLazyLoad(() => import('../pages/Match')),
  Recommendations: withLazyLoad(() => import('../pages/Recommendations')),

  // 聊天相关
  Chat: withLazyLoad(() => import('../pages/Chat')),
  ChatList: withLazyLoad(() => import('../pages/ChatList')),

  // 媒体相关
  ShortVideos: withLazyLoad(() => import('../pages/ShortVideos')),
  LiveList: withLazyLoad(() => import('../pages/LiveList')),
  LiveRoom: withLazyLoad(() => import('../pages/LiveRoom')),
};

/**
 * 资源预加载策略
 */
export const PreloadStrategy = {
  /**
   * 预加载关键资源
   */
  preloadCriticalResources: async () => {
    const criticalResources = [
      // 图片
      '/images/logo.png',
      '/icons/default-avatar.png',

      // 字体
      '/fonts/main.woff2',

      // 脚本
    ];

    await Promise.allSettled(criticalResources.map(url => preloadResource(url, 'image')));
  },

  /**
   * 预加载用户可能访问的页面
   */
  prefetchLikelyPages: (userRole: 'user' | 'admin' | 'matchmaker') => {
    const routes = {
      user: ['/profile', '/settings', '/moments', '/match'],
      admin: ['/admin/dashboard', '/admin/users', '/admin/config'],
      matchmaker: ['/matchmaker/dashboard', '/matchmaker/users']
    };

    prefetchRoutes(routes[userRole] || []);
  },

  /**
   * 预加载hover资源
   */
  preloadOnHover: (element: HTMLElement, url: string) => {
    let preloadTimer: NodeJS.Timeout;

    element.addEventListener('mouseenter', () => {
      preloadTimer = setTimeout(() => {
        preloadResource(url, 'image');
      }, 300);
    });

    element.addEventListener('mouseleave', () => {
      clearTimeout(preloadTimer);
    });
  }
};

/**
 * 懒加载性能监控
 */
export const LazyLoadMetrics = {
  metrics: {
    totalLazyLoad: 0,
    loadedLazyLoad: 0,
    failedLazyLoad: 0,
    averageLoadTime: 0
  },

  /**
   * 记录懒加载开始
   */
  recordStart: (id: string) => {
    performance.mark(`lazy-load-start-${id}`);
  },

  /**
   * 记录懒加载完成
   */
  recordEnd: (id: string, success: boolean) => {
    performance.mark(`lazy-load-end-${id}`);
    performance.measure(
      `lazy-load-${id}`,
      `lazy-load-start-${id}`,
      `lazy-load-end-${id}`
    );

    const measure = performance.getEntriesByName(`lazy-load-${id}`)[0];
    if (measure) {
      LazyLoadMetrics.metrics.averageLoadTime =
        (LazyLoadMetrics.metrics.averageLoadTime * LazyLoadMetrics.metrics.loadedLazyLoad +
         measure.duration) /
        (LazyLoadMetrics.metrics.loadedLazyLoad + 1);

      LazyLoadMetrics.metrics.totalLazyLoad++;

      if (success) {
        LazyLoadMetrics.metrics.loadedLazyLoad++;
      } else {
        LazyLoadMetrics.metrics.failedLazyLoad++;
      }
    }

    // 清理性能标记
    performance.clearMarks(`lazy-load-start-${id}`);
    performance.clearMarks(`lazy-load-end-${id}`);
    performance.clearMeasures(`lazy-load-${id}`);
  },

  /**
   * 获取统计信息
   */
  getStats: () => {
    return {
      ...LazyLoadMetrics.metrics,
      successRate: LazyLoadMetrics.metrics.loadedLazyLoad / LazyLoadMetrics.metrics.totalLazyLoad || 0
    };
  }
};

/**
 * 初始化懒加载
 */
export const initLazyLoad = () => {
  // 预加载关键资源
  PreloadStrategy.preloadCriticalResources();

  // 启动图片懒加载
  document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
      const src = img.getAttribute('data-src');
      if (src) {
        imageLazyLoader.observe(img as HTMLImageElement, src);
      }
    });
  });

  console.log('✅ 懒加载初始化完成');
};

export default initLazyLoad;
