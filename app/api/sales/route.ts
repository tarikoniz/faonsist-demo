import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getUserFromRequest,
  unauthorizedResponse,
  successResponse,
  badRequestResponse,
  errorResponse,
} from '@/lib/auth';
import { parsePagination, paginatedResponse, parseSearch } from '@/lib/pagination';
import { audit } from '@/lib/audit';

// GET /api/sales - List sales with pagination & search
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(request);
    const search = parseSearch(request);
    const stageFilter = searchParams.get('stage');
    const statusFilter = searchParams.get('status');

    const where: Record<string, unknown> = { deletedAt: null };
    if (search) {
      where.OR = [
        { customer: { contains: search, mode: 'insensitive' } },
        { product: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (stageFilter) where.stage = stageFilter;
    if (statusFilter) where.status = statusFilter;

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.offset,
        take: pagination.limit,
      }),
      prisma.sale.count({ where }),
    ]);

    return paginatedResponse(sales, total, pagination);
  } catch (error) {
    console.error('Error fetching sales:', error);
    return errorResponse('Satislar alinirken bir hata oluştu');
  }
}

// POST /api/sales - Create a new sale
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const body = await request.json();

    if (!body.customer) {
      return badRequestResponse('Musteri adi (customer) zorunludur');
    }

    const sale = await prisma.sale.create({
      data: {
        customer: body.customer,
        phone: body.phone,
        product: body.product,
        price: body.price ?? 0,
        installments: body.installments ?? 1,
        paid: body.paid ?? 0,
        stage: body.stage ?? 'lead',
        status: body.status ?? 'active',
      },
    });

    audit.create(user.id, 'sale', sale.id, `Satis oluşturuldu: ${sale.customer}`);
    return successResponse(sale, 'Satis başarıyla oluşturuldu');
  } catch (error) {
    console.error('Error creating sale:', error);
    return errorResponse('Satis oluşturulurken bir hata oluştu');
  }
}
