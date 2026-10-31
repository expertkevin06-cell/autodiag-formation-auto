const CACHE_NAME = 'autodiag-pro-v7';
const ASSETS = [
  './','./index.html','./manifest.json','./css/styles.css','./updates/feed.json',
  './js/app.js','./js/db.js','./js/data.js','./js/verify.js','./js/updater.js','./js/filters.js','./js/backup.js','./js/admin.js',
  './icons/icon.svg','./icons/icon-192.png','./icons/icon-512.png'
];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE_NAME).then(c => Promise.allSettled(ASSETS.map(a => c.add(a)))).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ns => Promise.all(ns.map(n => n !== CACHE_NAME ? caches.delete(n) : null))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(r => { if (r && r.status === 200){ const c = r.clone(); caches.open(CACHE_NAME).then(ca => ca.put(e.request, c)); } return r; }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});
