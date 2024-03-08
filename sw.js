const cacheName = 'pwa-badge';
const filesToCache = [
  '/~badgetest',
  '/~badgetest/badgeapp.html',
  '/~badgetest/css/style.css',
  '/~badgetest/js/main.js',
  '/~badgetest/images/pwa-icon-128.png',
  '/~badgetest/images/pwa-icon-144.png',
  '/~badgetest/images/pwa-icon-152.png',
  '/~badgetest/images/pwa-icon-192.png',
  '/~badgetest/images/pwa-icon-256.png',
  '/~badgetest/images/pwa-icon-512.png',
  '/~badgetest/manifest.json'  
];

/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(cacheName)
    .then((cache) => {
      return cache.addAll(filesToCache)
        .then(() => {
          return self.skipWaiting();
        })
        .catch((error) => {
          console.log('Failed to cache', error);
        })
    })
  );
});

/* Serve cached content when offline */
self.addEventListener('fetch', function(e) {
  if (!(e.request.url.startsWith('http:') || e.request.url.startsWith('https:'))) return;

  const url = new URL(e.request.url);
  
  if (url.origin == location.origin) {
    // Static files cache
    e.respondWith(cacheFirst(e.request));
  } else {
    // Dynamic API cache
    e.respondWith(networkFirst(e.request));
  }
});

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  return cachedResponse || fetch(request);  
}

async function networkFirst(request) {
  const dynamicCache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(request);
    
    // Cache the dynamic API response
    dynamicCache.put(request, networkResponse.clone()).catch((error) => {
      console.warn(request.url + ": " + error.message);
    });
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await dynamicCache.match(request);
    
    return cachedResponse;
  }
  
}

self.addEventListener('activate', function(e) {
  console.info('Event: Activate');

  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache != cacheName) {
            return caches.delete(cache);
          }
        })
      );
    })
    .then(function() {
      console.info('Old caches are cleared!');

      return self.clients.claim();
    })
  );
});