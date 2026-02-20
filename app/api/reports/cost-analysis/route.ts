// ============================================
// FaOnSisT - Cost Analysis Report API
// GET /api/reports/cost-analysis — Maliyet analizi
// ============================================

import { NextRequest } from 'next/server';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';
import { generateCostAnalysis } from '@/lib/report-generator';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const url = new URL(request.url);
    const format = (url.searchParams.get('format') || 'pdf') as 'pdf' | 'xlsx';

    const buffer = await generateCostAnalysis(format);

    const contentType = format === 'xlsx'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'application/pdf';
    const ext = format === 'xlsx' ? 'xlsx' : 'pdf';

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="maliyet-analizi.${ext}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Cost analysis hatasi:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Rapor oluşturulamadi' } },
      { status: 500 }
    );
  }
}
