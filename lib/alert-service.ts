// ============================================
// FaOnSisT - Alert Service
// Email + Webhook notifications for critical events
// ============================================

import { logger } from './logger';

// Health check failure counter
let healthFailCount = 0;
const HEALTH_FAIL_THRESHOLD = 3;

export async function onHealthCheckFailed(reason: string): Promise<void> {
  healthFailCount++;
  logger.error(`Health check failed (${healthFailCount}/${HEALTH_FAIL_THRESHOLD})`, {
    module: 'alert',
    reason,
  });

  if (healthFailCount >= HEALTH_FAIL_THRESHOLD) {
    await sendAlert(
      'KRITIK: FaOnSisT Saglik Kontrolu Basarisiz',
      `Saglik kontrolu art arda ${healthFailCount} kez basarisiz oldu.\nNeden: ${reason}\nZaman: ${new Date().toISOString()}`
    );
    healthFailCount = 0;
  }
}

export function onHealthCheckPassed(): void {
  if (healthFailCount > 0) {
    logger.info('Health check recovered', { module: 'alert', previousFailCount: healthFailCount });
  }
  healthFailCount = 0;
}

export async function sendAlert(subject: string, body: string): Promise<void> {
  const recipients = process.env.ALERT_EMAIL_RECIPIENTS;
  const webhookUrl = process.env.ALERT_WEBHOOK_URL;
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  // Send webhook if configured
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `[FaOnSisT] ${subject}\n${body}`,
          timestamp: new Date().toISOString(),
        }),
      });
      logger.info('Alert webhook sent', { module: 'alert', subject });
    } catch (error) {
      logger.error('Failed to send alert webhook', {
        module: 'alert',
        stack: error instanceof Error ? error.stack : String(error),
      });
    }
  }

  // Send email if SMTP configured
  if (smtpHost && smtpUser && smtpPass && recipients) {
    try {
      const nodemailer = await import('nodemailer').catch(() => null);
      if (nodemailer) {
        const smtpPort = parseInt(process.env.SMTP_PORT || '587');
        const transporter = (nodemailer as any).createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: { user: smtpUser, pass: smtpPass },
        });

        await transporter.sendMail({
          from: `"FaOnSisT Alert" <${process.env.EMAIL_FROM || smtpUser}>`,
          to: recipients,
          subject: `[FaOnSisT] ${subject}`,
          text: body,
        });

        logger.info('Alert email sent', { module: 'alert', subject, to: recipients });
      }
    } catch (error) {
      logger.error('Failed to send alert email', {
        module: 'alert',
        stack: error instanceof Error ? error.stack : String(error),
      });
    }
  }

  if (!webhookUrl && !(smtpHost && recipients)) {
    logger.warn('Alert triggered but no delivery method configured', {
      module: 'alert',
      subject,
    });
  }
}

export async function checkCriticalThresholds(): Promise<void> {
  try {
    const os = await import('os');

    // Memory check
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memPercent = Math.round(((totalMem - freeMem) / totalMem) * 100);
    if (memPercent > 90) {
      await sendAlert(
        'KRITIK: Bellek Kullanimi %' + memPercent,
        `Sistem bellegi %${memPercent} kullanildi.\nToplam: ${Math.round(totalMem / 1024 / 1024 / 1024)}GB\nBos: ${Math.round(freeMem / 1024 / 1024 / 1024)}GB`
      );
    }

    // Disk check (Linux/macOS)
    try {
      const { execSync } = await import('child_process');
      const df = execSync('df -h / | tail -1').toString().trim().split(/\s+/);
      const diskPercent = parseInt(df[4]);
      if (diskPercent > 90) {
        await sendAlert(
          'KRITIK: Disk Kullanimi %' + diskPercent,
          `Disk kullanimi %${diskPercent}.\nToplam: ${df[1]}, Kullanilan: ${df[2]}, Bos: ${df[3]}`
        );
      }
    } catch { /* disk check not available on all platforms */ }

    // Node.js heap check
    const heapUsed = process.memoryUsage().heapUsed;
    const heapTotal = process.memoryUsage().heapTotal;
    const heapPercent = Math.round((heapUsed / heapTotal) * 100);
    if (heapPercent > 95) {
      await sendAlert(
        'UYARI: Node.js Heap %' + heapPercent,
        `Node.js heap kullanimi %${heapPercent}.\nUsed: ${Math.round(heapUsed / 1024 / 1024)}MB\nTotal: ${Math.round(heapTotal / 1024 / 1024)}MB`
      );
    }
  } catch (error) {
    logger.error('Error checking critical thresholds', {
      module: 'alert',
      stack: error instanceof Error ? error.stack : String(error),
    });
  }
}
