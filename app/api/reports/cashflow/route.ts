// ============================================
// FaOnSisT - Cash Flow Report API
// GET /api/reports/cashflow — Nakit akisi raporu
// ============================================

import { NextRequest } from 'next/server';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';
import { generateCashFlowReport } from '@/lib/report-generator';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const url = new URL(request.url);
    const projectId = url.searchParams.get('projectId') || undefined;
    const format = (url.searchParams.get('format') || 'pdf') as 'pdf' | 'xlsx';

    const buffer = await generateCashFlowReport(projectId, format);

    const contentType = format === 'xlsx'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'application/pdf';
    const ext = format === 'xlsx' ? 'xlsx' : 'pdf';

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="nakit-akisi.${ext}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Cashflow report hatasi:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Rapor oluşturulamadi' } },
      { status: 500 }
    );
  }
}
