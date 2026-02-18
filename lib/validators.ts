import { z } from 'zod';

// ============================================
// AUTHENTICATION VALIDATORS
// ============================================

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'E-posta adresi gerekli')
        .email('Geçerli bir e-posta adresi girin'),
    password: z
        .string()
        .min(1, 'Şifre gerekli')
        .min(6, 'Şifre en az 6 karakter olmalı'),
    rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
    name: z
        .string()
        .min(1, 'Ad Soyad gerekli')
        .min(2, 'Ad Soyad en az 2 karakter olmalı')
        .max(100, 'Ad Soyad en fazla 100 karakter olabilir'),
    email: z
        .string()
        .min(1, 'E-posta adresi gerekli')
        .email('Geçerli bir e-posta adresi girin'),
    password: z
        .string()
        .min(1, 'Şifre gerekli')
        .min(8, 'Şifre en az 8 karakter olmalı')
        .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermeli')
        .regex(/[a-z]/, 'Şifre en az bir küçük harf içermeli')
        .regex(/[0-9]/, 'Şifre en az bir rakam içermeli'),
    confirmPassword: z.string().min(1, 'Şifre tekrarı gerekli'),
    department: z.string().optional(),
    acceptTerms: z.boolean().refine((val) => val === true, {
        message: 'Kullanım şartlarını kabul etmelisiniz',
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .min(1, 'E-posta adresi gerekli')
        .email('Geçerli bir e-posta adresi girin'),
});

export const resetPasswordSchema = z.object({
    password: z
        .string()
        .min(8, 'Şifre en az 8 karakter olmalı')
        .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermeli')
        .regex(/[a-z]/, 'Şifre en az bir küçük harf içermeli')
        .regex(/[0-9]/, 'Şifre en az bir rakam içermeli'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
});

// ============================================
// USER VALIDATORS
// ============================================

export const updateProfileSchema = z.object({
    name: z
        .string()
        .min(2, 'Ad Soyad en az 2 karakter olmalı')
        .max(100, 'Ad Soyad en fazla 100 karakter olabilir'),
    email: z.string().email('Geçerli bir e-posta adresi girin'),
    phone: z
        .string()
        .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, 'Geçerli bir telefon numarası girin')
        .optional()
        .or(z.literal('')),
    department: z.string().optional(),
    avatar: z.string().url().optional().or(z.literal('')),
});

// ============================================
// MESSAGE VALIDATORS
// ============================================

export const messageSchema = z.object({
    content: z
        .string()
        .min(1, 'Mesaj boş olamaz')
        .max(4000, 'Mesaj en fazla 4000 karakter olabilir'),
    channelId: z.string().uuid('Geçersiz kanal ID'),
    attachments: z.array(z.string().url()).optional(),
});

export const createChannelSchema = z.object({
    name: z
        .string()
        .min(1, 'Kanal adı gerekli')
        .max(50, 'Kanal adı en fazla 50 karakter olabilir'),
    description: z.string().max(500, 'Açıklama en fazla 500 karakter olabilir').optional(),
    type: z.enum(['channel', 'group']),
    isPrivate: z.boolean(),
    members: z.array(z.string()).min(1, 'En az bir üye seçmelisiniz'),
});

// ============================================
// ERP VALIDATORS
// ============================================

export const projectSchema = z.object({
    name: z
        .string()
        .min(1, 'Proje adı gerekli')
        .max(200, 'Proje adı en fazla 200 karakter olabilir'),
    code: z
        .string()
        .min(1, 'Proje kodu gerekli')
        .max(20, 'Proje kodu en fazla 20 karakter olabilir')
        .regex(/^[A-Z0-9-]+$/, 'Proje kodu sadece büyük harf, rakam ve tire içerebilir'),
    type: z.enum(['building', 'infrastructure', 'renovation']),
    status: z.enum(['planning', 'active', 'on-hold', 'completed']),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    budget: z.number().positive('Bütçe pozitif bir değer olmalı'),
    location: z.object({
        address: z.string().min(1, 'Adres gerekli'),
        city: z.string().optional(),
        country: z.string().optional(),
    }),
    clientId: z.string().optional(),
    managerId: z.string().min(1, 'Proje yöneticisi seçmelisiniz'),
}).refine((data) => data.endDate > data.startDate, {
    message: 'Bitiş tarihi başlangıç tarihinden sonra olmalı',
    path: ['endDate'],
});

// ============================================
// CRM VALIDATORS
// ============================================

export const leadSchema = z.object({
    source: z.enum(['website', 'referral', 'campaign', 'manual']),
    contactInfo: z.object({
        email: z.string().email('Geçerli bir e-posta adresi girin'),
        phone: z.string().optional(),
        name: z.string().min(1, 'İletişim adı gerekli'),
    }),
    company: z.string().optional(),
    industry: z.string().optional(),
    budget: z.number().optional(),
    timeline: z.string().optional(),
    notes: z.string().max(2000).optional(),
});

export const dealSchema = z.object({
    customerId: z.string().min(1, 'Müşteri seçmelisiniz'),
    title: z.string().min(1, 'Fırsat başlığı gerekli').max(200),
    value: z.number().positive('Değer pozitif olmalı'),
    stage: z.enum(['prospecting', 'qualification', 'proposal', 'negotiation', 'closed-won', 'closed-lost']),
    probability: z.number().min(0).max(100),
    expectedCloseDate: z.coerce.date(),
    products: z.array(z.string()).optional(),
});

// ============================================
// STOCK VALIDATORS
// ============================================

export const inventoryItemSchema = z.object({
    sku: z.string().min(1, 'SKU gerekli').max(50),
    name: z.string().min(1, 'Ürün adı gerekli').max(200),
    categoryId: z.string().min(1, 'Kategori seçmelisiniz'),
    unit: z.enum(['pcs', 'kg', 'm', 'm2', 'm3', 'ton']),
    minStock: z.number().min(0),
    maxStock: z.number().min(0),
    reorderPoint: z.number().min(0),
    location: z.string().optional(),
    cost: z.number().min(0),
    sellingPrice: z.number().min(0).optional(),
    supplierId: z.string().optional(),
});

export const tenderSchema = z.object({
    title: z.string().min(1, 'İhale başlığı gerekli').max(200),
    type: z.enum(['purchase', 'service', 'construction']),
    items: z.array(z.object({
        name: z.string(),
        quantity: z.number().positive(),
        unit: z.string(),
        specifications: z.string().optional(),
    })).min(1, 'En az bir kalem eklemelisiniz'),
    openDate: z.coerce.date(),
    closeDate: z.coerce.date(),
    budget: z.number().positive().optional(),
    requirements: z.string().optional(),
}).refine((data) => data.closeDate > data.openDate, {
    message: 'Kapanış tarihi açılış tarihinden sonra olmalı',
    path: ['closeDate'],
});

// ============================================
// PROCUREMENT & WAREHOUSE VALIDATORS
// ============================================

export const rfqSchema = z.object({
    title: z.string().min(1, 'RFQ başlığı gerekli').max(200),
    type: z.enum(['materials', 'equipment', 'services', 'mixed']),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    items: z.array(z.object({
        name: z.string().min(1, 'Ürün adı gerekli'),
        description: z.string().optional(),
        specifications: z.string().min(1, 'Spesifikasyon gerekli'),
        quantity: z.number().positive('Miktar pozitif olmalı'),
        unit: z.enum(['pcs', 'kg', 'm', 'm2', 'm3', 'ton', 'lt', 'set', 'box', 'pack']),
        targetPrice: z.number().positive().optional(),
    })).min(1, 'En az bir ürün eklemelisiniz'),
    suppliers: z.array(z.string()).min(1, 'En az bir tedarikçi seçmelisiniz'),
    responseDeadline: z.coerce.date(),
    expectedDeliveryDate: z.coerce.date().optional(),
    budget: z.number().positive().optional(),
    requirements: z.string().optional(),
});

export const warehouseSchema = z.object({
    code: z.string().min(1, 'Depo kodu gerekli').max(20),
    name: z.string().min(1, 'Depo adı gerekli').max(100),
    type: z.enum(['main', 'regional', 'distribution', 'transit', 'cold_storage', 'hazmat']),
    address: z.object({
        street: z.string().min(1, 'Sokak adresi gerekli'),
        city: z.string().min(1, 'Şehir gerekli'),
        state: z.string().optional(),
        country: z.string().min(1, 'Ülke gerekli'),
        postalCode: z.string().min(1, 'Posta kodu gerekli'),
    }),
    contact: z.object({
        phone: z.string().min(1, 'Telefon gerekli'),
        email: z.string().email('Geçerli bir e-posta adresi girin'),
    }),
    capacity: z.object({
        totalArea: z.number().positive('Alan pozitif olmalı'),
        maxWeight: z.number().positive('Ağırlık pozitif olmalı'),
    }),
});

export const batchSchema = z.object({
    batchNumber: z.string().min(1, 'Batch numarası gerekli').max(50),
    itemId: z.string().min(1, 'Ürün seçmelisiniz'),
    quantity: z.number().positive('Miktar pozitif olmalı'),
    unit: z.enum(['pcs', 'kg', 'm', 'm2', 'm3', 'ton', 'lt', 'set', 'box', 'pack']),
    manufacturingDate: z.coerce.date().optional(),
    expiryDate: z.coerce.date().optional(),
    supplierId: z.string().min(1, 'Tedarikçi seçmelisiniz'),
    warehouseId: z.string().min(1, 'Depo seçmelisiniz'),
    location: z.object({
        zoneId: z.string(),
        aisleId: z.string(),
        rackId: z.string(),
        shelfId: z.string(),
        binId: z.string(),
    }).optional(),
}).refine((data) => {
    if (data.expiryDate && data.manufacturingDate) {
        return data.expiryDate > data.manufacturingDate;
    }
    return true;
}, {
    message: 'Son kullanma tarihi üretim tarihinden sonra olmalı',
    path: ['expiryDate'],
});

export const stockTransferSchema = z.object({
    fromWarehouseId: z.string().min(1, 'Kaynak depo seçmelisiniz'),
    toWarehouseId: z.string().min(1, 'Hedef depo seçmelisiniz'),
    items: z.array(z.object({
        itemId: z.string().min(1, 'Ürün seçmelisiniz'),
        batchId: z.string().optional(),
        quantity: z.number().positive('Miktar pozitif olmalı'),
        unit: z.enum(['pcs', 'kg', 'm', 'm2', 'm3', 'ton', 'lt', 'set', 'box', 'pack']),
    })).min(1, 'En az bir ürün eklemelisiniz'),
    expectedDeliveryDate: z.coerce.date(),
    carrier: z.string().optional(),
    notes: z.string().max(1000).optional(),
}).refine((data) => data.fromWarehouseId !== data.toWarehouseId, {
    message: 'Kaynak ve hedef depo aynı olamaz',
    path: ['toWarehouseId'],
});

export const goodsReceiptSchema = z.object({
    warehouseId: z.string().min(1, 'Depo seçmelisiniz'),
    purchaseOrderId: z.string().optional(),
    supplierId: z.string().min(1, 'Tedarikçi seçmelisiniz'),
    items: z.array(z.object({
        itemId: z.string().min(1, 'Ürün seçmelisiniz'),
        receivedQuantity: z.number().positive('Miktar pozitif olmalı'),
        unit: z.enum(['pcs', 'kg', 'm', 'm2', 'm3', 'ton', 'lt', 'set', 'box', 'pack']),
        batchNumber: z.string().optional(),
        expiryDate: z.coerce.date().optional(),
    })).min(1, 'En az bir ürün eklemelisiniz'),
    carrier: z.string().optional(),
    trackingNumber: z.string().optional(),
    deliveryNote: z.string().optional(),
    notes: z.string().max(1000).optional(),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type CreateChannelInput = z.infer<typeof createChannelSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type LeadInput = z.infer<typeof leadSchema>;
export type DealInput = z.infer<typeof dealSchema>;
export type InventoryItemInput = z.infer<typeof inventoryItemSchema>;
export type TenderInput = z.infer<typeof tenderSchema>;
export type RFQInput = z.infer<typeof rfqSchema>;
export type WarehouseInput = z.infer<typeof warehouseSchema>;
export type BatchInput = z.infer<typeof batchSchema>;
export type StockTransferInput = z.infer<typeof stockTransferSchema>;
export type GoodsReceiptInput = z.infer<typeof goodsReceiptSchema>;
