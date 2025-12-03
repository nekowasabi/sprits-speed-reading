/**
 * AIサービスのテスト
 * TDD RED: まずテストを作成し、失敗することを確認する
 */
import { AIService } from '@shared/api/aiService';
import { OpenRouterClient } from '@shared/api/openRouterClient';
import { AISettings } from '@shared/types';

// OpenRouterClientのモック
jest.mock('@shared/api/openRouterClient');

const MockedOpenRouterClient = OpenRouterClient as jest.MockedClass<typeof OpenRouterClient>;

describe('AIService', () => {
  let mockClient: jest.Mocked<OpenRouterClient>;
  const testSettings: AISettings = {
    openrouterApiKey: 'sk-or-test-key',
    openRouterModel: 'google/gemini-2.0-flash-exp:free',
    openRouterProvider: 'Google',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = {
      generateCompletion: jest.fn(),
    } as unknown as jest.Mocked<OpenRouterClient>;
    MockedOpenRouterClient.mockImplementation(() => mockClient);
  });

  describe('constructor', () => {
    it('should create service with valid settings', () => {
      const service = new AIService(testSettings);
      expect(service).toBeInstanceOf(AIService);
      expect(MockedOpenRouterClient).toHaveBeenCalledWith('sk-or-test-key');
    });
  });

  describe('extractMainContent', () => {
    it('should call OpenRouter API with extraction prompt', async () => {
      mockClient.generateCompletion.mockResolvedValueOnce('Extracted article content here.');

      const service = new AIService(testSettings);
      const pageText = `
        <nav>Navigation menu</nav>
        <header>Site header</header>
        <article>
          This is the main article content that we want to extract.
          It contains important information for the reader.
        </article>
        <aside>Sidebar with ads</aside>
        <footer>Site footer</footer>
      `;

      const result = await service.extractMainContent(pageText);

      expect(result).toBe('Extracted article content here.');
      expect(mockClient.generateCompletion).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'google/gemini-2.0-flash-exp:free',
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'user',
              content: expect.stringContaining('本文のみを抽出'),
            }),
          ]),
          provider: 'Google',
        })
      );
    });

    it('should truncate long text to prevent token overflow', async () => {
      mockClient.generateCompletion.mockResolvedValueOnce('Extracted content.');

      const service = new AIService(testSettings);
      // 20000文字のテキストを生成
      const longText = 'a'.repeat(20000);

      await service.extractMainContent(longText);

      const call = mockClient.generateCompletion.mock.calls[0][0];
      const promptContent = call.messages[0].content;
      // テキストが15000文字で切り詰められていることを確認
      expect(promptContent.length).toBeLessThan(20000);
    });

    it('should handle empty response', async () => {
      mockClient.generateCompletion.mockResolvedValueOnce('');

      const service = new AIService(testSettings);
      const result = await service.extractMainContent('Some text');

      expect(result).toBe('');
    });
  });

  describe('summarize', () => {
    it('should call OpenRouter API with summarization prompt', async () => {
      mockClient.generateCompletion.mockResolvedValueOnce('This is a summary of the article.');

      const service = new AIService(testSettings);
      const pageText = `
        This is a long article about technology.
        It covers many topics including AI, cloud computing, and web development.
        The article discusses the future of these technologies.
      `;

      const result = await service.summarize(pageText);

      expect(result).toBe('This is a summary of the article.');
      expect(mockClient.generateCompletion).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'google/gemini-2.0-flash-exp:free',
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'user',
              content: expect.stringContaining('要約'),
            }),
          ]),
          provider: 'Google',
        })
      );
    });

    it('should truncate long text for summarization', async () => {
      mockClient.generateCompletion.mockResolvedValueOnce('Summary.');

      const service = new AIService(testSettings);
      const longText = 'b'.repeat(20000);

      await service.summarize(longText);

      const call = mockClient.generateCompletion.mock.calls[0][0];
      const promptContent = call.messages[0].content;
      expect(promptContent.length).toBeLessThan(20000);
    });

    it('should handle empty response', async () => {
      mockClient.generateCompletion.mockResolvedValueOnce('');

      const service = new AIService(testSettings);
      const result = await service.summarize('Some text');

      expect(result).toBe('');
    });
  });

  describe('settings without provider', () => {
    it('should work without provider specified', async () => {
      const settingsNoProvider: AISettings = {
        openrouterApiKey: 'sk-or-test-key',
        openRouterModel: 'anthropic/claude-3-haiku',
      };

      mockClient.generateCompletion.mockResolvedValueOnce('Response');

      const service = new AIService(settingsNoProvider);
      await service.extractMainContent('Some text');

      expect(mockClient.generateCompletion).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'anthropic/claude-3-haiku',
          provider: undefined,
        })
      );
    });
  });
});
