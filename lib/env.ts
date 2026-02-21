// ============================================
// FaOnSisT - Environment Variable Validation
// Server başlatılırken çevre değişkenlerini doğrula
// ============================================

interface EnvConfig {
  // Required
  DATABASE_URL: string;
  JWT_SECRET: string;
  REFRESH_TOKEN_SECRET: string;

  // Optional with defaults
  NODE_ENV: string;
  PORT: number;
  BCRYPT_ROUNDS: number;
  JWT_EXPIRES_IN: string;
  REFRESH_TOKEN_EXPIRES_IN: string;

  // AI — Anthropic (Claude)
  ENABLE_CLAUDE_AI: boolean;
  ANTHROPIC_API_KEY: string;
  CLAUDE_MODEL: string;
  CLAUDE_MAX_TOKENS: number;
  AI_RATE_LIMIT: number;
  AI_DEFAULT_PROVIDER: string;

  // AI — OpenAI (ChatGPT)
  OPENAI_API_KEY: string;
  OPENAI_MODEL: string;

  // AI — Google (Gemini)
  GEMINI_API_KEY: string;
  GEMINI_MODEL: string;

  // AI — xAI (Grok)
  XAI_API_KEY: string;
  GROK_MODEL: string;

  // AI — Hugging Face
  HF_API_KEY: string;
  HF_MODEL: string;

  // CORS
  CORS_ORIGIN: string;
}

export function validateEnv(): EnvConfig {
  const errors: string[] = [];

  // Required variables
  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL is required');
  }

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET is required and must be at least 32 characters');
  }

  if (!process.env.REFRESH_TOKEN_SECRET || process.env.REFRESH_TOKEN_SECRET.length < 32) {
    errors.push('REFRESH_TOKEN_SECRET is required and must be at least 32 characters');
  }

  // Production-specific warnings (uyarı olarak logla, server'ı durdurma)
  const warnings: string[] = [];
  if (process.env.NODE_ENV === 'production') {
    if (process.env.JWT_SECRET?.includes('change-in-production')) {
      warnings.push('JWT_SECRET varsayılan değer içeriyor — üretim için değiştirilmesi önerilir');
    }
    if (process.env.CORS_ORIGIN === '*') {
      warnings.push('CORS_ORIGIN üretimde * olmamalı');
    }
  }

  if (warnings.length > 0) {
    console.warn('\n========================================');
    console.warn('  FaOnSisT - Environment Warnings');
    console.warn('========================================');
    warnings.forEach(w => console.warn(`  ⚠️  ${w}`));
    console.warn('========================================\n');
  }

  if (errors.length > 0) {
    console.error('\n========================================');
    console.error('  FaOnSisT - Environment Errors');
    console.error('========================================');
    errors.forEach(e => console.error(`  ❌ ${e}`));
    console.error('========================================\n');

    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }

  return {
    DATABASE_URL: process.env.DATABASE_URL || '',
    JWT_SECRET: process.env.JWT_SECRET || '',
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || '',
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3000'),
    BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12'),
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    ENABLE_CLAUDE_AI: process.env.ENABLE_CLAUDE_AI === 'true',
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
    CLAUDE_MODEL: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
    CLAUDE_MAX_TOKENS: parseInt(process.env.CLAUDE_MAX_TOKENS || '1024'),
    AI_RATE_LIMIT: parseInt(process.env.AI_RATE_LIMIT || '20'),
    AI_DEFAULT_PROVIDER: process.env.AI_DEFAULT_PROVIDER || 'anthropic',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    XAI_API_KEY: process.env.XAI_API_KEY || '',
    GROK_MODEL: process.env.GROK_MODEL || 'grok-3',
    HF_API_KEY: process.env.HF_API_KEY || '',
    HF_MODEL: process.env.HF_MODEL || 'Qwen/Qwen2.5-72B-Instruct',
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  };
}
