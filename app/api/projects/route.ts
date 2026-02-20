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

// GET /api/projects - List projects with pagination & search
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const include = searchParams.get('include');
    const pagination = parsePagination(request);
    const search = parseSearch(request);
    const durumFilter = searchParams.get('durum');

    // Filtre oluştur (soft delete — sadece silinmemişler)
    const where: Record<string, unknown> = { deletedAt: null };
    if (search) {
      where.OR = [
        { ad: { contains: search, mode: 'insensitive' } },
        { kod: { contains: search, mode: 'insensitive' } },
        { konum: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (durumFilter) {
      where.durum = durumFilter;
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.offset,
        take: pagination.limit,
        ...(include === 'all' && {
          include: {
            subcontractors: true,
            workItems: true,
            progressClaims: true,
            dailyLogs: true,
            greenBookEntries: true,
            contracts: true,
            materials: true,
            cashFlows: true,
            safetyRecords: true,
            qualityRecords: true,
            correspondence: true,
            scheduleItems: true,
            equipment: true,
            tasks: true,
            photos: true,
          },
        }),
      }),
      prisma.project.count({ where }),
    ]);

    return paginatedResponse(projects, total, pagination);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return errorResponse('Projeler alinirken bir hata oluştu');
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const body = await request.json();

    if (!body.ad) {
      return badRequestResponse('Proje adi (ad) zorunludur');
    }

    const project = await prisma.project.create({
      data: {
        ad: body.ad,
        kod: body.kod,
        konum: body.konum,
        basTarihi: body.basTarihi,
        bitTarihi: body.bitTarihi,
        butce: body.butce ?? 0,
        harcanan: body.harcanan ?? 0,
        durum: body.durum ?? 'devam',
        ilerleme: body.ilerleme ?? 0,
        isverenAdi: body.isverenAdi,
        isverenTel: body.isverenTel,
        isverenEposta: body.isverenEposta,
        mudurAdi: body.mudurAdi,
        mudurTel: body.mudurTel,
        aciklama: body.aciklama,
      },
    });

    audit.create(user.id, 'project', project.id, `Proje oluşturuldu: ${project.ad}`);
    return successResponse(project, 'Proje başarıyla oluşturuldu');
  } catch (error) {
    console.error('Error creating project:', error);
    return errorResponse('Proje oluşturulurken bir hata oluştu');
  }
}
