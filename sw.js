// service-worker.js

self.addEventListener('install', event => {
  event.waitUntil(
      caches.open('my-cache').then(cache => {
          return cache.addAll([
              // Daftar sumber daya yang ingin Anda cache
              '/',
              '/index.html',
              '/style.css',
              '/script.js',
              '/app.js',
              '/icon.png',
              '/icons',
              '/icons/icon-192x192.png',
              '/icons/icon-512-512.png'
              // Tambahkan sumber daya lain yang ingin Anda cache
          ]);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
      caches.match(event.request).then(response => {
          return response || fetch(event.request);
      })
  );
});