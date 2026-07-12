const CACHE_NAME = 'book-library-cache-v1';
const assetsToCache = [
  './',
  './book.html',
  './manifest.webmanifest',
  './assets/css/styles.css',
  './assets/js/index.js',
  './assets/js/book.js',
  './assets/js/pwa.js',
  './data/book.json',
  
  './assets/images/placeholder.svg',
  './assets/images/og-preview.svg',
  './assets/images/icon-192.svg',
  './assets/images/icon-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(assetsToCache))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        if (event.request.method === 'GET' && response.ok) {
          cache.put(event.request, response.clone());
        }
        return response;
      });
    })).catch(() => cached)
  );
});
