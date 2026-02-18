import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/auth';

// Import from socket-server for stats
let getIO: any, getOnlineUsers: any;
try {
  const socketModule = require('@/lib/socket-server');
  getIO = socketModule.getIO;
  getOnlineUsers = socketModule.getOnlineUsers;
} catch { }

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
  return (bytes / 1073741824).toFixed(2) + ' GB';
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (d > 0) parts.push(d + ' gun');
  if (h > 0) parts.push(h + ' saat');
  if (m > 0) parts.push(m + ' dk');
  return parts.join(' ') || '< 1 dk';
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const startTime = Date.now();

  let dbStatus: 'ok' | 'error' = 'error';
  let dbLatencyMs = 0;
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
    dbStatus = 'ok';
  } catch { }

  const memUsage = process.memoryUsage();

  let socketStatus = 'not_available';
  let connectedClients = 0;
  let onlineUserCount = 0;
  try {
    const io = getIO?.();
    socketStatus = io ? 'attached' : 'not_initialized';
    connectedClients = io?.engine?.clientsCount ?? 0;
    onlineUserCount = getOnlineUsers?.()?.length ?? 0;
  } catch { }

  const uptimeSeconds = process.uptime();

  return successResponse({
    status: dbStatus === 'ok' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checkedBy: user?.name,
    uptime: {
      seconds: Math.floor(uptimeSeconds),
      human: formatUptime(uptimeSeconds),
    },
    database: { status: dbStatus, latencyMs: dbLatencyMs },
    memory: {
      rss: formatBytes(memUsage.rss),
      heapUsed: formatBytes(memUsage.heapUsed),
      heapTotal: formatBytes(memUsage.heapTotal),
      external: formatBytes(memUsage.external),
      percentUsed: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
    },
    socketIO: { status: socketStatus, connectedClients, onlineUsers: onlineUserCount },
    node: { version: process.version, pid: process.pid },
    responseTimeMs: Date.now() - startTime,
  });
}
