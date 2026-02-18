// ============================================
// CRM TYPES
// ============================================

import { User, ContactInfo, Note, Attachment } from './index';

export interface Lead {
    id: string;
    source: LeadSource;
    status: LeadStatus;
    score: number; // 0-100
    contactInfo: ContactInfo & { name: string };
    company?: string;
    industry?: string;
    budget?: number;
    budgetCurrency?: string;
    timeline?: string;
    interest?: string;
    assignedTo?: User;
    notes: Note[];
    activities: Activity[];
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    convertedAt?: Date;
    customerId?: string; // If converted to customer
}

export enum LeadSource {
    WEBSITE = 'website',
    REFERRAL = 'referral',
    CAMPAIGN = 'campaign',
    SOCIAL_MEDIA = 'social_media',
    COLD_CALL = 'cold_call',
    TRADE_SHOW = 'trade_show',
    PARTNER = 'partner',
    MANUAL = 'manual',
    OTHER = 'other',
}

export enum LeadStatus {
    NEW = 'new',
    CONTACTED = 'contacted',
    QUALIFIED = 'qualified',
    PROPOSAL_SENT = 'proposal_sent',
    NEGOTIATION = 'negotiation',
    CONVERTED = 'converted',
    LOST = 'lost',
    ARCHIVED = 'archived',
}

export interface Customer {
    id: string;
    type: CustomerType;
    name: string;
    companyName?: string;
    taxNumber?: string;
    contactInfo: ContactInfo;
    billingAddress?: Address;
    shippingAddress?: Address;
    industry?: string;
    size?: CompanySize;
    segment?: CustomerSegment;
    lifetimeValue: number;
    totalDeals: number;
    wonDeals: number;
    assignedTo?: User;
    contacts: Contact[];
    deals: Deal[];
    activities: Activity[];
    notes: Note[];
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

export enum CustomerType {
    INDIVIDUAL = 'individual',
    COMPANY = 'company',
    GOVERNMENT = 'government',
}

export enum CompanySize {
    MICRO = 'micro', // 1-9
    SMALL = 'small', // 10-49
    MEDIUM = 'medium', // 50-249
    LARGE = 'large', // 250+
    ENTERPRISE = 'enterprise', // 1000+
}

export enum CustomerSegment {
    VIP = 'vip',
    PREMIUM = 'premium',
    STANDARD = 'standard',
    BASIC = 'basic',
}

export interface Address {
    street: string;
    city: string;
    district?: string;
    postalCode?: string;
    country: string;
}

export interface Contact {
    id: string;
    customerId: string;
    name: string;
    title?: string;
    department?: string;
    email?: string;
    phone?: string;
    mobile?: string;
    isPrimary: boolean;
    notes?: string;
}

export interface Deal {
    id: string;
    customerId: string;
    customer?: Customer;
    title: string;
    description?: string;
    value: number;
    currency: string;
    stage: DealStage;
    probability: number; // 0-100
    expectedCloseDate: Date;
    actualCloseDate?: Date;
    products: DealProduct[];
    competitors?: string[];
    lostReason?: string;
    wonReason?: string;
    owner: User;
    activities: Activity[];
    notes: Note[];
    attachments: Attachment[];
    createdAt: Date;
    updatedAt: Date;
}

export enum DealStage {
    PROSPECTING = 'prospecting',
    QUALIFICATION = 'qualification',
    NEEDS_ANALYSIS = 'needs_analysis',
    PROPOSAL = 'proposal',
    NEGOTIATION = 'negotiation',
    CLOSED_WON = 'closed-won',
    CLOSED_LOST = 'closed-lost',
}

export interface DealProduct {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    totalPrice: number;
}

export interface Activity {
    id: string;
    type: ActivityType;
    subject: string;
    description?: string;
    date: Date;
    duration?: number; // minutes
    outcome?: string;
    createdBy: string;
    leadId?: string;
    customerId?: string;
    dealId?: string;
    contactId?: string;
}

export enum ActivityType {
    CALL = 'call',
    EMAIL = 'email',
    MEETING = 'meeting',
    NOTE = 'note',
    TASK = 'task',
    SMS = 'sms',
    VISIT = 'visit',
    DEMO = 'demo',
    PROPOSAL = 'proposal',
}

export interface Pipeline {
    id: string;
    name: string;
    stages: PipelineStage[];
    isDefault: boolean;
}

export interface PipelineStage {
    id: string;
    name: string;
    order: number;
    probability: number;
    color: string;
}

// Dashboard Stats
export interface CRMStats {
    totalLeads: number;
    newLeadsThisMonth: number;
    conversionRate: number;
    totalCustomers: number;
    activeDeals: number;
    totalDealValue: number;
    wonDealsThisMonth: number;
    wonValueThisMonth: number;
    avgDealSize: number;
    avgSalesCycle: number; // days
}
