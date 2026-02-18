// ============================================
// POST /api/auth/register
// Yeni kullanıcı oluşturma
// ============================================

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  hashPassword,
  signAccessToken,
  signRefreshToken,
  badRequestResponse,
  successResponse,
} from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone, role, department } = body;

    // Validate input
    if (!name || !email || !password) {
      return badRequestResponse('Ad, e-posta ve sifre gerekli');
    }

    if (password.length < 4) {
      return badRequestResponse('Sifre en az 4 karakter olmali');
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return Response.json(
        {
          success: false,
          error: { code: 'EMAIL_EXISTS', message: 'Bu e-posta adresi zaten kullanilmakta' },
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone: phone || null,
        role: role || 'employee',
        department: department || null,
        active: true,
      },
    });

    // Generate tokens
    const accessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const refreshToken = await signRefreshToken(user.id);

    return successResponse(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          department: user.department,
        },
        token: accessToken,
        refreshToken,
        expiresIn: 86400,
      },
      'Kayit basarili'
    );
  } catch (error) {
    console.error('Register error:', error);
    return Response.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Sunucu hatasi olustu' },
      },
      { status: 500 }
    );
  }
}
