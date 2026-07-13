/* ============================================================================
 * service-worker.js — offline app shell for PriceBook
 *
 * Bump CACHE whenever a shell file changes so clients pick up the new version.
 * Only same-origin requests are handled; cross-origin calls (Google Fonts,
 * esm.sh, Supabase) always go straight to the network so sync still works and
 * never gets served a stale response.
 * ==========================================================================*/

const CACHE = 'pricebook-v11';
const SHELL = [
  './',
  'index.html',
  'styles.css',
  'app.js',
  'data.js',
  'sync.js',
  'foods.js',
  'shops.js',
  'charts.js',
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

  // Network-first for everything same-origin: always serve the freshest build
  // when online, and only fall back to the cache when the network is
  // unavailable. This prevents the app from getting stuck on a stale cached
  // version after a deploy. The cache is refreshed on every successful fetch,
  // so offline still gets the most recent files.
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(request).then(
          (cached) => cached || (request.mode === 'navigate' ? caches.match('index.html') : undefined),
        ),
      ),
  );
});
