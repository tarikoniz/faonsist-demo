// ============================================
// FaOnSisT - API Documentation Endpoint
// GET /api/docs — JSON API reference
// ============================================

import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const API_DOCS = {
  info: {
    title: 'FaOnSisT API',
    version: '1.0.0',
    description: 'Insaat sektoru icin entegre is yonetim platformu API dokumantasyonu',
  },
  baseUrl: '/api',
  authentication: {
    type: 'Bearer Token',
    description: 'Login endpointinden alinan JWT token, Authorization header olarak gonderilir.',
    header: 'Authorization: Bearer <token>',
    tokenExpiry: '24 saat',
    refreshExpiry: '7 gun',
  },
  rateLimiting: {
    auth: '15 dakikada 20 istek',
    api: '15 dakikada 200 istek',
    headers: {
      'X-RateLimit-Remaining': 'Kalan istek sayisi',
      'X-RateLimit-Reset': 'Limit sifirlama zamani',
      'Retry-After': 'Beklenmesi gereken sure (saniye)',
    },
  },
  endpoints: {
    auth: {
      'POST /api/auth/login': {
        description: 'Kullanıcı girisi',
        public: true,
        body: { email: 'string', password: 'string' },
        response: { token: 'string', refreshToken: 'string', user: 'object' },
      },
      'POST /api/auth/register': {
        description: 'Yeni kullanıcı kaydi',
        public: true,
        body: { name: 'string', email: 'string', password: 'string' },
      },
      'POST /api/auth/refresh': {
        description: 'Token yenileme (rotation destekli)',
        public: true,
        body: { refreshToken: 'string' },
        notes: 'Her kullanim sonrasi eski token iptal edilir, yeni token cift oluşturulur',
      },
      'POST /api/auth/forgot-password': {
        description: 'Şifre sıfırlama talebi',
        public: true,
        body: { email: 'string' },
        notes: 'Guvenlik: Kullanıcı bulunsun ya da bulunmasin ayni yanit doner',
      },
      'POST /api/auth/reset-password': {
        description: 'Şifre sıfırlama',
        public: true,
        body: { token: 'string', newPassword: 'string (min 4 karakter)' },
        notes: 'Başarılı olursa tum refresh tokenlar iptal edilir',
      },
    },
    projects: {
      'GET /api/projects': {
        description: 'Tum projeleri listele (paginasyonlu)',
        roles: ['*'],
        query: 'page, limit, search, durum, include=all',
        response: '{ data: [], pagination: { page, limit, total, totalPages, hasNext, hasPrev } }',
      },
      'POST /api/projects': { description: 'Yeni proje oluştur', roles: ['admin', 'manager'] },
      'GET /api/projects/:id': { description: 'Proje detayi', roles: ['*'] },
      'PUT /api/projects/:id': { description: 'Proje güncelle', roles: ['admin', 'manager', 'project_manager'] },
    },
    tenders: {
      'GET /api/tenders': { description: 'Tum ihaleleri listele (paginasyonlu)', roles: ['*'], query: 'page, limit, search, status' },
      'POST /api/tenders': { description: 'Yeni ihale oluştur', roles: ['admin', 'manager'] },
      'GET /api/tenders/:id': { description: 'Ihale detayi', roles: ['*'] },
    },
    sales: {
      'GET /api/sales': { description: 'Satis listesi (paginasyonlu)', roles: ['*'], query: 'page, limit, search, stage, status' },
      'POST /api/sales': { description: 'Yeni satis kaydi', roles: ['admin', 'sales_manager'] },
    },
    channels: {
      'GET /api/channels': { description: 'Iletisim kanallari', roles: ['*'] },
      'POST /api/channels': { description: 'Yeni kanal oluştur', roles: ['*'] },
      'GET /api/channels/:id/messages': { description: 'Kanal mesajlari', roles: ['*'] },
      'POST /api/channels/:id/messages': { description: 'Mesaj gonder', roles: ['*'] },
    },
    ai: {
      'POST /api/ai/chat': {
        description: 'AI asistan ile sohbet',
        body: { message: 'string (max 4000 karakter)', context: 'object (opsiyonel)' },
        response: { response: 'string', model: 'string', usedFallback: 'boolean', remainingRequests: 'number' },
        notes: 'Claude AI aktifse gercek AI, degilse ogrenilmis yerel yanit verir',
      },
    },
    admin: {
      'GET /api/admin/health': { description: 'Sistem sagligi', roles: ['admin'] },
      'GET /api/admin/db-status': { description: 'Veritabani durumu', roles: ['admin'] },
      'GET /api/admin/system-info': { description: 'Sunucu bilgileri', roles: ['admin'] },
      'GET /api/admin/logs': { description: 'Sistem loglari', roles: ['admin'], query: 'level, module, limit, offset' },
    },
  },
  errorCodes: {
    UNAUTHORIZED: '401 — Kimlik dogrulama hatasi',
    FORBIDDEN: '403 — Yetki yetersiz',
    BAD_REQUEST: '400 — Geçersiz istek',
    NOT_FOUND: '404 — Kayit bulunamadi',
    RATE_LIMITED: '429 — Istek limiti asildi',
    SERVER_ERROR: '500 — Sunucu hatasi',
  },
  responseFormat: {
    success: '{ success: true, data: {...}, message?: string }',
    error: '{ success: false, error: { code: string, message: string } }',
  },
};

export async function GET(request: NextRequest) {
  return Response.json(API_DOCS, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
