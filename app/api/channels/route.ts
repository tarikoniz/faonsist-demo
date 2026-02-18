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

// GET /api/channels - List channels with pagination & search
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const pagination = parsePagination(request);
    const search = parseSearch(request);

    const where: Record<string, unknown> = { deletedAt: null };
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [channels, total] = await Promise.all([
      prisma.channel.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.offset,
        take: pagination.limit,
        include: {
          _count: {
            select: { members: true },
          },
        },
      }),
      prisma.channel.count({ where }),
    ]);

    return paginatedResponse(channels, total, pagination);
  } catch (error) {
    console.error('Error fetching channels:', error);
    return errorResponse('Kanallar alinirken bir hata olustu');
  }
}

// POST /api/channels - Create a new channel
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const body = await request.json();

    if (!body.name) {
      return badRequestResponse('Kanal adi (name) zorunludur');
    }

    const channel = await prisma.channel.create({
      data: {
        name: body.name,
        type: body.type ?? 'channel',
        legacyId: body.legacyId,
        members: {
          create: {
            userId: user.id,
            role: 'admin',
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: { members: true },
        },
      },
    });

    return successResponse(channel, 'Kanal basariyla olusturuldu');
  } catch (error) {
    console.error('Error creating channel:', error);
    return errorResponse('Kanal olusturulurken bir hata olustu');
  }
}
