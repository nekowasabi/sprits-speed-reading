/**
 * useSpritzReaderフックのテスト（setWordsメソッド追加）
 * TDD RED: 新機能のテストを追加し、失敗することを確認する
 */
import { renderHook, act } from '@testing-library/react';
import { useSpritzReader } from '../../../src/shared/hooks/useSpritzReader';
import * as textExtractor from '../../../src/shared/utils/textExtractor';
import * as useSettings from '../../../src/shared/hooks/useSettings';

// モジュールをモック化
jest.mock('../../../src/shared/utils/textExtractor');
jest.mock('../../../src/shared/hooks/useSettings');

describe('useSpritzReader - setWords method', () => {
  const mockExtractWords = textExtractor.extractWords as jest.MockedFunction<
    typeof textExtractor.extractWords
  >;
  const mockExtractSelectedWords =
    textExtractor.extractSelectedWords as jest.MockedFunction<
      typeof textExtractor.extractSelectedWords
    >;
  const mockLoadSettings = useSettings.loadSettings as jest.MockedFunction<
    typeof useSettings.loadSettings
  >;
  const mockSaveSettings = useSettings.saveSettings as jest.MockedFunction<
    typeof useSettings.saveSettings
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // デフォルトのモック設定
    mockExtractWords.mockReturnValue(['default', 'words', 'from', 'page']);
    mockExtractSelectedWords.mockReturnValue(null);
    mockLoadSettings.mockResolvedValue({ wpm: 300, maxChars: 12 });
    mockSaveSettings.mockImplementation(() => {});
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('setWords', () => {
    it('should exist as a method in the return value', async () => {
      const { result } = renderHook(() => useSpritzReader());

      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.setWords).toBeDefined();
      expect(typeof result.current.setWords).toBe('function');
    });

    it('should replace words with new array', async () => {
      const { result } = renderHook(() => useSpritzReader());

      await act(async () => {
        await Promise.resolve();
      });

      const initialWords = result.current.state.words;
      expect(initialWords).toEqual(['default', 'words', 'from', 'page']);

      // 新しい単語配列をセット
      const newWords = ['new', 'extracted', 'content'];

      act(() => {
        result.current.setWords(newWords);
      });

      expect(result.current.state.words).toEqual(newWords);
      expect(result.current.state.words).not.toEqual(initialWords);
    });

    it('should process words with current maxChars setting', async () => {
      const { result } = renderHook(() => useSpritzReader());

      await act(async () => {
        await Promise.resolve();
      });

      // maxCharsを変更
      act(() => {
        result.current.setMaxChars(6);
      });

      const longWords = ['verylongword', 'another', 'test'];

      act(() => {
        result.current.setWords(longWords);
      });

      // preprocessWordsが呼ばれるため、長い単語は分割される可能性がある
      expect(result.current.state.words.length).toBeGreaterThanOrEqual(longWords.length);
    });

    it('should reset currentWordIndex to 0 when setting new words', async () => {
      const { result } = renderHook(() => useSpritzReader());

      await act(async () => {
        await Promise.resolve();
      });

      // インデックスを進める
      act(() => {
        result.current.play();
        jest.advanceTimersByTime(200);
        result.current.pause();
      });

      expect(result.current.state.currentWordIndex).toBeGreaterThan(0);

      // 新しい単語をセット
      act(() => {
        result.current.setWords(['reset', 'test']);
      });

      expect(result.current.state.currentWordIndex).toBe(0);
    });

    it('should pause playback when setting new words', async () => {
      const { result } = renderHook(() => useSpritzReader());

      await act(async () => {
        await Promise.resolve();
      });

      // 再生開始
      act(() => {
        result.current.play();
      });

      expect(result.current.state.isPaused).toBe(false);

      // 新しい単語をセット
      act(() => {
        result.current.setWords(['pause', 'test']);
      });

      expect(result.current.state.isPaused).toBe(true);
    });

    it('should handle empty array', async () => {
      const { result } = renderHook(() => useSpritzReader());

      await act(async () => {
        await Promise.resolve();
      });

      act(() => {
        result.current.setWords([]);
      });

      expect(result.current.state.words).toEqual([]);
      expect(result.current.currentWord).toBe('');
      expect(result.current.progress).toBe(0);
    });

    it('should handle array with single word', async () => {
      const { result } = renderHook(() => useSpritzReader());

      await act(async () => {
        await Promise.resolve();
      });

      act(() => {
        result.current.setWords(['single']);
      });

      expect(result.current.state.words).toEqual(['single']);
      expect(result.current.currentWord).toBe('single');
    });

    it('should update rawWordsRef for subsequent maxChars changes', async () => {
      const { result } = renderHook(() => useSpritzReader());

      await act(async () => {
        await Promise.resolve();
      });

      const newWords = ['test', 'words', 'array'];

      act(() => {
        result.current.setWords(newWords);
      });

      const wordsAfterSet = result.current.state.words;

      // maxCharsを変更すると、rawWordsRefを使って再処理される
      act(() => {
        result.current.setMaxChars(8);
      });

      // rawWordsRefが正しく更新されていれば、新しい単語が使われる
      expect(result.current.state.words).toEqual(newWords);
    });
  });

  describe('integration with AI processing', () => {
    it('should work with extracted content from AI', async () => {
      const { result } = renderHook(() => useSpritzReader());

      await act(async () => {
        await Promise.resolve();
      });

      // AIで抽出したコンテンツをシミュレート
      const extractedText = 'This is the main content extracted by AI';
      const extractedWords = extractedText.split(/\s+/);

      act(() => {
        result.current.setWords(extractedWords);
      });

      expect(result.current.state.words).toEqual(extractedWords);
      expect(result.current.state.currentWordIndex).toBe(0);
      expect(result.current.state.isPaused).toBe(true);
    });

    it('should work with summarized content from AI', async () => {
      const { result } = renderHook(() => useSpritzReader());

      await act(async () => {
        await Promise.resolve();
      });

      // AIで要約したコンテンツをシミュレート
      const summaryText = 'Brief summary of article';
      const summaryWords = summaryText.split(/\s+/);

      act(() => {
        result.current.setWords(summaryWords);
      });

      expect(result.current.state.words).toEqual(summaryWords);
    });
  });
});
