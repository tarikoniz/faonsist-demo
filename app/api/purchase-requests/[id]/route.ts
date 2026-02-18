import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getUserFromRequest,
  unauthorizedResponse,
  successResponse,
  notFoundResponse,
} from '@/lib/auth';

// GET /api/purchase-requests/[id] - Get single purchase request with items
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await params;

    const purchaseRequest = await prisma.purchaseRequest.findUnique({
      where: { id },
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

    if (!purchaseRequest) {
      return notFoundResponse('Satin alma talebi bulunamadi');
    }

    return successResponse(purchaseRequest);
  } catch (error) {
    console.error('Error fetching purchase request:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}

// PUT /api/purchase-requests/[id] - Update purchase request
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.purchaseRequest.findUnique({ where: { id } });
    if (!existing) {
      return notFoundResponse('Satin alma talebi bulunamadi');
    }

    const purchaseRequest = await prisma.purchaseRequest.update({
      where: { id },
      data: {
        talepNo: body.talepNo ?? existing.talepNo,
        baslik: body.baslik ?? existing.baslik,
        aciklama: body.aciklama ?? existing.aciklama,
        taleptEden: body.taleptEden ?? existing.taleptEden,
        departman: body.departman ?? existing.departman,
        oncelik: body.oncelik ?? existing.oncelik,
        durum: body.durum ?? existing.durum,
        tapinanTutar: body.tapinanTutar ?? existing.tapinanTutar,
        approverId: body.approverId ?? existing.approverId,
        onaylayanId: body.onaylayanId ?? existing.onaylayanId,
        onayTarihi: body.onayTarihi ?? existing.onayTarihi,
        redNedeni: body.redNedeni ?? existing.redNedeni,
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
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return successResponse(purchaseRequest, 'Satin alma talebi basariyla guncellendi');
  } catch (error) {
    console.error('Error updating purchase request:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}

// DELETE /api/purchase-requests/[id] - Delete purchase request
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await params;

    const existing = await prisma.purchaseRequest.findUnique({ where: { id } });
    if (!existing) {
      return notFoundResponse('Satin alma talebi bulunamadi');
    }

    await prisma.purchaseRequest.delete({ where: { id } });

    return successResponse(null, 'Satin alma talebi basariyla silindi');
  } catch (error) {
    console.error('Error deleting purchase request:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}
