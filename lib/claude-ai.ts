// ============================================
// FaOnSisT - Claude AI Geriye Uyumlu Shim
// Eski import'lar icin re-export katmani
// Gercek implementasyon: lib/ai/chat-service.ts
// ============================================

// chatWithClaude eski adi ile export (geriye uyumluluk)
export { chatWithAi as chatWithClaude } from './ai/chat-service';

// Sabitler
export {
  SYSTEM_PROMPT,
  ENABLE_CLAUDE_AI,
  AI_RATE_LIMIT,
  getRemainingRequests,
} from './ai/chat-service';

// Tip export'lari (eski isimlerle)
export type {
  AiChatServiceRequest as ClaudeChatRequest,
  AiChatServiceResponse as ClaudeChatResponse,
} from './ai/chat-service';
