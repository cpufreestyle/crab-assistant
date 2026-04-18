// 🦀 螃蟹助手 - Service Worker (PWA离线支持)
// 灵感来自 sanguosha-assistant 的 PWA 实现

const CACHE_NAME = 'crab-assistant-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/config.js',
  '/memory.js',
  '/skills.js',
  '/app.js',
];

// 安装
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('🦀 打开缓存');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🦀 删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 拦截请求
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then(response => {
            // 不缓存非成功响应
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            // 克隆响应
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return response;
          });
      })
      .catch(() => {
        // 离线时返回缓存
        return caches.match('/index.html');
      })
  );
});
