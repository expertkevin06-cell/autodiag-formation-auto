const CACHE_NAME = 'autodiag-pro-v3';
const OFFLINE_URL = './index.html';
const ASSETS_TO_CACHE = [
  './','./index.html','./manifest.json',
  './css/styles.css',
  './js/app.js','./js/db.js','./js/data.js','./js/filters.js','./js/backup.js','./js/admin.js',
  './icons/icon-192.png','./icons/icon-512.png'
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS_TO_CACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(names => Promise.all(names.map(n => n !== CACHE_NAME ? caches.delete(n) : null))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.status === 200) { const cl = r.clone(); caches.open(CACHE_NAME).then(c => c.put(e.request, cl)); }
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match(OFFLINE_URL)))
  );
});
