// ============================================
// FaOnSisT - File Preview API
// GET /api/uploads/:id/preview — Dosya onizleme
// ============================================

import { NextRequest } from 'next/server';
import { getUserFromRequest, unauthorizedResponse, successResponse } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { extractExcelPreview, extractCsvPreview, extractTextPreview } from '@/lib/file-preview';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await context.params;

    const file = await prisma.fileUpload.findUnique({
      where: { id },
    });

    if (!file) {
      return Response.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Dosya bulunamadi' } },
        { status: 404 }
      );
    }

    const mime = file.mimeType || '';
    const ext = file.originalName?.split('.').pop()?.toLowerCase() || '';

    // Resim — onizleme gerekmez (frontend dogrudan gosterir)
    if (mime.startsWith('image/')) {
      return successResponse({ type: 'image', url: `/api/uploads/${id}` });
    }

    // PDF — iframe ile goster
    if (mime === 'application/pdf' || ext === 'pdf') {
      return successResponse({ type: 'pdf', url: `/api/uploads/${id}` });
    }

    // Dosyayi oku
    const filePath = join(process.cwd(), file.path);
    let buffer: Buffer;
    try {
      buffer = await readFile(filePath);
    } catch {
      return Response.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Dosya diskte bulunamadi' } },
        { status: 404 }
      );
    }

    // Excel
    if (
      mime.includes('spreadsheetml') ||
      mime.includes('ms-excel') ||
      ext === 'xlsx' || ext === 'xls'
    ) {
      const preview = extractExcelPreview(buffer);
      return successResponse(preview);
    }

    // CSV
    if (mime === 'text/csv' || ext === 'csv') {
      const preview = extractCsvPreview(buffer);
      return successResponse(preview);
    }

    // DOCX/DOC
    if (
      mime.includes('wordprocessingml') ||
      mime.includes('msword') ||
      ext === 'docx' || ext === 'doc'
    ) {
      const preview = extractTextPreview(buffer, mime);
      return successResponse(preview);
    }

    // Duz metin
    if (mime.startsWith('text/') || ext === 'txt' || ext === 'json' || ext === 'xml') {
      const preview = extractTextPreview(buffer, mime);
      return successResponse(preview);
    }

    // Diger — onizleme yok
    return successResponse({
      type: 'unsupported',
      fileName: file.originalName,
      size: file.size,
      mimeType: mime,
    });
  } catch (error) {
    console.error('File preview hatasi:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Onizleme olusturulamadi' } },
      { status: 500 }
    );
  }
}
