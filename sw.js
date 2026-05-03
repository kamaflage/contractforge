// ContractForge Service Worker
// Bump CACHE version on every deploy to force cache refresh
const CACHE = 'contractforge-v3.0';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './js/cf-state.js?v=3.0',
  './js/cf-wizard.js?v=3.0',
  './js/cf-scope.js?v=3.0',
  './js/cf-pricing.js?v=3.0',
  './js/cf-preview.js?v=3.0',
  './js/cf-save-load.js?v=3.0',
  './js/cf-ui.js?v=3.0',
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

// Fetch — network-first for HTML (always get latest), cache-first for versioned assets
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isHTML = event.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/');

  if (isHTML) {
    // Network-first: always try to get the latest HTML, fall back to cache offline
    event.respondWith(
      fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const toCache = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, toCache));
        }
        return response;
      }).catch(() => caches.match(event.request).then(c => c || caches.match('./index.html')))
    );
  } else {
    // Cache-first: JS/CSS/fonts are versioned, serve from cache for speed
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response && response.status === 200 && response.type === 'basic') {
            const toCache = response.clone();
            caches.open(CACHE).then(cache => cache.put(event.request, toCache));
          }
          return response;
        });
      })
    );
  }
});
