// Basic offline-first service worker for Parakh.ai
// Generated manually – extend with Workbox or vite-plugin-pwa for advanced features.

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `parakh-static-${CACHE_VERSION}`;
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/mainlogo.png',
  '/logo.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k.startsWith('parakh-static-') && k !== STATIC_CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// Network-first for navigation requests, cache-first for static assets
self.addEventListener('fetch', event => {
  const { request } = event;
  const isNavigation = request.mode === 'navigate';

  if (isNavigation) {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // For same-origin static assets use cache-first strategy
  if (request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          const clone = response.clone();
          if (response.ok) {
            caches.open(STATIC_CACHE).then(cache => cache.put(request, clone));
          }
          return response;
        });
      })
    );
  }
});

// Listen for manual update trigger
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
