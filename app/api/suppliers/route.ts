import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getUserFromRequest,
  unauthorizedResponse,
  successResponse,
  badRequestResponse,
} from '@/lib/auth';

// GET /api/suppliers - List all suppliers
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const suppliers = await prisma.supplier.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}

// POST /api/suppliers - Create a new supplier
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const body = await request.json();

    if (!body.firma) {
      return badRequestResponse('Firma adi (firma) zorunludur');
    }

    const supplier = await prisma.supplier.create({
      data: {
        firma: body.firma,
        yetkili: body.yetkili,
        telefon: body.telefon,
        email: body.email,
        adres: body.adres,
        vergiNo: body.vergiNo,
        kategori: body.kategori,
        altKategori: body.altKategori,
        puan: body.puan ?? 0,
        notlar: body.notlar,
        aktif: body.aktif ?? true,
      },
    });

    return successResponse(supplier, 'Tedarikci başarıyla oluşturuldu');
  } catch (error) {
    console.error('Error creating supplier:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}
