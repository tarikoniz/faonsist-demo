'use client';

import { useChatStore } from '@/lib/store/chat';
import { Channel, ChannelType, Message, MessageType } from '@/types/messages';
import { useCallback, useMemo } from 'react';

export function useChat() {
    const store = useChatStore();

    // Filtered channels based on search and filter
    const filteredChannels = useMemo(() => {
        let channels = store.channels;

        // Filter by type
        if (store.filterType !== 'all') {
            channels = channels.filter((ch) => ch.type === store.filterType);
        }

        // Filter by search query
        if (store.searchQuery) {
            const query = store.searchQuery.toLowerCase();
            channels = channels.filter(
                (ch) =>
                    ch.name.toLowerCase().includes(query) ||
                    ch.description?.toLowerCase().includes(query)
            );
        }

        return channels;
    }, [store.channels, store.filterType, store.searchQuery]);

    // Get messages for active channel
    const activeMessages = useMemo(() => {
        if (!store.activeChannel) return [];
        return store.messages[store.activeChannel.id] || [];
    }, [store.activeChannel, store.messages]);

    // Check if a user is typing in active channel
    const typingInActiveChannel = useMemo(() => {
        if (!store.activeChannel) return [];
        return store.typingUsers.filter((t) => t.channelId === store.activeChannel?.id);
    }, [store.activeChannel, store.typingUsers]);

    // Send message
    const sendMessage = useCallback(
        (content: string, attachments?: string[]) => {
            if (!store.activeChannel) return;

            const newMessage: Message = {
                id: crypto.randomUUID(),
                channelId: store.activeChannel.id,
                userId: '1', // Current user - should come from auth store
                content,
                type: MessageType.TEXT,
                attachments: attachments?.map((url, index) => ({
                    id: `att-${index}`,
                    name: `Attachment ${index + 1}`,
                    url,
                    type: 'file',
                    size: 0,
                    uploadedBy: '1',
                    uploadedAt: new Date(),
                })),
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            store.addMessage(store.activeChannel.id, newMessage);

            // Update channel's last message
            store.updateChannel(store.activeChannel.id, {
                lastMessage: newMessage,
                updatedAt: new Date(),
            });
        },
        [store]
    );

    // Create new channel
    const createChannel = useCallback(
        (name: string, type: ChannelType, memberIds: string[], isPrivate = false) => {
            const newChannel: Channel = {
                id: crypto.randomUUID(),
                name,
                type,
                isPrivate,
                members: memberIds.map((userId) => ({
                    userId,
                    role: 'member' as any,
                    joinedAt: new Date(),
                })),
                createdBy: '1', // Current user
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            store.addChannel(newChannel);
            return newChannel;
        },
        [store]
    );

    // Get unread count across all channels
    const totalUnreadCount = useMemo(() => {
        return store.channels.reduce((sum, ch) => sum + (ch.unreadCount || 0), 0);
    }, [store.channels]);

    // Check if user is online
    const isUserOnline = useCallback(
        (userId: string) => store.onlineUsers.has(userId),
        [store.onlineUsers]
    );

    return {
        // State
        channels: store.channels,
        filteredChannels,
        activeChannel: store.activeChannel,
        activeMessages,
        typingUsers: typingInActiveChannel,
        isLoading: store.isLoading,
        error: store.error,
        searchQuery: store.searchQuery,
        filterType: store.filterType,
        totalUnreadCount,

        // Actions
        setActiveChannel: store.setActiveChannel,
        sendMessage,
        createChannel,
        setSearchQuery: store.setSearchQuery,
        setFilterType: store.setFilterType,
        markChannelAsRead: store.markChannelAsRead,
        isUserOnline,
        setTyping: store.setTyping,
        removeTyping: store.removeTyping,
    };
}
