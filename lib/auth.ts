// ============================================
// FaOnSisT - Authentication Helpers
// bcrypt + jose (JWT)
// ============================================

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { prisma } from './prisma';

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');
// JWT_SECRET lazy getter — modül yüklenirken env henüz set edilmemiş olabilir
// Bu yüzden her çağrıda process.env'den okuyoruz
function getJwtSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET || 'faonsist-dev-secret-key-min-32-chars!!');
}
function getRefreshSecret() {
  return new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET || 'faonsist-refresh-dev-secret-key!!');
}
// Geriye dönük uyumluluk için sabitler (sign sırasında zaten env yüklü olduğundan OK)
const JWT_SECRET = getJwtSecret();
const REFRESH_SECRET = getRefreshSecret();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

export interface TokenPayload extends JWTPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

// ---- Password Hashing ----

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, BCRYPT_ROUNDS);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

// ---- JWT Token Generation ----

function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return 24 * 60 * 60; // default 24h
  const value = parseInt(match[1]);
  switch (match[2]) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 3600;
    case 'd': return value * 86400;
    default: return 86400;
  }
}

export async function signAccessToken(payload: {
  userId: string;
  email: string;
  role: string;
  name: string;
}): Promise<string> {
  const seconds = parseDuration(JWT_EXPIRES_IN);
  return new SignJWT({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    name: payload.name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${seconds}s`)
    .setIssuer('faonsist')
    .sign(JWT_SECRET);
}

export async function signRefreshToken(userId: string, family?: string): Promise<string> {
  const seconds = parseDuration(REFRESH_EXPIRES_IN);
  const tokenFamily = family || crypto.randomUUID();

  const token = await new SignJWT({ userId, family: tokenFamily })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${seconds}s`)
    .setIssuer('faonsist')
    .sign(REFRESH_SECRET);

  // Store refresh token in DB with family tracking for rotation
  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      family: tokenFamily,
      expiresAt: new Date(Date.now() + seconds * 1000),
    },
  });

  return token;
}

// ---- JWT Token Verification ----

export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      issuer: 'faonsist',
    });
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(
  token: string
): Promise<{ userId: string; family: string | null } | null> {
  try {
    // Check if token exists in DB
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!storedToken) return null;

    // Token revoked? → Replay attack! Aile içindeki tüm tokenları iptal et
    if (storedToken.revoked) {
      console.warn(`[Auth] Refresh token replay detected for user ${storedToken.userId}, revoking family`);
      if (storedToken.family) {
        await prisma.refreshToken.updateMany({
          where: { family: storedToken.family },
          data: { revoked: true },
        });
      }
      return null;
    }

    // Expired?
    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      return null;
    }

    // Verify JWT signature
    const { payload } = await jwtVerify(token, getRefreshSecret(), {
      issuer: 'faonsist',
    });

    return {
      userId: payload.userId as string,
      family: storedToken.family,
    };
  } catch {
    return null;
  }
}

/**
 * Eski refresh token'ı revoke et (rotation sırasında)
 */
export async function revokeRefreshToken(token: string): Promise<void> {
  try {
    await prisma.refreshToken.update({
      where: { token },
      data: { revoked: true },
    });
  } catch {
    // Token bulunamazsa sessizce geç
  }
}

/**
 * Password reset token oluştur
 */
export async function createPasswordResetToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 saat

  await prisma.passwordReset.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

/**
 * Password reset token doğrula
 */
export async function verifyPasswordResetToken(
  token: string
): Promise<{ userId: string } | null> {
  const reset = await prisma.passwordReset.findUnique({
    where: { token },
  });

  if (!reset || reset.used || reset.expiresAt < new Date()) {
    return null;
  }

  return { userId: reset.userId };
}

/**
 * Password reset token'ı kullanılmış olarak işaretle
 */
export async function markPasswordResetUsed(token: string): Promise<void> {
  await prisma.passwordReset.update({
    where: { token },
    data: { used: true },
  });
}

// ---- Request Helpers ----

export async function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7);
  const payload = await verifyAccessToken(token);
  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      permissions: true,
      avatar: true,
      department: true,
      active: true,
    },
  });

  if (!user || !user.active) {
    return null;
  }

  return user;
}

// ---- Utility ----

export function unauthorizedResponse(message = 'Yetkisiz erisim') {
  return Response.json(
    { success: false, error: { code: 'UNAUTHORIZED', message } },
    { status: 401 }
  );
}

export function forbiddenResponse(message = 'Bu islem icin yetkiniz yok') {
  return Response.json(
    { success: false, error: { code: 'FORBIDDEN', message } },
    { status: 403 }
  );
}

export function badRequestResponse(message: string, details?: Record<string, string[]>) {
  return Response.json(
    { success: false, error: { code: 'BAD_REQUEST', message, details } },
    { status: 400 }
  );
}

export function notFoundResponse(message = 'Kayit bulunamadi') {
  return Response.json(
    { success: false, error: { code: 'NOT_FOUND', message } },
    { status: 404 }
  );
}

export function errorResponse(message: string, status = 500, code = 'SERVER_ERROR') {
  return Response.json(
    { success: false, error: { code, message } },
    { status }
  );
}

export function successResponse<T>(data: T, message?: string) {
  return Response.json({ success: true, data, message });
}
