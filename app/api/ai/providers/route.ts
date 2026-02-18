// ============================================
// FaOnSisT - AI Providers API Endpoint
// GET /api/ai/providers — Aktif AI saglayicilarini listele
// ============================================

import { NextRequest } from 'next/server';
import { getUserFromRequest, unauthorizedResponse, successResponse } from '@/lib/auth';
import { getAllProviderStatuses, getDefaultProviderId } from '@/lib/ai/provider-registry';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const providers = getAllProviderStatuses();
    const defaultProvider = getDefaultProviderId();

    return successResponse({
      providers,
      defaultProvider,
    });
  } catch (error) {
    console.error('AI providers listesi hatasi:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Provider listesi alinamadi' } },
      { status: 500 }
    );
  }
}
