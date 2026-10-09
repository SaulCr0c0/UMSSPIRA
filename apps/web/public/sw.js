const CACHE_NAME = "umsspira-core-v1";

const VERSION = 'v1';
const STATIC_CACHE = `umsspira-static-${VERSION}`;
const ASSETS_CACHE = `umsspira-assets-${VERSION}`;
const CONFIG_CACHE = `umsspira-config-${VERSION}`;
const ALL_CACHES = [CACHE_NAME, STATIC_CACHE, ASSETS_CACHE, CONFIG_CACHE];

const CORE_ASSETS = [
  "/",
];

const PRECACHE_URLS = ['/manifest.webmanifest', '/favicon.ico'];

const PROFILES = {
  default: { maxAssets: 80 },
  desktop: { maxAssets: 200 },
  mobile: { maxAssets: 40 },
};
const DEFAULT_PROFILE = 'default';
const PROFILE_KEY = '/__sw-profile';

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const coreCache = await caches.open(CACHE_NAME);
      await coreCache.addAll(CORE_ASSETS);

      const staticCache = await caches.open(STATIC_CACHE);
      await Promise.allSettled(
        PRECACHE_URLS.map(async (url) => {
          const response = await fetch(url);
          if (response.ok) await staticCache.put(url, response);
        })
      );
    })()
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith('umsspira-') && !ALL_CACHES.includes(name))
          .map((name) => caches.delete(name))
      );

      await self.clients.claim();
    })()
  );
});

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

function getHandledUrl(request) {
  if (request.method !== 'GET') return null;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return null;

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

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = getHandledUrl(request);

  if (!url || request.mode === 'navigate') return;

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      IS_LOCALHOST ? networkFirst(request, STATIC_CACHE) : cacheFirst(request, STATIC_CACHE)
    );
    return;
  }

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
    return;
  }

  event.respondWith(
    networkFirst(request, CACHE_NAME).catch(() =>
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return caches.match("/");
      })
    )
  );
});

self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data) return;

  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  if (data.type === 'SET_DEVICE_PROFILE') {
    event.waitUntil(saveProfile(data.profile));
  }
});