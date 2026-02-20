// ============================================
// FaOnSisT - Socket.IO Server
// Real-time messaging, presence, typing, reactions
// + Message Persistence + Channel Auth + Rate Limiting
// ============================================

import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verifyAccessToken, TokenPayload } from './auth';
import { prisma } from './prisma';

// ---- Type Definitions ----

interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
    userName: string;
    userRole: string;
  };
}

interface UserPresence {
  userId: string;
  name: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  socketId: string;
  lastSeen: Date;
}

interface MessageSendData {
  channelId: string;
  text: string;
  replyTo?: { id: string; text: string; user: string } | null;
}

interface MessageUpdateData {
  channelId: string;
  messageId: string;
  text: string;
}

interface MessageDeleteData {
  channelId: string;
  messageId: string;
}

interface ChannelData {
  channelId: string;
}

interface ReactionData {
  channelId: string;
  messageId: string;
  emoji: string;
}

interface MeetingData {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  channelId?: string;
  participants?: string[];
}

// ---- Rate Limiter ----

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const socketRateLimits = new Map<string, RateLimitEntry>();
const SOCKET_RATE_WINDOW = 10_000; // 10 saniye
const SOCKET_RATE_MAX = 30;        // 10 saniyede max 30 event

function checkSocketRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = socketRateLimits.get(userId);

  if (!entry || now > entry.resetAt) {
    socketRateLimits.set(userId, { count: 1, resetAt: now + SOCKET_RATE_WINDOW });
    return true;
  }

  if (entry.count >= SOCKET_RATE_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

// Periyodik temizlik
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of socketRateLimits) {
    if (now > entry.resetAt) socketRateLimits.delete(key);
  }
}, 30_000);

// ---- Channel Authorization Cache ----

const channelMemberCache = new Map<string, Set<string>>();
const CHANNEL_CACHE_TTL = 5 * 60_000; // 5 dakika
const channelCacheExpiry = new Map<string, number>();

async function isChannelMember(channelId: string, userId: string): Promise<boolean> {
  // Guest kullanıcılar (token olmadan bağlananlar) tüm kanallara erişebilir
  if (userId.startsWith('guest_')) return true;

  const now = Date.now();
  const cacheKey = channelId;

  // Cache expired?
  if (channelCacheExpiry.has(cacheKey) && now > channelCacheExpiry.get(cacheKey)!) {
    channelMemberCache.delete(cacheKey);
    channelCacheExpiry.delete(cacheKey);
  }

  // Cache hit
  const cached = channelMemberCache.get(cacheKey);
  if (cached) {
    return cached.has(userId);
  }

  // Cache miss — DB'den çek
  try {
    const members = await prisma.channelMember.findMany({
      where: { channelId },
      select: { userId: true },
    });
    const memberSet = new Set(members.map(m => m.userId));
    channelMemberCache.set(cacheKey, memberSet);
    channelCacheExpiry.set(cacheKey, now + CHANNEL_CACHE_TTL);
    // DB'de üye bulunamazsa da izin ver (legacy kanal sistemi)
    return memberSet.size === 0 ? true : memberSet.has(userId);
  } catch {
    // DB hatası durumunda izin ver
    return true;
  }
}

// Cache invalidation (yeni üye eklendiğinde/çıkarıldığında)
export function invalidateChannelCache(channelId: string) {
  channelMemberCache.delete(channelId);
  channelCacheExpiry.delete(channelId);
}

// ---- State ----

const onlineUsers = new Map<string, UserPresence>();
let io: SocketIOServer | null = null;

export function getIO(): SocketIOServer | null {
  return io;
}

export function getOnlineUsers(): UserPresence[] {
  return Array.from(onlineUsers.values());
}

// ---- Main Initialization ----

export function initializeSocket(httpServer: HTTPServer): SocketIOServer {
  const isProd = process.env.NODE_ENV === 'production';
  const corsOrigin = process.env.CORS_ORIGIN || (isProd ? 'https://faonsist.com' : '*');

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: corsOrigin,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  // ---- JWT Authentication Middleware (opsiyonel — tokensız da bağlanabilir) ----
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (token) {
        const payload: TokenPayload | null = await verifyAccessToken(token);
        if (payload) {
          socket.data.userId = payload.userId;
          socket.data.userName = payload.name;
          socket.data.userRole = payload.role;
        } else {
          // Token var ama geçersiz — guest olarak devam et
          socket.data.userId = `guest_${socket.id}`;
          socket.data.userName = socket.handshake.auth?.userName || 'Misafir';
          socket.data.userRole = 'Izleyici';
        }
      } else {
        // Token yok — guest olarak bağlan (userName'i handshake'den al)
        socket.data.userId = `guest_${socket.id}`;
        socket.data.userName = socket.handshake.auth?.userName || 'Misafir';
        socket.data.userRole = 'Izleyici';
      }
      next();
    } catch {
      next(new Error('Authentication failed'));
    }
  });

  // ---- Connection Handler ----
  io.on('connection', (rawSocket: Socket) => {
    const socket = rawSocket as AuthenticatedSocket;
    const { userId, userName } = socket.data;

    console.log(`[Socket] Connected: ${userName} (${userId})`);

    // Track presence
    onlineUsers.set(userId, {
      userId,
      name: userName,
      status: 'online',
      socketId: socket.id,
      lastSeen: new Date(),
    });

    io!.emit('user:online', { userId, name: userName, status: 'online' });

    // Send current online list
    socket.emit(
      'presence:list',
      Array.from(onlineUsers.values()).map(u => ({
        userId: u.userId,
        name: u.name,
        status: u.status,
      }))
    );

    // ---- Rate limit wrapper ----
    function withRateLimit(handler: (...args: unknown[]) => void | Promise<void>) {
      return (...args: unknown[]) => {
        if (!checkSocketRateLimit(userId)) {
          socket.emit('error:rate-limited', {
            message: 'Cok fazla istek gonderiyorsunuz. Lutfen yavaslayin.',
          });
          return;
        }
        handler(...args);
      };
    }

    // ---- Channel Rooms (with authorization) ----
    socket.on(
      'channel:join',
      withRateLimit(async (data: unknown) => {
        const { channelId } = data as ChannelData;
        if (!channelId) return;

        const isMember = await isChannelMember(channelId, userId);
        if (!isMember) {
          socket.emit('error:forbidden', {
            message: 'Bu kanala erisim yetkiniz yok.',
            channelId,
          });
          return;
        }

        socket.join(`channel:${channelId}`);
      })
    );

    socket.on('channel:leave', (data: ChannelData) => {
      if (!data.channelId) return;
      socket.leave(`channel:${data.channelId}`);
    });

    // ---- Messages (with DB persistence) ----
    socket.on(
      'message:send',
      withRateLimit(async (data: unknown) => {
        const { channelId, text, replyTo } = data as MessageSendData;
        if (!channelId || !text?.trim()) return;

        // Kanal üyelik kontrolü
        const isMember = await isChannelMember(channelId, userId);
        if (!isMember) {
          socket.emit('error:forbidden', { message: 'Bu kanala mesaj gonderemezsiniz.' });
          return;
        }

        // Mesaj uzunluk sınırı
        const trimmedText = text.trim().substring(0, 5000);

        try {
          // DB'ye kaydet
          const message = await prisma.message.create({
            data: {
              channelId,
              userId,
              text: trimmedText,
              time: new Date().toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit',
              }),
            },
          });

          const msg = {
            id: message.id,
            user: userName,
            userId,
            text: message.text,
            time: message.time,
            channelId,
            replyTo: replyTo || null,
            reactions: {},
            readBy: [userId],
            createdAt: message.createdAt.toISOString(),
          };

          // Tüm kanala yayınla (gönderen dahil)
          io!.to(`channel:${channelId}`).emit('message:new', msg);
        } catch (error) {
          console.error('[Socket] Message persist error:', error);
          socket.emit('error:server', { message: 'Mesaj kaydedilemedi.' });
        }
      })
    );

    socket.on(
      'message:update',
      withRateLimit(async (data: unknown) => {
        const { channelId, messageId, text } = data as MessageUpdateData;
        if (!channelId || !messageId || !text?.trim()) return;

        try {
          // Sadece kendi mesajını güncelleyebilir
          const existing = await prisma.message.findUnique({ where: { id: messageId } });
          if (!existing || existing.userId !== userId) {
            socket.emit('error:forbidden', { message: 'Bu mesaji duzenleyemezsiniz.' });
            return;
          }

          await prisma.message.update({
            where: { id: messageId },
            data: { text: text.trim().substring(0, 5000) },
          });

          socket.to(`channel:${channelId}`).emit('message:updated', {
            messageId,
            text: text.trim(),
            editedBy: userName,
            editedAt: new Date().toISOString(),
          });
        } catch (error) {
          console.error('[Socket] Message update error:', error);
        }
      })
    );

    socket.on(
      'message:delete',
      withRateLimit(async (data: unknown) => {
        const { channelId, messageId } = data as MessageDeleteData;
        if (!channelId || !messageId) return;

        try {
          // Sadece kendi mesajını veya admin silebilir
          const existing = await prisma.message.findUnique({ where: { id: messageId } });
          if (!existing) return;

          if (existing.userId !== userId && socket.data.userRole !== 'admin') {
            socket.emit('error:forbidden', { message: 'Bu mesaji silemezsiniz.' });
            return;
          }

          await prisma.message.delete({ where: { id: messageId } });

          socket.to(`channel:${channelId}`).emit('message:deleted', {
            messageId,
            deletedBy: userName,
          });
        } catch (error) {
          console.error('[Socket] Message delete error:', error);
        }
      })
    );

    // ---- Typing ----
    socket.on(
      'typing:start',
      withRateLimit((data: unknown) => {
        const { channelId } = data as ChannelData;
        if (!channelId) return;
        socket
          .to(`channel:${channelId}`)
          .emit('user:typing', { userId, name: userName, channelId });
      })
    );

    socket.on('typing:stop', (data: ChannelData) => {
      if (!data.channelId) return;
      socket
        .to(`channel:${data.channelId}`)
        .emit('user:stopped-typing', { userId, channelId: data.channelId });
    });

    // ---- Read Receipts (with DB persistence) ----
    socket.on(
      'message:read',
      withRateLimit(async (data: unknown) => {
        const { channelId, messageIds } = data as { channelId: string; messageIds: string[] };
        if (!channelId || !messageIds?.length) return;

        try {
          // Batch upsert read receipts
          const receipts = messageIds.slice(0, 100).map(messageId => ({
            messageId,
            userId,
          }));

          await Promise.allSettled(
            receipts.map(r =>
              prisma.messageReadReceipt.upsert({
                where: { messageId_userId: { messageId: r.messageId, userId: r.userId } },
                update: { readAt: new Date() },
                create: r,
              })
            )
          );

          socket.to(`channel:${channelId}`).emit('message:read-receipt', {
            userId,
            name: userName,
            messageIds,
            readAt: new Date().toISOString(),
          });
        } catch (error) {
          console.error('[Socket] Read receipt error:', error);
        }
      })
    );

    // ---- Reactions (with DB persistence) ----
    socket.on(
      'reaction:add',
      withRateLimit(async (data: unknown) => {
        const { channelId, messageId, emoji } = data as ReactionData;
        if (!channelId || !messageId || !emoji) return;

        try {
          await prisma.messageReaction.upsert({
            where: { messageId_userId_emoji: { messageId, userId, emoji } },
            update: {},
            create: { messageId, userId, emoji },
          });

          io!.to(`channel:${channelId}`).emit('reaction:added', {
            messageId,
            userId,
            name: userName,
            emoji,
          });
        } catch (error) {
          console.error('[Socket] Reaction add error:', error);
        }
      })
    );

    socket.on(
      'reaction:remove',
      withRateLimit(async (data: unknown) => {
        const { channelId, messageId, emoji } = data as ReactionData;
        if (!channelId || !messageId || !emoji) return;

        try {
          await prisma.messageReaction.deleteMany({
            where: { messageId, userId, emoji },
          });

          io!.to(`channel:${channelId}`).emit('reaction:removed', {
            messageId,
            userId,
            name: userName,
            emoji,
          });
        } catch (error) {
          console.error('[Socket] Reaction remove error:', error);
        }
      })
    );

    // ---- Status ----
    socket.on(
      'user:status-change',
      withRateLimit((data: unknown) => {
        const { status } = data as { status: 'online' | 'away' | 'busy' | 'offline' };
        if (!status) return;

        const p = onlineUsers.get(userId);
        if (p) {
          p.status = status;
          p.lastSeen = new Date();
        }
        io!.emit('user:status-changed', { userId, name: userName, status });
      })
    );

    // ---- Mentions ----
    socket.on(
      'mention:notify',
      withRateLimit((data: unknown) => {
        const { channelId, messageId, mentionedUserIds } = data as {
          channelId: string;
          messageId: string;
          mentionedUserIds: string[];
        };
        if (!channelId || !messageId || !mentionedUserIds?.length) return;

        mentionedUserIds.slice(0, 20).forEach(uid => {
          const target = onlineUsers.get(uid);
          if (target) {
            io!.to(target.socketId).emit('mention:received', {
              channelId,
              messageId,
              mentionedBy: userName,
            });
          }
        });
      })
    );

    // ---- Meetings ----
    socket.on(
      'meeting:created',
      withRateLimit((data: unknown) => {
        const meetingData = data as MeetingData;
        io!.emit('meeting:new', { ...meetingData, createdBy: userName });
      })
    );

    // ---- Disconnect ----
    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${userName}`);
      onlineUsers.delete(userId);
      io!.emit('user:offline', { userId, name: userName });

      // Update lastSeenAt in DB (non-blocking)
      prisma.user
        .update({
          where: { id: userId },
          data: { lastSeenAt: new Date() },
        })
        .catch(() => {});
    });
  });

  console.log('[Socket.IO] Server initialized');
  return io;
}

// ---- Helper: Belirli bir kullaniciya event gonder ----
export function emitToUser(userId: string, event: string, data: unknown): void {
  if (!io) return;
  const presence = onlineUsers.get(userId);
  if (presence) {
    io.to(presence.socketId).emit(event, data);
  }
}
