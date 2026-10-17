const CACHE_NAME = 'fasalsetu-v1';
const CORE_ASSETS = ['/', '/index.html', '/manifest.json'];

// Install: precache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(CORE_ASSETS);
    })()
  );
  self.skipWaiting();
});

// Activate: delete every cache except the current one
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })()
  );
  self.clients.claim();
});

// Fetch: network first, fall back to cache (or index.html for page loads)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      try {
        return await fetch(event.request);
      } catch (err) {
        const cached = await caches.match(event.request);
        if (cached) return cached;

        const accept = event.request.headers.get('accept') || '';
        if (accept.includes('text/html')) {
          return caches.match('/index.html');
        }
      }
    })()
  );
});
