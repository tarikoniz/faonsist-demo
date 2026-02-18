// ============================================
// FaOnSisT - Excel Report Template
// XLSX ile rapor sablonlari
// ============================================

import * as XLSX from 'xlsx';

export function createWorkbook(): XLSX.WorkBook {
  return XLSX.utils.book_new();
}

export function addDataSheet(
  wb: XLSX.WorkBook,
  sheetName: string,
  headers: string[],
  rows: (string | number)[][]
): void {
  const data = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Sutun genisliklerini ayarla
  ws['!cols'] = headers.map((h) => ({
    wch: Math.max(h.length + 2, 15),
  }));

  XLSX.utils.book_append_sheet(wb, ws, sheetName);
}

export function addSummarySheet(
  wb: XLSX.WorkBook,
  items: Array<{ label: string; value: string | number }>
): void {
  const data = [
    ['FaOnSisT - Rapor Ozeti', ''],
    ['Tarih', new Date().toLocaleDateString('tr-TR')],
    ['', ''],
    ...items.map(item => [item.label, item.value]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{ wch: 30 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Ozet');
}

export function workbookToBuffer(wb: XLSX.WorkBook): Buffer {
  return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
}
