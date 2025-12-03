/**
 * ModeSelectorコンポーネントのテスト
 * TDD RED: まずテストを作成し、失敗することを確認する
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ModeSelector } from '../../../src/content/components/ModeSelector';
import { ReadingMode } from '../../../src/shared/types';

describe('ModeSelector', () => {
  const mockOnModeChange = jest.fn();

  beforeEach(() => {
    mockOnModeChange.mockClear();
  });

  describe('rendering', () => {
    it('should render all three mode options', () => {
      render(
        <ModeSelector
          currentMode="original"
          onModeChange={mockOnModeChange}
          isProcessing={false}
          hasApiKey={true}
        />
      );

      expect(screen.getByLabelText(/元のテキスト/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/本文抽出/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/要約/i)).toBeInTheDocument();
    });

    it('should render with test-id for container', () => {
      render(
        <ModeSelector
          currentMode="original"
          onModeChange={mockOnModeChange}
          isProcessing={false}
          hasApiKey={true}
        />
      );

      expect(screen.getByTestId('mode-selector')).toBeInTheDocument();
    });
  });

  describe('mode selection', () => {
    it('should select original mode by default', () => {
      render(
        <ModeSelector
          currentMode="original"
          onModeChange={mockOnModeChange}
          isProcessing={false}
          hasApiKey={true}
        />
      );

      const originalRadio = screen.getByLabelText(/元のテキスト/i) as HTMLInputElement;
      expect(originalRadio.checked).toBe(true);
    });

    it('should select extracted mode when currentMode is extracted', () => {
      render(
        <ModeSelector
          currentMode="extracted"
          onModeChange={mockOnModeChange}
          isProcessing={false}
          hasApiKey={true}
        />
      );

      const extractedRadio = screen.getByLabelText(/本文抽出/i) as HTMLInputElement;
      expect(extractedRadio.checked).toBe(true);
    });

    it('should select summary mode when currentMode is summary', () => {
      render(
        <ModeSelector
          currentMode="summary"
          onModeChange={mockOnModeChange}
          isProcessing={false}
          hasApiKey={true}
        />
      );

      const summaryRadio = screen.getByLabelText(/要約/i) as HTMLInputElement;
      expect(summaryRadio.checked).toBe(true);
    });
  });

  describe('mode change interaction', () => {
    it('should call onModeChange with extracted when extracted mode is selected', () => {
      render(
        <ModeSelector
          currentMode="original"
          onModeChange={mockOnModeChange}
          isProcessing={false}
          hasApiKey={true}
        />
      );

      const extractedRadio = screen.getByLabelText(/本文抽出/i);
      fireEvent.click(extractedRadio);

      expect(mockOnModeChange).toHaveBeenCalledTimes(1);
      expect(mockOnModeChange).toHaveBeenCalledWith('extracted');
    });

    it('should call onModeChange with summary when summary mode is selected', () => {
      render(
        <ModeSelector
          currentMode="original"
          onModeChange={mockOnModeChange}
          isProcessing={false}
          hasApiKey={true}
        />
      );

      const summaryRadio = screen.getByLabelText(/要約/i);
      fireEvent.click(summaryRadio);

      expect(mockOnModeChange).toHaveBeenCalledTimes(1);
      expect(mockOnModeChange).toHaveBeenCalledWith('summary');
    });

    it('should call onModeChange with original when original mode is selected', () => {
      render(
        <ModeSelector
          currentMode="extracted"
          onModeChange={mockOnModeChange}
          isProcessing={false}
          hasApiKey={true}
        />
      );

      const originalRadio = screen.getByLabelText(/元のテキスト/i);
      fireEvent.click(originalRadio);

      expect(mockOnModeChange).toHaveBeenCalledTimes(1);
      expect(mockOnModeChange).toHaveBeenCalledWith('original');
    });
  });

  describe('API key validation', () => {
    it('should disable extracted and summary modes when hasApiKey is false', () => {
      render(
        <ModeSelector
          currentMode="original"
          onModeChange={mockOnModeChange}
          isProcessing={false}
          hasApiKey={false}
        />
      );

      const originalRadio = screen.getByLabelText(/元のテキスト/i) as HTMLInputElement;
      const extractedRadio = screen.getByLabelText(/本文抽出/i) as HTMLInputElement;
      const summaryRadio = screen.getByLabelText(/要約/i) as HTMLInputElement;

      expect(originalRadio.disabled).toBe(false);
      expect(extractedRadio.disabled).toBe(true);
      expect(summaryRadio.disabled).toBe(true);
    });

    it('should enable all modes when hasApiKey is true', () => {
      render(
        <ModeSelector
          currentMode="original"
          onModeChange={mockOnModeChange}
          isProcessing={false}
          hasApiKey={true}
        />
      );

      const originalRadio = screen.getByLabelText(/元のテキスト/i) as HTMLInputElement;
      const extractedRadio = screen.getByLabelText(/本文抽出/i) as HTMLInputElement;
      const summaryRadio = screen.getByLabelText(/要約/i) as HTMLInputElement;

      expect(originalRadio.disabled).toBe(false);
      expect(extractedRadio.disabled).toBe(false);
      expect(summaryRadio.disabled).toBe(false);
    });

    it('should show tooltip hint when API key is not set', () => {
      render(
        <ModeSelector
          currentMode="original"
          onModeChange={mockOnModeChange}
          isProcessing={false}
          hasApiKey={false}
        />
      );

      expect(screen.getByText(/APIキーが設定されていません/i)).toBeInTheDocument();
    });
  });

  describe('processing state', () => {
    it('should disable all modes when isProcessing is true', () => {
      render(
        <ModeSelector
          currentMode="original"
          onModeChange={mockOnModeChange}
          isProcessing={true}
          hasApiKey={true}
        />
      );

      const originalRadio = screen.getByLabelText(/元のテキスト/i) as HTMLInputElement;
      const extractedRadio = screen.getByLabelText(/本文抽出/i) as HTMLInputElement;
      const summaryRadio = screen.getByLabelText(/要約/i) as HTMLInputElement;

      expect(originalRadio.disabled).toBe(true);
      expect(extractedRadio.disabled).toBe(true);
      expect(summaryRadio.disabled).toBe(true);
    });

    it('should not disable modes when isProcessing is false', () => {
      render(
        <ModeSelector
          currentMode="original"
          onModeChange={mockOnModeChange}
          isProcessing={false}
          hasApiKey={true}
        />
      );

      const originalRadio = screen.getByLabelText(/元のテキスト/i) as HTMLInputElement;
      const extractedRadio = screen.getByLabelText(/本文抽出/i) as HTMLInputElement;
      const summaryRadio = screen.getByLabelText(/要約/i) as HTMLInputElement;

      expect(originalRadio.disabled).toBe(false);
      expect(extractedRadio.disabled).toBe(false);
      expect(summaryRadio.disabled).toBe(false);
    });
  });
});
