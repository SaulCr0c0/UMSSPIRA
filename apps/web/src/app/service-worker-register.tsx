'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from './register-sw';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null;
}