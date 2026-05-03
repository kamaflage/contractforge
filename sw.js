// ContractForge Service Worker
// Bump CACHE version on every deploy to force cache refresh
const CACHE = 'contractforge-v2.9';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './js/cf-state.js?v=2.9',
  './js/cf-wizard.js?v=2.9',
  './js/cf-scope.js?v=2.9',
  './js/cf-pricing.js?v=2.9',
  './js/cf-preview.js?v=2.9',
  './js/cf-save-load.js?v=2.9',
  './js/cf-ui.js?v=2.9',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Source+Sans+3:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap'
];

// Install — cache all assets
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll(ASSETS).catch(err => {
        console.log('Cache addAll failed (some assets may be unavailable offline):', err);
      });
    })
  );
});

// Activate — delete old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch — cache-first for assets, network-first for everything else
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache successful responses for same-origin assets
        if (response && response.status === 200 && response.type === 'basic') {
          const toCache = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, toCache));
        }
        return response;
      }).catch(() => {
        // Offline fallback — return cached index.html for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
