// ============================================
// FaOnSisT - AI Chat Session Detail API
// GET: Oturum + mesajlar, PUT: Yeniden adlandir, DELETE: Sil
// ============================================

import { NextRequest } from 'next/server';
import { getUserFromRequest, unauthorizedResponse, successResponse, badRequestResponse } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/ai/sessions/:id — Oturum detayi + mesajlar
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await context.params;

    const session = await prisma.aiChatSession.findFirst({
      where: { id, userId: user.id, aktif: true },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            role: true,
            icerik: true,
            provider: true,
            model: true,
            createdAt: true,
          },
        },
      },
    });

    if (!session) {
      return Response.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Oturum bulunamadi' } },
        { status: 404 }
      );
    }

    return successResponse(session);
  } catch (error) {
    console.error('AI session detay hatasi:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Oturum yuklenemedi' } },
      { status: 500 }
    );
  }
}

// PUT /api/ai/sessions/:id — Oturumu yeniden adlandir
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await context.params;
    const body = await request.json();
    const { baslik } = body;

    if (!baslik || typeof baslik !== 'string') {
      return badRequestResponse('Baslik alani zorunludur');
    }

    const session = await prisma.aiChatSession.findFirst({
      where: { id, userId: user.id, aktif: true },
    });

    if (!session) {
      return Response.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Oturum bulunamadi' } },
        { status: 404 }
      );
    }

    const updated = await prisma.aiChatSession.update({
      where: { id },
      data: { baslik: baslik.slice(0, 200) },
    });

    return successResponse({ id: updated.id, baslik: updated.baslik });
  } catch (error) {
    console.error('AI session guncelleme hatasi:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Oturum guncellenemedi' } },
      { status: 500 }
    );
  }
}

// DELETE /api/ai/sessions/:id — Oturumu sil (soft delete)
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await context.params;

    const session = await prisma.aiChatSession.findFirst({
      where: { id, userId: user.id, aktif: true },
    });

    if (!session) {
      return Response.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Oturum bulunamadi' } },
        { status: 404 }
      );
    }

    await prisma.aiChatSession.update({
      where: { id },
      data: { aktif: false },
    });

    return successResponse({ message: 'Oturum silindi' });
  } catch (error) {
    console.error('AI session silme hatasi:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Oturum silinemedi' } },
      { status: 500 }
    );
  }
}
