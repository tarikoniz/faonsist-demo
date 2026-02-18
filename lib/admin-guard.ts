// ============================================
// FaOnSisT - Admin Guard Helper
// Reusable admin authentication + authorization
// ============================================

import { NextRequest } from 'next/server';
import { getUserFromRequest, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { isAdmin } from '@/lib/rbac';
import { Role } from '@/types';

export async function requireAdmin(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return { user: null, error: unauthorizedResponse() };
  }
  if (!isAdmin(user.role as Role)) {
    return { user: null, error: forbiddenResponse('Bu islem icin admin yetkisi gerekli') };
  }
  return { user, error: null };
}
