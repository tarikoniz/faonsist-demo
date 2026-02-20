import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getUserFromRequest,
  unauthorizedResponse,
  successResponse,
  notFoundResponse,
} from '@/lib/auth';

// GET /api/vehicles/[id] - Get single vehicle with documents, maintenance, fuel
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        documents: true,
        maintenance: {
          orderBy: { createdAt: 'desc' },
        },
        fuel: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!vehicle) {
      return notFoundResponse('Arac bulunamadi');
    }

    return successResponse(vehicle);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}

// PUT /api/vehicles/[id] - Update vehicle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.vehicle.findUnique({ where: { id } });
    if (!existing) {
      return notFoundResponse('Arac bulunamadi');
    }

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        plaka: body.plaka ?? existing.plaka,
        marka: body.marka ?? existing.marka,
        model: body.model ?? existing.model,
        yil: body.yil ?? existing.yil,
        tur: body.tur ?? existing.tur,
        yakit: body.yakit ?? existing.yakit,
        kmSayaci: body.kmSayaci ?? existing.kmSayaci,
        durum: body.durum ?? existing.durum,
        sofor: body.sofor ?? existing.sofor,
        departman: body.departman ?? existing.departman,
        sigortaBitis: body.sigortaBitis ?? existing.sigortaBitis,
        muayeneBitis: body.muayeneBitis ?? existing.muayeneBitis,
        kaskoVarMi: body.kaskoVarMi ?? existing.kaskoVarMi,
        kasko: body.kasko ?? existing.kasko,
        notlar: body.notlar ?? existing.notlar,
      },
      include: {
        documents: true,
        maintenance: {
          orderBy: { createdAt: 'desc' },
        },
        fuel: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return successResponse(vehicle, 'Arac başarıyla güncellendi');
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}

// DELETE /api/vehicles/[id] - Delete vehicle
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await params;

    const existing = await prisma.vehicle.findUnique({ where: { id } });
    if (!existing) {
      return notFoundResponse('Arac bulunamadi');
    }

    await prisma.vehicle.delete({ where: { id } });

    return successResponse(null, 'Arac başarıyla silindi');
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}
