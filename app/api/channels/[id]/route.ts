import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getUserFromRequest,
  unauthorizedResponse,
  successResponse,
  notFoundResponse,
  badRequestResponse,
} from '@/lib/auth';

// GET /api/channels/[id] - Get single channel with members and messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await params;

    const channel = await prisma.channel.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        files: true,
        _count: {
          select: { members: true, messages: true },
        },
      },
    });

    if (!channel) {
      return notFoundResponse('Kanal bulunamadi');
    }

    return successResponse(channel);
  } catch (error) {
    console.error('Error fetching channel:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}

// PUT /api/channels/[id] - Update channel
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.channel.findUnique({ where: { id } });
    if (!existing) {
      return notFoundResponse('Kanal bulunamadi');
    }

    const channel = await prisma.channel.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        type: body.type ?? existing.type,
      },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    return successResponse(channel, 'Kanal başarıyla güncellendi');
  } catch (error) {
    console.error('Error updating channel:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}

// DELETE /api/channels/[id] - Delete channel
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await params;

    const existing = await prisma.channel.findUnique({ where: { id } });
    if (!existing) {
      return notFoundResponse('Kanal bulunamadi');
    }

    await prisma.channel.delete({ where: { id } });

    return successResponse(null, 'Kanal başarıyla silindi');
  } catch (error) {
    console.error('Error deleting channel:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}
