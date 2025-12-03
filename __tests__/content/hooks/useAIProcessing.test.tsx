/**
 * useAIProcessingフックのテスト
 * TDD RED: まずテストを作成し、失敗することを確認する
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAIProcessing } from '../../../src/content/hooks/useAIProcessing';
import * as aiService from '../../../src/shared/api/aiService';

// AIサービスをモック化
jest.mock('../../../src/shared/api/aiService');

// chrome.storage.sync APIのモック
const mockChromeStorageSync = {
  get: jest.fn(),
};

(global as any).chrome = {
  storage: {
    sync: mockChromeStorageSync,
  },
};

describe('useAIProcessing', () => {
  const mockExtractContent = aiService.extractMainContent as jest.MockedFunction<
    typeof aiService.extractMainContent
  >;
  const mockSummarizeContent = aiService.summarizeContent as jest.MockedFunction<
    typeof aiService.summarizeContent
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockChromeStorageSync.get.mockImplementation((keys, callback) => {
      callback({
        openrouterApiKey: 'test-api-key',
        openRouterModel: 'anthropic/claude-3-haiku',
      });
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAIProcessing('This is test content'));

      expect(result.current.state.isLoading).toBe(false);
      expect(result.current.state.error).toBe(null);
      expect(result.current.state.mode).toBe('original');
      expect(result.current.state.extractedText).toBe(null);
      expect(result.current.state.summaryText).toBe(null);
    });

    it('should detect API key presence', async () => {
      const { result } = renderHook(() => useAIProcessing('Test content'));

      await waitFor(() => {
        expect(result.current.hasApiKey).toBe(true);
      });
    });

    it('should detect when API key is missing', async () => {
      mockChromeStorageSync.get.mockImplementation((keys, callback) => {
        callback({ openrouterApiKey: '' });
      });

      const { result } = renderHook(() => useAIProcessing('Test content'));

      await waitFor(() => {
        expect(result.current.hasApiKey).toBe(false);
      });
    });
  });

  describe('extractContent', () => {
    it('should successfully extract content', async () => {
      const originalContent = 'This is a long article with lots of text...';
      const extractedText = 'This is the main content';

      mockExtractContent.mockResolvedValue(extractedText);

      const { result } = renderHook(() => useAIProcessing(originalContent));

      let extractedWords: string[] = [];

      await act(async () => {
        extractedWords = await result.current.extractContent();
      });

      expect(mockExtractContent).toHaveBeenCalledWith(originalContent, {
        openrouterApiKey: 'test-api-key',
        openRouterModel: 'anthropic/claude-3-haiku',
      });

      expect(result.current.state.mode).toBe('extracted');
      expect(result.current.state.extractedText).toBe(extractedText);
      expect(result.current.state.isLoading).toBe(false);
      expect(result.current.state.error).toBe(null);
      expect(extractedWords).toEqual(extractedText.split(/\s+/));
    });

    it('should set loading state during extraction', async () => {
      mockExtractContent.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve('Extracted'), 100))
      );

      const { result } = renderHook(() => useAIProcessing('Test content'));

      let promise: Promise<string[]>;

      act(() => {
        promise = result.current.extractContent();
      });

      // ローディング中
      expect(result.current.state.isLoading).toBe(true);
      expect(result.current.state.error).toBe(null);

      await act(async () => {
        await promise!;
      });

      // ローディング完了
      expect(result.current.state.isLoading).toBe(false);
    });

    it('should handle extraction errors', async () => {
      const errorMessage = 'API Error: Invalid API key';
      mockExtractContent.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useAIProcessing('Test content'));

      await act(async () => {
        await expect(result.current.extractContent()).rejects.toThrow(errorMessage);
      });

      expect(result.current.state.isLoading).toBe(false);
      expect(result.current.state.error).toBe(errorMessage);
      expect(result.current.state.extractedText).toBe(null);
    });

    it('should cache extracted content and not call API twice', async () => {
      mockExtractContent.mockResolvedValue('Extracted content');

      const { result } = renderHook(() => useAIProcessing('Original content'));

      await act(async () => {
        await result.current.extractContent();
      });

      expect(mockExtractContent).toHaveBeenCalledTimes(1);

      await act(async () => {
        await result.current.extractContent();
      });

      // キャッシュを使用するため、2回目は呼ばれない
      expect(mockExtractContent).toHaveBeenCalledTimes(1);
    });
  });

  describe('summarizeContent', () => {
    it('should successfully summarize content', async () => {
      const originalContent = 'This is a very long article...';
      const summaryText = 'Brief summary';

      mockSummarizeContent.mockResolvedValue(summaryText);

      const { result } = renderHook(() => useAIProcessing(originalContent));

      let summaryWords: string[] = [];

      await act(async () => {
        summaryWords = await result.current.summarizeContent();
      });

      expect(mockSummarizeContent).toHaveBeenCalledWith(originalContent, {
        openrouterApiKey: 'test-api-key',
        openRouterModel: 'anthropic/claude-3-haiku',
      });

      expect(result.current.state.mode).toBe('summary');
      expect(result.current.state.summaryText).toBe(summaryText);
      expect(result.current.state.isLoading).toBe(false);
      expect(result.current.state.error).toBe(null);
      expect(summaryWords).toEqual(summaryText.split(/\s+/));
    });

    it('should set loading state during summarization', async () => {
      mockSummarizeContent.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve('Summary'), 100))
      );

      const { result } = renderHook(() => useAIProcessing('Test content'));

      let promise: Promise<string[]>;

      act(() => {
        promise = result.current.summarizeContent();
      });

      // ローディング中
      expect(result.current.state.isLoading).toBe(true);
      expect(result.current.state.error).toBe(null);

      await act(async () => {
        await promise!;
      });

      // ローディング完了
      expect(result.current.state.isLoading).toBe(false);
    });

    it('should handle summarization errors', async () => {
      const errorMessage = 'API Error: Rate limit exceeded';
      mockSummarizeContent.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useAIProcessing('Test content'));

      await act(async () => {
        await expect(result.current.summarizeContent()).rejects.toThrow(errorMessage);
      });

      expect(result.current.state.isLoading).toBe(false);
      expect(result.current.state.error).toBe(errorMessage);
      expect(result.current.state.summaryText).toBe(null);
    });

    it('should cache summary content and not call API twice', async () => {
      mockSummarizeContent.mockResolvedValue('Summary text');

      const { result } = renderHook(() => useAIProcessing('Original content'));

      await act(async () => {
        await result.current.summarizeContent();
      });

      expect(mockSummarizeContent).toHaveBeenCalledTimes(1);

      await act(async () => {
        await result.current.summarizeContent();
      });

      // キャッシュを使用するため、2回目は呼ばれない
      expect(mockSummarizeContent).toHaveBeenCalledTimes(1);
    });
  });

  describe('resetToOriginal', () => {
    it('should reset mode to original', async () => {
      mockExtractContent.mockResolvedValue('Extracted content');

      const { result } = renderHook(() => useAIProcessing('Original content'));

      // まず抽出を実行
      await act(async () => {
        await result.current.extractContent();
      });

      expect(result.current.state.mode).toBe('extracted');

      // オリジナルにリセット
      act(() => {
        result.current.resetToOriginal();
      });

      expect(result.current.state.mode).toBe('original');
      expect(result.current.state.error).toBe(null);
    });

    it('should preserve cached content when resetting', async () => {
      mockExtractContent.mockResolvedValue('Extracted content');

      const { result } = renderHook(() => useAIProcessing('Original content'));

      await act(async () => {
        await result.current.extractContent();
      });

      const extractedText = result.current.state.extractedText;

      act(() => {
        result.current.resetToOriginal();
      });

      // キャッシュは保持される
      expect(result.current.state.extractedText).toBe(extractedText);
    });
  });

  describe('mode switching', () => {
    it('should allow switching between extracted and summary modes', async () => {
      mockExtractContent.mockResolvedValue('Extracted content');
      mockSummarizeContent.mockResolvedValue('Summary text');

      const { result } = renderHook(() => useAIProcessing('Original'));

      // 抽出
      await act(async () => {
        await result.current.extractContent();
      });
      expect(result.current.state.mode).toBe('extracted');

      // 要約
      await act(async () => {
        await result.current.summarizeContent();
      });
      expect(result.current.state.mode).toBe('summary');

      // 再び抽出
      await act(async () => {
        await result.current.extractContent();
      });
      expect(result.current.state.mode).toBe('extracted');
    });
  });

  describe('content change', () => {
    it('should clear cache when original content changes', async () => {
      mockExtractContent.mockResolvedValue('Extracted 1');

      const { result, rerender } = renderHook(
        ({ content }) => useAIProcessing(content),
        { initialProps: { content: 'Original 1' } }
      );

      await act(async () => {
        await result.current.extractContent();
      });

      expect(result.current.state.extractedText).toBe('Extracted 1');

      // コンテンツを変更
      rerender({ content: 'Original 2' });

      // キャッシュがクリアされる
      await waitFor(() => {
        expect(result.current.state.extractedText).toBe(null);
        expect(result.current.state.summaryText).toBe(null);
        expect(result.current.state.mode).toBe('original');
      });
    });
  });
});
