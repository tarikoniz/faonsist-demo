// ============================================
// POST /api/auth/forgot-password
// Şifre sıfırlama talebi — reset token oluştur
// ============================================

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  createPasswordResetToken,
  successResponse,
  badRequestResponse,
  errorResponse,
} from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return badRequestResponse('E-posta adresi zorunludur');
    }

    // Kullanıcı var mı kontrol et (timing attack önleme — her durumda başarı döndür)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (user && user.active) {
      // Önceki kullanılmamış tokenları invalidate et
      await prisma.passwordReset.updateMany({
        where: {
          userId: user.id,
          used: false,
          expiresAt: { gt: new Date() },
        },
        data: { used: true },
      });

      // Yeni reset token oluştur
      const resetToken = await createPasswordResetToken(user.id);

      // TODO: E-posta gönderimi — şu an token'ı logluyoruz (geliştirme ortamı)
      // Üretimde e-posta servisi entegre edilecek
      console.log(`[Auth] Password reset token for ${email}: ${resetToken}`);
      console.log(`[Auth] Reset URL: /auth/reset-password?token=${resetToken}`);
    }

    // Güvenlik: Kullanıcı bulunsun ya da bulunmasın aynı yanıt
    return successResponse(
      { sent: true },
      'Eger bu e-posta kayıtlıysa, şifre sıfırlama talimatlariniz gönderilecektir.'
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return errorResponse('Şifre sıfırlama talebi işlenirken bir hata oluştu');
  }
}
