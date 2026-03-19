// Service Worker - 离线缓存策略
const CACHE_NAME = 'fuyuan-v1.0.0';
const RUNTIME_CACHE = 'fuyuan-runtime-v1.0.0';

// 需要缓存的静态资源
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/fonts/main.woff2',
  '/images/logo.png'
];

// API缓存配置
const API_CACHE_CONFIG = {
  '/api/user/profile': { strategy: 'networkFirst', maxAge: 5 * 60 * 1000 },
  '/api/match/list': { strategy: 'networkFirst', maxAge: 1 * 60 * 1000 },
  '/api/config': { strategy: 'cacheFirst', maxAge: 30 * 60 * 1000 }
};

// 安装Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// 拦截请求
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API请求处理
  if (url.pathname.startsWith('/api/')) {
    const config = API_CACHE_CONFIG[url.pathname] || { strategy: 'networkFirst', maxAge: 0 };
    
    event.respondWith(
      handleApiRequest(request, config)
    );
    return;
  }

  // 静态资源处理
  if (url.origin === location.origin) {
    event.respondWith(
      handleStaticRequest(request)
    );
    return;
  }

  // 其他请求走网络
  event.respondWith(fetch(request));
});

// API请求处理
async function handleApiRequest(request, config) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse && config.strategy === 'cacheFirst') {
    // 检查缓存是否过期
    const cachedDate = new Date(cachedResponse.headers.get('date'));
    const now = new Date();
    const age = now - cachedDate;

    if (age < config.maxAge) {
      console.log('[SW] Cache hit (API):', request.url);
      return cachedResponse;
    }
  }

  try {
    console.log('[SW] Fetching (API):', request.url);
    const networkResponse = await fetch(request);

    if (networkResponse.ok && config.maxAge > 0) {
      // 缓存响应
      const responseToCache = networkResponse.clone();
      await cache.put(request, responseToCache);
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, using cache (API):', request.url);
    return cachedResponse || new Response('Network error', { status: 503 });
  }
}

// 静态资源处理
async function handleStaticRequest(request) {
  // HTML文件 - 网络优先
  if (request.destination === 'document') {
    const networkResponse = await fetch(request);
    return networkResponse || caches.match('/');
  }

  // 图片/字体 - 缓存优先
  if (request.destination === 'image' || request.destination === 'font') {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] Cache hit (static):', request.url);
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }

  // JS/CSS - 缓存优先,有更新则更新
  if (request.destination === 'script' || request.destination === 'style') {
    const cachedResponse = await caches.match(request);
    
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      return cachedResponse || error;
    }
  }

  return fetch(request);
}

// 消息监听
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 后台同步
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  // 处理离线时未完成的请求
});

// 推送通知
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  
  const options = {
    body: event.data ? event.data.text() : '您有新消息',
    icon: '/images/icon-192.png',
    badge: '/images/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('赴缘婚恋', options)
  );
});

// 通知点击
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

console.log('[SW] Service Worker loaded');
