// ============================================
// POST /api/auth/reset-password
// Reset token ile şifre yenileme
// ============================================

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  verifyPasswordResetToken,
  markPasswordResetUsed,
  hashPassword,
  successResponse,
  badRequestResponse,
  unauthorizedResponse,
  errorResponse,
} from '@/lib/auth';
import { audit } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token) {
      return badRequestResponse('Sıfırlama tokeni zorunludur');
    }

    if (!newPassword || newPassword.length < 4) {
      return badRequestResponse('Yeni şifre en az 4 karakter olmalıdır');
    }

    // Token doğrula
    const payload = await verifyPasswordResetToken(token);
    if (!payload) {
      return unauthorizedResponse('Geçersiz veya süresi dolmuş sıfırlama tokeni');
    }

    // Kullanıcı aktif mi?
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || !user.active) {
      return unauthorizedResponse('Kullanıcı bulunamadi veya devre disi');
    }

    // Şifreyi güncelle
    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Token'ı kullanılmış olarak işaretle
    await markPasswordResetUsed(token);

    // Tüm refresh token'ları iptal et (güvenlik — zorunlu yeniden giriş)
    await prisma.refreshToken.updateMany({
      where: { userId: user.id },
      data: { revoked: true },
    });

    // Audit log
    audit.passwordReset(user.id);

    return successResponse(
      { reset: true },
      'Şifreniz başarıyla güncellendi. Lütfen yeniden giriş yapın.'
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return errorResponse('Sifre sifirlanirken bir hata oluştu');
  }
}
