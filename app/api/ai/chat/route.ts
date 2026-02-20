// ============================================
// FaOnSisT - AI Chat API Endpoint
// POST /api/ai/chat — Multi-provider + session destekli
// ============================================

import { NextRequest } from 'next/server';
import { getUserFromRequest, unauthorizedResponse, badRequestResponse, successResponse } from '@/lib/auth';
import { chatWithAi } from '@/lib/ai/chat-service';
import { learnFromResponse } from '@/lib/ai-learning';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const { message, context, provider, sessionId } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return badRequestResponse('Mesaj alani zorunludur');
    }

    if (message.length > 4000) {
      return badRequestResponse('Mesaj 4000 karakterden uzun olamaz');
    }

    // Session varsa gecmis mesajlari yukle
    let conversationHistory: Array<{ role: string; content: string }> = [];
    let activeSessionId = sessionId;

    if (sessionId) {
      const sessionMessages = await prisma.aiChatMessage.findMany({
        where: { sessionId, session: { userId: user.id, aktif: true } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { role: true, icerik: true },
      });
      conversationHistory = sessionMessages.reverse().map((m: { role: string; icerik: string }) => ({
        role: m.role,
        content: m.icerik,
      }));
    }

    const result = await chatWithAi({
      message: message.trim(),
      context: {
        ...context,
        userRole: user.role,
        userName: user.name,
      },
      userId: user.id,
      preferredProvider: provider || undefined,
      conversationHistory,
    });

    // Session yoksa otomatik oluştur
    if (!activeSessionId) {
      const session = await prisma.aiChatSession.create({
        data: {
          userId: user.id,
          baslik: message.trim().slice(0, 50),
        },
      });
      activeSessionId = session.id;
    }

    // Mesajlari session'a kaydet (asenkron)
    if (activeSessionId) {
      prisma.$transaction([
        prisma.aiChatMessage.create({
          data: {
            sessionId: activeSessionId,
            role: 'user',
            icerik: message.trim().slice(0, 10000),
          },
        }),
        prisma.aiChatMessage.create({
          data: {
            sessionId: activeSessionId,
            role: 'assistant',
            icerik: result.response.slice(0, 10000),
            provider: result.provider,
            model: result.model,
          },
        }),
        prisma.aiChatSession.update({
          where: { id: activeSessionId },
          data: { mesajSayisi: { increment: 2 } },
        }),
      ]).catch(() => { });
    }

    // Veritabanina AI etkilesimini logla (asenkron)
    prisma.aiInteraction.create({
      data: {
        userId: user.id,
        userMessage: message.trim().slice(0, 4000),
        aiResponse: result.response.slice(0, 10000),
        model: result.model,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        responseTimeMs: result.responseTimeMs,
        usedFallback: result.usedFallback,
      },
    }).catch(() => { });

    // Başarılı AI yanitlarindan ogren
    if (!result.usedFallback && result.model !== 'rate-limited') {
      learnFromResponse(
        message.trim(),
        result.response,
        undefined,
        context?.currentModule
      ).catch(() => { });
    }

    return successResponse({
      response: result.response,
      model: result.model,
      provider: result.provider,
      sessionId: activeSessionId,
      usedFallback: result.usedFallback,
      remainingRequests: result.remainingRequests,
      ...(user.role === 'admin' && {
        usage: {
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          responseTimeMs: result.responseTimeMs,
        },
      }),
    });
  } catch (error) {
    console.error('AI chat hatasi:', error);
    return Response.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'AI servisi hatasi' } },
      { status: 500 }
    );
  }
}
