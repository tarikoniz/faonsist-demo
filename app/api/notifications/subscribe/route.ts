// ============================================
// FaOnSisT - Push Notification Subscribe API
// POST: Push subscription kaydet
// ============================================

import { NextRequest } from 'next/server';
import { getUserFromRequest, unauthorizedResponse, successResponse, badRequestResponse } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const { subscription } = body;

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return badRequestResponse('Gecersiz push subscription');
    }

    // Upsert: ayni endpoint varsa guncelle, yoksa olustur
    await prisma.pushSubscription.upsert({
      where: {
        userId_endpoint: {
          userId: user.id,
          endpoint: subscription.endpoint,
        },
      },
      update: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: request.headers.get('user-agent') || undefined,
      },
      create: {
        userId: user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    });

    return successResponse({
      message: 'Push aboneligi kaydedildi',
      vapidPublicKey: process.env.VAPID_PUBLIC_KEY || '',
    });
  } catch (error) {
    console.error('Push subscribe hatasi:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Push aboneligi kaydedilemedi' } },
      { status: 500 }
    );
  }
}

// GET: VAPID public key
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    return successResponse({
      vapidPublicKey: process.env.VAPID_PUBLIC_KEY || '',
    });
  } catch {
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Hata' } },
      { status: 500 }
    );
  }
}
