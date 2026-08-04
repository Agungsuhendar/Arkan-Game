const CACHE_NAME = 'arkan-game-v32-full-offline';
const MEDIA_CACHE_NAME = 'arkan-media-v18-offline-ready';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.png',
  '/pwa_icon_180.png',
  '/pwa_icon_192.png',
  '/pwa_icon_512.png',
  '/arkan_character.png',
  '/arkan_character_v2.png',
  '/arkan_avatar_card.png',
  '/cat_character_v2.png',
  '/dino_character_v2.png',
  '/chest_character.png',
  '/family_photo.png?v=family_v2',
  '/home_room_bg.webp',
  '/home_room_day.webp',
  '/home_room_night.webp',
  '/adventure_map_world_4k_bg.png',
  '/adventure_map_world_bg.png',
  '/world_map_4k_hd.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Pre-cache warning:', err);
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
          if (key !== CACHE_NAME && key !== MEDIA_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Cache-First Strategy for Images & Audio Assets (0ms Instant Load from Local Offline Cache)
  if (
    event.request.method === 'GET' &&
    (url.pathname.match(/\.(png|jpg|jpeg|webp|svg|ico|gif|mp3|woff2)$/i) ||
      event.request.destination === 'image' ||
      event.request.destination === 'audio')
  ) {
    event.respondWith(
      caches.open(MEDIA_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          // Return instant cached response if available, otherwise fallback to network fetch
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Stale-While-Revalidate Strategy for HTML/JS/CSS with offline fallback
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      });
    })
  );
});
