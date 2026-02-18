// ============================================
// GLOBAL / SHARED TYPES
// ============================================

// User & Authentication
export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: Role;
    department?: string;
    phone?: string;
    status: UserStatus;
    lastSeenAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export enum Role {
    ADMIN = 'admin',
    MANAGER = 'manager',
    PROJECT_MANAGER = 'project_manager',
    SALES_MANAGER = 'sales_manager',
    ACCOUNTANT = 'accountant',
    WAREHOUSE_MANAGER = 'warehouse_manager',
    EMPLOYEE = 'employee',
    VIEWER = 'viewer',
}

export enum UserStatus {
    ONLINE = 'online',
    AWAY = 'away',
    BUSY = 'busy',
    OFFLINE = 'offline',
}

// Contact Information
export interface ContactInfo {
    email?: string;
    phone?: string;
    mobile?: string;
    fax?: string;
    website?: string;
    address?: string;
}

// Attachment
export interface Attachment {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    mimeType?: string;
    uploadedBy: string;
    uploadedAt: Date;
}

// Note
export interface Note {
    id: string;
    content: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

// Pagination
export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface PaginationParams {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// API Response
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: ApiError;
    message?: string;
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, string[]>;
}

// Audit Trail
export interface AuditLog {
    id: string;
    action: AuditAction;
    entityType: string;
    entityId: string;
    userId: string;
    userName: string;
    changes?: Record<string, { old: any; new: any }>;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}

export enum AuditAction {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    VIEW = 'view',
    LOGIN = 'login',
    LOGOUT = 'logout',
    EXPORT = 'export',
    IMPORT = 'import',
}

// Settings & Preferences
export interface UserPreferences {
    theme: 'light' | 'dark' | 'system';
    language: 'tr' | 'en';
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    notifications: NotificationPreferences;
}

export interface NotificationPreferences {
    email: boolean;
    push: boolean;
    desktop: boolean;
    sound: boolean;
    mentions: boolean;
    directMessages: boolean;
    channelMessages: boolean;
    projectUpdates: boolean;
    stockAlerts: boolean;
    dealUpdates: boolean;
}

// Re-export base module types
export * from './messages';
export * from './erp';
export * from './crm';
export * from './stock';

// Advanced modules are available for direct import when needed:
// import { ... } from '@/types/messages-advanced';
// import { ... } from '@/types/erp-advanced';
// import { ... } from '@/types/crm-advanced';
// import { ... } from '@/types/procurement-warehouse';
