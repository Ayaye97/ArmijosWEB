// Ligero service worker para cachear shell y partials
const CACHE = 'armijos-v4';
const CORE = [
  './index.html',
  './css/custom.css',
  './js/main.js',
  './js/tailwind-config.js'
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Cache-first para partials e imágenes; network-first para HTML
  if (url.pathname.includes('/partials/') || url.pathname.includes('/imagenes/')) {
    e.respondWith(
      caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
        const resClone = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, resClone));
        return res;
      }))
    );
    return;
  }
  if (e.request.destination === 'document') {
    e.respondWith(
      fetch(e.request).then((res) => {
        const resClone = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, resClone));
        return res;
  }).catch(() => caches.match('./index.html'))
    );
  }
});
