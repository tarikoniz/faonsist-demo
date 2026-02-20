// ============================================
// POST /api/auth/login
// Gerçek bcrypt + JWT kimlik doğrulama
// ============================================

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  badRequestResponse,
  unauthorizedResponse,
  successResponse,
} from '@/lib/auth';
import { audit } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return badRequestResponse('E-posta ve şifre gerekli');
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return unauthorizedResponse('Geçersiz e-posta veya şifre');
    }

    if (!user.active) {
      return unauthorizedResponse('Hesabiniz devre disi birakilmis');
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return unauthorizedResponse('Geçersiz e-posta veya şifre');
    }

    // Generate tokens
    const accessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const refreshToken = await signRefreshToken(user.id);

    // Update last seen
    await prisma.user.update({
      where: { id: user.id },
      data: { lastSeenAt: new Date() },
    });

    // Audit log
    audit.login(user.id, `${user.email} giriş yaptı`);

    return successResponse(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          permissions: user.permissions,
          avatar: user.avatar,
          department: user.department,
        },
        token: accessToken,
        refreshToken,
        expiresIn: 86400, // 24h in seconds
      },
      'Giris başarılı'
    );
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Giris islemi sirasinda bir hata oluştu' },
      },
      { status: 500 }
    );
  }
}
