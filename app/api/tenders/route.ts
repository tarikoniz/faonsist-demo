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

// GET /api/tenders - List tenders with pagination & search
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(request);
    const search = parseSearch(request);
    const statusFilter = searchParams.get('status');

    const where: Record<string, unknown> = { deletedAt: null };
    if (search) {
      where.OR = [
        { baslik: { contains: search, mode: 'insensitive' } },
        { item: { contains: search, mode: 'insensitive' } },
        { supplier: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (statusFilter) {
      where.status = statusFilter;
    }

    const [tenders, total] = await Promise.all([
      prisma.tender.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.offset,
        take: pagination.limit,
        include: {
          items: true,
          bids: true,
        },
      }),
      prisma.tender.count({ where }),
    ]);

    return paginatedResponse(tenders, total, pagination);
  } catch (error) {
    console.error('Error fetching tenders:', error);
    return errorResponse('Ihaleler alinirken bir hata olustu');
  }
}

// POST /api/tenders - Create a new tender
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const body = await request.json();

    if (!body.baslik && !body.item) {
      return badRequestResponse('Ihale basligi veya kalemi zorunludur');
    }

    const tender = await prisma.tender.create({
      data: {
        baslik: body.baslik,
        item: body.item,
        tip: body.tip ?? 'acik',
        amount: body.amount ?? 0,
        toplamTutar: body.toplamTutar ?? 0,
        supplier: body.supplier,
        delivery: body.delivery ?? 0,
        rating: body.rating ?? 0,
        status: body.status ?? 'pending',
        kazananTeklifId: body.kazananTeklifId,
        komisyonNotu: body.komisyonNotu,
      },
      include: {
        items: true,
        bids: true,
      },
    });

    audit.create(user.id, 'tender', tender.id, `Ihale olusturuldu: ${tender.baslik || tender.item}`);
    return successResponse(tender, 'Ihale basariyla olusturuldu');
  } catch (error) {
    console.error('Error creating tender:', error);
    return errorResponse('Ihale olusturulurken bir hata olustu');
  }
}
