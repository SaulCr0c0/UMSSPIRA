import type { Viewport } from 'next';
import './globals.css';
import ServiceWorkerRegister from './service-worker-register';

// Viewport explícito: el navegador móvil calcula el ancho real desde el primer
// render y no reajusta el layout al girar el dispositivo (HU #78 / T8).
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}