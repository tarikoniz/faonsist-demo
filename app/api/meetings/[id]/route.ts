import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, successResponse, errorResponse } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return errorResponse('Yetkisiz erisim', 401, 'UNAUTHORIZED');

    const { id } = await params;
    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: { createdBy: { select: { id: true, name: true, avatar: true } } },
    });

    if (!meeting) return errorResponse('Toplanti bulunamadi', 404, 'NOT_FOUND');
    return successResponse(meeting);
  } catch (error: any) {
    return errorResponse(error.message || 'Sunucu hatasi', 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return errorResponse('Yetkisiz erisim', 401, 'UNAUTHORIZED');

    const { id } = await params;
    const body = await request.json();

    const meeting = await prisma.meeting.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.startTime && { startTime: new Date(body.startTime) }),
        ...(body.endTime && { endTime: new Date(body.endTime) }),
        ...(body.channelId !== undefined && { channelId: body.channelId }),
        ...(body.participants && { participants: body.participants }),
        ...(body.location !== undefined && { location: body.location }),
        ...(body.status && { status: body.status }),
      },
      include: { createdBy: { select: { id: true, name: true, avatar: true } } },
    });

    return successResponse(meeting, 'Toplanti guncellendi');
  } catch (error: any) {
    return errorResponse(error.message || 'Sunucu hatasi', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return errorResponse('Yetkisiz erisim', 401, 'UNAUTHORIZED');

    const { id } = await params;
    await prisma.meeting.delete({ where: { id } });
    return successResponse(null, 'Toplanti silindi');
  } catch (error: any) {
    return errorResponse(error.message || 'Sunucu hatasi', 500);
  }
}
