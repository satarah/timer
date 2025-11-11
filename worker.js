
// https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Tutorials/CycleTracker/Service_workers

const VERSION = '0.1.7';
const CACHE_NAME = `race-timer-v${VERSION}`;

const STATIC_FILES = [
  './',
  './index.html',
  './manifest.json',
  './style/timer.css',
  './script/timer.js',
  './icon/laguna.png',
  './icon/start.png',
  './icon/pause.png',
  './icon/resume.png',
  './icon/reset.png',
  './icon/milli.png',
  './icon/place.png',
  './icon/copy.png',
  './icon/save.png',
  './icon/load.png',
  './icon/clear.png'
];

// CACHE STATIC FILES
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      cache.addAll(STATIC_FILES);
    })(),
  );
});

// CLEAR OLD CACHES, CLAIM ACTIVE CLIENTS
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
          return undefined;
        }),
      );
      await clients.claim();
    })(),
  );
});

// RETURN CACHED FILES ONLY
self.addEventListener('fetch', (event) => {
  // when seeking an HTML page
  if (event.request.mode === "navigate") {
    // Return to the index.html page
    event.respondWith(caches.match("."));
    return;
  }

  // For every other request type
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(event.request.url);
      if (cachedResponse) {
        // Return the cached response if it's available.
        return cachedResponse;
      }
      // Respond with a HTTP 404 response status.
      return new Response(null, { status: 404 });
    })(),
  );
});
