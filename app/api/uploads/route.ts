// ============================================
// FaOnSisT - File Upload API
// POST /api/uploads
// ============================================

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getUserFromRequest,
  unauthorizedResponse,
  successResponse,
  badRequestResponse,
} from '@/lib/auth';
import { getStorage } from '@/lib/storage';
import { validateFileMagicBytes } from '@/lib/file-validation';
import { audit } from '@/lib/audit';

// ---- Constants ----

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES = new Set([
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'image/tiff',
  // PDF
  'application/pdf',
  // Microsoft Office
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // OpenDocument
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.presentation',
  // Text / CSV
  'text/plain',
  'text/csv',
  // Archives
  'application/zip',
  'application/x-rar-compressed',
]);

// POST /api/uploads - Upload a file
export async function POST(request: NextRequest) {
  try {
    // ---- Auth ----
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    // ---- Parse multipart form data ----
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return badRequestResponse('Geçersiz form verisi. multipart/form-data bekleniyor.');
    }

    const fileEntry = formData.get('file');
    if (!fileEntry || !(fileEntry instanceof File)) {
      return badRequestResponse('Dosya alani ("file") zorunludur.');
    }

    const folder = (formData.get('folder') as string) || 'general';
    const entityType = (formData.get('entityType') as string) || null;
    const entityId = (formData.get('entityId') as string) || null;

    // ---- Validate file size ----
    if (fileEntry.size > MAX_FILE_SIZE) {
      return badRequestResponse(
        `Dosya boyutu cok buyuk. Maksimum ${MAX_FILE_SIZE / (1024 * 1024)} MB yuklenebilir.`
      );
    }

    if (fileEntry.size === 0) {
      return badRequestResponse('Bos dosya yuklenemez.');
    }

    // ---- Validate MIME type ----
    const mimeType = fileEntry.type || 'application/octet-stream';
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return badRequestResponse(
        `Desteklenmeyen dosya tipi: ${mimeType}. Izin verilen tipler: resimler, PDF, Office belgeleri, CSV.`
      );
    }

    // ---- Sanitize folder name ----
    const sanitizedFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);

    // ---- Read file buffer ----
    const arrayBuffer = await fileEntry.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ---- Magic bytes doğrulama (içerik gerçekten iddia edilen formatta mı?) ----
    const magicCheck = validateFileMagicBytes(buffer, mimeType);
    if (!magicCheck.valid) {
      return badRequestResponse(
        `Dosya icerigi guvenlik kontrolunden gecilemedi: ${magicCheck.reason}`
      );
    }

    // ---- Upload ----

    const storage = getStorage();
    const storagePath = await storage.upload(buffer, fileEntry.name, sanitizedFolder);

    // ---- Extract stored name from path ----
    const storedName = storagePath.split('/').pop() || fileEntry.name;

    // ---- Create DB record ----
    const record = await prisma.fileUpload.create({
      data: {
        originalName: fileEntry.name,
        storedName,
        mimeType,
        size: fileEntry.size,
        path: storagePath,
        entityType,
        entityId,
        userId: user.id,
      },
    });

    audit.upload(user.id, record.id, `${fileEntry.name} (${mimeType}, ${fileEntry.size} bytes)`);

    return successResponse(
      {
        ...record,
        url: storage.getUrl(storagePath),
      },
      'Dosya başarıyla yuklendi.'
    );
  } catch (error) {
    console.error('Error uploading file:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Dosya yuklenirken bir hata oluştu' } },
      { status: 500 }
    );
  }
}
