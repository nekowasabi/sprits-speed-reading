/**
 * OpenRouter APIクライアント
 * feynman-techniqueプロジェクトから移植
 */
import {
  CompletionParams,
  HttpStatus,
  HttpError,
  ApiQuotaError,
  RateLimitError,
  ServerError,
  UnauthorizedError,
} from '@shared/types';

export interface IOpenRouterClient {
  generateCompletion(params: CompletionParams): Promise<string>;
}

export class OpenRouterClient implements IOpenRouterClient {
  private readonly API_ENDPOINT = 'https://openrouter.ai/api/v1';
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey || apiKey.trim() === '') {
      throw new UnauthorizedError('API key is required');
    }
    this.apiKey = apiKey;
  }

  private buildAuthHeader(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://github.com/user/sprits-speed-reading',
      'X-Title': 'Spritz Speed Reader Extension',
    };
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async retry<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    initialDelayMs = 1000
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // 401, 402エラーはリトライしない
        if (error instanceof ApiQuotaError || error instanceof UnauthorizedError) {
          throw error;
        }

        if (attempt < maxRetries) {
          const delayMs = initialDelayMs * Math.pow(2, attempt); // 指数バックオフ
          console.log(`Retry attempt ${attempt + 1} after ${delayMs}ms`);
          await this.sleep(delayMs);
        }
      }
    }

    throw lastError;
  }

  private async callApi(endpoint: string, method: string, body?: unknown): Promise<unknown> {
    const response = await fetch(`${this.API_ENDPOINT}${endpoint}`, {
      method,
      headers: this.buildAuthHeader(),
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error ${response.status}:`, errorText);

      switch (response.status) {
        case HttpStatus.UNAUTHORIZED:
          throw new UnauthorizedError('Invalid API key');
        case HttpStatus.PAYMENT_REQUIRED:
          throw new ApiQuotaError('OpenRouter credits exhausted');
        case HttpStatus.TOO_MANY_REQUESTS:
          throw new RateLimitError('Rate limit exceeded, retry after 60s');
        case HttpStatus.SERVER_ERROR:
          throw new ServerError('OpenRouter server error, retry later');
        default:
          throw new HttpError(response.status, errorText || response.statusText);
      }
    }

    return response.json();
  }

  async generateCompletion(params: CompletionParams): Promise<string> {
    const requestBody: Record<string, unknown> = {
      model: params.model,
      messages: params.messages,
      temperature: params.temperature ?? 0.7,
      top_k: params.topK ?? 10,
      max_tokens: params.maxTokens ?? 1000,
    };

    // プロバイダ指定がある場合は追加
    if (params.provider && params.provider.trim() !== '') {
      requestBody.provider = { order: [params.provider.trim()] };
      console.log('[OpenRouterClient] Using provider:', params.provider);
    }

    return this.retry(async () => {
      const response = await this.callApi('/chat/completions', 'POST', requestBody);
      const data = response as {
        choices?: Array<{ message?: { content?: string } }>;
      };

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from OpenRouter API');
      }

      return data.choices[0].message.content || '';
    });
  }
}
