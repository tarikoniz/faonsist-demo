// ============================================
// POST /api/messages — Mesaj gönder (Socket.IO fallback)
// GET  /api/messages?channelId=xxx — Kanal mesajlarını getir
// ============================================

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, successResponse } from '@/lib/auth';
import { getIO } from '@/lib/socket-server';

// ---- POST: Yeni mesaj gönder ----
export async function POST(request: NextRequest) {
  try {
    // Auth zorunlu değil — anonim mesaj da kabul et
    const user = await getUserFromRequest(request).catch(() => null);

    const body = await request.json();
    const { channelId, text, userName, replyTo } = body;

    if (!channelId || !text?.trim()) {
      return Response.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'channelId ve text zorunlu' } },
        { status: 400 }
      );
    }

    const trimmedText = text.trim().substring(0, 5000);
    const senderName = user?.name || userName || 'Misafir';
    const senderId = user?.id || null;

    // Kanal var mı? — legacyId veya id ile bul
    let channel = await prisma.channel.findFirst({
      where: { OR: [{ legacyId: channelId }, { id: channelId }] },
    });

    // Kanal yoksa oluştur (legacy kanallar için)
    if (!channel) {
      channel = await prisma.channel.create({
        data: {
          name: channelId,
          legacyId: channelId,
          type: 'channel',
        },
      });
    }

    // Mesajı DB'ye kaydet
    const message = await prisma.message.create({
      data: {
        channelId: channel.id,
        userId: senderId,
        text: trimmedText,
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      },
    });

    const msg = {
      id: message.id,
      user: senderName,
      userId: senderId,
      text: message.text,
      time: message.time,
      channelId,
      replyTo: replyTo || null,
      reactions: {},
      readBy: [senderId],
      createdAt: message.createdAt.toISOString(),
    };

    // Socket.IO ile realtime broadcast yap (bağlı kullanıcılara)
    const io = getIO();
    if (io) {
      io.to(`channel:${channel.id}`).emit('message:new', msg);
      io.to(`channel:${channelId}`).emit('message:new', msg);
    }

    return successResponse(msg, 'Mesaj gonderildi');
  } catch (error) {
    console.error('Message POST error:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Mesaj gonderilemedi' } },
      { status: 500 }
    );
  }
}

// ---- GET: Kanal mesajlarını getir ----
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId');
    const limit = parseInt(searchParams.get('limit') || '100');
    const user = await getUserFromRequest(request).catch(() => null);

    if (!channelId) {
      return Response.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'channelId zorunlu' } },
        { status: 400 }
      );
    }

    // Kanalı bul
    const channel = await prisma.channel.findFirst({
      where: { OR: [{ legacyId: channelId }, { id: channelId }] },
    });

    if (!channel) {
      return successResponse({ messages: [] });
    }

    const messages = await prisma.message.findMany({
      where: { channelId: channel.id },
      orderBy: { createdAt: 'asc' },
      take: limit,
      include: { user: { select: { name: true } } },
    });

    const formatted = messages.map(m => ({
      id: m.legacyId || m.id,
      user: m.user?.name || 'Bilinmiyor',
      userId: m.userId,
      text: m.text,
      time: m.time || m.createdAt.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      mine: user ? m.userId === user.id : false,
      replyTo: null,
      reactions: {},
      readBy: [],
      createdAt: m.createdAt.toISOString(),
    }));

    return successResponse({ messages: formatted });
  } catch (error) {
    console.error('Message GET error:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Mesajlar yuklenemedi' } },
      { status: 500 }
    );
  }
}
