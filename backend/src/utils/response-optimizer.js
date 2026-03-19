/**
 * 响应优化工具
 * 优化API响应时间,提升响应速度到极致
 */

class ResponseOptimizer {
  /**
   * 响应压缩
   */
  static compressionMiddleware() {
    const compression = require('compression');

    return compression({
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      },
      threshold: 1024, // 只压缩大于1KB的响应
      level: 6, // 压缩级别1-9,6为平衡
      chunkSize: 16 * 1024 // 16KB的块
    });
  }

  /**
   * 减少响应体大小
   */
  static minimizeResponse(data) {
    // 1. 使用更短的键名
    const minimized = {
      u: data.userId,
      n: data.nickname,
      a: data.avatar,
      c: data.createdAt,
      m: data.modifiedAt
    };

    return minimized;
  }

  /**
   * 字段过滤中间件
   */
  static fieldFilter(fields = []) {
    return (req, res, next) => {
      req.fields = fields;
      next();
    };
  }

  /**
   * 智能JSON序列化
   */
  static serialize(data) {
    return JSON.stringify(data);
  }

  /**
   * 响应分块
   */
  static async * chunkedResponse(req, res, data, chunkSize = 1000) {
    const jsonString = JSON.stringify(data);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');

    const totalChunks = Math.ceil(jsonString.length / chunkSize);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, jsonString.length);
      const chunk = jsonString.substring(start, end);

      res.write(chunk);

      // 小延迟避免过快发送
      if (i < totalChunks - 1) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    res.end();
  }

  /**
   * 流式响应
   */
  static async streamResponse(req, res, stream, headers = {}) {
    Object.assign(res.headers, headers);
    res.setHeader('Content-Type', 'application/json');

    stream.pipe(res);
  }

  /**
   * 响应缓存
   */
  static cacheHeaders(ttl = 300) {
    return {
      'Cache-Control': `public, max-age=${ttl}`,
      'Expires': new Date(Date.now() + ttl * 1000).toUTCString(),
      'ETag': `"${Date.now()}"`,
      'Last-Modified': new Date().toUTCString()
    };
  }

  /**
   * 浏览器缓存策略
   */
  static getCacheStrategy(type) {
    const strategies = {
      static: 'public, max-age=31536000', // 1年
      short: 'public, max-age=3600', // 1小时
      dynamic: 'private, max-age=300', // 5分钟
      noCache: 'no-store, no-cache, must-revalidate'
    };

    return strategies[type] || strategies.static;
  }

  /**
   * CDN缓存配置
   */
  static getCDNHeaders() {
    return {
      'Cache-Control': 'public, max-age=31536000, immutable', // 永久缓存
      'CDN-Cache-Control': 'public, max-age=31536000',
      'Surrogate-Control': 'public, max-age=31536000'
    };
  }

  /**
   * 预压缩配置
   */
  static precompressResources(contentType) {
    const precompressed = {
      'image/jpeg': '.jpg, .jpeg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
      'text/javascript': '.js',
      'text/css': '.css',
      'application/json': '.json',
      'application/xml': '.xml'
    };

    return precompressed[contentType] || '';
  }

  /**
   * HTTP/2推送
   */
  static http2Push(path) {
    return {
      'Link': `<${path}>; rel=preload; as=script; crossorigin=anonymous`
    };
  }

  /**
   * 资源提示
   */
  static getResourceHints(hints = []) {
    const validHints = ['preload', 'prefetch', 'preconnect', 'dns-prefetch', 'prerender'];

    return hints.filter(hint => validHints.includes(hint));
  }

  /**
   * Service Worker缓存
   */
  static serviceWorkerCache(paths = []) {
    return paths.map(path => `
      const cacheName = 'v' + path.split('/').join('-');
      const url = path;

      self.addEventListener('fetch', event => {
        if (event.request.url.includes(url)) {
          event.respondWith(
            caches.open(cacheName).then(cache => {
              return cache.match(event.request).then(matched => {
                if (matched) {
                  return matched;
                }

                return fetch(url).then(response => {
                  const clonedResponse = response.clone();
                  cache.put(event.request, clonedResponse).then(() => {
                    return clonedResponse;
                  });
                });
              });
            })
          );
        }
      });
    `).join('\n');
  }

  /**
   * Brotli压缩支持
   */
  static supportsBrotli(req) {
    const acceptEncoding = req.headers['accept-encoding'] || '';

    return acceptEncoding.includes('br');
  }

  /**
   * 选择压缩算法
   */
  static getCompressionAlgorithm(req) {
    if (this.supportsBrotli(req)) {
      return 'br';
    }

    const acceptEncoding = req.headers['accept-encoding'] || '';
    
    if (acceptEncoding.includes('gzip')) {
      return 'gzip';
    }

    return '';
  }

  /**
   * 流式JSON响应
   */
  static async * streamJSON(req, res, generator) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');

    res.write('[');

    for await (const item of generator) {
      const json = JSON.stringify(item) + ',';
      res.write(json);

      // 小延迟
      await new Promise(resolve => setTimeout(resolve, 5));
    }

    res.write(']');
    res.end();
  }

  /**
   * 服务器端事件推送
   */
  static serverSentEvents(res) {
    const SSE_HEADERS = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering-Time': '0'
    };

    Object.keys(SSE_HEADERS).forEach(key => {
      res.setHeader(key, SSE_HEADERS[key]);
    });

    let counter = 0;

    return {
      send: (event, data) => {
        counter++;
        res.write(`id: ${counter}\n`);
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      },

      close: () => {
        res.end();
      }
    };
  }

  /**
   * 响应时间优化
   */
  static async optimizeResponseTime(req, handler) {
    const startTime = Date.now();

    try {
      await handler(req, res);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 记录响应时间
      res.setHeader('X-Response-Time', `${duration}ms`);

      return duration;
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      res.setHeader('X-Response-Time', `${duration}ms`);

      throw error;
    }
  }

  /**
   * 优雅降级
   */
  static gracefulDegradation(req, res) {
    const acceptHeader = req.headers['accept'] || '';

    // 根据Accept头返回不同格式
    if (acceptHeader.includes('application/json')) {
      res.setHeader('Content-Type', 'application/json');
      return 'json';
    } else if (acceptHeader.includes('text/html')) {
      res.setHeader('Content-Type', 'text/html');
      return 'html';
    } else if (acceptHeader.includes('application/xml')) {
      res.setHeader('Content-Type', 'application/xml');
      return 'xml';
    }

    res.setHeader('Content-Type', 'application/json');
    return 'json';
  }

  /**
   * 响应优化中间件
   */
  static middleware() {
    return [
      this.compressionMiddleware(),
      (req, res, next) => {
        // 设置性能头
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');

        next();
      }
    ];
  }
}

module.exports = ResponseOptimizer;
