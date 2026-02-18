// ============================================
// FaOnSisT - PDF Report Template
// PDFKit ile rapor sablonlari
// ============================================

import PDFDocument from 'pdfkit';

export function createPdfDocument(): PDFKit.PDFDocument {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    info: {
      Title: 'FaOnSisT Rapor',
      Author: 'FaOnSisT Platform',
    },
  });
  return doc;
}

export function renderPdfHeader(doc: PDFKit.PDFDocument, title: string, subtitle?: string): void {
  // Logo/Marka
  doc.fontSize(20).fillColor('#3b82f6').text('FaOnSisT', { align: 'left' });
  doc.fontSize(8).fillColor('#94a3b8').text('Insaat Yonetim Platformu');
  doc.moveDown(0.5);

  // Baslik
  doc.fontSize(16).fillColor('#1e293b').text(title, { align: 'center' });
  if (subtitle) {
    doc.fontSize(10).fillColor('#64748b').text(subtitle, { align: 'center' });
  }
  doc.moveDown(0.3);

  // Tarih
  doc.fontSize(8).fillColor('#94a3b8')
    .text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}`, { align: 'right' });
  doc.moveDown(0.5);

  // Cizgi
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#e2e8f0');
  doc.moveDown(0.5);
}

export function renderPdfTable(
  doc: PDFKit.PDFDocument,
  headers: string[],
  rows: string[][],
  colWidths?: number[]
): void {
  const tableWidth = 495;
  const defaultColWidth = tableWidth / headers.length;
  const widths = colWidths || headers.map(() => defaultColWidth);
  const rowHeight = 20;
  let startX = 50;
  let y = doc.y;

  // Header row
  doc.fontSize(8).fillColor('#ffffff');
  let x = startX;
  for (let i = 0; i < headers.length; i++) {
    doc.rect(x, y, widths[i], rowHeight).fill('#3b82f6');
    doc.fillColor('#ffffff').text(headers[i], x + 4, y + 5, { width: widths[i] - 8 });
    x += widths[i];
  }
  y += rowHeight;

  // Data rows
  for (let r = 0; r < rows.length; r++) {
    if (y > 750) {
      doc.addPage();
      y = 50;
    }

    const bgColor = r % 2 === 0 ? '#f8fafc' : '#ffffff';
    x = startX;

    for (let c = 0; c < headers.length; c++) {
      doc.rect(x, y, widths[c], rowHeight).fill(bgColor);
      doc.fillColor('#334155').fontSize(7)
        .text(rows[r]?.[c] || '', x + 4, y + 5, { width: widths[c] - 8 });
      x += widths[c];
    }
    y += rowHeight;
  }

  doc.y = y + 10;
}

export function renderPdfSummary(doc: PDFKit.PDFDocument, items: Array<{ label: string; value: string }>): void {
  doc.moveDown(0.5);
  doc.fontSize(12).fillColor('#1e293b').text('Ozet', { underline: true });
  doc.moveDown(0.3);

  for (const item of items) {
    doc.fontSize(9).fillColor('#64748b').text(`${item.label}: `, { continued: true });
    doc.fillColor('#1e293b').text(item.value);
  }
  doc.moveDown(0.5);
}

export function renderPdfFooter(doc: PDFKit.PDFDocument): void {
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc.fontSize(7).fillColor('#94a3b8')
      .text(
        `FaOnSisT Rapor | Sayfa ${i + 1} / ${pages.count} | ${new Date().toLocaleDateString('tr-TR')}`,
        50, 780,
        { align: 'center', width: 495 }
      );
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
  }).format(amount);
}
