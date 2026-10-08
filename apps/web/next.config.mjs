/** @type {import('next').NextConfig} */
const nextConfig = {
  // Evita que next dev reescriba los archivos de next build / next start.
  distDir: process.env.NODE_ENV === 'production' ? '.next-production' : '.next',
};
export default nextConfig;
