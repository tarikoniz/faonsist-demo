import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getUserFromRequest,
  unauthorizedResponse,
  successResponse,
  notFoundResponse,
} from '@/lib/auth';

// GET /api/orders/[id] - Get single order with deliveries
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        deliveries: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      return notFoundResponse('Siparis bulunamadi');
    }

    return successResponse(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}

// PUT /api/orders/[id] - Update order
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return notFoundResponse('Siparis bulunamadi');
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        siparisNo: body.siparisNo ?? existing.siparisNo,
        tedarikci: body.tedarikci ?? existing.tedarikci,
        kalemler: body.kalemler ?? existing.kalemler,
        toplamTutar: body.toplamTutar ?? existing.toplamTutar,
        durum: body.durum ?? existing.durum,
        siparisTarihi: body.siparisTarihi ?? existing.siparisTarihi,
        beklenenTarih: body.beklenenTarih ?? existing.beklenenTarih,
        odemeDurumu: body.odemeDurumu ?? existing.odemeDurumu,
        notlar: body.notlar ?? existing.notlar,
        ihaleId: body.ihaleId ?? existing.ihaleId,
      },
      include: {
        deliveries: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return successResponse(order, 'Siparis basariyla guncellendi');
  } catch (error) {
    console.error('Error updating order:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}

// DELETE /api/orders/[id] - Delete order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await params;

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return notFoundResponse('Siparis bulunamadi');
    }

    await prisma.order.delete({ where: { id } });

    return successResponse(null, 'Siparis basariyla silindi');
  } catch (error) {
    console.error('Error deleting order:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}
