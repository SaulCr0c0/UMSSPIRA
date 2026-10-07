const CACHE_NAME = 'umsspira-core-v2';

const CORE_ASSETS = [
  '/',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS);
    })
  );

  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );

  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }

        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);

        if (cachedResponse) {
          return cachedResponse;
        }

        if (event.request.mode === 'navigate') {
          return new Response(
            `
              <!DOCTYPE html>
              <html lang="es">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Sin conexión</title>
                  <style>
                    body {
                      font-family: Arial, sans-serif;
                      margin: 0;
                      padding: 40px 20px;
                      text-align: center;
                    }

                    h1 {
                      margin-bottom: 12px;
                    }

                    p {
                      margin-bottom: 20px;
                    }
                  </style>
                </head>
                <body>
                  <h1>Sin conexión</h1>
                  <p>No fue posible cargar esta página porque no hay conexión a Internet.</p>
                  <p>Cuando se restablezca la conexión, intenta nuevamente.</p>
                </body>
              </html>
            `,
            {
              status: 200,
              headers: {
                'Content-Type': 'text/html; charset=utf-8',
              },
            }
          );
        }

        return new Response('', {
          status: 503,
          statusText: 'Servicio no disponible',
        });
      })
  );
});