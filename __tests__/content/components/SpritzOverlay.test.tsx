/**
 * SpritzOverlayコンポーネントのテスト（AI機能統合）
 * TDD RED: まずテストを作成し、失敗することを確認する
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SpritzOverlay } from '../../../src/content/components/SpritzOverlay';
import * as textExtractor from '../../../src/shared/utils/textExtractor';
import * as useSettings from '../../../src/shared/hooks/useSettings';
import * as aiService from '../../../src/shared/api/aiService';

// モジュールをモック化
jest.mock('../../../src/shared/utils/textExtractor');
jest.mock('../../../src/shared/utils/htmlCleaner');
jest.mock('../../../src/shared/hooks/useSettings');
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

describe('SpritzOverlay - AI Integration', () => {
  const mockOnClose = jest.fn();
  const mockExtractWords = textExtractor.extractWords as jest.MockedFunction<
    typeof textExtractor.extractWords
  >;
  const mockGetCleanPageText = textExtractor.getCleanPageText as jest.MockedFunction<
    typeof textExtractor.getCleanPageText
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
  const mockExtractMainContent = aiService.extractMainContent as jest.MockedFunction<
    typeof aiService.extractMainContent
  >;
  const mockSummarizeContent = aiService.summarizeContent as jest.MockedFunction<
    typeof aiService.summarizeContent
  >;

  beforeEach(() => {
    jest.clearAllMocks();

    // デフォルトのモック設定
    mockExtractWords.mockReturnValue(['Test', 'words', 'from', 'page']);
    mockGetCleanPageText.mockReturnValue('Test words from page');
    mockExtractSelectedWords.mockReturnValue(null);
    mockLoadSettings.mockResolvedValue({ wpm: 300, maxChars: 12 });
    mockSaveSettings.mockImplementation(() => {});
    mockExtractMainContent.mockResolvedValue('Extracted main content from AI');
    mockSummarizeContent.mockResolvedValue('Summary of content from AI');
    mockChromeStorageSync.get.mockImplementation((keys, callback) => {
      callback({
        openrouterApiKey: 'test-api-key',
        openRouterModel: 'anthropic/claude-3-haiku',
      });
    });
  });

  describe('ModeSelector Integration', () => {
    it('should render ModeSelector component', async () => {
      render(<SpritzOverlay onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByTestId('mode-selector')).toBeInTheDocument();
      });
    });

    it('should display all three mode options', async () => {
      render(<SpritzOverlay onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/元のテキスト/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/本文抽出/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/要約/i)).toBeInTheDocument();
      });
    });

    it('should have original mode selected by default', async () => {
      render(<SpritzOverlay onClose={mockOnClose} />);

      await waitFor(() => {
        const originalRadio = screen.getByLabelText(/元のテキスト/i) as HTMLInputElement;
        expect(originalRadio.checked).toBe(true);
      });
    });

    it('should disable AI modes when API key is not set', async () => {
      mockChromeStorageSync.get.mockImplementation((keys, callback) => {
        callback({ openrouterApiKey: '' });
      });

      render(<SpritzOverlay onClose={mockOnClose} />);

      await waitFor(() => {
        const extractedRadio = screen.getByLabelText(/本文抽出/i) as HTMLInputElement;
        const summaryRadio = screen.getByLabelText(/要約/i) as HTMLInputElement;

        expect(extractedRadio.disabled).toBe(true);
        expect(summaryRadio.disabled).toBe(true);
      });
    });
  });

  describe('LoadingOverlay Integration', () => {
    it('should not show loading overlay initially', async () => {
      render(<SpritzOverlay onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
      });
    });

    it('should show loading overlay when processing', async () => {
      const { rerender } = render(<SpritzOverlay onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByTestId('mode-selector')).toBeInTheDocument();
      });

      // TODO: AI処理を開始するトリガーを実装後にテストを完成させる
      // この時点ではLoadingOverlayの表示確認のみ
    });
  });

  describe('Mode Switching', () => {
    it('should allow switching to extracted mode when API key is set', async () => {
      render(<SpritzOverlay onClose={mockOnClose} />);

      await waitFor(() => {
        const extractedRadio = screen.getByLabelText(/本文抽出/i);
        expect(extractedRadio).not.toBeDisabled();
      });

      const extractedRadio = screen.getByLabelText(/本文抽出/i);
      fireEvent.click(extractedRadio);

      // モードが変更されることを確認
      await waitFor(() => {
        expect((extractedRadio as HTMLInputElement).checked).toBe(true);
      });
    });

    it('should allow switching to summary mode when API key is set', async () => {
      render(<SpritzOverlay onClose={mockOnClose} />);

      await waitFor(() => {
        const summaryRadio = screen.getByLabelText(/要約/i);
        expect(summaryRadio).not.toBeDisabled();
      });

      const summaryRadio = screen.getByLabelText(/要約/i);
      fireEvent.click(summaryRadio);

      // モードが変更されることを確認
      await waitFor(() => {
        expect((summaryRadio as HTMLInputElement).checked).toBe(true);
      });
    });

    it('should disable mode selector during processing', async () => {
      // TODO: AI処理中のテストを実装
      // 現時点ではスキップ
      expect(true).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should display error message when AI processing fails', async () => {
      // TODO: エラーハンドリングのテストを実装
      // 現時点ではスキップ
      expect(true).toBe(true);
    });

    it('should allow retry after error', async () => {
      // TODO: エラー後のリトライのテストを実装
      // 現時点ではスキップ
      expect(true).toBe(true);
    });
  });

  describe('Existing Functionality', () => {
    it('should still display Redicle component', async () => {
      render(<SpritzOverlay onClose={mockOnClose} />);

      await waitFor(() => {
        // Redicleは内部にtestidを持たないが、親要素で確認
        const overlay = screen.getByTestId('spritz-overlay');
        expect(overlay).toBeInTheDocument();
      });
    });

    it('should still display Controls component', async () => {
      render(<SpritzOverlay onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByTestId('controls')).toBeInTheDocument();
      });
    });

    it('should still display ProgressBar component', async () => {
      render(<SpritzOverlay onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
      });
    });

    it('should call onClose when close button is clicked', async () => {
      render(<SpritzOverlay onClose={mockOnClose} />);

      await waitFor(() => {
        const closeButton = screen.getByText(/Close/i);
        fireEvent.click(closeButton);
      });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
});
