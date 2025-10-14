const cacheName = 'trendora-cache-v1';
const assetsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon/web-app-manifest-192x192.png',
  '/icon/web-app-manifest-512x512.png',
  '/styles.css',
  '/script.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
      caches.open(cacheName).then(async cache => {
        for (const asset of assetsToCache) {
          try {
            await cache.add(asset);
          } catch (err) {
            console.warn(`Failed to cache ${asset}:`, err);
          }
        }
      })
    );
  });
  


self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});
