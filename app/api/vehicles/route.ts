import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getUserFromRequest,
  unauthorizedResponse,
  successResponse,
  badRequestResponse,
} from '@/lib/auth';

// GET /api/vehicles - List all vehicles with documents, maintenance, fuel
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const vehicles = await prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' },
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

    return successResponse(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}

// POST /api/vehicles - Create a new vehicle
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const body = await request.json();

    if (!body.plaka) {
      return badRequestResponse('Plaka zorunludur');
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        plaka: body.plaka,
        marka: body.marka,
        model: body.model,
        yil: body.yil,
        tur: body.tur,
        yakit: body.yakit,
        kmSayaci: body.kmSayaci ?? 0,
        durum: body.durum ?? 'aktif',
        sofor: body.sofor,
        departman: body.departman,
        sigortaBitis: body.sigortaBitis,
        muayeneBitis: body.muayeneBitis,
        kaskoVarMi: body.kaskoVarMi ?? false,
        kasko: body.kasko,
        notlar: body.notlar,
      },
    });

    return successResponse(vehicle, 'Arac başarıyla oluşturuldu');
  } catch (error) {
    console.error('Error creating vehicle:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}
