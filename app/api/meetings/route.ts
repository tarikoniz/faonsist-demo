import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, successResponse, errorResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return errorResponse('Yetkisiz erisim', 401, 'UNAUTHORIZED');

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const where: any = {};
    if (status) where.status = status;
    if (from) where.startTime = { ...where.startTime, gte: new Date(from) };
    if (to) where.startTime = { ...where.startTime, lte: new Date(to) };

    const meetings = await prisma.meeting.findMany({
      where,
      include: { createdBy: { select: { id: true, name: true, avatar: true } } },
      orderBy: { startTime: 'asc' },
    });

    return successResponse(meetings);
  } catch (error: any) {
    return errorResponse(error.message || 'Sunucu hatasi', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return errorResponse('Yetkisiz erisim', 401, 'UNAUTHORIZED');

    const body = await request.json();
    const { title, description, startTime, endTime, channelId, participants, location } = body;

    if (!title || !startTime || !endTime) {
      return errorResponse('Baslik, baslangic ve bitis zamani zorunludur', 400, 'VALIDATION_ERROR');
    }

    const meeting = await prisma.meeting.create({
      data: {
        title,
        description: description || null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        channelId: channelId || null,
        createdById: user.id,
        participants: participants || [],
        location: location || null,
      },
      include: { createdBy: { select: { id: true, name: true, avatar: true } } },
    });

    return successResponse(meeting, 'Toplanti oluşturuldu');
  } catch (error: any) {
    return errorResponse(error.message || 'Sunucu hatasi', 500);
  }
}
