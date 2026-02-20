import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getUserFromRequest,
  unauthorizedResponse,
  successResponse,
  badRequestResponse,
} from '@/lib/auth';

// GET /api/purchase-requests - List all purchase requests with items
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const requests = await prisma.purchaseRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return successResponse(requests);
  } catch (error) {
    console.error('Error fetching purchase requests:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}

// POST /api/purchase-requests - Create a new purchase request
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const body = await request.json();

    if (!body.baslik) {
      return badRequestResponse('Talep basligi (baslik) zorunludur');
    }

    const purchaseRequest = await prisma.purchaseRequest.create({
      data: {
        talepNo: body.talepNo,
        baslik: body.baslik,
        aciklama: body.aciklama,
        taleptEden: body.taleptEden ?? user.name,
        departman: body.departman,
        oncelik: body.oncelik ?? 'normal',
        durum: body.durum ?? 'beklemede',
        tapinanTutar: body.tapinanTutar ?? 0,
        requesterId: body.requesterId ?? user.id,
        approverId: body.approverId,
        onaylayanId: body.onaylayanId,
        onayTarihi: body.onayTarihi,
        redNedeni: body.redNedeni,
        ...(body.items && body.items.length > 0 && {
          items: {
            create: body.items.map((item: {
              malzemeAdi: string;
              miktar?: number;
              birim?: string;
              tapinanFiyat?: number;
              aciklama?: string;
            }) => ({
              malzemeAdi: item.malzemeAdi,
              miktar: item.miktar ?? 0,
              birim: item.birim,
              tapinanFiyat: item.tapinanFiyat ?? 0,
              aciklama: item.aciklama,
            })),
          },
        }),
      },
      include: {
        items: true,
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return successResponse(purchaseRequest, 'Satin alma talebi başarıyla oluşturuldu');
  } catch (error) {
    console.error('Error creating purchase request:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}
