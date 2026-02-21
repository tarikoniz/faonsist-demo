'use client';

// ============================================
// useSocketChat — Socket.IO gerçek zamanlı
// mesajlaşma hook'u
// Railway'deki Socket.IO sunucusuna bağlanır,
// message:new ve typing eventlerini dinler
// ============================================

import { useEffect, useRef, useCallback } from 'react';
import socketClient from '@/lib/socket';
import { useChatStore } from '@/lib/store/chat';
import { useAuthStore } from '@/lib/store/auth';
import { Message, MessageType } from '@/types/messages';
import { CHAT } from '@/lib/constants';

export function useSocketChat(activeChannelId: string | null) {
  const { addMessage, setTyping, removeTyping } = useChatStore();
  const { user } = useAuthStore();

  // Typing state ref'ler (closure sorunlarını önlemek için)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const activeChannelIdRef = useRef<string | null>(null);
  const joinedChannelRef = useRef<string | null>(null);

  // activeChannelId değişince ref'i de güncelle
  useEffect(() => {
    activeChannelIdRef.current = activeChannelId;
  }, [activeChannelId]);

  // ---- Socket bağlantısı (bir kez) ----
  useEffect(() => {
    socketClient.connect();
  }, []);

  // ---- Kanal değişince: leave eski, join yeni ----
  useEffect(() => {
    if (!activeChannelId) return;

    // Önceki kanaldan ayrıl
    if (joinedChannelRef.current && joinedChannelRef.current !== activeChannelId) {
      socketClient.leaveChannel(joinedChannelRef.current);
    }

    // Yeni kanala katıl
    socketClient.joinChannel(activeChannelId);
    joinedChannelRef.current = activeChannelId;

    return () => {
      if (activeChannelId) {
        socketClient.leaveChannel(activeChannelId);
        joinedChannelRef.current = null;
      }
    };
  }, [activeChannelId]);

  // ---- Gelen mesajları dinle ----
  useEffect(() => {
    if (!activeChannelId) return;

    const handleNewMessage = (data: any) => {
      const currentChannelId = activeChannelIdRef.current;
      if (!currentChannelId) return;

      // Sadece aktif kanalın mesajlarını işle
      const msgChannelId = String(data.channelId || data.channel_id || '');
      if (msgChannelId !== currentChannelId && msgChannelId !== '') {
        // channelId farklıysa skip et
        return;
      }

      // Mevcut mesajlar içinde duplicate var mı kontrol et
      const currentMessages = useChatStore.getState().messages[currentChannelId] || [];
      const alreadyExists = currentMessages.some(
        (m) => m.id === data.id || (data.tempId && m.id === String(data.tempId))
      );
      if (alreadyExists) return;

      // Message tipine dönüştür
      const newMessage: Message = {
        id: data.id || String(Date.now()),
        channelId: currentChannelId,
        userId: data.userId || data.user_id || 'unknown',
        user: { name: data.user || data.userName || 'Bilinmiyor', id: data.userId || '' } as any,
        content: data.text || data.content || '',
        type: MessageType.TEXT,
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
        updatedAt: new Date(),
      };

      addMessage(currentChannelId, newMessage);
    };

    socketClient.onMessageReceived(handleNewMessage);

    return () => {
      socketClient.off('message:new', handleNewMessage);
    };
  }, [activeChannelId, addMessage]);

  // ---- Typing indicator dinle ----
  useEffect(() => {
    if (!activeChannelId) return;

    const handleUserTyping = (data: { userId: string; channelId: string; userName: string }) => {
      const currentChannelId = activeChannelIdRef.current;
      if (!currentChannelId) return;
      if (data.channelId !== currentChannelId) return;
      if (data.userId === user?.id) return; // Kendimizi gösterme

      setTyping({
        channelId: currentChannelId,
        userId: data.userId,
        userName: data.userName || (data as any).name || 'Bilinmiyor',
      });

      // 4 saniye sonra otomatik kaldır
      setTimeout(() => {
        removeTyping(data.userId, currentChannelId);
      }, 4000);
    };

    const handleUserStoppedTyping = (data: { userId: string; channelId: string }) => {
      const currentChannelId = activeChannelIdRef.current;
      if (!currentChannelId) return;
      if (data.channelId !== currentChannelId) return;
      removeTyping(data.userId, currentChannelId);
    };

    socketClient.onUserTyping(handleUserTyping);
    socketClient.onUserStoppedTyping(handleUserStoppedTyping);

    return () => {
      socketClient.off('user:typing', handleUserTyping);
      socketClient.off('user:stopped-typing', handleUserStoppedTyping);
    };
  }, [activeChannelId, user?.id, setTyping, removeTyping]);

  // ---- İç typing stop (ref üzerinden — closure sorunlarını önler) ----
  const doStopTyping = useCallback(() => {
    const channelId = activeChannelIdRef.current;
    if (!channelId) return;

    if (isTypingRef.current) {
      isTypingRef.current = false;
      socketClient.stopTyping(channelId);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, []);

  // ---- Mesaj gönder (Socket.IO üzerinden) ----
  const sendSocketMessage = useCallback(
    (text: string, replyTo?: any) => {
      const channelId = activeChannelIdRef.current;
      if (!channelId || !text.trim()) return;

      const tempId = Date.now();

      // Optimistic update — kendi mesajımızı hemen göster
      const optimisticMessage: Message = {
        id: String(tempId),
        channelId,
        userId: user?.id || 'me',
        user: { name: user?.name || 'Ben', id: user?.id || 'me' } as any,
        content: text.trim(),
        type: MessageType.TEXT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addMessage(channelId, optimisticMessage);

      // Socket.IO üzerinden gönder
      socketClient.sendMessage({
        channelId,
        text: text.trim(),
        tempId,
        replyTo: replyTo || null,
      });

      // Typing'i durdur
      doStopTyping();
    },
    [user, addMessage, doStopTyping]
  );

  // ---- Typing başlat ----
  const startTyping = useCallback(() => {
    const channelId = activeChannelIdRef.current;
    if (!channelId) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socketClient.startTyping(channelId);
    }

    // Timeout'u sıfırla — kullanıcı yazmaya devam ederse extend et
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      doStopTyping();
    }, CHAT.TYPING_TIMEOUT);
  }, [doStopTyping]);

  // ---- Typing durdur (public) ----
  const stopTyping = useCallback(() => {
    doStopTyping();
  }, [doStopTyping]);

  // ---- Socket bağlı mı? ----
  const isConnected = socketClient.isConnected();

  return {
    sendSocketMessage,
    startTyping,
    stopTyping,
    isConnected,
  };
}
