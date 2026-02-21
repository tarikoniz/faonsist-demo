import { create } from 'zustand';
import { Channel, Message, ChannelType, TypingIndicator } from '@/types/messages';
import apiClient from '@/lib/api-client';

interface ChatState {
    // State
    channels: Channel[];
    activeChannel: Channel | null;
    messages: Record<string, Message[]>; // channelId -> messages
    typingUsers: TypingIndicator[];
    onlineUsers: Set<string>;
    isLoading: boolean;
    error: string | null;

    // Search & Filter
    searchQuery: string;
    filterType: ChannelType | 'all';

    // Actions
    setChannels: (channels: Channel[]) => void;
    addChannel: (channel: Channel) => void;
    updateChannel: (channelId: string, updates: Partial<Channel>) => void;
    removeChannel: (channelId: string) => void;
    setActiveChannel: (channel: Channel | null) => void;

    // Messages
    setMessages: (channelId: string, messages: Message[]) => void;
    addMessage: (channelId: string, message: Message) => void;
    updateMessage: (channelId: string, messageId: string, updates: Partial<Message>) => void;
    deleteMessage: (channelId: string, messageId: string) => void;

    // Typing
    setTyping: (indicator: TypingIndicator) => void;
    removeTyping: (userId: string, channelId: string) => void;

    // Online Status
    setUserOnline: (userId: string) => void;
    setUserOffline: (userId: string) => void;

    // Search & Filter
    setSearchQuery: (query: string) => void;
    setFilterType: (type: ChannelType | 'all') => void;

    // Utilities
    clearError: () => void;
    setLoading: (loading: boolean) => void;
    markChannelAsRead: (channelId: string) => void;

    // API Actions
    fetchChannels: () => Promise<void>;
    fetchMessages: (channelId: string) => Promise<void>;
    createChannel: (data: { name: string; type?: string; description?: string; isPrivate?: boolean }) => Promise<any>;
    sendMessage: (channelId: string, content: string) => Promise<any>;
}

export const useChatStore = create<ChatState>((set, get) => ({
    // Initial State
    channels: [],
    activeChannel: null,
    messages: {},
    typingUsers: [],
    onlineUsers: new Set(),
    isLoading: false,
    error: null,
    searchQuery: '',
    filterType: 'all',

    // Channel Actions
    setChannels: (channels) => set({ channels }),

    addChannel: (channel) =>
        set((state) => ({ channels: [...state.channels, channel] })),

    updateChannel: (channelId, updates) =>
        set((state) => ({
            channels: state.channels.map((ch) =>
                ch.id === channelId ? { ...ch, ...updates } : ch
            ),
        })),

    removeChannel: (channelId) =>
        set((state) => ({
            channels: state.channels.filter((ch) => ch.id !== channelId),
            activeChannel: state.activeChannel?.id === channelId ? null : state.activeChannel,
        })),

    setActiveChannel: (channel) => set({ activeChannel: channel }),

    // Message Actions
    setMessages: (channelId, messages) =>
        set((state) => ({
            messages: { ...state.messages, [channelId]: messages },
        })),

    addMessage: (channelId, message) =>
        set((state) => ({
            messages: {
                ...state.messages,
                [channelId]: [...(state.messages[channelId] || []), message],
            },
        })),

    updateMessage: (channelId, messageId, updates) =>
        set((state) => ({
            messages: {
                ...state.messages,
                [channelId]: (state.messages[channelId] || []).map((msg) =>
                    msg.id === messageId ? { ...msg, ...updates } : msg
                ),
            },
        })),

    deleteMessage: (channelId, messageId) =>
        set((state) => ({
            messages: {
                ...state.messages,
                [channelId]: (state.messages[channelId] || []).filter(
                    (msg) => msg.id !== messageId
                ),
            },
        })),

    // Typing Actions
    setTyping: (indicator) =>
        set((state) => {
            const existing = state.typingUsers.find(
                (t) => t.userId === indicator.userId && t.channelId === indicator.channelId
            );
            if (existing) return state;
            return { typingUsers: [...state.typingUsers, indicator] };
        }),

    removeTyping: (userId, channelId) =>
        set((state) => ({
            typingUsers: state.typingUsers.filter(
                (t) => !(t.userId === userId && t.channelId === channelId)
            ),
        })),

    // Online Status Actions
    setUserOnline: (userId) =>
        set((state) => {
            const newOnlineUsers = new Set(state.onlineUsers);
            newOnlineUsers.add(userId);
            return { onlineUsers: newOnlineUsers };
        }),

    setUserOffline: (userId) =>
        set((state) => {
            const newOnlineUsers = new Set(state.onlineUsers);
            newOnlineUsers.delete(userId);
            return { onlineUsers: newOnlineUsers };
        }),

    // Search & Filter Actions
    setSearchQuery: (query) => set({ searchQuery: query }),
    setFilterType: (type) => set({ filterType: type }),

    // Utility Actions
    clearError: () => set({ error: null }),
    setLoading: (loading) => set({ isLoading: loading }),

    markChannelAsRead: (channelId) =>
        set((state) => ({
            channels: state.channels.map((ch) =>
                ch.id === channelId ? { ...ch, unreadCount: 0 } : ch
            ),
        })),

    // API Actions
    fetchChannels: async () => {
        set({ isLoading: true, error: null });
        const res = await apiClient.get<any[]>('/api/channels');
        if (res.success) {
            // DB'den gelen kanalları Channel tipine map et
            const rawChannels: any[] = Array.isArray(res.data) ? res.data : [];
            const mapped = rawChannels.map((ch: any) => ({
                id: ch.id,
                name: ch.name || ch.legacyId || 'Kanal',
                type: (ch.type === 'dm' ? 'dm' : ch.type === 'group' ? 'group' : 'channel') as any,
                description: ch.description || '',
                isPrivate: ch.isPrivate || false,
                members: ch.members || [],
                createdBy: ch.createdBy || '',
                createdAt: ch.createdAt ? new Date(ch.createdAt) : new Date(),
                updatedAt: ch.updatedAt ? new Date(ch.updatedAt) : new Date(),
                unreadCount: 0,
            }));
            set({ channels: mapped as any, isLoading: false });
        } else {
            set({ error: res.error?.message || 'Kanallar yüklenemedi', isLoading: false });
        }
    },

    fetchMessages: async (channelId: string) => {
        set({ isLoading: true, error: null });
        const res = await apiClient.get<any[]>(`/api/channels/${channelId}/messages`);
        if (res.success) {
            // API mesajları desc sırayla döndürüyor — asc'e çevir
            // Ayrıca DB'deki 'text' alanını 'content'e map et
            const rawMessages: any[] = Array.isArray(res.data) ? res.data : [];
            const mapped: Message[] = rawMessages
                .reverse()
                .map((m: any): Message => ({
                    id: m.id,
                    channelId: m.channelId || channelId,
                    userId: m.userId || m.user_id || '',
                    user: m.user ? { name: m.user.name, id: m.user.id, avatar: m.user.avatar, email: '', role: 'employee' as any, status: 'online' as any, createdAt: new Date(), updatedAt: new Date() } : undefined,
                    content: m.content || m.text || '',
                    type: 'text' as any,
                    createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
                    updatedAt: m.updatedAt ? new Date(m.updatedAt) : new Date(),
                }));
            set((state) => ({
                messages: { ...state.messages, [channelId]: mapped },
                isLoading: false,
            }));
        } else {
            set({ error: res.error?.message || 'Mesajlar yüklenemedi', isLoading: false });
        }
    },

    createChannel: async (data: { name: string; type?: string; description?: string; isPrivate?: boolean }) => {
        set({ isLoading: true, error: null });
        const res = await apiClient.post<any>('/api/channels', data);
        if (res.success && res.data) {
            set((state) => ({ channels: [...state.channels, res.data], isLoading: false }));
            return res.data;
        } else {
            set({ error: res.error?.message || 'Kanal oluşturulamadı', isLoading: false });
            return null;
        }
    },

    sendMessage: async (channelId: string, content: string) => {
        const res = await apiClient.post<any>(`/api/channels/${channelId}/messages`, { content });
        if (res.success && res.data) {
            set((state) => ({
                messages: {
                    ...state.messages,
                    [channelId]: [...(state.messages[channelId] || []), res.data],
                },
            }));
            return res.data;
        }
        return null;
    },
}));
