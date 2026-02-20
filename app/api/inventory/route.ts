import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getUserFromRequest,
  unauthorizedResponse,
  successResponse,
  badRequestResponse,
} from '@/lib/auth';

// GET /api/inventory - List inventory items (optional ?warehouseId= filter)
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get('warehouseId');

    const items = await prisma.inventoryItem.findMany({
      where: warehouseId ? { warehouseId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        warehouse: {
          select: {
            id: true,
            ad: true,
            konum: true,
          },
        },
      },
    });

    return successResponse(items);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}

// POST /api/inventory - Create a new inventory item
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const body = await request.json();

    if (!body.ad) {
      return badRequestResponse('Malzeme adi (ad) zorunludur');
    }

    if (!body.warehouseId) {
      return badRequestResponse('Depo ID (warehouseId) zorunludur');
    }

    const warehouse = await prisma.warehouse.findUnique({
      where: { id: body.warehouseId },
    });
    if (!warehouse) {
      return badRequestResponse('Geçersiz depo ID');
    }

    const item = await prisma.inventoryItem.create({
      data: {
        warehouseId: body.warehouseId,
        ad: body.ad,
        kod: body.kod,
        kategori: body.kategori,
        birim: body.birim,
        miktar: body.miktar ?? 0,
        minStok: body.minStok ?? 0,
        maxStok: body.maxStok,
        birimFiyat: body.birimFiyat ?? 0,
        konum: body.konum,
        barkod: body.barkod,
        durum: body.durum ?? 'aktif',
        sonSayimTarihi: body.sonSayimTarihi,
      },
      include: {
        warehouse: {
          select: {
            id: true,
            ad: true,
            konum: true,
          },
        },
      },
    });

    return successResponse(item, 'Envanter kalemi başarıyla oluşturuldu');
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}
