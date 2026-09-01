// Italy Bangla Patente App - Service Worker for Mobile PWA
const CACHE_NAME = 'patente-app-v45';
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

  const isNavigation = event.request.mode === 'navigate' ||
    (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'));

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        if (isNavigation) {
          const appShell = (await caches.match('/app')) || (await caches.match('/'));
          if (appShell) {
            return appShell;
          }
          try {
            return await fetch('/');
          } catch (e) {
            return new Response(
              '<!DOCTYPE html><html><head><title>Italy Bangla Patente</title></head><body><script>window.location.href="/";</script></body></html>',
              { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
            );
          }
        }

        return new Response('', { status: 404, statusText: 'Not Found' });
      })
  );
});
