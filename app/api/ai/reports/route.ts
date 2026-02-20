// ============================================
// FaOnSisT - AI Reports API
// POST: AI raporu oluştur, GET: Raporlari listele
// ============================================

import { NextRequest } from 'next/server';
import { getUserFromRequest, unauthorizedResponse, successResponse, badRequestResponse } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateAiReport } from '@/lib/ai/report-service';

export const dynamic = 'force-dynamic';

// GET /api/ai/reports — Kullanıcınin AI raporlarini listele
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);

    const [reports, total] = await Promise.all([
      prisma.aiReport.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          baslik: true,
          tur: true,
          durum: true,
          projectId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.aiReport.count({ where: { userId: user.id } }),
    ]);

    return successResponse({
      reports,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('AI reports list hatasi:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Raporlar yuklenemedi' } },
      { status: 500 }
    );
  }
}

// POST /api/ai/reports — AI raporu oluştur
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const { tur, projectId } = body;

    const validTypes = ['proje_ozet', 'maliyet_analiz', 'nakit_akis', 'performans', 'risk'];
    if (!tur || !validTypes.includes(tur)) {
      return badRequestResponse(`Geçersiz rapor turu. Gecerli turler: ${validTypes.join(', ')}`);
    }

    const reportId = await generateAiReport({
      userId: user.id,
      tur,
      projectId: projectId || undefined,
    });

    return successResponse({
      reportId,
      message: 'Rapor oluşturuluyor. Hazir oldugunda bildirim alacaksiniz.',
    });
  } catch (error) {
    console.error('AI report create hatasi:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Rapor oluşturulamadi' } },
      { status: 500 }
    );
  }
}
