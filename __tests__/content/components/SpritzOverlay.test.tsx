/**
 * SpritzOverlayコンポーネントのテスト
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SpritzOverlay } from '../../../src/content/components/SpritzOverlay';
import * as textExtractor from '../../../src/shared/utils/textExtractor';
import * as useSettings from '../../../src/shared/hooks/useSettings';

// モジュールをモック化
jest.mock('../../../src/shared/utils/textExtractor');
jest.mock('../../../src/shared/hooks/useSettings');

describe('SpritzOverlay', () => {
  const mockOnClose = jest.fn();
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

    // デフォルトのモック設定
    mockExtractWords.mockReturnValue(['Test', 'words', 'from', 'page']);
    mockExtractSelectedWords.mockReturnValue(null);
    mockLoadSettings.mockResolvedValue({ wpm: 300, maxChars: 12 });
    mockSaveSettings.mockImplementation(() => {});
  });

  describe('Basic Rendering', () => {
    it('should render the overlay', async () => {
      render(<SpritzOverlay onClose={mockOnClose} />);

      await waitFor(() => {
        const overlay = screen.getByTestId('spritz-overlay');
        expect(overlay).toBeInTheDocument();
      });
    });

    it('should display Controls component', async () => {
      render(<SpritzOverlay onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByTestId('controls')).toBeInTheDocument();
      });
    });

    it('should display ProgressBar component', async () => {
      render(<SpritzOverlay onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
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
