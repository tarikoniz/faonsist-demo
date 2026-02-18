// ============================================
// APPLICATION CONSTANTS
// ============================================

// App Info
export const APP_NAME = 'FaOnSisT';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Entegre İş Yönetim Platformu';

// API Endpoints
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

// Authentication
export const AUTH_TOKEN_KEY = 'faonsist-token';
export const AUTH_REFRESH_KEY = 'faonsist-refresh';
export const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes

// Layout Dimensions
export const LAYOUT = {
    GLOBAL_NAV_WIDTH: 64,
    SIDEBAR_WIDTH: 320,
    SIDEBAR_MIN_WIDTH: 280,
    HEADER_HEIGHT: 64,
    MOBILE_BREAKPOINT: 768,
    TABLET_BREAKPOINT: 1024,
};

// File Upload
export const FILE_UPLOAD = {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
    ],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'],
};

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 20,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
    MAX_PAGE_SIZE: 100,
};

// Chat/Messages
export const CHAT = {
    MAX_MESSAGE_LENGTH: 4000,
    TYPING_TIMEOUT: 3000, // 3 seconds
    MESSAGE_FETCH_LIMIT: 50,
    CHANNEL_FETCH_LIMIT: 100,
};

// Date Formats
export const DATE_FORMATS = {
    DISPLAY: 'dd MMM yyyy',
    DISPLAY_WITH_TIME: 'dd MMM yyyy HH:mm',
    TIME_ONLY: 'HH:mm',
    ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
    INPUT: 'yyyy-MM-dd',
};

// Status Colors
export const STATUS_COLORS = {
    online: '#10b981',
    offline: '#64748b',
    away: '#f59e0b',
    busy: '#ef4444',
};

// Module Names (Updated to New Naming Convention)
export const MODULE_NAMES = {
    MESSAGES: 'FaOn-Connect', // Teams Benzeri İletişim
    ERP: 'FaOn-Build',        // İnşaat ERP
    CRM: 'FaOn-Sales',        // CRM & Satış
    STOCK: 'FaOn-Supply',     // Satınalma & Depo
} as const;

// Module Routes
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    MESSAGES: '/messages',    // FaOn-Connect
    ERP: '/erp',             // FaOn-Build
    CRM: '/crm',             // FaOn-Sales
    STOCK: '/stock',         // FaOn-Supply
    SETTINGS: '/settings',
    PROFILE: '/profile',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.',
    UNAUTHORIZED: 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.',
    FORBIDDEN: 'Bu işlemi yapmaya yetkiniz yok.',
    NOT_FOUND: 'Aradığınız kaynak bulunamadı.',
    SERVER_ERROR: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
    VALIDATION_ERROR: 'Lütfen tüm alanları doğru doldurun.',
    GENERIC_ERROR: 'Bir hata oluştu. Lütfen tekrar deneyin.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
    SAVED: 'Başarıyla kaydedildi.',
    DELETED: 'Başarıyla silindi.',
    UPDATED: 'Başarıyla güncellendi.',
    SENT: 'Başarıyla gönderildi.',
    CREATED: 'Başarıyla oluşturuldu.',
};

// Keyboard Shortcuts
export const KEYBOARD_SHORTCUTS = {
    SEARCH: ['Ctrl', 'K'],
    NEW_MESSAGE: ['Ctrl', 'N'],
    SETTINGS: ['Ctrl', ','],
    HELP: ['Ctrl', '/'],
};
