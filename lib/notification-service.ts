// ============================================
// FaOnSisT - Notification Service
// DB + Email + Push + Socket.IO bildirim yonetimi
// ============================================

import { prisma } from './prisma';
import { logger } from './logger';

interface NotificationData {
  baslik: string;
  mesaj: string;
  tur?: string;       // bilgi, uyari, kritik, acil
  kategori?: string;
  link?: string;
  entityType?: string;
  entityId?: string;
}

// ---- Send Notification ----
export async function sendNotification(userId: string, data: NotificationData): Promise<void> {
  try {
    // 1. DB'ye kaydet
    await prisma.notification.create({
      data: {
        userId,
        baslik: data.baslik,
        mesaj: data.mesaj,
        tur: data.tur || 'bilgi',
        kategori: data.kategori,
        link: data.link,
        entityType: data.entityType,
        entityId: data.entityId,
      },
    });

    // 2. Socket.IO ile gercek zamanli bildir
    try {
      const { emitToUser } = await import('./socket-server');
      emitToUser(userId, 'notification:new', {
        baslik: data.baslik,
        mesaj: data.mesaj,
        tur: data.tur || 'bilgi',
        link: data.link,
      });
    } catch { /* Socket.IO mevcut degilse atla */ }

    // 3. Push notification gonder
    await sendPushNotification(userId, data).catch(() => { });

    // 4. Email bildirimi (kritik ve acil icin)
    if (data.tur === 'kritik' || data.tur === 'acil') {
      await sendEmailNotification(userId, data).catch(() => { });
    }

    logger.info('Bildirim gonderildi', {
      module: 'notification',
      userId,
      tur: data.tur,
      baslik: data.baslik,
    });
  } catch (error) {
    logger.error('Bildirim gonderilemedi', {
      module: 'notification',
      userId,
      error: String(error),
    });
  }
}

// ---- Bulk Notification ----
export async function sendBulkNotification(userIds: string[], data: NotificationData): Promise<void> {
  for (const userId of userIds) {
    sendNotification(userId, data).catch(() => { });
  }
}

// ---- Push Notification ----
async function sendPushNotification(userId: string, data: NotificationData): Promise<void> {
  try {
    const webpush = await import('web-push').catch(() => null);
    if (!webpush) return;

    const vapidPublic = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT;
    if (!vapidPublic || !vapidPrivate || !vapidSubject) return;

    webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    const payload = JSON.stringify({
      title: data.baslik,
      body: data.mesaj,
      icon: '/icons/icon-192.png',
      url: data.link || '/app',
      tag: data.kategori || 'faonsist',
    });

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload
        );
      } catch (err: unknown) {
        // Geçersiz subscription'i temizle
        if (err && typeof err === 'object' && 'statusCode' in err && (err as { statusCode: number }).statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => { });
        }
      }
    }
  } catch (error) {
    logger.error('Push notification hatasi', {
      module: 'notification',
      error: String(error),
    });
  }
}

// ---- Email Notification ----
async function sendEmailNotification(userId: string, data: NotificationData): Promise<void> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (!smtpHost || !smtpUser || !smtpPass) return;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });
    if (!user?.email) return;

    const nodemailer = await import('nodemailer').catch(() => null);
    if (!nodemailer) return;

    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const transporter = (nodemailer as any).createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    const { renderNotificationEmail } = await import('./notification-templates');

    await transporter.sendMail({
      from: `"FaOnSisT" <${process.env.EMAIL_FROM || smtpUser}>`,
      to: user.email,
      subject: `[FaOnSisT] ${data.baslik}`,
      html: renderNotificationEmail(data.baslik, data.mesaj, data.tur || 'bilgi', data.link),
    });

    logger.info('Email bildirimi gonderildi', {
      module: 'notification',
      to: user.email,
      baslik: data.baslik,
    });
  } catch (error) {
    logger.error('Email bildirimi gonderilemedi', {
      module: 'notification',
      error: String(error),
    });
  }
}
