// ============================================
// FaOnSisT - Dashboard Charts API
// GET /api/dashboard/charts — Grafik verisi
// ============================================

import { NextRequest } from 'next/server';
import { getUserFromRequest, unauthorizedResponse, successResponse } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'progress';

    switch (type) {
      case 'progress':
        return successResponse(await getProjectProgress());
      case 'cashflow':
        return successResponse(await getCashFlow());
      case 'cost':
        return successResponse(await getCostComparison());
      case 'trend':
        return successResponse(await getMonthlyTrend());
      default:
        return successResponse(await getProjectProgress());
    }
  } catch (error) {
    console.error('Dashboard charts hatasi:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Grafik verisi alinamadi' } },
      { status: 500 }
    );
  }
}

// Proje Durumu — Doughnut chart
async function getProjectProgress() {
  const projects = await prisma.project.findMany({
    where: { deletedAt: null },
    select: { durum: true },
  });

  const statusCounts: Record<string, number> = {};
  for (const p of projects) {
    const status = p.durum || 'belirsiz';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  }

  const statusLabels: Record<string, string> = {
    devam: 'Devam Eden',
    tamamlandi: 'Tamamlanan',
    beklemede: 'Beklemede',
    iptal: 'İptal',
    planlama: 'Planlama',
    belirsiz: 'Belirsiz',
  };

  return {
    type: 'progress',
    labels: Object.keys(statusCounts).map(k => statusLabels[k] || k),
    datasets: [{
      data: Object.values(statusCounts),
      backgroundColor: ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'],
    }],
    total: projects.length,
  };
}

// Nakit Akisi — Bar chart (aylik gelir/gider)
async function getCashFlow() {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  // tarih is String in schema, compare as ISO string
  const cashFlows = await prisma.cashFlow.findMany({
    where: { tarih: { gte: sixMonthsAgo.toISOString() } },
    select: { tutar: true, tur: true, tarih: true },
  });

  const months: string[] = [];
  const gelirData: number[] = [];
  const giderData: number[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = d.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });
    months.push(monthLabel);

    let gelir = 0;
    let gider = 0;
    for (const cf of cashFlows) {
      // tarih is a String field — parse it to extract year/month
      const cfDate = new Date(cf.tarih);
      const cfMonth = `${cfDate.getFullYear()}-${String(cfDate.getMonth() + 1).padStart(2, '0')}`;
      if (cfMonth === monthKey) {
        const amount = Number(cf.tutar) || 0;
        if (cf.tur === 'gelir') gelir += amount;
        else gider += amount;
      }
    }
    gelirData.push(gelir);
    giderData.push(gider);
  }

  return {
    type: 'cashflow',
    labels: months,
    datasets: [
      { label: 'Gelir', data: gelirData, backgroundColor: '#22c55e' },
      { label: 'Gider', data: giderData, backgroundColor: '#ef4444' },
    ],
  };
}

// Butce vs Harcama — Horizontal bar chart
async function getCostComparison() {
  const projects = await prisma.project.findMany({
    where: { deletedAt: null },
    select: { ad: true, butce: true, harcanan: true },
    orderBy: { butce: 'desc' },
    take: 10,
  });

  return {
    type: 'cost',
    labels: projects.map(p => p.ad?.slice(0, 25) || 'Adsiz'),
    datasets: [
      {
        label: 'Bütçe',
        data: projects.map(p => Number(p.butce) || 0),
        backgroundColor: '#3b82f6',
      },
      {
        label: 'Harcanan',
        data: projects.map(p => Number(p.harcanan) || 0),
        backgroundColor: '#f59e0b',
      },
    ],
  };
}

// Aylik Trend — Line chart (proje, ihale, satis sayilari)
async function getMonthlyTrend() {
  const now = new Date();
  const months: string[] = [];
  const projectData: number[] = [];
  const tenderData: number[] = [];
  const salesData: number[] = [];

  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const monthLabel = start.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });
    months.push(monthLabel);

    const [pCount, tCount, sCount] = await Promise.all([
      prisma.project.count({ where: { createdAt: { gte: start, lt: end }, deletedAt: null } }),
      prisma.tender.count({ where: { createdAt: { gte: start, lt: end }, deletedAt: null } }),
      prisma.sale.count({ where: { createdAt: { gte: start, lt: end }, deletedAt: null } }),
    ]);

    projectData.push(pCount);
    tenderData.push(tCount);
    salesData.push(sCount);
  }

  return {
    type: 'trend',
    labels: months,
    datasets: [
      { label: 'Projeler', data: projectData, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)' },
      { label: 'İhaleler', data: tenderData, borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.1)' },
      { label: 'Satışlar', data: salesData, borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)' },
    ],
  };
}
