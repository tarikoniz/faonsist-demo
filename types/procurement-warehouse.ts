// ============================================
// ADVANCED PROCUREMENT & WAREHOUSE TYPES
// ============================================

import { User, Attachment, Note } from './index';
import { Supplier, InventoryItem, StockUnit, PurchaseOrder } from './stock';

// ============================================
// MULTI-WAREHOUSE MANAGEMENT
// ============================================

export interface WarehouseExtended {
    id: string;
    code: string;
    name: string;
    type: WarehouseType;
    status: WarehouseStatus;
    address: WarehouseAddress;
    contact: WarehouseContact;
    capacity: WarehouseCapacity;
    zones: WarehouseZone[];
    features: WarehouseFeatures;
    operatingHours: OperatingHours;
    manager?: User;
    staff: WarehouseStaff[];
    certifications?: Certification[];
    createdAt: Date;
    updatedAt: Date;
}

export enum WarehouseType {
    MAIN = 'main',
    REGIONAL = 'regional',
    DISTRIBUTION = 'distribution',
    TRANSIT = 'transit',
    COLD_STORAGE = 'cold_storage',
    HAZMAT = 'hazmat',
}

export enum WarehouseStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    MAINTENANCE = 'maintenance',
    FULL = 'full',
}

export interface WarehouseAddress {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}

export interface WarehouseContact {
    phone: string;
    email: string;
    emergencyContact?: string;
}

export interface WarehouseCapacity {
    totalArea: number; // m²
    usedArea: number;
    availableArea: number;
    maxWeight: number; // tons
    currentWeight: number;
    utilizationRate: number; // 0-100%
}

export interface WarehouseZone {
    id: string;
    code: string;
    name: string;
    type: ZoneType;
    aisles: Aisle[];
    temperature?: TemperatureRange;
    humidity?: HumidityRange;
    isRestricted: boolean;
}

export enum ZoneType {
    RECEIVING = 'receiving',
    STORAGE = 'storage',
    PICKING = 'picking',
    PACKING = 'packing',
    SHIPPING = 'shipping',
    QUARANTINE = 'quarantine',
    RETURNS = 'returns',
}

export interface Aisle {
    id: string;
    code: string;
    racks: Rack[];
}

export interface Rack {
    id: string;
    code: string;
    shelves: Shelf[];
    maxWeight: number;
}

export interface Shelf {
    id: string;
    code: string;
    bins: Bin[];
    level: number;
}

export interface Bin {
    id: string;
    code: string;
    capacity: number;
    occupied: boolean;
    itemId?: string;
    quantity?: number;
}

export interface TemperatureRange {
    min: number;
    max: number;
    current?: number;
    unit: 'celsius' | 'fahrenheit';
}

export interface HumidityRange {
    min: number;
    max: number;
    current?: number;
}

export interface WarehouseFeatures {
    hasLoadingDock: boolean;
    hasColdStorage: boolean;
    hasSecuritySystem: boolean;
    hasFireSuppression: boolean;
    hasClimateControl: boolean;
    hasForklift: boolean;
    hasPalletRacking: boolean;
}

export interface OperatingHours {
    monday: DaySchedule;
    tuesday: DaySchedule;
    wednesday: DaySchedule;
    thursday: DaySchedule;
    friday: DaySchedule;
    saturday: DaySchedule;
    sunday: DaySchedule;
}

export interface DaySchedule {
    isOpen: boolean;
    openTime?: string; // HH:mm
    closeTime?: string; // HH:mm
}

export interface WarehouseStaff {
    userId: string;
    role: WarehouseRole;
    shift: 'morning' | 'afternoon' | 'night';
}

export enum WarehouseRole {
    MANAGER = 'manager',
    SUPERVISOR = 'supervisor',
    FORKLIFT_OPERATOR = 'forklift_operator',
    PICKER = 'picker',
    PACKER = 'packer',
    RECEIVER = 'receiver',
    SHIPPER = 'shipper',
}

export interface Certification {
    id: string;
    type: string;
    number: string;
    issuedBy: string;
    issuedDate: Date;
    expiryDate: Date;
    documentUrl?: string;
}

// ============================================
// BATCH & LOT TRACKING
// ============================================

export interface Batch {
    id: string;
    batchNumber: string;
    itemId: string;
    item?: InventoryItem;
    quantity: number;
    unit: StockUnit;
    status: BatchStatus;
    manufacturingDate?: Date;
    expiryDate?: Date;
    receiptDate: Date;
    supplierId: string;
    supplier?: Supplier;
    purchaseOrderId?: string;
    warehouseId: string;
    location: BatchLocation;
    qualityStatus: QualityStatus;
    qualityTests?: QualityTest[];
    certifications?: Attachment[];
    traceability: TraceabilityInfo;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export enum BatchStatus {
    RECEIVED = 'received',
    IN_QUARANTINE = 'in_quarantine',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    IN_USE = 'in_use',
    DEPLETED = 'depleted',
    EXPIRED = 'expired',
}

export interface BatchLocation {
    warehouseId: string;
    zoneId: string;
    aisleId: string;
    rackId: string;
    shelfId: string;
    binId: string;
    fullPath: string; // e.g., "WH01-A-01-R-03-S-02-B-05"
}

export enum QualityStatus {
    PENDING = 'pending',
    PASSED = 'passed',
    FAILED = 'failed',
    CONDITIONAL = 'conditional',
}

export interface QualityTest {
    id: string;
    testType: string;
    testDate: Date;
    testedBy: string;
    result: 'pass' | 'fail';
    measurements?: Record<string, any>;
    notes?: string;
    certificateUrl?: string;
}

export interface TraceabilityInfo {
    origin: string;
    manufacturer?: string;
    productionBatch?: string;
    certifications?: string[];
    customsDocuments?: Attachment[];
    chainOfCustody: CustodyRecord[];
}

export interface CustodyRecord {
    timestamp: Date;
    location: string;
    handler: string;
    action: string;
    notes?: string;
}

// ============================================
// REQUEST FOR QUOTATION (RFQ)
// ============================================

export interface RFQ {
    id: string;
    rfqNumber: string;
    title: string;
    description?: string;
    type: RFQType;
    status: RFQStatus;
    priority: Priority;
    projectId?: string;
    requestedBy: User;
    department?: string;
    items: RFQItem[];
    suppliers: RFQSupplier[];
    requirements: RFQRequirements;
    evaluationCriteria: EvaluationCriteria[];
    timeline: RFQTimeline;
    budget?: number;
    currency: string;
    terms: RFQTerms;
    attachments?: Attachment[];
    notes?: Note[];
    createdAt: Date;
    updatedAt: Date;
}

export enum RFQType {
    MATERIALS = 'materials',
    EQUIPMENT = 'equipment',
    SERVICES = 'services',
    MIXED = 'mixed',
}

export enum RFQStatus {
    DRAFT = 'draft',
    PENDING_APPROVAL = 'pending_approval',
    APPROVED = 'approved',
    SENT = 'sent',
    RESPONSES_RECEIVED = 'responses_received',
    UNDER_EVALUATION = 'under_evaluation',
    AWARDED = 'awarded',
    CANCELLED = 'cancelled',
}

export enum Priority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    URGENT = 'urgent',
}

export interface RFQItem {
    id: string;
    itemNumber: number;
    name: string;
    description?: string;
    specifications: string;
    quantity: number;
    unit: StockUnit;
    estimatedUnitPrice?: number;
    targetPrice?: number;
    deliveryLocation?: string;
    notes?: string;
}

export interface RFQSupplier {
    id: string;
    supplierId: string;
    supplier?: Supplier;
    status: SupplierRFQStatus;
    invitedAt: Date;
    respondedAt?: Date;
    quotation?: Quotation;
    evaluationScore?: EvaluationScore;
}

export enum SupplierRFQStatus {
    INVITED = 'invited',
    VIEWED = 'viewed',
    DECLINED = 'declined',
    SUBMITTED = 'submitted',
    SHORTLISTED = 'shortlisted',
    AWARDED = 'awarded',
    REJECTED = 'rejected',
}

export interface Quotation {
    id: string;
    quotationNumber: string;
    rfqId: string;
    supplierId: string;
    items: QuotationItem[];
    subtotal: number;
    taxAmount: number;
    shippingCost: number;
    totalAmount: number;
    currency: string;
    validityDays: number;
    deliveryDays: number;
    paymentTerms: string;
    warranty?: string;
    notes?: string;
    attachments?: Attachment[];
    submittedAt: Date;
}

export interface QuotationItem {
    id: string;
    rfqItemId: string;
    unitPrice: number;
    totalPrice: number;
    leadTime: number; // days
    brand?: string;
    model?: string;
    specifications?: string;
    notes?: string;
}

export interface RFQRequirements {
    minQualityStandard?: string;
    certificationRequired?: string[];
    deliveryMethod?: string;
    packagingRequirements?: string;
    inspectionRequired: boolean;
    sampleRequired: boolean;
}

export interface EvaluationCriteria {
    id: string;
    name: string;
    weight: number; // percentage
    description?: string;
}

export interface EvaluationScore {
    totalScore: number;
    priceScore: number;
    qualityScore: number;
    deliveryScore: number;
    supplierRatingScore: number;
    breakdown: Record<string, number>;
    evaluatedBy?: string;
    evaluatedAt?: Date;
    notes?: string;
}

export interface RFQTimeline {
    issueDate: Date;
    responseDeadline: Date;
    evaluationDate?: Date;
    awardDate?: Date;
    expectedDeliveryDate?: Date;
}

export interface RFQTerms {
    paymentTerms: string;
    deliveryTerms: string;
    warrantyTerms?: string;
    penaltyClause?: string;
    returnPolicy?: string;
}

// ============================================
// WAREHOUSE OPERATIONS
// ============================================

export interface WarehouseOperation {
    id: string;
    type: OperationType;
    status: OperationStatus;
    warehouseId: string;
    referenceNumber: string;
    items: OperationItem[];
    assignedTo?: User;
    priority: Priority;
    scheduledAt?: Date;
    startedAt?: Date;
    completedAt?: Date;
    notes?: string;
    attachments?: Attachment[];
    createdBy: string;
    createdAt: Date;
}

export enum OperationType {
    RECEIVING = 'receiving',
    PUTAWAY = 'putaway',
    PICKING = 'picking',
    PACKING = 'packing',
    SHIPPING = 'shipping',
    TRANSFER = 'transfer',
    CYCLE_COUNT = 'cycle_count',
    ADJUSTMENT = 'adjustment',
}

export enum OperationStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    ON_HOLD = 'on_hold',
}

export interface OperationItem {
    id: string;
    itemId: string;
    item?: InventoryItem;
    batchId?: string;
    quantity: number;
    unit: StockUnit;
    fromLocation?: BatchLocation;
    toLocation?: BatchLocation;
    status: 'pending' | 'completed' | 'failed';
    notes?: string;
}

export interface StockTransfer {
    id: string;
    transferNumber: string;
    fromWarehouseId: string;
    toWarehouseId: string;
    status: TransferStatus;
    items: TransferItem[];
    requestedBy: User;
    approvedBy?: User;
    shippedBy?: User;
    receivedBy?: User;
    requestedAt: Date;
    approvedAt?: Date;
    shippedAt?: Date;
    receivedAt?: Date;
    expectedDeliveryDate?: Date;
    actualDeliveryDate?: Date;
    carrier?: string;
    trackingNumber?: string;
    notes?: string;
    attachments?: Attachment[];
}

export enum TransferStatus {
    REQUESTED = 'requested',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    IN_TRANSIT = 'in_transit',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
}

export interface TransferItem {
    id: string;
    itemId: string;
    item?: InventoryItem;
    batchId?: string;
    requestedQuantity: number;
    shippedQuantity?: number;
    receivedQuantity?: number;
    unit: StockUnit;
    notes?: string;
}

export interface CycleCount {
    id: string;
    countNumber: string;
    warehouseId: string;
    type: CycleCountType;
    status: CycleCountStatus;
    scheduledDate: Date;
    completedDate?: Date;
    items: CycleCountItem[];
    counters: User[];
    discrepancies: Discrepancy[];
    adjustments: StockAdjustment[];
    accuracy: number; // percentage
    notes?: string;
}

export enum CycleCountType {
    FULL = 'full',
    PARTIAL = 'partial',
    ABC_ANALYSIS = 'abc_analysis',
    RANDOM = 'random',
}

export enum CycleCountStatus {
    SCHEDULED = 'scheduled',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

export interface CycleCountItem {
    id: string;
    itemId: string;
    item?: InventoryItem;
    batchId?: string;
    location: BatchLocation;
    systemQuantity: number;
    countedQuantity?: number;
    variance?: number;
    countedBy?: string;
    countedAt?: Date;
    verified: boolean;
}

export interface Discrepancy {
    id: string;
    itemId: string;
    batchId?: string;
    location: BatchLocation;
    systemQuantity: number;
    actualQuantity: number;
    variance: number;
    variancePercentage: number;
    reason?: string;
    actionTaken?: string;
    resolvedBy?: string;
    resolvedAt?: Date;
}

export interface StockAdjustment {
    id: string;
    adjustmentNumber: string;
    warehouseId: string;
    type: AdjustmentType;
    reason: AdjustmentReason;
    items: AdjustmentItem[];
    approvedBy?: User;
    approvedAt?: Date;
    notes?: string;
    attachments?: Attachment[];
    createdBy: string;
    createdAt: Date;
}

export enum AdjustmentType {
    INCREASE = 'increase',
    DECREASE = 'decrease',
}

export enum AdjustmentReason {
    CYCLE_COUNT = 'cycle_count',
    DAMAGE = 'damage',
    EXPIRY = 'expiry',
    THEFT = 'theft',
    FOUND = 'found',
    QUALITY_ISSUE = 'quality_issue',
    SYSTEM_ERROR = 'system_error',
    OTHER = 'other',
}

export interface AdjustmentItem {
    id: string;
    itemId: string;
    item?: InventoryItem;
    batchId?: string;
    location: BatchLocation;
    beforeQuantity: number;
    afterQuantity: number;
    variance: number;
    unitCost?: number;
    totalCost?: number;
}

// ============================================
// RECEIVING & INSPECTION
// ============================================

export interface GoodsReceipt {
    id: string;
    receiptNumber: string;
    warehouseId: string;
    purchaseOrderId?: string;
    purchaseOrder?: PurchaseOrder;
    supplierId: string;
    supplier?: Supplier;
    status: ReceiptStatus;
    items: ReceiptItem[];
    receivedBy: User;
    receivedAt: Date;
    inspectedBy?: User;
    inspectedAt?: Date;
    qualityCheckPassed?: boolean;
    carrier?: string;
    trackingNumber?: string;
    deliveryNote?: string;
    notes?: string;
    attachments?: Attachment[];
}

export enum ReceiptStatus {
    PENDING = 'pending',
    RECEIVED = 'received',
    INSPECTING = 'inspecting',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    PARTIALLY_APPROVED = 'partially_approved',
}

export interface ReceiptItem {
    id: string;
    itemId: string;
    item?: InventoryItem;
    orderedQuantity?: number;
    receivedQuantity: number;
    acceptedQuantity: number;
    rejectedQuantity: number;
    unit: StockUnit;
    batchNumber?: string;
    expiryDate?: Date;
    qualityStatus: QualityStatus;
    inspectionNotes?: string;
    photos?: Attachment[];
}

export interface InboundInspection {
    id: string;
    receiptId: string;
    inspectionNumber: string;
    inspectionDate: Date;
    inspector: User;
    items: InspectionItem[];
    overallResult: 'pass' | 'fail' | 'conditional';
    defectsFound: DefectRecord[];
    recommendations?: string;
    report?: Attachment;
    photos?: Attachment[];
    createdAt: Date;
}

export interface InspectionItem {
    id: string;
    itemId: string;
    item?: InventoryItem;
    quantity: number;
    sampleSize: number;
    checkpoints: InspectionCheckpoint[];
    result: 'pass' | 'fail' | 'conditional';
    notes?: string;
}

export interface InspectionCheckpoint {
    id: string;
    category: string;
    parameter: string;
    specification: string;
    actualValue: string;
    passed: boolean;
    notes?: string;
}

export interface DefectRecord {
    id: string;
    itemId: string;
    defectType: string;
    severity: 'minor' | 'major' | 'critical';
    quantity: number;
    description: string;
    photos?: string[];
    action: 'accept' | 'reject' | 'return' | 'rework';
}

// ============================================
// ANALYTICS & REPORTING
// ============================================

export interface WarehouseMetrics {
    warehouseId: string;
    period: DateRange;
    inventory: InventoryMetrics;
    operations: OperationsMetrics;
    quality: QualityMetrics;
    financial: FinancialMetrics;
}

export interface DateRange {
    startDate: Date;
    endDate: Date;
}

export interface InventoryMetrics {
    totalItems: number;
    totalValue: number;
    turnoverRate: number;
    daysOnHand: number;
    stockoutRate: number;
    overstockRate: number;
    accuracyRate: number;
    deadStock: number;
}

export interface OperationsMetrics {
    receiptsProcessed: number;
    shipmentsProcessed: number;
    transfersCompleted: number;
    cycleCountsCompleted: number;
    averageReceivingTime: number; // hours
    averagePickingTime: number; // minutes
    orderFulfillmentRate: number; // percentage
    onTimeDeliveryRate: number; // percentage
}

export interface QualityMetrics {
    inspectionsCompleted: number;
    passRate: number;
    rejectRate: number;
    defectRate: number;
    supplierQualityScore: Record<string, number>;
}

export interface FinancialMetrics {
    totalPurchaseValue: number;
    averageOrderValue: number;
    costSavings: number;
    carryingCost: number;
    shrinkageCost: number;
}

// ============================================
// SUPPLIER PERFORMANCE
// ============================================

export interface SupplierPerformance {
    supplierId: string;
    supplier?: Supplier;
    period: DateRange;
    metrics: SupplierMetrics;
    ratings: SupplierRatings;
    issues: SupplierIssue[];
    overallScore: number;
    trend: 'improving' | 'stable' | 'declining';
}

export interface SupplierMetrics {
    totalOrders: number;
    totalValue: number;
    onTimeDeliveryRate: number;
    qualityAcceptanceRate: number;
    averageLeadTime: number;
    priceCompetitiveness: number;
    responsiveness: number;
}

export interface SupplierRatings {
    quality: number; // 0-5
    delivery: number; // 0-5
    pricing: number; // 0-5
    service: number; // 0-5
    communication: number; // 0-5
}

export interface SupplierIssue {
    id: string;
    date: Date;
    type: IssueType;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    resolution?: string;
    resolvedAt?: Date;
    impact: string;
}

export enum IssueType {
    LATE_DELIVERY = 'late_delivery',
    QUALITY_ISSUE = 'quality_issue',
    WRONG_QUANTITY = 'wrong_quantity',
    DAMAGED_GOODS = 'damaged_goods',
    MISSING_DOCUMENTATION = 'missing_documentation',
    PRICING_DISCREPANCY = 'pricing_discrepancy',
    COMMUNICATION = 'communication',
}
