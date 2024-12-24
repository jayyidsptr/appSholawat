// File: sw.js
const CACHE_NAME = 'sholawat-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/app.js',
  '/icons/adaptive-icon.png',
  '/icons/icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});