/**
 * AIサービス
 * OpenRouter APIを使用して本文抽出・要約を行う
 */
import { OpenRouterClient } from './openRouterClient';
import { AISettings } from '@shared/types';

// テキストの最大長（トークン制限を考慮）
const MAX_TEXT_LENGTH = 15000;

export class AIService {
  private client: OpenRouterClient;
  private model: string;
  private provider?: string;

  constructor(settings: AISettings) {
    this.client = new OpenRouterClient(settings.openrouterApiKey);
    this.model = settings.openRouterModel;
    this.provider = settings.openRouterProvider;
  }

  /**
   * テキストを最大長で切り詰める
   */
  private truncateText(text: string): string {
    if (text.length <= MAX_TEXT_LENGTH) {
      return text;
    }
    return text.slice(0, MAX_TEXT_LENGTH) + '...（以下省略）';
  }

  /**
   * ページテキストから本文のみを抽出する
   * 広告、ナビゲーション、サイドバー等を除外
   */
  async extractMainContent(pageText: string): Promise<string> {
    const truncatedText = this.truncateText(pageText);

    const prompt = `以下のテキストから広告、ナビゲーション、フッター、サイドバーなどを除外し、
記事の本文のみを抽出してください。整形せず、元のテキストをそのまま返してください。
余計な説明は不要です。本文のみを出力してください。

テキスト:
${truncatedText}`;

    const response = await this.client.generateCompletion({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3, // 抽出は低温度で正確に
      maxTokens: 4000,
      provider: this.provider,
    });

    return response;
  }

  /**
   * ページテキストを要約する
   */
  async summarize(pageText: string): Promise<string> {
    const truncatedText = this.truncateText(pageText);

    const prompt = `以下のテキストを重要なポイントを保持しながら簡潔に要約してください。
箇条書きではなく、自然な文章で要約してください。
余計な説明は不要です。要約のみを出力してください。

テキスト:
${truncatedText}`;

    const response = await this.client.generateCompletion({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5, // 要約はやや創造的に
      maxTokens: 1000,
      provider: this.provider,
    });

    return response;
  }
}

/**
 * 本文を抽出する（関数形式）
 */
export async function extractMainContent(
  pageText: string,
  settings: AISettings
): Promise<string> {
  const service = new AIService(settings);
  return service.extractMainContent(pageText);
}

/**
 * テキストを要約する（関数形式）
 */
export async function summarizeContent(
  pageText: string,
  settings: AISettings
): Promise<string> {
  const service = new AIService(settings);
  return service.summarize(pageText);
}
