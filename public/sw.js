const CACHE_NAME = 'fasalsetu-v1';
const CORE_ASSETS = ['/', '/index.html', '/manifest.json'];
const FALLBACK_PAGE = '/index.html';

async function precacheCoreAssets() {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(CORE_ASSETS);
}

async function removeStaleCaches() {
  const cacheKeys = await caches.keys();
  const staleKeys = cacheKeys.filter((key) => key !== CACHE_NAME);
  await Promise.all(staleKeys.map((key) => caches.delete(key)));
}

function wantsHtml(request) {
  const accept = request.headers.get('accept') || '';
  return accept.includes('text/html');
}

async function networkFirst(request) {
  try {
    return await fetch(request);
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    if (wantsHtml(request)) {
      return caches.match(FALLBACK_PAGE);
    }
  }
}

function onInstall(event) {
  event.waitUntil(precacheCoreAssets());
  self.skipWaiting();
}

function onActivate(event) {
  event.waitUntil(removeStaleCaches());
  self.clients.claim();
}

function onFetch(event) {
  event.respondWith(networkFirst(event.request));
}

self.addEventListener('install', onInstall);
self.addEventListener('activate', onActivate);
self.addEventListener('fetch', onFetch);
