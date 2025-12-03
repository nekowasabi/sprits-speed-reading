/**
 * AI関連型定義のテスト
 * TDD RED: まずテストを作成し、失敗することを確認する
 */
import {
  ReadingMode,
  AISettings,
  AIProcessingState,
  HttpStatus,
  HttpError,
  UnauthorizedError,
  ApiQuotaError,
  RateLimitError,
  ServerError,
  CompletionParams,
} from '@shared/types';

describe('AI Types', () => {
  describe('ReadingMode', () => {
    it('should accept valid reading modes', () => {
      const modes: ReadingMode[] = ['original', 'extracted', 'summary'];
      expect(modes).toHaveLength(3);
      expect(modes).toContain('original');
      expect(modes).toContain('extracted');
      expect(modes).toContain('summary');
    });
  });

  describe('AISettings', () => {
    it('should have required properties', () => {
      const settings: AISettings = {
        openrouterApiKey: 'sk-or-test-key',
        openRouterModel: 'google/gemini-2.0-flash-exp:free',
        openRouterProvider: 'Google',
      };

      expect(settings.openrouterApiKey).toBe('sk-or-test-key');
      expect(settings.openRouterModel).toBe('google/gemini-2.0-flash-exp:free');
      expect(settings.openRouterProvider).toBe('Google');
    });

    it('should allow optional provider', () => {
      const settings: AISettings = {
        openrouterApiKey: 'sk-or-test-key',
        openRouterModel: 'anthropic/claude-3-haiku',
      };

      expect(settings.openRouterProvider).toBeUndefined();
    });
  });

  describe('AIProcessingState', () => {
    it('should have all required state properties', () => {
      const state: AIProcessingState = {
        isLoading: false,
        error: null,
        mode: 'original',
        extractedText: null,
        summaryText: null,
      };

      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.mode).toBe('original');
      expect(state.extractedText).toBeNull();
      expect(state.summaryText).toBeNull();
    });

    it('should allow loading state with error', () => {
      const state: AIProcessingState = {
        isLoading: false,
        error: 'API key invalid',
        mode: 'summary',
        extractedText: null,
        summaryText: null,
      };

      expect(state.error).toBe('API key invalid');
    });
  });

  describe('HttpStatus', () => {
    it('should have correct status codes', () => {
      expect(HttpStatus.OK).toBe(200);
      expect(HttpStatus.UNAUTHORIZED).toBe(401);
      expect(HttpStatus.PAYMENT_REQUIRED).toBe(402);
      expect(HttpStatus.TOO_MANY_REQUESTS).toBe(429);
      expect(HttpStatus.SERVER_ERROR).toBe(500);
    });
  });

  describe('HttpError classes', () => {
    it('should create HttpError with status and message', () => {
      const error = new HttpError(404, 'Not Found');
      expect(error.status).toBe(404);
      expect(error.message).toBe('Not Found');
      expect(error).toBeInstanceOf(Error);
    });

    it('should create UnauthorizedError', () => {
      const error = new UnauthorizedError('Invalid API key');
      expect(error.status).toBe(401);
      expect(error.message).toBe('Invalid API key');
      expect(error).toBeInstanceOf(HttpError);
    });

    it('should create ApiQuotaError', () => {
      const error = new ApiQuotaError('Credits exhausted');
      expect(error.status).toBe(402);
      expect(error.message).toBe('Credits exhausted');
      expect(error).toBeInstanceOf(HttpError);
    });

    it('should create RateLimitError', () => {
      const error = new RateLimitError('Too many requests');
      expect(error.status).toBe(429);
      expect(error.message).toBe('Too many requests');
      expect(error).toBeInstanceOf(HttpError);
    });

    it('should create ServerError', () => {
      const error = new ServerError('Internal server error');
      expect(error.status).toBe(500);
      expect(error.message).toBe('Internal server error');
      expect(error).toBeInstanceOf(HttpError);
    });
  });

  describe('CompletionParams', () => {
    it('should have required and optional properties', () => {
      const params: CompletionParams = {
        model: 'google/gemini-2.0-flash-exp:free',
        messages: [{ role: 'user', content: 'Hello' }],
      };

      expect(params.model).toBe('google/gemini-2.0-flash-exp:free');
      expect(params.messages).toHaveLength(1);
    });

    it('should accept all optional parameters', () => {
      const params: CompletionParams = {
        model: 'anthropic/claude-3-haiku',
        messages: [{ role: 'user', content: 'Test' }],
        temperature: 0.7,
        topK: 10,
        maxTokens: 1000,
        provider: 'Anthropic',
      };

      expect(params.temperature).toBe(0.7);
      expect(params.topK).toBe(10);
      expect(params.maxTokens).toBe(1000);
      expect(params.provider).toBe('Anthropic');
    });
  });
});
