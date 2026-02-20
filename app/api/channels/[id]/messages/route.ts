import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getUserFromRequest,
  unauthorizedResponse,
  successResponse,
  badRequestResponse,
  notFoundResponse,
} from '@/lib/auth';

// GET /api/channels/[id]/messages - List messages for a channel
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await params;

    const channel = await prisma.channel.findUnique({ where: { id } });
    if (!channel) {
      return notFoundResponse('Kanal bulunamadi');
    }

    const { searchParams } = new URL(request.url);
    const take = parseInt(searchParams.get('limit') || '50', 10);
    const skip = parseInt(searchParams.get('offset') || '0', 10);

    const messages = await prisma.message.findMany({
      where: { channelId: id },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return successResponse(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}

// POST /api/channels/[id]/messages - Send a message to a channel
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const body = await request.json();

    if (!body.text) {
      return badRequestResponse('Mesaj metni (text) zorunludur');
    }

    const channel = await prisma.channel.findUnique({ where: { id } });
    if (!channel) {
      return notFoundResponse('Kanal bulunamadi');
    }

    const message = await prisma.message.create({
      data: {
        channelId: id,
        userId: user.id,
        text: body.text,
        time: new Date().toLocaleTimeString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return successResponse(message, 'Mesaj başarıyla gonderildi');
  } catch (error) {
    console.error('Error sending message:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}
