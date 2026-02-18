// ============================================
// MESSAGES / CHAT TYPES
// ============================================

import { User, Attachment } from './index';

export interface Message {
    id: string;
    channelId: string;
    userId: string;
    user?: User;
    content: string;
    type: MessageType;
    attachments?: Attachment[];
    reactions?: Reaction[];
    threadId?: string;
    replyCount?: number;
    isPinned?: boolean;
    isEdited?: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

export enum MessageType {
    TEXT = 'text',
    FILE = 'file',
    IMAGE = 'image',
    VIDEO = 'video',
    AUDIO = 'audio',
    SYSTEM = 'system',
}

export interface Channel {
    id: string;
    name: string;
    type: ChannelType;
    description?: string;
    avatar?: string;
    members: ChannelMember[];
    isPrivate: boolean;
    isMuted?: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    lastMessage?: Message;
    unreadCount?: number;
}

export enum ChannelType {
    DM = 'dm',
    GROUP = 'group',
    CHANNEL = 'channel',
}

export interface ChannelMember {
    userId: string;
    user?: User;
    role: ChannelRole;
    joinedAt: Date;
    lastReadAt?: Date;
}

export enum ChannelRole {
    OWNER = 'owner',
    ADMIN = 'admin',
    MEMBER = 'member',
}

export interface Reaction {
    emoji: string;
    userIds: string[];
    count: number;
}

export interface TypingIndicator {
    channelId: string;
    userId: string;
    userName: string;
}
