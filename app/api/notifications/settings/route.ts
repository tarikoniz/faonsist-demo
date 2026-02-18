// ============================================
// FaOnSisT - Notification Settings API
// GET/PUT: Bildirim tercihleri
// ============================================

import { NextRequest } from 'next/server';
import { getUserFromRequest, unauthorizedResponse, successResponse } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const DEFAULT_SETTINGS = {
  emailEnabled: true,
  pushEnabled: true,
  emailDigest: 'anlik',
  categories: {
    proje: { email: true, push: true },
    ihale: { email: true, push: true },
    gorev: { email: true, push: true },
    depo: { email: false, push: true },
    arac: { email: false, push: true },
    sistem: { email: true, push: false },
  },
};

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const existing = await prisma.notificationSettings.findFirst({
      where: { userId: user.id },
    });

    if (existing) {
      return successResponse({
        settings: typeof existing.settings === 'string'
          ? JSON.parse(existing.settings as string)
          : existing.settings || DEFAULT_SETTINGS,
      });
    }

    return successResponse({ settings: DEFAULT_SETTINGS });
  } catch (error) {
    console.error('Notification settings GET hatasi:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Ayarlar yuklenemedi' } },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return Response.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Gecersiz ayarlar' } },
        { status: 400 }
      );
    }

    const existing = await prisma.notificationSettings.findFirst({
      where: { userId: user.id },
    });

    if (existing) {
      await prisma.notificationSettings.update({
        where: { id: existing.id },
        data: { settings: JSON.stringify(settings) },
      });
    } else {
      await prisma.notificationSettings.create({
        data: {
          userId: user.id,
          settings: JSON.stringify(settings),
        },
      });
    }

    return successResponse({ message: 'Ayarlar guncellendi', settings });
  } catch (error) {
    console.error('Notification settings PUT hatasi:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Ayarlar guncellenemedi' } },
      { status: 500 }
    );
  }
}
