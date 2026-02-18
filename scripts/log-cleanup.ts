// ============================================
// FaOnSisT - Log Cleanup Script
// Run periodically to remove old log files
// Usage: npx tsx scripts/log-cleanup.ts
// ============================================

import fs from 'fs';
import path from 'path';

const LOG_DIR = process.env.LOG_FILE_PATH
  ? path.dirname(process.env.LOG_FILE_PATH)
  : path.join(process.cwd(), 'logs');

const MAX_AGE_DAYS = parseInt(process.env.LOG_RETENTION_DAYS || '30');

function cleanupOldLogs(): void {
  if (!fs.existsSync(LOG_DIR)) {
    console.log('Log directory does not exist:', LOG_DIR);
    return;
  }

  const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  const files = fs.readdirSync(LOG_DIR).filter(f => f.endsWith('.log'));
  let deleted = 0;

  for (const file of files) {
    const filePath = path.join(LOG_DIR, file);
    const stat = fs.statSync(filePath);
    if (stat.mtimeMs < cutoff) {
      fs.unlinkSync(filePath);
      console.log(`Deleted: ${file} (${Math.round(stat.size / 1024)}KB)`);
      deleted++;
    }
  }

  console.log(`\nCleanup complete: ${deleted} files deleted, ${files.length - deleted} files retained`);
  console.log(`Retention policy: ${MAX_AGE_DAYS} days`);
}

cleanupOldLogs();
