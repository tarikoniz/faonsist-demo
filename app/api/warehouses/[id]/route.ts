import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getUserFromRequest,
  unauthorizedResponse,
  successResponse,
  notFoundResponse,
} from '@/lib/auth';

// GET /api/warehouses/[id] - Get single warehouse with items and movements
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await params;

    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
      include: {
        items: true,
        movements: {
          orderBy: { createdAt: 'desc' },
        },
        counts: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!warehouse) {
      return notFoundResponse('Depo bulunamadi');
    }

    return successResponse(warehouse);
  } catch (error) {
    console.error('Error fetching warehouse:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}

// PUT /api/warehouses/[id] - Update warehouse
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.warehouse.findUnique({ where: { id } });
    if (!existing) {
      return notFoundResponse('Depo bulunamadi');
    }

    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: {
        ad: body.ad ?? existing.ad,
        konum: body.konum ?? existing.konum,
        sorumlu: body.sorumlu ?? existing.sorumlu,
        telefon: body.telefon ?? existing.telefon,
        kapasite: body.kapasite ?? existing.kapasite,
        tip: body.tip ?? existing.tip,
        durum: body.durum ?? existing.durum,
        aciklama: body.aciklama ?? existing.aciklama,
      },
    });

    return successResponse(warehouse, 'Depo basariyla guncellendi');
  } catch (error) {
    console.error('Error updating warehouse:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}

// DELETE /api/warehouses/[id] - Delete warehouse
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await params;

    const existing = await prisma.warehouse.findUnique({ where: { id } });
    if (!existing) {
      return notFoundResponse('Depo bulunamadi');
    }

    await prisma.warehouse.delete({ where: { id } });

    return successResponse(null, 'Depo basariyla silindi');
  } catch (error) {
    console.error('Error deleting warehouse:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}
