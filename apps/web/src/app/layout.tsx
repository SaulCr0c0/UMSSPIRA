import './globals.css';
import '../shared/identidad/tokens.css';
import type { Metadata } from 'next';
import { BRAND } from '../shared/identidad/brand';
import ServiceWorkerRegister from './service-worker-register';

export const metadata: Metadata = {
  title: BRAND.name,
  description: BRAND.description,
  manifest: '/manifest.json',
  icons: { icon: '/brand/icons/icon-192.png?v=2', apple: '/brand/icons/icon-192.png?v=2' },
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
