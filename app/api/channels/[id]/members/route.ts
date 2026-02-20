// ============================================
// FaOnSisT - Channel Members API
// POST: Kanala üye ekle
// GET:  Kanal üyelerini listele
// DELETE: Kanaldan üye çıkar
// ============================================

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getUserFromRequest,
  unauthorizedResponse,
  successResponse,
  badRequestResponse,
  notFoundResponse,
  errorResponse,
} from '@/lib/auth';

// GET /api/channels/[id]/members - Kanal üyelerini listele
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
        _count: { select: { members: true } },
      },
    });

    if (!channel) return notFoundResponse('Kanal bulunamadı');

    return successResponse({
      channelId: id,
      members: channel.members,
      total: channel._count.members,
    });
  } catch (error) {
    console.error('Error fetching channel members:', error);
    return errorResponse('Kanal üyeleri alınırken bir hata oluştu');
  }
}

// POST /api/channels/[id]/members - Kanala üye ekle
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const body = await request.json();

    if (!body.userId) {
      return badRequestResponse('Kullanıcı ID (userId) zorunludur');
    }

    // Kanal var mı kontrol et
    const channel = await prisma.channel.findUnique({ where: { id } });
    if (!channel) return notFoundResponse('Kanal bulunamadı');

    // Kullanıcı var mı kontrol et
    const targetUser = await prisma.user.findUnique({ where: { id: body.userId } });
    if (!targetUser) return notFoundResponse('Kullanıcı bulunamadı');

    // Zaten üye mi?
    const existing = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId: id,
          userId: body.userId,
        },
      },
    });

    if (existing) {
      // Zaten üyeyse başarılı döndür (idempotent)
      return successResponse(existing, 'Kullanıcı zaten bu kanalın üyesi');
    }

    // Üye ekle
    const member = await prisma.channelMember.create({
      data: {
        channelId: id,
        userId: body.userId,
        role: body.role ?? 'member',
      },
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
    });

    return successResponse(member, 'Üye başarıyla eklendi');
  } catch (error) {
    console.error('Error adding channel member:', error);
    return errorResponse('Üye eklenirken bir hata oluştu');
  }
}

// DELETE /api/channels/[id]/members - Kanaldan üye çıkar
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const body = await request.json();

    if (!body.userId) {
      return badRequestResponse('Kullanıcı ID (userId) zorunludur');
    }

    // Kanal var mı kontrol et
    const channel = await prisma.channel.findUnique({ where: { id } });
    if (!channel) return notFoundResponse('Kanal bulunamadı');

    // Üyelik var mı?
    const existing = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId: id,
          userId: body.userId,
        },
      },
    });

    if (!existing) {
      return notFoundResponse('Kullanıcı bu kanalın üyesi değil');
    }

    await prisma.channelMember.delete({
      where: {
        channelId_userId: {
          channelId: id,
          userId: body.userId,
        },
      },
    });

    return successResponse(null, 'Üye başarıyla kanaldan çıkarıldı');
  } catch (error) {
    console.error('Error removing channel member:', error);
    return errorResponse('Üye çıkarılırken bir hata oluştu');
  }
}
