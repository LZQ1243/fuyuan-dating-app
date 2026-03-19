/**
 * 图片优化工具
 * 自动优化图片,提升加载性能
 */

interface ImageOptimizationOptions {
  quality?: number; // 质量 0-100
  format?: 'webp' | 'jpeg' | 'png'; // 输出格式
  maxWidth?: number; // 最大宽度
  maxHeight?: number; // 最大高度
  lazy?: boolean; // 是否懒加载
  placeholder?: boolean; // 是否显示占位图
}

export class ImageOptimizer {
  private static readonly DEFAULT_QUALITY = 80;
  private static readonly PLACEHOLDER_SIZE = 10;

  /**
   * 优化图片URL
   */
  static optimizeImageUrl(
    url: string,
    options: ImageOptimizationOptions = {}
  ): string {
    const {
      quality = this.DEFAULT_QUALITY,
      format = 'webp',
      maxWidth,
      maxHeight
    } = options;

    // 如果是CDN URL,添加优化参数
    if (url.includes('cdn') || url.includes('qiniu')) {
      const params = new URLSearchParams();
      params.set('quality', quality.toString());
      
      if (format) {
        params.set('format', format);
      }
      
      if (maxWidth) {
        params.set('maxWidth', maxWidth.toString());
      }
      
      if (maxHeight) {
        params.set('maxHeight', maxHeight.toString());
      }

      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}${params.toString()}`;
    }

    return url;
  }

  /**
   * 生成响应式图片URLs
   */
  static getResponsiveImageUrls(
    baseUrl: string,
    options: ImageOptimizationOptions = {}
  ) {
    const sizes = [400, 800, 1200, 1600];
    const urls: Record<number, string> = {};

    sizes.forEach((size) => {
      urls[size] = this.optimizeImageUrl(baseUrl, {
        ...options,
        maxWidth: size
      });
    });

    return urls;
  }

  /**
   * 生成WebP和降级方案
   */
  static getPictureSource(
    imageUrl: string,
    options: ImageOptimizationOptions = {}
  ) {
    const webpUrl = this.optimizeImageUrl(imageUrl, {
      ...options,
      format: 'webp'
    });

    const fallbackUrl = this.optimizeImageUrl(imageUrl, {
      ...options,
      format: 'jpeg'
    });

    return { webp: webpUrl, fallback: fallbackUrl };
  }

  /**
   * 创建Base64占位图
   */
  static createPlaceholderBase64(
    width: number = this.PLACEHOLDER_SIZE,
    height: number = this.PLACEHOLDER_SIZE
  ): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f0f2f5';
      ctx.fillRect(0, 0, width, height);
    }

    return canvas.toDataURL('image/png');
  }

  /**
   * 压缩图片
   */
  static async compressImage(
    file: File,
    quality: number = this.DEFAULT_QUALITY,
    maxWidth: number = 1920,
    maxHeight: number = 1080
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        let { width, height } = img;

        // 计算缩放比例
        const scale = Math.min(
          maxWidth / width,
          maxHeight / height,
          1
        );

        if (scale < 1) {
          width *= scale;
          height *= scale;
        }

        // 创建canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
        }

        // 压缩为WebP
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/webp',
          quality / 100
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * 批量压缩图片
   */
  static async compressImages(
    files: File[],
    options: ImageOptimizationOptions = {}
  ): Promise<Blob[]> {
    const results = await Promise.all(
      files.map(file => this.compressImage(
        file,
        options.quality || this.DEFAULT_QUALITY,
        options.maxWidth || 1920,
        options.maxHeight || 1080
      ))
    );

    return results;
  }

  /**
   * 检测WebP支持
   */
  static checkWebPSupport(): Promise<boolean> {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  /**
   * 预加载图片
   */
  static preloadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  /**
   * 批量预加载图片
   */
  static async preloadImages(urls: string[]): Promise<HTMLImageElement[]> {
    return Promise.all(urls.map(url => this.preloadImage(url)));
  }

  /**
   * 生成懒加载IntersectionObserver
   */
  static createLazyLoader(
    rootMargin: string = '50px',
    threshold: number = 0.01
  ): IntersectionObserver {
    return new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const dataSrc = img.dataset.src;

          if (dataSrc) {
            img.src = dataSrc;
            img.removeAttribute('data-src');
            img.classList.remove('lazy');
          }

          observer.unobserve(img);
        }
      });
    }, {
      rootMargin,
      threshold
    });
  }
}

// 导出便捷函数
export const optimizeImage = ImageOptimizer.optimizeImageUrl.bind(ImageOptimizer);
export const compressImage = ImageOptimizer.compressImage.bind(ImageOptimizer);
export const checkWebPSupport = ImageOptimizer.checkWebPSupport.bind(ImageOptimizer);
export const createLazyLoader = ImageOptimizer.createLazyLoader.bind(ImageOptimizer);
