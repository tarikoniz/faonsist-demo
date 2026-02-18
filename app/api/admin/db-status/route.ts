import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { prisma, pool } from '@/lib/prisma';
import { successResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  try {
    const [
      userCount, projectCount, tenderCount, saleCount,
      orderCount, warehouseCount, inventoryCount, vehicleCount,
      channelCount, messageCount, activityCount, logCount, aiCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.tender.count(),
      prisma.sale.count(),
      prisma.order.count(),
      prisma.warehouse.count(),
      prisma.inventoryItem.count(),
      prisma.vehicle.count(),
      prisma.channel.count(),
      prisma.message.count(),
      prisma.activity.count(),
      prisma.systemLog.count(),
      prisma.aiInteraction.count(),
    ]);

    let lastMigration = null;
    try {
      const migrations: any[] = await prisma.$queryRaw`
        SELECT migration_name, finished_at
        FROM _prisma_migrations
        ORDER BY finished_at DESC LIMIT 1
      `;
      lastMigration = migrations[0] ?? null;
    } catch { }

    const poolStats = {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount,
    };

    const dbUrl = process.env.DATABASE_URL?.replace(/:[^@]+@/, ':***@') || 'not set';

    return successResponse({
      tableCounts: {
        users: userCount, projects: projectCount, tenders: tenderCount,
        sales: saleCount, orders: orderCount, warehouses: warehouseCount,
        inventoryItems: inventoryCount, vehicles: vehicleCount,
        channels: channelCount, messages: messageCount,
        activities: activityCount, systemLogs: logCount, aiInteractions: aiCount,
      },
      connectionPool: poolStats,
      lastMigration,
      databaseUrl: dbUrl,
    });
  } catch (err) {
    return Response.json(
      { success: false, error: { code: 'DB_ERROR', message: String(err) } },
      { status: 500 }
    );
  }
}
