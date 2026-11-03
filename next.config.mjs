/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const isStaticExport = process.env.NEXT_OUTPUT === 'export';

const nextConfig = {
  reactStrictMode: true,
  // Para hospedagem estática (ex.: CDN), defina NEXT_OUTPUT=export.
  ...(isStaticExport ? { output: 'export', trailingSlash: true } : {}),
  images: {
    formats: ['image/avif', 'image/webp'],
    unoptimized: isStaticExport,
  },
  async headers() {
    if (isStaticExport) return [];
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
