// ============================================
// ADVANCED MESSAGING TYPES
// ============================================

import { User, Attachment } from './index';
import { Message, Channel } from './messages';

// Message Thread
export interface MessageThread {
    id: string;
    parentMessageId: string;
    messages: Message[];
    participantCount: number;
    lastReplyAt: Date;
}

// Rich Message Content
export interface RichMessageContent {
    text?: string;
    mentions?: Mention[];
    links?: Link[];
    codeBlocks?: CodeBlock[];
    formatting?: TextFormatting[];
}

export interface Mention {
    userId: string;
    userName: string;
    startIndex: number;
    endIndex: number;
}

export interface Link {
    url: string;
    title?: string;
    description?: string;
    image?: string;
    startIndex: number;
    endIndex: number;
}

export interface CodeBlock {
    language: string;
    code: string;
    startIndex: number;
    endIndex: number;
}

export interface TextFormatting {
    type: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code';
    startIndex: number;
    endIndex: number;
}

// Video/Audio Call
export interface Call {
    id: string;
    type: 'video' | 'audio';
    status: CallStatus;
    channelId?: string;
    participants: CallParticipant[];
    initiatorId: string;
    startedAt?: Date;
    endedAt?: Date;
    duration?: number; // seconds
    recordingUrl?: string;
}

export enum CallStatus {
    RINGING = 'ringing',
    ONGOING = 'ongoing',
    ENDED = 'ended',
    MISSED = 'missed',
    DECLINED = 'declined',
}

export interface CallParticipant {
    userId: string;
    user?: User;
    joinedAt?: Date;
    leftAt?: Date;
    isMuted: boolean;
    isVideoOn: boolean;
    isScreenSharing: boolean;
}

// Meeting
export interface Meeting {
    id: string;
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    location?: string;
    meetingLink?: string;
    organizer: User;
    attendees: MeetingAttendee[];
    agenda?: string[];
    notes?: string;
    recordings?: Attachment[];
    status: MeetingStatus;
    channelId?: string;
    reminders: MeetingReminder[];
    createdAt: Date;
    updatedAt: Date;
}

export enum MeetingStatus {
    SCHEDULED = 'scheduled',
    IN_PROGRESS = 'in-progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

export interface MeetingAttendee {
    userId: string;
    user?: User;
    status: AttendeeStatus;
    responseAt?: Date;
}

export enum AttendeeStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    DECLINED = 'declined',
    TENTATIVE = 'tentative',
}

export interface MeetingReminder {
    id: string;
    minutesBefore: number;
    sentAt?: Date;
}

// Message Reactions - Extended from base
export interface ReactionExtended {
    id: string;
    messageId: string;
    emoji: string;
    userId: string;
    user?: User;
    createdAt: Date;
}

// Starred Messages
export interface StarredMessage {
    id: string;
    messageId: string;
    userId: string;
    message?: Message;
    starredAt: Date;
    note?: string;
}

// Message Forwarding
export interface ForwardedMessage {
    originalMessageId: string;
    originalChannelId: string;
    originalSenderId: string;
    forwardedAt: Date;
    forwardedBy: string;
}

// File Preview
export interface FilePreview {
    fileId: string;
    type: 'image' | 'video' | 'audio' | 'document' | 'pdf';
    thumbnailUrl?: string;
    previewUrl?: string;
    metadata: FileMetadata;
}

export interface FileMetadata {
    width?: number;
    height?: number;
    duration?: number;
    pageCount?: number;
    fileSize: number;
    mimeType: string;
}

// Channel Settings (Extended)
export interface ChannelSettings {
    id: string;
    channelId: string;
    allowThreads: boolean;
    allowReactions: boolean;
    allowFileUploads: boolean;
    allowCalls: boolean;
    maxFileSize: number;
    retentionDays?: number;
    notificationLevel: NotificationLevel;
    pinnedMessages: string[];
    customEmojis: CustomEmoji[];
}

export enum NotificationLevel {
    ALL = 'all',
    MENTIONS = 'mentions',
    NONE = 'none',
}

export interface CustomEmoji {
    id: string;
    name: string;
    imageUrl: string;
    createdBy: string;
    createdAt: Date;
}

// Message Search
export interface MessageSearchQuery {
    query: string;
    channelIds?: string[];
    fromUserId?: string;
    hasAttachments?: boolean;
    dateFrom?: Date;
    dateTo?: Date;
    hasReactions?: boolean;
    isStarred?: boolean;
}

export interface MessageSearchResult {
    message: Message;
    channel: Channel;
    highlights: string[];
    score: number;
}

// Channel Analytics
export interface ChannelAnalytics {
    channelId: string;
    messageCount: number;
    activeUsers: number;
    averageResponseTime: number; // minutes
    peakHours: number[];
    topContributors: { userId: string; messageCount: number }[];
    filesSent: number;
    totalFileSize: number;
    period: { start: Date; end: Date };
}

// Re-export base types
export * from './messages';
