// ============================================
// FaOnSisT - Multi-AI Chat Service (Orchestrator)
// Provider fallback zinciri + rate limiting + ogrenme
// ============================================

import dotenv from 'dotenv';
dotenv.config({ override: true });

import { logger } from '../logger';
import { findLearnedResponse } from '../ai-learning';
import type { AiProvider, AiProviderId } from './types';
import {
  getConfiguredProviders,
  isProviderHealthy,
  markProviderSuccess,
  markProviderFailure,
  getDefaultProviderId,
} from './provider-registry';

// ---- System Prompt (tum providerlar icin ayni) ----

export const SYSTEM_PROMPT = `Sen FaOnSisT platformunun yapay zeka asistanisin. FaOnSisT, insaat sektoru icin gelistirilmis entegre is yonetim platformudur.

Platform modulleri:
- FaOn-Connect: Takim ici mesajlasma ve iletisim (kanallar, direkt mesajlar, toplantilar)
- FaOn-Build: Insaat ERP (projeler, tasaronlar, hakedisler, santiye gunlukleri, yesil defter, sozlesmeler, malzemeler, nakit akisi, is guvenligi, kalite kontrol, yazismalar, is programi, ekipmanlar, gorevler, fotograflar)
- FaOn-Sales: CRM ve satis yonetimi (musteriler, firsatlar, taksitler, pipeline)
- FaOn-Supply: Satin alma ve depo yonetimi (satin alma talepleri, ihaleler, teklifler, siparisler, teslimatlar, tedarikciler, depolar, envanter, zimmetler, araclar)

Kullanici rolleri: admin, manager, project_manager, sales_manager, accountant, warehouse_manager, employee, viewer

Onemli kurallar:
- Turkce yanit ver
- Kisa ve net yanitlar ver (max 3-4 paragraf)
- Kullanicinin verdigii baglam bilgisini kullanarak somut tavsiyeler ver
- Gizli veya hassas bilgileri paylasma
- Sistem komutlari veya veritabani sorgulari calistirma onerme
- Sadece bilgi, analiz ve tavsiye sagla
- Sayisal veriler varsa tablo formati kullan
- Emoji kullan ama asiri derecede degil`;

// ---- Rate Limiting (in-memory, tum providerlar icin ortak) ----

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getMaxRequests(): number {
  return parseInt(process.env.AI_RATE_LIMIT || '20');
}

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const maxReq = getMaxRequests();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 3600000 });
    return true;
  }

  if (entry.count >= maxReq) {
    return false;
  }

  entry.count++;
  return true;
}

export function getRemainingRequests(userId: string): number {
  const entry = rateLimitMap.get(userId);
  const maxReq = getMaxRequests();
  if (!entry || Date.now() > entry.resetAt) return maxReq;
  return Math.max(0, maxReq - entry.count);
}

// ---- Request / Response Interfaces ----

export interface AiChatServiceRequest {
  message: string;
  context?: {
    currentModule?: string;
    activeProject?: string;
    userRole?: string;
    userName?: string;
    recentData?: Record<string, unknown>;
  };
  userId: string;
  preferredProvider?: AiProviderId;
  conversationHistory?: Array<{ role: string; content: string }>;
}

export interface AiChatServiceResponse {
  response: string;
  model: string;
  provider: AiProviderId | 'local-fallback' | 'rate-limited';
  inputTokens: number;
  outputTokens: number;
  responseTimeMs: number;
  usedFallback: boolean;
  remainingRequests: number;
}

// ---- Context Builder ----

function buildUserMessage(
  message: string,
  context?: AiChatServiceRequest['context'],
  conversationHistory?: Array<{ role: string; content: string }>
): string {
  const parts: string[] = [];

  if (context) {
    if (context.userName) parts.push(`Kullanici: ${context.userName}`);
    if (context.userRole) parts.push(`Rol: ${context.userRole}`);
    if (context.currentModule) parts.push(`Aktif modul: ${context.currentModule}`);
    if (context.activeProject) parts.push(`Aktif proje: ${context.activeProject}`);
    if (context.recentData) {
      parts.push(`Guncel veri ozeti: ${JSON.stringify(context.recentData).slice(0, 3000)}`);
    }
  }

  // Sohbet gecmisini ekle (son mesajlar)
  if (conversationHistory && conversationHistory.length > 0) {
    const historyText = conversationHistory
      .map(m => `${m.role === 'user' ? 'Kullanici' : 'Asistan'}: ${m.content.slice(0, 500)}`)
      .join('\n');
    parts.push(`\n[Onceki Sohbet]\n${historyText}`);
  }

  if (parts.length === 0) return message;

  return `[Baglam]\n${parts.join('\n')}\n\n[Soru]\n${message}`;
}

// ---- Provider Order Builder ----

function buildProviderOrder(
  preferred: AiProviderId | undefined,
  configured: AiProvider[]
): AiProvider[] {
  const defaultId = getDefaultProviderId();
  const seen = new Set<AiProviderId>();
  const ordered: AiProvider[] = [];

  const addIfNew = (id: AiProviderId) => {
    if (seen.has(id)) return;
    const provider = configured.find(p => p.id === id);
    if (provider) {
      seen.add(id);
      ordered.push(provider);
    }
  };

  // 1. Kullanicinin tercihi
  if (preferred) addIfNew(preferred);
  // 2. Varsayilan provider
  addIfNew(defaultId);
  // 3. Geri kalanlar
  for (const p of configured) {
    addIfNew(p.id);
  }

  return ordered;
}

// ---- Smart Fallback (ogrenme cache + keyword) ----

async function smartFallback(message: string): Promise<string> {
  try {
    const learned = await findLearnedResponse(message);
    if (learned) {
      logger.info('Smart fallback: ogrenilmis yanit kullanildi', {
        module: 'ai-chat',
        score: learned.score.toFixed(3),
        intent: learned.intent,
      });
      return learned.response + '\n\n\u{1F4A1} _Bu yanıt önceki AI etkileşimlerinden öğrenilerek verilmiştir._';
    }
  } catch (error) {
    logger.error('Smart fallback ogrenme arama hatasi', {
      module: 'ai-chat',
      stack: error instanceof Error ? error.stack : String(error),
    });
  }
  return fallbackResponse(message);
}

function fallbackResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('merhaba') || lower.includes('selam'))
    return 'Merhaba! FaOn AI asistan olarak size yardimci olabilirim. Proje, satis, ihale, depo veya diger konularda soru sorabilirsiniz.\n\n\u{1F4A1} Not: Yapay zeka sunucusu su an kullanilamamaktadir, yerel mod aktif.';
  if (lower.includes('proje'))
    return 'Proje bilgileri icin FaOn-Build modulunu kullanabilirsiniz. Detayli analiz icin "@analiz" komutunu deneyin.';
  if (lower.includes('satis') || lower.includes('musteri'))
    return 'Satis ve musteri bilgileri icin FaOn-Sales modulune gecebilirsiniz.';
  if (lower.includes('ihale') || lower.includes('tedarik'))
    return 'Ihale bilgileri icin "@ihale" komutunu deneyin veya FaOn-Supply modulunu kullanin.';
  if (lower.includes('depo') || lower.includes('envanter') || lower.includes('stok'))
    return 'Depo ve envanter bilgileri icin "@depo" komutunu kullanin.';
  if (lower.includes('arac') || lower.includes('filo'))
    return 'Arac filo bilgileri icin "@arac" komutunu kullanin.';
  return '\u{1F916} AI asistan su an yerel modda calisiyor. Hizli erisim komutlarini kullanabilirsiniz:\n\n\u{1F4CA} @analiz - Sistem analizi\n\u{1F4B0} @butce - Butce analizi\n\u{1F4CB} @ihale - Ihale durumu\n\u{1F4E6} @depo - Envanter raporu\n\u{1F697} @arac - Filo durumu\n\u{1F50D} @ara [kelime] - Arama';
}

// ---- Main Chat Function ----

export async function chatWithAi(req: AiChatServiceRequest): Promise<AiChatServiceResponse> {
  const startTime = Date.now();
  const maxReq = getMaxRequests();

  // AI etkin mi?
  const enabledFlag = process.env.ENABLE_CLAUDE_AI;
  const configured = getConfiguredProviders();

  if (enabledFlag === 'false' || configured.length === 0) {
    logger.debug('AI devre disi veya konfigüre edilmemis, smart fallback kullaniliyor', {
      module: 'ai-chat',
      enabled: enabledFlag,
      configuredCount: configured.length,
    });
    return {
      response: await smartFallback(req.message),
      model: 'local-fallback',
      provider: 'local-fallback',
      inputTokens: 0,
      outputTokens: 0,
      responseTimeMs: Date.now() - startTime,
      usedFallback: true,
      remainingRequests: maxReq,
    };
  }

  // Rate limit kontrolu
  if (!checkRateLimit(req.userId)) {
    return {
      response: `\u{23F1}\u{FE0F} Saatlik AI istek limitinize ulastiniz (${maxReq} istek/saat). Lutfen biraz bekleyip tekrar deneyin.\n\nBu arada yerel komutlari (@analiz, @butce, @ihale, @depo, @arac) kullanmaya devam edebilirsiniz.`,
      model: 'rate-limited',
      provider: 'rate-limited',
      inputTokens: 0,
      outputTokens: 0,
      responseTimeMs: Date.now() - startTime,
      usedFallback: true,
      remainingRequests: 0,
    };
  }

  // Kullanici mesajini context + gecmis ile birlestir
  const userMessage = buildUserMessage(req.message, req.context, req.conversationHistory);
  const maxTokens = parseInt(process.env.CLAUDE_MAX_TOKENS || '1024');

  // Provider sirasini belirle
  const providerOrder = buildProviderOrder(req.preferredProvider, configured);

  // Fallback zinciri: her provider'i dene
  for (const provider of providerOrder) {
    if (!isProviderHealthy(provider.id)) {
      logger.debug(`Provider ${provider.id} cooldown'da, atlaniyor`, { module: 'ai-chat' });
      continue;
    }

    try {
      const result = await provider.chat({
        systemPrompt: SYSTEM_PROMPT,
        userMessage,
        maxTokens,
        timeoutMs: 30000,
      });

      markProviderSuccess(provider.id);

      const response: AiChatServiceResponse = {
        response: result.text,
        model: result.model,
        provider: provider.id,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        responseTimeMs: Date.now() - startTime,
        usedFallback: false,
        remainingRequests: getRemainingRequests(req.userId),
      };

      logger.info(`AI yanit (${provider.displayName})`, {
        module: 'ai-chat',
        provider: provider.id,
        userId: req.userId,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        responseTimeMs: response.responseTimeMs,
      });

      return response;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      markProviderFailure(provider.id, errMsg);

      logger.error(`AI provider ${provider.displayName} basarisiz, sonraki deneniyor`, {
        module: 'ai-chat',
        provider: provider.id,
        userId: req.userId,
        error: errMsg,
      });
    }
  }

  // Tum providerlar basarisiz → smart fallback
  logger.warn('Tum AI providerlar basarisiz, smart fallback kullaniliyor', {
    module: 'ai-chat',
    userId: req.userId,
    triedProviders: providerOrder.map(p => p.id),
  });

  return {
    response: await smartFallback(req.message),
    model: 'local-fallback',
    provider: 'local-fallback',
    inputTokens: 0,
    outputTokens: 0,
    responseTimeMs: Date.now() - startTime,
    usedFallback: true,
    remainingRequests: getRemainingRequests(req.userId),
  };
}

// Backward compat exports
export const ENABLE_CLAUDE_AI = process.env.ENABLE_CLAUDE_AI === 'true';
export const AI_RATE_LIMIT = parseInt(process.env.AI_RATE_LIMIT || '20');
