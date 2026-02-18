// ============================================
// FaOnSisT - Anthropic Claude Provider
// api.anthropic.com/v1/messages
// ============================================

import type { AiProvider, AiChatRequest, AiChatResponse } from '../types';

export class AnthropicProvider implements AiProvider {
  readonly id = 'anthropic' as const;
  readonly displayName = 'Claude';
  readonly defaultModel: string;

  constructor() {
    this.defaultModel = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';
  }

  isConfigured(): boolean {
    return !!(process.env.ANTHROPIC_API_KEY);
  }

  async chat(req: AiChatRequest): Promise<AiChatResponse> {
    const apiKey = process.env.ANTHROPIC_API_KEY!;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.defaultModel,
        max_tokens: req.maxTokens,
        system: req.systemPrompt,
        messages: [{ role: 'user', content: req.userMessage }],
      }),
      signal: AbortSignal.timeout(req.timeoutMs),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    const text = data.content
      ?.filter((block: Record<string, unknown>) => block.type === 'text')
      ?.map((block: Record<string, unknown>) => block.text)
      ?.join('\n') || '';

    return {
      text,
      model: this.defaultModel,
      inputTokens: data.usage?.input_tokens || 0,
      outputTokens: data.usage?.output_tokens || 0,
    };
  }
}
