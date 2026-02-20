// ============================================
// FaOnSisT - AI Report Service
// AI ile otomatik rapor olusturma
// ============================================

import { prisma } from '../prisma';
import { logger } from '../logger';
import { chatWithAi } from './chat-service';
import { REPORT_PROMPTS } from './report-prompts';
import { formatCurrency } from '../report-templates/pdf-template';

interface AiReportRequest {
  userId: string;
  tur: string;       // proje_ozet, maliyet_analiz, nakit_akis, performans, risk
  projectId?: string;
}

// ---- AI Rapor Olustur (asenkron) ----
export async function generateAiReport(req: AiReportRequest): Promise<string> {
  // 1. AiReport kaydı olustur
  const report = await prisma.aiReport.create({
    data: {
      userId: req.userId,
      baslik: getReportTitle(req.tur),
      tur: req.tur,
      icerik: '',
      durum: 'olusturuluyor',
      projectId: req.projectId,
    },
  });

  // 2. Asenkron olarak rapor olustur
  generateReportAsync(report.id, req).catch(err => {
    logger.error('AI rapor olusturma hatasi', {
      module: 'ai-report',
      reportId: report.id,
      error: String(err),
    });
  });

  return report.id;
}

async function generateReportAsync(reportId: string, req: AiReportRequest): Promise<void> {
  try {
    // 1. Veri topla
    const dataSummary = await collectReportData(req);

    // 2. AI'a gonder
    const systemPrompt = REPORT_PROMPTS[req.tur] || REPORT_PROMPTS.proje_ozet;
    const userMessage = `Asagidaki verileri analiz ederek rapor olustur:\n\n${JSON.stringify(dataSummary, null, 2)}`;

    const result = await chatWithAi({
      message: userMessage,
      context: {
        currentModule: 'reports',
        userRole: 'admin',
      },
      userId: req.userId,
    });

    // 3. Raporu guncelle
    await prisma.aiReport.update({
      where: { id: reportId },
      data: {
        icerik: result.response,
        veriOzeti: dataSummary as any,
        durum: 'tamamlandi',
      },
    });

    // 4. Bildirim gonder
    try {
      const { sendNotification } = await import('../notification-service');
      await sendNotification(req.userId, {
        baslik: 'AI Raporu Hazir',
        mesaj: `"${getReportTitle(req.tur)}" raporu oluşturuldu.`,
        tur: 'bilgi',
        kategori: 'rapor',
        entityType: 'ai_report',
        entityId: reportId,
      });
    } catch { /* bildirim opsiyonel */ }

    // 5. Socket.IO ile bildir
    try {
      const { emitToUser } = await import('../socket-server');
      emitToUser(req.userId, 'ai-report:ready', {
        id: reportId,
        baslik: getReportTitle(req.tur),
      });
    } catch { /* socket opsiyonel */ }

    logger.info('AI rapor tamamlandi', {
      module: 'ai-report',
      reportId,
      tur: req.tur,
    });
  } catch (error) {
    await prisma.aiReport.update({
      where: { id: reportId },
      data: {
        durum: 'hata',
        icerik: `Rapor olusturulurken hata olustu: ${error instanceof Error ? error.message : String(error)}`,
      },
    });
  }
}

// ---- Veri Toplama ----
async function collectReportData(req: AiReportRequest): Promise<Record<string, unknown>> {
  switch (req.tur) {
    case 'proje_ozet':
      return collectProjectData(req.projectId);
    case 'maliyet_analiz':
      return collectCostData();
    case 'nakit_akis':
      return collectCashFlowData(req.projectId);
    case 'performans':
      return collectPerformanceData();
    case 'risk':
      return collectRiskData();
    default:
      return collectProjectData(req.projectId);
  }
}

async function collectProjectData(projectId?: string) {
  if (projectId) {
    // Use include (not select) so relations are available on the result
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        subcontractors: true,
        tasks: true,
        cashFlows: true,
        safetyRecords: true,
      },
    });
    return {
      proje: {
        ad: project?.ad, durum: project?.durum, ilerleme: project?.ilerleme,
        butce: formatCurrency(Number(project?.butce) || 0),
        harcanan: formatCurrency(Number(project?.harcanan) || 0),
      },
      // Subcontractor fields: firma, tutar, odenen (not firmaAdi, sozlesmeTutari)
      taseronlar: project?.subcontractors?.slice(0, 10).map(s => ({
        firma: s.firma, tutar: s.tutar, odenen: s.odenen,
      })),
      gorevler: project?.tasks?.slice(0, 15).map(t => ({
        baslik: t.baslik, durum: t.durum, sonTarih: t.sonTarih, atananKisi: t.atananKisi,
      })),
      nakitAkisi: project?.cashFlows?.slice(0, 20).map(cf => ({
        tur: cf.tur, tutar: cf.tutar, kategori: cf.kategori, tarih: cf.tarih,
      })),
      isgKayitlari: project?.safetyRecords?.slice(0, 10).map(sr => ({
        tur: sr.tur, durum: sr.durum, tarih: sr.tarih,
      })),
    };
  }

  const projects = await prisma.project.findMany({
    where: { deletedAt: null },
    select: { ad: true, durum: true, ilerleme: true, butce: true, harcanan: true },
    take: 20,
  });
  return { projeler: projects.map(p => ({ ...p, butce: formatCurrency(Number(p.butce) || 0), harcanan: formatCurrency(Number(p.harcanan) || 0) })) };
}

async function collectCostData() {
  const projects = await prisma.project.findMany({
    where: { deletedAt: null },
    select: { ad: true, butce: true, harcanan: true, ilerleme: true },
    orderBy: { butce: 'desc' },
    take: 15,
  });
  let toplamButce = 0, toplamHarcama = 0;
  for (const p of projects) {
    toplamButce += Number(p.butce) || 0;
    toplamHarcama += Number(p.harcanan) || 0;
  }
  return {
    toplamButce: formatCurrency(toplamButce),
    toplamHarcama: formatCurrency(toplamHarcama),
    kullanimOrani: `%${toplamButce > 0 ? Math.round((toplamHarcama / toplamButce) * 100) : 0}`,
    projeler: projects.map(p => ({
      ad: p.ad, butce: formatCurrency(Number(p.butce) || 0),
      harcanan: formatCurrency(Number(p.harcanan) || 0), ilerleme: p.ilerleme,
    })),
  };
}

async function collectCashFlowData(projectId?: string) {
  const where = projectId ? { projectId } : {};
  const cashFlows = await prisma.cashFlow.findMany({
    where,
    select: { tur: true, tutar: true, kategori: true, tarih: true },
    orderBy: { tarih: 'desc' },
    take: 50,
  });
  let gelir = 0, gider = 0;
  for (const cf of cashFlows) {
    if (cf.tur === 'gelir') gelir += Number(cf.tutar) || 0;
    else gider += Number(cf.tutar) || 0;
  }
  return {
    toplamGelir: formatCurrency(gelir),
    toplamGider: formatCurrency(gider),
    netNakit: formatCurrency(gelir - gider),
    // tarih is String in schema — no need for .toLocaleDateString()
    detaylar: cashFlows.slice(0, 20).map(cf => ({
      tarih: cf.tarih || '',
      tur: cf.tur, kategori: cf.kategori,
      tutar: formatCurrency(Number(cf.tutar) || 0),
    })),
  };
}

async function collectPerformanceData() {
  const nowISO = new Date().toISOString();
  const [projects, tasks, overdueTasks] = await Promise.all([
    prisma.project.findMany({
      where: { deletedAt: null },
      select: { ad: true, durum: true, ilerleme: true },
    }),
    prisma.projectTask.count(),
    // sonTarih is String? — compare with ISO string
    prisma.projectTask.count({
      where: { sonTarih: { lt: nowISO }, durum: { not: 'tamamlandi' } },
    }),
  ]);
  const completedTasks = await prisma.projectTask.count({ where: { durum: 'tamamlandi' } });
  return {
    projeSayisi: projects.length,
    toplamGorev: tasks,
    tamamlananGorev: completedTasks,
    gecikenGorev: overdueTasks,
    gorevTamamlanma: `%${tasks > 0 ? Math.round((completedTasks / tasks) * 100) : 0}`,
    projeler: projects.map(p => ({ ad: p.ad, durum: p.durum, ilerleme: p.ilerleme })),
  };
}

async function collectRiskData() {
  const nowISO = new Date().toISOString();
  const [projects, overdueTasks, safetyRecords] = await Promise.all([
    prisma.project.findMany({
      where: { deletedAt: null },
      select: { ad: true, butce: true, harcanan: true, ilerleme: true, durum: true },
    }),
    // sonTarih is String? — compare with ISO string
    prisma.projectTask.findMany({
      where: { sonTarih: { lt: nowISO }, durum: { not: 'tamamlandi' } },
      select: { baslik: true, sonTarih: true },
      take: 10,
    }),
    prisma.safetyRecord.findMany({
      select: { tur: true, durum: true, tarih: true },
      take: 10,
      orderBy: { tarih: 'desc' },
    }),
  ]);
  const butceAsimi = projects.filter(p => (Number(p.harcanan) || 0) > (Number(p.butce) || 0));
  return {
    toplamProje: projects.length,
    butceAsimiOlanProjeler: butceAsimi.map(p => ({ ad: p.ad, fark: formatCurrency((Number(p.harcanan) || 0) - (Number(p.butce) || 0)) })),
    gecikenGorevler: overdueTasks,
    isgKayitlari: safetyRecords,
  };
}

function getReportTitle(tur: string): string {
  const titles: Record<string, string> = {
    proje_ozet: 'Proje Ozet Raporu',
    maliyet_analiz: 'Maliyet Analizi',
    nakit_akis: 'Nakit Akisi Raporu',
    performans: 'Performans Raporu',
    risk: 'Risk Degerlendirmesi',
  };
  return titles[tur] || 'AI Raporu';
}
