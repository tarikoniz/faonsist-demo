// ============================================
// FaOnSisT - AI Report Detail API
// GET: Rapor detay, DELETE: Sil
// ============================================

import { NextRequest } from 'next/server';
import { getUserFromRequest, unauthorizedResponse, successResponse } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/ai/reports/:id — Rapor detayi
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await context.params;

    const report = await prisma.aiReport.findFirst({
      where: { id, userId: user.id },
    });

    if (!report) {
      return Response.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Rapor bulunamadi' } },
        { status: 404 }
      );
    }

    return successResponse(report);
  } catch (error) {
    console.error('AI report detail hatasi:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Rapor yuklenemedi' } },
      { status: 500 }
    );
  }
}

// DELETE /api/ai/reports/:id — Raporu sil
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await context.params;

    const report = await prisma.aiReport.findFirst({
      where: { id, userId: user.id },
    });

    if (!report) {
      return Response.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Rapor bulunamadi' } },
        { status: 404 }
      );
    }

    await prisma.aiReport.delete({ where: { id } });

    return successResponse({ message: 'Rapor silindi' });
  } catch (error) {
    console.error('AI report delete hatasi:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Rapor silinemedi' } },
      { status: 500 }
    );
  }
}
