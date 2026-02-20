import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getUserFromRequest,
  unauthorizedResponse,
  successResponse,
  notFoundResponse,
} from '@/lib/auth';

// GET /api/tenders/[id] - Get single tender with items, bids, and requests
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await params;

    const tender = await prisma.tender.findUnique({
      where: { id },
      include: {
        items: true,
        bids: true,
        requests: true,
      },
    });

    if (!tender) {
      return notFoundResponse('Ihale bulunamadi');
    }

    return successResponse(tender);
  } catch (error) {
    console.error('Error fetching tender:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}

// PUT /api/tenders/[id] - Update tender
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.tender.findUnique({ where: { id } });
    if (!existing) {
      return notFoundResponse('Ihale bulunamadi');
    }

    const tender = await prisma.tender.update({
      where: { id },
      data: {
        baslik: body.baslik ?? existing.baslik,
        item: body.item ?? existing.item,
        tip: body.tip ?? existing.tip,
        amount: body.amount ?? existing.amount,
        toplamTutar: body.toplamTutar ?? existing.toplamTutar,
        supplier: body.supplier ?? existing.supplier,
        delivery: body.delivery ?? existing.delivery,
        rating: body.rating ?? existing.rating,
        status: body.status ?? existing.status,
        kazananTeklifId: body.kazananTeklifId ?? existing.kazananTeklifId,
        komisyonNotu: body.komisyonNotu ?? existing.komisyonNotu,
      },
      include: {
        items: true,
        bids: true,
        requests: true,
      },
    });

    return successResponse(tender, 'Ihale başarıyla güncellendi');
  } catch (error) {
    console.error('Error updating tender:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}

// DELETE /api/tenders/[id] - Delete tender
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await params;

    const existing = await prisma.tender.findUnique({ where: { id } });
    if (!existing) {
      return notFoundResponse('Ihale bulunamadi');
    }

    await prisma.tender.delete({ where: { id } });

    return successResponse(null, 'Ihale başarıyla silindi');
  } catch (error) {
    console.error('Error deleting tender:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}
