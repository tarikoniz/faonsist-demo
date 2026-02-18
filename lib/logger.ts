// ============================================
// FaOnSisT - Structured JSON Logger
// Zero-dependency, non-blocking, daily rotation
// ============================================

import fs from 'fs';
import path from 'path';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  module?: string;
  requestId?: string;
  userId?: string;
  stack?: string;
  [key: string]: any;
}

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

const LOG_DIR = process.env.LOG_FILE_PATH
  ? path.dirname(process.env.LOG_FILE_PATH)
  : path.join(process.cwd(), 'logs');

// Ensure log directory exists
try {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
} catch {
  // Fallback: logs will only go to console
}

function getLogFileName(): string {
  const date = new Date().toISOString().split('T')[0];
  return path.join(LOG_DIR, `app-${date}.log`);
}

let currentDate = new Date().toISOString().split('T')[0];
let writeStream: fs.WriteStream | null = null;

function getWriteStream(): fs.WriteStream | null {
  try {
    const today = new Date().toISOString().split('T')[0];
    if (today !== currentDate || !writeStream) {
      if (writeStream) writeStream.end();
      currentDate = today;
      writeStream = fs.createWriteStream(getLogFileName(), { flags: 'a' });
      writeStream.on('error', () => {
        writeStream = null;
      });
    }
    return writeStream;
  } catch {
    return null;
  }
}

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] <= LEVEL_PRIORITY[currentLevel];
}

function log(level: LogLevel, message: string, meta?: Record<string, any>): void {
  if (!shouldLog(level)) return;

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };

  const line = JSON.stringify(entry) + '\n';

  // Non-blocking write to file
  const stream = getWriteStream();
  if (stream) {
    stream.write(line);
  }

  // Console output (Docker logs / PM2)
  if (level === 'error') {
    console.error(line.trimEnd());
  } else if (level === 'warn') {
    console.warn(line.trimEnd());
  } else if (process.env.NODE_ENV !== 'production' || level === 'info') {
    console.log(line.trimEnd());
  }
}

// Persist errors/warnings to DB asynchronously
async function persistToDb(level: LogLevel, message: string, meta?: Record<string, any>): Promise<void> {
  if (level !== 'error' && level !== 'warn') return;
  try {
    const { prisma } = await import('./prisma');
    await (prisma as any).systemLog.create({
      data: {
        level,
        message: message.slice(0, 1000),
        module: meta?.module || null,
        requestId: meta?.requestId || null,
        userId: meta?.userId || null,
        stack: meta?.stack || null,
        meta: meta ? JSON.stringify(meta).slice(0, 5000) : null,
      },
    });
  } catch {
    // Swallow DB errors to prevent cascading failures
  }
}

export const logger = {
  error(message: string, meta?: Record<string, any>): void {
    log('error', message, meta);
    persistToDb('error', message, meta);
  },
  warn(message: string, meta?: Record<string, any>): void {
    log('warn', message, meta);
    persistToDb('warn', message, meta);
  },
  info(message: string, meta?: Record<string, any>): void {
    log('info', message, meta);
  },
  debug(message: string, meta?: Record<string, any>): void {
    log('debug', message, meta);
  },
  child(defaults: Record<string, any>) {
    return {
      error: (msg: string, meta?: Record<string, any>) => logger.error(msg, { ...defaults, ...meta }),
      warn: (msg: string, meta?: Record<string, any>) => logger.warn(msg, { ...defaults, ...meta }),
      info: (msg: string, meta?: Record<string, any>) => logger.info(msg, { ...defaults, ...meta }),
      debug: (msg: string, meta?: Record<string, any>) => logger.debug(msg, { ...defaults, ...meta }),
    };
  },
};

export default logger;
