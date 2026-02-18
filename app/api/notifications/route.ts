import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getUserFromRequest,
  unauthorizedResponse,
  successResponse,
  badRequestResponse,
} from '@/lib/auth';

// GET /api/notifications - List notifications for current user
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create a notification
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const body = await request.json();

    if (!body.baslik) {
      return badRequestResponse('Bildirim basligi (baslik) zorunludur');
    }

    if (!body.userId) {
      return badRequestResponse('Hedef kullanici ID (userId) zorunludur');
    }

    const notification = await prisma.notification.create({
      data: {
        userId: body.userId,
        baslik: body.baslik,
        mesaj: body.mesaj,
        tur: body.tur ?? 'bilgi',
        kategori: body.kategori,
        okundu: false,
        link: body.link,
        entityType: body.entityType,
        entityId: body.entityId,
      },
    });

    return successResponse(notification, 'Bildirim basariyla olusturuldu');
  } catch (error) {
    console.error('Error creating notification:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}

// PUT /api/notifications - Mark notifications as read
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const body = await request.json();

    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      return badRequestResponse('Bildirim ID listesi (ids) zorunludur');
    }

    await prisma.notification.updateMany({
      where: {
        id: { in: body.ids },
        userId: user.id,
      },
      data: {
        okundu: true,
      },
    });

    return successResponse(null, 'Bildirimler okundu olarak isaretlendi');
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}
