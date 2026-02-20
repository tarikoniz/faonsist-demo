// ============================================
// FaOnSisT - Next.js Middleware
// JWT Auth + Rate Limiting + Security Headers
// ============================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const isProd = process.env.NODE_ENV === 'production';
const allowedOrigin = process.env.CORS_ORIGIN || (isProd ? 'https://faonsist.com' : '*');

// JWT_SECRET lazy — modül yüklenirken env henüz set edilmemiş olabilir
function getJwtSecret() {
  return new TextEncoder().encode(
    process.env.JWT_SECRET || 'faonsist-dev-secret-key-min-32-chars!!'
  );
}

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/health',
  '/api/docs',
  '/api/messages', // Token olmadan da mesaj gönderilebilsin (Socket.IO fallback)
];

// Routes that should be completely ignored by middleware
const IGNORED_ROUTES = [
  '/_next',
  '/favicon.ico',
  '/public',
];

// ---- Rate Limiting (in-memory, per IP) ----
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 dakika
const RATE_LIMIT_MAX_AUTH = 20;            // Auth endpointleri: 15dk'da max 20 istek
const RATE_LIMIT_MAX_API = 200;            // Genel API: 15dk'da max 200 istek

function checkRateLimit(ip: string, isAuth: boolean): { allowed: boolean; remaining: number; resetAt: number } {
  const key = isAuth ? `auth:${ip}` : `api:${ip}`;
  const limit = isAuth ? RATE_LIMIT_MAX_AUTH : RATE_LIMIT_MAX_API;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + RATE_LIMIT_WINDOW;
    rateLimitStore.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

// Periyodik temizlik (bellek sızıntısı önleme)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (now > entry.resetAt) rateLimitStore.delete(key);
  }
}, 60 * 1000);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip non-API routes and ignored routes
  if (!pathname.startsWith('/api/') || IGNORED_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // ---- CORS preflight (rate limit oncesi) ----
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // ---- Rate Limiting ----
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
  const isAuthRoute = pathname.startsWith('/api/auth/');
  const rateResult = checkRateLimit(ip, isAuthRoute);

  if (!rateResult.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'Cok fazla istek gonderdiniz. Lutfen biraz bekleyip tekrar deneyin.',
          retryAfter: Math.ceil((rateResult.resetAt - Date.now()) / 1000),
        },
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateResult.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(isAuthRoute ? RATE_LIMIT_MAX_AUTH : RATE_LIMIT_MAX_API),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(rateResult.resetAt).toISOString(),
        },
      }
    );
  }

  // ---- Token parse (hem public hem protected route'larda) ----
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, getJwtSecret(), { issuer: 'faonsist' });
      // Kullanıcı bilgisini header'a ekle — public route'larda da (mine hesaplamak için)
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId as string);
      requestHeaders.set('x-user-email', payload.email as string);
      requestHeaders.set('x-user-role', payload.role as string);
      requestHeaders.set('x-user-name', payload.name as string);

      const response = NextResponse.next({ request: { headers: requestHeaders } });
      response.headers.set('X-RateLimit-Remaining', String(rateResult.remaining));
      return response;
    } catch {
      // Token geçersiz
      if (PUBLIC_ROUTES.includes(pathname)) {
        const response = NextResponse.next();
        response.headers.set('X-RateLimit-Remaining', String(rateResult.remaining));
        return response;
      }
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Gecersiz veya suresi dolmus token' } },
        { status: 401 }
      );
    }
  }

  // Token yok
  if (PUBLIC_ROUTES.includes(pathname)) {
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Remaining', String(rateResult.remaining));
    return response;
  }

  return NextResponse.json(
    { success: false, error: { code: 'UNAUTHORIZED', message: 'Token bulunamadi' } },
    { status: 401 }
  );
}

export const config = {
  matcher: '/api/:path*',
};
