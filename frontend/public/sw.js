const CACHE_NAME = 'dormshare-cache-v2'
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/logo.png',
  '/icons.svg',
  '/manifest.json',
]

// 1. Installation - Cache static landing shells
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching static app shell assets...');
      return cache.addAll(PRECACHE_ASSETS)
    }).then(() => self.skipWaiting())
  )
})

// 2. Activation - Clear previous caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old legacy cache...', cache);
            return caches.delete(cache)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// 3. Fetch Interception with Smart Caching Strategies
self.addEventListener('fetch', (event) => {
  // Only intercept GET requests from the same origin or Google Fonts
  if (event.request.method !== 'GET') return;

  const url = new RegExp(self.location.origin);
  const isSameOrigin = url.test(event.request.url);
  const isGoogleFont = event.request.url.startsWith('https://fonts.gstatic.com') || event.request.url.startsWith('https://fonts.googleapis.com');

  if (!isSameOrigin && !isGoogleFont) return;

  // STRATEGY 1: Network-First for HTML/Navigation Requests
  // Ensures you always get the latest code/Vite hashes on update, falling back to cache only when offline.
  if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(() => caches.match('/index.html') || caches.match(event.request))
    );
    return;
  }

  // STRATEGY 2: Stale-While-Revalidate for JS, CSS, and Assets
  // Serve from cache immediately for hyper-fast loads, but update cache in the background.
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch((err) => {
          console.log('[Service Worker] Network request failed.', err);
          return cachedResponse; // fallback if network fails
        });

      return cachedResponse || fetchPromise;
    })
  );
});
