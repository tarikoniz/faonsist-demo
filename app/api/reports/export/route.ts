// ============================================
// FaOnSisT - Data Export API
// POST /api/reports/export — Toplu veri disa aktarma
// ============================================

import { NextRequest } from 'next/server';
import { getUserFromRequest, unauthorizedResponse, badRequestResponse } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createWorkbook, addDataSheet, addSummarySheet, workbookToBuffer } from '@/lib/report-templates/excel-template';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const { entityType } = body;

    if (!entityType) {
      return badRequestResponse('entityType zorunludur');
    }

    let buffer: Buffer;
    let filename: string;

    switch (entityType) {
      case 'projects':
        buffer = await exportProjects();
        filename = 'projeler.xlsx';
        break;
      case 'tenders':
        buffer = await exportTenders();
        filename = 'ihaleler.xlsx';
        break;
      case 'sales':
        buffer = await exportSales();
        filename = 'satislar.xlsx';
        break;
      case 'inventory':
        buffer = await exportInventory();
        filename = 'envanter.xlsx';
        break;
      default:
        return badRequestResponse('Geçersiz entityType: projects, tenders, sales, inventory');
    }

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Data export hatasi:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Veri aktarimi basarisiz' } },
      { status: 500 }
    );
  }
}

async function exportProjects(): Promise<Buffer> {
  const projects = await prisma.project.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
  });
  const wb = createWorkbook();
  addSummarySheet(wb, [
    { label: 'Toplam Proje', value: projects.length },
    { label: 'Disa Aktarim Tarihi', value: new Date().toLocaleDateString('tr-TR') },
  ]);
  addDataSheet(wb, 'Projeler',
    ['Ad', 'Kod', 'Konum', 'Durum', 'Ilerleme', 'Butce', 'Harcanan', 'Baslangic', 'Bitis'],
    projects.map(p => [
      p.ad || '', p.kod || '', p.konum || '', p.durum || '',
      p.ilerleme || 0, Number(p.butce) || 0, Number(p.harcanan) || 0,
      // basTarihi and bitTarihi are String? in schema
      p.basTarihi || '',
      p.bitTarihi || '',
    ])
  );
  return workbookToBuffer(wb);
}

async function exportTenders(): Promise<Buffer> {
  const tenders = await prisma.tender.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
  });
  const wb = createWorkbook();
  addSummarySheet(wb, [{ label: 'Toplam Ihale', value: tenders.length }]);
  // Tender model fields: baslik, item, tip, status, amount, toplamTutar, supplier
  addDataSheet(wb, 'Ihaleler',
    ['Baslik', 'Kalem', 'Tip', 'Durum', 'Toplam Tutar', 'Tedarikci'],
    tenders.map(t => [
      t.baslik || '', t.item || '', t.tip || '', t.status || '',
      Number(t.toplamTutar) || 0,
      t.supplier || '',
    ])
  );
  return workbookToBuffer(wb);
}

async function exportSales(): Promise<Buffer> {
  const sales = await prisma.sale.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
  });
  const wb = createWorkbook();
  addSummarySheet(wb, [{ label: 'Toplam Satis', value: sales.length }]);
  // Sale model fields: customer, product, price, stage, status, paid, installments
  addDataSheet(wb, 'Satislar',
    ['Musteri', 'Urun', 'Fiyat', 'Asama', 'Durum', 'Odenen', 'Tarih'],
    sales.map(s => [
      s.customer || '', s.product || '', Number(s.price) || 0,
      s.stage || '', s.status || '', Number(s.paid) || 0,
      s.createdAt?.toLocaleDateString('tr-TR') || '',
    ])
  );
  return workbookToBuffer(wb);
}

async function exportInventory(): Promise<Buffer> {
  const items = await prisma.inventoryItem.findMany({
    orderBy: { createdAt: 'desc' },
    include: { warehouse: { select: { ad: true } } },
  });
  const wb = createWorkbook();
  addSummarySheet(wb, [{ label: 'Toplam Urun', value: items.length }]);
  // InventoryItem fields: ad, kod (not sku), kategori, miktar, birim, birimFiyat, minStok, maxStok
  addDataSheet(wb, 'Envanter',
    ['Urun', 'Kod', 'Depo', 'Miktar', 'Birim', 'Birim Fiyat', 'Min Stok', 'Max Stok'],
    items.map(i => [
      i.ad || '', i.kod || '', i.warehouse?.ad || '',
      i.miktar || 0, i.birim || '', Number(i.birimFiyat) || 0,
      i.minStok || 0, i.maxStok || 0,
    ])
  );
  return workbookToBuffer(wb);
}
