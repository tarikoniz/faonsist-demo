import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getUserFromRequest,
  unauthorizedResponse,
  successResponse,
  notFoundResponse,
} from '@/lib/auth';

// GET /api/sales/[id] - Get single sale
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await params;

    const sale = await prisma.sale.findUnique({
      where: { id },
    });

    if (!sale) {
      return notFoundResponse('Satis bulunamadi');
    }

    return successResponse(sale);
  } catch (error) {
    console.error('Error fetching sale:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}

// PUT /api/sales/[id] - Update sale
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.sale.findUnique({ where: { id } });
    if (!existing) {
      return notFoundResponse('Satis bulunamadi');
    }

    const sale = await prisma.sale.update({
      where: { id },
      data: {
        customer: body.customer ?? existing.customer,
        phone: body.phone ?? existing.phone,
        product: body.product ?? existing.product,
        price: body.price ?? existing.price,
        installments: body.installments ?? existing.installments,
        paid: body.paid ?? existing.paid,
        stage: body.stage ?? existing.stage,
        status: body.status ?? existing.status,
      },
    });

    return successResponse(sale, 'Satis basariyla guncellendi');
  } catch (error) {
    console.error('Error updating sale:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}

// DELETE /api/sales/[id] - Delete sale
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await params;

    const existing = await prisma.sale.findUnique({ where: { id } });
    if (!existing) {
      return notFoundResponse('Satis bulunamadi');
    }

    await prisma.sale.delete({ where: { id } });

    return successResponse(null, 'Satis basariyla silindi');
  } catch (error) {
    console.error('Error deleting sale:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: String(error) } },
      { status: 500 }
    );
  }
}
