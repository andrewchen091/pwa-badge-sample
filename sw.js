const cacheName = 'pwa-badge';
const filesToCache = [
  '/pwa-badge-sample',
  '/pwa-badge-sample/badgeapp.html',
  '/pwa-badge-sample/css/style.css',
  '/pwa-badge-sample/js/main.js',
  '/pwa-badge-sample/images/pwa-icon-128.png',
  '/pwa-badge-sample/images/pwa-icon-144.png',
  '/pwa-badge-sample/images/pwa-icon-152.png',
  '/pwa-badge-sample/images/pwa-icon-192.png',
  '/pwa-badge-sample/images/pwa-icon-256.png',
  '/pwa-badge-sample/images/pwa-icon-512.png',
  '/pwa-badge-sample/manifest.json'  
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
  if (e.request.method == "POST") return;


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
    
    // console.log("networkResponse", request.url, networkResponse);
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

function getMessageCount() {
  fetch('https://www.48v.me/~badgetest/cgi-bin/get_pwa_message_count.py')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      setBadge(data.count);
    }
  });
}

// Function App Badge
function setBadge(badgeCount) {
  const platform = navigator.platform;

  if (navigator.setAppBadge) {
    navigator.setAppBadge(badgeCount);
  } else if (navigator.setExperimentalAppBadge) {
    navigator.setExperimentalAppBadge(badgeCount);
  } else if (window.ExperimentalBadge) {
    window.ExperimentalBadge.set(badgeCount);
  } else {
    console.log("App badge is unsupported.");
  }

  if (platform.toLowerCase().includes('android')) {
    let title = "";
    let icon = '';
    let body = "Message to be displayed";

    let notification = new Notification(title, { body, icon });
  }  
}

setInterval(getMessageCount, 4000);