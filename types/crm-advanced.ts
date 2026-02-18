// ============================================
// ADVANCED CRM TYPES - Enterprise Customer Relationship Management
// ============================================

import { User, Attachment, Note, ContactInfo } from './index';
import { Lead, Customer, Deal, Activity } from './crm';

// ============================================
// EMAIL INTEGRATION
// ============================================

export interface EmailAccount {
    id: string;
    userId: string;
    email: string;
    provider: 'gmail' | 'outlook' | 'exchange' | 'imap';
    isConnected: boolean;
    lastSyncedAt?: Date;
    settings: EmailSettings;
}

export interface EmailSettings {
    syncEnabled: boolean;
    syncFrequency: number; // minutes
    autoLinkToContacts: boolean;
    autoLinkToDeals: boolean;
    trackOpens: boolean;
    trackClicks: boolean;
}

export interface Email {
    id: string;
    accountId: string;
    messageId: string;
    threadId?: string;
    from: EmailAddress;
    to: EmailAddress[];
    cc?: EmailAddress[];
    bcc?: EmailAddress[];
    subject: string;
    body: string;
    bodyHtml?: string;
    sentAt: Date;
    receivedAt?: Date;
    isRead: boolean;
    labels?: string[];
    attachments?: EmailAttachment[];
    linkedContacts?: string[];
    linkedDeals?: string[];
    linkedLeads?: string[];
    tracking?: EmailTracking;
}

export interface EmailAddress {
    name?: string;
    email: string;
}

export interface EmailAttachment {
    id: string;
    filename: string;
    mimeType: string;
    size: number;
    url: string;
}

export interface EmailTracking {
    opens: EmailOpen[];
    clicks: EmailClick[];
    firstOpenedAt?: Date;
    lastOpenedAt?: Date;
    totalOpens: number;
    totalClicks: number;
}

export interface EmailOpen {
    openedAt: Date;
    ipAddress?: string;
    userAgent?: string;
    location?: string;
}

export interface EmailClick {
    clickedAt: Date;
    url: string;
    ipAddress?: string;
    userAgent?: string;
}

// Email Templates
export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    bodyHtml?: string;
    category: string;
    variables: TemplateVariable[];
    attachments?: Attachment[];
    isActive: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface TemplateVariable {
    key: string;
    label: string;
    defaultValue?: string;
    required: boolean;
}

// ============================================
// CALL LOGGING
// ============================================

export interface CallLog {
    id: string;
    type: 'inbound' | 'outbound';
    status: CallLogStatus;
    phoneNumber: string;
    contactId?: string;
    customer?: Customer;
    leadId?: string;
    dealId?: string;
    userId: string;
    user?: User;
    startTime: Date;
    endTime?: Date;
    duration?: number; // seconds
    recordingUrl?: string;
    notes?: string;
    outcome?: CallOutcome;
    followUpRequired: boolean;
    followUpDate?: Date;
    tags?: string[];
    createdAt: Date;
}

export enum CallLogStatus {
    COMPLETED = 'completed',
    MISSED = 'missed',
    VOICEMAIL = 'voicemail',
    BUSY = 'busy',
    NO_ANSWER = 'no_answer',
}

export enum CallOutcome {
    INTERESTED = 'interested',
    NOT_INTERESTED = 'not_interested',
    CALLBACK_REQUESTED = 'callback_requested',
    MEETING_SCHEDULED = 'meeting_scheduled',
    INFORMATION_PROVIDED = 'information_provided',
    COMPLAINT = 'complaint',
    OTHER = 'other',
}

// ============================================
// MEETING NOTES
// ============================================

export interface MeetingNote {
    id: string;
    title: string;
    meetingDate: Date;
    attendees: MeetingAttendee[];
    location?: string;
    duration?: number; // minutes
    agenda?: string[];
    discussion: string;
    decisions?: Decision[];
    actionItems: ActionItem[];
    nextSteps?: string[];
    attachments?: Attachment[];
    linkedDeals?: string[];
    linkedContacts?: string[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface MeetingAttendee {
    type: 'internal' | 'external';
    userId?: string;
    contactId?: string;
    name: string;
    email?: string;
    role?: string;
}

export interface Decision {
    id: string;
    description: string;
    decidedBy?: string;
    impact?: 'low' | 'medium' | 'high';
}

export interface ActionItem {
    id: string;
    description: string;
    assignedTo: string;
    assignee?: User;
    dueDate?: Date;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    completedAt?: Date;
}

// ============================================
// PROPOSAL GENERATOR
// ============================================

export interface Proposal {
    id: string;
    dealId: string;
    deal?: Deal;
    customerId: string;
    customer?: Customer;
    title: string;
    version: string;
    status: ProposalStatus;
    validUntil: Date;
    sections: ProposalSection[];
    items: ProposalItem[];
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    currency: string;
    terms?: string;
    notes?: string;
    template?: ProposalTemplate;
    generatedPdfUrl?: string;
    sentAt?: Date;
    viewedAt?: Date;
    acceptedAt?: Date;
    rejectedAt?: Date;
    rejectionReason?: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export enum ProposalStatus {
    DRAFT = 'draft',
    SENT = 'sent',
    VIEWED = 'viewed',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    EXPIRED = 'expired',
}

export interface ProposalSection {
    id: string;
    title: string;
    content: string;
    order: number;
}

export interface ProposalItem {
    id: string;
    productId?: string;
    name: string;
    description?: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    discount?: number;
    taxRate: number;
    totalPrice: number;
}

export interface ProposalTemplate {
    id: string;
    name: string;
    sections: ProposalSection[];
    headerHtml?: string;
    footerHtml?: string;
    styling?: Record<string, any>;
    isDefault: boolean;
}

// ============================================
// CONTRACT MANAGEMENT
// ============================================

export interface Contract {
    id: string;
    customerId: string;
    customer?: Customer;
    dealId?: string;
    proposalId?: string;
    contractNumber: string;
    title: string;
    type: ContractType;
    status: ContractStatus;
    value: number;
    currency: string;
    startDate: Date;
    endDate: Date;
    autoRenew: boolean;
    renewalTerms?: string;
    paymentTerms: PaymentTerms;
    deliverables: Deliverable[];
    milestones: ContractMilestone[];
    sla?: ServiceLevelAgreement;
    terms: string;
    documentUrl?: string;
    signedDocumentUrl?: string;
    signatures: ContractSignature[];
    amendments?: ContractAmendment[];
    renewalHistory?: ContractRenewal[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export enum ContractType {
    SERVICE = 'service',
    PRODUCT = 'product',
    SUBSCRIPTION = 'subscription',
    MAINTENANCE = 'maintenance',
    CONSULTING = 'consulting',
    PARTNERSHIP = 'partnership',
}

export enum ContractStatus {
    DRAFT = 'draft',
    PENDING_SIGNATURE = 'pending_signature',
    ACTIVE = 'active',
    EXPIRED = 'expired',
    TERMINATED = 'terminated',
    RENEWED = 'renewed',
}

export interface PaymentTerms {
    method: 'upfront' | 'milestone' | 'monthly' | 'quarterly' | 'annual';
    dueInDays: number;
    lateFeePercentage?: number;
    earlyPaymentDiscount?: number;
}

export interface Deliverable {
    id: string;
    name: string;
    description?: string;
    dueDate: Date;
    deliveredDate?: Date;
    status: 'pending' | 'in_progress' | 'delivered' | 'accepted' | 'rejected';
    acceptedBy?: string;
    acceptedAt?: Date;
}

export interface ContractMilestone {
    id: string;
    name: string;
    description?: string;
    dueDate: Date;
    completedDate?: Date;
    paymentAmount?: number;
    status: 'pending' | 'completed' | 'overdue';
}

export interface ServiceLevelAgreement {
    responseTime: number; // hours
    resolutionTime: number; // hours
    uptime: number; // percentage
    penalties?: SLAPenalty[];
}

export interface SLAPenalty {
    condition: string;
    penalty: number;
    type: 'percentage' | 'fixed';
}

export interface ContractSignature {
    signedBy: string;
    signerName: string;
    signerTitle?: string;
    signedAt: Date;
    ipAddress?: string;
    documentHash?: string;
}

export interface ContractAmendment {
    id: string;
    description: string;
    changes: string;
    effectiveDate: Date;
    approvedBy: string;
    approvedAt: Date;
    documentUrl?: string;
}

export interface ContractRenewal {
    id: string;
    previousContractId: string;
    renewedAt: Date;
    newEndDate: Date;
    valueChange?: number;
    termsChanged: boolean;
}

// ============================================
// CUSTOMER PORTAL
// ============================================

export interface CustomerPortalAccess {
    id: string;
    customerId: string;
    userId: string;
    email: string;
    role: PortalRole;
    isActive: boolean;
    lastLoginAt?: Date;
    permissions: PortalPermission[];
    createdAt: Date;
}

export enum PortalRole {
    ADMIN = 'admin',
    USER = 'user',
    VIEWER = 'viewer',
}

export interface PortalPermission {
    resource: 'invoices' | 'contracts' | 'tickets' | 'documents' | 'reports';
    actions: ('view' | 'create' | 'edit' | 'delete')[];
}

export interface SupportTicket {
    id: string;
    ticketNumber: string;
    customerId: string;
    customer?: Customer;
    contactId?: string;
    subject: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
    status: TicketStatus;
    assignedTo?: string;
    assignee?: User;
    responses: TicketResponse[];
    attachments?: Attachment[];
    slaDeadline?: Date;
    resolvedAt?: Date;
    closedAt?: Date;
    satisfaction?: CustomerSatisfaction;
    createdAt: Date;
    updatedAt: Date;
}

export enum TicketCategory {
    TECHNICAL = 'technical',
    BILLING = 'billing',
    GENERAL = 'general',
    FEATURE_REQUEST = 'feature_request',
    BUG_REPORT = 'bug_report',
}

export enum TicketPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    URGENT = 'urgent',
}

export enum TicketStatus {
    NEW = 'new',
    OPEN = 'open',
    IN_PROGRESS = 'in_progress',
    WAITING_CUSTOMER = 'waiting_customer',
    RESOLVED = 'resolved',
    CLOSED = 'closed',
}

export interface TicketResponse {
    id: string;
    userId?: string;
    user?: User;
    message: string;
    isInternal: boolean;
    attachments?: Attachment[];
    createdAt: Date;
}

export interface CustomerSatisfaction {
    rating: number; // 1-5
    feedback?: string;
    submittedAt: Date;
}

// ============================================
// MARKETING AUTOMATION
// ============================================

export interface Campaign {
    id: string;
    name: string;
    type: CampaignType;
    status: CampaignStatus;
    objective: string;
    targetAudience: AudienceSegment;
    budget?: number;
    startDate: Date;
    endDate?: Date;
    channels: MarketingChannel[];
    content: CampaignContent[];
    metrics: CampaignMetrics;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export enum CampaignType {
    EMAIL = 'email',
    SMS = 'sms',
    SOCIAL_MEDIA = 'social_media',
    WEBINAR = 'webinar',
    EVENT = 'event',
    CONTENT = 'content',
    MULTI_CHANNEL = 'multi_channel',
}

export enum CampaignStatus {
    DRAFT = 'draft',
    SCHEDULED = 'scheduled',
    ACTIVE = 'active',
    PAUSED = 'paused',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

export interface AudienceSegment {
    id: string;
    name: string;
    criteria: SegmentCriteria[];
    size?: number;
}

export interface SegmentCriteria {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
    value: any;
}

export enum MarketingChannel {
    EMAIL = 'email',
    SMS = 'sms',
    WHATSAPP = 'whatsapp',
    FACEBOOK = 'facebook',
    INSTAGRAM = 'instagram',
    LINKEDIN = 'linkedin',
    TWITTER = 'twitter',
    GOOGLE_ADS = 'google_ads',
}

export interface CampaignContent {
    id: string;
    channel: MarketingChannel;
    subject?: string;
    message: string;
    mediaUrls?: string[];
    ctaText?: string;
    ctaUrl?: string;
    scheduledFor?: Date;
    sentAt?: Date;
}

export interface CampaignMetrics {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
    bounced: number;
    unsubscribed: number;
    revenue?: number;
    roi?: number;
}

// ============================================
// LEAD SCORING AI
// ============================================

export interface LeadScore {
    leadId: string;
    score: number; // 0-100
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    factors: ScoreFactor[];
    predictedConversionProbability: number; // 0-1
    recommendedActions: string[];
    lastCalculatedAt: Date;
}

export interface ScoreFactor {
    category: string;
    factor: string;
    value: any;
    points: number;
    weight: number;
}

export interface LeadScoringModel {
    id: string;
    name: string;
    isActive: boolean;
    rules: ScoringRule[];
    weights: Record<string, number>;
    threshold: {
        hot: number;
        warm: number;
        cold: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface ScoringRule {
    id: string;
    category: string;
    condition: string;
    points: number;
    isActive: boolean;
}

// ============================================
// ADVANCED ANALYTICS
// ============================================

export interface SalesForecast {
    period: 'month' | 'quarter' | 'year';
    startDate: Date;
    endDate: Date;
    predictedRevenue: number;
    confidence: number; // 0-1
    breakdown: ForecastBreakdown[];
    assumptions: string[];
    generatedAt: Date;
}

export interface ForecastBreakdown {
    category: string;
    amount: number;
    probability: number;
    deals: string[];
}

export interface CustomerLifetimeValue {
    customerId: string;
    currentValue: number;
    predictedValue: number;
    averageOrderValue: number;
    purchaseFrequency: number;
    customerLifespan: number; // months
    churnProbability: number; // 0-1
    segment: string;
    calculatedAt: Date;
}

export interface ChurnPrediction {
    customerId: string;
    churnProbability: number; // 0-1
    riskLevel: 'low' | 'medium' | 'high';
    factors: ChurnFactor[];
    recommendedActions: string[];
    calculatedAt: Date;
}

export interface ChurnFactor {
    factor: string;
    impact: number;
    trend: 'increasing' | 'decreasing' | 'stable';
}
