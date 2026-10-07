/**
 * Service Worker - UMSSpira PWA
 */

const VERSION = 'v1';
const STATIC_CACHE = `umsspira-static-${VERSION}`;
const ASSETS_CACHE = `umsspira-assets-${VERSION}`;
const ALL_CACHES = [STATIC_CACHE, ASSETS_CACHE];

// Archivos que se guardan al instalar. Son opcionales: si alguno no existe,
// la instalación no falla.
const PRECACHE_URLS = ['/manifest.webmanifest', '/favicon.ico'];

/* -------------------------------- Install -------------------------------- */

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);

      await Promise.allSettled(
        PRECACHE_URLS.map(async (url) => {
          const response = await fetch(url);
          if (response.ok) await cache.put(url, response);
        })
      );
    })()
  );
});

/* -------------------------------- Activate ------------------------------- */

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Borra cachés de versiones anteriores
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith('umsspira-') && !ALL_CACHES.includes(name))
          .map((name) => caches.delete(name))
      );

      // Toma control de las pestañas abiertas
      await self.clients.claim();
    })()
  );
});