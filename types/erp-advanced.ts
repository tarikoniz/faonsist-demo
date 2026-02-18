// ============================================
// ADVANCED ERP TYPES - Professional Construction Management
// ============================================

import { User, Attachment, Note } from './index';
import { Project, Task, Milestone } from './erp';

// ============================================
// RESOURCE MANAGEMENT
// ============================================

export interface Resource {
    id: string;
    type: ResourceType;
    name: string;
    code: string;
    category: string;
    status: ResourceStatus;
    availability: ResourceAvailability;
    cost: ResourceCost;
    specifications?: Record<string, any>;
    location?: string;
    assignedTo?: string;
    maintenanceSchedule?: MaintenanceSchedule[];
    documents?: Attachment[];
    createdAt: Date;
    updatedAt: Date;
}

export enum ResourceType {
    EQUIPMENT = 'equipment',
    VEHICLE = 'vehicle',
    TOOL = 'tool',
    MATERIAL = 'material',
    HUMAN = 'human',
}

export enum ResourceStatus {
    AVAILABLE = 'available',
    IN_USE = 'in-use',
    MAINTENANCE = 'maintenance',
    RESERVED = 'reserved',
    RETIRED = 'retired',
}

export interface ResourceAvailability {
    isAvailable: boolean;
    availableFrom?: Date;
    availableUntil?: Date;
    currentProjectId?: string;
    utilizationRate: number; // 0-100
}

export interface ResourceCost {
    dailyRate?: number;
    hourlyRate?: number;
    purchasePrice?: number;
    depreciationRate?: number;
    maintenanceCost?: number;
}

export interface MaintenanceSchedule {
    id: string;
    type: 'preventive' | 'corrective' | 'inspection';
    scheduledDate: Date;
    completedDate?: Date;
    description: string;
    cost?: number;
    performedBy?: string;
    notes?: string;
}

// ============================================
// TIME TRACKING
// ============================================

export interface TimeEntry {
    id: string;
    userId: string;
    user?: User;
    projectId: string;
    project?: Project;
    taskId?: string;
    task?: Task;
    date: Date;
    startTime: Date;
    endTime?: Date;
    duration: number; // minutes
    type: TimeEntryType;
    description?: string;
    billable: boolean;
    approved: boolean;
    approvedBy?: string;
    approvedAt?: Date;
    location?: GeolocationPoint;
    attachments?: Attachment[];
    createdAt: Date;
    updatedAt: Date;
}

export enum TimeEntryType {
    REGULAR = 'regular',
    OVERTIME = 'overtime',
    BREAK = 'break',
    TRAVEL = 'travel',
    MEETING = 'meeting',
}

export interface GeolocationPoint {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp: Date;
}

export interface Timesheet {
    id: string;
    userId: string;
    user?: User;
    weekStartDate: Date;
    weekEndDate: Date;
    entries: TimeEntry[];
    totalHours: number;
    regularHours: number;
    overtimeHours: number;
    status: TimesheetStatus;
    submittedAt?: Date;
    approvedBy?: string;
    approvedAt?: Date;
    notes?: string;
}

export enum TimesheetStatus {
    DRAFT = 'draft',
    SUBMITTED = 'submitted',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

// ============================================
// EQUIPMENT MANAGEMENT
// ============================================

export interface Equipment {
    id: string;
    name: string;
    code: string;
    type: EquipmentType;
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    purchaseDate?: Date;
    purchasePrice?: number;
    currentValue?: number;
    status: EquipmentStatus;
    location?: string;
    assignedTo?: string;
    specifications: EquipmentSpecifications;
    maintenance: MaintenanceRecord[];
    fuelLog?: FuelLog[];
    inspections?: Inspection[];
    documents?: Attachment[];
    insurance?: InsuranceInfo;
    createdAt: Date;
    updatedAt: Date;
}

export enum EquipmentType {
    EXCAVATOR = 'excavator',
    CRANE = 'crane',
    BULLDOZER = 'bulldozer',
    LOADER = 'loader',
    TRUCK = 'truck',
    CONCRETE_MIXER = 'concrete_mixer',
    GENERATOR = 'generator',
    COMPRESSOR = 'compressor',
    SCAFFOLDING = 'scaffolding',
    OTHER = 'other',
}

export enum EquipmentStatus {
    OPERATIONAL = 'operational',
    IN_MAINTENANCE = 'in_maintenance',
    OUT_OF_SERVICE = 'out_of_service',
    RENTED_OUT = 'rented_out',
}

export interface EquipmentSpecifications {
    capacity?: string;
    power?: string;
    weight?: number;
    dimensions?: { length: number; width: number; height: number };
    fuelType?: string;
    fuelCapacity?: number;
    operatingHours?: number;
    customSpecs?: Record<string, any>;
}

export interface MaintenanceRecord {
    id: string;
    date: Date;
    type: 'routine' | 'repair' | 'inspection' | 'upgrade';
    description: string;
    cost: number;
    performedBy: string;
    partsReplaced?: string[];
    nextMaintenanceDate?: Date;
    notes?: string;
    attachments?: Attachment[];
}

export interface FuelLog {
    id: string;
    date: Date;
    quantity: number;
    cost: number;
    odometerReading?: number;
    location?: string;
    filledBy: string;
}

export interface Inspection {
    id: string;
    date: Date;
    type: 'daily' | 'weekly' | 'monthly' | 'annual' | 'safety';
    inspector: string;
    passed: boolean;
    findings: InspectionFinding[];
    nextInspectionDate?: Date;
    certificateUrl?: string;
}

export interface InspectionFinding {
    id: string;
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    actionRequired?: string;
    resolvedAt?: Date;
    photos?: string[];
}

export interface InsuranceInfo {
    provider: string;
    policyNumber: string;
    coverage: number;
    startDate: Date;
    endDate: Date;
    premium: number;
    documentUrl?: string;
}

// ============================================
// DOCUMENT MANAGEMENT
// ============================================

export interface Document {
    id: string;
    name: string;
    type: DocumentType;
    category: string;
    version: string;
    status: DocumentStatus;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    projectId?: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
    tags: string[];
    metadata: DocumentMetadata;
    permissions: DocumentPermission[];
    versions: DocumentVersion[];
    uploadedBy: string;
    uploadedAt: Date;
    lastModifiedBy?: string;
    lastModifiedAt?: Date;
    expiryDate?: Date;
    approvals?: DocumentApproval[];
}

export enum DocumentType {
    DRAWING = 'drawing',
    SPECIFICATION = 'specification',
    CONTRACT = 'contract',
    PERMIT = 'permit',
    CERTIFICATE = 'certificate',
    REPORT = 'report',
    INVOICE = 'invoice',
    PHOTO = 'photo',
    VIDEO = 'video',
    CORRESPONDENCE = 'correspondence',
    OTHER = 'other',
}

export enum DocumentStatus {
    DRAFT = 'draft',
    UNDER_REVIEW = 'under_review',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    ARCHIVED = 'archived',
    EXPIRED = 'expired',
}

export interface DocumentMetadata {
    title?: string;
    description?: string;
    author?: string;
    subject?: string;
    keywords?: string[];
    createdDate?: Date;
    customFields?: Record<string, any>;
}

export interface DocumentPermission {
    userId?: string;
    roleId?: string;
    permission: 'view' | 'edit' | 'delete' | 'share';
}

export interface DocumentVersion {
    version: string;
    fileUrl: string;
    uploadedBy: string;
    uploadedAt: Date;
    changes?: string;
}

export interface DocumentApproval {
    id: string;
    approverId: string;
    approver?: User;
    status: 'pending' | 'approved' | 'rejected';
    comments?: string;
    approvedAt?: Date;
}

// ============================================
// QUALITY CONTROL
// ============================================

export interface QualityControl {
    id: string;
    projectId: string;
    type: QCType;
    title: string;
    description: string;
    location: string;
    scheduledDate: Date;
    completedDate?: Date;
    inspector: User;
    status: QCStatus;
    checkpoints: QCCheckpoint[];
    findings: QCFinding[];
    overallScore?: number;
    passedCheckpoints: number;
    totalCheckpoints: number;
    photos?: Attachment[];
    report?: Attachment;
    createdAt: Date;
    updatedAt: Date;
}

export enum QCType {
    MATERIAL_INSPECTION = 'material_inspection',
    WORKMANSHIP_INSPECTION = 'workmanship_inspection',
    SAFETY_INSPECTION = 'safety_inspection',
    FINAL_INSPECTION = 'final_inspection',
    PERIODIC_INSPECTION = 'periodic_inspection',
}

export enum QCStatus {
    SCHEDULED = 'scheduled',
    IN_PROGRESS = 'in_progress',
    PASSED = 'passed',
    FAILED = 'failed',
    CONDITIONAL_PASS = 'conditional_pass',
}

export interface QCCheckpoint {
    id: string;
    category: string;
    item: string;
    specification: string;
    actualValue?: string;
    passed: boolean;
    notes?: string;
    photos?: string[];
}

export interface QCFinding {
    id: string;
    severity: 'minor' | 'major' | 'critical';
    description: string;
    location: string;
    actionRequired: string;
    responsibleParty?: string;
    dueDate?: Date;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    resolvedAt?: Date;
    photos?: string[];
}

// ============================================
// SAFETY MANAGEMENT
// ============================================

export interface SafetyIncident {
    id: string;
    projectId: string;
    type: IncidentType;
    severity: IncidentSeverity;
    title: string;
    description: string;
    location: string;
    occurredAt: Date;
    reportedAt: Date;
    reportedBy: User;
    involvedPersons: IncidentPerson[];
    witnesses?: IncidentPerson[];
    injuries?: InjuryDetail[];
    rootCause?: string;
    correctiveActions: CorrectiveAction[];
    preventiveActions?: string[];
    status: IncidentStatus;
    investigationReport?: Attachment;
    photos?: Attachment[];
    closedAt?: Date;
    closedBy?: string;
}

export enum IncidentType {
    INJURY = 'injury',
    NEAR_MISS = 'near_miss',
    PROPERTY_DAMAGE = 'property_damage',
    ENVIRONMENTAL = 'environmental',
    SECURITY = 'security',
}

export enum IncidentSeverity {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical',
}

export interface IncidentPerson {
    name: string;
    role?: string;
    company?: string;
    contactInfo?: string;
}

export interface InjuryDetail {
    bodyPart: string;
    injuryType: string;
    treatment: string;
    medicalAttention: boolean;
    daysLost?: number;
}

export interface CorrectiveAction {
    id: string;
    description: string;
    responsiblePerson: string;
    dueDate: Date;
    completedDate?: Date;
    status: 'pending' | 'in_progress' | 'completed';
    verifiedBy?: string;
}

export enum IncidentStatus {
    REPORTED = 'reported',
    UNDER_INVESTIGATION = 'under_investigation',
    ACTIONS_PENDING = 'actions_pending',
    CLOSED = 'closed',
}

// ============================================
// SUB-CONTRACTOR MANAGEMENT
// ============================================

export interface SubContractor {
    id: string;
    name: string;
    companyName: string;
    taxNumber: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    specialization: string[];
    rating: number; // 0-5
    status: SubContractorStatus;
    contracts: SubContract[];
    certifications: Certification[];
    insurance: InsuranceInfo[];
    bankInfo: BankInfo;
    performanceHistory: PerformanceRecord[];
    documents?: Attachment[];
    createdAt: Date;
    updatedAt: Date;
}

export enum SubContractorStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    BLACKLISTED = 'blacklisted',
}

export interface SubContract {
    id: string;
    projectId: string;
    subContractorId: string;
    scope: string;
    value: number;
    startDate: Date;
    endDate: Date;
    status: ContractStatus;
    paymentTerms: string;
    retentionPercentage: number;
    payments: ContractPayment[];
    variations: ContractVariation[];
    documentUrl?: string;
}

export enum ContractStatus {
    DRAFT = 'draft',
    ACTIVE = 'active',
    COMPLETED = 'completed',
    TERMINATED = 'terminated',
}

export interface ContractPayment {
    id: string;
    amount: number;
    dueDate: Date;
    paidDate?: Date;
    status: 'pending' | 'paid' | 'overdue';
    invoiceNumber?: string;
}

export interface ContractVariation {
    id: string;
    description: string;
    amount: number;
    approvedDate?: Date;
    status: 'pending' | 'approved' | 'rejected';
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

export interface PerformanceRecord {
    projectId: string;
    projectName: string;
    rating: number;
    qualityScore: number;
    timelinessScore: number;
    safetyScore: number;
    comments?: string;
    completedDate: Date;
}

export interface BankInfo {
    bankName: string;
    branchName?: string;
    accountNumber: string;
    iban: string;
    swiftCode?: string;
}

// ============================================
// DAILY REPORTS
// ============================================

export interface DailyReport {
    id: string;
    projectId: string;
    date: Date;
    weather: WeatherCondition;
    workPerformed: WorkActivity[];
    manpower: ManpowerRecord[];
    equipment: EquipmentUsage[];
    materials: MaterialUsage[];
    visitors?: Visitor[];
    incidents?: string[];
    delays?: Delay[];
    photos?: Attachment[];
    notes?: string;
    submittedBy: User;
    submittedAt: Date;
    approvedBy?: string;
    approvedAt?: Date;
}

export interface WeatherCondition {
    condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';
    temperature: number;
    humidity?: number;
    windSpeed?: number;
    workImpact?: 'none' | 'minor' | 'major' | 'stopped';
}

export interface WorkActivity {
    description: string;
    location: string;
    progress: number;
    crew: number;
    hours: number;
    status: 'completed' | 'in_progress' | 'delayed';
}

export interface ManpowerRecord {
    category: string;
    count: number;
    hours: number;
    contractor?: string;
}

export interface EquipmentUsage {
    equipmentId: string;
    equipmentName: string;
    hours: number;
    operator?: string;
    notes?: string;
}

export interface MaterialUsage {
    materialId: string;
    materialName: string;
    quantity: number;
    unit: string;
    deliveryNote?: string;
}

export interface Visitor {
    name: string;
    company: string;
    purpose: string;
    timeIn: Date;
    timeOut?: Date;
}

export interface Delay {
    reason: string;
    duration: number; // hours
    impact: 'low' | 'medium' | 'high';
    mitigation?: string;
}
