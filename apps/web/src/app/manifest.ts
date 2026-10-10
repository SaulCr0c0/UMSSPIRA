import type { MetadataRoute } from 'next'
import { BRAND } from '../shared/identidad/brand'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.name,
    short_name: BRAND.shortName,
    description: BRAND.description,
    start_url: '/portal',
    scope: '/portal',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FDFBF7',
    theme_color: '#0F172A',
    icons: [
      { src: '/brand/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/brand/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  }
}
