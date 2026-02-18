// ============================================
// FaOnSisT - Dashboard API
// GET /api/dashboard — Gelismis dashboard istatistikleri
// ============================================

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getUserFromRequest,
  unauthorizedResponse,
  successResponse,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const now = new Date();
    const nowISO = now.toISOString();
    const oneWeekLaterISO = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const [
      projectCount,
      tenderCount,
      activeSalesCount,
      warehouseItemCount,
      pendingNotificationCount,
      recentActivities,
      activeProjectCount,
      completedProjectCount,
      overdueTasks,
      projects,
      upcomingDeadlines,
    ] = await Promise.all([
      prisma.project.count({ where: { deletedAt: null } }),
      prisma.tender.count({ where: { deletedAt: null } }),
      prisma.sale.count({ where: { status: 'active', deletedAt: null } }),
      prisma.inventoryItem.count(),
      prisma.notification.count({
        where: { userId: user.id, okundu: false },
      }),
      prisma.activity.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
      }),
      prisma.project.count({ where: { durum: 'devam', deletedAt: null } }),
      prisma.project.count({ where: { durum: 'tamamlandi', deletedAt: null } }),
      // sonTarih is String? — compare with ISO string
      prisma.projectTask.count({
        where: {
          sonTarih: { lt: nowISO },
          durum: { not: 'tamamlandi' },
        },
      }),
      prisma.project.findMany({
        where: { deletedAt: null },
        select: { butce: true, harcanan: true },
      }),
      // sonTarih is String? — compare with ISO strings, include project relation
      prisma.projectTask.findMany({
        where: {
          sonTarih: {
            gte: nowISO,
            lte: oneWeekLaterISO,
          },
          durum: { not: 'tamamlandi' },
        },
        include: {
          project: { select: { ad: true } },
        },
        orderBy: { sonTarih: 'asc' },
        take: 5,
      }),
    ]);

    let totalBudget = 0;
    let totalSpent = 0;
    for (const p of projects) {
      totalBudget += Number(p.butce) || 0;
      totalSpent += Number(p.harcanan) || 0;
    }

    const dashboard = {
      projectCount,
      activeProjectCount,
      completedProjectCount,
      tenderCount,
      activeSalesCount,
      warehouseItemCount,
      pendingNotificationCount,
      overdueTasks,
      totalBudget,
      totalSpent,
      budgetUtilization: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0,
      upcomingDeadlines: upcomingDeadlines.map(t => ({
        id: t.id,
        baslik: t.baslik,
        sonTarih: t.sonTarih,
        oncelik: t.oncelik,
        projeAdi: t.project?.ad || '',
      })),
      recentActivities,
    };

    return successResponse(dashboard);
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}
