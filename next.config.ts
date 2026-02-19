import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const allowedOrigin = process.env.CORS_ORIGIN || (isProd ? 'https://faonsist.com' : '*');

const nextConfig: NextConfig = {
  // Standalone output for Docker deployments
  output: 'standalone',

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
