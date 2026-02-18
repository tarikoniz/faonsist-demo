// ============================================
// FaOnSisT - Multi-AI Provider Type Definitions
// Provider soyutlama katmani tipleri
// ============================================

/** Desteklenen AI saglayici kimlikleri */
export type AiProviderId = 'anthropic' | 'huggingface';

/** Her AI saglayicinin uygulamasi gereken arayuz */
export interface AiProvider {
  readonly id: AiProviderId;
  readonly displayName: string;   // "Claude", "HuggingFace"
  readonly defaultModel: string;  // Varsayilan model adi

  /** API key konfigüre edilmis mi? */
  isConfigured(): boolean;

  /** Chat completion istegi gonder. API hatasinda throw eder. */
  chat(request: AiChatRequest): Promise<AiChatResponse>;
}

/** Provider'a gonderilecek chat istegi */
export interface AiChatRequest {
  systemPrompt: string;
  userMessage: string;
  maxTokens: number;
  timeoutMs: number;
}

/** Provider'dan donen chat yaniti */
export interface AiChatResponse {
  text: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
}

/** Provider saglik durumu (in-memory) */
export interface ProviderHealth {
  providerId: AiProviderId;
  available: boolean;
  consecutiveFailures: number;
  cooldownUntil?: number;   // timestamp — bu zamana kadar atla
  lastError?: string;
  lastErrorAt?: number;     // timestamp
}
