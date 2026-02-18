// ============================================
// FaOnSisT - AI Chat Sessions API
// GET: Oturumlari listele, POST: Yeni oturum
// ============================================

import { NextRequest } from 'next/server';
import { getUserFromRequest, unauthorizedResponse, successResponse, badRequestResponse } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/ai/sessions — Kullanicinin AI sohbet oturumlarini listele
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      prisma.aiChatSession.findMany({
        where: { userId: user.id, aktif: true },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { icerik: true, role: true, createdAt: true },
          },
        },
      }),
      prisma.aiChatSession.count({ where: { userId: user.id, aktif: true } }),
    ]);

    const data = sessions.map(s => ({
      id: s.id,
      baslik: s.baslik,
      mesajSayisi: s.mesajSayisi,
      sonMesaj: s.messages[0]?.icerik?.slice(0, 100) || '',
      updatedAt: s.updatedAt,
      createdAt: s.createdAt,
    }));

    return successResponse({
      sessions: data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('AI sessions listesi hatasi:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Oturumlar yuklenemedi' } },
      { status: 500 }
    );
  }
}

// POST /api/ai/sessions — Yeni sohbet oturumu olustur
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const { baslik } = body;

    if (!baslik || typeof baslik !== 'string') {
      return badRequestResponse('Baslik alani zorunludur');
    }

    const session = await prisma.aiChatSession.create({
      data: {
        userId: user.id,
        baslik: baslik.slice(0, 200),
      },
    });

    return successResponse({ id: session.id, baslik: session.baslik });
  } catch (error) {
    console.error('AI session olusturma hatasi:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Oturum olusturulamadi' } },
      { status: 500 }
    );
  }
}
