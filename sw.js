const CACHE_NAME = 'sholawat-app-v1';
const urlsToCache = [
  './', // Tambahkan ini untuk root path
  './index.html',
  './app.js',
  './manifest.json',
  './sw.js',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap',
  './icons/icon-72x72.png',
  './icons/icon-96x96.png',
  './icons/icon-128x128.png',
  './icons/icon-144x144.png',
  './icons/icon-152x152.png',
  './icons/icon-192x192.png',
  './icons/icon-384x384.png',
  './icons/icon-512x512.png',
  './icons/maskable_icon.png'
];

// Install Event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing....');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching Files');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Tambahkan ini
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch
        return response || 
          fetch(event.request)
            .then(res => {
              // Check if we received a valid response
              if(!res || res.status !== 200 || res.type !== 'basic') {
                return res;
              }

              // Clone the response
              const responseToCache = res.clone();

              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });

              return res;
            })
            .catch(() => {
              // Return offline fallback if fetch fails
              if (event.request.mode === 'navigate') {
                return caches.match('./index.html');
              }
            });
      })
  );
});