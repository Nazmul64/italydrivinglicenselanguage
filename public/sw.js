// Italy Bangla Patente App - Service Worker for Zero-Load Instant Mobile PWA
const CACHE_NAME = 'patente-app-v57';
const ASSETS_TO_CACHE = [
  '/',
  '/app',
  '/css/frontend/style.css',
  '/js/frontend/app_parts/01_core_config.js',
  '/js/frontend/app_parts/02_navigation_ui.js',
  '/js/frontend/app_parts/03_lezioni_video.js',
  '/js/frontend/app_parts/04_dictionary_settings.js',
  '/js/frontend/app_parts/05_chat_support.js',
  '/js/frontend/app_parts/06_test_simulator.js',
  '/js/frontend/app_parts/07_argomenti_topics.js',
  '/js/frontend/app_parts/08_cartelli_signs.js',
  '/js/frontend/app_parts/09_scheda_esame.js',
  '/js/frontend/app_parts/10_activation_profile.js',
  '/js/frontend/modules/saved_mcqs.js',
  '/js/frontend/modules/noted_mcqs.js',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('SW cache.addAll warning:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  if (url.pathname.startsWith('/data/user/') || url.pathname.startsWith('/data/data/') || url.pathname.includes('scaled_IMG') || url.pathname.includes('com.example.')) {
    event.respondWith(new Response(null, { status: 204, statusText: 'No Content' }));
    return;
  }

  // API endpoints that must be live real-time
  if (url.pathname.startsWith('/api/chat') || url.pathname.startsWith('/support/messages') || url.pathname.startsWith('/admin/api')) {
    event.respondWith(fetch(event.request));
    return;
  }

  const isNavigation = event.request.mode === 'navigate' ||
    (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'));

  if (isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then(async (networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
            return networkResponse;
          }

          // If navigation returned 404 (e.g. /page-details or direct SPA route), return app shell
          if (!networkResponse || networkResponse.status === 404 || networkResponse.status >= 500) {
            const appShell = (await caches.match('/')) || (await caches.match('/app'));
            if (appShell) return appShell;
            try {
              const rootFetch = await fetch('/');
              if (rootFetch && rootFetch.status === 200) return rootFetch;
            } catch (e) {}
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) return cachedResponse;

          const appShell = (await caches.match('/')) || (await caches.match('/app'));
          if (appShell) return appShell;

          try {
            return await fetch('/');
          } catch (e) {
            return new Response(
              '<!DOCTYPE html><html><head><title>Italy Bangla Patente</title></head><body><script>window.location.href="/";</script></body></html>',
              { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
            );
          }
        })
    );
    return;
  }

  // Static Assets (CSS, JS, Fonts, Images): Cache-First with background revalidation (0ms load)
  const isStaticAsset = url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.ttf') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.svg');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        }).catch(() => null);

        // Instant 0ms return from cache if available, otherwise fetch from network
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default Stale-While-Revalidate for other GET requests
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      }).catch(() => cachedResponse || new Response(JSON.stringify({ status: 'offline', data: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } }));

      return cachedResponse || fetchPromise;
    })
  );
});
