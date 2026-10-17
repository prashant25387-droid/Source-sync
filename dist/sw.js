const CACHE_VERSION = 'v1';
const CACHE_NAME = `fasalsetu-${CACHE_VERSION}`;
const PRECACHE_URLS = ['/', '/index.html', '/manifest.json'];
const OFFLINE_PAGE = '/index.html';

// Install: precache core files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate: purge old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
  );
  self.clients.claim();
});

// Helper: serve from cache, else offline page for HTML navigations
async function cacheFallback(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const accept = request.headers.get('accept') || '';
  if (accept.includes('text/html')) {
    return caches.match(OFFLINE_PAGE);
  }
  return undefined;
}

// Fetch: network first, fall back to cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => cacheFallback(event.request))
  );
});
