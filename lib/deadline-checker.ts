// ============================================
// FaOnSisT - Deadline Checker
// Zamanlanmis gorev/belge/sozlesme taramasi
// ============================================

import { prisma } from './prisma';
import { logger } from './logger';
import { sendNotification } from './notification-service';

export async function checkDeadlines(): Promise<void> {
  logger.info('Deadline taramasi basliyor...', { module: 'deadline' });

  try {
    await checkTaskDeadlines();
    await checkVehicleDocuments();
    await checkContractDeadlines();
    logger.info('Deadline taramasi tamamlandi', { module: 'deadline' });
  } catch (error) {
    logger.error('Deadline taramasi hatasi', {
      module: 'deadline',
      error: String(error),
    });
  }
}

// Gorev son tarihleri (1 gun, 3 gun, 7 gun)
async function checkTaskDeadlines(): Promise<void> {
  const now = new Date();
  const oneDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  // sonTarih is String? — compare with ISO strings
  const nowISO = now.toISOString();
  const oneDayISO = oneDay.toISOString();
  const threeDaysISO = threeDays.toISOString();

  // 1 gun icinde biten gorevler
  const urgentTasks = await prisma.projectTask.findMany({
    where: {
      sonTarih: { gte: nowISO, lte: oneDayISO },
      durum: { not: 'tamamlandi' },
    },
    include: { project: { select: { ad: true } } },
  });

  for (const task of urgentTasks) {
    if (task.atananKisi) {
      // atananKisi bir kullanici adi, kullanici ID'sini bulmamiz lazim
      const users = await prisma.user.findMany({
        where: { name: { contains: task.atananKisi } },
        select: { id: true },
      });
      for (const u of users) {
        await sendNotification(u.id, {
          baslik: 'Gorev Yarin Bitiyor!',
          mesaj: `"${task.baslik}" gorevi yarin son tarihini asiyor. Proje: ${task.project?.ad || ''}`,
          tur: 'acil',
          kategori: 'gorev',
          entityType: 'task',
          entityId: task.id,
        });
      }
    }
  }

  // 3 gun icinde biten gorevler
  const soonTasks = await prisma.projectTask.findMany({
    where: {
      sonTarih: { gt: oneDayISO, lte: threeDaysISO },
      durum: { not: 'tamamlandi' },
    },
    include: { project: { select: { ad: true } } },
  });

  for (const task of soonTasks) {
    if (task.atananKisi) {
      const users = await prisma.user.findMany({
        where: { name: { contains: task.atananKisi } },
        select: { id: true },
      });
      for (const u of users) {
        await sendNotification(u.id, {
          baslik: 'Gorev 3 Gun Icinde Bitiyor',
          mesaj: `"${task.baslik}" gorevinin son tarihi yaklasıyor. Proje: ${task.project?.ad || ''}`,
          tur: 'uyari',
          kategori: 'gorev',
          entityType: 'task',
          entityId: task.id,
        });
      }
    }
  }

  logger.info(`Deadline: ${urgentTasks.length} acil, ${soonTasks.length} yaklasan gorev bildirildi`, { module: 'deadline' });
}

// Arac belgesi bitis tarihleri
async function checkVehicleDocuments(): Promise<void> {
  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // bitTarihi is String? — compare with ISO strings
  const nowISO = now.toISOString();
  const thirtyDaysISO = thirtyDays.toISOString();

  const expiringDocs = await prisma.vehicleDocument.findMany({
    where: {
      bitTarihi: { gte: nowISO, lte: thirtyDaysISO },
    },
    include: {
      vehicle: { select: { plaka: true } },
    },
  });

  if (expiringDocs.length > 0) {
    // Admin ve warehouse_manager'lara bildir
    const admins = await prisma.user.findMany({
      where: { role: { in: ['admin', 'warehouse_manager'] }, active: true },
      select: { id: true },
    });

    for (const doc of expiringDocs) {
      // bitTarihi is String? — parse to get daysLeft
      const bitDate = doc.bitTarihi ? new Date(doc.bitTarihi).getTime() : now.getTime();
      const daysLeft = Math.ceil((bitDate - now.getTime()) / (24 * 60 * 60 * 1000));
      for (const admin of admins) {
        await sendNotification(admin.id, {
          baslik: `Arac Belgesi Sona Eriyor (${daysLeft} gun)`,
          mesaj: `${doc.vehicle?.plaka || ''} - ${doc.tur || 'Belge'} belgesi ${daysLeft} gun icinde sona erecek.`,
          tur: daysLeft <= 7 ? 'kritik' : 'uyari',
          kategori: 'arac',
          entityType: 'vehicle',
          entityId: doc.vehicleId,
        });
      }
    }
  }

  logger.info(`Deadline: ${expiringDocs.length} suresi dolan arac belgesi`, { module: 'deadline' });
}

// Sozlesme bitis tarihleri
async function checkContractDeadlines(): Promise<void> {
  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // bitTarihi is String? — compare with ISO strings (not bitisTarihi)
  const nowISO = now.toISOString();
  const thirtyDaysISO = thirtyDays.toISOString();

  const expiringContracts = await prisma.contract.findMany({
    where: {
      bitTarihi: { gte: nowISO, lte: thirtyDaysISO },
    },
    include: {
      project: { select: { ad: true } },
    },
  });

  if (expiringContracts.length > 0) {
    const managers = await prisma.user.findMany({
      where: { role: { in: ['admin', 'manager', 'project_manager'] }, active: true },
      select: { id: true },
    });

    for (const contract of expiringContracts) {
      // bitTarihi is String? — parse to get daysLeft
      const bitDate = contract.bitTarihi ? new Date(contract.bitTarihi).getTime() : now.getTime();
      const daysLeft = Math.ceil((bitDate - now.getTime()) / (24 * 60 * 60 * 1000));
      for (const mgr of managers) {
        await sendNotification(mgr.id, {
          baslik: `Sozlesme Sona Eriyor (${daysLeft} gun)`,
          mesaj: `"${contract.baslik || ''}" sozlesmesi ${daysLeft} gun icinde sona erecek. Proje: ${contract.project?.ad || ''}`,
          tur: daysLeft <= 7 ? 'kritik' : 'uyari',
          kategori: 'sozlesme',
          entityType: 'contract',
          entityId: contract.id,
        });
      }
    }
  }

  logger.info(`Deadline: ${expiringContracts.length} suresi dolan sozlesme`, { module: 'deadline' });
}
