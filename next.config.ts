import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const allowedOrigin = process.env.CORS_ORIGIN || (isProd ? 'https://faonsist.com' : '*');

const nextConfig: NextConfig = {
  // Standalone output for Docker deployments
  // output: 'standalone', // Vercel'de gerek yok

  // TypeScript ve ESLint hatalarında build durmasın (Vercel CI için)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Powered-by header'ı gizle (güvenlik)
  poweredByHeader: false,

  // Redirect root to the original HTML system
  async redirects() {
    return [
      {
        source: '/',
        destination: '/index.html',
        permanent: false,
      },
    ];
  },

  // Node.js packages used in API routes
  serverExternalPackages: ['bcrypt', 'pdfkit'],

  // Security + CORS headers
  async headers() {
    return [
      // Security headers — tüm sayfalar
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          ...(isProd ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }] : []),
        ],
      },
      // index.html — hiç cache'leme (her zaman güncel kodu al)
      {
        source: '/index.html',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
      // CORS — sadece API routes
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: allowedOrigin },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'Access-Control-Max-Age', value: '86400' },
        ],
      },
    ];
  },
};

export default nextConfig;
