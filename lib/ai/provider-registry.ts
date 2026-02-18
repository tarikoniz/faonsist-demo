// ============================================
// FaOnSisT - AI Provider Registry
// Provider kayit, saglik takibi, fallback yonetimi
// ============================================

import type { AiProvider, AiProviderId, ProviderHealth } from './types';
import { AnthropicProvider } from './providers/anthropic';
import { HuggingFaceProvider } from './providers/huggingface';

// Singleton maps
const providers = new Map<AiProviderId, AiProvider>();
const healthMap = new Map<AiProviderId, ProviderHealth>();

// 3 ardisik hata → 5 dakika cooldown
const MAX_CONSECUTIVE_FAILURES = 3;
const COOLDOWN_MS = 5 * 60 * 1000;

// ---- Initialization ----

function initProviders(): void {
  if (providers.size > 0) return;

  const all: AiProvider[] = [
    new AnthropicProvider(),
    new HuggingFaceProvider(),
  ];

  for (const p of all) {
    providers.set(p.id, p);
    healthMap.set(p.id, {
      providerId: p.id,
      available: true,
      consecutiveFailures: 0,
    });
  }
}

// ---- Public API ----

/** API key'i konfigüre edilmis tum providerlar */
export function getConfiguredProviders(): AiProvider[] {
  initProviders();
  return Array.from(providers.values()).filter(p => p.isConfigured());
}

/** Belirli bir provider */
export function getProvider(id: AiProviderId): AiProvider | undefined {
  initProviders();
  return providers.get(id);
}

/** Provider saglikli mi? (cooldown'da degil mi?) */
export function isProviderHealthy(id: AiProviderId): boolean {
  const h = healthMap.get(id);
  if (!h) return false;
  // Cooldown suresi dolmussa tekrar deneyelim
  if (h.cooldownUntil && Date.now() >= h.cooldownUntil) {
    h.cooldownUntil = undefined;
    h.available = true;
  }
  return h.available;
}

/** Basarili istek sonrasi: hata sayacini sifirla */
export function markProviderSuccess(id: AiProviderId): void {
  const h = healthMap.get(id);
  if (h) {
    h.available = true;
    h.consecutiveFailures = 0;
    h.cooldownUntil = undefined;
    h.lastError = undefined;
    h.lastErrorAt = undefined;
  }
}

/** Basarisiz istek sonrasi: hata sayacini artir, gerekirse cooldown uygula */
export function markProviderFailure(id: AiProviderId, error: string): void {
  const h = healthMap.get(id);
  if (h) {
    h.consecutiveFailures++;
    h.lastError = error;
    h.lastErrorAt = Date.now();

    if (h.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      h.cooldownUntil = Date.now() + COOLDOWN_MS;
      h.available = false;
    }
  }
}

/** Varsayilan provider ID (env veya anthropic) */
export function getDefaultProviderId(): AiProviderId {
  const envDefault = process.env.AI_DEFAULT_PROVIDER as AiProviderId | undefined;
  if (envDefault && ['anthropic', 'huggingface'].includes(envDefault)) {
    return envDefault;
  }
  return 'anthropic';
}

/** Frontend icin tum provider durumlari */
export function getAllProviderStatuses(): Array<{
  id: AiProviderId;
  displayName: string;
  configured: boolean;
  healthy: boolean;
  model: string;
}> {
  initProviders();
  return Array.from(providers.values()).map(p => ({
    id: p.id,
    displayName: p.displayName,
    configured: p.isConfigured(),
    healthy: p.isConfigured() ? isProviderHealthy(p.id) : false,
    model: p.defaultModel,
  }));
}
