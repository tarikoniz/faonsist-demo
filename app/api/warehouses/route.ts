import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getUserFromRequest,
  unauthorizedResponse,
  successResponse,
  badRequestResponse,
} from '@/lib/auth';

// GET /api/warehouses - List all warehouses
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const warehouses = await prisma.warehouse.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    return successResponse(warehouses);
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}

// POST /api/warehouses - Create a new warehouse
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const body = await request.json();

    if (!body.ad) {
      return badRequestResponse('Depo adi (ad) zorunludur');
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        ad: body.ad,
        konum: body.konum,
        sorumlu: body.sorumlu,
        telefon: body.telefon,
        kapasite: body.kapasite,
        tip: body.tip,
        durum: body.durum ?? 'aktif',
        aciklama: body.aciklama,
      },
    });

    return successResponse(warehouse, 'Depo başarıyla oluşturuldu');
  } catch (error) {
    console.error('Error creating warehouse:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}
