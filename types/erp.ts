// ============================================
// ERP / PROJECT TYPES
// ============================================

import { User, Attachment, Note } from './index';

export interface Project {
    id: string;
    name: string;
    code: string;
    type: ProjectType;
    status: ProjectStatus;
    description?: string;
    startDate: Date;
    endDate: Date;
    actualEndDate?: Date;
    budget: number;
    actualCost: number;
    progress: number; // 0-100
    location: ProjectLocation;
    client?: Client;
    manager: User;
    team: ProjectMember[];
    milestones: Milestone[];
    tasks: Task[];
    documents: ProjectDocument[];
    createdAt: Date;
    updatedAt: Date;
}

export enum ProjectType {
    BUILDING = 'building',
    INFRASTRUCTURE = 'infrastructure',
    RENOVATION = 'renovation',
    INDUSTRIAL = 'industrial',
    RESIDENTIAL = 'residential',
    COMMERCIAL = 'commercial',
}

export enum ProjectStatus {
    PLANNING = 'planning',
    ACTIVE = 'active',
    ON_HOLD = 'on-hold',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

export interface ProjectLocation {
    address: string;
    city?: string;
    district?: string;
    country?: string;
    coordinates?: [number, number]; // [lat, lng]
}

export interface Client {
    id: string;
    name: string;
    companyName?: string;
    email: string;
    phone?: string;
    address?: string;
    contactPerson?: string;
}

export interface ProjectMember {
    userId: string;
    user?: User;
    role: ProjectRole;
    assignedAt: Date;
}

export enum ProjectRole {
    MANAGER = 'manager',
    ENGINEER = 'engineer',
    ARCHITECT = 'architect',
    FOREMAN = 'foreman',
    WORKER = 'worker',
    CONSULTANT = 'consultant',
}

export interface Milestone {
    id: string;
    projectId: string;
    name: string;
    description?: string;
    targetDate: Date;
    completionDate?: Date;
    progress: number;
    status: MilestoneStatus;
    dependencies: string[];
    deliverables: string[];
}

export enum MilestoneStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in-progress',
    COMPLETED = 'completed',
    DELAYED = 'delayed',
}

export interface Task {
    id: string;
    projectId: string;
    milestoneId?: string;
    title: string;
    description?: string;
    priority: TaskPriority;
    status: TaskStatus;
    assigneeId?: string;
    assignee?: User;
    dueDate?: Date;
    estimatedHours?: number;
    actualHours?: number;
    checklist?: ChecklistItem[];
    createdAt: Date;
    updatedAt: Date;
}

export enum TaskPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    URGENT = 'urgent',
}

export enum TaskStatus {
    TODO = 'todo',
    IN_PROGRESS = 'in-progress',
    REVIEW = 'review',
    DONE = 'done',
    BLOCKED = 'blocked',
}

export interface ChecklistItem {
    id: string;
    text: string;
    isCompleted: boolean;
}

export interface ProjectDocument {
    id: string;
    projectId: string;
    name: string;
    type: DocumentType;
    url: string;
    version: string;
    uploadedBy: string;
    uploadedAt: Date;
    size: number;
}

export enum DocumentType {
    DRAWING = 'drawing',
    PERMIT = 'permit',
    CONTRACT = 'contract',
    REPORT = 'report',
    INVOICE = 'invoice',
    PHOTO = 'photo',
    OTHER = 'other',
}

export interface BudgetItem {
    id: string;
    projectId: string;
    category: string;
    description: string;
    plannedAmount: number;
    actualAmount: number;
    date: Date;
}

export interface HakEdis {
    id: string;
    projectId: string;
    period: string;
    number: number;
    amount: number;
    status: HakEdisStatus;
    items: HakEdisItem[];
    submittedAt?: Date;
    approvedAt?: Date;
}

export enum HakEdisStatus {
    DRAFT = 'draft',
    SUBMITTED = 'submitted',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    PAID = 'paid',
}

export interface HakEdisItem {
    id: string;
    description: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    previousQuantity: number;
    currentQuantity: number;
}
