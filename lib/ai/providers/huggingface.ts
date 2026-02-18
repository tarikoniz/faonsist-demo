// ============================================
// FaOnSisT - Hugging Face Provider
// router.huggingface.co (OpenAI uyumlu)
// ============================================

import type { AiProvider, AiChatRequest, AiChatResponse } from '../types';

export class HuggingFaceProvider implements AiProvider {
  readonly id = 'huggingface' as const;
  readonly displayName = 'HuggingFace';
  readonly defaultModel: string;

  constructor() {
    this.defaultModel = process.env.HF_MODEL || 'Qwen/Qwen2.5-72B-Instruct';
  }

  isConfigured(): boolean {
    return !!(process.env.HF_API_KEY);
  }

  async chat(req: AiChatRequest): Promise<AiChatResponse> {
    const model = this.defaultModel;
    const url = 'https://router.huggingface.co/v1/chat/completions';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.HF_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: req.maxTokens,
        messages: [
          { role: 'system', content: req.systemPrompt },
          { role: 'user', content: req.userMessage },
        ],
      }),
      signal: AbortSignal.timeout(req.timeoutMs),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HuggingFace API ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    return {
      text: data.choices?.[0]?.message?.content || '',
      model: data.model || model,
      inputTokens: data.usage?.prompt_tokens || 0,
      outputTokens: data.usage?.completion_tokens || 0,
    };
  }
}
