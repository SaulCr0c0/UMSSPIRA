import './globals.css';
import '../shared/identidad/tokens.css';
import type { Metadata } from 'next';
import { BRAND } from '../shared/identidad/brand';

export const metadata: Metadata = {
  title: BRAND.name,
  description: BRAND.description,
  manifest: '/manifest.json',
  icons: { icon: '/brand/icons/icon-192.png', apple: '/brand/icons/icon-192.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
