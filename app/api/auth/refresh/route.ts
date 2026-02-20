// ============================================
// POST /api/auth/refresh
// Token yenileme — Rotation destekli
// ============================================

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  verifyRefreshToken,
  revokeRefreshToken,
  signAccessToken,
  signRefreshToken,
  badRequestResponse,
  unauthorizedResponse,
  successResponse,
  errorResponse,
} from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return badRequestResponse('Refresh token gerekli');
    }

    // Verify refresh token (rotation-aware — replay saldırı tespiti dahil)
    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      return unauthorizedResponse('Geçersiz veya süresi dolmuş refresh token');
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || !user.active) {
      return unauthorizedResponse('Kullanıcı bulunamadi veya devre disi');
    }

    // Eski token'ı revoke et (rotation — silme yerine revoke)
    await revokeRefreshToken(refreshToken);

    // Yeni token çifti oluştur (aynı family ile)
    const newAccessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const newRefreshToken = await signRefreshToken(user.id, payload.family || undefined);

    return successResponse({
      token: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 86400,
    });
  } catch (error) {
    console.error('Refresh error:', error);
    return errorResponse('Token yenileme sirasinda bir hata oluştu');
  }
}
