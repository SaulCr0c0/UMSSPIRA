/** @type {import('next').NextConfig} */
const nextConfig = {
  // `next dev` escribe en `.next-dev` para no pisar el build de producción.
  // Producción queda en `.next`, que es lo que espera Vercel.
  distDir: process.env.NODE_ENV === 'production' ? '.next' : '.next-dev',
};
export default nextConfig;
