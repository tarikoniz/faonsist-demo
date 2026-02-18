import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/prisma';
import { successResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const level = searchParams.get('level');
  const module = searchParams.get('module');
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);
  const offset = parseInt(searchParams.get('offset') || '0');

  const where: any = {};
  if (level) where.level = level;
  if (module) where.module = module;

  try {
    const [logs, total] = await Promise.all([
      prisma.systemLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.systemLog.count({ where }),
    ]);

    return successResponse({ logs, total, limit, offset });
  } catch (err) {
    return Response.json(
      { success: false, error: { code: 'DB_ERROR', message: String(err) } },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/logs - Clear old logs
export async function DELETE(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const daysOld = parseInt(searchParams.get('daysOld') || '30');
  const cutoff = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

  try {
    const result = await prisma.systemLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });

    return successResponse({
      deleted: result.count,
      cutoffDate: cutoff.toISOString(),
    });
  } catch (err) {
    return Response.json(
      { success: false, error: { code: 'DB_ERROR', message: String(err) } },
      { status: 500 }
    );
  }
}
