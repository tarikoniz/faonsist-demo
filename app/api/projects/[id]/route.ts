import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getUserFromRequest,
  unauthorizedResponse,
  successResponse,
  notFoundResponse,
  errorResponse,
} from '@/lib/auth';
import { audit } from '@/lib/audit';

// GET /api/projects/[id] - Get single project with all sub-entities
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await params;

    const project = await prisma.project.findFirst({
      where: { id, deletedAt: null },
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
    });

    if (!project) {
      return notFoundResponse('Proje bulunamadi');
    }

    return successResponse(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return errorResponse('Proje getirilirken bir hata olustu');
  }
}

// PUT /api/projects/[id] - Update project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.project.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return notFoundResponse('Proje bulunamadi');
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ad: body.ad ?? existing.ad,
        kod: body.kod ?? existing.kod,
        konum: body.konum ?? existing.konum,
        basTarihi: body.basTarihi ?? existing.basTarihi,
        bitTarihi: body.bitTarihi ?? existing.bitTarihi,
        butce: body.butce ?? existing.butce,
        harcanan: body.harcanan ?? existing.harcanan,
        durum: body.durum ?? existing.durum,
        ilerleme: body.ilerleme ?? existing.ilerleme,
        isverenAdi: body.isverenAdi ?? existing.isverenAdi,
        isverenTel: body.isverenTel ?? existing.isverenTel,
        isverenEposta: body.isverenEposta ?? existing.isverenEposta,
        mudurAdi: body.mudurAdi ?? existing.mudurAdi,
        mudurTel: body.mudurTel ?? existing.mudurTel,
        aciklama: body.aciklama ?? existing.aciklama,
      },
    });

    audit.update(user.id, 'project', id, `Proje guncellendi: ${project.ad}`);
    return successResponse(project, 'Proje basariyla guncellendi');
  } catch (error) {
    console.error('Error updating project:', error);
    return errorResponse('Proje guncellenirken bir hata olustu');
  }
}

// DELETE /api/projects/[id] - Soft delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const { id } = await params;

    const existing = await prisma.project.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return notFoundResponse('Proje bulunamadi');
    }

    // Soft delete — kalıcı silme yerine deletedAt işaretle
    await prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    audit.delete(user.id, 'project', id, `Proje silindi: ${existing.ad}`);
    return successResponse(null, 'Proje basariyla silindi');
  } catch (error) {
    console.error('Error deleting project:', error);
    return errorResponse('Proje silinirken bir hata olustu');
  }
}
