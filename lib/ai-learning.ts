// ============================================
// FaOnSisT - AI Learning Engine
// Claude yanitlarindan ogrenen yerel AI cache
// ============================================

import { prisma } from './prisma';
import { logger } from './logger';

// ---- Turkish Stop Words ----
const TURKISH_STOP_WORDS = new Set([
  'bir', 'bu', 'su', 'o', 've', 'ile', 'de', 'da', 'den', 'dan',
  'ne', 'mi', 'mu', 'icin', 'ama', 'fakat', 'ya', 'veya', 'ki',
  'ben', 'sen', 'biz', 'siz', 'onlar', 'benim', 'senin', 'bizim',
  'nasil', 'neden', 'nerede', 'hangi', 'kadar', 'gibi', 'ise',
  'var', 'yok', 'olan', 'olarak', 'daha', 'en', 'cok', 'az',
  'her', 'tum', 'hep', 'sadece', 'sonra', 'once', 'iken',
  'bana', 'sana', 'ona', 'bunu', 'sunu', 'onu', 'bunlar',
  'lutfen', 'tesekkur', 'merhaba', 'selam', 'ederim', 'iyi',
  'the', 'is', 'are', 'was', 'a', 'an', 'of', 'to', 'in', 'for',
  'and', 'or', 'but', 'not', 'what', 'how', 'can', 'do', 'does',
  'ile', 'dir', 'lar', 'ler', 'nin', 'nun', 'daki', 'deki',
  'sey', 'diye', 'daha', 'bile', 'hem', 'hic', 'herhangi',
]);

// ---- Keyword Extraction ----
export function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u00e7\u011f\u0131\u00f6\u015f\u00fc\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length >= 2 && !TURKISH_STOP_WORDS.has(word));
}

// ---- Intent Detection ----
const INTENT_PATTERNS: Record<string, string[]> = {
  proje:    ['proje', 'insaat', 'santiye', 'ilerleme', 'taseron', 'hakedis', 'gunluk'],
  butce:    ['butce', 'harcama', 'maliyet', 'nakit', 'gelir', 'gider', 'fiyat', 'ucret'],
  ihale:    ['ihale', 'teklif', 'tender', 'tedarik', 'satin', 'satinalma', 'siparis'],
  satis:    ['satis', 'musteri', 'pipeline', 'firsat', 'taksit', 'crm', 'gelir'],
  depo:     ['depo', 'envanter', 'stok', 'malzeme', 'zimmet', 'sayim', 'urun'],
  arac:     ['arac', 'filo', 'plaka', 'bakim', 'yakit', 'kamyon', 'binek', 'muayene'],
  ekip:     ['personel', 'kullanıcı', 'ekip', 'rol', 'yetki', 'departman'],
  toplanti: ['toplanti', 'meeting', 'ajanda', 'katilimci', 'gorusme'],
  genel:    ['sistem', 'analiz', 'rapor', 'ozet', 'durum', 'genel', 'yardim'],
};

export function detectIntent(keywords: string[]): string {
  let bestIntent = 'genel';
  let bestScore = 0;
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    const score = keywords.filter(kw =>
      patterns.some(p => kw.includes(p) || p.includes(kw))
    ).length;
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }
  return bestIntent;
}

// ---- Similarity Scoring ----
export function calculateSimilarity(queryKeywords: string[], candidateKeywords: string[]): number {
  if (queryKeywords.length === 0 || candidateKeywords.length === 0) return 0;

  const candidateSet = new Set(candidateKeywords);
  let matchCount = 0;
  let partialMatchCount = 0;

  for (const qk of queryKeywords) {
    if (candidateSet.has(qk)) {
      matchCount++;
    } else {
      for (const ck of candidateKeywords) {
        if (ck.includes(qk) || qk.includes(ck)) {
          partialMatchCount++;
          break;
        }
      }
    }
  }

  const rawScore = matchCount * 1.0 + partialMatchCount * 0.5;
  const unionSize = new Set([...queryKeywords, ...candidateKeywords]).size;
  return rawScore / unionSize;
}

// ---- Freshness Decay ----
export function freshnessMultiplier(createdAt: Date): number {
  const ageInDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  return Math.pow(0.5, ageInDays / 30); // 30-day half-life
}

// ---- In-Memory Cache ----
interface CachedEntry {
  id: string;
  userMessage: string;
  aiResponse: string;
  keywords: string[];
  intent: string;
  hitCount: number;
  quality: number;
  createdAt: Date;
}

const MAX_CACHE_SIZE = 500;
let cache: CachedEntry[] = [];
let cacheInitialized = false;

export async function initLearningCache(): Promise<void> {
  try {
    const entries = await prisma.aiLearnedResponse.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
      take: MAX_CACHE_SIZE,
    });
    cache = entries.map(e => ({
      id: e.id,
      userMessage: e.userMessage,
      aiResponse: e.aiResponse,
      keywords: e.keywords.split(' ').filter(Boolean),
      intent: e.intent || 'genel',
      hitCount: e.hitCount,
      quality: e.quality,
      createdAt: e.createdAt,
    }));
    cacheInitialized = true;
    logger.info(`AI ogrenme cache yuklendi: ${cache.length} kayit`, { module: 'ai-learning' });
  } catch (error) {
    logger.error('AI ogrenme cache yuklenemedi', {
      module: 'ai-learning',
      stack: error instanceof Error ? error.stack : String(error),
    });
    cache = [];
  }
}

// ---- Learning: Index a Claude Response ----
export async function learnFromResponse(
  userMessage: string,
  aiResponse: string,
  interactionId?: string,
  module?: string
): Promise<void> {
  try {
    // Keywords from user question only (for matching), intent from both
    const questionKeywords = extractKeywords(userMessage);
    if (questionKeywords.length < 2) return;

    const allKeywords = extractKeywords(userMessage + ' ' + aiResponse);
    const intent = detectIntent(allKeywords);
    const keywordsStr = [...new Set(questionKeywords)].join(' ');

    const entry = await prisma.aiLearnedResponse.create({
      data: {
        interactionId,
        userMessage,
        aiResponse,
        keywords: keywordsStr,
        intent,
        module,
      },
    });

    // Add to in-memory cache
    cache.unshift({
      id: entry.id,
      userMessage: entry.userMessage,
      aiResponse: entry.aiResponse,
      keywords: keywordsStr.split(' '),
      intent,
      hitCount: 0,
      quality: 1.0,
      createdAt: entry.createdAt,
    });

    // Prune if over limit
    if (cache.length > MAX_CACHE_SIZE) {
      const removed = cache.pop();
      if (removed) {
        prisma.aiLearnedResponse.update({
          where: { id: removed.id },
          data: { active: false },
        }).catch(() => {});
      }
    }

    logger.info('AI yeni yanit ogrendi', {
      module: 'ai-learning',
      intent,
      keywordCount: questionKeywords.length,
    });
  } catch (error) {
    logger.error('AI ogrenme hatasi', {
      module: 'ai-learning',
      stack: error instanceof Error ? error.stack : String(error),
    });
  }
}

// ---- Retrieval: Find Best Cached Response ----
export interface LearnedMatch {
  response: string;
  score: number;
  originalQuestion: string;
  intent: string;
}

const MIN_SCORE_THRESHOLD = 0.15;

export async function findLearnedResponse(userMessage: string): Promise<LearnedMatch | null> {
  if (!cacheInitialized) await initLearningCache();
  if (cache.length === 0) return null;

  const queryKeywords = extractKeywords(userMessage);
  if (queryKeywords.length === 0) return null;

  const queryIntent = detectIntent(queryKeywords);

  let bestMatch: { entry: CachedEntry; score: number } | null = null;

  for (const entry of cache) {
    let score = calculateSimilarity(queryKeywords, entry.keywords);

    // Intent match bonus
    if (entry.intent === queryIntent && queryIntent !== 'genel') {
      score *= 1.3;
    }

    // Freshness decay
    score *= freshnessMultiplier(entry.createdAt);

    // Quality factor
    score *= (0.8 + 0.2 * Math.min(entry.quality, 1.0));

    if (score > MIN_SCORE_THRESHOLD && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { entry, score };
    }
  }

  if (!bestMatch) return null;

  // Increment hit count (fire-and-forget)
  bestMatch.entry.hitCount++;
  prisma.aiLearnedResponse.update({
    where: { id: bestMatch.entry.id },
    data: { hitCount: { increment: 1 } },
  }).catch(() => {});

  logger.info('AI ogrenme cache eslesmesi', {
    module: 'ai-learning',
    score: bestMatch.score.toFixed(3),
    intent: bestMatch.entry.intent,
    hitCount: bestMatch.entry.hitCount,
  });

  return {
    response: bestMatch.entry.aiResponse,
    score: bestMatch.score,
    originalQuestion: bestMatch.entry.userMessage,
    intent: bestMatch.entry.intent,
  };
}

// ---- Periodic Pruning ----
export async function pruneLearnedCache(): Promise<void> {
  try {
    const count = await prisma.aiLearnedResponse.count({ where: { active: true } });

    if (count > MAX_CACHE_SIZE) {
      const toDeactivate = await prisma.aiLearnedResponse.findMany({
        where: { active: true },
        orderBy: [
          { hitCount: 'asc' },
          { createdAt: 'asc' },
        ],
        take: count - MAX_CACHE_SIZE,
        select: { id: true },
      });

      if (toDeactivate.length > 0) {
        await prisma.aiLearnedResponse.updateMany({
          where: { id: { in: toDeactivate.map(e => e.id) } },
          data: { active: false },
        });

        logger.info(`AI cache budandi: ${toDeactivate.length} kayit deaktive edildi`, {
          module: 'ai-learning',
        });

        // Reload cache after pruning
        await initLearningCache();
      }
    }
  } catch (error) {
    logger.error('AI cache budama hatasi', {
      module: 'ai-learning',
      stack: error instanceof Error ? error.stack : String(error),
    });
  }
}
