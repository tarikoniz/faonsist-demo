// ============================================
// SOCKET.IO CLIENT
// Real-time communication setup
// ============================================

import { io, Socket } from 'socket.io-client';
import { SOCKET_URL, AUTH_TOKEN_KEY } from './constants';

class SocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventListeners();

    return this.socket;
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('[Socket] Connected:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('[Socket] Max reconnection attempts reached');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('[Socket] Reconnected after', attemptNumber, 'attempts');
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('[Socket] Reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('[Socket] Reconnection failed');
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Message events
  onMessageReceived(callback: (message: any) => void): void {
    this.socket?.on('message:new', callback);
  }

  onMessageUpdated(callback: (message: any) => void): void {
    this.socket?.on('message:updated', callback);
  }

  onMessageDeleted(callback: (messageId: string) => void): void {
    this.socket?.on('message:deleted', callback);
  }

  sendMessage(data: any): void {
    this.socket?.emit('message:send', data);
  }

  // Typing indicators
  onUserTyping(callback: (data: { userId: string; channelId: string; userName: string }) => void): void {
    this.socket?.on('user:typing', callback);
  }

  onUserStoppedTyping(callback: (data: { userId: string; channelId: string }) => void): void {
    this.socket?.on('user:stopped-typing', callback);
  }

  startTyping(channelId: string): void {
    this.socket?.emit('typing:start', { channelId });
  }

  stopTyping(channelId: string): void {
    this.socket?.emit('typing:stop', { channelId });
  }

  // Presence events
  onUserOnline(callback: (userId: string) => void): void {
    this.socket?.on('user:online', callback);
  }

  onUserOffline(callback: (userId: string) => void): void {
    this.socket?.on('user:offline', callback);
  }

  onUserStatusChange(callback: (data: { userId: string; status: string }) => void): void {
    this.socket?.on('user:status-change', callback);
  }

  // Channel events
  onChannelCreated(callback: (channel: any) => void): void {
    this.socket?.on('channel:created', callback);
  }

  onChannelUpdated(callback: (channel: any) => void): void {
    this.socket?.on('channel:updated', callback);
  }

  onChannelDeleted(callback: (channelId: string) => void): void {
    this.socket?.on('channel:deleted', callback);
  }

  joinChannel(channelId: string): void {
    this.socket?.emit('channel:join', { channelId });
  }

  leaveChannel(channelId: string): void {
    this.socket?.emit('channel:leave', { channelId });
  }

  // Message read status
  markMessageAsRead(messageId: string): void {
    this.socket?.emit('message:read', { messageId });
  }

  // Reactions
  onReactionAdded(callback: (data: any) => void): void {
    this.socket?.on('reaction:added', callback);
  }

  onReactionRemoved(callback: (data: any) => void): void {
    this.socket?.on('reaction:removed', callback);
  }

  addReaction(messageId: string, emoji: string): void {
    this.socket?.emit('reaction:add', { messageId, emoji });
  }

  removeReaction(messageId: string, emoji: string): void {
    this.socket?.emit('reaction:remove', { messageId, emoji });
  }

  // Generic event listeners
  on(event: string, callback: (...args: any[]) => void): void {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    this.socket?.off(event, callback);
  }

  emit(event: string, data?: any): void {
    this.socket?.emit(event, data);
  }
}

// Create singleton instance
const socketClient = new SocketClient();

export default socketClient;
export { SocketClient };
