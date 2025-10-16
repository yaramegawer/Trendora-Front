const cacheName = 'trendora-cache-v2'; // 🔹 Change version when you update your site
const assetsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon/android-chrome-192x192.png',
  '/icon/android-chrome-512x512.png',
  '/styles.css',
  '/script.js'
];

// Install event: cache all assets
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
  self.skipWaiting(); // 🔹 Activate immediately after install
});

// Activate event: delete old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key))))
  );
  self.clients.claim();
});


// Fetch event: serve from cache, then fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});

