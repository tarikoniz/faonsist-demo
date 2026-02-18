// ============================================
// FaOnSisT - Pagination Helper
// Tüm list endpointleri için standart pagination
// ============================================

import { NextRequest } from 'next/server';

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

/**
 * URL query parametrelerinden pagination bilgisi çıkarır
 * Desteklenen parametreler: page, limit (veya per_page)
 */
export function parsePagination(request: NextRequest): PaginationParams {
  const { searchParams } = new URL(request.url);

  let page = parseInt(searchParams.get('page') || '1', 10);
  let limit = parseInt(searchParams.get('limit') || searchParams.get('per_page') || String(DEFAULT_LIMIT), 10);

  // Geçersiz değerleri düzelt
  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Pagination bilgisiyle birlikte standart response döndürür
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams,
  message?: string
) {
  const totalPages = Math.ceil(total / params.limit);

  return Response.json({
    success: true,
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages,
      hasNext: params.page < totalPages,
      hasPrev: params.page > 1,
    },
    ...(message && { message }),
  });
}

/**
 * Arama/filtreleme parametrelerini çıkarır
 */
export function parseSearch(request: NextRequest): string | null {
  const { searchParams } = new URL(request.url);
  return searchParams.get('search') || searchParams.get('q') || null;
}

/**
 * Sıralama parametrelerini çıkarır
 */
export function parseSort(request: NextRequest, allowedFields: string[]): { field: string; order: 'asc' | 'desc' } {
  const { searchParams } = new URL(request.url);
  const sortBy = searchParams.get('sortBy') || searchParams.get('sort') || 'createdAt';
  const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';

  // Sadece izin verilen alanlar
  const field = allowedFields.includes(sortBy) ? sortBy : 'createdAt';

  return { field, order };
}
