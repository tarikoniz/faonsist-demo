// ============================================
// FaOnSisT - Audit Logging
// Tüm önemli işlemleri Activity tablosuna yazar
// ============================================

import { prisma } from './prisma';

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'password_reset'
  | 'upload'
  | 'download'
  | 'export'
  | 'import'
  | 'approve'
  | 'reject';

export type EntityType =
  | 'project'
  | 'tender'
  | 'sale'
  | 'channel'
  | 'message'
  | 'user'
  | 'file'
  | 'purchase_request'
  | 'order'
  | 'delivery'
  | 'supplier'
  | 'warehouse'
  | 'inventory'
  | 'vehicle'
  | 'meeting'
  | 'notification'
  | 'system';

interface AuditLogParams {
  userId?: string;
  action: AuditAction;
  entityType: EntityType;
  entityId?: string;
  detail?: string;
}

/**
 * Audit log kaydı oluşturur.
 * Non-blocking — hata olursa sessizce loglar.
 */
export function logAudit(params: AuditLogParams): void {
  const { userId, action, entityType, entityId, detail } = params;

  // Fire and forget — API response'unu yavaşlatmaz
  prisma.activity
    .create({
      data: {
        userId: userId || null,
        action: `${action}:${entityType}`,
        detail: detail || null,
        entityType,
        entityId: entityId || null,
      },
    })
    .catch(err => {
      console.error('[Audit] Log error:', err);
    });
}

/**
 * Kolay kullanım için helper fonksiyonlar
 */
export const audit = {
  create(userId: string, entityType: EntityType, entityId: string, detail?: string) {
    logAudit({ userId, action: 'create', entityType, entityId, detail });
  },

  update(userId: string, entityType: EntityType, entityId: string, detail?: string) {
    logAudit({ userId, action: 'update', entityType, entityId, detail });
  },

  delete(userId: string, entityType: EntityType, entityId: string, detail?: string) {
    logAudit({ userId, action: 'delete', entityType, entityId, detail });
  },

  login(userId: string, detail?: string) {
    logAudit({ userId, action: 'login', entityType: 'user', entityId: userId, detail });
  },

  passwordReset(userId: string) {
    logAudit({ userId, action: 'password_reset', entityType: 'user', entityId: userId });
  },

  upload(userId: string, fileId: string, detail?: string) {
    logAudit({ userId, action: 'upload', entityType: 'file', entityId: fileId, detail });
  },
};
