/* ============================================================================
 * service-worker.js — offline app shell for PriceBook
 *
 * Bump CACHE whenever a shell file changes so clients pick up the new version.
 * Only same-origin requests are handled; cross-origin calls (Google Fonts,
 * esm.sh, Supabase) always go straight to the network so sync still works and
 * never gets served a stale response.
 * ==========================================================================*/

const CACHE = 'pricebook-v1';
const SHELL = [
  './',
  'index.html',
  'styles.css',
  'app.js',
  'data.js',
  'sync.js',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== location.origin) return; // fonts / esm.sh / supabase → network

  // Navigations: network-first (fresh when online), fall back to cached shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('index.html')),
    );
    return;
  }

  // Same-origin assets: cache-first, then network (and populate the cache).
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return res;
      });
    }),
  );
});
