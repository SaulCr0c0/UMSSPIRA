
let isReloading = false;

function activateWorker(worker: ServiceWorker): void {
  worker.postMessage({ type: 'SKIP_WAITING' });
}

function trackInstalling(worker: ServiceWorker): void {
  worker.addEventListener('statechange', () => {
    if (worker.state === 'installed' && navigator.serviceWorker.controller) {
      activateWorker(worker);
    }
  });
}

function listenForUpdates(registration: ServiceWorkerRegistration): void {
  if (registration.waiting && navigator.serviceWorker.controller) {
    activateWorker(registration.waiting);
  }

  if (registration.installing) {
    trackInstalling(registration.installing);
  }

  registration.addEventListener('updatefound', () => {
    if (registration.installing) {
      trackInstalling(registration.installing);
    }
  });
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | undefined> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return undefined;
  }

  const hadController = Boolean(navigator.serviceWorker.controller);

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || isReloading) return;
    isReloading = true;
    window.location.reload();
  });

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    listenForUpdates(registration);
    return registration;
  } catch (error) {
    console.error('[SW] No se pudo registrar el service worker:', error);
    return undefined;
  }
}