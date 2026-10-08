/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Formatos modernos: el navegador recibe el más ligero que soporte.
    formats: ['image/avif', 'image/webp'],

    // Orígenes externos permitidos para next/image.
    remotePatterns: [
      {
        // Supabase Storage (buckets públicos)
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;