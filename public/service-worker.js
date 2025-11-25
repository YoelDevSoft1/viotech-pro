// Simple offline-first caching for static assets (_next/static, images, fonts) to avoid 404s and improve resilience.
const CACHE_NAME = "viotech-static-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Solo manejamos estáticos propios; dejamos pasar API y cross-origin.
  const isSameOrigin = url.origin === self.location.origin;
  const isStatic =
    url.pathname.startsWith("/_next/static") ||
    url.pathname.startsWith("/_next/image") ||
    /\.(?:js|css|png|jpg|jpeg|gif|svg|ico|woff2?)$/i.test(url.pathname);

  if (!isSameOrigin || !isStatic) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        const networkResp = await fetch(req);
        cache.put(req, networkResp.clone());
        return networkResp;
      } catch (_error) {
        const cachedResp = await cache.match(req);
        if (cachedResp) return cachedResp;
        throw _error;
      }
    }),
  );
});
