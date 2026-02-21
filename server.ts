// ============================================
// FaOnSisT - Custom Server (Next.js + Socket.IO)
// Enhanced: Request logging, error handling,
// graceful shutdown, health monitoring
// ============================================

import dotenv from 'dotenv';
dotenv.config({ override: true });
import { createServer } from 'http';
import { randomUUID } from 'crypto';
import next from 'next';
import { initializeSocket, getIO } from './lib/socket-server';
import { logger } from './lib/logger';
import { prisma } from './lib/prisma';
import { checkCriticalThresholds, onHealthCheckFailed, onHealthCheckPassed } from './lib/alert-service';
import { initLearningCache, pruneLearnedCache } from './lib/ai-learning';
import { validateEnv } from './lib/env';
import { checkDeadlines } from './lib/deadline-checker';

// Validate environment variables early
validateEnv();

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// ---- Global Error Handlers (before app.prepare) ----
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    module: 'process',
    stack: error.stack,
    message: error.message,
  });
  setTimeout(() => process.exit(1), 2000);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', {
    module: 'process',
    stack: reason instanceof Error ? reason.stack : String(reason),
    message: reason instanceof Error ? reason.message : String(reason),
  });
});

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    // Generate request ID
    const requestId = randomUUID().slice(0, 8);
    const startTime = Date.now();

    (req as any).requestId = requestId;
    res.setHeader('X-Request-Id', requestId);

    // Log after response finishes
    res.on('finish', () => {
      const duration = Date.now() - startTime;

      // Skip noisy paths
      if (req.url?.startsWith('/_next') || req.url?.startsWith('/favicon') || req.url?.includes('.')) return;
      // Skip socket.io polling
      if (req.url?.startsWith('/socket.io')) return;

      const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
      const userId = req.headers['x-user-id'] as string || undefined;

      logger[level](`${req.method} ${req.url} ${res.statusCode} ${duration}ms`, {
        module: 'http',
        requestId,
        method: req.method,
        path: req.url,
        status: res.statusCode,
        duration,
        userId,
      });
    });

    handle(req, res);
  });

  initializeSocket(httpServer);

  httpServer.listen(port, () => {
    logger.info(`FaOnSisT ready on http://${hostname}:${port}`, { module: 'server' });
    logger.info(`Socket.IO server attached`, { module: 'server' });
    logger.info(`Environment: ${dev ? 'development' : 'production'}`, { module: 'server' });

    // Preload AI learning cache (non-blocking)
    initLearningCache().catch(err => {
      logger.error('AI learning cache preload failed', { module: 'server', stack: String(err) });
    });
  });

  // ---- Deadline Checker (her gun 08:00 veya her 12 saatte bir) ----
  setInterval(async () => {
    try {
      await checkDeadlines();
    } catch (error) {
      logger.error('Deadline checker error', { module: 'server', stack: String(error) });
    }
  }, 12 * 60 * 60 * 1000); // 12 saat

  // Baslangicta da bir kez calistir (5 dakika sonra)
  setTimeout(() => {
    checkDeadlines().catch(err => {
      logger.error('Initial deadline check error', { module: 'server', stack: String(err) });
    });
  }, 5 * 60 * 1000);

  // ---- AI Learning Cache Pruning (every 6 hours) ----
  setInterval(async () => {
    try {
      await pruneLearnedCache();
    } catch (error) {
      logger.error('AI cache pruning error', { module: 'server', stack: String(error) });
    }
  }, 6 * 60 * 60 * 1000);

  // ---- Periyodik Bellek Yönetimi (her 2 dakikada bir) ----
  setInterval(() => {
    const mem = process.memoryUsage();
    const heapPct = Math.round((mem.heapUsed / mem.heapTotal) * 100);
    // GC zorla — --expose-gc flag gerekli (start command'de var)
    if (typeof (global as any).gc === 'function') {
      if (heapPct > 75) {
        (global as any).gc();
        const after = process.memoryUsage();
        const afterPct = Math.round((after.heapUsed / after.heapTotal) * 100);
        logger.info(`GC çalıştı: %${heapPct} → %${afterPct}`, { module: 'memory' });
      }
    }
  }, 2 * 60 * 1000);

  // ---- Graceful Shutdown ----
  async function gracefulShutdown(signal: string) {
    logger.info(`Received ${signal}. Starting graceful shutdown...`, { module: 'shutdown' });

    // 1. Stop accepting new connections
    httpServer.close(() => {
      logger.info('HTTP server closed', { module: 'shutdown' });
    });

    // 2. Close Socket.IO
    const ioInstance = getIO();
    if (ioInstance) {
      ioInstance.close(() => {
        logger.info('Socket.IO server closed', { module: 'shutdown' });
      });
    }

    // 3. Disconnect DB
    try {
      await prisma.$disconnect();
      logger.info('Database disconnected', { module: 'shutdown' });
    } catch (e) {
      logger.error('Error disconnecting database', { module: 'shutdown', stack: String(e) });
    }

    // 4. Force exit after timeout
    setTimeout(() => {
      logger.warn('Forced exit after shutdown timeout', { module: 'shutdown' });
      process.exit(1);
    }, 10000);

    process.exit(0);
  }

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // ---- Periodic Health Monitor (every 5 minutes) ----
  setInterval(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      onHealthCheckPassed();
    } catch (error) {
      await onHealthCheckFailed('Database connection failed: ' + String(error));
    }

    await checkCriticalThresholds();
  }, 5 * 60 * 1000);
});
