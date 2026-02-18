// ============================================
// FaOnSisT - Report Generator
// PDF ve Excel rapor olusturma motoru
// ============================================

import { prisma } from './prisma';
import {
  createPdfDocument,
  renderPdfHeader,
  renderPdfTable,
  renderPdfSummary,
  renderPdfFooter,
  formatCurrency,
} from './report-templates/pdf-template';
import {
  createWorkbook,
  addDataSheet,
  addSummarySheet,
  workbookToBuffer,
} from './report-templates/excel-template';

// ---- Proje Raporu ----
export async function generateProjectReport(
  projectId: string,
  format: 'pdf' | 'xlsx'
): Promise<Buffer> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      subcontractors: true,
      workItems: true,
      progressClaims: true,
      cashFlows: true,
      tasks: true,
      safetyRecords: true,
    },
  });

  if (!project) throw new Error('Proje bulunamadi');

  if (format === 'xlsx') {
    return generateProjectExcel(project);
  }
  return generateProjectPdf(project);
}

function generateProjectPdf(project: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = createPdfDocument();
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    renderPdfHeader(doc, `Proje Raporu: ${project.ad || ''}`, project.kod || '');

    // Ozet
    // basTarihi and bitTarihi are String? — use directly
    renderPdfSummary(doc, [
      { label: 'Proje Adi', value: project.ad || '-' },
      { label: 'Durum', value: project.durum || '-' },
      { label: 'Ilerleme', value: `%${project.ilerleme || 0}` },
      { label: 'Butce', value: formatCurrency(Number(project.butce) || 0) },
      { label: 'Harcanan', value: formatCurrency(Number(project.harcanan) || 0) },
      { label: 'Baslangic', value: project.basTarihi || '-' },
      { label: 'Bitis', value: project.bitTarihi || '-' },
    ]);

    // Taseron tablosu
    // Subcontractor fields: firma, isKalemi, tutar, odenen (not firmaAdi, sozlesmeTutari)
    if (project.subcontractors?.length > 0) {
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor('#1e293b').text('Taseronlar');
      renderPdfTable(doc,
        ['Firma', 'Is Kalemi', 'Sozlesme Tutari', 'Odenen'],
        project.subcontractors.map((s: any) => [
          s.firma || '-',
          s.isKalemi || '-',
          formatCurrency(Number(s.tutar) || 0),
          formatCurrency(Number(s.odenen) || 0),
        ]),
        [150, 130, 110, 105]
      );
    }

    // Gorevler
    // sonTarih is String? — use directly
    if (project.tasks?.length > 0) {
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor('#1e293b').text('Gorevler');
      renderPdfTable(doc,
        ['Gorev', 'Atanan', 'Durum', 'Son Tarih'],
        project.tasks.map((t: any) => [
          t.baslik || '-',
          t.atananKisi || '-',
          t.durum || '-',
          t.sonTarih || '-',
        ]),
        [180, 110, 100, 105]
      );
    }

    renderPdfFooter(doc);
    doc.end();
  });
}

function generateProjectExcel(project: any): Buffer {
  const wb = createWorkbook();

  addSummarySheet(wb, [
    { label: 'Proje Adi', value: project.ad || '-' },
    { label: 'Durum', value: project.durum || '-' },
    { label: 'Ilerleme', value: `%${project.ilerleme || 0}` },
    { label: 'Butce', value: Number(project.butce) || 0 },
    { label: 'Harcanan', value: Number(project.harcanan) || 0 },
  ]);

  // Subcontractor fields: firma, isKalemi, tutar, odenen
  if (project.subcontractors?.length > 0) {
    addDataSheet(wb, 'Taseronlar',
      ['Firma', 'Is Kalemi', 'Sozlesme Tutari', 'Odenen'],
      project.subcontractors.map((s: any) => [
        s.firma || '', s.isKalemi || '',
        Number(s.tutar) || 0, Number(s.odenen) || 0,
      ])
    );
  }

  // sonTarih is String? — use directly
  if (project.tasks?.length > 0) {
    addDataSheet(wb, 'Gorevler',
      ['Gorev', 'Atanan', 'Durum', 'Son Tarih'],
      project.tasks.map((t: any) => [
        t.baslik || '', t.atananKisi || '', t.durum || '',
        t.sonTarih || '',
      ])
    );
  }

  // tarih is String — use directly
  if (project.cashFlows?.length > 0) {
    addDataSheet(wb, 'Nakit Akisi',
      ['Tarih', 'Tur', 'Kategori', 'Tutar', 'Aciklama'],
      project.cashFlows.map((cf: any) => [
        cf.tarih || '',
        cf.tur || '', cf.kategori || '',
        Number(cf.tutar) || 0, cf.aciklama || '',
      ])
    );
  }

  return workbookToBuffer(wb);
}

// ---- Maliyet Analizi Raporu ----
export async function generateCostAnalysis(format: 'pdf' | 'xlsx'): Promise<Buffer> {
  const projects = await prisma.project.findMany({
    where: { deletedAt: null },
    select: { ad: true, butce: true, harcanan: true, ilerleme: true, durum: true },
    orderBy: { butce: 'desc' },
  });

  let totalBudget = 0;
  let totalSpent = 0;
  for (const p of projects) {
    totalBudget += Number(p.butce) || 0;
    totalSpent += Number(p.harcanan) || 0;
  }

  if (format === 'xlsx') {
    const wb = createWorkbook();
    addSummarySheet(wb, [
      { label: 'Toplam Butce', value: totalBudget },
      { label: 'Toplam Harcama', value: totalSpent },
      { label: 'Kalan', value: totalBudget - totalSpent },
      { label: 'Kullanim Orani', value: `%${totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}` },
    ]);
    addDataSheet(wb, 'Proje Detay',
      ['Proje', 'Butce', 'Harcanan', 'Fark', 'Ilerleme', 'Durum'],
      projects.map(p => [
        p.ad || '', Number(p.butce) || 0, Number(p.harcanan) || 0,
        (Number(p.butce) || 0) - (Number(p.harcanan) || 0),
        `%${p.ilerleme || 0}`, p.durum || '',
      ])
    );
    return workbookToBuffer(wb);
  }

  return new Promise((resolve, reject) => {
    const doc = createPdfDocument();
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    renderPdfHeader(doc, 'Maliyet Analizi Raporu');
    renderPdfSummary(doc, [
      { label: 'Toplam Butce', value: formatCurrency(totalBudget) },
      { label: 'Toplam Harcama', value: formatCurrency(totalSpent) },
      { label: 'Kalan Butce', value: formatCurrency(totalBudget - totalSpent) },
      { label: 'Kullanim Orani', value: `%${totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}` },
    ]);

    renderPdfTable(doc,
      ['Proje', 'Butce', 'Harcanan', 'Fark', 'Durum'],
      projects.map(p => [
        (p.ad || '-').slice(0, 25),
        formatCurrency(Number(p.butce) || 0),
        formatCurrency(Number(p.harcanan) || 0),
        formatCurrency((Number(p.butce) || 0) - (Number(p.harcanan) || 0)),
        p.durum || '-',
      ]),
      [140, 90, 90, 90, 85]
    );

    renderPdfFooter(doc);
    doc.end();
  });
}

// ---- Nakit Akisi Raporu ----
export async function generateCashFlowReport(
  projectId?: string,
  format: 'pdf' | 'xlsx' = 'pdf'
): Promise<Buffer> {
  const where = projectId ? { projectId } : {};
  const cashFlows = await prisma.cashFlow.findMany({
    where,
    include: { project: { select: { ad: true } } },
    orderBy: { tarih: 'desc' },
    take: 500,
  });

  let totalGelir = 0;
  let totalGider = 0;
  for (const cf of cashFlows) {
    const amount = Number(cf.tutar) || 0;
    if (cf.tur === 'gelir') totalGelir += amount;
    else totalGider += amount;
  }

  if (format === 'xlsx') {
    const wb = createWorkbook();
    addSummarySheet(wb, [
      { label: 'Toplam Gelir', value: totalGelir },
      { label: 'Toplam Gider', value: totalGider },
      { label: 'Net', value: totalGelir - totalGider },
    ]);
    // tarih is String — use directly
    addDataSheet(wb, 'Nakit Akisi',
      ['Tarih', 'Proje', 'Tur', 'Kategori', 'Tutar', 'Aciklama'],
      cashFlows.map(cf => [
        cf.tarih || '',
        cf.project?.ad || '', cf.tur || '', cf.kategori || '',
        Number(cf.tutar) || 0, cf.aciklama || '',
      ])
    );
    return workbookToBuffer(wb);
  }

  return new Promise((resolve, reject) => {
    const doc = createPdfDocument();
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    renderPdfHeader(doc, 'Nakit Akisi Raporu');
    renderPdfSummary(doc, [
      { label: 'Toplam Gelir', value: formatCurrency(totalGelir) },
      { label: 'Toplam Gider', value: formatCurrency(totalGider) },
      { label: 'Net Nakit', value: formatCurrency(totalGelir - totalGider) },
    ]);

    // tarih is String — use directly
    renderPdfTable(doc,
      ['Tarih', 'Proje', 'Tur', 'Kategori', 'Tutar'],
      cashFlows.slice(0, 50).map(cf => [
        cf.tarih || '-',
        (cf.project?.ad || '-').slice(0, 20),
        cf.tur || '-', cf.kategori || '-',
        formatCurrency(Number(cf.tutar) || 0),
      ]),
      [80, 120, 70, 100, 125]
    );

    renderPdfFooter(doc);
    doc.end();
  });
}
