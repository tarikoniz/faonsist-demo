// ============================================
// FaOnSisT - File Preview Service
// Excel, CSV, DOCX sunucu tarafli ayrıstırma
// ============================================

import * as XLSX from 'xlsx';

export interface ExcelPreview {
  type: 'excel';
  sheets: Array<{
    name: string;
    data: string[][];
    rowCount: number;
    colCount: number;
  }>;
}

export interface TextPreview {
  type: 'text' | 'csv';
  content: string;
  lines: number;
}

// Excel/XLSX onizleme (max 100 satir, 20 sutun)
export function extractExcelPreview(buffer: Buffer): ExcelPreview {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheets: ExcelPreview['sheets'] = [];

  for (const sheetName of workbook.SheetNames.slice(0, 5)) {
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json<string[]>(sheet, {
      header: 1,
      defval: '',
    });

    const maxRows = Math.min(json.length, 100);
    const maxCols = 20;

    const data: string[][] = [];
    for (let i = 0; i < maxRows; i++) {
      const row = (json[i] || []).slice(0, maxCols).map(cell => String(cell ?? ''));
      data.push(row);
    }

    sheets.push({
      name: sheetName,
      data,
      rowCount: json.length,
      colCount: json[0] ? (json[0] as string[]).length : 0,
    });
  }

  return { type: 'excel', sheets };
}

// CSV onizleme
export function extractCsvPreview(buffer: Buffer): TextPreview {
  const text = buffer.toString('utf-8');
  const lines = text.split('\n');
  const preview = lines.slice(0, 100).join('\n');

  return {
    type: 'csv',
    content: preview,
    lines: lines.length,
  };
}

// Text/DOCX onizleme
export function extractTextPreview(buffer: Buffer, mimeType: string): TextPreview {
  // DOCX icerigi (basit XML cikartma)
  if (mimeType.includes('wordprocessingml') || mimeType.includes('msword')) {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      // xlsx kutuphanesi docx okuyamaz, basit text cikartma deneyelim
      const text = buffer.toString('utf-8').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      return {
        type: 'text',
        content: text.slice(0, 5000),
        lines: text.split('\n').length,
      };
    } catch {
      return { type: 'text', content: 'DOCX onizleme kullanilamiyor. Dosyayi indirerek goruntuleyebilirsiniz.', lines: 1 };
    }
  }

  // Duz metin
  const text = buffer.toString('utf-8');
  const lines = text.split('\n');
  return {
    type: 'text',
    content: lines.slice(0, 200).join('\n'),
    lines: lines.length,
  };
}
