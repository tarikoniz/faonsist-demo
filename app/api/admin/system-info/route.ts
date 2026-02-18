import { NextRequest } from 'next/server';
import os from 'os';
import { requireAdmin } from '@/lib/admin-guard';
import { successResponse } from '@/lib/auth';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
  return (bytes / 1073741824).toFixed(2) + ' GB';
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();

  let diskInfo = null;
  try {
    const { execSync } = require('child_process');
    const df = execSync('df -h / | tail -1').toString().trim().split(/\s+/);
    diskInfo = { total: df[1], used: df[2], available: df[3], usePercent: df[4] };
  } catch { }

  return successResponse({
    platform: os.platform(),
    arch: os.arch(),
    hostname: os.hostname(),
    nodeVersion: process.version,
    cpu: {
      model: cpus[0]?.model?.trim(),
      cores: cpus.length,
      loadAvg: os.loadavg().map(l => l.toFixed(2)),
    },
    memory: {
      total: formatBytes(totalMem),
      free: formatBytes(freeMem),
      used: formatBytes(totalMem - freeMem),
      percentUsed: Math.round(((totalMem - freeMem) / totalMem) * 100),
    },
    disk: diskInfo,
    uptime: {
      system: Math.floor(os.uptime()),
      process: Math.floor(process.uptime()),
    },
    env: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT: process.env.PORT || '3000',
    },
  });
}
