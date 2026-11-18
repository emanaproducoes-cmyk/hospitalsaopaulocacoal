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
    const secureArea = [
      ...securityHeaders.filter((h) => h.key !== 'X-Frame-Options'),
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Cache-Control', value: 'no-store, max-age=0' },
      { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
      { key: 'Referrer-Policy', value: 'no-referrer' },
      { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
    ];
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/(acesso|area-do-paciente|area-do-medico|admin)/:path*', headers: secureArea },
      { source: '/(acesso|area-do-paciente|area-do-medico|admin)', headers: secureArea },
    ];
  },
};

export default nextConfig;
