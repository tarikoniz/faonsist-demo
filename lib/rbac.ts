// ============================================
// RBAC - Role-Based Access Control
// Permission System
// ============================================

import { Role } from '@/types';

export type Module = 'messages' | 'erp' | 'crm' | 'stock' | 'settings';
export type Action = 'create' | 'read' | 'update' | 'delete' | 'approve' | 'export' | 'manage';

export interface Permission {
  module: Module;
  action: Action;
  resource?: string;
}

// Permission definitions per role
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  [Role.ADMIN]: ['*'], // Full access to everything

  [Role.MANAGER]: [
    'messages:*',
    'erp:*',
    'crm:*',
    'stock:*',
    'settings:read',
  ],

  [Role.PROJECT_MANAGER]: [
    'messages:*',
    'erp:*',
    'erp:approve',
    'crm:read',
    'stock:read',
  ],

  [Role.SALES_MANAGER]: [
    'messages:*',
    'crm:*',
    'crm:approve',
    'erp:read',
    'stock:read',
  ],

  [Role.ACCOUNTANT]: [
    'messages:read',
    'erp:read',
    'erp:update',
    'crm:read',
    'stock:read',
  ],

  [Role.WAREHOUSE_MANAGER]: [
    'messages:*',
    'stock:*',
    'stock:approve',
    'erp:read',
  ],

  [Role.EMPLOYEE]: [
    'messages:read',
    'messages:create',
    'erp:read',
    'crm:read',
    'stock:read',
  ],

  [Role.VIEWER]: [
    'messages:read',
    'erp:read',
    'crm:read',
    'stock:read',
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(
  userRole: Role,
  module: Module,
  action: Action,
  resource?: string
): boolean {
  const permissions = ROLE_PERMISSIONS[userRole];

  // Check for wildcard permission (admin)
  if (permissions.includes('*')) {
    return true;
  }

  // Check for module wildcard
  if (permissions.includes(`${module}:*`)) {
    return true;
  }

  // Check for specific permission
  const permissionString = resource
    ? `${module}:${action}:${resource}`
    : `${module}:${action}`;

  if (permissions.includes(permissionString)) {
    return true;
  }

  // Check without resource
  if (permissions.includes(`${module}:${action}`)) {
    return true;
  }

  return false;
}

/**
 * Check if user can access a module
 */
export function canAccessModule(userRole: Role, module: Module): boolean {
  return hasPermission(userRole, module, 'read');
}

/**
 * Check if user can create in a module
 */
export function canCreate(userRole: Role, module: Module): boolean {
  return hasPermission(userRole, module, 'create');
}

/**
 * Check if user can update in a module
 */
export function canUpdate(userRole: Role, module: Module, resource?: string): boolean {
  return hasPermission(userRole, module, 'update', resource);
}

/**
 * Check if user can delete in a module
 */
export function canDelete(userRole: Role, module: Module, resource?: string): boolean {
  return hasPermission(userRole, module, 'delete', resource);
}

/**
 * Check if user can approve in a module
 */
export function canApprove(userRole: Role, module: Module): boolean {
  return hasPermission(userRole, module, 'approve');
}

/**
 * Check if user can export data from a module
 */
export function canExport(userRole: Role, module: Module): boolean {
  return hasPermission(userRole, module, 'export');
}

/**
 * Check if user can manage settings for a module
 */
export function canManage(userRole: Role, module: Module): boolean {
  return hasPermission(userRole, module, 'manage');
}

/**
 * Get all accessible modules for a role
 */
export function getAccessibleModules(userRole: Role): Module[] {
  const modules: Module[] = ['messages', 'erp', 'crm', 'stock', 'settings'];
  return modules.filter((module) => canAccessModule(userRole, module));
}

/**
 * Check if user is admin or manager
 */
export function isAdminOrManager(userRole: Role): boolean {
  return userRole === Role.ADMIN || userRole === Role.MANAGER;
}

/**
 * Check if user is admin
 */
export function isAdmin(userRole: Role): boolean {
  return userRole === Role.ADMIN;
}

/**
 * Get permission level for display
 */
export function getPermissionLevel(userRole: Role, module: Module): 'full' | 'write' | 'read' | 'none' {
  if (hasPermission(userRole, module, 'manage') || ROLE_PERMISSIONS[userRole].includes('*')) {
    return 'full';
  }
  if (hasPermission(userRole, module, 'create') && hasPermission(userRole, module, 'update')) {
    return 'write';
  }
  if (hasPermission(userRole, module, 'read')) {
    return 'read';
  }
  return 'none';
}

/**
 * Filter items based on user permissions
 * Useful for filtering menu items, routes, etc.
 */
export function filterByPermission<T extends { requiredRole?: Role; requiredModule?: Module }>(
  items: T[],
  userRole: Role
): T[] {
  return items.filter((item) => {
    if (item.requiredRole && userRole !== item.requiredRole && !isAdminOrManager(userRole)) {
      return false;
    }
    if (item.requiredModule && !canAccessModule(userRole, item.requiredModule)) {
      return false;
    }
    return true;
  });
}
