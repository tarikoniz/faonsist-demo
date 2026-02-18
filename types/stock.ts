// ============================================
// STOCK & TENDER TYPES
// ============================================

import { User, Attachment, Note } from './index';

// ============================================
// INVENTORY
// ============================================

export interface InventoryItem {
    id: string;
    sku: string;
    barcode?: string;
    name: string;
    description?: string;
    category: Category;
    subcategory?: string;
    brand?: string;
    unit: StockUnit;
    currentStock: number;
    reservedStock: number;
    availableStock: number;
    minStock: number;
    maxStock: number;
    reorderPoint: number;
    reorderQuantity: number;
    location?: WarehouseLocation;
    cost: number;
    lastCost?: number;
    avgCost?: number;
    sellingPrice?: number;
    supplier?: Supplier;
    alternativeSuppliers?: Supplier[];
    specifications?: Record<string, string>;
    images?: string[];
    isActive: boolean;
    lastPurchaseDate?: Date;
    lastSaleDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export enum StockUnit {
    PCS = 'pcs',
    KG = 'kg',
    M = 'm',
    M2 = 'm2',
    M3 = 'm3',
    TON = 'ton',
    LT = 'lt',
    SET = 'set',
    BOX = 'box',
    PACK = 'pack',
}

export interface Category {
    id: string;
    name: string;
    parentId?: string;
    description?: string;
    itemCount?: number;
}

export interface WarehouseLocation {
    warehouseId: string;
    warehouseName: string;
    zone?: string;
    aisle?: string;
    rack?: string;
    shelf?: string;
    bin?: string;
}

export interface Warehouse {
    id: string;
    name: string;
    code: string;
    address: string;
    city: string;
    manager?: User;
    isActive: boolean;
}

export interface Supplier {
    id: string;
    code: string;
    name: string;
    companyName?: string;
    taxNumber?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    contactPerson?: string;
    paymentTerms?: string;
    leadTime?: number; // days
    rating?: number; // 0-5
    isActive: boolean;
    bankInfo?: BankInfo;
    notes?: Note[];
    createdAt: Date;
    updatedAt: Date;
}

export interface BankInfo {
    bankName: string;
    branchName?: string;
    accountNumber: string;
    iban: string;
    swiftCode?: string;
}

// ============================================
// STOCK MOVEMENTS
// ============================================

export interface StockMovement {
    id: string;
    itemId: string;
    item?: InventoryItem;
    type: MovementType;
    quantity: number;
    beforeStock: number;
    afterStock: number;
    unitCost?: number;
    totalCost?: number;
    referenceType?: ReferenceType;
    referenceId?: string;
    referenceNumber?: string;
    notes?: string;
    warehouseId: string;
    createdBy: string;
    createdAt: Date;
}

export enum MovementType {
    PURCHASE = 'purchase',
    SALE = 'sale',
    TRANSFER_IN = 'transfer_in',
    TRANSFER_OUT = 'transfer_out',
    ADJUSTMENT = 'adjustment',
    RETURN = 'return',
    WASTE = 'waste',
    PRODUCTION = 'production',
}

export enum ReferenceType {
    PURCHASE_ORDER = 'purchase_order',
    SALES_ORDER = 'sales_order',
    TRANSFER = 'transfer',
    INVENTORY_ADJUSTMENT = 'inventory_adjustment',
    TENDER = 'tender',
}

// ============================================
// PURCHASE ORDERS
// ============================================

export interface PurchaseOrder {
    id: string;
    orderNumber: string;
    supplierId: string;
    supplier?: Supplier;
    status: POStatus;
    orderDate: Date;
    expectedDeliveryDate?: Date;
    actualDeliveryDate?: Date;
    items: PurchaseOrderItem[];
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    currency: string;
    paymentTerms?: string;
    deliveryAddress?: string;
    notes?: string;
    attachments?: Attachment[];
    approvedBy?: string;
    approvedAt?: Date;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export enum POStatus {
    DRAFT = 'draft',
    PENDING_APPROVAL = 'pending_approval',
    APPROVED = 'approved',
    SENT = 'sent',
    PARTIALLY_RECEIVED = 'partially_received',
    RECEIVED = 'received',
    CANCELLED = 'cancelled',
}

export interface PurchaseOrderItem {
    id: string;
    itemId: string;
    item?: InventoryItem;
    description?: string;
    quantity: number;
    receivedQuantity: number;
    unit: StockUnit;
    unitPrice: number;
    discount?: number;
    taxRate: number;
    totalPrice: number;
}

// ============================================
// TENDERS (İHALE)
// ============================================

export interface Tender {
    id: string;
    tenderNumber: string;
    title: string;
    description?: string;
    type: TenderType;
    status: TenderStatus;
    projectId?: string;
    items: TenderItem[];
    bidders: Bidder[];
    openDate: Date;
    closeDate: Date;
    evaluationDate?: Date;
    awardDate?: Date;
    evaluationCriteria: EvaluationCriteria[];
    budget?: number;
    estimatedValue?: number;
    awardedBidderId?: string;
    awardedAmount?: number;
    terms?: string;
    attachments?: Attachment[];
    notes?: Note[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export enum TenderType {
    PURCHASE = 'purchase',
    SERVICE = 'service',
    CONSTRUCTION = 'construction',
    CONSULTING = 'consulting',
}

export enum TenderStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    BIDDING = 'bidding',
    CLOSED = 'closed',
    EVALUATION = 'evaluation',
    AWARDED = 'awarded',
    CANCELLED = 'cancelled',
}

export interface TenderItem {
    id: string;
    itemNumber: number;
    name: string;
    description?: string;
    specifications?: string;
    quantity: number;
    unit: StockUnit;
    estimatedUnitPrice?: number;
    estimatedTotalPrice?: number;
}

export interface Bidder {
    id: string;
    tenderId: string;
    supplierId: string;
    supplier?: Supplier;
    status: BidStatus;
    submittedAt?: Date;
    items: BidItem[];
    totalAmount?: number;
    validityDays?: number;
    deliveryDays?: number;
    paymentTerms?: string;
    technicalScore?: number;
    financialScore?: number;
    totalScore?: number;
    notes?: string;
    attachments?: Attachment[];
}

export enum BidStatus {
    INVITED = 'invited',
    DECLINED = 'declined',
    SUBMITTED = 'submitted',
    UNDER_REVIEW = 'under_review',
    SHORTLISTED = 'shortlisted',
    AWARDED = 'awarded',
    REJECTED = 'rejected',
}

export interface BidItem {
    id: string;
    tenderItemId: string;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
}

export interface EvaluationCriteria {
    id: string;
    name: string;
    weight: number; // percentage
    description?: string;
}

// ============================================
// STOCK ALERTS
// ============================================

export interface StockAlert {
    id: string;
    itemId: string;
    item?: InventoryItem;
    type: AlertType;
    message: string;
    severity: AlertSeverity;
    isRead: boolean;
    isResolved: boolean;
    createdAt: Date;
    resolvedAt?: Date;
    resolvedBy?: string;
}

export enum AlertType {
    LOW_STOCK = 'low_stock',
    OUT_OF_STOCK = 'out_of_stock',
    OVERSTOCK = 'overstock',
    EXPIRING = 'expiring',
    EXPIRED = 'expired',
    REORDER = 'reorder',
}

export enum AlertSeverity {
    INFO = 'info',
    WARNING = 'warning',
    CRITICAL = 'critical',
}

// ============================================
// DASHBOARD STATS
// ============================================

export interface StockStats {
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
    pendingOrders: number;
    activeTenders: number;
    topCategories: { name: string; value: number; count: number }[];
    recentMovements: StockMovement[];
    alerts: StockAlert[];
}
