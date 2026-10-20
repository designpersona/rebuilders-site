/* Rebuilders service worker — 정적 자산 오프라인 캐시.
 * 배포할 때 정적 파일이 바뀌면 CACHE_VERSION 숫자를 올려 주세요. */
const CACHE_VERSION = 'v12';
const CACHE_NAME = `rebuilders-static-${CACHE_VERSION}`;
const PRECACHE = [
  './',
  'index.html',
  'privacy.html',
  'style.css',
  'app.js',
  'app-config.js',
  'storage.js',
  'backup.js',
  'notifications.js',
  'keyboard.js',
  'food-catalog.js',
  'demo-seed.js',
  'quick-entry.js',
  'health.js',
  'log-link.js',
  'bridge.js',
  'manifest.webmanifest',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/apple-touch-icon.png',
  'assets/logo/Logo.png',
  'assets/character/01%20jamie_hungry.jpg',
  'assets/character/02%20jamie.jpg',
  'assets/character/03%20jamie_full.jpg',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.all(PRECACHE.map(url => cache.add(url).catch(() => {}))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key.startsWith('rebuilders-static-') && key !== CACHE_NAME)
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // 외부 요청은 건드리지 않음
  if (url.pathname.startsWith('/api/')) return;

  // 페이지 이동: 네트워크 우선, 오프라인이면 캐시.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request, { ignoreSearch: true })
          .then(hit => hit || caches.match('index.html'))),
    );
    return;
  }

  // 정적 자산: 온라인이면 항상 최신(쿼리 ?v= 버전 유지), 오프라인이면 캐시.
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request, { ignoreSearch: true }).then(hit => hit || Response.error())),
  );
});
