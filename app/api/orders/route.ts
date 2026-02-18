import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getUserFromRequest,
  unauthorizedResponse,
  successResponse,
  badRequestResponse,
} from '@/lib/auth';

// GET /api/orders - List all orders with deliveries
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        deliveries: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return successResponse(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const body = await request.json();

    if (!body.tedarikci) {
      return badRequestResponse('Tedarikci adi (tedarikci) zorunludur');
    }

    const order = await prisma.order.create({
      data: {
        siparisNo: body.siparisNo,
        tedarikci: body.tedarikci,
        kalemler: body.kalemler,
        toplamTutar: body.toplamTutar ?? 0,
        durum: body.durum ?? 'olusturuldu',
        siparisTarihi: body.siparisTarihi,
        beklenenTarih: body.beklenenTarih,
        odemeDurumu: body.odemeDurumu ?? 'odenmedi',
        notlar: body.notlar,
        ihaleId: body.ihaleId,
      },
      include: {
        deliveries: true,
      },
    });

    return successResponse(order, 'Siparis basariyla olusturuldu');
  } catch (error) {
    console.error('Error creating order:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}
