const CACHE_NAME = 'dormshare-cache-v1'
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
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

// 3. Fetch Interception - Cache-First with Dynamic Network Fallback
self.addEventListener('fetch', (event) => {
  // Only intercept HTTP/S GET requests (skip chrome extensions or POST requests)
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin) && !event.request.url.startsWith('https://fonts.gstatic.com') && !event.request.url.startsWith('https://fonts.googleapis.com')) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return from cache
        return cachedResponse
      }

      // Dynamic Network fetch and cache clone
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && !event.request.url.includes('google')) {
          return networkResponse
        }

        const responseToCache = networkResponse.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return networkResponse
      }).catch((err) => {
        console.log('[Service Worker] Fetch failed, client is offline.', err);
        // Fallback to cached index.html if request is navigation (HTML)
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html')
        }
        throw err
      })
    })
  )
})
