import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { successResponse } from '@/lib/auth';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  logger.warn('Admin restart requested', {
    module: 'admin',
    userId: user!.id,
    userName: user!.name,
  });

  // Graceful restart: send response first, then exit
  // PM2 or Docker restart policy will bring the process back
  setTimeout(() => {
    logger.info('Performing graceful shutdown for admin restart...', { module: 'admin' });
    process.exit(0);
  }, 1000);

  return successResponse({
    message: 'Yeniden baslatma talep edildi. Servis 1 saniye icinde kapanacak ve otomatik yeniden baslatilacak.',
    requestedBy: user!.name,
    timestamp: new Date().toISOString(),
  });
}
