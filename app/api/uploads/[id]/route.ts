// ============================================
// FaOnSisT - File Upload Detail API
// GET  /api/uploads/:id - Serve/stream the file
// DELETE /api/uploads/:id - Delete file from disk + DB
// ============================================

import { NextRequest } from 'next/server';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';
import {
  getUserFromRequest,
  unauthorizedResponse,
  notFoundResponse,
  successResponse,
} from '@/lib/auth';
import { getStorage } from '@/lib/storage';

// ---- Resolve storage path to absolute filesystem path ----

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

function resolveAbsolutePath(storagePath: string): string {
  // storagePath looks like "/uploads/folder/file.ext"
  const relative = storagePath.replace(/^\/uploads\//, '');
  return path.join(UPLOAD_DIR, relative);
}

// GET /api/uploads/:id - Serve/stream the file
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await params;

    // Look up the file record
    const fileRecord = await prisma.fileUpload.findUnique({
      where: { id },
    });

    if (!fileRecord) {
      return notFoundResponse('Dosya bulunamadi.');
    }

    // Resolve the file on disk
    const absolutePath = resolveAbsolutePath(fileRecord.path);

    if (!existsSync(absolutePath)) {
      return notFoundResponse('Dosya diskte bulunamadi.');
    }

    // Read the file
    const fileBuffer = await readFile(absolutePath);

    // Determine content type
    const contentType = fileRecord.mimeType || 'application/octet-stream';

    // Determine if the file should be displayed inline or downloaded
    const isInline = contentType.startsWith('image/') || contentType === 'application/pdf';
    const disposition = isInline
      ? `inline; filename="${encodeURIComponent(fileRecord.originalName)}"`
      : `attachment; filename="${encodeURIComponent(fileRecord.originalName)}"`;

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': disposition,
        'Content-Length': String(fileBuffer.length),
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}

// DELETE /api/uploads/:id - Delete file from disk and DB
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await params;

    // Look up the file record
    const fileRecord = await prisma.fileUpload.findUnique({
      where: { id },
    });

    if (!fileRecord) {
      return notFoundResponse('Dosya bulunamadi.');
    }

    // Delete from storage
    try {
      const storage = getStorage();
      await storage.delete(fileRecord.path);
    } catch (storageError) {
      // Log but don't fail - the file may already be gone from disk
      console.warn('Storage delete warning (file may already be removed):', storageError);
    }

    // Delete from database
    await prisma.fileUpload.delete({
      where: { id },
    });

    return successResponse({ id }, 'Dosya basariyla silindi.');
  } catch (error) {
    console.error('Error deleting file:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}
