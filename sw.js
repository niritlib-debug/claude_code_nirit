// Minimal offline cache so the dashboard opens like an app on a phone.
const CACHE = 'new-hires-v5';
const SHELL = [
  './',
  'index.html',
  'styles.css',
  'app.js',
  'data/employees.csv',
  'manifest.webmanifest',
  'icons/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network first (so edits show up), falling back to the cache when offline.
// Our own files are fetched with cache: 'no-cache' so the browser checks for a newer copy
// every time; without it a phone could keep showing an old version after an update.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const sameOrigin = new URL(event.request.url).origin === location.origin;
  event.respondWith(
    fetch(sameOrigin ? new Request(event.request, { cache: 'no-cache' }) : event.request)
      .then((res) => {
        if (res.ok && sameOrigin) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(event.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
