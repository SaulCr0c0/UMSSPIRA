/**
 * Service Worker - UMSSpira PWA
 */

const VERSION = 'v1';
const STATIC_CACHE = `umsspira-static-${VERSION}`;
const ASSETS_CACHE = `umsspira-assets-${VERSION}`;
const CONFIG_CACHE = `umsspira-config-${VERSION}`;
const ALL_CACHES = [STATIC_CACHE, ASSETS_CACHE, CONFIG_CACHE];

const PRECACHE_URLS = ['/manifest.webmanifest', '/favicon.ico'];

// Perfiles de caché según el dispositivo.
// En escritorio hay más espacio y más imágenes por pantalla.
const PROFILES = {
  default: { maxAssets: 80 },
  desktop: { maxAssets: 200 },
};
const DEFAULT_PROFILE = 'default';
const PROFILE_KEY = '/__sw-profile';

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

/* ------------------------------ Utilidades ------------------------------ */

// En localhost (pnpm dev) los archivos de /_next/static no tienen hash estable,
// por eso se usa network-first para no servir código viejo mientras desarrollas.
const IS_LOCALHOST =
  self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    await cache.delete(keys[0]);
    await trimCache(cacheName, maxEntries);
  }
}

function isCacheable(response) {
  return response && response.ok && (response.type === 'basic' || response.type === 'default');
}

// Devuelve la URL si el SW debe manejar la petición; null si debe ignorarla.
function getHandledUrl(request) {
  if (request.method !== 'GET') return null;

  const url = new URL(request.url);

  // Solo mismo origen (no tocamos Supabase, fuentes externas, etc.)
  if (url.origin !== self.location.origin) return null;

  // Nunca interceptar API, auth, HMR de desarrollo ni el propio SW
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/auth/') ||
    url.pathname.includes('webpack-hmr') ||
    url.pathname === '/sw.js'
  ) {
    return null;
  }

  return url;
}

/* --------------------------- Perfil de dispositivo ----------------------- */

async function saveProfile(name) {
  if (!Object.prototype.hasOwnProperty.call(PROFILES, name)) return;
  const cache = await caches.open(CONFIG_CACHE);
  await cache.put(PROFILE_KEY, new Response(name));
}

async function loadProfile() {
  const cache = await caches.open(CONFIG_CACHE);
  const response = await cache.match(PROFILE_KEY);
  if (!response) return DEFAULT_PROFILE;

  const name = await response.text();
  return Object.prototype.hasOwnProperty.call(PROFILES, name) ? name : DEFAULT_PROFILE;
}

/* ------------------------------- Estrategias ----------------------------- */

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (isCacheable(response)) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (isCacheable(response)) {
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then((response) => {
      if (isCacheable(response)) {
        cache.put(request, response.clone());
        trimCache(cacheName, maxEntries);
      }
      return response;
    })
    .catch(() => undefined);

  return cached || (await networkPromise) || Response.error();
}

/* --------------------------------- Fetch --------------------------------- */

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = getHandledUrl(request);

  // Las navegaciones (páginas HTML) las maneja el navegador con normalidad
  if (!url || request.mode === 'navigate') return;

  // Archivos compilados de Next.js
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      IS_LOCALHOST ? networkFirst(request, STATIC_CACHE) : cacheFirst(request, STATIC_CACHE)
    );
    return;
  }

  // Imágenes y fuentes: el límite depende del perfil del dispositivo
  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.startsWith('/_next/image')
  ) {
    event.respondWith(
      loadProfile().then((profile) =>
        staleWhileRevalidate(request, ASSETS_CACHE, PROFILES[profile].maxAssets)
      )
    );
  }
});

/* -------------------------------- Mensajes ------------------------------- */

self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data) return;

  // Permite que la app active una nueva versión del SW
  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  // La app avisa qué tipo de dispositivo es
  if (data.type === 'SET_DEVICE_PROFILE') {
    event.waitUntil(saveProfile(data.profile));
  }
});