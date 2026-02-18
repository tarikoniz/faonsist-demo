import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getUserFromRequest,
  unauthorizedResponse,
  successResponse,
  notFoundResponse,
} from '@/lib/auth';

// GET /api/suppliers/[id] - Get single supplier
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await params;

    const supplier = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      return notFoundResponse('Tedarikci bulunamadi');
    }

    return successResponse(supplier);
  } catch (error) {
    console.error('Error fetching supplier:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}

// PUT /api/suppliers/[id] - Update supplier
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.supplier.findUnique({ where: { id } });
    if (!existing) {
      return notFoundResponse('Tedarikci bulunamadi');
    }

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        firma: body.firma ?? existing.firma,
        yetkili: body.yetkili ?? existing.yetkili,
        telefon: body.telefon ?? existing.telefon,
        email: body.email ?? existing.email,
        adres: body.adres ?? existing.adres,
        vergiNo: body.vergiNo ?? existing.vergiNo,
        kategori: body.kategori ?? existing.kategori,
        altKategori: body.altKategori ?? existing.altKategori,
        puan: body.puan ?? existing.puan,
        notlar: body.notlar ?? existing.notlar,
        aktif: body.aktif ?? existing.aktif,
      },
    });

    return successResponse(supplier, 'Tedarikci basariyla guncellendi');
  } catch (error) {
    console.error('Error updating supplier:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}

// DELETE /api/suppliers/[id] - Delete supplier
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await params;

    const existing = await prisma.supplier.findUnique({ where: { id } });
    if (!existing) {
      return notFoundResponse('Tedarikci bulunamadi');
    }

    await prisma.supplier.delete({ where: { id } });

    return successResponse(null, 'Tedarikci basariyla silindi');
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}
